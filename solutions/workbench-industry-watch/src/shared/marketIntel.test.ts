/**
 * 盘面情报纯逻辑护栏：gate.io / 新闻源解析对畸形输入降级为空，事件推导阈值与去重 id 钉死。
 * 样本取自 2026-10-19 真实接口返回（截短）。
 */
import { describe, it, expect } from 'vitest';
import {
  parseSpotTickers, parseFuturesTickers, parseFuturesContracts, parseLiqOrders, parseSinaFeed, parseRss, parseNewsnow,
  matchHits, searchRank, deriveMarketEvents, newsToEvents, mergeEvents, filterEvents, type IntelSnapshot,
} from './marketIntel';

const NOW = Date.parse('2026-10-19T01:30:00Z');

describe('gate.io 解析', () => {
  it('spot：只留 USDT 对，数字字段转数值，非数组降级为空', () => {
    const rows = parseSpotTickers([
      { currency_pair: 'BTC_USDT', last: '82499.2', change_percentage: '1.07', quote_volume: '533760844.16', high_24h: '82534', low_24h: '80682.2' },
      { currency_pair: 'ETH_BTC', last: '0.05', change_percentage: '0' },
      { currency_pair: 'BAD_USDT', last: 'nope' },
      null, 'junk',
    ]);
    expect(rows).toEqual([{ pair: 'BTC_USDT', last: 82499.2, pct: 1.07, high: 82534, low: 80682.2, quoteVol: 533760844.16 }]);
    expect(parseSpotTickers({ message: 'error' })).toEqual([]);
  });
  it('futures：资金费率 / 结算量 / 乘数；liq：time 秒 → ms，size 为 0 跳过', () => {
    expect(parseFuturesTickers([{ contract: 'BTC_USDT', last: '82443.7', change_percentage: '-0.5', high_24h: '83000', low_24h: '82000', funding_rate: '0.000066', volume_24h_settle: '3527619621', quanto_multiplier: '0.0001' }]))
      .toEqual([{ contract: 'BTC_USDT', last: 82443.7, pct: -0.5, high: 83000, low: 82000, funding: 0.000066, settleVol: 3527619621, multiplier: 0.0001 }]);
    expect(parseLiqOrders([{ contract: 'BTC_USDT', size: '-560', fill_price: '82463', time: 1792372148 }, { size: '0', fill_price: '1', time: 1 }], 'BTC_USDT'))
      .toEqual([{ contract: 'BTC_USDT', size: -560, price: 82463, at: 1792372148000 }]);
  });
  it('contracts：contract_type 分类（样本取自 2026-10-19 真实返回）→ 合约带 market；没有分类表就不带', () => {
    const kinds = parseFuturesContracts([
      { name: 'BTC_USDT', contract_type: '' }, { name: 'AAPL_USDT', contract_type: 'stocks' }, { name: 'NAS100_USDT', contract_type: 'indices' },
      { name: 'XAU_USDT', contract_type: 'metals' }, { name: 'EURUSD_USDT', contract_type: 'forex' }, { name: 'WEIRD_USDT', contract_type: 'bonds' }, { contract_type: 'stocks' },
    ]);
    expect(kinds).toEqual({ BTC_USDT: '', AAPL_USDT: 'stocks', NAS100_USDT: 'indices', XAU_USDT: 'metals', EURUSD_USDT: 'forex', WEIRD_USDT: 'bonds' });
    expect(parseFuturesContracts({ message: 'rate limited' })).toEqual({});
    const raw = ['BTC', 'AAPL', 'NAS100', 'XAU', 'EURUSD', 'WEIRD', 'NEWLISTING'].map((b) => ({ contract: `${b}_USDT`, last: '1' }));
    expect(parseFuturesTickers(raw, kinds).map((f) => f.market)).toEqual(['crypto', 'stocks', 'indices', 'other', 'other', 'other', 'crypto']);
    expect(parseFuturesTickers(raw).every((f) => f.market === undefined)).toBe(true);
  });
});

