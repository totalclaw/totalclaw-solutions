// SolutionManager：按 id / 名称安装方案、检查与应用升级、回滚、卸载、校验修复。
//
// 本地布局（root 由宿主指定，如 qiye-app 的 userData/solution-packages）：
//   installed.json            锁文件
//   .journal.json             发布日志
//   .staging/<uuid>/          下载与校验区
//   .trash/                   待删旧版本
//   <id>/<version>+<digest8>/ 只读代码目录
//
// 安装器只写 root 内的路径；用户数据（账号目录）只在 uninstall({purgeData}) 时按清单声明删除，
// 迁移在 migrate.mjs，由宿主在账号进入方案时调用。
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { digestDir, sha256, treeDigest } from './digest.mjs';
import { assertSafeRelPath, ensureDir, moveDir, readJsonFile, rmrf, safeJoin } from './fsutil.mjs';
import { beginJournal, clearJournal, commitJournal, recoverJournal } from './journal.mjs';
import { DirLock, readLock, writeLock } from './lock.mjs';
import { migrateData, ownedDataPaths } from './migrate.mjs';
import * as semver from './semver.mjs';
import { COMMIT_RE } from './sources.mjs';

export class SolutionError extends Error {
  constructor(code, message, extra = {}) {
    super(message);
    this.code = code;
    Object.assign(this, extra);
  }
}

const CATALOG_TTL_MS = 5 * 60_000;

function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[\s·・\-_（）()【】[\]「」"'“”]/g, '');
}

async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

export class SolutionManager {
  /**
   * @param {object} opts
   * @param {string} opts.root            安装根目录
   * @param {object} opts.source          来源（GiteeSource / LocalSource / TarballSource）
   * @param {string} [opts.appVersion]    宿主版本，用于 compat.minAppVersion
   * @param {number} [opts.hostApi]       宿主 SDK 版本，用于 compat.hostApi
   * @param {number} [opts.concurrency]   逐文件下载并发
   * @param {number} [opts.archiveThreshold] 文件数超过此值优先整包下载
   * @param {(evt:object)=>void} [opts.onProgress]
   * @param {(msg:string)=>void} [opts.log]
   */
  constructor({ root, source, appVersion = '999.0.0', hostApi = 1, concurrency = 6, archiveThreshold = 300, onProgress, log } = {}) {
    if (!root) throw new Error('SolutionManager 需要 root');
    if (!source) throw new Error('SolutionManager 需要 source');
    Object.assign(this, { root, source, appVersion, hostApi, concurrency, archiveThreshold });
    this.onProgress = onProgress || (() => {});
    this.log = log || (() => {});
    this.lockFile = new DirLock(ensureDir(root));
    this.catalogCache = null;
  }

  // ── 目录 ──────────────────────────────────────────────────────────

  /** 取目录快照 { ref, index }；默认 5 分钟内存缓存 */
  async catalog({ refresh = false } = {}) {
    if (!refresh && this.catalogCache && Date.now() - this.catalogCache.at < CATALOG_TTL_MS) return this.catalogCache;
    const ref = await this.source.resolveRef();
    const index = await this.source.fetchIndex(ref);
    if (!index || !Array.isArray(index.items)) throw new SolutionError('BAD_INDEX', '方案目录格式错误');
    this.catalogCache = { ref, index, at: Date.now() };
    return this.catalogCache;
  }

  /**
   * 按 id / 名称 / 别名解析方案。优先级：id → 名称 → 别名 → 名称包含（唯一命中）。
   * @returns {object} index 条目
   */
  resolveIn(index, query) {
    const items = index.items;
    const q = String(query || '').trim();
    const byId = items.find((it) => it.id === q);
    if (byId) return byId;
    const nq = normalizeName(q);
    const exact = items.filter((it) => normalizeName(it.name) === nq);
    if (exact.length === 1) return exact[0];
    const alias = items.filter((it) => (it.aliases || []).some((a) => normalizeName(a) === nq));
    if (alias.length === 1) return alias[0];
    const fuzzy = nq
      ? items.filter((it) => !it.access?.hidden && [it.name, ...(it.aliases || [])].some((n) => normalizeName(n).includes(nq)))
      : [];
    if (fuzzy.length === 1) return fuzzy[0];
    const candidates = [...new Set([...exact, ...alias, ...fuzzy])].map((it) => ({ id: it.id, name: it.name }));
    throw new SolutionError(
      candidates.length ? 'AMBIGUOUS' : 'NOT_FOUND',
      candidates.length ? `「${q}」匹配到多个方案：${candidates.map((c) => `${c.name}(${c.id})`).join('、')}` : `找不到方案「${q}」`,
      { candidates },
    );
  }

