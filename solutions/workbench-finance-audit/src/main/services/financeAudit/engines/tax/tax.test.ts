/**
 * C1 纳税申报准备：金标准夹具（手算值写在 __fixtures__/tax 的注释里）。
 *   中国结果与直接调用财务智能体 computeTax 逐项相同；沙特增值税标准 / 零税率 / 免税 / 反向征收各栏；
 *   天课回历与公历两种口径、加减项追溯到来源行；阿联酋 9% 与 375,000 免征额、小企业减免；预提税；申报日历；草稿口径。
 */
import { describe, expect, it } from 'vitest';
import type { RegionRule } from '@totalclaw/core-domain';
import type { FaDoc, FaFinding } from '@totalclaw/ipc-contracts';
import { computeTax, defaultTaxSettings, deriveTaxInputs, taxFindings } from '../../../financeAgent/tax';
import SEED from '../../../processLibrary/seeds/region-rules.json';
import * as FX from '../../__fixtures__/tax';
import { RuleBook, classifyTb, hijriOf, isReviewed, taxPeriod } from './common';
import { vatReturn } from './vat';
import { cnTax, goldenTaxChecks, toLedger } from './cn';
import { zakatBase } from './zakat';
import { withholdingTax } from './wht';
import { aeCorporateTax, currentTax, deferredTax } from './incomeTax';
import { aeCitCalendar, aeVatCalendar, saAnnualCalendar, saVatCalendar } from './calendar';

const RULES = SEED as unknown as RegionRule[];
const box = (r: ReturnType<typeof vatReturn>, id: string) => r.section.lines.find((l) => l.id === id)!;

describe('沙特增值税（标准 / 零税率 / 出口 / 免税 / 进口 / 反向征收）', () => {
  const period = taxPeriod('2026-09');
  const rules = new RuleBook(RULES, period.to, 'SA');
  const r = vatReturn({ regime: 'SA', lines: FX.saVatLines, period, currency: 'SAR', standardRate: rules.rate('sa.vat_standard_rate'), carriedCredit: FX.SA_VAT.carried, correction: 0, correctionMax: rules.num('sa.vat_correction_threshold') * 100, tol: 100 });

  it('各栏基数与税额和手算一致', () => {
    expect([box(r, 'sa_1').base, box(r, 'sa_1').tax]).toEqual([12_000_000, 1_800_000]);
    expect(box(r, 'sa_3').base).toBe(3_000_000);
    expect(box(r, 'sa_4').base).toBe(5_000_000);
    expect(box(r, 'sa_5').base).toBe(1_000_000);
    expect([box(r, 'sa_7').base, box(r, 'sa_7').tax]).toEqual([4_200_000, 600_000]);
    expect(box(r, 'sa_8').tax).toBe(375_000);
    expect([box(r, 'sa_9').tax, box(r, 'sa_rc_out').tax]).toEqual([120_000, 120_000]);
    expect([box(r, 'sa_10').base, box(r, 'sa_11').base]).toEqual([100_000, 50_000]);
  });

  it('销项 / 进项合计、应纳与应缴', () => {
    expect([r.output, r.input]).toEqual([FX.SA_VAT.output, FX.SA_VAT.input]);
    expect(box(r, 'net').tax).toBe(FX.SA_VAT.net);
    expect(r.section.payable).toBe(FX.SA_VAT.due);
  });

  it('作废与期外的行不计入；期外列为提示', () => {
    expect(r.excludedRows).toEqual(expect.arrayContaining([7, 8]));
    expect(r.findings.find((f) => f.id === 'out_of_period')?.rows).toEqual([8]);
  });

  it('上期更正超过 5,000 里亚尔不并入本期、列高风险', () => {
    const big = vatReturn({ regime: 'SA', lines: FX.saVatLines, period, currency: 'SAR', standardRate: 0.15, carriedCredit: 0, correction: 600_000, correctionMax: 500_000, tol: 100 });
    expect(big.findings.find((f) => f.id === 'correction_over_max')?.level).toBe('high');
    expect(box(big, 'correction').tax).toBe(0);
    const ok = vatReturn({ regime: 'SA', lines: FX.saVatLines, period, currency: 'SAR', standardRate: 0.15, carriedCredit: 0, correction: 400_000, correctionMax: 500_000, tol: 100 });
    expect(ok.section.payable).toBe(FX.SA_VAT.net + 400_000);
  });

  it('税额与「金额 × 税率」不符的行列为风险', () => {
    const bad = vatReturn({ regime: 'SA', lines: [{ ...FX.saVatLines[0], vat: 1_400_000 }], period, currency: 'SAR', standardRate: 0.15, carriedCredit: 0, correction: 0, correctionMax: null, tol: 100 });
    expect(bad.findings.find((f) => f.id === 'rate_mismatch')?.rows).toEqual([2]);
  });
});

