import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { MmMeeting } from '../../../../shared/meetingMgmt/types';
import { enrollVoiceprint, exportSpeakerClip, AUDIO_FILE } from './voiceprint';
import { configureMeetingPipeline, __resetMeetingPipelineConfig } from './runtime';
import { readWavInfo, writeWav16k } from './audio';
import { FFMPEG, FFPROBE, fakeWorkerFactory, hasEncoder, speakerVector, speechExpr, synth, writeAmr } from './testHelpers';

// 每个用例都要起 ffmpeg 合成 / 解码音频，机器忙时会超过默认 5 秒
vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 });

function useRuntime(over: Record<string, unknown> = {}, worker = fakeWorkerFactory()) {
  configureMeetingPipeline({
    runtime: { ffmpeg: FFMPEG, ffprobe: FFPROBE, python: 'python-fake', campp: '/fake/campp.onnx', pluginsDir: '', whisperModelsDir: '', whisperModel: null, env: {}, ...over },
    createWorker: worker,
  });
}

function meetingWith(partial: Partial<MmMeeting>): MmMeeting {
  return {
    id: 'm1', projectId: 'p1', title: 't', time: 0, source: 'offline', hostId: 'u1', attendeeIds: [], createdBy: 'u1', createdAt: 0,
    status: 'pending_assign', files: [], speakers: [], segments: [], topics: [], decisions: [], summaryLines: [], confirmations: [], taskIds: [],
    ...partial,
  };
}

describe.skipIf(!FFMPEG || !FFPROBE)('enrollVoiceprint', () => {
  let dir = '';
  const speech12 = speechExpr({ duration: 12 });
  beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'mm-enroll-')); });
  afterAll(() => { if (dir) rmSync(dir, { recursive: true, force: true }); });
  beforeEach(() => useRuntime());
  afterEach(() => __resetMeetingPipelineConfig());

  const expectOk = (r: Awaited<ReturnType<typeof enrollVoiceprint>>, seconds: number) => {
    expect(r.ok, r.ok ? '' : (r as any).reason).toBe(true);
    if (!r.ok) return;
    expect(r.vector).toHaveLength(192);
    expect(Math.hypot(...r.vector)).toBeCloseTo(1, 5);
    expect(r.seconds).toBeGreaterThan(seconds - 0.3);
    expect(r.seconds).toBeLessThan(seconds + 0.3);
  };

  // 手机声纹页会上传的几种格式
  it('.amr（安卓系统录音机）', async () => {
    const p = join(dir, 'a.amr');
    writeAmr(p, 12);
    expectOk(await enrollVoiceprint(p), 12);
  });

  it.skipIf(!hasEncoder('aac'))('.m4a（iPhone 语音备忘录）', async () => {
    const p = join(dir, 'a.m4a');
    synth(p, speech12, 12, ['-c:a', 'aac', '-ar', '48000']);
    expectOk(await enrollVoiceprint(p), 12);
  });

  it.skipIf(!hasEncoder('aac'))('.mov（自拍视频，只取音轨）', async () => {
    const p = join(dir, 'a.mov');
    synth(p, speech12, 12, ['-c:v', 'mpeg4', '-c:a', 'aac', '-shortest'], true);
    expectOk(await enrollVoiceprint(p), 12);
  });

  it.skipIf(!hasEncoder('aac'))('.mp4（自拍视频，只取音轨）', async () => {
    const p = join(dir, 'a.mp4');
    synth(p, speech12, 12, ['-c:v', hasEncoder('libx264') ? 'libx264' : 'mpeg4', '-c:a', 'aac', '-shortest'], true);
    expectOk(await enrollVoiceprint(p), 12);
  });

  it.skipIf(!hasEncoder('libopus'))('.webm（网页内录音，opus）', async () => {
    const p = join(dir, 'a.webm');
    synth(p, speech12, 12, ['-c:a', 'libopus', '-ar', '48000']);
    expectOk(await enrollVoiceprint(p), 12);
  });

  it('只给有声部分提声纹，并且前后两半各提一次做一致性检查', async () => {
    const log: any[] = [];
    useRuntime({}, fakeWorkerFactory({ log }));
    const p = join(dir, 'b.wav');
    // 0.5 秒说、0.3 秒停（0.3 秒算停顿，0.15 秒以内的气口才会补上）
    synth(p, speechExpr({ duration: 12, burstOn: 0.5, burstOff: 0.3 }), 12, ['-c:a', 'pcm_s16le']);
    expectOk(await enrollVoiceprint(p), 12);
    const req = log.find(x => x.op === 'run');
    expect(req.slices).toHaveLength(3);
    // 有声部分约 7.5 秒（12 秒里 5/8 是发声）
    expect(req.slices[0][1]).toBeGreaterThan(6.5);
    expect(req.slices[0][1]).toBeLessThan(9);
    expect(req.spec.model).toBe('');
  });

  it('太短 / 太长', async () => {
    const short = join(dir, 'short.m4a');
    synth(short, speechExpr({ duration: 5 }), 5, ['-c:a', 'aac']);
    const r1 = await enrollVoiceprint(short);
    expect(r1.ok).toBe(false);
    expect((r1 as any).reason).toMatch(/太短/);
    const long = join(dir, 'long.m4a');
    synth(long, speechExpr({ duration: 25 }), 25, ['-c:a', 'aac']);
    expect((await enrollVoiceprint(long) as any).reason).toMatch(/太长/);
  });

  it('没有人声（几乎静音）', async () => {
    const p = join(dir, 'silent.wav');
    synth(p, '0.0005*(random(0)-0.5)', 12, ['-c:a', 'pcm_s16le']);
    const r = await enrollVoiceprint(p);
    expect(r.ok).toBe(false);
    expect((r as any).reason).toMatch(/声音太小|人声/);
  });

  it('噪声很大（全程嘈杂，听不出停顿）', async () => {
    const p = join(dir, 'noise.wav');
    synth(p, '0.3*(random(0)-0.5)', 12, ['-c:a', 'pcm_s16le']);
    const r = await enrollVoiceprint(p);
    expect(r.ok).toBe(false);
    expect((r as any).reason).toMatch(/噪音/);
  });

  it('声音过大削波', async () => {
    const p = join(dir, 'clip.wav');
    synth(p, `3*(${speechExpr({ duration: 12 })})`, 12, ['-c:a', 'pcm_s16le']);
    const r = await enrollVoiceprint(p);
    expect(r.ok).toBe(false);
    expect((r as any).reason).toMatch(/失真/);
  });

  it('前后两半不像同一个人：要求重录', async () => {
    useRuntime({}, fakeWorkerFactory({ emb: (_s, _e, k) => speakerVector(k === 2 ? 2 : 1, 0.05, k) }));
    const p = join(dir, 'mixed.wav');
    synth(p, speech12, 12, ['-c:a', 'pcm_s16le']);
    const r = await enrollVoiceprint(p);
    expect(r.ok).toBe(false);
    expect((r as any).reason).toMatch(/不止一个人/);
  });

  it('声纹模型没下载 / 文件不是音频 / 文件不存在', async () => {
    useRuntime({ campp: null });
    const p = join(dir, 'c.wav');
    synth(p, speech12, 12, ['-c:a', 'pcm_s16le']);
    expect((await enrollVoiceprint(p) as any).reason).toMatch(/声纹识别模型/);
    useRuntime();
    const bad = join(dir, 'bad.m4a');
    writeFileSync(bad, 'not audio at all');
    const r = await enrollVoiceprint(bad);
    expect(r.ok).toBe(false);
    expect((r as any).reason).toMatch(/解码失败|没有音轨/);
    expect((await enrollVoiceprint(join(dir, 'missing.m4a')) as any).reason).toMatch(/不存在/);
  });
});

