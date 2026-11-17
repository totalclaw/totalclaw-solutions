/**
 * 会议处理用到的本机组件在哪：ffmpeg / ffprobe、Python、插件目录、Whisper 模型、CAM++ 模型。
 *
 * 全部复用语音输入那一套解析（localAsr / ffmpegPath / speakerModel / whisperModels / pyPluginInstaller），
 * 不另找一份；这些模块依赖 electron，所以在函数里按需加载，单测可以用 configureMeetingRuntime 整个替换。
 */
import { cpus, totalmem } from 'os';
import type { WorkerSpec } from './workerPool';

export interface MeetingRuntime {
  ffmpeg: string | null;
  ffprobe: string | null;
  python: string | null;
  pluginsDir: string;
  whisperModelsDir: string;
  /** 实际用的 Whisper 模型（已缓存的）；null = 一个都没有 */
  whisperModel: string | null;
  /** 想要的模型没缓存、退到了更小一档 */
  whisperDowngradedFrom?: string;
  /** 判语种用的模型（small 够准、比 large-v3 快 5 倍；没有就用 whisperModel） */
  detectModel?: string | null;
  /** CAM++ 声纹模型；null = 未下载 */
  campp: string | null;
  /** ERes2NetV2 声纹模型（会议认人更准，2026-11-17 起推荐）；null / 缺省 = 未下载 */
  campp2?: string | null;
  /** 会议转写 · SenseVoice（sherpa-onnx）模型目录；null / 缺省 = 未下载 */
  senseVoiceDir?: string | null;
  /** 会议转写 · FireRedASR2（最准）模型目录；null / 缺省 = 未下载 */
  fireRedDir?: string | null;
  env: NodeJS.ProcessEnv;
}

/**
 * 会议转写用哪个引擎。2026-11-17 本机实测（演示会议 6 种音质 + 67 分钟真实录音 + 36 条带标准答案的方言 / 远场 / 专业词样本，
 * 数字见 streamingAsrModel.ts 的 MEETING_ASR_MODELS）：FireRedASR2 最准（含方言），SenseVoice 快几倍、体积小，
 * 两个都比 Whisper large-v3 准得多。所以：装了 FireRedASR2 且内存够就用它（同一片带 SenseVoice 兜底），
 * 否则 SenseVoice；Whisper 只在录音语种它们都不认（如阿拉伯语）或者都没下载时兜底。
 */
export type MeetingAsrEngine = 'firered' | 'sensevoice' | 'whisper';
export type MeetingAsrPref = 'auto' | MeetingAsrEngine;
export const SENSEVOICE_LANGS: readonly string[] = ['zh', 'yue', 'en', 'ja', 'ko'];
/** FireRedASR2：普通话 + 20 多种方言 / 口音（含粤语）+ 英文 */
export const FIRERED_LANGS: readonly string[] = ['zh', 'yue', 'en'];
/** 自动档下 FireRedASR2 至少要多少内存（实测处理时峰值约 3.7GB，再加 SenseVoice 兜底和声纹） */
export const FIRERED_MIN_MEM_GB = 12;

export interface MeetingAsrPick {
  engine: MeetingAsrEngine | null;
  /** firered_low_mem = 装了 FireRedASR2 但内存不够，自动档改用 SenseVoice；pref_missing = 设置里选的没下载；lang_unsupported = 录音语种不在支持范围 */
  note?: 'firered_low_mem' | 'pref_missing' | 'lang_unsupported';
}

export function pickMeetingAsrEngine(
  rt: Pick<MeetingRuntime, 'whisperModel' | 'senseVoiceDir' | 'fireRedDir'>,
  pref: MeetingAsrPref = 'auto',
  lang: string | null = 'zh',
  memGb: number = totalmem() / 1024 ** 3,
): MeetingAsrPick {
  const l = String(lang || 'zh').toLowerCase();
  const sv = !!rt.senseVoiceDir && SENSEVOICE_LANGS.includes(l);
  const fr = !!rt.fireRedDir && FIRERED_LANGS.includes(l);
  const wh = !!rt.whisperModel;
  if (pref === 'whisper' && wh) return { engine: 'whisper' };
  if (pref === 'firered' && fr) return { engine: 'firered' };
  if (pref === 'sensevoice' && sv) return { engine: 'sensevoice' };
  const missed = pref !== 'auto' ? { note: 'pref_missing' as const } : {};
  if (fr && memGb >= FIRERED_MIN_MEM_GB) return { engine: 'firered', ...missed };
  if (sv) return { engine: 'sensevoice', ...(fr ? { note: 'firered_low_mem' as const } : missed) };
  if (fr) return { engine: 'firered', ...missed };
  if (wh) return { engine: 'whisper', ...(rt.senseVoiceDir || rt.fireRedDir ? { note: 'lang_unsupported' as const } : missed) };
  if (rt.senseVoiceDir) return { engine: 'sensevoice', note: 'lang_unsupported' };
  if (rt.fireRedDir) return { engine: 'firered', note: 'lang_unsupported' };
  return { engine: null };
}

