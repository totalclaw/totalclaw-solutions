/**
 * 发票智能体 · 纯计算（可单测，不碰 fs / electron）。
 *
 * 列识别 → 行归一与校验 → 组票 / 拆票 / 算税 → 批量导入模板 → 已开发票回填匹配。
 * 金额一律按「分」做整数运算，避免浮点尾差；模型不参与任何一步计算。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { IvCustomer, IvDraft, IvGoods, IvInvoiceKind, IvIssue, IvLine, IvMergeMode, IvRow, IvSeller } from '@totalclaw/ipc-contracts';
import { IV_FIELDS } from '@totalclaw/ipc-contracts';
import KEYWORDS from './columnKeywords.json';

// ── 数字 ─────────────────────────────────────────

export const cents = (v: number): number => Math.round((Number(v) || 0) * 100 + (v >= 0 ? 1e-7 : -1e-7));
export const yuan = (c: number): number => Math.round(c) / 100;
export const round2 = (v: number): number => yuan(cents(v));

export function toNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = String(v ?? '').replace(/[,，\s¥￥元]/g, '').replace(/^\((.*)\)$/, '-$1');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/** 税率：13% / 13 / 0.13 都认；认不出返回 NaN */
export function parseTaxRate(v: unknown): number {
  const s = String(v ?? '').trim();
  if (!s) return NaN;
  if (/免税|不征税/.test(s)) return 0;
  const m = /^(\d+(?:\.\d+)?)\s*[%％]?$/.exec(s);
  if (!m) return NaN;
  const n = Number(m[1]);
  if (/[%％]/.test(s) || n >= 1) return Math.round(n * 100) / 10000;
  return n;
}

export const GENERAL_RATES = [0, 0.01, 0.03, 0.05, 0.06, 0.09, 0.13];
export const SMALL_RATES = [0, 0.01, 0.03, 0.05];

/** 含税价 → 不含税金额与税额（分） */
export function splitTax(totalCents: number, rate: number): { net: number; tax: number } {
  const net = Math.round(totalCents / (1 + rate));
  return { net, tax: totalCents - net };
}

// ── 税号 ─────────────────────────────────────────

const USCC_CHARS = '0123456789ABCDEFGHJKLMNPQRTUWXY';
const USCC_WEIGHTS = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];

/** 统一社会信用代码校验位（GB 32100-2015） */
export function checkCreditCode(code: string): boolean {
  const c = String(code || '').toUpperCase();
  if (!/^[0-9A-HJ-NPQRTUWXY]{18}$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 17; i += 1) sum += USCC_CHARS.indexOf(c[i]) * USCC_WEIGHTS[i];
  const check = (31 - (sum % 31)) % 31;
  return USCC_CHARS[check] === c[17];
}

export function normalizeTaxNo(v: unknown): string {
  return String(v ?? '').replace(/[\s\-—]/g, '').toUpperCase();
}

/** ok 通过；format 位数或字符不对；checksum 18 位但校验位不对 */
export function taxNoProblem(taxNo: string): '' | 'format' | 'checksum' {
  if (!/^[0-9A-Z]+$/.test(taxNo) || ![15, 17, 18, 20].includes(taxNo.length)) return 'format';
  if (taxNo.length === 18 && !checkCreditCode(taxNo)) return 'checksum';
  return '';
}

const ORG_HINT = /公司|集团|厂|中心|医院|学校|大学|学院|研究院|研究所|事务所|委员会|办公室|管理局|财政局|分局|支队|大队|银行|合作社|商行|经营部|门市部|工作室|协会|基金会|政府|酒店|超市|药房|诊所/;
export const looksLikeOrg = (name: string): boolean => ORG_HINT.test(name);

/** 全角括号：公司名里的半角括号统一成全角，和营业执照、电子税务局的写法一致 */
const FW_OPEN = String.fromCharCode(0xff08);
const FW_CLOSE = String.fromCharCode(0xff09);

export function normalizeName(v: unknown): string {
  return String(v ?? '').trim().replace(/\s+/g, '').replace(/\(/g, FW_OPEN).replace(/\)/g, FW_CLOSE);
}

// ── 列识别 ─────────────────────────────────────────

const normHeader = (h: string): string => String(h || '').replace(/[\s:：*＊()（）【】\[\]]/g, '').toLowerCase();

