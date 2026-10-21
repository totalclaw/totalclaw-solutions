/**
 * G6 录入值（run.params.cap）→ 引擎输入：按 specs.ts 规整数字、校验必填 / 范围 / 行数，并统计没有来源的值。
 * 渲染层传来的都当不可信输入：只认 spec 里登记的字段与列，字符串限长，数字必须有限。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauCapInputs, FauCapRow, FauCapSource, FauCapUnit, FauCapValue, FauIssue } from '@totalclaw/ipc-contracts';
import { normalizeDigits } from '../../verify';
import type { CapFieldSpec, CapModeSpec } from '../../../../../shared/financeAudit/capital/specs';

export type CapCell = number | string | null;
export interface CapIn {
  f: Record<string, CapCell>;
  t: Record<string, Array<Record<string, CapCell>>>;
  /** 本模块阈值（thresholds.ts 的默认值 + 公司档案覆盖），runner 注入；不传按默认值 */
  th?: Record<string, number>;
}

const NUMERIC: FauCapUnit[] = ['money', 'pct', 'x', 'num', 'int', 'years', 'months', 'bp'];
export const isNumericUnit = (u: FauCapUnit): boolean => NUMERIC.includes(u);
const SRC_KINDS: FauCapSource['kind'][] = ['manual', 'upload', 'public', 'connector', 'handoff', 'default'];
const MAX_ROWS = 2000;

/** 数字：接受「1,234.5」「12%」（比例字段按百分数除 100）、阿语数字 */
export function parseNum(v: unknown, unit: FauCapUnit): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = normalizeDigits(String(v ?? '')).replace(/[,\s]/g, '');
  if (!s) return null;
  const pct = s.endsWith('%');
  const n = Number(pct ? s.slice(0, -1) : s);
  if (!Number.isFinite(n)) return null;
  return pct && unit === 'pct' ? n / 100 : n;
}

function cleanSource(src: any): FauCapSource {
  const kind = SRC_KINDS.includes(src?.kind) ? src.kind : 'default';
  const str = (x: unknown, n: number) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, n) : undefined);
  const url = str(src?.url, 500);
  return {
    kind: kind === 'public' && !(url && /^https?:\/\//i.test(url)) ? 'default' : kind,
    file: str(src?.file, 200), row: Number.isInteger(src?.row) && src.row > 0 ? src.row : undefined, sha256: str(src?.sha256, 64),
    url, name: str(src?.name, 80), runId: str(src?.runId, 64),
  };
}

function cleanCell(v: unknown, f: CapFieldSpec): CapCell {
  if (v === null || v === undefined || v === '') return null;
  if (isNumericUnit(f.unit)) return parseNum(v, f.unit);
  const s = String(v).trim().slice(0, f.unit === 'text' ? 2000 : 40);
  if (f.unit === 'select') return f.options?.some((o) => o.v === s) ? s : null;
  return s || null;
}

/** 渲染层传来的录入 → 只留 spec 里的字段与列 */
export function sanitizeInputs(spec: CapModeSpec, raw: any): FauCapInputs {
  const fields: Record<string, FauCapValue> = {};
  for (const f of spec.fields) {
    const x = raw?.fields?.[f.key];
    if (!x) continue;
    const v = cleanCell(x.v, f);
    if (v !== null) fields[f.key] = { v, src: cleanSource(x.src) };
  }
  const tables: Record<string, FauCapRow[]> = {};
  for (const t of spec.tables) {
    const rows = Array.isArray(raw?.tables?.[t.id]) ? raw.tables[t.id].slice(0, MAX_ROWS) : [];
    tables[t.id] = rows.map((r: any) => ({
      cells: Object.fromEntries(t.columns.map((c) => [c.key, cleanCell(r?.cells?.[c.key], c)])),
      src: cleanSource(r?.src),
    })).filter((r: FauCapRow) => Object.values(r.cells).some((c) => c !== null));
  }
  return { fields, tables };
}

const issue = (level: 'block' | 'warn', code: string, key: string, params: Record<string, string | number>): FauIssue => ({ id: `cap_${code}`, level, code, message: { key, params } });

