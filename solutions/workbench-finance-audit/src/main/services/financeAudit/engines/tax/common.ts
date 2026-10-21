/**
 * 税务组共用（纯函数为主）：地区规则（RegionRule，按税期结束日取生效版本、记下用到的规则与审核状态）、
 * 税期与会计年度、科目大类（公司档案映射优先，其次自动识别）、回历日期。
 *
 * 税率与期限只来自规则表（第 13.4 节）；规则未经当地专业人员审核（review.status=authoritative）前，
 * 结果一律标「草稿口径，需当地专业人士复核」。
 */
import { i18nKey, setLocale, getLocale, type SupportedLocale } from '@totalclaw/i18n';
import { resolveRule, type RegionRule } from '@totalclaw/core-domain';
import type { FauAccountClass, FauCompany, FauRuleUse, FauStandard } from '@totalclaw/ipc-contracts';
import SEED from '../../../processLibrary/seeds/region-rules.json';
import { mapAccounts } from '../../accountMap';
import { FauStepError } from '../../skillRunner';
import type { TbRow } from '../../types';
import { addMonths, periodEnd } from '../accounting/common';

// ── 地区规则 ──────────────────────────────────────────────────────────────

const SEED_RULES = SEED as unknown as RegionRule[];
let ruleSource: () => RegionRule[] = () => SEED_RULES;

/** 主进程注册时换成「内置 + 企业改动」（processLibrary 的 regionRulesForCurrentUser）；测试用内置表 */
export function setRuleSource(fn: () => RegionRule[]): void {
  ruleSource = fn;
}

export function allRules(): RegionRule[] {
  try { return ruleSource(); } catch { return SEED_RULES; }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
/** 与 isRegionAuthoritative 同口径：当地专业人员审核过才算权威 */
export function isReviewed(r: RegionRule): boolean {
  const rv = (r as unknown as { review?: { status?: string; reviewer?: string; role?: string; reviewedAt?: string } | null }).review;
  return !!(rv && rv.status === 'authoritative' && rv.reviewer && rv.role && DATE_RE.test(String(rv.reviewedAt || '')));
}

export function ruleUse(r: RegionRule): FauRuleUse {
  return {
    id: r.id, jurisdiction: r.jurisdiction, label: r.label, value: r.value, unit: r.unit, version: r.version,
    effectiveFrom: r.effectiveFrom, effectiveTo: r.effectiveTo, source: { ...r.source }, translations: r.translations, reviewed: isReviewed(r),
  };
}

/** 一次运行里取规则：按税期结束日取生效版本，并记下用到了哪些（写进结果与产出的「规则与出处」） */
export class RuleBook {
  private used = new Map<string, FauRuleUse>();
  constructor(private readonly rules: RegionRule[], readonly asOf: string, readonly jurisdiction: string) {}

  find(id: string): RegionRule | null {
    const r = resolveRule(this.rules, id, { today: this.asOf, jurisdiction: [this.jurisdiction] });
    if (r) this.used.set(r.id, ruleUse(r));
    return r;
  }

  get(id: string): RegionRule {
    const r = this.find(id);
    if (!r) throw new FauStepError(i18nKey('地区规则 {p0} 在 {p1} 没有生效的版本，请在流程库的地区规则表里补上'), { p0: id, p1: this.asOf });
    return r;
  }

  num(id: string): number {
    const v = Number(this.get(id).value);
    if (!Number.isFinite(v)) throw new FauStepError(i18nKey('地区规则 {p0} 的取值不是数字'), { p0: id });
    return v;
  }

  /** 单位是 % 的规则 → 小数 */
  rate(id: string): number {
    return this.num(id) / 100;
  }

  uses(): FauRuleUse[] {
    return [...this.used.values()];
  }

  /** 用到的规则里有未审核的 → 草稿口径 */
  draft(): boolean {
    return [...this.used.values()].some((u) => !u.reviewed);
  }
}

// ── 期间 ──────────────────────────────────────────────────────────────────

/** 税期：YYYY-MM / YYYY-Qn / YYYY（会计年度，按公司档案的起始月） */
export interface TaxPeriod { label: string; from: string; to: string; days: number }

function lastDay(ym: string): string {
  return periodEnd(ym);
}

export function taxPeriod(period: string, fiscalYearStartMonth = 1): TaxPeriod {
  const days = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000) + 1;
  const q = period.match(/^(\d{4})-Q([1-4])$/);
  if (q) {
    const start = `${q[1]}-${String((Number(q[2]) - 1) * 3 + 1).padStart(2, '0')}`;
    const end = addMonths(start, 2);
    return { label: period, from: `${start}-01`, to: lastDay(end), days: days(`${start}-01`, lastDay(end)) };
  }
  if (/^\d{4}-\d{2}$/.test(period)) return { label: period, from: `${period}-01`, to: lastDay(period), days: days(`${period}-01`, lastDay(period)) };
  if (/^\d{4}$/.test(period)) {
    const m = Math.min(Math.max(Math.floor(fiscalYearStartMonth) || 1, 1), 12);
    // 会计年度以「起始月所在年」命名：2025 年度、起始 4 月 = 2025-04-01 ~ 2026-03-31
    const start = `${period}-${String(m).padStart(2, '0')}`;
    const end = addMonths(start, 11);
    return { label: period, from: `${start}-01`, to: lastDay(end), days: days(`${start}-01`, lastDay(end)) };
  }
  throw new FauStepError(i18nKey('税期格式不对：用 YYYY-MM、YYYY-Qn 或 YYYY'));
}

