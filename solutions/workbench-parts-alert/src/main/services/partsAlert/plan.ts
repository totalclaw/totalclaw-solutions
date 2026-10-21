/**
 * 配件预警与补库 —— 行动计划检验与补库清单（纯函数）。
 *
 * 运算结果（calc.ts）→ 行动计划分组 → 人工检验（确认 / 改文字 / 驳回）→ 补库清单。
 * 补库清单只收「缺货管控计划已确认、且公式算出的建议量大于 0」的配件；
 * 人可以改下单量，公式算出的建议量原样保留，两个数并排给人看。
 */
import type {
  PaPartResult, PaPartState, PaPlanGroup, PaReplenishEdit, PaReplenishLine, PaReview, PaRules,
} from '@totalclaw/ipc-contracts';
import {
  computePartsAlert, fmtDay, parseDay, type PartsAlertOutput, type PartsAlertParams,
} from './calc';
import type { DatasetRows } from './ingest';

const DAY = 86_400_000;

export function planGroupOf(r: Pick<PaPartResult, 'state' | 'hasInTransit'>): PaPlanGroup | null {
  if (r.state === 'stagnant') return 'stagnant';
  if (r.state === 'redundant') return 'redundant';
  if (r.state === 'at_risk' || r.state === 'out_of_stock') return r.hasInTransit ? 'shortage_transit' : 'shortage_none';
  return null;
}

/** 系统建议的行动计划文字：每条举措一行 */
export function defaultPlanText(r: Pick<PaPartResult, 'actions'>): string {
  return r.actions.map((a, i) => `${i + 1}. ${a.text}`).join('\n');
}

export function planTextOf(r: Pick<PaPartResult, 'actions'>, review?: PaReview): string {
  return review?.text?.trim() ? review.text.trim() : defaultPlanText(r);
}

export function pendingCounts(results: PaPartResult[], reviews: Record<string, PaReview>): Record<PaPlanGroup, number> {
  const out: Record<PaPlanGroup, number> = { stagnant: 0, redundant: 0, shortage_transit: 0, shortage_none: 0 };
  for (const r of results) {
    const g = planGroupOf(r);
    if (!g) continue;
    const st = reviews[r.partNo]?.status || 'pending';
    if (st === 'pending') out[g] += 1;
  }
  return out;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** 运算：把数据行交给 calc，再补上供应商和单价（供应商：提前期表优先，其次在途订单） */
export function runCompute(data: DatasetRows, rules: PaRules, asOf: string): { results: PaPartResult[]; summary: PartsAlertOutput['summary'] } {
  const params: PartsAlertParams = { ...rules, asOf };
  const out = computePartsAlert({ monthly: data.monthly, yearly: data.yearly, leadTimes: data.leadTime, inTransit: data.inTransit, stock: data.stock }, params);
  const supplier = new Map<string, string>();
  for (const r of data.inTransit) { const no = String(r.partNo).trim(); if (r.supplier && !supplier.has(no)) supplier.set(no, r.supplier); }
  for (const r of data.leadTime) { const no = String(r.partNo).trim(); if (r.supplier) supplier.set(no, r.supplier); }
  const price = new Map<string, number>();
  for (const r of data.leadTime) { const no = String(r.partNo).trim(); if (Number(r.unitPrice) > 0) price.set(no, Number(r.unitPrice)); }
  for (const r of data.stock) { const no = String(r.partNo).trim(); if (Number(r.unitPrice) > 0) price.set(no, Number(r.unitPrice)); }
  const results: PaPartResult[] = out.results.map((r) => ({ ...r, supplier: supplier.get(r.partNo) ?? '', unitPrice: price.get(r.partNo) ?? null }));
  return { results, summary: out.summary };
}

/** 期望到货日默认 = 基准日 + 提前期 */
export function defaultExpectDate(asOf: string, leadDays: number): string {
  return fmtDay(parseDay(asOf) + Math.max(0, Math.round(leadDays)) * DAY);
}

export function buildReplenishLines(
  results: PaPartResult[],
  reviews: Record<string, PaReview>,
  edits: Record<string, PaReplenishEdit>,
  asOf: string,
): PaReplenishLine[] {
  const lines: PaReplenishLine[] = [];
  for (const r of results) {
    if (r.state !== 'at_risk' && r.state !== 'out_of_stock') continue;
    if (!(r.suggestQty > 0)) continue;
    if (reviews[r.partNo]?.status !== 'confirmed') continue;
    const e = edits[r.partNo] || {};
    const qty = Number.isFinite(Number(e.qty)) && Number(e.qty) > 0 ? Math.round(Number(e.qty)) : r.suggestQty;
    const unitPrice = e.unitPrice !== undefined ? (Number(e.unitPrice) > 0 ? Number(e.unitPrice) : null) : r.unitPrice;
    lines.push({
      partNo: r.partNo,
      partName: r.partName,
      state: r.state,
      suggestQty: r.suggestQty,
      qty,
      supplier: e.supplier !== undefined ? e.supplier : r.supplier,
      expectDate: e.expectDate && Number.isFinite(parseDay(e.expectDate)) ? fmtDay(parseDay(e.expectDate)) : defaultExpectDate(asOf, r.leadDays),
      unitPrice,
      amount: unitPrice !== null ? round2(qty * unitPrice) : null,
      selected: e.selected !== false,
      leadDays: r.leadDays,
      stockoutDate: r.stockoutDate,
      basis: r.basis,
    });
  }
  return lines;
}

export function lineTotals(lines: PaReplenishLine[]): { lines: number; qty: number; amount: number; unpriced: number } {
  const sel = lines.filter((l) => l.selected);
  return {
    lines: sel.length,
    qty: sel.reduce((a, l) => a + l.qty, 0),
    amount: round2(sel.reduce((a, l) => a + (l.amount ?? 0), 0)),
    unpriced: sel.filter((l) => l.amount === null).length,
  };
}

/** 相比上一次运算，新变成已缺货 / 将缺货的配件。没有上一次时，当前的全部算新增。 */
export function diffNewAlerts(prev: Array<Pick<PaPartResult, 'partNo' | 'state'>> | null, cur: Array<Pick<PaPartResult, 'partNo' | 'state'>>): { newOut: string[]; newRisk: string[] } {
  const before = new Map<string, PaPartState>((prev || []).map((r) => [r.partNo, r.state]));
  const newOut: string[] = [];
  const newRisk: string[] = [];
  for (const r of cur) {
    if (r.state === 'out_of_stock' && before.get(r.partNo) !== 'out_of_stock') newOut.push(r.partNo);
    if (r.state === 'at_risk' && before.get(r.partNo) !== 'at_risk') newRisk.push(r.partNo);
  }
  return { newOut, newRisk };
}
