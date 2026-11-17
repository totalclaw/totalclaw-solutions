/**
 * 按停顿把录音切成一段段话（纯函数，输入是每 10ms 一帧的能量 dB）。
 *
 * 为什么用能量而不是 Silero VAD 判人声：用户给的 67 分钟真实会议录音里，有整分钟清清楚楚的发言
 * （Whisper 能转出 300 多字、置信正常）被 Silero 判成「不是人声」（阈值降到 0.2 也只认 7%），
 * 按它切会把这些话整段丢掉。我们要的只是「空白处」——比周围安静得多的地方，能量判得最稳；
 * 不是人声的响动（音乐、敲击）切出来交给 Whisper，它自己会判没有语音、吐不出字。
 *
 * 做法：
 *   1. 自适应门限：每秒取一个低分位（停顿的音量）和高分位（说话的音量），前后 30 秒里再取分位，
 *      门限 = 底噪 + max(6dB, 40% × (说话 − 底噪))。会议室里空调、远近不同的人都能跟住。
 *   2. 低于门限的帧是静音；短于 0.15 秒的静音不算停顿（字间的气口），短于 80ms 的响动当噪声去掉。
 *   3. 停顿 ≥ 0.5 秒处切开；还长于 20 秒的段在段内最长的停顿处再切（两边都至少 1 秒），
 *      连续说了 20 秒没有一个停顿的，在中间三分之一里能量最低的那一帧切。
 *   4. 短于 1 秒的段并到停顿更短的那个邻段——只在停顿短于 0.5 秒（即没到「真停顿」）时才并，并完不超过 20 秒。
 *      2026-11-17 起由 1.2 秒改成 0.5 秒：别人插的一句「嗯，行」「对」跟前后的长句隔着 0.6~0.9 秒，按 1.2 秒会被并进
 *      别人的段、文字和发言人一起归错（用户截图：「再说点」并进了远处另一个人的整句）。实测：插话测试会议 6 处插话
 *      归对 3 → 6（会议室混响版 3 → 4），原演示会议 5 种音质逐句结果完全不变，67 分钟真实会议与用户改定的发言人
 *      一致率不变（95.9%），段数 123 → 126。孤零零的短句（「好」「对」）保留，声纹太短不可靠的由 diarize 按前后文归属。
 *   5. 有效发声不足 0.25 秒的段丢掉；每段两头各留不超过 0.1 秒（也不超过停顿的一半）的余量。
 *
 * 有底噪时：能量先在功率域做 50ms 滑动平均（smoothFrames）——噪声帧的起伏变小，停顿里不再冒出 80ms 以上的
 * 「响动」把停顿打碎；配合调用方的高通（audio.ts frameEnergiesDb 的 highPassHz）去掉低频底噪。
 */

export interface SliceOptions {
  hopSec: number;
  minPauseSec: number;
  cutPauseSec: number;
  maxSliceSec: number;
  minSliceSec: number;
  mergeMaxGapSec: number;
  minSpeechSec: number;
  minBlipSec: number;
  padSec: number;
  floorWindowSec: number;
  minDeltaDb: number;
  /** 低于这个绝对音量一律算静音（数字静音时底噪是 -100dB，不能让门限跟着掉下去） */
  absSilenceDb: number;
  /** 判静音前能量在功率域做几帧的滑动平均（1 = 不平滑） */
  smoothFrames: number;
}

export const DEFAULT_SLICE_OPTIONS: SliceOptions = {
  hopSec: 0.01,
  minPauseSec: 0.15,
  cutPauseSec: 0.5,
  maxSliceSec: 20,
  minSliceSec: 1.0,
  mergeMaxGapSec: 0.5,
  minSpeechSec: 0.25,
  minBlipSec: 0.08,
  padSec: 0.1,
  floorWindowSec: 30,
  minDeltaDb: 6,
  absSilenceDb: -55,
  smoothFrames: 5,
};

export interface PlannedSlice {
  /** 秒 */
  start: number;
  end: number;
  /** 段内有效发声秒数 */
  speech: number;
}

