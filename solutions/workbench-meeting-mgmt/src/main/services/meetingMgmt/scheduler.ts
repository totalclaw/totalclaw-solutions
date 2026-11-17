/**
 * 会议智能管理 · 提醒调度（只算「现在该发哪些提醒」，只发提醒、不改状态）。
 *
 * dueReminders 是纯函数：给定状态 + 当前时间 → 要执行的动作；执行动作、记下提醒时间由 A（service）做：
 *   speech_remind         → confirmation.remindedAt = now，催办发言人（状态不变）
 *   task_progress_remind  → task.reminders.weeklyAt = now
 *   task_due_remind       → task.reminders.dueAt = now
 *   task_overdue          → task.reminders.overdueAt = now，通知部门负责人，同时通知任务负责人（动作的 notify 里两人都在）
 *   weekly_report         → 生成一份进度汇总报告放进 project.weeklyReports（generatedAt 即去重依据），推给 notify
 * 下一轮靠这些时间去重，所以 A 必须记下来，否则会每 10 分钟重复发。
 *
 * 规则（需求 7.3「提醒规则」、9.8 参数、风险 D）：
 *   - 发言确认：会议「待确认」、本人「未确认」，距发起确认（或被退回）超过 confirmTimeoutHours → 催办；
 *     之后每再过一个时限催一次。
 *   - 任务只看「未开始 / 进行中」：「待接收」不计逾期、也不提醒（风险 D）；已完成 / 已取消不管。
 *     · 截止前 dueRemindDays 天起（含截止当天）→ 到期提醒，同一个截止日只发一次（截止日调整后按新日期再发）；
 *     · 过了截止日 → 每天一次逾期提醒；
 *     · 每 trackCycleDays 天提醒一次更新进度（从接收 / 最近一次更新进度 / 最近一次提醒算起）；
 *       已逾期的不再单发进度提醒（逾期提醒每天都在催），同一轮一个任务最多一条提醒。
 *     · 异议处理期间照常计时（原截止日有效），不因为有异议而停发。
 *   - 进行中的项目，每 reportCycleDays 天生成一份进度汇总报告（项目里还没有任务时不生成）。
 *   - 已归档项目下的会议 / 任务不再提醒。
 *
 * 截止日是本地日期 'YYYY-MM-DD'（按本机时区理解，不按 UTC）。
 * 所有提醒只在白天发（本机时间 DAILY_REMIND_HOUR 点到 QUIET_HOUR 点）：按天的（到期 / 逾期）当天 9 点后发；
 * 按间隔算的（催办 / 进度 / 周报）夜里到点的顺延到第二天 9 点，下一次从这次真正发出的时间再算 ——
 * 否则凌晨 1 点处理完的会议，24 小时后会在凌晨 1 点往企微群里推催办。
 */
import type { MmMeeting, MmProject, MmSettings, MmTask, MmTaskStatus } from '../../../shared/meetingMgmt/types';
import { MM_DEFAULT_SETTINGS } from '../../../shared/meetingMgmt/types';

/** 任务负责人（可多位；旧数据只有 ownerId）。和 rules.taskOwners 同一规则，这里不引 rules 免得循环依赖 */
const ownersOf = (t: Pick<MmTask, 'ownerId' | 'ownerIds'>): string[] => (Array.isArray(t.ownerIds) && t.ownerIds.length ? t.ownerIds : t.ownerId ? [t.ownerId] : []);

export type ReminderAction =
  | {
    kind: 'speech_remind'; meetingId: string; personId: string;
    /** 距发起确认（或被退回）已过了多少小时 */
    waitedHours?: number;
  }
  | {
    kind: 'task_progress_remind' | 'task_due_remind' | 'task_overdue'; taskId: string;
    /** 接收人：[部门负责人]；逾期时为 [部门负责人, 任务负责人]（同一人只出现一次） */
    notify?: string[];
    /** 到期提醒：距截止还有几天（截止当天为 0） */
    daysLeft?: number;
    /** 逾期提醒：已逾期几天 */
    overdueDays?: number;
  }
  | {
    kind: 'weekly_report'; projectId: string;
    /** 统计区间（上一份周报的截止时间 / 项目创建时间 → 现在） */
    periodFrom?: number;
    periodTo?: number;
    /** 接收人：项目负责人 + 项目里各任务的任务负责人 */
    notify?: string[];
  };

export const MEETING_SCHEDULER_INTERVAL_MS = 10 * 60 * 1000;
/** 启动后多久跑第一轮 */
export const MEETING_SCHEDULER_FIRST_TICK_MS = 30 * 1000;
/** 提醒从每天几点开始发（按天的到期 / 逾期当天这个点之后发；夜里到点的按间隔提醒顺延到这个点） */
export const DAILY_REMIND_HOUR = 9;
/** 每天几点以后不再发提醒（到第二天 DAILY_REMIND_HOUR 点再发） */
export const QUIET_HOUR = 21;

