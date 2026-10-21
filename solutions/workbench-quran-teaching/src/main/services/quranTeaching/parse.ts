/**
 * 内容解析（说明书第八节 / 能力①）：把锁定语料按章、节、词汇、主题、概念、教学单元拆开。
 *
 * 全部是确定性程序计算（说明书 22：统计与 AI 解释分离）：
 *   - 词汇表：逐节分词 + 频次 + 出处；命中批准词表的词带释义与资料 id
 *   - 重复结构：整节重复（如第 55 章的 31 次反问）与节首重复短语（如第 113 章「وَمِن شَرِّ」、第 49 章呼语）
 *   - 教学单元：优先用批准单元表；未覆盖的节范围按「重复结构边界 + 目标单元长度」自动分段
 *   - 概念：批准概念资料，按节范围挂到单元
 * 每个派生对象都带 verseRefs / materialIds，可追溯到章/节或批准资料。
 */
import type { QuranApprovedMaterial, QuranConcept, QuranParseResult, QuranRepeatedStructure, QuranTri, QuranUnit, QuranVerse, QuranVocabEntry } from '@totalclaw/ipc-contracts';
import { unitSeeds } from './approved';
import { STOP_WORDS, normalizeArabic, rangeLabel, tokenizeVerse } from './textUtils';
import templates from './quizTemplates.json';

const AUTO = templates as unknown as { autoUnitTitle: [string, string, string]; autoUnitTheme: [string, string, string] };
const fillTri = (tpl: [string, string, string], vars: Record<string, string | number>): QuranTri => {
  const f = (s: string): string => s.replace(/\{(\w+)\}/g, (_m, k) => String(vars[k] ?? ''));
  return { zh: f(tpl[0]), en: f(tpl[1]), ar: f(tpl[2]) };
};

export function refOf(chapter: number, verse: number): string { return `${chapter}:${verse}`; }

export function buildVocabulary(verses: QuranVerse[], materials: QuranApprovedMaterial[]): QuranVocabEntry[] {
  const glossary = new Map<string, QuranApprovedMaterial>();
  for (const m of materials) if (m.kind === 'glossary' && m.word) glossary.set(`${m.chapter}:${m.word}`, m);
  const map = new Map<string, QuranVocabEntry>();
  for (const v of verses) {
    for (const tok of tokenizeVerse(v.arabic)) {
      const key = tok.norm;
      let e = map.get(key);
      if (!e) {
        const g = glossary.get(`${v.chapter}:${key}`);
        e = { word: tok.raw, count: 0, refs: [], meaning: g?.title, materialId: g?.id };
        map.set(key, e);
      }
      e.count += 1;
      if (!e.refs.includes(v.ref)) e.refs.push(v.ref);
    }
  }
  // 有释义的优先，其次按频次；功能词沉底
  return Array.from(map.entries())
    .map(([norm, e]) => ({ norm, e }))
    .sort((a, b) => {
      const ga = a.e.meaning ? 1 : 0; const gb = b.e.meaning ? 1 : 0;
      if (ga !== gb) return gb - ga;
      const sa = STOP_WORDS.has(a.norm) ? 1 : 0; const sb = STOP_WORDS.has(b.norm) ? 1 : 0;
      if (sa !== sb) return sa - sb;
      return b.e.count - a.e.count;
    })
    .map((x) => x.e);
}

