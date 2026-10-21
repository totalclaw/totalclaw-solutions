// 第三期：发布策略与远程更新（增量、多版本兼容、渠道、灰度、强制更新、吊销、坏版本隔离、同版本内容变化）
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { LocalSource, SolutionManager, readLock, rolloutBucket } from '../packages/installer/src/index.mjs';
import { digestDir } from '../packages/installer/src/digest.mjs';
import { tmp, write } from './helpers.mjs';

const git = (repo, ...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

function manifest(id, version, extra = {}) {
  return {
    manifestVersion: 2, schemaVersion: 1, id, name: `方案${id}`, aliases: [], version, kind: 'workbench', category: '测试',
    icon: 'icon-solutions', order: 1, description: 'd',
    access: { requiresSolutionGrant: false, feature: null, hidden: false },
    compat: { minAppVersion: extra.minAppVersion || '2.0.0', hostApi: 1 },
    runtime: { mode: 'bundled', runner: 'workbench', route: `/w/${id}`, renderer: null, main: null },
    dependsOn: [], data: { schemaVersion: 1, paths: [`${id}/`], localStorage: [] }, capabilities: [], largeAssets: [],
    ...(extra.release ? { release: extra.release } : {}),
  };
}

/** 与 tools/build-index.mjs 同构：版本历史 + 每版本清单（只增不改） */
function rebuild(repo, removed = []) {
  const items = [];
  for (const id of ['alpha']) {
    const dir = join(repo, 'solutions', id);
    const m = JSON.parse(readFileSync(join(dir, 'solution.json'), 'utf8'));
    const { files, treeDigest } = digestDir(dir);
    const r = m.release || {};
    const release = { channel: r.channel || 'stable', rollout: r.rollout ?? 100, ...(r.minimumVersion ? { minimumVersion: r.minimumVersion } : {}) };
    const detailFile = join(repo, 'index', `${id}.json`);
    const prev = existsSync(detailFile) ? JSON.parse(readFileSync(detailFile, 'utf8')).versions || [] : [];
    const entry = { version: m.version, ref: `${id}@${m.version}`, treeDigest, filesRef: `index/${id}/${m.version}.json`, channel: release.channel, rollout: release.rollout, minAppVersion: m.compat.minAppVersion, hostApi: 1, publishedAt: '2026-10-21' };
    const versions = [entry, ...prev.filter((v) => v.version !== m.version)];
    write(join(repo, 'index', id, `${m.version}.json`), { id, version: m.version, treeDigest, files });
    write(detailFile, { id, version: m.version, treeDigest, files, versions });
    items.push({ ...m, release, path: `solutions/${id}`, fileCount: files.length, size: 1, treeDigest, filesRef: `index/${id}.json` });
  }
  write(join(repo, 'index.json'), { schemaVersion: 2, kind: 'solution-index', removed, items });
}

/** 发布一个版本：写文件 → 重建目录 → 提交 → 打 tag */
function publish(repo, version, { files = {}, ...extra } = {}, removed = []) {
  const dir = join(repo, 'solutions', 'alpha');
  write(join(dir, 'solution.json'), manifest('alpha', version, extra));
  write(join(dir, 'CHANGELOG.md'), `## ${version}\n`);
  for (const [p, c] of Object.entries(files)) write(join(dir, p), c);
  rebuild(repo, removed);
  git(repo, 'add', '-A');
  git(repo, 'commit', '-q', '-m', version);
  git(repo, 'tag', `alpha@${version}`);
}

function setup() {
  const repo = tmp('tcsol-rel-');
  git(repo, 'init', '-q');
  git(repo, 'config', 'user.email', 't@t');
  git(repo, 'config', 'user.name', 't');
  const big = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`src/f${i}.js`, `export const v${i} = ${i};\n`]));
  publish(repo, '1.0.0', { files: big });
  return repo;
}

const mgr = (repo, extra = {}) => new SolutionManager({ root: extra.root || tmp('tcsol-relroot-'), source: new LocalSource(repo), appVersion: '2.0.5', hostApi: 2, ...extra });

test('增量更新：只下载变化的文件，未变化的从本机复用', async () => {
  const repo = setup();
  const m = mgr(repo);
  await m.install('alpha');
  publish(repo, '1.1.0', { files: { 'src/f3.js': 'export const v3 = 33;\n' } });
  m.catalogCache = null;
  const { results } = await m.updateAll();
  const r = results[0];
  assert.equal(r.status, 'updated');
  assert.equal(r.downloaded, 3); // solution.json、CHANGELOG.md、src/f3.js
  assert.equal(r.reused, 9); // 共 12 个文件：10 个源码 + solution.json + CHANGELOG.md
  assert.match(readFileSync(join(m.activePath('alpha'), 'src/f3.js'), 'utf8'), /33/);
});

test('多版本兼容：最新版需要更新的客户端时，旧客户端装最后一个兼容版本（按 tag 取历史文件）', async () => {
  const repo = setup();
  publish(repo, '2.0.0', { minAppVersion: '9.0.0', files: { 'src/f0.js': 'export const v0 = "new";\n' } });
  const m = mgr(repo);
  const r = await m.install('alpha');
  assert.equal(r.version, '1.0.0');
  assert.match(readFileSync(join(m.activePath('alpha'), 'src/f0.js'), 'utf8'), /v0 = 0/);
  assert.equal((await m.checkUpdates()).find((p) => p.id === 'alpha').action, 'up-to-date');
  const newer = mgr(repo, { appVersion: '9.1.0' });
  assert.equal((await newer.install('alpha')).version, '2.0.0');
});

