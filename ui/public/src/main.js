// @ts-check
/* globals document mdc */
import 'regenerator-runtime/runtime';
import dappConstants from '../lib/constants';
import { connect } from './connect';

const {
  INVITE_BRAND_BOARD_ID,
  INSTANCE_BOARD_ID,
  INSTALLATION_BOARD_ID,
  issuerBoardIds: { Card: CARD_ISSUER_BOARD_ID },
  brandBoardIds: { Money: MONEY_BRAND_BOARD_ID, Card: CARD_BRAND_BOARD_ID },
} = dappConstants;

export default async function main() {
  let zoeInvitationDepositFacetId;
  let tokenPursePetname;
  let cardPursePetname;
  let cardsMade = false;

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

  const $cardsDisplay = document.getElementById('cards-display');
  const $cardTemplate = document.getElementById('baseball-card-template');

  const makeCard = (playerName) => {
    const $card = $cardTemplate.content.firstElementChild.cloneNode(true);
    $card.setAttribute('id', playerName);
    const $title = $card.querySelector('.mdc-card__title');
    const $media = $card.querySelector('.mdc-card__media');
    $media.style.backgroundImage = `url("/cards/${playerName}.jpg")`;
    $title.textContent = playerName;
    $cardsDisplay.appendChild($card);
    $card.addEventListener('click', () => {
      // eslint-disable-next-line no-use-before-define
      sendOffer(playerName);
    });
  };

  const makeCards = (playerNames) => {
    playerNames.forEach((name) => makeCard(name));
  };

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
          // Does the purse's brand match our money brand?
          ({ brandBoardId }) => brandBoardId === MONEY_BRAND_BOARD_ID,
        );
        if (tokenPurse && tokenPurse.pursePetname) {
          // If we got a petname for that purse, use it in the offers we create.
          tokenPursePetname = tokenPurse.pursePetname;
        }
        const cardPurse = purses.find(
          // Does the purse's brand match our card brand?
          ({ brandBoardId }) => brandBoardId === CARD_BRAND_BOARD_ID,
        );
        if (cardPurse && cardPurse.pursePetname) {
          // If we got a petname for that purse, use it in the offers we create.
          cardPursePetname = cardPurse.pursePetname;
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
        // eslint-disable-next-line no-use-before-define
        apiSend({
          type: 'cardStore/getAvailableItems',
        });
        break;
      }
      default: {
        throw Error(`unexpected walletRecv obj.type ${obj.type}`);
      }
    }
  };

  const updateCards = ($cards, cardsAvailable) => {
    // disable all cards and reenable if on the list.
    $cards.forEach((card) => card.classList.add('hide'));
    cardsAvailable.forEach((cardStr) => {
      const $card = document.getElementById(cardStr);
      if ($card) {
        $card.classList.remove('hide');
      }
    });
  };

  /**
   * @param {{ type: string; data: any; }} obj
   */
  const apiRecv = (obj) => {
    switch (obj.type) {
      case 'cardStore/sendInvitationResponse': {
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
      case 'cardStore/getAvailableItemsResponse': {
        const cardsAvailable = obj.data;
        if (!cardsMade) {
          makeCards(cardsAvailable);
          cardsMade = true;
        }
        updateCards(
          document.querySelectorAll('.baseball-card'),
          cardsAvailable,
        );
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

  // All the "suggest" messages below are backward-compatible:
  // the new wallet will confirm them with the user, but the old
  // wallet will just ignore the messages and allow access immediately.
  const walletSend = await connect(
    'wallet',
    walletRecv,
    '?suggestedDappPetname=CardStore',
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
      petname: 'Card',
      boardId: CARD_ISSUER_BOARD_ID,
    });
    return walletSend;
  });

  const sendOffer = (playerName = 'name') => {
    const offer = {
      // JSONable ID for this offer.  This is scoped to the origin.
      id: Date.now(),

      proposalTemplate: {
        want: {
          Items: {
            pursePetname: cardPursePetname,
            value: [playerName],
          },
        },
        give: {
          Money: {
            pursePetname: tokenPursePetname,
            value: 10,
          },
        },
      },

      // Tell the wallet that we're handling the offer result.
      dappContext: true,
    };
    // eslint-disable-next-line no-use-before-define
    apiSend({
      type: 'cardStore/sendInvitation',
      data: {
        depositFacetId: zoeInvitationDepositFacetId,
        offer,
      },
    });
  };

  // eslint-disable-next-line no-shadow
  const apiSend = await connect('/api/card-store', apiRecv).then((apiSend) => {
    apiSend({
      type: 'cardStore/getAvailableItems',
    });

    return apiSend;
  });
}

main();
