/**
 * 批次 5（fpa，D1–D10）交给模型的任务指令与输出 schema（模型可见文本，不是界面文案；本目录在 i18n codemod 里整目录豁免）。
 * 指标、差异、达成率全部由代码算好放在 <data> 里；模型只写说明，说明里出现的数字必须能在 <data> 或上传文件原文里找到。
 */
import { z } from 'zod';

/** 随 Master 技能放置的知识后端文件名（源项目原名，第 6.5 节） */
export const REF_JUDGEMENT = '判断框架.md';
export const REF_ESG_FRAMEWORKS = 'ESG框架详解.md';

const COMMON = [
  'All amounts in <data> are already in currency units and all *Pct fields are percent numbers (12.5 means 12.5%).',
  'Quote numbers exactly as given. Never compute, convert, round, annualise or invent numbers; if a number is not in <data> or in a document, do not write it.',
  'This is an internal draft for human sign-off: no audit or assurance opinion, no investment advice, no promise of future results.',
].join('\n');

const text = (max: number) => z.string().max(max);
const section = <T extends [string, ...string[]]>(ids: T, max = 1500) => z.array(z.object({ id: z.enum(ids), text: text(max) })).max(ids.length + 2);

// ── D1 管理报告 ──
export const MGMT_SECTIONS = ['overview', 'profitability', 'position', 'alerts', 'outlook'] as const;
export const MGMT_TASK = [
  'Write the narrative sections of a monthly management report (skills fa-management-report-master, fa-management-commentary-writing, fa-metric-alert-handling).',
  'data.metrics = core financial metrics (current, prior, budget, differences); data.ratios = key ratios in percent; data.alerts = metric alerts already graded by rules; data.kpis = KPI achievement (optional).',
  'Sections: overview (performance summary), profitability (revenue, gross margin, expenses), position (assets, liabilities, cash, ratios), alerts (each alert: what it means and the action owner), outlook (what to watch next period, no forecasts).',
  'Each section: 2-5 sentences, max 1200 characters.',
  COMMON,
  'Return {"sections":[{"id":"overview","text":"..."}, ...]} with one item per section id.',
].join('\n');
export const mgmtSchema = z.object({ sections: section([...MGMT_SECTIONS] as [string, ...string[]]) });

// ── D2 KPI 根因 ──
export const KPI_CAUSE_TYPES = ['systemic', 'one_off', 'unknown'] as const;
export const KPI_TASK = [
  'Root-cause the KPIs that missed target (skills fa-kpi-root-cause-analysis, fa-kpi-alert-handling).',
  'data.kpis lists only yellow / red KPIs: id, indicator, unit, target, actual, achievementPct, level, consecutiveMisses, history (achievementPct by period).',
  'For each KPI classify the cause as systemic (repeats over periods, structural) or one_off (single period, identifiable event), or unknown when the data cannot tell.',
  'reason: one or two sentences (max 400 characters) citing the given numbers; action: one improvement action with an owner role (max 300 characters).',
  COMMON,
  'Return {"causes":[{"id":"...","type":"systemic|one_off|unknown","reason":"...","action":"..."}]}.',
].join('\n');
export const kpiSchema = z.object({
  causes: z.array(z.object({ id: text(80), type: z.enum(KPI_CAUSE_TYPES), reason: text(500), action: text(400) })).max(100),
});

// ── D3 财务分析 ──
export const ANALYSIS_SECTIONS = ['revenue', 'margin', 'expense', 'position', 'summary'] as const;
export const ANALYSIS_TASK = [
  'Write a financial analysis (skills fa-financial-analysis-master, fa-profit-analysis, fa-budget-execution-analysis, fa-kpi-dashboard).',
  'data.compare tells which comparison is used: yoy (same period last year), mom (previous period) or budget. data.metrics, data.ratios, data.expenses and data.alerts are computed by rules.',
  'Sections: revenue, margin (gross margin and its drivers), expense (expense ratios, which grew faster than revenue), position (balance sheet ratios), summary (3 concrete improvement suggestions).',
  'Each section: 2-5 sentences, max 1200 characters.',
  COMMON,
  'Return {"sections":[{"id":"revenue","text":"..."}, ...]}.',
].join('\n');
export const analysisSchema = z.object({ sections: section([...ANALYSIS_SECTIONS] as [string, ...string[]]) });

