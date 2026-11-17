/**
 * 会议智能管理 · 落盘。账号私有目录 meeting-mgmt/ 下：
 *   state.json            组织、设置、声纹、项目、会议、任务、通知、PC 当前身份、手机页令牌（原子写，坏文件留档不当空）
 *   wecom-secret.txt      企微应用 Secret（sealedSecret 加密后的密文；state 里只有 hasSecret）
 *   wecom-webhook.txt     企微群机器人 Webhook 地址（同上加密；state 里只有 hasWebhook 和打码后的样子）
 *   files/<meetingId>/    上传的文件、抽出的音频、发言片段（流水线中间产物也写这里）
 *   voiceprints/          声纹相关文件（向量本身存在 state 里）
 *   uploads/              手机页上传的临时文件（手机页服务的 uploadDir）
 *   demo/                 演示用文字记录样例
 * 设计见 docs/meeting-mgmt-workbench.md 第二章第 4 条。
 */
import { existsSync, mkdirSync, readFileSync, rmSync, unlinkSync } from 'node:fs';
import { join, relative, resolve, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import { accountPath } from '../accountScope';
import { readJsonSafe, writeFileAtomicSync, writeJsonAtomic } from '../../utils/atomicJson';
import {
  MM_DEFAULT_SETTINGS,
  type MmMeeting, type MmNotice, type MmOrg, type MmProject, type MmSettings, type MmTask, type MmVoiceprint,
} from '../../../shared/meetingMgmt/types';

export const MM_STATE_VERSION = 1;
/** 消息中心最多留多少条（超出丢最旧的） */
export const MM_MAX_NOTICES = 2000;

export interface MmStoredState {
  version: number;
  org: MmOrg;
  settings: MmSettings;
  voiceprints: MmVoiceprint[];
  projects: MmProject[];
  meetings: MmMeeting[];
  tasks: MmTask[];
  notices: MmNotice[];
  /** PC 端当前身份（人员 id） */
  meId: string | null;
  /** PC 本机操作人（管理员）：切到别人身份代办后仍能切回来 */
  operatorId: string | null;
  /** 手机页 / 企微卡片的每人令牌：personId → token（可重置） */
  tokens: Record<string, string>;
  /** 当前数据是不是演示数据 */
  demoLoaded: boolean;
  /** 手机页服务上次是开着的：应用重启后自动重新开（企微卡片按钮才打得开） */
  mobileOn: boolean;
  /** 管理员走完（或关掉）配置引导的时间；没有 = 打开工作台时自动弹引导 */
  setupDoneAt?: number;
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function emptyState(): MmStoredState {
  return {
    version: MM_STATE_VERSION,
    org: { depts: [], people: [], source: 'none' },
    settings: cloneDefaultSettings(),
    voiceprints: [],
    projects: [],
    meetings: [],
    tasks: [],
    notices: [],
    meId: null,
    operatorId: null,
    tokens: {},
    demoLoaded: false,
    mobileOn: false,
  };
}

function cloneDefaultSettings(): MmSettings {
  return JSON.parse(JSON.stringify(MM_DEFAULT_SETTINGS)) as MmSettings;
}

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const obj = (v: unknown): Record<string, any> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, any>) : {});
const num = (v: unknown, def: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : def);

/** 把读到的任意 JSON 规整成完整状态：缺字段补默认，数组字段保证是数组 */
export function normalizeState(raw: unknown): MmStoredState {
  const r = obj(raw);
  const base = emptyState();
  const o = obj(r.org);
  const s = obj(r.settings);
  const def = cloneDefaultSettings();
  const settings: MmSettings = {
    adminIds: arr<string>(s.adminIds).map(String),
    projectCreatorIds: arr<string>(s.projectCreatorIds).map(String),
    confirmTimeoutHours: num(s.confirmTimeoutHours, def.confirmTimeoutHours),
    dueRemindDays: num(s.dueRemindDays, def.dueRemindDays),
    trackCycleDays: num(s.trackCycleDays, def.trackCycleDays),
    reportCycleDays: num(s.reportCycleDays, def.reportCycleDays),
    wecom: { ...def.wecom, ...obj(s.wecom) },
    ai: { ...def.ai, ...obj(s.ai) },
  };
  settings.wecom.hasSecret = settings.wecom.hasSecret === true;
  if (settings.wecom.hasWebhook !== true) { delete settings.wecom.hasWebhook; delete settings.wecom.webhookMasked; }
  return {
    version: MM_STATE_VERSION,
    org: {
      depts: arr<any>(o.depts).map((d) => ({ ...d, leaderIds: arr<string>(d?.leaderIds) })),
      people: arr(o.people),
      source: o.source === 'wecom' || o.source === 'demo' || o.source === 'import' ? o.source : 'none',
      ...(o.lastSync ? { lastSync: o.lastSync } : {}),
    },
    settings,
    voiceprints: arr(r.voiceprints),
    projects: arr<any>(r.projects).map((p) => ({ ...p, memberIds: arr<string>(p?.memberIds), weeklyReports: arr(p?.weeklyReports) })),
    meetings: arr<any>(r.meetings).map((m) => ({
      ...m,
      attendeeIds: arr<string>(m?.attendeeIds), files: arr(m?.files), speakers: arr(m?.speakers), segments: arr(m?.segments),
      topics: arr(m?.topics), decisions: arr(m?.decisions), summaryLines: arr(m?.summaryLines), confirmations: arr(m?.confirmations), taskIds: arr(m?.taskIds),
    })),
    tasks: arr<any>(r.tasks).map((t) => ({
      ...t, objectionHistory: arr(t?.objectionHistory), progressLog: arr(t?.progressLog), events: arr(t?.events), reminders: obj(t?.reminders),
    })),
    notices: arr(r.notices),
    meId: typeof r.meId === 'string' && r.meId ? r.meId : base.meId,
    operatorId: typeof r.operatorId === 'string' && r.operatorId ? r.operatorId : base.operatorId,
    tokens: Object.fromEntries(Object.entries(obj(r.tokens)).filter(([, v]) => typeof v === 'string' && v).map(([k, v]) => [k, String(v)])),
    demoLoaded: r.demoLoaded === true,
    mobileOn: r.mobileOn === true,
    ...(typeof r.setupDoneAt === 'number' && r.setupDoneAt > 0 ? { setupDoneAt: r.setupDoneAt } : {}),
  };
}

