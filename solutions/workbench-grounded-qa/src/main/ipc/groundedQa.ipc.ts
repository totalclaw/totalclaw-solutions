/**
 * 受控问答 IPC。
 *
 * 关键设计：**拒答的分支永远不调模型作答**。store.ask() 判定不通过时直接把拒答话术
 * 返回给界面，杜绝了"提示词让它拒答、它却答了"的可能。命中禁区连改写也不做。
 *
 * 每个问题两次模型调用：① 检索改写（补全追问、出中英文版本、给同义词）② 依据原文作答。
 * 改写结果照样过禁区表与证据判定；同义词只补召回、不参与放行。
 */
import { existsSync } from 'node:fs';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { IPC_CHANNELS } from '@totalclaw/ipc-contracts';
import { t as i18nT, tIn, getLocale, type SupportedLocale } from '@totalclaw/i18n';
import { GroundedQaStore, findHandbookDir, type KbDoc } from '../services/groundedQaStore';
import { ocrPdfPages } from '../services/pdfOcr';
import {
  detectLang, buildRewritePrompt, parseRewrite, parseAnswer, MAX_HISTORY_TURNS, NO_EVIDENCE_MESSAGE,
  type AnswerLang, type GroundedTurn,
} from '../services/groundedQa.logic';
// 与教案生成共用同一条文档解析路径：资源根回落链有坑（正式包 vendor/ 不随壳发布，
// 只看 process.resourcesPath 必然落空），复制一份迟早跑偏。
import { extractDocumentPages } from '../services/eduHubStore';
import { runOneshotChat } from '../services/councilChatRouter';
import type { IpcDeps } from './shared';

let store: GroundedQaStore | undefined;
/** 同步在途时复用同一个 Promise：进页面连点/切路由回来不会把同一份 PDF 解析两遍 */
let syncing: Promise<{ imported: KbDoc[]; folder: string | null }> | undefined;
/** 预取在途标记：同一时间只跑一轮，免得换文件夹连点几次开出好几路模型调用 */
let prefetching: Promise<void> | undefined;

/** 解析进度推给界面。用字面量通道名，避免在这里 import 造成循环依赖（与 bootstrap 的做法一致）。 */
function sendProgress(p: { file: string; done: number; total: number }): void {
  try {
    const win = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());
    win?.webContents?.send('grounded-qa:import-progress', p);
  } catch { /* 界面还没起来就算了 */ }
}

const LOCALE_OF: Record<AnswerLang, SupportedLocale> = { zh: 'zh-CN', en: 'en-US', ar: 'ar' };

/** 界面语言 → 示例问题该用哪种语言。资料问答只有中 / 英 / 阿：越南语、马来语界面走英文，绝不显示中文示例问题。 */
function uiLang(): AnswerLang {
  const l = getLocale();
  return l === 'ar' ? 'ar' : l === 'zh-CN' ? 'zh' : 'en';
}

/** 界面传来的历史只信形状，不信内容长度：截轮数、截长度，防止一个超长回答把提示词撑爆 */
function sanitizeHistory(raw: unknown): GroundedTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(-MAX_HISTORY_TURNS).map((h: any) => ({
    question: String(h?.question || '').slice(0, 500),
    ...(h?.answer ? { answer: String(h.answer).slice(0, 2000) } : {}),
  })).filter((h) => h.question.trim());
}