// ── D6 商业洞察 ──
export const INSIGHT_TASK = [
  'Generate business insights from the trend statistics (skills fa-business-insight-master, fa-insight-generation, fa-insight-validation, fa-trend-analysis, fa-survey-analysis).',
  'data.series = per indicator: id, indicator, unit, last, prev, changePct, avgChangePct, trend (up/down/flat/insufficient), anomalies, seasonality.',
  'Survey or interview documents, when given, are in <untrusted_document>; an insight drawn from a document MUST include an exact quote (max 300 characters) copied from it.',
  'Write at most 8 insights: title (max 120), finding (max 600, cite the numbers), seriesId (the id of the series it is based on, or "" when it comes only from a document), recommendation (max 300), quote ("" when none).',
  COMMON,
  'Return {"insights":[{"title":"...","finding":"...","seriesId":"...","recommendation":"...","quote":""}]}.',
].join('\n');
export const insightSchema = z.object({
  insights: z.array(z.object({ title: text(160), finding: text(700), seriesId: text(80).default(''), recommendation: text(400), quote: text(400).default('') })).max(12),
});

// ── D7 董事会与审计委员会 ──
export const AGENDA_KINDS = ['report', 'resolution', 'discussion'] as const;
export const BOARD_TASK = [
  'Prepare the board / audit committee meeting pack text (skills fa-board-reporting-master, fa-board-deck-preparation, fa-audit-committee-support, fa-board-meeting-management, fa-board-material-distribution).',
  'data.meeting = board | audit_committee | resolutions; data.metrics and data.alerts come from the signed management report or the trial balance; data.reportSections are verified management-report narratives; data.priorResolutions are open items from earlier meetings.',
  'Agenda topics and audit findings, when given, are in <untrusted_document>. An audit committee matter MUST include an exact quote (max 300 characters) copied from a document.',
  'Return: agenda (max 10 items: title max 120, kind report|resolution|discussion, presenter role max 60); highlights (max 6 one-line performance highlights citing the given numbers);',
  'acMatters (max 8: matter max 300, quote); resolutions (max 6 draft resolutions for the board to consider: title max 120, text max 400, written as proposals, never as decisions already taken); nextSteps (max 6 lines).',
  'Nothing is distributed by you: distribution is done by people.',
  COMMON,
  'Return {"agenda":[...],"highlights":[...],"acMatters":[...],"resolutions":[...],"nextSteps":[...]}.',
].join('\n');
export const boardSchema = z.object({
  agenda: z.array(z.object({ title: text(160), kind: z.enum(AGENDA_KINDS), presenter: text(80).default('') })).max(12),
  highlights: z.array(text(300)).max(8),
  acMatters: z.array(z.object({ matter: text(400), quote: text(400).default('') })).max(10),
  resolutions: z.array(z.object({ title: text(160), text: text(500) })).max(8),
  nextSteps: z.array(text(300)).max(8),
});

// ── D8 ESG ──
export const ESG_SECTIONS = ['environment', 'social', 'governance', 'gaps'] as const;
export const ESG_TASK = [
  'Draft an ESG / sustainability report for the selected framework (skills fa-esg-reporting-master, fa-esg-data-integration, fa-esg-materiality-assessment, fa-esg-reporting).',
  'data.framework is the disclosure framework; data.completeness shows which core indicators have data; data.quality lists data quality issues; data.indicators are the reported values.',
  'Policies or other evidence, when given, are in <untrusted_document>.',
  'topics: propose at most 10 material topics with category E|S|G, impact score 1-5 (impact on people and environment) and financial score 1-5 (effect on enterprise value), rationale max 300 citing the data. Scores are suggestions for human review.',
  'sections: environment, social, governance (what the data shows, max 1200 each) and gaps (missing indicators and data quality issues to fix before disclosure).',
  COMMON,
  'Return {"topics":[{"topic":"...","category":"E","impact":3,"financial":4,"rationale":"..."}],"sections":[{"id":"environment","text":"..."}]}.',
].join('\n');
export const esgSchema = z.object({
  topics: z.array(z.object({ topic: text(120), category: z.enum(['E', 'S', 'G']), impact: z.number().int().min(1).max(5), financial: z.number().int().min(1).max(5), rationale: text(400) })).max(12),
  sections: section([...ESG_SECTIONS] as [string, ...string[]]),
});