  async resolve(query, opts) {
    const { index } = await this.catalog(opts);
    return this.resolveIn(index, query);
  }

  removedEntry(index, id, version) {
    return (index.removed || []).find((r) => r.id === id && (!r.versions || r.versions.includes(version)));
  }

  /** 兼容性：返回不满足的原因，满足返回 null */
  compatProblem(item) {
    const min = item.compat?.minAppVersion;
    if (min && semver.valid(min) && semver.valid(this.appVersion) && semver.lt(this.appVersion, min)) {
      return { code: 'APP_TOO_OLD', message: `${item.name} ${item.version} 需要宿主 ${min} 及以上（当前 ${this.appVersion}）` };
    }
    if ((item.compat?.hostApi ?? 1) > this.hostApi) {
      return { code: 'HOST_API', message: `${item.name} ${item.version} 需要宿主 SDK v${item.compat.hostApi}（当前 v${this.hostApi}）` };
    }
    return null;
  }

  // ── 查询 ──────────────────────────────────────────────────────────

  list() {
    const lock = readLock(this.root);
    return Object.values(lock.items).map((it) => ({ ...it, absPath: join(this.root, it.activePath) }));
  }

  get(id) {
    return readLock(this.root).items[id] || null;
  }

  /** 已安装方案的代码目录绝对路径（未安装返回 null） */
  activePath(id) {
    const it = this.get(id);
    return it ? join(this.root, it.activePath) : null;
  }

  /** 已安装方案的清单 */
  manifest(id) {
    const p = this.activePath(id);
    return p ? readJsonFile(join(p, 'solution.json'), null) : null;
  }

  // ── 启动恢复 ──────────────────────────────────────────────────────

  async recover() {
    return this.lockFile.run(async () => {
      const r = recoverJournal(this.root);
      if (r) this.log(`恢复上次未完成的操作：${r.action} ${r.journal.id || ''}`);
      return r;
    });
  }

  // ── 安装 ──────────────────────────────────────────────────────────

  /**
   * 安装 / 升级到目录中的最新版本。
   * @param {string} query id 或名称
   * @param {object} [opts]
   * @param {'manual'|'granted'|'on-demand'|'dependency'|'auto-update'} [opts.reason]
   * @param {boolean} [opts.force]  忽略 tombstone、同版本也重装（repair）
   * @param {boolean} [opts.withDependencies]  默认 true
   */
  async install(query, opts = {}) {
    return this.lockFile.run(() => this._install(query, { reason: 'manual', withDependencies: true, ...opts }, new Set()));
  }

