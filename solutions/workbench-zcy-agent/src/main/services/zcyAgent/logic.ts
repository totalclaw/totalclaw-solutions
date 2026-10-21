/**
 * 政采云智能体 · 纯计算（可单测，不碰 fs / electron）。
 *
 * 商品合规检查、比价基准、询价报价、订单与资质预警、读回结果的解析。
 * 价格与报价全部由这里的规则算，模型不参与；阈值来自区划规则表，不写死。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  ZcAlert, ZcCompany, ZcInquiry, ZcInquiryItem, ZcIssue, ZcOrder, ZcOrderStatus, ZcPriceRef, ZcProduct, ZcRegionRule,
} from '@totalclaw/ipc-contracts';
import KW from './keywords.json';

const K = KW as unknown as {
  product: Record<string, string[]>; order: Record<string, string[]>; orderStatus: Record<ZcOrderStatus, string[]>;
  selfRunHosts: Record<'jd' | 'tmall' | 'suning', string[]>; adWords: string[]; restrictedWords: string[]; jilinExtraWords: string[]; contactPattern: string;
};

export const cents = (v: number): number => Math.round((Number(v) || 0) * 100);
export const yuan = (c: number): number => Math.round(c) / 100;

export function toNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = Number(String(v ?? '').replace(/[,，\s¥￥元]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// ── 区划规则 ─────────────────────────────────────────

/** 内置起点：来自各地公开的操作指南与管理办法，各地会调整，界面上可改 */
export function defaultRegions(): ZcRegionRule[] {
  const base = { imageMinSide: 800, imageMin: 1, imageMaxKb: 3072, priceRule: 'avg' as const, priceTolerance: 0, refMin: 1, acceptHours: 24, titleMax: 60, titleOrder: 'brand_first' as const, reviewDays: 0, bannedWords: [...K.restrictedWords] };
  return [
    // 吉林放第一位（默认）：出处是吉林省公共资源交易中心《政采云协议商品上架指南》
    { ...base, id: 'jilin', name: i18nT('吉林'), titleOrder: 'name_first', reviewDays: 3, bannedWords: [...K.restrictedWords, ...K.jilinExtraWords], note: i18nT('吉林省上架指南：标题「商品-品牌-型号」；主图至少 1 张、JPG / PNG、单张小于 3M、不少于 800×800；销售价格不得高于市场价格，电商链接优先填京东、苏宁、天猫自营，没有自营可填旗舰店、专卖店、专营店；上架申请 3 个工作日内确认；不得跨类目、超范围上架') },
    { ...base, id: 'general', name: i18nT('通用（从严）'), note: i18nT('不确定本区划口径时用这套：售价不得高于京东、天猫、苏宁自营价的均值') },
    { ...base, id: 'zhejiang', name: i18nT('浙江'), priceTolerance: 0.1, note: i18nT('以三家自营最低 3 个价格的均价为基准，高出 10% 即价格违约（扣诚信分、暂停交易）') },
    { ...base, id: 'anhui', name: i18nT('安徽（徽采云）'), note: i18nT('高于自营均价即禁止上架；180 天无成交且无编辑的商品会被下架；未按时响应订单累计 5 次起每次扣 20 分') },
    { ...base, id: 'yunnan', name: i18nT('云南'), imageMin: 2, imageMaxKb: 1024, note: i18nT('主图至少 2 张实拍、不超过 1M、无水印无拼接') },
  ];
}

// ── 商品 ─────────────────────────────────────────

export function composeTitle(p: Pick<ZcProduct, 'brand' | 'name' | 'model'>, order: ZcRegionRule['titleOrder'] = 'brand_first'): string {
  const name = String(p.name || '').trim();
  // 品名里已经带了品牌 / 型号的不重复拼
  const part = (v: string): string => { const x = String(v || '').trim(); return x && !name.includes(x) ? x : ''; };
  const parts = order === 'name_first' ? [name, part(p.brand), part(p.model)] : [part(p.brand), name, part(p.model)];
  return parts.filter(Boolean).join(' ');
}

