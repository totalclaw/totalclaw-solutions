#!/usr/bin/env node
// 生成 index.json（v2 全量目录）与 catalog.json（v1，兼容旧版 qiye-app 市场，只含 runner / pipeline）。
//
// 用法：node tools/build-index.mjs [--check]
//   --check  只比对，生成物与已提交内容不一致时退出码 1（CI 用）
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { REPO_ROOT, SOLUTIONS_DIR, fileManifest, listSolutionDirs, parseArgs, readJson, treeDigest as treeDigestOf } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));

const SOURCE = {
  repo: 'https://gitee.com/jlzdyx/totalclaw-solutions',
  branch: 'master',
  raw: 'https://gitee.com/jlzdyx/totalclaw-solutions/raw/{ref}/{path}',
  archive: 'https://gitee.com/jlzdyx/totalclaw-solutions/repository/archive/{ref}.tar.gz',
  refApi: 'https://gitee.com/api/v5/repos/jlzdyx/totalclaw-solutions/branches/master',
};

/** 取 CHANGELOG.md 中当前版本一节（最多 1200 字） */
export function changelogSection(dir, version) {
  const file = join(dir, 'CHANGELOG.md');
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const re = new RegExp(`^##\\s+\\[?v?${version.replace(/\./g, '\\.')}\\]?.*$`, 'm');
  const m = re.exec(text);
  if (!m) return null;
  const rest = text.slice(m.index + m[0].length);
  const next = rest.search(/^##\s+/m);
  return (next >= 0 ? rest.slice(0, next) : rest).trim().slice(0, 1200) || null;
}

/** 发布策略：渠道 / 灰度比例 / 强制最低版本（缺省 stable、全量、无强制） */
export function releaseOf(m) {
  const r = m.release || {};
  return {
    channel: r.channel || 'stable',
    rollout: Number.isFinite(r.rollout) ? r.rollout : 100,
    ...(r.minimumVersion ? { minimumVersion: r.minimumVersion } : {}),
  };
}

function gitTagExists(tag) {
  try {
    execFileSync('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], { cwd: REPO_ROOT, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 版本历史：沿用已提交的 index/<id>.json 的 versions，当前版本替换 / 追加。
 * 已打 tag（已发布）的版本内容不可变：同版本摘要变了直接报错（必须升版本号）。
 */
function versionHistory(item, m, files) {
  const detailFile = join(REPO_ROOT, item.filesRef);
  const prev = existsSync(detailFile) ? readJson(detailFile).versions || [] : [];
  const tag = `${item.id}@${item.version}`;
  const same = prev.find((v) => v.version === item.version);
  if (same && same.treeDigest !== item.treeDigest && gitTagExists(tag)) {
    throw new Error(`${item.id}@${item.version} 已发布（tag ${tag}），内容不可再改：请提升版本号`);
  }
  const entry = {
    version: item.version,
    ref: tag,
    treeDigest: item.treeDigest,
    filesRef: `index/${item.id}/${item.version}.json`,
    channel: item.release.channel,
    rollout: item.release.rollout,
    minAppVersion: m.compat?.minAppVersion,
    hostApi: m.compat?.hostApi ?? 1,
    publishedAt: same && same.treeDigest === item.treeDigest ? same.publishedAt : new Date().toISOString().slice(0, 10),
  };
  const versions = [entry, ...prev.filter((v) => v.version !== item.version)].slice(0, 30);
  return { versions, versionFile: { id: item.id, version: item.version, treeDigest: item.treeDigest, files } };
}

export function buildIndex() {
  const items = [];
  for (const id of listSolutionDirs()) {
    const dir = join(SOLUTIONS_DIR, id);
    const m = readJson(join(dir, 'solution.json'));
    // distribution.files：只把运行所需文件发布给客户端（源码、测试、来源追溯留在仓库）
    const publish = Array.isArray(m.distribution?.files) ? m.distribution.files : null;
    const all = fileManifest(dir).files;
    const files = publish ? all.filter((f) => publish.some((p) => (p.endsWith('/') ? f.path.startsWith(p) : f.path === p))) : all;
    const treeDigest = treeDigestOf(files);
    items.push({
      id: m.id,
      name: m.name,
      aliases: m.aliases || [],
      kind: m.kind,
      category: m.category,
      icon: m.icon,
      order: m.order ?? 1000,
      description: m.description,
      ...(m.descriptionEn ? { descriptionEn: m.descriptionEn } : {}),
      ...(m.descriptionAr ? { descriptionAr: m.descriptionAr } : {}),
      version: m.version,
      release: releaseOf(m),
      compat: m.compat,
      access: m.access,
      runtime: m.runtime,
      dependsOn: m.dependsOn || [],
      data: m.data,
      capabilities: m.capabilities || [],
      ...(m.legion ? { legion: m.legion } : {}),
      path: `solutions/${id}`,
      fileCount: files.length,
      size: files.reduce((n, f) => n + f.size, 0),
      treeDigest,
      largeAssets: m.largeAssets || [],
      changelog: changelogSection(dir, m.version),
      filesRef: `index/${id}.json`,
      files,
    });
    const it = items[items.length - 1];
    Object.assign(it, versionHistory(it, m, files));
  }
  items.sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1));
  const removedFile = join(REPO_ROOT, 'removed.json');
  const removed = existsSync(removedFile) ? readJson(removedFile).items || [] : [];
  return { schemaVersion: 2, kind: 'solution-index', source: SOURCE, removed, items };
}

/** v1 目录：字段与 qiye-app packages/package-hub parseCatalog 兼容 */
export function buildLegacyCatalog(index) {
  return {
    schemaVersion: 1,
    kind: 'solution',
    items: index.items
      .filter((it) => it.kind === 'runner' || it.kind === 'pipeline')
      .filter((it) => !index.removed.some((r) => r.id === it.id && !r.versions))
      .map((it) => ({
        id: it.id,
        name: it.name,
        description: it.description.length > 150 ? it.description.slice(0, 150) : it.description,
        category: it.category,
        version: it.version,
        icon: it.icon,
        path: it.path,
        files: ['solution.json'],
      })),
  };
}

const stringify = (v) => JSON.stringify(v, null, 2) + '\n';

/** index.json 只放摘要（客户端频繁拉取）；逐文件清单拆到 index/<id>.json，安装时按需取 */
export function splitIndex(index) {
  const summary = { ...index, items: index.items.map(({ files, versions, versionFile, ...rest }) => rest) };
  const perItem = Object.fromEntries(
    index.items.map((it) => [it.filesRef, { id: it.id, version: it.version, treeDigest: it.treeDigest, files: it.files, versions: it.versions }]),
  );
  // 每个版本的文件清单（只增不改；历史版本从这里取清单、按 tag 取文件）
  const perVersion = Object.fromEntries(index.items.map((it) => [it.versions[0].filesRef, it.versionFile]));
  return { summary, perItem, perVersion };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const index = buildIndex();
  const { summary, perItem, perVersion } = splitIndex(index);
  const outputs = {
    'index.json': stringify(summary),
    'catalog.json': stringify(buildLegacyCatalog(index)),
    ...Object.fromEntries(Object.entries(perItem).map(([k, v]) => [k, stringify(v)])),
    ...Object.fromEntries(Object.entries(perVersion).map(([k, v]) => [k, stringify(v)])),
  };
  // 已删除方案遗留的 index/<id>.json（版本子目录只增不删：老客户端可能还要按它装历史版本）
  const indexDir = join(REPO_ROOT, 'index');
  for (const f of existsSync(indexDir) ? readdirSync(indexDir).filter((n) => n.endsWith('.json')) : []) {
    if (outputs[`index/${f}`]) continue;
    if (args.check) {
      console.error(`✗ index/${f} 已无对应方案`);
      process.exitCode = 1;
    } else rmSync(join(indexDir, f));
  }
  let stale = 0;
  for (const [name, content] of Object.entries(outputs)) {
    const file = join(REPO_ROOT, name);
    const old = existsSync(file) ? readFileSync(file, 'utf8') : '';
    if (old === content) continue;
    if (args.check) {
      console.error(`✗ ${name} 不是最新，请运行 npm run index`);
      stale++;
    } else {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
      if (!name.startsWith('index/')) console.log(`✓ 写入 ${name}`);
    }
  }
  if (args.check && stale) process.exit(1);
  const total = index.items.reduce((n, it) => n + it.size, 0);
  console.log(`方案 ${index.items.length} 个，文件 ${index.items.reduce((n, it) => n + it.fileCount, 0)} 个，${(total / 1024 / 1024).toFixed(1)} MB`);
}
