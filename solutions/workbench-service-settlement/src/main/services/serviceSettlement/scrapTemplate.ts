import { openSpreadsheetFile, readWorksheetData } from '../spreadsheetRead';
/**
 * 模块三 · 更新报废台账（需求 8.21 修订版，纯计算，不 import electron）。
 *
 * 数据源两种，按《报废台账模板》汇成一张总表：
 *   ① OEM 报废 ← 「xx鉴定表」（.xlsx，两层表头：组表头 + 子表头，勾选格填 1）。
 *      鉴定报告含了所有台数，台账**只记非供应商责任的不可维修部分**；
 *      「自制/OEM」填文件名里的供应商名（「…退奥荣鉴定表…」→ 奥荣）；
 *      「质量鉴定」= 责任 + 质量/非质量问题 + 不可维修（如「品牌方非质量问题不可维修」）。
 *   ② 拆零报废 ← 「报废条码」（.xls，单层表头）。「自制/OEM」固定填「自制」，
 *      质量鉴定 / 退货时间留空，整机数量 = 1。
 *   流程号从父目录名（FYSQ026080001005 这种）带出；流程发起日期文件里没有，只接受用户输入，绝不编造。
 *
 * 渠道匹配对照表（条形码 | 成品物料编码 | 产品型号 | 渠道 | 产品类型）按条码 → 型号 → 店铺依次匹配非空渠道；型号 / 店铺对应多个渠道时继续下一级；
 * 对照表没命中的行按成品描述前缀推断产品类别并计数提示。最后按【渠道 + 品类】聚合报废台数
 * （数据里没有报废费用列；若来源表出现金额类列才额外汇总费用，指标名如实标注）。
 *
 * 表头关键字 / 固定值放在 scrapTemplate.schema.json：它们是匹配导出表的数据，不能被 i18n 词典翻走。
 */
import * as XLSX from 'xlsx';
import { basename, dirname } from 'path';
import { t as i18nT } from '@totalclaw/i18n';
import { toBool, toNumber, writeWorkbook, readTable, type OutSheet, type SheetTable } from './excel';
import { aggregateScrap, type ScrapAggregateResult } from './scrapLedger';
import schema from './scrapTemplate.schema.json';

type Schema = {
  templateHeaders: string[];
  templateAliases: Record<string, string[]>;
  values: { selfMade: string; verdictReasonFormat: string };
  oem: { summarySheet: string[]; supplierFromFileName: string; signature: string[]; columns: Record<string, string[]>; subs: Record<string, string[]> };
  barcode: { signature: string[]; columns: Record<string, string[]> };
  lookup: { barcode: string[]; channel: string[]; category: string[]; model: string[]; shop: string[] };
  amountColumn: string[];
  categoryRules: { contains: string; category: string }[];
};
const S = schema as Schema;

/** 台账列（模板顺序，也是内部记录的字段名） */
export const LEDGER_HEADERS: readonly string[] = S.templateHeaders;
const H = {
  startDate: S.templateHeaders[0], returnDate: S.templateHeaders[1], maker: S.templateHeaders[2], returnType: S.templateHeaders[3],
  barcode: S.templateHeaders[4], materialCode: S.templateHeaders[5], description: S.templateHeaders[6], quantity: S.templateHeaders[7],
  category: S.templateHeaders[8], channel: S.templateHeaders[9], workOrder: S.templateHeaders[10], quality: S.templateHeaders[11],
  verdict: S.templateHeaders[12], processNo: S.templateHeaders[13], production: S.templateHeaders[14], location: S.templateHeaders[15],
};
/** 供调用方（IPC / 界面）按角色取列名，不用自己数下标 */
export const LEDGER_FIELDS = H;

// ── 通用小工具 ──────────────────────────────────────────────────────────────────

const norm = (s: unknown): string => String(s ?? '').replace(/\s+/g, '').toLowerCase();
const normBarcode = (s: unknown): string => String(s ?? '').trim().replace(/\.0+$/, '').toUpperCase();
const PROCESS_NO_RE = /^[A-Z]{2,6}\d{6,}$/;
const TOTAL_ROW_RE = /^(合计|总计|小计|total)/i;
/** 「/」「-」「—」这类占位符：导出表里表示「无」，不是数据 */
const PLACEHOLDER_RE = /^[-/—–\\]+$/;
const blankPlaceholder = (s: string): string => (PLACEHOLDER_RE.test(s) ? '' : s);

/**
 * 文件放错框（鉴定表拖进「报废条码」框 / 条码表或对照表拖进「鉴定表」框）。
 * 单独一个类型：parseOemAppraisal 对单张 sheet 的解析异常是「换下一张」，唯独这个必须原样抛出来，
 * 否则鉴定表会被当拆零全量记入、台账悄悄多出上百行。
 */
export class WrongSourceKindError extends Error {
  constructor(public readonly actualKind: 'oem' | 'barcode' | 'lookup', message: string) {
    super(message);
    this.name = 'WrongSourceKindError';
  }
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 单元格 → 字符串（日期成 YYYY-MM-DD，整数不带小数尾巴） */
function cellText(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? '' : ymd(v);
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(6)));
  return String(v).trim();
}

/** 日期格：Date / Excel 序列号 / "2026/7/10" 文本 → YYYY-MM-DD；认不出原样返回 */
function cellDate(v: unknown): string {
  if (v == null || v === '') return '';
  if (v instanceof Date) return cellText(v);
  if (typeof v === 'number') {
    if (v > 20000 && v < 80000) {
      const p = XLSX.SSF.parse_date_code(v);
      if (p) return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
    }
    return String(v);
  }
  const s = String(v).trim();
  const m = s.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  return s;
}

/**
 * 勾选格：1 / √ / 是 / Y 为勾；空、0、否、/、- 为未勾；其它非空文本也算勾（有人会写「√」以外的记号）。
 * `label` 是这列的子表头：格里直接写着列名（「不可维修」列填「不可维修」）也是勾——
 * 不先判这一条，toBool 会把「不」开头的文字当 false，整列不可维修全部漏记。
 */
function checked(v: unknown, label = ''): boolean {
  const s = String(v ?? '').trim();
  if (!s) return false;
  const l = norm(label);
  if (l) { const n = norm(s); if (n === l || n.startsWith(l)) return true; }
  const b = toBool(s);
  if (b !== undefined) return b;
  return !PLACEHOLDER_RE.test(s);
}

/** 从父目录名推断流程号（FYSQ026080001005） */
export function inferProcessNo(path: string): string {
  const dir = basename(dirname(path)).trim();
  return PROCESS_NO_RE.test(dir) ? dir : '';
}

/** 从鉴定表文件名抠供应商名：「2026年7月10日退奥荣鉴定表（115台）」→ 奥荣 */
export function inferSupplier(path: string): string {
  const m = basename(path).match(new RegExp(S.oem.supplierFromFileName));
  return m ? m[1].trim() : '';
}

/** 一次调用里同一文件只读一遍（鉴定表 3 张 sheet 逐张 readFile 会把文件读三次） */
const wbCache = new Map<string, XLSX.WorkBook>();
function openWorkbook(path: string): XLSX.WorkBook {
  let wb = wbCache.get(path);
  if (!wb) { wb = openSpreadsheetFile(path, { cellDates: true }); wbCache.set(path, wb); }
  return wb;
}

function readAoa(path: string, sheetName: string): unknown[][] {
  const ws = openWorkbook(path).Sheets[sheetName];
  if (!ws) return [];
  return readWorksheetData(ws, { raw: true, defval: null }).rows;
}