export function inRange(date: string, p: TaxPeriod): boolean {
  return !!date && date >= p.from && date <= p.to;
}

/** 某日期所在月的下一个月的第 n 天 */
export function dayOfNextMonth(date: string, n: number): string {
  const next = addMonths(date.slice(0, 7), 1);
  const last = Number(lastDay(next).slice(8));
  return `${next}-${String(Math.min(n, last)).padStart(2, '0')}`;
}

export function addDaysUtc(date: string, n: number): string {
  const t = Date.parse(`${date}T00:00:00Z`) + n * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** 日期加 n 个月后那个月的最后一天（如阿联酋企业所得税：税期结束后 9 个月内） */
export function endOfMonthAfter(date: string, months: number): string {
  return lastDay(addMonths(date.slice(0, 7), months));
}

/** 回历日期（乌姆古拉历），只在沙特档案下作附加列显示；西方阿拉伯数字，YYYY-MM-DD */
export function hijriOf(iso: string): string {
  if (!DATE_RE.test(iso)) return '';
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' })
      .formatToParts(new Date(`${iso}T00:00:00Z`));
    const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
    const y = get('year').replace(/\D/g, '');
    return y ? `${y}-${get('month')}-${get('day')}` : '';
  } catch { return ''; }
}

// ── 科目大类 ──────────────────────────────────────────────────────────────

export interface ClassifiedTbRow extends TbRow { cls: FauAccountClass | ''; line: string }

/** 公司档案里确认过的映射优先，其次按编码 / 名称自动识别（与配置向导同一套 mapAccounts） */
export function classifyTb(rows: TbRow[], company: Pick<FauCompany, 'accountMap'>, standard: FauStandard): ClassifiedTbRow[] {
  const known = new Map<string, { cls: FauAccountClass | ''; line: string }>();
  for (const e of company.accountMap || []) known.set(e.code || e.name, { cls: e.cls, line: e.line });
  const auto = mapAccounts(rows, standard, []).entries;
  const autoBy = new Map(auto.map((e) => [e.code || e.name, e]));
  return rows.map((r) => {
    const id = r.accountCode || r.accountName;
    const k = known.get(id) || autoBy.get(id);
    return { ...r, cls: k?.cls || '', line: k?.line || '' };
  });
}

const TAX_LINE = new Set(['tax', 'incomeTax']);
/** 所得税 / 天课费用科目（算税前利润时排除） */
export function isTaxExpenseLine(r: ClassifiedTbRow): boolean {
  return TAX_LINE.has(r.line) || /所得税费用|income tax|zakat|مصروف الزكاة|ضريبة الدخل/i.test(r.accountName);
}

/** 本期（年度余额表即全年）损益：收入 − 费用，不含所得税与天课费用；返回用到的行号 */
export function profitBeforeTax(rows: ClassifiedTbRow[]): { revenue: number; expense: number; profit: number; rows: number[] } {
  let revenue = 0;
  let expense = 0;
  const used: number[] = [];
  for (const r of rows) {
    if (r.cls === 'revenue') { revenue += r.periodCr - r.periodDr; used.push(r.row); }
    else if (r.cls === 'expense' && !isTaxExpenseLine(r)) { expense += r.periodDr - r.periodCr; used.push(r.row); }
  }
  return { revenue, expense, profit: revenue - expense, rows: used };
}

/** 损益类科目期末还有余额 = 本年利润尚未结转到权益 */
export function plNotClosed(rows: ClassifiedTbRow[]): boolean {
  return rows.some((r) => (r.cls === 'revenue' || r.cls === 'expense') && (r.closingDr !== 0 || r.closingCr !== 0));
}

// ── 语言 ──────────────────────────────────────────────────────────────────

/**
 * 按输出语言跑一段同步计算：财务智能体 tax.ts 的公式行与风险提示用的是当前界面语言（t），
 * 这里在同步调用期间临时切到输出语言再切回（单线程同步执行，没有别的代码能在中间读到）。
 */
export function withLocale<T>(locale: SupportedLocale, fn: () => T): T {
  const prev = getLocale();
  if (prev === locale) return fn();
  setLocale(locale);
  try { return fn(); } finally { setLocale(prev); }
}

/** 运行参数里的金额（主单位，界面填的）→ 最小货币单位 */
export function paramCents(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[,\s]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function paramRatio(v: unknown, dflt: number): number {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[%\s]/g, ''));
  if (!Number.isFinite(n) || String(v ?? '').trim() === '') return dflt;
  return n > 1 ? n / 100 : n;
}
