/**
 * 中国口径（纯函数）：只读调用财务智能体 tax.ts 的 deriveTaxInputs / computeTax / taxFindings，
 * 口径与它完全一致（小规模 1%、六税两费减半等优惠执行至 2027-12-31，本方案不另存一份中国税率）。
 * 本文件只做两件事：把本方案的标准数据集（分）换成财务智能体的票据 / 序时账结构（元），以及补金税与数电票自检。
 * 申报代填跳转财务智能体「申报上报」，停在提交前由人点。
 */
import { i18nKey, t as i18nT, type SupportedLocale } from '@totalclaw/i18n';
import type { FaDoc, FaFinding, FaIitRow, FaJournalRow, FaLedger, FaTaxInputs, FaTaxResult, FaTaxSettings, FauTaxFinding, FauTaxLine, FauTaxSection } from '@totalclaw/ipc-contracts';
import { computeTax, defaultTaxSettings, deriveTaxInputs, taxFindings } from '../../../financeAgent/tax';
import type { IitRow, VatLineRow } from '../../intake/tax';
import type { JournalRow } from '../../types';
import { withLocale } from './common';

const yuan = (c: number) => Math.round(c) / 100;
const cents = (y: number) => Math.round(y * 100);

export interface CnLedgerParams {
  name: string;
  taxId: string;
  taxpayerType: 'general' | 'small';
  cityTier: 'urban' | 'county' | 'other';
  smallLowProfit: boolean;
}

/** 人在第 ② 步可改的申报取数（元） */
export interface CnOverrides {
  uninvoicedSales?: number;
  uninvoicedRate?: number;
  inputTransferOut?: number;
  carriedCredit?: number;
  citPaidYtd?: number;
  quarterly?: boolean;
}

export function toLedger(p: CnLedgerParams): FaLedger {
  return { id: 'finance-audit', name: p.name, taxId: p.taxId, taxpayerType: p.taxpayerType, cityTier: p.cityTier, industry: '', smallLowProfit: p.smallLowProfit, notes: '', createdAt: '' };
}

/** 标准数据集的销项 / 进项行 → 财务智能体的票据（只取申报计算用到的字段） */
export function toFaDocs(lines: VatLineRow[], checkText: (k: string) => string): FaDoc[] {
  return lines.map((l) => {
    const rate = l.rate ?? (l.net ? Math.round((l.vat / l.net) * 100) / 100 : 0);
    // 类型没写：销项按开具的发票计；进项有税额且未标不可抵扣按可抵扣专票，否则按普票（不抵扣）
    const kind: FaDoc['kind'] = l.invoiceType
      || (l.direction === 'sales' ? 'vat_special' : (l.vat !== 0 && l.recoverable !== false ? 'vat_special' : 'vat_normal'));
    const flagged = l.status === 'void' || l.status === 'abnormal';
    return {
      id: `L${l.row}`, fileName: l.docNo || `#${l.row}`, path: '', kind: l.recoverable === false && l.direction === 'purchase' ? 'vat_normal' : kind,
      direction: l.direction === 'sales' ? 'out' : 'in', invoiceNo: l.docNo, date: l.date,
      sellerName: l.direction === 'purchase' ? l.counterparty : '', buyerName: l.direction === 'sales' ? l.counterparty : '',
      amount: yuan(l.net), tax: yuan(l.vat), total: yuan(l.net + l.vat), taxRate: rate, items: [], category: '',
      fieldSource: {}, checks: flagged ? [{ code: `status_${l.status}`, level: 'error', message: checkText(l.status === 'void' ? i18nKey('发票已作废') : i18nKey('发票状态异常（失控 / 异常凭证）')) }] : [],
      text: '', status: flagged ? 'flagged' : 'confirmed', createdAt: '',
    };
  });
}

export function toFaJournal(rows: JournalRow[]): FaJournalRow[] {
  return rows.map((r) => ({ date: r.date, voucherNo: r.voucherNo, summary: r.summary, accountCode: r.accountCode, accountName: r.accountName, debit: yuan(r.debit), credit: yuan(r.credit), counterparty: r.counterparty, dept: r.dept }));
}

