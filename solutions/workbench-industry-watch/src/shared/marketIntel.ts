/**
 * 盘面情报台的纯逻辑：gate.io 公共行情解析、新闻源解析、盘面事件推导、时间窗过滤。
 *
 * 主进程只负责拉（无 CORS、不被后台节流），渲染层只负责攒流和展示，
 * 两边共用这一份纯函数——解析/推导全部可以离线单测，不依赖 Electron。
 *
 * 新闻源解析移植自兄弟项目 dingpan（AI 盯盘）的 app/data/news.py / newsradar.py，
 * 保留它的防御式处理（新浪 feed.list 偶发为 null、newsnow 条目缺 title 跳过）。
 *
 * 所有事件都来自真实数据的确定性规则（阈值写在下面），绝不编造；
 * 每条事件带 url 指回 gate.io 交易页或新闻原文，可回溯。
 */

export type IntelLevel = 'high' | 'medium' | 'low';
export type IntelKind = 'mover' | 'range' | 'funding' | 'liq' | 'news';
/** 市场维度：现货全是加密；合约按 gate.io `contract_type` 分（美股 / 指数 / 金属·外汇·商品归「其它」） */
export type Market = 'crypto' | 'stocks' | 'indices' | 'other';

export type SpotRow = { pair: string; last: number; pct: number; high: number; low: number; quoteVol: number };
/** `market` 缺失 = 合约分类表没拉到（只影响美股 / 指数事件推导与标签，不影响加密） */
export type FutRow = { contract: string; last: number; pct: number; high: number; low: number; funding: number; settleVol: number; multiplier: number; market?: Market };
export type LiqRow = { contract: string; size: number; price: number; at: number };
export type NewsItem = { at: number; text: string; source: string; url: string };

export type IntelSnapshot = { fetchedAt: number; spot: SpotRow[]; futures: FutRow[]; liq: LiqRow[]; news: NewsItem[] };

export type IntelEvent = {
  id: string;
  kind: IntelKind;
  /** 事件时刻（ms）。盘面规则事件 = 首次出现的快照时刻；强平 / 新闻 = 数据自带时刻 */
  at: number;
  level: IntelLevel;
  /** gate.io 交易对（BTC_USDT）；新闻没有 */
  pair?: string;
  source: string;
  url: string;
  /** 新闻正文 / 标题 */
  text?: string;
  /** 数值字段，渲染层按 kind 取：pct / last / rate / usd / high / low */
  v: Record<string, number>;
  /** 命中的自选币 base（BTC / ETH …），用于高亮与「只看自选」 */
  hits: string[];
  /** 盘面事件 = 标的所属市场；新闻 = 命中自选的市场，否则按来源（加密媒体），再否则无 */
  market?: Market;
};

// i18n-ignore: 第三方接口字段名与站点标识，不是界面文案
export const GATE_SPOT_URL = (pair: string) => `https://www.gate.io/trade/${pair}`;
export const GATE_FUTURES_URL = (contract: string) => `https://www.gate.io/futures/USDT/${contract}`;

/** 币 / 美股代码 → 新闻关键词与搜索别名（dingpan CRYPTO_KEYWORDS 扩了美股）；未收录的只用 base 本身 */
// i18n-ignore: 匹配第三方新闻正文的关键词数据
const WATCH_KEYWORDS: Record<string, string[]> = {
  BTC: ['btc', 'bitcoin', '比特币'], ETH: ['eth', 'ethereum', '以太坊'],
  SOL: ['sol', 'solana'], DOGE: ['doge', 'dogecoin', '狗狗币'],
  XRP: ['xrp', 'ripple', '瑞波'], BNB: ['bnb', 'binance', '币安'],
  NVDA: ['nvda', 'nvidia', '英伟达'], TSLA: ['tsla', 'tesla', '特斯拉'],
  AAPL: ['aapl', 'apple', '苹果'], MSFT: ['msft', 'microsoft', '微软'],
  GOOGL: ['googl', 'google', 'alphabet', '谷歌'], AMZN: ['amzn', 'amazon', '亚马逊'],
  // 裸 meta 会撞 metaverse / metamask，只认全称与中文
  META: ['meta platforms', 'facebook', 'meta平台', '扎克伯格'],
  SPY: ['spy', 's&p 500', 's&p500', '标普'], QQQ: ['qqq', 'nasdaq 100', '纳指', '纳斯达克'],
  COIN: ['coinbase'], MSTR: ['mstr', 'microstrategy', 'strategy inc', '微策略'],
};
// i18n-ignore: gate.io contract_type 取值到市场维度的映射
const MARKET_OF: Record<string, Market> = { '': 'crypto', stocks: 'stocks', indices: 'indices', metals: 'other', forex: 'other', commodities: 'other' };
// i18n-ignore: 新闻源标识
const SOURCE_MARKET: Record<string, Market> = { cointelegraph: 'crypto', coindesk: 'crypto' };

