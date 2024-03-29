const Listr = require('listr');
const execa = require('execa');
const { resolveCwd } = require('./paths');

const scriptsDir = resolveCwd('scripts');

const tasks = new Listr([
  {
    title: '清理日志、报告等',
    task: () => execa('node', [`${scriptsDir}/clean-reports.js`]),
  },

  {
    title: '清理缓存',
    task: () => execa('node', [`${scriptsDir}/clean-cache.js`]),
  },

  {
    title: '清理先前的构建',
    task: () => execa('node', [`${scriptsDir}/clean-built.js`]),
  },

  {
    title: '清理包',
    task: () => execa('node', [`${scriptsDir}/clean-packages.js`]),
  },

  {
    title: '安装包',
    task: () => execa('npm', ['i']),
  },

  {
    title: '生成包的证书报告',
    task: () => execa('node', [`${scriptsDir}/license.js`]),
  },
]);

tasks.run().catch(err => {
  throw err;
});
