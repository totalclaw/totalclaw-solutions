/**
 * 外贸业务智能体工作台的落盘。
 *
 * 快照固定在账号私有目录（切账号即换库），单文件原子写。
 * 邮箱授权码单独存 secrets.json，用本机密钥 AES-256-GCM 加密（与本地配置同一把钥匙），
 * 快照里只留 hasPassword，推给渲染层的状态里永远没有密码。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  FtMailbox, FtSettings, FtState,
} from '@totalclaw/ipc-contracts';
import { accountPath } from '../accountScope';
import { decryptLocalConfigString, encryptLocalConfigString, type LocalConfigEncEnvelope } from '../localConfigCrypto';

export const MAX_MESSAGES = 3000;
export const MAX_BODY = 20_000;

export type FtStoredState = Omit<FtState, 'outputDir'>;

export function defaultSettings(): FtSettings {
  return {
    moduleModels: {},
    followupRules: { inquiryNoReplyHours: 24, quoteNoReplyDays: 3, silentDays: 30 },
    quoteRules: {
      baseCurrency: 'CNY',
      quoteCurrency: 'USD',
      manualRate: 7.1,
      rateSource: 'manual',
      packagingPct: 2,
      inlandFreight: 800,
      oceanFreightPerCbm: 45,
      insurancePct: 0.3,
      marginPct: 18,
      defaultIncoterm: 'FOB',
      validityDays: 15,
    },
    autoReply: { mode: 'ack', minIntent: 'medium', skipSpam: true },
    autoExtract: true,
    reportSchedule: { enabled: false, time: '18:00', recipients: [] },
    platform: { name: 'Alibaba.com', url: 'https://i.alibaba.com', publishUrl: 'https://post.alibaba.com/product/publish.htm' },
    brand: { company: '', intro: '', sellingPoints: '' },
    sendRules: {
      dailyLimit: 40,
      maxBodyWords: 220,
      maxSubjectLen: 90,
      maxLinks: 1,
      requireOptOut: true,
      optOutLine: 'If this is not relevant to you, just reply "unsubscribe" and we will not email you again.',
      extraBanned: [],
      maxBounceRate: 0.05,
    },
    tradeDocs: {
      seller: { name: '', address: '' },
      bank: { name: '', accountName: '', accountNo: '', swift: '' },
      payment: '30% T/T deposit, 70% T/T against copy of B/L',
      portOfLoading: '',
      priceUnit: 'USD/PCS',
    },
  };
}

export function emptyState(): FtStoredState {
  return {
    mailboxes: [],
    messages: [],
    inquiries: [],
    backgrounds: [],
    prospectBatches: [],
    leads: [],
    products: [],
    quotes: [],
    orders: [],
    contents: [],
    listings: [],
    publishJobs: [],
    seoChecks: [],
    reports: [],
    suppressions: [],
    sendLog: [],
    screenings: [],
    settings: defaultSettings(),
  };
}

/** 旧快照缺字段时补默认值（设置是嵌套对象，逐层合并） */
export function normalizeState(raw: any): FtStoredState {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return base;
  const out: any = { ...base };
  for (const key of Object.keys(base) as (keyof FtStoredState)[]) {
    if (key === 'settings') continue;
    if (Array.isArray(raw[key])) out[key] = raw[key];
  }
  const s = raw.settings && typeof raw.settings === 'object' ? raw.settings : {};
  const d = base.settings;
  out.settings = {
    ...d,
    ...s,
    moduleModels: { ...(s.moduleModels || {}) },
    followupRules: { ...d.followupRules, ...(s.followupRules || {}) },
    quoteRules: { ...d.quoteRules, ...(s.quoteRules || {}) },
    autoReply: { ...d.autoReply, ...(s.autoReply || {}) },
    reportSchedule: { ...d.reportSchedule, ...(s.reportSchedule || {}) },
    platform: { ...d.platform, ...(s.platform || {}) },
    brand: { ...d.brand, ...(s.brand || {}) },
    sendRules: { ...d.sendRules, ...(s.sendRules || {}) },
    tradeDocs: {
      ...d.tradeDocs,
      ...(s.tradeDocs || {}),
      seller: { ...d.tradeDocs.seller, ...(s.tradeDocs?.seller || {}) },
      bank: { ...d.tradeDocs.bank, ...(s.tradeDocs?.bank || {}) },
    },
  };
  out.mailboxes = (out.mailboxes as FtMailbox[]).map((m) => ({
    ...m,
    autoReply: m.autoReply ?? false,
    purposes: m.purposes?.length ? m.purposes : ['inquiry'],
    totalFetched: m.totalFetched ?? 0,
  }));
  return out;
}

