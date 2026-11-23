/**
 * 会议录音 / 录屏的格式识别与解码（只在本机，用 ffmpeg / ffprobe）。
 *
 * - 认得的扩展名直接分类；认不出的交给 ffprobe 看有没有音轨，有就当音频处理。
 * - 一律解成 16k 单声道 16 位 PCM 的 wav（Whisper 与 CAM++ 都吃这个），多份文件按上传顺序首尾相接。
 * - wav 的读写自己做（只认我们自己写出来的这一种格式），切片 / 试听片段不再起 ffmpeg。
 */
import { spawn } from 'child_process';
import { closeSync, createWriteStream, existsSync, openSync, readSync, statSync, writeSync } from 'fs';
import { extname } from 'path';
import { createChunkDecoder } from '@totalclaw/node-runtime';
import { t as i18nT } from '@totalclaw/i18n';

export const SAMPLE_RATE = 16000;

/** 音频扩展名（不带点、小写）。webm 两边都有：交给 ffprobe 判断有没有画面，处理上没区别。 */
export const AUDIO_EXTS = [
  'mp3', 'm4a', 'm4b', 'wav', 'wave', 'aac', 'amr', 'awb', '3ga', 'flac', 'ogg', 'oga', 'opus', 'wma',
  'webm', 'weba', 'caf', 'aiff', 'aif', 'aifc', 'mp2', 'mpga', 'ac3', 'eac3', 'ape', 'wv', 'mka', 'spx', 'alac', 'au', 'snd',
];
export const VIDEO_EXTS = [
  'mp4', 'mov', 'mkv', 'avi', 'flv', 'f4v', 'wmv', 'asf', 'm4v', '3gp', '3g2', 'mpg', 'mpeg', 'ts', 'mts', 'm2ts',
  'vob', 'ogv', 'rm', 'rmvb', 'divx', 'dv', 'mxf',
];
export const TRANSCRIPT_EXTS = ['txt', 'md', 'markdown', 'docx', 'srt', 'vtt', 'json', 'text', 'log'];

export type MediaKind = 'audio' | 'video' | 'transcript';

function extOf(name: string): string {
  return extname(name).replace(/^\./, '').toLowerCase();
}

/** 只看扩展名分类；认不出返回 null（调用方再用 ffprobe 探测） */
export function mediaKindByExt(name: string): MediaKind | null {
  const ext = extOf(name);
  if (!ext) return null;
  if (TRANSCRIPT_EXTS.includes(ext)) return 'transcript';
  if (VIDEO_EXTS.includes(ext)) return 'video';
  if (AUDIO_EXTS.includes(ext)) return 'audio';
  return null;
}

export interface ProbeResult {
  hasAudio: boolean;
  hasVideo: boolean;
  duration?: number;
}

/** 跑一个子进程，收 stdout / stderr；被取消或超时就杀掉 */
export function runProcess(bin: string, args: string[], opts: { signal?: AbortSignal; timeoutMs?: number } = {}): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    if (opts.signal?.aborted) { reject(abortError()); return; }
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let stdout = '';
    let stderr = '';
    let finished = false;
    const onAbort = () => { try { child.kill('SIGKILL'); } catch { /* */ } finish(() => reject(abortError())); };
    const timer = opts.timeoutMs ? setTimeout(() => {
      try { child.kill('SIGKILL'); } catch { /* */ }
      finish(() => reject(new Error(i18nT('处理超时'))));
    }, opts.timeoutMs) : null;
    const finish = (fn: () => void) => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      opts.signal?.removeEventListener('abort', onAbort);
      fn();
    };
    const decodeOut = createChunkDecoder();
    const decodeErr = createChunkDecoder();
    opts.signal?.addEventListener('abort', onAbort, { once: true });
    child.stdout.on('data', (b: Buffer) => { if (stdout.length < 4_000_000) stdout += decodeOut(b); });
    child.stderr.on('data', (b: Buffer) => { if (stderr.length < 200_000) stderr += decodeErr(b); });
    child.on('error', (e) => finish(() => reject(e)));
    child.on('close', (code) => {
      finish(() => resolve({ code, stdout, stderr }));
    });
  });
}

