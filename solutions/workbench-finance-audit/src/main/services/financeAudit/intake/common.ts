/**
 * 数据接入公共小工具：金额转最小货币单位整数、日期转 ISO、保留原表行号、问题项（带行号）。
 * 金额 / 日期解析只读复用财务智能体 common.ts；阿语数字先规整（verify.ts）。
 */
import type { FauIssue } from '@totalclaw/ipc-contracts';
import { normDate, toAmount } from '../../financeAgent/common';
import { normalizeDigits } from '../verify';
import type { DatasetRowsByKind, ParsedKind } from '../types';

/** 原表行号：表头在第 1 行时，第一条数据是第 2 行（readTable 已丢空行，这里按顺序近似；有行号列时以它为准） */
export const HEADER_OFFSET = 2;

export function toCents(v: unknown): number {
  const s = typeof v === 'string' ? normalizeDigits(v) : v;
  return Math.round(toAmount(s) * 100);
}

export function toNum(v: unknown): number | null {
  const s = normalizeDigits(String(v ?? '')).replace(/[,\s%]/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function toIsoDate(v: unknown): string {
  return normDate(typeof v === 'string' ? normalizeDigits(v) : v);
}

/** 2026-09 / 2026年9月 / 202609 → YYYY-MM */
export function toPeriod(v: unknown): string {
  const s = normalizeDigits(String(v ?? '')).trim();
  const m = s.match(/(\d{4})\s*[-/.年]\s*(\d{1,2})/) || s.match(/^(\d{4})(\d{2})$/);
  return m ? `${m[1]}-${String(Number(m[2])).padStart(2, '0')}` : '';
}

export function get(r: Record<string, string>, mapping: Record<string, string>, role: string): string {
  const h = mapping[role];
  return h ? String(r[h] ?? '').trim() : '';
}

/** 「1002 银行存款」「1002-银行存款」这类编码 + 名称写在一起的拆开 */
export function splitAccount(code: string, name: string): { code: string; name: string } {
  const m = name.match(/^(\d{3,}(?:[.\-]\d+)*)\s*[-_ ]?\s*(.+)$/);
  return { code: code || (m ? m[1] : ''), name: (m ? m[2] : name).trim() };
}

export interface ParseResult<K extends ParsedKind> {
  rows: DatasetRowsByKind[K];
  issues: FauIssue[];
}

/** id 只按 code 定（同一数据集每类问题一条）；跨数据集汇总时由调用方加数据集前缀，签核「已知悉」靠 id 稳定 */
export function issue(level: 'block' | 'warn', code: string, key: string, params: Record<string, string | number>, rows?: number[]): FauIssue {
  return { id: `iss_${code}`, level, code, message: { key, params }, rows: rows?.slice(0, 50) };
}

