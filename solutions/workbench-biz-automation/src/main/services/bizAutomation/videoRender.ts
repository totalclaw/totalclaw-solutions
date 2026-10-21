/**
 * 经营自动化智能体 · 短视频成片（9:16，复用慈善内容工场的 ffmpeg 积木与语音合成）。
 *
 * 每个镜头一句口播：逐句合成配音（fal 高保真优先，不可用时整段用 edge-tts 备用音色）→ 以真实配音时长定镜头长度
 * → 图片推拉镜头 → 串联 → 烧字幕（顶部品牌名）→ 旁白 + 本地配乐混音。关掉口播时每镜 3 秒、只有字幕和配乐。
 */
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import type { BaScene } from '@totalclaw/ipc-contracts';
import {
  OUT_H, OUT_W, audioDuration, burnAss, concatClips, concatNarration, decodeToWav, imageClip, mixAudio, prepareSubtitleFonts, runProc,
  type MediaTools, type ProcRegistry,
} from '../charityContent/media';
import { buildAss, wrapCaption, type CaptionCue } from '../charityContent/subtitles';
import { synthesizeSpeech, type PipelineDeps } from '../charityContent/pipeline';

const PAUSE_SEC = 0.25;
const SILENT_SCENE_SEC = 3;

export interface RenderInput {
  scenes: BaScene[];
  narration: boolean;
  voiceGender: 'female' | 'male';
  title: string;
  workDir: string;
  outFile: string;
}

export interface RenderResult { file: string; durationSec: number; voiceQuality: 'hd' | 'standard' | null }

export async function renderShortVideo(pd: PipelineDeps, input: RenderInput, registry: ProcRegistry, onStep: (msg: string) => void): Promise<RenderResult> {
  const tools = pd.tools;
  if (!tools) throw new Error(i18nT('找不到 ffmpeg，无法成片（开发先跑 pnpm setup:totalclaw-agent）'));
  const scenes = input.scenes.filter((s) => s.image && existsSync(s.image));
  if (!scenes.length) throw new Error(i18nT('没有可用的镜头图片'));
  rmSync(input.workDir, { recursive: true, force: true });
  mkdirSync(input.workDir, { recursive: true });

  // ① 逐镜头配音，量真实时长
  const durations: number[] = [];
  const wavs: string[] = [];
  let quality: 'hd' | 'standard' | null = null;
  if (input.narration) {
    for (const [i, s] of scenes.entries()) {
      if (registry.signal.aborted) throw new Error(i18nT('已取消'));
      onStep(i18nT('合成配音 {a}/{b}', { a: i + 1, b: scenes.length }));
      const dir = join(input.workDir, `tts-${i}`);
      const items = await synthesizeSpeech(pd, { zh: s.line || ' ' }, dir, { quality: 'hd', gender: input.voiceGender, registry });
      const item = items.zh;
      if (!item) throw new Error(i18nT('配音合成失败'));
      quality = quality === 'standard' ? 'standard' : item.quality === 'hd' ? 'hd' : 'standard';
      const wav = join(input.workDir, `line-${i}.wav`);
      await decodeToWav(tools, item.path, wav, registry);
      const d = await audioDuration(tools, wav, registry);
      wavs.push(wav);
      durations.push(Math.max(2.2, d + PAUSE_SEC));
    }
  } else {
    scenes.forEach(() => durations.push(SILENT_SCENE_SEC));
  }
  const total = durations.reduce((a, b) => a + b, 0) + 0.8;

  // ② 镜头（最后一镜多留 0.8 秒收尾）
  const clips: string[] = [];
  for (const [i, s] of scenes.entries()) {
    onStep(i18nT('生成镜头 {a}/{b}', { a: i + 1, b: scenes.length }));
    const clip = join(input.workDir, `clip-${String(i).padStart(2, '0')}.mp4`);
    await imageClip(tools, s.image, clip, durations[i] + (i === scenes.length - 1 ? 0.8 : 0), i, registry, { pace: 'normal', transition: 'fade' });
    clips.push(clip);
  }
  onStep(i18nT('串联镜头'));
  const joined = join(input.workDir, 'joined.mp4');
  await concatClips(tools, clips, join(input.workDir, 'clips.txt'), joined, registry);

  // ③ 字幕：镜头口播就是字幕原文，时间轴与镜头对齐
  const cues: CaptionCue[] = [];
  let t = 0;
  scenes.forEach((s, i) => {
    if (s.line?.trim()) cues.push({ start: t + 0.05, end: t + durations[i] - 0.1, text: wrapCaption(s.line.trim(), 'zh') });
    t += durations[i];
  });
  let video = joined;
  if (cues.length || input.title) {
    onStep(i18nT('烧录字幕'));
    const fonts = prepareSubtitleFonts(input.workDir);
    const assFile = join(input.workDir, 'sub.ass');
    const { writeFileSync } = await import('node:fs');
    writeFileSync(assFile, buildAss(cues, 'zh', { width: OUT_W, height: OUT_H, fontName: fonts.nameFor.zh, title: input.title || undefined, durationSec: total }));
    const subbed = join(input.workDir, 'subbed.mp4');
    await burnAss(tools, joined, assFile, fonts.dir, subbed, registry);
    video = subbed;
  }

  // ④ 旁白 + 配乐
  onStep(i18nT('混音'));
  let narration: string | null = null;
  if (wavs.length) {
    narration = join(input.workDir, 'narration.mp3');
    await concatNarration(tools, wavs, PAUSE_SEC, narration, registry);
  }
  const bgm = await localBgm(tools, total, input.workDir, registry);
  await mixAudio(tools, video, input.outFile, narration, bgm, total, registry);
  return { file: input.outFile, durationSec: Math.round(total * 10) / 10, voiceQuality: quality };
}

/** 本地配乐库（fetch_bgm.py）→ 程序合成 → 无配乐 */
async function localBgm(tools: MediaTools, durationSec: number, workDir: string, registry: ProcRegistry): Promise<string | null> {
  if (!tools.python) return null;
  const fetched = join(workDir, 'bgm.mp3');
  const f = await runProc(tools.python, [join(tools.scriptsDir, 'fetch_bgm.py'), '--mood', 'upbeat', '--duration', String(Math.ceil(durationSec)), '--output', fetched], { env: tools.env, timeoutMs: 120_000, registry });
  if (f.code === 0 && existsSync(fetched)) return fetched;
  const generated = join(workDir, 'bgm.wav');
  const g = await runProc(tools.python, [join(tools.scriptsDir, 'generate_bgm.py'), '--style', 'upbeat', '--duration', String(Math.ceil(durationSec)), '--output', generated], { env: tools.env, timeoutMs: 120_000, registry });
  return g.code === 0 && existsSync(generated) ? generated : null;
}
