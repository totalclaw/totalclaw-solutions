/**
 * 批次 6 夹具 → xlsx（流程测试与 E2E 共用）：表头取列识别关键字里的第一个中文写法，金额写主单位（元），
 * 比率写小数，是 / 否写「是 / 否」，枚举写同义词表里的中文写法；行顺序与夹具 row 一致。
 */
import * as XLSX from 'xlsx';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import OURS from '../../intake/columnKeywords.json';
import KW from '../../intake/treasuryKeywords.json';
import { TREASURY_SPECS } from '../../intake/treasury';
import type { TreasuryKind } from '../../engines/treasury/types';
import type { FxRateRow } from '../../types';
import type { OpenItemRow } from '../../subledgerTypes';

const ALL = { ...(OURS as unknown as Record<string, unknown>), ...(KW as unknown as Record<string, unknown>) } as Record<string, string[]>;
const ENUM = (KW as unknown as { _enum: Record<string, Record<string, string[]>> })._enum;
const zh = (words: string[]) => words.find((w) => /\p{Script=Han}/u.test(w)) || words[0];

function write(path: string, headers: string[], rows: (string | number)[][]): string {
  mkdirSync(dirname(path), { recursive: true });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), 'Sheet1');
  XLSX.writeFile(wb, path);
  return path;
}

export function headerOf(key: string): string {
  return zh(ALL[key] || [key]);
}

export function treasuryXlsx<K extends TreasuryKind>(path: string, kind: K, rows: Record<string, unknown>[]): string {
  const cols = TREASURY_SPECS[kind];
  return write(path, cols.map((c) => headerOf(c.key)), rows.map((r) => cols.map((c) => {
    const v = r[c.field || c.key];
    if (v === null || v === undefined || v === '') return '';
    if (c.type === 'cents' || c.type === 'cents?') return Math.round(Number(v)) / 100;
    if (c.type === 'bool' || c.type === 'bool?') return v ? '是' : '否';
    if (c.type.startsWith('enum:')) return zh(ENUM[c.type.slice(5)]?.[String(v)] || [String(v)]);
    return v as string | number;
  })));
}

export function fxRatesXlsx(path: string, rows: FxRateRow[]): string {
  return write(path, ['币种', '汇率', '日期'], rows.map((r) => [r.currency, r.rate, r.date]));
}

/** 应收 / 应付明细（批次 2 的 ar / ap 数据集，表头按 subledgerKeywords.json 能认的写法） */
export function openItemsXlsx(path: string, rows: OpenItemRow[]): string {
  return write(path, ['往来单位', '单据号', '单据日期', '到期日', '原始金额', '未清金额', '币种'],
    rows.map((r) => [r.party, r.docNo, r.docDate, r.dueDate, r.amount / 100, r.open / 100, r.currency]));
}
