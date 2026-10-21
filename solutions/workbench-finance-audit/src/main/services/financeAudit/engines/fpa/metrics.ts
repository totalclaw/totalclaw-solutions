/**
 * 财务指标（D1 管理报告、D3 财务分析、D5 费用率、D7 董事会、D10 投资者关系共用，纯函数）。
 *
 * 科目性质沿用 A1 的 accountNature（公司档案的科目映射优先，其次中国编码 / 名称、IFRS 英文关键词），
 * 只取顶层科目避免父子重复。损益类取本期发生（收入取贷方、费用取借方，与财务智能体 buildStatements 同口径），
 * 资产负债类取期末余额；损益类期末未结转的余额并入权益，保证「资产 = 负债 + 权益」。
 * 每个指标记下参与计算的余额表行号，产出里的「来源」列据此写「数据集 + 行号」。金额一律分。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauAccountMapEntry, FauFpaAlert } from '@totalclaw/ipc-contracts';
import type { BudgetRow, TbRow } from '../../types';
import { KEYWORDS, accountNature, codeUnder, fmtYuan, hasAny, periodAmount, signedBalance, topLevel } from '../accounting/common';
import FKW from './keywords.json';

export const METRIC_KEYS = [
  'revenue', 'cogs', 'grossProfit', 'selling', 'admin', 'finance', 'rd', 'otherExpense', 'opex', 'otherIncome', 'incomeTax', 'netProfit',
  'cash', 'currentAssets', 'totalAssets', 'currentLiabilities', 'totalLiabilities', 'equity',
] as const;
export type MetricKey = (typeof METRIC_KEYS)[number];
export type FinMetrics = Record<MetricKey, number>;

export const METRIC_LABELS: Record<MetricKey, string> = {
  revenue: i18nKey('收入'), cogs: i18nKey('销售成本'), grossProfit: i18nKey('毛利'), selling: i18nKey('销售费用'), admin: i18nKey('管理费用合计'),
  finance: i18nKey('财务费用'), rd: i18nKey('研发费用'), otherExpense: i18nKey('其他费用'), opex: i18nKey('期间费用合计'), otherIncome: i18nKey('其他收益'),
  incomeTax: i18nKey('所得税费用'), netProfit: i18nKey('净利润'), cash: i18nKey('现金及现金等价物'), currentAssets: i18nKey('流动资产'), totalAssets: i18nKey('资产总计'),
  currentLiabilities: i18nKey('流动负债'), totalLiabilities: i18nKey('负债合计'), equity: i18nKey('所有者权益'),
};

/** 损益类指标（比较时按本期发生）；其余是期末余额 */
export const PL_KEYS: MetricKey[] = ['revenue', 'cogs', 'grossProfit', 'selling', 'admin', 'finance', 'rd', 'otherExpense', 'opex', 'otherIncome', 'incomeTax', 'netProfit'];

export interface MetricsOut {
  m: FinMetrics;
  /** 指标 → 参与计算的余额表行号 */
  rows: Partial<Record<MetricKey, number[]>>;
}

type Basis = 'cn' | 'ifrs';
const under = (code: string, prefixes: string[]) => prefixes.some((p) => codeUnder(code, p));

/** 费用科目细分：营业成本 / 所得税 / 销售 / 管理 / 财务 / 研发 / 其他 */
export function expenseCategory(code: string, name: string): 'cogs' | 'incomeTax' | 'selling' | 'admin' | 'finance' | 'rd' | 'otherExpense' {
  if (under(code, FKW.cogsCodePrefixes) || hasAny(name, FKW.cogsNames)) return 'cogs';
  if (under(code, FKW.incomeTaxCodePrefixes) || hasAny(name, FKW.incomeTaxNames)) return 'incomeTax';
  if (hasAny(name, FKW.rdNames)) return 'rd';
  if (under(code, FKW.sellingCodePrefixes) || hasAny(name, FKW.sellingNames)) return 'selling';
  if (under(code, FKW.adminCodePrefixes) || hasAny(name, FKW.adminNames)) return 'admin';
  if (under(code, FKW.financeCodePrefixes) || hasAny(name, FKW.financeNames)) return 'finance';
  return 'otherExpense';
}

/** 营业收入（主营 + 其他业务）与其他收益（投资收益、营业外收入等） */
function isOperatingRevenue(code: string, name: string): boolean {
  return under(code, KEYWORDS.revenueCodePrefixes) || hasAny(name, KEYWORDS.revenueNames);
}

function isCurrent(code: string, name: string, basis: Basis, side: 'asset' | 'liability'): boolean {
  const c = String(code || '').replace(/[.\-\s]/g, '');
  if (basis === 'cn' && /^\d{4,}$/.test(c)) return (side === 'asset' ? FKW.cnCurrentAssetPrefixes : FKW.cnCurrentLiabilityPrefixes).some((p) => c.startsWith(p));
  return hasAny(name, side === 'asset' ? FKW.currentAssetNames : FKW.currentLiabilityNames);
}

