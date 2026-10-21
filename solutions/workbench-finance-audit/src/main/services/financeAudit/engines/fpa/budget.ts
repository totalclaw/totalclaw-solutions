/**
 * D4 预算管理（规则型，纯函数）。
 *
 * 执行率**只读复用**财务智能体 budget.ts 的 analyzeBudget（预算按类别 × 月，实际按科目名包含类别名归集，
 * 截至本月累计），保证同一份数据两边算出来的执行率一致；这里只做分 ↔ 元换算、承诺额、执行率分档、
 * 超支分档与审批层级（budget-management 判断框架）。收入类预算 analyzeBudget 不算，按同一口径另算达成。
 *
 * 量差价差：量差 =（实际数量 − 预算数量）× 预算单价；价差 = 实际成本 − 预算成本 − 量差
 *（=（实际单价 − 预算单价）× 实际数量，用减法吸收分位舍入，保证量差 + 价差 = 总差异）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauAccountMapEntry, FaBudgetLine, FaBudgetRow } from '@totalclaw/ipc-contracts';
import { analyzeBudget } from '../../../financeAgent/budget';
import type { BudgetRow, JournalRow } from '../../types';
import type { PvElement, PvRow } from '../../fpaTypes';
import { accountNature } from '../accounting/common';

export type BudgetBand = 'low' | 'slow' | 'normal' | 'near' | 'over';
export const BAND_LABELS: Record<BudgetBand, string> = {
  low: i18nKey('执行率过低（< 50%）：复盘预算假设'),
  slow: i18nKey('进度偏慢：关注后续执行'),
  normal: i18nKey('正常范围'),
  near: i18nKey('接近预算上限：监控下月超支风险'),
  over: i18nKey('超预算：按超预算流程处理'),
};
export const APPROVAL_LABELS = {
  dept: i18nKey('部门负责人审批，附超支说明'),
  manager: i18nKey('财务经理审批，须提供业务理由与补救措施'),
  director: i18nKey('财务总监审批，须提交预算调整申请'),
  ceo: i18nKey('CEO 审批；无充分理由不予报销'),
};
export type ApprovalTier = keyof typeof APPROVAL_LABELS;

export interface BudgetExecRow {
  category: string;
  accountCode: string;
  nature: 'expense' | 'revenue';
  /** 截至本月累计（分） */
  budget: number;
  actual: number;
  committed: number;
  monthBudget: number;
  monthActual: number;
  /** 与财务智能体 analyzeBudget 同值（四位小数） */
  usage: number;
  usageWithCommit: number | null;
  level: 'ok' | 'warn' | 'over';
  band: BudgetBand;
  /** 超支比例（费用类，实际 > 预算时）或收入短缺比例（收入类，实际 < 预算时） */
  overPct: number | null;
  approval: ApprovalTier | null;
  escalate: boolean;
  rows: number[];
}

export interface BudgetExecInput {
  budget: BudgetRow[];
  journal: JournalRow[];
  commitments?: BudgetRow[];
  period: string;
  basis: 'cn' | 'ifrs';
  accountMap?: FauAccountMapEntry[];
  th: Record<string, number>;
}

const yuan = (c: number) => Math.round(c) / 100;
const cents = (y: number) => Math.round(y * 100);
/** 与 financeAgent/budget.ts matchesCategory 同一规则（那边未导出）：类别名出现在科目名里即算 */
const matches = (accountName: string, category: string) => {
  const a = String(accountName || '').replace(/\s+/g, '');
  const c = String(category || '').replace(/\s+/g, '');
  return !!c && (a === c || a.endsWith(`-${c}`) || a.includes(c));
};

export function budgetLines(rows: BudgetRow[], year: string): FaBudgetLine[] {
  const by = new Map<string, FaBudgetLine>();
  for (const r of rows) {
    if (r.period && r.period.slice(0, 4) !== year) continue;
    const month = Number((r.period || '').slice(5, 7)) || 0;
    if (month < 1 || month > 12) continue;
    const line = by.get(r.accountName) || { dept: '', category: r.accountName, months: Array(12).fill(0) };
    line.months[month - 1] = Math.round((line.months[month - 1] + yuan(r.amount)) * 100) / 100;
    by.set(r.accountName, line);
  }
  return [...by.values()];
}

function band(usage: number, th: Record<string, number>): BudgetBand {
  if (usage > 1) return 'over';
  if (usage >= (th['band.nearRatio'] ?? 0.9)) return 'near';
  if (usage >= (th['band.slowRatio'] ?? 0.7)) return 'normal';
  if (usage >= (th['band.lowRatio'] ?? 0.5)) return 'slow';
  return 'low';
}

export function approvalFor(overPct: number, th: Record<string, number>): ApprovalTier {
  if (overPct <= (th['overrun.tier1Pct'] ?? 0.05)) return 'dept';
  if (overPct <= (th['overrun.tier2Pct'] ?? 0.1)) return 'manager';
  if (overPct <= (th['overrun.tier3Pct'] ?? 0.2)) return 'director';
  return 'ceo';
}

