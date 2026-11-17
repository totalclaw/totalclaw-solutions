/**
 * 声纹采集（质量校验 + 192 维向量）与给主持人试听的发言片段。
 */
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { t as i18nT } from '@totalclaw/i18n';
import type { MmMeeting } from '../../../../shared/meetingMgmt/types';
import { classifyMeetingFile, concatWav16k, convertToWav16k, pcmFrameDb, readPcmRange, readWavInfo, SAMPLE_RATE, writeWav16k } from './audio';
import { adaptiveThreshold, speechMask } from './slice';
import { autoParallelism, pipelineConfig, resolveMeetingRuntime, type MeetingRuntime } from './runtime';
import { runSlices, type WorkerSpec } from './workerPool';
import { cosineSim } from './diarize';

/** 流水线抽出的整段 16k 音频（workDir 下） */
export const AUDIO_FILE = 'audio16k.wav';
export const CLIP_DIR = 'clips';

export const ENROLL_MIN_SEC = 8;
export const ENROLL_MAX_SEC = 20;
const ENROLL_MIN_SPEECH_SEC = 5;
const ENROLL_MIN_SNR_DB = 12;
const ENROLL_MIN_LEVEL_DB = -45;
/** 前后两半像不像同一个人：低于这个多半混进了别人或很大的噪声 */
const ENROLL_MIN_HALF_SIM = 0.3;

export function workerSpecFor(rt: MeetingRuntime, opts: { asr: boolean; threads?: number; model?: string | null }): WorkerSpec {
  return {
    python: rt.python || '',
    pluginsDir: rt.pluginsDir,
    model: opts.asr ? (opts.model ?? rt.whisperModel ?? '') : '',
    modelsDir: rt.whisperModelsDir,
    campp: rt.campp || '',
    campp2: rt.campp2 || '',
    threads: opts.threads ?? autoParallelism(opts.asr ? rt.whisperModel : null).threads,
    env: rt.env,
  };
}

function percentile(values: ArrayLike<number>, p: number): number {
  const a = Array.from(values).sort((x, y) => x - y);
  if (!a.length) return -100;
  return a[Math.min(a.length - 1, Math.max(0, Math.round((a.length - 1) * p)))]!;
}

/** 声纹采集：任意格式的 10~15 秒录音 → 质量校验 → CAM++ 向量 */
/**
 * 采集声纹：两个声纹模型都装了就两个都算（vector = CAM++，vector2 = ERes2NetV2），以后哪种比对都能用；
 * 只装了一个就只有那一个（没有 CAM++ 时 vector 为空数组）。
 */
