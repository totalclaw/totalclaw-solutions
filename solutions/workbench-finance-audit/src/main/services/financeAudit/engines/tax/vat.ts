/**
 * 增值税申报底稿（纯函数）：沙特 ZATCA 申报表各栏、阿联酋 FTA VAT 201 各栏、国际参数化。
 *
 * 口径：
 *   - 销项按类别归栏：标准税率 / 零税率 / 出口 / 免税；不征税的列出但不进申报表；
 *   - 进项：标准税率可抵扣（标了不可抵扣的除外）、进口在海关已缴的增值税、反向征收（自行计算销项并同额抵扣）；
 *   - 税额以发票上的税额为准，逐行与「不含税金额 × 税率」核对，超过容差的列为风险；
 *     反向征收、发票没写税额的标准税率行按规则税率自行计算；
 *   - 上期更正：不超过规则里的上限才并入本期，超过的要另行申报更正（不并入、列高风险）。
 * 金额全部最小货币单位整数。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauTaxFinding, FauTaxLine, FauTaxSection } from '@totalclaw/ipc-contracts';
import type { VatCategory, VatLineRow } from '../../intake/tax';
import { inRange, type TaxPeriod } from './common';

export type VatRegime = 'SA' | 'AE' | 'INTL';

export interface VatReturnInput {
  regime: VatRegime;
  lines: VatLineRow[];
  period: TaxPeriod;
  currency: string;
  /** 标准税率（小数），来自规则表（国际为参数） */
  standardRate: number;
  standardRuleId?: string;
  /** 上期留抵（≥ 0） */
  carriedCredit: number;
  /** 上期更正（带符号：+ 补税 / − 少报的进项） */
  correction: number;
  /** 本期可并入的更正上限（规则表）；null = 不限（国际口径） */
  correctionMax: number | null;
  correctionRuleId?: string;
  /** 逐行税额核对容差 */
  tol: number;
}

export interface VatReturnResult {
  section: FauTaxSection;
  output: number;
  input: number;
  findings: FauTaxFinding[];
  /** 没进申报表的行（作废、不征税、期外） */
  excludedRows: number[];
}

interface Box { id: string; label: string; base: number; tax: number; rows: number[]; side: 'out' | 'in' | 'info' }

/** 各地区申报表的栏位顺序与名称（词典 key） */
const LAYOUT: Record<VatRegime, Array<[string, string, Box['side']]>> = {
  SA: [
    ['sa_1', i18nKey('第 1 栏 标准税率销售'), 'out'],
    ['sa_rc_out', i18nKey('反向征收自行计算的销项税（与第 9 栏同额）'), 'out'],
    ['sa_3', i18nKey('第 3 栏 国内零税率销售'), 'info'],
    ['sa_4', i18nKey('第 4 栏 出口'), 'info'],
    ['sa_5', i18nKey('第 5 栏 免税销售'), 'info'],
    ['sa_7', i18nKey('第 7 栏 国内标准税率采购'), 'in'],
    ['sa_8', i18nKey('第 8 栏 进口（海关已缴增值税）'), 'in'],
    ['sa_9', i18nKey('第 9 栏 进口（反向征收）'), 'in'],
    ['sa_10', i18nKey('第 10 栏 零税率采购'), 'info'],
    ['sa_11', i18nKey('第 11 栏 免税采购'), 'info'],
  ],
  AE: [
    ['ae_1', i18nKey('第 1 栏 标准税率供应'), 'out'],
    ['ae_3', i18nKey('第 3 栏 适用反向征收的供应'), 'out'],
    ['ae_4', i18nKey('第 4 栏 零税率供应（含出口）'), 'info'],
    ['ae_5', i18nKey('第 5 栏 免税供应'), 'info'],
    ['ae_6', i18nKey('第 6 栏 进口货物'), 'out'],
    ['ae_9', i18nKey('第 9 栏 标准税率费用（可抵扣进项）'), 'in'],
    ['ae_10', i18nKey('第 10 栏 适用反向征收的供应（可抵扣进项）'), 'in'],
  ],
  INTL: [
    ['in_std', i18nKey('标准税率销售'), 'out'],
    ['in_rc_out', i18nKey('反向征收自行计算的销项税'), 'out'],
    ['in_zero', i18nKey('零税率销售（含出口）'), 'info'],
    ['in_exempt', i18nKey('免税销售'), 'info'],
    ['in_purchase', i18nKey('标准税率采购（可抵扣进项）'), 'in'],
    ['in_import', i18nKey('进口已缴增值税'), 'in'],
    ['in_rc_in', i18nKey('反向征收进项'), 'in'],
  ],
};

