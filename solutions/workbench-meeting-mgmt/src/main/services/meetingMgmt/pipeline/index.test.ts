import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { MmMeetingFile, MmPerson, MmProcessStage } from '../../../../shared/meetingMgmt/types';
import { buildSegments, cleanAsrText, configureMeetingPipeline, echoesPrompt, runMeetingPipeline, simplifyZh } from './index';
import { __resetMeetingPipelineConfig } from './runtime';
import { readWavInfo } from './audio';
import { AUDIO_FILE } from './voiceprint';
import { FFMPEG, FFPROBE, fakeWorkerFactory, hasEncoder, speakerVector, speechExpr, synth } from './testHelpers';

// 每个用例都要起 ffmpeg 合成 / 解码音频，机器忙时会超过默认 5 秒
vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 });

const attendees: MmPerson[] = [
  { id: 'u1', name: '林晓', deptId: 'd1' },
  { id: 'u2', name: '王建国', deptId: 'd2' },
];

/** 合成会议：A 说 0~12 秒（5.5 秒处停一下），B 说 13~25 秒（18.5 秒处停一下），A 再说 26~34 秒 */
const MEETING_EXPR = speechExpr({ duration: 34, silences: [[5.5, 6.2], [12, 13], [18.5, 19.2], [25, 26]] });
const who = (s: number, e: number) => { const m = (s + e) / 2; return m < 12.5 || m > 25.5 ? 'A' : 'B'; };
const ROOM = speakerVector(99);
const voice = (spk: number, salt: number) => { const v = speakerVector(spk, 0.4, salt).map((x, k) => x + 0.7 * ROOM[k]!); const n = Math.hypot(...v); return v.map(x => x / n); };
const fakeText = (s: number, e: number) => {
  if (who(s, e) === 'B') return s < 18 ? '研发部负责完成接口开发。' : '我们需要在月底前完成联调。';
  if (s > 25) return '好的，那就这么定。';
  // 第二片带上 Whisper 静音幻听常见的提示词回声
  return s < 5 ? '今天讨论二期上线。' : '以下是普通话的会议发言，请使用简体中文转写。我们决定下周上线。';
};

function useRuntime(over: Record<string, unknown> = {}, worker = fakeWorkerFactory({ text: fakeText, emb: (s, e, k) => voice(who(s, e) === 'A' ? 1 : 2, Math.round(s * 10) + k) })) {
  configureMeetingPipeline({
    runtime: { ffmpeg: FFMPEG, ffprobe: FFPROBE, python: 'python-fake', campp: '/fake/campp.onnx', pluginsDir: '', whisperModelsDir: '', whisperModel: 'large-v3', detectModel: 'small', env: {}, ...over },
    createWorker: worker,
  });
}

function file(path: string, name: string, kind: MmMeetingFile['kind'] = 'audio'): MmMeetingFile {
  return { id: name, name, kind, size: 1, path, uploadedAt: 0 };
}

