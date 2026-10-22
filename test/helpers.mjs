// 测试夹具：在临时目录里造一个迷你方案仓库（结构与真仓库一致）。
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { digestDir } from '../packages/installer/src/digest.mjs';
import { writeTarGz } from '../packages/installer/src/tar.mjs';

export function tmp(prefix = 'tcsol-') {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function write(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
}

export function manifest(id, version, extra = {}) {
  return {
    manifestVersion: 2,
    schemaVersion: 1,
    id,
    name: extra.name || `方案${id}`,
    aliases: extra.aliases || [],
    version,
    kind: 'workbench',
    category: '测试',
    icon: 'icon-solutions',
    order: 1,
    description: `${id} 测试方案`,
    access: { requiresSolutionGrant: false, feature: null, hidden: false },
    compat: { minAppVersion: '2.0.0', hostApi: 1, ...(extra.compat || {}) },
    runtime: { mode: 'bundled', runner: 'workbench', route: `/workbenches/${id}`, renderer: null, main: null },
    dependsOn: extra.dependsOn || [],
    data: { schemaVersion: extra.dataSchemaVersion || 1, paths: extra.dataPaths || [`${id}/`], localStorage: [] },
    capabilities: extra.capabilities || [],
    largeAssets: [],
  };
}

/** 写入/更新一个方案，并重建 index.json + index/<id>.json */
export function putSolution(repo, id, version, { files = {}, ...extra } = {}) {
  const dir = join(repo, 'solutions', id);
  write(join(dir, 'solution.json'), manifest(id, version, extra));
  write(join(dir, 'CHANGELOG.md'), `# ${id}\n\n## ${version}\n\n- 测试版本\n`);
  for (const [p, c] of Object.entries({ 'src/main.js': `export const v = '${version}';\n`, ...files })) write(join(dir, p), c);
  rebuildIndex(repo);
}

export function rebuildIndex(repo, { removed = [] } = {}) {
  const items = [];
  for (const id of readdirSync(join(repo, 'solutions')).sort()) {
    const dir = join(repo, 'solutions', id);
    const m = JSON.parse(readFileSync(join(dir, 'solution.json'), 'utf8'));
    const { files, treeDigest } = digestDir(dir);
    const item = { ...m, path: `solutions/${id}`, fileCount: files.length, size: files.reduce((n, f) => n + f.size, 0), treeDigest, filesRef: `index/${id}.json` };
    write(join(repo, 'index', `${id}.json`), { id, version: m.version, treeDigest, files });
    items.push(item);
  }
  write(join(repo, 'index.json'), { schemaVersion: 2, kind: 'solution-index', removed, items });
}

/** 打成 gitee 整仓归档格式（顶层目录 <repo>-<ref>/） */
export function archiveOf(repo, top = 'totalclaw-solutions-master') {
  const { files } = digestDir(repo);
  return writeTarGz(files.map((f) => ({ path: `${top}/${f.path}`, data: readFileSync(join(repo, f.path)) })));
}

/** 模拟 gitee 的 fetch：raw / archive / branches API */
export function fakeGiteeFetch(repo, { sha = 'a'.repeat(40), log = [], failRaw = false, blockRaw = [], archiveHtml = false } = {}) {
  return async (url) => {
    log.push(url);
    const ok = (buf) => ({ ok: true, status: 200, arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) });
    if (url.includes('/api/v5/repos/')) return ok(Buffer.from(JSON.stringify({ commit: { sha } })));
    // 真 gitee 对部分 User-Agent 的归档请求回一张 HTML 页面（200）
    if (url.includes('/repository/archive/')) return ok(archiveHtml ? Buffer.from('<!DOCTYPE html><html></html>') : archiveOf(repo));
    const m = /\/raw\/([^/]+)\/(.+)$/.exec(url);
    if (m) {
      if (failRaw && !m[2].startsWith('index')) return { ok: false, status: 503, arrayBuffer: async () => new ArrayBuffer(0) };
      // gitee 按内容屏蔽单个文件：451
      if (blockRaw.some((b) => decodeURIComponent(m[2]).endsWith(b))) return { ok: false, status: 451, arrayBuffer: async () => new ArrayBuffer(0) };
      const p = m[2].split('/').map(decodeURIComponent).join('/');
      try {
        return ok(readFileSync(join(repo, p)));
      } catch {
        return { ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0) };
      }
    }
    return { ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0) };
  };
}
