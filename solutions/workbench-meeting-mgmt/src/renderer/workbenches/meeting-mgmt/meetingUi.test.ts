import { describe, expect, it } from 'vitest';
import type { MmHomeView, MmMeeting, MmTodo } from '../../../shared/meetingMgmt/types';
import {
  dueDayLabel, fmtDuration, fmtSize, fromLocalInput, greetingOf, groupPeopleByDept, groupTodos, homeRoleLabel,
  isOwnSegment, lastProgressAt, meetingRoleLabel, speakerName, toLocalInput, topicBlocks, topicNo, type MmMeetingDetail,
} from './meetingUi';

const todo = (id: string, group: MmTodo['group'], urgency: MmTodo['urgency'], at = 0, type: MmTodo['type'] = 'confirm_speech'): MmTodo => ({
  id, type, title: id, subtitle: '', urgency, link: { kind: 'meeting', id }, at, group,
});

function meeting(over: Partial<MmMeeting> = {}): MmMeeting {
  return {
    id: 'm1', projectId: 'p1', title: '周例会', time: 0, source: 'zoom', hostId: 'u1', attendeeIds: ['u1', 'u2', 'u3'], createdBy: 'u1', createdAt: 0,
    status: 'pending_review', files: [], speakers: [{ label: 'S1', personId: 'u1' }, { label: 'S2', personId: 'u2' }, { label: 'S3' }],
    segments: [
      { id: 'a', start: 0, end: 5, speakerLabel: 'S1', text: '一' },
      { id: 'b', start: 6, end: 9, speakerLabel: 'S2', text: '二' },
      { id: 'c', start: 10, end: 12, speakerLabel: 'S3', text: '三' },
      { id: 'd', start: 13, end: 15, speakerLabel: 'S2', text: '四' },
    ],
    topics: [{ id: 't1', title: '上线范围', segmentIds: ['a', 'b', 'zz'] }],
    decisions: [], summaryLines: [], confirmations: [], taskIds: [], ...over,
  };
}
function detail(over: Partial<MmMeetingDetail> = {}, m: Partial<MmMeeting> = {}): MmMeetingDetail {
  return {
    meeting: meeting(m), projectName: '数字化工厂一期', projectStatus: 'active',
    names: { u1: { name: '李娜', deptName: '运营中心' }, u2: { name: '赵磊', deptName: '研发部' }, u3: { name: '孙浩', deptName: '质量部' } },
    my: { isHost: false, isSpeaker: false, isPlanOwner: false, myLabels: [] }, confirm: { done: 0, total: 0 }, tasks: [], ...over,
  };
}

describe('首页待办分组', () => {
  const list = [
    todo('w1', 'task', 'week', 5), todo('u2', 'task', 'urgent', 9), todo('u1', 'project', 'urgent', 1),
    todo('t1', 'meeting', 'today', 3), todo('t2', 'meeting', 'today', 2),
  ];
  it('计数按全部 / 会议 / 任务 / 项目，筛选不影响计数', () => {
    const g = groupTodos(list, 'task');
    expect(g.counts).toEqual({ all: 5, meeting: 2, task: 2, project: 1 });
    expect(g.urgent.map((t) => t.id)).toEqual(['u2']);
    expect(g.today).toEqual([]);
    expect(g.week.map((t) => t.id)).toEqual(['w1']);
  });
  it('紧急 / 今天 / 本周分组，组内按时间先后', () => {
    const g = groupTodos(list, 'all');
    expect(g.urgent.map((t) => t.id)).toEqual(['u1', 'u2']);
    expect(g.today.map((t) => t.id)).toEqual(['t2', 't1']);
  });
  it('空列表 / 非数组不炸', () => {
    expect(groupTodos(undefined as unknown as MmTodo[], 'all').counts.all).toBe(0);
  });
});

describe('首页身份胶囊', () => {
  const base = (over: Partial<MmHomeView>): MmHomeView => ({
    me: { person: { id: 'u1', name: '林晓', deptId: 'd1' }, isAdmin: true, canCreateProject: true }, greetingName: '林晓',
    counts: { todos: 0, dueToday: 0, overdue: 0, unread: 0 }, todos: [], myTasksThisWeek: [], projects: [], recentMeetings: [], notices: [], ...over,
  });
  it('负责的项目优先显示项目负责人（原型 01 右上角）', () => {
    expect(homeRoleLabel(base({ projects: [{ id: 'p', name: 'A2', status: 'active', done: 0, total: 0, overdue: 0, ownerName: '林晓' }] }))).toBe('项目负责人');
  });
  it('否则按手上的待办推断', () => {
    expect(homeRoleLabel(base({ todos: [todo('x', 'meeting', 'today', 0, 'review_minutes')] }))).toBe('主持人');
    expect(homeRoleLabel(base({ todos: [todo('x', 'task', 'today', 0, 'accept_task')] }))).toBe('部门负责人');
    expect(homeRoleLabel(base({}))).toBe('管理员');
    expect(homeRoleLabel(base({ me: { person: null, isAdmin: false, canCreateProject: false } }))).toBe('项目成员');
  });
});

