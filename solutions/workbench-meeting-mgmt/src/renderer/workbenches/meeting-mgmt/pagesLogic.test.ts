import { describe, expect, it } from 'vitest';
import type { MmTaskView } from '../../../shared/meetingMgmt/types';
import {
  blockerView, buildChanges, dedupeBlockers, changeLog, defaultDrawerTab, eventText, filterTasks, groupTasks, initialChanges,
  nameOf, paginate, pct, pickUrl, projectRole, projectStepIndex, ratioPct, resolveProjectLink, sortTasks, taskBucket,
  taskLongStatus, taskRole, taskShortStatus, taskTone,
} from './pagesLogic';

function task(p: Partial<MmTaskView> & { id: string }): MmTaskView {
  return {
    projectId: 'p1', meetingId: 'm1', planItemId: 'i1', deptId: 'd1', assigneeId: 'u1', ownerId: 'u2',
    title: p.id, standard: '', due: '2026-12-01', status: 'not_started', percent: 0, createdAt: 1,
    objectionHistory: [], progressLog: [], events: [], reminders: {},
    overdue: false, overdueDays: 0, projectName: 'A2', meetingTitle: '周例会', deptName: '采购部', assigneeName: '周婷', ownerName: '刘洋',
    ...p,
  } as MmTaskView;
}
const objection = (stage: 'review' | 'dept_reply' | 'arbitration' | 'resolved') => ({
  id: 'o1', kind: 'objection' as const, target: 'time' as const, reason: '供应商晚到', suggestion: '延到 12-20', suggestedDue: '2026-12-20',
  raisedBy: 'u1', raisedAt: 10, prevStatus: 'to_accept' as const, stage,
});

describe('任务状态与分组', () => {
  it('异议处理中：短状态按阶段、长状态带「异议处理中」、红色、进「需要处理」', () => {
    const t = task({ id: 'a', status: 'in_progress', objection: objection('arbitration') });
    expect(taskShortStatus(t)).toBe('待裁决');
    expect(taskLongStatus(t)).toBe('异议处理中 · 待裁决');
    expect(taskTone(t)).toBe('bad');
    expect(taskBucket(t)).toBe('action');
    expect(taskShortStatus(task({ id: 'b', objection: objection('review') }))).toBe('待复核');
  });

  it('已结束的异议不算处理中', () => {
    const t = task({ id: 'a', status: 'in_progress', objection: objection('resolved') });
    expect(taskShortStatus(t)).toBe('进行中');
    expect(taskBucket(t)).toBe('doing');
  });

  it('待接收进「需要处理」、未开始 / 进行中进「进行中」、完成 / 取消进「已完成」并默认收起', () => {
    const list = [
      task({ id: 'accept', status: 'to_accept' }),
      task({ id: 'ns', status: 'not_started' }),
      task({ id: 'ip', status: 'in_progress' }),
      task({ id: 'done', status: 'done' }),
      task({ id: 'cx', status: 'cancelled' }),
    ];
    const g = groupTasks(list, 'status');
    expect(g.map((x) => [x.title, x.tasks.map((t) => t.id).sort()])).toEqual([
      ['需要处理', ['accept']],
      ['进行中', ['ip', 'ns']],
      ['已完成', ['cx', 'done']],
    ]);
    expect(g.find((x) => x.key === 'done')?.collapsedByDefault).toBe(true);
    expect(g.find((x) => x.key === 'doing')?.collapsedByDefault).toBe(false);
  });

  it('空分组不出现；按部门 / 项目分组用名字作标题', () => {
    const list = [task({ id: 'a', deptId: 'd2', deptName: '研发部' }), task({ id: 'b', deptId: 'd1', deptName: '采购部' })];
    expect(groupTasks(list, 'status').map((g) => g.key)).toEqual(['doing']);
    const byDept = groupTasks(list, 'dept');
    expect(byDept.map((g) => g.title).sort()).toEqual(['研发部', '采购部'].sort());
    expect(groupTasks(list, 'project')).toHaveLength(1);
  });

  it('组内排序：逾期在前，其次截止早的在前，结束的最后', () => {
    const sorted = sortTasks([
      task({ id: 'late', due: '2026-12-30' }),
      task({ id: 'done', status: 'done', due: '2026-01-01' }),
      task({ id: 'over', due: '2026-12-31', overdue: true, overdueDays: 2 }),
      task({ id: 'early', due: '2026-11-20' }),
    ]);
    expect(sorted.map((t) => t.id)).toEqual(['over', 'early', 'late', 'done']);
  });

  it('搜索：标题、来源会议、部门、人名都能命中', () => {
    const list = [task({ id: 'x', title: '主控芯片到货跟踪' }), task({ id: 'y', title: '夹具', assigneeName: '吴刚', deptName: '生产部' })];
    expect(filterTasks(list, '芯片').map((t) => t.id)).toEqual(['x']);
    expect(filterTasks(list, '吴刚').map((t) => t.id)).toEqual(['y']);
    expect(filterTasks(list, '  ')).toHaveLength(2);
  });
});

