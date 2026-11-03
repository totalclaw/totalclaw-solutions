/**
 * 经营自动化 · 演示模式：一键给六个页签都造好示例数据（短视频 / 数字人 / 上下架 / 经营数据 / 定时与联动 / 历史记录）。
 *
 *   商品     用服装AI试衣的演示商品（没有就先连带生成那一份 —— 两个页面是同一个服装店项目）
 *   短视频   4 个项目：已发布（带示例成片、各平台回执与播放数据）/ 已审核待定时发布 / 已写脚本 / 草稿
 *   数字人   2 个讲稿：门店介绍（已写好）/ 双十一（带【待补充】占位，演示「补齐才能成片」）
 *   上下架   演示商品 × 抖店 / 微信小店，草稿到已上架 / 已下架各种状态；规则巡检按真实规则跑（售罄、断码、过季）
 *   经营数据 近 60 天收银明细 + 月度费用，日报 / 月报各一份（数字由规则算，解读按模板只引用算出来的数），两条问答
 *
 * 全部在本机生成：不调用模型、数字人、发布服务，不花钱；定时任务一律不打开（免得真推送）。
 * 示例数据的 id 带 `-demo_`，销售单号以 DEMO- 开头，费用 / 日志带 demo 标记；「清除演示数据」只删这些。
 */
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { getLocale } from '@totalclaw/i18n';
import type {
  ApGarment, BaAvatarProject, BaExpenseRow, BaImport, BaListing, BaLogEntry, BaPublishPlatform, BaQa, BaReport, BaSaleRow, BaVideoProject, BaVideoType,
} from '@totalclaw/ipc-contracts';
import { appendVideoEvent, computeMetrics, evaluateRules, reportPeriod, shiftDate, unverifiedNumbers } from './logic';
import { newId, type BizAutomationStore } from './store';
import DATA from './demoData.json';

export const DEMO_MARK = '-demo_';
const isDemo = (id: string | undefined): boolean => !!id && id.includes(DEMO_MARK);
const demoId = (prefix: string): string => newId(`${prefix}-demo`);
type Flagged = { demo?: boolean };

export interface BaDemoCounts { videos: number; avatars: number; listings: number; sales: number; reports: number }