/** 在一组列标签里按关键字找列：先精确、再包含（关键字按优先级） */
function findCol(labels: string[], keywords: string[], exclude: Set<number> = new Set()): number {
  const pool = labels.map((l, i) => ({ i, n: norm(l) })).filter((x) => x.n && !exclude.has(x.i));
  for (const kw of keywords) {
    const k = norm(kw);
    const hit = pool.find((x) => x.n === k);
    if (hit) return hit.i;
  }
  for (const kw of keywords) {
    const k = norm(kw);
    const hit = pool.find((x) => x.n.includes(k));
    if (hit) return hit.i;
  }
  return -1;
}

/** 子表头匹配要「相等或前缀」：「不可维修」含「可维修」，「非质量问题」含「质量问题」，包含匹配会串 */
function subMatches(sub: string, keywords: string[]): boolean {
  const n = norm(sub);
  if (!n) return false;
  return keywords.some((kw) => { const k = norm(kw); return n === k || n.startsWith(k); });
}

/** 金额类列（数据里通常没有；有才汇总费用） */
function findAmountCol(labels: string[], exclude: Set<number>): number {
  const pool = labels.map((l, i) => ({ i, n: norm(l) })).filter((x) => x.n && !exclude.has(x.i));
  for (const kw of S.amountColumn) {
    const k = norm(kw);
    const hit = pool.find((x) => x.n === k || x.n.includes(k));
    if (hit) return hit.i;
  }
  return -1;
}

// ── 两层表头 ──────────────────────────────────────────────────────────────────

interface HeaderLayout {
  headerRow: number;
  /** 子表头行；单层表头时 = -1 */
  subRow: number;
  /** 每列：组表头（合并格向右补齐）+ 子表头 */
  cols: { group: string; sub: string }[];
  width: number;
}

function textCells(row: unknown[]): number {
  return row.filter((c) => typeof c === 'string' && c.trim()).length;
}

/**
 * 找表头：前 15 行里「含条码类关键字且文本格最多」的那行；下一行若首列（序号列）为空且有 ≥2 个文本格，
 * 且包含质量 / 责任 / 维修子表头词时才判为子表头，避免首条条码为空或文本条码时吞掉数据。
 */
function detectLayout(aoa: unknown[][], barcodeKeywords: string[]): HeaderLayout | null {
  const limit = Math.min(aoa.length, 15);
  let headerRow = -1;
  let best = -1;
  for (let i = 0; i < limit; i += 1) {
    const row = aoa[i] || [];
    const labels = row.map((c) => cellText(c));
    if (findCol(labels, barcodeKeywords) < 0) continue;
    const score = textCells(row);
    if (score > best) { best = score; headerRow = i; }
  }
  if (headerRow < 0) return null;
  const header = aoa[headerRow] || [];
  const next = aoa[headerRow + 1] || [];
  const firstOfNext = cellText(next[0]);
  const subLabels = Object.values(S.oem.subs).flat().map(norm);
  const hasSubLabel = next.some((c) => subLabels.includes(norm(c)));
  const isSub = hasSubLabel && next.length > 0 && !/^\d+$/.test(firstOfNext) && textCells(next) >= 2 && (firstOfNext === '' || norm(firstOfNext) === norm(cellText(header[0])));
  const subRow = isSub ? headerRow + 1 : -1;
  const width = Math.max(header.length, isSub ? next.length : 0, ...aoa.slice(headerRow + 1, headerRow + 6).map((r) => (r || []).length));
  const cols: HeaderLayout['cols'] = [];
  let lastGroup = '';
  for (let c = 0; c < width; c += 1) {
    const g = cellText(header[c]);
    const sub = isSub ? cellText(next[c]) : '';
    if (g) { lastGroup = g; cols.push({ group: g, sub }); continue; }
    cols.push({ group: sub ? lastGroup : '', sub });
  }
  return { headerRow, subRow, cols, width };
}

function dataRows(aoa: unknown[][], layout: HeaderLayout): { row: unknown[]; index: number }[] {
  const out: { row: unknown[]; index: number }[] = [];
  const start = (layout.subRow >= 0 ? layout.subRow : layout.headerRow) + 1;
  for (let r = start; r < aoa.length; r += 1) {
    const row = aoa[r] || [];
    const firstText = cellText(row.find((c) => cellText(c) !== ''));
    // 「合计」行跳过而不是停：有人把小计插在中间，break 会把后半段整段丢掉（合计行本身没有条码/物料码，调用方会过滤）
    if (TOTAL_ROW_RE.test(firstText)) continue;
    if (!row.some((c) => cellText(c) !== '')) continue;
    out.push({ row, index: r });
  }
  return out;
}

/** 两层表头 + 组表头含「责任鉴定 / 质量鉴定 / 是否可以维修」→ 鉴定表 */
function looksLikeOemLayout(layout: HeaderLayout): boolean {
  if (layout.subRow < 0) return false;
  const kws = S.oem.signature.map(norm);
  return layout.cols.some((c) => { const g = norm(c.group); return Boolean(g) && kws.some((k) => g.includes(k)); });
}

/** 单层表头 + 命中 ≥2 个「标签编码 / 上线类型 / 不良报废原因 / 工单编码」→ 报废条码表 */
function looksLikeBarcodeLayout(layout: HeaderLayout): boolean {
  if (layout.subRow >= 0) return false;
  const labels = layout.cols.map((c) => c.group);
  const hits = S.barcode.signature.filter((k) => findCol(labels, [k]) >= 0).length;
  return hits >= 2;
}

/**
 * 有「渠道」列 + 没有任何条码表 / 鉴定表特征列 → 渠道对照表（拖错框会被当拆零全量记入）。
 * 只看组表头：对照表没有「序号」列、首行数据是字母开头的条码，detectLayout 会把第一条数据误当子表头，不能拿 subRow 当判据。
 */
function looksLikeLookupLayout(layout: HeaderLayout): boolean {
  const labels = layout.cols.map((c) => c.group);
  if (findCol(labels, S.lookup.channel) < 0) return false;
  if (S.barcode.signature.some((k) => findCol(labels, [k]) >= 0)) return false;
  return !looksLikeOemLayout(layout);
}

// ── OEM 鉴定表 ────────────────────────────────────────────────────────────────

export interface OemUnit {
  returnDate: string;
  barcode: string;
  materialCode: string;
  description: string;
  model: string;
  shop: string;
  location: string;
  quantity: number;
  verdict: string;
  /** 子表头原文：质量问题 / 非质量问题 / '' */
  qualityLabel: string;
  /** 子表头原文：品牌方 / 物流 / 供应商 / '' */
  responsibilityLabel: string;
  /** 子表头原文：不可维修 / 可维修 / '' */
  repairLabel: string;
  unrepairable: boolean;
  supplierResponsible: boolean;
  amount?: number;
  sheetName: string;
  rowIndex: number;
}

export interface OemParseOptions {
  processNo?: string;
  supplier?: string;
  /** 指定 sheet；不传：有「汇总」用汇总，否则所有鉴定表 sheet 取并集（按条形码去重） */
  sheetName?: string;
}

export interface OemParseResult {
  path: string;
  fileName: string;
  sheetsUsed: string[];
  supplier: string;
  processNo: string;
  units: OemUnit[];
  warnings: string[];
  amountColumn?: string;
}

interface OemSheetParse { units: OemUnit[]; warnings: string[]; amountColumn?: string }

