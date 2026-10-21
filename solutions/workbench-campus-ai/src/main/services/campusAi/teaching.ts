/**
 * 教学：智能出题与作业批改。
 *
 * 出题：模型只能从给它的课程资料片段里出题，每题必须带一句「逐字摘自原文」的引文；
 *   引文在对应片段里找不到、选项 / 答案格式不对的题一律丢掉（并报出丢了几道）。
 * 批改：单选 / 多选 / 判断按标准答案规则判分（多选须完全一致）；简答把同一题所有学生的作答
 *   编号后成批交给模型按评分要点给建议分（不发姓名学号），分数钳在 0～满分、按 0.5 取整；
 *   建议分要教师确认才算最终成绩，模型调不通的留「待评」由教师打分。
 */
import type { CaGradeItem, CaGradeRow, CaKeyItem, CaQuestion, CaQuestionType } from '@totalclaw/ipc-contracts';
import { CA_QUESTION_TYPES } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { SheetTable } from '../serviceSettlement/excel';

// ── 出题 ──────────────────────────────────────────────────────────────────────

export interface QuizChunk { title: string; text: string }

export function typeLabel(t: CaQuestionType): string {
  return { single: i18nT('单选题'), multiple: i18nT('多选题'), judge: i18nT('判断题'), short: i18nT('简答题') }[t];
}

export function buildQuizPrompt(courseName: string, chunks: QuizChunk[], counts: Record<CaQuestionType, number>, focus: string): string {
  const want = CA_QUESTION_TYPES.filter((t) => counts[t] > 0).map((t) => `${typeLabel(t)} ${counts[t]}`).join(i18nT('，'));
  return [
    i18nT('你是《{p0}》的任课教师，要根据下面的课程资料出题。', { p0: courseName }),
    i18nT('题量：{p0}。', { p0: want }),
    focus ? i18nT('侧重：{p0}。', { p0: focus }) : '',
    i18nT('每道题只能考资料里写明的内容；每道题必须给出 quote：从对应资料里逐字摘录的一句原文（10～60 字，不能改字），作为出题依据。'),
    i18nT('用 JSON 返回：{p0}', { p0: '{"questions":[{"type":"single|multiple|judge|short","stem":"...","options":["...","...","...","..."],"answer":"...","explanation":"...","source":1,"quote":"...","points":["..."],"score":2}]}' }),
    i18nT('single：4 个选项，answer 是一个字母（如 B）；multiple：4 个选项，answer 是两个以上字母（如 ACD）；judge：不要 options，answer 写「对」或「错」；short：不要 options，answer 写参考答案，points 写 2～4 条评分要点，score 写分值。'),
    i18nT('选项不要带 A. B. 前缀；source 是资料编号。'),
    '',
    i18nT('=== 课程资料 ==='),
    chunks.map((c, i) => `${i18nT('资料 {n}：{title}', { n: i + 1, title: c.title })}\n${c.text}`).join('\n\n'),
  ].filter(Boolean).join('\n');
}

/** 比对用：去掉空白与标点，全角转半角 */
export function looseText(s: string): string {
  return String(s || '')
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\s\p{P}\p{S}]+/gu, '')
    .toLowerCase();
}

const LETTERS = 'ABCDEFGH';

export function normalizeChoice(answer: unknown, optionCount: number): string {
  const letters = String(answer || '').toUpperCase().replace(/[^A-H]/g, '').split('').filter((c) => LETTERS.indexOf(c) < optionCount);
  return [...new Set(letters)].sort().join('');
}

/** 判断题内部一律存 T / F（存本地化的「对 / 错」会在切换界面语言后对不上） */
export function normalizeJudge(answer: unknown): string {
  const s = String(answer ?? '').trim().toLowerCase();
  if (/^(对|正确|是|√|✓|t|true|yes|y|1)$/.test(s)) return 'T';
  if (/^(错|错误|否|×|✗|x|f|false|no|n|0)$/.test(s)) return 'F';
  return '';
}

export function answerLabel(type: CaQuestionType, answer: string): string {
  if (type !== 'judge') return answer;
  return answer === 'T' ? i18nT('对') : answer === 'F' ? i18nT('错') : answer;
}

export interface ParsedQuiz { questions: Array<Omit<CaQuestion, 'id' | 'courseId' | 'createdAt' | 'reviewed'>>; dropped: number; reasons: string[] }

