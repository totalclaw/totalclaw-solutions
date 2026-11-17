/**
 * 文字记录解析：txt / md / srt / vtt / json / docx → 发言段 + 发言人槽位（跳过转写）。
 *
 * 认得的写法（腾讯会议 / 飞书 / Zoom 导出、手打纪要常见）：
 *   「张三：内容」「[00:01:02] 张三：内容」「00:01:02 张三：内容」「张三(00:01:02)：内容」「张三 [00:01:02]：内容」
 *   「张三 00:01:02」单独一行、下面几行是内容；Markdown 的「**张三**：」「- 张三：」「### 张三 00:01」
 *   srt / vtt 的「张三: 内容」「<v 张三>内容」；json 数组（speaker / text / start / end 等常见字段名）。
 * 发言人按参会人姓名 / 昵称匹配员工（matchedBy = 'nickname'）；整篇没有发言人标注的归一个 'S1' 交主持人分配。
 * 「时间：」「地点：」这类元信息、只出现一次又不是参会人的标签不当发言人。
 */
import { readFileSync } from 'fs';
import { extname } from 'path';
import type { MmPerson, MmSegment, MmSpeakerSlot } from '../../../../shared/meetingMgmt/types';
import { GENERIC_SPEAKER_RE, TRANSCRIPT_META_LABELS } from './matchWords';

export interface ParsedTranscript {
  segments: MmSegment[];
  speakers: MmSpeakerSlot[];
  durationSec?: number;
}

interface Entry {
  speaker?: string;
  time?: number;
  end?: number;
  text: string;
  /** 段落边界（空行）之后的第一行 */
  para?: boolean;
}