describe('阿联酋增值税（VAT 201，5%）', () => {
  const period = taxPeriod('2026-Q3');
  const rules = new RuleBook(RULES, period.to, 'AE');
  const r = vatReturn({ regime: 'AE', lines: FX.aeVatLines, period, currency: 'AED', standardRate: rules.rate('ae.vat_standard_rate'), carriedCredit: 0, correction: 0, correctionMax: rules.num('ae.vat_correction_threshold') * 100, tol: 100 });
  it('第 1 / 3 / 4 / 5 / 6 / 9 / 10 栏与应缴', () => {
    expect(box(r, 'ae_1').tax).toBe(1_000_000);
    expect(box(r, 'ae_3').tax).toBe(50_000);
    expect(box(r, 'ae_4').base).toBe(3_000_000);
    expect(box(r, 'ae_5').base).toBe(500_000);
    expect(box(r, 'ae_6').tax).toBe(200_000);
    expect(box(r, 'ae_9').tax).toBe(300_000);
    expect(box(r, 'ae_10').tax).toBe(250_000);
    expect([r.output, r.input, r.section.payable]).toEqual([FX.AE_VAT.output, FX.AE_VAT.input, FX.AE_VAT.due]);
  });
});

describe('中国：与直接调用财务智能体 computeTax 逐项相同', () => {
  it('增值税、附加、所得税结果与财务智能体一致', () => {
    const ledger = { name: '测试公司', taxId: '', taxpayerType: 'general' as const, cityTier: 'urban' as const, smallLowProfit: false };
    const ours = cnTax({ lines: FX.cnVatLines, journal: [], iit: [], period: '2026-09', ledger, overrides: {}, locale: 'zh-CN' });
    // 同一份数据按财务智能体的票据结构手写（元），直接调它的三个函数
    const doc = (id: string, direction: 'in' | 'out', kind: FaDoc['kind'], amount: number, tax: number, rate: number, status: FaDoc['status'] = 'confirmed'): FaDoc => ({
      id, fileName: id, path: '', kind, direction, date: '2026-09-15', amount, tax, total: amount + tax, taxRate: rate, items: [], category: '', fieldSource: {}, checks: [], text: '', status, createdAt: '',
    });
    const docs = [doc('a', 'out', 'vat_special', 100_000, 13_000, 0.13), doc('b', 'out', 'vat_normal', 50_000, 3_000, 0.06), doc('c', 'in', 'vat_special', 60_000, 7_800, 0.13), doc('d', 'in', 'vat_special', 10_000, 1_300, 0.13, 'flagged')];
    const fl = toLedger(ledger);
    const inputs = deriveTaxInputs(docs, [], '2026-09', fl);
    const direct = computeTax(inputs, fl, defaultTaxSettings(), []);
    expect(ours.inputs).toEqual(inputs);
    expect(ours.result.vat.map((l) => l.value)).toEqual(direct.vat.map((l) => l.value));
    expect(ours.result.surcharges.map((l) => l.value)).toEqual(direct.surcharges.map((l) => l.value));
    expect(ours.result.cit.map((l) => l.value)).toEqual(direct.cit.map((l) => l.value));
    expect([ours.result.vatPayable, ours.result.surchargeTotal, ours.result.citPayable]).toEqual([direct.vatPayable, direct.surchargeTotal, direct.citPayable]);
    // 销项 13,000 + 3,000 − 进项 7,800 = 8,200（失控票不计入）
    expect(direct.vatPayable).toBe(8_200);
    const f1 = taxFindings(inputs, direct, fl, defaultTaxSettings(), docs, '2026-09').map((f: FaFinding) => f.code).sort();
    expect(ours.findings.map((f) => f.code).sort()).toEqual(f1);
    // 换算回分
    expect(ours.sections.find((s) => s.id === 'vat')!.payable).toBe(820_000);
  });

  it('按输出语言出公式行（阿语里没有中文公式）', () => {
    const ledger = { name: 'X', taxId: '', taxpayerType: 'general' as const, cityTier: 'urban' as const, smallLowProfit: false };
    const ar = cnTax({ lines: FX.cnVatLines, journal: [], iit: [], period: '2026-09', ledger, overrides: {}, locale: 'ar' });
    const zh = cnTax({ lines: FX.cnVatLines, journal: [], iit: [], period: '2026-09', ledger, overrides: {}, locale: 'zh-CN' });
    expect(ar.result.vatPayable).toBe(zh.result.vatPayable);
    expect(ar.result.vat.at(-1)!.label).not.toBe(zh.result.vat.at(-1)!.label);
  });

  it('金税自检：失控进项、进项集中度、连续多期进项大于销项', () => {
    const fs = goldenTaxChecks(FX.cnVatLines, { topShare: 0.6, warnMonths: 3, highMonths: 6, history: [
      { period: '2026-09', output: 1, input: 2 }, { period: '2026-08', output: 1, input: 2 }, { period: '2026-07', output: 1, input: 2 }, { period: '2026-06', output: 2, input: 1 },
    ] });
    expect(fs.find((f) => f.id === 'gt_abnormal_input')?.rows).toEqual([5]);
    expect(fs.find((f) => f.id === 'gt_input_over_output')?.level).toBe('warn');
  });
});

