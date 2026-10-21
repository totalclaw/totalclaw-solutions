/**
 * 慈善活动内容工场 · 模型与 fal 运行时（IPC 与预置生成工具共用）。
 *
 * - 默认模型 = 单聊用的那份 brain（appConfig.brain.profiles.default，经 setConfiguredDefaultProvider 注入），
 *   不读 agent config.yaml 的 model.provider（用户实测那一项为空时单聊正常、工作台却报 NO_PROVIDER）
 * - 文案：runOneshotChat 纯补全（与单聊同路）
 * - 看图：① fal any-llm/vision（设置 → 媒体模型的 fal Key，默认视觉后端）→ ② brain 多模态直连 → ③ qiye-api /v1/vlm
 * - fal：runFalJob（密钥 media.FAL_KEY / 服务端下发、配额、用量审计）+ 全应用 ttsRouter
 */
import { app } from 'electron';
import { join } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import type { IpcDeps } from '../../ipc/shared';
import { getConfiguredDefaultProvider, qiyeApiBridge } from '../qiyeApiBridge';
import { runOneshotChat } from '../councilChatRouter';
import { QiyeApiClient } from '../qiyeApiClient';
import { runFalJob, uploadFalFile } from '../../ipc/mediaFal.ipc';
import { bindTtsRouterToSolution, getTtsRouter } from '../media/ttsRouter';
import { resolveFalKeys } from '../media/falProvider';
import { type FalFacade, visionRequest } from './falBridge';
import { imageToDataUrl } from './render';

export const CHARITY_SOLUTION_ID = 'workbench-charity-content';

export interface CharityRuntime {
  defaultProviderSlug: () => string;
  requireDefaultModel: () => void;
  falFacade: () => FalFacade;
  vision: (imagePath: string, prompt: string, signal?: AbortSignal) => Promise<string>;
  text: (prompt: string, opts: { jsonObject?: boolean; signal?: AbortSignal; timeoutMs?: number }) => Promise<string>;
}

export function createCharityRuntime(deps: IpcDeps, agentHome: () => string | undefined): CharityRuntime {
  const NO_MODEL_MSG = i18nT('请先在设置 → 模型里选择默认模型');
  const defaultProviderSlug = (): string =>
    (getConfiguredDefaultProvider() || String((deps.appConfig as any)?.brain?.profiles?.default?.provider || '')).trim();
  const requireDefaultModel = (): void => { if (!defaultProviderSlug()) throw new Error(NO_MODEL_MSG); };

  function falFacade(): FalFacade {
    const hasKey = (() => { try { return resolveFalKeys(agentHome(), undefined, CHARITY_SOLUTION_ID).length > 0; } catch { return false; } })();
    if (!hasKey) return { run: null, tts: null, upload: null };
    return {
      run: (req, signal, onProgress) => runFalJob(deps, { ...req, solutionId: CHARITY_SOLUTION_ID }, { signal, onProgress }),
      // 钉上本方案 id：只有「按方案下发」的服务端 key 时，语音也要按本方案去取 key
      tts: bindTtsRouterToSolution(getTtsRouter(), CHARITY_SOLUTION_ID),
      upload: (path, signal) => uploadFalFile(deps, path, { solutionId: CHARITY_SOLUTION_ID, signal }),
    };
  }

  async function vision(imagePath: string, prompt: string, signal?: AbortSignal): Promise<string> {
    const errors: string[] = [];
    const fal = falFacade();
    if (fal.run) {
      try {
        const r = await fal.run(visionRequest(imagePath, prompt, join(app.getPath('temp'), 'charity-vision')), signal);
        const text = String(r.text || (r.result as any)?.output || '').trim();
        if (text) return text;
        errors.push('fal vision: empty');
      } catch (e: any) {
        if (signal?.aborted) throw e;
        errors.push(`fal vision: ${String(e?.message || e).slice(0, 160)}`);
      }
    }
    const imageDataUrl = imageToDataUrl(imagePath, 1280);
    if (imageDataUrl) {
      try {
        const r = await qiyeApiBridge.chatCompletionsForVision({ imageDataUrl, prompt, signal, timeoutMs: 120_000, maxTokens: 900 });
        if (r.text.trim()) return r.text;
        errors.push('brain vision: empty');
      } catch (e: any) {
        if (signal?.aborted) throw e;
        errors.push(`brain vision: ${String(e?.message || e).slice(0, 160)}`);
      }
      const proc = deps.qiyeApiProc;
      const provider = defaultProviderSlug();
      if (proc && proc.getStatus() === 'ready' && provider) {
        try {
          const client = new QiyeApiClient({ baseUrl: proc.getBaseUrl(), getBearerToken: () => proc.getBearerToken(), defaultTimeoutMs: 180_000 });
          const res: any = await client.post('/v1/vlm', { provider, operation: 'ask', imageUrl: imageDataUrl, question: prompt, prompt }, 180_000, undefined, signal);
          const text = String(res?.text ?? res?.result ?? res?.content ?? '').trim();
          if (text) return text;
        } catch (e2) {
          if (signal?.aborted) throw e2;
          errors.push(`/v1/vlm: ${String((e2 as any)?.message || e2).slice(0, 160)}`);
        }
      }
    }
    deps.logger?.warn?.('charity-content', '看图三条通道均不可用', { errors });
    throw new Error(fal.run ? i18nT('看图失败：{why}', { why: errors[0] || '' }) : i18nT('当前默认模型无法读图，且未配置 fal 密钥（设置 → 媒体模型）'));
  }

  const text: CharityRuntime['text'] = async (prompt, opts) => {
    requireDefaultModel();
    return runOneshotChat(deps, prompt, { plainCompletion: true, timeoutMs: opts.timeoutMs ?? 120_000, signal: opts.signal });
  };

  return { defaultProviderSlug, requireDefaultModel, falFacade, vision, text };
}
