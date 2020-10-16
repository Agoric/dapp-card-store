// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
import '@agoric/install-ses';
// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';

import bundleSource from '@agoric/bundle-source';

import { E } from '@agoric/eventual-send';
import { makeFakeVatAdmin } from '@agoric/zoe/test/unitTests/contracts/fakeVatAdmin';
import { makeZoe } from '@agoric/zoe';
import { makeLocalAmountMath } from '@agoric/ertp';

const contractPath = `${__dirname}/../src/contract`;

test('zoe - mint payments', async (t) => {
  const zoe = makeZoe(makeFakeVatAdmin().admin);

  // pack the contract
  const bundle = await bundleSource(contractPath);

  // install the contract
  const installation = await E(zoe).install(bundle);

  const { creatorFacet, instance } = await E(zoe).startInstance(installation);

  // Alice makes an invitation for Bob that will give him 1000 tokens
  const invitation = E(creatorFacet).makeInvitation();

  // Bob makes an offer using the invitation
  const seat = await E(zoe).offer(invitation);

  const paymentP = E(seat).getPayout('Token');

  // Let's get the tokenIssuer from the contract so we can evaluate
  // what we get as our payout
  const publicFacet = await E(zoe).getPublicFacet(instance);
  const tokenIssuer = await E(publicFacet).getTokenIssuer();
  const amountMath = await makeLocalAmountMath(tokenIssuer);

  const tokens1000 = await E(amountMath).make(1000);
  const tokenPayoutAmount = await E(tokenIssuer).getAmountOf(paymentP);

  // Bob got 1000 tokens
  t.deepEqual(tokenPayoutAmount, tokens1000);
});
