/**
 * 进度汇总报告（周报）与项目总结报告。
 *
 * 数字一律由代码算（buildReportStats 和下面的 facts），表格、清单也由代码生成；模型只写两段叙述，
 * 叙述里出现材料里没有的数字整句删掉（guardNumbers）。模型不可用时叙述用代码模板，报告照样完整。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { MmMeeting, MmObjection, MmOrg, MmProject, MmReport, MmReportStats, MmTask } from '../../../../shared/meetingMgmt/types';
import { summaryNarrativePrompt, weeklyNarrativePrompt } from './prompts';
import { daysBetween, endOfDayMs, guardNumbers, isDateStr, localDateStr, numberTokens, parseLlmJson, randomId, truncate } from './util';
import type { MmLlm } from './types';

/** 逾期：未开始 / 进行中且过了截止日当天（逾期是标记不是状态） */
export function isTaskOverdue(t: Pick<MmTask, 'status' | 'due'>, now: number): boolean {
  return (t.status === 'not_started' || t.status === 'in_progress') && isDateStr(t.due) && now > endOfDayMs(t.due);
}

export function overdueDays(t: Pick<MmTask, 'status' | 'due'>, now: number): number {
  return isTaskOverdue(t, now) ? Math.max(1, daysBetween(t.due, localDateStr(now))) : 0;
}

/** 已完成的任务是否按期（完成时间不晚于截止日当天；没记完成时间的算按期） */
export function doneOnTime(t: Pick<MmTask, 'status' | 'due' | 'doneAt'>): boolean {
  if (t.status !== 'done') return false;
  if (!t.doneAt || !isDateStr(t.due)) return true;
  return t.doneAt <= endOfDayMs(t.due);
}

/**
 * 统计口径：total 含已取消；完成率 = 已完成 /（总数 − 已取消），已取消不进分母（结项时视同完成，但不算「做完了」）；
 * 全部取消时完成率记 100，没有任务记 0。
 */
export function buildReportStats(tasks: MmTask[], now: number): MmReportStats {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const cancelled = tasks.filter(t => t.status === 'cancelled').length;
  const overdue = tasks.filter(t => isTaskOverdue(t, now)).length;
  const onTime = tasks.filter(t => doneOnTime(t)).length;
  const late = done - onTime;
  const effective = total - cancelled;
  const completionRate = effective > 0 ? Math.round((done / effective) * 100) : total > 0 ? 100 : 0;
  return { total, done, cancelled, overdue, onTime, late, completionRate };
}

function cell(s: unknown): string {
  return String(s ?? '').replace(/\|/g, '／').replace(/\s*\n\s*/g, ' ').trim() || '—';
}

function nameMaps(org: MmOrg) {
  const people = new Map(org.people.map(p => [p.id, p.name]));
  const depts = new Map(org.depts.map(d => [d.id, d.name]));
  return { person: (id?: string) => (id && people.get(id)) || id || '—', dept: (id?: string) => (id && depts.get(id)) || id || '—' };
}

function deptProgress(tasks: MmTask[], dept: (id: string) => string) {
  const m = new Map<string, { name: string; done: number; total: number }>();
  for (const t of tasks) {
    if (t.status === 'cancelled') continue;
    const e = m.get(t.deptId) || { name: dept(t.deptId), done: 0, total: 0 };
    e.total++;
    if (t.status === 'done') e.done++;
    m.set(t.deptId, e);
  }
  return [...m.values()].sort((a, b) => b.total - a.total);
}

