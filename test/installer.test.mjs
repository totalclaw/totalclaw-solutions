import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  DowngradeError,
  GiteeSource,
  LocalSource,
  SolutionManager,
  TarballSource,
  readLock,
  recoverJournal,
  semver,
  writeTarGz,
} from '../packages/installer/src/index.mjs';
import { assertSafeRelPath } from '../packages/installer/src/fsutil.mjs';
import { readTar } from '../packages/installer/src/tar.mjs';
import { fakeGiteeFetch, putSolution, rebuildIndex, tmp, write } from './helpers.mjs';

function setup() {
  const repo = tmp('tcsol-repo-');
  const root = tmp('tcsol-root-');
  const data = tmp('tcsol-data-');
  putSolution(repo, 'alpha', '1.0.0', { name: '甲方案', aliases: ['甲'] });
  putSolution(repo, 'beta', '1.0.0', { name: '乙方案', dependsOn: ['alpha'] });
  const mgr = new SolutionManager({ root, source: new LocalSource(repo), appVersion: '2.0.5' });
  return { repo, root, data, mgr };
}

test('semver 比较', () => {
  assert.ok(semver.gt('1.10.0', '1.9.9'));
  assert.ok(semver.gt('1.0.0', '1.0.0-rc.1'));
  assert.ok(semver.lt('1.0.0-rc.2', '1.0.0-rc.10'));
  assert.equal(semver.diff('1.2.3', '2.0.0'), 'major');
  assert.equal(semver.valid('1.0'), false);
});

test('路径安全：拒绝 .. / 绝对路径 / 反斜杠', () => {
  for (const bad of ['../x', 'a/../../x', '/etc/passwd', 'C:/x', 'a\\b', '']) assert.throws(() => assertSafeRelPath(bad));
  assert.equal(assertSafeRelPath('src/a.ts'), 'src/a.ts');
});

test('tar 读写往返（含长路径与中文文件名）', () => {
  const long = `${'深'.repeat(40)}/文件.md`;
  const tgz = writeTarGz([
    { path: 'a.txt', data: Buffer.from('A') },
    { path: long, data: Buffer.from('长路径') },
  ]);
  const files = readTar(tgz);
  assert.equal(files.get('a.txt').toString(), 'A');
  assert.equal(files.get(long).toString(), '长路径');
  assert.deepEqual(writeTarGz([{ path: 'a.txt', data: Buffer.from('A') }]), writeTarGz([{ path: 'a.txt', data: Buffer.from('A') }]), '确定性输出');
});

test('按 id / 名称 / 别名解析，歧义与不存在报错', async () => {
  const { mgr } = setup();
  assert.equal((await mgr.resolve('alpha')).id, 'alpha');
  assert.equal((await mgr.resolve('甲方案')).id, 'alpha');
  assert.equal((await mgr.resolve('甲')).id, 'alpha');
  await assert.rejects(mgr.resolve('方案'), { code: 'AMBIGUOUS' });
  await assert.rejects(mgr.resolve('不存在'), { code: 'NOT_FOUND' });
});

test('安装：自动带上依赖，重复安装幂等', async () => {
  const { mgr, root } = setup();
  const r = await mgr.install('乙方案');
  assert.equal(r.status, 'installed');
  assert.equal(r.dependencies[0].id, 'alpha');
  assert.deepEqual(mgr.list().map((x) => x.id).sort(), ['alpha', 'beta']);
  assert.equal((await mgr.install('beta')).status, 'unchanged');
  assert.ok(mgr.verify().every((v) => v.ok));
  assert.ok(!existsSync(join(root, '.staging', 'x')));
});

