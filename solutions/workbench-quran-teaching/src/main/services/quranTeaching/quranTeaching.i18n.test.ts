/**
 * 古兰经教学演示 · 生成内容按语言产出（英文 / 阿语界面不许冒中文）。
 *
 * 用户在英文界面第 3 步看到整块中文：学习目标、课程适配说明、单课分段名、课名全是中文。
 * 根因有两类：界面没把「内容语言」跟上界面语言（渲染层修），以及模板数据里有只写了中文的字段
 * （批准资料来源、审核人、事件人物）被原样塞进英文 / 阿语产物。这里把整条演示闭环在 en / ar 下
 * 各跑一遍，逐字段深扫：任何一个字符串带汉字就红，并指出字段路径。
 * 经文原文是阿拉伯文，不受影响；模型润色不参与（llmReady=false，只测模板骨架）。
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { containsHanText } from '@totalclaw/i18n';
import type { QuranLang } from '@totalclaw/ipc-contracts';
import { buildCardHtml, buildVideoScript, cardTextLayer } from './media';
import { approvedMaterials } from './approved';
import { QuranTeachingStore } from './store';

const CORPUS = join(__dirname, '..', '..', '..', '..', '..', '..', 'resources', 'quran-demo-corpus');

/** 结构里所有带汉字的字符串 → 字段路径（id / 路径 / 签名之类的机器字段不看） */
function hanLeaks(value: unknown, path = '$', out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (containsHanText(value)) out.push(`${path} = ${value.slice(0, 80)}`);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => hanLeaks(v, `${path}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (['id', 'path', 'url', 'signature', 'sha256', 'file', 'code'].includes(k)) continue;
      // 三语对象只看本语言那一格（zh 那格本来就该是中文）
      if (k === 'zh' && 'en' in (value as object) && 'ar' in (value as object)) continue;
      hanLeaks(v, `${path}.${k}`, out);
    }
  }
  return out;
}

describe.each<QuranLang>(['en', 'ar'])('生成内容不含中文（%s）', (lang) => {
  let dir = '';
  let store: QuranTeachingStore;
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), `quran-i18n-${lang}-`));
    store = new QuranTeachingStore({ dataDir: dir, bundledCorpusDir: CORPUS, llmReady: () => false });
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('提纲与课程：目标、适配说明、课名、分段名与活动、复习 / 测试目标', async () => {
    for (const [chapter, from, to] of [[103, 1, 3], [12, 1, 30], [49, 1, 18]] as const) {
      for (const level of ['beginner', 'intermediate', 'advanced'] as const) {
        const plan = await store.generatePlan({ chapter, from, to, grade: 'Year 1 university', level, sessionsPerWeek: 2, sessionMinutes: 45, weeks: 2, lang });
        expect(hanLeaks(plan)).toEqual([]);
      }
    }
  });

  it('结构解析、理解图、试卷、分析、强化与复测、看板', () => {
    for (const chapter of [103, 12, 1, 49]) {
      const parse = store.parse(chapter);
      // 三语结构里 en / ar 两格不许留中文（事件人物也要三语）
      expect(hanLeaks(parse)).toEqual([]);
      expect(hanLeaks(store.graph(chapter, undefined, undefined, lang))).toEqual([]);
      for (const kind of ['practice', 'exam'] as const) {
        const { paper } = store.generatePaper({ chapter, lang, count: 20, kind });
        expect(hanLeaks(paper)).toEqual([]);
        store.simulate(paper.id);
        const analysis = store.analyze(paper.id, lang);
        expect(hanLeaks(analysis)).toEqual([]);
        for (const issue of analysis.group.issues.slice(0, 3)) {
          const rf = store.reinforce(paper.id, issue.key, lang);
          expect(hanLeaks(rf)).toEqual([]);
          expect(hanLeaks(store.retest(rf.id, lang))).toEqual([]);
        }
      }
    }
    expect(hanLeaks(store.dashboard(lang))).toEqual([]);
  });

  it('中文界面出过的卷 / 强化，切到本语言后看板也不冒中文（概念标签按看板语言重取）', () => {
    const { paper } = store.generatePaper({ chapter: 103, lang: 'zh', count: 12 });
    store.simulate(paper.id);
    const issue = store.analyze(paper.id, 'zh').group.issues[0];
    if (issue) store.reinforce(paper.id, issue.key, 'zh');
    const board = store.dashboard(lang);
    expect(hanLeaks({ commonIssues: board.commonIssues, improvement: board.improvement, students: board.students })).toEqual([]);
  });

  it('批准资料来源 / 审核人按语言给出', () => {
    for (const m of approvedMaterials()) {
      expect(containsHanText(m.source[lang]), m.id).toBe(false);
      expect(containsHanText(m.reviewedBy[lang]), m.id).toBe(false);
    }
  });

  it('知识卡片与视频脚本', () => {
    for (const chapter of [103, 12]) {
      const parse = store.parse(chapter);
      const verses = store.verses(chapter, parse.from, parse.to);
      const chapterName = store.chapterLabel(chapter, lang);
      for (const kind of ['vocab', 'concept_map', 'timeline', 'review', 'structure'] as const) {
        const input = { kind, lang, chapterName, parse, verses, corpusVersion: 'V1.0' };
        expect(hanLeaks(cardTextLayer(input))).toEqual([]);
        // 卡片 HTML 里的可见文字（去标签后）
        const text = buildCardHtml(input).replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
        expect(containsHanText(text), `${kind}: ${text.replace(/\s+/g, ' ').slice(0, 200)}`).toBe(false);
      }
      expect(hanLeaks(buildVideoScript('vs', lang, chapterName, parse, verses))).toEqual([]);
    }
  });
});
