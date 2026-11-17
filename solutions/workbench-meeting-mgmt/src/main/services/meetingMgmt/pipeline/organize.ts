/**
 * 纪要整理：按议题（时间线）分组、识别决议事项、3 行摘要。
 *
 * 模型返回 JSON，逐项校验（段号必须存在、决议里的数字必须在原文里出现过）；模型不可用 / 回的不是 JSON /
 * 校验后什么都不剩时走规则兜底：时间线分块当议题、含「决定 / 确定 / 负责 / 截止…」的句子当决议、各议题首句当摘要。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { MmDecision, MmSegment, MmTopic } from '../../../../shared/meetingMgmt/types';
import { DECISION_WORDS } from './matchWords';
import { organizePrompt } from './prompts';
import { fmtClock, guardNumbers, numberTokens, parseLlmJson, splitSentences, truncate } from './util';
import type { MmLlm } from './types';

export interface OrganizeInput {
  segments: MmSegment[];
  /** 发言人标签 → 显示名（认出的员工姓名；未认出的保留 S1 等） */
  speakerNames: Record<string, string>;
  attendeeNames: string[];
  llm: MmLlm;
  prompt?: string;
  timeoutMs?: number;
}

export interface OrganizeResult {
  segments: MmSegment[];
  topics: MmTopic[];
  decisions: MmDecision[];
  summaryLines: string[];
  source: 'llm' | 'rules';
  note?: string;
}

/** 给模型看的文字稿，超长时按比例截短每段 */
export function transcriptForLlm(segments: MmSegment[], names: Record<string, string>, budget = 60_000): string {
  const lines = segments.map((s, k) => ({ head: `#${k + 1} [${fmtClock(s.start)}] ${names[s.speakerLabel] || s.speakerLabel}: `, text: s.text.replace(/\s+/g, ' ') }));
  const total = lines.reduce((a, l) => a + l.head.length + l.text.length + 1, 0);
  if (total <= budget) return lines.map(l => l.head + l.text).join('\n');
  const heads = lines.reduce((a, l) => a + l.head.length + 2, 0);
  const ratio = Math.max(0.05, (budget - heads) / Math.max(1, total - heads));
  return lines.map(l => l.head + truncate(l.text, Math.max(40, Math.floor(l.text.length * ratio)))).join('\n');
}

// ─── 规则兜底 ─────────────────────────────────────────────────────────────

/** 时间线分块：15 分钟以内一个议题；更长的按约 10 分钟、优先在长停顿处断开 */
export function fallbackTopics(segments: MmSegment[]): MmTopic[] {
  if (!segments.length) return [];
  const duration = segments[segments.length - 1]!.end - segments[0]!.start;
  const blocks: MmSegment[][] = [];
  if (duration <= 15 * 60) blocks.push(segments);
  else {
    const target = 10 * 60;
    let cur: MmSegment[] = [];
    let blockStart = segments[0]!.start;
    for (let k = 0; k < segments.length; k++) {
      const s = segments[k]!;
      cur.push(s);
      const next = segments[k + 1];
      if (!next) break;
      const elapsed = next.start - blockStart;
      const gap = next.start - s.end;
      if ((elapsed >= target && gap >= 3) || elapsed >= target * 1.5) {
        blocks.push(cur);
        cur = [];
        blockStart = next.start;
      }
    }
    if (cur.length) blocks.push(cur);
  }
  return blocks.map((b, k) => ({ id: `tp_${k + 1}`, title: topicTitle(b, k), segmentIds: b.map(s => s.id) }));
}

function topicTitle(block: MmSegment[], k: number): string {
  for (const s of block) {
    const sent = splitSentences(s.text).find(x => x.replace(/[，,。.!！?？\s]/g, '').length >= 6);
    if (sent) return truncate(sent.replace(/[。！？!?；;]+$/, ''), 18);
  }
  return i18nT('议题 {p0}', { p0: k + 1 });
}

