/**
 * 沙特天课与外资部分所得税（纯函数，草稿口径，需当地专业人员复核）。
 *
 *   天课基数 = 加项（权益、准备、非流动负债，损益未结转时并入本年利润）− 减项（固定资产净值、无形资产、长期投资），
 *            且不低于调整后净利润（会计利润 + 人工调整），不为负；
 *   天课 = 基数 × 天课率 × 沙特 / 海湾国家股东持股比例；
 *     回历年按 sa.zakat_rate（2.5%），公历年按 2.5% × 会计年度天数 / sa.zakat_hijri_year_days（354）折算；
 *   外资部分所得税 = 调整后净利润 × 外资持股比例 × sa.cit_rate_nonsaudi（20%），亏损为 0。
 * 每个加减项都带余额表行号，可追溯到来源行。
 */
import type { FauZakatCategory, FauZakatItem, FauZakatResult } from '@totalclaw/ipc-contracts';
import MAP from './zakatMap.json';
import { plNotClosed, profitBeforeTax, type ClassifiedTbRow } from './common';

const M = MAP as unknown as { byLine: Record<string, FauZakatCategory>; provisionWords: string[]; longTermWords: string[]; liabilityLines: string[] };
const has = (name: string, words: string[]) => words.some((w) => name.toLowerCase().includes(w.toLowerCase()));

/** 自动归类：负债按「准备 / 长期」关键词细分，其余按报表行；认不出的不计入（界面提醒人工确认） */
export function zakatCategory(r: ClassifiedTbRow): FauZakatCategory {
  if (r.cls === 'liability') {
    if (has(r.accountName, M.provisionWords)) return 'add_provision';
    if (M.byLine[r.line] === 'add_liability' || has(r.accountName, M.longTermWords)) return 'add_liability';
    return 'none';
  }
  if (r.cls === 'equity') return 'add_equity';
  if (r.cls === 'asset') {
    const c = M.byLine[r.line];
    return c && c.startsWith('deduct_') ? c : 'none';
  }
  return 'none';
}

export interface ZakatInput {
  rows: ClassifiedTbRow[];
  /** 人工改过的归类：科目编码（没有编码用名称）→ 类别 */
  overrides: Record<string, FauZakatCategory>;
  /** 调整后净利润的人工调整（不可扣除的准备、罚款等，带符号） */
  profitAdjust: number;
  yearBasis: 'hijri' | 'gregorian';
  fiscalDays: number;
  /** 沙特 / 海湾国家股东持股比例（0–1） */
  saudiShare: number;
  /** 回历年天课率（小数） */
  zakatRate: number;
  hijriYearDays: number;
  /** 外资部分所得税率（小数） */
  citRate: number;
}

export function zakatBase(input: ZakatInput): FauZakatResult {
  const items: FauZakatItem[] = [];
  for (const r of input.rows) {
    // 损益类不进加减项（走调整后净利润）；没有余额的不列
    if (r.cls === 'revenue' || r.cls === 'expense') continue;
    const net = r.closingDr - r.closingCr;
    if (net === 0) continue;
    const id = r.accountCode || r.accountName;
    const manual = input.overrides[id];
    const category = manual || zakatCategory(r);
    const amount = category.startsWith('add_') ? -net : net;
    items.push({ row: r.row, accountCode: r.accountCode, accountName: r.accountName, category, amount, source: manual ? 'manual' : 'auto' });
  }
  const pl = profitBeforeTax(input.rows);
  // 损益还没结转到权益：本年利润并入权益加项（已结转的话留存收益里已经有了）
  const currentProfit = plNotClosed(input.rows) ? pl.profit : 0;
  const additions = items.filter((i) => i.category.startsWith('add_')).reduce((s, i) => s + i.amount, 0) + currentProfit;
  const deductions = items.filter((i) => i.category.startsWith('deduct_')).reduce((s, i) => s + i.amount, 0);
  const computedBase = additions - deductions;
  const adjustedProfit = pl.profit + input.profitAdjust;
  const base = Math.max(computedBase, adjustedProfit, 0);
  const rate = input.yearBasis === 'hijri' ? input.zakatRate : (input.zakatRate * input.fiscalDays) / input.hijriYearDays;
  const share = Math.min(Math.max(input.saudiShare, 0), 1);
  const zakatDue = Math.round(base * rate * share);
  const nonSaudiTaxable = Math.max(0, Math.round(adjustedProfit * (1 - share)));
  return {
    items, additions, deductions, currentProfit, profitRows: pl.rows, computedBase, adjustedProfit, base,
    floorApplied: base !== computedBase, yearBasis: input.yearBasis, fiscalDays: input.fiscalDays, rate, saudiShare: share,
    zakatDue, nonSaudiTaxable, nonSaudiCit: Math.round(nonSaudiTaxable * input.citRate),
  };
}
