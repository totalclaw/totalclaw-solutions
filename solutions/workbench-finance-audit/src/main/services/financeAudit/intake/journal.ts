/** 序时账 → JournalRow（凭证只在首行写日期 / 凭证号的导出沿用上一行） */
import { i18nKey } from '@totalclaw/i18n';
import type { FauIssue } from '@totalclaw/ipc-contracts';
import type { SheetTable } from '../../serviceSettlement/excel';
import type { JournalRow } from '../types';
import { HEADER_OFFSET, get, issue, splitAccount, toCents, toIsoDate, type ParseResult } from './common';

export function parseJournal(t: SheetTable, mp: Record<string, string>): ParseResult<'journal'> {
  const rows: JournalRow[] = [];
  const skipped: number[] = [];
  const badDate: number[] = [];
  let lastDate = '';
  let lastNo = '';
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const acct = splitAccount(get(r, mp, 'accountCode'), get(r, mp, 'accountName'));
    const debit = toCents(get(r, mp, 'debit'));
    const credit = toCents(get(r, mp, 'credit'));
    if (!acct.name || (!debit && !credit)) { if (Object.values(r).some((v) => String(v).trim())) skipped.push(row); return; }
    const rawDate = get(r, mp, 'date');
    let date = toIsoDate(rawDate);
    if (!date && rawDate) badDate.push(row);
    // 凭证只在第一行写日期 / 凭证号的导出格式：沿用上一行
    if (!date) date = lastDate;
    const voucherNo = get(r, mp, 'voucherNo') || lastNo;
    lastDate = date;
    lastNo = voucherNo;
    rows.push({
      row, date, voucherNo, lineNo: Number(get(r, mp, 'lineNo')) || 0,
      accountCode: acct.code, accountName: acct.name, summary: get(r, mp, 'summary'),
      debit, credit, currency: get(r, mp, 'currency'), fxAmount: mp.fxAmount ? toCents(get(r, mp, 'fxAmount')) : null,
      counterparty: get(r, mp, 'counterparty'), dept: get(r, mp, 'dept'), project: get(r, mp, 'project'),
      businessDate: toIsoDate(get(r, mp, 'businessDate')), source: get(r, mp, 'source'),
    });
  });
  const issues: FauIssue[] = [];
  if (skipped.length) issues.push(issue('warn', 'rows_skipped', i18nKey('{n} 行没有科目或金额，已跳过'), { n: skipped.length }, skipped));
  if (badDate.length) issues.push(issue('block', 'bad_date', i18nKey('{n} 行日期认不出'), { n: badDate.length }, badDate));
  return { rows, issues };
}
