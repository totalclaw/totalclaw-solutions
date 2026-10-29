/**
 * 慈善活动内容工场 · 模型解析口径：与单聊同一份 brain 配置。
 *   · brain 已配（setConfiguredDefaultProvider 注入 slug）、agent config.yaml 的 model.provider 为空
 *     （bridge 的 chatCompletionsForVision 抛 NO_PROVIDER）→ 第 2 步照样跑通：看图读不出就如实说明、报告走 runOneshotChat（单聊同路）
 *   · brain 也没配 → 友好文案「请先在设置 → 模型里选择默认模型」，不暴露 config.yaml 字段名
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const H = vi.hoisted(() => ({ handlers: new Map<string, (...a: any[]) => any>(), slug: 'deepseek', oneshot: [] as string[] }));

vi.mock('electron', () => ({
  ipcMain: { handle: (ch: string, fn: (...a: any[]) => any) => { H.handlers.set(ch, fn); } },
  app: { isPackaged: true, getPath: () => tmpdir() },
  dialog: {}, BrowserWindow: class {}, nativeImage: { createFromPath: () => ({ isEmpty: () => true }) },
}));
vi.mock('../services/qiyeApiBridge', () => ({
  qiyeApiBridge: {
    chatCompletionsForVision: vi.fn(async () => { throw new Error('[QIYE_API_NO_PROVIDER] agent 未配置默认模型(config.yaml model.provider 为空)'); }),
    chatCompletionsForText: vi.fn(async () => { throw new Error('[QIYE_API_NO_PROVIDER] 不该走到这里'); }),
  },
  getConfiguredDefaultProvider: () => H.slug,
}));
vi.mock('../services/councilChatRouter', () => ({
  runOneshotChat: vi.fn(async (_d: any, prompt: string) => {
    H.oneshot.push(prompt);
    const lang = /用简体中文/.test(prompt) ? 'zh' : /English/.test(prompt) ? 'en' : 'ar';
    const t = { zh: ['报告', '概况', '亮点', '现场', '致谢', '摘要', '字幕'], en: ['Report', 'Overview', 'Highlight', 'Scene', 'Thanks', 'Summary', 'Caption'], ar: ['تقرير', 'نظرة', 'أبرز', 'مشهد', 'شكر', 'ملخص', 'ترجمة'] }[lang];
    return `好的：\n\`\`\`json\n${JSON.stringify({ title: t[0], overview: t[1], highlights: [t[2]], scene: t[3], thanks: t[4], summary: t[5], captions: [t[6]] })}\n\`\`\``;
  }),
}));
vi.mock('../services/agentPython', () => ({ resolveAgentPython: () => null }));
vi.mock('../services/mediaModelConfig', () => ({ readAgentEnv: () => ({}) }));
vi.mock('../services/ffmpegPath', () => ({ resolveFfmpegPair: () => ({ ffmpeg: null, ffprobe: null }), ffmpegSpawnEnv: () => ({}) }));
vi.mock('../services/runtimeLocation', () => ({ runtimeResourcesPath: () => join(tmpdir(), 'cc-no-resources'), shellResourcesPath: () => join(tmpdir(), 'cc-no-resources'), shellResource: (...s: string[]) => join(tmpdir(), 'cc-no-resources', ...s) }));
vi.mock('../services/charityContent/render', () => ({
  renderHtmlToPdf: vi.fn(async (_h: string, out: string) => writeFileSync(out, 'pdf')),
  renderHtmlToImage: vi.fn(async (_h: string, out: string) => writeFileSync(out, 'img')),
  imageToDataUrl: () => 'data:image/jpeg;base64,AA',
  audioToDataUrl: () => '',
}));

import { IPC_CHANNELS } from '@totalclaw/ipc-contracts';
import { registerCharityContentHandlers } from './charityContent.ipc';

const call = (ch: string, payload?: any) => H.handlers.get(ch)!({}, payload);
const logger = { info: vi.fn(), warn: vi.fn() };
const ARCHIVE = { orgName: { zh: '机构', en: 'Org', ar: 'جهة' }, eventName: { zh: '活动', en: 'Event', ar: 'فعالية' }, date: '2026-08-15', location: { zh: '', en: '', ar: '' }, participants: 10, donation: '', organizer: { zh: '', en: '', ar: '' }, summary: { zh: 's', en: 's', ar: 's' }, source: 'manual' };
let material = '';

beforeEach(() => {
  H.handlers.clear(); H.oneshot = []; H.slug = 'deepseek';
  material = mkdtempSync(join(tmpdir(), 'cc-brain-'));
  writeFileSync(join(material, 'a.jpg'), 'x');
  registerCharityContentHandlers({ logger, appConfig: { brain: { profiles: { default: { provider: 'deepseek', model: 'deepseek-v4-flash' } } } }, authState: { authenticated: true }, qiyeApiProc: null, getMainWindow: () => null } as any);
});
afterEach(() => rmSync(material, { recursive: true, force: true }));

describe('brain 已配、config.yaml 为空', () => {
  it('第 2 步：看图失败如实说明（不整体失败），报告三语经单聊同路生成，PDF/海报落盘', async () => {
    const s = await call(IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, { dir: material });
    expect(s.ok).toBe(true);
    const an = await call(IPC_CHANNELS.WORKBENCH_CHARITY_ANALYZE, { runId: s.runId, outDir: s.outDir, items: [join(material, 'a.jpg')], archive: ARCHIVE });
    expect(an.ok).toBe(true);
    expect(an.descriptions).toEqual([]);
    expect(an.warning).toContain('画面描述不可用');
    expect(an.warning).not.toContain('config.yaml');
    const r = await call(IPC_CHANNELS.WORKBENCH_CHARITY_REPORT, { runId: s.runId, outDir: s.outDir, archive: ARCHIVE, descriptions: an.descriptions, images: [join(material, 'a.jpg')] });
    expect(r.ok).toBe(true);
    expect(r.report.zh.title).toBe('报告');
    expect(r.report.ar.title).toBe('تقرير');
    expect(H.oneshot).toHaveLength(3);
    expect(r.pdf.ar).toBe(join(s.outDir, 'report-ar.pdf'));
    expect(logger.info.mock.calls.some((c) => String(c[1]).includes('报告已生成') && c[2]?.via === 'llm/llm/llm')).toBe(true);
  });
  it('brain 也没配：友好文案 + 不暴露 config.yaml', async () => {
    H.slug = '';
    H.handlers.clear();
    registerCharityContentHandlers({ logger, appConfig: {}, authState: { authenticated: true }, qiyeApiProc: null, getMainWindow: () => null } as any);
    const s = await call(IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, { dir: material });
    const r = await call(IPC_CHANNELS.WORKBENCH_CHARITY_REPORT, { runId: s.runId, outDir: s.outDir, archive: ARCHIVE, descriptions: [], images: [] });
    expect(r.ok).toBe(false);
    expect(r.error).toContain('请先在设置 → 模型里选择默认模型');
    expect(r.error).not.toContain('config.yaml');
    const a = await call(IPC_CHANNELS.WORKBENCH_CHARITY_ARCHIVE_DRAFT, { runId: s.runId, outDir: s.outDir, images: [join(material, 'a.jpg')] });
    expect(a.error).toContain('请先在设置 → 模型里选择默认模型');
  });
});