export function registerGroundedQaHandlers(deps: IpcDeps): void {
  const ensure = () => (store ??= new GroundedQaStore(extractDocumentPages, ocrPdfPages));

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GQA_LIST, async () => {
    const kb = ensure();
    // 切到别的界面语言后第一次进来：那种语言还没准备好示例问题，这里补跑一轮（不阻塞本次返回）
    if (kb.list().some((d) => d.approved)) prefetchSuggestions(deps, kb);
    return {
      docs: kb.list(),
      folder: currentFolder(),
      // 示例问题从当前资料里算出来：换了资料就换一批，不会出现「点了就拒答」。
      // ready=true 表示答案已经预取好，点下去秒回。
      suggestions: kb.suggestions(uiLang()).map((sg) => ({ ...sg, ready: !!kb.getCachedAnswer(sg.q) })),
    };
  });

  /** 当前资料文件夹：用户选过就用用户的，没选过才回落到桌面自动探测。 */
  const currentFolder = (): string | null => ensure().getFolder() ?? findHandbookDir(app.getPath('desktop'));

  // 进页面即同步当前资料文件夹；用户可随时换到别的文件夹（见 PICK_FOLDER）
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GQA_IMPORT, async () => {
    syncing ??= (async () => {
      const folder = currentFolder();
      if (!folder || !existsSync(folder)) return { imported: [], folder: null };
      const kb = ensure();
      const imported = await kb.syncFolder(folder, (p) => {
        sendProgress(p);
      });
      // 资料就位后台把示例问题跑一遍，用户点的时候直接出结果
      prefetchSuggestions(deps, kb);
      if (imported.length) deps.logger.audit?.('grounded-qa', i18nT('导入资料'), { count: imported.length, folder });
      return { imported, folder };
    })().finally(() => { syncing = undefined; });
    return syncing;
  });

  // 换文件夹：选完立刻同步一次，用户不用再点一遍「重新读取」
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GQA_PICK_FOLDER, async () => {
    const r = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: currentFolder() ?? app.getPath('desktop'),
      title: i18nT('选择资料文件夹'),
    });
    if (r.canceled || !r.filePaths.length) return { canceled: true, folder: currentFolder(), imported: [] };
    const folder = r.filePaths[0];
    const kb = ensure();
    // 换文件夹是**替换**：先清空旧资料再导入新目录，避免可回答范围变成两个目录的并集
    const imported = await kb.replaceFolder(folder, (p) => {
      sendProgress(p);
    });
    deps.logger.audit?.('grounded-qa', i18nT('更换资料文件夹'), { folder, imported: imported.length });
    prefetchSuggestions(deps, kb);
    return {
      canceled: false, folder, imported,
      suggestions: kb.suggestions(uiLang()).map((sg) => ({ ...sg, ready: !!kb.getCachedAnswer(sg.q) })),
    };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GQA_APPROVE, async (_e, p: { id: string; approved: boolean }) => {
    const kb = ensure();
    kb.setApproved(String(p?.id || ''), !!p?.approved);
    deps.logger.audit?.('grounded-qa', i18nT('资料审批状态变更'), { id: p?.id, approved: p?.approved });
    // 可回答范围变了 → 旧的预取答案按指纹自动作废，这里重新跑一轮
    prefetchSuggestions(deps, kb);
    return { ok: true };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GQA_REMOVE, async (_e, p: { id: string }) => {
    ensure().remove(String(p?.id || ''));
    deps.logger.audit?.('grounded-qa', i18nT('删除资料'), { id: p?.id });
    return { ok: true };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GQA_ASK, async (_e, p: { question: string; history?: GroundedTurn[] }) => {
    const q = String(p?.question || '').trim();
    if (!q) throw new Error(i18nT('请输入问题'));
    const history = sanitizeHistory(p?.history);
    // 首轮问到预取过的问题就直接回：示例问题点下去要秒出，不能让客户看着转圈。
    // 只对首轮生效 —— 带上下文的追问和缓存里那条不是同一个问题。
    if (!history.length) {
      const hit = ensure().getCachedAnswer(q);
      if (hit) {
        deps.logger.info?.('grounded-qa', '命中预取答案', { q: q.slice(0, 40) });
        return { ...hit, cached: true };
      }
    }
    return answerQuestion(deps, ensure(), q, history);
  });

}

/**
 * 检索改写。走与聊天同一条模型通道（runOneshotChat plainCompletion：agent worker 池、零工具、记忆隔离）。
 * 不用 qiye-api 的 /v1/chat/completions：默认大脑 `totalclaw` 不是那边的注册适配器，本机恒 404。
 * 失败不致命：返回空，调用方走拼接兜底检索，检索不过就按资料中无依据拒答。
 */
