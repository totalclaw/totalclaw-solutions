/**
 * 古兰经教师端九步状态（最终验收 P1）：
 *   ① 切到学生端 / 管理层再切回（TeacherFlow 卸载重建），进度不能归零；
 *   ② 刷新 / 切界面语言整页重载后，步骤状态、当前范围从本机存档恢复，确定性内容（结构识别 / 分析）取回来，
 *      学生端据此显示「本课单元与词汇」；数据已经不在的步骤回到待做；
 * 另含：时刻按界面语言、节范围写法、默认年级旧译法按界面 / 内容语言换写。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

const KEY = 'qt-teacher-steps-v1';
type Shared = typeof import('./shared');

function mockApi(overrides: Record<string, unknown> = {}): Record<string, ReturnType<typeof vi.fn>> {
  const api = {
    parse: vi.fn(async () => ({ chapter: 103, from: 1, to: 3, units: [{ id: 'u1' }], concepts: [], vocabulary: [] })),
    graph: vi.fn(async () => ({ nodes: [{ id: 'n' }], edges: [] })),
    analyze: vi.fn(async () => ({ records: [{ paperId: 'paper-1', studentId: 'stu-a' }], analysis: { paperId: 'paper-1', students: [], group: { issues: [], commonCount: 0 } } })),
    ...overrides,
  } as Record<string, ReturnType<typeof vi.fn>>;
  (window as any).electronAPI = { workbenches: { quranTeaching: api } };
  return api;
}
async function load(): Promise<Shared> {
  vi.resetModules();
  return import('./shared');
}
const status = (over: Record<string, unknown> = {}) => ({
  plans: [{ request: { chapter: 103, from: 1, to: 3, lang: 'zh' } }],
  papers: [{ id: 'paper-1', kind: 'practice', chapter: 103, from: 1, to: 3, lang: 'zh', questions: [] }],
  reinforcements: [], cards: [], scripts: [], videos: [], students: [], corpus: { allVerified: true, chapters: [] },
  ...over,
});

beforeEach(() => { localStorage.clear(); mockApi(); });
afterEach(() => { localStorage.clear(); delete (window as any).electronAPI; });

describe('九步状态跨组件保留', () => {
  it('teacherSteps() 是单例：组件重建后拿到的是同一份，完成的步骤不会变回待做', async () => {
    const s = await load();
    const a = s.teacherSteps();
    a.done('corpus', 'ok'); a.done('parse', 'ok'); a.done('plan', 'ok');
    const again = s.teacherSteps(); // 切回教师端，TeacherFlow 重新 setup
    expect(again).toBe(a);
    expect(again.runtime.plan.state).toBe('done');
    // 完成一步**不自动跳下一步**：演示时一步跑完讲解的人还要就着结果讲几句，
    // 页面自己切走会把话打断。下一步什么时候进，由人点（start / gotoStep 才动 currentKey）。
    expect(again.currentKey.value).toBe('corpus');
    again.start('graph');
    expect(again.currentKey.value).toBe('graph');
  });
});

describe('刷新 / 切界面语言后恢复', () => {
  it('步骤状态、当前范围与试卷写进本机存档；重载后恢复，正在跑的步骤回到待做', async () => {
    let s = await load();
    s.state.selection = { chapter: 112, from: 1, to: 4 };
    s.state.activePaperId = 'paper-9';
    const steps = s.teacherSteps();
    steps.done('corpus'); steps.done('parse', '2 个单元'); steps.start('plan');
    await nextTick();
    expect(JSON.parse(localStorage.getItem(KEY) || '{}').runtime.parse.state).toBe('done');

    s = await load(); // 整页重载
    expect(s.state.selection).toEqual({ chapter: 112, from: 1, to: 4 });
    expect(s.state.activePaperId).toBe('paper-9');
    const restored = s.teacherSteps();
    expect(restored.runtime.corpus.state).toBe('done');
    expect(restored.runtime.parse).toMatchObject({ state: 'done', summary: '2 个单元' });
    expect(restored.runtime.plan.state).toBe('todo');
  });

  it('restoreTeacherContent：取回结构识别与答题分析（学生端据此显示本课内容）；数据已不在的步骤回到待做', async () => {
    let s = await load();
    s.state.activePaperId = 'paper-1';
    const steps = s.teacherSteps();
    for (const k of ['corpus', 'parse', 'plan', 'graph', 'quiz', 'students', 'analysis', 'reinforce'] as const) steps.done(k);
    await nextTick();

    s = await load();
    const api = mockApi({ graph: vi.fn(async () => { throw new Error('boom'); }) });
    s.state.status = status() as any; s.state.corpus = { allVerified: true } as any; s.state.papers = status().papers as any;
    await s.restoreTeacherContent();
    const r = s.teacherSteps().runtime;
    expect(api.parse).toHaveBeenCalledWith({ chapter: 103, from: 1, to: 3 });
    expect(s.state.parse).toBeTruthy();
    expect(s.state.records.length).toBe(1);
    expect(r.parse.state).toBe('done');
    expect(r.plan.state).toBe('done');
    expect(r.quiz.state).toBe('done');
    expect(r.students.state).toBe('done');
    expect(r.analysis.state).toBe('done');
    expect(r.graph.state).toBe('todo'); // 理解图取不回来
    expect(r.reinforce.state).toBe('todo'); // 存档里已经没有强化
  });

  it('没有步骤存档（旧版本升级）但存档里有本范围的提纲 / 试卷：学生端照样认为教师已载入', async () => {
    const s = await load();
    const api = mockApi();
    s.state.status = status() as any; s.state.corpus = { allVerified: true } as any;
    await s.restoreTeacherContent();
    expect(api.parse).toHaveBeenCalled();
    expect(s.state.parse).toBeTruthy();
  });

  it('清空演示数据：九步全部回到待做', async () => {
    const s = await load();
    const steps = s.teacherSteps();
    steps.done('corpus'); steps.done('parse');
    s.resetTeacherSteps();
    expect(steps.metas.every((m) => steps.runtime[m.key].state === 'todo')).toBe(true);
    expect(steps.currentKey.value).toBe('corpus');
  });
});

describe('显示写法', () => {
  it('时刻按界面语言：中文 24 小时制，不出 AM / PM', async () => {
    const s = await load();
    const t = s.uiTime(new Date(2026, 8, 18, 22, 59, 23).getTime());
    expect(t).toBe('22:59:23');
  });
  it('节范围：单节「103:1」，范围「103:1–3」；旧数据「103:1-1」「103:1-3」按同一写法显示', async () => {
    const s = await load();
    expect(s.verseRange(3, 3)).toBe('3');
    expect(s.verseRange(1, 3, 103)).toBe('103:1–3');
    expect(s.refLabel('103:1-1')).toBe('103:1');
    expect(s.refLabel('103:1-3')).toBe('103:1–3');
    expect(s.refLabel('103:2')).toBe('103:2');
    // 拼进阿语句子时整段隔离成从左到右，不会被排成「3–103:1」
    expect(s.ltr('103:1–3')).toBe('\u2066103:1–3\u2069');
  });
  it('默认年级：旧存档里的「freshman year」按界面语言显示；传给生成时换成内容语言', async () => {
    const s = await load();
    expect(s.localizedGrade('freshman year')).toBe('大学一年级');
    expect(s.localizedGrade('Freshman Year')).toBe('大学一年级');
    expect(s.localizedGrade('高二')).toBe('高二');
    expect(s.contentGrade('大学一年级', 'ar')).not.toMatch(/[一-鿿]|freshman/i);
    expect(s.contentGrade('freshman year', 'en')).toBe('First-year university');
    expect(s.contentGrade('高二', 'en')).toBe('高二');
  });
});
