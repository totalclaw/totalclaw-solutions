// @vitest-environment happy-dom
/**
 * 经营自动化 · 成片步骤看门狗护栏（2026-10-13「等 10 分钟都没变化，不知道是生成不出来还是正在生成」）：
 *   · 换页 / 刷新回来发现项目还是 rendering：计时从主进程写 rendering 那一刻算，跑过线出「可能已超时」卡；
 *   · 短视频「重新生成」先取消旧任务、等它真退出，再起新一轮（顺序：video.cancel → video.render）；
 *   · 数字人没有取消通道：还在跑时「可能已超时」卡不放重新生成，失败后才有；
 *   · 主进程启动时把上次中断的 rendering 收成 failed 后，界面是红卡 + 重新成片，没有第二份错误文案。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn(async () => undefined) }) }));
vi.mock('../../stores/notification', () => ({
  useNotificationStore: () => ({ info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));
vi.mock('../../i18n', () => ({
  t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s),
}));

import VideoTab from './VideoTab.vue';
import AvatarTab from './AvatarTab.vue';
import { baGarments, baRenderStartedAt, baState } from './shared';

const t = (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s);
const MIN = 60_000;
const flush = async (rounds = 6) => { for (let i = 0; i < rounds; i += 1) await new Promise((r) => setTimeout(r, 0)); };

function video(over: Record<string, unknown> = {}) {
  return {
    id: 'v1', type: 'new_arrival', name: '新品上新', garmentIds: ['g1'], brief: '', materials: ['/m/1.jpg'],
    scenes: [{ image: '/m/1.jpg', line: '新到' }], copies: {}, platforms: ['douyin'], narration: true, voiceGender: 'female',
    status: 'rendering', warnings: [], createdAt: '2026-10-13T00:00:00.000Z', updatedAt: new Date(Date.now() - 20 * MIN).toISOString(),
    ...over,
  };
}
function avatar(over: Record<string, unknown> = {}) {
  return {
    id: 'a1', topic: 'company_intro', name: '企业介绍', script: '大家好', facts: [], durationHint: 45, avatarId: 'x', voiceId: '', aspectRatio: '9:16',
    likenessConsent: '', status: 'rendering', warnings: [], createdAt: '2026-10-13T00:00:00.000Z', updatedAt: new Date(Date.now() - 30 * MIN).toISOString(),
    ...over,
  };
}
function baseState(over: Record<string, unknown> = {}) {
  return { settings: { outputDir: '', moduleModels: {} }, ready: { ffmpeg: true }, videos: [], avatars: [], listings: [], ...over };
}

let state: any;
let calls: string[];
let listeners: Array<(ev: { type: string; payload?: any }) => void>;
function installApi(onAction?: (action: string, payload: any) => unknown) {
  calls = [];
  listeners = [];
  const invoke = vi.fn(async (action: string, payload: any) => {
    calls.push(action);
    if (action === 'state.get') return JSON.parse(JSON.stringify(state));
    if (action === 'garments.list' || action === 'video.review' || action === 'avatar.facts') return [];
    if (action === 'avatar.status') return { ready: true };
    return onAction?.(action, payload) ?? null;
  });
  (window as any).electronAPI = {
    workbenches: { bizAutomation: { invoke, onEvent: vi.fn((cb: any) => { listeners.push(cb); return () => {}; }) } },
  };
  return invoke;
}
const g = { global: { mocks: { $t: t } } };

describe('短视频成片步骤看门狗', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2_000_000_000_000));
    for (const k of Object.keys(baRenderStartedAt)) delete baRenderStartedAt[k];
    baGarments.value = [];
  });
  afterEach(() => { vi.useRealTimers(); });

  it('换页回来项目仍是 rendering（20 分钟前开始）→ 计时从那时算、出「可能已超时」卡；重新生成先取消旧任务再起新一轮', async () => {
    state = baseState({ videos: [video()] });
    baState.value = JSON.parse(JSON.stringify(state));
    installApi((action) => {
      if (action === 'video.cancel') { state.videos[0].status = 'failed'; state.videos[0].error = '已取消'; return true; }
      if (action === 'video.render') { state.videos[0].status = 'rendering'; state.videos[0].error = undefined; state.videos[0].updatedAt = new Date().toISOString(); return state.videos[0]; }
      return null;
    });
    const w = mount(VideoTab, { props: { focus: { id: 'v1' } }, ...g });
    await flush();
    const card = w.find('[data-step-key="v-render"]');
    expect(card.find('.ss-step__state').text()).toContain('20 分');
    expect(card.find('.ss-step__state').text()).toContain('可能已超时');
    const alert = card.find('.sra.suspect');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('继续等待');
    expect(alert.text()).toContain('重新成片');
    // 没有第二份错误文案（旧的 <p class="ss-note danger"> 已删）
    expect(card.find('.ss-note.danger').exists()).toBe(false);

    await alert.findAll('button').find((b) => b.text().includes('重新成片'))!.trigger('click');
    await vi.advanceTimersByTimeAsync(1_000);
    await flush();
    const iCancel = calls.indexOf('video.cancel');
    const iRender = calls.indexOf('video.render');
    expect(iCancel).toBeGreaterThanOrEqual(0);
    expect(iRender).toBeGreaterThan(iCancel);
    // 新一轮从现在起算：不再是「可能已超时」
    await flush();
    expect(w.find('[data-step-key="v-render"] .sra.suspect').exists()).toBe(false);
    expect(baRenderStartedAt.v1).toBeGreaterThan(Date.now() - 5_000);
    w.unmount();
  });

  it('主进程进度事件还在到就不判超时：20 分钟前开始但刚收到一条进度 → 只说比预计慢', async () => {
    state = baseState({ videos: [video()] });
    baState.value = JSON.parse(JSON.stringify(state));
    installApi();
    const w = mount(VideoTab, { props: { focus: { id: 'v1' } }, ...g });
    await flush();
    expect(w.find('[data-step-key="v-render"] .sra.suspect').exists()).toBe(true);
    for (const cb of listeners) cb({ type: 'progress', payload: { key: 'video', message: '正在合成第 3 镜…' } });
    await nextTick();
    await flush();
    expect(w.find('[data-step-key="v-render"] .sra.suspect').exists()).toBe(false);
    expect(w.find('[data-step-key="v-render"] .ss-step__state').text()).toContain('比预计慢');
    w.unmount();
  });

  it('应用重启后主进程把 rendering 收成 failed：红卡写原因 + 「重新成片」→ 点了就调 video.render', async () => {
    state = baseState({ videos: [video({ status: 'failed', error: '应用重启导致上次成片中断，请重新成片' })] });
    baState.value = JSON.parse(JSON.stringify(state));
    installApi((action) => {
      if (action === 'video.render') { state.videos[0].status = 'rendering'; state.videos[0].error = undefined; return state.videos[0]; }
      return null;
    });
    const w = mount(VideoTab, { props: { focus: { id: 'v1' } }, ...g });
    await flush();
    const card = w.find('[data-step-key="v-render"]');
    const failed = card.find('.sra.failed');
    expect(failed.exists()).toBe(true);
    expect(failed.text()).toContain('应用重启导致上次成片中断');
    expect(card.find('.spin').exists()).toBe(false);
    expect(card.find('.ss-note.danger').exists()).toBe(false);
    await failed.findAll('button').find((b) => b.text().includes('重新成片'))!.trigger('click');
    await flush();
    expect(calls).toContain('video.render');
    expect(calls).not.toContain('video.cancel');
    w.unmount();
  });
});

describe('数字人成片步骤看门狗', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2_000_000_000_000));
    for (const k of Object.keys(baRenderStartedAt)) delete baRenderStartedAt[k];
  });
  afterEach(() => { vi.useRealTimers(); });

  it('没有取消通道：还在跑时「可能已超时」只给 继续等待 / 查看日志，不放重新生成；失败后才有重新成片', async () => {
    state = baseState({ avatars: [avatar()] });
    baState.value = JSON.parse(JSON.stringify(state));
    installApi((action) => {
      if (action === 'avatar.render') { state.avatars[0].status = 'rendering'; return state.avatars[0]; }
      return null;
    });
    const w = mount(AvatarTab, { ...g });
    await flush();
    await w.find('.ba-projbar select').setValue('a1');
    await flush();
    const card = w.find('[data-step-key="a-render"]');
    expect(card.find('.ss-step__state').text()).toContain('30 分');
    const alert = card.find('.sra.suspect');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('继续等待');
    expect(alert.text()).toContain('查看日志');
    expect(alert.text()).not.toContain('重新成片');
    expect(card.find('.ss-note.danger').exists()).toBe(false);

    // 主进程最终报失败 → 红卡 + 重新成片
    state.avatars[0].status = 'failed';
    state.avatars[0].error = '数字人成片超时，请稍后重试';
    baState.value = JSON.parse(JSON.stringify(state));
    await flush();
    const failed = w.find('[data-step-key="a-render"] .sra.failed');
    expect(failed.exists()).toBe(true);
    expect(failed.text()).toContain('数字人成片超时');
    await failed.findAll('button').find((b) => b.text().includes('重新成片'))!.trigger('click');
    await flush();
    expect(calls).toContain('avatar.render');
    w.unmount();
  });
});
