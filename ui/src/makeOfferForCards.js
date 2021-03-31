import { E } from '@agoric/eventual-send';
import { assert, details } from '@agoric/assert';

import dappConstants from './lib/constants';

const { INSTANCE_BOARD_ID } = dappConstants;

export const makeOfferForCards = async ({
  walletP,
  cards,
  cardPurse,
  tokenPurse,
  pricePerCard,
}) => {
  assert(
    cards && cards.length > 0,
    details`At least one card must be chosen to purchase`,
  );
  const zoe = E(walletP).getZoe();
  const board = E(walletP).getBoard();
  const instance = await E(board).getValue(INSTANCE_BOARD_ID);
  const publicFacet = E(zoe).getPublicFacet(instance);
  const invitation = E(publicFacet).makeBuyerInvitation();

  const cost = BigInt(cards.length) * pricePerCard;

  const offerConfig = {
    // JSONable ID for this offer.  This is scoped to the origin.
    id: Date.now(),
    invitation,
    proposalTemplate: {
      want: {
        Items: {
          pursePetname: cardPurse.petname,
          value: cards,
        },
      },
      give: {
        Money: {
          pursePetname: tokenPurse.petname,
          value: cost,
        },
      },
    },
  };

  E(walletP).addOffer(offerConfig);
};
