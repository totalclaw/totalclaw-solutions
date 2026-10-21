/**
 * 教案生成后切换语言（2026-08-23 用户需求：「生成了之后的教案需要支持语言切换」）。
 *
 * 钉三件事：
 *   1. 切到没有的语言 → 后台按同参数（年级/时长/模式）生成，完成后顶层内容换成目标语言，原语言存进 variants；
 *   2. 切回已有语言 → 不再调模型，秒切；
 *   3. 生成失败 → 顶层内容纹丝不动（已发布的学生端不受影响），只标 langStatus='failed'。
 * mock 掉 accountScope（落临时目录）与 agentPython（不触 electron）。
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const TMP = path.join(os.tmpdir(), 'eduhub-lang-' + process.pid);

vi.mock('./accountScope', () => ({
  accountPath: (...sub: string[]) => path.join(TMP, ...sub),
  onAccountKeyChange: () => {},
}));
vi.mock('./agentPython', () => ({ resolveAgentPython: () => ({ python: 'python3', env: {} }) }));

import { EduHubStore } from './eduHubStore';

const LID = 'L1';

function seed() {
  const root = path.join(TMP, 'edu-hub');
  for (const d of ['materials', 'gen-cache', 'media']) fs.mkdirSync(path.join(root, d), { recursive: true });
  fs.writeFileSync(path.join(root, 'config.json'), JSON.stringify({ classCode: 'ABC123' }));
  fs.writeFileSync(path.join(root, 'materials.json'), JSON.stringify([{ id: 'M1', name: 'Doc', status: 'ready', pages: 1, importedAt: Date.now() }]));
  fs.writeFileSync(path.join(root, 'materials', 'M1.pages.json'), JSON.stringify([{ page: 1, text: '水的三态变化：固态、液态、气态。' }]));
  fs.writeFileSync(path.join(root, 'lessons.json'), JSON.stringify([{
    id: LID, materialId: 'M1', materialName: 'Doc', status: 'published', lang: 'zh-CN', mode: 'fast', grade: '初中', durationMinutes: 45,
    plan: { title: '水的三态', grade: '初中', durationMinutes: 45, objectives: ['认识三态'], keyPoints: [], difficulties: [], schedule: [], boardNotes: [], homework: '' },
    knowledgeMap: { center: '水', branches: [] },
    sections: [{ title: '固态', intro: '冰', bullets: ['0°C 以下'], sourcePages: [1] }],
    studentDigest: [], quiz: [{ q: '冰是什么态', options: ['固', '液', '气', '等离子'], answer: 0, explain: 'x', sourcePage: 1 }],
    lessonHtml: '<h1>水的三态</h1>', publishedAt: Date.now(),
  }]));
  fs.writeFileSync(path.join(root, 'students.json'), '[]');
  fs.writeFileSync(path.join(root, 'submissions.json'), '[]');
}

/** 模型桩：按 prompt 里的目标语言给一份合法输出（英文 / 阿语） */
function llmStub(fail = false) {
  return async (prompt: string): Promise<string> => {
    if (fail) throw new Error('model down');
    const en = /English|en-US/i.test(prompt) && !/Arabic|العربية|\bar\b/.test(prompt);
    const title = en ? 'Three States of Water' : 'حالات الماء الثلاث';
    const meta = {
      plan: { title, objectives: [en ? 'Know the three states' : 'معرفة الحالات الثلاث'], keyPoints: [], difficulties: [], schedule: [], boardNotes: [], homework: '' },
      sections: [{ title: en ? 'Solid' : 'صلب', intro: en ? 'Ice' : 'جليد', bullets: [en ? 'below 0°C' : 'تحت 0°C'], sourcePages: [1] }],
      quiz: [{ q: en ? 'Ice is?' : 'الجليد هو؟', options: ['A', 'B', 'C', 'D'], answer: 0, explain: 'x', sourcePage: 1 }],
    };
    return `### LESSON_META ###\n${JSON.stringify(meta)}\n### LESSON_HTML ###\n<h1>${title}</h1>${'<p>section body text. </p>'.repeat(12)}\n### END ###`;
  };
}

async function waitLang(store: EduHubStore, id: string, timeoutMs = 5000): Promise<void> {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    if (store.getLesson(id)?.langStatus !== 'switching') return;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error('语言切换超时');
}

beforeAll(() => { seed(); });
afterAll(() => { fs.rmSync(TMP, { recursive: true, force: true }); });

