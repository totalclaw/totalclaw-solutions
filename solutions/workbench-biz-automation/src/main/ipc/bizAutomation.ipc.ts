/**
 * 解决方案 · 经营自动化智能体（主进程）。docs/biz-automation-workbench.md
 *
 * 一条动作通道 WORKBENCH_BA_INVOKE，按 action 分发到四个模块；状态变化经 WORKBENCH_BA_EVENT 推给渲染层。
 *
 *   A 短视频：商品图 + 试穿图 → 模型写分镜与各平台文案（价格 / 折扣只许来自人填的活动信息）→ 本地成片 → 人审核
 *     → 渲染层用现成的「视频发布」固定流程发到抖音 / 快手 / 小红书 / 视频号（与短视频工作台、慈善工场同一条链路）；
 *   B 数字人：知识库事实 → 讲稿（缺的写【待补充】，补完才能成片）→ 数字人服务口播成片 → 同样进发布链路；
 *   C 上下架：按渠道生成标题卖点详情 + 主图（按渠道比例补白边）→ 人确认 → 交给数字员工在网店后台操作、停在提交前；
 *     售罄 / 断码 / 过季 / 试穿多成交少按规则提醒，售罄可自动把门店试穿手机端下架（只动本机）；
 *   D 经营数据：导入收银 / 费用表（只读）→ 固定口径算指标 → 模型写解读并回核数字 → 推送 / 导出。
 *   定时：日报、库存巡检、每周主推视频草稿，每分钟检查一次是否到点。
 */
