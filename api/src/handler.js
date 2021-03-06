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
          case 'cardStore/sendInvitation': {
            const { depositFacetId, offer } = obj.data;
            const depositFacet = E(board).getValue(depositFacetId);
            const invitation = await E(creatorFacet).makeBuyerInvitation();
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
              type: 'cardStore/sendInvitationResponse',
              data: { offer: updatedOffer },
            });
            return true;
          }
          case 'cardStore/getAvailableItems': {
            const itemsAmounts = await E(creatorFacet).getAvailableItems();
            console.log(itemsAmounts);
            send({
              type: 'cardStore/getAvailableItemsResponse',
              data: itemsAmounts.value,
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
