/**
 * 资金与金融风险引擎共用的小工具（纯函数）。金额一律分；比率一律小数。
 */
import type { FauTreasuryRag } from '@totalclaw/ipc-contracts';
import { addDays, daysBetween } from '../accounting/common';

export { addDays, daysBetween };

export const sum = (xs: number[]): number => xs.reduce((s, x) => s + x, 0);

/** 分摊比例后取整到分（四舍五入） */
export const cents = (x: number): number => Math.round(x);

/** a / b；b 为 0 或缺值返回 null */
export function ratio(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  return a / b;
}

/** 越线判断：值 ≥ 越线值为 breach，≥ 关注值为 watch（数值越大越坏） */
export function ragHigh(v: number | null, watch: number, breach: number): FauTreasuryRag {
  if (v == null) return 'ok';
  return v >= breach ? 'breach' : v >= watch ? 'watch' : 'ok';
}

/** 数值越小越坏：值 < 越线值为 breach，< 关注值为 watch */
export function ragLow(v: number | null, watch: number, breach: number): FauTreasuryRag {
  if (v == null) return 'ok';
  return v < breach ? 'breach' : v < watch ? 'watch' : 'ok';
}

export const worst = (xs: FauTreasuryRag[]): FauTreasuryRag => (xs.includes('breach') ? 'breach' : xs.includes('watch') ? 'watch' : 'ok');

/** YYYY-MM 的最后一天；YYYY 取 12-31；其它原样 */
export function asOfOf(period: string): string {
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split('-').map(Number);
    return `${period}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
  }
  if (/^\d{4}$/.test(period)) return `${period}-12-31`;
  return period;
}

/** 期间天数：月结期间按当月天数，年度 365 */
export function periodDays(period: string): number {
  if (/^\d{4}-\d{2}$/.test(period)) return Number(asOfOf(period).slice(8, 10));
  return 365;
}

/** 按金额最大余数法把 total 分到各份，保证合计不差一分 */
export function allocate(total: number, weights: number[]): number[] {
  const w = sum(weights.map(Math.abs));
  if (!w) return weights.map(() => 0);
  const raw = weights.map((x) => (total * Math.abs(x)) / w);
  const out = raw.map(Math.trunc);
  let rest = total - sum(out);
  const order = raw.map((x, i) => [Math.abs(x - Math.trunc(x)), i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; rest !== 0 && k < order.length; k += 1) {
    const step = Math.sign(rest);
    out[order[k][1]] += step;
    rest -= step;
  }
  return out;
}

/** 分 → 主单位（给人看 / 给模型 / 回核用） */
export const major = (c: number | null | undefined): number | null => (c == null || !Number.isFinite(c) ? null : Math.round(c) / 100);

/** 比率 → 百分数（两位小数，给模型 / 回核用） */
export const pct = (r: number | null | undefined): number | null => (r == null || !Number.isFinite(r) ? null : Math.round(r * 10000) / 100);
