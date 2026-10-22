var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.cache/solutions-build/workbench-grounded-qa/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-grounded-qa/src/main/ipc/groundedQa.ipc.ts
var import_node_fs2 = require("node:fs");
var import_electron = require("electron");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n2 = require("npm:@totalclaw/i18n");

// ../../../totalclaw-solutions/solutions/workbench-grounded-qa/src/main/services/groundedQaStore.ts
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_crypto = require("node:crypto");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");
var import_i18n = require("npm:@totalclaw/i18n");
var import_groundedQa = require("host:apps/desktop-shell/src/main/services/groundedQa.logic.ts");
var PARSER_VERSION = 2;
var KB_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];
function needsOcr(text) {
  const t = (text || "").trim();
  if (t.length < 200) return true;
  const doubled = t.match(/([\u4e00-\u9fff])\1/g)?.length ?? 0;
  return doubled > t.length / 40;
}
var GroundedQaStore = class {
  constructor(extract, ocr) {
    this.extract = extract;
    this.ocr = ocr;
    this.load();
  }
  docs = [];
  pages = [];
  dir(...sub) {
    const d = (0, import_accountScope.accountPath)("grounded-qa", ...sub);
    (0, import_node_fs.mkdirSync)((0, import_node_path.join)(d, ".."), { recursive: true });
    return d;
  }
  get docsFile() {
    return this.dir("docs.json");
  }
  get pagesFile() {
    return this.dir("pages.json");
  }
  /** 用户选定的资料文件夹。独立存一份：换文件夹不该动已导入的资料与审批状态 */
  get folderFile() {
    return this.dir("folder.json");
  }
  /** 当前资料文件夹；没选过返回 null（调用方回落到自动探测） */
  getFolder() {
    try {
      if (!(0, import_node_fs.existsSync)(this.folderFile)) return null;
      const v = JSON.parse((0, import_node_fs.readFileSync)(this.folderFile, "utf8"))?.path;
      return typeof v === "string" && v ? v : null;
    } catch {
      return null;
    }
  }
  setFolder(dir) {
    (0, import_node_fs.writeFileSync)(this.folderFile, JSON.stringify({ path: dir, at: Date.now() }), "utf8");
  }
  load() {
    try {
      (0, import_node_fs.mkdirSync)(this.dir("files"), { recursive: true });
      if ((0, import_node_fs.existsSync)(this.docsFile)) this.docs = JSON.parse((0, import_node_fs.readFileSync)(this.docsFile, "utf8"));
      if ((0, import_node_fs.existsSync)(this.pagesFile)) this.pages = JSON.parse((0, import_node_fs.readFileSync)(this.pagesFile, "utf8"));
    } catch {
      this.docs = [];
      this.pages = [];
    }
  }
  save() {
    (0, import_node_fs.writeFileSync)(this.docsFile, JSON.stringify(this.docs), "utf8");
    (0, import_node_fs.writeFileSync)(this.pagesFile, JSON.stringify(this.pages), "utf8");
  }
  list() {
    return [...this.docs];
  }
  /**
   * 与知识手册文件夹对齐：文件夹里有、库里没有的就导入（**默认已审批** —— 放进手册
   * 文件夹这个动作本身就是机构的发布决定，界面上审批面板默认也是收起的）。
   *
   * 库里已有的保持原审批状态：用户在面板里手动关掉的，不能因为重启又被打开。
   * 早期手动导入的同名资料（没有 source）直接认领，重复导入的多份只留一份
   * （优先留已审批的），否则审批列表里会出现两行一模一样的资料。
   * 文件夹里删掉的文件不跟着删库：检索用的是库里的逐页原文，不依赖原文件。
   */
  async syncFolder(dir, onProgress) {
    const files = (0, import_node_fs.readdirSync)(dir, { withFileTypes: true }).filter((e) => e.isFile() && !e.name.startsWith(".") && KB_EXTENSIONS.includes((0, import_node_path.extname)(e.name).toLowerCase())).map((e) => (0, import_node_path.join)(dir, e.name)).sort();
    const imported = [];
    for (const file of files) {
      const name = (0, import_node_path.basename)(file);
      const same = this.docs.filter((d) => d.source === file || !d.source && d.name === name).sort((a, b) => Number(b.approved) - Number(a.approved));
      if (same.length) {
        const keep = same[0];
        for (const dup of same.slice(1)) this.remove(dup.id);
        if ((keep.parser ?? 1) >= PARSER_VERSION) {
          keep.source = file;
          continue;
        }
        this.remove(keep.id);
        imported.push(await this.import(file, { approved: keep.approved, source: file, onProgress }));
        continue;
      }
      imported.push(await this.import(file, { approved: true, source: file, onProgress }));
    }
    this.save();
    return imported;
  }
  /** 导入一份资料：拷进账号目录 → 解析逐页文本 → 默认**未审批**。 */
  async import(filePath, opts = {}) {
    const id = (0, import_node_crypto.randomUUID)().slice(0, 8);
    const ext = (0, import_node_path.extname)(filePath).toLowerCase();
    const dst = (0, import_node_path.join)(this.dir("files"), `${id}${ext}`);
    (0, import_node_fs.copyFileSync)(filePath, dst);
    let parsed = await this.extract(dst);
    if (ext === ".pdf" && this.ocr) {
      const need = parsed.filter((p) => needsOcr(p.text)).map((p) => p.n);
      const ocred = need.length ? await this.ocr(dst, need, (done, total) => opts.onProgress?.({ file: (0, import_node_path.basename)(filePath), done, total })) : /* @__PURE__ */ new Map();
      parsed = (0, import_groundedQa.mergeParsedPages)(parsed, ocred);
    } else {
      parsed = (0, import_groundedQa.mergeParsedPages)(parsed, /* @__PURE__ */ new Map());
    }
    const usable = parsed.filter((p) => (p.text || "").trim().length > 40);
    const name = (0, import_node_path.basename)(filePath);
    const doc = {
      id,
      name,
      ext,
      pages: usable.length,
      chars: usable.reduce((n, p) => n + p.text.length, 0),
      approved: opts.approved === true,
      importedAt: Date.now(),
      parser: PARSER_VERSION,
      ...opts.source ? { source: opts.source } : {}
    };
    this.docs.unshift(doc);
    for (const p of usable) {
      this.pages.push({ docId: id, docTitle: name, page: p.n, text: p.text });
    }
    this.save();
    return doc;
  }
  /**
   * 换文件夹 = 换一套资料：先清空现有资料再导入新目录。
   * 不做「合并」——用户选了新目录就是要换一批资料，留着旧的会让「可回答范围」
   * 变成两个目录的并集，审批列表里还躺着已经删掉的文件，边界就说不清了。
   */
  async replaceFolder(dir, onProgress) {
    this.clearAll();
    this.setFolder(dir);
    return this.syncFolder(dir, onProgress);
  }
  /** 清空全部资料（含拷进账号目录的原件），只保留文件夹设置。 */
  clearAll() {
    for (const d of [...this.docs]) {
      try {
        (0, import_node_fs.unlinkSync)((0, import_node_path.join)(this.dir("files"), `${d.id}${d.ext}`));
      } catch {
      }
    }
    this.docs = [];
    this.pages = [];
    this.save();
  }
  /**
   * 示例问题：limit 个能答的 + 1 个答不上的（放在最后，用来演示拒答边界）。
   * 能不能答都用真实检索判定算出来，不靠人工维护。
   */
  suggestions(lang = "zh", limit = 4) {
    const scope = this.approvedPages();
    if (!scope.length) return [];
    const cached = this.getSuggestionCache(lang);
    const base = cached ?? (lang === "zh" ? (0, import_groundedQa.suggestQuestions)(scope, limit) : (0, import_groundedQa.suggestLatinQuestions)(scope, limit));
    const inScope = base.map((q) => ({ q, inScope: true }));
    const outQ = (0, import_groundedQa.pickOutOfScopeQuestion)(scope, lang);
    return outQ ? [...inScope, { q: outQ, inScope: false }] : inScope;
  }
  get suggestionsFile() {
    return this.dir("suggestions.json");
  }
  /** 某种语言下已验证可答的示例问题（翻译后逐条跑过真实提问才会写进来）。 */
  getSuggestionCache(lang) {
    try {
      if (!(0, import_node_fs.existsSync)(this.suggestionsFile)) return null;
      const box = JSON.parse((0, import_node_fs.readFileSync)(this.suggestionsFile, "utf8"));
      if (box.fingerprint !== this.fingerprint()) return null;
      const list = box.byLang?.[lang];
      return Array.isArray(list) && list.length ? list : null;
    } catch {
      return null;
    }
  }
  setSuggestionCache(lang, questions) {
    let box = { fingerprint: this.fingerprint(), byLang: {} };
    try {
      if ((0, import_node_fs.existsSync)(this.suggestionsFile)) {
        const prev = JSON.parse((0, import_node_fs.readFileSync)(this.suggestionsFile, "utf8"));
        if (prev.fingerprint === box.fingerprint) box = prev;
      }
    } catch {
    }
    box.byLang[lang] = questions;
    (0, import_node_fs.writeFileSync)(this.suggestionsFile, JSON.stringify(box), "utf8");
  }
  approvedPages() {
    const approvedIds = new Set(this.docs.filter((d) => d.approved).map((d) => d.id));
    return this.pages.filter((p) => approvedIds.has(p.docId));
  }
  /**
   * 资料指纹：资料集合或审批状态一变就变。
   * 预取的答案挂在这个指纹上 —— 换了资料、关掉某份资料的审批，旧答案立刻失效，
   * 否则会出现「这份资料已经不让用了，点示例问题还照旧答出来」。
   */
  fingerprint() {
    const sig = this.docs.map((d) => `${d.id}:${d.approved ? 1 : 0}:${d.pages}`).sort().join("|");
    return (0, import_node_crypto.createHash)("sha1").update(sig).digest("hex").slice(0, 16);
  }
  get answersFile() {
    return this.dir("answers.json");
  }
  /** 取预取好的答案；资料指纹对不上就当没有。 */
  getCachedAnswer(question) {
    try {
      if (!(0, import_node_fs.existsSync)(this.answersFile)) return null;
      const box = JSON.parse((0, import_node_fs.readFileSync)(this.answersFile, "utf8"));
      if (box.fingerprint !== this.fingerprint()) return null;
      return box.answers[question.trim()] ?? null;
    } catch {
      return null;
    }
  }
  setCachedAnswer(question, value) {
    let box = { fingerprint: this.fingerprint(), answers: {} };
    try {
      if ((0, import_node_fs.existsSync)(this.answersFile)) {
        const prev = JSON.parse((0, import_node_fs.readFileSync)(this.answersFile, "utf8"));
        if (prev.fingerprint === box.fingerprint) box = prev;
      }
    } catch {
    }
    box.answers[question.trim()] = value;
    (0, import_node_fs.writeFileSync)(this.answersFile, JSON.stringify(box), "utf8");
  }
  /** 审批开关。未审批的资料检索不到 —— 这是现场要演示的边界之一。 */
  setApproved(docId, approved) {
    const d = this.docs.find((x) => x.id === docId);
    if (!d) throw new Error((0, import_i18n.t)("\u8D44\u6599\u4E0D\u5B58\u5728"));
    d.approved = approved;
    this.save();
  }
  remove(docId) {
    const i = this.docs.findIndex((x) => x.id === docId);
    if (i < 0) throw new Error((0, import_i18n.t)("\u8D44\u6599\u4E0D\u5B58\u5728"));
    const [d] = this.docs.splice(i, 1);
    this.pages = this.pages.filter((p) => p.docId !== docId);
    try {
      (0, import_node_fs.unlinkSync)((0, import_node_path.join)(this.dir("files"), `${d.id}${d.ext}`));
    } catch {
    }
    this.save();
  }
  /**
   * 提问。**只在已审批资料里检索**；判定完全交给 logic 层。
   * 返回提示词与引用，由调用方拿去过模型 —— 拒答时 prompt 为空，压根不调模型。
   *
   * searchQueries：检索改写后的独立问题（中文版/英文版）。给了就用它们检索；
   * 原问题只参与禁区判定 —— 追问「那具体怎么做？」本身检索只会蹭到高频虚词，用它的命中反而是错的。
   * 禁区对原问题和每条改写都判：阿语提问绕得过中文禁区表，改写成中文后就绕不过了。
   *
   * expandQueries：模型给的同义词/相关术语。**只用来补召回，不参与放行** —— 至少一条问题本身
   * 过了证据判定才会用它们捞更多相关页，否则模型自己加的词就能把资料之外的问题「凑」成有依据。
   *
   * 多路命中按名次融合（fuseHits），最多 MAX_CONTEXT_PAGES 页给模型：问题问得宽时答案散在好几页，
   * 只取一路的前几页就会答不全。
   */
  ask(question, opts = {}) {
    const approvedIds = new Set(this.docs.filter((d) => d.approved).map((d) => d.id));
    const scope = this.pages.filter((p) => approvedIds.has(p.docId));
    const decideOpts = {
      canRead: opts.canRead !== false,
      forbidden: (0, import_groundedQa.compilePatterns)(opts.forbiddenPatterns),
      refusalMessage: opts.refusalMessage,
      minScore: opts.minScore
    };
    const queries = opts.searchQueries?.length ? opts.searchQueries : [question];
    const refuse = (d) => ({ answered: false, refusal: d.message, reason: d.reason, citations: [] });
    const raw = (0, import_groundedQa.decide)(scope, question, decideOpts);
    if (raw.reason === "restricted" || raw.reason === "out_of_scope") return refuse(raw);
    const allowed = [];
    let firstRefusal;
    for (const q of queries) {
      const d = q === question ? raw : (0, import_groundedQa.decide)(scope, q, decideOpts);
      if (d.reason === "out_of_scope") return refuse(d);
      if (d.allowed) allowed.push({ q, d });
      else firstRefusal ??= d;
    }
    if (!allowed.length) return refuse(firstRefusal ?? raw);
    const fused = (0, import_groundedQa.fuseHits)([
      ...allowed.map((a) => a.d.hits),
      ...(opts.expandQueries || []).map((kw) => (0, import_groundedQa.search)(scope, kw))
    ], import_groundedQa.MAX_CONTEXT_PAGES);
    const hits = (0, import_groundedQa.withNextPages)(fused, scope, allowed[0].q);
    const standalone = allowed.find((a) => a.q !== question)?.q ?? question;
    return {
      answered: true,
      prompt: (0, import_groundedQa.buildPrompt)(question, hits, opts.lang || "zh", opts.history, standalone),
      citations: hits.map((h) => ({ docName: h.docTitle, page: h.page, snippet: h.snippet }))
    };
  }
};
function findHandbookDir(desktop) {
  const isHandbook = (name) => name === "\u5BA3\u6559\u52A9\u624B\u77E5\u8BC6\u624B\u518C";
  const dirsIn = (d) => {
    try {
      return (0, import_node_fs.readdirSync)(d, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith("."));
    } catch {
      return [];
    }
  };
  const top = dirsIn(desktop);
  const direct = top.find((e) => isHandbook(e.name));
  if (direct) return (0, import_node_path.join)(desktop, direct.name);
  for (const sub of top) {
    const hit = dirsIn((0, import_node_path.join)(desktop, sub.name)).find((e) => isHandbook(e.name));
    if (hit) return (0, import_node_path.join)(desktop, sub.name, hit.name);
  }
  return null;
}

