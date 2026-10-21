/**
 * 外贸工作台的纯计算：不碰 electron、不调模型，全部可单测。
 *
 * 钱和数量一律在这里算（报价、汇总、单据核对），模型只负责读资料、找产品、写文字。
 */
import { createHash, randomUUID } from 'node:crypto';
import { t as i18nT } from '@totalclaw/i18n';
import type {
  FtCalcLine, FtCoverageItem, FtEmailLevel, FtFollowupItem, FtFollowupRules, FtGateIssue, FtGateResult, FtIncoterm, FtInquiry,
  FtLead, FtListing, FtListingIssue, FtOrder, FtOrderDoc, FtOrderIssue, FtOrderNode, FtProduct, FtQuoteLine, FtQuoteRules, FtRedFlag,
  FtReportStats, FtScreeningResult, FtSendKind, FtSendRecord, FtSendRules, FtSource, FtSuppression, FtTimelineEntry,
} from '@totalclaw/ipc-contracts';
import type { FtStoredState } from './store';
import type { FetchedMail } from './mailboxes';
import KW from './columnKeywords.json';

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function fmtNum(n: number): string {
  return round2(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** 去标点空白后比较：模型给的依据句要在原文里真的找得到 */
export function normalizeForMatch(s: string): string {
  return String(s || '').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
}

export function quoteFoundIn(corpus: string, quote: string | undefined): boolean {
  const q = normalizeForMatch(quote || '');
  if (q.length < 2) return false;
  return normalizeForMatch(corpus).includes(q);
}

// ─── 收件 → 询盘 ─────────────────────────────────────────────────────────

const INQUIRY_MERGE_DAYS = 30;

/**
 * 新邮件并入状态：已收过的跳过；客户来信按「同一邮件线索 / 同一邮箱同一客户 30 天内未结束的询盘」合并，
 * 否则新建询盘。自动化邮件（通知、营销、退信）和自己邮箱之间的往来不建询盘。
 */
export function ingestMails(
  state: FtStoredState, mails: FetchedMail[], ownAddresses: Set<string>,
): { created: string[]; updated: string[] } {
  const known = new Set(state.messages.map((m) => m.id));
  const created: string[] = [];
  const updated: string[] = [];
  for (const { message, automated } of mails) {
    if (known.has(message.id)) continue;
    known.add(message.id);
    state.messages.push(message);
    if (message.direction !== 'in' || automated) continue;
    const from = message.from.toLowerCase();
    if (!from || ownAddresses.has(from)) continue;
    const byThread = message.inReplyTo
      ? state.inquiries.find((q) => q.messageIds.some((id) => state.messages.find((m) => m.id === id)?.messageId === message.inReplyTo))
      : undefined;
    const cutoff = Date.parse(message.at) - INQUIRY_MERGE_DAYS * 86_400_000;
    const bySender = state.inquiries.find((q) => q.mailboxId === message.mailboxId
      && q.customerEmail === from && !['closed', 'spam'].includes(q.status) && Date.parse(q.receivedAt) >= cutoff);
    const target = byThread || bySender;
    if (target) {
      target.messageIds.push(message.id);
      updated.push(target.id);
      continue;
    }
    const inquiry: FtInquiry = {
      id: newId('inq'),
      mailboxId: message.mailboxId,
      customerEmail: from,
      customerName: message.fromName || from,
      subject: message.subject,
      receivedAt: message.at,
      messageIds: [message.id],
      status: 'new',
      fields: [],
      items: [],
      questions: [],
    };
    state.inquiries.push(inquiry);
    created.push(inquiry.id);
  }
  return { created, updated };
}

/** 询盘的全部原文（正文 + 附件抽出的文字由调用方拼进来） */
export function inquiryMessages(state: FtStoredState, inquiry: FtInquiry) {
  return inquiry.messageIds.map((id) => state.messages.find((m) => m.id === id)).filter(Boolean) as FtStoredState['messages'];
}

// ─── 报价 ────────────────────────────────────────────────────────────────

export interface FxInfo { rate: number; source: string; asOf: string }

/**
 * 报价计算。所有数字都有公式，前端逐行展开。
 * 成本按基础币种算，最后按汇率折成报价币种；单价按货值占比分摊总价。
 */
export function calcQuote(
  inputLines: FtQuoteLine[], rules: FtQuoteRules, incoterm: FtIncoterm, fx: FxInfo, products: FtProduct[],
): { lines: FtQuoteLine[]; calc: FtCalcLine[]; total: number; warnings: string[] } {
  const base = rules.baseCurrency;
  const cur = rules.quoteCurrency;
  const warnings: string[] = [];
  const calc: FtCalcLine[] = [];
  const lines = inputLines.map((l) => ({ ...l, quantity: Math.max(0, Number(l.quantity) || 0), unitCost: Math.max(0, Number(l.unitCost) || 0) }));
  if (!(fx.rate > 0)) throw new Error(i18nT('汇率无效，请检查报价规则'));
  if (!lines.length) throw new Error(i18nT('还没有报价明细'));
  for (const l of lines) {
    if (!l.quantity) warnings.push(i18nT('「{p0}」数量为 0', { p0: l.model || l.requested }));
    if (!l.unitCost) warnings.push(i18nT('「{p0}」没有成本价', { p0: l.model || l.requested }));
    if (l.match !== 'exact') warnings.push(i18nT('「{p0}」没有完全匹配到产品目录，请核对型号', { p0: l.requested || l.model }));
  }

  const goods = lines.reduce((s, l) => s + l.quantity * l.unitCost, 0);
  calc.push({ key: 'goods', label: i18nT('货值（出厂成本）'), formula: lines.map((l) => `${l.quantity} × ${fmtNum(l.unitCost)}`).join(' + '), value: round2(goods), currency: base });
  const packaging = goods * rules.packagingPct / 100;
  calc.push({ key: 'packaging', label: i18nT('包装'), formula: `${fmtNum(goods)} × ${rules.packagingPct}%`, value: round2(packaging), currency: base });
  const inland = incoterm === 'EXW' ? 0 : rules.inlandFreight;
  calc.push({ key: 'inland', label: i18nT('国内运输'), formula: incoterm === 'EXW' ? i18nT('EXW 不含') : i18nT('每票 {p0}', { p0: fmtNum(rules.inlandFreight) }), value: round2(inland), currency: base });

  let cbm = 0;
  let packingKnown = true;
  for (const l of lines) {
    const p = products.find((x) => x.id === l.productId);
    if (p?.pcsPerCarton && p.cartonCbm) cbm += Math.ceil(l.quantity / p.pcsPerCarton) * p.cartonCbm;
    else packingKnown = false;
  }
  let freight = 0;
  if (incoterm === 'CFR' || incoterm === 'CIF') {
    if (!packingKnown) warnings.push(i18nT('部分产品缺少装箱数或箱体积，海运费按已知部分计算，请人工核对'));
    const freightQuote = cbm * rules.oceanFreightPerCbm;
    freight = freightQuote * fx.rate;
    calc.push({ key: 'freight', label: i18nT('海运费'), formula: `${fmtNum(cbm)} CBM × ${fmtNum(rules.oceanFreightPerCbm)} ${cur} × ${fx.rate}`, value: round2(freight), currency: base });
  }
  let insurance = 0;
  if (incoterm === 'CIF') {
    const insured = (goods + packaging + inland + freight) * 1.1;
    insurance = insured * rules.insurancePct / 100;
    calc.push({ key: 'insurance', label: i18nT('保险'), formula: `(${fmtNum(goods + packaging + inland + freight)} × 110%) × ${rules.insurancePct}%`, value: round2(insurance), currency: base });
  }
  const cost = goods + packaging + inland + freight + insurance;
  calc.push({ key: 'cost', label: i18nT('总成本（底价）'), formula: i18nT('以上各项相加'), value: round2(cost), currency: base });
  if (rules.marginPct >= 100 || rules.marginPct < 0) throw new Error(i18nT('目标毛利率应在 0 到 100 之间'));
  const priceBase = cost / (1 - rules.marginPct / 100);
  calc.push({ key: 'price_base', label: i18nT('含毛利报价（基础币种）'), formula: `${fmtNum(cost)} ÷ (1 − ${rules.marginPct}%)`, value: round2(priceBase), currency: base });
  const priceQuote = priceBase / fx.rate;
  calc.push({ key: 'price_quote', label: i18nT('折算报价币种'), formula: `${fmtNum(priceBase)} ÷ ${fx.rate}（${fx.source}，${fx.asOf}）`, value: round2(priceQuote), currency: cur });

  // 按货值占比分摊单价，四舍五入到分，总价用取整后的单价重算（报价单上的数字能对得上）
  let total = 0;
  for (const l of lines) {
    const share = goods > 0 ? (l.quantity * l.unitCost) / goods : 0;
    l.unitPrice = l.quantity > 0 ? round2((priceQuote * share) / l.quantity) : 0;
    l.amount = round2(l.unitPrice * l.quantity);
    total += l.amount;
  }
  total = round2(total);
  calc.push({ key: 'total', label: i18nT('报价总额（{p0}）', { p0: incoterm }), formula: lines.map((l) => `${l.quantity} × ${fmtNum(l.unitPrice || 0)}`).join(' + '), value: total, currency: cur });
  const margin = total > 0 ? (total * fx.rate - cost) / (total * fx.rate) * 100 : 0;
  calc.push({ key: 'margin', label: i18nT('实际毛利率'), formula: `(${fmtNum(total)} × ${fx.rate} − ${fmtNum(cost)}) ÷ (${fmtNum(total)} × ${fx.rate})`, value: round2(margin), currency: '%' });
  return { lines, calc, total, warnings };
}

/** 询盘里的产品 → 产品目录（型号精确命中 → 名称包含 → 没找到），模型匹配失败时的兜底 */
export function matchByRules(requested: { product: string; model?: string; quantity?: string }[], products: FtProduct[]): FtQuoteLine[] {
  return requested.map((r) => {
    const text = `${r.model || ''} ${r.product}`;
    const norm = normalizeForMatch(text);
    const exact = products.find((p) => p.model && norm.includes(normalizeForMatch(p.model)));
    const partial = exact ? undefined : products.find((p) => {
      const n = normalizeForMatch(p.name);
      return n.length >= 3 && (norm.includes(n) || n.includes(normalizeForMatch(r.product)));
    });
    const p = exact || partial;
    return {
      productId: p?.id,
      requested: [r.product, r.model].filter(Boolean).join(' '),
      model: p?.model || r.model || '',
      name: p?.name || r.product,
      quantity: parseQuantity(r.quantity),
      unitCost: p?.unitCost || 0,
      match: exact ? 'exact' : partial ? 'partial' : 'none',
    };
  });
}

export function parseQuantity(raw: string | number | undefined): number {
  if (typeof raw === 'number') return raw;
  const m = String(raw || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(k|千|万)?/i);
  if (!m) return 0;
  let n = Number(m[1]);
  if (/k|千/i.test(m[2] || '')) n *= 1000;
  if (m[2] === '万') n *= 10000;
  return Math.round(n);
}

// ─── 表格导入（产品目录 / 平台商品数据）────────────────────────────────

type KeywordMap = Record<string, string[]>;

/** 表头 → 字段：表头文字包含关键词即认；一个字段只认第一列 */
export function detectColumns(headers: string[], map: KeywordMap): Record<string, string> {
  const out: Record<string, string> = {};
  const used = new Set<string>();
  for (const [field, words] of Object.entries(map)) {
    const hit = headers.find((h) => !used.has(h) && words.some((w) => String(h).toLowerCase().trim() === w.toLowerCase()))
      || headers.find((h) => !used.has(h) && words.some((w) => String(h).toLowerCase().includes(w.toLowerCase())));
    if (hit) { out[field] = hit; used.add(hit); }
  }
  return out;
}

function num(v: unknown): number | undefined {
  const n = Number(String(v ?? '').replace(/[,，\s]/g, '').replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) && String(v ?? '').trim() !== '' ? n : undefined;
}

export function parseProductRows(rows: Record<string, unknown>[]): { products: FtProduct[]; columns: Record<string, string> } {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const cols = detectColumns(headers, (KW as any).product);
  if (!cols.model && !cols.name) throw new Error(i18nT('没找到「型号」或「品名」列，请检查表头'));
  if (!cols.unitCost) throw new Error(i18nT('没找到「出厂价 / 成本 / 单价」列，请检查表头'));
  const products: FtProduct[] = [];
  for (const r of rows) {
    const model = String(r[cols.model] ?? '').trim();
    const name = String(r[cols.name] ?? '').trim();
    const unitCost = num(r[cols.unitCost]);
    if (!model && !name) continue;
    products.push({
      id: newId('prd'),
      model: model || name,
      name: name || model,
      spec: cols.spec ? String(r[cols.spec] ?? '').trim() || undefined : undefined,
      unitCost: unitCost ?? 0,
      moq: cols.moq ? num(r[cols.moq]) : undefined,
      leadTimeDays: cols.leadTimeDays ? num(r[cols.leadTimeDays]) : undefined,
      pcsPerCarton: cols.pcsPerCarton ? num(r[cols.pcsPerCarton]) : undefined,
      cartonCbm: cols.cartonCbm ? num(r[cols.cartonCbm]) : undefined,
      cartonKg: cols.cartonKg ? num(r[cols.cartonKg]) : undefined,
      unitNetKg: cols.unitNetKg ? num(r[cols.unitNetKg]) : undefined,
    });
  }
  return { products, columns: cols };
}

export function parseListingRows(rows: Record<string, unknown>[]): { listings: FtListing[]; columns: Record<string, string> } {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const cols = detectColumns(headers, (KW as any).listing);
  if (!cols.title) throw new Error(i18nT('没找到「标题」列，请检查表头'));
  const listings: FtListing[] = [];
  for (const r of rows) {
    const title = String(r[cols.title] ?? '').trim();
    if (!title) continue;
    const l: FtListing = {
      id: newId('lst'),
      title,
      keywords: cols.keywords ? String(r[cols.keywords] ?? '').split(/[,，;；|\/]+/).map((s) => s.trim()).filter(Boolean) : [],
      category: cols.category ? String(r[cols.category] ?? '').trim() || undefined : undefined,
      images: cols.images ? num(r[cols.images]) : undefined,
      descLength: cols.descLength ? num(r[cols.descLength]) : undefined,
      attributesFilled: cols.attributesFilled ? num(r[cols.attributesFilled]) : undefined,
      attributesTotal: cols.attributesTotal ? num(r[cols.attributesTotal]) : undefined,
      exposure: cols.exposure ? num(r[cols.exposure]) : undefined,
      clicks: cols.clicks ? num(r[cols.clicks]) : undefined,
      inquiries: cols.inquiries ? num(r[cols.inquiries]) : undefined,
      url: cols.url ? String(r[cols.url] ?? '').trim() || undefined : undefined,
      issues: [],
      status: 'pending',
    };
    l.issues = diagnoseListing(l);
    listings.push(l);
  }
  return { listings, columns: cols };
}

// ─── 平台链接诊断（规则固定，结果可复现）────────────────────────────────

export function diagnoseListing(l: FtListing): FtListingIssue[] {
  const out: FtListingIssue[] = [];
  const len = l.title.length;
  if (len < 30) out.push({ rule: 'title_short', level: 'bad', message: i18nT('标题只有 {p0} 个字符，建议 50～128 个，写清产品词、材质、用途、卖点', { p0: len }) });
  else if (len > 128) out.push({ rule: 'title_long', level: 'bad', message: i18nT('标题 {p0} 个字符，超过平台 128 字符上限', { p0: len }) });
  const main = l.keywords[0];
  if (!l.keywords.length) out.push({ rule: 'no_keywords', level: 'bad', message: i18nT('没有设置关键词') });
  else if (main && !normalizeForMatch(l.title).includes(normalizeForMatch(main))) out.push({ rule: 'kw_not_in_title', level: 'warn', message: i18nT('主关键词「{p0}」没有出现在标题里', { p0: main }) });
  out.push(...lintTitle(l.title, l.keywords));
  if (l.images != null && l.images < 6) out.push({ rule: 'images', level: 'warn', message: i18nT('主图 {p0} 张，建议至少 6 张', { p0: l.images }) });
  if (l.descLength != null && l.descLength < 500) out.push({ rule: 'desc', level: 'warn', message: i18nT('详情描述偏短（{p0} 字），建议补充参数、应用场景、包装与认证', { p0: l.descLength }) });
  if (l.attributesFilled != null && l.attributesTotal) {
    const ratio = l.attributesFilled / l.attributesTotal;
    if (ratio < 0.8) out.push({ rule: 'attributes', level: 'warn', message: i18nT('属性只填了 {p0}/{p1}，建议填满', { p0: l.attributesFilled, p1: l.attributesTotal }) });
  }
  if (l.exposure && l.exposure >= 100 && l.clicks != null) {
    const ctr = l.clicks / l.exposure;
    if (ctr < 0.01) out.push({ rule: 'ctr', level: 'warn', message: i18nT('点击率 {p0}%，低于 1%，主图和标题吸引力不够', { p0: round2(ctr * 100) }) });
  }
  if (l.clicks && l.clicks >= 30 && l.inquiries != null) {
    const cvr = l.inquiries / l.clicks;
    if (cvr < 0.02) out.push({ rule: 'cvr', level: 'warn', message: i18nT('点击转询盘 {p0}%，低于 2%，详情页需要加强', { p0: round2(cvr * 100) }) });
  }
  return out;
}

// ─── 客户跟进 ────────────────────────────────────────────────────────────

export function customerTimeline(state: FtStoredState, email: string): FtTimelineEntry[] {
  const e = email.toLowerCase();
  const out: FtTimelineEntry[] = [];
  for (const m of state.messages) {
    if (m.direction === 'in' && m.from === e) out.push({ at: m.at, kind: 'in', subject: m.subject, mailboxId: m.mailboxId, refId: m.id });
    if (m.direction === 'out' && m.to.includes(e)) out.push({ at: m.at, kind: 'out', subject: m.subject, mailboxId: m.mailboxId, refId: m.id });
  }
  for (const q of state.quotes) {
    if (q.customerEmail?.toLowerCase() === e && q.sentAt) out.push({ at: q.sentAt, kind: 'quote', subject: i18nT('报价 {p0} {p1}', { p0: fmtNum(q.total), p1: q.currency }), refId: q.id });
  }
  for (const o of state.orders) {
    if (o.customerEmail?.toLowerCase() === e) out.push({ at: o.createdAt, kind: 'order', subject: i18nT('订单 {p0}', { p0: o.orderNo }), refId: o.id });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * 按规则找出今天该跟进的客户。一个客户只出一条（原因按优先级：询盘未回 > 报价未回 > 沉默）。
 */
export function scanFollowups(state: FtStoredState, rules: FtFollowupRules, now = Date.now()): FtFollowupItem[] {
  const items: FtFollowupItem[] = [];
  const seen = new Set<string>();
  const lastIn = new Map<string, string>();
  const lastOut = new Map<string, string>();
  const lastSubject = new Map<string, string>();
  for (const m of state.messages) {
    if (m.direction === 'in') {
      if (!lastIn.has(m.from) || lastIn.get(m.from)! < m.at) { lastIn.set(m.from, m.at); lastSubject.set(m.from, m.subject); }
    } else {
      for (const to of m.to) if (!lastOut.has(to) || lastOut.get(to)! < m.at) lastOut.set(to, m.at);
    }
  }
  const lastContact = (e: string) => [lastIn.get(e) || '', lastOut.get(e) || ''].sort().pop() || '';

  for (const q of state.inquiries) {
    if (!['new', 'extracted'].includes(q.status) || q.category?.spam) continue;
    const e = q.customerEmail;
    const replied = (lastOut.get(e) || '') > q.receivedAt;
    if (replied) continue;
    if (now - Date.parse(q.receivedAt) < rules.inquiryNoReplyHours * 3_600_000) continue;
    if (seen.has(e)) continue;
    seen.add(e);
    items.push({ key: `inq:${q.id}`, customerEmail: e, customerName: q.customerName, reason: 'inquiry_unanswered', since: q.receivedAt, lastContactAt: lastContact(e), lastSubject: q.subject, mailboxId: q.mailboxId, refId: q.id });
  }
  for (const quote of state.quotes) {
    if (quote.status !== 'sent' || !quote.sentAt || !quote.customerEmail) continue;
    const e = quote.customerEmail.toLowerCase();
    if (seen.has(e)) continue;
    if ((lastIn.get(e) || '') > quote.sentAt) continue;
    if (now - Date.parse(quote.sentAt) < rules.quoteNoReplyDays * 86_400_000) continue;
    seen.add(e);
    items.push({ key: `quote:${quote.id}`, customerEmail: e, customerName: quote.customerName || e, reason: 'quote_no_reply', since: quote.sentAt, lastContactAt: lastContact(e), lastSubject: lastSubject.get(e) || '', mailboxId: quote.mailboxId || '', refId: quote.id });
  }
  const customers = new Map<string, FtInquiry>();
  for (const q of state.inquiries) if (!q.category?.spam && q.status !== 'spam') customers.set(q.customerEmail, q);
  for (const [e, q] of customers) {
    if (seen.has(e)) continue;
    const last = lastContact(e);
    if (!last || now - Date.parse(last) < rules.silentDays * 86_400_000) continue;
    seen.add(e);
    items.push({ key: `silent:${e}`, customerEmail: e, customerName: q.customerName, reason: 'silent', since: last, lastContactAt: last, lastSubject: lastSubject.get(e) || q.subject, mailboxId: q.mailboxId, refId: q.id });
  }
  return items.sort((a, b) => a.since.localeCompare(b.since));
}

// ─── 订单推进 ────────────────────────────────────────────────────────────

export function defaultOrderNodes(): FtOrderNode[] {
  return [
    { key: 'deposit', label: i18nT('PI 确认 / 定金'), done: false },
    { key: 'production', label: i18nT('生产'), done: false },
    { key: 'inspection', label: i18nT('验货'), done: false },
    { key: 'booking', label: i18nT('订舱'), done: false },
    { key: 'shipment', label: i18nT('装运'), done: false },
    { key: 'arrival', label: i18nT('到港'), done: false },
    { key: 'balance', label: i18nT('尾款'), done: false },
  ];
}

export function overdueNodes(order: FtOrder, today: string): FtOrderNode[] {
  return order.nodes.filter((n) => !n.done && n.due && n.due < today);
}

/** 需要跨单据一致的字段 */
export const ORDER_CHECK_FIELDS = ['order_no', 'consignee', 'product_names', 'total_quantity', 'total_amount', 'currency', 'destination'] as const;

function normValue(field: string, v: string): string {
  if (field === 'total_quantity' || field === 'total_amount') {
    const n = num(v);
    return n == null ? normalizeForMatch(v) : String(round2(n));
  }
  if (field === 'product_names') {
    return String(v).split(/[,，;；\n]+/).map(normalizeForMatch).filter(Boolean).sort().join('|');
  }
  return normalizeForMatch(v);
}

/** 单据之间的字段核对：同一字段在两份以上单据里出现且写法不一致，就是一处差异 */
export function compareOrderDocs(docs: FtOrderDoc[]): { issues: FtOrderIssue[]; compared: string[] } {
  const withFields = docs.filter((d) => d.fields && Object.keys(d.fields).length);
  const issues: FtOrderIssue[] = [];
  const compared: string[] = [];
  for (const field of ORDER_CHECK_FIELDS) {
    const values = withFields
      .map((d) => ({ doc: d.name, value: String(d.fields?.[field] ?? '').trim() }))
      .filter((x) => x.value);
    if (values.length < 2) continue;
    compared.push(field);
    const distinct = new Set(values.map((x) => normValue(field, x.value)));
    if (distinct.size > 1) issues.push({ field, values });
  }
  return { issues, compared };
}

// ─── 数据整理 ────────────────────────────────────────────────────────────

function inRange(at: string | undefined, from: string, to: string): boolean {
  if (!at) return false;
  const d = at.slice(0, 10);
  return d >= from && d <= to;
}

export function buildReportStats(state: FtStoredState, from: string, to: string, now = Date.now()): FtReportStats {
  const inq = state.inquiries.filter((q) => inRange(q.receivedAt, from, to));
  const byMailbox: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let spam = 0;
  let replied = 0;
  const replyHours: number[] = [];
  for (const q of inq) {
    const mb = state.mailboxes.find((m) => m.id === q.mailboxId);
    const mbLabel = mb ? (mb.label || mb.address) : q.mailboxId;
    byMailbox[mbLabel] = (byMailbox[mbLabel] || 0) + 1;
    if (q.category?.spam || q.status === 'spam') { spam++; continue; }
    const cat = q.category?.productLine || i18nT('未分类');
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    const firstOut = state.messages
      .filter((m) => m.direction === 'out' && m.to.includes(q.customerEmail) && m.at > q.receivedAt)
      .map((m) => m.at).sort()[0];
    if (firstOut) {
      replied++;
      replyHours.push((Date.parse(firstOut) - Date.parse(q.receivedAt)) / 3_600_000);
    }
  }
  const leads = state.leads.filter((l) => state.prospectBatches.find((b) => b.id === l.batchId && inRange(b.createdAt, from, to)));
  const quotes = state.quotes.filter((q) => inRange(q.createdAt, from, to));
  const amountByCurrency: Record<string, number> = {};
  for (const q of quotes.filter((x) => x.status === 'sent')) amountByCurrency[q.currency] = round2((amountByCurrency[q.currency] || 0) + q.total);
  const today = new Date(now).toISOString().slice(0, 10);
  return {
    from,
    to,
    inquiries: {
      total: inq.length,
      byMailbox,
      byCategory,
      spam,
      replied,
      avgFirstReplyHours: replyHours.length ? round2(replyHours.reduce((a, b) => a + b, 0) / replyHours.length) : null,
    },
    outreach: {
      leads: leads.length,
      drafted: leads.filter((l) => l.letter).length,
      sent: leads.filter((l) => l.status === 'sent').length,
    },
    quotes: {
      count: quotes.length,
      approved: quotes.filter((q) => q.status !== 'draft').length,
      sent: quotes.filter((q) => q.status === 'sent').length,
      amountByCurrency,
    },
    orders: {
      active: state.orders.filter((o) => o.status === 'active').length,
      done: state.orders.filter((o) => o.status === 'done' && inRange(o.createdAt, from, to)).length,
      overdueNodes: state.orders.reduce((s, o) => s + (o.status === 'active' ? overdueNodes(o, today).length : 0), 0),
    },
    followups: { due: scanFollowups(state, state.settings.followupRules, now).length },
    mails: {
      received: state.messages.filter((m) => m.direction === 'in' && inRange(m.at, from, to)).length,
      sent: state.messages.filter((m) => m.direction === 'out' && inRange(m.at, from, to)).length,
    },
  };
}

/** 报表的表格行（导出 Excel 用），数字全部来自 stats，不经模型 */
export function reportRows(s: FtReportStats): Array<[string, string | number]> {
  const rows: Array<[string, string | number]> = [
    [i18nT('统计区间'), `${s.from} ~ ${s.to}`],
    [i18nT('新询盘'), s.inquiries.total],
    [i18nT('其中垃圾询盘'), s.inquiries.spam],
    [i18nT('已回复询盘'), s.inquiries.replied],
    [i18nT('平均首次回复（小时）'), s.inquiries.avgFirstReplyHours ?? '—'],
    [i18nT('收到邮件'), s.mails.received],
    [i18nT('发出邮件'), s.mails.sent],
    [i18nT('新增潜客'), s.outreach.leads],
    [i18nT('开发信已发'), s.outreach.sent],
    [i18nT('报价单数'), s.quotes.count],
    [i18nT('已发报价'), s.quotes.sent],
    [i18nT('进行中订单'), s.orders.active],
    [i18nT('逾期节点'), s.orders.overdueNodes],
    [i18nT('待跟进客户'), s.followups.due],
  ];
  for (const [k, v] of Object.entries(s.quotes.amountByCurrency)) rows.push([i18nT('已发报价金额（{p0}）', { p0: k }), v]);
  for (const [k, v] of Object.entries(s.inquiries.byMailbox)) rows.push([i18nT('询盘 · {p0}', { p0: k }), v]);
  for (const [k, v] of Object.entries(s.inquiries.byCategory)) rows.push([i18nT('产品线 · {p0}', { p0: k }), v]);
  return rows;
}

export function hashKey(s: string): string {
  return createHash('sha1').update(s).digest('hex').slice(0, 12);
}

// ─── 平台标题 lint ───────────────────────────────────────────────────────
// 检查项借鉴 heqiangdiao-wq/AI-Cross-Border-Ecommerce-Agent-Toolkit 的
// Agents/03_Listing_Creative_Agent/scripts/title_lint.py（MIT），阈值改成 B2B 平台英文标题的口径。

/** 极限词 / 促销词（平台禁用或降权；英文标题里的原文匹配模式） */
const TITLE_EXTREME = ['best', 'no.1', 'no. 1', 'number one', '#1', 'top 1', 'cheapest', 'lowest price', 'world-class', 'first-class', '100%', 'guaranteed'];
const TITLE_PROMO = ['free shipping', 'hot sale', 'on sale', 'promotion', 'discount', 'clearance', 'limited time'];
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const CJK_RE = /[぀-ヿ㐀-鿿가-힯]/;

export function lintTitle(title: string, keywords: string[] = []): FtListingIssue[] {
  const out: FtListingIssue[] = [];
  const t = String(title || '').trim();
  const lower = t.toLowerCase();
  const wordHit = (w: string) => (/^[a-z]/.test(w) ? new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z])`).test(lower) : lower.includes(w));
  const extreme = TITLE_EXTREME.filter(wordHit);
  if (extreme.length) out.push({ rule: 'title_extreme', level: 'bad', message: i18nT('标题含极限用语：{p0}（平台禁用，可能被下架）', { p0: extreme.join(', ') }) });
  const promo = TITLE_PROMO.filter(wordHit);
  if (promo.length) out.push({ rule: 'title_promo', level: 'warn', message: i18nT('标题含促销词：{p0}（促销信息放到图片或详情里）', { p0: promo.join(', ') }) });
  if (EMOJI_RE.test(t)) out.push({ rule: 'title_emoji', level: 'bad', message: i18nT('标题里有表情符号') });
  if (CJK_RE.test(t)) out.push({ rule: 'title_cjk', level: 'bad', message: i18nT('英文平台的标题里混入了中文') });
  const caps = (t.match(/[A-Za-z]{4,}/g) || []).filter((w) => w === w.toUpperCase());
  if (caps.length) out.push({ rule: 'title_caps', level: 'warn', message: i18nT('全大写单词：{p0}（品牌缩写以外不要全大写）', { p0: caps.slice(0, 5).join(', ') }) });
  const words = (lower.match(/[a-z0-9]+/g) || []).filter((w) => w.length > 2);
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);
  const dup = [...counts].filter(([, n]) => n >= 3).map(([w]) => w);
  if (dup.length) out.push({ rule: 'title_dup', level: 'bad', message: i18nT('重复 3 次以上的词：{p0}（关键词堆砌会降权）', { p0: dup.join(', ') }) });
  const main = keywords[0];
  if (main) {
    const at = normalizeForMatch(t).indexOf(normalizeForMatch(main));
    if (at > normalizeForMatch(t.slice(0, 30)).length) out.push({ rule: 'kw_late', level: 'warn', message: i18nT('主关键词「{p0}」不在标题前 30 个字符里', { p0: main }) });
  }
  return out;
}

// ─── 发信闸门 ────────────────────────────────────────────────────────────
// 每封对外邮件（开发信、跟进、询盘回复、自动回复、报价邮件）发出前都过 checkOutgoing。纯函数，不调模型：
// 提示词只能约束模型「尽量别写」，这里是代码层面的「写了就不许发」。规则来源（均为 MIT）：
//   ethanplusai/harvey            harvey/gate.py（禁用词与 AI 腔、未替换变量、长度、链接数、HTML）、
//                                 harvey/agents/handler.py（退订短语优先于模型判断、退信率超阈值停发）
//   Xuxchloris/Alex               integrations/hermes/outreach.py（每日额度、发前再查一次线程已回复就停、结果不确定不自动重试）
//   xiongQvQ/-b2b-lead-hunter-skill scripts/evaluate_outreach_drafts.py（退订句、感叹号、垃圾词）、
//                                 scripts/send_smtp.py（发出内容必须与审批时 hash 一致、抑制名单按邮箱 / 域名）
//   Kandid-ai/AgentSDR            src/lib/crm/defaults.ts（「勿联系」必须压制一切外联）

const SPAM_PHRASES = [
  'act now', 'buy now', 'click here', 'click below', 'limited time', 'limited offer', 'exclusive deal', 'special offer',
  'risk-free', 'risk free', 'no obligation', '100% free', 'make money', 'double your', 'guaranteed results', 'winner',
  'congratulations', 'best price', 'cheapest', 'lowest price', 'urgent', 'free quote', 'dear sir/madam', 'to whom it may concern',
];
/** AI 腔与模型自曝（模型输出里的原文匹配模式，不是界面文案）i18n-ignore */
const AI_TELLS = [
  'i hope this finds you well', 'hope this email finds you well', 'i hope this email finds you', 'picture this',
  'what if i told you', "in today's fast-paced world", 'game-changer', 'game changer', 'cutting-edge solution',
  'revolutionize your', 'unlock your', 'supercharge your', 'as an ai', "i'm an ai", 'i am an ai', 'as a language model',
  '作为一个ai', '作为ai', '作为人工智能', '作为一个人工智能', '我是一个ai', '作为一个语言模型', '作为语言模型',
];
const MERGE_TAG_RE = /\{\{\s*[^{}\n]{1,40}?\s*\}\}|\{\s*[\p{L}_][\p{L}\p{N}_ ]{0,30}\s*\}/gu;
/** 方括号占位（模型写不出时留的 [请补充] / [Your Name] 之类）的识别词 i18n-ignore */
const PLACEHOLDER_WORD_RE = /请补充|补充|待填|待定|占位|公司名|客户名|姓名|名字|名称|your|insert|placeholder|name|company|tbd|todo|xxx/i;
const BRACKET_RE = /\[[^\]\n]{1,40}\]|【[^】\n]{1,40}】/g;
const BARE_TODO_RE = /\b(XXX+|TBD|TODO)\b/;
const URL_RE = /https?:\/\/[^\s<>"')\]]+|www\.[^\s<>"')\]]+/gi;
const HTML_RE = /<\s*(html|body|div|table|img|a|p|br|span)\b/i;
/** 正文里的退订句（我方写的）识别模式 i18n-ignore */
const OPT_OUT_LINE_RE = /unsubscribe|opt[\s-]?out|not interested|no longer (wish|want)|(won'?t|will not|never) (email|contact|write)|reply\s+["“'«]?(stop|remove|no)\b|let me know.{0,60}(stop|remove|not)|退订|不再(联系|打扰|发送|来信)|回复.{0,8}(退订|不需要|停止)/i;
const EMAIL_FORMAT = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export interface FtOutgoingDraft {
  kind: FtSendKind;
  mailboxId: string;
  to: string[];
  subject: string;
  body: string;
  refId?: string;
}

export interface FtGateContext {
  rules: FtSendRules;
  suppressions: FtSuppression[];
  sendLog: FtSendRecord[];
  now: number;
  /** 发送时带上审批（点「确认发送」那一刻）的摘要；不一致就拦 */
  approvedHash?: string;
  /** 对方在参照时点之后来过信：跟进 / 开发信停发 */
  repliedAt?: string;
  /** 我方在对方来信之后已经回过：自动回复停发，人工回复提醒 */
  answeredAt?: string;
  /** 开发信：潜客官网域名（收件邮箱不是这个域名的，按 E3 提醒） */
  websiteHost?: string;
}

/** 冷触达（开发信 / 跟进）规则更严：超限即拦；回复类只提醒 */
const isCold = (k: FtSendKind) => k === 'outreach' || k === 'followup';

export function localDay(iso: string | number): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 词数：拉丁 / 西里尔 / 阿拉伯文按空白分词，中日韩按两个字一个词 */
export function countWords(text: string): number {
  const latin = (String(text).match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []).filter((w) => !CJK_RE.test(w)).length;
  const cjk = (String(text).match(/[぀-ヿ㐀-鿿가-힯]/g) || []).length;
  return latin + Math.ceil(cjk / 2);
}

/** 审批摘要：发件邮箱 + 类型 + 收件人 + 标题 + 正文，任何一处改动都会变 */
export function hashOutgoing(d: FtOutgoingDraft): string {
  const to = [...new Set(d.to.map((x) => x.trim().toLowerCase()))].sort().join(',');
  return createHash('sha256').update([d.kind, d.mailboxId, to, d.subject, d.body].join('\n')).digest('hex');
}

export function emailDomainOf(email: string): string {
  return String(email || '').split('@')[1]?.trim().toLowerCase() || '';
}

export function findSuppression(list: FtSuppression[], email: string): FtSuppression | undefined {
  const e = email.trim().toLowerCase();
  const d = emailDomainOf(e);
  return list.find((x) => (x.email && x.email === e) || (x.domain && (d === x.domain || d.endsWith(`.${x.domain}`))));
}

export function sentTodayCount(log: FtSendRecord[], mailboxId: string, now: number): number {
  const today = localDay(now);
  return log.filter((r) => r.mailboxId === mailboxId && r.status === 'sent' && localDay(r.at) === today).reduce((n, r) => n + r.to.length, 0);
}

export function checkOutgoing(draft: FtOutgoingDraft, ctx: FtGateContext): FtGateResult {
  const issues: FtGateIssue[] = [];
  const block = (rule: string, message: string) => issues.push({ rule, level: 'block', message });
  const warn = (rule: string, message: string) => issues.push({ rule, level: 'warn', message });
  const r = ctx.rules;
  const cold = isCold(draft.kind);
  const to = draft.to.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean);
  const subject = String(draft.subject || '').trim();
  const body = String(draft.body || '').trim();
  const text = `${subject}\n${body}`;
  const lower = text.toLowerCase();

  // 收件人
  if (!to.length) block('no_recipient', i18nT('没有收件人'));
  const bad = to.filter((e) => !EMAIL_FORMAT.test(e));
  if (bad.length) block('bad_recipient', i18nT('收件人地址格式不对：{p0}', { p0: bad.join(', ') }));
  for (const e of to) {
    const hit = findSuppression(ctx.suppressions, e);
    if (hit) block('suppressed', i18nT('{p0} 在抑制名单里（{p1}），不能再发', { p0: e, p1: hit.reason }));
  }
  if (draft.kind === 'outreach' && ctx.websiteHost) {
    const site = ctx.websiteHost.replace(/^www\./, '').toLowerCase();
    const off = to.filter((e) => { const d = emailDomainOf(e); return d && d !== site && !d.endsWith(`.${site}`) && !site.endsWith(`.${d}`); });
    if (off.length) warn('email_domain', i18nT('收件邮箱和对方官网不是同一个域名（{p0}），可能是代理或信息不一致，发前请核实', { p0: off.join(', ') }));
  }

  // 内容
  if (!subject) block('empty_subject', i18nT('标题是空的'));
  if (!body) block('empty_body', i18nT('正文是空的'));
  const tags = new Set<string>([...(text.match(MERGE_TAG_RE) || []), ...(text.match(BRACKET_RE) || []).filter((x) => PLACEHOLDER_WORD_RE.test(x))]);
  const bare = text.match(BARE_TODO_RE);
  if (bare) tags.add(bare[0]);
  if (tags.size) block('placeholder', i18nT('还有没替换的占位：{p0}', { p0: [...tags].slice(0, 4).join(' ') }));
  const tells = AI_TELLS.filter((p) => lower.includes(p));
  if (tells.length) block('ai_tell', i18nT('有 AI 腔或模型自曝的句子：{p0}', { p0: tells.slice(0, 3).join(' / ') }));
  const banned = [...SPAM_PHRASES, ...(r.extraBanned || []).map((x) => x.trim().toLowerCase()).filter(Boolean)].filter((p) => lower.includes(p));
  if (banned.length) (cold ? block : warn)('banned', i18nT('有容易进垃圾箱的词：{p0}', { p0: [...new Set(banned)].slice(0, 4).join(' / ') }));
  if (subject.length > r.maxSubjectLen) (cold ? block : warn)('subject_long', i18nT('标题 {a} 个字符，超过 {b}', { a: subject.length, b: r.maxSubjectLen }));
  const words = countWords(body);
  if (cold && words > r.maxBodyWords) block('body_long', i18nT('正文约 {a} 词，超过 {b} 词', { a: words, b: r.maxBodyWords }));
  else if (!cold && words > r.maxBodyWords * 2) warn('body_long', i18nT('正文约 {a} 词，偏长', { a: words }));
  const links = body.match(URL_RE) || [];
  if (cold && links.length > r.maxLinks) block('links', i18nT('正文有 {a} 个链接，开发信 / 跟进最多 {b} 个', { a: links.length, b: r.maxLinks }));
  else if (!cold && links.length > 3) warn('links', i18nT('正文有 {a} 个链接', { a: links.length }));
  if (HTML_RE.test(body)) warn('html', i18nT('正文里有 HTML 标签，邮件按纯文本发出，标签会原样显示'));
  if (cold && (subject.includes('!') || (body.match(/!/g) || []).length > 1)) warn('exclaim', i18nT('感叹号偏多，B2B 邮件语气宜平实'));
  if (draft.kind === 'outreach' && r.requireOptOut && !OPT_OUT_LINE_RE.test(body)) block('no_opt_out', i18nT('开发信缺少退订句（告诉对方不想再收可以回复退订）'));

  // 额度与退信
  const sentToday = sentTodayCount(ctx.sendLog, draft.mailboxId, ctx.now);
  if (sentToday + to.length > r.dailyLimit) block('daily_limit', i18nT('这个邮箱今天已发 {a} 封，每日上限 {b} 封', { a: sentToday, b: r.dailyLimit }));
  if (draft.kind === 'outreach') {
    const since = ctx.now - 30 * 86_400_000;
    const sent30 = ctx.sendLog.filter((x) => x.mailboxId === draft.mailboxId && x.status === 'sent' && Date.parse(x.at) >= since).reduce((n, x) => n + x.to.length, 0);
    const bounced30 = ctx.suppressions.filter((x) => x.source === 'bounce' && x.mailboxId === draft.mailboxId && Date.parse(x.at) >= since).length;
    if (sent30 >= 10 && bounced30 / sent30 > r.maxBounceRate) {
      block('bounce_rate', i18nT('这个邮箱近 30 天退信 {a} / {b} 封，超过 {c}%，开发信已停发，先清理名单', { a: bounced30, b: sent30, c: Math.round(r.maxBounceRate * 100) }));
    }
  }

  // 审批与线程
  const hash = hashOutgoing({ ...draft, to, subject: draft.subject, body: draft.body });
  if (ctx.approvedHash && ctx.approvedHash !== hash) block('changed', i18nT('内容在确认之后被改过，请重新检查后再发'));
  if (ctx.repliedAt && (cold || draft.kind === 'auto_reply')) block('replied', i18nT('对方 {p0} 已经来信，先看回信再决定，不再按原计划发', { p0: ctx.repliedAt.slice(0, 16).replace('T', ' ') }));
  if (ctx.answeredAt) {
    if (draft.kind === 'auto_reply') block('answered', i18nT('业务员已经回复过'));
    else warn('answered', i18nT('{p0} 已经有人回过这位客户，确认不是重复回复', { p0: ctx.answeredAt.slice(0, 16).replace('T', ' ') }));
  }
  return { ok: !issues.some((i) => i.level === 'block'), issues, hash, sentToday, dailyLimit: r.dailyLimit };
}

export function gateMessage(res: FtGateResult): string {
  return i18nT('发送被拦下：{p0}', { p0: res.issues.filter((i) => i.level === 'block').map((i) => i.message).join('；') });
}

/** 发送账本：只留最近 5000 条 */
export function recordSend(log: FtSendRecord[], rec: Omit<FtSendRecord, 'id'>): FtSendRecord {
  const full = { id: newId('snd'), ...rec };
  log.unshift(full);
  if (log.length > 5000) log.splice(5000);
  return full;
}

// ─── 退订 / 退信：自动进抑制名单 ─────────────────────────────────────────

/** 对方要求不再联系（硬编码短语优先于模型分类；来信原文匹配模式，不是界面文案）i18n-ignore */
export const OPT_OUT_PATTERNS = [
  'unsubscribe', 'opt out', 'opt-out', 'remove me', 'take me off', 'stop emailing', 'stop contacting', 'stop sending',
  'do not contact', 'do not email', "don't contact", "don't email", 'never contact', 'delete my info', 'delete my data',
  '退订', '不要再发', '别再发', '请勿再', '不要再联系', '别再联系', '取消订阅', '不再需要你们的邮件',
];
const BOUNCE_FROM_RE = /^(mailer-daemon|postmaster|mail-daemon|mailerdaemon)@/i;
/** 退信标题（邮件服务器原文匹配模式）i18n-ignore */
const BOUNCE_SUBJECT_RE = /undeliver|delivery status notification|delivery failure|mail delivery failed|returned mail|failure notice|delivery has failed|could not be delivered|退信|投递失败|无法投递|未能送达|发送失败|系统退信/i;
/** 回信里被引用的旧内容从这里开始（客户端原文）i18n-ignore */
const QUOTE_START_RE = /^(on .{3,80}wrote:|-{2,}\s*original message\s*-{2,}|from:\s|发件人[:：]|在.{2,40}写道[:：]|-{2,}\s*原始邮件\s*-{2,})/im;

/** 只看对方自己写的那段（去掉 > 引用和「On … wrote:」之后的旧邮件），避免把我方退订句当成对方的要求 */
export function ownText(body: string): string {
  const cut = String(body || '').split(QUOTE_START_RE)[0];
  return cut.split('\n').filter((l) => !/^\s*>/.test(l)).join('\n').slice(0, 1500);
}

export function wantsOptOut(body: string): boolean {
  const t = ownText(body).toLowerCase();
  return OPT_OUT_PATTERNS.some((p) => t.includes(p));
}

export function isBounce(from: string, subject: string): boolean {
  return BOUNCE_FROM_RE.test(from) || BOUNCE_SUBJECT_RE.test(subject);
}

/** 退信里退回的收件人：优先 Final-Recipient，否则取正文里我们发过的地址 */
export function bouncedRecipients(body: string, sentTo: Set<string>): string[] {
  const finals = [...String(body).matchAll(/(?:final|original)-recipient:\s*rfc822;\s*<?([^\s<>;]+@[^\s<>;]+)>?/gi)].map((m) => m[1].toLowerCase());
  if (finals.length) return [...new Set(finals)];
  const all = (String(body).match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []).map((e) => e.toLowerCase());
  return [...new Set(all.filter((e) => sentTo.has(e)))];
}

/**
 * 新收的邮件里找退订与退信，写进抑制名单（已在名单里的不重复加）。返回新加的条目。
 * 退订：对方自己写的话里出现退订短语；退信：邮件服务器退回，收件人进名单并记在发件邮箱名下（算退信率用）。
 */
export function applyOptOuts(state: FtStoredState, mails: FetchedMail[], ownAddresses: Set<string>, now = new Date().toISOString()): FtSuppression[] {
  const added: FtSuppression[] = [];
  const sentTo = new Set<string>();
  for (const m of state.messages) if (m.direction === 'out') for (const t of m.to) sentTo.add(t);
  for (const r of state.sendLog) for (const t of r.to) sentTo.add(t);
  const add = (email: string, source: FtSuppression['source'], reason: string, mailboxId: string, refId: string) => {
    if (!email || ownAddresses.has(email) || findSuppression(state.suppressions, email)) return;
    const s: FtSuppression = { id: newId('sup'), email, reason, source, at: now, mailboxId, refId };
    state.suppressions.unshift(s);
    added.push(s);
  };
  for (const { message: m } of mails) {
    if (m.direction !== 'in') continue;
    if (isBounce(m.from, m.subject)) {
      for (const e of bouncedRecipients(m.body, sentTo)) add(e, 'bounce', i18nT('退信：{p0}', { p0: m.subject.slice(0, 60) }), m.mailboxId, m.id);
      continue;
    }
    if (m.from && !ownAddresses.has(m.from) && wantsOptOut(m.body)) add(m.from, 'unsubscribe', i18nT('对方来信要求不再联系（{p0}）', { p0: localDay(m.at) }), m.mailboxId, m.id);
  }
  return added;
}

// ─── 客户打分：模型初判、代码复算（邮箱可触达性 E1–E4）────────────────────
// 公式与分级照搬 Dangooy/tianji-skills market-intel 的 references/scoring-rubric.md 与 scripts/build_report.py（MIT）：
// 模型只报特征和初判分，分数和档位由这里按固定公式重算，可复现、可审计。

const PURCHASING_LOCAL = /^(purchas|procure|buying|buyer|supply|supplies|sourcing|import)/i;
const GENERIC_LOCAL = /^(info|sales|office|contact|hello|enquir|inquir|admin|mail|service|support|export|marketing|general|team|webmaster|customer)/i;
export const FREE_MAIL = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'aol.com', 'icloud.com', 'qq.com', '163.com', '126.com',
  'mail.ru', 'yandex.ru', 'yandex.com', 'gmx.com', 'gmx.de', 'web.de', 'protonmail.com', 'foxmail.com', 'sina.com', 'msn.com', 'yahoo.co.uk', 'rediffmail.com',
]);

export function emailLevel(email: string, websiteHost?: string, mx?: boolean): FtEmailLevel {
  const e = String(email || '').trim().toLowerCase();
  if (!EMAIL_FORMAT.test(e)) return 'E4';
  if (mx === false) return 'E4';
  const d = emailDomainOf(e);
  const site = String(websiteHost || '').replace(/^www\./, '').toLowerCase();
  if (site && d !== site && !d.endsWith(`.${site}`) && !site.endsWith(`.${d}`)) return 'E3';
  const local = e.split('@')[0];
  if (PURCHASING_LOCAL.test(local)) return 'E1';
  if (GENERIC_LOCAL.test(local)) return 'E2';
  // 具名：像 j.smith / john.doe / anna 这样的人名邮箱
  return /^[a-z][a-z'-]*([._-][a-z][a-z'-]*)?$/.test(local) ? 'E1' : 'E2';
}

const LEVEL_WEIGHT: Record<FtEmailLevel, number> = { E1: 1, E2: 0.7, E3: 0.3, E4: 0 };

export function bestEmailLevel(emails: string[], websiteHost?: string, mx?: Record<string, boolean | undefined>): FtEmailLevel {
  const levels = emails.map((e) => emailLevel(e, websiteHost, mx?.[emailDomainOf(e)]));
  return levels.sort()[0] || 'E4';
}

/** 决策人分层只按邮箱复算（具名 1.0 / 采购职能 0.6 / 通用 0.3 / 无 0），模型说的「页面上有某某经理」不计分 */
export function decisionMakerScore(emails: string[], websiteHost?: string): number {
  let best = 0;
  for (const e of emails) {
    const lv = emailLevel(e, websiteHost);
    if (lv === 'E3' || lv === 'E4') continue;
    const local = e.split('@')[0].toLowerCase();
    const v = PURCHASING_LOCAL.test(local) ? 0.6 : GENERIC_LOCAL.test(local) ? 0.3 : 1;
    best = Math.max(best, v);
  }
  return best;
}

export interface FtLeadFeatures {
  emails: string[];
  websiteHost?: string;
  mx?: Record<string, boolean | undefined>;
  /** 独立证据数（检索结果 / 首页 / 联系页） */
  evidence: number;
  /** 模型自报的规模匹配（0～1，代码无法复核，只截断） */
  scale: number;
  flags: string[];
  critical: string[];
}

export function recomputeLeadScore(f: FtLeadFeatures): { score: number; tier: 'A' | 'B' | 'C'; level: FtEmailLevel; detail: NonNullable<FtLead['scoreDetail']> } {
  const level = bestEmailLevel(f.emails, f.websiteHost, f.mx);
  const email = LEVEL_WEIGHT[level];
  const sources = Math.min(Math.max(f.evidence, 0), 3) / 3;
  const dm = decisionMakerScore(f.emails, f.websiteHost);
  const scale = Math.max(0, Math.min(1, Number(f.scale) || 0));
  const penalty = Math.min(0.2, 0.1 * f.flags.length);
  const critical = [...f.critical];
  if (f.emails.length && level === 'E3') critical.push(i18nT('邮箱域名与官网不符'));
  const raw = 0.4 * email + 0.25 * sources + 0.2 * dm + 0.15 * scale - penalty;
  const recomputable = 0.4 * email + 0.25 * sources + 0.2 * dm - penalty;
  const score = Math.round(Math.max(0, Math.min(1, raw)) * 100);
  let tier: 'A' | 'B' | 'C';
  if (score < 50 || f.evidence <= 1 || level === 'E4') tier = 'C';
  else if (score >= 75 && recomputable >= 0.75 && (level === 'E1' || level === 'E2') && f.evidence >= 2 && !critical.length) tier = 'A';
  else tier = 'B';
  return {
    score, tier, level,
    detail: { email, sources: round2(sources), decisionMaker: dm, scale, penalty: round2(penalty), recomputable: round2(recomputable), flags: f.flags, critical },
  };
}

// ─── 背调：覆盖面状态与确定性红旗 ─────────────────────────────────────────
// 覆盖面「查到 / 查过没有 / 没查」三态借鉴 superleads 的思想（自己重写）；红旗口径借鉴
// chefroger/smart-trade-ai trade/osint/scoring.py 的思路与 Dangooy/tianji-skills 的 critical / minor 分档。

export interface FtBackgroundSignals {
  email?: string;
  website?: string;
  sources: FtSource[];
  /** 域名注册时间：ISO = 查到；null = 查过但没拿到；undefined = 没查 */
  domainCreated?: string | null;
  /** 邮箱域名的收信服务器：true / false = 查过；undefined = 没查 */
  mx?: boolean;
  screening?: FtScreeningResult;
  now?: number;
}

export function backgroundChecks(sig: FtBackgroundSignals): { coverage: FtCoverageItem[]; flags: FtRedFlag[] } {
  const now = sig.now ?? Date.now();
  const coverage: FtCoverageItem[] = [];
  const flags: FtRedFlag[] = [];
  const site = sig.website ? hostOfUrl(sig.website) : '';
  const official = sig.sources.find((s) => site && hostOfUrl(s.url) === site);
  if (!site) coverage.push({ area: 'website', status: 'not_checked', note: i18nT('没有官网地址') });
  else if (official?.textLength) coverage.push({ area: 'website', status: 'found', note: site });
  else if (official?.fetchError || official?.textLength === 0) coverage.push({ area: 'website', status: 'checked_none', note: official.fetchError || i18nT('官网没读到内容') });
  else coverage.push({ area: 'website', status: 'not_checked' });
  const others = sig.sources.filter((s) => s !== official);
  coverage.push(others.length ? { area: 'search', status: 'found', note: i18nT('{n} 个公开来源', { n: others.length }) } : { area: 'search', status: 'checked_none' });
  if (sig.sources.length && sig.sources.every((s) => !s.textLength) && sig.sources.some((s) => s.textLength === 0 || s.fetchError)) {
    flags.push({ rule: 'no_footprint', level: 'critical', message: i18nT('公开网页一个都没读到，查不到这家公司的任何内容') });
  }
  if (site && sig.website && /^http:\/\//i.test(sig.website)) flags.push({ rule: 'no_https', level: 'minor', message: i18nT('官网没有 HTTPS') });

  const ed = emailDomainOf(sig.email || '');
  if (!ed) coverage.push({ area: 'email_domain', status: 'not_checked' });
  else if (FREE_MAIL.has(ed)) {
    coverage.push({ area: 'email_domain', status: 'found', note: ed });
    flags.push({ rule: 'free_mail', level: 'minor', message: i18nT('只用免费邮箱（{p0}），看不出公司域名', { p0: ed }) });
  } else if (site && ed !== site && !ed.endsWith(`.${site}`) && !site.endsWith(`.${ed}`)) {
    coverage.push({ area: 'email_domain', status: 'found', note: ed });
    flags.push({ rule: 'domain_mismatch', level: 'critical', message: i18nT('邮箱域名 {a} 和官网 {b} 对不上', { a: ed, b: site }) });
  } else coverage.push({ area: 'email_domain', status: 'found', note: ed });

  if (sig.domainCreated === undefined) coverage.push({ area: 'domain_age', status: 'not_checked' });
  else if (sig.domainCreated === null) coverage.push({ area: 'domain_age', status: 'checked_none', note: i18nT('注册信息查不到') });
  else {
    const days = Math.floor((now - Date.parse(sig.domainCreated)) / 86_400_000);
    coverage.push({ area: 'domain_age', status: 'found', note: i18nT('{p0} 注册', { p0: sig.domainCreated.slice(0, 10) }) });
    if (days < 365) flags.push({ rule: 'young_domain', level: 'minor', message: i18nT('域名注册不满 1 年（{p0}）', { p0: sig.domainCreated.slice(0, 10) }) });
  }

  if (sig.mx === undefined) coverage.push({ area: 'mail_server', status: 'not_checked' });
  else if (sig.mx) coverage.push({ area: 'mail_server', status: 'found' });
  else {
    coverage.push({ area: 'mail_server', status: 'checked_none' });
    flags.push({ rule: 'no_mx', level: 'critical', message: i18nT('邮箱域名没有收信服务器（MX），这个邮箱收不到信') });
  }

  const sc = sig.screening;
  if (!sc) coverage.push({ area: 'screening', status: 'not_checked' });
  else if (sc.level === 'clear') coverage.push({ area: 'screening', status: 'checked_none', note: i18nT('{n} 份名单未命中', { n: sc.lists.length }) });
  else {
    coverage.push({ area: 'screening', status: 'found', note: i18nT('{n} 条疑似', { n: sc.matches.length }) });
    flags.push(sc.level === 'high'
      ? { rule: 'screening_high', level: 'critical', message: i18nT('交易对手名单高度疑似命中：{p0}', { p0: sc.matches[0]?.name || '' }) }
      : { rule: 'screening_review', level: 'minor', message: i18nT('交易对手名单有待查的相近名字：{p0}', { p0: sc.matches[0]?.name || '' }) });
  }
  return { coverage, flags };
}

function hostOfUrl(url: string): string {
  try { return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
}