/** 校验 + 规整（阻断：必填缺失、不是数字、超出范围、行数不够；提醒：用了没确认来源的默认值） */
export function readInputs(spec: CapModeSpec, cap: FauCapInputs | undefined, label: (k: string) => string): { v: CapIn; issues: FauIssue[]; unsourced: number } {
  const issues: FauIssue[] = [];
  const f: Record<string, CapCell> = {};
  let unsourced = 0;
  const range = (fs: CapFieldSpec, n: number) => (fs.min !== undefined && n < fs.min) || (fs.max !== undefined && n > fs.max);
  for (const fs of spec.fields) {
    const x = cap?.fields?.[fs.key];
    const v = x ? cleanCell(x.v, fs) : null;
    f[fs.key] = v;
    if (v === null) {
      if (fs.required) issues.push(issue('block', `missing_${fs.key}`, i18nKey('必填项没填：{p0}'), { p0: label(fs.label) }));
      continue;
    }
    if (typeof v === 'number' && range(fs, v)) issues.push(issue('block', `range_${fs.key}`, i18nKey('「{p0}」超出合理范围（{p1} ~ {p2}）'), { p0: label(fs.label), p1: fs.min ?? '-', p2: fs.max ?? '-' }));
    if (!x || x.src.kind === 'default') unsourced += 1;
  }
  const defaults = spec.fields.filter((fs) => f[fs.key] !== null && (cap?.fields?.[fs.key]?.src.kind ?? 'default') === 'default');
  if (defaults.length) issues.push(issue('warn', 'defaults', i18nKey('{n} 项用的是模板默认值、还没确认来源，产出里标 [未注明来源]：{p0}'), { n: defaults.length, p0: defaults.map((d) => label(d.label)).join(' / ') }));
  const t: CapIn['t'] = {};
  for (const ts of spec.tables) {
    const rows = cap?.tables?.[ts.id] || [];
    if (rows.length < ts.minRows) issues.push(issue('block', `rows_${ts.id}`, i18nKey('「{p0}」至少需要 {n} 行'), { p0: label(ts.label), n: ts.minRows }));
    t[ts.id] = rows.map((r, i) => {
      const out: Record<string, CapCell> = {};
      for (const c of ts.columns) {
        let v = cleanCell(r.cells[c.key], c);
        if (v === null && c.def !== undefined) v = c.def;
        out[c.key] = v;
        if (v === null && c.required) issues.push(issue('block', `cell_${ts.id}_${c.key}_${i}`, i18nKey('「{p0}」第 {n} 行缺「{p1}」'), { p0: label(ts.label), n: i + 1, p1: label(c.label) }));
        else if (typeof v === 'number' && range(c, v)) issues.push(issue('block', `cellrange_${ts.id}_${c.key}_${i}`, i18nKey('「{p0}」第 {n} 行「{p1}」超出合理范围（{p2} ~ {p3}）'), { p0: label(ts.label), n: i + 1, p1: label(c.label), p2: c.min ?? '-', p3: c.max ?? '-' }));
      }
      if (r.src.kind === 'default') unsourced += 1;
      return out;
    });
  }
  return { v: { f, t }, issues, unsourced };
}

// ── 引擎里取值的小工具 ──
export const n = (v: CapIn, k: string, d = 0): number => (typeof v.f[k] === 'number' ? v.f[k] as number : d);
export const nOpt = (v: CapIn, k: string): number | null => (typeof v.f[k] === 'number' ? v.f[k] as number : null);
export const s = (v: CapIn, k: string, d = ''): string => (typeof v.f[k] === 'string' ? v.f[k] as string : d);
export const rows = (v: CapIn, id: string): Array<Record<string, CapCell>> => v.t[id] || [];
export const cn = (r: Record<string, CapCell>, k: string, d = 0): number => (typeof r[k] === 'number' ? r[k] as number : d);
export const cs = (r: Record<string, CapCell>, k: string): string => (r[k] === null || r[k] === undefined ? '' : String(r[k]));