export function emptyMetrics(): FinMetrics {
  return Object.fromEntries(METRIC_KEYS.map((k) => [k, 0])) as FinMetrics;
}

export function finMetrics(tb: TbRow[], basis: Basis, accountMap: FauAccountMapEntry[] = []): MetricsOut {
  const m = emptyMetrics();
  const rows: Partial<Record<MetricKey, number[]>> = {};
  const add = (k: MetricKey, v: number, row: number) => { m[k] += v; (rows[k] ||= []).push(row); };
  let plResidual = 0;
  for (const r of topLevel(tb)) {
    const cls = accountNature(r.accountCode, r.accountName, basis, accountMap);
    if (cls === 'revenue' || cls === 'expense') {
      const v = periodAmount(cls, r);
      plResidual += r.closingCr - r.closingDr;
      if (cls === 'revenue') add(isOperatingRevenue(r.accountCode, r.accountName) ? 'revenue' : 'otherIncome', v, r.row);
      else add(expenseCategory(r.accountCode, r.accountName), v, r.row);
      continue;
    }
    const bal = signedBalance(cls, r.closingDr, r.closingCr);
    if (cls === 'liability') {
      add('totalLiabilities', bal, r.row);
      if (isCurrent(r.accountCode, r.accountName, basis, 'liability')) add('currentLiabilities', bal, r.row);
    } else if (cls === 'equity') {
      add('equity', bal, r.row);
    } else {
      // 资产、共同类、认不出性质的按借方余额计入资产（不静默丢掉）
      add('totalAssets', bal, r.row);
      if (isCurrent(r.accountCode, r.accountName, basis, 'asset')) add('currentAssets', bal, r.row);
      if (under(r.accountCode, KEYWORDS.cashCodePrefixes) || hasAny(r.accountName, KEYWORDS.cashNames)) add('cash', bal, r.row);
    }
  }
  m.equity += plResidual;
  m.grossProfit = m.revenue - m.cogs;
  m.opex = m.selling + m.admin + m.finance + m.rd + m.otherExpense;
  m.netProfit = m.revenue + m.otherIncome - m.cogs - m.opex - m.incomeTax;
  rows.grossProfit = [...(rows.revenue || []), ...(rows.cogs || [])];
  rows.opex = (['selling', 'admin', 'finance', 'rd', 'otherExpense'] as MetricKey[]).flatMap((k) => rows[k] || []);
  rows.netProfit = (['revenue', 'otherIncome', 'cogs', 'opex', 'incomeTax'] as MetricKey[]).flatMap((k) => (k === 'opex' ? rows.opex! : rows[k] || []));
  return { m, rows };
}

/** 预算表 → 损益类预算指标（只认得出的科目；资产负债类不编预算） */
export function budgetMetrics(budget: BudgetRow[], basis: Basis, accountMap: FauAccountMapEntry[] = []): { m: Partial<FinMetrics>; rows: Partial<Record<MetricKey, number[]>> } {
  const m: Partial<FinMetrics> = {};
  const rows: Partial<Record<MetricKey, number[]>> = {};
  const add = (k: MetricKey, v: number, row: number) => { m[k] = (m[k] || 0) + v; (rows[k] ||= []).push(row); };
  for (const b of budget) {
    const cls = accountNature(b.accountCode, b.accountName, basis, accountMap);
    if (cls === 'revenue') add(isOperatingRevenue(b.accountCode, b.accountName) ? 'revenue' : 'otherIncome', b.amount, b.row);
    else if (cls === 'expense') add(expenseCategory(b.accountCode, b.accountName), b.amount, b.row);
  }
  if (m.revenue != null && m.cogs != null) m.grossProfit = m.revenue - m.cogs;
  const opexParts = (['selling', 'admin', 'finance', 'rd', 'otherExpense'] as MetricKey[]).filter((k) => m[k] != null);
  if (opexParts.length) m.opex = opexParts.reduce((s, k) => s + (m[k] || 0), 0);
  return { m, rows };
}

export interface Ratios {
  grossMargin: number | null;
  netMargin: number | null;
  expenseRatio: number | null;
  debtRatio: number | null;
  currentRatio: number | null;
}
export const RATIO_KEYS: (keyof Ratios)[] = ['grossMargin', 'netMargin', 'expenseRatio', 'debtRatio', 'currentRatio'];
export const RATIO_LABELS: Record<keyof Ratios, string> = {
  grossMargin: i18nKey('毛利率'), netMargin: i18nKey('净利率'), expenseRatio: i18nKey('期间费用率'), debtRatio: i18nKey('资产负债率'), currentRatio: i18nKey('流动比率'),
};

const div = (a: number, b: number): number | null => (b ? a / b : null);