describe('异议调整与抽屉', () => {
  it('调整表单按异议建议的截止日预填，只提交改了的字段', () => {
    const t = task({ id: 'a', title: '主控芯片到货跟踪', standard: '到货 200 套', due: '2026-12-15', objection: objection('arbitration') });
    const init = initialChanges(t);
    expect(init.due).toBe('2026-12-20');
    expect(buildChanges(init, t)).toEqual({ due: '2026-12-20' });
    expect(buildChanges({ title: ' 主控芯片到货跟踪 ', standard: '到货 200 套', due: '2026-12-15' }, t)).toBeUndefined();
    expect(buildChanges({ title: '新标题', standard: '', due: '' }, t)).toEqual({ title: '新标题' });
  });

  it('轮到我处理异议 / 有处理中的异议时默认打开「异议与变更」', () => {
    const plain = task({ id: 'a' });
    expect(defaultDrawerTab(plain, { progress: true })).toBe('detail');
    expect(defaultDrawerTab(plain, { arbitrate: true })).toBe('objection');
    expect(defaultDrawerTab(task({ id: 'b', objection: objection('review') }), {})).toBe('objection');
  });

  it('变更记录只留异议相关事件、新的在前，文案按动作', () => {
    const log = changeLog([
      { at: 1, by: 'u1', action: 'created' },
      { at: 2, by: 'u1', action: 'objection_raised', note: '时间节点' },
      { at: 3, by: 'u2', action: 'review_reject' },
      { at: 4, by: 'u1', action: 'escalated' },
      { at: 5, by: 'u1', action: 'progress' },
    ]);
    expect(log.map((e) => e.action)).toEqual(['escalated', 'review_reject', 'objection_raised']);
    expect(eventText(log[0])).toBe('不接受驳回，提交裁决');
    expect(eventText({ action: 'review_reject' })).toBe('复核：驳回');
  });

  it('名字表兼容字符串和 { name } 两种写法', () => {
    expect(nameOf({ u1: '周婷', u2: { name: '刘洋', deptName: '计划部' } }, 'u2')).toBe('刘洋');
    expect(nameOf({ u1: '周婷' }, 'u1')).toBe('周婷');
    expect(nameOf({}, 'u9', '某人')).toBe('某人');
    expect(nameOf(undefined, 'u9')).toBe('u9');
  });
});

describe('身份胶囊上的角色', () => {
  it('任务：轮到谁处理显示谁，否则按部门负责人 → 任务负责人 → 项目负责人 → 项目成员', () => {
    const t = { assigneeId: 'u1', ownerId: 'u2' };
    expect(taskRole(t, 'u5', 'u5', { arbitrate: true })).toBe('项目负责人');
    expect(taskRole(t, 'u2', 'u5', { review: true })).toBe('任务负责人');
    expect(taskRole(t, 'u1', 'u5', { accept: true })).toBe('部门负责人');
    expect(taskRole(t, 'u1', 'u5')).toBe('部门负责人');
    expect(taskRole(t, 'u2', 'u5')).toBe('任务负责人');
    expect(taskRole(t, 'u5', 'u5')).toBe('项目负责人');
    expect(taskRole(t, 'u9', 'u5')).toBe('项目成员');
    expect(taskRole(t, undefined, 'u5')).toBe('');
  });
  it('项目：负责人 / 成员 / 都不是', () => {
    const p = { ownerId: 'u5', memberIds: ['u5', 'u1'] };
    expect(projectRole(p, 'u5')).toBe('项目负责人');
    expect(projectRole(p, 'u1')).toBe('项目成员');
    expect(projectRole(p, 'u9')).toBe('');
    expect(projectRole(null, 'u5')).toBe('');
  });
});

