// @ts-check
/* global process */

// Agoric Dapp api deployment script

import fs from 'fs';
import { E } from '@endo/eventual-send';
import '@agoric/zoe/exported.js';
import { AmountMath } from '@agoric/ertp';

import installationConstants from '../ui/src/conf/installationConstants.js';

import { cards } from './cards.js';

const PRICE_PER_CARD_IN_MONEY_UNITS = 1n;

// deploy.js runs in an ephemeral Node.js outside of swingset. The
// spawner runs within ag-solo, so is persistent.  Once the deploy.js
// script ends, connections to any of its objects are severed.

/**
 * @typedef {Object} DeployPowers The special powers that `agoric deploy` gives us
 * @property {(path: string) => Promise<{ moduleFormat: string, source: string }>} bundleSource
 * @property {(path: string) => string} pathResolve
 * @property {(path: string, opts?: any) => Promise<any>} installUnsafePlugin
 *
 * @typedef {Object} Board
 * @property {(id: string) => any} getValue
 * @property {(value: any) => string} getId
 * @property {(value: any) => boolean} has
 * @property {() => [string]} ids
 */

const API_PORT = process.env.API_PORT || '8000';

/**
 * @typedef {{ zoe: ZoeService, board: Board, spawner, wallet,
 * uploads, http, agoricNames, chainTimerService }} Home
 * @param {Promise<Home>} homePromise
 * A promise for the references available from REPL home
 * @param {DeployPowers} powers
 */
export default async function deployApi(homePromise, { pathResolve }) {
  // Let's wait for the promise to resolve.
  const home = await homePromise;

  // Unpack the references.
  const {
    // *** ON-CHAIN REFERENCES ***
    chainTimerService: chainTimerServiceP,

    // Zoe lives on-chain and is shared by everyone who has access to
    // the chain. In this demo, that's just you, but on our testnet,
    // everyone has access to the same Zoe.
    zoe,

    // The board is an on-chain object that is used to make private
    // on-chain objects public to everyone else on-chain. These
    // objects get assigned a unique string id. Given the id, other
    // people can access the object through the board. Ids and values
    // have a one-to-one bidirectional mapping. If a value is added a
    // second time, the original id is just returned.
    board,
  } = home;

  // To get the backend of our dapp up and running, first we need to
  // grab the installation that our contract deploy script put
  // in the public board.
  const {
    INSTALLATION_BOARD_ID,
    AUCTION_INSTALLATION_BOARD_ID,
    AUCTION_ITEMS_INSTALLATION_BOARD_ID,
    CONTRACT_NAME,
  } = installationConstants;
  const installation = await E(board).getValue(INSTALLATION_BOARD_ID);
  const auctionItemsInstallation = await E(board).getValue(
    AUCTION_ITEMS_INSTALLATION_BOARD_ID,
  );
  const auctionInstallation = await E(board).getValue(
    AUCTION_INSTALLATION_BOARD_ID,
  );

  // Second, we can use the installation to create a new instance of
  // our contract code on Zoe. A contract instance is a running
  // program that can take offers through Zoe. Making an instance will
  // give us a `creatorFacet` that will let us make invitations we can
  // send to users.

  const { creatorFacet: baseballCardSellerFacet } = await E(zoe).startInstance(
    installation,
  );

  /**
   * @type {ERef<Issuer>}
   */
  const moneyIssuerP = E(home.agoricNames).lookup('issuer', 'IST');

  const moneyBrandP = E(moneyIssuerP).getBrand();
  const [moneyIssuer, moneyBrand, { decimalPlaces = 0 }] = await Promise.all([
    moneyIssuerP,
    moneyBrandP,
    E(moneyBrandP).getDisplayInfo(),
  ]);

  const allCardNames = harden(cards);
  const moneyValue =
    PRICE_PER_CARD_IN_MONEY_UNITS * 10n ** BigInt(decimalPlaces);
  const minBidPerCard = AmountMath.make(moneyBrand, moneyValue);

  const chainTimerService = await chainTimerServiceP;
  const {
    // TODO: implement exiting the creatorSeat and taking the earnings
    auctionItemsPublicFacet: publicFacet,
    auctionItemsInstance: instance,
  } = await E(baseballCardSellerFacet).auctionCards(
    allCardNames,
    moneyIssuer,
    auctionInstallation,
    auctionItemsInstallation,
    minBidPerCard,
    chainTimerService,
  );

  console.log('- SUCCESS! contract instance is running on Zoe');

  console.log('Retrieving Board IDs for issuers and brands');
  const invitationIssuerP = E(zoe).getInvitationIssuer();
  const invitationBrandP = E(invitationIssuerP).getBrand();

  const cardIssuerP = E(publicFacet).getItemsIssuer();
  const [cardIssuer, cardBrand, invitationBrand] = await Promise.all([
    cardIssuerP,
    E(cardIssuerP).getBrand(),
    invitationBrandP,
  ]);

  const [
    INSTANCE_BOARD_ID,
    CARD_BRAND_BOARD_ID,
    CARD_ISSUER_BOARD_ID,
    MONEY_BRAND_BOARD_ID,
    MONEY_ISSUER_BOARD_ID,
    INVITE_BRAND_BOARD_ID,
  ] = await Promise.all([
    E(board).getId(instance),
    E(board).getId(cardBrand),
    E(board).getId(cardIssuer),
    E(board).getId(moneyBrand),
    E(board).getId(moneyIssuer),
    E(board).getId(invitationBrand),
  ]);

  console.log(`-- Contract Name: ${CONTRACT_NAME}`);
  console.log(`-- INSTANCE_BOARD_ID: ${INSTANCE_BOARD_ID}`);
  console.log(`-- CARD_ISSUER_BOARD_ID: ${CARD_ISSUER_BOARD_ID}`);
  console.log(`-- CARD_BRAND_BOARD_ID: ${CARD_BRAND_BOARD_ID}`);

  const API_URL = process.env.API_URL || `http://127.0.0.1:${API_PORT || 8000}`;

  // Re-save the constants somewhere where the UI and api can find it.
  const dappConstants = {
    INSTANCE_BOARD_ID,
    INSTALLATION_BOARD_ID,
    AUCTION_ITEMS_INSTALLATION_BOARD_ID,
    INVITE_BRAND_BOARD_ID,
    BRIDGE_URL: 'agoric-lookup:https://local.agoric.com?append=/bridge',
    brandBoardIds: {
      Card: CARD_BRAND_BOARD_ID,
      Money: MONEY_BRAND_BOARD_ID,
    },
    issuerBoardIds: {
      Card: CARD_ISSUER_BOARD_ID,
      Money: MONEY_ISSUER_BOARD_ID,
    },
    minBidPerCard: Number(moneyValue),
    API_URL,
    CONTRACT_NAME,
  };
  const defaultsFile = pathResolve(`../ui/src/conf/defaults.js`);
  console.log('writing', defaultsFile);
  const defaultsContents = `\
// GENERATED FROM ${pathResolve('./deploy.js')}
export default ${JSON.stringify(dappConstants, undefined, 2)};
`;
  await fs.promises.writeFile(defaultsFile, defaultsContents);
}
