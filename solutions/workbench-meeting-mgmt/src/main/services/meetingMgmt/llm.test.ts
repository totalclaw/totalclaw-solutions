/**
 * 会议智能管理 · MmLlm：模型不可用 / 超时 / 通道错误正文 / 空回复一律 null，不抛；E2E 假端点。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../councilChatRouter', () => ({ runOneshotChat: vi.fn(async () => 'real') }));

import { createMeetingLlm } from './llm';

const deps = { logger: { warn: vi.fn(), info: vi.fn() } } as any;

afterEach(() => {
  vi.useRealTimers();
  delete process.env.TOTALCLAW_E2E;
  delete process.env.TOTALCLAW_E2E_LLM_URL;
});

describe('createMeetingLlm', () => {
  it('纯补全调用；json 时追加只返回 JSON 的指令', async () => {
    const run = vi.fn(async (_d: any, p: string, _o?: any) => `  回复：${p.length}  `);
    const llm = createMeetingLlm(deps, { run });
    expect(await llm('整理纪要')).toBe('回复：4');
    expect(run.mock.calls[0][2]).toMatchObject({ plainCompletion: true, timeoutMs: 120_000 });
    await llm('拆任务', { json: true, timeoutMs: 5000 });
    expect(run.mock.calls[1][1]).toMatch(/^拆任务[\s\S]*Return ONLY one valid JSON object/);
    expect(run.mock.calls[1][2]?.timeoutMs).toBe(5000);
  });

  it('默认走 runOneshotChat', async () => {
    expect(await createMeetingLlm(deps)('x')).toBe('real');
  });

  it('抛错 / 通道错误正文 / 空回复 → null', async () => {
    expect(await createMeetingLlm(deps, { run: async () => { throw new Error('未配置模型'); } })('x')).toBeNull();
    expect(await createMeetingLlm(deps, { run: async () => '⚠️ API Key 无效' })('x')).toBeNull();
    expect(await createMeetingLlm(deps, { run: async () => '   ' })('x')).toBeNull();
  });

  it('一直不结束：总时长上限到了返回 null', async () => {
    vi.useFakeTimers();
    const llm = createMeetingLlm(deps, { run: () => new Promise<string>(() => {}) });
    const p = llm('x', { timeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(4100);
    expect(await p).toBeNull();
  });

  it('E2E 假端点：只认本机地址', async () => {
    process.env.TOTALCLAW_E2E = '1';
    process.env.TOTALCLAW_E2E_LLM_URL = 'http://127.0.0.1:9999/llm';
    const fetchImpl = vi.fn(async (_u: any, init: any) => ({ json: async () => ({ text: `stub:${JSON.parse(init.body).module}` }) })) as any;
    const run = vi.fn(async () => 'real');
    expect(await createMeetingLlm(deps, { run, fetchImpl })('x')).toBe('stub:meeting-mgmt');
    expect(run).not.toHaveBeenCalled();
    process.env.TOTALCLAW_E2E_LLM_URL = 'http://example.com/llm';
    expect(await createMeetingLlm(deps, { run, fetchImpl })('x')).toBe('real');
  });
});