export function bizDemoCounts(store: BizAutomationStore): BaDemoCounts {
  const s = store.read();
  return {
    videos: s.videos.filter((v) => isDemo(v.id)).length,
    avatars: s.avatars.filter((a) => isDemo(a.id)).length,
    listings: s.listings.filter((l) => isDemo(l.id)).length,
    sales: store.data().sales.filter((r) => r.orderNo.startsWith('DEMO-')).length,
    reports: s.reports.filter((r) => isDemo(r.id)).length,
  };
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const day = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const money = (n: number) => (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

export interface SeedBizDemoDeps {
  store: BizAutomationStore;
  /** 当前商品库（服装AI试衣的商品） */
  garments: () => ApGarment[];
  /** 商品库里没有演示商品时，先生成服装AI试衣那一份 */
  ensureDemoGarments: () => Promise<void>;
  /** 服装AI试衣的看板统计（规则巡检里「试穿多成交少」要用）；拿不到传 null */
  apparelStats: () => any;
  /** 用几张图拼一段示例成片（本机 ffmpeg）；没有 ffmpeg 返回 null，视频就只有脚本不带成片 */
  makeClip: (images: string[], out: string) => Promise<string | null>;
  now?: number;
}

/** 先清掉上一份演示数据，再生成一整套 */
export async function seedBizDemo(deps: SeedBizDemoDeps): Promise<BaDemoCounts> {
  const { store } = deps;
  clearBizDemo(store);
  await deps.ensureDemoGarments();
  const L = (String(getLocale() || '').startsWith('zh') ? DATA.zh : DATA.en);
  const now = deps.now ?? Date.now();
  const r = rng(Math.floor(now / 86_400_000) + 17);
  const iso = (t: number) => new Date(t).toISOString();
  const all = deps.garments();
  const gs = all.filter((g) => isDemo(g.id));
  const pool = gs.length ? gs : all;
  if (!pool.length) throw new Error('NO_GARMENTS');
  const pick = (k: number) => pool[k % pool.length];
  const women = pool.filter((g) => g.audience === 'women');
  const byKey = (i: number) => (women[i] || pick(i));
  const dir = store.dir('demo');

  // ── A 短视频 ──
  const platforms: BaPublishPlatform[] = ['douyin', 'kuaishou', 'xiaohongshu', 'wxchannels'];
  const videos: BaVideoProject[] = [];
  const garmentSets = [[byKey(1), byKey(2)], [byKey(3), byKey(3)], [byKey(0), byKey(4)], [byKey(2)]];
  for (const [i, def] of L.videos.entries()) {
    const set = garmentSets[i].filter(Boolean);
    const created = now - (6 - i * 1.5) * 86_400_000;
    const scenes = def.lines.map((line, k) => ({ image: set[k % set.length]?.image || '', line }));
    const v: BaVideoProject = {
      id: demoId('bav'), type: def.type as BaVideoType, name: def.name, garmentIds: [...new Set(set.map((g) => g.id))], brief: def.brief,
      materials: set.map((g) => g.image).filter(Boolean), scenes, copies: {}, platforms: i === 0 ? ['douyin', 'xiaohongshu'] : ['douyin', 'kuaishou', 'xiaohongshu', 'wxchannels'],
      narration: true, voiceGender: 'female', status: 'draft', warnings: [], history: [], publishRuns: [], createdAt: iso(created),
    };
    v.history = appendVideoEvent(v.history, 'create', L.history.create, true, new Date(created));
    if (def.copy) {
      for (const p of platforms) v.copies[p] = { title: def.copy.title, caption: def.copy.caption, topics: def.copy.topics };
      v.status = 'scripted';
      v.history = appendVideoEvent(v.history, 'script', L.history.script, true, new Date(created + 20 * 60_000));
    }
    if (i <= 1) {
      // 已审核（第二个定时到明天上午发）；第一个已发布，带示例成片与回执
      const clip = await deps.makeClip(v.materials.length ? v.materials : set.map((g) => g.image), join(dir, `${v.id}.mp4`));
      if (clip && existsSync(clip)) { v.video = clip; v.durationSec = 3 * Math.max(2, v.materials.length); }
      v.status = 'approved';
      v.approvedAt = iso(created + 2 * 3_600_000);
      if (clip) v.history = appendVideoEvent(v.history, 'render', L.history.render, true, new Date(created + 60 * 60_000));
      v.history = appendVideoEvent(v.history, 'approve', L.history.approve, true, new Date(created + 2 * 3_600_000));
      if (i === 1) {
        const t = new Date(now + 86_400_000);
        t.setHours(10, 0, 0, 0);
        v.publishAt = t.toISOString();
        v.history = appendVideoEvent(v.history, 'schedule', L.history.schedule, true, new Date(created + 2.1 * 3_600_000));
      } else {
        v.status = 'published';
        v.publishedAt = iso(created + 3 * 3_600_000);
        v.publishRuns = [{
          at: v.publishedAt, outcome: 'completed', published: ['douyin', 'xiaohongshu'], unconfirmed: [], failed: [],
          receipts: [{ platform: 'douyin', status: 'published' }, { platform: 'xiaohongshu', status: 'published' }], videoFile: v.video, note: L.platformNote,
        }];
        v.publishRunNote = L.platformNote;
        v.history = appendVideoEvent(v.history, 'publish', L.history.publish, true, new Date(created + 3 * 3_600_000));
        v.stats = {
          douyin: { plays: 12840, likes: 516, comments: 47, shares: 23, source: 'manual', at: iso(now - 86_400_000) },
          xiaohongshu: { plays: 3260, likes: 288, comments: 31, shares: 12, source: 'manual', at: iso(now - 86_400_000) },
        };
        v.history = appendVideoEvent(v.history, 'stats', L.history.stats, true, new Date(now - 86_400_000));
      }
    }
    v.updatedAt = iso(created + 3 * 3_600_000);
    videos.push(v);
  }

  // ── B 数字人 ──
  const avatars: BaAvatarProject[] = L.avatars.map((a, i) => ({
    id: demoId('baa'), topic: a.topic as BaAvatarProject['topic'], name: a.name, script: a.script,
    facts: a.facts.map(([label, value]) => ({ label, value })), durationHint: 45, avatarId: '', voiceId: '', aspectRatio: '9:16', likenessConsent: '',
    status: i === 0 ? 'scripted' : 'draft', warnings: [], createdAt: iso(now - (3 - i) * 86_400_000),
  }));

  // ── C 上下架 ──
  const settings = store.read().settings;
  const chans = settings.channels.filter((c) => c.id === 'doudian' || c.id === 'weixin_shop');
  const statuses: BaListing['status'][] = ['listed', 'listed', 'handed', 'confirmed', 'draft', 'draft', 'delisted', 'listed'];
  const listings: BaListing[] = [];
  let k = 0;
  for (const g of pool.slice(0, 4)) {
    for (const ch of chans) {
      const title = g.name.length > ch.titleMax ? g.name.slice(0, ch.titleMax) : g.name;
      listings.push({
        id: demoId('bal'), garmentId: g.id, channelId: ch.id, title,
        sellingPoints: (g.sellingPoints || '').split(/[，。,.;；]/).map((x) => x.trim()).filter(Boolean).slice(0, 4),
        detail: fill(L.listingDetail, { name: g.name, color: g.color, fabric: g.fabric, sellingPoints: g.sellingPoints }),
        keywords: [...new Set([...(g.tags || []), ...L.keywords])].slice(0, 6), images: g.image ? [g.image] : [], price: g.price,
        status: statuses[k % statuses.length], warnings: [], createdAt: iso(now - (8 - k * 0.5) * 86_400_000),
      });
      k += 1;
    }
  }

  // ── D 经营数据：近 60 天收银明细 + 每月固定费用 ──
  const sales: Array<BaSaleRow & Flagged> = [];
  const today = new Date(now);
  for (let d = 60; d >= 1; d -= 1) {
    const date = day(new Date(today.getFullYear(), today.getMonth(), today.getDate() - d));
    const weekend = [0, 6].includes(new Date(date).getDay());
    const orders = (weekend ? 10 : 6) + Math.floor(r() * 6);
    for (let o = 1; o <= orders; o += 1) {
      const orderNo = `DEMO-${date.replace(/-/g, '')}-${String(o).padStart(3, '0')}`;
      const channel = L.channels[r() < 0.55 ? 0 : r() < 0.6 ? 1 : 2];
      const lines = r() < 0.3 ? 2 : 1;
      for (let x = 0; x < lines; x += 1) {
        const g = pool[Math.floor(r() * pool.length) % pool.length];
        const qty = r() < 0.85 ? 1 : 2;
        const disc = r() < 0.25 ? 0.85 : 1;
        const amount = Math.round(g.price * qty * disc * 100) / 100;
        sales.push({ date, orderNo, sku: g.sku, name: g.name, category: g.category, qty, amount, cost: Math.round(g.price * 0.42 * qty * 100) / 100, channel, demo: true });
      }
    }
  }
  // 两笔退货（负金额）
  for (const t of [sales[30], sales[sales.length - 40]].filter(Boolean)) {
    sales.push({ ...t, orderNo: `${t.orderNo}-R`, qty: -t.qty, amount: -t.amount, cost: t.cost == null ? null : -t.cost, demo: true });
  }
  const expenses: Array<BaExpenseRow & Flagged> = [];
  const amounts = [18000, 26000, 1800, 3000];
  for (const m of [2, 1, 0]) {
    const first = new Date(today.getFullYear(), today.getMonth() - m, 1);
    if (now - first.getTime() > 62 * 86_400_000) continue;
    for (const [i, item] of L.expenses.entries()) expenses.push({ date: day(first), item, amount: amounts[i], demo: true });
  }
  const dates = sales.map((x) => x.date).sort();
  const imports: BaImport[] = [
    { id: demoId('bai'), kind: 'sales', source: 'manual', file: L.importFile.sales, rows: sales.length, skipped: 0, mapping: {}, from: dates[0], to: dates[dates.length - 1], importedAt: iso(now - 2 * 3_600_000) },
    { id: demoId('bai'), kind: 'expense', source: 'manual', file: L.importFile.expense, rows: expenses.length, skipped: 0, mapping: {}, from: expenses[0]?.date || dates[0], to: expenses[expenses.length - 1]?.date || dates[0], importedAt: iso(now - 2 * 3_600_000) },
  ];

  store.updateData((d) => {
    d.sales = [...d.sales, ...sales];
    d.expenses = [...d.expenses, ...expenses];
  });
  const allSales = store.data().sales;
  const allExp = store.data().expenses;
  const reportOf = (kind: BaReport['kind'], from: string, to: string, at: number): BaReport => {
    const metrics = computeMetrics(allSales, allExp, deps.garments(), from, to);
    const commentary = fill(L.commentary, {
      from, to, revenue: money(metrics.netRevenue), orders: metrics.orders, aov: money(metrics.avgOrderValue), gp: money(metrics.grossProfit), gm: pct(metrics.grossMargin),
      topChannel: metrics.byChannel[0]?.label || '-', topItem: metrics.topItems[0]?.label || '-',
    });
    return { id: demoId('bar'), kind, metrics, commentary, unverified: unverifiedNumbers(commentary, metrics), model: 'demo', createdAt: iso(at) };
  };
  const daily = reportPeriod('daily', new Date(now));
  const monthly = reportPeriod('monthly', new Date(now));
  const reports = [reportOf('daily', daily.from, daily.to, now - 3_600_000), reportOf('monthly', monthly.from, monthly.to, now - 2 * 86_400_000)];
  const last = dates[dates.length - 1];
  const week = computeMetrics(allSales, allExp, deps.garments(), shiftDate(last, -6), last);
  const qa: Array<BaQa & Flagged> = [
    { q: L.qa[0].q, a: fill(L.qa[0].a, { top: week.byChannel[0]?.label || '-', amount: money(week.byChannel[0]?.value || 0), share: pct(week.byChannel[0]?.share || 0) }), model: 'demo', at: iso(now - 90 * 60_000), demo: true },
    { q: L.qa[1].q, a: fill(L.qa[1].a, { from: monthly.from, to: monthly.to, gp: money(reports[1].metrics.grossProfit), gm: pct(reports[1].metrics.grossMargin) }), model: 'demo', at: iso(now - 80 * 60_000), demo: true },
  ];
  const log: Array<BaLogEntry & Flagged> = [
    { at: iso(now - 2 * 3_600_000), module: 'finance', text: L.log[0], ok: true, demo: true },
    { at: iso(now - 2 * 3_600_000 + 60_000), module: 'finance', text: L.log[1], ok: true, demo: true },
    { at: iso(now - 3_600_000), module: 'schedule', text: L.log[2], ok: true, demo: true },
    { at: iso(now - 50 * 60_000), module: 'listing', text: L.log[3], ok: true, demo: true },
    { at: iso(now - 40 * 60_000), module: 'listing', text: L.log[4], ok: true, demo: true },
  ];

  const ruleHits = evaluateRules(deps.garments(), settings, deps.apparelStats(), new Date(now));
  store.update((s) => {
    s.videos = [...videos.reverse(), ...s.videos];
    s.avatars = [...avatars.reverse(), ...s.avatars];
    s.listings = [...listings, ...s.listings];
    s.imports = [...imports, ...s.imports];
    s.reports = [...reports, ...s.reports];
    s.qa = [...qa, ...s.qa];
    s.log = [...log.reverse(), ...s.log];
    s.ruleHits = ruleHits;
  });
  return bizDemoCounts(store);
}

/** 只删演示数据；门店自己的视频、讲稿、上架记录、导入的流水不动 */
export function clearBizDemo(store: BizAutomationStore): BaDemoCounts {
  const before = bizDemoCounts(store);
  const anyFlag = (x: unknown) => !!(x as Flagged).demo;
  store.update((s) => {
    s.videos = s.videos.filter((v) => !isDemo(v.id));
    s.avatars = s.avatars.filter((a) => !isDemo(a.id));
    s.listings = s.listings.filter((l) => !isDemo(l.id) && !isDemo(l.garmentId));
    s.imports = s.imports.filter((i) => !isDemo(i.id));
    s.reports = s.reports.filter((r) => !isDemo(r.id));
    s.qa = s.qa.filter((q) => !anyFlag(q));
    s.log = s.log.filter((l) => !anyFlag(l));
    s.ruleHits = s.ruleHits.filter((h) => !isDemo(h.garmentId));
  });
  store.updateData((d) => {
    d.sales = d.sales.filter((r) => !r.orderNo.startsWith('DEMO-') && !anyFlag(r));
    d.expenses = d.expenses.filter((r) => !anyFlag(r));
  });
  // 示例成片都在 demo/ 子目录里，整个删掉
  try { rmSync(join(store.root(), 'demo'), { recursive: true, force: true }); } catch { /* 已不存在 */ }
  return before;
}
