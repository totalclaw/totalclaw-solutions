#!/usr/bin/env node
// 给 index.json 签名，生成 index.json.sig（ed25519，base64）。在发布机 / CI 上于 `npm run index` 之后执行。
//
// 用法：
//   TCSOL_SIGNING_KEY=/安全路径/solution-index.key node tools/sign-index.mjs        # 签名
//   node tools/sign-index.mjs --verify [--pub registry/solution-index.pub]          # 校验
//   node tools/sign-index.mjs --gen-keypair <输出目录>                               # 生成密钥对（目录不得在仓库内）
//
// 公钥放 registry/solution-index.pub 并随 qiye-app 发布；私钥只放发布机 / CI 密钥库，绝不入库。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { generateSigningKeyPair, signIndex, verifyIndexSignature } from '../packages/installer/src/signature.mjs';
import { REPO_ROOT, parseArgs } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const indexFile = join(REPO_ROOT, 'index.json');
const sigFile = join(REPO_ROOT, 'index.json.sig');

if (args['gen-keypair']) {
  const out = resolve(String(args['gen-keypair']));
  if (!relative(REPO_ROOT, out).startsWith('..')) {
    console.error('✗ 密钥对不能生成在方案仓库目录内（私钥绝不入库）');
    process.exit(2);
  }
  mkdirSync(out, { recursive: true });
  const { publicKey, privateKey } = generateSigningKeyPair();
  writeFileSync(join(out, 'solution-index.key'), privateKey, { mode: 0o600 });
  writeFileSync(join(out, 'solution-index.pub'), publicKey);
  console.log(`✓ 已生成 ${out}/solution-index.key（私钥，妥善保管）与 solution-index.pub（复制到 registry/）`);
} else if (args.verify) {
  const pub = resolve(REPO_ROOT, String(args.pub || 'registry/solution-index.pub'));
  if (!existsSync(sigFile) || !existsSync(pub)) {
    console.log('· 未配置签名（缺少 index.json.sig 或公钥），跳过');
    process.exit(0);
  }
  const ok = verifyIndexSignature(readFileSync(indexFile), Buffer.from(readFileSync(sigFile, 'utf8').trim(), 'base64'), readFileSync(pub, 'utf8'));
  console.log(ok ? '✓ index.json 签名有效' : '✗ index.json 签名无效');
  process.exit(ok ? 0 : 1);
} else {
  const keyPath = process.env.TCSOL_SIGNING_KEY;
  if (!keyPath || !existsSync(keyPath)) {
    console.error('✗ 请用 TCSOL_SIGNING_KEY 指定私钥文件路径');
    process.exit(2);
  }
  writeFileSync(sigFile, signIndex(readFileSync(indexFile), readFileSync(keyPath, 'utf8')) + '\n');
  console.log('✓ 已写入 index.json.sig');
}
