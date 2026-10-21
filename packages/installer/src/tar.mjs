// 零依赖 tar(.gz) 读写：读取支持 ustar / pax(x,g) / GNU longname(L)；写入为确定性 ustar + pax 长路径。
import { gunzipSync, gzipSync } from 'node:zlib';
import { assertSafeRelPath } from './fsutil.mjs';

const BLOCK = 512;

function readString(buf, off, len) {
  const end = buf.indexOf(0, off);
  return buf.toString('utf8', off, end >= 0 && end < off + len ? end : off + len);
}

function readOctal(buf, off, len) {
  const s = readString(buf, off, len).trim();
  return s ? parseInt(s, 8) : 0;
}

function parsePax(buf) {
  const out = {};
  let i = 0;
  while (i < buf.length) {
    const sp = buf.indexOf(0x20, i);
    if (sp < 0) break;
    const len = parseInt(buf.toString('utf8', i, sp), 10);
    if (!len) break;
    const rec = buf.toString('utf8', sp + 1, i + len - 1);
    const eq = rec.indexOf('=');
    if (eq > 0) out[rec.slice(0, eq)] = rec.slice(eq + 1);
    i += len;
  }
  return out;
}

/**
 * 解析 tar（可为 gzip），返回 Map<path, Buffer>（只含普通文件）。
 * @param {Buffer} data
 * @param {{ strip?: number, filter?: (path:string)=>boolean }} opts
 */
export function readTar(data, { strip = 0, filter } = {}) {
  const buf = data[0] === 0x1f && data[1] === 0x8b ? gunzipSync(data) : data;
  const files = new Map();
  let off = 0;
  let longName = null;
  let pax = {};
  let globalPax = {};
  while (off + BLOCK <= buf.length) {
    const header = buf.subarray(off, off + BLOCK);
    if (header.every((b) => b === 0)) break;
    const size = readOctal(header, 124, 12);
    const type = String.fromCharCode(header[156] || 0x30);
    const body = buf.subarray(off + BLOCK, off + BLOCK + size);
    off += BLOCK + Math.ceil(size / BLOCK) * BLOCK;

    if (type === 'x') {
      pax = parsePax(body);
      continue;
    }
    if (type === 'g') {
      globalPax = { ...globalPax, ...parsePax(body) };
      continue;
    }
    if (type === 'L') {
      longName = readString(body, 0, body.length);
      continue;
    }
    const prefix = readString(header, 345, 155);
    const rawName = readString(header, 0, 100);
    let name = pax.path || longName || (prefix ? `${prefix}/${rawName}` : rawName);
    void globalPax;
    pax = {};
    longName = null;
    if (type !== '0' && type !== '\0' && type !== '7') continue; // 只要普通文件；目录/链接一律忽略
    name = name.replace(/^\.\//, '');
    const parts = name.split('/').filter(Boolean);
    if (parts.length <= strip) continue;
    const rel = parts.slice(strip).join('/');
    assertSafeRelPath(rel);
    if (filter && !filter(rel)) continue;
    files.set(rel, Buffer.from(body));
  }
  return files;
}

function octal(n, len) {
  return n.toString(8).padStart(len - 1, '0') + '\0';
}

function header(name, size, type = '0', mtime = 0) {
  const h = Buffer.alloc(BLOCK, 0);
  h.write(name, 0, 100, 'utf8');
  h.write(octal(0o644, 8), 100, 'ascii');
  h.write(octal(0, 8), 108, 'ascii');
  h.write(octal(0, 8), 116, 'ascii');
  h.write(octal(size, 12), 124, 'ascii');
  h.write(octal(mtime, 12), 136, 'ascii');
  h.write('        ', 148, 'ascii');
  h.write(type, 156, 'ascii');
  h.write('ustar\0', 257, 'ascii');
  h.write('00', 263, 'ascii');
  let sum = 0;
  for (const b of h) sum += b;
  h.write(octal(sum, 7) + ' ', 148, 'ascii');
  return h;
}

function pad(size) {
  const rest = size % BLOCK;
  return rest ? Buffer.alloc(BLOCK - rest, 0) : Buffer.alloc(0);
}

/**
 * 写确定性 tar.gz：条目按路径排序、mtime 固定 0、权限 0644。
 * @param {Array<{path:string, data:Buffer}>} entries
 */
export function writeTarGz(entries) {
  const chunks = [];
  for (const { path, data } of [...entries].sort((a, b) => (a.path < b.path ? -1 : 1))) {
    assertSafeRelPath(path);
    if (Buffer.byteLength(path) > 99) {
      const rec = (n) => `${n} path=${path}\n`;
      let len = Buffer.byteLength(rec(0));
      while (Buffer.byteLength(rec(len)) !== len) len = Buffer.byteLength(rec(len));
      const paxBody = Buffer.from(rec(len), 'utf8');
      chunks.push(header('PaxHeader', paxBody.length, 'x'), paxBody, pad(paxBody.length));
      chunks.push(header(Buffer.from(path).subarray(0, 99).toString('utf8').replace(/�$/, ''), data.length));
    } else {
      chunks.push(header(path, data.length));
    }
    chunks.push(data, pad(data.length));
  }
  chunks.push(Buffer.alloc(BLOCK * 2, 0));
  return gzipSync(Buffer.concat(chunks), { level: 9 });
}