export function detectMapping(headers: string[]): Record<string, string> {
  const table = KEYWORDS as Record<string, string[]>;
  const used = new Set<string>();
  const out: Record<string, string> = {};
  const hs = headers.map((h) => ({ raw: h, n: normHeader(h) })).filter((h) => h.n);
  // 两轮：先整格相等，再包含；关键字按优先级排
  for (const pass of ['exact', 'include'] as const) {
    for (const f of IV_FIELDS) {
      if (out[f.key]) continue;
      for (const kw of table[f.key] || []) {
        const exactOnly = kw.startsWith('=');
        const k = normHeader(exactOnly ? kw.slice(1) : kw);
        if (pass === 'include' && exactOnly) continue;
        const hit = hs.find((h) => !used.has(h.raw) && (pass === 'exact' ? h.n === k : h.n.includes(k)));
        if (hit) { out[f.key] = hit.raw; used.add(hit.raw); break; }
      }
    }
  }
  return out;
}

export function missingRequired(mapping: Record<string, string>): string[] {
  return IV_FIELDS.filter((f) => f.required && !mapping[f.key]).map((f) => f.key);
}

// ── 行归一 ─────────────────────────────────────────

export interface ParseDefaults {
  defaultTaxRate: number;
  amountTaxIncluded: boolean;
  defaultKind: IvInvoiceKind;
}

function parseKind(v: string, fallback: IvInvoiceKind): IvInvoiceKind {
  if (/专/.test(v) || /special/i.test(v)) return 'special';
  if (/普/.test(v) || /normal|general/i.test(v)) return 'normal';
  return fallback;
}

function parseIncluded(v: string, fallback: boolean): boolean {
  const s = v.trim();
  if (!s) return fallback;
  if (/^(否|不含税|不含|n|no|0|false)$/i.test(s)) return false;
  if (/^(是|含税|含|y|yes|1|true)$/i.test(s)) return true;
  return fallback;
}

/** 「地址电话」「开户行及账号」写在一格里的，拆开 */
export function splitTail(v: string): { head: string; tail: string } {
  const m = /^(.*?)[\s,，;；]*([0-9][0-9\-\s]{6,})$/.exec(v.trim());
  return m && m[1] ? { head: m[1].trim(), tail: m[2].replace(/\s/g, '') } : { head: v.trim(), tail: '' };
}

export function parseRows(
  table: { fileName: string; sheetName: string; rows: Record<string, string>[] },
  mapping: Record<string, string>,
  d: ParseDefaults,
  ids: { batchId: string; newId: () => string },
  /** 表头在第几行（1 起）：行号 = 表头行 + 序号 */
  headerRowNo = 1,
): IvRow[] {
  const get = (r: Record<string, string>, k: string): string => (mapping[k] ? String(r[mapping[k]] ?? '').trim() : '');
  const out: IvRow[] = [];
  table.rows.forEach((r, i) => {
    const buyerName = normalizeName(get(r, 'buyerName'));
    const itemName = get(r, 'itemName');
    const amountRaw = get(r, 'amount');
    // 合计行 / 空行：没有购方也没有项目
    if (!buyerName && !itemName) return;
    if (/^(合计|总计|小计)/.test(buyerName) && !itemName) return;
    let address = get(r, 'buyerAddress');
    let phone = get(r, 'buyerPhone');
    if (address && !phone) { const s = splitTail(address); if (s.tail) { address = s.head; phone = s.tail; } }
    let bank = get(r, 'buyerBank');
    let account = get(r, 'buyerBankAccount').replace(/\s/g, '');
    if (bank && !account) { const s = splitTail(bank); if (s.tail) { bank = s.head; account = s.tail; } }
    const rateRaw = get(r, 'taxRate');
    const rate = rateRaw ? parseTaxRate(rateRaw) : d.defaultTaxRate;
    const qty = toNum(get(r, 'qty'));
    const price = toNum(get(r, 'price'));
    const amount = amountRaw ? toNum(amountRaw) : round2(qty * price);
    const taxNo = normalizeTaxNo(get(r, 'buyerTaxNo'));
    out.push({
      id: ids.newId(), batchId: ids.batchId, file: table.fileName, sheet: table.sheetName, rowNo: headerRowNo + 1 + i,
      buyerName, buyerTaxNo: taxNo, buyerAddress: address, buyerPhone: phone, buyerBank: bank, buyerBankAccount: account,
      email: get(r, 'email'), mobile: get(r, 'mobile').replace(/\s/g, ''),
      itemName, spec: get(r, 'spec'), unit: get(r, 'unit'), qty, price, amount,
      taxIncluded: parseIncluded(get(r, 'taxIncluded'), d.amountTaxIncluded),
      taxRate: rate, kind: parseKind(get(r, 'kind'), d.defaultKind),
      orderNo: get(r, 'orderNo'), remark: get(r, 'remark'),
      personal: !taxNo && !!buyerName && !looksLikeOrg(buyerName),
      issues: [], skipped: false,
    });
  });
  return out;
}