// ../../../totalclaw-solutions/solutions/workbench-grounded-qa/src/main/ipc/groundedQa.ipc.ts
var import_pdfOcr = require("host:apps/desktop-shell/src/main/services/pdfOcr.ts");
var import_groundedQa2 = require("host:apps/desktop-shell/src/main/services/groundedQa.logic.ts");
var import_eduHubStore = require("host:apps/desktop-shell/src/main/services/eduHubStore.ts");
var import_councilChatRouter = require("host:apps/desktop-shell/src/main/services/councilChatRouter.ts");
var store;
var syncing;
var prefetching;
function sendProgress(p) {
  try {
    const win = import_electron.BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());
    win?.webContents?.send("grounded-qa:import-progress", p);
  } catch {
  }
}
var LOCALE_OF = { zh: "zh-CN", en: "en-US", ar: "ar" };
function uiLang() {
  const l = (0, import_i18n2.getLocale)();
  return l === "ar" ? "ar" : l === "en-US" ? "en" : "zh";
}
function sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(-import_groundedQa2.MAX_HISTORY_TURNS).map((h) => ({
    question: String(h?.question || "").slice(0, 500),
    ...h?.answer ? { answer: String(h.answer).slice(0, 2e3) } : {}
  })).filter((h) => h.question.trim());
}
function registerGroundedQaHandlers(deps) {
  const ensure = () => store ??= new GroundedQaStore(import_eduHubStore.extractDocumentPages, import_pdfOcr.ocrPdfPages);
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_GQA_LIST, async () => {
    const kb = ensure();
    if (kb.list().some((d) => d.approved)) prefetchSuggestions(deps, kb);
    return {
      docs: kb.list(),
      folder: currentFolder(),
      // 示例问题从当前资料里算出来：换了资料就换一批，不会出现「点了就拒答」。
      // ready=true 表示答案已经预取好，点下去秒回。
      suggestions: kb.suggestions(uiLang()).map((sg) => ({ ...sg, ready: !!kb.getCachedAnswer(sg.q) }))
    };
  });
  const currentFolder = () => ensure().getFolder() ?? findHandbookDir(import_electron.app.getPath("desktop"));
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_GQA_IMPORT, async () => {
    syncing ??= (async () => {
      const folder = currentFolder();
      if (!folder || !(0, import_node_fs2.existsSync)(folder)) return { imported: [], folder: null };
      const kb = ensure();
      const imported = await kb.syncFolder(folder, (p) => {
        sendProgress(p);
      });
      prefetchSuggestions(deps, kb);
      if (imported.length) deps.logger.audit?.("grounded-qa", (0, import_i18n2.t)("\u5BFC\u5165\u8D44\u6599"), { count: imported.length, folder });
      return { imported, folder };
    })().finally(() => {
      syncing = void 0;
    });
    return syncing;
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_GQA_PICK_FOLDER, async () => {
    const r = await import_electron.dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
      defaultPath: currentFolder() ?? import_electron.app.getPath("desktop"),
      title: (0, import_i18n2.t)("\u9009\u62E9\u8D44\u6599\u6587\u4EF6\u5939")
    });
    if (r.canceled || !r.filePaths.length) return { canceled: true, folder: currentFolder(), imported: [] };
    const folder = r.filePaths[0];
    const kb = ensure();
    const imported = await kb.replaceFolder(folder, (p) => {
      sendProgress(p);
    });
    deps.logger.audit?.("grounded-qa", (0, import_i18n2.t)("\u66F4\u6362\u8D44\u6599\u6587\u4EF6\u5939"), { folder, imported: imported.length });
    prefetchSuggestions(deps, kb);
    return {
      canceled: false,
      folder,
      imported,
      suggestions: kb.suggestions(uiLang()).map((sg) => ({ ...sg, ready: !!kb.getCachedAnswer(sg.q) }))
    };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_GQA_APPROVE, async (_e, p) => {
    const kb = ensure();
    kb.setApproved(String(p?.id || ""), !!p?.approved);
    deps.logger.audit?.("grounded-qa", (0, import_i18n2.t)("\u8D44\u6599\u5BA1\u6279\u72B6\u6001\u53D8\u66F4"), { id: p?.id, approved: p?.approved });
    prefetchSuggestions(deps, kb);
    return { ok: true };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_GQA_REMOVE, async (_e, p) => {
    ensure().remove(String(p?.id || ""));
    deps.logger.audit?.("grounded-qa", (0, import_i18n2.t)("\u5220\u9664\u8D44\u6599"), { id: p?.id });
    return { ok: true };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_GQA_ASK, async (_e, p) => {
    const q = String(p?.question || "").trim();
    if (!q) throw new Error((0, import_i18n2.t)("\u8BF7\u8F93\u5165\u95EE\u9898"));
    const history = sanitizeHistory(p?.history);
    if (!history.length) {
      const hit = ensure().getCachedAnswer(q);
      if (hit) {
        deps.logger.info?.("grounded-qa", "\u547D\u4E2D\u9884\u53D6\u7B54\u6848", { q: q.slice(0, 40) });
        return { ...hit, cached: true };
      }
    }
    return answerQuestion(deps, ensure(), q, history);
  });
}
async function rewriteQuestion(deps, question, history) {
  try {
    const raw = await (0, import_councilChatRouter.runOneshotChat)(deps, (0, import_groundedQa2.buildRewritePrompt)(question, history), { plainCompletion: true, timeoutMs: 45e3 });
    return (0, import_groundedQa2.parseRewrite)(raw);
  } catch (e) {
    deps.logger.warn?.("grounded-qa", "\u68C0\u7D22\u6539\u5199\u5931\u8D25\uFF0C\u8D70\u515C\u5E95\u68C0\u7D22", { error: String(e?.message || e) });
    return { queries: [], keywords: [] };
  }
}
async function answerQuestion(deps, kb, q, history) {
  const ui = (0, import_i18n2.getLocale)();
  const lang = (0, import_groundedQa2.detectLang)(q) ?? (0, import_groundedQa2.detectLang)(history[history.length - 1]?.question || "") ?? (ui === "ar" ? "ar" : ui === "en-US" ? "en" : "zh");
  const locale = LOCALE_OF[lang];
  const noEvidence = (why) => {
    deps.logger.audit?.("grounded-qa", (0, import_i18n2.t)("\u62D2\u7B54"), { reason: "no_evidence", lang, ...why });
    return { answered: false, refusal: (0, import_i18n2.tIn)(locale, import_groundedQa2.NO_EVIDENCE_MESSAGE), reason: "no_evidence", citations: [], lang };
  };
  try {
    let r = kb.ask(q, { lang });
    if (r.answered || r.reason === "no_evidence") {
      const { queries: rewrites, keywords } = await rewriteQuestion(deps, q, history);
      const queries = [.../* @__PURE__ */ new Set([q, ...rewrites])];
      const fallback = history.length ? [q, `${history[history.length - 1].question} ${q}`] : [q];
      r = kb.ask(q, {
        lang,
        history,
        searchQueries: queries.length ? queries : fallback,
        expandQueries: keywords.length ? [keywords.join(" ")] : []
      });
      deps.logger.info?.("grounded-qa", "\u68C0\u7D22", {
        queries: queries.length ? queries : fallback,
        keywords,
        pages: r.citations.map((c) => `${c.docName}#${c.page}`)
      });
    }
    if (!r.answered) {
      if (r.reason === "no_evidence") return noEvidence({ by: "retrieval" });
      deps.logger.audit?.("grounded-qa", (0, import_i18n2.t)("\u62D2\u7B54"), { reason: r.reason, lang });
      return { answered: false, refusal: (0, import_i18n2.tIn)(locale, r.refusal || ""), reason: r.reason, citations: [], lang };
    }
    const reply = await (0, import_councilChatRouter.runOneshotChat)(deps, r.prompt, { plainCompletion: true, timeoutMs: 12e4, responseLocale: locale });
    if (/^\s*⚠/.test(reply)) return noEvidence({ by: "model_error", error: reply.slice(0, 200) });
    const parsed = (0, import_groundedQa2.parseAnswer)(reply, r.citations.length);
    if (parsed.noAnswer) return noEvidence({ by: "model" });
    const citations = parsed.used.map((i) => r.citations[i]);
    deps.logger.audit?.("grounded-qa", (0, import_i18n2.t)("\u4F5C\u7B54"), { citations: citations.length, lang, turns: history.length + 1 });
    return { answered: true, answer: parsed.text, citations, lang };
  } catch (e) {
    deps.logger.warn?.("grounded-qa", "\u4F5C\u7B54\u5931\u8D25\uFF0C\u6309\u8D44\u6599\u4E2D\u65E0\u4F9D\u636E\u62D2\u7B54", { error: String(e?.message || e) });
    return noEvidence({ by: "error" });
  }
}
function prefetchSuggestions(deps, kb) {
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
      deps.logger.info?.("grounded-qa", "\u793A\u4F8B\u95EE\u9898\u5DF2\u9884\u53D6", { q: s.q.slice(0, 30), ms: Date.now() - t0, answered: r.answered });
      sendSuggestionsReady(kb);
    }
  })().catch((e) => {
    deps.logger.warn?.("grounded-qa", "\u793A\u4F8B\u95EE\u9898\u9884\u53D6\u5931\u8D25\uFF08\u4E0D\u5F71\u54CD\u73B0\u573A\u63D0\u95EE\uFF09", { error: String(e?.message || e) });
  }).finally(() => {
    prefetching = void 0;
  });
}
function sendSuggestionsReady(kb) {
  try {
    const ready = kb.suggestions(uiLang()).filter((s) => !!kb.getCachedAnswer(s.q)).map((s) => s.q);
    const win = import_electron.BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());
    win?.webContents?.send("grounded-qa:suggestions-ready", { ready });
  } catch {
  }
}
async function ensureSuggestionsInLang(deps, kb, lang) {
  if (lang === "zh") return;
  if (kb.getSuggestionCache(lang)) return;
  const have = kb.suggestions(lang).filter((s) => s.inScope);
  if (have.length >= 4) return;
  const zhCandidates = kb.suggestions("zh").filter((s) => s.inScope).map((s) => s.q);
  if (!zhCandidates.length) return;
  const target = lang === "ar" ? (0, import_i18n2.t)("\u963F\u62C9\u4F2F\u8BED") : (0, import_i18n2.t)("\u82F1\u8BED");
  let translated = [];
  try {
    const raw = await (0, import_councilChatRouter.runOneshotChat)(deps, [
      (0, import_i18n2.t)("\u628A\u4E0B\u9762\u6BCF\u4E2A\u95EE\u9898\u7FFB\u8BD1\u6210{target}\uFF0C\u4E00\u884C\u4E00\u4E2A\uFF0C\u53EA\u8F93\u51FA\u8BD1\u6587\uFF0C\u4E0D\u8981\u7F16\u53F7\u3001\u4E0D\u8981\u89E3\u91CA\u3002", { target }),
      "",
      ...zhCandidates
    ].join("\n"), { plainCompletion: true, timeoutMs: 45e3 });
    translated = raw.split("\n").map((x) => x.replace(/^\s*[-*\d.、)]+\s*/, "").trim()).filter(Boolean).slice(0, zhCandidates.length);
  } catch (e) {
    deps.logger.warn?.("grounded-qa", "\u793A\u4F8B\u95EE\u9898\u7FFB\u8BD1\u5931\u8D25\uFF0C\u672C\u6B21\u4E0D\u5C55\u793A\u793A\u4F8B", { error: String(e?.message || e) });
    return;
  }
  const kept = [];
  for (const q of translated) {
    const r = await answerQuestion(deps, kb, q, []);
    if (!r.answered) continue;
    kb.setCachedAnswer(q, r);
    kept.push(q);
  }
  if (kept.length) kb.setSuggestionCache(lang, kept);
  deps.logger.info?.("grounded-qa", "\u793A\u4F8B\u95EE\u9898\u5DF2\u6309\u754C\u9762\u8BED\u8A00\u51C6\u5907\u597D", { lang, kept: kept.length, tried: translated.length });
}

// node_modules/.cache/solutions-build/workbench-grounded-qa/entry.main.ts
var hostApi = 2;
var registerFunction = "registerGroundedQaHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerGroundedQaHandlers(ctx.host.deps);
}
async function deactivate() {
  const c = cleanup;
  cleanup = void 0;
  if (typeof c === "function") await c();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate,
  hostApi,
  registerFunction
});
