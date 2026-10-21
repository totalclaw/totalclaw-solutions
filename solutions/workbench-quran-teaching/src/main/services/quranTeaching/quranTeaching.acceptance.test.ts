/**
 * 古兰经教学演示 · 最终验收（2026-09-18）回归：
 *   - 模板拼接的重复标点（「并列。。」「sequence..」）
 *   - 节范围写法（单节「103:1」，范围「103:1–3」，不再出现「3-3」「103:1-1」）
 *   - 同一道题不重复出；复测卷不与原卷同题；前后对比同一口径（只比两卷都考到的知识点）
 *   - 中文原卷在英文 / 阿语下做强化，概念名按该语言；旧存档里夹中文的英文 / 阿语生成内容丢弃重生
 *   - 学生端问答：检索到资料就一定给出回答（英文 patience / patient 同词干命中）
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { QuranPaper } from '@totalclaw/ipc-contracts';
import { questionFace, questionIdentity, tidyPunctuation , buildVariants, variantQuestions, questionsForStudent} from './quiz';
import { rangeLabel } from './textUtils';
import { QuranTeachingStore, queryTerms } from './store';

const CORPUS = join(__dirname, '..', '..', '..', '..', '..', '..', 'resources', 'quran-demo-corpus');
const HAN = /[㐀-鿿]/;

describe('文案拼接与范围写法', () => {
  it('插值自带句末标点时不再叠一个句号；空插值留下的冒号收掉；省略号不动', () => {
    expect(tidyPunctuation('四个条件依次并列。。学习路径')).toBe('四个条件依次并列。学习路径');
    expect(tidyPunctuation('in sequence.. Path')).toBe('in sequence. Path');
    expect(tidyPunctuation('对应 103:3：。学习')).toBe('对应 103:3。学习');
    expect(tidyPunctuation('Wait... then')).toBe('Wait... then');
    expect(tidyPunctuation('见 103:3.')).toBe('见 103:3.');
  });
  it('单节只写一个数，范围用 en dash', () => {
    expect(rangeLabel(3, 3)).toBe('3');
    expect(rangeLabel(1, 1, 103)).toBe('103:1');
    expect(rangeLabel(1, 3, 103)).toBe('103:1–3');
  });
});

describe('Store：强化 / 复测 / 语言', () => {
  let dir = '';
  let store: QuranTeachingStore;
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'quran-accept-'));
    store = new QuranTeachingStore({ dataDir: dir, bundledCorpusDir: CORPUS, llmReady: () => false });
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('强化解释（第 103 章概念）不再出现「。。」/「..」，单元与课程表范围不写成「3-3」「103:1-1」', async () => {
    const zh = store.generatePaper({ chapter: 103, lang: 'zh', count: 10 }).paper;
    store.simulate(zh.id);
    for (const lang of ['zh', 'en', 'ar'] as const) {
      const concept = store.analyze(zh.id, lang).group.issues.find((i) => i.kind === 'concept');
      if (!concept) continue;
      const rf = store.reinforce(zh.id, concept.key, lang);
      expect(rf.explanation).not.toMatch(/。。|(?<!\.)\.\.(?!\.)/);
    }
    const parse = store.parse(103, 1, 3);
    for (const u of parse.units) for (const t of Object.values(u.title)) expect(t).not.toMatch(/(\d+)-\1(?!\d)/);
    const plan = await store.generatePlan({ chapter: 103, from: 1, to: 3, grade: '大学一年级', level: 'beginner', sessionsPerWeek: 2, sessionMinutes: 45, weeks: 2, lang: 'zh' });
    expect(`${plan.overview}${plan.adaptation}${plan.objectives.join('')}`).not.toMatch(/\d+-\d+/);
  });

  it('范围够大时同一张卷里没有「同一道题」；复测卷与原卷不同题；前后对比只比两卷共同的知识点', () => {
    const base = store.generatePaper({ chapter: 49, from: 1, to: 18, lang: 'zh', count: 10 }).paper;
    const ids = base.questions.map(questionIdentity);
    expect(new Set(ids).size).toBe(ids.length);
    store.simulate(base.id);
    const issues = store.analyze(base.id, 'zh').group.issues.slice(0, 3);
    expect(issues.length).toBeGreaterThan(0);
    for (const issue of issues) {
      const rf = store.reinforce(base.id, issue.key, 'zh');
      const retestIds = rf.retest.questions.map(questionIdentity);
      expect(new Set(retestIds).size).toBe(retestIds.length);
      expect(retestIds.filter((x) => ids.includes(x))).toEqual([]);
      const done = store.retest(rf.id, 'zh');
      const c = done.compare!;
      expect(c).toBeTruthy();
      expect(c.target.studentCount).toBe(5);
      expect(c.common.before).toBeLessThanOrEqual(c.keys.length);
      expect(c.common.after).toBeLessThanOrEqual(c.keys.length);
      // 学生正确率的分母只算共同知识点的题：原卷里这些知识点的题数对每名学生都一样
      const inScope = (p: QuranPaper): number => p.questions.filter((q) => c.keys.includes(q.conceptId || (q.dimension === 'vocabulary' && q.materialIds[0]) || q.sourceRefs[0])).length;
      for (const s of c.students) {
        expect(s.before.total).toBe(inScope(base));
        expect(s.after.total).toBe(inScope(done.retest));
      }
    }
  });

  it('第 103 章（3 节，演示用）反复强化：练习与复测各 ≥3 道，题面（题干 + 选项）卷内不重复、互不重复、不与原卷相同', () => {
    for (let t = 0; t < 25; t += 1) {
      const base = store.generatePaper({ chapter: 103, from: 1, to: 3, lang: 'zh', count: 10 }).paper;
      store.simulate(base.id);
      for (const issue of store.analyze(base.id, 'zh').group.issues.slice(0, 3)) {
        const rf = store.reinforce(base.id, issue.key, 'zh');
        const tag = `${issue.kind}:${issue.key}`;
        expect(rf.practice.questions.length, tag).toBeGreaterThanOrEqual(3);
        expect(rf.retest.questions.length, tag).toBeGreaterThanOrEqual(3);
        for (const p of [rf.practice, rf.retest]) expect(new Set(p.questions.map(questionFace)).size, tag).toBe(p.questions.length);
        const baseFaces = new Set(base.questions.map(questionFace));
        const baseIds = new Set(base.questions.map((q) => q.id));
        for (const q of [...rf.practice.questions, ...rf.retest.questions]) {
          expect(baseFaces.has(questionFace(q)), `${tag} ${q.stem}`).toBe(false);
          expect(baseIds.has(q.id), tag).toBe(false);
        }
        const practiceFaces = new Set(rf.practice.questions.map(questionFace));
        expect(rf.retest.questions.filter((q) => practiceFaces.has(questionFace(q))), tag).toEqual([]);
      }
    }
  });

  it('中文原卷在英文 / 阿语下做强化：目标名、解释、练习卷标题都按该语言（不冒中文）', () => {
    const zh = store.generatePaper({ chapter: 103, lang: 'zh', count: 12 }).paper;
    store.simulate(zh.id);
    const concept = store.analyze(zh.id, 'en').group.issues.find((i) => i.kind === 'concept');
    expect(concept).toBeTruthy();
    for (const lang of ['en', 'ar'] as const) {
      const rf = store.reinforce(zh.id, concept!.key, lang);
      expect(rf.targetLabel).not.toMatch(HAN);
      expect(rf.explanation).not.toMatch(HAN);
      expect(rf.practice.title).not.toMatch(HAN);
    }
  });
});

describe('旧存档：夹中文的英文 / 阿语生成内容', () => {
  it('启动时丢弃（连同答题记录），中文卷与正常英文卷保留', () => {
    const dir = mkdtempSync(join(tmpdir(), 'quran-stale-'));
    try {
      const seed = new QuranTeachingStore({ dataDir: dir, bundledCorpusDir: CORPUS, llmReady: () => false });
      const zh = seed.generatePaper({ chapter: 103, lang: 'zh', count: 6 }).paper;
      const en = seed.generatePaper({ chapter: 103, lang: 'en', count: 6 }).paper;
      const ar = seed.generatePaper({ chapter: 103, lang: 'ar', count: 6 }).paper;
      seed.simulate(ar.id);
      const state = (seed as any).state;
      const stale = state.papers.find((p: QuranPaper) => p.id === ar.id);
      stale.questions[0].explanation = '(演示批准词表 V1.0（教师基础词义笔记）)';
      mkdirSync(join(dir, 'quran-teaching'), { recursive: true });
      writeFileSync(join(dir, 'quran-teaching', 'state.json'), JSON.stringify(state));
      const reopened = new QuranTeachingStore({ dataDir: dir, bundledCorpusDir: CORPUS, llmReady: () => false });
      const ids = reopened.papers().map((p) => p.id);
      expect(ids).toContain(zh.id);
      expect(ids).toContain(en.id);
      expect(ids).not.toContain(ar.id);
      expect(reopened.records(ar.id)).toEqual([]);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('学生端问答（英文）', () => {
  it('patience / patient 同词干；「surah」不当检索词', () => {
    const a = queryTerms('What does patience mean in this surah?', 'en');
    const b = queryTerms('Why should one be patient?', 'en');
    expect(a).not.toContain('surah');
    expect(a.some((t) => b.includes(t))).toBe(true);
  });
  it('检索到批准资料就给出回答：模型回 INSUFFICIENT 时用资料原文作答，不再一边列来源一边说超出范围', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'quran-ask-'));
    try {
      const store = new QuranTeachingStore({ dataDir: dir, bundledCorpusDir: CORPUS, llmReady: () => true, llm: async () => 'INSUFFICIENT' });
      const r = await store.studentAsk('What does patience mean in this surah?', 103, 1, 3, 'en');
      expect(r.sources.length).toBeGreaterThan(0);
      expect(r.insufficient).toBe(false);
      expect(r.answer.toLowerCase()).toContain('patience');
      const none = await store.studentAsk('What is quantum gravity?', 103, 1, 3, 'en');
      expect(none.insufficient).toBe(true);
      expect(none.sources).toEqual([]);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

/**
 * 说明书 11.2 第 2 条：5 名学生的试卷不得全部完全相同。
 *
 * 之前是把同一份卷发给 5 个人，学生端"每人版本不同"只是文案。现在按学生生成变体
 * （题序 + 选项顺序），题面不动 —— 经文是锁定源数据，不在这一层做任何"换个说法"。
 */
