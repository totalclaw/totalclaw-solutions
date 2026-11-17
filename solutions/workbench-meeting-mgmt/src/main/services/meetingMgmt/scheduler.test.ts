import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { MmConfirmation, MmMeeting, MmProject, MmReport, MmSettings, MmTask } from '../../../shared/meetingMgmt/types';
import { MM_DEFAULT_SETTINGS } from '../../../shared/meetingMgmt/types';
import { DAILY_REMIND_HOUR, MEETING_SCHEDULER_FIRST_TICK_MS, QUIET_HOUR, daysUntil, dueReminders, localDay, startMeetingScheduler, type ReminderAction } from './scheduler';

const HOUR = 3_600_000;
const DAY = 86_400_000;
/** 本地时间（按当前时区） */
const L = (y: number, mo: number, d: number, h = 0, mi = 0): number => new Date(y, mo - 1, d, h, mi).getTime();

const settings = (over: Partial<MmSettings> = {}): MmSettings => ({ ...MM_DEFAULT_SETTINGS, ...over });
const project = (over: Partial<MmProject> = {}): MmProject => ({
  id: 'p1', name: '官网改版', desc: '', ownerId: 'boss', memberIds: [], status: 'active', createdAt: L(2026, 11, 1, 10), createdBy: 'boss', weeklyReports: [], ...over,
});
const meeting = (confirmations: MmConfirmation[], over: Partial<MmMeeting> = {}): MmMeeting => ({
  id: 'm1', projectId: 'p1', title: '评审会', time: L(2026, 11, 10, 9), source: 'offline', hostId: 'host', attendeeIds: [], createdBy: 'host', createdAt: L(2026, 11, 10, 9),
  status: 'pending_confirm', files: [], process: { stage: 'done', progress: 100, finishedAt: L(2026, 11, 10, 12), log: [] }, speakers: [], segments: [], topics: [], decisions: [],
  summaryLines: [], confirmations, taskIds: [], ...over,
});
const task = (over: Partial<MmTask> = {}): MmTask => ({
  id: 't1', projectId: 'p1', meetingId: 'm1', planItemId: 'i1', deptId: 'd1', assigneeId: 'dept', ownerId: 'owner', title: '接口联调', standard: '', due: '2026-11-20',
  status: 'not_started', percent: 0, createdAt: L(2026, 11, 16, 10), acceptedAt: L(2026, 11, 16, 11), objectionHistory: [], progressLog: [], events: [], reminders: {}, ...over,
});
type S = Parameters<typeof dueReminders>[0];
const state = (o: Partial<S>): S => ({ meetings: [], tasks: [], projects: [project()], settings: settings(), ...o });
const kinds = (a: ReminderAction[]) => a.map((x) => x.kind);
/** 只看任务提醒（默认项目是进行中的，会顺带出周报动作） */
const taskReminders = (s: S, now: number) => dueReminders(s, now).filter((a) => a.kind !== 'weekly_report');

