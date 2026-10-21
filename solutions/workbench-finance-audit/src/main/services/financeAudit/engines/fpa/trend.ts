/**
 * D6 商业洞察的规则部分：时间序列趋势、异常点、季节性（trend-analysis，纯函数）。
 *
 *   环比：最近一期对上一期；平均环比：各期环比的算术平均；
 *   趋势斜率：最小二乘（每期变动量），按斜率 / 均值判上升、下降、持平（±1%）；
 *   异常点：环比变动量偏离均值超过 z 个标准差（thresholds/insight.json）；
 *   季节性：至少 24 个月数据时，同月均值 / 全部均值。
 * 模型据此写洞察；洞察里的数字必须能在这里算出的数里找到（回核），否则降级为「未验证」。
 */
import type { KpiRow } from '../../fpaTypes';
import { groupSeries } from './kpi';

export interface SeriesStat {
  indicator: string;
  category: string;
  unit: string;
  points: Array<{ period: string; value: number; row: number }>;
  last: number;
  prev: number | null;
  change: number | null;
  changePct: number | null;
  avgChangePct: number | null;
  slope: number | null;
  trend: 'up' | 'down' | 'flat' | 'insufficient';
  anomalies: Array<{ period: string; value: number; z: number }>;
  seasonality: Array<{ month: string; index: number }> | null;
}

export function seriesStats(rows: KpiRow[], th: Record<string, number>): SeriesStat[] {
  const minPeriods = th['trend.minPeriods'] ?? 3;
  const zMax = th['anomaly.zScore'] ?? 2;
  const out: SeriesStat[] = [];
  for (const list of groupSeries(rows).values()) {
    const points = list.filter((r) => r.actual != null).map((r) => ({ period: r.period, value: r.actual as number, row: r.row }));
    if (!points.length) continue;
    const n = points.length;
    const last = points[n - 1].value;
    const prev = n > 1 ? points[n - 2].value : null;
    const changes = points.slice(1).map((p, i) => p.value - points[i].value);
    const pcts = points.slice(1).map((p, i) => (points[i].value ? (p.value - points[i].value) / Math.abs(points[i].value) : null)).filter((x): x is number => x != null);
    let slope: number | null = null;
    if (n >= 2) {
      const xm = (n - 1) / 2;
      const ym = points.reduce((s, p) => s + p.value, 0) / n;
      const num = points.reduce((s, p, i) => s + (i - xm) * (p.value - ym), 0);
      const den = points.reduce((s, _p, i) => s + (i - xm) ** 2, 0);
      slope = den ? num / den : 0;
    }
    const mean = points.reduce((s, p) => s + p.value, 0) / n;
    const trend: SeriesStat['trend'] = n < minPeriods || slope == null ? 'insufficient'
      : Math.abs(slope) <= Math.abs(mean) * 0.01 ? 'flat' : slope > 0 ? 'up' : 'down';
    const anomalies: SeriesStat['anomalies'] = [];
    if (changes.length >= 3) {
      const cm = changes.reduce((s, c) => s + c, 0) / changes.length;
      const sd = Math.sqrt(changes.reduce((s, c) => s + (c - cm) ** 2, 0) / changes.length);
      if (sd > 0) changes.forEach((c, i) => { const z = (c - cm) / sd; if (Math.abs(z) > zMax) anomalies.push({ period: points[i + 1].period, value: points[i + 1].value, z }); });
    }
    let seasonality: SeriesStat['seasonality'] = null;
    if (n >= (th['season.minPeriods'] ?? 24) && points.every((p) => /^\d{4}-\d{2}$/.test(p.period)) && mean) {
      const byMonth = new Map<string, number[]>();
      for (const p of points) (byMonth.get(p.period.slice(5)) || byMonth.set(p.period.slice(5), []).get(p.period.slice(5))!).push(p.value);
      seasonality = [...byMonth.entries()].sort().map(([month, vs]) => ({ month, index: vs.reduce((s, v) => s + v, 0) / vs.length / mean }));
    }
    out.push({
      indicator: list[0].indicator, category: list[0].category, unit: list[0].unit, points, last, prev,
      change: prev == null ? null : last - prev, changePct: prev ? (last - prev) / Math.abs(prev) : null,
      avgChangePct: pcts.length ? pcts.reduce((s, p) => s + p, 0) / pcts.length : null, slope, trend, anomalies, seasonality,
    });
  }
  return out;
}
