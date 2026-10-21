/**
 * 申报日历（纯函数）：只算截止日、不提醒外部、不提交。
 *   中国：沿用财务智能体 filing.ts 的口径（所属期结束后次月 15 日，遇节假日顺延以电子税务局申报日历为准）；
 *   沙特：增值税为申报期结束后下一个月的最后一天（sa.vat_return_due），天课与所得税为年度结束后 sa.zakat_return_due 天；
 *   阿联酋：增值税为税期结束后第 28 天（ae.vat_return_due），企业所得税为税期结束后 ae.cit_return_due 个月内。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauTaxDeadline } from '@totalclaw/ipc-contracts';
import { dueDateOf } from '../../../financeAgent/filing';
import { addDaysUtc, endOfMonthAfter, type RuleBook, type TaxPeriod } from './common';

export function cnCalendar(period: string, opts: { hasIit: boolean; citDue: boolean }): FauTaxDeadline[] {
  const due = dueDateOf(period);
  const out: FauTaxDeadline[] = [
    { id: 'cn_vat', label: { key: i18nKey('增值税及附加税费申报') }, period, due },
  ];
  if (opts.citDue) out.push({ id: 'cn_cit', label: { key: i18nKey('企业所得税预缴申报') }, period, due });
  if (opts.hasIit) out.push({ id: 'cn_iit', label: { key: i18nKey('个人所得税（工资薪金）扣缴申报') }, period, due });
  return out;
}

export function saVatCalendar(p: TaxPeriod, rules: RuleBook): FauTaxDeadline[] {
  rules.get('sa.vat_return_due');
  return [{ id: 'sa_vat', label: { key: i18nKey('增值税申报与缴纳') }, period: p.label, due: endOfMonthAfter(p.to, 1), ruleId: 'sa.vat_return_due' }];
}

export function saAnnualCalendar(fiscalYearEnd: string, rules: RuleBook): FauTaxDeadline[] {
  const days = rules.num('sa.zakat_return_due');
  return [{ id: 'sa_zakat', label: { key: i18nKey('天课与所得税年度申报与缴纳') }, period: fiscalYearEnd.slice(0, 7), due: addDaysUtc(fiscalYearEnd, days), ruleId: 'sa.zakat_return_due' }];
}

export function aeVatCalendar(p: TaxPeriod, rules: RuleBook): FauTaxDeadline[] {
  rules.get('ae.vat_return_due');
  return [{ id: 'ae_vat', label: { key: i18nKey('增值税申报与缴纳（VAT 201）') }, period: p.label, due: addDaysUtc(p.to, 28), ruleId: 'ae.vat_return_due' }];
}

export function aeCitCalendar(p: TaxPeriod, rules: RuleBook): FauTaxDeadline[] {
  const months = rules.num('ae.cit_return_due');
  return [{ id: 'ae_cit', label: { key: i18nKey('企业所得税申报与缴纳') }, period: p.label, due: endOfMonthAfter(p.to, months), ruleId: 'ae.cit_return_due' }];
}
