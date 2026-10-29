/**
 * 古兰经智能教学演示 · 核心能力单测（对应说明书验收 01/03/04/05/06/07/08/09/10）。
 * 全部走真实语料包（resources/quran-demo-corpus），不 mock 经文。
 */
import { mkdtempSync, rmSync, writeFileSync, copyFileSync, readdirSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadCorpus, versesInRange } from './corpus';
import { approvedMaterials } from './approved';
import { detectRepeated, parseRange, searchVerses } from './parse';
import { normalizeArabic, tokenizeVerse } from './textUtils';
import { generateQuestions, isCorrect, paperSignature, questionFace, verifyDraft, type QuizContext } from './quiz';
import { analyzeGroup, analyzeStudent, demoStudents, simulateAnswers } from './students';
import { allocateUnits, buildPlanSkeleton } from './planner';
import { buildGraph } from './graph';
import { buildCardHtml, buildVideoScript, cardTextLayer } from './media';
import { QuranTeachingStore, queryTerms } from './store';

const CORPUS = join(__dirname, '..', '..', '..', '..', '..', '..', 'resources', 'quran-demo-corpus');

describe('L1 语料导入与校验（验收 01）', () => {
  it('10 章 265 节全部通过 SHA-256 校验并按章/节可检索', () => {
    const c = loadCorpus(CORPUS, 'bundled');
    expect(c.status.problems).toEqual([]);
    expect(c.status.allVerified).toBe(true);
    expect(c.status.totalVerses).toBe(265);
    expect(c.status.chapters.map((x) => x.chapter).sort((a, b) => a - b)).toEqual([1, 12, 49, 55, 67, 103, 108, 112, 113, 114]);
    expect(c.byChapter.get(12)!.length).toBe(111);
    expect(normalizeArabic(versesInRange(c, 103, 2, 2)[0].arabic)).toBe('انالانسانلفيخسر');
    for (const v of c.verses) expect(v.reviewStatus).toBe('frozen');
  });

  it('任一文件被改动即整包拒绝（原文冻结）', () => {
    const dir = mkdtempSync(join(tmpdir(), 'quran-corpus-'));
    for (const f of readdirSync(CORPUS)) copyFileSync(join(CORPUS, f), join(dir, f));
    const target = readdirSync(dir).find((f) => f.startsWith('02_103'))!;
    writeFileSync(join(dir, target), '103:1\tتغيير\n');
    const c = loadCorpus(dir, 'directory');
    expect(c.status.allVerified).toBe(false);
    expect(c.status.problems.join('\n')).toMatch(/校验值不符/);
    expect(c.verses.length).toBe(0);
    rmSync(dir, { recursive: true, force: true });
  });

  it('长文本检索：优素福章按词检索命中', () => {
    const c = loadCorpus(CORPUS, 'bundled');
    const hits = searchVerses(c.byChapter.get(12)!, 'يوسف');
    expect(hits.length).toBeGreaterThan(10);
    expect(hits.every((h) => h.verse.chapter === 12)).toBe(true);
  });
});

describe('L2 批准资料与 L1 匹配', () => {
  it('批准词表每个词都能在对应章原文里逐词匹配到', () => {
    const c = loadCorpus(CORPUS, 'bundled');
    const mats = approvedMaterials();
    const glossary = mats.filter((m) => m.kind === 'glossary');
    expect(glossary.length).toBeGreaterThan(400);
    const missing: string[] = [];
    for (const g of glossary) {
      const toks = new Set((c.byChapter.get(g.chapter) || []).flatMap((v) => tokenizeVerse(v.arabic).map((t) => t.norm)));
      if (!toks.has(g.word!)) missing.push(`${g.chapter}:${g.word}`);
    }
    expect(missing).toEqual([]);
    for (const m of mats) { expect(m.reviewStatus).toBe('approved'); expect(m.source).toBeTruthy(); }
  });
  it('归一化把奥斯曼体写法统一到骨架形', () => {
    expect(normalizeArabic('ٱلْعَـٰلَمِينَ')).toBe('العالمين');
    expect(normalizeArabic('ءَامَنُوا۟')).toBe('امنوا');
    expect(normalizeArabic('لِلتَّقْوَىٰ')).toBe('للتقوي');
  });
});

