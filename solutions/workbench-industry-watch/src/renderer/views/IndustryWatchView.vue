<template>
  <div class="intel-page">
    <header class="intel-hero">
      <PageBackButton />
      <div class="hero-text">
        <p class="hero-kicker"><i class="ri-radar-line"></i>{{ $t('盯盘复盘助手') }}</p>
        <h1>{{ $t('24 小时盘面情报') }}</h1>
        <p class="hero-sub">{{ $t('加密与美股 7×24 不收盘：gate.io 现货与永续行情异动、多源新闻快讯汇成同一条时间线，每条可回溯原文，随时 AI 研判。') }}</p>
      </div>
      <div class="hero-actions">
        <button class="ghost-btn" type="button" @click="autoOn = !autoOn">
          <i :class="autoOn ? 'ri-pause-line' : 'ri-play-line'"></i>
          {{ autoOn ? $t('暂停自动刷新') : $t('恢复自动刷新') }}
        </button>
        <button class="primary-btn" type="button" :disabled="busy" @click="refresh">
          <i :class="busy ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ busy ? $t('刷新中…') : $t('立即刷新') }}
        </button>
      </div>
    </header>

    <!-- 状态条常驻视口顶部：刷新状态、各源成败、筛选都在这一条上，滚到哪都看得见 -->
    <section class="intel-bar">
      <div class="bar-status">
        <span class="live-dot" :class="{ beat: autoOn && !pageErr, err: !!pageErr }"></span>
        <strong v-if="busy && !lastAt">{{ $t('正在拉取行情与快讯…') }}</strong>
        <strong v-else-if="lastAt">{{ $t('最近更新 {p0}', { p0: lastAt }) }}</strong>
        <small v-if="lastAt">{{ autoOn ? $t('每 90 秒自动刷新') : $t('自动刷新已暂停') }}</small>
        <span v-for="(err, key) in sourceErrors" :key="key" class="src-err" :title="err">
          <i class="ri-error-warning-line"></i>{{ sourceLabel(String(key)) }}
        </span>
      </div>
      <div class="bar-filters">
        <div class="seg" role="tablist">
          <button v-for="w in WINDOWS" :key="w.ms" type="button" :class="{ on: windowMs === w.ms }" @click="windowMs = w.ms">{{ w.label }}</button>
        </div>
        <div class="seg" role="tablist">
          <button type="button" :class="{ on: typeFilter === 'all' }" @click="typeFilter = 'all'">{{ $t('全部') }}</button>
          <button type="button" :class="{ on: typeFilter === 'market' }" @click="typeFilter = 'market'">{{ $t('盘面异动') }}</button>
          <button type="button" :class="{ on: typeFilter === 'news' }" @click="typeFilter = 'news'">{{ $t('新闻') }}</button>
        </div>
        <!-- 市场维度。美股永续 7×24 有价，但标的只在美东交易时段真成交——徽标告诉用户现在的价是不是在跟活盘 -->
        <div class="seg" role="tablist">
          <button v-for="m in MARKETS" :key="m.id" type="button" :class="{ on: marketFilter === m.id }" :title="m.id === 'stocks' ? $t('美股盘态按美东时间（含夏令时）计算') : undefined" @click="marketFilter = m.id">
            {{ m.label }}<small v-if="m.id === 'stocks'" class="session" :class="usSession">{{ usSessionLabel }}</small>
          </button>
        </div>
        <label class="toggle"><input v-model="watchOnly" type="checkbox" />{{ $t('只看自选') }}</label>
      </div>
    </section>

    <div class="intel-grid">
      <!-- 主栏：情报流。每条都指回 gate.io 交易页或新闻原文，点得回去才算证据。 -->
      <section class="stream-card">
        <div class="card-head">
          <h2>{{ $t('情报流') }}</h2>
          <small>{{ $t('{p0} 条 · {p1}', { p0: visible.length, p1: windowLabel }) }}</small>
        </div>
        <p v-if="pageErr" class="state-err"><i class="ri-wifi-off-line"></i>{{ pageErr }}</p>
        <div v-else-if="!events.length && busy" class="state-empty">
          <span v-for="n in 4" :key="n" class="skeleton"></span>
        </div>
        <p v-else-if="!visible.length" class="state-empty">{{ $t('这个时间窗内没有符合条件的情报——试试放宽到 24 小时或取消「只看自选」。') }}</p>
        <ol v-else class="stream">
          <li v-for="e in visible" :key="e.id" class="item" :class="[`is-${e.level}`, { 'is-hit': e.hits.length }]">
            <time class="item-time" :datetime="new Date(e.at).toISOString()">{{ timeOf(e.at) }}</time>
            <div class="item-body">
              <div class="item-meta">
                <span class="tag kind" :class="e.kind">{{ kindLabel(e.kind) }}</span>
                <span v-if="e.market && e.market !== 'crypto'" class="tag mkt">{{ marketLabel(e.market) }}</span>
                <span class="tag src">{{ sourceLabel(e.source) }}</span>
                <span v-for="h in e.hits" :key="h" class="tag hit">{{ h }}</span>
              </div>
              <p class="item-title">{{ titleOf(e) }}</p>
            </div>
            <button v-if="e.url" class="link-btn" type="button" :title="e.url" @click="openSource(e.url)">
              <i class="ri-external-link-line"></i><span>{{ $t('查看原文') }}</span>
            </button>
          </li>
        </ol>
      </section>

      <aside class="side-col">
        <!-- 自选：存交易对不存名字。加密在现货列表里搜，美股 / 指数在合约列表里搜（gate.io 返回的就是全集） -->
        <section class="side-card">
          <div class="card-head">
            <h2>{{ $t('自选行情') }}</h2>
            <small>{{ $t('gate.io · {p0}/{p1}', { p0: watchlist.length, p1: WATCHLIST_CAP }) }}</small>
          </div>
          <div class="wl-search">
            <i class="ri-search-line"></i>
            <input
              v-model="keyword"
              type="text"
              :placeholder="$t('加自选：币种或美股代码，如 BTC / NVDA / 英伟达')"
              @keydown.enter.prevent="addFirstMatch"
              @blur="closeSuggestSoon"
            />
            <ul v-if="matches.length" class="wl-suggest">
              <li v-for="m in matches" :key="m.pair" @mousedown.prevent="addPair(m.pair)">
                <strong>{{ m.pair.replace('_', ' / ') }}<span v-if="m.market !== 'crypto'" class="tag mkt">{{ marketLabel(m.market) }}</span></strong>
                <small :class="m.pct >= 0 ? 'up' : 'down'">{{ fmtPct(m.pct) }}</small>
              </li>
            </ul>
          </div>
          <p v-if="!watchlist.length" class="state-empty">{{ $t('自选为空，上面搜一个加进来') }}</p>
          <ul v-else class="quotes">
            <li v-for="q in quoteRows" :key="q.pair" class="quote" :class="q.last ? (q.pct >= 0 ? 'up' : 'down') : ''">
              <div class="q-main">
                <strong class="q-pair">{{ baseOf(q.pair) }}<small>/USDT</small></strong>
                <span v-if="q.market && q.market !== 'crypto'" class="tag mkt">{{ marketLabel(q.market) }}<template v-if="q.market === 'stocks'"> · {{ usSessionLabel }}</template></span>
                <span class="q-last">{{ q.last ? fmtNum(q.last) : '—' }}</span>
                <span class="q-pct">{{ q.last ? fmtPct(q.pct) : '' }}</span>
              </div>
              <div class="q-sub">
                <span v-if="q.last">{{ $t('24h {p0} ~ {p1}', { p0: fmtNum(q.low), p1: fmtNum(q.high) }) }}</span>
                <span v-if="q.funding !== null">{{ $t('费率 {p0}', { p0: fmtRate(q.funding) }) }}</span>
                <span v-if="!q.last" class="muted">{{ $t('等待行情…') }}</span>
                <button type="button" class="icon-btn" :title="$t('在 gate.io 查看')" @click="openSource(q.url)"><i class="ri-external-link-line"></i></button>
                <button type="button" class="icon-btn" :title="$t('移出自选')" @click="removePair(q.pair)"><i class="ri-close-line"></i></button>
              </div>
            </li>
          </ul>
        </section>

        <!-- AI 研判：按需、随时，只吃当前筛选窗内的情报 + 自选行情，并要求逐条引用 -->
        <section class="side-card ai-card">
          <div class="card-head">
            <h2><i class="ri-radar-line"></i>{{ $t('AI 研判') }}</h2>
            <small v-if="aiAt">{{ $t('生成于 {p0}', { p0: aiAt }) }}</small>
          </div>
          <p class="ai-scope">{{ $t('基于当前窗口（{p0}）内 {p1} 条情报与自选行情，只依据这些数据，结论会标注引用的条目编号。', { p0: windowLabel, p1: Math.min(visible.length, AI_ITEM_CAP) }) }}</p>
          <button class="primary-btn wide" type="button" :disabled="aiBusy || !visible.length" @click="runBrief">
            <i :class="aiBusy ? 'ri-loader-4-line spin' : 'ri-radar-line'"></i>{{ aiBusy ? $t('研判中…') : $t('立即研判当前窗口') }}
          </button>
          <p v-if="aiText" class="ai-text">{{ aiText }}</p>
          <p v-else-if="aiErr" class="state-err">{{ aiErr }}</p>
          <p v-else class="state-empty">{{ $t('随时点一下：盘面不分早晚，研判也不用等开盘。') }}</p>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { t as i18nT } from '@totalclaw/i18n';