export function abortError(): Error {
  const e = new Error(i18nT('处理已取消'));
  (e as any).aborted = true;
  return e;
}

/** ffprobe 看文件里有没有音轨 / 画面；探测不了（不是媒体文件）返回 null */
export async function probeMedia(ffprobe: string, path: string, signal?: AbortSignal): Promise<ProbeResult | null> {
  try {
    const r = await runProcess(ffprobe, ['-v', 'error', '-show_entries', 'stream=codec_type:format=duration', '-of', 'json', path], { signal, timeoutMs: 60_000 });
    if (r.code !== 0) return null;
    const j = JSON.parse(r.stdout || '{}');
    const streams: Array<{ codec_type?: string }> = Array.isArray(j.streams) ? j.streams : [];
    const duration = Number(j?.format?.duration);
    return {
      hasAudio: streams.some(s => s.codec_type === 'audio'),
      hasVideo: streams.some(s => s.codec_type === 'video'),
      duration: Number.isFinite(duration) && duration > 0 ? duration : undefined,
    };
  } catch (e) {
    if ((e as any)?.aborted) throw e;
    return null;
  }
}

/** 文件开头看起来是不是纯文本（UTF-8 / UTF-16 带 BOM），给认不出扩展名又没有音轨的文件兜底 */
export function looksLikeText(path: string): boolean {
  let fd = -1;
  try {
    fd = openSync(path, 'r');
    const buf = Buffer.alloc(4096);
    const n = readSync(fd, buf, 0, buf.length, 0);
    if (n === 0) return false;
    const head = buf.subarray(0, n);
    if (head[0] === 0xff && head[1] === 0xfe) return true;
    if (head[0] === 0xfe && head[1] === 0xff) return true;
    let bad = 0;
    for (const b of head) if (b === 0 || (b < 9) || (b > 13 && b < 32 && b !== 27)) bad++;
    if (bad > n * 0.01) return false;
    const text = head.toString('utf8');
    const replacement = (text.match(/�/g) || []).length;
    return replacement <= 2;
  } catch {
    return false;
  } finally {
    if (fd >= 0) try { closeSync(fd); } catch { /* */ }
  }
}

/**
 * 一个会议文件到底按什么处理：扩展名认得就按扩展名；认不出用 ffprobe 探测有没有音轨；
 * 还不是媒体就看是不是纯文本；都不是返回 null（调用方报「格式不支持」）。
 */
export async function classifyMeetingFile(path: string, name: string, ffprobe: string | null, signal?: AbortSignal): Promise<{ kind: MediaKind; probe?: ProbeResult } | null> {
  const byExt = mediaKindByExt(name || path);
  if (byExt === 'transcript') return { kind: 'transcript' };
  if (byExt) return { kind: byExt };
  if (ffprobe) {
    const p = await probeMedia(ffprobe, path, signal);
    if (p?.hasAudio) return { kind: p.hasVideo ? 'video' : 'audio', probe: p };
  }
  if (looksLikeText(path)) return { kind: 'transcript' };
  return null;
}

/**
 * 解成 16k 单声道 16 位 wav。只取第一条音轨（录屏里常有多条），视频 / 字幕 / 数据流一律丢掉。
 * 失败抛中文错误：没有音轨 / 解码失败。
 */
export async function convertToWav16k(ffmpeg: string, input: string, output: string, displayName: string, signal?: AbortSignal): Promise<void> {
  const r = await runProcess(ffmpeg, [
    '-nostdin', '-hide_banner', '-loglevel', 'error', '-y',
    '-i', input,
    '-map', '0:a:0', '-vn', '-sn', '-dn',
    '-ac', '1', '-ar', String(SAMPLE_RATE), '-c:a', 'pcm_s16le', '-f', 'wav',
    output,
  ], { signal, timeoutMs: 60 * 60_000 });
  if (r.code !== 0 || !existsSync(output)) {
    const err = r.stderr || '';
    if (/matches no streams|does not contain any stream|Output file .*does not contain/i.test(err)) {
      throw new Error(i18nT('文件「{p0}」里没有音轨，无法转写', { p0: displayName }));
    }
    throw new Error(i18nT('文件「{p0}」解码失败（文件可能已损坏或格式特殊）', { p0: displayName }));
  }
}