describe('cleanAsrText / buildSegments', () => {
  it('中文之间的空格去掉，提示词回声和静音幻听整句丢掉', () => {
    expect(cleanAsrText('大家 好 。 今天 开会')).toBe('大家好。今天开会');
    expect(cleanAsrText('以下是普通话的会议发言，请使用简体中文转写。我们开始。')).toBe('我们开始。');
    expect(cleanAsrText('谢谢观看！')).toBe('');
    expect(cleanAsrText('林晓、王建国。', ['林晓', '王建国'])).toBe('');
    expect(cleanAsrText('Hello world. OK')).toBe('Hello world. OK');
  });

  it('识别「只念了提示词」的片；繁体转大陆简体，非中文不动', () => {
    const prompt = '林晓、王建国。以下是普通话的会议发言，请使用简体中文转写。';
    expect(echoesPrompt('请使用简体中文转写。', prompt)).toBe(true);
    expect(echoesPrompt('以下是普通话的会议发言 请使用简体中文转写', prompt)).toBe(true);
    expect(echoesPrompt('林晓、王建国。', prompt)).toBe(true);
    expect(echoesPrompt('我们决定下周上线。', prompt)).toBe(false);
    expect(echoesPrompt('好。', prompt)).toBe(false); // 太短的句子不算
    expect(echoesPrompt('请使用简体中文转写。', '')).toBe(false);
    expect(simplifyZh('我們決定下週上線，這個項目由研發部負責。', 'zh')).toBe('我们决定下周上线，这个项目由研发部负责。');
    expect(simplifyZh('我們', null)).toBe('我们');
    expect(simplifyZh('我們', 'ja')).toBe('我們');
    // 半角标点挨着汉字的换全角；数字、时间、英文不动
    expect(simplifyZh('今天开个短会,主要对齐两件事。周婷,你先说?好的! 时间:10:30,金额1,000元;OK, fine.', 'zh'))
      .toBe('今天开个短会，主要对齐两件事。周婷，你先说？好的！时间：10:30，金额1,000元；OK, fine.');
  });

  it('连续同一人的片合并；空文字的片跳过；停顿太久另起一段', () => {
    const slices = [[0, 5], [6, 10], [11, 15], [16, 20], [40, 45]].map(([s, e]) => ({ start: s!, end: e! }));
    const segs = buildSegments(slices, ['甲一', '甲二', '', '乙一', '乙二'], ['S1', 'S1', 'S2', 'S2', 'S2']);
    expect(segs.map(s => [s.speakerLabel, s.start, s.end, s.text])).toEqual([
      ['S1', 0, 10, '甲一甲二'], ['S2', 16, 20, '乙一'], ['S2', 40, 45, '乙二'],
    ]);
    expect(segs.map(s => s.id)).toEqual(['seg_1', 'seg_2', 'seg_3']);
  });
});

