/**
 * 动态出题（说明书第十一、十二节 / 能力④）：基于锁定经文 + 批准资料**生成**题目，不是从固定题库抽。
 *
 * 随机化维度：题目组合 / 题目顺序 / 选项顺序 / 表达方式（每题型 3 套措辞）。
 * 随机化边界：从不改动经文；选项、填空词、排序项全部逐字取自锁定语料或批准词表。
 * 每题保存：来源章/节、概念、题型、难度、批准资料 id、解析、自动一致性检查结果。
 * 检查不过的题 verified=false，组卷时剔除（说明书 12：无法确认答案的题不下发）。
 */
import type {
  QuranConcept, QuranDifficulty, QuranDimension, QuranLang, QuranPaper, QuranParseResult, QuranQuestion, QuranQuestionType, QuranUnit, QuranVerse, QuranVocabEntry,
 QuranPaperVariant,} from '@totalclaw/ipc-contracts';
import templates from './quizTemplates.json';
import { SeededRng } from './rng';
// 变体摊平逻辑与渲染层共用一份实现（两边算出来的必须是同一份）
import { questionsForStudent, variantQuestions } from '../../../shared/quranPaperVariant';
export { questionsForStudent, variantQuestions };
import { rangeLabel, tokenizeVerse } from './textUtils';

type Tri3 = [string, string, string];
const TPL = templates as unknown as Record<string, Tri3[]> & { explain: Record<string, Tri3>; verify: Record<string, Tri3>; paperTitle: Record<string, Tri3>; eventLabel: Tri3; unitLabel: Tri3 };

const LI: Record<QuranLang, number> = { zh: 0, en: 1, ar: 2 };

export function fill(tpl: Tri3, lang: QuranLang, vars: Record<string, string | number>): string {
  return tidyPunctuation(tpl[LI[lang]].replace(/\{(\w+)\}/g, (_m, k) => (vars[k] === undefined ? `{${k}}` : String(vars[k]))));
}

/**
 * 模板拼接后的标点收尾（所有模板文案都经 fill，统一在这里处理）：
 * 插值自带句末标点、模板又紧跟一个句号时只留一个（批准资料「……依次并列。」+「{body}。学习路径」→「并列。学习路径」）；
 * 插值为空留下的「：。」「: .」同样收掉。英文省略号「...」不动。
 */
export function tidyPunctuation(s: string): string {
  return s
    .replace(/([。！？；])[ \t]*[。．.]+/g, '$1')
    .replace(/(?<!\.)([.!?])[ \t]*\.(?!\.)/g, '$1')
    .replace(/[：:][ \t]*([。．.])(?!\.)/g, '$1');
}

export interface QuizContext {
  lang: QuranLang;
  chapterName: string;
  verses: QuranVerse[];
  /** 整章（做干扰项时可越出所选范围，但不越出本章） */
  chapterVerses: QuranVerse[];
  parse: QuranParseResult;
  glossarySource: string;
}

interface Draft {
  type: QuranQuestionType;
  difficulty: QuranDifficulty;
  dimension: QuranDimension;
  kind: string; // 模板键
  stem: string;
  options: string[];
  left?: string[];
  answer: number | number[];
  sourceRefs: string[];
  conceptId?: string;
  conceptLabel?: string;
  materialIds: string[];
  explanation: string;
  phrasing: number;
  /** 校验用：答案文本（逐字） */
  proof: { kind: 'verbatim' | 'order' | 'material'; texts?: string[]; refs?: string[]; ids?: string[] };
}


function labelOf(tri: { zh: string; en: string; ar: string }, lang: QuranLang): string { return tri[lang]; }

/** 干扰项：优先同范围，不够补同章；再不够就是真的不够（题型跳过） */
function distractVerses(ctx: QuizContext, rng: SeededRng, exclude: Set<string>, n: number): QuranVerse[] {
  const pool = ctx.verses.filter((v) => !exclude.has(v.ref));
  const extra = ctx.chapterVerses.filter((v) => !exclude.has(v.ref) && !pool.includes(v));
  const picked = rng.sample(pool, n);
  if (picked.length < n) picked.push(...rng.sample(extra, n - picked.length));
  // 去重相同原文（第 55 章的反问句重复 31 次）
  const seen = new Set<string>();
  return picked.filter((v) => { if (seen.has(v.arabic)) return false; seen.add(v.arabic); return true; });
}

function shuffleOptions(rng: SeededRng, options: string[], correct: number): { options: string[]; answer: number } {
  const idx = rng.shuffle(options.map((_, i) => i));
  return { options: idx.map((i) => options[i]), answer: idx.indexOf(correct) };
}

// ── 各题型生成器 ─────────────────────────────────────────

function genIdentify(ctx: QuizContext, rng: SeededRng): Draft | null {
  const target = rng.pick(ctx.verses);
  const others = distractVerses(ctx, rng, new Set([target.ref]), 3).filter((v) => v.arabic !== target.arabic);
  if (others.length < 2) return null;
  const { options, answer } = shuffleOptions(rng, [target.arabic, ...others.map((v) => v.arabic)], 0);
  const p = rng.int(3);
  return {
    type: 'mcq', difficulty: 1, dimension: 'memory', kind: 'identify',
    stem: fill(TPL.identify[p], ctx.lang, { chapter: ctx.chapterName, verse: target.verse }),
    options, answer, sourceRefs: [target.ref], materialIds: [],
    explanation: fill(TPL.explain.identify, ctx.lang, { ref: target.ref }), phrasing: p,
    proof: { kind: 'verbatim', texts: [target.arabic], refs: [target.ref] },
  };
}

function genNext(ctx: QuizContext, rng: SeededRng): Draft | null {
  const candidates = ctx.verses.filter((v) => ctx.chapterVerses.some((x) => x.verse === v.verse + 1));
  if (!candidates.length) return null;
  const cur = rng.pick(candidates);
  const next = ctx.chapterVerses.find((x) => x.verse === cur.verse + 1)!;
  const others = distractVerses(ctx, rng, new Set([cur.ref, next.ref]), 3).filter((v) => v.arabic !== next.arabic);
  if (others.length < 2) return null;
  const { options, answer } = shuffleOptions(rng, [next.arabic, ...others.map((v) => v.arabic)], 0);
  const p = rng.int(3);
  return {
    type: 'mcq', difficulty: 1, dimension: 'order', kind: 'next',
    stem: fill(TPL.next[p], ctx.lang, { verse: cur.arabic, ref: cur.ref }),
    options, answer, sourceRefs: [cur.ref, next.ref], materialIds: [],
    explanation: fill(TPL.explain.next, ctx.lang, { ref: cur.ref, next: next.ref }), phrasing: p,
    proof: { kind: 'order', refs: [cur.ref, next.ref], texts: [next.arabic] },
  };
}