/** 用客户档案补全：只写了名称的补税号等；返回补了几行 */
export function fillFromCustomers(rows: IvRow[], customers: IvCustomer[]): number {
  const byName = new Map(customers.map((c) => [normalizeName(c.name), c]));
  let n = 0;
  for (const r of rows) {
    const c = byName.get(r.buyerName);
    if (!c) continue;
    let touched = false;
    const fill = (k: 'buyerTaxNo' | 'buyerAddress' | 'buyerPhone' | 'buyerBank' | 'buyerBankAccount' | 'email' | 'mobile', v: string) => {
      if (!r[k] && v) { r[k] = v; touched = true; }
    };
    fill('buyerTaxNo', c.taxNo); fill('buyerAddress', c.address); fill('buyerPhone', c.phone);
    fill('buyerBank', c.bank); fill('buyerBankAccount', c.bankAccount); fill('email', c.email); fill('mobile', c.mobile);
    if (touched) { n += 1; if (r.buyerTaxNo) r.personal = false; }
  }
  return n;
}

// ── 校验 ─────────────────────────────────────────

export interface ValidateContext {
  seller: Pick<IvSeller, 'taxpayerType'>;
  customers: IvCustomer[];
  /** 台账里已经开出去的：订单号 + 项目 + 金额（分），用来提示重复开票 */
  issuedKeys?: Set<string>;
}

export const dupKey = (r: Pick<IvRow, 'buyerName' | 'orderNo' | 'itemName' | 'amount'>): string =>
  `${r.buyerName}|${r.orderNo}|${r.itemName}|${cents(r.amount)}`;

export function validateRows(rows: IvRow[], ctx: ValidateContext): void {
  const err = (r: IvRow, code: string, message: string) => r.issues.push({ level: 'error', code, message });
  const warn = (r: IvRow, code: string, message: string) => r.issues.push({ level: 'warning', code, message });
  const live = rows.filter((r) => !r.skipped);
  for (const r of rows) r.issues = [];

  // 同名不同税号 / 同税号不同名：一批里互相矛盾
  const taxByName = new Map<string, Set<string>>();
  const nameByTax = new Map<string, Set<string>>();
  for (const r of live) {
    if (!r.buyerName || !r.buyerTaxNo) continue;
    (taxByName.get(r.buyerName) || taxByName.set(r.buyerName, new Set()).get(r.buyerName)!).add(r.buyerTaxNo);
    (nameByTax.get(r.buyerTaxNo) || nameByTax.set(r.buyerTaxNo, new Set()).get(r.buyerTaxNo)!).add(r.buyerName);
  }
  const known = new Map(ctx.customers.map((c) => [normalizeName(c.name), c]));
  const knownTax = new Set(ctx.customers.map((c) => c.taxNo).filter(Boolean));
  const rates = ctx.seller.taxpayerType === 'small' ? SMALL_RATES : GENERAL_RATES;
  const seen = new Map<string, IvRow>();

  for (const r of live) {
    if (!r.buyerName) err(r, 'buyer_missing', i18nT('没有购买方名称'));
    if (!r.itemName) err(r, 'item_missing', i18nT('没有项目名称（开票内容）'));

    if (r.buyerTaxNo) {
      const p = taxNoProblem(r.buyerTaxNo);
      if (p === 'format') err(r, 'taxno_format', i18nT('税号 {p0} 位数或字符不对（应为 15 / 17 / 18 / 20 位数字和大写字母）', { p0: r.buyerTaxNo }));
      // 校验位不对多半是抄错了一位；客户档案里确认过的不再拦（早年个别代码本身就不满足校验）
      else if (p === 'checksum' && !knownTax.has(r.buyerTaxNo)) err(r, 'taxno_checksum', i18nT('税号 {p0} 校验位不对，多半抄错了一位；核对无误的话把这家加入客户档案', { p0: r.buyerTaxNo }));
      if ((taxByName.get(r.buyerName)?.size || 0) > 1) err(r, 'name_taxno_conflict', i18nT('「{p0}」在这批里出现了不同的税号', { p0: r.buyerName }));
      if ((nameByTax.get(r.buyerTaxNo)?.size || 0) > 1) err(r, 'taxno_name_conflict', i18nT('税号 {p0} 在这批里对应了不同的名称', { p0: r.buyerTaxNo }));
      const k = known.get(r.buyerName);
      if (k?.taxNo && k.taxNo !== r.buyerTaxNo) err(r, 'customer_mismatch', i18nT('税号和客户档案里的不一致（档案：{p0}）', { p0: k.taxNo }));
    } else if (r.kind === 'special') {
      err(r, 'special_needs_taxno', i18nT('专用发票必须有购买方税号'));
    } else if (!r.personal) {
      // 官方批量模板填表说明第 5 条：普票的购买方是企业的，纳税人识别号必填
      err(r, 'org_without_taxno', i18nT('购买方是单位但没有税号：电子税务局要求普通发票的购买方为企业时也必须填纳税人识别号；确实是个人的话把这一行标为自然人'));
    }
    if (r.kind === 'special' && r.personal) err(r, 'special_personal', i18nT('不能给个人开专用发票'));

    if (!(r.amount > 0)) {
      err(r, r.amount < 0 ? 'amount_negative' : 'amount_missing', r.amount < 0 ? i18nT('金额是负数：冲红请在发票台账里对原发票发起红冲') : i18nT('没有金额'));
    } else if (r.qty && r.price) {
      const diff = Math.abs(r.qty * r.price - r.amount);
      if (diff > Math.max(0.01, Math.abs(r.qty) * 0.005)) err(r, 'amount_mismatch', i18nT('数量 × 单价 = {p0}，和金额 {p1} 对不上', { p0: round2(r.qty * r.price), p1: r.amount }));
    }
    if (r.qty < 0 || r.price < 0) err(r, 'qty_negative', i18nT('数量、单价不能是负数'));

    if (Number.isNaN(r.taxRate)) err(r, 'rate_unknown', i18nT('税率认不出来'));
    else if (!rates.some((x) => Math.abs(x - r.taxRate) < 1e-9)) {
      err(r, 'rate_invalid', ctx.seller.taxpayerType === 'small'
        ? i18nT('税率 {p0}% 不是小规模纳税人可用的征收率', { p0: round2(r.taxRate * 100) })
        : i18nT('税率 {p0}% 不是现行增值税税率', { p0: round2(r.taxRate * 100) }));
    }

    if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) warn(r, 'email_invalid', i18nT('邮箱格式不对：{p0}', { p0: r.email }));
    if (r.remark.length > 200) warn(r, 'remark_long', i18nT('备注超过 200 字，开票时会被截断'));

    const key = dupKey(r);
    if (ctx.issuedKeys?.has(key)) warn(r, 'dup_issued', i18nT('台账里已有同一购方、同一订单号、同样金额的发票，可能重复开票'));
    const first = seen.get(key);
    if (first) warn(r, 'dup_in_batch', i18nT('和第 {p0} 行重复（购方、订单号、项目、金额都一样）', { p0: first.rowNo }));
    else seen.set(key, r);
  }
}

