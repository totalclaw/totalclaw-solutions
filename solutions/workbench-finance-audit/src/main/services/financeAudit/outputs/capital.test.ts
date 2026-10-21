/**
 * G6 产出物三语检查（第 13.5 节第 7 条 + 批次 7 重点）：
 *   估值模型 xlsx 在 zh / en / ar 各生成一次：计算页是公式联动、公式自检全 TRUE、阿语 xlsx 有 RTL（公式不受影响）；
 *   ar / en 的固定文案里没有汉字（用户数据除外）；没有来源的输入标 [未注明来源]；
 *   研究 / 财富的 xlsx 与 docx 带「非投资建议」声明（三语），阿语 docx 有 bidi；未核实的段落标 [未注明来源]。
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';
import { tIn } from '@totalclaw/i18n';
import type { FauCapResult, FauLocale } from '@totalclaw/ipc-contracts';
import { VALUATION_ENGINES } from '../engines/capital/valuation';
import { RESEARCH_ENGINES } from '../engines/capital/research';
import type { CapIn } from '../engines/capital/inputs';
import { DCF_FX, LBO_FX } from '../__fixtures__/capital/valuation';
import { CAP_OUT, writeCapitalOutputs } from './capital';
import { OUT } from './common';
import type { OutputCtx } from './close';

const DIR = mkdtempSync(join(tmpdir(), 'fau-cap-out-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));
const HAN = /[一-鿿]/;
const LOCALES: FauLocale[] = ['zh-CN', 'en-US', 'ar'];

const dcfIn: CapIn = {
  f: { riskFree: 0.04, beta: 1.6, erp: 0.05, sizePremium: 0, costDebt: 0.05, taxRate: 0.2, debtWeight: 0.25, terminalMethod: 'gordon', terminalGrowth: 0.02, exitMultiple: null, midYear: 'no', netDebt: 200, shares: 100, units: null },
  t: { forecast: DCF_FX.forecast.map((y) => ({ ...y })) },
};

function resultOf(moduleId: string, modeId: string, out: ReturnType<typeof VALUATION_ENGINES.dcf.run>, extra: Partial<FauCapResult> = {}): FauCapResult {
  return {
    moduleId, modeId, metrics: out.metrics, tables: out.tables, flags: out.flags,
    inputs: {
      fields: [{ key: 'beta', label: '贝塔系数', unit: 'num', value: 1.6, src: { kind: 'manual' } }, { key: 'taxRate', label: '所得税率', unit: 'pct', value: 0.2, src: { kind: 'default' } }],
      tables: [{ id: 'forecast', title: '预测期现金流', columns: [{ key: 'year', label: '年度', unit: 'text' }, { key: 'ebit', label: '息税前利润 EBIT', unit: 'money' }], rows: DCF_FX.forecast.map((y, i) => ({ cells: { year: y.year, ebit: y.ebit }, src: { kind: 'upload', file: 'forecast.csv', row: i + 2 } })) }],
    },
    upstream: [], degraded: { authorized: false, completeness: 'low', unsourced: 1 }, disclaimer: null, ...extra,
  };
}

const ctx = (locale: FauLocale, code: string, moduleName: string, modeName: string): OutputCtx => ({
  locale, dir: join(DIR, locale), companyName: 'Acme 集团', projectName: '2026 估值', period: '2026', moduleCode: code, moduleName, modeName, standardLabel: '国际财务报告准则', model: 'fake',
});
const book = (p: string) => XLSX.read(readFileSync(p), { type: 'buffer', cellFormula: true });
const docXml = (p: string) => new AdmZip(p).readAsText('word/document.xml');

describe('G6 估值模型 xlsx', () => {
  it.each(LOCALES)('%s：DCF 计算页公式联动、Checks 全 TRUE、来源标注、语言与方向正确', (locale) => {
    const out = VALUATION_ENGINES.dcf.run(dcfIn);
    const res = resultOf('valuation', 'dcf', out);
    const paths = writeCapitalOutputs(ctx(locale, 'F1', '估值建模', 'DCF 现金流折现'), res, { levels: ['prepare', 'review'], docx: true, engineDetail: out.detail, inputs: dcfIn });
    expect(paths.audit.every((a) => a.ok)).toBe(true);
    const wb = book(paths.xlsx);
    const calc = wb.Sheets[tIn(locale, '计算')];
    const formulas = Object.values(calc).filter((c: any) => c && typeof c === 'object' && c.f);
    expect(formulas.length).toBeGreaterThan(30);
    // 企业价值这一行是公式，缓存值 = 引擎结果
    const evRow = XLSX.utils.sheet_to_json<unknown[]>(calc, { header: 1, defval: '' }).findIndex((r) => r[0] === tIn(locale, '企业价值'));
    const evCell = calc[XLSX.utils.encode_cell({ r: evRow, c: 1 })];
    expect(evCell.f).toMatch(/^B\d+\+B\d+$/);
    expect(evCell.v).toBeCloseTo(1431.8182, 3);
    const checks = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets.Checks, { header: 1, defval: '' }).slice(2);
    const engineChecks = checks.filter((r) => typeof r[1] === 'boolean');
    expect(engineChecks.length).toBeGreaterThan(5);
    // 终值占比 80.95% > 75%：这一条 FALSE（黄旗），其余公式自检与引擎对比为 TRUE
    expect(checks.find((r) => r[0] === tIn(locale, '终值占企业价值不超过 {p0}', { p0: '75%' }))?.[1]).toBe(false);
    expect(checks.find((r) => r[0] === tIn(locale, '公式算出的企业价值与引擎一致'))?.[1]).toBe(true);
    // 输入与来源：默认值标 [未注明来源]、上传行带文件与行号
    const inputs = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[tIn(locale, '输入与来源')], { header: 1, defval: '' });
    const flat = inputs.flat().map(String);
    expect(flat).toContain(tIn(locale, '[未注明来源]'));
    expect(flat).toContain(tIn(locale, '[上传: {p0} 第 {n} 行]', { p0: 'forecast.csv', n: 2 }));
    const banner = String(XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 })[0][0]);
    expect(banner).toContain(tIn(locale, OUT.draft));
    expect(banner).toContain(tIn(locale, CAP_OUT.degraded, { p0: tIn(locale, CAP_OUT.low) }));
    if (locale === 'ar') expect(wb.Workbook?.Views?.[0]?.RTL).toBe(true);
    if (locale !== 'zh-CN') {
      // 固定文案（表头、sheet 名、横幅）没有汉字；用户数据（公司名）除外
      for (const n of wb.SheetNames) {
        expect(HAN.test(n), n).toBe(false);
        const head = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[n], { header: 1, defval: '' }).slice(0, 2).flat().map(String).filter((x) => !x.includes('Acme'));
        for (const h of head) expect(HAN.test(h), `${n}: ${h}`).toBe(false);
      }
      expect(HAN.test(docXml(paths.docx!).replace(/Acme 集团|2026 估值/g, ''))).toBe(false);
    }
  });

  it('LBO 与三表、可比公司也写成公式联动并通过自检', () => {
    const lboIn: CapIn = { f: { taxRate: 0.25, entryEbitda: 100, entryMultiple: 10, feesPct: 0.02, minCash: 0, seniorX: 4, seniorRate: 0.08, seniorAmort: 0.05, sweepPct: 1, subX: 1, subRate: 0.1, exitMultiple: 10 }, t: { forecast: LBO_FX.forecast.map((y) => ({ ...y })) } };
    const lbo = VALUATION_ENGINES.lbo.run(lboIn);
    const p1 = writeCapitalOutputs(ctx('en-US', 'F1', '估值建模', 'LBO 杠杆收购'), resultOf('valuation', 'lbo', lbo), { levels: ['prepare', 'review'], docx: false, engineDetail: lbo.detail, inputs: lboIn });
    expect(p1.audit.every((a) => a.ok)).toBe(true);
    const tsIn: CapIn = { f: { years: 3, revenue0: 1000, growth: 0.1, grossMargin: 0.4, opexPct: 0.2, daPct: 0.1, capexPct: 0.05, dso: 36.5, dio: 73, dpo: 36.5, taxRate: 0.25, interestRate: 0.05, payout: 0.3, cash0: 100, ppe0: 500, debt0: 300, ar0: 100, inv0: 120, ap0: 60, debtRepay: 50 }, t: {} };
    const ts = VALUATION_ENGINES.three_statement.run(tsIn);
    const p2 = writeCapitalOutputs(ctx('ar', 'F1', '估值建模', '三表联动模型'), resultOf('valuation', 'three_statement', ts), { levels: ['prepare', 'review'], docx: false, engineDetail: ts.detail, inputs: tsIn });
    expect(p2.audit.every((a) => a.ok)).toBe(true);
    const compsIn: CapIn = { f: { targetEbitda: 50, targetNetDebt: 100, targetRevenue: null, targetNetIncome: null, shares: 10 }, t: { peers: [{ name: 'A', ev: 800, marketCap: 600, revenue: 400, ebitda: 100, netIncome: 50 }, { name: 'B', ev: 1000, marketCap: 800, revenue: 500, ebitda: 100, netIncome: 40 }, { name: 'C', ev: 1200, marketCap: 900, revenue: 600, ebitda: 100, netIncome: 60 }] } };
    const comps = VALUATION_ENGINES.comps.run(compsIn);
    const p3 = writeCapitalOutputs(ctx('zh-CN', 'F1', '估值建模', '可比公司'), resultOf('valuation', 'comps', comps), { levels: ['prepare', 'review'], docx: false, engineDetail: comps.detail, inputs: compsIn });
    expect(p3.audit.every((a) => a.ok)).toBe(true);
    const calc = book(p3.xlsx).Sheets['计算'];
    expect(Object.values(calc).some((c: any) => typeof c?.f === 'string' && c.f.startsWith('IFERROR(MEDIAN('))).toBe(true);
  });
});

describe('G6 研究产出：非投资建议与回核', () => {
  it.each(LOCALES)('%s：xlsx 横幅与 docx 页眉带「非投资建议」，未核实的段落标 [未注明来源]，阿语 docx 有 bidi', (locale) => {
    const v: CapIn = { f: { beatPct: 0.02 }, t: { actuals: [{ metric: 'Revenue', actual: 103, consensus: 100 }] } };
    const out = RESEARCH_ENGINES.earnings.run(v);
    const res = resultOf('research', 'earnings', out, {
      disclaimer: 'research',
      sections: [{ heading: 'Results', paragraphs: [{ text: 'Revenue of 103 beat consensus of 100.', status: 'verified' }, { text: 'Margin reached 45.2%.', status: 'unverified', missing: ['45.2%'] }] }],
    });
    const p = writeCapitalOutputs(ctx(locale, 'F6', '证券研究', '财报点评'), res, { levels: ['prepare', 'review'], docx: true, engineDetail: out.detail, inputs: v });
    const disc = tIn(locale, CAP_OUT.research);
    const wb = book(p.xlsx);
    expect(String(XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 })[0][0])).toContain(disc);
    const zip = new AdmZip(p.docx!);
    expect(zip.readAsText('word/header1.xml')).toContain(disc);
    const doc = zip.readAsText('word/document.xml');
    expect(doc).toContain(`Margin reached 45.2%. ${tIn(locale, '[未注明来源]')}`);
    expect(doc).not.toContain(`consensus of 100. ${tIn(locale, '[未注明来源]')}`);
    if (locale === 'ar') { expect(doc).toContain('<w:bidi/>'); expect(doc).toContain('<w:bidiVisual/>'); }
  });
});