describe('发言确认催办', () => {
  const c = (over: Partial<MmConfirmation> = {}): MmConfirmation => ({ personId: 'lin', status: 'pending', ...over });
  const start = L(2026, 11, 10, 12); // 处理完成 = 发起确认

  it('超过 24 小时未确认才催；状态不变（只出动作）', () => {
    const s = state({ meetings: [meeting([c()])] });
    expect(dueReminders(s, start + 24 * HOUR - 1)).toEqual([]);
    expect(dueReminders(s, start + 24 * HOUR)).toEqual([{ kind: 'speech_remind', meetingId: 'm1', personId: 'lin', waitedHours: 24 }]);
    expect(s.meetings[0].confirmations[0].status).toBe('pending');
  });

  it('催过之后每再过一个时限催一次', () => {
    const remindedAt = start + 24 * HOUR + 5 * 60_000;
    const s = state({ meetings: [meeting([c({ remindedAt })])] });
    expect(dueReminders(s, remindedAt + 23 * HOUR)).toEqual([]);
    expect(dueReminders(s, remindedAt + 24 * HOUR)).toMatchObject([{ kind: 'speech_remind', personId: 'lin', waitedHours: 48 }]);
  });

  it('夜里到点不发（21 点到次日 9 点），顺延到早上 9 点；下一次从早上那次算', () => {
    const night = L(2026, 11, 10, 22); // 晚上 22 点处理完
    const s = state({ meetings: [{ ...meeting([c()]), process: { stage: 'done', progress: 100, finishedAt: night, log: [] } } as MmMeeting] });
    expect(dueReminders(s, L(2026, 11, 11, 22))).toEqual([]); // 满 24 小时，但在夜里
    expect(dueReminders(s, L(2026, 11, 12, DAILY_REMIND_HOUR - 1, 59))).toEqual([]);
    expect(dueReminders(s, L(2026, 11, 12, DAILY_REMIND_HOUR))).toMatchObject([{ kind: 'speech_remind', waitedHours: 35 }]);
    const reminded = state({ meetings: [{ ...meeting([c({ remindedAt: L(2026, 11, 11, 9) })]), process: { stage: 'done', progress: 100, finishedAt: L(2026, 11, 10, 1), log: [] } } as MmMeeting] });
    expect(dueReminders(reminded, L(2026, 11, 12, 9))).toHaveLength(1);
    expect(dueReminders(reminded, L(2026, 11, 12, QUIET_HOUR - 1, 59))).toHaveLength(1);
    expect(dueReminders(reminded, L(2026, 11, 12, QUIET_HOUR))).toEqual([]);
  });

  it('被退回：从退回时间重新计时（之前的催办不算）', () => {
    const returnedAt = start + 30 * HOUR;
    const s = state({ meetings: [meeting([c({ remindedAt: start + 24 * HOUR, returnedAt })])] });
    expect(dueReminders(s, returnedAt + 23 * HOUR)).toEqual([]);
    expect(dueReminders(s, returnedAt + 24 * HOUR)).toHaveLength(1);
  });

  it('发起确认时间有 requestedAt 时以它为准（处理完成后又等了主持人指认）', () => {
    const requestedAt = start + 48 * HOUR;
    const s = state({ meetings: [meeting([{ ...c(), requestedAt } as MmConfirmation])] });
    expect(dueReminders(s, requestedAt + 1 * HOUR)).toEqual([]);
    expect(dueReminders(s, requestedAt + 24 * HOUR)).toHaveLength(1);
  });

  it('已确认 / 会议不在待确认 / 项目已归档：不催', () => {
    const late = start + 100 * HOUR;
    expect(dueReminders(state({ meetings: [meeting([c({ status: 'confirmed', confirmedAt: start + HOUR })])] }), late)).toEqual([]);
    expect(dueReminders(state({ meetings: [meeting([c()], { status: 'pending_review' })] }), late)).toEqual([]);
    expect(dueReminders(state({ meetings: [meeting([c()])], projects: [project({ status: 'archived' })] }), late)).toEqual([]);
  });

  it('时限按设置；多人各算各的', () => {
    // start = 12:00；都在白天里比
    const s = state({ meetings: [meeting([c(), c({ personId: 'zhou', remindedAt: start + 4 * HOUR })])], settings: settings({ confirmTimeoutHours: 3 }) });
    expect(dueReminders(s, start + 3 * HOUR).map((a) => (a as { personId: string }).personId)).toEqual(['lin']);
    expect(dueReminders(s, start + 7 * HOUR).map((a) => (a as { personId: string }).personId)).toEqual(['lin', 'zhou']);
  });
});