async function narrative<T extends Record<string, string>>(llm: MmLlm, prompt: string, keys: (keyof T)[], allowed: Set<string>): Promise<Partial<T>> {
  try {
    const raw = await llm(prompt, { json: true, timeoutMs: 120_000 });
    const j = parseLlmJson<Record<string, unknown>>(raw);
    if (!j) return {};
    const out: Partial<T> = {};
    for (const k of keys) {
      const v = j[k as string];
      if (typeof v !== 'string' || !v.trim()) continue;
      // 叙述里不许带标题 / 表格，免得打乱代码排好的结构
      const plain = v.replace(/^#+\s*/gm, '').replace(/^\|.*\|$/gm, '').trim();
      const g = guardNumbers(truncate(plain, 1200), allowed);
      if (g.text) (out as any)[k] = g.text;
    }
    return out;
  } catch {
    return {};
  }
}

// ─── 周报 ─────────────────────────────────────────────────────────────────

export async function generateWeeklyReport(i: { project: MmProject; meetings: MmMeeting[]; tasks: MmTask[]; org: MmOrg; from: number; to: number; llm: MmLlm }): Promise<MmReport> {
  const { project, org, from, to } = i;
  const tasks = i.tasks.filter(t => !t.projectId || t.projectId === project.id);
  const meetings = i.meetings.filter(m => !m.projectId || m.projectId === project.id);
  const names = nameMaps(org);
  const stats = buildReportStats(tasks, to);
  const inPeriod = (ms?: number) => !!ms && ms >= from && ms <= to;
  const doneInPeriod = tasks.filter(t => t.status === 'done' && inPeriod(t.doneAt));
  const createdInPeriod = tasks.filter(t => inPeriod(t.createdAt));
  const updates = tasks.reduce((s, t) => s + (t.progressLog || []).filter(l => inPeriod(l.at)).length, 0);
  const overdueList = tasks.filter(t => isTaskOverdue(t, to)).map(t => ({ title: t.title, dept: names.dept(t.deptId), due: t.due, days: overdueDays(t, to), percent: t.percent }))
    .sort((a, b) => b.days - a.days);
  const allObj: MmObjection[] = tasks.flatMap(t => [...(t.objectionHistory || []), ...(t.objection ? [t.objection] : [])]);
  const objRaised = allObj.filter(o => inPeriod(o.raisedAt)).length;
  const objResolved = allObj.filter(o => inPeriod(o.resolvedAt)).length;
  const objOpen = tasks.filter(t => t.objection && t.objection.stage !== 'resolved').length;
  const toDate = localDateStr(to);
  const upcoming = tasks.filter(t => (t.status === 'not_started' || t.status === 'in_progress' || t.status === 'to_accept') && isDateStr(t.due) && t.due >= toDate && daysBetween(toDate, t.due) <= 7)
    .map(t => ({ title: t.title, dept: names.dept(t.deptId), due: t.due }));
  const depts = deptProgress(tasks, names.dept);
  const periodMeetings = meetings.filter(m => inPeriod(m.time)).map(m => ({ title: m.title, date: localDateStr(m.time) }));

  const facts = {
    project: project.name,
    period: { from: localDateStr(from), to: toDate },
    stats,
    doneThisPeriod: doneInPeriod.map(t => ({ title: t.title, dept: names.dept(t.deptId) })),
    doneThisPeriodCount: doneInPeriod.length,
    createdThisPeriodCount: createdInPeriod.length,
    progressUpdatesThisPeriod: updates,
    overdue: overdueList,
    dueNextWeek: upcoming,
    depts,
    objections: { raisedThisPeriod: objRaised, resolvedThisPeriod: objResolved, open: objOpen },
    meetingsThisPeriod: periodMeetings,
  };
  const factsText = JSON.stringify(facts);
  const allowed = new Set(numberTokens(factsText));
  const n = await narrative<{ progress: string; focus: string }>(i.llm, weeklyNarrativePrompt(factsText), ['progress', 'focus'], allowed);

  const progress = n.progress || [
    i18nT('本期完成 {p0} 项任务，新增 {p1} 项，累计完成率 {p2}%。', { p0: doneInPeriod.length, p1: createdInPeriod.length, p2: stats.completionRate }),
    stats.overdue > 0 ? i18nT('目前有 {p0} 项任务逾期，需要尽快跟进。', { p0: stats.overdue }) : i18nT('目前没有逾期任务。'),
  ].join('');
  const focus = n.focus || [
    upcoming.length ? i18nT('未来 7 天内有 {p0} 项任务到期。', { p0: upcoming.length }) : '',
    objOpen ? i18nT('还有 {p0} 项异议在处理中。', { p0: objOpen }) : '',
    overdueList.length ? i18nT('请逾期任务的责任部门尽快更新进度。') : '',
  ].filter(Boolean).join('') || i18nT('按计划推进即可。');

  const md: string[] = [
    `# ${i18nT('{p0} · 进度汇总报告', { p0: project.name })}`,
    '',
    i18nT('统计区间：{p0} 至 {p1}', { p0: localDateStr(from), p1: toDate }),
    '',
    `## ${i18nT('总体情况')}`,
    '',
    `- ${i18nT('任务总数：{p0} 项（已完成 {p1}，已取消 {p2}）', { p0: stats.total, p1: stats.done, p2: stats.cancelled })}`,
    `- ${i18nT('完成率：{p0}%', { p0: stats.completionRate })}`,
    `- ${i18nT('逾期：{p0} 项', { p0: stats.overdue })}`,
    `- ${i18nT('本期完成 {p0} 项，新增 {p1} 项，进度更新 {p2} 次', { p0: doneInPeriod.length, p1: createdInPeriod.length, p2: updates })}`,
    '',
    `## ${i18nT('本期进展')}`,
    '',
    progress,
    '',
    `## ${i18nT('各部门进度')}`,
    '',
  ];
  if (depts.length) {
    md.push(`| ${i18nT('部门')} | ${i18nT('已完成 / 总数')} | ${i18nT('完成率')} |`, '| --- | --- | --- |');
    for (const d of depts) md.push(`| ${cell(d.name)} | ${d.done} / ${d.total} | ${d.total ? Math.round((d.done / d.total) * 100) : 0}% |`);
  } else md.push(i18nT('暂无任务。'));
  md.push('', `## ${i18nT('逾期任务')}`, '');
  if (overdueList.length) {
    md.push(`| ${i18nT('任务')} | ${i18nT('责任部门')} | ${i18nT('截止日')} | ${i18nT('逾期天数')} | ${i18nT('进度')} |`, '| --- | --- | --- | --- | --- |');
    for (const t of overdueList) md.push(`| ${cell(t.title)} | ${cell(t.dept)} | ${t.due} | ${t.days} | ${t.percent}% |`);
  } else md.push(i18nT('无。'));
  md.push('', `## ${i18nT('异议与变更')}`, '', i18nT('本期新提出 {p0} 项，处理完 {p1} 项，仍在处理 {p2} 项。', { p0: objRaised, p1: objResolved, p2: objOpen }));
  md.push('', `## ${i18nT('下期关注')}`, '', focus, '');

  return { id: randomId('rpt'), kind: 'weekly', generatedAt: Date.now(), periodFrom: from, periodTo: to, markdown: md.join('\n'), stats };
}

// ─── 项目总结 ─────────────────────────────────────────────────────────────

function outcomeLabel(o?: MmObjection['outcome']): string {
  switch (o) {
    case 'adopted': return i18nT('采纳并调整');
    case 'accepted_reject': return i18nT('接受驳回');
    case 'kept': return i18nT('维持原方案');
    case 'adjusted': return i18nT('按异议调整');
    case 'cancelled': return i18nT('删除任务');
    default: return i18nT('处理中');
  }
}

function targetLabel(t: MmObjection['target']): string {
  return t === 'time' ? i18nT('时间') : t === 'requirement' ? i18nT('要求') : i18nT('内容');
}

export async function generateProjectSummary(i: { project: MmProject; meetings: MmMeeting[]; tasks: MmTask[]; org: MmOrg; prompt?: string; llm: MmLlm }): Promise<MmReport> {
  const { project, org } = i;
  const now = Date.now();
  const tasks = i.tasks.filter(t => !t.projectId || t.projectId === project.id);
  const meetings = i.meetings.filter(m => !m.projectId || m.projectId === project.id).slice().sort((a, b) => a.time - b.time);
  const names = nameMaps(org);
  const stats = buildReportStats(tasks, now);
  const decisions = meetings.flatMap(m => (m.decisions || []).map(d => ({ text: d.text, meeting: m.title, date: localDateStr(m.time) })));
  const lateTasks = tasks.filter(t => t.status === 'done' && !doneOnTime(t)).map(t => ({
    title: t.title, dept: names.dept(t.deptId), due: t.due, doneDate: t.doneAt ? localDateStr(t.doneAt) : '—',
    daysLate: t.doneAt ? Math.max(1, daysBetween(t.due, localDateStr(t.doneAt))) : 0,
  }));
  const unfinished = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;
  const records = tasks.flatMap(t => [...(t.objectionHistory || []), ...(t.objection ? [t.objection] : [])].map(o => ({
    task: t.title,
    kind: o.kind === 'change' ? i18nT('申请变更') : i18nT('提出异议'),
    target: targetLabel(o.target),
    reason: truncate(o.reason || '', 60),
    outcome: outcomeLabel(o.outcome),
    arbitrated: !!o.arbitration,
    date: localDateStr(o.raisedAt),
  })));
  const arbitrations = records.filter(r => r.arbitrated).length;
  const firstDay = localDateStr(project.createdAt || meetings[0]?.time || now);
  const lastDay = localDateStr(project.archivedAt || now);

  const facts = {
    project: { name: project.name, desc: project.desc, owner: names.person(project.ownerId), members: project.memberIds.length, from: firstDay, to: lastDay },
    meetings: meetings.map(m => ({ title: m.title, date: localDateStr(m.time), decisions: (m.decisions || []).length })),
    meetingCount: meetings.length,
    decisionCount: decisions.length,
    decisions: decisions.slice(0, 60),
    stats,
    unfinished,
    lateTasks,
    changesAndArbitrations: { total: records.length, arbitrations, records: records.slice(0, 60) },
  };
  const factsText = JSON.stringify(facts);
  const allowed = new Set(numberTokens(factsText));
  const n = await narrative<{ overall: string; lessons: string }>(i.llm, summaryNarrativePrompt(factsText, i.prompt), ['overall', 'lessons'], allowed);

  const overall = n.overall || i18nT('项目共召开 {p0} 场会议，形成 {p1} 项决议，派发 {p2} 项任务，按期完成 {p3} 项、延期完成 {p4} 项。', {
    p0: meetings.length, p1: decisions.length, p2: stats.total, p3: stats.onTime, p4: stats.late,
  });
  const lessons = n.lessons || [
    stats.late > 0 ? i18nT('有 {p0} 项任务延期完成，后续立项时建议预留缓冲时间并加强进度跟踪。', { p0: stats.late }) : '',
    records.length > 0 ? i18nT('执行中共提出 {p0} 次异议或变更，其中 {p1} 次提交裁决，建议在方案确认阶段与责任部门充分沟通。', { p0: records.length, p1: arbitrations }) : '',
  ].filter(Boolean).join('') || i18nT('任务均按期完成，执行过程顺畅。');

  const md: string[] = [
    `# ${i18nT('{p0} · 项目总结报告', { p0: project.name })}`,
    '',
    `## ${i18nT('项目概况')}`,
    '',
    `- ${i18nT('项目负责人：{p0}', { p0: names.person(project.ownerId) })}`,
    `- ${i18nT('项目周期：{p0} 至 {p1}', { p0: firstDay, p1: lastDay })}`,
    `- ${i18nT('项目成员：{p0} 人；会议：{p1} 场；决议：{p2} 项；任务：{p3} 项', { p0: project.memberIds.length, p1: meetings.length, p2: decisions.length, p3: stats.total })}`,
  ];
  if (project.desc?.trim()) md.push(`- ${i18nT('项目说明：{p0}', { p0: project.desc.trim().replace(/\s*\n\s*/g, ' ') })}`);
  md.push('', overall, '', `## ${i18nT('关键决策')}`, '');
  if (decisions.length) decisions.forEach((d, k) => md.push(`${k + 1}. ${d.text}（${d.date} ${d.meeting}）`));
  else md.push(i18nT('无。'));
  md.push('', `## ${i18nT('任务完成情况')}`, '',
    `- ${i18nT('任务 {p0} 项：按期完成 {p1} 项，延期完成 {p2} 项，已取消 {p3} 项，未完成 {p4} 项', { p0: stats.total, p1: stats.onTime, p2: stats.late, p3: stats.cancelled, p4: unfinished })}`,
    `- ${i18nT('完成率：{p0}%', { p0: stats.completionRate })}`,
    '');
  if (lateTasks.length) {
    md.push(`| ${i18nT('延期任务')} | ${i18nT('责任部门')} | ${i18nT('截止日')} | ${i18nT('完成日')} | ${i18nT('延期天数')} |`, '| --- | --- | --- | --- | --- |');
    for (const t of lateTasks) md.push(`| ${cell(t.title)} | ${cell(t.dept)} | ${t.due} | ${t.doneDate} | ${t.daysLate} |`);
    md.push('');
  }
  md.push(`## ${i18nT('变更与裁决记录')}`, '');
  if (records.length) {
    md.push(`| ${i18nT('任务')} | ${i18nT('类型')} | ${i18nT('针对')} | ${i18nT('原因')} | ${i18nT('结果')} | ${i18nT('日期')} |`, '| --- | --- | --- | --- | --- | --- |');
    for (const r of records) md.push(`| ${cell(r.task)} | ${cell(r.kind)}${r.arbitrated ? i18nT('（经裁决）') : ''} | ${cell(r.target)} | ${cell(r.reason)} | ${cell(r.outcome)} | ${r.date} |`);
  } else md.push(i18nT('无。'));
  md.push('', `## ${i18nT('总结与建议')}`, '', lessons, '');

  return { id: randomId('rpt'), kind: 'summary', generatedAt: now, markdown: md.join('\n'), stats };
}
