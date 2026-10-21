/**
 * 慈善活动内容工场 · 第 4 步 AI 增强版编排（ffmpeg / fal 全部换假实现，只验编排逻辑）：
 *   · 无 key → 整体改用素材剪辑版并带原因，进度走剪辑版阶段计划，一次 fal 都不调
 *   · 单镜头失败自动重试一次，仍失败用该照片的本地推拉镜头顶上，结果里标注回退镜头
 *   · 致命错误（余额 / 额度 / 密钥）不重试；连续失败熔断；一个 AI 镜头都没有 → 整体剪辑版
 *   · 配乐失败回落本地配乐库；三语共用同一组镜头与配乐；同次运行重新生成复用镜头不重复计费
 *   · 进度事件按真实阶段顺序推进（上传 → 镜头 i/N → 剪辑 → 配乐 → 合成 k/3），计划不变
 *   · 取消直接抛出，不拿本地镜头冒充
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CharityArchive, CharityProgressEvent, MediaFalRunRequest } from '@totalclaw/ipc-contracts';

const M = vi.hoisted(() => ({ imageClips: [] as string[], normalized: [] as string[], burned: [] as string[], bgmScripts: [] as string[] }));
vi.mock('./media', async (importOriginal) => {
  const orig = await importOriginal<any>();
  const { writeFileSync: w } = await import('node:fs');
  return {
    ...orig,
    probeMedia: vi.fn(async (_t: any, p: string) => (p.endsWith('.mp4') ? { durationSec: /shot/.test(p) ? 5.18 : 30, width: 1080, height: 1920, hasAudio: false } : null)),
    audioDuration: vi.fn(async () => 20),
    imageClip: vi.fn(async (_t: any, src: string, out: string) => { M.imageClips.push(src); w(out, 'v'); }),
    normalizeClip: vi.fn(async (_t: any, src: string, out: string) => { M.normalized.push(src); w(out, 'v'); }),
    concatClips: vi.fn(async (_t: any, _c: string[], _l: string, out: string) => { w(out, 'v'); }),
    burnAss: vi.fn(async (_t: any, base: string, _a: string, _f: string, out: string) => { M.burned.push(base); w(out, 'v'); }),
    mixAudio: vi.fn(async (_t: any, _v: string, out: string) => { w(out, 'v'); }),
    fadeOut: vi.fn(async (_t: any, _v: string, out: string) => { w(out, 'v'); }),
    prepareSubtitleFonts: vi.fn((dir: string) => ({ dir, nameFor: { zh: 'x', en: 'x', ar: 'x' } })),
    runProc: vi.fn(async (_bin: string, args: string[]) => {
      M.bgmScripts.push(args[0]);
      const out = args[args.indexOf('--output') + 1];
      w(out, 'bgm');
      return { code: 0, stdout: '', stderr: '', timedOut: false, aborted: false };
    }),
  };
});

import { AI_PLAN, AI_SHOT_MAX, AI_SHOT_SEC, CLIP_PLAN, buildVideos, shotsNeeded, type PipelineDeps } from './pipeline';
import * as media from './media';
import { BASE_SHOT_PROMPT, CONDENSE_OVER, DEFAULT_CONTENT_PROMPT, DEFAULT_VIDEO_PROMPT, FAL_PROMPT_LIMIT, SHOT_PROMPT_MAX, mergeShotPrompt, musicPrompt } from '../../../shared/charityPrompts';

const ARCHIVE: CharityArchive = {
  orgName: { zh: '机构', en: 'Org', ar: 'جهة' }, eventName: { zh: '活动', en: 'Event', ar: 'فعالية' }, date: '2026-08-15',
  location: { zh: '', en: '', ar: '' }, participants: 10, donation: '', organizer: { zh: '', en: '', ar: '' }, summary: { zh: '', en: '', ar: '' }, source: 'manual',
};

class FakeFalError extends Error { constructor(msg: string, readonly code: string) { super(msg); } }

let dir = '';
let outDir = '';
let photos: string[] = [];
let video = '';
let events: CharityProgressEvent[] = [];
let calls: MediaFalRunRequest[] = [];
let uploads: string[] = [];

/** i2v 脚本：按「第几张照片 → 第几次调用」给结果；music 单独控制 */
function fakeFal(script: { shot?: (photo: number, attempt: number) => 'ok' | Error; music?: 'ok' | Error } = {}): PipelineDeps['fal'] {
  const attempts = new Map<string, number>();
  let n = 0;
  return {
    tts: null,
    upload: async (p) => { uploads.push(p); return `https://cdn.fal/${p.split('/').pop()}`; },
    run: async (req, _signal, onProgress) => {
      calls.push(req);
      onProgress?.({ status: 'IN_QUEUE', queuePosition: 0, elapsedMs: 10 });
      onProgress?.({ status: 'IN_PROGRESS', elapsedMs: 2000 });
      if (req.capability === 'music') {
        const m = script.music ?? 'ok';
        if (m instanceof Error) throw m;
        const f = join(req.outDir!, 'music.wav'); writeFileSync(f, 'a');
        return { jobId: 'm', model: 'fal-ai/stable-audio', elapsedMs: 1, estUsd: 0.02, urls: [], files: [f], result: {} };
      }
      const photo = photos.findIndex((p) => req.imageUrl?.endsWith(p.split('/').pop()!)) + 1;
      const attempt = (attempts.get(req.imageUrl!) || 0) + 1;
      attempts.set(req.imageUrl!, attempt);
      const r = script.shot?.(photo, attempt) ?? 'ok';
      if (r instanceof Error) throw r;
      n += 1;
      const f = join(req.outDir!, `shot-${photo}-${n}.mp4`); writeFileSync(f, 'v');
      return { jobId: 'j', model: 'minimax/h3-max/image-to-video', elapsedMs: 1, estUsd: 0.325, urls: [], files: [f], result: {} };
    },
  };
}

