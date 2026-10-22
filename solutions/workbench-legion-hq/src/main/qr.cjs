/**
 * 二维码编码（S3：大屏 / 手机遥控地址扫码打开）。不依赖第三方库（方案包拿不到宿主之外的 npm 包）。
 * 范围：字节模式、纠错等级 M、版本 1–10（最多 213 字节，局域网地址 + 口令约 50–60 字节）。
 * 按 ISO/IEC 18004 实现；单测与 npm qrcode 逐模块比对。
 */

// 纠错等级 M：[每块纠错码字数, [块数, 每块数据码字数], ...]
const EC_M = {
  1: [10, [1, 16]],
  2: [16, [1, 28]],
  3: [26, [1, 44]],
  4: [18, [2, 32]],
  5: [24, [2, 43]],
  6: [16, [4, 27]],
  7: [18, [4, 31]],
  8: [22, [2, 38], [2, 39]],
  9: [22, [3, 36], [2, 37]],
  10: [26, [4, 43], [1, 44]],
};
const ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50] };

// ── GF(256) ──
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();
const gmul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

function rsGenerator(degree) {
  let g = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      next[j] ^= g[j];
      next[j + 1] ^= gmul(g[j], EXP[i]);
    }
    g = next;
  }
  return g;
}

function rsRemainder(data, degree) {
  const gen = rsGenerator(degree);
  const res = new Array(degree).fill(0);
  for (const b of data) {
    const factor = b ^ res.shift();
    res.push(0);
    for (let i = 0; i < degree; i++) res[i] ^= gmul(gen[i + 1], factor);
  }
  return res;
}

function dataCapacity(version) {
  const [, ...groups] = EC_M[version];
  return groups.reduce((n, [blocks, dc]) => n + blocks * dc, 0);
}

function pickVersion(len) {
  for (let v = 1; v <= 10; v++) {
    const countBits = v < 10 ? 8 : 16;
    if (4 + countBits + len * 8 <= dataCapacity(v) * 8) return v;
  }
  throw new Error('二维码内容太长（最多约 200 个字节）');
}

/** 数据 → 码字（含填充），再分块加纠错、交织 */
function buildCodewords(bytes, version) {
  const cap = dataCapacity(version);
  const bits = [];
  const put = (val, n) => {
    for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  put(0b0100, 4);
  put(bytes.length, version < 10 ? 8 : 16);
  for (const b of bytes) put(b, 8);
  put(0, Math.min(4, cap * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  for (let pad = 0xec; data.length < cap; pad ^= 0xec ^ 0x11) data.push(pad);

  const [ecLen, ...groups] = EC_M[version];
  const blocks = [];
  let off = 0;
  for (const [count, dc] of groups) {
    for (let i = 0; i < count; i++) {
      const d = data.slice(off, off + dc);
      off += dc;
      blocks.push({ d, e: rsRemainder(d, ecLen) });
    }
  }
  const out = [];
  const maxD = Math.max(...blocks.map((b) => b.d.length));
  for (let i = 0; i < maxD; i++) for (const b of blocks) if (i < b.d.length) out.push(b.d[i]);
  for (let i = 0; i < ecLen; i++) for (const b of blocks) out.push(b.e[i]);
  return out;
}

function bchFormat(mask) {
  const data = (0b00 << 3) | mask; // 纠错等级 M = 00
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}

function bchVersion(version) {
  let rem = version;
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  return (version << 12) | rem;
}

const MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function baseMatrix(version) {
  const size = version * 4 + 17;
  const m = Array.from({ length: size }, () => new Array(size).fill(false));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (r, c, v) => {
    m[r][c] = v;
    fn[r][c] = true;
  };
  // 定位图形 + 分隔符
  for (const [r0, c0] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
        set(rr, cc, ring !== 2 && ring !== 4);
      }
    }
  }
  // 时序图形
  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  // 校正图形
  const pos = ALIGN[version];
  for (const r of pos) {
    for (const c of pos) {
      if ((r === 6 && c === 6) || (r === 6 && c === pos[pos.length - 1]) || (r === pos[pos.length - 1] && c === 6)) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
    }
  }
  // 格式信息区占位 + 暗模块
  for (let i = 0; i < 9; i++) {
    fn[8][i] = true;
    fn[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    fn[8][size - 1 - i] = true;
    fn[size - 1 - i][8] = true;
  }
  set(size - 8, 8, true);
  // 版本信息（v≥7）
  if (version >= 7) {
    const bits = bchVersion(version);
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, bit);
      set(b, a, bit);
    }
  }
  return { m, fn, size };
}