function parseOemSheet(path: string, sheetName: string): OemSheetParse | null {
  const aoa = readAoa(path, sheetName);
  const fileName = basename(path);
  const wrongBarcode = (): WrongSourceKindError => new WrongSourceKindError('barcode', i18nT('「{file}」是拆零「报废条码」表（有标签编码 / 上线类型 / 工单编码列），请放到「报废条码」框', { file: fileName }));
  const layout = detectLayout(aoa, S.oem.columns.barcode);
  if (!layout) {
    // 鉴定表的条码列叫「条形码」，条码表叫「标签编码」：按鉴定表关键字认不出表头时再按条码表关键字嗅一次，放错框要说清楚而不是「没找到表头」
    const alt = detectLayout(aoa, S.barcode.columns.barcode);
    if (alt && looksLikeBarcodeLayout(alt)) throw wrongBarcode();
    return null;
  }
  if (looksLikeBarcodeLayout(layout)) throw wrongBarcode();
  if (looksLikeLookupLayout(layout)) throw new WrongSourceKindError('lookup', i18nT('「{file}」是渠道对照表（有「渠道」列），请放到第 2 步的对照表框', { file: fileName }));
  const groups = layout.cols.map((c) => c.group);
  const subs = layout.cols.map((c) => c.sub);
  const used = new Set<number>();
  const pick = (key: string): number => {
    // 主列只认「没有子表头」的列（退货时间 / 条形码 / 鉴定结果…），带子表头的组另行处理
    const labels = groups.map((g, i) => (subs[i] ? '' : g));
    const i = findCol(labels, S.oem.columns[key], used);
    if (i >= 0) used.add(i);
    return i;
  };
  const cSeq = pick('seq');
  const cDate = pick('returnDate');
  const cBarcode = pick('barcode');
  const cMaterial = pick('materialCode');
  const cDesc = pick('description');
  const cModel = findCol(groups, S.lookup.model);
  const cShop = findCol(groups, S.lookup.shop);
  const cLoc = pick('location');
  const cQty = pick('quantity');
  const cVerdict = pick('verdict');
  void cSeq;
  if (cBarcode < 0) return null;
  const groupCols = (key: string): number[] => {
    const kws = S.oem.columns[key].map(norm);
    return layout.cols.map((c, i) => ({ c, i })).filter(({ c }) => c.sub && kws.some((k) => norm(c.group) === k || norm(c.group).includes(k))).map(({ i }) => i);
  };
  const subCol = (cols: number[], key: string): number => cols.find((i) => subMatches(subs[i], S.oem.subs[key])) ?? -1;
  const qualityCols = groupCols('quality');
  const respCols = groupCols('responsibility');
  const repairCols = groupCols('repair');
  const cQualityIssue = subCol(qualityCols, 'qualityIssue');
  const cNonQuality = subCol(qualityCols, 'nonQualityIssue');
  const cSupplier = subCol(respCols, 'supplier');
  const respOthers = respCols.filter((i) => i !== cSupplier);
  const cUnrepairable = subCol(repairCols, 'unrepairable');
  const cRepairable = subCol(repairCols, 'repairable');
  const amountIdx = findAmountCol(groups.map((g, i) => (subs[i] ? `${g}${subs[i]}` : g)), new Set([cQty]));
  const warnings: string[] = [];
  if (cUnrepairable < 0 && cRepairable >= 0) {
    const others = repairCols.filter((i) => i !== cRepairable).map((i) => subs[i]).filter(Boolean);
    warnings.push(i18nT('「{sheet}」没认出「不可维修」勾选列{hint}，按「可维修」没勾 = 不可维修判定', { sheet: sheetName, hint: others.length ? i18nT('（子表头是「{sub}」？）', { sub: others.join('、') }) : '' }));
  } else if (cUnrepairable < 0) warnings.push(i18nT('「{sheet}」没有「是否可以维修/不可维修」勾选列，改按鉴定结果文字含「不可维修」判定', { sheet: sheetName }));
  if (!respCols.length) warnings.push(i18nT('「{sheet}」没有「责任鉴定」列，无法剔除供应商责任，全部按非供应商责任处理', { sheet: sheetName }));
  const units: OemUnit[] = [];
  let unflagged = 0;
  for (const { row, index } of dataRows(aoa, layout)) {
    const barcode = cellText(row[cBarcode]);
    const materialCode = cMaterial >= 0 ? cellText(row[cMaterial]) : '';
    if (!barcode && !materialCode) continue;
    let repairLabel = '';
    let unrepairable = false;
    if (cUnrepairable >= 0 && checked(row[cUnrepairable], subs[cUnrepairable])) { unrepairable = true; repairLabel = subs[cUnrepairable]; }
    else if (cRepairable >= 0 && checked(row[cRepairable], subs[cRepairable])) { repairLabel = subs[cRepairable]; }
    else if (cUnrepairable < 0 && cRepairable >= 0) {
      // 只有「可维修」列（「不可维修」写成了「不可以维修」之类认不出）：没勾可维修 = 不可维修，不能整张 0 行记入
      unrepairable = true;
      repairLabel = S.oem.subs.unrepairable[0];
    } else if (cUnrepairable < 0) {
      const text = row.map((c) => cellText(c)).join(' ');
      unrepairable = S.oem.subs.unrepairable.some((k) => text.includes(k));
      if (unrepairable) repairLabel = S.oem.subs.unrepairable[0];
    } else unflagged += 1;
    let responsibilityLabel = '';
    let supplierResponsible = false;
    if (cSupplier >= 0 && checked(row[cSupplier], subs[cSupplier])) { supplierResponsible = true; responsibilityLabel = subs[cSupplier]; }
    else {
      const hit = respOthers.find((i) => checked(row[i], subs[i]));
      if (hit != null) responsibilityLabel = subs[hit];
    }
    let qualityLabel = '';
    if (cNonQuality >= 0 && checked(row[cNonQuality], subs[cNonQuality])) qualityLabel = subs[cNonQuality];
    else if (cQualityIssue >= 0 && checked(row[cQualityIssue], subs[cQualityIssue])) qualityLabel = subs[cQualityIssue];
    const qty = cQty >= 0 ? toNumber(row[cQty]) : 0;
    units.push({
      returnDate: cDate >= 0 ? cellDate(row[cDate]) : '',
      barcode,
      materialCode,
      description: cDesc >= 0 ? cellText(row[cDesc]) : '',
      model: cModel >= 0 ? blankPlaceholder(cellText(row[cModel])) : (cDesc >= 0 ? blankPlaceholder(cellText(row[cDesc])) : ''),
      shop: cShop >= 0 ? blankPlaceholder(cellText(row[cShop])) : '',
      location: cLoc >= 0 ? cellText(row[cLoc]) : '',
      quantity: qty > 0 ? qty : 1,
      verdict: cVerdict >= 0 ? cellText(row[cVerdict]) : '',
      qualityLabel,
      responsibilityLabel,
      repairLabel,
      unrepairable,
      supplierResponsible,
      amount: amountIdx >= 0 ? toNumber(row[amountIdx]) : undefined,
      sheetName,
      rowIndex: index + 1,
    });
  }
  if (unflagged) warnings.push(i18nT('「{sheet}」有 {n} 台既没勾可维修也没勾不可维修，按可维修处理（不记入台账）', { sheet: sheetName, n: unflagged }));
  return { units, warnings, amountColumn: amountIdx >= 0 ? groups[amountIdx] : undefined };
}

