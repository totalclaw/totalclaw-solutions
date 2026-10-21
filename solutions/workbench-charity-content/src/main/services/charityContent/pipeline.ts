/**
 * 慈善活动内容工场 · 四步流水线（主进程编排，依赖全部注入，可在单测里用假实现跑通）。
 *
 *   1 scan     素材目录 → 逐个探测（尺寸 / 时长 / 缩略图）
 *   1b archive 前几张照片 → 视觉模型 → 档案草案（三语）
 *   2 analyze  逐图描述 + 视频每 10s 抽帧描述 → 三语画面描述
 *   2b report  档案 + 描述 → 三语报告（数字核对）→ PDF ×3 + 海报 ×3
 *   3 tts      文本 → fal MiniMax hd（zh/en）/ edge-tts（ar 与回落）
 *   4 video    AI 增强版（默认：fal i2v + Stable Audio，失败逐镜头回退本地）或素材剪辑版（本地 ffmpeg）→ 三语字幕成片
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type {
  CharityAiShot, CharityArchive, CharityEffectivePrompts, CharityLang, CharityMediaDescription, CharityMediaItem, CharityReport, CharityReportContent,
  CharityTri, CharityTtsItem, CharityTtsQuality, CharityVoiceGender, CharityVideoAiReport, CharityVideoItem, CharityVideoMode, CharityVideoPhase,
} from '@totalclaw/ipc-contracts';
import { getLocale, t as i18nT } from '@totalclaw/i18n';
import { matchLiteral } from '../../../shared/matchTokens';
import { LANGS, archiveDraftPrompt, emptyArchive, extractJsonObject, extractStringFields, isBlankTri, looksLikeRawJson, normalizeArchive, toTri, tri } from './archive';
import { condensePromptsRequest, describeFallback, deterministicReport, describePrompt, findForeignNumbers, parseReportContent, reportPrompt, reportRetryPrompt } from './reportText';
import { buildPosterHtml, buildReportHtml } from './reportHtml';
import {
  END_CARD_SEC, NARRATION_PAUSE_SEC, NARRATION_TAIL_SEC, type CaptionCue, type NarrationTrack, buildAss, buildSrt, displayCues, narrationTimeline, narrationTrackPath, narrationUnits, parseNarrationTrack,
  planCaptions, planTimeline, splitSentences, videoDurationFor,
} from './subtitles';
import {
  type MediaTools, type ProcRegistry, audioDuration, burnAss, concatClips, concatNarration, decodeToWav, extractFrames, fadeOut, fileSize, imageClip, kindOf,
  mixAudio, normalizeClip, prepareSubtitleFonts, probeMedia, runProc, videoThumb, describeFailure,
} from './media';
import { type FalFacade, type FalJobProgress, FAL_TTS_VOICES, falFatalReason, i2vRequest, musicRequest, shortFalError, t2vRequest } from './falBridge';
import { type TtsRouteResult, TTS_DEFAULT_MALE_VOICES } from '../media/ttsRouter';
import { falConcurrency, localProcConcurrency, mapLimit } from './concurrency';
import {
  BASE_SHOT_PROMPT, CHARITY_TEXT_MAX, TRANSLATE_CHUNK_CHARS, clampPhrases, clipStyleFromPrompt, composeMerged, dedupePhrases, endSloganFromPrompt, mergeShotPrompt, musicPrompt, needsCondense, promptPhrases, translatePrompt,
} from '../../../shared/charityPrompts';

/** 素材目录下的产物子目录名：是**文件系统路径段**（还拿来做 basename 相等比较），不随界面语言变 */
export const OUTPUT_DIR_NAME = matchLiteral('输出');

export interface PipelineDeps {
  resourcesDir: string;
  tools: MediaTools | null;
  agentHome?: string;
  /** 统一 fal 通道（runFalJob + ttsRouter）；没 key 时两项为 null */
  fal: FalFacade;
  /** 视觉补全：本地图片路径 + 提示 → 文本（fal any-llm/vision 优先，其次单聊 brain 的多模态通道） */
  vision: (imagePath: string, prompt: string, signal?: AbortSignal) => Promise<string>;
  /** 纯文本补全（要求 JSON） */
  text: (prompt: string, opts: { jsonObject?: boolean; signal?: AbortSignal; timeoutMs?: number }) => Promise<string>;
  renderPdf: (html: string, outPath: string) => Promise<void>;
  /** 离屏渲染 HTML 成图（海报 / PDF 首页截图） */
  renderImage: (html: string, outPath: string, width: number, height: number) => Promise<void>;
  /** 本地图片 → 缩小后的 data URL（视觉模型输入 / 海报背景 / 缩略图） */
  imageDataUrl: (path: string, maxSize: number) => string;
  /** extra 仅第 4 步：当前阶段与阶段计划（界面按真实阶段画进度） */
  progress: (stage: string, msg: string, done: number, total: number, extra?: { phase?: CharityVideoPhase; plan?: CharityVideoPhase[] }) => void;
  log: { info: (m: string, ctx?: Record<string, unknown>) => void; warn: (m: string, ctx?: Record<string, unknown>) => void };
}

export function makeRunId(now = new Date()): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
}

export function outDirFor(materialDir: string, runId: string): string {
  return join(materialDir, OUTPUT_DIR_NAME, runId);
}

// ── 本次运行的两个提示词存档（<输出目录>/prompts.json；历史记录里看得到用了什么） ──

export const RUN_PROMPTS_FILE = 'prompts.json';
export interface RunPrompts { content?: string; video?: string; effective?: CharityEffectivePrompts; updatedAt?: string }

export function readRunPrompts(outDir: string): RunPrompts {
  try {
    const j = JSON.parse(readFileSync(join(outDir, RUN_PROMPTS_FILE), 'utf8'));
    return j && typeof j === 'object' ? j : {};
  } catch { return {}; }
}

/** 合并写入：第 2 步只带内容提示词，第 4 步再补视频提示词与实际使用的合并结果 */
export function saveRunPrompts(outDir: string, patch: RunPrompts): void {
  try {
    const next = { ...readRunPrompts(outDir), ...patch, updatedAt: new Date().toISOString() };
    writeFileSync(join(outDir, RUN_PROMPTS_FILE), JSON.stringify(next, null, 2));
  } catch { /* 存档失败不影响生成 */ }
}

// ── 1. 素材探测 ──────────────────────────────────────────

export function listMaterialFiles(dir: string, extra: string[] = []): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (p: string): void => { if (!seen.has(p)) { seen.add(p); out.push(p); } };
  if (dir && existsSync(dir)) {
    let entries: string[] = [];
    try { entries = readdirSync(dir); } catch { entries = []; }
    for (const name of entries.sort()) {
      if (name.startsWith('.') || name === OUTPUT_DIR_NAME) continue;
      const full = join(dir, name);
      try { if (!statSync(full).isFile()) continue; } catch { continue; }
      if (kindOf(full) === 'other') continue;
      push(full);
    }
  }
  for (const f of extra) if (f && existsSync(f) && kindOf(f) !== 'other') push(f);
  return out;
}

export async function inspectMaterials(deps: PipelineDeps, files: string[], workDir: string, registry?: ProcRegistry): Promise<CharityMediaItem[]> {
  const items: CharityMediaItem[] = [];
  mkdirSync(workDir, { recursive: true });
  let i = 0;
  for (const path of files) {
    i += 1;
    const kind = kindOf(path);
    const name = basename(path);
    let size = 0; let mtimeMs = 0;
    try { const st = statSync(path); size = st.size; mtimeMs = st.mtimeMs; } catch { items.push({ path, name, kind, size: 0, mtimeMs: 0, ok: false, error: i18nT('文件不可读') }); continue; }
    deps.progress('scan', i18nT('探测 {name}', { name }), i, files.length);
    const item: CharityMediaItem = { path, name, kind, size, mtimeMs, ok: size > 0 };
    if (size <= 0) { item.error = i18nT('空文件'); items.push(item); continue; }
    try {
      if (kind === 'image') {
        const url = deps.imageDataUrl(path, 240);
        if (!url) { item.ok = false; item.error = i18nT('图片无法解码（HEIC 等格式请先转成 JPG）'); }
        else item.thumbDataUrl = url;
      } else if (kind === 'video' && deps.tools) {
        const info = await probeMedia(deps.tools, path, registry);
        if (!info || !info.durationSec) { item.ok = false; item.error = i18nT('视频无法解析'); }
        else {
          item.durationSec = Math.round(info.durationSec * 10) / 10; item.width = info.width; item.height = info.height;
          const thumb = join(workDir, `thumb-${i}.jpg`);
          if (await videoThumb(deps.tools, path, thumb, registry)) item.thumbDataUrl = deps.imageDataUrl(thumb, 240);
        }
      } else if (kind === 'video') {
        item.ok = false; item.error = i18nT('未找到 ffmpeg，无法解析视频');
      }
    } catch (e: any) {
      item.ok = false; item.error = String(e?.message || e);
    }
    items.push(item);
  }
  return items;
}

