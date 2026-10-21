/**
 * 智慧课堂的删除与班级码历史。
 *
 * 两条用户诉求：
 *   ①「班级码刷新完就没了，找不到之前的班级码」 → 历史留痕 + 可恢复
 *   ②「增加可以单独删除教案 / 学生账号 / 学生提问的按钮」 → 删得干净，不留孤儿数据
 *
 * 这里直接对 EduHubStore 跑真实文件读写（临时账号目录），不 mock —— 删除最容易
 * 出错的正是「主表删了、派生表没删」，只有真跑一遍才看得出来。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let root = '';
vi.mock('./accountScope', () => ({
  accountPath: (...sub: string[]) => join(root, ...sub),
  privateRoot: () => root,
  onAccountKeyChange: () => {},
}));
vi.mock('electron', () => ({ app: { getPath: () => root, getVersion: () => '0.0.0' } }));

async function freshStore() {
  const { EduHubStore } = await import('./eduHubStore');
  return new EduHubStore({ llm: async () => '{}' });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'eduhub-'));
  vi.resetModules();
});
afterEach(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* */ } });

describe('班级码历史', () => {
  it('首次启动就有一条记录（不是空列表）', async () => {
    const s = await freshStore();
    const hist = s.classCodeHistory();
    expect(hist.length).toBe(1);
    expect(hist[0].code).toBe(s.classCode);
    expect(hist[0].retiredAt).toBeUndefined();
  });

  it('换码后旧码留痕、新码在最前且标为在用', async () => {
    const s = await freshStore();
    const before = s.classCode;
    const after = s.rotateClassCode();
    expect(after).not.toBe(before);
    const hist = s.classCodeHistory();
    expect(hist[0].code).toBe(after);
    expect(hist[0].retiredAt).toBeUndefined();
    const old = hist.find((h) => h.code === before)!;
    expect(old).toBeTruthy();
    expect(old.retiredAt).toBeGreaterThan(0);
  });

  it('可以把旧码设回当前（误刷新的后悔药）', async () => {
    const s = await freshStore();
    const first = s.classCode;
    s.rotateClassCode();
    expect(s.restoreClassCode(first)).toBe(first);
    expect(s.classCode).toBe(first);
    const hist = s.classCodeHistory();
    expect(hist.find((h) => h.code === first)!.retiredAt).toBeUndefined();
  });

  it('恢复一枚从没存在过的码要报错，而不是静默换成它', async () => {
    const s = await freshStore();
    expect(() => s.restoreClassCode('ZZZZZZ')).toThrow();
  });

  it('历史有上限，不会无限膨胀', async () => {
    const s = await freshStore();
    for (let i = 0; i < 60; i++) s.rotateClassCode();
    expect(s.classCodeHistory().length).toBeLessThanOrEqual(50);
  });
});

