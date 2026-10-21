/**
 * 有上限的并发派发。
 *
 * 语音逐句、文稿分块转译、fal 上传与图生视频都是互不依赖的网络往返，串行等于把往返一条条
 * 排队：阿语一段二十来句、i2v 一个镜头常在队列里等几分钟，串起来就是十几分钟。
 * 这里收口成一个派发器，免得每处各写一遍 Promise 池，还各写各的错误语义。
 */

/** 并发上限的合法区间：1 = 退回串行（排障用），上限防手滑把服务端打爆 */
const MIN_CONCURRENCY = 1;
const MAX_CONCURRENCY = 8;

function envInt(name: string, dflt: number): number {
  const raw = Number(process.env[name]);
  if (!Number.isFinite(raw)) return dflt;
  return Math.max(MIN_CONCURRENCY, Math.min(MAX_CONCURRENCY, Math.round(raw)));
}

/**
 * fal 侧的默认并发。
 *
 * 不开太大有两个实打实的原因：fal 自己有速率限制；ttsRouter 的熔断按失败数算，并发越高
 * 一次网络抖动能同时打掉的在途请求越多，越容易误拉闸（所以 CIRCUIT_FAILURES 也跟着调过）。
 * 排障时可用 TOTALCLAW_FAL_CONCURRENCY=1 退回串行。
 */
export function falConcurrency(): number {
  return envInt('TOTALCLAW_FAL_CONCURRENCY', 3);
}

/**
 * 本机子进程（edge-tts / ffmpeg）的并发。比 fal 那档高一些：不走网络、没有对端速率限制，
 * 只受本机 CPU 约束。
 */
export function localProcConcurrency(): number {
  return envInt('TOTALCLAW_LOCAL_PROC_CONCURRENCY', 3);
}

export interface MapLimitOptions {
  /**
   * 返回 true 时不再派新活（已在途的仍跑完）。
   * 给「连续失败就别再烧钱等排队」这类闸门用 —— 注意它只拦**还没派出去**的，
   * 已经提交给服务端的那几个不会被撤回。
   */
  stop?: () => boolean;
  /** 默认 true：任一项抛错就停止派活并把**首个**错误抛出；false = 错误由 worker 自己吞掉 */
  stopOnError?: boolean;
  /** 取消信号：已触发时立刻停止派活 */
  signal?: AbortSignal;
  /**
   * 预热：第一项**单独**跑完再扇出剩下的。
   *
   * 并发的代价是「闸门只能拦还没派出去的」—— 没配密钥 / 额度用尽 / 余额不足这类一上来就
   * 注定失败的情况，直接扇出会白扔 limit 个请求才发现。先单独跑一个，成功了再放开，
   * 既保住了「致命错误一次就停」，又不牺牲正常情况下的并发。
   */
  warmup?: boolean;
}

/**
 * 按下标并发跑 worker(items[k], k)，最多同时 limit 个。
 *
 * 不收集返回值：调用方一律往按下标预分配好的数组里写，顺序天然不会乱，
 * 也省掉「结果数组和输入数组对不齐」这类最容易写错的地方。
 */
export async function mapLimit<T>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
  opts: MapLimitOptions = {},
): Promise<void> {
  const stopOnError = opts.stopOnError !== false;
  let next = 0;
  let failed: unknown = null;
  if (opts.warmup && items.length > 1) {
    if (opts.signal?.aborted || opts.stop?.()) return;
    next = 1;
    // 这里不吞错：stopOnError=true 时本就该把首个错误抛出去；=false 时 worker 自己会吞，
    // 真抛出来说明是 worker 的 bug，一样该让它炸出来而不是被并发池咽掉。
    await worker(items[0], 0);
  }
  const width = Math.max(1, Math.min(Math.round(limit) || 1, items.length - next));
  const runners = Array.from({ length: width }, async () => {
    for (;;) {
      if (failed && stopOnError) return;
      if (opts.signal?.aborted || opts.stop?.()) return;
      const k = next;
      next += 1;
      if (k >= items.length) return;
      try {
        await worker(items[k], k);
      } catch (e) {
        if (stopOnError) { failed = failed || e; return; }
        throw e; // stopOnError=false 时 worker 就不该抛；抛了说明是它自己的 bug，别吞
      }
    }
  });
  await Promise.all(runners);
  if (failed) throw failed;
}
