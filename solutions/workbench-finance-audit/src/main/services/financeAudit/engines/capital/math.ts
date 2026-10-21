/**
 * 投融资与估值的数学小工具（纯函数）：折现、IRR / XIRR、分位数、正态分布。
 * 金额是用户录入单位下的浮点数；比例是小数。
 */

/** 现金流按期折现：cfs[i] 发生在 times[i]（默认 i） */
export function npv(rate: number, cfs: number[], times?: number[]): number {
  return cfs.reduce((s, c, i) => s + c / (1 + rate) ** (times ? times[i] : i), 0);
}

/** 内部收益率：二分法（-99.99% ~ 1000%），现金流没有正负变号时返回 null */
export function irr(cfs: number[], times?: number[]): number | null {
  if (!cfs.some((c) => c > 0) || !cfs.some((c) => c < 0)) return null;
  let lo = -0.9999;
  let hi = 10;
  let fLo = npv(lo, cfs, times);
  const fHi = npv(hi, cfs, times);
  if (fLo * fHi > 0) return null;
  for (let i = 0; i < 300; i += 1) {
    const mid = (lo + hi) / 2;
    const f = npv(mid, cfs, times);
    if (Math.abs(f) < 1e-10 || hi - lo < 1e-12) return mid;
    if (f * fLo < 0) hi = mid;
    else { lo = mid; fLo = f; }
  }
  return (lo + hi) / 2;
}

/** 按日期的 IRR（Excel XIRR 口径：年 = 365 天，以第一笔为起点） */
export function xirr(flows: Array<{ date: string; amount: number }>): number | null {
  const ts = flows.map((f) => Date.parse(f.date));
  if (ts.some((t) => !Number.isFinite(t))) return null;
  const t0 = Math.min(...ts);
  return irr(flows.map((f) => f.amount), ts.map((t) => (t - t0) / (365 * 86_400_000)));
}

export function sum(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0);
}

export function mean(xs: number[]): number | null {
  return xs.length ? sum(xs) / xs.length : null;
}

/** 样本标准差 */
export function stdev(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = sum(xs) / xs.length;
  return Math.sqrt(sum(xs.map((x) => (x - m) ** 2)) / (xs.length - 1));
}

/** 分位数，线性插值（与 Excel QUARTILE.INC / PERCENTILE.INC 一致） */
export function quantile(xs: number[], q: number): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

/** 标准正态分布函数（Abramowitz–Stegun 26.2.17，误差 < 7.5e-8） */
export function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp(-x * x / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - p : p;
}

export function normPdf(x: number): number {
  return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
}

/** 5 点对称网格：中心 = 基准值（中间格必须等于模型结果，证明表接对了） */
export function grid5(center: number, step: number): number[] {
  return [-2, -1, 0, 1, 2].map((k) => center + k * step);
}

export const finite = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