const num = (x: unknown): number => {
  const n = typeof x === 'number' ? x : parseFloat(String(x ?? ''));
  return Number.isFinite(n) ? n : NaN;
};
const baseOf = (pair: string): string => pair.split('_')[0] || pair;

// ─── gate.io 解析 ───────────────────────────────────────────────────────────

/** `/spot/tickers` → 只留 USDT 计价、价格有效的行（其它计价对看盘没意义，还会把搜索列表撑到两千多）。 */
export function parseSpotTickers(raw: unknown): SpotRow[] {
  if (!Array.isArray(raw)) return [];
  const out: SpotRow[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const pair = String((r as any).currency_pair || '');
    const last = num((r as any).last);
    if (!/^[A-Z0-9]+_USDT$/.test(pair) || !(last > 0)) continue;
    out.push({
      pair, last,
      pct: num((r as any).change_percentage) || 0,
      high: num((r as any).high_24h) || 0,
      low: num((r as any).low_24h) || 0,
      quoteVol: num((r as any).quote_volume) || 0,
    });
  }
  return out;
}

/** `/futures/usdt/contracts` → 合约名 → `contract_type`（'' 加密 / stocks / indices / metals / forex / commodities）。 */
export function parseFuturesContracts(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!Array.isArray(raw)) return out;
  for (const r of raw) {
    const name = String((r as any)?.name || '');
    if (name) out[name] = String((r as any).contract_type ?? '');
  }
  return out;
}

/**
 * `/futures/usdt/tickers` → 涨跌 / 区间 / 资金费率 / 结算量 / 合约乘数（强平 USDT 价值 = 张数 × 乘数 × 价格）。
 * `kinds` 是 parseFuturesContracts 的结果；传 null 表示分类表没拉到，market 留空。
 */
export function parseFuturesTickers(raw: unknown, kinds: Record<string, string> | null = null): FutRow[] {
  if (!Array.isArray(raw)) return [];
  const out: FutRow[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const contract = String((r as any).contract || '');
    const last = num((r as any).last);
    if (!/^[A-Z0-9]+_USDT$/.test(contract) || !(last > 0)) continue;
    out.push({
      contract, last,
      pct: num((r as any).change_percentage) || 0,
      high: num((r as any).high_24h) || 0,
      low: num((r as any).low_24h) || 0,
      funding: num((r as any).funding_rate) || 0,
      settleVol: num((r as any).volume_24h_settle) || 0,
      multiplier: num((r as any).quanto_multiplier) || 1,
      // 分类表里没有的新合约按加密处理；认不出的新类型归「其它」
      ...(kinds ? { market: MARKET_OF[kinds[contract] ?? ''] ?? 'other' } : {}),
    });
  }
  return out;
}

/** `/futures/usdt/liq_orders?contract=X` → 强平单；`size` 负数 = 多头被平（卖出）。 */
export function parseLiqOrders(raw: unknown, contract: string): LiqRow[] {
  if (!Array.isArray(raw)) return [];
  const out: LiqRow[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const size = num((r as any).size);
    const price = num((r as any).fill_price);
    const t = num((r as any).time);
    if (!size || !(price > 0) || !(t > 0)) continue;
    out.push({ contract: String((r as any).contract || contract), size, price, at: t * 1000 });
  }
  return out;
}