import PageBackButton from '../components/PageBackButton.vue';
import { humanizeErrorMessage } from '../utils/humanize';
import { useNotificationStore } from '../stores/notification';
import { usMarketSession, usMarketSessionLabel } from '../utils/usMarketSession';
import {
  deriveMarketEvents, newsToEvents, mergeEvents, filterEvents, matchHits, searchRank, GATE_SPOT_URL, GATE_FUTURES_URL,
  type IntelEvent, type IntelKind, type IntelSnapshot, type Market,
} from '../../shared/marketIntel';

const notif = useNotificationStore();

const REFRESH_MS = 90_000; // gate.io 全量 tickers 一次 5 秒左右，90 秒一拍够「实时」又不至于把接口当 WebSocket 用
const WATCHLIST_CAP = 12;
const AI_ITEM_CAP = 40;
const WATCHLIST_KEY = 'totalclaw.market-intel.watchlist.v1';
const WINDOWS = [
  { ms: 3_600_000, label: i18nT('最近 1 小时') },
  { ms: 4 * 3_600_000, label: i18nT('最近 4 小时') },
  { ms: 24 * 3_600_000, label: i18nT('最近 24 小时') },
];
const MARKET_LABEL: Record<Market, string> = { crypto: i18nT('加密'), stocks: i18nT('美股'), indices: i18nT('指数'), other: i18nT('商品外汇') };
const MARKETS: { id: Market | 'all'; label: string }[] = [
  { id: 'all', label: i18nT('全部') },
  ...(Object.keys(MARKET_LABEL) as Market[]).map((id) => ({ id, label: MARKET_LABEL[id] })),
];
const marketLabel = (m: Market) => MARKET_LABEL[m];

