// @ts-check
import '@agoric/zoe/exported';

/**
 * This is a very simple contract that creates a new issuer and mints payments
 * from it, in order to give an example of how that can be done.  This contract
 * sends new tokens to anyone who has an invitation.
 *
 * The expectation is that most contracts that want to do something similar
 * would use the ability to mint new payments internally rather than sharing
 * that ability widely as this one does.
 *
 * To pay others in tokens, the creator of the instance can make
 * invitations for them, which when used to make an offer, will payout
 * the specified amount of tokens.
 *
 * @type {ContractStartFn}
 */
const start = async (zcf) => {
  // Create the internal token mint for a fungible digital asset. Note
  // that 'Tokens' is both the keyword and the allegedName.
  const zcfMint = await zcf.makeZCFMint('Tokens');
  // AWAIT

  // Now that ZCF has saved the issuer, brand, and local amountMath, they
  // can be accessed synchronously.
  const { amountMath, issuer } = zcfMint.getIssuerRecord();

  const mintPayment = (seat) => {
    const amount = amountMath.make(1000);
    // Synchronously mint and allocate amount to seat.
    zcfMint.mintGains({ Token: amount }, seat);
    // Exit the seat so that the user gets a payout.
    seat.exit();
    // Since the user is getting the payout through Zoe, we can
    // return anything here. Let's return some helpful instructions.
    return 'Offer completed. You should receive a payment from Zoe';
  };

  const creatorFacet = {
    // The creator of the instance can send invitations to anyone
    // they wish to.
    makeInvitation: () => zcf.makeInvitation(mintPayment, 'mint a payment'),
    getTokenIssuer: () => issuer,
  };

  const publicFacet = {
    // Make the token issuer public. Note that only the mint can
    // make new digital assets. The issuer is ok to make public.
    getTokenIssuer: () => issuer,
  };

  // Return the creatorFacet to the creator, so they can make
  // invitations for others to get payments of tokens. Publish the
  // publicFacet.
  return harden({ creatorFacet, publicFacet });
};

harden(start);
export { start };