// ── 1b. 档案草案 ─────────────────────────────────────────

function mergeArchiveDrafts(drafts: CharityArchive[]): CharityArchive {
  const out = emptyArchive('vlm');
  const pickTri = (key: 'orgName' | 'eventName' | 'location' | 'organizer' | 'summary'): CharityTri => {
    const hit = drafts.find((d) => !isBlankTri(d[key]));
    return hit ? hit[key] : tri();
  };
  out.orgName = pickTri('orgName'); out.eventName = pickTri('eventName'); out.location = pickTri('location');
  out.organizer = pickTri('organizer'); out.summary = pickTri('summary');
  out.date = drafts.find((d) => d.date)?.date || '';
  out.participants = drafts.find((d) => d.participants != null)?.participants ?? null;
  out.donation = drafts.find((d) => d.donation)?.donation || '';
  return out;
}

export async function draftArchive(deps: PipelineDeps, images: string[], signal?: AbortSignal): Promise<CharityArchive> {
  const picked = images.filter((p) => existsSync(p)).slice(0, 4);
  if (!picked.length) throw new Error(i18nT('没有可用的照片，无法生成档案草案'));
  const drafts: CharityArchive[] = [];
  const prompt = archiveDraftPrompt();
  for (let i = 0; i < picked.length; i += 1) {
    deps.progress('archive', i18nT('视觉模型阅读第 {n} 张照片…', { n: i + 1 }), i, picked.length);
    const text = await deps.vision(picked[i], prompt, signal);
    const obj = extractJsonObject(text);
    if (obj) drafts.push(normalizeArchive(obj, undefined, 'vlm'));
  }
  const merged = mergeArchiveDrafts(drafts);
  if (isBlankTri(merged.orgName) && isBlankTri(merged.eventName)) throw new Error(i18nT('视觉模型没有从照片里读出机构或活动信息'));
  if (isBlankTri(merged.eventName)) merged.eventName = toTri(merged.summary.zh ? merged.summary : merged.orgName);
  if (isBlankTri(merged.orgName)) merged.orgName = toTri(merged.organizer.zh ? merged.organizer : merged.eventName);
  if (isBlankTri(merged.organizer)) merged.organizer = merged.orgName;
  if (isBlankTri(merged.summary)) merged.summary = merged.eventName;
  deps.progress('archive', i18nT('档案草案已生成'), picked.length, picked.length);
  return merged;
}

// ── 2. 素材分析 ──────────────────────────────────────────

export interface DescribeParse { description: CharityTri; unrecognized?: boolean }

/**
 * 视觉模型描述回复 → 三语描述。顺序：去围栏 → 严格 JSON → 宽松修复（未转义引号 / 尾逗号）→ 按 zh/en/ar 字段抽取；
 * 缺的语言用档案兜底文字补；全部失败标「未识别」并整段用档案兜底——原始 JSON 绝不进界面。
 * 空回复返回 null（计入读图失败）。
 */
export function parseDescribeReply(text: string, archive?: CharityArchive): DescribeParse | null {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const fallback = describeFallback(archive);
  const clean = (v: unknown): string => (typeof v === 'string' && !looksLikeRawJson(v) ? v.trim() : '');
  const fromRecord = (rec: Record<string, unknown>): DescribeParse | null => {
    const got = tri(clean(rec.zh), clean(rec.en), clean(rec.ar));
    return isBlankTri(got) ? null : { description: toTri(got, fallback) };
  };
  const obj = extractJsonObject(raw);
  const parsed = (obj && fromRecord(obj)) || fromRecord(extractStringFields(raw, LANGS));
  if (parsed) return parsed;
  // 纯文字回复（没按 JSON 格式）：它本身就是描述，三语同文
  if (!looksLikeRawJson(raw) && !raw.includes('{')) return { description: toTri(raw) };
  return { description: fallback, unrecognized: true };
}

export interface AnalyzeResult { descriptions: CharityMediaDescription[]; failed: number; lastError: string }

/** 逐图 / 抽帧读图。单个素材读不出不整体失败：记数 + 最后一条原因，交调用方决定回退还是如实说明 */
export async function analyzeMaterials(deps: PipelineDeps, items: string[], workDir: string, registry?: ProcRegistry, archive?: CharityArchive, contentPrompt = ''): Promise<AnalyzeResult> {
  const out: CharityMediaDescription[] = [];
  const list = items.filter((p) => existsSync(p) && kindOf(p) !== 'other' && kindOf(p) !== 'pdf');
  const total = list.length;
  // 看图只要「关注什么」：内容提示词按短语取前 400 字（报告 / 旁白才整段带入）
  const focus = clampPhrases(dedupePhrases(promptPhrases(contentPrompt)), 400);
  let done = 0;
  let failed = 0;
  let lastError = '';
  const describe = async (imagePath: string, kind: 'image' | 'video'): Promise<DescribeParse | null> => {
    try {
      const reply = await deps.vision(imagePath, describePrompt(kind, focus), registry?.signal);
      const parsed = parseDescribeReply(reply, archive);
      if (parsed?.unrecognized) deps.log.warn('charity-content: 画面描述回复无法解析，改用档案兜底', { path: basename(imagePath), head: reply.slice(0, 160), length: reply.length });
      return parsed;
    } catch (e: any) {
      if (registry?.signal.aborted) throw e;
      lastError = String(e?.message || e).replace(/^\[[A-Z_]+\]\s*/, '');
      return null;
    }
  };
  for (const path of list) {
    const kind = kindOf(path) as 'image' | 'video';
    deps.progress('analyze', kind === 'video' ? i18nT('视频抽帧并阅读：{name}', { name: basename(path) }) : i18nT('阅读照片：{name}', { name: basename(path) }), done, total);
    if (kind === 'image') {
      const d = await describe(path, 'image');
      if (d) out.push({ path, kind, description: d.description, ...(d.unrecognized ? { unrecognized: true } : {}) }); else failed += 1;
    } else if (deps.tools) {
      const frameDir = join(workDir, 'frames');
      const frames = await extractFrames(deps.tools, path, frameDir, { intervalSec: 10, maxFrames: 6, registry });
      const parts: CharityTri[] = [];
      let unrecognized = 0;
      for (const f of frames.slice(0, 3)) {
        const d = await describe(f, 'video');
        if (d?.unrecognized) unrecognized += 1;
        else if (d) parts.push(d.description);
        else if (lastError) break; // 同一模型对第一帧都读不了，后面几帧不用再试
      }
      if (parts.length) out.push({ path, kind, frames, description: tri(parts.map((p) => p.zh).join(' '), parts.map((p) => p.en).join(' '), parts.map((p) => p.ar).join(' ')) });
      else if (unrecognized) out.push({ path, kind, frames, description: describeFallback(archive), unrecognized: true });
      else failed += 1;
    }
    done += 1;
  }
  deps.progress('analyze', out.length ? i18nT('已读完 {n} 个素材', { n: out.length }) : i18nT('画面描述不可用'), total, total);
  return { descriptions: out, failed, lastError };
}

// ── 2b. 报告文案 + PDF + 海报 ─────────────────────────────

export async function composeReport(deps: PipelineDeps, archive: CharityArchive, descriptions: CharityMediaDescription[], signal?: AbortSignal, contentPrompt = ''): Promise<{ report: CharityReport; via: Record<CharityLang, 'llm' | 'template'> }> {
  const template = deterministicReport(archive, descriptions);
  const report = { ...template };
  const via: Record<CharityLang, 'llm' | 'template'> = { zh: 'template', en: 'template', ar: 'template' };
  let step = 0;
  for (const lang of LANGS) {
    const prompt = reportPrompt(archive, descriptions, lang, contentPrompt);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      deps.progress('report', attempt ? i18nT('{lang} 报告出现了档案之外的数字，正在重写…', { lang: langLabel(lang) }) : i18nT('撰写 {lang} 活动报告…', { lang: langLabel(lang) }), step, 9);
      let text = '';
      try {
        text = await deps.text(attempt ? reportRetryPrompt(prompt) : prompt, { jsonObject: true, signal, timeoutMs: 180_000 });
      } catch (e: any) {
        deps.log.warn('charity-content: 报告模型调用失败，该语言改用模板报告', { lang, message: String(e?.message || e) });
        break;
      }
      const parsed = parseReportContent(text, lang);
      if (!parsed) { deps.log.warn('charity-content: 报告 JSON 解析失败', { lang, attempt, head: text.slice(0, 160), length: text.length }); continue; }
      const foreign = findForeignNumbers(parsed, archive);
      if (foreign.length) { deps.log.warn('charity-content: 报告含档案之外的数字', { lang, foreign }); continue; }
      report[lang] = parsed; via[lang] = 'llm';
      break;
    }
    step += 1;
  }
  return { report, via };
}

export interface RenderedOutputs { pdf: CharityTri; poster: CharityTri; pdfPreviewAr: string }