/** 重复结构：整节重复 + 节首 2 词短语重复（≥3 次才算结构，2 次是巧合） */
export function detectRepeated(verses: QuranVerse[]): QuranRepeatedStructure[] {
  const whole = new Map<string, { phrase: string; refs: string[] }>();
  const opening = new Map<string, { phrase: string; refs: string[] }>();
  for (const v of verses) {
    const toks = tokenizeVerse(v.arabic);
    const wholeKey = toks.map((t) => t.norm).join(' ');
    const w = whole.get(wholeKey) || { phrase: v.arabic, refs: [] };
    w.refs.push(v.ref); whole.set(wholeKey, w);
    if (toks.length >= 3) {
      const key = toks.slice(0, 2).map((t) => t.norm).join(' ');
      const o = opening.get(key) || { phrase: toks.slice(0, 2).map((t) => t.raw).join(' '), refs: [] };
      o.refs.push(v.ref); opening.set(key, o);
    }
  }
  const out: QuranRepeatedStructure[] = [];
  for (const w of whole.values()) if (w.refs.length >= 2) out.push({ phrase: w.phrase, count: w.refs.length, refs: w.refs });
  const wholeRefs = new Set(out.flatMap((r) => r.refs));
  for (const o of opening.values()) {
    const refs = o.refs.filter((r) => !wholeRefs.has(r));
    if (refs.length >= 3) out.push({ phrase: `${o.phrase} …`, count: refs.length, refs });
  }
  return out.sort((a, b) => b.count - a.count);
}

function tri(zh: string, en: string, ar: string): QuranTri { return { zh, en, ar }; }

function autoSplit(chapter: number, verses: QuranVerse[], repeated: QuranRepeatedStructure[]): Array<{ from: number; to: number }> {
  if (!verses.length) return [];
  const n = verses.length;
  if (n <= 8) return [{ from: verses[0].verse, to: verses[n - 1].verse }];
  // 整节重复（反问句）之后是天然段落边界
  const boundaryAfter = new Set<number>();
  for (const r of repeated) if (r.count >= 3 && !r.phrase.endsWith('…')) for (const ref of r.refs) boundaryAfter.add(Number(ref.split(':')[1]));
  const target = n >= 60 ? 12 : n >= 25 ? 7 : 5;
  const out: Array<{ from: number; to: number }> = [];
  let start = verses[0].verse;
  for (let i = 0; i < n; i += 1) {
    const v = verses[i].verse;
    const len = v - start + 1;
    const last = i === n - 1;
    if (last || (len >= target && (boundaryAfter.has(v) || len >= target * 1.6))) {
      out.push({ from: start, to: v });
      start = v + 1;
    }
  }
  return out;
}

/** 教学单元：批准单元表覆盖到的范围用表；其余自动分段。返回按 from 排序。 */
export function buildUnits(chapter: number, verses: QuranVerse[], materials: QuranApprovedMaterial[], vocab: QuranVocabEntry[], repeated: QuranRepeatedStructure[]): QuranUnit[] {
  if (!verses.length) return [];
  const lo = verses[0].verse; const hi = verses[verses.length - 1].verse;
  const seeds = unitSeeds().filter((u) => u.chapter === chapter && u.to >= lo && u.from <= hi);
  const ranges: Array<{ from: number; to: number; seed?: ReturnType<typeof unitSeeds>[number] }> = seeds.map((s) => ({ from: Math.max(lo, s.from), to: Math.min(hi, s.to), seed: s }));
  // 批准表没盖住的缝隙 → 自动分段
  let cursor = lo;
  const gaps: Array<{ from: number; to: number }> = [];
  for (const r of ranges.slice().sort((a, b) => a.from - b.from)) {
    if (r.from > cursor) gaps.push({ from: cursor, to: r.from - 1 });
    cursor = Math.max(cursor, r.to + 1);
  }
  if (cursor <= hi) gaps.push({ from: cursor, to: hi });
  for (const g of gaps) {
    const sub = verses.filter((v) => v.verse >= g.from && v.verse <= g.to);
    for (const piece of autoSplit(chapter, sub, repeated)) ranges.push(piece);
  }
  ranges.sort((a, b) => a.from - b.from);

  const concepts = materials.filter((m) => m.kind === 'concept' && m.chapter === chapter);
  return ranges.map((r, i) => {
    const refs = verses.filter((v) => v.verse >= r.from && v.verse <= r.to).map((v) => v.ref);
    const unitVocab = vocab.filter((w) => w.meaning && w.refs.some((ref) => refs.includes(ref))).slice(0, 8).map((w) => w.word);
    const rep = repeated.find((x) => x.refs.filter((ref) => refs.includes(ref)).length >= 2);
    const conceptIds = concepts.filter((c) => (c.from ?? 1) <= r.to && (c.to ?? 9999) >= r.from).map((c) => c.id);
    const id = r.seed ? r.seed.id : `u-auto-${chapter}-${r.from}-${r.to}`;
    return {
      id, chapter, index: i + 1, from: r.from, to: r.to,
      title: r.seed ? tri(...r.seed.title) : fillTri(AUTO.autoUnitTitle, { range: rangeLabel(r.from, r.to) }),
      theme: r.seed ? tri(...r.seed.theme) : fillTri(AUTO.autoUnitTheme, {}),
      conceptIds, vocabulary: unitVocab, verseRefs: refs,
      repeated: rep ? { phrase: rep.phrase, count: rep.refs.filter((ref) => refs.includes(ref)).length, refs: rep.refs.filter((ref) => refs.includes(ref)) } : undefined,
      origin: r.seed ? 'approved' : 'auto',
    };
  });
}

