/**
 * 票据识别（纯函数）：发票 / 电子客票 / 银行回单的文字 → 结构化字段 → 校验。
 *
 * 先按版式规则读（数电票、老版专普票、铁路电子客票、航空行程单、银行回单的固定标签），
 * 规则读不到的字段才交给模型补，模型补的值必须能在原文里找到（见 ipc 层）。
 * 校验全部是确定性的：金额 + 税额 = 价税合计、税额 ≈ 金额 × 税率、税号校验位、
 * 抬头是不是本公司、重复票、日期、普票不能抵扣。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { FaCheck, FaDoc, FaDocItem, FaDocKind, FaDirection, FaLedger } from '@totalclaw/ipc-contracts';
import { isValidUscc } from '../knowledgeBase/factRules';
import {
  CATEGORY_RULES, normalizePdfText, classifyByKeywords, CATEGORY_FALLBACK, daysBetween, localDate, normDate, round2, sameCompany, sum,
} from './common';

export interface ParsedInvoice {
  kind: FaDocKind;
  invoiceCode?: string;
  invoiceNo?: string;
  date?: string;
  buyerName?: string;
  buyerTaxId?: string;
  sellerName?: string;
  sellerTaxId?: string;
  amount?: number;
  tax?: number;
  total?: number;
  taxRate?: number | null;
  items: FaDocItem[];
  payer?: string;
  payee?: string;
  purpose?: string;
  redLetter?: boolean;
}

// 千分位写法要求至少一组「,ddd」，否则交替的第一支会把 10000.00 截成 100
const MONEY = String.raw`-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?`;

function money(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const n = Number(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

export function detectKind(text: string): FaDocKind {
  const t = text.replace(/\s+/g, '');
  if (/铁路电子客票|航空运输电子客票行程单|电子客票行程单|旅客运输|客运服务/.test(t)) return 'e_ticket';
  if (/增值税专用发票|专用发票/.test(t)) return 'vat_special';
  if (/增值税普通发票|普通发票|电子发票/.test(t)) return 'vat_normal';
  if (/回单|付款人|收款人|交易流水|电子回单/.test(t) && !/发票/.test(t)) return 'bank_receipt';
  if (/收据|小票|收款收据|定额发票|机打发票/.test(t)) return 'receipt';
  return 'other';
}

/** 版面里「购买方 / 销售方」两块的名称和税号。文字层顺序不一定是购在前，按标签位置判断。 */
function parties(text: string): Pick<ParsedInvoice, 'buyerName' | 'buyerTaxId' | 'sellerName' | 'sellerTaxId'> {
  // 文字层里名称后面常直接粘着下一个标签（没有空格），按标签截断
  const names = [...text.matchAll(/名\s*称\s*[:：]\s*([^\s:：]{2,60}?)(?=统一社会信用代码|纳税人识别号|社会信用代码|地\s*址|电\s*话|开户|\s|$)/g)].map((m) => ({ v: m[1].trim(), at: m.index ?? 0 }));
  const ids = [...text.matchAll(/(?:统一社会信用代码\s*\/?\s*纳税人识别号|纳税人识别号|社会信用代码)\s*[:：]?\s*([0-9A-Z]{15,20})/g)]
    .map((m) => ({ v: m[1].trim(), at: m.index ?? 0 }));
  const buyerAt = text.search(/购\s*买\s*方|购\s*方|购买方信息/);
  const sellerAt = text.search(/销\s*售\s*方|销\s*方|销售方信息/);
  const sellerFirst = buyerAt >= 0 && sellerAt >= 0 && sellerAt < buyerAt;
  const pick = (list: { v: string }[], i: number) => list[i]?.v;
  const [b, s] = sellerFirst ? [1, 0] : [0, 1];
  return { buyerName: pick(names, b), sellerName: pick(names, s), buyerTaxId: pick(ids, b), sellerTaxId: pick(ids, s) };
}

