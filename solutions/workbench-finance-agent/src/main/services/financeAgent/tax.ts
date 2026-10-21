/**
 * 税务申报智能体（纯函数）：读账面 / 票据数据 → 算增值税、附加税、企业所得税、个税 → 核对账税差异 → 风险预检。
 *
 * 只出草稿：不对接电子税务局、不提交申报。税率与优惠口径全部在设置里可改，
 * 每一个结果都带公式行（FaCalcLine），人能逐行复核。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  FaCalcLine, FaDoc, FaFinding, FaIitRow, FaJournalRow, FaLedger, FaTaxInputs, FaTaxResult, FaTaxSettings,
} from '@totalclaw/ipc-contracts';
import { fmt, isIncomeTaxExpense, pct, plNature, round2, sum } from './common';

export function defaultTaxSettings(): FaTaxSettings {
  return {
    smallScaleRate: 0.01,
    smallExemptMonthly: 100_000,
    eduSurchargeRate: 0.03,
    localEduSurchargeRate: 0.02,
    halveSurcharges: true,
    smallProfitCitRate: 0.05,
    citRate: 0.25,
    industryVatBurden: 0.02,
  };
}

/** 期间：'2026-08' 月度，'2026-Q3' 季度 */
export function periodRange(period: string): { from: string; to: string; months: number } {
  const q = period.match(/^(\d{4})-Q([1-4])$/);
  if (q) {
    const y = Number(q[1]);
    const start = (Number(q[2]) - 1) * 3 + 1;
    const end = start + 2;
    return { from: `${y}-${String(start).padStart(2, '0')}-01`, to: `${y}-${String(end).padStart(2, '0')}-31`, months: 3 };
  }
  const m = period.match(/^(\d{4})-(\d{2})$/);
  if (m) return { from: `${period}-01`, to: `${period}-31`, months: 1 };
  return { from: '0000-00-00', to: '9999-99-99', months: 1 };
}

export function inPeriod(date: string | undefined, period: string): boolean {
  if (!date) return false;
  const r = periodRange(period);
  return date >= r.from && date <= r.to;
}

const REVENUE_NAME = /主营业务收入|其他业务收入/;

/** 从票据与账面数据预填申报取数（人可以在界面上改） */
export function deriveTaxInputs(docs: FaDoc[], journal: FaJournalRow[], period: string, ledger: FaLedger): FaTaxInputs {
  const inP = docs.filter((d) => inPeriod(d.date, period) && d.status !== 'flagged');
  const sales = inP.filter((d) => d.direction === 'out' && (d.kind === 'vat_special' || d.kind === 'vat_normal'));
  const byRate = new Map<number, { rate: number; amount: number; tax: number }>();
  for (const d of sales) {
    const groups = d.items.length ? d.items : [{ taxRate: d.taxRate, amount: d.amount, tax: d.tax }];
    for (const it of groups) {
      const rate = it.taxRate ?? 0;
      const g = byRate.get(rate) || { rate, amount: 0, tax: 0 };
      g.amount = round2(g.amount + it.amount);
      g.tax = round2(g.tax + it.tax);
      byRate.set(rate, g);
    }
  }
  const general = ledger.taxpayerType === 'general';
  const inputTax = general
    ? sum(inP.filter((d) => d.direction === 'in' && (d.kind === 'vat_special' || d.kind === 'e_ticket')).map((d) => d.tax))
    : 0;
  const jr = journal.filter((r) => inPeriod(r.date, period));
  const bookRevenue = round2(sum(jr.filter((r) => REVENUE_NAME.test(r.accountName)).map((r) => r.credit - r.debit)));
  const year = period.slice(0, 4);
  const ytd = journal.filter((r) => r.date.startsWith(year) && r.date <= periodRange(period).to);
  // 利润总额 = 损益类贷方净额（收入）− 借方净额（成本费用）；所得税费用本身不算
  const profitYtd = round2(sum(ytd.filter((r) => plNature(r.accountName) && !isIncomeTaxExpense(r.accountName)).map((r) => r.credit - r.debit)));
  return {
    salesByRate: [...byRate.values()].sort((a, b) => b.rate - a.rate),
    uninvoicedSales: 0,
    uninvoicedRate: general ? 0.13 : defaultTaxSettings().smallScaleRate,
    inputTax: round2(inputTax),
    inputTransferOut: 0,
    carriedCredit: 0,
    bookRevenue,
    profitYtd,
    citPaidYtd: 0,
    quarterly: /Q/.test(period) || !general,
  };
}