/** 路径片段只留安全字符（id 都是本模块生成的，这里是防御） */
const safeSeg = (s: string): string => String(s || '').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80) || '_';

export class MeetingMgmtStore {
  private cache: MmStoredState | null = null;
  private cacheDir = '';

  constructor(
    private readonly dirOf: () => string = () => accountPath('meeting-mgmt'),
    private readonly onWarn?: (msg: string) => void,
  ) {}

  /** 数据根目录（换账号后自动换目录、丢缓存） */
  root(): string {
    const d = this.dirOf();
    if (d !== this.cacheDir) { this.cache = null; this.cacheDir = d; }
    mkdirSync(d, { recursive: true });
    return d;
  }

  statePath(): string { return join(this.root(), 'state.json'); }
  secretPath(): string { return join(this.root(), 'wecom-secret.txt'); }
  webhookPath(): string { return join(this.root(), 'wecom-webhook.txt'); }
  cloudAsrKeyPath(): string { return join(this.root(), 'cloud-asr-key.txt'); }

  private sub(name: string, ...rest: string[]): string {
    const d = join(this.root(), name, ...rest);
    mkdirSync(d, { recursive: true });
    return d;
  }

  /** files/<meetingId>/（流水线的 workDir） */
  filesDir(meetingId: string): string { return this.sub('files', safeSeg(meetingId)); }
  voiceprintsDir(): string { return this.sub('voiceprints'); }
  uploadsDir(): string { return this.sub('uploads'); }
  demoDir(): string { return this.sub('demo'); }

  removeMeetingFiles(meetingId: string): void {
    const d = join(this.root(), 'files', safeSeg(meetingId));
    try { rmSync(d, { recursive: true, force: true }); } catch { /* 删不掉不影响数据 */ }
  }

  /** p 是否在 dir 之内（防止载荷里带来任意本机路径） */
  static isInside(dir: string, p: string): boolean {
    if (!p) return false;
    const rel = relative(resolve(dir), resolve(p));
    return !!rel && !rel.startsWith('..') && !isAbsolute(rel);
  }

  isInsideRoot(p: string): boolean { return MeetingMgmtStore.isInside(this.root(), p); }

  read(): MmStoredState {
    const file = this.statePath();
    if (!this.cache) this.cache = normalizeState(readJsonSafe<unknown>(file, null, this.onWarn));
    return this.cache;
  }

  /**
   * 在缓存上改，改完整份原子写回。fn 抛错时不落盘，并丢掉缓存 —— 下次从磁盘重读，
   * 磁盘上就是上一次提交的完整状态（每次提交都整份写），等于回滚了 fn 改到一半的内容。
   */
  update<T>(fn: (s: MmStoredState) => T): T {
    const cur = this.read();
    let out: T;
    try {
      out = fn(cur);
    } catch (e) {
      this.cache = null;
      throw e;
    }
    if (cur.notices.length > MM_MAX_NOTICES) cur.notices = cur.notices.slice(-MM_MAX_NOTICES);
    writeJsonAtomic(this.statePath(), cur);
    return out;
  }

  /** 整份替换（演示数据载入 / 清空） */
  replace(next: MmStoredState): void {
    this.root();
    this.cache = normalizeState(next);
    writeJsonAtomic(this.statePath(), this.cache);
  }

  /** 企微 Secret 的密文；没有返回 '' */
  readSecret(): string {
    const f = this.secretPath();
    try { return existsSync(f) ? readFileSync(f, 'utf-8').trim() : ''; } catch { return ''; }
  }

  writeSecret(sealed: string | null): void {
    const f = this.secretPath();
    if (!sealed) { try { unlinkSync(f); } catch { /* 本来就没有 */ } return; }
    writeFileAtomicSync(f, sealed, 0o600);
  }

  /** 群机器人 Webhook 地址的密文；没有返回 '' */
  readWebhook(): string {
    const f = this.webhookPath();
    try { return existsSync(f) ? readFileSync(f, 'utf-8').trim() : ''; } catch { return ''; }
  }

  writeWebhook(sealed: string | null): void {
    const f = this.webhookPath();
    if (!sealed) { try { unlinkSync(f); } catch { /* 本来就没有 */ } return; }
    writeFileAtomicSync(f, sealed, 0o600);
  }

  /** 在线语音识别接口的 API Key（系统加密后的密文） */
  readCloudAsrKey(): string {
    try { return readFileSync(this.cloudAsrKeyPath(), 'utf8').trim(); } catch { return ''; }
  }
  writeCloudAsrKey(sealed: string | null): void {
    const f = this.cloudAsrKeyPath();
    if (!sealed) { try { unlinkSync(f); } catch { /* 本来就没有 */ } return; }
    writeFileAtomicSync(f, sealed, 0o600);
  }
}
