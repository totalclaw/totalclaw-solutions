/**
 * 会议智能管理 · 首页待办（13 类）、紧急程度、提示语、任务提醒与计数。用演示数据（和原型同名）按身份核对。
 */
import { describe, expect, it } from 'vitest';
import { MM_DEFAULT_SETTINGS, type MmMeeting, type MmSettings } from '../../../shared/meetingMgmt/types';
import { buildDemoData, buildDemoOrg } from './demo';
import * as T from './todos';

const NOW = new Date(2026, 10, 16, 10, 0, 0).getTime(); // 周一 10:00
const HOUR = 3_600_000;
const DAY = 86_400_000;

function input(now = NOW) {
  const data = buildDemoData(now);
  const settings: MmSettings = JSON.parse(JSON.stringify(MM_DEFAULT_SETTINGS));
  return { org: { ...buildDemoOrg(), source: 'demo' as const }, settings, ...data };
}

describe('提示语', () => {
  it('已等待 / 剩 / 逾期', () => {
    expect(T.waitedHint(NOW - 26 * HOUR, NOW)).toBe('已等待 1 天');
    expect(T.waitedHint(NOW - 5 * HOUR, NOW)).toBe('已等待 5 小时');
    expect(T.waitedHint(NOW - 60_000, NOW)).toBe('刚刚');
    expect(T.remainHint(NOW + 6 * HOUR, NOW)).toBe('剩 6 小时');
    expect(T.remainHint(NOW + 30 * HOUR, NOW)).toBe('剩 2 天');
    expect(T.overdueHint(2)).toBe('逾期 2 天');
    expect(T.dueHint('2026-11-14', NOW)).toBe('逾期 2 天');
    expect(T.dueHint('2026-11-16', NOW)).toBe('剩 14 小时');
    expect(T.dueHint('2026-11-19', NOW)).toBe('剩 3 天');
  });
});

