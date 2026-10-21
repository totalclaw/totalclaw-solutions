// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
const error = vi.hoisted(() => vi.fn());
vi.mock('../stores/notification', () => ({ useNotificationStore: () => ({ error }) }));
import { openPath as service } from './service-settlement/shared';
import { openPath as bid } from './bid-writer/shared';
import { openPath as charity } from './charity-content/shared';
import { openPath as quran } from './quran-teaching/shared';
it.each([service, bid, charity, quran])('各工作台复用可见错误路径', async (open) => {
  for (const mode of ['missing', 'rejected', 'business', 'sync']) {
    error.mockClear();
    const invoke = mode === 'sync' ? vi.fn(() => { throw new Error('打开失败'); }) : mode === 'rejected' ? vi.fn().mockRejectedValue(new Error('打开失败')) : vi.fn().mockResolvedValue({ ok: false, error: '打开失败' });
    (window as any).electronAPI = mode === 'missing' ? {} : { solution: { openPath: invoke } };
    expect(() => open('/tmp/output.docx', true)).not.toThrow(); await flushPromises();
    expect(error).toHaveBeenCalled(); if (mode !== 'missing') expect(invoke).toHaveBeenCalledWith('/tmp/output.docx', { reveal: true });
  }
});
