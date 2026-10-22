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

// node_modules/.cache/solutions-build/workbench-charity-content/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/ipc/charityContent.ipc.ts
var import_electron2 = require("electron");
var import_node_fs3 = require("node:fs");
var import_node_os = require("node:os");
var import_node_path5 = require("node:path");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n6 = require("npm:@totalclaw/i18n");
var import_userFacingError = require("host:apps/desktop-shell/src/main/utils/userFacingError.ts");

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/services/charityContent/runtime.ts
var import_electron = require("electron");
var import_node_path = require("node:path");
var import_i18n = require("npm:@totalclaw/i18n");
var import_qiyeApiBridge = require("host:apps/desktop-shell/src/main/services/qiyeApiBridge.ts");
var import_councilChatRouter = require("host:apps/desktop-shell/src/main/services/councilChatRouter.ts");
var import_qiyeApiClient = require("host:apps/desktop-shell/src/main/services/qiyeApiClient.ts");
var import_mediaFal = require("host:apps/desktop-shell/src/main/ipc/mediaFal.ipc.ts");
var import_ttsRouter = require("host:apps/desktop-shell/src/main/services/media/ttsRouter.ts");
var import_falProvider = require("host:apps/desktop-shell/src/main/services/media/falProvider.ts");
var import_falBridge = require("host:apps/desktop-shell/src/main/services/charityContent/falBridge.ts");
var import_render = require("host:apps/desktop-shell/src/main/services/charityContent/render.ts");
var CHARITY_SOLUTION_ID = "workbench-charity-content";
function createCharityRuntime(deps, agentHome) {
  const NO_MODEL_MSG = (0, import_i18n.t)("\u8BF7\u5148\u5728\u8BBE\u7F6E \u2192 \u6A21\u578B\u91CC\u9009\u62E9\u9ED8\u8BA4\u6A21\u578B");
  const defaultProviderSlug = () => ((0, import_qiyeApiBridge.getConfiguredDefaultProvider)() || String(deps.appConfig?.brain?.profiles?.default?.provider || "")).trim();
  const requireDefaultModel = () => {
    if (!defaultProviderSlug()) throw new Error(NO_MODEL_MSG);
  };
  function falFacade() {
    const hasKey = (() => {
      try {
        return (0, import_falProvider.resolveFalKeys)(agentHome(), void 0, CHARITY_SOLUTION_ID).length > 0;
      } catch {
        return false;
      }
    })();
    if (!hasKey) return { run: null, tts: null, upload: null };
    return {
      run: (req, signal, onProgress) => (0, import_mediaFal.runFalJob)(deps, { ...req, solutionId: CHARITY_SOLUTION_ID }, { signal, onProgress }),
      // 钉上本方案 id：只有「按方案下发」的服务端 key 时，语音也要按本方案去取 key
      tts: (0, import_ttsRouter.bindTtsRouterToSolution)((0, import_ttsRouter.getTtsRouter)(), CHARITY_SOLUTION_ID),
      upload: (path, signal) => (0, import_mediaFal.uploadFalFile)(deps, path, { solutionId: CHARITY_SOLUTION_ID, signal })
    };
  }
  async function vision(imagePath, prompt, signal) {
    const errors = [];
    const fal = falFacade();
    if (fal.run) {
      try {
        const r = await fal.run((0, import_falBridge.visionRequest)(imagePath, prompt, (0, import_node_path.join)(import_electron.app.getPath("temp"), "charity-vision")), signal);
        const text2 = String(r.text || r.result?.output || "").trim();
        if (text2) return text2;
        errors.push("fal vision: empty");
      } catch (e) {
        if (signal?.aborted) throw e;
        errors.push(`fal vision: ${String(e?.message || e).slice(0, 160)}`);
      }
    }
    const imageDataUrl = (0, import_render.imageToDataUrl)(imagePath, 1280);
    if (imageDataUrl) {
      try {
        const r = await import_qiyeApiBridge.qiyeApiBridge.chatCompletionsForVision({ imageDataUrl, prompt, signal, timeoutMs: 12e4, maxTokens: 900 });
        if (r.text.trim()) return r.text;
        errors.push("brain vision: empty");
      } catch (e) {
        if (signal?.aborted) throw e;
        errors.push(`brain vision: ${String(e?.message || e).slice(0, 160)}`);
      }
      const proc = deps.qiyeApiProc;
      const provider = defaultProviderSlug();
      if (proc && proc.getStatus() === "ready" && provider) {
        try {
          const client = new import_qiyeApiClient.QiyeApiClient({ baseUrl: proc.getBaseUrl(), getBearerToken: () => proc.getBearerToken(), defaultTimeoutMs: 18e4 });
          const res = await client.post("/v1/vlm", { provider, operation: "ask", imageUrl: imageDataUrl, question: prompt, prompt }, 18e4, void 0, signal);
          const text2 = String(res?.text ?? res?.result ?? res?.content ?? "").trim();
          if (text2) return text2;
        } catch (e2) {
          if (signal?.aborted) throw e2;
          errors.push(`/v1/vlm: ${String(e2?.message || e2).slice(0, 160)}`);
        }
      }
    }
    deps.logger?.warn?.("charity-content", "\u770B\u56FE\u4E09\u6761\u901A\u9053\u5747\u4E0D\u53EF\u7528", { errors });
    throw new Error(fal.run ? (0, import_i18n.t)("\u770B\u56FE\u5931\u8D25\uFF1A{why}", { why: errors[0] || "" }) : (0, import_i18n.t)("\u5F53\u524D\u9ED8\u8BA4\u6A21\u578B\u65E0\u6CD5\u8BFB\u56FE\uFF0C\u4E14\u672A\u914D\u7F6E fal \u5BC6\u94A5\uFF08\u8BBE\u7F6E \u2192 \u5A92\u4F53\u6A21\u578B\uFF09"));
  }
  const text = async (prompt, opts) => {
    requireDefaultModel();
    return (0, import_councilChatRouter.runOneshotChat)(deps, prompt, { plainCompletion: true, timeoutMs: opts.timeoutMs ?? 12e4, signal: opts.signal });
  };
  return { defaultProviderSlug, requireDefaultModel, falFacade, vision, text };
}

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/ipc/charityContent.ipc.ts
var import_agentPython = require("host:apps/desktop-shell/src/main/services/agentPython.ts");
var import_mediaModelConfig = require("host:apps/desktop-shell/src/main/services/mediaModelConfig.ts");
var import_ffmpegPath = require("host:apps/desktop-shell/src/main/services/ffmpegPath.ts");
var import_runtimeLocation = require("host:apps/desktop-shell/src/main/services/runtimeLocation.ts");
var import_mediaProtocol = require("host:apps/desktop-shell/src/main/services/mediaProtocol.ts");
var import_documentExtractor = require("host:apps/desktop-shell/src/main/services/documentExtractor.ts");
var import_archive2 = require("host:apps/desktop-shell/src/main/services/charityContent/archive.ts");
var import_media = require("host:apps/desktop-shell/src/main/services/charityContent/media.ts");
var import_pipeline2 = require("host:apps/desktop-shell/src/main/services/charityContent/pipeline.ts");

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/services/charityContent/prebaked.ts
var import_node_fs = require("node:fs");
var import_node_path2 = require("node:path");
var import_i18n3 = require("npm:@totalclaw/i18n");
var import_archive = require("host:apps/desktop-shell/src/main/services/charityContent/archive.ts");
var import_reportText = require("host:apps/desktop-shell/src/main/services/charityContent/reportText.ts");

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/services/charityContent/demoPack.ts
var import_crypto = require("crypto");
var import_fs = require("fs");
var import_path = require("path");
var import_tar = require("npm:tar");
var import_stream = require("stream");
var import_promises = require("stream/promises");
var import_i18n2 = require("npm:@totalclaw/i18n");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");
var DEFAULT_BASE_URL = "https://cdn.taituai.com/demo/charity-demo-pack-2026-09-20";
var DEMO_PACK_MANIFEST_REL = (0, import_path.join)("bundled-solutions", "charity-content", "charity-demo-pack.json");
function readDemoPackManifest(resourcesDir) {
  try {
    const p = (0, import_path.join)(resourcesDir, DEMO_PACK_MANIFEST_REL);
    if (!(0, import_fs.existsSync)(p)) return null;
    const m = JSON.parse((0, import_fs.readFileSync)(p, "utf8"));
    if (!m?.version || !Array.isArray(m.files) || !m.files.length) return null;
    return m;
  } catch {
    return null;
  }
}
function demoPackBaseUrl(manifest) {
  const env = String(process.env.TOTALCLAW_CHARITY_DEMO_BASE_URL || "").trim();
  return (env || manifest?.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}
function demoPackDir(version) {
  try {
    return (0, import_path.join)((0, import_accountScope.accountPath)("charity-content"), "demo-pack", version);
  } catch {
    return "";
  }
}
function fileOk(path, f) {
  try {
    if (!(0, import_fs.existsSync)(path) || (0, import_fs.statSync)(path).size !== f.bytes) return false;
    return (0, import_crypto.createHash)("sha256").update((0, import_fs.readFileSync)(path)).digest("hex") === f.sha256;
  } catch {
    return false;
  }
}
function demoPackStatus(resourcesDir) {
  const m = readDemoPackManifest(resourcesDir);
  if (!m) {
    return { version: "", ready: false, missing: 0, totalFiles: 0, totalBytes: 0, localBytes: 0, dir: "", baseUrl: "" };
  }
  const dir = demoPackDir(m.version);
  if (!dir) {
    return {
      version: m.version,
      ready: false,
      missing: m.files.length,
      totalFiles: m.files.length,
      totalBytes: m.totalBytes,
      localBytes: 0,
      dir: "",
      baseUrl: demoPackBaseUrl(m)
    };
  }
  let missing = 0;
  let localBytes = 0;
  for (const f of m.files) {
    const p = (0, import_path.join)(dir, f.name);
    try {
      if ((0, import_fs.existsSync)(p) && (0, import_fs.statSync)(p).size === f.bytes) {
        localBytes += f.bytes;
        continue;
      }
    } catch {
    }
    missing += 1;
  }
  return {
    version: m.version,
    ready: missing === 0,
    missing,
    totalFiles: m.files.length,
    totalBytes: m.totalBytes,
    localBytes,
    dir,
    baseUrl: demoPackBaseUrl(m)
  };
}
async function fetchOne(url, dst, f, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok || !res.body) throw new Error((0, import_i18n2.t)("\u4E0B\u8F7D\u5931\u8D25\uFF08HTTP {code}\uFF09\uFF1A{name}", { code: String(res.status), name: f.name }));
  const part = `${dst}.part`;
  (0, import_fs.mkdirSync)((0, import_path.join)(dst, ".."), { recursive: true });
  await (0, import_promises.pipeline)(import_stream.Readable.fromWeb(res.body), (0, import_fs.createWriteStream)(part));
  if (!fileOk(part, f)) {
    (0, import_fs.rmSync)(part, { force: true });
    throw new Error((0, import_i18n2.t)("\u6821\u9A8C\u4E0D\u901A\u8FC7\uFF0C\u5DF2\u4E22\u5F03\uFF1A{name}", { name: f.name }));
  }
  (0, import_fs.renameSync)(part, dst);
}
function demoPackArchiveName(m) {
  return m.archiveName || `charity-demo-pack-${m.version}.tar.gz`;
}
async function fetchArchive(base, m, dir, opts) {
  const name = demoPackArchiveName(m);
  const url = `${base}/${encodeURIComponent(name)}`;
  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok || !res.body) throw new Error((0, import_i18n2.t)("\u4E0B\u8F7D\u5931\u8D25\uFF08HTTP {code}\uFF09\uFF1A{name}", { code: String(res.status), name }));
  const staging = (0, import_path.join)(dir, ".staging");
  (0, import_fs.rmSync)(staging, { recursive: true, force: true });
  (0, import_fs.mkdirSync)(staging, { recursive: true });
  const part = (0, import_path.join)(dir, `${name}.part`);
  let got = 0;
  const meter = new import_stream.Transform({
    transform(chunk, _enc, cb) {
      got += chunk.length;
      opts.onProgress?.({ done: 0, total: m.files.length, bytes: got, totalBytes: m.totalBytes, name });
      cb(null, chunk);
    }
  });
  try {
    await (0, import_promises.pipeline)(import_stream.Readable.fromWeb(res.body), meter, (0, import_fs.createWriteStream)(part));
    if (opts.signal?.aborted) throw new Error((0, import_i18n2.t)("\u5DF2\u53D6\u6D88"));
    await (0, import_tar.x)({ file: part, cwd: staging, strict: true, preservePaths: false, preserveOwner: false });
    let root = staging;
    if (!(0, import_fs.existsSync)((0, import_path.join)(staging, m.files[0].name))) {
      const entries = (0, import_fs.readdirSync)(staging, { withFileTypes: true }).filter((d) => !d.name.startsWith("."));
      if (entries.length === 1 && entries[0].isDirectory()) root = (0, import_path.join)(staging, entries[0].name);
    }
    let done = 0;
    let bytes = 0;
    for (const f of m.files) {
      if (opts.signal?.aborted) throw new Error((0, import_i18n2.t)("\u5DF2\u53D6\u6D88"));
      const src = (0, import_path.join)(root, f.name);
      if (!fileOk(src, f)) throw new Error((0, import_i18n2.t)("\u6821\u9A8C\u4E0D\u901A\u8FC7\uFF0C\u5DF2\u4E22\u5F03\uFF1A{name}", { name: f.name }));
      (0, import_fs.mkdirSync)((0, import_path.join)(dir, f.name, ".."), { recursive: true });
      (0, import_fs.rmSync)((0, import_path.join)(dir, f.name), { force: true });
      (0, import_fs.renameSync)(src, (0, import_path.join)(dir, f.name));
      done += 1;
      bytes += f.bytes;
      opts.onProgress?.({ done, total: m.files.length, bytes, totalBytes: m.totalBytes, name: f.name });
    }
  } finally {
    (0, import_fs.rmSync)(part, { force: true });
    (0, import_fs.rmSync)(staging, { recursive: true, force: true });
  }
}
async function ensureDemoPack(resourcesDir, opts = {}) {
  const m = readDemoPackManifest(resourcesDir);
  if (!m) throw new Error((0, import_i18n2.t)("\u5B89\u88C5\u5305\u91CC\u6CA1\u6709\u6F14\u793A\u6570\u636E\u6E05\u5355\uFF0C\u8BF7\u91CD\u65B0\u5B89\u88C5\u5E94\u7528"));
  const base = demoPackBaseUrl(m);
  if (!base) throw new Error((0, import_i18n2.t)("\u6F14\u793A\u5305\u5730\u5740\u672A\u914D\u7F6E\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u914D\u7F6E CDN \u5730\u5740"));
  const dir = demoPackDir(m.version);
  if (!dir) throw new Error((0, import_i18n2.t)("\u8D26\u53F7\u76EE\u5F55\u5C1A\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5148\u767B\u5F55\u540E\u518D\u4E0B\u8F7D\u6F14\u793A\u6570\u636E"));
  (0, import_fs.mkdirSync)(dir, { recursive: true });
  const need = m.files.filter((f) => {
    const p = (0, import_path.join)(dir, f.name);
    try {
      return !((0, import_fs.existsSync)(p) && (0, import_fs.statSync)(p).size === f.bytes);
    } catch {
      return true;
    }
  });
  let done = m.files.length - need.length;
  let bytes = m.files.reduce((a, f) => a + f.bytes, 0) - need.reduce((a, f) => a + f.bytes, 0);
  opts.onProgress?.({ done, total: m.files.length, bytes, totalBytes: m.totalBytes, name: "" });
  if (!need.length) return demoPackStatus(resourcesDir);
  if (need.length > 2) {
    try {
      await fetchArchive(base, m, dir, opts);
      return demoPackStatus(resourcesDir);
    } catch (e) {
      if (opts.signal?.aborted) throw e;
    }
  }
  for (const f of need) {
    if (opts.signal?.aborted) throw new Error((0, import_i18n2.t)("\u5DF2\u53D6\u6D88"));
    opts.onProgress?.({ done, total: m.files.length, bytes, totalBytes: m.totalBytes, name: f.name });
    await fetchOne(`${base}/${encodeURIComponent(f.name)}`, (0, import_path.join)(dir, f.name), f, opts.signal);
    done += 1;
    bytes += f.bytes;
    opts.onProgress?.({ done, total: m.files.length, bytes, totalBytes: m.totalBytes, name: f.name });
  }
  return demoPackStatus(resourcesDir);
}
function prebakedRoot(resourcesDir, bundledRoot) {
  const m = readDemoPackManifest(resourcesDir);
  try {
    if (m) {
      const dir = demoPackDir(m.version);
      if (dir && (0, import_fs.existsSync)((0, import_path.join)(dir, "report.json"))) return dir;
    }
  } catch {
  }
  return bundledRoot;
}

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/services/charityContent/prebaked.ts
var PREBAKED_REL = (0, import_node_path2.join)("bundled-solutions", "charity-content");
function existingByLang(dir, prefix, ext, suffix = "") {
  const out = {};
  for (const lang of import_archive.LANGS) {
    const p = (0, import_node_path2.join)(dir, `${prefix}-${lang}${suffix}.${ext}`);
    if ((0, import_node_fs.existsSync)(p)) out[lang] = p;
  }
  return out;
}
function loadPrebaked(resourcesDir) {
  const bundled = (0, import_node_path2.join)(resourcesDir, PREBAKED_REL);
  const root = prebakedRoot(resourcesDir, bundled);
  const pre = (0, import_node_fs.existsSync)((0, import_node_path2.join)(root, "report.json")) ? root : (0, import_node_path2.join)(root, "prebaked");
  let archive = null;
  try {
    const p = (0, import_node_fs.existsSync)((0, import_node_path2.join)(root, "demo-archive.json")) ? (0, import_node_path2.join)(root, "demo-archive.json") : (0, import_node_path2.join)(bundled, "demo-archive.json");
    if ((0, import_node_fs.existsSync)(p)) archive = (0, import_archive.normalizeArchive)(JSON.parse((0, import_node_fs.readFileSync)(p, "utf8")), void 0, "demo");
  } catch {
    archive = null;
  }
  let report = null;
  try {
    const p = (0, import_node_path2.join)(pre, "report.json");
    if ((0, import_node_fs.existsSync)(p)) report = (0, import_reportText.parseReport)((0, import_node_fs.readFileSync)(p, "utf8"));
  } catch {
    report = null;
  }
  let descriptions = [];
  try {
    const p = (0, import_node_path2.join)(pre, "descriptions.json");
    if ((0, import_node_fs.existsSync)(p)) {
      const arr = JSON.parse((0, import_node_fs.readFileSync)(p, "utf8"));
      if (Array.isArray(arr)) descriptions = arr.filter((d) => d && (d.kind === "image" || d.kind === "video")).map((d) => ({ kind: d.kind, description: (0, import_archive.toTri)(d.description) }));
    }
  } catch {
    descriptions = [];
  }
  return {
    root,
    archive,
    report,
    descriptions,
    pdf: existingByLang(pre, "report", "pdf"),
    poster: existingByLang(pre, "poster", "jpg"),
    speech: existingByLang(pre, "speech", "mp3"),
    video: existingByLang(pre, "video", "mp4"),
    videoAi: existingByLang(pre, "video", "mp4", "-ai")
  };
}
function mapPrebakedDescriptions(set, items) {
  const byKind = { image: [], video: [] };
  for (const d of set.descriptions) byKind[d.kind].push(d.description);
  const used = { image: 0, video: 0 };
  const out = [];
  for (const it of items) {
    const pool = byKind[it.kind].length ? byKind[it.kind] : byKind[it.kind === "image" ? "video" : "image"];
    if (!pool.length) continue;
    const idx = Math.min(used[it.kind], pool.length - 1);
    used[it.kind] += 1;
    out.push({ path: it.path, kind: it.kind, description: pool[idx] });
  }
  return out;
}
function prebakedComplete(set) {
  return !!set.archive && !!set.report && import_archive.LANGS.every((l) => set.pdf[l] && set.poster[l] && set.speech[l] && set.video[l]);
}
function copyPrebakedFiles(files, outDir, rename, opts = {}) {
  (0, import_node_fs.mkdirSync)(outDir, { recursive: true });
  const out = {};
  for (const lang of import_archive.LANGS) {
    const src = files[lang];
    if (!src || !(0, import_node_fs.existsSync)(src)) continue;
    const name = rename ? rename(lang, src) : (0, import_node_path2.basename)(src);
    let dst = (0, import_node_path2.join)(outDir, name);
    if (opts.neverOverwrite && (0, import_node_fs.existsSync)(dst)) dst = (0, import_node_path2.join)(outDir, (0, import_i18n3.t)("\u6F14\u793A-{name}", { name }));
    (0, import_node_fs.copyFileSync)(src, dst);
    out[lang] = dst;
  }
  return out;
}

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/ipc/charityContent.ipc.ts
var import_subtitles = require("host:apps/desktop-shell/src/main/services/charityContent/subtitles.ts");

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/services/charityContent/demoMaterials.ts
var import_node_fs2 = require("node:fs");
var import_node_path3 = require("node:path");
var import_i18n4 = require("npm:@totalclaw/i18n");
var import_matchTokens = require("host:apps/desktop-shell/src/shared/matchTokens.ts");
var DEMO_MATERIALS_REL = (0, import_node_path3.join)(PREBAKED_REL, "demo-materials");
var DEMO_MATERIALS_DIR_NAME = (0, import_matchTokens.matchLiteral)("\u6148\u5584\u6F14\u793A\u7D20\u6750");
var DEMO_FILE_RE = /\.(jpe?g|png|webp|mp4|mov|m4v|webm|pdf)$/i;
function demoMaterialsSourceDir(shellResources) {
  return (0, import_node_path3.join)(shellResources, DEMO_MATERIALS_REL);
}
function demoMaterialsTargetDir(documentsDir, appFolder = "TotalClaw") {
  return (0, import_node_path3.join)(documentsDir, appFolder, DEMO_MATERIALS_DIR_NAME);
}
var ARTICLE_DIR_NAME = (0, import_matchTokens.matchLiteral)("\u6148\u5584\u6587\u7AE0\u914D\u97F3");
function articleWorkDir(documentsDir, appFolder = "TotalClaw") {
  return (0, import_node_path3.join)(documentsDir, appFolder, ARTICLE_DIR_NAME);
}
function prepareDemoMaterials(srcDir, destDir) {
  const files = (0, import_node_fs2.existsSync)(srcDir) ? (0, import_node_fs2.readdirSync)(srcDir).filter((n) => !n.startsWith(".") && DEMO_FILE_RE.test(n)).sort() : [];
  if (!files.length) throw new Error((0, import_i18n4.t)("\u5B89\u88C5\u5305\u91CC\u6CA1\u6709\u6F14\u793A\u7D20\u6750\uFF0C\u8BF7\u91CD\u65B0\u5B89\u88C5\u5E94\u7528\uFF0C\u6216\u624B\u52A8\u9009\u62E9\u7D20\u6750\u76EE\u5F55"));
  (0, import_node_fs2.mkdirSync)(destDir, { recursive: true });
  const copied = [];
  const skipped = [];
  for (const name of files) {
    const src = (0, import_node_path3.join)(srcDir, name);
    const dst = (0, import_node_path3.join)(destDir, name);
    const size = (0, import_node_fs2.statSync)(src).size;
    if ((0, import_node_fs2.existsSync)(dst)) {
      const cur = (0, import_node_fs2.statSync)(dst);
      if (!cur.isFile() || cur.size === size) {
        skipped.push(name);
        continue;
      }
    }
    const part = `${dst}.part`;
    try {
      (0, import_node_fs2.copyFileSync)(src, part);
      (0, import_node_fs2.renameSync)(part, dst);
    } catch (e) {
      try {
        (0, import_node_fs2.rmSync)(part, { force: true });
      } catch {
      }
      throw e;
    }
    copied.push(name);
  }
  return { dir: destDir, copied, skipped };
}

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/ipc/charityContent.ipc.ts
var import_brandPaths = require("host:apps/desktop-shell/src/main/services/brandPaths.ts");
var import_render2 = require("host:apps/desktop-shell/src/main/services/charityContent/render.ts");

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/services/charityContent/validate.ts
var import_node_path4 = require("node:path");
var import_i18n5 = require("npm:@totalclaw/i18n");
var import_pipeline = require("host:apps/desktop-shell/src/main/services/charityContent/pipeline.ts");
var import_charityPrompts = require("host:apps/desktop-shell/src/shared/charityPrompts.ts");
var RUN_ID_RE = /^\d{8}-\d{6}$/;
function requireAbs(value, label) {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v || !(0, import_node_path4.isAbsolute)(v)) throw new Error((0, import_i18n5.t)("{label} \u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84", { label }));
  if (v.includes("\0")) throw new Error((0, import_i18n5.t)("{label} \u542B\u975E\u6CD5\u5B57\u7B26", { label }));
  return v;
}
function requireRunId(value) {
  const v = typeof value === "string" ? value.trim() : "";
  if (!RUN_ID_RE.test(v)) throw new Error((0, import_i18n5.t)("runId \u683C\u5F0F\u4E0D\u6B63\u786E"));
  return v;
}
function requireOutDir(value, runId) {
  const v = requireAbs(value, (0, import_i18n5.t)("\u8F93\u51FA\u76EE\u5F55"));
  if ((0, import_node_path4.basename)(v) !== runId || (0, import_node_path4.basename)((0, import_node_path4.dirname)(v)) !== import_pipeline.OUTPUT_DIR_NAME) throw new Error((0, import_i18n5.t)("\u8F93\u51FA\u76EE\u5F55\u4E0E\u672C\u6B21\u8FD0\u884C\u4E0D\u5339\u914D"));
  return v;
}
function requirePaths(value, label, max = 200) {
  if (!Array.isArray(value)) throw new Error((0, import_i18n5.t)("{label} \u5FC5\u987B\u662F\u8DEF\u5F84\u6570\u7EC4", { label }));
  if (value.length > max) throw new Error((0, import_i18n5.t)("{label} \u6570\u91CF\u8D85\u8FC7\u4E0A\u9650 {max}", { label, max }));
  return value.map((p, i) => requireAbs(p, `${label}[${i}]`));
}
var LANG_SET = /* @__PURE__ */ new Set(["zh", "en", "ar"]);
function requireLangs(value) {
  if (value === void 0) return ["zh", "en", "ar"];
  if (!Array.isArray(value)) throw new Error((0, import_i18n5.t)("langs \u5FC5\u987B\u662F\u6570\u7EC4"));
  const out = value.filter((l) => LANG_SET.has(l));
  if (!out.length) throw new Error((0, import_i18n5.t)("\u81F3\u5C11\u9009\u62E9\u4E00\u79CD\u8BED\u8A00"));
  return [...new Set(out)];
}
function requireQuality(value) {
  return value === "standard" ? "standard" : "hd";
}
function requireMode(value) {
  if (value === "ai" || value === "clip") return value;
  throw new Error((0, import_i18n5.t)("\u6210\u7247\u6A21\u5F0F\u53EA\u80FD\u662F clip \u6216 ai"));
}
function requireTriText(value, maxLen = import_charityPrompts.CHARITY_TEXT_MAX) {
  if (!value || typeof value !== "object") throw new Error((0, import_i18n5.t)("text \u5FC5\u987B\u662F\u5BF9\u8C61"));
  const out = {};
  for (const lang of LANG_SET) {
    const v = value[lang];
    if (typeof v === "string" && v.trim()) out[lang] = v.trim().slice(0, maxLen);
  }
  if (!Object.keys(out).length) throw new Error((0, import_i18n5.t)("\u6CA1\u6709\u53EF\u6717\u8BFB\u7684\u6587\u672C"));
  return out;
}
function requireCaptions(value) {
  const out = {};
  if (!value || typeof value !== "object") return out;
  for (const lang of LANG_SET) {
    const v = value[lang];
    if (Array.isArray(v)) out[lang] = v.map((s) => String(s ?? "").trim()).filter(Boolean).slice(0, 8);
  }
  return out;
}
function requirePrompt(value, label, max = import_charityPrompts.CHARITY_PROMPT_MAX) {
  if (value === void 0 || value === null) return "";
  if (typeof value !== "string") throw new Error((0, import_i18n5.t)("{label} \u5FC5\u987B\u662F\u6587\u672C", { label }));
  const v = value.replace(/\r\n?/g, "\n").trim();
  if (v.includes("\0")) throw new Error((0, import_i18n5.t)("{label} \u542B\u975E\u6CD5\u5B57\u7B26", { label }));
  if (v.length > max) throw new Error((0, import_i18n5.t)("{label}\u8FC7\u957F\uFF08\u6700\u591A {max} \u5B57\uFF09", { label, max }));
  return v;
}

