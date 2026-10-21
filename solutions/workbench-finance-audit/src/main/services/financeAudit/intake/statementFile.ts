/**
 * MT940 / CAMT.053 对账单 → 与网银 xlsx 同形的表（批次 2），之后走同一个 parseBank 与列识别。
 *
 * 表头用列识别关键字里的英文写法，导入时自动认列、不用人对；每行余额按「期初 + 逐笔发生额」滚出来，
 * 期末与对账单期末（:62F: / CLBD）不符就是阻断项（文件不完整或被改过）。
 * 行号：MT940 记 :61: 所在的文件行号，CAMT 记第 N 条 Ntry。
 */
import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauIssue } from '@totalclaw/ipc-contracts';
import type { SheetTable } from '../../serviceSettlement/excel';
import { issue } from './common';
import { parseMt940, type BankStatement } from './mt940';
import { parseCamt053 } from './camt053';

export type StatementFormat = 'mt940' | 'camt053';

/** 列识别（columnKeywords.json）能精确认出的表头 */
export const STATEMENT_HEADERS = {
  bankAccount: 'Account Number', date: 'Date', valueDate: 'Value Date', ref: 'Reference', bankCounterparty: 'Counterparty',
  amountIn: 'Credit Amount', amountOut: 'Debit Amount', balance: 'Balance', bankSummary: 'Description',
} as const;

const EXT = new Set(['.sta', '.mt940', '.940', '.txt', '.xml', '.053', '.camt']);

/** 按扩展名 + 内容特征认格式；xlsx / csv 返回 null */
export function statementFormat(path: string): StatementFormat | null {
  if (!EXT.has(extname(path).toLowerCase())) return null;
  let head = '';
  try { head = readFileSync(path, 'utf8').slice(0, 4000); } catch { return null; }
  if (/<BkToCstmrStmt\b|camt\.053/i.test(head)) return 'camt053';
  if (/(^|\n)\s*(\{4:\s*)?:20:/.test(head) && /:(25|60F|60M|61):/.test(head)) return 'mt940';
  return null;
}

const money = (cents: number) => (cents / 100).toFixed(2);

export interface StatementTable { table: SheetTable; issues: FauIssue[]; lines: number[]; statements: BankStatement[] }

export function readStatementTable(path: string, format: StatementFormat): StatementTable {
  const text = readFileSync(path, 'utf8');
  const statements = format === 'mt940' ? parseMt940(text) : parseCamt053(text);
  const H = STATEMENT_HEADERS;
  const rows: Record<string, string>[] = [];
  const lines: number[] = [];
  const issues: FauIssue[] = [];
  const badBalance: string[] = [];
  const noOpening: string[] = [];
  let skipped = 0;
  statements.forEach((s, i) => {
    let bal = s.opening?.amount ?? 0;
    for (const t of s.txs) {
      bal += t.amount;
      rows.push({
        [H.bankAccount]: s.account, [H.date]: t.bookingDate, [H.valueDate]: t.valueDate, [H.ref]: t.ref, [H.bankCounterparty]: t.counterparty,
        [H.amountIn]: t.amount > 0 ? money(t.amount) : '', [H.amountOut]: t.amount < 0 ? money(-t.amount) : '',
        [H.balance]: s.opening ? money(bal) : '', [H.bankSummary]: t.summary,
      });
      lines.push(t.line);
    }
    const label = `${s.account || '-'} #${s.statementNo || i + 1}`;
    if (!s.opening) noOpening.push(label);
    else if (s.closing && bal !== s.closing.amount) badBalance.push(`${label}: ${money(bal)} ≠ ${money(s.closing.amount)}`);
    skipped += s.skipped;
  });
  if (!statements.length) issues.push(issue('block', 'statement_empty', i18nKey('对账单里没有读到任何账户或交易'), {}));
  if (badBalance.length) issues.push(issue('block', 'statement_balance', i18nKey('对账单期初加发生额不等于期末，文件可能不完整：{p0}'), { p0: badBalance.join('; ') }));
  if (noOpening.length) issues.push(issue('warn', 'statement_no_opening', i18nKey('对账单没有期初余额，无法核对期末：{p0}'), { p0: noOpening.join('; ') }));
  if (skipped) issues.push(issue('warn', 'statement_pending', i18nKey('{n} 条未记账（非 BOOK）的条目已跳过'), { n: skipped }));
  const table: SheetTable = { path, fileName: basename(path), sheetName: format === 'mt940' ? 'MT940' : 'CAMT.053', headers: Object.values(H), rows };
  return { table, issues, lines, statements };
}
