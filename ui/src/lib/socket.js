// @ts-check

/**
 * @typedef {Object} Socket
 * @property {() => void} close
 * @property {(obj: { type: string }) => void} send
 * @property {(handler: (obj: { type: string }) => void) => void} addHandler
 * @property {(handler: (obj: { type: string }) => void) => void} removeHandler
 */

/**
 * @type {Map.<string, Socket>}
 */
const endpointToSocket = new Map();

/**
 * @param {string} endpoint
 * @param {Socket} socket
 */
export function registerSocket(endpoint, socket) {
  endpointToSocket.set(endpoint, socket);
}

/**
 * @param {string} endpoint
 */
export function closeSocket(endpoint) {
  const socket = endpointToSocket.get(endpoint);
  socket.close();
  endpointToSocket.delete(endpoint);
}

/**
 * @param {string} endpoint
 * @returns {Socket} [socket]
 */
export function getActiveSocket(endpoint) {
  return endpointToSocket.get(endpoint);
}

/**
 * @param {{ type: string; }} req
 * @param {any} endpoint
 */
export async function rpc(req, endpoint) {
  // Use the socket directly.
  const socket = getActiveSocket(endpoint);
  if (!socket) {
    throw Error(`Must activate socket before rpc to ${endpoint}`);
  }

  let resolve;
  const p = new Promise((res) => {
    resolve = res;
  });
  socket.send(req);
  const expectedResponse = `${req.type}Response`;

  /**
   * @param {{ type: string; }} obj
   */
  function getResponse(obj) {
    // console.log('got', msg);
    if (obj.type === expectedResponse) {
      resolve(obj);
      socket.removeHandler(getResponse);
    }
  }
  socket.addHandler(getResponse);
  return p;
}