// ../../../totalclaw-solutions/solutions/workbench-charity-content/src/main/ipc/charityContent.ipc.ts
function registerCharityContentHandlers(deps) {
  const runs = /* @__PURE__ */ new Map();
  const win = () => deps.getMainWindow();
  function resourcesDir() {
    return (0, import_runtimeLocation.shellResourcesPath)();
  }
  function agentHome() {
    return deps.appConfig?.engines?.["totalclaw-agent"]?.totalclawHome || deps.totalclawAgentHome;
  }
  function tools() {
    const res = resourcesDir();
    const pair = (0, import_ffmpegPath.resolveFfmpegPair)(res);
    if (!pair.ffmpeg || !pair.ffprobe) return null;
    let agentEnv = {};
    try {
      const home = agentHome();
      if (home) agentEnv = (0, import_mediaModelConfig.readAgentEnv)(home);
    } catch {
      agentEnv = {};
    }
    return {
      ffmpeg: pair.ffmpeg,
      ffprobe: pair.ffprobe,
      python: (0, import_agentPython.resolveAgentPython)(res),
      scriptsDir: (0, import_node_path5.join)(res, "bundled-skills", "marketing-sales", "totalclaw-video-studio", "scripts"),
      env: { ...process.env, ...agentEnv, ...(0, import_ffmpegPath.ffmpegSpawnEnv)(res), PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1", PYTHONIOENCODING: "utf-8" }
    };
  }
  function handle(runId) {
    let h = runs.get(runId);
    if (h) return h;
    const controller = new AbortController();
    const children = /* @__PURE__ */ new Set();
    h = { controller, children, signal: controller.signal, add: (c) => children.add(c), remove: (c) => children.delete(c) };
    runs.set(runId, h);
    return h;
  }
  function emit(runId, step) {
    return (stage, msg, done, total, extra) => {
      const ev = { runId, step, stage, msg, done, total, ...extra || {} };
      try {
        win()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_EVENT, ev);
      } catch {
      }
    };
  }
  const rt = createCharityRuntime(deps, agentHome);
  const { requireDefaultModel, vision, falFacade } = rt;
  function pipeline2(runId, step) {
    return {
      resourcesDir: resourcesDir(),
      tools: tools(),
      agentHome: agentHome(),
      fal: falFacade(),
      vision,
      text: rt.text,
      renderPdf: import_render2.renderHtmlToPdf,
      renderImage: import_render2.renderHtmlToImage,
      imageDataUrl: import_render2.imageToDataUrl,
      progress: emit(runId, step),
      log: {
        info: (m, ctx) => deps.logger?.info?.("charity-content", m, ctx),
        warn: (m, ctx) => deps.logger?.warn?.("charity-content", m, ctx)
      }
    };
  }
  function fallbackLog(step, runId, e) {
    deps.logger?.warn?.("charity-content", `[fallback] ${step} \u771F\u8DD1\u5931\u8D25\uFF0C\u5DF2\u7528\u9884\u7F6E\u6210\u54C1`, { runId, message: String(e?.message || e) });
  }
  function failLog(step, e, ctx) {
    const err = e;
    const stack = String(err?.stack || "").split("\n").slice(1, 3).map((s) => s.trim()).join(" \u2190 ");
    deps.logger?.error?.("charity-content", `${step} \u5931\u8D25`, {
      ...ctx,
      code: err?.code ? String(err.code) : void 0,
      message: String(err?.message ?? e),
      stack: stack || void 0
    });
  }
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_PICK_DIR, async () => {
    const r = await import_electron2.dialog.showOpenDialog(win() ?? void 0, { title: (0, import_i18n6.t)("\u9009\u62E9\u6D3B\u52A8\u7D20\u6750\u76EE\u5F55"), properties: ["openDirectory", "createDirectory"] });
    return { path: r.canceled ? "" : r.filePaths[0] || "" };
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_PICK_FILES, async () => {
    const r = await import_electron2.dialog.showOpenDialog(win() ?? void 0, {
      title: (0, import_i18n6.t)("\u9009\u62E9\u6D3B\u52A8\u7167\u7247 / \u89C6\u9891 / PDF"),
      properties: ["openFile", "multiSelections"],
      filters: [{ name: (0, import_i18n6.t)("\u7D20\u6750"), extensions: ["jpg", "jpeg", "png", "webp", "mp4", "mov", "m4v", "webm", "pdf"] }]
    });
    return { paths: r.canceled ? [] : r.filePaths };
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_PICK_PDF, async () => {
    const r = await import_electron2.dialog.showOpenDialog(win() ?? void 0, {
      title: (0, import_i18n6.t)("\u9009\u62E9 PDF \u6587\u4EF6"),
      properties: ["openFile"],
      filters: [{ name: "PDF", extensions: ["pdf"] }]
    });
    return { path: r.canceled ? "" : r.filePaths[0] || "" };
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_START_RUN, async (_e, req) => {
    try {
      const dir = req?.dir ? requireAbs(req.dir, (0, import_i18n6.t)("\u5DE5\u4F5C\u76EE\u5F55")) : articleWorkDir(import_electron2.app.getPath("documents"), (0, import_brandPaths.documentsFolderName)());
      (0, import_node_fs3.mkdirSync)(dir, { recursive: true });
      const runId = (0, import_pipeline2.makeRunId)();
      return { ok: true, dir, outDir: (0, import_pipeline2.outDirFor)(dir, runId), runId };
    } catch (e) {
      failLog((0, import_i18n6.t)("\u5F00\u59CB\u8FD0\u884C"), e);
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_SCAN, async (_e, req) => {
    try {
      const dir = req?.dir ? requireAbs(req.dir, (0, import_i18n6.t)("\u7D20\u6750\u76EE\u5F55")) : "";
      const files = req?.files ? requirePaths(req.files, (0, import_i18n6.t)("\u7D20\u6750\u6587\u4EF6")) : [];
      if (!dir && !files.length) return { ok: false, error: (0, import_i18n6.t)("\u8BF7\u62D6\u5165\u7D20\u6750\u76EE\u5F55\u6216\u9009\u62E9\u6587\u4EF6") };
      const materialDir = dir || (0, import_node_path5.join)(files[0], "..");
      if (!(0, import_node_fs3.existsSync)(materialDir) || !(0, import_node_fs3.statSync)(materialDir).isDirectory()) return { ok: false, error: (0, import_i18n6.t)("\u7D20\u6750\u76EE\u5F55\u4E0D\u5B58\u5728") };
      const list = (0, import_pipeline2.listMaterialFiles)(dir, files);
      if (!list.length) return { ok: false, error: (0, import_i18n6.t)("\u76EE\u5F55\u91CC\u6CA1\u6709\u56FE\u7247 / \u89C6\u9891 / PDF") };
      const runId = (0, import_pipeline2.makeRunId)();
      const outDir = (0, import_pipeline2.outDirFor)(materialDir, runId);
      const scratch = (0, import_node_fs3.mkdtempSync)((0, import_node_path5.join)((0, import_node_os.tmpdir)(), "totalclaw-charity-scan-"));
      try {
        const items = await (0, import_pipeline2.inspectMaterials)(pipeline2(runId, "scan"), list, scratch, handle(runId));
        return { ok: true, dir: materialDir, items, outDir, runId };
      } finally {
        (0, import_node_fs3.rmSync)(scratch, { recursive: true, force: true });
      }
    } catch (e) {
      failLog((0, import_i18n6.t)("\u7D20\u6750\u626B\u63CF"), e);
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_ARCHIVE_DRAFT, async (_e, req) => {
    let runId = "";
    try {
      runId = requireRunId(req?.runId);
      requireOutDir(req?.outDir, runId);
      const images = requirePaths(req?.images, (0, import_i18n6.t)("\u7167\u7247")).filter((p) => (0, import_media.kindOf)(p) === "image");
      const h = handle(runId);
      try {
        requireDefaultModel();
        const archive = await (0, import_pipeline2.draftArchive)(pipeline2(runId, "archive"), images, h.signal);
        return { ok: true, archive };
      } catch (e) {
        if (h.signal.aborted) return { ok: false, error: (0, import_i18n6.t)("\u5DF2\u53D6\u6D88") };
        if (!req.fallbackToPrebaked) throw e;
        const pre = loadPrebaked(resourcesDir());
        if (!pre.archive) throw e;
        fallbackLog("archive", runId, e);
        return { ok: true, archive: { ...pre.archive, source: "demo" }, fallback: true };
      }
    } catch (e) {
      failLog((0, import_i18n6.t)("\u6D3B\u52A8\u6863\u6848\u8349\u7A3F"), e, { runId });
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_ANALYZE, async (_e, req) => {
    let runId = "";
    try {
      runId = requireRunId(req?.runId);
      const outDir = requireOutDir(req?.outDir, runId);
      const items = requirePaths(req?.items, (0, import_i18n6.t)("\u7D20\u6750"));
      const contentPrompt = requirePrompt(req?.contentPrompt, (0, import_i18n6.t)("\u5185\u5BB9\u63D0\u793A\u8BCD"));
      (0, import_node_fs3.mkdirSync)(outDir, { recursive: true });
      (0, import_pipeline2.saveRunPrompts)(outDir, { content: contentPrompt });
      const h = handle(runId);
      const prebakedDescriptions = () => mapPrebakedDescriptions(loadPrebaked(resourcesDir()), items.filter((p) => (0, import_media.kindOf)(p) === "image" || (0, import_media.kindOf)(p) === "video").map((p) => ({ path: p, kind: (0, import_media.kindOf)(p) })));
      try {
        requireDefaultModel();
        const r = await (0, import_pipeline2.analyzeMaterials)(pipeline2(runId, "analyze"), items, (0, import_node_path5.join)(outDir, ".work"), h, req?.archive ? (0, import_archive2.normalizeArchive)(req.archive, void 0, req.archive.source) : void 0, contentPrompt);
        if (r.descriptions.length) return { ok: true, descriptions: r.descriptions, warning: r.failed ? (0, import_i18n6.t)("{n} \u4E2A\u7D20\u6750\u6CA1\u80FD\u8BFB\u51FA\u753B\u9762\uFF08{why}\uFF09", { n: r.failed, why: r.lastError }) : void 0 };
        const why = r.lastError || (0, import_i18n6.t)("\u5F53\u524D\u9ED8\u8BA4\u6A21\u578B\u4E0D\u652F\u6301\u56FE\u7247\u8F93\u5165");
        if (req.fallbackToPrebaked) {
          const mapped = prebakedDescriptions();
          if (mapped.length) {
            fallbackLog("analyze", runId, new Error(why));
            return { ok: true, descriptions: mapped, fallback: true };
          }
        }
        return { ok: true, descriptions: [], warning: (0, import_i18n6.t)("\u753B\u9762\u63CF\u8FF0\u4E0D\u53EF\u7528\uFF1A{why}\u3002\u62A5\u544A\u5C06\u53EA\u4F9D\u636E\u6D3B\u52A8\u6863\u6848\u64B0\u5199\u3002", { why }) };
      } catch (e) {
        if (h.signal.aborted) return { ok: false, error: (0, import_i18n6.t)("\u5DF2\u53D6\u6D88") };
        if (!req.fallbackToPrebaked) throw e;
        const mapped = prebakedDescriptions();
        if (!mapped.length) throw e;
        fallbackLog("analyze", runId, e);
        return { ok: true, descriptions: mapped, fallback: true };
      }
    } catch (e) {
      failLog((0, import_i18n6.t)("\u7D20\u6750\u8BC6\u56FE"), e, { runId });
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_REPORT, async (_e, req) => {
    let runId = "";
    try {
      runId = requireRunId(req?.runId);
      const outDir = requireOutDir(req?.outDir, runId);
      const archive = (0, import_archive2.normalizeArchive)(req?.archive, void 0, req?.archive?.source);
      const images = requirePaths(req?.images || [], (0, import_i18n6.t)("\u7167\u7247"));
      const descriptions = Array.isArray(req?.descriptions) ? req.descriptions : [];
      const contentPrompt = requirePrompt(req?.contentPrompt, (0, import_i18n6.t)("\u5185\u5BB9\u63D0\u793A\u8BCD"));
      (0, import_node_fs3.mkdirSync)(outDir, { recursive: true });
      (0, import_pipeline2.saveRunPrompts)(outDir, { content: contentPrompt });
      const h = handle(runId);
      const p = pipeline2(runId, "report");
      try {
        requireDefaultModel();
        const { report, via } = await (0, import_pipeline2.composeReport)(p, archive, descriptions, h.signal, contentPrompt);
        if (h.signal.aborted) return { ok: false, error: (0, import_i18n6.t)("\u5DF2\u53D6\u6D88") };
        const rendered = await (0, import_pipeline2.renderOutputs)(p, archive, report, images, outDir);
        deps.logger?.info?.("charity-content", "\u62A5\u544A\u5DF2\u751F\u6210", { runId, via: `${via.zh}/${via.en}/${via.ar}` });
        return {
          ok: true,
          report,
          pdf: rendered.pdf,
          poster: rendered.poster,
          posterPreview: { zh: (0, import_render2.imageToDataUrl)(rendered.poster.zh, 540), en: (0, import_render2.imageToDataUrl)(rendered.poster.en, 540), ar: (0, import_render2.imageToDataUrl)(rendered.poster.ar, 540) },
          pdfPreviewAr: rendered.pdfPreviewAr
        };
      } catch (e) {
        if (h.signal.aborted) return { ok: false, error: (0, import_i18n6.t)("\u5DF2\u53D6\u6D88") };
        if (!req.fallbackToPrebaked) throw e;
        const pre = loadPrebaked(resourcesDir());
        if (!pre.report || import_archive2.LANGS.some((l) => !pre.pdf[l] || !pre.poster[l])) throw e;
        fallbackLog("report", runId, e);
        const pdf = copyPrebakedFiles(pre.pdf, outDir, void 0, { neverOverwrite: true });
        const poster = copyPrebakedFiles(pre.poster, outDir, void 0, { neverOverwrite: true });
        return {
          ok: true,
          report: pre.report,
          pdf,
          poster,
          posterPreview: { zh: (0, import_render2.imageToDataUrl)(poster.zh, 540), en: (0, import_render2.imageToDataUrl)(poster.en, 540), ar: (0, import_render2.imageToDataUrl)(poster.ar, 540) },
          pdfPreviewAr: "",
          fallback: true
        };
      }
    } catch (e) {
      failLog((0, import_i18n6.t)("\u62A5\u544A\u751F\u6210"), e, { runId });
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_PDF_TEXT, async (_e, req) => {
    try {
      const path = requireAbs(req?.path, "PDF");
      if (!(0, import_node_fs3.existsSync)(path) || (0, import_media.kindOf)(path) !== "pdf") return { ok: false, error: (0, import_i18n6.t)("\u4E0D\u662F PDF \u6587\u4EF6") };
      const want = Math.max(1, Math.min(10, Number(req?.pages) || 2));
      const doc = await (0, import_documentExtractor.extractDocument)(path, (0, import_node_path5.basename)(path));
      const pages = doc.pages.filter((pg) => (pg.text || "").replace(/\s+/g, "").length >= 40).slice(0, want);
      if (!pages.length) return { ok: false, error: doc.warning || (0, import_i18n6.t)("\u8FD9\u4EFD PDF \u6CA1\u6709\u53EF\u62BD\u53D6\u7684\u6587\u5B57\u5C42\uFF08\u53EF\u80FD\u662F\u626B\u63CF\u4EF6\uFF09") };
      const text = pages.map((pg) => pg.text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()).join("\n\n");
      return { ok: true, text, pages: pages.map((pg) => pg.page), totalPages: doc.pages.length };
    } catch (e) {
      failLog((0, import_i18n6.t)("PDF \u53D6\u6587"), e, void 0);
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_TRANSLATE, async (_e, req) => {
    let runId = "";
    try {
      runId = requireRunId(req?.runId);
      const targets = requireLangs(req?.targets);
      const text = typeof req?.text === "string" ? req.text.trim() : "";
      if (!text) throw new Error((0, import_i18n6.t)("\u6CA1\u6709\u53EF\u6717\u8BFB\u7684\u6587\u672C"));
      requireDefaultModel();
      const h = handle(runId);
      const r = await (0, import_pipeline2.translateText)(pipeline2(runId, "tts"), text, targets, h.signal);
      if (h.signal.aborted) return { ok: false, error: (0, import_i18n6.t)("\u5DF2\u53D6\u6D88") };
      deps.logger?.info?.("charity-content", "\u6717\u8BFB\u6587\u672C\u5DF2\u8F6C\u8BD1", { runId, source: r.source, got: Object.keys(r.items), failed: r.failed });
      return { ok: true, source: r.source, items: r.items, failed: r.failed };
    } catch (e) {
      failLog((0, import_i18n6.t)("\u6717\u8BFB\u6587\u672C\u8F6C\u8BD1"), e, { runId });
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_TTS, async (_e, req) => {
    let runId = "";
    try {
      runId = requireRunId(req?.runId);
      const outDir = requireOutDir(req?.outDir, runId);
      const text = requireTriText(req?.text);
      const quality = requireQuality(req?.quality);
      (0, import_node_fs3.mkdirSync)(outDir, { recursive: true });
      const h = handle(runId);
      const withData = (items) => {
        for (const l of import_archive2.LANGS) {
          const it = items[l];
          if (it) it.dataUrl = (0, import_render2.audioToDataUrl)(it.path);
        }
        return items;
      };
      try {
        const items = await (0, import_pipeline2.synthesizeSpeech)(pipeline2(runId, "tts"), text, outDir, { quality, voices: req?.voices, gender: req?.gender === "male" ? "male" : "female", registry: h });
        return { ok: true, items: withData(items) };
      } catch (e) {
        if (h.signal.aborted) return { ok: false, error: (0, import_i18n6.t)("\u5DF2\u53D6\u6D88") };
        if (!req.fallbackToPrebaked) throw e;
        const pre = loadPrebaked(resourcesDir());
        const wanted = import_archive2.LANGS.filter((l) => text[l]);
        if (wanted.some((l) => !pre.speech[l])) throw e;
        fallbackLog("tts", runId, e);
        const copied = copyPrebakedFiles(Object.fromEntries(wanted.map((l) => [l, pre.speech[l]])), outDir, void 0, { neverOverwrite: true });
        copyPrebakedFiles(Object.fromEntries(wanted.map((l) => [l, (0, import_subtitles.narrationTrackPath)(pre.speech[l])])), outDir, void 0, { neverOverwrite: true });
        const t = tools();
        const items = {};
        for (const l of wanted) {
          const p = copied[l];
          items[l] = { path: p, quality: "standard", durationSec: t ? Math.round(await (0, import_media.audioDuration)(t, p) * 10) / 10 : 0, voice: "" };
        }
        return { ok: true, items: withData(items), fallback: true };
      }
    } catch (e) {
      failLog((0, import_i18n6.t)("\u8BED\u97F3\u5408\u6210"), e, { runId });
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_VIDEO, async (_e, req) => {
    let runId = "";
    try {
      runId = requireRunId(req?.runId);
      const outDir = requireOutDir(req?.outDir, runId);
      const items = requirePaths(req?.items, (0, import_i18n6.t)("\u7D20\u6750"));
      const mode = requireMode(req?.mode);
      const langs = requireLangs(req?.langs);
      const archive = (0, import_archive2.normalizeArchive)(req?.archive, void 0, req?.archive?.source);
      const captions = requireCaptions(req?.captions);
      const narration = {};
      for (const l of import_archive2.LANGS) {
        const n = req?.narration?.[l];
        if (typeof n === "string" && n) narration[l] = requireAbs(n, (0, import_i18n6.t)("\u914D\u97F3"));
      }
      const contentPrompt = requirePrompt(req?.contentPrompt, (0, import_i18n6.t)("\u5185\u5BB9\u63D0\u793A\u8BCD"));
      const videoPrompt = requirePrompt(req?.videoPrompt, (0, import_i18n6.t)("\u89C6\u9891\u63D0\u793A\u8BCD"));
      (0, import_node_fs3.mkdirSync)(outDir, { recursive: true });
      (0, import_pipeline2.saveRunPrompts)(outDir, { content: contentPrompt, video: videoPrompt });
      const h = handle(runId);
      const t = tools();
      const finish = (out) => {
        for (const l of import_archive2.LANGS) {
          const it = out[l];
          if (it) it.srcUrl = (0, import_mediaProtocol.buildLocalMediaUrl)(it.path);
        }
        return out;
      };
      try {
        const out = await (0, import_pipeline2.buildVideos)(pipeline2(runId, "video"), { items, mode, langs, archive, captions, narration, bgmMood: req?.bgmMood, contentPrompt, videoPrompt, visuals: req?.visuals === "ai-text" ? "ai-text" : "materials" }, outDir, h);
        (0, import_pipeline2.saveRunPrompts)(outDir, { content: contentPrompt, video: videoPrompt, effective: out.prompts });
        if (out.ai) {
          deps.logger?.info?.("charity-content", "\u77ED\u89C6\u9891\u5DF2\u751F\u6210", {
            runId,
            requested: mode,
            mode: out.mode,
            fallbackReason: out.ai.fallbackReason,
            estUsd: out.ai.estUsd,
            music: out.ai.music.source,
            shots: out.ai.shots.map((s) => `${s.index}:${s.source}${s.reused ? "(reused)" : ""}${s.reason ? `(${s.reason})` : ""}`).join(" ")
          });
        }
        return { ok: true, items: finish(out.items), mode: out.mode, ai: out.ai, prompts: out.prompts };
      } catch (e) {
        if (h.signal.aborted) return { ok: false, cancelled: true, error: (0, import_i18n6.t)("\u5DF2\u53D6\u6D88") };
        if (!req.fallbackToPrebaked) throw e;
        const pre = loadPrebaked(resourcesDir());
        const pool = mode === "ai" && langs.every((l) => pre.videoAi[l]) ? pre.videoAi : pre.video;
        if (langs.some((l) => !pool[l])) throw e;
        fallbackLog("video", runId, e);
        const copied = copyPrebakedFiles(Object.fromEntries(langs.map((l) => [l, pool[l]])), outDir, void 0, { neverOverwrite: true });
        const out = {};
        for (const l of langs) {
          const p = copied[l];
          const info = t ? await (0, import_media.probeMedia)(t, p) : null;
          out[l] = { path: p, srcUrl: "", durationSec: Math.round((info?.durationSec || 0) * 10) / 10, size: (0, import_node_fs3.statSync)(p).size, mode };
        }
        return { ok: true, items: finish(out), fallback: true };
      }
    } catch (e) {
      failLog((0, import_i18n6.t)("\u77ED\u89C6\u9891\u5408\u6210"), e, { runId });
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_PREBAKED, async () => {
    const pre = loadPrebaked(resourcesDir());
    return {
      ok: true,
      available: !!pre.archive,
      archive: pre.archive || void 0,
      report: pre.report || void 0,
      pdf: pre.pdf,
      poster: pre.poster,
      speech: pre.speech,
      video: Object.keys(pre.videoAi).length === 3 ? pre.videoAi : pre.video,
      falReady: !!falFacade().run
    };
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_PACK_STATUS, async () => {
    try {
      return { ok: true, ...demoPackStatus(resourcesDir()) };
    } catch (e) {
      failLog((0, import_i18n6.t)("\u6F14\u793A\u5305\u72B6\u6001"), e);
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_PACK_FETCH, async () => {
    const h = handle("demo-pack");
    const timer = setTimeout(() => h.controller.abort(new Error((0, import_i18n6.t)("\u6F14\u793A\u6570\u636E\u4E0B\u8F7D\u8D85\u8FC7 20 \u5206\u949F\u672A\u5B8C\u6210\uFF0C\u5DF2\u4E2D\u6B62"))), 20 * 6e4);
    try {
      const st = await ensureDemoPack(resourcesDir(), {
        signal: h.signal,
        // 借 scan 这一步的进度通道报下载进度：它是流程最前面那一步，界面上正好在等
        onProgress: (p) => emit("demo-pack", "scan")(
          "download",
          (0, import_i18n6.t)("\u4E0B\u8F7D\u6F14\u793A\u6570\u636E\uFF08{done}/{total}\uFF09", { done: p.done, total: p.total }),
          p.bytes,
          p.totalBytes
        )
      });
      deps.logger?.info?.("charity-content", "\u6F14\u793A\u6570\u636E\u5305\u5DF2\u5C31\u7EEA", { version: st.version, files: st.totalFiles });
      return { ok: true, ...st };
    } catch (e) {
      failLog((0, import_i18n6.t)("\u6F14\u793A\u5305\u4E0B\u8F7D"), e);
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    } finally {
      clearTimeout(timer);
      runs.delete("demo-pack");
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_RESULT, async (_e, req) => {
    let runId = "";
    try {
      runId = requireRunId(req?.runId);
      const outDir = requireOutDir(req?.outDir, runId);
      (0, import_node_fs3.mkdirSync)(outDir, { recursive: true });
      const pre = loadPrebaked(resourcesDir());
      if (!prebakedComplete(pre)) throw new Error((0, import_i18n6.t)("\u6F14\u793A\u6210\u54C1\u4E0D\u5B8C\u6574\uFF0C\u8BF7\u5148\u4E0B\u8F7D\u6F14\u793A\u6570\u636E\u5305"));
      const t = tools();
      const pdf = copyPrebakedFiles(pre.pdf, outDir);
      const poster = copyPrebakedFiles(pre.poster, outDir);
      const speechFiles = copyPrebakedFiles(pre.speech, outDir);
      copyPrebakedFiles(Object.fromEntries(import_archive2.LANGS.filter((l) => pre.speech[l]).map((l) => [l, (0, import_subtitles.narrationTrackPath)(pre.speech[l])])), outDir);
      const wantAi = req?.mode !== "clip" && import_archive2.LANGS.every((l) => pre.videoAi[l]);
      const videoFiles = copyPrebakedFiles(wantAi ? pre.videoAi : pre.video, outDir);
      const speech = {};
      for (const l of import_archive2.LANGS) {
        const p = speechFiles[l];
        if (!p) continue;
        speech[l] = {
          path: p,
          quality: "hd",
          voice: "",
          durationSec: t ? Math.round(await (0, import_media.audioDuration)(t, p) * 10) / 10 : 0,
          dataUrl: (0, import_render2.audioToDataUrl)(p)
        };
      }
      const videos = {};
      for (const l of import_archive2.LANGS) {
        const p = videoFiles[l];
        if (!p) continue;
        const info = t ? await (0, import_media.probeMedia)(t, p) : null;
        videos[l] = {
          path: p,
          srcUrl: (0, import_mediaProtocol.buildLocalMediaUrl)(p),
          durationSec: Math.round((info?.durationSec || 0) * 10) / 10,
          size: (0, import_node_fs3.statSync)(p).size,
          mode: wantAi ? "ai" : "clip"
        };
      }
      deps.logger?.info?.("charity-content", "\u5DF2\u8F7D\u5165\u6F14\u793A\u6210\u54C1\uFF08\u672A\u8DD1\u751F\u6210\uFF09", { runId, mode: wantAi ? "ai" : "clip" });
      return {
        ok: true,
        archive: pre.archive,
        report: pre.report,
        pdf,
        poster,
        posterPreview: Object.fromEntries(import_archive2.LANGS.filter((l) => poster[l]).map((l) => [l, (0, import_render2.imageToDataUrl)(poster[l], 540)])),
        pdfPreview: {},
        speech,
        videos,
        mode: wantAi ? "ai" : "clip"
      };
    } catch (e) {
      failLog((0, import_i18n6.t)("\u8F7D\u5165\u6F14\u793A\u6210\u54C1"), e, { runId });
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_DEMO_MATERIALS, async () => {
    try {
      const r = prepareDemoMaterials(demoMaterialsSourceDir(resourcesDir()), demoMaterialsTargetDir(import_electron2.app.getPath("documents"), (0, import_brandPaths.documentsFolderName)()));
      deps.logger?.info?.("charity-content", "\u6F14\u793A\u7D20\u6750\u5C31\u7EEA", { dir: r.dir, copied: r.copied.length, skipped: r.skipped.length });
      return { ok: true, dir: r.dir, copied: r.copied.length };
    } catch (e) {
      deps.logger?.warn?.("charity-content", "\u6F14\u793A\u7D20\u6750\u590D\u5236\u5931\u8D25", { message: String(e?.message || e) });
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_HISTORY, async (_e, req) => {
    try {
      const dir = requireAbs(req?.dir, (0, import_i18n6.t)("\u7D20\u6750\u76EE\u5F55"));
      const root = (0, import_node_path5.join)(dir, import_pipeline2.OUTPUT_DIR_NAME);
      if (!(0, import_node_fs3.existsSync)(root)) return { ok: true, runs: [] };
      const runs2 = [];
      for (const name of (0, import_node_fs3.readdirSync)(root).sort().reverse().slice(0, 30)) {
        const outDir = (0, import_node_path5.join)(root, name);
        try {
          if (!(0, import_node_fs3.statSync)(outDir).isDirectory()) continue;
        } catch {
          continue;
        }
        const byLang = (prefix, ext, suffixes = [""]) => {
          const o = {};
          for (const l of import_archive2.LANGS) for (const s of suffixes) {
            const p = (0, import_node_path5.join)(outDir, `${prefix}-${l}${s}.${ext}`);
            if ((0, import_node_fs3.existsSync)(p)) {
              o[l] = p;
              break;
            }
          }
          return o;
        };
        let archive;
        try {
          const p = (0, import_node_path5.join)(outDir, "archive.json");
          if ((0, import_node_fs3.existsSync)(p)) archive = (0, import_archive2.normalizeArchive)(JSON.parse((0, import_node_fs3.readFileSync)(p, "utf8")));
        } catch {
          archive = void 0;
        }
        const run = { runId: name, outDir, createdAt: (0, import_node_fs3.statSync)(outDir).mtimeMs, archive, pdf: byLang("report", "pdf"), poster: byLang("poster", "jpg"), speech: byLang("speech", "mp3"), video: byLang("video", "mp4"), videoAi: byLang("video", "mp4", ["-ai"]) };
        const prompts = (0, import_pipeline2.readRunPrompts)(outDir);
        if (prompts.content || prompts.video) run.prompts = { content: prompts.content || void 0, video: prompts.video || void 0 };
        if ([run.pdf, run.video, run.videoAi, run.speech, run.poster].some((o) => Object.keys(o).length)) runs2.push(run);
      }
      return { ok: true, runs: runs2 };
    } catch {
      return { ok: true, runs: [] };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_FILE_URL, async (_e, req) => {
    try {
      const path = requireAbs(req?.path, (0, import_i18n6.t)("\u6587\u4EF6"));
      if (!(0, import_node_fs3.existsSync)(path)) return { ok: false, error: (0, import_i18n6.t)("\u6587\u4EF6\u4E0D\u5B58\u5728") };
      const st = (0, import_node_fs3.statSync)(path);
      if (!st.isFile() || st.size <= 0) return { ok: false, error: (0, import_i18n6.t)("\u6587\u4EF6\u65E0\u6548") };
      const base = { ok: true, size: st.size, mtimeMs: st.mtimeMs };
      if (req.kind === "video") {
        const t = tools();
        const info = t ? await (0, import_media.probeMedia)(t, path) : null;
        return { ...base, url: (0, import_mediaProtocol.buildLocalMediaUrl)(path), durationSec: info?.durationSec };
      }
      if (req.kind === "audio") {
        const t = tools();
        return { ...base, url: (0, import_render2.audioToDataUrl)(path), durationSec: t ? await (0, import_media.audioDuration)(t, path) : void 0 };
      }
      if (req.kind === "pdf") {
        const sibling = path.replace(/\.pdf$/i, "-page1.png");
        return { ...base, url: (0, import_node_fs3.existsSync)(sibling) ? (0, import_render2.imageToDataUrl)(sibling, 900) : "" };
      }
      return { ...base, url: (0, import_render2.imageToDataUrl)(path, Math.max(96, Math.min(1600, Number(req.maxSize) || 720))) };
    } catch (e) {
      failLog((0, import_i18n6.t)("\u6587\u4EF6\u9884\u89C8"), e, void 0);
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_SAVE_AS, async (_e, req) => {
    try {
      const path = requireAbs(req?.path, (0, import_i18n6.t)("\u6587\u4EF6"));
      if (!(0, import_node_fs3.existsSync)(path)) return { ok: false, error: (0, import_i18n6.t)("\u6587\u4EF6\u4E0D\u5B58\u5728") };
      const r = await import_electron2.dialog.showSaveDialog(win() ?? void 0, { title: (0, import_i18n6.t)("\u4FDD\u5B58\u5230\u2026"), defaultPath: (0, import_node_path5.join)(import_electron2.app.getPath("downloads"), String(req?.suggestedName || (0, import_node_path5.basename)(path)).replace(/[\\/:*?"<>|]/g, "_")) });
      if (r.canceled || !r.filePath) return { ok: false, cancelled: true };
      (0, import_node_fs3.copyFileSync)(path, r.filePath);
      return { ok: true, path: r.filePath };
    } catch (e) {
      failLog((0, import_i18n6.t)("\u53E6\u5B58\u4E3A"), e, void 0);
      return { ok: false, error: (0, import_userFacingError.userFacingError)(e) };
    }
  });
  import_electron2.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_CHARITY_CANCEL, async (_e, req) => {
    const id = String(req?.runId || "");
    const h = runs.get(id);
    if (!h) return { ok: true };
    h.controller.abort();
    for (const c of h.children) (0, import_media.killTree)(c);
    runs.delete(id);
    return { ok: true };
  });
}

// node_modules/.cache/solutions-build/workbench-charity-content/entry.main.ts
var hostApi = 2;
var registerFunction = "registerCharityContentHandlers";
function activate(ctx) {
  registerCharityContentHandlers(ctx.host.deps);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  hostApi,
  registerFunction
});