describe('项目', () => {
  it('状态进度条下标', () => {
    expect(projectStepIndex('active')).toBe(0);
    expect(projectStepIndex('closing')).toBe(1);
    expect(projectStepIndex('archived')).toBe(2);
  });

  it('结项前需处理：逾期任务标「逾期」去查看，异议去处理，会议去会议页', () => {
    const tasks = [{ id: 't1', overdue: true }, { id: 't2', overdue: false }];
    expect(blockerView({ kind: 'task', id: 't1', title: '', reason: '' }, tasks)).toMatchObject({ chip: '逾期', tone: 'bad', link: { kind: 'task', id: 't1' } });
    expect(blockerView({ kind: 'task', id: 't2', title: '', reason: '' }, tasks).chip).toBe('未完成');
    expect(blockerView({ kind: 'objection', id: 't3', title: '', reason: '' }, tasks)).toMatchObject({ chip: '异议', action: '去处理', link: { kind: 'task', id: 't3' } });
    expect(blockerView({ kind: 'meeting', id: 'm1', title: '', reason: '' })).toMatchObject({ link: { kind: 'meeting', id: 'm1' } });
    const arb = [{ id: 't5', overdue: false, objection: { ...objection('arbitration') } }];
    expect(blockerView({ kind: 'objection', id: 't5', title: '', reason: '' }, arb, { canArbitrate: true }).action).toBe('去裁决');
    expect(blockerView({ kind: 'objection', id: 't5', title: '', reason: '' }, arb).action).toBe('去处理');
  });

  it('结项清单：同一任务的「未完成」与「异议」只留异议', () => {
    const items = dedupeBlockers([
      { kind: 'task', id: 't1', title: 'a', reason: '任务状态：进行中' },
      { kind: 'objection', id: 't1', title: 'a', reason: '异议处理中' },
      { kind: 'task', id: 't2', title: 'b', reason: '任务状态：进行中' },
      { kind: 'meeting', id: 'm1', title: 'c', reason: '' },
    ]);
    expect(items.map((i) => `${i.kind}:${i.id}`)).toEqual(['objection:t1', 'task:t2', 'meeting:m1']);
    expect(dedupeBlockers(undefined)).toEqual([]);
  });

  it('首页链接 → 项目与页签', () => {
    expect(resolveProjectLink({ kind: 'project', id: 'p1' })).toEqual({ projectId: 'p1', tab: 'overview' });
    expect(resolveProjectLink({ kind: 'project_summary', id: 'p1' })).toEqual({ projectId: 'p1', tab: 'summary' });
    expect(resolveProjectLink({ kind: 'report', id: 'p1', anchor: 'r9' })).toEqual({ projectId: 'p1', reportId: 'r9', tab: 'reports' });
    expect(resolveProjectLink({ kind: 'task', id: 't1' })).toBeNull();
    expect(resolveProjectLink(undefined)).toBeNull();
  });
});

describe('通用', () => {
  it('百分比夹在 0~100', () => {
    expect(pct(62.4)).toBe(62);
    expect(pct(130)).toBe(100);
    expect(pct('x')).toBe(0);
    expect(ratioPct(16, 18)).toBe(89);
    expect(ratioPct(0, 0)).toBe(0);
  });

  it('分页越界自动夹住', () => {
    const list = Array.from({ length: 20 }, (_, i) => i);
    expect(paginate(list, 1, 8)).toMatchObject({ pages: 3, page: 1, rows: [0, 1, 2, 3, 4, 5, 6, 7] });
    expect(paginate(list, 9, 8)).toMatchObject({ page: 3, rows: [16, 17, 18, 19] });
    expect(paginate([], 1, 8)).toMatchObject({ pages: 1, page: 1, rows: [] });
  });

  it('链接返回值兼容字符串 / { url }', () => {
    expect(pickUrl('http://a')).toBe('http://a');
    expect(pickUrl({ url: 'http://b' })).toBe('http://b');
    expect(pickUrl({ link: 'http://c' })).toBe('http://c');
    expect(pickUrl(null)).toBe('');
  });
});