function genFill(ctx: QuizContext, rng: SeededRng): Draft | null {
  const long = ctx.verses.filter((v) => tokenizeVerse(v.arabic).length >= 3);
  if (!long.length) return null;
  const target = rng.pick(long);
  const toks = tokenizeVerse(target.arabic);
  // 优先挖批准词表里的词（词汇维度），否则任意实词（记忆维度）
  const glossed = toks.filter((t) => ctx.parse.vocabulary.some((w) => w.materialId && w.word === t.raw));
  const pickFrom = glossed.length ? glossed : toks;
  const tok = rng.pick(pickFrom);
  const entry = ctx.parse.vocabulary.find((w) => w.word === tok.raw);
  // 干扰词：同章其它词，长度接近，避免同形
  const pool = ctx.parse.vocabulary.filter((w) => w.word !== tok.raw && Math.abs(w.word.length - tok.raw.length) <= 3);
  const distract = rng.sample(pool, 3).map((w) => w.word);
  if (distract.length < 2) return null;
  const blanked = target.arabic.split(/\s+/).map((piece) => (piece === tok.raw ? '______' : piece)).join(' ');
  const { options, answer } = shuffleOptions(rng, [tok.raw, ...distract], 0);
  const p = rng.int(3);
  return {
    type: 'fill', difficulty: 1, dimension: entry?.materialId ? 'vocabulary' : 'memory', kind: 'fill',
    stem: fill(TPL.fill[p], ctx.lang, { ref: target.ref, verse: blanked }),
    options, answer, sourceRefs: [target.ref], materialIds: entry?.materialId ? [entry.materialId] : [],
    explanation: fill(TPL.explain.fill, ctx.lang, { ref: target.ref, word: tok.raw }), phrasing: p,
    proof: { kind: 'verbatim', texts: [tok.raw], refs: [target.ref] },
  };
}

function genOrderVerses(ctx: QuizContext, rng: SeededRng, difficulty: QuranDifficulty): Draft | null {
  const n = difficulty >= 3 ? 5 : difficulty === 2 ? 4 : 3;
  if (ctx.verses.length < n) return null;
  const start = rng.int(ctx.verses.length - n + 1);
  const seq = ctx.verses.slice(start, start + n);
  if (new Set(seq.map((v) => v.arabic)).size < n) return null; // 有重复句就排不出唯一答案
  const idx = rng.shuffle(seq.map((_, i) => i));
  const options = idx.map((i) => seq[i].arabic);
  const answer = seq.map((_, i) => idx.indexOf(i));
  const p = rng.int(3);
  const range = rangeLabel(seq[0].verse, seq[n - 1].verse);
  return {
    type: 'order', difficulty, dimension: 'order', kind: 'orderVerses',
    stem: fill(TPL.orderVerses[p], ctx.lang, { chapter: ctx.chapterName, range }),
    options, answer, sourceRefs: seq.map((v) => v.ref), materialIds: [],
    explanation: fill(TPL.explain.orderVerses, ctx.lang, { refs: seq.map((v) => v.ref).join(' → ') }), phrasing: p,
    proof: { kind: 'order', refs: seq.map((v) => v.ref), texts: seq.map((v) => v.arabic) },
  };
}

function genOrderWords(ctx: QuizContext, rng: SeededRng): Draft | null {
  const ok = ctx.verses.filter((v) => { const n = tokenizeVerse(v.arabic).length; return n >= 4 && n <= 8; });
  if (!ok.length) return null;
  const target = rng.pick(ok);
  const words = tokenizeVerse(target.arabic).map((t) => t.raw);
  if (new Set(words).size < words.length) return null;
  const idx = rng.shuffle(words.map((_, i) => i));
  const options = idx.map((i) => words[i]);
  const answer = words.map((_, i) => idx.indexOf(i));
  const p = rng.int(3);
  return {
    type: 'order', difficulty: 1, dimension: 'order', kind: 'orderWords',
    stem: fill(TPL.orderWords[p], ctx.lang, { ref: target.ref }),
    options, answer, sourceRefs: [target.ref], materialIds: [],
    explanation: fill(TPL.explain.orderWords, ctx.lang, { ref: target.ref }), phrasing: p,
    proof: { kind: 'order', refs: [target.ref], texts: words },
  };
}

function genOrderEvents(ctx: QuizContext, rng: SeededRng): Draft | null {
  const events = ctx.parse.events;
  if (events.length < 3) return null;
  const n = Math.min(4, events.length);
  const start = rng.int(events.length - n + 1);
  const seq = events.slice(start, start + n);
  const idx = rng.shuffle(seq.map((_, i) => i));
  const labels = seq.map((e) => fill(TPL.eventLabel, ctx.lang, { n: e.order, title: labelOf(e.title, ctx.lang), range: rangeLabel(e.from, e.to) }));
  const options = idx.map((i) => labels[i]);
  const answer = seq.map((_, i) => idx.indexOf(i));
  const p = rng.int(3);
  const unitIds = ctx.parse.units.filter((u) => seq.some((e) => e.from === u.from && e.to === u.to)).map((u) => u.id);
  return {
    type: 'order', difficulty: 3, dimension: 'comprehension', kind: 'orderEvents',
    stem: fill(TPL.orderEvents[p], ctx.lang, { chapter: ctx.chapterName, range: rangeLabel(seq[0].from, seq[n - 1].to) }),
    options, answer, sourceRefs: seq.map((e) => rangeLabel(e.from, e.to, ctx.parse.chapter)), materialIds: unitIds,
    explanation: fill(TPL.explain.orderEvents, ctx.lang, { refs: seq.map((e) => rangeLabel(e.from, e.to)).join(' → ') }), phrasing: p,
    proof: { kind: 'material', ids: unitIds },
  };
}

