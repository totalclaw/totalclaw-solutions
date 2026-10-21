/**
 * B1 内控与 SOX：交给模型的任务指令（模型可见文本，不是界面文案；本目录在 i18n codemod 里整目录豁免）。
 * 起草风险控制矩阵（RCM）与审批矩阵：只起草，每条必须给出流程文档里的原文依据（quote），代码回原文定位。
 */
import { z } from 'zod';

export const RCM_TASK = [
  'Draft a risk and control matrix (RCM) and an approval matrix from the process documents (skills fa-sox-control-design and fa-approval-matrix).',
  'This is a DRAFT for people to review; never state that controls are effective and never issue any opinion.',
  'For each control: id (C-01, C-02 ...), process, risk (what could go wrong), assertion, description (what the control does),',
  'type = preventive | detective, nature = manual | automated | itdm, frequency = annual | quarterly | monthly | weekly | daily | multiple,',
  'owner (role), key (true for controls that address a financial reporting risk directly),',
  'quote = ONE sentence copied verbatim from the documents that supports this control, docName = the document it came from.',
  'For the approval matrix: matter, threshold (copy the amount or condition exactly as written), approver, quote (verbatim), docName.',
  'Only include approval rules that are written in the documents. If a process has a risk but no control is described, still list a control and set quote to "".',
  'Return {"controls":[...],"approvalMatrix":[...]}.',
].join('\n');

const freq = z.enum(['annual', 'quarterly', 'monthly', 'weekly', 'daily', 'multiple']);
export const rcmSchema = z.object({
  controls: z.array(z.object({
    id: z.string().max(20),
    process: z.string().max(120),
    risk: z.string().max(400),
    assertion: z.string().max(120),
    description: z.string().max(500),
    type: z.enum(['preventive', 'detective']),
    nature: z.enum(['manual', 'automated', 'itdm']),
    frequency: freq,
    owner: z.string().max(80),
    key: z.boolean(),
    quote: z.string().max(500),
    docName: z.string().max(200),
  })).max(80),
  approvalMatrix: z.array(z.object({
    matter: z.string().max(200),
    threshold: z.string().max(200),
    approver: z.string().max(120),
    quote: z.string().max(500),
    docName: z.string().max(200),
  })).max(60),
});
export type RcmOut = z.infer<typeof rcmSchema>;
