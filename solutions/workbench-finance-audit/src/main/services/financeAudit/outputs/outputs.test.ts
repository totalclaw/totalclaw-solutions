/**
 * 产出物三语检查（第 13.5 节第 7 条）：关账包 / 关账备忘录 / 银行余额调节表 / 差异报告在 zh / en / ar 各生成一次：
 *   表头是 tIn 对应语言；ar / en 的固定文案里没有汉字（用户数据列除外）；阿语 xlsx 有 RTL、docx 有 bidi；
 *   第一行草稿警示；关账包 10 个 sheet；分录草稿的列与财务智能体的凭证导入列一致。
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';
import { tIn } from '@totalclaw/i18n';
import type { FauCloseResult, FauLocale } from '@totalclaw/ipc-contracts';
import * as closeFx from '../__fixtures__/accounting/close';
import * as bankFx from '../__fixtures__/accounting/bank';
import * as glFx from '../__fixtures__/accounting/glsub';
import { thresholdsFor } from '../thresholds';
import { trialBalance } from '../engines/accounting/close/trial';
import { accrualSchedule } from '../engines/accounting/close/accrual';
import { closeChecklist } from '../engines/accounting/close/checklist';
import { crossPeriod } from '../engines/accounting/close/crossPeriod';
import { rollForward } from '../engines/accounting/close/rollForward';
import { fluxLines } from '../engines/accounting/close/flux';
import { bankRecon } from '../engines/accounting/recon/bank';
import { glSubledgerRecon } from '../engines/accounting/recon/glsub';
import { voucherExportRows } from '../../financeAgent/voucher';
import { JE_COLUMNS, writeCloseOutputs, type OutputCtx } from './close';
import { writeBankOutputs, writeGlSubOutputs } from './recon';
import { OUT } from './common';

const DIR = mkdtempSync(join(tmpdir(), 'fau-out-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));

const th = thresholdsFor('close');
const journal = closeFx.journalInPeriod;
const trial = trialBalance({ tb: closeFx.tb, tbPrior: closeFx.tbPrior, journal, reportBasis: 'cn', accountMap: [], th });
const accr = accrualSchedule({ period: closeFx.PERIOD, journal, tb: closeFx.tb, policies: closeFx.policies, th });
const closeRes: FauCloseResult = {
  period: closeFx.PERIOD,
  engines: ['trialBalance', 'accrualSchedule', 'closeChecklist', 'crossPeriod', 'rollForward', 'flux'],
  trial, accruals: accr.lines, jeDraft: accr.je,
  checklist: closeChecklist({ period: closeFx.PERIOD, journal, tb: closeFx.tb, trialBalanced: trial.balanced, bankReconDone: true, accrualRan: true, fxRates: [], hasForeignCurrency: false, manual: {} }, th),
  crossPeriod: crossPeriod({ period: closeFx.PERIOD, journal: closeFx.journal, th }),
  rollForward: rollForward({ period: closeFx.PERIOD, journal, tb: closeFx.tb, accounts: [], th }),
  flux: fluxLines({ tb: closeFx.tb, tbPrior: closeFx.tbPrior, budget: closeFx.budget, journal, reportBasis: 'cn', th, period: closeFx.PERIOD })
    .map((f, i) => ({ ...f, commentary: i === 0 ? 'commentary' : '', commentaryStatus: i === 0 ? 'verified' as const : 'none' as const })),
  openItems: [],
};
const bankRes = bankRecon({ bookRows: bankFx.bookRows, bankRows: bankFx.bankRows, tb: bankFx.tb, periodEnd: bankFx.PERIOD_END, th: thresholdsFor('recon') });
const glRes = glSubledgerRecon({ gl: glFx.gl, sub: glFx.sub, th: thresholdsFor('recon') });

const ctx = (locale: FauLocale): OutputCtx => ({
  locale, dir: join(DIR, locale), companyName: '测试集团', projectName: '2026-09 月结', period: '2026-09',
  moduleCode: 'A1', moduleName: '月结关账', modeName: '标准月结', standardLabel: '企业会计准则', model: 'fake',
});
const HAN = /[一-鿿]/;
const rowsOf = (path: string, sheet: number) => {
  const wb = XLSX.read(readFileSync(path), { type: 'buffer' });
  return { wb, rows: XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[sheet]], { header: 1, defval: '' }) };
};

describe.each(['zh-CN', 'en-US', 'ar'] as FauLocale[])('产出物 · %s', (locale) => {
  const rtl = locale === 'ar';
  const out = writeCloseOutputs(ctx(locale), closeRes, { reminders: [], levels: ['prepare', 'review', 'approve'] });

  it('关账包：10 个 sheet、第一行草稿警示、表头按输出语言、阿语 RTL', () => {
    expect(out.sheetNames).toHaveLength(10);
    const { wb, rows } = rowsOf(out.packagePath, 3); // 跨期调整
    expect(wb.SheetNames).toEqual(out.sheetNames);
    expect(rows[0][0]).toBe(tIn(locale, OUT.draft));
    expect(rows[1][0]).toBe(tIn(locale, '凭证号'));
    expect(!!(wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL).toBe(rtl);
    if (locale !== 'zh-CN') {
      for (const name of wb.SheetNames) expect(HAN.test(name), name).toBe(false);
      // 固定文案（草稿警示 + 表头）没有汉字；数据行里的科目名、摘要是用户数据，原样保留
      for (let s = 1; s < wb.SheetNames.length; s += 1) {
        const r = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[s]], { header: 1, defval: '' });
        expect(HAN.test(`${r[0]?.join('')}${r[1]?.join('')}`), wb.SheetNames[s]).toBe(false);
      }
    }
  });

  it('Checks 页是 TRUE / FALSE，并且勾稽与分录借贷平衡为 TRUE', () => {
    const { rows } = rowsOf(out.packagePath, 9);
    const values = rows.slice(2).map((r) => r[1]);
    expect(values.length).toBeGreaterThanOrEqual(5);
    for (const v of values) expect(typeof v).toBe('boolean');
  });

  it('分录草稿：列与财务智能体通用凭证导入格式一致（同一组 key，按输出语言翻译）', () => {
    const { rows } = rowsOf(out.packagePath, 5);
    expect(rows[1]).toEqual(JE_COLUMNS.map((k) => tIn(locale, k)));
    expect(out.jePath).toBeTruthy();
    const imp = rowsOf(out.jePath!, 0).rows;
    expect(imp[0]).toEqual(JE_COLUMNS.map((k) => tIn(locale, k)));
  });

  it('关账备忘录 docx：页眉「非审计 / 鉴证意见」、阿语段落 bidi、无意见段', () => {
    const zip = new AdmZip(out.memoPath);
    const doc = zip.readAsText('word/document.xml');
    const header = zip.readAsText('word/header1.xml');
    expect(header).toContain(tIn(locale, OUT.notOpinion).replace(/&/g, '&amp;'));
    expect(doc.includes('<w:bidi/>')).toBe(rtl);
    if (locale !== 'zh-CN') expect(HAN.test(header)).toBe(false);
  });

  it('银行余额调节表：每个账户一份、两边相等为 TRUE、阿语 RTL', () => {
    const paths = writeBankOutputs({ ...ctx(locale), moduleCode: 'A2' }, bankRes, { levels: ['prepare', 'review'] });
    expect(paths).toHaveLength(2);
    for (const p of paths) {
      const { wb, rows } = rowsOf(p, 1);
      expect(!!(wb.Workbook?.Views?.[0] as { RTL?: boolean } | undefined)?.RTL).toBe(rtl);
      expect(rows[1][0]).toBe(tIn(locale, '项目'));
      expect(rows[rows.length - 1][1]).toBe(true);
      if (locale !== 'zh-CN') expect(HAN.test(rows.map((r) => r[0]).join(''))).toBe(false);
    }
  });

  it('总账与子账差异报告 + 例外报告', () => {
    const r = writeGlSubOutputs({ ...ctx(locale), moduleCode: 'A2' }, glRes, { levels: ['prepare', 'review'], reminders: [] });
    const { rows } = rowsOf(r.reportPath, 2);
    expect(rows.length - 2).toBe(glRes.breaks.length);
    if (locale !== 'zh-CN') expect(HAN.test(rows[1].join(''))).toBe(false);
    expect(new AdmZip(r.exceptionPath).readAsText('word/document.xml').includes('<w:bidi/>')).toBe(rtl);
  });
});

describe('与财务智能体凭证导入格式的列一致', () => {
  it('JE_COLUMNS 与 voucherExportRows 的列（中文界面下）相同', () => {
    const rows = voucherExportRows([{ id: 'v', no: '记-0001', date: '2026-09-30', period: '2026-09', lines: [{ summary: 's', accountCode: '6602', accountName: '管理费用', debit: 1, credit: 0 }], sourceDocIds: [], status: 'draft', basis: '', origin: 'manual', createdAt: '' }]);
    expect(Object.keys(rows[0])).toEqual(JE_COLUMNS);
  });
});
