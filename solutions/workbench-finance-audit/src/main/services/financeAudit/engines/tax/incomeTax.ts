/**
 * 所得税（纯函数）：
 *   阿联酋企业所得税（草稿口径）：应纳税所得额 = 会计利润 + 人工调整；
 *     税额 = (应纳税所得额 − ae.cit_zero_threshold 375,000 迪拉姆) × ae.cit_rate 9%，不足免征额为 0；
 *     小企业减免（选择适用且收入不超过 ae.cit_small_business_revenue_cap、税期在规则有效期内）视同无应纳税所得额；
 *   国际（IAS 12，参数化）：当期所得税 = max(0, 会计利润 + 调整) × 税率；
 *     暂时性差异：资产「账面 > 计税基础」、负债「账面 < 计税基础」为应纳税差异（递延所得税负债），反之为可抵扣差异（递延所得税资产）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauTaxFinding, FauTaxLine, FauTaxSection } from '@totalclaw/ipc-contracts';
import type { TempDiffRow } from '../../intake/tax';
import type { RuleBook } from './common';

const money = (c: number) => (Math.round(c) / 100).toFixed(2);
const pct = (r: number) => `${Math.round(r * 10000) / 100}%`;

export function aeCorporateTax(input: {
  profit: number; profitRows: number[]; revenue: number; adjust: number; smallBusinessRelief: boolean; rules: RuleBook; currency: string;
}): { section: FauTaxSection; findings: FauTaxFinding[] } {
  const { rules } = input;
  const rate = rules.rate('ae.cit_rate');
  const zero = Math.round(rules.num('ae.cit_zero_threshold') * 100);
  const findings: FauTaxFinding[] = [];
  const taxable = input.profit + input.adjust;
  const lines: FauTaxLine[] = [
    { id: 'profit', label: { key: i18nKey('会计利润（税前）') }, base: input.profit, rows: input.profitRows },
    { id: 'adjust', label: { key: i18nKey('纳税调整（不可扣除 + / 免税收入 −）') }, base: input.adjust },
    { id: 'taxable', label: { key: i18nKey('应纳税所得额') }, base: taxable, formula: `${money(input.profit)} + ${money(input.adjust)}` },
  ];
  let relief = false;
  if (input.smallBusinessRelief) {
    const cap = rules.find('ae.cit_small_business_revenue_cap');
    if (cap && input.revenue <= Math.round(Number(cap.value) * 100)) relief = true;
    else {
      findings.push({
        id: 'sbr_not_eligible', level: 'warn', title: { key: i18nKey('不符合小企业减免条件，按正常税率计算') },
        detail: cap
          ? { key: i18nKey('收入 {a} 超过上限 {b}'), params: { a: money(input.revenue), b: money(Math.round(Number(cap.value) * 100)) } }
          : { key: i18nKey('本税期不在小企业减免的适用期内') },
      });
    }
  }
  const tax = relief ? 0 : Math.round(Math.max(0, taxable - zero) * rate);
  if (relief) {
    findings.push({ id: 'sbr_applied', level: 'info', title: { key: i18nKey('已按小企业减免处理：视同本税期无应纳税所得额') }, detail: { key: i18nKey('须在申报时选择适用，且收入不超过上限；不能结转本期亏损') } });
    lines.push({ id: 'sbr', label: { key: i18nKey('小企业减免') }, tax: 0, ruleIds: ['ae.cit_small_business_revenue_cap'] });
  } else {
    lines.push({ id: 'zero_band', label: { key: i18nKey('按 0% 计税的部分') }, base: Math.min(Math.max(taxable, 0), zero), rate: 0, tax: 0, ruleIds: ['ae.cit_zero_threshold'] });
    lines.push({ id: 'taxed', label: { key: i18nKey('按标准税率计税的部分') }, base: Math.max(0, taxable - zero), rate, tax, ruleIds: ['ae.cit_rate'], formula: `(${money(taxable)} − ${money(zero)}) × ${pct(rate)}` });
  }
  if (taxable < 0) findings.push({ id: 'cit_loss', level: 'info', title: { key: i18nKey('本期为税务亏损') }, detail: { key: i18nKey('亏损可按规定结转以后年度抵减，须保留计算底稿') } });
  lines.push({ id: 'cit_due', label: { key: i18nKey('应缴企业所得税') }, tax });
  return { section: { id: 'cit', title: { key: i18nKey('企业所得税（阿联酋）') }, currency: input.currency, lines, payable: tax }, findings };
}

export function currentTax(input: { profit: number; profitRows: number[]; adjust: number; rate: number; currency: string }): FauTaxSection {
  const taxable = input.profit + input.adjust;
  const tax = Math.round(Math.max(0, taxable) * input.rate);
  return {
    id: 'current_tax', title: { key: i18nKey('当期所得税') }, currency: input.currency, payable: tax,
    lines: [
      { id: 'profit', label: { key: i18nKey('会计利润（税前）') }, base: input.profit, rows: input.profitRows },
      { id: 'adjust', label: { key: i18nKey('纳税调整（不可扣除 + / 免税收入 −）') }, base: input.adjust },
      { id: 'taxable', label: { key: i18nKey('应纳税所得额') }, base: taxable, rate: input.rate, tax, formula: `max(0, ${money(taxable)}) × ${pct(input.rate)}` },
    ],
  };
}

export function deferredTax(rows: TempDiffRow[], rate: number, currency: string): { section: FauTaxSection; dta: number; dtl: number } {
  const lines: FauTaxLine[] = [];
  let taxableDiff = 0;
  let deductibleDiff = 0;
  for (const r of rows) {
    const diff = r.carrying - r.taxBase;
    // 资产账面高于计税基础 → 将来多交税（应纳税差异）；负债相反
    const taxableSide = r.cls === 'liability' ? diff < 0 : diff > 0;
    const amount = Math.abs(diff);
    if (!amount) continue;
    if (taxableSide) taxableDiff += amount; else deductibleDiff += amount;
    lines.push({
      id: `td_${r.row}`, label: { key: r.item }, base: amount, rate, tax: Math.round(amount * rate) * (taxableSide ? 1 : -1), rows: [r.row],
      formula: `|${money(r.carrying)} − ${money(r.taxBase)}| × ${pct(rate)}`,
    });
  }
  const dtl = Math.round(taxableDiff * rate);
  const dta = Math.round(deductibleDiff * rate);
  lines.push({ id: 'dtl', label: { key: i18nKey('递延所得税负债（应纳税暂时性差异）') }, base: taxableDiff, rate, tax: dtl });
  lines.push({ id: 'dta', label: { key: i18nKey('递延所得税资产（可抵扣暂时性差异）') }, base: deductibleDiff, rate, tax: -dta });
  lines.push({ id: 'net', label: { key: i18nKey('递延所得税净额（负债为正）') }, tax: dtl - dta });
  return { section: { id: 'deferred_tax', title: { key: i18nKey('递延所得税（IAS 12）') }, currency, lines, payable: dtl - dta }, dta, dtl };
}
