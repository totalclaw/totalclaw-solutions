/**
 * 从财务智能体账套导入（第 11 节）：只读。
 *
 * 通过 FinanceAgentStore 的 data(ledgerId) 取导入的序时账 + 已审核凭证（vouchersToJournal，与财务智能体的
 * journal() 同口径）和最近一次导入的余额表，转成本方案的数据集（元 → 分）。
 * 不写它的存储、不改它的文件：财务智能体从没用过（没有 state.json）时直接返回空，避免 new 出来的 store 建目录。
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { accountPath } from '../../accountScope';
import { FinanceAgentStore } from '../../financeAgent/store';
import { vouchersToJournal } from '../../financeAgent/voucher';
import { periodOf } from '../../financeAgent/common';
import type { JournalRow, TbRow } from '../types';

const cents = (yuan: number) => Math.round((Number(yuan) || 0) * 100);

function hasFinanceAgentData(dirOf: () => string): boolean {
  return existsSync(join(dirOf(), 'state.json'));
}

export function financeAgentLedgers(dirOf: () => string = () => accountPath('finance-agent')): { id: string; name: string }[] {
  if (!hasFinanceAgentData(dirOf)) return [];
  return new FinanceAgentStore(dirOf).root().ledgers.map((l) => ({ id: l.id, name: l.name }));
}

export function readFinanceAgentLedger(
  ledgerId: string, period: string, dirOf: () => string = () => accountPath('finance-agent'),
): { ledgerName: string; journal: JournalRow[]; tb: TbRow[] | null; tbPeriod: string } {
  if (!hasFinanceAgentData(dirOf)) return { ledgerName: '', journal: [], tb: null, tbPeriod: '' };
  const store = new FinanceAgentStore(dirOf);
  const ledger = store.root().ledgers.find((l) => l.id === ledgerId);
  if (!ledger) return { ledgerName: '', journal: [], tb: null, tbPeriod: '' };
  const d = store.data(ledgerId);
  const all = [...(d.journal?.rows || []), ...vouchersToJournal(d.vouchers)];
  const journal: JournalRow[] = all
    .filter((r) => !period || periodOf(r.date) === period)
    .map((r, i) => ({
      row: i + 1, date: r.date, voucherNo: r.voucherNo, lineNo: 0, accountCode: r.accountCode, accountName: r.accountName,
      summary: r.summary, debit: cents(r.debit), credit: cents(r.credit), currency: '', fxAmount: null,
      counterparty: r.counterparty || '', dept: r.dept || '', project: '', businessDate: '', source: 'finance-agent',
    }));
  const bal = d.balances.find((b) => b.period === period) || null;
  const tb: TbRow[] | null = bal
    ? bal.rows.map((r, i) => ({
      row: i + 1, accountCode: r.code, accountName: r.name, level: null,
      openingDr: cents(r.openingDebit), openingCr: cents(r.openingCredit), periodDr: cents(r.debit), periodCr: cents(r.credit),
      closingDr: cents(r.closingDebit), closingCr: cents(r.closingCredit),
    }))
    : null;
  return { ledgerName: ledger.name, journal, tb, tbPeriod: bal?.period || '' };
}
