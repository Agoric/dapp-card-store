// @ts-check
// Agoric Dapp api deployment script

import fs from 'fs';
import { E } from '@agoric/eventual-send';
import '@agoric/zoe/exported';

import installationConstants from '../ui/public/conf/installationConstants';
import { makeLocalAmountMath } from '../contract/node_modules/@agoric/ertp/src';

import { cards } from './cards';

// deploy.js runs in an ephemeral Node.js outside of swingset. The
// spawner runs within ag-solo, so is persistent.  Once the deploy.js
// script ends, connections to any of its objects are severed.

// The deployer's wallet's petname for the money issuer.
let MONEY_ISSUER_PETNAME_JSON;
if (process.env.MONEY_ISSUER_PETNAME_JSON) {
  MONEY_ISSUER_PETNAME_JSON = JSON.stringify(
    JSON.parse(process.env.MONEY_ISSUER_PETNAME_JSON),
  );
} else if (process.env.MONEY_ISSUER_PETNAME) {
  MONEY_ISSUER_PETNAME_JSON = JSON.stringify(process.env.MONEY_ISSUER_PETNAME);
}

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
 * @typedef {{ zoe: ZoeService, board: Board, spawner, wallet, uploads, http }} Home
 * @param {Promise<Home>} homePromise
 * A promise for the references available from REPL home
 * @param {DeployPowers} powers
 */
