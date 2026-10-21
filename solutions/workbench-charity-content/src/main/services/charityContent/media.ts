/**
 * 慈善活动内容工场 · 媒体 IO（ffmpeg / ffprobe / bundled python 脚本 / 字体）。
 *
 * 所有子进程都挂到 runId 的取消句柄上：SIGTERM 3s 后 SIGKILL，不留孤儿 ffmpeg。
 * 每个 ffmpeg 调用单独设时限（默认 10 分钟），超时按失败处理并把 stderr 尾巴带回。
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import type { CharityLang } from '@totalclaw/ipc-contracts';
import { createChunkDecoder } from '../../utils/winSpawnCompat';
import { t as i18nT } from '@totalclaw/i18n';
import type { ClipStyle } from '../../../shared/charityPrompts';

export const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'bmp', 'tif', 'tiff']);
export const VIDEO_EXT = new Set(['mp4', 'mov', 'm4v', 'webm', 'mkv', 'avi']);

export function kindOf(path: string): 'image' | 'video' | 'pdf' | 'other' {
  const ext = extname(path).slice(1).toLowerCase();
  if (IMAGE_EXT.has(ext)) return 'image';
  if (VIDEO_EXT.has(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  return 'other';
}

export interface ProcRegistry {
  add(child: ChildProcess): void;
  remove(child: ChildProcess): void;
  signal: AbortSignal;
}

export interface RunResult { code: number | null; stdout: string; stderr: string; timedOut: boolean; aborted: boolean }

export function killTree(child: ChildProcess): void {
  const pid = child.pid;
  if (pid == null) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    } else {
      try { process.kill(-pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch { /* 已退 */ } }
      setTimeout(() => { try { process.kill(-pid, 'SIGKILL'); } catch { /* 已退 */ } }, 3000).unref?.();
    }
  } catch { /* 已退出 */ }
}