function placeData(m, fn, size, codewords) {
  const bits = [];
  for (const cw of codewords) for (let i = 7; i >= 0; i--) bits.push((cw >>> i) & 1);
  let i = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let k = 0; k < size; k++) {
      const r = upward ? size - 1 - k : k;
      for (let j = 0; j < 2; j++) {
        const c = right - j;
        if (fn[r][c]) continue;
        m[r][c] = i < bits.length ? bits[i] === 1 : false;
        i++;
      }
    }
    upward = !upward;
  }
}

function drawFormat(m, size, mask) {
  const bits = bchFormat(mask);
  const bit = (i) => ((bits >>> i) & 1) === 1;
  // 第一份：左上定位图形旁（第 8 列自上而下 + 第 8 行自右向左）
  for (let i = 0; i <= 5; i++) m[i][8] = bit(i);
  m[7][8] = bit(6);
  m[8][8] = bit(7);
  m[8][7] = bit(8);
  for (let i = 9; i < 15; i++) m[8][14 - i] = bit(i);
  // 第二份：右上（第 8 行）+ 左下（第 8 列）
  for (let i = 0; i < 8; i++) m[8][size - 1 - i] = bit(i);
  for (let i = 8; i < 15; i++) m[size - 15 + i][8] = bit(i);
  m[size - 8][8] = true; // 暗模块
}

function penalty(m, size) {
  let score = 0;
  const lineRuns = (get) => {
    for (let a = 0; a < size; a++) {
      let run = 1;
      for (let b = 1; b < size; b++) {
        if (get(a, b) === get(a, b - 1)) run++;
        else {
          if (run >= 5) score += run - 2;
          run = 1;
        }
      }
      if (run >= 5) score += run - 2;
    }
  };
  lineRuns((a, b) => m[a][b]);
  lineRuns((a, b) => m[b][a]);
  for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++) if (m[r][c] === m[r][c + 1] && m[r][c] === m[r + 1][c] && m[r][c] === m[r + 1][c + 1]) score += 3;
  const pat1 = [true, false, true, true, true, false, true, false, false, false, false];
  const pat2 = [false, false, false, false, true, false, true, true, true, false, true];
  const hits = (get) => {
    for (let a = 0; a < size; a++) {
      for (let b = 0; b + 11 <= size; b++) {
        let p1 = true;
        let p2 = true;
        for (let k = 0; k < 11; k++) {
          const v = get(a, b + k);
          if (v !== pat1[k]) p1 = false;
          if (v !== pat2[k]) p2 = false;
        }
        if (p1) score += 40;
        if (p2) score += 40;
      }
    }
  };
  hits((a, b) => m[a][b]);
  hits((a, b) => m[b][a]);
  let dark = 0;
  for (const row of m) for (const v of row) if (v) dark++;
  score += Math.floor(Math.abs((dark * 20) / (size * size) - 10)) * 10;
  return score;
}

/**
 * @param {string} text
 * @param {{ mask?: number, version?: number }} [opts] 指定掩码 / 版本（单测比对用）
 * @returns {{ size: number, version: number, mask: number, modules: boolean[][] }}
 */
function encode(text, opts = {}) {
  const bytes = [...Buffer.from(String(text), 'utf8')];
  const version = opts.version || pickVersion(bytes.length);
  const codewords = buildCodewords(bytes, version);
  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    if (opts.mask != null && mask !== opts.mask) continue;
    const { m, fn, size } = baseMatrix(version);
    placeData(m, fn, size, codewords);
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!fn[r][c] && MASKS[mask](r, c)) m[r][c] = !m[r][c];
    drawFormat(m, size, mask);
    const score = penalty(m, size);
    if (!best || score < best.score) best = { size, version, mask, modules: m, score };
  }
  const { score, ...out } = best;
  return out;
}

/** 二维码 → SVG（白底黑块，含 4 格静区） */
function toSvg(text, { scale = 6, dark = '#111827', light = '#ffffff' } = {}) {
  const { size, modules } = encode(text);
  const q = 4;
  const n = size + q * 2;
  let d = '';
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (modules[r][c]) d += `M${c + q} ${r + q}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${n * scale}" height="${n * scale}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="${light}"/><path d="${d}" fill="${dark}"/></svg>`;
}

module.exports = { encode, toSvg };
