// @ts-check
import '@agoric/zoe/exported';

import { makeIssuerKit, AssetKind, amountMath } from '@agoric/ertp';
import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';

/**
 * This contract mints non-fungible tokens (baseball cards) and creates a contract
 * instance to sell the cards in exchange for some sort of money.
 *
 * @type {ContractStartFn}
 */
const start = (zcf) => {
  // Create the internal baseball card mint
  const { issuer, mint, brand } = makeIssuerKit(
    'baseball cards',
    AssetKind.SET,
  );

  const zoeService = zcf.getZoeService();

  const sellCards = async (
    newCardNames,
    moneyIssuer,
    sellItemsInstallation,
    pricePerCard,
  ) => {
    const newCardsForSaleAmount = amountMath.make(newCardNames, brand);
    const allCardsForSalePayment = mint.mintPayment(newCardsForSaleAmount);
    // Note that the proposal `want` is empty because we don't know
    // how many cards will be sold, so we don't know how much money we
    // will make in total.
    // https://github.com/Agoric/agoric-sdk/issues/855
    const proposal = harden({
      give: { Items: newCardsForSaleAmount },
    });
    const paymentKeywordRecord = harden({ Items: allCardsForSalePayment });

    const issuerKeywordRecord = harden({
      Items: issuer,
      Money: moneyIssuer,
    });

    const sellItemsTerms = harden({
      pricePerItem: pricePerCard,
    });
    const { creatorInvitation, creatorFacet, instance, publicFacet } = await E(
      zoeService,
    ).startInstance(sellItemsInstallation, issuerKeywordRecord, sellItemsTerms);
    const sellItemsCreatorSeat = await E(zoeService).offer(
      creatorInvitation,
      proposal,
      paymentKeywordRecord,
    );
    return harden({
      sellItemsCreatorSeat,
      sellItemsCreatorFacet: creatorFacet,
      sellItemsInstance: instance,
      sellItemsPublicFacet: publicFacet,
    });
  };

  const creatorFacet = Far('Card store creator', {
    sellCards,
    getIssuer: () => issuer,
  });

  return harden({ creatorFacet });
};

harden(start);
export { start };
