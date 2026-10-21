/**
 * 财务智能体 · 公共小工具：金额（按分取整）、日期、科目表、费用归类、原文核对。
 *
 * 金额全部在这一层算；模型只负责从单据里抄字段、写文字。
 */
import { randomUUID } from 'node:crypto';
import type { FaAccount } from '@totalclaw/ipc-contracts';
import CHART from './chart.json';
import CATEGORY from './categoryRules.json';
import RADICALS from './radicalMap.json';

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

/** 四舍五入到分 */
export function round2(n: number): number {
  const v = Number(n) || 0;
  return Math.round((v + (v >= 0 ? Number.EPSILON : -Number.EPSILON)) * 100) / 100;
}

export function sum(values: number[]): number {
  // 按分累加，避免 0.1 + 0.2 这类误差
  return values.reduce((acc, v) => acc + Math.round((Number(v) || 0) * 100), 0) / 100;
}

export function fmt(n: number): string {
  return round2(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function pct(n: number, digits = 2): string {
  return `${(n * 100).toFixed(digits)}%`;
}

/** 表格里的金额：去千分位、货币符号、括号负数 */
export function toAmount(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  let s = String(v ?? '').trim();
  if (!s) return 0;
  const neg = /^\(.*\)$/.test(s) || /^-/.test(s);
  s = s.replace(/[(),，¥￥$\s元]/g, '').replace(/^-/, '');
  const n = Number(s);
  return Number.isFinite(n) ? (neg ? -n : n) : 0;
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function localDate(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 各种日期写法 → YYYY-MM-DD；认不出返回 '' */
export function normDate(v: unknown): string {
  if (v == null || v === '') return '';
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    // Excel 序列日期
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) return localDate(v);
  const s = String(v).trim();
  const m = s.match(/(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})/);
  if (m) return `${m[1]}-${pad2(Number(m[2]))}-${pad2(Number(m[3]))}`;
  const c = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (c) return `${c[1]}-${c[2]}-${c[3]}`;
  return '';
}

export function daysBetween(a: string, b: string): number {
  const ta = Date.parse(`${a}T00:00:00`);
  const tb = Date.parse(`${b}T00:00:00`);
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return 0;
  return Math.round((tb - ta) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const t = Date.parse(`${date}T00:00:00`);
  if (!Number.isFinite(t)) return date;
  return localDate(new Date(t + days * 86_400_000));
}

export function periodOf(date: string): string {
  return /^\d{4}-\d{2}/.test(date) ? date.slice(0, 7) : '';
}

// ─── 科目表 ──────────────────────────────────────────────────────────────

export const ACCOUNTS: FaAccount[] = (CHART.accounts as string[][]).map(([code, name, type, side]) => ({
  code, name, type: type as FaAccount['type'], side: side as FaAccount['side'],
}));

const BY_CODE = new Map(ACCOUNTS.map((a) => [a.code, a]));

export function account(code: string): FaAccount {
  const a = BY_CODE.get(code);
  if (!a) throw new Error(`unknown account ${code}`);
  return a;
}

export function accountByName(name: string): FaAccount | undefined {
  const n = String(name || '').trim();
  return ACCOUNTS.find((a) => a.name === n) || ACCOUNTS.find((a) => a.name.endsWith(`-${n}`));
}

// ─── 费用归类 ────────────────────────────────────────────────────────────

export interface CategoryRule { category: string; account: string; keywords: string[] }

export const CATEGORY_RULES: CategoryRule[] = CATEGORY.rules as CategoryRule[];
export const CATEGORY_FALLBACK: { category: string; account: string } = CATEGORY.fallback;

export function categoryNames(): string[] {
  return [...CATEGORY_RULES.map((r) => r.category), CATEGORY_FALLBACK.category];
}

/** 按关键词归类；都不命中返回 null（交给模型或人） */
export function classifyByKeywords(text: string): CategoryRule | null {
  const t = String(text || '');
  if (!t) return null;
  for (const r of CATEGORY_RULES) {
    if (r.keywords.some((k) => t.includes(k))) return r;
  }
  return null;
}

export function accountForCategory(category: string): FaAccount {
  const r = CATEGORY_RULES.find((x) => x.category === category);
  return account(r?.account || CATEGORY_FALLBACK.account);
}

// ─── 原文核对 ────────────────────────────────────────────────────────────

export function normalizeForMatch(s: string): string {
  return String(s || '').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
}

/** 模型给的引用 / 字段值要在原文里真的找得到 */
export function foundIn(corpus: string, quote: string | undefined): boolean {
  const q = normalizeForMatch(quote || '');
  if (q.length < 2) return false;
  return normalizeForMatch(corpus).includes(q);
}

/** 金额在原文里出现过（容许千分位、¥、多一位小数 0） */
export function amountFoundIn(corpus: string, n: number): boolean {
  if (!Number.isFinite(n) || n === 0) return false;
  const plain = String(corpus || '').replace(/[,，\s¥￥]/g, '');
  const a = Math.abs(n);
  return [a.toFixed(2), String(a), a.toFixed(1)].some((s) => plain.includes(s));
}

export function sameCompany(a?: string, b?: string): boolean {
  const x = normalizeForMatch(a || '').replace(/有限责任公司$|有限公司$|股份有限公司$/u, '');
  const y = normalizeForMatch(b || '').replace(/有限责任公司$|有限公司$|股份有限公司$/u, '');
  return !!x && x === y;
}

// ─── 按科目名称判断性质（小企业准则与企业准则编码不同，名称是共同口径） ─────

const INCOME_RE = /^(主营业务收入|其他业务收入|投资收益|营业外收入|公允价值变动损益|其他收益|资产处置收益)/;
const EXPENSE_RE = /^(主营业务成本|其他业务成本|税金及附加|营业税金及附加|销售费用|管理费用|财务费用|研发费用|营业外支出|资产减值损失|信用减值损失|所得税费用)/;

/** 损益类：income = 收入类（贷方增加），expense = 成本费用类（借方增加） */
export function plNature(name: string): 'income' | 'expense' | null {
  const n = String(name || '').trim();
  if (INCOME_RE.test(n)) return 'income';
  if (EXPENSE_RE.test(n)) return 'expense';
  return null;
}

export function isIncomeTaxExpense(name: string): boolean {
  return /^所得税费用/.test(String(name || '').trim());
}

// ─── PDF 文字归一 ────────────────────────────────────────────────────────

/**
 * CJK 部首补充区（U+2E80–2EFF）的字 NFKC 不会还原，PDF 字体子集里却很常见（实测合同里「人民币」成了「人 ⺠币」）。
 * 这里列的是简体常用字对应的部首补充字符；康熙部首（U+2F00–2FDF）交给 NFKC。
 */
const RADICAL_SUPPLEMENT: Record<string, string> = Object.fromEntries(Object.entries(RADICALS.map as Record<string, string>).map(([k, v]) => [String.fromCharCode(parseInt(k.replace(/^U\+/, ""), 16)), v]));
const RADICAL_RE = /[\u2E80-\u2EFF]/g;

export function normalizePdfText(text: string): string {
  return String(text || '').normalize('NFKC').replace(RADICAL_RE, (c) => RADICAL_SUPPLEMENT[c] || c)
    // 部首替换后「人 民币」这种字间多出的单个空格去掉（只去两个汉字之间的）
    .replace(/(?<=[\u4e00-\u9fff]) (?=[\u4e00-\u9fff])/g, '');
}
