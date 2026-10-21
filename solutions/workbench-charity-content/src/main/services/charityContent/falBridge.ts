/**
 * 慈善活动内容工场 · fal 桥（不自带客户端）。
 *
 * 全部走桌面端统一的 fal 通道：`runFalJob`（ipc/mediaFal.ipc：密钥解析 media.FAL_KEY / 服务端下发、
 * 配额、用量审计 fal-usage.jsonl、本地文件自动上传）与 `ttsRouter`（fal MiniMax speech-02-hd 优先、
 * 缓存、熔断、备用链路标记）。本文件只做「本方案要的三种能力 → 统一入参」的收口。
 */
import type { MediaFalRunRequest, MediaFalRunResponse } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { TtsRouter, TtsRouteResult } from '../media/ttsRouter';
import { TTS_DEFAULT_VOICES } from '../media/ttsRouter';
import { BASE_SHOT_PROMPT, musicPrompt } from '../../../shared/charityPrompts';

/** 队列进度（排队位次 / 状态），给界面显示「排队第 N 位 / 生成中」 */
export interface FalJobProgress { status: string; queuePosition?: number; elapsedMs: number }
export type FalJobRunner = (req: MediaFalRunRequest, signal?: AbortSignal, onProgress?: (p: FalJobProgress) => void) => Promise<MediaFalRunResponse>;

export interface FalFacade {
  /** 有 key 才有；没有就是 null，调用方走本地 / 预置 */
  run: FalJobRunner | null;
  tts: TtsRouter | null;
  /** 本地文件 → fal CDN https 地址（先传后生成：上传单独计进度、单独重试） */
  upload?: ((path: string, signal?: AbortSignal) => Promise<string>) | null;
}

/**
 * fal 错误分级：这几类说明「fal 这条路今天走不通」（没 key / 额度 / 余额 / 密钥无效），
 * 不值得重试，剩下的镜头直接本地顶上；其余（网络、超时、上游 5xx、单张图被拒）按单镜头失败处理。
 */
export function falFatalReason(e: unknown): string | null {
  const code = String((e as any)?.code || '');
  const msg = String((e as any)?.message || e);
  if (code === 'FAL_NO_KEY' || isFalNoKey(e)) return i18nT('未配置 fal 密钥');
  if (code === 'FAL_QUOTA') return i18nT('fal 今日调用额度已用完');
  if (code === 'FAL_BALANCE' || /HTTP 402\b/.test(msg)) return i18nT('fal 账户余额不足');
  if (code === 'FAL_AUTH' || /HTTP 40[13]\b/.test(msg)) return i18nT('fal 密钥无效或无权限');
  return null;
}

/** 失败原因压成一行短句（界面标注用，去掉 HTTP 方法与 URL） */
export function shortFalError(e: unknown): string {
  const msg = String((e as any)?.message || e || '').replace(/^\[[A-Z_]+\]\s*/, '');
  return msg.replace(/fal HTTP (\d{3}) [A-Z]+ [^\s：]+/, 'fal HTTP $1').replace(/：/g, ': ').replace(/\s+/g, ' ').trim().slice(0, 120);
}

/** fal MiniMax speech-02-hd 音色（与 ttsRouter 全应用默认一致，设置 → 媒体模型可改） */
export const FAL_TTS_VOICES: Record<'zh' | 'en' | 'ar', string> = { ...TTS_DEFAULT_VOICES };

export function isFalNoKey(e: unknown): boolean {
  const m = String((e as any)?.message || e);
  return /FAL_NO_KEY|尚未配置 fal 密钥|未配置 fal 密钥/.test(m);
}

/** 照片 → 5s 动态镜头（i2v，9:16）；本地路径由 runFalJob 上传。prompt 由两个提示词合并而来（shared/charityPrompts） */
export function i2vRequest(localImage: string, outDir: string, prompt?: string): MediaFalRunRequest {
  return {
    capability: 'i2v', imageUrl: localImage, outDir, duration: 5, aspect: '9:16', resolution: '768P',
    prompt: prompt || BASE_SHOT_PROMPT,
  };
}

/**
 * 文稿 → 9:16 动态镜头（t2v，MiniMax H3 Max）。
 *
 * 文章转语音这条线没有现场照片，画面按文稿直接生成。用文生视频而不是「先出静帧再图生视频」：
 * 少一次生成、少一次排队等待，镜头本身也更连贯（静帧转出来的动态常常只是轻微推拉）。
 * 模型取 t2v 的默认项（能力表里就是 minimax/h3-max/text-to-video），用户在方案里换了模型就跟着换。
 */
export function t2vRequest(prompt: string, outDir: string): MediaFalRunRequest {
  return { capability: 't2v', outDir, aspect: '9:16', duration: 5, resolution: '768P', prompt };
}

/** 配乐（Stable Audio），秒数按成片长度；prompt 缺省 = 按情绪的原默认描述 */
export function musicRequest(mood: string, durationSec: number, outDir: string, prompt?: string): MediaFalRunRequest {
  return {
    capability: 'music', outDir, duration: Math.min(47, Math.max(20, Math.ceil(durationSec))),
    prompt: prompt || musicPrompt(mood),
  };
}

/** 看图（any-llm/vision）：本地图片路径由 runFalJob 上传；返回 text */
export function visionRequest(localImage: string, prompt: string, outDir: string, llm?: string): MediaFalRunRequest {
  return { capability: 'vision', imageUrls: [localImage], prompt, llm, maxTokens: 900, outDir };
}

export type { TtsRouteResult };