export async function enrollVoiceprint(audioPath: string): Promise<{ ok: true; vector: number[]; vector2?: number[]; seconds: number } | { ok: false; reason: string }> {
  if (!audioPath || !existsSync(audioPath)) return { ok: false, reason: i18nT('录音文件不存在，请重新录制') };
  let rt: MeetingRuntime;
  try { rt = await resolveMeetingRuntime(); } catch { return { ok: false, reason: i18nT('本机语音组件不可用') }; }
  if (!rt.campp && !rt.campp2) return { ok: false, reason: i18nT('请先下载声纹识别模型（设置 → 语音），再采集声纹') };
  if (!rt.ffmpeg) return { ok: false, reason: i18nT('找不到 ffmpeg，无法处理录音') };
  if (!rt.python) return { ok: false, reason: i18nT('找不到本地语音识别运行时') };
  const dir = mkdtempSync(join(tmpdir(), 'tc-mm-enroll-'));
  try {
    const wav = join(dir, 'in.wav');
    try {
      await convertToWav16k(rt.ffmpeg, audioPath, wav, i18nT('录音'));
    } catch (e: any) {
      return { ok: false, reason: String(e?.message || i18nT('录音解码失败，请重新录制')) };
    }
    const info = readWavInfo(wav);
    const seconds = Math.round(info.duration * 10) / 10;
    if (seconds < ENROLL_MIN_SEC) return { ok: false, reason: i18nT('录音太短（{p0} 秒），请连续说 10~15 秒', { p0: seconds }) };
    if (seconds > ENROLL_MAX_SEC) return { ok: false, reason: i18nT('录音太长（{p0} 秒），请录 10~15 秒', { p0: seconds }) };
    const pcm = readPcmRange(wav, info, 0, info.duration);
    let clipped = 0;
    for (let i = 0; i < pcm.length; i++) if (Math.abs(pcm[i]!) >= 32700) clipped++;
    const db = pcmFrameDb(pcm);
    const thr = adaptiveThreshold(db);
    const mask = speechMask(db, thr);
    const speechDb: number[] = [];
    for (let i = 0; i < db.length; i++) if (mask[i]) speechDb.push(db[i]!);
    const speechSec = speechDb.length * 0.01;
    const floor = percentile(db, 0.1);
    const level = speechDb.length ? percentile(speechDb, 0.9) : -100;
    if (level < ENROLL_MIN_LEVEL_DB) return { ok: false, reason: i18nT('声音太小，没有检测到人声，请靠近麦克风重录') };
    if (speechSec < ENROLL_MIN_SPEECH_SEC) return { ok: false, reason: i18nT('没有检测到足够的人声（只有 {p0} 秒），请连续说 10~15 秒', { p0: Math.round(speechSec * 10) / 10 }) };
    if (level - floor < ENROLL_MIN_SNR_DB) return { ok: false, reason: i18nT('背景噪音太大，请换个安静的地方重录') };
    if (clipped > pcm.length * 0.005) return { ok: false, reason: i18nT('声音过大失真，请离麦克风稍远一点重录') };

    // 只拿有声的部分提声纹（停顿、呼吸不进向量）
    const hop = SAMPLE_RATE / 100;
    const parts: number[] = [];
    for (let i = 0; i < mask.length; i++) if (mask[i]) for (let k = 0; k < hop; k++) parts.push(pcm[i * hop + k] ?? 0);
    const speechPcm = Int16Array.from(parts);
    const speechWav = join(dir, 'speech.wav');
    writeWav16k(speechWav, speechPcm);
    const dur = speechPcm.length / SAMPLE_RATE;
    const half = dur / 2;
    const ranges = [{ start: 0, end: dur }, ...(dur >= 6 ? [{ start: 0, end: half }, { start: half, end: dur }] : [])];
    let outs;
    try {
      outs = await runSlices(workerSpecFor(rt, { asr: false, threads: 2 }), speechWav, ranges, { workers: 1, asr: false, emb: true, createWorker: pipelineConfig().createWorker });
    } catch {
      return { ok: false, reason: i18nT('声纹提取失败，请重试') };
    }
    const vec = outs[0]?.emb;
    const vec2 = outs[0]?.emb2;
    const okLen = (v: number[] | null | undefined): v is number[] => !!v && v.length === 192;
    if (!okLen(vec) && !okLen(vec2)) return { ok: false, reason: i18nT('声纹提取失败，请重试') };
    // 前后两半像不像同一个人：有 CAM++ 用 CAM++（门槛按它定的），只有 ERes2NetV2 时用它（两个模型余弦尺度相近）
    const halfA = okLen(vec) ? outs[1]?.emb : outs[1]?.emb2;
    const halfB = okLen(vec) ? outs[2]?.emb : outs[2]?.emb2;
    if (outs.length === 3 && halfA && halfB && cosineSim(halfA, halfB) < ENROLL_MIN_HALF_SIM) {
      return { ok: false, reason: i18nT('录音里像是有不止一个人在说话或噪声很大，请单独录本人的声音') };
    }
    const unitOf = (v: number[]) => { const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)); return v.map(x => x / (n || 1)); };
    return { ok: true, vector: okLen(vec) ? unitOf(vec) : [], ...(okLen(vec2) ? { vector2: unitOf(vec2) } : {}), seconds };
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* */ }
  }
}

// ─── 试听片段 ─────────────────────────────────────────────────────────────

export interface ClipRange { start: number; end: number }

/**
 * 从几段候选里截 5~8 秒：最长的一段够 8 秒就在里面挑有声最多的 8 秒窗口；5~8 秒直接用；
 * 都不够 5 秒就把几段接起来（中间垫 0.3 秒静音）凑到 8 秒以内。总共不到 1 秒返回 false。
 */
export function cutClip(wavPath: string, ranges: ClipRange[], outPath: string, minSec = 5, maxSec = 8): boolean {
  const info = readWavInfo(wavPath);
  const valid = ranges.map(r => ({ start: Math.max(0, r.start), end: Math.min(info.duration, r.end) })).filter(r => r.end - r.start > 0.2);
  if (!valid.length) return false;
  const byLen = valid.slice().sort((a, b) => (b.end - b.start) - (a.end - a.start));
  const longest = byLen[0]!;
  const len = longest.end - longest.start;
  let pcm: Int16Array;
  if (len >= maxSec) {
    const seg = readPcmRange(wavPath, info, longest.start, longest.end);
    const db = pcmFrameDb(seg);
    const mask = speechMask(db, adaptiveThreshold(db));
    const win = Math.round(maxSec * 100);
    let best = 0;
    let bestScore = -1;
    let acc = 0;
    for (let i = 0; i < mask.length; i++) {
      acc += mask[i]!;
      if (i >= win) acc -= mask[i - win]!;
      if (i >= win - 1 && i % 25 === 0 && acc > bestScore) { bestScore = acc; best = i - win + 1; }
    }
    pcm = seg.subarray(best * (SAMPLE_RATE / 100), (best + win) * (SAMPLE_RATE / 100));
  } else if (len >= minSec) {
    pcm = readPcmRange(wavPath, info, longest.start, longest.end);
  } else {
    const gap = new Int16Array(Math.round(0.3 * SAMPLE_RATE));
    const chunks: Int16Array[] = [];
    let total = 0;
    for (const r of byLen.slice().sort((a, b) => a.start - b.start)) {
      const d = r.end - r.start;
      if (total + d > maxSec) continue;
      if (chunks.length) chunks.push(gap);
      chunks.push(readPcmRange(wavPath, info, r.start, r.end));
      total += d;
      if (total >= minSec) break;
    }
    const n = chunks.reduce((s, c) => s + c.length, 0);
    pcm = new Int16Array(n);
    let off = 0;
    for (const c of chunks) { pcm.set(c, off); off += c.length; }
  }
  if (pcm.length < SAMPLE_RATE) return false;
  writeWav16k(outPath, pcm);
  return true;
}