export function parseQuiz(json: any, chunks: QuizChunk[]): ParsedQuiz {
  const list = Array.isArray(json?.questions) ? json.questions : Array.isArray(json) ? json : [];
  const out: ParsedQuiz['questions'] = [];
  const reasons: string[] = [];
  const seen = new Set<string>();
  for (const q of list) {
    const type = String(q?.type || '') as CaQuestionType;
    const stem = String(q?.stem || '').trim();
    if (!CA_QUESTION_TYPES.includes(type) || !stem) { reasons.push(i18nT('题型或题干缺失')); continue; }
    const src = chunks[Number(q?.source) - 1];
    const quote = String(q?.quote || '').trim();
    if (!src || looseText(quote).length < 6 || !looseText(src.text).includes(looseText(quote))) { reasons.push(i18nT('引文在资料里找不到：{p0}', { p0: stem.slice(0, 20) })); continue; }
    const key = looseText(stem);
    if (seen.has(key)) { reasons.push(i18nT('重复题')); continue; }
    let options: string[] = [];
    let answer = '';
    if (type === 'single' || type === 'multiple') {
      options = (Array.isArray(q?.options) ? q.options : []).map((o: unknown) => String(o ?? '').replace(/^\s*[A-Ha-h][.、．:：)]\s*/, '').trim()).filter(Boolean);
      if (options.length < 3 || options.length > 6) { reasons.push(i18nT('选项数量不对：{p0}', { p0: stem.slice(0, 20) })); continue; }
      answer = normalizeChoice(q?.answer, options.length);
      if (type === 'single' && answer.length !== 1) { reasons.push(i18nT('单选答案不是一个选项：{p0}', { p0: stem.slice(0, 20) })); continue; }
      if (type === 'multiple' && answer.length < 2) { reasons.push(i18nT('多选答案少于两个：{p0}', { p0: stem.slice(0, 20) })); continue; }
    } else if (type === 'judge') {
      answer = normalizeJudge(q?.answer);
      if (!answer) { reasons.push(i18nT('判断题答案不是对 / 错：{p0}', { p0: stem.slice(0, 20) })); continue; }
    } else {
      answer = String(q?.answer || '').trim();
      if (!answer) { reasons.push(i18nT('简答题缺参考答案：{p0}', { p0: stem.slice(0, 20) })); continue; }
    }
    seen.add(key);
    const points = type === 'short' ? (Array.isArray(q?.points) ? q.points.map((p: unknown) => String(p).trim()).filter(Boolean).slice(0, 6) : []) : [];
    const defScore = type === 'short' ? 10 : type === 'multiple' ? 3 : 2;
    const score = Math.min(50, Math.max(1, Math.round(Number(q?.score) || defScore)));
    out.push({ type, stem, options, answer, explanation: String(q?.explanation || '').trim().slice(0, 400), sourceTitle: src.title, sourceQuote: quote, points, score });
  }
  return { questions: out, dropped: list.length - out.length, reasons: reasons.slice(0, 20) };
}

// ── 批改 ──────────────────────────────────────────────────────────────────────

const TYPE_WORDS: Array<[RegExp, CaQuestionType]> = [[/多选|multiple/i, 'multiple'], [/单选|选择|single|choice/i, 'single'], [/判断|是非|judge|true/i, 'judge'], [/简答|问答|论述|主观|short|essay/i, 'short']];

export function typeFromText(s: string): CaQuestionType | null {
  for (const [re, t] of TYPE_WORDS) if (re.test(String(s || ''))) return t;
  return null;
}

/** 题号归一：「第3题」「Q3」「3.」「题3」→ "3" */
export function questionNo(s: string): string {
  const m = /(\d+)/.exec(String(s || ''));
  return m ? String(Number(m[1])) : '';
}

const col = (headers: string[], re: RegExp): string => headers.find((h) => re.test(h)) || '';

/** 标准答案表：题号、题型、标准答案、分值、评分要点（；分隔） */
export function parseKey(table: SheetTable): { items: CaKeyItem[]; problems: string[] } {
  const h = table.headers;
  const cNo = col(h, /题号|序号|编号|^no\.?$/i);
  const cType = col(h, /题型|类型|type/i);
  const cAns = col(h, /标准答案|参考答案|答案|answer/i);
  const cScore = col(h, /分值|满分|分数|score/i);
  const cPts = col(h, /评分要点|要点|评分标准|points/i);
  const problems: string[] = [];
  if (!cNo || !cAns) return { items: [], problems: [i18nT('标准答案表要有「题号」和「标准答案」两列')] };
  const items: CaKeyItem[] = [];
  table.rows.forEach((r, i) => {
    const no = questionNo(r[cNo]);
    if (!no) { problems.push(i18nT('第 {n} 行没有题号', { n: i + 2 })); return; }
    let type = cType ? typeFromText(r[cType]) : null;
    const raw = String(r[cAns] ?? '').trim();
    if (!type) type = /^[A-Ha-h]{1}$/.test(raw) ? 'single' : /^[A-Ha-h]{2,}$/.test(raw) ? 'multiple' : normalizeJudge(raw) ? 'judge' : 'short';
    const score = Number(String(r[cScore] ?? '').replace(/[^\d.]/g, '')) || (type === 'short' ? 10 : 2);
    const answer = type === 'single' || type === 'multiple' ? normalizeChoice(raw, 8) : type === 'judge' ? normalizeJudge(raw) : raw;
    if (!answer) { problems.push(i18nT('第 {n} 题没有标准答案', { n: no })); return; }
    const points = cPts ? String(r[cPts] || '').split(/[；;\n]/).map((x) => x.trim()).filter(Boolean) : [];
    if (items.some((x) => x.no === no)) { problems.push(i18nT('第 {n} 题重复，只留第一行', { n: no })); return; }
    items.push({ no, type, answer, score, points });
  });
  return { items, problems };
}