  async _install(query, opts, visiting) {
    let { ref, index } = await this.catalog({ refresh: opts.refresh });
    const item = this.resolveIn(index, query);
    if (visiting.has(item.id)) return { id: item.id, status: 'cycle' };
    visiting.add(item.id);

    const lock = readLock(this.root);
    const tomb = lock.tombstones[item.id];
    if (tomb && !opts.force && ['granted', 'dependency', 'auto-update', 'on-demand'].includes(opts.reason)) {
      return { id: item.id, status: 'skipped', reason: 'TOMBSTONE', message: `${item.name} 曾被用户卸载，不自动重装` };
    }
    const removed = this.removedEntry(index, item.id, item.version);
    if (removed) throw new SolutionError('DELISTED', `${item.name} 已下架：${removed.reason || ''}`);
    const problem = this.compatProblem(item);
    if (problem) throw new SolutionError(problem.code, problem.message);

    const deps = [];
    if (opts.withDependencies !== false) {
      for (const dep of item.dependsOn || []) {
        const cur = lock.items[dep];
        const depItem = index.items.find((it) => it.id === dep);
        if (!depItem) throw new SolutionError('MISSING_DEPENDENCY', `${item.name} 依赖的 ${dep} 不在目录中`);
        if (!cur || semver.gt(depItem.version, cur.version)) {
          deps.push(await this._install(dep, { ...opts, reason: cur ? 'auto-update' : 'dependency', force: false }, visiting));
        }
      }
    }

    const current = readLock(this.root).items[item.id];
    if (
      current &&
      !opts.force &&
      current.version === item.version &&
      current.treeDigest === item.treeDigest &&
      existsSync(join(this.root, current.activePath))
    ) {
      return { id: item.id, status: 'unchanged', version: item.version, dependencies: deps };
    }
    if (current && !opts.force && semver.lt(item.version, current.version)) {
      return { id: item.id, status: 'skipped', reason: 'NEWER_INSTALLED', version: current.version, dependencies: deps };
    }

    let staged;
    try {
      staged = await this._download(ref, item);
    } catch (err) {
      // 按分支名下载时目录可能刚好被新提交替换：刷新目录重试一次
      if (err.code === 'HASH_MISMATCH' && !COMMIT_RE.test(ref)) {
        ({ ref, index } = await this.catalog({ refresh: true }));
        staged = await this._download(ref, this.resolveIn(index, item.id));
      } else throw err;
    }

    const result = this._publish(item, staged, ref, current, opts.reason);
    return { ...result, dependencies: deps };
  }

  /** 目录摘要不含逐文件清单时，按 filesRef 从同一快照取 index/<id>.json */
  async _fileList(ref, item) {
    if (Array.isArray(item.files)) return item.files;
    if (!item.filesRef) throw new SolutionError('BAD_INDEX', `${item.id} 缺少文件清单`);
    const detail = JSON.parse((await this.source.fetchFile(ref, item.filesRef)).toString('utf8'));
    if (detail.id !== item.id || detail.version !== item.version || detail.treeDigest !== item.treeDigest) {
      throw new SolutionError('HASH_MISMATCH', `${item.id} 文件清单与目录不一致`);
    }
    return detail.files;
  }