function genMatchWords(ctx: QuizContext, rng: SeededRng): Draft | null {
  const glossed = ctx.parse.vocabulary.filter((w) => w.meaning && w.materialId);
  const uniq: QuranVocabEntry[] = [];
  const seenMeaning = new Set<string>();
  for (const w of rng.shuffle(glossed)) {
    const m = labelOf(w.meaning!, ctx.lang);
    if (seenMeaning.has(m)) continue;
    seenMeaning.add(m); uniq.push(w);
    if (uniq.length === 4) break;
  }
  if (uniq.length < 3) return null;
  const left = uniq.map((w) => w.word);
  const meanings = uniq.map((w) => labelOf(w.meaning!, ctx.lang));
  const idx = rng.shuffle(meanings.map((_, i) => i));
  const options = idx.map((i) => meanings[i]);
  const answer = meanings.map((_, i) => idx.indexOf(i));
  const refs = Array.from(new Set(uniq.flatMap((w) => w.refs.slice(0, 2))));
  const p = rng.int(3);
  const range = rangeLabel(ctx.parse.from, ctx.parse.to);
  return {
    type: 'match', difficulty: 2, dimension: 'vocabulary', kind: 'matchWords',
    stem: fill(TPL.matchWords[p], ctx.lang, { chapter: ctx.chapterName, range }),
    options, left, answer, sourceRefs: refs, materialIds: uniq.map((w) => w.materialId!),
    explanation: fill(TPL.explain.matchWords, ctx.lang, { source: ctx.glossarySource, range: `${ctx.chapterName} ${range}` }), phrasing: p,
    proof: { kind: 'material', ids: uniq.map((w) => w.materialId!), texts: left },
  };
}

function unitLabel(ctx: QuizContext, u: QuranUnit): string {
  return fill(TPL.unitLabel, ctx.lang, { n: u.index, title: labelOf(u.title, ctx.lang), range: rangeLabel(u.from, u.to) });
}

function genMatchUnits(ctx: QuizContext, rng: SeededRng): Draft | null {
  const units = ctx.parse.units.filter((u) => u.verseRefs.length);
  if (units.length < 3) return null;
  const chosen = rng.sample(units, Math.min(4, units.length));
  const pairs = chosen.map((u) => {
    const ref = rng.pick(u.verseRefs);
    return { u, v: ctx.verses.find((x) => x.ref === ref) };
  }).filter((p): p is { u: QuranUnit; v: QuranVerse } => !!p.v);
  if (pairs.length < 3 || new Set(pairs.map((p) => p.v.arabic)).size < pairs.length) return null;
  const left = pairs.map((p) => p.v.arabic);
  const labels = pairs.map((p) => unitLabel(ctx, p.u));
  const idx = rng.shuffle(labels.map((_, i) => i));
  const options = idx.map((i) => labels[i]);
  const answer = labels.map((_, i) => idx.indexOf(i));
  const p = rng.int(3);
  return {
    type: 'match', difficulty: 3, dimension: 'comprehension', kind: 'matchUnits',
    stem: fill(TPL.matchUnits[p], ctx.lang, { chapter: ctx.chapterName, range: rangeLabel(ctx.parse.from, ctx.parse.to) }),
    options, left, answer, sourceRefs: pairs.map((x) => x.v.ref), materialIds: chosen.map((u) => u.id),
    explanation: fill(TPL.explain.matchUnits, ctx.lang, {}), phrasing: p,
    proof: { kind: 'material', ids: chosen.map((u) => u.id), refs: pairs.map((x) => x.v.ref) },
  };
}

function genConcept(ctx: QuizContext, rng: SeededRng): Draft | null {
  const concepts = ctx.parse.concepts.filter((c) => c.verseRefs.length);
  if (!concepts.length) return null;
  const c = rng.pick(concepts);
  const inside = ctx.verses.filter((v) => c.verseRefs.includes(v.ref));
  const outside = ctx.chapterVerses.filter((v) => !c.verseRefs.includes(v.ref));
  if (!inside.length || outside.length < 2) return null;
  const target = rng.pick(inside);
  const others = rng.sample(outside, 3).filter((v) => v.arabic !== target.arabic);
  if (others.length < 2) return null;
  const { options, answer } = shuffleOptions(rng, [target.arabic, ...others.map((v) => v.arabic)], 0);
  const p = rng.int(3);
  const label = labelOf(c.label, ctx.lang);
  return {
    type: 'concept', difficulty: 2, dimension: 'concept', kind: 'concept',
    stem: fill(TPL.concept[p], ctx.lang, { concept: label }),
    options, answer, sourceRefs: [target.ref], conceptId: c.id, conceptLabel: label, materialIds: c.materialIds,
    explanation: fill(TPL.explain.concept, ctx.lang, { concept: label, refs: c.verseRefs.slice(0, 6).join(', ') }), phrasing: p,
    proof: { kind: 'material', ids: c.materialIds, texts: [target.arabic], refs: [target.ref] },
  };
}

function genConceptUnit(ctx: QuizContext, rng: SeededRng): Draft | null {
  const units = ctx.parse.units.filter((u) => u.conceptIds.length);
  if (units.length < 3) return null;
  const u = rng.pick(units);
  const c = ctx.parse.concepts.find((x) => x.id === rng.pick(u.conceptIds));
  if (!c) return null;
  const others = rng.sample(ctx.parse.units.filter((x) => x.id !== u.id), 3);
  if (others.length < 2) return null;
  const { options, answer } = shuffleOptions(rng, [unitLabel(ctx, u), ...others.map((x) => unitLabel(ctx, x))], 0);
  const p = rng.int(3);
  const label = labelOf(c.label, ctx.lang);
  return {
    type: 'concept', difficulty: 3, dimension: 'concept', kind: 'conceptUnit',
    stem: fill(TPL.conceptUnit[p], ctx.lang, { concept: label }),
    options, answer, sourceRefs: u.verseRefs.slice(0, 3), conceptId: c.id, conceptLabel: label, materialIds: [u.id, ...c.materialIds],
    explanation: fill(TPL.explain.conceptUnit, ctx.lang, { concept: label, unit: labelOf(u.title, ctx.lang), refs: rangeLabel(u.from, u.to) }), phrasing: p,
    proof: { kind: 'material', ids: [u.id, c.id] },
  };
}

