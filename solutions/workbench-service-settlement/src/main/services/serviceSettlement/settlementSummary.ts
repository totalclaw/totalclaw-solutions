/**
 * 模块二 · 服务费用结案汇总、下发及付款跟踪（纯计算部分）。
 *
 * 需求：
 *   - 读取工单结算明细表 + 各项激励及补扣表格 → 服务商结算总汇总表；
 *   - 所有补扣汇总附件按服务商拆分；同一服务商的拆分附件合并为一个 Excel，
 *     文件以服务商名称命名，内部子表按补扣费用命名；
 *   - 发送 / 已读打标 / 发票监听 / 3 天未核销提醒 / 超 20 天未开票预警 / 未付款报表
 *     ——这些带 IO 与时间的在 store.ts + tracking 里，这里只出「表」。
 */
import { canonicalProvider, toNumber, type SheetTable, type OutSheet, tableToOutSheet, safeFileName } from './excel';
import type { MappedTable } from './reviewIncentive';
import { t as i18nT } from '@totalclaw/i18n';

export interface FeeItemSource extends MappedTable {
  /** 费用项名称（子表名），默认取文件名 / sheet 名，用户可改 */
  name: string;
  /** 激励 = +1，补扣 = -1 */
  sign: 1 | -1;
}

export interface SettlementInput {
  /** 结算期，如 2026-08 */
  period: string;
  workOrders: MappedTable[];
  feeItems: FeeItemSource[];
  /** 服务商别名 → 主体名（都是归一名），来自通讯录「别名」列；同一家的多个写法合并计算 */
  aliases?: Record<string, string> | null;
}

export interface ProviderSettlement {
  provider: string;
  workOrderCount: number;
  workOrderAmount: number;
  /** 费用项名 → 带符号金额 */
  items: Record<string, number>;
  incentiveTotal: number;
  deductionTotal: number;
  /** 工单结算 + 激励 − 补扣 */
  netTotal: number;
}