export async function renderOutputs(deps: PipelineDeps, archive: CharityArchive, report: CharityReport, images: string[], outDir: string): Promise<RenderedOutputs> {
  mkdirSync(outDir, { recursive: true });
  const photos = images.filter((p) => existsSync(p) && kindOf(p) === 'image').slice(0, 3).map((p) => deps.imageDataUrl(p, 900)).filter(Boolean);
  // 三语海报各配一张不同照片（有几张用几张）：并排展示时不重样
  const bgPool = images.filter((p) => existsSync(p) && kindOf(p) === 'image');
  const bgFor = (i: number): string => (bgPool.length ? deps.imageDataUrl(bgPool[i % bgPool.length], 1400) : '');
  const pdf = tri(); const poster = tri();
  let step = 3;
  for (const lang of LANGS) {
    deps.progress('report', i18nT('渲染 {lang} 报告 PDF…', { lang: langLabel(lang) }), step, 9); step += 1;
    const html = buildReportHtml(lang, archive, report[lang], { photos });
    pdf[lang] = join(outDir, `report-${lang}.pdf`);
    await deps.renderPdf(html, pdf[lang]);
  }
  for (const [i, lang] of LANGS.entries()) {
    deps.progress('report', i18nT('渲染 {lang} 海报…', { lang: langLabel(lang) }), step, 9);
    const html = buildPosterHtml(lang, archive, report[lang], { background: bgFor(i) });
    poster[lang] = join(outDir, `poster-${lang}.jpg`);
    await deps.renderImage(html, poster[lang], 1080, 1920);
  }
  // 首页截图（页内预览 + 阿语 RTL 验收）：与 PDF 同一份 HTML、同一渲染器，A4 @96dpi
  for (const lang of LANGS) {
    const png = join(outDir, `report-${lang}-page1.png`);
    try { await deps.renderImage(buildReportHtml(lang, archive, report[lang], { photos }), png, 794, 1123); } catch (e: any) { deps.log.warn('charity-content: 报告首页截图失败', { lang, message: String(e?.message || e) }); }
  }
  const pdfPreviewAr = join(outDir, 'report-ar-page1.png');
  writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  writeFileSync(join(outDir, 'archive.json'), JSON.stringify(archive, null, 2));
  deps.progress('report', i18nT('报告与海报已生成'), 9, 9);
  return { pdf, poster, pdfPreviewAr: existsSync(pdfPreviewAr) ? pdfPreviewAr : '' };
}

export function langLabel(lang: CharityLang): string {
  // 进度文案里的语言名跟界面语言走：中文界面用母语写法，英 / 阿界面不再冒「中文」
  const ui = getLocale();
  if (ui === 'zh-CN') return lang === 'zh' ? i18nT('中文') : lang === 'en' ? 'English' : 'العربية';
  try {
    const name = new Intl.DisplayNames([ui], { type: 'language' }).of(lang);
    if (name) return name.charAt(0).toUpperCase() + name.slice(1);
  } catch { /* 无 Intl.DisplayNames 时回落英文名 */ }
  return lang === 'zh' ? 'Chinese' : lang === 'en' ? 'English' : 'Arabic';
}

// ── 3. 语音 ──────────────────────────────────────────────

/**
 * 判断一段文字是哪种语言。只在中 / 英 / 阿三者间分：阿拉伯字母与汉字各数一遍，
 * 谁多算谁，都没有就按英文（PDF 抽取那边用的是同一套判据，两处要一致）。
 */
export function detectCharityLang(text: string): CharityLang {
  const ar = (text.match(/[\u0600-\u06ff]/g) || []).length;
  const zh = (text.match(/\p{Script=Han}/gu) || []).length;
  return ar > 0 && ar >= zh ? 'ar' : zh > 0 ? 'zh' : 'en';
}

/** 按整句攒成不超过 TRANSLATE_CHUNK_CHARS 的块：整篇一次性译容易截断，从句子中间切又会走样 */
export function translateChunks(text: string, lang: CharityLang, max = TRANSLATE_CHUNK_CHARS): string[] {
  const out: string[] = [];
  let cur = '';
  for (const s of splitSentences(text, lang)) {
    // 单句就超长：自己一块，交给模型（再切就要从句中断开了）
    if (s.length >= max) { if (cur) { out.push(cur); cur = ''; } out.push(s); continue; }
    if (cur && cur.length + s.length > max) { out.push(cur); cur = ''; }
    cur += (cur ? ' ' : '') + s;
  }
  if (cur) out.push(cur);
  return out.length ? out : [text];
}

/**
 * 朗读文本转译：一份文稿 → 指定的几种语言。
 *
 * 用在第 3 步「目标语言多选」：手上只有一种语言的文稿，却要出多语言配音。与源语言相同的
 * 那一种直接原样返回，不过一遍模型（既省钱，也避免「中译中」把原文改写了）。
 * 某一种语言译失败不拖累其它语言：这一种不返回，调用方按「没有这一语言的文本」处理。
 */
export async function translateText(
  deps: PipelineDeps, text: string, targets: CharityLang[], signal?: AbortSignal,
): Promise<{ source: CharityLang; items: Partial<Record<CharityLang, string>>; failed: CharityLang[] }> {
  const body = text.trim().slice(0, CHARITY_TEXT_MAX);
  const source = detectCharityLang(body);
  const items: Partial<Record<CharityLang, string>> = {};
  const failed: CharityLang[] = [];
  if (!body) return { source, items, failed };
  const wanted = [...new Set(targets)].filter((l) => LANGS.includes(l));
  const chunks = translateChunks(body, source);
  for (const lang of wanted) if (lang === source) items[lang] = body;

  // 「语言 × 块」摊平成一张任务表再统一派发：语言之间、块之间都互不依赖，
  // 按语言嵌套两层并发反而说不清总共开了几个连接。
  const need = wanted.filter((l) => l !== source);
  const tasks = need.flatMap((lang) => chunks.map((chunk, i) => ({ lang, chunk, i })));
  const parts = new Map<CharityLang, Array<string | null>>(need.map((l) => [l, chunks.map(() => null)]));
  const broke = new Set<CharityLang>();
  let done = 0;
  await mapLimit(tasks, falConcurrency(), async (task) => {
    // 这一语言已经有块失败了，剩下的块不必再译（拼不出完整译文，白花钱）
    if (broke.has(task.lang) || signal?.aborted) return;
    deps.progress('tts', i18nT('转译成 {lang}（{done}/{total} 段）', { lang: langLabel(task.lang), done: done + 1, total: tasks.length }), done, tasks.length);
    try {
      const reply = await deps.text(translatePrompt(task.chunk, task.lang), { jsonObject: true, signal, timeoutMs: 120_000 });
      const got = String((extractJsonObject(reply) || {}).text || '').trim();
      if (!got) throw new Error(i18nT('模型没有返回译文'));
      parts.get(task.lang)![task.i] = got;
      done += 1;
    } catch (e) {
      if (signal?.aborted) throw e;
      broke.add(task.lang);
      deps.log.warn('charity-content: 转译失败，这一语言跳过', { lang: task.lang, chunk: task.i + 1, message: String((e as Error)?.message || e).slice(0, 200) });
    }
  }, { signal, stopOnError: false, warmup: true });
  if (signal?.aborted) throw new Error(i18nT('已取消'));

  for (const lang of need) {
    const got = parts.get(lang)!;
    // 只认整篇都译出来的：缺一块就是缺一段话，宁可这一语言不出，也不出个断篇的配音
    if (broke.has(lang) || got.some((v) => !v)) { failed.push(lang); continue; }
    items[lang] = got.join('\n');
  }
  return { source, items, failed };
}

export const EDGE_VOICES: Record<CharityLang, string> = { zh: 'zh-CN-XiaoxiaoNeural', en: 'en-US-AriaNeural', ar: 'ar-AE-FatimaNeural' };
/** 选男声时的备用 edge-tts 音色 */
export const EDGE_MALE_VOICES: Record<CharityLang, string> = { zh: 'zh-CN-YunxiNeural', en: 'en-US-GuyNeural', ar: 'ar-AE-HamdanNeural' };

/** edge-tts 也要联网（微软语音端点）。一次网络抖动能同时打掉 fal 和它，重试的次数与间隔 */
const EDGE_TTS_TRIES = 3;
const EDGE_TTS_BACKOFF_MS = [1500, 4000];

/**
 * fal 逐句合成的重试。
 *
 * 原来一句失败就整段改用 edge-tts —— 实测阿语第 18 句碰上一次网络抖动，前 17 句合成好的
 * 高保真语音全部作废重来，用户看到的就是「卡了很久，最后还是备用音质」。瞬时失败先重试，
 * 别让一句把前面几十句的成果一起扔掉。
 * 只对 `error`（网络 / 上游故障）重试：没 key、额度用尽、熔断已打开这三种再试也是同样结果。
 */
const FAL_TTS_UNIT_TRIES = 3;
const FAL_TTS_UNIT_BACKOFF_MS = [900, 2500];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