export function runProc(
  bin: string,
  args: string[],
  opts: { env?: NodeJS.ProcessEnv; timeoutMs?: number; registry?: ProcRegistry; cwd?: string; onStdoutLine?: (line: string) => void } = {},
): Promise<RunResult> {
  return new Promise((resolve) => {
    let child: ChildProcess;
    try {
      child = spawn(bin, args, { env: opts.env || process.env, cwd: opts.cwd, detached: process.platform !== 'win32', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e: any) {
      resolve({ code: null, stdout: '', stderr: String(e?.message || e), timedOut: false, aborted: false });
      return;
    }
    opts.registry?.add(child);
    let stdout = '';
    let stderr = '';
    let lineBuf = '';
    let timedOut = false;
    let aborted = false;
    const decOut = createChunkDecoder();
    const decErr = createChunkDecoder(true);
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, opts.timeoutMs ?? 600_000);
    timer.unref?.();
    const onAbort = (): void => { aborted = true; killTree(child); };
    if (opts.registry?.signal.aborted) onAbort();
    opts.registry?.signal.addEventListener('abort', onAbort, { once: true });
    child.stdout?.on('data', (d: Buffer) => {
      const s = decOut(d);
      stdout = (stdout + s).slice(-200_000);
      if (opts.onStdoutLine) {
        lineBuf += s;
        let nl: number;
        while ((nl = lineBuf.indexOf('\n')) >= 0) { const line = lineBuf.slice(0, nl).trim(); lineBuf = lineBuf.slice(nl + 1); if (line) opts.onStdoutLine(line); }
      }
    });
    child.stderr?.on('data', (d: Buffer) => { stderr = (stderr + decErr(d)).slice(-4000); });
    const finish = (code: number | null): void => {
      clearTimeout(timer);
      opts.registry?.signal.removeEventListener('abort', onAbort);
      opts.registry?.remove(child);
      resolve({ code, stdout, stderr, timedOut, aborted });
    };
    child.on('error', (e: any) => { stderr += String(e?.message || e); finish(null); });
    child.on('close', (code) => finish(code));
  });
}

export function describeFailure(label: string, r: RunResult): string {
  if (r.aborted) return i18nT('已取消');
  if (r.timedOut) return i18nT('{label} 超时未完成', { label });
  const tail = r.stderr.trim().split('\n').filter(Boolean).slice(-3).join(' | ');
  return tail
    ? i18nT('{label} 失败（退出码 {code}）：{tail}', { label, code: String(r.code), tail: tail.slice(0, 300) })
    : i18nT('{label} 失败（退出码 {code}）', { label, code: String(r.code) });
}

export interface MediaTools {
  ffmpeg: string;
  ffprobe: string;
  python: string | null;
  /** bundled-skills/marketing-sales/totalclaw-video-studio/scripts */
  scriptsDir: string;
  env: NodeJS.ProcessEnv;
}

export interface ProbeInfo { durationSec: number; width: number; height: number; hasAudio: boolean }

export async function probeMedia(tools: MediaTools, path: string, registry?: ProcRegistry): Promise<ProbeInfo | null> {
  const r = await runProc(tools.ffprobe, ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', path], { env: tools.env, timeoutMs: 30_000, registry });
  if (r.code !== 0) return null;
  try {
    const j = JSON.parse(r.stdout);
    const streams: any[] = j.streams || [];
    const v = streams.find((s) => s.codec_type === 'video');
    return {
      durationSec: Number(j.format?.duration) || 0,
      width: Number(v?.width) || 0,
      height: Number(v?.height) || 0,
      hasAudio: streams.some((s) => s.codec_type === 'audio'),
    };
  } catch { return null; }
}

export async function audioDuration(tools: MediaTools, path: string, registry?: ProcRegistry): Promise<number> {
  const r = await runProc(tools.ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], { env: tools.env, timeoutMs: 30_000, registry });
  const n = Number(r.stdout.trim());
  return Number.isFinite(n) ? n : 0;
}

/** 视频每 intervalSec 抽一帧（最多 maxFrames 张，缩到 720 宽），给视觉模型看 */
export async function extractFrames(tools: MediaTools, video: string, outDir: string, opts: { intervalSec?: number; maxFrames?: number; registry?: ProcRegistry } = {}): Promise<string[]> {
  mkdirSync(outDir, { recursive: true });
  const interval = opts.intervalSec ?? 10;
  const max = opts.maxFrames ?? 6;
  const stem = basename(video, extname(video)).slice(0, 12);
  const pattern = join(outDir, `${stem}-%02d.jpg`);
  const r = await runProc(tools.ffmpeg, ['-v', 'error', '-y', '-i', video, '-vf', `fps=1/${interval},scale=720:-2`, '-frames:v', String(max), '-q:v', '4', pattern], { env: tools.env, timeoutMs: 180_000, registry: opts.registry });
  if (r.code !== 0) throw new Error(describeFailure(i18nT('视频抽帧'), r));
  return readdirSync(outDir).filter((f) => f.startsWith(`${stem}-`) && f.endsWith('.jpg')).sort().map((f) => join(outDir, f));
}

/** 视频首帧缩略图（jpg，宽 320） */
export async function videoThumb(tools: MediaTools, video: string, out: string, registry?: ProcRegistry): Promise<boolean> {
  const r = await runProc(tools.ffmpeg, ['-v', 'error', '-y', '-ss', '1', '-i', video, '-frames:v', '1', '-vf', 'scale=320:-2', '-q:v', '5', out], { env: tools.env, timeoutMs: 60_000, registry });
  return r.code === 0 && existsSync(out);
}

export const OUT_W = 1080;
export const OUT_H = 1920;
const FPS = 30;
const ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart'];

/**
 * 视频素材 → 竖版 9:16 统一规格片段（去音轨；短视频配音/配乐后面统一混）。
 * 输出恰好 durationSec 秒：素材不够长时定格最后一帧补齐（成片长度跟旁白走，不能因为素材短一截就塌）。
 */
export async function normalizeClip(tools: MediaTools, src: string, out: string, durationSec: number, offsetSec = 0, registry?: ProcRegistry, style?: ClipStyle): Promise<void> {
  const vf = `scale=${OUT_W}:${OUT_H}:force_original_aspect_ratio=increase,crop=${OUT_W}:${OUT_H},setsar=1,fps=${FPS},tpad=stop_mode=clone:stop_duration=${durationSec.toFixed(2)}${transitionFilter(durationSec, style)}`;
  const r = await runProc(tools.ffmpeg, ['-v', 'error', '-y', '-ss', String(offsetSec), '-t', String(durationSec), '-i', src, '-vf', vf, '-an', ...ENC, '-t', durationSec.toFixed(3), out], { env: tools.env, timeoutMs: 600_000, registry });
  if (r.code !== 0) throw new Error(describeFailure(i18nT('视频片段转码'), r));
}

/** 剪辑版节奏：推拉每帧的缩放步长（舒缓 / 正常 / 明快）；正常 = 此前的固定值 */
const ZOOM_STEP: Record<ClipStyle['pace'], number> = { slow: 0.0006, normal: 0.0009, fast: 0.0015 };
/** 剪辑版转场：fade = 每段首尾 0.35s 淡入淡出（段间过黑），cut = 直切（此前的做法） */
function transitionFilter(durationSec: number, style?: ClipStyle): string {
  if (style?.transition !== 'fade' || durationSec < 1.2) return '';
  const d = 0.35;
  return `,fade=t=in:st=0:d=${d},fade=t=out:st=${(durationSec - d).toFixed(2)}:d=${d}`;
}

/** 图片 → Ken Burns 缓推片段（zoompan），同规格；style 来自视频提示词（节奏 / 转场），缺省与此前一致 */
export async function imageClip(tools: MediaTools, src: string, out: string, durationSec: number, index: number, registry?: ProcRegistry, style?: ClipStyle): Promise<void> {
  const frames = Math.max(1, Math.round(durationSec * FPS));
  const step = ZOOM_STEP[style?.pace || 'normal'];
  // 奇偶交替：推近 / 拉远，视觉上有节奏；zoompan 在放大 2 倍画布上做避免抖动
  const zoomExpr = index % 2 === 0 ? `min(zoom+${step},1.14)` : `if(eq(on,1),1.14,max(zoom-${step},1.0))`;
  const vf = [
    `scale=${Math.round(OUT_W * 1.25)}:${Math.round(OUT_H * 1.25)}:force_original_aspect_ratio=increase`,
    `crop=${Math.round(OUT_W * 1.25)}:${Math.round(OUT_H * 1.25)}`,
    `zoompan=z='${zoomExpr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${OUT_W}x${OUT_H}:fps=${FPS}`,
    'setsar=1',
  ].join(',') + transitionFilter(durationSec, style);
  const r = await runProc(tools.ffmpeg, ['-v', 'error', '-y', '-loop', '1', '-i', src, '-vf', vf, '-t', String(durationSec), '-an', ...ENC, out], { env: tools.env, timeoutMs: 600_000, registry });
  if (r.code !== 0) throw new Error(describeFailure(i18nT('图片动态化'), r));
}

/** 同规格片段串联（concat demuxer + 流拷贝） */
export async function concatClips(tools: MediaTools, clips: string[], listFile: string, out: string, registry?: ProcRegistry): Promise<void> {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(listFile, clips.map((c) => `file '${c.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
  const r = await runProc(tools.ffmpeg, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', '-movflags', '+faststart', out], { env: tools.env, timeoutMs: 300_000, registry });
  if (r.code !== 0) throw new Error(describeFailure(i18nT('片段串联'), r));
}

/** 烧字幕（libass，指定 fontsdir） */
export async function burnAss(tools: MediaTools, video: string, ass: string, fontsDir: string, out: string, registry?: ProcRegistry): Promise<void> {
  const escPath = (p: string): string => p.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/\[/g, '\\[').replace(/\]/g, '\\]');
  const vf = `ass=filename='${escPath(ass)}':fontsdir='${escPath(fontsDir)}'`;
  const r = await runProc(tools.ffmpeg, ['-v', 'error', '-y', '-i', video, '-vf', vf, '-c:a', 'copy', ...ENC, out], { env: tools.env, timeoutMs: 600_000, registry });
  if (r.code !== 0) throw new Error(describeFailure(i18nT('字幕烧录'), r));
}

/**
 * 旁白 + 配乐混入（ducking：有旁白时配乐压低）。输出长度 = 画面长度：
 * 旁白比画面短就 apad 补静音，配乐循环；绝不用 -shortest（那会把成片截到旁白长度，实测 30s 的片被截成 28s）。
 */
export async function mixAudio(tools: MediaTools, video: string, out: string, narration: string | null, bgm: string | null, durationSec: number, registry?: ProcRegistry): Promise<void> {
  const inputs = ['-i', video];
  const filters: string[] = [];
  let idx = 1;
  let narrLabel = '';
  let bgmLabel = '';
  if (narration) { inputs.push('-i', narration); filters.push(`[${idx}:a]aresample=48000,volume=1.0,apad[n]`); narrLabel = '[n]'; idx += 1; }
  if (bgm) {
    inputs.push('-stream_loop', '-1', '-i', bgm);
    filters.push(`[${idx}:a]aresample=48000,volume=${narration ? 0.18 : 0.55},afade=t=in:st=0:d=1.5[b0]`);
    bgmLabel = '[b0]';
    idx += 1;
  }
  let mixOut = '';
  if (narrLabel && bgmLabel) { filters.push(`${narrLabel}${bgmLabel}amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I=-15:TP=-1.5:LRA=11[a]`); mixOut = '[a]'; }
  else if (narrLabel) { filters.push(`${narrLabel}loudnorm=I=-15:TP=-1.5:LRA=11[a]`); mixOut = '[a]'; }
  else if (bgmLabel) { filters.push(`${bgmLabel}loudnorm=I=-18:TP=-1.5:LRA=11[a]`); mixOut = '[a]'; }
  else { copyFileSync(video, out); return; }
  const args = ['-v', 'error', '-y', ...inputs, '-filter_complex', filters.join(';'), '-map', '0:v', '-map', mixOut, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-t', durationSec.toFixed(2), '-movflags', '+faststart', out];
  const r = await runProc(tools.ffmpeg, args, { env: tools.env, timeoutMs: 600_000, registry });
  if (r.code !== 0) throw new Error(describeFailure(i18nT('音频混合'), r));
}

/** 语音片段 → 单声道 44.1k PCM WAV（逐句时长用它量：WAV 时长按采样数精确，mp3 的 ffprobe 时长可能是按码率估的） */
export async function decodeToWav(tools: MediaTools, src: string, out: string, registry?: ProcRegistry): Promise<void> {
  const r = await runProc(tools.ffmpeg, ['-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '44100', '-c:a', 'pcm_s16le', out], { env: tools.env, timeoutMs: 120_000, registry });
  if (r.code !== 0 || !existsSync(out)) throw new Error(describeFailure(i18nT('语音解码'), r));
}

/** 逐句 WAV 按顺序拼成整段旁白 mp3，句间插 pauseSec 秒静音（与字幕时间轴用的是同一个停顿） */
export async function concatNarration(tools: MediaTools, wavs: string[], pauseSec: number, out: string, registry?: ProcRegistry): Promise<void> {
  if (!wavs.length) throw new Error(i18nT('没有可朗读的文本'));
  const inputs = wavs.flatMap((w) => ['-i', w]);
  const pads = wavs.map((_, i) => `[${i}:a]${i < wavs.length - 1 && pauseSec > 0 ? `apad=pad_dur=${pauseSec.toFixed(3)}` : 'anull'}[s${i}]`);
  const filter = `${pads.join(';')};${wavs.map((_, i) => `[s${i}]`).join('')}concat=n=${wavs.length}:v=0:a=1[a]`;
  const r = await runProc(tools.ffmpeg, ['-v', 'error', '-y', ...inputs, '-filter_complex', filter, '-map', '[a]', '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', out], { env: tools.env, timeoutMs: 300_000, registry });
  if (r.code !== 0 || !existsSync(out)) throw new Error(describeFailure(i18nT('旁白拼接'), r));
}

/** 视频尾部淡出 + 音频淡出（揭幕感收尾） */
export async function fadeOut(tools: MediaTools, video: string, out: string, durationSec: number, registry?: ProcRegistry): Promise<void> {
  const st = Math.max(0, durationSec - 1.2);
  const r = await runProc(tools.ffmpeg, ['-v', 'error', '-y', '-i', video, '-vf', `fade=t=in:st=0:d=0.8,fade=t=out:st=${st.toFixed(2)}:d=1.2`, '-af', `afade=t=out:st=${st.toFixed(2)}:d=1.2`, ...ENC, '-c:a', 'aac', '-b:a', '160k', out], { env: tools.env, timeoutMs: 600_000, registry });
  if (r.code !== 0) throw new Error(describeFailure(i18nT('收尾淡出'), r));
}

// ── 字幕字体：按平台挑一份同时覆盖 中文 + 阿拉伯语 + 拉丁 的字体文件，拷进 fontsdir ──

const FONT_CANDIDATES: Record<string, Array<{ file: string; name: string; langs: CharityLang[] }>> = {
  darwin: [
    { file: '/System/Library/Fonts/Supplemental/Arial Unicode.ttf', name: 'Arial Unicode MS', langs: ['zh', 'en', 'ar'] },
    { file: '/Library/Fonts/Arial Unicode.ttf', name: 'Arial Unicode MS', langs: ['zh', 'en', 'ar'] },
    { file: '/System/Library/Fonts/PingFang.ttc', name: 'PingFang SC', langs: ['zh', 'en'] },
    { file: '/System/Library/Fonts/Supplemental/Tahoma Bold.ttf', name: 'Tahoma', langs: ['en', 'ar'] },
    { file: '/System/Library/Fonts/Supplemental/Tahoma.ttf', name: 'Tahoma', langs: ['en', 'ar'] },
  ],
  win32: [
    { file: 'C:\\Windows\\Fonts\\msyhbd.ttc', name: 'Microsoft YaHei', langs: ['zh', 'en'] },
    { file: 'C:\\Windows\\Fonts\\msyh.ttc', name: 'Microsoft YaHei', langs: ['zh', 'en'] },
    { file: 'C:\\Windows\\Fonts\\segoeuib.ttf', name: 'Segoe UI', langs: ['en', 'ar'] },
    { file: 'C:\\Windows\\Fonts\\tahomabd.ttf', name: 'Tahoma', langs: ['en', 'ar'] },
    { file: 'C:\\Windows\\Fonts\\arial.ttf', name: 'Arial', langs: ['en', 'ar'] },
  ],
  linux: [
    { file: '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', name: 'Noto Sans CJK SC', langs: ['zh', 'en'] },
    { file: '/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf', name: 'Noto Sans Arabic', langs: ['ar'] },
    { file: '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf', name: 'Noto Sans', langs: ['en'] },
    { file: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', name: 'DejaVu Sans', langs: ['en', 'ar'] },
  ],
};

export interface SubtitleFonts { dir: string; nameFor: Record<CharityLang, string> }

/** 准备 fontsdir：每种语言挑第一份存在的候选；一份都没有时仍返回目录（libass 会回落默认字体，阿语可能豆腐块） */
export function prepareSubtitleFonts(workDir: string, platform: NodeJS.Platform = process.platform, exists: (p: string) => boolean = existsSync): SubtitleFonts {
  const dir = join(workDir, 'fonts');
  mkdirSync(dir, { recursive: true });
  const nameFor: Record<CharityLang, string> = { zh: 'sans-serif', en: 'sans-serif', ar: 'sans-serif' };
  const candidates = FONT_CANDIDATES[platform] || FONT_CANDIDATES.linux;
  const copied = new Set<string>();
  for (const lang of ['zh', 'en', 'ar'] as CharityLang[]) {
    const hit = candidates.find((c) => c.langs.includes(lang) && exists(c.file));
    if (!hit) continue;
    nameFor[lang] = hit.name;
    if (!copied.has(hit.file)) {
      try { copyFileSync(hit.file, join(dir, basename(hit.file))); copied.add(hit.file); } catch { /* 拷不了就让 libass 自己找 */ }
    }
  }
  return { dir, nameFor };
}

export function fileSize(p: string): number {
  try { return statSync(p).size; } catch { return 0; }
}