const autoOn = ref(true);
const busy = ref(false);
const lastAt = ref('');
const pageErr = ref('');
const sourceErrors = ref<Record<string, string>>({});
const snapshot = ref<IntelSnapshot | null>(null);
const events = ref<IntelEvent[]>([]);
const windowMs = ref(WINDOWS[2].ms);
const typeFilter = ref<'all' | 'news' | 'market'>('all');
const marketFilter = ref<Market | 'all'>('all');
const watchOnly = ref(false);
const now = ref(Date.now());
// 美股盘态跟 now 走（30 秒一跳），徽标 / 自选行 / AI 研判三处吃同一个值，不会互相打架
const usSession = computed(() => usMarketSession(new Date(now.value)));
const usSessionLabel = computed(() => usMarketSessionLabel(usSession.value));

const watchlist = ref<string[]>(readWatchlist());
const keyword = ref('');
const suggestOpen = ref(true);

const aiText = ref('');
const aiErr = ref('');
const aiAt = ref('');
const aiBusy = ref(false);

const baseOf = (pair: string) => pair.split('_')[0];
const windowLabel = computed(() => WINDOWS.find((w) => w.ms === windowMs.value)?.label || '');
const visible = computed(() => filterEvents(events.value, {
  windowMs: windowMs.value, type: typeFilter.value, watchOnly: watchOnly.value, now: now.value, market: marketFilter.value,
}));

/**
 * 自选行情行：有现货的用现货价（加密），只有永续的（美股 / 指数）用合约价；
 * 24h 区间同源，资金费率取同名永续（没有合约的币为 null）。
 */