// ── 组票 ─────────────────────────────────────────

export interface BuildOptions {
  mergeMode: IvMergeMode;
  /** 单张价税合计上限（元），0 = 不限 */
  perInvoiceLimit: number;
  maxLines: number;
  goods: IvGoods[];
  /** 批量导入与接口通道必须有税收编码；网页逐张开可以在页面上选 */
  taxCodeRequired: boolean;
  newId: () => string;
  now: string;
  /** 发票流水号前缀：流水号要在企业自己这边唯一（批量开票记录按它回填），总长不超过 20 位 */
  serialPrefix?: string;
}

function lineOf(r: IvRow, goods: Map<string, IvGoods>): IvLine {
  const g = goods.get(r.itemName.trim());
  let net: number; let tax: number; let total: number;
  if (r.taxIncluded) {
    total = cents(r.amount);
    ({ net, tax } = splitTax(total, r.taxRate));
  } else {
    net = cents(r.amount);
    tax = Math.round(net * r.taxRate);
    total = net + tax;
  }
  return {
    itemName: r.itemName.trim(), taxCode: g?.taxCode || '', shortName: g?.shortName || '',
    spec: r.spec || g?.spec || '', unit: r.unit || g?.unit || '',
    qty: r.qty, price: r.qty ? Number((yuan(net) / r.qty).toFixed(8)) : 0,
    amount: yuan(net), tax: yuan(tax), total: yuan(total), taxRate: r.taxRate, rowIds: [r.id],
  };
}

/** 同项目、同规格单位、同税率、同单价的行并成一行；含税合计相加后重新拆税，票面合计不变 */
export function mergeLines(lines: IvLine[]): IvLine[] {
  const out: IvLine[] = [];
  const idx = new Map<string, IvLine>();
  for (const l of lines) {
    const key = `${l.itemName}|${l.spec}|${l.unit}|${l.taxRate}|${l.qty ? l.price : 'noqty'}`;
    const m = idx.get(key);
    if (!m || !l.qty) { const c = { ...l, rowIds: [...l.rowIds] }; out.push(c); if (l.qty) idx.set(key, c); continue; }
    m.qty = Number((m.qty + l.qty).toFixed(8));
    m.amount = yuan(cents(m.amount) + cents(l.amount));
    m.tax = yuan(cents(m.tax) + cents(l.tax));
    m.total = yuan(cents(m.total) + cents(l.total));
    m.rowIds.push(...l.rowIds);
  }
  return out;
}

