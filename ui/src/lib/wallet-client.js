// @ts-check

import { registerSocket, getActiveSocket, closeSocket } from './socket.js';

// Wallet bridge

/**
 * @typedef {object} SocketHandler
 * @property {() => void} [onConnect]
 * @property {(msg: string) => void} [onMessage]
 * @property {() => void} [onDisconnect]
 */

const walletBridgeId = 'walletBridgeIFrame';
let walletLoaded = false;
const connectSubscriptions = new Set();
const messageSubscriptions = new Set();
let initializedIframe = false;

/**
 * Make a new wallet bridge "socket", via postMessage to an iframe.
 *
 * @param {SocketHandler} handler
 * @param {string} endpoint
 */
function createSocket(
  { onConnect, onDisconnect, onMessage },
  endpoint = '/private/wallet-bridge',
) {
  let ifr = /** @type {HTMLIFrameElement} */ (document.getElementById(
    walletBridgeId,
  ));
  if (!ifr) {
    ifr = document.querySelector(`#${walletBridgeId}`);
  }
  if (!initializedIframe) {
    initializedIframe = true;
    window.addEventListener('message', (ev) => {
      // console.log('dapp ui got', ev);
      if (ev.data && ev.data.type === 'walletBridgeLoaded') {
        walletLoaded = true;
        for (const sub of connectSubscriptions.keys()) {
          sub();
        }
        connectSubscriptions.clear();
      } else {
        const obj = ev.data;
        for (const sub of messageSubscriptions.keys()) {
          sub(obj);
        }
      }
    });
  }

  let ifrQueue = [];
  const flushQueue = () => {
    const q = ifrQueue;
    ifrQueue = undefined;
    ifr.removeEventListener('load', flushQueue);
    while (q.length) {
      const obj = q.shift();
      ifr.contentWindow.postMessage(obj, window.origin);
    }
  };
  ifr.addEventListener('load', flushQueue);

  // FIXME: Don't assume our location.
  const queryPos = endpoint.indexOf('?');
  if (queryPos >= 0) {
    ifr.src = `lib/agoric-wallet.html${endpoint.substr(queryPos)}`;
  } else {
    ifr.src = 'lib/agoric-wallet.html';
  }
  if (onMessage) {
    messageSubscriptions.add(onMessage);
  }
  const messageListeners = new Set();
  registerSocket(endpoint, {
    send(obj) {
      if (ifrQueue) {
        ifrQueue.push(obj);
      } else {
        ifr.contentWindow.postMessage(obj, window.origin);
      }
    },
    addHandler(handler) {
      messageListeners.add(handler);
      messageSubscriptions.add(handler);
    },
    removeHandler(handler) {
      messageSubscriptions.delete(handler);
      messageListeners.delete(handler);
    },
    close() {
      walletLoaded = false;
      if (onConnect) {
        connectSubscriptions.delete(onConnect);
      }
      if (onMessage) {
        messageSubscriptions.delete(onMessage);
      }
      for (const sub of messageListeners.keys()) {
        messageSubscriptions.delete(sub);
      }
      ifr = /** @type {HTMLIFrameElement} */ (document.getElementById(
        walletBridgeId,
      ));
      if (ifr) {
        ifr.src = '';
      }

      if (onDisconnect) {
        onDisconnect();
      }
    },
  });

  if (onConnect) {
    if (walletLoaded) {
      onConnect();
    } else {
      connectSubscriptions.add(onConnect);
    }
  }
}

/**
 * Start a given socket connection.
 *
 * @param {SocketHandler} socketListeners
 * @param {*} endpoint
 */
export function activateSocket(
  socketListeners = {},
  endpoint = '/private/wallet-bridge',
) {
  if (getActiveSocket(endpoint)) return;
  createSocket(socketListeners, endpoint);
}

export function deactivateSocket(endpoint = '/private/wallet-bridge') {
  if (!getActiveSocket(endpoint)) return;
  closeSocket(endpoint);
}