describe('删除要删干净', () => {
  it('删教案连带清掉学生对它的进度与小测（否则班级均分不会变，比不给删更迷惑）', async () => {
    const s = await freshStore();
    // 造一份已发布教案 + 一个学生 + 一次提交
    const lessons = [{ id: 'L1', materialId: 'M1', materialName: 'x', status: 'published', quiz: [{ q: 'a', options: ['1', '2'], answer: 0, explain: '' }] }];
    (s as any).lessons = lessons;
    (s as any).materials = [{ id: 'M1', name: 'x', ext: '.txt', pages: 1, chars: 10, status: 'ready', importedAt: 1, lessonId: 'L1' }];
    (s as any).students = [{ id: 'S1', name: '张三', token: 't', joinedAt: 1, lastSeenAt: 1, opens: { L1: 1 } }];
    (s as any).submissions = [{ studentId: 'S1', lessonId: 'L1', score: 1, total: 1, answers: [0], at: 1 }];
    (s as any).qaLog = [{ id: 'Q1', studentId: 'S1', studentName: '张三', lessonId: 'L1', q: 'x', a: 'y', grounded: true, at: 1 }];

    s.deleteLesson('L1');

    expect((s as any).lessons.length).toBe(0);
    expect((s as any).submissions.length).toBe(0);
    expect((s as any).qaLog.length).toBe(0);
    expect((s as any).students[0].opens.L1).toBeUndefined();
    expect((s as any).materials[0].lessonId).toBeUndefined(); // 资料能重新生成
  });

  it('删资料连带删掉它名下的教案与磁盘文件 —— 这是「删除删不干净」的真因', async () => {
    const s = await freshStore();
    const { mkdirSync, writeFileSync } = await import('node:fs');
    // 资料在磁盘上留两个文件：原件副本 + 解析结果。不删就是永久占着。
    mkdirSync(join(root, 'edu-hub', 'materials'), { recursive: true });
    const copy = join(root, 'edu-hub', 'materials', 'M1.docx');
    const pages = join(root, 'edu-hub', 'materials', 'M1.pages.json');
    writeFileSync(copy, 'binary');
    writeFileSync(pages, '[]');

    (s as any).materials = [{ id: 'M1', name: 'x.docx', ext: '.docx', pages: 1, chars: 10, status: 'ready', importedAt: 1, lessonId: 'L1' }];
    (s as any).lessons = [
      { id: 'L1', materialId: 'M1', materialName: 'x.docx', status: 'published', quiz: [] },
      { id: 'L2', materialId: 'M1', materialName: 'x.docx', status: 'failed', quiz: [] },
      { id: 'L9', materialId: 'M9', materialName: '别的资料', status: 'draft', quiz: [] },
    ];
    (s as any).students = [{ id: 'S1', name: '张三', token: 't', joinedAt: 1, lastSeenAt: 1, opens: { L1: 1 } }];
    (s as any).submissions = [{ studentId: 'S1', lessonId: 'L1', score: 1, total: 1, answers: [0], at: 1 }];

    const out = s.deleteMaterial('M1');

    expect(out.lessons).toBe(2);
    expect(out.files).toBe(2);
    expect((s as any).materials.length).toBe(0);
    // 同一份资料下的两份教案都要清掉，失败状态的那份也不例外
    expect((s as any).lessons.map((l: any) => l.id)).toEqual(['L9']);
    // 连带的学生痕迹由 deleteLesson 负责，这里确认真的被带走了
    expect((s as any).submissions.length).toBe(0);
    expect((s as any).students[0].opens.L1).toBeUndefined();
    expect(existsSync(copy)).toBe(false);
    expect(existsSync(pages)).toBe(false);
  });

  it('删资料不碰别的资料的教案', async () => {
    const s = await freshStore();
    (s as any).materials = [
      { id: 'M1', name: 'a', ext: '.txt', pages: 1, chars: 1, status: 'ready', importedAt: 1 },
      { id: 'M2', name: 'b', ext: '.txt', pages: 1, chars: 1, status: 'ready', importedAt: 1 },
    ];
    (s as any).lessons = [{ id: 'L1', materialId: 'M1', materialName: 'a', status: 'draft', quiz: [] },
      { id: 'L2', materialId: 'M2', materialName: 'b', status: 'draft', quiz: [] }];
    s.deleteMaterial('M1');
    expect((s as any).materials.map((m: any) => m.id)).toEqual(['M2']);
    expect((s as any).lessons.map((l: any) => l.id)).toEqual(['L2']);
  });

  it('磁盘上本来就没文件时也不报错（删除是幂等的）', async () => {
    const s = await freshStore();
    (s as any).materials = [{ id: 'M1', name: 'a', ext: '.txt', pages: 1, chars: 1, status: 'ready', importedAt: 1 }];
    (s as any).lessons = [];
    expect(() => s.deleteMaterial('M1')).not.toThrow();
    expect((s as any).materials.length).toBe(0);
  });

  it('删不存在的资料报错，不静默成功', async () => {
    const s = await freshStore();
    expect(() => s.deleteMaterial('nope')).toThrow();
  });

  it('删不存在的教案报错，不静默成功', async () => {
    const s = await freshStore();
    expect(() => s.deleteLesson('nope')).toThrow();
  });

  it('删学生连带清掉他的全部学习痕迹', async () => {
    const s = await freshStore();
    (s as any).students = [{ id: 'S1', name: '张三', token: 't', joinedAt: 1, lastSeenAt: 1, opens: {} }];
    (s as any).submissions = [{ studentId: 'S1', lessonId: 'L1', score: 1, total: 1, answers: [0], at: 1 }];
    (s as any).qaLog = [{ id: 'Q1', studentId: 'S1', studentName: '张三', lessonId: 'L1', q: 'x', a: 'y', grounded: true, at: 1 }];
    (s as any).notes = [{ id: 'N1', studentId: 'S1', lessonId: 'L1', section: 0, text: 'n', at: 1 }];

    s.deleteStudent('S1');

    expect((s as any).students.length).toBe(0);
    expect((s as any).submissions.length).toBe(0);
    expect((s as any).qaLog.length).toBe(0);
    expect((s as any).notes.length).toBe(0);
  });

  it('删单条提问只删那一条', async () => {
    const s = await freshStore();
    (s as any).qaLog = [
      { id: 'Q1', studentId: 'S1', studentName: 'a', lessonId: 'L1', q: '有效', a: '', grounded: true, at: 1 },
      { id: 'Q2', studentId: 'S1', studentName: 'a', lessonId: 'L1', q: '无效', a: '', grounded: false, at: 2 },
    ];
    s.deleteQuestion('Q2');
    expect((s as any).qaLog.map((q: any) => q.id)).toEqual(['Q1']);
    expect(() => s.deleteQuestion('Q2')).toThrow(); // 再删一次要报错，不装作删掉了
  });

  it('删除落盘（重开 store 不会诈尸）', async () => {
    const s = await freshStore();
    (s as any).qaLog = [{ id: 'Q1', studentId: 'S1', studentName: 'a', lessonId: 'L1', q: 'x', a: '', grounded: true, at: 1 }];
    (s as any).saveStudents();
    s.deleteQuestion('Q1');
    const onDisk = JSON.parse(readFileSync(join(root, 'edu-hub', 'qa-log.json'), 'utf8'));
    expect(onDisk).toEqual([]);
    expect(existsSync(join(root, 'edu-hub', 'qa-log.json'))).toBe(true);
  });
});