function parseItems(text: string): FaDocItem[] {
  const out: FaDocItem[] = [];
  // 数电票明细行：*类别*品名 …… 金额 税率 税额
  const re = new RegExp(String.raw`(\*[^*\n]{1,20}\*[^\n]*?)\s+(${MONEY})\s*(\d{1,2}(?:\.\d+)?%|免税|不征税)\s*(${MONEY}|\*{3})`, 'g');
  for (const m of text.matchAll(re)) {
    const rate = /%$/.test(m[3]) ? Number(m[3].replace('%', '')) / 100 : 0;
    // 品名后面跟着规格 / 单位 / 数量 / 单价，遇到第一个纯数字就截断
    const tokens = m[1].trim().split(/\s+/);
    const cut = tokens.findIndex((tk, i) => i > 0 && /^-?[\d.,]+$/.test(tk));
    const name = (cut > 0 ? tokens.slice(0, cut) : tokens).join(' ');
    out.push({ name: name.slice(0, 60), amount: money(m[2]) ?? 0, taxRate: rate, tax: m[4] === '***' ? 0 : (money(m[4]) ?? 0) });
  }
  return out.slice(0, 50);
}

/** 发票 / 客票文字 → 字段 */
export function parseInvoiceText(raw: string): ParsedInvoice {
  // NFKC：PDF 文字层常把「子 用 日 方」存成康熙部首兼容字符（⼦ ⽤ ⽇ ⽅），不归一的话票种、日期全认不出
  const text = normalizePdfText(String(raw || '')).replace(/\u00a0/g, ' ');
  const kind = detectKind(text);
  const out: ParsedInvoice = { kind, items: [] };
  if (kind === 'bank_receipt') return { ...out, ...parseBankReceipt(text) };

  out.invoiceNo = text.match(/发\s*票\s*号\s*码\s*[:：]?\s*(\d{8,20})/)?.[1]
    || text.match(/(?:No|NO)[.:：]?\s*(\d{8})/)?.[1];
  out.invoiceCode = text.match(/发\s*票\s*代\s*码\s*[:：]?\s*(\d{10,12})/)?.[1];
  out.date = normDate(text.match(/(?:开\s*票\s*日\s*期|乘车日期|填开日期|日\s*期)\s*[:：]?\s*(\d{4}\s*[年\-/.]\s*\d{1,2}\s*[月\-/.]\s*\d{1,2})/)?.[1]);
  Object.assign(out, parties(text));

  const total = text.match(new RegExp(String.raw`[（(]\s*小\s*写\s*[)）]\s*[¥￥]?\s*(${MONEY})`))?.[1]
    || text.match(new RegExp(String.raw`价\s*税\s*合\s*计[^¥￥\d\n]*[¥￥]\s*(${MONEY})`))?.[1]
    || text.match(new RegExp(String.raw`(?:票\s*价|金\s*额|合\s*计)\s*[:：]?\s*[¥￥]\s*(${MONEY})`))?.[1];
  out.total = money(total);
  const sums = text.match(new RegExp(String.raw`合\s*计\s*[¥￥]\s*(${MONEY})\s*[¥￥]\s*(${MONEY}|\*+)`));
  if (sums) {
    out.amount = money(sums[1]);
    out.tax = /^\*+$/.test(sums[2]) ? 0 : money(sums[2]);
  }
  out.items = parseItems(text);
  const rates = [...new Set(out.items.map((i) => i.taxRate).filter((r): r is number => r != null))];
  if (rates.length === 1) out.taxRate = rates[0];
  else if (!out.items.length) {
    const r = text.match(/(?:税\s*率|征收率)[^\n%]{0,20}?(\d{1,2})\s*%/)?.[1] || text.match(/\s(\d{1,2})%\s/)?.[1];
    if (r) out.taxRate = Number(r) / 100;
    else if (/免\s*税/.test(text)) out.taxRate = 0;
  }
  if (out.amount == null && out.items.length) out.amount = sum(out.items.map((i) => i.amount));
  if (out.tax == null && out.items.length) out.tax = sum(out.items.map((i) => i.tax));
  if (kind === 'e_ticket') applyTicketDeduction(out, text);
  if (out.amount == null && out.total != null && out.tax != null) out.amount = round2(out.total - out.tax);
  if (out.total == null && out.amount != null && out.tax != null) out.total = round2(out.amount + out.tax);
  out.redLetter = /红字|销项负数|负数发票/.test(text) || (out.total != null && out.total < 0);
  return out;
}

/** 旅客运输：铁路 / 航空按 9%、公路水路按 3% 计算可抵扣进项（票面金额 ÷ (1+税率) × 税率） */
function applyTicketDeduction(out: ParsedInvoice, text: string): void {
  if (out.total == null) return;
  if (out.tax && out.amount) return; // 数电客票已经列了税额
  const rate = /铁路|航空|机票|民航/.test(text) ? 0.09 : 0.03;
  out.taxRate = rate;
  out.tax = round2((out.total / (1 + rate)) * rate);
  out.amount = round2(out.total - out.tax);
}

