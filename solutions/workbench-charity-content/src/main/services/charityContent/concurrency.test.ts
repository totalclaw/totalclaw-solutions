/**
 * 有上限的并发派发器：上限真的生效、下标不串、闸门与取消只拦「还没派出去的」、预热先跑一个。
 */
import { describe, it, expect, afterEach } from 'vitest';
import { falConcurrency, localProcConcurrency, mapLimit } from './concurrency';

/** 记录任一时刻的在途数量，用来验「上限真的生效」 */
function tracker() {
  const t = { live: 0, peak: 0, order: [] as number[] };
  return {
    t,
    async run<T>(fn: () => Promise<T>): Promise<T> {
      t.live += 1;
      t.peak = Math.max(t.peak, t.live);
      try { return await fn(); } finally { t.live -= 1; }
    },
  };
}
const tick = (ms = 1): Promise<void> => new Promise((r) => { setTimeout(r, ms); });

afterEach(() => {
  delete process.env.TOTALCLAW_FAL_CONCURRENCY;
  delete process.env.TOTALCLAW_LOCAL_PROC_CONCURRENCY;
});

describe('并发上限', () => {
  it('同时在途不超过上限，全部都跑到，结果按下标各归各位', async () => {
    const { t, run } = tracker();
    const out = new Array<number>(10);
    await mapLimit(Array.from({ length: 10 }, (_, i) => i), 3, async (v, k) => {
      await run(async () => { await tick(); out[k] = v * 2; });
    });
    expect(t.peak).toBe(3);
    expect(out).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
  });
  it('上限大于项数时按项数开，不空转；上限非法（0 / NaN）退回 1', async () => {
    const a = tracker();
    await mapLimit([1, 2], 9, async () => { await a.run(() => tick()); });
    expect(a.t.peak).toBe(2);
    const b = tracker();
    await mapLimit([1, 2, 3], 0, async () => { await b.run(() => tick()); });
    expect(b.t.peak).toBe(1);
  });
  it('空清单：worker 一次都不调', async () => {
    let calls = 0;
    await mapLimit([], 3, async () => { calls += 1; });
    expect(calls).toBe(0);
  });
});

describe('错误与闸门', () => {
  it('默认 stopOnError：抛出首个错误，且不再派新活', async () => {
    const seen: number[] = [];
    await expect(mapLimit([0, 1, 2, 3, 4, 5], 1, async (v) => {
      seen.push(v);
      if (v === 1) throw new Error('boom');
      await tick();
    })).rejects.toThrow('boom');
    expect(seen).toEqual([0, 1]); // 2 之后一个都没派
  });
  it('stopOnError=false：worker 自己吞错，全部跑完', async () => {
    const seen: number[] = [];
    await mapLimit([0, 1, 2], 2, async (v) => {
      try { if (v === 1) throw new Error('boom'); } catch { /* 调用方自己处理 */ }
      seen.push(v);
    }, { stopOnError: false });
    expect(seen.sort()).toEqual([0, 1, 2]);
  });
  it('stop 闸门只拦还没派出去的：已在途的仍会跑完', async () => {
    let started = 0;
    let gate = false;
    await mapLimit([0, 1, 2, 3, 4, 5], 2, async () => {
      started += 1;
      await tick(2);
      gate = true; // 第一批跑完就拉闸
    }, { stop: () => gate });
    // 拉闸前已经派出去 2 个（并发宽度），之后不再派新的
    expect(started).toBe(2);
  });
  it('取消信号：已触发时一个都不派', async () => {
    const c = new AbortController();
    c.abort();
    let calls = 0;
    await mapLimit([1, 2, 3], 3, async () => { calls += 1; }, { signal: c.signal });
    expect(calls).toBe(0);
  });
});

describe('预热（致命错误一次就停）', () => {
  it('第一项单独跑完才扇出：首项就失败时只调了一次', async () => {
    const { t, run } = tracker();
    let calls = 0;
    await expect(mapLimit([0, 1, 2, 3], 3, async () => {
      calls += 1;
      await run(async () => { await tick(); throw new Error('no balance'); });
    }, { warmup: true })).rejects.toThrow('no balance');
    expect(calls).toBe(1); // 没有白扔 3 个请求
    expect(t.peak).toBe(1);
  });
  it('首项成功后放开并发，剩下的仍然并行', async () => {
    const { t, run } = tracker();
    await mapLimit([0, 1, 2, 3, 4, 5], 3, async () => {
      await run(() => tick(2));
    }, { warmup: true });
    expect(t.peak).toBe(3);
  });
  it('只有一项时不走预热分支，行为与普通派发一致', async () => {
    let calls = 0;
    await mapLimit([7], 3, async (v) => { calls += 1; expect(v).toBe(7); }, { warmup: true });
    expect(calls).toBe(1);
  });
});

describe('并发上限取值', () => {
  it('默认 3；环境变量可覆盖并被夹在 1..8', () => {
    expect(falConcurrency()).toBe(3);
    expect(localProcConcurrency()).toBe(3);
    process.env.TOTALCLAW_FAL_CONCURRENCY = '1';
    expect(falConcurrency()).toBe(1); // 排障退回串行
    process.env.TOTALCLAW_FAL_CONCURRENCY = '99';
    expect(falConcurrency()).toBe(8);
    process.env.TOTALCLAW_FAL_CONCURRENCY = '0';
    expect(falConcurrency()).toBe(1);
    process.env.TOTALCLAW_FAL_CONCURRENCY = 'abc';
    expect(falConcurrency()).toBe(3); // 读不出数就用默认，不是 0
  });
  it('每次调用都重读环境变量（不在模块加载时冻结）', () => {
    process.env.TOTALCLAW_LOCAL_PROC_CONCURRENCY = '5';
    expect(localProcConcurrency()).toBe(5);
    process.env.TOTALCLAW_LOCAL_PROC_CONCURRENCY = '2';
    expect(localProcConcurrency()).toBe(2);
  });
});