/** 直方图（1dB 一格，-120~0dB）上取分位 */
const BINS = 121;
function histPercentile(hist: Int32Array | number[], total: number, p: number): number {
  if (total <= 0) return -120;
  const target = p * total;
  let acc = 0;
  for (let k = 0; k < BINS; k++) {
    acc += hist[k]!;
    if (acc >= target) return k - 120;
  }
  return 0;
}

/** 窗口里「停顿音量」和「说话音量」至少差这么多才算看得出哪里是空白；不够就把窗口放大再看 */
const MIN_CONTRAST_DB = 10;

/**
 * 每帧的静音门限（dB）。每秒一块，按块统计 1dB 直方图（前缀和，任意窗口的分位都是 O(121)）：
 * 底噪 = 窗口内第 5 百分位，说话 = 第 90 百分位。前后 15 秒里一直有人说话、看不出停顿音量时，
 * 依次放大到前后 60 秒、240 秒、整段再看（只看局部会把整段说话的音量当成底噪，整段都判成静音）。
 */
export function adaptiveThreshold(db: Float32Array, opts: Partial<SliceOptions> = {}): Float32Array {
  const o = { ...DEFAULT_SLICE_OPTIONS, ...opts };
  const n = db.length;
  const out = new Float32Array(n);
  if (!n) return out;
  const blockFrames = Math.max(1, Math.round(1 / o.hopSec));
  const nBlocks = Math.ceil(n / blockFrames);
  const prefix = new Int32Array((nBlocks + 1) * BINS);
  for (let b = 0; b < nBlocks; b++) {
    const base = (b + 1) * BINS;
    prefix.set(prefix.subarray(b * BINS, (b + 1) * BINS), base);
    for (let i = b * blockFrames; i < Math.min(n, (b + 1) * blockFrames); i++) {
      const k = Math.max(0, Math.min(BINS - 1, Math.round(db[i]!) + 120));
      prefix[base + k]!++;
    }
  }
  const hist = new Int32Array(BINS);
  const windowStats = (lo: number, hi: number) => {
    let total = 0;
    for (let k = 0; k < BINS; k++) { const v = prefix[hi * BINS + k]! - prefix[lo * BINS + k]!; hist[k] = v; total += v; }
    return { floor: histPercentile(hist, total, 0.05), speech: histPercentile(hist, total, 0.9), median: histPercentile(hist, total, 0.5) };
  };
  const halves = [Math.max(1, Math.round(o.floorWindowSec / 2)), 60, 240, nBlocks];
  const blockThr = new Float32Array(nBlocks);
  for (let b = 0; b < nBlocks; b++) {
    let st = windowStats(Math.max(0, b - halves[0]!), Math.min(nBlocks, b + halves[0]! + 1));
    for (let h = 1; h < halves.length && st.speech - st.floor < MIN_CONTRAST_DB; h++) {
      st = windowStats(Math.max(0, b - halves[h]!), Math.min(nBlocks, b + halves[h]! + 1));
    }
    if (st.speech - st.floor < MIN_CONTRAST_DB) {
      // 整段都看不出停顿：响的当全程有声，静的当全程静音
      blockThr[b] = st.median > -40 ? st.floor - 1 : st.speech + 1;
      continue;
    }
    const delta = Math.max(o.minDeltaDb, 0.4 * (st.speech - st.floor));
    blockThr[b] = Math.max(o.absSilenceDb, st.floor + delta);
  }
  // 块中心之间线性插值，门限不出台阶
  for (let i = 0; i < n; i++) {
    const pos = i / blockFrames - 0.5;
    const b0 = Math.max(0, Math.min(nBlocks - 1, Math.floor(pos)));
    const b1 = Math.min(nBlocks - 1, b0 + 1);
    const w = Math.max(0, Math.min(1, pos - b0));
    out[i] = blockThr[b0]! * (1 - w) + blockThr[b1]! * w;
  }
  return out;
}