describe('内容解析（验收 03/04）', () => {
  const c = loadCorpus(CORPUS, 'bundled');
  const mats = approvedMaterials();
  it('第 49 章拆成多个教学单元而不是一段摘要', () => {
    const p = parseRange(49, c.byChapter.get(49)!, mats);
    expect(p.units.length).toBeGreaterThanOrEqual(4);
    expect(p.units.every((u) => u.origin === 'approved')).toBe(true);
    expect(p.units.flatMap((u) => u.verseRefs).length).toBe(18);
    expect(p.concepts.length).toBeGreaterThan(5);
    expect(p.vocabulary.filter((w) => w.meaning).length).toBeGreaterThan(20);
    for (const u of p.units) expect(u.verseRefs.every((r) => r.startsWith('49:'))).toBe(true);
  });
  it('第 55 章识别 31 次重复反问句', () => {
    const rep = detectRepeated(c.byChapter.get(55)!);
    expect(rep[0].count).toBe(31);
    expect(normalizeArabic(rep[0].phrase)).toContain('تكذبان');
  });
  it('第 113 章识别节首重复短语「وَمِن شَرِّ」', () => {
    const rep = detectRepeated(c.byChapter.get(113)!);
    expect(rep.some((r) => normalizeArabic(r.phrase.replace(/\s+/g, '')) === 'ومنشر' && r.count === 3)).toBe(true);
  });
  it('优素福章任意节范围可解析出事件与单元（含未覆盖范围自动分段）', () => {
    const p = parseRange(12, versesInRange(c, 12, 40, 75), mats);
    expect(p.verseCount).toBe(36);
    expect(p.units.length).toBeGreaterThanOrEqual(3);
    expect(p.events.length).toBeGreaterThanOrEqual(3);
    expect(p.units[0].from).toBe(40);
    expect(p.units[p.units.length - 1].to).toBe(75);
  });
});

function ctxFor(chapter: number, from?: number, to?: number, lang: 'zh' | 'en' | 'ar' = 'zh'): QuizContext {
  const c = loadCorpus(CORPUS, 'bundled');
  const mats = approvedMaterials();
  const verses = versesInRange(c, chapter, from, to);
  return { lang, chapterName: `S${chapter}`, verses, chapterVerses: c.byChapter.get(chapter)!, parse: parseRange(chapter, verses, mats), glossarySource: 'demo' };
}
const approvedIds = new Set(approvedMaterials().map((m) => m.id));