describe('教案语言切换', () => {
  it('切到英文：后台生成 → 顶层换成英文，中文存进 variants；切回中文秒切不调模型', async () => {
    let calls = 0;
    const stub = llmStub();
    const store = new EduHubStore({ llm: async (p: string) => { calls += 1; return stub(p); } });
    const first = store.switchLessonLang(LID, 'en-US');
    expect(first.langStatus).toBe('switching');
    expect(first.lang).toBe('zh-CN');               // 切换期间顶层仍是中文（学生端不抖动）
    expect(first.plan?.title).toBe('水的三态');
    await waitLang(store, LID);
    const after = store.getLesson(LID)!;
    expect(after.langStatus).toBeUndefined();
    expect(after.lang).toBe('en-US');
    expect(after.plan?.title).toBe('Three States of Water');
    expect(after.lessonHtml).toContain('Three States of Water');
    expect(after.status).toBe('published');          // 发布态不受影响
    expect(after.variants?.['zh-CN']?.plan?.title).toBe('水的三态');
    expect(after.variants?.['en-US']?.plan?.title).toBe('Three States of Water');
    expect(calls).toBe(1);
    // 切回中文：已有版本，秒切且不再调模型
    const back = store.switchLessonLang(LID, 'zh-CN');
    expect(back.langStatus).toBeUndefined();
    expect(back.lang).toBe('zh-CN');
    expect(back.plan?.title).toBe('水的三态');
    expect(calls).toBe(1);
    // 再切英文：同样命中缓存
    const again = store.switchLessonLang(LID, 'en-US');
    expect(again.plan?.title).toBe('Three States of Water');
    expect(calls).toBe(1);
  });

  it('生成失败：顶层内容不动，只标 langStatus=failed 与原因', async () => {
    const store = new EduHubStore({ llm: llmStub(true) });
    const before = store.getLesson(LID)!;
    const lang0 = before.lang;
    const title0 = before.plan?.title;
    store.switchLessonLang(LID, 'ar');
    await waitLang(store, LID);
    const after = store.getLesson(LID)!;
    expect(after.langStatus).toBe('failed');
    expect(after.langError).toContain('model down');
    expect(after.lang).toBe(lang0);
    expect(after.plan?.title).toBe(title0);
    expect(after.variants?.ar).toBeUndefined();
  });

  it('生成中的教案不允许切语言', () => {
    const root = path.join(TMP, 'edu-hub');
    const lessons = JSON.parse(fs.readFileSync(path.join(root, 'lessons.json'), 'utf-8'));
    lessons.push({ id: 'L2', materialId: 'M1', materialName: 'Doc', status: 'generating', plan: null, studentDigest: [], quiz: [] });
    fs.writeFileSync(path.join(root, 'lessons.json'), JSON.stringify(lessons));
    const store = new EduHubStore({ llm: llmStub() });
    expect(() => store.switchLessonLang('L2', 'en-US')).toThrow();
  });
});

describe('审查回归：切换期间的编辑 / 数字人状态随语言', () => {
  it('F · 切换期间保存被拒绝；切换前后的编辑通过深拷贝完整保留（zh 改标题 → en → zh 仍是改过的）', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    const stub = llmStub();
    const store = new EduHubStore({ llm: async (p: string) => { await gate; return stub(p); } });
    // 先把 L1 恢复成中文（上一组用例可能停在英文）
    const cur = store.getLesson(LID)!;
    if (cur.lang !== 'zh-CN') store.switchLessonLang(LID, 'zh-CN');
    store.saveLesson(LID, { plan: { ...store.getLesson(LID)!.plan!, title: '改过的标题' } });
    expect(store.getLesson(LID)!.plan!.title).toBe('改过的标题');
    store.switchLessonLang(LID, 'ar');
    expect(() => store.saveLesson(LID, { plan: { ...store.getLesson(LID)!.plan!, title: '切换中改' } })).toThrow(/切换/);
    release();
    await waitLang(store, LID);
    expect(store.getLesson(LID)!.lang).toBe('ar');
    expect(store.getLesson(LID)!.plan!.title).toBe('حالات الماء الثلاث');
    // 在阿语版上改标题，再切回中文：中文标题仍是"改过的标题"，阿语版记住自己的改动
    store.saveLesson(LID, { plan: { ...store.getLesson(LID)!.plan!, title: 'عنوان معدل' } });
    store.switchLessonLang(LID, 'zh-CN');
    expect(store.getLesson(LID)!.plan!.title).toBe('改过的标题');
    store.switchLessonLang(LID, 'ar');
    expect(store.getLesson(LID)!.plan!.title).toBe('عنوان معدل');
  });

  it('#7 · avatarStatus 跟随语言版本；音频/成片文件按语言分开', async () => {
    const store = new EduHubStore({ llm: llmStub() });
    store.switchLessonLang(LID, 'zh-CN');
    const l = store.getLesson(LID)!;
    l.avatarStatus = 'ready';
    (l.sections || []).forEach((s: any) => { s.avatarReady = true; });
    // 中文版有成片文件（历史命名不带后缀）
    const root = path.join(TMP, 'edu-hub', 'media');
    fs.writeFileSync(path.join(root, `${LID}-0.mp4`), 'zh');
    fs.writeFileSync(path.join(root, `${LID}-audio.mp3`), 'zh');
    store.switchLessonLang(LID, 'en-US');
    await waitLang(store, LID);
    const en = store.getLesson(LID)!;
    expect(en.lang).toBe('en-US');
    expect(en.avatarStatus).toBeUndefined();
    expect(store.avatarVideoPath(LID, 0)).toBeNull();      // 英文版没有自己的成片，不能播中文的
    expect(store.audioPath(LID)).toBeNull();
    store.switchLessonLang(LID, 'zh-CN');
    expect(store.getLesson(LID)!.avatarStatus).toBe('ready');
    expect(store.avatarVideoPath(LID, 0)).toContain(`${LID}-0.mp4`);
    expect(store.audioPath(LID)).toContain(`${LID}-audio.mp3`);
  });
});