/** 解析钟点：01:02:03 / 1:02:03.5 / 02:03 / 00:00:01,000 / 00:01.000 */
export function parseClock(s: string): number | null {
  const m = /^\s*(?:(\d{1,3}):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?\s*$/.exec(s);
  if (!m) return null;
  const h = m[1] ? Number(m[1]) : 0;
  const mi = Number(m[2]);
  const se = Number(m[3]);
  if (mi >= 60 && m[1]) return null;
  if (se >= 60) return null;
  const frac = m[4] ? Number(`0.${m[4]}`) : 0;
  return h * 3600 + mi * 60 + se + frac;
}

const CLOCK = String.raw`(?<![\d:])\d{1,3}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?(?![\d:])`;
const NAME = String.raw`[^\s:：\[\]【】()（）<>"“”'‘’，,。.!！?？;；|]{1,20}(?:\s[^\s:：\[\]【】()（）<>"“”'‘’，,。.!！?？;；|]{1,20}){0,2}`;
const RE_TIME_NAME_TEXT = new RegExp(String.raw`^[\[【(（]?(${CLOCK})[\]】)）]?\s*(${NAME})\s*[:：]\s*(.*)$`);
const RE_NAME_TIME_TEXT = new RegExp(String.raw`^(${NAME})\s*[\[【(（]?(${CLOCK})[\]】)）]?\s*[:：]\s*(.*)$`);
const RE_NAME_TEXT = new RegExp(String.raw`^(${NAME})\s*[:：]\s*(.+)$`);
const RE_NAME_TIME_HEADER = new RegExp(String.raw`^(${NAME})\s*[\[【(（]?(${CLOCK})[\]】)）]?\s*$`);
const RE_TIME_HEADER_NAME = new RegExp(String.raw`^[\[【(（]?(${CLOCK})[\]】)）]?\s+(${NAME})\s*$`);
const RE_TIME_TEXT = new RegExp(String.raw`^[\[【(（]?(${CLOCK})[\]】)）]?\s+(.+)$`);
const RE_BRACKET_NAME_TEXT = new RegExp(String.raw`^[\[【](${NAME})[\]】]\s*(.+)$`);

function stripMarkdown(line: string): string {
  return line
    .replace(/^\s{0,3}#{1,6}\s+/, '')
    .replace(/^\s*>\s?/, '')
    .replace(/^\s*(?:[-*+]|\d{1,3}[.)、])\s+/, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .trim();
}

function isMetaLabel(name: string): boolean {
  const n = name.trim().toLowerCase();
  return TRANSCRIPT_META_LABELS.some(m => n === m || n.startsWith(m)) || /^\d+$/.test(n);
}

function plausibleName(name: string): boolean {
  const n = name.trim();
  if (!n || n.length > 24) return false;
  if (/^\d/.test(n) && !GENERIC_SPEAKER_RE.test(n)) return false;
  if (/https?|www\./i.test(n)) return false;
  return true;
}

/** 一行 → 条目（带不带发言人 / 时间） */
function parseLine(raw: string): Entry | null {
  const line = stripMarkdown(raw);
  if (!line) return null;
  let m: RegExpExecArray | null;
  // 整行只有「昵称 + 时间」的先判：「林晓 00:00:03」里的冒号不能被当成「昵称：内容」
  if ((m = RE_NAME_TIME_HEADER.exec(line)) && plausibleName(m[1]!)) return { speaker: m[1]!.trim(), time: parseClock(m[2]!) ?? undefined, text: '' };
  if ((m = RE_TIME_HEADER_NAME.exec(line)) && plausibleName(m[2]!) && !/\s/.test(m[2]!.trim())) return { speaker: m[2]!.trim(), time: parseClock(m[1]!) ?? undefined, text: '' };
  if ((m = RE_TIME_NAME_TEXT.exec(line)) && plausibleName(m[2]!)) return { time: parseClock(m[1]!) ?? undefined, speaker: m[2]!.trim(), text: m[3]!.trim() };
  if ((m = RE_NAME_TIME_TEXT.exec(line)) && plausibleName(m[1]!)) return { speaker: m[1]!.trim(), time: parseClock(m[2]!) ?? undefined, text: m[3]!.trim() };
  if ((m = RE_NAME_TEXT.exec(line)) && plausibleName(m[1]!)) return { speaker: m[1]!.trim(), text: m[2]!.trim() };
  if ((m = RE_BRACKET_NAME_TEXT.exec(line)) && plausibleName(m[1]!)) return { speaker: m[1]!.trim(), text: m[2]!.trim() };
  if ((m = RE_TIME_TEXT.exec(line))) return { time: parseClock(m[1]!) ?? undefined, text: m[2]!.trim() };
  return { text: line };
}

/** 发言人标签 → 参会人（姓名 / 昵称 / 企微 userid；去掉括号里的角色、部门） */
export function matchNickname(label: string, attendees: MmPerson[]): MmPerson | null {
  const clean = (s: string) => s.toLowerCase().replace(/[（(\[【][^）)\]】]*[）)\]】]/g, '').replace(/[\s·・._\-—]/g, '');
  const l = clean(label);
  if (!l || GENERIC_SPEAKER_RE.test(label.trim())) return null;
  const exact = attendees.filter(p => clean(p.name) === l || (p.wecomUserId && p.wecomUserId.toLowerCase() === label.trim().toLowerCase()) || p.id.toLowerCase() === label.trim().toLowerCase());
  if (exact.length === 1) return exact[0]!;
  if (exact.length > 1) return null;
  const contains = attendees.filter(p => {
    const n = clean(p.name);
    return n.length >= 2 && (l.includes(n) || (l.length >= 2 && n.includes(l)));
  });
  if (contains.length === 1) return contains[0]!;
  if (contains.length > 1) {
    // 「张三丰」同时含「张三」：取最长的名字，最长的唯一才算
    const maxLen = Math.max(...contains.map(p => clean(p.name).length));
    const longest = contains.filter(p => clean(p.name).length === maxLen && l.includes(clean(p.name)));
    if (longest.length === 1) return longest[0]!;
  }
  return null;
}