function parseBankReceipt(text: string): Partial<ParsedInvoice> {
  const grab = (re: RegExp) => text.match(re)?.[1]?.trim();
  const payer = grab(/付\s*款\s*(?:人|方|单位)?\s*(?:户\s*名|名\s*称)?\s*[:：]\s*([^\s:：]{2,60}?)(?=账\s*号|开户|收\s*款|\s|$)/);
  const payee = grab(/收\s*款\s*(?:人|方|单位)?\s*(?:户\s*名|名\s*称)?\s*[:：]\s*([^\s:：]{2,60}?)(?=账\s*号|开户|付\s*款|\s|$)/);
  const amount = money(grab(new RegExp(String.raw`(?:小\s*写|金\s*额|交易金额)\s*[:：]?\s*[¥￥]?\s*(${MONEY})`)));
  const date = normDate(grab(/(?:交易日期|日\s*期|记账日期|交易时间)\s*[:：]?\s*(\d{4}\s*[年\-/.]\s*\d{1,2}\s*[月\-/.]\s*\d{1,2})/));
  const purpose = grab(/(?:用\s*途|摘\s*要|附\s*言|备\s*注)\s*[:：]\s*([^\n]{1,60})/);
  const no = grab(/(?:流\s*水\s*号|交易流水|回单编号|凭证号)\s*[:：]?\s*([0-9A-Za-z]{6,40})/);
  return { kind: 'bank_receipt', payer, payee, total: amount, amount, tax: 0, taxRate: null, date, purpose, invoiceNo: no };
}

// ─── 方向与归类 ──────────────────────────────────────────────────────────

/** 本公司是购买方 → 进项；是销售方 → 销项；回单看本公司是付款方还是收款方 */
export function directionOf(doc: Pick<FaDoc, 'kind' | 'buyerName' | 'buyerTaxId' | 'sellerName' | 'sellerTaxId' | 'payer' | 'payee'>, ledger: Pick<FaLedger, 'name' | 'taxId'>): FaDirection {
  const isUs = (name?: string, id?: string) => (!!ledger.taxId && !!id && id.toUpperCase() === ledger.taxId.toUpperCase()) || sameCompany(name, ledger.name);
  if (doc.kind === 'bank_receipt') {
    if (isUs(doc.payer)) return 'in';
    if (isUs(doc.payee)) return 'out';
    return 'unknown';
  }
  if (isUs(doc.sellerName, doc.sellerTaxId)) return 'out';
  if (isUs(doc.buyerName, doc.buyerTaxId)) return 'in';
  // 客票 / 收据没有购买方税号，默认按费用（进项）处理
  if (doc.kind === 'e_ticket' || doc.kind === 'receipt') return 'in';
  return 'unknown';
}

export function classifyDoc(doc: Pick<FaDoc, 'items' | 'sellerName' | 'purpose' | 'kind'>, text = ''): string {
  const hay = [doc.items.map((i) => i.name).join(' '), doc.sellerName || '', doc.purpose || ''].join(' ');
  // 客票一律是差旅（按科目编码找规则，不写死类别名）
  const travel = doc.kind === 'e_ticket' ? CATEGORY_RULES.find((r) => r.account === TRAVEL_ACCOUNT) || null : null;
  const hit = classifyByKeywords(hay) || travel || classifyByKeywords(text.slice(0, 600));
  return hit?.category || CATEGORY_FALLBACK.category;
}

// ─── 校验 ────────────────────────────────────────────────────────────────

const TOL = 0.011;
const TRAVEL_ACCOUNT = '560202';

