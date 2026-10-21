/**
 * B2 内部审计（纯函数）：风险矩阵（可能性 × 影响）、年度计划排程与人天测算、整改台账超期分级。
 *
 * 风险矩阵（internal-audit 判断框架「风险矩阵」）：
 *              高可能性   中可能性   低可能性
 *   高影响      高         高         中
 *   中影响      高         中         低
 *   低影响      中         低         低
 * 年度计划：必审与高风险领域一定纳入；其余按风险、上次审计越久越先，在可用人天内纳入；
 * 需求人天 = 必审 + 高风险 + 中风险领域；缺口 = 需求 − 可用。季度按纳入顺序与每季人天（可用 / 4）依次排。
 */
import type { FauAuditArea, FauAuditPlan, FauFindingSeverity, FauImpactLevel, FauTrackedFinding } from '@totalclaw/ipc-contracts';
import { FAU_IMPACT_LEVELS } from '@totalclaw/ipc-contracts';
import { matchValue, toIsoDate, toNum, yesNo, type ParsedTable } from '../table';
import { daysBetween } from '../../accounting/common';

const MATRIX: Record<FauImpactLevel, Record<FauImpactLevel, FauImpactLevel>> = {
  high: { high: 'high', medium: 'high', low: 'medium' },
  medium: { high: 'high', medium: 'medium', low: 'low' },
  low: { high: 'medium', medium: 'low', low: 'low' },
};

/** impact × likelihood → 风险等级 */
export function riskOf(likelihood: FauImpactLevel, impact: FauImpactLevel): FauImpactLevel {
  return MATRIX[impact][likelihood];
}

export function severityOf(risk: FauImpactLevel): FauFindingSeverity {
  return risk === 'high' ? 'major' : risk === 'medium' ? 'moderate' : 'low';
}

export function parseUniverse(p: ParsedTable): { areas: FauAuditArea[]; bad: number[] } {
  const areas: FauAuditArea[] = [];
  const bad: number[] = [];
  for (const r of p.rows) {
    const name = r.get('area');
    if (!name) continue;
    const likelihood = matchValue(r.get('likelihood'), FAU_IMPACT_LEVELS);
    const impact = matchValue(r.get('impact'), FAU_IMPACT_LEVELS);
    if (!likelihood || !impact) { bad.push(r.row); continue; }
    const days = toNum(r.get('days'));
    areas.push({
      id: `IA-${String(areas.length + 1).padStart(2, '0')}`, name, likelihood, impact, risk: riskOf(likelihood, impact),
      mandatory: yesNo(r.get('mandatory')) === true, lastAudited: toIsoDate(r.get('lastAudited')), days: days && days > 0 ? days : 0,
      quarter: '', included: false, row: r.row,
    });
  }
  return { areas, bad };
}

const RANK: Record<FauImpactLevel, number> = { high: 0, medium: 1, low: 2 };

export function buildPlan(input: FauAuditArea[], availableDays: number, th: Record<string, number>): Omit<FauAuditPlan, 'narrative' | 'narrativeStatus'> {
  const areas = input.map((a) => ({ ...a, days: a.days > 0 ? a.days : (th[`days.${a.risk}`] ?? ({ high: 20, medium: 10, low: 5 })[a.risk]) }));
  const order = [...areas].sort((a, b) => Number(b.mandatory) - Number(a.mandatory) || RANK[a.risk] - RANK[b.risk] || (a.lastAudited || '0000').localeCompare(b.lastAudited || '0000'));
  let used = 0;
  for (const a of order) {
    const must = a.mandatory || a.risk === 'high';
    if (must || used + a.days <= availableDays) { a.included = true; used += a.days; }
  }
  const perQuarter = availableDays > 0 ? availableDays / 4 : Number.POSITIVE_INFINITY;
  let cum = 0;
  for (const a of order.filter((x) => x.included)) {
    const q = Math.min(3, Math.floor(cum / perQuarter));
    a.quarter = (['Q1', 'Q2', 'Q3', 'Q4'] as const)[Number.isFinite(q) ? q : 0];
    cum += a.days;
  }
  const requiredDays = areas.filter((a) => a.mandatory || a.risk !== 'low').reduce((s, a) => s + a.days, 0);
  return { areas: order, availableDays, requiredDays, gap: requiredDays - availableDays };
}

// ── 整改跟踪 ──

const STATUSES = ['closed', 'in_progress', 'open'] as const;

export function parseFindings(p: ParsedTable): { list: FauTrackedFinding[]; noDue: number[] } {
  const list: FauTrackedFinding[] = [];
  const noDue: number[] = [];
  p.rows.forEach((r, i) => {
    const title = r.get('title');
    if (!title) return;
    const dueDate = toIsoDate(r.get('dueDate'));
    if (!dueDate) noDue.push(r.row);
    const sev = matchValue(r.get('severity'), ['major', 'moderate', 'minor'] as const);
    const st = matchValue(r.get('status'), STATUSES);
    list.push({
      id: r.get('findingId') || `F-${String(i + 1).padStart(3, '0')}`, title, severity: sev === 'minor' ? 'low' : sev || 'moderate', owner: r.get('owner'),
      dueDate, status: st || (toIsoDate(r.get('closedDate')) ? 'closed' : 'open'), closedDate: toIsoDate(r.get('closedDate')),
      source: 'upload', overdueDays: 0, tier: 0, row: r.row,
    });
  });
  return { list, noDue };
}

/** 超期天数与升级档：已完成的不算超期；没写期限的不算 */
export function trackOverdue(f: FauTrackedFinding, asOf: string, th: Record<string, number>): FauTrackedFinding {
  if (f.status === 'closed' || !f.dueDate) return { ...f, overdueDays: 0, tier: 0 };
  const over = Math.max(0, daysBetween(f.dueDate, asOf));
  const tier: FauTrackedFinding['tier'] = over >= (th['overdue.committeeDays'] ?? 60) ? 3
    : over >= (th['overdue.cfoDays'] ?? 30) ? 2
      : over >= (th['overdue.remindDays'] ?? 1) ? 1 : 0;
  return { ...f, overdueDays: over, tier };
}