/** 字幕块（srt / vtt） */
function parseCues(text: string): Entry[] {
  const out: Entry[] = [];
  const blocks = text.replace(/\r\n?/g, '\n').split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const ti = lines.findIndex(l => l.includes('-->'));
    if (ti < 0) continue;
    const [a, b] = lines[ti]!.split('-->');
    const start = parseClock((a || '').trim());
    const end = parseClock(((b || '').trim().split(/\s+/)[0]) || '');
    let body = lines.slice(ti + 1).join('\n');
    let speaker: string | undefined;
    const v = /<v(?:\.[^\s>]+)?\s+([^>]+)>/.exec(body);
    if (v) speaker = v[1]!.trim();
    body = body.replace(/<[^>]+>/g, '').replace(/\{\\[^}]*\}/g, '').trim();
    if (!speaker) {
      const m = /^([^\s:：]{1,20}(?:\s[^\s:：]{1,20}){0,2})\s*[:：]\s*(.+)$/s.exec(body);
      if (m && plausibleName(m[1]!) && !isMetaLabel(m[1]!)) { speaker = m[1]!.trim(); body = m[2]!.trim(); }
    }
    if (!body) continue;
    out.push({ speaker, time: start ?? undefined, end: end ?? undefined, text: body.replace(/\s*\n\s*/g, ' ') });
  }
  return out;
}

/** 纯文本 / Markdown / docx 抽出的文本 */
function parsePlain(text: string): Entry[] {
  const out: Entry[] = [];
  let blank = true;
  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (!raw.trim()) { blank = true; continue; }
    if (/^\s*(?:[-*_=]){3,}\s*$/.test(raw)) { blank = true; continue; }
    const e = parseLine(raw);
    if (!e) continue;
    if (blank) e.para = true;
    blank = false;
    out.push(e);
  }
  return out;
}

const TEXT_KEYS = ['text', 'content', 'sentence', 'transcript', 'onebest', 'value', 'words', 'msg', 'message'];
const SPEAKER_KEYS = ['speaker', 'speaker_name', 'speakerName', 'name', 'nickname', 'nickName', 'userName', 'user_name', 'user', 'role', 'spk', 'speaker_id', 'speakerId'];
const START_KEYS = ['start', 'begin', 'start_time', 'startTime', 'bg', 'st', 'from', 'offset', 'begin_time', 'beginTime', 'timestamp'];
const END_KEYS = ['end', 'end_time', 'endTime', 'ed', 'to', 'finish'];

function findRecords(v: unknown, depth = 0): Array<Record<string, unknown>> | null {
  if (depth > 5 || !v) return null;
  if (Array.isArray(v)) {
    const objs = v.filter(x => x && typeof x === 'object' && !Array.isArray(x)) as Array<Record<string, unknown>>;
    if (objs.length && objs.some(o => TEXT_KEYS.some(k => typeof o[k] === 'string'))) return objs;
    for (const x of v) { const r = findRecords(x, depth + 1); if (r) return r; }
    return null;
  }
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    for (const k of ['segments', 'sentences', 'paragraphs', 'utterances', 'results', 'transcripts', 'transcript', 'data', 'list', 'items', 'records']) {
      const r = findRecords(obj[k], depth + 1);
      if (r) return r;
    }
    for (const k of Object.keys(obj)) { const r = findRecords(obj[k], depth + 1); if (r) return r; }
  }
  return null;
}

