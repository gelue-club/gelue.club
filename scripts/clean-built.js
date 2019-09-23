const trash = require('trash');
const { resolveCwd } = require('./paths');

(async () => {
  await trash([
    resolveCwd('public'),
    resolveCwd('esm'),
    resolveCwd('lib'),
    resolveCwd('build'),
    resolveCwd('dest'),
  ]);
})();
