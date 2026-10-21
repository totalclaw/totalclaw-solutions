/**
 * 服务商结算工作台 · 持久化状态（账号私有目录 `service-settlement.json`，原子写）。
 *
 * 存什么：输出目录、服务商通讯录、四个模块的配置（结算期 / 规则 / 系统网址 / 命名模板）、
 * 付款跟踪记录、呆滞配件退回记录、负责人信息、提醒历史。
 * 不存什么：整张 Excel 的解析结果——那是文件，重算成本极低，持久化只会把 JSON 撑到几十 MB。
 */
import { join } from 'path';
import { privateRoot, onAccountKeyChange } from '../accountScope';
import { readJsonSafe, writeJsonAtomic } from '../../utils/atomicJson';
import type { ReviewIncentiveRules } from './reviewIncentive';
import { normalizeProviderName } from './excel';
import type { ProviderTrackingRecord, FollowUpConfig } from './settlementSummary';
import { DEFAULT_INVOICE_NAME_TEMPLATE, DEFAULT_FOLLOW_UP, parseRecipients, formatRecipients } from './settlementSummary';
import { DEFAULT_MARKETING_RULES, type LeaderInfo, type MarketingRules, type ReturnTrackingRecord } from './marketingIncentive';
import { t as i18nT } from '@totalclaw/i18n';

export interface ProviderContact {
  provider: string;
  /** 这家的其它写法（改名前的名字、明细里的简称）——核算时并入本主体。存归一名。 */
  aliases?: string[];
  email?: string;
  /** 企微 / 微信联系人标识（gateway inbound 的 from.address） */
  wecom?: string;
  manager?: string;
  leaderName?: string;
  phone?: string;
}

export interface ReminderEvent {
  id: string;
  /** payment_day | writeoff_3d | invoice_20d | return_second | info */
  type: string;
  title: string;
  body: string;
  firedAt: string;
  read?: boolean;
  /** 提醒是否已推到外部出口（企微/钉钉/邮件） */
  outlets?: string[];
}

export interface PaymentReminderConfig {
  enabled: boolean;
  /** 每月几号 */
  day: number;
  /** 几点（本地时间） */
  hour: number;
  lastFiredMonth?: string;
}

export interface ReviewModuleState {
  period?: string;
  rules?: Partial<ReviewIncentiveRules>;
  lastOutputPath?: string;
  lastRunAt?: string;
  lastSummary?: { providerCount: number; total: number };
  paymentReminder: PaymentReminderConfig;
}

export interface SettlementModuleState {
  period?: string;
  invoiceNameTemplate: string;
  expenseSystemUrl?: string;
  mailSubjectTemplate: string;
  mailBodyTemplate: string;
  /** 已读 N 天没发票时的催办邮件 */
  nudgeSubjectTemplate: string;
  nudgeBodyTemplate: string;
  /** 未读 N 天自动重发 / 已读 N 天自动催办 */
  followUp: FollowUpConfig;
  records: ProviderTrackingRecord[];
  lastSummaryPath?: string;
  lastSplitDir?: string;
  lastRunAt?: string;
  lastScanAt?: string;
  processedIntakeIds: string[];
  /** 定期未付款报表 */
  unpaidReport: { enabled: boolean; weekday: number; hour: number; lastFiredWeek?: string; lastPath?: string };
}

export interface ScrapModuleState {
  expenseSystemUrl?: string;
  lastOutputPath?: string;
  lastRunAt?: string;
  lastLookupPath?: string;
}

export interface MarketingModuleState {
  year?: number;
  quarter?: 1 | 2 | 3 | 4;
  youzanUrl?: string;
  cssUrl?: string;
  rules: MarketingRules;
  rulesPdfPath?: string;
  rulesPdfPaths?: string[];
  rulesReviewPending?: boolean;
  rulesReviewRevision?: number;
  returnRecords: ReturnTrackingRecord[];
  leaders: LeaderInfo[];
  processedIntakeIds: string[];
  lastIncentivePath?: string;
  lastTaxPath?: string;
  lastReportPath?: string;
  taxTemplatePath?: string;
  /** 第 8 步算出来的负责人激励（服务商 → 金额），个税表要用 */
  leaderIncentiveByProvider?: Record<string, number>;
  lastRunAt?: string;
}

export interface ServiceSettlementState {
  version: 1;
  outputDir?: string;
  providerDirectory: ProviderContact[];
  review: ReviewModuleState;
  settlement: SettlementModuleState;
  scrap: ScrapModuleState;
  marketing: MarketingModuleState;
  reminders: ReminderEvent[];
}

export const DEFAULT_MAIL_SUBJECT = '【{结算期}】{服务商} 服务费用结算明细';
export const DEFAULT_MAIL_BODY = [
  '{服务商} 您好：',
  '',
  '附件为 {结算期} 服务费用结算明细（含工单结算、各项激励与补扣子表），请查收核对。',
  i18nT('如无异议，请按明细金额开具发票并回复本邮件（或通过企微发送发票附件），我们收到发票后将发起核销付款流程。'),
  '',
  '应付合计：{应付合计} 元',
  '',
  i18nT('谢谢！'),
].join('\n');