function parseJson(text: string): Entry[] {
  let data: unknown;
  try { data = JSON.parse(text.replace(/^﻿/, '')); } catch { return parsePlain(text); }
  const recs = findRecords(data);
  if (!recs) return [];
  const pick = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]; return undefined; };
  const raw = recs.map(o => {
    const t = pick(o, TEXT_KEYS);
    const sp = pick(o, SPEAKER_KEYS);
    return {
      text: typeof t === 'string' ? t.trim() : '',
      speaker: typeof sp === 'number' ? `S${sp + 1}` : typeof sp === 'string' ? sp.trim() : undefined,
      start: pick(o, START_KEYS),
      end: pick(o, END_KEYS),
    };
  }).filter(r => r.text);
  const num = (x: unknown): number | undefined => {
    if (typeof x === 'number' && Number.isFinite(x)) return x;
    if (typeof x === 'string') { const c = parseClock(x); if (c !== null) return c; const n = Number(x); if (Number.isFinite(n)) return n; }
    return undefined;
  };
  const starts = raw.map(r => num(r.start)).filter((x): x is number => x !== undefined);
  // 毫秒还是秒：超过 10 小时的「秒」不可能是会议，按毫秒算
  const ms = starts.some(x => x > 36000);
  const conv = (x: unknown) => { const n = num(x); return n === undefined ? undefined : ms && typeof x !== 'string' ? n / 1000 : n; };
  return raw.map(r => ({ text: r.text, speaker: r.speaker, time: conv(r.start), end: conv(r.end) }));
}