async function edgeTts(deps: PipelineDeps, text: string, voice: string, out: string, registry?: ProcRegistry): Promise<void> {
  const tools = deps.tools;
  if (!tools?.python) throw new Error(i18nT('找不到 agent python，无法合成语音（开发先跑 pnpm setup:totalclaw-agent）'));
  const script = join(tools.scriptsDir, 'tts.py');
  if (!existsSync(script)) throw new Error(i18nT('缺少 tts.py 脚本'));
  // 备用链路失败就整步失败过一次（fal 与 edge-tts 被同一次出站 TLS 抖动一起打掉）。
  // 这是最后一条链路，没有下一级可退，值得重试几次再放弃。
  let last = '';
  for (let attempt = 1; attempt <= EDGE_TTS_TRIES; attempt += 1) {
    if (registry?.signal?.aborted) throw new Error(i18nT('已取消'));
    const r = await runProc(tools.python, [script, '--text', text, '--engine', 'edge', '--voice', voice, '--output', out, '--force'], { env: tools.env, timeoutMs: 180_000, registry });
    if (r.code === 0 && existsSync(out)) return;
    last = describeFailure(i18nT('edge-tts 合成'), r);
    if (attempt < EDGE_TTS_TRIES) {
      deps.log.warn('charity-content: edge-tts 失败，稍后重试', { attempt, tries: EDGE_TTS_TRIES, message: last.slice(0, 200) });
      await sleep(EDGE_TTS_BACKOFF_MS[attempt - 1] ?? 4000);
    }
  }
  throw new Error(last);
}

/**
 * fal 合成一句（带重试）。成功返回音频；重试完还不行就抛出，由调用方把整段改成备用链路。
 * 放弃前记一条日志，写清是第几句、什么原因 —— 这是排障时唯一能对上现场的信息。
 */
async function falTtsUnit(
  deps: PipelineDeps, unit: string, lang: CharityLang, falVoice: string | undefined,
  gender: CharityVoiceGender | undefined, index: number, signal?: AbortSignal,
): Promise<TtsRouteResult> {
  let last: TtsRouteResult | null = null;
  for (let attempt = 1; attempt <= FAL_TTS_UNIT_TRIES; attempt += 1) {
    const r = await deps.fal.tts!.synthesize({ text: unit, lang, falVoice, gender, signal });
    if (signal?.aborted) throw new Error(i18nT('已取消'));
    if (r.ok && r.provider === 'fal' && !r.degraded && r.audioBase64) return r;
    last = r;
    // no_key / quota / circuit：再试也是同样结果，立刻交给备用链路
    if (r.degradedReason !== 'error' || attempt >= FAL_TTS_UNIT_TRIES) break;
    deps.log.warn('charity-content: fal 这一句失败，稍后重试', { lang, sentence: index + 1, attempt, error: r.error });
    await sleep(FAL_TTS_UNIT_BACKOFF_MS[attempt - 1] ?? 2500);
  }
  deps.log.warn('charity-content: fal 语音不可用，整段改用 edge-tts（备用）', { lang, sentence: index + 1, reason: last?.degradedReason, error: last?.error });
  throw new Error(last?.error || 'fal tts unavailable');
}

/**
 * 语音：旁白文本按句切分（一屏放不下的长句再在句内逗号处分组），**逐句**合成（同一语言同一音色）→ 逐句量真实时长 → 句间插停顿拼成整段旁白，
 * 并在旁白旁写一份时间轴（speech-<lang>.cues.json）：第 4 步的字幕就是这份原文 + 这份时间，与声音逐句对齐。
 *
 * 音色：走全应用 ttsRouter（fal MiniMax speech-02-hd 优先，缓存 / 熔断 / 用量都在那边）；
 * 任何一句 fal 不可用（无 key / 额度 / 接口失败）→ 整段改用 edge-tts 重合成，结果标 standard（界面「标准音质（备用）」），
 * 不让一段旁白里混两种嗓音。没有 ffmpeg 时不切句（无法量时长与拼接），整段一次合成、不写时间轴。
 */
export async function synthesizeSpeech(
  deps: PipelineDeps,
  text: Partial<CharityTri>,
  outDir: string,
  opts: { quality: CharityTtsQuality; voices?: Partial<CharityTri>; gender?: CharityVoiceGender; registry?: ProcRegistry },
): Promise<Partial<Record<CharityLang, CharityTtsItem>>> {
  const male = opts.gender === 'male';
  mkdirSync(outDir, { recursive: true });
  const langs = LANGS.filter((l) => (text[l] || '').trim());
  if (!langs.length) throw new Error(i18nT('没有可朗读的文本'));
  const tools = deps.tools;
  const workDir = join(outDir, '.work-tts');
  const out: Partial<Record<CharityLang, CharityTtsItem>> = {};
  let i = 0;
  for (const lang of langs) {
    i += 1;
    const body = String(text[lang]).trim().slice(0, CHARITY_TEXT_MAX);
    const file = join(outDir, `speech-${lang}.mp3`);
    const track = narrationTrackPath(file);
    rmSync(track, { force: true }); // 旧时间轴不能配新音频
    const wanted = opts.voices?.[lang] || '';
    // 没指定具体音色：按所选性别交给 ttsRouter 取默认（设置页的 .env 覆盖优先）；备用 edge-tts 同样按性别
    const falVoice = wanted && !wanted.includes('Neural') ? wanted : undefined;
    const edgeVoice = wanted && wanted.includes('Neural') ? wanted : (male ? EDGE_MALE_VOICES : EDGE_VOICES)[lang];
    const falDefault = (male ? TTS_DEFAULT_MALE_VOICES : FAL_TTS_VOICES)[lang];
    const units = tools ? narrationUnits(body, lang) : [body];
    if (!units.length) continue;
    const unitFile = (k: number): string => (tools ? join(workDir, `${lang}-${String(k + 1).padStart(3, '0')}.mp3`) : file);
    if (tools) mkdirSync(workDir, { recursive: true });

    let quality: CharityTtsQuality = 'standard';
    let voice = edgeVoice;
    let useEdge = !(opts.quality !== 'standard' && deps.fal.tts);
    // 逐句进度：一段二十来句、每句一次网络往返，只报「正在合成 X 语」的话界面看着就是卡住不动
    let done = 0;
    const tick = (msg: string): void => {
      deps.progress('tts', i18nT('{head}（{done}/{total} 句）', { head: msg, done, total: units.length }), i - 1, langs.length);
    };
    if (!useEdge) {
      try {
        tick(i18nT('高保真合成 {lang}（MiniMax speech-02-hd）', { lang: langLabel(lang) }));
        await mapLimit(units, falConcurrency(), async (unit, k) => {
          const r = await falTtsUnit(deps, unit, lang, falVoice, opts.gender, k, opts.registry?.signal);
          writeFileSync(unitFile(k), Buffer.from(r.audioBase64!, 'base64'));
          voice = r.voice || falVoice || falDefault;
          done += 1;
          tick(i18nT('高保真合成 {lang}（MiniMax speech-02-hd）', { lang: langLabel(lang) }));
        }, { signal: opts.registry?.signal, warmup: true });
        quality = 'hd';
      } catch (e) {
        if (opts.registry?.signal.aborted) throw e;
        useEdge = true; // 放弃原因已在 falTtsUnit 里记过日志
      }
    } else if (opts.quality !== 'standard') {
      deps.log.warn('charity-content: 未配置 fal 密钥，语音回落 edge-tts（备用）', { lang });
    }
    if (useEdge) {
      voice = edgeVoice;
      done = 0;
      tick(i18nT('备用标准音质合成 {lang}（edge-tts）', { lang: langLabel(lang) }));
      await mapLimit(units, localProcConcurrency(), async (unit, k) => {
        await edgeTts(deps, unit, edgeVoice, unitFile(k), opts.registry);
        done += 1;
        tick(i18nT('备用标准音质合成 {lang}（edge-tts）', { lang: langLabel(lang) }));
      }, { signal: opts.registry?.signal });
    }

    let durationSec = 0;
    if (tools) {
      // 逐句解码成 WAV 量真实时长 → 拼接（句间停顿写进音频）→ 时间轴与音频同源
      const wavs: string[] = [];
      const measured: Array<{ text: string; durationSec: number }> = [];
      for (const [k, unit] of units.entries()) {
        const wav = unitFile(k).replace(/\.mp3$/, '.wav');
        await decodeToWav(tools, unitFile(k), wav, opts.registry);
        wavs.push(wav);
        measured.push({ text: unit, durationSec: await audioDuration(tools, wav, opts.registry) });
      }
      await concatNarration(tools, wavs, NARRATION_PAUSE_SEC, file, opts.registry);
      const timeline = narrationTimeline(measured, NARRATION_PAUSE_SEC);
      const trackBody: NarrationTrack = { version: 1, lang, pauseSec: NARRATION_PAUSE_SEC, durationSec: timeline.totalSec, cues: timeline.cues };
      writeFileSync(track, JSON.stringify(trackBody, null, 2));
      durationSec = await audioDuration(tools, file, opts.registry);
    }
    out[lang] = { path: file, quality, durationSec: Math.round(durationSec * 10) / 10, voice };
  }
  deps.progress('tts', i18nT('语音合成完成'), langs.length, langs.length);
  return out;
}