/** 一行进哪几栏：[栏位, 计入的税额]；tax 是这一行认定的税额（反向征收两边各计一次） */
function route(regime: VatRegime, l: VatLineRow, cat: VatCategory, tax: number): Array<[string, number]> {
  const sales = l.direction === 'sales';
  const rec = l.recoverable !== false ? tax : 0;
  const pick = (m: Partial<Record<VatCategory, Array<[string, number]>>>) => m[cat] || [];
  if (regime === 'SA') {
    if (sales) return pick({ standard: [['sa_1', tax]], zero: [['sa_3', 0]], export: [['sa_4', 0]], exempt: [['sa_5', 0]] });
    return pick({ standard: [['sa_7', rec]], import_customs: [['sa_8', rec]], reverse_charge: [['sa_rc_out', tax], ['sa_9', rec]], zero: [['sa_10', 0]], exempt: [['sa_11', 0]] });
  }
  if (regime === 'AE') {
    if (sales) return pick({ standard: [['ae_1', tax]], zero: [['ae_4', 0]], export: [['ae_4', 0]], exempt: [['ae_5', 0]] });
    // 已登记纳税人进口货物同样按反向征收：第 6 栏申报销项、第 10 栏抵扣
    return pick({ standard: [['ae_9', rec]], reverse_charge: [['ae_3', tax], ['ae_10', rec]], import_customs: [['ae_6', tax], ['ae_10', rec]] });
  }
  if (sales) return pick({ standard: [['in_std', tax]], zero: [['in_zero', 0]], export: [['in_zero', 0]], exempt: [['in_exempt', 0]] });
  return pick({ standard: [['in_purchase', rec]], import_customs: [['in_import', rec]], reverse_charge: [['in_rc_out', tax], ['in_rc_in', rec]] });
}

const pctText = (r: number) => `${Math.round(r * 10000) / 100}%`;
const money = (c: number) => (Math.round(c) / 100).toFixed(2);

/** 类别没填时：有税额按标准税率；没税额的分不清零税率还是免税，交给校验步阻断 */
export function inferCategory(l: VatLineRow): VatCategory | '' {
  if (l.category) return l.category;
  return l.vat !== 0 ? 'standard' : '';
}

