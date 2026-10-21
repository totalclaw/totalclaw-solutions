/**
 * 会计核算引擎共用的小工具（纯函数）：期间、科目性质、顶层科目、金额换算、关键词。
 * 金额一律最小货币单位整数（分）；给人看 / 给回核用时才换算成元。
 */
import type { FauAccountClass, FauAccountMapEntry, FauMsg } from '@totalclaw/ipc-contracts';
import { plNature } from '../../../financeAgent/common';
import type { TbRow } from '../../types';
import KW from './keywords.json';

export const KEYWORDS = KW;

export function msg(key: string, params?: Record<string, string | number>): FauMsg {
  return params ? { key, params } : { key };
}

/** 分 → 元（两位小数的数字，给人看 / 回核用） */
export function yuan(cents: number): number {
  return Math.round(cents) / 100;
}

/** 分 → 「12,345.67」 */
export function fmtYuan(cents: number): string {
  return yuan(cents).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function periodStart(period: string): string {
  return `${period}-01`;
}

export function periodEnd(period: string): string {
  const [y, m] = period.split('-').map(Number);
  const d = new Date(Date.UTC(y, m, 0));
  return `${period}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function inPeriod(date: string, period: string): boolean {
  return !!date && date.slice(0, 7) === period;
}

export function addMonths(period: string, n: number): string {
  const [y, m] = period.split('-').map(Number);
  const t = y * 12 + (m - 1) + n;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`;
}

/** 起止期间（含）共几个月；不合法返回 0 */
export function monthsBetween(start: string, end: string): number {
  if (!/^\d{4}-\d{2}$/.test(start) || !/^\d{4}-\d{2}$/.test(end)) return 0;
  const [ys, ms] = start.split('-').map(Number);
  const [ye, me] = end.split('-').map(Number);
  return (ye * 12 + me) - (ys * 12 + ms) + 1;
}

export function daysBetween(a: string, b: string): number {
  const ta = Date.parse(`${a}T00:00:00Z`);
  const tb = Date.parse(`${b}T00:00:00Z`);
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return 0;
  return Math.round((tb - ta) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const t = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(t)) return date;
  return new Date(t + days * 86_400_000).toISOString().slice(0, 10);
}

/** a 之后到 b 之间的工作日（周一到周五）数；shortcut: 不认法定节假日，接入地区日历后再改 */
export function workdaysBetween(a: string, b: string): number {
  let n = 0;
  for (let d = addDays(a, 1); d <= b; d = addDays(d, 1)) {
    const wd = new Date(`${d}T00:00:00Z`).getUTCDay();
    if (wd !== 0 && wd !== 6) n += 1;
  }
  return n;
}

export function hasAny(text: string, words: string[]): boolean {
  const t = String(text || '').toLowerCase();
  return words.some((w) => w && t.includes(w.toLowerCase()));
}

/** 科目编码是否属于 parent（编码前缀，忽略 . - 分隔） */
export function codeUnder(code: string, parent: string): boolean {
  const c = String(code || '').replace(/[.\-\s]/g, '');
  const p = String(parent || '').replace(/[.\-\s]/g, '');
  return !!p && c.startsWith(p);
}

/** 只留顶层科目：有编码时去掉被别的编码作前缀的行；没编码的保留（避免父子科目重复计数） */
export function topLevel(tb: TbRow[]): TbRow[] {
  const codes = tb.map((r) => r.accountCode).filter(Boolean);
  return tb.filter((r) => !r.accountCode || !codes.some((c) => c !== r.accountCode && codeUnder(r.accountCode, c)));
}

/** 科目性质：先看科目映射，其次中国口径按名称 / 编码首位，IFRS 口径按英文关键词 / 编码首位 */
export function accountNature(
  code: string, name: string, basis: 'cn' | 'ifrs', accountMap: FauAccountMapEntry[] = [],
): FauAccountClass | '' {
  const mapped = accountMap.find((e) => e.code && (e.code === code || codeUnder(code, e.code)) && e.cls);
  if (mapped) return mapped.cls;
  const n = String(name || '');
  if (basis === 'cn') {
    const pl = plNature(n.split(/[-_/\\—]/)[0]);
    if (pl === 'income') return 'revenue';
    if (pl === 'expense') return 'expense';
    const first = String(code || '').charAt(0);
    if (first === '1') return 'asset';
    if (first === '2') return 'liability';
    if (first === '3') return 'common';
    if (first === '4') return 'equity';
    if (first === '5') return 'expense';
    if (first === '6') return /^6(0|1|3)/.test(code) ? 'revenue' : 'expense';
    return '';
  }
  const nat = KEYWORDS.ifrsNature as Record<string, string[]>;
  // 顺序有讲究：先认收入 / 费用 / 权益，「tax payable」这类再落到负债
  for (const cls of ['revenue', 'equity', 'liability', 'expense', 'asset'] as const) {
    if (hasAny(n, nat[cls])) return cls;
  }
  const first = String(code || '').charAt(0);
  return ({ '1': 'asset', '2': 'liability', '3': 'equity', '4': 'revenue' } as Record<string, FauAccountClass>)[first]
    || (/[5-9]/.test(first) ? 'expense' : '');
}

/** 余额按性质取正：资产 / 费用 借减贷；负债 / 权益 / 收入 贷减借 */
export function signedBalance(cls: FauAccountClass | '', dr: number, cr: number): number {
  return cls === 'asset' || cls === 'expense' || cls === 'common' || cls === '' ? dr - cr : cr - dr;
}

/** 损益类本期发生按「收入取贷方、成本费用取借方」，与财务智能体 buildStatements 同口径（结转分录在另一边，不影响） */
export function periodAmount(cls: FauAccountClass | '', r: Pick<TbRow, 'periodDr' | 'periodCr' | 'closingDr' | 'closingCr'>): number {
  if (cls === 'revenue') return r.periodCr;
  if (cls === 'expense') return r.periodDr;
  return signedBalance(cls, r.closingDr, r.closingCr);
}