/** 读旁白旁的时间轴；文件缺失 / 损坏 / 与音频对不上（字幕会跑出音频之外）→ null，调用方按无时间轴处理 */
export function readNarrationTrack(audioPath: string, audioSec?: number): NarrationTrack | null {
  try {
    const t = parseNarrationTrack(readFileSync(narrationTrackPath(audioPath), 'utf8'));
    if (!t) return null;
    if (audioSec && t.cues[t.cues.length - 1].end > audioSec + 0.05) return null;
    return t;
  } catch { return null; }
}

// ── 4. 短视频 ────────────────────────────────────────────
//
// AI 增强版（默认）：上传照片 → fal 图生视频逐个出镜头 → 剪辑串联 → 配乐 → 多语合成。
//   · 单镜头失败自动重试一次，仍失败用该照片的本地推拉（Ken Burns）镜头顶上，不整体失败
//   · 没 key / 额度 / 余额 / 密钥无效 / 连续失败 → 不再调 fal；一个 AI 镜头都没有就整体改成素材剪辑版并标原因
//   · 镜头与配乐只生成一次、三语共用（各语言只换字幕与配音）；同一次运行里重新生成会复用已出的镜头 / 配乐，不重复计费
//   · Stable Audio 配乐与镜头并行提交（它常要排队几分钟），配乐失败回落本地配乐库

/** 一个 AI 动态镜头的时长（与 i2v / t2v 请求里的 duration 一致） */
export const AI_SHOT_SEC = 5;
/**
 * 动态镜头数量的硬上限。
 *
 * 数量本身**按成片时长算**（见 shotsNeeded）：旁白 90 秒就该有 90 秒的画面，
 * 而不是出 15 秒然后循环六遍（用户实拍反馈「视频时长不够，一直在循环」，根因就是
 * 这里以前写死 3 个镜头 = 15 秒）。上限只是防止一段超长旁白把 fal 账单拉爆，
 * 到顶之后剩下的时长由照片推拉镜头铺满 —— 照片拉长是连续运镜，不会有重复感。
 */
export const AI_SHOT_MAX = 24;
/** 兼容旧引用：语义是「一次最多几个镜头」 */
export const AI_SHOT_LIMIT = AI_SHOT_MAX;

/** 铺满 targetSec 需要几个镜头（每个 AI_SHOT_SEC 秒），夹在 1..AI_SHOT_MAX */
export function shotsNeeded(targetSec: number): number {
  return Math.max(1, Math.min(AI_SHOT_MAX, Math.ceil((targetSec || 0) / AI_SHOT_SEC)));
}

/**
 * 文章转语音线的画面来源：文稿 → 动态镜头（t2v，MiniMax H3 Max）。
 *
 * 这条线没有现场照片，画面按文稿直接生成。走文生视频而不是「先出静帧再图生视频」：
 * 少一次生成与排队，镜头也更连贯。产出的 mp4 当"素材"交回去，后半段（本地剪辑 / 配音 /
 * 烧字幕）与活动记录线完全复用，不为这条线另起一套出片逻辑。
 *
 * 没有 fal（没配 key / 额度用尽）不让整步失败：退成纯色底帧，配音与字幕照常烧进去，
 * 成片素净但确实能看、能存档 —— 比直接报「没有可用于成片的图片或视频」有用得多。
 */
