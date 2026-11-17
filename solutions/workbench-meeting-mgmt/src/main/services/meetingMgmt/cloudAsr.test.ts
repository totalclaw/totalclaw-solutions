/**
 * 在线语音识别接口：两种协议的请求格式（OpenAI 兼容 transcriptions / 百炼 chat-audio）、地址规范化、错误转中文。
 */
import { describe, expect, it, vi } from 'vitest';
import { cloudTranscribe, normalizeBaseUrl, silenceWav } from './cloudAsr';

const wav = silenceWav(0.5);
const okJson = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe('cloudTranscribe', () => {
  it('硅基流动 / OpenAI：multipart 传 file + model 到 /audio/transcriptions，取 text', async () => {
    const fetchImpl = vi.fn(async (_u: any, _i: any) => okJson({ text: ' 今天开个短会 ' }));
    const r = await cloudTranscribe({ provider: 'siliconflow', baseUrl: 'https://api.siliconflow.cn/v1/', model: 'TeleAI/TeleSpeechASR', apiKey: 'sk-1' }, wav, { fetchImpl: fetchImpl as any });
    expect(r).toEqual({ ok: true, text: '今天开个短会' });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://api.siliconflow.cn/v1/audio/transcriptions');
    expect(init.headers).toEqual({ Authorization: 'Bearer sk-1' });
    const form = init.body as FormData;
    expect(form.get('model')).toBe('TeleAI/TeleSpeechASR');
    const file = form.get('file') as File;
    expect(file.type).toBe('audio/wav');
    expect(file.size).toBe(wav.length);
  });

  it('百炼 Qwen3-ASR-Flash：JSON 发到 /chat/completions，音频是 wav data URI，文字在 choices[0].message.content', async () => {
    const fetchImpl = vi.fn(async (_u: any, _i: any) => okJson({ choices: [{ message: { role: 'assistant', content: '侬好，阿拉开会' } }] }));
    const r = await cloudTranscribe({ provider: 'dashscope', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen3-asr-flash', apiKey: 'sk-2' }, wav, { fetchImpl: fetchImpl as any });
    expect(r).toEqual({ ok: true, text: '侬好，阿拉开会' });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
    const body = JSON.parse(init.body);
    expect(body.model).toBe('qwen3-asr-flash');
    expect(body.messages[0].content[0].input_audio.data).toBe(`data:audio/wav;base64,${wav.toString('base64')}`);
    expect(body.stream).toBe(false);
  });

  it('错误转中文：401 Key 不对、404 地址或模型不对、429 太频繁、断网连不上、返回不是 JSON', async () => {
    const cfg = { provider: 'openai' as const, baseUrl: 'https://api.openai.com/v1', model: 'whisper-1', apiKey: 'k' };
    const resp = (status: number, body = '{"error":{"message":"bad"}}') => vi.fn(async () => new Response(body, { status }));
    expect((await cloudTranscribe(cfg, wav, { fetchImpl: resp(401) as any })).error).toContain('API Key 不对');
    expect((await cloudTranscribe(cfg, wav, { fetchImpl: resp(404) as any })).error).toContain('接口地址或模型名不对');
    expect((await cloudTranscribe(cfg, wav, { fetchImpl: resp(429) as any })).error).toContain('太频繁');
    expect((await cloudTranscribe(cfg, wav, { fetchImpl: resp(500, 'oops') as any })).error).toBe('HTTP 500：oops');
    expect((await cloudTranscribe(cfg, wav, { fetchImpl: vi.fn(async () => { throw new Error('ENOTFOUND'); }) as any })).error).toContain('连不上 api.openai.com');
    expect((await cloudTranscribe(cfg, wav, { fetchImpl: vi.fn(async () => new Response('<html>', { status: 200 })) as any })).error).toContain('不是 JSON');
    expect((await cloudTranscribe({ ...cfg, apiKey: '' }, wav)).error).toContain('API Key');
  });

  it('地址规范化：去掉结尾斜杠和误贴的接口路径；不是 http(s) 不认', () => {
    expect(normalizeBaseUrl('https://api.siliconflow.cn/v1/audio/transcriptions')).toBe('https://api.siliconflow.cn/v1');
    expect(normalizeBaseUrl(' https://x.cn/compatible-mode/v1/chat/completions/ ')).toBe('https://x.cn/compatible-mode/v1');
    expect(normalizeBaseUrl('ftp://x')).toBeNull();
    expect(normalizeBaseUrl('')).toBeNull();
  });
});
