/* global process, require, module */
// @ts-check
const pagePatch = {
  target: '<link name="unprocessed-script" content="lockdown.umd.js"/>',
  replacement: `
    <script src="lockdown.umd.js"></script>
    <script>
    const { pow: mathPow } = Math;
    Math.pow = (base, exp) => (typeof base === 'bigint' && typeof exp ==='bigint') ? base ** exp : mathPow(base, exp);
    lockdown({ __allowUnsafeMonkeyPatching__: 'unsafe', errorTaming: 'unsafe', overrideTaming: 'severe' });
    console.log("lockdown done.");
    </script>
    `,
};

/**
 * Until we upgrade to a SES release that handles
 * double initialization, we patch away the import
 * in a production build.
 */
const modulePatch = {
  target: "import 'ses/lockdown'",
  replacement: "// import 'ses/lockdown'",
};

/**
 *
 * @param {string[]} args
 * @param {{
 *   readFile: typeof import('fs').promises.readFile,
 *   writeFile: typeof import('fs').promises.writeFile,
 * }} io
 */
async function main(args, { readFile, writeFile }) {
  const [filename] = args;

  /**
   *
   * @param {string} name
   * @param {{ target: string, replacement: string}} patch
   */
  async function patchFile(name, { target, replacement }) {
    const original = await readFile(name, 'utf-8');
    if (original.indexOf(target) < 0) {
      throw Error('target not found');
    }
    const patched = original.replace(target, replacement);
    await writeFile(name, patched);
  }

  if (filename.match(/\.js$/)) {
    await patchFile(filename, modulePatch);
  } else {
    await patchFile(filename, pagePatch);
  }
}

if (require.main === module) {
  // eslint-disable-next-line global-require
  main(process.argv.slice(2), require('fs').promises).catch(err =>
    console.error(err),
  );
}