describe('任务到期 / 逾期 / 进度提醒', () => {
  it('「待接收」不计逾期、不提醒（风险 D）；已完成 / 已取消不管', () => {
    const late = L(2026, 12, 25, 10);
    for (const status of ['to_accept', 'done', 'cancelled'] as const) {
      expect(taskReminders(state({ tasks: [task({ status })] }), late)).toEqual([]);
    }
  });

  it('到期提醒：截止前 1 天（本地日期）9 点后发一次，发给部门负责人', () => {
    const s = state({ tasks: [task()] });
    expect(taskReminders(s, L(2026, 11, 18, 10))).toEqual([]); // 还有 2 天
    expect(taskReminders(s, L(2026, 11, 19, DAILY_REMIND_HOUR - 1, 59))).toEqual([]); // 没到 9 点：也不先发进度提醒
    expect(taskReminders(s, L(2026, 11, 19, DAILY_REMIND_HOUR, 0))).toEqual([{ kind: 'task_due_remind', taskId: 't1', notify: ['dept'], daysLeft: 1 }]);
  });

  it('到期提醒只发一次：截止当天不再发；截止日调整后按新日期再发', () => {
    const dueAt = L(2026, 11, 19, 9, 5);
    expect(taskReminders(state({ tasks: [task({ reminders: { dueAt } })] }), L(2026, 11, 20, 15))).toEqual([]);
    const moved = task({ due: '2026-11-27', reminders: { dueAt } });
    expect(taskReminders(state({ tasks: [moved] }), L(2026, 11, 25, 10))).toEqual([]);
    expect(kinds(taskReminders(state({ tasks: [moved] }), L(2026, 11, 26, 10)))).toEqual(['task_due_remind']);
  });

  it('当天新建、当天到期：也提醒一次（截止当天 daysLeft=0）', () => {
    const t = task({ due: '2026-11-16', createdAt: L(2026, 11, 16, 8), acceptedAt: L(2026, 11, 16, 9) });
    expect(taskReminders(state({ tasks: [t] }), L(2026, 11, 16, 9, 30))).toMatchObject([{ kind: 'task_due_remind', daysLeft: 0 }]);
  });

  it('dueRemindDays 可改：提前 3 天', () => {
    const s = state({ tasks: [task()], settings: settings({ dueRemindDays: 3 }) });
    expect(taskReminders(s, L(2026, 11, 16, 12))).toEqual([]);
    expect(taskReminders(s, L(2026, 11, 17, 12))).toMatchObject([{ kind: 'task_due_remind', daysLeft: 3 }]);
  });

  it('逾期：截止日当天 23:59 不算；次日 9 点后提醒，同时通知任务负责人；每天一次', () => {
    const t = task({ reminders: { dueAt: L(2026, 11, 19, 9) } });
    expect(taskReminders(state({ tasks: [t] }), L(2026, 11, 20, 23, 59))).toEqual([]);
    expect(taskReminders(state({ tasks: [t] }), L(2026, 11, 21, 8, 59))).toEqual([]);
    expect(taskReminders(state({ tasks: [t] }), L(2026, 11, 21, 9))).toEqual([{ kind: 'task_overdue', taskId: 't1', notify: ['dept', 'owner'], overdueDays: 1 }]);
    const reminded = task({ reminders: { overdueAt: L(2026, 11, 21, 9) } });
    expect(taskReminders(state({ tasks: [reminded] }), L(2026, 11, 21, 20))).toEqual([]);
    expect(taskReminders(state({ tasks: [reminded] }), L(2026, 11, 22, 9, 10))).toMatchObject([{ kind: 'task_overdue', overdueDays: 2 }]);
  });

  it('部门负责人和任务负责人是同一人：逾期只通知一次', () => {
    const t = task({ ownerId: 'dept' });
    expect(taskReminders(state({ tasks: [t] }), L(2026, 11, 22, 10))).toMatchObject([{ kind: 'task_overdue', notify: ['dept'] }]);
  });

  it('逾期后不再单发进度提醒（逾期提醒每天在催）', () => {
    const t = task({ acceptedAt: L(2026, 10, 1, 10), createdAt: L(2026, 10, 1, 9), reminders: { overdueAt: L(2026, 12, 1, 9) } });
    expect(taskReminders(state({ tasks: [t] }), L(2026, 12, 1, 15))).toEqual([]);
  });

  it('异议处理期间照常计时：进行中的任务有异议也照发逾期提醒', () => {
    const t = task({
      status: 'in_progress',
      objection: { id: 'o1', kind: 'change', target: 'time', reason: '太紧', suggestion: '延期', raisedBy: 'dept', raisedAt: L(2026, 11, 19, 10), prevStatus: 'in_progress', stage: 'review' },
    });
    expect(kinds(taskReminders(state({ tasks: [t] }), L(2026, 11, 21, 10)))).toEqual(['task_overdue']);
  });

  it('进度提醒：从接收起每 7 天一次；更新过进度从更新时间算；提醒过从提醒时间算', () => {
    const acceptedAt = L(2026, 11, 1, 10);
    const base = task({ due: '2026-12-31', createdAt: L(2026, 11, 1, 9), acceptedAt });
    expect(taskReminders(state({ tasks: [base] }), acceptedAt + 7 * DAY - 1)).toEqual([]);
    expect(taskReminders(state({ tasks: [base] }), acceptedAt + 7 * DAY)).toEqual([{ kind: 'task_progress_remind', taskId: 't1', notify: ['dept'] }]);

    const updated = task({ ...base, status: 'in_progress', progressLog: [{ at: acceptedAt + 5 * DAY, by: 'dept', status: 'in_progress', percent: 30, note: '' }] });
    expect(taskReminders(state({ tasks: [updated] }), acceptedAt + 7 * DAY)).toEqual([]);
    expect(taskReminders(state({ tasks: [updated] }), acceptedAt + 12 * DAY)).toHaveLength(1);

    const reminded = task({ ...base, reminders: { weeklyAt: acceptedAt + 7 * DAY } });
    expect(taskReminders(state({ tasks: [reminded] }), acceptedAt + 13 * DAY)).toEqual([]);
    expect(taskReminders(state({ tasks: [reminded] }), acceptedAt + 14 * DAY)).toHaveLength(1);
  });

  it('跟踪周期可改；没有 acceptedAt 时（维持原方案直接变未开始）从裁决事件算起', () => {
    const at = L(2026, 11, 5, 10);
    const t = task({ due: '2026-12-31', createdAt: L(2026, 11, 1, 9), acceptedAt: undefined, events: [{ at, by: 'boss', action: 'arbitrate_keep' }] });
    const s = state({ tasks: [t], settings: settings({ trackCycleDays: 3 }) });
    expect(taskReminders(s, at + 3 * DAY - 1)).toEqual([]);
    expect(kinds(taskReminders(s, at + 3 * DAY))).toEqual(['task_progress_remind']);
  });

  it('到期提醒刚发过：不紧接着再发进度提醒', () => {
    const t = task({ acceptedAt: L(2026, 11, 10, 10), reminders: { dueAt: L(2026, 11, 19, 9) } });
    expect(taskReminders(state({ tasks: [t] }), L(2026, 11, 20, 10))).toEqual([]);
  });

  it('截止日写错：只按进度周期提醒，不报错', () => {
    const t = task({ due: '2026-13-45', acceptedAt: L(2026, 11, 1, 10) });
    expect(kinds(taskReminders(state({ tasks: [t] }), L(2026, 11, 9, 10)))).toEqual(['task_progress_remind']);
  });

  it('已归档项目的任务不提醒', () => {
    expect(taskReminders(state({ tasks: [task()], projects: [project({ status: 'archived' })] }), L(2026, 11, 25, 10))).toEqual([]);
  });
});

