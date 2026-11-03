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
import { forcedReason, isDelisted, normalizePolicy, selectVersion, versionsOf } from './release.mjs';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { digestDir, sha256, treeDigest } from './digest.mjs';
import { assertSafeRelPath, ensureDir, moveDir, readJsonFile, rmrf, safeJoin } from './fsutil.mjs';
import { beginJournal, clearJournal, commitJournal, recoverJournal } from './journal.mjs';
import { DirLock, readLock, writeLock } from './lock.mjs';
import { migrateData, ownedDataPaths, usedDataPaths } from './migrate.mjs';
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
  constructor({ root, source, appVersion = '999.0.0', hostApi = 1, concurrency = 6, archiveThreshold = 300, deviceId = null, policy = null, onProgress, log } = {}) {
    if (!root) throw new Error('SolutionManager 需要 root');
    if (!source) throw new Error('SolutionManager 需要 source');
    Object.assign(this, { root, source, appVersion, hostApi, concurrency, archiveThreshold, deviceId });
    /** 账号更新策略（渠道 / 自动更新 / 单方案覆盖），可为对象或返回对象的函数（账号切换后随之变化） */
    this._policy = policy;
    this.onProgress = onProgress || (() => {});
    this.log = log || (() => {});
    this.lockFile = new DirLock(ensureDir(root));
    this.catalogCache = null;
  }

  /** 当前生效的账号更新策略 */
  policy() {
    return normalizePolicy(typeof this._policy === 'function' ? this._policy() : this._policy);
  }

  /** 替换更新策略（web 下发新策略时） */
  setPolicy(policy) {
    this._policy = policy;
  }

  // ── 目录 ──────────────────────────────────────────────────────────

  /** 取目录快照 { ref, index }；默认 5 分钟内存缓存 */
  async catalog({ refresh = false } = {}) {
    if (!refresh && this.catalogCache && Date.now() - this.catalogCache.at < CATALOG_TTL_MS) return this.catalogCache;
    const ref = await this.source.resolveRef();
    const index = await this.source.fetchIndex(ref);
    if (!index || !Array.isArray(index.items)) throw new SolutionError('BAD_INDEX', '方案目录格式错误');
    this.catalogCache = { ref, index, at: Date.now() };
    this._detailCache?.clear();
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
   * 安装 / 升级到「本机可见且兼容的最高版本」（渠道、灰度、兼容、吊销、隔离、账号策略，见 release.mjs）。
   * @param {string} query id 或名称
   * @param {object} [opts]
   * @param {'manual'|'granted'|'on-demand'|'dependency'|'auto-update'|'forced'} [opts.reason]
   * @param {boolean} [opts.force]  忽略 tombstone、同版本也重装（repair）
   * @param {boolean} [opts.withDependencies]  默认 true
   * @param {boolean} [opts.allowDowngrade]  允许装比当前低的版本（版本吊销 / 账号策略锁定旧版本时）
   */
  async install(query, opts = {}) {
    return this.lockFile.run(() => this._install(query, { reason: 'manual', withDependencies: true, ...opts }, new Set()));
  }

  /** index/<id>.json（逐文件清单 + 版本历史），按快照缓存 */
  async _detail(ref, item) {
    if (!item.filesRef) return { files: item.files, versions: null };
    const key = `${ref}\0${item.filesRef}`;
    this._detailCache ||= new Map();
    if (this._detailCache.has(key)) return this._detailCache.get(key);
    const detail = JSON.parse((await this.source.fetchFile(ref, item.filesRef)).toString('utf8'));
    if (detail.id !== item.id || detail.version !== item.version || detail.treeDigest !== item.treeDigest) {
      throw new SolutionError('HASH_MISMATCH', `${item.id} 文件清单与目录不一致`);
    }
    this._detailCache.set(key, detail);
    return detail;
  }

  /** 选目标版本；没有可用版本时返回 { target:null, skipped }。onlyVersion：指定版本（用户「回到此版本」） */
  async _select(ref, index, item, { onlyVersion = null } = {}) {
    const detail = Array.isArray(item.files) ? { files: item.files, versions: null } : await this._detail(ref, item);
    const lock = readLock(this.root);
    const quarantined = (lock.quarantine?.[item.id] || []).map((q) => q.version).filter((v) => v !== onlyVersion);
    const sel = selectVersion({ item, detail, index, policy: this.policy(), deviceId: this.deviceId, appVersion: this.appVersion, hostApi: this.hostApi, quarantined, onlyVersion });
    return { ...sel, detail };
  }

  /**
   * 方案的版本历史与本机可用性（UI「版本历史」）：
   * [{ version, channel, rollout, publishedAt, available, reason?, installed }]
   */
  async versions(query) {
    const { ref, index } = await this.catalog();
    const item = this.resolveIn(index, query);
    const detail = Array.isArray(item.files) ? { versions: null } : await this._detail(ref, item);
    const all = versionsOf(item, detail);
    const cur = this.get(item.id);
    const quarantined = new Set((readLock(this.root).quarantine?.[item.id] || []).map((q) => q.version));
    const out = [];
    for (const v of all) {
      const { target, skipped } = await this._select(ref, index, item, { onlyVersion: v.version });
      // 本机隔离的坏版本：列表里明确标出，不提供「使用此版本」
      const bad = quarantined.has(v.version) && cur?.version !== v.version;
      out.push({
        version: v.version,
        channel: v.channel || 'stable',
        rollout: v.rollout ?? 100,
        publishedAt: v.publishedAt || null,
        available: !!target && !bad,
        reason: bad ? 'QUARANTINED' : target ? undefined : skipped.find((x) => x.version === v.version)?.reason,
        installed: cur?.version === v.version,
      });
    }
    return out.sort((a, b) => semver.compare(b.version, a.version));
  }

  /** 目标版本的逐文件清单与下载引用（历史版本按 tag 取，最新版用目录快照） */
  async _targetFiles(ref, item, detail, target) {
    if (target.version === item.version && target.treeDigest === item.treeDigest) {
      return { files: detail.files || item.files, fileRef: ref };
    }
    if (!target.filesRef) throw new SolutionError('BAD_INDEX', `${item.id}@${target.version} 缺少文件清单`);
    const vd = JSON.parse((await this.source.fetchFile(ref, target.filesRef)).toString('utf8'));
    if (vd.version !== target.version || vd.treeDigest !== target.treeDigest || treeDigest(vd.files) !== target.treeDigest) {
      throw new SolutionError('HASH_MISMATCH', `${item.id}@${target.version} 文件清单与目录不一致`);
    }
    if (!target.ref) throw new SolutionError('BAD_INDEX', `${item.id}@${target.version} 缺少版本引用（tag）`);
    return { files: vd.files, fileRef: `tag:${target.ref}` };
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
    if (isDelisted(index, item.id)) {
      const r = (index.removed || []).find((x) => x.id === item.id && !x.versions);
      throw new SolutionError('DELISTED', `${item.name} 已下架：${r?.reason || ''}`);
    }
    if (this.policy().overrides?.[item.id]?.block) throw new SolutionError('POLICY_BLOCK', `${item.name} 已被管理员停用更新 / 安装`);

    let { target, skipped, detail } = await this._select(ref, index, item, { onlyVersion: opts.version || null });
    if (!target) {
      const why = skipped.find((s) => s.reason === 'APP_TOO_OLD' || s.reason === 'HOST_API') || skipped[0];
      const problem = this.compatProblem(item);
      if (why?.reason === 'APP_TOO_OLD' || why?.reason === 'HOST_API') throw new SolutionError(why.reason, problem?.message || `${item.name} 需要更新的客户端`);
      if (why?.reason === 'REVOKED') throw new SolutionError('DELISTED', `${item.name} ${why.version} 已被吊销`);
      throw new SolutionError('NO_AVAILABLE_VERSION', `${item.name} 当前没有可安装的版本（${skipped.map((s) => `${s.version}:${s.reason}`).join(', ')}）`);
    }

    const deps = [];
    if (opts.withDependencies !== false) {
      for (const dep of item.dependsOn || []) {
        const cur = lock.items[dep];
        const depItem = index.items.find((it) => it.id === dep);
        if (!depItem) throw new SolutionError('MISSING_DEPENDENCY', `${item.name} 依赖的 ${dep} 不在目录中`);
        if (!cur || semver.gt(depItem.version, cur.version)) {
          deps.push(await this._install(dep, { ...opts, reason: cur ? 'auto-update' : 'dependency', force: false, allowDowngrade: false }, visiting));
        }
      }
    }

    const current = readLock(this.root).items[item.id];
    if (
      current &&
      !opts.force &&
      current.version === target.version &&
      current.treeDigest === target.treeDigest &&
      existsSync(join(this.root, current.activePath))
    ) {
      return { id: item.id, status: 'unchanged', version: target.version, dependencies: deps };
    }
    if (current && !opts.force && !opts.allowDowngrade && !opts.version && semver.lt(target.version, current.version)) {
      return { id: item.id, status: 'skipped', reason: 'NEWER_INSTALLED', version: current.version, dependencies: deps };
    }

    let staged;
    let tf;
    try {
      tf = await this._targetFiles(ref, item, detail, target);
      staged = await this._download(tf.fileRef, item, target, tf.files, current);
    } catch (err) {
      // 按分支名下载时目录可能刚好被新提交替换：刷新目录重试一次
      if (err.code === 'HASH_MISMATCH' && !COMMIT_RE.test(ref)) {
        ({ ref, index } = await this.catalog({ refresh: true }));
        this._detailCache?.clear();
        const fresh = this.resolveIn(index, item.id);
        ({ target, detail } = await this._select(ref, index, fresh));
        if (!target) throw err;
        tf = await this._targetFiles(ref, fresh, detail, target);
        staged = await this._download(tf.fileRef, fresh, target, tf.files, current);
      } else throw err;
    }

    const result = this._publish(item, target, staged, ref, current, opts.reason);
    // 用户指定装某个版本：锁定它，避免下一轮自动升级又换掉
    if (opts.version) {
      const l = readLock(this.root);
      l.items[item.id] = { ...l.items[item.id], pinned: true };
      writeLock(this.root, l);
    }
    return { ...result, reused: staged.reused, downloaded: staged.downloaded, dependencies: deps };
  }

  /**
   * 下载到 .staging/<uuid> 并逐文件校验，返回 { dir, reused, downloaded }。
   * 增量：当前已装版本里哈希相同的文件直接本地复制，只下载变化的文件。
   */
  async _download(ref, item, target, files, current) {
    const stage = join(this.root, '.staging', randomUUID());
    mkdirSync(stage, { recursive: true });
    const total = files.length;
    let done = 0;
    let reused = 0;
    let downloaded = 0;
    const localDirs = [current?.activePath, current?.previous?.path].filter(Boolean).map((p) => join(this.root, p)).filter((d) => existsSync(d));
    const localHit = (f) => {
      for (const d of localDirs) {
        const p = join(d, f.path);
        try {
          if (!existsSync(p)) continue;
          const buf = readFileSync(p);
          if (buf.length === f.size && sha256(buf) === f.sha256) return buf;
        } catch { /* 读不到就下载 */ }
      }
      return null;
    };
    const emit = () => this.onProgress({ id: item.id, version: target.version, done, total, reused });
    try {
      const need = files.filter((f) => {
        assertSafeRelPath(f.path);
        return !localHit(f);
      });
      let archive = null;
      if (this.source.fetchArchive && need.length > this.archiveThreshold) {
        try {
          archive = await this.source.fetchArchive(ref, item.path);
        } catch (err) {
          this.log(`整包下载失败，改为逐文件：${err.message}`);
        }
      }
      // 逐文件下载失败（托管方按内容屏蔽单个文件 451、个别文件反复超时）时，懒取一次整仓归档兜底，后续文件共用
      let archiveFallback = null;
      const fromArchive = () => {
        if (!archiveFallback) {
          archiveFallback = this.source.fetchArchive(ref, item.path).catch((err) => {
            archiveFallback = null;
            throw err;
          });
        }
        return archiveFallback;
      };
      await pool(files, this.concurrency, async (f) => {
        let buf = localHit(f);
        if (buf) reused++;
        else {
          buf = archive?.get(f.path);
          if (!buf) {
            try {
              buf = await this.source.fetchFile(ref, item.path ? `${item.path}/${f.path}` : f.path);
            } catch (err) {
              if (!this.source.fetchArchive || err.code === 'NOT_FOUND') throw err;
              this.log(`${item.id}/${f.path} 逐文件下载失败（${err.message}），改从整包取`);
              buf = (await fromArchive()).get(f.path);
              if (!buf) throw err;
            }
          }
          downloaded++;
        }
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
      if (actual !== target.treeDigest) throw new SolutionError('HASH_MISMATCH', `${item.id} 整包摘要不一致`);
      const manifest = readJsonFile(join(stage, 'solution.json'), null);
      if (!manifest || manifest.id !== item.id || manifest.version !== target.version) {
        throw new SolutionError('BAD_PACKAGE', `${item.id} 包内 solution.json 与目录不一致`);
      }
      emit();
      return { dir: stage, reused, downloaded, manifest };
    } catch (err) {
      rmrf(stage);
      throw err;
    }
  }

  /** stage → 正式目录 → 切换锁文件；旧版本保留一份作为 previous */
  _publish(item, target, staged, ref, current, reason) {
    const stage = staged.dir;
    const manifest = staged.manifest || {};
    const dirName = `${target.version}+${target.treeDigest.slice(0, 8)}`;
    const dest = join(this.root, item.id, dirName);
    const activePath = `${item.id}/${dirName}`;
    beginJournal(this.root, { op: 'install', id: item.id, version: target.version, target: dest });
    if (existsSync(dest) && digestDir(dest).treeDigest === target.treeDigest) rmrf(stage); // 同内容目录已在且完好（例如回滚后再升级），直接复用
    else {
      // 目录名相同但内容坏了（文件被改 / 被删）：换成刚校验过的这份，否则「修复」永远修不好
      if (existsSync(dest)) moveDir(dest, join(this.root, '.trash', `${item.id}-${dirName}-${randomUUID().slice(0, 8)}`));
      moveDir(stage, dest);
    }

    const lock = readLock(this.root);
    const now = new Date().toISOString();
    const keepPrevious = current && current.activePath !== activePath;
    lock.items[item.id] = {
      id: item.id,
      name: manifest.name || item.name,
      kind: manifest.kind || item.kind,
      version: target.version,
      treeDigest: target.treeDigest,
      activePath,
      previous: keepPrevious
        ? { version: current.version, path: current.activePath, treeDigest: current.treeDigest }
        : current?.previous || null,
      source: { ...this.source.describe(), ref, path: item.path, channel: target.channel || 'stable' },
      dataSchemaVersion: manifest.data?.schemaVersion ?? item.data?.schemaVersion ?? 1,
      capabilities: manifest.capabilities || item.capabilities || [],
      installedAt: current?.installedAt || now,
      updatedAt: now,
      pinned: current?.pinned || false,
      autoUpdate: current?.autoUpdate ?? true,
      reason: current?.reason || reason,
      /** 观察期：新版本首次激活成功前算「待确认」，宿主激活失败时据此自动回滚 */
      pendingHealth: !!current && current.version !== target.version,
    };
    delete lock.tombstones[item.id];
    writeLock(this.root, lock);
    commitJournal(this.root);
    this._gc(item.id, lock.items[item.id]);
    clearJournal(this.root);
    this.log(`已安装 ${item.id}@${target.version}（复用 ${staged.reused ?? 0}，下载 ${staged.downloaded ?? 0}）`);
    return {
      id: item.id,
      status: current ? (current.version === target.version ? 'reinstalled' : semver.lt(target.version, current.version) ? 'downgraded' : 'updated') : 'installed',
      from: current?.version || null,
      version: target.version,
      path: dest,
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
    this._emptyTrash();
  }

  /** 清 .trash 只是回收空间：Windows 上文件被占用删不掉就留到下次安装 / 卸载再清，不能让已切换好的锁文件回报失败 */
  _emptyTrash() {
    try {
      rmrf(join(this.root, '.trash'));
    } catch (err) {
      this.log(`清理 .trash 失败，下次再清：${err.message}`);
    }
  }

  // ── 升级 ──────────────────────────────────────────────────────────

  /**
   * 只读检查已安装方案的更新计划。
   * action：update（含降级到可用版本）/ repair（同版本内容变了）/ blocked / delisted / up-to-date
   * forced：版本被吊销或低于 minimumVersion 时为原因串（REVOKED / MINIMUM_VERSION），此时无视锁定与自动更新开关
   */
  async checkUpdates({ refresh = true } = {}) {
    const { ref, index } = await this.catalog({ refresh });
    const pol = this.policy();
    const out = [];
    for (const cur of this.list()) {
      const item = index.items.find((it) => it.id === cur.id);
      const base = { id: cur.id, name: cur.name, from: cur.version };
      if (!item) {
        out.push({ ...base, to: null, action: 'delisted', reason: 'NOT_IN_INDEX' });
        continue;
      }
      if (isDelisted(index, item.id)) {
        const r = (index.removed || []).find((x) => x.id === item.id && !x.versions);
        out.push({ ...base, to: null, action: 'delisted', reason: 'REMOVED', message: r?.reason });
        continue;
      }
      const ov = pol.overrides?.[item.id] || {};
      if (ov.block) {
        out.push({ ...base, to: null, action: 'blocked', reason: 'POLICY_BLOCK' });
        continue;
      }
      let sel;
      try {
        sel = await this._select(ref, index, item);
      } catch (e) {
        out.push({ ...base, to: null, action: 'blocked', reason: e.code || 'ERROR', message: e.message });
        continue;
      }
      const forced = forcedReason({ index, item, installedVersion: cur.version });
      const target = sel.target;
      if (!target) {
        const why = sel.skipped.find((s) => s.version === item.version)?.reason || sel.skipped[0]?.reason || 'NO_AVAILABLE_VERSION';
        out.push({ ...base, to: item.version, action: forced === 'REVOKED' ? 'delisted' : 'blocked', reason: forced === 'REVOKED' ? 'REVOKED' : why, forced: forced || undefined });
        continue;
      }
      const entry = { ...base, to: target.version, level: semver.diff(cur.version, target.version), changelog: target.version === item.version ? item.changelog || null : null, channel: target.channel || 'stable' };
      const newer = semver.gt(target.version, cur.version);
      const downgradeWanted = semver.lt(target.version, cur.version) && (forced === 'REVOKED' || (ov.pinVersion && ov.pinVersion === target.version));
      if (!newer && !downgradeWanted) {
        if (target.version === cur.version && target.treeDigest !== cur.treeDigest) out.push({ ...entry, action: 'repair', reason: 'DIGEST_CHANGED' });
        else out.push({ ...entry, action: 'up-to-date' });
        continue;
      }
      const newCaps = (item.capabilities || []).filter((c) => !(cur.capabilities || []).includes(c));
      if (forced) out.push({ ...entry, action: 'update', forced, downgrade: downgradeWanted || undefined });
      else if (downgradeWanted) out.push({ ...entry, action: 'update', reason: 'POLICY_PIN', downgrade: true });
      else if (cur.pinned) out.push({ ...entry, action: 'blocked', reason: 'PINNED' });
      else if (cur.autoUpdate === false) out.push({ ...entry, action: 'blocked', reason: 'AUTO_UPDATE_OFF' });
      else if (!pol.autoUpdate) out.push({ ...entry, action: 'blocked', reason: 'POLICY_AUTO_UPDATE_OFF' });
      else if (newCaps.length) out.push({ ...entry, action: 'blocked', reason: 'NEEDS_CONSENT', capabilities: newCaps });
      else out.push({ ...entry, action: 'update' });
    }
    return out;
  }

  /** 升级单个方案（忽略 autoUpdate 开关，但尊重 pin；强制更新不受 pin 限制） */
  async update(id, { acceptCapabilities = false } = {}) {
    const cur = this.get(id);
    if (!cur) throw new SolutionError('NOT_INSTALLED', `${id} 未安装`);
    const plan = (await this.checkUpdates()).find((p) => p.id === id);
    if (cur.pinned && !plan?.forced) throw new SolutionError('PINNED', `${id} 已锁定版本 ${cur.version}`);
    if (!acceptCapabilities && plan?.reason === 'NEEDS_CONSENT') {
      throw new SolutionError('NEEDS_CONSENT', `${id} 新版本需要额外能力：${plan.capabilities.join(', ')}`, { capabilities: plan.capabilities });
    }
    return this.install(id, { reason: plan?.forced ? 'forced' : 'auto-update', allowDowngrade: !!plan?.downgrade, force: plan?.action === 'repair' });
  }

  /**
   * 自动升级：应用计划中 action=update / repair 的条目（强制更新即使正在使用也不推迟以外的规则），单个失败不影响其他。
   * eligible(id) 为 false 的方案（宿主判定账号未开通）不升级，结果记为 skipped / NOT_ENTITLED。
   */
  async updateAll({ isBusy = () => false, eligible = () => true } = {}) {
    const plan = await this.checkUpdates();
    const results = [];
    for (const p of plan.filter((x) => x.action === 'update' || x.action === 'repair')) {
      if (!eligible(p.id)) {
        results.push({ id: p.id, status: 'skipped', reason: 'NOT_ENTITLED' });
        continue;
      }
      if (isBusy(p.id)) {
        results.push({ id: p.id, status: 'deferred', reason: 'BUSY' });
        continue;
      }
      try {
        results.push(await this.install(p.id, { reason: p.forced ? 'forced' : 'auto-update', allowDowngrade: !!p.downgrade, force: p.action === 'repair' }));
      } catch (err) {
        results.push({ id: p.id, status: 'failed', error: err.message, code: err.code });
      }
    }
    return { plan, results };
  }

  // ── 回滚 / 隔离 / 锁定 / 开关 ─────────────────────────────────────

  /**
   * 回滚到上一版本。用户手动回滚默认锁定（避免下一轮又升回去）；
   * 健康检查自动回滚用 { pin:false }，并配合隔离名单跳过坏版本。
   */
  async rollback(id, { pin = true } = {}) {
    return this.lockFile.run(async () => this._rollback(id, { pin }));
  }

  _rollback(id, { pin }) {
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
      pinned: pin ? true : cur.pinned,
      pendingHealth: false,
      updatedAt: new Date().toISOString(),
    };
    writeLock(this.root, lock);
    return { id, status: 'rolled-back', version: lock.items[id].version, from: cur.version, pinned: lock.items[id].pinned };
  }

  /**
   * 新版本激活失败（健康检查不通过）：自动回滚到上一版本，并把坏版本记入本机隔离名单，
   * 之后的自动升级跳过它，直到出现更高版本。
   */
  async markBad(id, reason = 'ACTIVATION_FAILED') {
    return this.lockFile.run(async () => {
      const lock = readLock(this.root);
      const cur = lock.items[id];
      if (!cur) throw new SolutionError('NOT_INSTALLED', `${id} 未安装`);
      const bad = cur.version;
      lock.quarantine ||= {};
      lock.quarantine[id] = [...(lock.quarantine[id] || []).filter((q) => q.version !== bad), { version: bad, reason, at: new Date().toISOString() }];
      writeLock(this.root, lock);
      if (!cur.previous || !existsSync(join(this.root, cur.previous.path))) return { id, status: 'quarantined', version: bad, rolledBack: false };
      const r = this._rollback(id, { pin: false });
      return { ...r, status: 'rolled-back', quarantined: bad, rolledBack: true };
    });
  }

  /** 新版本首次激活成功：结束观察期 */
  async markHealthy(id) {
    const cur = this.get(id);
    if (!cur?.pendingHealth) return cur;
    return this._patch(id, { pendingHealth: false });
  }

  /** 本机隔离名单（{ [id]: [{version, reason, at}] }） */
  quarantine() {
    return readLock(this.root).quarantine || {};
  }

  async clearQuarantine(id) {
    return this.lockFile.run(async () => {
      const lock = readLock(this.root);
      if (lock.quarantine) delete lock.quarantine[id];
      writeLock(this.root, lock);
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
   * 默认保留数据；purgeData=true 时只删清单 data.paths 声明的路径（需调用方二次确认），
   * 其他已装方案也声明了的路径不删，记在返回的 kept 里。
   * @param {string} id
   * @param {{ purgeData?: boolean, dataRoots?: string[] }} [opts]
   */
  async uninstall(id, { purgeData = false, dataRoots = [] } = {}) {
    return this.lockFile.run(async () => {
      const lock = readLock(this.root);
      const cur = lock.items[id];
      if (!cur) {
        // 本机还没下载过（例如已开通但从没进入）：只记卸载墓碑 —— 不再自动安装，用户可在市场重新下载
        lock.tombstones[id] = { uninstalledAt: new Date().toISOString(), version: null, keepData: true };
        writeLock(this.root, lock);
        return { id, status: 'uninstalled', keptData: true, purged: [], kept: [], dependents: [] };
      }
      const manifest = readJsonFile(join(this.root, cur.activePath, 'solution.json'), null);
      const dependents = Object.values(lock.items).filter((it) => it.id !== id && this._dependsOn(it, id));
      delete lock.items[id];
      lock.tombstones[id] = { uninstalledAt: new Date().toISOString(), version: cur.version, keepData: !purgeData };
      writeLock(this.root, lock);
      const dir = join(this.root, id);
      if (existsSync(dir)) moveDir(dir, join(this.root, '.trash', `${id}-${randomUUID().slice(0, 8)}`));
      this._emptyTrash();

      const purged = [];
      const kept = [];
      if (purgeData && manifest) {
        // 别的已装方案也声明了的数据（data.paths 或 data.uses；同一路径或互为上下级）是共用的：不删，回报保留了哪些
        const others = Object.values(lock.items).flatMap((it) => {
          const m = readJsonFile(join(this.root, it.activePath, 'solution.json'), null);
          return [...ownedDataPaths(m), ...usedDataPaths(m)];
        });
        const shared = (p) => others.some((q) => q === p || q.startsWith(`${p}/`) || p.startsWith(`${q}/`));
        for (const dataRoot of dataRoots) {
          for (const p of ownedDataPaths(manifest)) {
            if (shared(p)) {
              if (!kept.includes(p)) kept.push(p);
              continue;
            }
            const abs = safeJoin(dataRoot, p);
            if (existsSync(abs)) {
              rmrf(abs);
              purged.push(abs);
            }
          }
          rmrf(join(dataRoot, '.solution-data', `${id}.json`));
        }
      }
      return { id, status: 'uninstalled', keptData: !purgeData, purged, kept, dependents: dependents.map((d) => d.id) };
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
