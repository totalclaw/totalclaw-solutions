/**
 * 配件预警与补库 —— 表格 → 类型化数据行。
 *
 * 输入是 excel.ts 读出来的 { headers, rows }（单元格都是字符串），这里只做三件事：
 *   1. 按表头关键字认列（关键字在 columnKeywords.json，不进界面词典）；
 *   2. 认版式：历史发货既可以是「一行一条」（配件、月份、数量），也可以是「一列一个月份」的横表，横表在这里拆成一行一条；
 *   3. 逐行转成数字 / 日期，转不了的行跳过并写明原因，交给界面展示。
 * 不做任何业务计算。
 */
import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import { PA_DATASET_ROLES, type PaDatasetKey, type PaSkippedRow } from '@totalclaw/ipc-contracts';
import type { InTransitRow, LeadTimeRow, MonthlyShipment, StockRow, YearlyShipment } from './calc';
import { detectHeaderRow, listSheetNames, readTable } from '../serviceSettlement/excel';
import KW from './columnKeywords.json';

export interface TableLike { headers: string[]; rows: Record<string, string>[] }

export type LeadTimeRowX = LeadTimeRow & { supplier?: string };
export type DatasetRows = {
  monthly: MonthlyShipment[];
  yearly: YearlyShipment[];
  leadTime: LeadTimeRowX[];
  inTransit: InTransitRow[];
  stock: StockRow[];
};

export interface Inspection {
  mapping: Record<string, string>;
  layout: 'long' | 'wide';
  /** 横表里认出的期间列：header → 期间（YYYY-MM 或 YYYY） */
  periods: Array<{ header: string; period: string }>;
  /** 必填列里没认出来的角色 */
  missing: string[];
}

export interface IngestResult<T> {
  rows: T[];
  skipped: PaSkippedRow[];
  skippedCount: number;
  notes: string[];
}

const COLUMNS = KW.columns as Record<string, string[]>;
const AVOID = KW.avoid as Record<string, string[]>;
const MAX_SKIPPED_KEPT = 50;

const norm = (s: string): string => String(s ?? '').replace(/\s+/g, '').toLowerCase();

// ── 读文件 ────────────────────────────────────────────────────────────────────

/** 带引号、引号内换行、双引号转义的 CSV；分隔符按第一行里逗号 / 分号 / 制表符哪个多来定 */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] || '';
  const count = (ch: string): number => firstLine.split(ch).length - 1;
  const delim = count('\t') > count(',') && count('\t') >= count(';') ? '\t' : count(';') > count(',') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') { if (src[i + 1] === '"') { cell += '"'; i += 1; } else quoted = false; } else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === delim) { row.push(cell); cell = ''; } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

/** UTF-8 解不出来（出现替换符）就按 GB18030 再解一次：国内业务系统导出的 CSV 很多是 GBK */
export function decodeText(buf: Buffer): string {
  const utf8 = buf.toString('utf-8');
  if (!utf8.includes('�')) return utf8;
  try { return new TextDecoder('gb18030').decode(buf); } catch { return utf8; }
}

export interface FileTable extends TableLike { path: string; fileName: string; sheetName: string }

/**
 * CSV 自己读、单元格一律保留原文：表格库会把「2026-09」这类文字自动转成日期，
 * 在零时区以西的机器上还会差一天，月份就错到上个月去了。
 */
export function readCsvTable(path: string): FileTable {
  const aoa = parseCsv(decodeText(readFileSync(path))).map((r) => r.map((c) => c.trim())).filter((r) => r.some((c) => c !== ''));
  const out: FileTable = { path, fileName: basename(path), sheetName: '', headers: [], rows: [] };
  if (!aoa.length) return out;
  const headerIdx = detectHeaderRow(aoa);
  const seen = new Map<string, number>();
  out.headers = aoa[headerIdx].map((h, i) => {
    let name = h || i18nT('列{p0}', { p0: i + 1 });
    const n = seen.get(name) || 0;
    seen.set(name, n + 1);
    if (n > 0) name = `${name}(${n + 1})`;
    return name;
  });
  for (const line of aoa.slice(headerIdx + 1)) out.rows.push(Object.fromEntries(out.headers.map((h, i) => [h, line[i] ?? ''])));
  return out;
}

