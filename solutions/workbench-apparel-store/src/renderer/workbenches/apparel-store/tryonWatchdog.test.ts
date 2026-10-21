// @vitest-environment happy-dom
/**
 * 服装换装 · 第 ⑤ 步 AI 合成看门狗护栏：
 *   · 计时从这批里最早一张的入队时刻算（刷新 / 换页回来不归零），预计按并发折算；
 *   · 队列没有取消通道：还在跑时「可能已超时」卡不放重新生成；队列事件（state / progress）= 心跳；
 *   · 全部失败 → 红卡 + 「重新生成」= 失败的逐张重试；
 *   · 开跑前预检：没配图像服务直接拦下，不排队。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn(async () => undefined) }) }));
const holder = vi.hoisted(() => ({ warn: vi.fn() }));
vi.mock('../../stores/notification', () => ({
  useNotificationStore: () => ({ info: vi.fn(), success: vi.fn(), warn: holder.warn, error: vi.fn() }),
}));
vi.mock('../../i18n', () => ({
  t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s),
}));

import TryonFlow from './TryonFlow.vue';
import { apQueueProgressAt, apState, earliestPendingAt } from './shared';

const t = (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s);
const MIN = 60_000;
const flush = async (rounds = 6) => { for (let i = 0; i < rounds; i += 1) await new Promise((r) => setTimeout(r, 0)); };
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

function tryon(over: Record<string, unknown> = {}) {
  return { id: 't1', customerId: 'c1', garmentId: 'g1', choice: { backgroundId: 'B29', poseId: 'P01', hairId: 'H00' }, status: 'queued', source: 'desk', code: '1234', createdAt: iso(10 * MIN), ...over };
}
function stateOf(tryons: any[], imageReady = true) {
  return {
    settings: { storeName: '店', editModel: 'x', retentionDays: 7, mobileDailyLimit: 5, watermark: false, disabledOptions: [], outputDir: '' },
    garments: [{ id: 'g1', name: '白T', sku: 'A', price: 1, category: '', color: '', style: '', fabric: '', season: '', audience: 'women', stock: {}, image: '/g.jpg', tags: [], sellingPoints: '', onShelf: true, createdAt: iso(0) }],
    customers: [{ id: 'c1', nickname: '顾客', source: 'desk', photo: '/p.jpg', consentAt: iso(0), createdAt: iso(0), lastSeenAt: iso(0), photoCheck: { ok: true, issues: [] } }],
    tryons, mobile: { running: false, joinUrl: null, port: null, candidates: [], activeSessions: 0 }, imageReady, thumbs: {}, outputDir: '',
  };
}

let calls: string[];
let listeners: Array<(ev: { type: string; payload?: any }) => void>;
function installApi(state: any, onAction?: (action: string, payload: any) => unknown) {
  calls = []; listeners = [];
  const invoke = vi.fn(async (action: string, payload: any) => {
    calls.push(action);
    if (action === 'state.get') return JSON.parse(JSON.stringify(state));
    if (action === 'customer.hasBackground') return false;
    return onAction?.(action, payload) ?? null;
  });
  (window as any).electronAPI = { workbenches: { apparelStore: { invoke, onEvent: vi.fn((cb: any) => { listeners.push(cb); return () => {}; }) } } };
}
async function mountFlow() {
  const w = mount(TryonFlow, { global: { mocks: { $t: t } } });
  await flush();
  await w.find('.ap-grow select').setValue('c1');
  await flush();
  return w;
}

describe('earliestPendingAt', () => {
  it('取待生成（queued 用入队时刻、running 用开始时刻）里最早的；没有待生成返回 undefined', () => {
    const now = Date.now();
    expect(earliestPendingAt([
      { status: 'done', createdAt: new Date(now - 9 * MIN).toISOString() },
      { status: 'queued', createdAt: new Date(now - 5 * MIN).toISOString() },
      { status: 'running', createdAt: new Date(now - 8 * MIN).toISOString(), startedAt: new Date(now - 7 * MIN).toISOString() },
    ])).toBe(now - 7 * MIN);
    expect(earliestPendingAt([{ status: 'failed', createdAt: new Date(now).toISOString() }])).toBeUndefined();
  });
});

describe('TryonFlow 第 ⑤ 步看门狗', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2_000_000_000_000));
    apQueueProgressAt.value = 0;
    holder.warn.mockClear();
  });
  afterEach(() => { vi.useRealTimers(); });

  it('一张 10 分钟前入队还没动：计时从入队算、「可能已超时」卡不放重新生成；队列事件一到就不判', async () => {
    const state = stateOf([tryon()]);
    apState.value = JSON.parse(JSON.stringify(state));
    installApi(state);
    const w = await mountFlow();
    const card = w.find('[data-step-key="ap-generate"]');
    expect(card.find('.ss-step__state').text()).toContain('10 分');
    const alert = card.find('.sra.suspect');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('继续等待');
    expect(alert.text()).not.toContain('重新生成');
    for (const cb of listeners) cb({ type: 'state' });
    await nextTick();
    await flush();
    expect(w.find('[data-step-key="ap-generate"] .sra.suspect').exists()).toBe(false);
    w.unmount();
  });

  it('全部失败：红卡 + 「重新生成」逐张 tryon.retry；开跑前没配图像服务直接拦下不排队', async () => {
    const state = stateOf([tryon({ id: 't1', status: 'failed', error: '图像服务没有返回图片' }), tryon({ id: 't2', status: 'failed', error: '超时' })], false);
    apState.value = JSON.parse(JSON.stringify(state));
    installApi(state);
    const w = await mountFlow();
    const card = w.find('[data-step-key="ap-generate"]');
    const failed = card.find('.sra.failed');
    expect(failed.exists()).toBe(true);
    expect(failed.text()).toContain('图像服务没有返回图片');
    await failed.findAll('button').find((b) => b.text().includes('重新生成'))!.trigger('click');
    await flush();
    expect(calls.filter((c) => c === 'tryon.retry')).toHaveLength(2);

    // 预检：imageReady=false → 不调 tryon.enqueue，红卡写原因
    await w.findAll('.ap-g')[0].trigger('click');
    await flush();
    const gen = card.findAll('button').find((b) => b.text().includes('张试穿图'))!;
    expect(gen.attributes('disabled')).toBeUndefined();
    await gen.trigger('click');
    await flush();
    expect(calls).not.toContain('tryon.enqueue');
    expect(holder.warn).toHaveBeenCalled();
    expect(w.find('[data-step-key="ap-generate"] .sra.failed').text()).toContain('还没有配置图像服务');
    w.unmount();
  });
});
