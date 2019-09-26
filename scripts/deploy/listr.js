#!/usr/bin/env node

// CLI: npx cross-env NODE_ENV=production node ./scripts/deploy/listr --src './public/**/*' --to '/pro' --tar './blog-drep-org.tar'

/**
 * 在生产环境下构建 `src` 囊括的所有文件，这里使用 `glob` 提供
 * 的模式检索。
 *
 * 传输前，会将生产构建打包成 `*.tar` 文件，`tar` 指向打包后文
 * 件的位置及文件名。
 *
 * `to` 指向服务器内的文件夹绝对位置。
 *
 * 注：仅支持单文件传输！
 *
 * TODO:
 *
 * - 支持测试流程
 * - 支持禁止某个流程
 */

const Listr = require('listr');
const execa = require('execa');
const trash = require('trash');
const tar = require('tar');
const prompts = require('prompts');
const argv = require('minimist')(process.argv.slice(2));
const { resolveCwd } = require('../paths');

const scriptsDir = resolveCwd('scripts');
const deployScriptDir = resolveCwd('scripts/deploy');

(async () => {
  const { host, username, password } = await prompts([
    {
      type: 'text',
      name: 'username',
      message: '用户名',
    },
    {
      type: 'password',
      name: 'password',
      message: '密码',
    },
  ]);

  console.clear();

  const tasks = new Listr([
    {
      title: '准备',
      task: () =>
        trash([
          resolveCwd(argv.tar),
          resolveCwd('public'),
          resolveCwd('.cache'),
        ]),
    },

    {
      title: '生产构建',
      task: () =>
        execa('yarn', ['build'], {
          maxBuffer: 10000000000,
        }),
    },

    {
      title: '打包',
      task: () =>
        tar.c(
          {
            gzip: true,
            file: argv.tar,
          },
          [argv.src]
        ),
    },

    {
      title: '部署',
      task: () =>
        execa('node', [
          `${deployScriptDir}/ssh2.js`,
          '--src',
          argv.tar,
          '--remoteDir',
          argv.to,
          '--username',
          username,
          '--password',
          password,
        ]),
    },

    {
      title: '清理',
      task: () =>
        trash([
          resolveCwd(argv.tar),
          resolveCwd('public'),
          resolveCwd('.cache'),
        ]),
    },
  ]);

  tasks.run().catch(err => {
    throw err;
  });
})();