function deps(fal: PipelineDeps['fal']): PipelineDeps {
  return {
    resourcesDir: dir,
    tools: { ffmpeg: 'ffmpeg', ffprobe: 'ffprobe', python: 'python3', scriptsDir: join(dir, 'scripts'), env: {} },
    fal,
    vision: async () => '',
    text: async () => '',
    renderPdf: async () => {},
    renderImage: async () => {},
    imageDataUrl: () => '',
    progress: (stage, msg, done, total, extra) => { events.push({ runId: 'r', step: 'video', stage, msg, done, total, ...(extra || {}) }); },
    log: { info: () => {}, warn: () => {} },
  };
}

const req = (mode: 'ai' | 'clip' = 'ai') => ({ items: [...photos, video], mode, langs: ['zh', 'en', 'ar'] as Array<'zh' | 'en' | 'ar'>, archive: ARCHIVE, captions: { zh: ['一'], en: ['one'], ar: ['واحد'] } });
const i2vCalls = () => calls.filter((c) => c.capability === 'i2v');

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'cc-ai-'));
  outDir = join(dir, '输出', '20260918-120000');
  mkdirSync(outDir, { recursive: true });
  photos = ['p1.jpg', 'p2.jpg', 'p3.jpg'].map((n) => { const p = join(dir, n); writeFileSync(p, 'img'); return p; });
  video = join(dir, 'clip.mp4'); writeFileSync(video, 'v');
  events = []; calls = []; uploads = [];
  M.imageClips = []; M.normalized = []; M.burned = []; M.bgmScripts = [];
});
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('AI 增强版：全部成功', () => {
  it('3 个镜头 + Stable Audio，三语共用同一组镜头与配乐，文件名带 -ai', async () => {
    const r = await buildVideos(deps(fakeFal()), req(), outDir);
    expect(r.mode).toBe('ai');
    expect(r.ai?.fallbackReason).toBeUndefined();
    expect(r.ai?.shots.map((s) => s.source)).toEqual(['fal', 'fal', 'fal']);
    expect(r.ai?.music.source).toBe('fal');
    expect(i2vCalls()).toHaveLength(3); // 三种语言，镜头只生成一次
    expect(calls.filter((c) => c.capability === 'music')).toHaveLength(1);
    expect(uploads).toHaveLength(3);
    expect(i2vCalls().every((c) => c.imageUrl?.startsWith('https://cdn.fal/'))).toBe(true); // 先传后生成，不重复上传
    expect(new Set(M.burned).size).toBe(1); // 三语都烧在同一条 base 画面上
    expect(M.imageClips).toEqual([]); // 没有照片走本地推拉
    for (const l of ['zh', 'en', 'ar'] as const) {
      expect(r.items[l]?.path).toBe(join(outDir, `video-${l}-ai.mp4`));
      expect(r.items[l]?.mode).toBe('ai');
      expect(existsSync(r.items[l]!.path)).toBe(true);
    }
    expect(r.ai?.estUsd).toBeCloseTo(0.325 * 3 + 0.02, 4);
  });

  it('进度事件：计划恒为 AI_PLAN，阶段只进不退，镜头 i/3 与合成 k/3 走满，带排队状态', async () => {
    await buildVideos(deps(fakeFal()), req(), outDir);
    expect(events.every((e) => JSON.stringify(e.plan) === JSON.stringify(AI_PLAN))).toBe(true);
    const idx = events.map((e) => AI_PLAN.indexOf(e.phase!));
    for (let i = 1; i < idx.length; i += 1) expect(idx[i]).toBeGreaterThanOrEqual(idx[i - 1]);
    expect([...new Set(events.map((e) => e.phase))]).toEqual(AI_PLAN);
    const shots = events.filter((e) => e.phase === 'shots');
    expect(shots.every((e) => e.total === 3)).toBe(true);
    expect(shots[shots.length - 1].done).toBe(3);
    expect(shots.some((e) => /排队中|生成中/.test(e.msg))).toBe(true);
    const compose = events.filter((e) => e.phase === 'compose');
    expect(compose.map((e) => e.done)).toEqual([0, 1, 2, 3]);
    expect(compose.every((e) => e.total === 3)).toBe(true);
  });

  it('同一次运行再生成：复用已出的镜头与配乐，不再调 fal', async () => {
    await buildVideos(deps(fakeFal()), req(), outDir);
    calls = []; uploads = [];
    const r = await buildVideos(deps(fakeFal()), req(), outDir);
    expect(calls).toHaveLength(0);
    expect(uploads).toHaveLength(0);
    expect(r.ai?.shots.every((s) => s.source === 'fal' && s.reused)).toBe(true);
    expect(r.ai?.music.reused).toBe(true);
    expect(r.ai?.estUsd).toBe(0);
  });
});

