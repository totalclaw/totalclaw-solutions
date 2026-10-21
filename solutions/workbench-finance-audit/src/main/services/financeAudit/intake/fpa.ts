/**
 * 批次 5（fpa）数据集解析：KPI / 指标表（kpi）、量价表（price_volume）。
 * 列识别关键字在 fpaColumnKeywords.json（三语，不进词典），由 columns.ts 合并进识别表。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauIssue } from '@totalclaw/ipc-contracts';
import type { SheetTable } from '../../serviceSettlement/excel';
import type { KpiRow, PvElement, PvRow } from '../fpaTypes';
import { normalizeDigits } from '../verify';
import { HEADER_OFFSET, get, issue, toNum, toPeriod } from './common';
import type { RoleDef } from './columns';
import KW from './fpaColumnKeywords.json';

const VALUES = (KW as unknown as { _values: Record<string, string[]> })._values;

export const FPA_KIND_ROLES: Record<'kpi' | 'price_volume', RoleDef[]> = {
  kpi: [
    { key: 'kpiName', label: i18nKey('指标名称'), required: true },
    { key: 'kpiCategory', label: i18nKey('类别') },
    { key: 'kpiPeriod', label: i18nKey('期间') },
    { key: 'kpiTarget', label: i18nKey('目标值') },
    { key: 'kpiActual', label: i18nKey('实际值'), required: true },
    { key: 'kpiUnit', label: i18nKey('单位') },
    { key: 'kpiDirection', label: i18nKey('指标方向') },
    { key: 'kpiOwner', label: i18nKey('责任人') },
  ],
  price_volume: [
    { key: 'pvItem', label: i18nKey('成本项目'), required: true },
    { key: 'pvElement', label: i18nKey('成本要素') },
    { key: 'pvCenter', label: i18nKey('成本中心') },
    { key: 'pvPeriod', label: i18nKey('期间') },
    { key: 'stdQty', label: i18nKey('标准 / 预算数量'), required: true },
    { key: 'stdPrice', label: i18nKey('标准 / 预算单价'), required: true },
    { key: 'actualQty', label: i18nKey('实际数量'), required: true },
    { key: 'actualPrice', label: i18nKey('实际单价'), required: true },
  ],
};

export const FPA_KINDS = ['kpi', 'price_volume'] as const;
export type FpaKind = (typeof FPA_KINDS)[number];
export function isFpaKind(k: string): k is FpaKind {
  return (FPA_KINDS as readonly string[]).includes(k);
}

/** 2026-09 / 2026年9月 / 2026 / 2026Q3 / 2026-Q3 → YYYY-MM / YYYY / YYYY-Qn */
export function toAnyPeriod(v: unknown): string {
  const s = normalizeDigits(String(v ?? '')).trim();
  const q = s.match(/^(\d{4})\s*[-/ ]?\s*[Qq]\s*([1-4])$/) || s.match(/^(\d{4})\s*年?\s*第?\s*([1-4])\s*季度?$/);
  if (q) return `${q[1]}-Q${q[2]}`;
  const m = toPeriod(s);
  if (m) return m;
  const y = s.match(/^(\d{4})\s*年?(?:度)?$/);
  return y ? y[1] : '';
}

const has = (v: string, words: string[]) => words.some((w) => v.toLowerCase().includes(w.toLowerCase()));

function element(v: string): PvElement {
  if (!v) return 'other';
  if (has(v, VALUES.material)) return 'material';
  if (has(v, VALUES.labor)) return 'labor';
  if (has(v, VALUES.overhead)) return 'overhead';
  return 'other';
}

export function parseKpi(t: SheetTable, mp: Record<string, string>, period: string): { rows: KpiRow[]; issues: FauIssue[] } {
  const rows: KpiRow[] = [];
  const noActual: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const indicator = get(r, mp, 'kpiName');
    if (!indicator) return;
    const actual = toNum(get(r, mp, 'kpiActual'));
    if (actual == null) noActual.push(row);
    rows.push({
      row, indicator, category: get(r, mp, 'kpiCategory'), period: toAnyPeriod(get(r, mp, 'kpiPeriod')) || period,
      target: toNum(get(r, mp, 'kpiTarget')), actual, unit: get(r, mp, 'kpiUnit'),
      direction: has(get(r, mp, 'kpiDirection'), VALUES.lower) ? 'lower' : 'higher', owner: get(r, mp, 'kpiOwner'),
    });
  });
  const issues: FauIssue[] = [];
  if (noActual.length) issues.push(issue('warn', 'kpi_no_actual', i18nKey('{n} 行没有实际值，不参与计算'), { n: noActual.length }, noActual));
  return { rows, issues };
}

export function parsePriceVolume(t: SheetTable, mp: Record<string, string>, period: string): { rows: PvRow[]; issues: FauIssue[] } {
  const rows: PvRow[] = [];
  const bad: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const item = get(r, mp, 'pvItem');
    if (!item) return;
    const nums = (['stdQty', 'stdPrice', 'actualQty', 'actualPrice'] as const).map((k) => toNum(get(r, mp, k)));
    if (nums.some((n) => n == null)) { bad.push(row); return; }
    const [stdQty, stdPrice, actualQty, actualPrice] = nums as number[];
    rows.push({ row, item, element: element(get(r, mp, 'pvElement')), costCenter: get(r, mp, 'pvCenter'), period: toAnyPeriod(get(r, mp, 'pvPeriod')) || period, stdQty, stdPrice, actualQty, actualPrice });
  });
  return { rows, issues: bad.length ? [issue('block', 'pv_missing_number', i18nKey('{n} 行数量或单价缺失 / 认不出'), { n: bad.length }, bad)] : [] };
}
