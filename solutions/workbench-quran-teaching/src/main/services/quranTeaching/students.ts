/**
 * 5 名演示学生（说明书第十四节）+ 学习分析（第十五、十六节 / 能力⑥）。
 *
 * 学生答题数据可预置（按特征做种子模拟），但分析是**纯函数**：输入题目 + 答题记录 → 输出维度成绩、
 * 弱项、群体共同问题。改一条记录再算一次，结果就变（验收 09 动态重算）。
 * 统计由程序算，AI 只在后面写解释（说明书 22：统计与 AI 解释分离）。
 */
import type {
  QuranAnalysis, QuranAnswerRecord, QuranDimension, QuranDimensionScore, QuranGroupAnalysis, QuranGroupIssue, QuranIssueClass, QuranLang,
  QuranPaper, QuranQuestion, QuranRetestCompare, QuranStudent, QuranStudentAnalysis, QuranWeakItem,
} from '@totalclaw/ipc-contracts';
import templates from './analysisTemplates.json';
import { fill, questionsForStudent } from './quiz';
import { isCorrect } from './quiz';
import { SeededRng } from './rng';

type Tri3 = [string, string, string];
const T = templates as unknown as {
  students: Array<{ id: string; code: string; name: Tri3; description: Tri3; traits: QuranStudent['traits'] & { weakConceptHint?: string } }>;
  dimension: Record<QuranDimension, Tri3>; type: Record<string, Tri3>; classification: Record<QuranIssueClass, Tri3>;
  verdict: Record<string, Tri3>; weakLabel: Record<string, Tri3>; recommend: Record<string, Tri3>; note: Record<string, Tri3>;
};

const tri = (v: Tri3) => ({ zh: v[0], en: v[1], ar: v[2] });

export const DIMENSIONS: QuranDimension[] = ['memory', 'order', 'vocabulary', 'comprehension', 'concept'];

export function demoStudents(): QuranStudent[] {
  return T.students.map((s) => ({ id: s.id, code: s.code, name: tri(s.name), description: tri(s.description), traits: { ...s.traits } }));
}

export function dimensionLabel(d: QuranDimension, lang: QuranLang): string { return fill(T.dimension[d], lang, {}); }
export function typeLabel(t: string, lang: QuranLang): string { return fill(T.type[t] || [t, t, t], lang, {}); }
export function classificationLabel(c: QuranIssueClass, lang: QuranLang): string { return fill(T.classification[c], lang, {}); }