export function refPlatform(url: string): ZcPriceRef['platform'] {
  let host = '';
  try { host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase(); } catch { return 'other'; }
  for (const p of ['jd', 'tmall', 'suning'] as const) if (K.selfRunHosts[p].some((h) => host === h || host.endsWith(`.${h}`))) return p;
  return 'other';
}

/** 比价基准：只看三家自营平台里填了价格的链接 */
export function priceBaseline(refs: ZcPriceRef[], rule: Pick<ZcRegionRule, 'priceRule'>): { baseline: number; count: number } {
  const prices = refs.filter((r) => r.platform !== 'other' && r.price > 0).map((r) => cents(r.price)).sort((a, b) => a - b);
  if (!prices.length) return { baseline: 0, count: 0 };
  if (rule.priceRule === 'min') return { baseline: yuan(prices[0]), count: prices.length };
  const use = prices.slice(0, 3);
  return { baseline: yuan(Math.floor(use.reduce((n, x) => n + x, 0) / use.length)), count: prices.length };
}

export function bannedHits(text: string, rule: Pick<ZcRegionRule, 'bannedWords'>): string[] {
  const words = [...new Set([...rule.bannedWords, ...K.adWords])].filter(Boolean);
  return words.filter((w) => text.includes(w));
}

export function checkProduct(p: ZcProduct, rule: ZcRegionRule): ZcIssue[] {
  const out: ZcIssue[] = [];
  const err = (code: string, message: string) => out.push({ level: 'error', code, message });
  const warn = (code: string, message: string) => out.push({ level: 'warning', code, message });

  if (!p.name) err('name_missing', i18nT('没有商品名称'));
  if (!p.brand) err('brand_missing', i18nT('没有品牌：政采云上架要先有品牌，标题里也要带'));
  if (!p.model) warn('model_missing', i18nT('没有型号：同品牌多个商品时容易被判重复铺货'));
  if (!p.category) err('category_missing', i18nT('没有类目：数字员工不知道发布到哪个类目下'));

  const title = p.title || composeTitle(p, rule.titleOrder);
  if (title.length > rule.titleMax) err('title_long', i18nT('标题 {p0} 个字，超过 {p1} 个字', { p0: title.length, p1: rule.titleMax }));
  if (p.brand && !title.includes(p.brand)) warn('title_no_brand', i18nT('标题里没有品牌「{p0}」', { p0: p.brand }));
  if (p.model && !title.includes(p.model)) warn('title_no_model', i18nT('标题里没有型号「{p0}」', { p0: p.model }));
  const hits = bannedHits(`${title}\n${p.detail}\n${p.params}`, rule);
  if (hits.length) err('banned_words', i18nT('标题或详情里有禁用词：{p0}', { p0: hits.join('、') }));
  if (new RegExp(K.contactPattern, 'i').test(`${title}\n${p.detail}`)) err('contact_info', i18nT('标题或详情里有联系方式，会被驳回'));

  if (!(p.price > 0)) err('price_missing', i18nT('没有售价'));
  const selfRun = p.refs.filter((r) => r.platform !== 'other' && r.url);
  const other = p.refs.filter((r) => r.platform === 'other' && r.url);
  if (other.length) warn('ref_not_selfrun', i18nT('有 {p0} 条比价链接不是京东、天猫、苏宁的站点，不算数', { p0: other.length }));
  if (selfRun.length < rule.refMin) err('ref_missing', i18nT('比价链接不够：至少要 {p0} 条京东 / 天猫 / 苏宁自营的同款链接，现在 {p1} 条', { p0: rule.refMin, p1: selfRun.length }));
  if (selfRun.some((r) => !(r.price > 0))) err('ref_price_missing', i18nT('有比价链接没填对方的售价，算不出基准'));
  const { baseline } = priceBaseline(p.refs, rule);
  if (baseline > 0 && p.price > 0) {
    const line = yuan(Math.floor(cents(baseline) * (1 + rule.priceTolerance)));
    if (cents(p.price) > cents(line)) err('price_over', i18nT('售价 {p0} 元高于比价线 {p1} 元（基准 {p2} 元），会被判价格违规', { p0: p.price, p1: line, p2: baseline }));
    else if (cents(p.price) > cents(baseline)) warn('price_above_base', i18nT('售价 {p0} 元高于自营基准价 {p1} 元，还在容忍线内，建议降到基准以下', { p0: p.price, p1: baseline }));
  }

  if (p.images.length < rule.imageMin) err('image_few', i18nT('主图至少 {p0} 张，现在 {p1} 张', { p0: rule.imageMin, p1: p.images.length }));
  for (const im of p.images) {
    const name = im.path.split(/[\\/]/).pop() || im.path;
    if (!/\.(jpe?g|png)$/i.test(im.path)) err('image_type', i18nT('{p0} 不是 JPG / PNG', { p0: name }));
    if (im.width && Math.min(im.width, im.height) < rule.imageMinSide) err('image_small', i18nT('{p0} 只有 {p1}×{p2}，最短边要 {p3} 以上', { p0: name, p1: im.width, p2: im.height, p3: rule.imageMinSide }));
    if (im.kb > rule.imageMaxKb) err('image_big', i18nT('{p0} 有 {p1}KB，超过 {p2}KB', { p0: name, p1: im.kb, p2: rule.imageMaxKb }));
    if (!im.width) warn('image_unread', i18nT('{p0} 读不出尺寸，文件可能不在了', { p0: name }));
  }
  if (!(p.stock > 0)) warn('stock_zero', i18nT('库存是 0'));
  if (!p.params.trim()) warn('params_empty', i18nT('没有参数：带「标」的类目要把参数补全才能过审'));
  return out;
}