describe.skipIf(!FFMPEG || !FFPROBE)('exportSpeakerClip', () => {
  let dir = '';
  beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'mm-clip-')); });
  afterAll(() => { if (dir) rmSync(dir, { recursive: true, force: true }); });
  beforeEach(() => useRuntime());
  afterEach(() => __resetMeetingPipelineConfig());

  const segs = [
    { id: 'seg_1', start: 1, end: 13, speakerLabel: 'S1', text: 'a' },
    { id: 'seg_2', start: 14, end: 16, speakerLabel: 'S2', text: 'b' },
    { id: 'seg_3', start: 20, end: 21.5, speakerLabel: 'S2', text: 'c' },
  ];

  it('长段里截 8 秒；不够 5 秒的把几段接起来', async () => {
    const work = join(dir, 'w1');
    mkdirSync(work, { recursive: true });
    writeWav16k(join(work, AUDIO_FILE), new Int16Array(16000 * 30).map((_, i) => Math.round(8000 * Math.sin(i / 10)) * ((i % 8000) < 5000 ? 1 : 0)));
    const m = meetingWith({ segments: segs });
    const c1 = await exportSpeakerClip({ meeting: m, label: 'S1', workDir: work });
    expect(c1).toBeTruthy();
    expect(readWavInfo(c1!).duration).toBeCloseTo(8, 1);
    const c2 = await exportSpeakerClip({ meeting: m, label: 'S2', workDir: work });
    expect(readWavInfo(c2!).duration).toBeCloseTo(2 + 0.3 + 1.5, 1);
    expect(await exportSpeakerClip({ meeting: m, label: 'S9', workDir: work })).toBeNull();
  });

  it('已有片段直接用；中间音频被清掉时从会议文件重新抽', async () => {
    const work = join(dir, 'w2');
    mkdirSync(work, { recursive: true });
    const src = join(dir, 'meeting.m4a');
    synth(src, speechExpr({ duration: 25 }), 25, ['-c:a', 'aac']);
    const m = meetingWith({ segments: segs, files: [{ id: 'f1', name: '会议.m4a', kind: 'audio', size: 1, path: src, uploadedAt: 0 }] });
    const c = await exportSpeakerClip({ meeting: m, label: 'S1', workDir: work });
    expect(c && existsSync(c)).toBe(true);
    expect(existsSync(join(work, AUDIO_FILE))).toBe(true);
    const again = await exportSpeakerClip({ meeting: { ...m, speakers: [{ label: 'S1', clipPath: c! }] }, label: 'S1', workDir: work });
    expect(again).toBe(c);
  });

  it('文字记录会议（没有音频）返回 null', async () => {
    const work = join(dir, 'w3');
    const txt = join(dir, 'notes.txt');
    writeFileSync(txt, '张三：你好');
    const m = meetingWith({ segments: segs, files: [{ id: 'f1', name: 'notes.txt', kind: 'transcript', size: 1, path: txt, uploadedAt: 0 }] });
    expect(await exportSpeakerClip({ meeting: m, label: 'S1', workDir: work })).toBeNull();
  });
});