const quoteRows = computed(() => watchlist.value.map((pair) => {
  const s = snapshot.value?.spot.find((r) => r.pair === pair);
  const f = snapshot.value?.futures.find((r) => r.contract === pair);
  const src = s || f;
  return {
    pair, market: s ? 'crypto' as Market : f?.market, url: s ? GATE_SPOT_URL(pair) : GATE_FUTURES_URL(pair),
    last: src?.last || 0, pct: src?.pct || 0, high: src?.high || 0, low: src?.low || 0, funding: f ? f.funding : null,
  };
}));
/** 自选 base → 市场，给新闻归类用（命中英伟达的快讯归美股） */
const watchMarket = computed(() => Object.fromEntries(quoteRows.value.filter((q) => q.market).map((q) => [baseOf(q.pair), q.market as Market])));

const matches = computed(() => {
  const kw = keyword.value.trim();
  if (!kw || !suggestOpen.value || !snapshot.value) return [];
  const cands = [
    ...snapshot.value.spot.map((r) => ({ pair: r.pair, pct: r.pct, vol: r.quoteVol, market: 'crypto' as Market })),
    ...snapshot.value.futures.filter((f) => f.market && f.market !== 'crypto').map((f) => ({ pair: f.contract, pct: f.pct, vol: f.settleVol, market: f.market! })),
  ];
  return cands
    .map((c) => ({ ...c, rank: searchRank(baseOf(c.pair), kw) }))
    .filter((c) => c.rank && !watchlist.value.includes(c.pair))
    // 前缀命中排前面，再按成交额——搜 BTC 要先看到 BTC 而不是 WBTC
    .sort((a, b) => b.rank - a.rank || b.vol - a.vol)
    .slice(0, 8);
});

function readWatchlist(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || 'null');
    if (Array.isArray(raw)) return raw.filter((s) => typeof s === 'string' && /^[A-Z0-9]+_USDT$/.test(s)).slice(0, WATCHLIST_CAP);
  } catch { /* 读不出来用默认 */ }
  return ['BTC_USDT', 'ETH_USDT', 'SOL_USDT'];
}
function saveWatchlist(): void {
  try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist.value)); } catch { /* 存不下不影响本次 */ }
}
function addPair(pair: string): void {
  if (watchlist.value.includes(pair)) return;
  if (watchlist.value.length >= WATCHLIST_CAP) { notif.warn(i18nT('自选最多 {p0} 个', { p0: WATCHLIST_CAP })); return; }
  watchlist.value = [...watchlist.value, pair];
  keyword.value = '';
  saveWatchlist();
  rehit();
  void refresh(); // 新自选的强平数据要重新拉
}
function removePair(pair: string): void {
  watchlist.value = watchlist.value.filter((p) => p !== pair);
  saveWatchlist();
  rehit();
}
function addFirstMatch(): void { if (matches.value[0]) addPair(matches.value[0].pair); }
function closeSuggestSoon(): void {
  // 延后关：下拉项用 mousedown，blur 会先到，立刻关会让点击落空
  suggestOpen.value = false;
  window.setTimeout(() => { suggestOpen.value = true; }, 200);
}
/** 自选变了，已攒下的事件要重算「命中自选」，否则「只看自选」会看旧名单 */
function rehit(): void {
  const bases = watchlist.value.map(baseOf);
  events.value = events.value.map((e) => e.kind === 'news'
    // 新闻的命中 / 级别 / 市场归属都跟自选走，整条按同一规则重推（id 只由来源 + 原文决定，不变）
    ? newsToEvents([{ at: e.at, text: e.text || '', source: e.source, url: e.url }], watchlist.value, watchMarket.value)[0]
    : { ...e, hits: e.pair && bases.includes(baseOf(e.pair)) ? [baseOf(e.pair)] : [] });
}

async function refresh(): Promise<void> {
  if (busy.value) return;
  busy.value = true;
  try {
    const res = await (window as any).electronAPI?.solution?.marketIntel?.({ pairs: [...watchlist.value] })
      .catch((e: unknown) => ({ ok: false, error: humanizeErrorMessage(e) }));
    if (!res?.ok) {
      // 整体失败只在还没有任何数据时占满主栏；已有数据就保留旧流、只亮状态点，时间戳不动本身就是在提示数据变旧
      const msg = humanizeErrorMessage(res?.error || i18nT('行情接口不可用'));
      if (!events.value.length) pageErr.value = msg; else notif.warn(msg);
      sourceErrors.value = res?.errors || {};
      return;
    }
    pageErr.value = '';
    snapshot.value = res.snapshot;
    sourceErrors.value = res.errors || {};
    events.value = mergeEvents(events.value, [
      ...deriveMarketEvents(res.snapshot, watchlist.value),
      ...newsToEvents(res.snapshot.news, watchlist.value, watchMarket.value),
    ]);
    now.value = Date.now();
    lastAt.value = new Date().toLocaleTimeString();
  } finally {
    busy.value = false;
  }
}

