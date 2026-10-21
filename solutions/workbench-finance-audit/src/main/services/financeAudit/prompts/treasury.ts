/**
 * G5 资金与金融风险（批次 6）交给模型的任务指令（模型可见文本，不是界面文案；本目录在 i18n codemod 里整目录豁免）。
 * 只用于 H 型模块写说明段：金额全部由引擎算好放在 data.facts，模型只许引用这些数字，代码逐条回核。
 * 边界：付款只出计划 / 授权建议；外汇只出策略与询价单草稿，**不下单、不成交**；不对外发送。
 */
import { z } from 'zod';

const COMMON = [
  'Write one paragraph for each topic in data.topics (use the topic id as "id"; at most 900 characters per paragraph).',
  'Use ONLY numbers that appear in data.facts: amounts are in major currency units, ratios are percentages. Do not compute, round or invent any other figure.',
  'If the facts are not enough for a point, say that it needs confirmation instead of guessing.',
  'This is a draft for human review: never say that anything was approved, paid, executed, booked or sent.',
  'Return {"paragraphs":[{"id":"<topic id>","text":"..."}]}.',
].join('\n');

export const NARRATIVE_TASKS = {
  cash_pool: [
    'Draft a cash pooling proposal (skill fa-cash-pool-configuration) from data.facts.',
    'pool_structure: header account, which accounts sweep up to it and which are funded down, accounts left out and why.',
    'pool_benefit: the estimated annual interest gain and the points to confirm before setting it up (intercompany lending, bank agreements, local regulation).',
  ].join('\n'),
  hedge: [
    'Draft an FX hedging STRATEGY (skill fa-fx-hedging-strategy) from data.facts. The output is a strategy draft plus a request-for-quote list that a person takes to banks.',
    'Never place, execute, book or confirm a trade, and never write that a trade has been done or will be done automatically.',
    'hedge_strategy: exposures by currency, the layered hedge ratios used, and what each request-for-quote line covers.',
    'hedge_cost: forwards as the default instrument with options as an alternative, and the cost and hedge-accounting documentation points (IFRS 9 / CAS 24) to confirm.',
  ].join('\n'),
  restructure: [
    'Draft debt restructuring options (skill fa-debt-restructuring) from data.facts: maturity profile, covenant status and cost of debt.',
    'restructure_options: two or three options (for example extend maturities, refinance, reset covenants) and which facts support each.',
    'restructure_risks: risks and preconditions; these are options for management, not commitments to lenders.',
  ].join('\n'),
  portfolio: [
    'Draft an investment portfolio review (skill fa-investment-portfolio-review) from data.facts: performance, compliance breaches, concentration and maturity ladder.',
    'portfolio_review: this is an internal review, not investment advice.',
  ].join('\n'),
  liquidity: [
    'Draft a liquidity assessment (skill fa-liquidity-assessment) from data.facts: available liquidity, coverage of debt due within 12 months, ratios and credit facility usage.',
    'liquidity_view: state which indicators are on watch or breached.',
  ].join('\n'),
} as const;
export type NarrativeKind = keyof typeof NARRATIVE_TASKS;

export function narrativeTask(kind: NarrativeKind): string {
  return `${NARRATIVE_TASKS[kind]}\n${COMMON}`;
}

export const narrativeSchema = z.object({
  paragraphs: z.array(z.object({
    id: z.string().max(40),
    text: z.string().min(1).max(1200),
  })).min(1).max(6),
});
export type NarrativeOut = z.infer<typeof narrativeSchema>;
