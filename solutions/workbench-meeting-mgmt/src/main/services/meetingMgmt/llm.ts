/**
 * 会议智能管理 · 文字类 AI 的调用口（docs/meeting-mgmt-workbench.md 3.1 的 MmLlm）。
 *
 * 走 runOneshotChat（纯补全、零工具，模型就是用户在 App 里选的那个）。
 * 模型不可用 / 超时 / 通道把错误当正文返回 / 回复为空 → 一律返回 null，不抛：
 * 调用方（流水线、方案、报告）拿到 null 走确定性兜底，流程不断。
 *
 * E2E：TOTALCLAW_E2E=1 且给了本机 TOTALCLAW_E2E_LLM_URL 时，把提示词 POST 给假端点（同 workbenchLlm 的约定），
 * 返回 { text }；不碰真实模型与账号。
 */
import type { IpcDeps } from '../../ipc/shared';
import { runOneshotChat } from '../councilChatRouter';
import { isChannelErrorReply } from '../bidWriter/llmReply';

/** 与 pipeline/index.ts 导出的 MmLlm 同形（这里自己声明一份，免得核心依赖流水线模块） */
export type MmLlm = (prompt: string, opts?: { json?: boolean; timeoutMs?: number }) => Promise<string | null>;

export const MM_LLM_DEFAULT_TIMEOUT_MS = 120_000;

/** 要 JSON 时追加在提示词末尾（模型可见指令，不是界面文案） */
const JSON_DIRECTIVE = '\n\nReturn ONLY one valid JSON object. No explanation, no Markdown code fences.';

type Runner = (deps: IpcDeps, prompt: string, options: { timeoutMs?: number; plainCompletion?: boolean; temperature?: number }) => Promise<string>;

export interface MeetingLlmOptions {
  logTag?: string;
  /** 测试替身 */
  run?: Runner;
  fetchImpl?: typeof fetch;
}

async function e2eStub(prompt: string, json: boolean, timeoutMs: number, fetchImpl: typeof fetch): Promise<string | null | undefined> {
  const url = process.env.TOTALCLAW_E2E === '1' ? String(process.env.TOTALCLAW_E2E_LLM_URL || '') : '';
  if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) return undefined;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: 'meeting-mgmt', prompt, json }), signal: ctrl.signal });
    const data: any = await res.json();
    const text = String(data?.text ?? '').trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function createMeetingLlm(deps: IpcDeps, opts: MeetingLlmOptions = {}): MmLlm {
  const run: Runner = opts.run ?? ((d, p, o) => runOneshotChat(d, p, o));
  const fetchImpl = opts.fetchImpl ?? ((...a: Parameters<typeof fetch>) => globalThis.fetch(...a));
  const tag = opts.logTag || 'meeting-mgmt';
  return async (prompt, o = {}) => {
    const timeoutMs = Math.max(1_000, Number(o.timeoutMs) || MM_LLM_DEFAULT_TIMEOUT_MS);
    const text = o.json ? `${prompt}${JSON_DIRECTIVE}` : prompt;
    const stub = await e2eStub(text, !!o.json, timeoutMs, fetchImpl);
    if (stub !== undefined) return stub;
    // runOneshotChat 的 timeoutMs 是「最大空闲间隔」（有输出就续表）；再加一道总时长上限，防止慢吞吞一直不结束
    let timer: ReturnType<typeof setTimeout> | undefined;
    const wall = new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), timeoutMs * 4); });
    try {
      const reply = await Promise.race([run(deps, text, { timeoutMs, plainCompletion: true, temperature: 0 }), wall]);
      if (reply === null) {
        deps.logger?.warn?.(tag, 'llm wall timeout', { timeoutMs });
        return null;
      }
      const out = String(reply ?? '').trim();
      if (!out || isChannelErrorReply(out)) {
        if (out) deps.logger?.warn?.(tag, 'llm channel error reply', { head: out.slice(0, 200) });
        return null;
      }
      return out;
    } catch (error) {
      deps.logger?.warn?.(tag, 'llm unavailable', { error: (error as Error)?.message });
      return null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };
}
