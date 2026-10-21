/**
 * A2 对账中心交给模型的任务指令（模型可见文本，不是界面文案；本目录在 i18n codemod 里整目录豁免）。
 * break-trace 只诊断：模型拿两边原始行写一句根因，代码复核（critic）引用的单号 / 金额 / 日期必须在数据里。
 */
import { z } from 'zod';

export const BREAK_ACTIONS = ['adjust_gl', 'adjust_subledger', 'wait_timing', 'investigate', 'remap', 'escalate'] as const;

export const BREAK_TASK = [
  'Trace each reconciliation break to its root cause (skill fa-break-trace). Diagnose only; never propose to post entries yourself.',
  'data.breaks lists material breaks: id, key, class, diff (local currency units), causes (code hypotheses),',
  'glRows and subRows = the raw rows on each side (row, docNo, date, amount, fxAmount, quantity, desc).',
  'For each break write rootCause as ONE sentence (max 300 characters) using one of four patterns:',
  '  1) timing: "<side> recorded <docNo> on <date>; the other side recorded it on <date>";',
  '  2) amount: "<docNo> is <amount> in the GL but <amount> in the subledger";',
  '  3) missing or duplicate: "<docNo> exists only in <side>" / "<docNo> appears twice in <side>";',
  '  4) fx: "<docNo> local amounts differ because a different exchange rate was used".',
  'Every document number, amount and date you cite MUST come from the given rows. Do not invent any.',
  'owner = the responsible role (max 60 characters); expectedClearDate = YYYY-MM-DD; action = one of: ' + BREAK_ACTIONS.join(', ') + '.',
  'Return {"traces":[{"id":"...","rootCause":"...","owner":"...","expectedClearDate":"YYYY-MM-DD","action":"..."}]}.',
].join('\n');

export const breakSchema = z.object({
  traces: z.array(z.object({
    id: z.string().max(80),
    rootCause: z.string().max(400),
    owner: z.string().max(80),
    expectedClearDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    action: z.string().max(40),
  })).max(100),
});
export type BreakOut = z.infer<typeof breakSchema>;