describe('沙特天课（回历 / 公历两种口径）与外资部分所得税', () => {
  const rows = classifyTb(FX.zakatTb, { accountMap: [] }, 'SOCPA');
  const base = { rows, overrides: {}, profitAdjust: 0, fiscalDays: 365, zakatRate: 0.025, hijriYearDays: 354, citRate: 0.2 };

  it('加减项自动归类，每一项都能追溯到余额表行号', () => {
    const z = zakatBase({ ...base, yearBasis: 'hijri', saudiShare: 1 });
    const cat = Object.fromEntries(z.items.map((i) => [i.row, i.category]));
    expect(cat).toMatchObject({ 2: 'add_equity', 3: 'add_equity', 4: 'add_equity', 5: 'add_provision', 6: 'add_liability', 7: 'none', 8: 'deduct_fixed', 9: 'deduct_fixed', 10: 'deduct_investment', 11: 'none' });
    expect(z.items.find((i) => i.row === 9)!.amount).toBe(-20_000_000);
    expect(z.currentProfit).toBe(FX.ZAKAT.profit);
    expect(z.profitRows).toEqual([12, 13]);
    expect([z.additions, z.deductions, z.base, z.adjustedProfit]).toEqual([FX.ZAKAT.additions, FX.ZAKAT.deductions, FX.ZAKAT.base, FX.ZAKAT.profit]);
    for (const i of z.items) expect(FX.zakatTb.some((r) => r.row === i.row && r.accountName === i.accountName)).toBe(true);
  });

  it('回历年 2.5%；公历年 2.5% × 365 / 354', () => {
    expect(zakatBase({ ...base, yearBasis: 'hijri', saudiShare: 1 }).zakatDue).toBe(FX.ZAKAT.hijri);
    expect(zakatBase({ ...base, yearBasis: 'gregorian', saudiShare: 1 }).zakatDue).toBe(FX.ZAKAT.greg);
  });

  it('混合持股：天课按沙特股东比例，外资部分缴 20% 所得税', () => {
    const h = zakatBase({ ...base, yearBasis: 'hijri', saudiShare: 0.6 });
    const g = zakatBase({ ...base, yearBasis: 'gregorian', saudiShare: 0.6 });
    expect([h.zakatDue, g.zakatDue]).toEqual([FX.ZAKAT.hijri60, FX.ZAKAT.greg60]);
    expect(h.nonSaudiCit).toBe(FX.ZAKAT.cit40);
  });

  it('基数低于调整后净利润时按净利润（下限）；人工改归类生效', () => {
    const z = zakatBase({ ...base, yearBasis: 'hijri', saudiShare: 1, overrides: { 1701: 'none', 3101: 'none', 3201: 'none' } });
    expect(z.computedBase).toBe(170_000_000 - 110_000_000 - 70_000_000 + 10_000_000);
    expect(z.base).toBe(FX.ZAKAT.profit);
    expect(z.floorApplied).toBe(true);
    expect(z.items.find((i) => i.row === 10)!.source).toBe('manual');
  });
});

