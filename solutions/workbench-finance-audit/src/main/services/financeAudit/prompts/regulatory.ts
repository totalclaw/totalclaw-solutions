/**
 * C2 监管与披露交给模型的任务指令（模型可见文本，不是界面文案；本目录在 i18n codemod 里整目录豁免）。
 * 模型只写披露草稿的文字；是否应披露、按什么标准由代码判断。草稿里的金额、比例、日期由代码回核。
 */
import { z } from 'zod';

export const DISCLOSURE_TASK = [
  'Draft a short disclosure announcement paragraph for each item in data.items (skills fa-disclosure-management, fa-compliance-reporting-master).',
  'The decision to disclose, the regime and the thresholds that were hit are already made by code: data.items[].tests lists them. Do not change the decision.',
  'Each draft is a DRAFT for the board secretary to review. Never say it has been published, filed or approved.',
  'Write plain factual sentences: what happened, when (date), with whom (counterparty), the amount, and which threshold was reached (ratio as a percentage).',
  'Every amount, percentage and date you write MUST be taken from the given item (amount in currency units, ratio values, date). Do not invent numbers, article numbers or approval dates.',
  'Use at most 600 characters per draft. Keep counterparty and company names exactly as given.',
  'Return {"drafts":[{"id":"...","text":"..."}]}.',
].join('\n');

export const disclosureSchema = z.object({
  drafts: z.array(z.object({ id: z.string().max(80), text: z.string().max(1200) })).max(200),
});
