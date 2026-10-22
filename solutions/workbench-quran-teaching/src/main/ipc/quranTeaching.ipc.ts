/**
 * quranTeaching.ipc —— 人工智能《古兰经》智能教学平台 · 展示型演示 IPC。
 *
 * 单例懒建（首次调用才建 store，不拖慢启动）。语料从 <resources>/quran-demo-corpus 内置导入，
 * 也可由用户在原生对话框选目录导入（同样逐文件核对校验值）。
 * LLM 走 runOneshotChat 纯补全（与聊天同大脑配置）；语音一律优先 fal MiniMax speech-02-hd，
 * 本地引擎只在 fal 不可用时兜底并在结果里标 fallback；图片经文用文字层，fal 只画背景。
 */
import { dialog, ipcMain } from 'electron';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { IPC_CHANNELS, type QuranLang, type QuranPlanRequest, type QuranProgressEvent, type QuranReviewPatch, type QuranSpeechRequest } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { IpcDeps } from './shared';
import { rateLimit } from './shared';
import { runOneshotChat } from '../services/councilChatRouter';
import { onAccountKeyChange, privateRoot } from '../services/accountScope';
import { shellResourcesPath } from '../services/runtimeLocation';
import { resolveFfmpegPair } from '../services/ffmpegPath';
import { buildLocalMediaUrl } from '../services/mediaProtocol';
import { synthesizeLocalSpeech } from '../services/localTts';
import { falKeysReady, runFalJob } from './mediaFal.ipc';
import { QuranTeachingStore } from '../services/quranTeaching/store';
import { QuranLanService } from '../services/quranTeaching/lan';
import { renderHtmlToPng } from '../services/quranTeaching/offscreenRender';

/** 方案 id：取 fal key 时按「本地 > 本方案服务端项 > 服务端全局」解析（与 web 后台 solution-catalog 同名） */
export const QURAN_SOLUTION_ID = 'workbench-quran-teaching';

let store: QuranTeachingStore | null = null;
let lanSvc: QuranLanService | null = null;
let accountHooked = false;

const FAL_TTS_MODEL = 'fal-ai/minimax/speech-02-hd';
/** MiniMax speech-02-hd 音色：中英有专用音色；阿拉伯语用多语言默认音色（模型本身多语） */
const FAL_TTS_VOICE: Record<QuranLang, string> = { zh: 'Chinese (Mandarin)_Warm_Girl', en: 'English_Graceful_Lady', ar: 'Wise_Woman' };
const LOCAL_TTS_LANG: Record<QuranLang, string> = { zh: 'zh-CN', en: 'en-US', ar: 'ar-001' };

/** 语料 / 字体随安装包（壳）分发；ffmpeg 在 vendor 下由 resolveFfmpegPair 自己改道到运行时目录 */
function resourcesDir(): string {
  return shellResourcesPath();
}

/** 内置经文字体（resources/quran-demo-fonts，OFL）：渲染层用 URL，离屏渲染用 base64 内嵌 */
function fontAssets(): { fontUrls?: { quran: string; text: string }; fontFaceCss: string } {
  const dir = join(resourcesDir(), 'quran-demo-fonts');
  const quran = join(dir, 'AmiriQuran.ttf'); const text = join(dir, 'Amiri-Regular.ttf');
  if (!existsSync(quran) || !existsSync(text)) return { fontFaceCss: '' };
  const face = (family: string, file: string): string => `@font-face{font-family:"${family}";src:url(data:font/ttf;base64,${readFileSync(file).toString('base64')}) format("truetype");font-display:block}`;
  return { fontUrls: { quran: buildLocalMediaUrl(quran), text: buildLocalMediaUrl(text) }, fontFaceCss: face('Amiri Quran', quran) + face('Amiri', text) };
}

function llmReady(deps: IpcDeps): boolean {
  try { return !!deps.engineRegistry?.getActive?.(); } catch { return false; }
}