describe('按身份算待办（演示数据）', () => {
  it('林晓：逾期任务、待裁决为紧急；确认发言剩 6 小时为今天；终审、确认方案为本周', () => {
    const todos = T.computeTodos(input(), 'linxiao', NOW);
    expect(todos.map((t) => [t.type, t.urgency, t.hint])).toEqual([
      ['update_progress', 'urgent', '逾期 2 天'],
      ['arbitrate', 'urgent', '已等待 1 天'],
      ['confirm_speech', 'today', '剩 6 小时'],
      ['confirm_plan', 'week', '已等待 2 天'],
      ['review_minutes', 'week', '已等待 5 小时'],
    ]);
    expect(todos.find((t) => t.type === 'arbitrate')).toMatchObject({ title: '主控芯片到货跟踪', link: { kind: 'task' }, group: 'task' });
    expect(todos.find((t) => t.type === 'arbitrate')!.subtitle).toContain('周婷与刘洋对截止日有分歧（2026-12-15 / 2026-12-20）');
    expect(todos.find((t) => t.type === 'review_minutes')).toMatchObject({ title: '数字化工厂周例会', link: { kind: 'meeting', id: 'mt_df_weekly' } });
    expect(todos.find((t) => t.type === 'confirm_plan')!.link).toEqual({ kind: 'meeting_plan', id: 'mt_east_plan' });
    expect(T.todoBadges(todos)).toEqual({ home: 5, meetings: 3, tasks: 2 });
  });

  it('吴刚：待指认、定稿待选择、待指定负责人、待更新进度（一周没更新）', () => {
    const types = T.computeTodos(input(), 'wugang', NOW).map((t) => t.type).sort();
    expect(types).toEqual(['assign_owner', 'assign_speaker', 'decide_tasks', 'update_progress']);
  });

  it('陈立峰待复核异议；郑凯待接收；孙浩待确认发言；周婷没有（异议在项目负责人那里裁决）', () => {
    expect(T.computeTodos(input(), 'chenlifeng', NOW).map((t) => t.type)).toEqual(['review_objection']);
    expect(T.computeTodos(input(), 'zhengkai', NOW).map((t) => t.type)).toEqual(['accept_task']);
    expect(T.computeTodos(input(), 'sunhao', NOW).map((t) => t.type)).toEqual(['confirm_speech']);
    expect(T.computeTodos(input(), 'zhouting', NOW)).toEqual([]);
    expect(T.computeTodos(input(), null, NOW)).toEqual([]);
  });

  it('驳回待回应、处理失败、待审核总结也会出现；归档项目里的不算', () => {
    const s = input();
    const chip = s.tasks.find((t) => t.title === '主控芯片到货跟踪')!;
    chip.objection!.stage = 'dept_reply';
    expect(T.computeTodos(s, 'zhouting', NOW).map((t) => t.type)).toEqual(['dept_reply']);
    const weekly = s.meetings.find((m) => m.id === 'mt_a2_weekly')!;
    weekly.status = 'failed';
    weekly.process = { stage: 'transcribe', progress: 30, error: '没有检测到人声', finishedAt: NOW - HOUR, log: [] };
    const fail = T.computeTodos(s, 'chenlifeng', NOW).find((t) => t.type === 'retry_process')!;
    expect(fail.subtitle).toContain('没有检测到人声');
    const east = s.projects.find((p) => p.id === 'pj_east')!;
    east.status = 'closing';
    east.summary = { id: 'r', kind: 'summary', generatedAt: NOW - HOUR, markdown: '', stats: { total: 0, done: 0, cancelled: 0, overdue: 0, onTime: 0, late: 0, completionRate: 0 } };
    expect(T.computeTodos(s, 'wugang', NOW).some((t) => t.type === 'review_report' && t.link.kind === 'project_summary')).toBe(true);
    east.status = 'archived';
    expect(T.computeTodos(s, 'wugang', NOW).filter((t) => ['review_report', 'assign_speaker', 'decide_tasks'].includes(t.type))).toEqual([]);
  });

  it('确认发言：被退回的从退回时算；超时后显示已等待并算今天', () => {
    const s = input();
    const m = s.meetings.find((x) => x.id === 'mt_a2_review') as MmMeeting;
    const c = m.confirmations.find((x) => x.personId === 'sunhao')!;
    c.requestedAt = NOW - 30 * HOUR;
    const t = T.computeTodos(s, 'sunhao', NOW)[0];
    expect([t.urgency, t.hint]).toEqual(['today', '已等待 1 天']);
    c.returnedAt = NOW - HOUR;
    c.requestedAt = NOW - HOUR;
    c.returnNote = '数字说错了';
    const r = T.computeTodos(s, 'sunhao', NOW)[0];
    expect(r.subtitle).toContain('数字说错了');
    expect(r.hint).toBe('剩 23 小时');
  });

  it('待更新进度：逾期、快到期、一个跟踪周期没更新才出现；异议处理中不出现', () => {
    const s = input();
    const t = s.tasks.find((x) => x.title === 'MES 二期需求确认')!; // 赵磊：截止 +5 天，3 天前更新过
    expect(T.needsProgressUpdate(t, s.settings, NOW)).toBe(false);
    expect(T.needsProgressUpdate(t, s.settings, NOW + 4 * DAY)).toBe(true); // 快到期
    expect(T.needsProgressUpdate(t, { ...s.settings, trackCycleDays: 2 }, NOW)).toBe(true);
    const inspect = s.tasks.find((x) => x.title === '首件检验方案')!;
    expect(T.needsProgressUpdate(inspect, s.settings, NOW + 30 * DAY)).toBe(false);
  });
});

describe('任务提醒与计数', () => {
  it('我接收的：本周截止 / 已逾期；首页计数', () => {
    const s = input();
    const r = T.myTaskReminders(s, 'zhouting', NOW);
    expect(r.dueThisWeek.map((t) => t.title)).toEqual(['A2 物料齐套确认']);
    expect(r.overdue).toEqual([]);
    const lx = T.myTaskReminders(s, 'linxiao', NOW);
    expect(lx.overdue.map((t) => [t.title, t.overdue, t.overdueDays, t.deptName, t.ownerName, t.projectName])).toEqual([['上线培训计划编制', true, 2, '运营中心', '刘洋', '数字化工厂一期']]);
    expect(T.myTasksThisWeek(s, 'linxiao', NOW).map((t) => t.title)).toEqual(['上线培训计划编制']);
    const todos = T.computeTodos(s, 'linxiao', NOW);
    expect(T.homeCounts(todos, s, 'linxiao', 3, NOW)).toEqual({ todos: 5, dueToday: 0, overdue: 1, unread: 3 });
    expect(T.homeCounts(todos, s, 'zhouting', 0, NOW + 3 * DAY).dueToday).toBe(1);
  });
});