export interface AnswerSheet { studentId: string; name: string; responses: Record<string, string> }

/** 学生作答表：学号、姓名 + 每题一列（列名里带题号） */
export function parseAnswers(table: SheetTable, key: CaKeyItem[]): { sheets: AnswerSheet[]; problems: string[] } {
  const h = table.headers;
  const cId = col(h, /学号|student/i);
  const cName = col(h, /姓名|名字|name/i);
  const problems: string[] = [];
  if (!cId) return { sheets: [], problems: [i18nT('作答表要有「学号」列')] };
  const qCols = new Map<string, string>();
  for (const x of h) {
    if (x === cId || x === cName) continue;
    const no = questionNo(x);
    if (no && key.some((k) => k.no === no) && !qCols.has(no)) qCols.set(no, x);
  }
  const missing = key.filter((k) => !qCols.has(k.no)).map((k) => k.no);
  if (missing.length) problems.push(i18nT('作答表里找不到这些题的列：{p0}', { p0: missing.join('、') }));
  const sheets: AnswerSheet[] = [];
  const seen = new Set<string>();
  table.rows.forEach((r, i) => {
    const id = String(r[cId] || '').trim().replace(/\.0$/, '');
    if (!id) { problems.push(i18nT('第 {n} 行没有学号', { n: i + 2 })); return; }
    if (seen.has(id)) { problems.push(i18nT('学号 {p0} 重复，只留第一行', { p0: id })); return; }
    seen.add(id);
    const responses: Record<string, string> = {};
    for (const [no, c] of qCols) responses[no] = String(r[c] ?? '').trim();
    sheets.push({ studentId: id, name: cName ? String(r[cName] || '').trim() : '', responses });
  });
  return { sheets, problems: problems.slice(0, 30) };
}

export function gradeObjective(k: CaKeyItem, response: string): CaGradeItem {
  const resp = k.type === 'judge' ? normalizeJudge(response) : normalizeChoice(response, 8);
  const ok = !!resp && resp === k.answer;
  return {
    no: k.no, response, auto: ok ? k.score : 0, final: ok ? k.score : 0, max: k.score,
    reason: ok ? i18nT('与标准答案一致') : resp ? i18nT('标准答案 {p0}', { p0: answerLabel(k.type, k.answer) }) : i18nT('未作答'),
    by: 'rule',
  };
}

export function buildShortPrompt(k: CaKeyItem, responses: Array<{ i: number; text: string }>, stem?: string): string {
  return [
    i18nT('你是阅卷老师。按参考答案与评分要点，给下面每份作答打分（满分 {p0} 分，可给 0.5 分），并用一句话说明理由。', { p0: k.score }),
    stem ? i18nT('题目：{p0}', { p0: stem }) : '',
    i18nT('参考答案：{p0}', { p0: k.answer }),
    k.points.length ? i18nT('评分要点：{p0}', { p0: k.points.join('；') }) : '',
    i18nT('用 JSON 返回：{p0}', { p0: '{"scores":[{"i":1,"score":0,"reason":"..."}]}' }),
    i18nT('空白或与题目无关的作答给 0 分。只按作答内容评分，不要因为字数多少加减分。'),
    '',
    i18nT('=== 学生作答（已匿名编号） ==='),
    ...responses.map((r) => `#${r.i}: ${r.text || i18nT('（空白）')}`),
  ].filter(Boolean).join('\n');
}

export function clampScore(v: unknown, max: number): number | null {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(0, Math.round(n * 2) / 2));
}

export function rowTotal(items: CaGradeItem[]): number {
  return Math.round(items.reduce((s, x) => s + (x.final ?? 0), 0) * 10) / 10;
}

export function newRow(sheet: AnswerSheet, key: CaKeyItem[]): CaGradeRow {
  const items = key.map((k) => (k.type === 'short'
    ? { no: k.no, response: sheet.responses[k.no] || '', auto: null, final: null, max: k.score, reason: '', by: 'pending' as const }
    : gradeObjective(k, sheet.responses[k.no] || '')));
  return { studentId: sheet.studentId, name: sheet.name, items, total: rowTotal(items), confirmed: false };
}
