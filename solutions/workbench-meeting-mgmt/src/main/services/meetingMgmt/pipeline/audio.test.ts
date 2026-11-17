import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  classifyMeetingFile, concatWav16k, convertToWav16k, frameEnergiesDb, looksLikeText, mediaKindByExt,
  probeMedia, readPcmRange, readWavInfo, writeWav16k,
} from './audio';
import { FFMPEG, FFPROBE, hasEncoder, speechExpr, synth, writeAmr } from './testHelpers';

// 每个用例都要起 ffmpeg 合成 / 解码音频，机器忙时会超过默认 5 秒
vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 });

describe('mediaKindByExt', () => {
  it('音频 / 视频 / 文字记录扩展名分类，大小写无关', () => {
    for (const e of ['mp3', 'M4A', 'wav', 'aac', 'amr', 'flac', 'ogg', 'opus', 'wma', 'caf', 'aiff', 'aif']) expect(mediaKindByExt(`a.${e}`)).toBe('audio');
    for (const e of ['mp4', 'MOV', 'mkv', 'avi', 'flv', 'wmv', 'm4v', '3gp']) expect(mediaKindByExt(`a.${e}`)).toBe('video');
    for (const e of ['txt', 'md', 'docx', 'srt', 'vtt', 'json']) expect(mediaKindByExt(`a.${e}`)).toBe('transcript');
    // webm 多是网页内录音（只有音轨）；带画面的也一样只抽音轨处理
    expect(mediaKindByExt('a.webm')).toBe('audio');
    expect(mediaKindByExt('a.xyz')).toBeNull();
    expect(mediaKindByExt('noext')).toBeNull();
  });
});