// ─── 个税（工资薪金累计预扣法） ───────────────────────────────────────────

const IIT_TABLE: Array<[number, number, number]> = [
  [36_000, 0.03, 0], [144_000, 0.10, 2_520], [300_000, 0.20, 16_920], [420_000, 0.25, 31_920],
  [660_000, 0.30, 52_920], [960_000, 0.35, 85_920], [Infinity, 0.45, 181_920],
];
export const MONTHLY_BASIC_DEDUCTION = 5_000;

export function computeIit(row: FaIitRow): FaIitRow {
  const months = Math.max(1, Math.round(row.monthIndex || 1));
  const income = row.ytdSalary + row.salary;
  const deductions = MONTHLY_BASIC_DEDUCTION * months + row.ytdInsurance + row.insurance + row.ytdSpecial + row.special;
  const taxable = Math.max(0, round2(income - deductions));
  const [, rate, quick] = IIT_TABLE.find(([cap]) => taxable <= cap)!;
  const taxYtd = Math.max(0, round2(taxable * rate - quick));
  return { ...row, taxableYtd: taxable, rate, quickDeduction: quick, taxThisMonth: Math.max(0, round2(taxYtd - row.ytdTaxPaid)) };
}

// ─── 主计算 ──────────────────────────────────────────────────────────────

