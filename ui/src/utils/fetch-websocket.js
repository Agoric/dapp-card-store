/* eslint-disable */

/* global process */
import dappConstants from './constants.js';

const { API_URL, BRIDGE_URL, CONTRACT_NAME } = dappConstants;

// === WEB SOCKET

const endpointToSocket = new Map();

function logMsg(obj, direction = 'send:') {
  const type = obj.type;
  switch (type) {
    case undefined:
      // Skip untyped objects.
      // console.log(direction, obj);
      return;
    case 'CTP_CALL':
      console.log(direction, type, obj.method && obj.method.body, obj);
      return;
    case 'CTP_RETURN':
      console.log(direction, type, (obj.exception || obj.result).body, obj);
      return;
    default:
      console.log(direction, type, obj);
  }
}

function getWebSocketEndpoint(endpoint) {
  // TODO proxy socket.
  let url;
  if (endpoint === '/api') {
    url = new URL(endpoint, API_URL || window.origin);
  } else {
    url = new URL(endpoint, BRIDGE_URL || window.origin);
  }
  url.protocol = url.protocol.replace(/^http/, 'ws');
  return url;
}

const walletBridgeId = 'walletBridgeIFrame';
let walletLoaded = false;
const connectSubscriptions = new Set();
const messageSubscriptions = new Set();
function createSocket({ onConnect, onDisconnect, onMessage }, endpoint) {
  if (endpoint === '/private/wallet-bridge') {
    let ifr = document.getElementById(walletBridgeId);
    if (!ifr) {
      ifr = document.createElement('iframe');
      ifr.id = walletBridgeId;
      ifr.setAttribute('width', '0');
      ifr.setAttribute('height', '0');
      ifr.setAttribute('style', 'display: none');
      document.body.appendChild(ifr);
      window.addEventListener('message', ev => {
        // console.log('dapp ui got', ev);
        logMsg(ev.data, 'recv');
        if (ev.data && ev.data.type === 'walletBridgeLoaded') {
          walletLoaded = true;
          for (const sub of connectSubscriptions.keys()) {
            sub();
          }
          connectSubscriptions.clear();
        } else {
          const msg = JSON.stringify(ev.data);
          for (const sub of messageSubscriptions.keys()) {
            sub(msg);
          }
        }
      });
    }
    let ifrQ = [];
    ifr.src = `${
      process.env.PUBLIC_URL
    }/agoric-wallet.html?suggestedDappPetname=${encodeURIComponent(
      CONTRACT_NAME,
    )}`;
    ifr.addEventListener('load', () => {
      while (ifrQ && ifrQ.length) {
        const obj = ifrQ.shift();
        logMsg(obj);
        ifr.contentWindow.postMessage(obj, window.origin);
      }
      ifrQ = undefined;
    });
    if (onMessage) {
      messageSubscriptions.add(onMessage);
    }
    const messageListeners = new Set();
    endpointToSocket.set(endpoint, {
      send(msg) {
        const obj = JSON.parse(msg);
        if (ifrQ) {
          ifrQ.push(obj);
        } else {
          logMsg(obj);
          ifr.contentWindow.postMessage(obj, window.origin);
        }
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
        const ifr2 = document.getElementById(walletBridgeId);
        if (ifr2) {
          ifr2.src = '';
        }

        if (onDisconnect) {
          onDisconnect();
        }
      },
      addEventListener(kind, cb) {
        if (kind !== 'message') {
          throw Error(`Cannot bridge.addEventListener kind ${kind}`);
        }
        const onmsg = data => cb({ data });
        messageListeners.add(onmsg);
        messageSubscriptions.add(onmsg);
      },
      removeEventListener(kind, cb) {
        if (kind !== 'message') {
          throw Error(`Cannot bridge.removeEventListener kind ${kind}`);
        }
        messageSubscriptions.delete(cb);
        messageListeners.delete(cb);
      },
    });

    if (onConnect) {
      if (walletLoaded) {
        onConnect();
      } else {
        connectSubscriptions.add(onConnect);
      }
    }
    return;
  }

  const socket = new WebSocket(getWebSocketEndpoint(endpoint));
  endpointToSocket.set(endpoint, socket);
  if (onConnect) {
    socket.addEventListener('open', () => onConnect());
  }
  if (onDisconnect) {
    socket.addEventListener('close', () => onDisconnect());
  }
  if (onMessage) {
    socket.addEventListener('message', ({ data }) => onMessage(data));
  }
}

function closeSocket(endpoint) {
  const socket = endpointToSocket.get(endpoint);
  socket.close();
  endpointToSocket.delete(endpoint);
}

export function getActiveSocket(endpoint = '/private/wallet-bridge') {
  return endpointToSocket.get(endpoint);
}

export function activateWebSocket(
  socketListeners = {},
  endpoint = '/private/wallet-bridge',
) {
  if (getActiveSocket(endpoint)) return;
  createSocket(socketListeners, endpoint);
}

export function deactivateWebSocket(endpoint = '/private/wallet-bridge') {
  if (!getActiveSocket(endpoint)) return;
  closeSocket(endpoint);
}

// === FETCH

export async function doFetch(req, endpoint = '/private/wallet-bridge') {
  // Use the socket directly.
  const socket = getActiveSocket(endpoint);
  if (!socket) {
    throw Error(`Must activate socket before doFetch to ${endpoint}`);
  }

  let resolve;
  const p = new Promise(res => {
    resolve = res;
  });
  socket.send(JSON.stringify(req));
  const expectedResponse = `${req.type}Response`;
  function getResponse({ data: msg }) {
    // console.log('got', msg);
    const obj = JSON.parse(msg);
    logMsg(obj, 'recv:');
    if (obj.type === expectedResponse) {
      resolve(obj);
      socket.removeEventListener('message', getResponse);
    }
  }
  socket.addEventListener('message', getResponse);
  return p;
}
