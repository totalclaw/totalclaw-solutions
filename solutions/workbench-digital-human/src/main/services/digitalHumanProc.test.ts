import { describe, expect, it, vi } from 'vitest';
import { DigitalHumanProc, isTaskFailed, isTaskFinished } from './digitalHumanProc';

function makeClient() {
  const calls: { path: string; body?: any }[] = [];
  const responses = new Map<string, any>();
  const client = {
    get: vi.fn(async (path: string) => { calls.push({ path }); return responses.get(path) ?? { ok: true }; }),
    post: vi.fn(async (path: string, body: any) => { calls.push({ path, body }); return responses.get(path) ?? { ok: true }; }),
  };
  return { client, calls, responses };
}

function makeProc(overrides?: { client?: any }) {
  const h = makeClient();
  const proc = new DigitalHumanProc({ getClient: () => overrides?.client ?? h.client });
  return { proc, ...h };
}

describe('任务完成判定', () => {
  it('拿到 video_url 就算完成 —— 不能只认 status 字符串', () => {
    // 上游踩过的坑：阿里返回数字枚举 "3"=成功，端侧判 status==='done' 会永远轮询
    expect(isTaskFinished({ status: '3', video_url: 'https://x/a.mp4' })).toBe(true);
    expect(isTaskFinished({ status: '3' })).toBe(true);
    expect(isTaskFinished({ status: 'done' })).toBe(true);
    expect(isTaskFinished({ status: 'success' })).toBe(true);
    expect(isTaskFinished({ videoUrl: 'https://x/a.mp4' })).toBe(true);
  });

  it('还在跑不算完成', () => {
    expect(isTaskFinished({ status: '2' })).toBe(false);
    expect(isTaskFinished({ status: 'running' })).toBe(false);
    expect(isTaskFinished({})).toBe(false);
  });

  it('失败态也要能判出来，否则轮询转到超时', () => {
    expect(isTaskFailed({ status: '4' })).toBe(true);
    expect(isTaskFailed({ status: 'failed' })).toBe(true);
    expect(isTaskFailed({ status: '3' })).toBe(false);
  });

  it('空 video_url 不算完成（空串曾被当成"有值"）', () => {
    expect(isTaskFinished({ status: '2', video_url: '   ' })).toBe(false);
  });
});

describe('实时会话登记', () => {
  it('live/start 成功后登记会话 —— 不登记等于脱管，退出时停不掉', async () => {
    const { proc, responses } = makeProc();
    responses.set('/v1/digital_human/live/start', { ok: true, session_id: 'sess-1', provider: 'aliyun_dvh' });
    await proc.liveStart({ avatarId: 'A' });
    expect(proc.listTracked()).toHaveLength(1);
    expect(proc.listTracked()[0]).toMatchObject({ sessionId: 'sess-1', kind: 'live', provider: 'aliyun_dvh' });
  });

  it('camelCase 的 sessionId 也认（客户端会做 snake→camel 转换）', async () => {
    const { proc, responses } = makeProc();
    responses.set('/v1/digital_human/session/start', { ok: true, sessionId: 'sess-2' });
    await proc.sessionStart({});
    expect(proc.listTracked()[0]).toMatchObject({ sessionId: 'sess-2', kind: 'session' });
  });

  it('上游没回 session_id 就不登记（登记一个假 id 只会让全停报错）', async () => {
    const { proc, responses } = makeProc();
    responses.set('/v1/digital_human/live/start', { ok: false, error: 'quota' });
    await proc.liveStart({});
    expect(proc.listTracked()).toHaveLength(0);
  });

  it('session 类会话停走 session/stop，live 类走 live/stop', async () => {
    const { proc, calls, responses } = makeProc();
    responses.set('/v1/digital_human/session/start', { sessionId: 's' });
    responses.set('/v1/digital_human/live/start', { sessionId: 'l' });
    await proc.sessionStart({});
    await proc.liveStart({});
    await proc.stopSession('s');
    await proc.stopSession('l');
    const paths = calls.map((c) => c.path);
    expect(paths).toContain('/v1/digital_human/session/stop');
    expect(paths).toContain('/v1/digital_human/live/stop');
  });
});

