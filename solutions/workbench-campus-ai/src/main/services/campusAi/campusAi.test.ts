import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CaFaq, CaStudentResult } from '@totalclaw/ipc-contracts';
import { buildIndex, matchFaq, questionSimilarity, search } from './kb';
import { answerQuestion, isSensitive, unsupportedNumbers } from './qa';
import { computeWarnings, detectMapping, judgeScore, levelOf, missingRoles, parseAttendance, parseGrades, parseRoster } from './warning';
import { anonymousFacts, draftNotice, fillName, NAME_SLOT, numbersOutsideFacts } from './notice';
import { defaultWarnRules, normalizeWarnRules } from './store';
import { readSheet } from './warning';
import { writeDemoStudents } from './demoData';

const faq = (question: string, answer: string, similar: string[] = []): CaFaq => ({
  id: `f_${question}`, question, answer, similar, dept: '教务处', source: 'manual', createdAt: '', updatedAt: '', hits: 0,
});
const table = (headers: string[], rows: string[][]) => ({ path: '', fileName: 't.xlsx', sheetName: 'S', headers, rows: rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? '']))) });

describe('知识库', () => {
  it('FAQ 问法归一后相同直接命中；不相干的问题不命中', () => {
    const list = [faq('补考什么时候考？', '下学期第 2 周', ['补考时间'])];
    expect(matchFaq(list, '请问补考什么时候考')?.faq.id).toBe('f_补考什么时候考？');
    expect(matchFaq(list, '补考时间')).not.toBeNull();
    expect(matchFaq(list, '图书馆几点开门')).toBeNull();
    expect(questionSimilarity('宿舍什么时候有热水', '宿舍什么时候有热水？')).toBe(1);
  });
  it('检索：相关文档片段排在前面，同一文档最多 3 段', () => {
    const lib = buildIndex('图书馆开放时间：周一至周日 7:30-22:00。借阅规则：每人可借 10 册，借期 30 天。');
    const dorm = buildIndex('宿舍热水供应时间为每天 6:30-8:30 和 17:00-23:30。宿舍熄灯时间为 23:30。');
    const hits = search({ docs: [{ id: 'lib', name: '图书馆', dept: '图书馆', index: lib }, { id: 'dorm', name: '后勤', dept: '后勤处', index: dorm }], faqs: [] }, '宿舍几点有热水');
    expect(hits[0].id).toBe('dorm');
  });
});

describe('问答判定链', () => {
  const lib = buildIndex('重修报名在每学期第 3 周通过教务系统进行，重修费按每学分 80 元收取。');
  const base = {
    source: { docs: [{ id: 'd1', name: '学生手册', dept: '教务处', index: lib }], faqs: [] as CaFaq[] },
    faqs: [] as CaFaq[], minScore: 0.2, schoolName: '示例学院', hotline: '0000-110', sensitiveDept: '学工处', defaultDept: '招生办',
  };
  it('敏感问题不调模型，给求助方式并转学工处', async () => {
    const llm = vi.fn();
    const r = await answerQuestion({ ...base, question: '我真的不想活了', llm });
    expect(r.kind).toBe('sensitive');
    expect(r.ticketDept).toBe('学工处');
    expect(r.text).toContain('0000-110');
    expect(llm).not.toHaveBeenCalled();
    expect(isSensitive('补考时间')).toBe(false);
  });
  it('FAQ 命中不调模型', async () => {
    const llm = vi.fn();
    const f = faq('重修怎么报名？', '第 3 周在教务系统报名');
    const r = await answerQuestion({ ...base, faqs: [f], question: '重修怎么报名', llm });
    expect(r.kind).toBe('faq');
    expect(r.text).toBe('第 3 周在教务系统报名');
    expect(llm).not.toHaveBeenCalled();
  });
  it('没有依据不调模型，转部门', async () => {
    const llm = vi.fn();
    const r = await answerQuestion({ ...base, question: '食堂有没有清真窗口', llm });
    expect(r.kind).toBe('no_evidence');
    expect(r.ticketDept).toBeTruthy();
    expect(llm).not.toHaveBeenCalled();
  });
  it('模型依据原文作答，带出处', async () => {
    const llm = vi.fn(async () => ({ text: '每学期第 3 周在教务系统报名，每学分 80 元。\nSOURCES: 1', model: 'm' }));
    const r = await answerQuestion({ ...base, question: '重修费多少钱，什么时候报名', llm });
    expect(r.kind).toBe('answer');
    expect(r.sources[0].title).toBe('学生手册');
  });
  it('模型写了原文没有的数字 → 改为列原文', async () => {
    const llm = vi.fn(async () => ({ text: '重修费每学分 100 元。\nSOURCES: 1', model: 'm' }));
    const r = await answerQuestion({ ...base, question: '重修费多少钱，什么时候报名', llm });
    expect(r.kind).toBe('quote');
    expect(r.unsupported).toContain('100');
    expect(r.text).toContain('80 元');
  });
  it('模型判 NO_ANSWER → 转部门', async () => {
    const llm = vi.fn(async () => ({ text: 'NO_ANSWER', model: 'm' }));
    const r = await answerQuestion({ ...base, question: '重修费多少钱，什么时候报名', llm });
    expect(r.kind).toBe('no_evidence');
  });
  it('数字核对：分点序号不算，千分位与全角数字归一', () => {
    expect(unsupportedNumbers('1. 每学分 80 元', '每学分80元')).toEqual([]);
    expect(unsupportedNumbers('共 3,700 元', '一档每生每年 3700 元')).toEqual([]);
    expect(unsupportedNumbers('２５００元', '二档 2500 元')).toEqual([]);
    expect(unsupportedNumbers('9 月 20 日截止', '9 月 30 日截止')).toEqual(['20']);
  });
});

