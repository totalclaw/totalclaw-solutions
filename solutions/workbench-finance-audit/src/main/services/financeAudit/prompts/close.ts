/**
 * A1 月结关账交给模型的任务指令（模型可见文本，不是界面文案；本目录在 i18n codemod 里整目录豁免）。
 * 模型只写「为什么」，数字由代码算好放在 <data> 里，说明里出现的数字必须能在给定数据里找到（第 5.5 节波动说明）。
 */
import { z } from 'zod';

export const FLUX_TASK = [
  'Write variance commentary for month-end close working papers (skill fa-variance-commentary).',
  'data.lines lists accounts whose movement exceeded the threshold or that must always be reviewed.',
  'Each line has: accountCode, accountName, current, prior, diffPrior, diffPriorPct (percent number), budget, diffBudget,',
  'and drivers = the journal entries that contributed most, aggregated by counterparty or summary ({label, amount, count}).',
  'All amounts are already in currency units; quote them exactly as given, do not compute, convert or round new numbers.',
  'For every line write ONE sentence (max 300 characters) explaining WHY the balance moved, citing the drivers.',
  'If the drivers do not explain the movement, set "unknown": true and use data.unknownPhrase as the commentary.',
  'Return {"lines":[{"accountCode":"...","commentary":"...","unknown":false}]} with one item per input line.',
].join('\n');

export const fluxSchema = z.object({
  lines: z.array(z.object({
    accountCode: z.string().max(40),
    commentary: z.string().max(400),
    unknown: z.boolean().default(false),
  })).max(200),
});
export type FluxOut = z.infer<typeof fluxSchema>;
