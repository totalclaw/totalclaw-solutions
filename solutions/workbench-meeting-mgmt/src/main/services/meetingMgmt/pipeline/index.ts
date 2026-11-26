/**
 * 会议处理流水线与 AI 生成（代理 B）。接口见 docs/meeting-mgmt-workbench.md 3.1 节「B → A」。
 *
 * 录音 / 录屏：
 *   提取音轨（任意格式 → 16k 单声道 wav，多份首尾相接）
 *   → 按停顿切片（能量自适应门限，在空白处切；见 slice.ts）
 *   → 每片单独用本机 Whisper 转写 + 单独提 CAM++ 声纹（多进程并行，每个进程一批几片一起送进模型批量计算）
 *   → 聚类 + 和本场参会人声纹比对（见 diarize.ts）→ 连续同一人的片合并成一条发言段
 *   → 每位发言人截一段 5~8 秒试听片段 → 模型整理议题 / 决议 / 3 行摘要（规则兜底）。
 * 文字记录：解析 → 按昵称匹配员工 → 整理。
 *
 * 只在本机处理：音频不上传、不发给任何外部服务；模型（llm）只收到转写文字（由调用方注入，用户在 App 里选的那个）。
 */
import { existsSync, mkdirSync, renameSync, rmSync } from 'fs';
import { join } from 'path';
import { Converter } from 'opencc-js/t2cn';
import { t as i18nT } from '@totalclaw/i18n';
import type { MmMeetingFile, MmProcessStage, MmSegment, MmSpeakerSlot } from '../../../../shared/meetingMgmt/types';
import { abortError, classifyMeetingFile, concatWav16k, convertToWav16k, frameEnergiesDb, readPcmRange, readWavInfo, wavHeader, type MediaKind } from './audio';
import { planSlices, type PlannedSlice } from './slice';
import { cloudTranscribe } from '../cloudAsr';
import { asrEngineLabel, asrModelArg, autoParallelism, pickMeetingAsrEngine, pipelineConfig, resolveMeetingRuntime, type AgentAsrResult, type MeetingAsrPick, type MeetingRuntime } from './runtime';
import { detectLanguage, runSlices, type SliceOutput } from './workerPool';
import { diarize } from './diarize';
import { organizeMinutes } from './organize';
import { parseTranscriptFile, joinTexts } from './transcriptParse';
import { asrInitialPrompt } from './prompts';
import { ASR_HALLUCINATIONS } from './matchWords';
import { AUDIO_FILE, CLIP_DIR, clipPathFor, cutClip, workerSpecFor } from './voiceprint';
import { splitSentences } from './util';
import type { PipelineInput, PipelineResult } from './types';

export type { MmLlm, PipelineInput, PipelineResult } from './types';
export { generatePlan } from './plan';
export { organizeMinutes } from './organize';
export { buildReportStats, generateWeeklyReport, generateProjectSummary, isTaskOverdue } from './reports';
export { enrollVoiceprint, exportSpeakerClip, meetingVoiceSample } from './voiceprint';
export { configureMeetingPipeline, type MeetingPipelineConfig } from './runtime';
export { classifyMeetingFile, mediaKindByExt, AUDIO_EXTS, VIDEO_EXTS, TRANSCRIPT_EXTS } from './audio';

/** 合并同一人连续发言的上限：太长的一段在界面上改不动 */
const MERGE_MAX_SEC = 120;
const MERGE_MAX_CHARS = 600;
/** 同一人前后两片之间停了这么久就另起一段 */
const MERGE_MAX_GAP_SEC = 10;

type Report = (stage: MmProcessStage, progress: number, text?: string) => void;

/** 进度只增不减、同阶段 0.5 秒内不重复推；回调抛错不影响处理 */
function makeReporter(onStage: PipelineInput['onStage']): Report {
  let lastStage = '';
  let lastP = -1;
  let lastAt = 0;
  return (stage, progress, text) => {
    const p = Math.max(lastP, Math.min(100, Math.round(progress)));
    const now = Date.now();
    if (!text && stage === lastStage && (p === lastP || now - lastAt < 500)) return;
    lastStage = stage;
    lastP = p;
    lastAt = now;
    try { onStage(stage, p, text); } catch { /* 调用方的问题不打断处理 */ }
  };
}