/** 一行就超过单张限额：按数量（整数时）或按金额拆成几行，合计与原行一分不差 */
export function splitLine(l: IvLine, limitCents: number): IvLine[] {
  const total = cents(l.total);
  if (!limitCents || total <= limitCents) return [l];
  const parts: IvLine[] = [];
  const unitTotal = l.qty ? total / l.qty : 0;
  const byQty = l.qty > 1 && Number.isInteger(l.qty) && unitTotal <= limitCents && Number.isInteger(Math.round(unitTotal * 1e6) / 1e6);
  let restTotal = total; let restNet = cents(l.amount); let restTax = cents(l.tax); let restQty = l.qty;
  const perQty = byQty ? Math.max(1, Math.floor(limitCents / unitTotal)) : 0;
  while (restTotal > limitCents) {
    const t = byQty ? Math.round(perQty * unitTotal) : limitCents;
    const { net, tax } = splitTax(t, l.taxRate);
    const q = byQty ? perQty : 0;
    parts.push({ ...l, qty: q, price: byQty ? l.price : 0, amount: yuan(net), tax: yuan(tax), total: yuan(t), rowIds: [...l.rowIds] });
    restTotal -= t; restNet -= net; restTax -= tax; restQty -= q;
  }
  parts.push({ ...l, qty: byQty ? restQty : 0, price: byQty ? l.price : 0, amount: yuan(restNet), tax: yuan(restTax), total: yuan(restTotal), rowIds: [...l.rowIds] });
  return parts;
}

function packLines(lines: IvLine[], limitCents: number, maxLines: number): IvLine[][] {
  const flat = lines.flatMap((l) => splitLine(l, limitCents));
  const packs: IvLine[][] = [];
  let cur: IvLine[] = []; let sum = 0;
  for (const l of flat) {
    const t = cents(l.total);
    if (cur.length && ((limitCents && sum + t > limitCents) || cur.length >= maxLines)) { packs.push(cur); cur = []; sum = 0; }
    cur.push(l); sum += t;
  }
  if (cur.length) packs.push(cur);
  return packs;
}

export function buildDrafts(rows: IvRow[], batchId: string, o: BuildOptions): IvDraft[] {
  const goods = new Map(o.goods.map((g) => [g.name.trim(), g]));
  const usable = rows.filter((r) => !r.skipped && !r.issues.some((i) => i.level === 'error'));
  const groups = new Map<string, IvRow[]>();
  for (const r of usable) {
    const buyer = `${r.buyerTaxNo || r.buyerName}|${r.kind}`;
    const key = o.mergeMode === 'row' ? r.id : o.mergeMode === 'order' ? (r.orderNo ? `${buyer}|${r.orderNo}` : r.id) : buyer;
    (groups.get(key) || groups.set(key, []).get(key)!).push(r);
  }
  const drafts: IvDraft[] = [];
  let seq = 0;
  for (const rs of groups.values()) {
    const head = rs[0];
    const pick = (k: 'buyerAddress' | 'buyerPhone' | 'buyerBank' | 'buyerBankAccount' | 'email' | 'mobile'): string => rs.find((r) => r[k])?.[k] || '';
    const orderNos = [...new Set(rs.map((r) => r.orderNo).filter(Boolean))];
    const remarks = [...new Set(rs.map((r) => r.remark).filter(Boolean))];
    let remark = [...remarks, orderNos.length ? i18nT('订单号：{p0}', { p0: orderNos.join('、') }) : ''].filter(Boolean).join(i18nT('；'));
    const issues: IvIssue[] = [];
    if (remark.length > 200) { remark = remark.slice(0, 200); issues.push({ level: 'warning', code: 'remark_cut', message: i18nT('备注超过 200 字，已截断') }); }
    const lines = mergeLines(rs.map((r) => lineOf(r, goods)));
    const packs = packLines(lines, cents(o.perInvoiceLimit), Math.max(1, o.maxLines));
    packs.forEach((ls, i) => {
      seq += 1;
      const own = [...issues];
      const noCode = [...new Set(ls.filter((l) => !l.taxCode).map((l) => l.itemName))];
      const pending = [...new Set(ls.filter((l) => l.taxCode && !goods.get(l.itemName)?.confirmed).map((l) => l.itemName))];
      if (noCode.length) own.push({ level: o.taxCodeRequired ? 'error' : 'warning', code: 'tax_code_missing', message: i18nT('这些项目还没有税收分类编码：{p0}', { p0: noCode.join('、') }) });
      if (pending.length) own.push({ level: 'error', code: 'tax_code_unconfirmed', message: i18nT('这些项目的税收分类编码是模型建议的，要人确认：{p0}', { p0: pending.join('、') }) });
      if (packs.length > 1) own.push({ level: 'warning', code: 'split', message: i18nT('超过单张限额或行数上限，拆成了 {p0} 张，这是第 {p1} 张', { p0: packs.length, p1: i + 1 }) });
      if (ls.some((l) => !l.qty && lines.some((x) => x.itemName === l.itemName && x.qty))) own.push({ level: 'warning', code: 'split_no_qty', message: i18nT('有明细按金额拆开了，数量和单价留空') });
      drafts.push({
        id: o.newId(), batchId, serial: `${(o.serialPrefix || '').slice(0, 14)}${String(seq).padStart(4, '0')}`, kind: head.kind,
        buyerName: head.buyerName, buyerTaxNo: head.buyerTaxNo,
        buyerAddress: pick('buyerAddress'), buyerPhone: pick('buyerPhone'), buyerBank: pick('buyerBank'), buyerBankAccount: pick('buyerBankAccount'),
        email: pick('email'), mobile: pick('mobile'), personal: head.personal,
        lines: ls,
        amount: yuan(ls.reduce((n, l) => n + cents(l.amount), 0)),
        tax: yuan(ls.reduce((n, l) => n + cents(l.tax), 0)),
        total: yuan(ls.reduce((n, l) => n + cents(l.total), 0)),
        remark, orderNos,
        ...(packs.length > 1 ? { part: { index: i + 1, of: packs.length } } : {}),
        status: 'draft', issues: own, updatedAt: o.now,
      });
    });
  }
  return drafts;
}

