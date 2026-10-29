/**
 * 解决方案 · 外贸业务智能体工作台（主进程）。
 *
 * 一条动作通道 WORKBENCH_FT_INVOKE，按 action 分发到十个模块 + 多邮箱接管；
 * 状态变化经 WORKBENCH_FT_EVENT 推给渲染层。
 *
 * 分工：
 *   - 钱、数量、日期、汇总全部由 services/foreignTrade/logic.ts 的纯函数算，模型不参与；
 *   - 模型只做读资料、分类、写文字，每个模块用设置里明确指定的模型（moduleModels），
 *     结果上记下是哪个模型产出的；
 *   - 对外发信默认要人在界面上点发送；只有业务员给某个邮箱打开「自动回复」时，
 *     新询盘才按规则自动回信。
 *   - 每封对外邮件发出前都过发信闸门（logic.ts::checkOutgoing）：抑制名单、每日额度、占位符、AI 腔、
 *     退订句、发出内容与确认时一致、对方已回信就停。被拦下的也记进发送账本。
 */
import { app, dialog, ipcMain, net, shell, type BrowserWindow } from 'electron';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { promises as dns } from 'node:dns';
import { userInfo } from 'node:os';
import { basename, extname, join } from 'node:path';
import * as XLSX from 'xlsx';
import {
  IPC_CHANNELS,
  type FtBackground, type FtContentDraft, type FtFollowupItem, type FtGateResult, type FtIncoterm, type FtInquiry, type FtLead,
  type FtMailbox, type FtMailboxInput, type FtMessage, type FtModuleKey, type FtOrder, type FtOrderDoc,
  type FtOrderDocKind, type FtProduct, type FtProspectCriteria, type FtQuote, type FtQuoteLine, type FtReplyType, type FtReport,
  type FtScreeningResult, type FtScreeningSourceId, type FtSendKind, type FtSettings, type FtSource, type FtState, type FtTradeDocInput,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { createWorkbenchLlm } from '../services/workbenchLlm';
import { onAppWillQuit } from '../util/quitRegistry';
import { ForeignTradeStore, type FtStoredState } from '../services/foreignTrade/store';
import {
  humanizeMailError, mailboxPresets, messageKey, pollMailbox, sendFromMailbox, testMailbox, type SendInput,
} from '../services/foreignTrade/mailboxes';
import {
  applyOptOuts, backgroundChecks, buildReportStats, calcQuote, checkOutgoing, compareOrderDocs, customerTimeline, defaultOrderNodes,
  diagnoseListing, emailDomainOf, findSuppression, gateMessage, hashOutgoing, inquiryMessages, ingestMails, lintTitle, matchByRules, newId,
  parseListingRows, parseProductRows, quoteFoundIn, recomputeLeadScore, recordSend, reportRows, round2, scanFollowups, fmtNum,
  type FtGateContext, type FtOutgoingDraft, type FxInfo,
} from '../services/foreignTrade/logic';
import {
  buildCommercialInvoice, buildPackingList, buildProforma, docFields, layoutSheet, normalizeTradeInput, parseTradeSheet, tradeTotals, validateTradeDocInput,
  validateTradeDocs, type DocCell, type SheetCell, type TradeDocModel,
} from '../services/foreignTrade/tradeDocs';
import { normalizeName, ScreeningLists, SCREENING_IDS, SCREENING_STALE_DAYS } from '../services/foreignTrade/screening';
import { buildHsTable, hsSearch, parseHsCsv, validateHsCode, type HsTable } from '../services/foreignTrade/hsCodes';
import { shellResource } from '../services/runtimeLocation';
import * as P from '../services/foreignTrade/prompts';
import { documentsFolderName } from '../services/brandPaths';

const store = new ForeignTradeStore();
const POLL_INTERVAL_MS = 120_000;
const TICK_INTERVAL_MS = 60_000;
const FREE_MAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'aol.com', 'icloud.com', 'qq.com', '163.com', '126.com',
  'mail.ru', 'yandex.ru', 'yandex.com', 'gmx.com', 'protonmail.com', 'foxmail.com', 'sina.com', 'msn.com',
]);
const SKIP_HOSTS = /(alibaba|aliexpress|amazon|made-in-china|globalsources|ebay|facebook|linkedin|instagram|youtube|twitter|x\.com|wikipedia|tiktok|pinterest|indiamart|tradeindia|yellowpages|reddit|quora|bing\.com|google\.)/i;

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/** ISO 时间 → 本地日期（报价单上的日期、文件名用本地日，不用 UTC） */
function localDate(iso: string): string {
  return todayIso(new Date(iso));
}

function todayIso(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function parseEmails(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : String(raw || '').split(/[,，;；\s]+/);
  const out = list.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean);
  const bad = out.filter((e) => !EMAIL_RE.test(e));
  if (bad.length) throw new Error(i18nT('邮箱地址格式不对：{p0}', { p0: bad.join('、') }));
  return [...new Set(out)];
}

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function originOf(url: string): string {
  try { return new URL(url).origin; } catch { return ''; }
}

function emailDomain(email?: string): string {
  const d = String(email || '').split('@')[1]?.toLowerCase() || '';
  return d && !FREE_MAIL_DOMAINS.has(d) ? d : '';
}

