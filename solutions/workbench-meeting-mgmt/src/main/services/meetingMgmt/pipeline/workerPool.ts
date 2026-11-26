/**
 * 会议处理 worker 进程池：起 N 个 Python 进程（每个常驻 Whisper + CAM++），按批分发切片、逐片回收结果。
 *
 * - 批按「累计音频 ≤ 90 秒或 ≤ 12 片」打包（实测一批 12 片比逐片快约 3 倍），谁空闲谁领下一批：长短不一的切片也能均匀摊开，进度粒度也细。
 * - 某个进程中途死掉：重起一次再把这一批重跑；还失败就整体报错（不悄悄丢段）。
 * - 取消：杀掉全部进程，抛「处理已取消」。
 */
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import { createHash } from 'crypto';
import { existsSync, renameSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createChunkDecoder } from '@totalclaw/node-runtime';
import { t as i18nT } from '@totalclaw/i18n';
import { MEETING_WORKER_PY } from './worker.py';
import { abortError } from './audio';

let cachedWorkerScript: string | null = null;
/**
 * 把 worker 脚本落到临时 .py 文件再传给 Python：避免在 Windows 上通过 `-c <18KB 多行脚本>` 触发命令行转义 / 长度 / 安全软件拦截问题。
 * 写临时目录失败时返回 null，回落 `-c`。
 */