describe('进度汇总报告', () => {
  const firstTaskAt = L(2026, 11, 3, 10);
  const tasks = [task({ createdAt: firstTaskAt, due: '2026-12-31' }), task({ id: 't2', ownerId: 'owner2', createdAt: L(2026, 11, 4, 10), due: '2026-12-31' }), task({ id: 't3', ownerId: 'gone', status: 'cancelled', due: '2026-12-31' })];
  const report = (generatedAt: number, periodTo = generatedAt): MmReport => ({ id: 'r', kind: 'weekly', generatedAt, periodTo, markdown: '', stats: { total: 0, done: 0, cancelled: 0, overdue: 0, onTime: 0, late: 0, completionRate: 0 } });
  const only = (a: ReminderAction[]) => a.filter((x) => x.kind === 'weekly_report');

  it('第一份：项目里第一个任务下发满一个周期；接收人 = 项目负责人 + 各任务负责人（不含已取消）', () => {
    const s = state({ tasks });
    expect(only(dueReminders(s, firstTaskAt + 7 * DAY - 1))).toEqual([]);
    expect(only(dueReminders(s, firstTaskAt + 7 * DAY))).toEqual([{
      kind: 'weekly_report', projectId: 'p1', periodFrom: project().createdAt, periodTo: firstTaskAt + 7 * DAY, notify: ['boss', 'owner', 'owner2'],
    }]);
  });

  it('之后从上一份周报算起，区间接上一份的截止', () => {
    const last = L(2026, 11, 10, 10);
    const s = state({ tasks, projects: [project({ weeklyReports: [report(L(2026, 11, 3, 10)), report(last, last - HOUR)] })] });
    expect(only(dueReminders(s, last + 7 * DAY - 1))).toEqual([]);
    expect(only(dueReminders(s, last + 7 * DAY))).toMatchObject([{ periodFrom: last - HOUR, periodTo: last + 7 * DAY }]);
  });

  it('周期可改；项目里还没有任务 / 结项中 / 已归档：不生成', () => {
    expect(only(dueReminders(state({ tasks, settings: settings({ reportCycleDays: 14 }) }), firstTaskAt + 13 * DAY))).toEqual([]);
    expect(only(dueReminders(state({ tasks, settings: settings({ reportCycleDays: 14 }) }), firstTaskAt + 14 * DAY))).toHaveLength(1);
    expect(only(dueReminders(state({ tasks: [] }), L(2027, 1, 1)))).toEqual([]);
    expect(only(dueReminders(state({ tasks, projects: [project({ status: 'closing' })] }), L(2027, 1, 1)))).toEqual([]);
    expect(only(dueReminders(state({ tasks, projects: [project({ status: 'archived' })] }), L(2027, 1, 1)))).toEqual([]);
  });
});

