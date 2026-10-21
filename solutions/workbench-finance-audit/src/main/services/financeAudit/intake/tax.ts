/**
 * 税务组数据集（批次 4，第 7.1 节）：销项与进项明细、工资个税明细、向非居民付款、暂时性差异、
 * 重大事项清单、关联交易、可比公司。按「角色 → 字段类型」的规格表统一解析，金额转最小货币单位整数，
 * 日期转 ISO，枚举列按 taxValueWords.json 规整；保留原表行号，结果都能追溯回「数据集 + 行号」。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauIssue, FauRptType, FauTaxInputKind } from '@totalclaw/ipc-contracts';
import { FAU_TAX_INPUT_KINDS } from '@totalclaw/ipc-contracts';
import type { SheetTable } from '../../serviceSettlement/excel';
import { HEADER_OFFSET, get, issue, toCents, toIsoDate, toNum } from './common';
import WORDS from './taxValueWords.json';

export type VatDirection = 'sales' | 'purchase';
export type VatCategory = 'standard' | 'zero' | 'exempt' | 'reverse_charge' | 'export' | 'import_customs' | 'out_of_scope';
export const VAT_CATEGORIES: VatCategory[] = ['standard', 'zero', 'exempt', 'reverse_charge', 'export', 'import_customs', 'out_of_scope'];
export type WhtType = 'management_fee' | 'royalty' | 'related_service' | 'rent' | 'technical_service' | 'freight_ticket' | 'telecom' | 'dividend' | 'interest' | 'insurance' | 'other';
export const WHT_TYPES: WhtType[] = ['management_fee', 'royalty', 'related_service', 'rent', 'technical_service', 'freight_ticket', 'telecom', 'dividend', 'interest', 'insurance', 'other'];
export type DisclosureType = 'transaction' | 'related_party' | 'guarantee' | 'litigation' | 'impairment' | 'other';

export interface VatLineRow {
  row: number;
  direction: VatDirection;
  date: string;
  docNo: string;
  counterparty: string;
  counterpartyVatNo: string;
  /** 不含税金额（最小货币单位） */
  net: number;
  vat: number;
  /** 小数，0.15 = 15%；没填为 null */
  rate: number | null;
  category: VatCategory | '';
  emirate: string;
  status: 'normal' | 'void' | 'red' | 'abnormal';
  invoiceType: 'vat_special' | 'vat_normal' | 'e_ticket' | '';
  /** 进项是否可抵扣；没填为 null（按「有税额即可抵扣」） */
  recoverable: boolean | null;
}
export interface IitRow {
  row: number; name: string; idNo: string;
  salary: number; insurance: number; special: number;
  ytdSalary: number; ytdInsurance: number; ytdSpecial: number; ytdTaxPaid: number; monthIndex: number;
}
export interface WhtRow { row: number; date: string; payee: string; country: string; paymentType: WhtType | ''; amount: number; docNo: string; withheld: number | null }
export interface TempDiffRow { row: number; item: string; cls: 'asset' | 'liability' | ''; carrying: number; taxBase: number }
export interface DisclosureEventRow {
  row: number; date: string; type: DisclosureType | ''; description: string; counterparty: string; amount: number;
  rpKind: 'natural' | 'legal' | ''; assetTotal: number | null; profit: number | null;
}
export interface RptRow { row: number; counterparty: string; jurisdiction: string; type: FauRptType | ''; amount: number; direction: 'in' | 'out' | ''; method: string }
export interface ComparableRow { row: number; name: string; year: string; revenue: number | null; operatingProfit: number | null; totalCost: number | null; pli: number | null }

export interface TaxDatasetRows {
  vat_lines: VatLineRow[];
  iit_rows: IitRow[];
  wht_payments: WhtRow[];
  temp_diffs: TempDiffRow[];
  disclosure_events: DisclosureEventRow[];
  rp_transactions: RptRow[];
  tp_comparables: ComparableRow[];
}

export const TAX_PARSED_KINDS: FauTaxInputKind[] = FAU_TAX_INPUT_KINDS;
export function isTaxKind(k: string): k is FauTaxInputKind {
  return (FAU_TAX_INPUT_KINDS as string[]).includes(k);
}

// ── 角色（列识别）与字段类型 ────────────────────────────────────────────

type FieldType = 'text' | 'cents' | 'centsOrNull' | 'date' | 'int' | 'rate' | 'bool' | { enum: keyof typeof WORDS };
interface FieldSpec { role: string; field: string; type: FieldType; label: string; required?: boolean }