function isLang(v: unknown): v is QuranLang { return v === 'zh' || v === 'en' || v === 'ar'; }
function lang(v: unknown): QuranLang { return isLang(v) ? v : 'zh'; }
function num(v: unknown, d?: number): number | undefined { const n = Number(v); return Number.isFinite(n) ? n : d; }

/**
 * 局域网学生端服务（懒起）。与 store 同生命周期：账号一换就连服务带认领一起丢，
 * 绝不让上一个账号的卷子继续挂在局域网上。
 */
function lan(deps: IpcDeps): QuranLanService {
  ensure(deps); // 顺带装上账号切换钩子
  if (!lanSvc) lanSvc = new QuranLanService(ensure(deps), deps.logger);
  return lanSvc;
}

function ensure(deps: IpcDeps): QuranTeachingStore {
  if (!accountHooked) {
    accountHooked = true;
    onAccountKeyChange(() => {
      store = null;
      const old = lanSvc;
      lanSvc = null;
      void old?.stop();
    });
  }
  if (store) return store;
  const emit = (ev: QuranProgressEvent): void => {
    try { deps.getMainWindow()?.webContents.send(IPC_CHANNELS.WORKBENCH_QURAN_EVENT, ev); } catch { /* 窗口已销毁 */ }
  };
  const pair = resolveFfmpegPair(resourcesDir());
  const fonts = fontAssets();
  // 每次现取：/me 刷新下发了新 key、或用户刚在设置里填了 key，都不用重启就生效
  const falReady = (): boolean => falKeysReady(deps, QURAN_SOLUTION_ID);
  store = new QuranTeachingStore({
    dataDir: privateRoot(),
    bundledCorpusDir: join(resourcesDir(), 'quran-demo-corpus'),
    // 随包短视频样例（§13.2 允许预置）：启动时自动登记，ffmpeg 不可用也有得放
    bundledVideoDir: join(resourcesDir(), 'quran-demo-videos'),
    llm: async (prompt, timeoutMs) => {
      try { return await runOneshotChat(deps, prompt, { plainCompletion: true, timeoutMs }); } catch (e: any) {
        const msg = String(e?.message || e);
        if (/SessionProvider|engineRegistry|未就绪|API key|api_key|not.*ready|provider/i.test(msg)) throw new Error(i18nT('AI 大脑尚未就绪，请到「设置 → 模型配置」完成配置后重试'));
        throw e;
      }
    },
    llmReady: () => llmReady(deps),
    renderImage: renderHtmlToPng,
    ffmpeg: pair.ffmpeg,
    falReady,
    falBackground: async (prompt) => {
      const r = await runFalJob(deps, { capability: 't2i', model: 'fal-ai/flux/schnell', prompt, width: 1280, height: 800, num: 1, outDir: join(privateRoot(), 'quran-teaching', 'media', 'fal'), solutionId: QURAN_SOLUTION_ID });
      const f = r.files.find(Boolean);
      if (!f) return null;
      return `data:image/jpeg;base64,${readFileSync(f).toString('base64')}`;
    },
    tts: async (text, l, outBase) => {
      // 用户决定：一律优先 fal MiniMax speech-02-hd；本地引擎只做兜底并标注
      if (falReady()) {
        try {
          const r = await runFalJob(deps, { capability: 'tts', model: FAL_TTS_MODEL, text, voice: FAL_TTS_VOICE[l], outDir: join(privateRoot(), 'quran-teaching', 'media', 'fal'), solutionId: QURAN_SOLUTION_ID });
          const f = r.files.find(Boolean);
          if (f) return { path: f, engine: 'fal', model: FAL_TTS_MODEL };
        } catch (e: any) {
          deps.logger?.warn?.('quran-teaching', i18nT('fal 语音合成失败，回落本地引擎'), { err: String(e?.message || e).slice(0, 200) });
        }
      }
      const local = await synthesizeLocalSpeech({ text, lang: LOCAL_TTS_LANG[l] });
      if (!local.ok || !local.wavBase64) return null;
      const path = `${outBase}.wav`;
      writeFileSync(path, Buffer.from(local.wavBase64, 'base64'));
      return { path, engine: 'local', model: local.voice || 'system' };
    },
    fileUrl: (p) => buildLocalMediaUrl(p),
    fontFaceCss: fonts.fontFaceCss,
    fontUrls: fonts.fontUrls,
    progress: (jobId, stage, msg, done, total) => emit({ jobId, stage, msg, done, total }),
    logger: {
      info: (m, ctx) => deps.logger?.info?.('quran-teaching', m, ctx),
      warn: (m, ctx) => deps.logger?.warn?.('quran-teaching', m, ctx),
    },
  });
  return store;
}