async function openSource(url: string): Promise<void> {
  try {
    const tabs = (window as any).electronAPI?.browserTabs;
    if (!tabs?.create) throw new Error(i18nT('浏览器接口不可用'));
    await tabs.create({ url, source: 'agent', activate: true });
    await tabs.setVisible?.(true);
  } catch (error) { notif.error(humanizeErrorMessage(error)); }
}

// ─── 展示文案 ──────────────────────────────────────────────────────────────

function kindLabel(kind: IntelKind): string {
  return { mover: i18nT('异动'), range: i18nT('高低点'), funding: i18nT('资金费率'), liq: i18nT('强平'), news: i18nT('新闻') }[kind];
}
function sourceLabel(id: string): string {
  // i18n-ignore: 媒体品牌名原样展示
  const brand: Record<string, string> = { cointelegraph: 'Cointelegraph', coindesk: 'CoinDesk' };
  const named: Record<string, string> = {
    'gate-spot': i18nT('Gate 现货'), 'gate-futures': i18nT('Gate 合约'), 'gate-contracts': i18nT('Gate 合约分类'), sina: i18nT('新浪 7×24'),
    wallstreetcn: i18nT('华尔街见闻'), 'cls-hot': i18nT('财联社'),
  };
  return brand[id] || named[id] || id;
}
function titleOf(e: IntelEvent): string {
  const base = e.pair ? baseOf(e.pair) : '';
  switch (e.kind) {
    case 'mover': return i18nT('{p0} 24 小时{p1} {p2}，现价 {p3}，成交额 {p4}', { p0: base, p1: e.v.pct >= 0 ? i18nT('涨') : i18nT('跌'), p2: fmtPct(Math.abs(e.v.pct)), p3: fmtNum(e.v.last), p4: fmtUsd(e.v.vol) });
    case 'range': return i18nT('{p0} 触及 24 小时{p1} {p2}（区间 {p3} ~ {p4}）', { p0: base, p1: e.v.side > 0 ? i18nT('新高') : i18nT('新低'), p2: fmtNum(e.v.last), p3: fmtNum(e.v.low), p4: fmtNum(e.v.high) });
    case 'funding': return i18nT('{p0} 永续资金费率 {p1}，{p2}', { p0: base, p1: fmtRate(e.v.rate), p2: e.v.rate > 0 ? i18nT('多头拥挤') : i18nT('空头拥挤') });
    case 'liq': return i18nT('{p0} {p1}强平约 {p2} USDT，成交价 {p3}', { p0: base, p1: e.v.side > 0 ? i18nT('多头') : i18nT('空头'), p2: fmtUsd(e.v.usd), p3: fmtNum(e.v.price) });
    default: return e.text || '';
  }
}
function timeOf(at: number): string {
  const d = new Date(at);
  const hm = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toDateString() === new Date(now.value).toDateString() ? hm : `${d.toLocaleDateString([], { month: 'numeric', day: 'numeric' })} ${hm}`;
}
function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return n.toLocaleString(undefined, { maximumSignificantDigits: 4 });
}
function fmtPct(p: number): string { return `${p > 0 ? '+' : ''}${p.toFixed(2)}%`; }
function fmtRate(r: number): string { return `${r > 0 ? '+' : ''}${(r * 100).toFixed(4)}%`; }
function fmtUsd(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(0);
}

// ─── AI 研判 ───────────────────────────────────────────────────────────────