export function ratios(m: Partial<FinMetrics>): Ratios {
  return {
    grossMargin: m.revenue ? div(m.grossProfit ?? m.revenue - (m.cogs || 0), m.revenue) : null,
    netMargin: m.revenue && m.netProfit != null ? div(m.netProfit, m.revenue) : null,
    expenseRatio: m.revenue && m.opex != null ? div(m.opex, m.revenue) : null,
    debtRatio: m.totalAssets ? div(m.totalLiabilities || 0, m.totalAssets) : null,
    currentRatio: m.currentLiabilities ? div(m.currentAssets || 0, m.currentLiabilities) : null,
  };
}

const pctText = (v: number) => `${(v * 100).toFixed(2)}%`;

/**
 * 指标预警分级（metric-alert-handling / 财务分析判断框架）：
 *   红：净亏损、资产负债率 > 70%、流动比率 < 1.0、收入低于预算 > 20%；
 *   黄：资产负债率 > 60%、流动比率 < 1.5、毛利率下降超过阈值、收入比上期下降超过阈值、期间费用增长快于收入。
 * 阈值见 thresholds/fin-analysis.json（D1 用 mgmt-report.json，同一组 key）。
 */
export function metricAlerts(cur: FinMetrics, prior: FinMetrics | null, budget: Partial<FinMetrics> | null, th: Record<string, number>): FauFpaAlert[] {
  const out: FauFpaAlert[] = [];
  const r = ratios(cur);
  const p = prior ? ratios(prior) : null;
  if (cur.netProfit < 0) out.push({ id: 'net_loss', level: 'red', message: { key: i18nKey('本期净亏损 {p0}'), params: { p0: fmtYuan(cur.netProfit) } } });
  if (r.debtRatio != null) {
    if (r.debtRatio > (th['alert.debtRatioRedRatio'] ?? 0.7)) out.push({ id: 'debt_ratio', level: 'red', message: { key: i18nKey('资产负债率 {p0}，超过红线 {p1}'), params: { p0: pctText(r.debtRatio), p1: pctText(th['alert.debtRatioRedRatio'] ?? 0.7) } } });
    else if (r.debtRatio > (th['alert.debtRatioWarnRatio'] ?? 0.6)) out.push({ id: 'debt_ratio', level: 'yellow', message: { key: i18nKey('资产负债率 {p0}，超过预警线 {p1}'), params: { p0: pctText(r.debtRatio), p1: pctText(th['alert.debtRatioWarnRatio'] ?? 0.6) } } });
  }
  if (r.currentRatio != null) {
    if (r.currentRatio < (th['alert.currentRatioRedRatio'] ?? 1)) out.push({ id: 'current_ratio', level: 'red', message: { key: i18nKey('流动比率 {p0}，低于红线 {p1}'), params: { p0: r.currentRatio.toFixed(2), p1: (th['alert.currentRatioRedRatio'] ?? 1).toFixed(2) } } });
    else if (r.currentRatio < (th['alert.currentRatioWarnRatio'] ?? 1.5)) out.push({ id: 'current_ratio', level: 'yellow', message: { key: i18nKey('流动比率 {p0}，低于预警线 {p1}'), params: { p0: r.currentRatio.toFixed(2), p1: (th['alert.currentRatioWarnRatio'] ?? 1.5).toFixed(2) } } });
  }
  if (p && r.grossMargin != null && p.grossMargin != null && p.grossMargin - r.grossMargin > (th['alert.grossMarginDropPts'] ?? 0.02)) {
    out.push({ id: 'gross_margin_drop', level: 'yellow', message: { key: i18nKey('毛利率由 {p0} 降至 {p1}'), params: { p0: pctText(p.grossMargin), p1: pctText(r.grossMargin) } } });
  }
  if (prior && prior.revenue > 0 && (prior.revenue - cur.revenue) / prior.revenue > (th['alert.revenueDropPct'] ?? 0.1)) {
    out.push({ id: 'revenue_drop', level: 'yellow', message: { key: i18nKey('营业收入比上期下降 {p0}'), params: { p0: pctText((prior.revenue - cur.revenue) / prior.revenue) } } });
  }
  if (budget?.revenue && budget.revenue > 0 && (budget.revenue - cur.revenue) / budget.revenue > (th['alert.revenueShortPct'] ?? 0.2)) {
    out.push({ id: 'revenue_short', level: 'red', message: { key: i18nKey('营业收入低于预算 {p0}'), params: { p0: pctText((budget.revenue - cur.revenue) / budget.revenue) } } });
  }
  if (prior && prior.opex > 0 && prior.revenue > 0) {
    const eg = (cur.opex - prior.opex) / prior.opex;
    const rg = (cur.revenue - prior.revenue) / prior.revenue;
    if (eg > rg && eg > 0) out.push({ id: 'opex_faster', level: 'yellow', message: { key: i18nKey('期间费用增长 {p0}，快于收入增长 {p1}'), params: { p0: pctText(eg), p1: pctText(rg) } } });
  }
  return out;
}
