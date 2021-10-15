import React, { useState, useEffect, useRef } from 'react';
import { makeCapTP, E } from '@agoric/captp';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';
import { Far } from '@agoric/marshal'; // eslint-disable-line import/no-extraneous-dependencies

import {
  activateWebSocket,
  deactivateWebSocket,
  getActiveSocket,
} from './utils/fetch-websocket.js';

import './App.css';

import Header from './components/Header.jsx';
import CardDisplay from './components/CardDisplay.jsx';
import ApproveOfferSnackbar from './components/ApproveOfferSnackbar.jsx';
import BoughtCardSnackbar from './components/BoughtCardSnackbar.jsx';
import EnableAppDialog from './components/EnableAppDialog.jsx';

import { makeOfferForCards } from './makeOfferForCards.js';

import dappConstants from './lib/constants.js';

const {
  INSTANCE_BOARD_ID,
  INSTALLATION_BOARD_ID,
  issuerBoardIds: { Card: CARD_ISSUER_BOARD_ID },
  brandBoardIds: { Money: MONEY_BRAND_BOARD_ID, Card: CARD_BRAND_BOARD_ID },
  pricePerCard,
} = dappConstants;

function App() {
  // 'walletNeedDappApproval' => setApprovalAppDialogOpen(true);
  // 'walletOfferAdded' => setApproveOfferSBOpen(true);
  // 'walletOfferHandled' => setApproveOfferSBOpen(false);
  // 'walletOfferResult' =>  {
  //    setBoughtCardSBOpen(false);
  //     updateAvailableItems()
  // }

  const [walletConnected, setWalletConnected] = useState(false);
  const [dappApproved, setDappApproved] = useState(true);
  const [availableCards, setAvailableCards] = useState([]);
  const [cardPurse, setCardPurse] = useState(null);
  const [tokenPurse, setTokenPurse] = useState(null);
  const [openEnableAppDialog, setOpenEnableAppDialog] = useState(false);
  const [needToApproveOffer, setNeedToApproveOffer] = useState(false);
  const [boughtCard, setBoughtCard] = useState(false);

  const handleDialogClose = () => setOpenEnableAppDialog(false);

  const walletPRef = useRef(undefined);
  const publicFacetRef = useRef(undefined);

  useEffect(() => {
    // Receive callbacks from the wallet connection.
    const otherSide = Far('otherSide', {
      needDappApproval(_dappOrigin, _suggestedDappPetname) {
        setDappApproved(false);
        setOpenEnableAppDialog(true);
      },
      dappApproved(_dappOrigin) {
        setDappApproved(true);
      },
    });

    let walletAbort;
    let walletDispatch;

    const onConnect = async () => {
      setWalletConnected(true);
      const socket = getActiveSocket();
      const {
        abort: ctpAbort,
        dispatch: ctpDispatch,
        getBootstrap,
      } = makeCapTP(
        'Card Store',
        (obj) => socket.send(JSON.stringify(obj)),
        otherSide,
      );
      walletAbort = ctpAbort;
      walletDispatch = ctpDispatch;
      const walletP = getBootstrap();
      walletPRef.current = walletP;

      const processPurses = (purses) => {
        // We find the first purses for each brand for simplicity
        const newTokenPurse = purses.find(
          ({ brandBoardId }) => brandBoardId === MONEY_BRAND_BOARD_ID,
        );
        const newCardPurse = purses.find(
          ({ brandBoardId }) => brandBoardId === CARD_BRAND_BOARD_ID,
        );

        setTokenPurse(newTokenPurse);
        setCardPurse(newCardPurse);
      };

      async function watchPurses() {
        const pn = E(walletP).getPursesNotifier();
        for await (const purses of iterateNotifier(pn)) {
          // dispatch(setPurses(purses));
          processPurses(purses);
        }
      }
      watchPurses().catch((err) => console.error('got watchPurses err', err));

      await Promise.all([
        E(walletP).suggestInstallation('Installation', INSTALLATION_BOARD_ID),
        E(walletP).suggestInstance('Instance', INSTANCE_BOARD_ID),
        E(walletP).suggestIssuer('Card', CARD_ISSUER_BOARD_ID),
      ]);

      const zoe = E(walletP).getZoe();
      const board = E(walletP).getBoard();
      const instance = await E(board).getValue(INSTANCE_BOARD_ID);
      const publicFacet = E(zoe).getPublicFacet(instance);
      publicFacetRef.current = publicFacet;

      const availableItemsNotifier = E(
        publicFacetRef.current,
      ).getAvailableItemsNotifier();

      for await (const cardsAvailableAmount of iterateNotifier(
        availableItemsNotifier,
      )) {
        setAvailableCards(cardsAvailableAmount.value);
      }
    };

    const onDisconnect = () => {
      setWalletConnected(false);
      walletAbort && walletAbort();
    };

    const onMessage = (data) => {
      const obj = JSON.parse(data);
      walletDispatch && walletDispatch(obj);
    };

    activateWebSocket({
      onConnect,
      onDisconnect,
      onMessage,
    });
    return deactivateWebSocket;
  }, []);

  const handleClick = (name) => {
    makeOfferForCards({
      walletP: walletPRef.current,
      publicFacet: publicFacetRef.current,
      cards: harden([name]),
      cardPurse,
      tokenPurse,
      pricePerCard: BigInt(pricePerCard),
    });
    setNeedToApproveOffer(true);
  };

  const handleOnClose = () => {
    setNeedToApproveOffer(false);
    setBoughtCard(false);
  };

  return (
    <div className="App">
      <Header walletConnected={walletConnected} dappApproved={dappApproved} />
      <CardDisplay playerNames={availableCards} handleClick={handleClick} />
      <EnableAppDialog
        open={openEnableAppDialog}
        handleClose={handleDialogClose}
      />
      <ApproveOfferSnackbar open={needToApproveOffer} onClose={handleOnClose} />
      <BoughtCardSnackbar open={boughtCard} onClose={handleOnClose} />
    </div>
  );
}

export default App;