// ─── 新闻解析（移植 dingpan） ───────────────────────────────────────────────

/** 新浪 7×24 `result.data.feed.list[]`；`list` 偶发为 null → 当畸形降级成空 */
export function parseSinaFeed(payload: unknown): NewsItem[] {
  const list = (payload as any)?.result?.data?.feed?.list;
  if (!Array.isArray(list)) return [];
  const out: NewsItem[] = [];
  for (const it of list) {
    const text = String(it?.rich_text || '').trim();
    if (!text) continue;
    // create_time 是北京时间「2026-10-19 09:21:39」，没有时区标记，按 +08:00 解
    const at = Date.parse(String(it?.create_time || '').replace(' ', 'T') + '+08:00');
    out.push({ at: Number.isFinite(at) ? at : 0, text, source: 'sina', url: String(it?.docurl || '').trim() });
  }
  return out;
}

const decodeEntities = (s: string): string =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ').trim();
const tagText = (block: string, tag: string): string => {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decodeEntities(m[1]) : '';
};

/**
 * RSS 2.0 → 条目（title 即快讯正文；pubDate RFC 2822，Date.parse 原生认）。
 * 主进程没有 XML 库也不加依赖：只取 <item> 里的 title / link / pubDate 三个标签，正则够用。
 */
export function parseRss(xml: string, source: string): NewsItem[] {
  if (typeof xml !== 'string' || !xml.includes('<item')) return [];
  const out: NewsItem[] = [];
  for (const m of xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)) {
    const text = tagText(m[1], 'title');
    if (!text) continue;
    const at = Date.parse(tagText(m[1], 'pubDate'));
    out.push({ at: Number.isFinite(at) ? at : 0, text, source, url: tagText(m[1], 'link') });
  }
  return out;
}

/** newsnow `{items:[{title,url,extra:{date|info}}], updatedTime}`；缺 title 的条目跳过 */
export function parseNewsnow(payload: unknown, source: string): NewsItem[] {
  const items = (payload as any)?.items;
  if (!Array.isArray(items)) return [];
  const fallbackAt = num((payload as any)?.updatedTime) || 0;
  const out: NewsItem[] = [];
  for (const it of items) {
    const text = String(it?.title || '').trim();
    if (!text) continue;
    const at = num(it?.extra?.date);
    out.push({ at: at > 0 ? at : fallbackAt, text, source, url: String(it?.url || '').trim() });
  }
  return out;
}

// ─── 事件推导 ───────────────────────────────────────────────────────────────

/** 文本命中了哪些自选币（dingpan match_hits：关键词 ≥2 字符、大小写无关、去重） */
export function matchHits(text: string, watchBases: string[]): string[] {
  const t = (text || '').toLowerCase();
  const out: string[] = [];
  for (const base of watchBases) {
    const kws = WATCH_KEYWORDS[base.toUpperCase()] || [base.toLowerCase()];
    if (kws.some((k) => k.length >= 2 && t.includes(k)) && !out.includes(base)) out.push(base);
  }
  return out;
}

/** 自选搜索：代码前缀 / 包含，或别名（英伟达 → NVDA）。返回 2 = 前缀命中（排前面），1 = 包含 / 别名，0 = 不中 */
export function searchRank(base: string, keyword: string): number {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return 0;
  const b = base.toLowerCase();
  if (b.startsWith(kw)) return 2;
  if (b.includes(kw) || (WATCH_KEYWORDS[base.toUpperCase()] || []).some((k) => k.includes(kw))) return 1;
  return 0;
}

const MIN_SPOT_VOL = 1_000_000; // 24h 成交 < 100 万 USDT 的对，±30% 也只是没流动性的噪音
const MIN_STOCK_VOL = 200_000;  // 美股 / 指数永续普遍比加密薄（实测 413 只里仅 53 只过 100 万），20 万能留住 70 来只真有人交易的
const LEVEL_PCT = { low: 5, medium: 10, high: 20 } as const;
const LEVEL_FUNDING = { low: 0.0003, medium: 0.0005, high: 0.001 } as const; // 每 8 小时费率
const LEVEL_LIQ_USD = { low: 20_000, medium: 100_000, high: 1_000_000 } as const;

