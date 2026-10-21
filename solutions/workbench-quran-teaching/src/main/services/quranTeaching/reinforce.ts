/**
 * 自适应强化与复测（说明书第十七节 / 能力⑦）：
 * 针对一个薄弱点 → 简要解释（批准资料）+ 复习卡 + 3-5 道针对性练习 + 一次复测 + 前后对比。
 */
import type { QuranApprovedMaterial, QuranGroupIssue, QuranLang, QuranParseResult, QuranQuestionType, QuranReviewCard, QuranVerse } from '@totalclaw/ipc-contracts';
import templates from './reinforceTemplates.json';
import { fill, type PaperSpec } from './quiz';
import { classificationLabel } from './students';

type Tri3 = [string, string, string];
const T = templates as unknown as { explanation: Record<string, Tri3>; card: Record<string, Tri3> };

export function specForIssue(issue: QuranGroupIssue, count: number): PaperSpec {
  if (issue.kind === 'concept') return { count, focus: { conceptId: issue.key }, mix: { 1: 0.2, 2: 0.5, 3: 0.3 } };
  if (issue.kind === 'vocabulary') return { count, focus: { kind: 'vocabulary', key: issue.key, dimension: 'vocabulary' }, types: ['fill', 'match'], mix: { 1: 0.5, 2: 0.5, 3: 0 } };
  if (issue.kind === 'verse') return { count, focus: { kind: 'verse', key: issue.key }, mix: { 1: 0.8, 2: 0.2, 3: 0 } };
  return { count, types: [issue.key.replace(/^type:/, '') as QuranQuestionType], mix: { 1: 0.6, 2: 0.3, 3: 0.1 } };
}

export function reinforcementExplanation(issue: QuranGroupIssue, lang: QuranLang, parse: QuranParseResult, materials: QuranApprovedMaterial[]): string {
  const cls = classificationLabel(issue.classification, lang);
  if (issue.kind === 'concept') {
    const c = parse.concepts.find((x) => x.id === issue.key);
    const unit = materials.find((m) => m.kind === 'unit' && c?.materialIds.includes(m.id));
    return fill(T.explanation.concept, lang, { label: issue.label, cls, refs: (c?.verseRefs || issue.refs).slice(0, 6).join(', '), body: unit?.body?.[lang] || '' });
  }
  if (issue.kind === 'vocabulary') {
    const g = materials.find((m) => m.id === issue.key);
    return fill(T.explanation.vocabulary, lang, { label: issue.label, cls, body: g?.title[lang] || '', refs: issue.refs.join(', ') });
  }
  if (issue.kind === 'verse') return fill(T.explanation.verse, lang, { label: issue.key, cls });
  return fill(T.explanation.type, lang, { label: issue.label, cls });
}

export function reviewCards(issue: QuranGroupIssue, lang: QuranLang, parse: QuranParseResult, verses: QuranVerse[], materials: QuranApprovedMaterial[]): QuranReviewCard[] {
  const cards: QuranReviewCard[] = [];
  const byRef = new Map(verses.map((v) => [v.ref, v]));
  if (issue.kind === 'concept') {
    const c = parse.concepts.find((x) => x.id === issue.key);
    const unit = materials.find((m) => m.kind === 'unit' && c?.materialIds.includes(m.id));
    if (c) cards.push({ title: fill(T.card.conceptTitle, lang, { label: c.label[lang] }), body: fill(T.card.conceptBody, lang, { refs: c.verseRefs.slice(0, 6).join(', '), body: unit?.body?.[lang] || '' }), refs: c.verseRefs });
    for (const ref of (c?.verseRefs || issue.refs).slice(0, 3)) { const v = byRef.get(ref); if (v) cards.push({ title: fill(T.card.verse, lang, { ref }), body: '', arabic: v.arabic, refs: [ref] }); }
    for (const w of parse.vocabulary.filter((x) => x.meaning && x.refs.some((r) => c?.verseRefs.includes(r))).slice(0, 3)) {
      cards.push({ title: fill(T.card.vocabTitle, lang, { word: w.word }), body: fill(T.card.vocabBody, lang, { meaning: w.meaning![lang], refs: w.refs.slice(0, 3).join(', ') }), refs: w.refs, arabic: w.word });
    }
  } else if (issue.kind === 'vocabulary') {
    const w = parse.vocabulary.find((x) => x.materialId === issue.key);
    if (w) {
      cards.push({ title: fill(T.card.vocabTitle, lang, { word: w.word }), body: fill(T.card.vocabBody, lang, { meaning: w.meaning![lang], refs: w.refs.slice(0, 3).join(', ') }), refs: w.refs, arabic: w.word });
      for (const ref of w.refs.slice(0, 2)) { const v = byRef.get(ref); if (v) cards.push({ title: fill(T.card.verse, lang, { ref }), body: '', arabic: v.arabic, refs: [ref] }); }
    }
  } else if (issue.kind === 'verse') {
    const v = byRef.get(issue.key);
    if (v) {
      cards.push({ title: fill(T.card.verse, lang, { ref: v.ref }), body: '', arabic: v.arabic, refs: [v.ref] });
      const u = parse.units.find((x) => x.verseRefs.includes(v.ref));
      if (u) cards.push({ title: fill(T.card.unitTitle, lang, { title: u.title[lang] }), body: u.theme[lang], refs: u.verseRefs });
      for (const w of parse.vocabulary.filter((x) => x.meaning && x.refs.includes(v.ref)).slice(0, 3)) cards.push({ title: fill(T.card.vocabTitle, lang, { word: w.word }), body: fill(T.card.vocabBody, lang, { meaning: w.meaning![lang], refs: w.refs.slice(0, 3).join(', ') }), refs: w.refs, arabic: w.word });
    }
  } else {
    for (const u of parse.units.slice(0, 2)) cards.push({ title: fill(T.card.unitTitle, lang, { title: u.title[lang] }), body: u.theme[lang], refs: u.verseRefs });
  }
  return cards;
}