describe('动态出题（验收 05/06）', () => {
  it('第 103 章连续三套 10 题试卷互不相同，且每题都有来源与校验', () => {
    const ctx = ctxFor(103);
    const sigs = new Set<string>();
    for (let i = 0; i < 3; i += 1) {
      const { questions } = generateQuestions(ctx, `seed-${i}`, { count: 10 }, approvedIds);
      expect(questions.length).toBe(10);
      for (const q of questions) {
        expect(q.sourceRefs.length).toBeGreaterThan(0);
        expect(q.verified).toBe(true);
        expect(q.aiGenerated).toBe(true);
        expect(q.explanation).toBeTruthy();
      }
      sigs.add(paperSignature(questions));
    }
    expect(sigs.size).toBe(3);
  });
  it('至少覆盖五种题型中的三种以上，选项逐字来自锁定经文/批准词表', () => {
    const ctx = ctxFor(49);
    const { questions } = generateQuestions(ctx, 'types', { count: 24, mix: { 1: 0.4, 2: 0.35, 3: 0.25 } }, approvedIds);
    const types = new Set(questions.map((q) => q.type));
    expect(types.size).toBeGreaterThanOrEqual(3);
    const allText = new Set(ctx.chapterVerses.map((v) => v.arabic));
    const allWords = new Set(ctx.chapterVerses.flatMap((v) => v.arabic.split(/\s+/)));
    const meanings = new Set(approvedMaterials().filter((m) => m.kind === 'glossary').map((m) => m.title.zh));
    // 出题缺省转成「只考理解」之后，单元主题题（unitTheme）成了常客：它的选项是**单元主题**，
    // 既不是经文原文也不是「单元 N：…」那种标签。主题同样逐字取自批准的教案结构表，
    // 属于可追溯的来源，所以这里一并算进来 —— 要守的是「选项不得凭空生造」，不是「只能是经文」。
    const themes = new Set(ctx.parse.units.map((u) => u.theme.zh));
    for (const q of questions) {
      if (q.type === 'mcq' || q.type === 'concept') {
        const isVerse = q.options.every((o) => allText.has(o));
        const isUnit = q.options.every((o) => /^单元/.test(o));
        const isTheme = q.options.every((o) => themes.has(o));
        expect(isVerse || isUnit || isTheme, `选项来源不明：${q.options.join(' / ')}`).toBe(true);
      }
      if (q.type === 'fill') for (const o of q.options) expect(allWords.has(o)).toBe(true);
      if (q.type === 'match' && q.dimension === 'vocabulary') for (const o of q.options) expect(meanings.has(o)).toBe(true);
    }
  });
  it('同一种子可复现，不同种子不同', () => {
    const ctx = ctxFor(67);
    const a = generateQuestions(ctx, 'same', { count: 8 }, approvedIds).questions;
    const b = generateQuestions(ctx, 'same', { count: 8 }, approvedIds).questions;
    const d = generateQuestions(ctx, 'other', { count: 8 }, approvedIds).questions;
    expect(paperSignature(a)).toBe(paperSignature(b));
    expect(paperSignature(a)).not.toBe(paperSignature(d));
  });
  it('一致性检查拦截答案不在源内容里的题', () => {
    const ctx = ctxFor(103);
    const bad = { type: 'mcq' as const, difficulty: 1 as const, dimension: 'memory' as const, kind: 'identify', stem: 'x', options: ['伪造经文', 'b', 'c'], answer: 0, sourceRefs: ['103:1'], materialIds: [], explanation: '', phrasing: 0, proof: { kind: 'verbatim' as const, texts: ['伪造经文'], refs: ['103:1'] } };
    expect(verifyDraft(bad, ctx, approvedIds).ok).toBe(false);
  });
  it('三语题干都能生成，阿语题干含阿拉伯文', () => {
    for (const lang of ['zh', 'en', 'ar'] as const) {
      const { questions } = generateQuestions(ctxFor(112, undefined, undefined, lang), `l-${lang}`, { count: 4 }, approvedIds);
      expect(questions.length).toBe(4);
      if (lang === 'ar') expect(questions.every((q) => /[؀-ۿ]/.test(q.stem))).toBe(true);
      if (lang === 'en') expect(questions.some((q) => /verse|Which|order|Match/i.test(q.stem))).toBe(true);
    }
  });
  it('优素福章随机节范围能出跨节题（事件顺序 / 单元匹配）', () => {
    const ctx = ctxFor(12, 20, 60);
    const { questions } = generateQuestions(ctx, 'yusuf', { count: 12, mix: { 1: 0.2, 2: 0.3, 3: 0.5 } }, approvedIds);
    expect(questions.some((q) => q.difficulty === 3)).toBe(true);
  });
});