import { app, dialog, ipcMain, Notification, shell, type BrowserWindow } from 'electron';
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import type { ChildProcess } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline as streamPipeline } from 'node:stream/promises';
import {
  IPC_CHANNELS, BA_PUBLISH_PLATFORMS,
  type ApGarment, type BaAvatarProject, type BaAvatarTopic, type BaListing, type BaLogEntry, type BaModuleKey, type BaPublishPlatform,
  type BaReport, type BaRuleAction, type BaScene, type BaSettings, type BaState, type BaVideoProject, type BaVideoStats, type BaVideoStep, type BaVideoType,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { onAppWillQuit } from '../util/quitRegistry';
import { createWorkbenchLlm } from '../services/workbenchLlm';
import { BizAutomationStore, newId } from '../services/bizAutomation/store';
import {
  applyInventory, bannedHits, clampTitle, computeMetrics, dueToday, evaluateRules, metricsFacts, parseExpenses, parseInventory, parseSales, placeholders, reportPeriod,
  shiftDate, strayPrices, unverifiedNumbers, appendVideoEvent, publishRunFromWorkflow,
} from '../services/bizAutomation/logic';
import * as P from '../services/bizAutomation/prompts';
import { renderShortVideo } from '../services/bizAutomation/videoRender';
import { readTable } from '../services/serviceSettlement/excel';
import { writeWorkbook } from '../services/serviceSettlement/excel';
import { OUT_H, OUT_W, burnAss, killTree, prepareSubtitleFonts, probeMedia, runProc, type MediaTools, type ProcRegistry } from '../services/charityContent/media';
import { buildAss } from '../services/charityContent/subtitles';
import { imageToDataUrl, renderHtmlToImage, renderHtmlToPdf } from '../services/charityContent/render';
import type { PipelineDeps } from '../services/charityContent/pipeline';
import { resolveFfmpegPair, ffmpegSpawnEnv } from '../services/ffmpegPath';
import { resolveAgentPython } from '../services/agentPython';
import { readAgentEnv } from '../services/mediaModelConfig';
import { shellResourcesPath } from '../services/runtimeLocation';
import { runFalJob, uploadFalFile, falKeysReady } from './mediaFal.ipc';
import { bindTtsRouterToSolution, getTtsRouter } from '../services/media/ttsRouter';
import { isTaskFailed, isTaskFinished } from '../services/digitalHumanProc';
import { knowledgeStore } from '../services/knowledgeBase/service';
import { rankFacts } from '../services/knowledgeBase/retrieval';
import { fieldLabel } from '../services/knowledgeBase/fieldCatalog';
import { apparelService } from './apparelStore.ipc';
import { sizeChartRows } from '../services/apparelStore/logic';
import { documentsFolderName } from '../services/brandPaths';

export const BIZ_SOLUTION_ID = 'workbench-biz-automation';
const store = new BizAutomationStore();

const VIDEO_TYPE_LABEL = (): Record<BaVideoType, string> => ({
  new_arrival: i18nT('新品上新'), multi_look: i18nT('一衣多搭'), store_tour: i18nT('门店探店'), promotion: i18nT('促销活动'), styling_tips: i18nT('穿搭教程'),
});
const AVATAR_TOPIC_LABEL = (): Record<BaAvatarTopic, string> => ({
  company_intro: i18nT('企业介绍'), brand_story: i18nT('品牌故事'), store_opening: i18nT('新店开业'), service_intro: i18nT('门店服务介绍'), recruiting: i18nT('招聘'), holiday: i18nT('节日祝福'),
});
const PLATFORM_PARAM: Record<BaPublishPlatform, string> = { douyin: 'douyin', kuaishou: 'kuaishou', xiaohongshu: 'xiaohongshu', wxchannels: 'wxchannels' };
const PLATFORM_LABEL = (): Record<string, string> => ({ douyin: i18nT('抖音'), kuaishou: i18nT('快手'), xiaohongshu: i18nT('小红书'), wxchannels: i18nT('视频号') });
const platformNames = (ids: string[]): string => ids.map((x) => PLATFORM_LABEL()[x] || x).join(i18nT('、'));

function requireFound<T>(v: T | undefined | null, what: string): T {
  if (v == null) throw new Error(i18nT('{p0}不存在或已删除', { p0: what }));
  return v;
}

export function registerBizAutomationHandlers(deps: WorkbenchIpcDeps): () => void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const broadcast = (type: 'state' | 'progress', payload?: unknown): void => {
    try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_BA_EVENT, { type, payload }); } catch { /* 窗口已关 */ }
  };
  const pushState = (): void => broadcast('state');
  const progress = (key: BaModuleKey | 'schedule', message: string): void => broadcast('progress', { key, message });
  const log = (module: BaLogEntry['module'], text: string, ok = true): void => {
    store.update((s) => { s.log.unshift({ at: new Date().toISOString(), module, text, ok }); });
  };

  const { modelOptions, llm, llmJson } = createWorkbenchLlm(deps, {
    logTag: 'biz-automation',
    moduleModel: (m) => store.read().settings.moduleModels[m as BaModuleKey] || '',
  });

  // ── 公共 ─────────────────────────────────────────
  /** 导出目录；create=false 只算路径（展示用），真正写文件时才建 */
  const outputDir = (sub?: string, create = true): string => {
    const s = store.read().settings;
    const root = s.outputDir && existsSync(s.outputDir) ? s.outputDir : join(app.getPath('documents'), documentsFolderName(), i18nT('经营自动化'));
    const dir = sub ? join(root, sub) : root;
    if (create) mkdirSync(dir, { recursive: true });
    return dir;
  };
  const agentHome = (): string | undefined => ((deps.appConfig as any)?.engines?.['totalclaw-agent']?.totalclawHome || (deps as any).totalclawAgentHome) as string | undefined;
  const tools = (): MediaTools | null => {
    const res = shellResourcesPath();
    const pair = resolveFfmpegPair(res);
    if (!pair.ffmpeg || !pair.ffprobe) return null;
    let agentEnv: Record<string, string> = {};
    try { const home = agentHome(); if (home) agentEnv = readAgentEnv(home); } catch { agentEnv = {}; }
    return {
      ffmpeg: pair.ffmpeg, ffprobe: pair.ffprobe, python: resolveAgentPython(res),
      scriptsDir: join(res, 'bundled-skills', 'marketing-sales', 'totalclaw-video-studio', 'scripts'),
      env: { ...process.env, ...agentEnv, ...ffmpegSpawnEnv(res), PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1', PYTHONIOENCODING: 'utf-8' },
    };
  };
  const imageReady = (): boolean => { try { return falKeysReady(deps, BIZ_SOLUTION_ID); } catch { return false; } };
  const pipelineDeps = (key: BaModuleKey): PipelineDeps => {
    const hasFal = imageReady();
    const unsupported = async (): Promise<never> => { throw new Error('unsupported'); };
    return {
      resourcesDir: shellResourcesPath(),
      tools: tools(),
      agentHome: agentHome(),
      fal: hasFal
        ? {
          run: (req, signal, onProgress) => runFalJob(deps, { ...req, solutionId: BIZ_SOLUTION_ID }, { signal, onProgress }),
          tts: bindTtsRouterToSolution(getTtsRouter(), BIZ_SOLUTION_ID),
          upload: (path, signal) => uploadFalFile(deps, path, { solutionId: BIZ_SOLUTION_ID, signal }),
        }
        : { run: null, tts: null, upload: null },
      vision: unsupported, text: unsupported, renderPdf: unsupported, renderImage: unsupported,
      imageDataUrl: () => '',
      progress: (_stage, msg) => progress(key, msg),
      log: { info: (m, ctx) => logger?.info?.('biz-automation', m, ctx), warn: (m, ctx) => logger?.warn?.('biz-automation', m, ctx) },
    };
  };
  // 正在跑的成片：可取消
  const runs = new Map<string, { controller: AbortController; children: Set<ChildProcess> }>();
  const registryFor = (id: string): ProcRegistry => {
    const controller = new AbortController();
    const children = new Set<ChildProcess>();
    runs.set(id, { controller, children });
    return { signal: controller.signal, add: (c) => children.add(c), remove: (c) => children.delete(c) };
  };

  const garments = (): ApGarment[] => apparelService()?.store.read().garments || [];
  const garment = (id: string): ApGarment | undefined => garments().find((g) => g.id === id);
  const tryonImages = (garmentId: string, max = 3): string[] => {
    const s = apparelService()?.store.read();
    if (!s) return [];
    return s.tryons.filter((t) => t.garmentId === garmentId && t.status === 'done' && t.image && existsSync(t.image)).map((t) => t.image!).slice(0, max);
  };

  const knowledgeFacts = (): Array<{ label: string; value: string }> => {
    try {
      const ks = knowledgeStore();
      return rankFacts(ks.facts(ks.currentGraphId())).slice(0, 40).map((f) => ({ label: fieldLabel(f.field), value: String(f.value) }));
    } catch { return []; }
  };

  const sendMail = async (input: { to: string[]; subject: string; body: string }) => {
    const { sendCaseMail } = await import('../services/caseMailSender');
    const relay = deps.serviceAuth ? { send: (i: Parameters<NonNullable<typeof deps.serviceAuth>['relaySendMail']>[0]) => deps.serviceAuth!.relaySendMail(i) } : null;
    return sendCaseMail((deps.readEmailCredentials?.() ?? {}) as any, input, relay);
  };
  const pushReady = (): boolean => { const st = deps.cronNotifyStore?.get(); return !!st && Object.values(st.outlets || {}).some(Boolean); };
  const pushOutlets = async (title: string, body: string): Promise<Array<{ channel: string; ok: boolean; error?: string }>> => {
    const settings = deps.cronNotifyStore?.get();
    if (!settings || !Object.values(settings.outlets || {}).some(Boolean)) throw new Error(i18nT('还没有配置推送渠道：请到「设置 → 通知与推送」填写企业微信 / 钉钉机器人或邮箱'));
    const { notifyCronResult } = await import('../services/cronResultNotifier');
    const jobId = 'biz-automation';
    const outcomes = await notifyCronResult(
      { outlets: settings.outlets, enabledJobs: { [jobId]: true } },
      jobId,
      { jobName: title, ok: true, firedAt: Date.now(), summary: body },
      { sendMail: async ({ to, subject, body: b }) => sendMail({ to, subject, body: b }) },
    );
    return outcomes.map((o: any) => ({ channel: String(o.outlet), ok: !!o.ok, error: o.error ? String(o.error) : undefined }));
  };

  const publicState = (): BaState => {
    const s = store.read();
    const d = store.data();
    let knowledge = false;
    try { const ks = knowledgeStore(); knowledge = ks.facts(ks.currentGraphId()).length > 0; } catch { knowledge = false; }
    return {
      settings: s.settings, videos: s.videos, avatars: s.avatars, listings: s.listings, ruleHits: s.ruleHits, imports: s.imports,
      salesRows: d.sales.length, expenseRows: d.expenses.length, reports: s.reports, qa: s.qa, log: s.log,
      ready: { ffmpeg: !!tools(), image: imageReady(), digitalHuman: !!deps.digitalHumanProc, knowledge, push: pushReady() },
      outputDir: outputDir(undefined, false),
    };
  };

  // ── A 短视频 ─────────────────────────────────────

  const videoById = (id: string) => requireFound(store.read().videos.find((v) => v.id === id), i18nT('视频项目'));
  const patchVideo = (id: string, patch: Partial<BaVideoProject>): BaVideoProject => {
    const r = store.update((s) => { const v = requireFound(s.videos.find((x) => x.id === id), i18nT('视频项目')); Object.assign(v, patch, { updatedAt: new Date().toISOString() }); return v; });
    pushState();
    return r;
  };
  /** 节点留痕：写进该视频的 history（历史记录页逐条展示），同时进模块日志 */
  const track = (id: string, step: BaVideoStep, text: string, ok = true): void => {
    let name = '';
    store.update((s) => { const v = s.videos.find((x) => x.id === id); if (!v) return; name = v.name; v.history = appendVideoEvent(v.history, step, text, ok); });
    if (name) log('video', `${name}：${text}`, ok);
    pushState();
  };
  const videoWarnings = (v: BaVideoProject): string[] => {
    const text = [...v.scenes.map((s) => s.line), ...Object.values(v.copies).flatMap((c) => [c?.title, c?.caption])].join('\n');
    const w: string[] = [];
    const banned = bannedHits(text);
    if (banned.length) w.push(i18nT('含广告法极限词：{p0}', { p0: banned.join(i18nT('、')) }));
    const prices = v.garmentIds.map((id) => garment(id)?.price || 0).filter(Boolean);
    const stray = strayPrices(text, v.brief, prices);
    if (stray.length) w.push(i18nT('出现活动信息里没有的价格 / 折扣：{p0}', { p0: stray.join(i18nT('、')) }));
    return w;
  };

  const createVideo = (p: { type: BaVideoType; garmentIds: string[]; brief?: string; platforms?: BaPublishPlatform[]; narration?: boolean; voiceGender?: 'female' | 'male'; name?: string }): BaVideoProject => {
    const ids = (p.garmentIds || []).filter((id) => garment(id));
    if (!ids.length) throw new Error(i18nT('请先选择商品（商品库在「服装AI试衣」里维护）'));
    const materials: string[] = [];
    for (const id of ids) {
      const g = garment(id)!;
      if (g.image && existsSync(g.image)) materials.push(g.image);
      materials.push(...tryonImages(id, p.type === 'multi_look' ? 5 : 2));
    }
    if (!materials.length) throw new Error(i18nT('选中的商品没有图片'));
    const v: BaVideoProject = {
      id: newId('bav'), type: p.type, name: p.name || `${VIDEO_TYPE_LABEL()[p.type]} · ${garment(ids[0])!.name}${ids.length > 1 ? i18nT(' 等 {n} 款', { n: ids.length }) : ''}`,
      garmentIds: ids, brief: String(p.brief || ''), materials, scenes: [], copies: {},
      platforms: (p.platforms?.length ? p.platforms : ['douyin', 'xiaohongshu'] as BaPublishPlatform[]).filter((x) => BA_PUBLISH_PLATFORMS.includes(x)),
      narration: p.narration !== false, voiceGender: p.voiceGender === 'male' ? 'male' : 'female',
      status: 'draft', warnings: [], createdAt: new Date().toISOString(),
    };
    v.history = appendVideoEvent([], 'create', i18nT('创建项目：{p0} · {n} 款商品 · {m} 张素材 · 发布到 {p1}', { p0: VIDEO_TYPE_LABEL()[v.type], n: ids.length, m: materials.length, p1: platformNames(v.platforms) }));
    store.update((s) => { s.videos.unshift(v); });
    pushState();
    return v;
  };

  const scriptVideo = async (id: string): Promise<BaVideoProject> => {
    const v = videoById(id);
    progress('video', i18nT('正在写分镜脚本与各平台文案…'));
    const gs = v.garmentIds.map(garment).filter(Boolean) as ApGarment[];
    const { json, model } = await llmJson('video', P.videoScriptPrompt({ type: v.type, brand: store.read().settings.brandName, brief: v.brief, garments: gs, imageCount: v.materials.length, platforms: v.platforms }));
    const scenes: BaScene[] = (Array.isArray(json.scenes) ? json.scenes : []).slice(0, 8).map((s: any, i: number) => {
      const idx = Number.isInteger(Number(s?.image)) ? Math.min(Math.max(Number(s.image), 0), v.materials.length - 1) : i % v.materials.length;
      return { image: v.materials[idx], line: String(s?.line || '').slice(0, 40) };
    }).filter((s: BaScene) => s.line);
    if (!scenes.length) throw new Error(i18nT('模型没有写出分镜，请重试或换一个模型'));
    const copies: BaVideoProject['copies'] = {};
    for (const p of v.platforms) {
      const c = json.copies?.[p];
      if (!c) continue;
      copies[p] = { title: clampTitle(String(c.title || ''), p === 'xiaohongshu' ? 20 : 30), caption: String(c.caption || '').slice(0, 1000), topics: (Array.isArray(c.topics) ? c.topics : []).map((x: unknown) => String(x).replace(/^#/, '')).filter(Boolean).slice(0, 8) };
    }
    const next = { ...v, scenes, copies };
    const warnings = videoWarnings(next);
    const r = patchVideo(id, { scenes, copies, model, status: 'scripted', error: undefined, video: undefined, warnings });
    track(id, 'script', i18nT('写好分镜脚本 {n} 个镜头、{m} 个平台文案', { n: scenes.length, m: Object.keys(copies).length }) + (warnings.length ? i18nT('（{k} 条提示待处理）', { k: warnings.length }) : ''));
    return videoById(id) ?? r;
  };

  const renderVideo = async (id: string): Promise<BaVideoProject> => {
    const v = videoById(id);
    if (!v.scenes.length) throw new Error(i18nT('先写分镜脚本'));
    patchVideo(id, { status: 'rendering', error: undefined });
    const registry = registryFor(id);
    try {
      const out = join(outputDir(i18nT('短视频')), `${v.name.replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40)}-${Date.now()}.mp4`);
      const r = await renderShortVideo(pipelineDeps('video'), {
        scenes: v.scenes, narration: v.narration, voiceGender: v.voiceGender, title: store.read().settings.brandName,
        workDir: join(store.dir('work'), id), outFile: out,
      }, registry, (msg) => progress('video', msg));
      patchVideo(id, { status: 'rendered', video: r.file, durationSec: r.durationSec, voiceQuality: r.voiceQuality || undefined });
      track(id, 'render', i18nT('成片完成：{s} 秒 · {f}', { s: r.durationSec, f: basename(r.file) }));
      return videoById(id);
    } catch (e) {
      const msg = registry.signal.aborted ? i18nT('已取消') : userFacingError(e);
      patchVideo(id, { status: 'failed', error: msg });
      track(id, 'render', i18nT('成片失败：{p0}', { p0: msg }), false);
      throw new Error(msg);
    } finally {
      runs.delete(id);
    }
  };

  /** 交给渲染层的发布参数（同短视频工作台 buildVideoPublishWorkflow 的入参） */
  const publishInput = (videoPath: string, name: string, platforms: BaPublishPlatform[], copies: BaVideoProject['copies']) => {
    const first = platforms.map((p) => copies[p]).find(Boolean);
    const topics: Record<string, string[]> = {};
    for (const p of platforms) topics[PLATFORM_PARAM[p]] = copies[p]?.topics || [];
    return {
      videoPath, projectName: first?.title || name,
      platforms: platforms.map((p) => PLATFORM_PARAM[p]).join(','),
      topics: JSON.stringify(topics),
      caption: first ? `${first.caption}\n${(first.topics || []).map((t) => `#${t}`).join(' ')}`.trim() : name,
    };
  };

  // ── B 数字人 ─────────────────────────────────────

  const avatarById = (id: string) => requireFound(store.read().avatars.find((a) => a.id === id), i18nT('数字人项目'));
  const patchAvatar = (id: string, patch: Partial<BaAvatarProject>): BaAvatarProject => {
    const r = store.update((s) => { const a = requireFound(s.avatars.find((x) => x.id === id), i18nT('数字人项目')); Object.assign(a, patch, { updatedAt: new Date().toISOString() }); return a; });
    pushState();
    return r;
  };
  const avatarWarnings = (script: string): string[] => {
    const w: string[] = [];
    const ph = placeholders(script);
    if (ph.length) w.push(i18nT('还有 {n} 处【待补充】，补完才能成片', { n: ph.length }));
    const banned = bannedHits(script);
    if (banned.length) w.push(i18nT('含广告法极限词：{p0}', { p0: banned.join(i18nT('、')) }));
    return w;
  };
  const downloadTo = async (url: string, dest: string): Promise<void> => {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(i18nT('成片下载失败（HTTP {p0}）', { p0: res.status }));
    await streamPipeline(Readable.fromWeb(res.body as any), createWriteStream(dest));
  };

  /**
   * 数字人成片后处理：画面顶部固定「本视频由 AI 生成」标识，最后 3 秒叠片尾（门店名 + 地址 / 营业时间）。
   * 按《人工智能生成合成内容标识办法》显式标识；不依赖数字人服务商自己加不加。
   */
  const labelAvatarVideo = async (src: string, dest: string, aspect: '9:16' | '16:9'): Promise<string> => {
    const t = tools();
    if (!t) throw new Error(i18nT('找不到 ffmpeg，无法给数字人成片加 AI 生成标识'));
    const info = await probeMedia(t, src);
    const dur = info?.durationSec || 0;
    const [w, h] = aspect === '9:16' ? [info?.width || OUT_W, info?.height || OUT_H] : [info?.width || OUT_H, info?.height || OUT_W];
    const st = store.read().settings;
    const line = [st.storeAddress, st.openingHours].filter(Boolean).join('  ');
    const work = store.dir(join('work', `avatar-${Date.now()}`));
    const fonts = prepareSubtitleFonts(work);
    const ass = join(work, 'label.ass');
    writeFileSync(ass, buildAss([], 'zh', {
      width: w, height: h, fontName: fonts.nameFor.zh, title: i18nT('本视频由 AI 生成'), durationSec: dur || 1,
      ...(dur > 4 && st.brandName ? { endCard: { start: Math.max(0, dur - 3), end: dur, title: st.brandName, line } } : {}),
    }));
    await burnAss(t, src, ass, fonts.dir, dest);
    return dest;
  };

  /** 缺模特图的款：用换装引擎（多图参考改图）从商品图生成一张模特上身图，补进素材 */
  const fillModelImages = async (videoId: string): Promise<BaVideoProject> => {
    const v = videoById(videoId);
    if (!imageReady()) throw new Error(i18nT('还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发'));
    const dir = store.dir(join('materials', v.id));
    const added: string[] = [];
    const errs: string[] = [];
    for (const id of v.garmentIds) {
      const g = garment(id);
      if (!g?.image || !existsSync(g.image) || tryonImages(id, 1).length) continue;
      progress('video', i18nT('正在为「{p0}」生成模特图…', { p0: g.name }));
      try {
        const r = await runFalJob(deps, { capability: 'edit', prompt: P.modelShotPrompt(g), imageUrls: [g.image], num: 1, outDir: dir, solutionId: BIZ_SOLUTION_ID, maxWaitMs: 180_000 });
        const f = r.files.find(Boolean);
        if (f) added.push(f);
      } catch (e) { errs.push(`${g.name}：${userFacingError(e)}`); }
    }
    if (!added.length && errs.length) { track(videoId, 'material', i18nT('补模特图失败：{p0}', { p0: errs[0] }), false); throw new Error(errs[0]); }
    const r = patchVideo(videoId, { materials: [...v.materials, ...added] });
    if (added.length) track(videoId, 'material', i18nT('补了 {n} 张模特图', { n: added.length }) + (errs.length ? i18nT('，{m} 款失败', { m: errs.length }) : ''));
    return r;
  };

  /** 写数字人讲稿草稿（事实只取知识库，缺的写【待补充】）；名称可指定（节日日历用） */
  const createAvatar = async (p: { topic: BaAvatarTopic; seconds?: number; brief?: string; name?: string }): Promise<BaAvatarProject> => {
    const topic = p?.topic && p.topic in AVATAR_TOPIC_LABEL() ? p.topic : 'company_intro';
    const facts = knowledgeFacts();
    const seconds = Math.min(Math.max(Math.round(p?.seconds || 45), 20), 120);
    progress('avatar', i18nT('正在从知识库取资料写讲稿…'));
    const extra = p?.brief ? [{ label: i18nT('补充说明'), value: String(p.brief).slice(0, 500) }] : [];
    const { text, model } = await llm('avatar', P.avatarScriptPrompt({ topic: AVATAR_TOPIC_LABEL()[topic], brand: store.read().settings.brandName, facts: [...facts, ...extra], seconds }));
    const script = text.replace(/^```[a-z]*\s*|```$/g, '').trim();
    const a: BaAvatarProject = {
      id: newId('baa'), topic, name: p?.name || `${AVATAR_TOPIC_LABEL()[topic]} · ${new Date().toLocaleDateString()}`, script, facts: [...facts.slice(0, 20), ...extra], durationHint: seconds,
      avatarId: '', voiceId: '', aspectRatio: '9:16', likenessConsent: '', status: 'scripted', warnings: avatarWarnings(script), model, createdAt: new Date().toISOString(),
    };
    store.update((s) => { s.avatars.unshift(a); });
    pushState();
    return a;
  };

  // ── C 上下架 ─────────────────────────────────────

  const listingById = (id: string) => requireFound(store.read().listings.find((l) => l.id === id), i18nT('上架草稿'));
  const patchListing = (id: string, patch: Partial<BaListing>): BaListing => {
    const r = store.update((s) => { const l = requireFound(s.listings.find((x) => x.id === id), i18nT('上架草稿')); Object.assign(l, patch, { updatedAt: new Date().toISOString() }); return l; });
    pushState();
    return r;
  };
  /** 主图：按渠道比例补白边（不裁切衣服） */
  const mainImage = async (src: string, aspect: '1:1' | '3:4', dest: string): Promise<string> => {
    const t = tools();
    if (!t) { copyFileSync(src, dest); return dest; }
    const [w, h] = aspect === '1:1' ? [1080, 1080] : [1080, 1440];
    const r = await runProc(t.ffmpeg, ['-v', 'error', '-y', '-i', src, '-vf', `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:white`, '-q:v', '2', dest], { env: t.env, timeoutMs: 60_000 });
    if (r.code !== 0 || !existsSync(dest)) { copyFileSync(src, dest); }
    return dest;
  };
  const esc = (x: string) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  /** 尺码表图：尺码 × 身高 / 体重参考（规则算，不经模型） */
  const sizeChartImage = async (g: ApGarment, aspect: '1:1' | '3:4', dest: string): Promise<string | null> => {
    const rows = sizeChartRows(g.audience, Object.keys(g.stock || {}));
    if (!rows.length) return null;
    const [w, h] = aspect === '1:1' ? [1080, 1080] : [1080, 1440];
    const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;background:#fff;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif">
<div style="width:86%"><h1 style="font-size:54px;margin:0 0 12px;color:#222">${esc(i18nT('尺码参考'))}</h1><p style="font-size:30px;color:#777;margin:0 0 30px">${esc(g.name)}</p>
<table style="width:100%;border-collapse:collapse;font-size:36px;text-align:center"><tr style="background:#222;color:#fff"><th style="padding:18px">${esc(i18nT('尺码'))}</th><th>${esc(i18nT('身高'))}</th><th>${esc(i18nT('体重'))}</th></tr>
${rows.map((r, i) => `<tr style="background:${i % 2 ? '#f4f4f4' : '#fff'}"><td style="padding:18px;font-weight:700">${esc(r.size)}</td><td>${esc(r.height)}</td><td>${esc(r.weight)}</td></tr>`).join('')}</table>
<p style="font-size:26px;color:#999;margin-top:26px">${esc(i18nT('仅供参考，介于两个尺码之间建议选大一码'))}</p></div></body>`;
    try { await renderHtmlToImage(html, dest, w, h); return existsSync(dest) ? dest : null; } catch { return null; }
  };
  /** 细节图：商品图中部放大（面料、做工） */
  const detailImage = async (src: string, aspect: '1:1' | '3:4', dest: string): Promise<string | null> => {
    const t = tools();
    if (!t) return null;
    const [w, h] = aspect === '1:1' ? [1080, 1080] : [1080, 1440];
    const r = await runProc(t.ffmpeg, ['-v', 'error', '-y', '-i', src, '-vf', `crop=iw*0.5:ih*0.5:iw*0.25:ih*0.3,scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`, '-q:v', '2', dest], { env: t.env, timeoutMs: 60_000 });
    return r.code === 0 && existsSync(dest) ? dest : null;
  };
  /** 主图加角标（断码特价 / 清仓），给数字员工换主图用 */
  const badgeImage = async (src: string, text: string, dest: string): Promise<string | null> => {
    const data = imageToDataUrl(src, 1080);
    if (!data) return null;
    const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;width:1080px;height:1080px;background:#fff url('${data}') center/contain no-repeat;position:relative;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif">
<div style="position:absolute;top:40px;left:-10px;background:#d6332a;color:#fff;font-size:64px;font-weight:800;padding:16px 50px;border-radius:0 40px 40px 0;box-shadow:0 6px 18px rgba(0,0,0,.25)">${esc(text)}</div></body>`;
    try { await renderHtmlToImage(html, dest, 1080, 1080); return existsSync(dest) ? dest : null; } catch { return null; }
  };
  /** 试穿最多的造型图（「试穿多成交少」换主图用） */
  const mostTriedImage = (garmentId: string): string | null => {
    const s = apparelService()?.store.read();
    if (!s) return null;
    const done = s.tryons.filter((t) => t.garmentId === garmentId && t.status === 'done' && t.image && existsSync(t.image));
    if (!done.length) return null;
    const count = new Map<string, number>();
    for (const t of done) { const k = `${t.choice.backgroundId}|${t.choice.poseId}|${t.choice.hairId}`; count.set(k, (count.get(k) || 0) + 1); }
    const top = [...count].sort((a, b) => b[1] - a[1])[0][0];
    return done.filter((t) => `${t.choice.backgroundId}|${t.choice.poseId}|${t.choice.hairId}` === top).pop()!.image!;
  };
  const RULE_ACTION_LABEL = (): Record<BaRuleAction, string> => ({
    delist: i18nT('下架'), presale: i18nT('改为预售'), delist_color: i18nT('下架该颜色'), badge_sale: i18nT('主图加「断码特价」'),
    clearance: i18nT('转入清仓专区'), swap_image: i18nT('换主图（试穿最多的造型图）'), remind: i18nT('提醒店长'),
  });
  /** 规则命中的处理：本机能做的直接做；网店要动的，生成交给数字员工的指令（停在提交前，除非该渠道开了全自动） */
  const handleRule = async (garmentId: string, action: BaRuleAction): Promise<{ done: string[]; text?: string; listingIds: string[] }> => {
    const g = requireFound(garment(garmentId), i18nT('商品'));
    const s = store.read();
    const done: string[] = [];
    const svc = apparelService();
    if ((action === 'delist' || action === 'clearance') && svc && g.onShelf) { svc.saveGarment({ id: g.id, onShelf: false }); done.push(i18nT('门店试穿手机端已下架')); }
    if (action === 'remind') {
      const body = i18nT('「{p0}」需要处理：{p1}', { p0: g.name, p1: s.ruleHits.filter((h) => h.garmentId === g.id).map((h) => h.detail).join('；') });
      try { new Notification({ title: i18nT('经营自动化 · 库存提醒'), body }).show(); } catch { /* 系统通知不可用 */ }
      if (pushReady()) await pushOutlets(i18nT('库存提醒'), body).catch(() => []);
      done.push(i18nT('已提醒'));
      log('listing', body);
      return { done, listingIds: [] };
    }
    const listed = s.listings.filter((l) => l.garmentId === g.id && (l.status === 'listed' || l.status === 'handed'));
    if (!listed.length) {
      if (!done.length) done.push(i18nT('这款在网店还没有上架记录，只需处理门店'));
      return { done, listingIds: [] };
    }
    let img: string | null = null;
    if (action === 'badge_sale' && g.image) img = await badgeImage(g.image, i18nT('断码特价'), join(store.dir(join('listing', g.id)), `badge-${Date.now()}.jpg`));
    if (action === 'swap_image') img = mostTriedImage(g.id);
    const what = RULE_ACTION_LABEL()[action];
    const lines = listed.map((l) => {
      const ch = s.settings.channels.find((c) => c.id === l.channelId);
      return `- ${ch?.name}（${ch?.url}）：${l.productUrl || l.title}${ch?.autoSubmit ? i18nT('（该店铺已授权全自动，可直接提交）') : ''}`;
    });
    const text = [
      i18nT('请在内置浏览器里对下面这款商品执行「{p0}」。只做这一项修改，不要删除商品、不要改价；未授权全自动的店铺，操作停在保存 / 提交前截图给我确认。', { p0: what }),
      i18nT('商品：{p0}（货号 {p1}）', { p0: g.name, p1: g.sku || '—' }),
      ...(action === 'delist_color' ? [i18nT('要下架的颜色：{p0}', { p0: g.color || i18nT('当前颜色') })] : []),
      ...(img ? [i18nT('新主图：{p0}', { p0: img })] : []),
      ...lines,
    ].join('\n');
    return { done, text, listingIds: listed.map((l) => l.id) };
  };

  const listingWarnings = (l: Pick<BaListing, 'title' | 'sellingPoints' | 'detail'>): string[] => {
    const banned = bannedHits([l.title, ...l.sellingPoints, l.detail].join('\n'));
    return banned.length ? [i18nT('含广告法极限词：{p0}', { p0: banned.join(i18nT('、')) })] : [];
  };
  const evaluate = () => {
    const svc = apparelService();
    const stats = svc ? svc.stats() : null;
    const hits = evaluateRules(garments(), store.read().settings, stats);
    store.update((s) => { s.ruleHits = hits; });
    let delisted = 0;
    if (store.read().settings.autoDelistLocal && svc) {
      for (const h of hits.filter((x) => x.rule === 'soldout')) {
        const g = garment(h.garmentId);
        if (g?.onShelf) { svc.saveGarment({ id: g.id, onShelf: false }); delisted++; }
      }
    }
    pushState();
    return { hits, delisted };
  };

  // ── D 经营数据 ─────────────────────────────────────

  /** 导入一份收银 / 费用 / 库存表（只读原文件）。同一日期段重复导入先删后写，不重复计 */
  const doImport = (path: string, kind: 'sales' | 'expense' | 'inventory', source: 'manual' | 'folder', replace = false) => {
    const table = readTable(path);
    if (!table.rows.length) throw new Error(i18nT('「{p0}」里没有数据行', { p0: table.fileName }));
    if (kind === 'inventory') {
      const parsed = parseInventory(table.headers, table.rows);
      if (!parsed.rows.length) throw new Error(i18nT('没有识别出有效的库存行（货号 / 名称与库存都要有）'));
      const svc = apparelService();
      if (!svc) throw new Error(i18nT('服装AI试衣未加载'));
      const { updates, unmatched } = applyInventory(garments(), parsed.rows);
      for (const u of updates) svc.saveGarment({ id: u.id, stock: u.stock });
      const day = new Date().toISOString().slice(0, 10);
      const imp = { id: newId('bai'), kind, source, file: table.fileName, rows: parsed.rows.length, skipped: parsed.skipped + unmatched.length, mapping: parsed.mapping, from: day, to: day, importedAt: new Date().toISOString() };
      store.update((s) => { s.imports.unshift(imp); s.imports = s.imports.slice(0, 50); });
      log('finance', i18nT('同步库存：{p0}，更新 {n} 款{p1}', { p0: table.fileName, n: updates.length, p1: unmatched.length ? i18nT('，{m} 个货号在商品库里找不到：{p2}', { m: unmatched.length, p2: unmatched.slice(0, 5).join(i18nT('、')) }) : '' }));
      evaluate(); // 库存变了，规则跟着重算（售罄的门店手机端自动下架）
      pushState();
      return { ...imp, unmatched };
    }
    const parsed = kind === 'expense' ? parseExpenses(table.headers, table.rows) : parseSales(table.headers, table.rows);
    if (!parsed.rows.length) throw new Error(i18nT('没有识别出有效数据行（日期、金额都要有）'));
    const dates = parsed.rows.map((r) => r.date).sort();
    const from = dates[0];
    const to = dates[dates.length - 1];
    store.updateData((d) => {
      if (kind === 'expense') d.expenses = [...d.expenses.filter((x) => (replace ? false : x.date < from || x.date > to)), ...(parsed.rows as any)];
      else d.sales = [...d.sales.filter((x) => (replace ? false : x.date < from || x.date > to)), ...(parsed.rows as any)];
    });
    const imp = { id: newId('bai'), kind, source, file: table.fileName, rows: parsed.rows.length, skipped: parsed.skipped, mapping: parsed.mapping, from, to, importedAt: new Date().toISOString() };
    store.update((s) => { s.imports.unshift(imp); s.imports = s.imports.slice(0, 50); });
    log('finance', i18nT('导入{p0}：{p1}（{a} ~ {b}，{n} 行）', { p0: kind === 'expense' ? i18nT('费用') : i18nT('销售'), p1: table.fileName, a: from, b: to, n: parsed.rows.length }));
    pushState();
    return imp;
  };

  /** 共享文件夹取数：每个文件夹取最新一份没导过的表；失败写日志并提醒，不拿旧数据冒充 */
  const folderImport = async (force = false): Promise<Array<{ kind: string; file?: string; ok: boolean; note: string }>> => {
    const folders = store.read().settings.dataFolders;
    const out: Array<{ kind: string; file?: string; ok: boolean; note: string }> = [];
    for (const kind of ['sales', 'expense', 'inventory'] as const) {
      const dir = folders[kind];
      if (!dir) continue;
      const label = kind === 'sales' ? i18nT('销售') : kind === 'expense' ? i18nT('费用') : i18nT('库存');
      try {
        if (!existsSync(dir)) throw new Error(i18nT('文件夹不存在：{p0}', { p0: dir }));
        const files = readdirSync(dir).filter((f) => /\.(xlsx|xls|csv)$/i.test(f) && !f.startsWith('~$')).map((f) => ({ f: join(dir, f), m: statSync(join(dir, f)).mtime.toISOString() })).sort((a, b) => b.m.localeCompare(a.m));
        if (!files.length) throw new Error(i18nT('文件夹里没有 Excel / CSV 文件'));
        const latest = files[0];
        if (!force && store.read().seen.files[latest.f] === latest.m) { out.push({ kind, file: basename(latest.f), ok: true, note: i18nT('没有新文件') }); continue; }
        const imp: any = doImport(latest.f, kind, 'folder');
        store.update((s) => { s.seen.files[latest.f] = latest.m; });
        out.push({ kind, file: basename(latest.f), ok: true, note: i18nT('{n} 行', { n: imp.rows }) });
      } catch (e) {
        const msg = userFacingError(e);
        out.push({ kind, ok: false, note: msg });
        log('finance', i18nT('{p0}取数失败：{p1}', { p0: label, p1: msg }), false);
        try { new Notification({ title: i18nT('经营自动化 · 取数失败'), body: `${label}：${msg}` }).show(); } catch { /* 系统通知不可用 */ }
      }
    }
    pushState();
    return out;
  };

  const buildReport = async (kind: BaReport['kind'], from: string, to: string): Promise<BaReport> => {
    const d = store.data();
    if (!d.sales.length) throw new Error(i18nT('还没有销售数据：先导入收银系统导出的销售明细'));
    const metrics = computeMetrics(d.sales, d.expenses, garments(), from, to);
    const hints: string[] = [];
    if (!metrics.orders) hints.push(i18nT('这个时间段没有销售记录'));
    if (metrics.costCoverage < 1) hints.push(i18nT('只有部分销售带成本，毛利按带成本的部分计算'));
    const staleNote = metrics.lastDataDay && metrics.lastDataDay < to
      ? i18nT('销售数据只到 {p0}，{p1} 之后还没取到数据（取数可能没更新），这部分不计入', { p0: metrics.lastDataDay, p1: metrics.lastDataDay })
      : undefined;
    if (staleNote) hints.push(staleNote);
    const lowStock = store.read().ruleHits.filter((h) => h.rule === 'soldout' || h.rule === 'broken_size').slice(0, 5);
    if (lowStock.length) hints.push(i18nT('库存预警：{p0}', { p0: lowStock.map((h) => `${garment(h.garmentId)?.name || h.garmentId}（${h.detail}）`).join('；') }));
    let commentary = '';
    let model: string | undefined;
    let unverified: string[] = [];
    try {
      progress('finance', i18nT('正在写经营解读…'));
      const r = await llm('finance', P.reportCommentaryPrompt({ kind, brand: store.read().settings.brandName, metrics, hints }));
      commentary = r.text.trim();
      model = r.model;
      unverified = unverifiedNumbers(commentary, metrics);
    } catch (e) {
      // 模型不可用时报表照出（数字是规则算的），解读留空并写明原因
      commentary = i18nT('（经营解读未生成：{p0}）', { p0: userFacingError(e) });
    }
    const report: BaReport = { id: newId('bar'), kind, metrics, commentary, unverified, model, staleNote, createdAt: new Date().toISOString() };
    store.update((s) => { s.reports.unshift(report); });
    pushState();
    return report;
  };
  const reportText = (r: BaReport): string => {
    const m = r.metrics;
    const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
    const lines = [
      i18nT('【{p0}】{a} ~ {b}', { p0: store.read().settings.brandName || i18nT('经营日报'), a: m.from, b: m.to }),
      i18nT('净营业额 {p0} 元（退货 {p1}）｜订单 {p2}｜客单价 {p3}｜连带率 {p4}', { p0: m.netRevenue, p1: m.refunds, p2: m.orders, p3: m.avgOrderValue, p4: m.unitsPerOrder }),
      i18nT('毛利 {p0} 元（毛利率 {p1}，成本覆盖 {p2}）｜费用 {p3}｜净利润 {p4}', { p0: m.grossProfit, p1: pct(m.grossMargin), p2: pct(m.costCoverage), p3: m.expenses, p4: m.netProfit }),
    ];
    if (r.staleNote) lines.unshift(`⚠ ${r.staleNote}`);
    if (m.items.length) lines.push(i18nT('畅销前 5：{p0}', { p0: m.items.slice(0, 5).map((x) => `${x.label} ${x.qty}${i18nT('件')} / ${x.amount}`).join(i18nT('、')) }));
    if (m.turnoverDays != null) lines.push(i18nT('库存金额约 {p0} 元，周转约 {p1} 天', { p0: m.inventoryValue, p1: m.turnoverDays }));
    const warn = store.read().ruleHits.filter((h) => h.rule === 'soldout' || h.rule === 'broken_size').slice(0, 5);
    if (warn.length) lines.push(i18nT('库存预警：{p0}', { p0: warn.map((h) => `${garment(h.garmentId)?.name || ''}（${h.detail}）`).join('；') }));
    if (r.commentary) lines.push('', r.commentary);
    if (r.unverified.length) lines.push('', i18nT('⚠ 解读中这些数字未能在数据中核对到：{p0}', { p0: r.unverified.join(i18nT('、')) }));
    return lines.join('\n');
  };

  /** 报表 PDF：汇总、趋势图、渠道 / 品类、款式排行、滞销清单、经营解读 */
  const reportHtml = (r: BaReport): string => {
    const m = r.metrics;
    const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
    const max = Math.max(1, ...m.daily.map((d) => d.netRevenue));
    const bw = m.daily.length ? Math.max(4, Math.floor(640 / m.daily.length) - 4) : 10;
    const bars = m.daily.map((d, i) => { const h = Math.round((Math.max(0, d.netRevenue) / max) * 160); return `<rect x="${i * (bw + 4)}" y="${170 - h}" width="${bw}" height="${h}" fill="#2f6fde"/>`; }).join('');
    const table = (head: string[], rows: (string | number)[][]) => `<table><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${rows.map((row) => `<tr>${row.map((c) => `<td>${esc(String(c))}</td>`).join('')}</tr>`).join('')}</table>`;
    return `<!doctype html><meta charset="utf-8"><style>
body{font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;color:#222;padding:28px;font-size:12px}h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;margin:18px 0 6px}
.k{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.k div{border:1px solid #ddd;border-radius:8px;padding:8px}.k b{display:block;font-size:16px}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:4px 6px;text-align:left}th{background:#f3f4f6}.warn{color:#b45309}pre{white-space:pre-wrap;font:inherit}</style>
<h1>${esc(store.read().settings.brandName || i18nT('经营报表'))} · ${esc(m.from)} ~ ${esc(m.to)}</h1>
${r.staleNote ? `<p class="warn">⚠ ${esc(r.staleNote)}</p>` : ''}
<div class="k"><div>${esc(i18nT('净营业额'))}<b>${m.netRevenue}</b></div><div>${esc(i18nT('毛利'))}<b>${m.grossProfit}（${pct(m.grossMargin)}）</b></div><div>${esc(i18nT('订单 / 客单价'))}<b>${m.orders} / ${m.avgOrderValue}</b></div><div>${esc(i18nT('连带率'))}<b>${m.unitsPerOrder}</b></div>
<div>${esc(i18nT('费用 / 费用率'))}<b>${m.expenses} / ${pct(m.expenseRate)}</b></div><div>${esc(i18nT('净利润'))}<b>${m.netProfit}</b></div><div>${esc(i18nT('库存金额'))}<b>${m.inventoryValue ?? '—'}</b></div><div>${esc(i18nT('库存周转天数'))}<b>${m.turnoverDays ?? '—'}</b></div></div>
<h2>${esc(i18nT('每日趋势（净营业额）'))}</h2><svg width="660" height="180">${bars}</svg>
<h2>${esc(i18nT('渠道'))}</h2>${table([i18nT('渠道'), i18nT('金额'), i18nT('占比')], m.byChannel.map((x) => [x.label, x.value, pct(x.share || 0)]))}
<h2>${esc(i18nT('品类'))}</h2>${table([i18nT('品类'), i18nT('金额'), i18nT('占比')], m.byCategory.map((x) => [x.label, x.value, pct(x.share || 0)]))}
<h2>${esc(i18nT('款式排行'))}</h2>${table([i18nT('商品'), i18nT('销量'), i18nT('金额'), i18nT('毛利'), i18nT('售罄率')], m.items.slice(0, 20).map((x) => [x.label, x.qty, x.amount, x.grossProfit ?? '—', x.sellThrough == null ? '—' : pct(x.sellThrough)]))}
<h2>${esc(i18nT('滞销清单（有库存、本期卖出不超过 1 件）'))}</h2>${m.slowMovers.length ? table([i18nT('商品'), i18nT('库存'), i18nT('本期销量')], m.slowMovers.map((x) => [x.label, x.stock, x.qty])) : `<p>${esc(i18nT('无'))}</p>`}
<h2>${esc(i18nT('经营解读'))}</h2><pre>${esc(r.commentary)}</pre>${r.unverified.length ? `<p class="warn">${esc(i18nT('未能核对的数字：{p0}', { p0: r.unverified.join(i18nT('、')) }))}</p>` : ''}`;
  };

  // ── 定时 ─────────────────────────────────────────

  let ticking = false;
  const tick = async (): Promise<void> => {
    if (ticking) return;
    ticking = true;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const mark = (key: string) => store.update((s) => { s.lastRun[key] = today; });
    try {
      const sc = store.read().settings.schedule;
      // 共享文件夹取数排在日报之前
      if (sc.folderImport.enabled && dueToday(sc.folderImport.time, store.read().lastRun.folderImport, now)) {
        mark('folderImport');
        const r = await folderImport();
        log('schedule', i18nT('共享文件夹取数：{p0}', { p0: r.map((x) => `${x.kind} ${x.ok ? '✓' : '✗'} ${x.note}`).join('；') || i18nT('没有配置文件夹') }), r.every((x) => x.ok));
      }
      if (sc.dailyReport.enabled && dueToday(sc.dailyReport.time, store.read().lastRun.dailyReport, now)) {
        mark('dailyReport');
        try {
          const p = reportPeriod('daily', now);
          const r = await buildReport('daily', p.from, p.to);
          if (sc.dailyReport.push) {
            const pushed = await pushOutlets(i18nT('经营日报 {p0}', { p0: p.from }), reportText(r)).catch((e) => [{ channel: 'push', ok: false, error: userFacingError(e) }]);
            store.update((s) => { const x = s.reports.find((y) => y.id === r.id); if (x) x.pushed = pushed; });
          }
          log('schedule', i18nT('已生成 {p0} 经营日报', { p0: p.from }));
        } catch (e) { log('schedule', i18nT('经营日报没有生成：{p0}', { p0: userFacingError(e) }), false); }
      }
      if (sc.monthlyReport.enabled && now.getDate() === Math.min(Math.max(sc.monthlyReport.day, 1), 28) && dueToday(sc.monthlyReport.time, store.read().lastRun.monthlyReport, now)) {
        mark('monthlyReport');
        try {
          const p = reportPeriod('monthly', now);
          const r = await buildReport('monthly', p.from, p.to);
          if (sc.monthlyReport.push) {
            const pushed = await pushOutlets(i18nT('经营月报 {a} ~ {b}', { a: p.from, b: p.to }), reportText(r)).catch((e) => [{ channel: 'push', ok: false, error: userFacingError(e) }]);
            store.update((s) => { const x = s.reports.find((y) => y.id === r.id); if (x) x.pushed = pushed; });
          }
          log('schedule', i18nT('已生成 {a} ~ {b} 经营月报', { a: p.from, b: p.to }));
        } catch (e) { log('schedule', i18nT('经营月报没有生成：{p0}', { p0: userFacingError(e) }), false); }
      }
      // 新品入库联动：新入库的款 → 各启用渠道的上架草稿 + 新品上新视频脚本（都等人审核）
      if (sc.newArrival.enabled) {
        const seen = new Set(store.read().seen.garments);
        const fresh = garments().filter((g) => !seen.has(g.id) && Date.now() - Date.parse(g.createdAt) < 7 * 86_400_000);
        if (!store.read().seen.garments.length) {
          // 第一次打开联动：只记下现有的，不把老商品当新品
          store.update((s) => { s.seen.garments = garments().map((g) => g.id); });
        } else if (fresh.length) {
          store.update((s) => { s.seen.garments = [...s.seen.garments, ...fresh.map((g) => g.id)]; });
          const chIds = store.read().settings.channels.filter((c) => c.enabled).map((c) => c.id);
          try { if (chIds.length) await actions['listing.generate']({ garmentIds: fresh.map((g) => g.id), channelIds: chIds }); } catch (e) { log('schedule', i18nT('新品上架草稿没有生成：{p0}', { p0: userFacingError(e) }), false); }
          try {
            const v = createVideo({ type: 'new_arrival', garmentIds: fresh.slice(0, 5).map((g) => g.id), name: i18nT('新品上新 {p0}', { p0: today }) });
            await scriptVideo(v.id);
          } catch (e) { log('schedule', i18nT('新品上新视频脚本没有生成：{p0}', { p0: userFacingError(e) }), false); }
          log('schedule', i18nT('新品入库联动：{n} 款新品已生成上架草稿与视频脚本，等你审核', { n: fresh.length }));
        }
      }
      // 按日历：节日 / 周年前 N 天生成数字人讲稿草稿
      if (sc.calendar.enabled && dueToday('09:00', store.read().lastRun.calendar, now)) {
        mark('calendar');
        for (const day of sc.calendar.days) {
          const [mm, dd] = String(day.date || '').split('-').map(Number);
          if (!mm || !dd) continue;
          let target = new Date(now.getFullYear(), mm - 1, dd);
          if (target.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) target = new Date(now.getFullYear() + 1, mm - 1, dd);
          const days = Math.round((target.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86_400_000);
          const key = `calendar:${target.getFullYear()}-${day.date}`;
          if (days !== Math.max(0, sc.calendar.leadDays) || store.read().lastRun[key]) continue;
          store.update((s) => { s.lastRun[key] = today; });
          try {
            await createAvatar({ topic: day.topic === 'store_opening' ? 'store_opening' : 'holiday', brief: day.name, name: i18nT('{p0} · 数字人祝福', { p0: day.name }), seconds: 30 });
            log('schedule', i18nT('已生成「{p0}」数字人讲稿草稿，等你审核', { p0: day.name }));
          } catch (e) { log('schedule', i18nT('「{p0}」数字人讲稿没有生成：{p1}', { p0: day.name, p1: userFacingError(e) }), false); }
        }
      }
      // 定时发布到点：提醒，并由打开着的工作台自动发起（发布要用内置浏览器里的登录态）
      for (const v of store.read().videos) {
        if (v.status !== 'approved' || !v.publishAt || v.publishDue || Date.parse(v.publishAt) > now.getTime()) continue;
        patchVideo(v.id, { publishDue: true });
        broadcast('progress', { key: 'video', message: i18nT('「{p0}」到了定时发布时间', { p0: v.name }) });
        try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_BA_EVENT, { type: 'publish-due', payload: { id: v.id } }); } catch { /* 窗口已关 */ }
        try { new Notification({ title: i18nT('经营自动化 · 定时发布'), body: i18nT('「{p0}」到发布时间了，打开经营自动化智能体即自动发起发布', { p0: v.name }) }).show(); } catch { /* 系统通知不可用 */ }
        log('video', i18nT('定时发布到点：{p0}', { p0: v.name }));
      }
      if (sc.inventoryPatrol.enabled && dueToday(sc.inventoryPatrol.time, store.read().lastRun.inventoryPatrol, now)) {
        mark('inventoryPatrol');
        const { hits, delisted } = evaluate();
        log('schedule', i18nT('库存巡检：{n} 条提醒，门店手机端自动下架 {m} 款', { n: hits.length, m: delisted }));
      }
      if (sc.weeklyVideo.enabled && now.getDay() === sc.weeklyVideo.weekday % 7 && dueToday(sc.weeklyVideo.time, store.read().lastRun.weeklyVideo, now)) {
        mark('weeklyVideo');
        try {
          const p = reportPeriod('weekly', now);
          const m = computeMetrics(store.data().sales, [], garments(), p.from, p.to);
          const picks = m.topItems.map((x) => garments().find((g) => g.name === x.label || g.sku === x.key)).filter(Boolean).slice(0, 3) as ApGarment[];
          const ids = picks.length ? picks.map((g) => g.id) : garments().slice(0, 3).map((g) => g.id);
          if (!ids.length) throw new Error(i18nT('商品库是空的'));
          const v = createVideo({ type: 'new_arrival', garmentIds: ids, brief: i18nT('本周主推：{p0}（按上周销量）', { p0: ids.map((id) => garment(id)!.name).join(i18nT('、')) }), name: i18nT('本周主推 {p0}', { p0: today }) });
          await scriptVideo(v.id);
          log('schedule', i18nT('已生成本周主推视频脚本，待审核后成片发布'));
        } catch (e) { log('schedule', i18nT('本周主推视频没有生成：{p0}', { p0: userFacingError(e) }), false); }
      }
    } catch (e) {
      logger?.warn?.('biz-automation', 'schedule tick failed', { error: (e as Error)?.message });
    } finally {
      ticking = false;
      pushState();
    }
  };
  const timer = setInterval(() => { void tick(); }, 60_000);
  timer.unref?.();
  const stopBackground = () => {
    clearInterval(timer);
    for (const r of runs.values()) { r.controller.abort(); for (const c of r.children) killTree(c); }
  };
  onAppWillQuit('biz-automation', stopBackground, { once: true });

  // ── 动作表 ─────────────────────────────────────────

  const actions: Record<string, (p: any) => unknown> = {
    'state.get': () => publicState(),
    'models.list': () => modelOptions(),
    'garments.list': () => garments(),
    'settings.patch': (p: { patch: Partial<BaSettings> }) => {
      const r = store.update((s) => {
        const patch = p?.patch || {};
        if (patch.brandName !== undefined) s.settings.brandName = String(patch.brandName).slice(0, 30);
        if (patch.storeAddress !== undefined) s.settings.storeAddress = String(patch.storeAddress).slice(0, 80);
        if (patch.openingHours !== undefined) s.settings.openingHours = String(patch.openingHours).slice(0, 40);
        if (patch.dataFolders) s.settings.dataFolders = { ...s.settings.dataFolders, ...patch.dataFolders };
        if (patch.moduleModels) s.settings.moduleModels = { ...patch.moduleModels };
        if (Array.isArray(patch.channels)) s.settings.channels = patch.channels;
        if (patch.seasonMonths) s.settings.seasonMonths = patch.seasonMonths;
        if (Array.isArray(patch.coreSizes)) s.settings.coreSizes = patch.coreSizes.map((x) => String(x).toUpperCase()).filter(Boolean);
        if (patch.autoDelistLocal !== undefined) s.settings.autoDelistLocal = !!patch.autoDelistLocal;
        if (patch.schedule) s.settings.schedule = { ...s.settings.schedule, ...patch.schedule };
        if (patch.outputDir !== undefined) s.settings.outputDir = String(patch.outputDir || '');
        return s.settings;
      });
      pushState();
      return r;
    },
    'files.pick': async (p: { kind: 'excel' | 'image'; multi?: boolean }) => {
      const filters = p?.kind === 'excel' ? [{ name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }] : [{ name: 'Image', extensions: ['jpg', 'jpeg', 'png', 'webp'] }];
      const r = await dialog.showOpenDialog(win()!, { properties: p?.multi ? ['openFile', 'multiSelections'] : ['openFile'], filters });
      return r.canceled ? [] : r.filePaths;
    },
    'dirs.pick': async () => {
      const r = await dialog.showOpenDialog(win()!, { properties: ['openDirectory', 'createDirectory'] });
      return r.canceled ? '' : r.filePaths[0] || '';
    },
    'path.open': async (p: { path: string; reveal?: boolean }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      if (p.reveal) { shell.showItemInFolder(p.path); return true; }
      const err = await shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },
    'log.clear': () => { store.update((s) => { s.log = []; }); pushState(); return true; },
    'schedule.runNow': async () => { store.update((s) => { s.lastRun = {}; }); await tick(); return publicState().log.slice(0, 5); },

    // A
    'video.create': (p) => createVideo(p || {}),
    'video.script': async (p: { id: string }) => {
      try { return await scriptVideo(p.id); } catch (e) { track(p.id, 'script', i18nT('写脚本失败：{p0}', { p0: userFacingError(e) }), false); throw e; }
    },
    'video.update': (p: { id: string; patch: Partial<BaVideoProject> }) => {
      const v = videoById(p.id);
      const allowed: Partial<BaVideoProject> = {};
      for (const k of ['name', 'brief', 'scenes', 'copies', 'platforms', 'narration', 'voiceGender'] as const) if (p.patch?.[k] !== undefined) (allowed as any)[k] = p.patch[k];
      const next = { ...v, ...allowed };
      // 改了脚本 / 文案，旧成片作废，要重新成片、重新审核
      const contentChanged = allowed.scenes || allowed.narration !== undefined || allowed.voiceGender;
      const r = patchVideo(p.id, { ...allowed, warnings: videoWarnings(next as BaVideoProject), ...(contentChanged && v.video ? { video: undefined, status: 'scripted', approvedAt: undefined } : {}), ...(allowed.copies && v.status === 'approved' ? { status: 'rendered', approvedAt: undefined } : {}) });
      if (allowed.scenes || allowed.copies) {
        track(p.id, 'edit', (allowed.scenes ? i18nT('修改了分镜') : i18nT('修改了平台文案')) + (contentChanged && v.video ? i18nT('，旧成片作废需重新成片') : allowed.copies && v.status === 'approved' ? i18nT('，需重新审核') : ''));
      }
      return r;
    },
    'video.addMaterials': (p: { id: string; paths: string[] }) => {
      const v = videoById(p.id);
      const dir = store.dir(join('materials', v.id));
      const added = (p.paths || []).filter((x) => existsSync(x)).map((src) => { const dest = join(dir, `${Date.now()}_${basename(src)}`); copyFileSync(src, dest); return dest; });
      const r = patchVideo(p.id, { materials: [...v.materials, ...added] });
      if (added.length) track(p.id, 'material', i18nT('补充 {n} 张素材', { n: added.length }));
      return r;
    },
    'video.render': (p: { id: string }) => renderVideo(p.id),
    'video.cancel': (p: { id: string }) => { const r = runs.get(p.id); if (r) { r.controller.abort(); for (const c of r.children) killTree(c); } return true; },
    'video.approve': (p: { id: string }) => {
      const v = videoById(p.id);
      if (!v.video || !existsSync(v.video)) throw new Error(i18nT('还没有成片'));
      if (v.warnings.length && !(p as any).force) throw new Error(i18nT('还有未处理的提示：{p0}。改完再审核，或确认后勾选「仍然通过」', { p0: v.warnings.join('；') }));
      const r = patchVideo(p.id, { status: 'approved', approvedAt: new Date().toISOString() });
      track(p.id, 'approve', v.warnings.length ? i18nT('审核通过（已确认 {n} 条提示）', { n: v.warnings.length }) : i18nT('审核通过'));
      return r;
    },
    'video.publishInput': (p: { id: string }) => {
      const v = videoById(p.id);
      if (v.status !== 'approved' && v.status !== 'published' && v.status !== 'publishing') throw new Error(i18nT('先审核通过再发布'));
      if (!v.video || !existsSync(v.video)) throw new Error(i18nT('还没有成片'));
      patchVideo(p.id, { status: 'publishing' });
      track(p.id, 'publish', i18nT('发起发布：{p0}', { p0: platformNames(v.platforms) }));
      return publishInput(v.video, v.name, v.platforms, v.copies);
    },
    'video.markPublished': (p: { id: string; note?: string; ok?: boolean }) => {
      const r = patchVideo(p.id, p.ok === false ? { status: 'approved', publishRunNote: p.note } : { status: 'published', publishedAt: new Date().toISOString(), publishRunNote: p.note });
      track(p.id, 'publish', p.ok === false ? i18nT('人工标记未发成功：{p0}', { p0: p.note || '' }) : i18nT('人工确认已发布'), p.ok !== false);
      return r;
    },
    /**
     * 发布工作流结束后的回写（渲染层从工作流运行页留下的回执里取，带上发起时记下的视频 id）。
     * 有平台确认发布 → 已发布；只有待核对 → 停在发布中等人工核对；都没有 → 退回已审核可重发。同一 runId 只记一次（重复进页面不重复记账）。
     */
    'video.publishResult': (p: { id: string; runId?: string; kind: string; receipt?: unknown; at?: number }) => {
      const v = videoById(p.id);
      if (p.runId && (v.publishRuns || []).some((x) => x.runId === p.runId)) return v;
      const run = publishRunFromWorkflow({ kind: p.kind, runId: p.runId, receipt: p.receipt, platforms: v.platforms, videoFile: v.video, at: p.at });
      const parts: string[] = [];
      if (run.published.length) parts.push(i18nT('{p0} 已发布', { p0: platformNames(run.published) }));
      if (run.unconfirmed.length) parts.push(i18nT('{p0} 待人工核对', { p0: platformNames(run.unconfirmed) }));
      if (run.failed.length) parts.push(i18nT('{p0} 未发成功', { p0: platformNames(run.failed) }));
      const note = run.outcome === 'cancelled' && !run.published.length && !run.unconfirmed.length
        ? i18nT('发布工作流已取消') : parts.join(i18nT('，')) || i18nT('发布工作流没有返回平台回执');
      run.note = note;
      const ok = run.published.length > 0;
      store.update((s) => { const x = s.videos.find((y) => y.id === p.id); if (x) x.publishRuns = [...(x.publishRuns || []), run].slice(-30); });
      // 只有待核对（点过发布、结果未知）：停在发布中等人工核对，不退回已审核，免得一键重发
      patchVideo(p.id, ok
        ? { status: 'published', publishedAt: v.publishedAt && v.status === 'published' ? v.publishedAt : run.at, publishRunNote: note }
        : { status: v.status === 'published' ? 'published' : run.unconfirmed.length ? 'publishing' : 'approved', publishRunNote: note });
      track(p.id, 'publish', i18nT('发布结果：{p0}', { p0: note }), ok);
      return videoById(p.id);
    },
    'video.fillModels': (p: { id: string }) => fillModelImages(p.id),
    /** 定时发布：到点后系统通知，工作台打开时自动发起发布（需要内置浏览器里的平台登录态） */
    'video.schedule': (p: { id: string; at: string | null }) => {
      const v = videoById(p.id);
      if (p.at && v.status !== 'approved') throw new Error(i18nT('先审核通过再设定时发布'));
      if (p.at && Date.parse(p.at) < Date.now() - 60_000) throw new Error(i18nT('发布时间要晚于现在'));
      const r = patchVideo(p.id, { publishAt: p.at || undefined, publishDue: false });
      track(p.id, 'schedule', p.at ? i18nT('设定时发布：{p0}', { p0: new Date(p.at).toLocaleString() }) : i18nT('取消定时发布'));
      return r;
    },
    'video.recordStats': (p: { id: string; platform: BaPublishPlatform; stats: Partial<BaVideoStats> }) => {
      const v = videoById(p.id);
      const n = (x: unknown) => Math.max(0, Math.round(Number(x) || 0));
      const item: BaVideoStats = { plays: n(p.stats?.plays), likes: n(p.stats?.likes), comments: n(p.stats?.comments), shares: n(p.stats?.shares), source: p.stats?.source === 'employee' ? 'employee' : 'manual', at: new Date().toISOString() };
      const r = patchVideo(p.id, { stats: { ...(v.stats || {}), [p.platform]: item } });
      track(p.id, 'stats', i18nT('{p0} 数据：播放 {a} · 点赞 {b} · 评论 {c} · 分享 {d}', { p0: PLATFORM_LABEL()[p.platform] || p.platform, a: item.plays, b: item.likes, c: item.comments, d: item.shares }));
      return r;
    },
    /** 交给数字员工去各平台创作者后台读回数据（只读） */
    'video.statsInstruction': (p: { id: string }) => {
      const v = videoById(p.id);
      const urls: Record<BaPublishPlatform, string> = { douyin: 'https://creator.douyin.com/', kuaishou: 'https://cp.kuaishou.com/', xiaohongshu: 'https://creator.xiaohongshu.com/', wxchannels: 'https://channels.weixin.qq.com/' };
      const title = v.platforms.map((x) => v.copies[x]?.title).find(Boolean) || v.name;
      return [
        i18nT('请在内置浏览器里分别打开下面平台的创作者后台，找到标题为「{p0}」的视频，读出播放、点赞、评论、分享数。只读取，不要做任何修改或发布操作。', { p0: title }),
        ...v.platforms.map((x) => `- ${x}：${urls[x]}`),
        i18nT('读完后按这个格式逐行回复（没找到就写 未找到）：平台 | 播放 | 点赞 | 评论 | 分享'),
      ].join('\n');
    },
    /** 复盘：按款式汇总各视频的播放与互动（引流效果） */
    'video.review': () => {
      const rows = new Map<string, { garmentId: string; videos: number; plays: number; likes: number; comments: number; shares: number }>();
      for (const v of store.read().videos) {
        if (!v.stats) continue;
        const tot = Object.values(v.stats).reduce((a, x) => ({ plays: a.plays + (x?.plays || 0), likes: a.likes + (x?.likes || 0), comments: a.comments + (x?.comments || 0), shares: a.shares + (x?.shares || 0) }), { plays: 0, likes: 0, comments: 0, shares: 0 });
        for (const gid of v.garmentIds) {
          const r = rows.get(gid) || { garmentId: gid, videos: 0, plays: 0, likes: 0, comments: 0, shares: 0 };
          r.videos++; r.plays += tot.plays; r.likes += tot.likes; r.comments += tot.comments; r.shares += tot.shares;
          rows.set(gid, r);
        }
      }
      return [...rows.values()].sort((a, b) => b.plays - a.plays);
    },
    'video.remove': (p: { id: string }) => { store.update((s) => { s.videos = s.videos.filter((v) => v.id !== p.id); }); pushState(); return true; },

    // B
    'avatar.status': async () => {
      if (!deps.digitalHumanProc) return { ready: false, detail: i18nT('数字人服务未初始化') };
      try { const st: any = await deps.digitalHumanProc.getStatus(); return { ready: st?.configured !== false && st?.ok !== false, detail: st }; } catch (e) { return { ready: false, detail: userFacingError(e) }; }
    },
    'avatar.facts': () => knowledgeFacts(),
    'avatar.create': (p: { topic: BaAvatarTopic; seconds?: number; brief?: string }) => createAvatar(p),
    'avatar.update': (p: { id: string; patch: Partial<BaAvatarProject> }) => {
      const allowed: Partial<BaAvatarProject> = {};
      for (const k of ['name', 'script', 'avatarId', 'voiceId', 'aspectRatio', 'likenessConsent'] as const) if (p.patch?.[k] !== undefined) (allowed as any)[k] = p.patch[k];
      if (allowed.script !== undefined) allowed.warnings = avatarWarnings(allowed.script);
      return patchAvatar(p.id, allowed);
    },
    'avatar.render': async (p: { id: string }) => {
      const a = avatarById(p.id);
      const dh = deps.digitalHumanProc;
      if (!dh) throw new Error(i18nT('数字人服务未就绪，请先到「数字人工作台 → 配置」选择服务商并填凭据'));
      if (placeholders(a.script).length) throw new Error(i18nT('讲稿里还有【待补充】，补完再成片'));
      patchAvatar(p.id, { status: 'rendering', error: undefined });
      try {
        progress('avatar', i18nT('已提交数字人成片，通常需要 1～5 分钟…'));
        const body: Record<string, unknown> = { script: a.script, aspectRatio: a.aspectRatio, subtitle: true };
        if (a.avatarId) body.avatarId = a.avatarId;
        if (a.voiceId) body.voiceId = a.voiceId;
        const sub: any = await dh.synthesize(body);
        let url = isTaskFinished(sub) ? String(sub?.videoUrl ?? sub?.video_url ?? '') : '';
        const taskId = sub?.taskId ?? sub?.task_id;
        if (!url) {
          if (!taskId) throw new Error(String(sub?.error || i18nT('数字人成片提交失败')));
          patchAvatar(p.id, { taskId: String(taskId) });
          const deadline = Date.now() + 10 * 60_000;
          while (!url && Date.now() < deadline) {
            await new Promise((r) => setTimeout(r, 4000));
            const q: any = await dh.queryTask(String(taskId));
            if (isTaskFailed(q)) throw new Error(String(q?.error || i18nT('数字人成片失败')));
            if (isTaskFinished(q)) url = String(q?.videoUrl ?? q?.video_url ?? '');
          }
          if (!url) throw new Error(i18nT('数字人成片超时，请稍后重试'));
        }
        const dest = join(outputDir(i18nT('数字人')), `${a.name.replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40)}-${Date.now()}.mp4`);
        progress('avatar', i18nT('正在下载成片…'));
        const raw = dest.replace(/\.mp4$/, '-raw.mp4');
        await downloadTo(url, raw);
        progress('avatar', i18nT('正在加 AI 生成标识与片尾…'));
        await labelAvatarVideo(raw, dest, a.aspectRatio);
        log('avatar', i18nT('数字人成片：{p0}', { p0: a.name }));
        return patchAvatar(p.id, { status: 'rendered', video: dest });
      } catch (e) {
        const msg = userFacingError(e);
        patchAvatar(p.id, { status: 'failed', error: msg });
        throw new Error(msg);
      }
    },
    /** 数字人成片进入短视频发布：生成一个已成片的视频项目，文案由模型按讲稿写 */
    'avatar.toVideo': async (p: { id: string; platforms?: BaPublishPlatform[] }) => {
      const a = avatarById(p.id);
      if (!a.video || !existsSync(a.video)) throw new Error(i18nT('还没有成片'));
      const platforms = (p.platforms?.length ? p.platforms : ['douyin', 'wxchannels']) as BaPublishPlatform[];
      const copies: BaVideoProject['copies'] = {};
      try {
        const { json } = await llmJson('avatar', [
          'Write short-video titles and captions (Simplified Chinese) for this digital-human talking video. Do not add facts not in the script. No absolute words banned by Chinese advertising law.',
          `Script:\n${a.script}`,
          `Return ONLY JSON: {${platforms.map((x) => `"${x}": {"title": "...", "caption": "...", "topics": ["..."]}`).join(', ')}}`,
        ].join('\n'));
        for (const x of platforms) if (json?.[x]) copies[x] = { title: clampTitle(String(json[x].title || a.name), x === 'xiaohongshu' ? 20 : 30), caption: `${String(json[x].caption || '')}\n${i18nT('（本视频由 AI 生成）')}`, topics: (json[x].topics || []).map(String).slice(0, 6) };
      } catch { /* 文案可在视频里手改 */ }
      const v: BaVideoProject = {
        id: newId('bav'), type: 'store_tour', name: a.name, garmentIds: [], brief: '', materials: [], scenes: [], copies, platforms,
        narration: true, voiceGender: 'female', video: a.video, status: 'rendered', warnings: [], createdAt: new Date().toISOString(),
      };
      v.warnings = videoWarnings(v);
      v.history = appendVideoEvent(appendVideoEvent([], 'create', i18nT('由数字人项目「{p0}」转入，发布到 {p1}', { p0: a.name, p1: platformNames(platforms) })), 'render', i18nT('数字人成片：{f}', { f: a.video ? basename(a.video) : '' }));
      store.update((s) => { s.videos.unshift(v); });
      pushState();
      return v;
    },
    'avatar.remove': (p: { id: string }) => { store.update((s) => { s.avatars = s.avatars.filter((x) => x.id !== p.id); }); pushState(); return true; },

    // C
    'rules.evaluate': () => evaluate(),
    'listing.generate': async (p: { garmentIds: string[]; channelIds: string[] }) => {
      const s0 = store.read();
      const channels = s0.settings.channels.filter((c) => (p?.channelIds || []).includes(c.id));
      const gs = (p?.garmentIds || []).map(garment).filter(Boolean) as ApGarment[];
      if (!gs.length || !channels.length) throw new Error(i18nT('请选择商品和上架渠道'));
      const made: BaListing[] = [];
      const errors: string[] = [];
      let n = 0;
      for (const g of gs) {
        for (const ch of channels) {
          n++;
          progress('listing', i18nT('正在生成 {a}/{b}：{p0} · {p1}', { a: n, b: gs.length * channels.length, p0: g.name, p1: ch.name }));
          try {
            const { json, model } = await llmJson('listing', P.listingPrompt({ garment: g, channel: ch, brand: s0.settings.brandName }));
            const dir = store.dir(join('listing', g.id));
            const images: string[] = [];
            if (g.image && existsSync(g.image)) images.push(await mainImage(g.image, ch.aspect, join(dir, `${ch.id}-main${extname(g.image) === '.png' ? '.png' : '.jpg'}`)));
            for (const [i, t] of tryonImages(g.id, 4).entries()) images.push(await mainImage(t, ch.aspect, join(dir, `${ch.id}-look${i + 1}.jpg`)));
            if (g.image && existsSync(g.image)) { const d = await detailImage(g.image, ch.aspect, join(dir, `${ch.id}-detail.jpg`)); if (d) images.push(d); }
            const sc = await sizeChartImage(g, ch.aspect, join(dir, `${ch.id}-size.jpg`));
            if (sc) images.push(sc);
            const draft = {
              title: clampTitle(String(json.title || g.name), ch.titleMax),
              sellingPoints: (Array.isArray(json.sellingPoints) ? json.sellingPoints : []).map(String).slice(0, 5),
              detail: String(json.detail || '').slice(0, 1500),
            };
            const l: BaListing = {
              id: newId('bal'), garmentId: g.id, channelId: ch.id, ...draft,
              keywords: (Array.isArray(json.keywords) ? json.keywords : []).map(String).slice(0, 8),
              images, price: g.price, status: 'draft', warnings: listingWarnings(draft), model, createdAt: new Date().toISOString(),
            };
            store.update((s) => { s.listings = [l, ...s.listings.filter((x) => !(x.garmentId === g.id && x.channelId === ch.id && x.status === 'draft'))]; });
            made.push(l);
          } catch (e) { errors.push(`${g.name} · ${ch.name}：${userFacingError(e)}`); }
        }
      }
      pushState();
      if (!made.length) throw new Error(errors[0] || i18nT('没有生成任何上架草稿'));
      return { made, errors };
    },
    'listing.update': (p: { id: string; patch: Partial<BaListing> }) => {
      const l = listingById(p.id);
      const allowed: Partial<BaListing> = {};
      for (const k of ['title', 'sellingPoints', 'detail', 'keywords', 'images', 'productUrl'] as const) if (p.patch?.[k] !== undefined) (allowed as any)[k] = p.patch[k];
      const ch = store.read().settings.channels.find((c) => c.id === l.channelId);
      if (allowed.title !== undefined && ch) allowed.title = clampTitle(allowed.title, ch.titleMax);
      const next = { ...l, ...allowed };
      return patchListing(p.id, { ...allowed, warnings: listingWarnings(next), ...(l.status === 'confirmed' && (allowed.title || allowed.detail || allowed.sellingPoints) ? { status: 'draft' } : {}) });
    },
    'listing.confirm': (p: { id: string }) => patchListing(p.id, { status: 'confirmed' }),
    'listing.status': (p: { id: string; status: BaListing['status']; conversationId?: string; productUrl?: string }) => {
      const l = patchListing(p.id, { status: p.status, ...(p.conversationId ? { conversationId: p.conversationId } : {}), ...(p.productUrl ? { productUrl: p.productUrl } : {}) });
      const chn = store.read().settings.channels.find((c) => c.id === l.channelId);
      log('listing', i18nT('{p0} · {p1}：{p2}', { p0: garment(l.garmentId)?.name || '', p1: chn?.name || '', p2: p.status }) + (chn?.autoSubmit && p.status === 'handed' ? i18nT('（自动执行）') : ''));
      return l;
    },
    /** 交给数字员工的上架指令：按草稿逐项填写，停在「提交 / 发布」前等人确认 */
    'listing.instruction': (p: { id: string }) => {
      const l = listingById(p.id);
      if (l.status === 'draft') throw new Error(i18nT('先确认上架草稿'));
      const ch = requireFound(store.read().settings.channels.find((c) => c.id === l.channelId), i18nT('渠道'));
      const g = garment(l.garmentId);
      const stock = g ? Object.entries(g.stock).map(([k, v]) => `${k}×${v}`).join(i18nT('、')) : '';
      return [
        i18nT('请在内置浏览器里打开 {p0} 商家后台（{p1}），用我已登录的账号新建商品并按下面的内容填写。', { p0: ch.name, p1: ch.url }),
        ch.autoSubmit
          ? i18nT('要求：只填写下列内容，不要改价、不要开启任何付费推广；该店铺已授权全自动，填完核对无误后直接提交，并把提交结果与商品链接回复给我。如需登录或验证码，请停下来让我处理。')
          : i18nT('要求：只填写下列内容，不要改价、不要开启任何付费推广；填完停在「提交 / 发布」前，截图给我确认，由我亲自点提交。如需登录或验证码，请停下来让我处理。'),
        '',
        i18nT('标题：{p0}', { p0: l.title }),
        i18nT('价格：{p0} 元', { p0: l.price }),
        i18nT('规格与库存：{p0}', { p0: stock || i18nT('按后台默认') }),
        i18nT('属性：品类 {p0}，面料 {p1}，季节 {p2}，风格 {p3}，颜色 {p4}', { p0: g?.category || '—', p1: g?.fabric || '—', p2: g?.season || '—', p3: g?.style || '—', p4: g?.color || '—' }),
        i18nT('卖点：{p0}', { p0: l.sellingPoints.join('；') }),
        i18nT('详情：{p0}', { p0: l.detail }),
        i18nT('搜索关键词：{p0}', { p0: l.keywords.join(i18nT('、')) }),
        i18nT('图片（按顺序上传，第一张为主图）：'),
        ...l.images.map((x, i) => `${i + 1}. ${x}`),
      ].join('\n');
    },
    'rules.handle': (p: { garmentId: string; action: BaRuleAction }) => handleRule(p.garmentId, p.action),
    'listing.remove': (p: { id: string }) => { store.update((s) => { s.listings = s.listings.filter((x) => x.id !== p.id); }); pushState(); return true; },
    'local.shelf': (p: { garmentId: string; onShelf: boolean }) => {
      const svc = apparelService();
      if (!svc) throw new Error(i18nT('服装AI试衣未加载'));
      return svc.saveGarment({ id: p.garmentId, onShelf: !!p.onShelf });
    },

    // D
    'finance.import': (p: { path: string; kind: 'sales' | 'expense' | 'inventory'; replace?: boolean }) => doImport(p.path, p.kind, 'manual', !!p.replace),
    'finance.folderImport': () => folderImport(true),
    'finance.clear': (p: { kind: 'sales' | 'expense' | 'all' }) => {
      store.updateData((d) => { if (p.kind !== 'expense') d.sales = []; if (p.kind !== 'sales') d.expenses = []; });
      pushState();
      return true;
    },
    'finance.range': () => {
      const d = store.data();
      const dates = d.sales.map((r) => r.date).sort();
      return { from: dates[0] || '', to: dates[dates.length - 1] || '' };
    },
    'finance.metrics': (p: { from: string; to: string }) => computeMetrics(store.data().sales, store.data().expenses, garments(), p.from, p.to),
    'finance.report': async (p: { kind: BaReport['kind']; from?: string; to?: string }) => {
      const period = p.kind === 'custom' ? { from: String(p.from || ''), to: String(p.to || '') } : reportPeriod(p.kind);
      if (!period.from || !period.to || period.from > period.to) throw new Error(i18nT('请选择正确的起止日期'));
      return buildReport(p.kind, period.from, period.to);
    },
    'finance.reportText': (p: { id: string }) => reportText(requireFound(store.read().reports.find((r) => r.id === p.id), i18nT('报表'))),
    'finance.push': async (p: { id: string }) => {
      const r = requireFound(store.read().reports.find((x) => x.id === p.id), i18nT('报表'));
      const pushed = await pushOutlets(i18nT('经营报表 {a} ~ {b}', { a: r.metrics.from, b: r.metrics.to }), reportText(r));
      store.update((s) => { const x = s.reports.find((y) => y.id === r.id); if (x) x.pushed = pushed; });
      pushState();
      return pushed;
    },
    'finance.export': (p: { id: string }) => {
      const r = requireFound(store.read().reports.find((x) => x.id === p.id), i18nT('报表'));
      const m = r.metrics;
      const file = join(outputDir(i18nT('经营报表')), `${i18nT('经营报表')}-${m.from}_${m.to}.xlsx`);
      writeWorkbook(file, [
        { name: i18nT('汇总'), headers: [i18nT('指标'), i18nT('数值')], rows: [
          [i18nT('期间'), `${m.from} ~ ${m.to}`], [i18nT('营业额'), m.revenue], [i18nT('退货'), m.refunds], [i18nT('净营业额'), m.netRevenue],
          [i18nT('销售成本'), m.cost], [i18nT('成本覆盖率'), m.costCoverage], [i18nT('毛利'), m.grossProfit], [i18nT('毛利率'), m.grossMargin],
          [i18nT('订单数'), m.orders], [i18nT('件数'), m.units], [i18nT('客单价'), m.avgOrderValue], [i18nT('连带率'), m.unitsPerOrder],
          [i18nT('费用'), m.expenses], [i18nT('费用率'), m.expenseRate], [i18nT('净利润'), m.netProfit],
        ] },
        { name: i18nT('渠道'), headers: [i18nT('渠道'), i18nT('金额'), i18nT('占比')], rows: m.byChannel.map((x) => [x.label, x.value, x.share ?? 0]) },
        { name: i18nT('品类'), headers: [i18nT('品类'), i18nT('金额'), i18nT('占比')], rows: m.byCategory.map((x) => [x.label, x.value, x.share ?? 0]) },
        { name: i18nT('畅销款'), headers: [i18nT('商品'), i18nT('金额')], rows: m.topItems.map((x) => [x.label, x.value]) },
        { name: i18nT('售罄率'), headers: [i18nT('商品'), i18nT('售罄率')], rows: m.sellThrough.map((x) => [x.label, x.value]) },
        { name: i18nT('经营解读'), headers: [i18nT('内容')], rows: [...r.commentary.split('\n').map((x) => [x]), ...(r.unverified.length ? [[i18nT('未能核对的数字：{p0}', { p0: r.unverified.join(i18nT('、')) })]] : [])] },
      ]);
      store.update((s) => { const x = s.reports.find((y) => y.id === r.id); if (x) x.exportPath = file; });
      pushState();
      return file;
    },
    'finance.exportPdf': async (p: { id: string }) => {
      const r = requireFound(store.read().reports.find((x) => x.id === p.id), i18nT('报表'));
      const file = join(outputDir(i18nT('经营报表')), `${i18nT('经营报表')}-${r.metrics.from}_${r.metrics.to}.pdf`);
      await renderHtmlToPdf(reportHtml(r), file);
      store.update((s) => { const x = s.reports.find((y) => y.id === r.id); if (x) x.pdfPath = file; });
      pushState();
      return file;
    },
    /**
     * 转入财务智能体：按报表期汇总成序时账（含税金额，价税分离与科目请在财务智能体复核），
     * 渲染层再调财务智能体的 data.importJournal 导入 —— 只生成草稿账，不改任何正式账套。
     */
    'finance.toJournal': (p: { id: string }) => {
      const r = requireFound(store.read().reports.find((x) => x.id === p.id), i18nT('报表'));
      const m = r.metrics;
      const d = store.data();
      const exp = new Map<string, number>();
      for (const e of d.expenses.filter((x) => x.date >= m.from && x.date <= m.to)) exp.set(e.item, (exp.get(e.item) || 0) + e.amount);
      const no = `JY-${m.to.replace(/-/g, '')}`;
      const memo = i18nT('经营自动化转入 {a}~{b}（含税，价税分离请复核）', { a: m.from, b: m.to });
      const rows: (string | number)[][] = [
        [m.to, no, memo, '1002', i18nT('银行存款'), m.netRevenue, 0],
        [m.to, no, memo, '6001', i18nT('主营业务收入'), 0, m.netRevenue],
      ];
      if (m.cost) rows.push([m.to, no, memo, '6401', i18nT('主营业务成本'), m.cost, 0], [m.to, no, memo, '1405', i18nT('库存商品'), 0, m.cost]);
      let k = 1;
      for (const [item, amt] of exp) {
        const n2 = `${no}-${k++}`;
        rows.push([m.to, n2, `${memo} ${item}`, '6601', i18nT('销售费用'), Math.round(amt * 100) / 100, 0], [m.to, n2, `${memo} ${item}`, '1002', i18nT('银行存款'), 0, Math.round(amt * 100) / 100]);
      }
      const file = join(outputDir(i18nT('经营报表')), `${i18nT('序时账')}-${m.from}_${m.to}.xlsx`);
      writeWorkbook(file, [{ name: i18nT('序时账'), headers: [i18nT('日期'), i18nT('凭证号'), i18nT('摘要'), i18nT('科目编码'), i18nT('科目名称'), i18nT('借方金额'), i18nT('贷方金额')], rows }]);
      return file;
    },
    'finance.ask': async (p: { q: string }) => {
      const q = String(p?.q || '').trim();
      if (!q) throw new Error(i18nT('请输入问题'));
      const d = store.data();
      if (!d.sales.length) throw new Error(i18nT('还没有销售数据：先导入收银系统导出的销售明细'));
      const dates = d.sales.map((r) => r.date).sort();
      const last = dates[dates.length - 1];
      const blocks = [
        { title: i18nT('全部数据 {a} ~ {b}', { a: dates[0], b: last }), facts: metricsFacts(computeMetrics(d.sales, d.expenses, garments(), dates[0], last)) },
        { title: i18nT('最近 7 天'), facts: metricsFacts(computeMetrics(d.sales, d.expenses, garments(), shiftDate(last, -6), last)) },
        { title: i18nT('最近 30 天'), facts: metricsFacts(computeMetrics(d.sales, d.expenses, garments(), shiftDate(last, -29), last)) },
      ];
      const sources = store.read().imports.filter((i) => i.kind !== 'inventory').slice(0, 5).map((i) => `${i.file}（${i.from}~${i.to}，${i.rows}）`);
      const { text, model } = await llm('finance', P.financeQaPrompt({ question: q, brand: store.read().settings.brandName, blocks, sources }));
      const item = { q, a: text.trim(), model, at: new Date().toISOString() };
      store.update((s) => { s.qa.unshift(item); });
      pushState();
      return item;
    },
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_BA_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const fn = actions[String(req?.action || '')];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: String(req?.action || '') }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('biz-automation', `${req.action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });
  // 卸载 / 停用时由方案入口 deactivate 调用（宿主只撤 IPC 通道，后台任务要自己停）
  return stopBackground;
}
