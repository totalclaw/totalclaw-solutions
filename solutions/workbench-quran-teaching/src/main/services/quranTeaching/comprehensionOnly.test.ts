/**
 * 古兰经教学 · 只考理解，不考原文。
 *
 * 这条线的学生大多还不识阿拉伯语原文。考「认经文 / 接下一节 / 填原文词 / 排词序节序」
 * 等于考会不会背：诊断不出任何理解上的薄弱点，后面的强化教学也就无从下手。
 * 所以出题**缺省**就只出理解向的题，要原文题得显式传 `audience: 'full'`。
 *
 * 另外钉一条模板形状：`fill()` 按 `tpl[0]/[1]/[2]` 取三语，模板必须是三元组。
 * 写成 `{zh,en,ar}` 对象时 `tpl[0]` 是 undefined，`.replace` 当场抛 —— 而且只在
 * 那个生成器**恰好被抽中**时才炸（unitTheme 还要求单元数 ≥3），
 * 平时跑十次有九次碰不到，混过了类型检查也混过了大部分用例。
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('../../util/quitRegistry', () => ({ onAppWillQuit: () => {} }));

import { QuranTeachingStore } from './store';
import templates from './quizTemplates.json';

const CORPUS = join(__dirname, '..', '..', '..', '..', '..', '..', 'resources', 'quran-demo-corpus');
/** 需要先会读原文才能答的两个维度 */
const VERBATIM_DIMS = new Set(['memory', 'order']);

let dir = '';
let store: QuranTeachingStore;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'quran-comp-'));
  store = new QuranTeachingStore({ dataDir: dir, bundledCorpusDir: CORPUS, llmReady: () => false });
});
afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

describe('出题缺省只考理解', () => {
  // 语料包里的十章都过一遍：小章（3 节）与长段（优素福 19 节）的题源差别很大
  const CASES: Array<{ ch: number; from?: number; to?: number; label: string }> = [
    { ch: 103, label: '时光章' },
    { ch: 12, from: 65, to: 83, label: '优素福章 65-83' },
    { ch: 1, label: '开端章' },
    { ch: 112, label: '忠诚章' },
    { ch: 49, label: '寝室章' },
    { ch: 67, label: '国权章' },
    { ch: 55, label: '至仁主章' },
    { ch: 113, label: '曙光章' },
    { ch: 114, label: '世人章' },
    { ch: 108, label: '多福章' },
  ];

  it.each(CASES)('$label：出得满 12 题，且一道原文题都没有', ({ ch, from, to }) => {
    for (const level of ['beginner', 'advanced'] as const) {
      const { paper } = store.generatePaper({ chapter: ch, from, to, lang: 'zh', count: 12, level });
      expect(paper.questions.length).toBe(12);          // 题源够不够：缩小题型池之后还能出满
      const verbatim = paper.questions.filter((q) => VERBATIM_DIMS.has(q.dimension));
      expect(verbatim.map((q) => q.stem)).toEqual([]);  // 断言带上题干，红的时候一眼看出是哪道
      // 逐字比对型的证据（认经文 / 填词）也不该出现
      expect(paper.questions.some((q) => (q as any).proof?.kind === 'verbatim')).toBe(false);
    }
  });

  it('显式要 full 时原文题回来（学术 / 诵读场景仍然要）', () => {
    // 随机种子决定题型分布，单张卷子可能恰好没抽到原文题 —— 多出几张看总体
    let verbatim = 0;
    for (let i = 0; i < 6; i += 1) {
      const { paper } = store.generatePaper({ chapter: 12, from: 65, to: 83, lang: 'zh', count: 12, audience: 'full' });
      verbatim += paper.questions.filter((q) => VERBATIM_DIMS.has(q.dimension)).length;
    }
    expect(verbatim).toBeGreaterThan(0);
  });
});

describe('模板形状', () => {
  it('每条题干模板都是 [zh, en, ar] 三元组（写成对象会让 fill() 当场抛）', () => {
    const t = templates as unknown as Record<string, unknown>;
    const bad: string[] = [];
    const checkTri = (path: string, v: unknown): void => {
      if (!Array.isArray(v) || v.length !== 3 || !v.every((x) => typeof x === 'string' && x)) bad.push(path);
    };
    for (const [key, val] of Object.entries(t)) {
      // 三种形状都合法：单条三元组（eventLabel）、一组措辞（unitTheme）、按子键分组（explain）
      if (Array.isArray(val) && val.every((x) => typeof x === 'string')) checkTri(key, val);
      else if (Array.isArray(val)) val.forEach((entry, i) => checkTri(`${key}[${i}]`, entry));
      else if (val && typeof val === 'object') {
        for (const [k2, v2] of Object.entries(val as Record<string, unknown>)) checkTri(`${key}.${k2}`, v2);
      } else bad.push(key);
    }
    expect(bad).toEqual([]);
  });
});