export function registerQuranTeachingHandlers(deps: IpcDeps): () => void {
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_STATUS, async () => ensure(deps).status());

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_PICK_DIR, async () => {
    const win = deps.getMainWindow();
    const opts = { title: i18nT('选择标准经文测试语料包目录'), properties: ['openDirectory'] as Array<'openDirectory'> };
    const r = win ? await dialog.showOpenDialog(win, opts) : await dialog.showOpenDialog(opts);
    return { path: r.canceled ? '' : (r.filePaths[0] || '') };
  });

  // 导入：不带 dir = 内置语料包；带 dir 必须来自 PICK_DIR（渲染层不得直传任意路径）
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_IMPORT, async (_e, payload: { dir?: string }) => {
    rateLimit('QURAN_IMPORT', 20);
    const s = ensure(deps);
    const dir = String(payload?.dir || '').trim();
    const status = dir ? s.importCorpus(dir, 'directory') : s.importCorpus(join(resourcesDir(), 'quran-demo-corpus'), 'bundled');
    deps.logger.audit?.('quran-teaching', i18nT('导入标准经文语料包'), { dir: status.sourceDir, verified: status.allVerified, verses: status.totalVerses, problems: status.problems.length });
    return status;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_VERSES, async (_e, payload: { chapter: number; from?: number; to?: number }) =>
    ensure(deps).verses(Number(payload?.chapter), num(payload?.from), num(payload?.to)));

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_SEARCH, async (_e, payload: { query: string; chapter?: number }) =>
    ensure(deps).search(String(payload?.query || ''), num(payload?.chapter)));

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_MATERIALS, async (_e, payload: { chapter: number; from?: number; to?: number }) =>
    ensure(deps).materialsFor(Number(payload?.chapter), num(payload?.from), num(payload?.to)));

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_PARSE, async (_e, payload: { chapter: number; from?: number; to?: number }) => {
    rateLimit('QURAN_PARSE', 60);
    const r = ensure(deps).parse(Number(payload?.chapter), num(payload?.from), num(payload?.to));
    deps.logger.audit?.('quran-teaching', i18nT('解析章节结构'), { chapter: r.chapter, from: r.from, to: r.to, units: r.units.length });
    return r;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_PLAN_GENERATE, async (_e, payload: Partial<QuranPlanRequest>) => {
    rateLimit('QURAN_PLAN', 10);
    const req: QuranPlanRequest = {
      chapter: Number(payload?.chapter), from: num(payload?.from, 1)!, to: num(payload?.to, 9999)!,
      grade: String(payload?.grade || '').trim().slice(0, 60) || i18nT('大学一年级'),
      level: payload?.level === 'intermediate' || payload?.level === 'advanced' ? payload.level : 'beginner',
      sessionsPerWeek: num(payload?.sessionsPerWeek, 2)!, sessionMinutes: num(payload?.sessionMinutes, 45)!, weeks: num(payload?.weeks, 2)!,
      goals: String(payload?.goals || '').slice(0, 400), lang: lang(payload?.lang),
    };
    const plan = await ensure(deps).generatePlan(req);
    deps.logger.audit?.('quran-teaching', i18nT('生成教学计划'), { planId: plan.id, chapter: req.chapter, generator: plan.generator });
    return plan;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_PLAN_SAVE, async (_e, payload: { id: string; patch: any }) => {
    const plan = ensure(deps).savePlan(String(payload?.id || ''), payload?.patch || {});
    deps.logger.audit?.('quran-teaching', i18nT('教师确认/编辑教学计划'), { planId: plan.id, reviewStatus: plan.reviewStatus });
    return plan;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_GRAPH, async (_e, payload: { chapter: number; from?: number; to?: number; lang?: QuranLang }) =>
    ensure(deps).graph(Number(payload?.chapter), num(payload?.from), num(payload?.to), lang(payload?.lang)));

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_PAPER_GENERATE, async (_e, payload: { chapter: number; from?: number; to?: number; lang?: QuranLang; level?: string; count?: number; kind?: 'practice' | 'exam' }) => {
    rateLimit('QURAN_PAPER', 40);
    const r = ensure(deps).generatePaper({
      chapter: Number(payload?.chapter), from: num(payload?.from), to: num(payload?.to), lang: lang(payload?.lang),
      level: payload?.level === 'intermediate' || payload?.level === 'advanced' ? payload.level : 'beginner',
      count: num(payload?.count, 10), kind: payload?.kind === 'exam' ? 'exam' : 'practice',
    });
    deps.logger.audit?.('quran-teaching', i18nT('动态生成试卷'), { paperId: r.paper.id, questions: r.paper.questions.length, rejected: r.rejected, version: r.paper.version });
    return r;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_PAPERS, async () => ensure(deps).papers());

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_QUESTION_UPDATE, async (_e, payload: { paperId: string; questionId: string; patch: any }) => {
    const p = ensure(deps).updateQuestion(String(payload?.paperId || ''), String(payload?.questionId || ''), payload?.patch || {});
    deps.logger.audit?.('quran-teaching', payload?.patch?.remove ? i18nT('教师删除题目') : i18nT('教师编辑/确认题目'), { paperId: p.id, questionId: payload?.questionId });
    return p;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_INTAKE, async (_e, payload: { text?: string; note?: string }) => {
    const items = ensure(deps).intake(String(payload?.text || ''), String(payload?.note || ''));
    deps.logger.audit?.('quran-teaching', i18nT('教师提交待审核资料'), { chars: String(payload?.text || '').trim().length });
    return { items };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_REVIEW, async (_e, payload: QuranReviewPatch) => {
    const r = ensure(deps).review({
      target: payload?.target === 'script' ? 'script' : payload?.target === 'card' ? 'card' : 'reinforcement',
      id: String(payload?.id || ''),
      accept: typeof payload?.accept === 'boolean' ? payload.accept : undefined,
      text: typeof payload?.text === 'string' ? payload.text : undefined,
      cards: Array.isArray(payload?.cards) ? payload.cards : undefined,
      remove: payload?.remove === true,
    });
    deps.logger.audit?.('quran-teaching', i18nT('教师审核 AI 产物'), { target: payload?.target, id: payload?.id, accept: payload?.accept, edited: !!payload?.text || !!payload?.cards?.length });
    return r;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_QUESTION_REGENERATE, async (_e, payload: { paperId: string; questionId: string }) => {
    rateLimit('QURAN_REGEN', 60);
    const p = ensure(deps).regenerateQuestion(String(payload?.paperId || ''), String(payload?.questionId || ''));
    deps.logger.audit?.('quran-teaching', i18nT('教师重新生成题目'), { paperId: p.id, questionId: payload?.questionId });
    return p;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_STUDENTS, async () => ensure(deps).listStudents());

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_SIMULATE, async (_e, payload: { paperId: string }) => {
    rateLimit('QURAN_SIMULATE', 40);
    const records = ensure(deps).simulate(String(payload?.paperId || ''));
    deps.logger.audit?.('quran-teaching', i18nT('载入 5 名演示学生答题数据'), { paperId: payload?.paperId, records: records.length });
    return records;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_ANSWER_SET, async (_e, payload: { paperId: string; studentId: string; questionId: string; answer: number | number[] | null; lang?: QuranLang }) => {
    const s = ensure(deps);
    const rec = s.setAnswer(String(payload?.paperId || ''), String(payload?.studentId || ''), String(payload?.questionId || ''), payload?.answer ?? null);
    const analysis = s.analyze(rec.paperId, lang(payload?.lang));
    deps.logger.audit?.('quran-teaching', i18nT('修改学生答案并重算'), { paperId: rec.paperId, studentId: rec.studentId, questionId: rec.questionId, correct: rec.correct });
    return { record: rec, analysis, records: s.records(rec.paperId) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_ANALYZE, async (_e, payload: { paperId: string; lang?: QuranLang; commentary?: boolean; force?: boolean }) => {
    const s = ensure(deps);
    const id = String(payload?.paperId || '');
    // force：教师点「重新生成」时绕开按答题结果签名的缓存，否则签名没变就一直回旧文案（按钮等于假的）
    const analysis = payload?.commentary ? await s.analyzeWithCommentary(id, lang(payload?.lang), !!payload?.force) : s.analyze(id, lang(payload?.lang));
    return { analysis, records: s.records(id) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_REINFORCE, async (_e, payload: { paperId: string; issueKey: string; lang?: QuranLang }) => {
    rateLimit('QURAN_REINFORCE', 20);
    const r = ensure(deps).reinforce(String(payload?.paperId || ''), String(payload?.issueKey || ''), lang(payload?.lang));
    deps.logger.audit?.('quran-teaching', i18nT('生成强化教学'), { reinforcementId: r.id, target: r.targetKey });
    return r;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_RETEST, async (_e, payload: { reinforcementId: string; lang?: QuranLang; recompute?: boolean }) => {
    const s = ensure(deps);
    const id = String(payload?.reinforcementId || '');
    const r = payload?.recompute ? s.recomputeAfter(id, lang(payload?.lang)) : s.retest(id, lang(payload?.lang));
    deps.logger.audit?.('quran-teaching', i18nT('复测并对比前后'), { reinforcementId: r.id, before: r.before.targetWrong, after: r.after?.targetWrong });
    return { reinforcement: r, records: s.records(r.retest.id) };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_CARD, async (_e, payload: { kind: string; chapter: number; from?: number; to?: number; lang?: QuranLang; useFal?: boolean; focusRefs?: string[]; jobId?: string }) => {
    rateLimit('QURAN_CARD', 20);
    const kind = ['vocab', 'concept_map', 'timeline', 'review', 'structure'].includes(String(payload?.kind)) ? payload.kind as any : 'vocab';
    const card = await ensure(deps).makeCard({ kind, chapter: Number(payload?.chapter), from: num(payload?.from), to: num(payload?.to), lang: lang(payload?.lang), useFal: !!payload?.useFal, focusRefs: Array.isArray(payload?.focusRefs) ? payload.focusRefs.map(String).slice(0, 6) : undefined, jobId: payload?.jobId ? String(payload.jobId).slice(0, 40) : undefined });
    deps.logger.audit?.('quran-teaching', i18nT('生成教学视觉卡片'), { id: card.id, kind: card.kind, background: card.background });
    return card;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_VIDEO_SCRIPT, async (_e, payload: { chapter: number; from?: number; to?: number; lang?: QuranLang; polish?: boolean }) => {
    rateLimit('QURAN_SCRIPT', 20);
    const s = await ensure(deps).makeVideoScript({ chapter: Number(payload?.chapter), from: num(payload?.from), to: num(payload?.to), lang: lang(payload?.lang), polish: payload?.polish !== false });
    deps.logger.audit?.('quran-teaching', i18nT('生成视频脚本与分镜'), { id: s.id, scenes: s.scenes.length, generator: s.generator });
    return s;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_VIDEO_SAMPLE, async (_e, payload: { scriptId: string; jobId?: string }) => {
    rateLimit('QURAN_VIDEO', 6);
    const v = await ensure(deps).makeVideoSample(String(payload?.scriptId || ''), payload?.jobId ? String(payload.jobId).slice(0, 40) : undefined);
    deps.logger.audit?.('quran-teaching', i18nT('合成视频样例'), { id: v.id, durationSec: v.durationSec, voiceEngine: v.voiceEngine });
    return v;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_TTS, async (_e, payload: Partial<QuranSpeechRequest>) => {
    rateLimit('QURAN_TTS', 20);
    const r = await ensure(deps).makeSpeech({ kind: payload?.kind === 'teaching' ? 'teaching' : 'verse', chapter: Number(payload?.chapter), from: num(payload?.from), to: num(payload?.to), text: payload?.text ? String(payload.text) : undefined, lang: lang(payload?.lang) });
    deps.logger.audit?.('quran-teaching', i18nT('语音合成'), { id: r.id, kind: r.kind, engine: r.engine, fallback: r.fallback });
    return r;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_MEDIA, async () => { const s = ensure(deps).status(); return { cards: s.cards, scripts: s.scripts, videos: s.videos }; });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_DASHBOARD, async (_e, payload: { lang?: QuranLang }) => ensure(deps).dashboard(lang(payload?.lang)));

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_STUDENT_ASK, async (_e, payload: { question: string; chapter: number; from?: number; to?: number; lang?: QuranLang }) => {
    rateLimit('QURAN_ASK', 30);
    return ensure(deps).studentAsk(String(payload?.question || '').slice(0, 500), Number(payload?.chapter), num(payload?.from), num(payload?.to), lang(payload?.lang));
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_RESET, async () => {
    ensure(deps).reset();
    // 认领也一起放开：不放的话下一轮演示这几个名字全显示「已有人」，学生根本进不来
    lan(deps).releaseAll();
    deps.logger.audit?.('quran-teaching', i18nT('清空演示数据（保留语料）'), {});
    return ensure(deps).status();
  });

  // ── 校内局域网学生端 ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_LAN_STATUS, async () => lan(deps).status());
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_LAN_START, async () => {
    const st = await lan(deps).start();
    deps.logger.audit?.('quran-teaching', i18nT('启动校内服务'), { port: st.port });
    return st;
  });
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_LAN_STOP, async () => {
    await lan(deps).stop();
    return lan(deps).status();
  });
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_LAN_ROTATE, async () => lan(deps).rotateCode());
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_LAN_RELEASE, async () => { lan(deps).releaseAll(); return lan(deps).status(); });
  // 下发课程：范围 + 可选的课程计划。与下发试卷分开 —— 只讲不考也是常态
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_LAN_LESSON, async (_e, payload: { planId?: string; lang?: unknown; chapter?: unknown; from?: unknown; to?: unknown }) =>
    lan(deps).setActiveLesson(
      { chapter: num(payload?.chapter), from: num(payload?.from), to: num(payload?.to) },
      lang(payload?.lang), String(payload?.planId || '')));

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_QURAN_LAN_PUBLISH, async (_e, payload: { paperId?: string; lang?: unknown; chapter?: unknown; from?: unknown; to?: unknown }) =>
    // 范围跟着卷子一起下发：学生端的「学习内容」按它取经文与单元，
    // 只换卷不换范围，学生会对着别章的经文做这一章的题
    lan(deps).setActivePaper(String(payload?.paperId || ''), lang(payload?.lang), {
      chapter: num(payload?.chapter), from: num(payload?.from), to: num(payload?.to),
    }));
  // 卸载 / 停用：停掉局域网学生端服务、丢掉单例（重新安装后懒建）
  return () => {
    const old = lanSvc; lanSvc = null; store = null;
    void old?.stop();
  };
}