export function toFaIit(rows: IitRow[]): FaIitRow[] {
  return rows.map((r) => ({
    name: r.name, idNo: r.idNo, salary: yuan(r.salary), insurance: yuan(r.insurance), special: yuan(r.special),
    ytdSalary: yuan(r.ytdSalary), ytdInsurance: yuan(r.ytdInsurance), ytdSpecial: yuan(r.ytdSpecial), ytdTaxPaid: yuan(r.ytdTaxPaid), monthIndex: r.monthIndex || 1,
  }));
}

export interface CnTaxOut {
  inputs: FaTaxInputs;
  result: FaTaxResult;
  findings: FaFinding[];
  settings: FaTaxSettings;
  sections: FauTaxSection[];
}

/** 中国口径：按输出语言调用财务智能体的同一组函数（公式行与风险提示用输出语言） */
export function cnTax(input: {
  lines: VatLineRow[]; journal: JournalRow[]; iit: IitRow[]; period: string; ledger: CnLedgerParams; overrides: CnOverrides; locale: SupportedLocale;
}): CnTaxOut {
  return withLocale(input.locale, () => {
    const ledger = toLedger(input.ledger);
    const settings = defaultTaxSettings();
    const docs = toFaDocs(input.lines, (k) => i18nT(k));
    const derived = deriveTaxInputs(docs, toFaJournal(input.journal), input.period, ledger);
    const o = input.overrides;
    const inputs: FaTaxInputs = {
      ...derived,
      uninvoicedSales: o.uninvoicedSales ?? derived.uninvoicedSales,
      uninvoicedRate: o.uninvoicedRate ?? derived.uninvoicedRate,
      inputTransferOut: o.inputTransferOut ?? derived.inputTransferOut,
      carriedCredit: o.carriedCredit ?? derived.carriedCredit,
      citPaidYtd: o.citPaidYtd ?? derived.citPaidYtd,
      quarterly: o.quarterly ?? derived.quarterly,
    };
    const iitRows = toFaIit(input.iit);
    const result = computeTax(inputs, ledger, settings, iitRows);
    const findings = taxFindings(inputs, result, ledger, settings, docs, input.period);
    return { inputs, result, findings, settings, sections: cnSections(result) };
  });
}

/** 财务智能体的公式行（已是输出语言的文字）→ 申报底稿各节；金额换回分 */
export function cnSections(r: FaTaxResult): FauTaxSection[] {
  const line = (prefix: string) => (l: { label: string; formula: string; value: number }, i: number): FauTaxLine => ({ id: `${prefix}_${i}`, label: { key: l.label }, formula: l.formula, tax: cents(l.value) });
  // 所得税第 2 行是适用税率，不是金额
  const cit = r.cit.map((l, i) => (i === 1 ? { id: `cit_${i}`, label: { key: l.label }, formula: l.formula, rate: l.value } : line('cit')(l, i)));
  const iit: FauTaxLine[] = r.iit.map((p, i) => ({
    id: `iit_${i}`, label: { key: p.name }, base: cents(p.taxableYtd || 0), rate: p.rate ?? null, tax: cents(p.taxThisMonth || 0),
    formula: `${p.taxableYtd ?? 0} × ${Math.round((p.rate || 0) * 100)}% − ${p.quickDeduction ?? 0} − ${p.ytdTaxPaid}`,
  }));
  return [
    { id: 'vat', title: { key: i18nKey('增值税') }, currency: 'CNY', lines: r.vat.map(line('vat')), payable: cents(r.vatPayable) },
    { id: 'surcharge', title: { key: i18nKey('附加税费') }, currency: 'CNY', lines: r.surcharges.map(line('sur')), payable: cents(r.surchargeTotal) },
    { id: 'cit', title: { key: i18nKey('企业所得税') }, currency: 'CNY', lines: cit, payable: cents(r.citPayable) },
    { id: 'iit', title: { key: i18nKey('个人所得税（工资薪金累计预扣）') }, currency: 'CNY', lines: iit, payable: cents(r.iitTotal) },
  ];
}

