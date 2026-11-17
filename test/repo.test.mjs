// 对真实方案仓库的端到端校验：30 个授权方案齐全、全部可安装、发布包可离线安装。
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { LocalSource, SolutionManager, TarballSource, semver } from '../packages/installer/src/index.mjs';
import { REPO_ROOT } from '../tools/lib/common.mjs';
import { tmp } from './helpers.mjs';

const index = JSON.parse(readFileSync(join(REPO_ROOT, 'index.json'), 'utf8'));
const web = JSON.parse(readFileSync(join(REPO_ROOT, 'registry', 'web-solution-ids.json'), 'utf8')).items;

test('totalclaw-web 目录中的方案 id 全部在仓库中（原 30 个 + 4 个市场包改为需授权 + 智能金融助手）', () => {
  assert.equal(web.length, 35);
  const ids = new Set(index.items.map((it) => it.id));
  assert.deepEqual(web.map((w) => w.id).filter((id) => !ids.has(id)), []);
});

test('validate 通过、index/catalog 为最新', () => {
  execFileSync(process.execPath, [join(REPO_ROOT, 'tools', 'validate.mjs')], { cwd: REPO_ROOT, stdio: 'pipe' });
});

test('catalog.json 兼容旧版 qiye-app（parseCatalog 必填字段）', () => {
  const catalog = JSON.parse(readFileSync(join(REPO_ROOT, 'catalog.json'), 'utf8'));
  assert.equal(catalog.kind, 'solution');
  for (const it of catalog.items) for (const k of ['id', 'name', 'category', 'version', 'path']) assert.ok(it[k], `${it.id}.${k}`);
  assert.ok(catalog.items.some((it) => it.id === 'material-to-table'));
  assert.ok(!catalog.items.some((it) => it.id.startsWith('workbench-')), '内置工作台不进旧市场目录');
});

test('全部方案可从本地仓库安装并通过校验', { timeout: 180_000 }, async () => {
  // 最老的宿主（2.0.5）：有兼容版本的方案退到兼容版本装上；只有新版本、需要更新客户端的新方案必须报 APP_TOO_OLD
  const old = new SolutionManager({ root: tmp('tcsol-all-'), source: new LocalSource(REPO_ROOT), appVersion: '2.0.5', hostApi: 2 });
  // 历史版本在 index/<id>.json（index.json 只放摘要）
  const versionsOf = (it) => JSON.parse(readFileSync(join(REPO_ROOT, it.filesRef), 'utf8')).versions || [];
  const tooNew = (it) => versionsOf(it).every((v) => v.minAppVersion && semver.gt(v.minAppVersion, '2.0.5'));
  for (const it of index.items) {
    if (tooNew(it)) await assert.rejects(old.install(it.id, { withDependencies: false }), { code: 'APP_TOO_OLD' }, it.id);
    else await old.install(it.id);
  }
  assert.deepEqual(old.verify().filter((v) => !v.ok), []);
  // 目录里要求最高的宿主：全部方案都装最新版并通过校验
  const newest = index.items.map((it) => it.compat?.minAppVersion).filter(Boolean).reduce((a, v) => (semver.gt(v, a) ? v : a), '2.0.5');
  const mgr = new SolutionManager({ root: tmp('tcsol-all-'), source: new LocalSource(REPO_ROOT), appVersion: newest, hostApi: 2 });
  for (const it of index.items) await mgr.install(it.id);
  assert.equal(mgr.list().length, index.items.length);
  const bad = mgr.verify().filter((v) => !v.ok);
  assert.deepEqual(bad, []);
});

test('发布包：pack → 离线安装', async () => {
  const out = tmp('tcsol-dist-');
  execFileSync(process.execPath, [join(REPO_ROOT, 'tools', 'pack.mjs'), 'material-to-table', 'workbench-academic-writer', '--out', out], { cwd: REPO_ROOT, stdio: 'pipe' });
  for (const id of ['material-to-table', 'workbench-academic-writer']) {
    const it = index.items.find((x) => x.id === id);
    const mgr = new SolutionManager({ root: tmp(), source: new TarballSource(join(out, `${id}-${it.version}.tgz`)), hostApi: 2 });
    assert.equal((await mgr.install(id, { withDependencies: false })).status, 'installed');
    assert.ok(mgr.verify(id)[0].ok);
  }
});