async function rewriteQuestion(deps: IpcDeps, question: string, history: GroundedTurn[]): Promise<{ queries: string[]; keywords: string[] }> {
  try {
    const raw = await runOneshotChat(deps, buildRewritePrompt(question, history), { plainCompletion: true, timeoutMs: 45_000 });
    return parseRewrite(raw);
  } catch (e: any) {
    deps.logger.warn?.('grounded-qa', '检索改写失败，走兜底检索', { error: String(e?.message || e) });
    return { queries: [], keywords: [] };
  }
}

/**
 * 回答一个问题：检索 → 判边界 → 过模型。**提问与预取共用这一条路径**，
 * 两边逻辑分家的话，预取出来的答案迟早和真实提问对不上。
 */
async function answerQuestion(
  deps: IpcDeps,
  kb: GroundedQaStore,
  q: string,
  history: GroundedTurn[],
): Promise<{ answered: boolean; answer?: string; refusal?: string; reason?: string; lang: AnswerLang; citations: { docName: string; page: number; snippet: string }[] }> {
  // 回答语言跟提问走；纯数字/标点识别不出时沿用上一轮，再不行才看界面语言
  const lang: AnswerLang = detectLang(q)
    ?? detectLang(history[history.length - 1]?.question || '')
    ?? uiLang();
  const locale = LOCALE_OF[lang];
  // 任何失败（模型没就绪、超时、通道报错）一律按「资料中无依据」拒答：客户面前只有答案或拒答两种结果，
  // 不出现技术报错；真实原因写日志排查
  const noEvidence = (why: Record<string, unknown>) => {
    deps.logger.audit?.('grounded-qa', i18nT('拒答'), { reason: 'no_evidence', lang, ...why });
    return { answered: false, refusal: tIn(locale, NO_EVIDENCE_MESSAGE), reason: 'no_evidence', citations: [], lang };
  };

  try {
    // 先不调模型判一次：权限/禁区直接拒，省掉改写调用
    let r = kb.ask(q, { lang });
    if (r.answered || r.reason === 'no_evidence') {
      const { queries: rewrites, keywords } = await rewriteQuestion(deps, q, history);
      // 原句始终参与检索：多轮里也常有独立的新问题（实测第二轮问「如何做小净？」，只用改写句被判无依据）。
      const queries = [...new Set([q, ...rewrites])];
      // 改写失败（模型没就绪 / 输出不是 JSON）：本问单独检索 +「上一问 + 本问」拼起来检索。
      const fallback = history.length ? [q, `${history[history.length - 1].question} ${q}`] : [q];
      r = kb.ask(q, {
        lang, history,
        searchQueries: queries.length ? queries : fallback,
        expandQueries: keywords.length ? [keywords.join(' ')] : [],
      });
      // 排查「为什么答不上」全靠这一行：改写成了什么、给了模型哪几页
      deps.logger.info?.('grounded-qa', '检索', {
        queries: queries.length ? queries : fallback, keywords,
        pages: r.citations.map((c) => `${c.docName}#${c.page}`),
      });
    }

    if (!r.answered) {
      if (r.reason === 'no_evidence') return noEvidence({ by: 'retrieval' });
      deps.logger.audit?.('grounded-qa', i18nT('拒答'), { reason: r.reason, lang });
      return { answered: false, refusal: tIn(locale, r.refusal || ''), reason: r.reason, citations: [], lang };
    }
    const reply = await runOneshotChat(deps, r.prompt!, { plainCompletion: true, timeoutMs: 120_000, responseLocale: locale });
    // 通道层有时把错误当正文返回（「⚠️ 大模型 API Key 无效或未配置」），不能当答案展示
    if (/^\s*⚠/.test(reply)) return noEvidence({ by: 'model_error', error: reply.slice(0, 200) });
    const parsed = parseAnswer(reply, r.citations.length);
    // 模型读完原文判定答不了：按资料不足拒答，不展示它「资料里没有提到……」的解释
    if (parsed.noAnswer) return noEvidence({ by: 'model' });
    const citations = parsed.used.map((i) => r.citations[i]);
    deps.logger.audit?.('grounded-qa', i18nT('作答'), { citations: citations.length, lang, turns: history.length + 1 });
    return { answered: true, answer: parsed.text, citations, lang };
  } catch (e: any) {
    deps.logger.warn?.('grounded-qa', '作答失败，按资料中无依据拒答', { error: String(e?.message || e) });
    return noEvidence({ by: 'error' });
  }
}