// ─── wav 读写（只认 RIFF / PCM 16 位单声道）──────────────────────────────────

export interface WavInfo {
  dataOffset: number;
  /** 按文件实际大小校正过的数据字节数（ffmpeg 管道输出时头里的长度可能是 0 / 0xFFFFFFFF） */
  dataBytes: number;
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  /** 秒 */
  duration: number;
}

export function readWavInfo(path: string): WavInfo {
  const fd = openSync(path, 'r');
  try {
    const head = Buffer.alloc(12);
    readSync(fd, head, 0, 12, 0);
    if (head.toString('ascii', 0, 4) !== 'RIFF' || head.toString('ascii', 8, 12) !== 'WAVE') throw new Error(i18nT('音频中间文件格式不对'));
    const fileSize = statSync(path).size;
    let pos = 12;
    let fmt: { channels: number; sampleRate: number; bits: number } | null = null;
    const ch = Buffer.alloc(8);
    while (pos + 8 <= fileSize) {
      readSync(fd, ch, 0, 8, pos);
      const id = ch.toString('ascii', 0, 4);
      const size = ch.readUInt32LE(4);
      if (id === 'fmt ') {
        const f = Buffer.alloc(Math.min(size, 40));
        readSync(fd, f, 0, f.length, pos + 8);
        fmt = { channels: f.readUInt16LE(2), sampleRate: f.readUInt32LE(4), bits: f.readUInt16LE(14) };
      } else if (id === 'data') {
        if (!fmt) break;
        const dataOffset = pos + 8;
        const avail = fileSize - dataOffset;
        const dataBytes = size === 0 || size === 0xffffffff || size > avail ? avail : size;
        const bytesPerSec = fmt.sampleRate * fmt.channels * (fmt.bits / 8);
        return { dataOffset, dataBytes, sampleRate: fmt.sampleRate, channels: fmt.channels, bitsPerSample: fmt.bits, duration: bytesPerSec ? dataBytes / bytesPerSec : 0 };
      }
      pos += 8 + size + (size % 2);
    }
    throw new Error(i18nT('音频中间文件格式不对'));
  } finally {
    closeSync(fd);
  }
}

function assertMono16k(info: WavInfo): void {
  if (info.sampleRate !== SAMPLE_RATE || info.channels !== 1 || info.bitsPerSample !== 16) throw new Error(i18nT('音频中间文件格式不对'));
}

export function wavHeader(dataBytes: number, sampleRate = SAMPLE_RATE): Buffer {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0, 'ascii');
  h.writeUInt32LE(Math.min(0xffffffff, 36 + dataBytes), 4);
  h.write('WAVE', 8, 'ascii');
  h.write('fmt ', 12, 'ascii');
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sampleRate, 24);
  h.writeUInt32LE(sampleRate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36, 'ascii');
  h.writeUInt32LE(Math.min(0xffffffff, dataBytes), 40);
  return h;
}

/** 读一段 PCM（秒）；越界自动裁到文件范围 */
export function readPcmRange(path: string, info: WavInfo, startSec: number, endSec: number): Int16Array {
  assertMono16k(info);
  const total = Math.floor(info.dataBytes / 2);
  const s = Math.max(0, Math.min(total, Math.floor(startSec * SAMPLE_RATE)));
  const e = Math.max(s, Math.min(total, Math.floor(endSec * SAMPLE_RATE)));
  const buf = Buffer.alloc((e - s) * 2);
  const fd = openSync(path, 'r');
  try {
    let off = 0;
    while (off < buf.length) {
      const n = readSync(fd, buf, off, buf.length - off, info.dataOffset + s * 2 + off);
      if (n <= 0) break;
      off += n;
    }
  } finally {
    closeSync(fd);
  }
  return new Int16Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 2));
}

export function writeWav16k(path: string, pcm: Int16Array): void {
  const fd = openSync(path, 'w');
  try {
    const data = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
    writeSync(fd, wavHeader(data.length));
    writeSync(fd, data);
  } finally {
    closeSync(fd);
  }
}