/** 模型写的详情里出现了参数里没有的数字：标出来交人看 */
export function strayNumbers(detail: string, source: string): string[] {
  const have = new Set((source.match(/\d+(?:\.\d+)?/g) || []));
  return [...new Set((detail.match(/\d+(?:\.\d+)?/g) || []).filter((n) => !have.has(n) && n.length > 1))];
}

// ── 询价报价 ─────────────────────────────────────────

/**
 * 报价 = 成本 ×（1 + 毛利率），进到分；有单价限价且算出来超了就压到限价。
 * 限价低于成本、合计超预算都是错误：这单不该报，交人决定。
 */
export function priceInquiry(inq: Pick<ZcInquiry, 'items' | 'margin' | 'budget'>): { items: ZcInquiryItem[]; total: number; issues: ZcIssue[] } {
  const issues: ZcIssue[] = [];
  const items = inq.items.map((it) => {
    const cost = cents(it.cost);
    if (!(cost > 0)) { issues.push({ level: 'error', code: 'cost_missing', message: i18nT('「{p0}」还没填成本，算不了报价', { p0: it.name }) }); return { ...it, quote: 0 }; }
    let quote = Math.ceil(cost * (1 + inq.margin) - 1e-6);
    const ceiling = cents(it.ceiling);
    if (ceiling > 0 && ceiling < cost) issues.push({ level: 'error', code: 'ceiling_below_cost', message: i18nT('「{p0}」最高限价 {p1} 元低于成本 {p2} 元，报了就亏', { p0: it.name, p1: it.ceiling, p2: it.cost }) });
    if (ceiling > 0 && quote > ceiling) {
      quote = ceiling;
      if (ceiling >= cost) issues.push({ level: 'warning', code: 'capped', message: i18nT('「{p0}」按最高限价 {p1} 元报，毛利率只有 {p2}%', { p0: it.name, p1: it.ceiling, p2: (Math.round(((ceiling - cost) / cost) * 1000) / 10) }) });
    }
    return { ...it, quote: yuan(quote) };
  });
  const total = yuan(items.reduce((n, it) => n + Math.round(cents(it.quote) * (it.qty || 0)), 0));
  if (inq.budget > 0 && cents(total) > cents(inq.budget)) issues.push({ level: 'error', code: 'over_budget', message: i18nT('报价合计 {p0} 元超过预算 {p1} 元', { p0: total, p1: inq.budget }) });
  if (items.some((it) => !(it.qty > 0))) issues.push({ level: 'warning', code: 'qty_missing', message: i18nT('有明细没有数量，合计不准') });
  return { items, total, issues };
}