/** 字数估说话时长（没有时间戳时排时间线用） */
function estimateSeconds(text: string): number {
  const cjk = (text.match(/[㐀-鿿]/g) || []).length;
  const words = (text.replace(/[㐀-鿿]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, cjk / 4.5 + words / 2.5);
}

export interface ParseOptions {
  attendees: MmPerson[];
  /** 合并同一人连续发言的上限 */
  maxMergeSec?: number;
  maxMergeChars?: number;
}

/** 条目 → 发言段与槽位 */
export function buildFromEntries(entries: Entry[], o: ParseOptions): ParsedTranscript {
  // 哪些标签算发言人：参会人、或出现 ≥ 2 次且不是元信息
  const counts = new Map<string, number>();
  for (const e of entries) if (e.speaker) counts.set(e.speaker, (counts.get(e.speaker) || 0) + 1);
  const accepted = new Set<string>();
  for (const [name, c] of counts) {
    if (isMetaLabel(name)) continue;
    if (matchNickname(name, o.attendees) || c >= 2 || GENERIC_SPEAKER_RE.test(name)) accepted.add(name);
  }
  const labeled = entries.some(e => e.speaker && accepted.has(e.speaker));
  // 不认的标签还原成普通文字
  const items: Entry[] = entries.map(e => (e.speaker && !accepted.has(e.speaker)
    ? { ...e, speaker: undefined, text: e.text ? `${e.speaker}：${e.text}` : e.speaker }
    : e));

  // 组段：有发言人的文档，一条发言人条目开一段，后面没有标签的行接在这段后面
  interface Draft { speaker: string; start?: number; end?: number; texts: string[]; timed?: boolean }
  const drafts: Draft[] = [];
  for (const e of items) {
    if (labeled) {
      if (e.speaker) { drafts.push({ speaker: e.speaker, start: e.time, end: e.end, texts: e.text ? [e.text] : [], timed: e.time !== undefined }); continue; }
      const last = drafts[drafts.length - 1];
      if (!last) {
        // 正文前的标题 / 元信息不进纪要
        continue;
      }
      if (e.text) last.texts.push(e.text);
      if (e.end !== undefined) last.end = e.end;
      continue;
    }
    // 没有发言人：空行分段（字幕 / json 一条一段，后面再按时间合并）
    const last = drafts[drafts.length - 1];
    if (last && !e.para && e.time === undefined && last.texts.join('').length < 600) { last.texts.push(e.text); continue; }
    drafts.push({ speaker: 'S1', start: e.time, end: e.end, texts: [e.text], timed: e.time !== undefined });
  }
  const filled = drafts.filter(d => d.texts.join('').trim());
  if (!filled.length) return { segments: [], speakers: [] };

  // 时间线：有时间戳用时间戳，缺的按字数估
  let cursor = 0;
  for (let k = 0; k < filled.length; k++) {
    const d = filled[k]!;
    const est = estimateSeconds(d.texts.join(''));
    if (d.start === undefined || d.start < cursor - 1) d.start = cursor;
    if (d.end === undefined || d.end <= d.start) {
      const next = filled.slice(k + 1).find(x => x.start !== undefined && x.start > d.start!);
      d.end = next ? Math.min(next.start!, d.start + est) : d.start + est;
      if (d.end <= d.start) d.end = d.start + est;
    }
    cursor = d.end;
  }

  // 同一人连续的合并（有上限，免得一段几十分钟改不动）
  const maxSec = o.maxMergeSec ?? 120;
  const maxChars = o.maxMergeChars ?? 600;
  const merged: Draft[] = [];
  for (const d of filled) {
    const last = merged[merged.length - 1];
    const lastText = last ? last.texts.join(labeled ? '' : '\n') : '';
    // 没有发言人标注时，只合并带真时间戳、停顿很短的相邻条（字幕）；空行分出来的段落保持原样
    const gapOk = !last || labeled || (!!d.timed && !!last.timed && (d.start! - last.end!) < 1.5);
    if (last && last.speaker === d.speaker && gapOk && d.end! - last.start! <= maxSec && lastText.length + d.texts.join('').length <= maxChars) {
      last.texts.push(...d.texts);
      last.end = d.end;
      continue;
    }
    merged.push({ ...d, texts: [...d.texts] });
  }

  const segments: MmSegment[] = merged.map((d, k) => ({
    id: `seg_${k + 1}`,
    start: Math.round(d.start! * 100) / 100,
    end: Math.round(d.end! * 100) / 100,
    speakerLabel: d.speaker,
    text: joinTexts(d.texts),
  }));
  const order: string[] = [];
  for (const s of segments) if (!order.includes(s.speakerLabel)) order.push(s.speakerLabel);
  const speakers: MmSpeakerSlot[] = order.map(label => {
    const p = label === 'S1' && !labeled ? null : matchNickname(label, o.attendees);
    return p ? { label, personId: p.id, matchedBy: 'nickname' as const } : { label };
  });
  return { segments, speakers, durationSec: Math.round(Math.max(...segments.map(s => s.end))) };
}

export function joinTexts(parts: string[]): string {
  let out = '';
  for (const raw of parts) {
    const t = raw.trim();
    if (!t) continue;
    if (out && /[A-Za-z0-9.,!?;:]$/.test(out) && /^[A-Za-z0-9]/.test(t)) out += ' ';
    out += t;
  }
  return out;
}

/** 按扩展名解析一份文字记录文件 */
export async function parseTranscriptFile(path: string, name: string, o: ParseOptions): Promise<ParsedTranscript> {
  const ext = extname(name || path).toLowerCase();
  let text: string;
  if (ext === '.docx' || ext === '.doc') {
    const { extractDocument } = await import('../../documentExtractor');
    const doc = await extractDocument(path, name);
    text = doc.text || '';
  } else {
    text = decodeText(readFileSync(path));
  }
  return parseTranscriptText(text, ext, o);
}

export function parseTranscriptText(text: string, ext: string, o: ParseOptions = { attendees: [] }): ParsedTranscript {
  const e = ext.toLowerCase();
  const body = text.replace(/^﻿/, '');
  let entries: Entry[];
  if (e === '.srt' || e === '.vtt' || /^WEBVTT/.test(body) || /\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}\s*-->/.test(body)) entries = parseCues(body);
  else if (e === '.json' || /^\s*[[{]/.test(body)) entries = parseJson(body);
  else entries = parsePlain(body);
  return buildFromEntries(entries, o);
}

/** UTF-8 / UTF-16（带 BOM）/ GB18030 */
export function decodeText(buf: Buffer): string {
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString('utf16le');
  if (buf[0] === 0xfe && buf[1] === 0xff) {
    const swapped = Buffer.from(buf.subarray(2));
    swapped.swap16();
    return swapped.toString('utf16le');
  }
  const utf8 = buf.toString('utf8');
  const bad = (utf8.match(/�/g) || []).length;
  if (bad > 3 && bad > utf8.length * 0.01) {
    try { return new TextDecoder('gb18030').decode(buf); } catch { /* */ }
  }
  return utf8.replace(/^﻿/, '');
}