const SPEC: Record<FauTaxInputKind, FieldSpec[]> = {
  vat_lines: [
    { role: 'vatDirection', field: 'direction', type: { enum: 'vatDirection' }, label: i18nKey('方向（销项 / 进项）'), required: true },
    { role: 'vatDate', field: 'date', type: 'date', label: i18nKey('开票日期'), required: true },
    { role: 'vatDocNo', field: 'docNo', type: 'text', label: i18nKey('发票号码') },
    { role: 'vatParty', field: 'counterparty', type: 'text', label: i18nKey('对方名称') },
    { role: 'vatPartyNo', field: 'counterpartyVatNo', type: 'text', label: i18nKey('对方税号') },
    { role: 'vatNet', field: 'net', type: 'cents', label: i18nKey('不含税金额'), required: true },
    { role: 'vatAmount', field: 'vat', type: 'cents', label: i18nKey('税额') },
    { role: 'vatRate', field: 'rate', type: 'rate', label: i18nKey('税率') },
    { role: 'vatCategory', field: 'category', type: { enum: 'vatCategory' }, label: i18nKey('计税类别') },
    { role: 'emirate', field: 'emirate', type: 'text', label: i18nKey('酋长国（阿联酋）') },
    { role: 'invoiceStatus', field: 'status', type: { enum: 'invoiceStatus' }, label: i18nKey('发票状态') },
    { role: 'invoiceType', field: 'invoiceType', type: { enum: 'invoiceType' }, label: i18nKey('发票类型（中国）') },
    { role: 'vatRecoverable', field: 'recoverable', type: 'bool', label: i18nKey('进项可抵扣') },
  ],
  iit_rows: [
    { role: 'name', field: 'name', type: 'text', label: i18nKey('姓名'), required: true },
    { role: 'idNo', field: 'idNo', type: 'text', label: i18nKey('证件号') },
    { role: 'salary', field: 'salary', type: 'cents', label: i18nKey('本月应发工资'), required: true },
    { role: 'insurance', field: 'insurance', type: 'cents', label: i18nKey('本月三险一金') },
    { role: 'special', field: 'special', type: 'cents', label: i18nKey('本月专项附加扣除') },
    { role: 'ytdSalary', field: 'ytdSalary', type: 'cents', label: i18nKey('此前累计收入') },
    { role: 'ytdInsurance', field: 'ytdInsurance', type: 'cents', label: i18nKey('此前累计三险一金') },
    { role: 'ytdSpecial', field: 'ytdSpecial', type: 'cents', label: i18nKey('此前累计专项附加扣除') },
    { role: 'ytdTaxPaid', field: 'ytdTaxPaid', type: 'cents', label: i18nKey('此前累计已预扣税额') },
    { role: 'monthIndex', field: 'monthIndex', type: 'int', label: i18nKey('本年第几个月') },
  ],
  wht_payments: [
    { role: 'whtDate', field: 'date', type: 'date', label: i18nKey('付款日期'), required: true },
    { role: 'payee', field: 'payee', type: 'text', label: i18nKey('收款方'), required: true },
    { role: 'payeeCountry', field: 'country', type: 'text', label: i18nKey('收款方国家') },
    { role: 'whtType', field: 'paymentType', type: { enum: 'whtType' }, label: i18nKey('付款类型'), required: true },
    { role: 'whtAmount', field: 'amount', type: 'cents', label: i18nKey('付款金额'), required: true },
    { role: 'whtDocNo', field: 'docNo', type: 'text', label: i18nKey('单据号') },
    { role: 'whtWithheld', field: 'withheld', type: 'centsOrNull', label: i18nKey('已扣缴税额') },
  ],
  temp_diffs: [
    { role: 'tdItem', field: 'item', type: 'text', label: i18nKey('项目'), required: true },
    { role: 'tdClass', field: 'cls', type: { enum: 'tdClass' }, label: i18nKey('资产 / 负债'), required: true },
    { role: 'tdCarrying', field: 'carrying', type: 'cents', label: i18nKey('账面价值'), required: true },
    { role: 'tdTaxBase', field: 'taxBase', type: 'cents', label: i18nKey('计税基础'), required: true },
  ],
  disclosure_events: [
    { role: 'eventDate', field: 'date', type: 'date', label: i18nKey('日期'), required: true },
    { role: 'eventType', field: 'type', type: { enum: 'eventType' }, label: i18nKey('事项类型'), required: true },
    { role: 'eventDesc', field: 'description', type: 'text', label: i18nKey('事项说明'), required: true },
    { role: 'eventParty', field: 'counterparty', type: 'text', label: i18nKey('对方') },
    { role: 'eventAmount', field: 'amount', type: 'cents', label: i18nKey('成交金额'), required: true },
    { role: 'rpKind', field: 'rpKind', type: { enum: 'rpKind' }, label: i18nKey('关联方类型（自然人 / 法人）') },
    { role: 'eventAssets', field: 'assetTotal', type: 'centsOrNull', label: i18nKey('涉及资产总额') },
    { role: 'eventProfit', field: 'profit', type: 'centsOrNull', label: i18nKey('交易产生的利润') },
  ],
  rp_transactions: [
    { role: 'rptParty', field: 'counterparty', type: 'text', label: i18nKey('关联方'), required: true },
    { role: 'rptCountry', field: 'jurisdiction', type: 'text', label: i18nKey('所在国家') },
    { role: 'rptType', field: 'type', type: { enum: 'rptType' }, label: i18nKey('交易类型'), required: true },
    { role: 'rptAmount', field: 'amount', type: 'cents', label: i18nKey('交易金额'), required: true },
    { role: 'rptDirection', field: 'direction', type: { enum: 'rptDirection' }, label: i18nKey('方向') },
    { role: 'rptMethod', field: 'method', type: 'text', label: i18nKey('定价方法') },
  ],
  tp_comparables: [
    { role: 'compName', field: 'name', type: 'text', label: i18nKey('可比公司'), required: true },
    { role: 'compYear', field: 'year', type: 'text', label: i18nKey('年度') },
    { role: 'compRevenue', field: 'revenue', type: 'centsOrNull', label: i18nKey('营业收入') },
    { role: 'compOp', field: 'operatingProfit', type: 'centsOrNull', label: i18nKey('营业利润') },
    { role: 'compCost', field: 'totalCost', type: 'centsOrNull', label: i18nKey('总成本') },
    { role: 'compPli', field: 'pli', type: 'rate', label: i18nKey('利润水平指标') },
  ],
};