describe('维度配额与人设呈现（验收复审 P0-3/P0-4）', () => {
  it('第 103 章每套 10 题都含理解题与概念题', () => {
    const ctx = ctxFor(103);
    for (let i = 0; i < 5; i += 1) {
      const { questions } = generateQuestions(ctx, `quota-${i}`, { count: 10 }, approvedIds);
      expect(questions.length).toBe(10);
      expect(questions.filter((q) => q.dimension === 'comprehension').length).toBeGreaterThanOrEqual(1);
      expect(questions.filter((q) => q.dimension === 'concept').length).toBeGreaterThanOrEqual(1);
    }
  });
  it('乙「背得好理解弱」、丁「同一概念连续错」在 103 章试卷上可见', () => {
    const ctx = ctxFor(103);
    const students = demoStudents();
    /**
     * 这条验收要的是「记忆强、理解弱」这种反差能不能被分析引擎看出来，
     * 前提是卷子里得有记忆 / 语序题。出题缺省已改成**只考理解**（学生多半不识原文，
     * 考背诵诊断不出理解薄弱点），所以这条得显式要全面取向 —— 引擎的能力还在，
     * 只是默认不这么出卷了。
     */
    const { questions } = generateQuestions(ctx, 'persona', { count: 12, mix: { 1: 0.4, 2: 0.4, 3: 0.2 }, audience: 'full' }, approvedIds);
    const paper = { id: 'pp', title: 't', kind: 'practice' as const, chapter: 103, from: 1, to: 3, version: 1, seed: 's', lang: 'zh' as const, questions, signature: '', createdAt: 0 };
    const rec = students.flatMap((st) => simulateAnswers(st, paper, 'persona', {}));
    const b = analyzeStudent('stu-b', paper, rec, 'zh');
    expect(b.dimensions.comprehension.total + b.dimensions.concept.total).toBeGreaterThanOrEqual(2);
    const recall = b.dimensions.memory.total ? b.dimensions.memory.pct : b.dimensions.order.pct;
    const understand = [b.dimensions.comprehension, b.dimensions.concept].filter((x) => x.total).map((x) => x.pct);
    expect(recall).toBeGreaterThanOrEqual(Math.min(...understand));
    const d = analyzeStudent('stu-d', paper, rec, 'zh');
    const conceptQs = questions.filter((q) => q.conceptId);
    if (conceptQs.length >= 2) expect(d.weakItems.some((w) => w.kind === 'concept')).toBe(true);
  });
  it('分析文案不嵌套「词汇「」」、不外露 type: 键', () => {
    const ctx = ctxFor(49);
    const students = demoStudents();
    const { questions } = generateQuestions(ctx, 'labels', { count: 20, types: ['fill', 'match'], mix: { 1: 0.5, 2: 0.5, 3: 0 } }, approvedIds);
    const paper = { id: 'pl', title: 't', kind: 'practice' as const, chapter: 49, from: 1, to: 18, version: 1, seed: 's', lang: 'zh' as const, questions, signature: '', createdAt: 0 };
    const rec = students.flatMap((st) => simulateAnswers(st, paper, 'labels', {}));
    const g = analyzeGroup(paper, students, rec, 'zh', () => 3);
    for (const i of g.issues) { expect(i.note).not.toMatch(/词汇「词汇/); expect(i.note).not.toMatch(/type:/); expect(i.label).not.toMatch(/type:/); }
    for (const st of students) for (const r of analyzeStudent(st.id, paper, rec, 'zh').recommendations) expect(r).not.toMatch(/词汇「词汇|type:/);
  });
});