/** 按特征模拟一名学生对一份试卷的作答（可复现）。 */
export function simulateAnswers(student: QuranStudent, paper: QuranPaper, seed: string, opts: { attempt?: number; origin?: QuranAnswerRecord['origin']; boost?: number } = {}): QuranAnswerRecord[] {
  const rng = new SeededRng(`${seed}:${student.id}:${paper.id}`);
  // 丁「某一概念连续出错」：挑本卷出现最多的概念，让同一概念的题连续错
  let weakConcept: string | undefined;
  if (student.traits.weakConceptHint === 'first') {
    const freq = new Map<string, number>();
    for (const q of paper.questions) if (q.conceptId) freq.set(q.conceptId, (freq.get(q.conceptId) || 0) + 1);
    weakConcept = Array.from(freq.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  }
  const now = Date.now();
  return paper.questions.map((q, i) => {
    let p = student.traits[q.dimension] ?? 0.7;
    if (weakConcept && q.conceptId === weakConcept) p = 0.12; // 局部知识点连续出错
    if (student.traits.weakChapter && q.sourceRefs[0]?.startsWith(`${student.traits.weakChapter}:`)) p *= 0.5;
    p = Math.min(0.98, p + (opts.boost || 0));
    const correct = rng.chance(p);
    const answer = correct ? q.answer : wrongAnswer(q, rng);
    return {
      id: `r-${paper.id}-${student.id}-${q.id}-${opts.attempt || 1}`,
      studentId: student.id, paperId: paper.id, questionId: q.id, chapter: paper.chapter,
      answer, correct, attempt: opts.attempt || 1,
      timeSec: 20 + rng.int(70),
      answeredAt: now + i * 1000,
      origin: opts.origin || 'preset',
    };
  });
}

function wrongAnswer(q: QuranQuestion, rng: SeededRng): number | number[] {
  if (typeof q.answer === 'number') {
    const others = q.options.map((_, i) => i).filter((i) => i !== q.answer);
    return others.length ? rng.pick(others) : q.answer;
  }
  // 序列题：交换两个位置
  const arr = q.answer.slice();
  if (arr.length >= 2) {
    const i = rng.int(arr.length); let j = rng.int(arr.length);
    if (j === i) j = (i + 1) % arr.length;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pct(correct: number, total: number): QuranDimensionScore {
  return { pct: total ? Math.round((correct / total) * 100) : 0, correct, total };
}

/** 题目 → 弱项归类键。vocabulary 带裸词 word，供文案模板套「词汇「X」」时不重复包裹。 */
function weakKey(q: QuranQuestion): { kind: QuranWeakItem['kind']; key: string; label: (lang: QuranLang) => string; refs: string[]; word?: string } {
  if (q.conceptId) return { kind: 'concept', key: q.conceptId, label: () => q.conceptLabel || q.conceptId!, refs: q.sourceRefs };
  if (q.dimension === 'vocabulary' && q.materialIds[0]) {
    const word = typeof q.answer === 'number' ? q.options[q.answer] : (q.left || [])[0] || '';
    return { kind: 'vocabulary', key: q.materialIds[0], label: (lang) => fill(T.weakLabel.vocabulary, lang, { word }), refs: q.sourceRefs, word };
  }
  if (q.sourceRefs[0]) return { kind: 'verse', key: q.sourceRefs[0], label: (lang) => fill(T.weakLabel.verse, lang, { ref: q.sourceRefs[0] }), refs: q.sourceRefs };
  return { kind: 'type', key: q.type, label: (lang) => fill(T.weakLabel.type, lang, { type: typeLabel(q.type, lang) }), refs: [] };
}

/** 单个学生：总分 + 五维 + 弱项 + 推荐动作（全部由记录计算，可追溯到章/节）。 */
export function analyzeStudent(studentId: string, paper: QuranPaper, records: QuranAnswerRecord[], lang: QuranLang): QuranStudentAnalysis {
  // 每名学生可能拿到的是自己那一版（题序与选项顺序不同，正确答案下标随之不同）。
  // 判分必须用该生那版的题目对象；没有变体的旧存档自动退回原卷，口径不变。
  const paperQuestions = questionsForStudent(paper, studentId);
  const byQ = new Map<string, QuranAnswerRecord>();
  for (const r of records) if (r.studentId === studentId && r.paperId === paper.id) {
    const prev = byQ.get(r.questionId);
    if (!prev || r.attempt >= prev.attempt) byQ.set(r.questionId, r);
  }
  const dims: Record<QuranDimension, { c: number; t: number }> = { memory: { c: 0, t: 0 }, order: { c: 0, t: 0 }, vocabulary: { c: 0, t: 0 }, comprehension: { c: 0, t: 0 }, concept: { c: 0, t: 0 } };
  const weak = new Map<string, QuranWeakItem>();
  const typeWrong = new Map<string, { wrong: number; total: number }>();
  let correct = 0; let total = 0;
  for (const q of paperQuestions) {
    const r = byQ.get(q.id);
    const ok = r ? isCorrect(q, r.answer) : false;
    total += 1; if (ok) correct += 1;
    dims[q.dimension].t += 1; if (ok) dims[q.dimension].c += 1;
    const tw = typeWrong.get(q.type) || { wrong: 0, total: 0 };
    tw.total += 1; if (!ok) tw.wrong += 1; typeWrong.set(q.type, tw);
    const wk = weakKey(q);
    const item = weak.get(wk.key) || { kind: wk.kind, key: wk.key, label: wk.label(lang), refs: [], wrong: 0, total: 0 };
    item.total += 1; if (!ok) item.wrong += 1;
    for (const ref of wk.refs) if (!item.refs.includes(ref)) item.refs.push(ref);
    weak.set(wk.key, item);
  }
  // 题型层面的弱项（某题型错误率 ≥ 50% 且 ≥2 题）
  for (const [type, tw] of typeWrong) if (tw.total >= 2 && tw.wrong / tw.total >= 0.5) {
    weak.set(`type:${type}`, { kind: 'type', key: type, label: fill(T.weakLabel.type, lang, { type: typeLabel(type, lang) }), refs: [], wrong: tw.wrong, total: tw.total });
  }
  const weakItems = Array.from(weak.values()).filter((w) => w.wrong > 0).sort((a, b) => (b.wrong / b.total) - (a.wrong / a.total) || b.wrong - a.wrong).slice(0, 6);
  const recommendations = weakItems.slice(0, 3).map((w) => {
    if (w.kind === 'concept') return fill(T.recommend.concept, lang, { label: w.label, refs: w.refs.slice(0, 4).join(', ') });
    if (w.kind === 'verse') return fill(T.recommend.verse, lang, { ref: w.key });
    if (w.kind === 'vocabulary') return fill(T.recommend.vocabulary, lang, { word: rawWord(paper, w.key) || w.label });
    return fill(T.recommend.type, lang, { type: typeLabel(w.key, lang) });
  });
  if (!recommendations.length) recommendations.push(fill(T.recommend.fine, lang, {}));
  return {
    studentId, paperId: paper.id,
    total: pct(correct, total),
    dimensions: { memory: pct(dims.memory.c, dims.memory.t), order: pct(dims.order.c, dims.order.t), vocabulary: pct(dims.vocabulary.c, dims.vocabulary.t), comprehension: pct(dims.comprehension.c, dims.comprehension.t), concept: pct(dims.concept.c, dims.concept.t) },
    weakItems, recommendations,
  };
}

/** 词汇弱项的裸词（从题目里取，不从已套模板的 label 里剥） */
function rawWord(paper: QuranPaper, materialId: string): string {
  const q = paper.questions.find((x) => x.dimension === 'vocabulary' && x.materialIds[0] === materialId);
  return q ? weakKey(q).word || '' : '';
}

function classify(q: QuranQuestion, kind: QuranWeakItem['kind'], approvedCount: number): QuranIssueClass {
  if (kind === 'type') return 'question_type';
  if (kind === 'vocabulary') return 'vocabulary';
  if (kind === 'concept') return approvedCount <= 1 ? 'coverage_gap' : 'concept';
  if (q.dimension === 'order') return 'order';
  return 'memory';
}

/** 群体：把 5 名学生放在一起，按知识点/词汇/经文/题型统计错误人数并判定。 */
export function analyzeGroup(paper: QuranPaper, students: QuranStudent[], records: QuranAnswerRecord[], lang: QuranLang, approvedCountFor: (conceptId: string) => number): QuranGroupAnalysis {
  const perStudent = students.map((s) => analyzeStudent(s.id, paper, records, lang));
  const issues = new Map<string, QuranGroupIssue & { _q?: QuranQuestion }>();
  for (const q of paper.questions) {
    const wk = weakKey(q);
    const it = issues.get(wk.key) || { key: wk.key, kind: wk.kind, label: wk.label(lang), refs: wk.refs.slice(0, 6), wrongStudents: [], wrongCount: 0, studentCount: students.length, ratio: 0, verdict: 'individual', classification: 'memory', note: '', _q: q };
    issues.set(wk.key, it);
  }
  for (const [i, s] of students.entries()) {
    const a = perStudent[i];
    for (const w of a.weakItems) {
      if (w.kind === 'type') continue;
      const it = issues.get(w.key);
      if (it && w.wrong > 0 && !it.wrongStudents.includes(s.id)) it.wrongStudents.push(s.id);
    }
  }
  // 题型层：某题型有 ≥2 题且该学生错一半以上
  const typeStats = new Map<string, { qs: QuranQuestion[] }>();
  for (const q of paper.questions) { const t = typeStats.get(q.type) || { qs: [] }; t.qs.push(q); typeStats.set(q.type, t); }
  for (const [type, st] of typeStats) {
    if (st.qs.length < 2) continue;
    const key = `type:${type}`;
    const it: QuranGroupIssue & { _q?: QuranQuestion } = { key, kind: 'type', label: fill(T.weakLabel.type, lang, { type: typeLabel(type, lang) }), refs: [], wrongStudents: [], wrongCount: 0, studentCount: students.length, ratio: 0, verdict: 'individual', classification: 'question_type', note: '', _q: st.qs[0] };
    for (const [i, s] of students.entries()) if (perStudent[i].weakItems.some((w) => w.kind === 'type' && w.key === type)) it.wrongStudents.push(s.id);
    issues.set(key, it);
  }
  const out: QuranGroupIssue[] = [];
  for (const it of issues.values()) {
    it.wrongCount = it.wrongStudents.length;
    if (!it.wrongCount) continue;
    it.ratio = Math.round((it.wrongCount / it.studentCount) * 100) / 100;
    it.verdict = it.wrongCount >= 3 ? 'common' : it.wrongCount === 2 ? 'hint' : 'individual';
    const q = it._q!;
    it.classification = classify(q, it.kind, it.kind === 'concept' ? approvedCountFor(it.key) : 99);
    const v = fill(T.verdict[it.verdict], lang, { n: it.wrongCount, m: it.studentCount });
    let note = '';
    if (it.kind === 'concept') note = fill(T.note.concept, lang, { n: it.wrongCount, label: it.label });
    else if (it.kind === 'vocabulary') note = fill(T.note.vocabulary, lang, { n: it.wrongCount, word: weakKey(q).word || it.label });
    else if (it.kind === 'verse') note = fill(T.note.verse, lang, { n: it.wrongCount, ref: it.key });
    else note = fill(T.note.type, lang, { n: it.wrongCount, type: typeLabel(it.key.replace(/^type:/, ''), lang) });
    if (it.classification === 'coverage_gap') note += ' ' + fill(T.note.coverage, lang, {});
    it.note = `${v} · ${note}`;
    delete it._q;
    out.push(it);
  }
  out.sort((a, b) => b.wrongCount - a.wrongCount || (a.kind === 'concept' ? -1 : 1));
  return { paperId: paper.id, issues: out, commonCount: out.filter((i) => i.verdict === 'common').length, computedAt: Date.now() };
}

export function analyzePaper(paper: QuranPaper, students: QuranStudent[], records: QuranAnswerRecord[], lang: QuranLang, approvedCountFor: (conceptId: string) => number): QuranAnalysis {
  return {
    paperId: paper.id,
    students: students.map((s) => analyzeStudent(s.id, paper, records, lang)),
    group: analyzeGroup(paper, students, records, lang, approvedCountFor),
  };
}

/** 题目考的知识点（概念 / 词汇 / 经文）；只能按题型归类的题不算知识点 */
function knowledgeKey(q: QuranQuestion): string | null {
  const k = weakKey(q);
  return k.kind === 'type' ? null : k.key;
}
/** 这张卷有没有考到某个薄弱点键（题型键 type:xxx 按群体分析的规则：该题型 ≥2 题才成立） */
export function covers(p: QuranPaper, key: string): boolean {
  if (key.startsWith('type:')) return p.questions.filter((q) => q.type === key.slice(5)).length >= 2;
  return p.questions.some((q) => knowledgeKey(q) === key);
}

/**
 * 复测前后对比（同一口径）。原卷与复测卷题目不同、题数不同：原卷 10 题覆盖好几个知识点，复测卷只围绕目标薄弱点，
 * 直接拿「整卷共同薄弱点数」「整卷正确率」比，4 → 0 其实只是复测卷没考那些知识点。
 * 这里只统计两卷都考到的知识点：共同薄弱点数的分母是这组知识点，答错人数的分母是全体学生，
 * 学生正确率只算这组知识点的题。
 */
export function compareRetest(base: QuranPaper, retest: QuranPaper, students: QuranStudent[], records: QuranAnswerRecord[], lang: QuranLang, approvedCountFor: (conceptId: string) => number, targetKey: string): QuranRetestCompare {
  const baseKeys = new Set(base.questions.map(knowledgeKey).filter((k): k is string => !!k));
  const keys = Array.from(new Set(retest.questions.map(knowledgeKey).filter((k): k is string => !!k && baseKeys.has(k))));
  const shared = new Set(keys);
  const scope = (p: QuranPaper): QuranPaper => ({ ...p, questions: p.questions.filter((q) => shared.has(knowledgeKey(q) || '')) });
  const b = scope(base); const a = scope(retest);
  const common = (g: QuranGroupAnalysis): number => g.issues.filter((i) => shared.has(i.key) && i.verdict === 'common').length;
  const wrongOf = (p: QuranPaper, key: string): number => analyzeGroup(p, students, records, lang, approvedCountFor).issues.find((i) => i.key === key)?.wrongCount ?? 0;
  return {
    keys,
    target: { before: wrongOf(base, targetKey), after: covers(retest, targetKey) ? wrongOf(retest, targetKey) : null, studentCount: students.length },
    common: { before: common(analyzeGroup(b, students, records, lang, approvedCountFor)), after: common(analyzeGroup(a, students, records, lang, approvedCountFor)) },
    students: students.map((s) => ({ studentId: s.id, before: analyzeStudent(s.id, b, records, lang).total, after: analyzeStudent(s.id, a, records, lang).total })),
  };
}
