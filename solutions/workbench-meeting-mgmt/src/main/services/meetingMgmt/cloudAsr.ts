/**
 * 会议智能管理 · 在线语音识别接口（用户在配置引导 / 系统设置里自己填）。
 *
 * 两种协议：
 *   - transcriptions：OpenAI 兼容的 POST {baseUrl}/audio/transcriptions（multipart：file + model），回 { text }。
 *     硅基流动（SenseVoiceSmall / TeleSpeechASR 方言）、OpenAI、Groq 和大多数自建网关都是这个。
 *   - chat-audio：阿里云百炼 Qwen3-ASR-Flash 的 OpenAI 兼容模式，POST {baseUrl}/chat/completions，
 *     音频放在 user 消息的 input_audio（data URI，base64 后要小于 10MB），文字在 choices[0].message.content。
 *
 * 只有转写走在线接口；声纹（认人）一直在本机算。录音按停顿切好的片段（每片 ≤ 20 秒）逐片上传。
 * 这里的错误文案给界面直接显示（中文）。
 */
import { t as i18nT } from '@totalclaw/i18n';

export type CloudAsrProtocol = 'transcriptions' | 'chat-audio';
export type CloudAsrProvider = 'dashscope' | 'siliconflow' | 'openai' | 'custom';

export interface CloudAsrPreset {
  id: CloudAsrProvider;
  protocol: CloudAsrProtocol;
  baseUrl: string;
  models: string[];
  /** 去哪拿 API Key（给界面显示） */
  keyUrl: string;
}

export const CLOUD_ASR_PRESETS: CloudAsrPreset[] = [
  // 百炼新开的工作空间也可能给形如 https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1 的地址，界面上可以改
  { id: 'dashscope', protocol: 'chat-audio', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen3-asr-flash'], keyUrl: 'https://bailian.console.aliyun.com/?tab=model#/api-key' },
  { id: 'siliconflow', protocol: 'transcriptions', baseUrl: 'https://api.siliconflow.cn/v1', models: ['FunAudioLLM/SenseVoiceSmall', 'TeleAI/TeleSpeechASR'], keyUrl: 'https://cloud.siliconflow.cn/account/ak' },
  { id: 'openai', protocol: 'transcriptions', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o-transcribe', 'whisper-1'], keyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'custom', protocol: 'transcriptions', baseUrl: '', models: [], keyUrl: '' },
];

export function cloudAsrPreset(id: string | undefined): CloudAsrPreset {
  return CLOUD_ASR_PRESETS.find((p) => p.id === id) ?? CLOUD_ASR_PRESETS[CLOUD_ASR_PRESETS.length - 1]!;
}

export interface CloudAsrConfig {
  provider: CloudAsrProvider;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface CloudAsrResult { ok: boolean; text?: string; error?: string; status?: number }

/** baseUrl 规范化：去掉结尾的 / 和误贴的 /audio/transcriptions、/chat/completions；只认 http(s) */
export function normalizeBaseUrl(raw: string): string | null {
  let u = String(raw || '').trim().replace(/\/+$/, '');
  u = u.replace(/\/(audio\/transcriptions|chat\/completions)$/i, '');
  if (!/^https?:\/\/[^\s/]+/i.test(u)) return null;
  return u;
}

function httpErrorText(status: number, detail: string): string {
  if (status === 401 || status === 403) return i18nT('API Key 不对、已失效，或者这个账号没有开通该模型');
  if (status === 404) return i18nT('接口地址或模型名不对（{p0}）', { p0: detail || status });
  if (status === 413) return i18nT('上传的音频太大，接口拒收');
  if (status === 429) return i18nT('请求太频繁或额度用完了，稍后再试');
  return `HTTP ${status}${detail ? `：${detail}` : ''}`;
}

/** 接口回的错误说明（OpenAI 风格 {error:{message}} / 百炼 {message} / 纯文本）截短 */
function errorDetail(body: string): string {
  try {
    const j = JSON.parse(body);
    return String(j?.error?.message || j?.message || j?.error || '').slice(0, 160);
  } catch {
    return body.replace(/\s+/g, ' ').trim().slice(0, 160);
  }
}

/** chat-audio 回的 content 可能是字符串，也可能是 [{type:'text',text}] */
function contentText(c: unknown): string {
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map((x) => (typeof x === 'string' ? x : String((x as any)?.text ?? ''))).join('');
  return '';
}

/**
 * 转写一段 16k 单声道 wav。超时 / 断网 / HTTP 错误都回 { ok:false, error }（不抛）。
 */
export async function cloudTranscribe(
  cfg: CloudAsrConfig, wav: Buffer, opts: { fetchImpl?: typeof fetch; timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<CloudAsrResult> {
  const base = normalizeBaseUrl(cfg.baseUrl);
  if (!base) return { ok: false, error: i18nT('在线接口地址不对，请填 http:// 或 https:// 开头的地址') };
  if (!cfg.model.trim()) return { ok: false, error: i18nT('请填写在线接口的模型名') };
  if (!cfg.apiKey.trim()) return { ok: false, error: i18nT('请填写在线接口的 API Key') };
  const preset = cloudAsrPreset(cfg.provider);
  const fetchImpl = opts.fetchImpl ?? fetch;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), opts.timeoutMs ?? 60_000);
  const onAbort = () => ctl.abort();
  opts.signal?.addEventListener('abort', onAbort);
  try {
    let res: Response;
    if (preset.protocol === 'chat-audio') {
      res = await fetchImpl(`${base}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.apiKey.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cfg.model.trim(),
          messages: [{ role: 'user', content: [{ type: 'input_audio', input_audio: { data: `data:audio/wav;base64,${wav.toString('base64')}` } }] }],
          stream: false,
          asr_options: { enable_itn: true },
        }),
        signal: ctl.signal,
      });
    } else {
      const form = new FormData();
      form.append('file', new Blob([new Uint8Array(wav)], { type: 'audio/wav' }), 'audio.wav');
      form.append('model', cfg.model.trim());
      res = await fetchImpl(`${base}/audio/transcriptions`, {
        method: 'POST', headers: { Authorization: `Bearer ${cfg.apiKey.trim()}` }, body: form, signal: ctl.signal,
      });
    }
    const body = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: httpErrorText(res.status, errorDetail(body)) };
    let j: any;
    try { j = JSON.parse(body); } catch { return { ok: false, error: i18nT('在线接口返回的不是 JSON，地址可能填错了') }; }
    const text = preset.protocol === 'chat-audio' ? contentText(j?.choices?.[0]?.message?.content) : String(j?.text ?? '');
    return { ok: true, text: text.trim() };
  } catch (e) {
    if (opts.signal?.aborted) return { ok: false, error: i18nT('已取消') };
    if (ctl.signal.aborted) return { ok: false, error: i18nT('在线接口超时没有响应') };
    const host = (() => { try { return new URL(base).host; } catch { return base; } })();
    return { ok: false, error: i18nT('连不上 {p0}：{p1}', { p0: host, p1: (e as Error)?.message || String(e) }) };
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }
}

/** 测试连接用的 1 秒静音 wav（16k 单声道）：能拿到 200 就说明地址 / Key / 模型都对 */
export function silenceWav(seconds = 1): Buffer {
  const samples = Math.round(16000 * seconds);
  const buf = Buffer.alloc(44 + samples * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + samples * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(16000, 24); buf.writeUInt32LE(32000, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(samples * 2, 40);
  return buf;
}
