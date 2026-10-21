// 方案来源：从哪里拿 index.json 与方案文件。
//
// 统一接口：
//   describe()                       → 记录进 installed.json 的来源描述
//   resolveRef()                     → 当前快照引用（gitee: 40 位 commit；local: git HEAD 或 'local'）
//   fetchIndex(ref)                  → index.json 对象
//   fetchFile(ref, repoPath)         → Buffer
//   fetchArchive?(ref, prefix)       → Map<相对 prefix 的路径, Buffer>（可选，整包兜底）
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { assertSafeRelPath, safeJoin } from './fsutil.mjs';
import { readTar } from './tar.mjs';

export const COMMIT_RE = /^[0-9a-f]{40}$/;

/** 本地仓库目录（开发联调、离线、CI 测试） */
export class LocalSource {
  constructor(root) {
    this.root = root;
  }

  describe() {
    return { type: 'local', root: this.root };
  }

  async resolveRef() {
    try {
      const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: this.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: this.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      return dirty ? `${head}+dirty` : head;
    } catch {
      return 'local';
    }
  }

  async fetchIndex() {
    return JSON.parse(readFileSync(join(this.root, 'index.json'), 'utf8'));
  }

  async fetchFile(_ref, repoPath) {
    return readFileSync(safeJoin(this.root, assertSafeRelPath(repoPath)));
  }
}

/** 单个方案的 .tgz 发布包（tools/pack.mjs 产物）：包内 `.tcsol-entry.json` 是该方案的 index 条目 */
export class TarballSource {
  constructor(file) {
    this.file = file;
    this.files = readTar(readFileSync(file));
    const entry = this.files.get('.tcsol-entry.json');
    if (!entry) throw new Error(`${file} 不是方案发布包（缺少 .tcsol-entry.json）`);
    this.entry = JSON.parse(entry.toString('utf8'));
  }

  describe() {
    return { type: 'tarball', file: this.file };
  }

  async resolveRef() {
    return `tarball:${this.entry.treeDigest}`;
  }

  async fetchIndex() {
    return { schemaVersion: 2, kind: 'solution-index', items: [{ ...this.entry, path: '' }], removed: [] };
  }

  async fetchFile(_ref, repoPath) {
    const buf = this.files.get(repoPath);
    if (!buf) throw new Error(`发布包中没有 ${repoPath}`);
    return buf;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * gitee（或任意 git 托管的 raw / archive HTTP 接口）。
 * 默认指向官方仓库；私有镜像可覆盖 urls。token 只放请求头，不落盘。
 */
export class GiteeSource {
  constructor({
    owner = 'jlzdyx',
    repo = 'totalclaw-solutions',
    branch = 'master',
    token = null,
    fetch: fetchImpl = globalThis.fetch,
    timeoutMs = 20_000,
    archiveTimeoutMs = 600_000,
    retries = 2,
    urls = {},
  } = {}) {
    Object.assign(this, { owner, repo, branch, token, fetchImpl, timeoutMs, archiveTimeoutMs, retries });
    const base = `https://gitee.com/${owner}/${repo}`;
    this.urls = {
      ref: `https://gitee.com/api/v5/repos/${owner}/${repo}/branches/${branch}`,
      raw: `${base}/raw/{ref}/{path}`,
      archive: `${base}/repository/archive/{ref}.tar.gz`,
      ...urls,
    };
  }

  describe() {
    return { type: 'gitee', repo: `${this.owner}/${this.repo}`, branch: this.branch };
  }

  async request(url, { timeoutMs = this.timeoutMs, retries = this.retries } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const headers = { 'User-Agent': 'totalclaw-solution-installer' };
        if (this.token) headers.Authorization = `token ${this.token}`;
        const res = await this.fetchImpl(url, { headers, signal: ctrl.signal });
        if (res.status === 404) {
          const err = new Error(`404 ${url}`);
          err.code = 'NOT_FOUND';
          throw err;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
        return Buffer.from(await res.arrayBuffer());
      } catch (err) {
        lastErr = err;
        if (err.code === 'NOT_FOUND') throw err;
        if (attempt < retries) await sleep(500 * 2 ** attempt);
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastErr;
  }

  /** 取分支当前 commit；失败退回分支名（此时靠逐文件 sha256 兜底一致性） */
  async resolveRef() {
    try {
      const body = JSON.parse((await this.request(this.urls.ref, { retries: 1 })).toString('utf8'));
      const sha = body?.commit?.sha || body?.commit?.id;
      if (COMMIT_RE.test(sha || '')) return sha;
    } catch {
      /* 落到分支名 */
    }
    return this.branch;
  }

  rawUrl(ref, path) {
    const encoded = path.split('/').map(encodeURIComponent).join('/');
    return this.urls.raw.replace('{ref}', encodeURIComponent(ref)).replace('{path}', encoded);
  }

  async fetchIndex(ref) {
    return JSON.parse((await this.request(this.rawUrl(ref, 'index.json'))).toString('utf8'));
  }

  async fetchFile(ref, repoPath) {
    return this.request(this.rawUrl(ref, assertSafeRelPath(repoPath)));
  }

  /** 整仓 tar.gz（顶层目录 strip 1），只保留 prefix 下的文件 */
  async fetchArchive(ref, prefix) {
    const buf = await this.request(this.urls.archive.replace('{ref}', encodeURIComponent(ref)), {
      timeoutMs: this.archiveTimeoutMs,
      retries: 1,
    });
    const want = prefix ? `${prefix.replace(/\/$/, '')}/` : '';
    const all = readTar(buf, { strip: 1, filter: (p) => p.startsWith(want) });
    return new Map([...all].map(([p, b]) => [p.slice(want.length), b]));
  }
}

/** 由配置字符串创建来源：'gitee' | 'gitee:owner/repo@branch' | 本地目录 | *.tgz */
export function sourceFromSpec(spec, opts = {}) {
  if (!spec || spec === 'gitee') return new GiteeSource(opts);
  const m = /^gitee:([^/]+)\/([^@]+)(?:@(.+))?$/.exec(spec);
  if (m) return new GiteeSource({ ...opts, owner: m[1], repo: m[2], branch: m[3] || 'master' });
  if (/\.(tgz|tar\.gz)$/.test(spec)) return new TarballSource(spec);
  // 目录：即使此刻不存在 / 不可读也照样建 LocalSource —— 读取失败按网络类错误处理（宿主可退回离线基线），
  // 不能让一个配错的路径在构造阶段就把整个安装服务弄挂
  if (existsSync(join(spec, 'index.json')) || isAbsolute(spec) || spec.startsWith('.') || spec.includes('/') || spec.includes('\\')) {
    return new LocalSource(spec);
  }
  throw new Error(`无法识别的来源: ${spec}`);
}