/** 读一份数据表：CSV 走上面的读法，Excel 走公共读表 */
export function readDataTable(path: string, sheet?: string): { table: FileTable; sheetNames: string[] } {
  if (extname(path).toLowerCase() === '.csv') return { table: readCsvTable(path), sheetNames: [] };
  return { table: readTable(path, sheet ? { sheetName: sheet } : {}), sheetNames: listSheetNames(path) };
}

// ── 取值 ──────────────────────────────────────────────────────────────────────

/** 空 → null；不是数字 → NaN；"1,234.5 件" 这类带千分位和单位的能认 */
export function parseNum(v: unknown): number | null {
  const s = String(v ?? '').replace(/[,，\s]/g, '');
  if (!s) return null;
  const m = /^[¥￥]?(-?\d+(?:\.\d+)?)[^\d.]*$/.exec(s);
  return m ? Number(m[1]) : NaN;
}

const validYear = (y: number): boolean => y >= 1990 && y <= 2100;
const pad2 = (n: number): string => String(n).padStart(2, '0');

/** 2026-01 / 2026/1 / 2026年1月 / 202601 / 2026-01-15 / 20260115 → 2026-01；认不出返回 '' */
export function parseMonth(v: unknown): string {
  const s = String(v ?? '').trim();
  let m = /^(\d{4})\s*[-/.年]\s*(\d{1,2})(?!\d)/.exec(s);
  if (!m) m = /^(\d{4})(\d{2})(?:\d{2})?$/.exec(s);
  if (!m) return '';
  const y = Number(m[1]);
  const mo = Number(m[2]);
  return validYear(y) && mo >= 1 && mo <= 12 ? `${y}-${pad2(mo)}` : '';
}

/** 2026-11-05 / 2026/11/5 / 2026年11月5日 / 20261105 → 2026-11-05；认不出返回 '' */
export function parseDate(v: unknown): string {
  const s = String(v ?? '').trim();
  let m = /^(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})(?!\d)/.exec(s);
  if (!m) m = /^(\d{4})(\d{2})(\d{2})$/.exec(s);
  if (!m) return '';
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!validYear(y) || mo < 1 || mo > 12 || d < 1 || d > 31) return '';
  // 2 月 30 日这类不存在的日期
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (t.getUTCMonth() !== mo - 1) return '';
  return `${y}-${pad2(mo)}-${pad2(d)}`;
}

export function parseYear(v: unknown): number | null {
  const m = /^(\d{4})(?!\d)/.exec(String(v ?? '').trim());
  if (!m) return null;
  const y = Number(m[1]);
  return validYear(y) ? y : null;
}

function stripNoise(header: string): string {
  let s = norm(header);
  for (const w of KW.periodHeaderNoise as string[]) s = s.split(norm(w)).join('');
  return s.replace(/[()（）_]/g, '');
}

/** 横表的月份列头：2026-01 / 2026年1月 / 202601 / 2026-01-01（日期格式的列头），可以带「发货数量」之类的后缀 */
export function monthOfHeader(header: string): string {
  const s = stripNoise(header);
  if (/^\d{4}[-/.年]\d{1,2}月?$/.test(s) || /^\d{6}$/.test(s) || /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(s)) return parseMonth(s);
  return '';
}

/** 横表的年份列头：2024 / 2024年 / 2024年度 */
export function yearOfHeader(header: string): string {
  const m = /^(\d{4})年?度?$/.exec(stripNoise(header));
  return m && validYear(Number(m[1])) && Number(m[1]) >= 2000 ? m[1] : '';
}

