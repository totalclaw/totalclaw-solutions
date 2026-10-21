// 文件系统小工具：原子写、越界防护、稳健 rename。
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';

export class PathEscapeError extends Error {
  constructor(base, target) {
    super(`路径越界：${target} 不在 ${base} 内`);
    this.code = 'PATH_ESCAPE';
  }
}

/**
 * 校验包内相对路径：POSIX、非空、无 `..`、非绝对、无盘符、无 NUL、无反斜杠。
 * 用于下载文件落盘与 tar 解包（zip-slip 防护）。
 */
export function assertSafeRelPath(p) {
  if (typeof p !== 'string' || !p || p.includes('\0') || p.includes('\\')) throw new PathEscapeError('.', String(p));
  if (p.startsWith('/') || /^[A-Za-z]:/.test(p)) throw new PathEscapeError('.', p);
  if (p.split('/').some((seg) => seg === '..' || seg === '')) throw new PathEscapeError('.', p);
  return p;
}

/** base 内安全拼接：结果必须仍在 base 内 */
export function safeJoin(base, rel) {
  const abs = resolve(base, normalize(rel));
  const r = relative(resolve(base), abs);
  if (r === '' || (!r.startsWith('..') && !isAbsolute(r) && !r.split(sep).includes('..'))) return abs;
  throw new PathEscapeError(base, rel);
}

export function readJsonFile(file, fallback = null) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

/** tmp + rename 原子写 JSON */
export function writeJsonAtomic(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
  writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n');
  renameSync(tmp, file);
}

/** rename，跨设备（EXDEV）时退化为复制 + 删除 */
export function moveDir(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  try {
    renameSync(from, to);
  } catch (err) {
    if (err.code !== 'EXDEV') throw err;
    cpSync(from, to, { recursive: true });
    rmSync(from, { recursive: true, force: true });
  }
}

export function rmrf(p) {
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

export function ensureDir(p) {
  mkdirSync(p, { recursive: true });
  return p;
}

export { join };
