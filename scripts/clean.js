const execa = require('execa');
const { resolveCwd } = require('./paths');

(async () => {
  const scriptsDir = resolveCwd('scripts');

  const cleanReports = execa('node', [
    `${scriptsDir}/clean-reports.js`,
  ]);

  const cleanCache = execa('node', [
    `${scriptsDir}/clean-cache.js`,
  ]);

  await cleanReports;
  await cleanCache;
})();
