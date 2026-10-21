/**
 * 模块三 · 更新报废台账（纯计算）。
 *
 *   1. 数据源：费控系统「物料报废流程」节点里按要求命名的 Excel 附件（下载 / 选择文件夹）；
 *   2. 所有附件合并为一张总数据表（列取并集，附「来源文件」列）；
 *   3. 渠道匹配对照表：以总表「条码」为关键字一对一匹配渠道信息；
 *   4. 按【渠道 + 品类】聚合报废费用，输出《各渠道各品类报废费用汇总表》。
 */
import { toNumber, type SheetTable } from './excel';
import { t as i18nT } from '@totalclaw/i18n';

export const SOURCE_COLUMN = i18nT('来源文件');

export interface MergedTable {
  headers: string[];
  rows: Record<string, string>[];
  /** 每个来源文件贡献的行数 */
  sources: { fileName: string; sheetName: string; rows: number }[];
}

/** 合并多张表：表头按首次出现顺序取并集，每行补「来源文件」 */
export function mergeTables(tables: SheetTable[]): MergedTable {
  const headers: string[] = [];
  const seen = new Set<string>();
  for (const t of tables) {
    for (const h of t.headers) {
      if (!seen.has(h)) { seen.add(h); headers.push(h); }
    }
  }
  if (!seen.has(SOURCE_COLUMN)) headers.push(SOURCE_COLUMN);
  const rows: Record<string, string>[] = [];
  const sources: MergedTable['sources'] = [];
  for (const t of tables) {
    let n = 0;
    for (const r of t.rows) {
      const out: Record<string, string> = {};
      for (const h of headers) out[h] = r[h] ?? '';
      out[SOURCE_COLUMN] = t.sheetName && t.sheetName !== 'Sheet1' ? `${t.fileName} / ${t.sheetName}` : t.fileName;
      rows.push(out);
      n += 1;
    }
    sources.push({ fileName: t.fileName, sheetName: t.sheetName, rows: n });
  }
  return { headers, rows, sources };
}

export interface ChannelMatchInput {
  merged: MergedTable;
  /** 总表里的条码列 */
  barcodeColumn: string;
  lookup: SheetTable;
  /** 对照表里的条码列 / 渠道列；extraColumns = 一并带入总表的其它列（如渠道编码） */
  lookupBarcodeColumn: string;
  lookupChannelColumn: string;
  extraColumns?: string[];
}

export interface ChannelMatchResult {
  headers: string[];
  rows: Record<string, string>[];
  matched: number;
  unmatched: number;
  /** 没匹配上的条码（去重，最多 200 个给界面看） */
  unmatchedBarcodes: string[];
  /** 对照表里重复的条码（一对一要求下属于数据问题） */
  duplicateBarcodes: string[];
  channelColumn: string;
}

const normBarcode = (s: string): string => String(s ?? '').trim().replace(/\.0+$/, '').toUpperCase();

export const MATCH_STATUS_COLUMN = i18nT('匹配状态');
export const CHANNEL_COLUMN = i18nT('渠道');

export function matchChannels(input: ChannelMatchInput): ChannelMatchResult {
  const map = new Map<string, Record<string, string>>();
  const dup = new Set<string>();
  for (const r of input.lookup.rows) {
    const key = normBarcode(r[input.lookupBarcodeColumn]);
    if (!key) continue;
    if (map.has(key)) { dup.add(key); continue; }
    map.set(key, r);
  }
  const channelColumn = CHANNEL_COLUMN;
  const extras = (input.extraColumns || []).filter((c) => c !== input.lookupBarcodeColumn && c !== input.lookupChannelColumn);
  const headers = [...input.merged.headers];
  if (!headers.includes(channelColumn)) headers.push(channelColumn);
  for (const c of extras) if (!headers.includes(c)) headers.push(c);
  if (!headers.includes(MATCH_STATUS_COLUMN)) headers.push(MATCH_STATUS_COLUMN);
  let matched = 0;
  let unmatched = 0;
  const unmatchedSet = new Set<string>();
  const rows = input.merged.rows.map((r) => {
    const out = { ...r };
    const key = normBarcode(r[input.barcodeColumn]);
    const hit = key ? map.get(key) : undefined;
    if (hit) {
      matched += 1;
      out[channelColumn] = hit[input.lookupChannelColumn] ?? '';
      for (const c of extras) out[c] = hit[c] ?? '';
      out[MATCH_STATUS_COLUMN] = i18nT('已匹配');
    } else {
      unmatched += 1;
      out[channelColumn] = out[channelColumn] || '';
      out[MATCH_STATUS_COLUMN] = key ? i18nT('未匹配') : i18nT('条码为空');
      if (key) unmatchedSet.add(key);
    }
    return out;
  });
  return {
    headers, rows, matched, unmatched,
    unmatchedBarcodes: [...unmatchedSet].slice(0, 200),
    duplicateBarcodes: [...dup].slice(0, 200),
    channelColumn,
  };
}

