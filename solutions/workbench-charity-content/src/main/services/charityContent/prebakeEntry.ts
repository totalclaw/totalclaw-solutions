/**
 * 慈善活动内容工场 · 预置成品生成入口（开发期一次性工具，`node scripts/charity-prebake.mjs` 经 esbuild 打包后由 electron 运行）。
 *
 * 用真实链路把三语 PDF / 海报 / 语音 / 视频各生成一遍，拷进 resources/bundled-solutions/charity-content/prebaked/。
 *   · 文本模型：直连 agent config.yaml 的默认 OpenAI 兼容端点（与 qiyeApiBridge 直连路径同口径）
 *   · 视觉模型：同上；模型不支持读图（返回空）时用 prebaked/descriptions.json（人工核对过的画面描述）
 *   · 语音：fal MiniMax hd（有 FAL_KEY 时）→ edge-tts；视频：本地 ffmpeg 剪辑版；AI 版仅在有 FAL_KEY 时额外产出
 * 密钥：与桌面端同一套——把 userData 指到 app 的目录、激活 --agent-home 所在账号，读账号加密库里的 media.FAL_KEY；
 * fal 调用经 runFalJob（用量写账号的 media/fal-usage.jsonl）、语音经 ttsRouter、看图经 any-llm/vision。
 * 参数：[--material <素材目录>] --agent-home <userData>/accounts/<key>/totalclaw-agent [--out <prebaked 目录>] [--ai]
 *       --material 缺省 = 随包演示素材（bundled-solutions/charity-content/demo-materials），先复制到
 *       <文稿>/TotalClaw/慈善演示素材/ 再跑——产物不能写进仓库 resources（会被打进安装包）
 *       [--report-only]：只重生成报告 JSON + 三语 PDF/首页截图 + 海报（用 demo-archive.json 与 prebaked/descriptions.json，不碰 fal，不花钱）
 *       [--video-only [--ai --ai-cache <ai-cache.json>]]：只重做语音（逐句 TTS + 时间轴）与视频，报告沿用 prebaked/report.json。
 *       AI 版的镜头 / 配乐必须由 --ai-cache 指到已生成的文件（格式同 .work-video/ai-cache.json）；
 *       本模式禁止任何新的 fal 生成 / 上传调用（图生视频、配乐、看图），缓存没命中的镜头会回退本地推拉而不是花钱
 *       [--video-only --ai --regen-ai]：按两段默认提示词合并出的镜头 / 配乐提示词**重新**图生视频与配乐（会花钱，约 1 美元）；
 *       只放行图生视频、配乐与其上传，看图等其它 fal 调用仍拒绝；不需要 --ai-cache
 */
const AGENT_HOME_ARG = (() => { const i = process.argv.indexOf('--agent-home'); return i >= 0 ? process.argv[i + 1] || '' : ''; })();
// userData 必须在 ready 前设：<userData>/accounts/<key>/totalclaw-agent → 上溯三级
if (AGENT_HOME_ARG && basename(dirname(dirname(AGENT_HOME_ARG))) === 'accounts') {
  app.setPath('userData', dirname(dirname(dirname(AGENT_HOME_ARG))));
}
import { app } from 'electron';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import { readAgentEnv } from '../mediaModelConfig';
import { accountPath, deviceRoot, setActiveAccountKey } from '../accountScope';
import { ConnectorSecretStore } from '../connectors/secrets';
import { setMediaSecretStore } from '../mediaSecrets';
import { configureTtsRouter } from '../media/ttsRouter';
import { readFalUsage, resolveFalKeySlots } from '../media/falProvider';
import { falQuotaFile, falUsageFile, ttsCacheDir } from '../../ipc/mediaFal.ipc';
import { qiyeApiBridge } from '../qiyeApiBridge';
import { createCharityRuntime } from './runtime';
import { resolveAgentPython } from '../agentPython';
import { ffmpegSpawnEnv, resolveFfmpegPair } from '../ffmpegPath';
import { LANGS, normalizeArchive } from './archive';
import { kindOf } from './media';
import { type PipelineDeps, analyzeMaterials, buildVideos, composeReport, draftArchive, listMaterialFiles, makeRunId, outDirFor, renderOutputs, synthesizeSpeech } from './pipeline';
import { loadPrebaked, mapPrebakedDescriptions } from './prebaked';
import { narrationTrackPath } from './subtitles';
import { createHash } from 'node:crypto';
import { DEFAULT_CONTENT_PROMPT, DEFAULT_VIDEO_PROMPT } from '../../../shared/charityPrompts';
import { demoMaterialsSourceDir, demoMaterialsTargetDir, prepareDemoMaterials } from './demoMaterials';
import { audioToDataUrl, imageToDataUrl, renderHtmlToImage, renderHtmlToPdf } from './render';

