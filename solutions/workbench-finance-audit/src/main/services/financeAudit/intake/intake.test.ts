/**
 * 数据接入（第 7.1 节）：中 / 英 / 阿三语表头自动认列、阿拉伯-印度数字、单列金额 + 收支方向、
 * 金额转分、日期转 ISO、认不出的行带行号报出来；科目映射（中国科目表自动完成，IFRS 要人确认）。
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import { inspectFile, readAndParse } from './index';
import { detectRoles } from './columns';
import { mapAccounts } from '../accountMap';
import * as closeFx from '../__fixtures__/accounting/close';
import type { BankRow, JournalRow, TbRow } from '../types';

const DIR = mkdtempSync(join(tmpdir(), 'fau-intake-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));
function xlsx(name: string, aoa: unknown[][]): string {
  const p = join(DIR, name);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'S');
  XLSX.writeFile(wb, p);
  return p;
}

describe('列识别', () => {
  it('精确匹配优先：「日期」不会抢走「业务日期」', () => {
    const m = detectRoles(['业务日期', '凭证日期', '科目名称', '借方', '贷方'], ['date', 'businessDate', 'accountName', 'debit', 'credit']);
    expect(m.date).toBe('凭证日期');
    expect(m.businessDate).toBe('业务日期');
  });
  it('英文 / 阿语表头', () => {
    expect(detectRoles(['Posting Date', 'Account', 'Description', 'Debit', 'Credit'], ['date', 'accountName', 'summary', 'debit', 'credit']))
      .toEqual({ date: 'Posting Date', accountName: 'Account', summary: 'Description', debit: 'Debit', credit: 'Credit' });
    const ar = detectRoles(['التاريخ', 'البيان', 'مدين', 'دائن', 'الرصيد'], ['date', 'bankSummary', 'amountIn', 'amountOut', 'balance']);
    expect(ar).toEqual({ date: 'التاريخ', bankSummary: 'البيان', amountIn: 'دائن', amountOut: 'مدين', balance: 'الرصيد' });
  });
});

describe('解析', () => {
  it('沙特银行流水（阿语表头 + 阿拉伯-印度数字）：金额转分、日期转 ISO', () => {
    const p = xlsx('sa-bank.xlsx', [
      ['التاريخ', 'رقم المرجع', 'البيان', 'مدين', 'دائن', 'الرصيد'],
      ['٢٠٢٦-٠٩-٠٣', 'R1', 'تحويل', '١٬٢٥٠٫٥٠', '', '٨٧٥٠'],
      ['2026-09-05', 'R2', 'إيداع', '', '2000', '10750'],
    ]);
    const ins = inspectFile(p, 'bank');
    expect(ins.missing).toEqual([]);
    const r = readAndParse(p, 'bank', undefined, ins.mapping, { accountLabel: 'SNB-001' });
    const rows = r.rows as BankRow[];
    expect(rows[0]).toMatchObject({ row: 2, date: '2026-09-03', amountOut: 125050, amountIn: 0, balance: 875000, bankAccount: 'SNB-001' });
    expect(rows[1]).toMatchObject({ row: 3, amountIn: 200000 });
  });

  it('单列金额 + 收支方向', () => {
    const p = xlsx('single.xlsx', [['交易日期', '交易金额', '收支方向', '摘要'], ['2026-09-01', '100', '支', 'a'], ['2026-09-02', '50', '收', 'b'], ['2026-09-03', '-20', '', 'c']]);
    const ins = inspectFile(p, 'bank');
    const rows = readAndParse(p, 'bank', undefined, ins.mapping).rows as BankRow[];
    expect(rows.map((r) => [r.amountIn, r.amountOut])).toEqual([[0, 10000], [5000, 0], [0, 2000]]);
  });

  it('序时账：凭证号与日期只写在首行时沿用；没有科目或金额的行跳过并带行号；日期认不出是阻断项', () => {
    const p = xlsx('j.xlsx', [
      ['日期', '凭证号', '科目', '摘要', '借方金额', '贷方金额'],
      ['2026-09-01', '记-1', '1002 银行存款', 'a', '100', ''],
      ['', '', '6001 主营业务收入', 'a', '', '100'],
      ['2026-09-02', '记-2', '', '空科目', '5', ''],
      ['abc', '记-3', '6602 管理费用', 'x', '1', ''],
    ]);
    const ins = inspectFile(p, 'journal');
    const r = readAndParse(p, 'journal', undefined, ins.mapping);
    const rows = r.rows as JournalRow[];
    expect(rows[1]).toMatchObject({ row: 3, date: '2026-09-01', voucherNo: '记-1', accountCode: '6001', accountName: '主营业务收入', credit: 10000 });
    expect(r.issues.find((i) => i.code === 'rows_skipped')?.rows).toEqual([4]);
    expect(r.issues.find((i) => i.code === 'bad_date')).toMatchObject({ level: 'block', rows: [5] });
  });

  it('余额表：合计行不算科目', () => {
    const p = xlsx('tb.xlsx', [['科目编码', '科目名称', '期初借方', '期初贷方', '本期借方', '本期贷方', '期末借方', '期末贷方'], ['1001', '库存现金', 1, 0, 0, 0, 1, 0], ['', '合计', 1, 0, 0, 0, 1, 0]]);
    const rows = readAndParse(p, 'tb', undefined, inspectFile(p, 'tb').mapping).rows as TbRow[];
    expect(rows).toHaveLength(1);
    expect(rows[0].closingDr).toBe(100);
  });
});

describe('科目映射', () => {
  it('中国科目表（企业会计准则编码）自动完成，大类与报表行都有', () => {
    const r = mapAccounts(closeFx.tb, 'CAS');
    expect(r.autoComplete).toBe(true);
    expect(r.entries.find((e) => e.code === '1122')).toMatchObject({ cls: 'asset', line: 'ar' });
    expect(r.entries.find((e) => e.code === '6001')).toMatchObject({ cls: 'revenue' });
    expect(r.entries.find((e) => e.code === '2241')).toMatchObject({ cls: 'liability' });
  });
  it('IFRS 英文科目表：给建议但必须人工确认；人确认过的条目重映射时保留', () => {
    const r = mapAccounts(closeFx.ifrsTb, 'IFRS');
    expect(r.needsReview).toBe(true);
    expect(r.entries.find((e) => e.name === 'Trade receivables')?.cls).toBe('asset');
    expect(r.entries.find((e) => e.name === 'Revenue')?.cls).toBe('revenue');
    const manual = r.entries.map((e) => (e.name === 'Revenue' ? { ...e, cls: 'equity' as const, source: 'manual' as const } : e));
    expect(mapAccounts(closeFx.ifrsTb, 'IFRS', manual).entries.find((e) => e.name === 'Revenue')?.cls).toBe('equity');
  });
});
