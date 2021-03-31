/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { makeCapTP, E } from '@agoric/captp';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';

import {
  activateWebSocket,
  deactivateWebSocket,
  getActiveSocket,
} from './utils/fetch-websocket';

import './App.css';

import Header from './components/Header.jsx';
import CardDisplay from './components/CardDisplay.jsx';
import ApproveOfferSnackbar from './components/ApproveOfferSnackbar.jsx';
import BoughtCardSnackbar from './components/BoughtCardSnackbar.jsx';
import EnableAppDialog from './components/EnableAppDialog.jsx';

import { makeOfferForCards } from './makeOfferForCards';

import dappConstants from './lib/constants';

const {
  INSTANCE_BOARD_ID,
  INSTALLATION_BOARD_ID,
  issuerBoardIds: { Card: CARD_ISSUER_BOARD_ID },
  brandBoardIds: { Token: TOKEN_BRAND_BOARD_ID, Card: CARD_BRAND_BOARD_ID },
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
  const [dappApproved, setDappApproved] = useState(false);
  const [availableCards, setAvailableCards] = useState([]);
  const [cardPurse, setCardPurse] = useState(null);
  const [tokenPurse, setTokenPurse] = useState(null);
  const [openEnableAppDialog, setOpenEnableAppDialog] = useState(true);
  const [needToApproveOffer, setNeedToApproveOffer] = useState(false);
  const [boughtCard, setBoughtCard] = useState(false);
  const [walletP, setWalletP] = useState(null);
  const [publicFacet, setPublicFacet] = useState(null);

  const handleDialogClose = () => setOpenEnableAppDialog(false);

  useEffect(() => {
    // Receive callbacks from the wallet connection.
    const otherSide = harden({
      needDappApproval(_dappOrigin, _suggestedDappPetname) {
        setDappApproved(false);
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
      const internalWalletP = getBootstrap();
      setWalletP(internalWalletP);

      const processPurses = (purses) => {
        // We find the first purses for each brand for simplicity
        setTokenPurse(
          purses.find(
            ({ brandBoardId }) => brandBoardId === TOKEN_BRAND_BOARD_ID,
          ),
        );
        setCardPurse(
          purses.find(
            ({ brandBoardId }) => brandBoardId === CARD_BRAND_BOARD_ID,
          ),
        );
      };

      async function watchPurses() {
        const pn = E(internalWalletP).getPursesNotifier();
        for await (const purses of iterateNotifier(pn)) {
          // dispatch(setPurses(purses));
          processPurses(purses);
        }
      }
      watchPurses().catch((err) => console.error('got watchPurses err', err));

      await Promise.all([
        E(internalWalletP).suggestInstallation(
          'Installation',
          INSTALLATION_BOARD_ID,
        ),
        E(internalWalletP).suggestInstance('Instance', INSTANCE_BOARD_ID),
        E(internalWalletP).suggestIssuer('Card', CARD_ISSUER_BOARD_ID),
      ]);

      const zoe = E(walletP).getZoe();
      const board = E(walletP).getBoard();
      const instance = await E(board).getValue(INSTANCE_BOARD_ID);
      setPublicFacet(E(zoe).getPublicFacet(instance));
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
  }, [walletP]);

  useEffect(() => {
    const getAvailableItems = async () => {
      if (publicFacet) {
        const available = await E(publicFacet).getAvailableItems();
        setAvailableCards(available);
      }
    };
    getAvailableItems();
  }, [walletP, needToApproveOffer, publicFacet]);

  const handleClick = (name) => {
    makeOfferForCards({
      walletP,
      cards: harden([name]),
      cardPurse,
      tokenPurse,
      pricePerCard: 10n,
    });
    setNeedToApproveOffer(true);
  };

  return (
    <div className="App">
      <Header walletConnected={walletConnected} dappApproved={dappApproved} />
      <CardDisplay playerNames={availableCards} handleClick={handleClick} />
      <EnableAppDialog
        open={openEnableAppDialog}
        handleClose={handleDialogClose}
      />
      <ApproveOfferSnackbar open={needToApproveOffer} />
      <BoughtCardSnackbar open={boughtCard} />
    </div>
  );
}

export default App;