/**
 * --ai-cache 里的镜头 / 配乐是按原默认 prompt 生成的（键不带提示词哈希）；按本次合并后的提示词再挂一份键，
 * 让 AI 版复用这些已付费文件而不是重新图生视频。只用于预置工具，不进桌面端流程。
 */
function reuseAiCacheForPrompts(cache: { shots?: Record<string, string>; music?: Record<string, string> }, p: { shot: string; music: string }): { shots: Record<string, string>; music: Record<string, string> } {
  const tag = (s: string): string => `|p:${createHash('sha1').update(s).digest('hex').slice(0, 10)}`;
  const shots: Record<string, string> = { ...(cache.shots || {}) };
  const music: Record<string, string> = { ...(cache.music || {}) };
  for (const [k, v] of Object.entries(cache.shots || {})) if (!k.includes('|p:')) shots[`${k}${tag(p.shot)}`] = v;
  for (const [k, v] of Object.entries(cache.music || {})) if (!k.includes('|p:')) music[`${k}${tag(p.music)}`] = v;
  // 配乐键带时长（按本次最长成片算）；只重做部分语言时时长会变——同情绪同提示词的配乐挂到 20–47 秒每一档（成片里配乐本就循环）
  for (const [k, v] of Object.entries({ ...music })) {
    const m = k.match(/^([^|]+)\|\d+(\|p:.+)?$/);
    if (!m) continue;
    for (let d = 20; d <= 47; d += 1) { const key = `${m[1]}|${d}${m[2] || ''}`; if (!music[key]) music[key] = v; }
  }
  return { shots, music };
}

