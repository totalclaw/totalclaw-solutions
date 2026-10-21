/**
 * AI Learning Hub P0 学生学习闭环 · 核心逻辑测试。
 * 按客户方案「七项核心能力 + My Learning Workspace」验证 store 的真实逻辑：
 * 资料导入/知识导图/学习卡(间隔重复)/模拟测试(练习判分)/个人学习记忆/复习计划/持久身份。
 * mock 掉 accountScope（落临时目录）与 agentPython（不触 electron）。
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const TMP = path.join(os.tmpdir(), 'eduhub-p0-' + process.pid);

vi.mock('./accountScope', () => ({
  accountPath: (...sub: string[]) => path.join(TMP, ...sub),
  onAccountKeyChange: () => {},
}));
vi.mock('./agentPython', () => ({ resolveAgentPython: () => ({ python: 'python3', env: {} }) }));

import { EduHubStore } from './eduHubStore';

const LID = 'L1';
const SID = 'stud1';

function seed() {
  const root = path.join(TMP, 'edu-hub');
  fs.mkdirSync(path.join(root, 'materials'), { recursive: true });
  fs.mkdirSync(path.join(root, 'gen-cache'), { recursive: true });
  fs.mkdirSync(path.join(root, 'media'), { recursive: true });
  fs.writeFileSync(path.join(root, 'config.json'), JSON.stringify({ classCode: 'ABC123' }));
  const lesson = {
    id: LID, materialId: 'M1', materialName: 'Doc', status: 'published', lang: 'en-US',
    plan: { title: 'Fact Checking', grade: 'HS', durationMinutes: 45, objectives: [], keyPoints: ['kp1', 'kp2'], difficulties: [], schedule: [], boardNotes: [], homework: '' },
    knowledgeMap: { center: 'Fact Checking', branches: [
      { label: 'Reliable sources', points: ['peer-reviewed', 'primary'] },
      { label: 'Hallucination', points: ['plausible but false'] },
    ] },
    sections: [
      { title: 'Sec A', intro: 'introA', bullets: ['x', 'y'], sourcePages: [1] },
      { title: 'Sec B', intro: 'introB', bullets: ['z'], sourcePages: [2] },
    ],
    studentDigest: [],
    quiz: [
      { q: 'Q1', options: ['A', 'B', 'C', 'D'], answer: 0, explain: 'e1', sourcePage: 3 },
      { q: 'Q2', options: ['A', 'B', 'C', 'D'], answer: 0, explain: 'e2', sourcePage: 4 },
    ],
    publishedAt: Date.now(),
  };
  fs.writeFileSync(path.join(root, 'lessons.json'), JSON.stringify([lesson]));
  fs.writeFileSync(path.join(root, 'students.json'), JSON.stringify([
    { id: SID, name: 'Ali', token: 'tok1', joinedAt: Date.now(), lastSeenAt: Date.now(), opens: { [LID]: Date.now() } },
  ]));
  // 一次官方交卷：q1 对(0)、q2 错(1) → 1/2，一道错题
  fs.writeFileSync(path.join(root, 'submissions.json'), JSON.stringify([
    { studentId: SID, lessonId: LID, score: 1, total: 2, answers: [0, 1], at: Date.now() },
  ]));
}

function mkStore(): EduHubStore {
  return new EduHubStore({
    llm: async () => '',
    genImage: async () => '',
    genAvatarVideo: async () => '',
    genAudio: async () => Buffer.from(''),
  });
}

/** 干净起点：清掉派生状态文件（卡态/练习/笔记/节点）+ 复位基表，隔离各测试。 */
function freshStore(): EduHubStore {
  const root = path.join(TMP, 'edu-hub');
  for (const f of ['card-states.json', 'attempts.json', 'notes.json', 'node-states.json']) {
    try { fs.rmSync(path.join(root, f)); } catch { /* 不存在忽略 */ }
  }
  seed();
  return mkStore();
}

let store: EduHubStore;
beforeAll(() => { seed(); store = mkStore(); });
afterAll(() => { fs.rmSync(TMP, { recursive: true, force: true }); });

describe('My Learning Workspace 首页聚合（真实进度派生）', () => {
  it('homeForStudent：完成的课→进度100%、错题=1、有到期复习卡', () => {
    const h: any = store.homeForStudent(SID);
    expect(h.name).toBe('Ali');
    expect(h.learningCode).toBe(SID);
    expect(h.weekProgressPct).toBe(100);          // 唯一课已 done
    expect(h.today).toBeNull();                    // 全部完成 → 无「继续」
    expect(h.review.mistakes).toBe(1);             // 交卷错 1 题
    expect(h.review.dueCards).toBeGreaterThanOrEqual(4); // 4 张概念卡默认待复习
    expect(h.review.suggestMinutes).toBeGreaterThan(0);
  });
});