export function checkDoc(doc: FaDoc, ledger: FaLedger, others: FaDoc[], today = localDate()): FaCheck[] {
  const out: FaCheck[] = [];
  const add = (code: string, level: FaCheck['level'], message: string) => out.push({ code, level, message });
  const isInvoice = doc.kind === 'vat_special' || doc.kind === 'vat_normal';

  if (isInvoice && !doc.invoiceNo) add('no_number', 'warn', i18nT('没有读到发票号码，无法查重，请人工补上'));
  if (!doc.date) add('no_date', 'warn', i18nT('没有读到日期'));
  if (!doc.total) add('no_total', 'error', i18nT('没有读到金额'));

  if (isInvoice || doc.kind === 'e_ticket') {
    if (doc.total && Math.abs(round2(doc.amount + doc.tax) - doc.total) > TOL) {
      add('sum_mismatch', 'error', i18nT('金额 {a} + 税额 {b} ≠ 价税合计 {c}', { a: doc.amount, b: doc.tax, c: doc.total }));
    } else if (doc.total) add('sum_ok', 'ok', i18nT('金额 + 税额 = 价税合计'));
    if (doc.taxRate != null && doc.taxRate > 0 && doc.amount) {
      const expect = round2(doc.amount * doc.taxRate);
      // 多行明细各自四舍五入，差额允许到 1 分 × 行数
      const tol = Math.max(0.06, 0.01 * Math.max(1, doc.items.length));
      if (Math.abs(expect - doc.tax) > tol) add('rate_mismatch', 'warn', i18nT('税额 {a} 与 金额 × 税率 {b} = {c} 对不上', { a: doc.tax, b: `${round2(doc.taxRate * 100)}%`, c: expect }));
    }
    if (doc.items.length && doc.amount && Math.abs(sum(doc.items.map((i) => i.amount)) - doc.amount) > 0.05) {
      add('items_mismatch', 'warn', i18nT('明细金额合计与票面合计不一致'));
    }
  }

  for (const [label, id] of [[i18nT('销售方'), doc.sellerTaxId], [i18nT('购买方'), doc.buyerTaxId]] as const) {
    if (id && id.length === 18 && !isValidUscc(id)) add('uscc_invalid', 'error', i18nT('{p0}税号 {p1} 校验位不对，可能识别错或票面有误', { p0: label, p1: id }));
  }

  if (isInvoice && doc.direction === 'unknown') {
    add('title_unknown', 'warn', i18nT('购买方和销售方都不是本账套公司，请确认抬头'));
  }
  if (isInvoice && doc.direction === 'in' && ledger.taxId && doc.buyerTaxId && doc.buyerTaxId.toUpperCase() !== ledger.taxId.toUpperCase()) {
    add('title_wrong', 'error', i18nT('购买方税号 {p0} 不是本公司', { p0: doc.buyerTaxId }));
  }
  if (doc.kind === 'vat_normal' && doc.direction === 'in' && doc.tax > 0) {
    add('normal_no_deduct', 'warn', i18nT('增值税普通发票的税额不能抵扣进项，入账按价税合计计入成本费用'));
  }

  if (doc.date) {
    if (doc.date > today) add('future_date', 'error', i18nT('日期 {p0} 晚于今天', { p0: doc.date }));
    else if (daysBetween(doc.date, today) > 360) add('old_date', 'warn', i18nT('票据开具已超过 360 天'));
  }
  if (doc.total < 0) add('red_letter', 'warn', i18nT('这是红字（负数）票据，请确认对应的原蓝字票据'));

  const dup = findDuplicate(doc, others);
  if (dup) add('duplicate', 'error', i18nT('与已登记的「{p0}」重复', { p0: dup.fileName }));

  return out;
}

/** 重复票：同号码（含代码）；没有号码时看开票方 + 金额 + 日期完全相同 */
export function findDuplicate(doc: Pick<FaDoc, 'id' | 'invoiceNo' | 'invoiceCode' | 'sellerName' | 'total' | 'date' | 'kind'>, others: FaDoc[]): FaDoc | undefined {
  return others.find((o) => {
    if (o.id === doc.id) return false;
    if (doc.invoiceNo && o.invoiceNo) return o.invoiceNo === doc.invoiceNo && (o.invoiceCode || '') === (doc.invoiceCode || '');
    return doc.kind !== 'bank_receipt' && !!doc.total && o.total === doc.total && !!doc.date && o.date === doc.date && !!doc.sellerName && o.sellerName === doc.sellerName;
  });
}

export function docStatus(checks: FaCheck[]): FaDoc['status'] {
  return checks.some((c) => c.level === 'error') ? 'flagged' : 'recognized';
}

/** 模型可以补的字段；规则已读到的不让模型覆盖 */
export const LLM_FILLABLE = ['invoiceNo', 'invoiceCode', 'date', 'buyerName', 'buyerTaxId', 'sellerName', 'sellerTaxId', 'amount', 'tax', 'total', 'taxRate', 'payer', 'payee', 'purpose'] as const;
