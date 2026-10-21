/**
 * 服务商结算工作台 · 后台守护。
 *
 * 三件事，每 5 分钟一轮（启动 20s 后跑第一轮）：
 *   1. 提醒调度：每月 N 日付款提醒 / 发票到 3 天未核销 / 下发 20 天未开票 / 呆滞配件到期前 10 天二次通知；
 *   2. 收件箱扫描：IntakeService 里来自服务商的邮件/企微消息 → 发票附件自动下载重命名、负责人信息自动汇总；
 *   3. 已读回执：对已下发未标已读的服务商，去 IMAP 找回执 / 回信，打「已读 / 已回复」标。
 *
 * 提醒出口三条同时走：主窗口事件（界面 toast + 提醒中心）、系统通知（应用在后台也看得见）、
 * 定时任务结果推送那套企微/钉钉/邮件出口（复用 cron-notify.json 的配置，用户不用再填一遍 webhook）。
 */
import { EventEmitter } from 'events';
import { mailReceiptEvidence, ownMailboxRead, receiptMessageIds } from './mailReceiptEvidence';
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { Notification } from 'electron';
import { t as i18nT } from '@totalclaw/i18n';
import type { IntakeItemDTO, SsSendOutcome as SendOutcome } from '@totalclaw/ipc-contracts';
import type { ServiceSettlementStore, ReminderEvent } from './store';
import {
  evaluateTracking, renderInvoiceFileName, INVOICE_EXTENSIONS, unpaidRows, TRACKING_HEADERS,
  parseRecipients, fillTemplate, followUpDue, FOLLOW_UP_MAX_ROUNDS,
  type ProviderTrackingRecord,
} from './settlementSummary';
import { DEFAULT_NUDGE_SUBJECT, DEFAULT_NUDGE_BODY } from './store';
import { parseLeaderInfoFromText, parseLeaderInfoFromTable, validateLeader, secondNoticeDue, type LeaderInfo } from './marketingIncentive';
import { readTable, safeFileName, writeWorkbook } from './excel';

export interface ProcDeps {
  store: ServiceSettlementStore;
  intakeService?: { list(): { items: IntakeItemDTO[] }; attachmentPath(itemId: string, relPath: string): string | null; on?(ev: 'changed', cb: () => void): unknown; off?(ev: 'changed', cb: () => void): unknown } | null;
  readEmailCredentials?: () => Record<string, string>;
  /** 发邮件（复用 caseMailSender） */
  sendMail?: (input: { to: string[]; subject: string; body: string; attachments?: { filename: string; path: string }[]; headers?: Record<string, string> }) => Promise<{ ok: boolean; messageId?: string; message?: string; via?: 'self' | 'official' }>;
  /** 外部出口（企微 / 钉钉 / 邮件）——复用 cron 结果推送 */
  pushOutlets?: (title: string, body: string) => Promise<string[]>;
  /** 推给渲染进程 */
  broadcast: (event: { type: string; payload?: unknown }) => void;
  logger?: { info?: (m: string, c?: unknown) => void; warn?: (m: string, c?: unknown) => void };
  /** 输出目录兜底（没设 outputDir 时） */
  defaultOutputDir: () => string;
  /**
   * 时钟（毫秒），默认 Date.now。所有「写进记录的时间戳」（resentAt / nudgedAt / invoiceReceivedAt /
   * lastScanAt / 文件名日期）都从这里取，测试传固定时钟才能和用例里的固定日期对得上：
   * 之前 resentAt 写的是真实当下，跟测试模拟的「第 4 天重发」相差十几天，后面的节奏判断全错。
   */
  now?: () => number;
}

/**
 * 附件像不像发票：pdf/ofd 直接算（除非文件名明说是合同/协议/说明）；
 * 图片/压缩包/表格只有文件名带「发票」字样，或正文提到发票且不是小图（签名/logo 通常 < 60KB）才算。
 */
export function looksLikeInvoiceFile(fileName: string, size: number, mentionsInvoice: boolean): boolean {
  const ext = extname(fileName || '').toLowerCase();
  if (!INVOICE_EXTENSIONS.has(ext)) return false;
  const name = fileName.toLowerCase();
  if (/合同|协议|说明|对账单|结算明细|contract|agreement/.test(name)) return false;
  if (ext === '.pdf' || ext === '.ofd') return true;
  if (/发票|invoice|fapiao|fp\d|\bfp\b/.test(name)) return true;
  const isImage = ['.jpg', '.jpeg', '.png'].includes(ext);
  if (isImage && (size < 60 * 1024 || /logo|sign|signature|image0|qr|wechat|weixin/.test(name))) return false;
  return mentionsInvoice;
}

const SPREADSHEET_EXTS = new Set(['.xlsx', '.xls', '.xlsm', '.csv']);