describe('5 名学生分析与动态重算（验收 07/08/09）', () => {
  const ctx = ctxFor(103);
  const students = demoStudents();
  const { questions } = generateQuestions(ctx, 'analysis', { count: 12, mix: { 1: 0.4, 2: 0.4, 3: 0.2 } }, approvedIds);
  const paper = { id: 'p1', title: 't', kind: 'practice' as const, chapter: 103, from: 1, to: 3, version: 1, seed: 's', lang: 'zh' as const, questions, signature: '', createdAt: 0 };
  const records = students.flatMap((s) => simulateAnswers(s, paper, 'sim', {}));

  it('五名学生形成不同的个人分析，且高掌握者优于弱者', () => {
    const analyses = students.map((s) => analyzeStudent(s.id, paper, records, 'zh'));
    expect(new Set(analyses.map((a) => a.total.pct)).size).toBeGreaterThan(1);
    const a = analyses.find((x) => x.studentId === 'stu-a')!; const e = analyses.find((x) => x.studentId === 'stu-e')!;
    expect(a.total.pct).toBeGreaterThan(e.total.pct);
    for (const an of analyses) { expect(an.recommendations.length).toBeGreaterThan(0); expect(Object.keys(an.dimensions)).toHaveLength(5); }
  });

  it('群体分析给出错误人数/比例与判定，能识别共同问题', () => {
    const g = analyzeGroup(paper, students, records, 'zh', () => 3);
    expect(g.issues.length).toBeGreaterThan(0);
    for (const i of g.issues) { expect(i.wrongCount).toBe(i.wrongStudents.length); expect(i.studentCount).toBe(5); expect(['common', 'hint', 'individual']).toContain(i.verdict); }
    expect(g.issues.some((i) => i.wrongCount >= 2)).toBe(true);
  });

  it('修改一名学生的答案后群体统计随之变化', () => {
    const before = analyzeGroup(paper, students, records, 'zh', () => 3);
    // 把学生甲全部答对改成全部答错
    const edited = records.map((r) => (r.studentId === 'stu-a' ? { ...r, answer: typeof questions.find((q) => q.id === r.questionId)!.answer === 'number' ? -1 : [], correct: false } : r));
    const after = analyzeGroup(paper, students, edited, 'zh', () => 3);
    const totalBefore = before.issues.reduce((a, i) => a + i.wrongCount, 0);
    const totalAfter = after.issues.reduce((a, i) => a + i.wrongCount, 0);
    expect(totalAfter).toBeGreaterThan(totalBefore);
    expect(analyzeStudent('stu-a', paper, edited, 'zh').total.pct).toBe(0);
  });

  it('学生乙「背得好但理解弱」、学生丙「词汇弱」在维度上体现', () => {
    const big = generateQuestions(ctxFor(49), 'dims', { count: 30, mix: { 1: 0.4, 2: 0.4, 3: 0.2 } }, approvedIds).questions;
    const p2 = { ...paper, id: 'p2', chapter: 49, from: 1, to: 18, questions: big };
    const rec = students.flatMap((s) => simulateAnswers(s, p2, 'dims', {}));
    const b = analyzeStudent('stu-b', p2, rec, 'zh');
    const cS = analyzeStudent('stu-c', p2, rec, 'zh');
    const memB = b.dimensions.memory.total ? b.dimensions.memory.pct : 100;
    const conB = b.dimensions.concept.total ? b.dimensions.concept.pct : 0;
    expect(memB).toBeGreaterThanOrEqual(conB);
    if (cS.dimensions.vocabulary.total >= 2 && cS.dimensions.memory.total >= 2) expect(cS.dimensions.vocabulary.pct).toBeLessThanOrEqual(cS.dimensions.memory.pct + 15);
  });
});

describe('教学计划与理解图（验收 02/14）', () => {
  it('课时分配：单元少于课数时拆分，多于课数时合并，环节时间和等于单课时长', () => {
    const ctx = ctxFor(49);
    const plan = buildPlanSkeleton('plan', { chapter: 49, from: 1, to: 18, grade: '大学一年级', level: 'intermediate', sessionsPerWeek: 2, sessionMinutes: 45, weeks: 2, lang: 'zh' }, ctx.parse, 'S49');
    expect(plan.sessions.length).toBe(4);
    for (const s of plan.sessions) expect(s.segments.reduce((a, x) => a + x.minutes, 0)).toBe(45);
    expect(plan.reviewStatus).toBe('draft');
    expect(plan.aiGenerated).toBe(true);
    const many = allocateUnits(ctx.parse.units, 8);
    expect(many.length).toBe(8);
    const few = allocateUnits(ctx.parse.units, 2);
    expect(few.length).toBe(2);
    expect(few[0].from).toBe(1); expect(few[1].to).toBe(18);
  });
  it('理解图：章→单元→概念→经文，节点带来源；优素福章按单元折叠', () => {
    const ctx = ctxFor(103);
    const g = buildGraph(ctx.parse, ctx.verses, 'S103', 'zh', [], [], demoStudents());
    expect(g.nodes.some((n) => n.kind === 'unit')).toBe(true);
    expect(g.nodes.some((n) => n.kind === 'concept')).toBe(true);
    expect(g.nodes.filter((n) => n.kind === 'verse').length).toBe(3);
    const y = ctxFor(12);
    const gy = buildGraph(y.parse, y.verses, 'S12', 'zh', [], [], demoStudents());
    expect(gy.nodes.filter((n) => n.kind === 'verse').length).toBeLessThan(30);
    expect(gy.nodes.filter((n) => n.kind === 'unit').length).toBeGreaterThanOrEqual(10);
  });
});