describe('格式', () => {
  it('问候语按钟点', () => {
    expect(greetingOf(8)).toBe('早上好');
    expect(greetingOf(12)).toBe('中午好');
    expect(greetingOf(15)).toBe('下午好');
    expect(greetingOf(21)).toBe('晚上好');
    expect(greetingOf(2)).toBe('晚上好');
  });
  it('截止日：今天 / 明天 / 周几', () => {
    const now = new Date(2026, 10, 11, 10).getTime(); // 2026-11-11 周三
    expect(dueDayLabel('2026-11-11', now)).toEqual({ day: '今天', md: '11-11' });
    expect(dueDayLabel('2026-11-12', now)).toEqual({ day: '明天', md: '11-12' });
    expect(dueDayLabel('2026-11-13', now)).toEqual({ day: '周五', md: '11-13' });
    expect(dueDayLabel('bad', now)).toEqual({ day: '', md: 'bad' });
  });
  it('时长 / 大小 / 时间输入框互转', () => {
    expect(fmtDuration(52 * 60)).toBe('52 分钟');
    expect(fmtDuration(67 * 60)).toBe('1 小时 07 分');
    expect(fmtDuration(0)).toBe('');
    expect(fmtSize(3 * 1024 * 1024)).toBe('3.0 MB');
    const ms = new Date(2026, 10, 9, 14, 0).getTime();
    expect(toLocalInput(ms)).toBe('2026-11-09T14:00');
    expect(fromLocalInput('2026-11-09T14:00')).toBe(ms);
    expect(Number.isNaN(fromLocalInput(''))).toBe(true);
  });
  it('议题序号：中文界面用一二三', () => {
    expect(topicNo(0)).toBe('一');
    expect(topicNo(9)).toBe('十');
    expect(topicNo(11)).toBe('十二');
    expect(topicNo(20)).toBe('二十一');
  });
});

describe('会议详情', () => {
  it('议题分块：丢掉不存在的段；没归到议题的收进「其他发言」；列出发言人', () => {
    const blocks = topicBlocks(detail());
    expect(blocks.map((b) => b.id)).toEqual(['t1', '__rest']);
    expect(blocks[0].segmentIds).toEqual(['a', 'b']);
    expect(blocks[0].speakers).toEqual(['李娜', '赵磊']);
    expect(blocks[1].title).toBe('其他发言');
    expect(blocks[1].segmentIds).toEqual(['c', 'd']);
    expect(blocks[1].speakers).toEqual(['未识别 S3', '赵磊']);
  });
  it('没有议题时全部发言一块', () => {
    const blocks = topicBlocks(detail({}, { topics: [] }));
    expect(blocks).toHaveLength(1);
    expect(blocks[0].title).toBe('全部发言');
  });
  it('本人段：myLabels 或指认到本人', () => {
    const d = detail({ my: { isHost: false, isSpeaker: true, isPlanOwner: false, myLabels: ['S3'] } });
    expect(isOwnSegment(d, 'S3', 'u9')).toBe(true);
    expect(isOwnSegment(d, 'S2', 'u2')).toBe(true);
    expect(isOwnSegment(d, 'S1', 'u2')).toBe(false);
    expect(speakerName(d, 'S1')).toBe('李娜');
  });
  it('身份胶囊：方案阶段的任务负责人优先，其次主持人', () => {
    expect(meetingRoleLabel(detail({ my: { isHost: true, isSpeaker: true, isPlanOwner: false, myLabels: [] } }), 'u1')).toBe('主持人');
    expect(meetingRoleLabel(detail({ my: { isHost: true, isSpeaker: false, isPlanOwner: true, myLabels: [] } }, { status: 'plan_confirm' }), 'u1')).toBe('任务负责人');
    expect(meetingRoleLabel(detail(), 'u3')).toBe('参会人');
    expect(meetingRoleLabel(detail(), 'u9')).toBe('项目成员');
  });
  it('处理进度最后动静：事件 > 日志 > 开始时间', () => {
    const p = { stage: 'transcribe' as const, progress: 10, startedAt: 100, log: [{ at: 200, text: 'x' }] };
    expect(lastProgressAt(p)).toBe(200);
    expect(lastProgressAt(p, 300)).toBe(300);
    expect(lastProgressAt(undefined)).toBeUndefined();
  });
});

describe('人员按部门分组', () => {
  const src = {
    depts: [{ id: 'd1', name: '研发部', leaderIds: [] }, { id: 'd2', name: '采购部', leaderIds: [] }],
    people: [
      { id: 'a', name: '赵磊', deptId: 'd1' }, { id: 'b', name: '周婷', deptId: 'd2' },
      { id: 'c', name: '离职者', deptId: 'd1', left: true }, { id: 'e', name: '外援', deptId: 'dx' },
    ],
  };
  it('不含离职；没有部门的归「其他」；搜索只留命中的', () => {
    expect(groupPeopleByDept(src).map((g) => [g.name, g.people.map((p) => p.id)])).toEqual([['研发部', ['a']], ['采购部', ['b']], ['其他', ['e']]]);
    expect(groupPeopleByDept(src, '周').map((g) => g.name)).toEqual(['采购部']);
  });
});
