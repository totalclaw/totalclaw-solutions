/**
 * C3 转让定价交给模型的任务指令（模型可见文本，不是界面文案；本目录在 i18n codemod 里整目录豁免）。
 * 利润水平指标、四分位、文档要求全部由代码算好；模型只写本地文档草稿的叙述段落，数字由代码回核。
 */
import { z } from 'zod';

export const TP_SECTIONS = ['overview', 'method', 'comparability', 'conclusion'] as const;

export const TP_TASK = [
  'Write the narrative sections of a transfer pricing local file DRAFT (skills fa-transfer-pricing-documentation-master, fa-comparable-analysis-tp, fa-master-document-preparation, fa-beps-compliance).',
  'All figures are computed by code in data: related-party transaction totals by type, the tested party profit level indicator (PLI), the comparable range (n, min, Q1, median, Q3, max) and the tested party position.',
  'Sections (one paragraph each, at most 900 characters):',
  '  overview: the related-party transactions by type and amount;',
  '  method: why the transactional net margin method with the given PLI fits the tested party (functions are only those stated in data; do not invent functions, risks or assets);',
  '  comparability: the comparable set and the interquartile range;',
  '  conclusion: whether the tested party falls within, below or above the range, and the adjustment to the median if below.',
  'Every amount and percentage MUST come from data (amounts in currency units, PLI and quartiles as percentages with up to two decimals). Do not cite regulation article numbers.',
  'This is a draft for a tax professional; it is not a tax opinion and must not say the arrangement is compliant.',
  'Return {"sections":[{"id":"overview","text":"..."},{"id":"method","text":"..."},{"id":"comparability","text":"..."},{"id":"conclusion","text":"..."}]}.',
].join('\n');

export const tpSchema = z.object({
  sections: z.array(z.object({ id: z.enum(TP_SECTIONS), text: z.string().max(1800) })).max(8),
});
