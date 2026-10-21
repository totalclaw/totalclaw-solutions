/**
 * 税务组数据集（批次 4）：中 / 英 / 阿三语表头认列、枚举列规整（短缩写只认整词）、税率写法、行号保留、
 * 必需的枚举列认不出 → 阻断并带行号；个税明细沿用财务智能体的表头关键字。
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import { inspectFile, readAndParse } from './index';
import { normEnum, toRate, type VatLineRow, type WhtRow } from './tax';

const DIR = mkdtempSync(join(tmpdir(), 'fau-tax-intake-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));
function xlsx(name: string, aoa: unknown[][]): string {
  const p = join(DIR, name);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'S');
  XLSX.writeFile(wb, p);
  return p;
}

describe('枚举与税率规整', () => {
  it('三语写法与缩写', () => {
    expect(['零税率', 'Zero rated', 'Z', 'نسبة صفرية'].map((v) => normEnum('vatCategory', v))).toEqual(['zero', 'zero', 'zero', 'zero']);
    expect(['反向征收', 'Reverse charge', 'احتساب عكسي'].map((v) => normEnum('vatCategory', v))).toEqual(['reverse_charge', 'reverse_charge', 'reverse_charge']);
    // 单字母缩写只认整词：「Services」里的 s 不能被当成标准税率
    expect(normEnum('vatCategory', 'Services')).toBe('');
    expect(normEnum('vatCategory', 'S')).toBe('standard');
    expect(normEnum('invoiceType', '数电专票')).toBe('vat_special');
    expect(normEnum('whtType', 'Management fee')).toBe('management_fee');
    expect([toRate('15%'), toRate('15'), toRate('0.15')]).toEqual([0.15, 0.15, 0.15]);
  });
});

describe('销项与进项明细', () => {
  it('英文表头自动认列，金额转分、行号保留；方向认不出的行阻断', () => {
    const p = xlsx('vat-en.xlsx', [
      ['Direction', 'Invoice Date', 'Invoice No', 'Customer / Supplier', 'VAT Number', 'Net Amount', 'VAT Amount', 'VAT Rate', 'VAT Category'],
      ['Sales', '2026-09-01', 'S-1', 'Acme', '300000000000003', '1,000.00', '150.00', '15%', 'Standard'],
      ['Purchase', '2026-09-02', 'P-1', 'Vendor', '', '200', '30', '15', 'standard rated'],
      ['???', '2026-09-03', 'X-1', '', '', '10', '0', '', 'Exempt'],
    ]);
    const ins = inspectFile(p, 'vat_lines');
    expect(ins.missing).toEqual([]);
    expect(ins.mapping).toMatchObject({ vatDirection: 'Direction', vatDate: 'Invoice Date', vatNet: 'Net Amount', vatAmount: 'VAT Amount', vatCategory: 'VAT Category' });
    const r = readAndParse(p, 'vat_lines', undefined, ins.mapping);
    const rows = r.rows as VatLineRow[];
    expect(rows[0]).toMatchObject({ row: 2, direction: 'sales', net: 100_000, vat: 15_000, rate: 0.15, category: 'standard', status: 'normal' });
    expect(rows[1]).toMatchObject({ row: 3, direction: 'purchase', net: 20_000, vat: 3_000, rate: 0.15 });
    expect(r.issues).toEqual([expect.objectContaining({ level: 'block', code: 'bad_vatDirection', rows: [4] })]);
  });
});

describe('其它税务数据集', () => {
  it('预提税付款：阿语表头', () => {
    const p = xlsx('wht-ar.xlsx', [
      ['تاريخ الدفع', 'المستفيد', 'الدولة', 'نوع الدفعة', 'المبلغ المدفوع'],
      ['2026-09-05', 'Head Office', 'GB', 'أتعاب الإدارة', '٥٠٠٠٠'],
    ]);
    const ins = inspectFile(p, 'wht_payments');
    expect(ins.missing).toEqual([]);
    const rows = readAndParse(p, 'wht_payments', undefined, ins.mapping).rows as WhtRow[];
    expect(rows[0]).toMatchObject({ row: 2, payee: 'Head Office', paymentType: 'management_fee', amount: 5_000_000 });
  });

  it('工资个税明细沿用财务智能体的表头关键字', () => {
    const p = xlsx('iit.xlsx', [['姓名', '本月应发工资', '本月三险一金'], ['张三', '20000', '2000']]);
    const ins = inspectFile(p, 'iit_rows');
    expect(ins.missing).toEqual([]);
    expect(ins.mapping.salary).toBeTruthy();
  });
});