export interface SettlementSummaryResult {
  period: string;
  itemNames: string[];
  providers: ProviderSettlement[];
  totals: { providerCount: number; workOrderAmount: number; incentiveTotal: number; deductionTotal: number; netTotal: number };
  warnings: string[];
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * 从文件名猜费用项是激励还是补扣。客户把所有调整项都叫「已录补扣-xxx」（补 = 加，扣 = 减），
 * 文件名里出现 激励/补贴/奖励/返利/减免/核销 的是加项；先去掉「已录补扣-」前缀再看。
 */
export function guessFeeSign(name: string): 1 | -1 {
  const n = String(name || '').replace(/^已录补扣[-—_ ]*/, '');
  if (/激励|补贴|奖励|返利|返点|减免|核销|补发|奖金/.test(n)) return 1;
  return /补扣|扣款|扣罚|罚款|扣除|考核扣|违约|赔付|扣减/.test(n) ? -1 : 1;
}

/**
 * 服务商名字是不是占位/汇总行：客户的旧机回收外发表里「自建单服务商」列有 `\`，抽查表有「合计」行，
 * 2026-09-03 实测这些被当成服务商各自拆出一个文件（`\` 一家 4.3 万元）。
 */
export function isBogusProvider(name: string): boolean {
  const s = String(name || '').trim();
  if (!s) return true;
  if (/^[\\\/\-—–_.·•*#]+$/.test(s)) return true;
  if (/^\d+(\.\d+)?$/.test(s)) return true;
  if (/^(合计|总计|小计|汇总|总和|总数|全部|其他|其它|无|空|n\/?a|null|undefined)$/i.test(s)) return true;
  return false;
}

/** 外发文件不能带内部列：表头含「不外发 / 内部 / 勿外发」的列一律剔除 */
export const INTERNAL_COLUMN_PATTERN = /不外发|勿外发|内部|不对外|仅内/;
export function stripInternalColumns(table: SheetTable): SheetTable {
  const headers = table.headers.filter((h) => !INTERNAL_COLUMN_PATTERN.test(h));
  if (headers.length === table.headers.length) return table;
  return { ...table, headers, rows: table.rows.map((r) => Object.fromEntries(headers.map((h) => [h, r[h] ?? '']))) };
}

/** 去掉扩展名与常见前缀，留下能当子表名的短名 */
export function guessFeeItemName(fileName: string, sheetName?: string, sheetCount = 1): string {
  const base = fileName.replace(/\.(xlsx|xls|xlsm|csv)$/i, '').replace(/^\d{4}[-_.]?\d{1,2}[-_.]?/, '').trim();
  if (sheetCount > 1 && sheetName && !/^sheet\d*$/i.test(sheetName)) return `${base}-${sheetName}`.slice(0, 31);
  return (base || sheetName || i18nT('费用项')).slice(0, 31);
}

export function computeSettlementSummary(input: SettlementInput): SettlementSummaryResult {
  const warnings: string[] = [];
  let bogusRows = 0;
  const map = new Map<string, ProviderSettlement>();
  const ensure = (p: string): ProviderSettlement => {
    let s = map.get(p);
    if (!s) {
      s = { provider: p, workOrderCount: 0, workOrderAmount: 0, items: {}, incentiveTotal: 0, deductionTotal: 0, netTotal: 0 };
      map.set(p, s);
    }
    return s;
  };
  for (const src of input.workOrders) {
    const m = src.mapping;
    if (!m.provider) { warnings.push(i18nT('{p0}：未指定服务商列，已跳过', { p0: src.table.fileName })); continue; }
    if (!m.amount) warnings.push(i18nT('{p0}：未指定结算金额列，只统计单数', { p0: src.table.fileName }));
    for (const row of src.table.rows) {
      const p = canonicalProvider(row[m.provider], input.aliases);
      if (isBogusProvider(p)) { bogusRows += 1; continue; }
      const s = ensure(p);
      s.workOrderCount += 1;
      if (m.amount) s.workOrderAmount = round2(s.workOrderAmount + toNumber(row[m.amount]));
    }
  }
  const itemNames: string[] = [];
  for (const item of input.feeItems) {
    const m = item.mapping;
    const name = item.name.trim() || item.table.fileName;
    if (!itemNames.includes(name)) itemNames.push(name);
    if (!m.provider) { warnings.push(i18nT('{name}：未指定服务商列，已跳过', { name })); continue; }
    if (!m.amount) { warnings.push(i18nT('{name}：未指定金额列，已跳过', { name })); continue; }
    for (const row of item.table.rows) {
      const p = canonicalProvider(row[m.provider], input.aliases);
      if (isBogusProvider(p)) { bogusRows += 1; continue; }
      const s = ensure(p);
      // 激励表（+）保留每行自带的正负：客户的补扣总表把违约金记成负数行，取绝对值会把扣款算成激励；
      // 补扣表（−）则一律记负，避免有人把扣款填成正数后被加回去。
      const v = toNumber(row[m.amount]);
      const signed = item.sign === -1 ? -Math.abs(v) : v;
      s.items[name] = round2((s.items[name] || 0) + signed);
    }
  }
  const providers = [...map.values()].map((s) => {
    let inc = 0;
    let ded = 0;
    for (const v of Object.values(s.items)) {
      if (v >= 0) inc += v; else ded += -v;
    }
    s.incentiveTotal = round2(inc);
    s.deductionTotal = round2(ded);
    s.netTotal = round2(s.workOrderAmount + inc - ded);
    return s;
  }).sort((a, b) => a.provider.localeCompare(b.provider, 'zh-CN'));
  const totals = providers.reduce((t, p) => ({
    providerCount: t.providerCount + 1,
    workOrderAmount: round2(t.workOrderAmount + p.workOrderAmount),
    incentiveTotal: round2(t.incentiveTotal + p.incentiveTotal),
    deductionTotal: round2(t.deductionTotal + p.deductionTotal),
    netTotal: round2(t.netTotal + p.netTotal),
  }), { providerCount: 0, workOrderAmount: 0, incentiveTotal: 0, deductionTotal: 0, netTotal: 0 });
  if (bogusRows) warnings.push(i18nT('{n} 行服务商为空或为占位/合计（如 \\、合计、纯数字），已忽略', { n: bogusRows }));
  if (!providers.length) warnings.push(i18nT('没有解析出任何服务商，请检查文件和列映射'));
  return { period: input.period, itemNames, providers, totals, warnings };
}

/** 汇总表的列：固定列 + 每个费用项一列 + 合计列 + 跟踪列（由调用方填） */
export function summaryHeaders(result: SettlementSummaryResult): string[] {
  return [
    i18nT('服务商'), i18nT('工单数'), i18nT('工单结算金额(元)'),
    ...result.itemNames.map((n) => i18nT('{n}(元)', { n })),
    i18nT('激励合计(元)'), i18nT('补扣合计(元)'), i18nT('应付合计(元)'),
  ];
}

export function summaryRows(result: SettlementSummaryResult): (string | number)[][] {
  const rows = result.providers.map((p) => [
    p.provider, p.workOrderCount, p.workOrderAmount,
    ...result.itemNames.map((n) => p.items[n] ?? 0),
    p.incentiveTotal, p.deductionTotal, p.netTotal,
  ]);
  rows.push([
    i18nT('合计'), result.providers.reduce((n, p) => n + p.workOrderCount, 0), result.totals.workOrderAmount,
    ...result.itemNames.map((n) => round2(result.providers.reduce((s, p) => s + (p.items[n] ?? 0), 0))),
    result.totals.incentiveTotal, result.totals.deductionTotal, result.totals.netTotal,
  ]);
  return rows;
}

/**
 * 按服务商过滤一张表（保留原列）。
 * provider 是 computeSettlementSummary 归一后的名字，行里的原始写法（半角括号 / 前导空格）必须同样归一再比，
 * 否则汇总表里有金额、拆分附件里却没这些行（2026-09-04 审查实测 6 家丢 477 行）。
 */
function filterRows(table: SheetTable, providerCol: string, provider: string, aliases?: Record<string, string> | null): SheetTable {
  return { ...table, rows: table.rows.filter((r) => canonicalProvider(r[providerCol], aliases) === provider) };
}

export interface ProviderWorkbookPlan {
  provider: string;
  fileName: string;
  sheets: OutSheet[];
  /** 每个子表多少行（界面预览用） */
  sheetRowCounts: Record<string, number>;
}

/**
 * 按服务商拆分：每家一个 Excel（文件名=服务商名），子表 = 工单结算明细 + 每个费用项（子表名=费用项名）。
 * 没有该服务商数据的费用项不建空表，避免发一堆空 sheet 让服务商误会。
 */
export function planProviderWorkbooks(input: SettlementInput, result: SettlementSummaryResult): ProviderWorkbookPlan[] {
  const plans: ProviderWorkbookPlan[] = [];
  for (const p of result.providers) {
    const sheets: OutSheet[] = [];
    const counts: Record<string, number> = {};
    input.workOrders.forEach((src, i) => {
      if (!src.mapping.provider) return;
      const filtered = filterRows(src.table, src.mapping.provider, p.provider, input.aliases);
      if (!filtered.rows.length) return;
      const name = input.workOrders.length > 1 ? i18nT('工单结算明细{p0}', { p0: i + 1 }) : i18nT('工单结算明细');
      sheets.push(tableToOutSheet(stripInternalColumns(filtered), name));
      counts[name] = filtered.rows.length;
    });
    for (const item of input.feeItems) {
      if (!item.mapping.provider) continue;
      const filtered = filterRows(item.table, item.mapping.provider, p.provider, input.aliases);
      if (!filtered.rows.length) continue;
      const name = item.name.trim() || item.table.fileName;
      sheets.push(tableToOutSheet(stripInternalColumns(filtered), name));
      counts[name] = (counts[name] || 0) + filtered.rows.length;
    }
    // 一张子表都没有（理论上只在过滤与聚合口径不一致时出现）就不建文件：XLSX 写空工作簿会抛 "Workbook is empty"
    if (!sheets.length) continue;
    plans.push({ provider: p.provider, fileName: `${safeFileName(p.provider)}.xlsx`, sheets, sheetRowCounts: counts });
  }
  // 名字只差非法字符（"A/B" 与 "A_B"）会算出同一个文件名，后写的覆盖先写的、两家发同一份附件——加序号区分
  const seen = new Map<string, number>();
  for (const plan of plans) {
    const n = seen.get(plan.fileName) || 0;
    seen.set(plan.fileName, n + 1);
    if (n > 0) plan.fileName = plan.fileName.replace(/\.xlsx$/, `(${n + 1}).xlsx`);
  }
  return plans;
}

// ── 付款跟踪 ──────────────────────────────────────────────────────────────────

export type ReadState = 'unsent' | 'sent' | 'read' | 'replied' | 'failed';

export interface ProviderTrackingRecord {
  period: string;
  provider: string;
  email?: string;
  /** Actual recipients for the current sending round; editing contacts must not change evidence matching. */
  sentRecipients?: string;
  /** 结算应付金额（汇总时写入） */
  netTotal?: number;
  /** 附件（本机路径） */
  attachmentPath?: string;
  sentAt?: string;
  messageId?: string;
  sendError?: string;
  /** 已读打标：回执 / 回信 */
  readAt?: string;
  repliedAt?: string;
  /** v2: exact original ID + recipient + MIME disposition checked. */
  receiptEvidenceVersion?: number;
  readSource?: 'mdn' | 'mailbox';
  /** 本期发过的所有邮件 Message-ID（首发 + 每次重发）：回执 / 回信可能回的是任一封 */
  messageIds?: string[];
  /** 自动跟进：未读 N 天重发 / 已读 N 天催办（同一个 N） */
  resentAt?: string;
  resendCount?: number;
  nudgedAt?: string;
  nudgeCount?: number;
  /** 上次自动跟进尝试时间（成功失败都记）：发不出去（附件丢了、邮箱错）也要等满 N 天再试，不能每 5 分钟报一次 */
  followUpTriedAt?: string;
  /** 发票 */
  invoiceReceivedAt?: string;
  invoiceFiles?: string[];
  /** 费控系统核销流程 */
  writeoffStartedAt?: string;
  /** 核销流程结束时间 = 付款时间 */
  writeoffCompletedAt?: string;
  /** 提醒记录（避免重复提醒） */
  remindedWriteoffAt?: string;
  remindedInvoiceOverdueAt?: string;
  note?: string;
}

export interface TrackingFlags {
  readState: ReadState;
  /** 发票已到 ≥3 天仍未发起核销 */
  writeoffReminderDue: boolean;
  /** 已下发 ≥20 天仍未收到发票 */
  invoiceOverdue: boolean;
  daysSinceSent?: number;
  daysSinceInvoice?: number;
  paid: boolean;
  stage: 'unsent' | 'awaiting_invoice' | 'awaiting_writeoff' | 'writeoff_in_progress' | 'paid';
}

export const WRITEOFF_REMIND_DAYS = 3;
export const INVOICE_OVERDUE_DAYS = 20;
/** 自动重发 / 催办各最多几轮：没有上限就是每 N 天骚扰一次直到天荒地老 */
export const FOLLOW_UP_MAX_ROUNDS = 3;

export interface FollowUpConfig {
  enabled: boolean;
  /** 未读满 N 天自动重发；已读满 N 天未收到发票自动催办。客户要求两件事共用一个天数 */
  days: number;
}
export const DEFAULT_FOLLOW_UP: FollowUpConfig = { enabled: false, days: 3 };

/**
 * 收件人解析：客户一家服务商常有财务 + 老板两个邮箱，一格里用逗号隔开。
 * 中英文逗号 / 分号 / 换行 / 空格都当分隔符；去重、去空、剔掉明显不是邮箱的（无 @）。
 */
export function parseRecipients(raw: string | undefined | null): { valid: string[]; invalid: string[] } {
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const part of String(raw || '').split(/[,，;；\s]+/)) {
    const e = part.trim();
    if (!e) continue;
    const key = e.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) valid.push(e); else invalid.push(e);
  }
  return { valid, invalid };
}
/** 存回去的规范写法：逗号 + 空格 */
export function formatRecipients(raw: string | undefined | null): string {
  const { valid, invalid } = parseRecipients(raw);
  return [...valid, ...invalid].join(', ');
}

export function fillTemplate(tpl: string, vars: Record<string, string | number | undefined>): string {
  return String(tpl || '').replace(/\{([^{}]+)\}/g, (m, key: string) => {
    const v = vars[key.trim()];
    return v == null ? m : String(v);
  });
}

export type FollowUpAction = 'resend' | 'nudge';

/**
 * 这条记录现在该不该自动跟进：
 *   - 已发出、没回执没回信 → 距上次发出（首发或上次重发）满 N 天 → 重发原邮件（`resend`）
 *   - 有回执 / 回信、还没收到发票 → 距已读（或上次催办）满 N 天 → 发催办邮件（`nudge`）
 * 收到发票 / 已付款 / 从未发出的不管；每类最多 FOLLOW_UP_MAX_ROUNDS 轮。
 */
export function followUpDue(rec: ProviderTrackingRecord, days: number, now = Date.now()): FollowUpAction | null {
  if (!rec.sentAt || rec.invoiceReceivedAt || rec.writeoffCompletedAt) return null;
  const n = Math.max(1, Math.round(Number(days) || 0));
  const readAt = latestIso(rec.readAt, rec.repliedAt);
  if (!readAt) {
    if ((rec.resendCount || 0) >= FOLLOW_UP_MAX_ROUNDS) return null;
    const last = latestIso(rec.sentAt, rec.resentAt, rec.followUpTriedAt)!;
    return (daysBetween(last, now) ?? 0) >= n ? 'resend' : null;
  }
  if ((rec.nudgeCount || 0) >= FOLLOW_UP_MAX_ROUNDS) return null;
  const base = latestIso(readAt, rec.nudgedAt, rec.followUpTriedAt)!;
  return (daysBetween(base, now) ?? 0) >= n ? 'nudge' : null;
}

function latestIso(...values: (string | undefined)[]): string | undefined {
  let best: string | undefined;
  for (const v of values) {
    if (!v) continue;
    const t = new Date(v).getTime();
    if (!Number.isFinite(t)) continue;
    if (!best || t > new Date(best).getTime()) best = v;
  }
  return best;
}

const DAY = 24 * 3600 * 1000;
const daysBetween = (from: string | undefined, now: number): number | undefined => {
  if (!from) return undefined;
  const t = Date.parse(from);
  if (!Number.isFinite(t)) return undefined;
  return Math.floor((now - t) / DAY);
};

export function evaluateTracking(rec: ProviderTrackingRecord, now = Date.now()): TrackingFlags {
  const readState: ReadState = rec.repliedAt ? 'replied' : rec.readAt ? 'read' : rec.sentAt ? 'sent' : rec.sendError ? 'failed' : 'unsent';
  const daysSinceSent = daysBetween(rec.sentAt, now);
  const daysSinceInvoice = daysBetween(rec.invoiceReceivedAt, now);
  const paid = Boolean(rec.writeoffCompletedAt);
  const invoiceOverdue = Boolean(rec.sentAt) && !rec.invoiceReceivedAt && (daysSinceSent ?? 0) >= INVOICE_OVERDUE_DAYS;
  const writeoffReminderDue = Boolean(rec.invoiceReceivedAt) && !rec.writeoffStartedAt && (daysSinceInvoice ?? 0) >= WRITEOFF_REMIND_DAYS;
  let stage: TrackingFlags['stage'] = 'unsent';
  if (paid) stage = 'paid';
  else if (rec.writeoffStartedAt) stage = 'writeoff_in_progress';
  else if (rec.invoiceReceivedAt) stage = 'awaiting_writeoff';
  else if (rec.sentAt) stage = 'awaiting_invoice';
  return { readState, writeoffReminderDue, invoiceOverdue, daysSinceSent, daysSinceInvoice, paid, stage };
}

export const TRACKING_HEADERS = [
  i18nT('服务商'), i18nT('结算期'), i18nT('应付合计(元)'), i18nT('邮箱'), i18nT('发送时间'), i18nT('阅读状态'), i18nT('发票接收时间'), i18nT('发票文件数'),
  i18nT('核销发起时间'), i18nT('付款时间(核销结束)'), i18nT('未开票天数'), i18nT('超20天未开票预警'), i18nT('3天未核销提醒'), i18nT('状态'), i18nT('自动跟进'),
];

export function followUpLabel(rec: ProviderTrackingRecord): string {
  const parts: string[] = [];
  if (rec.resendCount) parts.push(i18nT('未读重发 {n} 次', { n: rec.resendCount }));
  if (rec.nudgeCount) parts.push(i18nT('已读催办 {n} 次', { n: rec.nudgeCount }));
  return parts.join(i18nT('、'));
}

export const READ_STATE_LABEL: Record<ReadState, string> = {
  unsent: i18nT('未发送'), sent: i18nT('已发送'), read: i18nT('已读(回执)'), replied: i18nT('已回复'), failed: i18nT('发送失败'),
};
export const STAGE_LABEL: Record<TrackingFlags['stage'], string> = {
  unsent: i18nT('未下发'), awaiting_invoice: i18nT('待开票'), awaiting_writeoff: i18nT('待核销'), writeoff_in_progress: i18nT('核销中'), paid: i18nT('已付款'),
};

export function trackingRow(rec: ProviderTrackingRecord, now = Date.now()): (string | number)[] {
  const f = evaluateTracking(rec, now);
  return [
    rec.provider, rec.period, rec.netTotal ?? '', rec.email || '', rec.sentAt || '', READ_STATE_LABEL[f.readState],
    rec.invoiceReceivedAt || '', rec.invoiceFiles?.length || 0,
    rec.writeoffStartedAt || '', rec.writeoffCompletedAt || '',
    rec.invoiceReceivedAt ? '' : (f.daysSinceSent ?? ''),
    f.invoiceOverdue ? i18nT('⚠ 超20天未开票') : '',
    f.writeoffReminderDue ? i18nT('⚠ 发票已到3天未核销') : '',
    STAGE_LABEL[f.stage],
    followUpLabel(rec),
  ];
}

/** 未完成付款的服务商明细（定期输出） */
export function unpaidRows(records: ProviderTrackingRecord[], now = Date.now()): (string | number)[][] {
  return records
    .filter((r) => !evaluateTracking(r, now).paid)
    .map((r) => trackingRow(r, now));
}

// ── 发票文件命名 ────────────────────────────────────────────────────────────────

/**
 * 发票重命名规则：模板里用 {服务商} {结算期} {序号} {日期} {原文件名} 占位。
 * 默认 `{服务商}_{结算期}_发票{序号}`，扩展名沿用原文件。
 */
export const DEFAULT_INVOICE_NAME_TEMPLATE = '{服务商}_{结算期}_发票{序号}';

export function renderInvoiceFileName(
  template: string,
  ctx: { provider: string; period: string; index: number; date: string; originalName: string },
): string {
  const ext = (ctx.originalName.match(/\.[A-Za-z0-9]{1,6}$/) || [''])[0];
  const stem = ctx.originalName.slice(0, ctx.originalName.length - ext.length);
  const body = (template || DEFAULT_INVOICE_NAME_TEMPLATE)
    .replace(/\{服务商\}/g, ctx.provider)
    .replace(/\{结算期\}/g, ctx.period)
    .replace(/\{序号\}/g, String(ctx.index).padStart(2, '0'))
    .replace(/\{日期\}/g, ctx.date)
    .replace(/\{原文件名\}/g, stem);
  return `${safeFileName(body, 'invoice')}${ext.toLowerCase()}`;
}

export const INVOICE_EXTENSIONS = new Set(['.pdf', '.ofd', '.jpg', '.jpeg', '.png', '.xlsx', '.xls', '.zip']);