function levelOf(v: number, th: { low: number; medium: number; high: number }): IntelLevel | null {
  if (v >= th.high) return 'high';
  if (v >= th.medium) return 'medium';
  if (v >= th.low) return 'low';
  return null;
}

/**
 * 从一份 gate.io 快照推导盘面事件。规则确定、阈值在上面，id 稳定——
 * 同一事实（BTC 24h 涨幅落在 5~10% 档）在连续快照里只产生一条；跨档才是新事件。
 */
export function deriveMarketEvents(snap: IntelSnapshot, watch: string[]): IntelEvent[] {
  const bases = watch.map(baseOf);
  const hitsOf = (pair: string) => (bases.includes(baseOf(pair)) ? [baseOf(pair)] : []);
  const out: IntelEvent[] = [];

  // 24h 异动：按 |涨跌幅| 取前 12，只看有流动性的对
  const movers = snap.spot
    .filter((r) => r.quoteVol >= MIN_SPOT_VOL && Math.abs(r.pct) >= LEVEL_PCT.low)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 12);
  for (const r of movers) {
    const level = levelOf(Math.abs(r.pct), LEVEL_PCT)!;
    const bucket = Math.floor(Math.abs(r.pct) / 5) * 5;
    out.push({
      id: `mover:${r.pair}:${r.pct > 0 ? 'up' : 'down'}:${bucket}`, kind: 'mover', at: snap.fetchedAt, level,
      pair: r.pair, source: 'gate-spot', url: GATE_SPOT_URL(r.pair), market: 'crypto',
      v: { pct: r.pct, last: r.last, vol: r.quoteVol }, hits: hitsOf(r.pair),
    });
  }

  // 自选触及 24h 高 / 低点（0.2% 以内）。按小时分桶：持续贴着新高每小时提醒一次而不是每分钟
  const hour = Math.floor(snap.fetchedAt / 3_600_000);
  for (const r of snap.spot) {
    if (!watch.includes(r.pair)) continue;
    const side = r.high > 0 && r.last >= r.high * 0.998 ? 'high' : r.low > 0 && r.last <= r.low * 1.002 ? 'low' : null;
    if (!side) continue;
    out.push({
      id: `range:${r.pair}:${side}:${hour}`, kind: 'range', at: snap.fetchedAt, level: 'medium',
      pair: r.pair, source: 'gate-spot', url: GATE_SPOT_URL(r.pair), market: 'crypto',
      v: { side: side === 'high' ? 1 : -1, last: r.last, high: r.high, low: r.low }, hits: hitsOf(r.pair),
    });
  }

  // 美股 / 指数 / 商品永续：没有现货，异动与高低点同一套规则从合约 ticker 推（单独取前 12，不和加密抢名额）
  const stockLike = snap.futures.filter((f) => f.market && f.market !== 'crypto');
  const stockMovers = stockLike
    .filter((f) => f.settleVol >= MIN_STOCK_VOL && Math.abs(f.pct) >= LEVEL_PCT.low)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 12);
  for (const f of stockMovers) {
    out.push({
      id: `mover:f:${f.contract}:${f.pct > 0 ? 'up' : 'down'}:${Math.floor(Math.abs(f.pct) / 5) * 5}`, kind: 'mover', at: snap.fetchedAt,
      level: levelOf(Math.abs(f.pct), LEVEL_PCT)!, pair: f.contract, source: 'gate-futures', url: GATE_FUTURES_URL(f.contract), market: f.market,
      v: { pct: f.pct, last: f.last, vol: f.settleVol }, hits: hitsOf(f.contract),
    });
  }
  for (const f of stockLike) {
    if (!watch.includes(f.contract)) continue;
    const side = f.high > 0 && f.last >= f.high * 0.998 ? 'high' : f.low > 0 && f.last <= f.low * 1.002 ? 'low' : null;
    if (!side) continue;
    out.push({
      id: `range:f:${f.contract}:${side}:${hour}`, kind: 'range', at: snap.fetchedAt, level: 'medium',
      pair: f.contract, source: 'gate-futures', url: GATE_FUTURES_URL(f.contract), market: f.market,
      v: { side: side === 'high' ? 1 : -1, last: f.last, high: f.high, low: f.low }, hits: hitsOf(f.contract),
    });
  }

  // 极端资金费率：多空拥挤度最直接的信号
  for (const f of snap.futures) {
    if (f.settleVol < MIN_SPOT_VOL) continue;
    const level = levelOf(Math.abs(f.funding), LEVEL_FUNDING);
    if (!level) continue;
    out.push({
      id: `funding:${f.contract}:${f.funding > 0 ? 'pos' : 'neg'}:${Math.floor(Math.abs(f.funding) * 10_000)}`,
      kind: 'funding', at: snap.fetchedAt, level,
      pair: f.contract, source: 'gate-futures', url: GATE_FUTURES_URL(f.contract), market: f.market,
      v: { rate: f.funding, last: f.last }, hits: hitsOf(f.contract),
    });
  }

  // 自选合约大额强平（接口自带时刻，所以能进 1h / 4h 时间窗）
  const fut = new Map(snap.futures.map((f) => [f.contract, f]));
  for (const l of snap.liq) {
    const usd = Math.abs(l.size) * (fut.get(l.contract)?.multiplier || 1) * l.price;
    const level = levelOf(usd, LEVEL_LIQ_USD);
    if (!level) continue;
    out.push({
      id: `liq:${l.contract}:${l.at}:${l.size}`, kind: 'liq', at: l.at, level,
      pair: l.contract, source: 'gate-futures', url: GATE_FUTURES_URL(l.contract), market: fut.get(l.contract)?.market,
      v: { usd, side: l.size < 0 ? 1 : -1, price: l.price }, hits: hitsOf(l.contract),
    });
  }
  return out;
}

