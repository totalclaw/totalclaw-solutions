/**
 * 从决议生成执行方案与任务清单：每项一个责任部门（多部门的拆开），执行事项、交付标准、建议完成时间。
 *
 * 部门必须是组织里存在的部门；模型给的部门对不上 / 日期不合法时逐项修正；模型不可用或一项都不剩时按规则兜底：
 * 决议里点到的部门名（或点到的人所在部门）各出一项，都没点到就给主持人所在部门；完成时间默认今天起 7~14 天
 * （话里有「尽快 / 本周」取 7 天），决议里写了日期就用那个日期。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { MmDecision, MmDept, MmMeeting, MmOrg, MmPlan, MmPlanItem, MmProject } from '../../../../shared/meetingMgmt/types';
import { URGENT_WORDS } from './matchWords';
import { fallbackDecisions } from './organize';
import { planPrompt } from './prompts';
import { addDays, daysBetween, guardNumbers, isDateStr, numberTokens, parseLlmJson, truncate } from './util';
import type { MmLlm } from './types';

const DEPT_SUFFIX = /(部门|事业部|中心|部|组|室|处|科|办公室|办|团队|小组)$/;

function deptAliases(d: MmDept): string[] {
  const out = [d.name.trim()];
  const stripped = d.name.trim().replace(DEPT_SUFFIX, '');
  if (stripped.length >= 2 && stripped !== d.name.trim()) out.push(stripped);
  return out.filter(Boolean);
}

/** 模型给的部门（id / 名称 / 「A、B」）→ 组织里的部门 id 列表 */
export function resolveDepts(v: unknown, depts: MmDept[]): string[] {
  const raw: string[] = Array.isArray(v) ? v.map(x => String(x ?? '')) : typeof v === 'string' ? v.split(/[、,，/&和及]+/) : v == null ? [] : [String(v)];
  const out: string[] = [];
  for (const r of raw.map(x => x.trim()).filter(Boolean)) {
    const byId = depts.find(d => d.id === r);
    if (byId) { out.push(byId.id); continue; }
    const byName = depts.filter(d => d.name.trim() === r);
    if (byName.length === 1) { out.push(byName[0]!.id); continue; }
    const rs = r.replace(DEPT_SUFFIX, '');
    const fuzzy = depts.filter(d => deptAliases(d).some(a => r.includes(a) || (rs.length >= 2 && a.includes(rs))));
    if (fuzzy.length === 1) out.push(fuzzy[0]!.id);
  }
  return [...new Set(out)];
}

/** 决议文字里点到的部门（按出现先后）；没点到部门时看点到的人所在部门 */
export function deptsMentioned(text: string, org: MmOrg): string[] {
  const hits: Array<{ id: string; pos: number }> = [];
  for (const d of org.depts) {
    let pos = -1;
    for (const a of deptAliases(d)) {
      const p = text.indexOf(a);
      if (p >= 0 && (pos < 0 || p < pos)) pos = p;
    }
    if (pos >= 0) hits.push({ id: d.id, pos });
  }
  if (!hits.length) {
    for (const p of org.people) {
      if (p.left || p.name.length < 2) continue;
      const pos = text.indexOf(p.name);
      if (pos >= 0 && org.depts.some(d => d.id === p.deptId)) hits.push({ id: p.deptId, pos });
    }
  }
  hits.sort((a, b) => a.pos - b.pos);
  return [...new Set(hits.map(h => h.id))];
}

/** 决议里写的日期：2026-11-30 / 2026年11月30日 / 11月30日 / 11/30；必须在今天之后一年以内 */
export function dueFromText(text: string, today: string): string | null {
  const year = Number(today.slice(0, 4));
  const cands: string[] = [];
  for (const m of text.matchAll(/(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})\s*日?/g)) cands.push(`${m[1]}-${m[2]!.padStart(2, '0')}-${m[3]!.padStart(2, '0')}`);
  if (!cands.length) {
    for (const m of text.matchAll(/(?<![\d/])(\d{1,2})\s*(?:月|\/)\s*(\d{1,2})\s*(?:日|号)?(?![\d/])/g)) {
      const mm = m[1]!.padStart(2, '0');
      const dd = m[2]!.padStart(2, '0');
      let c = `${year}-${mm}-${dd}`;
      if (isDateStr(c) && c < today) c = `${year + 1}-${mm}-${dd}`;
      cands.push(c);
    }
  }
  for (const c of cands) {
    if (isDateStr(c) && c >= today && daysBetween(today, c) <= 366) return c;
  }
  return null;
}

export function defaultDue(text: string, today: string): string {
  return addDays(today, URGENT_WORDS.some(w => text.includes(w)) ? 7 : 14);
}

function hostDept(meeting: MmMeeting, project: MmProject, org: MmOrg): string | null {
  for (const pid of [meeting.hostId, project.ownerId, meeting.createdBy]) {
    const p = org.people.find(x => x.id === pid);
    if (p && org.depts.some(d => d.id === p.deptId)) return p.deptId;
  }
  return org.depts[0]?.id ?? null;
}

