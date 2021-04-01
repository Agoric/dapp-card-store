import { E } from '@agoric/eventual-send';
import { assert, details } from '@agoric/assert';

export const makeOfferForCards = async ({
  walletP,
  publicFacet,
  cards,
  cardPurse,
  tokenPurse,
  pricePerCard,
}) => {
  assert(
    cards && cards.length > 0,
    details`At least one card must be chosen to purchase`,
  );
  const invitation = E(publicFacet).makeBuyerInvitation();

  const cost = BigInt(cards.length) * pricePerCard;

  const offerConfig = {
    // JSONable ID for this offer.  This is scoped to the origin.
    id: Date.now(),
    invitation,
    proposalTemplate: {
      want: {
        Items: {
          pursePetname: cardPurse.pursePetname,
          value: cards,
        },
      },
      give: {
        Money: {
          pursePetname: tokenPurse.pursePetname,
          value: cost,
        },
      },
    },
  };

  return E(walletP).addOffer(offerConfig);
};
