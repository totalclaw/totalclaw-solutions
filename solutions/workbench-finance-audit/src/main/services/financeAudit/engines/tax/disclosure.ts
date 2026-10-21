/**
 * 应披露事项识别与阈值判断（纯函数，C2 的规则部分）：
 *   中国（上交所股票上市规则，阈值在 thresholds/regulatory.json）：交易按资产总额 / 成交金额 / 利润三项比例与绝对额，
 *     关联交易按关联自然人、关联法人分档，担保一律披露；比例达到股东大会标准的升为「提交股东大会」；
 *   沙特（CMA，规则表 sa.disclosure_*，草稿口径）：资产交易按净资产占比，关联交易按营业收入占比；
 *   国际：关联方交易按 IAS 24 在附注披露，其它事项按重要性比例（参数）。
 * 比例以小数计，绝对额以最小货币单位计；「以上」含本数，「超过」不含。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauDisclosureItem, FauDisclosureLevel, FauDisclosureRegime, FauDisclosureTest, FauTaxFinding } from '@totalclaw/ipc-contracts';
import type { DisclosureEventRow } from '../../intake/tax';
import { inRange, type RuleBook, type TaxPeriod } from './common';

export interface DisclosureBase { totalAssets: number; netAssets: number; revenue: number; netProfit: number }

const RANK: Record<FauDisclosureLevel, number> = { none: 0, notes: 1, disclose: 2, shareholder: 3 };
const ratio = (a: number | null, b: number) => (a == null || !b ? null : Math.abs(a) / Math.abs(b));

function test(id: string, label: string, r: number | null, threshold: number, level: FauDisclosureLevel, abs?: { value: number; min: number }): FauDisclosureTest {
  const hit = r != null && r >= threshold && (!abs || Math.abs(abs.value) > abs.min);
  return { id, label: { key: label }, ratio: r, threshold, absMin: abs?.min, hit, level };
}

export function cnTests(e: DisclosureEventRow, b: DisclosureBase, th: Record<string, number>): FauDisclosureTest[] {
  const t: FauDisclosureTest[] = [];
  if (e.type === 'guarantee') {
    t.push({ id: 'guarantee', label: { key: i18nKey('对外担保一律提交董事会审议并披露') }, ratio: null, threshold: 0, hit: true, level: 'disclose' });
    return t;
  }
  if (e.type === 'related_party') {
    if (e.rpKind === 'natural') {
      t.push({ id: 'rp_natural', label: { key: i18nKey('与关联自然人的交易金额') }, ratio: null, threshold: 0, absMin: th['cn.rptNatural.floor'], hit: Math.abs(e.amount) >= th['cn.rptNatural.floor'], level: 'disclose' });
    } else {
      const r = ratio(e.amount, b.netAssets);
      t.push({ id: 'rp_legal', label: { key: i18nKey('与关联法人的交易金额占净资产') }, ratio: r, threshold: th['cn.rptLegalPct'], absMin: th['cn.rptLegal.floor'], hit: r != null && r >= th['cn.rptLegalPct'] && Math.abs(e.amount) >= th['cn.rptLegal.floor'], level: 'disclose' });
    }
    const r = ratio(e.amount, b.netAssets);
    t.push({ id: 'rp_shareholder', label: { key: i18nKey('关联交易提交股东大会：金额与净资产占比') }, ratio: r, threshold: th['cn.rptShareholderPct'], absMin: th['cn.rptShareholder.floor'], hit: r != null && r >= th['cn.rptShareholderPct'] && Math.abs(e.amount) >= th['cn.rptShareholder.floor'], level: 'shareholder' });
    return t;
  }
  const assets = ratio(e.assetTotal, b.totalAssets);
  const amount = ratio(e.amount, b.netAssets);
  const profit = ratio(e.profit, b.netProfit);
  t.push(test('assets', i18nKey('涉及资产总额占总资产'), assets, th['cn.txnAssetsPct'], 'disclose'));
  t.push(test('amount', i18nKey('成交金额占净资产'), amount, th['cn.txnNetAssetsPct'], 'disclose', { value: e.amount, min: th['cn.txnNetAssets.floor'] }));
  t.push(test('profit', i18nKey('交易利润占净利润'), profit, th['cn.txnProfitPct'], 'disclose', e.profit == null ? undefined : { value: e.profit, min: th['cn.txnProfit.floor'] }));
  t.push(test('assets_sh', i18nKey('提交股东大会：涉及资产总额占总资产'), assets, th['cn.shareholderPct'], 'shareholder'));
  t.push(test('amount_sh', i18nKey('提交股东大会：成交金额占净资产'), amount, th['cn.shareholderPct'], 'shareholder', { value: e.amount, min: th['cn.shareholderNetAssets.floor'] }));
  t.push(test('profit_sh', i18nKey('提交股东大会：交易利润占净利润'), profit, th['cn.shareholderPct'], 'shareholder', e.profit == null ? undefined : { value: e.profit, min: th['cn.shareholderProfit.floor'] }));
  return t;
}

export function saTests(e: DisclosureEventRow, b: DisclosureBase, rules: RuleBook): FauDisclosureTest[] {
  if (e.type === 'related_party') {
    return [test('rp_revenue', i18nKey('关联交易金额占营业收入'), ratio(e.amount, b.revenue), rules.rate('sa.disclosure_rpt_revenue_pct'), 'disclose')];
  }
  return [test('net_assets', i18nKey('交易金额占净资产'), ratio(e.amount, b.netAssets), rules.rate('sa.disclosure_asset_deal_pct'), 'disclose')];
}

export function intlTests(e: DisclosureEventRow, b: DisclosureBase, th: Record<string, number>): FauDisclosureTest[] {
  if (e.type === 'related_party') return [{ id: 'ias24', label: { key: i18nKey('关联方交易按 IAS 24 在报表附注披露') }, ratio: null, threshold: 0, hit: true, level: 'notes' }];
  return [test('materiality', i18nKey('事项金额占净利润（重要性）'), ratio(e.amount, b.netProfit), th['intl.materialityPct'], 'disclose')];
}

export function disclosureItems(events: DisclosureEventRow[], regime: FauDisclosureRegime, base: DisclosureBase, th: Record<string, number>, rules: RuleBook | null): FauDisclosureItem[] {
  return events.map((e) => {
    const tests = regime === 'cn_sse' ? cnTests(e, base, th) : regime === 'sa_cma' ? saTests(e, base, rules!) : intlTests(e, base, th);
    const level = tests.filter((t) => t.hit).reduce<FauDisclosureLevel>((m, t) => (RANK[t.level] > RANK[m] ? t.level : m), 'none');
    return { id: `ev${e.row}`, row: e.row, date: e.date, type: e.type, description: e.description, counterparty: e.counterparty, amount: e.amount, level, tests, draftStatus: 'none' };
  });
}

/** 报送数据核查：期外、金额为 0、疑似重复、分母缺失 */
export function reportingChecks(events: DisclosureEventRow[], period: TaxPeriod | null, base: DisclosureBase): FauTaxFinding[] {
  const out: FauTaxFinding[] = [];
  const outside = period ? events.filter((e) => !inRange(e.date, period)) : [];
  if (outside.length) out.push({ id: 'ev_out_of_period', level: 'info', title: { key: i18nKey('不在本期内的事项') }, detail: { key: i18nKey('{n} 项日期不在 {p0} 至 {p1}，仍参与判断，请确认是否属于本期报送'), params: { n: outside.length, p0: period!.from, p1: period!.to } }, rows: outside.map((e) => e.row) });
  const zero = events.filter((e) => e.amount === 0 && e.type !== 'litigation');
  if (zero.length) out.push({ id: 'ev_zero', level: 'warn', title: { key: i18nKey('金额为 0 的事项') }, detail: { key: i18nKey('{n} 项，无法按比例判断，请补金额'), params: { n: zero.length } }, rows: zero.map((e) => e.row) });
  const seen = new Map<string, number>();
  const dup: number[] = [];
  for (const e of events) {
    const k = `${e.date}|${e.amount}|${e.counterparty}`;
    if (seen.has(k)) dup.push(e.row); else seen.set(k, e.row);
  }
  if (dup.length) out.push({ id: 'ev_duplicate', level: 'warn', title: { key: i18nKey('疑似重复的事项') }, detail: { key: i18nKey('{n} 项与前面的事项日期、金额、对方都相同'), params: { n: dup.length } }, rows: dup });
  for (const [k, label] of [['netAssets', i18nKey('净资产')], ['totalAssets', i18nKey('总资产')], ['revenue', i18nKey('营业收入')], ['netProfit', i18nKey('净利润')]] as const) {
    if (!base[k]) out.push({ id: `base_${k}`, level: 'warn', title: { key: i18nKey('披露比例的分母缺失') }, detail: { key: label } });
  }
  return out;
}
