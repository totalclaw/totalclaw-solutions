/**
 * B1 控制测试的样本量与抽样（纯函数）。
 *
 * 样本量按属性抽样口径（control-testing「预期偏差率 / 可容忍偏差率 / 置信水平」）：
 *   取最小的允许偏差数 k，使「允许 k 个偏差时的最小样本量 n_k」满足 n_k × 预期偏差率 ≤ k；
 *   n_k = 使二项分布 P(X ≤ k | n, 可容忍偏差率) ≤ 1 − 置信水平 的最小 n。
 *   这与 AICPA 属性抽样表同一算法（95%：可容忍 5% / 预期 0 → 59；预期 1% → 93；10% / 0 → 29）。
 * 另设按控制频率的最小样本量表作为下限（年 1 / 季 2 / 月 2 / 周 5 / 日 25 / 多次 25），
 * 最终样本量 = min(总体, max(属性抽样, 频率下限))；总体不超过样本量时全量测试。
 *
 * 抽样用固定种子的伪随机（mulberry32 + 部分 Fisher–Yates）：同一种子两次抽样结果完全相同，可复现。
 */
import type { FauControlFrequency, FauSamplePlan } from '@totalclaw/ipc-contracts';

const MAX_N = 5000;

function logChoose(n: number, k: number): number {
  let s = 0;
  for (let i = 1; i <= k; i += 1) s += Math.log(n - k + i) - Math.log(i);
  return s;
}

/** P(X ≤ k)，X ~ Binomial(n, p) */
export function binomCdf(k: number, n: number, p: number): number {
  if (p <= 0) return 1;
  if (p >= 1) return k >= n ? 1 : 0;
  let sum = 0;
  for (let i = 0; i <= Math.min(k, n); i += 1) sum += Math.exp(logChoose(n, i) + i * Math.log(p) + (n - i) * Math.log(1 - p));
  return Math.min(1, sum);
}

/** 允许 k 个偏差时的最小样本量；超过上限返回 null */
export function minNForDeviations(k: number, tolerable: number, confidence: number): number | null {
  const alpha = 1 - confidence;
  for (let n = Math.max(1, k + 1); n <= MAX_N; n += 1) if (binomCdf(k, n, tolerable) <= alpha) return n;
  return null;
}

/** 属性抽样样本量；预期偏差率 ≥ 可容忍偏差率时无解（返回 null，AICPA 表里的「*」） */
export function attributeSampleSize(expected: number, tolerable: number, confidence: number): { n: number; k: number } | null {
  if (!(tolerable > 0 && tolerable < 1) || !(confidence > 0 && confidence < 1) || expected < 0 || expected >= tolerable) return null;
  for (let k = 0; k <= 200; k += 1) {
    const n = minNForDeviations(k, tolerable, confidence);
    if (n === null) return null;
    if (n * expected <= k + 1e-9) return { n, k };
  }
  return null;
}

export function frequencyMinimum(freq: FauControlFrequency, th: Record<string, number>): number {
  return Math.max(1, Math.round(th[`minSample.${freq}`] ?? ({ annual: 1, quarterly: 2, monthly: 2, weekly: 5, daily: 25, multiple: 25 } as const)[freq]));
}

export function samplePlan(input: {
  controlId: string; frequency: FauControlFrequency; population: number;
  expectedRate?: number | null; tolerableRate?: number | null; confidence?: number | null; seed: number;
}, th: Record<string, number>): FauSamplePlan {
  const expectedRate = input.expectedRate ?? th['sample.expectedRate'] ?? 0;
  const tolerableRate = input.tolerableRate ?? th['sample.tolerableRate'] ?? 0.05;
  const confidence = input.confidence ?? th['sample.confidence'] ?? 0.95;
  const attr = attributeSampleSize(expectedRate, tolerableRate, confidence);
  const frequencyMin = frequencyMinimum(input.frequency, th);
  // 无解（预期 ≥ 可容忍）时不能靠抽样下结论：全量测试
  const want = attr ? Math.max(attr.n, frequencyMin) : input.population;
  const n = Math.min(input.population, want);
  return {
    controlId: input.controlId, frequency: input.frequency, population: input.population, expectedRate, tolerableRate, confidence,
    attributeN: attr?.n ?? 0, allowedDeviations: attr?.k ?? 0, frequencyMin, n, testAll: n >= input.population, seed: input.seed,
  };
}

/** mulberry32：32 位种子的小型伪随机数发生器，结果只取决于种子 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 从 0..size-1 无放回抽 n 个下标（升序）；同一种子结果相同 */
export function seededSample(size: number, n: number, seed: number): number[] {
  const k = Math.min(Math.max(0, Math.floor(n)), size);
  const idx = Array.from({ length: size }, (_, i) => i);
  const rand = mulberry32(seed);
  for (let i = 0; i < k; i += 1) {
    const j = i + Math.floor(rand() * (size - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, k).sort((a, b) => a - b);
}

/** 字符串 → 32 位种子（FNV-1a），运行没给种子时用运行 id + 控制编号派生 */
export function seedOf(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