function ensureWorkerScriptFile(): string | null {
  try {
    const expected = Buffer.byteLength(MEETING_WORKER_PY, 'utf8');
    if (cachedWorkerScript && existsSync(cachedWorkerScript) && statSync(cachedWorkerScript).size === expected) {
      return cachedWorkerScript;
    }
    const hash = createHash('sha256').update(MEETING_WORKER_PY).digest('hex').slice(0, 12);
    const file = join(tmpdir(), `tc-mm-worker-${hash}.py`);
    if (!existsSync(file) || statSync(file).size !== expected) {
      const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2, 8)}.tmp`;
      writeFileSync(tmp, MEETING_WORKER_PY, 'utf8');
      try {
        renameSync(tmp, file);
      } catch {
        try { unlinkSync(tmp); } catch { /* ignore */ }
        if (!existsSync(file) || statSync(file).size !== expected) writeFileSync(file, MEETING_WORKER_PY, 'utf8');
      }
    }
    cachedWorkerScript = file;
    return file;
  } catch {
    return null;
  }
}

export interface WorkerStartFailureInfo {
  err?: NodeJS.ErrnoException;
  code?: number | null;
  signal?: NodeJS.Signals | null;
  stderr?: string;
  python?: string;
}

/** 把 Python worker 启动阶段退出 / spawn 失败转成可操作的中文提示 + 完整诊断细节（进处理日志和主进程日志）。 */
export function diagnoseWorkerStartFailure(info: WorkerStartFailureInfo): { message: string; detail: string } {
  const errCode = info.err?.code;
  const code = typeof info.code === 'number' ? info.code : null;
  const u32 = code !== null && (code < 0 || code >= 0x80000000) ? (code >>> 0) : null;
  const hex = u32 !== null ? `0x${u32.toString(16).toUpperCase().padStart(8, '0')}` : null;
  const signal = info.signal || null;
  const stderr = String(info.stderr || '').replace(/\r\n/g, '\n').trim();
  const stderrTail = stderr.slice(-600);

  const parts: string[] = [];
  if (errCode || info.err?.message) parts.push(`spawn=${[errCode, info.err?.message].filter(Boolean).join(' ')}`);
  if (code !== null) parts.push(`exit=${hex ? `${code}(${hex})` : code}`);
  if (signal) parts.push(`signal=${signal}`);
  if (info.python) parts.push(`python=${info.python}`);
  if (stderrTail) parts.push(`stderr=${stderrTail}`);
  const detail = parts.join(' | ');

  if (errCode === 'ENOENT') {
    return {
      message: i18nT('本地语音识别进程未能启动：找不到内置语音运行时（可能被杀毒软件隔离或安装不完整），请检查安全软件拦截记录或重装应用'),
      detail,
    };
  }
  if (errCode === 'EACCES' || errCode === 'EPERM') {
    return {
      message: i18nT('本地语音识别进程未能启动：运行权限被拒绝（可能被安全软件拦截），请将应用目录加入杀毒软件白名单后重试'),
      detail,
    };
  }
  const isDllMissing = u32 === 0xC0000135 || u32 === 0xC0000139 || u32 === 0xC000007B
    || /DLL load failed|vcruntime|msvcp|api-ms-win|0xc0000135|找不到指定的模块|无法定位程序输入点/i.test(stderr);
  if (isDllMissing) {
    return {
      message: i18nT('本地语音识别进程未能启动：系统缺少 VC++ 运行库（Visual C++ 2015–2022 Redistributable x64）或语音组件 DLL 被拦截；请安装微软 VC++ 运行库后重试，或到「系统设置 → AI 配置」临时改用在线语音识别'),
      detail,
    };
  }
  if (u32 === 0xC000001D || signal === 'SIGILL') {
    return {
      message: i18nT('本地语音识别进程未能启动：当前电脑处理器不支持本地语音模型所需指令集，请到「系统设置 → AI 配置」改用在线语音识别接口'),
      detail,
    };
  }
  if (signal === 'SIGKILL' || /out of memory|bad_alloc|MemoryError|Cannot allocate memory|paging file is too small|页面文件太小/i.test(stderr)) {
    return {
      message: i18nT('本地语音识别进程未能启动：可用内存不足（模型加载被系统终止），请关闭其他程序、在设置里改用更轻量的 SenseVoice 模型，或改用在线语音识别'),
      detail,
    };
  }
  if (/does not exist|no such file|failed to open|unable to open|ReadFile|InvalidProtobuf|model file missing or empty|model\.int8\.onnx|encoder\.int8\.onnx|tokens\.txt/i.test(stderr)) {
    return {
      message: i18nT('本地语音识别进程未能启动：语音模型文件缺失、损坏或无法读取，请到「配置引导 → 电脑配置与语音模型」重新下载模型后重试'),
      detail,
    };
  }
  if (u32 === 0xC0000005 || u32 === 0xC0000409 || u32 === 0xC00000FD || signal === 'SIGABRT' || signal === 'SIGSEGV') {
    return {
      message: i18nT('本地语音识别进程未能启动：语音模型加载异常退出（可能是模型损坏、内存不足或安全软件拦截），请点「查看处理日志」核对详情，也可在设置里换用 SenseVoice 或在线语音识别'),
      detail,
    };
  }
  const tag = hex ? i18nT('退出码 {p0}', { p0: hex })
    : code !== null ? i18nT('退出码 {p0}', { p0: String(code) })
    : signal ? i18nT('信号 {p0}', { p0: signal })
    : '';
  return {
    message: tag
      ? i18nT('本地语音识别进程未能启动（{p0}）：请点「查看处理日志」查看原因，也可到「系统设置 → AI 配置」临时改用在线语音识别', { p0: tag })
      : i18nT('本地语音识别进程未能启动：请点「查看处理日志」查看原因，也可到「系统设置 → AI 配置」临时改用在线语音识别'),
    detail,
  };
}

export interface WorkerSpec {
  python: string;
  pluginsDir: string;
  /** Whisper 模型名；空 = 只提声纹 */
  model: string;
  modelsDir: string;
  /** CAM++ 模型路径；空 = 只转写 */
  campp: string;
  /** 第二个声纹模型（ERes2NetV2）路径；空 = 没装 */
  campp2?: string;
  threads: number;
  env: NodeJS.ProcessEnv;
}

export interface WorkerReady {
  asr: boolean;
  asrError?: string | null;
  emb: boolean;
  embError?: string | null;
  fbank?: string | null;
}

export interface SliceOutput {
  i: number;
  text?: string;
  lp?: number | null;
  ns?: number | null;
  dropped?: number;
  emb?: number[] | null;
  asrError?: string;
  embError?: string;
  ms?: number;
  /** sherpa 引擎按片判出的语种（zh / yue / en …）；Whisper 不给 */
  lang?: string | null;
  /** 第二个声纹模型（ERes2NetV2）的声纹；没装这个模型时没有 */
  emb2?: number[] | null;
}

type LineHandler = (msg: any) => void;

export class MeetingWorker {
  private child: ChildProcessWithoutNullStreams | null = null;
  private buf = '';
  private handlers = new Map<number, LineHandler>();
  private seq = 0;
  private exited = false;
  private stderrTail = '';
  ready: WorkerReady | null = null;

  constructor(private readonly spec: WorkerSpec) {}

  start(timeoutMs = 180_000): Promise<WorkerReady> {
    return new Promise((resolve, reject) => {
      const s = this.spec;
      const scriptFile = ensureWorkerScriptFile();
      const args = scriptFile
        ? ['-u', scriptFile, s.pluginsDir || '', s.model || '', s.modelsDir || '', s.campp || '', String(s.threads), s.campp2 || '']
        : ['-u', '-c', MEETING_WORKER_PY, s.pluginsDir || '', s.model || '', s.modelsDir || '', s.campp || '', String(s.threads), s.campp2 || ''];
      const c = spawn(s.python, args, {
        env: s.env,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      });
      this.child = c;
      const decode = createChunkDecoder();
      const decodeErr = createChunkDecoder(true);
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        this.kill();
        reject(Object.assign(new Error(i18nT('本地语音模型加载超时')), { detail: this.stderrTail.slice(-600) }));
      }, timeoutMs);
      c.stdout.on('data', (b: Buffer) => {
        this.buf += decode(b);
        let i: number;
        while ((i = this.buf.indexOf('\n')) >= 0) {
          const line = this.buf.slice(0, i).trim();
          this.buf = this.buf.slice(i + 1);
          if (!line.startsWith('__TC_MM__')) continue;
          let msg: any;
          try { msg = JSON.parse(line.slice('__TC_MM__'.length)); } catch { continue; }
          if (!settled && typeof msg?.ready === 'boolean') {
            settled = true;
            clearTimeout(timer);
            if (msg.ready) {
              this.ready = { asr: !!msg.asr, asrError: msg.asrError, emb: !!msg.emb, embError: msg.embError, fbank: msg.fbank };
              resolve(this.ready);
            } else {
              this.kill();
              reject(Object.assign(new Error(i18nT('本地语音识别运行时不可用')), { detail: String(msg.error || '') }));
            }
            continue;
          }
          if (typeof msg?.id === 'number') this.handlers.get(msg.id)?.(msg);
        }
      });
      c.stderr.on('data', (b: Buffer) => { this.stderrTail = (this.stderrTail + decodeErr(b)).slice(-4000); });
      const onGone = (err?: NodeJS.ErrnoException, code?: number | null, signal?: NodeJS.Signals | null) => {
        this.exited = true;
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          const diag = diagnoseWorkerStartFailure({ err, code, signal, stderr: this.stderrTail, python: s.python });
          reject(Object.assign(new Error(diag.message), { detail: diag.detail }));
        }
        for (const [, h] of this.handlers) h({ done: true, error: 'worker exited' });
        this.handlers.clear();
      };
      c.on('error', (e) => onGone(e as NodeJS.ErrnoException));
      c.on('close', (code, signal) => onGone(undefined, code, signal));
    });
  }

  get alive(): boolean {
    return !!this.child && !this.exited;
  }

  /** 发一个请求；onItem 收逐片结果，Promise 在 done 时结束 */
  request(req: Record<string, unknown>, onItem: (msg: any) => void, timeoutMs: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.alive) { reject(new Error('worker exited')); return; }
      const id = ++this.seq;
      const timer = setTimeout(() => {
        this.handlers.delete(id);
        this.kill();
        reject(new Error('worker timeout'));
      }, timeoutMs);
      this.handlers.set(id, (msg) => {
        if (msg.done) {
          clearTimeout(timer);
          this.handlers.delete(id);
          if (msg.error) reject(new Error(String(msg.error)));
          else resolve(msg);
          return;
        }
        onItem(msg);
      });
      try {
        this.child!.stdin.write(`${JSON.stringify({ ...req, id })}\n`);
      } catch (e) {
        clearTimeout(timer);
        this.handlers.delete(id);
        reject(e);
      }
    });
  }

  kill(): void {
    try { this.child?.kill('SIGKILL'); } catch { /* */ }
    this.exited = true;
  }
}

export interface SliceRange { start: number; end: number }

/**
 * 切片打包成批（一批一个请求）：累计音频不超过 maxSec、片数不超过 maxCount。
 * 一批里的切片在 worker 里一起送进 Whisper 批量计算（每片仍是独立输入），谁空闲谁领下一批。
 */
export function makeBatches(slices: SliceRange[], maxSec = 90, maxCount = 12): number[][] {
  const batches: number[][] = [];
  let cur: number[] = [];
  let acc = 0;
  slices.forEach((s, i) => {
    const d = Math.max(0, s.end - s.start);
    if (cur.length && (acc + d > maxSec || cur.length >= maxCount)) { batches.push(cur); cur = []; acc = 0; }
    cur.push(i);
    acc += d;
  });
  if (cur.length) batches.push(cur);
  return batches;
}

export interface RunSlicesOptions {
  workers: number;
  asr: boolean;
  emb: boolean;
  lang?: string | null;
  prompt?: string;
  beam?: number;
  /** 一批最多几片（测试 / 调参用） */
  batchCount?: number;
  signal?: AbortSignal;
  onProgress?: (done: number, total: number) => void;
  /** 进程起好后回报一次（日志用） */
  onReady?: (ready: WorkerReady, index: number) => void;
  /** 测试注入 */
  createWorker?: (spec: WorkerSpec) => Pick<MeetingWorker, 'start' | 'request' | 'kill' | 'alive' | 'ready'>;
}

/** 并行跑完全部切片；返回与 slices 同序的结果 */
export async function runSlices(spec: WorkerSpec, wavPath: string, slices: SliceRange[], o: RunSlicesOptions): Promise<SliceOutput[]> {
  if (o.signal?.aborted) throw abortError();
  const results: Array<SliceOutput | undefined> = Array.from({ length: slices.length }, () => undefined);
  const batches = makeBatches(slices, 90, o.batchCount || 12);
  const queue = batches.map((_, k) => k);
  const create = o.createWorker || ((s: WorkerSpec) => new MeetingWorker(s));
  const n = Math.max(1, Math.min(o.workers, batches.length || 1));
  const workers: Array<ReturnType<typeof create>> = [];
  let done = 0;
  let aborted = false;
  const onAbort = () => { aborted = true; workers.forEach(w => w.kill()); };
  o.signal?.addEventListener('abort', onAbort, { once: true });

  const startWorker = async (idx: number) => {
    const w = create(spec);
    workers[idx] = w;
    const ready = await w.start();
    // 要转写、进程却没能加载语音识别模型（只剩声纹）：不能接着跑——否则每片文字都是空的，最后只会报「没有识别出任何发言」，
    // 用户看不到真正的原因（模型文件坏了 / 组件没装上 / 内存不够）
    if (o.asr && !ready.asr) {
      w.kill();
      const why = String(ready.asrError || '');
      // 组件没装上（模型文件在、Python 包不在）：告诉用户怎么修，而不是只给一句 Python 报错
      if (/No module named '(sherpa_onnx|faster_whisper|ctranslate2)'/.test(why)) {
        throw Object.assign(
          new Error(i18nT('语音识别组件没装好（模型文件在，但运行组件缺失）。请在「配置引导 → 电脑配置与语音模型」里重新下载推荐的转写模型。') + `（${why.slice(0, 120)}）`),
          { detail: why },
        );
      }
      if (/model file missing or empty|FileNotFoundError/i.test(why)) {
        throw Object.assign(
          new Error(i18nT('语音模型文件缺失或已损坏，请在「配置引导 → 电脑配置与语音模型」重新下载模型后重试。') + `（${why.slice(0, 120)}）`),
          { detail: why },
        );
      }
      throw Object.assign(new Error(i18nT('语音识别模型没能加载：{p0}', { p0: (why || i18nT('原因未知')).slice(0, 300) })), { detail: why });
    }
    o.onReady?.(ready, idx);
    return w;
  };

  const runBatch = async (w: ReturnType<typeof create>, k: number) => {
    const ids = batches[k]!;
    const audioSec = ids.reduce((s, i) => s + (slices[i]!.end - slices[i]!.start), 0);
    await w.request({
      op: 'run',
      wav: wavPath,
      slices: ids.map(i => [slices[i]!.start, slices[i]!.end]),
      asr: o.asr,
      emb: o.emb,
      lang: o.lang || '',
      prompt: o.prompt || '',
      beam: o.beam || 1,
    }, (msg) => {
      const gi = ids[Number(msg.i)];
      if (gi === undefined || results[gi]) return;
      results[gi] = { ...msg, i: gi };
      done++;
      o.onProgress?.(done, slices.length);
    }, Math.max(120_000, audioSec * 6_000));
  };

  // 失败处理：进程死了 / 超时 / 起不来 → 这一批放回队列（最多试 3 次），已经回来的片不重复计数；
  // 某个进程连续两次起不来就退出，剩下的批交给还活着的进程（比如内存只够跑两个 large-v3）。
  // 全部进程都退出了还有批没跑完 → 报第一个错误。
  const attempts = new Map<number, number>();
  let firstError: unknown = null;
  try {
    const loops = Array.from({ length: n }, async (_, idx) => {
      let w: ReturnType<typeof create> | null = null;
      let consecutive = 0;
      while (!aborted) {
        const k = queue.shift();
        if (k === undefined) break;
        try {
          if (!w || !w.alive) { w?.kill(); w = await startWorker(idx); }
          await runBatch(w, k);
          consecutive = 0;
        } catch (e) {
          if (aborted) break;
          firstError ||= e;
          w?.kill();
          w = null;
          const a = (attempts.get(k) || 0) + 1;
          attempts.set(k, a);
          if (a < 3) queue.unshift(k);
          if (++consecutive >= 2) break;
        }
      }
      w?.kill();
    });
    await Promise.all(loops);
  } finally {
    o.signal?.removeEventListener('abort', onAbort);
    workers.forEach(w => w?.kill());
  }
  if (aborted || o.signal?.aborted) throw abortError();
  if (results.some(r => !r)) {
    if (firstError instanceof Error) throw firstError;
    throw new Error(i18nT('本地语音识别进程未能启动'));
  }
  return results as SliceOutput[];
}

/** 用一个进程判语种：取几段较长的切片投票 */
export async function detectLanguage(spec: WorkerSpec, wavPath: string, sample: SliceRange[], createWorker?: RunSlicesOptions['createWorker']): Promise<{ lang: string | null; prob: number }> {
  if (!sample.length) return { lang: null, prob: 0 };
  const w = (createWorker || ((s: WorkerSpec) => new MeetingWorker(s)))(spec);
  try {
    const ready = await w.start();
    if (!ready.asr) return { lang: null, prob: 0 };
    const msg = await w.request({ op: 'detect', wav: wavPath, slices: sample.map(s => [s.start, s.end]) }, () => {}, 180_000);
    return { lang: msg?.lang || null, prob: Number(msg?.prob) || 0 };
  } finally {
    w.kill();
  }
}