/** 理解 · 二级：哪一节体现单元主题（短章也能出：只要 ≥2 节） */
function genThemeVerse(ctx: QuizContext, rng: SeededRng): Draft | null {
  const units = ctx.parse.units.filter((u) => u.verseRefs.length && u.origin === 'approved');
  if (!units.length) return null;
  const u = rng.pick(units);
  const inside = ctx.verses.filter((v) => u.verseRefs.includes(v.ref));
  const outside = ctx.chapterVerses.filter((v) => !u.verseRefs.includes(v.ref));
  if (!inside.length || outside.length < 2) return null;
  const target = rng.pick(inside);
  const others = rng.sample(outside, 3).filter((v) => v.arabic !== target.arabic);
  if (others.length < 2) return null;
  const { options, answer } = shuffleOptions(rng, [target.arabic, ...others.map((v) => v.arabic)], 0);
  const p = rng.int(3);
  const unit = labelOf(u.title, ctx.lang); const theme = labelOf(u.theme, ctx.lang);
  return {
    type: 'mcq', difficulty: 2, dimension: 'comprehension', kind: 'themeVerse',
    stem: fill(TPL.themeVerse[p], ctx.lang, { unit, theme }),
    options, answer, sourceRefs: [target.ref], materialIds: [u.id],
    explanation: fill(TPL.explain.themeVerse, ctx.lang, { ref: target.ref, unit, theme }), phrasing: p,
    proof: { kind: 'material', ids: [u.id], texts: [target.arabic], refs: [target.ref] },
  };
}

/** 理解 · 二级：这节经文属于哪个单元（≥2 个单元即可；选项 = 批准单元标题） */
/**
 * 这一段讲什么（面向新入门者的主力题型）。
 *
 * 题干给单元名，选项是四个单元主题 —— 全部取所选语言的标签，**整道题不出现一个阿拉伯字母**。
 * 新入门者还读不了原文，但完全答得了「这段在讲敬畏」还是「在讲施舍」，
 * 而这正是传教场景真正想诊断的理解力。
 */
function genUnitTheme(ctx: QuizContext, rng: SeededRng): Draft | null {
  const units = ctx.parse.units.filter((u) => labelOf(u.theme, ctx.lang).trim());
  if (units.length < 3) return null;
  const u = rng.pick(units);
  const others = rng.sample(units.filter((x) => x.id !== u.id && labelOf(x.theme, ctx.lang) !== labelOf(u.theme, ctx.lang)), 3);
  if (others.length < 2) return null;
  const theme = labelOf(u.theme, ctx.lang);
  const { options, answer } = shuffleOptions(rng, [theme, ...others.map((x) => labelOf(x.theme, ctx.lang))], 0);
  const p = rng.int(3);
  const unit = unitLabel(ctx, u);
  return {
    type: 'mcq', difficulty: 1, dimension: 'comprehension', kind: 'unitTheme',
    stem: fill(TPL.unitTheme[p], ctx.lang, { unit }),
    options, answer, sourceRefs: u.verseRefs.slice(0, 3), materialIds: [u.id],
    explanation: fill(TPL.explain.unitTheme, ctx.lang, { unit, theme, range: rangeLabel(u.from, u.to) }), phrasing: p,
    proof: { kind: 'material', ids: [u.id], refs: u.verseRefs.slice(0, 3) },
  };
}

function genVerseUnit(ctx: QuizContext, rng: SeededRng): Draft | null {
  const units = ctx.parse.units.filter((u) => u.verseRefs.length);
  if (units.length < 2) return null;
  const u = rng.pick(units);
  const v = ctx.verses.find((x) => x.ref === rng.pick(u.verseRefs));
  if (!v) return null;
  const others = rng.sample(units.filter((x) => x.id !== u.id), 3);
  const { options, answer } = shuffleOptions(rng, [unitLabel(ctx, u), ...others.map((x) => unitLabel(ctx, x))], 0);
  const p = rng.int(3);
  return {
    type: 'concept', difficulty: 2, dimension: 'comprehension', kind: 'verseUnit',
    stem: fill(TPL.verseUnit[p], ctx.lang, { verse: v.arabic, ref: v.ref }),
    options, answer, sourceRefs: [v.ref], materialIds: [u.id],
    explanation: fill(TPL.explain.verseUnit, ctx.lang, { ref: v.ref, unit: labelOf(u.title, ctx.lang), range: rangeLabel(u.from, u.to) }), phrasing: p,
    proof: { kind: 'material', ids: [u.id], refs: [v.ref], texts: [v.arabic] },
  };
}

/** 理解 · 三级：两个概念同属哪个单元（跨概念综合） */
function genConceptPair(ctx: QuizContext, rng: SeededRng): Draft | null {
  const units = ctx.parse.units.filter((u) => u.conceptIds.length >= 2);
  const all = ctx.parse.units.filter((u) => u.verseRefs.length);
  if (!units.length || all.length < 2) return null;
  const u = rng.pick(units);
  const [ca, cb] = rng.sample(u.conceptIds, 2).map((id) => ctx.parse.concepts.find((c) => c.id === id));
  if (!ca || !cb) return null;
  const others = rng.sample(all.filter((x) => x.id !== u.id), 3);
  const { options, answer } = shuffleOptions(rng, [unitLabel(ctx, u), ...others.map((x) => unitLabel(ctx, x))], 0);
  const p = rng.int(3);
  const a = labelOf(ca.label, ctx.lang); const b = labelOf(cb.label, ctx.lang);
  return {
    type: 'concept', difficulty: 3, dimension: 'comprehension', kind: 'conceptPair',
    stem: fill(TPL.conceptPair[p], ctx.lang, { a, b }),
    options, answer, sourceRefs: u.verseRefs.slice(0, 3), materialIds: [u.id, ca.id, cb.id],
    explanation: fill(TPL.explain.conceptPair, ctx.lang, { a, b, unit: labelOf(u.title, ctx.lang), range: rangeLabel(u.from, u.to) }), phrasing: p,
    proof: { kind: 'material', ids: [u.id, ca.id, cb.id] },
  };
}

// ── 自动一致性检查（说明书 12.3）────────────────────────

