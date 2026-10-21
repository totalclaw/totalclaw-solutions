/**
 * MT940 / CAMT.053 对账单解析（批次 2）：标签、D / C / RC / RD、冲正、附言里的对方与摘要、期初 + 发生额 = 期末核对、
 * 未记账条目跳过、命名空间前缀；接入后走与网银 xlsx 同一套列识别与 parseBank，行号是对账单里的位置。
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as ST from '../__fixtures__/accounting/statements';
import { parseMt940, swiftAmountToCents, yymmdd } from './mt940';
import { parseCamt053, parseXmlLite } from './camt053';
import { statementFormat } from './statementFile';
import { inspectFile, readAndParse } from './index';
import type { BankRow } from '../types';

const DIR = mkdtempSync(join(tmpdir(), 'fau-stmt-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));
const file = (name: string, text: string) => { const p = join(DIR, name); writeFileSync(p, text, 'utf8'); return p; };

describe('MT940', () => {
  it('金额逗号小数、YYMMDD', () => {
    expect(swiftAmountToCents('1234,5')).toBe(123450);
    expect(swiftAmountToCents('35,')).toBe(3500);
    expect(yymmdd('260931')).toBe('2026-09-31');
    expect(yymmdd('991231')).toBe('1999-12-31');
  });

  it('两张对账单、带信封；对方与摘要从附言里取；NONREF 用银行参考；RC 冲正按支出', () => {
    const s = parseMt940(ST.MT940);
    expect(s.map((x) => [x.account, x.currency, x.opening?.amount, x.closing?.amount])).toEqual([
      ['6222000011111234', 'CNY', 30000000, 32996500], ['SA0380000000608010167519', 'SAR', 100000, 100000],
    ]);
    expect(s[0].txs.map((t) => [t.bookingDate, t.amount, t.ref, t.counterparty, t.summary])).toEqual([
      ['2026-09-04', -6000000, 'B0904001', '华南物业', '支付8月房租'],
      ['2026-09-15', 9000000, 'B0915088', '客户甲有限公司', '收回货款'],
      ['2026-09-25', -3500, 'FEE0925', '', '支付手续费 手续费'],
    ]);
    expect(s[1].txs.map((t) => [t.amount, t.reversal])).toEqual([[50000, false], [-50000, true]]);
    expect(s[1].txs[0].counterparty).toBe('شركة المثال');
  });

  it('接入：自动认列、余额滚动、行号是 :61: 所在行；期末对不上是阻断项', () => {
    const p = file('stmt.sta', ST.MT940);
    expect(statementFormat(p)).toBe('mt940');
    const ins = inspectFile(p, 'bank');
    expect(ins.missing).toEqual([]);
    expect(ins.sheetNames).toEqual(['MT940']);
    const r = readAndParse(p, 'bank', undefined, ins.mapping);
    const rows = r.rows as BankRow[];
    expect(rows).toHaveLength(5);
    expect(rows[0]).toMatchObject({ row: 6, bankAccount: '6222000011111234', date: '2026-09-04', amountOut: 6000000, balance: 24000000, ref: 'B0904001' });
    expect(rows[2]).toMatchObject({ row: 10, amountOut: 3500, balance: 32996500 });
    expect(r.issues).toEqual([]);
    const bad = readAndParse(file('bad.sta', ST.MT940_BROKEN), 'bank', undefined, ins.mapping);
    expect(bad.issues.find((i) => i.code === 'statement_balance')).toMatchObject({ level: 'block' });
  });

  it('xlsx / csv 不当成对账单', () => {
    expect(statementFormat(file('a.csv', 'a,b\n1,2'))).toBeNull();
    expect(statementFormat(file('notes.txt', 'hello'))).toBeNull();
  });
});

describe('CAMT.053', () => {
  it('小 XML 解析器：命名空间前缀、属性、实体、CDATA、注释', () => {
    const doc = parseXmlLite('<?xml version="1.0"?><a:R xmlns:a="x"><!-- c --><a:B k="1">x &amp; y</a:B><a:C><![CDATA[<z>]]></a:C><a:D/></a:R>');
    const r = doc.children[0];
    expect(r.name).toBe('R');
    expect(r.children.map((c) => [c.name, c.text, c.attrs.k])).toEqual([['B', 'x & y', '1'], ['C', '<z>', undefined], ['D', '', undefined]]);
  });

  it('期初 / 期末、收付方向、冲正、未记账跳过、对方与摘要', () => {
    for (const xml of [ST.CAMT053, ST.CAMT053_PREFIXED]) {
      const [s] = parseCamt053(xml);
      expect(s).toMatchObject({ account: 'SA0380000000608010167519', currency: 'SAR', statementNo: '9', skipped: 1, opening: { amount: 1000000 }, closing: { amount: 1235050 } });
      expect(s.txs.map((t) => [t.bookingDate, t.amount, t.ref, t.counterparty, t.summary])).toEqual([
        ['2026-09-03', 300000, 'BR-1', 'شركة الأمل', 'فاتورة 1001'],
        ['2026-09-10', -14950, 'BR-2', '', 'Bank charges & fees'],
        ['2026-09-12', -50000, 'BR-3', '', 'Reversal <1> & more'],
      ]);
    }
  });

  it('接入：自动认列、未记账条目提醒、行号是第 N 条分录', () => {
    const p = file('camt.xml', ST.CAMT053);
    expect(statementFormat(p)).toBe('camt053');
    const ins = inspectFile(p, 'bank');
    expect(ins.missing).toEqual([]);
    const r = readAndParse(p, 'bank', undefined, ins.mapping);
    expect((r.rows as BankRow[]).map((x) => [x.row, x.amountIn, x.amountOut, x.balance])).toEqual([[1, 300000, 0, 1300000], [2, 0, 14950, 1285050], [3, 0, 50000, 1235050]]);
    expect(r.issues.map((i) => [i.code, i.level])).toEqual([['statement_pending', 'warn']]);
  });
});