/** 解析一份 OEM 鉴定表（不做筛选：units 含所有台数，筛选在 buildScrapLedger） */
export function parseOemAppraisal(path: string, opts: OemParseOptions = {}): OemParseResult {
  const fileName = basename(path);
  wbCache.delete(path);
  const names = openWorkbook(path).SheetNames || [];
  const warnings: string[] = [];
  const supplier = (opts.supplier || '').trim() || inferSupplier(path);
  const processNo = (opts.processNo || '').trim() || inferProcessNo(path);
  if (!supplier) warnings.push(i18nT('「{file}」无法从文件名识别供应商名（需要形如「退XX鉴定表」），台账「自制/OEM」留空请手工补', { file: fileName }));
  if (!processNo) warnings.push(i18nT('「{file}」所在文件夹不是流程号命名（如 FYSQ026080001005），台账「流程号」留空', { file: fileName }));
  const summary = names.find((n) => S.oem.summarySheet.some((k) => norm(n).includes(norm(k))));
  let chosen: string[] = [];
  if (opts.sheetName && names.includes(opts.sheetName)) chosen = [opts.sheetName];
  else chosen = summary ? [summary] : names;
  const units: OemUnit[] = [];
  const sheetsUsed: string[] = [];
  let amountColumn: string | undefined;
  const seen = new Map<string, number>();
  let dup = 0;
  const consume = (list: string[]): void => {
    for (const n of list) {
      let parsed: OemSheetParse | null = null;
      // 单张 sheet 认不出表头就换下一张；唯独「放错框」必须原样抛出去（否则条码表 / 对照表会被当鉴定表吞掉）
      try { parsed = parseOemSheet(path, n); } catch (e) { if (e instanceof WrongSourceKindError) { wbCache.delete(path); throw e; } parsed = null; }
      if (!parsed) continue;
      sheetsUsed.push(n);
      warnings.push(...parsed.warnings);
      if (parsed.amountColumn && !amountColumn) amountColumn = parsed.amountColumn;
      for (const u of parsed.units) {
        const key = normBarcode(u.barcode);
        // 没有「汇总」时把明细 sheet 并起来：同一台在两张明细里都出现只算一次
        if (list.length > 1 && key) {
          if (seen.has(key)) { dup += 1; continue; }
          seen.set(key, 1);
        }
        units.push(u);
      }
    }
  };
  consume(chosen);
  // 「汇总」sheet 有名无实（没有条形码表头，比如只放了一段说明）→ 回退到明细 sheet，不能一句「没找到表头」把整份文件拒掉
  if (!sheetsUsed.length && summary && !opts.sheetName && names.length > 1) {
    chosen = names.filter((n) => n !== summary);
    warnings.push(i18nT('「{file}」的「{sheet}」sheet 里没认出鉴定表表头，改用明细 sheet 合并', { file: fileName, sheet: summary }));
    consume(chosen);
  }
  if (!sheetsUsed.length) { wbCache.delete(path); throw new Error(i18nT('「{file}」里没有找到鉴定表表头（需要含「条形码」列）', { file: fileName })); }
  if (chosen.length > 1) warnings.push(i18nT('「{file}」没有可用的「汇总」sheet，已合并 {n} 张明细表{dup}', { file: fileName, n: sheetsUsed.length, dup: dup ? i18nT('（去重 {d} 台）', { d: dup }) : '' }));
  wbCache.delete(path);
  return { path, fileName, sheetsUsed, supplier, processNo, units, warnings, amountColumn };
}

// ── 拆零「报废条码」 ───────────────────────────────────────────────────────────

export interface BarcodeUnit {
  returnType: string;
  workOrder: string;
  barcode: string;
  materialCode: string;
  description: string;
  model: string;
  shop: string;
  verdict: string;
  reason: string;
  production: string;
  location: string;
  quantity: number;
  amount?: number;
  rowIndex: number;
}

export interface BarcodeParseResult {
  path: string;
  fileName: string;
  sheetName: string;
  processNo: string;
  units: BarcodeUnit[];
  warnings: string[];
  amountColumn?: string;
}

export function parseScrapBarcodes(path: string, opts: { processNo?: string; sheetName?: string } = {}): BarcodeParseResult {
  const fileName = basename(path);
  wbCache.delete(path);
  const names = openWorkbook(path).SheetNames || [];
  const warnings: string[] = [];
  const processNo = (opts.processNo || '').trim() || inferProcessNo(path);
  if (!processNo) warnings.push(i18nT('「{file}」所在文件夹不是流程号命名（如 FYSQ026070001392），台账「流程号」留空', { file: fileName }));
  const candidates = opts.sheetName && names.includes(opts.sheetName) ? [opts.sheetName] : names;
  for (const sheetName of candidates) {
    const aoa = readAoa(path, sheetName);
    const layout = detectLayout(aoa, S.barcode.columns.barcode);
    if (!layout) continue;
    // 鉴定表两级表头也含「条形码」，各列包含匹配全能命中 → 会被当拆零全量记入（供应商责任 / 可维修的全混进来）。放错框直接拒。
    if (looksLikeOemLayout(layout)) { wbCache.delete(path); throw new WrongSourceKindError('oem', i18nT('「{file}」是 OEM 鉴定表（有责任鉴定 / 质量鉴定 / 是否可以维修列），请放到「鉴定表」框', { file: fileName })); }
    if (looksLikeLookupLayout(layout)) { wbCache.delete(path); throw new WrongSourceKindError('lookup', i18nT('「{file}」是渠道对照表（有「渠道」列），请放到第 2 步的对照表框', { file: fileName })); }
    const labels = layout.cols.map((c) => (c.sub ? `${c.group}${c.sub}` : c.group));
    const used = new Set<number>();
    const pick = (key: string): number => { const i = findCol(labels, S.barcode.columns[key], used); if (i >= 0) used.add(i); return i; };
    pick('seq');
    const cBarcode = pick('barcode');
    if (cBarcode < 0) continue;
    const cType = pick('returnType');
    const cWo = pick('workOrder');
    const cMaterial = pick('materialCode');
    const cDesc = pick('description');
    const cModel = findCol(labels, S.lookup.model);
    const cShop = findCol(labels, S.lookup.shop);
    const cVerdict = pick('verdict');
    const cReason = pick('reason');
    const cProd = pick('production');
    const cLoc = pick('location');
    const cQty = pick('quantity');
    const cAmount = findAmountCol(labels, used);
    const units: BarcodeUnit[] = [];
    for (const { row, index } of dataRows(aoa, layout)) {
      const barcode = cellText(row[cBarcode]);
      const materialCode = cMaterial >= 0 ? cellText(row[cMaterial]) : '';
      if (!barcode && !materialCode) continue;
      const qty = cQty >= 0 ? toNumber(row[cQty]) : 0;
      units.push({
        // 上线类型 / 在产情况 写「/」是导出表的「无」，不能原样落进台账
        returnType: cType >= 0 ? blankPlaceholder(cellText(row[cType])) : '',
        workOrder: cWo >= 0 ? cellText(row[cWo]) : '',
        barcode,
        materialCode,
        description: cDesc >= 0 ? cellText(row[cDesc]) : '',
        model: cModel >= 0 ? blankPlaceholder(cellText(row[cModel])) : (cDesc >= 0 ? blankPlaceholder(cellText(row[cDesc])) : ''),
        shop: cShop >= 0 ? blankPlaceholder(cellText(row[cShop])) : '',
        verdict: cVerdict >= 0 ? cellText(row[cVerdict]) : '',
        reason: cReason >= 0 ? blankPlaceholder(cellText(row[cReason])) : '',
        production: cProd >= 0 ? blankPlaceholder(cellText(row[cProd])) : '',
        location: cLoc >= 0 ? cellText(row[cLoc]) : '',
        quantity: qty > 0 ? qty : 1,
        amount: cAmount >= 0 ? toNumber(row[cAmount]) : undefined,
        rowIndex: index + 1,
      });
    }
    wbCache.delete(path);
    return { path, fileName, sheetName, processNo, units, warnings, amountColumn: cAmount >= 0 ? labels[cAmount] : undefined };
  }
  wbCache.delete(path);
  throw new Error(i18nT('「{file}」里没有找到报废条码表头（需要含「标签编码」或「条码」列）', { file: fileName }));
}

// ── 模板 / 对照表 ─────────────────────────────────────────────────────────────

/** 读《报废台账模板》真表头（第 3 行那种带说明行的模板也认）；认不出回默认 16 列 */
export function readTemplateHeaders(templatePath: string): { headers: string[]; fromTemplate: boolean } {
  wbCache.delete(templatePath);
  const first = (openWorkbook(templatePath).SheetNames || [])[0];
  if (!first) return { headers: [...S.templateHeaders], fromTemplate: false };
  const aoa = readAoa(templatePath, first);
  wbCache.delete(templatePath);
  const known = new Set(S.templateHeaders.map(norm));
  for (const row of aoa.slice(0, 15)) {
    const cells = (row || []).map((c) => cellText(c)).filter(Boolean);
    const hits = cells.filter((c) => known.has(norm(c))).length;
    if (hits >= 3) return { headers: cells, fromTemplate: true };
  }
  return { headers: [...S.templateHeaders], fromTemplate: false };
}