export function fallbackDecisions(segments: MmSegment[], max = 15): MmDecision[] {
  const found: Array<{ text: string; segId: string; score: number; order: number }> = [];
  const seen = new Set<string>();
  let order = 0;
  for (const s of segments) {
    for (const sent of splitSentences(s.text)) {
      const t = sent.trim();
      const plain = t.replace(/[，,。.!！?？；;\s]/g, '');
      if (plain.length < 8 || plain.length > 120) continue;
      if (/[?？]$/.test(t) || /[吗呢吧]$/.test(plain)) continue;
      const score = DECISION_WORDS.filter(w => t.includes(w)).length;
      if (!score) continue;
      if (seen.has(plain)) continue;
      seen.add(plain);
      found.push({ text: t, segId: s.id, score, order: order++ });
    }
  }
  const picked = found.length > max ? found.slice().sort((a, b) => b.score - a.score || a.order - b.order).slice(0, max).sort((a, b) => a.order - b.order) : found;
  return picked.map((d, k) => ({ id: `dc_${k + 1}`, text: d.text, segmentIds: [d.segId] }));
}

export function fallbackSummary(topics: MmTopic[], segments: MmSegment[], decisions: MmDecision[]): string[] {
  const byId = new Map(segments.map(s => [s.id, s]));
  const lines: string[] = [];
  for (const tp of topics) {
    const first = tp.segmentIds.map(id => byId.get(id)).find(s => s && splitSentences(s.text).some(x => x.length >= 6));
    const sent = first ? splitSentences(first.text).find(x => x.length >= 6) : undefined;
    if (sent) lines.push(truncate(sent, 60));
    if (lines.length >= 3) break;
  }
  for (const d of decisions) {
    if (lines.length >= 3) break;
    if (!lines.includes(d.text)) lines.push(truncate(d.text, 60));
  }
  return [...new Set(lines)].slice(0, 3);
}

// ─── 模型结果校验 ─────────────────────────────────────────────────────────