/** worker 的模型参数：Whisper 传模型名；sherpa 引擎传 `sherpa:{"kind":..,"dir":..}` */
export function asrModelArg(engine: MeetingAsrEngine, rt: Pick<MeetingRuntime, 'whisperModel' | 'senseVoiceDir' | 'fireRedDir'>): string {
  if (engine === 'whisper') return rt.whisperModel || '';
  if (engine === 'firered') {
    // 有 SenseVoice 就一起带上：FireRedASR2 漏字 / 复读 / 噪声里跑飞的片用 SenseVoice 的结果（worker 里逐片挑）
    return `sherpa:${JSON.stringify({ kind: 'fire_red_aed', dir: rt.fireRedDir, ...(rt.senseVoiceDir ? { svDir: rt.senseVoiceDir } : {}) })}`;
  }
  return `sherpa:${JSON.stringify({ kind: 'sense_voice', dir: rt.senseVoiceDir })}`;
}

/** 界面上显示的模型名 */
export function asrEngineLabel(engine: MeetingAsrEngine, rt: Pick<MeetingRuntime, 'whisperModel'>): string {
  return engine === 'firered' ? 'FireRedASR2' : engine === 'sensevoice' ? 'SenseVoice' : (rt.whisperModel || 'Whisper');
}

export interface AgentAsrResult { ok: boolean; text?: string; error?: string; unavailable?: boolean }

export interface MeetingPipelineConfig {
  /** 整个替换本机组件解析（单测 / 特殊部署） */
  runtime?: Partial<MeetingRuntime> | (() => Promise<Partial<MeetingRuntime>>);
  /**
   * asr = 'agent' 时逐段调用的转写（由接线方注入，内部一般是 transcribeWavViaAgent + QiyeApiClient）。
   * 没注入时 'agent' 回落本机 Whisper，并在处理日志里说明。
   */
  agentTranscribe?: (wavBase64: string) => Promise<AgentAsrResult>;
  /** 并行进程数（默认按 CPU / 内存自动） */
  workers?: number;
  /** 测试注入：替换 worker 进程 */
  createWorker?: (spec: WorkerSpec) => any;
}

let config: MeetingPipelineConfig = {};

/** 接线方（A / 总控）可选调用：注入 agent 转写、覆盖本机组件。不调也能用。 */
export function configureMeetingPipeline(c: MeetingPipelineConfig): void {
  config = { ...config, ...c };
}

/** 仅测试：清空配置 */
export function __resetMeetingPipelineConfig(): void {
  config = {};
}

export function pipelineConfig(): MeetingPipelineConfig {
  return config;
}

/** 想要的转写模型：会议纪要要准，默认 large-v3；没缓存就退到已有的更小一档 */
export const MEETING_ASR_MODEL = process.env.TOTALCLAW_MEETING_ASR_MODEL || 'large-v3';

async function defaultRuntime(): Promise<MeetingRuntime> {
  const localAsr = await import('../../localAsr');
  const { resolveFfmpegPair } = await import('../../ffmpegPath');
  const { speakerModelPath, speakerModelV2Path } = await import('../../speakerModel');
  const wm = await import('../../whisperModels');
  const sam = await import('../../streamingAsrModel');
  const ppi = await import('../../pyPluginInstaller');
  const { buildPythonEnv } = await import('@totalclaw/engine-totalclaw-agent');
  const resourcesDir = localAsr.resolveResourcesDir();
  const pair = resolveFfmpegPair(resourcesDir);
  const python = localAsr.resolveLocalAsrPython();
  // 插件目录的 ABI 标签按「真正跑 worker 的解释器」定，与 localAsr.ensureWorker 同一口径
  ppi.setGeneralAbiResourcesDir(resourcesDir);
  const modelsDir = wm.ensureBundledWhisperModels(resourcesDir);
  const picked = wm.pickWhisperModel(wm.fallbackChain(MEETING_ASR_MODEL));
  return {
    ffmpeg: pair.ffmpeg,
    ffprobe: pair.ffprobe,
    python,
    pluginsDir: ppi.resolvePyPluginsDir('general'),
    whisperModelsDir: modelsDir,
    whisperModel: wm.isWhisperModelCached(picked.model) ? picked.model : null,
    whisperDowngradedFrom: picked.downgradedFrom,
    detectModel: wm.isWhisperModelCached('small') ? 'small' : null,
    campp: speakerModelPath(),
    // 老版本 App 没有这个导出（2.0.17 才加）：没有就当没装，别让整条流水线因为它起不来
    campp2: typeof speakerModelV2Path === 'function' ? speakerModelV2Path() : null,
    senseVoiceDir: sam.meetingAsrModelDir(sam.MEETING_ASR_SENSEVOICE_ID),
    fireRedDir: sam.meetingAsrModelDir(sam.MEETING_ASR_FIRERED_ID),
    env: buildPythonEnv({ ...process.env }),
  };
}

