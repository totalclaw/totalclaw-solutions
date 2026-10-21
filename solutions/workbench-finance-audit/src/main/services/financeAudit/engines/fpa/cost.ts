/**
 * D5 成本控制（规则型，纯函数）：
 *   标准成本差异：见 budget.ts::priceVolume（同一套量价公式，材料叫价差 / 量差，人工叫工资率差异 / 效率差异，
 *     制造费用叫耗费差异 / 效率差异）；
 *   费用率归因：销售 / 管理 / 财务 / 研发费用占营业收入比，对上期的变化，费用增长快于收入的标注；
 *   成本中心绩效：本期费用按部门归集，没有部门的共同费用按各中心直接费用比例分摊
 *     （只读复用财务智能体 cost.ts 的 allocate：按分计算、尾差给最后一个，分出去的合计等于共同费用）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauAccountMapEntry } from '@totalclaw/ipc-contracts';
import { allocate } from '../../../financeAgent/cost';
import type { JournalRow } from '../../types';
import { accountNature, inPeriod } from '../accounting/common';
import { expenseCategory, type FinMetrics, type MetricKey } from './metrics';

export const EXPENSE_KEYS: MetricKey[] = ['selling', 'admin', 'finance', 'rd', 'opex'];

export interface ExpenseRatioRow {
  key: MetricKey;
  current: number;
  prior: number | null;
  ratio: number | null;
  priorRatio: number | null;
  /** 费用率变化（小数，0.01 = 1 个百分点） */
  ratioChange: number | null;
  growth: number | null;
  revenueGrowth: number | null;
  flagged: boolean;
}

export function expenseRatios(cur: FinMetrics, prior: FinMetrics | null, th: Record<string, number>): ExpenseRatioRow[] {
  const revenueGrowth = prior && prior.revenue ? (cur.revenue - prior.revenue) / prior.revenue : null;
  return EXPENSE_KEYS.filter((k) => cur[k] || prior?.[k]).map((key) => {
    const ratio = cur.revenue ? cur[key] / cur.revenue : null;
    const priorRatio = prior && prior.revenue ? prior[key] / prior.revenue : null;
    const ratioChange = ratio != null && priorRatio != null ? ratio - priorRatio : null;
    const growth = prior && prior[key] ? (cur[key] - prior[key]) / prior[key] : null;
    const flagged = (ratioChange != null && ratioChange > (th['ratio.riseFlagPts'] ?? 0.005))
      || (growth != null && revenueGrowth != null && growth > revenueGrowth && growth > 0);
    return { key, current: cur[key], prior: prior ? prior[key] : null, ratio, priorRatio, ratioChange, growth, revenueGrowth, flagged };
  });
}

export interface CostCenterRow {
  center: string;
  direct: number;
  allocated: number;
  total: number;
  share: number;
  rows: number[];
}

export const SHARED_CENTER = i18nKey('共同费用（未分部门）');

export function costCenters(journal: JournalRow[], period: string, basis: 'cn' | 'ifrs', accountMap: FauAccountMapEntry[] = []): { rows: CostCenterRow[]; shared: number; sharedRows: number[] } {
  const exp = journal.filter((j) => inPeriod(j.date, period) && accountNature(j.accountCode, j.accountName, basis, accountMap) === 'expense'
    && !['cogs', 'incomeTax'].includes(expenseCategory(j.accountCode, j.accountName)));
  const by = new Map<string, { direct: number; rows: number[] }>();
  let shared = 0;
  const sharedRows: number[] = [];
  for (const j of exp) {
    const v = j.debit - j.credit;
    if (!j.dept) { shared += v; sharedRows.push(j.row); continue; }
    const g = by.get(j.dept) || { direct: 0, rows: [] };
    g.direct += v;
    g.rows.push(j.row);
    by.set(j.dept, g);
  }
  // 按码点排序（不随系统区域设置变），尾差固定落在最后一个中心
  const centers = [...by.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const alloc = centers.length ? allocate(shared / 100, centers.map(([, g]) => g.direct / 100)).map((y) => Math.round(y * 100)) : [];
  const grand = centers.reduce((s, [, g]) => s + g.direct, 0) + (centers.length ? shared : 0);
  const rows = centers.map(([center, g], i) => {
    const total = g.direct + (alloc[i] || 0);
    return { center, direct: g.direct, allocated: alloc[i] || 0, total, share: grand ? total / grand : 0, rows: g.rows };
  });
  return { rows, shared, sharedRows };
}