/** 往来邮件只留最近 MAX_MESSAGES 封、正文截断，快照不会无限长 */
export function trimMessages(state: FtStoredState): void {
  state.messages.sort((a, b) => a.at.localeCompare(b.at));
  if (state.messages.length > MAX_MESSAGES) state.messages.splice(0, state.messages.length - MAX_MESSAGES);
  for (const m of state.messages) if (m.body.length > MAX_BODY) m.body = m.body.slice(0, MAX_BODY);
}

export class ForeignTradeStore {
  private cache: FtStoredState | null = null;
  private cacheDir = '';

  constructor(
    private readonly dirOf: () => string = () => accountPath('foreign-trade'), // account-scope:account
    private readonly userDataDir: () => string = () => {
      // 延迟取 electron：单测不带 electron 也能跑（注入 userDataDir）
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // 只用来定位本机加密密钥（与本地配置共用的设备级密钥），数据本身在账号目录
      return require('electron').app.getPath('userData'); // account-scope:device
    },
  ) {}

  dir(): string {
    const d = this.dirOf();
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
    return d;
  }

  subdir(...parts: string[]): string {
    const d = join(this.dir(), ...parts);
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
    return d;
  }

  read(): FtStoredState {
    const d = this.dir();
    if (this.cache && this.cacheDir === d) return this.cache;
    const p = join(d, 'state.json');
    let state = emptyState();
    if (existsSync(p)) {
      try { state = normalizeState(JSON.parse(readFileSync(p, 'utf-8'))); } catch { state = emptyState(); }
    }
    this.cache = state;
    this.cacheDir = d;
    return state;
  }

  write(state: FtStoredState): void {
    trimMessages(state);
    const d = this.dir();
    const p = join(d, 'state.json');
    const tmp = `${p}.tmp`;
    writeFileSync(tmp, JSON.stringify(state), 'utf-8');
    renameSync(tmp, p);
    this.cache = state;
    this.cacheDir = d;
  }

  update<T>(fn: (state: FtStoredState) => T): T {
    const state = this.read();
    const result = fn(state);
    this.write(state);
    return result;
  }

  private secretsPath(): string {
    return join(this.dir(), 'secrets.json');
  }

  private readSecrets(): Record<string, LocalConfigEncEnvelope> {
    const p = this.secretsPath();
    if (!existsSync(p)) return {};
    try { return JSON.parse(readFileSync(p, 'utf-8')) || {}; } catch { return {}; }
  }

  private writeSecrets(all: Record<string, LocalConfigEncEnvelope>): void {
    const p = this.secretsPath();
    const tmp = `${p}.tmp`;
    writeFileSync(tmp, JSON.stringify(all), { encoding: 'utf-8', mode: 0o600 });
    renameSync(tmp, p);
  }

  setPassword(mailboxId: string, plain: string): void {
    const all = this.readSecrets();
    all[mailboxId] = encryptLocalConfigString(plain, this.userDataDir());
    this.writeSecrets(all);
  }

  removePassword(mailboxId: string): void {
    const all = this.readSecrets();
    delete all[mailboxId];
    this.writeSecrets(all);
  }

  /** 读不出（换机器 / 密钥丢了）返回空串，调用方按「没配授权码」处理 */
  getPassword(mailboxId: string): string {
    const env = this.readSecrets()[mailboxId];
    if (!env) return '';
    try { return decryptLocalConfigString(env, this.userDataDir()); } catch { return ''; }
  }
}