/** 财务智能体的风险提示（输出语言文字）→ 本方案的风险清单 */
export function cnFindings(fs: FaFinding[]): FauTaxFinding[] {
  return fs.map((f) => ({ id: `fa:${f.code}`, level: f.level, title: { key: f.title }, detail: { key: f.detail }, suggestion: { key: f.suggestion } }));
}

/**
 * 金税与数电票自检（fa-cn-golden-tax）：异常 / 失控进项须转出、作废与红冲张数、专票缺对方税号、进项集中度、
 * 连续多期进项大于销项（读项目历史）。
 */
export function goldenTaxChecks(lines: VatLineRow[], opts: { topShare: number; history: Array<{ period: string; output: number; input: number }>; warnMonths: number; highMonths: number }): FauTaxFinding[] {
  const out: FauTaxFinding[] = [];
  const abnormal = lines.filter((l) => l.direction === 'purchase' && l.status === 'abnormal');
  if (abnormal.length) {
    out.push({
      id: 'gt_abnormal_input', level: 'high', title: { key: i18nKey('进项里有异常 / 失控发票') },
      detail: { key: i18nKey('{n} 张，税额合计 {a}；已认证抵扣的须做进项转出'), params: { n: abnormal.length, a: yuan(abnormal.reduce((s, l) => s + l.vat, 0)).toFixed(2) } },
      suggestion: { key: i18nKey('在「进项税额转出」里填写这部分金额后重新计算') }, rows: abnormal.map((l) => l.row),
    });
  }
  const voided = lines.filter((l) => l.status === 'void');
  const red = lines.filter((l) => l.status === 'red');
  if (voided.length || red.length) {
    out.push({ id: 'gt_void_red', level: 'info', title: { key: i18nKey('作废与红冲发票') }, detail: { key: i18nKey('作废 {a} 张（未计入），红冲 {b} 张（按负数计入）'), params: { a: voided.length, b: red.length } }, rows: [...voided, ...red].map((l) => l.row) });
  }
  const noTaxId = lines.filter((l) => l.direction === 'sales' && l.invoiceType === 'vat_special' && !l.counterpartyVatNo);
  if (noTaxId.length) {
    out.push({ id: 'gt_special_no_taxid', level: 'warn', title: { key: i18nKey('专票缺购买方税号') }, detail: { key: i18nKey('{n} 张专票没有购买方纳税人识别号'), params: { n: noTaxId.length } }, rows: noTaxId.map((l) => l.row) });
  }
  const bySupplier = new Map<string, number>();
  let inputTotal = 0;
  for (const l of lines) {
    if (l.direction !== 'purchase' || l.status === 'void') continue;
    inputTotal += l.vat;
    bySupplier.set(l.counterparty || '-', (bySupplier.get(l.counterparty || '-') || 0) + l.vat);
  }
  const top3 = [...bySupplier.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const share = inputTotal > 0 ? top3.reduce((s, [, v]) => s + v, 0) / inputTotal : 0;
  if (bySupplier.size > 3 && share > opts.topShare) {
    out.push({
      id: 'gt_supplier_concentration', level: 'warn', title: { key: i18nKey('进项集中于少数供应商') },
      detail: { key: i18nKey('前 3 家供应商进项税额占 {p0}（{p1}）'), params: { p0: `${Math.round(share * 1000) / 10}%`, p1: top3.map(([n]) => n).join(' / ') } },
      suggestion: { key: i18nKey('核对合同、物流与资金流，准备合理性说明') },
    });
  }
  // 连续多期进项 > 销项：本期 + 项目历史（按期间倒序数连续月数）
  const seq = [...opts.history].sort((a, b) => (a.period < b.period ? 1 : -1));
  let run = 0;
  for (const h of seq) { if (h.input > h.output) run += 1; else break; }
  if (run >= opts.warnMonths) {
    out.push({
      id: 'gt_input_over_output', level: run >= opts.highMonths ? 'high' : 'warn', title: { key: i18nKey('进项连续多期大于销项') },
      detail: { key: i18nKey('已连续 {n} 期进项税额大于销项税额'), params: { n: run } },
      suggestion: { key: run >= opts.highMonths ? i18nKey('须税务经理介入，核查滞留票与失控票') : i18nKey('分析存货增加、淡季或产品转型等业务原因') },
    });
  }
  return out;
}