// ── D9 战略规划 ──
export const ASSUMPTION_STATUS = ['holding', 'changed', 'unknown'] as const;
export const STRATEGY_SECTIONS = ['summary', 'deviation'] as const;
export const STRATEGY_TASK = [
  'Support strategic planning and execution tracking (skills fa-strategic-planning-master, fa-strategic-objective-setting, fa-strategic-assumption, fa-strategic-risk-assessment, fa-strategy-execution-tracking).',
  'data.objectives = strategic targets with actual, achievementPct, deviationPct and level computed by rules. The strategy document, when given, is in <untrusted_document>.',
  'decomposition (max 10): objective (max 120), milestone (max 200), owner role (max 60).',
  'assumptions (max 10): assumption (max 200), indicator to watch (max 80), status holding|changed|unknown, quote = exact text (max 300) copied from the strategy document that states the assumption.',
  'risks (max 10): risk (max 200), likelihood 1-5, impact 1-5, response (max 300). Scores are suggestions for human review.',
  'sections: summary (max 1200) and deviation (explain the moderate / severe deviations and corrective options, max 1200).',
  COMMON,
  'Return {"decomposition":[...],"assumptions":[...],"risks":[...],"sections":[...]}.',
].join('\n');
export const strategySchema = z.object({
  decomposition: z.array(z.object({ objective: text(160), milestone: text(300), owner: text(80).default('') })).max(12),
  assumptions: z.array(z.object({ assumption: text(300), indicator: text(120).default(''), status: z.enum(ASSUMPTION_STATUS), quote: text(400).default('') })).max(12),
  risks: z.array(z.object({ risk: text(300), likelihood: z.number().int().min(1).max(5), impact: z.number().int().min(1).max(5), response: text(400) })).max(12),
  sections: section([...STRATEGY_SECTIONS] as [string, ...string[]]),
});

// ── D10 投资者关系 ──
export const IR_SCRIPT = ['opening', 'highlights', 'outlook', 'closing'] as const;
export const IR_TASK = [
  'Prepare investor relations materials (skills fa-investor-relations-master, fa-earnings-call-preparation, fa-roadshow-material-preparation, fa-ir-disclosure-management, fa-investor-feedback-tracking).',
  'data.mode = earnings | roadshow | feedback; data.metrics and data.ratios are the reported results computed by rules. Published announcements and investor feedback, when given, are in <untrusted_document>.',
  'script: opening, highlights, outlook (qualitative only, no guidance numbers unless they appear in an announcement), closing; max 1200 characters each.',
  'qa: at most 12 likely investor questions with a draft answer (question max 200, answer max 600). keyMessages: at most 6 one-line messages.',
  'feedback: at most 8 themes from investor feedback, each with an exact quote (max 300) copied from a feedback document; [] when there is no feedback document.',
  'Every number must already be public: it must appear in <data> or in an announcement. Never disclose anything else.',
  COMMON,
  'Return {"script":[{"id":"opening","text":"..."}],"qa":[{"question":"...","answer":"..."}],"keyMessages":["..."],"feedback":[{"theme":"...","quote":"..."}]}.',
].join('\n');
export const irSchema = z.object({
  script: section([...IR_SCRIPT] as [string, ...string[]]),
  qa: z.array(z.object({ question: text(300), answer: text(800) })).max(15),
  keyMessages: z.array(text(300)).max(8),
  feedback: z.array(z.object({ theme: text(160), quote: text(400) })).max(10),
});
