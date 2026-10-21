/**
 * 对抗性回归：学生交卷后教师切语言，成绩与解析**不许错位**（2026-09-22 审查确认）。
 *
 * 现场机制：切语言会把 `lesson.quiz` 整体换成目标语言那份，而 submitQuiz 一直按
 * **当前** `l.quiz` 逐下标判分、逐题出解析。于是已交卷的学生重新打开成绩页时，
 * 会看到「4/5 分」配着 5 条全错的解析 —— 分数来自存档、解析用新语言现算，自相矛盾。
 *
 * 钉两条：
 *   ① 提交时记下当时的语言；
 *   ② 之后即便教师切了语言，重算 detail 仍用**提交时那份** quiz，与存档分数自洽。
 *
 * 还顺带钉住「中断的切换必须可恢复」：langStatus 停在 switching 时重启不能锁死教案。
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const TMP = path.join(os.tmpdir(), 'eduhub-submitlang-' + process.pid);

vi.mock('./accountScope', () => ({
  accountPath: (...sub: string[]) => path.join(TMP, ...sub),
  onAccountKeyChange: () => {},
}));
vi.mock('./agentPython', () => ({ resolveAgentPython: () => ({ python: 'python3', env: {} }) }));

import { EduHubStore } from './eduHubStore';

const LID = 'L1';
const root = path.join(TMP, 'edu-hub');

/** 中文原卷：4 道题，正确项依次 0/1/2/3 —— 换成英文卷后正确项全变，错位一眼看得出 */
const ZH_QUIZ = [
  { q: '题一', options: ['甲', '乙', '丙', '丁'], answer: 0, explain: '解析一', sourcePage: 1 },
  { q: '题二', options: ['甲', '乙', '丙', '丁'], answer: 1, explain: '解析二', sourcePage: 1 },
  { q: '题三', options: ['甲', '乙', '丙', '丁'], answer: 2, explain: '解析三', sourcePage: 1 },
  { q: '题四', options: ['甲', '乙', '丙', '丁'], answer: 3, explain: '解析四', sourcePage: 1 },
];
/** 英文卷：题数不同（3 题）且正确项全是 3 —— 拿它判中文答案必然算错 */
const EN_QUIZ = [
  { q: 'Q1', options: ['A', 'B', 'C', 'D'], answer: 3, explain: 'e1', sourcePage: 1 },
  { q: 'Q2', options: ['A', 'B', 'C', 'D'], answer: 3, explain: 'e2', sourcePage: 1 },
  { q: 'Q3', options: ['A', 'B', 'C', 'D'], answer: 3, explain: 'e3', sourcePage: 1 },
];

function seed(): void {
  for (const d of ['materials', 'gen-cache', 'media']) fs.mkdirSync(path.join(root, d), { recursive: true });
  fs.writeFileSync(path.join(root, 'config.json'), JSON.stringify({ classCode: 'ABC123' }));
  fs.writeFileSync(path.join(root, 'materials.json'), JSON.stringify([{ id: 'M1', name: 'Doc', status: 'ready', pages: 1, importedAt: Date.now() }]));
  fs.writeFileSync(path.join(root, 'lessons.json'), JSON.stringify([{
    id: LID, materialId: 'M1', materialName: 'Doc', status: 'published', lang: 'zh-CN',
    mode: 'fast', grade: '初中', durationMinutes: 45,
    plan: { title: '原课', grade: '初中', durationMinutes: 45, objectives: [], keyPoints: [], difficulties: [], schedule: [], boardNotes: [], homework: '' },
    knowledgeMap: { center: 'x', branches: [] },
    sections: [{ title: 'S', intro: 'i', bullets: ['b'], sourcePages: [1] }],
    studentDigest: [], quiz: ZH_QUIZ, lessonHtml: '<h1>原课</h1>', publishedAt: Date.now(),
  }]));
  fs.writeFileSync(path.join(root, 'students.json'), JSON.stringify([
    { id: 'S1', studentNo: '01', name: '学生一', token: 't1', lastSeenAt: Date.now(), opens: {} },
  ]));
  fs.writeFileSync(path.join(root, 'submissions.json'), '[]');
}

beforeAll(() => { seed(); });
afterAll(() => { fs.rmSync(TMP, { recursive: true, force: true }); });

describe('交卷后切语言，成绩与解析不错位', () => {
  it('提交记下语言；切到英文后重看成绩，仍按中文卷判', () => {
    const store = new EduHubStore({} as any);

    // 学生按中文卷作答：全对
    const first = store.submitQuiz('S1', LID, [0, 1, 2, 3]) as any;
    expect(first.score).toBe(4);
    expect(first.total).toBe(4);

    // 教师切到英文（直接落 variants + 换顶层，等价于 applyVariant 的结果）
    const lessons = JSON.parse(fs.readFileSync(path.join(root, 'lessons.json'), 'utf8'));
    lessons[0].variants = { 'zh-CN': { quiz: ZH_QUIZ, lessonHtml: '<h1>原课</h1>', sections: lessons[0].sections, plan: lessons[0].plan } };
    lessons[0].quiz = EN_QUIZ;
    lessons[0].lang = 'en-US';
    fs.writeFileSync(path.join(root, 'lessons.json'), JSON.stringify(lessons));

    // 学生再打开成绩页：分数取存档，解析必须仍按**中文卷**算（4 题全对），不能变成英文卷
    const again = new EduHubStore({} as any).submitQuiz('S1', LID, [0, 1, 2, 3]) as any;
    expect(again.alreadySubmitted).toBe(true);
    expect(again.score).toBe(4);
    expect(again.detail).toHaveLength(4);                      // 英文卷只有 3 题 —— 长度就能抓住错位
    expect(again.detail.every((d: any) => d.correct)).toBe(true);
    expect(again.detail.map((d: any) => d.answer)).toEqual([0, 1, 2, 3]);
    expect(again.detail[0].explain).toBe('解析一');
  });
});

describe('中断的语言切换可恢复', () => {
  it('langStatus 停在 switching 时，重建 store 会收敛成 failed 而不是永久锁死', () => {
    const lessons = JSON.parse(fs.readFileSync(path.join(root, 'lessons.json'), 'utf8'));
    lessons[0].langStatus = 'switching';
    lessons[0].langTarget = 'ar';
    fs.writeFileSync(path.join(root, 'lessons.json'), JSON.stringify(lessons));

    const store = new EduHubStore({} as any);
    const l = store.getLesson(LID)!;
    expect(l.langStatus).toBe('failed');
    expect(l.langTarget).toBeUndefined();
    expect(String(l.langError || '')).not.toBe('');
  });
});