const HOUR = 3_600_000;
const DAY = 86_400_000;
/** 要跟踪进度 / 提醒的任务状态（待接收不计逾期，风险 D） */
const TRACKED: ReadonlySet<MmTaskStatus> = new Set<MmTaskStatus>(['not_started', 'in_progress']);
/** 任务重新进入可执行状态的事件（没有 acceptedAt 时用来定跟踪起点） */
const TRACK_START_EVENTS = new Set(['accepted', 'arbitrate_keep', 'arbitrate_adjust']);

// ─── 本地日期 ─────────────────────────────────────────────────────────

const pad = (n: number): string => String(n).padStart(2, '0');

/** 本地日期 'YYYY-MM-DD' */
export function localDay(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDay(day: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec((day ?? '').trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const probe = new Date(y, mo - 1, d);
  if (probe.getFullYear() !== y || probe.getMonth() !== mo - 1 || probe.getDate() !== d) return null;
  return { y, m: mo, d };
}

/** 本地日期 day 往前 / 往后 offsetDays 天的零点（毫秒，按本机时区，夏令时也对） */
function dayStartMs(day: string, offsetDays = 0): number {
  const p = parseDay(day);
  return p ? new Date(p.y, p.m - 1, p.d + offsetDays).getTime() : NaN;
}

/** 截止日距今天还有几天（今天为 0，已过为负）；日期写得不对返回 null */
export function daysUntil(day: string, nowMs: number): number | null {
  const target = dayStartMs(day);
  if (!Number.isFinite(target)) return null;
  return Math.round((target - dayStartMs(localDay(nowMs))) / DAY);
}

// ─── 参数 ─────────────────────────────────────────────────────────────

function param(v: unknown, def: number, min: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= min ? n : def;
}

function params(s: MmSettings | undefined) {
  return {
    confirmMs: param(s?.confirmTimeoutHours, MM_DEFAULT_SETTINGS.confirmTimeoutHours, 0.01) * HOUR,
    dueDays: Math.floor(param(s?.dueRemindDays, MM_DEFAULT_SETTINGS.dueRemindDays, 0)),
    trackMs: param(s?.trackCycleDays, MM_DEFAULT_SETTINGS.trackCycleDays, 0.01) * DAY,
    reportMs: param(s?.reportCycleDays, MM_DEFAULT_SETTINGS.reportCycleDays, 0.01) * DAY,
  };
}

const maxOf = (...xs: Array<number | undefined>): number => xs.reduce<number>((m, x) => (typeof x === 'number' && Number.isFinite(x) && x > m ? x : m), 0);

// ─── 主函数 ───────────────────────────────────────────────────────────

/** 现在该发哪些提醒（纯函数；同一状态同一时间算出来的结果一样） */
export function dueReminders(
  s: { meetings: MmMeeting[]; tasks: MmTask[]; projects: MmProject[]; settings: MmSettings },
  now: number,
): ReminderAction[] {
  const hour = new Date(now).getHours();
  if (hour < DAILY_REMIND_HOUR || hour >= QUIET_HOUR) return []; // 夜里不发，到点的顺延到早上
  const p = params(s.settings);
  const projectById = new Map((s.projects ?? []).map((x) => [x.id, x]));
  const archived = (projectId: string): boolean => projectById.get(projectId)?.status === 'archived';
  const out: ReminderAction[] = [];

  // 1. 发言确认超时催办
  for (const m of s.meetings ?? []) {
    if (m.status !== 'pending_confirm' || archived(m.projectId)) continue;
    const startFallback = maxOf(m.process?.finishedAt, m.createdAt);
    for (const c of m.confirmations ?? []) {
      if (c.status !== 'pending' || !c.personId) continue;
      // 发起确认的时间：requestedAt（契约里有就用）→ 被退回时间 → 处理完成时间 → 会议创建时间
      const requestedAt = (c as typeof c & { requestedAt?: number }).requestedAt;
      const start = maxOf(c.returnedAt, requestedAt) || startFallback;
      if (!start) continue;
      const last = maxOf(start, c.remindedAt);
      if (now - last >= p.confirmMs) {
        out.push({ kind: 'speech_remind', meetingId: m.id, personId: c.personId, waitedHours: Math.floor((now - start) / HOUR) });
      }
    }
  }

  // 2. 任务：逾期 > 到期 > 进度（同一轮一个任务最多一条）
  const dailyOk = new Date(now).getHours() >= DAILY_REMIND_HOUR;
  const today = localDay(now);
  for (const t of s.tasks ?? []) {
    if (!TRACKED.has(t.status) || archived(t.projectId)) continue;
    const r = t.reminders ?? {};
    const left = daysUntil(t.due, now);
    const notifyAssignee = t.assigneeId ? [t.assigneeId] : [];

    if (left !== null && left < 0) {
      // 逾期：每天一次（按本地日期），同时通知任务负责人
      if (dailyOk && (!r.overdueAt || localDay(r.overdueAt) !== today)) {
        out.push({ kind: 'task_overdue', taskId: t.id, notify: [...new Set([...notifyAssignee, ...ownersOf(t)])], overdueDays: -left });
      }
      continue; // 逾期的不再单发进度提醒
    }

    if (left !== null && left <= p.dueDays) {
      // 到期：截止前 dueDays 天起，同一截止日只发一次；截止日后移后，旧的提醒早于新窗口 → 再发
      const windowStart = dayStartMs(t.due, -p.dueDays);
      if (!r.dueAt || r.dueAt < windowStart) {
        if (dailyOk) out.push({ kind: 'task_due_remind', taskId: t.id, notify: notifyAssignee, daysLeft: left });
        continue; // 没到发送时间就等到期提醒，不先发一条进度提醒
      }
    }

    // 进度：从接收 / 最近一次更新进度 / 最近一次提醒（含到期提醒）算起，每 trackCycleDays 天一次
    const trackStart = t.acceptedAt
      || maxOf(...(t.events ?? []).filter((e) => TRACK_START_EVENTS.has(e.action)).map((e) => e.at))
      || t.createdAt;
    const lastProgress = maxOf(...(t.progressLog ?? []).map((x) => x.at));
    const last = maxOf(trackStart, lastProgress, r.weeklyAt, r.dueAt);
    if (last && now - last >= p.trackMs) out.push({ kind: 'task_progress_remind', taskId: t.id, notify: notifyAssignee });
  }

  // 3. 进度汇总报告：进行中的项目，每 reportCycleDays 天一份
  const tasksByProject = new Map<string, MmTask[]>();
  for (const t of s.tasks ?? []) {
    const list = tasksByProject.get(t.projectId) ?? [];
    list.push(t);
    tasksByProject.set(t.projectId, list);
  }
  for (const pr of s.projects ?? []) {
    if (pr.status !== 'active') continue;
    const tasks = tasksByProject.get(pr.id) ?? [];
    if (!tasks.length) continue; // 还没有任务，报告没内容
    const reports = (pr.weeklyReports ?? []).filter((x) => x && Number.isFinite(x.generatedAt));
    const lastReport = reports.reduce<(typeof reports)[number] | undefined>((a, b) => (!a || b.generatedAt > a.generatedAt ? b : a), undefined);
    // 第一份：从项目里第一个任务下发算起满一个周期
    const firstTaskAt = Math.min(...tasks.map((t) => t.createdAt).filter((x) => Number.isFinite(x)));
    const base = lastReport ? lastReport.generatedAt : maxOf(pr.createdAt, Number.isFinite(firstTaskAt) ? firstTaskAt : 0);
    if (!base || now - base < p.reportMs) continue;
    const notify = [...new Set([pr.ownerId, ...tasks.filter((t) => t.status !== 'cancelled').flatMap((t) => ownersOf(t))].filter(Boolean))];
    out.push({
      kind: 'weekly_report', projectId: pr.id,
      periodFrom: lastReport ? (lastReport.periodTo ?? lastReport.generatedAt) : pr.createdAt,
      periodTo: now,
      notify,
    });
  }

  return out;
}

// ─── 定时器 ───────────────────────────────────────────────────────────

/**
 * 启动后 30 秒（intervalMs 更短时取 intervalMs）跑第一轮，之后每 intervalMs（默认 10 分钟）一轮。
 * 上一轮还没跑完时跳过这一轮（周报生成慢也不会叠着跑、重复发）；tick 抛错不影响下一轮。
 * 定时器都 unref，不拖住进程退出。返回停止函数（可重复调用）。
 */
export function startMeetingScheduler(tick: () => void | Promise<void>, intervalMs = MEETING_SCHEDULER_INTERVAL_MS): () => void {
  const every = Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : MEETING_SCHEDULER_INTERVAL_MS;
  let stopped = false;
  let running = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  const unref = (h: unknown): void => { (h as { unref?: () => void } | null)?.unref?.(); };
  const run = async (): Promise<void> => {
    if (stopped || running) return;
    running = true;
    try {
      await tick();
    } catch {
      // 吞掉：提醒失败不影响下一轮（A 在 tick 里自己记日志）
    } finally {
      running = false;
    }
  };
  // 周期定时器从第一轮开始算，免得第一轮和第一个周期撞在同一时刻跑两次
  const first = setTimeout(() => {
    if (stopped) return;
    timer = setInterval(() => { void run(); }, every);
    unref(timer);
    void run();
  }, Math.min(MEETING_SCHEDULER_FIRST_TICK_MS, every));
  unref(first);
  return () => {
    stopped = true;
    clearTimeout(first);
    if (timer) clearInterval(timer);
    timer = null;
  };
}