  /** 下载到 .staging/<uuid> 并逐文件校验，返回 staging 目录 */
  async _download(ref, item) {
    const files = await this._fileList(ref, item);
    const stage = join(this.root, '.staging', randomUUID());
    mkdirSync(stage, { recursive: true });
    const total = files.length;
    let done = 0;
    const emit = () => this.onProgress({ id: item.id, version: item.version, done, total });
    try {
      let archive = null;
      if (this.source.fetchArchive && total > this.archiveThreshold) {
        try {
          archive = await this.source.fetchArchive(ref, item.path);
        } catch (err) {
          this.log(`整包下载失败，改为逐文件：${err.message}`);
        }
      }
      await pool(files, this.concurrency, async (f) => {
        assertSafeRelPath(f.path);
        let buf = archive?.get(f.path);
        if (!buf) buf = await this.source.fetchFile(ref, item.path ? `${item.path}/${f.path}` : f.path);
        if (buf.length !== f.size || sha256(buf) !== f.sha256) {
          throw new SolutionError('HASH_MISMATCH', `${item.id}/${f.path} 校验失败（期望 ${f.sha256.slice(0, 12)}…）`);
        }
        const out = safeJoin(stage, f.path);
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, buf);
        done++;
        if (done === total || done % 20 === 0) emit();
      });
      const actual = treeDigest(files);
      if (actual !== item.treeDigest) throw new SolutionError('HASH_MISMATCH', `${item.id} 整包摘要不一致`);
      const manifest = readJsonFile(join(stage, 'solution.json'), null);
      if (!manifest || manifest.id !== item.id || manifest.version !== item.version) {
        throw new SolutionError('BAD_PACKAGE', `${item.id} 包内 solution.json 与目录不一致`);
      }
      emit();
      return stage;
    } catch (err) {
      rmrf(stage);
      throw err;
    }
  }

  /** stage → 正式目录 → 切换锁文件；旧版本保留一份作为 previous */
  _publish(item, stage, ref, current, reason) {
    const dirName = `${item.version}+${item.treeDigest.slice(0, 8)}`;
    const target = join(this.root, item.id, dirName);
    const activePath = `${item.id}/${dirName}`;
    beginJournal(this.root, { op: 'install', id: item.id, version: item.version, target });
    if (existsSync(target)) rmrf(stage); // 同内容目录已在（例如回滚后再升级），直接复用
    else moveDir(stage, target);

    const lock = readLock(this.root);
    const now = new Date().toISOString();
    const keepPrevious = current && current.activePath !== activePath;
    lock.items[item.id] = {
      id: item.id,
      name: item.name,
      kind: item.kind,
      version: item.version,
      treeDigest: item.treeDigest,
      activePath,
      previous: keepPrevious
        ? { version: current.version, path: current.activePath, treeDigest: current.treeDigest }
        : current?.previous || null,
      source: { ...this.source.describe(), ref, path: item.path },
      dataSchemaVersion: item.data?.schemaVersion ?? 1,
      capabilities: item.capabilities || [],
      installedAt: current?.installedAt || now,
      updatedAt: now,
      pinned: current?.pinned || false,
      autoUpdate: current?.autoUpdate ?? true,
      reason: current?.reason || reason,
    };
    delete lock.tombstones[item.id];
    writeLock(this.root, lock);
    commitJournal(this.root);
    this._gc(item.id, lock.items[item.id]);
    clearJournal(this.root);
    this.log(`已安装 ${item.id}@${item.version}`);
    return {
      id: item.id,
      status: current ? (current.version === item.version ? 'reinstalled' : 'updated') : 'installed',
      from: current?.version || null,
      version: item.version,
      path: target,
    };
  }

  /** 只保留 active 与 previous 两个版本目录，其余移入 .trash 后删除 */
  _gc(id, entry) {
    const dir = join(this.root, id);
    if (!existsSync(dir)) return;
    const keep = new Set([entry.activePath, entry.previous?.path].filter(Boolean).map((p) => p.split('/')[1]));
    for (const name of readdirSync(dir)) {
      if (keep.has(name)) continue;
      const trash = join(this.root, '.trash', `${id}-${name}-${randomUUID().slice(0, 8)}`);
      moveDir(join(dir, name), trash);
    }
    rmrf(join(this.root, '.trash'));
  }

  // ── 升级 ──────────────────────────────────────────────────────────

  /**
   * 只读检查已安装方案的可用升级。
   * @returns {Array<{id,name,from,to,level,action:'update'|'blocked'|'delisted'|'up-to-date',reason?,message?}>}
   */
  async checkUpdates({ refresh = true } = {}) {
    const { index } = await this.catalog({ refresh });
    const out = [];
    for (const cur of this.list()) {
      const item = index.items.find((it) => it.id === cur.id);
      const base = { id: cur.id, name: cur.name, from: cur.version };
      if (!item) {
        out.push({ ...base, to: null, action: 'delisted', reason: 'NOT_IN_INDEX' });
        continue;
      }
      const removed = this.removedEntry(index, item.id, item.version);
      if (removed) {
        out.push({ ...base, to: item.version, action: 'delisted', reason: 'REMOVED', message: removed.reason });
        continue;
      }
      if (!semver.gt(item.version, cur.version)) {
        out.push({ ...base, to: item.version, action: 'up-to-date' });
        continue;
      }
      const entry = { ...base, to: item.version, level: semver.diff(cur.version, item.version), changelog: item.changelog || null };
      const problem = this.compatProblem(item);
      const newCaps = (item.capabilities || []).filter((c) => !(cur.capabilities || []).includes(c));
      if (cur.pinned) out.push({ ...entry, action: 'blocked', reason: 'PINNED' });
      else if (cur.autoUpdate === false) out.push({ ...entry, action: 'blocked', reason: 'AUTO_UPDATE_OFF' });
      else if (problem) out.push({ ...entry, action: 'blocked', reason: problem.code, message: problem.message });
      else if (newCaps.length) out.push({ ...entry, action: 'blocked', reason: 'NEEDS_CONSENT', capabilities: newCaps });
      else out.push({ ...entry, action: 'update' });
    }
    return out;
  }

  /** 升级单个方案（忽略 autoUpdate 开关，但尊重 pin） */
  async update(id, { acceptCapabilities = false } = {}) {
    const cur = this.get(id);
    if (!cur) throw new SolutionError('NOT_INSTALLED', `${id} 未安装`);
    if (cur.pinned) throw new SolutionError('PINNED', `${id} 已锁定版本 ${cur.version}`);
    if (!acceptCapabilities) {
      const { index } = await this.catalog({ refresh: true });
      const item = index.items.find((it) => it.id === id);
      const newCaps = (item?.capabilities || []).filter((c) => !(cur.capabilities || []).includes(c));
      if (newCaps.length) throw new SolutionError('NEEDS_CONSENT', `${id} 新版本需要额外能力：${newCaps.join(', ')}`, { capabilities: newCaps });
    }
    return this.install(id, { reason: 'auto-update' });
  }

  /** 自动升级：应用 checkUpdates 中 action=update 的全部条目，单个失败不影响其他 */
  async updateAll({ isBusy = () => false } = {}) {
    const plan = await this.checkUpdates();
    const results = [];
    for (const p of plan.filter((x) => x.action === 'update')) {
      if (isBusy(p.id)) {
        results.push({ id: p.id, status: 'deferred', reason: 'BUSY' });
        continue;
      }
      try {
        results.push(await this.install(p.id, { reason: 'auto-update' }));
      } catch (err) {
        results.push({ id: p.id, status: 'failed', error: err.message, code: err.code });
      }
    }
    return { plan, results };
  }

  // ── 回滚 / 锁定 / 开关 ────────────────────────────────────────────

  async rollback(id) {
    return this.lockFile.run(async () => {
      const lock = readLock(this.root);
      const cur = lock.items[id];
      if (!cur?.previous) throw new SolutionError('NO_PREVIOUS', `${id} 没有可回滚的上一版本`);
      if (!existsSync(join(this.root, cur.previous.path))) throw new SolutionError('NO_PREVIOUS', `${id} 上一版本目录已不存在`);
      const prevManifest = readJsonFile(join(this.root, cur.previous.path, 'solution.json'), {});
      lock.items[id] = {
        ...cur,
        version: cur.previous.version,
        treeDigest: cur.previous.treeDigest,
        activePath: cur.previous.path,
        previous: { version: cur.version, path: cur.activePath, treeDigest: cur.treeDigest },
        dataSchemaVersion: prevManifest.data?.schemaVersion ?? 1,
        pinned: true, // 回滚后锁定，避免下一轮自动升级立刻又升回去
        updatedAt: new Date().toISOString(),
      };
      writeLock(this.root, lock);
      return { id, status: 'rolled-back', version: lock.items[id].version, from: cur.version, pinned: true };
    });
  }

  async setPinned(id, pinned) {
    return this._patch(id, { pinned: !!pinned });
  }

  async setAutoUpdate(id, autoUpdate) {
    return this._patch(id, { autoUpdate: !!autoUpdate });
  }

  /** 用户同意新版本的能力声明后调用，之后 checkUpdates 不再因 NEEDS_CONSENT 阻塞 */
  async acceptCapabilities(id, capabilities) {
    const cur = this.get(id);
    return this._patch(id, { capabilities: [...new Set([...(cur?.capabilities || []), ...capabilities])] });
  }

  async _patch(id, patch) {
    return this.lockFile.run(async () => {
      const lock = readLock(this.root);
      if (!lock.items[id]) throw new SolutionError('NOT_INSTALLED', `${id} 未安装`);
      lock.items[id] = { ...lock.items[id], ...patch };
      writeLock(this.root, lock);
      return lock.items[id];
    });
  }

  // ── 卸载 ──────────────────────────────────────────────────────────

  /**
   * 卸载：删代码目录与锁记录、写 tombstone（阻止授权同步自动重装）。
   * 默认保留数据；purgeData=true 时只删清单 data.paths 声明的路径（需调用方二次确认）。
   * @param {string} id
   * @param {{ purgeData?: boolean, dataRoots?: string[] }} [opts]
   */
  async uninstall(id, { purgeData = false, dataRoots = [] } = {}) {
    return this.lockFile.run(async () => {
      const lock = readLock(this.root);
      const cur = lock.items[id];
      if (!cur) throw new SolutionError('NOT_INSTALLED', `${id} 未安装`);
      const manifest = readJsonFile(join(this.root, cur.activePath, 'solution.json'), null);
      const dependents = Object.values(lock.items).filter((it) => it.id !== id && this._dependsOn(it, id));
      delete lock.items[id];
      lock.tombstones[id] = { uninstalledAt: new Date().toISOString(), version: cur.version, keepData: !purgeData };
      writeLock(this.root, lock);
      const dir = join(this.root, id);
      if (existsSync(dir)) moveDir(dir, join(this.root, '.trash', `${id}-${randomUUID().slice(0, 8)}`));
      rmrf(join(this.root, '.trash'));

      const purged = [];
      if (purgeData && manifest) {
        for (const dataRoot of dataRoots) {
          for (const p of ownedDataPaths(manifest)) {
            const abs = safeJoin(dataRoot, p);
            if (existsSync(abs)) {
              rmrf(abs);
              purged.push(abs);
            }
          }
          rmrf(join(dataRoot, '.solution-data', `${id}.json`));
        }
      }
      return { id, status: 'uninstalled', keptData: !purgeData, purged, dependents: dependents.map((d) => d.id) };
    });
  }

  _dependsOn(entry, id) {
    const m = readJsonFile(join(this.root, entry.activePath, 'solution.json'), null);
    return (m?.dependsOn || []).includes(id);
  }

  /** 清除 tombstone（用户在 UI 里主动「重新安装」前调用；install 手动安装也会清除） */
  async forget(id) {
    return this.lockFile.run(async () => {
      const lock = readLock(this.root);
      delete lock.tombstones[id];
      writeLock(this.root, lock);
    });
  }

  // ── 校验 / 修复 ───────────────────────────────────────────────────

  /** 重算代码目录摘要与锁记录比对 */
  verify(id) {
    const ids = id ? [id] : Object.keys(readLock(this.root).items);
    return ids.map((sid) => {
      const cur = this.get(sid);
      if (!cur) return { id: sid, ok: false, reason: 'NOT_INSTALLED' };
      const dir = join(this.root, cur.activePath);
      if (!existsSync(dir)) return { id: sid, ok: false, reason: 'MISSING_DIR' };
      const actual = digestDir(dir).treeDigest;
      return actual === cur.treeDigest ? { id: sid, ok: true } : { id: sid, ok: false, reason: 'DIGEST_MISMATCH', expected: cur.treeDigest, actual };
    });
  }

  /** 校验失败的方案按当前锁定版本从源重装（数据不动） */
  async repair(id) {
    const bad = this.verify(id).filter((r) => !r.ok && r.reason !== 'NOT_INSTALLED');
    const results = [];
    for (const r of bad) results.push(await this.install(r.id, { force: true, reason: 'manual' }));
    return results;
  }

  // ── 数据迁移（委托 migrate.mjs） ──────────────────────────────────

  /** 对某账号数据目录执行已安装版本的数据迁移 */
  async migrate(id, dataRoot, { log } = {}) {
    const dir = this.activePath(id);
    if (!dir) throw new SolutionError('NOT_INSTALLED', `${id} 未安装`);
    const manifest = readJsonFile(join(dir, 'solution.json'), null);
    return migrateData({ packageDir: dir, manifest, dataRoot, log: log || this.log });
  }

  /** 安装根内相对路径（调试用） */
  rel(p) {
    return relative(this.root, p);
  }
}