test('渠道：beta 版本只给订阅 beta 的账号', async () => {
  const repo = setup();
  publish(repo, '1.1.0', { release: { channel: 'beta' } });
  assert.equal((await mgr(repo).install('alpha')).version, '1.0.0');
  assert.equal((await mgr(repo, { policy: { channel: 'beta' } }).install('alpha')).version, '1.1.0');
});

test('灰度：按设备分桶命中才可见；账号策略可强制放行', async () => {
  const repo = setup();
  publish(repo, '1.1.0', { release: { rollout: 30 } });
  let inId = null;
  let outId = null;
  for (let i = 0; i < 200 && (!inId || !outId); i++) {
    const d = `dev-${i}`;
    if (rolloutBucket(d, 'alpha', '1.1.0') < 30) inId ||= d;
    else outId ||= d;
  }
  assert.equal((await mgr(repo, { deviceId: inId }).install('alpha')).version, '1.1.0');
  assert.equal((await mgr(repo, { deviceId: outId }).install('alpha')).version, '1.0.0');
  assert.equal((await mgr(repo, { deviceId: outId, policy: { overrides: { alpha: { forceAllowRollout: true } } } }).install('alpha')).version, '1.1.0');
});

test('强制更新：低于 minimumVersion 时无视本机锁定与自动更新开关', async () => {
  const repo = setup();
  const m = mgr(repo);
  await m.install('alpha');
  await m.setPinned('alpha', true);
  await m.setAutoUpdate('alpha', false);
  publish(repo, '1.2.0', { release: { minimumVersion: '1.1.0' } });
  m.catalogCache = null;
  const p = (await m.checkUpdates()).find((x) => x.id === 'alpha');
  assert.equal(p.action, 'update');
  assert.equal(p.forced, 'MINIMUM_VERSION');
  const { results } = await m.updateAll();
  assert.equal(results[0].version, '1.2.0');
});

test('吊销：已装版本被吊销 → 降级到可用的最高版本', async () => {
  const repo = setup();
  publish(repo, '1.1.0');
  const m = mgr(repo);
  assert.equal((await m.install('alpha')).version, '1.1.0');
  rebuild(repo, [{ id: 'alpha', versions: ['1.1.0'], reason: '安全问题' }]);
  m.catalogCache = null;
  const p = (await m.checkUpdates()).find((x) => x.id === 'alpha');
  assert.equal(p.forced, 'REVOKED');
  assert.equal(p.downgrade, true);
  const { results } = await m.updateAll();
  assert.equal(results[0].status, 'downgraded');
  assert.equal(m.get('alpha').version, '1.0.0');
});

test('坏版本：激活失败 → 自动回滚并隔离，之后跳过它，直到出现更高版本', async () => {
  const repo = setup();
  const m = mgr(repo);
  await m.install('alpha');
  publish(repo, '1.1.0');
  m.catalogCache = null;
  await m.updateAll();
  assert.equal(m.get('alpha').pendingHealth, true);
  const r = await m.markBad('alpha', 'ACTIVATION_FAILED');
  assert.equal(r.version, '1.0.0');
  assert.equal(m.get('alpha').pinned, false);
  assert.deepEqual(readLock(m.root).quarantine.alpha.map((q) => q.version), ['1.1.0']);
  assert.equal((await m.checkUpdates()).find((x) => x.id === 'alpha').action, 'up-to-date');
  publish(repo, '1.2.0');
  m.catalogCache = null;
  await m.updateAll();
  assert.equal(m.get('alpha').version, '1.2.0');
  await m.markHealthy('alpha');
  assert.equal(m.get('alpha').pendingHealth, false);
});

test('同版本内容变化：计划为 repair，按目录重装（签名目录下视为重发修正）', async () => {
  const repo = setup();
  const m = mgr(repo);
  await m.install('alpha');
  write(join(repo, 'solutions', 'alpha', 'src', 'f1.js'), 'export const v1 = "hotfix";\n');
  rebuild(repo);
  m.catalogCache = null;
  const p = (await m.checkUpdates()).find((x) => x.id === 'alpha');
  assert.equal(p.action, 'repair');
  await m.updateAll();
  assert.match(readFileSync(join(m.activePath('alpha'), 'src/f1.js'), 'utf8'), /hotfix/);
});

test('账号策略：锁定旧版本（可降级）/ 停用 / 关闭自动更新', async () => {
  const repo = setup();
  publish(repo, '1.1.0');
  const m = mgr(repo);
  await m.install('alpha');
  m.setPolicy({ overrides: { alpha: { pinVersion: '1.0.0' } } });
  const p = (await m.checkUpdates()).find((x) => x.id === 'alpha');
  assert.equal(p.to, '1.0.0');
  assert.equal(p.downgrade, true);
  await m.updateAll();
  assert.equal(m.get('alpha').version, '1.0.0');
  m.setPolicy({ autoUpdate: false });
  assert.equal((await m.checkUpdates()).find((x) => x.id === 'alpha').reason, 'POLICY_AUTO_UPDATE_OFF');
  m.setPolicy({ overrides: { alpha: { block: true } } });
  assert.equal((await m.checkUpdates()).find((x) => x.id === 'alpha').reason, 'POLICY_BLOCK');
  await assert.rejects(m.install('alpha', { force: true }), { code: 'POLICY_BLOCK' });
});