// ── 认列 ──────────────────────────────────────────────────────────────────────

function detectColumn(headers: string[], role: string, used: string[]): string {
  const base = headers.filter((h) => !used.includes(h));
  const avoid = (AVOID[role] || []).map(norm);
  const preferred = base.filter((h) => !avoid.some((a) => norm(h).includes(a)));
  for (const pool of preferred.length < base.length ? [preferred, base] : [base]) {
    for (const kw of COLUMNS[role] || []) {
      const exact = pool.find((h) => norm(h) === norm(kw));
      if (exact) return exact;
      const hit = pool.find((h) => norm(h).includes(norm(kw)));
      if (hit) return hit;
    }
  }
  return '';
}

/**
 * 认列 + 认版式。override 是用户在界面上改过的对应关系：给了就以它为准（只保留表里真有的列）。
 */
export function inspectTable(table: TableLike, dataset: PaDatasetKey, override?: Record<string, string> | null): Inspection {
  const roles = PA_DATASET_ROLES[dataset];
  const headers = table.headers;
  const periods: Inspection['periods'] = [];
  if (dataset === 'monthly' || dataset === 'yearly') {
    for (const h of headers) {
      const period = dataset === 'monthly' ? monthOfHeader(h) : yearOfHeader(h);
      if (period) periods.push({ header: h, period });
    }
  }
  const periodHeaders = new Set(periods.map((p) => p.header));
  const mapping: Record<string, string> = {};
  if (override) {
    for (const r of roles) mapping[r.key] = headers.includes(override[r.key]) ? override[r.key] : '';
  } else {
    const used: string[] = [];
    // 期间列不参与认列：否则「2026年1月发货数量」会被当成数量列
    const pool = headers.filter((h) => !periodHeaders.has(h));
    for (const r of roles) {
      const col = detectColumn(pool, r.key, used);
      mapping[r.key] = col;
      if (col) used.push(col);
    }
  }
  const periodRole = dataset === 'monthly' ? 'month' : 'year';
  const wide = periods.length >= 2 && !mapping[periodRole];
  const required = roles.filter((r) => r.required).map((r) => r.key);
  const missing = (wide ? ['partNo'] : required).filter((k) => !mapping[k]);
  return { mapping, layout: wide ? 'wide' : 'long', periods: wide ? periods : [], missing };
}

// ── 逐行解析 ──────────────────────────────────────────────────────────────────

class Collector<T> {
  rows: T[] = [];
  skipped: PaSkippedRow[] = [];
  skippedCount = 0;
  notes: string[] = [];
  skip(row: number, reason: string): void {
    this.skippedCount += 1;
    if (this.skipped.length < MAX_SKIPPED_KEPT) this.skipped.push({ row, reason });
  }
  done(): IngestResult<T> {
    return { rows: this.rows, skipped: this.skipped, skippedCount: this.skippedCount, notes: this.notes };
  }
}

function isTotalRow(partNo: string): boolean {
  const s = norm(partNo);
  return (KW.totalRowMarks as string[]).some((m) => s === norm(m) || s.startsWith(norm(m)));
}

/** 取配件号；空行、合计行在这里拦掉 */
function partNoOf<T>(c: Collector<T>, r: Record<string, string>, col: string, row: number): string {
  const no = String(r[col] ?? '').trim();
  if (!no) { c.skip(row, i18nT('没有配件编码')); return ''; }
  if (isTotalRow(no)) { c.skip(row, i18nT('合计行')); return ''; }
  return no;
}

