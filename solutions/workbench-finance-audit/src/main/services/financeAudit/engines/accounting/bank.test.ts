import { describe, expect, it } from 'vitest';
import { thresholdsFor } from '../../thresholds';
import * as F from '../../__fixtures__/accounting/bank';
import { bankRecon, isBankAccount, pairBankAccounts } from './recon/bank';
import type { BankRow, JournalRow } from '../../types';

const th = thresholdsFor('recon');

describe('A2 银企对账', () => {
  const res = bankRecon({ bookRows: F.bookRows, bankRows: F.bankRows, tb: F.tb, periodEnd: F.PERIOD_END, th });
  const byAcct = Object.fromEntries(res.map((r) => [r.account, r]));

  it('两个账户按账号后四位自动配对', () => {
    const p = pairBankAccounts(F.bookRows, F.bankRows);
    expect(p.pairs).toEqual([
      { bookAccount: '100201', bankAccount: F.ACCOUNT_A },
      { bookAccount: '100202', bankAccount: F.ACCOUNT_B },
    ]);
    expect(p.unpairedBook).toEqual([]);
    expect(isBankAccount('100201', '')).toBe(true);
    expect(isBankAccount('', 'Bank - HSBC')).toBe(true);
    expect(isBankAccount('1122', '应收账款')).toBe(false);
  });

  it('分类计数与夹具设计完全一致', () => {
    for (const acct of [F.ACCOUNT_A, F.ACCOUNT_B]) expect(byAcct[acct].counts, acct).toEqual(F.expected[acct].counts);
  });

  it('调节后两边余额相等', () => {
    for (const acct of [F.ACCOUNT_A, F.ACCOUNT_B]) {
      const s = byAcct[acct].statement;
      expect(s.bookBalance).toBe(F.expected[acct].bookBalance);
      expect(s.bankBalance).toBe(F.expected[acct].bankBalance);
      expect(s.adjustedBook).toBe(F.expected[acct].adjusted);
      expect(s.adjustedBank).toBe(F.expected[acct].adjusted);
      expect(s.balanced).toBe(true);
    }
    expect(byAcct[F.ACCOUNT_B].statement.amountDiffAdj).toBe(-10000);
  });

  it('四轮匹配各有落点：单号 / 金额 + 日期 / 金额唯一 / 一对二', () => {
    const passes = res.flatMap((r) => r.items.filter((i) => i.cls === 'matched').map((i) => [i.pass, i.bookRows.length, i.bankRows.length]));
    expect(passes).toEqual(expect.arrayContaining([[1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 2, 1]]));
    const diff = byAcct[F.ACCOUNT_B].items.find((i) => i.cls === 'amount_diff')!;
    expect(diff.pass).toBe(1);
    expect([diff.bookAmount, diff.bankAmount]).toEqual([-1200000, -1210000]);
  });

  it('手续费是 fee 不升级；1500 元不明扣款触发「不明扣款 > 1000」升级', () => {
    const a = byAcct[F.ACCOUNT_A];
    const fee = a.items.find((i) => i.bankAmount === -3500)!;
    expect(fee.cls).toBe('bank_out_book_not');
    expect(fee.cause).toBe('fee');
    expect(fee.escalate).toBeUndefined();
    const unknown = a.items.find((i) => i.bankAmount === -150000)!;
    expect(unknown.cause).toBe('unknown_deduction');
    expect(unknown.escalate?.key).toContain('不明扣款');
    expect(a.escalations).toHaveLength(F.expected[F.ACCOUNT_A].escalations);
    expect(byAcct[F.ACCOUNT_B].escalations).toHaveLength(F.expected[F.ACCOUNT_B].escalations);
    const outstanding = a.items.find((i) => i.cls === 'book_out_bank_not')!;
    expect(outstanding.ageDays).toBe(1);
  });

  it('不给余额表时按流水推期初、两边一致，仍能调平', () => {
    const r = bankRecon({ bookRows: F.bookRows, bankRows: F.bankRows, tb: null, periodEnd: F.PERIOD_END, th });
    expect(r.every((x) => x.statement.balanced)).toBe(true);
  });

  it('企业已付银行未付超过 10 个工作日升级；连续 3 个月同方向未达升级；差异 > 5000 且不明升级', () => {
    const book: JournalRow[] = [{ ...F.bookRows[2], row: 50, date: '2026-09-01', credit: 800000 }];
    const bank: BankRow[] = [{ ...F.bankRows[3], row: 51, amountOut: 900000, balance: null }];
    const r = bankRecon({
      bookRows: book, bankRows: bank, tb: null, periodEnd: F.PERIOD_END, th,
      history: [
        { account: F.ACCOUNT_A, period: '2026-08', direction: 'book_out_bank_not' },
        { account: '100201', period: '2026-07', direction: 'book_out_bank_not' },
      ],
    })[0];
    const out = r.items.find((i) => i.cls === 'book_out_bank_not')!;
    expect(out.ageDays).toBe(21);
    expect(out.escalate?.key).toContain('工作日');
    const ded = r.items.find((i) => i.cls === 'bank_out_book_not')!;
    expect(ded.escalate?.key).toContain('不明扣款');
    expect(r.escalations.some((e) => e.key.includes('连续'))).toBe(true);
  });

  it('金额为 0 / 同一行既收又付的行归「无法匹配」', () => {
    const bank: BankRow[] = [...F.bankRows.filter((x) => x.bankAccount === F.ACCOUNT_B), { ...F.bankRows[5], row: 60, amountIn: 100, amountOut: 100 }];
    const r = bankRecon({ bookRows: F.bookRows.filter((x) => x.accountCode === '100202'), bankRows: bank, tb: null, periodEnd: F.PERIOD_END, th })[0];
    expect(r.counts.unmatched).toBe(1);
  });
});