describe.skipIf(!FFMPEG || !FFPROBE)('ffmpeg 解码：各种格式统一转成 16k 单声道 wav', () => {
  let dir = '';
  const expr = speechExpr({ duration: 3 });
  beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'mm-audio-')); });
  afterAll(() => { if (dir) rmSync(dir, { recursive: true, force: true }); });

  // [扩展名, 额外参数, 需要的编码器, 是否带画面]
  const cases: Array<[string, string[], string | null, boolean]> = [
    ['mp3', ['-c:a', 'libmp3lame'], 'libmp3lame', false],
    ['m4a', ['-c:a', 'aac'], 'aac', false],
    ['wav', ['-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le'], null, false],
    ['aac', ['-c:a', 'aac', '-f', 'adts'], 'aac', false],
    ['flac', ['-c:a', 'flac'], 'flac', false],
    ['ogg', ['-c:a', 'libvorbis'], 'libvorbis', false],
    ['opus', ['-c:a', 'libopus'], 'libopus', false],
    ['wma', ['-c:a', 'wmav2'], 'wmav2', false],
    ['webm', ['-c:a', 'libopus', '-ar', '48000'], 'libopus', false],
    ['caf', ['-c:a', 'pcm_s16le', '-f', 'caf'], null, false],
    ['aiff', ['-c:a', 'pcm_s16be'], null, false],
    ['mp4', ['-c:v', 'mpeg4', '-c:a', 'aac', '-shortest'], 'aac', true],
    ['mov', ['-c:v', 'mpeg4', '-c:a', 'aac', '-shortest'], 'aac', true],
    ['mkv', ['-c:v', 'mpeg4', '-c:a', 'libopus', '-shortest'], 'libopus', true],
    ['avi', ['-c:v', 'mpeg4', '-c:a', 'libmp3lame', '-shortest'], 'libmp3lame', true],
    ['flv', ['-c:v', 'flv', '-c:a', 'aac', '-ar', '44100', '-shortest'], 'flv', true],
    ['wmv', ['-c:v', 'wmv2', '-c:a', 'wmav2', '-shortest'], 'wmv2', true],
    ['m4v', ['-c:v', 'mpeg4', '-c:a', 'aac', '-f', 'mp4', '-shortest'], 'aac', true],
    ['3gp', ['-c:v', 'h263', '-s', '176x144', '-c:a', 'aac', '-ar', '16000', '-shortest'], 'h263', true],
  ];

  for (const [ext, extra, enc, video] of cases) {
    it.skipIf(!!enc && !hasEncoder(enc))(`.${ext}${video ? '（视频，先抽音轨）' : ''}`, async () => {
      const src = join(dir, `in.${ext}`);
      synth(src, expr, 3, extra, video);
      const c = await classifyMeetingFile(src, `会议.${ext}`, FFPROBE);
      expect(c?.kind).toBe(mediaKindByExt(`a.${ext}`));
      const out = join(dir, `out-${ext}.wav`);
      await convertToWav16k(FFMPEG!, src, out, `会议.${ext}`);
      const info = readWavInfo(out);
      expect(info.sampleRate).toBe(16000);
      expect(info.channels).toBe(1);
      expect(info.bitsPerSample).toBe(16);
      expect(info.duration).toBeGreaterThan(2.7);
      expect(info.duration).toBeLessThan(3.4);
      const db = frameEnergiesDb(out, info);
      expect(Math.max(...db)).toBeGreaterThan(-25);
    });
  }

  it('.amr（安卓系统录音机）', async () => {
    const src = join(dir, 'in.amr');
    writeAmr(src, 4);
    expect((await classifyMeetingFile(src, '录音.amr', FFPROBE))?.kind).toBe('audio');
    const out = join(dir, 'out-amr.wav');
    await convertToWav16k(FFMPEG!, src, out, '录音.amr');
    const info = readWavInfo(out);
    expect(info.sampleRate).toBe(16000);
    expect(info.duration).toBeGreaterThan(3.9);
    expect(info.duration).toBeLessThan(4.1);
  });

  it('不认识的扩展名：ffprobe 探到音轨就当音频', async () => {
    const src = join(dir, 'in.m4a');
    synth(src, expr, 2, ['-c:a', 'aac']);
    const odd = join(dir, 'recording.bin');
    copyFileSync(src, odd);
    const p = await probeMedia(FFPROBE!, odd);
    expect(p?.hasAudio).toBe(true);
    expect((await classifyMeetingFile(odd, 'recording.bin', FFPROBE))?.kind).toBe('audio');
  });

  it('不认识的扩展名、不是媒体：是文本就当文字记录，否则返回 null', async () => {
    const txt = join(dir, 'notes.xyz');
    writeFileSync(txt, '张三：大家好\n李四：开始吧\n');
    expect(looksLikeText(txt)).toBe(true);
    expect((await classifyMeetingFile(txt, 'notes.xyz', FFPROBE))?.kind).toBe('transcript');
    const bin = join(dir, 'blob.xyz');
    writeFileSync(bin, Buffer.from(Array.from({ length: 2000 }, (_, i) => (i * 37) % 256)));
    expect(await classifyMeetingFile(bin, 'blob.xyz', FFPROBE)).toBeNull();
  });

  it('只有画面没有音轨的录屏：报「没有音轨」', async () => {
    const src = join(dir, 'mute.mp4');
    const { execFileSync } = await import('child_process');
    execFileSync(FFMPEG!, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc=size=160x120:rate=10:duration=1', '-c:v', 'mpeg4', src]);
    await expect(convertToWav16k(FFMPEG!, src, join(dir, 'mute.wav'), '录屏.mp4')).rejects.toThrow(/没有音轨/);
  });

  it('切段用的能量先滤掉低频底噪：50Hz 嗡声压下去 15dB 以上，1kHz（人声频段）基本不变', () => {
    const p = join(dir, 'hum.wav');
    const pcm = new Int16Array(32000);
    for (let i = 0; i < pcm.length; i++) {
      const t = i / 16000;
      pcm[i] = Math.round(6000 * Math.sin(2 * Math.PI * 50 * t) + (t >= 1 ? 3000 * Math.sin(2 * Math.PI * 1000 * t) : 0));
    }
    writeWav16k(p, pcm);
    const info = readWavInfo(p);
    const raw = frameEnergiesDb(p, info);
    const hp = frameEnergiesDb(p, info, 10, { highPassHz: 200 });
    const avg = (a: Float32Array, from: number, to: number) => { let s = 0; for (let i = from; i < to; i++) s += a[i]!; return s / (to - from); };
    expect(avg(raw, 20, 90) - avg(hp, 20, 90)).toBeGreaterThan(15);
    // 后一秒是嗡声 + 1kHz：高通后剩下的基本就是 1kHz 那部分（-23dB 上下）
    expect(Math.abs(avg(hp, 120, 190) - 10 * Math.log10((3000 / 32768) ** 2 / 2))).toBeLessThan(1.5);
  });

  it('多份 wav 首尾相接、按秒读出 PCM', async () => {
    const a = join(dir, 'a.wav');
    const b = join(dir, 'b.wav');
    writeWav16k(a, new Int16Array(16000).fill(1000));
    writeWav16k(b, new Int16Array(8000).fill(-2000));
    const out = join(dir, 'ab.wav');
    const offsets = await concatWav16k([a, b], out);
    expect(offsets).toEqual([0, 1]);
    const info = readWavInfo(out);
    expect(info.duration).toBeCloseTo(1.5, 3);
    const pcm = readPcmRange(out, info, 0.9, 1.1);
    expect(pcm.length).toBe(3200);
    expect(pcm[0]).toBe(1000);
    expect(pcm[3199]).toBe(-2000);
  });
});
