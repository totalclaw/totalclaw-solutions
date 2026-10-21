/**
 * E4 融资结构（纯函数）：融资成本与 WACC、到期分布、契约条款当前值与预测期越线判断。
 * 规则来源：finance-skills financing-structure（financing-cost-calculation / covenant-compliance-monitoring 与判断框架）。
 */
import type { FauCovenantCheck, FauCovenantMetric, FauCovenantValue, FauFinancingCost, FauLoanCost } from '@totalclaw/ipc-contracts';
import type { CovenantRow, FinMetricsRow, LoanRow } from './types';
import { daysBetween, ratio, sum } from './common';

type Th = Record<string, number>;

export interface WaccParams { rf: number; beta: number; erp: number; taxRate: number; equity: number | null }

export function waccParams(th: Th, params: Record<string, unknown>): WaccParams {
  const num = (k: string, d: number) => (typeof params[k] === 'number' && Number.isFinite(params[k] as number) ? params[k] as number : d);
  const eq = params.equity;
  return {
    rf: num('rf', th['wacc.rf']), beta: num('beta', th['wacc.beta']), erp: num('erp', th['wacc.erp']), taxRate: num('taxRate', th['wacc.taxRate']),
    equity: typeof eq === 'number' && Number.isFinite(eq) && eq > 0 ? Math.round(eq) : null,
  };
}

/** 最近一期实际数（没有实际数就取最后一期） */
export function latestActual(metrics: FinMetricsRow[]): FinMetricsRow | null {
  const sorted = [...metrics].sort((a, b) => a.period.localeCompare(b.period));
  const act = sorted.filter((m) => !m.forecast);
  return act[act.length - 1] || sorted[sorted.length - 1] || null;
}

export function financingCost(loans: LoanRow[], metrics: FinMetricsRow[], p: WaccParams, asOf: string): FauFinancingCost {
  const lines: FauLoanCost[] = loans.map((l, i) => {
    const remainingYears = l.maturityDate ? Math.max(0, daysBetween(asOf, l.maturityDate) / 365) : 0;
    const tenor = l.startDate && l.maturityDate ? daysBetween(l.startDate, l.maturityDate) / 365 : remainingYears;
    const tenorYears = Math.max(tenor, 1 / 12);
    const rate = l.rate ?? 0;
    const feeRate = l.feeRate ?? 0;
    const allIn = rate + feeRate / tenorYears;
    return { row: l.row, id: l.id || `L${i + 1}`, lender: l.lender, instrument: l.instrument, principal: l.principal, rate, feeRate, tenorYears, allIn, afterTax: allIn * (1 - p.taxRate), maturity: l.maturityDate, remainingYears };
  });
  const debt = sum(lines.map((l) => l.principal));
  const kdPreTax = debt ? sum(lines.map((l) => l.principal * l.allIn)) / debt : null;
  const kdAfterTax = kdPreTax == null ? null : kdPreTax * (1 - p.taxRate);
  const ke = p.rf + p.beta * p.erp;
  const last = latestActual(metrics);
  let equity = 0;
  let equitySource: FauFinancingCost['equitySource'] = 'none';
  if (p.equity) { equity = p.equity; equitySource = 'param'; } else if (last?.equityValue) { equity = last.equityValue; equitySource = 'market'; } else if (last?.netWorth && last.netWorth > 0) { equity = last.netWorth; equitySource = 'book'; }
  const wacc = debt + equity > 0 ? (equity * ke + debt * (kdAfterTax ?? 0)) / (debt + equity) : null;
  // shortcut: 分期还本的借款按最终到期日归档，没有逐期还款计划；拿到还款计划表后再拆分
  const bucketOf = (y: number) => (y <= 1 ? 'y1' : y <= 2 ? 'y2' : y <= 3 ? 'y3' : y <= 5 ? 'y5' : 'y5plus') as FauFinancingCost['maturity'][number]['bucket'];
  const maturity = (['y1', 'y2', 'y3', 'y5', 'y5plus'] as const).map((bucket) => ({ bucket, amount: sum(lines.filter((l) => bucketOf(l.remainingYears) === bucket).map((l) => l.principal)) }));
  return { loans: lines, debt, kdPreTax, kdAfterTax, taxRate: p.taxRate, rf: p.rf, beta: p.beta, erp: p.erp, ke, equity, equitySource, wacc, maturity };
}

export function metricValue(m: FauCovenantMetric, r: FinMetricsRow): number | null {
  switch (m) {
    case 'debt_to_ebitda': return ratio(r.debt, r.ebitda);
    case 'interest_cover': return ratio(r.ebitda, r.interest);
    case 'current_ratio': return ratio(r.currentAssets, r.currentLiabilities);
    case 'debt_ratio': return ratio(r.totalLiabilities, r.totalAssets);
    case 'dscr': return ratio(r.ebitda, r.debtService);
    case 'net_worth': return r.netWorth;
    default: return null;
  }
}

const DEFAULT_OP: Record<FauCovenantMetric, 'le' | 'ge'> = { debt_to_ebitda: 'le', debt_ratio: 'le', interest_cover: 'ge', current_ratio: 'ge', dscr: 'ge', net_worth: 'ge' };

/** 限值归一：净资产按主单位填写 → 分；资产负债率写 70 或 70% → 0.70 */
export function covenantLimit(metric: FauCovenantMetric, raw: number): number {
  if (metric === 'net_worth') return Math.round(raw * 100);
  if (metric === 'debt_ratio' && raw > 1.5) return raw / 100;
  return raw;
}

export function covenantChecks(covs: CovenantRow[], metrics: FinMetricsRow[], th: Th): FauCovenantCheck[] {
  const periods = [...metrics].sort((a, b) => Number(a.forecast) - Number(b.forecast) || a.period.localeCompare(b.period));
  return covs.map((c, i) => {
    const op = c.op || DEFAULT_OP[c.metric];
    const limit = covenantLimit(c.metric, c.limit);
    const values: FauCovenantValue[] = periods.map((p) => {
      const value = metricValue(c.metric, p);
      if (value == null || !limit) return { period: p.period, forecast: p.forecast, value, headroom: null, status: 'watch' };
      const breach = op === 'le' ? value > limit : value < limit;
      const headroom = op === 'le' ? (limit - value) / limit : (value - limit) / limit;
      return { period: p.period, forecast: p.forecast, value, headroom, status: breach ? 'breach' : headroom < th['covenant.headroomWatch'] ? 'watch' : 'ok' };
    });
    const actual = values.filter((v) => !v.forecast);
    const cur = actual[actual.length - 1] || values[0];
    return {
      id: `C${i + 1}`, row: c.row, lender: c.lender, name: c.name, metric: c.metric, op, limit, values,
      current: cur ? cur.status : 'watch', firstBreach: values.find((v) => v.status === 'breach')?.period || null,
    };
  });
}