async function stillsFromScript(
  deps: PipelineDeps, req: VideoBuildRequest, langs: CharityLang[], workDir: string, shotPrompt: string, targetSec: number, registry?: ProcRegistry,
): Promise<string[]> {
  const dir = join(workDir, 'script-stills');
  mkdirSync(dir, { recursive: true });
  // 取一门语言的字幕句子当画面线索（字幕即旁白原文）；都空就退回活动档案里的名字与简介
  const lead = langs.find((l) => (req.captions?.[l] || []).length) || langs[0];
  const lines = (req.captions?.[lead] || []).filter(Boolean);
  const fallbackLines = [req.archive.eventName[lead], req.archive.summary[lead], req.archive.orgName[lead]].filter(Boolean) as string[];
  const pool = lines.length ? lines : fallbackLines;
  // 需要几个镜头由成片时长决定；句子不够就轮着用 —— 同一句配不同镜头提示词，出来的画面也不同，
  // 总好过只出三段然后把它们循环播放
  const wanted = shotsNeeded(targetSec);
  const source = Array.from({ length: wanted }, (_, i) => pool[i % Math.max(1, pool.length)] || '');

  const out: string[] = [];
  if (deps.fal.run) {
    for (let i = 0; i < wanted; i += 1) {
      if (registry?.signal?.aborted) break;
      const hint = source[i] || source[0] || '';
      try {
        const r = await deps.fal.run(t2vRequest(`${shotPrompt}\n${hint}`.slice(0, 1500), dir), registry?.signal);
        const file = r.files.find(Boolean);
        if (file && existsSync(file)) { out.push(file); continue; }
        deps.log.warn('charity-content: 文稿镜头返回里没有文件', { index: i });
      } catch (e) {
        if (registry?.signal?.aborted) throw e;
        deps.log.warn('charity-content: 文稿镜头生成失败，改用纯色底', { index: i, message: shortFalError(e) });
        break; // 一张都出不来多半是 key / 额度问题，别把剩下的再试一遍白等
      }
    }
  }
  if (out.length) return out;

  // 纯色底兜底：ffmpeg 画一帧深色背景，后面照常叠字幕与配音
  const tools = deps.tools;
  const solid = join(dir, 'solid.png');
  if (tools?.ffmpeg) {
    try {
      await runProc(tools.ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x101C2E:s=1080x1920', '-frames:v', '1', solid], { env: tools.env, timeoutMs: 30_000, registry });
      if (existsSync(solid)) return [solid];
    } catch (e) {
      deps.log.warn('charity-content: 纯色底帧生成失败', { message: String((e as Error)?.message || e) });
    }
  }
  return [];
}


/** 连续几个镜头（各自重试后）仍失败就停用 fal，剩下的全用本地镜头 */
export const AI_BREAKER_AFTER = 2;
export const AI_PLAN: CharityVideoPhase[] = ['upload', 'shots', 'edit', 'music', 'compose'];
export const CLIP_PLAN: CharityVideoPhase[] = ['edit', 'music', 'compose'];

type Report = (phase: CharityVideoPhase, msg: string, done: number, total: number) => void;

interface AiCache { shots: Record<string, string>; music: Record<string, string> }
function aiCachePath(workDir: string): string { return join(workDir, 'ai-cache.json'); }
function readAiCache(workDir: string): AiCache {
  try {
    const c = JSON.parse(readFileSync(aiCachePath(workDir), 'utf8'));
    return { shots: c?.shots && typeof c.shots === 'object' ? c.shots : {}, music: c?.music && typeof c.music === 'object' ? c.music : {} };
  } catch { return { shots: {}, music: {} }; }
}
/** 读-改-写一次做完（同步）：镜头与后台配乐各自落盘，不能拿旧快照互相覆盖 */
function updateAiCache(workDir: string, mutate: (c: AiCache) => void): void {
  const c = readAiCache(workDir);
  mutate(c);
  try { writeFileSync(aiCachePath(workDir), JSON.stringify(c, null, 2)); } catch { /* 缓存写失败只是下次不复用 */ }
}
/** 缓存键：照片（路径 + 大小 + 修改时间）+ 提示词。改了视频 / 内容提示词再生成就是新镜头；用默认镜头 prompt 时键与旧版一致 */
function shotKey(photo: string, prompt = BASE_SHOT_PROMPT): string {
  const tag = prompt === BASE_SHOT_PROMPT ? '' : `|p:${createHash('sha1').update(prompt).digest('hex').slice(0, 10)}`;
  try { const st = statSync(photo); return `${photo}|${st.size}|${Math.round(st.mtimeMs)}${tag}`; } catch { return `${photo}${tag}`; }
}
export { shotKey as aiShotCacheKey };

export function queueText(p: FalJobProgress): string {
  if (p.status === 'IN_QUEUE') return p.queuePosition != null ? i18nT('排队中（第 {n} 位）', { n: p.queuePosition + 1 }) : i18nT('排队中');
  if (p.status === 'IN_PROGRESS') return i18nT('生成中 {s} 秒', { s: Math.round(p.elapsedMs / 1000) });
  if (p.status === 'COMPLETED') return i18nT('下载结果…');
  return String(p.status || '');
}

interface AiShotsOutcome {
  shots: CharityAiShot[];
  /** shots[i] 成功时的本地镜头 */
  clips: Array<{ path: string; durationSec: number } | null>;
  estUsd: number;
  /** 停用 fal 的原因（致命错误或连续失败）；没停用为空 */
  stopReason: string;
  lastError: string;
}

/** 上传 + 逐镜头生成（带重试 / 熔断 / 同次复用）。取消时直接抛出，其余失败都折成「该镜头用本地推拉」 */
export async function generateAiShots(
  deps: PipelineDeps, photos: string[], workDir: string, report: Report, registry?: ProcRegistry, shotPrompt = BASE_SHOT_PROMPT,
): Promise<AiShotsOutcome> {
  const tools = deps.tools!;
  const run = deps.fal.run!;
  const signal = registry?.signal;
  const cache = readAiCache(workDir);
  const n = photos.length;
  const out: AiShotsOutcome = { shots: [], clips: photos.map(() => null), estUsd: 0, stopReason: '', lastError: '' };
  const cachedClip = (photo: string): string | null => { const f = cache.shots[shotKey(photo, shotPrompt)]; return f && existsSync(f) ? f : null; };
  const aborted = (): boolean => !!signal?.aborted;

  // ① 上传（已有镜头的照片不用传）
  const urls: Array<string | null> = photos.map(() => null);
  const uploadErr: string[] = photos.map(() => '');
  const toUpload = photos.map((p, i) => ({ p, i })).filter(({ p }) => !cachedClip(p));
  let u = 0;
  // 上传互不依赖，并发派发；stop 让「没 key / 额度用尽」这类致命原因一出现就别再派新的
  await mapLimit(toUpload, falConcurrency(), async ({ p, i }) => {
    if (!deps.fal.upload) { urls[i] = p; return; } // 没有单独上传通道：本地路径交给生成请求自己传
    for (let attempt = 1; attempt <= 2 && !urls[i]; attempt += 1) {
      try {
        urls[i] = await deps.fal.upload(p, signal);
      } catch (e) {
        if (aborted()) throw e;
        const fatal = falFatalReason(e);
        uploadErr[i] = shortFalError(e);
        out.lastError = uploadErr[i];
        deps.log.warn('charity-content: fal 上传失败', { photo: basename(p), attempt, message: uploadErr[i] });
        if (fatal) { out.stopReason = fatal; break; }
        if (attempt === 1) report('upload', i18nT('第 {n} 张照片上传失败，自动重试一次…', { n: i + 1 }), u, toUpload.length);
      }
    }
    u += 1;
    report('upload', i18nT('上传第 {n}/{m} 张照片到 fal…', { n: u, m: toUpload.length }), u, toUpload.length);
  }, { signal, stopOnError: false, stop: () => !!out.stopReason, warmup: true });
  const upTotal = Math.max(1, toUpload.length);
  report('upload', out.stopReason ? i18nT('fal 不可用：{why}', { why: out.stopReason }) : i18nT('素材已就绪'), upTotal, upTotal);

  // ② 逐镜头生成。i2v 常在 fal 队列里等几分钟，串行做十个镜头就是小半小时 —— 并发派发。
  //
  // 熔断口径跟着改了：原来数的是「连续失败」，并发下先后顺序没意义，改成数**累计失败数**，
  // 到 AI_BREAKER_AFTER 就不再派新镜头（已在途的跑完，撤不回来）。意图不变：别在一个已经
  // 不可用的服务上接着烧钱等排队。
  const shots = new Array<CharityAiShot | null>(n).fill(null);
  let failures = 0;
  let finished = 0;
  await mapLimit(photos, falConcurrency(), async (photo, i) => {
    const shot: CharityAiShot = { index: i + 1, photo, source: 'kenburns', attempts: 0 };
    shots[i] = shot;
    const reused = cachedClip(photo);
    if (reused) {
      const info = await probeMedia(tools, reused, registry);
      out.clips[i] = { path: reused, durationSec: info?.durationSec || 5 };
      Object.assign(shot, { source: 'fal', reused: true });
      finished += 1;
      report('shots', i18nT('第 {n}/{m} 个动态镜头：复用本次已生成的镜头（不重复计费）', { n: i + 1, m: n }), finished, n);
      return;
    }
    if (out.stopReason) {
      shot.reason = out.stopReason;
    } else if (!urls[i]) {
      shot.reason = i18nT('上传失败：{why}', { why: uploadErr[i] || i18nT('未知错误') });
    } else {
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        shot.attempts = attempt;
        const head = attempt === 1 ? i18nT('第 {n}/{m} 个动态镜头', { n: i + 1, m: n }) : i18nT('第 {n}/{m} 个动态镜头（重试）', { n: i + 1, m: n });
        report('shots', i18nT('{head}：提交 fal 图生视频…', { head }), finished, n);
        try {
          const r = await run(i2vRequest(urls[i]!, workDir, shotPrompt), signal, (p) => report('shots', i18nT('{head}：{status}', { head, status: queueText(p) }), finished, n));
          out.estUsd += r.estUsd || 0;
          const file = r.files.find(Boolean);
          if (!file) throw new Error(i18nT('fal 返回里没有媒体文件'));
          const info = await probeMedia(tools, file, registry);
          if (!info?.durationSec) throw new Error(i18nT('镜头文件无法解析'));
          out.clips[i] = { path: file, durationSec: info.durationSec };
          shot.source = 'fal';
          updateAiCache(workDir, (c) => { c.shots[shotKey(photo, shotPrompt)] = file; });
          break;
        } catch (e) {
          if (aborted()) throw e;
          const fatal = falFatalReason(e);
          shot.reason = fatal || shortFalError(e);
          out.lastError = shot.reason;
          deps.log.warn('charity-content: fal 图生视频失败', { shot: i + 1, attempt, message: String((e as any)?.message || e).slice(0, 300) });
          if (fatal) { out.stopReason = fatal; break; }
          if (attempt === 1) report('shots', i18nT('第 {n}/{m} 个镜头失败，自动重试一次…', { n: i + 1 , m: n }), finished, n);
        }
      }
    }
    finished += 1;
    if (shot.source === 'fal') {
      delete shot.reason;
      report('shots', i18nT('第 {n}/{m} 个动态镜头已生成', { n: i + 1, m: n }), finished, n);
    } else {
      if (shot.attempts) failures += 1;
      if (!out.stopReason && failures >= AI_BREAKER_AFTER) out.stopReason = i18nT('fal 图生视频已有 {n} 个镜头失败', { n: failures });
      report('shots', i18nT('第 {n}/{m} 个镜头改用本地推拉镜头（{why}）', { n: i + 1, m: n, why: shot.reason || '' }), finished, n);
    }
  }, { signal, stopOnError: false, stop: () => !!out.stopReason, warmup: true });

  // 没派出去的镜头（闸门拉下后跳过的）也要有记录，否则界面的镜头清单会缺号
  for (let i = 0; i < n; i += 1) {
    if (!shots[i]) shots[i] = { index: i + 1, photo: photos[i], source: 'kenburns', attempts: 0, reason: out.stopReason || i18nT('未知错误') };
  }
  out.shots = shots as CharityAiShot[];
  return out;
}

interface MusicJob {
  promise: Promise<{ file: string | null; estUsd: number; reused: boolean; error?: string }>;
  latest: FalJobProgress | null;
  onUpdate: ((p: FalJobProgress) => void) | null;
}

/** 提交 Stable Audio（立刻返回，不等结果）；同次运行同情绪同时长复用 */
function startFalMusic(deps: PipelineDeps, mood: string, durationSec: number, workDir: string, signal?: AbortSignal, prompt?: string): MusicJob {
  const req = musicRequest(mood, durationSec, workDir, prompt);
  const key = `${mood}|${req.duration}${prompt && prompt !== musicPrompt(mood) ? `|p:${createHash('sha1').update(prompt).digest('hex').slice(0, 10)}` : ''}`;
  const cache = readAiCache(workDir);
  const job: MusicJob = { latest: null, onUpdate: null, promise: Promise.resolve({ file: null, estUsd: 0, reused: false }) };
  const hit = cache.music[key];
  if (hit && existsSync(hit)) { job.promise = Promise.resolve({ file: hit, estUsd: 0, reused: true }); return job; }
  job.promise = deps.fal.run!(req, signal, (p) => { job.latest = p; job.onUpdate?.(p); })
    .then((r) => {
      const file = r.files.find(Boolean) || null;
      if (file) updateAiCache(workDir, (c) => { c.music[key] = file; });
      return { file, estUsd: r.estUsd || 0, reused: false, error: file ? undefined : i18nT('fal 返回里没有媒体文件') };
    })
    .catch((e) => ({ file: null, estUsd: 0, reused: false, error: signal?.aborted ? i18nT('已取消') : (falFatalReason(e) || shortFalError(e)) }));
  return job;
}