/**
 * 模板列 → 内部字段：同名 → 别名精确相等（「工单号」→ 工单编码，见 schema.templateAliases）→ 关键字包含；模板里多出来的列留空。
 * 2026-09-07：客户模板把列叫「工单号」时整列静默为空（只在 warnings 里提一句「模板里没有工单编码」），别名表是给这种改名模板兜底的。
 */
function mapTemplateHeader(header: string): string {
  const n = norm(header);
  if (!n) return '';
  const exact = S.templateHeaders.find((h) => norm(h) === n);
  if (exact) return exact;
  const alias = S.templateHeaders.find((h) => (S.templateAliases[h] || []).some((a) => norm(a) === n));
  if (alias) return alias;
  const includes = S.templateHeaders.find((h) => n.includes(norm(h)) || norm(h).includes(n));
  return includes || '';
}

interface ChannelValue { channel: string; category: string }
type FallbackIndex = Map<string, ChannelValue | null>;
/** 型号和店铺仅做完整值匹配，避免近似型号误归渠道；占位符不参与。 */
const matchKey = (value: string): string => norm(blankPlaceholder(value.trim()));
function addFallback(index: FallbackIndex, key: string, value: ChannelValue | null): void {
  if (!key) return;
  if (!index.has(key)) { index.set(key, value && { ...value }); return; }
  const previous = index.get(key);
  if (!previous || !value || previous.channel !== value.channel) { index.set(key, null); return; }
  // 渠道一致但品类冲突时，只确定渠道，品类回落到来源描述推断。
  if (previous.category !== value.category) previous.category = '';
}
export interface LookupTable {
  path: string;
  sheetName: string;
  rows: number;
  barcodeColumn: string;
  channelColumn: string;
  categoryColumn: string;
  map: Map<string, ChannelValue>;
  models: FallbackIndex;
  shops: FallbackIndex;
  duplicates: string[];
}

export function loadLookup(ref: { path: string; sheetName?: string; barcodeColumn?: string; channelColumn?: string; categoryColumn?: string; modelColumn?: string; shopColumn?: string }): LookupTable {
  const table: SheetTable = readTable(ref.path, { sheetName: ref.sheetName });
  const used = new Set<number>();
  const pick = (given: string | undefined, kws: string[]): string => {
    if (given && table.headers.includes(given)) { used.add(table.headers.indexOf(given)); return given; }
    const i = findCol(table.headers, kws, used);
    if (i >= 0) used.add(i);
    return i >= 0 ? table.headers[i] : '';
  };
  const barcodeColumn = pick(ref.barcodeColumn, S.lookup.barcode);
  const channelColumn = pick(ref.channelColumn, S.lookup.channel);
  const categoryColumn = pick(ref.categoryColumn, S.lookup.category);
  const modelColumn = pick(ref.modelColumn, S.lookup.model);
  const shopColumn = pick(ref.shopColumn, S.lookup.shop);
  if (!barcodeColumn && !modelColumn && !shopColumn) throw new Error(i18nT('渠道对照表至少需要条码、型号或店铺中的一列'));
  if (!channelColumn) throw new Error(i18nT('渠道对照表没有「渠道」列'));
  const map = new Map<string, { channel: string; category: string }>();
  const dup = new Set<string>();
  const models: FallbackIndex = new Map();
  const shops: FallbackIndex = new Map();
  for (const r of table.rows) {
    const value = { channel: blankPlaceholder((r[channelColumn] || '').trim()), category: categoryColumn ? blankPlaceholder((r[categoryColumn] || '').trim()) : '' };
    // 空渠道不能中断后续匹配，也不遮挡后面的有效记录。
    if (!value.channel) continue;
    if (modelColumn) addFallback(models, matchKey(r[modelColumn] || ''), value);
    if (shopColumn) addFallback(shops, matchKey(r[shopColumn] || ''), value);
    const key = normBarcode(blankPlaceholder((r[barcodeColumn] || '').trim()));
    if (!key) continue;
    if (map.has(key)) { dup.add(key); continue; }
    map.set(key, value);
  }
  return { path: ref.path, sheetName: table.sheetName, rows: table.rows.length, barcodeColumn, channelColumn, categoryColumn, map, models, shops, duplicates: [...dup].slice(0, 200) };
}

/** 对照表没命中时按成品描述前缀猜品类：「电热水器DJF60…」→ 电热水器；「双眼灶JZT…」→ 灶具 */
export function inferCategory(description: string): string {
  const s = String(description || '').trim();
  if (!s) return '';
  const m = s.match(/^[一-龥]+/);
  const prefix = m ? m[0] : '';
  const probe = prefix || s;
  for (const rule of S.categoryRules) {
    if (probe.includes(rule.contains)) return rule.category || prefix;
  }
  return prefix;
}

// ── 汇总 ──────────────────────────────────────────────────────────────────────

export interface ScrapLedgerSource {
  kind: 'oem' | 'barcode';
  path: string;
  fileName: string;
  sheets: string[];
  processNo: string;
  supplier?: string;
  units: number;
  kept: number;
  /** 这份文件解析失败的原因（只在 inspectScrapSources 里出现；buildScrapLedger 遇到直接抛） */
  error?: string;
}

export interface ScrapLedgerCounts {
  oemFiles: number;
  barcodeFiles: number;
  oemUnits: number;
  oemKept: number;
  oemDroppedSupplier: number;
  oemDroppedRepairable: number;
  barcodeUnits: number;
  total: number;
  /** 台数（整机数量之和） */
  totalUnits: number;
  matched: number;
  unmatched: number;
  blankBarcode: number;
  categoryInferred: number;
  lookupRows: number;
  lookupDuplicates: number;
  duplicateBarcodes: number;
}

export interface ScrapLedgerBuildInput {
  oemFiles: string[];
  barcodeFiles: string[];
  lookup?: { path: string; sheetName?: string; barcodeColumn?: string; channelColumn?: string; categoryColumn?: string; modelColumn?: string; shopColumn?: string } | null;
  lookups?: Parameters<typeof loadLookup>[0][];
  templatePath?: string;
  /** 流程发起日期（文件里没有；不传留空） */
  startDate?: string;
  /** 按文件覆盖供应商名 / 流程号（文件名 / 目录名认不出时界面补填） */
  supplierByFile?: Record<string, string>;
  processNoByFile?: Record<string, string>;
  /** 台账末尾追加「报废原因」列（拆零表的不良/报废原因）。默认关：8.21 模板的「鉴定结果」是裸「不可维修」，原因不拼进去 */
  includeReason?: boolean;
}

export interface ScrapLedgerBuildResult {
  /** 台账表头（模板顺序；来源表有金额列时末尾追加「报废费用(元)」） */
  headers: string[];
  /** 按 headers 取值 */
  rows: Record<string, string>[];
  warnings: string[];
  counts: ScrapLedgerCounts;
  sources: ScrapLedgerSource[];
  /** 渠道 × 品类 台数聚合（amount 字段 = 台数） */
  aggregate: ScrapAggregateResult;
  /** 有金额列时的费用聚合 */
  aggregateAmount: ScrapAggregateResult | null;
  amountColumn?: string;
  summaryHeaders: string[];
  summary: (string | number)[][];
  pivot: { headers: string[]; rows: (string | number)[][] };
  unmatched: { barcode: string; description: string; source: string; processNo: string }[];
  templateUsed: boolean;
  startDate: string;
}