describe('AI 增强版：回退', () => {
  it('没配 fal 密钥 → 整体改用素材剪辑版并带原因，进度走剪辑版计划，不调 fal', async () => {
    const r = await buildVideos(deps({ run: null, tts: null, upload: null }), req(), outDir);
    expect(r.mode).toBe('clip');
    expect(r.ai?.fallbackReason).toContain('未配置 fal 密钥');
    expect(r.items.zh?.path).toBe(join(outDir, 'video-zh.mp4'));
    expect(r.items.zh?.mode).toBe('clip');
    expect(events.every((e) => JSON.stringify(e.plan) === JSON.stringify(CLIP_PLAN))).toBe(true);
    expect(events[0].msg).toContain('已改用素材剪辑版');
    expect(M.imageClips).toEqual(photos); // 剪辑版：照片全部本地推拉
    expect(r.ai?.music.source).toBe('library');
  });

  it('单镜头失败：自动重试一次，仍失败用该照片的本地推拉镜头顶上，其余镜头照常 AI', async () => {
    const fal = fakeFal({ shot: (p) => (p === 2 ? new Error('fal HTTP 500 POST https://queue.fal.run/x：upstream') : 'ok') });
    const r = await buildVideos(deps(fal), req(), outDir);
    expect(r.mode).toBe('ai');
    expect(r.ai?.fallbackReason).toBeUndefined();
    expect(r.ai?.shots.map((s) => s.source)).toEqual(['fal', 'kenburns', 'fal']);
    expect(r.ai?.shots[1].attempts).toBe(2);
    expect(r.ai?.shots[1].reason).toBe('fal HTTP 500: upstream');
    expect(i2vCalls()).toHaveLength(4); // 1 + 2（重试）+ 1
    expect(M.imageClips).toEqual([photos[1]]);
    expect(events.some((e) => e.phase === 'shots' && e.msg.includes('自动重试一次'))).toBe(true);
    expect(r.items.ar?.path).toBe(join(outDir, 'video-ar-ai.mp4'));
  });

  it('重试成功：镜头仍算 AI，只多一次调用', async () => {
    const fal = fakeFal({ shot: (p, attempt) => (p === 1 && attempt === 1 ? new Error('network') : 'ok') });
    const r = await buildVideos(deps(fal), req(), outDir);
    expect(r.ai?.shots.map((s) => s.source)).toEqual(['fal', 'fal', 'fal']);
    expect(r.ai?.shots[0].attempts).toBe(2);
    expect(r.ai?.shots[0].reason).toBeUndefined();
    expect(i2vCalls()).toHaveLength(4);
  });

  it('致命错误（余额不足）：不重试、后续镜头不再调 fal → 没有 AI 镜头就整体剪辑版', async () => {
    const fal = fakeFal({ shot: () => new FakeFalError('fal HTTP 402 POST x：balance', 'FAL_BALANCE'), music: new FakeFalError('fal HTTP 402', 'FAL_BALANCE') });
    const r = await buildVideos(deps(fal), req(), outDir);
    expect(i2vCalls()).toHaveLength(1);
    expect(r.mode).toBe('clip');
    expect(r.ai?.fallbackReason).toBe('fal 账户余额不足');
    expect(r.ai?.shots.every((s) => s.source === 'kenburns')).toBe(true);
    expect(r.items.zh?.path).toBe(join(outDir, 'video-zh.mp4'));
    expect(r.ai?.music.source).toBe('library');
  });

  it('串行模式（并发=1）：两个镜头失败就熔断，第 3 个不再尝试', async () => {
    // 并发上限按环境变量取，排障时可退回串行；这一条锁住熔断本身的口径
    const prev = process.env.TOTALCLAW_FAL_CONCURRENCY;
    process.env.TOTALCLAW_FAL_CONCURRENCY = '1';
    try {
      const fal = fakeFal({ shot: () => new Error('fal HTTP 500 upstream') });
      const r = await buildVideos(deps(fal), req(), outDir);
      expect(i2vCalls()).toHaveLength(4); // 前两个各重试一次，第三个不调
      expect(r.ai?.shots[2].attempts).toBe(0);
      expect(r.ai?.shots[2].reason).toContain('2 个镜头失败');
      expect(r.mode).toBe('clip');
      expect(r.ai?.fallbackReason).toContain('2 个镜头失败');
    } finally {
      if (prev === undefined) delete process.env.TOTALCLAW_FAL_CONCURRENCY; else process.env.TOTALCLAW_FAL_CONCURRENCY = prev;
    }
  });

  it('并发模式：闸门拉下后不再派新镜头，但已在途的撤不回来（镜头清单仍不缺号）', async () => {
    // 并发的代价必须说清楚：stop 只拦还没派出去的。预热（第一个单独跑）保证致命错误一次就停，
    // 非致命的失败则可能多跑掉几个在途请求 —— 这里断言的是上界与「清单完整」，不是精确次数。
    const fal = fakeFal({ shot: () => new Error('fal HTTP 500 upstream') });
    const r = await buildVideos(deps(fal), req(), outDir);
    const n = r.ai!.shots.length;
    expect(i2vCalls().length).toBeLessThanOrEqual(n * 2); // 每个镜头最多两次（含重试），不会无限放大
    expect(r.ai?.shots.map((x) => x.index)).toEqual(Array.from({ length: n }, (_, i) => i + 1)); // 不缺号
    expect(r.mode).toBe('clip');
    expect(r.ai?.fallbackReason).toContain('镜头失败');
  });

  it('Stable Audio 失败 → 回落本地配乐库，镜头照常 AI', async () => {
    const r = await buildVideos(deps(fakeFal({ music: new Error('fal HTTP 503 stable-audio') })), req(), outDir);
    expect(r.mode).toBe('ai');
    expect(r.ai?.music.source).toBe('library');
    expect(r.ai?.music.reason).toContain('503');
    expect(M.bgmScripts.some((s) => s.endsWith('fetch_bgm.py'))).toBe(true);
    expect(events.some((e) => e.phase === 'music' && e.msg.includes('本地配乐库'))).toBe(true);
  });

  it('手选剪辑版：不调 fal，不带 ai 报告', async () => {
    const r = await buildVideos(deps(fakeFal()), req('clip'), outDir);
    expect(calls).toHaveLength(0);
    expect(r.mode).toBe('clip');
    expect(r.ai).toBeUndefined();
  });

  it('取消：镜头生成中被停止 → 直接抛出，不拿本地镜头冒充成片', async () => {
    const ctrl = new AbortController();
    const fal = fakeFal({ shot: () => { ctrl.abort(); return new FakeFalError('已取消', 'FAL_CANCELLED'); } });
    const registry = { signal: ctrl.signal, add: () => {}, remove: () => {} };
    await expect(buildVideos(deps(fal), req(), outDir, registry)).rejects.toThrow();
    expect(i2vCalls()).toHaveLength(1);
    expect(existsSync(join(outDir, 'video-zh.mp4'))).toBe(false);
    expect(existsSync(join(outDir, 'video-zh-ai.mp4'))).toBe(false);
  });
});