export function vatReturn(input: VatReturnInput): VatReturnResult {
  const { regime, standardRate: rate, tol } = input;
  const boxes = new Map<string, Box>(LAYOUT[regime].map(([id, label, side]) => [id, { id, label, base: 0, tax: 0, rows: [], side }]));
  const findings: FauTaxFinding[] = [];
  const excludedRows: number[] = [];
  const mismatch: number[] = [];
  const missingVat: number[] = [];
  const outOfPeriod: number[] = [];
  const wrongRate: number[] = [];
  const unsupported: number[] = [];
  const blocked: number[] = [];

  for (const l of input.lines) {
    if (l.status === 'void') { excludedRows.push(l.row); continue; }
    if (!inRange(l.date, input.period)) { outOfPeriod.push(l.row); excludedRows.push(l.row); continue; }
    const cat = inferCategory(l);
    if (!cat || cat === 'out_of_scope') { excludedRows.push(l.row); continue; }
    if (l.status === 'abnormal' && l.direction === 'purchase') { blocked.push(l.row); excludedRows.push(l.row); continue; }
    const expected = Math.round(l.net * rate);
    if (cat === 'standard') {
      if (l.rate != null && Math.abs(l.rate - rate) > 1e-9) wrongRate.push(l.row);
      if (l.vat === 0 && l.net !== 0) missingVat.push(l.row);
      else if (Math.abs(l.vat - expected) > tol) mismatch.push(l.row);
    }
    // 标准税率没写税额、反向征收、阿联酋进口货物：按规则税率自行计算；沙特 / 国际的进口按海关缴款书上的税额
    const selfAssessed = cat === 'standard' || cat === 'reverse_charge' || (cat === 'import_customs' && regime === 'AE');
    const tax = selfAssessed ? (l.vat || expected) : l.vat;
    const routes = route(regime, l, cat, tax);
    if (!routes.length) { unsupported.push(l.row); excludedRows.push(l.row); continue; }
    for (const [id, tax] of routes) {
      const b = boxes.get(id)!;
      b.base += l.net;
      b.tax += tax;
      b.rows.push(l.row);
    }
  }

  const output = [...boxes.values()].filter((b) => b.side === 'out').reduce((s, b) => s + b.tax, 0);
  const input2 = [...boxes.values()].filter((b) => b.side === 'in').reduce((s, b) => s + b.tax, 0);
  const lines: FauTaxLine[] = [...boxes.values()].map((b) => ({
    id: b.id, label: { key: b.label }, base: b.base, tax: b.side === 'info' ? null : b.tax, rate: b.side === 'info' ? null : rate, rows: b.rows,
    ruleIds: input.standardRuleId ? [input.standardRuleId] : undefined,
  }));
  lines.push({ id: 'output_total', label: { key: i18nKey('销项税额合计') }, tax: output, formula: `Σ = ${money(output)}` });
  lines.push({ id: 'input_total', label: { key: i18nKey('可抵扣进项税额合计') }, tax: input2, formula: `Σ = ${money(input2)}` });

  let correction = input.correction;
  if (correction && input.correctionMax != null && Math.abs(correction) > input.correctionMax) {
    findings.push({
      id: 'correction_over_max', level: 'high', title: { key: i18nKey('上期更正超过可在本期并入的上限') },
      detail: { key: i18nKey('更正金额 {a} 超过上限 {b}，不并入本期申报；须按规定另行申报更正'), params: { a: money(correction), b: money(input.correctionMax) } },
    });
    correction = 0;
  }
  const net = output - input2;
  const due = net + correction - input.carriedCredit;
  lines.push({ id: 'net', label: { key: i18nKey('本期应纳税额（销项 − 进项）') }, tax: net, formula: `${money(output)} − ${money(input2)}` });
  lines.push({ id: 'correction', label: { key: i18nKey('上期更正') }, tax: correction, ruleIds: input.correctionRuleId ? [input.correctionRuleId] : undefined });
  lines.push({ id: 'carried', label: { key: i18nKey('上期留抵') }, tax: -input.carriedCredit });
  lines.push({ id: 'due', label: { key: due >= 0 ? i18nKey('本期应缴增值税') : i18nKey('期末留抵 / 可申请退税') }, tax: due, formula: `${money(net)} + ${money(correction)} − ${money(input.carriedCredit)}` });

  const f = (id: string, level: FauTaxFinding['level'], title: string, rows: number[], detail?: string, params?: Record<string, string | number>) => {
    if (rows.length) findings.push({ id, level, title: { key: title }, detail: detail ? { key: detail, params: { n: rows.length, ...(params || {}) } } : undefined, rows: rows.slice(0, 200) });
  };
  f('rate_mismatch', 'warn', i18nKey('税额与「不含税金额 × 税率」不一致'), mismatch, i18nKey('{n} 行超过容差 {p0}，申报表按发票税额计入，请核对发票'), { p0: money(tol) });
  f('missing_vat', 'warn', i18nKey('标准税率行没有税额'), missingVat, i18nKey('{n} 行按 {p0} 自行计算后计入，请核对是否漏开或应为零税率 / 免税'), { p0: pctText(rate) });
  f('wrong_rate', 'warn', i18nKey('发票税率与规则表的标准税率不同'), wrongRate, i18nKey('{n} 行税率不是 {p0}'), { p0: pctText(rate) });
  f('out_of_period', 'info', i18nKey('不在本税期内的行未计入'), outOfPeriod, i18nKey('{n} 行日期不在 {p0} 至 {p1}'), { p0: input.period.from, p1: input.period.to });
  f('abnormal_input', 'high', i18nKey('异常 / 失控发票的进项未抵扣'), blocked, i18nKey('{n} 行进项发票状态异常，已排除在可抵扣进项之外'));
  f('unsupported_category', 'warn', i18nKey('这类组合不进申报表'), unsupported, i18nKey('{n} 行的方向与类别组合（如销项写了反向征收）不属于本申报表，请核对'));
  if (!input.lines.some((l) => l.direction === 'sales')) findings.push({ id: 'no_sales', level: 'info', title: { key: i18nKey('本期没有销项行') } });

  return {
    section: { id: 'vat', title: { key: i18nKey('增值税') }, currency: input.currency, lines, payable: due },
    output, input: input2, findings, excludedRows,
  };
}
