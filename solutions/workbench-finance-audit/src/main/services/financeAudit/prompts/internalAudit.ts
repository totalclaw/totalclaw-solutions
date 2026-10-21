/**
 * B2 内部审计：交给模型的任务指令（模型可见文本；本目录在 i18n codemod 里整目录豁免）。
 * 计划说明只许引用给定数字；流程合规审计的每条发现必须引用原文（quote），定位不到的发现由代码丢弃。
 */
import { z } from 'zod';

export const PLAN_TASK = [
  'Write the narrative for the annual internal audit plan (skill fa-annual-audit-planning). data.plan is computed by code and is final.',
  'Explain the risk-based priorities, which areas are covered in which quarter, and the resource gap if data.plan.gap > 0.',
  'Use ONLY numbers that appear in data. Do not invent areas, days or dates. Max 1200 characters.',
  'Return {"narrative":"..."}.',
].join('\n');

export const planSchema = z.object({ narrative: z.string().max(2000) });

export const FIELDWORK_TASK = [
  'Draft an internal audit program and findings for the process described in the documents (skill fa-process-compliance-audit).',
  'This is a DRAFT working paper; never issue an audit opinion or a conclusion on overall effectiveness.',
  'procedures: id (P-01 ...), area, objective, procedure (what the auditor will do), evidence (what evidence to obtain).',
  'findings: only issues that the documents actually show. For each: id (F-01 ...), title, condition (what was found), criteria (which rule or policy),',
  'cause, effect, recommendation, kind = deficiency | improvement | compliance, likelihood = high | medium | low, impact = high | medium | low,',
  'quote = ONE sentence copied verbatim from the documents that evidences the condition, docName = that document.',
  'A finding without a verbatim quote will be discarded. Return {"procedures":[...],"findings":[...]}.',
].join('\n');

const level = z.enum(['high', 'medium', 'low']);
export const fieldworkSchema = z.object({
  procedures: z.array(z.object({
    id: z.string().max(20), area: z.string().max(120), objective: z.string().max(400), procedure: z.string().max(600), evidence: z.string().max(400),
  })).max(60),
  findings: z.array(z.object({
    id: z.string().max(20), title: z.string().max(200), condition: z.string().max(800), criteria: z.string().max(500), cause: z.string().max(500),
    effect: z.string().max(500), recommendation: z.string().max(600), kind: z.enum(['deficiency', 'improvement', 'compliance']),
    likelihood: level, impact: level, quote: z.string().max(500), docName: z.string().max(200),
  })).max(40),
});