export async function resolveMeetingRuntime(): Promise<MeetingRuntime> {
  const o = config.runtime;
  if (o && typeof o === 'object' && 'python' in o && 'ffmpeg' in o) {
    return { pluginsDir: '', whisperModelsDir: '', whisperModel: null, campp: null, env: { ...process.env }, ffprobe: null, python: null, ffmpeg: null, ...o } as MeetingRuntime;
  }
  const over = typeof o === 'function' ? await o() : (o || {});
  const base = await defaultRuntime();
  return { ...base, ...over };
}

/**
 * 并行几个进程、每个几线程、一批几片。
 *
 * 实测（M5 Pro 18 核 / 24GB，用户 67 分钟录音，large-v3 int8，每片单独转写）：
 *   - 逐片一个一个转时 8 线程不比 4 线程快；一批几片一起送进模型快得多（批 12 约 3 倍）；
 *   - 但 large-v3 一批 8 片时单个进程峰值 6.5GB（32 层解码器的交叉注意力缓存按片数成倍涨），
 *     3 个进程一批 12 片在内存本来就紧的机器上直接换页，10 分钟没转完一成。
 *   所以 large / medium 按「1.6GB + 每片 0.6GB」估内存、只用总内存的 35%：24GB 的机器上 2 个进程、一批 4 片。
 * 手动调：TOTALCLAW_MEETING_ASR_WORKERS=进程数，TOTALCLAW_MEETING_ASR_BATCH=一批几片。
 */
export function autoParallelism(model: string | null, override?: number, hw?: { cores: number; memGb: number }): { workers: number; threads: number; batch: number } {
  const n = Math.max(1, hw?.cores ?? (cpus().length || 1));
  const memGb = hw?.memGb ?? totalmem() / 1024 ** 3;
  const envW = Number(process.env.TOTALCLAW_MEETING_ASR_WORKERS);
  const envB = Number(process.env.TOTALCLAW_MEETING_ASR_BATCH);
  const want = override || (Number.isFinite(envW) && envW > 0 ? envW : 0);
  // sherpa-onnx 引擎：SenseVoice 一片几十毫秒，2 个进程就够；FireRedASR2 一个进程峰值约 4GB，内存大才开 2 个
  if (model?.startsWith('sherpa:')) {
    const heavyAsr = model.includes('"fire_red_aed"');
    const byCpuS = Math.max(1, Math.floor(n / 6));
    const workers = want ? Math.min(want, 4) : heavyAsr ? (memGb >= 32 && n >= 12 ? 2 : 1) : Math.max(1, Math.min(2, byCpuS));
    const threads = Math.max(2, Math.min(heavyAsr ? 8 : 6, Math.floor((n - 2) / workers) || 2));
    const b = Number.isFinite(envB) && envB > 0 ? Math.min(16, Math.floor(envB)) : heavyAsr ? 4 : 8;
    return { workers, threads, batch: b };
  }
  const heavy = !!model && /large|medium/.test(model);
  const budget = memGb * 0.35;
  const byCpu = Math.max(1, Math.floor(n / 6));
  let batch = Number.isFinite(envB) && envB > 0 ? Math.min(16, Math.floor(envB)) : heavy ? (memGb >= 48 ? 8 : 4) : 12;
  const perWorkerGb = !model ? 0.5 : heavy ? 1.6 + 0.6 * batch : 0.5 + 0.15 * batch;
  let workers = want ? Math.min(want, 8) : Math.max(1, Math.min(3, byCpu, Math.floor(budget / perWorkerGb)));
  // 内存连一个进程都不够：一批降到 1 片（逐片转）
  if (!want && heavy && perWorkerGb > budget) { batch = 1; workers = 1; }
  const threads = Math.max(2, Math.min(6, Math.floor((n - 2) / workers) || 2));
  return { workers, threads, batch };
}