export function computeTax(inputs: FaTaxInputs, ledger: FaLedger, s: FaTaxSettings, iitRows: FaIitRow[]): FaTaxResult {
  const general = ledger.taxpayerType === 'general';
  const months = inputs.quarterly ? 3 : 1;
  const vat: FaCalcLine[] = [];
  const invoicedAmount = sum(inputs.salesByRate.map((g) => g.amount));
  const salesTotal = round2(invoicedAmount + inputs.uninvoicedSales);
  let vatPayable = 0;
  let vatExempt = false;

  if (general) {
    const outputInvoiced = sum(inputs.salesByRate.map((g) => g.tax));
    const outputUninvoiced = round2(inputs.uninvoicedSales * inputs.uninvoicedRate);
    const output = round2(outputInvoiced + outputUninvoiced);
    for (const g of inputs.salesByRate) vat.push({ label: i18nT('{p0} 税率销售额', { p0: pct(g.rate, 0) }), formula: i18nT('销项税额 {p0}', { p0: fmt(g.tax) }), value: g.amount });
    if (inputs.uninvoicedSales) vat.push({ label: i18nT('未开票收入'), formula: `${fmt(inputs.uninvoicedSales)} × ${pct(inputs.uninvoicedRate, 0)}`, value: outputUninvoiced });
    vat.push({ label: i18nT('销项税额合计'), formula: `${fmt(outputInvoiced)} + ${fmt(outputUninvoiced)}`, value: output });
    const deductible = round2(inputs.inputTax - inputs.inputTransferOut + inputs.carriedCredit);
    vat.push({ label: i18nT('可抵扣税额'), formula: i18nT('进项 {a} − 转出 {b} + 上期留抵 {c}', { a: fmt(inputs.inputTax), b: fmt(inputs.inputTransferOut), c: fmt(inputs.carriedCredit) }), value: deductible });
    const diff = round2(output - deductible);
    vatPayable = Math.max(0, diff);
    vat.push({ label: i18nT('应纳增值税'), formula: diff < 0 ? i18nT('{a} − {b} < 0，期末留抵 {c}', { a: fmt(output), b: fmt(deductible), c: fmt(-diff) }) : `${fmt(output)} − ${fmt(deductible)}`, value: vatPayable });
  } else {
    const threshold = s.smallExemptMonthly * months;
    vat.push({ label: i18nT('销售额（不含税）'), formula: i18nT('开票 {a} + 未开票 {b}', { a: fmt(invoicedAmount), b: fmt(inputs.uninvoicedSales) }), value: salesTotal });
    if (salesTotal <= threshold) {
      vatExempt = true;
      vat.push({ label: i18nT('免征判断'), formula: i18nT('{a} ≤ 免征额 {b}（{n} 个月）', { a: fmt(salesTotal), b: fmt(threshold), n: months }), value: 0 });
    } else {
      vatPayable = round2(salesTotal * s.smallScaleRate);
      vat.push({ label: i18nT('应纳增值税'), formula: `${fmt(salesTotal)} × ${pct(s.smallScaleRate, 0)}`, value: vatPayable });
    }
  }

  // 附加税：以实际缴纳的增值税为计税依据
  const cityRate = ledger.cityTier === 'urban' ? 0.07 : ledger.cityTier === 'county' ? 0.05 : 0.01;
  const halve = s.halveSurcharges && (!general || ledger.smallLowProfit);
  // 月销售额 10 万以下（按季 30 万）免征教育费附加、地方教育附加
  const eduExempt = salesTotal <= 100_000 * months;
  const factor = halve ? 0.5 : 1;
  const surcharges: FaCalcLine[] = [
    { label: i18nT('城市维护建设税'), formula: `${fmt(vatPayable)} × ${pct(cityRate, 0)}${halve ? ' × 50%' : ''}`, value: round2(vatPayable * cityRate * factor) },
    { label: i18nT('教育费附加'), formula: eduExempt ? i18nT('销售额未超过 {p0}，免征', { p0: fmt(100_000 * months) }) : `${fmt(vatPayable)} × ${pct(s.eduSurchargeRate, 0)}${halve ? ' × 50%' : ''}`, value: eduExempt ? 0 : round2(vatPayable * s.eduSurchargeRate * factor) },
    { label: i18nT('地方教育附加'), formula: eduExempt ? i18nT('销售额未超过 {p0}，免征', { p0: fmt(100_000 * months) }) : `${fmt(vatPayable)} × ${pct(s.localEduSurchargeRate, 0)}${halve ? ' × 50%' : ''}`, value: eduExempt ? 0 : round2(vatPayable * s.localEduSurchargeRate * factor) },
  ];
  const surchargeTotal = sum(surcharges.map((x) => x.value));

  // 企业所得税季度预缴
  const taxable = Math.max(0, inputs.profitYtd);
  const smallProfit = ledger.smallLowProfit && taxable <= 3_000_000;
  const citRate = smallProfit ? s.smallProfitCitRate : s.citRate;
  const citYtd = round2(taxable * citRate);
  const citPayable = Math.max(0, round2(citYtd - inputs.citPaidYtd));
  const cit: FaCalcLine[] = [
    { label: i18nT('本年累计利润总额'), formula: i18nT('损益类科目本年累计净额'), value: inputs.profitYtd },
    { label: i18nT('适用税率'), formula: smallProfit ? i18nT('小型微利企业，应纳税所得额 ≤ 300 万') : i18nT('一般税率'), value: citRate },
    { label: i18nT('累计应纳所得税'), formula: `${fmt(taxable)} × ${pct(citRate, 0)}`, value: citYtd },
    { label: i18nT('本期应补（退）'), formula: i18nT('{a} − 已预缴 {b}', { a: fmt(citYtd), b: fmt(inputs.citPaidYtd) }), value: citPayable },
  ];

  const iit = iitRows.map(computeIit);
  const iitTotal = sum(iit.map((r) => r.taxThisMonth || 0));
  const burdenRate = salesTotal > 0 ? round2((vatPayable / salesTotal) * 10000) / 10000 : null;
  return { vat, vatPayable, vatExempt, surcharges, surchargeTotal, cit, citPayable, iit, iitTotal, burdenRate };
}

// ─── 账税差异 + 风险预检 ─────────────────────────────────────────────────

