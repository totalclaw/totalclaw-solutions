/**
 * 渲染层 → IPC 出参必须剥掉 Vue 响应式代理（第二轮审查 P0）。
 * contextBridge 在 preload 的 plainClone 之前就做结构化克隆，Proxy 克隆不了会同步抛
 * "An object could not be cloned"，四个模块的核算按钮全部失败。这里钉住 api() 包装层。
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { reactive, ref, isProxy } from 'vue';
import { api } from './shared';

describe('api() 出参剥代理', () => {
  const calls: unknown[][] = [];
  beforeEach(() => {
    calls.length = 0;
    (globalThis as any).window = (globalThis as any).window || {};
    (globalThis as any).window.electronAPI = {
      workbenches: {
        serviceSettlement: {
          reviewRun: (...a: unknown[]) => { calls.push(a); return Promise.resolve({ ok: true }); },
          onEvent: (cb: (e: unknown) => void) => cb,
        },
      },
    };
  });

  it('reactive / ref 里的嵌套对象经 api() 调用后全是普通对象', async () => {
    const tables = reactive([{ path: '/a.xlsx', mapping: { provider: '服务商' } }]);
    const aux = ref<any>({ providers: [{ name: '甲' }], providerManager: { 甲: '张三' } });
    expect(isProxy(tables[0].mapping)).toBe(true);
    await api().reviewRun({ jdInstall: tables.map((t) => ({ path: t.path, mapping: t.mapping })), aux: aux.value });
    const payload = calls[0][0] as any;
    expect(isProxy(payload.jdInstall[0].mapping)).toBe(false);
    expect(isProxy(payload.aux)).toBe(false);
    expect(isProxy(payload.aux.providerManager)).toBe(false);
    expect(payload.aux.providerManager).toEqual({ 甲: '张三' });
    // 结构化克隆不再抛
    expect(() => structuredClone(payload)).not.toThrow();
  });

  it('onEvent 的回调不做 JSON 往返（函数会被丢掉）', () => {
    const cb = () => 1;
    expect(api().onEvent(cb)).toBe(cb);
  });
});
