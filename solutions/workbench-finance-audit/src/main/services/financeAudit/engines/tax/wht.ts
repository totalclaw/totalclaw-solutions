/**
 * 沙特预提税（纯函数，草稿口径）：向非居民付款按付款类型取 sa.wht_rates.<类型>，逐笔算应扣缴税额，
 * 与已扣缴额核对；申报与缴纳期限为付款次月第 sa.wht_return_due 日前。收款方为沙特居民的不适用。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauTaxDeadline, FauTaxFinding, FauTaxLine, FauTaxSection } from '@totalclaw/ipc-contracts';
import type { WhtRow } from '../../intake/tax';
import { dayOfNextMonth, inRange, type RuleBook, type TaxPeriod } from './common';

const RESIDENT = /^(sa|ksa|saudi|saudi arabia|沙特|السعودية|المملكة العربية السعودية)$/i;
const money = (c: number) => (Math.round(c) / 100).toFixed(2);

export function withholdingTax(rows: WhtRow[], period: TaxPeriod, rules: RuleBook, currency: string): { section: FauTaxSection; findings: FauTaxFinding[]; calendar: FauTaxDeadline[] } {
  const lines: FauTaxLine[] = [];
  const findings: FauTaxFinding[] = [];
  const resident: number[] = [];
  const short: number[] = [];
  const outOfPeriod: number[] = [];
  const dueDay = rules.num('sa.wht_return_due');
  const dues = new Set<string>();
  let total = 0;
  for (const r of rows) {
    if (!inRange(r.date, period)) { outOfPeriod.push(r.row); continue; }
    if (RESIDENT.test(r.country.trim())) { resident.push(r.row); continue; }
    const type = r.paymentType || 'other';
    const ruleId = `sa.wht_rates.${type}`;
    const rate = rules.rate(ruleId);
    const tax = Math.round(r.amount * rate);
    total += tax;
    lines.push({ id: `wht_${r.row}`, label: { key: r.payee }, base: r.amount, rate, tax, rows: [r.row], ruleIds: [ruleId], formula: `${money(r.amount)} × ${Math.round(rate * 1000) / 10}%` });
    if (r.withheld != null && Math.abs(r.withheld - tax) > 1) short.push(r.row);
    dues.add(`${r.date.slice(0, 7)}|${dayOfNextMonth(r.date, dueDay)}`);
  }
  lines.push({ id: 'wht_total', label: { key: i18nKey('应扣缴预提税合计') }, tax: total });
  if (resident.length) findings.push({ id: 'wht_resident', level: 'info', title: { key: i18nKey('收款方为沙特居民的付款不适用预提税') }, detail: { key: i18nKey('{n} 笔未计入'), params: { n: resident.length } }, rows: resident });
  if (short.length) findings.push({ id: 'wht_withheld_diff', level: 'warn', title: { key: i18nKey('已扣缴额与应扣缴额不一致') }, detail: { key: i18nKey('{n} 笔需要补扣或说明'), params: { n: short.length } }, rows: short });
  if (outOfPeriod.length) findings.push({ id: 'wht_out_of_period', level: 'info', title: { key: i18nKey('不在本税期内的行未计入') }, detail: { key: i18nKey('{n} 行日期不在 {p0} 至 {p1}'), params: { n: outOfPeriod.length, p0: period.from, p1: period.to } }, rows: outOfPeriod });
  const calendar: FauTaxDeadline[] = [...dues.keys()].sort().map((k) => {
    const [month, due] = k.split('|');
    return { id: `wht_${month}`, label: { key: i18nKey('预提税申报与缴纳') }, period: month, due, ruleId: 'sa.wht_return_due' };
  });
  return { section: { id: 'wht', title: { key: i18nKey('预提税') }, currency, lines, payable: total }, findings, calendar };
}