/** 单行税额误差 ≤ 0.06 元、整张误差合计 ≤ 1.27 元（开票系统的硬校验），组出来的票自检一遍 */
export function taxDiffProblems(d: Pick<IvDraft, 'lines'>): string[] {
  const out: string[] = [];
  let sum = 0;
  for (const l of d.lines) {
    const diff = Math.abs(cents(l.tax) - cents(l.amount) * l.taxRate) / 100;
    sum += diff;
    if (diff > 0.06) out.push(i18nT('「{p0}」税额误差 {p1} 元，超过 0.06 元', { p0: l.itemName, p1: diff.toFixed(2) }));
  }
  if (sum > 1.27) out.push(i18nT('整张发票税额误差合计 {p0} 元，超过 1.27 元', { p0: sum.toFixed(2) }));
  return out;
}

// ── 电子税务局批量导入模板 ─────────────────────────────────────────

export interface TemplateSheet { name: string; headers: string[]; rows: (string | number)[][] }

/**
 * i18n-ignore: 电子税务局《批量导入开具发票模板》（V260401 版，2026-10-10 从吉林电子税务局批量开票页下载核对）的
 * 工作表名、列名与取值，必须是中文原文。模板第 1 行是填表说明、第 2 行是必填提示、第 3 行才是列名，数据从第 4 行起。
 */
export const ETAX = {
  yes: '是', no: '否', special: '增值税专用发票', normal: '普通发票',
  baseName: '1-发票基本信息', detailName: '2-发票明细信息', version: 'V260401',
  base: ['发票流水号', '发票类型', '是否含税', '受票方自然人标识', '购买方名称', '购买方纳税人识别号', '购买方地址', '购买方电话', '购买方开户银行', '购买方银行账号', '备注', '购买方邮箱'],
  detail: ['发票流水号', '项目名称', '商品和服务税收编码', '规格型号', '单位', '数量', '单价', '金额', '税率'],
  /** 官方提示：明细超过 2000 行可能异常，超过 5000 行无法开具 */
  detailSoftMax: 2000, detailHardMax: 5000,
};

export function etaxBatchSheets(drafts: IvDraft[]): TemplateSheet[] {
  const base: (string | number)[][] = drafts.map((d) => [
    d.serial, d.kind === 'special' ? ETAX.special : ETAX.normal, ETAX.yes, d.personal ? ETAX.yes : ETAX.no,
    d.buyerName, d.personal ? '' : d.buyerTaxNo, d.buyerAddress, d.buyerPhone, d.buyerBank, d.buyerBankAccount, d.remark, d.email,
  ]);
  // 是否含税 = 是：单价、金额都填含税数；金额保留两位小数，税率用小数
  const detail: (string | number)[][] = drafts.flatMap((d) => d.lines.map((l) => [
    d.serial, l.itemName, l.taxCode, l.spec, l.unit, l.qty || '', l.qty ? Number((l.total / l.qty).toFixed(8)) : '', l.total.toFixed(2), l.taxRate,
  ]));
  return [
    { name: ETAX.baseName, headers: ETAX.base, rows: base },
    { name: ETAX.detailName, headers: ETAX.detail, rows: detail },
  ];
}