describe('学习卡③（确定性派生 + 间隔重复）', () => {
  it('cardsForLesson：概念卡来自导图分支+章节，未答错则不出错题卡', () => {
    const cards: any[] = store.cardsForLesson(SID, LID);
    const concept = cards.filter((c) => c.type === 'concept');
    expect(concept.length).toBe(4);               // 2 分支 + 2 章节
    expect(cards.some((c) => c.type === 'mistake')).toBe(false);
    // 概念卡不含小测答案（防答案预言机）：front 是分支/章节标题
    expect(concept.map((c) => c.front)).toContain('Reliable sources');
    expect(concept.map((c) => c.front)).toContain('Sec A');
  });

  it('rateCard：已掌握推远到期、不会拉近到期（间隔重复）', () => {
    const cards: any[] = store.cardsForLesson(SID, LID);
    const cid = cards[0].id;
    const known = store.rateCard(SID, cid, 'known');
    expect(known.due).toBeGreaterThan(Date.now() + 20 * 3600_000); // 已掌握 ≥ ~1 天后
    const unknown = store.rateCard(SID, cid, 'unknown');
    expect(unknown.due).toBeLessThan(Date.now() + 10 * 60_000);    // 不会 < 10 分钟
    expect(() => store.rateCard(SID, 'L1::nope99', 'known')).toThrow();
  });

  it('dueCards：已掌握且未到期的卡被排除', () => {
    const s2 = freshStore();
    const before = s2.dueCards(SID).length;
    const cards: any[] = s2.cardsForLesson(SID, LID);
    s2.rateCard(SID, cards[0].id, 'known');
    const after = s2.dueCards(SID).length;
    expect(after).toBe(before - 1);
  });
});

describe('模拟测试④·练习模式（可重考 + 错题自动成卡）', () => {
  it('practiceQuiz：判分正确、错题成卡、attempt 入记忆', () => {
    const s = freshStore();
    const r: any = s.practiceQuiz(SID, LID, 'chapter', [1, 1]); // 两题都选错(答案都是0)
    expect(r.score).toBe(0);
    expect(r.total).toBe(2);
    expect(r.detail.length).toBe(2);
    // 错题成卡：现在 cardsForLesson 应出现 mistake 卡
    const cards: any[] = s.cardsForLesson(SID, LID);
    expect(cards.some((c) => c.type === 'mistake')).toBe(true);
    // attempt 进学习记忆
    expect(s.memoryTimeline(SID).some((e: any) => e.kind === 'practice')).toBe(true);
  });

  it('快速检测只判实际作答的题（未答的不算错、不成卡）', () => {
    const s = freshStore();
    const r: any = s.practiceQuiz(SID, LID, 'quick', [0]); // 只答第 1 题（对）
    expect(r.total).toBe(1);
    expect(r.score).toBe(1);
    const cards: any[] = s.cardsForLesson(SID, LID);
    expect(cards.some((c) => c.type === 'mistake')).toBe(false); // 未产生错题卡
  });
});

describe('知识导图节点掌握② + 笔记 + 学习记忆⑥', () => {
  it('markNode / nodeStatesFor', () => {
    const s = freshStore();
    s.markNode(SID, LID, 0, 'weak');
    s.markNode(SID, LID, 1, 'known');
    const ns = s.nodeStatesFor(SID, LID);
    expect(ns[0]).toBe('weak');
    expect(ns[1]).toBe('known');
  });

  it('addNote / notesFor / deleteNote', () => {
    const s = freshStore();
    const n = s.addNote(SID, LID, 0, 'my note');
    expect(s.notesFor(SID, LID).length).toBe(1);
    expect(() => s.addNote(SID, LID, 0, '   ')).toThrow(); // 空笔记拒绝
    s.deleteNote(SID, n.id);
    expect(s.notesFor(SID, LID).length).toBe(0);
  });

  it('memoryTimeline：真实事件按时间倒序（open/test 至少各一）', () => {
    const tl = store.memoryTimeline(SID);
    expect(tl.some((e: any) => e.kind === 'open')).toBe(true);
    expect(tl.some((e: any) => e.kind === 'test')).toBe(true);
    for (let i = 1; i < tl.length; i++) expect(Number(tl[i - 1].at)).toBeGreaterThanOrEqual(Number(tl[i].at));
  });
});

describe('持久身份·学习码接续', () => {
  it('resumeStudent：正确码+学习码→重签 token 同档案；错码/错学习码→报错', () => {
    const s = freshStore();
    const r = s.resumeStudent('abc-123', SID); // 归一化：大小写/连字符无关
    expect(r.studentId).toBe(SID);
    expect(r.name).toBe('Ali');
    expect(r.token).toBeTruthy();
    expect(() => s.resumeStudent('WRONG', SID)).toThrow('BAD_CODE');
    expect(() => s.resumeStudent('ABC123', 'ghost')).toThrow('NOT_FOUND');
  });
});