/**
 * 后台把示例问题的答案先跑出来存起来，用户点下去就是秒回。
 * 串行跑：并行等于同时开好几路模型调用，抢的是同一个 worker，反而更慢还挤占真实提问。
 * 失败不重试也不报错 —— 预取只是加速，点的时候照样能现场问。
 */
function prefetchSuggestions(deps: IpcDeps, kb: GroundedQaStore): void {
  if (prefetching) return;
  prefetching = (async () => {
    const lang = uiLang();
    await ensureSuggestionsInLang(deps, kb, lang);
    const list = kb.suggestions(lang);
    for (const s of list) {
      if (kb.getCachedAnswer(s.q)) continue;
      const t0 = Date.now();
      const r = await answerQuestion(deps, kb, s.q, []);
      kb.setCachedAnswer(s.q, r);
      deps.logger.info?.('grounded-qa', '示例问题已预取', { q: s.q.slice(0, 30), ms: Date.now() - t0, answered: r.answered });
      sendSuggestionsReady(kb);
    }
  })().catch((e) => {
    deps.logger.warn?.('grounded-qa', '示例问题预取失败（不影响现场提问）', { error: String(e?.message || e) });
  }).finally(() => { prefetching = undefined; });
}

/** 预取进度推给界面：已就绪的问题在 UI 上标成「秒回」。 */
function sendSuggestionsReady(kb: GroundedQaStore): void {
  try {
    const ready = kb.suggestions(uiLang()).filter((s) => !!kb.getCachedAnswer(s.q)).map((s) => s.q);
    const win = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());
    win?.webContents?.send('grounded-qa:suggestions-ready', { ready });
  } catch { /* 界面还没起来就算了 */ }
}

/**
 * 界面语言下没有可用示例问题时（典型：中文资料 + 英文界面），
 * 把中文候选翻译过去再**逐条跑一遍真实提问**，只留真能答上的。
 *
 * 为什么必须真跑一遍：翻译后是拿英文去检索中文资料，靠的是问句改写那一路，
 * 光凭词面判定说不准；与其让客户点到一个「答不上」的示例，不如少放几个。
 */
async function ensureSuggestionsInLang(deps: IpcDeps, kb: GroundedQaStore, lang: AnswerLang): Promise<void> {
  if (lang === 'zh') return;
  if (kb.getSuggestionCache(lang)) return;
  const have = kb.suggestions(lang).filter((s) => s.inScope);
  if (have.length >= 4) return;

  const zhCandidates = kb.suggestions('zh').filter((s) => s.inScope).map((s) => s.q);
  if (!zhCandidates.length) return;

  const target = lang === 'ar' ? i18nT('阿拉伯语') : i18nT('英语');
  let translated: string[] = [];
  try {
    const raw = await runOneshotChat(deps, [
      i18nT('把下面每个问题翻译成{target}，一行一个，只输出译文，不要编号、不要解释。', { target }),
      '',
      ...zhCandidates,
    ].join('\n'), { plainCompletion: true, timeoutMs: 45_000 });
    translated = raw.split('\n').map((x) => x.replace(/^\s*[-*\d.、)]+\s*/, '').trim()).filter(Boolean).slice(0, zhCandidates.length);
  } catch (e: any) {
    deps.logger.warn?.('grounded-qa', '示例问题翻译失败，本次不展示示例', { error: String(e?.message || e) });
    return;
  }

  const kept: string[] = [];
  for (const q of translated) {
    const r = await answerQuestion(deps, kb, q, []);
    if (!r.answered) continue;
    kb.setCachedAnswer(q, r);   // 顺手把答案也存下来，点下去仍是秒回
    kept.push(q);
  }
  if (kept.length) kb.setSuggestionCache(lang, kept);
  deps.logger.info?.('grounded-qa', '示例问题已按界面语言准备好', { lang, kept: kept.length, tried: translated.length });
}
