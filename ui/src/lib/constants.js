// Allow the runtime to override the defaults with __DAPP_CONSTANTS__
import defaults from '../conf/defaults.js';

// eslint-disable-next-line no-underscore-dangle, no-undef
export default globalThis.__DAPP_CONSTANTS__ || defaults;
