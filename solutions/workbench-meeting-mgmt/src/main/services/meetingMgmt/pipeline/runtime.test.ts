import { afterEach, describe, expect, it } from 'vitest';
import { asrModelArg, autoParallelism, configureMeetingPipeline, pickMeetingAsrEngine, resolveMeetingRuntime, __resetMeetingPipelineConfig } from './runtime';

describe('autoParallelism', () => {
  afterEach(() => {
    delete process.env.TOTALCLAW_MEETING_ASR_WORKERS;
    delete process.env.TOTALCLAW_MEETING_ASR_BATCH;
  });

  it('大模型一批片数少、进程数受内存限制；小模型一批 12 片', () => {
    const big = autoParallelism('large-v3');
    const small = autoParallelism('small');
    expect(big.workers).toBeGreaterThanOrEqual(1);
    expect(big.workers).toBeLessThanOrEqual(3);
    expect(big.batch).toBeLessThanOrEqual(8);
    expect(small.batch).toBe(12);
    expect(small.workers).toBeGreaterThanOrEqual(big.workers);
    expect(big.threads).toBeGreaterThanOrEqual(2);
    expect(big.threads).toBeLessThanOrEqual(6);
  });

  it('环境变量可以手动指定进程数和一批片数', () => {
    process.env.TOTALCLAW_MEETING_ASR_WORKERS = '1';
    process.env.TOTALCLAW_MEETING_ASR_BATCH = '2';
    expect(autoParallelism('large-v3')).toMatchObject({ workers: 1, batch: 2 });
    expect(autoParallelism('large-v3', 2).workers).toBe(2);
  });
});

describe('resolveMeetingRuntime', () => {
  afterEach(() => __resetMeetingPipelineConfig());
  it('整份注入时不去加载依赖 electron 的模块', async () => {
    configureMeetingPipeline({ runtime: { ffmpeg: '/x/ffmpeg', python: null } });
    const rt = await resolveMeetingRuntime();
    expect(rt.ffmpeg).toBe('/x/ffmpeg');
    expect(rt.python).toBeNull();
    expect(rt.campp).toBeNull();
  });
});

describe('会议转写用哪个模型', () => {
  const all = { whisperModel: 'large-v3', senseVoiceDir: '/m/sv', fireRedDir: '/m/fr' };
  it('自动：FireRedASR2 装了且内存够 → 它（带 SenseVoice 兜底）；内存不够 → SenseVoice 并说明；只装 SenseVoice → SenseVoice', () => {
    expect(pickMeetingAsrEngine(all, 'auto', 'zh', 24)).toEqual({ engine: 'firered' });
    expect(pickMeetingAsrEngine(all, 'auto', 'yue', 24)).toEqual({ engine: 'firered' });
    expect(pickMeetingAsrEngine(all, 'auto', 'zh', 8)).toEqual({ engine: 'sensevoice', note: 'firered_low_mem' });
    expect(pickMeetingAsrEngine({ whisperModel: 'large-v3', senseVoiceDir: '/m/sv' }, 'auto', 'zh', 24)).toEqual({ engine: 'sensevoice' });
    expect(JSON.parse(asrModelArg('firered', all).slice('sherpa:'.length))).toEqual({ kind: 'fire_red_aed', dir: '/m/fr', svDir: '/m/sv' });
    expect(JSON.parse(asrModelArg('sensevoice', all).slice('sherpa:'.length))).toEqual({ kind: 'sense_voice', dir: '/m/sv' });
    expect(asrModelArg('whisper', all)).toBe('large-v3');
  });
  it('它们都不认的语种（阿拉伯语）走 Whisper；一个本机模型都没有 → null', () => {
    expect(pickMeetingAsrEngine(all, 'auto', 'ar', 24)).toEqual({ engine: 'whisper', note: 'lang_unsupported' });
    expect(pickMeetingAsrEngine({ whisperModel: null, senseVoiceDir: '/m/sv' }, 'auto', 'ar', 24)).toEqual({ engine: 'sensevoice', note: 'lang_unsupported' });
    expect(pickMeetingAsrEngine({ whisperModel: null }, 'auto', 'zh', 24)).toEqual({ engine: null });
  });
  it('设置里指定了模型：装了就用（内存小也照用）；没装说明一下并按自动挑', () => {
    expect(pickMeetingAsrEngine(all, 'sensevoice', 'zh', 24)).toEqual({ engine: 'sensevoice' });
    expect(pickMeetingAsrEngine(all, 'firered', 'zh', 8)).toEqual({ engine: 'firered' });
    expect(pickMeetingAsrEngine(all, 'whisper', 'zh', 24)).toEqual({ engine: 'whisper' });
    expect(pickMeetingAsrEngine({ whisperModel: 'large-v3', senseVoiceDir: '/m/sv' }, 'firered', 'zh', 24)).toEqual({ engine: 'sensevoice', note: 'pref_missing' });
  });
  it('并行：SenseVoice 一批 8 片、最多 2 个进程；FireRedASR2 内存不到 32GB 只开 1 个进程', () => {
    const sv = autoParallelism(asrModelArg('sensevoice', all), undefined, { cores: 18, memGb: 24 });
    expect(sv).toMatchObject({ workers: 2, batch: 8 });
    expect(autoParallelism(asrModelArg('firered', all), undefined, { cores: 18, memGb: 24 })).toMatchObject({ workers: 1, threads: 8, batch: 4 });
    expect(autoParallelism(asrModelArg('firered', all), undefined, { cores: 18, memGb: 64 }).workers).toBe(2);
  });
});