describe('参数异常时用默认值', () => {
  it('设置里是 0 / 负数 / 非数字 → 按默认（24 小时、1 天、7 天、7 天）', () => {
    const bad = settings({ confirmTimeoutHours: 0, dueRemindDays: -1, trackCycleDays: Number.NaN, reportCycleDays: 'x' as unknown as number });
    const start = L(2026, 11, 10, 12);
    const s = state({ meetings: [meeting([{ personId: 'lin', status: 'pending' }])], tasks: [task()], settings: bad });
    expect(kinds(taskReminders(s, start + 23 * HOUR))).toEqual([]);
    expect(kinds(taskReminders(s, L(2026, 11, 19, 10)))).toEqual(['speech_remind', 'task_due_remind']);
  });
});

describe('截止日按本地日期理解（不同时区）', () => {
  const saved = process.env.TZ;
  afterAll(() => { if (saved === undefined) delete process.env.TZ; else process.env.TZ = saved; });

  const OFFSET: Record<string, number> = { 'Asia/Shanghai': -480, 'America/Los_Angeles': 480, UTC: 0, 'Pacific/Kiritimati': -840 };
  for (const tz of Object.keys(OFFSET)) {
    describe(tz, () => {
      beforeAll(() => { process.env.TZ = tz; });

      it('本地零点前后：localDay / daysUntil 按本地日历，不按 UTC', () => {
        // 先确认时区真的切过去了（否则下面的断言只是在本机时区里重复跑）
        expect(new Date(L(2026, 11, 20, 12)).getTimezoneOffset()).toBe(OFFSET[tz]);
        expect(localDay(L(2026, 11, 20, 0, 0))).toBe('2026-11-20');
        expect(localDay(L(2026, 11, 20, 23, 59))).toBe('2026-11-20');
        expect(daysUntil('2026-11-20', L(2026, 11, 20, 0, 1))).toBe(0);
        expect(daysUntil('2026-11-20', L(2026, 11, 20, 23, 59))).toBe(0);
        expect(daysUntil('2026-11-20', L(2026, 11, 21, 0, 1))).toBe(-1);
        expect(daysUntil('2026-11-20', L(2026, 11, 19, 23, 59))).toBe(1);
      });

      it('截止当天深夜不逾期，次日 9 点后逾期', () => {
        const t = task({ reminders: { dueAt: L(2026, 11, 19, 9) } });
        expect(taskReminders(state({ tasks: [t] }), L(2026, 11, 20, 23, 30))).toEqual([]);
        expect(kinds(taskReminders(state({ tasks: [t] }), L(2026, 11, 21, 9, 30)))).toEqual(['task_overdue']);
      });
    });
  }

  describe('夏令时（America/New_York，2026-03-08 起）', () => {
    beforeAll(() => { process.env.TZ = 'America/New_York'; });
    it('跨夏令时切换的那一天天数也对', () => {
      expect(daysUntil('2026-03-09', L(2026, 3, 8, 10))).toBe(1);
      expect(daysUntil('2026-03-09', L(2026, 3, 7, 23, 30))).toBe(2);
      expect(daysUntil('2026-11-02', L(2026, 11, 1, 1, 30))).toBe(1); // 冬令时切换日
    });
  });
});