function parseShipments(table: TableLike, ins: Inspection, kind: 'monthly' | 'yearly'): IngestResult<MonthlyShipment | YearlyShipment> {
  const c = new Collector<MonthlyShipment | YearlyShipment>();
  const m = ins.mapping;
  const push = (partNo: string, partName: string, period: string, qty: number): void => {
    if (kind === 'monthly') c.rows.push({ partNo, ...(partName ? { partName } : {}), month: period, qty });
    else c.rows.push({ partNo, ...(partName ? { partName } : {}), year: Number(period), qty });
  };
  table.rows.forEach((r, i) => {
    const row = i + 1;
    const partNo = partNoOf(c, r, m.partNo, row);
    if (!partNo) return;
    const partName = m.partName ? String(r[m.partName] ?? '').trim() : '';
    if (ins.layout === 'wide') {
      let bad = 0;
      let negative = 0;
      for (const p of ins.periods) {
        const n = parseNum(r[p.header]);
        if (n === null) continue;
        if (Number.isNaN(n)) { bad += 1; continue; }
        if (n < 0) { negative += 1; continue; }
        push(partNo, partName, p.period, n);
      }
      if (bad) c.skip(row, i18nT('{n} 个期间的数量不是数字，这几格没有读', { n: bad }));
      if (negative) c.skip(row, i18nT('{n} 个期间的数量是负数，这几格没有读', { n: negative }));
      return;
    }
    const period = kind === 'monthly' ? parseMonth(r[m.month]) : String(parseYear(r[m.year]) ?? '');
    if (!period) {
      c.skip(row, kind === 'monthly'
        ? i18nT('月份认不出：{p0}', { p0: String(r[m.month] ?? '') || i18nT('空') })
        : i18nT('年份认不出：{p0}', { p0: String(r[m.year] ?? '') || i18nT('空') }));
      return;
    }
    const n = parseNum(r[m.shipQty]);
    if (n === null) { c.skip(row, i18nT('发货数量是空的')); return; }
    if (Number.isNaN(n)) { c.skip(row, i18nT('发货数量不是数字：{p0}', { p0: String(r[m.shipQty]) })); return; }
    if (n < 0) { c.skip(row, i18nT('发货数量是负数：{p0}', { p0: String(r[m.shipQty]) })); return; }
    push(partNo, partName, period, n);
  });
  return c.done();
}

/** 可选的数字列：空或认不出都当没有，认不出的计数 */
function optionalNum(r: Record<string, string>, col: string, onBad: () => void): number | undefined {
  if (!col) return undefined;
  const n = parseNum(r[col]);
  if (n === null) return undefined;
  if (Number.isNaN(n) || n < 0) { onBad(); return undefined; }
  return n;
}

function parseLeadTimes(table: TableLike, m: Record<string, string>): IngestResult<LeadTimeRowX> {
  const c = new Collector<LeadTimeRowX>();
  let badOptional = 0;
  const seen = new Set<string>();
  let dup = 0;
  table.rows.forEach((r, i) => {
    const row = i + 1;
    const partNo = partNoOf(c, r, m.partNo, row);
    if (!partNo) return;
    const days = parseNum(r[m.leadDays]);
    if (days === null) { c.skip(row, i18nT('采购提前期是空的，这个配件会用默认天数')); return; }
    if (Number.isNaN(days) || days <= 0) { c.skip(row, i18nT('采购提前期不是正数：{p0}', { p0: String(r[m.leadDays]) })); return; }
    if (seen.has(partNo)) dup += 1;
    seen.add(partNo);
    const moq = optionalNum(r, m.moq, () => { badOptional += 1; });
    const unitPrice = optionalNum(r, m.unitPrice, () => { badOptional += 1; });
    const supplier = m.supplier ? String(r[m.supplier] ?? '').trim() : '';
    c.rows.push({ partNo, days, ...(moq ? { moq } : {}), ...(unitPrice ? { unitPrice } : {}), ...(supplier ? { supplier } : {}) });
  });
  if (dup) c.notes.push(i18nT('{n} 个配件在表里出现多次，以最后一行为准', { n: dup }));
  if (badOptional) c.notes.push(i18nT('{n} 格最小起订量或单价认不出，当作没填', { n: badOptional }));
  return c.done();
}