describe('停止语义', () => {
  it('停成功后从登记里移除', async () => {
    const { proc, responses } = makeProc();
    responses.set('/v1/digital_human/live/start', { sessionId: 'a' });
    await proc.liveStart({});
    await proc.stopSession('a');
    expect(proc.listTracked()).toHaveLength(0);
  });

  it('停失败也要移除 —— 否则每次退出都重试同一路、每次都失败', async () => {
    const client = {
      get: vi.fn(async () => ({})),
      post: vi.fn(async (path: string) => {
        if (path.endsWith('/live/stop')) throw new Error('502');
        return { sessionId: 'a' };
      }),
    };
    const proc = new DigitalHumanProc({ getClient: () => client });
    await proc.liveStart({});
    await expect(proc.stopSession('a')).rejects.toThrow('502');
    expect(proc.listTracked()).toHaveLength(0);
  });

  it('急停把 emergency 透传给上游（四段式急停）', async () => {
    const { proc, calls, responses } = makeProc();
    responses.set('/v1/digital_human/live/start', { sessionId: 'a' });
    await proc.liveStart({});
    await proc.stopSession('a', true);
    const stop = calls.find((c) => c.path.endsWith('/live/stop'));
    expect(stop?.body).toMatchObject({ emergency: true });
  });

  it('stopAll 逐个停，一路失败不影响其它路', async () => {
    const client = {
      get: vi.fn(async () => ({})),
      post: vi.fn(async (path: string, body: any) => {
        if (path.endsWith('/live/stop') && body.sessionId === 'b') throw new Error('boom');
        if (path.endsWith('/live/start')) return { sessionId: body.id };
        return { ok: true };
      }),
    };
    const proc = new DigitalHumanProc({ getClient: () => client });
    await proc.liveStart({ id: 'a' });
    await proc.liveStart({ id: 'b' });
    await proc.liveStart({ id: 'c' });
    const r = await proc.stopAll();
    expect(r).toEqual({ stopped: 2, failed: 1 });
    expect(proc.listTracked()).toHaveLength(0);
  });

  it('shutdown 会把所有会话停掉 —— 忘了停就一直烧钱，这是退出兜底', async () => {
    const { proc, calls, responses } = makeProc();
    responses.set('/v1/digital_human/live/start', { sessionId: 'a' });
    await proc.liveStart({});
    await proc.shutdown();
    expect(calls.some((c) => c.path.endsWith('/live/stop'))).toBe(true);
    expect(proc.listTracked()).toHaveLength(0);
  });

  it('没有会话时 shutdown 不打任何接口', async () => {
    const { proc, calls } = makeProc();
    await proc.shutdown();
    expect(calls).toHaveLength(0);
  });
});

describe('服务未就绪', () => {
  it('qiye-api 没起来时给人话错误，而不是 undefined.post 崩掉', async () => {
    const proc = new DigitalHumanProc({ getClient: () => null });
    await expect(proc.getStatus()).rejects.toThrow(/数字人服务未就绪/);
    await expect(proc.liveStart({})).rejects.toThrow(/数字人服务未就绪/);
  });
});

describe('会话变化广播', () => {
  it('起会话与停会话都推 sessions 事件（UI 的「N 路在跑」靠它）', async () => {
    const { proc, responses } = makeProc();
    responses.set('/v1/digital_human/live/start', { sessionId: 'a' });
    const seen: number[] = [];
    proc.on('sessions', (list: unknown[]) => seen.push(list.length));
    await proc.liveStart({});
    await proc.stopSession('a');
    expect(seen).toEqual([1, 0]);
  });
});