export const DEFAULT_NUDGE_SUBJECT = '【催办】{结算期} {服务商} 结算明细请尽快开票';
export const DEFAULT_NUDGE_BODY = [
  '{服务商} 您好：',
  '',
  i18nT('{结算期} 服务费用结算明细已于 {发送日期} 发送并确认送达，至今未收到贵司发票。'),
  i18nT('请尽快按明细金额开具发票并回复本邮件（或通过企微发送发票附件），以便我们发起核销付款流程。'),
  '',
  '应付合计：{应付合计} 元',
  '',
  i18nT('谢谢！'),
].join('\n');

export function defaultState(): ServiceSettlementState {
  return {
    version: 1,
    providerDirectory: [],
    review: { paymentReminder: { enabled: true, day: 10, hour: 9 } },
    settlement: {
      invoiceNameTemplate: DEFAULT_INVOICE_NAME_TEMPLATE,
      mailSubjectTemplate: DEFAULT_MAIL_SUBJECT,
      mailBodyTemplate: DEFAULT_MAIL_BODY,
      nudgeSubjectTemplate: DEFAULT_NUDGE_SUBJECT,
      nudgeBodyTemplate: DEFAULT_NUDGE_BODY,
      followUp: { ...DEFAULT_FOLLOW_UP },
      records: [],
      processedIntakeIds: [],
      unpaidReport: { enabled: false, weekday: 1, hour: 9 },
    },
    scrap: {},
    marketing: {
      rules: { ...DEFAULT_MARKETING_RULES },
      returnRecords: [],
      leaders: [],
      processedIntakeIds: [],
    },
    reminders: [],
  };
}

const MAX_REMINDERS = 200;
const MAX_PROCESSED_IDS = 2000;

export class ServiceSettlementStore {
  private state: ServiceSettlementState | null = null;

  constructor() {
    // 账号切换必须丢内存缓存：path() 按当前账号现算，但 state 若不失效，
    // 下一次 save() 会把 A 账号的通讯录/跟踪记录写进 B 账号目录（跨账号串数据）。
    // 与 workFolderStore / conversationStore 同一套路。
    onAccountKeyChange(() => { this.state = null; });
  }

  private path(): string {
    return join(privateRoot(), 'service-settlement.json');
  }

  get(): ServiceSettlementState {
    if (!this.state) {
      const raw = readJsonSafe<Partial<ServiceSettlementState> | null>(this.path(), null);
      const base = defaultState();
      if (raw && raw.version === 1) {
        this.state = {
          ...base,
          ...raw,
          review: { ...base.review, ...(raw.review || {}), paymentReminder: { ...base.review.paymentReminder, ...(raw.review?.paymentReminder || {}) } },
          settlement: {
            ...base.settlement, ...(raw.settlement || {}),
            unpaidReport: { ...base.settlement.unpaidReport, ...(raw.settlement?.unpaidReport || {}) },
            followUp: { ...base.settlement.followUp, ...(raw.settlement?.followUp || {}) },
          },
          scrap: { ...base.scrap, ...(raw.scrap || {}) },
          marketing: { ...base.marketing, ...(raw.marketing || {}), rules: { ...DEFAULT_MARKETING_RULES, ...(raw.marketing?.rules || {}) } },
          providerDirectory: Array.isArray(raw.providerDirectory) ? raw.providerDirectory : [],
          reminders: Array.isArray(raw.reminders) ? raw.reminders : [],
        };
      } else {
        this.state = base;
      }
    }
    return this.state;
  }

  /** 账号切换后缓存失效 */
  reset(): void {
    this.state = null;
  }

  save(): void {
    if (!this.state) return;
    if (this.state.reminders.length > MAX_REMINDERS) this.state.reminders = this.state.reminders.slice(-MAX_REMINDERS);
    if (this.state.settlement.processedIntakeIds.length > MAX_PROCESSED_IDS) this.state.settlement.processedIntakeIds = this.state.settlement.processedIntakeIds.slice(-MAX_PROCESSED_IDS);
    if (this.state.marketing.processedIntakeIds.length > MAX_PROCESSED_IDS) this.state.marketing.processedIntakeIds = this.state.marketing.processedIntakeIds.slice(-MAX_PROCESSED_IDS);
    writeJsonAtomic(this.path(), this.state);
  }

  update(mutate: (s: ServiceSettlementState) => void): ServiceSettlementState {
    const s = this.get();
    mutate(s);
    this.save();
    return s;
  }

  // ── 服务商通讯录 ──

  // 通讯录 / 跟踪记录一律用归一后的服务商名做 key（半角括号、空格）：核算结果里的名字是归一的，
  // 通讯录导入表 / 费控回写表里是原始写法，不归一就对不上（2026-09-04 审查）
  contact(provider: string): ProviderContact | undefined {
    const key = normalizeProviderName(provider);
    return this.get().providerDirectory.find((c) => normalizeProviderName(c.provider) === key);
  }