describe('学业预警', () => {
  const rules = defaultWarnRules();
  it('认列：整格优先，必填缺了报出来；考勤要状态列或缺勤次数列', () => {
    expect(detectMapping(['学号', '姓名', '班级', '辅导员', '辅导员邮箱'], 'roster')).toMatchObject({ studentId: '学号', name: '姓名', counselorEmail: '辅导员邮箱' });
    expect(missingRoles('grades', detectMapping(['学号', '课程名称'], 'grades'))).toEqual(['score']);
    expect(missingRoles('attendance', detectMapping(['学号', '课程'], 'attendance'))).toContain('absent');
  });
  it('成绩判定：百分制、五级制、缺考算不及格、缓考不计', () => {
    expect(judgeScore('59', 60)?.pass).toBe(false);
    expect(judgeScore('良好', 60)?.pass).toBe(true);
    expect(judgeScore('缺考', 60)?.pass).toBe(false);
    expect(judgeScore('缓考', 60)).toBeNull();
  });
  it('级别：任一门槛满足即达到该级，从红往下判；依据带数字', () => {
    expect(levelOf(4, 10, 0, rules).level).toBe('red');
    expect(levelOf(1, 3, 0.25, rules)).toMatchObject({ level: 'orange' });
    expect(levelOf(1, 2, null, rules).basis[0]).toContain('不及格 1 门');
    expect(levelOf(0, 0, 0.05, rules).level).toBeNull();
    // 门槛设 0 表示不用这一项
    expect(levelOf(9, 0, 0, normalizeWarnRules({ ...rules, red: { failCourses: 0, failCredits: 0, absenceRate: 0 } })).level).toBe('orange');
  });
  it('补考及格不算不及格；名单外的学号单独列出；逐次考勤按状态计', () => {
    const roster = parseRoster(table(['学号', '姓名', '班级'], [['1', '甲', 'A'], ['2', '乙', 'A'], ['2', '乙2', 'A']]), { studentId: '学号', name: '姓名', className: '班级' });
    expect(roster.skippedCount).toBe(1);
    const grades = parseGrades(table(['学号', '课程', '学分', '成绩'], [
      ['1', '数学', '4', '50'], ['1', '数学', '4', '65'], ['1', '英语', '3', '40'], ['2', '数学', '4', '90'], ['9', '数学', '4', '30'],
    ]), { studentId: '学号', course: '课程', credit: '学分', score: '成绩' });
    const att = parseAttendance(table(['学号', '状态'], [['2', '旷课'], ['2', '出勤'], ['2', '请假'], ['2', '旷课'], ['1', '出勤']]), { studentId: '学号', status: '状态' });
    const { results, summary } = computeWarnings({ roster: roster.rows, grades: grades.rows, attendance: att.rows }, rules);
    const one = results.find((r) => r.studentId === '1')!;
    expect(one.failCourses).toBe(1);
    expect(one.failed[0].course).toBe('英语');
    const two = results.find((r) => r.studentId === '2')!;
    expect(two.absent).toBe(2);
    expect(two.absenceRate).toBe(0.5);
    expect(two.level).toBe('red');
    expect(summary.unknownStudents).toEqual(['9']);
  });
  it('示例数据能读回并算出各级预警', () => {
    const dir = mkdtempSync(join(tmpdir(), 'campus-demo-'));
    const f = writeDemoStudents(dir);
    const load = (path: string, ds: 'roster' | 'grades' | 'attendance') => {
      const { table: t } = readSheet(path);
      const m = detectMapping(t.headers, ds);
      expect(missingRoles(ds, m)).toEqual([]);
      return ds === 'roster' ? parseRoster(t, m).rows : ds === 'grades' ? parseGrades(t, m).rows : parseAttendance(t, m).rows;
    };
    const data = { roster: load(f.roster, 'roster') as any, grades: load(f.grades, 'grades') as any, attendance: load(f.attendance, 'attendance') as any };
    expect(data.roster).toHaveLength(120);
    const { summary } = computeWarnings(data, rules);
    expect(summary.warned).toBeGreaterThan(5);
    expect(summary.byLevel.red + summary.byLevel.orange).toBeGreaterThan(0);
  });
});