// ── 预警 ─────────────────────────────────────────

const HOUR = 3600_000;

export function buildAlerts(input: { orders: ZcOrder[]; inquiries: ZcInquiry[]; products: ZcProduct[]; company: ZcCompany; rule: ZcRegionRule; now: number }): ZcAlert[] {
  const out: ZcAlert[] = [];
  const { now, rule } = input;
  for (const o of input.orders) {
    const t = Date.parse(o.createdAt);
    if (o.status === 'to_accept') {
      if (!Number.isFinite(t)) { out.push({ level: 'warning', kind: 'order_accept', refId: o.id, text: i18nT('订单 {p0} 待接单（读不出下单时间，尽快处理）', { p0: o.orderNo }) }); continue; }
      const left = rule.acceptHours - (now - t) / HOUR;
      if (left <= 0) out.push({ level: 'error', kind: 'order_accept', refId: o.id, text: i18nT('订单 {p0} 已超过 {p1} 小时接单时限', { p0: o.orderNo, p1: rule.acceptHours }) });
      else out.push({ level: left <= rule.acceptHours / 2 ? 'error' : 'warning', kind: 'order_accept', refId: o.id, text: i18nT('订单 {p0} 待接单，还剩 {p1} 小时', { p0: o.orderNo, p1: Math.max(1, Math.floor(left)) }) });
    } else if (o.status === 'to_ship' && Number.isFinite(t) && now - t > 48 * HOUR) {
      out.push({ level: 'warning', kind: 'order_ship', refId: o.id, text: i18nT('订单 {p0} 下单已超过 48 小时还没发货', { p0: o.orderNo }) });
    }
  }
  for (const q of input.inquiries) {
    if (!['new', 'priced', 'confirmed', 'handed'].includes(q.status)) continue;
    const t = Date.parse(q.deadline);
    if (!Number.isFinite(t)) continue;
    const left = (t - now) / HOUR;
    if (left <= 0) out.push({ level: 'error', kind: 'inquiry_deadline', refId: q.id, text: i18nT('询价单「{p0}」已过报价截止时间', { p0: q.title || q.no }) });
    else if (left <= 24) out.push({ level: 'error', kind: 'inquiry_deadline', refId: q.id, text: i18nT('询价单「{p0}」还剩 {p1} 小时截止', { p0: q.title || q.no, p1: Math.max(1, Math.floor(left)) }) });
    else if (left <= 72) out.push({ level: 'warning', kind: 'inquiry_deadline', refId: q.id, text: i18nT('询价单「{p0}」还剩 {p1} 天截止', { p0: q.title || q.no, p1: Math.floor(left / 24) }) });
  }
  for (const q of input.company.qualifications) {
    if (!q.expireAt) continue;
    const t = Date.parse(`${q.expireAt}T23:59:59`);
    if (!Number.isFinite(t)) continue;
    const days = Math.floor((t - now) / (24 * HOUR));
    if (days < 0) out.push({ level: 'error', kind: 'qualification', refId: q.id, text: i18nT('资质「{p0}」已过期', { p0: q.name }) });
    else if (days <= 30) out.push({ level: 'warning', kind: 'qualification', refId: q.id, text: i18nT('资质「{p0}」还有 {p1} 天到期', { p0: q.name, p1: days }) });
  }
  for (const p of input.products) {
    if (p.status !== 'listed') continue;
    const { baseline } = priceBaseline(p.refs, rule);
    if (baseline > 0 && cents(p.price) > Math.floor(cents(baseline) * (1 + rule.priceTolerance))) {
      out.push({ level: 'error', kind: 'price', refId: p.id, text: i18nT('在售商品「{p0}」售价 {p1} 元高于比价线（基准 {p2} 元），抽检会被处罚', { p0: p.title || p.name, p1: p.price, p2: baseline }) });
    }
  }
  return out.sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1));
}

