/**
 * B5 本福特首位数检验（纯函数）：首位数字 1–9 的期望占比 log10(1 + 1/d)。
 * 符合度按 Nigrini 的首位数 MAD 分档（≤ 0.006 高度符合 / ≤ 0.012 可接受 / ≤ 0.015 边缘 / 以上不符合），
 * 同时给卡方（8 个自由度，5% 临界值 15.507）和显著偏高的数字（z > 1.96，含连续性修正）。样本不足不下结论。
 */
import type { FauBenfordResult } from '@totalclaw/ipc-contracts';

export const BENFORD_EXPECTED = Array.from({ length: 9 }, (_, i) => Math.log10(1 + 1 / (i + 1)));

export function firstDigit(cents: number): number | null {
  const a = Math.abs(Math.trunc(cents));
  if (!a) return null;
  return Number(String(a)[0]);
}

export function benford(amounts: number[], th: Record<string, number>): FauBenfordResult {
  const floor = th['benford.amount.floor'] ?? 1000;
  const digits = amounts.filter((a) => Math.abs(a) >= floor).map(firstDigit).filter((d): d is number => d !== null);
  const n = digits.length;
  const counts = Array(9).fill(0) as number[];
  for (const d of digits) counts[d - 1] += 1;
  const observed = counts.map((c) => (n ? c / n : 0));
  const mad = n ? observed.reduce((s, o, i) => s + Math.abs(o - BENFORD_EXPECTED[i]), 0) / 9 : 0;
  const chi2 = n ? counts.reduce((s, c, i) => s + ((c - n * BENFORD_EXPECTED[i]) ** 2) / (n * BENFORD_EXPECTED[i]), 0) : 0;
  const spikes = n ? BENFORD_EXPECTED.map((e, i) => {
    const z = (Math.abs(observed[i] - e) - 1 / (2 * n)) / Math.sqrt((e * (1 - e)) / n);
    return observed[i] > e && z > 1.96 ? i + 1 : 0;
  }).filter(Boolean) : [];
  const conformity: FauBenfordResult['conformity'] = n < (th['benford.minN'] ?? 100) ? 'insufficient'
    : mad <= (th['benford.madClose'] ?? 0.006) ? 'close'
      : mad <= (th['benford.madAcceptable'] ?? 0.012) ? 'acceptable'
        : mad <= (th['benford.madMarginal'] ?? 0.015) ? 'marginal' : 'nonconformity';
  return { n, observed, expected: BENFORD_EXPECTED, mad, chi2, conformity, spikes };
}
