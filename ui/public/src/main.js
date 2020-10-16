// @ts-check
/* globals document mdc */
import 'regenerator-runtime/runtime';
import dappConstants from '../lib/constants';
import { connect } from './connect';

const {
  INVITE_BRAND_BOARD_ID,
  INSTANCE_BOARD_ID,
  INSTALLATION_BOARD_ID,
  issuerBoardIds: { Token: TOKEN_ISSUER_BOARD_ID },
  brandBoardIds: { Token: TOKEN_BRAND_BOARD_ID },
} = dappConstants;

export default async function main() {
  let zoeInvitationDepositFacetId;
  let tokenPursePetname = ['FungibleFaucet', 'Token'];

  const approveOfferSB = mdc.snackbar.MDCSnackbar.attachTo(
    document.querySelector('#approve-offer'),
  );

  // The snackbar to approve the offer will be closed by code not timeout.
  approveOfferSB.timeoutMs = -1;

  const gotPaymentSB = mdc.snackbar.MDCSnackbar.attachTo(
    document.querySelector('#got-payment'),
  );

  const approveDappDialog = mdc.dialog.MDCDialog.attachTo(
    document.querySelector('#open-wallet'),
  );

  // eslint-disable-next-line no-unused-vars
  const debugSwitch = new mdc.switchControl.MDCSwitch(
    document.querySelector('.mdc-switch'),
  );

  /**
   * @param {{ type: string; data: any; walletURL: string }} obj
   */
  const walletRecv = (obj) => {
    switch (obj.type) {
      case 'walletDepositFacetIdResponse': {
        zoeInvitationDepositFacetId = obj.data;
        break;
      }
      case 'walletNeedDappApproval': {
        approveDappDialog.open();
        break;
      }
      case 'walletURL': {
        // TODO: handle appropriately
        break;
      }
      case 'walletUpdatePurses': {
        // We find the first purse that can accept our token.
        const purses = JSON.parse(obj.data);
        const tokenPurse = purses.find(
          // Does the purse's brand match our token brand?
          ({ brandBoardId }) => brandBoardId === TOKEN_BRAND_BOARD_ID,
        );
        if (tokenPurse && tokenPurse.pursePetname) {
          // If we got a petname for that purse, use it in the offers we create.
          tokenPursePetname = tokenPurse.pursePetname;
        }
        break;
      }
      case 'walletSuggestIssuerResponse': {
        // TODO: handle appropriately
        break;
      }
      case 'walletSuggestInstallationResponse': {
        // TODO: handle appropriately
        break;
      }
      case 'walletSuggestInstanceResponse': {
        // TODO: handle appropriately
        break;
      }
      case 'walletOfferAdded': {
        approveOfferSB.open();
        break;
      }
      case 'walletOfferHandled': {
        approveOfferSB.close();
        break;
      }
      case 'walletOfferResult': {
        gotPaymentSB.open();
        break;
      }
      default: {
        throw Error(`unexpected walletRecv obj.type ${obj.type}`);
      }
    }
  };

  /**
   * @param {{ type: string; data: any; }} obj
   */
  const apiRecv = (obj) => {
    switch (obj.type) {
      case 'fungibleFaucet/sendInvitationResponse': {
        // Once the invitation has been sent to the user, we update the
        // offer to include the invitationBoardId. Then we make a
        // request to the user's wallet to send the proposed offer for
        // acceptance/rejection.
        const { offer } = obj.data;
        // eslint-disable-next-line no-use-before-define
        walletSend({
          type: 'walletAddOffer',
          data: offer,
        });
        break;
      }
      case 'CTP_DISCONNECT': {
        // TODO: handle this appropriately
        break;
      }
      default: {
        throw Error(`unexpected apiRecv obj.type ${obj.type}`);
      }
    }
  };

  const $mintFungible = /** @type {HTMLInputElement} */ (document.getElementById(
    'mintFungible',
  ));

  // All the "suggest" messages below are backward-compatible:
  // the new wallet will confirm them with the user, but the old
  // wallet will just ignore the messages and allow access immediately.
  const walletSend = await connect(
    'wallet',
    walletRecv,
    '?suggestedDappPetname=FungibleFaucet',
    // eslint-disable-next-line no-shadow
  ).then((walletSend) => {
    walletSend({ type: 'walletGetPurses' });
    walletSend({
      type: 'walletGetDepositFacetId',
      brandBoardId: INVITE_BRAND_BOARD_ID,
    });
    walletSend({
      type: 'walletSuggestInstallation',
      petname: 'Installation',
      boardId: INSTALLATION_BOARD_ID,
    });
    walletSend({
      type: 'walletSuggestInstance',
      petname: 'Instance',
      boardId: INSTANCE_BOARD_ID,
    });
    walletSend({
      type: 'walletSuggestIssuer',
      petname: 'Token',
      boardId: TOKEN_ISSUER_BOARD_ID,
    });
    return walletSend;
  });

  await connect('/api/fungible-faucet', apiRecv).then((apiSend) => {
    $mintFungible.removeAttribute('disabled');
    $mintFungible.addEventListener('click', () => {
      const offer = {
        // JSONable ID for this offer.  This is scoped to the origin.
        id: Date.now(),

        proposalTemplate: {
          want: {
            Token: {
              pursePetname: tokenPursePetname,
              value: 1000,
            },
          },
        },

        // Tell the wallet that we're handling the offer result.
        dappContext: true,
      };
      apiSend({
        type: 'fungibleFaucet/sendInvitation',
        data: {
          depositFacetId: zoeInvitationDepositFacetId,
          offer,
        },
      });
    });

    return apiSend;
  });
}

main();