export function taxFindings(inputs: FaTaxInputs, result: FaTaxResult, ledger: FaLedger, s: FaTaxSettings, docs: FaDoc[], period: string): FaFinding[] {
  const out: FaFinding[] = [];
  const general = ledger.taxpayerType === 'general';
  const invoiced = sum(inputs.salesByRate.map((g) => g.amount));
  const declared = round2(invoiced + inputs.uninvoicedSales);

  if (inputs.bookRevenue && Math.abs(inputs.bookRevenue - declared) > 1) {
    const gap = round2(inputs.bookRevenue - declared);
    out.push({
      code: 'book_tax_gap', level: Math.abs(gap) > declared * 0.1 ? 'high' : 'warn',
      title: i18nT('账面收入与申报销售额不一致'),
      detail: i18nT('账面收入 {a}，申报销售额 {b}（开票 {c} + 未开票 {d}），差 {e}', { a: fmt(inputs.bookRevenue), b: fmt(declared), c: fmt(invoiced), d: fmt(inputs.uninvoicedSales), e: fmt(gap) }),
      suggestion: gap > 0 ? i18nT('账面收入多于申报：检查是否有未开票收入没填，或收入确认时点与开票时点不同') : i18nT('申报多于账面：检查是否有开票未入账、预收款开票'),
    });
  }
  if (result.burdenRate != null && general && result.burdenRate < s.industryVatBurden) {
    out.push({
      code: 'low_burden', level: result.burdenRate < s.industryVatBurden / 2 ? 'high' : 'warn',
      title: i18nT('增值税税负率偏低'),
      detail: i18nT('本期税负率 {a}，低于设定的行业预警值 {b}', { a: pct(result.burdenRate), b: pct(s.industryVatBurden) }),
      suggestion: i18nT('核对进项是否集中在本期认证、是否有大额资产购进；若属正常经营波动，准备好情况说明'),
    });
  }
  const output = sum(inputs.salesByRate.map((g) => g.tax));
  if (general && output > 0 && inputs.inputTax / output > 0.95) {
    out.push({
      code: 'input_ratio', level: 'warn', title: i18nT('进项抵扣占比过高'),
      detail: i18nT('进项税额 {a} 占销项税额 {b} 的 {c}', { a: fmt(inputs.inputTax), b: fmt(output), c: pct(inputs.inputTax / output) }),
      suggestion: i18nT('逐张核对大额进项的业务真实性，确认没有用于免税项目、集体福利或个人消费的进项（这些要转出）'),
    });
  }
  const inP = docs.filter((d) => inPeriod(d.date, period));
  const flagged = inP.filter((d) => d.status === 'flagged');
  if (flagged.length) {
    out.push({
      code: 'flagged_docs', level: 'warn', title: i18nT('本期有 {n} 张异常票据未计入', { n: flagged.length }),
      detail: flagged.slice(0, 8).map((d) => `${d.fileName}：${d.checks.filter((c) => c.level === 'error').map((c) => c.message).join(i18nT('；'))}`).join('\n'),
      suggestion: i18nT('在凭证处理里逐张处理后重新计算'), refs: flagged.map((d) => d.id),
    });
  }
  const entertain = inP.filter((d) => d.direction === 'in' && d.kind === 'vat_special' && /招待|餐饮/.test(d.category) && d.tax > 0);
  if (general && entertain.length) {
    out.push({
      code: 'entertain_input', level: 'warn', title: i18nT('餐饮 / 招待类专票进项不得抵扣'),
      detail: i18nT('{n} 张，税额合计 {a}', { n: entertain.length, a: fmt(sum(entertain.map((d) => d.tax))) }),
      suggestion: i18nT('这部分进项税额应转出或不认证'), refs: entertain.map((d) => d.id),
    });
  }
  if (!general && result.vatExempt && inP.some((d) => d.direction === 'out' && d.kind === 'vat_special')) {
    out.push({
      code: 'special_on_exempt', level: 'info', title: i18nT('已开专票部分不享受免征'),
      detail: i18nT('小规模纳税人开具增值税专用发票的销售额，即使未达免征额也要按征收率缴税'),
      suggestion: i18nT('把专票销售额单独填列计税'),
    });
  }
  return out;
}

/** 申报表草稿（Excel 用）：主要栏次 */
export function taxDraftRows(period: string, ledger: FaLedger, result: FaTaxResult): Record<string, string | number>[] {
  const rows: Record<string, string | number>[] = [];
  const push = (sheet: string, l: FaCalcLine) => rows.push({ [i18nT('税种')]: sheet, [i18nT('项目')]: l.label, [i18nT('计算过程')]: l.formula, [i18nT('金额')]: l.value });
  result.vat.forEach((l) => push(i18nT('增值税'), l));
  result.surcharges.forEach((l) => push(i18nT('附加税费'), l));
  result.cit.forEach((l) => push(i18nT('企业所得税'), l));
  rows.push({ [i18nT('税种')]: i18nT('个人所得税'), [i18nT('项目')]: i18nT('本期代扣代缴合计'), [i18nT('计算过程')]: i18nT('{n} 人，累计预扣法', { n: result.iit.length }), [i18nT('金额')]: result.iitTotal });
  rows.unshift({ [i18nT('税种')]: ledger.name, [i18nT('项目')]: i18nT('所属期 {p0}', { p0: period }), [i18nT('计算过程')]: i18nT('草稿，仅供申报前核对，不能直接提交'), [i18nT('金额')]: '' });
  return rows;
}