describe('startMeetingScheduler', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('启动 30 秒后跑第一轮，之后每 10 分钟一轮；停止后不再跑', async () => {
    vi.useFakeTimers();
    const tick = vi.fn();
    const stop = startMeetingScheduler(tick);
    await vi.advanceTimersByTimeAsync(MEETING_SCHEDULER_FIRST_TICK_MS - 1);
    expect(tick).toHaveBeenCalledTimes(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(tick).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(10 * 60_000 - 1);
    expect(tick).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(tick).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(tick).toHaveBeenCalledTimes(3);
    stop();
    stop(); // 可重复调用
    await vi.advanceTimersByTimeAsync(60 * 60_000);
    expect(tick).toHaveBeenCalledTimes(3);
  });

  it('周期比 30 秒短：第一轮在一个周期后，且不会同一时刻跑两次', async () => {
    vi.useFakeTimers();
    const tick = vi.fn();
    const stop = startMeetingScheduler(tick, 1000);
    await vi.advanceTimersByTimeAsync(1000);
    expect(tick).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(tick).toHaveBeenCalledTimes(2);
    stop();
  });

  it('第一轮之前就停止：一轮都不跑', async () => {
    vi.useFakeTimers();
    const tick = vi.fn();
    startMeetingScheduler(tick)();
    await vi.advanceTimersByTimeAsync(60 * 60_000);
    expect(tick).not.toHaveBeenCalled();
  });

  it('上一轮没跑完跳过这一轮；tick 抛错不影响下一轮', async () => {
    vi.useFakeTimers();
    let release!: () => void;
    let n = 0;
    const tick = vi.fn(() => {
      n += 1;
      if (n === 1) return new Promise<void>((r) => { release = r; });
      if (n === 2) throw new Error('boom');
      return undefined;
    });
    const stop = startMeetingScheduler(tick, 1000);
    await vi.advanceTimersByTimeAsync(1000); // 第一轮开始（挂住）
    await vi.advanceTimersByTimeAsync(3000); // 期间的几轮都跳过
    expect(tick).toHaveBeenCalledTimes(1);
    release();
    await vi.advanceTimersByTimeAsync(1000); // 第二轮抛错
    await vi.advanceTimersByTimeAsync(1000); // 第三轮照跑
    expect(tick).toHaveBeenCalledTimes(3);
    stop();
  });

  it('定时器 unref，不拖住进程退出', async () => {
    const st = vi.spyOn(globalThis, 'setTimeout');
    const si = vi.spyOn(globalThis, 'setInterval');
    const tick = vi.fn();
    const stop = startMeetingScheduler(tick, 7);
    const firstIdx = st.mock.calls.findIndex((c) => c[1] === 7);
    await new Promise((r) => setTimeout(r, 40));
    const intervalIdx = si.mock.calls.findIndex((c) => c[1] === 7);
    const first = st.mock.results[firstIdx].value as { hasRef(): boolean };
    const interval = si.mock.results[intervalIdx].value as { hasRef(): boolean };
    stop();
    st.mockRestore();
    si.mockRestore();
    expect(tick).toHaveBeenCalled();
    expect(first.hasRef()).toBe(false);
    expect(interval.hasRef()).toBe(false);
  });
});
