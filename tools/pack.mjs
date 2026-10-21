#!/usr/bin/env node
// 打方案发布包：dist/<id>-<version>.tgz + .sha256（确定性，可挂 gitee Release / 内网 / 离线分发）。
// 包内根目录即方案文件，另含 `.tcsol-entry.json`（该方案的 index 条目，安装器据此校验）。
//
// 用法：node tools/pack.mjs <id...> | --all [--out dist]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { writeTarGz } from '../packages/installer/src/tar.mjs';
import { buildIndex } from './build-index.mjs';
import { REPO_ROOT, SOLUTIONS_DIR, parseArgs, sha256 } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const out = resolve(REPO_ROOT, args.out || 'dist');
const index = buildIndex();
const wanted = args.all ? index.items.map((it) => it.id) : args._;
if (!wanted.length) {
  console.error('用法：node tools/pack.mjs <id...> | --all');
  process.exit(2);
}

mkdirSync(out, { recursive: true });
for (const id of wanted) {
  const item = index.items.find((it) => it.id === id);
  if (!item) {
    console.error(`✗ 找不到方案 ${id}`);
    process.exitCode = 1;
    continue;
  }
  const entries = item.files.map((f) => ({ path: f.path, data: readFileSync(join(SOLUTIONS_DIR, id, f.path)) }));
  const { files, filesRef, ...entry } = item;
  entries.push({ path: '.tcsol-entry.json', data: Buffer.from(JSON.stringify({ ...entry, files }, null, 2)) });
  const tgz = writeTarGz(entries);
  const name = `${id}-${item.version}.tgz`;
  writeFileSync(join(out, name), tgz);
  writeFileSync(join(out, `${name}.sha256`), `${sha256(tgz)}  ${name}\n`);
  console.log(`✓ ${name}  ${(tgz.length / 1024).toFixed(0)} KB  ${item.fileCount} 文件`);
}