/** 整批导入文件的硬性检查（来自官方模板的填表说明） */
export function etaxBatchProblems(drafts: IvDraft[]): IvIssue[] {
  const out: IvIssue[] = [];
  const lines = drafts.reduce((n, d) => n + d.lines.length, 0);
  if (lines > ETAX.detailHardMax) out.push({ level: 'error', code: 'too_many_lines', message: i18nT('这一批有 {p0} 行明细，超过电子税务局一次导入 {p1} 行的上限，请分批确认', { p0: lines, p1: ETAX.detailHardMax }) });
  else if (lines > ETAX.detailSoftMax) out.push({ level: 'warning', code: 'many_lines', message: i18nT('这一批有 {p0} 行明细：电子税务局提示超过 {p1} 行可能出现异常，建议分批', { p0: lines, p1: ETAX.detailSoftMax }) });
  const long = drafts.filter((d) => d.serial.length > 20).map((d) => d.serial);
  if (long.length) out.push({ level: 'error', code: 'serial_long', message: i18nT('发票流水号超过 20 位：{p0}', { p0: long.slice(0, 3).join('、') }) });
  const seen = new Set<string>(); const dup = new Set<string>();
  for (const d of drafts) { if (seen.has(d.serial)) dup.add(d.serial); seen.add(d.serial); }
  if (dup.size) out.push({ level: 'error', code: 'serial_dup', message: i18nT('发票流水号重复：{p0}', { p0: [...dup].slice(0, 3).join('、') }) });
  return out;
}

/** i18n-ignore: 官方模板里同一列的其它叫法，拿去匹配别人的表头 */
const ETAX_ALIASES: Record<string, string[]> = {
  购买方纳税人识别号: ['购买方统一社会信用代码/纳税人识别号', '统一社会信用代码/纳税人识别号', '购买方税号'],
  商品和服务税收编码: ['商品和服务税收分类编码', '税收分类编码'],
  购买方邮箱: ['收票人邮箱', '邮箱'],
  购买方开户银行: ['购买方开户行'],
};

/**
 * 把我们的列对到官方模板的列上。只认「列名相同」或上面登记过的别名，不做包含匹配 ——
 * 「是否展示购买方银行账号」包含「购买方银行账号」，按包含匹配会把账号写进一个是 / 否的列里。
 * 官方模板里有重名的列（「购买方所在地区」出现四次），同一个我方列只对第一处。
 * unfilled：官方有、我们没数据的列（留空）；unplaced：我们有数据、官方模板里找不到位置的列。
 */
export function fitToTemplate(ours: TemplateSheet, officialHeaders: string[]): { rows: (string | number)[][]; unfilled: string[]; unplaced: string[]; pos: number[] } {
  const n = (s: string) => normHeader(s);
  const names = ours.headers.map((h) => [n(h), ...(ETAX_ALIASES[h] || []).map(n)]);
  const taken = new Set<number>();
  const pos = officialHeaders.map((h) => { const i = names.findIndex((alts, k) => !taken.has(k) && alts.includes(n(h))); if (i >= 0) taken.add(i); return i; });
  return {
    rows: ours.rows.map((r) => pos.map((i) => (i >= 0 ? r[i] : ''))),
    unfilled: officialHeaders.filter((h, i) => pos[i] < 0 && n(h)),
    unplaced: ours.headers.filter((_, i) => !taken.has(i) && ours.rows.some((r) => r[i] !== '' && r[i] != null)),
    pos,
  };
}

// ── 已开发票回填 ─────────────────────────────────────────

export interface IssuedRecord { invoiceNo: string; buyerName: string; buyerTaxNo: string; total: number; issuedAt: string; red?: boolean }

/** i18n-ignore: 电子税务局导出表的列名，拿去匹配别人的表头 */
const ISSUED_KEYS: Record<string, string[]> = {
  invoiceNo: ['数电发票号码', '数电票号码', '全电发票号码', '发票号码'],
  buyerName: ['购买方名称', '购方名称', '受票方名称'],
  buyerTaxNo: ['购买方纳税人识别号', '购方识别号', '购买方识别号', '购方税号'],
  total: ['价税合计'],
  issuedAt: ['开票日期', '开票时间'],
  status: ['发票状态', '状态'],
};

