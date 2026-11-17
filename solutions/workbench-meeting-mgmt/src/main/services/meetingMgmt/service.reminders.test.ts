/**
 * 会议智能管理 · 定时提醒三周模拟：真的服务 + 真的提醒规则（scheduler.dueReminders）+ 真的消息拼装，
 * 时钟从周一 08:00 起每 10 分钟走一轮（和正式定时器同频），跑 21 天，中途有人更新进度、确认发言、完成任务。
 * 核对：所有提醒只在 9:00–21:00 发；发言确认每 24 小时催一次、确认后停；到期提醒同一截止日只发一次；逾期每天一次；
 * 进度提醒每 7 天一次、更新进度后重新计时；进度汇总报告每 7 天一份；全部经企微群机器人推到群里。
 * 落盘是真的（临时目录）；流水线 / 企微 / 手机页服务换成替身。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('../accountScope', () => ({ accountPath: (...sub: string[]) => join(tmpdir(), 'mm-rem-unused', ...sub) }));
vi.mock('../sealedSecret', () => ({ canSealSecret: () => true, sealSecret: (s: string) => `S:${s}`, unsealSecret: (s: string) => s.slice(2) }));
vi.mock('./pipeline/index', () => ({
  runMeetingPipeline: vi.fn(), generatePlan: vi.fn(), generateWeeklyReport: vi.fn(), generateProjectSummary: vi.fn(),
  enrollVoiceprint: vi.fn(), exportSpeakerClip: vi.fn(), buildReportStats: vi.fn(),
}));

import type { MmNotice } from '../../../shared/meetingMgmt/types';
import { MeetingMgmtStore } from './store';
import { MeetingMgmtService, type MmExternals } from './service';
import { dueReminders, localDay, DAILY_REMIND_HOUR, QUIET_HOUR } from './scheduler';
import { noticeCard } from './notifier';
import { diffOrg } from './wecom';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const START = new Date(2026, 10, 16, 8, 0, 0).getTime(); // 周一 08:00
/** 定时器发出的通知类型（进度汇总报告的通知类型是 progress_report） */
const REMINDER_TYPES = ['speech_remind', 'task_due_remind', 'task_overdue', 'task_progress_remind', 'progress_report'] as const;

let tmp = '';
beforeAll(() => { tmp = mkdtempSync(join(tmpdir(), 'mm-rem-')); });
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

const stats = { total: 3, done: 1, cancelled: 0, overdue: 1, onTime: 1, late: 0, completionRate: 33 };

function make(dir = 'sim') {
  const clock = { now: START };
  const sent: Array<{ at: number; msg: any }> = [];
  const webhook = {
    send: vi.fn(async (msg: any) => { sent.push({ at: clock.now, msg }); return { ok: true }; }),
    sendMarkdown: vi.fn(async () => ({ ok: true })),
    test: vi.fn(async () => ({ ok: true })),
  };
  const ext: Partial<MmExternals> = {
    generateWeeklyReport: vi.fn(async ({ from, to }: any) => ({ id: '', kind: 'weekly' as const, generatedAt: clock.now, periodFrom: from, periodTo: to, markdown: '# 进度汇总', stats })),
    createWebhook: vi.fn(() => webhook) as any,
    createWecom: vi.fn(() => ({ test: vi.fn(), fetchOrg: vi.fn(), sendCard: vi.fn(async () => ({ ok: true })) })) as any,
    checkRuntime: vi.fn(async () => ({ python: true, ffmpeg: true, asrModel: 'small', speaker: true, modelsDir: tmp })) as any,
    diffOrg,
    noticeCard: (n, ctx) => noticeCard(n, ctx),
    dueReminders, // 真规则
    startScheduler: vi.fn(() => () => {}), // 定时器由下面的循环代替（每 10 分钟调一次 tick）
    startMobileServer: vi.fn(async () => ({ url: 'http://192.168.1.5:8280', port: 8280, stop: vi.fn(async () => {}) })) as any,
    seal: { can: () => true, seal: (s: string) => `S:${s}`, unseal: (s: string) => s.slice(2) },
  };
  const store = new MeetingMgmtStore(() => join(tmp, dir));
  const svc = new MeetingMgmtService({ store, llm: async () => null, emit: () => {}, now: () => clock.now, ext, logger: { warn: vi.fn(), info: vi.fn() } });
  const call = <R = any>(actor: string, action: string, payload: unknown = {}): Promise<R> => svc.dispatch(actor, action, payload, 'pc') as Promise<R>;
  return { svc, store, clock, webhook, sent, call };
}

