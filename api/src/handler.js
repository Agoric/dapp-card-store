// @ts-check
import { E } from '@agoric/eventual-send';
import { makeWebSocketHandler } from './lib-http';

const spawnHandler = (
  { creatorFacet, board, http, invitationIssuer },
  _invitationMaker,
) =>
  makeWebSocketHandler(http, (send, _meta) =>
    harden({
      async onMessage(obj) {
        switch (obj.type) {
          case 'fungibleFaucet/sendInvitation': {
            const { depositFacetId, offer } = obj.data;
            const depositFacet = E(board).getValue(depositFacetId);
            const invitation = await E(creatorFacet).makeInvitation();
            const invitationAmount = await E(invitationIssuer).getAmountOf(
              invitation,
            );
            const {
              value: [{ handle }],
            } = invitationAmount;
            const invitationHandleBoardId = await E(board).getId(handle);
            const updatedOffer = { ...offer, invitationHandleBoardId };
            // We need to wait for the invitation to be
            // received, or we will possibly win the race of
            // proposing the offer before the invitation is ready.
            // TODO: We should make this process more robust.
            await E(depositFacet).receive(invitation);

            send({
              type: 'fungibleFaucet/sendInvitationResponse',
              data: { offer: updatedOffer },
            });
            return true;
          }

          default:
            return undefined;
        }
      },
    }),
  );

export default harden(spawnHandler);