describe('新闻源解析（移植 dingpan）', () => {
  it('新浪 7×24：create_time 按北京时间解，空正文跳过，list 为 null 降级为空', () => {
    const items = parseSinaFeed({ result: { data: { feed: { list: [
      { rich_text: '比亚迪：方程豹汽车60万台销量达成。', create_time: '2026-10-19 09:24:18', docurl: '' },
      { rich_text: '  ', create_time: '2026-10-19 09:25:00' },
    ] } } } });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ source: 'sina', url: '', at: Date.parse('2026-10-19T01:24:18Z') });
    expect(parseSinaFeed({ result: { data: { feed: { list: null } } } })).toEqual([]);
    expect(parseSinaFeed(undefined)).toEqual([]);
  });
  it('RSS：CDATA 剥壳、pubDate RFC2822、坏 XML 降级为空', () => {
    const xml = `<rss><channel><item><title><![CDATA[SEC tokenized stock &amp; Broadcom]]></title><link>https://www.coindesk.com/a</link><pubDate>Sun, 18 Oct 2026 23:28:06 +0000</pubDate></item>
      <item><title>  Qubic   freezes chain </title><link><![CDATA[https://cointelegraph.com/b?utm=rss]]></link><pubDate>garbage</pubDate></item>
      <item><title></title></item></channel></rss>`;
    const items = parseRss(xml, 'coindesk');
    expect(items).toEqual([
      { at: Date.parse('2026-10-18T23:28:06Z'), text: 'SEC tokenized stock & Broadcom', source: 'coindesk', url: 'https://www.coindesk.com/a' },
      { at: 0, text: 'Qubic freezes chain', source: 'coindesk', url: 'https://cointelegraph.com/b?utm=rss' },
    ]);
    expect(parseRss('<!DOCTYPE html><html>blocked</html>', 'x')).toEqual([]);
  });
  it('newsnow：extra.date 优先，缺则回落 updatedTime；无 title 跳过', () => {
    const items = parseNewsnow({ updatedTime: 1792371695307, items: [
      { title: '台湾证交所加权股价指数盘初下跌1.3%', url: 'https://wallstreetcn.com/livenews/3180751', extra: { date: 1792371671000 } },
      { title: '【早报】金融街论坛今日开幕', url: 'https://www.cls.cn/detail/2507781' },
      { url: 'https://x' }, 7,
    ] }, 'wallstreetcn');
    expect(items.map((i) => i.at)).toEqual([1792371671000, 1792371695307]);
    expect(parseNewsnow({ status: 'error' }, 'x')).toEqual([]);
  });
});