describe.skipIf(!FFMPEG || !FFPROBE || !hasEncoder('aac'))('runMeetingPipeline', () => {
  let dir = '';
  let m4a = '';
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'mm-pipe-'));
    m4a = join(dir, 'meeting.m4a');
    synth(m4a, MEETING_EXPR, 34, ['-c:a', 'aac']);
  });
  afterAll(() => { if (dir) rmSync(dir, { recursive: true, force: true }); });
  afterEach(() => __resetMeetingPipelineConfig());

  it('录音：切片 → 转写 + 声纹 → 认人 / 聚类 → 合并成发言段 → 试听片段 → 规则整理', async () => {
    useRuntime();
    const stages: Array<[MmProcessStage, number, string | undefined]> = [];
    const work = join(dir, 'w1');
    const r = await runMeetingPipeline({
      meetingId: 'm1', workDir: work, files: [file(m4a, '会议录音.m4a')], attendees,
      voiceprints: [{ personId: 'u2', vector: voice(2, 9999), consentAt: 0, enrolledAt: 0, sampleSeconds: 12 }, { personId: 'outsider', vector: voice(1, 5), consentAt: 0, enrolledAt: 0, sampleSeconds: 12 }],
      threshold: 0.5, asr: 'local', llm: async () => null,
      onStage: (s, p, t) => stages.push([s, p, t]),
    });
    expect(r.durationSec).toBe(34);
    expect(r.segments.map(s => s.speakerLabel)).toEqual(['S1', 'S2', 'S1']);
    expect(r.segments[0]!.text).toBe('今天讨论二期上线。我们决定下周上线。');
    expect(r.segments[1]!.text).toBe('研发部负责完成接口开发。我们需要在月底前完成联调。');
    expect(r.segments[1]!.start).toBeGreaterThan(12.5);
    expect(r.segments[1]!.end).toBeLessThan(25.5);
    // B 有本场参会人的声纹 → 认出；A 的声纹不在参会人里（outsider 被过滤），留给主持人指认
    expect(r.speakers).toHaveLength(2);
    expect(r.speakers[0]).toMatchObject({ label: 'S1' });
    expect(r.speakers[0]!.personId).toBeUndefined();
    expect(r.speakers[1]).toMatchObject({ label: 'S2', personId: 'u2', matchedBy: 'voiceprint' });
    for (const sp of r.speakers) {
      expect(sp.clipPath && existsSync(sp.clipPath)).toBe(true);
      const d = readWavInfo(sp.clipPath!).duration;
      expect(d).toBeGreaterThanOrEqual(4.5);
      expect(d).toBeLessThanOrEqual(8.01);
    }
    expect(existsSync(join(work, AUDIO_FILE))).toBe(true);
    // 规则兜底整理
    expect(r.topics).toHaveLength(1);
    expect(r.decisions.map(d => d.text)).toEqual(['我们决定下周上线。', '研发部负责完成接口开发。', '我们需要在月底前完成联调。']);
    expect(r.summaryLines.length).toBeGreaterThan(0);
    // 进度只增不减、最后是 done 100
    const ps = stages.map(s => s[1]);
    expect(ps).toEqual(ps.slice().sort((a, b) => a - b));
    expect(stages[stages.length - 1]!.slice(0, 2)).toEqual(['done', 100]);
    expect(stages.some(s => s[0] === 'transcribe')).toBe(true);
    expect(stages.some(s => s[0] === 'diarize')).toBe(true);
    expect(stages.some(s => /按停顿切成 \d+ 段/.test(s[2] || ''))).toBe(true);
  });

  it('带提示时只念出提示语的片：不带提示重转（只转写不再提声纹），繁体转简体，内容不丢', async () => {
    const log: Array<{ op: string; slices: number[][]; spec: any }> = [];
    const reqs: any[] = [];
    const base = fakeWorkerFactory({
      log,
      // B 的两片带提示时只念提示；不带提示时出繁体
      text: (s, e, prompt) => {
        if (who(s, e) !== 'B') return fakeText(s, e);
        if (prompt) return '请使用简体中文转写。';
        return s < 18 ? '研發部負責完成接口開發。' : '我們需要在月底前完成聯調。';
      },
      emb: (s, e, k) => voice(who(s, e) === 'A' ? 1 : 2, Math.round(s * 10) + k),
    });
    useRuntime({}, (spec) => {
      const w = base(spec);
      const req = w.request.bind(w);
      w.request = async (r: any, onItem: any) => { reqs.push(r); return req(r, onItem); };
      return w;
    });
    const texts: string[] = [];
    const r = await runMeetingPipeline({
      meetingId: 'mr', workDir: join(dir, 'wr'), files: [file(m4a, '会议录音.m4a')], attendees, voiceprints: [],
      threshold: 0.5, asr: 'local', llm: async () => null, onStage: (_s, _p, t) => { if (t) texts.push(t); },
    });
    expect(r.segments.map(s => s.speakerLabel)).toEqual(['S1', 'S2', 'S1']);
    expect(r.segments[1]!.text).toBe('研发部负责完成接口开发。我们需要在月底前完成联调。');
    // A 的第二片前面带提示回声、后面有正文：也重转，但重转没多出字就保留第一遍
    expect(r.segments[0]!.text).toBe('今天讨论二期上线。我们决定下周上线。');
    // 重转的请求：不带提示、不提声纹，只送念了提示的 3 片（B 两片 + A 一片）
    const retries = reqs.filter(q => q.op === 'run' && q.prompt === '');
    expect(retries.length).toBeGreaterThan(0);
    expect(retries.every(q => q.emb === false)).toBe(true);
    expect(retries.flatMap(q => q.slices).length).toBe(3);
    expect(texts.some(t => /有 3 段只识别出了提示语/.test(t))).toBe(true);
    expect(texts.some(t => /找回 2 段/.test(t))).toBe(true);
  });

  it('多份文件按上传顺序接起来；录音和文字记录同时上传时以录音为准', async () => {
    useRuntime();
    const wav = join(dir, 'part2.wav');
    synth(wav, speechExpr({ duration: 6 }), 6, ['-c:a', 'pcm_s16le', '-ar', '44100']);
    const txt = join(dir, 'notes.txt');
    writeFileSync(txt, '林晓：这段不应该被用到。');
    const texts: string[] = [];
    const r = await runMeetingPipeline({
      meetingId: 'm2', workDir: join(dir, 'w2'), files: [file(m4a, 'a.m4a'), file(wav, 'b.wav'), file(txt, 'notes.txt', 'transcript')], attendees, voiceprints: [],
      threshold: 0.5, asr: 'local', llm: async () => null, onStage: (_s, _p, t) => { if (t) texts.push(t); },
    });
    expect(r.durationSec).toBe(40);
    expect(r.segments[r.segments.length - 1]!.end).toBeGreaterThan(34);
    expect(r.segments.some(s => s.text.includes('不应该'))).toBe(false);
    expect(texts.some(t => /以录音为准/.test(t))).toBe(true);
  });

  it('agent 转写：文字来自注入的转写函数，声纹仍在本机提', async () => {
    const log: any[] = [];
    useRuntime({}, fakeWorkerFactory({ log, emb: (s, e, k) => voice(who(s, e) === 'A' ? 1 : 2, k) }));
    let calls = 0;
    configureMeetingPipeline({ agentTranscribe: async (b64) => { calls++; expect(b64.length).toBeGreaterThan(100); return { ok: true, text: '来自 agent 的转写。' }; } });
    const r = await runMeetingPipeline({
      meetingId: 'm3', workDir: join(dir, 'w3'), files: [file(m4a, 'a.m4a')], attendees, voiceprints: [], threshold: 0.5, asr: 'agent', llm: async () => null, onStage: () => {},
    });
    expect(calls).toBeGreaterThanOrEqual(4);
    expect(r.segments.every(s => s.text.startsWith('来自 agent 的转写。'))).toBe(true);
    expect(log.every(l => l.spec.model === '')).toBe(true);
    expect(new Set(r.segments.map(s => s.speakerLabel)).size).toBe(2);
  });

  it('没有声纹模型：不区分发言人，全部归 S1', async () => {
    useRuntime({ campp: null });
    const texts: string[] = [];
    const r = await runMeetingPipeline({ meetingId: 'm4', workDir: join(dir, 'w4'), files: [file(m4a, 'a.m4a')], attendees, voiceprints: [], threshold: 0.5, asr: 'local', llm: async () => null, onStage: (_s, _p, t) => { if (t) texts.push(t); } });
    expect(new Set(r.segments.map(s => s.speakerLabel))).toEqual(new Set(['S1']));
    expect(r.speakers).toHaveLength(1);
    expect(texts.some(t => /未下载声纹识别模型/.test(t))).toBe(true);
  });

  it('模型可用时用模型整理的结果', async () => {
    useRuntime();
    const r = await runMeetingPipeline({
      meetingId: 'm5', workDir: join(dir, 'w5'), files: [file(m4a, 'a.m4a')], attendees, voiceprints: [], threshold: 0.5, asr: 'local', onStage: () => {},
      llm: async () => JSON.stringify({ topics: [{ title: '二期上线', segments: [1, 2, 3] }], decisions: [{ text: '下周上线', segments: [1] }], summary: ['决定下周上线', '研发部负责接口', '月底前联调'] }),
    });
    expect(r.topics.map(t => t.title)).toEqual(['二期上线']);
    expect(r.decisions).toEqual([{ id: 'dc_1', text: '下周上线', segmentIds: ['seg_1'] }]);
    expect(r.summaryLines).toEqual(['决定下周上线', '研发部负责接口', '月底前联调']);
    expect(r.segments.every(s => s.topicId === 'tp_1')).toBe(true);
  });

  it('出错都是中文：文件不在 / 没有音轨 / 格式不支持 / 模型没下载 / 取消', async () => {
    useRuntime();
    const base = { meetingId: 'mx', workDir: join(dir, 'wx'), attendees, voiceprints: [], threshold: 0.5, asr: 'local' as const, llm: async () => null, onStage: () => {} };
    await expect(runMeetingPipeline({ ...base, files: [] })).rejects.toThrow(/还没有上传/);
    await expect(runMeetingPipeline({ ...base, files: [file(join(dir, 'nope.m4a'), 'nope.m4a')] })).rejects.toThrow(/已不在本机/);
    const mute = join(dir, 'mute.mp4');
    const { execFileSync } = await import('child_process');
    execFileSync(FFMPEG!, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc=size=160x120:rate=10:duration=1', '-c:v', 'mpeg4', mute]);
    await expect(runMeetingPipeline({ ...base, files: [file(mute, '录屏.mp4', 'video')] })).rejects.toThrow(/没有音轨/);
    const blob = join(dir, 'blob.xyz');
    writeFileSync(blob, Buffer.from(Array.from({ length: 3000 }, (_, i) => (i * 37) % 256)));
    await expect(runMeetingPipeline({ ...base, files: [file(blob, 'blob.xyz')] })).rejects.toThrow(/格式不支持/);
    useRuntime({ whisperModel: null });
    await expect(runMeetingPipeline({ ...base, files: [file(m4a, 'a.m4a')] })).rejects.toThrow(/模型未下载/);
    useRuntime();
    const ac = new AbortController();
    ac.abort();
    await expect(runMeetingPipeline({ ...base, files: [file(m4a, 'a.m4a')], signal: ac.signal })).rejects.toThrow(/取消/);
  });
});