export function buildConcepts(chapter: number, verses: QuranVerse[], materials: QuranApprovedMaterial[]): QuranConcept[] {
  const lo = verses[0]?.verse ?? 1; const hi = verses[verses.length - 1]?.verse ?? 0;
  return materials
    .filter((m) => m.kind === 'concept' && m.chapter === chapter && (m.from ?? 1) <= hi && (m.to ?? 9999) >= lo)
    .map((m) => ({
      id: m.id, chapter, label: m.title,
      verseRefs: verses.filter((v) => v.verse >= Math.max(lo, m.from ?? 1) && v.verse <= Math.min(hi, m.to ?? 9999)).map((v) => v.ref),
      materialIds: [m.id, ...materials.filter((x) => x.kind === 'unit' && x.chapter === chapter && x.from === m.from && x.to === m.to).map((x) => x.id)],
    }));
}

export function parseRange(chapter: number, verses: QuranVerse[], materials: QuranApprovedMaterial[]): QuranParseResult {
  const vocabulary = buildVocabulary(verses, materials);
  const repeated = detectRepeated(verses);
  const units = buildUnits(chapter, verses, materials, vocabulary, repeated);
  const concepts = buildConcepts(chapter, verses, materials);
  const events = unitSeeds()
    .filter((u) => u.chapter === chapter && u.persons && u.persons.length && u.to >= (verses[0]?.verse ?? 1) && u.from <= (verses[verses.length - 1]?.verse ?? 0))
    .map((u, i) => ({ order: i + 1, title: tri(...u.title), from: u.from, to: u.to, persons: (u.persons || []).map((p) => tri(...p)) }));
  const wordCount = verses.reduce((a, v) => a + tokenizeVerse(v.arabic).length, 0);
  const materialIds = Array.from(new Set([
    ...vocabulary.filter((w) => w.materialId).map((w) => w.materialId as string),
    ...units.filter((u) => u.origin === 'approved').map((u) => u.id),
    ...concepts.map((c) => c.id),
    ...materials.filter((m) => m.kind === 'theme' && m.chapter === chapter).map((m) => m.id),
  ]));
  return {
    chapter,
    from: verses[0]?.verse ?? 0,
    to: verses[verses.length - 1]?.verse ?? 0,
    verseCount: verses.length,
    wordCount,
    uniqueWords: vocabulary.length,
    vocabulary,
    units,
    concepts,
    repeated,
    events,
    materialIds,
    parsedAt: Date.now(),
  };
}

/** 经文检索：按归一化词匹配（长文本能力：优素福章 111 节可检索） */
export function searchVerses(verses: QuranVerse[], query: string, limit = 50): Array<{ verse: QuranVerse; hits: number }> {
  const terms = query.split(/\s+/).map(normalizeArabic).filter(Boolean);
  if (!terms.length) return [];
  const out: Array<{ verse: QuranVerse; hits: number }> = [];
  for (const v of verses) {
    const norms = tokenizeVerse(v.arabic).map((t) => t.norm);
    let hits = 0;
    for (const t of terms) hits += norms.filter((n) => n === t || n.includes(t)).length;
    if (hits) out.push({ verse: v, hits });
  }
  return out.sort((a, b) => b.hits - a.hits).slice(0, limit);
}
