#!/usr/bin/env node

// CLI: npx cross-env NODE_ENV=development node ./scripts/deploy/ssh2 --src './blog-drep-org.tar' --remoteDir '/pro'

/**
 * 将 `src` 指向的某个文件上传到远程服务器内，`remoteDir` 指向
 * 服务器内的文件夹绝对位置。
 *
 * 注：仅支持单文件传输！
 *
 * 具体实现参考了，
 * - https://goo.gl/2WnX8J
 *
 * TODO:
 *
 * - 自定义 & 读取 `.deploymentrc` 配置文件，覆盖指令后的参数值
 * - 支持自定义主机、端口、用户名、密码 / 密钥
 * - 重命名也需支持自定义
 * - 移除对 `.env` 文件的需求，环境变量从命令中获取
 * - 需提供本地构建文件夹名称
 * - 提供 API 方式的调用
 *
 * WORKFLOW:
 *
 * - 清理远程服务器
 * - 传输本地 `blog-drep-org.tar` 文件至远程服务器
 * - 在远程服务器上解压并将解压后的文件夹重命名为 `gelue.club`
 *
 *
 * PENDING:
 *
 * - 传输过程通过进度条可视化
 */

const { createReadStream } = require('fs');
const { basename, resolve } = require('path');

const chalk = require('chalk');
const noop = require('lodash/noop');
const series = require('async/series');
const ProgressBar = require('progress');
const readPkg = require('read-pkg');
const debug = require('debug');

const Client = require('ssh2').Client;
const argv = require('minimist')(process.argv.slice(2));

const pkg = readPkg.sync();
const ssh = new Client();
const log = debug('GELUE:log');
const { resolveCwd } = require('../paths');

const paths = {
  // 待传输文件的本地位置
  localDir: resolveCwd(argv.src),

  // 远程存放的位置
  transferred: resolve(argv.remoteDir, basename(argv.src)),

  // 远程解压后存放的位置
  unpackedDir: resolve(argv.remoteDir, 'public'),

  // 重命名解压后文件夹的名称
  renamedDir: resolve(argv.remoteDir, 'gelue.club'),
};

log(`filename: ${basename(argv.src)}`);
log(`localDir: ${paths.localDir}`);
log(`transferred: ${paths.transferred}`);
log(`unpackedDir: ${paths.unpackedDir}`);
log(`renamedDir: ${paths.renamedDir}`);

const { localDir, transferred, unpackedDir, renamedDir } = paths;

const cmdCleanRemote = `rm -rf ${transferred} ${unpackedDir} ${renamedDir}`;
const cmdExtract = `tar -xvf ${transferred} -C ${argv.remoteDir}`;
const cmdRename = `mv ${unpackedDir} ${renamedDir}`;
const cmdUnpackAndRename = `${cmdExtract} && ${cmdRename}`;

log(chalk`cmdCleanRemote: {bold "${cmdCleanRemote}"}`);
log(chalk`cmdUnpackAndRename: {bold "${cmdUnpackAndRename}"}`);

const bar = new ProgressBar(
  `正在部署 "${pkg.name} v${pkg.version}" [:bar] :rate/bps :percent :etas`,
  {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: 2,
  }
);

const startDeployment = sftp => {
  series(
    [
      cb => {
        ssh.exec(cmdCleanRemote, ($err, $stream) => {
          if ($err) throw $err;

          $stream
            .on('close', () => {
              cb(null, 'cleaned');
            })
            .on('data', noop);
        });
      },

      cb => {
        createReadStream(localDir).pipe(
          // https://git.io/fAnqC
          sftp.createWriteStream(transferred).on('finish', () => {
            bar.tick();
            log(chalk`- {green \u2714} ${localDir}`);

            cb(null, 'transfered');
          })
        );
      },

      cb => {
        ssh.exec(cmdUnpackAndRename, (_err, _strm) => {
          if (_err) throw _err;

          _strm
            .on('close', () => {
              bar.tick();
              log(chalk`- {green \u2714} 解压`);

              ssh.end();
              sftp.end();

              cb(null, 'unpacked');
            })
            .on('data', noop);
        });
      },
    ],
    err => {
      if (err) {
        throw err;
      }
    }
  );
};

ssh.on('ready', () => {
  log(chalk`{cyan - Ready}`);

  ssh.sftp((err, sftp) => {
    if (err) {
      throw err;
    }
    log(chalk`{cyan - SFTP started}`);

    startDeployment(sftp);
  });
});

ssh.on('connect', () => {
  log(chalk`{cyan - Connected}`);
});

ssh.on('error', err => {
  throw err;
});

ssh.on('end', () => {
  process.exit(0);
});

ssh.connect({
  host: '34.92.102.151',
  port: 22,
  username: argv.username,
  password: argv.password,
});
