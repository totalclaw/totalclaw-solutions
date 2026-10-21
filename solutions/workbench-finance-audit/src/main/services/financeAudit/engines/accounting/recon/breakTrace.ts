/**
 * A2 重大差异追根因（break-trace）的纯函数部分：挑出要追的差异、给回核用的事实集合、回核模型给的根因。
 * 模型调用由 skillRunner 做（不给工具、输出过 schema）；这里只判它说的单号 / 金额 / 日期在不在两边原始行里
 * （对应源项目的 critic）。根因句里引用了数据里没有的东西 → 打回（rejected）。
 */
import type { FauBreakAction, FauBreakTrace, FauGlSubBreak, FauGlSubResult } from '@totalclaw/ipc-contracts';
import type { LedgerExtractRow } from '../../../types';
import { verifyNarrative } from '../../../verify';
import { yuan } from '../common';

export const BREAK_ACTIONS: FauBreakAction[] = ['adjust_gl', 'adjust_subledger', 'wait_timing', 'investigate', 'remap', 'escalate'];

export function majorBreaks(result: FauGlSubResult, th: Record<string, number> = {}): FauGlSubBreak[] {
  const major = th['glsub.majorDiff'];
  return result.breaks.filter((b) => b.cls !== 'matched' && (major == null ? b.major : Math.abs(b.diff) >= major));
}

export interface BreakFacts { amounts: number[]; refs: string[]; dates: string[] }

/** 两边原始行里能引用的数字（元）、单号 / 键、日期 */
export function breakFacts(brk: FauGlSubBreak, glRows: LedgerExtractRow[], subRows: LedgerExtractRow[]): BreakFacts {
  const rows = [...glRows.filter((r) => brk.glRows.includes(r.row)), ...subRows.filter((r) => brk.subRows.includes(r.row))];
  const amounts = [brk.glAmount, brk.subAmount, brk.diff, ...rows.map((r) => r.amount)].map(yuan);
  for (const r of rows) {
    if (r.fxAmount != null) amounts.push(yuan(r.fxAmount));
    if (r.quantity != null) amounts.push(r.quantity);
  }
  if (brk.glFx != null) amounts.push(yuan(brk.glFx));
  if (brk.subFx != null) amounts.push(yuan(brk.subFx));
  if (brk.glFx != null && brk.subFx != null) amounts.push(yuan(brk.glFx - brk.subFx));
  const refs = [brk.key, ...rows.map((r) => r.key), ...rows.map((r) => r.docNo)].filter(Boolean);
  const dates = [brk.glDate, brk.subDate, ...rows.map((r) => r.date)].filter(Boolean);
  return { amounts, refs, dates: [...new Set(dates)] };
}

/**
 * 回核一条根因。expectedClearDate 是预计日期，本来就不在数据里，不回核；
 * action 必须在枚举里（模型自造的动作一律打回）。
 */
export function verifyBreakTrace(
  trace: { rootCause: string; owner: string; expectedClearDate: string; action: string },
  facts: BreakFacts,
): FauBreakTrace {
  const check = verifyNarrative(trace.rootCause, facts);
  const actionOk = (BREAK_ACTIONS as string[]).includes(trace.action);
  const missing = [...check.missing, ...(actionOk ? [] : [`action:${trace.action}`])];
  return {
    rootCause: trace.rootCause,
    owner: trace.owner,
    expectedClearDate: trace.expectedClearDate,
    action: (actionOk ? trace.action : 'investigate') as FauBreakAction,
    status: missing.length || !trace.rootCause.trim() ? 'rejected' : 'verified',
    missing: missing.length ? missing : undefined,
  };
}