async function runBrief(): Promise<void> {
  if (aiBusy.value || !visible.value.length) return;
  aiBusy.value = true;
  aiErr.value = '';
  try {
    // 走主进程 LLM_ONESHOT（引擎 oneshot，与聊天同链路），不直调 qiye-api chat-completions
    const api = (window as any).electronAPI;
    if (!api?.llmOneshot) throw new Error(i18nT('默认 LLM 服务尚未就绪'));
    const items = visible.value.slice(0, AI_ITEM_CAP);
    const lines = items.map((e, i) => `#${i + 1} [${timeOf(e.at)}] [${sourceLabel(e.source)}] ${titleOf(e)}`).join('\n');
    const quotes = quoteRows.value.filter((q) => q.last)
      .map((q) => i18nT('{p0} 现价 {p1} 24h {p2} 区间 {p3}~{p4}{p5}', { p0: q.market && q.market !== 'crypto' ? `${q.pair}（${marketLabel(q.market)}）` : q.pair, p1: fmtNum(q.last), p2: fmtPct(q.pct), p3: fmtNum(q.low), p4: fmtNum(q.high), p5: q.funding === null ? '' : i18nT(' 资金费率 {p0}', { p0: fmtRate(q.funding) }) }))
      .join('\n');
    const result = await api.llmOneshot({
      systemPrompt: [
        i18nT('你是给企业负责人做加密与美股盘面速读的分析师。加密市场 7×24 交易，没有开盘收盘之分；美股行情来自 gate.io 永续合约，也 7×24 有报价，但标的只在美东交易时段真实成交。'),
        i18nT('当前美股盘态（由系统按美东时间含夏令时计算，以此为准，不要自行推断）：{p0}。', { p0: usSessionLabel.value }),
        i18nT('只依据下面编号列出的情报条目和自选行情说话，不得引入任何未给出的消息、数据或传闻；提到某条情报时在句末用 [#编号] 标注引用。'),
        i18nT('输出四句话以内的中文速读：第一句讲整体方向，第二句讲最值得注意的异动或消息，第三句讲风险信号（强平 / 费率 / 极端波动），第四句给一个观察建议。'),
        i18nT('不要给出买卖建议，不要预测点位，不要用 Markdown。'),
      ].join('\n'),
      prompt: i18nT('时间窗：{p0}\n\n情报条目：\n{p1}\n\n自选行情：\n{p2}', { p0: windowLabel.value, p1: lines, p2: quotes || i18nT('（自选为空）') }),
      timeoutMs: 55_000,
      // 纯补全：一句进一句出的文本生成，禁工具（同 F1 修复）
      plainCompletion: true,
    });
    const text = String(result?.text || '').trim();
    if (!text) throw new Error(i18nT('模型没有返回内容'));
    aiText.value = text;
    aiAt.value = new Date().toLocaleTimeString();
  } catch (e: unknown) {
    aiErr.value = i18nT('AI 研判失败：{p0}', { p0: humanizeErrorMessage(e) });
  } finally {
    aiBusy.value = false;
  }
}

// ─── 生命周期 ──────────────────────────────────────────────────────────────

let refreshTimer: number | null = null;
let clockTimer: number | null = null;
function armRefresh(): void {
  if (refreshTimer) window.clearInterval(refreshTimer);
  refreshTimer = autoOn.value ? window.setInterval(() => { void refresh(); }, REFRESH_MS) : null;
}
watch(autoOn, armRefresh);
onMounted(() => {
  void refresh();
  armRefresh();
  // 时间窗和「今天」判断跟着真实时间走，不然 1 小时窗里的条目永远不会老化掉
  clockTimer = window.setInterval(() => { now.value = Date.now(); }, 30_000);
});
onBeforeUnmount(() => {
  if (refreshTimer) window.clearInterval(refreshTimer);
  if (clockTimer) window.clearInterval(clockTimer);
});
</script>

<style scoped>
/* 和其它工作台一致：flex 子项默认 min-height:auto 会撑破容器导致整页不可滚动。 */
.intel-page { flex: 1; min-height: 0; overflow-y: auto; padding: 24px 28px 40px; display: flex; flex-direction: column; gap: 16px; }
.intel-page > * { flex-shrink: 0; min-width: 0; }

.intel-hero { display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
.hero-text { margin-inline-end: auto; min-width: 0; }
.hero-kicker { display: inline-flex; align-items: center; gap: 6px; margin: 0 0 6px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; color: var(--color-brand); background: var(--color-brand-subtle); }
.intel-hero h1 { margin: 0; font-size: 24px; letter-spacing: -0.01em; }
.hero-sub { margin: 6px 0 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 680px; }
.hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.primary-btn, .ghost-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border-radius: 10px; padding: 9px 16px; font-size: 14px; cursor: pointer; border: 1px solid transparent; font-family: inherit; }
.primary-btn { background: var(--color-brand); color: var(--color-text-inverse); }
.primary-btn:hover:not(:disabled) { background: var(--color-brand-hover); }
.primary-btn.wide { width: 100%; }
.ghost-btn { background: transparent; border-color: var(--color-border); color: inherit; }
.ghost-btn:hover:not(:disabled) { background: var(--color-bg-hover); }
.primary-btn:disabled, .ghost-btn:disabled { opacity: .55; cursor: not-allowed; }

