/**
 * 慈善活动内容工场 · 主进程 IPC。
 *
 * 四步（素材/档案 → 分析/报告 → 语音 → 短视频）各一条 invoke 通道，长任务逐段推
 * WORKBENCH_CHARITY_EVENT 真实进度；每个 runId 一个取消句柄（AbortController + 子进程集合）。
 * 任一步带 fallbackToPrebaked=true 时失败改用预置成品（拷进本次输出目录），响应多一个 fallback 标记，
 * 只进主进程日志，界面不展示。
 */
import { app, dialog, ipcMain, type BrowserWindow } from 'electron';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import type { ChildProcess } from 'node:child_process';
import {
  IPC_CHANNELS,
  type CharityAnalyzeRequest, type CharityAnalyzeResponse, type CharityArchive, type CharityArchiveDraftRequest, type CharityArchiveDraftResponse,
  type CharityFileUrlRequest, type CharityFileUrlResponse, type CharityHistoryRequest, type CharityHistoryResponse, type CharityHistoryRun,
  type CharityLang, type CharityPdfTextRequest, type CharityPdfTextResponse, type CharityPrebakedResponse, type CharityProgressEvent,
  type CharityReportRequest, type CharityReportResponse, type CharityScanRequest, type CharityScanResponse, type CharityTri,
  type CharitySaveAsRequest, type CharitySaveAsResponse, type CharityDemoMaterialsResponse, type CharityStartRunRequest, type CharityStartRunResponse,
  type CharityDemoPackStatusResponse, type CharityDemoResultRequest, type CharityDemoResultResponse,
  type CharityTranslateRequest, type CharityTranslateResponse,
  type CharityTtsRequest, type CharityTtsResponse, type CharityVideoRequest, type CharityVideoResponse, type CharityTtsItem, type CharityVideoItem,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { createCharityRuntime } from '../services/charityContent/runtime';
import { resolveAgentPython } from '../services/agentPython';
import { readAgentEnv } from '../services/mediaModelConfig';
import { resolveFfmpegPair, ffmpegSpawnEnv } from '../services/ffmpegPath';
import { shellResource, shellResourcesPath } from '../services/runtimeLocation';
import { buildLocalMediaUrl } from '../services/mediaProtocol';
import { extractDocument } from '../services/documentExtractor';
import { LANGS, normalizeArchive } from '../services/charityContent/archive';
import { type MediaTools, type ProcRegistry, killTree, kindOf, audioDuration, probeMedia } from '../services/charityContent/media';
import {
  type PipelineDeps, OUTPUT_DIR_NAME, analyzeMaterials, buildVideos, composeReport, draftArchive, inspectMaterials, listMaterialFiles, makeRunId, outDirFor,
  readRunPrompts, renderOutputs, saveRunPrompts, synthesizeSpeech, translateText,
} from '../services/charityContent/pipeline';
import { copyPrebakedFiles, loadPrebaked, mapPrebakedDescriptions, prebakedComplete } from '../services/charityContent/prebaked';
import { demoPackStatus, ensureDemoPack } from '../services/charityContent/demoPack';
import { narrationTrackPath } from '../services/charityContent/subtitles';
import { articleWorkDir, demoMaterialsSourceDir, demoMaterialsTargetDir, prepareDemoMaterials } from '../services/charityContent/demoMaterials';
import { documentsFolderName } from '../services/brandPaths';
import { audioToDataUrl, imageToDataUrl, renderHtmlToImage, renderHtmlToPdf } from '../services/charityContent/render';
import {
  requireAbs, requireCaptions, requireLangs, requireMode, requireOutDir, requirePaths, requirePrompt, requireQuality, requireRunId, requireTriText,
} from '../services/charityContent/validate';

interface RunHandle extends ProcRegistry { controller: AbortController; children: Set<ChildProcess> }

export function registerCharityContentHandlers(deps: WorkbenchIpcDeps): void {
  const runs = new Map<string, RunHandle>();
  const win = (): BrowserWindow | null => deps.getMainWindow();

  /**
   * 壳资源根（预置成品 / 演示素材 / 技能脚本随安装包分发）。打包态不能用 runtimeResourcesPath()——
   * 那是 CDN 运行时目录，只有 vendor/；ffmpeg / python 由 resolveFfmpegPair / resolveAgentPython 自己改道过去。
   */
  function resourcesDir(): string {
    return shellResourcesPath();
  }
  function agentHome(): string | undefined {
    return ((deps.appConfig as any)?.engines?.['totalclaw-agent']?.totalclawHome || (deps as any).totalclawAgentHome) as string | undefined;
  }
  function tools(): MediaTools | null {
    const res = resourcesDir();
    const pair = resolveFfmpegPair(res);
    if (!pair.ffmpeg || !pair.ffprobe) return null;
    let agentEnv: Record<string, string> = {};
    try { const home = agentHome(); if (home) agentEnv = readAgentEnv(home); } catch { agentEnv = {}; }
    return {
      ffmpeg: pair.ffmpeg, ffprobe: pair.ffprobe,
      python: resolveAgentPython(res),
      scriptsDir: shellResource('bundled-skills', 'marketing-sales', 'totalclaw-video-studio', 'scripts'),
      env: { ...process.env, ...agentEnv, ...ffmpegSpawnEnv(res), PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1', PYTHONIOENCODING: 'utf-8' },
    };
  }
  function handle(runId: string): RunHandle {
    let h = runs.get(runId);
    if (h) return h;
    const controller = new AbortController();
    const children = new Set<ChildProcess>();
    h = { controller, children, signal: controller.signal, add: (c) => children.add(c), remove: (c) => children.delete(c) };
    runs.set(runId, h);
    return h;
  }
  function emit(runId: string, step: CharityProgressEvent['step']): PipelineDeps['progress'] {
    return (stage, msg, done, total, extra) => {
      const ev: CharityProgressEvent = { runId, step, stage, msg, done, total, ...(extra || {}) };
      try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_CHARITY_EVENT, ev); } catch { /* 窗口已关 */ }
    };
  }
  const rt = createCharityRuntime(deps, agentHome);
  const { requireDefaultModel, vision, falFacade } = rt;
  function pipeline(runId: string, step: CharityProgressEvent['step']): PipelineDeps {
    return {
      resourcesDir: resourcesDir(),
      tools: tools(),
      agentHome: agentHome(),
      fal: falFacade(),
      vision,
      text: rt.text,
      renderPdf: renderHtmlToPdf,
      renderImage: renderHtmlToImage,
      imageDataUrl: imageToDataUrl,
      progress: emit(runId, step),
      log: {
        info: (m, ctx) => deps.logger?.info?.('charity-content', m, ctx),
        warn: (m, ctx) => deps.logger?.warn?.('charity-content', m, ctx),
      },
    };
  }
  function fallbackLog(step: string, runId: string, e: unknown): void {
    // 只在开发者日志留痕：演示现场界面不露任何回退迹象
    deps.logger?.warn?.('charity-content', `[fallback] ${step} 真跑失败，已用预置成品`, { runId, message: String((e as any)?.message || e) });
  }
  /**
   * 步骤失败留痕。
   *
   * 每个 handler 的兜底 catch 原来只把 `userFacingError(e)` 回给界面，日志里一个字都没有——
   * 用户说「合成失败了，看一下日志」时日志根本没记，只能靠复现。这里记**原始** message 与
   * 首行调用栈（`userFacingError` 会把技术细节抹成人话，排障要的正是被抹掉的那部分）。
   */
  function failLog(step: string, e: unknown, ctx?: Record<string, unknown>): void {
    const err = e as { message?: unknown; code?: unknown; stack?: unknown } | null;
    const stack = String(err?.stack || '').split('\n').slice(1, 3).map((s) => s.trim()).join(' ← ');
    deps.logger?.error?.('charity-content', `${step} 失败`, {
      ...ctx, code: err?.code ? String(err.code) : undefined, message: String(err?.message ?? e), stack: stack || undefined,
    });
  }

  // ── 选目录 / 选文件 ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_PICK_DIR, async () => {
    const r = await dialog.showOpenDialog(win() ?? undefined as any, { title: i18nT('选择活动素材目录'), properties: ['openDirectory', 'createDirectory'] });
    return { path: r.canceled ? '' : (r.filePaths[0] || '') };
  });
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_PICK_FILES, async () => {
    const r = await dialog.showOpenDialog(win() ?? undefined as any, {
      title: i18nT('选择活动照片 / 视频 / PDF'), properties: ['openFile', 'multiSelections'],
      filters: [{ name: i18nT('素材'), extensions: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'm4v', 'webm', 'pdf'] }],
    });
    return { paths: r.canceled ? [] : r.filePaths };
  });
  // 文章转语音线的「上传 PDF 抽文字」：单选、只列 PDF。
  // 原来复用上面那个通用素材选择器，标题是「选择活动照片 / 视频 / PDF」、允许多选照片视频，
  // 选中非 PDF 时渲染层还会静默丢弃什么也不发生 —— 这一步要的就是一个 PDF。
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_PICK_PDF, async () => {
    const r = await dialog.showOpenDialog(win() ?? undefined as any, {
      title: i18nT('选择 PDF 文件'), properties: ['openFile'],
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    return { path: r.canceled ? '' : (r.filePaths[0] || '') };
  });

  /**
   * 开一次运行：发 runId 与输出目录。
   *
   * 活动记录线是素材扫描顺带发的；文章转语音线没有素材这一步，之前 runId 一直是空字符串，
   * 点「合成语音」必被服务端校验挡下报「runId 格式不正确」。这里补上这条通道。
   * 目录不传就落到用户文档下的固定工作目录（安装目录只读，不能往里写产物）。
   */
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_START_RUN, async (_e, req: CharityStartRunRequest): Promise<CharityStartRunResponse> => {
    try {
      const dir = req?.dir ? requireAbs(req.dir, i18nT('工作目录')) : articleWorkDir(app.getPath('documents'), documentsFolderName());
      mkdirSync(dir, { recursive: true });
      const runId = makeRunId();
      // 输出目录只算路径不建：与素材扫描一致，到真正生成才建，避免留一堆空目录
      return { ok: true, dir, outDir: outDirFor(dir, runId), runId };
    } catch (e: any) {
      failLog(i18nT('开始运行'), e);
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 1. 素材探测 ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, async (_e, req: CharityScanRequest): Promise<CharityScanResponse> => {
    try {
      const dir = req?.dir ? requireAbs(req.dir, i18nT('素材目录')) : '';
      const files = req?.files ? requirePaths(req.files, i18nT('素材文件')) : [];
      if (!dir && !files.length) return { ok: false, error: i18nT('请拖入素材目录或选择文件') };
      const materialDir = dir || join(files[0], '..');
      if (!existsSync(materialDir) || !statSync(materialDir).isDirectory()) return { ok: false, error: i18nT('素材目录不存在') };
      const list = listMaterialFiles(dir, files);
      if (!list.length) return { ok: false, error: i18nT('目录里没有图片 / 视频 / PDF') };
      const runId = makeRunId();
      // 输出目录只算路径不建：到真正生成（分析 / 报告 / 语音 / 视频）才建。
      // 以前扫描就建，每点一次「载入演示素材」就多一个空的 输出/<时间戳>/。
      const outDir = outDirFor(materialDir, runId);
      // 视频缩略图在探测时就转成 data URL 回给界面，落盘只是中转：放系统临时目录，用完即删
      const scratch = mkdtempSync(join(tmpdir(), 'totalclaw-charity-scan-'));
      try {
        const items = await inspectMaterials(pipeline(runId, 'scan'), list, scratch, handle(runId));
        return { ok: true, dir: materialDir, items, outDir, runId };
      } finally {
        rmSync(scratch, { recursive: true, force: true });
      }
    } catch (e: any) {
      failLog(i18nT('素材扫描'), e);
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 1b. 档案草案（视觉模型；失败回落预置演示档案） ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_ARCHIVE_DRAFT, async (_e, req: CharityArchiveDraftRequest): Promise<CharityArchiveDraftResponse> => {
    let runId = '';
    try {
      runId = requireRunId(req?.runId);
      requireOutDir(req?.outDir, runId);
      const images = requirePaths(req?.images, i18nT('照片')).filter((p) => kindOf(p) === 'image');
      const h = handle(runId);
      try {
        requireDefaultModel();
        const archive = await draftArchive(pipeline(runId, 'archive'), images, h.signal);
        return { ok: true, archive };
      } catch (e) {
        if (h.signal.aborted) return { ok: false, error: i18nT('已取消') };
        if (!req.fallbackToPrebaked) throw e;
        const pre = loadPrebaked(resourcesDir());
        if (!pre.archive) throw e;
        fallbackLog('archive', runId, e);
        return { ok: true, archive: { ...pre.archive, source: 'demo' }, fallback: true };
      }
    } catch (e: any) {
      failLog(i18nT('活动档案草稿'), e, { runId });
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 2. 逐图 / 抽帧描述 ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_ANALYZE, async (_e, req: CharityAnalyzeRequest): Promise<CharityAnalyzeResponse> => {
    let runId = '';
    try {
      runId = requireRunId(req?.runId);
      const outDir = requireOutDir(req?.outDir, runId);
      const items = requirePaths(req?.items, i18nT('素材'));
      const contentPrompt = requirePrompt(req?.contentPrompt, i18nT('内容提示词'));
      mkdirSync(outDir, { recursive: true }); // 真正开始生成才建输出目录（扫描阶段不建）
      saveRunPrompts(outDir, { content: contentPrompt });
      const h = handle(runId);
      const prebakedDescriptions = (): ReturnType<typeof mapPrebakedDescriptions> => mapPrebakedDescriptions(loadPrebaked(resourcesDir()), items.filter((p) => kindOf(p) === 'image' || kindOf(p) === 'video').map((p) => ({ path: p, kind: kindOf(p) as 'image' | 'video' })));
      try {
        requireDefaultModel();
        const r = await analyzeMaterials(pipeline(runId, 'analyze'), items, join(outDir, '.work'), h, req?.archive ? normalizeArchive(req.archive, undefined, req.archive.source) : undefined, contentPrompt);
        if (r.descriptions.length) return { ok: true, descriptions: r.descriptions, warning: r.failed ? i18nT('{n} 个素材没能读出画面（{why}）', { n: r.failed, why: r.lastError }) : undefined };
        // 一个都没读出来（典型：默认模型不支持图片输入）：一键流程用预置描述；手动流程如实说明，报告只凭档案写
        const why = r.lastError || i18nT('当前默认模型不支持图片输入');
        if (req.fallbackToPrebaked) {
          const mapped = prebakedDescriptions();
          if (mapped.length) { fallbackLog('analyze', runId, new Error(why)); return { ok: true, descriptions: mapped, fallback: true }; }
        }
        return { ok: true, descriptions: [], warning: i18nT('画面描述不可用：{why}。报告将只依据活动档案撰写。', { why }) };
      } catch (e) {
        if (h.signal.aborted) return { ok: false, error: i18nT('已取消') };
        if (!req.fallbackToPrebaked) throw e;
        const mapped = prebakedDescriptions();
        if (!mapped.length) throw e;
        fallbackLog('analyze', runId, e);
        return { ok: true, descriptions: mapped, fallback: true };
      }
    } catch (e: any) {
      failLog(i18nT('素材识图'), e, { runId });
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 2b. 报告 + PDF + 海报 ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_REPORT, async (_e, req: CharityReportRequest): Promise<CharityReportResponse> => {
    let runId = '';
    try {
      runId = requireRunId(req?.runId);
      const outDir = requireOutDir(req?.outDir, runId);
      const archive = normalizeArchive(req?.archive, undefined, (req?.archive as any)?.source);
      const images = requirePaths(req?.images || [], i18nT('照片'));
      const descriptions = Array.isArray(req?.descriptions) ? req.descriptions : [];
      const contentPrompt = requirePrompt(req?.contentPrompt, i18nT('内容提示词'));
      mkdirSync(outDir, { recursive: true });
      saveRunPrompts(outDir, { content: contentPrompt });
      const h = handle(runId);
      const p = pipeline(runId, 'report');
      try {
        requireDefaultModel();
        const { report, via } = await composeReport(p, archive, descriptions, h.signal, contentPrompt);
        if (h.signal.aborted) return { ok: false, error: i18nT('已取消') };
        const rendered = await renderOutputs(p, archive, report, images, outDir);
        deps.logger?.info?.('charity-content', '报告已生成', { runId, via: `${via.zh}/${via.en}/${via.ar}` });
        return {
          ok: true, report, pdf: rendered.pdf, poster: rendered.poster,
          posterPreview: { zh: imageToDataUrl(rendered.poster.zh, 540), en: imageToDataUrl(rendered.poster.en, 540), ar: imageToDataUrl(rendered.poster.ar, 540) },
          pdfPreviewAr: rendered.pdfPreviewAr,
        };
      } catch (e) {
        if (h.signal.aborted) return { ok: false, error: i18nT('已取消') };
        if (!req.fallbackToPrebaked) throw e;
        const pre = loadPrebaked(resourcesDir());
        if (!pre.report || LANGS.some((l) => !pre.pdf[l] || !pre.poster[l])) throw e;
        fallbackLog('report', runId, e);
        const pdf = copyPrebakedFiles(pre.pdf, outDir, undefined, { neverOverwrite: true }) as CharityTri;
        const poster = copyPrebakedFiles(pre.poster, outDir, undefined, { neverOverwrite: true }) as CharityTri;
        return {
          ok: true, report: pre.report, pdf, poster,
          posterPreview: { zh: imageToDataUrl(poster.zh, 540), en: imageToDataUrl(poster.en, 540), ar: imageToDataUrl(poster.ar, 540) },
          pdfPreviewAr: '', fallback: true,
        };
      }
    } catch (e: any) {
      failLog(i18nT('报告生成'), e, { runId });
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── PDF 抽文字（前 N 页有文字层的页；封面等空页跳过） ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_PDF_TEXT, async (_e, req: CharityPdfTextRequest): Promise<CharityPdfTextResponse> => {
    try {
      const path = requireAbs(req?.path, 'PDF');
      if (!existsSync(path) || kindOf(path) !== 'pdf') return { ok: false, error: i18nT('不是 PDF 文件') };
      const want = Math.max(1, Math.min(10, Number(req?.pages) || 2));
      const doc = await extractDocument(path, basename(path));
      const pages = doc.pages.filter((pg) => (pg.text || '').replace(/\s+/g, '').length >= 40).slice(0, want);
      if (!pages.length) return { ok: false, error: doc.warning || i18nT('这份 PDF 没有可抽取的文字层（可能是扫描件）') };
      const text = pages.map((pg) => pg.text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()).join('\n\n');
      return { ok: true, text, pages: pages.map((pg) => pg.page), totalPages: doc.pages.length };
    } catch (e: any) {
      failLog(i18nT('PDF 取文'), e, undefined);
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 3a. 朗读文本转译（目标语言多选：一份文稿配多语言的音） ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_TRANSLATE, async (_e, req: CharityTranslateRequest): Promise<CharityTranslateResponse> => {
    let runId = '';
    try {
      runId = requireRunId(req?.runId);
      const targets = requireLangs(req?.targets);
      const text = typeof req?.text === 'string' ? req.text.trim() : '';
      if (!text) throw new Error(i18nT('没有可朗读的文本'));
      requireDefaultModel(); // 转译要走文本模型：没配默认模型时给「去设置模型」那条可点的提示
      const h = handle(runId);
      const r = await translateText(pipeline(runId, 'tts'), text, targets, h.signal);
      if (h.signal.aborted) return { ok: false, error: i18nT('已取消') };
      deps.logger?.info?.('charity-content', '朗读文本已转译', { runId, source: r.source, got: Object.keys(r.items), failed: r.failed });
      return { ok: true, source: r.source, items: r.items, failed: r.failed };
    } catch (e: any) {
      failLog(i18nT('朗读文本转译'), e, { runId });
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 3. 语音 ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_TTS, async (_e, req: CharityTtsRequest): Promise<CharityTtsResponse> => {
    let runId = '';
    try {
      runId = requireRunId(req?.runId);
      const outDir = requireOutDir(req?.outDir, runId);
      const text = requireTriText(req?.text);
      const quality = requireQuality(req?.quality);
      mkdirSync(outDir, { recursive: true });
      const h = handle(runId);
      const withData = (items: Partial<Record<CharityLang, CharityTtsItem>>): Partial<Record<CharityLang, CharityTtsItem>> => {
        for (const l of LANGS) { const it = items[l]; if (it) it.dataUrl = audioToDataUrl(it.path); }
        return items;
      };
      try {
        const items = await synthesizeSpeech(pipeline(runId, 'tts'), text, outDir, { quality, voices: req?.voices, gender: req?.gender === 'male' ? 'male' : 'female', registry: h });
        return { ok: true, items: withData(items) };
      } catch (e) {
        if (h.signal.aborted) return { ok: false, error: i18nT('已取消') };
        if (!req.fallbackToPrebaked) throw e;
        const pre = loadPrebaked(resourcesDir());
        const wanted = LANGS.filter((l) => text[l]);
        if (wanted.some((l) => !pre.speech[l])) throw e;
        fallbackLog('tts', runId, e);
        const copied = copyPrebakedFiles(Object.fromEntries(wanted.map((l) => [l, pre.speech[l]])) as Partial<CharityTri>, outDir, undefined, { neverOverwrite: true });
        // 旁白的逐句时间轴跟着拷：第 4 步字幕要按它对齐
        copyPrebakedFiles(Object.fromEntries(wanted.map((l) => [l, narrationTrackPath(pre.speech[l]!)])) as Partial<CharityTri>, outDir, undefined, { neverOverwrite: true });
        const t = tools();
        const items: Partial<Record<CharityLang, CharityTtsItem>> = {};
        for (const l of wanted) {
          const p = copied[l]!;
          items[l] = { path: p, quality: 'standard', durationSec: t ? Math.round((await audioDuration(t, p)) * 10) / 10 : 0, voice: '' };
        }
        return { ok: true, items: withData(items), fallback: true };
      }
    } catch (e: any) {
      failLog(i18nT('语音合成'), e, { runId });
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 4. 短视频 ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, async (_e, req: CharityVideoRequest): Promise<CharityVideoResponse> => {
    let runId = '';
    try {
      runId = requireRunId(req?.runId);
      const outDir = requireOutDir(req?.outDir, runId);
      const items = requirePaths(req?.items, i18nT('素材'));
      const mode = requireMode(req?.mode);
      const langs = requireLangs(req?.langs);
      const archive = normalizeArchive(req?.archive, undefined, (req?.archive as any)?.source);
      const captions = requireCaptions(req?.captions);
      const narration: Partial<CharityTri> = {};
      for (const l of LANGS) { const n = (req?.narration as any)?.[l]; if (typeof n === 'string' && n) narration[l] = requireAbs(n, i18nT('配音')); }
      const contentPrompt = requirePrompt(req?.contentPrompt, i18nT('内容提示词'));
      const videoPrompt = requirePrompt(req?.videoPrompt, i18nT('视频提示词'));
      mkdirSync(outDir, { recursive: true });
      saveRunPrompts(outDir, { content: contentPrompt, video: videoPrompt });
      const h = handle(runId);
      const t = tools();
      const finish = (out: Partial<Record<CharityLang, CharityVideoItem>>): Partial<Record<CharityLang, CharityVideoItem>> => {
        for (const l of LANGS) { const it = out[l]; if (it) it.srcUrl = buildLocalMediaUrl(it.path); }
        return out;
      };
      try {
        const out = await buildVideos(pipeline(runId, 'video'), { items, mode, langs, archive, captions, narration, bgmMood: req?.bgmMood, contentPrompt, videoPrompt, visuals: req?.visuals === 'ai-text' ? 'ai-text' : 'materials' }, outDir, h);
        saveRunPrompts(outDir, { content: contentPrompt, video: videoPrompt, effective: out.prompts });
        if (out.ai) {
          deps.logger?.info?.('charity-content', '短视频已生成', {
            runId, requested: mode, mode: out.mode, fallbackReason: out.ai.fallbackReason, estUsd: out.ai.estUsd, music: out.ai.music.source,
            shots: out.ai.shots.map((s) => `${s.index}:${s.source}${s.reused ? '(reused)' : ''}${s.reason ? `(${s.reason})` : ''}`).join(' '),
          });
        }
        return { ok: true, items: finish(out.items), mode: out.mode, ai: out.ai, prompts: out.prompts };
      } catch (e) {
        if (h.signal.aborted) return { ok: false, cancelled: true, error: i18nT('已取消') };
        if (!req.fallbackToPrebaked) throw e;
        const pre = loadPrebaked(resourcesDir());
        // AI 增强版优先拿预置的 AI 版；没有就拿剪辑版
        const pool = mode === 'ai' && langs.every((l) => pre.videoAi[l]) ? pre.videoAi : pre.video;
        if (langs.some((l) => !pool[l])) throw e;
        fallbackLog('video', runId, e);
        const copied = copyPrebakedFiles(Object.fromEntries(langs.map((l) => [l, pool[l]])) as Partial<CharityTri>, outDir, undefined, { neverOverwrite: true });
        const out: Partial<Record<CharityLang, CharityVideoItem>> = {};
        for (const l of langs) {
          const p = copied[l]!;
          const info = t ? await probeMedia(t, p) : null;
          out[l] = { path: p, srcUrl: '', durationSec: Math.round((info?.durationSec || 0) * 10) / 10, size: statSync(p).size, mode };
        }
        return { ok: true, items: finish(out), fallback: true };
      }
    } catch (e: any) {
      failLog(i18nT('短视频合成'), e, { runId });
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 预置成品清单（演示档案 + 三语成品；界面「载入演示」与回退共用） ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_PREBAKED, async (): Promise<CharityPrebakedResponse> => {
    const pre = loadPrebaked(resourcesDir());
    return {
      ok: true, available: !!pre.archive, archive: pre.archive || undefined, report: pre.report || undefined, pdf: pre.pdf, poster: pre.poster, speech: pre.speech,
      video: Object.keys(pre.videoAi).length === 3 ? pre.videoAi : pre.video,
      falReady: !!falFacade().run,
    };
  });

  // ── 演示数据包（CDN 按需下载） ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_PACK_STATUS, async (): Promise<CharityDemoPackStatusResponse> => {
    try { return { ok: true, ...demoPackStatus(resourcesDir()) }; }
    catch (e: any) { failLog(i18nT('演示包状态'), e); return { ok: false, error: userFacingError(e) }; }
  });
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_PACK_FETCH, async (): Promise<CharityDemoPackStatusResponse> => {
    /**
     * ⚠️ 必须给 signal + 硬超时，并登记进 runs 让停止键管得到。
     * 原来两个都没有：`ensureDemoPack` 内部的 `fetch(url, { signal })` 拿到的是
     * undefined，CDN 连上但不发数据时（弱网 / 中间盒常见）这个 await 永远不返回，
     * 渲染层的 demoBusy 恒为 true，「载入演示成品」按钮直到重启应用都点不动。
     */
    const h = handle('demo-pack');
    const timer = setTimeout(() => h.controller.abort(new Error(i18nT('演示数据下载超过 20 分钟未完成，已中止'))), 20 * 60_000);
    try {
      const st = await ensureDemoPack(resourcesDir(), {
        signal: h.signal,
        // 借 scan 这一步的进度通道报下载进度：它是流程最前面那一步，界面上正好在等
        onProgress: (p) => emit('demo-pack', 'scan')('download',
          i18nT('下载演示数据（{done}/{total}）', { done: p.done, total: p.total }), p.bytes, p.totalBytes),
      });
      deps.logger?.info?.('charity-content', '演示数据包已就绪', { version: st.version, files: st.totalFiles });
      return { ok: true, ...st };
    } catch (e: any) { failLog(i18nT('演示包下载'), e); return { ok: false, error: userFacingError(e) }; }
    finally { clearTimeout(timer); runs.delete('demo-pack'); }
  });

  /**
   * 一键载入演示成品：**一个生成步骤都不跑**，把预置的报告 / 海报 / 语音 / 成片直接装进本次运行。
   * 演示现场最常用的就是这条 —— 讲解的人没有十分钟等真跑，而这些成品本来就是真跑出来的。
   */
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_RESULT, async (_e, req: CharityDemoResultRequest): Promise<CharityDemoResultResponse> => {
    let runId = '';
    try {
      runId = requireRunId(req?.runId);
      const outDir = requireOutDir(req?.outDir, runId);
      mkdirSync(outDir, { recursive: true });
      const pre = loadPrebaked(resourcesDir());
      if (!prebakedComplete(pre)) throw new Error(i18nT('演示成品不完整，请先下载演示数据包'));
      const t = tools();

      const pdf = copyPrebakedFiles(pre.pdf, outDir);
      const poster = copyPrebakedFiles(pre.poster, outDir);
      const speechFiles = copyPrebakedFiles(pre.speech, outDir);
      // 旁白的逐句时间轴跟着拷：没有它字幕会退回「报告短句均匀铺开」，与语音对不上
      copyPrebakedFiles(Object.fromEntries(LANGS.filter((l) => pre.speech[l]).map((l) => [l, narrationTrackPath(pre.speech[l]!)])) as Partial<CharityTri>, outDir);

      const wantAi = req?.mode !== 'clip' && LANGS.every((l) => pre.videoAi[l]);
      const videoFiles = copyPrebakedFiles(wantAi ? pre.videoAi : pre.video, outDir);

      const speech: Partial<Record<CharityLang, CharityTtsItem>> = {};
      for (const l of LANGS) {
        const p = speechFiles[l];
        if (!p) continue;
        speech[l] = {
          path: p, quality: 'hd', voice: '',
          durationSec: t ? Math.round((await audioDuration(t, p)) * 10) / 10 : 0,
          dataUrl: audioToDataUrl(p),
        };
      }
      const videos: Partial<Record<CharityLang, CharityVideoItem>> = {};
      for (const l of LANGS) {
        const p = videoFiles[l];
        if (!p) continue;
        const info = t ? await probeMedia(t, p) : null;
        videos[l] = {
          path: p, srcUrl: buildLocalMediaUrl(p),
          durationSec: Math.round((info?.durationSec || 0) * 10) / 10,
          size: statSync(p).size, mode: wantAi ? 'ai' : 'clip',
        };
      }
      deps.logger?.info?.('charity-content', '已载入演示成品（未跑生成）', { runId, mode: wantAi ? 'ai' : 'clip' });
      return {
        ok: true, archive: pre.archive!, report: pre.report!, pdf, poster,
        posterPreview: Object.fromEntries(LANGS.filter((l) => poster[l]).map((l) => [l, imageToDataUrl(poster[l]!, 540)])) as Partial<CharityTri>,
        pdfPreview: {},
        speech, videos, mode: wantAi ? 'ai' : 'clip',
      };
    } catch (e: any) {
      failLog(i18nT('载入演示成品'), e, { runId });
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 演示素材：随包素材复制到 <文稿>/TotalClaw/慈善演示素材/（幂等），渲染层再按普通目录扫描 ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_MATERIALS, async (): Promise<CharityDemoMaterialsResponse> => {
    try {
      const r = prepareDemoMaterials(demoMaterialsSourceDir(resourcesDir()), demoMaterialsTargetDir(app.getPath('documents'), documentsFolderName()));
      deps.logger?.info?.('charity-content', '演示素材就绪', { dir: r.dir, copied: r.copied.length, skipped: r.skipped.length });
      return { ok: true, dir: r.dir, copied: r.copied.length };
    } catch (e: any) {
      deps.logger?.warn?.('charity-content', '演示素材复制失败', { message: String(e?.message || e) });
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 历史（<素材目录>/输出/<runId>/ 逐次归档） ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_HISTORY, async (_e, req: CharityHistoryRequest): Promise<CharityHistoryResponse> => {
    try {
      const dir = requireAbs(req?.dir, i18nT('素材目录'));
      const root = join(dir, OUTPUT_DIR_NAME);
      if (!existsSync(root)) return { ok: true, runs: [] };
      const runs: CharityHistoryRun[] = [];
      for (const name of readdirSync(root).sort().reverse().slice(0, 30)) {
        const outDir = join(root, name);
        try { if (!statSync(outDir).isDirectory()) continue; } catch { continue; }
        const byLang = (prefix: string, ext: string, suffixes = ['']): Partial<CharityTri> => {
          const o: Partial<CharityTri> = {};
          for (const l of LANGS) for (const s of suffixes) { const p = join(outDir, `${prefix}-${l}${s}.${ext}`); if (existsSync(p)) { o[l] = p; break; } }
          return o;
        };
        let archive: CharityArchive | undefined;
        try { const p = join(outDir, 'archive.json'); if (existsSync(p)) archive = normalizeArchive(JSON.parse(readFileSync(p, 'utf8'))); } catch { archive = undefined; }
        // 两种成片分开列：同一次运行可能先出 AI 增强版、再手选剪辑版重出，历史里都要找得到、分得清
        const run: CharityHistoryRun = { runId: name, outDir, createdAt: statSync(outDir).mtimeMs, archive, pdf: byLang('report', 'pdf'), poster: byLang('poster', 'jpg'), speech: byLang('speech', 'mp3'), video: byLang('video', 'mp4'), videoAi: byLang('video', 'mp4', ['-ai']) };
        const prompts = readRunPrompts(outDir);
        if (prompts.content || prompts.video) run.prompts = { content: prompts.content || undefined, video: prompts.video || undefined };
        if ([run.pdf, run.video, run.videoAi, run.speech, run.poster].some((o) => Object.keys(o!).length)) runs.push(run);
      }
      return { ok: true, runs };
    } catch {
      return { ok: true, runs: [] };
    }
  });

  // ── 文件 → 可预览 URL（验真：文件必须存在且非空） ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_FILE_URL, async (_e, req: CharityFileUrlRequest): Promise<CharityFileUrlResponse> => {
    try {
      const path = requireAbs(req?.path, i18nT('文件'));
      if (!existsSync(path)) return { ok: false, error: i18nT('文件不存在') };
      const st = statSync(path);
      if (!st.isFile() || st.size <= 0) return { ok: false, error: i18nT('文件无效') };
      const base = { ok: true, size: st.size, mtimeMs: st.mtimeMs };
      if (req.kind === 'video') {
        const t = tools();
        const info = t ? await probeMedia(t, path) : null;
        return { ...base, url: buildLocalMediaUrl(path), durationSec: info?.durationSec };
      }
      if (req.kind === 'audio') {
        const t = tools();
        return { ...base, url: audioToDataUrl(path), durationSec: t ? await audioDuration(t, path) : undefined };
      }
      if (req.kind === 'pdf') {
        // PDF 本身不内嵌预览（渲染层用 <iframe> 加载会被 CSP 挡）：返回同目录的首页截图（阿语有专门截图）
        const sibling = path.replace(/\.pdf$/i, '-page1.png');
        return { ...base, url: existsSync(sibling) ? imageToDataUrl(sibling, 900) : '' };
      }
      return { ...base, url: imageToDataUrl(path, Math.max(96, Math.min(1600, Number(req.maxSize) || 720))) };
    } catch (e: any) {
      failLog(i18nT('文件预览'), e, undefined);
      return { ok: false, error: userFacingError(e) };
    }
  });

  // ── 另存为（下载按钮）：系统保存框 → 拷贝 ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_SAVE_AS, async (_e, req: CharitySaveAsRequest): Promise<CharitySaveAsResponse> => {
    try {
      const path = requireAbs(req?.path, i18nT('文件'));
      if (!existsSync(path)) return { ok: false, error: i18nT('文件不存在') };
      const r = await dialog.showSaveDialog(win() ?? undefined as any, { title: i18nT('保存到…'), defaultPath: join(app.getPath('downloads'), String(req?.suggestedName || basename(path)).replace(/[\\/:*?"<>|]/g, '_')) });
      if (r.canceled || !r.filePath) return { ok: false, cancelled: true };
      copyFileSync(path, r.filePath);
      return { ok: true, path: r.filePath };
    } catch (e: any) {
      failLog(i18nT('另存为'), e, undefined);
      return { ok: false, error: userFacingError(e) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CHARITY_CANCEL, async (_e, req: { runId?: string }) => {
    const id = String(req?.runId || '');
    const h = runs.get(id);
    if (!h) return { ok: true };
    h.controller.abort();
    for (const c of h.children) killTree(c);
    runs.delete(id);
    return { ok: true };
  });
}
