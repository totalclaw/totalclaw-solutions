/**
 * B4 基金模式：LP 资本账户独立重算（nav-tieout，纯函数）。NAV 包是真实来源，LP 对账单是被测对象。
 *
 *   期末资本 = 期初 + 本期出资 − 本期分配 + LP 比例 × (已实现 + 未实现 − 管理费 − 基金费用) − 附带权益
 * 逐行比较（容差 0.01）；另核「全部 LP 期末资本合计 = 基金净值」。不改对账单，只给放行 / 暂扣建议。
 */
import type { FauNavLine, FauNavLineId, FauNavLp } from '@totalclaw/ipc-contracts';
import { NAV_FUND_ITEMS, toCents, toRate, type ParsedTable } from '../table';

export interface LpFigures { beginning: number; contributions: number; distributions: number; allocatedPnl: number; carry: number; ending: number }
export interface NavLpFigures { pct: number; beginning: number; contributions: number; distributions: number; carry: number }
export interface NavFund { realized: number; unrealized: number; managementFee: number; fundExpenses: number; fundNav: number | null }

const id = (s: string) => s.replace(/\s+/g, '').toUpperCase();

export function parseLpStatements(p: ParsedTable): Map<string, LpFigures> {
  const out = new Map<string, LpFigures>();
  for (const r of p.rows) {
    const k = id(r.get('lpId'));
    if (!k) continue;
    out.set(k, { beginning: toCents(r.get('beginning')), contributions: toCents(r.get('contributions')), distributions: toCents(r.get('distributions')), allocatedPnl: toCents(r.get('allocatedPnl')), carry: toCents(r.get('carry')), ending: toCents(r.get('ending')) });
  }
  return out;
}

export function parseNavLp(p: ParsedTable): Map<string, NavLpFigures> {
  const out = new Map<string, NavLpFigures>();
  for (const r of p.rows) {
    const k = id(r.get('lpId'));
    if (!k) continue;
    out.set(k, { pct: toRate(r.get('pct')) ?? 0, beginning: toCents(r.get('beginning')), contributions: toCents(r.get('contributions')), distributions: toCents(r.get('distributions')), carry: toCents(r.get('carry')) });
  }
  return out;
}

export function parseNavFund(p: ParsedTable): { fund: NavFund; missing: string[] } {
  const fund: NavFund = { realized: 0, unrealized: 0, managementFee: 0, fundExpenses: 0, fundNav: null };
  const seen = new Set<string>();
  const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  for (const r of p.rows) {
    const item = norm(r.get('item'));
    if (!item) continue;
    // 精确匹配优先（「费用」与「基金费用」「管理费」不要互相抢）
    const keys = Object.keys(NAV_FUND_ITEMS) as Array<keyof NavFund>;
    const k = keys.find((x) => NAV_FUND_ITEMS[x].some((w) => norm(w) === item)) || keys.find((x) => NAV_FUND_ITEMS[x].some((w) => item.includes(norm(w))));
    if (!k || seen.has(k)) continue;
    seen.add(k);
    const v = toCents(r.get('value'));
    // 管理费与基金费用按成本取正数，损益与净值保留符号
    (fund as unknown as Record<string, number>)[k] = k === 'managementFee' || k === 'fundExpenses' ? Math.abs(v) : v;
  }
  const missing = ['realized', 'unrealized', 'managementFee', 'fundExpenses'].filter((k) => !seen.has(k));
  return { fund, missing };
}

export function tieOut(stmts: Map<string, LpFigures>, nav: Map<string, NavLpFigures>, fund: NavFund, tol: number): { lps: FauNavLp[]; sumEnding: number; navTies: boolean } {
  const ids = [...new Set([...nav.keys(), ...stmts.keys()])].sort();
  const pnl = fund.realized + fund.unrealized - fund.managementFee - fund.fundExpenses;
  const lps: FauNavLp[] = ids.map((lpId) => {
    const s = stmts.get(lpId);
    const n = nav.get(lpId);
    const allocated = n ? Math.round(n.pct * pnl) : 0;
    const rec: Record<FauNavLineId, number> = n
      ? { beginning: n.beginning, contributions: n.contributions, distributions: n.distributions, allocatedPnl: allocated, carry: n.carry, ending: n.beginning + n.contributions - n.distributions + allocated - n.carry }
      : { beginning: 0, contributions: 0, distributions: 0, allocatedPnl: 0, carry: 0, ending: 0 };
    const lines: FauNavLine[] = (Object.keys(rec) as FauNavLineId[]).map((line) => {
      const statement = s ? s[line] : 0;
      const diff = statement - rec[line];
      return { line, statement, recomputed: rec[line], diff, ok: !!s && !!n && Math.abs(diff) <= tol };
    });
    const ok = lines.every((l) => l.ok);
    return { lpId, pct: n?.pct ?? 0, ok, lines, decision: ok ? 'release' : 'hold' };
  });
  const sumEnding = lps.reduce((a, x) => a + (x.lines.find((l) => l.line === 'ending')?.recomputed || 0), 0);
  const navTies = fund.fundNav === null ? true : Math.abs(sumEnding - fund.fundNav) <= tol * Math.max(1, lps.length);
  return { lps, sumEnding, navTies };
}