test('升级：检测新版本 → 升级 → 旧版本保留为 previous，用户数据字节不变', async () => {
  const { repo, mgr, data } = setup();
  await mgr.install('alpha');
  write(join(data, 'alpha', 'state.json'), '{"memory":"用户记忆"}');
  const before = readFileSync(join(data, 'alpha', 'state.json'));

  putSolution(repo, 'alpha', '1.1.0', { name: '甲方案' });
  mgr.catalogCache = null;
  const plan = await mgr.checkUpdates();
  assert.deepEqual(plan.map((p) => [p.id, p.action, p.to]), [['alpha', 'update', '1.1.0']]);
  const { results } = await mgr.updateAll();
  assert.equal(results[0].status, 'updated');
  const cur = mgr.get('alpha');
  assert.equal(cur.version, '1.1.0');
  assert.equal(cur.previous.version, '1.0.0');
  assert.ok(existsSync(join(mgr.root, cur.previous.path)));
  assert.match(readFileSync(join(mgr.activePath('alpha'), 'src/main.js'), 'utf8'), /1\.1\.0/);
  assert.deepEqual(readFileSync(join(data, 'alpha', 'state.json')), before);

  // 再升级一次：只保留 active + previous 两个目录
  putSolution(repo, 'alpha', '1.2.0', { name: '甲方案' });
  mgr.catalogCache = null;
  await mgr.updateAll();
  const { readdirSync } = await import('node:fs');
  assert.equal(readdirSync(join(mgr.root, 'alpha')).length, 2);
});

test('自动升级跳过：锁定、关闭自动更新、宿主版本过低、新增能力需确认', async () => {
  const { repo, mgr } = setup();
  await mgr.install('beta');
  await mgr.setPinned('alpha', true);
  await mgr.setAutoUpdate('beta', false);
  putSolution(repo, 'alpha', '2.0.0', { name: '甲方案' });
  putSolution(repo, 'beta', '2.0.0', { name: '乙方案', dependsOn: ['alpha'] });
  mgr.catalogCache = null;
  let plan = Object.fromEntries((await mgr.checkUpdates()).map((p) => [p.id, p]));
  assert.equal(plan.alpha.reason, 'PINNED');
  assert.equal(plan.beta.reason, 'AUTO_UPDATE_OFF');

  await mgr.setPinned('alpha', false);
  putSolution(repo, 'alpha', '2.0.0', { name: '甲方案', compat: { minAppVersion: '9.0.0' } });
  mgr.catalogCache = null;
  plan = Object.fromEntries((await mgr.checkUpdates()).map((p) => [p.id, p]));
  assert.equal(plan.alpha.reason, 'APP_TOO_OLD');

  putSolution(repo, 'alpha', '2.0.0', { name: '甲方案', capabilities: ['network'] });
  mgr.catalogCache = null;
  plan = Object.fromEntries((await mgr.checkUpdates()).map((p) => [p.id, p]));
  assert.equal(plan.alpha.reason, 'NEEDS_CONSENT');
  await mgr.acceptCapabilities('alpha', ['network']);
  plan = Object.fromEntries((await mgr.checkUpdates({ refresh: false })).map((p) => [p.id, p]));
  assert.equal(plan.alpha.action, 'update');
});

test('回滚：切回上一版本并自动锁定', async () => {
  const { repo, mgr } = setup();
  await mgr.install('alpha');
  putSolution(repo, 'alpha', '1.1.0', { name: '甲方案' });
  mgr.catalogCache = null;
  await mgr.update('alpha');
  const r = await mgr.rollback('alpha');
  assert.equal(r.version, '1.0.0');
  assert.equal(mgr.get('alpha').pinned, true);
  assert.equal((await mgr.checkUpdates())[0].reason, 'PINNED');
});

test('卸载：默认保留数据并写 tombstone，授权同步不会自动重装；purgeData 只删声明路径', async () => {
  const { mgr, data } = setup();
  await mgr.install('alpha');
  write(join(data, 'alpha', 'state.json'), '{}');
  write(join(data, 'memory', 'keep.md'), '宿主记忆');
  const r = await mgr.uninstall('alpha');
  assert.equal(r.keptData, true);
  assert.ok(existsSync(join(data, 'alpha', 'state.json')));
  assert.equal((await mgr.install('alpha', { reason: 'granted' })).status, 'skipped');
  assert.equal((await mgr.install('alpha', { reason: 'manual' })).status, 'installed');

  await mgr.uninstall('alpha', { purgeData: true, dataRoots: [data] });
  assert.ok(!existsSync(join(data, 'alpha')));
  assert.ok(existsSync(join(data, 'memory', 'keep.md')), '宿主记忆不受影响');
});

