// Allow the React dev environment to extend the console for debugging
// features.
// eslint-disable-next-line no-constant-condition
const consoleTaming = '%NODE_ENV%' === 'development' ? 'unsafe' : 'safe';
// eslint-disable-next-line no-constant-condition
const errorTaming = '%NODE_ENV%' === 'development' ? 'unsafe' : 'safe';

// eslint-disable-next-line no-restricted-properties
const { pow: mathPow } = Math;
// eslint-disable-next-line no-restricted-properties
Math.pow = (base, exp) =>
  typeof base === 'bigint' && typeof exp === 'bigint'
    ? base ** exp
    : mathPow(base, exp);

lockdown({
  errorTaming,
  overrideTaming: 'severe',
  consoleTaming,
});

console.log('lockdown done.');

window.addEventListener('unhandledrejection', (ev) => {
  ev.stopImmediatePropagation();
});

// Even on non-v8, we tame the start compartment's Error constructor so
// this assignment is not rejected, even if it does nothing.
Error.stackTraceLimit = Infinity;
