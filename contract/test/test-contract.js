/* global __dirname require */

// @ts-check
import { test } from '@agoric/zoe/tools/prepare-test-env-ava';

import bundleSource from '@agoric/bundle-source';

import { E } from '@agoric/eventual-send';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin';
import { makeZoe } from '@agoric/zoe';
import { makeIssuerKit, amountMath } from '@agoric/ertp';

const contractPath = `${__dirname}/../src/contract`;

test('zoe - sell baseball cards', async (t) => {
  const zoe = makeZoe(makeFakeVatAdmin().admin);

  // pack the contract
  const bundle = await bundleSource(contractPath);

  // install the contract
  const installation = await E(zoe).install(bundle);

  // We'll use an imaginary currency "moola" as the money that we
  // require to buy baseball cards
  const {
    mint: moolaMint,
    issuer: moolaIssuer,
    brand: moolaBrand,
  } = makeIssuerKit('moola');

  // We will also install the sellItems contract from agoric-sdk
  const sellItemsBundle = await bundleSource(
    require.resolve('@agoric/zoe/src/contracts/sellItems'),
  );
  const sellItemsInstallation = await E(zoe).install(sellItemsBundle);

  const { creatorFacet: baseballCardSellerFacet } = await E(zoe).startInstance(
    installation,
  );

  const allCardNames = harden(['Alice', 'Bob']);
  const moneyIssuer = moolaIssuer;
  const pricePerCard = amountMath.make(10, moolaBrand);

  const {
    sellItemsCreatorSeat,
    sellItemsCreatorFacet,
    sellItemsPublicFacet,
    sellItemsInstance,
  } = await E(baseballCardSellerFacet).sellCards(
    allCardNames,
    moneyIssuer,
    sellItemsInstallation,
    pricePerCard,
  );

  const bobInvitation = E(sellItemsCreatorFacet).makeBuyerInvitation();

  // Bob buys his own baseball card

  const cardIssuer = await E(sellItemsPublicFacet).getItemsIssuer();
  const cardBrand = await cardIssuer.getBrand();
  const makeCardMath = (value) => amountMath.make(value, cardBrand);

  const cardsForSale = await E(sellItemsPublicFacet).getAvailableItems();
  t.deepEqual(cardsForSale, makeCardMath(['Alice', 'Bob']));

  const terms = await E(zoe).getTerms(sellItemsInstance);

  // make the corresponding amount
  const bobCardAmount = makeCardMath(['Bob']);

  const bobProposal = harden({
    give: { Money: terms.pricePerItem },
    want: { Items: bobCardAmount },
  });

  const bobPaymentKeywordRecord = harden({
    Money: moolaMint.mintPayment(amountMath.make(10, moolaBrand)),
  });

  const seat = await E(zoe).offer(
    bobInvitation,
    bobProposal,
    bobPaymentKeywordRecord,
  );
  const bobCardPayout = seat.getPayout('Items');
  const bobObtained = await E(cardIssuer).getAmountOf(bobCardPayout);

  t.deepEqual(
    bobObtained,
    makeCardMath(['Bob']),
    'Bob bought his own baseball card!',
  );

  // That's enough selling for now, let's take our inventory back

  E(sellItemsCreatorSeat).tryExit();

  const moneyPayment = await E(sellItemsCreatorSeat).getPayout('Money');
  const moneyEarned = await E(moolaIssuer).getAmountOf(moneyPayment);
  t.deepEqual(moneyEarned, amountMath.make(10, moolaBrand));

  const cardInventory = await E(sellItemsCreatorSeat).getPayout('Items');
  const inventoryRemaining = await E(cardIssuer).getAmountOf(cardInventory);
  t.deepEqual(inventoryRemaining, makeCardMath(['Alice']));
});