function htmlEscape(s: string): string {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

function requireFound<T>(value: T | undefined, what: string): T {
  if (!value) throw new Error(i18nT('找不到{p0}，可能已被删除，请刷新', { p0: what }));
  return value;
}

export function registerForeignTradeHandlers(deps: WorkbenchIpcDeps): () => void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const broadcast = (type: 'state' | 'mailbox' | 'inquiry' | 'progress', payload?: unknown): void => {
    try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_FT_EVENT, { type, payload }); } catch { /* 窗口已关 */ }
  };
  const progress = (key: string, message: string): void => broadcast('progress', { key, message });

  const outputDir = (sub?: string): string => {
    const s = store.read().settings;
    const root = s.outputDir && existsSync(s.outputDir) ? s.outputDir : join(app.getPath('documents'), documentsFolderName(), i18nT('外贸业务'));
    const dir = sub ? join(root, sub) : root;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  };

  const publicState = (): FtState => ({ ...store.read(), outputDir: outputDir() });
  const pushState = (): void => broadcast('state');

  // ─── 模型：每个模块明确指定（与财务智能体工作台共用 services/workbenchLlm） ─────

  const models = createWorkbenchLlm(deps, {
    logTag: 'foreign-trade',
    moduleModel: (module) => store.read().settings.moduleModels[module as FtModuleKey] || '',
  });
  const { modelOptions } = models;
  const llm = (module: FtModuleKey, prompt: string, timeoutMs?: number) => models.llm(module, prompt, timeoutMs);
  const llmJson = (module: FtModuleKey, prompt: string, timeoutMs?: number) => models.llmJson(module, prompt, timeoutMs);

  // ─── 邮箱 ──────────────────────────────────────────────────────────────

  const mailbox = (s: FtStoredState, id: string | undefined): FtMailbox => requireFound(s.mailboxes.find((m) => m.id === id), i18nT('邮箱'));

  async function sendVia(mailboxId: string | undefined, input: SendInput): Promise<FtMessage> {
    const s = store.read();
    if (!mailboxId) throw new Error(i18nT('请选择发件邮箱'));
    const mb = mailbox(s, mailboxId);
    if (!mb.enabled) throw new Error(i18nT('邮箱「{p0}」已停用', { p0: mb.label || mb.address }));
    const to = parseEmails(input.to);
    if (!to.length) throw new Error(i18nT('请填写收件人'));
    if (!input.subject.trim() || !input.body.trim()) throw new Error(i18nT('标题和正文不能为空'));
    let res;
    try {
      res = await sendFromMailbox(mb, store.getPassword(mb.id), { ...input, to });
    } catch (error) {
      throw new Error(humanizeMailError(error));
    }
    if (!res.accepted.length && res.rejected.length) throw new Error(i18nT('邮件服务器拒收：{p0}', { p0: res.rejected.join('、') }));
    const now = new Date().toISOString();
    const msg: FtMessage = {
      id: messageKey(mb.id, res.messageId || undefined, `out:${now}`),
      mailboxId: mb.id,
      direction: 'out',
      messageId: res.messageId || undefined,
      inReplyTo: input.inReplyTo,
      from: mb.address.toLowerCase(),
      fromName: mb.senderName,
      to,
      subject: input.subject,
      body: input.body,
      at: now,
      attachments: (input.attachments || []).map((a) => ({ name: a.filename, path: a.path, size: 0 })),
    };
    store.update((st) => { if (!st.messages.some((m) => m.id === msg.id)) st.messages.push(msg); });
    logger?.info?.('foreign-trade', i18nT('已发信'), { mailbox: mb.address, to: to.join(','), subject: input.subject });
    return msg;
  }

  // ─── 发信闸门 ──────────────────────────────────────────────────────────

  const lastIn = (s: FtStoredState, email: string) => s.messages.filter((m) => m.direction === 'in' && m.from === email).map((m) => m.at).sort().pop() || '';
  const lastOut = (s: FtStoredState, email: string) => s.messages.filter((m) => m.direction === 'out' && m.to.includes(email)).map((m) => m.at).sort().pop() || '';

  /** 线程状态：对方是否已回信（跟进 / 开发信要停）、我方是否已回过（自动回复要停、人工回复要提醒） */
  function threadContext(s: FtStoredState, d: FtOutgoingDraft, item?: { reason?: string; since?: string }): Partial<FtGateContext> {
    const e = (d.to[0] || '').trim().toLowerCase();
    if (!e) return {};
    if (d.kind === 'outreach') {
      const lead = s.leads.find((l) => l.id === d.refId);
      const since = lead?.letter?.at || '';
      const replied = d.to.map((x) => lastIn(s, x.toLowerCase())).sort().pop() || '';
      return { websiteHost: lead?.website ? hostOf(lead.website) : undefined, repliedAt: replied && replied > since ? replied : undefined };
    }
    if (d.kind === 'followup') {
      const since = item?.since || '';
      if (item?.reason === 'inquiry_unanswered') { const out = lastOut(s, e); return { answeredAt: out && out > since ? out : undefined }; }
      const inn = lastIn(s, e);
      return { repliedAt: since && inn > since ? inn : undefined };
    }
    if (d.kind === 'inquiry_reply' || d.kind === 'auto_reply') {
      const q = s.inquiries.find((x) => x.id === d.refId);
      const inn = q ? (lastInbound(s, q)?.at || q.receivedAt) : lastIn(s, e);
      const out = lastOut(s, q?.customerEmail || e);
      return { answeredAt: out && out > inn ? out : undefined };
    }
    return {};
  }

  function gateCheck(d: FtOutgoingDraft, extra: Partial<FtGateContext> & { item?: { reason?: string; since?: string } } = {}): FtGateResult {
    const s = store.read();
    const { item, ...rest } = extra;
    return checkOutgoing(d, { rules: s.settings.sendRules, suppressions: s.suppressions, sendLog: s.sendLog, now: Date.now(), ...threadContext(s, d, item), ...rest });
  }

  /**
   * 所有对外邮件的唯一出口：先过闸门（人工发送必须带确认时的摘要 approvedHash），拦下的记账本并报原因；
   * 发出去的记「已发」，发送出错的记「失败」——失败的不自动重试（结果不确定时重发可能造成重复邮件）。
   */
  async function gatedSend(d: FtOutgoingDraft, opts: { approvedHash?: string; item?: { reason?: string; since?: string }; inReplyTo?: string; attachments?: SendInput['attachments'] } = {}): Promise<FtMessage> {
    const to = parseEmails(d.to);
    const draft = { ...d, to };
    const res = gateCheck(draft, { approvedHash: opts.approvedHash, item: opts.item });
    if (!opts.approvedHash) {
      res.issues.unshift({ rule: 'not_approved', level: 'block', message: i18nT('没有经过发送前检查与确认，不能发出') });
      res.ok = false;
    }
    const base = { mailboxId: d.mailboxId, kind: d.kind, to, subject: d.subject, hash: res.hash, refId: d.refId };
    if (!res.ok) {
      store.update((st) => { recordSend(st.sendLog, { ...base, at: new Date().toISOString(), status: 'blocked', reason: res.issues.filter((i) => i.level === 'block').map((i) => i.message).join(i18nT('；')) }); });
      const err = new Error(gateMessage(res)) as Error & { gate?: FtGateResult };
      err.gate = res;
      throw err;
    }
    try {
      const msg = await sendVia(d.mailboxId, { to, subject: d.subject, body: d.body, inReplyTo: opts.inReplyTo, attachments: opts.attachments });
      store.update((st) => { recordSend(st.sendLog, { ...base, at: msg.at, status: 'sent' }); });
      return msg;
    } catch (error) {
      store.update((st) => { recordSend(st.sendLog, { ...base, at: new Date().toISOString(), status: 'failed', reason: (error as Error)?.message || String(error) }); });
      throw error;
    }
  }

  const extractQueue: string[] = [];
  let extracting = false;

  async function pollOne(id: string): Promise<{ fetched: number; created: number; error?: string }> {
    const s = store.read();
    const mb = mailbox(s, id);
    const setStatus = (patch: Partial<FtMailbox>) => store.update((st) => { const t = st.mailboxes.find((m) => m.id === id); if (t) Object.assign(t, patch); });
    const password = store.getPassword(id);
    if (!password) {
      setStatus({ status: 'error', statusDetail: i18nT('没有保存授权码') });
      broadcast('mailbox', { id });
      return { fetched: 0, created: 0, error: i18nT('没有保存授权码') };
    }
    if (!mb.imapHost) {
      setStatus({ status: 'error', statusDetail: i18nT('没有填收信服务器（IMAP）') });
      return { fetched: 0, created: 0, error: i18nT('没有填收信服务器（IMAP）') };
    }
    try {
      const out = await pollMailbox(mb, password, store.subdir('attachments', id));
      const result = store.update((st) => {
        const t = st.mailboxes.find((m) => m.id === id);
        if (t) {
          t.sync = out.cursors;
          t.status = 'ready';
          t.statusDetail = i18nT('收件正常');
          t.lastSyncAt = new Date().toISOString();
          t.lastFetched = out.mails.length;
          t.totalFetched = (t.totalFetched || 0) + out.mails.length;
        }
        const own = new Set(st.mailboxes.map((m) => m.address.toLowerCase()));
        const r = ingestMails(st, out.mails, own);
        const suppressed = applyOptOuts(st, out.mails, own);
        if (suppressed.length) logger?.info?.('foreign-trade', '退订 / 退信已进抑制名单', { count: suppressed.length });
        return r;
      });
      if (result.created.length && store.read().settings.autoExtract) {
        extractQueue.push(...result.created);
        void drainExtractQueue();
      }
      broadcast('mailbox', { id });
      if (result.created.length || result.updated.length) broadcast('inquiry', { created: result.created, updated: result.updated });
      return { fetched: out.mails.length, created: result.created.length };
    } catch (error) {
      const msg = humanizeMailError(error);
      setStatus({ status: 'error', statusDetail: msg });
      broadcast('mailbox', { id });
      logger?.warn?.('foreign-trade', i18nT('收件失败'), { mailbox: mb.address, error: msg });
      return { fetched: 0, created: 0, error: msg };
    }
  }

  let polling = false;
  async function pollAll(): Promise<Record<string, { fetched: number; created: number; error?: string }>> {
    if (polling) return {};
    polling = true;
    const out: Record<string, { fetched: number; created: number; error?: string }> = {};
    try {
      for (const mb of store.read().mailboxes.filter((m) => m.enabled)) out[mb.id] = await pollOne(mb.id);
    } finally {
      polling = false;
    }
    return out;
  }

  // ─── 新询盘处理 ────────────────────────────────────────────────────────

  async function inquiryCorpus(q: FtInquiry): Promise<string> {
    const s = store.read();
    const parts: string[] = [];
    const { extractDocument } = await import('../services/documentExtractor');
    const { docCorpus } = await import('../services/documentExtraction');
    let attachmentsRead = 0;
    for (const m of inquiryMessages(s, q)) {
      parts.push(i18nT('【{p0} {p1} 主题：{p2}】', { p0: m.direction === 'in' ? i18nT('客户来信') : i18nT('我方回复'), p1: m.at.slice(0, 16), p2: m.subject }));
      parts.push(m.body);
      for (const a of m.attachments) {
        if (attachmentsRead >= 4) break;
        attachmentsRead++;
        try {
          const doc = await extractDocument(a.path, a.name);
          const text = docCorpus(doc).slice(0, 8000);
          if (text) parts.push(`【${a.name}】\n${text}`);
        } catch { /* 附件读不出不挡整体 */ }
      }
    }
    return parts.join('\n\n');
  }

  async function extractInquiry(id: string): Promise<FtInquiry> {
    const q = requireFound(store.read().inquiries.find((x) => x.id === id), i18nT('询盘'));
    const corpus = await inquiryCorpus(q);
    const productLines = [...new Set(store.read().products.map((p) => p.name).filter(Boolean))].slice(0, 30);
    const { json, model } = await llmJson('inquiry', P.inquiryExtractPrompt(corpus, productLines));
    const fields = (Array.isArray(json.fields) ? json.fields : [])
      .map((f: any) => ({
        key: String(f?.key || ''), label: String(f?.label || f?.key || ''), value: String(f?.value ?? '').trim(),
        quote: f?.quote ? String(f.quote) : undefined, source: f?.source ? String(f.source) : undefined,
        verified: quoteFoundIn(corpus, f?.quote),
      }))
      .filter((f: any) => f.value);
    const items = (Array.isArray(json.items) ? json.items : [])
      .map((it: any) => ({ product: String(it?.product || '').trim(), model: it?.model ? String(it.model) : undefined, spec: it?.spec ? String(it.spec) : undefined, quantity: it?.quantity != null ? String(it.quantity) : undefined, unit: it?.unit ? String(it.unit) : undefined }))
      .filter((it: any) => it.product || it.model);
    const c = json.category || {};
    const category = {
      productLine: String(c.product_line || i18nT('其他')),
      completeness: (['complete', 'partial', 'poor'].includes(c.completeness) ? c.completeness : 'partial') as 'complete' | 'partial' | 'poor',
      intent: (['high', 'medium', 'low'].includes(c.intent) ? c.intent : 'medium') as 'high' | 'medium' | 'low',
      spam: c.spam === true,
      reason: String(c.reason || ''),
      replyType: (['do_not_contact', 'not_now', 'has_supplier', 'info_request', 'sample_request', 'quote_request', 'meeting_request', 'order_intent', 'wrong_contact', 'other'].includes(c.reply_type) ? c.reply_type : undefined) as FtReplyType | undefined,
    };
    return store.update((st) => {
      const t = requireFound(st.inquiries.find((x) => x.id === id), i18nT('询盘'));
      if (json.customer_name) t.customerName = String(json.customer_name);
      if (json.company) t.company = String(json.company);
      if (json.country) t.country = String(json.country);
      t.fields = fields;
      t.items = items;
      t.category = category;
      t.questions = (Array.isArray(json.questions) ? json.questions : []).map(String).filter(Boolean).slice(0, 5);
      t.model = model;
      t.extractedAt = new Date().toISOString();
      t.error = undefined;
      if (category.spam) t.status = 'spam';
      else if (t.status === 'new') t.status = 'extracted';
      // 「勿联系」必须压制一切外联（AgentSDR）：模型判成勿联系也进抑制名单，人可以在设置里移除
      if (category.replyType === 'do_not_contact' && !findSuppression(st.suppressions, t.customerEmail)) {
        st.suppressions.unshift({ id: newId('sup'), email: t.customerEmail, reason: i18nT('来信被判为要求不再联系（{p0}）', { p0: model || i18nT('系统默认模型') }), source: 'unsubscribe', at: new Date().toISOString(), mailboxId: t.mailboxId, refId: t.id });
      }
      return t;
    });
  }

  async function draftInquiryReply(id: string, mode: 'ack' | 'full'): Promise<FtInquiry> {
    const q = requireFound(store.read().inquiries.find((x) => x.id === id), i18nT('询盘'));
    const corpus = await inquiryCorpus(q);
    const s = store.read();
    const productInfo = q.items.map((it) => {
      const hit = s.products.find((p) => (it.model && p.model.toLowerCase() === it.model.toLowerCase()) || p.name.toLowerCase() === it.product.toLowerCase());
      return hit ? `${hit.model} ${hit.name} ${hit.spec || ''}${hit.moq ? ` MOQ ${hit.moq}` : ''}${hit.leadTimeDays ? ` ${hit.leadTimeDays} days` : ''}` : '';
    }).filter(Boolean).join('\n');
    const { json, model } = await llmJson('inquiry', P.inquiryReplyPrompt(q, corpus, mode, s.settings.brand, productInfo));
    const subject = String(json.subject || `Re: ${q.subject}`);
    const body = String(json.body || '').trim();
    if (!body) throw new Error(i18nT('模型没有写出回复正文，请重试'));
    return store.update((st) => {
      const t = requireFound(st.inquiries.find((x) => x.id === id), i18nT('询盘'));
      t.replyDraft = { subject, body, model, at: new Date().toISOString() };
      return t;
    });
  }

  function lastInbound(s: FtStoredState, q: FtInquiry): FtMessage | undefined {
    return inquiryMessages(s, q).filter((m) => m.direction === 'in').sort((a, b) => b.at.localeCompare(a.at))[0];
  }

  async function sendInquiryReply(id: string, subject: string, body: string, to: string[] | undefined, approvedHash: string | undefined, kind: FtSendKind = 'inquiry_reply'): Promise<FtInquiry> {
    const s = store.read();
    const q = requireFound(s.inquiries.find((x) => x.id === id), i18nT('询盘'));
    const last = lastInbound(s, q);
    await gatedSend({ kind, mailboxId: q.mailboxId, to: to?.length ? to : [q.customerEmail], subject, body, refId: q.id }, { approvedHash, inReplyTo: last?.messageId });
    return store.update((st) => {
      const t = requireFound(st.inquiries.find((x) => x.id === id), i18nT('询盘'));
      t.status = 'replied';
      t.repliedAt = new Date().toISOString();
      return t;
    });
  }

  const INTENT_RANK = { high: 3, medium: 2, low: 1 } as const;

  /** 自动回复：邮箱开了开关才走；垃圾询盘、意向低于门槛的不回，原因记在询盘上 */
  async function maybeAutoReply(id: string): Promise<void> {
    const s = store.read();
    const q = s.inquiries.find((x) => x.id === id);
    if (!q || q.autoReply) return;
    const mb = s.mailboxes.find((m) => m.id === q.mailboxId);
    if (!mb?.autoReply || !mb.enabled) return;
    const rule = s.settings.autoReply;
    const skip = (reason: string) => store.update((st) => {
      const t = st.inquiries.find((x) => x.id === id);
      if (t) t.autoReply = { sent: false, at: new Date().toISOString(), reason };
    });
    if (!q.category) return skip(i18nT('还没有完成信息提取'));
    if (rule.skipSpam && q.category.spam) return skip(i18nT('判定为垃圾询盘，不自动回复'));
    if (INTENT_RANK[q.category.intent] < INTENT_RANK[rule.minIntent]) return skip(i18nT('意向低于自动回复门槛，留给业务员判断'));
    if ((s.messages.filter((m) => m.direction === 'out' && m.to.includes(q.customerEmail)).map((m) => m.at).sort().pop() || '') > q.receivedAt) {
      return skip(i18nT('业务员已经回复过'));
    }
    try {
      const withDraft = await draftInquiryReply(id, rule.mode);
      const d = withDraft.replyDraft!;
      const draft: FtOutgoingDraft = { kind: 'auto_reply', mailboxId: q.mailboxId, to: [q.customerEmail], subject: d.subject, body: d.body, refId: id };
      // 自动回复没有人点确认：以「草稿生成时按规则放行」为准，摘要在这里定，发送时内容必须一致
      const pre = gateCheck(draft);
      if (!pre.ok) {
        store.update((st) => {
          recordSend(st.sendLog, { mailboxId: q.mailboxId, kind: 'auto_reply', to: [q.customerEmail], subject: d.subject, hash: pre.hash, at: new Date().toISOString(), status: 'blocked', reason: pre.issues.filter((i) => i.level === 'block').map((i) => i.message).join(i18nT('；')), refId: id });
          const t = st.inquiries.find((x) => x.id === id);
          if (t) t.autoReply = { sent: false, at: new Date().toISOString(), reason: gateMessage(pre), blocked: pre.issues.filter((i) => i.level === 'block') };
        });
        return;
      }
      await sendInquiryReply(id, d.subject, d.body, undefined, hashOutgoing(draft), 'auto_reply');
      store.update((st) => {
        const t = st.inquiries.find((x) => x.id === id);
        if (t) t.autoReply = { sent: true, at: new Date().toISOString() };
      });
      logger?.info?.('foreign-trade', i18nT('已自动回复询盘'), { inquiry: id, mode: rule.mode });
    } catch (error) {
      const gate = (error as { gate?: FtGateResult })?.gate;
      store.update((st) => {
        const t = st.inquiries.find((x) => x.id === id);
        if (t) t.autoReply = { sent: false, at: new Date().toISOString(), reason: i18nT('自动回复失败：{p0}', { p0: (error as Error)?.message || String(error) }), blocked: gate?.issues.filter((i) => i.level === 'block') };
      });
    }
  }

  async function drainExtractQueue(): Promise<void> {
    if (extracting) return;
    extracting = true;
    try {
      while (extractQueue.length) {
        const id = extractQueue.shift()!;
        try {
          await extractInquiry(id);
          await maybeAutoReply(id);
        } catch (error) {
          store.update((st) => { const t = st.inquiries.find((x) => x.id === id); if (t) t.error = (error as Error)?.message || String(error); });
        }
        broadcast('inquiry', { updated: [id] });
      }
    } finally {
      extracting = false;
    }
  }

  // ─── 搜索与抓网页（背调 / 客户开发共用）──────────────────────────────────

  async function webSearch(queries: string[], perQuery = 8): Promise<Array<{ title: string; url: string; snippet?: string }>> {
    const { searchViaQiyeApi, searchViaBrowser } = await import('../services/bidWriter/noticeSearch');
    let raw = await searchViaQiyeApi(deps.qiyeApiProc, queries, perQuery);
    if (!raw.length) raw = await searchViaBrowser(queries);
    const seen = new Set<string>();
    const out: Array<{ title: string; url: string; snippet?: string }> = [];
    for (const r of raw) {
      const url = String(r?.url || '').trim();
      if (!/^https?:\/\//i.test(url) || seen.has(url)) continue;
      seen.add(url);
      out.push({ title: String(r?.title || url).trim(), url, snippet: r?.snippet ? String(r.snippet) : undefined });
    }
    return out;
  }

  async function fetchText(url: string): Promise<{ title: string; text: string; error?: string }> {
    const { fetchNoticePage } = await import('../services/bidWriter/noticeFetch');
    try {
      const page = await fetchNoticePage(url);
      return { title: page.title, text: page.text.slice(0, 20_000), error: page.loginRequired ? i18nT('需要登录才能查看') : undefined };
    } catch (error) {
      return { title: '', text: '', error: (error as Error)?.message || String(error) };
    }
  }

  const sideFile = (kind: string, id: string) => join(store.subdir(kind), `${id}.json`);
  const readSide = (kind: string, id: string): Record<string, string> => {
    try { return JSON.parse(readFileSync(sideFile(kind, id), 'utf-8')); } catch { return {}; }
  };
  const writeSide = (kind: string, id: string, data: Record<string, string>) => writeFileSync(sideFile(kind, id), JSON.stringify(data), 'utf-8');

  // ─── 报价 ──────────────────────────────────────────────────────────────

  async function currentFx(): Promise<FxInfo> {
    const rules = store.read().settings.quoteRules;
    if (rules.rateSource === 'live') {
      const { FxRateService } = await import('../services/fxRateService');
      const r = await new FxRateService().get(rules.baseCurrency);
      const perBase = r.ok ? r.quote?.rates?.[rules.quoteCurrency] : undefined;
      if (!r.ok || !perBase) throw new Error(r.message || i18nT('取不到 {p0}→{p1} 的实时汇率，请改用手填汇率', { p0: rules.baseCurrency, p1: rules.quoteCurrency }));
      if (r.quote!.stale) throw new Error(i18nT('实时汇率超过 24 小时没有更新，请改用手填汇率'));
      return { rate: round2(1 / perBase * 10000) / 10000, source: r.quote!.source, asOf: r.quote!.asOf };
    }
    if (!(rules.manualRate > 0)) throw new Error(i18nT('请在报价规则里填写汇率'));
    return { rate: rules.manualRate, source: i18nT('手填汇率'), asOf: todayIso() };
  }

  function quoteHtml(q: FtQuote, s: FtStoredState): string {
    const b = s.settings.brand;
    const rows = q.lines.map((l, i) => `<tr><td>${i + 1}</td><td>${htmlEscape(l.model)}</td><td>${htmlEscape(l.name)}</td><td class="n">${l.quantity}</td><td class="n">${fmtNum(l.unitPrice || 0)}</td><td class="n">${fmtNum(l.amount || 0)}</td></tr>`).join('');
    const draft = q.status === 'draft' ? `<div class="draft">DRAFT</div>` : '';
    return `<!doctype html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,"Microsoft YaHei",sans-serif;font-size:12px;color:#222;position:relative}
      h1{font-size:22px;margin:0 0 4px} .muted{color:#666}
      table{width:100%;border-collapse:collapse;margin-top:14px} th,td{border:1px solid #bbb;padding:6px 8px;text-align:left} th{background:#eef2f8}
      td.n{text-align:right} .tot td{font-weight:bold} .draft{position:fixed;top:40%;left:20%;font-size:90px;color:rgba(200,0,0,.12);transform:rotate(-25deg)}
    </style></head><body>${draft}
      <h1>QUOTATION</h1>
      <div class="muted">${htmlEscape(b.company || '')}</div>
      <p>To: ${htmlEscape(q.customerName || q.customerEmail || '')}<br>Date: ${localDate(q.createdAt)}<br>Terms: ${q.incoterm}${q.destination ? ` ${htmlEscape(q.destination)}` : ''}<br>Currency: ${q.currency}<br>Valid for ${s.settings.quoteRules.validityDays} days</p>
      <table><thead><tr><th>#</th><th>Model</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
      <tbody>${rows}<tr class="tot"><td colspan="5">Total (${q.currency})</td><td class="n">${fmtNum(q.total)}</td></tr></tbody></table>
    </body></html>`;
  }

  async function exportQuote(id: string): Promise<FtQuote> {
    const s = store.read();
    const q = requireFound(s.quotes.find((x) => x.id === id), i18nT('报价单'));
    const dir = outputDir(i18nT('报价单'));
    const base = `${i18nT('报价单')}_${(q.customerName || q.customerEmail || 'customer').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40)}_${localDate(q.createdAt)}_${q.id.slice(-4)}`;
    const wb = XLSX.utils.book_new();
    const lineRows: any[][] = [['#', 'Model', 'Description', 'Qty', `Unit Price (${q.currency})`, `Amount (${q.currency})`]];
    q.lines.forEach((l, i) => lineRows.push([i + 1, l.model, l.name, l.quantity, l.unitPrice || 0, l.amount || 0]));
    lineRows.push(['', '', '', '', 'Total', q.total]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(lineRows), 'Quotation');
    const calcRows: any[][] = [[i18nT('项目'), i18nT('计算过程'), i18nT('金额'), i18nT('币种')]];
    for (const c of q.calc) calcRows.push([c.label, c.formula, c.value, c.currency]);
    for (const w of q.warnings) calcRows.push([i18nT('提示'), w, '', '']);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(calcRows), i18nT('成本明细（内部）'));
    const xlsxPath = join(dir, `${base}.xlsx`);
    XLSX.writeFile(wb, xlsxPath);
    const { writePdfFromHtml } = await import('../services/bidWriter/docx');
    const pdfPath = join(dir, `${base}.pdf`);
    await writePdfFromHtml(pdfPath, quoteHtml(q, s));
    return store.update((st) => {
      const t = requireFound(st.quotes.find((x) => x.id === id), i18nT('报价单'));
      t.filePath = pdfPath;
      return t;
    });
  }

  // ─── 数据整理：定时日报 ───────────────────────────────────────────────

  async function buildReport(from: string, to: string): Promise<FtReport> {
    const stats = buildReportStats(store.read(), from, to);
    const report: FtReport = { id: newId('rpt'), createdAt: new Date().toISOString(), stats };
    store.update((st) => { st.reports.unshift(report); st.reports.splice(60); });
    return report;
  }

  function exportReport(id: string): FtReport {
    const r = requireFound(store.read().reports.find((x) => x.id === id), i18nT('报表'));
    const rows: any[][] = [[i18nT('指标'), i18nT('数值')], ...reportRows(r.stats)];
    if (r.commentary) rows.push([], [i18nT('点评'), r.commentary]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), i18nT('业务报表'));
    const path = join(outputDir(i18nT('报表')), `${i18nT('业务报表')}_${r.stats.from}_${r.stats.to}_${r.id.slice(-4)}.xlsx`);
    XLSX.writeFile(wb, path);
    return store.update((st) => { const t = st.reports.find((x) => x.id === id)!; t.filePath = path; return t; });
  }

  async function sendReport(id: string, mailboxId: string, to: string[]): Promise<FtReport> {
    const r = exportReport(id);
    const text = reportRows(r.stats).map(([k, v]) => `${k}：${v}`).join('\n') + (r.commentary ? `\n\n${r.commentary}` : '');
    await sendVia(mailboxId, {
      to, subject: i18nT('外贸业务报表 {p0} ~ {p1}', { p0: r.stats.from, p1: r.stats.to }), body: text,
      attachments: r.filePath ? [{ filename: basename(r.filePath), path: r.filePath }] : [],
    });
    return store.update((st) => { const t = st.reports.find((x) => x.id === id)!; t.sentAt = new Date().toISOString(); return t; });
  }

  async function tick(): Promise<void> {
    const s = store.read();
    const sched = s.settings.reportSchedule;
    const now = new Date();
    const today = todayIso(now);
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (sched.enabled && sched.mailboxId && sched.recipients.length && sched.lastSentDate !== today && hhmm >= sched.time) {
      store.update((st) => { st.settings.reportSchedule.lastSentDate = today; });
      try {
        const r = await buildReport(today, today);
        await sendReport(r.id, sched.mailboxId, sched.recipients);
        logger?.info?.('foreign-trade', i18nT('日报已按时发送'), { to: sched.recipients.join(',') });
      } catch (error) {
        logger?.warn?.('foreign-trade', i18nT('日报发送失败'), { error: (error as Error)?.message });
      }
      pushState();
    }
  }

  // ─── 背调的确定性检查：域名注册时间（RDAP）、收信服务器（MX）──────────────

  /** true / false = 查过；undefined = 查不了（网络、超时） */
  async function hasMx(domain: string): Promise<boolean | undefined> {
    if (!domain) return undefined;
    try {
      const r = await Promise.race([dns.resolveMx(domain), new Promise<never>((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), 5000))]);
      return r.length > 0;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      return code === 'ENOTFOUND' || code === 'ENODATA' ? false : undefined;
    }
  }

  /** ISO = 注册时间；null = 查过但没给；undefined = 没查成 */
  async function domainCreated(domain: string): Promise<string | null | undefined> {
    if (!domain) return undefined;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const res = await net.fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { signal: ctrl.signal, headers: { Accept: 'application/rdap+json' } });
      if (res.status === 404) return null;
      if (!res.ok) return undefined;
      const data: any = await res.json();
      const ev = (data?.events || []).find((e: any) => /registration/i.test(String(e?.eventAction || '')));
      return ev?.eventDate ? String(ev.eventDate) : null;
    } catch {
      return undefined;
    } finally {
      clearTimeout(timer);
    }
  }

  // ─── 交易对手名单筛查 ─────────────────────────────────────────────────

  const screeningLists = new ScreeningLists(() => store.subdir('screening'));
  const fetchViaNet = (url: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => net.fetch(url, init);

  function runScreening(name: string, country: string | undefined, context: string): FtScreeningResult {
    const result = screeningLists.screen(name, { country, context, id: newId('scr') });
    store.update((st) => { st.screenings.unshift(result); st.screenings.splice(500); });
    return result;
  }

  /** 这位交易对手最近一次筛查（按归一后的名称）；建订单、生成 PI 前提示用 */
  function latestScreening(name: string): { result: FtScreeningResult | null; ageDays: number | null; stale: boolean; listsReady: boolean } {
    const key = normalizeName(name);
    const result = key ? store.read().screenings.find((x) => normalizeName(x.query) === key) || null : null;
    const ageDays = result ? Math.floor((Date.now() - Date.parse(result.at)) / 86_400_000) : null;
    const listsReady = screeningLists.status().some((x) => x.fetchedAt);
    return { result, ageDays, stale: ageDays == null || ageDays > SCREENING_STALE_DAYS, listsReady };
  }

  // ─── HS 编码 ─────────────────────────────────────────────────────────

  let hsTable: HsTable | null = null;
  function hs(): HsTable {
    if (!hsTable) {
      const p = shellResource('foreign-trade', 'hs2022.csv');
      if (!existsSync(p)) throw new Error(i18nT('缺少 HS 编码表（foreign-trade/hs2022.csv），请重新安装应用'));
      hsTable = buildHsTable(parseHsCsv(readFileSync(p, 'utf-8')));
    }
    return hsTable;
  }

  // ─── PI / CI / 装箱单 ─────────────────────────────────────────────────

  /** 按订单、报价单、产品目录、设置里的抬头与银行给出单据的初始填写（只在第一次准备时用） */
  function defaultTradeInput(s: FtStoredState, o: FtOrder): FtTradeDocInput {
    const q = o.quoteId ? s.quotes.find((x) => x.id === o.quoteId) : undefined;
    const td = s.settings.tradeDocs;
    const today = todayIso();
    const lines = (q?.lines || []).map((l, i) => {
      const p = l.productId ? s.products.find((x) => x.id === l.productId) : undefined;
      return {
        no: i + 1, productId: p?.id, model: l.model, description: l.name, quantity: l.quantity, unit: 'PCS', unitPrice: l.unitPrice,
        hsCode: p?.hsConfirmed?.code || undefined, hsConfirmed: !!p?.hsConfirmed, unitNetKg: p?.unitNetKg, pcsPerCarton: p?.pcsPerCarton, cartonCbm: p?.cartonCbm,
      };
    });
    const brandName = s.settings.brand.company;
    return {
      seller: { ...td.seller, name: td.seller.name || brandName },
      buyer: { name: o.customerName || '', address: '' },
      bank: { ...td.bank },
      piNo: `PI-${o.orderNo}`,
      ciNo: `CI-${o.orderNo}`,
      date: today,
      currency: o.currency || q?.currency || s.settings.quoteRules.quoteCurrency,
      priceUnit: td.priceUnit || `${o.currency || q?.currency || 'USD'}/PCS`,
      incoterm: q?.incoterm || s.settings.quoteRules.defaultIncoterm,
      portOfLoading: td.portOfLoading,
      portOfDestination: q?.destination || '',
      payment: td.payment,
      packing: { kgPerCarton: 25, cartonsPerPallet: 0, palletWeightKg: 0, cartonTareKg: 0, cbmPerPallet: 0.528 },
      lines,
    };
  }

  /** HS 编码以产品目录里的确认记录为准：单据里改了编码但目录里没确认，一律视为未确认；行里还没有编码时补上目录里确认过的 */
  function syncHs(s: FtStoredState, input: FtTradeDocInput): FtTradeDocInput {
    return {
      ...input,
      lines: input.lines.map((l, i) => {
        const p = l.productId ? s.products.find((x) => x.id === l.productId) : undefined;
        const code = String(l.hsCode || p?.hsConfirmed?.code || '').replace(/[\s.]/g, '');
        return { ...l, no: i + 1, hsCode: code || undefined, hsConfirmed: !!code && p?.hsConfirmed?.code === code };
      }),
    };
  }

  function sheetOf(aoa: DocCell[][]): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    let maxC = 0;
    aoa.forEach((row, r) => row.forEach((c, ci) => {
      const addr = XLSX.utils.encode_cell({ r, c: ci });
      if (c.f) ws[addr] = { t: 'n', v: Number(c.v) || 0, f: c.f };
      else if (typeof c.v === 'number') ws[addr] = { t: 'n', v: c.v };
      else if (c.v !== '' && c.v != null) ws[addr] = { t: 's', v: String(c.v) };
      maxC = Math.max(maxC, ci);
    }));
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(aoa.length - 1, 0), c: maxC } });
    ws['!cols'] = Array.from({ length: maxC + 1 }, (_, i) => ({ wch: i === 2 ? 36 : 14 }));
    return ws;
  }

  function docHtml(doc: TradeDocModel): string {
    const cell = (c: DocCell) => (typeof c.v === 'number' ? fmtNum(c.v) : htmlEscape(String(c.v ?? '')));
    const isNum = (c: DocCell) => typeof c.v === 'number';
    return `<!doctype html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,"Microsoft YaHei",sans-serif;font-size:11px;color:#222}
      h1{font-size:20px;margin:0 0 2px;text-align:center} .no{text-align:center;color:#555;margin-bottom:10px}
      table{width:100%;border-collapse:collapse} .head td{border:none;padding:2px 6px;vertical-align:top} .head td:first-child{width:130px;color:#555}
      .items{margin-top:12px} .items th,.items td{border:1px solid #bbb;padding:4px 6px;text-align:left} .items th{background:#eef2f8}
      .items td.n{text-align:right} .items tr.tot td{font-weight:bold} .foot{margin-top:12px;white-space:pre-wrap;line-height:1.6}
    </style></head><body>
      <h1>${htmlEscape(doc.title)}</h1><div class="no">No. ${htmlEscape(doc.number)}</div>
      <table class="head">${doc.head.map(([k, v]) => `<tr><td>${htmlEscape(k)}</td><td>${htmlEscape(v)}</td></tr>`).join('')}</table>
      <table class="items"><thead><tr>${doc.columns.map((c) => `<th>${htmlEscape(c)}</th>`).join('')}</tr></thead>
      <tbody>${doc.rows.map((r) => `<tr>${r.map((c) => `<td class="${isNum(c) ? 'n' : ''}">${cell(c)}</td>`).join('')}</tr>`).join('')}
      <tr class="tot">${doc.total.map((c) => `<td class="${isNum(c) ? 'n' : ''}">${cell(c)}</td>`).join('')}</tr></tbody></table>
      <div class="foot">${doc.footer.map(htmlEscape).join('<br>')}</div>
    </body></html>`;
  }

  /** 上传的 Excel 单据：按表头读明细、合计、大写金额（公式没缓存值的单元格单独记下，不当 0） */
  function readSheetTable(path: string) {
    const wb = XLSX.readFile(path, { cellFormula: true, cellDates: false });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws?.['!ref']) return null;
    const range = XLSX.utils.decode_range(ws['!ref']);
    const grid: SheetCell[][] = [];
    for (let r = range.s.r; r <= Math.min(range.e.r, 500); r++) {
      const row: SheetCell[] = [];
      for (let c = range.s.c; c <= Math.min(range.e.c, 40); c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell: any = ws[addr];
        row.push({ addr, v: cell?.v ?? null, f: cell?.f });
      }
      grid.push(row);
    }
    return parseTradeSheet(grid);
  }

  async function generateTradeDocs(orderId: string): Promise<FtOrder> {
    const s = store.read();
    const o = requireFound(s.orders.find((x) => x.id === orderId), i18nT('订单'));
    if (!o.tradeDocs?.input) throw new Error(i18nT('先填好单据信息'));
    const input = syncHs(s, o.tradeDocs.input);
    const pre = validateTradeDocInput(input);
    const errors = pre.filter((f) => f.level === 'error');
    if (errors.length) {
      store.update((st) => { const t = st.orders.find((x) => x.id === orderId); if (t?.tradeDocs) { t.tradeDocs.input = input; t.tradeDocs.validation = pre; } });
      throw new Error(i18nT('单据还不能生成：{p0}', { p0: errors.map((e) => e.message).join(i18nT('；')) }));
    }
    const dir = outputDir(join(i18nT('单据'), o.orderNo.replace(/[\\/:*?"<>|\s]+/g, '_')));
    const { writePdfFromHtml } = await import('../services/bidWriter/docx');
    const docs: TradeDocModel[] = [buildProforma(input), buildCommercialInvoice(input), buildPackingList(input)];
    const files: { kind: 'PI' | 'CI' | 'PL'; xlsx: string; pdf: string }[] = [];
    const orderDocs: FtOrderDoc[] = [];
    for (const doc of docs) {
      const safeNo = doc.number.replace(/[\\/:*?"<>|\s]+/g, '_');
      const base = safeNo.toUpperCase().startsWith(doc.kind) ? safeNo : `${doc.kind}_${safeNo}`;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheetOf(layoutSheet(doc)), doc.kind);
      const xlsx = join(dir, `${base}.xlsx`);
      XLSX.writeFile(wb, xlsx);
      const pdf = join(dir, `${base}.pdf`);
      await writePdfFromHtml(pdf, docHtml(doc));
      files.push({ kind: doc.kind, xlsx, pdf });
      orderDocs.push({ id: newId('doc'), kind: doc.kind, name: basename(xlsx), path: xlsx, fields: docFields(doc, input), table: doc.table, extractedAt: new Date().toISOString() });
    }
    return store.update((st) => {
      const t = requireFound(st.orders.find((x) => x.id === orderId), i18nT('订单'));
      // 重新生成时换掉上次生成的那三份，上传的单据保留
      t.docs = [...t.docs.filter((d) => !d.table?.generated), ...orderDocs];
      const findings = [...pre, ...validateTradeDocs(t.docs)];
      t.tradeDocs = { input, validation: findings, generated: { at: new Date().toISOString(), files, totals: tradeTotals(input) } };
      t.check = undefined;
      return t;
    });
  }

  // ─── 动作表 ────────────────────────────────────────────────────────────

  const actions: Record<string, (p: any) => Promise<unknown> | unknown> = {
    'state.get': () => publicState(),
    'models.list': () => modelOptions(),

    'settings.patch': (p: { patch: Partial<FtSettings> }) => store.update((st) => {
      const patch = p?.patch || {};
      for (const [k, v] of Object.entries(patch)) {
        const cur = (st.settings as any)[k];
        (st.settings as any)[k] = cur && typeof cur === 'object' && !Array.isArray(cur) && v && typeof v === 'object' && !Array.isArray(v) ? { ...cur, ...v } : v;
      }
      const r = st.settings.sendRules;
      const clamp = (v: unknown, lo: number, hi: number, d: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
      r.dailyLimit = Math.round(clamp(r.dailyLimit, 1, 2000, 40));
      r.maxBodyWords = Math.round(clamp(r.maxBodyWords, 40, 2000, 220));
      r.maxSubjectLen = Math.round(clamp(r.maxSubjectLen, 20, 300, 90));
      r.maxLinks = Math.round(clamp(r.maxLinks, 0, 10, 1));
      r.maxBounceRate = clamp(r.maxBounceRate, 0.01, 0.5, 0.05);
      r.extraBanned = (Array.isArray(r.extraBanned) ? r.extraBanned : String(r.extraBanned || '').split(/[,，;；\n]+/)).map((x) => String(x).trim()).filter(Boolean).slice(0, 200);
      r.requireOptOut = r.requireOptOut !== false;
      return st.settings;
    }),
    'outputDir.pick': async () => {
      const r = await dialog.showOpenDialog(win()!, { properties: ['openDirectory', 'createDirectory'] });
      if (r.canceled || !r.filePaths[0]) return null;
      store.update((st) => { st.settings.outputDir = r.filePaths[0]; });
      return r.filePaths[0];
    },
    'files.pick': async (p: { filters?: { name: string; extensions: string[] }[]; multi?: boolean }) => {
      const r = await dialog.showOpenDialog(win()!, { properties: p?.multi ? ['openFile', 'multiSelections'] : ['openFile'], filters: p?.filters });
      return r.canceled ? [] : r.filePaths;
    },
    'path.open': async (p: { path: string }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      const err = await shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },

    // 邮箱
    'mailbox.presets': () => mailboxPresets(),
    'mailbox.save': (p: { input: FtMailboxInput }) => {
      const input = p?.input;
      if (!input?.address || !EMAIL_RE.test(input.address.trim())) throw new Error(i18nT('请填写正确的邮箱地址'));
      const address = input.address.trim().toLowerCase();
      const saved = store.update((st) => {
        if (st.mailboxes.some((m) => m.address === address && m.id !== input.id)) throw new Error(i18nT('这个邮箱已经接管过了'));
        let t = input.id ? st.mailboxes.find((m) => m.id === input.id) : undefined;
        if (!t) {
          t = { id: newId('mb'), address, label: '', purposes: [], provider: 'custom', imapHost: '', imapPort: 993, smtpHost: '', smtpPort: 465, enabled: true, autoReply: false, hasPassword: false, status: 'unknown', totalFetched: 0, createdAt: new Date().toISOString() };
          st.mailboxes.push(t);
        }
        const serverChanged = t.address !== address || t.imapHost !== input.imapHost.trim();
        Object.assign(t, {
          address,
          label: (input.label || '').trim() || address,
          senderName: input.senderName?.trim() || undefined,
          owner: input.owner?.trim() || undefined,
          purposes: input.purposes?.length ? input.purposes : ['inquiry'],
          provider: input.provider || 'custom',
          imapHost: input.imapHost.trim(),
          imapPort: Number(input.imapPort) || 993,
          smtpHost: input.smtpHost.trim(),
          smtpPort: Number(input.smtpPort) || 465,
          enabled: input.enabled !== false,
          autoReply: !!input.autoReply,
          status: input.enabled === false ? 'disabled' : t.status === 'disabled' ? 'unknown' : t.status,
        });
        if (serverChanged) t.sync = undefined;
        if (input.password) t.hasPassword = true;
        return t;
      });
      if (input.password) store.setPassword(saved.id, input.password);
      pushState();
      return saved;
    },
    'mailbox.remove': (p: { id: string }) => {
      store.update((st) => { st.mailboxes = st.mailboxes.filter((m) => m.id !== p.id); });
      store.removePassword(p.id);
      pushState();
      return true;
    },
    'mailbox.test': async (p: { id?: string; input?: FtMailboxInput }) => {
      const s = store.read();
      const existing = p?.id ? s.mailboxes.find((m) => m.id === p.id) : undefined;
      const mb: FtMailbox = existing || { ...(p.input as any), id: 'test', address: String(p.input?.address || '').trim(), hasPassword: true, status: 'unknown', totalFetched: 0, createdAt: '' };
      if (p?.input && existing) Object.assign(mb, { ...p.input, address: String(p.input.address).trim() });
      const password = p?.input?.password || (existing ? store.getPassword(existing.id) : '');
      return testMailbox(mb, password);
    },
    'mailbox.poll': async (p: { id?: string }) => {
      const r = p?.id ? { [p.id]: await pollOne(p.id) } : await pollAll();
      pushState();
      return r;
    },

    // 新询盘处理
    'inquiry.extract': async (p: { id: string }) => { const r = await extractInquiry(p.id); pushState(); return r; },
    'inquiry.draft': async (p: { id: string; mode?: 'ack' | 'full' }) => { const r = await draftInquiryReply(p.id, p.mode || 'full'); pushState(); return r; },
    'inquiry.send': async (p: { id: string; subject: string; body: string; to?: string[]; approvedHash?: string }) => { const r = await sendInquiryReply(p.id, p.subject, p.body, p.to, p.approvedHash); pushState(); return r; },
    'inquiry.update': (p: { id: string; patch: Partial<Pick<FtInquiry, 'status'>> }) => {
      const r = store.update((st) => { const t = requireFound(st.inquiries.find((x) => x.id === p.id), i18nT('询盘')); if (p.patch?.status) t.status = p.patch.status; return t; });
      pushState();
      return r;
    },
    'inquiry.processNew': () => {
      const ids = store.read().inquiries.filter((q) => q.status === 'new' && !q.extractedAt).map((q) => q.id);
      extractQueue.push(...ids.filter((id) => !extractQueue.includes(id)));
      void drainExtractQueue().then(pushState);
      return ids.length;
    },

    // 客户背调
    'background.search': async (p: { company: string; website?: string; email?: string; country?: string; inquiryId?: string }) => {
      const company = String(p?.company || '').trim();
      if (!company && !p?.website && !p?.email) throw new Error(i18nT('请至少填写公司名、官网或邮箱中的一项'));
      const domain = hostOf(p.website || '') || emailDomain(p.email);
      const queries = [
        company ? `"${company}"${p.country ? ` ${p.country}` : ''}` : '',
        company ? `${company} company profile products` : '',
        domain ? `site:${domain}` : '',
        domain && company ? `${company} ${domain}` : '',
      ].filter(Boolean);
      progress('background', i18nT('正在检索公开信息…'));
      const hits = await webSearch(queries, 6);
      const sources: FtSource[] = [];
      const website = p.website ? p.website : domain ? `https://${domain}` : '';
      if (website) sources.push({ title: i18nT('官网'), url: website });
      for (const h of hits) {
        if (sources.length >= 8) break;
        if (sources.some((s) => s.url === h.url)) continue;
        sources.push({ title: h.title, url: h.url, snippet: h.snippet });
      }
      if (!sources.length) throw new Error(i18nT('没有检索到公开信息。可以换一个写法（英文全称 / 官网域名）再试'));
      const bg: FtBackground = {
        id: newId('bg'), company: company || domain, website: website || undefined, email: p.email, country: p.country,
        inquiryId: p.inquiryId, createdAt: new Date().toISOString(), stage: 'searched', sources, facts: [], risks: [],
      };
      store.update((st) => { st.backgrounds.unshift(bg); st.backgrounds.splice(200); });
      pushState();
      return bg;
    },
    'background.fetch': async (p: { id: string }) => {
      const bg = requireFound(store.read().backgrounds.find((b) => b.id === p.id), i18nT('背调记录'));
      const texts: Record<string, string> = {};
      const sources = bg.sources.map((s) => ({ ...s }));
      for (let i = 0; i < Math.min(sources.length, 6); i++) {
        progress('background', i18nT('正在读取第 {p0}/{p1} 个网页…', { p0: i + 1, p1: Math.min(sources.length, 6) }));
        const r = await fetchText(sources[i].url);
        sources[i].textLength = r.text.length;
        sources[i].fetchError = r.error;
        if (r.title && sources[i].title === i18nT('官网')) sources[i].title = `${i18nT('官网')} · ${r.title}`;
        if (r.text) texts[sources[i].url] = r.text;
      }
      if (!Object.keys(texts).length) throw new Error(i18nT('网页都没有读到内容（可能需要登录或被网站拦截）'));
      writeSide('backgrounds', bg.id, texts);
      const r = store.update((st) => { const t = st.backgrounds.find((b) => b.id === p.id)!; t.sources = sources; t.stage = 'fetched'; return t; });
      pushState();
      return r;
    },
    'background.compose': async (p: { id: string }) => {
      const bg = requireFound(store.read().backgrounds.find((b) => b.id === p.id), i18nT('背调记录'));
      const texts = readSide('backgrounds', bg.id);
      const used = bg.sources.map((s, i) => ({ i, title: s.title, url: s.url, text: texts[s.url] || s.snippet || '' })).filter((x) => x.text);
      if (!used.length) throw new Error(i18nT('还没有读取网页，请先完成上一步'));
      const { json, model } = await llmJson('background', P.backgroundPrompt(bg, used.map((u) => ({ title: u.title, url: u.url, text: u.text }))));
      const mapFact = (f: any) => {
        const n = Number(f?.source);
        const src = Number.isFinite(n) && n >= 1 && n <= used.length ? used[n - 1].i : undefined;
        return { label: String(f?.label || ''), value: String(f?.value || ''), source: src };
      };
      const r = store.update((st) => {
        const t = st.backgrounds.find((b) => b.id === p.id)!;
        t.summary = String(json.summary || '');
        t.facts = (Array.isArray(json.facts) ? json.facts : []).map(mapFact).filter((f: any) => f.value);
        t.risks = (Array.isArray(json.risks) ? json.risks : []).map(mapFact).filter((f: any) => f.value || f.label);
        t.suggestion = String(json.suggestion || '');
        t.model = model;
        t.stage = 'done';
        return t;
      });
      pushState();
      return r;
    },
    'background.remove': (p: { id: string }) => { store.update((st) => { st.backgrounds = st.backgrounds.filter((b) => b.id !== p.id); }); pushState(); return true; },

    // 客户开发
    'prospect.search': async (p: { criteria: FtProspectCriteria }) => {
      const c = p?.criteria;
      if (!c?.keywords?.trim()) throw new Error(i18nT('请填写产品关键词'));
      const count = Math.min(Math.max(Number(c.count) || 15, 5), 40);
      const kw = c.keywords.trim();
      const where = (c.country || '').trim();
      const types = (c.customerType || 'importer distributor wholesaler').split(/[,，、\s]+/).filter(Boolean).slice(0, 3);
      const queries = types.map((t) => `${kw} ${t} ${where}`.trim());
      if (c.industry) queries.push(`${c.industry} ${kw} buyer ${where}`.trim());
      progress('prospect', i18nT('正在检索潜在客户…'));
      const hits = await webSearch(queries, 10);
      const exclude = (c.exclude || '').split(/[,，、\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
      const known = new Set(store.read().leads.map((l) => hostOf(l.website || '')));
      const batchId = newId('pb');
      const leads: FtLead[] = [];
      const hosts = new Set<string>();
      for (const h of hits) {
        const host = hostOf(h.url);
        if (!host || SKIP_HOSTS.test(host) || hosts.has(host) || known.has(host)) continue;
        if (exclude.some((x) => `${h.title} ${h.snippet || ''} ${host}`.toLowerCase().includes(x))) continue;
        hosts.add(host);
        leads.push({ id: newId('ld'), batchId, company: h.title.split(/[|\-–—]/)[0].trim() || host, website: originOf(h.url), emails: [], snippet: h.snippet, status: 'found' });
        if (leads.length >= count) break;
      }
      if (!leads.length) throw new Error(i18nT('没有检索到新的潜在客户，可以换关键词或国家再试'));
      store.update((st) => {
        st.prospectBatches.unshift({ id: batchId, criteria: { ...c, count }, createdAt: new Date().toISOString(), leadIds: leads.map((l) => l.id) });
        st.leads.push(...leads);
      });
      pushState();
      return { batchId, count: leads.length };
    },
    'prospect.enrich': async (p: { batchId: string }) => {
      const s = store.read();
      const batch = requireFound(s.prospectBatches.find((b) => b.id === p.batchId), i18nT('检索批次'));
      const leads = s.leads.filter((l) => batch.leadIds.includes(l.id) && l.status !== 'excluded');
      const texts = readSide('prospects', batch.id);
      const EMAIL_IN_TEXT = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
      let done = 0;
      for (const l of leads) {
        done++;
        progress('prospect', i18nT('正在读取潜客网站 {p0}/{p1}：{p2}', { p0: done, p1: leads.length, p2: l.company }));
        if (!l.website || texts[l.id]) continue;
        const home = await fetchText(l.website);
        let text = home.text;
        let emails = [...new Set((text.match(EMAIL_IN_TEXT) || []).map((e) => e.toLowerCase()))];
        if (!emails.length) {
          const contact = await fetchText(`${l.website.replace(/\/$/, '')}/contact`);
          text = `${text}\n${contact.text}`.slice(0, 20_000);
          emails = [...new Set((contact.text.match(EMAIL_IN_TEXT) || []).map((e) => e.toLowerCase()))];
        }
        texts[l.id] = text;
        const clean = emails.filter((e) => !/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(e) && !/example\.|sentry|wixpress|domain\.com/i.test(e)).slice(0, 5);
        // 独立证据：检索结果摘要 / 首页正文 / 联系页（打分复算里的「交叉验证」项）
        const evidence = (l.snippet ? 1 : 0) + (home.text ? 1 : 0) + (text.length > home.text.length + 50 ? 1 : 0);
        const domains = [...new Set(clean.map(emailDomainOf))];
        const mx: Record<string, boolean | undefined> = {};
        for (const d of domains) mx[d] = await hasMx(d);
        const domainMx = domains.length ? (domains.some((d) => mx[d]) ? true : domains.every((d) => mx[d] === false) ? false : undefined) : undefined;
        store.update((st) => { const t = st.leads.find((x) => x.id === l.id); if (t) { t.emails = clean; t.evidence = evidence; t.mx = domainMx; } });
      }
      writeSide('prospects', batch.id, texts);
      pushState();
      return { read: Object.keys(texts).length };
    },
    'prospect.score': async (p: { batchId: string }) => {
      const s = store.read();
      const batch = requireFound(s.prospectBatches.find((b) => b.id === p.batchId), i18nT('检索批次'));
      const leads = s.leads.filter((l) => batch.leadIds.includes(l.id) && l.status !== 'excluded');
      const texts = readSide('prospects', batch.id);
      const input = leads.map((l, index) => ({ index, company: l.company, url: l.website, text: texts[l.id] || l.snippet || '' }));
      const { json, model } = await llmJson('prospect', P.prospectScorePrompt(batch.criteria, input), 240_000);
      store.update((st) => {
        for (const r of Array.isArray(json.leads) ? json.leads : []) {
          const lead = leads[Number(r?.index)];
          const t = lead && st.leads.find((x) => x.id === lead.id);
          if (!t) continue;
          // 模型初判
          t.modelScore = Math.max(0, Math.min(100, Number(r.score) || 0));
          t.modelTier = ['A', 'B', 'C'].includes(r.tier) ? r.tier : t.modelScore >= 70 ? 'A' : t.modelScore >= 40 ? 'B' : 'C';
          t.reason = String(r.reason || '');
          if (r.company) t.company = String(r.company);
          if (r.country) t.country = String(r.country);
          // 代码复算：分数和档位以这里为准（tianji market-intel 的公式）
          const host = t.website ? hostOf(t.website) : undefined;
          const mx = Object.fromEntries(t.emails.map((e) => [emailDomainOf(e), t.mx]));
          const re = recomputeLeadScore({
            emails: t.emails, websiteHost: host, mx, evidence: t.evidence ?? (texts[t.id] ? 2 : t.snippet ? 1 : 0), scale: Number(r.scale) || 0,
            flags: (Array.isArray(r.red_flags) ? r.red_flags : []).map(String).filter(Boolean).slice(0, 5),
            critical: (Array.isArray(r.critical_flags) ? r.critical_flags : []).map(String).filter(Boolean).slice(0, 5),
          });
          t.score = re.score;
          t.tier = re.tier;
          t.emailLevel = re.level;
          t.scoreDetail = re.detail;
          if (t.status === 'found') t.status = 'scored';
        }
      });
      pushState();
      return { model };
    },
    'prospect.draft': async (p: { leadIds: string[] }) => {
      const s = store.read();
      const out: string[] = [];
      for (const id of p?.leadIds || []) {
        const l = s.leads.find((x) => x.id === id);
        if (!l) continue;
        const batch = s.prospectBatches.find((b) => b.id === l.batchId);
        const text = readSide('prospects', l.batchId)[l.id] || l.snippet || '';
        progress('prospect', i18nT('正在写开发信：{p0}', { p0: l.company }));
        const { json, model } = await llmJson('prospect', P.prospectLetterPrompt(l, batch!.criteria, s.settings.brand, text));
        store.update((st) => {
          const t = st.leads.find((x) => x.id === id)!;
          t.letter = { subject: String(json.subject || ''), body: String(json.body || ''), model, at: new Date().toISOString() };
          if (t.status !== 'sent') t.status = 'drafted';
        });
        out.push(id);
      }
      pushState();
      return out;
    },
    'prospect.send': async (p: { leadId: string; mailboxId: string; to: string[]; subject: string; body: string; approvedHash?: string }) => {
      await gatedSend({ kind: 'outreach', mailboxId: p.mailboxId, to: p.to, subject: p.subject, body: p.body, refId: p.leadId }, { approvedHash: p.approvedHash });
      const r = store.update((st) => {
        const t = requireFound(st.leads.find((x) => x.id === p.leadId), i18nT('潜客'));
        t.status = 'sent';
        t.sentAt = new Date().toISOString();
        t.mailboxId = p.mailboxId;
        t.letter = t.letter ? { ...t.letter, subject: p.subject, body: p.body } : undefined;
        return t;
      });
      pushState();
      return r;
    },
    'prospect.removeBatch': (p: { batchId: string }) => {
      store.update((st) => {
        st.prospectBatches = st.prospectBatches.filter((b) => b.id !== p.batchId);
        st.leads = st.leads.filter((l) => l.batchId !== p.batchId);
      });
      pushState();
      return true;
    },
    'prospect.update': (p: { leadId: string; patch: Partial<Pick<FtLead, 'status' | 'emails' | 'company'>> }) => {
      const r = store.update((st) => { const t = requireFound(st.leads.find((x) => x.id === p.leadId), i18nT('潜客')); Object.assign(t, p.patch || {}); return t; });
      pushState();
      return r;
    },

    // 客户跟进
    'followup.scan': () => scanFollowups(store.read(), store.read().settings.followupRules),
    'followup.timeline': (p: { email: string }) => customerTimeline(store.read(), p.email),
    'followup.draft': async (p: { item: FtFollowupItem }) => {
      const s = store.read();
      const e = p.item.customerEmail.toLowerCase();
      const msgs = s.messages.filter((m) => m.from === e || m.to.includes(e)).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
      const history = msgs.map((m) => `[${m.at.slice(0, 16)}] ${m.direction === 'in' ? i18nT('客户') : i18nT('我方')}：${m.subject}\n${m.body.slice(0, 1200)}`).join('\n\n');
      const { json, model } = await llmJson('followup', P.followupPrompt(p.item, history, s.settings.brand));
      return { subject: String(json.subject || ''), body: String(json.body || ''), model, at: new Date().toISOString() };
    },
    'followup.send': async (p: { mailboxId: string; to: string[]; subject: string; body: string; approvedHash?: string; item?: { key?: string; reason?: string; since?: string; refId?: string } }) => {
      const s = store.read();
      const e = String(p.to?.[0] || '').toLowerCase();
      const lastInMsg = s.messages.filter((m) => m.direction === 'in' && m.from === e).sort((a, b) => b.at.localeCompare(a.at))[0];
      const msg = await gatedSend({ kind: 'followup', mailboxId: p.mailboxId, to: p.to, subject: p.subject, body: p.body, refId: p.item?.key }, { approvedHash: p.approvedHash, item: p.item, inReplyTo: lastInMsg?.messageId });
      pushState();
      return msg;
    },

    // 报价
    'product.import': (p: { path: string; replace?: boolean }) => {
      const { readTable } = require('../services/serviceSettlement/excel') as typeof import('../services/serviceSettlement/excel');
      const table = readTable(p.path);
      const { products, columns } = parseProductRows(table.rows);
      if (!products.length) throw new Error(i18nT('表格里没有读到产品行'));
      const r = store.update((st) => {
        if (p.replace) st.products = [];
        let added = 0;
        let updated = 0;
        for (const np of products) {
          const hit = st.products.find((x) => x.model.toLowerCase() === np.model.toLowerCase());
          if (hit) { Object.assign(hit, { ...np, id: hit.id, images: hit.images }); updated++; } else { st.products.push(np); added++; }
        }
        return { added, updated, columns, total: st.products.length };
      });
      pushState();
      return r;
    },
    'product.save': (p: { product: FtProduct }) => {
      // HS 确认记录只能经 hs.confirm 写（谁、何时确认），这里不收
      const { hsConfirmed: _c, hsSuggestions: _s, hsModel: _m, ...np } = p.product || ({} as FtProduct);
      if (!np.model?.trim()) throw new Error(i18nT('型号不能为空'));
      const r = store.update((st) => {
        const hit = np.id ? st.products.find((x) => x.id === np.id) : undefined;
        if (hit) { Object.assign(hit, np); return hit; }
        const created = { ...np, id: newId('prd') };
        st.products.push(created);
        return created;
      });
      pushState();
      return r;
    },
    'product.remove': (p: { id: string }) => { store.update((st) => { st.products = st.products.filter((x) => x.id !== p.id); }); pushState(); return true; },
    'quote.fx': () => currentFx(),
    'quote.match': async (p: { inquiryId?: string; items?: { product: string; model?: string; quantity?: string }[] }) => {
      const s = store.read();
      const inquiry = p?.inquiryId ? s.inquiries.find((q) => q.id === p.inquiryId) : undefined;
      const requested = (p?.items?.length ? p.items : inquiry?.items || []).filter((x) => x.product || x.model);
      if (!requested.length) throw new Error(i18nT('没有要报价的产品：先在「新询盘处理」完成信息提取，或手动添加产品'));
      const lines = matchByRules(requested, s.products);
      let model: string | undefined;
      if (s.products.length) {
        try {
          const r = await llmJson('quote', P.quoteMatchPrompt(requested.map((x, index) => ({ index, text: [x.product, x.model, (x as any).spec, x.quantity].filter(Boolean).join(' | ') })), s.products));
          model = r.model;
          for (const m of Array.isArray(r.json.matches) ? r.json.matches : []) {
            const line = lines[Number(m?.index)];
            const prod = s.products.find((x) => x.id === m?.product_id);
            if (!line || !prod || !['exact', 'partial'].includes(m.match)) continue;
            // 规则已按型号完全命中的，模型不能把它降成部分匹配（只能往上提）
            if (line.match === 'exact' && m.match !== 'exact') continue;
            Object.assign(line, { productId: prod.id, model: prod.model, name: prod.name, unitCost: prod.unitCost, match: m.match, note: m.note ? String(m.note) : undefined });
          }
        } catch (error) {
          logger?.warn?.('foreign-trade', i18nT('模型匹配产品失败，已按型号规则匹配'), { error: (error as Error)?.message });
        }
      }
      return { lines, model };
    },
    'quote.calc': async (p: { id?: string; inquiryId?: string; lines: FtQuoteLine[]; incoterm: FtIncoterm; destination?: string; customerEmail?: string; customerName?: string; mailboxId?: string; model?: string }) => {
      const s = store.read();
      const fx = await currentFx();
      const r = calcQuote(p.lines || [], s.settings.quoteRules, p.incoterm || s.settings.quoteRules.defaultIncoterm, fx, s.products);
      const inquiry = p.inquiryId ? s.inquiries.find((q) => q.id === p.inquiryId) : undefined;
      const quote = store.update((st) => {
        let q = p.id ? st.quotes.find((x) => x.id === p.id) : undefined;
        if (!q) {
          q = { id: newId('qt'), createdAt: new Date().toISOString(), status: 'draft' } as FtQuote;
          st.quotes.unshift(q);
        }
        Object.assign(q, {
          inquiryId: p.inquiryId,
          customerEmail: p.customerEmail || inquiry?.customerEmail,
          customerName: p.customerName || inquiry?.company || inquiry?.customerName,
          mailboxId: p.mailboxId || inquiry?.mailboxId,
          incoterm: p.incoterm || st.settings.quoteRules.defaultIncoterm,
          destination: p.destination,
          lines: r.lines,
          calc: r.calc,
          warnings: r.warnings,
          total: r.total,
          currency: st.settings.quoteRules.quoteCurrency,
          fx,
          model: p.model,
          status: 'draft',
          approvedAt: undefined,
          filePath: undefined,
        });
        return q;
      });
      pushState();
      return quote;
    },
    'quote.export': async (p: { id: string }) => { const r = await exportQuote(p.id); pushState(); return r; },
    'quote.approve': async (p: { id: string }) => {
      store.update((st) => {
        const t = requireFound(st.quotes.find((x) => x.id === p.id), i18nT('报价单'));
        if (!t.lines.length) throw new Error(i18nT('报价单没有明细'));
        t.status = 'approved';
        t.approvedAt = new Date().toISOString();
      });
      const r = await exportQuote(p.id); // 审批后重出一版，去掉草稿水印
      pushState();
      return r;
    },
    'quote.emailDraft': async (p: { id: string; language?: string }) => {
      const s = store.read();
      const q = requireFound(s.quotes.find((x) => x.id === p.id), i18nT('报价单'));
      const summary = [
        `Terms: ${q.incoterm}${q.destination ? ` ${q.destination}` : ''}`,
        ...q.lines.map((l) => `${l.model} ${l.name} × ${l.quantity} @ ${fmtNum(l.unitPrice || 0)} ${q.currency}`),
        `Total: ${fmtNum(q.total)} ${q.currency}`,
        `Validity: ${s.settings.quoteRules.validityDays} days`,
      ].join('\n');
      const { json, model } = await llmJson('quote', P.quoteEmailPrompt(q.customerName || q.customerEmail || '', summary, s.settings.brand, p.language || ''));
      return { subject: String(json.subject || ''), body: String(json.body || ''), model, at: new Date().toISOString() };
    },
    'quote.send': async (p: { id: string; mailboxId: string; to: string[]; subject: string; body: string; approvedHash?: string }) => {
      let q = requireFound(store.read().quotes.find((x) => x.id === p.id), i18nT('报价单'));
      if (q.status === 'draft') throw new Error(i18nT('报价单还没有审批，审批后才能发出'));
      if (!q.filePath || !existsSync(q.filePath)) q = await exportQuote(q.id);
      const xlsx = q.filePath!.replace(/\.pdf$/i, '.xlsx');
      const inquiry = q.inquiryId ? store.read().inquiries.find((x) => x.id === q.inquiryId) : undefined;
      const last = inquiry ? lastInbound(store.read(), inquiry) : undefined;
      // 成本明细是内部数据：只发 PDF，Excel（含成本页）留在本地
      await gatedSend({ kind: 'quote', mailboxId: p.mailboxId, to: p.to, subject: p.subject, body: p.body, refId: q.id }, { approvedHash: p.approvedHash, attachments: [{ filename: basename(q.filePath!), path: q.filePath! }], inReplyTo: last?.messageId });
      void xlsx;
      const r = store.update((st) => {
        const t = st.quotes.find((x) => x.id === p.id)!;
        t.status = 'sent';
        t.sentAt = new Date().toISOString();
        t.mailboxId = p.mailboxId;
        if (t.customerEmail == null) t.customerEmail = p.to[0];
        const iq = t.inquiryId ? st.inquiries.find((x) => x.id === t.inquiryId) : undefined;
        if (iq) iq.status = 'quoted';
        return t;
      });
      pushState();
      return r;
    },
    'quote.remove': (p: { id: string }) => { store.update((st) => { st.quotes = st.quotes.filter((x) => x.id !== p.id); }); pushState(); return true; },

    // 订单推进
    'order.create': (p: { quoteId?: string; orderNo: string; customerName?: string; customerEmail?: string; amount?: number; currency?: string }) => {
      const s = store.read();
      const q = p.quoteId ? s.quotes.find((x) => x.id === p.quoteId) : undefined;
      if (!p.orderNo?.trim()) throw new Error(i18nT('请填写订单号'));
      const order: FtOrder = {
        id: newId('ord'), orderNo: p.orderNo.trim(), quoteId: q?.id,
        customerName: p.customerName || q?.customerName || q?.customerEmail || '',
        customerEmail: p.customerEmail || q?.customerEmail,
        amount: p.amount ?? q?.total, currency: p.currency || q?.currency,
        nodes: defaultOrderNodes(), docs: [], status: 'active', createdAt: new Date().toISOString(),
      };
      store.update((st) => { st.orders.unshift(order); });
      pushState();
      return order;
    },
    'order.update': (p: { id: string; patch: Partial<FtOrder> }) => {
      const r = store.update((st) => {
        const t = requireFound(st.orders.find((x) => x.id === p.id), i18nT('订单'));
        const patch = p.patch || {};
        if (patch.nodes) t.nodes = patch.nodes.map((n) => ({ ...n, doneAt: n.done ? (n.doneAt || new Date().toISOString()) : undefined }));
        for (const k of ['orderNo', 'customerName', 'customerEmail', 'amount', 'currency', 'status'] as const) if (patch[k] !== undefined) (t as any)[k] = patch[k];
        return t;
      });
      pushState();
      return r;
    },
    'order.addDocs': (p: { id: string; files: { path: string; kind: FtOrderDocKind }[] }) => {
      const r = store.update((st) => {
        const t = requireFound(st.orders.find((x) => x.id === p.id), i18nT('订单'));
        const dir = store.subdir('orders', t.id);
        for (const f of p.files || []) {
          const dest = join(dir, `${Date.now()}_${basename(f.path)}`);
          copyFileSync(f.path, dest);
          t.docs.push({ id: newId('doc'), kind: f.kind || 'other', name: basename(f.path), path: dest });
        }
        t.check = undefined;
        return t;
      });
      pushState();
      return r;
    },
    'order.removeDoc': (p: { id: string; docId: string }) => {
      const r = store.update((st) => { const t = requireFound(st.orders.find((x) => x.id === p.id), i18nT('订单')); t.docs = t.docs.filter((d) => d.id !== p.docId); t.check = undefined; return t; });
      pushState();
      return r;
    },
    'order.extract': async (p: { id: string }) => {
      const order = requireFound(store.read().orders.find((x) => x.id === p.id), i18nT('订单'));
      const { extractDocument } = await import('../services/documentExtractor');
      const { docCorpus } = await import('../services/documentExtraction');
      for (const d of order.docs) {
        if (!d.table && /\.(xlsx|xls|xlsm)$/i.test(d.path)) {
          try {
            const table = readSheetTable(d.path);
            if (table) store.update((st) => { const doc = st.orders.find((x) => x.id === p.id)?.docs.find((x) => x.id === d.id); if (doc) doc.table = table; });
          } catch { /* 表格读不出就只靠字段提取 */ }
        }
        if (d.fields) continue;
        progress('order', i18nT('正在读取单据：{p0}', { p0: d.name }));
        try {
          const text = docCorpus(await extractDocument(d.path, d.name));
          if (!text.trim()) throw new Error(i18nT('单据里没有读到文字（可能是图片扫描件）'));
          const { json } = await llmJson('order', P.orderDocPrompt(d.kind, text));
          const fields: Record<string, string> = {};
          for (const [k, v] of Object.entries(json || {})) if (v != null && String(v).trim()) fields[k] = String(v).trim();
          store.update((st) => { const doc = st.orders.find((x) => x.id === p.id)?.docs.find((x) => x.id === d.id); if (doc) { doc.fields = fields; doc.extractedAt = new Date().toISOString(); doc.error = undefined; } });
        } catch (error) {
          store.update((st) => { const doc = st.orders.find((x) => x.id === p.id)?.docs.find((x) => x.id === d.id); if (doc) doc.error = (error as Error)?.message || String(error); });
        }
      }
      pushState();
      return store.read().orders.find((x) => x.id === p.id);
    },
    'order.check': (p: { id: string }) => {
      const r = store.update((st) => {
        const t = requireFound(st.orders.find((x) => x.id === p.id), i18nT('订单'));
        const res = compareOrderDocs(t.docs);
        t.check = { at: new Date().toISOString(), ...res, findings: validateTradeDocs(t.docs) };
        return t;
      });
      pushState();
      return r;
    },
    'order.remove': (p: { id: string }) => { store.update((st) => { st.orders = st.orders.filter((x) => x.id !== p.id); }); pushState(); return true; },

    // 内容生产
    'content.generate': async (p: { kind: FtContentDraft['kind']; productId?: string; language: string; topic: string; extra?: string }) => {
      const s = store.read();
      const product = p.productId ? s.products.find((x) => x.id === p.productId) : undefined;
      const { json, model } = await llmJson('content', P.contentPrompt(p.kind, p.language || 'English', p.topic || '', product, s.settings.brand, p.extra || ''), 240_000);
      const draft: FtContentDraft = {
        id: newId('ct'), kind: p.kind, productId: product?.id, language: p.language || 'English', topic: p.topic || '',
        title: String(json.title || ''), body: String(json.body || ''),
        keywords: Array.isArray(json.keywords) ? json.keywords.map(String).filter(Boolean).slice(0, 15) : [],
        model, createdAt: new Date().toISOString(), status: 'draft', images: [], videos: [],
      };
      if (!draft.body.trim()) throw new Error(i18nT('模型没有写出正文，请重试'));
      store.update((st) => { st.contents.unshift(draft); st.contents.splice(300); });
      pushState();
      return draft;
    },
    'content.save': (p: { draft: Partial<FtContentDraft> & { id: string } }) => {
      const r = store.update((st) => {
        const t = requireFound(st.contents.find((x) => x.id === p.draft.id), i18nT('内容'));
        for (const k of ['title', 'body', 'keywords', 'status', 'scheduledAt', 'channel', 'images', 'videos'] as const) if (p.draft[k] !== undefined) (t as any)[k] = p.draft[k];
        return t;
      });
      pushState();
      return r;
    },
    'content.remove': (p: { id: string }) => { store.update((st) => { st.contents = st.contents.filter((x) => x.id !== p.id); }); pushState(); return true; },
    'content.imagePrompts': async (p: { id: string; count?: number }) => {
      const s = store.read();
      const c = requireFound(s.contents.find((x) => x.id === p.id), i18nT('内容'));
      const product = c.productId ? s.products.find((x) => x.id === c.productId) : undefined;
      const { json } = await llmJson('content', P.imagePromptsPrompt(product, `${c.title}\n${c.topic}`, Math.min(Math.max(p.count || 4, 1), 6)));
      return (Array.isArray(json.prompts) ? json.prompts : []).map(String).filter(Boolean);
    },
    'content.images': async (p: { id: string; prompts: string[]; referenceImage?: string }) => {
      const { runFalJob } = await import('./mediaFal.ipc');
      const c = requireFound(store.read().contents.find((x) => x.id === p.id), i18nT('内容'));
      const dir = outputDir(join(i18nT('产品素材'), c.id));
      const made: string[] = [];
      const errors: string[] = [];
      for (let i = 0; i < (p.prompts || []).length; i++) {
        progress('content', i18nT('正在生成第 {p0}/{p1} 张图片…', { p0: i + 1, p1: p.prompts.length }));
        try {
          const r = await runFalJob(deps as any, p.referenceImage
            ? { capability: 'edit', prompt: p.prompts[i], imageUrl: p.referenceImage, num: 1 }
            : { capability: 't2i', prompt: p.prompts[i], width: 1024, height: 1024, num: 1 });
          for (const f of r.files.filter(Boolean)) {
            const dest = join(dir, `image_${Date.now()}_${i + 1}${extname(f) || '.png'}`);
            copyFileSync(f, dest);
            made.push(dest);
          }
        } catch (error) {
          errors.push((error as Error)?.message || String(error));
        }
      }
      if (!made.length) throw new Error(errors[0] || i18nT('图片服务没有返回图片'));
      const r = store.update((st) => { const t = st.contents.find((x) => x.id === p.id)!; t.images = [...t.images, ...made]; return t; });
      pushState();
      return { draft: r, errors };
    },
    'content.addImages': (p: { id: string; paths: string[] }) => {
      const c = requireFound(store.read().contents.find((x) => x.id === p.id), i18nT('内容'));
      const dir = outputDir(join(i18nT('产品素材'), c.id));
      const copied = (p.paths || []).map((src) => { const dest = join(dir, `${Date.now()}_${basename(src)}`); copyFileSync(src, dest); return dest; });
      const r = store.update((st) => { const t = st.contents.find((x) => x.id === p.id)!; t.images = [...t.images, ...copied]; return t; });
      pushState();
      return r;
    },
    'content.video': async (p: { id: string; image: string; prompt: string }) => {
      const { runFalJob } = await import('./mediaFal.ipc');
      const c = requireFound(store.read().contents.find((x) => x.id === p.id), i18nT('内容'));
      progress('content', i18nT('正在生成产品视频（通常需要 1～3 分钟）…'));
      const r = await runFalJob(deps as any, { capability: 'i2v', prompt: p.prompt || c.title, imageUrl: p.image, duration: 5, aspect: '16:9' });
      const file = r.files.find(Boolean);
      if (!file) throw new Error(i18nT('视频服务没有返回视频'));
      const dest = join(outputDir(join(i18nT('产品素材'), c.id)), `video_${Date.now()}${extname(file) || '.mp4'}`);
      copyFileSync(file, dest);
      const d = store.update((st) => { const t = st.contents.find((x) => x.id === p.id)!; t.videos = [...t.videos, dest]; return t; });
      pushState();
      return d;
    },
    'content.materialDir': (p: { id: string }) => {
      const c = requireFound(store.read().contents.find((x) => x.id === p.id), i18nT('内容'));
      if (!c.images.length) throw new Error(i18nT('还没有产品图片，请先生成或上传图片'));
      const dir = join(outputDir(join(i18nT('产品素材'), c.id)), 'slideshow');
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      c.images.forEach((img, i) => { if (existsSync(img)) copyFileSync(img, join(dir, `${String(i + 1).padStart(2, '0')}${extname(img) || '.png'}`)); });
      return dir;
    },
    'content.attachVideo': (p: { id: string; path: string }) => {
      const r = store.update((st) => { const t = requireFound(st.contents.find((x) => x.id === p.id), i18nT('内容')); if (!t.videos.includes(p.path)) t.videos.push(p.path); return t; });
      pushState();
      return r;
    },
    'content.export': async (p: { id: string }) => {
      const c = requireFound(store.read().contents.find((x) => x.id === p.id), i18nT('内容'));
      const { writePdfFromHtml } = await import('../services/bidWriter/docx');
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,"Microsoft YaHei",sans-serif;font-size:13px;line-height:1.6;color:#222}h1{font-size:20px}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><h1>${htmlEscape(c.title)}</h1>${c.keywords?.length ? `<p><b>Keywords:</b> ${htmlEscape(c.keywords.join(', '))}</p>` : ''}<pre>${htmlEscape(c.body)}</pre></body></html>`;
      const path = join(outputDir(i18nT('内容')), `${(c.title || c.id).replace(/[\\/:*?"<>|]+/g, '_').slice(0, 60)}.pdf`);
      await writePdfFromHtml(path, html);
      return path;
    },

    // 平台运营 / 网站社媒：交给数字员工在内置浏览器里操作
    'publish.instruction': (p: { contentId: string; kind: 'platform_product' | 'social_post'; channel?: string }) => {
      const s = store.read();
      const c = requireFound(s.contents.find((x) => x.id === p.contentId), i18nT('内容'));
      if (p.kind === 'platform_product') return P.platformPublishInstruction(s.settings.platform.name, s.settings.platform.publishUrl, c, c.images, c.videos);
      return P.socialPublishInstruction(p.channel || 'LinkedIn', c, [...c.images, ...c.videos]);
    },
    'publish.record': (p: { contentId: string; kind: 'platform_product' | 'social_post'; channel: string; conversationId?: string }) => {
      const r = store.update((st) => {
        const job = { id: newId('pub'), kind: p.kind, contentId: p.contentId, channel: p.channel, conversationId: p.conversationId, at: new Date().toISOString() };
        st.publishJobs.unshift(job);
        const c = st.contents.find((x) => x.id === p.contentId);
        if (c) c.published = { at: job.at, conversationId: p.conversationId, channel: p.channel };
        return job;
      });
      pushState();
      return r;
    },
    'listing.import': (p: { path: string }) => {
      const { readTable } = require('../services/serviceSettlement/excel') as typeof import('../services/serviceSettlement/excel');
      const { listings, columns } = parseListingRows(readTable(p.path).rows);
      if (!listings.length) throw new Error(i18nT('表格里没有读到商品行'));
      store.update((st) => { st.listings = listings; });
      pushState();
      return { count: listings.length, columns };
    },
    'listing.suggest': async (p: { ids: string[] }) => {
      const s = store.read();
      let model = '';
      for (const id of p.ids || []) {
        const l = s.listings.find((x) => x.id === id);
        if (!l) continue;
        progress('platform', i18nT('正在优化：{p0}', { p0: l.title.slice(0, 40) }));
        const issues = (l.issues.length ? l.issues : diagnoseListing(l)).map((i) => `- ${i.message}`).join('\n') || i18nT('- 没有明显问题，做常规优化');
        const r = await llmJson('platform', P.listingSuggestPrompt(l, issues, s.settings.platform.name));
        model = r.model;
        store.update((st) => {
          const t = st.listings.find((x) => x.id === id)!;
          const title = String(r.json.title || '').slice(0, 128);
          const keywords = Array.isArray(r.json.keywords) ? r.json.keywords.map(String).filter(Boolean).slice(0, 10) : [];
          t.suggestion = { title, keywords, reason: String(r.json.reason || ''), model: r.model, issues: lintTitle(title, keywords) };
        });
      }
      pushState();
      return { model };
    },
    'listing.update': (p: { id: string; patch: Partial<{ status: 'pending' | 'approved' | 'applied'; suggestion: any }> }) => {
      const r = store.update((st) => { const t = requireFound(st.listings.find((x) => x.id === p.id), i18nT('商品')); Object.assign(t, p.patch || {}); return t; });
      pushState();
      return r;
    },
    'seo.check': async (p: { url: string }) => {
      const url = String(p?.url || '').trim();
      if (!/^https?:\/\//i.test(url)) throw new Error(i18nT('请填写完整的网址（以 http:// 或 https:// 开头）'));
      const { crawlWebsite } = await import('../services/websiteCrawler');
      const report = await crawlWebsite(url, { maxPages: 15, clickButtonsPerPage: 1, perPageTimeoutMs: 20_000, onProgress: (m) => progress('social', m) });
      const check = {
        id: newId('seo'), url, at: new Date().toISOString(), pages: report.summary.totalPages,
        issues: report.summary.seoIssues, brokenLinks: report.summary.totalBrokenLinks, brokenImages: report.summary.totalBrokenImages,
      };
      store.update((st) => { st.seoChecks.unshift(check); st.seoChecks.splice(30); st.settings.website = url; });
      pushState();
      return check;
    },

    // 数据整理
    'report.build': async (p: { from: string; to: string }) => { const r = await buildReport(p.from, p.to); pushState(); return r; },
    'report.commentary': async (p: { id: string }) => {
      const r = requireFound(store.read().reports.find((x) => x.id === p.id), i18nT('报表'));
      const { json, model } = await llmJson('report', P.reportCommentaryPrompt(r.stats));
      const out = store.update((st) => { const t = st.reports.find((x) => x.id === p.id)!; t.commentary = String(json.commentary || ''); t.model = model; return t; });
      pushState();
      return out;
    },
    'report.remove': (p: { id: string }) => { store.update((st) => { st.reports = st.reports.filter((x) => x.id !== p.id); }); pushState(); return true; },
    'report.export': (p: { id: string }) => { const r = exportReport(p.id); pushState(); return r; },
    'report.send': async (p: { id: string; mailboxId: string; to: string[] }) => { const r = await sendReport(p.id, p.mailboxId, parseEmails(p.to)); pushState(); return r; },

    // 发信闸门：界面在「确认发送」前调它列出拦截原因；放行时返回的 hash 随发送一起带回来
    'outgoing.check': (p: { kind: FtSendKind; mailboxId: string; to: string[] | string; subject: string; body: string; refId?: string; item?: { reason?: string; since?: string } }) => {
      if (!['outreach', 'followup', 'inquiry_reply', 'quote'].includes(p?.kind)) throw new Error(i18nT('未知的发送类型'));
      const to = (Array.isArray(p.to) ? p.to : String(p.to || '').split(/[,，;；\s]+/)).map((x) => String(x).trim().toLowerCase()).filter(Boolean);
      return gateCheck({ kind: p.kind, mailboxId: String(p.mailboxId || ''), to, subject: String(p.subject || ''), body: String(p.body || ''), refId: p.refId }, { item: p.item });
    },
    'suppression.add': (p: { value: string; reason: string }) => {
      const value = String(p?.value || '').trim().toLowerCase().replace(/^@/, '');
      const reason = String(p?.reason || '').trim();
      if (!reason) throw new Error(i18nT('加入抑制名单要写原因'));
      const isEmail = value.includes('@');
      if (isEmail ? !EMAIL_RE.test(value) : !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) throw new Error(i18nT('请填写邮箱地址或域名'));
      const r = store.update((st) => {
        if (st.suppressions.some((x) => (isEmail ? x.email === value : x.domain === value))) throw new Error(i18nT('已经在抑制名单里了'));
        const item = { id: newId('sup'), ...(isEmail ? { email: value } : { domain: value }), reason, source: 'manual' as const, at: new Date().toISOString() };
        st.suppressions.unshift(item);
        return item;
      });
      pushState();
      return r;
    },
    'suppression.remove': (p: { id: string }) => { store.update((st) => { st.suppressions = st.suppressions.filter((x) => x.id !== p.id); }); pushState(); return true; },

    // 交易对手名单筛查
    'screening.status': () => screeningLists.status(),
    'screening.refresh': async (p: { ids?: FtScreeningSourceId[] }) => {
      const ids = (p?.ids?.length ? p.ids : SCREENING_IDS).filter((x) => SCREENING_IDS.includes(x));
      const r = await screeningLists.refresh(fetchViaNet as any, ids, (id) => progress('background', i18nT('正在下载名单：{p0}', { p0: screeningLists.status().find((x) => x.id === id)?.label || id })));
      return r;
    },
    'screening.import': (p: { id: FtScreeningSourceId; path: string }) => {
      if (!SCREENING_IDS.includes(p?.id)) throw new Error(i18nT('未知的名单'));
      if (!p.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      return screeningLists.importText(p.id, readFileSync(p.path, 'utf-8'));
    },
    'screening.run': (p: { name: string; country?: string; context?: string }) => { const r = runScreening(p.name, p.country, p.context || 'manual'); pushState(); return r; },
    'screening.latest': (p: { name: string }) => latestScreening(p?.name || ''),
    'background.checks': async (p: { id: string }) => {
      const bg = requireFound(store.read().backgrounds.find((b) => b.id === p.id), i18nT('背调记录'));
      progress('background', i18nT('正在查域名注册时间与收信服务器…'));
      const site = bg.website ? hostOf(bg.website) : '';
      const ed = emailDomainOf(bg.email || '');
      const domain = site || ed;
      const [created, mx] = await Promise.all([domainCreated(domain), hasMx(ed || site)]);
      let screening: FtScreeningResult | undefined;
      let screeningError = '';
      try { screening = runScreening(bg.company, bg.country, 'background'); } catch (error) { screeningError = (error as Error)?.message || String(error); }
      const checks = backgroundChecks({ email: bg.email, website: bg.website, sources: bg.sources, domainCreated: created, mx: ed || site ? mx : undefined, screening });
      const r = store.update((st) => {
        const t = requireFound(st.backgrounds.find((b) => b.id === p.id), i18nT('背调记录'));
        t.coverage = checks.coverage;
        t.flags = checks.flags;
        if (screening) t.screening = screening;
        t.checkedAt = new Date().toISOString();
        return t;
      });
      pushState();
      return { background: r, screeningError };
    },

    // HS 编码：本地检索 → 模型重排写理由 → 人工确认（没确认的进不了单据）
    'hs.search': (p: { query: string; topN?: number }) => hsSearch(hs(), String(p?.query || ''), Math.min(Math.max(Number(p?.topN) || 20, 5), 50)),
    'hs.suggest': async (p: { productId: string; rerank?: boolean }) => {
      const prod = requireFound(store.read().products.find((x) => x.id === p.productId), i18nT('产品'));
      const table = hs();
      let query = [prod.name, prod.spec, prod.model].filter(Boolean).join(' ');
      let model = '';
      // 中文品名在英文条文里检索不到：先让模型给英文检索词（「只做本地检索」不调模型）
      if (p.rerank !== false && (hsSearch(table, query, 1).length === 0 || /[\u3400-\u9fff]/.test(prod.name))) {
        const r = await llmJson('quote', P.hsTermsPrompt(prod));
        model = r.model;
        const terms = (Array.isArray(r.json.terms) ? r.json.terms : []).map(String).filter(Boolean).slice(0, 10);
        if (terms.length) query = `${terms.join(' ')} ${query}`;
      }
      const candidates = hsSearch(table, query, 20);
      if (!candidates.length) throw new Error(i18nT('HS 编码表里没有检索到候选，可以在品名或规格里补充英文名称后再试'));
      let picks = candidates.slice(0, 8).map((c, i) => ({ ...c, rank: i + 1 }));
      if (p.rerank !== false) {
        const r = await llmJson('quote', P.hsRerankPrompt(prod, candidates));
        model = r.model;
        const chosen = (Array.isArray(r.json.picks) ? r.json.picks : [])
          .map((x: any) => ({ cand: candidates.find((c) => c.code === String(x?.code || '').replace(/[\s.]/g, '').slice(0, 6)), reason: String(x?.reason || '') }))
          .filter((x: any) => x.cand)
          .slice(0, 5);
        if (chosen.length) picks = chosen.map((x: any, i: number) => ({ ...x.cand, reason: x.reason, rank: i + 1 }));
      }
      const r = store.update((st) => {
        const t = requireFound(st.products.find((x) => x.id === p.productId), i18nT('产品'));
        t.hsSuggestions = picks;
        t.hsModel = model || undefined;
        return t;
      });
      pushState();
      return r;
    },
    'hs.confirm': (p: { productId: string; code: string }) => {
      const v = validateHsCode(hs(), p?.code);
      if (!v.ok) throw new Error(v.reason === 'format' ? i18nT('HS 编码应为 6～10 位数字') : i18nT('前 6 位不是 HS2022 里的子目，请核对'));
      const r = store.update((st) => {
        const t = requireFound(st.products.find((x) => x.id === p.productId), i18nT('产品'));
        t.hsCode = v.code;
        t.hsConfirmed = { at: new Date().toISOString(), by: userInfo().username || 'user', code: v.code };
        return t;
      });
      logger?.info?.('foreign-trade', 'HS 编码已人工确认', { product: r.model, code: v.code, by: r.hsConfirmed?.by });
      pushState();
      return r;
    },
    'hs.clear': (p: { productId: string }) => {
      const r = store.update((st) => { const t = requireFound(st.products.find((x) => x.id === p.productId), i18nT('产品')); t.hsCode = undefined; t.hsConfirmed = undefined; return t; });
      pushState();
      return r;
    },

    // PI / CI / 装箱单
    'docs.prepare': (p: { orderId: string; reset?: boolean }) => {
      const r = store.update((st) => {
        const o = requireFound(st.orders.find((x) => x.id === p.orderId), i18nT('订单'));
        if (!o.tradeDocs?.input || p.reset) o.tradeDocs = { input: defaultTradeInput(st, o) };
        o.tradeDocs.input = syncHs(st, o.tradeDocs.input);
        o.tradeDocs.validation = validateTradeDocInput(o.tradeDocs.input);
        return o;
      });
      pushState();
      return r;
    },
    'docs.save': (p: { orderId: string; input: FtTradeDocInput }) => {
      if (!p?.input?.lines) throw new Error(i18nT('单据信息不完整'));
      const r = store.update((st) => {
        const o = requireFound(st.orders.find((x) => x.id === p.orderId), i18nT('订单'));
        const input = syncHs(st, normalizeTradeInput(p.input));
        o.tradeDocs = { ...(o.tradeDocs || {}), input, validation: validateTradeDocInput(input) };
        return o;
      });
      pushState();
      return r;
    },
    'docs.generate': async (p: { orderId: string }) => { const r = await generateTradeDocs(p.orderId); pushState(); return r; },
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_FT_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const fn = actions[String(req?.action || '')];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: String(req?.action || '') }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('foreign-trade', `${req.action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });

  // 后台：定时收全部邮箱；每分钟看一次要不要发日报
  const firstPoll = setTimeout(() => { void pollAll().then(pushState); }, 8_000);
  const pollTimer = setInterval(() => { void pollAll().then(pushState); }, POLL_INTERVAL_MS);
  const tickTimer = setInterval(() => { void tick(); }, TICK_INTERVAL_MS);
  for (const t of [firstPoll, pollTimer, tickTimer]) (t as any).unref?.();
  const stopBackground = () => { clearTimeout(firstPoll); clearInterval(pollTimer); clearInterval(tickTimer); };
  onAppWillQuit('foreign-trade', stopBackground, { once: true });
  // 卸载 / 停用时由方案入口 deactivate 调用（宿主只撤 IPC 通道，后台任务要自己停）
  return stopBackground;
}
