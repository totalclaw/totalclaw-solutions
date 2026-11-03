// @vitest-environment happy-dom
/**
 * 经营自动化 · 设置页：状态刷新不冲掉没保存的修改（2026-11-03 回归对照里「选择文件夹」后「清除」时有时无）。
 * 切到设置页时会刷新一次状态，后台也会推状态；刷新结果晚于用户操作返回时，原先整张表单被覆盖成已保存的值。
 */
import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

vi.mock('../../stores/notification', () => ({
  useNotificationStore: () => ({ info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));
vi.mock('../../i18n', () => ({
  t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s),
}));

import SettingsTab from './SettingsTab.vue';
import { baState } from './shared';

const settings = (over: Record<string, unknown> = {}) => ({
  brandName: '小店', dataFolders: { sales: '', expense: '', inventory: '' }, storeAddress: '', openingHours: '',
  moduleModels: {}, channels: [], seasonMonths: {}, coreSizes: ['M', 'L'], autoDelistLocal: false,
  schedule: {}, outputDir: '/out', ...over,
});
const state = (s: Record<string, unknown>) => ({ settings: s, videos: [], avatars: [], listings: [], ready: { ffmpeg: true } }) as any;

describe('设置页草稿', () => {
  it('选完文件夹后状态刷新：没保存的文件夹保留，「清除」还在；别人改了的字段照常更新', async () => {
    (window as any).electronAPI = { workbenches: { bizAutomation: { invoke: vi.fn(async (a: string) => (a === 'dirs.pick' ? '/data/sales' : null)), onEvent: () => () => {} } } };
    baState.value = state(settings());
    const w = mount(SettingsTab, { global: { mocks: { $t: (s: string) => s } } });
    await nextTick();
    const pick = w.findAll('button').find((b) => b.text().includes('选择文件夹'))!;
    await pick.trigger('click');
    await new Promise((r) => setTimeout(r, 0));
    await nextTick();
    expect(w.text()).toContain('/data/sales');
    expect(w.findAll('button').some((b) => b.text() === '清除')).toBe(true);
    // 刷新晚到：已保存的值没变（文件夹仍空），但别处改了品牌名
    baState.value = state(settings({ brandName: '新店名' }));
    await nextTick();
    expect(w.text()).toContain('/data/sales');
    expect(w.findAll('button').some((b) => b.text() === '清除')).toBe(true);
    expect((w.find('input[type="text"]').element as HTMLInputElement).value).toBe('新店名');
    w.unmount();
  });
});