export function verifyDraft(d: Draft, ctx: QuizContext, materialIds: Set<string>): { ok: boolean; note: string } {
  const lang = ctx.lang;
  const byRef = new Map(ctx.chapterVerses.map((v) => [v.ref, v]));
  if (d.proof.kind === 'verbatim') {
    for (const [i, text] of (d.proof.texts || []).entries()) {
      const ref = d.proof.refs?.[i] || d.proof.refs?.[0] || '';
      const v = byRef.get(ref);
      if (!v || !(v.arabic === text || v.arabic.split(/\s+/).includes(text))) return { ok: false, note: fill(TPL.verify.fail, lang, { why: `${ref} ∌ ${text.slice(0, 20)}` }) };
    }
    // 正确选项文本必须等于证据文本
    const ans = typeof d.answer === 'number' ? d.options[d.answer] : '';
    if (ans && !(d.proof.texts || []).includes(ans)) return { ok: false, note: fill(TPL.verify.fail, lang, { why: 'answer≠proof' }) };
    return { ok: true, note: fill(TPL.verify.ok_verbatim, lang, { refs: (d.proof.refs || []).join(', ') }) };
  }
  if (d.proof.kind === 'order') {
    const refs = d.proof.refs || [];
    if (d.kind === 'orderVerses') {
      const nums = refs.map((r) => Number(r.split(':')[1]));
      for (let i = 1; i < nums.length; i += 1) if (nums[i] !== nums[i - 1] + 1) return { ok: false, note: fill(TPL.verify.fail, lang, { why: 'refs not consecutive' }) };
      const seq = (d.answer as number[]).map((i) => d.options[i]);
      for (const [i, r] of refs.entries()) if (byRef.get(r)?.arabic !== seq[i]) return { ok: false, note: fill(TPL.verify.fail, lang, { why: `${r} text mismatch` }) };
    } else if (d.kind === 'orderWords') {
      const v = byRef.get(refs[0]);
      const seq = (d.answer as number[]).map((i) => d.options[i]).join(' ');
      if (!v || tokenizeVerse(v.arabic).map((t) => t.raw).join(' ') !== seq) return { ok: false, note: fill(TPL.verify.fail, lang, { why: 'word order mismatch' }) };
    } else if (d.kind === 'next') {
      const [a, b] = refs.map((r) => Number(r.split(':')[1]));
      if (b !== a + 1 || byRef.get(refs[1])?.arabic !== d.options[d.answer as number]) return { ok: false, note: fill(TPL.verify.fail, lang, { why: 'next verse mismatch' }) };
    }
    return { ok: true, note: fill(TPL.verify.ok_order, lang, { refs: refs.join(', ') }) };
  }
  const ids = d.proof.ids || [];
  if (!ids.length || ids.some((id) => !materialIds.has(id))) return { ok: false, note: fill(TPL.verify.fail, lang, { why: 'material not approved' }) };
  for (const [i, text] of (d.proof.texts || []).entries()) {
    if (d.kind === 'matchWords') {
      if (!ctx.verses.some((v) => v.arabic.split(/\s+/).includes(text))) return { ok: false, note: fill(TPL.verify.fail, lang, { why: `word ∉ range: ${text}` }) };
    } else if (d.proof.refs?.[i] && byRef.get(d.proof.refs[i])?.arabic !== text) return { ok: false, note: fill(TPL.verify.fail, lang, { why: 'verse mismatch' }) };
  }
  return { ok: true, note: fill(TPL.verify.ok_material, lang, { ids: ids.slice(0, 3).join(', ') }) };
}

// ── 组卷 ────────────────────────────────────────────────

export interface PaperSpec {
  count: number;
  /** 难度配比（和为 1） */
  mix?: Record<QuranDifficulty, number>;
  /** 只出这些题型 */
  types?: QuranQuestionType[];
  /** 强化 / 复测：只围绕这个概念或维度 */
  focus?: { conceptId?: string; dimension?: QuranDimension; kind?: 'concept' | 'vocabulary' | 'verse' | 'type'; key?: string };
  /** 尽量不再出的题（questionIdentity，同一道题的换措辞 / 换选项顺序也算）：强化练习与复测卷排除原卷里考过的 */
  exclude?: string[];
  /** 绝不能再出的题面（questionFace）：与原卷 / 练习完全相同的题一律不出 */
  excludeFaces?: string[];
  /**
   * 出题取向。**缺省就是只考理解**。
   *
   * `newcomer`（默认）= **不考原文**：不认经文、不接下一节、不填原文词、不排词序节序，
   * 只考「这段讲的是什么」——单元主题、概念、事件先后、词义，题干与选项一律用所选语言。
   * 这条线的学生大多还不识阿拉伯语原文，考原文等于考「会不会背」，
   * 诊断不出任何理解上的薄弱点，强化教学也就无从下手。
   *
   * `full` = 把记忆与语序题也放回来（学术 / 诵读场景要，得显式要）。
   */
  audience?: 'newcomer' | 'full';
}

/**
 * 题面：学生看到的整道题 —— 题干 + 选项（+ 匹配左列），选项顺序不计。
 * 匹配 / 排序题的题干是通用句（「把下列词与释义配对」），题目内容在选项里，所以不能只比题干。
 */
export function questionFace(q: Pick<QuranQuestion, 'stem' | 'options' | 'left'>): string {
  return [q.stem.trim(), q.options.slice().sort().join('|'), (q.left || []).slice().sort().join('|')].join('\n');
}

/**
 * 题目的「同一道题」判据：题型 + 维度 + 概念 + 来源 + 选项集合 + 正确答案内容。
 * 措辞不同、选项顺序不同，或换一对概念问同一个单元（答案与选项完全一样），都算同一道题。
 */
export function questionIdentity(q: Pick<QuranQuestion, 'type' | 'dimension' | 'conceptId' | 'sourceRefs' | 'options' | 'left' | 'answer'>): string {
  const ans = typeof q.answer === 'number'
    ? q.options[q.answer] ?? ''
    : q.answer.map((i, k) => `${q.left?.[k] ?? ''}>${q.options[i] ?? ''}`).join('|');
  return [q.type, q.dimension, q.conceptId || '', q.sourceRefs.join(','), q.options.slice().sort().join('|'), (q.left || []).slice().sort().join('|'), ans].join('#');
}

