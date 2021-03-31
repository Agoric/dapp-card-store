// @ts-check

import React, { useState } from 'react';

import { makeCapTP, E } from '@agoric/captp';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';


import {
  activateWebSocket,
  deactivateWebSocket,
  getActiveSocket,
} from '../utils/fetch-websocket';

import dappConstants from '../lib/constants';
import { connect } from './connect';

const {
  INSTANCE_BOARD_ID,
  INSTALLATION_BOARD_ID,
  issuerBoardIds: { Card: CARD_ISSUER_BOARD_ID },
  brandBoardIds: { Token: TOKEN_BRAND_BOARD_ID, Card: CARD_BRAND_BOARD_ID },
} = dappConstants;

// Assume wallet for now
const walletP;

export default async function main() {
  const [tokenPurse, setTokenPurse] = useState(null);
  const [cardPurse, setCardPurse] = useState(null);
  const [approveAppDialogOpen, setApprovalAppDialogOpen] = useState(false);
  const [approveOfferSBOpen, setApproveOfferSBOpen] = useState(false);
  const [boughtCardSBOpen, setBoughtCardSBOpen] = useState(false);
  
  // 'walletNeedDappApproval' => setApprovalAppDialogOpen(true);
  // 'walletOfferAdded' => setApproveOfferSBOpen(true);
  // 'walletOfferHandled' => setApproveOfferSBOpen(false);
  // 'walletOfferResult' =>  {
  //    setBoughtCardSBOpen(false);
  //     updateAvailableItems()
  // }

      const processPurses = purses => {
        // We find the first purses for each brand for simplicity
        const tokenPurse = purses.find(
          ({ brand }) => brand === tokenBrand,
        );
        const cardPurse = purses.find(
          ({ brand }) => brand === cardBrand,
        );
      }

    async function watchPurses() {
      const pn = E(walletP).getPursesNotifier();
      for await (const purses of iterateNotifier(pn)) {
        // dispatch(setPurses(purses));
        processPurses(purses);
      }
    }
    watchPurses().catch(err =>
      console.error('got watchPurses err', err),
    );

    await Promise.all([
      E(walletP).suggestInstallation('Installation', INSTALLATION_BOARD_ID),
      E(walletP).suggestInstance('Instance', INSTANCE_BOARD_ID),
      E(walletP).suggestIssuer('Card', CARD_ISSUER_BOARD_ID),
    ]);

  
}

main();