export const TAX_KIND_ROLES: Record<FauTaxInputKind, { key: string; label: string; required?: boolean }[]> = Object.fromEntries(
  Object.entries(SPEC).map(([k, fs]) => [k, fs.map((f) => ({ key: f.role, label: f.label, required: f.required }))]),
) as Record<FauTaxInputKind, { key: string; label: string; required?: boolean }[]>;

// ── 取值规整 ──────────────────────────────────────────────────────────────

const VALUE_WORDS = WORDS as unknown as Record<string, Record<string, string[]>>;
const shortAscii = (w: string) => /^[A-Za-z0-9]{1,2}$/.test(w);

/** 枚举列规整：先整词精确匹配，再包含匹配（1–2 个字母的缩写只认精确） */
export function normEnum(group: string, raw: string): string {
  const v = String(raw || '').trim().toLowerCase();
  if (!v) return '';
  const table = VALUE_WORDS[group] || {};
  for (const [value, words] of Object.entries(table)) if (value === v || words.some((w) => w.toLowerCase() === v)) return value;
  for (const [value, words] of Object.entries(table)) if (words.some((w) => !shortAscii(w) && v.includes(w.toLowerCase()))) return value;
  return '';
}

/** 「15%」「15」「0.15」→ 0.15 */
export function toRate(raw: string): number | null {
  const n = toNum(raw);
  if (n == null) return null;
  return /%/.test(raw) || Math.abs(n) > 1 ? n / 100 : n;
}

function convert(type: FieldType, raw: string): unknown {
  if (typeof type === 'object') return normEnum(type.enum, raw);
  switch (type) {
    case 'cents': return toCents(raw);
    case 'centsOrNull': return raw.trim() ? toCents(raw) : null;
    case 'date': return toIsoDate(raw);
    case 'int': { const n = toNum(raw); return n == null ? 0 : Math.round(n); }
    case 'rate': return raw.trim() ? toRate(raw) : null;
    case 'bool': {
      if (!raw.trim()) return null;
      const b = normEnum('bool', raw);
      return b === 'yes' ? true : b === 'no' ? false : null;
    }
    default: return raw.trim();
  }
}

const DEFAULTS: Partial<Record<FauTaxInputKind, Record<string, unknown>>> = {
  vat_lines: { status: 'normal' },
};

export function parseTaxDataset(kind: FauTaxInputKind, t: SheetTable, mp: Record<string, string>): { rows: unknown[]; issues: FauIssue[] } {
  const specs = SPEC[kind];
  const rows: Record<string, unknown>[] = [];
  const badEnum: Record<string, number[]> = {};
  t.rows.forEach((r, i) => {
    if (!Object.values(r).some((v) => String(v ?? '').trim())) return;
    const row = i + HEADER_OFFSET;
    const out: Record<string, unknown> = { row };
    for (const s of specs) {
      const raw = get(r, mp, s.role);
      let v = convert(s.type, raw);
      if (typeof s.type === 'object' && raw && !v) (badEnum[s.role] ||= []).push(row);
      if (v === '' && DEFAULTS[kind]?.[s.field] !== undefined) v = DEFAULTS[kind]![s.field];
      out[s.field] = v;
    }
    rows.push(out);
  });
  const issues: FauIssue[] = [];
  for (const [role, rs] of Object.entries(badEnum)) {
    const spec = specs.find((s) => s.role === role)!;
    // 必需的枚举列认不出 → 阻断；可选的 → 提醒（按空值处理）
    // p0 是表里的列名（用户数据，原样显示）
    issues.push(issue(spec.required ? 'block' : 'warn', `bad_${role}`, i18nKey('{n} 行「{p0}」列的取值认不出'), { n: rs.length, p0: mp[role] || role }, rs));
  }
  return { rows, issues };
}