// ── 表格导入 ─────────────────────────────────────────

const nh = (h: string): string => String(h || '').replace(/[\s:：*()（）]/g, '').toLowerCase();

export function detectCols(headers: string[], table: Record<string, string[]>): Record<string, string> {
  const out: Record<string, string> = {};
  const used = new Set<string>();
  for (const pass of ['exact', 'include'] as const) {
    for (const [key, kws] of Object.entries(table)) {
      if (out[key]) continue;
      for (const kw of kws) {
        const hit = headers.find((h) => !used.has(h) && (pass === 'exact' ? nh(h) === nh(kw) : nh(h).includes(nh(kw))));
        if (hit) { out[key] = hit; used.add(hit); break; }
      }
    }
  }
  return out;
}

export type ProductSeed = Pick<ZcProduct, 'name' | 'brand' | 'model' | 'category' | 'price' | 'stock' | 'unit' | 'params' | 'detail'> & { refs: ZcPriceRef[]; imagePaths: string[] };

export function parseProductsTable(table: { headers: string[]; rows: Record<string, string>[] }): ProductSeed[] {
  const m = detectCols(table.headers, K.product);
  if (!m.name) throw new Error(i18nT('这张表里找不到商品名称一列'));
  const g = (r: Record<string, string>, k: string): string => (m[k] ? String(r[m[k]] ?? '').trim() : '');
  return table.rows.map((r) => {
    const refPrice = toNum(g(r, 'refPrice'));
    const refs: ZcPriceRef[] = [];
    for (const k of ['jd', 'tmall', 'suning'] as const) {
      const cell = g(r, k);
      if (!cell) continue;
      const url = (cell.match(/https?:\/\/\S+/) || [])[0] || '';
      const price = toNum(cell.replace(url, '')) || (url ? refPrice : toNum(cell));
      if (url) refs.push({ platform: refPlatform(url), url, price });
    }
    return {
      name: g(r, 'name'), brand: g(r, 'brand'), model: g(r, 'model'), category: g(r, 'category'), price: toNum(g(r, 'price')), stock: toNum(g(r, 'stock')),
      unit: g(r, 'unit'), params: g(r, 'params').replace(/[;；]\s*/g, '\n'), detail: g(r, 'detail'), refs,
      imagePaths: g(r, 'images').split(/[\n;；,，|]/).map((x) => x.trim()).filter(Boolean),
    };
  }).filter((p) => p.name);
}

export function parseOrderStatus(text: string): ZcOrderStatus | '' {
  const s = String(text || '').replace(/\s/g, '');
  if (!s) return '';
  for (const [k, kws] of Object.entries(K.orderStatus) as Array<[ZcOrderStatus, string[]]>) if (kws.some((w) => s.includes(w))) return k;
  return (Object.keys(K.orderStatus) as ZcOrderStatus[]).includes(s as ZcOrderStatus) ? (s as ZcOrderStatus) : '';
}

/** 「2026-10-09 14:30」「2026/10/9」→ ISO；认不出返回空 */
export function parseTime(v: unknown): string {
  const s = String(v ?? '').trim().replace(/[年月/.]/g, '-').replace(/日/g, ' ').replace(/\s+/g, ' ');
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(s);
  if (!m) return '';
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0), Number(m[6] || 0));
  return Number.isFinite(d.getTime()) ? d.toISOString() : '';
}

export type OrderSeed = Pick<ZcOrder, 'orderNo' | 'buyer' | 'buyerTaxNo' | 'amount' | 'createdAt' | 'status' | 'items' | 'logisticsCompany' | 'logisticsNo'>;