describe('两个提示词共同作用', () => {
  it('合并后的镜头提示词进每个图生视频请求、配乐短语进 Stable Audio、明写的片尾口号进片尾卡；实际使用的提示词回传', async () => {
    const contentPrompt = '突出孩子们领取书包的笑脸；数字只用档案';
    const videoPrompt = '手持跟拍；暖色调；配乐用乌德琴；片尾口号：让爱传递';
    const r = await buildVideos(deps(fakeFal()), { ...req(), contentPrompt, videoPrompt }, outDir);
    const m = mergeShotPrompt(contentPrompt, videoPrompt, 'warm');
    expect(m.shot).toBe('Subject: 突出孩子们领取书包的笑脸. Visual style: 手持跟拍; 暖色调. natural motion, no text overlay, no subtitles.');
    expect(i2vCalls()).toHaveLength(3);
    expect(i2vCalls().every((c) => c.prompt === m.shot)).toBe(true);
    expect(calls.find((c) => c.capability === 'music')?.prompt).toBe(m.music);
    expect(r.prompts.shot).toBe(m.shot);
    expect(r.prompts.endSlogan).toEqual({ zh: '让爱传递', en: '让爱传递', ar: '让爱传递' });
    const ass = readFileSync(join(outDir, '.work-video', 'captions-en.ass'), 'utf8');
    expect(ass).toMatch(/Dialogue: 2,[^,]+,[^,]+,End,.*Org\\N让爱传递/);
  });

  it('默认提示词：只提片尾 → 片尾卡用机构名 + 活动名；剪辑版按「舒缓」放慢推拉并淡入淡出', async () => {
    vi.mocked(media.imageClip).mockClear();
    const r = await buildVideos(deps(fakeFal()), { ...req('clip'), contentPrompt: DEFAULT_CONTENT_PROMPT.zh, videoPrompt: DEFAULT_VIDEO_PROMPT.zh }, outDir);
    expect(r.prompts.clipStyle).toEqual({ pace: 'slow', transition: 'fade' });
    expect(r.prompts.endSlogan.ar).toBe(ARCHIVE.eventName.ar);
    const styles = vi.mocked(media.imageClip).mock.calls.map((c) => c[6]);
    expect(styles.length).toBeGreaterThan(0);
    expect(styles.every((st) => st?.pace === 'slow' && st?.transition === 'fade')).toBe(true);
    expect(readFileSync(join(outDir, '.work-video', 'captions-zh.ass'), 'utf8')).toMatch(/,End,.*机构\\N活动/);
  });

  it('两个提示词都空：镜头 / 配乐 prompt 与原来一字不差，剪辑正常节奏直切，没有片尾卡', async () => {
    const r = await buildVideos(deps(fakeFal()), { ...req(), contentPrompt: '', videoPrompt: '' }, outDir);
    expect(i2vCalls().every((c) => c.prompt === BASE_SHOT_PROMPT)).toBe(true);
    expect(calls.find((c) => c.capability === 'music')?.prompt).toBe(musicPrompt('warm'));
    expect(r.prompts.clipStyle).toEqual({ pace: 'normal', transition: 'cut' });
    expect(r.prompts.endSlogan).toEqual({});
    expect(readFileSync(join(outDir, '.work-video', 'captions-zh.ass'), 'utf8')).not.toContain(',End,');
  });

  it('改了提示词再生成：镜头按新提示词重出（缓存按提示词区分），同提示词再生成才复用', async () => {
    await buildVideos(deps(fakeFal()), { ...req(), videoPrompt: '暖色调' }, outDir);
    calls = [];
    await buildVideos(deps(fakeFal()), { ...req(), videoPrompt: '冷色调' }, outDir);
    expect(i2vCalls()).toHaveLength(3);
    calls = [];
    const again = await buildVideos(deps(fakeFal()), { ...req(), videoPrompt: '冷色调' }, outDir);
    expect(i2vCalls()).toHaveLength(0);
    expect(again.ai?.shots.every((s) => s.reused)).toBe(true);
  });
});

