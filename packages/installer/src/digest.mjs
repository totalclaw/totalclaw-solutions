// 内容哈希：逐文件 sha256 + 整包 treeDigest（与 tools/build-index.mjs 生成 index.json 的算法一致）。
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const IGNORED_NAMES = new Set(['.DS_Store', 'Thumbs.db', '__pycache__', 'node_modules', '.git']);

export function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

/** treeDigest = sha256(按 path 排序后逐行 `path\0sha256\n`) */
export function treeDigest(files) {
  const lines = [...files]
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((f) => `${f.path}\0${f.sha256}\n`)
    .join('');
  return sha256(Buffer.from(lines, 'utf8'));
}

/** 递归列出目录文件（POSIX 相对路径，排序），跳过 IGNORED_NAMES */
export function walkFiles(root) {
  const out = [];
  const visit = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      if (IGNORED_NAMES.has(name)) continue;
      const abs = join(dir, name);
      const st = statSync(abs);
      if (st.isDirectory()) visit(abs);
      else if (st.isFile()) out.push(relative(root, abs).split(sep).join('/'));
    }
  };
  visit(root);
  return out;
}

/** 目录 → { files:[{path,size,sha256}], treeDigest } */
export function digestDir(dir) {
  const files = walkFiles(dir).map((path) => {
    const buf = readFileSync(join(dir, path));
    return { path, size: buf.length, sha256: sha256(buf) };
  });
  return { files, treeDigest: treeDigest(files) };
}
