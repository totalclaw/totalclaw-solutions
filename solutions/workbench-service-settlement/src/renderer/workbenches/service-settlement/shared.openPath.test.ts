/**
 * openPath 必须按 preload 的签名 `openPath(path, { reveal })` 传位置参数。
 * 2026-09-04 实测：传成 `{ path, reveal }` 一个对象 → 主进程拿到的 path 是对象 → 「无效路径」静默失败，
 * 「打开结果表 / 打开所在文件夹」按钮点了没反应。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openPath } from './shared';

describe('openPath → electronAPI.solution.openPath', () => {
  const spy = vi.fn(async () => ({ ok: true }));
  beforeEach(() => {
    spy.mockClear();
    (globalThis as any).window = Object.assign((globalThis as any).window || {}, { electronAPI: { solution: { openPath: spy } } });
  });
  it('打开文件：path 为第一个参数，不带 reveal', () => {
    openPath('/tmp/a.xlsx');
    expect(spy).toHaveBeenCalledWith('/tmp/a.xlsx', { reveal: false });
  });
  it('在文件夹里显示：reveal 走第二个参数', () => {
    openPath('/tmp/a.xlsx', true);
    expect(spy).toHaveBeenCalledWith('/tmp/a.xlsx', { reveal: true });
  });
  it('空路径不调用', () => {
    openPath('');
    expect(spy).not.toHaveBeenCalled();
  });
});