describe('runMeetingPipeline：文字记录', () => {
  let dir = '';
  beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'mm-pipe-t-')); });
  afterAll(() => { if (dir) rmSync(dir, { recursive: true, force: true }); });
  afterEach(() => __resetMeetingPipelineConfig());

  it('跳过转写，按昵称匹配员工；多份记录按顺序接起来', async () => {
    const a = join(dir, 'a.txt');
    writeFileSync(a, '[00:00:05] 林晓：今天确定上线时间。\n[00:01:00] 王建国：研发部负责在 11 月 30 日前完成发布。\n[00:02:00] 外部顾问：我补充一点风险。\n[00:02:30] 外部顾问：建议灰度。');
    const b = join(dir, 'b.srt');
    writeFileSync(b, '1\n00:00:01,000 --> 00:00:04,000\n林晓：第二场开始\n');
    configureMeetingPipeline({ runtime: { ffmpeg: null, ffprobe: null, python: null, campp: null, pluginsDir: '', whisperModelsDir: '', whisperModel: null, env: {} } });
    const stages: string[] = [];
    const r = await runMeetingPipeline({
      meetingId: 't1', workDir: join(dir, 'w'), files: [file(a, 'a.txt', 'transcript'), file(b, 'b.srt', 'transcript')], attendees, voiceprints: [],
      threshold: 0.5, asr: 'local', llm: async () => null, onStage: (s) => stages.push(s),
    });
    expect(r.speakers).toEqual([
      { label: '林晓', personId: 'u1', matchedBy: 'nickname' },
      { label: '王建国', personId: 'u2', matchedBy: 'nickname' },
      { label: '外部顾问' },
    ]);
    expect(r.segments.map(s => s.speakerLabel)).toEqual(['林晓', '王建国', '外部顾问', '林晓']);
    expect(r.segments[3]!.start).toBeGreaterThan(150);
    expect(r.decisions.map(d => d.text)).toContain('研发部负责在 11 月 30 日前完成发布。');
    expect(stages).toContain('parse');
    expect(stages).not.toContain('transcribe');
  });

  it('文字记录里没有内容：报中文错误', async () => {
    const e = join(dir, 'empty.txt');
    writeFileSync(e, '\n\n');
    configureMeetingPipeline({ runtime: { ffmpeg: null, ffprobe: null, python: null, campp: null, pluginsDir: '', whisperModelsDir: '', whisperModel: null, env: {} } });
    await expect(runMeetingPipeline({ meetingId: 't2', workDir: join(dir, 'w2'), files: [file(e, 'empty.txt', 'transcript')], attendees, voiceprints: [], threshold: 0.5, asr: 'local', llm: async () => null, onStage: () => {} }))
      .rejects.toThrow(/没有可识别的发言/);
  });
});
