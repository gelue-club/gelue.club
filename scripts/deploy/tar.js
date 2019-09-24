#!/usr/bin/env node

// CLI: npx cross-env NODE_ENV=production node ./scripts/deploy/tar --src './public/**/*' --out './blog-drep-org.tar'

/**
 * 将 `src` 指向的文件打包，使用 `glob` 提供的模式检索，`out` 指
 * 向打包后文件的位置及文件名
 *
 * TODO:
 *
 * - 提供 API 方式的调用
 */

const { createWriteStream } = require('fs');
const { resolve } = require('path');
const archiver = require('archiver');
const { dirname, basename } = require('path');
const argv = require('minimist')(process.argv.slice(2));
const { appDirectory } = require('../paths');

const output = createWriteStream(
  resolve(appDirectory, dirname(argv.out), basename(argv.out))
);

const archive = archiver('tar');

archive.pipe(output);

archive.glob(argv.src);

archive.finalize();