describe('阿联酋企业所得税（9%，375,000 迪拉姆以内 0%）', () => {
  const period = taxPeriod('2025');
  const rules = new RuleBook(RULES, period.to, 'AE');
  const pl = { profit: FX.AE_CIT.profit, profitRows: [2, 3], revenue: 160_000_000 };
  it('超过免征额的部分按 9%', () => {
    const r = aeCorporateTax({ ...pl, adjust: 0, smallBusinessRelief: false, rules, currency: 'AED' });
    expect(r.section.payable).toBe(FX.AE_CIT.tax);
    expect(aeCorporateTax({ ...pl, profit: 37_500_000, adjust: 0, smallBusinessRelief: false, rules, currency: 'AED' }).section.payable).toBe(0);
  });
  it('小企业减免：收入不超过 300 万且税期在 2026-12-31 前 → 0；超过上限按正常税率并提醒', () => {
    const r = aeCorporateTax({ ...pl, adjust: 0, smallBusinessRelief: true, rules, currency: 'AED' });
    expect(r.section.payable).toBe(0);
    const big = aeCorporateTax({ ...pl, revenue: 400_000_000, adjust: 0, smallBusinessRelief: true, rules, currency: 'AED' });
    expect(big.section.payable).toBe(FX.AE_CIT.tax);
    expect(big.findings.some((f) => f.id === 'sbr_not_eligible')).toBe(true);
    // 2027 年税期：小企业减免规则已失效
    const later = new RuleBook(RULES, '2027-12-31', 'AE');
    expect(aeCorporateTax({ ...pl, adjust: 0, smallBusinessRelief: true, rules: later, currency: 'AED' }).section.payable).toBe(FX.AE_CIT.tax);
  });
  it('2023-06-01 之前的税期没有生效的企业所得税规则', () => {
    expect(new RuleBook(RULES, '2023-03-31', 'AE').find('ae.cit_rate')).toBeNull();
  });
});

describe('沙特预提税', () => {
  it('按付款类型取税率，沙特居民收款方不适用，申报期限次月 10 日', () => {
    const period = taxPeriod('2026-09');
    const rules = new RuleBook(RULES, period.to, 'SA');
    const r = withholdingTax(FX.whtRows, period, rules, 'SAR');
    expect(r.section.payable).toBe(FX.WHT.total);
    expect(r.section.lines.find((l) => l.rows?.[0] === 2)!.rate).toBe(0.2);
    expect(r.findings.find((f) => f.id === 'wht_resident')?.rows).toEqual([5]);
    expect(r.findings.find((f) => f.id === 'wht_withheld_diff')?.rows).toEqual([4]);
    expect(r.calendar).toEqual([expect.objectContaining({ period: '2026-09', due: FX.WHT.due })]);
  });
});

