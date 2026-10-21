/**
 * 批次 2 产出物三语检查（第 13.5 节第 7 条）：A3–A8 每类产出在 zh / en / ar 各生成一次：
 *   第一行草稿警示；表头与 sheet 名是 tIn 对应语言，ar / en 的固定文案里没有汉字（用户数据列除外）；
 *   阿语 xlsx 有 RTL、docx 有 bidi；分录导入草稿的列与 A1 一致，系统生成的标准科目名按输出语言翻译；Checks 是 TRUE / FALSE。
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';
import { tIn } from '@totalclaw/i18n';
import type { FauLocale } from '@totalclaw/ipc-contracts';
import * as FX from '../__fixtures__/accounting/subledgers';
import { parse } from '../__fixtures__/accounting/parse';
import { thresholdsFor } from '../thresholds';
import { arAging } from '../engines/accounting/ar/engine';
import { apAnalysis } from '../engines/accounting/ap/engine';
import { expenseReview } from '../engines/accounting/expense/engine';
import { fixedAssetsReview } from '../engines/accounting/fixedAssets/engine';
import { payrollReview } from '../engines/accounting/payroll/engine';
import { intercompanyReview } from '../engines/accounting/intercompany/engine';
import { writeArOutputs } from './ar';
import { writeApOutputs } from './ap';
import { writeExpenseOutputs } from './expense';
import { writeFixedAssetOutputs } from './fixedAssets';
import { writePayrollOutputs } from './payroll';
import { writeIntercompanyOutputs } from './intercompany';
import { JE_COLUMNS, type OutputCtx } from './close';
import { OUT } from './common';

const DIR = mkdtempSync(join(tmpdir(), 'fau-out2-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));
const HAN = /[一-鿿]/;
const P = (k: string, t: FX.RawTable) => parse(k as never, t).rows;

const ar = arAging({ asOf: FX.AS_OF, items: P('ar', FX.AR), receipts: P('receipt', FX.RECEIPTS), customers: P('customer', FX.CUSTOMERS), priorOverdueRate: null, th: thresholdsFor('ar'), credit: true });
const ap = apAnalysis({
  asOf: FX.AS_OF, items: P('ap', FX.AP), po: P('po', FX.PO), grn: P('grn', FX.GRN), invoices: P('invoice', FX.INVOICES), suppliers: P('supplier', FX.SUPPLIERS),
  funds: P('funds', FX.FUNDS), history: [], th: thresholdsFor('ap'), match: true, plan: true, review: true,
});
const exp = expenseReview({ asOf: FX.AS_OF, lines: P('expense_claim', FX.CLAIMS), company: { name: '泰途测试集团', taxId: '' }, th: thresholdsFor('expense'), anomalyOnly: false });
const fa = fixedAssetsReview({ period: FX.PERIOD, register: P('fa_register', FX.FA_REGISTER), movements: P('fa_movement', FX.FA_MOVEMENTS), tb: null, cnCodes: true, th: thresholdsFor('fixed-assets') });
const prCn = payrollReview({ regime: 'cn', period: FX.PERIOD, rows: P('payroll', FX.PAYROLL_CN), prior: P('payroll', FX.PAYROLL_CN_PRIOR), cnCodes: true, th: thresholdsFor('payroll') });
const prSa = payrollReview({ regime: 'sa', period: FX.PERIOD, rows: P('payroll', FX.PAYROLL_SA), prior: null, cnCodes: false, th: thresholdsFor('payroll') });
const ic = intercompanyReview({ period: FX.PERIOD, rows: P('intercompany', FX.IC), guarantees: P('guarantee', FX.GUARANTEES), cnCodes: true, th: thresholdsFor('intercompany') });

const ctx = (locale: FauLocale, code: string, name: string): OutputCtx => ({
  locale, dir: join(DIR, locale, code), companyName: '测试集团', projectName: '2026-09 月结', period: FX.PERIOD,
  moduleCode: code, moduleName: name, modeName: '全面：账龄、坏账、催款与信用', standardLabel: '企业会计准则', model: '',
});
const book = (p: string) => XLSX.read(readFileSync(p), { type: 'buffer' });
const rowsOf = (wb: XLSX.WorkBook, i: number) => XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[i]], { header: 1, defval: '' });

/** 通用断言：草稿警示、RTL、sheet 名与表头语言、Checks 是布尔 */
function checkWorkbook(path: string, locale: FauLocale): XLSX.WorkBook {
  const wb = book(path);
  expect(!!(wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL).toBe(locale === 'ar');
  for (let s = 0; s < wb.SheetNames.length; s += 1) expect(rowsOf(wb, s)[0]?.[0], wb.SheetNames[s]).toBe(tIn(locale, OUT.draft));
  if (locale !== 'zh-CN') {
    for (const name of wb.SheetNames) expect(HAN.test(name), name).toBe(false);
    for (let s = 1; s < wb.SheetNames.length; s += 1) {
      const r = rowsOf(wb, s);
      expect(HAN.test(`${r[0]?.join('')}${r[1]?.join('')}`), `${path} · ${wb.SheetNames[s]}`).toBe(false);
    }
  }
  const checks = rowsOf(wb, wb.SheetNames.indexOf('Checks')).slice(2);
  expect(checks.length).toBeGreaterThan(0);
  for (const c of checks) expect(typeof c[1]).toBe('boolean');
  return wb;
}
function checkDocx(path: string, locale: FauLocale): void {
  const zip = new AdmZip(path);
  expect(zip.readAsText('word/document.xml').includes('<w:bidi/>')).toBe(locale === 'ar');
  const header = zip.readAsText('word/header1.xml');
  expect(header).toContain(tIn(locale, OUT.notOpinion).replace(/&/g, '&amp;'));
  if (locale !== 'zh-CN') expect(HAN.test(header)).toBe(false);
}
function checkJe(path: string | null, locale: FauLocale): void {
  expect(path).toBeTruthy();
  const rows = rowsOf(book(path!), 0);
  expect(rows[0]).toEqual(JE_COLUMNS.map((k) => tIn(locale, k)));
  // 系统生成的标准科目名（第 6 列）按输出语言翻译
  if (locale !== 'zh-CN') for (const r of rows.slice(1)) expect(HAN.test(String(r[5])), String(r[5])).toBe(false);
}

describe.each(['zh-CN', 'en-US', 'ar'] as FauLocale[])('批次 2 产出物 · %s', (locale) => {
  it('A3 账龄表 + 催款函与信用评估', () => {
    const out = writeArOutputs(ctx(locale, 'A3', '应收与账龄'), ar, { levels: ['prepare', 'review', 'approve'] });
    const wb = checkWorkbook(out.xlsxPath, locale);
    const checks = rowsOf(wb, wb.SheetNames.indexOf('Checks')).slice(2).map((r) => r[1]);
    expect(checks).toEqual([true, true]);
    expect(rowsOf(wb, 1)[2 + 7][6]).toBe(45172.84);
    checkDocx(out.docxPath!, locale);
  });

  it('A4 三单匹配与付款计划 + 复核意见', () => {
    const out = writeApOutputs(ctx(locale, 'A4', '应付与三单匹配'), ap, { levels: ['prepare', 'review', 'approve'] });
    const wb = checkWorkbook(out.xlsxPath, locale);
    expect(rowsOf(wb, wb.SheetNames.indexOf('Checks')).slice(2).map((r) => r[1])).toEqual([true, true, true]);
    checkDocx(out.docxPath, locale);
  });

  it('A5 稽核报告 + 异常清单（ZATCA 二维码页里阿语卖方名称原样）', () => {
    const out = writeExpenseOutputs(ctx(locale, 'A5', '费用报销稽核'), exp, { levels: ['prepare', 'review'] });
    const wb = checkWorkbook(out.xlsxPath, locale);
    expect(rowsOf(wb, 4).slice(2).map((r) => r[2])).toEqual(['شركة المثال', 'شركة المثال']);
    checkDocx(out.docxPath, locale);
  });

  it('A6 折旧核对表 + 审核意见 + 处置分录导入草稿', () => {
    const out = writeFixedAssetOutputs(ctx(locale, 'A6', '固定资产'), fa, { levels: ['prepare', 'review', 'approve'] });
    const wb = checkWorkbook(out.xlsxPath, locale);
    expect(rowsOf(wb, wb.SheetNames.indexOf('Checks')).slice(2).map((r) => r[1])).toEqual([true, true]);
    checkDocx(out.docxPath, locale);
    checkJe(out.jePath, locale);
  });

  it('A7 薪资复核表（中国 / 沙特）+ 工资计提分录导入草稿', () => {
    for (const res of [prCn, prSa]) {
      const out = writePayrollOutputs(ctx(locale, 'A7', '薪酬核算'), res, { levels: ['prepare', 'review', 'approve'] });
      const wb = checkWorkbook(out.xlsxPath, locale);
      expect(rowsOf(wb, wb.SheetNames.indexOf('Checks')).slice(2)[0][1]).toBe(true);
      checkJe(out.jePath, locale);
    }
  });

  it('A8 内部往来对账表 + 抵销分录导入草稿', () => {
    const out = writeIntercompanyOutputs(ctx(locale, 'A8', '合并与内部往来'), ic, { levels: ['prepare', 'review', 'approve'] });
    const wb = checkWorkbook(out.xlsxPath, locale);
    expect(rowsOf(wb, wb.SheetNames.indexOf('Checks')).slice(2).map((r) => r[1])).toEqual([true, true]);
    checkJe(out.jePath, locale);
  });
});