/** 有声帧：高于门限；补上字间短气口、去掉零碎响动 */
export function speechMask(db: Float32Array, thr: Float32Array, opts: Partial<SliceOptions> = {}): Uint8Array {
  const o = { ...DEFAULT_SLICE_OPTIONS, ...opts };
  const n = db.length;
  const m = new Uint8Array(n);
  for (let i = 0; i < n; i++) m[i] = db[i]! > thr[i]! ? 1 : 0;
  const minGap = Math.round(o.minPauseSec / o.hopSec);
  const minBlip = Math.round(o.minBlipSec / o.hopSec);
  // 补气口：两段有声之间的静音短于 minGap 就填上
  let i = 0;
  while (i < n) {
    if (m[i]) { i++; continue; }
    let j = i;
    while (j < n && !m[j]) j++;
    if (i > 0 && j < n && j - i < minGap) m.fill(1, i, j);
    i = j;
  }
  // 去零碎响动
  i = 0;
  while (i < n) {
    if (!m[i]) { i++; continue; }
    let j = i;
    while (j < n && m[j]) j++;
    if (j - i < minBlip) m.fill(0, i, j);
    i = j;
  }
  return m;
}

interface Run { s: number; e: number }

function runsOf(mask: Uint8Array): Run[] {
  const runs: Run[] = [];
  let i = 0;
  while (i < mask.length) {
    if (!mask[i]) { i++; continue; }
    let j = i;
    while (j < mask.length && mask[j]) j++;
    runs.push({ s: i, e: j });
    i = j;
  }
  return runs;
}

/** 把一组连续的 run 拆到每段都不超过 maxFrames（段内最长停顿处切；没有停顿就在中段能量最低处切） */
function splitLong(group: Run[], db: Float32Array, maxFrames: number, minSideFrames: number): Run[][] {
  const len = group[group.length - 1]!.e - group[0]!.s;
  if (len <= maxFrames) return [group];
  let best = -1;
  let bestGap = -1;
  for (let k = 0; k < group.length - 1; k++) {
    const gap = group[k + 1]!.s - group[k]!.e;
    const left = group[k]!.e - group[0]!.s;
    const right = group[group.length - 1]!.e - group[k + 1]!.s;
    if (left < minSideFrames || right < minSideFrames) continue;
    if (gap > bestGap) { bestGap = gap; best = k; }
  }
  if (best >= 0) {
    return [
      ...splitLong(group.slice(0, best + 1), db, maxFrames, minSideFrames),
      ...splitLong(group.slice(best + 1), db, maxFrames, minSideFrames),
    ];
  }
  // 没有可用的停顿：在整段中间三分之一里找能量最低的一帧硬切
  const s0 = group[0]!.s;
  const from = s0 + Math.floor(len / 3);
  const to = s0 + Math.ceil(len * 2 / 3);
  let cut = from;
  let minDb = Infinity;
  for (let f = from; f < to; f++) {
    // 平滑一下，免得切在单个尖谷上
    const v = (db[f - 1] ?? db[f]!) + db[f]! + (db[f + 1] ?? db[f]!);
    if (v < minDb) { minDb = v; cut = f; }
  }
  const left: Run[] = [];
  const right: Run[] = [];
  for (const r of group) {
    if (r.e <= cut) left.push(r);
    else if (r.s >= cut) right.push(r);
    else { left.push({ s: r.s, e: cut }); right.push({ s: cut, e: r.e }); }
  }
  if (!left.length || !right.length) return [group];
  return [...splitLong(left, db, maxFrames, minSideFrames), ...splitLong(right, db, maxFrames, minSideFrames)];
}

/** 功率域滑动平均（窗口 w 帧，居中）；dB 进 dB 出 */
export function smoothDb(db: Float32Array, w: number): Float32Array {
  const n = db.length;
  if (w <= 1 || n === 0) return db;
  const half = Math.floor(w / 2);
  const p = new Float64Array(n);
  for (let i = 0; i < n; i++) p[i] = 10 ** (db[i]! / 10);
  const prefix = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i]! + p[i]!;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - half);
    const hi = Math.min(n, i - half + w);
    out[i] = 10 * Math.log10(Math.max(1e-12, (prefix[hi]! - prefix[lo]!) / (hi - lo)));
  }
  return out;
}