/**
 * 新闻 → 事件。命中自选 = medium，其余 low。id 用 url（没有 url 的新浪快讯用时刻 + 正文）。
 * `watchMarket`：自选 base → 市场，命中了就把新闻归到那个市场；没命中按来源（加密媒体 → 加密），再没有就不归类。
 */
export function newsToEvents(items: NewsItem[], watch: string[], watchMarket: Record<string, Market> = {}): IntelEvent[] {
  const bases = watch.map(baseOf);
  return items.filter((n) => n.at > 0).map((n) => {
    const hits = matchHits(n.text, bases);
    return {
      id: `news:${n.source}:${n.url || `${n.at}:${n.text.slice(0, 40)}`}`, kind: 'news', at: n.at,
      level: hits.length ? 'medium' : 'low', source: n.source, url: n.url, text: n.text, v: {}, hits,
      market: hits.map((h) => watchMarket[h]).find(Boolean) ?? SOURCE_MARKET[n.source],
    };
  });
}

const STREAM_CAP = 600;

/** 并入新一批事件：同 id 保留先出现的那条（时刻 = 首次观察到），按时间倒序，截到上限。 */
export function mergeEvents(existing: IntelEvent[], incoming: IntelEvent[]): IntelEvent[] {
  const seen = new Map(existing.map((e) => [e.id, e]));
  for (const e of incoming) if (!seen.has(e.id)) seen.set(e.id, e);
  return [...seen.values()].sort((a, b) => b.at - a.at).slice(0, STREAM_CAP);
}

export type IntelFilter = { windowMs: number; type: 'all' | 'news' | 'market'; watchOnly: boolean; now: number; market?: Market | 'all' };

export function filterEvents(events: IntelEvent[], f: IntelFilter): IntelEvent[] {
  const since = f.now - f.windowMs;
  const market = f.market || 'all';
  return events.filter((e) =>
    e.at >= since && e.at <= f.now + 60_000 // 允许源时钟快一分钟，再往后的是坏时间戳
    && (f.type === 'all' || (f.type === 'news') === (e.kind === 'news'))
    // 没归类的（综合财经快讯、分类表没拉到的合约）跟着加密走——这页本来就是加密为主
    && (market === 'all' || (e.market ?? 'crypto') === market)
    && (!f.watchOnly || e.hits.length > 0));
}