describe('谈话提纲与通知', () => {
  const s: CaStudentResult = {
    studentId: '2024001', name: '张三', className: 'A班', college: '', major: '', counselor: '', counselorEmail: '',
    failCourses: 2, failCredits: 7, failed: [{ course: '高等数学', score: '45', credit: 4 }, { course: '大学英语', score: '52', credit: 3 }],
    absent: 6, totalSessions: 24, absenceRate: 0.25, level: 'orange', basis: [],
  };
  it('发给模型的事实不含姓名学号', () => {
    const facts = anonymousFacts(s, 'orange').join('\n');
    expect(facts).not.toContain('张三');
    expect(facts).not.toContain('2024001');
    expect(facts).toContain('高等数学');
  });
  it('模型写了事实里没有的数字 → 用模板版', async () => {
    const llm = vi.fn(async () => ({ json: { outline: '1. 谈谈原因', notice: `${NAME_SLOT}同学：你有 3 门不及格` }, model: 'm' }));
    const n = await draftNotice(s, 'orange', '示例学院', llm);
    expect(n.by).toBe('template');
    const facts = anonymousFacts(s, 'orange');
    // 「3 门」不能因为事实里有「3 学分」就放过
    expect(numbersOutsideFacts('有 3 门不及格', facts)).toEqual(['3门']);
    expect(numbersOutsideFacts('1. 有 2 门不及格，共 7 学分，缺勤 6 次，缺勤率 25%，高等数学 45 分', facts)).toEqual([]);
    expect(numbersOutsideFacts('考了 46 分', facts)).toEqual(['46']);
  });
  it('模型版数字核对通过就采用；导出时替换姓名', async () => {
    const llm = vi.fn(async () => ({ json: { outline: '1. 了解高等数学 45 分的原因', notice: `${NAME_SLOT}同学：你的高等数学 45 分、大学英语 52 分，缺勤率 25%。` }, model: 'm' }));
    const n = await draftNotice(s, 'orange', '示例学院', llm);
    expect(n.by).toBe('model');
    expect(fillName(n.notice, '张三')).toContain('张三同学');
  });
  it('模型调用失败也能出模板版', async () => {
    const n = await draftNotice(s, 'orange', '示例学院', async () => { throw new Error('down'); });
    expect(n.by).toBe('template');
    expect(n.notice).toContain(NAME_SLOT);
    expect(n.outline).toContain('高等数学');
  });
});