function segRefs(v: unknown, segments: MmSegment[]): string[] {
  if (!Array.isArray(v)) return [];
  const ids: string[] = [];
  for (const x of v) {
    const n = typeof x === 'number' ? x : typeof x === 'string' ? Number(x.replace(/^#/, '')) : NaN;
    if (Number.isInteger(n) && n >= 1 && n <= segments.length) ids.push(segments[n - 1]!.id);
  }
  return [...new Set(ids)];
}

/** 决议没给段号时，按字面重合找最像的那段 */
function bestSegmentFor(text: string, segments: MmSegment[]): string[] {
  const chars = new Set(text.replace(/[\s，,。.!！?？]/g, ''));
  let best: MmSegment | null = null;
  let bs = 0;
  for (const s of segments) {
    let hit = 0;
    for (const c of new Set(s.text)) if (chars.has(c)) hit++;
    const score = hit / Math.max(1, chars.size);
    if (score > bs) { bs = score; best = s; }
  }
  return best && bs >= 0.4 ? [best.id] : [];
}

export function validateOrganize(raw: any, segments: MmSegment[]): { topics: MmTopic[]; decisions: MmDecision[]; summary: string[]; dropped: number } | null {
  if (!raw || typeof raw !== 'object') return null;
  const allText = segments.map(s => s.text).join('\n');
  const allowed = new Set(numberTokens(allText));
  let dropped = 0;
  const claimed = new Set<string>();
  const topics: MmTopic[] = [];
  for (const t of Array.isArray(raw.topics) ? raw.topics : []) {
    const title = typeof t?.title === 'string' ? truncate(t.title.replace(/\s+/g, ' '), 30) : '';
    const ids = segRefs(t?.segments, segments).filter(id => !claimed.has(id));
    if (!title || !ids.length) { dropped++; continue; }
    ids.forEach(id => claimed.add(id));
    topics.push({ id: '', title, segmentIds: ids });
  }
  const decisions: MmDecision[] = [];
  const seen = new Set<string>();
  for (const d of Array.isArray(raw.decisions) ? raw.decisions : []) {
    const text = typeof d === 'string' ? d.trim() : typeof d?.text === 'string' ? d.text.trim() : '';
    if (text.length < 4 || text.length > 300 || seen.has(text)) { dropped++; continue; }
    if (numberTokens(text).some(n => !allowed.has(n))) { dropped++; continue; }
    seen.add(text);
    const ids = segRefs(d?.segments, segments);
    decisions.push({ id: '', text, segmentIds: ids.length ? ids : bestSegmentFor(text, segments) });
    if (decisions.length >= 30) break;
  }
  const summary: string[] = [];
  for (const line of Array.isArray(raw.summary) ? raw.summary : typeof raw.summary === 'string' ? raw.summary.split('\n') : []) {
    if (typeof line !== 'string') continue;
    const l = line.replace(/^\s*(?:[-*•]|\d[.)、])\s*/, '').trim();
    if (!l) continue;
    const g = guardNumbers(l, allowed);
    if (!g.text) { dropped++; continue; }
    summary.push(truncate(g.text, 80));
    if (summary.length >= 3) break;
  }
  if (!topics.length && !decisions.length && !summary.length) return null;
  return { topics, decisions, summary, dropped };
}

/** 没被任何议题认领的段，接到时间上前一个议题（开头的接到第一个） */
function assignLeftovers(topics: MmTopic[], segments: MmSegment[]): MmTopic[] {
  const owner = new Map<string, number>();
  topics.forEach((t, k) => t.segmentIds.forEach(id => owner.set(id, k)));
  let prev = -1;
  const order = segments.map(s => s.id);
  const firstOwned = order.find(id => owner.has(id));
  const firstTopic = firstOwned !== undefined ? owner.get(firstOwned)! : 0;
  for (const id of order) {
    const k = owner.get(id);
    if (k !== undefined) { prev = k; continue; }
    const target = prev >= 0 ? prev : firstTopic;
    topics[target]!.segmentIds.push(id);
    owner.set(id, target);
  }
  const pos = new Map(order.map((id, i) => [id, i]));
  for (const t of topics) t.segmentIds.sort((a, b) => pos.get(a)! - pos.get(b)!);
  return topics.sort((a, b) => pos.get(a.segmentIds[0]!)! - pos.get(b.segmentIds[0]!)!);
}

export async function organizeMinutes(i: OrganizeInput): Promise<OrganizeResult> {
  const segments = i.segments;
  if (!segments.length) return { segments, topics: [], decisions: [], summaryLines: [], source: 'rules' };
  let parsed: ReturnType<typeof validateOrganize> = null;
  let note: string | undefined;
  try {
    const raw = await i.llm(organizePrompt(transcriptForLlm(segments, i.speakerNames), i.attendeeNames.join('、'), i.prompt), { json: true, timeoutMs: i.timeoutMs ?? 180_000 });
    if (raw === null) note = i18nT('模型不可用，已按规则整理');
    else {
      parsed = validateOrganize(parseLlmJson(raw), segments);
      if (!parsed) note = i18nT('模型返回的格式不对，已按规则整理');
    }
  } catch {
    note = i18nT('模型调用失败，已按规则整理');
  }

  let topics: MmTopic[];
  let decisions: MmDecision[];
  let summaryLines: string[];
  let source: 'llm' | 'rules' = 'llm';
  if (parsed) {
    topics = parsed.topics.length ? assignLeftovers(parsed.topics, segments) : fallbackTopics(segments);
    decisions = parsed.decisions;
    summaryLines = parsed.summary;
    if (summaryLines.length < 3) {
      for (const l of fallbackSummary(topics, segments, decisions)) {
        if (summaryLines.length >= 3) break;
        if (!summaryLines.includes(l)) summaryLines.push(l);
      }
    }
  } else {
    source = 'rules';
    topics = fallbackTopics(segments);
    decisions = fallbackDecisions(segments);
    summaryLines = fallbackSummary(topics, segments, decisions);
  }
  topics = topics.map((t, k) => ({ ...t, id: `tp_${k + 1}` }));
  decisions = decisions.map((d, k) => ({ ...d, id: `dc_${k + 1}` }));
  const topicOf = new Map<string, string>();
  topics.forEach(t => t.segmentIds.forEach(id => topicOf.set(id, t.id)));
  return {
    segments: segments.map(s => ({ ...s, topicId: topicOf.get(s.id) })),
    topics,
    decisions,
    summaryLines,
    source,
    note,
  };
}