function checkAbort(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

const normForMatch = (s: string) => s.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
const HALLU_NORM = ASR_HALLUCINATIONS.map(normForMatch);

/** 繁体 → 大陆简体（OpenCC 完整字典 + 词组）。不带提示转写时 Whisper 约 7% 的字出繁体 */
const toSimplified = Converter({ from: 't', to: 'cn' });
export function simplifyZh(text: string, lang: string | null): string {
  if (!text || (lang && !lang.startsWith('zh'))) return text;
  return fullWidthPunct(toSimplified(text));
}

/**
 * 中文里的半角标点换成全角（Whisper 常输出「今天开个短会,主要…」）。只换挨着汉字的，
 * 数字里的「1,000」「10:30」「3.5」和英文句子不动。
 */
const HALF_TO_FULL: Record<string, string> = { ',': '，', '?': '？', '!': '！', ':': '：', ';': '；' };
export function fullWidthPunct(text: string): string {
  return text.replace(/([\u3400-\u9fff\uff00-\uffef])\s*([,?!:;])\s*|([,?!:;])\s*(?=[\u3400-\u9fff])/g,
    (_m, before: string | undefined, p1: string | undefined, p2: string | undefined) => (before ? before + HALF_TO_FULL[p1!] : HALF_TO_FULL[p2!]));
}

/**
 * 这一片的转写里有没有句子只是在念 initial_prompt（整句都包含在提示词里）。
 * 实测（67 分钟远场录音）：27.5% 的发言，Whisper 带提示时只输出「请使用简体中文转写」，
 * 内容整片丢掉；同样的片不带提示重转 0/30 念提示、绝大多数有字。
 */
export function echoesPrompt(raw: string, prompt: string): boolean {
  const p = normForMatch(prompt || '');
  if (!p || !raw) return false;
  return splitSentences(String(raw).replace(/\s+/g, ' ').trim()).some(s => {
    const n = normForMatch(s);
    return n.length >= 4 && p.includes(n);
  });
}

/** 有这么多秒的有效发声才值得重转（太短的多半真是杂音） */
const RETRY_MIN_SPEECH_SEC = 1;
/** 切段前先滤掉这个频率以下的底噪（空调、风扇），见 audio.ts frameEnergiesDb */
const SLICE_HIGHPASS_HZ = 200;

/** 转写文字清理：中文之间的空格去掉、提示词回声 / 静音幻听句整句丢掉 */
export function cleanAsrText(text: string, names: string[] = []): string {
  let t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  t = t.replace(/(?<=[㐀-鿿　-〿＀-￯])\s+(?=[㐀-鿿　-〿＀-￯])/g, '');
  const namesNorm = names.length ? normForMatch(names.join('')) : '';
  const kept = splitSentences(t).filter(s => {
    const n = normForMatch(s);
    if (!n) return false;
    if (HALLU_NORM.some(h => h && n.includes(h))) return false;
    // 只念了一串参会人姓名：多半是 initial_prompt 回声
    if (namesNorm && n.length >= 4 && namesNorm.includes(n)) return false;
    return true;
  });
  return joinTexts(kept);
}

/** 切片 + 标签 + 文字 → 发言段（连续同一人的合并） */
export function buildSegments(slices: Array<{ start: number; end: number }>, texts: string[], labels: string[]): MmSegment[] {
  const out: MmSegment[] = [];
  let cur: { start: number; end: number; label: string; parts: string[]; chars: number } | null = null;
  const flush = () => {
    if (!cur) return;
    const text = joinTexts(cur.parts);
    if (text) out.push({ id: `seg_${out.length + 1}`, start: round2(cur.start), end: round2(cur.end), speakerLabel: cur.label, text });
    cur = null;
  };
  slices.forEach((s, i) => {
    const text = (texts[i] || '').trim();
    if (!text) return;
    const label = labels[i] || 'S1';
    if (cur && cur.label === label && s.start - cur.end <= MERGE_MAX_GAP_SEC && s.end - cur.start <= MERGE_MAX_SEC && cur.chars + text.length <= MERGE_MAX_CHARS) {
      cur.end = s.end;
      cur.parts.push(text);
      cur.chars += text.length;
      return;
    }
    flush();
    cur = { start: s.start, end: s.end, label, parts: [text], chars: text.length };
  });
  flush();
  return out;
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

/** 切片的 PCM 做成 wav 的 base64（agent 转写用） */
/** 从 16k wav 里截一段（秒），返回完整 wav 的 base64（转写上传、逐段播放共用） */
export function sliceWavBase64(wavPath: string, s: { start: number; end: number }): string {
  const info = readWavInfo(wavPath);
  const pcm = readPcmRange(wavPath, info, s.start, s.end);
  const data = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  return Buffer.concat([wavHeader(data.length), data]).toString('base64');
}

interface Classified { file: MmMeetingFile; kind: MediaKind }

async function classifyAll(files: MmMeetingFile[], rt: () => Promise<MeetingRuntime>, signal?: AbortSignal): Promise<Classified[]> {
  const out: Classified[] = [];
  for (const f of files) {
    checkAbort(signal);
    if (!f.path || !existsSync(f.path)) throw new Error(i18nT('文件「{p0}」已不在本机，请重新上传', { p0: f.name }));
    const c = await classifyMeetingFile(f.path, f.name, (await rt()).ffprobe, signal);
    if (!c) throw new Error(i18nT('文件「{p0}」的格式不支持（没有音轨，也不是文字记录）', { p0: f.name }));
    out.push({ file: f, kind: c.kind });
  }
  return out;
}

export async function runMeetingPipeline(input: PipelineInput): Promise<PipelineResult> {
  const report = makeReporter(input.onStage);
  const { signal } = input;
  if (!input.files?.length) throw new Error(i18nT('还没有上传会议文件'));
  mkdirSync(input.workDir, { recursive: true });
  let rtCache: Promise<MeetingRuntime> | null = null;
  const rt = () => (rtCache ||= resolveMeetingRuntime());
  try {
    report('extract', 0, i18nT('开始处理 {p0} 个文件', { p0: input.files.length }));
    const classified = await classifyAll(input.files, rt, signal);
    const media = classified.filter(c => c.kind !== 'transcript');
    const transcripts = classified.filter(c => c.kind === 'transcript');
    if (media.length) {
      if (transcripts.length) report('extract', 1, i18nT('同时上传了录音和文字记录，以录音为准（文字记录不参与转写）'));
      return await runAudio(input, media.map(m => m.file), await rt(), report);
    }
    return await runTranscripts(input, transcripts.map(t => t.file), report);
  } catch (e: any) {
    if (e?.aborted || signal?.aborted) throw abortError();
    const msg = String(e?.message || e || '');
    // 自己抛的中文错误原样给；意外错误包一层中文
    if (/[一-鿿]/.test(msg)) throw e;
    const err = new Error(i18nT('会议处理失败：{p0}', { p0: msg.slice(0, 200) || i18nT('未知错误') }));
    (err as any).detail = e?.stack;
    throw err;
  }
}

async function runTranscripts(input: PipelineInput, files: MmMeetingFile[], report: Report): Promise<PipelineResult> {
  report('parse', 2, i18nT('解析文字记录'));
  const segments: MmSegment[] = [];
  const speakers: MmSpeakerSlot[] = [];
  let offset = 0;
  for (let k = 0; k < files.length; k++) {
    checkAbort(input.signal);
    const f = files[k]!;
    const parsed = await parseTranscriptFile(f.path, f.name, { attendees: input.attendees });
    for (const s of parsed.segments) segments.push({ ...s, id: `seg_${segments.length + 1}`, start: round2(s.start + offset), end: round2(s.end + offset) });
    for (const sp of parsed.speakers) if (!speakers.some(x => x.label === sp.label)) speakers.push(sp);
    offset += (parsed.durationSec || 0) + (parsed.segments.length ? 1 : 0);
    report('parse', 2 + Math.round(((k + 1) / files.length) * 48));
  }
  if (!segments.length) throw new Error(i18nT('文字记录里没有可识别的发言内容'));
  const matched = speakers.filter(s => s.personId).length;
  report('parse', 50, i18nT('解析出 {p0} 段发言、{p1} 位发言人，其中 {p2} 位已按昵称匹配到员工', { p0: segments.length, p1: speakers.length, p2: matched }));
  return finish(input, segments, speakers, offset > 0 ? Math.round(offset) : undefined, report, 50);
}

async function finish(input: PipelineInput, segments: MmSegment[], speakers: MmSpeakerSlot[], durationSec: number | undefined, report: Report, from: number): Promise<PipelineResult> {
  checkAbort(input.signal);
  report('organize', from, i18nT('整理议题、决议与摘要'));
  const byId = new Map(input.attendees.map(p => [p.id, p.name]));
  const speakerNames: Record<string, string> = {};
  for (const s of speakers) speakerNames[s.label] = (s.personId && byId.get(s.personId)) || s.label;
  const org = await organizeMinutes({
    segments,
    speakerNames,
    attendeeNames: input.attendees.map(p => p.name),
    llm: input.llm,
    prompt: input.organizePrompt,
  });
  checkAbort(input.signal);
  if (org.note) report('organize', 99, org.note);
  report('done', 100, i18nT('处理完成：{p0} 段发言、{p1} 个议题、{p2} 项决议', { p0: org.segments.length, p1: org.topics.length, p2: org.decisions.length }));
  return { segments: org.segments, speakers, topics: org.topics, decisions: org.decisions, summaryLines: org.summaryLines, durationSec };
}

async function runAudio(input: PipelineInput, files: MmMeetingFile[], rt: MeetingRuntime, report: Report): Promise<PipelineResult> {
  const { signal, workDir } = input;
  const cfg = pipelineConfig();
  if (!rt.ffmpeg) throw new Error(i18nT('找不到 ffmpeg，无法处理录音'));

  // 1. 提取音轨
  const tmp = join(workDir, '_audio');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const parts: string[] = [];
  for (let k = 0; k < files.length; k++) {
    checkAbort(signal);
    report('extract', 1 + Math.round((k / files.length) * 4), i18nT('正在提取音轨（{p0}/{p1}）', { p0: k + 1, p1: files.length }));
    const p = join(tmp, `part-${k}.wav`);
    await convertToWav16k(rt.ffmpeg, files[k]!.path, p, files[k]!.name, signal);
    parts.push(p);
  }
  const wav = join(workDir, AUDIO_FILE);
  if (parts.length === 1) renameSync(parts[0]!, wav);
  else await concatWav16k(parts, wav);
  rmSync(tmp, { recursive: true, force: true });
  const info = readWavInfo(wav);
  const durationSec = Math.round(info.duration);
  if (info.duration < 0.5) throw new Error(i18nT('录音太短，没有可转写的内容'));

  // 2. 按停顿切片
  checkAbort(signal);
  const slices: PlannedSlice[] = planSlices(frameEnergiesDb(wav, info, 10, { highPassHz: SLICE_HIGHPASS_HZ }));
  if (!slices.length) throw new Error(i18nT('录音里没有检测到说话声（可能是静音或音量太小）'));
  report('extract', 5, i18nT('音频时长 {p0} 分钟，按停顿切成 {p1} 段', { p0: Math.round(info.duration / 6) / 10, p1: slices.length }));

  // 3. 转写 + 声纹
  if (!rt.python) throw new Error(i18nT('找不到本地语音识别运行时，无法转写录音'));
  // 远程转写：App 自带的 AI 服务（agent），或用户自己填的在线语音识别接口（cloud）；声纹一直在本机算
  const useCloud = input.asr === 'cloud' && !!input.cloudAsr;
  const useAgent = useCloud || (input.asr === 'agent' && !!cfg.agentTranscribe);
  if (input.asr === 'agent' && !cfg.agentTranscribe) report('transcribe', 6, i18nT('未接入 AI 服务转写，改用本机转写'));
  const hasLocalAsr = !!(rt.whisperModel || rt.senseVoiceDir || rt.fireRedDir);
  if (!useAgent && !hasLocalAsr) throw new Error(i18nT('本地语音识别模型未下载，请到 配置引导 → 语音模型 下载「会议转写 · SenseVoice」后重试'));
  const hasSpeakerModel = !!(rt.campp || rt.campp2);
  if (!hasSpeakerModel) report('transcribe', 6, i18nT('未下载声纹识别模型，不区分发言人（全部归为 S1，请主持人分配）'));
  const names = input.attendees.map(p => p.name).filter(Boolean);

  // 判语种：优先用 SenseVoice（已下载且未指定 Whisper 时更快且不依赖 ctranslate2），否则用 Whisper
  let lang: string | null = 'zh';
  if (!useAgent) {
    report('transcribe', 6, i18nT('识别语种'));
    const sample = slices.slice().sort((a, b) => (b.end - b.start) - (a.end - a.start)).slice(0, 3);
    const detectArg = (input.asrModel !== 'whisper' && rt.senseVoiceDir)
      ? asrModelArg('sensevoice', rt)
      : (rt.detectModel || rt.whisperModel || (rt.senseVoiceDir ? asrModelArg('sensevoice', rt) : ''));
    if (detectArg) {
      try {
        const d = await detectLanguage(workerSpecFor(rt, { asr: true, emb: false, threads: 4, model: detectArg }), wav, sample, cfg.createWorker);
        if (d.lang && d.prob >= 0.5) lang = d.lang;
      } catch { /* 判不出就按中文 */ }
    }
    checkAbort(signal);
  }
  const pick: MeetingAsrPick = useAgent ? { engine: null } : pickMeetingAsrEngine(rt, input.asrModel ?? 'auto', lang);
  if (!useAgent && !pick.engine) throw new Error(i18nT('本地语音识别模型未下载，请到 配置引导 → 语音模型 下载「会议转写 · SenseVoice」后重试'));
  const engine = pick.engine;
  const asrArg = engine ? asrModelArg(engine, rt) : null;
  if (pick.note === 'firered_low_mem') report('transcribe', 6, i18nT('这台电脑内存不足 12GB，本次用 SenseVoice 转写（FireRedASR2 需要更多内存）'));
  if (pick.note === 'pref_missing' && engine) report('transcribe', 6, i18nT('设置里选的转写模型没有下载，本次改用 {p0}', { p0: asrEngineLabel(engine, rt) }));
  if (engine === 'whisper' && rt.whisperDowngradedFrom) report('transcribe', 6, i18nT('未下载 {p0} 模型，改用 {p1}（识别准确率会低一些）', { p0: rt.whisperDowngradedFrom, p1: rt.whisperModel || '' }));
  const par = autoParallelism(useAgent ? null : asrArg, cfg.workers);

  const started = Date.now();
  let lastMilestone = 0;
  const onProgress = (done: number, total: number) => {
    const p = 8 + (done / total) * 74;
    const pct = Math.floor((done / total) * 10);
    if (pct > lastMilestone && done < total) {
      lastMilestone = pct;
      const elapsed = (Date.now() - started) / 1000;
      const remain = Math.max(1, Math.round((elapsed / done) * (total - done) / 60));
      report('transcribe', p, i18nT('已处理 {p0}/{p1} 段，预计还需约 {p2} 分钟', { p0: done, p1: total, p2: remain }));
    } else report('transcribe', p);
  };
  report('transcribe', 8, useAgent
    ? (useCloud ? i18nT('正在转写与提取声纹（在线接口 {p0} 转写，声纹在本机）', { p0: input.cloudAsr?.model || '' }) : i18nT('正在转写与提取声纹（AI 服务转写）'))
    : i18nT('正在转写与提取声纹（{p0} 模型，{p1} 个进程并行）', { p0: engine ? asrEngineLabel(engine, rt) : '', p1: par.workers }));

  let outs: SliceOutput[];
  // 提示词只有 Whisper 用（sherpa 引擎不吃提示词，也就没有「只念提示词」的问题）
  const prompt = engine === 'whisper' ? asrInitialPrompt(lang, names) : '';
  const beam = /large|medium/.test(rt.whisperModel || '') ? 1 : 3;
  if (useAgent) {
    const cloud = input.cloudAsr;
    const fn = useCloud && cloud
      ? (b64: string) => cloudTranscribe(cloud, Buffer.from(b64, 'base64'), { signal })
      : cfg.agentTranscribe!;
    outs = await agentTranscribeAll(wav, slices, rt, par, signal, onProgress, report, fn, useCloud ? 3 : 2);
  } else {
    outs = await runSlices(workerSpecFor(rt, { asr: true, threads: par.threads, model: asrArg }), wav, slices, {
      workers: par.workers, asr: true, emb: hasSpeakerModel, lang, prompt,
      beam, batchCount: par.batch,
      signal, onProgress, createWorker: cfg.createWorker,
    });
  }
  checkAbort(signal);
  const texts = outs.map(o => cleanAsrText(o.text || '', names));

  // 3b. 只念出了提示词的片：不带提示重转一次（只转写，声纹第一遍已经有了），比原来多出字才换
  const retry = useAgent ? [] : slices.map((_, i) => i).filter(i =>
    !outs[i]!.asrError && slices[i]!.speech >= RETRY_MIN_SPEECH_SEC && echoesPrompt(outs[i]!.text || '', prompt));
  if (retry.length) {
    report('transcribe', 82, i18nT('有 {p0} 段只识别出了提示语，正在不带提示重新转写', { p0: retry.length }));
    let rescued = 0;
    try {
      const again = await runSlices(workerSpecFor(rt, { asr: true, emb: false, threads: par.threads, model: asrArg }), wav, retry.map(i => slices[i]!), {
        workers: par.workers, asr: true, emb: false, lang, prompt: '',
        beam, batchCount: par.batch,
        signal, createWorker: cfg.createWorker,
        onProgress: (d, t) => report('transcribe', 82 + (d / t) * 6),
      });
      again.forEach((o, k) => {
        const i = retry[k]!;
        const t = cleanAsrText(o.text || '', names);
        if (!o.asrError && t.length > texts[i]!.length) {
          if (!texts[i]) rescued++;
          texts[i] = t;
        }
      });
    } catch (e: any) {
      if (e?.aborted || signal?.aborted) throw abortError();
      // 重转失败不影响第一遍的结果
    }
    report('transcribe', 88, i18nT('重新转写找回 {p0} 段发言', { p0: rescued }));
  }
  // sherpa 引擎按片给语种：粤语也转成简体（「呢幾個字」→「呢几个字」），英文句子不动
  for (let i = 0; i < texts.length; i++) {
    const sl = String(outs[i]?.lang || '').toLowerCase();
    const effective = /^(zh|yue|cantonese|chinese|mandarin)/.test(sl) ? 'zh' : /^[a-z]{2,3}$/.test(sl) ? sl : lang;
    texts[i] = simplifyZh(texts[i]!, effective);
  }
  const failed = outs.filter(o => o.asrError).length;
  if (failed > slices.length / 2) {
    const why = outs.find(o => o.asrError)?.asrError || '';
    throw new Error(i18nT('转写失败的片段太多（{p0}/{p1}），请重试', { p0: failed, p1: slices.length }) + (why ? `：${why}` : ''));
  }
  if (!texts.some(Boolean)) throw new Error(i18nT('没有识别出任何发言（录音可能是静音或太嘈杂）'));
  report('transcribe', 88, i18nT('转写完成，用时 {p0} 分钟', { p0: Math.max(1, Math.round((Date.now() - started) / 60000)) }));

  // 4. 认人 / 聚类
  report('diarize', 89, i18nT('识别发言人'));
  const attendeeIds = new Set(input.attendees.map(p => p.id));
  const vps = (input.voiceprints || []).filter(v => attendeeIds.has(v.personId) && ((Array.isArray(v.vector) && v.vector.length) || (Array.isArray((v as any).vector2) && (v as any).vector2.length)));
  const d = diarize({
    slices: slices.map((s, i) => ({ start: s.start, end: s.end, speech: s.speech, emb: outs[i]?.emb || null, emb2: outs[i]?.emb2 || null })),
    voiceprints: vps.map(v => ({ personId: v.personId, vector: v.vector, vector2: v.vector2, samples: v.extra })),
    threshold: input.threshold,
  });
  const rawSegments = buildSegments(slices, texts, d.labels);
  // 只保留有发言的发言人，按首次发言重新编号 S1、S2…
  const order: string[] = [];
  for (const s of rawSegments) if (!order.includes(s.speakerLabel)) order.push(s.speakerLabel);
  const relabel = new Map(order.map((l, k) => [l, `S${k + 1}`]));
  const segments = rawSegments.map(s => ({ ...s, speakerLabel: relabel.get(s.speakerLabel)! }));
  mkdirSync(join(workDir, CLIP_DIR), { recursive: true });
  const speakers: MmSpeakerSlot[] = [];
  for (const old of order) {
    const sp = d.speakers.find(x => x.label === old)!;
    const label = relabel.get(old)!;
    const slot: MmSpeakerSlot = { label };
    if (sp.personId) { slot.personId = sp.personId; slot.matchedBy = 'voiceprint'; if (sp.score !== undefined) slot.score = sp.score; }
    const ranges = slices.filter((_, i) => d.labels[i] === old && texts[i]);
    const rep = sp.repSlice !== null ? slices[sp.repSlice] : undefined;
    try {
      const out = clipPathFor(workDir, label);
      if (cutClip(wav, rep && (rep.end - rep.start) >= 5 ? [rep] : ranges, out)) slot.clipPath = out;
    } catch { /* 试听片段失败不影响纪要 */ }
    speakers.push(slot);
  }
  const matched = speakers.filter(s => s.personId).length;
  report('diarize', 92, i18nT('识别出 {p0} 位发言人，其中 {p1} 位已按声纹认出', { p0: speakers.length, p1: matched }));
  return finish(input, segments, speakers, durationSec, report, 92);
}

/** agent 转写：逐片发 wav（并发 2），声纹仍在本机提（声纹异常时降级跳过，不阻断在线转写兜底） */
async function agentTranscribeAll(
  wav: string, slices: PlannedSlice[], rt: MeetingRuntime, par: { workers: number; threads: number }, signal: AbortSignal | undefined,
  onProgress: (d: number, t: number) => void,
  report: Report,
  transcribe: (wavBase64: string) => Promise<AgentAsrResult>, concurrency = 2,
): Promise<SliceOutput[]> {
  const cfg = pipelineConfig();
  let embs: SliceOutput[] = slices.map((_, i) => ({ i }));
  if (rt.campp || rt.campp2) {
    try {
      embs = await runSlices(workerSpecFor(rt, { asr: false, threads: par.threads }), wav, slices, { workers: Math.min(2, par.workers), asr: false, emb: true, signal, createWorker: cfg.createWorker });
    } catch (e: any) {
      if (e?.aborted || signal?.aborted) throw abortError();
      report('transcribe', 8, i18nT('本机声纹识别暂不可用，本次跳过发言人区分（全部归为 S1，可由主持人分配）'));
    }
  }
  const out: SliceOutput[] = slices.map((_, i) => ({ ...embs[i], i }));
  let next = 0;
  let done = 0;
  const loop = async () => {
    while (next < slices.length) {
      checkAbort(signal);
      const i = next++;
      const s = slices[i]!;
      if (s.end - s.start < 0.3) { done++; continue; }
      try {
        const b64 = sliceWavBase64(wav, s);
        let r = await transcribe(b64);
        // 限流 / 服务端一时出错：等 2 秒再试一次
        if (!r.ok && /429|太频繁|HTTP 5\d\d|超时/.test(r.error || '')) {
          await new Promise((res) => setTimeout(res, 2000));
          checkAbort(signal);
          r = await transcribe(b64);
        }
        if (r.ok) out[i]!.text = r.text || '';
        else out[i]!.asrError = r.error || 'failed';
      } catch (e: any) {
        out[i]!.asrError = String(e?.message || e);
      }
      done++;
      onProgress(done, slices.length);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => loop()));
  return out;
}
