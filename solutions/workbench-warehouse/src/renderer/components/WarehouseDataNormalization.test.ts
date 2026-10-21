// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
vi.mock('../i18n', () => ({ t: (s: string) => s, i18n: { global: { locale: { value: 'zh-CN' } } } }));
import Component from './WarehouseDataNormalization.vue';
function setup() { const w = mount(Component, { global: { mocks: { $t: (s: string) => s } } }); return { w, s: (w.vm as any).$.setupState }; }
describe('仓储文件与真实对账 IPC', () => {
  it('大文件编码不超参数栈，读取异常可见且允许同文件重选', async () => {
    const { w, s } = setup(); const bytes = new Uint8Array(200000).fill(65);
    const input = { files: [{ name: 'large.xlsx', size: bytes.length, arrayBuffer: async () => bytes.buffer }], value: 'selected' };
    await s.handleFileUpload({ target: input }); expect(input.value).toBe('');
    const source = s.sources.find((x: any) => x.name === 'large.xlsx'); expect(atob(source.content).length).toBe(bytes.length);
    input.files[0].arrayBuffer = async () => { throw new Error('文件读取被拒绝'); }; input.value = 'selected';
    await s.handleFileUpload({ target: input }); expect(input.value).toBe(''); expect(w.text()).toContain('文件读取被拒绝'); w.unmount();
  });
  it('双账数据可 structured clone，失败接口不留成功结果', async () => {
    const reconcile = vi.fn(async (payload) => { structuredClone(payload); throw new Error('backend denied'); });
    (window as any).electronAPI = { workbenches: { warehouse: { reconcile } } };
    const { w, s } = setup(); s.baseline = { name: 'A', records: [{ sku: '1', nested: { amount: 1 } }] }; s.comparison = { name: 'B', records: [{ sku: '1' }] };
    await s.runNormalizedReconcile(); expect(reconcile).toHaveBeenCalledTimes(1); expect(s.reconcileResult).toBe(null); expect(w.text()).toContain('backend denied'); expect(s.reconcileRunning).toBe(false); w.unmount();
  });
});