/* 状态条：sticky 常驻。半透明毛玻璃盖在滚动内容上，和顶栏一个气质 */
.intel-bar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 10px 18px; flex-wrap: wrap; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--color-border); background: color-mix(in srgb, var(--color-bg-card) 88%, transparent); backdrop-filter: blur(10px); }
.bar-status { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; font-size: 13px; }
.bar-status small { color: var(--color-text-secondary); font-size: 12px; }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-text-muted); flex-shrink: 0; }
.live-dot.beat { background: var(--color-success); animation: intel-beat 1.6s ease-in-out infinite; }
.live-dot.err { background: var(--color-danger); }
@keyframes intel-beat { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
.src-err { display: inline-flex; align-items: center; gap: 3px; padding: 1px 8px; border-radius: 999px; font-size: 11px; color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); cursor: help; }
.bar-filters { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.seg { display: inline-flex; padding: 3px; border-radius: 9px; background: var(--color-bg-input); }
.seg button { border: none; background: transparent; color: var(--color-text-secondary); font-size: 12px; padding: 5px 10px; border-radius: 7px; cursor: pointer; font-family: inherit; white-space: nowrap; }
.seg button.on { background: var(--color-bg-card); color: var(--color-text-primary); font-weight: 600; box-shadow: 0 1px 2px rgba(0, 0, 0, .08); }
.toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-secondary); cursor: pointer; white-space: nowrap; }
.toggle input { accent-color: var(--color-brand); }

.intel-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 360px); gap: 16px; align-items: start; }
.stream-card, .side-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 14px; padding: 16px 18px; min-width: 0; }
.side-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.card-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.card-head h2 { margin: 0; font-size: 15px; display: inline-flex; align-items: center; gap: 6px; }
.card-head small { color: var(--color-text-secondary); font-size: 12px; white-space: nowrap; }