export function budgetExecution(input: BudgetExecInput): { rows: BudgetExecRow[]; fa: FaBudgetRow[] } {
  const year = input.period.slice(0, 4);
  const month = Number(input.period.slice(5, 7)) || 12;
  const lines = budgetLines(input.budget, year);
  const nature = (name: string, code = '') => (accountNature(code, name, input.basis, input.accountMap || []) === 'revenue' ? 'revenue' : 'expense');
  const codeOf = (cat: string) => input.budget.find((b) => b.accountName === cat)?.accountCode || '';
  const yearRows = input.journal.filter((j) => j.date.startsWith(year) && Number(j.date.slice(5, 7)) <= month);
  // 实际数：费用科目借减贷（与 actualsFromJournal 同口径，但性质按本方案的科目映射判断，IFRS 英文科目也认得）
  const actuals = yearRows
    .filter((j) => accountNature(j.accountCode, j.accountName, input.basis, input.accountMap || []) === 'expense')
    .map((j) => ({ dept: j.dept || '', category: j.accountName, month: Number(j.date.slice(5, 7)), amount: yuan(j.debit - j.credit) }));
  const expenseLines = lines.filter((l) => nature(l.category, codeOf(l.category)) === 'expense');
  const fa = analyzeBudget(expenseLines, actuals, month);
  const committedOf = (cat: string) => (input.commitments || []).filter((c) => matches(c.accountName, cat) || c.accountName === cat).reduce((s, c) => s + c.amount, 0);
  const rowsOf = (cat: string) => input.budget.filter((b) => b.accountName === cat).map((b) => b.row);
  const out: BudgetExecRow[] = fa.map((r) => {
    const budget = cents(r.budget);
    const actual = cents(r.actual);
    const committed = committedOf(r.category);
    const usage = r.usage;
    const overPct = budget > 0 && actual > budget ? (actual - budget) / budget : null;
    const level: BudgetExecRow['level'] = usage >= 1 ? 'over' : usage >= (input.th['usage.warnRatio'] ?? 0.8) ? 'warn' : 'ok';
    return {
      category: r.category, accountCode: codeOf(r.category), nature: 'expense', budget, actual, committed,
      monthBudget: cents(r.monthBudget), monthActual: cents(r.monthActual), usage,
      usageWithCommit: budget > 0 ? (actual + committed) / budget : null, level, band: band(usage, input.th),
      overPct, approval: overPct != null ? approvalFor(overPct, input.th) : null,
      escalate: overPct != null && overPct > (input.th['escalate.itemOverPct'] ?? 0.2), rows: rowsOf(r.category),
    };
  });
  for (const l of lines.filter((x) => nature(x.category, codeOf(x.category)) === 'revenue')) {
    const budget = cents(l.months.slice(0, month).reduce((s, v) => s + v, 0));
    const hit = yearRows.filter((j) => matches(j.accountName, l.category));
    const actual = hit.reduce((s, j) => s + j.credit - j.debit, 0);
    const monthActual = hit.filter((j) => Number(j.date.slice(5, 7)) === month).reduce((s, j) => s + j.credit - j.debit, 0);
    const usage = budget > 0 ? Math.round((actual / budget) * 10000) / 10000 : 0;
    const short = budget > 0 && actual < budget ? (budget - actual) / budget : null;
    out.push({
      category: l.category, accountCode: codeOf(l.category), nature: 'revenue', budget, actual, committed: 0,
      monthBudget: cents(l.months[month - 1] || 0), monthActual, usage, usageWithCommit: null,
      level: usage >= 1 ? 'ok' : usage >= (input.th['usage.warnRatio'] ?? 0.8) ? 'warn' : 'over',
      band: usage >= 1 ? 'normal' : band(usage, input.th), overPct: short, approval: null,
      escalate: short != null && short > (input.th['escalate.revenueShortPct'] ?? 0.2), rows: rowsOf(l.category),
    });
  }
  return { rows: out, fa };
}

export interface PvVariance {
  row: number;
  item: string;
  element: PvElement;
  costCenter: string;
  stdCost: number;
  actualCost: number;
  /** 量差（材料用量差 / 人工与制造费用效率差） */
  qtyVar: number;
  /** 价差（材料价差 / 人工工资率差 / 制造费用耗费差） */
  priceVar: number;
  totalVar: number;
  varPct: number | null;
  flagged: boolean;
}

export function priceVolume(rows: PvRow[], th: Record<string, number>, flagKey = 'variance.flagPct'): PvVariance[] {
  return rows.map((r) => {
    const stdCost = cents(r.stdQty * r.stdPrice);
    const actualCost = cents(r.actualQty * r.actualPrice);
    const totalVar = actualCost - stdCost;
    const qtyVar = cents((r.actualQty - r.stdQty) * r.stdPrice);
    const varPct = stdCost ? totalVar / stdCost : null;
    return {
      row: r.row, item: r.item, element: r.element, costCenter: r.costCenter, stdCost, actualCost, qtyVar, priceVar: totalVar - qtyVar, totalVar, varPct,
      flagged: varPct != null && Math.abs(varPct) > (th[flagKey] ?? 0.05),
    };
  });
}