describe('定时提醒：三周模拟（每 10 分钟一轮）', () => {
  const t = make();
  const reminders = (): MmNotice[] => t.store.read().notices.filter((n) => !n.id.startsWith('nt_demo') && (REMINDER_TYPES as readonly string[]).includes(n.type));
  let picks: { progressTask: string; doneTask: string; confirmMeeting: string; confirmPerson: string; stillPending: Array<{ m: string; p: string }> };
  const actions: Array<{ at: number; what: string }> = [];

  it('准备：演示数据 + 群机器人 + 手机页；挑出要中途操作的任务和发言人', async () => {
    await t.svc.dispatchPc('boot', {});
    await t.call('linxiao', 'wecom.webhook.save', { url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=693a91f6-7aaa-4bc4-97a0-0ec2sifa5aaa' });
    await t.call('linxiao', 'mobile.start');
    const s = t.store.read();
    const tracked = s.tasks.filter((x) => x.status === 'not_started' || x.status === 'in_progress');
    const today = localDay(START);
    const overdue = tracked.filter((x) => x.due < today);
    const future = tracked.filter((x) => x.due >= today).sort((a, b) => a.due.localeCompare(b.due));
    expect(overdue.length).toBeGreaterThan(0);
    expect(future.length).toBeGreaterThan(1);
    const pendingConf = s.meetings.filter((m) => m.status === 'pending_confirm')
      .flatMap((m) => m.confirmations.filter((c) => c.status === 'pending' && c.personId).map((c) => ({ m: m.id, p: c.personId! })));
    expect(pendingConf.length).toBeGreaterThan(1);
    picks = {
      progressTask: future[future.length - 1]!.id,
      doneTask: overdue[0]!.id,
      confirmMeeting: pendingConf[0]!.m,
      confirmPerson: pendingConf[0]!.p,
      stillPending: pendingConf.slice(1),
    };
  });

  it('跑 21 天', async () => {
    const asAssignee = (taskId: string) => t.store.read().tasks.find((x) => x.id === taskId)!.assigneeId;
    const steps = (21 * DAY) / (10 * MIN);
    for (let i = 1; i <= steps; i++) {
      t.clock.now = START + i * 10 * MIN;
      const el = t.clock.now - START;
      // 第 2 天 10:00：有人更新进度（进度提醒重新计时）
      if (el === 1 * DAY + 2 * HOUR) {
        await t.call(asAssignee(picks.progressTask), 'task.progress', { id: picks.progressTask, percent: 40, note: '样机已到' });
        actions.push({ at: t.clock.now, what: `更新进度 ${picks.progressTask}` });
      }
      // 第 3 天 15:00：一位发言人确认（之后不再催他）
      if (el === 2 * DAY + 7 * HOUR) {
        await t.call(picks.confirmPerson, 'meeting.confirm', { id: picks.confirmMeeting });
        actions.push({ at: t.clock.now, what: `确认发言 ${picks.confirmPerson}` });
      }
      // 第 5 天 11:00：一个逾期任务完成（之后不再发逾期）
      if (el === 4 * DAY + 3 * HOUR) {
        await t.call(asAssignee(picks.doneTask), 'task.complete', { id: picks.doneTask, note: '已完成' });
        actions.push({ at: t.clock.now, what: `完成任务 ${picks.doneTask}` });
      }
      await t.svc.tick();
      await t.svc.idle();
    }
  }, 120_000);

  it('夜里不发：所有提醒都在 9:00–21:00 之间', () => {
    for (const n of reminders()) {
      const h = new Date(n.at).getHours();
      expect(h).toBeGreaterThanOrEqual(DAILY_REMIND_HOUR);
      expect(h).toBeLessThan(QUIET_HOUR);
    }
    for (const x of t.sent) expect(new Date(x.at).getHours()).toBeGreaterThanOrEqual(DAILY_REMIND_HOUR);
  });

  it('发言确认：每满 24 小时催一次；确认的人之后不再催', () => {
    const conf = actions.find((a) => a.what.startsWith('确认发言'))!.at;
    const mine = reminders().filter((n) => n.type === 'speech_remind' && n.to === picks.confirmPerson && n.link.id === picks.confirmMeeting);
    expect(mine.every((n) => n.at < conf)).toBe(true);
    for (const { m, p } of picks.stillPending) {
      const list = reminders().filter((n) => n.type === 'speech_remind' && n.to === p && n.link.id === m).map((n) => n.at).sort((a, b) => a - b);
      expect(list.length).toBeGreaterThanOrEqual(20); // 21 天，24 小时一次
      for (let i = 1; i < list.length; i++) expect(list[i]! - list[i - 1]!).toBeGreaterThanOrEqual(24 * HOUR);
      // 白天到点的：24 小时整（误差一轮 10 分钟）；夜里到点的顺延到 9 点
      for (let i = 1; i < list.length; i++) expect(list[i]! - list[i - 1]!).toBeLessThanOrEqual(36 * HOUR);
    }
  });

  it('逾期：每个任务每天最多一次，9 点以后才发；完成后停发', () => {
    const over = reminders().filter((n) => n.type === 'task_overdue');
    expect(over.length).toBeGreaterThan(0);
    for (const n of over) expect(new Date(n.at).getHours()).toBeGreaterThanOrEqual(DAILY_REMIND_HOUR);
    const perTaskPersonDay = new Map<string, number>();
    for (const n of over) {
      const k = `${n.link.id}|${n.to}|${localDay(n.at)}`;
      perTaskPersonDay.set(k, (perTaskPersonDay.get(k) ?? 0) + 1);
    }
    expect([...perTaskPersonDay.values()].every((c) => c === 1)).toBe(true);
    const done = actions.find((a) => a.what.startsWith('完成任务'))!.at;
    const forDone = over.filter((n) => n.link.id === picks.doneTask);
    expect(forDone.length).toBeGreaterThan(0);
    expect(forDone.every((n) => n.at < done)).toBe(true);
    // 没完成的逾期任务：21 天里天天都有
    const s = t.store.read();
    const stillOver = s.tasks.find((x) => x.id !== picks.doneTask && (x.status === 'not_started' || x.status === 'in_progress') && x.due < localDay(START));
    if (stillOver) {
      const days = new Set(over.filter((n) => n.link.id === stillOver.id).map((n) => localDay(n.at)));
      expect(days.size).toBe(21);
    }
  });

  it('到期：截止前 1 天起提醒、同一截止日只发一次、9 点以后；之后过了截止日转成逾期', () => {
    const due = reminders().filter((n) => n.type === 'task_due_remind');
    expect(due.length).toBeGreaterThan(0);
    for (const n of due) expect(new Date(n.at).getHours()).toBeGreaterThanOrEqual(DAILY_REMIND_HOUR);
    const tasks = t.store.read().tasks;
    const byTaskPerson = new Map<string, number>();
    for (const n of due) byTaskPerson.set(`${n.link.id}|${n.to}`, (byTaskPerson.get(`${n.link.id}|${n.to}`) ?? 0) + 1);
    expect([...byTaskPerson.values()].every((c) => c === 1)).toBe(true);
    for (const n of due) {
      const task = tasks.find((x) => x.id === n.link.id)!;
      const left = Math.round((new Date(`${task.due}T00:00:00`).getTime() - new Date(`${localDay(n.at)}T00:00:00`).getTime()) / DAY);
      expect(left).toBeGreaterThanOrEqual(0);
      expect(left).toBeLessThanOrEqual(1);
    }
  });

  it('进度：同一任务两次提醒至少隔 7 天；更新进度后从更新时间重新算', () => {
    const prog = reminders().filter((n) => n.type === 'task_progress_remind');
    expect(prog.length).toBeGreaterThan(0);
    const byTask = new Map<string, number[]>();
    for (const n of prog) byTask.set(`${n.link.id}|${n.to}`, [...(byTask.get(`${n.link.id}|${n.to}`) ?? []), n.at]);
    for (const list of byTask.values()) {
      list.sort((a, b) => a - b);
      for (let i = 1; i < list.length; i++) expect(list[i]! - list[i - 1]!).toBeGreaterThanOrEqual(7 * DAY);
    }
    const upd = actions.find((a) => a.what.startsWith('更新进度'))!.at;
    const after = prog.filter((n) => n.link.id === picks.progressTask && n.at > upd).map((n) => n.at).sort((a, b) => a - b);
    if (after.length) expect(after[0]! - upd).toBeGreaterThanOrEqual(7 * DAY);
  });

  it('进度汇总报告：进行中的项目每 7 天一份，推给项目负责人', () => {
    const s = t.store.read();
    const active = s.projects.filter((p) => p.status === 'active' && s.tasks.some((x) => x.projectId === p.id));
    expect(active.length).toBeGreaterThan(0);
    for (const p of active) {
      const gens = (p.weeklyReports ?? []).map((r) => r.generatedAt).filter((x) => x > START).sort((a, b) => a - b);
      expect(gens.length).toBeGreaterThanOrEqual(2);
      expect(gens.length).toBeLessThanOrEqual(4);
      for (let i = 1; i < gens.length; i++) expect(gens[i]! - gens[i - 1]!).toBeGreaterThanOrEqual(7 * DAY);
    }
    const reportNotices = reminders().filter((n) => n.type === 'progress_report');
    expect(reportNotices.length).toBeGreaterThan(0);
    for (const p of active) expect(reportNotices.some((n) => n.to === p.ownerId && n.link.anchor && (p.weeklyReports ?? []).some((r) => r.id === n.link.anchor))).toBe(true);
  });

  it('全部推到企微群：每条提醒都进了群消息，群消息带「公司内网链接」提醒；同一时间同一事件合成一条', () => {
    const all = reminders();
    const pushed = all.filter((n) => n.wecom?.sentAt);
    expect(pushed.length).toBe(all.length);
    expect(t.sent.length).toBeGreaterThan(0);
    expect(t.sent.length).toBeLessThanOrEqual(all.length);
    expect(t.sent.every((x) => /公司内网链接/.test(x.msg.content))).toBe(true);

    // 打印时间线摘要（按类型 × 天数）
    const lines: string[] = [];
    for (const type of REMINDER_TYPES) {
      const list = all.filter((n) => n.type === type);
      const days = new Set(list.map((n) => localDay(n.at)));
      const hours = list.map((n) => new Date(n.at).getHours());
      lines.push(`${type.padEnd(22)} 条数 ${String(list.length).padStart(4)}  涉及 ${String(days.size).padStart(2)} 天  最早 ${hours.length ? Math.min(...hours) : '-'} 点`);
    }
    lines.push(`群消息 ${t.sent.length} 条（同一时间同一事件的几个人合成一条）`);
    for (const a of actions) lines.push(`中途操作：第 ${Math.floor((a.at - START) / DAY) + 1} 天 ${new Date(a.at).getHours()}:00 ${a.what}`);
    console.log(lines.join('\n'));
  });
});

/**
 * 参数设置真的生效：通过界面同一个动作（settings.save）把四个参数改成非默认值，跑 12 天；第 7 天再改一次。
 * 每条提醒都按「当时生效的参数」核对间隔，证明改了马上用新值、不用重启。
 */
describe('参数设置：改了马上生效（12 天模拟，中途再改一次）', () => {
  const t = make('sim-params');
  const reminders = (): MmNotice[] => t.store.read().notices.filter((n) => !n.id.startsWith('nt_demo') && (REMINDER_TYPES as readonly string[]).includes(n.type));
  const FIRST = { confirmTimeoutHours: 6, dueRemindDays: 3, trackCycleDays: 2, reportCycleDays: 3 };
  const SECOND = { confirmTimeoutHours: 12, trackCycleDays: 4 };
  let changeAt = 0;
  let pendingConf: Array<{ m: string; p: string }> = [];

  it('准备：演示数据 + 群机器人；用 settings.save 改成 6 小时 / 3 天 / 2 天 / 3 天；超范围的值按上下限收', async () => {
    await t.svc.dispatchPc('boot', {});
    await t.call('linxiao', 'wecom.webhook.save', { url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=693a91f6-7aaa-4bc4-97a0-0ec2sifa5aaa' });
    // 超范围：按上下限收（界面本身不让存超范围的值，这里防直接调接口）
    const clamped = await t.call<any>('linxiao', 'settings.save', { patch: { confirmTimeoutHours: 0, dueRemindDays: 99, trackCycleDays: 1000, reportCycleDays: -3 } });
    expect(clamped).toMatchObject({ confirmTimeoutHours: 1, dueRemindDays: 30, trackCycleDays: 90, reportCycleDays: 1 });
    // 非管理员不能改
    const s0 = t.store.read();
    const nonAdmin = s0.org.people.find((p) => !p.left && !s0.settings.adminIds.includes(p.id))!.id;
    await expect(t.call(nonAdmin, 'settings.save', { patch: FIRST })).rejects.toThrow();
    const saved = await t.call<any>('linxiao', 'settings.save', { patch: FIRST });
    expect(saved).toMatchObject(FIRST);
    expect(t.store.read().settings).toMatchObject(FIRST);
    // 首页 / 详情用的 boot 里也是新值
    expect((await t.call<any>('linxiao', 'boot')).settings).toMatchObject(FIRST);
    pendingConf = t.store.read().meetings.filter((m) => m.status === 'pending_confirm')
      .flatMap((m) => m.confirmations.filter((c) => c.status === 'pending' && c.personId).map((c) => ({ m: m.id, p: c.personId! })));
    expect(pendingConf.length).toBeGreaterThan(0);
  });

  it('跑 12 天（第 7 天 08:00 把发言催办改成 12 小时、进度跟踪改成 4 天）', async () => {
    const steps = (12 * DAY) / (10 * MIN);
    for (let i = 1; i <= steps; i++) {
      t.clock.now = START + i * 10 * MIN;
      if (t.clock.now - START === 6 * DAY) {
        await t.call('linxiao', 'settings.save', { patch: SECOND });
        changeAt = t.clock.now;
      }
      await t.svc.tick();
      await t.svc.idle();
    }
    expect(changeAt).toBeGreaterThan(0);
  }, 120_000);

  it('都在 9:00–21:00', () => {
    for (const n of reminders()) {
      const h = new Date(n.at).getHours();
      expect(h).toBeGreaterThanOrEqual(DAILY_REMIND_HOUR);
      expect(h).toBeLessThan(QUIET_HOUR);
    }
  });

  it('发言确认催办：改成 6 小时后白天每 6 小时一次；改成 12 小时后间隔不少于 12 小时', () => {
    let sameDayPairs = 0;
    for (const { m, p } of pendingConf) {
      const list = reminders().filter((n) => n.type === 'speech_remind' && n.to === p && n.link.id === m).map((n) => n.at).sort((a, b) => a - b);
      const before = list.filter((x) => x < changeAt);
      const after = list.filter((x) => x >= changeAt);
      // 6 天里每天白天能催 2 次（9 点、15 点）→ 至少 10 次；默认 24 小时只会有 6 次
      expect(before.length).toBeGreaterThanOrEqual(10);
      for (let i = 1; i < before.length; i++) {
        const gap = before[i]! - before[i - 1]!;
        expect(gap).toBeGreaterThanOrEqual(6 * HOUR);
        if (localDay(before[i]!) === localDay(before[i - 1]!)) { expect(gap).toBeLessThanOrEqual(6 * HOUR + 10 * MIN); sameDayPairs++; }
      }
      for (let i = 1; i < after.length; i++) expect(after[i]! - after[i - 1]!).toBeGreaterThanOrEqual(12 * HOUR);
      expect(after.length).toBeGreaterThanOrEqual(4);
      expect(after.length).toBeLessThan(before.length);
    }
    expect(sameDayPairs).toBeGreaterThan(0);
  });

  it('到期提前 3 天：截止前 3 天（含）起提醒、同一截止日只发一次；截止日离开始还远的任务正好在前 3 天那天发', () => {
    const due = reminders().filter((n) => n.type === 'task_due_remind');
    expect(due.length).toBeGreaterThan(0);
    const tasks = t.store.read().tasks;
    const byTaskPerson = new Map<string, number>();
    for (const n of due) byTaskPerson.set(`${n.link.id}|${n.to}`, (byTaskPerson.get(`${n.link.id}|${n.to}`) ?? 0) + 1);
    expect([...byTaskPerson.values()].every((c) => c === 1)).toBe(true);
    let exact = 0;
    for (const n of due) {
      const task = tasks.find((x) => x.id === n.link.id)!;
      const left = Math.round((new Date(`${task.due}T00:00:00`).getTime() - new Date(`${localDay(n.at)}T00:00:00`).getTime()) / DAY);
      expect(left).toBeGreaterThanOrEqual(0);
      expect(left).toBeLessThanOrEqual(3);
      const startLeft = Math.round((new Date(`${task.due}T00:00:00`).getTime() - new Date(`${localDay(START)}T00:00:00`).getTime()) / DAY);
      if (startLeft > 3) { expect(left).toBe(3); exact++; }
    }
    expect(exact).toBeGreaterThan(0);
  });

  it('进度跟踪：改成 2 天时同一任务提醒间隔 ≥ 2 天且前 6 天里有任务被提醒了 2 次以上；改成 4 天后间隔 ≥ 4 天', () => {
    const prog = reminders().filter((n) => n.type === 'task_progress_remind');
    expect(prog.length).toBeGreaterThan(0);
    const byTask = new Map<string, number[]>();
    for (const n of prog) byTask.set(`${n.link.id}|${n.to}`, [...(byTask.get(`${n.link.id}|${n.to}`) ?? []), n.at]);
    let maxBefore = 0;
    for (const list of byTask.values()) {
      list.sort((a, b) => a - b);
      const before = list.filter((x) => x < changeAt);
      const after = list.filter((x) => x >= changeAt);
      maxBefore = Math.max(maxBefore, before.length);
      for (let i = 1; i < before.length; i++) expect(before[i]! - before[i - 1]!).toBeGreaterThanOrEqual(2 * DAY);
      for (let i = 1; i < after.length; i++) expect(after[i]! - after[i - 1]!).toBeGreaterThanOrEqual(4 * DAY);
      // 跨越改参数那一下：改后第一条离改前最后一条也至少 4 天（按新周期算）
      if (before.length && after.length) expect(after[0]! - before[before.length - 1]!).toBeGreaterThanOrEqual(4 * DAY);
    }
    expect(maxBefore).toBeGreaterThanOrEqual(2);
  });

  it('周报周期 3 天：进行中的项目每 3 天一份（12 天里 3～5 份），推给项目负责人', () => {
    const s = t.store.read();
    const active = s.projects.filter((p) => p.status === 'active' && s.tasks.some((x) => x.projectId === p.id));
    expect(active.length).toBeGreaterThan(0);
    for (const p of active) {
      const gens = (p.weeklyReports ?? []).map((r) => r.generatedAt).filter((x) => x > START).sort((a, b) => a - b);
      expect(gens.length).toBeGreaterThanOrEqual(3);
      expect(gens.length).toBeLessThanOrEqual(5);
      for (let i = 1; i < gens.length; i++) expect(gens[i]! - gens[i - 1]!).toBeGreaterThanOrEqual(3 * DAY);
    }
    const reportNotices = reminders().filter((n) => n.type === 'progress_report');
    for (const p of active) expect(reportNotices.some((n) => n.to === p.ownerId)).toBe(true);
    const lines = (['speech_remind', 'task_due_remind', 'task_progress_remind', 'progress_report', 'task_overdue'] as const)
      .map((type) => `${type.padEnd(22)} ${reminders().filter((n) => n.type === type).length} 条`);
    console.log(['参数模拟（6h/3d/2d/3d → 第 7 天改 12h / 4d）', ...lines].join('\n'));
  });
});