describe('长提示词（上限 8000 字）：先浓缩成要点再拼镜头 / 配乐 prompt', () => {
  const longContent = `${'围绕这次慈善活动做记录，突出志愿者与孩子们的互动细节；'.repeat(40)}`;
  const longVideo = `${'暖色调；手持跟拍；配乐用乌德琴；'.repeat(40)}片尾口号：让爱传递`;

  it('合计超过阈值 → 文本模型只浓缩一次（同次运行再生成命中缓存），镜头 / 配乐 prompt 用浓缩要点并受长度上限约束', async () => {
    expect(longContent.length + longVideo.length).toBeGreaterThan(CONDENSE_OVER);
    const d = deps(fakeFal());
    let asked = 0;
    let lastPrompt = '';
    d.text = async (prompt) => { asked += 1; lastPrompt = prompt; return JSON.stringify({ content: ['志愿者与孩子们互动'], style: ['暖色调', '手持跟拍'], music: ['乌德琴配乐'], ending: '让爱传递' }); };
    const r = await buildVideos(d, { ...req(), contentPrompt: longContent, videoPrompt: longVideo }, outDir);
    expect(asked).toBe(1);
    expect(lastPrompt).toContain(longContent.trim()); // 浓缩时整段交给文本模型
    expect(r.prompts.condensed).toBe(true);
    expect(r.prompts.contentPoints).toEqual(['志愿者与孩子们互动']);
    expect(r.prompts.shot).toBe('Subject: 志愿者与孩子们互动. Visual style: 暖色调; 手持跟拍. natural motion, no text overlay, no subtitles.');
    expect(i2vCalls().every((c) => c.prompt === r.prompts.shot)).toBe(true); // 3 个镜头共用一次浓缩结果
    expect(r.prompts.music).toContain('Style notes: 乌德琴配乐');
    expect(r.prompts.endSlogan.zh).toBe('让爱传递');
    await buildVideos(d, { ...req(), contentPrompt: longContent, videoPrompt: longVideo }, outDir);
    expect(asked).toBe(1);
  });

  it('浓缩失败（模型不可用）→ 退回按短语截取，镜头 / 配乐 prompt 仍不超上限', async () => {
    const d = deps(fakeFal());
    d.text = async () => { throw new Error('no model'); };
    const r = await buildVideos(d, { ...req(), contentPrompt: longContent, videoPrompt: longVideo }, outDir);
    expect(r.prompts.condensed).toBeUndefined();
    expect(r.prompts.shot.length).toBeLessThanOrEqual(Math.min(SHOT_PROMPT_MAX, FAL_PROMPT_LIMIT.i2v));
    expect(r.prompts.music.length).toBeLessThanOrEqual(FAL_PROMPT_LIMIT.music);
    expect(i2vCalls()).toHaveLength(3);
  });

  it('默认提示词不触发浓缩（不多调模型）', async () => {
    const d = deps(fakeFal());
    let asked = 0;
    d.text = async () => { asked += 1; return '{}'; };
    await buildVideos(d, { ...req(), contentPrompt: DEFAULT_CONTENT_PROMPT.en, videoPrompt: DEFAULT_VIDEO_PROMPT.en }, outDir);
    expect(asked).toBe(0);
  });
});

describe('镜头数量按成片时长算（不是写死几个然后循环播放）', () => {
  it('旁白多长就要多少镜头：90 秒要 18 个 5 秒镜头，不是 3 个', () => {
    // 用户实拍反馈「视频时长不够，一直在循环」，根因就是这里以前写死 3 个镜头 = 15 秒画面，
    // 90 秒旁白只能把这 15 秒循环六遍
    expect(AI_SHOT_SEC).toBe(5);
    expect(shotsNeeded(90)).toBe(18);
    expect(shotsNeeded(30)).toBe(6);
    expect(shotsNeeded(12)).toBe(3);
  });
  it('至少一个；超长旁白到上限为止（剩下的时长由照片推拉铺满，账单不会被拉爆）', () => {
    expect(shotsNeeded(0)).toBe(1);
    expect(shotsNeeded(1)).toBe(1);
    expect(shotsNeeded(AI_SHOT_MAX * AI_SHOT_SEC)).toBe(AI_SHOT_MAX);
    expect(shotsNeeded(99999)).toBe(AI_SHOT_MAX);
  });
});