export default async function deployApi(
  homePromise,
  { bundleSource, pathResolve },
) {
  // Let's wait for the promise to resolve.
  const home = await homePromise;

  // Unpack the references.
  const {
    // *** LOCAL REFERENCES ***

    // This wallet only exists on this machine, and only you have
    // access to it. The wallet stores purses and handles transactions.
    wallet,

    // The spawner persistently runs scripts within ag-solo, off-chain.
    spawner,

    // *** ON-CHAIN REFERENCES ***

    // Zoe lives on-chain and is shared by everyone who has access to
    // the chain. In this demo, that's just you, but on our testnet,
    // everyone has access to the same Zoe.
    zoe,

    // The http service allows registered handlers that are executed as part of
    // the ag-solo web server.
    http,

    // This is a scratch pad specific to the current ag-solo and inaccessible
    // from the chain.
    uploads: scratch,

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
    SELL_ITEMS_INSTALLATION_BOARD_ID,
    CONTRACT_NAME,
  } = installationConstants;
  const installation = await E(board).getValue(INSTALLATION_BOARD_ID);
  const sellItemsInstallation = await E(board).getValue(
    SELL_ITEMS_INSTALLATION_BOARD_ID,
  );

  // Second, we can use the installation to create a new instance of
  // our contract code on Zoe. A contract instance is a running
  // program that can take offers through Zoe. Making an instance will
  // give us a `creatorFacet` that will let us make invitations we can
  // send to users.

  const { creatorFacet: baseballCardSellerFacet } = await E(zoe).startInstance(
    installation,
  );

  // Default to the deployed faucet token.
  let moneyIssuer = await E(scratch).get('faucetTokenIssuer');
  if (MONEY_ISSUER_PETNAME_JSON) {
    // try to find the MONEY_ISSUER_PETNAME_JSON.
    const issuersArray = await E(wallet).getIssuers();
    // eslint-disable-next-line no-underscore-dangle
    let _moneyKey;
    [_moneyKey, moneyIssuer] = issuersArray.find(
      ([issuerPetname]) =>
        JSON.stringify(issuerPetname) === MONEY_ISSUER_PETNAME_JSON,
    );

    if (moneyIssuer === undefined) {
      console.error(
        'Cannot find MONEY_ISSUER_PETNAME_JSON',
        MONEY_ISSUER_PETNAME_JSON,
        'in home.wallet',
      );
      console.error('Have issuers:', [...issuersArray].join(', '));
      process.exit(1);
    }
  } else if (moneyIssuer === undefined) {
    console.error('Cannot find faucetTokenIssuer in home.uploads');
    process.exit(1);
  }

  const moneyBrand = await E(moneyIssuer).getBrand();
  const moneyMath = await makeLocalAmountMath(moneyIssuer);

  const allCardNames = harden(cards);
  const pricePerCard = moneyMath.make(10);

  const {
    // TODO: implement exiting the creatorSeat and taking the earnings
    // eslint-disable-next-line no-unused-vars
    sellItemsCreatorSeat: creatorSeat,
    sellItemsCreatorFacet: creatorFacet,
    sellItemsPublicFacet: publicFacet,
    sellItemsInstance: instance,
  } = await E(baseballCardSellerFacet).sellCards(
    allCardNames,
    moneyIssuer,
    sellItemsInstallation,
    pricePerCard,
  );

  console.log('- SUCCESS! contract instance is running on Zoe');

  console.log('Retrieving Board IDs for issuers and brands');
  const invitationIssuerP = E(zoe).getInvitationIssuer();
  const invitationBrandP = E(invitationIssuerP).getBrand();

  const cardIssuer = await E(publicFacet).getItemsIssuer();
  const cardBrand = await E(cardIssuer).getBrand();

  const invitationIssuer = await invitationIssuerP;

  const [
    INSTANCE_BOARD_ID,
    CARD_BRAND_BOARD_ID,
    CARD_ISSUER_BOARD_ID,
    MONEY_BRAND_BOARD_ID,
    MONEY_ISSUER_BOARD_ID,
  ] = await Promise.all([
    E(board).getId(instance),
    E(board).getId(cardBrand),
    E(board).getId(cardIssuer),
    E(board).getId(moneyBrand),
    E(board).getId(moneyIssuer),
  ]);

  console.log(`-- Contract Name: ${CONTRACT_NAME}`);
  console.log(`-- INSTANCE_BOARD_ID: ${INSTANCE_BOARD_ID}`);
  console.log(`-- CARD_ISSUER_BOARD_ID: ${CARD_ISSUER_BOARD_ID}`);
  console.log(`-- CARD_BRAND_BOARD_ID: ${CARD_BRAND_BOARD_ID}`);

  // We want the handler to run persistently. (Scripts such as this
  // deploy.js script are ephemeral and all connections to objects
  // within this script are severed when the script is done running.)

  const installURLHandler = async () => {
    // To run the URL handler persistently, we must use the spawner to run
    // the code on our ag-solo even after the deploy script exits.

    // Bundle up the handler code
    const bundle = await bundleSource(pathResolve('./src/handler.js'));

    // Install it on the spawner
    const handlerInstall = E(spawner).install(bundle);

    // Spawn the installed code to create an URL handler.
    const handler = E(handlerInstall).spawn({
      creatorFacet,
      board,
      http,
      invitationIssuer,
    });

    // Have our ag-solo wait on ws://localhost:8000/api/card-store for
    // websocket connections.
    await E(http).registerURLHandler(handler, '/api/card-store');
  };

  await installURLHandler();

  const invitationBrand = await invitationBrandP;
  const INVITE_BRAND_BOARD_ID = await E(board).getId(invitationBrand);

  const API_URL = process.env.API_URL || `http://127.0.0.1:${API_PORT || 8000}`;

  // Re-save the constants somewhere where the UI and api can find it.
  const dappConstants = {
    INSTANCE_BOARD_ID,
    INSTALLATION_BOARD_ID,
    SELL_ITEMS_INSTALLATION_BOARD_ID,
    INVITE_BRAND_BOARD_ID,
    // BRIDGE_URL: 'agoric-lookup:https://local.agoric.com?append=/bridge',
    brandBoardIds: {
      Card: CARD_BRAND_BOARD_ID,
      Money: MONEY_BRAND_BOARD_ID,
    },
    issuerBoardIds: {
      Card: CARD_ISSUER_BOARD_ID,
      Money: MONEY_ISSUER_BOARD_ID,
    },
    BRIDGE_URL: 'http://127.0.0.1:8000',
    API_URL,
  };
  const defaultsFile = pathResolve(`../ui/public/conf/defaults.js`);
  console.log('writing', defaultsFile);
  const defaultsContents = `\
// GENERATED FROM ${pathResolve('./deploy.js')}
export default ${JSON.stringify(dappConstants, undefined, 2)};
`;
  await fs.promises.writeFile(defaultsFile, defaultsContents);
}
