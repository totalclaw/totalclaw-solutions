/**
 * 流程时效监控 · 发给模型的提示词（是载荷不是界面文案，不进词典）。
 *
 * 模型只做两件事：把收集到的超时原因归到固定的类别里并写根因说明；
 * 根据已经算好的事实写月度 / 周度总结和改善建议。模型不算任何数字，
 * 它写的话里出现材料里没有的数字，整句会被丢掉（见 reasons.ts 的 guardNumbers）。
 */
import type { FsCase, FsPeriodKind } from '@totalclaw/ipc-contracts';

const CATEGORY_GUIDE = [
  'materials  - 资料不全退回：发起时资料缺失、填写错误，被退回补充后重新流转',
  'absence    - 审批人出差/休假：审批人不在岗、开会、培训，没有代理人',
  'cross_dept - 跨部门沟通等待：需要其他部门确认、会签，来回沟通',
  'external   - 外部单位未反馈：等服务商、供应商、客户反馈、盖章、寄回资料',
  'system     - 系统/操作问题：系统故障、没收到待办提醒、操作不熟、遗漏',
  'design     - 流程设计环节过多：审批层级多、节点多、重复审批',
  'other      - 其他：以上都不是',
];

/** 把超时原因归类：只许用给定的类别 id，只许用给定的 key */
export function reasonClassifyPrompt(cases: FsCase[]): string {
  return [
    'You classify overtime reasons of business approval flows for a Chinese company.',
    'Return ONLY a JSON object: { "items": [ { "key": <key verbatim>, "category": <one category id> } ], "rootCauses": { <category id>: <one or two sentences in Simplified Chinese> } }',
    'Category ids and meanings (use the id, never invent a new one):',
    ...CATEGORY_GUIDE.map((x) => `  ${x}`),
    'Rules:',
    '- One element in "items" for every input line, with the key copied verbatim.',
    '- "rootCauses" has an entry only for categories that actually appear in "items".',
    '- A root cause explains the underlying cause shared by the reasons in that category. Do not write any number that is not in the input. Do not name a person.',
    '',
    'INPUT (key | flow type | reason):',
    ...cases.slice(0, 200).map((c) => `${c.key} | ${c.flowType} | ${c.reason.replace(/\s+/g, ' ').slice(0, 300)}`),
  ].join('\n');
}

/** 根据已算好的事实写总结与改善建议：不许出现事实里没有的数字 */
export function summaryPrompt(kind: FsPeriodKind, facts: string[], names: { depts: string[]; people: string[] }): string {
  return [
    `You write the ${kind === 'monthly' ? 'monthly' : 'weekly'} summary of an approval-flow timeliness report for a Chinese company, in Simplified Chinese.`,
    'Return ONLY a JSON object: { "summary": <text>, "suggestions": [ { "item": ..., "dept": ..., "owner": ..., "requirement": ..., "deadline": "YYYY-MM-DD" or "", "acceptance": ... } ] }',
    '"summary" has four paragraphs separated by a blank line, starting with 【整体表现】【异常趋势】【重点问题】【责任维度】.',
    '"suggestions": 2 to 6 concrete improvement actions derived from the facts (item = what to improve, requirement = what exactly must be done, acceptance = how completion is checked).',
    'Hard rules:',
    '- Use ONLY the facts below. Every number you write must appear in the facts exactly as written; do not compute, round, sum or estimate anything.',
    '- "dept" and "owner" must be chosen from the lists below, or left as "" when unsure.',
    '- No greetings, no markdown.',
    '',
    `DEPARTMENTS: ${names.depts.slice(0, 40).join('、') || '(none)'}`,
    `PEOPLE: ${names.people.slice(0, 60).join('、') || '(none)'}`,
    '',
    'FACTS:',
    ...facts.map((f) => `- ${f}`),
  ].join('\n');
}