/** 主入口：能量帧 → 切片 */
export function planSlices(rawDb: Float32Array, opts: Partial<SliceOptions> = {}): PlannedSlice[] {
  const o = { ...DEFAULT_SLICE_OPTIONS, ...opts };
  const db = smoothDb(rawDb, o.smoothFrames);
  const thr = adaptiveThreshold(db, o);
  const mask = speechMask(db, thr, o);
  const runs = runsOf(mask);
  if (!runs.length) return [];
  const f = (sec: number) => Math.round(sec / o.hopSec);
  const cutFrames = f(o.cutPauseSec);
  const maxFrames = f(o.maxSliceSec);
  const minFrames = f(o.minSliceSec);
  const mergeGap = f(o.mergeMaxGapSec);

  // 1. 停顿够长处切开
  let groups: Run[][] = [];
  let cur: Run[] = [runs[0]!];
  for (let k = 1; k < runs.length; k++) {
    if (runs[k]!.s - runs[k - 1]!.e >= cutFrames) { groups.push(cur); cur = []; }
    cur.push(runs[k]!);
  }
  groups.push(cur);

  // 2. 过长的段再切
  groups = groups.flatMap(g => splitLong(g, db, maxFrames, minFrames));

  // 3. 过短的段并到停顿更短的邻段
  const lenOf = (g: Run[]) => g[g.length - 1]!.e - g[0]!.s;
  let changed = true;
  while (changed) {
    changed = false;
    for (let k = 0; k < groups.length; k++) {
      const g = groups[k]!;
      if (lenOf(g) >= minFrames) continue;
      const prev = k > 0 ? groups[k - 1]! : null;
      const next = k < groups.length - 1 ? groups[k + 1]! : null;
      const gapPrev = prev ? g[0]!.s - prev[prev.length - 1]!.e : Infinity;
      const gapNext = next ? next[0]!.s - g[g.length - 1]!.e : Infinity;
      const okPrev = !!prev && gapPrev <= mergeGap && g[g.length - 1]!.e - prev[0]!.s <= maxFrames;
      const okNext = !!next && gapNext <= mergeGap && next[next.length - 1]!.e - g[0]!.s <= maxFrames;
      if (okPrev && (!okNext || gapPrev <= gapNext)) {
        groups.splice(k - 1, 2, [...prev!, ...g]);
        changed = true;
        break;
      }
      if (okNext) {
        groups.splice(k, 2, [...g, ...next!]);
        changed = true;
        break;
      }
    }
  }

  // 4. 输出（去掉太短的发声，两头留余量）
  const minSpeech = f(o.minSpeechSec);
  const pad = f(o.padSec);
  const kept = groups.filter(g => g.reduce((s, r) => s + r.e - r.s, 0) >= minSpeech);
  const total = db.length;
  return kept.map((g, k) => {
    const s = g[0]!.s;
    const e = g[g.length - 1]!.e;
    const prevEnd = k > 0 ? kept[k - 1]![kept[k - 1]!.length - 1]!.e : 0;
    const nextStart = k < kept.length - 1 ? kept[k + 1]![0]!.s : total;
    const padL = Math.min(pad, Math.floor((s - prevEnd) / 2));
    const padR = Math.min(pad, Math.floor((nextStart - e) / 2));
    const speech = g.reduce((acc, r) => acc + r.e - r.s, 0);
    return {
      start: round3((s - Math.max(0, padL)) * o.hopSec),
      end: round3((e + Math.max(0, padR)) * o.hopSec),
      speech: round3(speech * o.hopSec),
    };
  });
}

function round3(x: number): number {
  return Math.round(x * 1000) / 1000;
}

/** 切片时长分布（日志 / 实测报告用） */
export function sliceStats(slices: PlannedSlice[]): { count: number; total: number; speech: number; min: number; p50: number; p90: number; max: number; mean: number } {
  const d = slices.map(s => s.end - s.start);
  const sorted = d.slice().sort((a, b) => a - b);
  const pick = (p: number) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.round((sorted.length - 1) * p))]! : 0;
  const total = d.reduce((a, b) => a + b, 0);
  return {
    count: d.length,
    total: round3(total),
    speech: round3(slices.reduce((a, s) => a + s.speech, 0)),
    min: round3(pick(0)), p50: round3(pick(0.5)), p90: round3(pick(0.9)), max: round3(pick(1)),
    mean: round3(d.length ? total / d.length : 0),
  };
}