test('数据迁移：快照 → 执行 → 记录版本；失败回滚；拒绝降级', async () => {
  const { repo, mgr, data } = setup();
  write(join(data, 'alpha', 'state.json'), JSON.stringify({ items: ['a'] }));
  putSolution(repo, 'alpha', '2.0.0', {
    name: '甲方案',
    dataSchemaVersion: 2,
    files: {
      'migrations/001-wrap.mjs': `export default { from: 1, to: 2, up(ctx) { const s = ctx.readJson('alpha/state.json'); ctx.writeJson('alpha/state.json', { version: 2, list: s.items }); } };\n`,
    },
  });
  await mgr.install('alpha');
  const r = await mgr.migrate('alpha', data);
  assert.deepEqual([r.from, r.to, r.steps], [1, 2, ['001-wrap.mjs']]);
  assert.deepEqual(JSON.parse(readFileSync(join(data, 'alpha', 'state.json'), 'utf8')), { version: 2, list: ['a'] });
  assert.ok(existsSync(join(r.backup, 'alpha', 'state.json')), '迁移前快照');
  assert.equal((await mgr.migrate('alpha', data)).steps.length, 0, '幂等');

  // 失败：恢复快照、版本不变
  putSolution(repo, 'alpha', '3.0.0', {
    name: '甲方案',
    dataSchemaVersion: 3,
    files: {
      'migrations/001-wrap.mjs': `export default { from: 1, to: 2, up() {} };\n`,
      'migrations/002-break.mjs': `export default { from: 2, to: 3, up(ctx) { ctx.writeJson('alpha/state.json', { broken: true }); throw new Error('boom'); } };\n`,
    },
  });
  mgr.catalogCache = null;
  await mgr.update('alpha');
  await assert.rejects(mgr.migrate('alpha', data), { code: 'MIGRATION_FAILED' });
  assert.deepEqual(JSON.parse(readFileSync(join(data, 'alpha', 'state.json'), 'utf8')), { version: 2, list: ['a'] });

  // 降级：数据 v2，代码回滚到 v1 → 拒绝
  await mgr.rollback('alpha'); // 回到 2.0.0（数据 v2，可用）
  await mgr.rollback('alpha'); // previous 现在是 3.0.0，再滚一次回到 3.0.0
  writeFileSync(join(data, '.solution-data', 'alpha.json'), JSON.stringify({ schemaVersion: 9 }));
  await assert.rejects(mgr.migrate('alpha', data), (e) => e instanceof DowngradeError);
});

test('崩溃恢复：pending 日志 → 清理半成品、锁文件不变', async () => {
  const { mgr, root } = setup();
  await mgr.install('alpha');
  const orphan = join(root, 'alpha', '9.9.9+deadbeef');
  write(join(orphan, 'solution.json'), '{}');
  write(join(root, '.journal.json'), { state: 'pending', id: 'alpha', target: orphan });
  write(join(root, '.staging', 'x', 'f'), 'half');
  const r = recoverJournal(root);
  assert.equal(r.action, 'rollback');
  assert.ok(!existsSync(orphan));
  assert.ok(!existsSync(join(root, '.staging')));
  assert.equal(readLock(root).items.alpha.version, '1.0.0');
});

test('哈希不符：拒绝安装，不留下半成品', async () => {
  const { repo, mgr, root } = setup();
  writeFileSync(join(repo, 'solutions', 'alpha', 'src', 'main.js'), 'tampered');
  await assert.rejects(mgr.install('alpha'), { code: 'HASH_MISMATCH' });
  assert.equal(readLock(root).items.alpha, undefined);
  assert.ok(!existsSync(join(root, 'alpha')));
});