/** 本地配乐：素材库（fetch_bgm.py：本地曲库 / 可选 Pixabay）→ 程序合成 → 无 */
async function localBgm(deps: PipelineDeps, mood: string, durationSec: number, workDir: string, registry?: ProcRegistry): Promise<{ file: string | null; source: 'library' | 'synth' | 'none' }> {
  const tools = deps.tools!;
  if (!tools.python) return { file: null, source: 'none' };
  const fetched = join(workDir, 'bgm.mp3');
  const f = await runProc(tools.python, [join(tools.scriptsDir, 'fetch_bgm.py'), '--mood', mood || 'warm', '--duration', String(Math.ceil(durationSec)), '--output', fetched], { env: tools.env, timeoutMs: 120_000, registry });
  if (f.code === 0 && existsSync(fetched)) return { file: fetched, source: 'library' };
  const generated = join(workDir, 'bgm.wav');
  const g = await runProc(tools.python, [join(tools.scriptsDir, 'generate_bgm.py'), '--style', 'emotional', '--duration', String(Math.ceil(durationSec)), '--output', generated], { env: tools.env, timeoutMs: 120_000, registry });
  if (g.code === 0 && existsSync(generated)) return { file: generated, source: 'synth' };
  deps.log.warn('charity-content: 配乐准备失败，成片无配乐', { fetch: f.stderr.slice(-200), gen: g.stderr.slice(-200) });
  return { file: null, source: 'none' };
}

export interface VideoBuildRequest {
  items: string[];
  mode: CharityVideoMode;
  langs: CharityLang[];
  archive: CharityArchive;
  captions: Partial<Record<CharityLang, string[]>>;
  narration?: Partial<CharityTri>;
  bgmMood?: string;
  /** 第 1 步内容提示词（讲什么） */
  contentPrompt?: string;
  /** 第 4 步视频提示词（怎么拍） */
  videoPrompt?: string;
  /** 画面来源：缺省用上传素材；'ai-text' = 文章转语音线，按文稿生成画面 */
  visuals?: 'materials' | 'ai-text';
}

export interface VideoBuildResult {
  items: Partial<Record<CharityLang, CharityVideoItem>>;
  /** 实际成片方式（请求 ai 但 fal 不可用 / 全部镜头失败时为 clip） */
  mode: CharityVideoMode;
  /** 请求 ai 时的镜头 / 配乐去向与费用 */
  ai?: CharityVideoAiReport;
  /** 本次实际使用的提示词 */
  prompts: CharityEffectivePrompts;
}

interface CondensedPrompts { content: string[]; style: string[]; music: string[]; ending: string }

/**
 * 长提示词浓缩：合计不超过 CONDENSE_OVER 返回 null（直接按短语合并）；超过则调一次文本模型分类压成要点，
 * 结果按两段原文的哈希缓存在 .work-video/prompt-condense.json（同一次运行重出片、三语共用都不再调）。
 * 模型不可用 / 回复解析不了 → null，退回按短语装到上限的确定性合并（仍受长度上限约束）。
 */
export async function condensePrompts(deps: PipelineDeps, contentPrompt: string, videoPrompt: string, workDir: string, signal?: AbortSignal): Promise<CondensedPrompts | null> {
  if (!needsCondense(contentPrompt, videoPrompt)) return null;
  const key = createHash('sha1').update(`${contentPrompt}\u0000${videoPrompt}`).digest('hex');
  const file = join(workDir, 'prompt-condense.json');
  let cache: Record<string, CondensedPrompts> = {};
  try { cache = JSON.parse(readFileSync(file, 'utf8')) || {}; } catch { cache = {}; }
  if (cache[key]) return cache[key];
  const list = (v: unknown, n: number): string[] => (Array.isArray(v) ? v.map((x) => String(x ?? '').trim()).filter(Boolean).slice(0, n).map((x) => x.slice(0, 80)) : []);
  try {
    const text = await deps.text(condensePromptsRequest(contentPrompt, videoPrompt), { jsonObject: true, signal, timeoutMs: 90_000 });
    const obj = extractJsonObject(text);
    const out: CondensedPrompts = { content: list(obj?.content, 6), style: list(obj?.style, 6), music: list(obj?.music, 3), ending: typeof obj?.ending === 'string' ? obj.ending.trim() : '' };
    if (!out.content.length && !out.style.length) throw new Error('empty');
    cache[key] = out;
    try { mkdirSync(workDir, { recursive: true }); writeFileSync(file, JSON.stringify(cache, null, 2)); } catch { /* 缓存写不了只是下次再浓缩 */ }
    return out;
  } catch (e: any) {
    if (signal?.aborted) throw e;
    deps.log.warn('charity-content: 长提示词浓缩失败，改为按短语截取', { message: String(e?.message || e).slice(0, 200) });
    return null;
  }
}

