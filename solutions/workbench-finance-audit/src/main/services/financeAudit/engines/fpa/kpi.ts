/**
 * KPI 达成与预警（D2；D9 战略执行、D7 董事会摘要复用，纯函数）。
 *
 *   达成率：越高越好 = 实际 / 目标；越低越好 = 目标 / 实际（周转天数、成本率、排放量）；
 *   分级：≥ 绿灯下限 绿；≥ 黄灯下限 黄；否则红（thresholds/kpi.json）；
 *   连续未达标：从最近一期往回数达成率 < 绿灯下限的期数，≥ 3 期升级（kpi-management 判断框架）；
 *   累计（目标分解追踪）：同一年度、非比例类单位的目标与实际分别累加后再算达成率。
 */
import type { FauFpaLevel } from '@totalclaw/ipc-contracts';
import type { KpiRow } from '../../fpaTypes';

export interface KpiEval {
  indicator: string;
  category: string;
  unit: string;
  direction: 'higher' | 'lower';
  owner: string;
  period: string;
  target: number | null;
  actual: number | null;
  achievement: number | null;
  level: FauFpaLevel | null;
  consecutiveMisses: number;
  ytdTarget: number | null;
  ytdActual: number | null;
  ytdAchievement: number | null;
  /** 最近一期往前的达成率（趋势，旧 → 新） */
  history: Array<{ period: string; achievement: number | null }>;
  rows: number[];
}

export function achievementOf(direction: 'higher' | 'lower', target: number | null, actual: number | null): number | null {
  if (target == null || actual == null) return null;
  if (direction === 'lower') return actual > 0 ? target / actual : null;
  return target > 0 ? actual / target : null;
}

export function levelOf(ach: number | null, th: Record<string, number>): FauFpaLevel | null {
  if (ach == null) return null;
  if (ach >= (th['level.greenMinRatio'] ?? 1)) return 'green';
  if (ach >= (th['level.yellowMinRatio'] ?? 0.9)) return 'yellow';
  return 'red';
}

/** 比例类单位（%、率、分）不能累加 */
const RATIO_UNIT = /%|率|比|ratio|rate|score|分|نسبة|٪/i;

/** 期间排序键：YYYY → YYYY-00，YYYY-Qn → 季末月，YYYY-MM 原样 */
export function periodKey(p: string): string {
  const q = p.match(/^(\d{4})-Q([1-4])$/);
  if (q) return `${q[1]}-${String(Number(q[2]) * 3).padStart(2, '0')}`;
  return /^\d{4}$/.test(p) ? `${p}-00` : p;
}

export function groupSeries(rows: KpiRow[]): Map<string, KpiRow[]> {
  const g = new Map<string, KpiRow[]>();
  for (const r of rows) {
    const k = `${r.category}\u0001${r.indicator}`;
    (g.get(k) || g.set(k, []).get(k)!).push(r);
  }
  for (const list of g.values()) list.sort((a, b) => periodKey(a.period).localeCompare(periodKey(b.period)));
  return g;
}

export function evalKpis(rows: KpiRow[], th: Record<string, number>, period = ''): KpiEval[] {
  const out: KpiEval[] = [];
  for (const list of groupSeries(rows).values()) {
    const withActual = list.filter((r) => r.actual != null);
    if (!withActual.length) continue;
    const at = period ? withActual.filter((r) => periodKey(r.period) <= periodKey(period)) : withActual;
    const latest = (at.length ? at : withActual)[(at.length ? at : withActual).length - 1];
    const upTo = withActual.filter((r) => periodKey(r.period) <= periodKey(latest.period));
    const ach = (r: KpiRow) => achievementOf(r.direction, r.target, r.actual);
    let misses = 0;
    for (let i = upTo.length - 1; i >= 0; i -= 1) {
      const a = ach(upTo[i]);
      if (a == null || a >= (th['level.greenMinRatio'] ?? 1)) break;
      misses += 1;
    }
    const year = latest.period.slice(0, 4);
    const ytd = upTo.filter((r) => r.period.slice(0, 4) === year && r.target != null);
    const summable = !RATIO_UNIT.test(latest.unit) && latest.direction === 'higher' && /^\d{4}-(\d{2}|Q[1-4])$/.test(latest.period) && ytd.length > 1;
    const ytdTarget = summable ? ytd.reduce((s, r) => s + (r.target || 0), 0) : null;
    const ytdActual = summable ? ytd.reduce((s, r) => s + (r.actual || 0), 0) : null;
    const a = ach(latest);
    out.push({
      indicator: latest.indicator, category: latest.category, unit: latest.unit, direction: latest.direction, owner: latest.owner,
      period: latest.period, target: latest.target, actual: latest.actual, achievement: a, level: levelOf(a, th), consecutiveMisses: misses,
      ytdTarget, ytdActual, ytdAchievement: ytdTarget && ytdActual != null ? ytdActual / ytdTarget : null,
      history: upTo.map((r) => ({ period: r.period, achievement: ach(r) })), rows: upTo.map((r) => r.row),
    });
  }
  return out;
}
