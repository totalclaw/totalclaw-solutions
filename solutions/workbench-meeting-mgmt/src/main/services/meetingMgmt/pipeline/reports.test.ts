import { describe, expect, it } from 'vitest';
import type { MmMeeting, MmObjection, MmOrg, MmProject, MmTask, MmTaskStatus } from '../../../../shared/meetingMgmt/types';
import { buildReportStats, generateProjectSummary, generateWeeklyReport, isTaskOverdue } from './reports';

const day = (s: string, h = 12) => { const [y, m, d] = s.split('-').map(Number) as [number, number, number]; return new Date(y, m - 1, d, h).getTime(); };
const NOW = day('2026-11-16');

function task(id: string, status: MmTaskStatus, due: string, extra: Partial<MmTask> = {}): MmTask {
  return {
    id, projectId: 'p1', meetingId: 'm1', planItemId: id, deptId: 'd-rd', assigneeId: 'u2', ownerId: 'u1', title: `任务${id}`, standard: '', due,
    status, percent: status === 'done' ? 100 : 30, createdAt: day('2026-11-01'), objectionHistory: [], progressLog: [], events: [], reminders: {}, ...extra,
  };
}

const org: MmOrg = { source: 'demo', depts: [{ id: 'd-rd', name: '研发部', leaderIds: [] }, { id: 'd-qa', name: '测试部', leaderIds: [] }], people: [{ id: 'u1', name: '林晓', deptId: 'd-rd' }, { id: 'u2', name: '王建国', deptId: 'd-rd' }] };
const project: MmProject = { id: 'p1', name: '二期', desc: '二期上线', ownerId: 'u1', memberIds: ['u1', 'u2'], status: 'active', createdAt: day('2026-10-01'), createdBy: 'u1', weeklyReports: [] };

const objection: MmObjection = {
  id: 'o1', kind: 'change', target: 'time', reason: '依赖接口延期', suggestion: '延后一周', raisedBy: 'u2', raisedAt: day('2026-11-12'), prevStatus: 'in_progress',
  stage: 'resolved', arbitration: { by: 'u1', at: day('2026-11-13'), decision: 'adjust', note: '' }, outcome: 'adjusted', resolvedAt: day('2026-11-13'),
};

const tasks: MmTask[] = [
  task('1', 'done', '2026-11-10', { doneAt: day('2026-11-09') }),                 // 按期
  task('2', 'done', '2026-11-10', { doneAt: day('2026-11-12'), deptId: 'd-qa' }), // 延期
  task('3', 'in_progress', '2026-11-14'),                                         // 逾期
  task('4', 'not_started', '2026-11-16'),                                         // 今天到期，不算逾期
  task('5', 'to_accept', '2026-11-01'),                                           // 待接收不算逾期
  task('6', 'cancelled', '2026-11-05', { objectionHistory: [objection] }),
];

describe('buildReportStats', () => {
  it('完成率不算已取消；逾期只看未开始 / 进行中且过了截止日当天', () => {
    expect(buildReportStats(tasks, NOW)).toEqual({ total: 6, done: 2, cancelled: 1, overdue: 1, onTime: 1, late: 1, completionRate: 40 });
    expect(isTaskOverdue(tasks[3]!, NOW)).toBe(false);
    expect(isTaskOverdue(tasks[3]!, day('2026-11-17', 0))).toBe(true);
    expect(buildReportStats([], NOW).completionRate).toBe(0);
    expect(buildReportStats([task('x', 'cancelled', '2026-11-01')], NOW).completionRate).toBe(100);
  });
});

describe('generateWeeklyReport', () => {
  const meetings: MmMeeting[] = [];
  it('数字由代码算；模型叙述里对不上的句子删掉', async () => {
    let prompt = '';
    const llm = async (p: string) => {
      prompt = p;
      return JSON.stringify({ progress: '本期完成 2 项任务。累计完成率 40%。研发部还有 7 项没做完。', focus: '## 标题\n逾期的任务需要尽快跟进。' });
    };
    const r = await generateWeeklyReport({ project, meetings, tasks, org, from: day('2026-11-09', 0), to: NOW, llm });
    expect(r.kind).toBe('weekly');
    expect(r.stats.completionRate).toBe(40);
    expect(prompt).toContain('"completionRate":40');
    expect(r.markdown).toContain('本期完成 2 项任务。累计完成率 40%。');
    expect(r.markdown).not.toContain('7 项没做完');
    expect(r.markdown).not.toContain('## 标题');
    expect(r.markdown).toContain('| 任务3 | 研发部 | 2026-11-14 | 2 | 30% |');
    expect(r.markdown).toContain('| 测试部 | 1 / 1 | 100% |');
    expect(r.periodFrom).toBe(day('2026-11-09', 0));
  });

  it('模型不可用：叙述用代码模板，报告照样完整', async () => {
    const r = await generateWeeklyReport({ project, meetings, tasks, org, from: day('2026-11-09', 0), to: NOW, llm: async () => null });
    expect(r.markdown).toContain('本期完成 2 项任务，新增 0 项，累计完成率 40%。');
    expect(r.markdown).toContain('目前有 1 项任务逾期');
    expect(r.markdown).toContain('本期新提出 1 项，处理完 1 项，仍在处理 0 项。');
  });
});

describe('generateProjectSummary', () => {
  it('概况、关键决策、按期 / 延期、变更与裁决记录由代码生成；模型只写总结', async () => {
    const meetings = [{
      id: 'm1', projectId: 'p1', title: '启动会', time: day('2026-10-10'), source: 'offline', hostId: 'u1', attendeeIds: [], createdBy: 'u1', createdAt: 0,
      status: 'dispatched', files: [], speakers: [], segments: [], topics: [], summaryLines: [], confirmations: [], taskIds: [],
      decisions: [{ id: 'dc_1', text: '11 月底上线', segmentIds: [] }],
    }] as MmMeeting[];
    const llm = async () => JSON.stringify({ overall: '项目共派发 6 项任务，整体按计划推进。', lessons: '有 9 项任务延期。依赖接口要提前确认。' });
    const r = await generateProjectSummary({ project, meetings, tasks, org, llm });
    expect(r.kind).toBe('summary');
    expect(r.markdown).toContain('1. 11 月底上线（2026-10-10 启动会）');
    expect(r.markdown).toContain('按期完成 1 项，延期完成 1 项，已取消 1 项，未完成 3 项');
    expect(r.markdown).toContain('| 任务2 | 测试部 | 2026-11-10 | 2026-11-12 | 2 |');
    expect(r.markdown).toMatch(/\| 任务6 \| 申请变更（经裁决） \| 时间 \| 依赖接口延期 \| 按异议调整 \|/);
    expect(r.markdown).toContain('项目共派发 6 项任务，整体按计划推进。');
    expect(r.markdown).not.toContain('9 项');
    expect(r.markdown).toContain('依赖接口要提前确认。');
  });

  it('模型不可用也能出完整总结', async () => {
    const r = await generateProjectSummary({ project, meetings: [], tasks, org, llm: async () => null });
    expect(r.markdown).toContain('项目共召开 0 场会议，形成 0 项决议，派发 6 项任务，按期完成 1 项、延期完成 1 项。');
    expect(r.markdown).toContain('有 1 项任务延期完成');
  });
});
