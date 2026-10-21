// 方案仓库工具脚本共用的小工具（零依赖）。
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, renameSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SOLUTIONS_DIR = join(REPO_ROOT, 'solutions');

/** 单文件上限：超过的文件不入 git，改走 largeAssets 懒下载 */
export const MAX_FILE_BYTES = 2 * 1024 * 1024;

export const ID_RE = /^[a-z0-9][a-z0-9-]{1,79}$/;

/** 不进方案包的文件 */
export const IGNORED_NAMES = new Set(['.DS_Store', 'Thumbs.db', '__pycache__', 'node_modules', '.git']);

export function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

export function toPosix(p) {
  return p.split(sep).join('/');
}

export function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** 稳定格式 JSON 写入（2 空格缩进 + 结尾换行），tmp + rename 原子替换 */
export function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n');
  renameSync(tmp, file);
}

/** 递归列出目录下所有文件（POSIX 相对路径，排序），跳过 IGNORED_NAMES */
export function walkFiles(root) {
  const out = [];
  const visit = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      if (IGNORED_NAMES.has(name)) continue;
      const abs = join(dir, name);
      const st = statSync(abs);
      if (st.isDirectory()) visit(abs);
      else if (st.isFile()) out.push(toPosix(relative(root, abs)));
    }
  };
  visit(root);
  return out;
}

/** 列出所有方案目录（含 solution.json），按目录名排序 */
export function listSolutionDirs() {
  return readdirSync(SOLUTIONS_DIR)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => {
      try {
        return statSync(join(SOLUTIONS_DIR, name, 'solution.json')).isFile();
      } catch {
        return false;
      }
    })
    .sort();
}

/** 方案包内的文件清单与 treeDigest：直接复用安装器实现，保证生成端与校验端算法一致 */
export { digestDir as fileManifest, treeDigest } from '../../packages/installer/src/digest.mjs';

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) args[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[k] = argv[++i];
      else args[k] = true;
    } else args._.push(a);
  }
  return args;
}
