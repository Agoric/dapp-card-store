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
  const [openEnableAppDialog, setOpenEnableAppDialog] = useState(false);
  const [openApproveOfferSnackbar, setOpenApproveOfferSnackbar] = useState(
    false,
  );
  const [openBoughtCardSnackbar, setOpenBoughtCardSnackbar] = useState(false);
  const [walletP, setWalletP] = useState(null);

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
        'Treasury',
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

  // setAvailableCards
  useEffect(() => {}, []);

  // setCardPurse and setTokenPurse
  useEffect(() => {}, []);

  // setOpenEnableAppDialog
  useEffect(() => {}, []);

  // setOpenApproveOfferSnackbar
  useEffect(() => {}, []);

  // setOpenBoughtCardSnackbar
  useEffect(() => {}, []);

  return (
    <div className="App">
      <Header walletConnected={walletConnected} />
      <CardDisplay
        playerNames={availableCards}
        walletP={walletP}
        cardPurse={cardPurse}
        tokenPurse={tokenPurse}
        pricePerCard={10n}
      />
      <EnableAppDialog
        open={openEnableAppDialog}
        handleClose={handleDialogClose}
      />
      <ApproveOfferSnackbar open={openApproveOfferSnackbar} />
      <BoughtCardSnackbar open={openBoughtCardSnackbar} />
    </div>
  );
}

export default App;