describe('国际：参数化增值税与当期所得税', () => {
  it('标准税率 10%：销项 100 + 反向征收 20，进项 40 + 20，应缴 60；当期所得税 (1,000 + 100) × 25% = 275', () => {
    const L = (row: number, o: object) => ({ ...FX.saVatLines[0], row, counterparty: '', counterpartyVatNo: '', ...o });
    const r = vatReturn({
      regime: 'INTL', period: taxPeriod('2026-09'), currency: 'USD', standardRate: 0.1, carriedCredit: 0, correction: 0, correctionMax: null, tol: 100,
      lines: [L(2, { net: 100_000, vat: 10_000, category: 'standard' }), L(3, { direction: 'purchase', net: 40_000, vat: 4_000, category: 'standard' }), L(4, { direction: 'purchase', net: 20_000, vat: 0, category: 'reverse_charge' })],
    });
    expect([r.output, r.input, r.section.payable]).toEqual([12_000, 6_000, 6_000]);
    expect(currentTax({ profit: 100_000, profitRows: [], adjust: 10_000, rate: 0.25, currency: 'USD' }).payable).toBe(27_500);
  });
});

describe('国际：递延所得税（IAS 12）', () => {
  it('资产账面 > 计税基础为应纳税差异，负债账面 > 计税基础为可抵扣差异', () => {
    const r = deferredTax([
      { row: 2, item: 'PPE', cls: 'asset', carrying: 1_000_000, taxBase: 600_000 },
      { row: 3, item: 'Warranty provision', cls: 'liability', carrying: 200_000, taxBase: 0 },
    ], 0.25, 'USD');
    expect([r.dtl, r.dta]).toEqual([100_000, 50_000]);
    expect(r.section.payable).toBe(50_000);
  });
});

describe('申报日历与回历', () => {
  it('沙特增值税次月最后一天；天课年度结束后 120 天；阿联酋增值税第 28 天；企业所得税 9 个月', () => {
    const sa = new RuleBook(RULES, '2026-09-30', 'SA');
    expect(saVatCalendar(taxPeriod('2026-09'), sa)[0].due).toBe('2026-10-31');
    expect(saAnnualCalendar('2025-12-31', new RuleBook(RULES, '2025-12-31', 'SA'))[0].due).toBe('2026-04-30');
    const ae = new RuleBook(RULES, '2026-09-30', 'AE');
    expect(aeVatCalendar(taxPeriod('2026-Q3'), ae)[0].due).toBe('2026-10-28');
    expect(aeCitCalendar(taxPeriod('2025'), new RuleBook(RULES, '2025-12-31', 'AE'))[0].due).toBe('2026-09-30');
  });
  it('回历日期（乌姆古拉历，西方数字）', () => {
    expect(hijriOf('2026-03-20')).toMatch(/^14\d\d-\d\d-\d\d$/);
    expect(hijriOf('bad')).toBe('');
  });
});

describe('地区规则：版本、生效日期、审核状态', () => {
  it('新增的沙特、阿联酋规则都带出处与生效日期，审核前一律算草稿口径', () => {
    const ids = ['sa.zakat_rate', 'sa.zakat_return_due', 'sa.cit_rate_nonsaudi', 'sa.wht_rates.management_fee', 'sa.einvoice_phase2_start', 'ae.cit_rate', 'ae.cit_zero_threshold'];
    for (const id of ids) {
      const r = RULES.find((x) => x.id === id)!;
      expect(r, id).toBeTruthy();
      expect(r.version && /^\d{4}-\d{2}-\d{2}$/.test(r.effectiveFrom), id).toBeTruthy();
      expect(r.source.issuer && r.source.title && r.source.language, id).toBeTruthy();
      expect(isReviewed(r), id).toBe(false);
    }
    const book = new RuleBook(RULES, '2026-09-30', 'SA');
    book.get('sa.vat_standard_rate');
    expect(book.draft()).toBe(true);
    expect(book.uses()[0]).toMatchObject({ id: 'sa.vat_standard_rate', version: '2020.07', reviewed: false });
  });
  it('审核过的规则不再是草稿口径', () => {
    const reviewed = RULES.map((r) => (r.id === 'sa.vat_standard_rate' ? { ...r, review: { reviewer: 'A', role: 'SOCPA CPA', reviewedAt: '2026-10-01', status: 'authoritative' } } : r)) as RegionRule[];
    const book = new RuleBook(reviewed, '2026-09-30', 'SA');
    book.get('sa.vat_standard_rate');
    expect(book.draft()).toBe(false);
  });
});
