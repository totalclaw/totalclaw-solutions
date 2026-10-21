/**
 * E7 投融资管理（纯函数）：投资盘点与浮盈亏、合规（风险等级上限、批准清单）、集中度、到期梯度；流动性指标。
 * 规则来源：finance-skills investment-management（investment-portfolio-review / liquidity-assessment 与判断框架）、
 * treasury-advanced/investment-compliance-check。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauInvestLine, FauLiquidity, FauMsg, FauPortfolio, FauTreasuryRag } from '@totalclaw/ipc-contracts';
import type { BankBalanceRow, CreditFacilityRow, FinMetricsRow, InvestmentRow, LoanRow } from './types';
import { addDays, daysBetween, ragHigh, ragLow, ratio, sum, worst } from './common';

type Th = Record<string, number>;

function bucketOf(maturity: string, asOf: string): FauInvestLine['bucket'] {
  if (!maturity) return 'open';
  const d = daysBetween(asOf, maturity);
  return d <= 30 ? 'd30' : d <= 90 ? 'd90' : d <= 180 ? 'd180' : d <= 365 ? 'd365' : 'y1plus';
}

export function portfolio(rows: InvestmentRow[], asOf: string, th: Th): FauPortfolio {
  const lines: FauInvestLine[] = rows.map((r, i) => {
    const pnl = r.marketValue - r.cost;
    const pnlPct = r.cost ? pnl / r.cost : null;
    const flags: FauMsg[] = [];
    const st: FauTreasuryRag[] = [];
    if (r.riskRating != null && r.riskRating > th['port.maxRiskRating']) { st.push('breach'); flags.push({ key: i18nKey('风险等级 R{n} 超出上限 R{m}'), params: { n: r.riskRating, m: th['port.maxRiskRating'] } }); }
    if (r.approved === false) { st.push('breach'); flags.push({ key: i18nKey('不在批准投资清单内') }); }
    if (pnlPct != null && pnlPct <= -th['port.lossMajor']) { st.push('breach'); flags.push({ key: i18nKey('重大亏损：浮亏 {p0}%'), params: { p0: (-pnlPct * 100).toFixed(1) } }); }
    else if (pnlPct != null && pnlPct <= -th['port.lossWatch']) { st.push('watch'); flags.push({ key: i18nKey('浮亏 {p0}%'), params: { p0: (-pnlPct * 100).toFixed(1) } }); }
    return { row: r.row, id: r.id || `I${i + 1}`, product: r.product, type: r.type, issuer: r.issuer, cost: r.cost, marketValue: r.marketValue, pnl, pnlPct, riskRating: r.riskRating, maturity: r.maturityDate, bucket: bucketOf(r.maturityDate, asOf), status: worst(st), flags };
  });
  const mv = sum(lines.map((l) => l.marketValue));
  const types = [...new Set(lines.map((l) => l.type))];
  const issuers = [...new Set(lines.map((l) => l.issuer || l.product))].map((issuer) => {
    const v = sum(lines.filter((l) => (l.issuer || l.product) === issuer).map((l) => l.marketValue));
    const share = mv ? v / mv : 0;
    return { issuer, marketValue: v, share, status: ragHigh(share, th['port.issuerWatch'], th['port.issuerBreach']) };
  }).sort((a, b) => b.marketValue - a.marketValue);
  const withYield = rows.filter((r) => r.yield != null);
  const wmv = sum(withYield.map((r) => r.marketValue));
  return {
    lines,
    totals: { cost: sum(lines.map((l) => l.cost)), marketValue: mv, pnl: sum(lines.map((l) => l.pnl)) },
    byType: types.map((type) => { const v = sum(lines.filter((l) => l.type === type).map((l) => l.marketValue)); return { type, marketValue: v, share: mv ? v / mv : 0 }; }),
    issuers,
    ladder: (['d30', 'd90', 'd180', 'd365', 'y1plus', 'open'] as const).map((bucket) => ({ bucket, marketValue: sum(lines.filter((l) => l.bucket === bucket).map((l) => l.marketValue)) })),
    weightedYield: wmv ? sum(withYield.map((r) => r.marketValue * r.yield!)) / wmv : null,
  };
}

export function isLiquid(r: InvestmentRow, asOf: string, th: Th): boolean {
  if (r.liquidityDays != null) return r.liquidityDays <= th['liq.liquidDays'];
  if (r.maturityDate && daysBetween(asOf, r.maturityDate) <= th['liq.liquidDays']) return true;
  return r.type === 'deposit' || r.type === 'money_fund';
}

export function liquidity(inp: { balances: BankBalanceRow[]; investments: InvestmentRow[]; loans: LoanRow[]; facilities: CreditFacilityRow[]; metrics: FinMetricsRow | null; asOf: string; th: Th }): FauLiquidity {
  const { th, metrics: m } = inp;
  const cash = inp.balances.length ? sum(inp.balances.map((b) => b.bankBalance - b.restricted)) : (m?.cash ?? 0);
  const liquidInvestments = sum(inp.investments.filter((r) => isLiquid(r, inp.asOf, th)).map((r) => r.marketValue));
  const unusedFacilities = sum(inp.facilities.map((f) => Math.max(0, f.limit - f.used)));
  const horizon = addDays(inp.asOf, 365);
  const debtDue12m = sum(inp.loans.filter((l) => l.maturityDate && l.maturityDate <= horizon).map((l) => l.principal));
  const currentRatio = ratio(m?.currentAssets, m?.currentLiabilities);
  const quickRatio = m?.currentAssets != null ? ratio(m.currentAssets - (m.inventory ?? 0), m.currentLiabilities) : null;
  const cashRatio = ratio(cash + liquidInvestments, m?.currentLiabilities);
  const coverage = ratio(cash + liquidInvestments, debtDue12m);
  const facilityUtilization = ratio(sum(inp.facilities.map((f) => f.used)), sum(inp.facilities.map((f) => f.limit)));
  return {
    cash, liquidInvestments, unusedFacilities, available: cash + liquidInvestments + unusedFacilities, debtDue12m,
    currentRatio, quickRatio, cashRatio, coverage, facilityUtilization,
    statuses: {
      current: ragLow(currentRatio, th['liq.currentWatch'], th['liq.currentBreach']),
      quick: ragLow(quickRatio, th['liq.quickWatch'], th['liq.quickBreach']),
      coverage: ragLow(coverage, th['liq.coverageWatch'], th['liq.coverageBreach']),
      facility: ragHigh(facilityUtilization, th['liq.facilityWatch'], th['liq.facilityBreach']),
    },
  };
}