function safeLabel(label: string): string {
  return label.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 40) || 'speaker';
}

export function clipPathFor(workDir: string, label: string): string {
  return join(workDir, CLIP_DIR, `${safeLabel(label)}.wav`);
}

/** 会议文件里的音视频重新抽成整段 16k 音频（流水线的中间文件被清掉时用） */
async function rebuildAudio(meeting: MmMeeting, workDir: string): Promise<string | null> {
  const rt = await resolveMeetingRuntime();
  if (!rt.ffmpeg) return null;
  const media: Array<{ path: string; name: string }> = [];
  for (const f of meeting.files || []) {
    if (!existsSync(f.path)) continue;
    const c = f.kind === 'transcript' ? null : await classifyMeetingFile(f.path, f.name, rt.ffprobe);
    if (c && c.kind !== 'transcript') media.push({ path: f.path, name: f.name });
  }
  if (!media.length) return null;
  const tmp = join(workDir, '_audio');
  mkdirSync(tmp, { recursive: true });
  const parts: string[] = [];
  for (let k = 0; k < media.length; k++) {
    const p = join(tmp, `part-${k}.wav`);
    await convertToWav16k(rt.ffmpeg, media[k]!.path, p, media[k]!.name);
    parts.push(p);
  }
  const out = join(workDir, AUDIO_FILE);
  await concatWav16k(parts, out);
  rmSync(tmp, { recursive: true, force: true });
  return out;
}

/** 某个发言人的试听片段（5~8 秒 wav）；没有音频（文字记录会议）返回 null */
export async function exportSpeakerClip(i: { meeting: MmMeeting; label: string; workDir: string }): Promise<string | null> {
  const { meeting, label, workDir } = i;
  const slot = (meeting.speakers || []).find(s => s.label === label);
  if (slot?.clipPath && existsSync(slot.clipPath)) return slot.clipPath;
  const ranges = (meeting.segments || []).filter(s => s.speakerLabel === label).map(s => ({ start: s.start, end: s.end }));
  if (!ranges.length) return null;
  let wav = join(workDir, AUDIO_FILE);
  try {
    if (!existsSync(wav)) {
      const rebuilt = await rebuildAudio(meeting, workDir);
      if (!rebuilt) return null;
      wav = rebuilt;
    }
    mkdirSync(join(workDir, CLIP_DIR), { recursive: true });
    const out = clipPathFor(workDir, label);
    return cutClip(wav, ranges, out) ? out : null;
  } catch {
    return null;
  }
}

/**
 * 从一场会议的录音里给某个人算一份声纹样本（本人同意「用确认过的会议补充声纹」后，确认发言时调用）。
 * ranges = 这个人在本场的发言（秒）；只用有效发声够长（≥ 1.5 秒）的段，最多取 120 秒，两个模型各出一个按时长加权的平均声纹。
 * 不够 10 秒 / 没有录音 / 没装声纹模型时返回 null（不补）。
 */
export async function meetingVoiceSample(workDir: string, ranges: Array<{ start: number; end: number }>): Promise<{ vector?: number[]; vector2?: number[]; seconds: number } | null> {
  const wav = join(workDir, AUDIO_FILE);
  if (!existsSync(wav)) return null;
  let rt: MeetingRuntime;
  try { rt = await resolveMeetingRuntime(); } catch { return null; }
  if ((!rt.campp && !rt.campp2) || !rt.python) return null;
  const picked: Array<{ start: number; end: number }> = [];
  let total = 0;
  for (const r of ranges.filter(r => r.end - r.start >= 1.5).sort((a, b) => (b.end - b.start) - (a.end - a.start))) {
    if (total >= 120) break;
    const end = Math.min(r.end, r.start + 20);
    picked.push({ start: r.start, end });
    total += end - r.start;
  }
  if (total < 10) return null;
  const outs = await runSlices(workerSpecFor(rt, { asr: false, threads: 2 }), wav, picked.sort((a, b) => a.start - b.start), { workers: 1, asr: false, emb: true, createWorker: pipelineConfig().createWorker });
  const avg = (key: 'emb' | 'emb2'): number[] | undefined => {
    const acc = new Array(192).fill(0);
    let w = 0;
    outs.forEach((o, i) => { const e = o[key]; if (!e || e.length !== 192) return; const d = picked[i]!.end - picked[i]!.start; for (let k = 0; k < 192; k++) acc[k] += e[k]! * d; w += d; });
    if (!w) return undefined;
    const n = Math.sqrt(acc.reduce((s, x) => s + x * x, 0));
    return n > 0 ? acc.map(x => x / n) : undefined;
  };
  const vector = avg('emb');
  const vector2 = avg('emb2');
  if (!vector && !vector2) return null;
  return { ...(vector ? { vector } : {}), ...(vector2 ? { vector2 } : {}), seconds: Math.round(total * 10) / 10 };
}