/** 规则兜底：每条决议按点到的部门拆项 */
export function fallbackPlanItems(decisions: MmDecision[], meeting: MmMeeting, project: MmProject, org: MmOrg, today: string): MmPlanItem[] {
  const items: MmPlanItem[] = [];
  const fallbackDept = hostDept(meeting, project, org);
  for (const d of decisions) {
    let depts = deptsMentioned(d.text, org);
    if (!depts.length && fallbackDept) depts = [fallbackDept];
    const due = dueFromText(d.text, today) || defaultDue(d.text, today);
    const title = truncate(d.text.replace(/[。；;]+$/, ''), 60);
    for (const deptId of depts) {
      items.push({ id: '', deptId, title, standard: defaultStandard(title), due, decisionId: d.id });
    }
  }
  return items;
}

function defaultStandard(title: string): string {
  return i18nT('完成「{p0}」，在系统内更新进度并提交完成说明', { p0: truncate(title, 30) });
}

function fallbackSummary(meeting: MmMeeting, decisions: MmDecision[], items: MmPlanItem[], org: MmOrg): string {
  const deptName = (id: string) => org.depts.find(d => d.id === id)?.name || id;
  const deptCount = new Set(items.map(x => x.deptId)).size;
  const lines = [
    i18nT('根据会议「{p0}」的 {p1} 项决议，拆分为 {p2} 项任务，涉及 {p3} 个部门。', { p0: meeting.title, p1: decisions.length, p2: items.length, p3: deptCount }),
    '',
    ...items.map(x => i18nT('- {p0}：{p1}（{p2} 前完成）', { p0: deptName(x.deptId), p1: x.title, p2: x.due })),
  ];
  return lines.join('\n');
}

export async function generatePlan(i: { meeting: MmMeeting; project: MmProject; org: MmOrg; today: string; prompt?: string; llm: MmLlm }): Promise<MmPlan> {
  const { meeting, project, org, today } = i;
  let decisions = meeting.decisions || [];
  if (!decisions.length && meeting.segments?.length) decisions = fallbackDecisions(meeting.segments);
  const depts = org.depts;
  if (!decisions.length || !depts.length) {
    return {
      generatedAt: Date.now(),
      summary: decisions.length
        ? i18nT('组织里还没有部门，无法生成任务。请先同步通讯录。')
        : i18nT('这次会议没有识别出决议事项，请手动添加任务。'),
      items: [],
    };
  }

  let items: MmPlanItem[] = [];
  let summary = '';
  try {
    const raw = await i.llm(planPrompt({
      today,
      meeting: `${meeting.title} (${project.name})`,
      depts: depts.map(d => `${d.id}: ${d.name}`).join('\n'),
      decisions: decisions.map((d, k) => `${k + 1}. ${d.text}`).join('\n'),
      custom: i.prompt,
    }), { json: true, timeoutMs: 180_000 });
    const j = parseLlmJson<any>(raw);
    if (j && Array.isArray(j.items)) {
      const seen = new Set<string>();
      for (const it of j.items) {
        const title = typeof it?.title === 'string' ? truncate(it.title.replace(/\s+/g, ' '), 120) : '';
        if (title.length < 2) continue;
        const dn = Number(it?.decision);
        const dec = Number.isInteger(dn) && dn >= 1 && dn <= decisions.length ? decisions[dn - 1]! : undefined;
        const deptRaw = it?.dept ?? it?.deptId ?? it?.department;
        let ids = resolveDepts(deptRaw, depts);
        // 模型编了个组织里没有的部门：这一项不要；没给部门才按决议里点到的部门补
        if (!ids.length && (deptRaw === undefined || deptRaw === null || deptRaw === '') && dec) ids = deptsMentioned(dec.text, org);
        if (!ids.length) continue;
        const standard = typeof it?.standard === 'string' && it.standard.trim() ? truncate(it.standard.trim(), 300) : defaultStandard(title);
        let due = typeof it?.due === 'string' ? it.due.trim().slice(0, 10) : '';
        if (!isDateStr(due) || due <= today || daysBetween(today, due) > 366) {
          const t = dec?.text || title;
          due = dueFromText(t, today) || defaultDue(t, today);
        }
        for (const deptId of ids) {
          const key = `${deptId}|${title}`;
          if (seen.has(key)) continue;
          seen.add(key);
          items.push({ id: '', deptId, title, standard, due, decisionId: dec?.id });
        }
      }
      if (items.length && typeof j.summary === 'string' && j.summary.trim()) {
        const allowed = new Set([
          ...numberTokens(decisions.map(d => d.text).join('\n')),
          ...numberTokens(`${today} ${meeting.title} ${project.name}`),
          ...items.flatMap(x => numberTokens(`${x.due} ${x.title} ${x.standard}`)),
          String(items.length), String(decisions.length), String(new Set(items.map(x => x.deptId)).size),
        ]);
        summary = guardNumbers(j.summary.trim(), allowed).text;
      }
    }
  } catch {
    items = [];
  }
  if (!items.length) items = fallbackPlanItems(decisions, meeting, project, org, today);
  items = items.map((x, k) => ({ ...x, id: `pi_${k + 1}` }));
  if (!summary) summary = fallbackSummary(meeting, decisions, items, org);
  return { generatedAt: Date.now(), summary, items };
}
