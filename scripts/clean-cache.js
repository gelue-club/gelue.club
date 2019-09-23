const trash = require('trash');
const { resolveCwd } = require('./paths');

(async () => {
  await trash([
    resolveCwd('.eslintcache'),
    resolveCwd('.cache'),
    resolveCwd('.next'),
  ]);
})();