describe('多媒体：经文是文字层，视频脚本现场生成（验收 11/12）', () => {
  it('卡片 HTML 含真实经文文本且 textLayer 可核验', () => {
    const ctx = ctxFor(112);
    const input = { kind: 'vocab' as const, lang: 'ar' as const, chapterName: 'الإخلاص', parse: ctx.parse, verses: ctx.verses, corpusVersion: 'V1.0' };
    const html = buildCardHtml(input);
    const layer = cardTextLayer(input);
    expect(layer.length).toBeGreaterThan(0);
    for (const t of layer) expect(html).toContain(t);
    expect(html).toContain('dir="rtl"');
  });
  it('视频脚本含镜头/旁白/字幕/经文引用与复习题', () => {
    const ctx = ctxFor(103);
    const s = buildVideoScript('vs', 'en', 'Al-Asr', ctx.parse, ctx.verses);
    expect(s.scenes.length).toBeGreaterThanOrEqual(4);
    expect(s.scenes.some((x) => x.verseRefs.length)).toBe(true);
    expect(s.reviewQuestions.length).toBe(2);
    expect(s.totalSec).toBe(s.scenes.reduce((a, x) => a + x.durationSec, 0));
  });
});

describe('Store 端到端闭环（验收 02/10）', () => {
  let dir = '';
  let store: QuranTeachingStore;
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'quran-store-'));
    store = new QuranTeachingStore({ dataDir: dir, bundledCorpusDir: CORPUS, llmReady: () => false });
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('改学生答案按这名学生那一版的选项下标判分：学生卷里打乱过选项的题，原卷下标会判错', () => {
    // 用别的章：同一个 store 里下一条用例要数第 103 章的试卷版本号
    const paper = store.generatePaper({ chapter: 112, lang: 'zh', count: 10 }).paper;
    store.simulate(paper.id);
    const original = new Map(paper.questions.map((q) => [q.id, q]));
    let checked = 0;
    for (const sid of ['stu-a', 'stu-b', 'stu-c', 'stu-d', 'stu-e']) {
      for (const q of store.questionsForStudentPinned(paper.id, sid)) {
        const base = original.get(q.id)!;
        if (typeof q.answer !== 'number' || q.answer === base.answer) continue;
        expect(store.setAnswer(paper.id, sid, q.id, q.answer).correct).toBe(true);
        expect(store.setAnswer(paper.id, sid, q.id, base.answer as number).correct).toBe(false);
        checked++;
      }
    }
    // 5 人 × 10 题里总有选项被打乱、正确答案下标变了的题，否则这条测不到东西
    expect(checked).toBeGreaterThan(0);
  });

  it('第 103 章：提纲 → 试卷 ×3 → 5 名学生 → 群体 → 强化 → 复测前后对比', async () => {
    expect(store.corpusStatus().allVerified).toBe(true);
    const plan = await store.generatePlan({ chapter: 103, from: 1, to: 3, grade: '大学', level: 'beginner', sessionsPerWeek: 1, sessionMinutes: 45, weeks: 2, lang: 'zh' });
    expect(plan.sessions.length).toBe(2);
    const p1 = store.generatePaper({ chapter: 103, lang: 'zh', count: 10 }).paper;
    const p2 = store.generatePaper({ chapter: 103, lang: 'zh', count: 10 }).paper;
    const p3 = store.generatePaper({ chapter: 103, lang: 'zh', count: 10 }).paper;
    expect(new Set([p1.signature, p2.signature, p3.signature]).size).toBe(3);
    expect(p3.version).toBe(3);
    store.simulate(p1.id);
    const analysis = store.analyze(p1.id, 'zh');
    expect(analysis.students.length).toBe(5);
    const issue = analysis.group.issues[0];
    expect(issue).toBeTruthy();
    const rf = store.reinforce(p1.id, issue.key, 'zh');
    expect(rf.practice.questions.length).toBeGreaterThanOrEqual(3);
    expect(rf.retest.questions.length).toBeGreaterThanOrEqual(3);
    // 复测题与原卷题 id / 题面（题干 + 选项）都不重复
    expect(rf.retest.questions.filter((q) => p1.questions.some((b) => b.id === q.id || questionFace(b) === questionFace(q)))).toEqual([]);
    expect(rf.cards.length).toBeGreaterThan(0);
    expect(rf.explanation).toBeTruthy();
    const done = store.retest(rf.id, 'zh');
    expect(done.after).toBeTruthy();
    expect(done.after!.students.length).toBe(5);
    // 改一个答案 → 群体重算
    // 改答案要按这名学生那一版（选项可能被打乱）的下标，拿原卷下标会把「改错」误判成答对
    const q = store.questionsForStudentPinned(p1.id, 'stu-a')[0];
    const before = store.analyze(p1.id, 'zh').students.find((s) => s.studentId === 'stu-a')!.total.correct;
    store.setAnswer(p1.id, 'stu-a', q.id, typeof q.answer === 'number' ? (q.answer + 1) % q.options.length : []);
    const after = store.analyze(p1.id, 'zh').students.find((s) => s.studentId === 'stu-a')!.total.correct;
    expect(after).toBeLessThanOrEqual(before);
    expect(store.dashboard('zh').students.length).toBe(5);
    // 教师控制：删题 / 重生成
    const edited = store.updateQuestion(p2.id, p2.questions[0].id, { stem: '教师改写的题干', reviewStatus: 'confirmed' });
    expect(edited.questions[0].stem).toBe('教师改写的题干');
    expect(edited.questions[0].options).toEqual(p2.questions[0].options);
    const oldId = p2.questions[1].id;
    const regen = store.regenerateQuestion(p2.id, oldId);
    expect(regen.questions[1].id).not.toBe(oldId);
    const countBefore = regen.questions.length;
    const removed = store.updateQuestion(p2.id, regen.questions[2].id, { remove: true });
    expect(removed.questions.length).toBe(countBefore - 1);
  });

  it('受限问答：中文整句 / 阿文整句能命中批准资料，超范围明确提示不足', async () => {
    expect(queryTerms('坚忍在这一章里指什么？', 'zh')).toContain('坚忍');
    expect(queryTerms('ما معنى الصبر في هذه السورة؟', 'ar')).toContain('الصبر');
    const r = await store.studentAsk('量子力学与相对论的关系是什么', 103, 1, 3, 'zh');
    expect(r.insufficient).toBe(true);
    const zh = await store.studentAsk('坚忍在这一章里指什么？', 103, 1, 3, 'zh');
    expect(zh.insufficient).toBe(false);
    expect(zh.sources.length).toBeGreaterThan(0);
    const ar = await store.studentAsk('ما معنى الصبر في هذه السورة؟', 103, 1, 3, 'ar');
    expect(ar.insufficient).toBe(false);
    const en = await store.studentAsk('What does patience mean in this chapter?', 103, 1, 3, 'en');
    expect(en.insufficient).toBe(false);
  });
});