/* 情报流：时间列 + 正文 + 原文链接。重要度只用左侧细条和一点底色，别把整页刷成红绿灯 */
.stream { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.item { display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 10px 12px; border-radius: 10px; border-inline-start: 3px solid var(--color-border); background: var(--color-bg-primary); }
.item.is-medium { border-inline-start-color: var(--color-warning); }
.item.is-high { border-inline-start-color: var(--color-danger); background: color-mix(in srgb, var(--color-status-danger-bg) 45%, var(--color-bg-primary)); }
.item.is-hit { box-shadow: inset 0 0 0 1px var(--color-brand-subtle); background: color-mix(in srgb, var(--color-brand-subtle) 55%, var(--color-bg-primary)); }
.item-time { font-family: var(--font-mono); font-size: 12px; color: var(--color-text-secondary); padding-top: 2px; white-space: nowrap; }
.item-body { min-width: 0; }
.item-meta { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
.tag { font-size: 11px; line-height: 1; padding: 3px 7px; border-radius: 999px; background: var(--color-bg-active); color: var(--color-text-secondary); white-space: nowrap; }
.tag.kind.mover { background: var(--color-status-info-bg); color: var(--color-status-info-fg); }
.tag.kind.range { background: var(--color-status-warning-bg); color: var(--color-status-warning-fg); }
.tag.kind.funding { background: var(--color-status-warning-bg); color: var(--color-status-warning-fg); }
.tag.kind.liq { background: var(--color-status-danger-bg); color: var(--color-status-danger-fg); }
.tag.kind.news { background: var(--color-status-success-bg); color: var(--color-status-success-fg); }
.tag.hit { background: var(--color-brand); color: var(--color-text-inverse); font-weight: 600; }
.tag.mkt { background: var(--color-status-info-bg); color: var(--color-status-info-fg); }
/* 美股盘态徽标：只有盘中是「活盘」用成功色，其余三态灰 */
.seg .session { margin-inline-start: 5px; padding: 1px 6px; border-radius: 999px; font-size: 10px; background: var(--color-bg-active); color: var(--color-text-muted); }
.seg .session.regular { background: var(--color-status-success-bg); color: var(--color-status-success-fg); }
.item-title { margin: 0; font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.link-btn { display: inline-flex; align-items: center; gap: 4px; border: none; background: transparent; color: var(--color-brand); font-size: 12px; cursor: pointer; padding: 2px 4px; border-radius: 6px; white-space: nowrap; font-family: inherit; }
.link-btn:hover { background: var(--color-brand-subtle); }

.state-empty, .state-err { margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; }
.state-err { color: var(--color-status-warning-fg); display: flex; gap: 6px; align-items: flex-start; }
.skeleton { display: block; height: 54px; border-radius: 10px; margin-bottom: 6px; background: linear-gradient(90deg, var(--color-bg-primary) 25%, var(--color-bg-hover) 50%, var(--color-bg-primary) 75%); background-size: 200% 100%; animation: intel-shimmer 1.4s linear infinite; }
@keyframes intel-shimmer { to { background-position: -200% 0; } }

/* 自选 */
.wl-search { position: relative; display: flex; align-items: center; margin-bottom: 10px; }
.wl-search > i { position: absolute; inset-inline-start: 10px; color: var(--color-text-muted); font-size: 14px; pointer-events: none; }
.wl-search input { width: 100%; padding: 8px 12px; padding-inline-start: 30px; border-radius: 9px; border: 1px solid var(--color-border); background: var(--color-bg-input); color: inherit; font-size: 13px; font-family: inherit; }
.wl-search input:focus { outline: none; border-color: var(--color-brand); }
.wl-suggest { position: absolute; top: 100%; inset-inline: 0; z-index: 30; margin: 4px 0 0; padding: 4px; list-style: none; max-height: 240px; overflow-y: auto; background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: 10px; box-shadow: 0 10px 28px rgba(0, 0, 0, .14); }
.wl-suggest li { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 7px; cursor: pointer; font-size: 13px; }
.wl-suggest li:hover { background: var(--color-bg-hover); }
.wl-suggest small { font-family: var(--font-mono); font-size: 11px; }
.quotes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.quote { padding: 9px 12px; border-radius: 10px; background: var(--color-bg-primary); }
.q-main { display: flex; align-items: baseline; gap: 8px; }
.q-pair { font-size: 13px; }
.q-pair small { color: var(--color-text-muted); font-weight: 400; font-size: 11px; }
.q-main .tag.mkt, .wl-suggest .tag.mkt { margin-inline-start: 6px; font-size: 10px; padding: 2px 6px; vertical-align: middle; }
.q-last { margin-inline-start: auto; font-family: var(--font-mono); font-size: 15px; font-weight: 600; }
.q-pct { font-family: var(--font-mono); font-size: 12px; min-width: 62px; text-align: end; }
.q-sub { display: flex; align-items: center; gap: 10px; margin-top: 3px; font-size: 11px; color: var(--color-text-secondary); flex-wrap: wrap; }
.q-sub .icon-btn:first-of-type { margin-inline-start: auto; }
.icon-btn { border: none; background: transparent; color: var(--color-text-muted); cursor: pointer; padding: 0 2px; font-size: 14px; display: grid; place-items: center; border-radius: 4px; }
.icon-btn:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.muted { color: var(--color-text-muted); }
/* 涨红跌绿：沿用国内盘面习惯（原行业巡检台同款） */
.up, .quote.up .q-last, .quote.up .q-pct { color: var(--color-danger); }
.down, .quote.down .q-last, .quote.down .q-pct { color: var(--color-success); }

/* AI 研判 */
.ai-card { background: linear-gradient(160deg, color-mix(in srgb, var(--color-brand-subtle) 70%, var(--color-bg-card)), var(--color-bg-card) 60%); }
.ai-scope { margin: 0 0 10px; font-size: 12px; color: var(--color-text-secondary); line-height: 1.6; }
.ai-text { margin: 12px 0 0; font-size: 13px; line-height: 1.8; white-space: pre-wrap; }
.ai-card .state-empty, .ai-card .state-err { margin-top: 10px; }

.spin { animation: intel-spin 1s linear infinite; }
@keyframes intel-spin { to { transform: rotate(360deg); } }

/* 窄宽：侧栏落到情报流下面；状态条两组各占一行 */
@container main-page (max-width: 900px) {
  .intel-grid { grid-template-columns: minmax(0, 1fr); }
  .intel-page { padding: 16px; }
}
@container main-page (max-width: 520px) {
  .item { grid-template-columns: minmax(0, 1fr); gap: 4px; }
  .item-time { font-size: 11px; }
  .link-btn { justify-self: start; padding-inline-start: 0; }
  .intel-hero h1 { font-size: 20px; }
}
</style>
