import { describe, expect, it } from 'vitest';
import { adsDailyMetrics } from './adsDailyMetrics';

describe('真实广告每日指标', () => {
  it('合并同日多 campaign，按日期排序，缺失指标保留空值', () => {
    expect(adsDailyMetrics({ metrics: [
      { 'segments.date': '2026-09-02', 'metrics.clicks': '2', spend: '1.25' },
      { 'segments.date': '2026-09-01', 'metrics.conversions': '0' },
      { 'segments.date': '2026-09-02', 'metrics.clicks': 3, spend: 2 },
    ] })).toEqual([
      { date: '2026-09-01', clicks: null, conversions: 0, spend: null },
      { date: '2026-09-02', clicks: 5, conversions: null, spend: 3.25 },
    ]);
  });
  it('不将 Meta 区间汇总、demo rows 或失败响应转成日趋势', () => {
    expect(adsDailyMetrics({ metrics: [{ date_start: '2026-09-01', date_stop: '2026-09-07', spend: 100 }] })).toEqual([]);
    expect(adsDailyMetrics({ rows: [{ date: '2026-09-01', spend: 100 }] })).toEqual([]);
    expect(adsDailyMetrics({ success: false, metrics: [{ date: '2026-09-01', spend: 100 }] })).toEqual([]);
  });
  it('无效数值不能变成零，合法零和嵌套 Google 指标可用', () => {
    expect(adsDailyMetrics({ metrics: [null, { date: 'bad', clicks: 1 }, { date: '2026-09-01', clicks: '', spend: null, conversions: Infinity },
      { segments: { date: '2026-09-02' }, metrics: { clicks: 0, conversions: '2.5' } },
    ] })).toEqual([{ date: '2026-09-02', clicks: 0, conversions: 2.5, spend: null }]);
  });
});
