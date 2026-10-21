/**
 * 从财务智能体账套只读导入（第 11 节）：导入的序时账 + 已审核凭证（草稿凭证不算），元 → 分；
 * 财务智能体没用过时返回空、不建目录（不写它的存储）。
 */
import { afterAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('electron', () => ({ app: { getPath: () => tmpdir(), getVersion: () => '0' } }));

import { financeAgentLedgers, readFinanceAgentLedger } from './fromFinanceAgent';

const DIR = mkdtempSync(join(tmpdir(), 'fau-fa-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));

describe('从财务智能体账套导入', () => {
  it('没用过财务智能体：返回空且不建目录', () => {
    const empty = join(DIR, 'none');
    expect(financeAgentLedgers(() => empty)).toEqual([]);
    expect(readFinanceAgentLedger('x', '2026-09', () => empty).journal).toEqual([]);
    expect(existsSync(empty)).toBe(false);
  });

  it('序时账 + 已审核凭证按期间取出，金额转分；余额表按期间取', () => {
    const fa = join(DIR, 'fa');
    mkdirSync(join(fa, 'ledgers'), { recursive: true });
    writeFileSync(join(fa, 'state.json'), JSON.stringify({ ledgers: [{ id: 'L1', name: '甲公司', taxId: '', createdAt: '' }], activeLedgerId: 'L1' }));
    writeFileSync(join(fa, 'ledgers', 'L1.json'), JSON.stringify({
      journal: { fileName: 'j.xlsx', importedAt: '', source: 'excel', rows: [
        { date: '2026-09-01', voucherNo: '记-1', summary: 's', accountCode: '1002', accountName: '银行存款', debit: 12.34, credit: 0 },
        { date: '2026-08-31', voucherNo: '记-0', summary: 's', accountCode: '1002', accountName: '银行存款', debit: 1, credit: 0 },
      ] },
      vouchers: [
        { id: 'v1', no: '记-9', date: '2026-09-30', period: '2026-09', status: 'reviewed', lines: [{ summary: 'a', accountCode: '6602', accountName: '管理费用', debit: 100, credit: 0 }], sourceDocIds: [], basis: '', origin: 'manual', createdAt: '' },
        { id: 'v2', no: '记-10', date: '2026-09-30', period: '2026-09', status: 'draft', lines: [{ summary: 'b', accountCode: '6602', accountName: '管理费用', debit: 5, credit: 0 }], sourceDocIds: [], basis: '', origin: 'manual', createdAt: '' },
      ],
      balances: [{ period: '2026-09', fileName: 'tb.xlsx', importedAt: '', rows: [{ code: '1002', name: '银行存款', openingDebit: 1, openingCredit: 0, debit: 2, credit: 0, closingDebit: 3, closingCredit: 0 }] }],
    }));
    expect(financeAgentLedgers(() => fa)).toEqual([{ id: 'L1', name: '甲公司' }]);
    const got = readFinanceAgentLedger('L1', '2026-09', () => fa);
    expect(got.journal.map((r) => [r.voucherNo, r.debit])).toEqual([['记-1', 1234], ['记-9', 10000]]);
    expect(got.tb?.[0]).toMatchObject({ accountCode: '1002', closingDr: 300 });
  });
});