  upsertContacts(contacts: ProviderContact[]): void {
    this.update((s) => {
      for (const c of contacts) {
        const name = normalizeProviderName(c.provider);
        if (!name) continue;
        const existing = s.providerDirectory.find((x) => normalizeProviderName(x.provider) === name);
        if (existing) {
          if (c.aliases !== undefined) {
            const merged = new Set([...(existing.aliases || []), ...(c.aliases || [])].map((a) => normalizeProviderName(a)).filter((a) => a && a !== name));
            existing.aliases = [...merged];
          }
          if (c.email !== undefined) existing.email = c.email == null ? undefined : formatRecipients(c.email) || undefined;
          if (c.wecom !== undefined) existing.wecom = c.wecom?.trim();
          if (c.manager !== undefined) existing.manager = c.manager?.trim();
          if (c.leaderName !== undefined) existing.leaderName = c.leaderName?.trim();
          if (c.phone !== undefined) existing.phone = c.phone?.trim();
        } else {
          s.providerDirectory.push({ ...c, provider: name, email: c.email == null ? undefined : formatRecipients(c.email) || undefined });
        }
      }
      s.providerDirectory.sort((a, b) => a.provider.localeCompare(b.provider, 'zh-CN'));
    });
  }

  /** 别名 → 主体名（都是归一名）。给核算函数用：明细里出现别名的行并入主体。 */
  aliasMap(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const c of this.get().providerDirectory) {
      const main = normalizeProviderName(c.provider);
      for (const a of c.aliases || []) { const k = normalizeProviderName(a); if (k && k !== main) out[k] = main; }
    }
    return out;
  }

  /** 通讯录里的规范名（归一后）——明细里的名称变体往这上面归并 */
  directoryNames(): string[] {
    return this.get().providerDirectory.map((c) => normalizeProviderName(c.provider)).filter(Boolean);
  }

  /** 汇总 / 核算后把新出现的服务商补进通讯录（邮箱留空让用户填） */
  ensureProviders(names: string[]): void {
    const known = new Set(this.get().providerDirectory.map((c) => normalizeProviderName(c.provider)));
    const fresh = [...new Set(names.map((n) => normalizeProviderName(n)))].filter((n) => n && !known.has(n));
    if (fresh.length) this.upsertContacts(fresh.map((provider) => ({ provider })));
  }

  /** 按发件地址 / 名称反查服务商 */
  matchProvider(from: { address?: string; name?: string }, text?: string): ProviderContact | undefined {
    const dir = this.get().providerDirectory;
    const addr = (from.address || '').trim().toLowerCase();
    const name = (from.name || '').trim();
    if (addr) {
      // 一家可能填了多个邮箱（逗号隔开），任一个对上都算这家
      const hit = dir.find((c) => parseRecipients(c.email).valid.some((e) => e.toLowerCase() === addr) || (c.wecom || '').trim().toLowerCase() === addr);
      if (hit) return hit;
    }
    // 兜底只看发件人名称与主题（第一行），不看正文：正文里提到某家服务商不等于这封信是它发的
    // （群发、转发、引用都会命中）。名称相等最优先；包含匹配要求服务商名 ≥3 字。
    // 两边都归一再比：来信里「xx中心(个体工商户)」半角括号也要能对上目录里的全角写法
    const subject = normalizeProviderName(String(text || '').split('\n')[0] || '');
    const normName = normalizeProviderName(name);
    const sorted = [...dir].map((c) => ({ c, key: normalizeProviderName(c.provider) })).sort((a, b) => b.key.length - a.key.length);
    const byName = sorted.find(({ key }) => normName && (normName === key || (key.length >= 3 && normName.includes(key))));
    if (byName) return byName.c;
    return sorted.find(({ key }) => key.length >= 3 && subject.includes(key))?.c;
  }

  // ── 付款跟踪 ──

  trackingRecord(period: string, provider: string): ProviderTrackingRecord | undefined {
    const key = normalizeProviderName(provider);
    return this.get().settlement.records.find((r) => r.period === period && normalizeProviderName(r.provider) === key);
  }

  upsertTracking(period: string, provider: string, patch: Partial<ProviderTrackingRecord>): ProviderTrackingRecord {
    let out!: ProviderTrackingRecord;
    const key = normalizeProviderName(provider);
    this.update((s) => {
      let rec = s.settlement.records.find((r) => r.period === period && normalizeProviderName(r.provider) === key);
      if (!rec) {
        rec = { period, provider: key };
        s.settlement.records.push(rec);
      }
      Object.assign(rec, patch);
      out = rec;
    });
    return out;
  }

  // ── 提醒 ──

  pushReminder(ev: Omit<ReminderEvent, 'id' | 'firedAt'> & { firedAt?: string }): ReminderEvent {
    const full: ReminderEvent = {
      id: `rm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      firedAt: ev.firedAt || new Date().toISOString(),
      ...ev,
    };
    this.update((s) => { s.reminders.push(full); });
    return full;
  }
}