export const AMOUNT_HEADER = i18nT('报废费用(元)');
/** includeReason 时追加的列 */
export const REASON_HEADER = i18nT('报废原因');

function buildSummary(units: ScrapAggregateResult, amount: ScrapAggregateResult | null): { headers: string[]; rows: (string | number)[][] } {
  const headers = [i18nT('渠道'), i18nT('品类'), i18nT('报废记录数'), i18nT('报废台数')];
  if (amount) headers.push(AMOUNT_HEADER);
  const amountOf = (channel: string, category: string): number => amount?.rows.find((r) => r.channel === channel && r.category === category)?.amount ?? 0;
  const amountOfChannel = (channel: string): number => amount?.channelTotals.find((c) => c.channel === channel)?.amount ?? 0;
  const rows: (string | number)[][] = [];
  for (const c of units.channelTotals) {
    for (const r of units.rows.filter((x) => x.channel === c.channel)) {
      const line: (string | number)[] = [r.channel, r.category, r.count, r.amount];
      if (amount) line.push(amountOf(r.channel, r.category));
      rows.push(line);
    }
    const sub: (string | number)[] = [i18nT('{p0} 小计', { p0: c.channel }), '', c.count, c.amount];
    if (amount) sub.push(amountOfChannel(c.channel));
    rows.push(sub);
  }
  const total: (string | number)[] = [i18nT('合计'), '', units.total.count, units.total.amount];
  if (amount) total.push(amount.total.amount);
  rows.push(total);
  return { headers, rows };
}