/** 把几份 16k 单声道 wav 首尾相接成一份；返回每份在合并后的起点（秒） */
export async function concatWav16k(inputs: string[], output: string): Promise<number[]> {
  const infos = inputs.map(readWavInfo);
  infos.forEach(assertMono16k);
  const total = infos.reduce((s, i) => s + i.dataBytes - (i.dataBytes % 2), 0);
  const offsets: number[] = [];
  await new Promise<void>((resolve, reject) => {
    const out = createWriteStream(output);
    out.on('error', reject);
    out.write(wavHeader(total));
    let acc = 0;
    const step = 4 * 1024 * 1024;
    for (let k = 0; k < inputs.length; k++) {
      offsets.push(acc / 2 / SAMPLE_RATE);
      const info = infos[k]!;
      const bytes = info.dataBytes - (info.dataBytes % 2);
      const fd = openSync(inputs[k]!, 'r');
      try {
        for (let off = 0; off < bytes; off += step) {
          const len = Math.min(step, bytes - off);
          const buf = Buffer.alloc(len);
          readSync(fd, buf, 0, len, info.dataOffset + off);
          out.write(buf);
        }
      } finally {
        closeSync(fd);
      }
      acc += bytes;
    }
    out.end(() => resolve());
  });
  return offsets;
}

/**
 * 每 10ms 一帧的能量（dB，满幅 = 0dB）。按块读文件，几个小时的录音也不会整段进内存。
 *
 * highPassHz > 0：先过两级一阶高通再算能量（切段用）。空调、风扇、投影仪这类底噪的能量大多在低频，
 * 会把句间停顿「填平」，按能量就找不到空白；人声能量主要在 300Hz 以上，高通后几乎不受影响。
 * 合成 4 人会议加粉红噪声实测：10dB / 5dB 信噪比下换人处没切开的从 3~4 处降到 0。
 */
export function frameEnergiesDb(path: string, info: WavInfo, hopMs = 10, opts: { highPassHz?: number } = {}): Float32Array {
  assertMono16k(info);
  const hpHz = opts.highPassHz && opts.highPassHz > 0 ? opts.highPassHz : 0;
  const rc = hpHz ? 1 / (2 * Math.PI * hpHz) : 0;
  const a = hpHz ? rc / (rc + 1 / SAMPLE_RATE) : 0;
  // 两级一阶高通的状态（跨块保留）
  let y1 = 0, x1p = 0, y2 = 0, y1p = 0;
  const hop = Math.round(SAMPLE_RATE * hopMs / 1000);
  const totalSamples = Math.floor(info.dataBytes / 2);
  const frames = Math.floor(totalSamples / hop);
  const out = new Float32Array(frames);
  const framesPerChunk = 2000;
  const fd = openSync(path, 'r');
  try {
    // Buffer.alloc（非 allocUnsafe）不走内存池，byteOffset 恒为 0，可以直接套 Int16Array（小端机器）
    const buf = Buffer.alloc(framesPerChunk * hop * 2);
    const view = new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2);
    for (let f0 = 0; f0 < frames; f0 += framesPerChunk) {
      const nFrames = Math.min(framesPerChunk, frames - f0);
      const bytes = nFrames * hop * 2;
      readSync(fd, buf, 0, bytes, info.dataOffset + f0 * hop * 2);
      for (let k = 0; k < nFrames; k++) {
        let sum = 0;
        const base = k * hop;
        for (let i = 0; i < hop; i++) {
          let v = view[base + i]! / 32768;
          if (hpHz) {
            y1 = a * (y1 + v - x1p); x1p = v;
            y2 = a * (y2 + y1 - y1p); y1p = y1;
            v = y2;
          }
          sum += v * v;
        }
        out[f0 + k] = 10 * Math.log10(sum / hop + 1e-10);
      }
    }
  } finally {
    closeSync(fd);
  }
  return out;
}

/** 一段 PCM 的能量统计（声纹采集质量校验用） */
export function pcmFrameDb(pcm: Int16Array, hopMs = 10): Float32Array {
  const hop = Math.round(SAMPLE_RATE * hopMs / 1000);
  const frames = Math.floor(pcm.length / hop);
  const out = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    for (let i = 0; i < hop; i++) { const v = pcm[f * hop + i]! / 32768; sum += v * v; }
    out[f] = 10 * Math.log10(sum / hop + 1e-10);
  }
  return out;
}
