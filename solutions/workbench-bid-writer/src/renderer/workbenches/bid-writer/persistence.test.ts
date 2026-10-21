// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
const error = vi.hoisted(() => vi.fn());
vi.mock('../../stores/notification', () => ({ useNotificationStore: () => ({ error }) }));
import { useBidWriter } from './shared';
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });
describe('标书保存回执', () => {
  it('缺失接口/业务拒绝必须拒绝保存，不能解除后续步骤', async () => {
    (window as any).electronAPI = {};
    const state = useBidWriter(); await expect(state.saveNow()).rejects.toThrow('保存接口不可用');
    (window as any).electronAPI = { workbenches: { bidWriter: { stateSave: async () => ({ ok: false, error: '保存被拒绝' }) } } };
    await expect(state.saveNow()).rejects.toThrow('保存被拒绝');
  });
  it('自动保存失败可见，调用参数可克隆', async () => {
    vi.useFakeTimers();
    const stateSave = vi.fn(async (payload) => { structuredClone(payload); throw new Error('磁盘不可写'); });
    (window as any).electronAPI = { workbenches: { bidWriter: { stateSave } } };
    const state = useBidWriter(); state.save(); await vi.advanceTimersByTimeAsync(600);
    expect(stateSave).toHaveBeenCalledTimes(1); expect(error).toHaveBeenCalledWith('磁盘不可写');
  });
});