type Generator = (ctx: QuizContext, rng: SeededRng) => Draft | null;

/**
 * 面向新入门者时允许的题型。
 *
 * 判据是「答这道题需不需要先会读阿拉伯语原文」：
 *   认经文 / 接下一节 / 填原文词 / 排词序节序 —— 需要，排除；
 *   单元主题 / 概念 / 事件先后 / 词义 —— 不需要，保留（选项本来就是所选语言的标签）。
 * themeVerse 也排除：它的选项是四段阿拉伯原文，新入门者根本无从选起。
 */
const NEWCOMER_KINDS = new Set(['concept', 'conceptUnit', 'conceptPair', 'matchUnits', 'matchWords', 'orderEvents', 'unitTheme']);

function generatorsFor(difficulty: QuranDifficulty, audience?: PaperSpec['audience']): Array<{ kind: string; fn: Generator; type: QuranQuestionType }> {
  // 缺省走理解取向：不传 audience 的老调用方（含历史卷子的 spec）一律按「只考理解」出题
  if (audience !== 'full') {
    // 难度仍分三档，但都在「理解」这一侧：轻 = 单元讲什么 / 词义，重 = 概念关系 / 事件先后
    const all: Array<{ kind: string; fn: Generator; type: QuranQuestionType }> = [
      { kind: 'unitTheme', type: 'mcq', fn: genUnitTheme },
      { kind: 'matchWords', type: 'match', fn: genMatchWords },
      { kind: 'concept', type: 'concept', fn: genConcept },
      { kind: 'conceptUnit', type: 'concept', fn: genConceptUnit },
      { kind: 'conceptPair', type: 'concept', fn: genConceptPair },
      { kind: 'matchUnits', type: 'match', fn: genMatchUnits },
      { kind: 'orderEvents', type: 'order', fn: genOrderEvents },
    ];
    if (difficulty === 1) return all.filter((g) => ['unitTheme', 'matchWords', 'concept'].includes(g.kind));
    if (difficulty === 2) return all.filter((g) => ['concept', 'conceptUnit', 'matchUnits', 'unitTheme'].includes(g.kind));
    return all.filter((g) => ['conceptPair', 'orderEvents', 'matchUnits', 'conceptUnit'].includes(g.kind));
  }
  return generatorsForAll(difficulty);
}

function generatorsForAll(difficulty: QuranDifficulty): Array<{ kind: string; fn: Generator; type: QuranQuestionType }> {
  if (difficulty === 1) {
    return [
      { kind: 'identify', type: 'mcq', fn: genIdentify },
      { kind: 'next', type: 'mcq', fn: genNext },
      { kind: 'fill', type: 'fill', fn: genFill },
      { kind: 'orderWords', type: 'order', fn: genOrderWords },
      { kind: 'orderVerses', type: 'order', fn: (c, r) => genOrderVerses(c, r, 1) },
    ];
  }
  if (difficulty === 2) {
    return [
      { kind: 'matchWords', type: 'match', fn: genMatchWords },
      { kind: 'concept', type: 'concept', fn: genConcept },
      { kind: 'themeVerse', type: 'mcq', fn: genThemeVerse },
      { kind: 'verseUnit', type: 'concept', fn: genVerseUnit },
      { kind: 'orderVerses', type: 'order', fn: (c, r) => genOrderVerses(c, r, 2) },
      { kind: 'fill', type: 'fill', fn: genFill },
    ];
  }
  return [
    { kind: 'matchUnits', type: 'match', fn: genMatchUnits },
    { kind: 'conceptUnit', type: 'concept', fn: genConceptUnit },
    { kind: 'conceptPair', type: 'concept', fn: genConceptPair },
    { kind: 'orderEvents', type: 'order', fn: genOrderEvents },
    { kind: 'orderVerses', type: 'order', fn: (c, r) => genOrderVerses(c, r, 3) },
  ];
}

/** 维度 → 题型生成器（也用于配额补齐） */
const DIM_KINDS: Record<QuranDimension, string[]> = { memory: ['identify', 'fill'], order: ['next', 'orderWords', 'orderVerses'], vocabulary: ['fill', 'matchWords'], comprehension: ['unitTheme', 'themeVerse', 'verseUnit', 'conceptPair', 'matchUnits', 'orderEvents'], concept: ['concept', 'conceptUnit'] };

/**
 * 每套试卷的维度最低配额：理解与概念各占 ≥15%（至少 1 题）。
 * 没有配额时短章几乎只出记忆题，「理解」维度恒为「—」，学生乙「背得好理解弱」、丁「单概念连续错」的人设就呈现不出来。
 */
export function dimensionQuota(count: number, focus?: PaperSpec['focus']): Partial<Record<QuranDimension, number>> {
  if (focus) return {};
  const q = Math.max(1, Math.round(count * 0.15));
  return count >= 4 ? { comprehension: q, concept: q } : {};
}

export function defaultMix(level: 'beginner' | 'intermediate' | 'advanced'): Record<QuranDifficulty, number> {
  if (level === 'beginner') return { 1: 0.6, 2: 0.3, 3: 0.1 };
  if (level === 'intermediate') return { 1: 0.35, 2: 0.4, 3: 0.25 };
  return { 1: 0.2, 2: 0.4, 3: 0.4 };
}

function draftMatchesFocus(d: Draft, focus: PaperSpec['focus']): boolean {
  if (!focus) return true;
  if (focus.conceptId) return d.conceptId === focus.conceptId || d.materialIds.includes(focus.conceptId);
  if (focus.kind === 'verse' && focus.key) return d.sourceRefs.includes(focus.key);
  if (focus.kind === 'vocabulary' && focus.key) return d.materialIds.includes(focus.key) || d.options.includes(focus.key) || (d.left || []).includes(focus.key);
  if (focus.kind === 'type' && focus.key) return d.type === focus.key;
  if (focus.dimension) return d.dimension === focus.dimension;
  return true;
}

