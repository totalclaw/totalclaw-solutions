/**
 * D8 ESG 报告的规则部分（纯函数）：
 *   数据完整性：按所选框架的核心量化指标清单（esgFrameworks.json）逐项核对有没有数据；
 *   数据质量：缺单位、缺期间、同比变化超过阈值（> 30% 视为数据可靠性存疑，esg-reporting 判断框架）；
 *   重大性：模型按 1–5 分给影响重要性、财务重要性，由代码按门槛判定是否重大（双重重大性）与象限。
 * 指标与关键词是数据；框架与指标的界面名称在下面的词典映射里。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { KpiRow } from '../../fpaTypes';
import { periodKey } from './kpi';
import FW from './esgFrameworks.json';

export type EsgFramework = 'issb' | 'gri' | 'cn' | 'sa';
export const ESG_FRAMEWORKS: EsgFramework[] = ['issb', 'gri', 'cn', 'sa'];
export const FRAMEWORK_LABELS: Record<EsgFramework, string> = {
  issb: i18nKey('ISSB（IFRS S1 / S2）'),
  gri: i18nKey('GRI 标准'),
  cn: i18nKey('沪深北交易所可持续发展报告指引'),
  sa: i18nKey('沙特交易所 ESG 披露指引'),
};
export const INDICATOR_LABELS: Record<string, string> = {
  scope1: i18nKey('范围一温室气体排放'), scope2: i18nKey('范围二温室气体排放'), scope3: i18nKey('范围三温室气体排放'), energy: i18nKey('能源消耗'),
  water: i18nKey('用水量'), waste: i18nKey('废弃物'), employees: i18nKey('员工人数'), safety: i18nKey('安全生产与工伤'), turnover: i18nKey('员工流失率'),
  gender: i18nKey('性别多元化'), boardIndependence: i18nKey('董事会独立性'), anticorruption: i18nKey('反腐败与商业道德'),
};

const INDICATORS = FW.indicators as Record<string, { category: string; keywords: string[] }>;

/** 一行指标归到哪个核心指标：取命中关键词最长的那个（「员工离职率」归流失率，不归员工人数） */
export function matchIndicator(name: string): string | null {
  const n = name.toLowerCase();
  let best: { id: string; len: number } | null = null;
  for (const [id, def] of Object.entries(INDICATORS)) {
    for (const k of def.keywords) if (n.includes(k.toLowerCase()) && (!best || k.length > best.len)) best = { id, len: k.length };
  }
  return best?.id || null;
}

export interface EsgCompleteness {
  id: string;
  category: string;
  present: boolean;
  indicator: string;
  value: number | null;
  unit: string;
  period: string;
  rows: number[];
}

export interface EsgQualityIssue { row: number; indicator: string; code: 'no_unit' | 'no_period' | 'yoy_jump'; value?: number; prior?: number; changePct?: number }

export function esgCompleteness(rows: KpiRow[], framework: EsgFramework): EsgCompleteness[] {
  const ids = (FW.frameworks as Record<string, string[]>)[framework] || [];
  return ids.map((id) => {
    const hit = rows.filter((r) => matchIndicator(r.indicator) === id && r.actual != null).sort((a, b) => periodKey(a.period).localeCompare(periodKey(b.period)));
    const last = hit[hit.length - 1];
    return { id, category: INDICATORS[id]?.category || '', present: !!last, indicator: last?.indicator || '', value: last?.actual ?? null, unit: last?.unit || '', period: last?.period || '', rows: hit.map((r) => r.row) };
  });
}

export function esgQuality(rows: KpiRow[], th: Record<string, number>): EsgQualityIssue[] {
  const out: EsgQualityIssue[] = [];
  const flag = th['yoy.flagPct'] ?? 0.3;
  const by = new Map<string, KpiRow[]>();
  for (const r of rows) {
    if (r.actual == null) continue;
    if (!r.unit) out.push({ row: r.row, indicator: r.indicator, code: 'no_unit' });
    if (!r.period) out.push({ row: r.row, indicator: r.indicator, code: 'no_period' });
    (by.get(r.indicator) || by.set(r.indicator, []).get(r.indicator)!).push(r);
  }
  for (const list of by.values()) {
    list.sort((a, b) => periodKey(a.period).localeCompare(periodKey(b.period)));
    for (let i = 1; i < list.length; i += 1) {
      const prior = list[i - 1].actual as number;
      const value = list[i].actual as number;
      if (!prior) continue;
      const changePct = (value - prior) / Math.abs(prior);
      if (Math.abs(changePct) > flag) out.push({ row: list[i].row, indicator: list[i].indicator, code: 'yoy_jump', value, prior, changePct });
    }
  }
  return out;
}

export type MaterialityQuadrant = 'double' | 'impact' | 'financial' | 'monitor';
export const QUADRANT_LABELS: Record<MaterialityQuadrant, string> = {
  double: i18nKey('双重重大'), impact: i18nKey('影响重大'), financial: i18nKey('财务重大'), monitor: i18nKey('持续关注'),
};

export function materiality(impact: number, financial: number, th: Record<string, number>): { material: boolean; quadrant: MaterialityQuadrant } {
  const min = th['materiality.minScore'] ?? 3;
  const i = impact >= min;
  const f = financial >= min;
  return { material: i || f, quadrant: i && f ? 'double' : i ? 'impact' : f ? 'financial' : 'monitor' };
}
