#!/usr/bin/env node
// 按 qiye-app 的宿主 SDK 清单（apps/desktop-shell/solution-sdk.json）剥离方案包里的公共文件：
//   - 方案包内删除这些文件，origin.json 把它们从 files 移到 sdkFiles（来源追溯不丢）
//   - kit 整体成为宿主 SDK：删除 kit 方案目录，并从其他方案的 dependsOn 中去掉
//   - 剥离后方案之间不再互相引用代码（共用部分都在宿主），dependsOn 清空
// 用法：node tools/apply-sdk.mjs [--qiye <qiye-app 根目录>]
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { REPO_ROOT, SOLUTIONS_DIR, parseArgs, readJson, writeJson } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const QIYE = resolve(args.qiye || process.env.TOTALCLAW_QIYE_APP_DIR || join(REPO_ROOT, '..', 'totalclaw-qiye-app'));
const sdk = new Set(readJson(join(QIYE, 'apps', 'desktop-shell', 'solution-sdk.json')).files);
const repoRel = (from) => (from.startsWith('resources/') || from.startsWith('packages/') ? from : `apps/desktop-shell/src/${from}`);

const kits = [];
let moved = 0;
for (const id of readdirSync(SOLUTIONS_DIR).sort()) {
  const dir = join(SOLUTIONS_DIR, id);
  const originFile = join(dir, 'origin.json');
  if (!existsSync(originFile)) continue;
  const manifest = readJson(join(dir, 'solution.json'));
  if (manifest.kind === 'kit') {
    kits.push(id);
    rmSync(dir, { recursive: true, force: true });
    console.log(`✓ ${id}：kit 整体并入宿主 SDK，已删除`);
    continue;
  }
  const origin = readJson(originFile);
  const keep = [];
  const sdkFiles = [...(origin.sdkFiles || [])];
  for (const f of origin.files) {
    if (sdk.has(repoRel(f.from))) {
      rmSync(join(dir, f.path), { force: true });
      sdkFiles.push(f);
      moved++;
    } else keep.push(f);
  }
  origin.files = keep;
  origin.sdkFiles = sdkFiles;
  writeJson(originFile, origin);
}

// 清理空目录
function prune(d) {
  if (!existsSync(d)) return;
  for (const n of readdirSync(d, { withFileTypes: true })) if (n.isDirectory()) prune(join(d, n.name));
  if (!readdirSync(d).length) rmSync(d, { recursive: true });
}
for (const id of readdirSync(SOLUTIONS_DIR)) for (const sub of ['src', 'resources']) prune(join(SOLUTIONS_DIR, id, sub));

for (const id of readdirSync(SOLUTIONS_DIR)) {
  const f = join(SOLUTIONS_DIR, id, 'solution.json');
  if (!existsSync(f)) continue;
  const m = readJson(f);
  if (m.dependsOn?.length) {
    m.dependsOn = [];
    writeJson(f, m);
  }
}
console.log(`✓ 移出 ${moved} 个 SDK 文件；删除 kit：${kits.join(', ') || '无'}；dependsOn 已清空（共用代码都在宿主）`);