export async function buildVideos(deps: PipelineDeps, req: VideoBuildRequest, outDir: string, registry?: ProcRegistry): Promise<VideoBuildResult> {
  const tools = deps.tools;
  if (!tools) throw new Error(i18nT('未找到 ffmpeg，无法合成视频'));
  const workDir = join(outDir, '.work-video');
  mkdirSync(workDir, { recursive: true });
  const langs = req.langs.length ? req.langs : LANGS;
  const mood = req.bgmMood || 'warm';
  // 两个提示词合并：内容（讲什么）+ 视频（怎么拍）→ 镜头 / 配乐 prompt、剪辑节奏与转场、片尾标语；都空 = 与原来一致。
  // 合计很长时先用文本模型浓缩成要点（本次运行缓存，不按镜头重复），再按 fal 模型上限截断
  const condensed = await condensePrompts(deps, req.contentPrompt || '', req.videoPrompt || '', workDir, registry?.signal);
  const merged = condensed ? composeMerged(condensed.content, condensed.style, condensed.music, mood) : mergeShotPrompt(req.contentPrompt || '', req.videoPrompt || '', mood);
  const clipStyle = clipStyleFromPrompt(req.videoPrompt || '');
  const ending = endSloganFromPrompt(req.videoPrompt || '');
  if (ending.wanted && !ending.text && condensed?.ending) ending.text = condensed.ending.slice(0, 60);
  const endSlogan: Partial<CharityTri> = {};
  if (ending.wanted) for (const l of langs) endSlogan[l] = ending.text || req.archive.eventName[l] || req.archive.orgName[l];
  const tailSec = ending.wanted ? END_CARD_SEC + 0.5 : NARRATION_TAIL_SEC;

  // 三语各自一条时间轴：成片时长 = 该语言旁白总长 + 片尾留白（没有旁白 = 30s）；字幕 = 旁白原文逐句 + 真实时长
  const perLang = new Map<CharityLang, { narration: string | null; durationSec: number; cues: CaptionCue[] | null }>();
  for (const lang of langs) {
    const n = req.narration?.[lang];
    const narration = n && existsSync(n) ? n : null;
    const narrationSec = narration ? await audioDuration(tools, narration, registry) : 0;
    const track = narration ? readNarrationTrack(narration, narrationSec) : null;
    if (narration && !track) deps.log.warn('charity-content: 旁白没有逐句时间轴，字幕改用报告短句均匀铺开', { lang });
    perLang.set(lang, { narration, durationSec: videoDurationFor(narrationSec, tailSec), cues: track ? track.cues : null });
  }
  const plannedSec = Math.max(...[...perLang.values()].map((v) => v.durationSec));

  // 素材清单（探测时长）
  const materials: Array<{ path: string; kind: 'image' | 'video'; durationSec?: number }> = [];
  for (const p of req.items) {
    if (!existsSync(p)) continue;
    const kind = kindOf(p);
    if (kind === 'image') materials.push({ path: p, kind });
    else if (kind === 'video') { const info = await probeMedia(tools, p, registry); if (info?.durationSec) materials.push({ path: p, kind, durationSec: info.durationSec }); }
  }
  // 文章转语音线没有现场素材：按文稿生成静帧当画面（后半段出片链完全复用）
  if (!materials.length && req.visuals === 'ai-text') {
    // t2v 出的是 mp4、纯色兜底出的是 png —— 按实际扩展名登记 kind，视频还要探时长，
    // 否则后半段会把 mp4 当静图处理（时长算不出、剪辑取不到帧）
    for (const f of await stillsFromScript(deps, req, langs, workDir, merged.shot, plannedSec, registry)) {
      const kind = kindOf(f);
      if (kind === 'video') {
        const info = await probeMedia(tools, f, registry);
        if (info?.durationSec) materials.push({ path: f, kind, durationSec: info.durationSec });
      } else if (kind === 'image') materials.push({ path: f, kind });
    }
  }
  if (!materials.length) throw new Error(i18nT('没有可用于成片的图片或视频'));

  // 事先就能判定走不了 AI 的（没照片 / 没 key）：直接按剪辑版的阶段计划跑，进度条不出现空转的上传 / 镜头段
  // 照片取到「铺满成片所需的镜头数」为止，而不是固定前几张 —— 以前写死 3 张，用户传 7 张有 4 张白传。
  // 照片比需要的多就只做前面那些动态镜头，剩下的照片仍会以推拉镜头出现在剪辑里，一张都不浪费。
  const photos = materials.filter((m) => m.kind === 'image').slice(0, shotsNeeded(plannedSec)).map((m) => m.path);
  let mode: CharityVideoMode = req.mode;
  const ai: CharityVideoAiReport | undefined = req.mode === 'ai' ? { shots: [], music: { source: 'none' }, estUsd: 0 } : undefined;
  if (ai && !photos.length) ai.fallbackReason = i18nT('素材里没有照片');
  else if (ai && !deps.fal.run) ai.fallbackReason = i18nT('未配置 fal 密钥');
  if (ai?.fallbackReason) mode = 'clip';
  const plan = mode === 'ai' ? AI_PLAN : CLIP_PLAN;
  const report: Report = (phase, msg, done, total) => deps.progress('video', msg, done, total, { phase, plan });
  if (ai?.fallbackReason) {
    deps.log.warn('charity-content: AI 增强版不可用，改用素材剪辑版', { reason: ai.fallbackReason });
    report(plan[0], i18nT('AI 增强版不可用（{why}），已改用素材剪辑版', { why: ai.fallbackReason }), 0, 1);
  }

  let sources: Array<{ path: string; kind: 'image' | 'video'; durationSec?: number }> = materials;
  let music: MusicJob | null = null;
  if (mode === 'ai' && ai) {
    // 配乐与镜头并行：Stable Audio 常排队几分钟，边出镜头边等
    music = startFalMusic(deps, mood, plannedSec, workDir, registry?.signal, merged.music);
    const shots = await generateAiShots(deps, photos, workDir, report, registry, merged.shot);
    ai.shots = shots.shots;
    ai.estUsd += shots.estUsd;
    if (shots.clips.some(Boolean)) {
      const shotSources = photos.map((p, i) => { const c = shots.clips[i]; return c ? { path: c.path, kind: 'video' as const, durationSec: c.durationSec } : { path: p, kind: 'image' as const }; });
      sources = [...shotSources, ...materials.filter((m) => m.kind === 'video')];
    } else {
      mode = 'clip';
      ai.fallbackReason = shots.stopReason || i18nT('fal 图生视频失败：{why}', { why: shots.lastError || i18nT('未知错误') });
      report('shots', i18nT('没有生成出 AI 镜头（{why}），已改用素材剪辑版', { why: ai.fallbackReason }), photos.length, photos.length);
    }
  }

  // 剪辑：每种成片时长排一条画面轨（时长相同的语言共用），逐段统一成 1080×1920 → 串联
  const durations = [...new Set([...perLang.values()].map((v) => v.durationSec))].sort((a, b) => a - b);
  const plans = durations.map((d) => ({ d, ...planTimeline(sources, d) }));
  const segTotal = plans.reduce((a, p) => a + p.segments.length, 0);
  const bases = new Map<number, { path: string; durationSec: number }>();
  let segDone = 0;
  for (const [b, plan] of plans.entries()) {
    const tag = plans.length > 1 ? `${b + 1}-` : '';
    const clips: string[] = [];
    for (let i = 0; i < plan.segments.length; i += 1) {
      const s = plan.segments[i];
      report('edit', s.kind === 'image' ? i18nT('照片推拉镜头 {n}/{m}…', { n: segDone + 1, m: segTotal }) : i18nT('视频片段转码 {n}/{m}…', { n: segDone + 1, m: segTotal }), segDone, segTotal);
      const out = join(workDir, `seg-${tag}${String(i + 1).padStart(2, '0')}.mp4`);
      if (s.kind === 'image') await imageClip(tools, s.src, out, s.durationSec, i, registry, clipStyle);
      else await normalizeClip(tools, s.src, out, s.durationSec, s.offsetSec || 0, registry, clipStyle);
      clips.push(out);
      segDone += 1;
    }
    report('edit', i18nT('串联 {n} 段画面…', { n: clips.length }), segDone, segTotal);
    const base = join(workDir, `base${tag ? `-${b + 1}` : ''}.mp4`);
    await concatClips(tools, clips, join(workDir, `concat${tag ? `-${b + 1}` : ''}.txt`), base, registry);
    const baseInfo = await probeMedia(tools, base, registry);
    bases.set(plan.d, { path: base, durationSec: baseInfo?.durationSec || plan.totalSec });
  }
  const duration = Math.max(...[...bases.values()].map((v) => v.durationSec));

  // 配乐：fal 那条已在后台跑，这里等结果；失败 / 没跑 → 本地配乐库
  let bgm: string | null = null;
  if (music) {
    const show = (p: FalJobProgress | null): void => report('music', p ? i18nT('Stable Audio 配乐：{status}', { status: queueText(p) }) : i18nT('等待 Stable Audio 配乐…'), 0, 1);
    show(music.latest);
    music.onUpdate = show;
    const r = await music.promise;
    music.onUpdate = null;
    if (registry?.signal.aborted) throw new Error(i18nT('已取消'));
    if (ai) ai.estUsd += r.estUsd;
    if (r.file) { bgm = r.file; if (ai) ai.music = { source: 'fal', reused: r.reused || undefined }; }
    else {
      deps.log.warn('charity-content: fal 配乐失败，回落本地配乐库', { message: r.error });
      report('music', i18nT('Stable Audio 配乐失败（{why}），改用本地配乐库…', { why: r.error || '' }), 0, 1);
      const local = await localBgm(deps, mood, duration, workDir, registry);
      bgm = local.file;
      if (ai) ai.music = { source: local.source, reason: r.error };
    }
  } else {
    report('music', i18nT('准备本地配乐…'), 0, 1);
    const local = await localBgm(deps, mood, duration, workDir, registry);
    bgm = local.file;
    if (ai) ai.music = { source: local.source, reason: ai.fallbackReason };
  }
  report('music', bgm ? i18nT('配乐就绪') : i18nT('配乐不可用，成片只有配音'), 1, 1);
  const fonts = prepareSubtitleFonts(workDir);

  // 多语合成：同一条画面 + 同一段配乐，各语言只换字幕与配音
  const out: Partial<Record<CharityLang, CharityVideoItem>> = {};
  for (const [k, lang] of langs.entries()) {
    report('compose', i18nT('合成 {lang} 版：字幕 + 配音 + 配乐（{k}/{n}）', { lang: langLabel(lang), k: k + 1, n: langs.length }), k, langs.length);
    const L = perLang.get(lang)!;
    const base = bases.get(L.durationSec)!;
    const langSec = Math.min(L.durationSec, base.durationSec);
    // 有逐句时间轴：字幕就是旁白原文、按真实语音起止；否则（无旁白 / 旧旁白）报告短句均匀铺开
    const cues = L.cues ? displayCues(L.cues, lang) : planCaptions(req.captions[lang] || [], langSec);
    const ass = join(workDir, `captions-${lang}.ass`);
    const endCard = endSlogan[lang] ? { start: Math.max(0, langSec - END_CARD_SEC), end: langSec, title: req.archive.orgName[lang], line: endSlogan[lang]! } : undefined;
    writeFileSync(ass, buildAss(cues, lang, { width: 1080, height: 1920, fontName: fonts.nameFor[lang], title: req.archive.orgName[lang], durationSec: langSec, endCard }));
    writeFileSync(join(workDir, `captions-${lang}.srt`), buildSrt(cues));
    const subbed = join(workDir, `subbed-${lang}.mp4`);
    await burnAss(tools, base.path, ass, fonts.dir, subbed, registry);
    const mixed = join(workDir, `mixed-${lang}.mp4`);
    await mixAudio(tools, subbed, mixed, L.narration, bgm, langSec, registry);
    const final = join(outDir, `video-${lang}${mode === 'ai' ? '-ai' : ''}.mp4`);
    await fadeOut(tools, mixed, final, langSec, registry);
    const info = await probeMedia(tools, final, registry);
    out[lang] = { path: final, srcUrl: '', durationSec: Math.round((info?.durationSec || langSec) * 10) / 10, size: fileSize(final), mode };
  }
  report('compose', i18nT('成片完成'), langs.length, langs.length);
  if (ai) ai.estUsd = Math.round(ai.estUsd * 10000) / 10000;
  const prompts: CharityEffectivePrompts = { shot: merged.shot, music: merged.music, contentPoints: merged.contentPoints, stylePoints: merged.stylePoints, clipStyle, endSlogan, ...(condensed ? { condensed: true } : {}) };
  return { items: out, mode, ai, prompts };
}

/** 报告摘要按语言取出（语音 / 字幕默认来源） */
export function summaryOf(report: CharityReport): CharityTri {
  return tri(report.zh.summary, report.en.summary, report.ar.summary);
}
export function captionsOf(report: CharityReport): Record<CharityLang, string[]> {
  return { zh: report.zh.captions, en: report.en.captions, ar: report.ar.captions };
}

export function contentDefaults(c: Partial<CharityReportContent>): CharityReportContent {
  return { title: c.title || '', overview: c.overview || '', highlights: c.highlights || [], scene: c.scene || '', thanks: c.thanks || '', summary: c.summary || c.overview || '', captions: c.captions || [] };
}