function arg(name: string, def = ''): string {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

function readModelConfig(home: string): { baseUrl: string; apiKey: string; model: string } | null {
  try {
    const cfg = readFileSync(join(home, 'config.yaml'), 'utf8');
    const block = cfg.match(/^model:\n((?:[ \t]+.*\n?)+)/m)?.[1] || '';
    const pick = (k: string): string => block.match(new RegExp(`^\\s+${k}:\\s*"?([^"\\n]+)"?`, 'm'))?.[1]?.trim() || '';
    const baseUrl = pick('base_url'); const apiKey = pick('api_key'); const model = pick('default');
    return baseUrl && apiKey && model ? { baseUrl, apiKey, model } : null;
  } catch { return null; }
}

async function chat(cfg: { baseUrl: string; apiKey: string; model: string }, messages: unknown[], opts: { json?: boolean; maxTokens?: number } = {}): Promise<string> {
  const b = cfg.baseUrl.replace(/\/+$/, '');
  const url = /\/chat\/completions$/.test(b) ? b : /\/v\d+$/.test(b) ? `${b}/chat/completions` : `${b}/v1/chat/completions`;
  const body: Record<string, unknown> = { model: cfg.model, messages, stream: false, max_tokens: opts.maxTokens ?? 8000 };
  if (opts.json) body.response_format = { type: 'json_object' };
  const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  const j: any = await res.json();
  const c = j?.choices?.[0]?.message?.content;
  return typeof c === 'string' ? c : Array.isArray(c) ? c.map((x: any) => x?.text || '').join('') : '';
}

async function main(): Promise<void> {
  const resourcesDir = resolve(__dirname, '..', '..', '..', '..', 'resources');
  const material = arg('--material')
    ? resolve(arg('--material'))
    : prepareDemoMaterials(demoMaterialsSourceDir(resourcesDir), demoMaterialsTargetDir(app.getPath('documents'))).dir;
  // manifest 只记相对素材目录的路径：它随安装包分发，不能带本机用户名 / 目录结构
  const rel = (p: string): string => (p ? relative(material, p).split('\\').join('/') : p);
  const outPre = resolve(arg('--out', join(resourcesDir, 'bundled-solutions', 'charity-content', 'prebaked')));
  const wantAi = process.argv.includes('--ai');
  const reportOnly = process.argv.includes('--report-only');
  // 预置成品按两段默认提示词生成（与界面预填一致，取中文那份）；--no-prompts 可还原成不加提示词
  const prompts = process.argv.includes('--no-prompts') ? { content: '', video: '' } : { content: DEFAULT_CONTENT_PROMPT.zh, video: DEFAULT_VIDEO_PROMPT.zh };
  const videoPrompts = { contentPrompt: prompts.content, videoPrompt: prompts.video };
  const videoOnly = process.argv.includes('--video-only');
  // --langs zh,ar：只重做这几种语言的语音与视频（其余语言的预置成品与 manifest 条目不动）
  const onlyLangs = arg('--langs') ? LANGS.filter((l) => arg('--langs').split(',').includes(l)) : LANGS;
  const regenAi = videoOnly && process.argv.includes('--regen-ai');
  const home = AGENT_HOME_ARG;
  mkdirSync(outPre, { recursive: true });
  const pair = resolveFfmpegPair(resourcesDir);
  if (!pair.ffmpeg || !pair.ffprobe) throw new Error('ffmpeg/ffprobe not found');
  const agentEnv = home ? readAgentEnv(home) : {};
  const cfg = home ? readModelConfig(home) : null;
  console.log('[prebake] material =', material, '| model =', cfg?.model || '(none)', '| fal =', !!agentEnv.FAL_KEY);

  // 账号加密密钥库（media.FAL_KEY / FAL_KEY_BACKUP）+ 全应用 ttsRouter，与桌面端同源
  if (basename(dirname(dirname(home))) === 'accounts') setActiveAccountKey(basename(dirname(home)));
  const secrets = new ConnectorSecretStore({ file: () => accountPath('connectors', 'secrets.json'), keyDir: () => deviceRoot(), safeStorage: null, warn: (m) => console.warn('[prebake][secrets]', m) });
  setMediaSecretStore(() => secrets);
  const logger = { info: (_c: string, m: string, ctx?: unknown) => console.log('[prebake]', m, ctx ? JSON.stringify(ctx).slice(0, 200) : ''), warn: (_c: string, m: string, ctx?: unknown) => console.warn('[prebake][warn]', m, ctx ? JSON.stringify(ctx).slice(0, 200) : ''), audit: () => {}, error: () => {} };
  configureTtsRouter({ agentHome: () => home, usageFile: falUsageFile, quotaFile: falQuotaFile, cacheDir: ttsCacheDir, log: (lv, m, ctx) => (lv === 'warn' ? logger.warn : logger.info)('tts', m, ctx) });
  qiyeApiBridge.setTotalclawHome(home || null);
  const slots = resolveFalKeySlots(home, undefined, 'workbench-charity-content');
  console.log('[prebake] fal key:', slots.source, '| primary', !!slots.primary, '| backup', !!slots.backup);
  const ipcDeps = { appConfig: { engines: { 'totalclaw-agent': { totalclawHome: home } }, brain: { profiles: { default: { provider: cfg ? 'custom' : '' } } } }, logger, qiyeApiProc: null, authState: { authenticated: true }, getMainWindow: () => null } as any;
  const rt = createCharityRuntime(ipcDeps, () => home || undefined);
  const usageBefore = readFalUsage(falUsageFile(), 100_000).length;

  const pre = loadPrebaked(resourcesDir);
  const log = { info: (m: string, c?: unknown) => console.log('[prebake]', m, c ? JSON.stringify(c).slice(0, 300) : ''), warn: (m: string, c?: unknown) => console.warn('[prebake][warn]', m, c ? JSON.stringify(c).slice(0, 300) : '') };
  const deps: PipelineDeps = {
    resourcesDir,
    tools: {
      ffmpeg: pair.ffmpeg, ffprobe: pair.ffprobe, python: resolveAgentPython(resourcesDir),
      scriptsDir: join(resourcesDir, 'bundled-skills', 'marketing-sales', 'totalclaw-video-studio', 'scripts'),
      env: { ...process.env, ...agentEnv, ...ffmpegSpawnEnv(resourcesDir), PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1', PYTHONIOENCODING: 'utf-8' },
    },
    agentHome: home || undefined,
    fal: rt.falFacade(),
    // 看图：fal any-llm/vision → brain 多模态（deepseek 不认图会空）
    vision: rt.vision,
    // 文案：预置工具没有引擎会话，直连 config.yaml 默认端点（与桌面端 runOneshotChat 用的是同一个模型）
    text: async (prompt, opts) => { if (!cfg) throw new Error('no model config'); return chat(cfg, [{ role: 'user', content: prompt }], { json: opts.jsonObject }); },
    renderPdf: renderHtmlToPdf,
    renderImage: renderHtmlToImage,
    imageDataUrl: imageToDataUrl,
    progress: (stage, msg, done, total) => console.log(`[prebake][${stage}] ${msg} (${done}/${total})`),
    log,
  };

  if (videoOnly) {
    // 只允许逐句 TTS（走 ttsRouter，费用很低）；图生视频 / 配乐 / 看图 / 上传一律拒绝
    const blocked = async (): Promise<never> => { throw new Error('video-only: new fal generation is not allowed (AI shots / music must hit --ai-cache)'); };
    const orig = deps.fal;
    const allowGen: NonNullable<typeof orig.run> | null = orig.run
      ? (r, sig, onP) => (r.capability === 'i2v' || r.capability === 'music' ? orig.run!(r, sig, onP) : blocked())
      : null;
    deps.fal = { ...orig, run: orig.run ? (regenAi ? allowGen : blocked) : null, upload: orig.run ? (regenAi ? orig.upload : blocked) : null };
  }

  const runId = makeRunId();
  const outDir = outDirFor(material, runId);
  mkdirSync(outDir, { recursive: true });
  const files = listMaterialFiles(material);
  const media = files.filter((f) => kindOf(f) === 'image' || kindOf(f) === 'video');
  const images = files.filter((f) => kindOf(f) === 'image');
  console.log('[prebake] files:', files.length, 'media:', media.length, 'outDir:', outDir);

  // 档案：先试视觉模型；不行就用 demo-archive.json
  // 档案：视觉模型真跑一遍并写回 demo-archive.json 固化（三语 / 数字来自画面；跑不通才沿用旧文件）
  let archive = pre.archive ? normalizeArchive(pre.archive, undefined, 'demo') : null;
  if (reportOnly) {
    if (!archive) throw new Error(i18nT('report-only 需要 demo-archive.json'));
    const descs = mapPrebakedDescriptions(pre, media.map((p) => ({ path: p, kind: kindOf(p) as 'image' | 'video' })));
    const { report, via } = await composeReport(deps, archive, descs, undefined, prompts.content);
    console.log('[prebake] report via', JSON.stringify(via));
    const rendered = await renderOutputs(deps, archive, report, images, outDir);
    writeFileSync(join(outPre, 'report.json'), JSON.stringify(report, null, 2));
    for (const l of LANGS) {
      copyFileSync(rendered.pdf[l], join(outPre, `report-${l}.pdf`));
      copyFileSync(rendered.poster[l], join(outPre, `poster-${l}.jpg`));
      const page1 = join(outDir, `report-${l}-page1.png`);
      if (existsSync(page1)) copyFileSync(page1, join(outPre, `report-${l}-page1.png`));
    }
    const mf = join(outPre, 'manifest.json');
    const prev = existsSync(mf) ? JSON.parse(readFileSync(mf, 'utf8')) : {};
    const next = { ...prev, reportRegeneratedAt: new Date().toISOString(), reportRunId: runId, reportOutDir: rel(outDir), reportVia: via, reportContentPrompt: prompts.content ? 'DEFAULT_CONTENT_PROMPT.zh' : '', archiveNumbers: { participants: archive.participants, donation: archive.donation, date: archive.date } };
    writeFileSync(mf, JSON.stringify(next, null, 2));
    console.log('[prebake] REPORT-ONLY DONE', JSON.stringify(next.archiveNumbers));
    return;
  }
  if (videoOnly) {
    if (!archive || !pre.report) throw new Error('video-only needs demo-archive.json and prebaked/report.json');
    const report = pre.report;
    const speech = await synthesizeSpeech(deps, Object.fromEntries(onlyLangs.map((l) => [l, report[l].summary])), outDir, { quality: 'hd' });
    const narration: Record<string, string> = {};
    for (const l of LANGS) if (speech[l]) narration[l] = speech[l]!.path;
    const captions = { zh: report.zh.captions, en: report.en.captions, ar: report.ar.captions };
    const videos = await buildVideos(deps, { items: media, mode: 'clip', langs: onlyLangs, archive, captions, narration, bgmMood: 'warm', ...videoPrompts }, outDir);
    let aiVideos: Awaited<ReturnType<typeof buildVideos>> | null = null;
    if (wantAi) {
      if (!regenAi) {
        const cacheSrc = arg('--ai-cache');
        if (!cacheSrc || !existsSync(cacheSrc)) throw new Error('--video-only --ai needs --ai-cache <ai-cache.json> (or --regen-ai)');
        mkdirSync(join(outDir, '.work-video'), { recursive: true });
        writeFileSync(join(outDir, '.work-video', 'ai-cache.json'), JSON.stringify(reuseAiCacheForPrompts(JSON.parse(readFileSync(cacheSrc, 'utf8')), videos.prompts), null, 2));
      }
      aiVideos = await buildVideos(deps, { items: media, mode: 'ai', langs: onlyLangs, archive, captions, narration, bgmMood: 'warm', ...videoPrompts }, outDir);
      if (!regenAi && aiVideos.ai?.music.source !== 'fal') throw new Error(`AI music did not come from cache: ${JSON.stringify(aiVideos.ai?.music)}`);
      const shotState = JSON.stringify(aiVideos.ai?.shots.map((s) => [s.source, s.reused, s.reason]));
      if (aiVideos.mode !== 'ai') throw new Error(`AI video fell back to clip: ${aiVideos.ai?.fallbackReason}`);
      if (!regenAi && aiVideos.ai?.shots.some((s) => !s.reused)) throw new Error(`AI shots did not all come from cache: ${shotState}`);
      if (regenAi && aiVideos.ai?.shots.some((s) => s.source !== 'fal')) console.warn('[prebake][warn] some AI shots fell back to Ken Burns:', shotState);
    }
    for (const l of onlyLangs) {
      if (speech[l]) {
        copyFileSync(speech[l]!.path, join(outPre, `speech-${l}.mp3`));
        const track = narrationTrackPath(speech[l]!.path);
        if (existsSync(track)) copyFileSync(track, join(outPre, `speech-${l}.cues.json`));
      }
      if (videos.items[l]) copyFileSync(videos.items[l]!.path, join(outPre, `video-${l}.mp4`));
      if (aiVideos?.mode === 'ai' && aiVideos.items[l]) copyFileSync(aiVideos.items[l]!.path, join(outPre, `video-${l}-ai.mp4`));
    }
    const usageRecords = readFalUsage(falUsageFile(), 100_000);
    // 本模式只允许 TTS；同账号下桌面端同时在跑时，用量文件里会混进别人的调用，只计 tts
    const counted = regenAi ? ['tts', 'i2v', 'music', 'upload'] : ['tts'];
    const thisRun = usageRecords.slice(0, Math.max(0, usageRecords.length - usageBefore)).filter((r) => counted.includes(r.capability));
    const mf = join(outPre, 'manifest.json');
    const prev = existsSync(mf) ? JSON.parse(readFileSync(mf, 'utf8')) : {};
    const next = {
      ...prev,
      videoRegeneratedAt: new Date().toISOString(), videoRunId: runId, videoOutDir: rel(outDir),
      videoFalUsage: {
        calls: thisRun.length, ok: thisRun.filter((r) => r.ok).length,
        estUsd: Math.round(thisRun.reduce((a, r) => a + (r.estUsd || 0), 0) * 10000) / 10000,
        byCapability: Object.fromEntries([...new Set(thisRun.map((r) => r.capability))].map((c) => [c, thisRun.filter((r) => r.capability === c).length])),
      },
      speech: Object.fromEntries(LANGS.map((l) => [l, speech[l] ? { quality: speech[l]!.quality, voice: speech[l]!.voice, durationSec: speech[l]!.durationSec } : null])),
      video: Object.fromEntries(LANGS.map((l) => [l, videos.items[l] ? { durationSec: videos.items[l]!.durationSec, size: videos.items[l]!.size } : null])),
      ...(aiVideos ? { aiVideo: aiVideos.mode === 'ai', aiShots: aiVideos.ai?.shots.map((s) => s.source), aiVideoDurations: Object.fromEntries(LANGS.map((l) => [l, aiVideos!.items[l]?.durationSec ?? null])) } : {}),
      videoPrompts: { content: prompts.content ? 'DEFAULT_CONTENT_PROMPT.zh' : '', video: prompts.video ? 'DEFAULT_VIDEO_PROMPT.zh' : '', effective: videos.prompts },
      // --ai-cache 复用的 AI 镜头 / 配乐是此前按原默认镜头 prompt 生成的，没有按新提示词重新图生视频（那要重新付费）
      ...(aiVideos ? {
        aiShotsPrompt: regenAi ? 'regenerated with the merged default prompts (videoPrompts.effective.shot / .music)' : 'reused from --ai-cache (generated with the legacy base shot prompt)',
        aiEstUsd: aiVideos.ai?.estUsd ?? 0, aiMusic: aiVideos.ai?.music.source,
      } : {}),
    };
    if (onlyLangs.length < LANGS.length) {
      // 部分语言重做：只更新这几种语言的条目，其余（含 AI 镜头来源与费用记录）保持上一次完整重做时的值
      const pick = (key: string, cur: Record<string, unknown>): Record<string, unknown> => ({ ...(prev[key] || {}), ...Object.fromEntries(onlyLangs.map((l) => [l, cur[l]])) });
      const partial = {
        ...prev,
        speech: pick('speech', next.speech), video: pick('video', next.video),
        ...(aiVideos ? { aiVideoDurations: pick('aiVideoDurations', next.aiVideoDurations as Record<string, unknown>) } : {}),
        partialRegenerated: [...(Array.isArray(prev.partialRegenerated) ? prev.partialRegenerated : []), { at: new Date().toISOString(), runId, langs: onlyLangs, falUsd: next.videoFalUsage.estUsd, reason: arg('--reason') || '' }],
      };
      writeFileSync(mf, JSON.stringify(partial, null, 2));
      console.log('[prebake] VIDEO-ONLY (partial) DONE', JSON.stringify({ langs: onlyLangs, speech: partial.speech, video: partial.video, fal: next.videoFalUsage }));
      return;
    }
    writeFileSync(mf, JSON.stringify(next, null, 2));
    console.log('[prebake] VIDEO-ONLY DONE', JSON.stringify({ speech: next.speech, video: next.video, fal: next.videoFalUsage }));
    return;
  }
  try {
    const drafted = await draftArchive(deps, images);
    console.log('[prebake] VLM archive draft ok:', drafted.eventName.zh);
    archive = normalizeArchive(drafted, archive || undefined, 'demo');
    writeFileSync(join(resourcesDir, 'bundled-solutions', 'charity-content', 'demo-archive.json'), JSON.stringify(archive, null, 2) + '\n');
  } catch (e: any) { console.warn('[prebake] VLM archive draft unavailable → demo-archive.json:', e?.message); }
  if (!archive) throw new Error('no archive');

  // 描述：先试视觉模型；不行就用 descriptions.json
  let descriptions;
  const analyzed = await analyzeMaterials(deps, media, join(outDir, '.work'), undefined, archive, prompts.content);
  descriptions = analyzed.descriptions;
  if (descriptions.length) {
    // 固化视觉模型的真实描述（不带路径，按 kind 顺序）
    writeFileSync(join(outPre, 'descriptions.json'), JSON.stringify(descriptions.map((d) => ({ kind: d.kind, description: d.description })), null, 2) + '\n');
  }
  if (!descriptions.length) {
    console.warn('[prebake] VLM analyze unavailable → descriptions.json:', analyzed.lastError);
    descriptions = mapPrebakedDescriptions(pre, media.map((p) => ({ path: p, kind: kindOf(p) as 'image' | 'video' })));
  }
  writeFileSync(join(outDir, 'descriptions.json'), JSON.stringify(descriptions, null, 2));

  const { report, via } = await composeReport(deps, archive, descriptions, undefined, prompts.content);
  console.log('[prebake] report via', JSON.stringify(via));
  const rendered = await renderOutputs(deps, archive, report, images, outDir);

  const speech = await synthesizeSpeech(deps, { zh: report.zh.summary, en: report.en.summary, ar: report.ar.summary }, outDir, { quality: 'hd' });
  const narration: Record<string, string> = {};
  for (const l of LANGS) if (speech[l]) narration[l] = speech[l]!.path;
  const captions = { zh: report.zh.captions, en: report.en.captions, ar: report.ar.captions };
  const videos = await buildVideos(deps, { items: media, mode: 'clip', langs: LANGS, archive, captions, narration, bgmMood: 'warm', ...videoPrompts }, outDir);
  let aiVideos: Awaited<ReturnType<typeof buildVideos>> | null = null;
  if (wantAi && deps.fal.run) {
    try { aiVideos = await buildVideos(deps, { items: media, mode: 'ai', langs: LANGS, archive, captions, narration, bgmMood: 'warm', ...videoPrompts }, outDir); }
    catch (e: any) { console.warn('[prebake] AI video failed:', e?.message); }
  }

  // 拷进 prebaked/
  writeFileSync(join(outPre, 'report.json'), JSON.stringify(report, null, 2));
  for (const l of LANGS) {
    copyFileSync(rendered.pdf[l], join(outPre, `report-${l}.pdf`));
    copyFileSync(rendered.poster[l], join(outPre, `poster-${l}.jpg`));
    const page1 = join(outDir, `report-${l}-page1.png`);
    if (existsSync(page1)) copyFileSync(page1, join(outPre, `report-${l}-page1.png`));
    if (speech[l]) {
      copyFileSync(speech[l]!.path, join(outPre, `speech-${l}.mp3`));
      const track = narrationTrackPath(speech[l]!.path);
      if (existsSync(track)) copyFileSync(track, join(outPre, `speech-${l}.cues.json`));
    }
    if (videos.items[l]) copyFileSync(videos.items[l]!.path, join(outPre, `video-${l}.mp4`));
    if (aiVideos?.mode === 'ai' && aiVideos.items[l]) copyFileSync(aiVideos.items[l]!.path, join(outPre, `video-${l}-ai.mp4`));
  }
  const usageRecords = readFalUsage(falUsageFile(), 100_000);
  const thisRun = usageRecords.slice(0, Math.max(0, usageRecords.length - usageBefore));
  const falUsage = {
    calls: thisRun.length, ok: thisRun.filter((r) => r.ok).length,
    estUsd: Math.round(thisRun.reduce((a, r) => a + (r.estUsd || 0), 0) * 10000) / 10000,
    unpriced: thisRun.filter((r) => r.ok && r.estUsd == null).map((r) => `${r.capability}:${r.model}`),
    byCapability: Object.fromEntries([...new Set(thisRun.map((r) => r.capability))].map((c) => [c, thisRun.filter((r) => r.capability === c).length])),
    usageFile: basename(falUsageFile()),
  };
  const manifest = {
    generatedAt: new Date().toISOString(), runId, outDir: rel(outDir), reportVia: via, falKeySource: slots.source, falUsage,
    speech: Object.fromEntries(LANGS.map((l) => [l, speech[l] ? { quality: speech[l]!.quality, voice: speech[l]!.voice, durationSec: speech[l]!.durationSec } : null])),
    video: Object.fromEntries(LANGS.map((l) => [l, videos.items[l] ? { durationSec: videos.items[l]!.durationSec, size: videos.items[l]!.size } : null])),
    aiVideo: aiVideos?.mode === 'ai', aiShots: aiVideos?.ai?.shots.map((s) => s.source), pdfPreviewAr: rel(rendered.pdfPreviewAr),
  };
  writeFileSync(join(outPre, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('[prebake] DONE', JSON.stringify(manifest, null, 2));
  void audioToDataUrl;
}

// 离屏窗口用完即销毁；不接这个事件 Electron 会在第一份 PDF 渲染完就退出（默认 window-all-closed 即 quit）
app.on('window-all-closed', () => { /* 由 main 结束后显式 app.exit */ });
app.whenReady().then(main).then(() => app.exit(0)).catch((e) => { console.error('[prebake] FAILED', e); app.exit(1); });