function buildPivot(units: ScrapAggregateResult): { headers: string[]; rows: (string | number)[][] } {
  const categories = [...new Set(units.rows.map((r) => r.category))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const headers = [i18nT('渠道'), ...categories.map((c) => i18nT('{c}(台)', { c })), i18nT('合计(台)')];
  const rows = units.channelTotals.map((c) => {
    const line: (string | number)[] = [c.channel];
    for (const cat of categories) line.push(units.rows.find((r) => r.channel === c.channel && r.category === cat)?.amount ?? 0);
    line.push(c.amount);
    return line;
  });
  const totalLine: (string | number)[] = [i18nT('合计')];
  for (const cat of categories) totalLine.push(units.rows.filter((r) => r.category === cat).reduce((s, r) => s + r.amount, 0));
  totalLine.push(units.total.amount);
  rows.push(totalLine);
  return { headers, rows };
}

/** OEM 台数是否记入台账：不可维修 且 非供应商责任 */
export function oemUnitKept(u: OemUnit): 'kept' | 'repairable' | 'supplier' {
  if (!u.unrepairable) return 'repairable';
  if (u.supplierResponsible) return 'supplier';
  return 'kept';
}

export function buildScrapLedger(input: ScrapLedgerBuildInput): ScrapLedgerBuildResult {
  const warnings: string[] = [];
  const sources: ScrapLedgerSource[] = [];
  const startDate = cellDate(String(input.startDate || '').trim());
  const oemFiles = (input.oemFiles || []).filter(Boolean);
  const barcodeFiles = (input.barcodeFiles || []).filter(Boolean);
  if (!oemFiles.length && !barcodeFiles.length) throw new Error(i18nT('请至少提供一份鉴定表或报废条码文件'));

  // 内部记录：f 的字段名 = 模板默认列名；amount / source / desc 是不进台账的元信息
  interface Rec { f: Record<string, string>; amount?: number; source: string; desc: string; model: string; shop: string; reason?: string }
  const records: Rec[] = [];
  let amountColumn: string | undefined;
  const counts: ScrapLedgerCounts = {
    oemFiles: oemFiles.length, barcodeFiles: barcodeFiles.length, oemUnits: 0, oemKept: 0, oemDroppedSupplier: 0, oemDroppedRepairable: 0,
    barcodeUnits: 0, total: 0, totalUnits: 0, matched: 0, unmatched: 0, blankBarcode: 0, categoryInferred: 0, lookupRows: 0, lookupDuplicates: 0, duplicateBarcodes: 0,
  };

  for (const p of oemFiles) {
    const parsed = parseOemAppraisal(p, { supplier: input.supplierByFile?.[p], processNo: input.processNoByFile?.[p] });
    warnings.push(...parsed.warnings);
    if (parsed.amountColumn && !amountColumn) amountColumn = parsed.amountColumn;
    let kept = 0;
    for (const u of parsed.units) {
      counts.oemUnits += 1;
      const verdict = oemUnitKept(u);
      if (verdict === 'repairable') { counts.oemDroppedRepairable += 1; continue; }
      if (verdict === 'supplier') { counts.oemDroppedSupplier += 1; continue; }
      counts.oemKept += 1;
      kept += 1;
      records.push({
        f: {
          [H.startDate]: startDate,
          [H.returnDate]: u.returnDate,
          [H.maker]: parsed.supplier,
          [H.returnType]: '',
          [H.barcode]: u.barcode,
          [H.materialCode]: u.materialCode,
          [H.description]: u.description,
          [H.quantity]: String(u.quantity),
          [H.category]: '',
          [H.channel]: '',
          [H.workOrder]: '',
          [H.quality]: `${u.responsibilityLabel}${u.qualityLabel}${u.repairLabel}`,
          [H.verdict]: u.verdict,
          [H.processNo]: parsed.processNo,
          [H.production]: '',
          [H.location]: u.location,
        },
        amount: u.amount,
        source: parsed.fileName,
        desc: u.description,
        model: u.model,
        shop: u.shop,
      });
    }
    sources.push({ kind: 'oem', path: p, fileName: parsed.fileName, sheets: parsed.sheetsUsed, processNo: parsed.processNo, supplier: parsed.supplier, units: parsed.units.length, kept });
  }

  for (const p of barcodeFiles) {
    const parsed = parseScrapBarcodes(p, { processNo: input.processNoByFile?.[p] });
    warnings.push(...parsed.warnings);
    if (parsed.amountColumn && !amountColumn) amountColumn = parsed.amountColumn;
    for (const u of parsed.units) {
      counts.barcodeUnits += 1;
      const reason = blankPlaceholder(u.reason || '');
      // schema 默认 "{verdict}"：鉴定结果与 8.21 模板示例一样是裸「不可维修」；原因走 includeReason 独立列
      const verdict = reason ? S.values.verdictReasonFormat.replace('{verdict}', u.verdict).replace('{reason}', reason) : u.verdict;
      records.push({
        reason,
        f: {
          [H.startDate]: startDate,
          [H.returnDate]: '',
          [H.maker]: S.values.selfMade,
          [H.returnType]: u.returnType,
          [H.barcode]: u.barcode,
          [H.materialCode]: u.materialCode,
          [H.description]: u.description,
          [H.quantity]: String(u.quantity),
          [H.category]: '',
          [H.channel]: '',
          [H.workOrder]: u.workOrder,
          [H.quality]: '',
          [H.verdict]: verdict,
          [H.processNo]: parsed.processNo,
          [H.production]: u.production,
          [H.location]: u.location,
        },
        amount: u.amount,
        source: parsed.fileName,
        desc: u.description,
        model: u.model,
        shop: u.shop,
      });
    }
    sources.push({ kind: 'barcode', path: p, fileName: parsed.fileName, sheets: [parsed.sheetName], processNo: parsed.processNo, units: parsed.units.length, kept: parsed.units.length });
  }

  // 渠道 / 品类匹配
  // 跨表渠道冲突的条码：不但不能取其中一个，也**不能再降级到型号/店铺** ——
  // 我们已经确知这个条码有歧义，拿同型号别的行去补等于换个途径猜。
  const conflictedBarcodes = new Set<string>();
  let lookup: LookupTable | null = null;
  const refs = input.lookups ?? (input.lookup?.path ? [input.lookup] : []);
  if (refs.length) {
    const tables = refs.map((ref) => loadLookup(ref));
    lookup = { ...tables[0], rows: 0, map: new Map(), models: new Map(), shops: new Map(), duplicates: [], categoryColumn: '' };
    const duplicates = new Set<string>();
    for (const table of tables) {
      lookup.rows += table.rows;
      for (const [key, value] of table.models) addFallback(lookup.models, key, value);
      for (const [key, value] of table.shops) addFallback(lookup.shops, key, value);
      lookup.categoryColumn ||= table.categoryColumn;
      for (const key of table.duplicates) duplicates.add(key);
      for (const [key, value] of table.map) {
        const previous = lookup.map.get(key);
        if (!previous) { lookup.map.set(key, value); continue; }
        if (previous.channel === value.channel) {
          // 同一条码同一渠道，只是出现在多张表里 —— 沿用既有的「按第一条取」，
          // 仅在品类不一致时把品类清空回落描述推断（与 addFallback 的口径一致）。
          duplicates.add(key);
          if (previous.category !== value.category) previous.category = '';
          continue;
        }
        // **跨表渠道冲突**：两份对照表对同一条码给了不同渠道（常见于一份旧表 + 一份增量表，
        // 或线上/线下各一份）。先到先得会让「同样的文件换个拖入顺序，汇总数字就不一样」。
        // 同文件里型号/店铺遇到这种情况是置 null 拒绝匹配的，条码没理由更宽松 ——
        // 删掉它，让这些行走「未匹配条码」明细，由人来裁决。
        lookup.map.delete(key);
        conflictedBarcodes.add(key);
      }
    }
    // 冲突过的条码即便后续再遇到也不再重新接受，避免顺序仍然影响结果。
    for (const key of conflictedBarcodes) lookup.map.delete(key);
    lookup.duplicates = [...duplicates];
    counts.lookupRows = lookup.rows;
    counts.lookupDuplicates = lookup.duplicates.length;
    if (conflictedBarcodes.size) {
      warnings.push(i18nT('{n} 个条码在多份对照表里渠道不一致，已按「无法确定」处理，请在未匹配明细里核对：{list}', {
        n: conflictedBarcodes.size, list: [...conflictedBarcodes].slice(0, 10).join('、'),
      }));
    }
    if (lookup.duplicates.length) warnings.push(i18nT('对照表里 {n} 个条码出现多次，按第一条取：{list}', { n: lookup.duplicates.length, list: lookup.duplicates.slice(0, 10).join('、') }));
    if (!lookup.categoryColumn) warnings.push(i18nT('对照表没有「产品类型」列，产品类别全部按成品描述推断'));
  } else {
    warnings.push(i18nT('没有提供渠道对照表：渠道留空，产品类别按成品描述推断'));
  }
  const unmatched: ScrapLedgerBuildResult['unmatched'] = [];
  const barcodeSeen = new Map<string, number>();
  const matchCounts = { barcode: 0, model: 0, shop: 0 };
  let ambiguous = 0;
  for (const { f, desc, source, model, shop } of records) {
    const key = normBarcode(f[H.barcode]);
    if (!key) counts.blankBarcode += 1;
    else barcodeSeen.set(key, (barcodeSeen.get(key) || 0) + 1);
    let hit = key && lookup ? lookup.map.get(key) : undefined;
    // 已确知有歧义的条码：直接判未匹配。降级到型号/店铺只是换个途径猜，
    // 而且会把「两份表说法不一」这件事悄悄抹平。
    const conflicted = !!key && conflictedBarcodes.has(key);
    if (hit) matchCounts.barcode += 1;
    else if (conflicted) { ambiguous += 1; }
    else if (lookup) {
      const modelHit = lookup.models.get(matchKey(model));
      const shopHit = lookup.shops.get(matchKey(shop));
      if (modelHit) { hit = modelHit; matchCounts.model += 1; }
      else if (shopHit) { hit = shopHit; matchCounts.shop += 1; }
      else if (modelHit === null || shopHit === null) ambiguous += 1;
    }
    if (hit) {
      counts.matched += 1;
      f[H.channel] = hit.channel;
      f[H.category] = hit.category;
    } else {
      counts.unmatched += 1;
      unmatched.push({ barcode: f[H.barcode], description: desc, source, processNo: f[H.processNo] });
    }
    if (!f[H.category]) {
      const inferred = inferCategory(desc);
      if (inferred) { f[H.category] = inferred; counts.categoryInferred += 1; }
    }
  }
  counts.duplicateBarcodes = [...barcodeSeen.values()].filter((n) => n > 1).length;
  if (counts.unmatched) warnings.push(i18nT('{n} 行依次按条码、型号、店铺仍未确定渠道，渠道留空（汇总计入「未知渠道」），明细见「未匹配条码」sheet', { n: counts.unmatched }));
  if (matchCounts.model || matchCounts.shop) warnings.push(i18nT('渠道匹配：条码 {barcode} 行、型号 {model} 行、店铺 {shop} 行', matchCounts));
  if (ambiguous) warnings.push(i18nT('{n} 行型号或店铺对应多个渠道，无法唯一确定，已保留为未匹配', { n: ambiguous }));
  if (counts.categoryInferred) warnings.push(i18nT('{n} 行产品类别是按成品描述推断的（对照表没给），请复核', { n: counts.categoryInferred }));
  if (counts.blankBarcode) warnings.push(i18nT('{n} 行没有条形码', { n: counts.blankBarcode }));
  if (counts.duplicateBarcodes) warnings.push(i18nT('{n} 个条形码在台账里出现多次（多份来源文件重复？）', { n: counts.duplicateBarcodes }));

  // 表头：模板顺序（可选自定义模板）；金额列存在时末尾追加
  let headers = [...S.templateHeaders];
  let templateUsed = false;
  if (input.templatePath) {
    try {
      const tpl = readTemplateHeaders(input.templatePath);
      if (tpl.fromTemplate) { headers = tpl.headers; templateUsed = true; }
      else warnings.push(i18nT('模板「{file}」里没认出台账表头，按默认 16 列输出', { file: basename(input.templatePath) }));
    } catch (e) {
      warnings.push(i18nT('模板「{file}」读取失败（{msg}），按默认 16 列输出', { file: basename(input.templatePath), msg: (e as Error)?.message || String(e) }));
    }
  }
  const fieldOf = new Map<string, string>();
  for (const h of headers) fieldOf.set(h, mapTemplateHeader(h));
  if (templateUsed) {
    const missing = S.templateHeaders.filter((f) => ![...fieldOf.values()].includes(f));
    if (missing.length) warnings.push(i18nT('模板里没有这些列，对应数据不会输出：{list}', { list: missing.join('、') }));
  }
  const hasAmount = Boolean(amountColumn) && records.some((r) => (r.amount || 0) > 0);
  if (hasAmount && !headers.includes(AMOUNT_HEADER)) headers.push(AMOUNT_HEADER);
  if (hasAmount) warnings.push(i18nT('来源表里发现金额列「{col}」，已在台账末尾追加「{h}」并汇总费用', { col: amountColumn || '', h: AMOUNT_HEADER }));
  const withReason = Boolean(input.includeReason);
  if (withReason && !headers.includes(REASON_HEADER)) headers.push(REASON_HEADER);

  const rows: Record<string, string>[] = records.map((r) => {
    const out: Record<string, string> = {};
    for (const h of headers) {
      if (h === AMOUNT_HEADER) { out[h] = r.amount != null ? String(r.amount) : ''; continue; }
      if (withReason && h === REASON_HEADER) { out[h] = r.reason || ''; continue; }
      const field = fieldOf.get(h) || '';
      out[h] = field ? (r.f[field] ?? '') : '';
    }
    return out;
  });
  counts.total = records.length;
  counts.totalUnits = records.reduce((s, r) => s + toNumber(r.f[H.quantity]), 0);

  // 聚合：台数（整机数量之和）；有金额列再聚合费用
  const aggRows = records.map((r) => ({ [H.channel]: r.f[H.channel], [H.category]: r.f[H.category], [H.quantity]: r.f[H.quantity], __amt: r.amount != null ? String(r.amount) : '' }));
  const aggregate = aggregateScrap(aggRows, { channel: H.channel, category: H.category, amount: H.quantity });
  const aggregateAmount = hasAmount ? aggregateScrap(aggRows, { channel: H.channel, category: H.category, amount: '__amt' }) : null;
  const summary = buildSummary(aggregate, aggregateAmount);
  const pivot = buildPivot(aggregate);

  return {
    headers, rows, warnings, counts, sources, aggregate, aggregateAmount, amountColumn: hasAmount ? amountColumn : undefined,
    summaryHeaders: summary.headers, summary: summary.rows, pivot, unmatched, templateUsed, startDate,
  };
}

// ── 来源预识别（第 1 步补填供应商 / 流程号用）────────────────────────────────────

export interface ScrapSourceInspection {
  sources: ScrapLedgerSource[];
  warnings: string[];
}

/**
 * 只解析、不出台账：每份文件各自 try/catch，认不出供应商 / 流程号、放错框、坏文件都落到该文件的 `error` 或空字段上，
 * 界面据此给补填框 —— 「从浏览器下载记录导入」的文件根本不在流程号目录里，流程号必然认不出，没有这一步就只能留空。
 * supplierByFile / processNoByFile 与 buildScrapLedger 同语义（传了优先，空回落推断）。
 */
export function inspectScrapSources(input: Pick<ScrapLedgerBuildInput, 'oemFiles' | 'barcodeFiles' | 'supplierByFile' | 'processNoByFile'>): ScrapSourceInspection {
  const sources: ScrapLedgerSource[] = [];
  const warnings: string[] = [];
  const msg = (e: unknown): string => (e as Error)?.message || String(e);
  for (const p of (input.oemFiles || []).filter(Boolean)) {
    const supplier = (input.supplierByFile?.[p] || '').trim() || inferSupplier(p);
    const processNo = (input.processNoByFile?.[p] || '').trim() || inferProcessNo(p);
    try {
      const parsed = parseOemAppraisal(p, { supplier, processNo });
      warnings.push(...parsed.warnings);
      sources.push({ kind: 'oem', path: p, fileName: parsed.fileName, sheets: parsed.sheetsUsed, processNo: parsed.processNo, supplier: parsed.supplier, units: parsed.units.length, kept: parsed.units.filter((u) => oemUnitKept(u) === 'kept').length });
    } catch (e) {
      sources.push({ kind: 'oem', path: p, fileName: basename(p), sheets: [], processNo, supplier, units: 0, kept: 0, error: msg(e) });
    }
  }
  for (const p of (input.barcodeFiles || []).filter(Boolean)) {
    const processNo = (input.processNoByFile?.[p] || '').trim() || inferProcessNo(p);
    try {
      const parsed = parseScrapBarcodes(p, { processNo });
      warnings.push(...parsed.warnings);
      sources.push({ kind: 'barcode', path: p, fileName: parsed.fileName, sheets: [parsed.sheetName], processNo: parsed.processNo, units: parsed.units.length, kept: parsed.units.length });
    } catch (e) {
      sources.push({ kind: 'barcode', path: p, fileName: basename(p), sheets: [], processNo, units: 0, kept: 0, error: msg(e) });
    }
  }
  return { sources, warnings };
}

// ── 写出 ──────────────────────────────────────────────────────────────────────

/** 输出文件名戳：同一天重跑不覆盖（带时分），Windows 上旧文件还开着也不会撞 EBUSY */
export function scrapOutputStamp(d: Date = new Date()): string {
  return `${ymd(d)}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 写台账失败 → 能照做的话：文件被 Excel/WPS 占着（Windows EBUSY / EPERM）就说「先关掉」，其它保留真因 */
export function describeLedgerWriteError(e: unknown, outPath: string): string {
  const err = e as NodeJS.ErrnoException | undefined;
  const code = String(err?.code || '');
  const text = String(err?.message || e || '');
  // 不用 path.basename：mac 上跑 Windows 路径（反斜杠）会把整条路径当文件名带进提示
  const file = outPath.split(/[\\/]/).pop() || outPath;
  if (/^(EBUSY|EPERM|EACCES)$/.test(code) || /resource busy|locked|being used by another process|operation not permitted/i.test(text)) {
    return i18nT('写入「{file}」失败：文件可能正被 Excel/WPS 打开着，请先关闭已打开的台账文件再重试', { file });
  }
  return i18nT('写入「{file}」失败：{msg}', { file, msg: text || i18nT('未知错误') });
}

const NUMERIC_FIELDS = new Set([H.quantity]);
const DATE_FIELDS = new Set([H.startDate, H.returnDate]);
/** 工单编码：纯数字且无前导零才转数值（有前导零转了会丢位；带字母的工单原样文本） */
const WORK_ORDER_NUMERIC_RE = /^[1-9]\d{0,14}$/;
const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * 台账格的 Excel 类型要跟客户模板一致（2026-09-07 对模板示例行逐格核）：
 * 模板里「工单编码」是数值 1300013837、「流程发起日期 / 退货时间」是真日期格；我们原来全写文本，
 * 客户在 Excel 里按工单 VLOOKUP / 按日期筛选都对不上，看起来就是「数据有差异」。
 * 条形码 13 位在模板里就是文本，保持文本（转数值会丢精度 / 变科学计数）。
 */
export function ledgerCell(field: string, header: string, v: string): string | number | Date | null {
  // 空值写成真空格（模板的空格是空的，不是 "" 文本格：COUNTA / ISBLANK 结果不一样）
  if (v === '') return null;
  if (header === AMOUNT_HEADER || NUMERIC_FIELDS.has(field)) return toNumber(v);
  if (field === H.workOrder && WORK_ORDER_NUMERIC_RE.test(v)) return Number(v);
  if (DATE_FIELDS.has(field)) {
    const m = v.match(YMD_RE);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return v;
}

function ledgerSheet(result: ScrapLedgerBuildResult): OutSheet {
  // 自定义模板列名可能不是默认字段名（「工单号」），按同一套映射找回字段再定类型
  const fieldOf = new Map(result.headers.map((h) => [h, mapTemplateHeader(h)]));
  return {
    name: i18nT('报废台账'),
    headers: result.headers,
    rows: result.rows.map((r) => result.headers.map((h) => ledgerCell(fieldOf.get(h) || '', h, r[h] ?? ''))),
  };
}

export function summarySheets(result: ScrapLedgerBuildResult): OutSheet[] {
  return [
    { name: i18nT('各渠道各品类汇总'), headers: result.summaryHeaders, rows: result.summary },
    { name: i18nT('渠道×品类透视'), headers: result.pivot.headers, rows: result.pivot.rows },
  ];
}

/** 台账工作簿：报废台账 + 各渠道各品类汇总 + 透视 + 未匹配条码 */
export function writeScrapLedgerWorkbook(outPath: string, result: ScrapLedgerBuildResult): void {
  writeWorkbook(outPath, [
    ledgerSheet(result),
    ...summarySheets(result),
    {
      name: i18nT('未匹配条码'),
      headers: [H.barcode, H.description, i18nT('来源文件'), H.processNo],
      rows: result.unmatched.map((u) => [u.barcode, u.description, u.source, u.processNo]),
    },
  ]);
}

/** 单独的《各渠道各品类报废费用汇总表》 */
export function writeScrapSummaryWorkbook(outPath: string, result: ScrapLedgerBuildResult): void {
  writeWorkbook(outPath, summarySheets(result));
}
