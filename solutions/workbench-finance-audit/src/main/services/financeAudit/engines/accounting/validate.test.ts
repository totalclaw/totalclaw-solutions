import { describe, expect, it } from 'vitest';
import { thresholdsFor } from '../../thresholds';
import * as C from '../../__fixtures__/accounting/close';
import * as B from '../../__fixtures__/accounting/bank';
import * as G from '../../__fixtures__/accounting/glsub';
import { closeValidation } from './close/validate';
import { reconValidation } from './recon/validate';
import type { FauAccountMapEntry } from '@totalclaw/ipc-contracts';

const thc = thresholdsFor('close');
const thr = thresholdsFor('recon');

describe('A1 第 ③ 步校验', () => {
  const v = closeValidation({ period: C.PERIOD, journal: C.journal, tb: C.tb, tbPrior: C.tbPrior, accountMap: [], reportBasis: 'cn', th: thc });
  it('夹具没有阻断项；漏导凭证让 6602 / 2241 发生额对不上（提醒，滚动表会列未解释差异）；期后分录提醒', () => {
    expect(v.blockers).toEqual([]);
    const movement = v.warnings.filter((w) => w.code === 'movement_mismatch');
    expect(movement.map((w) => w.message.params?.code).sort()).toEqual(['2241', '6602']);
    const outside = v.warnings.find((w) => w.code === 'journal_outside')!;
    expect(outside.rows).toEqual([25, 26]); // 期后分录记-0101 两行
    expect(v.checks.find((c) => c.id === 'opening')!.ok).toBe(true);
    expect(v.checks.find((c) => c.id === 'journal_balanced')!.ok).toBe(true);
  });
  it('凭证借贷不平是阻断项，写明凭证号与行号', () => {
    const journal = C.journal.map((j) => (j.row === 3 ? { ...j, debit: j.debit + 100 } : j));
    const bad = closeValidation({ period: C.PERIOD, journal, tb: C.tb, tbPrior: C.tbPrior, accountMap: [], reportBasis: 'cn', th: thc });
    const issue = bad.blockers.find((b) => b.code === 'voucher_unbalanced')!;
    expect(issue.message.params?.no).toBe('记-0001');
    expect(issue.rows).toEqual([2, 3]);
    expect(bad.blockers.some((b) => b.code === 'journal_unbalanced')).toBe(true);
  });
  it('期初 ≠ 上期期末是提醒；没有上期余额表也提醒', () => {
    const prior = C.tbPrior.map((r) => (r.accountCode === '2202' ? { ...r, closingCr: r.closingCr + 500 } : r));
    expect(closeValidation({ period: C.PERIOD, journal: C.journal, tb: C.tb, tbPrior: prior, accountMap: [], reportBasis: 'cn', th: thc }).warnings
      .some((w) => w.code === 'opening_mismatch' && w.rows?.[0] === C.tb.find((r) => r.accountCode === '2202')!.row)).toBe(true);
    expect(closeValidation({ period: C.PERIOD, journal: C.journal, tb: C.tb, tbPrior: null, accountMap: [], reportBasis: 'cn', th: thc }).warnings
      .some((w) => w.code === 'no_prior_tb')).toBe(true);
  });
  it('IFRS 口径下科目没映射是阻断项；映射全了就过', () => {
    const v1 = closeValidation({ period: '2026-09', journal: [], tb: C.ifrsTb, tbPrior: null, accountMap: [], reportBasis: 'ifrs', th: thc });
    expect(v1.blockers.some((b) => b.code === 'unmapped')).toBe(true);
    const map: FauAccountMapEntry[] = C.ifrsTb.map((r) => ({ code: r.accountCode, name: r.accountName, cls: 'asset', line: '', source: 'manual' }));
    const v2 = closeValidation({ period: '2026-09', journal: [], tb: C.ifrsTb, tbPrior: null, accountMap: map, reportBasis: 'ifrs', th: thc });
    expect(v2.blockers.some((b) => b.code === 'unmapped')).toBe(false);
    expect(v2.blockers.some((b) => b.code === 'journal_empty')).toBe(true);
  });
});

describe('A2 第 ③ 步校验', () => {
  it('银企对账夹具：无阻断；期初两边一致', () => {
    const v = reconValidation({ mode: 'bank', bookRows: B.bookRows, bankRows: B.bankRows, tb: B.tb, th: thr });
    expect(v.blockers).toEqual([]);
    expect(v.warnings).toEqual([]);
    expect(v.checks.every((c) => c.ok)).toBe(true);
  });
  it('日期认不出、账户配不上是阻断项；期初不一致、没有余额表是提醒', () => {
    const book = B.bookRows.map((r) => (r.row === 2 ? { ...r, date: '9/3' } : r));
    const bank = [...B.bankRows, { ...B.bankRows[0], row: 99, bankAccount: '6200000000009999' }];
    const v = reconValidation({ mode: 'bank', bookRows: book, bankRows: bank, tb: null, th: thr });
    expect(v.blockers.map((b) => b.code).sort()).toEqual(['book_date', 'unpaired']);
    expect(v.warnings.some((w) => w.code === 'no_tb')).toBe(true);
    const tb = B.tb.map((r) => (r.accountCode === '100201' ? { ...r, openingDr: r.openingDr + 100 } : r));
    expect(reconValidation({ mode: 'bank', bookRows: B.bookRows, bankRows: B.bankRows, tb, th: thr }).warnings.some((w) => w.code === 'opening_mismatch')).toBe(true);
  });
  it('总账子账：缺对账键是阻断项；键不规范、比较列只有一边是提醒', () => {
    const v = reconValidation({ mode: 'glsub', gl: G.gl, sub: G.sub, th: thr });
    expect(v.blockers).toEqual([]);
    const gl = [...G.gl, { ...G.gl[0], row: 20, key: '' }, { ...G.gl[0], row: 21, key: 'inv 1' }];
    const sub = G.sub.map((r) => ({ ...r, fxAmount: null }));
    const v2 = reconValidation({ mode: 'glsub', gl, sub, th: thr });
    expect(v2.blockers.map((b) => b.code)).toEqual(['key_empty']);
    expect(v2.warnings.map((w) => w.code).sort()).toEqual(['fx_one_side', 'key_normalized']);
  });
});
