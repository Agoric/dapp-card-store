import { E } from '@agoric/eventual-send';
import { assert, details as X } from '@agoric/assert';

const getCardAuctionDetail = async ({ publicFacet, card }) => {
  return E(publicFacet).getSessionDetailsForKey(card);
};

const makeBidOfferForCard = async ({
  walletP,
  card,
  publicFacet,
  cardPurse,
  tokenPurse,
  price,
}) => {
  assert(card, X`At least one card must be chosen to purchase`);
  const invitation = await E(publicFacet).makeBidInvitationForKey(card);

  const cardAmount = {
    pursePetname: cardPurse.pursePetname,
    value: harden([card]),
  };
  const moneyAmount = {
    pursePetname: tokenPurse.pursePetname,
    value: price,
  };

  const offerConfig = {
    // JSONable ID for this offer.  This is scoped to the origin.
    id: Date.now(),
    invitation,
    proposalTemplate: {
      want: {
        Asset: cardAmount,
      },
      give: {
        Bid: moneyAmount,
      },
    },
  };

  return E(walletP).addOffer(offerConfig);
};

export { makeBidOfferForCard, getCardAuctionDetail };