/**
 * 列目录里的表格文件；`depth` 是再往下钻几层子目录（0 = 只看本层）。
 * 报废流程包是「根/OEM报废/FYSQ…/鉴定表.xlsx」两层，对照表 / 模板放在根：选根目录要 depth=2 才能一次全收。
 * 跳过隐藏目录 / Office 锁文件；`limit` 封顶，选错到 ~/Downloads 整棵树也不会拖死。
 */
export function listSpreadsheetFiles(dir: string, depth = 0, limit = 500): string[] {
  if (!dir || !existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (d: string, remaining: number): void => {
    let entries: import('fs').Dirent[];
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { return; }
    entries.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    for (const ent of entries) {
      if (out.length >= limit) return;
      const name = ent.name;
      if (name.startsWith('.') || name.startsWith('~$')) continue;
      const full = join(d, name);
      if (ent.isDirectory()) { if (remaining > 0) walk(full, remaining - 1); continue; }
      if (ent.isFile() && SPREADSHEET_EXTS.has(extname(name).toLowerCase())) out.push(full);
    }
  };
  walk(dir, Math.max(0, Math.trunc(depth)));
  return out;
}

/** 目标文件已存在（模板没带 {序号} 或多附件同名）时追加 -2/-3，绝不覆盖已归档的发票 */
export function uniqueTarget(dir: string, fileName: string): string {
  let target = join(dir, fileName);
  if (!existsSync(target)) return target;
  const ext = extname(fileName);
  const stem = fileName.slice(0, fileName.length - ext.length);
  for (let n = 2; n < 1000; n += 1) {
    target = join(dir, `${stem}-${n}${ext}`);
    if (!existsSync(target)) return target;
  }
  return join(dir, `${stem}-${Date.now()}${ext}`);
}

/** 一条消息算不算「负责人信息提报」：有身份证号，或姓名 + 银行卡都在 */
export function isLeaderSubmission(p: { name?: string; idCard?: string; bankCard?: string }): boolean {
  return Boolean(p.idCard) || Boolean(p.name && p.bankCard);
}

const TICK_MS = 5 * 60 * 1000;
const FIRST_TICK_MS = 20 * 1000;
const MAIL_SCAN_MIN_INTERVAL_MS = 10 * 60 * 1000;

const todayIso = (ms = Date.now()): string => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export class ServiceSettlementProc extends EventEmitter {
  private timer: NodeJS.Timeout | null = null;
  private firstTimer: NodeJS.Timeout | null = null;
  private ticking = false;
  private lastMailScanAt = 0;
  private readonly onIntakeChanged = (): void => { void this.scanIntake().catch(() => undefined); };

  constructor(private readonly deps: ProcDeps) {
    super();
  }

  private nowMs(): number { return this.deps.now?.() ?? Date.now(); }
  private nowIso(): string { return new Date(this.nowMs()).toISOString(); }

  start(): void {
    this.firstTimer = setTimeout(() => { void this.tick(); }, FIRST_TICK_MS);
    this.timer = setInterval(() => { void this.tick(); }, TICK_MS);
    if (typeof this.timer.unref === 'function') this.timer.unref();
    try { this.deps.intakeService?.on?.('changed', this.onIntakeChanged); } catch { /* intake 可能未就绪 */ }
  }

  stop(): void {
    if (this.firstTimer) clearTimeout(this.firstTimer);
    if (this.timer) clearInterval(this.timer);
    this.firstTimer = null;
    this.timer = null;
    try { this.deps.intakeService?.off?.('changed', this.onIntakeChanged); } catch { /* ignore */ }
  }

  outputDir(sub?: string): string {
    const base = this.deps.store.get().outputDir || this.deps.defaultOutputDir();
    const dir = sub ? join(base, sub) : base;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  /** 一轮：提醒 + 收件箱 + 回执。任何一段失败不影响其它段。 */
  async tick(): Promise<void> {
    if (this.ticking) return;
    this.ticking = true;
    try {
      await this.runReminders().catch((e) => this.deps.logger?.warn?.(i18nT('[结算工作台] 提醒调度失败'), { detail: (e as Error)?.message }));
      await this.scanIntake().catch((e) => this.deps.logger?.warn?.(i18nT('[结算工作台] 收件箱扫描失败'), { detail: (e as Error)?.message }));
      await this.scanMailReceipts().catch((e) => this.deps.logger?.warn?.(i18nT('[结算工作台] 回执扫描失败'), { detail: (e as Error)?.message }));
    } finally {
      this.ticking = false;
    }
  }

  // ── 提醒 ────────────────────────────────────────────────────────────────────

  async fire(type: string, title: string, body: string): Promise<ReminderEvent> {
    const outlets = await (this.deps.pushOutlets?.(title, body).catch(() => [] as string[]) ?? Promise.resolve([] as string[]));
    const ev = this.deps.store.pushReminder({ type, title, body, outlets });
    this.deps.broadcast({ type: 'reminder', payload: ev });
    try {
      if (Notification.isSupported()) {
        const n = new Notification({ title, body: body.slice(0, 200) });
        n.show();
      }
    } catch { /* 系统通知不可用不影响 */ }
    this.deps.logger?.info?.(i18nT('[结算工作台] 已触发提醒'), { type, title, outlets });
    return ev;
  }

  async runReminders(now = new Date(this.nowMs())): Promise<void> {
    const s = this.deps.store.get();
    // 1) 每月 N 日付款提醒（模块一）
    const pr = s.review.paymentReminder;
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (pr.enabled && now.getDate() >= pr.day && now.getHours() >= pr.hour && pr.lastFiredMonth !== monthKey) {
      // 只在当月 N 日当天（或错过后的第一轮）触发一次
      const period = s.review.period || monthKey;
      const total = s.review.lastSummary?.total;
      await this.fire(
        'payment_day',
        i18nT('每月 {day} 日付款提醒', { day: pr.day }),
        total != null
          ? i18nT('今天是服务商好评激励付款日。{period} 好评激励共 {count} 家服务商、合计 {total} 元，请安排付款。', { period, count: s.review.lastSummary?.providerCount ?? 0, total })
          : i18nT('今天是服务商好评激励付款日（{period}），请核对激励结果表并安排付款。', { period }),
      );
      this.deps.store.update((st) => { st.review.paymentReminder.lastFiredMonth = monthKey; });
    }
    // 2) 付款跟踪（模块二）
    const nowMs = now.getTime();
    const writeoffDue: ProviderTrackingRecord[] = [];
    const invoiceOverdue: ProviderTrackingRecord[] = [];
    for (const rec of s.settlement.records) {
      const f = evaluateTracking(rec, nowMs);
      if (f.writeoffReminderDue && !rec.remindedWriteoffAt) writeoffDue.push(rec);
      if (f.invoiceOverdue && !rec.remindedInvoiceOverdueAt) invoiceOverdue.push(rec);
    }
    if (writeoffDue.length) {
      await this.fire(
        'writeoff_3d',
        i18nT('{count} 家服务商发票已到 3 天仍未发起核销', { count: writeoffDue.length }),
        writeoffDue.map((r) => i18nT('{provider}（{period}）发票于 {date} 接收，请到费控系统发起核销流程', { provider: r.provider, period: r.period, date: (r.invoiceReceivedAt || '').slice(0, 10) })).join('\n'),
      );
      const stamp = now.toISOString();
      this.deps.store.update((st) => {
        for (const r of st.settlement.records) if (writeoffDue.some((w) => w.period === r.period && w.provider === r.provider)) r.remindedWriteoffAt = stamp;
      });
    }
    if (invoiceOverdue.length) {
      await this.fire(
        'invoice_20d',
        i18nT('{count} 家服务商超 20 天未开票', { count: invoiceOverdue.length }),
        invoiceOverdue.map((r) => i18nT('{provider}（{period}）结算明细 {date} 已下发，至今未收到发票，请催办', { provider: r.provider, period: r.period, date: (r.sentAt || '').slice(0, 10) })).join('\n'),
      );
      const stamp = now.toISOString();
      this.deps.store.update((st) => {
        for (const r of st.settlement.records) if (invoiceOverdue.some((w) => w.period === r.period && w.provider === r.provider)) r.remindedInvoiceOverdueAt = stamp;
      });
    }
    // 2b) 自动跟进（模块二）：未读满 N 天重发原邮件；已读满 N 天没发票就催办。N 共用。
    await this.runFollowUps(now);
    // 3) 定期未付款报表（模块二）
    const ur = s.settlement.unpaidReport;
    if (ur.enabled) {
      const weekKey = `${now.getFullYear()}-W${Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 86400000))}`;
      if (now.getDay() === ur.weekday && now.getHours() >= ur.hour && ur.lastFiredWeek !== weekKey) {
        const path = this.exportUnpaidReport();
        await this.fire('unpaid_report', i18nT('本周未完成付款服务商报表已生成'), i18nT('文件：{path}', { path }));
        this.deps.store.update((st) => { st.settlement.unpaidReport.lastFiredWeek = weekKey; st.settlement.unpaidReport.lastPath = path; });
      }
    }
    // 4) 呆滞配件退回二次通知（模块四）
    const rules = s.marketing.rules;
    const due = s.marketing.returnRecords.filter((r) => secondNoticeDue(r, rules.returnRemindBeforeDays, nowMs));
    if (due.length) {
      const sent: string[] = [];
      for (const rec of due) {
        const contact = this.deps.store.contact(rec.provider);
        const body = i18nT('{provider} 您好：贵司本季度需退回等额呆滞配件（金额 {amount} 元），退回截止日为 {due}，距截止已不足 {days} 天，请尽快安排退回。', { provider: rec.provider, amount: rec.amount, due: rec.dueDate, days: rules.returnRemindBeforeDays });
        let ok = false;
        const to = parseRecipients(contact?.email).valid;
        if (to.length && this.deps.sendMail) {
          const r = await this.deps.sendMail({ to, subject: i18nT('【二次提醒】呆滞配件退回即将到期'), body });
          ok = r.ok;
        }
        this.deps.store.update((st) => {
          const x = st.marketing.returnRecords.find((y) => y.provider === rec.provider);
          if (x) { x.secondNoticeAt = now.toISOString(); if (!ok) x.notifyError = i18nT('二次提醒未能发出邮件（未配邮箱或发信失败），已在提醒中心记录'); }
        });
        sent.push(`${rec.provider}${ok ? '' : i18nT('（未发出邮件）')}`);
      }
      await this.fire('return_second', i18nT('{count} 家服务商呆滞配件退回即将到期，已发二次提醒', { count: due.length }), sent.join(i18nT('、')));
    }
  }

  // ── 结算明细下发 / 重发 / 催办 ──────────────────────────────────────────────

  /**
   * 下发结算明细邮件（界面「发送」与自动重发共用一条路）。
   * 收件人一格里可以填多个（逗号隔开）；带已读回执头；每封的 Message-ID 都记下来，回执 / 回信回的是哪封都认。
   */
  async sendSettlementMails(period: string, opts: { providers?: string[]; subjectTemplate?: string; bodyTemplate?: string; requestReadReceipt?: boolean; resend?: boolean } = {}): Promise<SendOutcome[]> {
    const s = this.deps.store.get();
    const all = s.settlement.records.filter((r) => r.period === period);
    const targets = opts.providers?.length ? all.filter((r) => opts.providers!.includes(r.provider)) : all;
    if (!targets.length) throw new Error(i18nT('本期还没有结算记录，请先生成汇总表'));
    const subjectTpl = opts.subjectTemplate || s.settlement.mailSubjectTemplate;
    const bodyTpl = opts.bodyTemplate || s.settlement.mailBodyTemplate;
    const sender = (this.deps.readEmailCredentials?.() ?? {}).EMAIL_ADDRESS || '';
    const outcomes: SendOutcome[] = [];
    for (const rec of targets) {
      const contact = this.deps.store.contact(rec.provider);
      const { valid: to, invalid } = parseRecipients(rec.email || contact?.email);
      const email = to.join(', ');
      if (!to.length) {
        outcomes.push({ provider: rec.provider, ok: false, message: invalid.length ? i18nT('邮箱格式不对：{list}', { list: invalid.join(i18nT('、')) }) : i18nT('未填写邮箱') });
        continue;
      }
      if (!rec.attachmentPath || !existsSync(rec.attachmentPath)) { outcomes.push({ provider: rec.provider, email, ok: false, message: i18nT('拆分附件不存在，请重新生成汇总') }); continue; }
      if (!this.deps.sendMail) { outcomes.push({ provider: rec.provider, email, ok: false, message: i18nT('发信功能不可用') }); continue; }
      const vars = { 服务商: rec.provider, 结算期: period, 应付合计: rec.netTotal ?? '' };
      const headers: Record<string, string> = {};
      if (opts.requestReadReceipt !== false && sender) {
        headers['Disposition-Notification-To'] = sender;
        headers['Return-Receipt-To'] = sender;
      }
      const r = await this.deps.sendMail({
        to, subject: fillTemplate(subjectTpl, vars), body: fillTemplate(bodyTpl, vars),
        attachments: [{ filename: basename(rec.attachmentPath), path: rec.attachmentPath }], headers,
      });
      const nowIso = this.nowIso();
      const skipped = invalid.length ? i18nT('已跳过格式不对的：{list}', { list: invalid.join(i18nT('、')) }) : undefined;
      if (r.ok) {
        const ids = [...(rec.messageIds || (rec.messageId ? [rec.messageId] : [])), ...(r.messageId ? [r.messageId] : [])];
        const patch: Partial<ProviderTrackingRecord> = opts.resend
          ? { email, resentAt: nowIso, resendCount: (rec.resendCount || 0) + 1, messageId: r.messageId, messageIds: ids, sendError: undefined }
          // 人工重新下发开启新一轮，旧邮件回执不能证明新邮件已读。
          : { email, sentRecipients: email, readAt: undefined, repliedAt: undefined, readSource: undefined, receiptEvidenceVersion: 2, sentAt: nowIso, messageId: r.messageId, messageIds: r.messageId ? [r.messageId] : [], sendError: undefined, resentAt: undefined, resendCount: 0, nudgedAt: undefined, nudgeCount: 0 };
        this.deps.store.upsertTracking(period, rec.provider, patch);
        outcomes.push({ provider: rec.provider, email, ok: true, messageId: r.messageId, via: r.via, message: skipped });
      } else {
        this.deps.store.upsertTracking(period, rec.provider, { email, sendError: r.message });
        outcomes.push({ provider: rec.provider, email, ok: false, message: r.message });
      }
    }
    return outcomes;
  }

  /** 催办：对方已读（回执 / 回信）但迟迟没发票，按催办模板再发一封，挂在原邮件线程下 */
  async sendNudge(period: string, provider: string): Promise<SendOutcome> {
    const s = this.deps.store.get();
    const rec = this.deps.store.trackingRecord(period, provider);
    if (!rec?.sentAt) return { provider, ok: false, message: i18nT('还没下发过结算明细，无从催办') };
    const contact = this.deps.store.contact(provider);
    const { valid: to } = parseRecipients(rec.email || contact?.email);
    if (!to.length) return { provider, ok: false, message: i18nT('未填写邮箱') };
    if (!this.deps.sendMail) return { provider, ok: false, message: i18nT('发信功能不可用') };
    const vars = { 服务商: rec.provider, 结算期: period, 应付合计: rec.netTotal ?? '', 发送日期: (rec.resentAt || rec.sentAt).slice(0, 10) };
    const headers: Record<string, string> = {};
    if (rec.messageId) { headers['In-Reply-To'] = rec.messageId; headers.References = rec.messageId; }
    const r = await this.deps.sendMail({
      to, subject: fillTemplate(s.settlement.nudgeSubjectTemplate || DEFAULT_NUDGE_SUBJECT, vars), body: fillTemplate(s.settlement.nudgeBodyTemplate || DEFAULT_NUDGE_BODY, vars), headers,
    });
    if (r.ok) this.deps.store.upsertTracking(period, provider, { nudgedAt: this.nowIso(), nudgeCount: (rec.nudgeCount || 0) + 1 });
    return { provider, email: to.join(', '), ok: r.ok, message: r.message, messageId: r.messageId, via: r.via };
  }

  /** 自动跟进一轮：逐条看该重发还是该催办，发完汇总成一条提醒 */
  async runFollowUps(now = new Date(this.nowMs())): Promise<{ resent: string[]; nudged: string[]; failed: string[] }> {
    const out = { resent: [] as string[], nudged: [] as string[], failed: [] as string[] };
    const s = this.deps.store.get();
    const fu = s.settlement.followUp;
    if (!fu?.enabled) return out;
    const nowMs = now.getTime();
    for (const rec of [...s.settlement.records]) {
      const action = followUpDue(rec, fu.days, nowMs);
      if (!action) continue;
      const tag = `${rec.provider}（${rec.period}）`;
      this.deps.store.upsertTracking(rec.period, rec.provider, { followUpTriedAt: now.toISOString() });
      try {
        if (action === 'resend') {
          const [o] = await this.sendSettlementMails(rec.period, { providers: [rec.provider], resend: true });
          if (o?.ok) out.resent.push(tag); else out.failed.push(`${tag}：${o?.message || i18nT('重发失败')}`);
        } else {
          const o = await this.sendNudge(rec.period, rec.provider);
          if (o.ok) out.nudged.push(tag); else out.failed.push(`${tag}：${o.message || i18nT('催办失败')}`);
        }
      } catch (e) {
        out.failed.push(`${tag}：${(e as Error)?.message || String(e)}`);
      }
    }
    if (out.resent.length || out.nudged.length || out.failed.length) {
      const lines: string[] = [];
      if (out.resent.length) lines.push(i18nT('未读满 {days} 天已重发：{list}', { days: fu.days, list: out.resent.join(i18nT('、')) }));
      if (out.nudged.length) lines.push(i18nT('已读满 {days} 天未开票已催办：{list}', { days: fu.days, list: out.nudged.join(i18nT('、')) }));
      if (out.failed.length) lines.push(i18nT('未能发出：{list}', { list: out.failed.join('；') }));
      lines.push(i18nT('（每家重发 / 催办各最多 {n} 轮；收到发票后自动停止）', { n: FOLLOW_UP_MAX_ROUNDS }));
      await this.fire('follow_up', i18nT('结算明细自动跟进：重发 {a} 家，催办 {b} 家', { a: out.resent.length, b: out.nudged.length }), lines.join('\n'));
    }
    return out;
  }

  exportUnpaidReport(): string {
    const s = this.deps.store.get();
    const dir = this.outputDir(i18nT('结案汇总'));
    const path = join(dir, `${i18nT('未完成付款服务商明细')}-${todayIso(this.nowMs())}.xlsx`);
    writeWorkbook(path, [{ name: i18nT('未付款明细'), headers: TRACKING_HEADERS, rows: unpaidRows(s.settlement.records) }]);
    return path;
  }

  // ── 收件箱扫描：发票 + 负责人信息 ──────────────────────────────────────────────

  async scanIntake(): Promise<{ invoices: number; leaders: number }> {
    const intake = this.deps.intakeService;
    if (!intake) return { invoices: 0, leaders: 0 };
    const s = this.deps.store.get();
    const { items } = intake.list();
    const seenInvoice = new Set(s.settlement.processedIntakeIds);
    const seenLeader = new Set(s.marketing.processedIntakeIds);
    let invoices = 0;
    let leaders = 0;
    const changedProviders: string[] = [];
    for (const item of items) {
      if (item.simulated) continue;
      const contact = this.deps.store.matchProvider(item.from, `${item.subject}\n${item.body}`);
      if (!contact) continue;
      const text = `${item.subject}\n${item.body}`;
      // 发票判定按附件逐个看，不按「正文提到发票」一刀切——服务商回信引用我们自己的下发正文
      // （"请开具发票并回复"）就含"发票"二字，签名图 logo.png 曾被当成发票归档。
      if (!seenInvoice.has(item.id)) {
        const mentionsInvoice = /发票|invoice|开票/i.test(text);
        const invoiceFiles = (item.attachments || []).filter((a) => looksLikeInvoiceFile(a.fileName || '', a.size || 0, mentionsInvoice));
        if (invoiceFiles.length) {
          const openRec = this.findOpenRecord(contact.provider);
          const period = openRec?.period || s.settlement.period || todayIso(this.nowMs()).slice(0, 7);
          // 没有未结记录（本期已付款）时也要拿到该期的现有记录再合并，否则 invoiceFiles 会被覆盖成只剩新文件
          const rec = openRec || this.deps.store.trackingRecord(period, contact.provider);
          const dir = this.outputDir(join(i18nT('结案汇总'), period, i18nT('发票')));
          const existing = rec?.invoiceFiles?.length || 0;
          const saved: string[] = [];
          invoiceFiles.forEach((a, i) => {
            const src = intake.attachmentPath(item.id, a.relPath);
            if (!src || !existsSync(src)) return;
            const name = renderInvoiceFileName(s.settlement.invoiceNameTemplate, {
              provider: contact.provider, period, index: existing + i + 1, date: todayIso(this.nowMs()).replace(/-/g, ''), originalName: a.fileName,
            });
            const target = uniqueTarget(dir, name);
            try { copyFileSync(src, target); saved.push(target); } catch (e) { this.deps.logger?.warn?.(i18nT('[结算工作台] 发票附件复制失败'), { detail: (e as Error)?.message }); }
          });
          if (saved.length) {
            this.deps.store.upsertTracking(period, contact.provider, {
              invoiceReceivedAt: rec?.invoiceReceivedAt || item.receivedAt || this.nowIso(),
              invoiceFiles: [...(rec?.invoiceFiles || []), ...saved],
              repliedAt: rec?.repliedAt || item.receivedAt,
            });
            invoices += saved.length;
            changedProviders.push(contact.provider);
          }
        }
        this.deps.store.update((st) => { st.settlement.processedIntakeIds.push(item.id); });
      }
      // 负责人信息（企微 / 邮箱回传）：只认「像一次提报」的消息——带身份证号，或姓名+银行卡齐全；
      // 普通发票邮件里的开户行/账号（卖方信息）不算，否则会把已校验通过的负责人覆盖成一条残缺记录。
      if (!seenLeader.has(item.id)) {
        const parsedList: Omit<LeaderInfo, 'provider' | 'errors'>[] = [];
        const fromText = parseLeaderInfoFromText(text);
        if (isLeaderSubmission(fromText)) parsedList.push(fromText);
        for (const a of item.attachments || []) {
          if (!['.xlsx', '.xls', '.csv'].includes(extname(a.fileName).toLowerCase())) continue;
          const src = intake.attachmentPath(item.id, a.relPath);
          if (!src || !existsSync(src)) continue;
          try {
            for (const row of parseLeaderInfoFromTable(readTable(src))) {
              const { rowIndex: _row, ...fields } = row;
              if (isLeaderSubmission(fields)) parsedList.push(fields);
            }
          } catch { /* 非负责人表 */ }
        }
        if (parsedList.length) {
          this.deps.store.update((st) => {
            for (const p of parsedList) {
              const idx = st.marketing.leaders.findIndex((l) => l.provider === contact.provider);
              const prev = idx >= 0 ? st.marketing.leaders[idx] : null;
              // 合并而不是替换：新消息里空着的字段保留旧值（分两次发姓名和卡号也能拼齐）
              const info: LeaderInfo = {
                provider: contact.provider,
                name: p.name || prev?.name || '',
                idCard: p.idCard || prev?.idCard || '',
                bankCard: p.bankCard || prev?.bankCard || '',
                bankName: p.bankName || prev?.bankName || '',
                phone: p.phone || prev?.phone || '',
                source: item.channel, receivedAt: item.receivedAt, errors: [],
              };
              info.errors = validateLeader(info);
              if (idx >= 0) st.marketing.leaders[idx] = info; else st.marketing.leaders.push(info);
              leaders += 1;
            }
            st.marketing.processedIntakeIds.push(item.id);
          });
        } else {
          this.deps.store.update((st) => { st.marketing.processedIntakeIds.push(item.id); });
        }
      }
    }
    if (invoices || leaders) {
      this.deps.store.update((st) => { st.settlement.lastScanAt = this.nowIso(); });
      this.deps.broadcast({ type: 'intake-scanned', payload: { invoices, leaders, providers: changedProviders } });
      if (invoices) await this.fire('invoice_received', i18nT('收到 {count} 份服务商发票', { count: invoices }), i18nT('来自：{providers}。已自动下载并按规则重命名，进入「待核销」。', { providers: [...new Set(changedProviders)].join('、') }));
    }
    return { invoices, leaders };
  }

  /** 该服务商最近一期「已下发但还没付款」的记录 */
  private findOpenRecord(provider: string): ProviderTrackingRecord | undefined {
    const recs = this.deps.store.get().settlement.records.filter((r) => r.provider === provider && !r.writeoffCompletedAt);
    recs.sort((a, b) => (b.period || '').localeCompare(a.period || ''));
    return recs[0];
  }

  /** 手工把发票文件归档到某服务商（拖进来的） */
  importInvoices(period: string, provider: string, paths: string[]): string[] {
    const s = this.deps.store.get();
    const rec = this.deps.store.trackingRecord(period, provider);
    const dir = this.outputDir(join(i18nT('结案汇总'), period, i18nT('发票')));
    const existing = rec?.invoiceFiles?.length || 0;
    const saved: string[] = [];
    let firstError: Error | null = null;
    paths.forEach((src, i) => {
      try {
        if (!existsSync(src) || !statSync(src).isFile()) return;
        const name = renderInvoiceFileName(s.settlement.invoiceNameTemplate, {
          provider, period, index: existing + i + 1, date: todayIso(this.nowMs()).replace(/-/g, ''), originalName: basename(src),
        });
        const target = uniqueTarget(dir, name);
        copyFileSync(src, target);
        saved.push(target);
      } catch (e) {
        // 一个文件失败不能让前面已复制的文件「归档了但没记账」
        firstError = firstError || (e as Error);
      }
    });
    if (saved.length) {
      this.deps.store.upsertTracking(period, provider, {
        invoiceReceivedAt: rec?.invoiceReceivedAt || this.nowIso(),
        invoiceFiles: [...(rec?.invoiceFiles || []), ...saved],
      });
    }
    if (firstError && !saved.length) throw firstError;
    return saved;
  }

  // ── 已读回执 ────────────────────────────────────────────────────────────────

  /**
   * 用 IMAP 找「回复了我们那封下发邮件」的信：In-Reply-To / References 命中 messageId。
   * 仅匹配原邮件 ID、收件人的 displayed MDN → readAt；匹配的非自动回信 → repliedAt。
   */
  async scanMailReceipts(force = false): Promise<number> {
    const now = this.nowMs();
    if (!force && now - this.lastMailScanAt < MAIL_SCAN_MIN_INTERVAL_MS) return 0;
    const creds = this.deps.readEmailCredentials?.() || {};
    const address = (creds.EMAIL_ADDRESS || '').trim();
    const password = creds.EMAIL_PASSWORD || '';
    const host = (creds.EMAIL_IMAP_HOST || '').trim();
    const port = Number(creds.EMAIL_IMAP_PORT || 993) || 993;
    if (!address || !password || !host) {
      if (force) throw new Error(i18nT('无法查询回执：请配置完整的 IMAP 收件邮箱、服务器和授权码'));
      return 0;
    }
    const pending = this.deps.store.get().settlement.records.filter((r) => (r.messageIds?.length || r.messageId) && r.sentAt && (!r.repliedAt || r.receiptEvidenceVersion !== 2)).map(r => ({ ...r, messageIds: r.messageIds ? [...r.messageIds] : undefined }));
    if (!pending.length) return 0;
    let updated = 0;
    let client: any = null;
    try {
      const { ImapFlow } = await import('imapflow');
      client = new ImapFlow({ host, port, secure: port === 993, auth: { user: address, pass: password }, logger: false, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 60000, tls: { rejectUnauthorized: false } });
      await client.connect();
      const lock = await client.getMailboxLock('INBOX', { readOnly: true });
      try {
        for (const rec of pending) {
          // 首发 + 每次重发的 Message-ID 都查：对方可能回的是任一封
          const ids = rec.messageIds?.length ? rec.messageIds : [rec.messageId!];
          // SMTP acknowledgement is later than delivery; IMAP INTERNALDATE also has second precision.
          const since = new Date(new Date(rec.sentAt!).getTime() - 5 * 60_000);
          const found = new Set<number>();
          const recipients = parseRecipients(rec.sentRecipients || rec.email).valid;
          const ownsRecipient = recipients.some(r => r.toLowerCase() === address.toLowerCase());
          for (const id of ids) {
            const queryId = (receiptMessageIds(id)[0] || id).replace(/^<|>$/g, '');
            // MDN Original-Message-ID lives in a MIME body, often without reply headers.
            for (const u of (await client.search({ since, or: [
              { header: { 'in-reply-to': queryId } }, { header: { references: queryId } }, { body: queryId },
              ...(ownsRecipient ? receiptMessageIds(id).map(value => ({ header: { 'message-id': value.slice(1, -1) } })) : []),
            ] }, { uid: true })) || []) found.add(u);
          }
          let readAt: string | undefined;
          let repliedAt: string | undefined;
          let readSource: ProviderTrackingRecord['readSource'];
          for (const uid of found) {
            // BODY.PEEK (ImapFlow source fetch) does not mark the mailbox message read.
            const msg = await client.fetchOne(String(uid), { source: true, internalDate: true, envelope: true, flags: true }, { uid: true });
            if (!msg?.source || !msg.internalDate) continue;
            const received = new Date(msg.internalDate);
            if (!Number.isFinite(received.getTime()) || received < since) continue;
            const evidence = await mailReceiptEvidence(msg.source, ids, recipients);
            const date = received.toISOString();
            if (evidence === 'read') { readAt = readAt || date; readSource = 'mdn'; }
            if (ownMailboxRead(msg.envelope || {}, msg.flags, ids, recipients, address)) {
              // IMAP supplies a flag, not the moment it changed; record observation time, not arrival time.
              readAt = readAt || this.nowIso();
              readSource = readSource || 'mailbox';
            }
            if (evidence === 'replied') repliedAt = repliedAt || date;
          }
          // A user can resend while the network scan is in flight; do not apply old evidence to a new round.
          const current = this.deps.store.get().settlement.records.find(r => r.period === rec.period && r.provider === rec.provider);
          if (!current || current.sentAt !== rec.sentAt || current.messageId !== rec.messageId || current.email !== rec.email) continue;
          if (readAt || repliedAt || (rec.receiptEvidenceVersion !== 2 && (rec.readAt || rec.repliedAt))) {
            // Old subject/report heuristics were not reliable evidence. Revalidate on a successful scan.
            this.deps.store.upsertTracking(rec.period, rec.provider, {
              readAt: (rec.receiptEvidenceVersion === 2 ? rec.readAt : undefined) || readAt || repliedAt,
              repliedAt: (rec.receiptEvidenceVersion === 2 ? rec.repliedAt : undefined) || repliedAt,
              receiptEvidenceVersion: 2,
              readSource: readSource || (rec.receiptEvidenceVersion === 2 ? rec.readSource : undefined),
            });
            updated += 1;
          }
        }
      } finally {
        lock.release();
      }
      this.lastMailScanAt = now;
    } catch (e) {
      this.deps.logger?.warn?.(i18nT('[结算工作台] 回执扫描 IMAP 失败'), { detail: (e as Error)?.message });
      if (force) throw new Error(i18nT('回执扫描失败，阅读状态未能刷新：') + ((e as Error)?.message || i18nT('IMAP 查询失败')));
    } finally {
      try { await client?.logout(); } catch { /* ignore */ }
    }
    if (updated) this.deps.broadcast({ type: 'tracking-changed', payload: { updated } });
    return updated;
  }

  /** 列出某目录下的 Excel（数据源「选文件夹」用）；depth > 0 再往下钻 depth 层子目录 */
  listSpreadsheets(dir: string, depth = 0): string[] {
    return listSpreadsheetFiles(dir, depth);
  }

  safeName(name: string): string {
    return safeFileName(name);
  }
}