export interface ScrapAggregateRow {
  channel: string;
  category: string;
  count: number;
  amount: number;
}

export interface ScrapAggregateResult {
  rows: ScrapAggregateRow[];
  /** 渠道小计 */
  channelTotals: { channel: string; count: number; amount: number }[];
  total: { count: number; amount: number };
  /** 渠道或品类为空的行数（仍计入「未知」） */
  blankChannelRows: number;
  blankCategoryRows: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function aggregateScrap(
  rows: Record<string, string>[],
  cols: { channel: string; category: string; amount: string },
): ScrapAggregateResult {
  const map = new Map<string, ScrapAggregateRow>();
  let blankChannelRows = 0;
  let blankCategoryRows = 0;
  for (const r of rows) {
    let channel = (r[cols.channel] || '').trim();
    let category = (r[cols.category] || '').trim();
    if (!channel) { blankChannelRows += 1; channel = i18nT('未知渠道'); }
    if (!category) { blankCategoryRows += 1; category = i18nT('未知品类'); }
    const key = `${channel}||${category}`;
    let acc = map.get(key);
    if (!acc) { acc = { channel, category, count: 0, amount: 0 }; map.set(key, acc); }
    acc.count += 1;
    acc.amount = round2(acc.amount + toNumber(r[cols.amount]));
  }
  const out = [...map.values()].sort((a, b) => a.channel.localeCompare(b.channel, 'zh-CN') || b.amount - a.amount);
  const channelMap = new Map<string, { channel: string; count: number; amount: number }>();
  for (const r of out) {
    let c = channelMap.get(r.channel);
    if (!c) { c = { channel: r.channel, count: 0, amount: 0 }; channelMap.set(r.channel, c); }
    c.count += r.count;
    c.amount = round2(c.amount + r.amount);
  }
  const total = out.reduce((t, r) => ({ count: t.count + r.count, amount: round2(t.amount + r.amount) }), { count: 0, amount: 0 });
  return { rows: out, channelTotals: [...channelMap.values()], total, blankChannelRows, blankCategoryRows };
}

export const SCRAP_SUMMARY_HEADERS = [i18nT('渠道'), i18nT('品类'), i18nT('报废条数'), i18nT('报废费用(元)')];

export function scrapSummaryRows(result: ScrapAggregateResult): (string | number)[][] {
  const rows: (string | number)[][] = [];
  for (const c of result.channelTotals) {
    for (const r of result.rows.filter((x) => x.channel === c.channel)) rows.push([r.channel, r.category, r.count, r.amount]);
    rows.push([i18nT('{p0} 小计', { p0: c.channel }), '', c.count, c.amount]);
  }
  rows.push([i18nT('合计'), '', result.total.count, result.total.amount]);
  return rows;
}

/** 渠道 × 品类 透视（第二张 sheet，方便直接看） */
export function scrapPivot(result: ScrapAggregateResult): { headers: string[]; rows: (string | number)[][] } {
  const categories = [...new Set(result.rows.map((r) => r.category))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const headers = [i18nT('渠道'), ...categories.map((c) => i18nT('{c}(元)', { c })), i18nT('合计(元)')];
  const rows = result.channelTotals.map((c) => {
    const line: (string | number)[] = [c.channel];
    for (const cat of categories) {
      const hit = result.rows.find((r) => r.channel === c.channel && r.category === cat);
      line.push(hit ? hit.amount : 0);
    }
    line.push(c.amount);
    return line;
  });
  const totalLine: (string | number)[] = [i18nT('合计')];
  for (const cat of categories) totalLine.push(round2(result.rows.filter((r) => r.category === cat).reduce((s, r) => s + r.amount, 0)));
  totalLine.push(result.total.amount);
  rows.push(totalLine);
  return { headers, rows };
}