export function normalizeOrders(list: any[]): { orders: OrderSeed[]; dropped: number } {
  const orders: OrderSeed[] = [];
  let dropped = 0;
  for (const x of Array.isArray(list) ? list : []) {
    const orderNo = String(x?.orderNo ?? x?.no ?? '').replace(/\s/g, '');
    const status = parseOrderStatus(String(x?.status ?? ''));
    // 没有订单号或认不出状态的不收：宁可少一条，不能把猜的状态写进台账
    if (!orderNo || !status) { dropped += 1; continue; }
    orders.push({
      orderNo, buyer: String(x?.buyer ?? '').trim(), buyerTaxNo: String(x?.buyerTaxNo ?? '').replace(/\s/g, '').toUpperCase(),
      amount: toNum(x?.amount), createdAt: parseTime(x?.createdAt), status, items: String(x?.items ?? '').trim().slice(0, 300),
      logisticsCompany: String(x?.logisticsCompany ?? '').trim(), logisticsNo: String(x?.logisticsNo ?? '').trim(),
    });
  }
  return { orders, dropped };
}

export function parseOrdersTable(table: { headers: string[]; rows: Record<string, string>[] }): { orders: OrderSeed[]; dropped: number } {
  const m = detectCols(table.headers, K.order);
  if (!m.orderNo || !m.status) throw new Error(i18nT('这张表里找不到「订单编号」和「订单状态」两列'));
  return normalizeOrders(table.rows.map((r) => Object.fromEntries(Object.entries(m).map(([k, h]) => [k, r[h]]))));
}

export type InquirySeed = Pick<ZcInquiry, 'no' | 'title' | 'buyer' | 'deadline' | 'budget' | 'url'> & { items: Array<Pick<ZcInquiryItem, 'name' | 'spec' | 'qty' | 'unit' | 'ceiling'>> };

export function normalizeInquiries(list: any[]): { inquiries: InquirySeed[]; dropped: number } {
  const inquiries: InquirySeed[] = [];
  let dropped = 0;
  for (const x of Array.isArray(list) ? list : []) {
    const no = String(x?.no ?? x?.inquiryNo ?? '').replace(/\s/g, '');
    const title = String(x?.title ?? '').trim();
    if (!no && !title) { dropped += 1; continue; }
    const items = (Array.isArray(x?.items) ? x.items : []).map((it: any) => ({
      name: String(it?.name ?? '').trim(), spec: String(it?.spec ?? '').trim(), qty: toNum(it?.qty), unit: String(it?.unit ?? '').trim(), ceiling: toNum(it?.ceiling),
    })).filter((it: { name: string }) => it.name);
    inquiries.push({ no, title, buyer: String(x?.buyer ?? '').trim(), deadline: parseTime(x?.deadline), budget: toNum(x?.budget), url: /^https?:\/\//.test(String(x?.url ?? '')) ? String(x.url) : '', items });
  }
  return { inquiries, dropped };
}

/** 从数字员工的回复里取结果：认 ```json 代码块，其次认第一段 [...] */
export function parseAgentJson(text: string): any[] {
  const src = String(text || '');
  const blocks = [...src.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map((m) => m[1]);
  const candidates = [...blocks.reverse()];
  const a = src.indexOf('['); const b = src.lastIndexOf(']');
  if (a >= 0 && b > a) candidates.push(src.slice(a, b + 1));
  for (const c of candidates) {
    try {
      const v = JSON.parse(c.trim());
      if (Array.isArray(v)) return v;
      if (Array.isArray(v?.orders)) return v.orders;
      if (Array.isArray(v?.inquiries)) return v.inquiries;
      if (Array.isArray(v?.items)) return v.items;
    } catch { /* 试下一段 */ }
  }
  throw new Error(i18nT('回复里没有找到结果清单：数字员工可能还没做完，或者停在登录 / 验证码上了'));
}