describe('事件推导', () => {
  const snap: IntelSnapshot = {
    fetchedAt: NOW,
    spot: [
      { pair: 'BTC_USDT', last: 82499, pct: 1.07, high: 82534, low: 80682, quoteVol: 5e8 }, // 贴 24h 高点
      { pair: 'PUMP_USDT', last: 1, pct: 23.5, high: 1.1, low: 0.7, quoteVol: 2e6 },       // high 档异动
      { pair: 'THIN_USDT', last: 1, pct: 40, high: 2, low: 0.5, quoteVol: 1000 },           // 没流动性 → 忽略
      { pair: 'DIP_USDT', last: 1, pct: -6, high: 2, low: 0.9, quoteVol: 3e6 },             // low 档
    ],
    futures: [
      { contract: 'BTC_USDT', last: 82443, pct: 1, high: 82534, low: 80682, funding: 0.000066, settleVol: 3.5e9, multiplier: 0.0001, market: 'crypto' },
      { contract: 'HOT_USDT', last: 10, pct: 0, high: 11, low: 9, funding: 0.0012, settleVol: 5e6, multiplier: 1, market: 'crypto' },
    ],
    liq: [
      { contract: 'BTC_USDT', size: -560, price: 82463, at: NOW - 600_000 },  // 560×0.0001×82463 ≈ 4.6k → 低于 low 阈值，忽略
      { contract: 'BTC_USDT', size: -20000, price: 82463, at: NOW - 60_000 }, // ≈ 165k → medium
    ],
    news: [],
  };
  it('异动按流动性过滤、按档分级；自选贴高点出 range；极端费率出 funding；强平按 USDT 价值分级', () => {
    const ev = deriveMarketEvents(snap, ['BTC_USDT']);
    const byKind = (k: string) => ev.filter((e) => e.kind === k);
    expect(byKind('mover').map((e) => [e.pair, e.level])).toEqual([['PUMP_USDT', 'high'], ['DIP_USDT', 'low']]);
    expect(byKind('range')).toHaveLength(1);
    expect(byKind('range')[0]).toMatchObject({ pair: 'BTC_USDT', hits: ['BTC'], v: { side: 1 } });
    expect(byKind('funding').map((e) => [e.pair, e.level])).toEqual([['HOT_USDT', 'high']]);
    expect(byKind('liq')).toHaveLength(1);
    expect(byKind('liq')[0].level).toBe('medium');
    expect(byKind('liq')[0].at).toBe(NOW - 60_000);
    for (const e of ev) expect(e.url).toMatch(/^https:\/\/www\.gate\.io\//);
  });
  it('同一事实在连续快照里 id 稳定，merge 保留首见时刻；跨档才是新事件', () => {
    const first = deriveMarketEvents(snap, ['BTC_USDT']);
    const later: IntelSnapshot = { ...snap, fetchedAt: NOW + 120_000, spot: snap.spot.map((r) => r.pair === 'DIP_USDT' ? { ...r, pct: -7 } : r) };
    const merged = mergeEvents(first, deriveMarketEvents(later, ['BTC_USDT']));
    const dip = merged.filter((e) => e.pair === 'DIP_USDT');
    expect(dip).toHaveLength(1);
    expect(dip[0].at).toBe(NOW);
    const crossed: IntelSnapshot = { ...later, spot: snap.spot.map((r) => r.pair === 'DIP_USDT' ? { ...r, pct: -11 } : r) };
    expect(mergeEvents(merged, deriveMarketEvents(crossed, ['BTC_USDT'])).filter((e) => e.pair === 'DIP_USDT')).toHaveLength(2);
  });
  it('新闻命中自选 → medium + hits；时间窗 / 类型 / 只看自选 过滤', () => {
    const news = newsToEvents([
      { at: NOW - 30 * 60_000, text: 'Bitcoin price steadies around $82K', source: 'cointelegraph', url: 'https://c/1' },
      { at: NOW - 5 * 3_600_000, text: '金融街论坛今日开幕', source: 'cls-hot', url: 'https://c/2' },
      { at: 0, text: '坏时间戳', source: 'sina', url: '' },
    ], ['BTC_USDT', 'ETH_USDT']);
    expect(news).toHaveLength(2);
    expect(news[0]).toMatchObject({ level: 'medium', hits: ['BTC'] });
    expect(news[1]).toMatchObject({ level: 'low', hits: [] });
    const all = mergeEvents(news, deriveMarketEvents(snap, ['BTC_USDT']));
    expect(filterEvents(all, { windowMs: 3_600_000, type: 'news', watchOnly: false, now: NOW }).map((e) => e.text)).toEqual(['Bitcoin price steadies around $82K']);
    expect(filterEvents(all, { windowMs: 24 * 3_600_000, type: 'news', watchOnly: false, now: NOW })).toHaveLength(2);
    expect(filterEvents(all, { windowMs: 3_600_000, type: 'market', watchOnly: true, now: NOW }).every((e) => e.hits.includes('BTC'))).toBe(true);
    expect(filterEvents(all, { windowMs: 3_600_000, type: 'market', watchOnly: true, now: NOW }).length).toBeGreaterThan(0);
  });
  it('matchHits：全名 / 中文别名都算，未收录的币用 base 本身；美股中文名也命中', () => {
    expect(matchHits('以太坊 ETF 获批，Solana 跟涨', ['ETH', 'SOL', 'PEPE'])).toEqual(['ETH', 'SOL']);
    expect(matchHits('PEPE surges', ['PEPE'])).toEqual(['PEPE']);
    expect(matchHits('英伟达市值再创新高，特斯拉 Robotaxi 扩城', ['NVDA', 'TSLA', 'AAPL'])).toEqual(['NVDA', 'TSLA']);
    expect(matchHits('Metaverse token rallies on MetaMask news', ['META'])).toEqual([]); // 裸 meta 不算
    expect(matchHits('Meta Platforms beats estimates', ['META'])).toEqual(['META']);
  });
  it('searchRank：代码前缀 2、包含 / 中文别名 1、不中 0', () => {
    expect(searchRank('NVDA', 'nv')).toBe(2);
    expect(searchRank('NVDA', '英伟达')).toBe(1);
    expect(searchRank('WBTC', 'BTC')).toBe(1);
    expect(searchRank('BTC', 'BTC')).toBe(2);
    expect(searchRank('NVDA', 'tesla')).toBe(0);
    expect(searchRank('NVDA', '  ')).toBe(0);
  });
});

describe('美股 / 指数永续事件（同一套规则，从合约 ticker 推）', () => {
  const snap: IntelSnapshot = {
    fetchedAt: NOW, spot: [], liq: [], news: [],
    futures: [
      { contract: 'SOXL_USDT', last: 40, pct: 9.27, high: 40.5, low: 36, funding: 0, settleVol: 5.3e7, multiplier: 1, market: 'stocks' },  // low 档异动（5~10）
      { contract: 'NVDA_USDT', last: 217.6, pct: 2.03, high: 217.69, low: 211.4, funding: 0, settleVol: 7.4e6, multiplier: 0.01, market: 'stocks' }, // 自选贴高点
      { contract: 'THIN_USDT', last: 1, pct: 30, high: 2, low: 0.5, funding: 0, settleVol: 50_000, multiplier: 1, market: 'stocks' },        // 20 万以下没流动性 → 忽略
      { contract: 'TSLA_USDT', last: 357, pct: 2.09, high: 365, low: 347, funding: 0.001284, settleVol: 7.7e6, multiplier: 0.01, market: 'stocks' }, // 极端费率
      { contract: 'NAS100_USDT', last: 25000, pct: 6, high: 25100, low: 23500, funding: 0, settleVol: 3e5, multiplier: 1, market: 'indices' },
      { contract: 'UNKNOWN_USDT', last: 1, pct: 50, high: 2, low: 0.5, funding: 0, settleVol: 1e8, multiplier: 1 },                          // 没分类 → 不当美股推
    ],
  };
  it('异动按 20 万结算量过滤、带 market 与合约页链接；自选贴高点出 range；费率沿用；未分类合约不推', () => {
    const ev = deriveMarketEvents(snap, ['NVDA_USDT']);
    const movers = ev.filter((e) => e.kind === 'mover');
    expect(movers.map((e) => [e.pair, e.level, e.market])).toEqual([['SOXL_USDT', 'low', 'stocks'], ['NAS100_USDT', 'low', 'indices']]);
    expect(movers[0].url).toBe('https://www.gate.io/futures/USDT/SOXL_USDT');
    expect(movers[0].source).toBe('gate-futures');
    const range = ev.filter((e) => e.kind === 'range');
    expect(range).toHaveLength(1);
    expect(range[0]).toMatchObject({ pair: 'NVDA_USDT', market: 'stocks', hits: ['NVDA'], v: { side: 1 } });
    expect(ev.filter((e) => e.kind === 'funding').map((e) => [e.pair, e.level, e.market])).toEqual([['TSLA_USDT', 'high', 'stocks']]);
    expect(ev.some((e) => e.pair === 'UNKNOWN_USDT')).toBe(false);
    expect(ev.some((e) => e.pair === 'THIN_USDT')).toBe(false);
  });
  it('新闻按命中自选归市场，加密媒体默认加密；市场筛选：未归类的跟加密走', () => {
    const news = newsToEvents([
      { at: NOW - 60_000, text: '英伟达盘后大涨', source: 'sina', url: 'https://s/1' },
      { at: NOW - 60_000, text: 'ETF inflows continue', source: 'coindesk', url: 'https://c/1' },
      { at: NOW - 60_000, text: '金融街论坛今日开幕', source: 'cls-hot', url: 'https://c/2' },
    ], ['NVDA_USDT', 'BTC_USDT'], { NVDA: 'stocks', BTC: 'crypto' });
    expect(news.map((n) => n.market)).toEqual(['stocks', 'crypto', undefined]);
    const all = mergeEvents(news, deriveMarketEvents(snap, ['NVDA_USDT']));
    const f = { windowMs: 3_600_000, type: 'all' as const, watchOnly: false, now: NOW };
    expect(filterEvents(all, { ...f, market: 'stocks' }).map((e) => e.pair || e.text).sort()).toEqual(['NVDA_USDT', 'SOXL_USDT', 'TSLA_USDT', '英伟达盘后大涨']);
    expect(filterEvents(all, { ...f, market: 'indices' }).map((e) => e.pair)).toEqual(['NAS100_USDT']);
    expect(filterEvents(all, { ...f, market: 'crypto' }).map((e) => e.text).sort()).toEqual(['ETF inflows continue', '金融街论坛今日开幕']);
    expect(filterEvents(all, f)).toHaveLength(all.length);
  });
});