export function generateQuestions(ctx: QuizContext, seed: string, spec: PaperSpec, approvedIds: Set<string>): { questions: QuranQuestion[]; rejected: number } {
  const rng = new SeededRng(seed);
  const mix = spec.mix || defaultMix('beginner');
  const want: QuranDifficulty[] = [];
  for (let i = 0; i < spec.count; i += 1) {
    const r = rng.next();
    want.push(r < mix[1] ? 1 : r < mix[1] + mix[2] ? 2 : 3);
  }
  const out: QuranQuestion[] = [];
  /** 已出过 / 被排除的题（questionIdentity）：先按它去重，卷内不出「同一道题」，也尽量不与 spec.exclude 重复 */
  const seen = new Set<string>(spec.exclude || []);
  /** 已出过 / 被排除的题面：任何阶段都不重复 */
  const seenFaces = new Set<string>(spec.excludeFaces || []);
  // 分段补足：① 按「同一道题」严格去重；② 范围太小凑不满时（3 节经文、原卷已用掉大半），
  // 放宽为同一知识点换措辞 / 换选项组合的变体；③ 只限某种题型（强化「题型」薄弱点）而这种题型在本范围
  // 已经出尽时，换别的题型补到至少 3 道。任何阶段题面都不重复，也不会与原卷完全相同
  const strictBudget = spec.count * (spec.exclude?.length ? 200 : 60);
  const variantBudget = strictBudget + spec.count * 80;
  const anyTypeBudget = variantBudget + (spec.types?.length ? spec.count * 80 : 0);
  let relaxed = false;
  let anyType = false;
  let rejected = 0;
  let guard = 0;
  let slotFailures = 0; // 当前槽位连续失败次数：短章出不了高难度题时降级，不能卡死
  while (out.length < spec.count && guard < anyTypeBudget) {
    guard += 1;
    if (!relaxed && guard > strictBudget) { relaxed = true; slotFailures = 0; }
    if (!anyType && guard > variantBudget) { anyType = true; slotFailures = 0; }
    if (anyType && out.length >= Math.min(spec.count, 3)) break;
    let difficulty = want[out.length] ?? 1;
    if (slotFailures >= 12 && difficulty > 1) difficulty = (difficulty - Math.min(difficulty - 1, Math.floor(slotFailures / 12))) as QuranDifficulty;
    let gens = generatorsFor(difficulty, spec.audience);
    if (spec.types?.length && !anyType) {
      gens = gens.filter((g) => spec.types!.includes(g.type));
      // 该难度下没有这种题型（如一级没有匹配题）：换到有这种题型的难度，否则强化「题型」薄弱点时可能一道都出不来
      if (!gens.length) gens = ([1, 2, 3] as QuranDifficulty[]).flatMap((d) => generatorsFor(d, spec.audience)).filter((g) => spec.types!.includes(g.type));
    }
    if (spec.focus?.dimension) {
      const dim = spec.focus.dimension;
      const dimKinds: Record<QuranDimension, string[]> = DIM_KINDS;
      const allowed = dimKinds[dim];
      const filtered = gens.filter((g) => allowed.includes(g.kind));
      if (filtered.length) gens = filtered;
      else gens = ([1, 2, 3] as QuranDifficulty[]).flatMap((d) => generatorsFor(d, spec.audience)).filter((g) => allowed.includes(g.kind));
    }
    if (spec.focus?.conceptId) {
      const conceptGens = ([2, 3] as QuranDifficulty[]).flatMap((d) => generatorsFor(d, spec.audience)).filter((g) => g.kind === 'concept' || g.kind === 'conceptUnit' || g.kind === 'matchUnits');
      gens = guard % 3 === 0 ? gens : conceptGens;
    }
    if (!gens.length && slotFailures < 40) { slotFailures += 1; continue; }
    if (!gens.length) break;
    const gen = rng.pick(gens);
    const d = gen.fn(ctx, rng);
    if (!d) { slotFailures += 1; continue; }
    if (!draftMatchesFocus(d, spec.focus) && slotFailures < 30) { slotFailures += 1; continue; }
    // 按某个概念聚焦出题时，靠「引了该概念的批准材料」命中的题，自己的 conceptId 可能还空着。
    // 分析与前后对比都按 conceptId 归知识点（students.weakKey），空着就等于这道题不算在该概念名下 ——
    // 强化/复测卷会出现「明明是冲着这个概念出的题，却统计不到它头上」，前后对比只能显示「—」。
    // 这道题本来就是按该概念的批准材料出的，把概念如实标上去。
    if (spec.focus?.conceptId && !d.conceptId && d.materialIds.includes(spec.focus.conceptId)) {
      d.conceptId = spec.focus.conceptId;
      d.conceptLabel = d.conceptLabel || ctx.parse.concepts.find((c) => c.id === spec.focus!.conceptId)?.label[ctx.lang] || spec.focus.conceptId;
    }
    if ((!relaxed && seen.has(questionIdentity(d))) || seenFaces.has(questionFace(d))) { slotFailures += 1; continue; }
    const check = verifyDraft(d, ctx, approvedIds);
    if (!check.ok) { rejected += 1; slotFailures += 1; continue; }
    seen.add(questionIdentity(d)); seenFaces.add(questionFace(d));
    slotFailures = 0;
    out.push({
      id: `q-${seed}-${out.length + 1}`,
      type: d.type, difficulty: d.difficulty, dimension: d.dimension,
      stem: d.stem, options: d.options, left: d.left, answer: d.answer,
      sourceRefs: d.sourceRefs, conceptId: d.conceptId, conceptLabel: d.conceptLabel, materialIds: d.materialIds,
      explanation: d.explanation, verified: true, verifyNote: check.note, reviewStatus: 'draft', aiGenerated: true, generator: 'template', phrasing: d.phrasing,
    });
  }
  // 配额补齐：理解 / 概念题不够就用对应生成器专门补，替换掉末尾的记忆题
  for (const [dim, need] of Object.entries(dimensionQuota(spec.count, spec.focus)) as Array<[QuranDimension, number]>) {
    let have = out.filter((q) => q.dimension === dim).length;
    let tries = 0;
    while (have < need && tries < 40) {
      tries += 1;
      const gens = ([1, 2, 3] as QuranDifficulty[]).flatMap((d) => generatorsFor(d, spec.audience)).filter((g) => DIM_KINDS[dim].includes(g.kind) && (!spec.types?.length || spec.types.includes(g.type)));
      if (!gens.length) break;
      const d = rng.pick(gens).fn(ctx, rng);
      if (!d || seen.has(questionIdentity(d)) || seenFaces.has(questionFace(d))) continue;
      const check = verifyDraft(d, ctx, approvedIds);
      if (!check.ok) { rejected += 1; continue; }
      seen.add(questionIdentity(d)); seenFaces.add(questionFace(d));
      const q: QuranQuestion = {
        id: `q-${seed}-x${out.length + tries}`, type: d.type, difficulty: d.difficulty, dimension: d.dimension,
        stem: d.stem, options: d.options, left: d.left, answer: d.answer, sourceRefs: d.sourceRefs, conceptId: d.conceptId, conceptLabel: d.conceptLabel, materialIds: d.materialIds,
        explanation: d.explanation, verified: true, verifyNote: check.note, reviewStatus: 'draft', aiGenerated: true, generator: 'template', phrasing: d.phrasing,
      };
      // 卷面还没满就追加；满了优先替换一道记忆 / 顺序 / 词汇题（从末尾找），卷面题数不变，找不到可换的就停
      if (out.length < spec.count) out.push(q);
      else {
        const dims = out.map((x) => x.dimension);
        const idx = [dims.lastIndexOf('memory'), dims.lastIndexOf('order'), dims.lastIndexOf('vocabulary')].find((i) => i >= 0) ?? -1;
        if (idx < 0) break;
        out.splice(idx, 1, q);
      }
      have += 1;
    }
  }
  // 聚焦出题（强化 / 复测）时，保证卷内**至少有一道真正命中焦点**的题。
  // 主循环在连续 30 次取不到匹配题后会放行不匹配的草稿（否则题源紧时会一道都出不来），
  // 代价是整卷可能一道都不沾焦点 —— 那样前后对比就算不出「目标指标 after」，界面只能显示「—」。
  // 这里专门多抢几十次，**题面排重照旧**：复测卷不得与原卷 / 练习卷同题是既有验收要求，
  // 不能为了凑覆盖率破掉它；真抢不到就维持原样，由 store 侧记 warn 并按共同知识点口径给对比。
  if (spec.focus && out.length && !out.some((q) => draftMatchesFocus(q as unknown as Draft, spec.focus))) {
    const focusGens = ([1, 2, 3] as QuranDifficulty[]).flatMap((d) => generatorsFor(d, spec.audience));
    for (let i = 0; i < 200; i += 1) {
      const d = rng.pick(focusGens).fn(ctx, rng);
      if (!d || !draftMatchesFocus(d, spec.focus)) continue;
      if (seen.has(questionIdentity(d)) || seenFaces.has(questionFace(d))) continue;
      if (spec.focus.conceptId && !d.conceptId && d.materialIds.includes(spec.focus.conceptId)) {
        d.conceptId = spec.focus.conceptId;
        d.conceptLabel = d.conceptLabel || ctx.parse.concepts.find((c) => c.id === spec.focus!.conceptId)?.label[ctx.lang] || spec.focus.conceptId;
      }
      const check = verifyDraft(d, ctx, approvedIds);
      if (!check.ok) { rejected += 1; continue; }
      seen.add(questionIdentity(d)); seenFaces.add(questionFace(d));
      out[out.length - 1] = {
        id: out[out.length - 1].id,
        type: d.type, difficulty: d.difficulty, dimension: d.dimension,
        stem: d.stem, options: d.options, left: d.left, answer: d.answer,
        sourceRefs: d.sourceRefs, conceptId: d.conceptId, conceptLabel: d.conceptLabel, materialIds: d.materialIds,
        explanation: d.explanation, verified: true, verifyNote: check.note, reviewStatus: 'draft', aiGenerated: true, generator: 'template', phrasing: d.phrasing,
      };
      break;
    }
  }

  // 顺序随机（配额补齐后再洗一次，保证题目顺序也是随机维度之一）
  const shuffled = rng.shuffle(out).map((q, i) => ({ ...q, id: `q-${seed}-${i + 1}` }));
  return { questions: shuffled, rejected };
}

