/** Only dated API observations can become daily chart points; period totals stay out. */
export interface AdsDailyMetric { date: string; clicks: number | null; conversions: number | null; spend: number | null }
export function adsDailyMetrics(result: Record<string, any> | null): AdsDailyMetric[] {
  if (!result || result.success === false || result.ok === false) return [];
  const rows = Array.isArray(result.metrics) ? result.metrics : [];
  const days = new Map<string, AdsDailyMetric>();
  const number = (v: unknown): number | null => {
    if (typeof v !== 'number' && typeof v !== 'string' || String(v).trim() === '') return null;
    const n = Number(v); return Number.isFinite(n) ? n : null;
  };
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const date = row['segments.date'] ?? row.segments?.date ?? row.date;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const day = days.get(date) ?? { date, clicks: null, conversions: null, spend: null };
    const values = {
      clicks: number(row.clicks ?? row['metrics.clicks'] ?? row.metrics?.clicks),
      conversions: number(row.conversions ?? row['metrics.conversions'] ?? row.metrics?.conversions),
      spend: number(row.spend),
    };
    for (const key of ['clicks', 'conversions', 'spend'] as const) {
      if (values[key] !== null) day[key] = (day[key] ?? 0) + values[key];
    }
    if (day.clicks !== null || day.conversions !== null || day.spend !== null) days.set(date, day);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}