function parseInTransit(table: TableLike, m: Record<string, string>): IngestResult<InTransitRow> {
  const c = new Collector<InTransitRow>();
  let noEta = 0;
  table.rows.forEach((r, i) => {
    const row = i + 1;
    const partNo = partNoOf(c, r, m.partNo, row);
    if (!partNo) return;
    const qty = parseNum(r[m.transitQty]);
    if (qty === null) { c.skip(row, i18nT('在途数量是空的')); return; }
    if (Number.isNaN(qty)) { c.skip(row, i18nT('在途数量不是数字：{p0}', { p0: String(r[m.transitQty]) })); return; }
    if (qty <= 0) { c.skip(row, i18nT('在途数量不大于 0，不算在途')); return; }
    const rawEta = m.eta ? String(r[m.eta] ?? '').trim() : '';
    const eta = parseDate(rawEta);
    if (!eta) noEta += 1;
    const orderNo = m.orderNo ? String(r[m.orderNo] ?? '').trim() : '';
    const supplier = m.supplier ? String(r[m.supplier] ?? '').trim() : '';
    c.rows.push({ partNo, qty, ...(eta ? { eta } : {}), ...(orderNo ? { orderNo } : {}), ...(supplier ? { supplier } : {}) });
  });
  if (noEta) c.notes.push(i18nT('{n} 笔在途没有可用的预计到货日期，按「基准日 + 采购提前期」推算到货', { n: noEta }));
  return c.done();
}

function parseStock(table: TableLike, m: Record<string, string>): IngestResult<StockRow> {
  const c = new Collector<StockRow>();
  let badPrice = 0;
  let negative = 0;
  table.rows.forEach((r, i) => {
    const row = i + 1;
    const partNo = partNoOf(c, r, m.partNo, row);
    if (!partNo) return;
    const qty = parseNum(r[m.stockQty]);
    if (qty === null) { c.skip(row, i18nT('库存数量是空的')); return; }
    if (Number.isNaN(qty)) { c.skip(row, i18nT('库存数量不是数字：{p0}', { p0: String(r[m.stockQty]) })); return; }
    if (qty < 0) negative += 1;
    const partName = m.partName ? String(r[m.partName] ?? '').trim() : '';
    const warehouse = m.warehouse ? String(r[m.warehouse] ?? '').trim() : '';
    const unitPrice = optionalNum(r, m.unitPrice, () => { badPrice += 1; });
    c.rows.push({ partNo, qty, ...(partName ? { partName } : {}), ...(warehouse ? { warehouse } : {}), ...(unitPrice ? { unitPrice } : {}) });
  });
  if (negative) c.notes.push(i18nT('{n} 行库存数量是负数，已照原样读入（同一配件多个仓库会相加）', { n: negative }));
  if (badPrice) c.notes.push(i18nT('{n} 格单价认不出，当作没填', { n: badPrice }));
  return c.done();
}

/** 按认出来的列把整张表转成数据行。必填列没认全会抛错，调用方应先看 inspection.missing。 */
export function parseDataset<K extends PaDatasetKey>(table: TableLike, dataset: K, ins: Inspection): IngestResult<DatasetRows[K][number]> {
  if (ins.missing.length) throw new Error(i18nT('必填列没有对应上，读不了这份表'));
  const m = ins.mapping;
  const out = dataset === 'monthly' ? parseShipments(table, ins, 'monthly')
    : dataset === 'yearly' ? parseShipments(table, ins, 'yearly')
      : dataset === 'leadTime' ? parseLeadTimes(table, m)
        : dataset === 'inTransit' ? parseInTransit(table, m)
          : parseStock(table, m);
  return out as IngestResult<DatasetRows[K][number]>;
}

/** 数据里的期间范围（界面上显示「2023-10 ~ 2026-09」） */
export function periodRange(periods: string[]): { from: string; to: string } {
  if (!periods.length) return { from: '', to: '' };
  const sorted = [...periods].sort();
  return { from: sorted[0], to: sorted[sorted.length - 1] };
}