/**
 * 给每名学生生成自己那一版（说明书 11.2：5 名学生的试卷不得全部完全相同）。
 *
 * 变化维度只取「题序」和「选项顺序」两项 —— 这两项说明书明确允许，而且**不动题面**：
 * 经文是锁定源数据，任何"换个说法"的空间都不在这一层做。
 *
 * 排序题（order）与匹配题（match）不打乱选项：它们的 options 本身就是待排/待配的序列，
 * 打乱等于改题意。这两类只跟着题序走。
 */
export function buildVariants(paper: QuranPaper, studentIds: string[], seedSalt = ''): QuranPaperVariant[] {
  return studentIds.map((studentId) => {
    const rng = new SeededRng(`${paper.seed}:${seedSalt}:${studentId}`);
    const order = rng.shuffle(paper.questions.map((q) => q.id));
    const optionOrder: Record<string, number[]> = {};
    for (const q of paper.questions) {
      const idx = q.options.map((_, i) => i);
      optionOrder[q.id] = q.type === 'order' || q.type === 'match' ? idx : rng.shuffle(idx);
    }
    const signature = paperSignature(variantQuestions(paper, { studentId, order, optionOrder, signature: '' }));
    return { studentId, order, optionOrder, signature };
  });
}

export function paperSignature(questions: QuranQuestion[]): string {
  return questions.map((q) => `${q.stem.slice(0, 24)}#${q.options.map((o) => o.slice(0, 6)).join(',')}`).join('|');
}

export function paperTitle(kind: QuranPaper['kind'], lang: QuranLang, vars: Record<string, string | number>): string {
  return fill(TPL.paperTitle[kind], lang, vars);
}

/** 判分：mcq/fill/concept 比下标；order / match 比整段序列 */
export function isCorrect(q: QuranQuestion, answer: number | number[] | null): boolean {
  if (answer === null || answer === undefined) return false;
  if (typeof q.answer === 'number') return answer === q.answer;
  if (!Array.isArray(answer) || answer.length !== q.answer.length) return false;
  return q.answer.every((v, i) => v === answer[i]);
}

/** 概念 id → 显示标签（分析用） */
export function conceptLabelMap(concepts: QuranConcept[], lang: QuranLang): Map<string, string> {
  return new Map(concepts.map((c) => [c.id, c.label[lang]]));
}
