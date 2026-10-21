/**
 * 慈善活动内容工场 IPC：参数校验（绝对路径 / runId / outDir 形状 / 语言 / 模式）、
 * 一键流程「真跑失败 → 预置成品」回退（响应带 fallback，文件拷进本次输出目录，只写日志）、
 * 非一键调用失败原样报错、取消句柄。electron / 流水线 / 渲染全部 mock。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const H = vi.hoisted(() => ({
  handlers: new Map<string, (...args: any[]) => any>(),
  sent: [] as any[],
  resources: '',
  docs: '',
  fail: { archive: false, analyze: false, report: false, tts: false, video: false },
}));

vi.mock('electron', () => ({
  ipcMain: { handle: (ch: string, fn: (...a: any[]) => any) => { H.handlers.set(ch, fn); } },
  // resourcesDir 走 shellResourcesPath（已 mock 到临时目录），预置包由用例自己 seed；
  // documents 指到每个用例自己的临时「文稿」目录（演示素材复制落点）
  app: { isPackaged: true, getPath: (name: string) => (name === 'documents' && H.docs ? H.docs : tmpdir()) },
  dialog: { showOpenDialog: vi.fn(async () => ({ canceled: true, filePaths: [] })), showSaveDialog: vi.fn(async () => ({ canceled: true })) },
  BrowserWindow: class {},
  nativeImage: { createFromPath: () => ({ isEmpty: () => true }) },
}));
vi.mock('../services/qiyeApiBridge', () => ({ qiyeApiBridge: { chatCompletionsForVision: vi.fn(), chatCompletionsForText: vi.fn() }, getConfiguredDefaultProvider: () => 'deepseek' }));
vi.mock('../services/councilChatRouter', () => ({ runOneshotChat: vi.fn(async () => '{}') }));
vi.mock('../services/agentPython', () => ({ resolveAgentPython: () => null }));
vi.mock('../services/mediaModelConfig', () => ({ readAgentEnv: () => ({}) }));
vi.mock('../services/ffmpegPath', () => ({ resolveFfmpegPair: () => ({ ffmpeg: null, ffprobe: null }), ffmpegSpawnEnv: () => ({}) }));
vi.mock('../services/runtimeLocation', () => ({ runtimeResourcesPath: () => H.resources, shellResourcesPath: () => H.resources }));
vi.mock('../services/documentExtractor', () => ({ extractDocument: vi.fn(async () => ({ pages: [{ page: 1, text: '' }, { page: 2, text: 'x'.repeat(50) }, { page: 3, text: 'y'.repeat(50) }, { page: 4, text: 'z'.repeat(50) }] })) }));
vi.mock('../services/charityContent/render', () => ({
  renderHtmlToPdf: vi.fn(async (_h: string, out: string) => writeFileSync(out, 'pdf')),
  renderHtmlToImage: vi.fn(async (_h: string, out: string) => writeFileSync(out, 'img')),
  imageToDataUrl: () => 'data:image/jpeg;base64,AA',
  audioToDataUrl: () => 'data:audio/mpeg;base64,AA',
}));
vi.mock('../services/charityContent/pipeline', async (importOriginal) => {
  const orig = await importOriginal<any>();
  const boom = (k: keyof typeof H.fail) => { if (H.fail[k]) throw new Error(`${k} exploded`); };
  return {
    ...orig,
    inspectMaterials: vi.fn(async (_d: any, files: string[]) => files.map((path) => ({ path, name: path.split('/').pop(), kind: orig.listMaterialFiles ? (path.endsWith('.mp4') ? 'video' : path.endsWith('.pdf') ? 'pdf' : 'image') : 'image', size: 1, mtimeMs: 1, ok: true }))),
    draftArchive: vi.fn(async () => { boom('archive'); return { ...orig.emptyArchive?.('vlm'), orgName: { zh: 'VLM', en: 'VLM', ar: 'VLM' }, eventName: { zh: 'E', en: 'E', ar: 'E' } }; }),
    analyzeMaterials: vi.fn(async () => { boom('analyze'); return { descriptions: [{ path: '/x/a.jpg', kind: 'image', description: { zh: 'd', en: 'd', ar: 'd' } }], failed: 0, lastError: '' }; }),
    composeReport: vi.fn(async (_d: any, archive: any, desc: any) => { boom('report'); const { deterministicReport } = await import('../services/charityContent/reportText'); return { report: deterministicReport(archive, desc), via: { zh: 'llm', en: 'llm', ar: 'llm' } }; }),
    renderOutputs: vi.fn(async (_d: any, _a: any, _r: any, _i: any, outDir: string) => {
      const pdf: any = {}; const poster: any = {};
      for (const l of ['zh', 'en', 'ar']) { pdf[l] = join(outDir, `report-${l}.pdf`); poster[l] = join(outDir, `poster-${l}.jpg`); writeFileSync(pdf[l], 'p'); writeFileSync(poster[l], 'i'); }
      return { pdf, poster, pdfPreviewAr: '' };
    }),
    synthesizeSpeech: vi.fn(async (_d: any, text: any, outDir: string) => {
      boom('tts');
      const out: any = {};
      for (const l of Object.keys(text)) { out[l] = { path: join(outDir, `speech-${l}.mp3`), quality: 'hd', durationSec: 3, voice: 'v' }; writeFileSync(out[l].path, 'm'); }
      return out;
    }),
    buildVideos: vi.fn(async (_d: any, req: any, outDir: string) => {
      boom('video');
      const out: any = {};
      // AI 增强版在流水线里回退成剪辑版的形状：mode=clip + ai.fallbackReason（IPC 原样透传给界面）
      const fellBack = req.mode === 'ai';
      for (const l of req.langs) { out[l] = { path: join(outDir, `video-${l}.mp4`), srcUrl: '', durationSec: 30, size: 3, mode: fellBack ? 'clip' : req.mode }; writeFileSync(out[l].path, 'v'); }
      return { items: out, mode: fellBack ? 'clip' : req.mode, ai: fellBack ? { fallbackReason: '未配置 fal 密钥', shots: [], music: { source: 'library' }, estUsd: 0 } : undefined };
    }),
  };
});

import { IPC_CHANNELS } from '@totalclaw/ipc-contracts';
import { registerCharityContentHandlers } from './charityContent.ipc';

const call = (ch: string, payload?: any) => H.handlers.get(ch)!({}, payload);
const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
const deps = () => ({
  logger,
  appConfig: {},
  authState: { authenticated: true },
  getMainWindow: () => ({ webContents: { send: (_c: string, ev: any) => H.sent.push(ev) } }),
} as any);

let material = '';
const ARCHIVE = { orgName: { zh: '机构', en: 'Org', ar: 'جهة' }, eventName: { zh: '活动', en: 'Event', ar: 'فعالية' }, date: '2026-08-15', location: { zh: '', en: '', ar: '' }, participants: 10, donation: '', organizer: { zh: '', en: '', ar: '' }, summary: { zh: 's', en: 's', ar: 's' }, source: 'manual' };

function seedPrebaked(): void {
  const root = join(H.resources, 'bundled-solutions', 'charity-content');
  mkdirSync(join(root, 'prebaked'), { recursive: true });
  writeFileSync(join(root, 'demo-archive.json'), JSON.stringify({ ...ARCHIVE, orgName: { zh: '预置机构', en: 'Prebaked', ar: 'مسبق' }, source: 'demo' }));
  writeFileSync(join(root, 'prebaked', 'descriptions.json'), JSON.stringify([{ kind: 'image', description: { zh: '预置图', en: 'pi', ar: 'ص' } }, { kind: 'video', description: { zh: '预置视', en: 'pv', ar: 'ف' } }]));
  const content = { title: 'T', overview: 'O', highlights: ['h'], scene: 'S', thanks: 'Th', summary: 'Su', captions: ['c'] };
  writeFileSync(join(root, 'prebaked', 'report.json'), JSON.stringify({ zh: content, en: content, ar: content }));
  for (const l of ['zh', 'en', 'ar']) for (const [p, e] of [['report', 'pdf'], ['poster', 'jpg'], ['speech', 'mp3'], ['video', 'mp4']]) writeFileSync(join(root, 'prebaked', `${p}-${l}.${e}`), 'x');
  writeFileSync(join(root, 'prebaked', 'speech-zh.cues.json'), '{"version":1,"cues":[]}');
}

beforeEach(() => {
  H.handlers.clear(); H.sent = [];
  H.fail = { archive: false, analyze: false, report: false, tts: false, video: false };
  H.resources = mkdtempSync(join(tmpdir(), 'cc-res-'));
  H.docs = mkdtempSync(join(tmpdir(), 'cc-docs-'));
  material = mkdtempSync(join(tmpdir(), 'cc-mat-'));
  writeFileSync(join(material, 'a.jpg'), 'x'); writeFileSync(join(material, 'b.mp4'), 'x'); writeFileSync(join(material, 'c.pdf'), 'x');
  logger.warn.mockClear(); logger.info.mockClear();
  registerCharityContentHandlers(deps());
});
afterEach(() => { rmSync(H.resources, { recursive: true, force: true }); rmSync(H.docs, { recursive: true, force: true }); rmSync(material, { recursive: true, force: true }); });

async function scan(): Promise<{ runId: string; outDir: string; items: any[] }> {
  const r = await call(IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, { dir: material });
  expect(r.ok).toBe(true);
  return r;
}

describe('参数校验', () => {
  it('scan：相对路径 / 不存在 / 无素材都拒绝', async () => {
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, { dir: 'rel' })).ok).toBe(false);
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, {})).ok).toBe(false);
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, { dir: join(material, 'nope') })).ok).toBe(false);
    const empty = mkdtempSync(join(tmpdir(), 'cc-empty-'));
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, { dir: empty })).ok).toBe(false);
  });
  it('start-run：文章线不经素材扫描也能拿到合法 runId，后续步骤不再被校验挡下', async () => {
    // 这条通道就是为了修「文章转语音线点合成语音报 runId 格式不正确」：那条线没有素材扫描，
    // runId 一直是空字符串。默认落 <文稿>/TotalClaw/慈善文章配音/，与演示素材目录分开。
    const r = await call(IPC_CHANNELS.WORKBENCH_CHARITY_START_RUN, {});
    expect(r.ok).toBe(true);
    expect(r.runId).toMatch(/^\d{8}-\d{6}$/);
    expect(r.dir).toBe(join(H.docs, 'TotalClaw', '慈善文章配音'));
    expect(r.outDir).toBe(join(r.dir, '输出', r.runId));
    // 与 scan 一致：输出目录到真正生成才建，不预留空目录
    expect(existsSync(join(r.dir, '输出'))).toBe(false);
    // 拿这对 runId/outDir 去跑语音，不该再被参数校验拒绝
    const t = await call(IPC_CHANNELS.WORKBENCH_CHARITY_TTS, { runId: r.runId, outDir: r.outDir, text: { zh: '一段文稿' } });
    expect(t.ok).toBe(true);
    // 指定目录时用指定的那个；相对路径拒绝
    const mine = await call(IPC_CHANNELS.WORKBENCH_CHARITY_START_RUN, { dir: material });
    expect(mine.dir).toBe(material);
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_START_RUN, { dir: 'rel' })).ok).toBe(false);
  });
  it('scan 成功：runId 形状、outDir 在 素材/输出/ 下、跳过 输出 目录', async () => {
    const r = await scan();
    expect(r.runId).toMatch(/^\d{8}-\d{6}$/);
    expect(r.outDir).toBe(join(material, '输出', r.runId));
    // 终验 P2-30：扫描只算路径不建目录，每次「载入演示素材」不再多一个空的 输出/<时间戳>/
    expect(existsSync(join(material, '输出'))).toBe(false);
    expect(r.items.map((i: any) => i.name)).toEqual(['a.jpg', 'b.mp4', 'c.pdf']);
    const again = await call(IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, { dir: material });
    expect(again.items.map((i: any) => i.name)).toEqual(['a.jpg', 'b.mp4', 'c.pdf']);
  });
  it('后续步骤：runId 不合法 / outDir 与 runId 不匹配 / 语言与模式非法 → ok:false 且带原因', async () => {
    const { runId, outDir } = await scan();
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_ARCHIVE_DRAFT, { runId: 'x', outDir, images: [] })).error).toContain('runId');
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_ANALYZE, { runId, outDir: join(material, 'elsewhere', runId), items: [] })).error).toContain('输出目录');
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_TTS, { runId, outDir, text: { zh: '' } })).error).toContain('朗读');
    const v = await call(IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, { runId, outDir, items: [join(material, 'a.jpg')], mode: 'magic', langs: ['zh'], archive: ARCHIVE, captions: {} });
    expect(v.ok).toBe(false); expect(v.error).toContain('clip');
    const l = await call(IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, { runId, outDir, items: [join(material, 'a.jpg')], mode: 'clip', langs: ['xx'], archive: ARCHIVE, captions: {} });
    expect(l.ok).toBe(false);
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_FILE_URL, { path: 'rel.mp4', kind: 'video' })).ok).toBe(false);
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_PDF_TEXT, { path: join(material, 'a.jpg') })).ok).toBe(false);
  });
  it('pdf-text：跳过空页取前 N 页有文字的页', async () => {
    const r = await call(IPC_CHANNELS.WORKBENCH_CHARITY_PDF_TEXT, { path: join(material, 'c.pdf'), pages: 2 });
    expect(r.ok).toBe(true);
    expect(r.pages).toEqual([2, 3]);
    expect(r.totalPages).toBe(4);
  });
});

describe('两个提示词：透传、长度上限、随本次运行存档', () => {
  it('内容提示词进看图 / 报告，两个提示词进成片；写进 prompts.json，历史里看得到', async () => {
    const pipe = await import('../services/charityContent/pipeline');
    const { runId, outDir } = await scan();
    const contentPrompt = '突出孩子们领取书包的笑脸';
    const videoPrompt = '手持跟拍；片尾口号：让爱传递';
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_ANALYZE, { runId, outDir, items: [join(material, 'a.jpg')], archive: ARCHIVE, contentPrompt })).ok).toBe(true);
    expect(vi.mocked(pipe.analyzeMaterials).mock.calls.at(-1)![5]).toBe(contentPrompt);
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_REPORT, { runId, outDir, archive: ARCHIVE, descriptions: [], images: [], contentPrompt })).ok).toBe(true);
    expect(vi.mocked(pipe.composeReport).mock.calls.at(-1)![4]).toBe(contentPrompt);
    const v = await call(IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, { runId, outDir, items: [join(material, 'a.jpg')], mode: 'clip', langs: ['zh'], archive: ARCHIVE, captions: {}, contentPrompt, videoPrompt });
    expect(v.ok).toBe(true);
    expect(vi.mocked(pipe.buildVideos).mock.calls.at(-1)![1]).toMatchObject({ contentPrompt, videoPrompt });
    const saved = JSON.parse(readFileSync(join(outDir, 'prompts.json'), 'utf8'));
    expect(saved).toMatchObject({ content: contentPrompt, video: videoPrompt });
    const hist = await call(IPC_CHANNELS.WORKBENCH_CHARITY_HISTORY, { dir: material });
    expect(hist.runs[0].prompts).toEqual({ content: contentPrompt, video: videoPrompt });
  });
  it('8000 字通过，8001 字拒绝并说明上限；不传 = 空（与不加提示词一致）', async () => {
    const { runId, outDir } = await scan();
    const ok = await call(IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, { runId, outDir, items: [join(material, 'a.jpg')], mode: 'clip', langs: ['zh'], archive: ARCHIVE, captions: {}, videoPrompt: '字'.repeat(8000) });
    expect(ok.ok).toBe(true);
    const tooLong = await call(IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, { runId, outDir, items: [join(material, 'a.jpg')], mode: 'clip', langs: ['zh'], archive: ARCHIVE, captions: {}, videoPrompt: '字'.repeat(8001) });
    expect(tooLong.ok).toBe(false); expect(tooLong.error).toContain('8000');
    const badType = await call(IPC_CHANNELS.WORKBENCH_CHARITY_REPORT, { runId, outDir, archive: ARCHIVE, descriptions: [], images: [], contentPrompt: { x: 1 } });
    expect(badType.ok).toBe(false);
    await call(IPC_CHANNELS.WORKBENCH_CHARITY_ANALYZE, { runId, outDir, items: [join(material, 'a.jpg')], archive: ARCHIVE });
    const pipe = await import('../services/charityContent/pipeline');
    expect(vi.mocked(pipe.analyzeMaterials).mock.calls.at(-1)![5]).toBe('');
  });
});

describe('真跑成功路径', () => {
  it('档案 → 分析 → 报告 → 语音 → 视频，各步产物落在本次输出目录', async () => {
    const { runId, outDir } = await scan();
    const a = await call(IPC_CHANNELS.WORKBENCH_CHARITY_ARCHIVE_DRAFT, { runId, outDir, images: [join(material, 'a.jpg')] });
    expect(a.ok).toBe(true); expect(a.fallback).toBeUndefined(); expect(a.archive.orgName.zh).toBe('VLM');
    expect(existsSync(outDir)).toBe(false); // 档案草案不落盘，也不建输出目录
    const an = await call(IPC_CHANNELS.WORKBENCH_CHARITY_ANALYZE, { runId, outDir, items: [join(material, 'a.jpg')], archive: ARCHIVE });
    expect(an.descriptions).toHaveLength(1);
    const r = await call(IPC_CHANNELS.WORKBENCH_CHARITY_REPORT, { runId, outDir, archive: ARCHIVE, descriptions: an.descriptions, images: [join(material, 'a.jpg')] });
    expect(r.ok).toBe(true); expect(r.report.ar.title).toContain('فعالية'); expect(existsSync(r.pdf.ar)).toBe(true); expect(r.pdf.ar.startsWith(outDir)).toBe(true);
    const t = await call(IPC_CHANNELS.WORKBENCH_CHARITY_TTS, { runId, outDir, text: { zh: '你好', ar: 'مرحبا' }, quality: 'hd' });
    expect(t.ok).toBe(true);
    const pipe = await import('../services/charityContent/pipeline');
    expect(vi.mocked(pipe.synthesizeSpeech).mock.calls.at(-1)![3]).toMatchObject({ gender: 'female' }); // 缺省女声
    await call(IPC_CHANNELS.WORKBENCH_CHARITY_TTS, { runId, outDir, text: { ar: 'مرحبا' }, gender: 'male' });
    expect(vi.mocked(pipe.synthesizeSpeech).mock.calls.at(-1)![3]).toMatchObject({ gender: 'male' }); expect(Object.keys(t.items).sort()).toEqual(['ar', 'zh']); expect(t.items.zh.dataUrl).toContain('data:audio');
    const v = await call(IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, { runId, outDir, items: [join(material, 'a.jpg'), join(material, 'b.mp4')], mode: 'clip', langs: ['zh', 'ar'], archive: ARCHIVE, captions: { zh: ['一'] } });
    expect(v.ok).toBe(true); expect(v.items.ar.srcUrl).toContain('totalclaw-media://'); expect(v.mode).toBe('clip'); expect(v.ai).toBeUndefined();
    const va = await call(IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, { runId, outDir, items: [join(material, 'a.jpg')], mode: 'ai', langs: ['zh'], archive: ARCHIVE, captions: {} });
    expect(va.ok).toBe(true); expect(va.fallback).toBeUndefined(); expect(va.mode).toBe('clip'); expect(va.ai.fallbackReason).toBe('未配置 fal 密钥');
    const hist = await call(IPC_CHANNELS.WORKBENCH_CHARITY_HISTORY, { dir: material });
    expect(hist.runs).toHaveLength(1);
    expect(hist.runs[0].video.ar).toBe(join(outDir, 'video-ar.mp4'));
    expect(hist.runs[0].videoAi).toEqual({});
    expect(hist.runs[0].speech.zh).toBe(join(outDir, 'speech-zh.mp3'));
    // 同一次运行两种成片都在：历史分开列，AI 增强版不再盖掉剪辑版
    writeFileSync(join(outDir, 'video-zh-ai.mp4'), 'v');
    const hist2 = await call(IPC_CHANNELS.WORKBENCH_CHARITY_HISTORY, { dir: material });
    expect(hist2.runs[0].videoAi).toEqual({ zh: join(outDir, 'video-zh-ai.mp4') });
    expect(hist2.runs[0].video.zh).toBe(join(outDir, 'video-zh.mp4'));
  });
});

describe('一键流程回退', () => {
  it('fallbackToPrebaked：每步真跑失败都回落预置成品，响应 ok + fallback，文件拷进输出目录，只写 warn 日志', async () => {
    seedPrebaked();
    H.fail = { archive: true, analyze: true, report: true, tts: true, video: true };
    const { runId, outDir } = await scan();
    const a = await call(IPC_CHANNELS.WORKBENCH_CHARITY_ARCHIVE_DRAFT, { runId, outDir, images: [join(material, 'a.jpg')], fallbackToPrebaked: true });
    expect(a.ok).toBe(true); expect(a.fallback).toBe(true); expect(a.archive.orgName.zh).toBe('预置机构'); expect(a.archive.source).toBe('demo');
    const an = await call(IPC_CHANNELS.WORKBENCH_CHARITY_ANALYZE, { runId, outDir, items: [join(material, 'a.jpg'), join(material, 'b.mp4')], archive: ARCHIVE, fallbackToPrebaked: true });
    expect(an.fallback).toBe(true); expect(an.descriptions.map((d: any) => d.description.zh)).toEqual(['预置图', '预置视']);
    const r = await call(IPC_CHANNELS.WORKBENCH_CHARITY_REPORT, { runId, outDir, archive: ARCHIVE, descriptions: an.descriptions, images: [], fallbackToPrebaked: true });
    expect(r.fallback).toBe(true); expect(r.pdf.ar).toBe(join(outDir, 'report-ar.pdf')); expect(existsSync(r.poster.en)).toBe(true); expect(r.report.zh.title).toBe('T');
    const t = await call(IPC_CHANNELS.WORKBENCH_CHARITY_TTS, { runId, outDir, text: { zh: 'x', en: 'y' }, fallbackToPrebaked: true });
    expect(t.fallback).toBe(true); expect(Object.keys(t.items).sort()).toEqual(['en', 'zh']); expect(t.items.zh.path).toBe(join(outDir, 'speech-zh.mp3'));
    expect(existsSync(join(outDir, 'speech-zh.cues.json'))).toBe(true); // 逐句时间轴跟着旁白拷，第 4 步字幕才对得上
    const v = await call(IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, { runId, outDir, items: [join(material, 'a.jpg')], mode: 'ai', langs: ['ar'], archive: ARCHIVE, captions: {}, fallbackToPrebaked: true });
    expect(v.fallback).toBe(true); expect(v.items.ar.path).toBe(join(outDir, 'video-ar.mp4')); expect(v.items.zh).toBeUndefined();
    const fallbackLogs = logger.warn.mock.calls.filter((c) => String(c[1]).includes('[fallback]'));
    expect(fallbackLogs).toHaveLength(5);
  });
  it('没开 fallbackToPrebaked：失败原样报错，不碰预置', async () => {
    seedPrebaked();
    H.fail.report = true; H.fail.tts = true;
    const { runId, outDir } = await scan();
    const r = await call(IPC_CHANNELS.WORKBENCH_CHARITY_REPORT, { runId, outDir, archive: ARCHIVE, descriptions: [], images: [] });
    expect(r.ok).toBe(false); expect(r.error).toContain('report exploded');
    const t = await call(IPC_CHANNELS.WORKBENCH_CHARITY_TTS, { runId, outDir, text: { zh: 'x' } });
    expect(t.ok).toBe(false);
    expect(existsSync(join(outDir, 'speech-zh.mp3'))).toBe(false);
  });
  it('预置包缺该语言时不假装成功', async () => {
    seedPrebaked();
    rmSync(join(H.resources, 'bundled-solutions', 'charity-content', 'prebaked', 'video-ar.mp4'));
    H.fail.video = true;
    const { runId, outDir } = await scan();
    const v = await call(IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, { runId, outDir, items: [join(material, 'a.jpg')], mode: 'clip', langs: ['ar'], archive: ARCHIVE, captions: {}, fallbackToPrebaked: true });
    expect(v.ok).toBe(false); expect(v.error).toContain('video exploded');
  });
  it('prebaked 通道给界面完整清单', async () => {
    seedPrebaked();
    const p = await call(IPC_CHANNELS.WORKBENCH_CHARITY_PREBAKED);
    expect(p.available).toBe(true); expect(p.archive.orgName.zh).toBe('预置机构'); expect(p.video.zh).toContain('video-zh.mp4');
    expect(typeof p.falReady).toBe('boolean');
  });
  it('cancel 幂等', async () => {
    const { runId } = await scan();
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_CANCEL, { runId })).ok).toBe(true);
    expect((await call(IPC_CHANNELS.WORKBENCH_CHARITY_CANCEL, { runId: 'nope' })).ok).toBe(true);
  });
});

describe('演示素材（随包 → 用户文稿目录）', () => {
  it('复制到 <文稿>/TotalClaw/慈善演示素材/ 后按普通目录扫描，产物写到其下 输出/<时间戳>/；再次载入不重复复制', async () => {
    const src = join(H.resources, 'bundled-solutions', 'charity-content', 'demo-materials');
    mkdirSync(src, { recursive: true });
    writeFileSync(join(src, 'a.jpg'), 'img'); writeFileSync(join(src, 'b.mp4'), 'vid'); writeFileSync(join(src, 'c.pdf'), 'pdf');
    const r1 = await call(IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_MATERIALS);
    expect(r1).toEqual({ ok: true, dir: join(H.docs, 'TotalClaw', '慈善演示素材'), copied: 3 });
    const r2 = await call(IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_MATERIALS);
    expect(r2).toEqual({ ok: true, dir: r1.dir, copied: 0 });
    const s = await call(IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, { dir: r1.dir });
    expect(s.ok).toBe(true);
    expect(s.items).toHaveLength(3);
    expect(s.outDir.startsWith(join(r1.dir, '输出'))).toBe(true);
    expect(existsSync(join(r1.dir, '输出'))).toBe(false);
    // 安装目录只读：一个产物都没写进去
    expect(readdirSync(src).sort()).toEqual(['a.jpg', 'b.mp4', 'c.pdf']);
  });
  it('安装包里没有演示素材：ok:false + 可读原因，不抛', async () => {
    const r = await call(IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_MATERIALS);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/演示素材/);
  });
});