describe('每名学生一版试卷（说明书 11.2）', () => {
  const paper: QuranPaper = {
    id: 'p-variant', title: 'T', kind: 'practice' as const, chapter: 103, from: 1, to: 3,
    version: 1, seed: 'seed-x', lang: 'zh' as const, signature: '', createdAt: 0,
    questions: Array.from({ length: 8 }, (_, i) => ({
      id: `q${i + 1}`, type: 'mcq' as const, difficulty: 1 as const, dimension: 'memory' as const,
      stem: `题 ${i + 1}`, options: ['A', 'B', 'C', 'D'], answer: i % 4,
      sourceRefs: ['103:1'], materialIds: [], explanation: '', verified: true, verifyNote: '',
      reviewStatus: 'draft' as const, aiGenerated: true as const, generator: 'template' as const, phrasing: 0,
    })),
  };
  const ids = ['stu-a', 'stu-b', 'stu-c', 'stu-d', 'stu-e'];

  it('5 份变体的指纹不全相同，且题目集合与原卷完全一致（不多不少不改题面）', () => {
    const variants = buildVariants(paper, ids, 'sim');
    expect(new Set(variants.map((v) => v.signature)).size).toBeGreaterThan(1);
    for (const v of variants) {
      const qs = variantQuestions(paper, v);
      expect(qs.length).toBe(paper.questions.length);
      expect([...qs.map((q) => q.id)].sort()).toEqual([...paper.questions.map((q) => q.id)].sort());
      // 题面逐字不变
      for (const q of qs) expect(q.stem).toBe(paper.questions.find((x) => x.id === q.id)!.stem);
    }
  });

  it('选项重排后正确答案下标同步换算：变体里的正确选项文本仍是原卷的正确选项文本', () => {
    for (const v of buildVariants(paper, ids, 'sim')) {
      for (const q of variantQuestions(paper, v)) {
        const orig = paper.questions.find((x) => x.id === q.id)!;
        expect(q.options[q.answer as number]).toBe(orig.options[orig.answer as number]);
      }
    }
  });

  it('同一种子可复现；换种子会得到不同的分发', () => {
    expect(buildVariants(paper, ids, 'sim').map((v) => v.signature))
      .toEqual(buildVariants(paper, ids, 'sim').map((v) => v.signature));
    expect(buildVariants(paper, ids, 'sim2').map((v) => v.signature))
      .not.toEqual(buildVariants(paper, ids, 'sim').map((v) => v.signature));
  });

  it('排序题与匹配题不打乱选项（打乱等于改题意）', () => {
    const p2 = { ...paper, questions: [
      { ...paper.questions[0], id: 'qo', type: 'order' as const, options: ['一', '二', '三'], answer: [0, 1, 2] },
      { ...paper.questions[1], id: 'qm', type: 'match' as const, options: ['x', 'y'], left: ['甲', '乙'], answer: [0, 1] },
    ] };
    for (const v of buildVariants(p2, ids, 'sim')) {
      expect(v.optionOrder.qo).toEqual([0, 1, 2]);
      expect(v.optionOrder.qm).toEqual([0, 1]);
    }
  });

  it('没有变体的旧存档退回原卷，口径不变', () => {
    expect(questionsForStudent(paper, 'stu-a')).toBe(paper.questions);
  });
});
