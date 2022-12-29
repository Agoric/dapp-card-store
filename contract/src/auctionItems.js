// @ts-check

import { assert, details as X } from '@agoric/assert';
import { Far } from '@endo/marshal';
import { E } from '@endo/eventual-send';
import { AmountMath } from '@agoric/ertp';
import { makeNotifierKit } from '@agoric/notifier';
import {
  assertIssuerKeywords,
  defaultAcceptanceMsg,
  assertNatAssetKind,
  offerTo,
} from '@agoric/zoe/src/contractSupport/index.js';

import '@agoric/zoe/exported.js';

/**
 * Auction a list of NFT items which identified by `string`, with timeAuthority, minBidPerItem,
 * needs {Money, Items}
 * Allow you to `withdraw` anytime.
 *
 * @typedef {{
 *  instance: Instance,
 *  makeBidInvitation: Function,
 *  getSessionDetails: Function,
 *  completedP: Promise,
 *  sellerSeatP: Promise<UserSeat>
 * }} AuctionSession
 *
 * @type {ContractStartFn}
 */
const start = (zcf) => {
  const {
    minimalBid,
    issuers,
    brands,
    timeAuthority,
    winnerPriceOption,
    bidDuration = 300n, // 5 mins in chain timer 1s resolution
    auctionInstallation,
  } = zcf.getTerms();
  assertIssuerKeywords(zcf, harden(['Items', 'Money']));

  const moneyBrand = brands.Money;
  const itemBrand = brands.Items;

  assertNatAssetKind(zcf, moneyBrand);

  /** @type Record<string, AuctionSession> */
  const sellerSessions = {};
  let availableItems = AmountMath.make(itemBrand, harden([]));
  const zoeService = zcf.getZoeService();

  const { zcfSeat: sellerSeat } = zcf.makeEmptySeatKit();

  const {
    notifier: availableItemsNotifier,
    updater: availableItemsUpdater,
  } = makeNotifierKit();

  const sell = (seat) => {
    sellerSeat.incrementBy(seat.decrementBy(seat.getCurrentAllocation()));
    zcf.reallocate(sellerSeat, seat);
    seat.exit();

    // update current amount
    const addedAmount = sellerSeat.getAmountAllocated('Items', itemBrand);

    // XXX the sell method can be call multiple times,
    // so available items should be added to, not updated
    availableItems = AmountMath.add(availableItems, addedAmount);
    availableItemsUpdater.updateState(availableItems);
    return defaultAcceptanceMsg;
  };

  // The seller can selectively withdraw any items and/or any amount of money by specifying amounts in their
  // `want`. If no `want` is specified, then all of the `sellerSeat`'s allocation is withdrawn.
  const withdraw = (seat) => {
    const { want } = seat.getProposal();
    const amount =
      want && (want.Items || want.Money)
        ? want
        : sellerSeat.getCurrentAllocation();
    seat.incrementBy(sellerSeat.decrementBy(harden(amount)));
    zcf.reallocate(sellerSeat, seat);
    seat.exit();

    return 'Withdraw success';
  };

  const getAvailableItems = () => {
    // XXX we can not get the allocated amount, because it may ignore the auctioning items
    assert(sellerSeat && !sellerSeat.hasExited(), X`no items are for sale`);
    return availableItems;
  };

  const getAvailableItemsNotifier = () => availableItemsNotifier;

  const startAuctioningItem = async (itemKey) => {
    const itemAmount = AmountMath.make(itemBrand, harden([itemKey]));
    const availableAmount = sellerSeat.getAmountAllocated('Items', itemBrand);

    assert(
      AmountMath.isGTE(availableAmount, itemAmount),
      X`Item ${itemKey} is no longer available`,
    );

    const issuerKeywordRecord = harden({
      Asset: issuers.Items,
      Ask: issuers.Money,
    });

    const terms = harden({
      winnerPriceOption,
      timeAuthority,
      bidDuration,
    });

    const { creatorInvitation, instance } = await E(zoeService).startInstance(
      auctionInstallation,
      issuerKeywordRecord,
      terms,
    );

    const shouldBeInvitationMsg = `The auctionContract instance should return a creatorInvitation`;
    assert(creatorInvitation, shouldBeInvitationMsg);

    const proposal = harden({
      give: { Asset: itemAmount },
      want: { Ask: minimalBid },
      exit: { waived: null },
    });

    const { userSeatPromise: sellerSeatP, deposited } = await offerTo(
      zcf,
      creatorInvitation,
      harden({
        Items: 'Asset',
        Money: 'Ask',
      }),
      proposal,
      sellerSeat,
      sellerSeat,
    );

    const completedP = deposited.then(async () => {
      // get after match allocation
      const sellerAllocation = await E(sellerSeatP).getCurrentAllocation();

      // check Asset amount after the auction session
      const isAssetItemSold = AmountMath.isEmpty(sellerAllocation.Asset);
      if (isAssetItemSold) {
        // item was sold, update available items by substracting sold amount
        // XXX we can not get the allocated amount, because it is prone to
        // race-condition when multiple auctions are completed consecutively
        availableItems = AmountMath.subtract(availableItems, itemAmount);
        availableItemsUpdater.updateState(availableItems);
      }

      // unset the session, this handles the case auction session was failed
      // then item should be available for a new session
      delete sellerSessions[itemKey];
    });

    const auctionObj = await E(sellerSeatP).getOfferResult();

    return {
      sellerSeatP,
      instance,
      completedP,
      makeBidInvitation: () => E(auctionObj).makeBidInvitation(),
      getSessionDetails: () => E(auctionObj).getSessionDetails(),
    };
  };

  const getOrCreateAuctionSession = async (itemKey) => {
    assert.typeof(itemKey, 'string');

    if (!sellerSessions[itemKey]) {
      sellerSessions[itemKey] = await startAuctioningItem(itemKey);
    }

    return sellerSessions[itemKey];
  };

  const makeBidInvitationForKey = async (itemKey) => {
    const session = await getOrCreateAuctionSession(itemKey);
    return session.makeBidInvitation();
  };

  const getSessionDetailsForKey = async (itemKey) => {
    assert.typeof(itemKey, 'string');
    const session = sellerSessions[itemKey];

    if (!session) {
      // session is not started, try to return general data,
      // The trade-off here is we have to fake the session data,
      // and it there may be mismatch between our version and the inner one
      const itemAmount = AmountMath.make(itemBrand, harden([itemKey]));

      return harden({
        auctionedAssets: itemAmount,
        minimumBid: minimalBid,
        winnerPriceOption,
        closesAfter: null,
        bidDuration,
        timeAuthority,
        bids: [],
      });
    }

    return session.getSessionDetails();
  };

  const getCompletedPromiseForKey = (itemKey) => {
    const session = sellerSessions[itemKey];
    return session && session.completedP;
  };

  const makeWithdrawInvitation = async () => {
    return zcf.makeInvitation(withdraw, 'withdraw');
  };

  const publicFacet = Far('AuctionItemsPublicFacet', {
    getAvailableItems,
    getAvailableItemsNotifier,
    getItemsIssuer: () => issuers.Items,
    makeBidInvitationForKey,
    getCompletedPromiseForKey,
    getSessionDetailsForKey,
  });

  const creatorFacet = Far('AuctionItemsCreatorFacet', {
    makeBidInvitationForKey,
    getAvailableItems: publicFacet.getAvailableItems,
    getItemsIssuer: publicFacet.getItemsIssuer,
    makeWithdrawInvitation,
    getCompletedPromiseForKey,
    getSessionDetailsForKey,
  });

  const creatorInvitation = zcf.makeInvitation(sell, 'seller');

  return harden({ creatorFacet, creatorInvitation, publicFacet });
};

harden(start);
export { start };