export function parseIssuedTable(table: { headers: string[]; rows: Record<string, string>[] }): IssuedRecord[] {
  const col: Record<string, string> = {};
  for (const [k, kws] of Object.entries(ISSUED_KEYS)) {
    for (const kw of kws) {
      const h = table.headers.find((x) => normHeader(x) === normHeader(kw)) || table.headers.find((x) => normHeader(x).includes(normHeader(kw)));
      if (h) { col[k] = h; break; }
    }
  }
  if (!col.invoiceNo || !col.total) throw new Error(i18nT('这张表里找不到「发票号码」和「价税合计」两列，请导入电子税务局「全量发票查询」导出的表'));
  return table.rows.map((r) => {
    const total = toNum(r[col.total]);
    return {
      invoiceNo: String(r[col.invoiceNo] || '').replace(/\s/g, ''),
      buyerName: normalizeName(r[col.buyerName] || ''), buyerTaxNo: normalizeTaxNo(r[col.buyerTaxNo] || ''),
      total, issuedAt: String(r[col.issuedAt] || '').slice(0, 19),
      red: total < 0 || /红|作废/.test(String(r[col.status] || '')),
    };
  }).filter((x) => x.invoiceNo && !x.red);
}

/**
 * 回填匹配：购方（税号优先，否则名称）+ 价税合计都相同才算。
 * 同一把钥匙下草稿和记录数量相等才按顺序配对；数量不等说明有漏开或多开，全部交人看。
 */
export function matchIssued(drafts: IvDraft[], records: IssuedRecord[]): { matched: Array<{ draftId: string; invoiceNo: string; issuedAt: string }>; ambiguous: string[]; unmatched: IssuedRecord[] } {
  const used = new Set(drafts.map((d) => d.invoiceNo).filter(Boolean));
  const fresh = records.filter((r) => !used.has(r.invoiceNo));
  const open = drafts.filter((d) => !d.invoiceNo && (d.status === 'confirmed' || d.status === 'handed' || d.status === 'failed'));
  const keyOf = (taxNo: string, name: string, total: number) => `${taxNo || name}|${cents(total)}`;
  const dm = new Map<string, IvDraft[]>();
  for (const d of open) { const k = keyOf(d.personal ? '' : d.buyerTaxNo, d.buyerName, d.total); (dm.get(k) || dm.set(k, []).get(k)!).push(d); }
  const rm = new Map<string, IssuedRecord[]>();
  const unmatched: IssuedRecord[] = [];
  for (const r of fresh) {
    const k = dm.has(keyOf(r.buyerTaxNo, r.buyerName, r.total)) ? keyOf(r.buyerTaxNo, r.buyerName, r.total) : keyOf('', r.buyerName, r.total);
    if (!dm.has(k)) { unmatched.push(r); continue; }
    (rm.get(k) || rm.set(k, []).get(k)!).push(r);
  }
  const matched: Array<{ draftId: string; invoiceNo: string; issuedAt: string }> = [];
  const ambiguous: string[] = [];
  for (const [k, rs] of rm) {
    const ds = dm.get(k)!;
    if (ds.length !== rs.length) { ambiguous.push(...ds.map((d) => d.id)); continue; }
    ds.forEach((d, i) => matched.push({ draftId: d.id, invoiceNo: rs[i].invoiceNo, issuedAt: rs[i].issuedAt }));
  }
  return { matched, ambiguous, unmatched };
}

// ── 付款单抽取结果回核 ─────────────────────────────────────────

/** 模型从付款单文字里抽出来的金额、名称必须能在原文里找到；找不到的那条不收 */
export function verifyExtracted<T extends { buyerName?: string; amount?: number | string }>(items: T[], sourceText: string): { ok: T[]; rejected: Array<{ item: T; reason: string }> } {
  const flat = sourceText.replace(/[\s,，]/g, '');
  const ok: T[] = []; const rejected: Array<{ item: T; reason: string }> = [];
  for (const it of items) {
    const name = normalizeName(it.buyerName || '');
    const amt = toNum(it.amount);
    const forms = [amt.toFixed(2), String(amt), amt.toFixed(1)];
    if (!name || !flat.includes(name)) { rejected.push({ item: it, reason: i18nT('付款方名称在原文里找不到') }); continue; }
    if (!(amt > 0) || !forms.some((f) => flat.includes(f))) { rejected.push({ item: it, reason: i18nT('金额在原文里找不到') }); continue; }
    ok.push(it);
  }
  return { ok, rejected };
}

export function fmtRate(r: number): string { return `${round2(r * 100)}%`; }
