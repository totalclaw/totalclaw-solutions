/** 银行流水 → BankRow（收入 / 支出两列，或单列金额 + 收支方向；批次 2 加 MT940 / CAMT.053） */
import { i18nKey } from '@totalclaw/i18n';
import type { FauIssue } from '@totalclaw/ipc-contracts';
import type { SheetTable } from '../../serviceSettlement/excel';
import type { BankRow } from '../types';
import { HEADER_OFFSET, get, issue, toCents, toIsoDate, type ParseResult } from './common';

export function parseBank(t: SheetTable, mp: Record<string, string>, accountLabel: string): ParseResult<'bank'> {
  const rows: BankRow[] = [];
  const badDate: number[] = [];
  const noAmount: number[] = [];
  const outWords = /^(借|支|支出|付|d|dr|debit|out|مدين|سحب)$/i;
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    let amountIn = toCents(get(r, mp, 'amountIn'));
    let amountOut = toCents(get(r, mp, 'amountOut'));
    if (!mp.amountIn && !mp.amountOut && mp.amount) {
      const a = toCents(get(r, mp, 'amount'));
      const dir = get(r, mp, 'direction');
      if (dir ? outWords.test(dir.trim()) : a < 0) amountOut = Math.abs(a); else amountIn = Math.abs(a);
    }
    amountIn = Math.abs(amountIn);
    amountOut = Math.abs(amountOut);
    if (!amountIn && !amountOut) { if (Object.values(r).some((v) => String(v).trim())) noAmount.push(row); return; }
    const rawDate = get(r, mp, 'date');
    const date = toIsoDate(rawDate);
    if (!date) badDate.push(row);
    const bal = get(r, mp, 'balance');
    rows.push({
      row, bankAccount: get(r, mp, 'bankAccount') || accountLabel, date, valueDate: toIsoDate(get(r, mp, 'valueDate')),
      ref: get(r, mp, 'ref'), counterparty: get(r, mp, 'bankCounterparty'), amountIn, amountOut,
      balance: bal ? toCents(bal) : null, summary: get(r, mp, 'bankSummary'),
    });
  });
  const issues: FauIssue[] = [];
  if (noAmount.length) issues.push(issue('warn', 'rows_skipped', i18nKey('{n} 行没有收支金额，已跳过'), { n: noAmount.length }, noAmount));
  if (badDate.length) issues.push(issue('block', 'bad_date', i18nKey('{n} 行日期认不出'), { n: badDate.length }, badDate));
  return { rows, issues };
}
