/**
 * 会议智能管理 · 核心服务。唯一入口 dispatch(actorPersonId, action, payload)：
 * PC 端经 IPC（当前身份 = state.meId），手机页经 /api/invoke（身份 = 令牌对应的人），走同一套动作与权限。
 * 动作清单见 docs/meeting-mgmt-workbench.md 3.2；状态机在 rules.ts，待办在 todos.ts。
 *
 *   - 权限按角色判断（1.3 / 1.4）：越权抛中文错误；已归档项目全部只读。
 *   - 每次改动 emit 事件（MmEvent）让界面刷新；处理进度经 process 事件推。
 *   - 触发通知：写消息中心（MmNotice），配置了企微再发卡片（noticeCard + WecomClient.sendCard）；没配置只进消息中心。
 *   - 会议上传后异步跑流水线；定稿选「生成任务」调 generatePlan；结项通过调 generateProjectSummary；周报调 generateWeeklyReport。
 *   - 定时提醒：scheduler.dueReminders 算动作，这里执行（只发提醒、记提醒时间，不改状态）。
 *   - 手机页服务：startMeetingMobileServer，dispatch 传自己，personByToken 用这里发放的每人令牌。
 */
import { existsSync, promises as fsp, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { t as i18nT } from '@totalclaw/i18n';
import type {
  MmEvent, MmLink, MmMe, MmMeeting, MmMeetingFile, MmMeetingSource, MmNotice, MmNoticeType, MmOrg, MmOrgSyncResult, MmPerson,
  MmPlan, MmProcessStage, MmProject, MmProjectStatus, MmReport, MmSettings, MmTask, MmTaskStatus, MmTaskView, MmVoiceprint,
  MmDept, MmFileKind, MmHomeView, MmMeetingCard, MmMeetingDetail, MmPeople,
} from '../../../shared/meetingMgmt/types';
import { MM_VOICEPRINT_MAX_EXTRA, type MmVoiceprintSample } from '../../../shared/meetingMgmt/types';
import { MeetingMgmtStore, newId, type MmStoredState } from './store';
import * as R from './rules';
import * as T from './todos';
import { DEMO_ADMIN_ID, DEMO_TRANSCRIPT, DEMO_TRANSCRIPT_NAME, buildDemoData, buildDemoOrg } from './demo';
import type { MmLlm } from './llm';
import * as pipeline from './pipeline/index';
import { AUDIO_FILE } from './pipeline/voiceprint';
import { cosineSim } from './pipeline/diarize';
import { WecomClient, diffOrg } from './wecom';
import { cardSummary, noticeButtonText, noticeCard, noticeTypeLabel } from './notifier';
import { WecomWebhook, buildGroupMessage, lanLinkNote, maskWebhookUrl, normalizeWebhookUrl, type GroupMessage } from './wecomWebhook';
import { normalizeMobile, normalizeWecomUserId, parseOrgTable } from './orgImport';
import { openSpreadsheetFile, readWorksheetData } from '../spreadsheetRead';
import { MEETING_ASR_IDS, SPEAKER_INSTALL_ID, detectHardware, estimateMinPerHour, recommendAsr, type HardwareInfo } from './setupCheck';
import { CLOUD_ASR_PRESETS, cloudAsrPreset, cloudTranscribe, normalizeBaseUrl, silenceWav, type CloudAsrConfig, type CloudAsrResult } from './cloudAsr';
import { dueReminders, startMeetingScheduler, type ReminderAction } from './scheduler';
import { buildGroupUrl, buildMobileUrl, buildVoiceprintUrl, isLanOnlyUrl, startMeetingMobileServer } from './mobile/server';
import { canSealSecret, sealSecret, unsealSecret } from '../sealedSecret';

// ─── 外部模块（B 流水线 / C 企微、提醒、手机页）的接口：按文档 3.1 的签名；单测可整体替换 ─────

export interface PipelineInputLike {
  meetingId: string;
  workDir: string;
  files: MmMeetingFile[];
  attendees: MmPerson[];
  voiceprints: MmVoiceprint[];
  threshold: number;
  asr: 'local' | 'agent' | 'cloud';
  asrModel?: 'auto' | 'firered' | 'sensevoice' | 'whisper';
  cloudAsr?: CloudAsrConfig;
  organizePrompt?: string;
  llm: MmLlm;
  signal?: AbortSignal;
  onStage: (stage: MmProcessStage, progress: number, text?: string) => void;
}

export interface WecomLike {
  test(): Promise<{ ok: boolean; error?: string }>;
  fetchOrg(): Promise<{ depts: MmDept[]; people: MmPerson[] }>;
  sendCard(toUserIds: string[], card: { title: string; description: string; url: string; btntxt?: string }): Promise<{ ok: boolean; error?: string }>;
}

/** 企微群机器人（群聊「消息推送」） */
export interface WebhookLike {
  send(m: GroupMessage): Promise<{ ok: boolean; error?: string }>;
  sendMarkdown(content: string): Promise<{ ok: boolean; error?: string }>;
  test(): Promise<{ ok: boolean; error?: string }>;
}

export interface MobileServerHandle { url: string; port: number; stop: () => Promise<void> }

export interface MmExternals {
  runMeetingPipeline(i: PipelineInputLike): Promise<R.PipelineOutput>;
  generatePlan(i: { meeting: MmMeeting; project: MmProject; org: MmOrg; today: string; prompt?: string; llm: MmLlm }): Promise<MmPlan>;
  /** 按当前发言人和文字重新整理议题 / 决议 / 摘要（主持人定稿前手动触发） */
  organizeMinutes(i: { segments: MmMeeting['segments']; speakerNames: Record<string, string>; attendeeNames: string[]; llm: MmLlm; prompt?: string }): Promise<{
    segments: MmMeeting['segments']; topics: MmMeeting['topics']; decisions: MmMeeting['decisions']; summaryLines: string[]; note?: string;
  }>;
  generateWeeklyReport(i: { project: MmProject; meetings: MmMeeting[]; tasks: MmTask[]; org: MmOrg; from: number; to: number; llm: MmLlm }): Promise<MmReport>;
  generateProjectSummary(i: { project: MmProject; meetings: MmMeeting[]; tasks: MmTask[]; org: MmOrg; prompt?: string; llm: MmLlm }): Promise<MmReport>;
  enrollVoiceprint(audioPath: string): Promise<{ ok: true; vector: number[]; vector2?: number[]; seconds: number } | { ok: false; reason: string }>;
  /** 从会议录音里给某人算一份声纹样本（本人同意自动补充后，确认发言时用）；不够 10 秒等情况返回 null */
  meetingVoiceSample(workDir: string, ranges: Array<{ start: number; end: number }>): Promise<{ vector?: number[]; vector2?: number[]; seconds: number } | null>;
  exportSpeakerClip(i: { meeting: MmMeeting; label: string; workDir: string }): Promise<string | null>;
  createWecom(cfg: { corpId: string; agentId: string; secret: string }): WecomLike;
  createWebhook(url: string): WebhookLike;
  diffOrg(prev: MmOrg, next: { depts: MmDept[]; people: MmPerson[] }): { added: string[]; changed: string[]; left: string[] };
  noticeCard(n: MmNotice, ctx: { linkFor: (personId: string, link: MmLink) => string; footnote?: string }): { title: string; description: string; url: string; btntxt: string };
  dueReminders(s: { meetings: MmMeeting[]; tasks: MmTask[]; projects: MmProject[]; settings: MmSettings }, now: number): ReminderAction[];
  startScheduler(tick: () => void | Promise<void>, intervalMs?: number): () => void;
  startMobileServer(o: {
    port?: number; dataDir: string;
    dispatch: (personId: string, action: string, payload: unknown) => Promise<unknown>;
    personByToken: (token: string) => string | null;
    uploadDir: string; publicBase?: () => string | undefined; maxUploadBytes?: number;
    log?: (msg: string, meta?: unknown) => void;
  }): Promise<MobileServerHandle>;
  seal: { can(): boolean; seal(plain: string): string; unseal(stored: string): string };
  /** 配置引导：本机语音组件和模型到没到位 */
  checkRuntime(): Promise<RuntimeCheck>;
  detectHardware(modelsDir?: string): HardwareInfo;
  /** 会议录音的一段（秒）→ wav base64；没有录音（文字记录导入的会议）返回 null */
  segmentAudio(workDir: string, start: number, end: number): string | null;
  /** 在线语音识别接口转写一段 wav（测试连接用；替身里不联网） */
  cloudTranscribe(cfg: CloudAsrConfig, wav: Buffer): Promise<CloudAsrResult>;
}

export interface RuntimeCheck {
  python: boolean;
  ffmpeg: boolean;
  /** 已下载的 Whisper 模型（large-v3 没下载时会退到已下载的更小模型）；一个都没有为 null */
  asrModel: string | null;
  /** 会议转写 · SenseVoice / FireRedASR2 下载了没有 */
  senseVoice?: boolean;
  fireRed?: boolean;
  /** 声纹：CAM++ / ERes2NetV2（会议认人推荐后者）下载了没有 */
  speaker: boolean;
  speaker2?: boolean;
  modelsDir: string;
}

function defaultExternals(): MmExternals {
  return {
    runMeetingPipeline: (i) => pipeline.runMeetingPipeline(i as any) as Promise<R.PipelineOutput>,
    generatePlan: (i) => pipeline.generatePlan(i),
    organizeMinutes: (i) => pipeline.organizeMinutes(i),
    generateWeeklyReport: (i) => pipeline.generateWeeklyReport(i),
    generateProjectSummary: (i) => pipeline.generateProjectSummary(i),
    enrollVoiceprint: (p) => pipeline.enrollVoiceprint(p),
    meetingVoiceSample: (d, r) => pipeline.meetingVoiceSample(d, r),
    exportSpeakerClip: (i) => pipeline.exportSpeakerClip(i),
    createWecom: (cfg) => new WecomClient(cfg),
    createWebhook: (url) => new WecomWebhook(url),
    diffOrg: (prev, next) => diffOrg(prev, next),
    noticeCard: (n, ctx) => noticeCard(n, ctx),
    dueReminders: (s, now) => dueReminders(s, now),
    startScheduler: (tick, ms) => startMeetingScheduler(tick, ms),
    startMobileServer: (o) => startMeetingMobileServer(o),
    seal: { can: canSealSecret, seal: sealSecret, unseal: unsealSecret },
    checkRuntime: async () => {
      const { resolveMeetingRuntime } = await import('./pipeline/runtime');
      const rt = await resolveMeetingRuntime();
      return { python: !!rt.python, ffmpeg: !!rt.ffmpeg, asrModel: rt.whisperModel, senseVoice: !!rt.senseVoiceDir, fireRed: !!rt.fireRedDir, speaker: !!rt.campp, speaker2: !!rt.campp2, modelsDir: rt.whisperModelsDir };
    },
    detectHardware: (dir) => detectHardware(dir),
    cloudTranscribe: (cfg, wav) => cloudTranscribe(cfg, wav, { timeoutMs: 30_000 }),
    segmentAudio: (workDir, start, end) => {
      const f = join(workDir, AUDIO_FILE);
      return existsSync(f) ? pipeline.sliceWavBase64(f, { start, end }) : null;
    },
  };
}

// ─── 常量 ─────────────────────────────────────────────────────────────

/** 文件扩展名 → 类别（文档 1.6）；认不出的标 audio，交给流水线用 ffprobe 探测（有音轨就当音频处理） */
const AUDIO_EXT = new Set(['mp3', 'm4a', 'wav', 'aac', 'amr', 'flac', 'ogg', 'oga', 'opus', 'wma', 'caf', 'aiff', 'aif', 'aifc', 'm4b', '3ga', 'spx', 'ape', 'ac3', 'mka', 'silk', 'slk']);
const VIDEO_EXT = new Set(['mp4', 'mov', 'mkv', 'avi', 'flv', 'wmv', 'webm', 'm4v', '3gp', '3g2', 'mpeg', 'mpg', 'ts', 'mts', 'm2ts', 'vob', 'rmvb', 'rm', 'asf', 'ogv']);
const TRANSCRIPT_EXT = new Set(['txt', 'md', 'docx', 'srt', 'vtt', 'json']);

export function fileKindOf(name: string): MmFileKind {
  const ext = extname(name).slice(1).toLowerCase();
  if (TRANSCRIPT_EXT.has(ext)) return 'transcript';
  if (VIDEO_EXT.has(ext)) return 'video';
  return 'audio';
}

/** 系统选择框里列出的扩展名（ipc 层用） */
export const MM_PICK_EXTENSIONS = [...AUDIO_EXT, ...VIDEO_EXT, ...TRANSCRIPT_EXT];

/** 手机页不能执行的动作（只在电脑端：切身份、选文件、开手机页服务、演示数据、企微 / 系统设置写入） */
const MOBILE_BLOCKED = new Set([
  'identity.set', 'meeting.pickFiles', 'file.open', 'mobile.start', 'mobile.stop', 'mobile.status', 'mobile.link', 'demo.load', 'demo.clear', 'demo.transcript',
  'wecom.save', 'wecom.test', 'wecom.webhook.save', 'wecom.webhook.test', 'org.sync', 'org.import', 'org.person.contact',
  'setup.status', 'setup.finish', 'setup.llmTest', 'voiceprint.enrollData', 'wecom.secret.reveal', 'settings.save', 'voiceprint.link', 'voiceprint.send', 'voiceprint.import',
  'asr.mode.save', 'asr.cloud.save', 'asr.cloud.test', 'asr.cloud.reveal',
]);
/** 只在 ipc 层处理的动作 */
const PC_ONLY_IPC = new Set(['meeting.pickFiles', 'file.open', 'voiceprint.import', 'org.importFile']);

const MEETING_FILTER_PROCESSING: string[] = ['pending_upload', 'processing', 'failed', 'pending_assign', 'pending_confirm', 'pending_review'];
const MEETING_FILTER_FINAL: string[] = ['finalized', 'ended', 'pending_owner', 'plan_confirm', 'dispatched'];
const TASK_STATUSES: MmTaskStatus[] = ['to_accept', 'not_started', 'in_progress', 'done', 'cancelled'];
const MAX_CLIP_BYTES = 30 * 1024 * 1024;
/** 会议补充声纹样本：和本人注册声纹至少这么像才补（换了麦克风 / 房间的同一个人一般还有 0.4 以上） */
const LEARN_MIN_SELF_SIM = 0.35;
/** 逐段播放最长放几秒（16k 单声道 3 分钟约 5.8MB） */
const SEGMENT_AUDIO_MAX_SEC = 180;

type Origin = 'pc' | 'mobile';
interface Ctx { actorId: string | null; origin: Origin; now: number }
type Action = (c: Ctx, p: any) => unknown;
interface NoticeDraft { to: string; type: MmNoticeType; title: string; summary: string; link: MmLink }

export interface MeetingMgmtServiceOptions {
  store?: MeetingMgmtStore;
  llm: MmLlm;
  emit?: (ev: MmEvent) => void;
  now?: () => number;
  logger?: { info?: (...a: any[]) => void; warn?: (...a: any[]) => void };
  ext?: Partial<MmExternals>;
  schedulerIntervalMs?: number;
}

const str = (v: unknown, max = 500): string => String(v ?? '').trim().slice(0, max);
const strArr = (v: unknown): string[] => (Array.isArray(v) ? [...new Set(v.map((x) => String(x ?? '').trim()).filter(Boolean))] : []);

export class MeetingMgmtService {
  readonly store: MeetingMgmtStore;
  private readonly llm: MmLlm;
  private readonly emitFn: (ev: MmEvent) => void;
  private readonly nowFn: () => number;
  private readonly logger: MeetingMgmtServiceOptions['logger'];
  private readonly ext: MmExternals;
  private readonly schedulerIntervalMs?: number;

  private initializedRoot = '';
  private readonly jobs = new Map<string, AbortController>();
  private readonly planJobs = new Set<string>();
  private readonly summaryJobs = new Set<string>();
  private readonly reorganizing = new Set<string>();
  private readonly background = new Set<Promise<unknown>>();
  private stopScheduler: (() => void) | null = null;
  private mobile: MobileServerHandle | null = null;
  private stopped = false;

  constructor(o: MeetingMgmtServiceOptions) {
    this.store = o.store ?? new MeetingMgmtStore(undefined, (m) => o.logger?.warn?.('meeting-mgmt', m));
    this.llm = o.llm;
    this.emitFn = o.emit ?? (() => {});
    this.nowFn = o.now ?? Date.now;
    this.logger = o.logger;
    this.ext = { ...defaultExternals(), ...(o.ext || {}) };
    this.schedulerIntervalMs = o.schedulerIntervalMs;
  }

  // ─── 生命周期 ───────────────────────────────────────────────────────

  /** 启动定时提醒 */
  startBackground(): void {
    if (this.stopScheduler) return;
    this.stopped = false;
    this.stopScheduler = this.ext.startScheduler(() => this.tick(), this.schedulerIntervalMs);
  }

  /** 停掉定时器、手机页服务、正在跑的流水线（应用退出 / 工作台卸载） */
  async stop(): Promise<void> {
    this.stopped = true;
    try { this.stopScheduler?.(); } catch { /* ignore */ }
    this.stopScheduler = null;
    for (const c of this.jobs.values()) { try { c.abort(); } catch { /* ignore */ } }
    const m = this.mobile;
    this.mobile = null;
    if (m) { try { await m.stop(); } catch { /* ignore */ } }
  }

  /** 等后台任务（流水线、方案、总结、企微发送）都跑完（单测用） */
  async idle(): Promise<void> {
    while (this.background.size) await Promise.allSettled([...this.background]);
  }

  private track<T>(p: Promise<T>): Promise<T> {
    this.background.add(p);
    void p.finally(() => this.background.delete(p)).catch(() => {});
    return p;
  }

  private emit(ev: MmEvent): void {
    try { this.emitFn(ev); } catch { /* 窗口已关 */ }
  }

  private changed(scope: Extract<MmEvent, { type: 'changed' }>['scope'], id?: string): void {
    this.emit({ type: 'changed', scope, ...(id ? { id } : {}) });
  }

  private warn(msg: string, meta?: unknown): void {
    this.logger?.warn?.('meeting-mgmt', msg, meta);
  }

  // ─── 入口 ───────────────────────────────────────────────────────────

  /** PC 端当前身份 */
  pcActorId(): string | null {
    this.ensureInit();
    return this.store.read().meId;
  }

  dispatchPc(action: string, payload: unknown): Promise<unknown> {
    return this.dispatch(this.pcActorId(), action, payload, 'pc');
  }

  async dispatch(actorId: string | null, action: string, payload: unknown, origin: Origin = 'pc'): Promise<unknown> {
    this.ensureInit();
    const name = String(action || '');
    if (origin === 'mobile' && MOBILE_BLOCKED.has(name)) throw new Error(i18nT('手机页不能执行这个操作，请在电脑端操作'));
    if (PC_ONLY_IPC.has(name)) throw new Error(i18nT('这个操作只能在电脑端使用'));
    const fn = this.actions[name];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: name }));
    const p = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
    return fn({ actorId: actorId || null, origin, now: this.nowFn() }, p);
  }

  /** 第一次使用 / 换账号后：没有组织就载入演示组织；中断的处理标失败；当前身份兜底 */
  private ensureInit(): void {
    const root = this.store.root();
    if (this.initializedRoot === root) return;
    this.initializedRoot = root;
    const now = this.nowFn();
    let s = this.store.read();
    if (s.org.source === 'none' && !s.org.people.length && !s.settings.adminIds.length) {
      this.loadDemo(now, null);
      s = this.store.read();
    }
    const interrupted = s.meetings.filter((m) => m.status === 'processing' && !this.jobs.has(m.id));
    const stuckPlans = s.meetings.filter((m) => m.status === 'finalized' && m.taskDecision === 'generate' && !this.planJobs.has(m.id));
    const meBad = !R.activePerson(s.org, s.meId);
    if (!interrupted.length && !stuckPlans.length && !meBad) return;
    this.store.update((st) => {
      for (const m of st.meetings) {
        if (interrupted.some((x) => x.id === m.id)) R.failProcessing(m, i18nT('处理被中断（应用退出或重启），请重试'), now);
        if (stuckPlans.some((x) => x.id === m.id)) m.taskDecision = undefined;
      }
      if (!R.activePerson(st.org, st.meId)) st.meId = st.settings.adminIds.find((id) => R.activePerson(st.org, id)) ?? null;
    });
  }

  // ─── 身份与权限 ─────────────────────────────────────────────────────

  private s(): MmStoredState { return this.store.read(); }

  private isAdmin(id: string | null | undefined): boolean {
    const s = this.s();
    return !!id && s.settings.adminIds.includes(id) && !!R.activePerson(s.org, id);
  }

  private hasActiveAdmin(): boolean {
    const s = this.s();
    return s.settings.adminIds.some((id) => !!R.activePerson(s.org, id));
  }

  private me(c: Ctx): MmPerson {
    const p = R.activePerson(this.s().org, c.actorId);
    if (!p) throw new Error(i18nT('当前身份无效，请先选择身份'));
    return p;
  }

  private requireAdmin(c: Ctx, what: string): MmPerson {
    const p = this.me(c);
    if (!this.isAdmin(p.id)) throw new Error(i18nT('只有管理员可以{p0}', { p0: what }));
    return p;
  }

  private meView(id: string | null): MmMe {
    const s = this.s();
    const person = R.activePerson(s.org, id);
    return {
      person,
      isAdmin: this.isAdmin(person?.id),
      canCreateProject: !!person && (this.isAdmin(person.id) || s.settings.projectCreatorIds.includes(person.id)),
    };
  }

  /** PC 端能不能切身份：还没有管理员，或当前身份 / 本机操作人是管理员 */
  private canSwitch(c: Ctx): boolean {
    if (c.origin !== 'pc') return false;
    return !this.hasActiveAdmin() || this.isAdmin(c.actorId) || this.isAdmin(this.s().operatorId);
  }

  /** 我参与的项目：负责人、成员、创建人（管理员替别人建的项目也看得到） */
  private inProject(pid: string, p: MmProject): boolean {
    return p.ownerId === pid || p.memberIds.includes(pid) || p.createdBy === pid;
  }

  private canSeeProject(pid: string, p: MmProject): boolean {
    return this.isAdmin(pid) || this.inProject(pid, p);
  }

  private canSeeMeeting(pid: string, m: MmMeeting, p?: MmProject): boolean {
    return (!!p && this.canSeeProject(pid, p)) || m.hostId === pid || m.attendeeIds.includes(pid) || R.planOwners(m.plan).includes(pid)
      || m.confirmations.some((c) => c.personId === pid);
  }

  private canSeeTask(pid: string, t: MmTask, p?: MmProject): boolean {
    return (!!p && this.canSeeProject(pid, p)) || t.assigneeId === pid || R.taskOwners(t).includes(pid);
  }

  private findProject(s: MmStoredState, id: unknown): MmProject {
    const p = s.projects.find((x) => x.id === id);
    if (!p) throw new Error(i18nT('项目不存在或已删除'));
    return p;
  }

  private findMeeting(s: MmStoredState, id: unknown): MmMeeting {
    const m = s.meetings.find((x) => x.id === id);
    if (!m) throw new Error(i18nT('会议不存在或已删除'));
    return m;
  }

  private findTask(s: MmStoredState, id: unknown): MmTask {
    const t = s.tasks.find((x) => x.id === id);
    if (!t) throw new Error(i18nT('任务不存在或已删除'));
    return t;
  }

  private visibleMeeting(c: Ctx, id: unknown): { m: MmMeeting; p: MmProject } {
    const me = this.me(c);
    const s = this.s();
    const m = this.findMeeting(s, id);
    const p = this.findProject(s, m.projectId);
    if (!this.canSeeMeeting(me.id, m, p)) throw new Error(i18nT('你没有参与这场会议'));
    return { m, p };
  }

  private visibleTask(c: Ctx, id: unknown): { t: MmTask; p: MmProject } {
    const me = this.me(c);
    const s = this.s();
    const t = this.findTask(s, id);
    const p = this.findProject(s, t.projectId);
    if (!this.canSeeTask(me.id, t, p)) throw new Error(i18nT('你没有参与这个任务'));
    return { t, p };
  }

  private nameOf = (id: string): string => T.personName(this.s().org, id);
  /** 多个人名用顿号连起来（任务负责人可以多位） */
  private namesOf = (ids: string[]): string => ids.map((id) => this.nameOf(id)).filter(Boolean).join(i18nT('、'));

  // ─── 令牌与链接 ─────────────────────────────────────────────────────

  /**
   * 手机页服务调用：令牌 → 人员 id；令牌不对返回 null。
   * 令牌的主人已离职 / 不在组织里了也照样返回 id：boot 会回 me.person = null，页面提示「请联系管理员同步通讯录」
   * （而不是「链接已失效」）；其它动作由 me() 拦下。
   */
  personByToken(token: string): string | null {
    const tok = String(token || '');
    if (!tok) return null;
    for (const [pid, t] of Object.entries(this.s().tokens)) if (t === tok) return pid;
    return null;
  }

  private ensureToken(personId: string, reset = false): string {
    const cur = this.s().tokens[personId];
    if (cur && !reset) return cur;
    const token = randomBytes(18).toString('base64url');
    this.store.update((s) => { s.tokens[personId] = token; });
    return token;
  }

  /** 卡片 / 专属链接的地址前缀：设置里的卡片地址，否则手机页服务的局域网地址 */
  private linkBase(): string {
    const base = this.s().settings.wecom.cardBaseUrl || this.mobile?.url || '';
    return base.replace(/\/+$/, '');
  }

  /** 发出去的链接只有公司内网能打开（没填外网地址，用的是手机页服务的局域网地址） */
  private lanOnly(): boolean {
    const base = this.linkBase();
    return !!base && isLanOnlyUrl(base);
  }

  /** 某人的专属链接（带令牌，格式由手机页服务定：<base>/m?t=…#/… ；声纹采集页 <base>/v?t=…） */
  personUrl(personId: string, target?: { link?: MmLink; page?: 'voiceprint' }, reset = false): string {
    const base = this.linkBase();
    if (!base) return '';
    const token = this.ensureToken(personId, reset);
    return target?.page === 'voiceprint' ? buildVoiceprintUrl(base, token) : buildMobileUrl(base, token, target?.link ?? null);
  }

  // ─── 通知 ───────────────────────────────────────────────────────────

  private wecomConfigured(): boolean {
    const w = this.s().settings.wecom;
    return !!(w.corpId && w.agentId && w.hasSecret);
  }

  /** 群机器人发送地址（解密后）；没配 / 解不开返回 '' */
  private webhookUrl(): string {
    if (!this.s().settings.wecom.hasWebhook) return '';
    const sealed = this.store.readWebhook();
    if (!sealed) return '';
    try { return this.ext.seal.unseal(sealed) || ''; } catch (e) { this.warn('wecom webhook unseal failed', { error: (e as Error)?.message }); return ''; }
  }

  /** 通知往哪发：配了自建应用 → 发给个人；没配但有群机器人 → 发进群；都没有 → 只进消息中心 */
  private pushChannel(): 'app' | 'webhook' | null {
    if (this.wecomConfigured()) return 'app';
    if (this.s().settings.wecom.hasWebhook && this.store.readWebhook()) return 'webhook';
    return null;
  }

  private pushNotices(list: MmNotice[]): Promise<void> {
    const ch = this.pushChannel();
    return ch === 'app' ? this.pushWecom(list) : ch === 'webhook' ? this.pushGroup(list) : Promise.resolve();
  }

  private wecomClient(): WecomLike | null {
    if (!this.wecomConfigured()) return null;
    const w = this.s().settings.wecom;
    const sealed = this.store.readSecret();
    if (!sealed) return null;
    let secret = '';
    try { secret = this.ext.seal.unseal(sealed); } catch (e) { this.warn('wecom secret unseal failed', { error: (e as Error)?.message }); return null; }
    if (!secret) return null;
    return this.ext.createWecom({ corpId: w.corpId, agentId: w.agentId, secret });
  }

  /** 写消息中心（同一批里同一人同一事件同一对象只发一条），有企微配置再异步发卡片 */
  private notify(drafts: NoticeDraft[], now: number): MmNotice[] {
    const s = this.s();
    const seen = new Set<string>();
    const list: MmNotice[] = [];
    for (const d of drafts) {
      if (!d.to || !R.activePerson(s.org, d.to)) continue;
      const key = `${d.to}|${d.type}|${d.link.kind}|${d.link.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      list.push({ id: newId('nt'), at: now, to: d.to, type: d.type, title: d.title, summary: d.summary, link: d.link, read: false });
    }
    if (!list.length) return [];
    this.store.update((st) => { st.notices.push(...list); });
    this.changed('notice');
    if (this.pushChannel()) this.track(this.pushNotices(list));
    return list;
  }

  private async pushWecom(list: MmNotice[]): Promise<void> {
    const client = this.wecomClient();
    if (!client) return;
    const base = this.linkBase();
    for (const n of list) {
      let r: { ok: boolean; error?: string };
      const person = this.s().org.people.find((p) => p.id === n.to);
      if (!base) {
        r = { ok: false, error: i18nT('没有可用的卡片跳转地址：请开启手机页服务，或在设置里填写卡片地址') };
      } else {
        try {
          const card = this.ext.noticeCard(n, { linkFor: (pid, link) => this.personUrl(pid, { link }), footnote: this.lanOnly() ? lanLinkNote() : undefined });
          const uid = person?.wecomUserId || n.to;
          const sent: { ok: boolean; error?: string; invalidUsers?: string[] } = await client.sendCard([uid], card);
          // 企微照收但这个人收不到（不在应用可见范围 / 已离职 / 没有许可）：算失败
          r = sent.ok && sent.invalidUsers?.includes(uid) ? { ok: false, error: i18nT('接收人不在企微应用可见范围内或已离职，收不到卡片') } : sent;
        } catch (e) {
          r = { ok: false, error: (e as Error)?.message || i18nT('发送失败') };
        }
      }
      const at = this.nowFn();
      try {
        this.store.update((s) => {
          const x = s.notices.find((y) => y.id === n.id);
          if (x) x.wecom = r.ok ? { sentAt: at } : { error: r.error || i18nT('发送失败') };
        });
      } catch { /* 写失败不影响 */ }
      if (!r.ok) this.warn('wecom card failed', { type: n.type, error: r.error });
    }
    this.changed('notice');
  }

  /**
   * 群消息里怎么 @ 这个人：有手机号按手机号；企微账号可信（企微同步 / 导入的通讯录，或管理员手动填过）按账号；
   * 都没有只写姓名。演示组织里自带的账号是编的，不能拿来 @。
   */
  private mentionOf(person: MmPerson | undefined, fallbackName: string): { name: string; userId?: string; mobile?: string } {
    if (!person) return { name: fallbackName };
    const source = this.s().org.source;
    const trusted = person.wecomUserId && (source === 'wecom' || source === 'import' || person.wecomIdManual);
    return { name: person.name, ...(trusted ? { userId: person.wecomUserId } : {}), ...(person.mobile ? { mobile: person.mobile } : {}) };
  }

  /** 同步 / 导入换新通讯录时，管理员手动填的手机号、企微账号带过去（新数据里没有才带） */
  private carryContacts(prev: MmPerson[], next: MmPerson[]): MmPerson[] {
    const old = new Map(prev.map((p) => [p.id, p]));
    return next.map((p) => {
      const o = old.get(p.id);
      if (!o) return p;
      return {
        ...p,
        ...(!p.mobile && o.mobile ? { mobile: o.mobile } : {}),
        ...(o.wecomIdManual && o.wecomUserId && !p.wecomUserId ? { wecomUserId: o.wecomUserId, wecomIdManual: true } : {}),
      };
    });
  }

  /** 换上新通讯录：企微里 / 表里没有了的人标离职（保留历史数据） */
  private replaceOrg(next: { depts: MmDept[]; people: MmPerson[] }, source: 'wecom' | 'demo' | 'import', result: MmOrgSyncResult): void {
    const nextIds = new Set(next.people.map((x) => x.id));
    this.store.update((st) => {
      const people = this.carryContacts(st.org.people, next.people);
      const left = st.org.people.filter((x) => !nextIds.has(x.id)).map((x) => ({ ...x, left: true }));
      st.org = { depts: next.depts, people: [...people.map((x) => ({ ...x, left: undefined })), ...left], source, lastSync: result };
    });
    this.changed('org');
  }

  /**
   * 群机器人：同一事件同一对象的几条通知合成一条群消息（@ 每位接收人），按钮是不带令牌的群链接。
   * 通讯录来自企微同步才真 @（`<@userid>`），演示组织只写姓名。
   */
  private async pushGroup(list: MmNotice[]): Promise<void> {
    const url = this.webhookUrl();
    if (!url) return;
    const hook = this.ext.createWebhook(url);
    const base = this.linkBase();
    const groups = new Map<string, MmNotice[]>();
    for (const n of list) {
      const key = `${n.type}|${n.link.kind}|${n.link.id}|${n.link.anchor || ''}`;
      const g = groups.get(key);
      if (g) g.push(n); else groups.set(key, [n]);
    }
    for (const g of groups.values()) {
      const first = g[0]!;
      const org = this.s().org;
      const mentions = g.map((n) => this.mentionOf(org.people.find((p) => p.id === n.to), n.to));
      let r: { ok: boolean; error?: string };
      try {
        r = await hook.send(buildGroupMessage({
          label: noticeTypeLabel(first.type), title: first.title, summary: first.summary, mentions,
          url: base ? buildGroupUrl(base, first.link) : '', buttonText: noticeButtonText(first.type), lanOnly: !!base && isLanOnlyUrl(base),
        }));
      } catch (e) {
        r = { ok: false, error: (e as Error)?.message || i18nT('发送失败') };
      }
      const at = this.nowFn();
      const ids = new Set(g.map((n) => n.id));
      try {
        this.store.update((s) => {
          for (const x of s.notices) if (ids.has(x.id)) x.wecom = r.ok ? { sentAt: at } : { error: r.error || i18nT('发送失败') };
        });
      } catch { /* 写失败不影响 */ }
      if (!r.ok) this.warn('wecom webhook failed', { type: first.type, error: r.error });
    }
    this.changed('notice');
  }

  // ─── 演示数据 ───────────────────────────────────────────────────────

  private loadDemo(now: number, by: string | null): void {
    const org = buildDemoOrg();
    const data = buildDemoData(now);
    const old = this.s().meetings.map((m) => m.id);
    const valid = (id: string | null | undefined): id is string => !!id && org.people.some((p) => p.id === id);
    this.store.update((s) => {
      s.org = {
        depts: org.depts, people: org.people, source: 'demo',
        lastSync: { at: now, by: by || DEMO_ADMIN_ID, source: 'demo', added: org.people.map((p) => p.id), changed: [], left: [] },
      };
      s.projects = data.projects;
      s.meetings = data.meetings;
      s.tasks = data.tasks;
      s.notices = data.notices;
      s.demoLoaded = true;
      s.settings.adminIds = s.settings.adminIds.filter(valid);
      if (!s.settings.adminIds.length) s.settings.adminIds = [DEMO_ADMIN_ID];
      s.settings.projectCreatorIds = s.settings.projectCreatorIds.filter(valid);
      if (!valid(s.meId)) s.meId = s.settings.adminIds[0];
      if (!valid(s.operatorId)) s.operatorId = s.settings.adminIds[0];
      s.voiceprints = s.voiceprints.filter((v) => valid(v.personId));
      s.tokens = Object.fromEntries(Object.entries(s.tokens).filter(([pid]) => valid(pid)));
    });
    for (const id of old) this.store.removeMeetingFiles(id);
  }

  // ─── 视图 ───────────────────────────────────────────────────────────

  private taskView(t: MmTask, now: number): MmTaskView {
    return T.taskView(t, this.s(), now);
  }

  private projectCard(p: MmProject, now: number) {
    const tasks = this.s().tasks.filter((t) => t.projectId === p.id && t.status !== 'cancelled');
    const done = tasks.filter((t) => t.status === 'done').length;
    const total = tasks.length;
    return {
      id: p.id, name: p.name, desc: p.desc, status: p.status, ownerId: p.ownerId, ownerName: this.nameOf(p.ownerId),
      done, total, overdue: tasks.filter((t) => R.isTaskOverdue(t, now)).length, rate: total ? Math.round((done / total) * 100) : 0,
      memberCount: p.memberIds.length, meetingCount: this.s().meetings.filter((m) => m.projectId === p.id).length,
    };
  }

  private meetingCard(m: MmMeeting, needsMe: Set<string>): MmMeetingCard {
    const s = this.s();
    const done = m.confirmations.filter((c) => c.status === 'confirmed').length;
    const confirmText = m.status === 'pending_confirm' ? i18nT('已确认 {p0}/{p1}', { p0: done, p1: m.confirmations.length })
      : m.status === 'processing' ? stageText(m.process?.stage) : '';
    return {
      id: m.id, title: m.title, projectId: m.projectId, projectName: s.projects.find((p) => p.id === m.projectId)?.name || '',
      time: m.time, status: m.status, source: m.source, hostId: m.hostId, hostName: this.nameOf(m.hostId),
      needsMe: needsMe.has(m.id),
      ...(confirmText ? { confirmText } : {}),
    };
  }

  private namesFor(ids: Iterable<string>): Record<string, { name: string; deptName: string }> {
    const org = this.s().org;
    const out: Record<string, { name: string; deptName: string }> = {};
    for (const id of ids) {
      if (!id || out[id]) continue;
      const p = org.people.find((x) => x.id === id);
      out[id] = { name: p?.name || i18nT('未知人员'), deptName: p ? T.deptName(org, p.deptId) : '' };
    }
    return out;
  }

  /** 返回给调用方的会议快照（不是缓存里的活对象：后台流水线改状态不会影响已返回的结果）；手机页拿到的不带本机文件路径 */
  private forOrigin(m: MmMeeting, origin: Origin): MmMeeting {
    const copy = structuredClone(m);
    if (origin !== 'mobile') return copy;
    return { ...copy, files: copy.files.map((f) => ({ ...f, path: '' })), speakers: copy.speakers.map((sp) => ({ ...sp, clipPath: undefined })) };
  }

  private myTodos(c: Ctx) {
    return T.computeTodos(this.s(), c.actorId, c.now);
  }

  // ─── 动作 ───────────────────────────────────────────────────────────

  private readonly actions: Record<string, Action> = {
    'boot': (c) => {
      void this.resumeMobile();
      const s = this.s();
      const todos = R.activePerson(s.org, c.actorId) ? this.myTodos(c) : [];
      const operator = R.activePerson(s.org, s.operatorId);
      return {
        me: this.meView(c.actorId),
        canSwitchIdentity: this.canSwitch(c),
        // 坐在这台电脑前的管理员：切成别人代办后，界面给「回到 X（管理员）」
        operatorId: operator && this.isAdmin(operator.id) ? operator.id : null,
        operator: operator && this.isAdmin(operator.id) ? { id: operator.id, name: operator.name } : null,
        org: { source: s.org.source, deptCount: s.org.depts.length, peopleCount: s.org.people.filter((p) => !p.left).length, lastSync: s.org.lastSync },
        settings: s.settings,
        wecomConnected: this.wecomConfigured(),
        pushChannel: this.pushChannel(),
        mobile: this.mobileStatus(),
        /** 发送失败的企微卡片条数（只给管理员看） */
        pushFailed: this.isAdmin(c.actorId || '') ? s.notices.filter((n) => n.wecom?.error).length : 0,
        badges: T.todoBadges(todos),
        demoLoaded: s.demoLoaded,
        /** 管理员还没走过配置引导：界面自动弹引导 */
        setupPending: this.isAdmin(c.actorId || '') && !s.setupDoneAt,
      };
    },

    // ── 配置引导（管理员）：组织、通知推送、手机端、语音模型、声纹、大模型一步步配 ──
    'setup.status': async (c) => {
      const me = this.requireAdmin(c, i18nT('查看配置引导'));
      const s = this.s();
      const active = s.org.people.filter((p) => !p.left);
      let rt: RuntimeCheck | null = null;
      try { rt = await this.ext.checkRuntime(); } catch (e) { this.warn('setup runtime check failed', { error: (e as Error)?.message }); }
      const hardware = this.ext.detectHardware(rt?.modelsDir || undefined);
      const rec = recommendAsr(hardware);
      return {
        done: !!s.setupDoneAt, doneAt: s.setupDoneAt ?? null,
        org: {
          source: s.org.source, people: active.length, depts: s.org.depts.length, lastSync: s.org.lastSync ?? null,
          mentionable: active.filter((p) => { const m = this.mentionOf(p, p.name); return !!(m.mobile || m.userId); }).length,
        },
        push: { channel: this.pushChannel(), hasWebhook: !!s.settings.wecom.hasWebhook, webhookMasked: s.settings.wecom.webhookMasked || '', appConfigured: this.wecomConfigured() },
        // 自建应用已填的内容：引导再打开时原样带出（Secret 只回「有没有」，要看原文走 wecom.secret.reveal）
        wecom: { corpId: s.settings.wecom.corpId, agentId: s.settings.wecom.agentId, hasSecret: !!s.settings.wecom.hasSecret && !!this.store.readSecret() },
        me: { id: me.id, name: me.name, deptName: T.deptName(s.org, me.deptId), mobile: me.mobile || '', voiceprint: s.voiceprints.some((v) => v.personId === me.id) },
        mobile: this.mobileStatus(),
        voiceprints: { collected: s.voiceprints.filter((v) => active.some((p) => p.id === v.personId)).length, total: active.length },
        hardware,
        models: {
          python: !!rt?.python, ffmpeg: !!rt?.ffmpeg, asrModel: rt?.asrModel ?? null, speaker: !!rt?.speaker,
          senseVoice: !!rt?.senseVoice, fireRed: !!rt?.fireRed,
          // 推荐方案要的模型都下好了没有（FireRedASR2 方案 = FireRedASR2 + SenseVoice 兜底）
          asrReady: rec.installIds.every((id) => (id === MEETING_ASR_IDS.firered ? !!rt?.fireRed : !!rt?.senseVoice)),
        },
        recommend: { ...rec, speakerInstallId: SPEAKER_INSTALL_ID },
        /** 两个本机模型在这台电脑上处理 1 小时录音各要几分钟（粗估） */
        estimates: { firered: estimateMinPerHour('firered', hardware).minutes, sensevoice: estimateMinPerHour('sensevoice', hardware).minutes },
        asr: this.asrSettingsView(),
      };
    },

    'setup.finish': (c) => {
      this.requireAdmin(c, i18nT('完成配置引导'));
      const at = this.nowFn();
      this.store.update((st) => { st.setupDoneAt = at; });
      return { ok: true, doneAt: at };
    },

    /** 试一下 App 里选的大模型能不能用（纪要整理、拆任务、写报告都靠它；不能用时按规则兜底，效果差很多） */
    'setup.llmTest': async (c) => {
      this.requireAdmin(c, i18nT('测试大模型'));
      const t0 = this.nowFn();
      let reply: string | null = null;
      try { reply = await this.llm(i18nT('这是连接测试，请只回复两个字：收到'), { timeoutMs: 45_000 }); } catch { reply = null; }
      const text = String(reply ?? '').trim();
      return text ? { ok: true, reply: text.slice(0, 60), ms: this.nowFn() - t0 } : { ok: false };
    },

    'identity.set': (c, p) => {
      if (!this.canSwitch(c)) throw new Error(i18nT('只有管理员可以切换身份'));
      const s = this.s();
      const target = R.requireActivePerson(s.org, str(p.personId), i18nT('要切换的人员'));
      const noAdmin = !this.hasActiveAdmin();
      const actorIsAdmin = this.isAdmin(c.actorId);
      this.store.update((st) => {
        // 还没有管理员：第一次选的身份就是管理员（文档：第一次打开时把当前身份设为管理员）
        if (noAdmin) { st.settings.adminIds = [target.id]; st.operatorId = target.id; }
        // 本机操作人只在「还没有在职的管理员操作人」时才换成当前管理员（管理员切成别人后还能切回来）
        else if (actorIsAdmin && !(st.operatorId && st.settings.adminIds.includes(st.operatorId) && R.activePerson(st.org, st.operatorId))) st.operatorId = c.actorId;
        st.meId = target.id;
      });
      this.changed('all');
      return this.meView(target.id);
    },

    'people.list': (): MmPeople => {
      const org = this.s().org;
      return { depts: org.depts, people: org.people.filter((p) => !p.left) };
    },

    'home.get': (c): MmHomeView => {
      const me = this.me(c);
      const s = this.s();
      const todos = this.myTodos(c);
      const mine = s.notices.filter((n) => n.to === me.id);
      const unread = mine.filter((n) => !n.read).length;
      const visibleMeetings = s.meetings.filter((m) => this.canSeeMeeting(me.id, m, s.projects.find((p) => p.id === m.projectId)));
      return {
        me: this.meView(me.id),
        greetingName: me.name,
        counts: T.homeCounts(todos, s, me.id, unread, c.now),
        todos,
        myTasksThisWeek: T.myTasksThisWeek(s, me.id, c.now),
        projects: s.projects.filter((p) => this.inProject(me.id, p))
          .map((p) => { const x = this.projectCard(p, c.now); return { id: x.id, name: x.name, status: x.status, done: x.done, total: x.total, overdue: x.overdue, ownerName: x.ownerName }; }),
        recentMeetings: [...visibleMeetings].sort((a, b) => b.time - a.time).slice(0, 6)
          .map((m) => ({ id: m.id, title: m.title, projectName: s.projects.find((p) => p.id === m.projectId)?.name || '', status: m.status, time: m.time })),
        notices: [...mine].sort((a, b) => b.at - a.at).slice(0, 10),
      };
    },

    // ── 通知 ──
    'notice.list': (c, p) => {
      const me = this.me(c);
      return this.s().notices.filter((n) => n.to === me.id && (!p.unreadOnly || !n.read)).sort((a, b) => b.at - a.at).slice(0, 300);
    },
    /** 企微推送失败记录（管理员）：最近 200 条 */
    'notice.push.failed': (c) => {
      this.requireAdmin(c, i18nT('查看推送失败记录'));
      const s = this.s();
      const failed = s.notices.filter((n) => n.wecom?.error);
      return {
        total: failed.length,
        items: failed.slice(-200).reverse().map((n) => ({
          id: n.id, at: n.at, to: n.to, toName: s.org.people.find((p) => p.id === n.to)?.name || n.to,
          type: n.type, title: n.title, error: n.wecom!.error!,
        })),
      };
    },

    /** 重发失败的企微卡片（管理员）：p.ids 指定几条，或 p.all = true 全部重发；等发完返回结果 */
    'notice.push.retry': async (c, p) => {
      this.requireAdmin(c, i18nT('重发企微通知'));
      if (!this.pushChannel()) throw new Error(i18nT('还没有配置企业微信（自建应用或群机器人）'));
      const ids = Array.isArray(p.ids) ? new Set((p.ids as unknown[]).map(String)) : null;
      if (!ids && p.all !== true) throw new Error(i18nT('请选择要重发的通知'));
      const list = this.store.update((st) => {
        const pick = st.notices.filter((n) => n.wecom?.error && (!ids || ids.has(n.id)) && R.activePerson(st.org, n.to));
        for (const n of pick) n.wecom = undefined;
        return pick.map((n) => ({ ...n }));
      });
      if (!list.length) return { sent: 0, failed: 0 };
      await this.pushNotices(list);
      const after = this.s().notices.filter((n) => list.some((x) => x.id === n.id));
      return { sent: after.filter((n) => n.wecom?.sentAt).length, failed: after.filter((n) => n.wecom?.error).length };
    },

    'notice.read': (c, p) => {
      const me = this.me(c);
      const ids = strArr(p.ids);
      this.store.update((s) => {
        for (const n of s.notices) if (n.to === me.id && (p.all === true || ids.includes(n.id))) n.read = true;
      });
      this.changed('notice');
      return { ok: true, unread: this.s().notices.filter((n) => n.to === me.id && !n.read).length };
    },

    // ── 项目 ──
    'project.list': (c, p) => {
      const me = this.me(c);
      const q = str(p.q, 100).toLowerCase();
      const status = ['active', 'closing', 'archived'].includes(p.status) ? (p.status as MmProjectStatus) : null;
      return this.s().projects
        .filter((x) => this.inProject(me.id, x))
        .filter((x) => !status || x.status === status)
        .filter((x) => !q || x.name.toLowerCase().includes(q) || x.desc.toLowerCase().includes(q))
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((x) => this.projectCard(x, c.now));
    },

    'project.get': (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const project = this.findProject(s, p.id);
      if (!this.canSeeProject(me.id, project)) throw new Error(i18nT('你不是这个项目的成员'));
      const meetings = s.meetings.filter((m) => m.projectId === project.id).sort((a, b) => b.time - a.time);
      const tasks = s.tasks.filter((t) => t.projectId === project.id);
      const live = tasks.filter((t) => t.status !== 'cancelled');
      const week = R.weekRange(c.now);
      const weekTasks = live.filter((t) => t.due >= week.fromYmd && t.due <= week.toYmd);
      const todos = this.myTodos(c);
      const needsMe = new Set(todos.filter((t) => t.group === 'meeting').map((t) => t.link.id));
      const deptIds = [...new Set(live.map((t) => t.deptId))];
      const isOwner = project.ownerId === me.id;
      return {
        project,
        ownerName: this.nameOf(project.ownerId),
        members: project.memberIds.map((id) => s.org.people.find((x) => x.id === id)).filter(Boolean) as MmPerson[],
        meetings: meetings.map((m) => this.meetingCard(m, needsMe)),
        tasks: tasks.map((t) => this.taskView(t, c.now)),
        stats: {
          meetings: meetings.length,
          done: live.filter((t) => t.status === 'done').length,
          total: live.length,
          overdue: live.filter((t) => R.isTaskOverdue(t, c.now)).length,
          objections: tasks.filter((t) => R.hasOpenObjection(t)).length,
          weekRate: weekTasks.length ? Math.round((weekTasks.filter((t) => t.status === 'done').length / weekTasks.length) * 100) : 0,
        },
        deptProgress: deptIds.map((deptId) => {
          const list = live.filter((t) => t.deptId === deptId);
          return { deptId, name: T.deptName(s.org, deptId), done: list.filter((t) => t.status === 'done').length, total: list.length };
        }),
        decisions: meetings.filter((m) => R.isMinutesLocked(m))
          .flatMap((m) => m.decisions.map((d) => ({ text: d.text, at: m.finalizedAt || m.time, meetingTitle: m.title, meetingId: m.id }))),
        closeBlockers: project.status === 'active' ? R.closeCheckItems(project, s.meetings, s.tasks) : [],
        summaryGenerating: this.summaryJobs.has(project.id),
        can: {
          editMembers: isOwner && project.status !== 'archived',
          close: isOwner && project.status === 'active',
          reviewSummary: isOwner && project.status === 'closing' && !!project.summary,
          createMeeting: project.status === 'active' && (isOwner || project.memberIds.includes(me.id) || this.isAdmin(me.id)),
          generateReport: (isOwner || this.isAdmin(me.id)) && project.status !== 'archived',
        },
      };
    },

    'project.create': (c, p) => {
      const me = this.me(c);
      const s = this.s();
      if (!this.meView(me.id).canCreateProject) throw new Error(i18nT('只有管理员或被授权的人可以新建项目'));
      const name = str(p.name, 100);
      if (!name) throw new Error(i18nT('请填写项目名称'));
      const owner = R.requireActivePerson(s.org, str(p.ownerId), i18nT('项目负责人'));
      const members = strArr(p.memberIds).map((id) => R.requireActivePerson(s.org, id, i18nT('项目成员')).id);
      const project: MmProject = {
        id: newId('pj'), name, desc: str(p.desc, 2000), ownerId: owner.id, memberIds: [...new Set([owner.id, ...members])],
        status: 'active', createdAt: c.now, createdBy: me.id, weeklyReports: [],
      };
      this.store.update((st) => { st.projects.push(project); });
      this.changed('project', project.id);
      return project;
    },

    'project.members': (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const ids = strArr(p.memberIds);
      for (const id of ids) {
        const person = s.org.people.find((x) => x.id === id);
        if (!person) throw new Error(i18nT('有成员不在组织里'));
      }
      const project = this.store.update((st) => {
        const pj = this.findProject(st, p.id);
        // 已离职的老成员可以留着（历史数据），新加的人必须在职
        const fresh = ids.filter((id) => !pj.memberIds.includes(id));
        for (const id of fresh) R.requireActivePerson(st.org, id, i18nT('项目成员'));
        R.applyMembers(pj, me.id, ids, st.meetings, st.tasks, this.nameOf);
        return pj;
      });
      this.changed('project', project.id);
      return project;
    },

    'project.close': (c, p) => {
      const me = this.me(c);
      const r = this.store.update((st) => {
        const pj = this.findProject(st, p.id);
        const items = R.closeCheckItems(pj, st.meetings, st.tasks);
        const ok = R.startClose(pj, me.id, items, c.now);
        return { ok, items };
      });
      this.changed('project', String(p.id));
      if (r.ok) this.track(this.runSummary(String(p.id)).catch(() => {}));
      return r;
    },

    'project.summary.regenerate': async (c, p) => {
      const me = this.me(c);
      const pj = this.findProject(this.s(), p.id);
      R.assertSummaryEditable(pj, me.id);
      return this.track(this.runSummary(pj.id, true));
    },

    'project.summary.save': (c, p) => {
      const me = this.me(c);
      const markdown = String(p.markdown ?? '');
      if (!markdown.trim()) throw new Error(i18nT('总结报告不能为空'));
      const summary = this.store.update((st) => {
        const pj = this.findProject(st, p.id);
        R.assertSummaryEditable(pj, me.id);
        if (!pj.summary) throw new Error(i18nT('总结报告还没有生成好'));
        pj.summary.markdown = markdown.slice(0, 200_000);
        pj.summary.editedAt = c.now;
        return pj.summary;
      });
      this.changed('project', String(p.id));
      return summary;
    },

    'project.summary.approve': (c, p) => {
      const me = this.me(c);
      if (this.summaryJobs.has(String(p.id))) throw new Error(i18nT('总结报告正在生成，请稍候'));
      const pj = this.store.update((st) => {
        const x = this.findProject(st, p.id);
        R.approveSummary(x, me.id, c.now);
        return x;
      });
      this.notify(pj.memberIds.map((to) => ({
        to, type: 'project_archived' as const, title: i18nT('项目已归档：{p0}', { p0: pj.name }),
        summary: i18nT('项目已归档，项目内容转为只读，总结报告可在系统内查看'), link: { kind: 'project_summary' as const, id: pj.id },
      })), c.now);
      this.changed('project', pj.id);
      return pj;
    },

    'project.report.generate': async (c, p) => {
      const me = this.me(c);
      const pj = this.findProject(this.s(), p.id);
      R.assertProjectNotArchived(pj);
      if (pj.ownerId !== me.id && !this.isAdmin(me.id)) throw new Error(i18nT('只有项目负责人可以生成进度汇总报告'));
      return this.track(this.runWeeklyReport(pj.id, c.now));
    },

    // ── 会议 ──
    'meeting.list': (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const todos = this.myTodos(c);
      const needsMe = new Set(todos.filter((t) => t.group === 'meeting').map((t) => t.link.id));
      const q = str(p.q, 100).toLowerCase();
      const filter = String(p.filter || 'all');
      return s.meetings
        .filter((m) => this.canSeeMeeting(me.id, m, s.projects.find((x) => x.id === m.projectId)))
        .filter((m) => !p.projectId || m.projectId === p.projectId)
        .filter((m) => filter === 'todo' ? needsMe.has(m.id)
          : filter === 'processing' ? MEETING_FILTER_PROCESSING.includes(m.status)
            : filter === 'final' ? MEETING_FILTER_FINAL.includes(m.status) : true)
        .filter((m) => !q || this.meetingSearchText(m, s).includes(q))
        .sort((a, b) => b.time - a.time)
        .map((m) => this.meetingCard(m, needsMe));
    },

    'meeting.get': (c, p): MmMeetingDetail => {
      const me = this.me(c);
      const { m, p: project } = this.visibleMeeting(c, p.id);
      const s = this.s();
      const tasks = s.tasks.filter((t) => t.meetingId === m.id).map((t) => this.taskView(t, c.now));
      const isHost = m.hostId === me.id;
      const isPlanOwner = R.planOwners(m.plan).includes(me.id);
      const myConf = m.confirmations.find((x) => x.personId === me.id);
      const live = project.status !== 'archived';
      const planDepts = [...new Set([...(m.plan?.items || []).map((i) => i.deptId), ...s.org.depts.map((d) => d.id)])];
      const ids = new Set<string>([m.hostId, ...m.attendeeIds, ...R.speakerPersonIds(m), ...m.confirmations.map((x) => x.personId)]);
      for (const o of R.planOwners(m.plan)) ids.add(o);
      for (const t of tasks) { ids.add(t.assigneeId); for (const o of R.taskOwners(t)) ids.add(o); }
      const deptLeaders: Record<string, { id: string; name: string } | null> = {};
      for (const d of planDepts) {
        const l = R.firstLeader(s.org, d);
        deptLeaders[d] = l ? { id: l.id, name: l.name } : null;
        if (l) ids.add(l.id);
      }
      return {
        meeting: this.forOrigin(m, c.origin),
        projectName: project.name,
        projectStatus: project.status,
        names: this.namesFor(ids),
        my: { isHost, isSpeaker: !!myConf, isPlanOwner, myLabels: R.labelsOf(m, me.id) },
        confirm: { done: m.confirmations.filter((x) => x.status === 'confirmed').length, total: m.confirmations.length },
        tasks,
        deptNames: Object.fromEntries(s.org.depts.map((d) => [d.id, d.name])),
        deptLeaders,
        planGenerating: this.planJobs.has(m.id),
        can: {
          upload: live && isHost && (m.status === 'pending_upload' || m.status === 'failed'),
          retry: live && isHost && m.status === 'failed' && m.files.length > 0,
          assign: live && isHost && (m.status === 'pending_assign' || m.status === 'pending_confirm'),
          edit: live && ((m.status === 'pending_confirm' && myConf?.status === 'pending') || (m.status === 'pending_review' && isHost)),
          confirm: live && m.status === 'pending_confirm' && myConf?.status === 'pending',
          review: live && isHost && m.status === 'pending_review',
          decide: live && isHost && m.status === 'finalized' && !m.taskDecision,
          setOwner: live && isHost && (m.status === 'pending_owner' || m.status === 'plan_confirm'),
          editPlan: live && isPlanOwner && m.status === 'plan_confirm',
          confirmPlan: live && isPlanOwner && m.status === 'plan_confirm' && project.status === 'active',
        },
      };
    },

    'meeting.create': (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const project = this.findProject(s, p.projectId);
      if (!(project.ownerId === me.id || project.memberIds.includes(me.id) || this.isAdmin(me.id))) throw new Error(i18nT('你不是这个项目的成员'));
      R.assertProjectActive(project);
      const title = str(p.title, 200);
      if (!title) throw new Error(i18nT('请填写会议主题'));
      const time = Number(p.time) > 0 ? Number(p.time) : c.now;
      const source: MmMeetingSource = ['offline', 'tencent', 'zoom'].includes(p.source) ? p.source : 'offline';
      const host = R.requireActivePerson(s.org, str(p.hostId) || me.id, i18nT('主持人'));
      const attendees = strArr(p.attendeeIds).map((id) => R.requireActivePerson(s.org, id, i18nT('参会人')).id);
      const meeting: MmMeeting = {
        id: newId('mt'), projectId: project.id, title, time, source, hostId: host.id,
        attendeeIds: [...new Set([host.id, ...attendees])], createdBy: me.id, createdAt: c.now, status: 'pending_upload',
        files: [], speakers: [], segments: [], topics: [], decisions: [], summaryLines: [], confirmations: [], taskIds: [],
      };
      this.store.update((st) => {
        const pj = this.findProject(st, project.id);
        R.assertProjectActive(pj);
        st.meetings.push(meeting);
        R.ensureMembers(pj, meeting.attendeeIds);
      });
      this.changed('meeting', meeting.id);
      this.changed('project', project.id);
      return meeting;
    },

    'meeting.upload': async (c, p) => this.upload(c, String(p.id || ''), p.paths),

    'meeting.retry': (c, p) => {
      const me = this.me(c);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        R.assertProjectActive(this.findProject(st, mm.projectId));
        R.startProcessing(mm, me.id, c.now, { retry: true });
        return mm;
      });
      this.changed('meeting', m.id);
      this.startPipeline(m.id);
      return this.forOrigin(m, c.origin);
    },

    /** 主持人用当前的转写模型重新转写（定稿前；已确认、改过的内容会清掉） */
    'meeting.reprocess': (c, p) => {
      const me = this.me(c);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        R.assertProjectActive(this.findProject(st, mm.projectId));
        R.startProcessing(mm, me.id, c.now, { reprocess: true });
        return mm;
      });
      this.changed('meeting', m.id);
      this.startPipeline(m.id);
      return this.forOrigin(m, c.origin);
    },

    'meeting.speaker.assign': (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const person = R.requireActivePerson(s.org, str(p.personId), i18nT('发言人'));
      const r = this.store.update((st) => {
        const m = this.findMeeting(st, p.id);
        const pj = this.findProject(st, m.projectId);
        R.assertProjectNotArchived(pj);
        const prev = m.status;
        const out = R.assignSpeaker(m, me.id, String(p.label ?? ''), person.id, c.now);
        R.ensureMembers(pj, [person.id]);
        R.replaceSpeakerLabels(m, (id) => R.activePerson(st.org, id)?.name);
        return { m, prev, pending: out.pending, projectName: pj.name };
      });
      if (r.pending.length || r.m.status !== r.prev) this.afterSpeakersSettled(r.m, r.pending, r.projectName, c.now);
      this.changed('meeting', r.m.id);
      return this.forOrigin(r.m, c.origin);
    },

    /** 逐段改发言人：p.label = 改给已有的发言人；p.personId = 改给某位员工 */
    'meeting.segment.speaker': (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const label = str(p.label);
      const personId = label ? '' : R.requireActivePerson(s.org, str(p.personId), i18nT('发言人')).id;
      const r = this.store.update((st) => {
        const m = this.findMeeting(st, p.id);
        const pj = this.findProject(st, m.projectId);
        R.assertProjectNotArchived(pj);
        const prev = m.status;
        const out = R.moveSegment(m, me.id, String(p.segmentId ?? ''), label ? { label } : { personId }, c.now);
        R.ensureMembers(pj, R.speakerPersonIds(m));
        R.replaceSpeakerLabels(m, (id) => R.activePerson(st.org, id)?.name);
        return { m, prev, pending: out.pending, projectName: pj.name };
      });
      if (r.pending.length || r.m.status !== r.prev) this.afterSpeakersSettled(r.m, r.pending, r.projectName, c.now);
      this.changed('meeting', r.m.id);
      return this.forOrigin(r.m, c.origin);
    },

    /** 播放某一段发言的原声（能看这场会议的人都能听，手机页也能听） */
    'meeting.segment.audio': (c, p) => {
      const { m } = this.visibleMeeting(c, p.id);
      const seg = m.segments.find((x) => x.id === String(p.segmentId ?? ''));
      if (!seg) throw new Error(i18nT('没有找到这段发言'));
      // 前后各多留 0.3 秒，免得掐头去尾；太长的段只放前 3 分钟（再长 data URL 太大）
      const start = Math.max(0, seg.start - 0.3);
      const end = Math.min(seg.end + 0.3, start + SEGMENT_AUDIO_MAX_SEC);
      let b64: string | null = null;
      try { b64 = this.ext.segmentAudio(this.store.filesDir(m.id), start, end); } catch (e) { this.warn('segment audio failed', { error: (e as Error)?.message }); }
      if (!b64) throw new Error(i18nT('这场会议没有可播放的录音（文字记录导入的会议没有原声）'));
      return { dataUrl: `data:audio/wav;base64,${b64}`, start, end, clipped: seg.end + 0.3 > end };
    },

    'meeting.speaker.clip': async (c, p) => {
      const me = this.me(c);
      const { m } = this.visibleMeeting(c, p.id);
      R.assertHost(m, me.id, i18nT('试听发言片段'));
      const label = String(p.label ?? '');
      const slot = m.speakers.find((x) => x.label === label);
      if (!slot) throw new Error(i18nT('没有找到发言人「{p0}」', { p0: label }));
      let path = slot.clipPath && existsSync(slot.clipPath) && this.store.isInsideRoot(slot.clipPath) ? slot.clipPath : '';
      if (!path) {
        const out = await this.ext.exportSpeakerClip({ meeting: m, label, workDir: this.store.filesDir(m.id) });
        if (out && existsSync(out) && this.store.isInsideRoot(out)) {
          path = out;
          this.store.update((st) => {
            const sp = st.meetings.find((x) => x.id === m.id)?.speakers.find((x) => x.label === label);
            if (sp) sp.clipPath = out;
          });
        }
      }
      if (!path) throw new Error(i18nT('这位发言人没有可试听的录音片段'));
      const size = statSync(path).size;
      if (size > MAX_CLIP_BYTES) throw new Error(i18nT('试听片段太大'));
      return { dataUrl: `data:audio/wav;base64,${readFileSync(path).toString('base64')}` };
    },

    /** 主持人定稿前改决议事项和 3 行摘要：p.decisions = [{ id?, text }]，p.summaryLines = [..] */
    'meeting.minutes.save': (c, p) => {
      const me = this.me(c);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        R.assertProjectNotArchived(this.findProject(st, mm.projectId));
        R.saveMinutesDraft(mm, me.id, {
          decisions: Array.isArray(p.decisions) ? p.decisions as Array<{ id?: string; text?: string }> : undefined,
          summaryLines: Array.isArray(p.summaryLines) ? (p.summaryLines as unknown[]).map(String) : undefined,
        }, () => newId('dc'));
        return mm;
      });
      this.changed('meeting', m.id);
      return this.forOrigin(m, c.origin);
    },

    /** 按当前的发言人、改过的文字让模型重新整理议题 / 决议 / 摘要（覆盖初稿，包括手改的） */
    'meeting.minutes.reorganize': async (c, p) => {
      const me = this.me(c);
      const what = i18nT('重新整理纪要');
      const s0 = this.s();
      const m0 = this.findMeeting(s0, p.id);
      R.assertProjectNotArchived(this.findProject(s0, m0.projectId));
      R.assertMinutesDraftEditable(m0, me.id, what);
      if (!m0.segments.length) throw new Error(i18nT('还没有发言内容可以整理'));
      if (this.reorganizing.has(m0.id)) throw new Error(i18nT('正在重新整理，请稍候'));
      this.reorganizing.add(m0.id);
      try {
        const nameOf = (id?: string) => (id ? R.activePerson(s0.org, id)?.name : undefined);
        const speakerNames: Record<string, string> = {};
        for (const sp of m0.speakers) speakerNames[sp.label] = nameOf(sp.personId) || sp.label;
        const org = await this.ext.organizeMinutes({
          segments: m0.segments.map((x) => ({ ...x })), speakerNames,
          attendeeNames: m0.attendeeIds.map((id) => nameOf(id) || '').filter(Boolean),
          llm: this.llm, prompt: s0.settings.ai.organizePrompt,
        });
        const m = this.store.update((st) => {
          const mm = this.findMeeting(st, m0.id);
          R.assertMinutesDraftEditable(mm, me.id, what);
          // 等模型期间发言又被改过：只认还在的段
          const topicOf = new Map(org.segments.map((x) => [x.id, x.topicId]));
          for (const seg of mm.segments) seg.topicId = topicOf.get(seg.id);
          const ids = new Set(mm.segments.map((x) => x.id));
          mm.topics = org.topics.map((t) => ({ ...t, segmentIds: t.segmentIds.filter((id) => ids.has(id)) })).filter((t) => t.segmentIds.length);
          mm.decisions = org.decisions.map((d) => ({ ...d, segmentIds: d.segmentIds.filter((id) => ids.has(id)) }));
          mm.summaryLines = org.summaryLines.slice(0, 3);
          R.replaceSpeakerLabels(mm, (id) => R.activePerson(st.org, id)?.name);
          return mm;
        });
        this.changed('meeting', m.id);
        return { ...(this.forOrigin(m, c.origin) as object), note: org.note || '' };
      } finally {
        this.reorganizing.delete(m0.id);
      }
    },

    'meeting.segment.edit': (c, p) => {
      const me = this.me(c);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        R.assertProjectNotArchived(this.findProject(st, mm.projectId));
        R.editSegment(mm, me.id, String(p.segmentId ?? ''), String(p.text ?? ''), c.now);
        return mm;
      });
      this.changed('meeting', m.id);
      return this.forOrigin(m, c.origin);
    },

    'meeting.confirm': (c, p) => {
      const me = this.me(c);
      const r = this.store.update((st) => {
        const m = this.findMeeting(st, p.id);
        const pj = this.findProject(st, m.projectId);
        R.assertProjectNotArchived(pj);
        const out = R.confirmSpeech(m, me.id, c.now);
        return { m, all: out.allConfirmed, projectName: pj.name };
      });
      if (r.all) this.notifyReview(r.m, r.projectName, c.now);
      this.changed('meeting', r.m.id);
      // 本人同意过「用确认过的会议补充声纹」：后台从这场的本人发言里补一份样本（不阻塞确认）
      if (this.s().voiceprints.find((v) => v.personId === me.id)?.autoLearn) void this.track(this.learnVoiceprint(r.m.id, me.id));
      return this.forOrigin(r.m, c.origin);
    },

    /** 本人开 / 关「用确认过的会议补充声纹」（采集同意里已包含，默认开）；关掉时已补的样本一起删，之后重录也保持关 */
    'voiceprint.autoLearn.set': (c, p) => {
      const me = this.me(c);
      const on = p.enabled === true;
      const v = this.s().voiceprints.find((x) => x.personId === me.id);
      if (!v) throw new Error(i18nT('还没有采集你的声纹，请先采集'));
      const now = this.nowFn();
      this.store.update((st) => {
        const x = st.voiceprints.find((y) => y.personId === me.id);
        if (!x) return;
        if (on) { x.autoLearn = true; x.autoLearnAt = now; } else { x.autoLearn = false; delete x.autoLearnAt; delete x.extra; }
      });
      this.changed('org');
      return { autoLearn: on };
    },

    'meeting.review.return': (c, p) => {
      const me = this.me(c);
      const personId = str(p.personId);
      const note = str(p.note, 500);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        R.assertProjectNotArchived(this.findProject(st, mm.projectId));
        R.returnToSpeaker(mm, me.id, personId, note, c.now);
        return mm;
      });
      this.notify([{
        to: personId, type: 'speech_confirm', title: i18nT('发言被退回：{p0}', { p0: m.title }),
        summary: note || i18nT('主持人退回了你的发言，请重新核对后确认'), link: { kind: 'meeting', id: m.id },
      }], c.now);
      this.changed('meeting', m.id);
      return this.forOrigin(m, c.origin);
    },

    'meeting.review.approve': (c, p) => {
      const me = this.me(c);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        R.assertProjectNotArchived(this.findProject(st, mm.projectId));
        R.approveMinutes(mm, me.id, c.now);
        return mm;
      });
      this.notify(m.attendeeIds.map((to) => ({
        to, type: 'minutes_final' as const, title: i18nT('正式纪要：{p0}', { p0: m.title }),
        summary: cardSummary.minutes(m.summaryLines) || m.title, link: { kind: 'meeting' as const, id: m.id },
      })), c.now);
      this.changed('meeting', m.id);
      return this.forOrigin(m, c.origin);
    },

    'meeting.decide': async (c, p) => {
      const me = this.me(c);
      const id = String(p.id || '');
      if (this.planJobs.has(id)) throw new Error(i18nT('执行方案正在生成，请稍候'));
      const decision = p.decision === 'generate' ? 'generate' : p.decision === 'none' ? 'none' : (p.decision as any);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, id);
        const pj = this.findProject(st, mm.projectId);
        if (decision === 'generate') R.assertProjectActive(pj); else R.assertProjectNotArchived(pj);
        R.decideTasks(mm, me.id, decision);
        return mm;
      });
      this.changed('meeting', id);
      if (decision === 'none') { this.changed('project', m.projectId); return this.forOrigin(m, c.origin); }
      this.planJobs.add(id);
      try {
        const s = this.s();
        const plan = await this.ext.generatePlan({
          meeting: m, project: this.findProject(s, m.projectId), org: s.org, today: R.ymd(c.now), prompt: s.settings.ai.planPrompt, llm: this.llm,
        });
        const out = this.store.update((st) => {
          const mm = this.findMeeting(st, id);
          R.attachPlan(mm, { ...plan, generatedAt: plan.generatedAt || this.nowFn(), items: (plan.items || []).map((it) => ({ ...it, id: it.id || newId('pi') })) });
          return mm;
        });
        return this.forOrigin(out, c.origin);
      } catch (e) {
        try {
          this.store.update((st) => {
            const mm = st.meetings.find((x) => x.id === id);
            if (mm && mm.status === 'finalized' && mm.taskDecision === 'generate') mm.taskDecision = undefined;
          });
        } catch { /* ignore */ }
        throw e;
      } finally {
        this.planJobs.delete(id);
        this.changed('meeting', id);
      }
    },

    /** 指定任务负责人（可多位：ownerIds；兼容旧调用 ownerId）。新加进来的人收到「方案待确认」，原来就在的不重复发 */
    'meeting.plan.owner': (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const raw: unknown[] = Array.isArray(p.ownerIds) ? p.ownerIds : [p.ownerId];
      const ids: string[] = [...new Set(raw.map((x) => str(x)).filter(Boolean))];
      if (!ids.length) throw new Error(i18nT('请至少选一位任务负责人'));
      const owners = ids.map((id) => R.requireActivePerson(s.org, id, i18nT('任务负责人')).id);
      let before: string[] = [];
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        const pj = this.findProject(st, mm.projectId);
        R.assertProjectActive(pj);
        before = R.planOwners(mm.plan);
        R.setPlanOwner(mm, me.id, owners);
        R.ensureMembers(pj, owners);
        return mm;
      });
      const added = owners.filter((id) => !before.includes(id));
      this.notify(added.map((to) => ({
        to, type: 'plan_confirm' as const, title: i18nT('执行方案待确认：{p0}', { p0: m.title }),
        summary: cardSummary.plan(m.plan?.items || []), link: { kind: 'meeting_plan' as const, id: m.id },
      })), c.now);
      this.changed('meeting', m.id);
      return this.forOrigin(m, c.origin);
    },

    'meeting.plan.save': (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const items = R.sanitizePlanItems(p.items, s.org, () => newId('pi'));
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        R.assertProjectActive(this.findProject(st, mm.projectId));
        R.savePlan(mm, me.id, items, typeof p.summary === 'string' ? p.summary : undefined);
        return mm;
      });
      this.changed('meeting', m.id);
      return m.plan;
    },

    'meeting.plan.confirm': (c, p) => {
      const me = this.me(c);
      const r = this.store.update((st) => {
        const m = this.findMeeting(st, p.id);
        const pj = this.findProject(st, m.projectId);
        const tasks = R.confirmPlan(m, me.id, pj, st.org, c.now, () => newId('tk'));
        st.tasks.push(...tasks);
        R.ensureMembers(pj, tasks.flatMap((t) => [t.assigneeId, ...R.taskOwners(t)]));
        return { m, tasks, projectId: pj.id };
      });
      this.notify(r.tasks.map((t) => ({
        to: t.assigneeId, type: 'task_new' as const, title: i18nT('新任务待接收：{p0}', { p0: t.title }),
        summary: cardSummary.task(t), link: { kind: 'task' as const, id: t.id },
      })), c.now);
      this.changed('meeting', r.m.id);
      this.changed('task');
      this.changed('project', r.projectId);
      return this.forOrigin(r.m, c.origin);
    },

    // ── 任务 ──
    'task.list': (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const view = p.view === 'received' || p.view === 'assigned' ? p.view : 'all';
      const q = str(p.q, 100).toLowerCase();
      const status = String(p.status || '');
      const list = s.tasks.filter((t) => {
        if (view === 'received' && t.assigneeId !== me.id) return false;
        if (view === 'assigned' && !R.taskOwners(t).includes(me.id)) return false;
        if (view === 'all' && !this.canSeeTask(me.id, t, s.projects.find((x) => x.id === t.projectId))) return false;
        if (p.projectId && t.projectId !== p.projectId) return false;
        if (p.meetingId && t.meetingId !== p.meetingId) return false;
        if (p.deptId && t.deptId !== p.deptId) return false;
        if (status === 'overdue' && !R.isTaskOverdue(t, c.now)) return false;
        if (status === 'objection' && !R.hasOpenObjection(t)) return false;
        if (status === 'active' && R.isTaskClosed(t)) return false;
        if ((TASK_STATUSES as string[]).includes(status) && t.status !== status) return false;
        if (q && !t.title.toLowerCase().includes(q)) return false;
        return true;
      });
      const rank = (t: MmTask): number => (R.isTaskClosed(t) ? 1 : 0);
      return list
        .sort((a, b) => rank(a) - rank(b) || (rank(a) ? (b.doneAt || b.createdAt) - (a.doneAt || a.createdAt) : a.due.localeCompare(b.due)))
        .map((t) => this.taskView(t, c.now));
    },

    'task.get': (c, p) => {
      const me = this.me(c);
      const { t, p: project } = this.visibleTask(c, p.id);
      const s = this.s();
      const live = project.status !== 'archived';
      const o = R.hasOpenObjection(t) ? t.objection : undefined;
      const isAssignee = t.assigneeId === me.id;
      const running = t.status === 'not_started' || t.status === 'in_progress';
      const ids = new Set<string>([t.assigneeId, t.ownerId, project.ownerId, ...t.events.map((e) => e.by), ...t.progressLog.map((x) => x.by)]);
      for (const h of [...t.objectionHistory, ...(o ? [o] : [])]) { ids.add(h.raisedBy); if (h.review) ids.add(h.review.by); if (h.arbitration) ids.add(h.arbitration.by); }
      const meeting = s.meetings.find((m) => m.id === t.meetingId);
      return {
        task: this.taskView(t, c.now),
        names: this.namesFor(ids),
        project: { id: project.id, name: project.name, status: project.status, ownerId: project.ownerId },
        meeting: meeting ? { id: meeting.id, title: meeting.title } : null,
        can: {
          accept: live && isAssignee && t.status === 'to_accept' && !o,
          object: live && isAssignee && t.status === 'to_accept' && !o,
          progress: live && isAssignee && running && !o,
          complete: live && isAssignee && t.status === 'in_progress' && !o,
          change: live && isAssignee && running && !o,
          review: live && !!o && o.stage === 'review' && R.taskOwners(t).includes(me.id),
          reply: live && !!o && o.stage === 'dept_reply' && isAssignee,
          escalate: live && !!o && o.stage === 'dept_reply' && isAssignee,
          arbitrate: live && !!o && o.stage === 'arbitration' && project.ownerId === me.id,
        },
      };
    },

    'task.accept': (c, p) => this.taskAction(c, p.id, (t, me) => { R.acceptTask(t, me, c.now); }),

    /** 更新进度：每位任务负责人收到一条「进度更新」（自己更新的不发给自己），点开就是这个任务 */
    'task.progress': (c, p) => {
      const t = this.taskAction(c, p.id, (x, me) => {
        R.updateProgress(x, me, Number(p.percent), String(p.note ?? ''), c.now, p.status === 'not_started' ? 'not_started' : undefined);
      });
      const actor = this.me(c).id;
      const note = String(p.note ?? '').trim();
      const summary = note
        ? i18nT('{p0}更新到 {p1}%：{p2}', { p0: this.nameOf(actor), p1: t.percent, p2: note })
        : i18nT('{p0}更新到 {p1}%', { p0: this.nameOf(actor), p1: t.percent });
      this.notify(R.taskOwners(t).filter((to) => to !== actor).map((to) => ({
        to, type: 'task_progress' as const, title: i18nT('任务进度更新：{p0}', { p0: t.title }), summary, link: { kind: 'task' as const, id: t.id },
      })), c.now);
      return t;
    },

    'task.complete': (c, p) => {
      const t = this.taskAction(c, p.id, (x, me) => { R.completeTask(x, me, typeof p.note === 'string' ? p.note : undefined, c.now); });
      this.notify(R.taskOwners(t).map((to) => ({
        to, type: 'task_done' as const, title: i18nT('任务已完成：{p0}', { p0: t.title }),
        summary: i18nT('{p0}已标记完成', { p0: this.nameOf(t.assigneeId) }), link: { kind: 'task' as const, id: t.id },
      })), c.now);
      return t;
    },

    'task.objection.raise': (c, p) => {
      const t = this.taskAction(c, p.id, (x, me) => {
        R.raiseObjection(x, me, { target: p.target, reason: String(p.reason ?? ''), suggestion: String(p.suggestion ?? ''), suggestedDue: p.suggestedDue ? String(p.suggestedDue) : undefined }, c.now, newId('ob'));
      });
      const o = t.objection!;
      this.notify(R.taskOwners(t).map((to) => ({
        to, type: 'objection_review' as const,
        title: o.kind === 'change' ? i18nT('变更申请待复核：{p0}', { p0: t.title }) : i18nT('异议待复核：{p0}', { p0: t.title }),
        summary: i18nT('{p0}：{p1}', { p0: this.nameOf(o.raisedBy), p1: o.reason }), link: { kind: 'task' as const, id: t.id },
      })), c.now);
      return t;
    },

    'task.objection.review': (c, p) => {
      let result = 'rejected' as R.ObjectionResult;
      const decision = p.decision === 'adopt' ? 'adopt' : p.decision === 'reject' ? 'reject' : p.decision;
      const t = this.taskAction(c, p.id, (x, me) => { result = R.reviewObjection(x, me, decision, String(p.note ?? ''), p.changes, c.now); });
      if (result === 'adopted') {
        this.notify([{ to: t.assigneeId, type: 'plan_adjusted', title: i18nT('调整后方案待确认：{p0}', { p0: t.title }), summary: cardSummary.task(t), link: { kind: 'task', id: t.id } }], c.now);
      } else if (result === 'cancelled') {
        this.notify([{ to: t.assigneeId, type: 'arbitration_result', title: i18nT('任务已取消：{p0}', { p0: t.title }), summary: str(p.note, 200) || i18nT('任务负责人采纳了异议并删除了该任务'), link: { kind: 'task', id: t.id } }], c.now);
      }
      return t;
    },

    'task.objection.reply': (c, p) => {
      let result = 'accepted_reject' as R.ObjectionResult;
      const decision = p.decision === 'accept' ? 'accept' : p.decision === 'escalate' ? 'escalate' : p.decision;
      const t = this.taskAction(c, p.id, (x, me) => { result = R.replyObjection(x, me, decision, c.now); });
      if (result === 'escalated') {
        const project = this.findProject(this.s(), t.projectId);
        this.notify([{
          to: project.ownerId, type: 'arbitration', title: i18nT('异议待裁决：{p0}', { p0: t.title }),
          summary: t.objection?.suggestedDue
            ? i18nT('{p0}与{p1}对截止日有分歧（{p2} / {p3}）', { p0: this.nameOf(t.assigneeId), p1: this.namesOf(R.taskOwners(t)), p2: t.due, p3: t.objection.suggestedDue })
            : i18nT('{p0}与{p1}对任务有分歧，请裁决', { p0: this.nameOf(t.assigneeId), p1: this.namesOf(R.taskOwners(t)) }),
          link: { kind: 'task', id: t.id },
        }], c.now);
      }
      return t;
    },

    'task.objection.arbitrate': (c, p) => {
      let result = 'kept' as R.ObjectionResult;
      const decision = p.decision === 'keep' ? 'keep' : p.decision === 'adjust' ? 'adjust' : p.decision;
      const t = this.taskAction(c, p.id, (x, me, pj) => { result = R.arbitrateObjection(x, me, pj.ownerId, decision, String(p.note ?? ''), p.changes, c.now); });
      const summary = result === 'cancelled' ? i18nT('裁决：删除该任务')
        : result === 'adjusted' ? i18nT('裁决：按异议调整（截止 {p0}）', { p0: t.due })
          : i18nT('裁决：维持原方案（截止 {p0}）', { p0: t.due });
      this.notify([...new Set([...R.taskOwners(t), t.assigneeId])].map((to) => ({
        to, type: 'arbitration_result' as const, title: i18nT('裁决结果：{p0}', { p0: t.title }), summary, link: { kind: 'task' as const, id: t.id },
      })), c.now);
      return t;
    },

    // ── 组织与设置 ──
    'org.sync': async (c) => {
      const me = this.requireAdmin(c, i18nT('同步通讯录'));
      const prev = this.s().org;
      const client = this.wecomClient();
      let next: { depts: MmDept[]; people: MmPerson[] };
      let source: 'wecom' | 'demo' = 'demo';
      if (client) {
        source = 'wecom';
        try {
          next = await client.fetchOrg();
        } catch (e) {
          const result: MmOrgSyncResult = { at: this.nowFn(), by: me.id, source, added: [], changed: [], left: [], error: (e as Error)?.message || i18nT('同步失败') };
          this.store.update((st) => { st.org.lastSync = result; });
          this.changed('org');
          return result;
        }
      } else {
        next = buildDemoOrg();
      }
      const diff = this.ext.diffOrg(prev, next);
      const result: MmOrgSyncResult = { at: this.nowFn(), by: me.id, source, ...diff };
      this.replaceOrg(next, source, result);
      return { ...result, needIdentity: !R.activePerson(this.s().org, c.actorId) };
    },

    /** 导入通讯录表格（企微后台「通讯录 → 导出成员」，或自己整理的）：没有自建应用、读不了通讯录接口时用 */
    'org.import': (c, p) => {
      const me = this.requireAdmin(c, i18nT('导入通讯录'));
      const path = String(p.path ?? '');
      if (!path || !existsSync(path) || !statSync(path).isFile()) throw new Error(i18nT('文件不存在'));
      const wb = openSpreadsheetFile(path);
      const ws = wb.Sheets[wb.SheetNames[0] || ''];
      if (!ws) throw new Error(i18nT('表格是空的'));
      const parsed = parseOrgTable(readWorksheetData(ws, { raw: false, defval: '' }).rows);
      const diff = this.ext.diffOrg(this.s().org, parsed);
      const result: MmOrgSyncResult = { at: this.nowFn(), by: me.id, source: 'import', ...diff, ...(parsed.warnings.length ? { warnings: parsed.warnings } : {}) };
      this.replaceOrg(parsed, 'import', result);
      return { ...result, people: parsed.people.length, depts: parsed.depts.length, needIdentity: !R.activePerson(this.s().org, c.actorId) };
    },

    /** 给某人填群里 @ 用的手机号 / 企微账号（管理员）；空串 = 清掉 */
    'org.person.contact': (c, p) => {
      this.requireAdmin(c, i18nT('修改人员的手机号和企微账号'));
      const personId = str(p.personId);
      R.requireActivePerson(this.s().org, personId, i18nT('人员'));
      const mobileRaw = String(p.mobile ?? '').trim();
      const uidRaw = String(p.wecomUserId ?? '').trim();
      const mobile = normalizeMobile(mobileRaw);
      const uid = normalizeWecomUserId(uidRaw);
      if (mobileRaw && !mobile) throw new Error(i18nT('手机号格式不对'));
      if (uidRaw && !uid) throw new Error(i18nT('企微账号格式不对：只能有字母、数字和下划线、点、短横线'));
      const person = this.store.update((st) => {
        const x = st.org.people.find((y) => y.id === personId)!;
        if (mobile) x.mobile = mobile; else delete x.mobile;
        if (p.wecomUserId !== undefined) {
          if (uid) { x.wecomUserId = uid; x.wecomIdManual = true; } else { delete x.wecomUserId; delete x.wecomIdManual; }
        }
        return { ...x };
      });
      this.changed('org');
      return person;
    },

    'settings.get': () => this.s().settings,

    'settings.save': (c, p) => {
      this.requireAdmin(c, i18nT('修改系统设置'));
      const patch = p.patch && typeof p.patch === 'object' ? p.patch : {};
      const settings = this.store.update((st) => {
        applySettingsPatch(st, patch);
        return st.settings;
      });
      this.changed('settings');
      return settings;
    },

    'wecom.save': (c, p) => {
      this.requireAdmin(c, i18nT('配置企业微信'));
      const corpId = str(p.corpId, 100);
      const agentId = str(p.agentId, 50);
      const secret = String(p.secret ?? '').trim();
      const cardBaseUrl = str(p.cardBaseUrl, 500);
      if (cardBaseUrl && !/^https?:\/\/[^\s]+$/i.test(cardBaseUrl)) throw new Error(i18nT('卡片地址请填写 http:// 或 https:// 开头的网址'));
      if (secret) {
        if (!this.ext.seal.can()) throw new Error(i18nT('本机无法安全保存企微 Secret（系统钥匙串不可用）'));
        this.store.writeSecret(this.ext.seal.seal(secret));
      }
      const clear = !corpId && !agentId;
      if (clear) this.store.writeSecret(null);
      const wecom = this.store.update((st) => {
        const { hasWebhook, webhookMasked } = st.settings.wecom;
        st.settings.wecom = {
          corpId, agentId, hasSecret: clear ? false : (secret ? true : st.settings.wecom.hasSecret && !!this.store.readSecret()), ...(cardBaseUrl ? { cardBaseUrl } : {}),
          ...(hasWebhook ? { hasWebhook, webhookMasked } : {}),
        };
        return st.settings.wecom;
      });
      this.changed('settings');
      return wecom;
    },

    /** 群机器人：p.url 为空 = 移除；只认 qyapi.weixin.qq.com 的 webhook 地址（或只贴 key） */
    'wecom.webhook.save': (c, p) => {
      this.requireAdmin(c, i18nT('配置企微群机器人'));
      const raw = String(p.url ?? '').trim();
      if (!raw) {
        this.store.writeWebhook(null);
        const wecom = this.store.update((st) => { delete st.settings.wecom.hasWebhook; delete st.settings.wecom.webhookMasked; return st.settings.wecom; });
        this.changed('settings');
        return wecom;
      }
      const url = normalizeWebhookUrl(raw);
      if (!url) throw new Error(i18nT('不是企业微信群机器人的地址：应形如 https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…'));
      if (!this.ext.seal.can()) throw new Error(i18nT('本机无法安全保存群机器人地址（系统钥匙串不可用）'));
      this.store.writeWebhook(this.ext.seal.seal(url));
      const wecom = this.store.update((st) => {
        st.settings.wecom.hasWebhook = true;
        st.settings.wecom.webhookMasked = maskWebhookUrl(url);
        return st.settings.wecom;
      });
      this.changed('settings');
      return wecom;
    },

    'wecom.webhook.test': async (c) => {
      this.requireAdmin(c, i18nT('测试企微群机器人'));
      const url = this.webhookUrl();
      if (!url) throw new Error(i18nT('请先填写群机器人的 Webhook 地址'));
      return this.ext.createWebhook(url).test();
    },

    // ── 会议转写方式：本机模型（推荐，录音不出电脑）/ App 的 AI 服务 / 自己填的在线语音识别接口 ──
    'asr.mode.save': (c, p) => {
      this.requireAdmin(c, i18nT('修改会议转写方式'));
      const mode = p.mode === 'cloud' ? 'cloud' : p.mode === 'agent' ? 'agent' : 'local';
      if (mode === 'cloud' && !this.cloudAsrConfig()) throw new Error(i18nT('在线接口还没填完整（地址、模型、API Key），请先保存在线接口'));
      const localModel = (['firered', 'sensevoice', 'whisper'] as const).includes(p.localModel) ? p.localModel : 'auto';
      this.store.update((st) => { st.settings.ai.asr = mode; st.settings.ai.localAsrModel = localModel; });
      this.changed('settings');
      return this.asrSettingsView();
    },
    'asr.cloud.save': (c, p) => {
      this.requireAdmin(c, i18nT('配置在线语音识别接口'));
      if (p.clear === true) {
        this.store.writeCloudAsrKey(null);
        this.store.update((st) => { delete st.settings.ai.cloudAsr; if (st.settings.ai.asr === 'cloud') st.settings.ai.asr = 'local'; });
        this.changed('settings');
        return this.asrSettingsView();
      }
      const provider = cloudAsrPreset(str(p.provider)).id;
      const baseUrl = normalizeBaseUrl(str(p.baseUrl, 500) || cloudAsrPreset(provider).baseUrl);
      if (!baseUrl) throw new Error(i18nT('在线接口地址不对，请填 http:// 或 https:// 开头的地址'));
      const model = str(p.model, 200);
      if (!model) throw new Error(i18nT('请填写在线接口的模型名'));
      const apiKey = str(p.apiKey, 500);
      if (apiKey) {
        if (!this.ext.seal.can()) throw new Error(i18nT('这台电脑的系统加密存储不可用，API Key 没法安全保存'));
        this.store.writeCloudAsrKey(this.ext.seal.seal(apiKey));
      }
      const hasKey = !!this.store.readCloudAsrKey();
      if (!hasKey) throw new Error(i18nT('请填写在线接口的 API Key'));
      this.store.update((st) => { st.settings.ai.cloudAsr = { provider, baseUrl, model, hasKey }; });
      this.changed('settings');
      return this.asrSettingsView();
    },
    /** 用 1 秒静音试一下地址 / Key / 模型对不对（没填的项用已保存的） */
    'asr.cloud.test': async (c, p) => {
      this.requireAdmin(c, i18nT('测试在线语音识别接口'));
      const saved = this.cloudAsrConfig();
      const provider = cloudAsrPreset(str(p.provider) || saved?.provider).id;
      const cfg: CloudAsrConfig = {
        provider,
        baseUrl: str(p.baseUrl, 500) || saved?.baseUrl || cloudAsrPreset(provider).baseUrl,
        model: str(p.model, 200) || saved?.model || '',
        apiKey: str(p.apiKey, 500) || saved?.apiKey || '',
      };
      const t0 = Date.now();
      const r = await this.ext.cloudTranscribe(cfg, silenceWav(1.2));
      return r.ok ? { ok: true, ms: Date.now() - t0 } : { ok: false, error: r.error || i18nT('连接失败') };
    },
    'asr.cloud.reveal': (c) => {
      this.requireAdmin(c, i18nT('查看在线接口 API Key'));
      const sealed = this.store.readCloudAsrKey();
      if (!sealed) return { apiKey: '' };
      try { return { apiKey: this.ext.seal.unseal(sealed) || '' }; } catch { throw new Error(i18nT('本机读不出已保存的 API Key（系统钥匙串不可用），请重新填写')); }
    },

    /** 管理员在本机查看已保存的企微 Secret（只在电脑端；手机页调不了） */
    'wecom.secret.reveal': (c) => {
      this.requireAdmin(c, i18nT('查看企微 Secret'));
      const sealed = this.store.readSecret();
      if (!sealed) return { secret: '' };
      try { return { secret: this.ext.seal.unseal(sealed) || '' }; } catch { throw new Error(i18nT('本机读不出已保存的 Secret（系统钥匙串不可用），请重新填写')); }
    },

    'wecom.test': async (c) => {
      this.requireAdmin(c, i18nT('测试企业微信连接'));
      const client = this.wecomClient();
      if (!client) throw new Error(i18nT('请先填写企业微信的 CorpID、AgentID 和 Secret'));
      return client.test();
    },

    // ── 声纹 ──
    'voiceprint.list': async (c) => {
      const me = this.me(c);
      let speaker2 = false;
      try { speaker2 = !!(await this.ext.checkRuntime()).speaker2; } catch { /* 查不到就不提示重录 */ }
      const s = this.s();
      const people = this.isAdmin(me.id) ? s.org.people.filter((x) => !x.left) : [me];
      return people.map((person) => {
        const v = s.voiceprints.find((x) => x.personId === person.id);
        return {
          person, deptName: T.deptName(s.org, person.deptId), status: v ? 'collected' as const : 'missing' as const,
          ...(v ? {
            consentAt: v.consentAt, enrolledAt: v.enrolledAt, sampleSeconds: v.sampleSeconds,
            // 声纹向量本身不出主进程；只给界面看：是不是新模型的、会议补充开没开、补了几条
            newModel: !!(v.vector2 && v.vector2.length), autoLearn: !!v.autoLearn, extraCount: (v.extra || []).length,
            // 本机装了更准的 ERes2NetV2，但这份声纹是旧模型采的：建议本人重录一次（不然整场会议只能用旧模型认人）
            needsUpdate: speaker2 && !(v.vector2 && v.vector2.length),
          } : {}),
        };
      });
    },

    'voiceprint.enroll': async (c, p) => {
      const me = this.me(c);
      const personId = str(p.personId) || me.id;
      if (personId !== me.id && !this.isAdmin(me.id)) throw new Error(i18nT('只能采集本人的声纹'));
      R.requireActivePerson(this.s().org, personId, i18nT('人员'));
      if (p.consent !== true) throw new Error(i18nT('采集声纹需要本人授权同意'));
      const path = String(p.path ?? '');
      if (!path || !existsSync(path) || !statSync(path).isFile()) throw new Error(i18nT('录音文件不存在'));
      const fromUpload = MeetingMgmtStore.isInside(this.store.uploadsDir(), path);
      if (c.origin === 'mobile' && !fromUpload) throw new Error(i18nT('录音文件不在上传目录里'));
      try {
        const r = await this.ext.enrollVoiceprint(path);
        if (!r.ok) throw new Error(r.reason || i18nT('录音质量不合格，请重录'));
        const now = this.nowFn();
        this.store.update((st) => {
          const prev = st.voiceprints.find((v) => v.personId === personId);
          // 采集声纹的同意里已包含「确认会议发言后用本人的发言补充声纹」：默认开；本人在声纹库里关掉过（autoLearn === false）重录也保持关。
          // 只有本人能显式开 / 关；重录时已补的样本保留（还是同一个人）
          const self = personId === me.id;
          const autoLearn = self && typeof p.autoLearn === 'boolean' ? p.autoLearn : prev?.autoLearn !== false;
          st.voiceprints = st.voiceprints.filter((v) => v.personId !== personId);
          st.voiceprints.push({
            personId, consentAt: now, enrolledAt: now, vector: r.vector, ...(r.vector2 ? { vector2: r.vector2 } : {}), sampleSeconds: r.seconds,
            ...(autoLearn
              ? { autoLearn: true, autoLearnAt: prev?.autoLearn ? (prev.autoLearnAt ?? now) : now, ...(prev?.extra?.length ? { extra: prev.extra } : {}) }
              : { autoLearn: false }),
          });
        });
        this.changed('org');
        return { ok: true, seconds: r.seconds };
      } finally {
        // 手机页传上来的原始录音只用来提声纹，不留
        if (fromUpload) { try { unlinkSync(path); } catch { /* ignore */ } }
      }
    },

    /** 电脑上现场录的声纹（配置引导 / 声纹库里「现场录音」）：录音数据落到上传目录，提完声纹即删 */
    'voiceprint.enrollData': async (c, p) => {
      const data = String(p.data ?? '');
      if (!data || data.length > 8 * 1024 * 1024) throw new Error(i18nT('录音数据无效，请重录'));
      const ext = /^(webm|ogg|wav|m4a|mp4)$/.test(String(p.ext ?? '')) ? String(p.ext) : 'webm';
      const path = join(this.store.uploadsDir(), `pc-voice-${randomBytes(6).toString('hex')}.${ext}`);
      writeFileSync(path, Buffer.from(data, 'base64'));
      // 上传目录里的文件 enroll 完会删
      return this.actions['voiceprint.enroll'](c, { personId: p.personId, consent: p.consent, path, ...(typeof p.autoLearn === 'boolean' ? { autoLearn: p.autoLearn } : {}) });
    },

    'voiceprint.delete': (c, p) => {
      const me = this.me(c);
      const personId = str(p.personId) || me.id;
      if (personId !== me.id && !this.isAdmin(me.id)) throw new Error(i18nT('只能撤回本人的声纹授权'));
      this.store.update((st) => { st.voiceprints = st.voiceprints.filter((v) => v.personId !== personId); });
      this.changed('org');
      return { ok: true };
    },

    'voiceprint.link': (c) => {
      const me = this.me(c);
      if (!this.linkBase()) throw new Error(i18nT('请先开启手机页服务（或在设置里填写卡片地址）'));
      const s = this.s();
      const people = this.isAdmin(me.id) ? s.org.people.filter((x) => !x.left) : [me];
      return {
        url: this.personUrl(me.id, { page: 'voiceprint' }),
        links: people.map((x) => ({ personId: x.id, name: x.name, deptName: T.deptName(s.org, x.deptId), url: this.personUrl(x.id, { page: 'voiceprint' }) })),
      };
    },

    'voiceprint.send': async (c) => {
      this.requireAdmin(c, i18nT('推送声纹采集'));
      const ch = this.pushChannel();
      if (!ch) throw new Error(i18nT('未连接企业微信，请先在设置里配置企微自建应用或群机器人'));
      if (!this.linkBase()) throw new Error(i18nT('请先开启手机页服务（或在设置里填写卡片地址）'));
      const s = this.s();
      // 已采集过的人不再打扰
      const todo = s.org.people.filter((x) => !x.left && !s.voiceprints.some((v) => v.personId === x.id));
      if (!todo.length) return { sent: 0, failed: [], skipped: s.org.people.filter((x) => !x.left).length };
      if (ch === 'webhook') {
        const r = await this.ext.createWebhook(this.webhookUrl()).send(buildGroupMessage({
          label: i18nT('声纹采集邀请'), title: i18nT('请还没采集声纹的同事录一段 10~15 秒的声音'),
          summary: i18nT('用于在会议纪要里自动识别你的发言，需要本人授权同意。没打开过个人专属链接的同事，请先找管理员要一次链接。'),
          mentions: todo.map((x) => this.mentionOf(x, x.name)),
          url: buildGroupUrl(this.linkBase(), null, 'voiceprint'), buttonText: i18nT('去采集'), lanOnly: this.lanOnly(),
        })).catch((e: Error) => ({ ok: false, error: e?.message }));
        return r.ok ? { sent: todo.length, failed: [], group: true } : { sent: 0, failed: todo.map((x) => ({ personId: x.id, error: r.error || i18nT('发送失败') })), group: true };
      }
      const client = this.wecomClient();
      if (!client) throw new Error(i18nT('未连接企业微信，请先在设置里配置企微'));
      let sent = 0;
      const failed: Array<{ personId: string; error: string }> = [];
      for (const person of todo) {
        const r = await client.sendCard([person.wecomUserId || person.id], {
          title: i18nT('声纹采集邀请'),
          description: i18nT('为了在会议纪要里自动识别你的发言，请录 10~15 秒声音完成声纹采集（需本人授权同意）。') + (this.lanOnly() ? `<div class="gray">${lanLinkNote()}</div>` : ''),
          url: this.personUrl(person.id, { page: 'voiceprint' }),
          btntxt: i18nT('去采集'),
        }).catch((e: Error) => ({ ok: false, error: e?.message }));
        if (r.ok) sent += 1; else failed.push({ personId: person.id, error: r.error || i18nT('发送失败') });
      }
      return { sent, failed };
    },

    // ── 手机页 ──
    'mobile.start': async (c, p) => {
      this.requireAdmin(c, i18nT('开启手机页服务'));
      await this.startMobile(Number(p.port) > 0 ? Number(p.port) : undefined);
      this.store.update((st) => { st.mobileOn = true; });
      return this.mobileStatus();
    },
    'mobile.stop': async (c) => {
      this.requireAdmin(c, i18nT('关闭手机页服务'));
      this.store.update((st) => { st.mobileOn = false; });
      const m = this.mobile;
      this.mobile = null;
      if (m) await m.stop().catch(() => {});
      this.emit({ type: 'mobile', running: false });
      return this.mobileStatus();
    },
    'mobile.status': () => this.mobileStatus(),
    'mobile.link': (c, p) => {
      const me = this.me(c);
      const personId = str(p.personId) || me.id;
      if (personId !== me.id && !this.isAdmin(me.id)) throw new Error(i18nT('只能查看本人的专属链接'));
      R.requireActivePerson(this.s().org, personId, i18nT('人员'));
      if (!this.linkBase()) throw new Error(i18nT('请先开启手机页服务（或在设置里填写卡片地址）'));
      return { url: this.personUrl(personId, undefined, p.reset === true) };
    },

    // ── 演示数据 ──
    'demo.load': (c) => {
      if (this.hasActiveAdmin()) this.requireAdmin(c, i18nT('载入演示数据'));
      for (const j of this.jobs.values()) j.abort();
      this.loadDemo(c.now, c.actorId);
      this.changed('all');
      return { ok: true };
    },
    'demo.clear': (c) => {
      this.requireAdmin(c, i18nT('清空演示数据'));
      for (const j of this.jobs.values()) j.abort();
      const ids = this.s().meetings.map((m) => m.id);
      this.store.update((st) => { st.projects = []; st.meetings = []; st.tasks = []; st.notices = []; st.demoLoaded = false; });
      for (const id of ids) this.store.removeMeetingFiles(id);
      this.changed('all');
      return { ok: true };
    },
    /** 写出演示用文字记录；给了 meetingId 就直接上传到这场会议（不靠音频走通闭环） */
    'demo.transcript': async (c, p) => {
      this.me(c);
      const path = join(this.store.demoDir(), DEMO_TRANSCRIPT_NAME);
      writeFileSync(path, DEMO_TRANSCRIPT, 'utf-8');
      if (!p.meetingId) return { path };
      const meeting = await this.upload(c, String(p.meetingId), [path]);
      return { path, meeting };
    },
  };

  // ─── 动作实现 ───────────────────────────────────────────────────────

  /** 会议搜索匹配的文字：标题、项目名、主持人和参会人姓名 */
  private meetingSearchText(m: MmMeeting, s: MmStoredState): string {
    const names = [m.hostId, ...m.attendeeIds].map((id) => s.org.people.find((x) => x.id === id)?.name || '');
    return [m.title, s.projects.find((x) => x.id === m.projectId)?.name || '', ...names].join('\n').toLowerCase();
  }

  /** 在线语音识别接口的完整配置（Key 解密，只在主进程里用）；没配齐为 null */
  private cloudAsrConfig(): CloudAsrConfig | null {
    const c = this.s().settings.ai.cloudAsr;
    const sealed = this.store.readCloudAsrKey();
    if (!c || !sealed) return null;
    let apiKey = '';
    try { apiKey = this.ext.seal.unseal(sealed) || ''; } catch { apiKey = ''; }
    return apiKey ? { provider: c.provider, baseUrl: c.baseUrl, model: c.model, apiKey } : null;
  }

  /** 给界面看的转写设置（不含 Key 原文） */
  private asrSettingsView(): { mode: 'local' | 'agent' | 'cloud'; localModel: 'auto' | 'firered' | 'sensevoice' | 'whisper'; cloud: { provider: string; baseUrl: string; model: string; hasKey: boolean } | null; presets: typeof CLOUD_ASR_PRESETS } {
    const a = this.s().settings.ai;
    return {
      mode: a.asr, localModel: a.localAsrModel ?? 'auto',
      cloud: a.cloudAsr ? { ...a.cloudAsr, hasKey: !!this.store.readCloudAsrKey() } : null,
      presets: CLOUD_ASR_PRESETS,
    };
  }

  private mobileStatus(): { running: boolean; url?: string; lanOnly?: boolean; publicBase?: string } {
    const publicBase = this.s().settings.wecom.cardBaseUrl || undefined;
    if (!this.mobile) return { running: false, ...(publicBase ? { publicBase } : {}) };
    return { running: true, url: this.mobile.url, lanOnly: this.lanOnly(), ...(publicBase ? { publicBase } : {}) };
  }

  private mobileStarting: Promise<void> | null = null;

  /** 开手机页服务（已开 / 正在开就复用）；不查权限，调用方负责 */
  private startMobile(port?: number): Promise<void> {
    if (this.mobile) return Promise.resolve();
    if (this.mobileStarting) return this.mobileStarting;
    const run = (async () => {
      const handle = await this.ext.startMobileServer({
        ...(port ? { port } : {}),
        dataDir: this.store.root(),
        dispatch: (personId, action, payload) => this.dispatch(personId, action, payload, 'mobile'),
        personByToken: (token) => this.personByToken(token),
        uploadDir: this.store.uploadsDir(),
        // 设置里填的外网 https 地址：内网 http 页面录不了音时引导到这里
        publicBase: () => this.s().settings.wecom.cardBaseUrl,
        log: (msg, meta) => this.logger?.info?.('meeting-mgmt', msg, meta),
      });
      if (this.stopped) { await handle.stop().catch(() => {}); throw new Error(i18nT('工作台已停止')); }
      this.mobile = handle;
      this.emit({ type: 'mobile', running: true, url: handle.url });
    })();
    this.mobileStarting = run;
    return run.finally(() => { this.mobileStarting = null; });
  }

  /** 上次开着的手机页服务：应用重启后自动重新开（不然已发出的企微卡片按钮全打不开）。失败只记日志，界面上仍可手动开 */
  private async resumeMobile(): Promise<void> {
    if (this.stopped || this.mobile || this.mobileStarting || !this.store.read().mobileOn) return;
    try {
      await this.startMobile();
      this.logger?.info?.('meeting-mgmt', 'mobile server resumed', { url: this.mobileStatus().url });
    } catch (e) {
      this.logger?.warn?.('meeting-mgmt', 'mobile server resume failed', { error: (e as Error)?.message });
    }
  }

  /** 任务类动作的公共部分：项目未归档 → 改任务 → 刷新 */
  private taskAction(c: Ctx, id: unknown, fn: (t: MmTask, actorId: string, p: MmProject) => void): MmTaskView {
    const me = this.me(c);
    const t = this.store.update((st) => {
      const task = this.findTask(st, id);
      const pj = this.findProject(st, task.projectId);
      R.assertProjectNotArchived(pj);
      fn(task, me.id, pj);
      return task;
    });
    this.changed('task', t.id);
    this.changed('project', t.projectId);
    return this.taskView(t, c.now);
  }

  private async upload(c: Ctx, id: string, rawPaths: unknown): Promise<MmMeeting> {
    const me = this.me(c);
    const s = this.s();
    const m = this.findMeeting(s, id);
    const pj = this.findProject(s, m.projectId);
    R.assertProjectActive(pj);
    // 先查权限和状态，再拷文件（录屏可能上 GB，越权的不要白拷）
    R.assertHost(m, me.id, i18nT('上传会议文件'));
    if (m.status !== 'pending_upload' && m.status !== 'failed') {
      throw new Error(i18nT('会议当前状态是「{p0}」，不能{p1}', { p0: R.meetingStatusLabel(m.status), p1: i18nT('上传会议文件') }));
    }
    if (this.jobs.has(id)) throw new Error(i18nT('会议正在处理中'));
    const paths = strArr(rawPaths);
    if (!paths.length) throw new Error(i18nT('请选择要上传的会议文件'));
    if (paths.length > 20) throw new Error(i18nT('一次最多上传 20 个文件'));
    const uploads = this.store.uploadsDir();
    for (const src of paths) {
      if (!existsSync(src) || !statSync(src).isFile()) throw new Error(i18nT('文件不存在：{p0}', { p0: basename(src) }));
      if (c.origin === 'mobile' && !MeetingMgmtStore.isInside(uploads, src)) throw new Error(i18nT('文件不在上传目录里'));
    }
    const dir = this.store.filesDir(id);
    const files: MmMeetingFile[] = [];
    for (const src of paths) {
      const fileId = newId('mf');
      const name = basename(src);
      const dest = join(dir, `${fileId}${extname(name).toLowerCase().replace(/[^.a-z0-9]/g, '')}`);
      if (c.origin === 'mobile') {
        // 手机页上传的临时文件直接挪进会议目录（同一个数据目录，rename 不拷贝）
        try { await fsp.rename(src, dest); } catch { await fsp.copyFile(src, dest); try { unlinkSync(src); } catch { /* ignore */ } }
      } else {
        await fsp.copyFile(src, dest);
      }
      files.push({ id: fileId, name, kind: fileKindOf(name), size: statSync(dest).size, path: dest, uploadedAt: this.nowFn() });
    }
    const oldFiles = m.files.map((f) => f.path);
    let out: MmMeeting;
    try {
      out = this.store.update((st) => {
        const mm = this.findMeeting(st, id);
        R.assertProjectActive(this.findProject(st, mm.projectId));
        R.startProcessing(mm, me.id, this.nowFn(), { files });
        return mm;
      });
    } catch (e) {
      for (const f of files) { try { unlinkSync(f.path); } catch { /* ignore */ } }
      throw e;
    }
    // 失败后重新上传：旧文件不再用
    for (const f of oldFiles) if (f && this.store.isInsideRoot(f) && !files.some((x) => x.path === f)) { try { unlinkSync(f); } catch { /* ignore */ } }
    this.changed('meeting', id);
    this.startPipeline(id);
    return this.forOrigin(out, c.origin);
  }

  /** 异步跑流水线；进度经 process 事件推，阶段变化 / 日志落盘 */
  private startPipeline(meetingId: string): void {
    const ctrl = new AbortController();
    this.jobs.set(meetingId, ctrl);
    const job = (async () => {
      const s = this.s();
      const m = this.findMeeting(s, meetingId);
      const attendees = s.org.people.filter((x) => m.attendeeIds.includes(x.id));
      const voiceprints = s.voiceprints.filter((v) => m.attendeeIds.includes(v.personId));
      let lastStage: MmProcessStage | undefined = m.process?.stage;
      const onStage = (stage: MmProcessStage, progress: number, text?: string): void => {
        if (ctrl.signal.aborted) return;
        const pct = Math.max(0, Math.min(100, Math.round(Number(progress) || 0)));
        this.emit({ type: 'process', meetingId, stage, progress: pct, ...(text ? { text } : {}) });
        if (stage === lastStage && !text) return;
        lastStage = stage;
        try {
          this.store.update((st) => {
            const mm = st.meetings.find((x) => x.id === meetingId);
            if (!mm || mm.status !== 'processing' || !mm.process) return;
            mm.process.stage = stage;
            mm.process.progress = pct;
            if (text) mm.process.log = [...mm.process.log, { at: this.nowFn(), text: String(text).slice(0, 500) }].slice(-200);
          });
        } catch { /* 进度写失败不影响处理 */ }
      };
      try {
        const r = await this.ext.runMeetingPipeline({
          meetingId, workDir: this.store.filesDir(meetingId), files: m.files, attendees, voiceprints,
          threshold: s.settings.ai.voiceprintThreshold, asr: s.settings.ai.asr, asrModel: s.settings.ai.localAsrModel ?? 'auto',
          ...(s.settings.ai.asr === 'cloud' ? { cloudAsr: this.cloudAsrConfig() ?? undefined } : {}),
          organizePrompt: s.settings.ai.organizePrompt,
          llm: this.llm, signal: ctrl.signal, onStage,
        });
        if (ctrl.signal.aborted) return;
        const now = this.nowFn();
        const out = this.store.update((st) => {
          const mm = this.findMeeting(st, meetingId);
          const pj = this.findProject(st, mm.projectId);
          const res = R.applyPipelineResult(mm, r, now);
          R.ensureMembers(pj, mm.attendeeIds);
          return { m: mm, pending: res.pending, projectName: pj.name };
        });
        this.emit({ type: 'process', meetingId, stage: 'done', progress: 100 });
        this.afterSpeakersSettled(out.m, out.pending, out.projectName, now);
      } catch (e) {
        if (ctrl.signal.aborted) return;
        const msg = (e as Error)?.message || i18nT('处理失败');
        this.warn('pipeline failed', { meetingId, error: msg });
        try { this.store.update((st) => { const mm = st.meetings.find((x) => x.id === meetingId); if (mm) R.failProcessing(mm, msg, this.nowFn()); }); } catch { /* ignore */ }
      } finally {
        if (this.jobs.get(meetingId) === ctrl) this.jobs.delete(meetingId);
        this.changed('meeting', meetingId);
      }
    })();
    this.track(job);
  }

  /** 发言人识别 / 指认之后：通知新进入未确认的人；没有发言人要确认就直接通知主持人终审 */
  private afterSpeakersSettled(m: MmMeeting, pending: string[], projectName: string, now: number): void {
    if (m.status === 'pending_confirm' && pending.length) {
      this.notify(pending.map((to) => ({
        to, type: 'speech_confirm' as const, title: i18nT('发言待确认：{p0}', { p0: m.title }),
        summary: i18nT('请核对并确认你在会上的发言（{p0}）', { p0: projectName }), link: { kind: 'meeting' as const, id: m.id },
      })), now);
    } else if (m.status === 'pending_review') {
      this.notifyReview(m, projectName, now);
    }
  }

  private notifyReview(m: MmMeeting, projectName: string, now: number): void {
    this.notify([{
      to: m.hostId, type: 'minutes_review', title: i18nT('纪要待终审：{p0}', { p0: m.title }),
      summary: i18nT('发言人已全部确认，请终审（{p0}）', { p0: projectName }), link: { kind: 'meeting', id: m.id },
    }], now);
  }

  /** 生成项目总结（结项通过 / 重新生成）；生成好通知项目负责人审核 */
  private async runSummary(projectId: string, rethrow = false): Promise<MmReport | null> {
    if (this.summaryJobs.has(projectId)) {
      if (rethrow) throw new Error(i18nT('总结报告正在生成，请稍候'));
      return null;
    }
    this.summaryJobs.add(projectId);
    this.changed('project', projectId);
    try {
      const s = this.s();
      const project = this.findProject(s, projectId);
      const report = await this.ext.generateProjectSummary({
        project, meetings: s.meetings.filter((m) => m.projectId === projectId), tasks: s.tasks.filter((t) => t.projectId === projectId),
        org: s.org, prompt: s.settings.ai.summaryPrompt, llm: this.llm,
      });
      const pj = this.store.update((st) => {
        const x = this.findProject(st, projectId);
        if (x.status !== 'closing') throw new Error(i18nT('项目状态已变化'));
        x.summary = { ...report, kind: 'summary', id: report.id || newId('rp'), generatedAt: report.generatedAt || this.nowFn() };
        return x;
      });
      this.notify([{
        to: pj.ownerId, type: 'summary_review', title: i18nT('总结报告待审核：{p0}', { p0: pj.name }),
        summary: i18nT('AI 已生成项目总结报告，请审核后归档'), link: { kind: 'project_summary', id: pj.id },
      }], this.nowFn());
      return pj.summary!;
    } catch (e) {
      this.warn('summary failed', { projectId, error: (e as Error)?.message });
      if (rethrow) throw e;
      return null;
    } finally {
      this.summaryJobs.delete(projectId);
      this.changed('project', projectId);
    }
  }

  /** 生成一份进度汇总报告（手动 / 定时），推给项目负责人和各任务负责人 */
  /**
   * 本人确认发言后，从这场会议里本人的发言补一份声纹样本（只在本人开了「用确认过的会议补充声纹」时调用）。
   * 两道保护，防止认错的段把别人的声音混进来：① 和本人注册声纹余弦 ≥ LEARN_MIN_SELF_SIM（同一个人换了麦克风 / 房间
   * 通常还有 0.4 以上，明显是别人的通常更低）；② 不能比任何其他人的声纹更像。都在同一个模型空间里比（有 ERes2NetV2 优先用它）。
   */
  private async learnVoiceprint(meetingId: string, personId: string): Promise<void> {
    const s = this.s();
    const m = s.meetings.find((x) => x.id === meetingId);
    const vp = s.voiceprints.find((x) => x.personId === personId);
    if (!m || !vp?.autoLearn || !m.files.some((f) => f.kind === 'audio' || f.kind === 'video')) return;
    const labels = new Set(m.speakers.filter((x) => x.personId === personId).map((x) => x.label));
    const ranges = m.segments.filter((x) => labels.has(x.speakerLabel)).map((x) => ({ start: x.start, end: x.end }));
    if (!ranges.length) return;
    let sample: Awaited<ReturnType<MmExternals['meetingVoiceSample']>> = null;
    try { sample = await this.ext.meetingVoiceSample(this.store.filesDir(meetingId), ranges); } catch (e) { this.warn('voiceprint learn failed', { error: (e as Error)?.message }); return; }
    if (!sample) return;
    const space: 'vector2' | 'vector' | null = sample.vector2 && vp.vector2?.length ? 'vector2' : sample.vector && vp.vector?.length ? 'vector' : null;
    if (!space) return;
    const mine = sample[space]!;
    const self = cosineSim(mine, vp[space]!);
    const others = this.s().voiceprints.filter((x) => x.personId !== personId && x[space]?.length).map((x) => cosineSim(mine, x[space]!));
    if (self < LEARN_MIN_SELF_SIM || others.some((o) => o >= self)) {
      this.logger?.info?.('meeting-mgmt', 'voiceprint sample skipped', { meetingId, personId, self: Math.round(self * 100) / 100, maxOther: others.length ? Math.round(Math.max(...others) * 100) / 100 : null });
      return;
    }
    const at = this.nowFn();
    this.store.update((st) => {
      const x = st.voiceprints.find((y) => y.personId === personId);
      if (!x?.autoLearn) return; // 期间本人关掉了
      const item: MmVoiceprintSample = { meetingId, at, seconds: sample!.seconds, ...(sample!.vector ? { vector: sample!.vector } : {}), ...(sample!.vector2 ? { vector2: sample!.vector2 } : {}) };
      x.extra = [item, ...(x.extra || []).filter((e) => e.meetingId !== meetingId)].slice(0, MM_VOICEPRINT_MAX_EXTRA);
    });
    this.changed('org');
  }

  private async runWeeklyReport(projectId: string, now: number, notifyIds?: string[], from?: number): Promise<MmReport> {
    const s = this.s();
    const project = this.findProject(s, projectId);
    const last = [...project.weeklyReports].sort((a, b) => b.generatedAt - a.generatedAt)[0];
    const periodFrom = from ?? (last ? (last.periodTo ?? last.generatedAt) : project.createdAt);
    const tasks = s.tasks.filter((t) => t.projectId === projectId);
    const report = await this.ext.generateWeeklyReport({
      project, meetings: s.meetings.filter((m) => m.projectId === projectId), tasks, org: s.org, from: periodFrom, to: now, llm: this.llm,
    });
    const saved: MmReport = { ...report, kind: 'weekly', id: report.id || newId('rp'), generatedAt: report.generatedAt || now, periodFrom: report.periodFrom ?? periodFrom, periodTo: report.periodTo ?? now };
    this.store.update((st) => {
      const pj = this.findProject(st, projectId);
      R.assertProjectNotArchived(pj);
      pj.weeklyReports = [...pj.weeklyReports, saved].slice(-60);
    });
    const to = notifyIds?.length ? notifyIds : [project.ownerId, ...tasks.filter((t) => t.status !== 'cancelled').map((t) => t.ownerId)];
    this.notify([...new Set(to)].map((id) => ({
      to: id, type: 'progress_report' as const, title: i18nT('进度汇总报告：{p0}', { p0: project.name }),
      summary: cardSummary.report(saved.stats), link: { kind: 'report' as const, id: projectId, anchor: saved.id },
    })), this.nowFn());
    this.changed('project', projectId);
    return saved;
  }

  // ─── 定时提醒 ───────────────────────────────────────────────────────

  /** 定时器每轮：算该发的提醒 → 记提醒时间（不改状态）→ 发通知；周报逐个生成 */
  async tick(): Promise<void> {
    if (this.stopped) return;
    this.ensureInit();
    await this.resumeMobile();
    const now = this.nowFn();
    const s = this.s();
    const actions = this.ext.dueReminders({ meetings: s.meetings, tasks: s.tasks, projects: s.projects, settings: s.settings }, now);
    if (!actions.length) return;
    const drafts: NoticeDraft[] = [];
    const weekly: Array<Extract<ReminderAction, { kind: 'weekly_report' }>> = [];
    this.store.update((st) => {
      for (const a of actions) {
        if (a.kind === 'weekly_report') { weekly.push(a); continue; }
        if (a.kind === 'speech_remind') {
          const m = st.meetings.find((x) => x.id === a.meetingId);
          const conf = m?.confirmations.find((x) => x.personId === a.personId);
          if (!m || !conf || m.status !== 'pending_confirm' || conf.status !== 'pending') continue;
          conf.remindedAt = now;
          const hours = a.waitedHours ?? Math.floor((now - T.confirmStartAt(m, a.personId)) / R.HOUR_MS);
          drafts.push({
            to: a.personId, type: 'speech_remind', title: i18nT('发言确认催办：{p0}', { p0: m.title }),
            summary: i18nT('会议纪要还在等你确认发言，已等待 {n} 小时', { n: Math.max(1, hours) }), link: { kind: 'meeting', id: m.id },
          });
          continue;
        }
        const t = st.tasks.find((x) => x.id === a.taskId);
        if (!t || R.isTaskClosed(t)) continue;
        const link: MmLink = { kind: 'task', id: t.id };
        if (a.kind === 'task_progress_remind') {
          t.reminders.weeklyAt = now;
          for (const to of a.notify?.length ? a.notify : [t.assigneeId]) {
            drafts.push({ to, type: 'task_progress_remind', title: i18nT('请更新进度：{p0}', { p0: t.title }), summary: i18nT('{p0} · 当前进度 {n}%', { p0: cardSummary.task(t), n: t.percent }), link });
          }
        } else if (a.kind === 'task_due_remind') {
          t.reminders.dueAt = now;
          const left = a.daysLeft ?? Math.max(0, R.daysBetweenYmd(R.ymd(now), t.due));
          const summary = left <= 0 ? i18nT('今天到期（截止 {p0}）', { p0: t.due }) : i18nT('还剩 {n} 天到期（截止 {p0}）', { n: left, p0: t.due });
          for (const to of a.notify?.length ? a.notify : [t.assigneeId]) drafts.push({ to, type: 'task_due_remind', title: i18nT('到期提醒：{p0}', { p0: t.title }), summary, link });
        } else if (a.kind === 'task_overdue') {
          t.reminders.overdueAt = now;
          const days = a.overdueDays ?? R.taskOverdueDays(t, now);
          const summary = i18nT('截止 {p0}，已逾期 {n} 天', { p0: t.due, n: Math.max(1, days) });
          for (const to of a.notify?.length ? a.notify : [...new Set([t.assigneeId, ...R.taskOwners(t)])]) drafts.push({ to, type: 'task_overdue', title: i18nT('逾期提醒：{p0}', { p0: t.title }), summary, link });
        }
      }
    });
    this.notify(drafts, now);
    if (drafts.length) { this.changed('task'); this.changed('meeting'); }
    for (const a of weekly) {
      if (this.stopped) return;
      try { await this.track(this.runWeeklyReport(a.projectId, a.periodTo ?? now, a.notify, a.periodFrom)); } catch (e) { this.warn('weekly report failed', { projectId: a.projectId, error: (e as Error)?.message }); }
    }
  }

  // ─── 给 ipc 层用 ────────────────────────────────────────────────────

  /** file.open：会议文件的本机路径（要能看到这场会议；路径必须在工作台数据目录里） */
  resolveMeetingFile(actorId: string | null, payload: unknown): string {
    this.ensureInit();
    const p: any = payload && typeof payload === 'object' ? payload : {};
    const c: Ctx = { actorId, origin: 'pc', now: this.nowFn() };
    const { m } = this.visibleMeeting(c, p.meetingId ?? p.id);
    const f = m.files.find((x) => x.id === p.fileId);
    if (!f || !f.path) throw new Error(i18nT('文件不存在'));
    if (!this.store.isInsideRoot(f.path) || !existsSync(f.path)) throw new Error(i18nT('文件不存在或已被移走'));
    return f.path;
  }
}

/** 处理阶段的显示文字（会议卡片「转写中」） */
export function stageText(stage: MmProcessStage | undefined): string {
  switch (stage) {
    case 'extract': return i18nT('提取音轨');
    case 'transcribe': return i18nT('转写中');
    case 'diarize': return i18nT('识别发言人');
    case 'parse': return i18nT('解析文字记录');
    case 'organize': return i18nT('整理中');
    case 'done': return i18nT('处理完成');
    default: return i18nT('处理中');
  }
}

const clampNum = (v: unknown, min: number, max: number, cur: number): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) return cur;
  return Math.min(max, Math.max(min, n));
};

/** 系统设置的补丁（管理员）：参数夹在合理范围；管理员至少留一位在职的人；企微只认卡片地址（其余走 wecom.save） */
export function applySettingsPatch(st: MmStoredState, patch: any): void {
  const s = st.settings;
  const active = (id: string): boolean => !!R.activePerson(st.org, id);
  if (patch.adminIds !== undefined) {
    const ids = strArr(patch.adminIds).filter(active);
    if (!ids.length) throw new Error(i18nT('至少保留一位管理员'));
    s.adminIds = ids;
  }
  if (patch.projectCreatorIds !== undefined) s.projectCreatorIds = strArr(patch.projectCreatorIds).filter(active);
  if (patch.confirmTimeoutHours !== undefined) s.confirmTimeoutHours = Math.round(clampNum(patch.confirmTimeoutHours, 1, 720, s.confirmTimeoutHours));
  if (patch.dueRemindDays !== undefined) s.dueRemindDays = Math.round(clampNum(patch.dueRemindDays, 0, 30, s.dueRemindDays));
  if (patch.trackCycleDays !== undefined) s.trackCycleDays = Math.round(clampNum(patch.trackCycleDays, 1, 90, s.trackCycleDays));
  if (patch.reportCycleDays !== undefined) s.reportCycleDays = Math.round(clampNum(patch.reportCycleDays, 1, 90, s.reportCycleDays));
  if (patch.wecom && typeof patch.wecom === 'object' && patch.wecom.cardBaseUrl !== undefined) {
    const url = str(patch.wecom.cardBaseUrl, 500);
    if (url && !/^https?:\/\/[^\s]+$/i.test(url)) throw new Error(i18nT('卡片地址请填写 http:// 或 https:// 开头的网址'));
    s.wecom = { ...s.wecom, cardBaseUrl: url || undefined };
  }
  if (patch.ai && typeof patch.ai === 'object') {
    const a = patch.ai;
    if (a.asr !== undefined) s.ai.asr = a.asr === 'agent' ? 'agent' : a.asr === 'cloud' ? 'cloud' : 'local';
    if (a.localAsrModel !== undefined) s.ai.localAsrModel = (['firered', 'sensevoice', 'whisper'] as const).includes(a.localAsrModel) ? a.localAsrModel : 'auto';
    if (a.voiceprintThreshold !== undefined) s.ai.voiceprintThreshold = clampNum(a.voiceprintThreshold, 0, 1, s.ai.voiceprintThreshold);
    for (const k of ['planPrompt', 'summaryPrompt', 'organizePrompt'] as const) {
      if (a[k] !== undefined) {
        const v = String(a[k] ?? '').trim().slice(0, 8000);
        if (v) s.ai[k] = v; else delete s.ai[k];
      }
    }
  }
}