test('下架方案拒绝安装，已安装的 checkUpdates 标记 delisted', async () => {
  const { repo, mgr } = setup();
  await mgr.install('alpha');
  rebuildIndex(repo, { removed: [{ id: 'alpha', reason: '安全问题' }] });
  mgr.catalogCache = null;
  await assert.rejects(mgr.install('alpha', { force: true }), { code: 'DELISTED' });
  assert.equal((await mgr.checkUpdates()).find((p) => p.id === 'alpha').action, 'delisted');
});

test('GiteeSource：按 commit 快照逐文件下载', async () => {
  const { repo } = setup();
  const log = [];
  const sha = 'b'.repeat(40);
  const mgr = new SolutionManager({ root: tmp(), source: new GiteeSource({ fetch: fakeGiteeFetch(repo, { sha, log }) }) });
  await mgr.install('beta');
  assert.ok(log.some((u) => u.includes(`/raw/${sha}/index.json`)));
  assert.ok(log.filter((u) => u.includes('/raw/')).every((u) => u.includes(`/raw/${sha}/`)), '全部文件来自同一提交');
  assert.equal(mgr.get('beta').source.ref, sha);
});

test('GiteeSource：文件数超过阈值走整仓归档', async () => {
  const { repo } = setup();
  const log = [];
  const mgr = new SolutionManager({
    root: tmp(),
    archiveThreshold: 0,
    source: new GiteeSource({ fetch: fakeGiteeFetch(repo, { log, failRaw: true }) }),
  });
  await mgr.install('alpha');
  assert.ok(log.some((u) => u.includes('/repository/archive/')));
  assert.ok(mgr.verify('alpha')[0].ok);
});

test('TarballSource：离线发布包安装', async () => {
  const { repo } = setup();
  const index = JSON.parse(readFileSync(join(repo, 'index.json'), 'utf8'));
  const item = index.items.find((it) => it.id === 'alpha');
  const detail = JSON.parse(readFileSync(join(repo, item.filesRef), 'utf8'));
  const { filesRef, ...entry } = item;
  const entries = detail.files.map((f) => ({ path: f.path, data: readFileSync(join(repo, item.path, f.path)) }));
  entries.push({ path: '.tcsol-entry.json', data: Buffer.from(JSON.stringify({ ...entry, files: detail.files })) });
  const file = join(tmp(), 'alpha-1.0.0.tgz');
  writeFileSync(file, writeTarGz(entries));
  const mgr = new SolutionManager({ root: tmp(), source: new TarballSource(file) });
  assert.equal((await mgr.install('alpha')).status, 'installed');
  assert.ok(mgr.verify('alpha')[0].ok);
});

test('并发安装请求串行执行，锁文件不损坏', async () => {
  const { mgr } = setup();
  const rs = await Promise.all([mgr.install('alpha'), mgr.install('beta'), mgr.install('alpha')]);
  assert.ok(rs.every((r) => ['installed', 'unchanged'].includes(r.status)));
  assert.deepEqual(Object.keys(readLock(mgr.root).items).sort(), ['alpha', 'beta']);
});

test('签名目录：公钥验签通过才使用；篡改 / 缺签名拒绝', async () => {
  const { generateSigningKeyPair, signIndex } = await import('../packages/installer/src/signature.mjs');
  const { repo } = setup();
  const { publicKey, privateKey } = generateSigningKeyPair();
  const sign = () => writeFileSync(join(repo, 'index.json.sig'), signIndex(readFileSync(join(repo, 'index.json')), privateKey));
  const mk = () => new SolutionManager({ root: tmp(), source: new LocalSource(repo), publicKey });

  await assert.rejects(mk().install('alpha'), { code: 'SIGNATURE_MISSING' });
  sign();
  assert.equal((await mk().install('alpha')).status, 'installed');

  // 签名后改目录（例如把某方案的 treeDigest 换掉）→ 拒绝
  const idx = JSON.parse(readFileSync(join(repo, 'index.json'), 'utf8'));
  idx.items[0].version = '9.9.9';
  writeFileSync(join(repo, 'index.json'), JSON.stringify(idx));
  await assert.rejects(mk().install('alpha'), { code: 'SIGNATURE_INVALID' });
});
