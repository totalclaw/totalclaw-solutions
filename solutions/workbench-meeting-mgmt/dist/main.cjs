var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/runtime.ts
var runtime_exports = {};
__export(runtime_exports, {
  FIRERED_LANGS: () => FIRERED_LANGS,
  FIRERED_MIN_MEM_GB: () => FIRERED_MIN_MEM_GB,
  MEETING_ASR_MODEL: () => MEETING_ASR_MODEL,
  SENSEVOICE_LANGS: () => SENSEVOICE_LANGS,
  __resetMeetingPipelineConfig: () => __resetMeetingPipelineConfig,
  asrEngineLabel: () => asrEngineLabel,
  asrModelArg: () => asrModelArg,
  autoParallelism: () => autoParallelism,
  configureMeetingPipeline: () => configureMeetingPipeline,
  pickMeetingAsrEngine: () => pickMeetingAsrEngine,
  pipelineConfig: () => pipelineConfig,
  resolveMeetingRuntime: () => resolveMeetingRuntime
});
function pickMeetingAsrEngine(rt, pref = "auto", lang = "zh", memGb = (0, import_os.totalmem)() / 1024 ** 3) {
  const l = String(lang || "zh").toLowerCase();
  const sv = !!rt.senseVoiceDir && SENSEVOICE_LANGS.includes(l);
  const fr = !!rt.fireRedDir && FIRERED_LANGS.includes(l);
  const wh = !!rt.whisperModel;
  if (pref === "whisper" && wh) return { engine: "whisper" };
  if (pref === "firered" && fr) return { engine: "firered" };
  if (pref === "sensevoice" && sv) return { engine: "sensevoice" };
  const missed = pref !== "auto" ? { note: "pref_missing" } : {};
  if (fr && memGb >= FIRERED_MIN_MEM_GB) return { engine: "firered", ...missed };
  if (sv) return { engine: "sensevoice", ...fr ? { note: "firered_low_mem" } : missed };
  if (fr) return { engine: "firered", ...missed };
  if (wh) return { engine: "whisper", ...rt.senseVoiceDir || rt.fireRedDir ? { note: "lang_unsupported" } : missed };
  if (rt.senseVoiceDir) return { engine: "sensevoice", note: "lang_unsupported" };
  if (rt.fireRedDir) return { engine: "firered", note: "lang_unsupported" };
  return { engine: null };
}
function asrModelArg(engine, rt) {
  if (engine === "whisper") return rt.whisperModel || "";
  if (engine === "firered") {
    return `sherpa:${JSON.stringify({ kind: "fire_red_aed", dir: rt.fireRedDir, ...rt.senseVoiceDir ? { svDir: rt.senseVoiceDir } : {} })}`;
  }
  return `sherpa:${JSON.stringify({ kind: "sense_voice", dir: rt.senseVoiceDir })}`;
}
function asrEngineLabel(engine, rt) {
  return engine === "firered" ? "FireRedASR2" : engine === "sensevoice" ? "SenseVoice" : rt.whisperModel || "Whisper";
}
function configureMeetingPipeline(c) {
  config = { ...config, ...c };
}
function __resetMeetingPipelineConfig() {
  config = {};
}
function pipelineConfig() {
  return config;
}
async function defaultRuntime() {
  const localAsr = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/localAsr.ts")));
  const { resolveFfmpegPair } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/ffmpegPath.ts")));
  const { speakerModelPath, speakerModelV2Path } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/speakerModel.ts")));
  const wm = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/whisperModels.ts")));
  const sam = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/streamingAsrModel.ts")));
  const ppi = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/pyPluginInstaller.ts")));
  const { buildPythonEnv } = await Promise.resolve().then(() => __toESM(require("npm:@totalclaw/engine-totalclaw-agent")));
  const resourcesDir = localAsr.resolveResourcesDir();
  const pair = resolveFfmpegPair(resourcesDir);
  const python = localAsr.resolveLocalAsrPython();
  ppi.setGeneralAbiResourcesDir(resourcesDir);
  const modelsDir = wm.ensureBundledWhisperModels(resourcesDir);
  const picked = wm.pickWhisperModel(wm.fallbackChain(MEETING_ASR_MODEL));
  return {
    ffmpeg: pair.ffmpeg,
    ffprobe: pair.ffprobe,
    python,
    pluginsDir: ppi.resolvePyPluginsDir("general"),
    whisperModelsDir: modelsDir,
    whisperModel: wm.isWhisperModelCached(picked.model) ? picked.model : null,
    whisperDowngradedFrom: picked.downgradedFrom,
    detectModel: wm.isWhisperModelCached("small") ? "small" : null,
    campp: speakerModelPath(),
    // 老版本 App 没有这个导出（2.0.17 才加）：没有就当没装，别让整条流水线因为它起不来
    campp2: typeof speakerModelV2Path === "function" ? speakerModelV2Path() : null,
    senseVoiceDir: sam.meetingAsrModelDir(sam.MEETING_ASR_SENSEVOICE_ID),
    fireRedDir: sam.meetingAsrModelDir(sam.MEETING_ASR_FIRERED_ID),
    env: buildPythonEnv({ ...process.env })
  };
}
async function resolveMeetingRuntime() {
  const o = config.runtime;
  if (o && typeof o === "object" && "python" in o && "ffmpeg" in o) {
    return { pluginsDir: "", whisperModelsDir: "", whisperModel: null, campp: null, env: { ...process.env }, ffprobe: null, python: null, ffmpeg: null, ...o };
  }
  const over = typeof o === "function" ? await o() : o || {};
  const base = await defaultRuntime();
  return { ...base, ...over };
}
function autoParallelism(model, override, hw) {
  const n = Math.max(1, hw?.cores ?? ((0, import_os.cpus)().length || 1));
  const memGb = hw?.memGb ?? (0, import_os.totalmem)() / 1024 ** 3;
  const envW = Number(process.env.TOTALCLAW_MEETING_ASR_WORKERS);
  const envB = Number(process.env.TOTALCLAW_MEETING_ASR_BATCH);
  const want = override || (Number.isFinite(envW) && envW > 0 ? envW : 0);
  if (model?.startsWith("sherpa:")) {
    const heavyAsr = model.includes('"fire_red_aed"');
    const byCpuS = Math.max(1, Math.floor(n / 6));
    const workers2 = want ? Math.min(want, 4) : heavyAsr ? memGb >= 32 && n >= 12 ? 2 : 1 : Math.max(1, Math.min(2, byCpuS));
    const threads2 = Math.max(2, Math.min(heavyAsr ? 8 : 6, Math.floor((n - 2) / workers2) || 2));
    const b = Number.isFinite(envB) && envB > 0 ? Math.min(16, Math.floor(envB)) : heavyAsr ? 4 : 8;
    return { workers: workers2, threads: threads2, batch: b };
  }
  const heavy = !!model && /large|medium/.test(model);
  const budget = memGb * 0.35;
  const byCpu = Math.max(1, Math.floor(n / 6));
  let batch = Number.isFinite(envB) && envB > 0 ? Math.min(16, Math.floor(envB)) : heavy ? memGb >= 48 ? 8 : 4 : 12;
  const perWorkerGb = !model ? 0.5 : heavy ? 1.6 + 0.6 * batch : 0.5 + 0.15 * batch;
  let workers = want ? Math.min(want, 8) : Math.max(1, Math.min(3, byCpu, Math.floor(budget / perWorkerGb)));
  if (!want && heavy && perWorkerGb > budget) {
    batch = 1;
    workers = 1;
  }
  const threads = Math.max(2, Math.min(6, Math.floor((n - 2) / workers) || 2));
  return { workers, threads, batch };
}
var import_os, SENSEVOICE_LANGS, FIRERED_LANGS, FIRERED_MIN_MEM_GB, config, MEETING_ASR_MODEL;
var init_runtime = __esm({
  "../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/runtime.ts"() {
    import_os = require("os");
    SENSEVOICE_LANGS = ["zh", "yue", "en", "ja", "ko"];
    FIRERED_LANGS = ["zh", "yue", "en"];
    FIRERED_MIN_MEM_GB = 12;
    config = {};
    MEETING_ASR_MODEL = process.env.TOTALCLAW_MEETING_ASR_MODEL || "large-v3";
  }
});

// apps/desktop-shell/node_modules/.cache/solutions-build/workbench-meeting-mgmt/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/ipc/meetingMgmt.ipc.ts
var import_electron = require("electron");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n16 = require("npm:@totalclaw/i18n");
var import_openPathGuarded = require("host:apps/desktop-shell/src/main/utils/openPathGuarded.ts");
var import_userFacingError = require("host:apps/desktop-shell/src/main/utils/userFacingError.ts");
var import_quitRegistry = require("host:apps/desktop-shell/src/main/util/quitRegistry.ts");

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/service.ts
var import_node_fs4 = require("node:fs");
var import_node_path3 = require("node:path");
var import_node_crypto5 = require("node:crypto");
var import_i18n15 = require("npm:@totalclaw/i18n");

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/shared/meetingMgmt/types.ts
var MM_DEFAULT_SETTINGS = {
  adminIds: [],
  projectCreatorIds: [],
  confirmTimeoutHours: 24,
  dueRemindDays: 1,
  trackCycleDays: 7,
  reportCycleDays: 7,
  wecom: { corpId: "", agentId: "", hasSecret: false },
  // 声纹认人门槛：2026-11-16 用真实 67 分钟会议录音实测，同一会议室不同人之间余弦最高 0.53、本人 0.67~0.77，取 0.55
  ai: { asr: "local", voiceprintThreshold: 0.55 }
};
var MM_VOICEPRINT_MAX_EXTRA = 5;

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/store.ts
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_crypto = require("node:crypto");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");
var import_atomicJson = require("host:apps/desktop-shell/src/main/utils/atomicJson.ts");
var MM_STATE_VERSION = 1;
var MM_MAX_NOTICES = 2e3;
function newId(prefix) {
  return `${prefix}_${(0, import_node_crypto.randomUUID)().replace(/-/g, "").slice(0, 12)}`;
}
function emptyState() {
  return {
    version: MM_STATE_VERSION,
    org: { depts: [], people: [], source: "none" },
    settings: cloneDefaultSettings(),
    voiceprints: [],
    projects: [],
    meetings: [],
    tasks: [],
    notices: [],
    meId: null,
    operatorId: null,
    tokens: {},
    demoLoaded: false,
    mobileOn: false
  };
}
function cloneDefaultSettings() {
  return JSON.parse(JSON.stringify(MM_DEFAULT_SETTINGS));
}
var arr = (v) => Array.isArray(v) ? v : [];
var obj = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var num = (v, def) => typeof v === "number" && Number.isFinite(v) ? v : def;
function normalizeState(raw) {
  const r = obj(raw);
  const base = emptyState();
  const o = obj(r.org);
  const s = obj(r.settings);
  const def = cloneDefaultSettings();
  const settings = {
    adminIds: arr(s.adminIds).map(String),
    projectCreatorIds: arr(s.projectCreatorIds).map(String),
    confirmTimeoutHours: num(s.confirmTimeoutHours, def.confirmTimeoutHours),
    dueRemindDays: num(s.dueRemindDays, def.dueRemindDays),
    trackCycleDays: num(s.trackCycleDays, def.trackCycleDays),
    reportCycleDays: num(s.reportCycleDays, def.reportCycleDays),
    wecom: { ...def.wecom, ...obj(s.wecom) },
    ai: { ...def.ai, ...obj(s.ai) }
  };
  settings.wecom.hasSecret = settings.wecom.hasSecret === true;
  if (settings.wecom.hasWebhook !== true) {
    delete settings.wecom.hasWebhook;
    delete settings.wecom.webhookMasked;
  }
  return {
    version: MM_STATE_VERSION,
    org: {
      depts: arr(o.depts).map((d) => ({ ...d, leaderIds: arr(d?.leaderIds) })),
      people: arr(o.people),
      source: o.source === "wecom" || o.source === "demo" || o.source === "import" ? o.source : "none",
      ...o.lastSync ? { lastSync: o.lastSync } : {}
    },
    settings,
    voiceprints: arr(r.voiceprints),
    projects: arr(r.projects).map((p) => ({ ...p, memberIds: arr(p?.memberIds), weeklyReports: arr(p?.weeklyReports) })),
    meetings: arr(r.meetings).map((m) => ({
      ...m,
      attendeeIds: arr(m?.attendeeIds),
      files: arr(m?.files),
      speakers: arr(m?.speakers),
      segments: arr(m?.segments),
      topics: arr(m?.topics),
      decisions: arr(m?.decisions),
      summaryLines: arr(m?.summaryLines),
      confirmations: arr(m?.confirmations),
      taskIds: arr(m?.taskIds)
    })),
    tasks: arr(r.tasks).map((t) => ({
      ...t,
      objectionHistory: arr(t?.objectionHistory),
      progressLog: arr(t?.progressLog),
      events: arr(t?.events),
      reminders: obj(t?.reminders)
    })),
    notices: arr(r.notices),
    meId: typeof r.meId === "string" && r.meId ? r.meId : base.meId,
    operatorId: typeof r.operatorId === "string" && r.operatorId ? r.operatorId : base.operatorId,
    tokens: Object.fromEntries(Object.entries(obj(r.tokens)).filter(([, v]) => typeof v === "string" && v).map(([k, v]) => [k, String(v)])),
    demoLoaded: r.demoLoaded === true,
    mobileOn: r.mobileOn === true,
    ...typeof r.setupDoneAt === "number" && r.setupDoneAt > 0 ? { setupDoneAt: r.setupDoneAt } : {}
  };
}
var safeSeg = (s) => String(s || "").replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 80) || "_";
var MeetingMgmtStore = class _MeetingMgmtStore {
  constructor(dirOf = () => (0, import_accountScope.accountPath)("meeting-mgmt"), onWarn) {
    this.dirOf = dirOf;
    this.onWarn = onWarn;
  }
  cache = null;
  cacheDir = "";
  /** 数据根目录（换账号后自动换目录、丢缓存） */
  root() {
    const d = this.dirOf();
    if (d !== this.cacheDir) {
      this.cache = null;
      this.cacheDir = d;
    }
    (0, import_node_fs.mkdirSync)(d, { recursive: true });
    return d;
  }
  statePath() {
    return (0, import_node_path.join)(this.root(), "state.json");
  }
  secretPath() {
    return (0, import_node_path.join)(this.root(), "wecom-secret.txt");
  }
  webhookPath() {
    return (0, import_node_path.join)(this.root(), "wecom-webhook.txt");
  }
  cloudAsrKeyPath() {
    return (0, import_node_path.join)(this.root(), "cloud-asr-key.txt");
  }
  sub(name, ...rest) {
    const d = (0, import_node_path.join)(this.root(), name, ...rest);
    (0, import_node_fs.mkdirSync)(d, { recursive: true });
    return d;
  }
  /** files/<meetingId>/（流水线的 workDir） */
  filesDir(meetingId) {
    return this.sub("files", safeSeg(meetingId));
  }
  voiceprintsDir() {
    return this.sub("voiceprints");
  }
  uploadsDir() {
    return this.sub("uploads");
  }
  demoDir() {
    return this.sub("demo");
  }
  removeMeetingFiles(meetingId) {
    const d = (0, import_node_path.join)(this.root(), "files", safeSeg(meetingId));
    try {
      (0, import_node_fs.rmSync)(d, { recursive: true, force: true });
    } catch {
    }
  }
  /** p 是否在 dir 之内（防止载荷里带来任意本机路径） */
  static isInside(dir, p) {
    if (!p) return false;
    const rel = (0, import_node_path.relative)((0, import_node_path.resolve)(dir), (0, import_node_path.resolve)(p));
    return !!rel && !rel.startsWith("..") && !(0, import_node_path.isAbsolute)(rel);
  }
  isInsideRoot(p) {
    return _MeetingMgmtStore.isInside(this.root(), p);
  }
  read() {
    const file = this.statePath();
    if (!this.cache) this.cache = normalizeState((0, import_atomicJson.readJsonSafe)(file, null, this.onWarn));
    return this.cache;
  }
  /**
   * 在缓存上改，改完整份原子写回。fn 抛错时不落盘，并丢掉缓存 —— 下次从磁盘重读，
   * 磁盘上就是上一次提交的完整状态（每次提交都整份写），等于回滚了 fn 改到一半的内容。
   */
  update(fn) {
    const cur = this.read();
    let out;
    try {
      out = fn(cur);
    } catch (e) {
      this.cache = null;
      throw e;
    }
    if (cur.notices.length > MM_MAX_NOTICES) cur.notices = cur.notices.slice(-MM_MAX_NOTICES);
    (0, import_atomicJson.writeJsonAtomic)(this.statePath(), cur);
    return out;
  }
  /** 整份替换（演示数据载入 / 清空） */
  replace(next) {
    this.root();
    this.cache = normalizeState(next);
    (0, import_atomicJson.writeJsonAtomic)(this.statePath(), this.cache);
  }
  /** 企微 Secret 的密文；没有返回 '' */
  readSecret() {
    const f = this.secretPath();
    try {
      return (0, import_node_fs.existsSync)(f) ? (0, import_node_fs.readFileSync)(f, "utf-8").trim() : "";
    } catch {
      return "";
    }
  }
  writeSecret(sealed) {
    const f = this.secretPath();
    if (!sealed) {
      try {
        (0, import_node_fs.unlinkSync)(f);
      } catch {
      }
      return;
    }
    (0, import_atomicJson.writeFileAtomicSync)(f, sealed, 384);
  }
  /** 群机器人 Webhook 地址的密文；没有返回 '' */
  readWebhook() {
    const f = this.webhookPath();
    try {
      return (0, import_node_fs.existsSync)(f) ? (0, import_node_fs.readFileSync)(f, "utf-8").trim() : "";
    } catch {
      return "";
    }
  }
  writeWebhook(sealed) {
    const f = this.webhookPath();
    if (!sealed) {
      try {
        (0, import_node_fs.unlinkSync)(f);
      } catch {
      }
      return;
    }
    (0, import_atomicJson.writeFileAtomicSync)(f, sealed, 384);
  }
  /** 在线语音识别接口的 API Key（系统加密后的密文） */
  readCloudAsrKey() {
    try {
      return (0, import_node_fs.readFileSync)(this.cloudAsrKeyPath(), "utf8").trim();
    } catch {
      return "";
    }
  }
  writeCloudAsrKey(sealed) {
    const f = this.cloudAsrKeyPath();
    if (!sealed) {
      try {
        (0, import_node_fs.unlinkSync)(f);
      } catch {
      }
      return;
    }
    (0, import_atomicJson.writeFileAtomicSync)(f, sealed, 384);
  }
};

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/rules.ts
var import_i18n = require("npm:@totalclaw/i18n");
var DAY_MS = 864e5;
var HOUR_MS = 36e5;
function fail(msg) {
  throw new Error(msg);
}
var pad = (n) => String(n).padStart(2, "0");
function ymd(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function isYmd(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}
function ymdStart(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}
function addDaysYmd(s, n) {
  const [y, m, d] = s.split("-").map(Number);
  return ymd(new Date(y, m - 1, d + n).getTime());
}
function daysBetweenYmd(a, b) {
  const [ya, ma, da] = a.split("-").map(Number);
  const [yb, mb, db] = b.split("-").map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / DAY_MS);
}
function weekRange(now) {
  const d = new Date(now);
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7);
  const next = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7);
  return { from: monday.getTime(), to: next.getTime(), fromYmd: ymd(monday.getTime()), toYmd: ymd(next.getTime() - 1) };
}
function endOfDay(now) {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
}
function meetingStatusLabel(s) {
  switch (s) {
    case "pending_upload":
      return (0, import_i18n.t)("\u5F85\u4E0A\u4F20");
    case "processing":
      return (0, import_i18n.t)("\u5904\u7406\u4E2D");
    case "failed":
      return (0, import_i18n.t)("\u5904\u7406\u5931\u8D25");
    case "pending_assign":
      return (0, import_i18n.t)("\u5F85\u6307\u8BA4");
    case "pending_confirm":
      return (0, import_i18n.t)("\u5F85\u786E\u8BA4");
    case "pending_review":
      return (0, import_i18n.t)("\u5F85\u7EC8\u5BA1");
    case "finalized":
      return (0, import_i18n.t)("\u5DF2\u5B9A\u7A3F");
    case "ended":
      return (0, import_i18n.t)("\u5DF2\u7ED3\u675F");
    case "pending_owner":
      return (0, import_i18n.t)("\u5F85\u6307\u5B9A\u8D1F\u8D23\u4EBA");
    case "plan_confirm":
      return (0, import_i18n.t)("\u65B9\u6848\u5F85\u786E\u8BA4");
    case "dispatched":
      return (0, import_i18n.t)("\u5DF2\u6D3E\u53D1");
    default:
      return String(s);
  }
}
function taskStatusLabel(s) {
  switch (s) {
    case "to_accept":
      return (0, import_i18n.t)("\u5F85\u63A5\u6536");
    case "not_started":
      return (0, import_i18n.t)("\u672A\u5F00\u59CB");
    case "in_progress":
      return (0, import_i18n.t)("\u8FDB\u884C\u4E2D");
    case "done":
      return (0, import_i18n.t)("\u5DF2\u5B8C\u6210");
    case "cancelled":
      return (0, import_i18n.t)("\u5DF2\u53D6\u6D88");
    default:
      return String(s);
  }
}
function activePerson(org, id) {
  if (!id) return null;
  const p = org.people.find((x) => x.id === id);
  return p && !p.left ? p : null;
}
function requireActivePerson(org, id, what = (0, import_i18n.t)("\u4EBA\u5458")) {
  const p = activePerson(org, id);
  if (!p) fail((0, import_i18n.t)("{p0}\u4E0D\u5728\u7EC4\u7EC7\u91CC\u6216\u5DF2\u79BB\u804C", { p0: what }));
  return p;
}
function firstLeader(org, deptId) {
  const dept = org.depts.find((d) => d.id === deptId);
  if (!dept || !dept.leaderIds.length) return null;
  return activePerson(org, dept.leaderIds[0]);
}
function leaderProblem(org, deptId) {
  const dept = org.depts.find((d) => d.id === deptId);
  if (!dept) return (0, import_i18n.t)("\u8D23\u4EFB\u90E8\u95E8\u4E0D\u5728\u7EC4\u7EC7\u91CC");
  if (!dept.leaderIds.length) return (0, import_i18n.t)("\u90E8\u95E8\u300C{p0}\u300D\u5728\u901A\u8BAF\u5F55\u91CC\u6CA1\u6709\u8BBE\u7F6E\u8D1F\u8D23\u4EBA\uFF0C\u65E0\u6CD5\u4E0B\u53D1", { p0: dept.name });
  const p = org.people.find((x) => x.id === dept.leaderIds[0]);
  if (!p) return (0, import_i18n.t)("\u90E8\u95E8\u300C{p0}\u300D\u7684\u7B2C\u4E00\u8D1F\u8D23\u4EBA\u4E0D\u5728\u901A\u8BAF\u5F55\u540C\u6B65\u8303\u56F4\u5185\uFF08\u4F01\u5FAE\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u4E4B\u5916\uFF09\uFF0C\u65E0\u6CD5\u4E0B\u53D1\uFF1B\u8BF7\u8C03\u6574\u53EF\u89C1\u8303\u56F4\u6216\u90E8\u95E8\u8D1F\u8D23\u4EBA\u540E\u91CD\u65B0\u540C\u6B65\u901A\u8BAF\u5F55", { p0: dept.name });
  if (p.left) return (0, import_i18n.t)("\u90E8\u95E8\u300C{p0}\u300D\u7684\u7B2C\u4E00\u8D1F\u8D23\u4EBA{p1}\u5DF2\u79BB\u804C\uFF0C\u65E0\u6CD5\u4E0B\u53D1\uFF1B\u8BF7\u5728\u4F01\u4E1A\u5FAE\u4FE1\u91CC\u8C03\u6574\u90E8\u95E8\u8D1F\u8D23\u4EBA\u540E\u91CD\u65B0\u540C\u6B65\u901A\u8BAF\u5F55", { p0: dept.name, p1: p.name });
  return null;
}
function deptOf(org, deptId) {
  return org.depts.find((d) => d.id === deptId);
}
function assertProjectNotArchived(p) {
  if (p.status === "archived") fail((0, import_i18n.t)("\u9879\u76EE\u300C{p0}\u300D\u5DF2\u5F52\u6863\uFF0C\u53EA\u80FD\u67E5\u770B", { p0: p.name }));
}
function assertProjectActive(p) {
  assertProjectNotArchived(p);
  if (p.status === "closing") fail((0, import_i18n.t)("\u9879\u76EE\u300C{p0}\u300D\u6B63\u5728\u7ED3\u9879\uFF0C\u4E0D\u80FD\u518D\u65B0\u5EFA\u4F1A\u8BAE\u6216\u4EFB\u52A1", { p0: p.name }));
}
function assertProjectOwner(p, actor, what) {
  if (p.ownerId !== actor) fail((0, import_i18n.t)("\u53EA\u6709\u9879\u76EE\u8D1F\u8D23\u4EBA\u53EF\u4EE5{p0}", { p0: what }));
}
function ensureMembers(p, ids) {
  const added = [];
  for (const id of ids) {
    if (!id || p.memberIds.includes(id)) continue;
    p.memberIds.push(id);
    added.push(id);
  }
  return added;
}
var MEETING_CLOSED = ["dispatched", "ended"];
var TASK_CLOSED = ["done", "cancelled"];
var isMeetingClosed = (m) => MEETING_CLOSED.includes(m.status);
var isTaskClosed = (t) => TASK_CLOSED.includes(t.status);
var hasOpenObjection = (t) => !!t.objection && t.objection.stage !== "resolved";
function closeCheckItems(p, meetings, tasks) {
  const items = [];
  for (const m of meetings) {
    if (m.projectId !== p.id || isMeetingClosed(m)) continue;
    items.push({ kind: "meeting", id: m.id, title: m.title, reason: (0, import_i18n.t)("\u4F1A\u8BAE\u7EAA\u8981\u72B6\u6001\uFF1A{p0}", { p0: meetingStatusLabel(m.status) }) });
  }
  for (const t of tasks) {
    if (t.projectId !== p.id) continue;
    if (!isTaskClosed(t)) items.push({ kind: "task", id: t.id, title: t.title, reason: (0, import_i18n.t)("\u4EFB\u52A1\u72B6\u6001\uFF1A{p0}", { p0: taskStatusLabel(t.status) }) });
    if (hasOpenObjection(t)) items.push({ kind: "objection", id: t.id, title: t.title, reason: (0, import_i18n.t)("\u5F02\u8BAE\u5904\u7406\u4E2D") });
  }
  return items;
}
function startClose(p, actor, items, now) {
  assertProjectNotArchived(p);
  assertProjectOwner(p, actor, (0, import_i18n.t)("\u53D1\u8D77\u7ED3\u9879"));
  if (p.status !== "active") fail((0, import_i18n.t)("\u9879\u76EE\u5DF2\u7ECF\u5728\u7ED3\u9879\u4E2D"));
  const ok = items.length === 0;
  p.closeCheck = { at: now, ok, items };
  if (ok) p.status = "closing";
  return ok;
}
function approveSummary(p, actor, now) {
  assertProjectNotArchived(p);
  assertProjectOwner(p, actor, (0, import_i18n.t)("\u5BA1\u6838\u603B\u7ED3\u62A5\u544A"));
  if (p.status !== "closing") fail((0, import_i18n.t)("\u9879\u76EE\u8FD8\u6CA1\u6709\u901A\u8FC7\u7ED3\u9879\u68C0\u67E5"));
  if (!p.summary) fail((0, import_i18n.t)("\u603B\u7ED3\u62A5\u544A\u8FD8\u6CA1\u6709\u751F\u6210\u597D"));
  p.summary.approvedAt = now;
  p.summary.approvedBy = actor;
  p.status = "archived";
  p.archivedAt = now;
}
function assertSummaryEditable(p, actor) {
  assertProjectNotArchived(p);
  assertProjectOwner(p, actor, (0, import_i18n.t)("\u4FEE\u6539\u603B\u7ED3\u62A5\u544A"));
  if (p.status !== "closing") fail((0, import_i18n.t)("\u9879\u76EE\u8FD8\u6CA1\u6709\u901A\u8FC7\u7ED3\u9879\u68C0\u67E5"));
}
function planOwners(plan) {
  if (!plan) return [];
  const ids = Array.isArray(plan.ownerIds) && plan.ownerIds.length ? plan.ownerIds : plan.ownerId ? [plan.ownerId] : [];
  return [...new Set(ids.filter(Boolean))];
}
function taskOwners(t) {
  const ids = Array.isArray(t.ownerIds) && t.ownerIds.length ? t.ownerIds : t.ownerId ? [t.ownerId] : [];
  return [...new Set(ids.filter(Boolean))];
}
function memberOpenItems(personId, p, meetings, tasks) {
  const out = [];
  for (const m of meetings) {
    if (m.projectId !== p.id || isMeetingClosed(m)) continue;
    if (m.hostId === personId) out.push(m.title);
    else if (m.confirmations.some((c) => c.personId === personId && c.status === "pending")) out.push(m.title);
    else if (planOwners(m.plan).includes(personId) && m.status === "plan_confirm") out.push(m.title);
  }
  for (const t of tasks) {
    if (t.projectId !== p.id || isTaskClosed(t)) continue;
    if (t.assigneeId === personId || taskOwners(t).includes(personId)) out.push(t.title);
  }
  return out;
}
function applyMembers(p, actor, nextIds, meetings, tasks, nameOf) {
  assertProjectNotArchived(p);
  assertProjectOwner(p, actor, (0, import_i18n.t)("\u4FEE\u6539\u9879\u76EE\u6210\u5458"));
  const next = [...new Set(nextIds.filter(Boolean))];
  if (!next.includes(p.ownerId)) next.unshift(p.ownerId);
  const removed = p.memberIds.filter((id) => !next.includes(id));
  for (const id of removed) {
    if (id === p.ownerId) fail((0, import_i18n.t)("\u9879\u76EE\u8D1F\u8D23\u4EBA\u4E0D\u80FD\u79FB\u9664"));
    if (memberOpenItems(id, p, meetings, tasks).length) fail((0, import_i18n.t)("{p0}\uFF1A\u8BE5\u6210\u5458\u8FD8\u6709\u672A\u5B8C\u6210\u4E8B\u9879", { p0: nameOf(id) }));
  }
  const added = next.filter((id) => !p.memberIds.includes(id));
  p.memberIds = next;
  return { added, removed };
}
function assertHost(m, actor, what) {
  if (m.hostId !== actor) fail((0, import_i18n.t)("\u53EA\u6709\u4E3B\u6301\u4EBA\u53EF\u4EE5{p0}", { p0: what }));
}
var FINALIZED_STATUSES = ["finalized", "ended", "pending_owner", "plan_confirm", "dispatched"];
var isMinutesLocked = (m) => FINALIZED_STATUSES.includes(m.status);
function assertMeetingStatus(m, allowed, what, lockedHint = false) {
  if (allowed.includes(m.status)) return;
  if (lockedHint && isMinutesLocked(m)) fail((0, import_i18n.t)("\u7EAA\u8981\u5DF2\u5B9A\u7A3F\u9501\u5B9A\uFF0C\u4E0D\u80FD{p0}", { p0: what }));
  fail((0, import_i18n.t)("\u4F1A\u8BAE\u5F53\u524D\u72B6\u6001\u662F\u300C{p0}\u300D\uFF0C\u4E0D\u80FD{p1}", { p0: meetingStatusLabel(m.status), p1: what }));
}
function startProcessing(m, actor, now, opts = {}) {
  assertHost(m, actor, opts.reprocess ? (0, import_i18n.t)("\u91CD\u65B0\u8F6C\u5199") : opts.retry ? (0, import_i18n.t)("\u91CD\u8BD5\u5904\u7406") : (0, import_i18n.t)("\u4E0A\u4F20\u4F1A\u8BAE\u6587\u4EF6"));
  if (opts.reprocess) {
    assertMeetingStatus(m, ["pending_assign", "pending_confirm", "pending_review", "failed"], (0, import_i18n.t)("\u91CD\u65B0\u8F6C\u5199"), true);
    if (!m.files.length) fail((0, import_i18n.t)("\u8FD8\u6CA1\u6709\u4E0A\u4F20\u4F1A\u8BAE\u6587\u4EF6"));
  } else if (opts.retry) {
    if (m.status !== "failed") fail((0, import_i18n.t)("\u53EA\u6709\u5904\u7406\u5931\u8D25\u7684\u4F1A\u8BAE\u53EF\u4EE5\u91CD\u8BD5"));
    if (!m.files.length) fail((0, import_i18n.t)("\u8FD8\u6CA1\u6709\u4E0A\u4F20\u4F1A\u8BAE\u6587\u4EF6"));
  } else {
    assertMeetingStatus(m, ["pending_upload", "failed"], (0, import_i18n.t)("\u4E0A\u4F20\u4F1A\u8BAE\u6587\u4EF6"));
    if (!opts.files?.length) fail((0, import_i18n.t)("\u8BF7\u9009\u62E9\u8981\u4E0A\u4F20\u7684\u4F1A\u8BAE\u6587\u4EF6"));
    m.files = opts.files;
  }
  m.status = "processing";
  m.process = { stage: "extract", progress: 0, startedAt: now, log: [{ at: now, text: opts.reprocess ? (0, import_i18n.t)("\u91CD\u65B0\u8F6C\u5199\uFF08\u7528\u5F53\u524D\u7684\u8F6C\u5199\u6A21\u578B\uFF09") : opts.retry ? (0, import_i18n.t)("\u91CD\u65B0\u5F00\u59CB\u5904\u7406") : (0, import_i18n.t)("\u5F00\u59CB\u5904\u7406") }] };
  m.reviewStartedAt = void 0;
  m.speakers = [];
  m.segments = [];
  m.topics = [];
  m.decisions = [];
  m.summaryLines = [];
  m.confirmations = [];
}
function failProcessing(m, error, now) {
  if (m.status !== "processing") return;
  m.status = "failed";
  const p = m.process || { stage: "extract", progress: 0, log: [] };
  m.process = { ...p, error, finishedAt: now, log: [...p.log || [], { at: now, text: error }].slice(-200) };
}
function speakerPersonIds(m) {
  const out = [];
  for (const s of m.speakers) if (s.personId && !out.includes(s.personId)) out.push(s.personId);
  return out;
}
function labelsOf(m, personId) {
  return m.speakers.filter((s) => s.personId === personId).map((s) => s.label);
}
function syncConfirmations(m, before) {
  const persons = speakerPersonIds(m);
  const pending = [];
  const next = persons.map((pid) => {
    const prev = m.confirmations.find((c) => c.personId === pid);
    const same = prev && before.get(pid) === labelsOf(m, pid).sort().join("|");
    if (prev && same) return prev;
    pending.push(pid);
    return { personId: pid, status: "pending" };
  });
  m.confirmations = next;
  return pending;
}
function labelSnapshot(m) {
  const map = /* @__PURE__ */ new Map();
  for (const pid of speakerPersonIds(m)) map.set(pid, labelsOf(m, pid).sort().join("|"));
  return map;
}
function stampRequested(m, personIds, now) {
  for (const c of m.confirmations) if (personIds.includes(c.personId) && c.status === "pending") c.requestedAt = now;
}
var pendingIds = (m) => m.confirmations.filter((c) => c.status === "pending").map((c) => c.personId);
function settleAfterSpeakers(m, now) {
  if (m.speakers.some((s) => !s.personId)) {
    m.status = "pending_assign";
    return;
  }
  if (m.confirmations.length && m.confirmations.some((c) => c.status === "pending")) {
    m.status = "pending_confirm";
    return;
  }
  m.status = "pending_review";
  m.reviewStartedAt = now;
}
function applyPipelineResult(m, r, now) {
  if (m.status !== "processing") fail((0, import_i18n.t)("\u4F1A\u8BAE\u5DF2\u4E0D\u5728\u5904\u7406\u4E2D\uFF0C\u7ED3\u679C\u4F5C\u5E9F"));
  m.segments = Array.isArray(r.segments) ? r.segments : [];
  const used = new Set(m.segments.map((s) => s.speakerLabel));
  m.speakers = (Array.isArray(r.speakers) ? r.speakers : []).filter((s) => used.has(s.label));
  for (const label of used) if (!m.speakers.some((s) => s.label === label)) m.speakers.push({ label });
  m.topics = Array.isArray(r.topics) ? r.topics : [];
  m.decisions = Array.isArray(r.decisions) ? r.decisions : [];
  m.summaryLines = Array.isArray(r.summaryLines) ? r.summaryLines.map(String).slice(0, 3) : [];
  if (typeof r.durationSec === "number") m.durationSec = r.durationSec;
  const p = m.process || { stage: "done", progress: 100, log: [] };
  m.process = { ...p, stage: "done", progress: 100, finishedAt: now, error: void 0, log: [...p.log || [], { at: now, text: (0, import_i18n.t)("\u5904\u7406\u5B8C\u6210") }].slice(-200) };
  for (const pid of speakerPersonIds(m)) if (!m.attendeeIds.includes(pid)) m.attendeeIds.push(pid);
  m.confirmations = [];
  syncConfirmations(m, /* @__PURE__ */ new Map());
  settleAfterSpeakers(m, now);
  if (m.status !== "pending_confirm") return { pending: [] };
  const pending = pendingIds(m);
  stampRequested(m, pending, now);
  return { pending };
}
var SPEAKER_EDIT_STATUSES = ["pending_assign", "pending_confirm", "pending_review"];
function afterSpeakerChange(m, before, prevStatus, now, extraPending = []) {
  const prevReviewAt = m.reviewStartedAt;
  const newly = syncConfirmations(m, before);
  for (const pid of extraPending) {
    const c = m.confirmations.find((x) => x.personId === pid);
    if (c && c.status !== "pending") {
      c.status = "pending";
      c.confirmedAt = void 0;
    }
    if (c && !newly.includes(pid)) newly.push(pid);
  }
  settleAfterSpeakers(m, now);
  if (prevStatus === "pending_review" && m.status === "pending_review") m.reviewStartedAt = prevReviewAt;
  else if (m.status !== "pending_review") m.reviewStartedAt = void 0;
  if (m.status !== "pending_confirm") return { pending: [] };
  const pending = prevStatus === "pending_assign" ? pendingIds(m) : newly;
  stampRequested(m, pending, now);
  return { pending };
}
function assignSpeaker(m, actor, label, personId, now) {
  assertHost(m, actor, (0, import_i18n.t)("\u6307\u8BA4\u53D1\u8A00\u4EBA"));
  assertMeetingStatus(m, SPEAKER_EDIT_STATUSES, (0, import_i18n.t)("\u6307\u8BA4\u53D1\u8A00\u4EBA"), true);
  const slot = m.speakers.find((s) => s.label === label);
  if (!slot) fail((0, import_i18n.t)("\u6CA1\u6709\u627E\u5230\u53D1\u8A00\u4EBA\u300C{p0}\u300D", { p0: label }));
  if (slot.personId === personId) return { pending: [] };
  const prevStatus = m.status;
  const before = labelSnapshot(m);
  slot.personId = personId;
  slot.matchedBy = "manual";
  slot.score = void 0;
  if (!m.attendeeIds.includes(personId)) m.attendeeIds.push(personId);
  return afterSpeakerChange(m, before, prevStatus, now);
}
function moveSegment(m, actor, segmentId, target, now) {
  assertHost(m, actor, (0, import_i18n.t)("\u4FEE\u6539\u8FD9\u6BB5\u7684\u53D1\u8A00\u4EBA"));
  assertMeetingStatus(m, SPEAKER_EDIT_STATUSES, (0, import_i18n.t)("\u4FEE\u6539\u8FD9\u6BB5\u7684\u53D1\u8A00\u4EBA"), true);
  const seg = m.segments.find((s) => s.id === segmentId);
  if (!seg) fail((0, import_i18n.t)("\u6CA1\u6709\u627E\u5230\u8FD9\u6BB5\u53D1\u8A00"));
  let slot = target.label ? m.speakers.find((s) => s.label === target.label) : void 0;
  if (target.label && !slot) fail((0, import_i18n.t)("\u6CA1\u6709\u627E\u5230\u53D1\u8A00\u4EBA\u300C{p0}\u300D", { p0: target.label }));
  if (!slot && target.personId) {
    slot = m.speakers.find((s) => s.personId === target.personId);
    if (!slot) {
      let n = m.speakers.length + 1;
      while (m.speakers.some((s) => s.label === `S${n}`)) n++;
      slot = { label: `S${n}`, personId: target.personId, matchedBy: "manual" };
      m.speakers.push(slot);
    }
  }
  if (!slot) fail((0, import_i18n.t)("\u8BF7\u9009\u62E9\u8FD9\u6BB5\u7684\u53D1\u8A00\u4EBA"));
  if (seg.speakerLabel === slot.label) return { pending: [] };
  const prevStatus = m.status;
  const before = labelSnapshot(m);
  if (seg.originalSpeakerLabel === void 0) seg.originalSpeakerLabel = seg.speakerLabel;
  seg.speakerLabel = slot.label;
  seg.editedBy = actor;
  seg.editedAt = now;
  const used = new Set(m.segments.map((s) => s.speakerLabel));
  m.speakers = m.speakers.filter((s) => used.has(s.label));
  if (slot.personId && !m.attendeeIds.includes(slot.personId)) m.attendeeIds.push(slot.personId);
  return afterSpeakerChange(m, before, prevStatus, now, slot.personId ? [slot.personId] : []);
}
function replaceSpeakerLabels(m, nameOf) {
  const pairs = m.speakers.filter((s) => /^S\d+$/.test(s.label) && s.personId).map((s) => ({ re: new RegExp(`(?<![A-Za-z0-9])${s.label}(?![0-9])`, "g"), name: nameOf(s.personId) || "" })).filter((x) => x.name);
  if (!pairs.length) return false;
  let changed = false;
  const fix = (t) => {
    let out = t;
    for (const p of pairs) out = out.replace(p.re, p.name);
    if (out !== t) changed = true;
    return out;
  };
  for (const d of m.decisions) d.text = fix(d.text);
  m.summaryLines = m.summaryLines.map(fix);
  for (const tp of m.topics) tp.title = fix(tp.title);
  return changed;
}
function saveMinutesDraft(m, actor, input, newIdFn) {
  assertHost(m, actor, (0, import_i18n.t)("\u4FEE\u6539\u51B3\u8BAE\u548C\u6458\u8981"));
  if (!FINALIZED_STATUSES.includes(m.status)) assertMeetingStatus(m, SPEAKER_EDIT_STATUSES, (0, import_i18n.t)("\u4FEE\u6539\u51B3\u8BAE\u548C\u6458\u8981"), true);
  if (Array.isArray(input.decisions)) {
    if (input.decisions.length > 50) fail((0, import_i18n.t)("\u51B3\u8BAE\u4E8B\u9879\u6700\u591A 50 \u6761"));
    const next = [];
    for (const d of input.decisions) {
      const text = String(d?.text ?? "").trim();
      if (!text) continue;
      if (text.length > 500) fail((0, import_i18n.t)("\u4E00\u6761\u51B3\u8BAE\u4E0D\u80FD\u8D85\u8FC7 500 \u5B57"));
      const prev = d?.id ? m.decisions.find((x) => x.id === d.id) : void 0;
      next.push(prev ? { ...prev, text } : { id: newIdFn(), text, segmentIds: [] });
    }
    m.decisions = next;
  }
  if (Array.isArray(input.summaryLines)) {
    const lines = input.summaryLines.map((x) => String(x ?? "").trim()).filter(Boolean);
    if (lines.length > 3) fail((0, import_i18n.t)("\u6458\u8981\u6700\u591A 3 \u884C"));
    if (lines.some((l) => l.length > 200)) fail((0, import_i18n.t)("\u4E00\u884C\u6458\u8981\u4E0D\u80FD\u8D85\u8FC7 200 \u5B57"));
    m.summaryLines = lines;
  }
}
function assertMinutesDraftEditable(m, actor, what) {
  assertHost(m, actor, what);
  assertMeetingStatus(m, SPEAKER_EDIT_STATUSES, what, true);
}
function editSegment(m, actor, segmentId, text, now) {
  const seg = m.segments.find((s) => s.id === segmentId);
  if (!seg) fail((0, import_i18n.t)("\u6CA1\u6709\u627E\u5230\u8FD9\u6BB5\u53D1\u8A00"));
  const value = String(text ?? "").trim();
  if (!value) fail((0, import_i18n.t)("\u53D1\u8A00\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A"));
  if (value.length > 1e4) fail((0, import_i18n.t)("\u8FD9\u6BB5\u53D1\u8A00\u592A\u957F\u4E86"));
  if (m.status === "pending_review") {
    assertHost(m, actor, (0, import_i18n.t)("\u5728\u7EC8\u5BA1\u65F6\u4FEE\u6539\u53D1\u8A00"));
  } else if (FINALIZED_STATUSES.includes(m.status)) {
    assertHost(m, actor, (0, import_i18n.t)("\u4FEE\u6539\u5DF2\u5B9A\u7A3F\u7EAA\u8981"));
  } else if (m.status === "pending_confirm") {
    if (m.hostId !== actor) {
      const owner = m.speakers.find((s) => s.label === seg.speakerLabel)?.personId;
      if (owner !== actor) fail((0, import_i18n.t)("\u53EA\u80FD\u4FEE\u6539\u672C\u4EBA\u7684\u53D1\u8A00"));
    }
  } else {
    assertMeetingStatus(m, ["pending_confirm", "pending_review"], (0, import_i18n.t)("\u4FEE\u6539\u53D1\u8A00"), true);
  }
  if (seg.originalText === void 0 && seg.text !== value) seg.originalText = seg.text;
  seg.text = value;
  seg.editedBy = actor;
  seg.editedAt = now;
}
function confirmSpeech(m, actor, now) {
  assertMeetingStatus(m, ["pending_confirm"], (0, import_i18n.t)("\u786E\u8BA4\u53D1\u8A00"), true);
  const c = m.confirmations.find((x) => x.personId === actor);
  if (!c) fail((0, import_i18n.t)("\u4F60\u4E0D\u662F\u8FD9\u573A\u4F1A\u8BAE\u7684\u53D1\u8A00\u4EBA"));
  if (c.status === "confirmed") fail((0, import_i18n.t)("\u4F60\u5DF2\u7ECF\u786E\u8BA4\u8FC7\u4E86"));
  c.status = "confirmed";
  c.confirmedAt = now;
  const allConfirmed = m.confirmations.every((x) => x.status === "confirmed");
  if (allConfirmed) {
    m.status = "pending_review";
    m.reviewStartedAt = now;
  }
  return { allConfirmed };
}
function returnToSpeaker(m, actor, personId, note, now) {
  assertHost(m, actor, (0, import_i18n.t)("\u9000\u56DE\u53D1\u8A00"));
  assertMeetingStatus(m, ["pending_review"], (0, import_i18n.t)("\u9000\u56DE\u53D1\u8A00"), true);
  const c = m.confirmations.find((x) => x.personId === personId);
  if (!c) fail((0, import_i18n.t)("\u8FD9\u4E2A\u4EBA\u4E0D\u662F\u672C\u573A\u4F1A\u8BAE\u7684\u53D1\u8A00\u4EBA"));
  c.status = "pending";
  c.confirmedAt = void 0;
  c.returnedAt = now;
  c.requestedAt = now;
  c.returnNote = String(note ?? "").trim().slice(0, 500);
  m.status = "pending_confirm";
  m.reviewStartedAt = void 0;
}
function approveMinutes(m, actor, now) {
  assertHost(m, actor, (0, import_i18n.t)("\u7EC8\u5BA1\u7EAA\u8981"));
  assertMeetingStatus(m, ["pending_review"], (0, import_i18n.t)("\u7EC8\u5BA1\u7EAA\u8981"));
  if (m.confirmations.some((c) => c.status !== "confirmed")) fail((0, import_i18n.t)("\u8FD8\u6709\u53D1\u8A00\u4EBA\u6CA1\u6709\u786E\u8BA4"));
  m.status = "finalized";
  m.finalizedAt = now;
  m.finalizedBy = actor;
}
function decideTasks(m, actor, decision) {
  assertHost(m, actor, (0, import_i18n.t)("\u9009\u62E9\u662F\u5426\u751F\u6210\u4EFB\u52A1"));
  if (m.status !== "finalized") fail((0, import_i18n.t)("\u4F1A\u8BAE\u5F53\u524D\u72B6\u6001\u662F\u300C{p0}\u300D\uFF0C\u4E0D\u80FD{p1}", { p0: meetingStatusLabel(m.status), p1: (0, import_i18n.t)("\u9009\u62E9\u662F\u5426\u751F\u6210\u4EFB\u52A1") }));
  if (decision !== "generate" && decision !== "none") fail((0, import_i18n.t)("\u8BF7\u9009\u62E9\u300C\u751F\u6210\u4EFB\u52A1\u300D\u6216\u300C\u65E0\u9700\u751F\u6210\u4EFB\u52A1\u300D"));
  m.taskDecision = decision;
  if (decision === "none") m.status = "ended";
}
function attachPlan(m, plan) {
  if (m.status !== "finalized" || m.taskDecision !== "generate") fail((0, import_i18n.t)("\u4F1A\u8BAE\u72B6\u6001\u5DF2\u53D8\u5316\uFF0C\u65B9\u6848\u4F5C\u5E9F"));
  m.plan = { ...plan, ownerId: void 0, ownerIds: void 0, confirmedAt: void 0, items: Array.isArray(plan.items) ? plan.items : [] };
  m.status = "pending_owner";
}
var MAX_PLAN_OWNERS = 10;
function setPlanOwner(m, actor, ownerIds) {
  assertHost(m, actor, (0, import_i18n.t)("\u6307\u5B9A\u4EFB\u52A1\u8D1F\u8D23\u4EBA"));
  assertMeetingStatus(m, ["pending_owner", "plan_confirm"], (0, import_i18n.t)("\u6307\u5B9A\u4EFB\u52A1\u8D1F\u8D23\u4EBA"));
  if (!m.plan) fail((0, import_i18n.t)("\u6267\u884C\u65B9\u6848\u8FD8\u6CA1\u6709\u751F\u6210"));
  const ids = [...new Set((Array.isArray(ownerIds) ? ownerIds : [ownerIds]).map((x) => String(x ?? "").trim()).filter(Boolean))];
  if (!ids.length) fail((0, import_i18n.t)("\u8BF7\u81F3\u5C11\u9009\u4E00\u4F4D\u4EFB\u52A1\u8D1F\u8D23\u4EBA"));
  if (ids.length > MAX_PLAN_OWNERS) fail((0, import_i18n.t)("\u4EFB\u52A1\u8D1F\u8D23\u4EBA\u6700\u591A {p0} \u4F4D", { p0: MAX_PLAN_OWNERS }));
  m.plan.ownerIds = ids;
  m.plan.ownerId = ids[0];
  m.status = "plan_confirm";
}
function assertPlanOwner(m, actor, what) {
  if (!planOwners(m.plan).includes(actor)) fail((0, import_i18n.t)("\u53EA\u6709\u4EFB\u52A1\u8D1F\u8D23\u4EBA\u53EF\u4EE5{p0}", { p0: what }));
}
function sanitizePlanItems(raw, org, newIdFn) {
  if (!Array.isArray(raw)) fail((0, import_i18n.t)("\u65B9\u6848\u5185\u5BB9\u683C\u5F0F\u4E0D\u5BF9"));
  if (raw.length > 200) fail((0, import_i18n.t)("\u4EFB\u52A1\u592A\u591A\u4E86\uFF08\u6700\u591A 200 \u9879\uFF09"));
  return raw.map((it, i) => {
    const n = i + 1;
    const deptId = typeof it?.deptId === "string" ? it.deptId : "";
    if (!deptId) fail((0, import_i18n.t)("\u7B2C {p0} \u9879\u4EFB\u52A1\u8FD8\u6CA1\u6709\u9009\u8D23\u4EFB\u90E8\u95E8\uFF08\u4E00\u9879\u4EFB\u52A1\u53EA\u80FD\u6709\u4E00\u4E2A\u8D23\u4EFB\u90E8\u95E8\uFF0C\u591A\u90E8\u95E8\u7684\u8BF7\u62C6\u5F00\uFF09", { p0: n }));
    if (!deptOf(org, deptId)) fail((0, import_i18n.t)("\u7B2C {p0} \u9879\u4EFB\u52A1\u7684\u8D23\u4EFB\u90E8\u95E8\u4E0D\u5728\u7EC4\u7EC7\u91CC", { p0: n }));
    const title = String(it?.title ?? "").trim();
    if (!title) fail((0, import_i18n.t)("\u7B2C {p0} \u9879\u4EFB\u52A1\u7684\u6267\u884C\u4E8B\u9879\u4E0D\u80FD\u4E3A\u7A7A", { p0: n }));
    const due = String(it?.due ?? "").trim();
    if (!isYmd(due)) fail((0, import_i18n.t)("\u7B2C {p0} \u9879\u4EFB\u52A1\u7684\u5B8C\u6210\u65F6\u95F4\u8BF7\u5199\u6210 2026-12-15 \u8FD9\u6837\u7684\u65E5\u671F", { p0: n }));
    const assigneeId = typeof it?.assigneeId === "string" ? it.assigneeId : "";
    if (assigneeId && !activePerson(org, assigneeId)) fail((0, import_i18n.t)("\u7B2C {p0} \u9879\u4EFB\u52A1\u300C\u4E0B\u53D1\u7ED9\u300D\u7684\u4EBA\u4E0D\u5728\u7EC4\u7EC7\u91CC\u6216\u5DF2\u79BB\u804C", { p0: n }));
    return {
      // 界面新加的条目 id 以 new- 开头（或没有 id）：换成正式 id
      id: typeof it?.id === "string" && it.id && !it.id.startsWith("new-") ? it.id : newIdFn(),
      deptId,
      title: title.slice(0, 200),
      standard: String(it?.standard ?? "").trim().slice(0, 2e3),
      due,
      ...typeof it?.decisionId === "string" && it.decisionId ? { decisionId: it.decisionId } : {},
      ...assigneeId ? { assigneeId } : {}
    };
  });
}
function savePlan(m, actor, items, summary) {
  assertMeetingStatus(m, ["plan_confirm"], (0, import_i18n.t)("\u7F16\u8F91\u6267\u884C\u65B9\u6848"));
  assertPlanOwner(m, actor, (0, import_i18n.t)("\u7F16\u8F91\u6267\u884C\u65B9\u6848"));
  m.plan.items = items;
  if (typeof summary === "string") m.plan.summary = summary.slice(0, 2e4);
}
function planItemAssignee(org, it) {
  return it.assigneeId ? activePerson(org, it.assigneeId) : firstLeader(org, it.deptId);
}
function confirmPlan(m, actor, project, org, now, newIdFn) {
  assertMeetingStatus(m, ["plan_confirm"], (0, import_i18n.t)("\u786E\u8BA4\u6267\u884C\u65B9\u6848"));
  assertPlanOwner(m, actor, (0, import_i18n.t)("\u786E\u8BA4\u6267\u884C\u65B9\u6848"));
  assertProjectActive(project);
  const plan = m.plan;
  if (!plan.items.length) fail((0, import_i18n.t)("\u65B9\u6848\u91CC\u8FD8\u6CA1\u6709\u4EFB\u52A1"));
  const owners = planOwners(plan);
  const tasks = plan.items.map((it, i) => {
    if (!deptOf(org, it.deptId)) fail((0, import_i18n.t)("\u7B2C {p0} \u9879\u4EFB\u52A1\u7684\u8D23\u4EFB\u90E8\u95E8\u4E0D\u5728\u7EC4\u7EC7\u91CC", { p0: i + 1 }));
    const leader = planItemAssignee(org, it);
    if (!leader) {
      if (it.assigneeId) fail((0, import_i18n.t)("\u7B2C {p0} \u9879\u4EFB\u52A1\u300C\u4E0B\u53D1\u7ED9\u300D\u7684\u4EBA\u4E0D\u5728\u7EC4\u7EC7\u91CC\u6216\u5DF2\u79BB\u804C", { p0: i + 1 }));
      fail((0, import_i18n.t)("\u7B2C {p0} \u9879\u4EFB\u52A1\uFF1A{p1}\u3002\u53EF\u4EE5\u5728\u300C\u4E0B\u53D1\u7ED9\u300D\u91CC\u76F4\u63A5\u9009\u4EBA", { p0: i + 1, p1: leaderProblem(org, it.deptId) || "" }));
    }
    if (!isYmd(it.due)) fail((0, import_i18n.t)("\u7B2C {p0} \u9879\u4EFB\u52A1\u7684\u5B8C\u6210\u65F6\u95F4\u8BF7\u5199\u6210 2026-12-15 \u8FD9\u6837\u7684\u65E5\u671F", { p0: i + 1 }));
    return {
      id: newIdFn(),
      projectId: m.projectId,
      meetingId: m.id,
      planItemId: it.id,
      deptId: it.deptId,
      assigneeId: leader.id,
      ownerId: owners[0],
      ownerIds: owners,
      title: it.title,
      standard: it.standard,
      due: it.due,
      status: "to_accept",
      percent: 0,
      createdAt: now,
      objectionHistory: [],
      progressLog: [],
      events: [{ at: now, by: actor, action: "created" }],
      reminders: {}
    };
  });
  plan.confirmedAt = now;
  m.status = "dispatched";
  m.taskIds = tasks.map((t) => t.id);
  return tasks;
}
function isTaskOverdue(t, now) {
  if (t.status !== "not_started" && t.status !== "in_progress") return false;
  return isYmd(t.due) && ymd(now) > t.due;
}
function taskOverdueDays(t, now) {
  return isTaskOverdue(t, now) ? Math.max(1, daysBetweenYmd(t.due, ymd(now))) : 0;
}
function assertAssignee(t, actor, what) {
  if (t.assigneeId !== actor) fail((0, import_i18n.t)("\u53EA\u6709\u63A5\u6536\u4EFB\u52A1\u7684\u90E8\u95E8\u8D1F\u8D23\u4EBA\u53EF\u4EE5{p0}", { p0: what }));
}
function assertNoObjection(t) {
  if (hasOpenObjection(t)) fail((0, import_i18n.t)("\u4EFB\u52A1\u6B63\u5728\u5F02\u8BAE\u5904\u7406\u4E2D\uFF0C\u7B49\u5904\u7406\u5B8C\u518D\u64CD\u4F5C"));
}
function assertTaskStatus(t, allowed, what) {
  if (allowed.includes(t.status)) return;
  fail((0, import_i18n.t)("\u4EFB\u52A1\u5F53\u524D\u72B6\u6001\u662F\u300C{p0}\u300D\uFF0C\u4E0D\u80FD{p1}", { p0: taskStatusLabel(t.status), p1: what }));
}
var log = (t, by, action, at, note) => {
  t.events.push({ at, by, action, ...note ? { note } : {} });
};
function acceptTask(t, actor, now) {
  assertAssignee(t, actor, (0, import_i18n.t)("\u63A5\u6536\u4EFB\u52A1"));
  assertNoObjection(t);
  assertTaskStatus(t, ["to_accept"], (0, import_i18n.t)("\u63A5\u6536"));
  t.status = "not_started";
  t.acceptedAt = now;
  log(t, actor, "accepted", now);
}
function updateProgress(t, actor, percent, note, now, status) {
  assertAssignee(t, actor, (0, import_i18n.t)("\u66F4\u65B0\u8FDB\u5EA6"));
  assertNoObjection(t);
  assertTaskStatus(t, ["not_started", "in_progress"], (0, import_i18n.t)("\u66F4\u65B0\u8FDB\u5EA6"));
  const p = Math.round(Number(percent));
  if (!Number.isFinite(p) || p < 0 || p > 100) fail((0, import_i18n.t)("\u8FDB\u5EA6\u8BF7\u586B 0~100 \u4E4B\u95F4\u7684\u6570"));
  if (status === "not_started" && p > 0) fail((0, import_i18n.t)("\u300C\u672A\u5F00\u59CB\u300D\u7684\u4EFB\u52A1\u8FDB\u5EA6\u53EA\u80FD\u662F 0"));
  const text = String(note ?? "").trim().slice(0, 2e3);
  const next = status === "not_started" ? "not_started" : "in_progress";
  t.status = next;
  t.percent = p;
  t.progressLog.push({ at: now, by: actor, status: next, percent: p, note: text });
  log(t, actor, "progress", now, text || void 0);
}
function completeTask(t, actor, note, now) {
  assertAssignee(t, actor, (0, import_i18n.t)("\u6807\u8BB0\u5B8C\u6210"));
  assertNoObjection(t);
  if (t.status === "not_started") fail((0, import_i18n.t)("\u8BF7\u5148\u66F4\u65B0\u8FDB\u5EA6\uFF0C\u518D\u6807\u8BB0\u5B8C\u6210"));
  assertTaskStatus(t, ["in_progress"], (0, import_i18n.t)("\u6807\u8BB0\u5B8C\u6210"));
  const text = String(note ?? "").trim().slice(0, 2e3);
  t.status = "done";
  t.percent = 100;
  t.doneAt = now;
  t.progressLog.push({ at: now, by: actor, status: "done", percent: 100, note: text });
  log(t, actor, "done", now, text || void 0);
}
function raiseObjection(t, actor, input, now, id) {
  assertAssignee(t, actor, (0, import_i18n.t)("\u63D0\u51FA\u5F02\u8BAE"));
  assertNoObjection(t);
  assertTaskStatus(t, ["to_accept", "not_started", "in_progress"], (0, import_i18n.t)("\u63D0\u51FA\u5F02\u8BAE"));
  if (!["content", "time", "requirement"].includes(input?.target)) fail((0, import_i18n.t)("\u8BF7\u9009\u62E9\u5F02\u8BAE\u9488\u5BF9\u7684\u662F\u4EFB\u52A1\u5185\u5BB9\u3001\u65F6\u95F4\u8282\u70B9\u8FD8\u662F\u6267\u884C\u8981\u6C42"));
  const reason = String(input.reason ?? "").trim();
  if (!reason) fail((0, import_i18n.t)("\u8BF7\u586B\u5199\u5F02\u8BAE\u539F\u56E0"));
  const due = String(input.suggestedDue ?? "").trim();
  if (due && !isYmd(due)) fail((0, import_i18n.t)("\u5EFA\u8BAE\u7684\u622A\u6B62\u65E5\u8BF7\u5199\u6210 2026-12-20 \u8FD9\u6837\u7684\u65E5\u671F"));
  const o = {
    id,
    kind: t.status === "to_accept" ? "objection" : "change",
    target: input.target,
    reason: reason.slice(0, 2e3),
    suggestion: String(input.suggestion ?? "").trim().slice(0, 2e3),
    ...due ? { suggestedDue: due } : {},
    raisedBy: actor,
    raisedAt: now,
    prevStatus: t.status,
    stage: "review"
  };
  t.objection = o;
  log(t, actor, "objection_raised", now, o.reason);
  return o;
}
function applyChanges(t, o, changes) {
  const c = changes || {};
  if (c.title !== void 0) {
    const v = String(c.title).trim();
    if (!v) fail((0, import_i18n.t)("\u6267\u884C\u4E8B\u9879\u4E0D\u80FD\u4E3A\u7A7A"));
    t.title = v.slice(0, 200);
  }
  if (c.standard !== void 0) t.standard = String(c.standard).trim().slice(0, 2e3);
  let due = c.due !== void 0 ? String(c.due).trim() : "";
  if (!due && o.target === "time" && o.suggestedDue) due = o.suggestedDue;
  if (due) {
    if (!isYmd(due)) fail((0, import_i18n.t)("\u622A\u6B62\u65E5\u8BF7\u5199\u6210 2026-12-20 \u8FD9\u6837\u7684\u65E5\u671F"));
    if (due !== t.due) {
      t.due = due;
      t.reminders = {};
    }
  }
}
function resolveObjection(t, outcome, now) {
  const o = t.objection;
  o.stage = "resolved";
  o.outcome = outcome;
  o.resolvedAt = now;
  t.objectionHistory.push(o);
  t.objection = void 0;
}
function cancelTask(t, actor, now, note) {
  resolveObjection(t, "cancelled", now);
  t.status = "cancelled";
  log(t, actor, "cancelled", now, note || void 0);
}
function reviewObjection(t, actor, decision, note, changes, now) {
  if (!taskOwners(t).includes(actor)) fail((0, import_i18n.t)("\u53EA\u6709\u4EFB\u52A1\u8D1F\u8D23\u4EBA\u53EF\u4EE5\u590D\u6838\u5F02\u8BAE"));
  const o = t.objection;
  if (!o || o.stage !== "review") fail((0, import_i18n.t)("\u8FD9\u4E2A\u4EFB\u52A1\u6CA1\u6709\u5F85\u590D\u6838\u7684\u5F02\u8BAE"));
  const text = String(note ?? "").trim().slice(0, 2e3);
  if (decision === "adopt") {
    o.review = { by: actor, at: now, decision: "adopt", note: text };
    if (changes?.cancel) {
      cancelTask(t, actor, now, text);
      return "cancelled";
    }
    applyChanges(t, o, changes);
    resolveObjection(t, "adopted", now);
    t.status = "to_accept";
    t.acceptedAt = void 0;
    log(t, actor, "review_adopt", now, text || void 0);
    return "adopted";
  }
  if (decision === "reject") {
    if (changes?.cancel) fail((0, import_i18n.t)("\u9A73\u56DE\u65F6\u4E0D\u80FD\u5220\u9664\u4EFB\u52A1\uFF1B\u8981\u5220\u9664\u8BF7\u9009\u62E9\u300C\u91C7\u7EB3\u5E76\u8C03\u6574\u300D"));
    o.review = { by: actor, at: now, decision: "reject", note: text };
    o.stage = "dept_reply";
    log(t, actor, "review_reject", now, text || void 0);
    return "rejected";
  }
  fail((0, import_i18n.t)("\u8BF7\u9009\u62E9\u300C\u91C7\u7EB3\u5E76\u8C03\u6574\u300D\u6216\u300C\u9A73\u56DE\u300D"));
}
function replyObjection(t, actor, decision, now) {
  assertAssignee(t, actor, (0, import_i18n.t)("\u56DE\u5E94\u9A73\u56DE"));
  const o = t.objection;
  if (!o || o.stage !== "dept_reply") fail((0, import_i18n.t)("\u8FD9\u4E2A\u4EFB\u52A1\u6CA1\u6709\u5F85\u4F60\u56DE\u5E94\u7684\u9A73\u56DE"));
  if (decision === "accept") {
    const prev = o.prevStatus;
    resolveObjection(t, "accepted_reject", now);
    t.status = prev;
    log(t, actor, "reply_accept", now);
    return "accepted_reject";
  }
  if (decision === "escalate") {
    o.stage = "arbitration";
    log(t, actor, "escalated", now);
    return "escalated";
  }
  fail((0, import_i18n.t)("\u8BF7\u9009\u62E9\u300C\u63A5\u53D7\u9A73\u56DE\u300D\u6216\u300C\u63D0\u4EA4\u88C1\u51B3\u300D"));
}
function arbitrateObjection(t, actor, projectOwnerId, decision, note, changes, now) {
  if (actor !== projectOwnerId) fail((0, import_i18n.t)("\u53EA\u6709\u9879\u76EE\u8D1F\u8D23\u4EBA\u53EF\u4EE5\u88C1\u51B3"));
  const o = t.objection;
  if (!o || o.stage !== "arbitration") fail((0, import_i18n.t)("\u8FD9\u4E2A\u4EFB\u52A1\u6CA1\u6709\u5F85\u88C1\u51B3\u7684\u5F02\u8BAE"));
  const text = String(note ?? "").trim().slice(0, 2e3);
  const toRunning = () => {
    if (o.prevStatus === "in_progress") t.status = "in_progress";
    else {
      t.status = "not_started";
      if (!t.acceptedAt) t.acceptedAt = now;
    }
  };
  if (decision === "keep") {
    o.arbitration = { by: actor, at: now, decision: "keep", note: text };
    resolveObjection(t, "kept", now);
    toRunning();
    log(t, actor, "arbitrate_keep", now, text || void 0);
    return "kept";
  }
  if (decision === "adjust") {
    o.arbitration = { by: actor, at: now, decision: "adjust", note: text };
    if (changes?.cancel) {
      cancelTask(t, actor, now, text);
      return "cancelled";
    }
    applyChanges(t, o, changes);
    resolveObjection(t, "adjusted", now);
    toRunning();
    log(t, actor, "arbitrate_adjust", now, text || void 0);
    return "adjusted";
  }
  fail((0, import_i18n.t)("\u8BF7\u9009\u62E9\u300C\u7EF4\u6301\u539F\u65B9\u6848\u300D\u6216\u300C\u6309\u5F02\u8BAE\u8C03\u6574\u300D"));
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/todos.ts
var import_i18n2 = require("npm:@totalclaw/i18n");
var ownerNames = (org, ids) => ids.map((id) => personName(org, id)).filter(Boolean).join((0, import_i18n2.t)("\u3001"));
function waitedHint(since, now) {
  if (!since) return "";
  const ms = Math.max(0, now - since);
  if (ms >= DAY_MS) return (0, import_i18n2.t)("\u5DF2\u7B49\u5F85 {n} \u5929", { n: Math.floor(ms / DAY_MS) });
  if (ms >= HOUR_MS) return (0, import_i18n2.t)("\u5DF2\u7B49\u5F85 {n} \u5C0F\u65F6", { n: Math.floor(ms / HOUR_MS) });
  return (0, import_i18n2.t)("\u521A\u521A");
}
function remainHint(deadline, now) {
  const ms = deadline - now;
  if (ms >= DAY_MS) return (0, import_i18n2.t)("\u5269 {n} \u5929", { n: Math.ceil(ms / DAY_MS) });
  return (0, import_i18n2.t)("\u5269 {n} \u5C0F\u65F6", { n: Math.max(1, Math.ceil(ms / HOUR_MS)) });
}
function overdueHint(days) {
  return (0, import_i18n2.t)("\u903E\u671F {n} \u5929", { n: Math.max(1, days) });
}
function dueHint(due, now) {
  if (!isYmd(due)) return "";
  const today = ymd(now);
  if (due < today) return overdueHint(daysBetweenYmd(due, today));
  if (due === today) return remainHint(endOfDay(now), now);
  return (0, import_i18n2.t)("\u5269 {n} \u5929", { n: daysBetweenYmd(today, due) });
}
function personName(org, id) {
  if (!id) return "";
  return org.people.find((p) => p.id === id)?.name || (0, import_i18n2.t)("\u672A\u77E5\u4EBA\u5458");
}
function deptName(org, id) {
  if (!id) return "";
  return org.depts.find((d) => d.id === id)?.name || (0, import_i18n2.t)("\u672A\u77E5\u90E8\u95E8");
}
function taskView(t, s, now) {
  return {
    ...t,
    overdue: isTaskOverdue(t, now),
    overdueDays: taskOverdueDays(t, now),
    projectName: s.projects.find((p) => p.id === t.projectId)?.name || "",
    meetingTitle: s.meetings.find((m) => m.id === t.meetingId)?.title || "",
    deptName: deptName(s.org, t.deptId),
    assigneeName: personName(s.org, t.assigneeId),
    ownerName: ownerNames(s.org, taskOwners(t))
  };
}
var URGENCY_ORDER = { urgent: 0, today: 1, week: 2 };
function confirmStartAt(m, personId) {
  const c = m.confirmations.find((x) => x.personId === personId);
  return c?.requestedAt || c?.returnedAt || m.process?.finishedAt || m.createdAt;
}
function dueUrgency(t, now) {
  if (isTaskOverdue(t, now)) return "urgent";
  return t.due === ymd(now) ? "today" : "week";
}
function lastProgressAt(t) {
  const last = t.progressLog.length ? t.progressLog[t.progressLog.length - 1].at : 0;
  return last || t.acceptedAt || t.createdAt;
}
function needsProgressUpdate(t, settings, now) {
  if (t.status !== "not_started" && t.status !== "in_progress") return false;
  if (hasOpenObjection(t)) return false;
  if (isTaskOverdue(t, now)) return true;
  if (isYmd(t.due) && daysBetweenYmd(ymd(now), t.due) <= Math.max(0, settings.dueRemindDays)) return true;
  return now - lastProgressAt(t) >= Math.max(1, settings.trackCycleDays) * DAY_MS;
}
function computeTodos(s, personId, now) {
  if (!personId) return [];
  const todos = [];
  const projectOf = (id) => s.projects.find((p) => p.id === id);
  const live = (projectId) => {
    const p = projectOf(projectId);
    return !!p && p.status !== "archived";
  };
  const pname = (projectId) => projectOf(projectId)?.name || "";
  const timeoutMs = Math.max(1, s.settings.confirmTimeoutHours) * HOUR_MS;
  for (const m of s.meetings) {
    if (!live(m.projectId)) continue;
    const base = { at: m.time, group: "meeting" };
    const isHost = m.hostId === personId;
    if (isHost && m.status === "failed") {
      todos.push({
        ...base,
        id: `retry_process:${m.id}`,
        type: "retry_process",
        title: m.title,
        subtitle: (0, import_i18n2.t)("{p0} \xB7 \u5904\u7406\u5931\u8D25\uFF1A{p1}", { p0: pname(m.projectId), p1: m.process?.error || (0, import_i18n2.t)("\u539F\u56E0\u672A\u77E5") }),
        urgency: "week",
        hint: waitedHint(m.process?.finishedAt, now),
        link: { kind: "meeting", id: m.id },
        at: m.process?.finishedAt || m.time
      });
    }
    if (isHost && m.status === "pending_assign") {
      const n = m.speakers.filter((x) => !x.personId).length;
      todos.push({
        ...base,
        id: `assign_speaker:${m.id}`,
        type: "assign_speaker",
        title: m.title,
        subtitle: (0, import_i18n2.t)("{p0} \xB7 \u6709 {n} \u4F4D\u53D1\u8A00\u4EBA\u6CA1\u6709\u8BC6\u522B\u51FA\u6765\uFF0C\u8BF7\u6307\u8BA4", { p0: pname(m.projectId), n }),
        urgency: "week",
        hint: waitedHint(m.process?.finishedAt, now),
        link: { kind: "meeting", id: m.id },
        at: m.process?.finishedAt || m.time
      });
    }
    if (m.status === "pending_confirm") {
      const c = m.confirmations.find((x) => x.personId === personId && x.status === "pending");
      if (c) {
        const start = confirmStartAt(m, personId);
        const deadline = start + timeoutMs;
        const urgency = deadline <= endOfDay(now) ? "today" : "week";
        todos.push({
          ...base,
          id: `confirm_speech:${m.id}`,
          type: "confirm_speech",
          title: m.title,
          subtitle: c.returnedAt ? (0, import_i18n2.t)("{p0} \xB7 \u4E3B\u6301\u4EBA\u9000\u56DE\u4E86\u4F60\u7684\u53D1\u8A00\uFF1A{p1}", { p0: pname(m.projectId), p1: c.returnNote || (0, import_i18n2.t)("\u8BF7\u91CD\u65B0\u6838\u5BF9") }) : (0, import_i18n2.t)("{p0} \xB7 \u8BF7\u6838\u5BF9\u5E76\u786E\u8BA4\u4F60\u7684\u53D1\u8A00", { p0: pname(m.projectId) }),
          urgency,
          hint: deadline > now ? remainHint(deadline, now) : waitedHint(start, now),
          link: { kind: "meeting", id: m.id },
          at: start
        });
      }
    }
    if (isHost && m.status === "pending_review") {
      const since = m.reviewStartedAt || m.time;
      todos.push({
        ...base,
        id: `review_minutes:${m.id}`,
        type: "review_minutes",
        title: m.title,
        subtitle: (0, import_i18n2.t)("{p0} \xB7 \u53D1\u8A00\u4EBA\u5DF2\u5168\u90E8\u786E\u8BA4\uFF0C\u5F85\u4F60\u7EC8\u5BA1", { p0: pname(m.projectId) }),
        urgency: now - since >= timeoutMs ? "today" : "week",
        hint: waitedHint(since, now),
        link: { kind: "meeting", id: m.id },
        at: since
      });
    }
    if (isHost && m.status === "finalized" && !m.taskDecision) {
      todos.push({
        ...base,
        id: `decide_tasks:${m.id}`,
        type: "decide_tasks",
        title: m.title,
        subtitle: (0, import_i18n2.t)("{p0} \xB7 \u7EAA\u8981\u5DF2\u5B9A\u7A3F\uFF0C\u8BF7\u9009\u62E9\u662F\u5426\u751F\u6210\u4EFB\u52A1", { p0: pname(m.projectId) }),
        urgency: "week",
        hint: waitedHint(m.finalizedAt, now),
        link: { kind: "meeting", id: m.id },
        at: m.finalizedAt || m.time
      });
    }
    if (isHost && m.status === "pending_owner") {
      todos.push({
        ...base,
        id: `assign_owner:${m.id}`,
        type: "assign_owner",
        title: m.title,
        subtitle: (0, import_i18n2.t)("{p0} \xB7 AI \u5DF2\u751F\u6210\u6267\u884C\u65B9\u6848\uFF08{n} \u9879\u4EFB\u52A1\uFF09\uFF0C\u8BF7\u6307\u5B9A\u4EFB\u52A1\u8D1F\u8D23\u4EBA", { p0: pname(m.projectId), n: m.plan?.items.length || 0 }),
        urgency: "week",
        hint: waitedHint(m.plan?.generatedAt, now),
        link: { kind: "meeting_plan", id: m.id },
        at: m.plan?.generatedAt || m.time
      });
    }
    if (m.status === "plan_confirm" && m.plan && planOwners(m.plan).includes(personId)) {
      todos.push({
        ...base,
        id: `confirm_plan:${m.id}`,
        type: "confirm_plan",
        title: m.title,
        subtitle: (0, import_i18n2.t)("{p0} \xB7 {n} \u9879\u4EFB\u52A1\u5F85\u4F60\u786E\u8BA4\u540E\u4E0B\u53D1", { p0: pname(m.projectId), n: m.plan.items.length }),
        urgency: "week",
        hint: waitedHint(m.plan.generatedAt, now),
        link: { kind: "meeting_plan", id: m.id },
        at: m.plan.generatedAt || m.time
      });
    }
  }
  for (const t of s.tasks) {
    if (!live(t.projectId)) continue;
    const project = projectOf(t.projectId);
    const link = { kind: "task", id: t.id };
    const o = t.objection && t.objection.stage !== "resolved" ? t.objection : void 0;
    if (t.assigneeId === personId && t.status === "to_accept" && !o) {
      const since = [...t.events].reverse().find((e) => e.action === "review_adopt")?.at || t.createdAt;
      todos.push({
        id: `accept_task:${t.id}`,
        type: "accept_task",
        title: t.title,
        subtitle: (0, import_i18n2.t)("{p0} \xB7 \u622A\u6B62 {p1}", { p0: project.name, p1: t.due }),
        urgency: t.due <= ymd(now) ? "today" : "week",
        hint: waitedHint(since, now),
        link,
        at: since,
        group: "task"
      });
    }
    if (t.assigneeId === personId && needsProgressUpdate(t, s.settings, now)) {
      const overdue = isTaskOverdue(t, now);
      todos.push({
        id: `update_progress:${t.id}`,
        type: "update_progress",
        title: t.title,
        subtitle: overdue ? (0, import_i18n2.t)("{p0} \xB7 \u622A\u6B62 {p1} \u5DF2\u903E\u671F\uFF0C\u8BF7\u66F4\u65B0\u8FDB\u5EA6", { p0: project.name, p1: t.due }) : (0, import_i18n2.t)("{p0} \xB7 \u622A\u6B62 {p1} \xB7 \u5F53\u524D\u8FDB\u5EA6 {n}%", { p0: project.name, p1: t.due, n: t.percent }),
        urgency: dueUrgency(t, now),
        hint: dueHint(t.due, now),
        link,
        at: isYmd(t.due) ? ymdStart(t.due) : t.createdAt,
        group: "task"
      });
    }
    if (!o) continue;
    if (o.stage === "review" && taskOwners(t).includes(personId)) {
      todos.push({
        id: `review_objection:${t.id}`,
        type: "review_objection",
        title: t.title,
        subtitle: o.kind === "change" ? (0, import_i18n2.t)("{p0}\u7533\u8BF7\u53D8\u66F4\uFF1A{p1}", { p0: personName(s.org, o.raisedBy), p1: o.reason }) : (0, import_i18n2.t)("{p0}\u63D0\u51FA\u5F02\u8BAE\uFF1A{p1}", { p0: personName(s.org, o.raisedBy), p1: o.reason }),
        urgency: isTaskOverdue(t, now) ? "urgent" : "week",
        hint: waitedHint(o.raisedAt, now),
        link,
        at: o.raisedAt,
        group: "task"
      });
    }
    if (o.stage === "dept_reply" && t.assigneeId === personId) {
      todos.push({
        id: `dept_reply:${t.id}`,
        type: "dept_reply",
        title: t.title,
        subtitle: (0, import_i18n2.t)("{p0}\u9A73\u56DE\u4E86\u4F60\u7684\u5F02\u8BAE\uFF0C\u8BF7\u9009\u62E9\u63A5\u53D7\u9A73\u56DE\u6216\u63D0\u4EA4\u88C1\u51B3", { p0: personName(s.org, o.review?.by || t.ownerId) }),
        urgency: isTaskOverdue(t, now) ? "urgent" : "week",
        hint: waitedHint(o.review?.at || o.raisedAt, now),
        link,
        at: o.review?.at || o.raisedAt,
        group: "task"
      });
    }
    if (o.stage === "arbitration" && project.ownerId === personId) {
      const since = [...t.events].reverse().find((e) => e.action === "escalated")?.at || o.review?.at || o.raisedAt;
      todos.push({
        id: `arbitrate:${t.id}`,
        type: "arbitrate",
        title: t.title,
        subtitle: o.suggestedDue ? (0, import_i18n2.t)("{p0}\u4E0E{p1}\u5BF9\u622A\u6B62\u65E5\u6709\u5206\u6B67\uFF08{p2} / {p3}\uFF09", { p0: personName(s.org, t.assigneeId), p1: ownerNames(s.org, taskOwners(t)), p2: t.due, p3: o.suggestedDue }) : (0, import_i18n2.t)("{p0}\u4E0E{p1}\u5BF9\u4EFB\u52A1\u6709\u5206\u6B67\uFF0C\u5F85\u4F60\u88C1\u51B3", { p0: personName(s.org, t.assigneeId), p1: ownerNames(s.org, taskOwners(t)) }),
        urgency: "urgent",
        hint: waitedHint(since, now),
        link,
        at: since,
        group: "task"
      });
    }
  }
  for (const p of s.projects) {
    if (p.status === "closing" && p.ownerId === personId && p.summary && !p.summary.approvedAt) {
      todos.push({
        id: `review_report:${p.id}`,
        type: "review_report",
        title: p.name,
        subtitle: (0, import_i18n2.t)("AI \u5DF2\u751F\u6210\u9879\u76EE\u603B\u7ED3\u62A5\u544A\uFF0C\u5F85\u4F60\u5BA1\u6838\u540E\u5F52\u6863"),
        urgency: "week",
        hint: waitedHint(p.summary.generatedAt, now),
        link: { kind: "project_summary", id: p.id },
        at: p.summary.generatedAt,
        group: "project"
      });
    }
  }
  return todos.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || a.at - b.at);
}
function todoBadges(todos) {
  return {
    home: todos.length,
    meetings: todos.filter((t) => t.group === "meeting").length,
    tasks: todos.filter((t) => t.group === "task").length
  };
}
var ACTIVE_FOR_ME = (t) => t.status === "to_accept" || t.status === "not_started" || t.status === "in_progress";
function myTaskReminders(s, personId, now) {
  if (!personId) return { dueThisWeek: [], overdue: [] };
  const week = weekRange(now);
  const today = ymd(now);
  const mine = s.tasks.filter((t) => t.assigneeId === personId && ACTIVE_FOR_ME(t) && s.projects.find((p) => p.id === t.projectId)?.status !== "archived");
  const byDue = (a, b) => a.due.localeCompare(b.due);
  return {
    dueThisWeek: mine.filter((t) => !isTaskOverdue(t, now) && t.due >= today && t.due <= week.toYmd).sort(byDue).map((t) => taskView(t, s, now)),
    overdue: mine.filter((t) => isTaskOverdue(t, now)).sort(byDue).map((t) => taskView(t, s, now))
  };
}
function myTasksThisWeek(s, personId, now) {
  const r = myTaskReminders(s, personId, now);
  return [...r.overdue, ...r.dueThisWeek];
}
function homeCounts(todos, s, personId, unread, now) {
  const today = ymd(now);
  const mine = personId ? s.tasks.filter((t) => t.assigneeId === personId && ACTIVE_FOR_ME(t) && s.projects.find((p) => p.id === t.projectId)?.status !== "archived") : [];
  return {
    todos: todos.length,
    dueToday: mine.filter((t) => t.due === today).length,
    overdue: mine.filter((t) => isTaskOverdue(t, now)).length,
    unread
  };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/demo.ts
var DAY = 864e5;
var HOUR = 36e5;
var DEMO_ADMIN_ID = "linxiao";
var DEPTS = [
  ["d_ops", "\u8FD0\u8425\u4E2D\u5FC3", "linxiao"],
  ["d_rd", "\u7814\u53D1\u90E8", "zhaolei"],
  ["d_qa", "\u8D28\u91CF\u90E8", "sunhao"],
  ["d_pur", "\u91C7\u8D2D\u90E8", "zhouting"],
  ["d_prod", "\u751F\u4EA7\u90E8", "wugang"],
  ["d_proc", "\u5DE5\u827A\u90E8", "zhengkai"]
];
var PEOPLE = [
  ["linxiao", "\u6797\u6653", "d_ops", "\u8FD0\u8425\u603B\u76D1"],
  ["chenlifeng", "\u9648\u7ACB\u5CF0", "d_ops", "\u9879\u76EE\u603B\u76D1", "linxiao"],
  ["liuyang", "\u5218\u6D0B", "d_ops", "\u9879\u76EE\u7ECF\u7406", "linxiao"],
  ["lina", "\u674E\u5A1C", "d_ops", "\u8FD0\u8425\u4E13\u5458", "linxiao"],
  ["zhaolei", "\u8D75\u78CA", "d_rd", "\u7814\u53D1\u7ECF\u7406"],
  ["qiancheng", "\u94B1\u7A0B", "d_rd", "\u786C\u4EF6\u5DE5\u7A0B\u5E08", "zhaolei"],
  ["huanghai", "\u9EC4\u6D77", "d_rd", "\u8F6F\u4EF6\u5DE5\u7A0B\u5E08", "zhaolei"],
  ["machao", "\u9A6C\u8D85", "d_rd", "\u6D4B\u8BD5\u5DE5\u7A0B\u5E08", "zhaolei"],
  ["sunhao", "\u5B59\u6D69", "d_qa", "\u8D28\u91CF\u7ECF\u7406"],
  ["yangfan", "\u6768\u5E06", "d_qa", "\u8D28\u91CF\u5DE5\u7A0B\u5E08", "sunhao"],
  ["zhulin", "\u6731\u7433", "d_qa", "\u68C0\u9A8C\u5458", "sunhao"],
  ["zhouting", "\u5468\u5A77", "d_pur", "\u91C7\u8D2D\u7ECF\u7406"],
  ["hejing", "\u4F55\u9759", "d_pur", "\u91C7\u8D2D\u4E13\u5458", "zhouting"],
  ["xuliang", "\u8BB8\u4EAE", "d_pur", "\u4F9B\u5E94\u5546\u7BA1\u7406", "zhouting"],
  ["wugang", "\u5434\u521A", "d_prod", "\u751F\u4EA7\u7ECF\u7406"],
  ["luojun", "\u7F57\u519B", "d_prod", "\u8F66\u95F4\u4E3B\u4EFB", "wugang"],
  ["gaofeng", "\u9AD8\u5CF0", "d_prod", "\u751F\u4EA7\u8BA1\u5212\u5458", "wugang"],
  ["zhengkai", "\u90D1\u51EF", "d_proc", "\u5DE5\u827A\u7ECF\u7406"],
  ["liangyu", "\u6881\u5B87", "d_proc", "\u5DE5\u827A\u5DE5\u7A0B\u5E08", "zhengkai"],
  ["songjia", "\u5B8B\u4F73", "d_proc", "\u5DE5\u827A\u5DE5\u7A0B\u5E08", "zhengkai"]
];
function buildDemoOrg() {
  return {
    depts: DEPTS.map(([id, name, leaderId]) => ({ id, name, leaderIds: [leaderId] })),
    people: PEOPLE.map(([id, name, deptId, title, leaderId]) => ({ id, name, deptId, title, wecomUserId: id, ...leaderId ? { leaderId } : {} }))
  };
}
function buildMeeting(s) {
  const lines = s.lines || [];
  const labels = /* @__PURE__ */ new Map();
  let unknown = 0;
  const speakers = [];
  const labelOf = (pid, i) => {
    if (!pid) {
      const prev = i > 0 && lines[i - 1][0] === null ? speakers[speakers.length - 1]?.label : "";
      if (prev) return prev;
      unknown += 1;
      const label2 = `S${labels.size + unknown}`;
      speakers.push({ label: label2 });
      return label2;
    }
    let label = labels.get(pid);
    if (!label) {
      label = `S${labels.size + unknown + 1}`;
      labels.set(pid, label);
      speakers.push({ label, personId: pid, matchedBy: s.matchedBy || "voiceprint", score: 0.82 });
    }
    return label;
  };
  let t = 3;
  const segments = lines.map(([pid, text], i) => {
    const len = Math.max(6, Math.round(text.length / 4.5));
    const seg = { id: `${s.id}_g${i + 1}`, start: t, end: t + len, speakerLabel: labelOf(pid, i), text };
    t += len + 2;
    return seg;
  });
  const topics = (s.topics || []).map(([title, idx], i) => {
    const ids = idx.map((n) => segments[n]?.id).filter(Boolean);
    for (const id of ids) {
      const seg = segments.find((x) => x.id === id);
      if (seg) seg.topicId = `${s.id}_t${i + 1}`;
    }
    return { id: `${s.id}_t${i + 1}`, title, segmentIds: ids };
  });
  const decisions = (s.decisions || []).map(([text, idx], i) => ({
    id: `${s.id}_d${i + 1}`,
    text,
    segmentIds: idx.map((n) => segments[n]?.id).filter(Boolean)
  }));
  const persons = speakers.filter((x) => x.personId).map((x) => x.personId);
  const processedAt = s.processedAt ?? s.time + 2 * HOUR;
  const afterProcess = !["pending_upload", "processing", "failed"].includes(s.status);
  const confirmations = afterProcess && s.status !== "pending_assign" ? persons.map((pid) => {
    const done = s.confirmed ? s.confirmed.includes(pid) : true;
    return done ? { personId: pid, status: "confirmed", requestedAt: processedAt, confirmedAt: processedAt + HOUR } : { personId: pid, status: "pending", requestedAt: processedAt };
  }) : [];
  return {
    id: s.id,
    projectId: s.projectId,
    title: s.title,
    time: s.time,
    source: "offline",
    hostId: s.hostId,
    attendeeIds: [.../* @__PURE__ */ new Set([s.hostId, ...s.attendeeIds, ...persons])],
    createdBy: s.hostId,
    createdAt: s.time - DAY,
    status: s.status,
    files: afterProcess ? [{ id: `${s.id}_f1`, name: `${s.title}.m4a`, kind: "audio", size: 184e5, path: "", uploadedAt: s.time + HOUR }] : [],
    ...afterProcess ? { process: { stage: "done", progress: 100, startedAt: s.time + HOUR, finishedAt: processedAt, log: [] } } : {},
    speakers: afterProcess ? speakers : [],
    segments: afterProcess ? segments : [],
    topics: afterProcess ? topics : [],
    decisions: afterProcess ? decisions : [],
    summaryLines: afterProcess ? s.summaryLines || decisions.slice(0, 3).map((d) => d.text) : [],
    confirmations,
    ...s.reviewStartedAt ? { reviewStartedAt: s.reviewStartedAt } : {},
    ...s.finalizedAt ? { finalizedAt: s.finalizedAt, finalizedBy: s.hostId } : {},
    ...s.taskDecision ? { taskDecision: s.taskDecision } : {},
    ...s.plan ? { plan: s.plan } : {},
    taskIds: [],
    ...afterProcess ? { durationSec: t } : {}
  };
}
function planOf(meetingId, generatedAt, items, ownerId, confirmedAt) {
  const planItems = items.map(([deptId, title, standard, due, decisionNo], i) => ({
    id: `${meetingId}_p${i + 1}`,
    deptId,
    title,
    standard,
    due,
    ...decisionNo ? { decisionId: `${meetingId}_d${decisionNo}` } : {}
  }));
  return {
    generatedAt,
    // i18n-ignore：演示方案概述是用户数据
    summary: `\u6839\u636E\u4F1A\u8BAE\u51B3\u8BAE\u62C6\u5206\u4E3A ${planItems.length} \u9879\u4EFB\u52A1\uFF0C\u6BCF\u9879\u5BF9\u5E94\u4E00\u4E2A\u8D23\u4EFB\u90E8\u95E8\u3002`,
    ...ownerId ? { ownerId } : {},
    items: planItems,
    ...confirmedAt ? { confirmedAt } : {}
  };
}
function buildTask(s) {
  const it = s.meeting.plan.items[s.item];
  const owner = s.meeting.plan.ownerId;
  const events = [{ at: s.createdAt, by: owner, action: "created" }];
  if (s.acceptedAt) events.push({ at: s.acceptedAt, by: s.assigneeId, action: "accepted" });
  const progressLog = (s.progress || []).map(([at, percent, note]) => ({ at, by: s.assigneeId, status: "in_progress", percent, note }));
  for (const p of progressLog) events.push({ at: p.at, by: s.assigneeId, action: "progress", note: p.note });
  if (s.doneAt) {
    progressLog.push({ at: s.doneAt, by: s.assigneeId, status: "done", percent: 100, note: "" });
    events.push({ at: s.doneAt, by: s.assigneeId, action: "done" });
  }
  events.push(...s.extraEvents || []);
  events.sort((a, b) => a.at - b.at);
  return {
    id: `${s.meeting.id}_k${s.item + 1}`,
    projectId: s.meeting.projectId,
    meetingId: s.meeting.id,
    planItemId: it.id,
    deptId: it.deptId,
    assigneeId: s.assigneeId,
    ownerId: owner,
    title: it.title,
    standard: it.standard,
    due: it.due,
    status: s.status,
    percent: s.status === "done" ? 100 : s.percent ?? 0,
    createdAt: s.createdAt,
    ...s.acceptedAt ? { acceptedAt: s.acceptedAt } : {},
    ...s.doneAt ? { doneAt: s.doneAt } : {},
    ...s.objection ? { objection: s.objection } : {},
    objectionHistory: [],
    progressLog,
    events,
    reminders: {}
  };
}
function chipDates(now) {
  const d = new Date(now);
  const year = d.getMonth() === 11 && d.getDate() > 15 ? d.getFullYear() + 1 : d.getFullYear();
  return { due: `${year}-12-15`, suggested: `${year}-12-20` };
}
function buildDemoData(now) {
  const today = ymd(now);
  const due = (days) => addDaysYmd(today, days);
  const chip = chipDates(now);
  const md = (s) => s.slice(5);
  const projects = [
    { id: "pj_dfactory", name: "\u6570\u5B57\u5316\u5DE5\u5382\u4E00\u671F", desc: "MES \u7CFB\u7EDF\u5EFA\u8BBE\u4E0E\u4EA7\u7EBF\u6570\u5B57\u5316\u6539\u9020\uFF0C\u4E00\u671F\u8986\u76D6\u603B\u88C5\u7EBF\u4E0E\u68C0\u6D4B\u7EBF\uFF0C\u5E74\u5E95\u524D\u4E0A\u7EBF\u3002", ownerId: "linxiao", memberIds: [], status: "active", createdAt: now - 30 * DAY, createdBy: "linxiao", weeklyReports: [] },
    { id: "pj_a2", name: "A2 \u91CF\u4EA7\u5BFC\u5165\u9879\u76EE", desc: "A2 \u4EA7\u54C1\u4ECE\u8BD5\u4EA7\u5230\u91CF\u4EA7\u7684\u5BFC\u5165\uFF1A\u5DE5\u827A\u6587\u4EF6\u3001\u7269\u6599\u9F50\u5957\u3001\u6392\u4EA7\u4E0E\u9996\u4EF6\u68C0\u9A8C\u3002", ownerId: "chenlifeng", memberIds: [], status: "active", createdAt: now - 25 * DAY, createdBy: "linxiao", weeklyReports: [] },
    { id: "pj_east", name: "\u534E\u4E1C\u751F\u4EA7\u57FA\u5730\u6269\u4EA7", desc: "\u534E\u4E1C\u57FA\u5730\u65B0\u589E\u4E24\u6761\u88C5\u914D\u7EBF\uFF1A\u4EA7\u80FD\u6D4B\u7B97\u3001\u8BBE\u5907\u9009\u578B\u4E0E\u91C7\u8D2D\u3001\u57FA\u5EFA\u914D\u5957\u3002", ownerId: "wugang", memberIds: [], status: "active", createdAt: now - 40 * DAY, createdBy: "linxiao", weeklyReports: [] }
  ];
  const kickoff = buildMeeting({
    id: "mt_df_kickoff",
    projectId: "pj_dfactory",
    title: "\u6570\u5B57\u5316\u5DE5\u5382\u542F\u52A8\u4F1A",
    time: now - 14 * DAY,
    hostId: "linxiao",
    attendeeIds: ["liuyang", "zhaolei", "zhouting", "sunhao", "lina"],
    status: "dispatched",
    lines: [
      ["linxiao", "\u6570\u5B57\u5316\u5DE5\u5382\u4E00\u671F\u4ECA\u5929\u6B63\u5F0F\u542F\u52A8\uFF0C\u76EE\u6807\u662F\u5E74\u5E95\u524D MES \u5728\u603B\u88C5\u7EBF\u548C\u68C0\u6D4B\u7EBF\u4E24\u6761\u7EBF\u4E0A\u7EBF\u3002"],
      ["liuyang", "\u6211\u6765\u505A\u8FD9\u4E2A\u9879\u76EE\u7684\u4EFB\u52A1\u8D1F\u8D23\u4EBA\uFF0C\u7EDF\u4E00\u8DDF\u8FDB\u5404\u90E8\u95E8\u7684\u8FDB\u5EA6\u3002"],
      ["zhaolei", "MES \u4E8C\u671F\u7684\u9700\u6C42\u8FD8\u8981\u548C\u5404\u8F66\u95F4\u518D\u786E\u8BA4\u4E00\u8F6E\uFF0C\u7814\u53D1\u8FD9\u8FB9\u4E0B\u5468\u5F00\u59CB\u6392\u3002"],
      ["zhouting", "\u8BBE\u5907\u4E3B\u63A7\u82AF\u7247\u8981\u63D0\u524D\u9501\u5B9A\u8D27\u6E90\uFF0C\u539F\u5382\u4EA4\u671F\u53EF\u80FD\u6BD4\u8F83\u957F\u3002"],
      ["sunhao", "\u8D28\u91CF\u90E8\u540C\u6B65\u51FA\u4E00\u7248\u8BBE\u5907\u70B9\u68C0\u6807\u51C6\uFF0C\u4E0A\u7EBF\u524D\u8981\u7528\u8D77\u6765\u3002"],
      ["lina", "\u4E0A\u7EBF\u57F9\u8BAD\u8BA1\u5212\u8FD0\u8425\u4E2D\u5FC3\u53EF\u4EE5\u7275\u5934\u7F16\u5236\u3002"],
      ["linxiao", "\u597D\uFF0C\u90A3\u5C31\u6309\u8FD9\u4E2A\u5206\u5DE5\uFF0C\u5404\u90E8\u95E8\u628A\u4EFB\u52A1\u63A5\u4E0B\u6765\u3002"]
    ],
    topics: [["\u9879\u76EE\u76EE\u6807\u4E0E\u5206\u5DE5", [0, 1, 6]], ["\u5404\u90E8\u95E8\u51C6\u5907\u4E8B\u9879", [2, 3, 4, 5]]],
    decisions: [
      ["\u5E74\u5E95\u524D MES \u5728\u603B\u88C5\u7EBF\u3001\u68C0\u6D4B\u7EBF\u4E24\u6761\u7EBF\u4E0A\u7EBF", [0]],
      ["\u4E3B\u63A7\u82AF\u7247\u63D0\u524D\u9501\u5B9A\u8D27\u6E90\u5E76\u8DDF\u8E2A\u5230\u8D27", [3]],
      ["\u8D28\u91CF\u90E8\u5236\u5B9A\u8BBE\u5907\u70B9\u68C0\u6807\u51C6", [4]],
      ["\u8FD0\u8425\u4E2D\u5FC3\u7275\u5934\u7F16\u5236\u4E0A\u7EBF\u57F9\u8BAD\u8BA1\u5212", [5]]
    ],
    summaryLines: ["\u6570\u5B57\u5316\u5DE5\u5382\u4E00\u671F\u6B63\u5F0F\u542F\u52A8\uFF0C\u5E74\u5E95\u524D MES \u5728\u603B\u88C5\u7EBF\u548C\u68C0\u6D4B\u7EBF\u4E0A\u7EBF", "\u5218\u6D0B\u4EFB\u4EFB\u52A1\u8D1F\u8D23\u4EBA\uFF0C\u7EDF\u4E00\u8DDF\u8FDB\u5404\u90E8\u95E8\u8FDB\u5EA6", "\u4E3B\u63A7\u82AF\u7247\u63D0\u524D\u9501\u5B9A\u8D27\u6E90\uFF0C\u8D28\u91CF\u90E8\u51FA\u70B9\u68C0\u6807\u51C6\uFF0C\u8FD0\u8425\u4E2D\u5FC3\u7F16\u57F9\u8BAD\u8BA1\u5212"],
    processedAt: now - 14 * DAY + 2 * HOUR,
    finalizedAt: now - 13.5 * DAY,
    taskDecision: "generate"
  });
  kickoff.plan = planOf(kickoff.id, now - 13.4 * DAY, [
    ["d_pur", "\u4E3B\u63A7\u82AF\u7247\u5230\u8D27\u8DDF\u8E2A", "\u9501\u5B9A\u4E3B\u63A7\u82AF\u7247\u8D27\u6E90\uFF0C\u6309\u671F\u5230\u8D27\u5E76\u5B8C\u6210\u6765\u6599\u68C0\u9A8C\uFF0C\u6BCF\u5468\u540C\u6B65\u4E00\u6B21\u539F\u5382\u6392\u4EA7", chip.due, 2],
    ["d_rd", "MES \u4E8C\u671F\u9700\u6C42\u786E\u8BA4", "\u4E0E\u603B\u88C5\u3001\u68C0\u6D4B\u4E24\u4E2A\u8F66\u95F4\u9010\u9879\u786E\u8BA4\u9700\u6C42\uFF0C\u8F93\u51FA\u9700\u6C42\u786E\u8BA4\u4E66\u5E76\u53CC\u65B9\u7B7E\u5B57", due(5), 1],
    ["d_ops", "\u4E0A\u7EBF\u57F9\u8BAD\u8BA1\u5212\u7F16\u5236", "\u8F93\u51FA\u4E24\u8F6E\u5168\u5458\u57F9\u8BAD\u8BA1\u5212\uFF08\u542B\u8BFE\u8868\u3001\u8BB2\u5E08\u3001\u8003\u6838\u65B9\u5F0F\uFF09\uFF0C\u8986\u76D6\u4E24\u6761\u7EBF\u5168\u90E8\u73ED\u7EC4", due(-2), 4],
    ["d_qa", "\u8BBE\u5907\u70B9\u68C0\u6807\u51C6\u5236\u5B9A", "\u8986\u76D6\u4E24\u6761\u7EBF\u5168\u90E8\u5173\u952E\u8BBE\u5907\u7684\u70B9\u68C0\u9879\u76EE\u3001\u5468\u671F\u4E0E\u5224\u5B9A\u6807\u51C6", due(-3), 3]
  ], "liuyang", now - 13 * DAY);
  const weekly = buildMeeting({
    id: "mt_df_weekly",
    projectId: "pj_dfactory",
    title: "\u6570\u5B57\u5316\u5DE5\u5382\u5468\u4F8B\u4F1A",
    time: now - 26 * HOUR,
    hostId: "linxiao",
    attendeeIds: ["zhaolei", "zhouting", "zhengkai", "liuyang", "wugang"],
    status: "pending_review",
    lines: [
      ["linxiao", "\u4ECA\u5929\u8FC7\u4E09\u4EF6\u4E8B\uFF1AMES \u4E8C\u671F\u4E0A\u7EBF\u8303\u56F4\u3001\u8BBE\u5907\u91C7\u8D2D\u4E0E\u5230\u8D27\u3001\u57F9\u8BAD\u4E0E\u4E0A\u7EBF\u5207\u6362\u3002\u5148\u8BF4\u8303\u56F4\u3002"],
      ["zhaolei", "\u7814\u53D1\u8FD9\u8FB9\u5EFA\u8BAE\u4E8C\u671F\u9996\u6279\u53EA\u4E0A\u603B\u88C5\u7EBF\u548C\u68C0\u6D4B\u7EBF\uFF0C\u4ED3\u50A8\u6A21\u5757\u7684\u63A5\u53E3\u8FD8\u6CA1\u8054\u8C03\u5B8C\uFF0C\u653E\u7B2C\u4E8C\u6279\u66F4\u7A33\u3002"],
      ["zhengkai", "\u5DE5\u827A\u90E8\u540C\u610F\u3002\u4E24\u6761\u7EBF\u7684\u5DE5\u827A\u8DEF\u7EBF\u6570\u636E\uFF0C\u6211\u4EEC 12 \u6708\u7B2C\u4E00\u5468\u524D\u53EF\u4EE5\u6574\u7406\u5B8C\u3002"],
      ["linxiao", "\u90A3\u5C31\u5B9A\u4E0B\u6765\uFF1A\u9996\u6279\u4E0A\u603B\u88C5\u7EBF\u548C\u68C0\u6D4B\u7EBF\uFF0C\u4ED3\u50A8\u653E\u7B2C\u4E8C\u6279\u3002"],
      ["zhouting", `\u4E3B\u63A7\u82AF\u7247\u539F\u5382\u4EA4\u671F\u504F\u7D27\uFF0C\u76EE\u524D\u56DE\u590D\u662F 12 \u6708\u4E2D\u65EC\uFF0C\u6211\u4EEC\u5728\u540C\u6B65\u627E\u5907\u9009\u6E20\u9053\u3002`],
      ["liuyang", `\u82AF\u7247\u662F\u8054\u8C03\u7684\u524D\u7F6E\u6761\u4EF6\uFF0C\u76EE\u6807\u8FD8\u662F\u6309 ${md(chip.due)} \u5230\u8D27\uFF0C\u518D\u665A\u4F1A\u538B\u7F29\u8054\u8C03\u65F6\u95F4\u3002`],
      ["wugang", "\u751F\u4EA7\u8FD9\u8FB9\u626B\u7801\u67AA\u548C\u5DE5\u63A7\u673A\u5DF2\u7ECF\u5230\u4E86\u4E00\u534A\uFF0C\u5269\u4E0B\u7684\u4E0B\u5468\u5230\u3002"],
      ["linxiao", `\u82AF\u7247\u6309 ${md(chip.due)} \u5230\u8D27\u4E3A\u76EE\u6807\uFF0C\u91C7\u8D2D\u90E8\u540C\u6B65\u542F\u52A8\u5907\u9009\u6E20\u9053\uFF0C\u6BCF\u5468\u4F8B\u4F1A\u540C\u6B65\u4E00\u6B21\u3002`],
      ["liuyang", "\u4E0A\u7EBF\u5207\u6362\u5EFA\u8BAE\u653E\u5728\u5468\u672B\uFF0C\u907F\u5F00\u5DE5\u4F5C\u65E5\u7684\u751F\u4EA7\u3002"],
      ["wugang", "\u53EF\u4EE5\uFF0C\u5207\u6362\u524D\u5E0C\u671B\u4E00\u7EBF\u73ED\u7EC4\u957F\u81F3\u5C11\u57F9\u8BAD\u4E24\u8F6E\u3002"],
      ["linxiao", "\u90A3\u5C31\u5468\u672B\u5207\u6362\uFF0C\u5207\u6362\u524D\u5B8C\u6210\u4E24\u8F6E\u5168\u5458\u57F9\u8BAD\uFF0C\u57F9\u8BAD\u8BA1\u5212\u8FD0\u8425\u4E2D\u5FC3\u6765\u51FA\u3002"]
    ],
    topics: [["MES \u4E8C\u671F\u4E0A\u7EBF\u8303\u56F4", [0, 1, 2, 3]], ["\u8BBE\u5907\u91C7\u8D2D\u4E0E\u5230\u8D27", [4, 5, 6, 7]], ["\u57F9\u8BAD\u4E0E\u4E0A\u7EBF\u5207\u6362", [8, 9, 10]]],
    decisions: [
      ["MES \u4E8C\u671F\u9996\u6279\u4E0A\u7EBF\u603B\u88C5\u7EBF\u4E0E\u68C0\u6D4B\u7EBF\uFF0C\u4ED3\u50A8\u6A21\u5757\u653E\u5230\u7B2C\u4E8C\u6279", [1, 3]],
      [`\u4E3B\u63A7\u82AF\u7247\u4EE5 ${md(chip.due)} \u5230\u8D27\u4E3A\u76EE\u6807\uFF0C\u91C7\u8D2D\u90E8\u540C\u6B65\u542F\u52A8\u5907\u9009\u6E20\u9053`, [4, 5, 7]],
      ["\u5DE5\u827A\u90E8 12 \u6708\u7B2C\u4E00\u5468\u524D\u5B8C\u6210\u4E24\u6761\u7EBF\u7684\u5DE5\u827A\u8DEF\u7EBF\u6570\u636E\u6574\u7406", [2]],
      ["\u4E0A\u7EBF\u5207\u6362\u5B89\u6392\u5728\u5468\u672B\uFF0C\u5207\u6362\u524D\u5B8C\u6210\u4E24\u8F6E\u5168\u5458\u57F9\u8BAD", [8, 9, 10]]
    ],
    summaryLines: ["MES \u4E8C\u671F\u9996\u6279\u4E0A\u7EBF\u603B\u88C5\u7EBF\u4E0E\u68C0\u6D4B\u7EBF\uFF0C\u4ED3\u50A8\u6A21\u5757\u653E\u5230\u7B2C\u4E8C\u6279", `\u4E3B\u63A7\u82AF\u7247\u4EE5 ${md(chip.due)} \u5230\u8D27\u4E3A\u76EE\u6807\uFF0C\u91C7\u8D2D\u90E8\u540C\u6B65\u542F\u52A8\u5907\u9009\u6E20\u9053`, "\u4E0A\u7EBF\u5207\u6362\u5B89\u6392\u5728\u5468\u672B\uFF0C\u5207\u6362\u524D\u5B8C\u6210\u4E24\u8F6E\u5168\u5458\u57F9\u8BAD"],
    processedAt: now - 24 * HOUR,
    reviewStartedAt: now - 5 * HOUR
  });
  const a2Kickoff = buildMeeting({
    id: "mt_a2_kickoff",
    projectId: "pj_a2",
    title: "A2 \u91CF\u4EA7\u5BFC\u5165\u542F\u52A8\u4F1A",
    time: now - 10 * DAY,
    hostId: "chenlifeng",
    attendeeIds: ["zhengkai", "zhouting", "wugang", "sunhao", "qiancheng"],
    status: "dispatched",
    lines: [
      ["chenlifeng", "A2 \u4E0B\u4E2A\u6708\u8FDB\u5165\u5C0F\u6279\u91CF\u8BD5\u4EA7\uFF0C\u4ECA\u5929\u628A\u91CF\u4EA7\u5BFC\u5165\u7684\u5206\u5DE5\u5B9A\u4E0B\u6765\u3002"],
      ["zhengkai", "\u8BD5\u4EA7\u5DE5\u827A\u6587\u4EF6\u5DE5\u827A\u90E8\u6765\u7F16\uFF0C\u4E0B\u5468\u53EF\u4EE5\u51FA\u521D\u7A3F\u3002"],
      ["zhouting", "\u7269\u6599\u9F50\u5957\u6211\u4EEC\u6309 BOM \u9010\u9879\u786E\u8BA4\uFF0C\u957F\u5468\u671F\u7269\u6599\u5148\u4E0B\u5355\u3002"],
      ["wugang", "\u4EA7\u7EBF\u6392\u4EA7\u548C\u4EBA\u5458\u8981\u7B49\u5DE5\u827A\u6587\u4EF6\u51FA\u6765\u518D\u7EC6\u6392\u3002"],
      ["sunhao", "\u9996\u4EF6\u68C0\u9A8C\u65B9\u6848\u8D28\u91CF\u90E8\u8D1F\u8D23\uFF0C\u8986\u76D6\u5168\u90E8\u5173\u952E\u53C2\u6570\u3002"],
      ["qiancheng", "\u7814\u53D1\u4F1A\u914D\u5408\u89E3\u7B54\u8BD5\u4EA7\u4E2D\u9047\u5230\u7684\u8BBE\u8BA1\u95EE\u9898\u3002"]
    ],
    topics: [["\u91CF\u4EA7\u5BFC\u5165\u5206\u5DE5", [0, 1, 2, 3, 4, 5]]],
    decisions: [
      ["\u5DE5\u827A\u90E8\u7F16\u5236\u8BD5\u4EA7\u5DE5\u827A\u6587\u4EF6", [1]],
      ["\u91C7\u8D2D\u90E8\u5B8C\u6210 A2 \u7269\u6599\u9F50\u5957\u786E\u8BA4", [2]],
      ["\u751F\u4EA7\u90E8\u5B8C\u6210\u4EA7\u7EBF\u6392\u4EA7\u4E0E\u4EBA\u5458\u5B89\u6392", [3]],
      ["\u8D28\u91CF\u90E8\u8F93\u51FA\u9996\u4EF6\u68C0\u9A8C\u65B9\u6848", [4]]
    ],
    processedAt: now - 10 * DAY + 2 * HOUR,
    finalizedAt: now - 9.6 * DAY,
    taskDecision: "generate"
  });
  a2Kickoff.plan = planOf(a2Kickoff.id, now - 9.5 * DAY, [
    ["d_proc", "\u8BD5\u4EA7\u5DE5\u827A\u6587\u4EF6\u7F16\u5236", "\u8F93\u51FA A2 \u8BD5\u4EA7\u5168\u5DE5\u5E8F\u4F5C\u4E1A\u6307\u5BFC\u4E66\u4E0E\u5DE5\u827A\u53C2\u6570\u8868", due(7), 1],
    ["d_pur", "A2 \u7269\u6599\u9F50\u5957\u786E\u8BA4", "\u6309 BOM \u9010\u9879\u786E\u8BA4\u5230\u6599\u65F6\u95F4\uFF0C\u957F\u5468\u671F\u7269\u6599\u5168\u90E8\u4E0B\u5355", due(3), 2],
    ["d_prod", "\u4EA7\u7EBF\u6392\u4EA7\u4E0E\u4EBA\u5458\u5B89\u6392", "\u8F93\u51FA\u8BD5\u4EA7\u6392\u4EA7\u8BA1\u5212\u4E0E\u5404\u5DE5\u4F4D\u4EBA\u5458\u5B89\u6392", due(10), 3],
    ["d_qa", "\u9996\u4EF6\u68C0\u9A8C\u65B9\u6848", "\u9996\u4EF6\u68C0\u9A8C\u8986\u76D6\u5168\u90E8 32 \u9879\u5173\u952E\u53C2\u6570\uFF0C\u5F62\u6210\u68C0\u9A8C\u8BB0\u5F55\u6A21\u677F", due(6), 4]
  ], "chenlifeng", now - 9 * DAY);
  const a2Review = buildMeeting({
    id: "mt_a2_review",
    projectId: "pj_a2",
    title: "A2 \u8BD5\u4EA7\u95EE\u9898\u590D\u76D8\u4F1A",
    time: now - 21 * HOUR,
    hostId: "chenlifeng",
    attendeeIds: ["linxiao", "zhengkai", "sunhao", "qiancheng"],
    status: "pending_confirm",
    lines: [
      ["chenlifeng", "\u590D\u76D8\u4E00\u4E0B\u7B2C\u4E00\u8F6E\u8BD5\u4EA7\u66B4\u9732\u51FA\u6765\u7684\u95EE\u9898\u3002"],
      ["sunhao", "\u9996\u4EF6\u6709\u4E24\u9879\u5C3A\u5BF8\u8D85\u5DEE\uFF0C\u96C6\u4E2D\u5728\u5916\u58F3\u5361\u6263\u7684\u4F4D\u7F6E\u3002"],
      ["zhengkai", "\u5361\u6263\u95EE\u9898\u548C\u5939\u5177\u5B9A\u4F4D\u6709\u5173\uFF0C\u5DE5\u827A\u8FD9\u8FB9\u8C03\u6574\u5939\u5177\u540E\u518D\u9A8C\u8BC1\u4E00\u6B21\u3002"],
      ["qiancheng", "\u8BBE\u8BA1\u4E0A\u5361\u6263\u516C\u5DEE\u53EF\u4EE5\u653E\u5BBD 0.05\uFF0C\u6211\u56DE\u53BB\u51FA\u8BBE\u8BA1\u53D8\u66F4\u3002"],
      ["linxiao", "\u8FD0\u8425\u4E2D\u5FC3\u4F1A\u628A\u590D\u76D8\u7ED3\u8BBA\u540C\u6B65\u8FDB A2 \u7684\u6574\u4F53\u6392\u671F\u3002"],
      ["chenlifeng", "\u7B2C\u4E8C\u8F6E\u8BD5\u4EA7\u5B9A\u5728\u4E0B\u5468\u4E09\uFF0C\u95EE\u9898\u5168\u90E8\u95ED\u73AF\u540E\u518D\u8FDB\u91CF\u4EA7\u8BC4\u5BA1\u3002"]
    ],
    topics: [["\u8BD5\u4EA7\u95EE\u9898", [0, 1, 2, 3]], ["\u540E\u7EED\u5B89\u6392", [4, 5]]],
    decisions: [
      ["\u8C03\u6574\u5939\u5177\u5B9A\u4F4D\u540E\u91CD\u65B0\u9A8C\u8BC1\u5361\u6263\u5C3A\u5BF8", [2]],
      ["\u5361\u6263\u516C\u5DEE\u653E\u5BBD 0.05\uFF0C\u7814\u53D1\u51FA\u8BBE\u8BA1\u53D8\u66F4", [3]],
      ["\u7B2C\u4E8C\u8F6E\u8BD5\u4EA7\u5B9A\u5728\u4E0B\u5468\u4E09", [5]]
    ],
    confirmed: ["chenlifeng", "zhengkai", "qiancheng"],
    processedAt: now - 18 * HOUR
  });
  const a2Weekly = buildMeeting({
    id: "mt_a2_weekly",
    projectId: "pj_a2",
    title: "A2 \u91CF\u4EA7\u5BFC\u5165\u5468\u4F1A",
    time: now - 2 * HOUR,
    hostId: "chenlifeng",
    attendeeIds: ["zhouting", "wugang", "zhengkai"],
    status: "pending_upload"
  });
  const eastPlan = buildMeeting({
    id: "mt_east_plan",
    projectId: "pj_east",
    title: "\u6269\u4EA7\u89C4\u5212\u8BC4\u5BA1\u4F1A",
    time: now - 3 * DAY,
    hostId: "wugang",
    attendeeIds: ["linxiao", "zhengkai", "zhouting", "luojun"],
    status: "plan_confirm",
    lines: [
      ["wugang", "\u534E\u4E1C\u57FA\u5730\u6269\u4EA7\u4ECA\u5929\u8BC4\u5BA1\u6574\u4F53\u89C4\u5212\uFF0C\u65B0\u589E\u4E24\u6761\u88C5\u914D\u7EBF\u3002"],
      ["luojun", "\u6309\u73B0\u5728\u7684\u8BA2\u5355\u9884\u6D4B\uFF0C\u65B0\u7EBF\u6295\u4EA7\u540E\u4EA7\u80FD\u80FD\u63D0\u5347 40% \u5DE6\u53F3\u3002"],
      ["zhengkai", "\u65B0\u7EBF\u8BBE\u5907\u6E05\u5355\u5DE5\u827A\u90E8\u6765\u51FA\uFF0C\u548C\u73B0\u6709\u7EBF\u5C3D\u91CF\u901A\u7528\u3002"],
      ["zhouting", "\u8BBE\u5907\u91C7\u8D2D\u9884\u7B97\u8981\u7B49\u6E05\u5355\u51FA\u6765\u518D\u7EC6\u7B97\u3002"],
      ["linxiao", "\u8FD9\u51E0\u9879\u8FD0\u8425\u4E2D\u5FC3\u7275\u5934\u8DDF\u8FDB\uFF0C\u6211\u6765\u505A\u4EFB\u52A1\u8D1F\u8D23\u4EBA\u3002"]
    ],
    topics: [["\u6269\u4EA7\u89C4\u5212", [0, 1]], ["\u5206\u5DE5", [2, 3, 4]]],
    decisions: [
      ["\u65B0\u589E\u4E24\u6761\u88C5\u914D\u7EBF", [0]],
      ["\u751F\u4EA7\u90E8\u5B8C\u6210\u4EA7\u80FD\u6D4B\u7B97\u62A5\u544A", [1]],
      ["\u5DE5\u827A\u90E8\u8F93\u51FA\u65B0\u7EBF\u8BBE\u5907\u6E05\u5355", [2]],
      ["\u91C7\u8D2D\u90E8\u7F16\u5236\u8BBE\u5907\u91C7\u8D2D\u9884\u7B97", [3]]
    ],
    processedAt: now - 3 * DAY + 2 * HOUR,
    finalizedAt: now - 2.5 * DAY,
    taskDecision: "generate"
  });
  eastPlan.plan = planOf(eastPlan.id, now - 2.4 * DAY, [
    ["d_prod", "\u4EA7\u80FD\u6D4B\u7B97\u62A5\u544A", "\u6309\u8BA2\u5355\u9884\u6D4B\u6D4B\u7B97\u65B0\u7EBF\u4EA7\u80FD\u4E0E\u4EBA\u5458\u9700\u6C42\uFF0C\u8F93\u51FA\u6D4B\u7B97\u62A5\u544A", due(10), 2],
    ["d_proc", "\u65B0\u7EBF\u8BBE\u5907\u6E05\u5355", "\u8F93\u51FA\u4E24\u6761\u65B0\u7EBF\u7684\u8BBE\u5907\u6E05\u5355\u4E0E\u6280\u672F\u8981\u6C42\uFF0C\u6807\u6CE8\u4E0E\u73B0\u6709\u7EBF\u901A\u7528\u7684\u90E8\u5206", due(14), 3],
    ["d_pur", "\u8BBE\u5907\u91C7\u8D2D\u9884\u7B97", "\u6309\u8BBE\u5907\u6E05\u5355\u8BE2\u4EF7\u5E76\u7F16\u5236\u91C7\u8D2D\u9884\u7B97", due(21), 4]
  ], "linxiao");
  const eastCapacity = buildMeeting({
    id: "mt_east_capacity",
    projectId: "pj_east",
    title: "\u4EA7\u80FD\u6D4B\u7B97\u8BA8\u8BBA\u4F1A",
    time: now - 22 * HOUR,
    hostId: "wugang",
    attendeeIds: ["luojun", "gaofeng"],
    status: "pending_assign",
    lines: [
      ["wugang", "\u4ECA\u5929\u628A\u65B0\u7EBF\u7684\u4EA7\u80FD\u6D4B\u7B97\u53E3\u5F84\u5BF9\u4E00\u4E0B\u3002"],
      [null, "\u6309\u4E24\u73ED\u5012\u7B97\uFF0C\u5355\u7EBF\u65E5\u4EA7\u80FD\u5927\u7EA6 1200 \u53F0\u3002"],
      ["luojun", "\u6362\u578B\u65F6\u95F4\u8981\u7B97\u8FDB\u53BB\uFF0C\u5B9E\u9645\u80FD\u5230 1100 \u53F0\u5C31\u4E0D\u9519\u4E86\u3002"],
      [null, "\u90A3\u6D4B\u7B97\u62A5\u544A\u91CC\u6309 1100 \u53F0\u505A\u57FA\u51C6\uFF0C1200 \u53F0\u505A\u4E0A\u9650\u3002"]
    ],
    topics: [["\u4EA7\u80FD\u6D4B\u7B97\u53E3\u5F84", [0, 1, 2, 3]]],
    decisions: [["\u4EA7\u80FD\u6D4B\u7B97\u6309\u5355\u7EBF\u65E5\u4EA7 1100 \u53F0\u505A\u57FA\u51C6\u30011200 \u53F0\u505A\u4E0A\u9650", [3]]],
    processedAt: now - 20 * HOUR
  });
  const eastSite = buildMeeting({
    id: "mt_east_site",
    projectId: "pj_east",
    title: "\u9009\u5740\u6C9F\u901A\u4F1A",
    time: now - 20 * DAY,
    hostId: "wugang",
    attendeeIds: ["linxiao", "luojun"],
    status: "ended",
    lines: [
      ["wugang", "\u65B0\u7EBF\u653E\u5728\u4E09\u53F7\u5382\u623F\u4E1C\u4FA7\uFF0C\u5730\u9762\u627F\u91CD\u5DF2\u7ECF\u786E\u8BA4\u8FC7\u4E86\u3002"],
      ["linxiao", "\u540C\u610F\uFF0C\u8FD9\u4E2A\u4F1A\u53EA\u662F\u901A\u62A5\uFF0C\u4E0D\u7528\u62C6\u4EFB\u52A1\u3002"],
      ["luojun", "\u4E1C\u4FA7\u901A\u9053\u8981\u4FDD\u7559\uFF0C\u7269\u6D41\u8F66\u8981\u80FD\u8FDB\u3002"]
    ],
    topics: [["\u9009\u5740", [0, 1, 2]]],
    decisions: [["\u65B0\u7EBF\u653E\u5728\u4E09\u53F7\u5382\u623F\u4E1C\u4FA7\uFF0C\u4FDD\u7559\u4E1C\u4FA7\u7269\u6D41\u901A\u9053", [0, 2]]],
    processedAt: now - 20 * DAY + 2 * HOUR,
    finalizedAt: now - 19.5 * DAY,
    taskDecision: "none"
  });
  const eastEquip = buildMeeting({
    id: "mt_east_equip",
    projectId: "pj_east",
    title: "\u8BBE\u5907\u9009\u578B\u4F1A",
    time: now - 2 * DAY,
    hostId: "wugang",
    attendeeIds: ["zhengkai", "liangyu"],
    status: "finalized",
    lines: [
      ["wugang", "\u65B0\u7EBF\u8D34\u7247\u673A\u9009\u578B\u4ECA\u5929\u5B9A\u4E00\u4E0B\uFF0C\u4E24\u5BB6\u4F9B\u5E94\u5546\u7684\u65B9\u6848\u90FD\u770B\u8FC7\u4E86\u3002"],
      ["zhengkai", "\u5DE5\u827A\u4E0A\u66F4\u503E\u5411 A \u65B9\u6848\uFF0C\u6362\u7EBF\u901F\u5EA6\u5FEB\uFF0C\u548C\u73B0\u6709\u7EBF\u7684\u7A0B\u5E8F\u4E5F\u80FD\u901A\u7528\u3002"],
      ["liangyu", "A \u65B9\u6848\u7684\u8BBE\u5907\u6211\u5728\u522B\u7684\u5DE5\u5382\u8C03\u8FC7\uFF0C\u7A33\u5B9A\u6027\u6CA1\u95EE\u9898\u3002"],
      ["wugang", "\u90A3\u5C31\u5B9A A \u65B9\u6848\uFF0C\u4E0B\u4E00\u6B65\u51FA\u8BE6\u7EC6\u6280\u672F\u534F\u8BAE\u3002"]
    ],
    topics: [["\u8D34\u7247\u673A\u9009\u578B", [0, 1, 2, 3]]],
    decisions: [["\u65B0\u7EBF\u8D34\u7247\u673A\u9009\u7528 A \u65B9\u6848", [1, 3]], ["\u5DE5\u827A\u90E8\u51FA\u8BE6\u7EC6\u6280\u672F\u534F\u8BAE", [3]]],
    processedAt: now - 2 * DAY + 2 * HOUR,
    finalizedAt: now - 1.2 * DAY
  });
  const eastBuild = buildMeeting({
    id: "mt_east_build",
    projectId: "pj_east",
    title: "\u57FA\u5EFA\u8FDB\u5EA6\u534F\u8C03\u4F1A",
    time: now - 4 * DAY,
    hostId: "wugang",
    attendeeIds: ["luojun", "gaofeng", "zhouting"],
    status: "pending_owner",
    lines: [
      ["wugang", "\u4E09\u53F7\u5382\u623F\u4E1C\u4FA7\u7684\u5730\u9762\u6539\u9020\u4E0B\u5468\u5F00\u5DE5\u3002"],
      ["luojun", "\u65BD\u5DE5\u671F\u95F4\u4E1C\u4FA7\u901A\u9053\u8981\u4E34\u65F6\u5C01\u95ED\uFF0C\u7269\u6D41\u8981\u6539\u8D70\u5317\u95E8\u3002"],
      ["zhouting", "\u65BD\u5DE5\u65B9\u7684\u5408\u540C\u8FD9\u5468\u53EF\u4EE5\u7B7E\u4E0B\u6765\u3002"],
      ["gaofeng", "\u6539\u9020\u671F\u95F4\u6392\u4EA7\u4F1A\u53D7\u70B9\u5F71\u54CD\uFF0C\u6211\u63D0\u524D\u8C03\u6574\u8BA1\u5212\u3002"]
    ],
    topics: [["\u57FA\u5EFA\u8FDB\u5EA6", [0, 1, 2, 3]]],
    decisions: [["\u5730\u9762\u6539\u9020\u4E0B\u5468\u5F00\u5DE5\uFF0C\u671F\u95F4\u7269\u6D41\u6539\u8D70\u5317\u95E8", [0, 1]], ["\u91C7\u8D2D\u90E8\u672C\u5468\u7B7E\u8BA2\u65BD\u5DE5\u5408\u540C", [2]], ["\u751F\u4EA7\u90E8\u63D0\u524D\u8C03\u6574\u6539\u9020\u671F\u95F4\u7684\u6392\u4EA7", [3]]],
    processedAt: now - 4 * DAY + 2 * HOUR,
    finalizedAt: now - 3.5 * DAY,
    taskDecision: "generate"
  });
  eastBuild.plan = planOf(eastBuild.id, now - 3.4 * DAY, [
    ["d_pur", "\u65BD\u5DE5\u5408\u540C\u7B7E\u8BA2", "\u4E0E\u65BD\u5DE5\u65B9\u7B7E\u8BA2\u5730\u9762\u6539\u9020\u5408\u540C\uFF0C\u660E\u786E\u5DE5\u671F\u4E0E\u9A8C\u6536\u6807\u51C6", due(3), 2],
    ["d_prod", "\u6539\u9020\u671F\u95F4\u6392\u4EA7\u8C03\u6574", "\u8F93\u51FA\u6539\u9020\u671F\u95F4\u7684\u6392\u4EA7\u8C03\u6574\u8BA1\u5212\u4E0E\u7269\u6D41\u8DEF\u7EBF", due(5), 3]
  ]);
  const chipObjection = {
    id: "ob_chip",
    kind: "objection",
    target: "time",
    reason: "\u539F\u5382\u6392\u4EA7\u7D27\u5F20\uFF0C\u4EA4\u671F\u56DE\u590D\u4E3A 12 \u6708 18 \u65E5\uFF0C\u6309\u539F\u5B9A\u622A\u6B62\u65E5\u65E0\u6CD5\u4FDD\u8BC1\u5230\u8D27\u3002",
    suggestion: `\u622A\u6B62\u65E5\u8C03\u6574\u4E3A ${md(chip.suggested)}\uFF0C\u540C\u65F6\u542F\u52A8\u5907\u9009\u6E20\u9053\uFF0C\u6BCF\u5468\u540C\u6B65\u4E00\u6B21\u539F\u5382\u6392\u4EA7\u3002`,
    suggestedDue: chip.suggested,
    raisedBy: "zhouting",
    raisedAt: now - 3 * DAY,
    prevStatus: "to_accept",
    stage: "arbitration",
    review: { by: "liuyang", at: now - 2 * DAY, decision: "reject", note: `${md(chip.due)} \u662F MES \u8054\u8C03\u7684\u524D\u7F6E\u8282\u70B9\uFF0C\u63A8\u8FDF\u4F1A\u5F71\u54CD\u6574\u4F53\u4E0A\u7EBF\uFF0C\u8BF7\u534F\u8C03\u5907\u9009\u6E20\u9053\u4FDD\u8BC1\u5230\u8D27\u3002` }
  };
  const inspectObjection = {
    id: "ob_inspect",
    kind: "change",
    target: "requirement",
    reason: "\u9996\u4EF6\u68C0\u9A8C\u8981\u6C42\u8986\u76D6\u5168\u90E8 32 \u9879\u53C2\u6570\uFF0C\u73B0\u6709\u68C0\u6D4B\u8BBE\u5907\u53EA\u80FD\u6D4B 28 \u9879\u3002",
    suggestion: "\u53E6\u5916 4 \u9879\u9001\u5916\u90E8\u5B9E\u9A8C\u5BA4\u68C0\u6D4B\uFF0C\u4EA4\u4ED8\u65F6\u95F4\u987A\u5EF6 3 \u5929\u3002",
    suggestedDue: due(9),
    raisedBy: "sunhao",
    raisedAt: now - 5 * HOUR,
    prevStatus: "in_progress",
    stage: "review"
  };
  const tasks = [
    buildTask({
      meeting: kickoff,
      item: 0,
      assigneeId: "zhouting",
      status: "to_accept",
      createdAt: now - 13 * DAY,
      objection: chipObjection,
      extraEvents: [
        { at: now - 3 * DAY, by: "zhouting", action: "objection_raised", note: chipObjection.reason },
        { at: now - 2 * DAY, by: "liuyang", action: "review_reject", note: chipObjection.review.note },
        { at: now - 1 * DAY, by: "zhouting", action: "escalated" }
      ]
    }),
    buildTask({
      meeting: kickoff,
      item: 1,
      assigneeId: "zhaolei",
      status: "in_progress",
      percent: 60,
      createdAt: now - 13 * DAY,
      acceptedAt: now - 12.5 * DAY,
      progress: [[now - 10 * DAY, 20, "\u603B\u88C5\u8F66\u95F4\u9700\u6C42\u5DF2\u786E\u8BA4"], [now - 3 * DAY, 60, "\u68C0\u6D4B\u8F66\u95F4\u9700\u6C42\u786E\u8BA4\u8FC7\u534A"]]
    }),
    buildTask({
      meeting: kickoff,
      item: 2,
      assigneeId: "linxiao",
      status: "in_progress",
      percent: 30,
      createdAt: now - 13 * DAY,
      acceptedAt: now - 12 * DAY,
      progress: [[now - 9 * DAY, 30, "\u57F9\u8BAD\u8BFE\u8868\u521D\u7A3F\u5B8C\u6210\uFF0C\u8BB2\u5E08\u5F85\u5B9A"]]
    }),
    buildTask({
      meeting: kickoff,
      item: 3,
      assigneeId: "sunhao",
      status: "done",
      createdAt: now - 13 * DAY,
      acceptedAt: now - 12.8 * DAY,
      progress: [[now - 8 * DAY, 70, "\u603B\u88C5\u7EBF\u70B9\u68C0\u9879\u76EE\u5DF2\u6574\u7406"]],
      doneAt: now - 4 * DAY
    }),
    buildTask({ meeting: a2Kickoff, item: 0, assigneeId: "zhengkai", status: "to_accept", createdAt: now - 9 * DAY }),
    buildTask({
      meeting: a2Kickoff,
      item: 1,
      assigneeId: "zhouting",
      status: "in_progress",
      percent: 40,
      createdAt: now - 9 * DAY,
      acceptedAt: now - 8.8 * DAY,
      progress: [[now - 2 * DAY, 40, "\u957F\u5468\u671F\u7269\u6599\u5DF2\u5168\u90E8\u4E0B\u5355\uFF0C\u5176\u4F59\u6309 BOM \u6838\u5BF9\u4E2D"]]
    }),
    buildTask({ meeting: a2Kickoff, item: 2, assigneeId: "wugang", status: "not_started", createdAt: now - 9 * DAY, acceptedAt: now - 8 * DAY }),
    buildTask({
      meeting: a2Kickoff,
      item: 3,
      assigneeId: "sunhao",
      status: "in_progress",
      percent: 50,
      createdAt: now - 9 * DAY,
      acceptedAt: now - 8.9 * DAY,
      progress: [[now - 4 * DAY, 50, "28 \u9879\u53C2\u6570\u7684\u68C0\u9A8C\u65B9\u6CD5\u5DF2\u786E\u5B9A"]],
      objection: inspectObjection,
      extraEvents: [{ at: now - 5 * HOUR, by: "sunhao", action: "objection_raised", note: inspectObjection.reason }]
    })
  ];
  kickoff.taskIds = tasks.filter((t) => t.meetingId === kickoff.id).map((t) => t.id);
  a2Kickoff.taskIds = tasks.filter((t) => t.meetingId === a2Kickoff.id).map((t) => t.id);
  const meetings = [kickoff, weekly, a2Kickoff, a2Review, a2Weekly, eastPlan, eastCapacity, eastSite, eastEquip, eastBuild];
  for (const p of projects) {
    const ids = /* @__PURE__ */ new Set([p.ownerId]);
    for (const m of meetings.filter((x) => x.projectId === p.id)) {
      ids.add(m.hostId);
      m.attendeeIds.forEach((id) => ids.add(id));
      if (m.plan?.ownerId) ids.add(m.plan.ownerId);
    }
    for (const t of tasks.filter((x) => x.projectId === p.id)) {
      ids.add(t.assigneeId);
      ids.add(t.ownerId);
    }
    p.memberIds = [...ids];
  }
  const notices = [
    { id: "nt_demo_1", at: now - 1 * DAY, to: "linxiao", type: "arbitration", title: "\u5F85\u88C1\u51B3\uFF1A\u4E3B\u63A7\u82AF\u7247\u5230\u8D27\u8DDF\u8E2A", summary: `\u5468\u5A77\u4E0E\u5218\u6D0B\u5BF9\u622A\u6B62\u65E5\u6709\u5206\u6B67\uFF08${md(chip.due)} / ${md(chip.suggested)}\uFF09`, link: { kind: "task", id: tasks[0].id }, read: false },
    { id: "nt_demo_2", at: now - 6 * HOUR, to: "linxiao", type: "task_overdue", title: "\u903E\u671F\u63D0\u9192\uFF1A\u4E0A\u7EBF\u57F9\u8BAD\u8BA1\u5212\u7F16\u5236", summary: `\u622A\u6B62 ${tasks[2].due}\uFF0C\u5DF2\u903E\u671F 2 \u5929`, link: { kind: "task", id: tasks[2].id }, read: false },
    { id: "nt_demo_3", at: now - 18 * HOUR, to: "linxiao", type: "speech_confirm", title: "\u53D1\u8A00\u5F85\u786E\u8BA4\uFF1AA2 \u8BD5\u4EA7\u95EE\u9898\u590D\u76D8\u4F1A", summary: "\u8BF7\u6838\u5BF9\u5E76\u786E\u8BA4\u4F60\u5728\u4F1A\u4E0A\u7684\u53D1\u8A00", link: { kind: "meeting", id: a2Review.id }, read: false },
    { id: "nt_demo_4", at: now - 5 * HOUR, to: "linxiao", type: "minutes_review", title: "\u7EAA\u8981\u5F85\u7EC8\u5BA1\uFF1A\u6570\u5B57\u5316\u5DE5\u5382\u5468\u4F8B\u4F1A", summary: "\u53D1\u8A00\u4EBA\u5DF2\u5168\u90E8\u786E\u8BA4\uFF0C\u8BF7\u7EC8\u5BA1", link: { kind: "meeting", id: weekly.id }, read: false },
    { id: "nt_demo_5", at: now - 2.4 * DAY, to: "linxiao", type: "plan_confirm", title: "\u65B9\u6848\u5F85\u786E\u8BA4\uFF1A\u6269\u4EA7\u89C4\u5212\u8BC4\u5BA1\u4F1A", summary: eastPlan.plan.items.map((i) => `${i.title}\uFF08\u622A\u6B62 ${i.due}\uFF09`).join("\n"), link: { kind: "meeting_plan", id: eastPlan.id }, read: false },
    { id: "nt_demo_6", at: now - 13.5 * DAY, to: "linxiao", type: "minutes_final", title: "\u6B63\u5F0F\u7EAA\u8981\uFF1A\u6570\u5B57\u5316\u5DE5\u5382\u542F\u52A8\u4F1A", summary: kickoff.summaryLines.join("\n"), link: { kind: "meeting", id: kickoff.id }, read: true },
    { id: "nt_demo_7", at: now - 5 * HOUR, to: "chenlifeng", type: "objection_review", title: "\u7533\u8BF7\u53D8\u66F4\uFF1A\u9996\u4EF6\u68C0\u9A8C\u65B9\u6848", summary: inspectObjection.reason, link: { kind: "task", id: tasks[7].id }, read: false },
    { id: "nt_demo_8", at: now - 9 * DAY, to: "zhengkai", type: "task_new", title: "\u65B0\u4EFB\u52A1\u5F85\u63A5\u6536\uFF1A\u8BD5\u4EA7\u5DE5\u827A\u6587\u4EF6\u7F16\u5236", summary: `${tasks[4].title}\uFF08\u622A\u6B62 ${tasks[4].due}\uFF09`, link: { kind: "task", id: tasks[4].id }, read: false }
  ];
  return { projects, meetings, tasks, notices };
}
var DEMO_TRANSCRIPT_NAME = "\u793A\u4F8B\u4F1A\u8BAE\u6587\u5B57\u8BB0\u5F55.txt";
var DEMO_TRANSCRIPT = `\u6797\u6653 00:00:05
\u4ECA\u5929\u5F00\u4E2A\u77ED\u4F1A\uFF0C\u5BF9\u9F50\u534E\u4E1C\u57FA\u5730\u65B0\u7EBF\u8BBE\u5907\u7684\u5230\u8D27\u548C\u5B89\u88C5\u5B89\u6392\u3002

\u5468\u5A77 00:00:32
\u8BBE\u5907\u5382\u5BB6\u56DE\u590D\uFF0C\u9996\u6279\u4E24\u53F0\u8D34\u7247\u673A\u4E0B\u5468\u53D1\u8D27\uFF0C\u5269\u4E0B\u7684\u5206\u4E24\u6279\uFF0C\u6708\u5E95\u524D\u5168\u90E8\u5230\u9F50\u3002

\u5434\u521A 00:01:10
\u751F\u4EA7\u8FD9\u8FB9\u8981\u63D0\u524D\u628A\u5B89\u88C5\u4F4D\u7F6E\u817E\u51FA\u6765\uFF0C\u5730\u9762\u6539\u9020\u5927\u6982\u8981\u4E00\u5468\u3002

\u90D1\u51EF 00:01:45
\u5B89\u88C5\u8C03\u8BD5\u7684\u5DE5\u827A\u53C2\u6570\u6211\u4EEC\u5148\u6309\u8001\u7EBF\u51FA\u4E00\u7248\uFF0C\u5230\u8D27\u540E\u518D\u5FAE\u8C03\u3002

\u6797\u6653 00:02:20
\u90A3\u5C31\u8FD9\u4E48\u5B9A\uFF1A\u751F\u4EA7\u90E8\u4E0B\u5468\u5B8C\u6210\u5730\u9762\u6539\u9020\uFF0C\u5DE5\u827A\u90E8\u4E24\u5468\u5185\u51FA\u8C03\u8BD5\u53C2\u6570\u521D\u7248\uFF0C\u91C7\u8D2D\u90E8\u6BCF\u5468\u540C\u6B65\u4E00\u6B21\u5230\u8D27\u8FDB\u5EA6\u3002

\u5434\u521A 00:02:48
\u6CA1\u95EE\u9898\uFF0C\u5730\u9762\u6539\u9020\u4E0B\u5468\u4E00\u5F00\u5DE5\u3002

\u5468\u5A77 00:03:05
\u597D\u7684\uFF0C\u5230\u8D27\u8FDB\u5EA6\u6211\u6BCF\u5468\u4E94\u5728\u7FA4\u91CC\u540C\u6B65\u3002

\u90D1\u51EF 00:03:21
\u8C03\u8BD5\u53C2\u6570\u521D\u7248\u51FA\u6765\u540E\uFF0C\u6211\u7EA6\u751F\u4EA7\u4E00\u8D77\u8FC7\u4E00\u904D\u3002
`;

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/index.ts
var import_fs4 = require("fs");
var import_path4 = require("path");
var import_t2cn = require("npm:opencc-js/t2cn");
var import_i18n10 = require("npm:@totalclaw/i18n");

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/audio.ts
var import_child_process = require("child_process");
var import_fs = require("fs");
var import_path = require("path");
var import_node_runtime = require("npm:@totalclaw/node-runtime");
var import_i18n3 = require("npm:@totalclaw/i18n");
var SAMPLE_RATE = 16e3;
var AUDIO_EXTS = [
  "mp3",
  "m4a",
  "m4b",
  "wav",
  "wave",
  "aac",
  "amr",
  "awb",
  "3ga",
  "flac",
  "ogg",
  "oga",
  "opus",
  "wma",
  "webm",
  "weba",
  "caf",
  "aiff",
  "aif",
  "aifc",
  "mp2",
  "mpga",
  "ac3",
  "eac3",
  "ape",
  "wv",
  "mka",
  "spx",
  "alac",
  "au",
  "snd"
];
var VIDEO_EXTS = [
  "mp4",
  "mov",
  "mkv",
  "avi",
  "flv",
  "f4v",
  "wmv",
  "asf",
  "m4v",
  "3gp",
  "3g2",
  "mpg",
  "mpeg",
  "ts",
  "mts",
  "m2ts",
  "vob",
  "ogv",
  "rm",
  "rmvb",
  "divx",
  "dv",
  "mxf"
];
var TRANSCRIPT_EXTS = ["txt", "md", "markdown", "docx", "srt", "vtt", "json", "text", "log"];
function extOf(name) {
  return (0, import_path.extname)(name).replace(/^\./, "").toLowerCase();
}
function mediaKindByExt(name) {
  const ext = extOf(name);
  if (!ext) return null;
  if (TRANSCRIPT_EXTS.includes(ext)) return "transcript";
  if (VIDEO_EXTS.includes(ext)) return "video";
  if (AUDIO_EXTS.includes(ext)) return "audio";
  return null;
}
function runProcess(bin, args, opts = {}) {
  return new Promise((resolve3, reject) => {
    if (opts.signal?.aborted) {
      reject(abortError());
      return;
    }
    const child = (0, import_child_process.spawn)(bin, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let stdout = "";
    let stderr = "";
    let finished = false;
    const onAbort = () => {
      try {
        child.kill("SIGKILL");
      } catch {
      }
      finish2(() => reject(abortError()));
    };
    const timer = opts.timeoutMs ? setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch {
      }
      finish2(() => reject(new Error((0, import_i18n3.t)("\u5904\u7406\u8D85\u65F6"))));
    }, opts.timeoutMs) : null;
    const finish2 = (fn) => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      opts.signal?.removeEventListener("abort", onAbort);
      fn();
    };
    const decodeOut = (0, import_node_runtime.createChunkDecoder)();
    const decodeErr = (0, import_node_runtime.createChunkDecoder)();
    opts.signal?.addEventListener("abort", onAbort, { once: true });
    child.stdout.on("data", (b) => {
      if (stdout.length < 4e6) stdout += decodeOut(b);
    });
    child.stderr.on("data", (b) => {
      if (stderr.length < 2e5) stderr += decodeErr(b);
    });
    child.on("error", (e) => finish2(() => reject(e)));
    child.on("close", (code) => {
      finish2(() => resolve3({ code, stdout, stderr }));
    });
  });
}
function abortError() {
  const e = new Error((0, import_i18n3.t)("\u5904\u7406\u5DF2\u53D6\u6D88"));
  e.aborted = true;
  return e;
}
async function probeMedia(ffprobe, path, signal) {
  try {
    const r = await runProcess(ffprobe, ["-v", "error", "-show_entries", "stream=codec_type:format=duration", "-of", "json", path], { signal, timeoutMs: 6e4 });
    if (r.code !== 0) return null;
    const j = JSON.parse(r.stdout || "{}");
    const streams = Array.isArray(j.streams) ? j.streams : [];
    const duration = Number(j?.format?.duration);
    return {
      hasAudio: streams.some((s) => s.codec_type === "audio"),
      hasVideo: streams.some((s) => s.codec_type === "video"),
      duration: Number.isFinite(duration) && duration > 0 ? duration : void 0
    };
  } catch (e) {
    if (e?.aborted) throw e;
    return null;
  }
}
function looksLikeText(path) {
  let fd = -1;
  try {
    fd = (0, import_fs.openSync)(path, "r");
    const buf = Buffer.alloc(4096);
    const n = (0, import_fs.readSync)(fd, buf, 0, buf.length, 0);
    if (n === 0) return false;
    const head2 = buf.subarray(0, n);
    if (head2[0] === 255 && head2[1] === 254) return true;
    if (head2[0] === 254 && head2[1] === 255) return true;
    let bad = 0;
    for (const b of head2) if (b === 0 || b < 9 || b > 13 && b < 32 && b !== 27) bad++;
    if (bad > n * 0.01) return false;
    const text = head2.toString("utf8");
    const replacement = (text.match(/�/g) || []).length;
    return replacement <= 2;
  } catch {
    return false;
  } finally {
    if (fd >= 0) try {
      (0, import_fs.closeSync)(fd);
    } catch {
    }
  }
}
async function classifyMeetingFile(path, name, ffprobe, signal) {
  const byExt = mediaKindByExt(name || path);
  if (byExt === "transcript") return { kind: "transcript" };
  if (byExt) return { kind: byExt };
  if (ffprobe) {
    const p = await probeMedia(ffprobe, path, signal);
    if (p?.hasAudio) return { kind: p.hasVideo ? "video" : "audio", probe: p };
  }
  if (looksLikeText(path)) return { kind: "transcript" };
  return null;
}
async function convertToWav16k(ffmpeg, input, output, displayName, signal) {
  const r = await runProcess(ffmpeg, [
    "-nostdin",
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    input,
    "-map",
    "0:a:0",
    "-vn",
    "-sn",
    "-dn",
    "-ac",
    "1",
    "-ar",
    String(SAMPLE_RATE),
    "-c:a",
    "pcm_s16le",
    "-f",
    "wav",
    output
  ], { signal, timeoutMs: 60 * 6e4 });
  if (r.code !== 0 || !(0, import_fs.existsSync)(output)) {
    const err = r.stderr || "";
    if (/matches no streams|does not contain any stream|Output file .*does not contain/i.test(err)) {
      throw new Error((0, import_i18n3.t)("\u6587\u4EF6\u300C{p0}\u300D\u91CC\u6CA1\u6709\u97F3\u8F68\uFF0C\u65E0\u6CD5\u8F6C\u5199", { p0: displayName }));
    }
    throw new Error((0, import_i18n3.t)("\u6587\u4EF6\u300C{p0}\u300D\u89E3\u7801\u5931\u8D25\uFF08\u6587\u4EF6\u53EF\u80FD\u5DF2\u635F\u574F\u6216\u683C\u5F0F\u7279\u6B8A\uFF09", { p0: displayName }));
  }
}
function readWavInfo(path) {
  const fd = (0, import_fs.openSync)(path, "r");
  try {
    const head2 = Buffer.alloc(12);
    (0, import_fs.readSync)(fd, head2, 0, 12, 0);
    if (head2.toString("ascii", 0, 4) !== "RIFF" || head2.toString("ascii", 8, 12) !== "WAVE") throw new Error((0, import_i18n3.t)("\u97F3\u9891\u4E2D\u95F4\u6587\u4EF6\u683C\u5F0F\u4E0D\u5BF9"));
    const fileSize = (0, import_fs.statSync)(path).size;
    let pos = 12;
    let fmt = null;
    const ch = Buffer.alloc(8);
    while (pos + 8 <= fileSize) {
      (0, import_fs.readSync)(fd, ch, 0, 8, pos);
      const id = ch.toString("ascii", 0, 4);
      const size = ch.readUInt32LE(4);
      if (id === "fmt ") {
        const f = Buffer.alloc(Math.min(size, 40));
        (0, import_fs.readSync)(fd, f, 0, f.length, pos + 8);
        fmt = { channels: f.readUInt16LE(2), sampleRate: f.readUInt32LE(4), bits: f.readUInt16LE(14) };
      } else if (id === "data") {
        if (!fmt) break;
        const dataOffset = pos + 8;
        const avail = fileSize - dataOffset;
        const dataBytes = size === 0 || size === 4294967295 || size > avail ? avail : size;
        const bytesPerSec = fmt.sampleRate * fmt.channels * (fmt.bits / 8);
        return { dataOffset, dataBytes, sampleRate: fmt.sampleRate, channels: fmt.channels, bitsPerSample: fmt.bits, duration: bytesPerSec ? dataBytes / bytesPerSec : 0 };
      }
      pos += 8 + size + size % 2;
    }
    throw new Error((0, import_i18n3.t)("\u97F3\u9891\u4E2D\u95F4\u6587\u4EF6\u683C\u5F0F\u4E0D\u5BF9"));
  } finally {
    (0, import_fs.closeSync)(fd);
  }
}
function assertMono16k(info) {
  if (info.sampleRate !== SAMPLE_RATE || info.channels !== 1 || info.bitsPerSample !== 16) throw new Error((0, import_i18n3.t)("\u97F3\u9891\u4E2D\u95F4\u6587\u4EF6\u683C\u5F0F\u4E0D\u5BF9"));
}
function wavHeader(dataBytes, sampleRate = SAMPLE_RATE) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0, "ascii");
  h.writeUInt32LE(Math.min(4294967295, 36 + dataBytes), 4);
  h.write("WAVE", 8, "ascii");
  h.write("fmt ", 12, "ascii");
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sampleRate, 24);
  h.writeUInt32LE(sampleRate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36, "ascii");
  h.writeUInt32LE(Math.min(4294967295, dataBytes), 40);
  return h;
}
function readPcmRange(path, info, startSec, endSec) {
  assertMono16k(info);
  const total = Math.floor(info.dataBytes / 2);
  const s = Math.max(0, Math.min(total, Math.floor(startSec * SAMPLE_RATE)));
  const e = Math.max(s, Math.min(total, Math.floor(endSec * SAMPLE_RATE)));
  const buf = Buffer.alloc((e - s) * 2);
  const fd = (0, import_fs.openSync)(path, "r");
  try {
    let off = 0;
    while (off < buf.length) {
      const n = (0, import_fs.readSync)(fd, buf, off, buf.length - off, info.dataOffset + s * 2 + off);
      if (n <= 0) break;
      off += n;
    }
  } finally {
    (0, import_fs.closeSync)(fd);
  }
  return new Int16Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 2));
}
function writeWav16k(path, pcm) {
  const fd = (0, import_fs.openSync)(path, "w");
  try {
    const data = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
    (0, import_fs.writeSync)(fd, wavHeader(data.length));
    (0, import_fs.writeSync)(fd, data);
  } finally {
    (0, import_fs.closeSync)(fd);
  }
}
async function concatWav16k(inputs, output) {
  const infos = inputs.map(readWavInfo);
  infos.forEach(assertMono16k);
  const total = infos.reduce((s, i) => s + i.dataBytes - i.dataBytes % 2, 0);
  const offsets = [];
  await new Promise((resolve3, reject) => {
    const out = (0, import_fs.createWriteStream)(output);
    out.on("error", reject);
    out.write(wavHeader(total));
    let acc = 0;
    const step = 4 * 1024 * 1024;
    for (let k = 0; k < inputs.length; k++) {
      offsets.push(acc / 2 / SAMPLE_RATE);
      const info = infos[k];
      const bytes = info.dataBytes - info.dataBytes % 2;
      const fd = (0, import_fs.openSync)(inputs[k], "r");
      try {
        for (let off = 0; off < bytes; off += step) {
          const len = Math.min(step, bytes - off);
          const buf = Buffer.alloc(len);
          (0, import_fs.readSync)(fd, buf, 0, len, info.dataOffset + off);
          out.write(buf);
        }
      } finally {
        (0, import_fs.closeSync)(fd);
      }
      acc += bytes;
    }
    out.end(() => resolve3());
  });
  return offsets;
}
function frameEnergiesDb(path, info, hopMs = 10, opts = {}) {
  assertMono16k(info);
  const hpHz = opts.highPassHz && opts.highPassHz > 0 ? opts.highPassHz : 0;
  const rc = hpHz ? 1 / (2 * Math.PI * hpHz) : 0;
  const a = hpHz ? rc / (rc + 1 / SAMPLE_RATE) : 0;
  let y1 = 0, x1p = 0, y2 = 0, y1p = 0;
  const hop = Math.round(SAMPLE_RATE * hopMs / 1e3);
  const totalSamples = Math.floor(info.dataBytes / 2);
  const frames = Math.floor(totalSamples / hop);
  const out = new Float32Array(frames);
  const framesPerChunk = 2e3;
  const fd = (0, import_fs.openSync)(path, "r");
  try {
    const buf = Buffer.alloc(framesPerChunk * hop * 2);
    const view = new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2);
    for (let f0 = 0; f0 < frames; f0 += framesPerChunk) {
      const nFrames = Math.min(framesPerChunk, frames - f0);
      const bytes = nFrames * hop * 2;
      (0, import_fs.readSync)(fd, buf, 0, bytes, info.dataOffset + f0 * hop * 2);
      for (let k = 0; k < nFrames; k++) {
        let sum = 0;
        const base = k * hop;
        for (let i = 0; i < hop; i++) {
          let v = view[base + i] / 32768;
          if (hpHz) {
            y1 = a * (y1 + v - x1p);
            x1p = v;
            y2 = a * (y2 + y1 - y1p);
            y1p = y1;
            v = y2;
          }
          sum += v * v;
        }
        out[f0 + k] = 10 * Math.log10(sum / hop + 1e-10);
      }
    }
  } finally {
    (0, import_fs.closeSync)(fd);
  }
  return out;
}
function pcmFrameDb(pcm, hopMs = 10) {
  const hop = Math.round(SAMPLE_RATE * hopMs / 1e3);
  const frames = Math.floor(pcm.length / hop);
  const out = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    for (let i = 0; i < hop; i++) {
      const v = pcm[f * hop + i] / 32768;
      sum += v * v;
    }
    out[f] = 10 * Math.log10(sum / hop + 1e-10);
  }
  return out;
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/slice.ts
var DEFAULT_SLICE_OPTIONS = {
  hopSec: 0.01,
  minPauseSec: 0.15,
  cutPauseSec: 0.5,
  maxSliceSec: 20,
  minSliceSec: 1,
  mergeMaxGapSec: 0.5,
  minSpeechSec: 0.25,
  minBlipSec: 0.08,
  padSec: 0.1,
  floorWindowSec: 30,
  minDeltaDb: 6,
  absSilenceDb: -55,
  smoothFrames: 5
};
var BINS = 121;
function histPercentile(hist, total, p) {
  if (total <= 0) return -120;
  const target = p * total;
  let acc = 0;
  for (let k = 0; k < BINS; k++) {
    acc += hist[k];
    if (acc >= target) return k - 120;
  }
  return 0;
}
var MIN_CONTRAST_DB = 10;
function adaptiveThreshold(db, opts = {}) {
  const o = { ...DEFAULT_SLICE_OPTIONS, ...opts };
  const n = db.length;
  const out = new Float32Array(n);
  if (!n) return out;
  const blockFrames = Math.max(1, Math.round(1 / o.hopSec));
  const nBlocks = Math.ceil(n / blockFrames);
  const prefix = new Int32Array((nBlocks + 1) * BINS);
  for (let b = 0; b < nBlocks; b++) {
    const base = (b + 1) * BINS;
    prefix.set(prefix.subarray(b * BINS, (b + 1) * BINS), base);
    for (let i = b * blockFrames; i < Math.min(n, (b + 1) * blockFrames); i++) {
      const k = Math.max(0, Math.min(BINS - 1, Math.round(db[i]) + 120));
      prefix[base + k]++;
    }
  }
  const hist = new Int32Array(BINS);
  const windowStats = (lo, hi) => {
    let total = 0;
    for (let k = 0; k < BINS; k++) {
      const v = prefix[hi * BINS + k] - prefix[lo * BINS + k];
      hist[k] = v;
      total += v;
    }
    return { floor: histPercentile(hist, total, 0.05), speech: histPercentile(hist, total, 0.9), median: histPercentile(hist, total, 0.5) };
  };
  const halves = [Math.max(1, Math.round(o.floorWindowSec / 2)), 60, 240, nBlocks];
  const blockThr = new Float32Array(nBlocks);
  for (let b = 0; b < nBlocks; b++) {
    let st = windowStats(Math.max(0, b - halves[0]), Math.min(nBlocks, b + halves[0] + 1));
    for (let h = 1; h < halves.length && st.speech - st.floor < MIN_CONTRAST_DB; h++) {
      st = windowStats(Math.max(0, b - halves[h]), Math.min(nBlocks, b + halves[h] + 1));
    }
    if (st.speech - st.floor < MIN_CONTRAST_DB) {
      blockThr[b] = st.median > -40 ? st.floor - 1 : st.speech + 1;
      continue;
    }
    const delta = Math.max(o.minDeltaDb, 0.4 * (st.speech - st.floor));
    blockThr[b] = Math.max(o.absSilenceDb, st.floor + delta);
  }
  for (let i = 0; i < n; i++) {
    const pos = i / blockFrames - 0.5;
    const b0 = Math.max(0, Math.min(nBlocks - 1, Math.floor(pos)));
    const b1 = Math.min(nBlocks - 1, b0 + 1);
    const w = Math.max(0, Math.min(1, pos - b0));
    out[i] = blockThr[b0] * (1 - w) + blockThr[b1] * w;
  }
  return out;
}
function speechMask(db, thr, opts = {}) {
  const o = { ...DEFAULT_SLICE_OPTIONS, ...opts };
  const n = db.length;
  const m = new Uint8Array(n);
  for (let i2 = 0; i2 < n; i2++) m[i2] = db[i2] > thr[i2] ? 1 : 0;
  const minGap = Math.round(o.minPauseSec / o.hopSec);
  const minBlip = Math.round(o.minBlipSec / o.hopSec);
  let i = 0;
  while (i < n) {
    if (m[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j < n && !m[j]) j++;
    if (i > 0 && j < n && j - i < minGap) m.fill(1, i, j);
    i = j;
  }
  i = 0;
  while (i < n) {
    if (!m[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j < n && m[j]) j++;
    if (j - i < minBlip) m.fill(0, i, j);
    i = j;
  }
  return m;
}
function runsOf(mask) {
  const runs = [];
  let i = 0;
  while (i < mask.length) {
    if (!mask[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j < mask.length && mask[j]) j++;
    runs.push({ s: i, e: j });
    i = j;
  }
  return runs;
}
function splitLong(group, db, maxFrames, minSideFrames) {
  const len = group[group.length - 1].e - group[0].s;
  if (len <= maxFrames) return [group];
  let best = -1;
  let bestGap = -1;
  for (let k = 0; k < group.length - 1; k++) {
    const gap = group[k + 1].s - group[k].e;
    const left2 = group[k].e - group[0].s;
    const right2 = group[group.length - 1].e - group[k + 1].s;
    if (left2 < minSideFrames || right2 < minSideFrames) continue;
    if (gap > bestGap) {
      bestGap = gap;
      best = k;
    }
  }
  if (best >= 0) {
    return [
      ...splitLong(group.slice(0, best + 1), db, maxFrames, minSideFrames),
      ...splitLong(group.slice(best + 1), db, maxFrames, minSideFrames)
    ];
  }
  const s0 = group[0].s;
  const from = s0 + Math.floor(len / 3);
  const to = s0 + Math.ceil(len * 2 / 3);
  let cut = from;
  let minDb = Infinity;
  for (let f = from; f < to; f++) {
    const v = (db[f - 1] ?? db[f]) + db[f] + (db[f + 1] ?? db[f]);
    if (v < minDb) {
      minDb = v;
      cut = f;
    }
  }
  const left = [];
  const right = [];
  for (const r of group) {
    if (r.e <= cut) left.push(r);
    else if (r.s >= cut) right.push(r);
    else {
      left.push({ s: r.s, e: cut });
      right.push({ s: cut, e: r.e });
    }
  }
  if (!left.length || !right.length) return [group];
  return [...splitLong(left, db, maxFrames, minSideFrames), ...splitLong(right, db, maxFrames, minSideFrames)];
}
function smoothDb(db, w) {
  const n = db.length;
  if (w <= 1 || n === 0) return db;
  const half = Math.floor(w / 2);
  const p = new Float64Array(n);
  for (let i = 0; i < n; i++) p[i] = 10 ** (db[i] / 10);
  const prefix = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + p[i];
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - half);
    const hi = Math.min(n, i - half + w);
    out[i] = 10 * Math.log10(Math.max(1e-12, (prefix[hi] - prefix[lo]) / (hi - lo)));
  }
  return out;
}
function planSlices(rawDb, opts = {}) {
  const o = { ...DEFAULT_SLICE_OPTIONS, ...opts };
  const db = smoothDb(rawDb, o.smoothFrames);
  const thr = adaptiveThreshold(db, o);
  const mask = speechMask(db, thr, o);
  const runs = runsOf(mask);
  if (!runs.length) return [];
  const f = (sec) => Math.round(sec / o.hopSec);
  const cutFrames = f(o.cutPauseSec);
  const maxFrames = f(o.maxSliceSec);
  const minFrames = f(o.minSliceSec);
  const mergeGap = f(o.mergeMaxGapSec);
  let groups = [];
  let cur = [runs[0]];
  for (let k = 1; k < runs.length; k++) {
    if (runs[k].s - runs[k - 1].e >= cutFrames) {
      groups.push(cur);
      cur = [];
    }
    cur.push(runs[k]);
  }
  groups.push(cur);
  groups = groups.flatMap((g) => splitLong(g, db, maxFrames, minFrames));
  const lenOf = (g) => g[g.length - 1].e - g[0].s;
  let changed = true;
  while (changed) {
    changed = false;
    for (let k = 0; k < groups.length; k++) {
      const g = groups[k];
      if (lenOf(g) >= minFrames) continue;
      const prev = k > 0 ? groups[k - 1] : null;
      const next = k < groups.length - 1 ? groups[k + 1] : null;
      const gapPrev = prev ? g[0].s - prev[prev.length - 1].e : Infinity;
      const gapNext = next ? next[0].s - g[g.length - 1].e : Infinity;
      const okPrev = !!prev && gapPrev <= mergeGap && g[g.length - 1].e - prev[0].s <= maxFrames;
      const okNext = !!next && gapNext <= mergeGap && next[next.length - 1].e - g[0].s <= maxFrames;
      if (okPrev && (!okNext || gapPrev <= gapNext)) {
        groups.splice(k - 1, 2, [...prev, ...g]);
        changed = true;
        break;
      }
      if (okNext) {
        groups.splice(k, 2, [...g, ...next]);
        changed = true;
        break;
      }
    }
  }
  const minSpeech = f(o.minSpeechSec);
  const pad3 = f(o.padSec);
  const kept = groups.filter((g) => g.reduce((s, r) => s + r.e - r.s, 0) >= minSpeech);
  const total = db.length;
  return kept.map((g, k) => {
    const s = g[0].s;
    const e = g[g.length - 1].e;
    const prevEnd = k > 0 ? kept[k - 1][kept[k - 1].length - 1].e : 0;
    const nextStart = k < kept.length - 1 ? kept[k + 1][0].s : total;
    const padL = Math.min(pad3, Math.floor((s - prevEnd) / 2));
    const padR = Math.min(pad3, Math.floor((nextStart - e) / 2));
    const speech = g.reduce((acc, r) => acc + r.e - r.s, 0);
    return {
      start: round3((s - Math.max(0, padL)) * o.hopSec),
      end: round3((e + Math.max(0, padR)) * o.hopSec),
      speech: round3(speech * o.hopSec)
    };
  });
}
function round3(x) {
  return Math.round(x * 1e3) / 1e3;
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/cloudAsr.ts
var import_i18n4 = require("npm:@totalclaw/i18n");
var CLOUD_ASR_PRESETS = [
  // 百炼新开的工作空间也可能给形如 https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1 的地址，界面上可以改
  { id: "dashscope", protocol: "chat-audio", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", models: ["qwen3-asr-flash"], keyUrl: "https://bailian.console.aliyun.com/?tab=model#/api-key" },
  { id: "siliconflow", protocol: "transcriptions", baseUrl: "https://api.siliconflow.cn/v1", models: ["FunAudioLLM/SenseVoiceSmall", "TeleAI/TeleSpeechASR"], keyUrl: "https://cloud.siliconflow.cn/account/ak" },
  { id: "openai", protocol: "transcriptions", baseUrl: "https://api.openai.com/v1", models: ["gpt-4o-transcribe", "whisper-1"], keyUrl: "https://platform.openai.com/api-keys" },
  { id: "custom", protocol: "transcriptions", baseUrl: "", models: [], keyUrl: "" }
];
function cloudAsrPreset(id) {
  return CLOUD_ASR_PRESETS.find((p) => p.id === id) ?? CLOUD_ASR_PRESETS[CLOUD_ASR_PRESETS.length - 1];
}
function normalizeBaseUrl(raw) {
  let u = String(raw || "").trim().replace(/\/+$/, "");
  u = u.replace(/\/(audio\/transcriptions|chat\/completions)$/i, "");
  if (!/^https?:\/\/[^\s/]+/i.test(u)) return null;
  return u;
}
function httpErrorText(status, detail) {
  if (status === 401 || status === 403) return (0, import_i18n4.t)("API Key \u4E0D\u5BF9\u3001\u5DF2\u5931\u6548\uFF0C\u6216\u8005\u8FD9\u4E2A\u8D26\u53F7\u6CA1\u6709\u5F00\u901A\u8BE5\u6A21\u578B");
  if (status === 404) return (0, import_i18n4.t)("\u63A5\u53E3\u5730\u5740\u6216\u6A21\u578B\u540D\u4E0D\u5BF9\uFF08{p0}\uFF09", { p0: detail || status });
  if (status === 413) return (0, import_i18n4.t)("\u4E0A\u4F20\u7684\u97F3\u9891\u592A\u5927\uFF0C\u63A5\u53E3\u62D2\u6536");
  if (status === 429) return (0, import_i18n4.t)("\u8BF7\u6C42\u592A\u9891\u7E41\u6216\u989D\u5EA6\u7528\u5B8C\u4E86\uFF0C\u7A0D\u540E\u518D\u8BD5");
  return `HTTP ${status}${detail ? `\uFF1A${detail}` : ""}`;
}
function errorDetail(body) {
  try {
    const j = JSON.parse(body);
    return String(j?.error?.message || j?.message || j?.error || "").slice(0, 160);
  } catch {
    return body.replace(/\s+/g, " ").trim().slice(0, 160);
  }
}
function contentText(c) {
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((x) => typeof x === "string" ? x : String(x?.text ?? "")).join("");
  return "";
}
async function cloudTranscribe(cfg, wav, opts = {}) {
  const base = normalizeBaseUrl(cfg.baseUrl);
  if (!base) return { ok: false, error: (0, import_i18n4.t)("\u5728\u7EBF\u63A5\u53E3\u5730\u5740\u4E0D\u5BF9\uFF0C\u8BF7\u586B http:// \u6216 https:// \u5F00\u5934\u7684\u5730\u5740") };
  if (!cfg.model.trim()) return { ok: false, error: (0, import_i18n4.t)("\u8BF7\u586B\u5199\u5728\u7EBF\u63A5\u53E3\u7684\u6A21\u578B\u540D") };
  if (!cfg.apiKey.trim()) return { ok: false, error: (0, import_i18n4.t)("\u8BF7\u586B\u5199\u5728\u7EBF\u63A5\u53E3\u7684 API Key") };
  const preset = cloudAsrPreset(cfg.provider);
  const fetchImpl = opts.fetchImpl ?? fetch;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), opts.timeoutMs ?? 6e4);
  const onAbort = () => ctl.abort();
  opts.signal?.addEventListener("abort", onAbort);
  try {
    let res;
    if (preset.protocol === "chat-audio") {
      res = await fetchImpl(`${base}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.apiKey.trim()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: cfg.model.trim(),
          messages: [{ role: "user", content: [{ type: "input_audio", input_audio: { data: `data:audio/wav;base64,${wav.toString("base64")}` } }] }],
          stream: false,
          asr_options: { enable_itn: true }
        }),
        signal: ctl.signal
      });
    } else {
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(wav)], { type: "audio/wav" }), "audio.wav");
      form.append("model", cfg.model.trim());
      res = await fetchImpl(`${base}/audio/transcriptions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.apiKey.trim()}` },
        body: form,
        signal: ctl.signal
      });
    }
    const body = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: httpErrorText(res.status, errorDetail(body)) };
    let j;
    try {
      j = JSON.parse(body);
    } catch {
      return { ok: false, error: (0, import_i18n4.t)("\u5728\u7EBF\u63A5\u53E3\u8FD4\u56DE\u7684\u4E0D\u662F JSON\uFF0C\u5730\u5740\u53EF\u80FD\u586B\u9519\u4E86") };
    }
    const text = preset.protocol === "chat-audio" ? contentText(j?.choices?.[0]?.message?.content) : String(j?.text ?? "");
    return { ok: true, text: text.trim() };
  } catch (e) {
    if (opts.signal?.aborted) return { ok: false, error: (0, import_i18n4.t)("\u5DF2\u53D6\u6D88") };
    if (ctl.signal.aborted) return { ok: false, error: (0, import_i18n4.t)("\u5728\u7EBF\u63A5\u53E3\u8D85\u65F6\u6CA1\u6709\u54CD\u5E94") };
    const host = (() => {
      try {
        return new URL(base).host;
      } catch {
        return base;
      }
    })();
    return { ok: false, error: (0, import_i18n4.t)("\u8FDE\u4E0D\u4E0A {p0}\uFF1A{p1}", { p0: host, p1: e?.message || String(e) }) };
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener("abort", onAbort);
  }
}
function silenceWav(seconds = 1) {
  const samples = Math.round(16e3 * seconds);
  const buf = Buffer.alloc(44 + samples * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(16e3, 24);
  buf.writeUInt32LE(32e3, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples * 2, 40);
  return buf;
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/index.ts
init_runtime();

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/workerPool.ts
var import_child_process2 = require("child_process");
var import_node_runtime2 = require("npm:@totalclaw/node-runtime");
var import_i18n5 = require("npm:@totalclaw/i18n");

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/worker.py.ts
var MEETING_WORKER_PY = `
import sys, json, os, re, struct, time, warnings
warnings.filterwarnings("ignore")

plugins = sys.argv[1] if len(sys.argv) > 1 else ""
if plugins:
    sys.path.insert(0, plugins)
model_name = sys.argv[2] if len(sys.argv) > 2 else ""
models_dir = sys.argv[3] if len(sys.argv) > 3 else ""
campp_path = sys.argv[4] if len(sys.argv) > 4 else ""
# \u7B2C\u4E8C\u4E2A\u58F0\u7EB9\u6A21\u578B\uFF08ERes2NetV2\uFF0C\u4F1A\u8BAE\u8BA4\u4EBA\u66F4\u51C6\uFF09\uFF1A\u548C CAM++ \u5171\u7528\u540C\u4E00\u4EFD fbank \u7279\u5F81\uFF0C\u4E24\u4E2A\u90FD\u6709\u5C31\u4E24\u4E2A\u90FD\u7B97
campp2_path = sys.argv[6] if len(sys.argv) > 6 else ""
threads = int(sys.argv[5]) if len(sys.argv) > 5 and sys.argv[5] else 4

def emit(obj):
    sys.stdout.write("__TC_MM__" + json.dumps(obj, ensure_ascii=False) + "\\n")
    sys.stdout.flush()

try:
    import numpy as np
except Exception as e:
    emit({"ready": False, "error": "numpy unavailable: %s" % e})
    sys.exit(0)

asr = None
asr_err = None
sherpa = None
sherpa_kind = None
sherpa_sv = None  # FireRedASR2 \u7684\u515C\u5E95\uFF1A\u540C\u4E00\u7247 SenseVoice \u4E5F\u8F6C\u4E00\u904D\uFF0CFireRed \u6F0F\u5B57 / \u590D\u8BFB / \u566A\u58F0\u91CC\u8DD1\u98DE\u65F6\u7528\u5B83
if model_name.startswith("sherpa:"):
    try:
        cfg = json.loads(model_name[len("sherpa:"):])
        sherpa_kind = cfg.get("kind")
        d = cfg.get("dir") or ""
        import sherpa_onnx
        if sherpa_kind == "sense_voice":
            sherpa = sherpa_onnx.OfflineRecognizer.from_sense_voice(
                model=os.path.join(d, "model.int8.onnx"), tokens=os.path.join(d, "tokens.txt"),
                num_threads=threads, use_itn=True, language="auto")
        elif sherpa_kind == "fire_red_aed":
            sherpa = sherpa_onnx.OfflineRecognizer.from_fire_red_asr(
                encoder=os.path.join(d, "encoder.int8.onnx"), decoder=os.path.join(d, "decoder.int8.onnx"),
                tokens=os.path.join(d, "tokens.txt"), num_threads=threads)
            sv_dir = cfg.get("svDir") or ""
            if sv_dir:
                try:
                    sherpa_sv = sherpa_onnx.OfflineRecognizer.from_sense_voice(
                        model=os.path.join(sv_dir, "model.int8.onnx"), tokens=os.path.join(sv_dir, "tokens.txt"),
                        num_threads=max(2, threads // 2), use_itn=True, language="auto")
                except Exception:
                    sherpa_sv = None
        else:
            raise RuntimeError("unknown sherpa model kind: %s" % sherpa_kind)
    except Exception as e:
        sherpa = None
        asr_err = "sherpa model unavailable: %s" % e
    model_name_for_whisper = ""
else:
    model_name_for_whisper = model_name
if model_name_for_whisper:
    try:
        import ctranslate2
        from faster_whisper import WhisperModel
        device = "cuda" if ctranslate2.get_cuda_device_count() else "cpu"
        compute = "int8" if device == "cpu" and "int8" in ctranslate2.get_supported_compute_types("cpu") else "auto"
        last = None
        for root in ([models_dir, None] if models_dir else [None]):
            try:
                kw = dict(device=device, compute_type=compute, cpu_threads=threads, local_files_only=True)
                if root:
                    kw["download_root"] = root
                asr = WhisperModel(model_name_for_whisper, **kw)
                break
            except Exception as e:
                last = e
        if asr is None:
            asr_err = "model not cached (%s): %s" % (model_name_for_whisper, last)
    except Exception as e:
        asr_err = "faster-whisper unavailable: %s" % e

emb_model = None
emb_model2 = None
emb_err = None
fbank_impl = None
if campp_path or campp2_path:
    try:
        import onnxruntime as ort
        so = ort.SessionOptions()
        so.intra_op_num_threads = 2
        so.inter_op_num_threads = 1
        if campp_path:
            emb_model = ort.InferenceSession(campp_path, sess_options=so, providers=["CPUExecutionProvider"])
        if campp2_path:
            try:
                emb_model2 = ort.InferenceSession(campp2_path, sess_options=so, providers=["CPUExecutionProvider"])
            except Exception as e2:
                emb_err = "speaker model 2 unavailable: %s" % e2
        try:
            import kaldi_native_fbank as knf
            fbank_impl = "knf"
        except Exception:
            fbank_impl = "numpy"
    except Exception as e:
        emb_err = "speaker model unavailable: %s" % e

has_asr = asr is not None or sherpa is not None
if model_name and not has_asr and not (campp_path or campp2_path):
    emit({"ready": False, "error": asr_err})
    sys.exit(0)

# \u2500\u2500 16k \u5355\u58F0\u9053 16 \u4F4D wav\uFF1Amemmap \u6253\u5F00\uFF0C\u5207\u7247\u76F4\u63A5\u53D6 \u2500\u2500
_pcm_cache = {}
def open_pcm(path):
    if path in _pcm_cache:
        return _pcm_cache[path]
    size = os.path.getsize(path)
    with open(path, "rb") as f:
        head = f.read(12)
        if head[:4] != b"RIFF" or head[8:12] != b"WAVE":
            raise ValueError("not a wav file")
        fmt = None
        pos = 12
        while pos + 8 <= size:
            f.seek(pos)
            ch = f.read(8)
            cid = ch[:4]
            csize = struct.unpack("<I", ch[4:8])[0]
            if cid == b"fmt ":
                fmt = f.read(min(csize, 40))
            elif cid == b"data":
                off = pos + 8
                avail = size - off
                n = avail if (csize == 0 or csize == 0xFFFFFFFF or csize > avail) else csize
                if fmt is None:
                    raise ValueError("wav without fmt")
                chs = struct.unpack("<H", fmt[2:4])[0]
                sr = struct.unpack("<I", fmt[4:8])[0]
                bits = struct.unpack("<H", fmt[14:16])[0]
                if chs != 1 or sr != 16000 or bits != 16:
                    raise ValueError("wav must be 16k mono s16")
                mm = np.memmap(path, dtype="<i2", mode="r", offset=off, shape=(n // 2,))
                _pcm_cache.clear()
                _pcm_cache[path] = mm
                return mm
            pos += 8 + csize + (csize % 2)
    raise ValueError("wav without data chunk")

def cut(pcm, s, e):
    a = max(0, int(s * 16000))
    b = min(len(pcm), int(e * 16000))
    return np.asarray(pcm[a:b], dtype=np.float32) / 32768.0

# \u2500\u2500 \u58F0\u7EB9\uFF1AKaldi fbank\uFF08\u4E0E speakerWorker \u540C\u53C2\u6570\uFF09\u2192 CAM++ \u2500\u2500
def _fbank_numpy(audio):
    # Kaldi \u517C\u5BB9\u7684 80 \u7EF4 fbank\uFF08kaldi_native_fbank \u4E0D\u5728\u65F6\u515C\u5E95\uFF09\uFF1A25ms \u7A97 / 10ms \u79FB\uFF0C\u53BB\u76F4\u6D41\uFF0C\u9884\u52A0\u91CD 0.97\uFF0Cpovey \u7A97\uFF0C512 \u70B9 FFT
    frame_len, shift, nfft = 400, 160, 512
    if len(audio) < frame_len:
        return np.zeros((0, 80), dtype=np.float32)
    n = 1 + (len(audio) - frame_len) // shift
    idx = np.arange(frame_len)[None, :] + shift * np.arange(n)[:, None]
    frames = audio[idx].astype(np.float64)
    frames = frames - frames.mean(axis=1, keepdims=True)
    pre = np.concatenate([frames[:, :1] * (1 - 0.97), frames[:, 1:] - 0.97 * frames[:, :-1]], axis=1)
    win = np.power(0.5 - 0.5 * np.cos(2 * np.pi * np.arange(frame_len) / (frame_len - 1)), 0.85)
    spec = np.abs(np.fft.rfft(pre * win, n=nfft)) ** 2
    def mel(f):
        return 1127.0 * np.log(1.0 + f / 700.0)
    lo, hi = mel(20.0), mel(8000.0)
    centers = np.linspace(lo, hi, 82)
    fft_mel = mel(np.arange(nfft // 2 + 1) * 16000.0 / nfft)
    bank = np.zeros((80, nfft // 2 + 1))
    for m in range(80):
        l, c, r = centers[m], centers[m + 1], centers[m + 2]
        up = (fft_mel - l) / (c - l)
        down = (r - fft_mel) / (r - c)
        bank[m] = np.maximum(0, np.minimum(up, down))
    feats = np.log(np.maximum(spec @ bank.T, np.finfo(np.float32).eps))
    return feats.astype(np.float32)

def fbank(audio):
    if fbank_impl == "knf":
        opts = knf.FbankOptions()
        opts.frame_opts.dither = 0
        opts.frame_opts.snip_edges = True
        opts.frame_opts.samp_freq = 16000
        opts.mel_opts.num_bins = 80
        opts.mel_opts.high_freq = 0
        f = knf.OnlineFbank(opts)
        f.accept_waveform(16000, audio.tolist())
        f.input_finished()
        if f.num_frames_ready == 0:
            return np.zeros((0, 80), dtype=np.float32)
        return np.stack([f.get_frame(i) for i in range(f.num_frames_ready)])
    return _fbank_numpy(audio)

def _run_emb(model, m):
    v = model.run(None, {model.get_inputs()[0].name: m[np.newaxis].astype(np.float32)})[0].reshape(-1)
    norm = float(np.linalg.norm(v))
    if not np.isfinite(v).all() or norm < 1e-8:
        return None
    return [round(float(x), 6) for x in (v / norm)]

def embeddings(audio):
    """(CAM++ \u58F0\u7EB9, ERes2NetV2 \u58F0\u7EB9)\uFF1A\u540C\u4E00\u4EFD fbank\uFF08\u53BB\u5747\u503C\uFF09\u9001\u8FDB\u4E24\u4E2A\u6A21\u578B\uFF1B\u54EA\u4E2A\u6A21\u578B\u6CA1\u6709\u5C31\u662F None"""
    if (emb_model is None and emb_model2 is None) or len(audio) < 16000 * 0.3:
        return None, None
    m = fbank(audio)
    if len(m) < 10:
        return None, None
    m = m - m.mean(axis=0, keepdims=True)
    return (_run_emb(emb_model, m) if emb_model is not None else None,
            _run_emb(emb_model2, m) if emb_model2 is not None else None)

def embedding(audio):
    return embeddings(audio)[0]

# \u2500\u2500 \u8F6C\u5199\uFF1A\u6BCF\u4E2A\u5207\u7247\u5355\u72EC\u8F6C\u5199\uFF08\u5207\u7247\u5DF2\u7ECF\u6309\u505C\u987F\u5207\u597D\uFF0C\u4E0D\u518D\u8DD1 VAD\uFF1B\u9759\u97F3\u5E7B\u542C\u6309 Whisper \u81EA\u5DF1\u7684\u7F6E\u4FE1\u8FC7\u6EE4\uFF09\u2500\u2500
#
# \u4E0D\u628A\u51E0\u7247\u62FC\u8FDB\u4E00\u4E2A 30 \u79D2\u7A97\u53E3\u4E00\u8D77\u8F6C\uFF1A\u5B9E\u6D4B\uFF08\u7528\u6237 67 \u5206\u949F\u5F55\u97F3\uFF09\u62FC\u7A97\u540E\u9047\u5230\u96BE\u61C2\u7684\u4E00\u7A97\uFF0CWhisper \u53EA\u51FA\u4E00\u4E2A
# \u8DE8 20 \u79D2\u7684\u6BB5\u3001\u5341\u6765\u4E2A\u5B57\uFF0C\u540E\u9762\u7684\u8BDD\u6574\u6BB5\u8DF3\u8FC7\uFF1B\u9010\u7247\u8F6C\u5199\u540C\u6837\u7684\u97F3\u9891\u6BCF\u7247\u90FD\u6709\u5B57\u3002
# \u9010\u7247\u8F6C\u5199\u7684\u4EE3\u4EF7\u662F\u6BCF\u7247\u90FD\u8981\u8FC7\u4E00\u6B21 30 \u79D2\u7684\u7F16\u7801\u5668\uFF1B\u7528 BatchedInferencePipeline + clip_timestamps \u628A\u4E00\u6279\u5207\u7247
# \u4E00\u8D77\u9001\u8FDB\u7F16\u7801\u5668 / \u89E3\u7801\u5668\uFF08\u6BCF\u7247\u4ECD\u662F\u72EC\u7ACB\u7684\u8F93\u5165\uFF0C\u4E92\u4E0D\u5F71\u54CD\uFF0C\u53EA\u662F\u6279\u91CF\u8BA1\u7B97\uFF09\uFF0C\u6BD4\u4E00\u7247\u4E00\u7247\u5730\u8DD1\u5FEB\u3002
def keep_segment(s):
    lp = float(getattr(s, "avg_logprob", 0.0) or 0.0)
    ns = float(getattr(s, "no_speech_prob", 0.0) or 0.0)
    if ns > 0.66 and lp < -0.8:
        return False
    if (getattr(s, "compression_ratio", 0.0) or 0.0) > 2.4:
        return False
    return True

def join_text(parts):
    text = ""
    for t in parts:
        t = t.strip()
        if not t:
            continue
        # \u4E2D\u6587\u76F4\u63A5\u63A5\uFF1B\u4E24\u8FB9\u90FD\u662F\u897F\u6587\u624D\u8865\u7A7A\u683C
        if text and text[-1].isascii() and not text[-1].isspace() and t[:1].isascii() and t[:1].isalnum():
            text += " "
        text += t
    return text

def summarize(segs):
    parts, lps, nss = [], [], []
    dropped = 0
    last = None
    for s in segs:
        t = (s.text or "").strip()
        if not t or t == last:
            continue
        last = t
        if not keep_segment(s):
            dropped += 1
            continue
        parts.append(t)
        lps.append(float(getattr(s, "avg_logprob", 0.0) or 0.0))
        nss.append(float(getattr(s, "no_speech_prob", 0.0) or 0.0))
    return {
        "text": join_text(parts),
        "lp": round(sum(lps) / len(lps), 3) if lps else None,
        "ns": round(sum(nss) / len(nss), 3) if nss else None,
        "dropped": dropped,
    }

def transcribe_one(audio, lang, prompt, beam):
    kw = {
        "beam_size": beam,
        "vad_filter": False,
        "condition_on_previous_text": False,
        "without_timestamps": True,
        "temperature": 0,
        "task": "transcribe",
    }
    if lang:
        kw["language"] = lang
    if prompt:
        kw["initial_prompt"] = prompt
    segs, info = asr.transcribe(audio, **kw)
    out = summarize(list(segs))
    return out, info.language, round(float(getattr(info, "language_probability", 0.0) or 0.0), 3)

batched = None
if asr is not None:
    try:
        from faster_whisper import BatchedInferencePipeline
        batched = BatchedInferencePipeline(asr)
    except Exception:
        batched = None

def transcribe_many(pieces, lang, prompt, beam):
    global batched
    if batched is None or len(pieces) < 2 or not lang:
        return [transcribe_one(a, lang, prompt, beam)[0] for a in pieces]
    cat = np.concatenate(pieces)
    clips = []
    pos = 0.0
    for a in pieces:
        d = len(a) / 16000.0
        clips.append({"start": pos, "end": pos + d})
        pos += d
    try:
        segs, _ = batched.transcribe(cat, language=lang, clip_timestamps=clips, batch_size=len(pieces), beam_size=beam,
                                     without_timestamps=True, initial_prompt=prompt, vad_filter=False, log_progress=False, temperature=0)
        segs = list(segs)
    except TypeError:
        # \u65E7\u7248 faster-whisper \u6CA1\u6709\u8FD9\u4E9B\u53C2\u6570\uFF1A\u9000\u56DE\u9010\u7247
        batched = None
        return [transcribe_one(a, lang, prompt, beam)[0] for a in pieces]
    groups = [[] for _ in pieces]
    starts = [c["start"] for c in clips]
    for s in segs:
        k = min(range(len(starts)), key=lambda j: abs(starts[j] - float(s.start)))
        groups[k].append(s)
    return [summarize(g) for g in groups]

# \u2500\u2500 sherpa-onnx \u5F15\u64CE\uFF1A\u4E00\u6279\u4E00\u8D77\u89E3\u7801\uFF1BFireRedASR2 \u540C\u4E00\u6279\u518D\u7528 SenseVoice \u8F6C\u4E00\u904D\u505A\u515C\u5E95 \u2500\u2500
_LOOP = re.compile(r"(.{2,12}?)\\1{3,}")
_LANG = {"zh": "zh", "yue": "yue", "en": "en", "ja": "ja", "ko": "ko", "chinese": "zh", "cantonese": "yue", "english": "en", "japanese": "ja", "korean": "ko"}

def _sherpa_lang(r):
    raw = (getattr(r, "lang", "") or "").strip().strip("<|>").lower()
    return _LANG.get(raw, raw if re.fullmatch(r"[a-z]{2,3}", raw or "") else None)

def _clean_sherpa(text, seconds):
    t = (text or "").strip()
    # \u81EA\u56DE\u5F52\u89E3\u7801\u5728\u5F3A\u566A\u58F0\u4E0B\u5076\u5C14\u590D\u8BFB\u540C\u4E00\u5C0F\u6BB5\uFF1A\u8FDE\u7EED 4 \u6B21\u4EE5\u4E0A\u53EA\u7559 1 \u6B21
    t = _LOOP.sub(lambda m: m.group(1), t)
    # \u8BED\u901F\u4E0A\u9650\uFF08\u6BCF\u79D2 12 \u5B57 + 20\uFF09\uFF1A\u518D\u957F\u5C31\u662F\u89E3\u7801\u8DD1\u98DE\u4E86\uFF0C\u622A\u6389
    cap = int(seconds * 12) + 20
    return t[:cap] if len(t) > cap else t

def _decode_batch(rec, pieces):
    streams = []
    for a in pieces:
        s = rec.create_stream()
        s.accept_waveform(16000, a)
        streams.append(s)
    rec.decode_streams(streams)
    return [s.result for s in streams]

def _plain(t):
    return re.sub(r"[\\s\\W_]+", "", t or "")

def _choose(q_raw, s_text):
    """FireRedASR2 \u548C SenseVoice \u540C\u4E00\u7247\u7684\u7ED3\u679C\u91CC\u6311\u4E00\u4E2A\u3002\u81EA\u56DE\u5F52\u89E3\u7801\u5076\u5C14\u6574\u53E5\u53EA\u51FA\u4E24\u4E09\u4E2A\u5B57\u3001\u6216\u5728\u5F3A\u566A\u58F0\u91CC\u590D\u8BFB\u8DD1\u98DE\uFF1B
    \u8FD9\u65F6 SenseVoice \u7684\u7ED3\u679C\u66F4\u53EF\u4FE1\u3002\u8FD4\u56DE (\u6587\u5B57, \u662F\u5426\u7528\u4E86\u515C\u5E95)\u3002"""
    q, s = _plain(q_raw), _plain(s_text)
    if not s:
        return q_raw, False
    if _LOOP.search(q_raw or ""):
        return s_text, True
    if len(s) >= 8 and len(q) < 0.5 * len(s):
        return s_text, True
    if len(q) > 2 * len(s) + 10:
        return s_text, True
    return q_raw, False

def sherpa_many(pieces):
    if sherpa_kind == "sense_voice":
        results = _decode_batch(sherpa, pieces)
        return [{"text": _clean_sherpa(r.text, len(a) / 16000.0), "lp": None, "ns": None, "dropped": 0, "lang": _sherpa_lang(r)}
                for a, r in zip(pieces, results)]
    sv_results = _decode_batch(sherpa_sv, pieces) if sherpa_sv is not None else [None] * len(pieces)
    main_results = _decode_batch(sherpa, pieces)
    outs = []
    for a, svr, mr in zip(pieces, sv_results, main_results):
        q_raw = (mr.text or "").strip()
        sec = len(a) / 16000.0
        if svr is not None:
            text, fb = _choose(q_raw, (svr.text or "").strip())
            lang = _sherpa_lang(svr)
        else:
            text, fb, lang = q_raw, False, None
        outs.append({"text": _clean_sherpa(text, sec), "lp": None, "ns": None, "dropped": 0, "lang": lang, "fb": fb})
    return outs

emit({"ready": True, "asr": has_asr, "engine": sherpa_kind or ("whisper" if asr is not None else None), "asrError": asr_err, "emb": emb_model is not None or emb_model2 is not None, "emb2": emb_model2 is not None, "embError": emb_err, "fbank": fbank_impl, "model": model_name})

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        req = json.loads(line)
    except Exception:
        continue
    rid = req.get("id")
    try:
        pcm = open_pcm(req["wav"])
        slices = req.get("slices") or []
        op = req.get("op") or "run"
        if op == "detect":
            votes = {}
            if asr is None and sherpa is not None and sherpa_kind == "sense_voice":
                # \u6CA1\u6709 Whisper\uFF1A\u7528 SenseVoice \u81EA\u5E26\u7684\u8BED\u79CD\u5224\u65AD\uFF08\u4E00\u7247\u4E00\u7968\uFF0C\u6309\u7968\u6570\uFF09
                for r in sherpa_many([cut(pcm, s, min(e, s + 28)) for s, e in slices]):
                    if r.get("lang"):
                        votes.setdefault(r["lang"], []).append(1.0)
            for s, e in slices:
                if asr is None:
                    break
                _, lang, prob = transcribe_one(cut(pcm, s, min(e, s + 28)), None, None, 1)
                if lang:
                    votes.setdefault(lang, []).append(prob)
            if votes:
                lang = max(votes, key=lambda k: (len(votes[k]), sum(votes[k])))
                emit({"id": rid, "done": True, "lang": lang, "prob": round(sum(votes[lang]) / len(votes[lang]), 3)})
            else:
                emit({"id": rid, "done": True, "lang": None, "prob": 0})
            continue
        want_asr = bool(req.get("asr")) and has_asr
        want_emb = bool(req.get("emb")) and (emb_model is not None or emb_model2 is not None)
        lang = req.get("lang") or None
        prompt = (req.get("prompt") or "").strip() or None
        beam = int(req.get("beam") or 1)
        started = time.perf_counter()
        pieces = [cut(pcm, s, e) for s, e in slices]
        outs = [{"id": rid, "i": k} for k in range(len(pieces))]
        if want_asr:
            usable = [k for k, a in enumerate(pieces) if len(a) >= 1600]
            if usable:
                try:
                    chosen = [pieces[k] for k in usable]
                    res = sherpa_many(chosen) if sherpa is not None else transcribe_many(chosen, lang, prompt, beam)
                    for k, r in zip(usable, res):
                        outs[k].update(r)
                except Exception as ex:
                    for o in outs:
                        o["asrError"] = str(ex)[:200]
        if want_emb:
            for k, a in enumerate(pieces):
                try:
                    e1, e2 = embeddings(a)
                    outs[k]["emb"] = e1
                    if emb_model2 is not None:
                        outs[k]["emb2"] = e2
                except Exception as ex:
                    outs[k]["emb"] = None
                    outs[k]["embError"] = str(ex)[:200]
        ms = round((time.perf_counter() - started) * 1000)
        for o in outs:
            o["ms"] = ms
            emit(o)
        emit({"id": rid, "done": True})
    except Exception as e:
        emit({"id": rid, "done": True, "error": str(e)[:300]})
`;

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/workerPool.ts
var MeetingWorker = class {
  constructor(spec) {
    this.spec = spec;
  }
  child = null;
  buf = "";
  handlers = /* @__PURE__ */ new Map();
  seq = 0;
  exited = false;
  stderrTail = "";
  ready = null;
  start(timeoutMs = 18e4) {
    return new Promise((resolve3, reject) => {
      const s = this.spec;
      const c = (0, import_child_process2.spawn)(s.python, ["-u", "-c", MEETING_WORKER_PY, s.pluginsDir || "", s.model || "", s.modelsDir || "", s.campp || "", String(s.threads), s.campp2 || ""], {
        env: s.env,
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true
      });
      this.child = c;
      const decode = (0, import_node_runtime2.createChunkDecoder)();
      const decodeErr = (0, import_node_runtime2.createChunkDecoder)();
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        this.kill();
        reject(new Error((0, import_i18n5.t)("\u672C\u5730\u8BED\u97F3\u6A21\u578B\u52A0\u8F7D\u8D85\u65F6")));
      }, timeoutMs);
      c.stdout.on("data", (b) => {
        this.buf += decode(b);
        let i;
        while ((i = this.buf.indexOf("\n")) >= 0) {
          const line = this.buf.slice(0, i).trim();
          this.buf = this.buf.slice(i + 1);
          if (!line.startsWith("__TC_MM__")) continue;
          let msg;
          try {
            msg = JSON.parse(line.slice("__TC_MM__".length));
          } catch {
            continue;
          }
          if (!settled && typeof msg?.ready === "boolean") {
            settled = true;
            clearTimeout(timer);
            if (msg.ready) {
              this.ready = { asr: !!msg.asr, asrError: msg.asrError, emb: !!msg.emb, embError: msg.embError, fbank: msg.fbank };
              resolve3(this.ready);
            } else {
              this.kill();
              reject(Object.assign(new Error((0, import_i18n5.t)("\u672C\u5730\u8BED\u97F3\u8BC6\u522B\u8FD0\u884C\u65F6\u4E0D\u53EF\u7528")), { detail: String(msg.error || "") }));
            }
            continue;
          }
          if (typeof msg?.id === "number") this.handlers.get(msg.id)?.(msg);
        }
      });
      c.stderr.on("data", (b) => {
        this.stderrTail = (this.stderrTail + decodeErr(b)).slice(-4e3);
      });
      const onGone = (err) => {
        this.exited = true;
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(Object.assign(new Error((0, import_i18n5.t)("\u672C\u5730\u8BED\u97F3\u8BC6\u522B\u8FDB\u7A0B\u672A\u80FD\u542F\u52A8")), { detail: String(err?.message || this.stderrTail.slice(-600)) }));
        }
        for (const [, h] of this.handlers) h({ done: true, error: "worker exited" });
        this.handlers.clear();
      };
      c.on("error", (e) => onGone(e));
      c.on("close", () => onGone());
    });
  }
  get alive() {
    return !!this.child && !this.exited;
  }
  /** 发一个请求；onItem 收逐片结果，Promise 在 done 时结束 */
  request(req, onItem, timeoutMs) {
    return new Promise((resolve3, reject) => {
      if (!this.alive) {
        reject(new Error("worker exited"));
        return;
      }
      const id = ++this.seq;
      const timer = setTimeout(() => {
        this.handlers.delete(id);
        this.kill();
        reject(new Error("worker timeout"));
      }, timeoutMs);
      this.handlers.set(id, (msg) => {
        if (msg.done) {
          clearTimeout(timer);
          this.handlers.delete(id);
          if (msg.error) reject(new Error(String(msg.error)));
          else resolve3(msg);
          return;
        }
        onItem(msg);
      });
      try {
        this.child.stdin.write(`${JSON.stringify({ ...req, id })}
`);
      } catch (e) {
        clearTimeout(timer);
        this.handlers.delete(id);
        reject(e);
      }
    });
  }
  kill() {
    try {
      this.child?.kill("SIGKILL");
    } catch {
    }
    this.exited = true;
  }
};
function makeBatches(slices, maxSec = 90, maxCount = 12) {
  const batches = [];
  let cur = [];
  let acc = 0;
  slices.forEach((s, i) => {
    const d = Math.max(0, s.end - s.start);
    if (cur.length && (acc + d > maxSec || cur.length >= maxCount)) {
      batches.push(cur);
      cur = [];
      acc = 0;
    }
    cur.push(i);
    acc += d;
  });
  if (cur.length) batches.push(cur);
  return batches;
}
async function runSlices(spec, wavPath, slices, o) {
  if (o.signal?.aborted) throw abortError();
  const results = Array.from({ length: slices.length }, () => void 0);
  const batches = makeBatches(slices, 90, o.batchCount || 12);
  const queue = batches.map((_, k) => k);
  const create = o.createWorker || ((s) => new MeetingWorker(s));
  const n = Math.max(1, Math.min(o.workers, batches.length || 1));
  const workers = [];
  let done = 0;
  let aborted = false;
  const onAbort = () => {
    aborted = true;
    workers.forEach((w) => w.kill());
  };
  o.signal?.addEventListener("abort", onAbort, { once: true });
  const startWorker = async (idx) => {
    const w = create(spec);
    workers[idx] = w;
    const ready = await w.start();
    if (o.asr && !ready.asr) {
      w.kill();
      const why = String(ready.asrError || "");
      if (/No module named '(sherpa_onnx|faster_whisper|ctranslate2)'/.test(why)) {
        throw new Error((0, import_i18n5.t)("\u8BED\u97F3\u8BC6\u522B\u7EC4\u4EF6\u6CA1\u88C5\u597D\uFF08\u6A21\u578B\u6587\u4EF6\u5728\uFF0C\u4F46\u8FD0\u884C\u7EC4\u4EF6\u7F3A\u5931\uFF09\u3002\u8BF7\u5728\u300C\u914D\u7F6E\u5F15\u5BFC \u2192 \u7535\u8111\u914D\u7F6E\u4E0E\u8BED\u97F3\u6A21\u578B\u300D\u91CC\u91CD\u65B0\u4E0B\u8F7D\u63A8\u8350\u7684\u8F6C\u5199\u6A21\u578B\u3002") + `\uFF08${why.slice(0, 120)}\uFF09`);
      }
      throw new Error((0, import_i18n5.t)("\u8BED\u97F3\u8BC6\u522B\u6A21\u578B\u6CA1\u80FD\u52A0\u8F7D\uFF1A{p0}", { p0: (why || (0, import_i18n5.t)("\u539F\u56E0\u672A\u77E5")).slice(0, 300) }));
    }
    o.onReady?.(ready, idx);
    return w;
  };
  const runBatch = async (w, k) => {
    const ids = batches[k];
    const audioSec = ids.reduce((s, i) => s + (slices[i].end - slices[i].start), 0);
    await w.request({
      op: "run",
      wav: wavPath,
      slices: ids.map((i) => [slices[i].start, slices[i].end]),
      asr: o.asr,
      emb: o.emb,
      lang: o.lang || "",
      prompt: o.prompt || "",
      beam: o.beam || 1
    }, (msg) => {
      const gi = ids[Number(msg.i)];
      if (gi === void 0 || results[gi]) return;
      results[gi] = { ...msg, i: gi };
      done++;
      o.onProgress?.(done, slices.length);
    }, Math.max(12e4, audioSec * 6e3));
  };
  const attempts = /* @__PURE__ */ new Map();
  let firstError = null;
  try {
    const loops = Array.from({ length: n }, async (_, idx) => {
      let w = null;
      let consecutive = 0;
      while (!aborted) {
        const k = queue.shift();
        if (k === void 0) break;
        try {
          if (!w || !w.alive) {
            w?.kill();
            w = await startWorker(idx);
          }
          await runBatch(w, k);
          consecutive = 0;
        } catch (e) {
          if (aborted) break;
          firstError ||= e;
          w?.kill();
          w = null;
          const a = (attempts.get(k) || 0) + 1;
          attempts.set(k, a);
          if (a < 3) queue.unshift(k);
          if (++consecutive >= 2) break;
        }
      }
      w?.kill();
    });
    await Promise.all(loops);
  } finally {
    o.signal?.removeEventListener("abort", onAbort);
    workers.forEach((w) => w?.kill());
  }
  if (aborted || o.signal?.aborted) throw abortError();
  if (results.some((r) => !r)) {
    if (firstError instanceof Error) throw firstError;
    throw new Error((0, import_i18n5.t)("\u672C\u5730\u8BED\u97F3\u8BC6\u522B\u8FDB\u7A0B\u672A\u80FD\u542F\u52A8"));
  }
  return results;
}
async function detectLanguage(spec, wavPath, sample, createWorker) {
  if (!sample.length) return { lang: null, prob: 0 };
  const w = (createWorker || ((s) => new MeetingWorker(s)))(spec);
  try {
    const ready = await w.start();
    if (!ready.asr) return { lang: null, prob: 0 };
    const msg = await w.request({ op: "detect", wav: wavPath, slices: sample.map((s) => [s.start, s.end]) }, () => {
    }, 18e4);
    return { lang: msg?.lang || null, prob: Number(msg?.prob) || 0 };
  } finally {
    w.kill();
  }
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/diarize.ts
var DEFAULT_DIARIZE_OPTIONS = {
  reliableSec: 1.5,
  clusterSim: 0.58,
  minSpeakerSec: 8,
  tinyMergeSim: 0.5,
  neighborSlack: 0.12,
  maxWeightSec: 12,
  maxClusterItems: 3e3,
  matchMargin: 0.15,
  duplicateGap: 0.12,
  weakBand: 0.1,
  duplicateKeepMargin: 0.18
};
var DEFAULT_DIARIZE_OPTIONS_V2 = { ...DEFAULT_DIARIZE_OPTIONS };
var MATCH_THRESHOLD_BASE = { campplus: 0.55, eres2netv2: 0.55 };
var SETTINGS_THRESHOLD_DEFAULT = 0.55;
var MATCH_KEYS = ["matchMargin", "duplicateGap", "weakBand", "duplicateKeepMargin"];
function dot(a, b) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}
function norm(a) {
  return Math.sqrt(dot(a, a));
}
function cosineSim(a, b) {
  if (!a.length || a.length !== b.length) return -1;
  const na = norm(a);
  const nb = norm(b);
  return na > 0 && nb > 0 ? dot(a, b) / (na * nb) : -1;
}
function unit(v) {
  const n = norm(v);
  return n > 1e-12 ? Array.from(v, (x) => x / n) : Array.from(v);
}
function agglomerate(vectors, weights, stopSim) {
  const n = vectors.length;
  if (!n) return [];
  if (n === 1) return [[0]];
  const S = new Float32Array(n * n);
  for (let i = 0; i < n; i++) {
    S[i * n + i] = -Infinity;
    for (let j = i + 1; j < n; j++) {
      const s = dot(vectors[i], vectors[j]);
      S[i * n + j] = s;
      S[j * n + i] = s;
    }
  }
  const size = weights.map((w) => Math.max(1e-6, w));
  const alive = new Uint8Array(n).fill(1);
  const members = vectors.map((_, i) => [i]);
  const bestJ = new Int32Array(n).fill(-1);
  const bestS = new Float64Array(n).fill(-Infinity);
  const recompute = (i) => {
    let bj = -1;
    let bs = -Infinity;
    const row = i * n;
    for (let j = 0; j < n; j++) {
      if (j === i || !alive[j]) continue;
      const s = S[row + j];
      if (s > bs) {
        bs = s;
        bj = j;
      }
    }
    bestJ[i] = bj;
    bestS[i] = bs;
  };
  for (let i = 0; i < n; i++) recompute(i);
  for (; ; ) {
    let bi = -1;
    let bs = -Infinity;
    for (let i = 0; i < n; i++) if (alive[i] && bestS[i] > bs) {
      bs = bestS[i];
      bi = i;
    }
    if (bi < 0 || bs < stopSim) break;
    const bj = bestJ[bi];
    if (bj < 0 || !alive[bj]) {
      recompute(bi);
      continue;
    }
    const wi = size[bi];
    const wj = size[bj];
    for (let k = 0; k < n; k++) {
      if (!alive[k] || k === bi || k === bj) continue;
      const v = (wi * S[bi * n + k] + wj * S[bj * n + k]) / (wi + wj);
      S[bi * n + k] = v;
      S[k * n + bi] = v;
    }
    size[bi] = wi + wj;
    alive[bj] = 0;
    members[bi].push(...members[bj]);
    recompute(bi);
    for (let k = 0; k < n; k++) {
      if (!alive[k] || k === bi) continue;
      if (bestJ[k] === bj || bestJ[k] === bi) {
        recompute(k);
        continue;
      }
      const s = S[k * n + bi];
      if (s > bestS[k]) {
        bestS[k] = s;
        bestJ[k] = bi;
      }
    }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (alive[i]) out.push(members[i].sort((a, b) => a - b));
  return out;
}
function diarize(input) {
  const slices = input.slices;
  const n1 = slices.filter((s) => s.emb && s.emb.length).length;
  const n2 = slices.filter((s) => s.emb2 && s.emb2.length).length;
  const clusterModel = n2 > 0 && n2 >= n1 * 0.9 ? "eres2netv2" : "campplus";
  const okVec = (x) => Array.isArray(x) && x.length > 0;
  const v1Of = (v) => [v.vector].filter(okVec);
  const v2Of = (v) => [v.vector2].filter(okVec);
  const s1Of = (v) => (v.samples || []).map((s) => s.vector).filter(okVec);
  const s2Of = (v) => (v.samples || []).map((s) => s.vector2).filter(okVec);
  const withV1 = input.voiceprints.filter((v) => v1Of(v).length > 0);
  const withV2 = input.voiceprints.filter((v) => v2Of(v).length > 0);
  const matchModel = !input.voiceprints.length ? null : n2 > 0 && (withV2.length === input.voiceprints.length || n1 === 0) ? "eres2netv2" : n1 > 0 && withV1.length ? "campplus" : n2 > 0 && withV2.length ? "eres2netv2" : null;
  const clusterOpts = clusterModel === "eres2netv2" ? { ...DEFAULT_DIARIZE_OPTIONS_V2, ...input.optsV2 || {} } : { ...DEFAULT_DIARIZE_OPTIONS, ...input.opts || {} };
  const matchOpts = matchModel === "eres2netv2" ? { ...DEFAULT_DIARIZE_OPTIONS_V2, ...input.optsV2 || {} } : { ...DEFAULT_DIARIZE_OPTIONS, ...input.opts || {} };
  const o = { ...clusterOpts };
  for (const k of MATCH_KEYS) o[k] = matchOpts[k];
  const threshold = matchModel ? MATCH_THRESHOLD_BASE[matchModel] + (input.threshold - SETTINGS_THRESHOLD_DEFAULT) : input.threshold;
  const vps = matchModel === "eres2netv2" ? withV2.map((v) => ({ personId: v.personId, base: v2Of(v).map(unit), extra: s2Of(v).map(unit) })) : withV1.map((v) => ({ personId: v.personId, base: v1Of(v).map(unit), extra: s1Of(v).map(unit) }));
  const pick = (s, m) => m === "eres2netv2" ? s.emb2 : s.emb;
  const units = slices.map((s) => {
    const e = pick(s, clusterModel);
    return e && e.length ? unit(e) : null;
  });
  const matchUnits = matchModel === clusterModel ? units : slices.map((s) => {
    const e = matchModel ? pick(s, matchModel) : null;
    return e && e.length ? unit(e) : null;
  });
  const weightOf = (i) => Math.max(0.1, Math.min(o.maxWeightSec, slices[i].speech || slices[i].end - slices[i].start));
  const durOf = (i) => slices[i].end - slices[i].start;
  const groupOf = new Int32Array(slices.length).fill(-1);
  const groups = [];
  let reliable = slices.map((_, i) => i).filter((i) => units[i] && slices[i].speech >= o.reliableSec);
  if (reliable.length > o.maxClusterItems) {
    reliable = reliable.slice().sort((a, b) => slices[b].speech - slices[a].speech).slice(0, o.maxClusterItems).sort((a, b) => a - b);
  }
  const clusters = agglomerate(reliable.map((i) => units[i]), reliable.map(weightOf), o.clusterSim).map((c) => c.map((k) => reliable[k]));
  for (const c of clusters) {
    const gi = groups.length;
    groups.push({ members: c });
    for (const i of c) groupOf[i] = gi;
  }
  const avgSim = (members, v) => {
    let s = 0;
    let w = 0;
    for (const i of members) {
      const u = matchUnits[i];
      if (!u) continue;
      const wt = weightOf(i);
      s += dot(u, v) * wt;
      w += wt;
    }
    return w > 0 ? s / w : -1;
  };
  const groupSim = (a, b) => {
    const sa = a.filter((i) => units[i]).slice(0, 200);
    const sb = b.filter((i) => units[i]).slice(0, 200);
    let s = 0;
    let w = 0;
    for (const i of sa) for (const j of sb) {
      const wt = weightOf(i) * weightOf(j);
      s += dot(units[i], units[j]) * wt;
      w += wt;
    }
    return w > 0 ? s / w : -1;
  };
  const seconds = (g) => g.members.reduce((s, i) => s + durOf(i), 0);
  const matchWith = (useExtra, only) => {
    const hits = /* @__PURE__ */ new Map();
    for (const g of only) {
      const scores = vps.map((vp) => ({ personId: vp.personId, score: Math.max(...(useExtra ? [...vp.base, ...vp.extra] : vp.base).map((x) => avgSim(g.members, x))) })).filter((x) => Number.isFinite(x.score)).sort((a, b) => b.score - a.score);
      const best = scores[0];
      const second = scores[1]?.score ?? -Infinity;
      if (best && best.score >= threshold && best.score - second >= o.matchMargin) {
        hits.set(g, { personId: best.personId, score: best.score, lead: Number.isFinite(second) ? best.score - second : 0 });
      }
    }
    return hits;
  };
  if (vps.length) {
    const hits = matchWith(false, groups);
    if (vps.some((vp) => vp.extra.length)) {
      for (const [g, h] of matchWith(true, groups.filter((g2) => !hits.has(g2)))) hits.set(g, h);
    }
    const top = /* @__PURE__ */ new Map();
    for (const h of hits.values()) top.set(h.personId, Math.max(top.get(h.personId) ?? -Infinity, h.score));
    for (const [g, h] of hits) {
      if (h.score < top.get(h.personId) - o.duplicateGap && h.score < threshold + o.weakBand && h.lead < o.duplicateKeepMargin) continue;
      g.personId = h.personId;
      g.score = Math.round(h.score * 1e3) / 1e3;
    }
  }
  const totalSec = slices.reduce((s, x) => s + (x.end - x.start), 0);
  const minSpeakerSec = Math.min(o.minSpeakerSec, Math.max(3, totalSec * 5e-3));
  const dead = /* @__PURE__ */ new Set();
  const smallOrder = groups.map((g, gi) => gi).filter((gi) => !groups[gi].personId && seconds(groups[gi]) < minSpeakerSec).sort((a, b) => seconds(groups[a]) - seconds(groups[b]));
  for (const gi of smallOrder) {
    let target = -1;
    let bs = -Infinity;
    groups.forEach((g, gj) => {
      if (gj === gi || dead.has(gj) || seconds(g) <= seconds(groups[gi])) return;
      const s = groupSim(groups[gi].members, g.members);
      if (s > bs) {
        bs = s;
        target = gj;
      }
    });
    if (target >= 0 && bs >= o.tinyMergeSim) {
      for (const i of groups[gi].members) groupOf[i] = target;
      groups[target].members.push(...groups[gi].members);
    } else if (groups.some((g, gj) => gj !== gi && !dead.has(gj) && seconds(g) >= minSpeakerSec)) {
      for (const i of groups[gi].members) groupOf[i] = -1;
    } else continue;
    groups[gi].members = [];
    dead.add(gi);
  }
  const byPerson = /* @__PURE__ */ new Map();
  groups.forEach((g, gi) => {
    if (!g.personId || dead.has(gi)) return;
    const first = byPerson.get(g.personId);
    if (first === void 0) {
      byPerson.set(g.personId, gi);
      return;
    }
    for (const i of g.members) groupOf[i] = first;
    groups[first].members.push(...g.members);
    groups[first].score = Math.max(groups[first].score ?? -1, g.score ?? -1);
    g.members = [];
    dead.add(gi);
  });
  const live = () => groups.map((g, gi) => ({ g, gi })).filter((x) => x.g.members.length && !dead.has(x.gi));
  if (!live().length) {
    groups.push({ members: [] });
  }
  const means = /* @__PURE__ */ new Map();
  const dim = units.find(Boolean)?.length || 192;
  for (const { g, gi } of live()) {
    const sum = new Array(dim).fill(0);
    let w = 0;
    for (const i of g.members) {
      const u = units[i];
      if (!u) continue;
      const wt = weightOf(i);
      for (let k = 0; k < u.length; k++) sum[k] += u[k] * wt;
      w += wt;
    }
    means.set(gi, w > 0 ? unit(sum) : null);
  }
  const neighborGroup = (i) => {
    for (let d = 1; d < slices.length; d++) {
      const p = i - d;
      const q = i + d;
      const gp = p >= 0 ? groupOf[p] : -1;
      const gq = q < slices.length ? groupOf[q] : -1;
      if (gp >= 0 && gq >= 0) {
        const dp = slices[i].start - slices[p].end;
        const dq = slices[q].start - slices[i].end;
        return dp <= dq ? gp : gq;
      }
      if (gp >= 0) return gp;
      if (gq >= 0) return gq;
      if (p < 0 && q >= slices.length) break;
    }
    return -1;
  };
  const pending = slices.map((_, i) => i).filter((i) => groupOf[i] < 0);
  for (const i of pending) {
    const u = units[i];
    const nb = neighborGroup(i);
    let pick2 = nb;
    if (u) {
      let bg = -1;
      let bs = -Infinity;
      for (const [gi, m] of means) {
        if (!m) continue;
        const s = dot(u, m);
        if (s > bs) {
          bs = s;
          bg = gi;
        }
      }
      if (bg >= 0) {
        const nm = nb >= 0 ? means.get(nb) : null;
        const nbScore = nm ? dot(u, nm) : -Infinity;
        pick2 = nb >= 0 && nbScore >= bs - o.neighborSlack ? nb : bg;
      }
    }
    if (pick2 < 0) {
      const l = live();
      pick2 = l.length ? l.sort((a, b) => seconds(b.g) - seconds(a.g))[0].gi : groups.length - 1;
    }
    groupOf[i] = pick2;
  }
  for (const g of groups) g.members = [];
  groupOf.forEach((gi, i) => {
    if (gi >= 0) groups[gi].members.push(i);
  });
  const used = groups.map((g, gi) => gi).filter((gi) => groups[gi].members.length);
  const firstStart = (gi) => Math.min(...groups[gi].members.map((i) => slices[i].start));
  used.sort((a, b) => firstStart(a) - firstStart(b));
  const labelOf = /* @__PURE__ */ new Map();
  used.forEach((gi, k) => labelOf.set(gi, `S${k + 1}`));
  const speakers = used.map((gi) => {
    const g = groups[gi];
    const m = means.get(gi) ?? null;
    let rep = null;
    let repScore = -Infinity;
    for (const i of g.members) {
      const dur = durOf(i);
      const score = (dur >= 5 ? 10 : 0) + (m && units[i] ? dot(units[i], m) : 0) + Math.min(dur, 8) / 100;
      if (score > repScore) {
        repScore = score;
        rep = i;
      }
    }
    const slot = {
      label: labelOf.get(gi),
      seconds: Math.round(seconds(g) * 10) / 10,
      firstStart: firstStart(gi),
      centroid: m,
      repSlice: rep,
      sliceCount: g.members.length
    };
    if (g.personId) {
      slot.personId = g.personId;
      slot.matchedBy = "voiceprint";
      if (g.score !== void 0) slot.score = g.score;
    }
    return slot;
  });
  return { labels: Array.from(groupOf, (gi) => labelOf.get(gi) || "S1"), speakers, model: { cluster: clusterModel, match: matchModel } };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/organize.ts
var import_i18n6 = require("npm:@totalclaw/i18n");

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/matchWords.ts
var DECISION_WORDS = [
  // 用户给的六个词，加上意思同样明确的几个；「安排 / 推进 / 下周」这类太泛，议程介绍里也到处是，不收
  "\u51B3\u5B9A",
  "\u786E\u5B9A",
  "\u8D1F\u8D23",
  "\u622A\u6B62",
  "\u9700\u8981",
  "\u5B8C\u6210",
  "\u540C\u610F",
  "\u901A\u8FC7",
  "\u843D\u5B9E",
  "\u52A1\u5FC5",
  "\u5FC5\u987B",
  "\u7275\u5934",
  "\u5B9A\u4E0B\u6765",
  "\u62CD\u677F"
];
var URGENT_WORDS = ["\u5C3D\u5FEB", "\u9A6C\u4E0A", "\u7ACB\u5373", "\u7ACB\u523B", "\u672C\u5468", "\u8FD9\u5468", "\u7D27\u6025", "\u52A0\u6025", "\u4F18\u5148"];
var TRANSCRIPT_META_LABELS = [
  "\u65F6\u95F4",
  "\u65E5\u671F",
  "\u5730\u70B9",
  "\u4F1A\u8BAE\u5730\u70B9",
  "\u4F1A\u8BAE\u65F6\u95F4",
  "\u4E3B\u9898",
  "\u4F1A\u8BAE\u4E3B\u9898",
  "\u8BAE\u9898",
  "\u6807\u9898",
  "\u4F1A\u8BAE\u540D\u79F0",
  "\u53C2\u4F1A\u4EBA",
  "\u53C2\u4F1A\u4EBA\u5458",
  "\u51FA\u5E2D",
  "\u51FA\u5E2D\u4EBA\u5458",
  "\u5217\u5E2D",
  "\u7F3A\u5E2D",
  "\u8BB0\u5F55\u4EBA",
  "\u8BB0\u5F55",
  "\u6284\u9001",
  "\u5907\u6CE8",
  "\u6CE8\u610F",
  "\u8BF4\u660E",
  "\u9644\u4EF6",
  "\u7ED3\u8BBA",
  "\u6458\u8981",
  "\u603B\u7ED3",
  "\u5F85\u529E",
  "\u51B3\u8BAE",
  "\u8BAE\u7A0B",
  "\u4F1A\u8BAE\u7EAA\u8981",
  "\u7EAA\u8981",
  "\u94FE\u63A5",
  "\u4F1A\u8BAE\u53F7",
  "\u4F1A\u8BAE\u94FE\u63A5",
  "\u5F55\u5236",
  "\u6587\u5B57\u8BB0\u5F55",
  "\u53D1\u8A00\u8BB0\u5F55",
  "\u667A\u80FD\u7EAA\u8981",
  "\u7AE0\u8282",
  "\u5173\u952E\u8BCD",
  "subject",
  "date",
  "time",
  "location",
  "attendees",
  "agenda",
  "note",
  "notes",
  "summary",
  "title",
  "link",
  "url",
  "http",
  "https"
];
var GENERIC_SPEAKER_RE = /^(说话人|发言人|讲话人|参会人|用户|speaker|spk|s)\s*[-_#]?\s*\d+$/i;
var ASR_HALLUCINATIONS = [
  "\u4EE5\u4E0B\u662F\u666E\u901A\u8BDD\u7684",
  "\u8BF7\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\u8F6C\u5199",
  "\u8BF7\u4E0D\u541D\u70B9\u8D5E\u8BA2\u9605",
  "\u70B9\u8D5E\u8BA2\u9605\u8F6C\u53D1",
  "\u6253\u8D4F\u652F\u6301\u660E\u955C",
  "\u660E\u955C\u4E0E\u70B9\u70B9\u680F\u76EE",
  "\u5B57\u5E55\u7531",
  "\u5B57\u5E55\u63D0\u4F9B",
  "\u5B57\u5E55\u5FD7\u613F\u8005",
  "amara.org",
  "\u8C22\u8C22\u89C2\u770B",
  "\u8C22\u8C22\u5927\u5BB6\u89C2\u770B",
  "\u611F\u8C22\u89C2\u770B",
  "\u8BA2\u9605\u6211\u7684\u9891\u9053",
  "\u591A\u8C22\u60A8\u6536\u770B",
  "\u4E0B\u96C6\u518D\u89C1",
  "\u4F18\u4F18\u72EC\u64AD\u5267\u573A",
  "thanksforwatching",
  "thankyouforwatching",
  "pleasesubscribe",
  "likeandsubscribe"
];
var CN_COUNT_UNITS = "\u9879\u4E2A\u6B21\u6761\u540D\u4F4D\u4EBA\u5929\u65E5\u5468\u6708\u5E74\u573A\u5BB6\u90E8\u95E8\u4EFD\u5904%";
var CN_DIGIT = { \u96F6: 0, "\u3007": 0, \u4E00: 1, \u4E8C: 2, \u4E24: 2, \u4E09: 3, \u56DB: 4, \u4E94: 5, \u516D: 6, \u4E03: 7, \u516B: 8, \u4E5D: 9 };
var CN_MAGNITUDE = { \u5341: 10, \u767E: 100, \u5343: 1e3 };
var CN_WAN = "\u4E07";
var CN_DIGITS_ONLY_RE = /^[零〇一二两三四五六七八九]+$/;
function cnNumberWithUnitRe(units) {
  return new RegExp(`(^|[^\u7B2C])([\u96F6\u3007\u4E00\u4E8C\u4E24\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u5341\u767E\u5343\u4E07]+)(?=[${units}])`, "g");
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/prompts.ts
function asrInitialPrompt(lang, names) {
  if (lang && !lang.startsWith("zh")) return names.filter((n) => /[A-Za-z]/.test(n)).slice(0, 20).join(", ");
  const list = names.filter(Boolean).slice(0, 30).join("\u3001");
  return `${list ? `${list}\u3002` : ""}\u4EE5\u4E0B\u662F\u666E\u901A\u8BDD\u7684\u4F1A\u8BAE\u53D1\u8A00\uFF0C\u8BF7\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\u8F6C\u5199\u3002`;
}
var ORGANIZE_GUIDE = [
  "You are organizing the transcript of a project meeting into minutes.",
  "- Group the discussion into topics (\u8BAE\u9898) following the timeline. A topic is a subject the meeting spent time on; 2-8 topics for a typical meeting, fewer for a short one.",
  "- Identify decisions and action items (\u51B3\u8BAE\u4E8B\u9879): things the meeting decided, assigned, or committed to (who does what, by when). Rewrite each as one clear sentence; keep names, departments, dates and numbers exactly as said. Do not invent decisions.",
  "- Write a 3-line summary: each line one sentence, the most important outcomes first."
].join("\n");
function organizePrompt(transcript, attendees, custom) {
  return [
    custom?.trim() || ORGANIZE_GUIDE,
    "",
    "Output: ONLY a JSON object, no markdown, in this exact shape:",
    '{ "topics": [ { "title": <short topic title, \u2264 20 Chinese characters>, "segments": [<segment numbers>] } ],',
    '  "decisions": [ { "text": <one sentence>, "segments": [<segment numbers where it was said>] } ],',
    '  "summary": [ <line 1>, <line 2>, <line 3> ] }',
    "Rules: segment numbers are the #numbers in the transcript; every topic lists the segments that belong to it, in order.",
    "Write titles, decisions and summary in the language of the transcript (Simplified Chinese for Chinese meetings).",
    "Do not write any number, date or name that does not appear in the transcript.",
    "",
    `Attendees: ${attendees || "(unknown)"}`,
    "Transcript (#number [time] speaker: text):",
    transcript
  ].join("\n");
}
var PLAN_GUIDE = [
  "You turn the decisions of a meeting into an execution plan (\u6267\u884C\u65B9\u6848) and a task list.",
  "- Each task has exactly ONE responsible department. If a decision involves several departments, split it into one task per department, each with that department's part of the work.",
  "- title: what to do (\u6267\u884C\u4E8B\u9879), concrete and actionable. standard: the deliverable / acceptance standard (\u4EA4\u4ED8\u6807\u51C6), checkable.",
  "- due: suggested completion date YYYY-MM-DD. If the decision states a date or deadline, use it. Otherwise pick a date 7 to 14 days after today (7 for urgent items).",
  "- summary: a short Markdown overview of the plan (goal, key tasks, timeline), 3-8 lines."
].join("\n");
function planPrompt(i) {
  return [
    i.custom?.trim() || PLAN_GUIDE,
    "",
    "Output: ONLY a JSON object, no markdown fence:",
    '{ "summary": <markdown>, "items": [ { "decision": <decision number>, "dept": <department id from the list>, "title": <string>, "standard": <string>, "due": "YYYY-MM-DD" } ] }',
    "The department MUST be one of the listed ids. Never invent a department.",
    "Write in the language of the decisions (Simplified Chinese for Chinese).",
    "",
    `Today: ${i.today}`,
    `Meeting: ${i.meeting}`,
    "Departments (id: name):",
    i.depts,
    "Decisions (number. text):",
    i.decisions
  ].join("\n");
}
function weeklyNarrativePrompt(facts) {
  return [
    "You write the narrative part of a weekly project progress report (\u8FDB\u5EA6\u6C47\u603B\u62A5\u544A). The numbers and tables are already computed by the system and will be shown separately.",
    "Write two short sections in Simplified Chinese, plain text (no headings, no tables):",
    "PROGRESS: 2-4 sentences on what moved forward this period and what is at risk.",
    "FOCUS: 1-3 sentences on what needs attention next period (overdue items, pending objections).",
    "Only use facts from the material. Do not write any number that is not in the material. Do not judge people.",
    'Output: ONLY a JSON object: { "progress": <string>, "focus": <string> }',
    "",
    "Material (JSON):",
    facts
  ].join("\n");
}
var SUMMARY_GUIDE = [
  "You write the narrative part of a project closing summary report (\u9879\u76EE\u603B\u7ED3\u62A5\u544A). The overview, decision list, task statistics and change/arbitration records are generated by the system and shown separately.",
  "Write in Simplified Chinese, plain text (no headings, no tables):",
  "OVERALL: 2-4 sentences summarizing how the project went.",
  "LESSONS: 2-4 sentences on experience and improvement suggestions, grounded in the material (delays, objections, arbitrations)."
].join("\n");
function summaryNarrativePrompt(facts, custom) {
  return [
    custom?.trim() || SUMMARY_GUIDE,
    "Only use facts from the material. Do not write any number that is not in the material. Do not judge people.",
    'Output: ONLY a JSON object: { "overall": <string>, "lessons": <string> }',
    "",
    "Material (JSON):",
    facts
  ].join("\n");
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/util.ts
function parseLlmJson(raw) {
  if (!raw) return null;
  let s = String(raw).replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(s);
  if (fence) s = fence[1].trim();
  try {
    return JSON.parse(s);
  } catch {
  }
  for (const open of ["{", "["]) {
    const close = open === "{" ? "}" : "]";
    let start = s.indexOf(open);
    while (start >= 0) {
      let depth = 0;
      let inStr = false;
      let esc = false;
      for (let i = start; i < s.length; i++) {
        const c = s[i];
        if (inStr) {
          if (esc) esc = false;
          else if (c === "\\") esc = true;
          else if (c === '"') inStr = false;
          continue;
        }
        if (c === '"') inStr = true;
        else if (c === open) depth++;
        else if (c === close) {
          depth--;
          if (depth === 0) {
            try {
              return JSON.parse(s.slice(start, i + 1));
            } catch {
              break;
            }
          }
        }
      }
      start = s.indexOf(open, start + 1);
    }
  }
  return null;
}
function isDateStr(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
function addDays(date, n) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  const pa = a.split("-").map(Number);
  const pb = b.split("-").map(Number);
  return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 864e5);
}
function localDateStr(ms) {
  const d = new Date(ms);
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function endOfDayMs(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}
function fmtClock(sec) {
  const s = Math.max(0, Math.floor(sec));
  const p = (x) => String(x).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s % 3600 / 60))}:${p(s % 60)}`;
}
function splitSentences(text) {
  const out = [];
  const re = /[^。！？!?；;\n]+[。！？!?；;]*|[。！？!?；;]+/g;
  let m;
  while (m = re.exec(text)) {
    const s = m[0].trim();
    if (s && !/^[。！？!?；;]+$/.test(s)) out.push(s);
  }
  return out;
}
function truncate(s, n) {
  const t = s.trim();
  return t.length > n ? `${t.slice(0, n)}\u2026` : t;
}
function cnToInt(s) {
  if (!s) return null;
  if (CN_DIGITS_ONLY_RE.test(s) && s.length > 1) {
    return Number(Array.from(s, (c) => CN_DIGIT[c]).join(""));
  }
  let total = 0;
  let section = 0;
  let num2 = 0;
  for (const c of s) {
    if (c in CN_DIGIT) num2 = CN_DIGIT[c];
    else if (c in CN_MAGNITUDE) {
      section += (num2 || 1) * CN_MAGNITUDE[c];
      num2 = 0;
    } else if (c === CN_WAN) {
      total += (section + num2) * 1e4;
      section = 0;
      num2 = 0;
    } else return null;
  }
  return total + section + num2;
}
function normNum(s) {
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return String(Math.round(n * 100) / 100);
}
function numberTokens(text) {
  const out = [];
  for (const m of text.matchAll(/\d+(?:\.\d+)?/g)) out.push(normNum(m[0]));
  for (const m of text.matchAll(cnNumberWithUnitRe(CN_COUNT_UNITS))) {
    const v = cnToInt(m[2]);
    if (v !== null) out.push(String(v));
  }
  return out;
}
function guardNumbers(narrative2, allowed) {
  const set = typeof allowed === "string" ? new Set(numberTokens(allowed)) : allowed;
  let dropped = 0;
  const kept = [];
  for (const line of narrative2.split("\n")) {
    const lead = /^\s*(?:[-*+]|\d{1,2}[.)、]|#{1,6})\s+/.exec(line)?.[0] || "";
    const sents = splitSentences(line.slice(lead.length));
    if (!sents.length) {
      kept.push(line);
      continue;
    }
    const ok = sents.filter((s) => {
      const bad = numberTokens(s).some((n) => !set.has(n));
      if (bad) dropped++;
      return !bad;
    });
    if (ok.length) kept.push(lead + joinSentences(ok));
  }
  return { text: kept.join("\n").replace(/\n{3,}/g, "\n\n").trim(), dropped };
}
function joinSentences(sents) {
  let out = "";
  for (const s of sents) {
    if (out && /[.!?;,]$/.test(out) && /^[A-Za-z0-9]/.test(s)) out += " ";
    out += s;
  }
  return out;
}
function randomId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/organize.ts
function transcriptForLlm(segments, names, budget = 6e4) {
  const lines = segments.map((s, k) => ({ head: `#${k + 1} [${fmtClock(s.start)}] ${names[s.speakerLabel] || s.speakerLabel}: `, text: s.text.replace(/\s+/g, " ") }));
  const total = lines.reduce((a, l) => a + l.head.length + l.text.length + 1, 0);
  if (total <= budget) return lines.map((l) => l.head + l.text).join("\n");
  const heads = lines.reduce((a, l) => a + l.head.length + 2, 0);
  const ratio = Math.max(0.05, (budget - heads) / Math.max(1, total - heads));
  return lines.map((l) => l.head + truncate(l.text, Math.max(40, Math.floor(l.text.length * ratio)))).join("\n");
}
function fallbackTopics(segments) {
  if (!segments.length) return [];
  const duration = segments[segments.length - 1].end - segments[0].start;
  const blocks = [];
  if (duration <= 15 * 60) blocks.push(segments);
  else {
    const target = 10 * 60;
    let cur = [];
    let blockStart = segments[0].start;
    for (let k = 0; k < segments.length; k++) {
      const s = segments[k];
      cur.push(s);
      const next = segments[k + 1];
      if (!next) break;
      const elapsed = next.start - blockStart;
      const gap = next.start - s.end;
      if (elapsed >= target && gap >= 3 || elapsed >= target * 1.5) {
        blocks.push(cur);
        cur = [];
        blockStart = next.start;
      }
    }
    if (cur.length) blocks.push(cur);
  }
  return blocks.map((b, k) => ({ id: `tp_${k + 1}`, title: topicTitle(b, k), segmentIds: b.map((s) => s.id) }));
}
function topicTitle(block, k) {
  for (const s of block) {
    const sent = splitSentences(s.text).find((x) => x.replace(/[，,。.!！?？\s]/g, "").length >= 6);
    if (sent) return truncate(sent.replace(/[。！？!?；;]+$/, ""), 18);
  }
  return (0, import_i18n6.t)("\u8BAE\u9898 {p0}", { p0: k + 1 });
}
function fallbackDecisions(segments, max = 15) {
  const found = [];
  const seen = /* @__PURE__ */ new Set();
  let order = 0;
  for (const s of segments) {
    for (const sent of splitSentences(s.text)) {
      const t = sent.trim();
      const plain = t.replace(/[，,。.!！?？；;\s]/g, "");
      if (plain.length < 8 || plain.length > 120) continue;
      if (/[?？]$/.test(t) || /[吗呢吧]$/.test(plain)) continue;
      const score = DECISION_WORDS.filter((w) => t.includes(w)).length;
      if (!score) continue;
      if (seen.has(plain)) continue;
      seen.add(plain);
      found.push({ text: t, segId: s.id, score, order: order++ });
    }
  }
  const picked = found.length > max ? found.slice().sort((a, b) => b.score - a.score || a.order - b.order).slice(0, max).sort((a, b) => a.order - b.order) : found;
  return picked.map((d, k) => ({ id: `dc_${k + 1}`, text: d.text, segmentIds: [d.segId] }));
}
function fallbackSummary(topics, segments, decisions) {
  const byId = new Map(segments.map((s) => [s.id, s]));
  const lines = [];
  for (const tp of topics) {
    const first = tp.segmentIds.map((id) => byId.get(id)).find((s) => s && splitSentences(s.text).some((x) => x.length >= 6));
    const sent = first ? splitSentences(first.text).find((x) => x.length >= 6) : void 0;
    if (sent) lines.push(truncate(sent, 60));
    if (lines.length >= 3) break;
  }
  for (const d of decisions) {
    if (lines.length >= 3) break;
    if (!lines.includes(d.text)) lines.push(truncate(d.text, 60));
  }
  return [...new Set(lines)].slice(0, 3);
}
function segRefs(v, segments) {
  if (!Array.isArray(v)) return [];
  const ids = [];
  for (const x of v) {
    const n = typeof x === "number" ? x : typeof x === "string" ? Number(x.replace(/^#/, "")) : NaN;
    if (Number.isInteger(n) && n >= 1 && n <= segments.length) ids.push(segments[n - 1].id);
  }
  return [...new Set(ids)];
}
function bestSegmentFor(text, segments) {
  const chars = new Set(text.replace(/[\s，,。.!！?？]/g, ""));
  let best = null;
  let bs = 0;
  for (const s of segments) {
    let hit = 0;
    for (const c of new Set(s.text)) if (chars.has(c)) hit++;
    const score = hit / Math.max(1, chars.size);
    if (score > bs) {
      bs = score;
      best = s;
    }
  }
  return best && bs >= 0.4 ? [best.id] : [];
}
function validateOrganize(raw, segments) {
  if (!raw || typeof raw !== "object") return null;
  const allText = segments.map((s) => s.text).join("\n");
  const allowed = new Set(numberTokens(allText));
  let dropped = 0;
  const claimed = /* @__PURE__ */ new Set();
  const topics = [];
  for (const t of Array.isArray(raw.topics) ? raw.topics : []) {
    const title = typeof t?.title === "string" ? truncate(t.title.replace(/\s+/g, " "), 30) : "";
    const ids = segRefs(t?.segments, segments).filter((id) => !claimed.has(id));
    if (!title || !ids.length) {
      dropped++;
      continue;
    }
    ids.forEach((id) => claimed.add(id));
    topics.push({ id: "", title, segmentIds: ids });
  }
  const decisions = [];
  const seen = /* @__PURE__ */ new Set();
  for (const d of Array.isArray(raw.decisions) ? raw.decisions : []) {
    const text = typeof d === "string" ? d.trim() : typeof d?.text === "string" ? d.text.trim() : "";
    if (text.length < 4 || text.length > 300 || seen.has(text)) {
      dropped++;
      continue;
    }
    if (numberTokens(text).some((n) => !allowed.has(n))) {
      dropped++;
      continue;
    }
    seen.add(text);
    const ids = segRefs(d?.segments, segments);
    decisions.push({ id: "", text, segmentIds: ids.length ? ids : bestSegmentFor(text, segments) });
    if (decisions.length >= 30) break;
  }
  const summary = [];
  for (const line of Array.isArray(raw.summary) ? raw.summary : typeof raw.summary === "string" ? raw.summary.split("\n") : []) {
    if (typeof line !== "string") continue;
    const l = line.replace(/^\s*(?:[-*•]|\d[.)、])\s*/, "").trim();
    if (!l) continue;
    const g = guardNumbers(l, allowed);
    if (!g.text) {
      dropped++;
      continue;
    }
    summary.push(truncate(g.text, 80));
    if (summary.length >= 3) break;
  }
  if (!topics.length && !decisions.length && !summary.length) return null;
  return { topics, decisions, summary, dropped };
}
function assignLeftovers(topics, segments) {
  const owner = /* @__PURE__ */ new Map();
  topics.forEach((t, k) => t.segmentIds.forEach((id) => owner.set(id, k)));
  let prev = -1;
  const order = segments.map((s) => s.id);
  const firstOwned = order.find((id) => owner.has(id));
  const firstTopic = firstOwned !== void 0 ? owner.get(firstOwned) : 0;
  for (const id of order) {
    const k = owner.get(id);
    if (k !== void 0) {
      prev = k;
      continue;
    }
    const target = prev >= 0 ? prev : firstTopic;
    topics[target].segmentIds.push(id);
    owner.set(id, target);
  }
  const pos = new Map(order.map((id, i) => [id, i]));
  for (const t of topics) t.segmentIds.sort((a, b) => pos.get(a) - pos.get(b));
  return topics.sort((a, b) => pos.get(a.segmentIds[0]) - pos.get(b.segmentIds[0]));
}
async function organizeMinutes(i) {
  const segments = i.segments;
  if (!segments.length) return { segments, topics: [], decisions: [], summaryLines: [], source: "rules" };
  let parsed = null;
  let note;
  try {
    const raw = await i.llm(organizePrompt(transcriptForLlm(segments, i.speakerNames), i.attendeeNames.join("\u3001"), i.prompt), { json: true, timeoutMs: i.timeoutMs ?? 18e4 });
    if (raw === null) note = (0, import_i18n6.t)("\u6A21\u578B\u4E0D\u53EF\u7528\uFF0C\u5DF2\u6309\u89C4\u5219\u6574\u7406");
    else {
      parsed = validateOrganize(parseLlmJson(raw), segments);
      if (!parsed) note = (0, import_i18n6.t)("\u6A21\u578B\u8FD4\u56DE\u7684\u683C\u5F0F\u4E0D\u5BF9\uFF0C\u5DF2\u6309\u89C4\u5219\u6574\u7406");
    }
  } catch {
    note = (0, import_i18n6.t)("\u6A21\u578B\u8C03\u7528\u5931\u8D25\uFF0C\u5DF2\u6309\u89C4\u5219\u6574\u7406");
  }
  let topics;
  let decisions;
  let summaryLines;
  let source = "llm";
  if (parsed) {
    topics = parsed.topics.length ? assignLeftovers(parsed.topics, segments) : fallbackTopics(segments);
    decisions = parsed.decisions;
    summaryLines = parsed.summary;
    if (summaryLines.length < 3) {
      for (const l of fallbackSummary(topics, segments, decisions)) {
        if (summaryLines.length >= 3) break;
        if (!summaryLines.includes(l)) summaryLines.push(l);
      }
    }
  } else {
    source = "rules";
    topics = fallbackTopics(segments);
    decisions = fallbackDecisions(segments);
    summaryLines = fallbackSummary(topics, segments, decisions);
  }
  topics = topics.map((t, k) => ({ ...t, id: `tp_${k + 1}` }));
  decisions = decisions.map((d, k) => ({ ...d, id: `dc_${k + 1}` }));
  const topicOf = /* @__PURE__ */ new Map();
  topics.forEach((t) => t.segmentIds.forEach((id) => topicOf.set(id, t.id)));
  return {
    segments: segments.map((s) => ({ ...s, topicId: topicOf.get(s.id) })),
    topics,
    decisions,
    summaryLines,
    source,
    note
  };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/transcriptParse.ts
var import_fs2 = require("fs");
var import_path2 = require("path");
function parseClock(s) {
  const m = /^\s*(?:(\d{1,3}):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?\s*$/.exec(s);
  if (!m) return null;
  const h = m[1] ? Number(m[1]) : 0;
  const mi = Number(m[2]);
  const se = Number(m[3]);
  if (mi >= 60 && m[1]) return null;
  if (se >= 60) return null;
  const frac = m[4] ? Number(`0.${m[4]}`) : 0;
  return h * 3600 + mi * 60 + se + frac;
}
var CLOCK = String.raw`(?<![\d:])\d{1,3}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?(?![\d:])`;
var NAME = String.raw`[^\s:：\[\]【】()（）<>"“”'‘’，,。.!！?？;；|]{1,20}(?:\s[^\s:：\[\]【】()（）<>"“”'‘’，,。.!！?？;；|]{1,20}){0,2}`;
var RE_TIME_NAME_TEXT = new RegExp(String.raw`^[\[【(（]?(${CLOCK})[\]】)）]?\s*(${NAME})\s*[:：]\s*(.*)$`);
var RE_NAME_TIME_TEXT = new RegExp(String.raw`^(${NAME})\s*[\[【(（]?(${CLOCK})[\]】)）]?\s*[:：]\s*(.*)$`);
var RE_NAME_TEXT = new RegExp(String.raw`^(${NAME})\s*[:：]\s*(.+)$`);
var RE_NAME_TIME_HEADER = new RegExp(String.raw`^(${NAME})\s*[\[【(（]?(${CLOCK})[\]】)）]?\s*$`);
var RE_TIME_HEADER_NAME = new RegExp(String.raw`^[\[【(（]?(${CLOCK})[\]】)）]?\s+(${NAME})\s*$`);
var RE_TIME_TEXT = new RegExp(String.raw`^[\[【(（]?(${CLOCK})[\]】)）]?\s+(.+)$`);
var RE_BRACKET_NAME_TEXT = new RegExp(String.raw`^[\[【](${NAME})[\]】]\s*(.+)$`);
function stripMarkdown(line) {
  return line.replace(/^\s{0,3}#{1,6}\s+/, "").replace(/^\s*>\s?/, "").replace(/^\s*(?:[-*+]|\d{1,3}[.)、])\s+/, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1").trim();
}
function isMetaLabel(name) {
  const n = name.trim().toLowerCase();
  return TRANSCRIPT_META_LABELS.some((m) => n === m || n.startsWith(m)) || /^\d+$/.test(n);
}
function plausibleName(name) {
  const n = name.trim();
  if (!n || n.length > 24) return false;
  if (/^\d/.test(n) && !GENERIC_SPEAKER_RE.test(n)) return false;
  if (/https?|www\./i.test(n)) return false;
  return true;
}
function parseLine(raw) {
  const line = stripMarkdown(raw);
  if (!line) return null;
  let m;
  if ((m = RE_NAME_TIME_HEADER.exec(line)) && plausibleName(m[1])) return { speaker: m[1].trim(), time: parseClock(m[2]) ?? void 0, text: "" };
  if ((m = RE_TIME_HEADER_NAME.exec(line)) && plausibleName(m[2]) && !/\s/.test(m[2].trim())) return { speaker: m[2].trim(), time: parseClock(m[1]) ?? void 0, text: "" };
  if ((m = RE_TIME_NAME_TEXT.exec(line)) && plausibleName(m[2])) return { time: parseClock(m[1]) ?? void 0, speaker: m[2].trim(), text: m[3].trim() };
  if ((m = RE_NAME_TIME_TEXT.exec(line)) && plausibleName(m[1])) return { speaker: m[1].trim(), time: parseClock(m[2]) ?? void 0, text: m[3].trim() };
  if ((m = RE_NAME_TEXT.exec(line)) && plausibleName(m[1])) return { speaker: m[1].trim(), text: m[2].trim() };
  if ((m = RE_BRACKET_NAME_TEXT.exec(line)) && plausibleName(m[1])) return { speaker: m[1].trim(), text: m[2].trim() };
  if (m = RE_TIME_TEXT.exec(line)) return { time: parseClock(m[1]) ?? void 0, text: m[2].trim() };
  return { text: line };
}
function matchNickname(label, attendees) {
  const clean = (s) => s.toLowerCase().replace(/[（(\[【][^）)\]】]*[）)\]】]/g, "").replace(/[\s·・._\-—]/g, "");
  const l = clean(label);
  if (!l || GENERIC_SPEAKER_RE.test(label.trim())) return null;
  const exact = attendees.filter((p) => clean(p.name) === l || p.wecomUserId && p.wecomUserId.toLowerCase() === label.trim().toLowerCase() || p.id.toLowerCase() === label.trim().toLowerCase());
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return null;
  const contains = attendees.filter((p) => {
    const n = clean(p.name);
    return n.length >= 2 && (l.includes(n) || l.length >= 2 && n.includes(l));
  });
  if (contains.length === 1) return contains[0];
  if (contains.length > 1) {
    const maxLen = Math.max(...contains.map((p) => clean(p.name).length));
    const longest = contains.filter((p) => clean(p.name).length === maxLen && l.includes(clean(p.name)));
    if (longest.length === 1) return longest[0];
  }
  return null;
}
function parseCues(text) {
  const out = [];
  const blocks = text.replace(/\r\n?/g, "\n").split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const ti = lines.findIndex((l) => l.includes("-->"));
    if (ti < 0) continue;
    const [a, b] = lines[ti].split("-->");
    const start = parseClock((a || "").trim());
    const end = parseClock((b || "").trim().split(/\s+/)[0] || "");
    let body = lines.slice(ti + 1).join("\n");
    let speaker;
    const v = /<v(?:\.[^\s>]+)?\s+([^>]+)>/.exec(body);
    if (v) speaker = v[1].trim();
    body = body.replace(/<[^>]+>/g, "").replace(/\{\\[^}]*\}/g, "").trim();
    if (!speaker) {
      const m = /^([^\s:：]{1,20}(?:\s[^\s:：]{1,20}){0,2})\s*[:：]\s*(.+)$/s.exec(body);
      if (m && plausibleName(m[1]) && !isMetaLabel(m[1])) {
        speaker = m[1].trim();
        body = m[2].trim();
      }
    }
    if (!body) continue;
    out.push({ speaker, time: start ?? void 0, end: end ?? void 0, text: body.replace(/\s*\n\s*/g, " ") });
  }
  return out;
}
function parsePlain(text) {
  const out = [];
  let blank = true;
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (!raw.trim()) {
      blank = true;
      continue;
    }
    if (/^\s*(?:[-*_=]){3,}\s*$/.test(raw)) {
      blank = true;
      continue;
    }
    const e = parseLine(raw);
    if (!e) continue;
    if (blank) e.para = true;
    blank = false;
    out.push(e);
  }
  return out;
}
var TEXT_KEYS = ["text", "content", "sentence", "transcript", "onebest", "value", "words", "msg", "message"];
var SPEAKER_KEYS = ["speaker", "speaker_name", "speakerName", "name", "nickname", "nickName", "userName", "user_name", "user", "role", "spk", "speaker_id", "speakerId"];
var START_KEYS = ["start", "begin", "start_time", "startTime", "bg", "st", "from", "offset", "begin_time", "beginTime", "timestamp"];
var END_KEYS = ["end", "end_time", "endTime", "ed", "to", "finish"];
function findRecords(v, depth = 0) {
  if (depth > 5 || !v) return null;
  if (Array.isArray(v)) {
    const objs = v.filter((x) => x && typeof x === "object" && !Array.isArray(x));
    if (objs.length && objs.some((o) => TEXT_KEYS.some((k) => typeof o[k] === "string"))) return objs;
    for (const x of v) {
      const r = findRecords(x, depth + 1);
      if (r) return r;
    }
    return null;
  }
  if (typeof v === "object") {
    const obj2 = v;
    for (const k of ["segments", "sentences", "paragraphs", "utterances", "results", "transcripts", "transcript", "data", "list", "items", "records"]) {
      const r = findRecords(obj2[k], depth + 1);
      if (r) return r;
    }
    for (const k of Object.keys(obj2)) {
      const r = findRecords(obj2[k], depth + 1);
      if (r) return r;
    }
  }
  return null;
}
function parseJson(text) {
  let data;
  try {
    data = JSON.parse(text.replace(/^﻿/, ""));
  } catch {
    return parsePlain(text);
  }
  const recs = findRecords(data);
  if (!recs) return [];
  const pick = (o, keys) => {
    for (const k of keys) if (o[k] !== void 0 && o[k] !== null && o[k] !== "") return o[k];
    return void 0;
  };
  const raw = recs.map((o) => {
    const t = pick(o, TEXT_KEYS);
    const sp = pick(o, SPEAKER_KEYS);
    return {
      text: typeof t === "string" ? t.trim() : "",
      speaker: typeof sp === "number" ? `S${sp + 1}` : typeof sp === "string" ? sp.trim() : void 0,
      start: pick(o, START_KEYS),
      end: pick(o, END_KEYS)
    };
  }).filter((r) => r.text);
  const num2 = (x) => {
    if (typeof x === "number" && Number.isFinite(x)) return x;
    if (typeof x === "string") {
      const c = parseClock(x);
      if (c !== null) return c;
      const n = Number(x);
      if (Number.isFinite(n)) return n;
    }
    return void 0;
  };
  const starts = raw.map((r) => num2(r.start)).filter((x) => x !== void 0);
  const ms = starts.some((x) => x > 36e3);
  const conv = (x) => {
    const n = num2(x);
    return n === void 0 ? void 0 : ms && typeof x !== "string" ? n / 1e3 : n;
  };
  return raw.map((r) => ({ text: r.text, speaker: r.speaker, time: conv(r.start), end: conv(r.end) }));
}
function estimateSeconds(text) {
  const cjk = (text.match(/[㐀-鿿]/g) || []).length;
  const words = (text.replace(/[㐀-鿿]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, cjk / 4.5 + words / 2.5);
}
function buildFromEntries(entries, o) {
  const counts = /* @__PURE__ */ new Map();
  for (const e of entries) if (e.speaker) counts.set(e.speaker, (counts.get(e.speaker) || 0) + 1);
  const accepted = /* @__PURE__ */ new Set();
  for (const [name, c] of counts) {
    if (isMetaLabel(name)) continue;
    if (matchNickname(name, o.attendees) || c >= 2 || GENERIC_SPEAKER_RE.test(name)) accepted.add(name);
  }
  const labeled = entries.some((e) => e.speaker && accepted.has(e.speaker));
  const items = entries.map((e) => e.speaker && !accepted.has(e.speaker) ? { ...e, speaker: void 0, text: e.text ? `${e.speaker}\uFF1A${e.text}` : e.speaker } : e);
  const drafts = [];
  for (const e of items) {
    if (labeled) {
      if (e.speaker) {
        drafts.push({ speaker: e.speaker, start: e.time, end: e.end, texts: e.text ? [e.text] : [], timed: e.time !== void 0 });
        continue;
      }
      const last2 = drafts[drafts.length - 1];
      if (!last2) {
        continue;
      }
      if (e.text) last2.texts.push(e.text);
      if (e.end !== void 0) last2.end = e.end;
      continue;
    }
    const last = drafts[drafts.length - 1];
    if (last && !e.para && e.time === void 0 && last.texts.join("").length < 600) {
      last.texts.push(e.text);
      continue;
    }
    drafts.push({ speaker: "S1", start: e.time, end: e.end, texts: [e.text], timed: e.time !== void 0 });
  }
  const filled = drafts.filter((d) => d.texts.join("").trim());
  if (!filled.length) return { segments: [], speakers: [] };
  let cursor = 0;
  for (let k = 0; k < filled.length; k++) {
    const d = filled[k];
    const est = estimateSeconds(d.texts.join(""));
    if (d.start === void 0 || d.start < cursor - 1) d.start = cursor;
    if (d.end === void 0 || d.end <= d.start) {
      const next = filled.slice(k + 1).find((x) => x.start !== void 0 && x.start > d.start);
      d.end = next ? Math.min(next.start, d.start + est) : d.start + est;
      if (d.end <= d.start) d.end = d.start + est;
    }
    cursor = d.end;
  }
  const maxSec = o.maxMergeSec ?? 120;
  const maxChars = o.maxMergeChars ?? 600;
  const merged = [];
  for (const d of filled) {
    const last = merged[merged.length - 1];
    const lastText = last ? last.texts.join(labeled ? "" : "\n") : "";
    const gapOk = !last || labeled || !!d.timed && !!last.timed && d.start - last.end < 1.5;
    if (last && last.speaker === d.speaker && gapOk && d.end - last.start <= maxSec && lastText.length + d.texts.join("").length <= maxChars) {
      last.texts.push(...d.texts);
      last.end = d.end;
      continue;
    }
    merged.push({ ...d, texts: [...d.texts] });
  }
  const segments = merged.map((d, k) => ({
    id: `seg_${k + 1}`,
    start: Math.round(d.start * 100) / 100,
    end: Math.round(d.end * 100) / 100,
    speakerLabel: d.speaker,
    text: joinTexts(d.texts)
  }));
  const order = [];
  for (const s of segments) if (!order.includes(s.speakerLabel)) order.push(s.speakerLabel);
  const speakers = order.map((label) => {
    const p = label === "S1" && !labeled ? null : matchNickname(label, o.attendees);
    return p ? { label, personId: p.id, matchedBy: "nickname" } : { label };
  });
  return { segments, speakers, durationSec: Math.round(Math.max(...segments.map((s) => s.end))) };
}
function joinTexts(parts) {
  let out = "";
  for (const raw of parts) {
    const t = raw.trim();
    if (!t) continue;
    if (out && /[A-Za-z0-9.,!?;:]$/.test(out) && /^[A-Za-z0-9]/.test(t)) out += " ";
    out += t;
  }
  return out;
}
async function parseTranscriptFile(path, name, o) {
  const ext = (0, import_path2.extname)(name || path).toLowerCase();
  let text;
  if (ext === ".docx" || ext === ".doc") {
    const { extractDocument } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/documentExtractor.ts")));
    const doc = await extractDocument(path, name);
    text = doc.text || "";
  } else {
    text = decodeText((0, import_fs2.readFileSync)(path));
  }
  return parseTranscriptText(text, ext, o);
}
function parseTranscriptText(text, ext, o = { attendees: [] }) {
  const e = ext.toLowerCase();
  const body = text.replace(/^﻿/, "");
  let entries;
  if (e === ".srt" || e === ".vtt" || /^WEBVTT/.test(body) || /\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}\s*-->/.test(body)) entries = parseCues(body);
  else if (e === ".json" || /^\s*[[{]/.test(body)) entries = parseJson(body);
  else entries = parsePlain(body);
  return buildFromEntries(entries, o);
}
function decodeText(buf) {
  if (buf[0] === 255 && buf[1] === 254) return buf.subarray(2).toString("utf16le");
  if (buf[0] === 254 && buf[1] === 255) {
    const swapped = Buffer.from(buf.subarray(2));
    swapped.swap16();
    return swapped.toString("utf16le");
  }
  const utf8 = buf.toString("utf8");
  const bad = (utf8.match(/�/g) || []).length;
  if (bad > 3 && bad > utf8.length * 0.01) {
    try {
      return new TextDecoder("gb18030").decode(buf);
    } catch {
    }
  }
  return utf8.replace(/^﻿/, "");
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/voiceprint.ts
var import_fs3 = require("fs");
var import_os2 = require("os");
var import_path3 = require("path");
var import_i18n7 = require("npm:@totalclaw/i18n");
init_runtime();
var AUDIO_FILE = "audio16k.wav";
var CLIP_DIR = "clips";
var ENROLL_MIN_SEC = 8;
var ENROLL_MAX_SEC = 20;
var ENROLL_MIN_SPEECH_SEC = 5;
var ENROLL_MIN_SNR_DB = 12;
var ENROLL_MIN_LEVEL_DB = -45;
var ENROLL_MIN_HALF_SIM = 0.3;
function workerSpecFor(rt, opts) {
  return {
    python: rt.python || "",
    pluginsDir: rt.pluginsDir,
    model: opts.asr ? opts.model ?? rt.whisperModel ?? "" : "",
    modelsDir: rt.whisperModelsDir,
    campp: rt.campp || "",
    campp2: rt.campp2 || "",
    threads: opts.threads ?? autoParallelism(opts.asr ? rt.whisperModel : null).threads,
    env: rt.env
  };
}
function percentile(values, p) {
  const a = Array.from(values).sort((x, y) => x - y);
  if (!a.length) return -100;
  return a[Math.min(a.length - 1, Math.max(0, Math.round((a.length - 1) * p)))];
}
async function enrollVoiceprint(audioPath) {
  if (!audioPath || !(0, import_fs3.existsSync)(audioPath)) return { ok: false, reason: (0, import_i18n7.t)("\u5F55\u97F3\u6587\u4EF6\u4E0D\u5B58\u5728\uFF0C\u8BF7\u91CD\u65B0\u5F55\u5236") };
  let rt;
  try {
    rt = await resolveMeetingRuntime();
  } catch {
    return { ok: false, reason: (0, import_i18n7.t)("\u672C\u673A\u8BED\u97F3\u7EC4\u4EF6\u4E0D\u53EF\u7528") };
  }
  if (!rt.campp && !rt.campp2) return { ok: false, reason: (0, import_i18n7.t)("\u8BF7\u5148\u4E0B\u8F7D\u58F0\u7EB9\u8BC6\u522B\u6A21\u578B\uFF08\u8BBE\u7F6E \u2192 \u8BED\u97F3\uFF09\uFF0C\u518D\u91C7\u96C6\u58F0\u7EB9") };
  if (!rt.ffmpeg) return { ok: false, reason: (0, import_i18n7.t)("\u627E\u4E0D\u5230 ffmpeg\uFF0C\u65E0\u6CD5\u5904\u7406\u5F55\u97F3") };
  if (!rt.python) return { ok: false, reason: (0, import_i18n7.t)("\u627E\u4E0D\u5230\u672C\u5730\u8BED\u97F3\u8BC6\u522B\u8FD0\u884C\u65F6") };
  const dir = (0, import_fs3.mkdtempSync)((0, import_path3.join)((0, import_os2.tmpdir)(), "tc-mm-enroll-"));
  try {
    const wav = (0, import_path3.join)(dir, "in.wav");
    try {
      await convertToWav16k(rt.ffmpeg, audioPath, wav, (0, import_i18n7.t)("\u5F55\u97F3"));
    } catch (e) {
      return { ok: false, reason: String(e?.message || (0, import_i18n7.t)("\u5F55\u97F3\u89E3\u7801\u5931\u8D25\uFF0C\u8BF7\u91CD\u65B0\u5F55\u5236")) };
    }
    const info = readWavInfo(wav);
    const seconds = Math.round(info.duration * 10) / 10;
    if (seconds < ENROLL_MIN_SEC) return { ok: false, reason: (0, import_i18n7.t)("\u5F55\u97F3\u592A\u77ED\uFF08{p0} \u79D2\uFF09\uFF0C\u8BF7\u8FDE\u7EED\u8BF4 10~15 \u79D2", { p0: seconds }) };
    if (seconds > ENROLL_MAX_SEC) return { ok: false, reason: (0, import_i18n7.t)("\u5F55\u97F3\u592A\u957F\uFF08{p0} \u79D2\uFF09\uFF0C\u8BF7\u5F55 10~15 \u79D2", { p0: seconds }) };
    const pcm = readPcmRange(wav, info, 0, info.duration);
    let clipped = 0;
    for (let i = 0; i < pcm.length; i++) if (Math.abs(pcm[i]) >= 32700) clipped++;
    const db = pcmFrameDb(pcm);
    const thr = adaptiveThreshold(db);
    const mask = speechMask(db, thr);
    const speechDb = [];
    for (let i = 0; i < db.length; i++) if (mask[i]) speechDb.push(db[i]);
    const speechSec = speechDb.length * 0.01;
    const floor = percentile(db, 0.1);
    const level = speechDb.length ? percentile(speechDb, 0.9) : -100;
    if (level < ENROLL_MIN_LEVEL_DB) return { ok: false, reason: (0, import_i18n7.t)("\u58F0\u97F3\u592A\u5C0F\uFF0C\u6CA1\u6709\u68C0\u6D4B\u5230\u4EBA\u58F0\uFF0C\u8BF7\u9760\u8FD1\u9EA6\u514B\u98CE\u91CD\u5F55") };
    if (speechSec < ENROLL_MIN_SPEECH_SEC) return { ok: false, reason: (0, import_i18n7.t)("\u6CA1\u6709\u68C0\u6D4B\u5230\u8DB3\u591F\u7684\u4EBA\u58F0\uFF08\u53EA\u6709 {p0} \u79D2\uFF09\uFF0C\u8BF7\u8FDE\u7EED\u8BF4 10~15 \u79D2", { p0: Math.round(speechSec * 10) / 10 }) };
    if (level - floor < ENROLL_MIN_SNR_DB) return { ok: false, reason: (0, import_i18n7.t)("\u80CC\u666F\u566A\u97F3\u592A\u5927\uFF0C\u8BF7\u6362\u4E2A\u5B89\u9759\u7684\u5730\u65B9\u91CD\u5F55") };
    if (clipped > pcm.length * 5e-3) return { ok: false, reason: (0, import_i18n7.t)("\u58F0\u97F3\u8FC7\u5927\u5931\u771F\uFF0C\u8BF7\u79BB\u9EA6\u514B\u98CE\u7A0D\u8FDC\u4E00\u70B9\u91CD\u5F55") };
    const hop = SAMPLE_RATE / 100;
    const parts = [];
    for (let i = 0; i < mask.length; i++) if (mask[i]) for (let k = 0; k < hop; k++) parts.push(pcm[i * hop + k] ?? 0);
    const speechPcm = Int16Array.from(parts);
    const speechWav = (0, import_path3.join)(dir, "speech.wav");
    writeWav16k(speechWav, speechPcm);
    const dur = speechPcm.length / SAMPLE_RATE;
    const half = dur / 2;
    const ranges = [{ start: 0, end: dur }, ...dur >= 6 ? [{ start: 0, end: half }, { start: half, end: dur }] : []];
    let outs;
    try {
      outs = await runSlices(workerSpecFor(rt, { asr: false, threads: 2 }), speechWav, ranges, { workers: 1, asr: false, emb: true, createWorker: pipelineConfig().createWorker });
    } catch {
      return { ok: false, reason: (0, import_i18n7.t)("\u58F0\u7EB9\u63D0\u53D6\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5") };
    }
    const vec = outs[0]?.emb;
    const vec2 = outs[0]?.emb2;
    const okLen = (v) => !!v && v.length === 192;
    if (!okLen(vec) && !okLen(vec2)) return { ok: false, reason: (0, import_i18n7.t)("\u58F0\u7EB9\u63D0\u53D6\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5") };
    const halfA = okLen(vec) ? outs[1]?.emb : outs[1]?.emb2;
    const halfB = okLen(vec) ? outs[2]?.emb : outs[2]?.emb2;
    if (outs.length === 3 && halfA && halfB && cosineSim(halfA, halfB) < ENROLL_MIN_HALF_SIM) {
      return { ok: false, reason: (0, import_i18n7.t)("\u5F55\u97F3\u91CC\u50CF\u662F\u6709\u4E0D\u6B62\u4E00\u4E2A\u4EBA\u5728\u8BF4\u8BDD\u6216\u566A\u58F0\u5F88\u5927\uFF0C\u8BF7\u5355\u72EC\u5F55\u672C\u4EBA\u7684\u58F0\u97F3") };
    }
    const unitOf = (v) => {
      const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
      return v.map((x) => x / (n || 1));
    };
    return { ok: true, vector: okLen(vec) ? unitOf(vec) : [], ...okLen(vec2) ? { vector2: unitOf(vec2) } : {}, seconds };
  } finally {
    try {
      (0, import_fs3.rmSync)(dir, { recursive: true, force: true });
    } catch {
    }
  }
}
function cutClip(wavPath, ranges, outPath, minSec = 5, maxSec = 8) {
  const info = readWavInfo(wavPath);
  const valid = ranges.map((r) => ({ start: Math.max(0, r.start), end: Math.min(info.duration, r.end) })).filter((r) => r.end - r.start > 0.2);
  if (!valid.length) return false;
  const byLen = valid.slice().sort((a, b) => b.end - b.start - (a.end - a.start));
  const longest = byLen[0];
  const len = longest.end - longest.start;
  let pcm;
  if (len >= maxSec) {
    const seg = readPcmRange(wavPath, info, longest.start, longest.end);
    const db = pcmFrameDb(seg);
    const mask = speechMask(db, adaptiveThreshold(db));
    const win = Math.round(maxSec * 100);
    let best = 0;
    let bestScore = -1;
    let acc = 0;
    for (let i = 0; i < mask.length; i++) {
      acc += mask[i];
      if (i >= win) acc -= mask[i - win];
      if (i >= win - 1 && i % 25 === 0 && acc > bestScore) {
        bestScore = acc;
        best = i - win + 1;
      }
    }
    pcm = seg.subarray(best * (SAMPLE_RATE / 100), (best + win) * (SAMPLE_RATE / 100));
  } else if (len >= minSec) {
    pcm = readPcmRange(wavPath, info, longest.start, longest.end);
  } else {
    const gap = new Int16Array(Math.round(0.3 * SAMPLE_RATE));
    const chunks = [];
    let total = 0;
    for (const r of byLen.slice().sort((a, b) => a.start - b.start)) {
      const d = r.end - r.start;
      if (total + d > maxSec) continue;
      if (chunks.length) chunks.push(gap);
      chunks.push(readPcmRange(wavPath, info, r.start, r.end));
      total += d;
      if (total >= minSec) break;
    }
    const n = chunks.reduce((s, c) => s + c.length, 0);
    pcm = new Int16Array(n);
    let off = 0;
    for (const c of chunks) {
      pcm.set(c, off);
      off += c.length;
    }
  }
  if (pcm.length < SAMPLE_RATE) return false;
  writeWav16k(outPath, pcm);
  return true;
}
function safeLabel(label) {
  return label.replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 40) || "speaker";
}
function clipPathFor(workDir, label) {
  return (0, import_path3.join)(workDir, CLIP_DIR, `${safeLabel(label)}.wav`);
}
async function rebuildAudio(meeting, workDir) {
  const rt = await resolveMeetingRuntime();
  if (!rt.ffmpeg) return null;
  const media = [];
  for (const f of meeting.files || []) {
    if (!(0, import_fs3.existsSync)(f.path)) continue;
    const c = f.kind === "transcript" ? null : await classifyMeetingFile(f.path, f.name, rt.ffprobe);
    if (c && c.kind !== "transcript") media.push({ path: f.path, name: f.name });
  }
  if (!media.length) return null;
  const tmp = (0, import_path3.join)(workDir, "_audio");
  (0, import_fs3.mkdirSync)(tmp, { recursive: true });
  const parts = [];
  for (let k = 0; k < media.length; k++) {
    const p = (0, import_path3.join)(tmp, `part-${k}.wav`);
    await convertToWav16k(rt.ffmpeg, media[k].path, p, media[k].name);
    parts.push(p);
  }
  const out = (0, import_path3.join)(workDir, AUDIO_FILE);
  await concatWav16k(parts, out);
  (0, import_fs3.rmSync)(tmp, { recursive: true, force: true });
  return out;
}
async function exportSpeakerClip(i) {
  const { meeting, label, workDir } = i;
  const slot = (meeting.speakers || []).find((s) => s.label === label);
  if (slot?.clipPath && (0, import_fs3.existsSync)(slot.clipPath)) return slot.clipPath;
  const ranges = (meeting.segments || []).filter((s) => s.speakerLabel === label).map((s) => ({ start: s.start, end: s.end }));
  if (!ranges.length) return null;
  let wav = (0, import_path3.join)(workDir, AUDIO_FILE);
  try {
    if (!(0, import_fs3.existsSync)(wav)) {
      const rebuilt = await rebuildAudio(meeting, workDir);
      if (!rebuilt) return null;
      wav = rebuilt;
    }
    (0, import_fs3.mkdirSync)((0, import_path3.join)(workDir, CLIP_DIR), { recursive: true });
    const out = clipPathFor(workDir, label);
    return cutClip(wav, ranges, out) ? out : null;
  } catch {
    return null;
  }
}
async function meetingVoiceSample(workDir, ranges) {
  const wav = (0, import_path3.join)(workDir, AUDIO_FILE);
  if (!(0, import_fs3.existsSync)(wav)) return null;
  let rt;
  try {
    rt = await resolveMeetingRuntime();
  } catch {
    return null;
  }
  if (!rt.campp && !rt.campp2 || !rt.python) return null;
  const picked = [];
  let total = 0;
  for (const r of ranges.filter((r2) => r2.end - r2.start >= 1.5).sort((a, b) => b.end - b.start - (a.end - a.start))) {
    if (total >= 120) break;
    const end = Math.min(r.end, r.start + 20);
    picked.push({ start: r.start, end });
    total += end - r.start;
  }
  if (total < 10) return null;
  const outs = await runSlices(workerSpecFor(rt, { asr: false, threads: 2 }), wav, picked.sort((a, b) => a.start - b.start), { workers: 1, asr: false, emb: true, createWorker: pipelineConfig().createWorker });
  const avg = (key2) => {
    const acc = new Array(192).fill(0);
    let w = 0;
    outs.forEach((o, i) => {
      const e = o[key2];
      if (!e || e.length !== 192) return;
      const d = picked[i].end - picked[i].start;
      for (let k = 0; k < 192; k++) acc[k] += e[k] * d;
      w += d;
    });
    if (!w) return void 0;
    const n = Math.sqrt(acc.reduce((s, x) => s + x * x, 0));
    return n > 0 ? acc.map((x) => x / n) : void 0;
  };
  const vector = avg("emb");
  const vector2 = avg("emb2");
  if (!vector && !vector2) return null;
  return { ...vector ? { vector } : {}, ...vector2 ? { vector2 } : {}, seconds: Math.round(total * 10) / 10 };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/plan.ts
var import_i18n8 = require("npm:@totalclaw/i18n");
var DEPT_SUFFIX = /(部门|事业部|中心|部|组|室|处|科|办公室|办|团队|小组)$/;
function deptAliases(d) {
  const out = [d.name.trim()];
  const stripped = d.name.trim().replace(DEPT_SUFFIX, "");
  if (stripped.length >= 2 && stripped !== d.name.trim()) out.push(stripped);
  return out.filter(Boolean);
}
function resolveDepts(v, depts) {
  const raw = Array.isArray(v) ? v.map((x) => String(x ?? "")) : typeof v === "string" ? v.split(/[、,，/&和及]+/) : v == null ? [] : [String(v)];
  const out = [];
  for (const r of raw.map((x) => x.trim()).filter(Boolean)) {
    const byId = depts.find((d) => d.id === r);
    if (byId) {
      out.push(byId.id);
      continue;
    }
    const byName = depts.filter((d) => d.name.trim() === r);
    if (byName.length === 1) {
      out.push(byName[0].id);
      continue;
    }
    const rs = r.replace(DEPT_SUFFIX, "");
    const fuzzy = depts.filter((d) => deptAliases(d).some((a) => r.includes(a) || rs.length >= 2 && a.includes(rs)));
    if (fuzzy.length === 1) out.push(fuzzy[0].id);
  }
  return [...new Set(out)];
}
function deptsMentioned(text, org) {
  const hits = [];
  for (const d of org.depts) {
    let pos = -1;
    for (const a of deptAliases(d)) {
      const p = text.indexOf(a);
      if (p >= 0 && (pos < 0 || p < pos)) pos = p;
    }
    if (pos >= 0) hits.push({ id: d.id, pos });
  }
  if (!hits.length) {
    for (const p of org.people) {
      if (p.left || p.name.length < 2) continue;
      const pos = text.indexOf(p.name);
      if (pos >= 0 && org.depts.some((d) => d.id === p.deptId)) hits.push({ id: p.deptId, pos });
    }
  }
  hits.sort((a, b) => a.pos - b.pos);
  return [...new Set(hits.map((h) => h.id))];
}
function dueFromText(text, today) {
  const year = Number(today.slice(0, 4));
  const cands = [];
  for (const m of text.matchAll(/(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})\s*日?/g)) cands.push(`${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`);
  if (!cands.length) {
    for (const m of text.matchAll(/(?<![\d/])(\d{1,2})\s*(?:月|\/)\s*(\d{1,2})\s*(?:日|号)?(?![\d/])/g)) {
      const mm = m[1].padStart(2, "0");
      const dd = m[2].padStart(2, "0");
      let c = `${year}-${mm}-${dd}`;
      if (isDateStr(c) && c < today) c = `${year + 1}-${mm}-${dd}`;
      cands.push(c);
    }
  }
  for (const c of cands) {
    if (isDateStr(c) && c >= today && daysBetween(today, c) <= 366) return c;
  }
  return null;
}
function defaultDue(text, today) {
  return addDays(today, URGENT_WORDS.some((w) => text.includes(w)) ? 7 : 14);
}
function hostDept(meeting, project, org) {
  for (const pid of [meeting.hostId, project.ownerId, meeting.createdBy]) {
    const p = org.people.find((x) => x.id === pid);
    if (p && org.depts.some((d) => d.id === p.deptId)) return p.deptId;
  }
  return org.depts[0]?.id ?? null;
}
function fallbackPlanItems(decisions, meeting, project, org, today) {
  const items = [];
  const fallbackDept = hostDept(meeting, project, org);
  for (const d of decisions) {
    let depts = deptsMentioned(d.text, org);
    if (!depts.length && fallbackDept) depts = [fallbackDept];
    const due = dueFromText(d.text, today) || defaultDue(d.text, today);
    const title = truncate(d.text.replace(/[。；;]+$/, ""), 60);
    for (const deptId of depts) {
      items.push({ id: "", deptId, title, standard: defaultStandard(title), due, decisionId: d.id });
    }
  }
  return items;
}
function defaultStandard(title) {
  return (0, import_i18n8.t)("\u5B8C\u6210\u300C{p0}\u300D\uFF0C\u5728\u7CFB\u7EDF\u5185\u66F4\u65B0\u8FDB\u5EA6\u5E76\u63D0\u4EA4\u5B8C\u6210\u8BF4\u660E", { p0: truncate(title, 30) });
}
function fallbackSummary2(meeting, decisions, items, org) {
  const deptName2 = (id) => org.depts.find((d) => d.id === id)?.name || id;
  const deptCount = new Set(items.map((x) => x.deptId)).size;
  const lines = [
    (0, import_i18n8.t)("\u6839\u636E\u4F1A\u8BAE\u300C{p0}\u300D\u7684 {p1} \u9879\u51B3\u8BAE\uFF0C\u62C6\u5206\u4E3A {p2} \u9879\u4EFB\u52A1\uFF0C\u6D89\u53CA {p3} \u4E2A\u90E8\u95E8\u3002", { p0: meeting.title, p1: decisions.length, p2: items.length, p3: deptCount }),
    "",
    ...items.map((x) => (0, import_i18n8.t)("- {p0}\uFF1A{p1}\uFF08{p2} \u524D\u5B8C\u6210\uFF09", { p0: deptName2(x.deptId), p1: x.title, p2: x.due }))
  ];
  return lines.join("\n");
}
async function generatePlan(i) {
  const { meeting, project, org, today } = i;
  let decisions = meeting.decisions || [];
  if (!decisions.length && meeting.segments?.length) decisions = fallbackDecisions(meeting.segments);
  const depts = org.depts;
  if (!decisions.length || !depts.length) {
    return {
      generatedAt: Date.now(),
      summary: decisions.length ? (0, import_i18n8.t)("\u7EC4\u7EC7\u91CC\u8FD8\u6CA1\u6709\u90E8\u95E8\uFF0C\u65E0\u6CD5\u751F\u6210\u4EFB\u52A1\u3002\u8BF7\u5148\u540C\u6B65\u901A\u8BAF\u5F55\u3002") : (0, import_i18n8.t)("\u8FD9\u6B21\u4F1A\u8BAE\u6CA1\u6709\u8BC6\u522B\u51FA\u51B3\u8BAE\u4E8B\u9879\uFF0C\u8BF7\u624B\u52A8\u6DFB\u52A0\u4EFB\u52A1\u3002"),
      items: []
    };
  }
  let items = [];
  let summary = "";
  try {
    const raw = await i.llm(planPrompt({
      today,
      meeting: `${meeting.title} (${project.name})`,
      depts: depts.map((d) => `${d.id}: ${d.name}`).join("\n"),
      decisions: decisions.map((d, k) => `${k + 1}. ${d.text}`).join("\n"),
      custom: i.prompt
    }), { json: true, timeoutMs: 18e4 });
    const j = parseLlmJson(raw);
    if (j && Array.isArray(j.items)) {
      const seen = /* @__PURE__ */ new Set();
      for (const it of j.items) {
        const title = typeof it?.title === "string" ? truncate(it.title.replace(/\s+/g, " "), 120) : "";
        if (title.length < 2) continue;
        const dn = Number(it?.decision);
        const dec = Number.isInteger(dn) && dn >= 1 && dn <= decisions.length ? decisions[dn - 1] : void 0;
        const deptRaw = it?.dept ?? it?.deptId ?? it?.department;
        let ids = resolveDepts(deptRaw, depts);
        if (!ids.length && (deptRaw === void 0 || deptRaw === null || deptRaw === "") && dec) ids = deptsMentioned(dec.text, org);
        if (!ids.length) continue;
        const standard = typeof it?.standard === "string" && it.standard.trim() ? truncate(it.standard.trim(), 300) : defaultStandard(title);
        let due = typeof it?.due === "string" ? it.due.trim().slice(0, 10) : "";
        if (!isDateStr(due) || due <= today || daysBetween(today, due) > 366) {
          const t = dec?.text || title;
          due = dueFromText(t, today) || defaultDue(t, today);
        }
        for (const deptId of ids) {
          const key2 = `${deptId}|${title}`;
          if (seen.has(key2)) continue;
          seen.add(key2);
          items.push({ id: "", deptId, title, standard, due, decisionId: dec?.id });
        }
      }
      if (items.length && typeof j.summary === "string" && j.summary.trim()) {
        const allowed = /* @__PURE__ */ new Set([
          ...numberTokens(decisions.map((d) => d.text).join("\n")),
          ...numberTokens(`${today} ${meeting.title} ${project.name}`),
          ...items.flatMap((x) => numberTokens(`${x.due} ${x.title} ${x.standard}`)),
          String(items.length),
          String(decisions.length),
          String(new Set(items.map((x) => x.deptId)).size)
        ]);
        summary = guardNumbers(j.summary.trim(), allowed).text;
      }
    }
  } catch {
    items = [];
  }
  if (!items.length) items = fallbackPlanItems(decisions, meeting, project, org, today);
  items = items.map((x, k) => ({ ...x, id: `pi_${k + 1}` }));
  if (!summary) summary = fallbackSummary2(meeting, decisions, items, org);
  return { generatedAt: Date.now(), summary, items };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/reports.ts
var import_i18n9 = require("npm:@totalclaw/i18n");
function isTaskOverdue2(t, now) {
  return (t.status === "not_started" || t.status === "in_progress") && isDateStr(t.due) && now > endOfDayMs(t.due);
}
function overdueDays(t, now) {
  return isTaskOverdue2(t, now) ? Math.max(1, daysBetween(t.due, localDateStr(now))) : 0;
}
function doneOnTime(t) {
  if (t.status !== "done") return false;
  if (!t.doneAt || !isDateStr(t.due)) return true;
  return t.doneAt <= endOfDayMs(t.due);
}
function buildReportStats(tasks, now) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const cancelled = tasks.filter((t) => t.status === "cancelled").length;
  const overdue = tasks.filter((t) => isTaskOverdue2(t, now)).length;
  const onTime = tasks.filter((t) => doneOnTime(t)).length;
  const late = done - onTime;
  const effective = total - cancelled;
  const completionRate = effective > 0 ? Math.round(done / effective * 100) : total > 0 ? 100 : 0;
  return { total, done, cancelled, overdue, onTime, late, completionRate };
}
function cell(s) {
  return String(s ?? "").replace(/\|/g, "\uFF0F").replace(/\s*\n\s*/g, " ").trim() || "\u2014";
}
function nameMaps(org) {
  const people = new Map(org.people.map((p) => [p.id, p.name]));
  const depts = new Map(org.depts.map((d) => [d.id, d.name]));
  return { person: (id) => id && people.get(id) || id || "\u2014", dept: (id) => id && depts.get(id) || id || "\u2014" };
}
function deptProgress(tasks, dept) {
  const m = /* @__PURE__ */ new Map();
  for (const t of tasks) {
    if (t.status === "cancelled") continue;
    const e = m.get(t.deptId) || { name: dept(t.deptId), done: 0, total: 0 };
    e.total++;
    if (t.status === "done") e.done++;
    m.set(t.deptId, e);
  }
  return [...m.values()].sort((a, b) => b.total - a.total);
}
async function narrative(llm, prompt, keys, allowed) {
  try {
    const raw = await llm(prompt, { json: true, timeoutMs: 12e4 });
    const j = parseLlmJson(raw);
    if (!j) return {};
    const out = {};
    for (const k of keys) {
      const v = j[k];
      if (typeof v !== "string" || !v.trim()) continue;
      const plain = v.replace(/^#+\s*/gm, "").replace(/^\|.*\|$/gm, "").trim();
      const g = guardNumbers(truncate(plain, 1200), allowed);
      if (g.text) out[k] = g.text;
    }
    return out;
  } catch {
    return {};
  }
}
async function generateWeeklyReport(i) {
  const { project, org, from, to } = i;
  const tasks = i.tasks.filter((t) => !t.projectId || t.projectId === project.id);
  const meetings = i.meetings.filter((m) => !m.projectId || m.projectId === project.id);
  const names = nameMaps(org);
  const stats = buildReportStats(tasks, to);
  const inPeriod = (ms) => !!ms && ms >= from && ms <= to;
  const doneInPeriod = tasks.filter((t) => t.status === "done" && inPeriod(t.doneAt));
  const createdInPeriod = tasks.filter((t) => inPeriod(t.createdAt));
  const updates = tasks.reduce((s, t) => s + (t.progressLog || []).filter((l) => inPeriod(l.at)).length, 0);
  const overdueList = tasks.filter((t) => isTaskOverdue2(t, to)).map((t) => ({ title: t.title, dept: names.dept(t.deptId), due: t.due, days: overdueDays(t, to), percent: t.percent })).sort((a, b) => b.days - a.days);
  const allObj = tasks.flatMap((t) => [...t.objectionHistory || [], ...t.objection ? [t.objection] : []]);
  const objRaised = allObj.filter((o) => inPeriod(o.raisedAt)).length;
  const objResolved = allObj.filter((o) => inPeriod(o.resolvedAt)).length;
  const objOpen = tasks.filter((t) => t.objection && t.objection.stage !== "resolved").length;
  const toDate = localDateStr(to);
  const upcoming = tasks.filter((t) => (t.status === "not_started" || t.status === "in_progress" || t.status === "to_accept") && isDateStr(t.due) && t.due >= toDate && daysBetween(toDate, t.due) <= 7).map((t) => ({ title: t.title, dept: names.dept(t.deptId), due: t.due }));
  const depts = deptProgress(tasks, names.dept);
  const periodMeetings = meetings.filter((m) => inPeriod(m.time)).map((m) => ({ title: m.title, date: localDateStr(m.time) }));
  const facts = {
    project: project.name,
    period: { from: localDateStr(from), to: toDate },
    stats,
    doneThisPeriod: doneInPeriod.map((t) => ({ title: t.title, dept: names.dept(t.deptId) })),
    doneThisPeriodCount: doneInPeriod.length,
    createdThisPeriodCount: createdInPeriod.length,
    progressUpdatesThisPeriod: updates,
    overdue: overdueList,
    dueNextWeek: upcoming,
    depts,
    objections: { raisedThisPeriod: objRaised, resolvedThisPeriod: objResolved, open: objOpen },
    meetingsThisPeriod: periodMeetings
  };
  const factsText = JSON.stringify(facts);
  const allowed = new Set(numberTokens(factsText));
  const n = await narrative(i.llm, weeklyNarrativePrompt(factsText), ["progress", "focus"], allowed);
  const progress = n.progress || [
    (0, import_i18n9.t)("\u672C\u671F\u5B8C\u6210 {p0} \u9879\u4EFB\u52A1\uFF0C\u65B0\u589E {p1} \u9879\uFF0C\u7D2F\u8BA1\u5B8C\u6210\u7387 {p2}%\u3002", { p0: doneInPeriod.length, p1: createdInPeriod.length, p2: stats.completionRate }),
    stats.overdue > 0 ? (0, import_i18n9.t)("\u76EE\u524D\u6709 {p0} \u9879\u4EFB\u52A1\u903E\u671F\uFF0C\u9700\u8981\u5C3D\u5FEB\u8DDF\u8FDB\u3002", { p0: stats.overdue }) : (0, import_i18n9.t)("\u76EE\u524D\u6CA1\u6709\u903E\u671F\u4EFB\u52A1\u3002")
  ].join("");
  const focus = n.focus || [
    upcoming.length ? (0, import_i18n9.t)("\u672A\u6765 7 \u5929\u5185\u6709 {p0} \u9879\u4EFB\u52A1\u5230\u671F\u3002", { p0: upcoming.length }) : "",
    objOpen ? (0, import_i18n9.t)("\u8FD8\u6709 {p0} \u9879\u5F02\u8BAE\u5728\u5904\u7406\u4E2D\u3002", { p0: objOpen }) : "",
    overdueList.length ? (0, import_i18n9.t)("\u8BF7\u903E\u671F\u4EFB\u52A1\u7684\u8D23\u4EFB\u90E8\u95E8\u5C3D\u5FEB\u66F4\u65B0\u8FDB\u5EA6\u3002") : ""
  ].filter(Boolean).join("") || (0, import_i18n9.t)("\u6309\u8BA1\u5212\u63A8\u8FDB\u5373\u53EF\u3002");
  const md = [
    `# ${(0, import_i18n9.t)("{p0} \xB7 \u8FDB\u5EA6\u6C47\u603B\u62A5\u544A", { p0: project.name })}`,
    "",
    (0, import_i18n9.t)("\u7EDF\u8BA1\u533A\u95F4\uFF1A{p0} \u81F3 {p1}", { p0: localDateStr(from), p1: toDate }),
    "",
    `## ${(0, import_i18n9.t)("\u603B\u4F53\u60C5\u51B5")}`,
    "",
    `- ${(0, import_i18n9.t)("\u4EFB\u52A1\u603B\u6570\uFF1A{p0} \u9879\uFF08\u5DF2\u5B8C\u6210 {p1}\uFF0C\u5DF2\u53D6\u6D88 {p2}\uFF09", { p0: stats.total, p1: stats.done, p2: stats.cancelled })}`,
    `- ${(0, import_i18n9.t)("\u5B8C\u6210\u7387\uFF1A{p0}%", { p0: stats.completionRate })}`,
    `- ${(0, import_i18n9.t)("\u903E\u671F\uFF1A{p0} \u9879", { p0: stats.overdue })}`,
    `- ${(0, import_i18n9.t)("\u672C\u671F\u5B8C\u6210 {p0} \u9879\uFF0C\u65B0\u589E {p1} \u9879\uFF0C\u8FDB\u5EA6\u66F4\u65B0 {p2} \u6B21", { p0: doneInPeriod.length, p1: createdInPeriod.length, p2: updates })}`,
    "",
    `## ${(0, import_i18n9.t)("\u672C\u671F\u8FDB\u5C55")}`,
    "",
    progress,
    "",
    `## ${(0, import_i18n9.t)("\u5404\u90E8\u95E8\u8FDB\u5EA6")}`,
    ""
  ];
  if (depts.length) {
    md.push(`| ${(0, import_i18n9.t)("\u90E8\u95E8")} | ${(0, import_i18n9.t)("\u5DF2\u5B8C\u6210 / \u603B\u6570")} | ${(0, import_i18n9.t)("\u5B8C\u6210\u7387")} |`, "| --- | --- | --- |");
    for (const d of depts) md.push(`| ${cell(d.name)} | ${d.done} / ${d.total} | ${d.total ? Math.round(d.done / d.total * 100) : 0}% |`);
  } else md.push((0, import_i18n9.t)("\u6682\u65E0\u4EFB\u52A1\u3002"));
  md.push("", `## ${(0, import_i18n9.t)("\u903E\u671F\u4EFB\u52A1")}`, "");
  if (overdueList.length) {
    md.push(`| ${(0, import_i18n9.t)("\u4EFB\u52A1")} | ${(0, import_i18n9.t)("\u8D23\u4EFB\u90E8\u95E8")} | ${(0, import_i18n9.t)("\u622A\u6B62\u65E5")} | ${(0, import_i18n9.t)("\u903E\u671F\u5929\u6570")} | ${(0, import_i18n9.t)("\u8FDB\u5EA6")} |`, "| --- | --- | --- | --- | --- |");
    for (const t of overdueList) md.push(`| ${cell(t.title)} | ${cell(t.dept)} | ${t.due} | ${t.days} | ${t.percent}% |`);
  } else md.push((0, import_i18n9.t)("\u65E0\u3002"));
  md.push("", `## ${(0, import_i18n9.t)("\u5F02\u8BAE\u4E0E\u53D8\u66F4")}`, "", (0, import_i18n9.t)("\u672C\u671F\u65B0\u63D0\u51FA {p0} \u9879\uFF0C\u5904\u7406\u5B8C {p1} \u9879\uFF0C\u4ECD\u5728\u5904\u7406 {p2} \u9879\u3002", { p0: objRaised, p1: objResolved, p2: objOpen }));
  md.push("", `## ${(0, import_i18n9.t)("\u4E0B\u671F\u5173\u6CE8")}`, "", focus, "");
  return { id: randomId("rpt"), kind: "weekly", generatedAt: Date.now(), periodFrom: from, periodTo: to, markdown: md.join("\n"), stats };
}
function outcomeLabel(o) {
  switch (o) {
    case "adopted":
      return (0, import_i18n9.t)("\u91C7\u7EB3\u5E76\u8C03\u6574");
    case "accepted_reject":
      return (0, import_i18n9.t)("\u63A5\u53D7\u9A73\u56DE");
    case "kept":
      return (0, import_i18n9.t)("\u7EF4\u6301\u539F\u65B9\u6848");
    case "adjusted":
      return (0, import_i18n9.t)("\u6309\u5F02\u8BAE\u8C03\u6574");
    case "cancelled":
      return (0, import_i18n9.t)("\u5220\u9664\u4EFB\u52A1");
    default:
      return (0, import_i18n9.t)("\u5904\u7406\u4E2D");
  }
}
function targetLabel(t) {
  return t === "time" ? (0, import_i18n9.t)("\u65F6\u95F4") : t === "requirement" ? (0, import_i18n9.t)("\u8981\u6C42") : (0, import_i18n9.t)("\u5185\u5BB9");
}
async function generateProjectSummary(i) {
  const { project, org } = i;
  const now = Date.now();
  const tasks = i.tasks.filter((t) => !t.projectId || t.projectId === project.id);
  const meetings = i.meetings.filter((m) => !m.projectId || m.projectId === project.id).slice().sort((a, b) => a.time - b.time);
  const names = nameMaps(org);
  const stats = buildReportStats(tasks, now);
  const decisions = meetings.flatMap((m) => (m.decisions || []).map((d) => ({ text: d.text, meeting: m.title, date: localDateStr(m.time) })));
  const lateTasks = tasks.filter((t) => t.status === "done" && !doneOnTime(t)).map((t) => ({
    title: t.title,
    dept: names.dept(t.deptId),
    due: t.due,
    doneDate: t.doneAt ? localDateStr(t.doneAt) : "\u2014",
    daysLate: t.doneAt ? Math.max(1, daysBetween(t.due, localDateStr(t.doneAt))) : 0
  }));
  const unfinished = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled").length;
  const records = tasks.flatMap((t) => [...t.objectionHistory || [], ...t.objection ? [t.objection] : []].map((o) => ({
    task: t.title,
    kind: o.kind === "change" ? (0, import_i18n9.t)("\u7533\u8BF7\u53D8\u66F4") : (0, import_i18n9.t)("\u63D0\u51FA\u5F02\u8BAE"),
    target: targetLabel(o.target),
    reason: truncate(o.reason || "", 60),
    outcome: outcomeLabel(o.outcome),
    arbitrated: !!o.arbitration,
    date: localDateStr(o.raisedAt)
  })));
  const arbitrations = records.filter((r) => r.arbitrated).length;
  const firstDay = localDateStr(project.createdAt || meetings[0]?.time || now);
  const lastDay = localDateStr(project.archivedAt || now);
  const facts = {
    project: { name: project.name, desc: project.desc, owner: names.person(project.ownerId), members: project.memberIds.length, from: firstDay, to: lastDay },
    meetings: meetings.map((m) => ({ title: m.title, date: localDateStr(m.time), decisions: (m.decisions || []).length })),
    meetingCount: meetings.length,
    decisionCount: decisions.length,
    decisions: decisions.slice(0, 60),
    stats,
    unfinished,
    lateTasks,
    changesAndArbitrations: { total: records.length, arbitrations, records: records.slice(0, 60) }
  };
  const factsText = JSON.stringify(facts);
  const allowed = new Set(numberTokens(factsText));
  const n = await narrative(i.llm, summaryNarrativePrompt(factsText, i.prompt), ["overall", "lessons"], allowed);
  const overall = n.overall || (0, import_i18n9.t)("\u9879\u76EE\u5171\u53EC\u5F00 {p0} \u573A\u4F1A\u8BAE\uFF0C\u5F62\u6210 {p1} \u9879\u51B3\u8BAE\uFF0C\u6D3E\u53D1 {p2} \u9879\u4EFB\u52A1\uFF0C\u6309\u671F\u5B8C\u6210 {p3} \u9879\u3001\u5EF6\u671F\u5B8C\u6210 {p4} \u9879\u3002", {
    p0: meetings.length,
    p1: decisions.length,
    p2: stats.total,
    p3: stats.onTime,
    p4: stats.late
  });
  const lessons = n.lessons || [
    stats.late > 0 ? (0, import_i18n9.t)("\u6709 {p0} \u9879\u4EFB\u52A1\u5EF6\u671F\u5B8C\u6210\uFF0C\u540E\u7EED\u7ACB\u9879\u65F6\u5EFA\u8BAE\u9884\u7559\u7F13\u51B2\u65F6\u95F4\u5E76\u52A0\u5F3A\u8FDB\u5EA6\u8DDF\u8E2A\u3002", { p0: stats.late }) : "",
    records.length > 0 ? (0, import_i18n9.t)("\u6267\u884C\u4E2D\u5171\u63D0\u51FA {p0} \u6B21\u5F02\u8BAE\u6216\u53D8\u66F4\uFF0C\u5176\u4E2D {p1} \u6B21\u63D0\u4EA4\u88C1\u51B3\uFF0C\u5EFA\u8BAE\u5728\u65B9\u6848\u786E\u8BA4\u9636\u6BB5\u4E0E\u8D23\u4EFB\u90E8\u95E8\u5145\u5206\u6C9F\u901A\u3002", { p0: records.length, p1: arbitrations }) : ""
  ].filter(Boolean).join("") || (0, import_i18n9.t)("\u4EFB\u52A1\u5747\u6309\u671F\u5B8C\u6210\uFF0C\u6267\u884C\u8FC7\u7A0B\u987A\u7545\u3002");
  const md = [
    `# ${(0, import_i18n9.t)("{p0} \xB7 \u9879\u76EE\u603B\u7ED3\u62A5\u544A", { p0: project.name })}`,
    "",
    `## ${(0, import_i18n9.t)("\u9879\u76EE\u6982\u51B5")}`,
    "",
    `- ${(0, import_i18n9.t)("\u9879\u76EE\u8D1F\u8D23\u4EBA\uFF1A{p0}", { p0: names.person(project.ownerId) })}`,
    `- ${(0, import_i18n9.t)("\u9879\u76EE\u5468\u671F\uFF1A{p0} \u81F3 {p1}", { p0: firstDay, p1: lastDay })}`,
    `- ${(0, import_i18n9.t)("\u9879\u76EE\u6210\u5458\uFF1A{p0} \u4EBA\uFF1B\u4F1A\u8BAE\uFF1A{p1} \u573A\uFF1B\u51B3\u8BAE\uFF1A{p2} \u9879\uFF1B\u4EFB\u52A1\uFF1A{p3} \u9879", { p0: project.memberIds.length, p1: meetings.length, p2: decisions.length, p3: stats.total })}`
  ];
  if (project.desc?.trim()) md.push(`- ${(0, import_i18n9.t)("\u9879\u76EE\u8BF4\u660E\uFF1A{p0}", { p0: project.desc.trim().replace(/\s*\n\s*/g, " ") })}`);
  md.push("", overall, "", `## ${(0, import_i18n9.t)("\u5173\u952E\u51B3\u7B56")}`, "");
  if (decisions.length) decisions.forEach((d, k) => md.push(`${k + 1}. ${d.text}\uFF08${d.date} ${d.meeting}\uFF09`));
  else md.push((0, import_i18n9.t)("\u65E0\u3002"));
  md.push(
    "",
    `## ${(0, import_i18n9.t)("\u4EFB\u52A1\u5B8C\u6210\u60C5\u51B5")}`,
    "",
    `- ${(0, import_i18n9.t)("\u4EFB\u52A1 {p0} \u9879\uFF1A\u6309\u671F\u5B8C\u6210 {p1} \u9879\uFF0C\u5EF6\u671F\u5B8C\u6210 {p2} \u9879\uFF0C\u5DF2\u53D6\u6D88 {p3} \u9879\uFF0C\u672A\u5B8C\u6210 {p4} \u9879", { p0: stats.total, p1: stats.onTime, p2: stats.late, p3: stats.cancelled, p4: unfinished })}`,
    `- ${(0, import_i18n9.t)("\u5B8C\u6210\u7387\uFF1A{p0}%", { p0: stats.completionRate })}`,
    ""
  );
  if (lateTasks.length) {
    md.push(`| ${(0, import_i18n9.t)("\u5EF6\u671F\u4EFB\u52A1")} | ${(0, import_i18n9.t)("\u8D23\u4EFB\u90E8\u95E8")} | ${(0, import_i18n9.t)("\u622A\u6B62\u65E5")} | ${(0, import_i18n9.t)("\u5B8C\u6210\u65E5")} | ${(0, import_i18n9.t)("\u5EF6\u671F\u5929\u6570")} |`, "| --- | --- | --- | --- | --- |");
    for (const t of lateTasks) md.push(`| ${cell(t.title)} | ${cell(t.dept)} | ${t.due} | ${t.doneDate} | ${t.daysLate} |`);
    md.push("");
  }
  md.push(`## ${(0, import_i18n9.t)("\u53D8\u66F4\u4E0E\u88C1\u51B3\u8BB0\u5F55")}`, "");
  if (records.length) {
    md.push(`| ${(0, import_i18n9.t)("\u4EFB\u52A1")} | ${(0, import_i18n9.t)("\u7C7B\u578B")} | ${(0, import_i18n9.t)("\u9488\u5BF9")} | ${(0, import_i18n9.t)("\u539F\u56E0")} | ${(0, import_i18n9.t)("\u7ED3\u679C")} | ${(0, import_i18n9.t)("\u65E5\u671F")} |`, "| --- | --- | --- | --- | --- | --- |");
    for (const r of records) md.push(`| ${cell(r.task)} | ${cell(r.kind)}${r.arbitrated ? (0, import_i18n9.t)("\uFF08\u7ECF\u88C1\u51B3\uFF09") : ""} | ${cell(r.target)} | ${cell(r.reason)} | ${cell(r.outcome)} | ${r.date} |`);
  } else md.push((0, import_i18n9.t)("\u65E0\u3002"));
  md.push("", `## ${(0, import_i18n9.t)("\u603B\u7ED3\u4E0E\u5EFA\u8BAE")}`, "", lessons, "");
  return { id: randomId("rpt"), kind: "summary", generatedAt: now, markdown: md.join("\n"), stats };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/pipeline/index.ts
init_runtime();
var MERGE_MAX_SEC = 120;
var MERGE_MAX_CHARS = 600;
var MERGE_MAX_GAP_SEC = 10;
function makeReporter(onStage) {
  let lastStage = "";
  let lastP = -1;
  let lastAt = 0;
  return (stage, progress, text) => {
    const p = Math.max(lastP, Math.min(100, Math.round(progress)));
    const now = Date.now();
    if (!text && stage === lastStage && (p === lastP || now - lastAt < 500)) return;
    lastStage = stage;
    lastP = p;
    lastAt = now;
    try {
      onStage(stage, p, text);
    } catch {
    }
  };
}
function checkAbort(signal) {
  if (signal?.aborted) throw abortError();
}
var normForMatch = (s) => s.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
var HALLU_NORM = ASR_HALLUCINATIONS.map(normForMatch);
var toSimplified = (0, import_t2cn.Converter)({ from: "t", to: "cn" });
function simplifyZh(text, lang) {
  if (!text || lang && !lang.startsWith("zh")) return text;
  return fullWidthPunct(toSimplified(text));
}
var HALF_TO_FULL = { ",": "\uFF0C", "?": "\uFF1F", "!": "\uFF01", ":": "\uFF1A", ";": "\uFF1B" };
function fullWidthPunct(text) {
  return text.replace(
    /([\u3400-\u9fff\uff00-\uffef])\s*([,?!:;])\s*|([,?!:;])\s*(?=[\u3400-\u9fff])/g,
    (_m, before, p1, p2) => before ? before + HALF_TO_FULL[p1] : HALF_TO_FULL[p2]
  );
}
function echoesPrompt(raw, prompt) {
  const p = normForMatch(prompt || "");
  if (!p || !raw) return false;
  return splitSentences(String(raw).replace(/\s+/g, " ").trim()).some((s) => {
    const n = normForMatch(s);
    return n.length >= 4 && p.includes(n);
  });
}
var RETRY_MIN_SPEECH_SEC = 1;
var SLICE_HIGHPASS_HZ = 200;
function cleanAsrText(text, names = []) {
  let t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  t = t.replace(/(?<=[㐀-鿿　-〿＀-￯])\s+(?=[㐀-鿿　-〿＀-￯])/g, "");
  const namesNorm = names.length ? normForMatch(names.join("")) : "";
  const kept = splitSentences(t).filter((s) => {
    const n = normForMatch(s);
    if (!n) return false;
    if (HALLU_NORM.some((h) => h && n.includes(h))) return false;
    if (namesNorm && n.length >= 4 && namesNorm.includes(n)) return false;
    return true;
  });
  return joinTexts(kept);
}
function buildSegments(slices, texts, labels) {
  const out = [];
  let cur = null;
  const flush = () => {
    if (!cur) return;
    const text = joinTexts(cur.parts);
    if (text) out.push({ id: `seg_${out.length + 1}`, start: round2(cur.start), end: round2(cur.end), speakerLabel: cur.label, text });
    cur = null;
  };
  slices.forEach((s, i) => {
    const text = (texts[i] || "").trim();
    if (!text) return;
    const label = labels[i] || "S1";
    if (cur && cur.label === label && s.start - cur.end <= MERGE_MAX_GAP_SEC && s.end - cur.start <= MERGE_MAX_SEC && cur.chars + text.length <= MERGE_MAX_CHARS) {
      cur.end = s.end;
      cur.parts.push(text);
      cur.chars += text.length;
      return;
    }
    flush();
    cur = { start: s.start, end: s.end, label, parts: [text], chars: text.length };
  });
  flush();
  return out;
}
function round2(x) {
  return Math.round(x * 100) / 100;
}
function sliceWavBase64(wavPath, s) {
  const info = readWavInfo(wavPath);
  const pcm = readPcmRange(wavPath, info, s.start, s.end);
  const data = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  return Buffer.concat([wavHeader(data.length), data]).toString("base64");
}
async function classifyAll(files, rt, signal) {
  const out = [];
  for (const f of files) {
    checkAbort(signal);
    if (!f.path || !(0, import_fs4.existsSync)(f.path)) throw new Error((0, import_i18n10.t)("\u6587\u4EF6\u300C{p0}\u300D\u5DF2\u4E0D\u5728\u672C\u673A\uFF0C\u8BF7\u91CD\u65B0\u4E0A\u4F20", { p0: f.name }));
    const c = await classifyMeetingFile(f.path, f.name, (await rt()).ffprobe, signal);
    if (!c) throw new Error((0, import_i18n10.t)("\u6587\u4EF6\u300C{p0}\u300D\u7684\u683C\u5F0F\u4E0D\u652F\u6301\uFF08\u6CA1\u6709\u97F3\u8F68\uFF0C\u4E5F\u4E0D\u662F\u6587\u5B57\u8BB0\u5F55\uFF09", { p0: f.name }));
    out.push({ file: f, kind: c.kind });
  }
  return out;
}
async function runMeetingPipeline(input) {
  const report = makeReporter(input.onStage);
  const { signal } = input;
  if (!input.files?.length) throw new Error((0, import_i18n10.t)("\u8FD8\u6CA1\u6709\u4E0A\u4F20\u4F1A\u8BAE\u6587\u4EF6"));
  (0, import_fs4.mkdirSync)(input.workDir, { recursive: true });
  let rtCache = null;
  const rt = () => rtCache ||= resolveMeetingRuntime();
  try {
    report("extract", 0, (0, import_i18n10.t)("\u5F00\u59CB\u5904\u7406 {p0} \u4E2A\u6587\u4EF6", { p0: input.files.length }));
    const classified = await classifyAll(input.files, rt, signal);
    const media = classified.filter((c) => c.kind !== "transcript");
    const transcripts = classified.filter((c) => c.kind === "transcript");
    if (media.length) {
      if (transcripts.length) report("extract", 1, (0, import_i18n10.t)("\u540C\u65F6\u4E0A\u4F20\u4E86\u5F55\u97F3\u548C\u6587\u5B57\u8BB0\u5F55\uFF0C\u4EE5\u5F55\u97F3\u4E3A\u51C6\uFF08\u6587\u5B57\u8BB0\u5F55\u4E0D\u53C2\u4E0E\u8F6C\u5199\uFF09"));
      return await runAudio(input, media.map((m) => m.file), await rt(), report);
    }
    return await runTranscripts(input, transcripts.map((t) => t.file), report);
  } catch (e) {
    if (e?.aborted || signal?.aborted) throw abortError();
    const msg = String(e?.message || e || "");
    if (/[一-鿿]/.test(msg)) throw e;
    const err = new Error((0, import_i18n10.t)("\u4F1A\u8BAE\u5904\u7406\u5931\u8D25\uFF1A{p0}", { p0: msg.slice(0, 200) || (0, import_i18n10.t)("\u672A\u77E5\u9519\u8BEF") }));
    err.detail = e?.stack;
    throw err;
  }
}
async function runTranscripts(input, files, report) {
  report("parse", 2, (0, import_i18n10.t)("\u89E3\u6790\u6587\u5B57\u8BB0\u5F55"));
  const segments = [];
  const speakers = [];
  let offset = 0;
  for (let k = 0; k < files.length; k++) {
    checkAbort(input.signal);
    const f = files[k];
    const parsed = await parseTranscriptFile(f.path, f.name, { attendees: input.attendees });
    for (const s of parsed.segments) segments.push({ ...s, id: `seg_${segments.length + 1}`, start: round2(s.start + offset), end: round2(s.end + offset) });
    for (const sp of parsed.speakers) if (!speakers.some((x) => x.label === sp.label)) speakers.push(sp);
    offset += (parsed.durationSec || 0) + (parsed.segments.length ? 1 : 0);
    report("parse", 2 + Math.round((k + 1) / files.length * 48));
  }
  if (!segments.length) throw new Error((0, import_i18n10.t)("\u6587\u5B57\u8BB0\u5F55\u91CC\u6CA1\u6709\u53EF\u8BC6\u522B\u7684\u53D1\u8A00\u5185\u5BB9"));
  const matched = speakers.filter((s) => s.personId).length;
  report("parse", 50, (0, import_i18n10.t)("\u89E3\u6790\u51FA {p0} \u6BB5\u53D1\u8A00\u3001{p1} \u4F4D\u53D1\u8A00\u4EBA\uFF0C\u5176\u4E2D {p2} \u4F4D\u5DF2\u6309\u6635\u79F0\u5339\u914D\u5230\u5458\u5DE5", { p0: segments.length, p1: speakers.length, p2: matched }));
  return finish(input, segments, speakers, offset > 0 ? Math.round(offset) : void 0, report, 50);
}
async function finish(input, segments, speakers, durationSec, report, from) {
  checkAbort(input.signal);
  report("organize", from, (0, import_i18n10.t)("\u6574\u7406\u8BAE\u9898\u3001\u51B3\u8BAE\u4E0E\u6458\u8981"));
  const byId = new Map(input.attendees.map((p) => [p.id, p.name]));
  const speakerNames = {};
  for (const s of speakers) speakerNames[s.label] = s.personId && byId.get(s.personId) || s.label;
  const org = await organizeMinutes({
    segments,
    speakerNames,
    attendeeNames: input.attendees.map((p) => p.name),
    llm: input.llm,
    prompt: input.organizePrompt
  });
  checkAbort(input.signal);
  if (org.note) report("organize", 99, org.note);
  report("done", 100, (0, import_i18n10.t)("\u5904\u7406\u5B8C\u6210\uFF1A{p0} \u6BB5\u53D1\u8A00\u3001{p1} \u4E2A\u8BAE\u9898\u3001{p2} \u9879\u51B3\u8BAE", { p0: org.segments.length, p1: org.topics.length, p2: org.decisions.length }));
  return { segments: org.segments, speakers, topics: org.topics, decisions: org.decisions, summaryLines: org.summaryLines, durationSec };
}
async function runAudio(input, files, rt, report) {
  const { signal, workDir } = input;
  const cfg = pipelineConfig();
  if (!rt.ffmpeg) throw new Error((0, import_i18n10.t)("\u627E\u4E0D\u5230 ffmpeg\uFF0C\u65E0\u6CD5\u5904\u7406\u5F55\u97F3"));
  const tmp = (0, import_path4.join)(workDir, "_audio");
  (0, import_fs4.rmSync)(tmp, { recursive: true, force: true });
  (0, import_fs4.mkdirSync)(tmp, { recursive: true });
  const parts = [];
  for (let k = 0; k < files.length; k++) {
    checkAbort(signal);
    report("extract", 1 + Math.round(k / files.length * 4), (0, import_i18n10.t)("\u6B63\u5728\u63D0\u53D6\u97F3\u8F68\uFF08{p0}/{p1}\uFF09", { p0: k + 1, p1: files.length }));
    const p = (0, import_path4.join)(tmp, `part-${k}.wav`);
    await convertToWav16k(rt.ffmpeg, files[k].path, p, files[k].name, signal);
    parts.push(p);
  }
  const wav = (0, import_path4.join)(workDir, AUDIO_FILE);
  if (parts.length === 1) (0, import_fs4.renameSync)(parts[0], wav);
  else await concatWav16k(parts, wav);
  (0, import_fs4.rmSync)(tmp, { recursive: true, force: true });
  const info = readWavInfo(wav);
  const durationSec = Math.round(info.duration);
  if (info.duration < 0.5) throw new Error((0, import_i18n10.t)("\u5F55\u97F3\u592A\u77ED\uFF0C\u6CA1\u6709\u53EF\u8F6C\u5199\u7684\u5185\u5BB9"));
  checkAbort(signal);
  const slices = planSlices(frameEnergiesDb(wav, info, 10, { highPassHz: SLICE_HIGHPASS_HZ }));
  if (!slices.length) throw new Error((0, import_i18n10.t)("\u5F55\u97F3\u91CC\u6CA1\u6709\u68C0\u6D4B\u5230\u8BF4\u8BDD\u58F0\uFF08\u53EF\u80FD\u662F\u9759\u97F3\u6216\u97F3\u91CF\u592A\u5C0F\uFF09"));
  report("extract", 5, (0, import_i18n10.t)("\u97F3\u9891\u65F6\u957F {p0} \u5206\u949F\uFF0C\u6309\u505C\u987F\u5207\u6210 {p1} \u6BB5", { p0: Math.round(info.duration / 6) / 10, p1: slices.length }));
  if (!rt.python) throw new Error((0, import_i18n10.t)("\u627E\u4E0D\u5230\u672C\u5730\u8BED\u97F3\u8BC6\u522B\u8FD0\u884C\u65F6\uFF0C\u65E0\u6CD5\u8F6C\u5199\u5F55\u97F3"));
  const useCloud = input.asr === "cloud" && !!input.cloudAsr;
  const useAgent = useCloud || input.asr === "agent" && !!cfg.agentTranscribe;
  if (input.asr === "agent" && !cfg.agentTranscribe) report("transcribe", 6, (0, import_i18n10.t)("\u672A\u63A5\u5165 AI \u670D\u52A1\u8F6C\u5199\uFF0C\u6539\u7528\u672C\u673A\u8F6C\u5199"));
  const hasLocalAsr = !!(rt.whisperModel || rt.senseVoiceDir || rt.fireRedDir);
  if (!useAgent && !hasLocalAsr) throw new Error((0, import_i18n10.t)("\u672C\u5730\u8BED\u97F3\u8BC6\u522B\u6A21\u578B\u672A\u4E0B\u8F7D\uFF0C\u8BF7\u5230 \u914D\u7F6E\u5F15\u5BFC \u2192 \u8BED\u97F3\u6A21\u578B \u4E0B\u8F7D\u300C\u4F1A\u8BAE\u8F6C\u5199 \xB7 SenseVoice\u300D\u540E\u91CD\u8BD5"));
  const hasSpeakerModel = !!(rt.campp || rt.campp2);
  if (!hasSpeakerModel) report("transcribe", 6, (0, import_i18n10.t)("\u672A\u4E0B\u8F7D\u58F0\u7EB9\u8BC6\u522B\u6A21\u578B\uFF0C\u4E0D\u533A\u5206\u53D1\u8A00\u4EBA\uFF08\u5168\u90E8\u5F52\u4E3A S1\uFF0C\u8BF7\u4E3B\u6301\u4EBA\u5206\u914D\uFF09"));
  const names = input.attendees.map((p) => p.name).filter(Boolean);
  let lang = "zh";
  if (!useAgent) {
    report("transcribe", 6, (0, import_i18n10.t)("\u8BC6\u522B\u8BED\u79CD"));
    const sample = slices.slice().sort((a, b) => b.end - b.start - (a.end - a.start)).slice(0, 3);
    const detectArg = rt.detectModel || rt.whisperModel || (rt.senseVoiceDir ? asrModelArg("sensevoice", rt) : "");
    if (detectArg) {
      try {
        const d2 = await detectLanguage(workerSpecFor(rt, { asr: true, threads: 4, model: detectArg }), wav, sample, cfg.createWorker);
        if (d2.lang && d2.prob >= 0.5) lang = d2.lang;
      } catch {
      }
    }
    checkAbort(signal);
  }
  const pick = useAgent ? { engine: null } : pickMeetingAsrEngine(rt, input.asrModel ?? "auto", lang);
  if (!useAgent && !pick.engine) throw new Error((0, import_i18n10.t)("\u672C\u5730\u8BED\u97F3\u8BC6\u522B\u6A21\u578B\u672A\u4E0B\u8F7D\uFF0C\u8BF7\u5230 \u914D\u7F6E\u5F15\u5BFC \u2192 \u8BED\u97F3\u6A21\u578B \u4E0B\u8F7D\u300C\u4F1A\u8BAE\u8F6C\u5199 \xB7 SenseVoice\u300D\u540E\u91CD\u8BD5"));
  const engine = pick.engine;
  const asrArg = engine ? asrModelArg(engine, rt) : null;
  if (pick.note === "firered_low_mem") report("transcribe", 6, (0, import_i18n10.t)("\u8FD9\u53F0\u7535\u8111\u5185\u5B58\u4E0D\u8DB3 12GB\uFF0C\u672C\u6B21\u7528 SenseVoice \u8F6C\u5199\uFF08FireRedASR2 \u9700\u8981\u66F4\u591A\u5185\u5B58\uFF09"));
  if (pick.note === "pref_missing" && engine) report("transcribe", 6, (0, import_i18n10.t)("\u8BBE\u7F6E\u91CC\u9009\u7684\u8F6C\u5199\u6A21\u578B\u6CA1\u6709\u4E0B\u8F7D\uFF0C\u672C\u6B21\u6539\u7528 {p0}", { p0: asrEngineLabel(engine, rt) }));
  if (engine === "whisper" && rt.whisperDowngradedFrom) report("transcribe", 6, (0, import_i18n10.t)("\u672A\u4E0B\u8F7D {p0} \u6A21\u578B\uFF0C\u6539\u7528 {p1}\uFF08\u8BC6\u522B\u51C6\u786E\u7387\u4F1A\u4F4E\u4E00\u4E9B\uFF09", { p0: rt.whisperDowngradedFrom, p1: rt.whisperModel || "" }));
  const par = autoParallelism(useAgent ? null : asrArg, cfg.workers);
  const started = Date.now();
  let lastMilestone = 0;
  const onProgress = (done, total) => {
    const p = 8 + done / total * 74;
    const pct2 = Math.floor(done / total * 10);
    if (pct2 > lastMilestone && done < total) {
      lastMilestone = pct2;
      const elapsed = (Date.now() - started) / 1e3;
      const remain = Math.max(1, Math.round(elapsed / done * (total - done) / 60));
      report("transcribe", p, (0, import_i18n10.t)("\u5DF2\u5904\u7406 {p0}/{p1} \u6BB5\uFF0C\u9884\u8BA1\u8FD8\u9700\u7EA6 {p2} \u5206\u949F", { p0: done, p1: total, p2: remain }));
    } else report("transcribe", p);
  };
  report("transcribe", 8, useAgent ? useCloud ? (0, import_i18n10.t)("\u6B63\u5728\u8F6C\u5199\u4E0E\u63D0\u53D6\u58F0\u7EB9\uFF08\u5728\u7EBF\u63A5\u53E3 {p0} \u8F6C\u5199\uFF0C\u58F0\u7EB9\u5728\u672C\u673A\uFF09", { p0: input.cloudAsr?.model || "" }) : (0, import_i18n10.t)("\u6B63\u5728\u8F6C\u5199\u4E0E\u63D0\u53D6\u58F0\u7EB9\uFF08AI \u670D\u52A1\u8F6C\u5199\uFF09") : (0, import_i18n10.t)("\u6B63\u5728\u8F6C\u5199\u4E0E\u63D0\u53D6\u58F0\u7EB9\uFF08{p0} \u6A21\u578B\uFF0C{p1} \u4E2A\u8FDB\u7A0B\u5E76\u884C\uFF09", { p0: engine ? asrEngineLabel(engine, rt) : "", p1: par.workers }));
  let outs;
  const prompt = engine === "whisper" ? asrInitialPrompt(lang, names) : "";
  const beam = /large|medium/.test(rt.whisperModel || "") ? 1 : 3;
  if (useAgent) {
    const cloud = input.cloudAsr;
    const fn = useCloud && cloud ? (b64) => cloudTranscribe(cloud, Buffer.from(b64, "base64"), { signal }) : cfg.agentTranscribe;
    outs = await agentTranscribeAll(wav, slices, rt, par, signal, onProgress, fn, useCloud ? 3 : 2);
  } else {
    outs = await runSlices(workerSpecFor(rt, { asr: true, threads: par.threads, model: asrArg }), wav, slices, {
      workers: par.workers,
      asr: true,
      emb: hasSpeakerModel,
      lang,
      prompt,
      beam,
      batchCount: par.batch,
      signal,
      onProgress,
      createWorker: cfg.createWorker
    });
  }
  checkAbort(signal);
  const texts = outs.map((o) => cleanAsrText(o.text || "", names));
  const retry = useAgent ? [] : slices.map((_, i) => i).filter((i) => !outs[i].asrError && slices[i].speech >= RETRY_MIN_SPEECH_SEC && echoesPrompt(outs[i].text || "", prompt));
  if (retry.length) {
    report("transcribe", 82, (0, import_i18n10.t)("\u6709 {p0} \u6BB5\u53EA\u8BC6\u522B\u51FA\u4E86\u63D0\u793A\u8BED\uFF0C\u6B63\u5728\u4E0D\u5E26\u63D0\u793A\u91CD\u65B0\u8F6C\u5199", { p0: retry.length }));
    let rescued = 0;
    try {
      const again = await runSlices(workerSpecFor(rt, { asr: true, threads: par.threads, model: asrArg }), wav, retry.map((i) => slices[i]), {
        workers: par.workers,
        asr: true,
        emb: false,
        lang,
        prompt: "",
        beam,
        batchCount: par.batch,
        signal,
        createWorker: cfg.createWorker,
        onProgress: (d2, t) => report("transcribe", 82 + d2 / t * 6)
      });
      again.forEach((o, k) => {
        const i = retry[k];
        const t = cleanAsrText(o.text || "", names);
        if (!o.asrError && t.length > texts[i].length) {
          if (!texts[i]) rescued++;
          texts[i] = t;
        }
      });
    } catch (e) {
      if (e?.aborted || signal?.aborted) throw abortError();
    }
    report("transcribe", 88, (0, import_i18n10.t)("\u91CD\u65B0\u8F6C\u5199\u627E\u56DE {p0} \u6BB5\u53D1\u8A00", { p0: rescued }));
  }
  for (let i = 0; i < texts.length; i++) {
    const sl = String(outs[i]?.lang || "").toLowerCase();
    const effective = /^(zh|yue|cantonese|chinese|mandarin)/.test(sl) ? "zh" : /^[a-z]{2,3}$/.test(sl) ? sl : lang;
    texts[i] = simplifyZh(texts[i], effective);
  }
  const failed = outs.filter((o) => o.asrError).length;
  if (failed > slices.length / 2) {
    const why = outs.find((o) => o.asrError)?.asrError || "";
    throw new Error((0, import_i18n10.t)("\u8F6C\u5199\u5931\u8D25\u7684\u7247\u6BB5\u592A\u591A\uFF08{p0}/{p1}\uFF09\uFF0C\u8BF7\u91CD\u8BD5", { p0: failed, p1: slices.length }) + (why ? `\uFF1A${why}` : ""));
  }
  if (!texts.some(Boolean)) throw new Error((0, import_i18n10.t)("\u6CA1\u6709\u8BC6\u522B\u51FA\u4EFB\u4F55\u53D1\u8A00\uFF08\u5F55\u97F3\u53EF\u80FD\u662F\u9759\u97F3\u6216\u592A\u5608\u6742\uFF09"));
  report("transcribe", 88, (0, import_i18n10.t)("\u8F6C\u5199\u5B8C\u6210\uFF0C\u7528\u65F6 {p0} \u5206\u949F", { p0: Math.max(1, Math.round((Date.now() - started) / 6e4)) }));
  report("diarize", 89, (0, import_i18n10.t)("\u8BC6\u522B\u53D1\u8A00\u4EBA"));
  const attendeeIds = new Set(input.attendees.map((p) => p.id));
  const vps = (input.voiceprints || []).filter((v) => attendeeIds.has(v.personId) && (Array.isArray(v.vector) && v.vector.length || Array.isArray(v.vector2) && v.vector2.length));
  const d = diarize({
    slices: slices.map((s, i) => ({ start: s.start, end: s.end, speech: s.speech, emb: outs[i]?.emb || null, emb2: outs[i]?.emb2 || null })),
    voiceprints: vps.map((v) => ({ personId: v.personId, vector: v.vector, vector2: v.vector2, samples: v.extra })),
    threshold: input.threshold
  });
  const rawSegments = buildSegments(slices, texts, d.labels);
  const order = [];
  for (const s of rawSegments) if (!order.includes(s.speakerLabel)) order.push(s.speakerLabel);
  const relabel = new Map(order.map((l, k) => [l, `S${k + 1}`]));
  const segments = rawSegments.map((s) => ({ ...s, speakerLabel: relabel.get(s.speakerLabel) }));
  (0, import_fs4.mkdirSync)((0, import_path4.join)(workDir, CLIP_DIR), { recursive: true });
  const speakers = [];
  for (const old of order) {
    const sp = d.speakers.find((x) => x.label === old);
    const label = relabel.get(old);
    const slot = { label };
    if (sp.personId) {
      slot.personId = sp.personId;
      slot.matchedBy = "voiceprint";
      if (sp.score !== void 0) slot.score = sp.score;
    }
    const ranges = slices.filter((_, i) => d.labels[i] === old && texts[i]);
    const rep = sp.repSlice !== null ? slices[sp.repSlice] : void 0;
    try {
      const out = clipPathFor(workDir, label);
      if (cutClip(wav, rep && rep.end - rep.start >= 5 ? [rep] : ranges, out)) slot.clipPath = out;
    } catch {
    }
    speakers.push(slot);
  }
  const matched = speakers.filter((s) => s.personId).length;
  report("diarize", 92, (0, import_i18n10.t)("\u8BC6\u522B\u51FA {p0} \u4F4D\u53D1\u8A00\u4EBA\uFF0C\u5176\u4E2D {p1} \u4F4D\u5DF2\u6309\u58F0\u7EB9\u8BA4\u51FA", { p0: speakers.length, p1: matched }));
  return finish(input, segments, speakers, durationSec, report, 92);
}
async function agentTranscribeAll(wav, slices, rt, par, signal, onProgress, transcribe, concurrency = 2) {
  const cfg = pipelineConfig();
  const embs = rt.campp || rt.campp2 ? await runSlices(workerSpecFor(rt, { asr: false, threads: par.threads }), wav, slices, { workers: Math.min(2, par.workers), asr: false, emb: true, signal, createWorker: cfg.createWorker }) : slices.map((_, i) => ({ i }));
  const out = slices.map((_, i) => ({ ...embs[i], i }));
  let next = 0;
  let done = 0;
  const loop = async () => {
    while (next < slices.length) {
      checkAbort(signal);
      const i = next++;
      const s = slices[i];
      if (s.end - s.start < 0.3) {
        done++;
        continue;
      }
      try {
        const b64 = sliceWavBase64(wav, s);
        let r = await transcribe(b64);
        if (!r.ok && /429|太频繁|HTTP 5\d\d|超时/.test(r.error || "")) {
          await new Promise((res) => setTimeout(res, 2e3));
          checkAbort(signal);
          r = await transcribe(b64);
        }
        if (r.ok) out[i].text = r.text || "";
        else out[i].asrError = r.error || "failed";
      } catch (e) {
        out[i].asrError = String(e?.message || e);
      }
      done++;
      onProgress(done, slices.length);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => loop()));
  return out;
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/wecom.ts
var import_node_crypto2 = require("node:crypto");
var import_i18n11 = require("npm:@totalclaw/i18n");
var WECOM_API_BASE = "https://qyapi.weixin.qq.com/cgi-bin";
var TEXTCARD_LIMITS = { title: 128, description: 512, btntxt: 4, urlBytes: 2048 };
var MAX_TOUSER = 1e3;
var REQUEST_TIMEOUT_MS = 15e3;
var TOKEN_EARLY_MS = 5 * 60 * 1e3;
var CONCURRENCY = 4;
var TOKEN_INVALID_CODES = /* @__PURE__ */ new Set([40014, 42001]);
var FALLBACK_CODES = /* @__PURE__ */ new Set([48009, 48005]);
var SKIP_ONE_CODES = /* @__PURE__ */ new Set([60003, 60011, 60123, 60111, 40003, 60021, 60030, 92e3]);
var WecomApiError = class extends Error {
  constructor(message, errcode, errmsg, api) {
    super(message);
    this.errcode = errcode;
    this.errmsg = errmsg;
    this.api = api;
    this.name = "WecomApiError";
  }
};
function wecomErrorText(errcode, errmsg = "") {
  const ip = /from ip:\s*([0-9a-fA-F.:]+)/i.exec(errmsg)?.[1];
  switch (errcode) {
    case -1:
      return (0, import_i18n11.t)("\u4F01\u4E1A\u5FAE\u4FE1\u7CFB\u7EDF\u7E41\u5FD9\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
    case 40001:
    case 40091:
      return (0, import_i18n11.t)("Secret \u4E0D\u6B63\u786E\uFF1A\u8BF7\u786E\u8BA4\u586B\u7684\u662F\u8FD9\u4E2A\u81EA\u5EFA\u5E94\u7528\u7684 Secret\uFF08\u6CA1\u6709\u88AB\u91CD\u7F6E\uFF09\uFF0C\u4E14\u5E94\u7528\u6CA1\u6709\u505C\u7528");
    case 40013:
      return (0, import_i18n11.t)("CorpID \u4E0D\u6B63\u786E\uFF1A\u8BF7\u5230\u4F01\u4E1A\u5FAE\u4FE1\u7BA1\u7406\u540E\u53F0\u300C\u6211\u7684\u4F01\u4E1A \u2192 \u4F01\u4E1A\u4FE1\u606F\u300D\u5E95\u90E8\u590D\u5236\u4F01\u4E1A ID");
    case 41002:
      return (0, import_i18n11.t)("\u6CA1\u6709\u586B\u5199 CorpID");
    case 41004:
      return (0, import_i18n11.t)("\u6CA1\u6709\u586B\u5199 Secret");
    case 40014:
    case 42001:
      return (0, import_i18n11.t)("\u4F01\u4E1A\u5FAE\u4FE1\u8BBF\u95EE\u4EE4\u724C\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u8BD5");
    case 40056:
      return (0, import_i18n11.t)("AgentId \u4E0D\u6B63\u786E\uFF1A\u8BF7\u5230\u4F01\u4E1A\u5FAE\u4FE1\u7BA1\u7406\u540E\u53F0\u300C\u5E94\u7528\u7BA1\u7406 \u2192 \u672C\u5E94\u7528\u300D\u67E5\u770B AgentId");
    case 301002:
      return (0, import_i18n11.t)("AgentId \u4E0E Secret \u4E0D\u5C5E\u4E8E\u540C\u4E00\u4E2A\u5E94\u7528\uFF1A\u8BF7\u6838\u5BF9\u4E24\u8005\u90FD\u53D6\u81EA\u540C\u4E00\u4E2A\u81EA\u5EFA\u5E94\u7528");
    case 60020:
      return ip ? (0, import_i18n11.t)("\u672C\u673A\u51FA\u53E3 IP\uFF08{p0}\uFF09\u4E0D\u5728\u4F01\u4E1A\u53EF\u4FE1 IP \u4E2D\uFF1A\u8BF7\u5728\u4F01\u4E1A\u5FAE\u4FE1\u7BA1\u7406\u540E\u53F0\u300C\u5E94\u7528\u7BA1\u7406 \u2192 \u672C\u5E94\u7528 \u2192 \u4F01\u4E1A\u53EF\u4FE1 IP\u300D\u91CC\u52A0\u4E0A\u5B83\uFF0C\u7EA6 1 \u5206\u949F\u540E\u751F\u6548", { p0: ip }) : (0, import_i18n11.t)("\u672C\u673A\u51FA\u53E3 IP \u4E0D\u5728\u4F01\u4E1A\u53EF\u4FE1 IP \u4E2D\uFF1A\u8BF7\u5728\u4F01\u4E1A\u5FAE\u4FE1\u7BA1\u7406\u540E\u53F0\u300C\u5E94\u7528\u7BA1\u7406 \u2192 \u672C\u5E94\u7528 \u2192 \u4F01\u4E1A\u53EF\u4FE1 IP\u300D\u91CC\u52A0\u4E0A\u672C\u673A\u7684\u51FA\u53E3 IP\uFF0C\u7EA6 1 \u5206\u949F\u540E\u751F\u6548");
    case 48002:
      return (0, import_i18n11.t)("\u5E94\u7528\u6CA1\u6709\u8C03\u7528\u8FD9\u4E2A\u63A5\u53E3\u7684\u6743\u9650\uFF1A\u8BF7\u68C0\u67E5\u5E94\u7528\u7684\u901A\u8BAF\u5F55\u8BFB\u53D6\u6743\u9650\u4E0E\u63A5\u53E3\u6743\u9650");
    case 48008:
      return (0, import_i18n11.t)("\u5F53\u524D Secret \u53EA\u6709\u901A\u8BAF\u5F55\u7F16\u8F91\u6388\u6743\uFF0C\u4E0D\u80FD\u8BFB\u53D6\u901A\u8BAF\u5F55\u8BE6\u60C5\uFF1A\u8BF7\u6539\u7528\u81EA\u5EFA\u5E94\u7528\u7684 Secret");
    case 48009:
      return (0, import_i18n11.t)("\u4F01\u4E1A\u5FAE\u4FE1\u4E0D\u518D\u5141\u8BB8\u300C\u901A\u8BAF\u5F55\u540C\u6B65\u300DSecret \u4ECE\u65B0 IP \u8BFB\u53D6\u901A\u8BAF\u5F55\u8BE6\u60C5\uFF1A\u8BF7\u6539\u7528\u81EA\u5EFA\u5E94\u7528\u7684 Secret\uFF0C\u5E76\u628A\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u8BBE\u4E3A\u9700\u8981\u540C\u6B65\u7684\u90E8\u95E8");
    case 48001:
      return (0, import_i18n11.t)("\u8FD9\u4E2A\u63A5\u53E3\u529F\u80FD\u672A\u6388\u6743");
    case 48005:
      return (0, import_i18n11.t)("\u8FD9\u4E2A\u4F01\u4E1A\u5FAE\u4FE1\u63A5\u53E3\u5DF2\u505C\u7528");
    case 48006:
      return (0, import_i18n11.t)("\u5E94\u7528\u7684\u63A5\u53E3\u6743\u9650\u5DF2\u88AB\u6536\u56DE\uFF08\u5E94\u7528\u957F\u671F\u672A\u4F7F\u7528\uFF09\uFF1A\u8BF7\u7BA1\u7406\u5458\u5728\u540E\u53F0\u91CD\u65B0\u542F\u7528\u5E94\u7528");
    case 50003:
      return (0, import_i18n11.t)("\u5E94\u7528\u5DF2\u88AB\u7981\u7528\uFF1A\u8BF7\u5728\u4F01\u4E1A\u5FAE\u4FE1\u7BA1\u7406\u540E\u53F0\u542F\u7528\u8BE5\u5E94\u7528");
    case 60011:
      return (0, import_i18n11.t)("\u6CA1\u6709\u901A\u8BAF\u5F55\u6743\u9650\uFF1A\u8981\u8BFB\u53D6\u7684\u90E8\u95E8\u6216\u6210\u5458\u4E0D\u5728\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u5185\uFF0C\u8BF7\u628A\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u8BBE\u4E3A\u9700\u8981\u540C\u6B65\u7684\u90E8\u95E8");
    case 60021:
    case 60030:
    case 92e3:
      return (0, import_i18n11.t)("\u6210\u5458\u4E0D\u5728\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u5185\uFF1A\u8BF7\u6269\u5927\u5E94\u7528\u53EF\u89C1\u8303\u56F4");
    case 60003:
      return (0, import_i18n11.t)("\u90E8\u95E8\u4E0D\u5B58\u5728\uFF08\u53EF\u80FD\u5DF2\u88AB\u5220\u9664\u6216\u4E0D\u5728\u53EF\u89C1\u8303\u56F4\u5185\uFF09");
    case 60111:
      return (0, import_i18n11.t)("\u6210\u5458\u4E0D\u5B58\u5728\uFF08\u53EF\u80FD\u5DF2\u79BB\u804C\uFF0C\u6216\u4E0D\u5728\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u5185\uFF09");
    case 40003:
      return (0, import_i18n11.t)("\u6210\u5458 UserID \u65E0\u6548\uFF08\u53EF\u80FD\u5DF2\u79BB\u804C\u6216\u4E0D\u5728\u901A\u8BAF\u5F55\u4E2D\uFF09");
    case 81013:
      return (0, import_i18n11.t)("\u63A5\u6536\u4EBA\u5168\u90E8\u65E0\u6548\uFF1A\u53EF\u80FD\u5DF2\u79BB\u804C\uFF0C\u6216\u4E0D\u5728\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u5185");
    case 82001:
      return (0, import_i18n11.t)("\u6CA1\u6709\u53EF\u53D1\u9001\u7684\u63A5\u6536\u4EBA");
    case 45009:
      return (0, import_i18n11.t)("\u4F01\u4E1A\u5FAE\u4FE1\u63A5\u53E3\u8C03\u7528\u6B21\u6570\u8D85\u8FC7\u9650\u5236\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5");
    case 45033:
      return (0, import_i18n11.t)("\u4F01\u4E1A\u5FAE\u4FE1\u63A5\u53E3\u5E76\u53D1\u8C03\u7528\u8D85\u8FC7\u9650\u5236\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5");
    case 40058:
      return (0, import_i18n11.t)("\u8BF7\u6C42\u53C2\u6570\u4E0D\u5408\u6CD5\uFF1A{p0}", { p0: errmsg || String(errcode) });
    default:
      return (0, import_i18n11.t)("\u4F01\u4E1A\u5FAE\u4FE1\u8FD4\u56DE\u9519\u8BEF {p0}\uFF1A{p1}", { p0: errcode, p1: errmsg || "-" });
  }
}
var tokenCache = /* @__PURE__ */ new Map();
var tokenInflight = /* @__PURE__ */ new Map();
var str = (v) => v === void 0 || v === null ? "" : String(v);
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
var WecomClient = class {
  cfg;
  fetchImpl;
  cacheKey;
  constructor(cfg, fetchImpl) {
    this.cfg = { corpId: str(cfg?.corpId).trim(), agentId: str(cfg?.agentId).trim(), secret: str(cfg?.secret).trim() };
    this.fetchImpl = fetchImpl ?? ((...a) => globalThis.fetch(...a));
    this.cacheKey = (0, import_node_crypto2.createHash)("sha256").update(`${this.cfg.corpId}\0${this.cfg.secret}`).digest("hex");
  }
  /** 校验配置：能取到令牌、AgentId 与 Secret 属于同一个应用、本机 IP 在可信 IP 里 */
  async test() {
    try {
      this.checkConfig(true);
      const agent = await this.call(
        "agent/get",
        { query: { agentid: this.cfg.agentId } }
      );
      if (agent.close === 1) return { ok: false, error: wecomErrorText(50003), agentName: agent.name };
      const visible = (agent.allow_userinfos?.user?.length ?? 0) + (agent.allow_partys?.partyid?.length ?? 0) + (agent.allow_tags?.tagid?.length ?? 0);
      if (agent.allow_userinfos || agent.allow_partys || agent.allow_tags) {
        if (visible === 0) return { ok: false, error: (0, import_i18n11.t)("\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u4E3A\u7A7A\uFF1A\u8BF7\u5728\u4F01\u4E1A\u5FAE\u4FE1\u7BA1\u7406\u540E\u53F0\u628A\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u8BBE\u4E3A\u9700\u8981\u540C\u6B65\u7684\u90E8\u95E8"), agentName: agent.name };
      }
      return { ok: true, agentName: agent.name };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
  /** 全量拉通讯录：部门（上级、负责人顺序）、成员（主部门、职务、直属上级）。失败抛中文错误 */
  async fetchOrg() {
    this.checkConfig(false);
    const wxDepts = await this.fetchDepts();
    if (!wxDepts.length) throw new Error((0, import_i18n11.t)("\u6CA1\u6709\u8BFB\u5230\u4EFB\u4F55\u90E8\u95E8\uFF1A\u8BF7\u628A\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u8BBE\u4E3A\u9700\u8981\u540C\u6B65\u7684\u90E8\u95E8"));
    const users = await this.fetchUsers(wxDepts.map((d) => str(d.id)));
    const depts = wxDepts.map((d) => {
      const parent = str(d.parentid);
      return {
        id: str(d.id),
        name: d.name ? String(d.name) : str(d.id),
        ...parent && parent !== "0" ? { parentId: parent } : {},
        leaderIds: Array.isArray(d.department_leader) ? d.department_leader.map(String).filter(Boolean) : []
      };
    });
    const derived = /* @__PURE__ */ new Map();
    for (const u of users) {
      (u.department ?? []).forEach((dep, i) => {
        if (u.is_leader_in_dept?.[i] !== 1) return;
        const k = str(dep);
        const list = derived.get(k) ?? [];
        list.push({ id: u.userid, order: Number(u.order?.[i] ?? 0) || 0 });
        derived.set(k, list);
      });
    }
    for (const d of depts) {
      if (d.leaderIds.length) continue;
      const list = derived.get(d.id);
      if (list?.length) d.leaderIds = list.sort((a, b) => b.order - a.order || a.id.localeCompare(b.id)).map((x) => x.id);
    }
    const deptIds = new Set(depts.map((d) => d.id));
    const people = users.map((u) => {
      const ownDepts = (u.department ?? []).map(str).filter(Boolean);
      const main = str(u.main_department);
      const deptId = (main && (deptIds.has(main) || !ownDepts.length) ? main : "") || ownDepts.find((x) => deptIds.has(x)) || ownDepts[0] || "";
      const leader = Array.isArray(u.direct_leader) ? str(u.direct_leader[0]) : "";
      const p = { id: u.userid, name: u.name ? String(u.name) : u.userid, deptId, wecomUserId: u.userid };
      if (u.position) p.title = String(u.position);
      if (leader) p.leaderId = leader;
      return p;
    });
    return { depts, people };
  }
  /** 发 textcard 卡片。toUserIds 是企微 userid（'@all' = 应用可见范围内全员）。不抛错，失败在 error 里 */
  async sendCard(toUserIds, card) {
    try {
      this.checkConfig(true);
      const users = [...new Set(toUserIds.map((x) => str(x).trim()).filter(Boolean))];
      if (!users.length) return { ok: false, error: wecomErrorText(82001) };
      const url = str(card.url).trim();
      if (!/^https?:\/\//i.test(url)) return { ok: false, error: (0, import_i18n11.t)("\u5361\u7247\u94FE\u63A5\u9700\u8981\u4EE5 http:// \u6216 https:// \u5F00\u5934\uFF08\u8BF7\u5148\u5F00\u542F\u624B\u673A\u9875\u670D\u52A1\u6216\u914D\u7F6E\u5361\u7247\u8DF3\u8F6C\u5730\u5740\uFF09") };
      if (Buffer.byteLength(url, "utf8") > TEXTCARD_LIMITS.urlBytes) return { ok: false, error: (0, import_i18n11.t)("\u5361\u7247\u94FE\u63A5\u592A\u957F\uFF08\u8D85\u8FC7 2048 \u5B57\u8282\uFF09") };
      const textcard = {
        title: clipChars(str(card.title).trim() || " ", TEXTCARD_LIMITS.title),
        description: formatTextcardDescription(str(card.description)),
        url,
        btntxt: clipChars(str(card.btntxt).trim() || (0, import_i18n11.t)("\u8BE6\u60C5"), TEXTCARD_LIMITS.btntxt, "")
      };
      const chunks = users.includes("@all") ? [["@all"]] : [];
      if (!chunks.length) for (let i = 0; i < users.length; i += MAX_TOUSER) chunks.push(users.slice(i, i + MAX_TOUSER));
      const invalid = [];
      for (const chunk of chunks) {
        const r = await this.call("message/send", {
          method: "POST",
          body: { touser: chunk.join("|"), msgtype: "textcard", agentid: Number(this.cfg.agentId), textcard }
        });
        for (const s of [r.invaliduser, r.unlicenseduser]) if (s) invalid.push(...String(s).split("|").filter(Boolean));
      }
      return invalid.length ? { ok: true, invalidUsers: [...new Set(invalid)] } : { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
  // ── 内部 ───────────────────────────────────────────
  checkConfig(needAgent) {
    if (!this.cfg.corpId) throw new Error(wecomErrorText(41002));
    if (!this.cfg.secret) throw new Error(wecomErrorText(41004));
    if (needAgent && !/^\d+$/.test(this.cfg.agentId)) throw new Error((0, import_i18n11.t)("AgentId \u5E94\u4E3A\u6570\u5B57\uFF1A\u8BF7\u5230\u4F01\u4E1A\u5FAE\u4FE1\u7BA1\u7406\u540E\u53F0\u300C\u5E94\u7528\u7BA1\u7406 \u2192 \u672C\u5E94\u7528\u300D\u67E5\u770B"));
  }
  async fetchDepts() {
    try {
      const r = await this.call("department/list");
      return r.department ?? [];
    } catch (e) {
      if (!(e instanceof WecomApiError) || !FALLBACK_CODES.has(e.errcode)) throw e;
    }
    const ids = (await this.call("department/simplelist")).department_id ?? [];
    return mapLimit(ids, CONCURRENCY, async (d) => {
      try {
        const one = (await this.call("department/get", { query: { id: str(d.id) } })).department;
        return { ...d, ...one ?? {} };
      } catch (err) {
        if (err instanceof WecomApiError && SKIP_ONE_CODES.has(err.errcode)) return d;
        throw err;
      }
    });
  }
  async fetchUsers(deptIds) {
    const byId = /* @__PURE__ */ new Map();
    const add = (u) => {
      if (!u?.userid || u.status === 5) return;
      if (!byId.has(u.userid)) byId.set(u.userid, u);
    };
    try {
      const skipped = [];
      const lists = await mapLimit(deptIds, CONCURRENCY, async (id) => {
        try {
          return (await this.call("user/list", { query: { department_id: id } })).userlist ?? [];
        } catch (err) {
          if (err instanceof WecomApiError && SKIP_ONE_CODES.has(err.errcode)) {
            skipped.push(err);
            return null;
          }
          throw err;
        }
      });
      if (skipped.length && lists.every((l) => l === null)) throw skipped[0];
      for (const list of lists) for (const u of list ?? []) add(u);
      return [...byId.values()];
    } catch (e) {
      if (!(e instanceof WecomApiError) || !FALLBACK_CODES.has(e.errcode)) throw e;
    }
    const userIds = /* @__PURE__ */ new Set();
    let cursor = "";
    for (let page = 0; page < 1e3; page += 1) {
      const r = await this.call("user/list_id", {
        method: "POST",
        body: cursor ? { cursor, limit: 1e4 } : { limit: 1e4 }
      });
      for (const du of r.dept_user ?? []) if (du?.userid) userIds.add(du.userid);
      cursor = str(r.next_cursor);
      if (!cursor) break;
    }
    const users = await mapLimit([...userIds], CONCURRENCY, async (userid) => {
      try {
        return await this.call("user/get", { query: { userid } });
      } catch (err) {
        if (err instanceof WecomApiError && SKIP_ONE_CODES.has(err.errcode)) return null;
        throw err;
      }
    });
    for (const u of users) if (u) add(u);
    return [...byId.values()];
  }
  async token(force = false) {
    const now = Date.now();
    const hit = tokenCache.get(this.cacheKey);
    if (!force && hit && hit.expiresAt > now) return hit.token;
    const running = tokenInflight.get(this.cacheKey);
    if (running) return running;
    const p = (async () => {
      const r = await this.request("gettoken", "GET", {
        corpid: this.cfg.corpId,
        corpsecret: this.cfg.secret
      });
      if (!r.access_token) throw new WecomApiError((0, import_i18n11.t)("\u4F01\u4E1A\u5FAE\u4FE1\u6CA1\u6709\u8FD4\u56DE\u8BBF\u95EE\u4EE4\u724C"), -2, "", "gettoken");
      const ttlMs = Math.max(6e4, (Number(r.expires_in) || 7200) * 1e3 - TOKEN_EARLY_MS);
      tokenCache.set(this.cacheKey, { token: r.access_token, expiresAt: Date.now() + ttlMs });
      return r.access_token;
    })();
    tokenInflight.set(this.cacheKey, p);
    try {
      return await p;
    } finally {
      tokenInflight.delete(this.cacheKey);
    }
  }
  /** 带令牌调接口：令牌失效（42001 / 40014）时作废缓存、换新令牌重试一次 */
  async call(api, o = {}) {
    for (let attempt = 0; ; attempt += 1) {
      const token = await this.token(attempt > 0);
      try {
        return await this.request(api, o.method ?? "GET", { ...o.query ?? {}, access_token: token }, o.body);
      } catch (e) {
        if (attempt === 0 && e instanceof WecomApiError && TOKEN_INVALID_CODES.has(e.errcode)) {
          tokenCache.delete(this.cacheKey);
          continue;
        }
        throw e;
      }
    }
  }
  async request(api, method, query, body) {
    const qs = new URLSearchParams(query).toString();
    const url = `${WECOM_API_BASE}/${api}${qs ? `?${qs}` : ""}`;
    let res;
    try {
      res = await this.fetchImpl(url, {
        method,
        headers: body === void 0 ? void 0 : { "Content-Type": "application/json; charset=utf-8" },
        body: body === void 0 ? void 0 : JSON.stringify(body),
        signal: typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(REQUEST_TIMEOUT_MS) : void 0
      });
    } catch (e) {
      const reason = e?.name === "TimeoutError" ? (0, import_i18n11.t)("\u8BF7\u6C42\u8D85\u65F6") : str(e?.message) || "network";
      throw new WecomApiError((0, import_i18n11.t)("\u8FDE\u4E0D\u4E0A\u4F01\u4E1A\u5FAE\u4FE1\uFF08{p0}\uFF09\uFF1A\u8BF7\u68C0\u67E5\u672C\u673A\u7F51\u7EDC\uFF0C\u80FD\u5426\u8BBF\u95EE qyapi.weixin.qq.com", { p0: reason }), -2, reason, api);
    }
    if (!res.ok) throw new WecomApiError((0, import_i18n11.t)("\u4F01\u4E1A\u5FAE\u4FE1\u63A5\u53E3\u8FD4\u56DE HTTP {p0}", { p0: res.status }), -2, `HTTP ${res.status}`, api);
    let data;
    try {
      data = await res.json();
    } catch {
      throw new WecomApiError((0, import_i18n11.t)("\u4F01\u4E1A\u5FAE\u4FE1\u8FD4\u56DE\u7684\u5185\u5BB9\u65E0\u6CD5\u89E3\u6790"), -2, "bad json", api);
    }
    const code = Number(data?.errcode ?? 0);
    if (code !== 0) throw new WecomApiError(wecomErrorText(code, str(data?.errmsg)), code, str(data?.errmsg), api);
    return data;
  }
};
var HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
var escapeCardText = (s) => s.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c]);
function clipChars(s, max, ellipsis = "\u2026") {
  const cps = Array.from(s);
  if (cps.length <= max) return s;
  const keep = Math.max(0, max - Array.from(ellipsis).length);
  return cps.slice(0, keep).join("") + ellipsis;
}
var isCardMarkup = (s) => /<div\b[^>]*>|<br\s*\/?>/i.test(s);
function formatTextcardDescription(raw) {
  const max = TEXTCARD_LIMITS.description;
  const len = (s2) => Array.from(s2).length;
  const fromPlain = (plain) => plain.split("\n").map((l) => l.trim()).filter(Boolean).map(escapeCardText).join("<br>");
  const fitPlain = (plain) => {
    const whole = fromPlain(plain);
    if (len(whole) <= max) return whole || " ";
    const cps = Array.from(plain);
    let lo = 0;
    let hi = cps.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (len(fromPlain(cps.slice(0, mid).join(""))) + 1 <= max) lo = mid;
      else hi = mid - 1;
    }
    return `${fromPlain(cps.slice(0, lo).join(""))}\u2026`;
  };
  if (!isCardMarkup(raw)) return fitPlain(raw.replace(/\r\n?/g, "\n"));
  const s = raw.trim();
  if (len(s) <= max) return s;
  const blockRe = /<div\b[^>]*>[\s\S]*?<\/div>/gi;
  const blocks = s.match(blockRe) ?? [];
  if (blocks.length && !s.replace(blockRe, "").trim()) {
    const kept = [...blocks];
    while (kept.length > 1 && len(kept.join("")) > max) kept.pop();
    if (len(kept.join("")) <= max) return kept.join("");
  }
  const unescaped = s.replace(/<br\s*\/?>/gi, "\n").replace(/<\/div>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&(amp|lt|gt|quot);/g, (_, k) => ({ amp: "&", lt: "<", gt: ">", quot: '"' })[k] ?? "");
  return fitPlain(unescaped);
}
function diffOrg(prev, next) {
  const before = new Map((prev?.people ?? []).map((p) => [p.id, p]));
  const after = new Map((next?.people ?? []).map((p) => [p.id, p]));
  const added = [];
  const changed = [];
  const left = [];
  const norm3 = (v) => (v ?? "").trim();
  for (const [id, p] of after) {
    const old = before.get(id);
    if (!old || old.left) {
      added.push(id);
      continue;
    }
    if (norm3(old.name) !== norm3(p.name) || norm3(old.deptId) !== norm3(p.deptId) || norm3(old.title) !== norm3(p.title) || norm3(old.leaderId) !== norm3(p.leaderId) || norm3(old.wecomUserId) !== norm3(p.wecomUserId)) changed.push(id);
  }
  for (const [id, p] of before) if (!p.left && !after.has(id)) left.push(id);
  return { added, changed, left };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/notifier.ts
var import_i18n12 = require("npm:@totalclaw/i18n");
var LINE_MAX = 60;
var PLAN_LINES = 3;
function noticeTypeLabel(type) {
  switch (type) {
    case "speech_confirm":
      return (0, import_i18n12.t)("\u53D1\u8A00\u5F85\u786E\u8BA4");
    case "speech_remind":
      return (0, import_i18n12.t)("\u53D1\u8A00\u786E\u8BA4\u50AC\u529E");
    case "minutes_review":
      return (0, import_i18n12.t)("\u7EAA\u8981\u5F85\u7EC8\u5BA1");
    case "minutes_final":
      return (0, import_i18n12.t)("\u6B63\u5F0F\u7EAA\u8981\u5DF2\u751F\u6210");
    case "plan_confirm":
      return (0, import_i18n12.t)("\u6267\u884C\u65B9\u6848\u5F85\u786E\u8BA4");
    case "task_new":
      return (0, import_i18n12.t)("\u65B0\u4EFB\u52A1\u5F85\u63A5\u6536");
    case "task_progress_remind":
      return (0, import_i18n12.t)("\u8FDB\u5EA6\u66F4\u65B0\u63D0\u9192");
    case "task_due_remind":
      return (0, import_i18n12.t)("\u4EFB\u52A1\u5230\u671F\u63D0\u9192");
    case "task_overdue":
      return (0, import_i18n12.t)("\u4EFB\u52A1\u903E\u671F\u63D0\u9192");
    case "objection_review":
      return (0, import_i18n12.t)("\u5F02\u8BAE\u5F85\u590D\u6838");
    case "plan_adjusted":
      return (0, import_i18n12.t)("\u8C03\u6574\u540E\u65B9\u6848\u5F85\u786E\u8BA4");
    case "arbitration":
      return (0, import_i18n12.t)("\u5F02\u8BAE\u5F85\u88C1\u51B3");
    case "arbitration_result":
      return (0, import_i18n12.t)("\u88C1\u51B3\u7ED3\u679C");
    case "progress_report":
      return (0, import_i18n12.t)("\u8FDB\u5EA6\u6C47\u603B\u62A5\u544A");
    case "summary_review":
      return (0, import_i18n12.t)("\u603B\u7ED3\u62A5\u544A\u5F85\u5BA1\u6838");
    case "project_archived":
      return (0, import_i18n12.t)("\u9879\u76EE\u5DF2\u5F52\u6863");
    case "task_done":
      return (0, import_i18n12.t)("\u4EFB\u52A1\u5DF2\u5B8C\u6210");
    case "task_progress":
      return (0, import_i18n12.t)("\u4EFB\u52A1\u8FDB\u5EA6\u66F4\u65B0");
    default:
      return (0, import_i18n12.t)("\u901A\u77E5");
  }
}
function noticeButtonText(type) {
  switch (type) {
    case "speech_confirm":
    case "speech_remind":
    case "plan_confirm":
      return (0, import_i18n12.t)("\u53BB\u786E\u8BA4");
    case "minutes_review":
      return (0, import_i18n12.t)("\u53BB\u7EC8\u5BA1");
    case "task_new":
    case "plan_adjusted":
      return (0, import_i18n12.t)("\u53BB\u63A5\u6536");
    case "task_progress_remind":
    case "task_due_remind":
      return (0, import_i18n12.t)("\u53BB\u66F4\u65B0");
    case "objection_review":
      return (0, import_i18n12.t)("\u53BB\u590D\u6838");
    case "arbitration":
      return (0, import_i18n12.t)("\u53BB\u88C1\u51B3");
    case "summary_review":
      return (0, import_i18n12.t)("\u53BB\u5BA1\u6838");
    case "task_overdue":
    case "minutes_final":
    case "arbitration_result":
    case "progress_report":
    case "project_archived":
    case "task_done":
    case "task_progress":
    default:
      return (0, import_i18n12.t)("\u67E5\u770B");
  }
}
var splitLines = (s) => (s ?? "").split(/\r?\n/).map((l) => l.replace(/^\s*(?:[-*•·]\s+|\d{1,2}[.、)）]\s*(?!\d))/, "").trim()).filter(Boolean);
var splitSentences2 = (s) => s.split(/(?<=[。；;！？!?])/).map((x) => x.trim()).filter(Boolean);
function oneLine(summary) {
  const first = splitLines(summary)[0] ?? "";
  if (Array.from(first).length <= LINE_MAX) return first;
  const sentence = splitSentences2(first)[0] ?? first;
  return clipChars(sentence, LINE_MAX);
}
function bodyLines(n) {
  const lines = splitLines(n.summary);
  switch (n.type) {
    case "minutes_final": {
      const src = lines.length === 1 ? splitSentences2(lines[0]) : lines;
      return { lines: src.slice(0, 3).map((l) => clipChars(l, LINE_MAX)) };
    }
    case "plan_confirm":
    case "plan_adjusted":
    case "task_new": {
      if (lines.length <= PLAN_LINES) return { lines: lines.map((l) => clipChars(l, LINE_MAX)) };
      const head2 = lines.slice(0, PLAN_LINES - 1).map((l) => clipChars(l, LINE_MAX));
      return { lines: [...head2, (0, import_i18n12.t)("\u2026\u7B49\u5171 {p0} \u9879\u4EFB\u52A1", { p0: lines.length })] };
    }
    case "progress_report":
      return { lines: lines.slice(0, 2).map((l) => clipChars(l, LINE_MAX)), highlight: 0 };
    case "project_archived": {
      const extra = oneLine(n.summary);
      const fixed = (0, import_i18n12.t)("\u9879\u76EE\u5DF2\u5F52\u6863\uFF0C\u9879\u76EE\u5185\u5BB9\u8F6C\u4E3A\u53EA\u8BFB\uFF0C\u603B\u7ED3\u62A5\u544A\u53EF\u5728\u7CFB\u7EDF\u5185\u67E5\u770B");
      return { lines: extra && extra !== fixed ? [fixed, extra] : [fixed] };
    }
    case "task_overdue":
    case "task_due_remind": {
      const l = oneLine(n.summary);
      return { lines: l ? [l] : [], highlight: 0 };
    }
    default: {
      const l = oneLine(n.summary);
      return { lines: l ? [l] : [] };
    }
  }
}
function noticeCard(n, ctx) {
  const label = noticeTypeLabel(n.type);
  const { lines, highlight } = bodyLines(n);
  const blocks = [`<div class="gray">${escapeCardText(label)}</div>`];
  lines.forEach((l, i) => blocks.push(`<div class="${i === highlight ? "highlight" : "normal"}">${escapeCardText(l)}</div>`));
  const foot = ctx.footnote ? `<div class="gray">${escapeCardText(ctx.footnote)}</div>` : "";
  while (blocks.length > 1 && Array.from(blocks.join("") + foot).length > TEXTCARD_LIMITS.description) blocks.pop();
  const body = blocks.join("");
  const title = clipChars((n.title ?? "").trim() || label, TEXTCARD_LIMITS.title);
  return {
    title,
    description: Array.from(body + foot).length <= TEXTCARD_LIMITS.description ? body + foot : body,
    url: ctx.linkFor(n.to, n.link),
    btntxt: clipChars(noticeButtonText(n.type), TEXTCARD_LIMITS.btntxt, "")
  };
}
var pct = (v) => `${Math.round(Number.isFinite(v) ? v : 0)}%`;
var cardSummary = {
  /** 正式纪要：3 行摘要 */
  minutes(summaryLines) {
    return summaryLines.map((l) => l.trim()).filter(Boolean).slice(0, 3).join("\n");
  },
  /** 单个任务：任务名（截止 YYYY-MM-DD） */
  task(t) {
    return t.due ? (0, import_i18n12.t)("{p0}\uFF08\u622A\u6B62 {p1}\uFF09", { p0: t.title.trim(), p1: t.due }) : t.title.trim();
  },
  /** 执行方案：每项一行「任务名（截止 日期）」 */
  plan(items) {
    return items.map((t) => cardSummary.task(t)).join("\n");
  },
  /** 进度汇总报告：完成率 + 逾期数 */
  report(stats) {
    return (0, import_i18n12.t)("\u5B8C\u6210\u7387 {p0}\uFF08{p1}/{p2}\uFF09 \xB7 \u903E\u671F {p3} \u9879", { p0: pct(stats.completionRate), p1: stats.done, p2: stats.total, p3: stats.overdue });
  }
};

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/wecomWebhook.ts
var import_i18n13 = require("npm:@totalclaw/i18n");
var WEBHOOK_SEND_URL = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send";
var REQUEST_TIMEOUT_MS2 = 15e3;
var WEBHOOK_MARKDOWN_MAX_BYTES = 4096;
var WEBHOOK_TEXT_MAX_BYTES = 2048;
var WEBHOOK_PER_MINUTE = 20;
function normalizeWebhookUrl(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const keyRe = /^[A-Za-z0-9-]{16,64}$/;
  if (keyRe.test(s)) return `${WEBHOOK_SEND_URL}?key=${s}`;
  let u;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.hostname !== "qyapi.weixin.qq.com" || !/^\/cgi-bin\/webhook\/send\/?$/.test(u.pathname)) return null;
  const key2 = u.searchParams.get("key") || "";
  return keyRe.test(key2) ? `${WEBHOOK_SEND_URL}?key=${key2}` : null;
}
function maskWebhookUrl(url) {
  const key2 = /[?&]key=([^&]+)/.exec(url)?.[1] || "";
  return key2.length > 8 ? `\u2026key=${key2.slice(0, 4)}****${key2.slice(-4)}` : "";
}
function webhookErrorText(errcode, errmsg = "") {
  switch (errcode) {
    case 93e3:
      return (0, import_i18n13.t)("\u7FA4\u673A\u5668\u4EBA\u5730\u5740\u65E0\u6548\uFF1A\u53EF\u80FD\u673A\u5668\u4EBA\u5DF2\u88AB\u79FB\u51FA\u7FA4\u804A\uFF0C\u6216 key \u5DF2\u91CD\u7F6E\u3002\u8BF7\u5728\u7FA4\u804A\u300C\u6D88\u606F\u63A8\u9001\u300D\u91CC\u91CD\u65B0\u590D\u5236\u5730\u5740");
    case 45009:
      return (0, import_i18n13.t)("\u7FA4\u673A\u5668\u4EBA\u53D1\u9001\u592A\u9891\u7E41\uFF1A\u6BCF\u4E2A\u673A\u5668\u4EBA\u6BCF\u5206\u949F\u6700\u591A 20 \u6761\uFF0C\u8BF7\u7A0D\u540E\u5728\u63A8\u9001\u5931\u8D25\u8BB0\u5F55\u91CC\u91CD\u53D1");
    case 93004:
      return (0, import_i18n13.t)("\u7FA4\u673A\u5668\u4EBA\u6240\u5728\u7684\u7FA4\u5DF2\u89E3\u6563\u6216\u673A\u5668\u4EBA\u88AB\u505C\u7528");
    case 93008:
      return (0, import_i18n13.t)("\u4E0D\u5728\u7FA4\u91CC\uFF0C\u4E0D\u80FD\u53D1\u6D88\u606F\uFF08\u673A\u5668\u4EBA\u5DF2\u88AB\u79FB\u51FA\u7FA4\u804A\uFF09");
    case 40058:
      return (0, import_i18n13.t)("\u8BF7\u6C42\u53C2\u6570\u4E0D\u5408\u6CD5\uFF1A{p0}", { p0: errmsg || String(errcode) });
    case -1:
      return (0, import_i18n13.t)("\u4F01\u4E1A\u5FAE\u4FE1\u7CFB\u7EDF\u7E41\u5FD9\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
    default:
      return (0, import_i18n13.t)("\u4F01\u4E1A\u5FAE\u4FE1\u8FD4\u56DE\u9519\u8BEF {p0}\uFF1A{p1}", { p0: errcode, p1: errmsg || "-" });
  }
}
var utf8Bytes = (s) => Buffer.byteLength(s, "utf8");
function clipBytes(s, maxBytes) {
  if (utf8Bytes(s) <= maxBytes) return s;
  const cps = Array.from(s);
  let out = "";
  for (const c of cps) {
    if (utf8Bytes(out + c) + 3 > maxBytes) break;
    out += c;
  }
  return `${out}\u2026`;
}
var MD_LOOKALIKE = { "*": "\uFF0A", "`": "\uFF07", "[": "\uFF3B", "]": "\uFF3D", "<": "\uFF1C", ">": "\uFF1E", "#": "\uFF03" };
function escapeMarkdown(s) {
  return String(s ?? "").replace(/[*`[\]<>#]/g, (c) => MD_LOOKALIKE[c]).replace(/\s*\r?\n+\s*/g, " ").trim();
}
function lanLinkNote() {
  return (0, import_i18n13.t)("\u516C\u53F8\u5185\u7F51\u94FE\u63A5\uFF1A\u624B\u673A\u8FDE\u516C\u53F8 Wi-Fi \u624D\u80FD\u6253\u5F00\uFF0C\u7528 4G \u6253\u4E0D\u5F00");
}
function buildGroupMessage(i) {
  const real = i.mentions.filter((m) => m.mobile || m.userId);
  if (!real.length) return { msgtype: "markdown", content: groupMessageMarkdown(i) };
  const plain = (s) => String(s ?? "").replace(/\s*\r?\n+\s*/g, " ").trim();
  const rest = i.mentions.filter((m) => !m.mobile && !m.userId).map((m) => `@${plain(m.name)}`);
  const tail = [
    rest.length ? (0, import_i18n13.t)("\u8BF7 {p0} \u548C\u4E0B\u9762\u88AB\u63D0\u9192\u7684\u540C\u4E8B\u5904\u7406", { p0: rest.join(" ") }) : (0, import_i18n13.t)("\u8BF7\u4E0B\u9762\u88AB\u63D0\u9192\u7684\u540C\u4E8B\u5904\u7406"),
    i.url ? `${plain(i.buttonText)}\uFF1A${i.url}` : (0, import_i18n13.t)("\u8BF7\u5728\u7535\u8111\u7AEF\u6216\u624B\u673A\u9875\u5904\u7406"),
    i.url && i.lanOnly ? `\uFF08${lanLinkNote()}\uFF09` : ""
  ].filter(Boolean).join("\n");
  const head2 = `\u3010${plain(i.label)}\u3011${plain(i.title)}`;
  const room = WEBHOOK_TEXT_MAX_BYTES - utf8Bytes(head2) - utf8Bytes(tail) - 4;
  const summary = i.summary && room > 20 ? clipBytes(plain(i.summary), room) : "";
  return {
    msgtype: "text",
    content: clipBytes([head2, summary, tail].filter(Boolean).join("\n"), WEBHOOK_TEXT_MAX_BYTES),
    // 有手机号的按手机号 @（不怕账号填错），没有手机号才按账号
    mobiles: [...new Set(real.filter((m) => m.mobile).map((m) => m.mobile))],
    userIds: [...new Set(real.filter((m) => !m.mobile && m.userId).map((m) => m.userId))]
  };
}
function groupMessageMarkdown(i) {
  const who = i.mentions.map((m) => `@${escapeMarkdown(m.name)}`).join(" ");
  const head2 = `**\u3010${escapeMarkdown(i.label)}\u3011**${escapeMarkdown(i.title)}`;
  const tail = [
    who ? (0, import_i18n13.t)("\u8BF7 {p0} \u5904\u7406", { p0: who }) : "",
    i.url ? `[${escapeMarkdown(i.buttonText)}](${i.url})` : `<font color="comment">${(0, import_i18n13.t)("\u8BF7\u5728\u7535\u8111\u7AEF\u6216\u624B\u673A\u9875\u5904\u7406")}</font>`,
    i.url && i.lanOnly ? `<font color="comment">${lanLinkNote()}</font>` : ""
  ].filter(Boolean).join("\n");
  const room = WEBHOOK_MARKDOWN_MAX_BYTES - utf8Bytes(head2) - utf8Bytes(tail) - 8;
  const summary = i.summary ? escapeMarkdown(i.summary) : "";
  const quote = summary && room > 20 ? `> ${clipBytes(summary, room)}` : "";
  return clipBytes([head2, quote ? `${quote}
` : "", tail].filter(Boolean).join("\n"), WEBHOOK_MARKDOWN_MAX_BYTES);
}
var sentAt = /* @__PURE__ */ new Map();
var WecomWebhook = class {
  constructor(url, fetchImpl = fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), now = () => Date.now()) {
    this.url = url;
    this.fetchImpl = fetchImpl;
    this.sleep = sleep;
    this.now = now;
    this.key = /[?&]key=([^&]+)/.exec(url)?.[1] || url;
  }
  key;
  /** 发之前占一个名额：最近 60 秒满 20 条就等到最早那条过期（最多等 60 秒） */
  async takeSlot() {
    for (let i = 0; i < 3; i++) {
      const t = this.now();
      const list = (sentAt.get(this.key) || []).filter((x) => t - x < 6e4);
      if (list.length < WEBHOOK_PER_MINUTE) {
        list.push(t);
        sentAt.set(this.key, list);
        return;
      }
      sentAt.set(this.key, list);
      await this.sleep(Math.max(200, 6e4 - (t - list[0]) + 200));
    }
  }
  sendMarkdown(content) {
    return this.post({ msgtype: "markdown", markdown: { content: clipBytes(content, WEBHOOK_MARKDOWN_MAX_BYTES) } });
  }
  /** text 消息：按企微账号 / 手机号真 @ */
  sendText(content, mention = {}) {
    return this.post({
      msgtype: "text",
      text: {
        content: clipBytes(content, WEBHOOK_TEXT_MAX_BYTES),
        ...mention.userIds?.length ? { mentioned_list: mention.userIds } : {},
        ...mention.mobiles?.length ? { mentioned_mobile_list: mention.mobiles } : {}
      }
    });
  }
  send(m) {
    return m.msgtype === "text" ? this.sendText(m.content, { userIds: m.userIds, mobiles: m.mobiles }) : this.sendMarkdown(m.content);
  }
  async post(body) {
    await this.takeSlot();
    let res;
    try {
      res = await this.fetchImpl(this.url, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
        signal: typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(REQUEST_TIMEOUT_MS2) : void 0
      });
    } catch (e) {
      const reason = e?.name === "TimeoutError" ? (0, import_i18n13.t)("\u8BF7\u6C42\u8D85\u65F6") : String(e?.message || "network");
      return { ok: false, error: (0, import_i18n13.t)("\u8FDE\u4E0D\u4E0A\u4F01\u4E1A\u5FAE\u4FE1\uFF08{p0}\uFF09\uFF1A\u8BF7\u68C0\u67E5\u672C\u673A\u7F51\u7EDC\uFF0C\u80FD\u5426\u8BBF\u95EE qyapi.weixin.qq.com", { p0: reason }) };
    }
    if (!res.ok) return { ok: false, error: (0, import_i18n13.t)("\u4F01\u4E1A\u5FAE\u4FE1\u63A5\u53E3\u8FD4\u56DE HTTP {p0}", { p0: res.status }) };
    let data;
    try {
      data = await res.json();
    } catch {
      return { ok: false, error: (0, import_i18n13.t)("\u4F01\u4E1A\u5FAE\u4FE1\u8FD4\u56DE\u7684\u5185\u5BB9\u65E0\u6CD5\u89E3\u6790") };
    }
    const code = Number(data?.errcode ?? 0);
    return code === 0 ? { ok: true } : { ok: false, errcode: code, error: webhookErrorText(code, String(data?.errmsg ?? "")) };
  }
  /** 设置页「测试发送」 */
  test() {
    return this.sendMarkdown(`**${(0, import_i18n13.t)("\u6CF0\u9014\u4F1A\u8BAE\u667A\u80FD\u7BA1\u7406")}**
${(0, import_i18n13.t)("\u7FA4\u673A\u5668\u4EBA\u5DF2\u8FDE\u63A5\uFF1A\u4F1A\u8BAE\u7EAA\u8981\u786E\u8BA4\u3001\u4EFB\u52A1\u6D3E\u53D1\u3001\u8FDB\u5EA6\u63D0\u9192\u7B49\u901A\u77E5\u4F1A\u53D1\u5230\u8FD9\u4E2A\u7FA4\u91CC\u3002")}`);
  }
};

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/orgImport.ts
var import_node_crypto3 = require("node:crypto");
var import_i18n14 = require("npm:@totalclaw/i18n");
var COLS = {
  name: ["\u59D3\u540D", "\u540D\u5B57", "name"],
  userId: ["\u8D26\u53F7", "\u5E10\u53F7", "userid", "user id", "\u6210\u5458id", "\u4F01\u5FAE\u8D26\u53F7", "\u4F01\u4E1A\u5FAE\u4FE1\u8D26\u53F7"],
  mobile: ["\u624B\u673A\u53F7\u7801", "\u624B\u673A\u53F7", "\u624B\u673A", "mobile", "phone"],
  dept: ["\u6240\u5728\u90E8\u95E8", "\u90E8\u95E8\u540D\u79F0", "\u90E8\u95E8", "department"],
  title: ["\u804C\u52A1", "\u804C\u4F4D", "title", "position"],
  leader: ["\u76F4\u5C5E\u4E0A\u7EA7", "\u6C47\u62A5\u5BF9\u8C61", "\u4E0A\u7EA7"],
  isLeader: ["\u662F\u5426\u90E8\u95E8\u8D1F\u8D23\u4EBA", "\u90E8\u95E8\u8D1F\u8D23\u4EBA", "\u8EAB\u4EFD", "\u662F\u5426\u8D1F\u8D23\u4EBA"]
};
var YES = /^(是|上级|负责人|部门负责人|y|yes|true|1|√|✓)$/i;
var norm2 = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
var key = (v) => norm2(v).toLowerCase().replace(/[\s_（）()]/g, "");
var shortHash = (s) => (0, import_node_crypto3.createHash)("sha1").update(s).digest("hex").slice(0, 10);
function normalizeMobile(v) {
  let s = norm2(v).replace(/[\s\-()（）]/g, "").replace(/^00/, "+");
  const cn = /^(?:\+?86)(1\d{10})$/.exec(s);
  if (cn) s = cn[1];
  const m = /^(\+?\d{6,15})$/.exec(s);
  return m ? m[1] : "";
}
function normalizeWecomUserId(v) {
  const s = norm2(v);
  return /^[A-Za-z0-9_.@-]{1,64}$/.test(s) ? s : "";
}
function findHeader(rows) {
  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const cells = (rows[r] || []).map(key);
    const col = {};
    for (const k of Object.keys(COLS)) {
      const words = COLS[k].map(key);
      let idx = cells.findIndex((c) => words.includes(c));
      if (idx < 0) idx = cells.findIndex((c) => c && words.some((w) => c.includes(w)) && !(k === "dept" && /负责人|上级/.test(c)) && !(k === "leader" && /部门负责人/.test(c)));
      col[k] = idx;
    }
    if (col.name >= 0 && (col.userId >= 0 || col.dept >= 0 || col.mobile >= 0)) return { row: r, col };
  }
  return null;
}
function parseOrgTable(rows) {
  const header = findHeader(rows);
  if (!header) throw new Error((0, import_i18n14.t)("\u6CA1\u8BA4\u51FA\u8868\u5934\uFF1A\u8868\u683C\u91CC\u8981\u6709\u4E00\u884C\u5199\u7740\u300C\u59D3\u540D\u300D\uFF0C\u4EE5\u53CA\u300C\u8D26\u53F7\u300D\u300C\u90E8\u95E8\u300D\u300C\u624B\u673A\u300D\u4E2D\u7684\u81F3\u5C11\u4E00\u5217"));
  const { col } = header;
  const at = (row, k) => col[k] >= 0 ? norm2(row[col[k]]) : "";
  const warnings = [];
  const deptByPath = /* @__PURE__ */ new Map();
  const deptOf2 = (path) => {
    const p = path || (0, import_i18n14.t)("\u672A\u5206\u914D\u90E8\u95E8");
    let d = deptByPath.get(p);
    if (!d) {
      const parts = p.split(/[/／\\>＞]/).map((x) => x.trim()).filter(Boolean);
      d = { id: `d_${shortHash(p)}`, name: parts[parts.length - 1] || p, leaderIds: [] };
      deptByPath.set(p, d);
    }
    return d;
  };
  const people = [];
  const rawLeader = /* @__PURE__ */ new Map();
  const seen = /* @__PURE__ */ new Set();
  let badMobile = 0;
  for (const row of rows.slice(header.row + 1)) {
    if (!Array.isArray(row)) continue;
    const name = at(row, "name");
    if (!name) continue;
    const uid = normalizeWecomUserId(at(row, "userId"));
    const mobileRaw = at(row, "mobile");
    const mobile = normalizeMobile(mobileRaw);
    if (mobileRaw && !mobile) badMobile += 1;
    const id = uid || `p_${shortHash(`${name}|${mobile}`)}`;
    if (seen.has(id)) {
      warnings.push((0, import_i18n14.t)("\u300C{p0}\u300D\u5728\u8868\u91CC\u51FA\u73B0\u4E86\u4E0D\u6B62\u4E00\u6B21\uFF0C\u53EA\u53D6\u7B2C\u4E00\u884C", { p0: name }));
      continue;
    }
    seen.add(id);
    const deptPath = at(row, "dept").split(/[;；,，\n]/).map((x) => x.trim()).filter(Boolean)[0] || "";
    const dept = deptOf2(deptPath);
    const title = at(row, "title");
    people.push({ id, name, deptId: dept.id, ...title ? { title } : {}, ...uid ? { wecomUserId: uid } : {}, ...mobile ? { mobile } : {} });
    const leader = at(row, "leader");
    if (leader) rawLeader.set(id, leader.split(/[;；,，]/)[0].trim());
    if (YES.test(at(row, "isLeader"))) dept.leaderIds.push(id);
  }
  if (!people.length) throw new Error((0, import_i18n14.t)("\u8868\u683C\u91CC\u6CA1\u6709\u8BFB\u5230\u4EBA\u5458\uFF1A\u8868\u5934\u4E0B\u9762\u6BCF\u884C\u8981\u6709\u59D3\u540D"));
  const byUid = new Map(people.filter((p) => p.wecomUserId).map((p) => [p.wecomUserId, p.id]));
  const byName = /* @__PURE__ */ new Map();
  for (const p of people) byName.set(p.name, byName.has(p.name) ? null : p.id);
  for (const p of people) {
    const raw = rawLeader.get(p.id);
    if (!raw) continue;
    const lid = byUid.get(raw) ?? byName.get(raw) ?? null;
    if (lid && lid !== p.id) p.leaderId = lid;
  }
  const depts = [...deptByPath.values()];
  const noLeader = depts.filter((d) => !d.leaderIds.length).map((d) => d.name);
  if (noLeader.length) {
    warnings.push((0, import_i18n14.t)("{p0} \u4E2A\u90E8\u95E8\u6CA1\u6709\u6807\u8D1F\u8D23\u4EBA\uFF0C\u6D3E\u7ED9\u8FD9\u4E9B\u90E8\u95E8\u7684\u4EFB\u52A1\u6CA1\u4EBA\u63A5\u6536\uFF1A{p1}\u3002\u53EF\u5728\u8868\u91CC\u52A0\u4E00\u5217\u300C\u662F\u5426\u90E8\u95E8\u8D1F\u8D23\u4EBA\u300D\u586B\u300C\u662F\u300D\u540E\u91CD\u65B0\u5BFC\u5165", {
      p0: noLeader.length,
      p1: noLeader.slice(0, 8).join((0, import_i18n14.t)("\u3001")) + (noLeader.length > 8 ? "\u2026" : "")
    }));
  }
  if (badMobile) warnings.push((0, import_i18n14.t)("{p0} \u4E2A\u624B\u673A\u53F7\u683C\u5F0F\u4E0D\u5BF9\uFF0C\u5DF2\u5FFD\u7565\uFF08\u7FA4\u6D88\u606F\u6309\u624B\u673A\u53F7\u63D0\u9192\u4E0D\u5230\u8FD9\u4E9B\u4EBA\uFF09", { p0: badMobile }));
  const noMention = people.filter((p) => !p.wecomUserId && !p.mobile).length;
  if (noMention) warnings.push((0, import_i18n14.t)("{p0} \u4EBA\u65E2\u6CA1\u6709\u4F01\u5FAE\u8D26\u53F7\u4E5F\u6CA1\u6709\u624B\u673A\u53F7\uFF1A\u7FA4\u6D88\u606F\u91CC\u53EA\u80FD\u5199\u59D3\u540D\uFF0C\u63D0\u9192\u4E0D\u5230\u672C\u4EBA", { p0: noMention }));
  return { depts, people, warnings };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/service.ts
var import_spreadsheetRead = require("host:apps/desktop-shell/src/main/services/spreadsheetRead.ts");

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/setupCheck.ts
var import_node_os = require("node:os");
var import_node_fs2 = require("node:fs");
init_runtime();
var SPEAKER_INSTALL_ID = "speaker-campplus";
var MEETING_ASR_IDS = { firered: "asr-meeting-firered2", sensevoice: "asr-meeting-sensevoice" };
var ASR_SIZES_MB = { firered: 1178, sensevoice: 228 };
var BASE = { firered: { minPerHour: 12, coresUsed: 8 }, sensevoice: { minPerHour: 1.5, coresUsed: 12 } };
function detectHardware(modelsDir) {
  const list = (0, import_node_os.cpus)();
  const cpu = (list[0]?.model || "").replace(/\s+/g, " ").trim();
  let freeDiskGb = null;
  if (modelsDir) {
    try {
      const st = (0, import_node_fs2.statfsSync)(modelsDir);
      freeDiskGb = Math.round(st.bavail * st.bsize / 1024 ** 3 * 10) / 10;
    } catch {
      freeDiskGb = null;
    }
  }
  return {
    cpu,
    cores: list.length,
    memGb: Math.round((0, import_node_os.totalmem)() / 1024 ** 3 * 10) / 10,
    arch: process.arch,
    platform: process.platform,
    appleSilicon: process.platform === "darwin" && process.arch === "arm64",
    freeDiskGb
  };
}
function estimateMinPerHour(engine, hw) {
  const arg = engine === "firered" ? 'sherpa:{"kind":"fire_red_aed"}' : 'sherpa:{"kind":"sense_voice"}';
  const p = autoParallelism(arg, void 0, { cores: hw.cores, memGb: hw.memGb });
  const used = Math.max(1, Math.min(hw.cores, p.workers * p.threads));
  const factor = BASE[engine].coresUsed / used * (hw.appleSilicon ? 1 : 1.5);
  return { minutes: Math.max(1, Math.round(BASE[engine].minPerHour * factor)), workers: p.workers };
}
function recommendAsr(hw) {
  let downgradeReason;
  if (hw.memGb < 16) downgradeReason = "memory";
  else if (hw.cores < 8) downgradeReason = "cores";
  else if (hw.freeDiskGb !== null && hw.freeDiskGb < 3) downgradeReason = "disk";
  const engine = downgradeReason ? "sensevoice" : "firered";
  const est = estimateMinPerHour(engine, hw);
  const tier = downgradeReason ? hw.memGb < 8 || hw.cores < 4 ? "weak" : "ok" : "good";
  return {
    engine,
    installIds: engine === "firered" ? [MEETING_ASR_IDS.sensevoice, MEETING_ASR_IDS.firered] : [MEETING_ASR_IDS.sensevoice],
    sizeMb: engine === "firered" ? ASR_SIZES_MB.firered + ASR_SIZES_MB.sensevoice : ASR_SIZES_MB.sensevoice,
    estMinPerHour: est.minutes,
    workers: est.workers,
    tier,
    ...downgradeReason ? { downgradeReason } : {}
  };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/scheduler.ts
var ownersOf = (t) => Array.isArray(t.ownerIds) && t.ownerIds.length ? t.ownerIds : t.ownerId ? [t.ownerId] : [];
var MEETING_SCHEDULER_INTERVAL_MS = 10 * 60 * 1e3;
var MEETING_SCHEDULER_FIRST_TICK_MS = 30 * 1e3;
var DAILY_REMIND_HOUR = 9;
var QUIET_HOUR = 21;
var HOUR2 = 36e5;
var DAY2 = 864e5;
var TRACKED = /* @__PURE__ */ new Set(["not_started", "in_progress"]);
var TRACK_START_EVENTS = /* @__PURE__ */ new Set(["accepted", "arbitrate_keep", "arbitrate_adjust"]);
var pad2 = (n) => String(n).padStart(2, "0");
function localDay(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseDay(day) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec((day ?? "").trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const probe = new Date(y, mo - 1, d);
  if (probe.getFullYear() !== y || probe.getMonth() !== mo - 1 || probe.getDate() !== d) return null;
  return { y, m: mo, d };
}
function dayStartMs(day, offsetDays = 0) {
  const p = parseDay(day);
  return p ? new Date(p.y, p.m - 1, p.d + offsetDays).getTime() : NaN;
}
function daysUntil(day, nowMs) {
  const target = dayStartMs(day);
  if (!Number.isFinite(target)) return null;
  return Math.round((target - dayStartMs(localDay(nowMs))) / DAY2);
}
function param(v, def, min) {
  const n = Number(v);
  return Number.isFinite(n) && n >= min ? n : def;
}
function params(s) {
  return {
    confirmMs: param(s?.confirmTimeoutHours, MM_DEFAULT_SETTINGS.confirmTimeoutHours, 0.01) * HOUR2,
    dueDays: Math.floor(param(s?.dueRemindDays, MM_DEFAULT_SETTINGS.dueRemindDays, 0)),
    trackMs: param(s?.trackCycleDays, MM_DEFAULT_SETTINGS.trackCycleDays, 0.01) * DAY2,
    reportMs: param(s?.reportCycleDays, MM_DEFAULT_SETTINGS.reportCycleDays, 0.01) * DAY2
  };
}
var maxOf = (...xs) => xs.reduce((m, x) => typeof x === "number" && Number.isFinite(x) && x > m ? x : m, 0);
function dueReminders(s, now) {
  const hour = new Date(now).getHours();
  if (hour < DAILY_REMIND_HOUR || hour >= QUIET_HOUR) return [];
  const p = params(s.settings);
  const projectById = new Map((s.projects ?? []).map((x) => [x.id, x]));
  const archived = (projectId) => projectById.get(projectId)?.status === "archived";
  const out = [];
  for (const m of s.meetings ?? []) {
    if (m.status !== "pending_confirm" || archived(m.projectId)) continue;
    const startFallback = maxOf(m.process?.finishedAt, m.createdAt);
    for (const c of m.confirmations ?? []) {
      if (c.status !== "pending" || !c.personId) continue;
      const requestedAt = c.requestedAt;
      const start = maxOf(c.returnedAt, requestedAt) || startFallback;
      if (!start) continue;
      const last = maxOf(start, c.remindedAt);
      if (now - last >= p.confirmMs) {
        out.push({ kind: "speech_remind", meetingId: m.id, personId: c.personId, waitedHours: Math.floor((now - start) / HOUR2) });
      }
    }
  }
  const dailyOk = new Date(now).getHours() >= DAILY_REMIND_HOUR;
  const today = localDay(now);
  for (const t of s.tasks ?? []) {
    if (!TRACKED.has(t.status) || archived(t.projectId)) continue;
    const r = t.reminders ?? {};
    const left = daysUntil(t.due, now);
    const notifyAssignee = t.assigneeId ? [t.assigneeId] : [];
    if (left !== null && left < 0) {
      if (dailyOk && (!r.overdueAt || localDay(r.overdueAt) !== today)) {
        out.push({ kind: "task_overdue", taskId: t.id, notify: [.../* @__PURE__ */ new Set([...notifyAssignee, ...ownersOf(t)])], overdueDays: -left });
      }
      continue;
    }
    if (left !== null && left <= p.dueDays) {
      const windowStart = dayStartMs(t.due, -p.dueDays);
      if (!r.dueAt || r.dueAt < windowStart) {
        if (dailyOk) out.push({ kind: "task_due_remind", taskId: t.id, notify: notifyAssignee, daysLeft: left });
        continue;
      }
    }
    const trackStart = t.acceptedAt || maxOf(...(t.events ?? []).filter((e) => TRACK_START_EVENTS.has(e.action)).map((e) => e.at)) || t.createdAt;
    const lastProgress = maxOf(...(t.progressLog ?? []).map((x) => x.at));
    const last = maxOf(trackStart, lastProgress, r.weeklyAt, r.dueAt);
    if (last && now - last >= p.trackMs) out.push({ kind: "task_progress_remind", taskId: t.id, notify: notifyAssignee });
  }
  const tasksByProject = /* @__PURE__ */ new Map();
  for (const t of s.tasks ?? []) {
    const list = tasksByProject.get(t.projectId) ?? [];
    list.push(t);
    tasksByProject.set(t.projectId, list);
  }
  for (const pr of s.projects ?? []) {
    if (pr.status !== "active") continue;
    const tasks = tasksByProject.get(pr.id) ?? [];
    if (!tasks.length) continue;
    const reports = (pr.weeklyReports ?? []).filter((x) => x && Number.isFinite(x.generatedAt));
    const lastReport = reports.reduce((a, b) => !a || b.generatedAt > a.generatedAt ? b : a, void 0);
    const firstTaskAt = Math.min(...tasks.map((t) => t.createdAt).filter((x) => Number.isFinite(x)));
    const base = lastReport ? lastReport.generatedAt : maxOf(pr.createdAt, Number.isFinite(firstTaskAt) ? firstTaskAt : 0);
    if (!base || now - base < p.reportMs) continue;
    const notify = [...new Set([pr.ownerId, ...tasks.filter((t) => t.status !== "cancelled").flatMap((t) => ownersOf(t))].filter(Boolean))];
    out.push({
      kind: "weekly_report",
      projectId: pr.id,
      periodFrom: lastReport ? lastReport.periodTo ?? lastReport.generatedAt : pr.createdAt,
      periodTo: now,
      notify
    });
  }
  return out;
}
function startMeetingScheduler(tick, intervalMs = MEETING_SCHEDULER_INTERVAL_MS) {
  const every = Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : MEETING_SCHEDULER_INTERVAL_MS;
  let stopped = false;
  let running = false;
  let timer = null;
  const unref = (h) => {
    h?.unref?.();
  };
  const run = async () => {
    if (stopped || running) return;
    running = true;
    try {
      await tick();
    } catch {
    } finally {
      running = false;
    }
  };
  const first = setTimeout(() => {
    if (stopped) return;
    timer = setInterval(() => {
      void run();
    }, every);
    unref(timer);
    void run();
  }, Math.min(MEETING_SCHEDULER_FIRST_TICK_MS, every));
  unref(first);
  return () => {
    stopped = true;
    clearTimeout(first);
    if (timer) clearInterval(timer);
    timer = null;
  };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/mobile/server.ts
var import_node_crypto4 = require("node:crypto");
var import_node_fs3 = require("node:fs");
var import_node_path2 = require("node:path");
var import_node_zlib = require("node:zlib");
var import_lanServer = require("host:apps/desktop-shell/src/main/services/lanServer.ts");

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/mobile/text.ts
var import_brand = require("host:apps/desktop-shell/src/main/services/brand.ts");
var MM_MOBILE_TEXT = {
  appTitle: (0, import_brand.brandText)("\u6CF0\u9014\u4F1A\u8BAE\u667A\u80FD\u7BA1\u7406"),
  voiceTitle: "\u58F0\u7EB9\u91C7\u96C6",
  common: {
    loading: "\u52A0\u8F7D\u4E2D\u2026",
    retry: "\u91CD\u8BD5",
    back: "\u8FD4\u56DE",
    save: "\u4FDD\u5B58",
    cancel: "\u53D6\u6D88",
    ok: "\u786E\u5B9A",
    listSep: "\u3001",
    submit: "\u63D0\u4EA4",
    edit: "\u4FEE\u6539",
    close: "\u5173\u95ED",
    remove: "\u5220\u9664",
    empty: "\u6682\u65E0\u5185\u5BB9",
    all: "\u5168\u90E8",
    searchPlaceholder: "\u641C\u7D22",
    saved: "\u5DF2\u4FDD\u5B58",
    later: "\u7A0D\u540E\u518D\u8BF4",
    unknownPerson: "\u672A\u77E5\u4EBA\u5458",
    networkError: (0, import_brand.brandText)("\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF1A\u8BF7\u786E\u8BA4\u624B\u673A\u548C\u7535\u8111\u8FDE\u5728\u540C\u4E00\u4E2A\u5C40\u57DF\u7F51\uFF08Wi-Fi\uFF09\uFF0C\u5E76\u4E14\u7535\u8111\u4E0A\u7684 TotalClaw \u6CA1\u6709\u5173\u95ED"),
    serverError: "\u670D\u52A1\u51FA\u9519\u4E86\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5",
    tooMany: "\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u8BF7 1 \u5206\u949F\u540E\u518D\u8BD5",
    forbiddenAction: "\u624B\u673A\u7AEF\u4E0D\u652F\u6301\u8FD9\u4E2A\u64CD\u4F5C\uFF0C\u8BF7\u5728\u7535\u8111\u4E0A\u5904\u7406",
    badPath: "\u6587\u4EF6\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u4E0A\u4F20",
    badRequest: "\u8BF7\u6C42\u65E0\u6548",
    notFound: "\u5185\u5BB9\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664",
    tooLarge: "\u6587\u4EF6\u592A\u5927\uFF0C\u5355\u4E2A\u6587\u4EF6\u4E0A\u9650 {max}",
    emptyFile: "\u6587\u4EF6\u662F\u7A7A\u7684\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9",
    writeFailed: "\u4FDD\u5B58\u6587\u4EF6\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5",
    required: "\u8BF7\u586B\u5199{field}",
    days: "{n} \u5929",
    percent: "{n}%",
    viewAll: "\u5168\u90E8",
    more: "\u5C55\u5F00",
    less: "\u6536\u8D77"
  },
  expired: {
    title: "\u94FE\u63A5\u5DF2\u5931\u6548",
    body: "\u94FE\u63A5\u5DF2\u5931\u6548\uFF0C\u8BF7\u5728\u4F01\u5FAE\u91CC\u91CD\u65B0\u6253\u5F00",
    hint: "\u5982\u679C\u91CD\u65B0\u6253\u5F00\u540E\u4ECD\u7136\u63D0\u793A\u5931\u6548\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u91CD\u65B0\u53D1\u9001\u94FE\u63A5\u3002"
  },
  /** 群里的链接（不带个人令牌）：本机记着令牌就直接进，没有就提示先打开一次专属链接 */
  group: {
    title: (0, import_brand.brandText)("\u6CF0\u9014\u4F1A\u8BAE\u667A\u80FD\u7BA1\u7406"),
    opening: "\u6B63\u5728\u6253\u5F00\u2026",
    need: "\u8FD9\u662F\u53D1\u5728\u7FA4\u91CC\u7684\u94FE\u63A5\uFF0C\u9700\u8981\u5148\u8BA4\u51FA\u4F60\u662F\u8C01\u3002",
    how: "\u8BF7\u5148\u6253\u5F00\u4E00\u6B21\u4F60\u7684\u4E2A\u4EBA\u4E13\u5C5E\u94FE\u63A5\uFF08\u7535\u8111\u7AEF\u9996\u9875\u300C\u624B\u673A\u7AEF\u300D\u626B\u7801\uFF0C\u6216\u627E\u7BA1\u7406\u5458\u8981\uFF09\uFF0C\u4E4B\u540E\u7FA4\u91CC\u7684\u94FE\u63A5\u70B9\u5F00\u5C31\u80FD\u76F4\u63A5\u8FDB\u5165\u3002"
  },
  nav: { home: "\u9996\u9875", meetings: "\u4F1A\u8BAE", tasks: "\u4EFB\u52A1", projects: "\u9879\u76EE", me: "\u6211\u7684" },
  time: {
    justNow: "\u521A\u521A",
    minutesAgo: "{n} \u5206\u949F\u524D",
    today: "\u4ECA\u5929 {t}",
    yesterday: "\u6628\u5929 {t}",
    morning: "\u4E0A\u5348\u597D",
    noon: "\u4E2D\u5348\u597D",
    afternoon: "\u4E0B\u5348\u597D",
    evening: "\u665A\u4E0A\u597D",
    weekdays: "\u5468\u65E5,\u5468\u4E00,\u5468\u4E8C,\u5468\u4E09,\u5468\u56DB,\u5468\u4E94,\u5468\u516D"
  },
  meetingStatus: {
    pending_upload: "\u5F85\u4E0A\u4F20",
    processing: "\u5904\u7406\u4E2D",
    failed: "\u5904\u7406\u5931\u8D25",
    pending_assign: "\u5F85\u6307\u8BA4",
    pending_confirm: "\u5F85\u786E\u8BA4",
    pending_review: "\u5F85\u7EC8\u5BA1",
    finalized: "\u5DF2\u5B9A\u7A3F",
    ended: "\u5DF2\u7ED3\u675F",
    pending_owner: "\u5F85\u6307\u5B9A\u8D1F\u8D23\u4EBA",
    plan_confirm: "\u65B9\u6848\u5F85\u786E\u8BA4",
    dispatched: "\u5DF2\u6D3E\u53D1"
  },
  meetingSteps: "\u4E0A\u4F20,\u5904\u7406,\u53D1\u8A00\u786E\u8BA4,\u7EC8\u5BA1,\u5B9A\u7A3F,\u65B9\u6848,\u5DF2\u6D3E\u53D1",
  meetingSource: { offline: "\u7EBF\u4E0B\u4F1A\u8BAE", tencent: "\u817E\u8BAF\u4F1A\u8BAE", zoom: "Zoom" },
  processStage: {
    extract: "\u63D0\u53D6\u97F3\u8F68",
    transcribe: "\u8F6C\u5199",
    diarize: "\u8BC6\u522B\u53D1\u8A00\u4EBA",
    parse: "\u89E3\u6790\u6587\u5B57\u8BB0\u5F55",
    organize: "\u6574\u7406\u7EAA\u8981",
    done: "\u5904\u7406\u5B8C\u6210"
  },
  taskStatus: {
    to_accept: "\u5F85\u63A5\u6536",
    not_started: "\u672A\u5F00\u59CB",
    in_progress: "\u8FDB\u884C\u4E2D",
    done: "\u5DF2\u5B8C\u6210",
    cancelled: "\u5DF2\u53D6\u6D88"
  },
  objectionStage: {
    review: "\u5F02\u8BAE\u5904\u7406\u4E2D \xB7 \u5F85\u590D\u6838",
    dept_reply: "\u5F02\u8BAE\u5904\u7406\u4E2D \xB7 \u5F85\u90E8\u95E8\u56DE\u5E94",
    arbitration: "\u5F02\u8BAE\u5904\u7406\u4E2D \xB7 \u5F85\u88C1\u51B3",
    resolved: "\u5F02\u8BAE\u5DF2\u5904\u7406"
  },
  objectionKind: { objection: "\u5F02\u8BAE", change: "\u53D8\u66F4\u7533\u8BF7" },
  objectionTarget: { content: "\u4EFB\u52A1\u5185\u5BB9", time: "\u65F6\u95F4\u8282\u70B9", requirement: "\u6267\u884C\u8981\u6C42" },
  objectionOutcome: {
    adopted: "\u5DF2\u91C7\u7EB3\u5E76\u8C03\u6574",
    accepted_reject: "\u90E8\u95E8\u63A5\u53D7\u9A73\u56DE",
    kept: "\u88C1\u51B3\uFF1A\u7EF4\u6301\u539F\u65B9\u6848",
    adjusted: "\u88C1\u51B3\uFF1A\u6309\u5F02\u8BAE\u8C03\u6574",
    cancelled: "\u4EFB\u52A1\u5DF2\u5220\u9664"
  },
  projectStatus: { active: "\u8FDB\u884C\u4E2D", closing: "\u7ED3\u9879\u4E2D", archived: "\u5DF2\u5F52\u6863" },
  todoType: {
    assign_speaker: "\u5F85\u6307\u8BA4",
    confirm_speech: "\u53D1\u8A00\u786E\u8BA4",
    review_minutes: "\u7EAA\u8981\u7EC8\u5BA1",
    decide_tasks: "\u5B9A\u7A3F\u5F85\u9009\u62E9",
    assign_owner: "\u6307\u5B9A\u8D1F\u8D23\u4EBA",
    confirm_plan: "\u65B9\u6848\u786E\u8BA4",
    accept_task: "\u5F85\u63A5\u6536",
    update_progress: "\u66F4\u65B0\u8FDB\u5EA6",
    review_objection: "\u5F02\u8BAE\u590D\u6838",
    dept_reply: "\u5F02\u8BAE\u56DE\u5E94",
    arbitrate: "\u5F85\u88C1\u51B3",
    review_report: "\u62A5\u544A\u5BA1\u6838",
    retry_process: "\u5904\u7406\u5931\u8D25"
  },
  todoAction: {
    assign_speaker: "\u53BB\u6307\u8BA4",
    confirm_speech: "\u786E\u8BA4\u53D1\u8A00",
    review_minutes: "\u53BB\u7EC8\u5BA1",
    decide_tasks: "\u53BB\u9009\u62E9",
    assign_owner: "\u53BB\u6307\u5B9A",
    confirm_plan: "\u786E\u8BA4\u65B9\u6848",
    accept_task: "\u53BB\u63A5\u6536",
    update_progress: "\u66F4\u65B0\u8FDB\u5EA6",
    review_objection: "\u53BB\u590D\u6838",
    dept_reply: "\u53BB\u56DE\u5E94",
    arbitrate: "\u53BB\u88C1\u51B3",
    review_report: "\u53BB\u5BA1\u6838",
    retry_process: "\u53BB\u91CD\u8BD5"
  },
  noticeType: {
    speech_confirm: "\u53D1\u8A00\u5F85\u786E\u8BA4",
    speech_remind: "\u53D1\u8A00\u786E\u8BA4\u50AC\u529E",
    minutes_review: "\u7EAA\u8981\u5F85\u7EC8\u5BA1",
    minutes_final: "\u6B63\u5F0F\u7EAA\u8981\u5DF2\u751F\u6210",
    plan_confirm: "\u65B9\u6848\u5F85\u786E\u8BA4",
    task_new: "\u65B0\u4EFB\u52A1\u5F85\u63A5\u6536",
    task_progress_remind: "\u8FDB\u5EA6\u66F4\u65B0\u63D0\u9192",
    task_due_remind: "\u5230\u671F\u63D0\u9192",
    task_overdue: "\u903E\u671F\u63D0\u9192",
    objection_review: "\u5F02\u8BAE\u5F85\u590D\u6838",
    plan_adjusted: "\u8C03\u6574\u540E\u65B9\u6848\u5F85\u786E\u8BA4",
    arbitration: "\u5F85\u88C1\u51B3",
    arbitration_result: "\u88C1\u51B3\u7ED3\u679C",
    progress_report: "\u8FDB\u5EA6\u6C47\u603B\u62A5\u544A",
    summary_review: "\u603B\u7ED3\u62A5\u544A\u5F85\u5BA1\u6838",
    project_archived: "\u9879\u76EE\u5DF2\u5F52\u6863",
    task_done: "\u4EFB\u52A1\u5DF2\u5B8C\u6210",
    task_progress: "\u8FDB\u5EA6\u66F4\u65B0"
  },
  taskEvent: {
    created: "\u4E0B\u53D1\u4EFB\u52A1",
    accepted: "\u63A5\u6536\u4EFB\u52A1",
    progress: "\u66F4\u65B0\u8FDB\u5EA6",
    done: "\u6807\u8BB0\u5B8C\u6210",
    objection_raised: "\u63D0\u51FA\u5F02\u8BAE",
    review_adopt: "\u590D\u6838\uFF1A\u91C7\u7EB3\u5E76\u8C03\u6574",
    review_reject: "\u590D\u6838\uFF1A\u9A73\u56DE",
    reply_accept: "\u63A5\u53D7\u9A73\u56DE",
    escalated: "\u63D0\u4EA4\u88C1\u51B3",
    arbitrate_keep: "\u88C1\u51B3\uFF1A\u7EF4\u6301\u539F\u65B9\u6848",
    arbitrate_adjust: "\u88C1\u51B3\uFF1A\u6309\u5F02\u8BAE\u8C03\u6574",
    cancelled: "\u5220\u9664\u4EFB\u52A1",
    adjusted: "\u8C03\u6574\u4EFB\u52A1"
  },
  home: {
    title: (0, import_brand.brandText)("\u6CF0\u9014\u4F1A\u8BAE\u667A\u80FD\u7BA1\u7406"),
    greeting: "{hello}\uFF0C{name}",
    summary: "\u4ECA\u5929\u6709 {urgent} \u4EF6\u7D27\u6025\u3001{today} \u4EF6\u9700\u5728\u4ECA\u5929\u5B8C\u6210\u7684\u4E8B\u9879",
    summaryNone: "\u4ECA\u5929\u6CA1\u6709\u7D27\u6025\u4E8B\u9879",
    statTodos: "\u5F85\u5904\u7406",
    statDueToday: "\u4ECA\u65E5\u5230\u671F",
    statOverdue: "\u903E\u671F",
    statUnread: "\u672A\u8BFB\u901A\u77E5",
    todoTitle: "\u5F85\u6211\u5904\u7406",
    todoEmpty: "\u6CA1\u6709\u5F85\u5904\u7406\u4E8B\u9879",
    groupUrgent: "\u7D27\u6025",
    groupToday: "\u4ECA\u5929",
    groupWeek: "\u672C\u5468",
    filterMeeting: "\u4F1A\u8BAE",
    filterTask: "\u4EFB\u52A1",
    filterProject: "\u9879\u76EE",
    myTasks: "\u6211\u7684\u4EFB\u52A1 \xB7 \u672C\u5468\u622A\u6B62",
    myTasksEmpty: "\u672C\u5468\u6CA1\u6709\u622A\u6B62\u7684\u4EFB\u52A1",
    projects: "\u6211\u53C2\u4E0E\u7684\u9879\u76EE",
    recentMeetings: "\u6700\u8FD1\u4F1A\u8BAE",
    notices: "\u901A\u77E5",
    unreadBadge: "{n} \u672A\u8BFB",
    noPerson: "\u7CFB\u7EDF\u91CC\u6CA1\u6709\u627E\u5230\u4F60\u7684\u4FE1\u606F\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u540C\u6B65\u901A\u8BAF\u5F55"
  },
  notices: {
    title: "\u901A\u77E5",
    readAll: "\u5168\u90E8\u5DF2\u8BFB",
    empty: "\u6CA1\u6709\u901A\u77E5",
    unreadOnly: "\u53EA\u770B\u672A\u8BFB"
  },
  meetings: {
    title: "\u4F1A\u8BAE",
    filterAll: "\u5168\u90E8",
    filterTodo: "\u5F85\u6211\u5904\u7406",
    filterProcessing: "\u5904\u7406\u4E2D",
    filterFinal: "\u5DF2\u5B9A\u7A3F",
    create: "\u65B0\u5EFA\u4F1A\u8BAE",
    empty: "\u6CA1\u6709\u4F1A\u8BAE",
    needsMe: "\u5F85\u6211\u5904\u7406"
  },
  meeting: {
    title: "\u4F1A\u8BAE\u7EAA\u8981",
    host: "\u4E3B\u6301\u4EBA {name}",
    duration: "\u65F6\u957F {n} \u5206\u949F",
    attendees: "\u53C2\u4F1A {n} \u4EBA",
    summary: "\u6458\u8981",
    decisions: "\u51B3\u8BAE\u4E8B\u9879",
    transcript: "\u53D1\u8A00\u8BB0\u5F55",
    topicOther: "\u5176\u4ED6\u53D1\u8A00",
    confirmations: "\u53D1\u8A00\u4EBA\u786E\u8BA4\u60C5\u51B5",
    tasks: "\u5DF2\u4E0B\u53D1\u4EFB\u52A1",
    files: "\u4F1A\u8BAE\u6587\u4EF6",
    filterAllSegments: "\u5168\u90E8\u53D1\u8A00",
    filterMine: "\u53EA\u770B\u6211\u7684",
    mine: "\u6211\u7684\u53D1\u8A00",
    edited: "\u5DF2\u4FEE\u6539",
    original: "\u539F\u6587\uFF1A{text}",
    editSegment: "\u4FEE\u6539\u8FD9\u6BB5\u53D1\u8A00",
    editBtn: "\u4FEE\u6539",
    playSeg: "\u64AD\u653E\u8FD9\u6BB5\u539F\u58F0",
    pauseSeg: "\u6682\u505C",
    noAudio: "\u8FD9\u6BB5\u6CA1\u6709\u53EF\u64AD\u653E\u7684\u539F\u58F0",
    finalFixHint: "\u7EAA\u8981\u5DF2\u5B9A\u7A3F\uFF1B\u53D1\u73B0\u9519\u5B57\u53EF\u4EE5\u70B9\u300C\u4FEE\u6539\u300D\u4FEE\u6B63",
    segSaved: "\u5DF2\u4FDD\u5B58\u4FEE\u6539",
    confirmed: "\u5DF2\u786E\u8BA4",
    pending: "\u672A\u786E\u8BA4",
    returned: "\u5DF2\u9000\u56DE",
    remindedAt: "\u5DF2\u50AC\u529E",
    noSegments: "\u8FD8\u6CA1\u6709\u53D1\u8A00\u8BB0\u5F55",
    // 状态面板
    waitUpload: "\u7B49\u5F85\u4E3B\u6301\u4EBA\u4E0A\u4F20\u4F1A\u8BAE\u6587\u4EF6",
    uploadTitle: "\u4E0A\u4F20\u4F1A\u8BAE\u6587\u4EF6",
    uploadDesc: "\u652F\u6301\u5F55\u97F3\uFF08mp3 / m4a / wav / amr \u7B49\uFF09\u3001\u5F55\u5C4F\uFF08mp4 / mov \u7B49\uFF09\u548C\u6587\u5B57\u8BB0\u5F55\uFF08txt / docx / srt / vtt\uFF09\u3002\u53EF\u4EE5\u4E00\u6B21\u9009\u591A\u4E2A\u6587\u4EF6\u3002",
    uploadWifi: "\u5927\u6587\u4EF6\u5EFA\u8BAE\u8FDE\u63A5 Wi-Fi \u540E\u4E0A\u4F20\uFF1B\u4E0A\u4F20\u8FC7\u7A0B\u4E2D\u8BF7\u4E0D\u8981\u9501\u5C4F\u6216\u5207\u6362\u5230\u5176\u4ED6\u5E94\u7528\u3002",
    uploadPick: "\u9009\u62E9\u624B\u673A\u91CC\u7684\u6587\u4EF6",
    uploadStart: "\u5F00\u59CB\u4E0A\u4F20\u5E76\u5904\u7406",
    uploadCellular: "\u5F53\u524D\u4E0D\u662F Wi-Fi \u7F51\u7EDC\uFF0C\u8981\u4E0A\u4F20\u7684\u6587\u4EF6\u5171 {size}\uFF0C\u4F1A\u6D88\u8017\u624B\u673A\u6D41\u91CF\u3002\u7EE7\u7EED\u4E0A\u4F20\u5417\uFF1F",
    uploadTooBig: "\u300C{name}\u300D\u6709 {size}\uFF0C\u8D85\u8FC7\u5355\u4E2A\u6587\u4EF6\u4E0A\u9650 {max}",
    uploading: "\u6B63\u5728\u4E0A\u4F20 {i}/{n}\uFF1A{name}",
    uploadDone: "\u4E0A\u4F20\u5B8C\u6210\uFF0C\u5F00\u59CB\u5904\u7406",
    uploadFailed: "\u4E0A\u4F20\u5931\u8D25\uFF1A{msg}",
    processing: "\u6B63\u5728\u5904\u7406\uFF1A{stage}",
    processingHint: "\u5904\u7406\u9700\u8981\u4E00\u4E9B\u65F6\u95F4\uFF0C\u53EF\u4EE5\u5148\u79BB\u5F00\u8FD9\u4E2A\u9875\u9762\uFF0C\u5904\u7406\u5B8C\u6210\u540E\u4F1A\u901A\u77E5\u4F60\u3002",
    failed: "\u5904\u7406\u5931\u8D25",
    failedWait: "\u5904\u7406\u5931\u8D25\uFF0C\u7B49\u5F85\u4E3B\u6301\u4EBA\u91CD\u8BD5",
    retryBtn: "\u91CD\u65B0\u5904\u7406",
    retried: "\u5DF2\u91CD\u65B0\u5F00\u59CB\u5904\u7406",
    assignTitle: "\u6307\u8BA4\u53D1\u8A00\u4EBA",
    assignDesc: "\u6709 {n} \u4F4D\u53D1\u8A00\u4EBA\u6CA1\u6709\u8BC6\u522B\u51FA\u6765\u3002\u53EF\u4EE5\u8BD5\u542C\u7247\u6BB5\uFF0C\u518D\u4ECE\u53C2\u4F1A\u4EBA\u91CC\u9009\u62E9\u662F\u8C01\u3002",
    assignWait: "\u4E3B\u6301\u4EBA\u6B63\u5728\u6307\u8BA4\u53D1\u8A00\u4EBA",
    speakerLabel: "\u53D1\u8A00\u4EBA {label}",
    matchedVoice: "\u58F0\u7EB9\u8BC6\u522B {score}",
    matchedNick: "\u6309\u6635\u79F0\u5339\u914D",
    matchedManual: "\u4E3B\u6301\u4EBA\u6307\u8BA4",
    listen: "\u8BD5\u542C\u7247\u6BB5",
    clipUnavailable: "\u8FD9\u4F4D\u53D1\u8A00\u4EBA\u6CA1\u6709\u53EF\u8BD5\u542C\u7684\u7247\u6BB5",
    choosePerson: "\u9009\u62E9\u53C2\u4F1A\u4EBA",
    otherPerson: "\u5176\u4ED6\u4EBA\u2026",
    assignBtn: "\u786E\u5B9A",
    assigned: "\u5DF2\u6307\u8BA4",
    confirmProgress: "\u53D1\u8A00\u4EBA\u786E\u8BA4 {done}/{total}",
    confirmMine: "\u4F60\u6709 {n} \u6BB5\u53D1\u8A00\u5F85\u6838\u5BF9\uFF0C\u53EA\u80FD\u4FEE\u6539\u672C\u4EBA\u53D1\u8A00\uFF0C\u6838\u5BF9\u540E\u63D0\u4EA4\u786E\u8BA4\u3002",
    confirmMineNone: "\u8FD9\u573A\u4F1A\u8BAE\u6CA1\u6709\u8BC6\u522B\u5230\u4F60\u7684\u53D1\u8A00\uFF0C\u76F4\u63A5\u63D0\u4EA4\u786E\u8BA4\u5373\u53EF\u3002",
    confirmDoneMine: "\u4F60\u5DF2\u786E\u8BA4\u672C\u4EBA\u53D1\u8A00\uFF0C\u7B49\u5F85\u5176\u4ED6\u53D1\u8A00\u4EBA\u786E\u8BA4\u3002",
    confirmWait: "\u7B49\u5F85\u53D1\u8A00\u4EBA\u786E\u8BA4",
    returnedNote: "\u4E3B\u6301\u4EBA\u9000\u56DE\uFF1A{note}",
    submitConfirm: "\u63D0\u4EA4\u786E\u8BA4",
    submitConfirmAsk: "\u786E\u8BA4\u63D0\u4EA4\uFF1F\u63D0\u4EA4\u540E\u4E0D\u80FD\u518D\u4FEE\u6539\u672C\u4EBA\u53D1\u8A00\uFF08\u4E3B\u6301\u4EBA\u9000\u56DE\u65F6\u9664\u5916\uFF09\u3002",
    confirmedToast: "\u5DF2\u63D0\u4EA4\u786E\u8BA4",
    reviewTitle: "\u7EAA\u8981\u5F85\u4F60\u7EC8\u5BA1",
    reviewDesc: "\u5168\u90E8\u53D1\u8A00\u4EBA\u5DF2\u786E\u8BA4\u3002\u53EF\u4EE5\u9010\u6BB5\u4FEE\u6539\uFF0C\u6216\u628A\u67D0\u4F4D\u53D1\u8A00\u4EBA\u7684\u5185\u5BB9\u9000\u56DE\u7ED9\u4ED6\u91CD\u65B0\u786E\u8BA4\uFF0C\u6CA1\u95EE\u9898\u5C31\u5BA1\u6838\u901A\u8FC7\u3002",
    reviewWait: "\u7B49\u5F85\u4E3B\u6301\u4EBA\u7EC8\u5BA1",
    returnBtn: "\u9000\u56DE\u53D1\u8A00\u4EBA",
    returnTitle: "\u9000\u56DE\u7ED9\u53D1\u8A00\u4EBA",
    returnWho: "\u9000\u56DE\u7ED9\u8C01",
    returnNote: "\u9000\u56DE\u8BF4\u660E",
    returnNotePh: "\u4F8B\u5982\uFF1A\u8BF7\u6838\u5BF9\u9A8C\u8BC1\u65F6\u95F4",
    returnedToast: "\u5DF2\u9000\u56DE\uFF0C\u5DF2\u901A\u77E5\u53D1\u8A00\u4EBA",
    approveBtn: "\u5BA1\u6838\u901A\u8FC7",
    approveAsk: "\u5BA1\u6838\u901A\u8FC7\u540E\u7EAA\u8981\u5C06\u9501\u5B9A\u4E3A\u6B63\u5F0F\u7EAA\u8981\uFF0C\u5E76\u901A\u77E5\u5168\u4F53\u53C2\u4F1A\u4EBA\u3002\u786E\u5B9A\u5417\uFF1F",
    approvedToast: "\u7EAA\u8981\u5DF2\u5B9A\u7A3F",
    decideTitle: "\u7EAA\u8981\u5DF2\u5B9A\u7A3F",
    decideDesc: "\u662F\u5426\u6839\u636E\u4F1A\u8BAE\u51B3\u8BAE\u751F\u6210\u6267\u884C\u65B9\u6848\u548C\u4EFB\u52A1\uFF1F",
    decideGenerate: "\u751F\u6210\u4EFB\u52A1",
    decideNone: "\u65E0\u9700\u751F\u6210\u4EFB\u52A1",
    decideWait: "\u7EAA\u8981\u5DF2\u5B9A\u7A3F\uFF0C\u7B49\u5F85\u4E3B\u6301\u4EBA\u9009\u62E9\u662F\u5426\u751F\u6210\u4EFB\u52A1",
    generating: "AI \u6B63\u5728\u6839\u636E\u51B3\u8BAE\u751F\u6210\u6267\u884C\u65B9\u6848\u2026",
    endedDesc: "\u7EAA\u8981\u5DF2\u5B9A\u7A3F\uFF0C\u672C\u6B21\u4F1A\u8BAE\u65E0\u9700\u751F\u6210\u4EFB\u52A1\u3002",
    ownerTitle: "\u6307\u5B9A\u4EFB\u52A1\u8D1F\u8D23\u4EBA",
    ownerDesc: "AI \u5DF2\u751F\u6210\u6267\u884C\u65B9\u6848\uFF08{n} \u9879\uFF09\uFF0C\u8BF7\u6307\u5B9A\u4EFB\u52A1\u8D1F\u8D23\u4EBA\uFF0C\u7531\u4ED6\u786E\u8BA4\u65B9\u6848\u540E\u4E0B\u53D1\u3002",
    ownerBtn: "\u6307\u5B9A\u4EFB\u52A1\u8D1F\u8D23\u4EBA",
    ownerWait: "\u7B49\u5F85\u4E3B\u6301\u4EBA\u6307\u5B9A\u4EFB\u52A1\u8D1F\u8D23\u4EBA",
    ownerSet: "\u5DF2\u6307\u5B9A {name} \u4E3A\u4EFB\u52A1\u8D1F\u8D23\u4EBA",
    planMine: "\u6267\u884C\u65B9\u6848\u5F85\u4F60\u786E\u8BA4",
    planWait: "\u6267\u884C\u65B9\u6848\u5F85\u4EFB\u52A1\u8D1F\u8D23\u4EBA {name} \u786E\u8BA4",
    planGo: "\u53BB\u786E\u8BA4\u65B9\u6848",
    planView: "\u67E5\u770B\u6267\u884C\u65B9\u6848",
    dispatchedDesc: "\u65B9\u6848\u5DF2\u786E\u8BA4\uFF0C\u5DF2\u4E0B\u53D1 {n} \u9879\u4EFB\u52A1",
    sizeLabel: "{size}"
  },
  plan: {
    title: "\u6267\u884C\u65B9\u6848",
    owner: "\u4EFB\u52A1\u8D1F\u8D23\u4EBA\uFF1A{name}",
    ownerNone: "\u672A\u6307\u5B9A\u4EFB\u52A1\u8D1F\u8D23\u4EBA",
    summary: "\u65B9\u6848\u6982\u8FF0",
    items: "\u4EFB\u52A1\u6E05\u5355\uFF08{n} \u9879\uFF09",
    itemNo: "\u7B2C {n} \u9879",
    dept: "\u8D23\u4EFB\u90E8\u95E8",
    itemTitle: "\u6267\u884C\u4E8B\u9879",
    standard: "\u4EA4\u4ED8\u6807\u51C6",
    standardLine: "\u4EA4\u4ED8\u6807\u51C6\uFF1A{text}",
    due: "\u5B8C\u6210\u65F6\u95F4",
    addItem: "\u6DFB\u52A0\u4E00\u9879\u4EFB\u52A1",
    removeItem: "\u5220\u9664\u8FD9\u4E00\u9879",
    removeAsk: "\u5220\u9664\u8FD9\u4E00\u9879\u4EFB\u52A1\uFF1F",
    save: "\u4FDD\u5B58\u4FEE\u6539",
    confirm: "\u786E\u8BA4\u5E76\u4E0B\u53D1",
    confirmAsk: "\u786E\u8BA4\u540E\u5C06\u6309\u300C\u4E0B\u53D1\u7ED9\u300D\u628A\u4EFB\u52A1\u4E0B\u53D1\uFF0C\u65B9\u6848\u4E0D\u80FD\u518D\u4FEE\u6539\u3002\u786E\u5B9A\u5417\uFF1F",
    confirmedToast: "\u65B9\u6848\u5DF2\u786E\u8BA4\uFF0C\u4EFB\u52A1\u5DF2\u4E0B\u53D1",
    savedToast: "\u65B9\u6848\u5DF2\u4FDD\u5B58",
    editHint: "\u6BCF\u9879\u4EFB\u52A1\u53EA\u5BF9\u5E94\u4E00\u4E2A\u8D23\u4EFB\u90E8\u95E8\uFF1B\u53EF\u4EE5\u4FEE\u6539\u5185\u5BB9\u3001\u8BBE\u5B9A\u5B8C\u6210\u65F6\u95F4\u3001\u6539\u4E0B\u53D1\u7ED9\u8C01\u3001\u589E\u5220\u4EFB\u52A1\u3002",
    to: "\u4E0B\u53D1\u7ED9",
    toLine: "\u4E0B\u53D1\u7ED9\uFF1A{name}",
    toDefault: "{name}\uFF08\u90E8\u95E8\u8D1F\u8D23\u4EBA\uFF09",
    toPick: "\u9009\u62E9\u4E0B\u53D1\u7ED9\u8C01",
    toReset: "\u6539\u56DE\u90E8\u95E8\u8D1F\u8D23\u4EBA",
    toNoLeader: "\u90E8\u95E8\u6CA1\u6709\u8D1F\u8D23\u4EBA\uFF0C\u8BF7\u9009\u4EBA",
    toMissing: "\u7B2C {n} \u9879\u7684\u90E8\u95E8\u6CA1\u6709\u8D1F\u8D23\u4EBA\uFF0C\u8BF7\u9009\u62E9\u4E0B\u53D1\u7ED9\u8C01",
    readonly: "\u65B9\u6848\u53EA\u8BFB",
    none: "\u8FD8\u6CA1\u6709\u6267\u884C\u65B9\u6848",
    chooseDept: "\u8BF7\u9009\u62E9\u90E8\u95E8",
    itemInvalid: "\u7B2C {n} \u9879\u6CA1\u586B\u5B8C\u6574\uFF08\u90E8\u95E8\u3001\u6267\u884C\u4E8B\u9879\u3001\u5B8C\u6210\u65F6\u95F4\u90FD\u8981\u586B\uFF09",
    emptyItems: "\u81F3\u5C11\u8981\u6709\u4E00\u9879\u4EFB\u52A1"
  },
  tasks: {
    title: "\u4EFB\u52A1",
    viewReceived: "\u6211\u63A5\u6536\u7684",
    viewAssigned: "\u6211\u5206\u6D3E\u7684",
    viewAll: "\u5168\u90E8\u4EFB\u52A1",
    filterAll: "\u5168\u90E8\u72B6\u6001",
    filterOverdue: "\u903E\u671F",
    empty: "\u6CA1\u6709\u4EFB\u52A1"
  },
  task: {
    title: "\u4EFB\u52A1\u8BE6\u60C5",
    due: "\u622A\u6B62 {d}",
    overdue: "\u903E\u671F {n} \u5929",
    dept: "{dept} \xB7 \u90E8\u95E8\u8D1F\u8D23\u4EBA {name}",
    owner: "\u4EFB\u52A1\u8D1F\u8D23\u4EBA {name}",
    from: "\u6765\u81EA {meeting} \xB7 {project}",
    standard: "\u4EA4\u4ED8\u6807\u51C6",
    progress: "\u8FDB\u5EA6",
    progressLog: "\u8FDB\u5EA6\u8BB0\u5F55",
    events: "\u53D8\u66F4\u8BB0\u5F55",
    history: "\u5F02\u8BAE\u5386\u53F2",
    noLog: "\u8FD8\u6CA1\u6709\u8FDB\u5EA6\u8BB0\u5F55",
    objectionTitle: "\u5F53\u524D\u5206\u6B67\uFF1A{target}",
    raisedBy: "{name} \xB7 {kind}",
    reason: "\u7406\u7531\uFF1A{text}",
    suggestion: "\u5EFA\u8BAE\uFF1A{text}",
    suggestedDue: "\u5EFA\u8BAE\u622A\u6B62\uFF1A{d}",
    reviewBy: "{name} \xB7 {decision}",
    reviewAdopt: "\u91C7\u7EB3",
    reviewReject: "\u9A73\u56DE",
    duringObjection: "\u5F02\u8BAE\u5904\u7406\u671F\u95F4\u7167\u5E38\u8BA1\u65F6\uFF0C\u539F\u622A\u6B62\u65E5\u6709\u6548",
    // 按钮
    accept: "\u786E\u8BA4\u63A5\u6536",
    object: "\u63D0\u51FA\u5F02\u8BAE",
    updateProgress: "\u66F4\u65B0\u8FDB\u5EA6",
    complete: "\u6807\u8BB0\u5B8C\u6210",
    change: "\u7533\u8BF7\u53D8\u66F4",
    adopt: "\u91C7\u7EB3\u5E76\u8C03\u6574",
    reject: "\u9A73\u56DE",
    replyAccept: "\u63A5\u53D7\u9A73\u56DE",
    escalate: "\u63D0\u4EA4\u88C1\u51B3",
    keep: "\u7EF4\u6301\u539F\u65B9\u6848",
    adjust: "\u6309\u5F02\u8BAE\u8C03\u6574",
    // 表单
    acceptAsk: "\u786E\u8BA4\u63A5\u6536\u8FD9\u9879\u4EFB\u52A1\uFF1F",
    acceptedToast: "\u5DF2\u63A5\u6536\u4EFB\u52A1",
    statusLabel: "\u72B6\u6001",
    percentLabel: "\u8FDB\u5EA6 {n}%",
    noteLabel: "\u8FDB\u5EA6\u8BF4\u660E",
    notePh: "\u7B80\u5355\u8BF4\u660E\u505A\u5230\u4E86\u54EA\u4E00\u6B65",
    progressSaved: "\u5DF2\u66F4\u65B0\uFF0C\u5DF2\u901A\u77E5\u4EFB\u52A1\u8D1F\u8D23\u4EBA",
    completeAsk: "\u786E\u8BA4\u8FD9\u9879\u4EFB\u52A1\u5DF2\u5B8C\u6210\uFF1F\u5B8C\u6210\u540E\u4F1A\u901A\u77E5\u4EFB\u52A1\u8D1F\u8D23\u4EBA\u3002",
    completeNote: "\u5B8C\u6210\u8BF4\u660E\uFF08\u53EF\u4E0D\u586B\uFF09",
    completedToast: "\u5DF2\u6807\u8BB0\u5B8C\u6210",
    objectTitle: "\u63D0\u51FA\u5F02\u8BAE",
    changeTitle: "\u7533\u8BF7\u53D8\u66F4",
    targetLabel: "\u9488\u5BF9",
    reasonLabel: "\u7406\u7531",
    reasonPh: "\u8BF4\u660E\u4E3A\u4EC0\u4E48\u6709\u5F02\u8BAE",
    suggestionLabel: "\u5EFA\u8BAE",
    suggestionPh: "\u4F60\u7684\u5EFA\u8BAE\uFF08\u4F8B\u5982\u6539\u6210\u4EC0\u4E48\u5185\u5BB9 / \u4EC0\u4E48\u65F6\u95F4\uFF09",
    suggestedDueLabel: "\u5EFA\u8BAE\u7684\u65B0\u622A\u6B62\u65E5",
    raisedToast: "\u5DF2\u63D0\u4EA4\uFF0C\u7B49\u5F85\u4EFB\u52A1\u8D1F\u8D23\u4EBA\u590D\u6838",
    reviewTitle: "\u590D\u6838\u5F02\u8BAE",
    reviewNote: "\u590D\u6838\u8BF4\u660E",
    reviewNotePh: "\u8BF4\u660E\u91C7\u7EB3\u6216\u9A73\u56DE\u7684\u7406\u7531",
    changesTitle: "\u8C03\u6574\u5185\u5BB9\uFF08\u4E0D\u6539\u7684\u7559\u7A7A\uFF09",
    newTitle: "\u6267\u884C\u4E8B\u9879",
    newStandard: "\u4EA4\u4ED8\u6807\u51C6",
    newDue: "\u622A\u6B62\u65E5",
    cancelTask: "\u5220\u9664\u8FD9\u9879\u4EFB\u52A1\uFF08\u4EFB\u52A1\u53D8\u4E3A\u5DF2\u53D6\u6D88\uFF09",
    reviewedToast: "\u5DF2\u63D0\u4EA4\u590D\u6838\u7ED3\u679C",
    replyAsk: "\u4EFB\u52A1\u8D1F\u8D23\u4EBA\u9A73\u56DE\u4E86\u4F60\u7684\u5F02\u8BAE\u3002\u63A5\u53D7\u9A73\u56DE\u540E\u4EFB\u52A1\u56DE\u5230\u5F02\u8BAE\u524D\u7684\u72B6\u6001\uFF1B\u4E5F\u53EF\u4EE5\u63D0\u4EA4\u9879\u76EE\u8D1F\u8D23\u4EBA\u88C1\u51B3\u3002",
    replyAcceptAsk: "\u63A5\u53D7\u9A73\u56DE\uFF1F\u4EFB\u52A1\u5C06\u6309\u539F\u65B9\u6848\u6267\u884C\u3002",
    escalateAsk: "\u63D0\u4EA4\u9879\u76EE\u8D1F\u8D23\u4EBA\u88C1\u51B3\uFF1F",
    repliedToast: "\u5DF2\u63D0\u4EA4",
    arbitrateTitle: "\u88C1\u51B3",
    arbitrateNote: "\u88C1\u51B3\u8BF4\u660E",
    arbitrateNotePh: "\u8BF4\u660E\u88C1\u51B3\u7406\u7531\uFF08\u6700\u7EC8\u7ED3\u679C\uFF0C\u4F1A\u901A\u77E5\u53CC\u65B9\uFF09",
    arbitratedToast: "\u5DF2\u88C1\u51B3\uFF0C\u5DF2\u901A\u77E5\u4EFB\u52A1\u8D1F\u8D23\u4EBA\u548C\u90E8\u95E8\u8D1F\u8D23\u4EBA",
    sideDept: "\u90E8\u95E8\u8D1F\u8D23\u4EBA",
    sideOwner: "\u4EFB\u52A1\u8D1F\u8D23\u4EBA",
    cancelledNote: "\u4EFB\u52A1\u5DF2\u53D6\u6D88\uFF08\u7ED3\u9879\u65F6\u89C6\u540C\u5B8C\u6210\uFF09"
  },
  projects: {
    title: "\u9879\u76EE",
    create: "\u65B0\u5EFA\u9879\u76EE",
    empty: "\u6CA1\u6709\u9879\u76EE",
    rate: "\u5B8C\u6210 {done}/{total}",
    overdue: "\u903E\u671F {n}"
  },
  project: {
    title: "\u9879\u76EE\u8BE6\u60C5",
    owner: "\u9879\u76EE\u8D1F\u8D23\u4EBA {name}",
    statMeetings: "\u4F1A\u8BAE",
    statTasks: "\u4EFB\u52A1\u5B8C\u6210",
    statOverdue: "\u903E\u671F\u4EFB\u52A1",
    statObjections: "\u5904\u7406\u4E2D\u5F02\u8BAE",
    statWeek: "\u672C\u5468\u5B8C\u6210\u7387",
    meetingsN: "{n} \u573A",
    deptProgress: "\u5404\u90E8\u95E8\u8FDB\u5EA6",
    meetings: "\u4F1A\u8BAE",
    tasks: "\u4EFB\u52A1",
    decisions: "\u5173\u952E\u51B3\u7B56",
    reports: "\u8FDB\u5EA6\u6C47\u603B\u62A5\u544A",
    members: "\u9879\u76EE\u6210\u5458\uFF08{n}\uFF09",
    editMembers: "\u4FEE\u6539\u6210\u5458",
    membersSaved: "\u6210\u5458\u5DF2\u66F4\u65B0",
    createMeeting: "\u65B0\u5EFA\u4F1A\u8BAE",
    close: "\u53D1\u8D77\u7ED3\u9879",
    closeAsk: "\u53D1\u8D77\u7ED3\u9879\u4F1A\u5148\u68C0\u67E5\uFF1A\u4F1A\u8BAE\u90FD\u5DF2\u6D3E\u53D1\u6216\u7ED3\u675F\u3001\u4EFB\u52A1\u90FD\u5DF2\u5B8C\u6210\u6216\u53D6\u6D88\u3001\u6CA1\u6709\u5904\u7406\u4E2D\u7684\u5F02\u8BAE\u3002\u901A\u8FC7\u540E\u8FDB\u5165\u7ED3\u9879\u4E2D\uFF0C\u7531 AI \u751F\u6210\u603B\u7ED3\u62A5\u544A\u3002\u786E\u5B9A\u5417\uFF1F",
    closeOk: "\u7ED3\u9879\u68C0\u67E5\u901A\u8FC7\uFF0CAI \u6B63\u5728\u751F\u6210\u603B\u7ED3\u62A5\u544A",
    closeFail: "\u7ED3\u9879\u68C0\u67E5\u6CA1\u901A\u8FC7\uFF0C\u8FD8\u6709\u8FD9\u4E9B\u4E8B\u9879\u6CA1\u5B8C\u6210\uFF1A",
    blockers: "\u672A\u5B8C\u6210\u4E8B\u9879",
    summary: "\u9879\u76EE\u603B\u7ED3\u62A5\u544A",
    genReport: "\u751F\u6210\u8FDB\u5EA6\u62A5\u544A",
    genReportDone: "\u8FDB\u5EA6\u6C47\u603B\u62A5\u544A\u5DF2\u751F\u6210",
    closingNote: "\u9879\u76EE\u7ED3\u9879\u4E2D\uFF1A\u4E0D\u80FD\u65B0\u5EFA\u4F1A\u8BAE\u548C\u4EFB\u52A1",
    archivedNote: "\u9879\u76EE\u5DF2\u5F52\u6863\uFF08{d}\uFF09\uFF0C\u5168\u90E8\u53EA\u8BFB",
    noMeetings: "\u8FD8\u6CA1\u6709\u4F1A\u8BAE",
    noTasks: "\u8FD8\u6CA1\u6709\u4EFB\u52A1",
    noReports: "\u8FD8\u6CA1\u6709\u8FDB\u5EA6\u62A5\u544A",
    blockerKind: { meeting: "\u4F1A\u8BAE", task: "\u4EFB\u52A1", objection: "\u5F02\u8BAE" }
  },
  summary: {
    title: "\u9879\u76EE\u603B\u7ED3\u62A5\u544A",
    generating: "AI \u6B63\u5728\u751F\u6210\u603B\u7ED3\u62A5\u544A\uFF0C\u8BF7\u7A0D\u5019\u2026",
    none: "\u8FD8\u6CA1\u6709\u603B\u7ED3\u62A5\u544A",
    statRate: "\u5B8C\u6210\u7387",
    statTotal: "\u4EFB\u52A1\u603B\u6570",
    statOnTime: "\u6309\u671F\u5B8C\u6210",
    statLate: "\u5EF6\u671F\u5B8C\u6210",
    statCancelled: "\u5DF2\u53D6\u6D88",
    statOverdue: "\u903E\u671F",
    editHint: "\u53EF\u9010\u6BB5\u4FEE\u6539\uFF1B\u6570\u5B57\u4EE5\u7CFB\u7EDF\u7EDF\u8BA1\u4E3A\u51C6\u3002",
    regenerate: "\u91CD\u65B0\u751F\u6210",
    regenerateAsk: "\u91CD\u65B0\u751F\u6210\u4F1A\u8986\u76D6\u5F53\u524D\u5185\u5BB9\uFF08\u5305\u62EC\u4F60\u7684\u4FEE\u6539\uFF09\u3002\u786E\u5B9A\u5417\uFF1F",
    regenerating: "\u5DF2\u5F00\u59CB\u91CD\u65B0\u751F\u6210",
    approve: "\u5BA1\u6838\u901A\u8FC7\u5E76\u5F52\u6863",
    approveAsk: "\u5BA1\u6838\u901A\u8FC7\u540E\u9879\u76EE\u5C06\u5F52\u6863\u3001\u5168\u90E8\u53EA\u8BFB\uFF0C\u5E76\u901A\u77E5\u5168\u4F53\u9879\u76EE\u6210\u5458\u3002\u786E\u5B9A\u5417\uFF1F",
    approvedToast: "\u9879\u76EE\u5DF2\u5F52\u6863",
    approvedAt: "{name} \u4E8E {d} \u5BA1\u6838\u901A\u8FC7",
    editedAt: "\u6700\u540E\u4FEE\u6539 {d}"
  },
  report: {
    title: "\u8FDB\u5EA6\u6C47\u603B\u62A5\u544A",
    period: "{from} ~ {to}",
    rate: "\u5B8C\u6210\u7387",
    overdue: "\u903E\u671F",
    notFound: "\u627E\u4E0D\u5230\u8FD9\u4EFD\u62A5\u544A"
  },
  me: {
    title: "\u6211\u7684",
    admin: "\u7BA1\u7406\u5458",
    creator: "\u53EF\u65B0\u5EFA\u9879\u76EE",
    notices: "\u6211\u7684\u901A\u77E5",
    voiceprint: "\u58F0\u7EB9\u91C7\u96C6",
    voiceCollected: "\u5DF2\u91C7\u96C6",
    voiceMissing: "\u672A\u91C7\u96C6",
    voiceWithdraw: "\u64A4\u56DE\u58F0\u7EB9\u6388\u6743",
    voiceWithdrawAsk: "\u64A4\u56DE\u540E\u4F1A\u5220\u9664\u4F60\u7684\u58F0\u7EB9\uFF0C\u4F1A\u8BAE\u5F55\u97F3\u91CC\u5C06\u4E0D\u518D\u81EA\u52A8\u8BC6\u522B\u4F60\u7684\u53D1\u8A00\u3002\u786E\u5B9A\u5417\uFF1F",
    voiceWithdrawn: "\u5DF2\u64A4\u56DE\u58F0\u7EB9\u6388\u6743",
    about: (0, import_brand.brandText)("\u8FD9\u4E2A\u9875\u9762\u7531\u7535\u8111\u4E0A\u7684 TotalClaw \u901A\u8FC7\u5C40\u57DF\u7F51\u63D0\u4F9B\uFF0C\u624B\u673A\u9700\u8981\u548C\u90A3\u53F0\u7535\u8111\u8FDE\u5728\u540C\u4E00\u4E2A\u7F51\u7EDC\u91CC\u3002"),
    noPerson: "\u7CFB\u7EDF\u91CC\u6CA1\u6709\u627E\u5230\u4F60\u7684\u4FE1\u606F\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u540C\u6B65\u901A\u8BAF\u5F55"
  },
  newMeeting: {
    title: "\u65B0\u5EFA\u4F1A\u8BAE",
    project: "\u6240\u5C5E\u9879\u76EE",
    projectNone: "\u6CA1\u6709\u8FDB\u884C\u4E2D\u7684\u9879\u76EE",
    meetingTitle: "\u4F1A\u8BAE\u4E3B\u9898",
    meetingTitlePh: "\u4F8B\u5982\uFF1AA2 \u91CF\u4EA7\u5BFC\u5165\u7B2C 3 \u6B21\u5468\u4F8B\u4F1A",
    time: "\u4F1A\u8BAE\u65F6\u95F4",
    source: "\u4F1A\u8BAE\u6765\u6E90",
    host: "\u4E3B\u6301\u4EBA",
    attendees: "\u53C2\u4F1A\u4EBA\uFF08{n}\uFF09",
    pick: "\u9009\u62E9",
    submit: "\u521B\u5EFA\u4F1A\u8BAE",
    createdToast: "\u4F1A\u8BAE\u5DF2\u521B\u5EFA\uFF0C\u8BF7\u4E0A\u4F20\u4F1A\u8BAE\u6587\u4EF6"
  },
  newProject: {
    title: "\u65B0\u5EFA\u9879\u76EE",
    name: "\u9879\u76EE\u540D\u79F0",
    desc: "\u9879\u76EE\u8BF4\u660E",
    owner: "\u9879\u76EE\u8D1F\u8D23\u4EBA",
    members: "\u9879\u76EE\u6210\u5458\uFF08{n}\uFF09",
    submit: "\u521B\u5EFA\u9879\u76EE",
    createdToast: "\u9879\u76EE\u5DF2\u521B\u5EFA"
  },
  picker: {
    title: "\u9009\u62E9\u4EBA\u5458",
    search: "\u641C\u7D22\u59D3\u540D\u6216\u90E8\u95E8",
    selected: "\u5DF2\u9009 {n} \u4EBA",
    none: "\u6CA1\u6709\u627E\u5230"
  },
  voice: {
    title: "\u58F0\u7EB9\u91C7\u96C6",
    consentTitle: "\u58F0\u7EB9\u91C7\u96C6\u6388\u6743",
    consentIntro: "{name}\uFF0C\u4F60\u597D\uFF01\u4E3A\u4E86\u5728\u4F1A\u8BAE\u5F55\u97F3\u91CC\u81EA\u52A8\u8BC6\u522B\u4F60\u7684\u53D1\u8A00\uFF0C\u9700\u8981\u91C7\u96C6\u4E00\u6BB5\u4F60\u7684\u58F0\u97F3\u3002",
    purposeTitle: "\u91C7\u96C6\u7528\u9014",
    purpose: (0, import_brand.brandText)("\u53EA\u7528\u4E8E\u6CF0\u9014\u4F1A\u8BAE\u667A\u80FD\u7BA1\u7406\uFF1A\u5728\u4F60\u53C2\u52A0\u7684\u4F1A\u8BAE\u5F55\u97F3\u91CC\u8BC6\u522B\u54EA\u4E9B\u8BDD\u662F\u4F60\u8BF4\u7684\uFF0C\u751F\u6210\u4F1A\u8BAE\u7EAA\u8981\u540E\u7531\u4F60\u672C\u4EBA\u6838\u5BF9\u786E\u8BA4\u3002\u4F60\u786E\u8BA4\u8FC7\u7684\u4F1A\u8BAE\u53D1\u8A00\u4F1A\u7528\u6765\u8865\u5145\u4F60\u7684\u58F0\u7EB9\uFF08\u6700\u591A\u4FDD\u7559\u6700\u8FD1 5 \u6761\uFF09\uFF0C\u6362\u4E86\u9EA6\u514B\u98CE\u6216\u4F1A\u8BAE\u5BA4\u4E5F\u80FD\u8BA4\u51FA\u4F60\uFF1B\u53EF\u4EE5\u5728\u58F0\u7EB9\u5E93\u91CC\u5173\u6389\u3002"),
    scopeTitle: "\u4F7F\u7528\u8303\u56F4",
    scope: "\u58F0\u7EB9\u53EA\u548C\u4F60\u53C2\u52A0\u7684\u4F1A\u8BAE\u6BD4\u5BF9\uFF0C\u4E0D\u7528\u4E8E\u5176\u4ED6\u7528\u9014\uFF0C\u4E0D\u63D0\u4F9B\u7ED9\u7B2C\u4E09\u65B9\u3002\u6570\u636E\u4FDD\u5B58\u5728\u516C\u53F8\u5185\u90E8\u7535\u8111\u4E0A\u3002",
    storeTitle: "\u4FDD\u5B58\u65B9\u5F0F",
    store: "\u5F55\u97F3\u53EA\u7528\u6765\u63D0\u53D6\u58F0\u7EB9\u7279\u5F81\uFF0C\u63D0\u53D6\u540E\u5373\u5220\u9664\uFF0C\u7CFB\u7EDF\u91CC\u53EA\u4FDD\u5B58\u58F0\u7EB9\u7279\u5F81\u548C\u4F60\u7684\u6388\u6743\u8BB0\u5F55\u3002",
    withdrawTitle: "\u64A4\u56DE\u6388\u6743",
    withdraw: "\u53EF\u4EE5\u968F\u65F6\u5728\u300C\u6211\u7684 \u2192 \u64A4\u56DE\u58F0\u7EB9\u6388\u6743\u300D\u91CC\u64A4\u56DE\uFF0C\u64A4\u56DE\u540E\u58F0\u7EB9\u7ACB\u5373\u5220\u9664\u3002",
    agree: "\u6211\u5DF2\u9605\u8BFB\u5E76\u540C\u610F\u4EE5\u4E0A\u8BF4\u660E\uFF0C\u6388\u6743\u91C7\u96C6\u6211\u7684\u58F0\u7EB9",
    authorizer: "\u6388\u6743\u4EBA\uFF1A{name}{dept}",
    authTime: "\u6388\u6743\u65F6\u95F4\uFF1A{time}",
    authTimeLater: "\u6388\u6743\u65F6\u95F4\uFF1A\u63D0\u4EA4\u65F6\u81EA\u52A8\u8BB0\u5F55",
    start: "\u540C\u610F\u5E76\u5F00\u59CB\u5F55\u97F3",
    already: "\u4F60\u5DF2\u4E8E {time} \u91C7\u96C6\u8FC7\u58F0\u7EB9\uFF0C\u91CD\u65B0\u91C7\u96C6\u4F1A\u8986\u76D6\u539F\u6765\u7684\u3002",
    recordTitle: "\u5F55\u4E00\u6BB5 10~15 \u79D2\u7684\u58F0\u97F3",
    recordTip: "\u8BF7\u5728\u5B89\u9759\u7684\u5730\u65B9\uFF0C\u7528\u5E73\u65F6\u5F00\u4F1A\u8BF4\u8BDD\u7684\u97F3\u91CF\u548C\u8BED\u901F\uFF0C\u6717\u8BFB\u4E0B\u9762\u8FD9\u6BB5\u8BDD\uFF1A",
    script: "\u5927\u5BB6\u597D\uFF0C\u6211\u662F{dept}\u7684{name}\u3002\u8FD9\u662F\u6211\u7684\u58F0\u7EB9\u91C7\u96C6\u5F55\u97F3\uFF0C\u7528\u4E8E\u5728\u4F1A\u8BAE\u7EAA\u8981\u91CC\u81EA\u52A8\u8BC6\u522B\u6211\u7684\u53D1\u8A00\u3002\u6211\u4F1A\u7528\u5E73\u65F6\u5F00\u4F1A\u8BF4\u8BDD\u7684\u97F3\u91CF\u548C\u8BED\u901F\uFF0C\u628A\u8FD9\u6BB5\u8BDD\u5B8C\u6574\u5730\u8BFB\u5B8C\u3002",
    recStart: "\u5F00\u59CB\u5F55\u97F3",
    recStop: "\u505C\u6B62\u5F55\u97F3",
    recTimer: "{s} \u79D2",
    recTooShort: "\u5F55\u97F3\u4E0D\u8DB3 10 \u79D2\uFF0C\u5EFA\u8BAE\u91CD\u5F55",
    recAutoStop: "\u5DF2\u5230 15 \u79D2\uFF0C\u81EA\u52A8\u505C\u6B62",
    recNative: "\u7528\u624B\u673A\u5F55\u97F3\u673A\u5F55\u97F3",
    recPickFile: "\u9009\u62E9\u5DF2\u6709\u7684\u5F55\u97F3\u6587\u4EF6",
    recPickAudio: "\u9009\u62E9\u5F55\u597D\u7684\u5F55\u97F3\u6587\u4EF6",
    micDenied: "\u6CA1\u6709\u62FF\u5230\u9EA6\u514B\u98CE\u6743\u9650",
    httpNoMic: "\u5F53\u524D\u6253\u5F00\u7684\u662F\u516C\u53F8\u5185\u7F51\u7684 http \u5730\u5740\uFF0C\u624B\u673A\u6D4F\u89C8\u5668\u4E0D\u5141\u8BB8\u7F51\u9875\u76F4\u63A5\u5F55\u97F3\u3002",
    openHttps: "\u7528 https \u5730\u5740\u6253\u5F00\uFF08\u53EF\u4EE5\u76F4\u63A5\u5F55\u97F3\uFF09",
    micBlocked: "\u6CA1\u6709\u62FF\u5230\u9EA6\u514B\u98CE\u6743\u9650\uFF1A\u8BF7\u5728\u5F39\u7A97\u91CC\u5141\u8BB8\u4F7F\u7528\u9EA6\u514B\u98CE\u540E\u70B9\u4E0B\u9762\u91CD\u8BD5\uFF1B\u5728\u4F01\u4E1A\u5FAE\u4FE1\u91CC\u4E00\u76F4\u4E0D\u884C\u7684\u8BDD\uFF0C\u70B9\u53F3\u4E0A\u89D2\u300C\u2026\u300D\u9009\u300C\u5728\u6D4F\u89C8\u5668\u6253\u5F00\u300D\u3002",
    micRetry: "\u91CD\u65B0\u8BD5\u4E00\u4E0B\u9EA6\u514B\u98CE",
    recPickAudioHint: "\u4E5F\u53EF\u4EE5\u5148\u7528\u624B\u673A\u81EA\u5E26\u7684\u5F55\u97F3\uFF08iPhone\u300C\u8BED\u97F3\u5907\u5FD8\u5F55\u300D\u3001\u5B89\u5353\u300C\u5F55\u97F3\u673A\u300D\uFF09\u5F55 10~15 \u79D2\uFF0C\u5B58\u597D\u540E\u70B9\u4E0A\u9762\u9009\u62E9\u3002",
    reviewTitle: "\u8BD5\u542C\u5E76\u63D0\u4EA4",
    reviewTip: "\u5148\u542C\u4E00\u904D\uFF1A\u58F0\u97F3\u6E05\u695A\u3001\u6CA1\u6709\u660E\u663E\u6742\u97F3\uFF0C\u518D\u63D0\u4EA4\u3002",
    noPreview: "\u8FD9\u4E2A\u683C\u5F0F\u4E0D\u80FD\u5728\u6D4F\u89C8\u5668\u91CC\u8BD5\u542C\uFF0C\u53EF\u4EE5\u76F4\u63A5\u63D0\u4EA4",
    durationLabel: "\u5F55\u97F3\u65F6\u957F {s} \u79D2",
    tooShortLocal: "\u5F55\u97F3\u53EA\u6709 {s} \u79D2\uFF0C\u4E0D\u8DB3 10 \u79D2\uFF0C\u5EFA\u8BAE\u91CD\u5F55",
    rerecord: "\u91CD\u65B0\u5F55\u5236",
    submit: "\u63D0\u4EA4",
    uploading: "\u6B63\u5728\u4E0A\u4F20 {p}%",
    checking: "\u6B63\u5728\u6821\u9A8C\u5F55\u97F3\u8D28\u91CF\u2026",
    failTitle: "\u5F55\u97F3\u4E0D\u5408\u683C\uFF0C\u8BF7\u91CD\u5F55",
    doneTitle: "\u91C7\u96C6\u6210\u529F",
    doneBody: "{name}\uFF0C\u4F60\u7684\u58F0\u7EB9\u5DF2\u91C7\u96C6\u5B8C\u6210\u3002\u4E4B\u540E\u5728\u4F60\u53C2\u52A0\u7684\u4F1A\u8BAE\u5F55\u97F3\u91CC\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u8BC6\u522B\u4F60\u7684\u53D1\u8A00\u3002",
    doneSeconds: "\u6709\u6548\u8BED\u97F3 {s} \u79D2",
    backHome: (0, import_brand.brandText)("\u8FD4\u56DE\u6CF0\u9014\u4F1A\u8BAE\u667A\u80FD\u7BA1\u7406"),
    noPerson: "\u7CFB\u7EDF\u91CC\u6CA1\u6709\u627E\u5230\u4F60\u7684\u4FE1\u606F",
    noPersonHint: "\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u540C\u6B65\u901A\u8BAF\u5F55\u540E\uFF0C\u518D\u4ECE\u4F01\u5FAE\u91CC\u91CD\u65B0\u6253\u5F00\u8FD9\u4E2A\u94FE\u63A5\u3002"
  }
};
function mmText(path, vars) {
  let v = MM_MOBILE_TEXT;
  for (const k of path.split(".")) v = v && typeof v === "object" ? v[k] : void 0;
  if (typeof v !== "string") return path;
  return vars ? v.replace(/\{(\w+)\}/g, (_m, k) => vars[k] == null ? "" : String(vars[k])) : v;
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/mobile/styles.ts
var MM_MOBILE_CSS = String.raw`
:root{--pri:#5b5bf0;--pri2:#7c4dff;--priSoft:#eef0ff;--priLine:#d9dcff;--ink:#1f2329;--ink2:#4e5561;--ink3:#8f959e;
--bg:#f5f6fa;--card:#fff;--line:#eceef3;--bad:#e5484d;--badSoft:#fdeeee;--warn:#d97706;--warnSoft:#fdf3e2;
--good:#16a34a;--goodSoft:#e6f6ec;--radius:14px;--safeB:env(safe-area-inset-bottom)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0}
i{font-style:normal}
body{background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue","Microsoft YaHei","Noto Sans SC",sans-serif;-webkit-text-size-adjust:100%}
a{color:var(--pri);text-decoration:none}
button,input,select,textarea{font:inherit;color:inherit}
#app{max-width:640px;margin:0 auto;min-height:100vh}
.top{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:6px;height:48px;padding:0 8px;background:rgba(245,246,250,.94);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.top h1{flex:1;margin:0;font-size:17px;font-weight:600;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.top .side{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:0;background:none;font-size:22px;color:var(--ink2);position:relative;cursor:pointer}
.top .side .dot{position:absolute;top:3px;left:calc(50% + 3px);box-sizing:border-box;font-style:normal;min-width:16px;height:16px;padding:0 4px;border-radius:8px;box-shadow:0 0 0 2px var(--bg);background:var(--bad);color:#fff;font-size:10px;line-height:1;font-weight:700;display:inline-flex;align-items:center;justify-content:center;text-align:center;font-variant-numeric:tabular-nums}
.page{padding:12px 14px calc(96px + var(--safeB))}
.page.with-bar{padding-bottom:calc(150px + var(--safeB))}
.card{background:var(--card);border-radius:var(--radius);padding:14px;margin-bottom:12px;box-shadow:0 1px 2px rgba(20,24,40,.04)}
.card h2{margin:0 0 10px;font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px}
.card h2 .r{margin-left:auto;font-size:13px;font-weight:500;color:var(--pri)}
.sec-t{margin:16px 2px 8px;font-size:13px;font-weight:700;color:var(--ink2);display:flex;align-items:center;gap:6px}
.sec-t .n{color:var(--ink3);font-weight:500}
.muted{color:var(--ink3);font-size:13px}
.small{font-size:12.5px}
.ink2{color:var(--ink2)}
.bad{color:var(--bad)}.warn{color:var(--warn)}.good{color:var(--good)}.pri{color:var(--pri)}
.row{display:flex;align-items:center;gap:8px}
.row.wrap{flex-wrap:wrap}
.grow{flex:1;min-width:0}
.ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tag{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:6px;font-size:12px;font-weight:600;background:var(--priSoft);color:var(--pri);white-space:nowrap}
.tag.gray{background:#f0f1f4;color:var(--ink2)}.tag.bad{background:var(--badSoft);color:var(--bad)}
.tag.warn{background:var(--warnSoft);color:var(--warn)}.tag.good{background:var(--goodSoft);color:var(--good)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:8px 16px;border-radius:10px;border:1px solid var(--priLine);background:var(--priSoft);color:var(--pri);font-size:14.5px;font-weight:600;cursor:pointer;text-align:center}
.btn.pri{background:linear-gradient(90deg,var(--pri),var(--pri2));border-color:transparent;color:#fff}
.btn.ghost{background:#fff;border-color:var(--line);color:var(--ink)}
.btn.danger{background:#fff;border-color:#f4c7c8;color:var(--bad)}
.btn.sm{min-height:32px;padding:4px 12px;font-size:13px;border-radius:8px}
.btn.block{display:flex;width:100%}
.btn:disabled,.btn[aria-busy=true]{opacity:.5;pointer-events:none}
.linkbtn{border:0;background:none;color:var(--pri);padding:4px 0;font-size:13.5px;font-weight:600;cursor:pointer}
.bar{position:fixed;left:0;right:0;bottom:0;z-index:25;background:#fff;border-top:1px solid var(--line);padding:10px 14px calc(10px + var(--safeB))}
.bar-in{max-width:612px;margin:0 auto;display:flex;flex-wrap:wrap;gap:10px}
.bar-in .btn{flex:1;min-width:30%}
.bar-note{max-width:612px;margin:0 auto 8px;font-size:12.5px;color:var(--ink3)}
.tabs{position:fixed;left:0;right:0;bottom:0;z-index:25;background:#fff;border-top:1px solid var(--line);padding-bottom:var(--safeB)}
.tabs-in{max-width:640px;margin:0 auto;display:flex}
.tabs a{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 0 6px;color:var(--ink3);font-size:11.5px;position:relative}
.tabs a svg{width:22px;height:22px}
.tabs a.on{color:var(--pri);font-weight:600}
.tabs a .badge{position:absolute;top:3px;left:calc(50% + 6px);box-sizing:border-box;font-style:normal;min-width:17px;height:17px;padding:0 5px;border-radius:9px;background:var(--bad);color:#fff;font-size:10.5px;line-height:1;font-weight:700;display:inline-flex;align-items:center;justify-content:center;text-align:center;font-variant-numeric:tabular-nums;box-shadow:0 0 0 2px #fff}
.chips{display:flex;gap:8px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{flex:0 0 auto;height:32px;padding:0 14px;border-radius:16px;border:1px solid var(--line);background:#fff;color:var(--ink2);font-size:13.5px;cursor:pointer}
.chip.on{background:var(--ink);border-color:var(--ink);color:#fff;font-weight:600}
.search{width:100%;height:38px;border-radius:10px;border:1px solid var(--line);background:#fff;padding:0 12px;margin-bottom:10px;font-size:14px}
.hello{font-size:20px;font-weight:700;margin:2px 0 2px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:12px}
.stats.s3{grid-template-columns:repeat(3,1fr)}
.stat{text-align:center;padding:6px 0;border-radius:10px;cursor:pointer}
.stat b{display:block;font-size:22px;line-height:1.2}
.stat span{font-size:12px;color:var(--ink3)}
.item{display:flex;gap:10px;align-items:center;padding:12px;border-radius:12px;border:1px solid var(--line);background:#fff;margin-bottom:8px;cursor:pointer}
.item.urgent{border-color:#f6c9ca;background:#fffafa}
.item .tit{font-weight:600;font-size:14.5px}
.item .sub{font-size:12.5px;color:var(--ink3);margin-top:1px}
.item .hint{font-size:12px;font-weight:600}
.list-item{display:block;padding:12px 2px;border-bottom:1px solid var(--line);color:inherit}
.list-item:last-child{border-bottom:0}
.list-item.row{display:flex}
.udot{width:8px;height:8px;border-radius:50%;background:var(--bad);flex:0 0 auto}
.prog{height:6px;border-radius:3px;background:#eceef6;overflow:hidden;flex:1}
.prog i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,var(--pri),var(--pri2))}
.prog.bad i{background:var(--bad)}
.dl{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13.5px}
.dl dt{color:var(--ink3)}.dl dd{margin:0}
.steps{display:flex;align-items:flex-start;margin:12px 0 2px}
.steps .st{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10.5px;color:var(--ink3);position:relative}
.steps .st::before{content:"";position:absolute;top:5px;left:-50%;width:100%;height:2px;background:var(--line)}
.steps .st:first-child::before{display:none}
.steps .st i{width:12px;height:12px;border-radius:50%;background:var(--line);position:relative;z-index:1}
.steps .st.done i,.steps .st.done::before,.steps .st.cur::before{background:var(--pri)}
.steps .st.cur i{background:#fff;border:3px solid var(--pri)}
.steps .st.cur{color:var(--pri);font-weight:700}
.banner{border-radius:12px;padding:12px;margin-bottom:12px;background:var(--priSoft);color:var(--ink);font-size:14px}
.banner.warn{background:var(--warnSoft)}.banner.bad{background:var(--badSoft)}.banner.good{background:var(--goodSoft)}
.banner b{display:block;margin-bottom:2px}
.seg{padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:#fff;margin-bottom:8px}
.seg.mine{border-color:var(--pri);box-shadow:0 0 0 2px var(--priSoft)}
.seg.flash{animation:flash 1.6s ease 2}
@keyframes flash{50%{background:var(--priSoft)}}
.seg .who{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink3);margin-bottom:4px}
.seg .who b{color:var(--ink2);font-weight:600}
.segplay{display:inline-flex;align-items:center;gap:3px;height:24px;padding:0 9px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink3);font-size:12px;font-variant-numeric:tabular-nums;cursor:pointer}
.segplay.on{color:var(--pri);border-color:var(--pri);background:color-mix(in srgb,var(--pri) 10%,#fff)}
.segedit{margin-left:auto;display:inline-flex;align-items:center;gap:3px;height:26px;padding:0 11px;border-radius:999px;border:1px solid color-mix(in srgb,var(--pri) 45%,var(--line));background:color-mix(in srgb,var(--pri) 8%,#fff);color:var(--pri);font-size:12.5px;font-weight:600;cursor:pointer}
.seg .txt{font-size:14.5px;white-space:pre-wrap;word-break:break-word}
.seg .orig{margin-top:4px;font-size:12px;color:var(--ink3)}
.topic-t{margin:14px 2px 8px;font-size:14px;font-weight:700}
.av{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;color:#fff;font-size:11.5px;font-weight:700;flex:0 0 auto}
.av.lg{width:52px;height:52px;font-size:22px}
textarea,input[type=text],input[type=date],input[type=datetime-local],input[type=search],select{width:100%;border:1px solid var(--line);border-radius:10px;background:#fff;padding:9px 11px;font-size:14.5px;outline:none}
textarea:focus,input:focus,select:focus{border-color:var(--pri)}
textarea{min-height:84px;resize:vertical;line-height:1.55}
label.f{display:block;margin:12px 0 6px;font-size:13px;font-weight:600;color:var(--ink2)}
label.chk{display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:1.55;cursor:pointer}
label.chk input{width:20px;height:20px;margin-top:1px;flex:0 0 auto;accent-color:var(--pri)}
.seg-ctl{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fff}
.seg-ctl button{flex:1;height:38px;border:0;background:none;font-size:14px;color:var(--ink2);cursor:pointer}
.seg-ctl button+button{border-left:1px solid var(--line)}
.seg-ctl button.on{background:var(--priSoft);color:var(--pri);font-weight:700}
input[type=range]{width:100%;accent-color:var(--pri)}
.md h1,.md h2,.md h3,.md h4{font-size:15.5px;margin:14px 0 6px}
.md h1{font-size:17px}
.md p{margin:6px 0}
.md ul,.md ol{margin:6px 0;padding-left:20px}
.md table{border-collapse:collapse;width:100%;font-size:13px;margin:8px 0;display:block;overflow-x:auto}
.md th,.md td{border:1px solid var(--line);padding:5px 7px;text-align:left;white-space:nowrap}
.md th{background:#f7f8fb}
.mdblk{position:relative;padding:4px 0;border-bottom:1px dashed var(--line)}
.mdblk:last-child{border-bottom:0}
.mdblk .linkbtn{position:absolute;top:6px;right:0}
.big{font-size:28px;font-weight:700;line-height:1.2}
.kpis{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.kpis.k3{grid-template-columns:repeat(3,1fr)}
.kpi{background:#fff;border-radius:12px;padding:12px}
.kpi span{display:block;font-size:12px;color:var(--ink3)}
.dept-row{display:flex;align-items:center;gap:10px;margin:8px 0;font-size:13.5px}
.dept-row .nm{width:72px;flex:0 0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dept-row .v{width:48px;text-align:right;color:var(--ink3);font-size:12.5px}
.empty{padding:28px 0;text-align:center;color:var(--ink3);font-size:13.5px}
.loading{padding:60px 0;text-align:center;color:var(--ink3)}
.err{padding:40px 16px;text-align:center;color:var(--ink2)}
.err p{margin:0 0 14px}
.timeline{list-style:none;margin:0;padding:0}
.timeline li{position:relative;padding:0 0 12px 16px;font-size:13.5px}
.timeline li::before{content:"";position:absolute;left:2px;top:7px;width:7px;height:7px;border-radius:50%;background:var(--pri)}
.timeline li::after{content:"";position:absolute;left:5px;top:16px;bottom:0;width:1px;background:var(--line)}
.timeline li:last-child::after{display:none}
.side2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.side2>div{border-radius:10px;padding:10px;font-size:13px;background:var(--warnSoft)}
.side2>div+div{background:var(--priSoft)}
.side2 b{display:block;margin-bottom:4px;font-size:13.5px}
.upl{border:1px dashed var(--priLine);border-radius:12px;padding:12px;background:#fafaff}
.upl-file{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px}
.upl-file:last-child{border-bottom:0}
.hidden-input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.mask{position:fixed;inset:0;z-index:60;background:rgba(15,18,30,.45);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s}
.mask.show{opacity:1}
.sheet{width:100%;max-width:640px;max-height:88vh;background:#fff;border-radius:18px 18px 0 0;display:flex;flex-direction:column;transform:translateY(30px);transition:transform .2s}
.mask.show .sheet{transform:none}
.sheet.full{height:88vh}
.sheet-h{display:flex;align-items:center;padding:14px 16px 8px;font-size:16px;font-weight:700}
.sheet-h span{flex:1}
.sheet-h button{border:0;background:none;font-size:22px;color:var(--ink3);cursor:pointer;width:32px;height:32px}
.sheet-b{flex:1;overflow-y:auto;padding:4px 16px 12px;-webkit-overflow-scrolling:touch}
.sheet-f{display:flex;gap:10px;padding:10px 16px calc(12px + var(--safeB));border-top:1px solid var(--line)}
.sheet-f .btn{flex:1}
.sheet-msg{font-size:14.5px;line-height:1.65;color:var(--ink2);padding:4px 0 8px}
.sheet-err{color:var(--bad);font-size:13px;margin-top:8px;min-height:1px}
.pick-dept{margin:12px 0 4px;font-size:12.5px;font-weight:700;color:var(--ink3)}
.pick-row{display:flex;align-items:center;gap:10px;padding:9px 2px;border-bottom:1px solid var(--line);cursor:pointer;font-size:14.5px}
.pick-row input{width:19px;height:19px;accent-color:var(--pri);flex:0 0 auto}
.toast{position:fixed;left:50%;top:22%;z-index:90;max-width:84%;transform:translate(-50%,-6px);background:rgba(25,28,40,.9);color:#fff;padding:10px 16px;border-radius:12px;font-size:14px;line-height:1.5;text-align:center;opacity:0;transition:opacity .2s,transform .2s;pointer-events:none}
.toast.show{opacity:1;transform:translate(-50%,0)}
.toast.err{background:rgba(190,40,45,.94)}
.expired{max-width:420px;margin:18vh auto 0;padding:0 24px;text-align:center}
.expired .ic{width:64px;height:64px;margin:0 auto 16px;border-radius:50%;background:var(--warnSoft);color:var(--warn);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700}
.expired h1{font-size:19px;margin:0 0 8px}
.expired p{color:var(--ink2);font-size:14.5px;margin:0 0 6px}
.chips-person{display:flex;flex-wrap:wrap;gap:6px}
.chips-person span{display:inline-flex;align-items:center;gap:4px;padding:3px 8px 3px 3px;border-radius:14px;background:#f2f3f7;font-size:13px}
.vp-step{display:flex;gap:6px;margin:4px 0 14px}
.vp-step i{flex:1;height:4px;border-radius:2px;background:var(--line)}
.vp-step i.on{background:var(--pri)}
.vp-script{background:var(--priSoft);border-radius:12px;padding:14px;font-size:16.5px;line-height:1.8;color:var(--ink)}
.rec{width:96px;height:96px;margin:18px auto 8px;border-radius:50%;border:0;background:linear-gradient(135deg,var(--pri),var(--pri2));color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(91,91,240,.35);cursor:pointer}
.rec.on{background:var(--bad);box-shadow:0 0 0 10px rgba(229,72,77,.15);animation:pulse 1.2s ease infinite}
@keyframes pulse{50%{box-shadow:0 0 0 18px rgba(229,72,77,.06)}}
.rec-t{text-align:center;font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.okmark{width:76px;height:76px;margin:24px auto 12px;border-radius:50%;background:var(--goodSoft);color:var(--good);display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:700}
audio{width:100%;margin:8px 0}
`;

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/mobile/clientCommon.ts
var MM_CLIENT_COMMON_JS = String.raw`
var TOKEN = '';
try { TOKEN = new URLSearchParams(location.search).get('t') || ''; } catch (e) { TOKEN = ''; }
// remember the token: group links (/g, no token) use it to recognize the person
if (TOKEN) { try { localStorage.setItem('mm.token', TOKEN); } catch (e) { /* private mode */ } }
var META = { maxUploadBytes: 2147483648, httpsBase: '' };
var EXPIRED = false;

function tx(key, vars) {
  var parts = String(key).split('.');
  var v = T;
  for (var i = 0; i < parts.length; i++) v = (v && typeof v === 'object') ? v[parts[i]] : undefined;
  if (typeof v !== 'string') return String(key);
  if (vars) v = v.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] == null ? '' : String(vars[k]); });
  return v;
}
function lbl(group, key) {
  var g = T[group];
  return g && typeof g[key] === 'string' ? g[key] : String(key == null ? '' : key);
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;';
  });
}
function pad(n) { return n < 10 ? '0' + n : String(n); }
function fmtSize(n) {
  n = Number(n);
  if (!(n >= 0)) return '-';
  var u = ['B', 'KB', 'MB', 'GB', 'TB'];
  var i = 0;
  while (n >= 1024 && i < u.length - 1) { n = n / 1024; i++; }
  return (i ? n.toFixed(n >= 100 ? 0 : 1) : String(Math.round(n))) + ' ' + u[i];
}
function fmtDate(ms) {
  if (!ms) return '-';
  var d = new Date(ms);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function fmtDT(ms) {
  if (!ms) return '-';
  var d = new Date(ms);
  var hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
  var md = pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  return (d.getFullYear() === new Date().getFullYear() ? md : d.getFullYear() + '-' + md) + ' ' + hm;
}
function fmtAgo(ms) {
  if (!ms) return '';
  var now = Date.now();
  var diff = now - ms;
  if (diff < 60000) return tx('time.justNow');
  if (diff < 3600000) return tx('time.minutesAgo', { n: Math.floor(diff / 60000) });
  var d = new Date(ms);
  var hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
  if (d.toDateString() === new Date(now).toDateString()) return tx('time.today', { t: hm });
  if (d.toDateString() === new Date(now - 86400000).toDateString()) return tx('time.yesterday', { t: hm });
  return fmtDT(ms);
}
function fmtDue(s) { return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.slice(5) : (s || '-'); }
function weekdayOf(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
  var p = s.split('-');
  var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  var names = tx('time.weekdays').split(',');
  return names[d.getDay()] || '';
}
function fmtClock(sec) {
  var s = Math.max(0, Math.floor(Number(sec) || 0));
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var r = s % 60;
  return h ? h + ':' + pad(m) + ':' + pad(r) : pad(m) + ':' + pad(r);
}
function todayStr() { return fmtDate(Date.now()); }
var AV_COLORS = ['#e05a8a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5a4', '#16a34a', '#6366f1', '#d97706', '#0284c7'];
function avatar(name, cls) {
  var n = String(name || '?');
  var h = 0;
  for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
  return '<span class="av ' + (cls || '') + '" style="background:' + AV_COLORS[h % AV_COLORS.length] + '">' + esc(n.slice(0, 1)) + '</span>';
}

function expiredHtml() {
  return '<div class="expired"><div class="ic">!</div><h1>' + esc(tx('expired.title')) + '</h1><p>' + esc(tx('expired.body')) +
    '</p><p class="muted">' + esc(tx('expired.hint')) + '</p></div>';
}
function showExpired() {
  if (EXPIRED) return;
  EXPIRED = true;
  try { if (localStorage.getItem('mm.token') === TOKEN) localStorage.removeItem('mm.token'); } catch (e) { /* ignore */ }
  var masks = document.querySelectorAll('.mask');
  for (var i = 0; i < masks.length; i++) masks[i].remove();
  var app = document.getElementById('app');
  if (app) app.innerHTML = expiredHtml();
}

function errText(code, status, extra) {
  var c = String(code || '');
  if (c === 'UNAUTHORIZED') return tx('expired.body');
  if (c === 'TOO_MANY') return tx('common.tooMany');
  if (c === 'FORBIDDEN_ACTION') return tx('common.forbiddenAction');
  if (c === 'BAD_PATH') return tx('common.badPath');
  if (c === 'BAD_REQUEST') return tx('common.badRequest');
  if (c === 'NOT_FOUND') return tx('common.notFound');
  if (c === 'TOO_LARGE') return tx('common.tooLarge', { max: fmtSize(extra && extra.max || META.maxUploadBytes) });
  if (c === 'EMPTY') return tx('common.emptyFile');
  if (c === 'WRITE_FAILED') return tx('common.writeFailed');
  if (c === 'INTERNAL' || (!c && status >= 500)) return tx('common.serverError');
  return c || tx('common.serverError');
}

async function api(action, payload) {
  var r;
  try {
    r = await fetch('api/invoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN },
      body: JSON.stringify({ action: action, payload: payload == null ? {} : payload }),
      cache: 'no-store',
    });
  } catch (e) {
    throw new Error(tx('common.networkError'));
  }
  var j = null;
  try { j = await r.json(); } catch (e) { j = null; }
  if (r.status === 401) { showExpired(); throw new Error(tx('expired.body')); }
  if (r.status === 429) throw new Error(tx('common.tooMany'));
  if (!r.ok || !j || j.ok !== true) throw new Error(errText(j && j.error, r.status, j));
  return j.data;
}

async function loadMeta() {
  try {
    var r = await fetch('api/meta', { cache: 'no-store' });
    var j = await r.json();
    if (j && j.maxUploadBytes > 0) META.maxUploadBytes = j.maxUploadBytes;
    if (j && typeof j.httpsBase === 'string') META.httpsBase = j.httpsBase;
  } catch (e) { /* keep defaults */ }
}

function uploadFile(file, onProgress) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'api/upload?name=' + encodeURIComponent(file.name || 'upload.bin'));
    xhr.setRequestHeader('Authorization', 'Bearer ' + TOKEN);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = function (e) { if (e.lengthComputable) onProgress(e.loaded, e.total); };
    }
    xhr.onload = function () {
      var j = null;
      try { j = JSON.parse(xhr.responseText); } catch (e) { j = null; }
      if (xhr.status === 401) { showExpired(); reject(new Error(tx('expired.body'))); return; }
      if (xhr.status >= 200 && xhr.status < 300 && j && j.ok) { resolve(j.data); return; }
      reject(new Error(errText(j && j.error, xhr.status, j)));
    };
    xhr.onerror = function () { reject(new Error(tx('common.networkError'))); };
    xhr.send(file);
  });
}

function toast(msg, kind) {
  var el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : '');
  el.textContent = String(msg == null ? '' : msg);
  document.body.appendChild(el);
  setTimeout(function () { el.classList.add('show'); }, 10);
  setTimeout(function () {
    el.classList.remove('show');
    setTimeout(function () { el.remove(); }, 260);
  }, kind === 'err' ? 3600 : 2400);
}

/**
 * o: { title, body (html), full, actions: [{ text, cls, value, onClick(ctx) }], onMount(sheetEl, ctx) }
 * onClick(ctx) closes the sheet itself with ctx.close(v); thrown errors are shown inside the sheet.
 * Resolves with the value passed to close (null when dismissed).
 */
function openSheet(o) {
  return new Promise(function (resolve) {
    var mask = document.createElement('div');
    mask.className = 'mask';
    var acts = o.actions || [];
    var foot = acts.length ? '<div class="sheet-f">' + acts.map(function (a, i) {
      return '<button type="button" class="btn ' + (a.cls || '') + '" data-i="' + i + '">' + esc(a.text) + '</button>';
    }).join('') + '</div>' : '';
    mask.innerHTML = '<div class="sheet' + (o.full ? ' full' : '') + '"><div class="sheet-h"><span>' + esc(o.title || '') +
      '</span><button type="button" data-x="1" aria-label="close">&times;</button></div><div class="sheet-b">' + (o.body || '') +
      '<div class="sheet-err"></div></div>' + foot + '</div>';
    document.body.appendChild(mask);
    var sheet = mask.firstChild;
    var closed = false;
    var ctx = {
      el: sheet,
      close: function (v) {
        if (closed) return;
        closed = true;
        mask.classList.remove('show');
        setTimeout(function () { mask.remove(); }, 200);
        resolve(v === undefined ? null : v);
      },
      setError: function (msg) { var e = sheet.querySelector('.sheet-err'); if (e) e.textContent = msg || ''; },
      button: function (i) { return sheet.querySelector('.sheet-f [data-i="' + i + '"]'); },
    };
    mask.addEventListener('click', async function (ev) {
      if (ev.target === mask || (ev.target.closest && ev.target.closest('[data-x]'))) { ctx.close(null); return; }
      var b = ev.target.closest ? ev.target.closest('.sheet-f [data-i]') : null;
      if (!b) return;
      var a = acts[Number(b.getAttribute('data-i'))];
      if (!a) return;
      if (!a.onClick) { ctx.close(a.value === undefined ? null : a.value); return; }
      var btns = sheet.querySelectorAll('.sheet-f .btn');
      for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
      b.setAttribute('aria-busy', 'true');
      ctx.setError('');
      try { await a.onClick(ctx); } catch (e) { ctx.setError(e && e.message ? e.message : String(e)); }
      if (!closed) {
        for (var k = 0; k < btns.length; k++) btns[k].disabled = false;
        b.removeAttribute('aria-busy');
      }
    });
    if (o.onMount) { try { o.onMount(sheet, ctx); } catch (e) { /* ignore */ } }
    setTimeout(function () { mask.classList.add('show'); }, 10);
  });
}
function confirmBox(msg, okText, danger) {
  return openSheet({
    title: '',
    body: '<div class="sheet-msg">' + esc(msg) + '</div>',
    actions: [
      { text: tx('common.cancel'), cls: 'ghost', value: false },
      { text: okText || tx('common.ok'), cls: danger ? 'danger' : 'pri', value: true },
    ],
  }).then(function (v) { return v === true; });
}
/** submit(sheetEl) does the work; throw Error(msg) to keep the sheet open and show the message. */
function formSheet(o) {
  return openSheet({
    title: o.title,
    body: o.body,
    full: o.full,
    onMount: o.onMount,
    actions: [
      { text: tx('common.cancel'), cls: 'ghost', value: null },
      { text: o.okText || tx('common.submit'), cls: o.danger ? 'danger' : 'pri', onClick: async function (ctx) {
        var r = await o.submit(ctx.el);
        ctx.close(r === undefined ? true : r);
      } },
    ],
  });
}
function need(v, field) {
  if (!String(v == null ? '' : v).trim()) throw new Error(tx('common.required', { field: field }));
  return String(v).trim();
}
function val(root, sel) { var e = root.querySelector(sel); return e ? e.value : ''; }

function mdInline(s) {
  return esc(s).replace(/\x60/g, '').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/__([^_]+)__/g, '<b>$1</b>');
}
function mdTable(rows) {
  var cells = function (r) { return r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); }); };
  var body = rows.filter(function (r) { return !/^\s*\|?\s*:?-{2,}/.test(r); });
  if (!body.length) return '';
  var head = cells(body[0]);
  var html = '<table><thead><tr>' + head.map(function (c) { return '<th>' + mdInline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
  for (var i = 1; i < body.length; i++) {
    html += '<tr>' + cells(body[i]).map(function (c) { return '<td>' + mdInline(c) + '</td>'; }).join('') + '</tr>';
  }
  return html + '</tbody></table>';
}
function md(src) {
  var lines = String(src || '').replace(/\r/g, '').split('\n');
  var out = [];
  var para = [];
  var flush = function () { if (para.length) { out.push('<p>' + mdInline(para.join(' ')) + '</p>'); para = []; } };
  var i = 0;
  while (i < lines.length) {
    var l = lines[i];
    var hm = /^(#{1,4})\s+(.*)$/.exec(l);
    if (hm) { flush(); var lv = hm[1].length; out.push('<h' + lv + '>' + mdInline(hm[2]) + '</h' + lv + '>'); i++; continue; }
    if (/^\s*[-*+]\s+/.test(l)) {
      flush();
      var ul = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) { ul.push('<li>' + mdInline(lines[i].replace(/^\s*[-*+]\s+/, '')) + '</li>'); i++; }
      out.push('<ul>' + ul.join('') + '</ul>');
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(l)) {
      flush();
      var ol = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { ol.push('<li>' + mdInline(lines[i].replace(/^\s*\d+[.)]\s+/, '')) + '</li>'); i++; }
      out.push('<ol>' + ol.join('') + '</ol>');
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(l)) {
      flush();
      var rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(lines[i]); i++; }
      out.push(mdTable(rows));
      continue;
    }
    if (!l.trim()) { flush(); i++; continue; }
    para.push(l.trim());
    i++;
  }
  flush();
  return out.join('');
}
/** Split markdown into editable blocks: by headings when there are any, otherwise by blank-line paragraphs. */
function splitBlocks(src) {
  var text = String(src || '').replace(/\r/g, '').trim();
  if (!text) return [];
  var lines = text.split('\n');
  var hasHeading = lines.some(function (l) { return /^#{1,4}\s+/.test(l); });
  if (!hasHeading) return text.split(/\n\s*\n/).map(function (b) { return b.trim(); }).filter(Boolean);
  var blocks = [];
  var cur = [];
  lines.forEach(function (l) {
    if (/^#{1,4}\s+/.test(l) && cur.join('').trim()) { blocks.push(cur.join('\n').trim()); cur = []; }
    cur.push(l);
  });
  if (cur.join('').trim()) blocks.push(cur.join('\n').trim());
  return blocks;
}
function joinBlocks(blocks) { return blocks.map(function (b) { return String(b).trim(); }).filter(Boolean).join('\n\n') + '\n'; }
`;

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/mobile/appScript.ts
var MM_APP_JS = String.raw`
var APP = document.getElementById('app');
var BOOT = null;
var PEOPLE = null;
var ROUTE_SEQ = 0;
var ACTS = {};
var TIMERS = [];
var STACK = [];
var REPLACING = false;
var UPLOADING = false;
var DIRTY = false;
var PLAYER = null;
var PLAYING = '';
var CLIPS = {};
// Repaint the play buttons in place (no full reload, so the scroll position and open editors stay).
function markPlaying() {
  var list = document.querySelectorAll('.segplay');
  for (var i = 0; i < list.length; i++) {
    var b = list[i];
    var on = b.getAttribute('data-id') === PLAYING;
    b.classList.toggle('on', on);
    var label = b.textContent.replace(/^\S+\s/, '');
    b.innerHTML = (on ? '&#10074;&#10074; ' : '&#9654; ') + esc(label);
  }
}
var HIDDEN_AT = 0;
var PAGES = {};
var ROOTS = { home: 1, meetings: 1, tasks: 1, projects: 1, me: 1 };
var TAB_OF = { home: 'home', notices: 'home', meetings: 'meetings', meeting: 'meetings', plan: 'meetings', 'new-meeting': 'meetings',
  tasks: 'tasks', task: 'tasks', projects: 'projects', project: 'projects', summary: 'projects', report: 'projects', 'new-project': 'projects', me: 'me' };
var UI = { homeGroup: 'all', meetFilter: 'all', meetQ: '', taskView: 'received', taskStatus: '', taskQ: '', projStatus: 'active', projQ: '', segFilter: {} };
var DRAFT = { plan: {}, newMeeting: null, newProject: null, upload: {} };

var ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  meetings: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14h4"/>',
  tasks: '<path d="M10 6h10M10 12h10M10 18h10M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2L7.5 11M4 18l1.2 1.2L7.5 17"/>',
  projects: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  me: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 21h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};
function icon(name) {
  return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
}

// ---------- helpers ----------
function myId() { return BOOT && BOOT.me && BOOT.me.person ? BOOT.me.person.id : ''; }
function myName() { return BOOT && BOOT.me && BOOT.me.person ? BOOT.me.person.name : ''; }
function later(fn, ms) { var h = setTimeout(fn, ms); TIMERS.push(h); return h; }
function clearTimers() { TIMERS.forEach(function (h) { clearTimeout(h); }); TIMERS = []; }
function stale(seq) { return seq !== ROUTE_SEQ || EXPIRED; }
function enc(s) { return encodeURIComponent(String(s == null ? '' : s)); }
function render(html) { APP.innerHTML = html; }
async function loadBoot(force) { if (!BOOT || force) BOOT = await api('boot'); return BOOT; }
async function people() { if (!PEOPLE) PEOPLE = await api('people.list'); return PEOPLE; }
function personOf(id) {
  if (!PEOPLE) return null;
  for (var i = 0; i < PEOPLE.people.length; i++) if (PEOPLE.people[i].id === id) return PEOPLE.people[i];
  return null;
}
function deptNameOf(id) {
  if (!PEOPLE) return '';
  for (var i = 0; i < PEOPLE.depts.length; i++) if (PEOPLE.depts[i].id === id) return PEOPLE.depts[i].name;
  return '';
}
function nm(names, id) {
  if (!id) return '';
  if (names && names[id] && names[id].name) return names[id].name;
  var p = personOf(id);
  return p ? p.name : tx('common.unknownPerson');
}
function linkHash(link) {
  if (!link) return '#/home';
  var id = enc(link.id);
  switch (link.kind) {
    case 'meeting': return '#/meeting/' + id + (link.anchor ? '?anchor=' + enc(link.anchor) : '');
    case 'meeting_plan': return '#/plan/' + id;
    case 'task': return '#/task/' + id;
    case 'project': return '#/project/' + id;
    case 'project_summary': return '#/summary/' + id;
    case 'report': return '#/report/' + id + (link.anchor ? '/' + enc(link.anchor) : '');
    default: return '#/home';
  }
}
function parseHash() {
  var h = String(location.hash || '').replace(/^#\/?/, '');
  var qi = h.indexOf('?');
  var path = qi >= 0 ? h.slice(0, qi) : h;
  var qs;
  try { qs = new URLSearchParams(qi >= 0 ? h.slice(qi + 1) : ''); } catch (e) { qs = new URLSearchParams(''); }
  var parts = path.split('/').filter(Boolean).map(function (s) { try { return decodeURIComponent(s); } catch (e) { return s; } });
  return { parts: parts, qs: qs };
}
function go(hash) { if (location.hash === hash) route(true); else location.hash = hash; }
function replaceHash(hash) { REPLACING = true; location.replace(hash); }
function goBack() {
  if (STACK.length > 1) { history.back(); return; }
  var r = parseHash();
  replaceHash('#/' + (TAB_OF[r.parts[0]] || 'home'));
}
function topBar(title, o) {
  o = o || {};
  var left = o.back ? '<button class="side" data-act="back" aria-label="' + esc(tx('common.back')) + '">&#8249;</button>' : '<span class="side"></span>';
  return '<header class="top">' + left + '<h1>' + esc(title) + '</h1>' + (o.right || '<span class="side"></span>') + '</header>';
}
function tabBar(active) {
  var b = (BOOT && BOOT.badges) || {};
  var tabs = [['home', b.home], ['meetings', b.meetings], ['tasks', b.tasks], ['projects', 0], ['me', 0]];
  return '<nav class="tabs"><div class="tabs-in">' + tabs.map(function (t) {
    var n = Number(t[1]) || 0;
    return '<a href="#/' + t[0] + '" class="' + (active === t[0] ? 'on' : '') + '">' + icon(t[0]) + '<span>' + esc(tx('nav.' + t[0])) + '</span>' +
      (n ? '<i class="badge">' + (n > 99 ? '99+' : n) + '</i>' : '') + '</a>';
  }).join('') + '</div></nav>';
}
function bottomBar(btns, note) {
  if (!btns) return '';
  return '<div class="bar">' + (note ? '<div class="bar-note">' + esc(note) + '</div>' : '') + '<div class="bar-in">' + btns + '</div></div>';
}
function btn(act, text, cls, attrs) {
  return '<button type="button" class="btn ' + (cls || '') + '" data-act="' + act + '"' + (attrs || '') + '>' + esc(text) + '</button>';
}
function tag(text, cls) { return '<span class="tag ' + (cls || '') + '">' + esc(text) + '</span>'; }
function prog(pct, bad) {
  var p = Math.max(0, Math.min(100, Number(pct) || 0));
  return '<div class="prog' + (bad ? ' bad' : '') + '"><i style="width:' + p + '%"></i></div>';
}
function emptyBlock(text) { return '<div class="empty">' + esc(text || tx('common.empty')) + '</div>'; }
function meetingTag(st) {
  var cls = st === 'failed' ? 'bad' : (st === 'dispatched' || st === 'ended' || st === 'finalized') ? 'good' : st === 'processing' ? 'gray' : '';
  return tag(lbl('meetingStatus', st), cls);
}
function taskTag(t) {
  if (t.objection && t.objection.stage && t.objection.stage !== 'resolved') return tag(lbl('objectionStage', t.objection.stage), 'warn');
  var cls = t.status === 'done' ? 'good' : t.status === 'cancelled' ? 'gray' : t.status === 'to_accept' ? '' : 'gray';
  return tag(lbl('taskStatus', t.status), cls);
}
function projectTag(st) { return tag(lbl('projectStatus', st), st === 'archived' ? 'gray' : st === 'closing' ? 'warn' : 'good'); }
function hello() {
  var h = new Date().getHours();
  return tx(h < 11 ? 'time.morning' : h < 13 ? 'time.noon' : h < 18 ? 'time.afternoon' : 'time.evening');
}
async function run(el, fn) {
  if (el) { el.disabled = true; el.setAttribute('aria-busy', 'true'); }
  try { return await fn(); }
  catch (e) { if (!EXPIRED) toast(e && e.message ? e.message : String(e), 'err'); return undefined; }
  finally { if (el && el.isConnected) { el.disabled = false; el.removeAttribute('aria-busy'); } }
}
function scrollToEl(el) {
  if (!el) return;
  var y = el.getBoundingClientRect().top + (window.scrollY || 0) - 110;
  window.scrollTo(0, Math.max(0, y));
}

// ---------- people picker ----------
// Task owners of a plan / task (several allowed; old data only has ownerId).
function planOwnerIds(plan) {
  if (!plan) return [];
  return plan.ownerIds && plan.ownerIds.length ? plan.ownerIds.slice() : plan.ownerId ? [plan.ownerId] : [];
}
function taskOwnerIds(t) {
  return t.ownerIds && t.ownerIds.length ? t.ownerIds.slice() : t.ownerId ? [t.ownerId] : [];
}
function namesOf(names, ids) {
  return ids.map(function (id) { return nm(names, id); }).filter(Boolean).join(tx('common.listSep'));
}

async function pickPeople(o) {
  var org = await people();
  var sel = {};
  (o.selected || []).forEach(function (id) { if (id) sel[id] = 1; });
  var only = o.onlyIds ? o.onlyIds.reduce(function (m, id) { m[id] = 1; return m; }, {}) : null;
  var list = org.people.filter(function (p) { return !p.left && (!only || only[p.id]); });
  var count = function () { return Object.keys(sel).length; };
  return openSheet({
    title: o.title || tx('picker.title'),
    full: true,
    body: '<input type="search" class="search" id="pk-q" placeholder="' + esc(tx('picker.search')) + '"><div id="pk-list"></div>',
    actions: [
      { text: tx('common.cancel'), cls: 'ghost', value: null },
      { text: o.multi ? tx('picker.selected', { n: count() }) : tx('common.ok'), cls: 'pri', onClick: function (ctx) { ctx.close(Object.keys(sel)); } },
    ],
    onMount: function (el, ctx) {
      var q = el.querySelector('#pk-q');
      var box = el.querySelector('#pk-list');
      var draw = function () {
        var kw = String(q.value || '').trim().toLowerCase();
        var groups = {};
        var order = [];
        list.forEach(function (p) {
          var dn = deptNameOf(p.deptId);
          if (kw && (p.name + ' ' + dn + ' ' + (p.title || '')).toLowerCase().indexOf(kw) < 0) return;
          if (!groups[p.deptId]) { groups[p.deptId] = []; order.push(p.deptId); }
          groups[p.deptId].push(p);
        });
        var shown = 0;
        var html = order.map(function (d) {
          return '<div class="pick-dept">' + esc(deptNameOf(d)) + '</div>' + groups[d].map(function (p) {
            shown++;
            if (shown > 400) return '';
            return '<label class="pick-row"><input type="' + (o.multi ? 'checkbox' : 'radio') + '" name="pk" value="' + esc(p.id) + '"' + (sel[p.id] ? ' checked' : '') + '>' +
              avatar(p.name) + '<span class="grow">' + esc(p.name) + (p.title ? ' <span class="muted small">' + esc(p.title) + '</span>' : '') + '</span></label>';
          }).join('');
        }).join('');
        box.innerHTML = html || emptyBlock(tx('picker.none'));
      };
      q.addEventListener('input', draw);
      box.addEventListener('change', function (ev) {
        var t = ev.target;
        if (!t || t.name !== 'pk') return;
        if (!o.multi) sel = {};
        if (t.checked) sel[t.value] = 1; else delete sel[t.value];
        var b = ctx.button(1);
        if (b && o.multi) b.textContent = tx('picker.selected', { n: count() });
      });
      draw();
    },
  });
}
function personChips(ids, names) {
  return '<div class="chips-person">' + ids.map(function (id) {
    var n = nm(names, id);
    return '<span>' + avatar(n) + esc(n) + '</span>';
  }).join('') + '</div>';
}

// ---------- router ----------
async function route(soft) {
  var seq = ++ROUTE_SEQ;
  clearTimers();
  ACTS = {};
  DIRTY = false;
  if (EXPIRED) return;
  var r = parseHash();
  var name = r.parts[0] || 'home';
  var page = PAGES[name];
  if (!page) { replaceHash('#/home'); return; }
  var y = soft ? (window.scrollY || 0) : 0;
  if (!soft) render(topBar(tx('common.loading'), { back: !ROOTS[name] }) + '<div class="loading">' + esc(tx('common.loading')) + '</div>' + (ROOTS[name] ? tabBar(name) : ''));
  try {
    var handled = await page(r, seq, !!soft);
    if (stale(seq)) return;
    if (soft) window.scrollTo(0, y);
    else if (!handled) window.scrollTo(0, 0);
  } catch (e) {
    if (stale(seq)) return;
    render(topBar(tx('appTitle'), { back: !ROOTS[name] }) + '<div class="err"><p>' + esc(e && e.message ? e.message : e) + '</p>' +
      btn('reload', tx('common.retry'), 'pri') + '</div>' + (ROOTS[name] ? tabBar(name) : ''));
    ACTS.reload = function () { route(false); };
  }
}
function reload() { return route(true); }

document.addEventListener('click', function (ev) {
  var el = ev.target && ev.target.closest ? ev.target.closest('[data-act],[data-go]') : null;
  if (!el || !APP.contains(el)) return;
  if (el.hasAttribute('data-go')) { ev.preventDefault(); go(el.getAttribute('data-go')); return; }
  var name = el.getAttribute('data-act');
  if (name === 'back') { ev.preventDefault(); goBack(); return; }
  var fn = ACTS[name];
  if (fn) { ev.preventDefault(); fn(el, ev); }
});
// Typing in a form marks the page dirty: an automatic refresh must never wipe what the user is writing.
document.addEventListener('input', function (ev) { if (ev.target && APP.contains(ev.target)) DIRTY = true; }, true);
// Back to this page after a while (e.g. switched to WeCom and back): reload so changes made elsewhere
// (speaker moved by the host, someone else confirmed) show up without a manual refresh.
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') { HIDDEN_AT = Date.now(); return; }
  if (HIDDEN_AT && Date.now() - HIDDEN_AT > 3000 && !DIRTY && !UPLOADING && !EXPIRED) reload();
  HIDDEN_AT = 0;
});
window.addEventListener('hashchange', function () {
  var h = location.hash || '#/home';
  if (REPLACING) { REPLACING = false; if (STACK.length) STACK[STACK.length - 1] = h; else STACK.push(h); }
  else if (STACK.length > 1 && STACK[STACK.length - 2] === h) STACK.pop();
  else STACK.push(h);
  route(false);
});
window.addEventListener('beforeunload', function (ev) { if (UPLOADING) { ev.preventDefault(); ev.returnValue = ''; } });

// ---------- home ----------
function todoItem(td) {
  var urgent = td.urgency === 'urgent';
  var hintCls = urgent ? 'bad' : td.urgency === 'today' ? 'warn' : 'muted';
  return '<div class="item' + (urgent ? ' urgent' : '') + '" data-go="' + esc(linkHash(td.link)) + '"><div class="grow">' +
    '<div class="row">' + tag(lbl('todoType', td.type), urgent ? 'bad' : 'gray') + (td.hint ? '<span class="hint ' + hintCls + '">' + esc(td.hint) + '</span>' : '') + '</div>' +
    '<div class="tit ell" style="margin-top:6px">' + esc(td.title) + '</div>' + (td.subtitle ? '<div class="sub ell">' + esc(td.subtitle) + '</div>' : '') +
    '</div><span class="btn sm' + (urgent ? ' pri' : '') + '">' + esc(lbl('todoAction', td.type)) + '</span></div>';
}
function noticeRow(n) {
  return '<div class="list-item" data-act="notice" data-id="' + esc(n.id) + '" data-href="' + esc(linkHash(n.link)) + '">' +
    '<div class="row">' + (n.read ? '' : '<span class="udot"></span>') +
    '<b class="grow ell">' + esc(n.title || lbl('noticeType', n.type)) + '</b><span class="muted small">' + esc(fmtAgo(n.at)) + '</span></div>' +
    (n.summary ? '<div class="muted small">' + esc(n.summary) + '</div>' : '') + '</div>';
}
function bindNoticeActs() {
  ACTS.notice = async function (el) {
    var id = el.getAttribute('data-id');
    var href = el.getAttribute('data-href');
    try { await api('notice.read', { ids: [id] }); } catch (e) { /* still navigate */ }
    go(href);
  };
}
function taskRow(t) {
  var od = t.overdue && t.status !== 'done' && t.status !== 'cancelled';
  return '<div class="list-item" data-go="#/task/' + enc(t.id) + '"><div class="row"><b class="grow ell">' + esc(t.title) + '</b>' + taskTag(t) + '</div>' +
    '<div class="muted small ell">' + esc([t.deptName, t.assigneeName, tx('task.due', { d: fmtDue(t.due) })].filter(Boolean).join(' · ')) + '</div>' +
    '<div class="row" style="margin-top:6px">' + prog(t.percent, od) + '<span class="small muted">' + esc(tx('common.percent', { n: t.percent || 0 })) + '</span>' +
    (od ? tag(tx('task.overdue', { n: t.overdueDays || 0 }), 'bad') : '') + '</div></div>';
}
function meetingRow(m) {
  return '<div class="list-item" data-go="#/meeting/' + enc(m.id) + '"><div class="row"><b class="grow ell">' + esc(m.title) + '</b>' + meetingTag(m.status) + '</div>' +
    '<div class="muted small ell">' + esc([m.projectName, fmtDT(m.time)].filter(Boolean).join(' · ')) + '</div>' +
    ((m.needsMe || m.confirmText) ? '<div class="row" style="margin-top:4px">' + (m.needsMe ? tag(tx('meetings.needsMe'), 'bad') : '') +
      (m.confirmText ? '<span class="muted small">' + esc(m.confirmText) + '</span>' : '') + '</div>' : '') + '</div>';
}
function projectRow(p) {
  var rate = p.total ? Math.round((p.done || 0) * 100 / p.total) : (p.rate || 0);
  return '<div class="list-item" data-go="#/project/' + enc(p.id) + '"><div class="row"><b class="grow ell">' + esc(p.name) + '</b>' + projectTag(p.status) + '</div>' +
    '<div class="muted small ell">' + esc([p.ownerName, tx('projects.rate', { done: p.done || 0, total: p.total || 0 }), p.overdue ? tx('projects.overdue', { n: p.overdue }) : ''].filter(Boolean).join(' · ')) + '</div>' +
    '<div class="row" style="margin-top:6px">' + prog(rate, false) + '<span class="small muted">' + rate + '%</span></div></div>';
}

PAGES.home = async function (r, seq) {
  var res = await Promise.all([api('home.get'), loadBoot(true)]);
  if (stale(seq)) return;
  var hv = res[0] || {};
  var c = hv.counts || {};
  var todos = hv.todos || [];
  var urgentN = todos.filter(function (t) { return t.urgency === 'urgent'; }).length;
  var todayN = todos.filter(function (t) { return t.urgency === 'today'; }).length;
  var g = UI.homeGroup;
  var shown = g === 'all' ? todos : todos.filter(function (t) { return t.group === g; });
  var bell = '<button class="side" data-go="#/notices" aria-label="' + esc(tx('notices.title')) + '">' + icon('bell') +
    (c.unread ? '<i class="dot">' + (c.unread > 99 ? '99+' : c.unread) + '</i>' : '') + '</button>';
  var stat = function (n, key, cls, href) {
    return '<div class="stat" data-go="' + href + '"><b class="' + cls + '">' + (Number(n) || 0) + '</b><span>' + esc(tx(key)) + '</span></div>';
  };
  var html = topBar(tx('home.title'), { right: bell }) + '<div class="page">';
  html += '<div class="card"><div class="hello">' + esc(tx('home.greeting', { hello: hello(), name: hv.greetingName || myName() })) + '</div>' +
    '<div class="muted">' + esc(urgentN || todayN ? tx('home.summary', { urgent: urgentN, today: todayN }) : tx('home.summaryNone')) + '</div>' +
    '<div class="stats">' + stat(c.todos, 'home.statTodos', 'pri', '#/home') + stat(c.dueToday, 'home.statDueToday', 'warn', '#/tasks?view=received') +
    stat(c.overdue, 'home.statOverdue', 'bad', '#/tasks?view=received&status=overdue') + stat(c.unread, 'home.statUnread', '', '#/notices') + '</div></div>';
  var chip = function (v, text, n) { return '<button class="chip' + (g === v ? ' on' : '') + '" data-act="homeGroup" data-v="' + v + '">' + esc(text) + ' ' + n + '</button>'; };
  var cnt = function (grp) { return todos.filter(function (t) { return t.group === grp; }).length; };
  html += '<div class="card"><h2>' + esc(tx('home.todoTitle')) + '</h2><div class="chips">' + chip('all', tx('common.all'), todos.length) +
    chip('meeting', tx('home.filterMeeting'), cnt('meeting')) + chip('task', tx('home.filterTask'), cnt('task')) + chip('project', tx('home.filterProject'), cnt('project')) + '</div>';
  if (!shown.length) html += emptyBlock(tx('home.todoEmpty'));
  [['urgent', 'home.groupUrgent'], ['today', 'home.groupToday'], ['week', 'home.groupWeek']].forEach(function (grp) {
    var items = shown.filter(function (t) { return (t.urgency || 'week') === grp[0]; });
    if (!items.length) return;
    html += '<div class="sec-t"><span class="' + (grp[0] === 'urgent' ? 'bad' : '') + '">' + esc(tx(grp[1])) + '</span><span class="n">' + items.length + '</span></div>' + items.map(todoItem).join('');
  });
  html += '</div>';
  var mt = hv.myTasksThisWeek || [];
  html += '<div class="card"><h2>' + esc(tx('home.myTasks')) + '<a class="r" href="#/tasks">' + esc(tx('common.viewAll')) + '</a></h2>';
  html += mt.length ? mt.map(function (t) {
    var od = t.overdue && t.status !== 'done' && t.status !== 'cancelled';
    return '<div class="list-item row" data-go="#/task/' + enc(t.id) + '"><div style="width:48px;text-align:center"><div class="muted small">' + esc(t.due === todayStr() ? tx('home.groupToday') : weekdayOf(t.due)) + '</div><b>' + esc(fmtDue(t.due)) + '</b></div>' +
      '<div class="grow"><div class="ell" style="font-weight:600">' + esc(t.title) + '</div><div class="row">' + prog(t.percent, od) + '<span class="small muted">' + (t.percent || 0) + '%</span>' +
      (od ? tag(tx('task.overdue', { n: t.overdueDays || 0 }), 'bad') : '') + '</div></div></div>';
  }).join('') : emptyBlock(tx('home.myTasksEmpty'));
  html += '</div>';
  var nts = (hv.notices || []).slice(0, 5);
  if (nts.length) {
    var unread = nts.filter(function (n) { return !n.read; }).length;
    html += '<div class="card"><h2>' + esc(tx('home.notices')) + (c.unread || unread ? tag(tx('home.unreadBadge', { n: c.unread || unread }), 'bad') : '') +
      '<a class="r" href="#/notices">' + esc(tx('common.viewAll')) + '</a></h2>' + nts.map(noticeRow).join('') + '</div>';
  }
  var ps = hv.projects || [];
  if (ps.length) html += '<div class="card"><h2>' + esc(tx('home.projects')) + '<a class="r" href="#/projects">' + esc(tx('common.viewAll')) + '</a></h2>' + ps.map(projectRow).join('') + '</div>';
  var rm = hv.recentMeetings || [];
  if (rm.length) html += '<div class="card"><h2>' + esc(tx('home.recentMeetings')) + '<a class="r" href="#/meetings">' + esc(tx('common.viewAll')) + '</a></h2>' + rm.map(meetingRow).join('') + '</div>';
  html += '</div>' + tabBar('home');
  render(html);
  ACTS.homeGroup = function (el) { UI.homeGroup = el.getAttribute('data-v') || 'all'; reload(); };
  bindNoticeActs();
};

PAGES.notices = async function (r, seq) {
  var list = await api('notice.list', {});
  if (stale(seq)) return;
  list = list || [];
  var right = list.some(function (n) { return !n.read; }) ? '<button class="side" style="width:auto;font-size:13px;color:var(--pri)" data-act="readAll">' + esc(tx('notices.readAll')) + '</button>' : '';
  render(topBar(tx('notices.title'), { back: true, right: right }) + '<div class="page"><div class="card">' + (list.length ? list.map(noticeRow).join('') : emptyBlock(tx('notices.empty'))) + '</div></div>');
  bindNoticeActs();
  ACTS.readAll = function (el) { run(el, async function () { await api('notice.read', { all: true }); reload(); }); };
};

// ---------- meetings ----------
PAGES.meetings = async function (r, seq) {
  var list = await api('meeting.list', { filter: UI.meetFilter, q: UI.meetQ || undefined });
  await loadBoot(false);
  if (stale(seq)) return;
  list = list || [];
  var chip = function (v, key) { return '<button class="chip' + (UI.meetFilter === v ? ' on' : '') + '" data-act="meetFilter" data-v="' + v + '">' + esc(tx(key)) + '</button>'; };
  var right = '<button class="side" data-go="#/new-meeting" aria-label="' + esc(tx('meetings.create')) + '">' + icon('plus') + '</button>';
  render(topBar(tx('meetings.title'), { right: right }) + '<div class="page"><input type="search" class="search" id="mq" value="' + esc(UI.meetQ) + '" placeholder="' + esc(tx('common.searchPlaceholder')) + '">' +
    '<div class="chips">' + chip('all', 'meetings.filterAll') + chip('todo', 'meetings.filterTodo') + chip('processing', 'meetings.filterProcessing') + chip('final', 'meetings.filterFinal') + '</div>' +
    '<div class="card">' + (list.length ? list.map(meetingRow).join('') : emptyBlock(tx('meetings.empty'))) + '</div></div>' + tabBar('meetings'));
  ACTS.meetFilter = function (el) { UI.meetFilter = el.getAttribute('data-v') || 'all'; reload(); };
  var q = document.getElementById('mq');
  if (q) q.addEventListener('change', function () { UI.meetQ = q.value.trim(); reload(); });
};

function stepsBar(status) {
  var steps = tx('meetingSteps').split(',');
  var groups = [['pending_upload'], ['processing', 'failed', 'pending_assign'], ['pending_confirm'], ['pending_review'], ['finalized', 'ended'], ['pending_owner', 'plan_confirm'], ['dispatched']];
  var cur = 0;
  groups.forEach(function (g, i) { if (g.indexOf(status) >= 0) cur = i; });
  return '<div class="steps">' + steps.map(function (s, i) {
    return '<div class="st ' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '"><i></i><span>' + esc(s) + '</span></div>';
  }).join('') + '</div>';
}

PAGES.meeting = async function (r, seq, soft) {
  var id = r.parts[1] || '';
  var anchor = r.qs.get('anchor') || '';
  var res = await Promise.all([api('meeting.get', { id: id }), loadBoot(false), people().catch(function () { return null; })]);
  if (stale(seq)) return;
  var d = res[0] || {};
  var m = d.meeting || {};
  var my = d.my || {};
  var names = d.names || {};
  var me = myId();
  var active = d.projectStatus !== 'archived' && d.projectStatus !== 'closing';
  var speakerBy = {};
  (m.speakers || []).forEach(function (s) { speakerBy[s.label] = s; });
  var myLabels = my.myLabels || [];
  var isMine = function (seg) { return myLabels.indexOf(seg.speakerLabel) >= 0; };
  var segs = m.segments || [];
  var mySegs = segs.filter(isMine);
  var myConf = (m.confirmations || []).filter(function (c) { return c.personId === me; })[0];
  // While pending confirmation: speakers can complete their own segments (even after confirming); the host can edit any segment.
  var canEditOwn = m.status === 'pending_confirm' && !!myConf;
  var confirmHost = m.status === 'pending_confirm' && !!my.isHost;
  var canReview = m.status === 'pending_review' && !!my.isHost;
  // Host can still fix typos after the minutes are finalized (until the project is archived).
  var finalHost = !!my.isHost && ['finalized', 'ended', 'pending_owner', 'plan_confirm', 'dispatched'].indexOf(m.status) >= 0;
  var hasAudio = (m.files || []).some(function (f) { return f.kind === 'audio' || f.kind === 'video'; });
  var who = function (label) {
    var s = speakerBy[label];
    return s && s.personId ? nm(names, s.personId) : tx('meeting.speakerLabel', { label: label });
  };
  var plan = m.plan || null;
  var bar = '';
  var barNote = '';
  var panel = '';

  // ----- status panel -----
  var st = m.status;
  if (st === 'pending_upload') {
    if (my.isHost && active) {
      panel = '<div class="card"><h2>' + esc(tx('meeting.uploadTitle')) + '</h2><div class="muted small">' + esc(tx('meeting.uploadDesc')) + '</div>' +
        '<div class="banner warn small" style="margin:10px 0">' + esc(tx('meeting.uploadWifi')) + '</div>' +
        '<div class="upl"><label class="btn block"><input type="file" multiple class="hidden-input" id="upf">' + esc(tx('meeting.uploadPick')) + '</label><div id="upl-list"></div></div>' +
        '<div id="upl-msg" class="muted small" style="margin-top:8px"></div></div>';
      bar = btn('upStart', tx('meeting.uploadStart'), 'pri', ' id="up-start" disabled');
    } else {
      panel = '<div class="banner">' + esc(tx('meeting.waitUpload')) + '</div>';
    }
  } else if (st === 'processing') {
    var pr = m.process || {};
    var lastLog = pr.log && pr.log.length ? pr.log[pr.log.length - 1].text : '';
    panel = '<div class="card"><h2>' + esc(tx('meeting.processing', { stage: lbl('processStage', pr.stage || 'extract') })) + '<span class="r">' + (pr.progress || 0) + '%</span></h2>' +
      prog(pr.progress || 0) + (lastLog ? '<div class="muted small" style="margin-top:8px">' + esc(lastLog) + '</div>' : '') +
      '<div class="muted small" style="margin-top:6px">' + esc(tx('meeting.processingHint')) + '</div></div>';
    later(reload, 4000);
  } else if (st === 'failed') {
    var errMsg = m.process && m.process.error ? m.process.error : '';
    panel = '<div class="banner bad"><b>' + esc(tx('meeting.failed')) + '</b>' + esc(errMsg) + (my.isHost ? '' : '<div class="small muted">' + esc(tx('meeting.failedWait')) + '</div>') + '</div>';
    if (my.isHost && active) bar = btn('retry', tx('meeting.retryBtn'), 'pri');
  } else if (st === 'pending_assign') {
    if (my.isHost) {
      var unknown = (m.speakers || []).filter(function (s) { return !s.personId; });
      panel = '<div class="card"><h2>' + esc(tx('meeting.assignTitle')) + '</h2><div class="muted small" style="margin-bottom:10px">' + esc(tx('meeting.assignDesc', { n: unknown.length })) + '</div>' +
        (m.speakers || []).map(function (s) { return speakerSlot(s, m, names, segs); }).join('') + '</div>';
    } else {
      panel = '<div class="banner">' + esc(tx('meeting.assignWait')) + '</div>';
    }
  } else if (st === 'pending_confirm') {
    var cf = d.confirm || { done: 0, total: 0 };
    var head = '<b>' + esc(tx('meeting.confirmProgress', { done: cf.done || 0, total: cf.total || 0 })) + '</b>';
    if (myConf && myConf.status !== 'confirmed') {
      panel = (myConf.returnedAt && myConf.returnNote ? '<div class="banner warn">' + esc(tx('meeting.returnedNote', { note: myConf.returnNote })) + '</div>' : '') +
        '<div class="banner">' + head + esc(mySegs.length ? tx('meeting.confirmMine', { n: mySegs.length }) : tx('meeting.confirmMineNone')) + '</div>';
      bar = btn('confirmMine', tx('meeting.submitConfirm'), 'pri');
    } else if (myConf) {
      panel = '<div class="banner good">' + head + esc(tx('meeting.confirmDoneMine')) + '</div>';
    } else {
      panel = '<div class="banner">' + head + esc(tx('meeting.confirmWait')) + '</div>';
    }
  } else if (st === 'pending_review') {
    if (my.isHost) {
      panel = '<div class="banner"><b>' + esc(tx('meeting.reviewTitle')) + '</b>' + esc(tx('meeting.reviewDesc')) + '</div>';
      bar = btn('returnPick', tx('meeting.returnBtn'), 'ghost') + btn('approve', tx('meeting.approveBtn'), 'pri');
    } else {
      panel = '<div class="banner">' + esc(tx('meeting.reviewWait')) + '</div>';
    }
  } else if (st === 'finalized') {
    if (my.isHost && active) {
      panel = '<div class="banner good"><b>' + esc(tx('meeting.decideTitle')) + '</b>' + esc(tx('meeting.decideDesc')) + '</div>';
      bar = btn('decideNone', tx('meeting.decideNone'), 'ghost') + btn('decideGen', tx('meeting.decideGenerate'), 'pri');
    } else {
      panel = '<div class="banner good">' + esc(tx('meeting.decideWait')) + '</div>';
    }
  } else if (st === 'ended') {
    panel = '<div class="banner good">' + esc(tx('meeting.endedDesc')) + '</div>';
  } else if (st === 'pending_owner') {
    if (my.isHost && active) {
      panel = '<div class="banner"><b>' + esc(tx('meeting.ownerTitle')) + '</b>' + esc(tx('meeting.ownerDesc', { n: plan && plan.items ? plan.items.length : 0 })) + '</div>';
      bar = '<a class="btn ghost" href="#/plan/' + enc(m.id) + '">' + esc(tx('meeting.planView')) + '</a>' + btn('pickOwner', tx('meeting.ownerBtn'), 'pri');
    } else {
      panel = '<div class="banner">' + esc(tx('meeting.ownerWait')) + ' <a href="#/plan/' + enc(m.id) + '">' + esc(tx('meeting.planView')) + '</a></div>';
    }
  } else if (st === 'plan_confirm') {
    if (my.isPlanOwner) {
      panel = '<div class="banner"><b>' + esc(tx('meeting.planMine')) + '</b></div>';
      bar = '<a class="btn pri" href="#/plan/' + enc(m.id) + '">' + esc(tx('meeting.planGo')) + '</a>';
    } else {
      panel = '<div class="banner">' + esc(tx('meeting.planWait', { name: namesOf(names, planOwnerIds(plan)) })) + ' <a href="#/plan/' + enc(m.id) + '">' + esc(tx('meeting.planView')) + '</a></div>';
    }
  } else if (st === 'dispatched') {
    panel = '<div class="banner good">' + esc(tx('meeting.dispatchedDesc', { n: (m.taskIds || []).length })) + ' <a href="#/plan/' + enc(m.id) + '">' + esc(tx('meeting.planView')) + '</a></div>';
  }

  // ----- body -----
  var html = topBar(tx('meeting.title'), { back: true }) + '<div class="page' + (bar ? ' with-bar' : '') + '">';
  html += '<div class="card"><div class="row" style="align-items:flex-start"><b class="grow" style="font-size:17px;line-height:1.4">' + esc(m.title) + '</b>' + meetingTag(st) + '</div>' +
    '<div class="muted small" style="margin-top:4px">' + esc([d.projectName, fmtDT(m.time), tx('meeting.host', { name: nm(names, m.hostId) }), lbl('meetingSource', m.source),
      m.durationSec ? tx('meeting.duration', { n: Math.max(1, Math.round(m.durationSec / 60)) }) : '', tx('meeting.attendees', { n: (m.attendeeIds || []).length })].filter(Boolean).join(' · ')) + '</div>' +
    stepsBar(st) + '</div>';
  html += panel;

  if (m.summaryLines && m.summaryLines.length) {
    html += '<div class="card"><h2>' + esc(tx('meeting.summary')) + '</h2><ul style="margin:0;padding-left:18px">' + m.summaryLines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>';
  }
  if (m.decisions && m.decisions.length) {
    html += '<div class="card"><h2>' + esc(tx('meeting.decisions')) + '</h2><ol style="margin:0;padding-left:20px">' + m.decisions.map(function (x) { return '<li>' + esc(x.text) + '</li>'; }).join('') + '</ol></div>';
  }

  // transcript
  if (segs.length) {
    var filter = UI.segFilter[m.id] || 'all';
    var editable = function (seg) { return active && ((canEditOwn && isMine(seg)) || confirmHost || canReview || finalHost); };
    var segHtml = function (seg) {
      var mine = isMine(seg);
      var edited = !!seg.originalText && seg.originalText !== seg.text;
      var clock = hasAudio
        ? '<button class="segplay' + (PLAYING === seg.id ? ' on' : '') + '" data-act="segPlay" data-id="' + esc(seg.id) + '" aria-label="' + esc(tx('meeting.playSeg')) + '">' + (PLAYING === seg.id ? '&#10074;&#10074;' : '&#9654;') + ' ' + esc(fmtClock(seg.start)) + '</button>'
        : '<span>' + esc(fmtClock(seg.start)) + '</span>';
      return '<div class="seg' + (mine ? ' mine' : '') + '" id="seg-' + esc(seg.id) + '"><div class="who">' + avatar(who(seg.speakerLabel)) + '<b>' + esc(who(seg.speakerLabel)) + '</b>' + clock +
        (mine ? tag(tx('meeting.mine')) : '') + (edited ? tag(tx('meeting.edited'), 'gray') : '') +
        (editable(seg) ? '<button class="segedit" data-act="segEdit" data-id="' + esc(seg.id) + '">&#9998; ' + esc(tx('meeting.editBtn')) + '</button>' : '') + '</div>' +
        '<div class="txt">' + esc(seg.text) + '</div>' + (edited ? '<div class="orig">' + esc(tx('meeting.original', { text: seg.originalText })) + '</div>' : '') + '</div>';
    };
    var visible = filter === 'mine' ? segs.filter(isMine) : segs;
    var vis = {};
    visible.forEach(function (s) { vis[s.id] = s; });
    html += '<div class="sec-t">' + esc(tx('meeting.transcript')) + '<span class="n">' + segs.length + '</span></div>';
    if (finalHost && active) html += '<div class="muted small" style="margin:-4px 0 8px">' + esc(tx('meeting.finalFixHint')) + '</div>';
    if (mySegs.length) {
      html += '<div class="chips"><button class="chip' + (filter === 'all' ? ' on' : '') + '" data-act="segFilter" data-v="all">' + esc(tx('meeting.filterAllSegments')) + '</button>' +
        '<button class="chip' + (filter === 'mine' ? ' on' : '') + '" data-act="segFilter" data-v="mine">' + esc(tx('meeting.filterMine')) + ' ' + mySegs.length + '</button></div>';
    }
    var topics = m.topics || [];
    if (topics.length) {
      var used = {};
      topics.forEach(function (tp) {
        var inTopic = (tp.segmentIds || []).map(function (sid) { used[sid] = 1; return vis[sid]; }).filter(Boolean);
        if (!inTopic.length) return;
        html += '<div class="topic-t">' + esc(tp.title) + '</div>' + inTopic.map(segHtml).join('');
      });
      var rest = visible.filter(function (s) { return !used[s.id]; });
      if (rest.length) html += '<div class="topic-t">' + esc(tx('meeting.topicOther')) + '</div>' + rest.map(segHtml).join('');
    } else {
      html += visible.map(segHtml).join('');
    }
  } else if (st !== 'pending_upload' && st !== 'processing' && st !== 'failed') {
    html += '<div class="card">' + emptyBlock(tx('meeting.noSegments')) + '</div>';
  }

  // confirmations
  var confs = m.confirmations || [];
  if (confs.length) {
    html += '<div class="card"><h2>' + esc(tx('meeting.confirmations')) + '</h2>' + confs.map(function (c) {
      var n = nm(names, c.personId);
      var stTag = c.status === 'confirmed' ? tag(tx('meeting.confirmed'), 'good') : (c.returnedAt ? tag(tx('meeting.returned'), 'warn') : tag(tx('meeting.pending'), 'gray'));
      return '<div class="list-item row">' + avatar(n) + '<span class="grow">' + esc(n) + (c.confirmedAt ? ' <span class="muted small">' + esc(fmtDT(c.confirmedAt)) + '</span>' : '') +
        (c.remindedAt && c.status !== 'confirmed' ? ' <span class="muted small">' + esc(tx('meeting.remindedAt')) + '</span>' : '') + '</span>' + stTag +
        (canReview && c.status === 'confirmed' ? '<button class="linkbtn" data-act="returnTo" data-pid="' + esc(c.personId) + '">' + esc(tx('meeting.returnBtn')) + '</button>' : '') + '</div>';
    }).join('') + '</div>';
  }
  if (d.tasks && d.tasks.length) html += '<div class="card"><h2>' + esc(tx('meeting.tasks')) + '</h2>' + d.tasks.map(taskRow).join('') + '</div>';
  if (m.files && m.files.length) {
    html += '<div class="card"><h2>' + esc(tx('meeting.files')) + '</h2>' + m.files.map(function (f) {
      return '<div class="list-item row"><span class="grow ell">' + esc(f.name) + '</span><span class="muted small">' + esc(fmtSize(f.size)) + '</span></div>';
    }).join('') + '</div>';
  }
  html += '</div>' + bottomBar(bar, barNote);
  render(html);

  // ----- acts -----
  ACTS.segFilter = function (el) { UI.segFilter[m.id] = el.getAttribute('data-v'); reload(); };
  ACTS.segEdit = function (el) {
    var sid = el.getAttribute('data-id');
    var box = document.getElementById('seg-' + sid);
    var seg = segs.filter(function (s) { return s.id === sid; })[0];
    if (!box || !seg || box.querySelector('textarea')) return;
    var txt = box.querySelector('.txt');
    txt.innerHTML = '<textarea>' + esc(seg.text) + '</textarea><div class="row" style="justify-content:flex-end;margin-top:6px">' +
      btn('segCancel', tx('common.cancel'), 'sm ghost', ' data-id="' + esc(sid) + '"') + btn('segSave', tx('common.save'), 'sm pri', ' data-id="' + esc(sid) + '"') + '</div>';
    var ta = txt.querySelector('textarea');
    ta.focus();
  };
  ACTS.segCancel = function () { reload(); };
  // Play one segment's original audio; tapping the playing one pauses it. One player for the whole page.
  ACTS.segPlay = async function (el) {
    var sid = el.getAttribute('data-id');
    if (PLAYER && PLAYING === sid) { PLAYER.pause(); PLAYING = ''; markPlaying(); return; }
    if (PLAYER) PLAYER.pause();
    PLAYING = '';
    markPlaying();
    el.disabled = true;
    try {
      var url = CLIPS[sid];
      if (!url) {
        var res = await api('meeting.segment.audio', { id: m.id, segmentId: sid });
        url = res && res.dataUrl;
        if (!url) throw new Error(tx('meeting.noAudio'));
        CLIPS[sid] = url;
      }
      if (!PLAYER) { PLAYER = new Audio(); PLAYER.onended = function () { PLAYING = ''; markPlaying(); }; }
      PLAYER.src = url;
      await PLAYER.play();
      PLAYING = sid;
      markPlaying();
    } catch (e) {
      toast(e && e.message ? e.message : String(e), 'err');
    } finally {
      el.disabled = false;
    }
  };
  ACTS.segSave = function (el) {
    var sid = el.getAttribute('data-id');
    var box = document.getElementById('seg-' + sid);
    var ta = box && box.querySelector('textarea');
    if (!ta) return;
    var text = ta.value.trim();
    if (!text) { toast(tx('common.required', { field: tx('meeting.transcript') }), 'err'); return; }
    run(el, async function () {
      await api('meeting.segment.edit', { id: m.id, segmentId: sid, text: text });
      toast(tx('meeting.segSaved'));
      reload();
    });
  };
  ACTS.confirmMine = async function (el) {
    if (!(await confirmBox(tx('meeting.submitConfirmAsk'), tx('meeting.submitConfirm')))) return;
    run(el, async function () { await api('meeting.confirm', { id: m.id }); toast(tx('meeting.confirmedToast')); await loadBoot(true); reload(); });
  };
  ACTS.retry = function (el) { run(el, async function () { await api('meeting.retry', { id: m.id }); toast(tx('meeting.retried')); reload(); }); };
  var doReturn = function (pid) {
    var opts = confs.map(function (c) {
      return '<label class="pick-row"><input type="radio" name="rp" value="' + esc(c.personId) + '"' + (c.personId === pid ? ' checked' : '') + '>' + avatar(nm(names, c.personId)) + '<span class="grow">' + esc(nm(names, c.personId)) + '</span></label>';
    }).join('');
    return formSheet({
      title: tx('meeting.returnTitle'),
      okText: tx('meeting.returnBtn'),
      body: '<label class="f">' + esc(tx('meeting.returnWho')) + '</label>' + opts + '<label class="f">' + esc(tx('meeting.returnNote')) + '</label><textarea id="rn" placeholder="' + esc(tx('meeting.returnNotePh')) + '"></textarea>',
      submit: async function (sh) {
        var picked = sh.querySelector('input[name=rp]:checked');
        var who2 = need(picked ? picked.value : '', tx('meeting.returnWho'));
        var note = need(val(sh, '#rn'), tx('meeting.returnNote'));
        await api('meeting.review.return', { id: m.id, personId: who2, note: note });
      },
    }).then(function (ok) { if (ok) { toast(tx('meeting.returnedToast')); reload(); } });
  };
  ACTS.returnPick = function () { doReturn(''); };
  ACTS.returnTo = function (el) { doReturn(el.getAttribute('data-pid')); };
  var decide = async function (decision, el) {
    if (decision === 'generate') toast(tx('meeting.generating'));
    await run(el, async function () { await api('meeting.decide', { id: m.id, decision: decision }); reload(); });
  };
  ACTS.approve = async function (el) {
    if (!(await confirmBox(tx('meeting.approveAsk'), tx('meeting.approveBtn')))) return;
    var ok = await run(el, async function () { await api('meeting.review.approve', { id: m.id }); return true; });
    if (!ok) return;
    toast(tx('meeting.approvedToast'));
    var choice = await openSheet({
      title: tx('meeting.decideTitle'),
      body: '<div class="sheet-msg">' + esc(tx('meeting.decideDesc')) + '</div>',
      actions: [{ text: tx('meeting.decideNone'), cls: 'ghost', value: 'none' }, { text: tx('meeting.decideGenerate'), cls: 'pri', value: 'generate' }],
    });
    if (choice === 'none' || choice === 'generate') await decide(choice, null);
    else reload();
  };
  ACTS.decideNone = function (el) { decide('none', el); };
  ACTS.decideGen = function (el) { decide('generate', el); };
  // Task owners can be several people: multi-select, pre-checked with the current owners.
  ACTS.pickOwner = async function (el) {
    var picked = await pickPeople({ title: tx('meeting.ownerBtn'), multi: true, selected: planOwnerIds(plan) });
    if (!picked || !picked.length) return;
    run(el, async function () {
      await api('meeting.plan.owner', { id: m.id, ownerIds: picked });
      toast(tx('meeting.ownerSet', { name: namesOf(names, picked) }));
      reload();
    });
  };
  bindSpeakerActs(m, names);
  if (st === 'pending_upload' && my.isHost && active) bindUpload(m);

  // ----- anchor -----
  if (!soft) {
    var target = anchor ? document.getElementById('seg-' + anchor) : null;
    if (!target && canEditOwn && mySegs.length) target = document.getElementById('seg-' + mySegs[0].id);
    if (target) {
      scrollToEl(target);
      target.classList.add('flash');
      return true;
    }
  }
  return false;
};

function speakerSlot(s, m, names, segs) {
  var samples = segs.filter(function (x) { return x.speakerLabel === s.label; }).slice(0, 2);
  var how = s.matchedBy === 'voiceprint' ? tx('meeting.matchedVoice', { score: s.score != null ? Number(s.score).toFixed(2) : '' })
    : s.matchedBy === 'nickname' ? tx('meeting.matchedNick') : s.matchedBy === 'manual' ? tx('meeting.matchedManual') : '';
  var opts = (m.attendeeIds || []).map(function (pid) { return '<option value="' + esc(pid) + '">' + esc(nm(names, pid)) + '</option>'; }).join('');
  return '<div class="seg" id="slot-' + esc(s.label) + '"><div class="row"><b class="grow">' + esc(tx('meeting.speakerLabel', { label: s.label })) + '</b>' +
    (s.personId ? tag(nm(names, s.personId), 'good') + (how ? '<span class="muted small">' + esc(how) + '</span>' : '') : '') + '</div>' +
    samples.map(function (x) { return '<div class="muted small" style="margin-top:4px">' + esc(fmtClock(x.start)) + ' ' + esc(x.text) + '</div>'; }).join('') +
    '<div style="margin-top:8px">' + btn('listen', tx('meeting.listen'), 'sm ghost', ' data-label="' + esc(s.label) + '"') + '<div class="clip"></div></div>' +
    (s.personId ? '' : '<div class="row" style="margin-top:8px"><select class="grow" data-slot="' + esc(s.label) + '"><option value="">' + esc(tx('meeting.choosePerson')) + '</option>' + opts +
      '<option value="__other">' + esc(tx('meeting.otherPerson')) + '</option></select>' + btn('assign', tx('meeting.assignBtn'), 'sm pri', ' data-label="' + esc(s.label) + '"') + '</div>') + '</div>';
}
function bindSpeakerActs(m, names) {
  ACTS.listen = function (el) {
    var label = el.getAttribute('data-label');
    var box = el.parentNode.querySelector('.clip');
    if (!box) return;
    var src = 'api/clip?meetingId=' + enc(m.id) + '&label=' + enc(label) + '&t=' + enc(TOKEN);
    box.innerHTML = '<audio controls autoplay preload="auto" src="' + esc(src) + '"></audio>';
    var a = box.querySelector('audio');
    a.addEventListener('error', function () { box.innerHTML = '<div class="muted small">' + esc(tx('meeting.clipUnavailable')) + '</div>'; });
  };
  var sel = APP.querySelectorAll('select[data-slot]');
  for (var i = 0; i < sel.length; i++) {
    sel[i].addEventListener('change', async function (ev) {
      var s = ev.target;
      if (s.value !== '__other') return;
      var picked = await pickPeople({ title: tx('meeting.choosePerson') });
      if (!picked || !picked.length) { s.value = ''; return; }
      var o = document.createElement('option');
      o.value = picked[0];
      o.textContent = nm(names, picked[0]);
      s.insertBefore(o, s.lastChild);
      s.value = picked[0];
    });
  }
  ACTS.assign = function (el) {
    var label = el.getAttribute('data-label');
    var s = APP.querySelector('select[data-slot="' + label.replace(/"/g, '') + '"]');
    var pid = s ? s.value : '';
    if (!pid || pid === '__other') { toast(tx('meeting.choosePerson'), 'err'); return; }
    run(el, async function () {
      await api('meeting.speaker.assign', { id: m.id, label: label, personId: pid });
      toast(tx('meeting.assigned'));
      reload();
    });
  };
}
function bindUpload(m) {
  var input = document.getElementById('upf');
  var listBox = document.getElementById('upl-list');
  var startBtn = document.getElementById('up-start');
  var files = DRAFT.upload[m.id] || [];
  var draw = function () {
    listBox.innerHTML = files.map(function (f, i) {
      return '<div class="upl-file"><span class="grow ell">' + esc(f.name) + '</span><span class="muted small" id="upp-' + i + '">' + esc(fmtSize(f.size)) + '</span>' +
        (UPLOADING ? '' : '<button class="linkbtn bad" data-act="upDel" data-i="' + i + '">&times;</button>') + '</div>';
    }).join('');
    if (startBtn) startBtn.disabled = !files.length || UPLOADING;
  };
  if (input) input.addEventListener('change', function () {
    var picked = Array.prototype.slice.call(input.files || []);
    files = files.concat(picked);
    DRAFT.upload[m.id] = files;
    input.value = '';
    draw();
  });
  ACTS.upDel = function (el) { files.splice(Number(el.getAttribute('data-i')), 1); DRAFT.upload[m.id] = files; draw(); };
  ACTS.upStart = async function (el) {
    if (!files.length || UPLOADING) return;
    var max = META.maxUploadBytes;
    var total = 0;
    for (var i = 0; i < files.length; i++) {
      total += files[i].size;
      if (files[i].size > max) { toast(tx('meeting.uploadTooBig', { name: files[i].name, size: fmtSize(files[i].size), max: fmtSize(max) }), 'err'); return; }
    }
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.type === 'cellular' && total > 20 * 1024 * 1024) {
      if (!(await confirmBox(tx('meeting.uploadCellular', { size: fmtSize(total) })))) return;
    }
    var msg = document.getElementById('upl-msg');
    UPLOADING = true;
    el.disabled = true;
    draw();
    var paths = [];
    try {
      for (var k = 0; k < files.length; k++) {
        var f = files[k];
        if (msg) msg.textContent = tx('meeting.uploading', { i: k + 1, n: files.length, name: f.name });
        var cell = document.getElementById('upp-' + k);
        var up = await uploadFile(f, (function (c) {
          return function (loaded, tot) { if (c) c.textContent = Math.floor(loaded * 100 / (tot || 1)) + '%'; };
        })(cell));
        paths.push(up.path);
      }
      await api('meeting.upload', { id: m.id, paths: paths });
      UPLOADING = false;
      DRAFT.upload[m.id] = [];
      toast(tx('meeting.uploadDone'));
      reload();
    } catch (e) {
      UPLOADING = false;
      if (EXPIRED) return;
      if (msg) msg.textContent = '';
      toast(tx('meeting.uploadFailed', { msg: e && e.message ? e.message : e }), 'err');
      if (el.isConnected) el.disabled = false;
      draw();
    }
  };
  draw();
}

// ---------- plan ----------
PAGES.plan = async function (r, seq) {
  var id = r.parts[1] || '';
  var res = await Promise.all([api('meeting.get', { id: id }), people(), loadBoot(false)]);
  if (stale(seq)) return;
  var d = res[0] || {};
  var org = res[1] || { depts: [], people: [] };
  var m = d.meeting || {};
  var my = d.my || {};
  var names = d.names || {};
  var plan = m.plan || null;
  var editable = m.status === 'plan_confirm' && !!my.isPlanOwner && !!plan;
  var canOwner = m.status === 'pending_owner' && !!my.isHost;
  var deptName = function (did) { return deptNameOf(did) || did || '-'; };
  var html = topBar(tx('plan.title'), { back: true }) + '<div class="page' + (editable || canOwner ? ' with-bar' : '') + '">';
  html += '<div class="card"><div class="row" style="align-items:flex-start"><b class="grow" style="font-size:16.5px">' + esc(m.title) + '</b>' + meetingTag(m.status) + '</div>' +
    '<div class="muted small">' + esc(d.projectName || '') + '</div>' +
    '<div class="small" style="margin-top:6px">' + esc(planOwnerIds(plan).length ? tx('plan.owner', { name: namesOf(names, planOwnerIds(plan)) }) : tx('plan.ownerNone')) + '</div></div>';
  if (!plan) {
    html += '<div class="card">' + emptyBlock(tx('plan.none')) + '</div></div>';
    render(html);
    return;
  }
  if (plan.summary) html += '<div class="card"><h2>' + esc(tx('plan.summary')) + '</h2><div class="md">' + md(plan.summary) + '</div></div>';
  if (editable) html += '<div class="banner small">' + esc(tx('plan.editHint')) + '</div>';
  html += '<div class="sec-t" id="plan-count">' + esc(tx('plan.items', { n: (plan.items || []).length })) + '</div><div id="plan-items"></div>';
  if (editable) html += btn('planAdd', tx('plan.addItem'), 'block ghost');
  html += '</div>';
  var bar = '';
  if (editable) bar = btn('planSave', tx('plan.save'), 'ghost') + btn('planConfirm', tx('plan.confirm'), 'pri');
  else if (canOwner) bar = btn('planOwner', tx('meeting.ownerBtn'), 'pri');
  html += bottomBar(bar);
  render(html);

  var fresh = (plan.items || []).map(function (x) { return { id: x.id, deptId: x.deptId, title: x.title, standard: x.standard, due: x.due, decisionId: x.decisionId, assigneeId: x.assigneeId || '' }; });
  // First listed head of the department; missing or left counts as none (same rule as the main process)
  var leaderOf = function (did) {
    var dp = null;
    for (var k = 0; k < org.depts.length; k++) if (org.depts[k].id === did) dp = org.depts[k];
    var p = dp && dp.leaderIds && dp.leaderIds.length ? personOf(dp.leaderIds[0]) : null;
    return p && !p.left ? p : null;
  };
  var toText = function (it) {
    if (it.assigneeId) return nm(names, it.assigneeId);
    var l = leaderOf(it.deptId);
    return l ? tx('plan.toDefault', { name: l.name }) : '';
  };
  var draft = editable ? (DRAFT.plan[m.id] || fresh) : fresh;
  if (editable) DRAFT.plan[m.id] = draft; else delete DRAFT.plan[m.id];
  var box = document.getElementById('plan-items');
  var deptOpts = function (cur) {
    return '<option value="">' + esc(tx('plan.chooseDept')) + '</option>' + org.depts.map(function (dp) {
      return '<option value="' + esc(dp.id) + '"' + (dp.id === cur ? ' selected' : '') + '>' + esc(dp.name) + '</option>';
    }).join('');
  };
  var collect = function () {
    if (!editable) return draft;
    var nodes = box.querySelectorAll('.plan-item');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var it = draft[Number(n.getAttribute('data-i'))];
      if (!it) continue;
      it.deptId = val(n, '.pi-dept');
      it.title = val(n, '.pi-title').trim();
      it.standard = val(n, '.pi-std').trim();
      it.due = val(n, '.pi-due');
    }
    return draft;
  };
  var draw = function () {
    document.getElementById('plan-count').textContent = tx('plan.items', { n: draft.length });
    box.innerHTML = draft.map(function (it, i) {
      if (!editable) {
        return '<div class="card"><div class="row">' + tag(deptName(it.deptId)) + '<span class="muted small" style="margin-left:auto">' + esc(tx('task.due', { d: it.due || '-' })) + '</span></div>' +
          '<div style="font-weight:600;margin-top:6px">' + esc(it.title) + '</div>' + (it.standard ? '<div class="muted small" style="margin-top:2px">' + esc(tx('plan.standardLine', { text: it.standard })) + '</div>' : '') +
          (toText(it) ? '<div class="muted small" style="margin-top:2px">' + esc(tx('plan.toLine', { name: toText(it) })) + '</div>' : (it.deptId ? '<div class="small bad" style="margin-top:2px">' + esc(tx('plan.toNoLeader')) + '</div>' : '')) + '</div>';
      }
      return '<div class="card plan-item" data-i="' + i + '"><div class="row"><b>' + esc(tx('plan.itemNo', { n: i + 1 })) + '</b>' +
        '<button class="linkbtn bad" style="margin-left:auto" data-act="planDel" data-i="' + i + '">' + esc(tx('plan.removeItem')) + '</button></div>' +
        '<label class="f">' + esc(tx('plan.dept')) + '</label><select class="pi-dept">' + deptOpts(it.deptId) + '</select>' +
        '<label class="f">' + esc(tx('plan.itemTitle')) + '</label><textarea class="pi-title" rows="2">' + esc(it.title) + '</textarea>' +
        '<label class="f">' + esc(tx('plan.standard')) + '</label><textarea class="pi-std" rows="2">' + esc(it.standard) + '</textarea>' +
        '<label class="f">' + esc(tx('plan.due')) + '</label><input type="date" class="pi-due" value="' + esc(it.due || '') + '">' +
        '<label class="f">' + esc(tx('plan.to')) + '</label><div class="row">' +
        '<button class="btn ghost grow" data-act="planTo" data-i="' + i + '">' + esc(toText(it) || tx('plan.toPick')) + '</button>' +
        (it.assigneeId && leaderOf(it.deptId) ? '<button class="linkbtn" style="margin-left:8px" data-act="planToReset" data-i="' + i + '">' + esc(tx('plan.toReset')) + '</button>' : '') + '</div>' +
        (!toText(it) && it.deptId ? '<div class="small bad" style="margin-top:4px">' + esc(tx('plan.toNoLeader')) + '</div>' : '') + '</div>';
    }).join('');
    // Changing the department changes the default recipient
    var sels = box.querySelectorAll('.pi-dept');
    for (var s = 0; s < sels.length; s++) sels[s].addEventListener('change', function () { collect(); draw(); });
  };
  var validate = function () {
    collect();
    if (!draft.length) throw new Error(tx('plan.emptyItems'));
    draft.forEach(function (it, i) {
      if (!it.deptId || !it.title || !it.due) throw new Error(tx('plan.itemInvalid', { n: i + 1 }));
      if (!it.assigneeId && !leaderOf(it.deptId)) throw new Error(tx('plan.toMissing', { n: i + 1 }));
    });
    return draft.map(function (it) {
      var o = { id: it.id, deptId: it.deptId, title: it.title, standard: it.standard || '', due: it.due };
      if (it.decisionId) o.decisionId = it.decisionId;
      if (it.assigneeId) o.assigneeId = it.assigneeId;
      return o;
    });
  };
  var save = async function () {
    var items = validate();
    await api('meeting.plan.save', { id: m.id, items: items, summary: plan.summary });
  };
  draw();
  ACTS.planAdd = function () {
    collect();
    draft.push({ id: 'new-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), deptId: '', title: '', standard: '', due: '' });
    draw();
    var last = box.querySelector('.plan-item:last-child');
    if (last) scrollToEl(last);
  };
  ACTS.planDel = async function (el) {
    collect();
    if (!(await confirmBox(tx('plan.removeAsk'), tx('common.remove'), true))) return;
    draft.splice(Number(el.getAttribute('data-i')), 1);
    draw();
  };
  ACTS.planTo = async function (el) {
    collect();
    var it = draft[Number(el.getAttribute('data-i'))];
    if (!it) return;
    var picked = await pickPeople({ title: tx('plan.toPick'), selected: it.assigneeId ? [it.assigneeId] : [] });
    if (!picked || !picked.length) return;
    it.assigneeId = picked[0];
    draw();
  };
  ACTS.planToReset = function (el) {
    collect();
    var it = draft[Number(el.getAttribute('data-i'))];
    if (it) it.assigneeId = '';
    draw();
  };
  ACTS.planSave = function (el) {
    run(el, async function () { await save(); delete DRAFT.plan[m.id]; toast(tx('plan.savedToast')); reload(); });
  };
  ACTS.planConfirm = async function (el) {
    try { validate(); } catch (e) { toast(e.message, 'err'); return; }
    if (!(await confirmBox(tx('plan.confirmAsk'), tx('plan.confirm')))) return;
    run(el, async function () {
      await save();
      await api('meeting.plan.confirm', { id: m.id });
      delete DRAFT.plan[m.id];
      toast(tx('plan.confirmedToast'));
      await loadBoot(true);
      replaceHash('#/meeting/' + enc(m.id));
    });
  };
  ACTS.planOwner = async function (el) {
    var picked = await pickPeople({ title: tx('meeting.ownerBtn'), multi: true, selected: planOwnerIds(plan) });
    if (!picked || !picked.length) return;
    run(el, async function () { await api('meeting.plan.owner', { id: m.id, ownerIds: picked }); toast(tx('meeting.ownerSet', { name: namesOf(names, picked) })); reload(); });
  };
};

// ---------- tasks ----------
PAGES.tasks = async function (r, seq) {
  if (r.qs.get('view')) UI.taskView = r.qs.get('view');
  if (r.qs.has('status')) UI.taskStatus = r.qs.get('status') || '';
  var status = UI.taskStatus === 'overdue' ? undefined : (UI.taskStatus || undefined);
  var list = await api('task.list', { view: UI.taskView, status: status, q: UI.taskQ || undefined });
  await loadBoot(false);
  if (stale(seq)) return;
  list = list || [];
  if (UI.taskStatus === 'overdue') list = list.filter(function (t) { return t.overdue && t.status !== 'done' && t.status !== 'cancelled'; });
  var vchip = function (v, key) { return '<button class="chip' + (UI.taskView === v ? ' on' : '') + '" data-act="taskView" data-v="' + v + '">' + esc(tx(key)) + '</button>'; };
  var schip = function (v, text) { return '<button class="chip' + (UI.taskStatus === v ? ' on' : '') + '" data-act="taskStatus" data-v="' + v + '">' + esc(text) + '</button>'; };
  render(topBar(tx('tasks.title')) + '<div class="page"><div class="chips">' + vchip('received', 'tasks.viewReceived') + vchip('assigned', 'tasks.viewAssigned') + vchip('all', 'tasks.viewAll') + '</div>' +
    '<input type="search" class="search" id="tq" value="' + esc(UI.taskQ) + '" placeholder="' + esc(tx('common.searchPlaceholder')) + '">' +
    '<div class="chips">' + schip('', tx('tasks.filterAll')) + ['to_accept', 'not_started', 'in_progress', 'done'].map(function (s) { return schip(s, lbl('taskStatus', s)); }).join('') +
    schip('overdue', tx('tasks.filterOverdue')) + '</div>' +
    '<div class="card">' + (list.length ? list.map(taskRow).join('') : emptyBlock(tx('tasks.empty'))) + '</div></div>' + tabBar('tasks'));
  ACTS.taskView = function (el) { UI.taskView = el.getAttribute('data-v'); reload(); };
  ACTS.taskStatus = function (el) { UI.taskStatus = el.getAttribute('data-v'); reload(); };
  var q = document.getElementById('tq');
  if (q) q.addEventListener('change', function () { UI.taskQ = q.value.trim(); reload(); });
};

function changesForm(t, o) {
  var sugDue = o && o.suggestedDue ? o.suggestedDue : t.due;
  return '<label class="f">' + esc(tx('task.changesTitle')) + '</label>' +
    '<label class="f">' + esc(tx('task.newTitle')) + '</label><textarea id="c-title" rows="2">' + esc(t.title) + '</textarea>' +
    '<label class="f">' + esc(tx('task.newStandard')) + '</label><textarea id="c-std" rows="2">' + esc(t.standard) + '</textarea>' +
    '<label class="f">' + esc(tx('task.newDue')) + '</label><input type="date" id="c-due" value="' + esc(sugDue || '') + '">' +
    '<label class="chk" style="margin-top:12px"><input type="checkbox" id="c-cancel"><span class="bad">' + esc(tx('task.cancelTask')) + '</span></label>';
}
function collectChanges(sh, t) {
  var ch = {};
  if (sh.querySelector('#c-cancel') && sh.querySelector('#c-cancel').checked) { ch.cancel = true; return ch; }
  var ti = val(sh, '#c-title').trim();
  var sd = val(sh, '#c-std').trim();
  var du = val(sh, '#c-due');
  if (ti && ti !== t.title) ch.title = ti;
  if (sd !== (t.standard || '') && sd) ch.standard = sd;
  if (du && du !== t.due) ch.due = du;
  return ch;
}

PAGES.task = async function (r, seq) {
  var id = r.parts[1] || '';
  var res = await Promise.all([api('task.get', { id: id }), loadBoot(false), people().catch(function () { return null; })]);
  if (stale(seq)) return;
  var d = res[0] || {};
  var t = d.task || {};
  var can = d.can || {};
  var names = d.names || {};
  var o = t.objection && t.objection.stage !== 'resolved' ? t.objection : null;
  var od = t.overdue && t.status !== 'done' && t.status !== 'cancelled';
  var b = [];
  if (can.object) b.push(btn('object', tx('task.object'), 'ghost'));
  if (can.accept) b.push(btn('accept', tx('task.accept'), 'pri'));
  if (can.change) b.push(btn('change', tx('task.change'), 'ghost'));
  if (can.progress) b.push(btn('progress', tx('task.updateProgress'), ''));
  if (can.complete) b.push(btn('complete', tx('task.complete'), 'pri'));
  if (can.review) b.push(btn('reviewReject', tx('task.reject'), 'danger'), btn('reviewAdopt', tx('task.adopt'), 'pri'));
  if (can.reply) b.push(btn('replyAccept', tx('task.replyAccept'), 'ghost'));
  if (can.escalate) b.push(btn('escalate', tx('task.escalate'), 'pri'));
  if (can.arbitrate) b.push(btn('arbKeep', tx('task.keep'), 'ghost'), btn('arbAdjust', tx('task.adjust'), 'pri'));
  var html = topBar(tx('task.title'), { back: true }) + '<div class="page' + (b.length ? ' with-bar' : '') + '">';
  html += '<div class="card"><div class="row wrap">' + taskTag(t) + '<span class="small ' + (od ? 'bad' : 'muted') + '">' + esc(tx('task.due', { d: t.due || '-' })) +
    (od ? ' · ' + esc(tx('task.overdue', { n: t.overdueDays || 0 })) : '') + '</span></div>' +
    '<div style="font-size:17px;font-weight:700;margin:8px 0 4px;line-height:1.45">' + esc(t.title) + '</div>' +
    '<div class="muted small">' + esc(tx('task.dept', { dept: t.deptName || '', name: t.assigneeName || nm(names, t.assigneeId) })) + '</div>' +
    '<div class="muted small">' + esc(tx('task.owner', { name: t.ownerName || namesOf(names, taskOwnerIds(t)) })) + '</div>' +
    '<div class="muted small"><a href="#/meeting/' + enc(t.meetingId) + '">' + esc(t.meetingTitle || '') + '</a> · <a href="#/project/' + enc(t.projectId) + '">' + esc(t.projectName || '') + '</a></div>' +
    '<div class="row" style="margin-top:10px"><span class="small muted">' + esc(tx('task.progress')) + '</span>' + prog(t.percent, od) + '<b class="small">' + (t.percent || 0) + '%</b></div></div>';
  if (t.status === 'cancelled') html += '<div class="banner">' + esc(tx('task.cancelledNote')) + '</div>';
  html += '<div class="card"><h2>' + esc(tx('task.standard')) + '</h2><div class="ink2" style="white-space:pre-wrap">' + esc(t.standard || '-') + '</div></div>';
  if (o) {
    var rv = o.review;
    html += '<div class="card"><h2>' + esc(tx('task.objectionTitle', { target: lbl('objectionTarget', o.target) })) + tag(lbl('objectionStage', o.stage), 'warn') + '</h2><div class="side2">' +
      '<div><b>' + esc(tx('task.raisedBy', { name: nm(names, o.raisedBy), kind: lbl('objectionKind', o.kind) })) + '</b>' +
      '<div>' + esc(tx('task.reason', { text: o.reason || '-' })) + '</div>' + (o.suggestion ? '<div>' + esc(tx('task.suggestion', { text: o.suggestion })) + '</div>' : '') +
      (o.suggestedDue ? '<div>' + esc(tx('task.suggestedDue', { d: o.suggestedDue })) + '</div>' : '') + '</div>' +
      '<div><b>' + esc(tx('task.sideOwner')) + ' ' + esc(t.ownerName || namesOf(names, taskOwnerIds(t))) + '</b>' +
      (rv ? '<div>' + esc(tx('task.reviewBy', { name: nm(names, rv.by), decision: rv.decision === 'adopt' ? tx('task.reviewAdopt') : tx('task.reviewReject') })) + '</div><div>' + esc(rv.note || '') + '</div>'
        : '<div class="muted">' + esc(lbl('objectionStage', 'review')) + '</div>') + '</div></div>' +
      '<div class="muted small" style="margin-top:8px">' + esc(tx('task.duringObjection')) + '</div></div>';
  }
  var logs = (t.progressLog || []).slice().reverse();
  html += '<div class="card"><h2>' + esc(tx('task.progressLog')) + '</h2>' + (logs.length ? '<ul class="timeline">' + logs.map(function (l) {
    return '<li><b>' + esc(nm(names, l.by)) + '</b> ' + esc(lbl('taskStatus', l.status)) + ' · ' + (l.percent || 0) + '% <span class="muted small">' + esc(fmtDT(l.at)) + '</span>' +
      (l.note ? '<div class="ink2">' + esc(l.note) + '</div>' : '') + '</li>';
  }).join('') + '</ul>' : emptyBlock(tx('task.noLog'))) + '</div>';
  var evs = (t.events || []).slice().reverse();
  if (evs.length) {
    html += '<div class="card"><h2>' + esc(tx('task.events')) + '</h2><ul class="timeline">' + evs.map(function (e) {
      return '<li><b>' + esc(nm(names, e.by)) + '</b> ' + esc(lbl('taskEvent', e.action)) + ' <span class="muted small">' + esc(fmtDT(e.at)) + '</span>' + (e.note ? '<div class="ink2">' + esc(e.note) + '</div>' : '') + '</li>';
    }).join('') + '</ul></div>';
  }
  var hist = t.objectionHistory || [];
  if (hist.length) {
    html += '<div class="card"><h2>' + esc(tx('task.history')) + '</h2>' + hist.map(function (h) {
      return '<div class="list-item"><div class="row">' + tag(lbl('objectionKind', h.kind), 'gray') + '<b class="grow ell">' + esc(lbl('objectionTarget', h.target)) + '</b>' +
        (h.outcome ? tag(lbl('objectionOutcome', h.outcome), 'good') : '') + '</div><div class="muted small">' + esc(h.reason) + ' · ' + esc(fmtDT(h.raisedAt)) + '</div></div>';
    }).join('') + '</div>';
  }
  html += '</div>' + bottomBar(b.join(''));
  render(html);

  var done = function (msg) { toast(msg); loadBoot(true).catch(function () {}); reload(); };
  ACTS.accept = async function (el) {
    if (!(await confirmBox(tx('task.acceptAsk'), tx('task.accept')))) return;
    run(el, async function () { await api('task.accept', { id: t.id }); done(tx('task.acceptedToast')); });
  };
  var raise = function (kind) {
    var target = 'content';
    formSheet({
      title: kind === 'change' ? tx('task.changeTitle') : tx('task.objectTitle'),
      body: '<label class="f">' + esc(tx('task.targetLabel')) + '</label><div class="seg-ctl" id="tg">' + ['content', 'time', 'requirement'].map(function (k) {
        return '<button type="button" data-v="' + k + '" class="' + (k === target ? 'on' : '') + '">' + esc(lbl('objectionTarget', k)) + '</button>';
      }).join('') + '</div>' +
        '<label class="f">' + esc(tx('task.reasonLabel')) + '</label><textarea id="o-reason" placeholder="' + esc(tx('task.reasonPh')) + '"></textarea>' +
        '<label class="f">' + esc(tx('task.suggestionLabel')) + '</label><textarea id="o-sug" placeholder="' + esc(tx('task.suggestionPh')) + '"></textarea>' +
        '<div id="o-due-box" style="display:none"><label class="f">' + esc(tx('task.suggestedDueLabel')) + '</label><input type="date" id="o-due" value="' + esc(t.due || '') + '"></div>',
      onMount: function (sh) {
        var tg = sh.querySelector('#tg');
        tg.addEventListener('click', function (ev) {
          var bt = ev.target.closest('button');
          if (!bt) return;
          target = bt.getAttribute('data-v');
          Array.prototype.forEach.call(tg.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === bt); });
          sh.querySelector('#o-due-box').style.display = target === 'time' ? '' : 'none';
        });
      },
      submit: async function (sh) {
        var reason = need(val(sh, '#o-reason'), tx('task.reasonLabel'));
        var p = { id: t.id, target: target, reason: reason, suggestion: val(sh, '#o-sug').trim() };
        if (target === 'time' && val(sh, '#o-due')) p.suggestedDue = val(sh, '#o-due');
        await api('task.objection.raise', p);
      },
    }).then(function (ok) { if (ok) done(tx('task.raisedToast')); });
  };
  ACTS.object = function () { raise('objection'); };
  ACTS.change = function () { raise('change'); };
  ACTS.progress = function () {
    var status = t.status === 'in_progress' ? 'in_progress' : 'not_started';
    var opts = ['not_started', 'in_progress'].concat(can.complete ? ['done'] : []);
    formSheet({
      title: tx('task.updateProgress'),
      body: '<div style="font-weight:600;margin-bottom:4px">' + esc(t.title) + '</div><div class="muted small">' + esc(tx('task.due', { d: t.due })) + ' · ' + esc(tx('task.owner', { name: t.ownerName || '' })) + '</div>' +
        '<label class="f">' + esc(tx('task.statusLabel')) + '</label><div class="seg-ctl" id="ps">' + opts.map(function (k) {
          return '<button type="button" data-v="' + k + '" class="' + (k === status ? 'on' : '') + '">' + esc(lbl('taskStatus', k)) + '</button>';
        }).join('') + '</div>' +
        '<label class="f" id="pp-l">' + esc(tx('task.percentLabel', { n: t.percent || 0 })) + '</label><input type="range" id="pp" min="0" max="100" step="5" value="' + (t.percent || 0) + '">' +
        '<label class="f">' + esc(tx('task.noteLabel')) + '</label><textarea id="pn" placeholder="' + esc(tx('task.notePh')) + '"></textarea>',
      onMount: function (sh) {
        var pp = sh.querySelector('#pp');
        var pl = sh.querySelector('#pp-l');
        pp.addEventListener('input', function () {
          pl.textContent = tx('task.percentLabel', { n: pp.value });
          if (Number(pp.value) > 0 && status === 'not_started') { status = 'in_progress'; sync(); }
        });
        var ps = sh.querySelector('#ps');
        var sync = function () { Array.prototype.forEach.call(ps.querySelectorAll('button'), function (x) { x.classList.toggle('on', x.getAttribute('data-v') === status); }); };
        ps.addEventListener('click', function (ev) {
          var bt = ev.target.closest('button');
          if (!bt) return;
          status = bt.getAttribute('data-v');
          if (status === 'done') { pp.value = 100; pl.textContent = tx('task.percentLabel', { n: 100 }); }
          sync();
        });
      },
      submit: async function (sh) {
        var note = val(sh, '#pn').trim();
        if (status === 'done') await api('task.complete', { id: t.id, note: note });
        else await api('task.progress', { id: t.id, percent: Number(val(sh, '#pp')) || 0, note: note, status: status });
      },
    }).then(function (ok) { if (ok) done(tx('task.progressSaved')); });
  };
  ACTS.complete = function () {
    formSheet({
      title: tx('task.complete'),
      okText: tx('task.complete'),
      body: '<div class="sheet-msg">' + esc(tx('task.completeAsk')) + '</div><label class="f">' + esc(tx('task.completeNote')) + '</label><textarea id="cn"></textarea>',
      submit: async function (sh) { await api('task.complete', { id: t.id, note: val(sh, '#cn').trim() }); },
    }).then(function (ok) { if (ok) done(tx('task.completedToast')); });
  };
  var review = function (decision) {
    formSheet({
      title: tx('task.reviewTitle'),
      okText: decision === 'adopt' ? tx('task.adopt') : tx('task.reject'),
      danger: decision === 'reject',
      body: '<label class="f">' + esc(tx('task.reviewNote')) + '</label><textarea id="rv-note" placeholder="' + esc(tx('task.reviewNotePh')) + '"></textarea>' + (decision === 'adopt' ? changesForm(t, o) : ''),
      submit: async function (sh) {
        var note = need(val(sh, '#rv-note'), tx('task.reviewNote'));
        var p = { id: t.id, decision: decision, note: note };
        if (decision === 'adopt') p.changes = collectChanges(sh, t);
        await api('task.objection.review', p);
      },
    }).then(function (ok) { if (ok) done(tx('task.reviewedToast')); });
  };
  ACTS.reviewAdopt = function () { review('adopt'); };
  ACTS.reviewReject = function () { review('reject'); };
  ACTS.replyAccept = async function (el) {
    if (!(await confirmBox(tx('task.replyAcceptAsk'), tx('task.replyAccept')))) return;
    run(el, async function () { await api('task.objection.reply', { id: t.id, decision: 'accept' }); done(tx('task.repliedToast')); });
  };
  ACTS.escalate = async function (el) {
    if (!(await confirmBox(tx('task.escalateAsk'), tx('task.escalate')))) return;
    run(el, async function () { await api('task.objection.reply', { id: t.id, decision: 'escalate' }); done(tx('task.repliedToast')); });
  };
  var arbitrate = function (decision) {
    formSheet({
      title: tx('task.arbitrateTitle'),
      okText: decision === 'keep' ? tx('task.keep') : tx('task.adjust'),
      body: '<label class="f">' + esc(tx('task.arbitrateNote')) + '</label><textarea id="ab-note" placeholder="' + esc(tx('task.arbitrateNotePh')) + '"></textarea>' + (decision === 'adjust' ? changesForm(t, o) : ''),
      submit: async function (sh) {
        var note = need(val(sh, '#ab-note'), tx('task.arbitrateNote'));
        var p = { id: t.id, decision: decision, note: note };
        if (decision === 'adjust') p.changes = collectChanges(sh, t);
        await api('task.objection.arbitrate', p);
      },
    }).then(function (ok) { if (ok) done(tx('task.arbitratedToast')); });
  };
  ACTS.arbKeep = function () { arbitrate('keep'); };
  ACTS.arbAdjust = function () { arbitrate('adjust'); };
};

// ---------- projects ----------
PAGES.projects = async function (r, seq) {
  var list = await api('project.list', { status: UI.projStatus || undefined, q: UI.projQ || undefined });
  await loadBoot(false);
  if (stale(seq)) return;
  list = list || [];
  var chip = function (v, text) { return '<button class="chip' + (UI.projStatus === v ? ' on' : '') + '" data-act="projStatus" data-v="' + v + '">' + esc(text) + '</button>'; };
  var canCreate = BOOT && BOOT.me && BOOT.me.canCreateProject;
  var right = canCreate ? '<button class="side" data-go="#/new-project" aria-label="' + esc(tx('projects.create')) + '">' + icon('plus') + '</button>' : '';
  render(topBar(tx('projects.title'), { right: right }) + '<div class="page"><input type="search" class="search" id="pq" value="' + esc(UI.projQ) + '" placeholder="' + esc(tx('common.searchPlaceholder')) + '">' +
    '<div class="chips">' + chip('active', lbl('projectStatus', 'active')) + chip('closing', lbl('projectStatus', 'closing')) + chip('archived', lbl('projectStatus', 'archived')) + chip('', tx('common.all')) + '</div>' +
    '<div class="card">' + (list.length ? list.map(projectRow).join('') : emptyBlock(tx('projects.empty'))) + '</div></div>' + tabBar('projects'));
  ACTS.projStatus = function (el) { UI.projStatus = el.getAttribute('data-v'); reload(); };
  var q = document.getElementById('pq');
  if (q) q.addEventListener('change', function () { UI.projQ = q.value.trim(); reload(); });
};

PAGES.project = async function (r, seq) {
  var id = r.parts[1] || '';
  var res = await Promise.all([api('project.get', { id: id }), loadBoot(false), people().catch(function () { return null; })]);
  if (stale(seq)) return;
  var d = res[0] || {};
  var p = d.project || {};
  var can = d.can || {};
  var s = d.stats || {};
  var isOwner = p.ownerId === myId();
  var html = topBar(tx('project.title'), { back: true }) + '<div class="page' + (can.close ? ' with-bar' : '') + '">';
  html += '<div class="card"><div class="row" style="align-items:flex-start"><b class="grow" style="font-size:17px">' + esc(p.name) + '</b>' + projectTag(p.status) + '</div>' +
    '<div class="muted small">' + esc(tx('project.owner', { name: d.ownerName || nm(null, p.ownerId) })) + '</div>' +
    (p.desc ? '<div class="ink2 small" style="margin-top:6px;white-space:pre-wrap">' + esc(p.desc) + '</div>' : '') + '</div>';
  if (p.status === 'closing') html += '<div class="banner warn">' + esc(tx('project.closingNote')) + '</div>';
  if (p.status === 'archived') html += '<div class="banner">' + esc(tx('project.archivedNote', { d: fmtDate(p.archivedAt) })) + '</div>';
  var blockers = d.closeBlockers || [];
  if (blockers.length && p.status === 'active') {
    html += '<div class="banner warn"><b>' + esc(tx('project.blockers')) + '</b>' + blockers.map(function (b) {
      return '<div class="small">' + esc((T.project.blockerKind[b.kind] || b.kind) + ' · ' + b.title + ' · ' + b.reason) + '</div>';
    }).join('') + '</div>';
  }
  html += '<div class="kpis">' +
    '<div class="kpi"><span>' + esc(tx('project.statMeetings')) + '</span><b class="big">' + (s.meetings || 0) + '</b></div>' +
    '<div class="kpi"><span>' + esc(tx('project.statTasks')) + '</span><b class="big">' + (s.done || 0) + ' / ' + (s.total || 0) + '</b></div>' +
    '<div class="kpi"><span>' + esc(tx('project.statOverdue')) + '</span><b class="big ' + (s.overdue ? 'bad' : '') + '">' + (s.overdue || 0) + '</b></div>' +
    '<div class="kpi"><span>' + esc(tx('project.statObjections')) + '</span><b class="big">' + (s.objections || 0) + '</b></div>' +
    '<div class="kpi"><span>' + esc(tx('project.statWeek')) + '</span><b class="big pri">' + (s.weekRate || 0) + '%</b></div></div>';
  var acts = [];
  if (can.createMeeting) acts.push('<a class="btn sm" href="#/new-meeting?project=' + enc(p.id) + '">' + esc(tx('project.createMeeting')) + '</a>');
  if (p.summary || p.status !== 'active') acts.push('<a class="btn sm" href="#/summary/' + enc(p.id) + '">' + esc(tx('project.summary')) + '</a>');
  if (isOwner && p.status === 'active') acts.push(btn('genReport', tx('project.genReport'), 'sm ghost'));
  if (acts.length) html += '<div class="row wrap" style="margin-bottom:12px">' + acts.join('') + '</div>';
  var dp = d.deptProgress || [];
  if (dp.length) {
    html += '<div class="card"><h2>' + esc(tx('project.deptProgress')) + '</h2>' + dp.map(function (x) {
      var rate = x.total ? Math.round(x.done * 100 / x.total) : 0;
      return '<div class="dept-row"><span class="nm">' + esc(x.name) + '</span>' + prog(rate) + '<span class="v">' + (x.done || 0) + '/' + (x.total || 0) + '</span></div>';
    }).join('') + '</div>';
  }
  var members = d.members || [];
  html += '<div class="card"><h2>' + esc(tx('project.members', { n: members.length })) + (can.editMembers ? '<button class="linkbtn r" style="margin-left:auto" data-act="editMembers">' + esc(tx('project.editMembers')) + '</button>' : '') + '</h2>' +
    '<div class="chips-person">' + members.map(function (mm) { return '<span>' + avatar(mm.name) + esc(mm.name) + '</span>'; }).join('') + '</div></div>';
  var ms = d.meetings || [];
  html += '<div class="card"><h2>' + esc(tx('project.meetings')) + '<span class="n muted">' + ms.length + '</span></h2>' + (ms.length ? ms.map(meetingRow).join('') : emptyBlock(tx('project.noMeetings'))) + '</div>';
  var ts = d.tasks || [];
  html += '<div class="card"><h2>' + esc(tx('project.tasks')) + '<span class="n muted">' + ts.length + '</span></h2>' + (ts.length ? ts.map(taskRow).join('') : emptyBlock(tx('project.noTasks'))) + '</div>';
  var dec = d.decisions || [];
  if (dec.length) {
    html += '<div class="card"><h2>' + esc(tx('project.decisions')) + '</h2><ul class="timeline">' + dec.map(function (x) {
      return '<li>' + esc(x.text) + '<div class="muted small">' + esc([x.meetingTitle, fmtDate(x.at)].filter(Boolean).join(' · ')) + '</div></li>';
    }).join('') + '</ul></div>';
  }
  var reps = (p.weeklyReports || []).slice().sort(function (a, b) { return (b.generatedAt || 0) - (a.generatedAt || 0); });
  html += '<div class="card"><h2>' + esc(tx('project.reports')) + '</h2>' + (reps.length ? reps.map(function (rp) {
    return '<div class="list-item row" data-go="#/report/' + enc(p.id) + '/' + enc(rp.id) + '"><span class="grow">' + esc(rp.periodFrom ? tx('report.period', { from: fmtDate(rp.periodFrom), to: fmtDate(rp.periodTo) }) : fmtDate(rp.generatedAt)) + '</span>' +
      '<span class="muted small">' + esc(tx('report.rate')) + ' ' + ((rp.stats && rp.stats.completionRate) || 0) + '%</span></div>';
  }).join('') : emptyBlock(tx('project.noReports'))) + '</div>';
  html += '</div>' + bottomBar(can.close ? btn('closeProject', tx('project.close'), 'pri') : '');
  render(html);

  ACTS.editMembers = async function () {
    var picked = await pickPeople({ multi: true, title: tx('project.editMembers'), selected: p.memberIds || members.map(function (x) { return x.id; }) });
    if (!picked) return;
    run(null, async function () { await api('project.members', { id: p.id, memberIds: picked }); toast(tx('project.membersSaved')); reload(); });
  };
  ACTS.genReport = function (el) {
    run(el, async function () {
      var rep = await api('project.report.generate', { id: p.id });
      toast(tx('project.genReportDone'));
      if (rep && rep.id) go('#/report/' + enc(p.id) + '/' + enc(rep.id)); else reload();
    });
  };
  ACTS.closeProject = async function (el) {
    if (!(await confirmBox(tx('project.closeAsk'), tx('project.close')))) return;
    var res2 = await run(el, function () { return api('project.close', { id: p.id }); });
    if (!res2) return;
    if (res2.ok) { toast(tx('project.closeOk')); reload(); return; }
    await openSheet({
      title: tx('project.blockers'),
      body: '<div class="sheet-msg">' + esc(tx('project.closeFail')) + '</div>' + (res2.items || []).map(function (it) {
        return '<div class="list-item"><div class="row">' + tag(T.project.blockerKind[it.kind] || it.kind, 'warn') + '<b class="grow ell">' + esc(it.title) + '</b></div><div class="muted small">' + esc(it.reason) + '</div></div>';
      }).join(''),
      actions: [{ text: tx('common.ok'), cls: 'pri', value: true }],
    });
    reload();
  };
};

function reportStats(st, kind) {
  st = st || {};
  if (kind === 'weekly') {
    return '<div class="kpis"><div class="kpi"><span>' + esc(tx('report.rate')) + '</span><b class="big pri">' + (st.completionRate || 0) + '%</b></div>' +
      '<div class="kpi"><span>' + esc(tx('report.overdue')) + '</span><b class="big ' + (st.overdue ? 'bad' : '') + '">' + (st.overdue || 0) + '</b></div></div>';
  }
  var k = function (key, v, cls) { return '<div class="kpi"><span>' + esc(tx(key)) + '</span><b class="big ' + (cls || '') + '">' + v + '</b></div>'; };
  return '<div class="kpis k3">' + k('summary.statRate', (st.completionRate || 0) + '%', 'pri') + k('summary.statTotal', st.total || 0) + k('summary.statOnTime', st.onTime || 0, 'good') +
    k('summary.statLate', st.late || 0, st.late ? 'warn' : '') + k('summary.statCancelled', st.cancelled || 0) + k('summary.statOverdue', st.overdue || 0, st.overdue ? 'bad' : '') + '</div>';
}

PAGES.summary = async function (r, seq) {
  var id = r.parts[1] || '';
  var res = await Promise.all([api('project.get', { id: id }), loadBoot(false), people().catch(function () { return null; })]);
  if (stale(seq)) return;
  var d = res[0] || {};
  var p = d.project || {};
  var can = d.can || {};
  var rep = p.summary || null;
  var editable = !!can.reviewSummary && p.status === 'closing' && !!rep && !rep.approvedAt;
  var html = topBar(tx('summary.title'), { back: true }) + '<div class="page' + (editable ? ' with-bar' : '') + '">';
  html += '<div class="card"><div class="row"><b class="grow" style="font-size:16.5px">' + esc(p.name) + '</b>' + projectTag(p.status) + '</div>' +
    (rep && rep.generatedAt ? '<div class="muted small">' + esc(fmtDT(rep.generatedAt)) + '</div>' : '') + '</div>';
  if (p.status === 'archived') html += '<div class="banner">' + esc(tx('project.archivedNote', { d: fmtDate(p.archivedAt) })) + '</div>';
  if (!rep) {
    html += '<div class="card">' + emptyBlock(p.status === 'closing' ? tx('summary.generating') : tx('summary.none')) + '</div></div>';
    render(html);
    if (p.status === 'closing') later(reload, 5000);
    return;
  }
  html += reportStats(rep.stats, 'summary');
  if (editable) html += '<div class="banner small">' + esc(tx('summary.editHint')) + '</div>';
  var blocks = splitBlocks(rep.markdown);
  html += '<div class="card md">' + blocks.map(function (b, i) {
    return '<div class="mdblk" id="blk-' + i + '">' + (editable ? '<button class="linkbtn" data-act="blkEdit" data-i="' + i + '">' + esc(tx('common.edit')) + '</button>' : '') + '<div class="blk-body">' + md(b) + '</div></div>';
  }).join('') + '</div>';
  var foot = [];
  if (rep.editedAt) foot.push(tx('summary.editedAt', { d: fmtDT(rep.editedAt) }));
  if (rep.approvedAt) foot.push(tx('summary.approvedAt', { name: nm(null, rep.approvedBy), d: fmtDT(rep.approvedAt) }));
  if (foot.length) html += '<div class="muted small" style="text-align:center">' + esc(foot.join(' · ')) + '</div>';
  html += '</div>' + bottomBar(editable ? btn('sumRegen', tx('summary.regenerate'), 'ghost') + btn('sumApprove', tx('summary.approve'), 'pri') : '');
  render(html);
  if (!editable) return;
  ACTS.blkEdit = function (el) {
    var i = Number(el.getAttribute('data-i'));
    var box = document.getElementById('blk-' + i);
    if (!box || box.querySelector('textarea')) return;
    el.style.display = 'none';
    box.querySelector('.blk-body').innerHTML = '<textarea rows="8">' + esc(blocks[i]) + '</textarea><div class="row" style="justify-content:flex-end;margin:6px 0">' +
      btn('blkCancel', tx('common.cancel'), 'sm ghost') + btn('blkSave', tx('common.save'), 'sm pri', ' data-i="' + i + '"') + '</div>';
  };
  ACTS.blkCancel = function () { reload(); };
  ACTS.blkSave = function (el) {
    var i = Number(el.getAttribute('data-i'));
    var ta = document.querySelector('#blk-' + i + ' textarea');
    if (!ta) return;
    var next = blocks.slice();
    next[i] = ta.value;
    run(el, async function () { await api('project.summary.save', { id: p.id, markdown: joinBlocks(next) }); toast(tx('common.saved')); reload(); });
  };
  ACTS.sumRegen = async function (el) {
    if (!(await confirmBox(tx('summary.regenerateAsk'), tx('summary.regenerate'), true))) return;
    run(el, async function () { await api('project.summary.regenerate', { id: p.id }); toast(tx('summary.regenerating')); reload(); });
  };
  ACTS.sumApprove = async function (el) {
    if (!(await confirmBox(tx('summary.approveAsk'), tx('summary.approve')))) return;
    run(el, async function () { await api('project.summary.approve', { id: p.id }); toast(tx('summary.approvedToast')); await loadBoot(true); reload(); });
  };
};

PAGES.report = async function (r, seq) {
  var pid = r.parts[1] || '';
  var rid = r.parts[2] || '';
  var d = await api('project.get', { id: pid });
  if (stale(seq)) return;
  var p = (d && d.project) || {};
  var reps = (p.weeklyReports || []).slice().sort(function (a, b) { return (b.generatedAt || 0) - (a.generatedAt || 0); });
  var rep = null;
  for (var i = 0; i < reps.length; i++) if (reps[i].id === rid) rep = reps[i];
  if (!rep && p.summary && (p.summary.id === rid || !rid)) rep = p.summary;
  if (!rep && !rid) rep = reps[0] || null;
  var html = topBar(rep && rep.kind === 'summary' ? tx('summary.title') : tx('report.title'), { back: true }) + '<div class="page">';
  if (!rep) {
    render(html + '<div class="card">' + emptyBlock(tx('report.notFound')) + '</div></div>');
    return;
  }
  html += '<div class="card"><b style="font-size:16.5px">' + esc(p.name) + '</b><div class="muted small">' +
    esc(rep.periodFrom ? tx('report.period', { from: fmtDate(rep.periodFrom), to: fmtDate(rep.periodTo) }) : fmtDT(rep.generatedAt)) + '</div></div>';
  html += reportStats(rep.stats, rep.kind === 'summary' ? 'summary' : 'weekly');
  var dp = d.deptProgress || [];
  if (dp.length && rep.kind !== 'summary') {
    html += '<div class="card"><h2>' + esc(tx('project.deptProgress')) + '</h2>' + dp.map(function (x) {
      var rate = x.total ? Math.round(x.done * 100 / x.total) : 0;
      return '<div class="dept-row"><span class="nm">' + esc(x.name) + '</span>' + prog(rate) + '<span class="v">' + rate + '%</span></div>';
    }).join('') + '</div>';
  }
  html += '<div class="card md">' + md(rep.markdown) + '</div></div>';
  render(html);
};

// ---------- me ----------
PAGES.me = async function (r, seq) {
  var res = await Promise.all([loadBoot(true), people().catch(function () { return null; }), api('voiceprint.list').catch(function () { return null; })]);
  if (stale(seq)) return;
  var me = BOOT.me || {};
  var p = me.person || {};
  var vp = null;
  (res[2] || []).forEach(function (x) { if (x && x.person && x.person.id === p.id) vp = x; });
  var collected = vp && vp.status === 'collected';
  var html = topBar(tx('me.title')) + '<div class="page">';
  html += '<div class="card row">' + avatar(p.name, 'lg') + '<div class="grow"><div style="font-size:18px;font-weight:700">' + esc(p.name || '') + '</div>' +
    '<div class="muted small">' + esc([deptNameOf(p.deptId), p.title].filter(Boolean).join(' · ')) + '</div>' +
    '<div class="row wrap" style="margin-top:4px">' + (me.isAdmin ? tag(tx('me.admin')) : '') + (me.canCreateProject ? tag(tx('me.creator'), 'gray') : '') + '</div></div></div>';
  html += '<div class="card">' +
    '<a class="list-item row" href="#/notices"><span class="grow">' + esc(tx('me.notices')) + '</span><span class="muted">&#8250;</span></a>' +
    '<a class="list-item row" href="v?t=' + enc(TOKEN) + '"><span class="grow">' + esc(tx('me.voiceprint')) + '</span>' +
    (vp ? tag(collected ? tx('me.voiceCollected') : tx('me.voiceMissing'), collected ? 'good' : 'gray') : '') + '<span class="muted">&#8250;</span></a>' +
    (collected ? '<div class="list-item row" data-act="vpWithdraw"><span class="grow bad">' + esc(tx('me.voiceWithdraw')) + '</span></div>' : '') + '</div>';
  html += '<div class="muted small" style="padding:4px 6px">' + esc(tx('me.about')) + '</div></div>' + tabBar('me');
  render(html);
  ACTS.vpWithdraw = async function (el) {
    if (!(await confirmBox(tx('me.voiceWithdrawAsk'), tx('me.voiceWithdraw'), true))) return;
    run(el, async function () { await api('voiceprint.delete', { personId: p.id }); toast(tx('me.voiceWithdrawn')); reload(); });
  };
};

PAGES.voice = async function () { location.href = 'v?t=' + enc(TOKEN); };

// ---------- create forms ----------
function localDT(ms) {
  var d = new Date(ms);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function parseDT(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(s || ''));
  if (!m) return 0;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5])).getTime();
}

PAGES['new-meeting'] = async function (r, seq) {
  var res = await Promise.all([api('project.list', { status: 'active' }), people(), loadBoot(false)]);
  if (stale(seq)) return;
  var projects = (res[0] || []).filter(function (p) { return p.status === 'active'; });
  var me = myId();
  if (!DRAFT.newMeeting) {
    var t0 = Date.now() + 30 * 60000;
    t0 = t0 - (t0 % (30 * 60000));
    DRAFT.newMeeting = { projectId: r.qs.get('project') || (projects[0] && projects[0].id) || '', title: '', time: localDT(t0), source: 'offline', hostId: me, attendeeIds: me ? [me] : [] };
  } else if (r.qs.get('project')) DRAFT.newMeeting.projectId = r.qs.get('project');
  var f = DRAFT.newMeeting;
  var draw = function () {
    var html = topBar(tx('newMeeting.title'), { back: true }) + '<div class="page with-bar"><div class="card">' +
      '<label class="f">' + esc(tx('newMeeting.project')) + '</label>' + (projects.length ? '<select id="nm-project">' + projects.map(function (p) {
        return '<option value="' + esc(p.id) + '"' + (p.id === f.projectId ? ' selected' : '') + '>' + esc(p.name) + '</option>';
      }).join('') + '</select>' : '<div class="muted">' + esc(tx('newMeeting.projectNone')) + '</div>') +
      '<label class="f">' + esc(tx('newMeeting.meetingTitle')) + '</label><input type="text" id="nm-title" value="' + esc(f.title) + '" placeholder="' + esc(tx('newMeeting.meetingTitlePh')) + '">' +
      '<label class="f">' + esc(tx('newMeeting.time')) + '</label><input type="datetime-local" id="nm-time" value="' + esc(f.time) + '">' +
      '<label class="f">' + esc(tx('newMeeting.source')) + '</label><div class="seg-ctl" id="nm-src">' + ['offline', 'tencent', 'zoom'].map(function (k) {
        return '<button type="button" data-v="' + k + '" class="' + (k === f.source ? 'on' : '') + '">' + esc(lbl('meetingSource', k)) + '</button>';
      }).join('') + '</div>' +
      '<label class="f">' + esc(tx('newMeeting.host')) + '</label><div class="row">' + personChips(f.hostId ? [f.hostId] : [], null) + '<button class="linkbtn" style="margin-left:auto" data-act="nmHost">' + esc(tx('newMeeting.pick')) + '</button></div>' +
      '<label class="f">' + esc(tx('newMeeting.attendees', { n: f.attendeeIds.length })) + '</label>' + personChips(f.attendeeIds, null) +
      '<button class="linkbtn" data-act="nmAtt">' + esc(tx('newMeeting.pick')) + '</button></div></div>' +
      bottomBar(btn('nmSubmit', tx('newMeeting.submit'), 'pri'));
    render(html);
    var bind = function (sel, key) { var el = document.getElementById(sel); if (el) el.addEventListener('input', function () { f[key] = el.value; }); if (el && el.tagName === 'SELECT') el.addEventListener('change', function () { f[key] = el.value; }); };
    bind('nm-project', 'projectId');
    bind('nm-title', 'title');
    bind('nm-time', 'time');
    var src = document.getElementById('nm-src');
    src.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      f.source = b.getAttribute('data-v');
      Array.prototype.forEach.call(src.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    });
  };
  draw();
  ACTS.nmHost = async function () {
    var picked = await pickPeople({ title: tx('newMeeting.host'), selected: [f.hostId] });
    if (!picked || !picked.length) return;
    f.hostId = picked[0];
    if (f.attendeeIds.indexOf(f.hostId) < 0) f.attendeeIds.unshift(f.hostId);
    draw();
  };
  ACTS.nmAtt = async function () {
    var picked = await pickPeople({ multi: true, title: tx('newMeeting.attendees', { n: f.attendeeIds.length }), selected: f.attendeeIds });
    if (!picked) return;
    f.attendeeIds = picked;
    if (f.hostId && f.attendeeIds.indexOf(f.hostId) < 0) f.attendeeIds.unshift(f.hostId);
    draw();
  };
  ACTS.nmSubmit = function (el) {
    run(el, async function () {
      need(f.projectId, tx('newMeeting.project'));
      var title = need(f.title, tx('newMeeting.meetingTitle'));
      var time = parseDT(f.time);
      if (!time) need('', tx('newMeeting.time'));
      need(f.hostId, tx('newMeeting.host'));
      var mt = await api('meeting.create', { projectId: f.projectId, title: title, time: time, source: f.source, hostId: f.hostId, attendeeIds: f.attendeeIds });
      DRAFT.newMeeting = null;
      toast(tx('newMeeting.createdToast'));
      replaceHash(mt && mt.id ? '#/meeting/' + enc(mt.id) : '#/meetings');
    });
  };
  return false;
};

PAGES['new-project'] = async function (r, seq) {
  await Promise.all([people(), loadBoot(false)]);
  if (stale(seq)) return;
  var me = myId();
  if (!DRAFT.newProject) DRAFT.newProject = { name: '', desc: '', ownerId: me, memberIds: me ? [me] : [] };
  var f = DRAFT.newProject;
  var draw = function () {
    render(topBar(tx('newProject.title'), { back: true }) + '<div class="page with-bar"><div class="card">' +
      '<label class="f">' + esc(tx('newProject.name')) + '</label><input type="text" id="np-name" value="' + esc(f.name) + '">' +
      '<label class="f">' + esc(tx('newProject.desc')) + '</label><textarea id="np-desc">' + esc(f.desc) + '</textarea>' +
      '<label class="f">' + esc(tx('newProject.owner')) + '</label><div class="row">' + personChips(f.ownerId ? [f.ownerId] : [], null) + '<button class="linkbtn" style="margin-left:auto" data-act="npOwner">' + esc(tx('newMeeting.pick')) + '</button></div>' +
      '<label class="f">' + esc(tx('newProject.members', { n: f.memberIds.length })) + '</label>' + personChips(f.memberIds, null) +
      '<button class="linkbtn" data-act="npMembers">' + esc(tx('newMeeting.pick')) + '</button></div></div>' + bottomBar(btn('npSubmit', tx('newProject.submit'), 'pri')));
    var n = document.getElementById('np-name');
    var ds = document.getElementById('np-desc');
    n.addEventListener('input', function () { f.name = n.value; });
    ds.addEventListener('input', function () { f.desc = ds.value; });
  };
  draw();
  ACTS.npOwner = async function () {
    var picked = await pickPeople({ title: tx('newProject.owner'), selected: [f.ownerId] });
    if (!picked || !picked.length) return;
    f.ownerId = picked[0];
    draw();
  };
  ACTS.npMembers = async function () {
    var picked = await pickPeople({ multi: true, title: tx('newProject.members', { n: f.memberIds.length }), selected: f.memberIds });
    if (!picked) return;
    f.memberIds = picked;
    draw();
  };
  ACTS.npSubmit = function (el) {
    run(el, async function () {
      var name = need(f.name, tx('newProject.name'));
      need(f.ownerId, tx('newProject.owner'));
      var p = await api('project.create', { name: name, desc: String(f.desc || '').trim(), ownerId: f.ownerId, memberIds: f.memberIds });
      DRAFT.newProject = null;
      toast(tx('newProject.createdToast'));
      replaceHash(p && p.id ? '#/project/' + enc(p.id) : '#/projects');
    });
  };
  return false;
};

// ---------- start ----------
async function start() {
  if (!TOKEN) { showExpired(); return; }
  try {
    await Promise.all([loadMeta(), loadBoot(true)]);
  } catch (e) {
    if (EXPIRED) return;
    render(topBar(tx('appTitle')) + '<div class="err"><p>' + esc(e && e.message ? e.message : e) + '</p>' + btn('restart', tx('common.retry'), 'pri') + '</div>');
    ACTS.restart = function () { location.reload(); };
    return;
  }
  if (!BOOT || !BOOT.me || !BOOT.me.person) {
    render('<div class="expired"><div class="ic">?</div><h1>' + esc(tx('voice.noPerson')) + '</h1><p>' + esc(tx('home.noPerson')) + '</p></div>');
    return;
  }
  if (!location.hash || location.hash === '#' || location.hash === '#/') {
    try { history.replaceState(null, '', location.pathname + location.search + '#/home'); } catch (e) { /* ignore */ }
  }
  STACK = [location.hash || '#/home'];
  route(false);
}
window.__mmApp = { route: route, linkHash: linkHash, parseHash: parseHash, md: md, splitBlocks: splitBlocks, joinBlocks: joinBlocks, ready: start() };
`;

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/mobile/voiceScript.ts
var MM_VOICE_JS = String.raw`
var ROOT = document.getElementById('app');
var V = { step: 'loading', me: null, deptName: '', agreed: false, file: null, url: '', dur: 0, recSecs: 0, err: '', result: null, existing: null, rec: null, micFailed: false, progress: 0, checking: false };
var IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
// iPhone and the WeCom in-app browser have no system audio recorder for file inputs (capture opens the camera),
// so on those we never offer a capture button; they record in the page over https or pick an audio file.
var VIDEO_FIRST = IS_IOS || /wxwork/i.test(navigator.userAgent || '');

function canInPageRecord() {
  return !V.micFailed && !!window.isSecureContext && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && typeof window.MediaRecorder === 'function';
}
function stepBar(n) {
  return '<div class="vp-step">' + [1, 2, 3].map(function (i) { return '<i class="' + (i <= n ? 'on' : '') + '"></i>'; }).join('') + '</div>';
}
function header() {
  return '<header class="top"><span class="side"></span><h1>' + esc(tx('voice.title')) + '</h1><span class="side"></span></header>';
}
function personLine() {
  var p = V.me || {};
  return tx('voice.authorizer', { name: p.name || '', dept: V.deptName ? ' · ' + V.deptName : '' });
}
function draw() {
  if (EXPIRED) return;
  var s = V.step;
  var html = header() + '<div class="page' + (s === 'consent' || s === 'review' ? ' with-bar' : '') + '">';
  var bar = '';
  if (s === 'loading') {
    html += '<div class="loading">' + esc(tx('common.loading')) + '</div>';
  } else if (s === 'nouser') {
    html += '<div class="expired" style="margin-top:12vh"><div class="ic">?</div><h1>' + esc(tx('voice.noPerson')) + '</h1><p>' + esc(tx('voice.noPersonHint')) + '</p></div>';
  } else if (s === 'error') {
    html += '<div class="err"><p>' + esc(V.err) + '</p><button class="btn pri" data-v="reload">' + esc(tx('common.retry')) + '</button></div>';
  } else if (s === 'consent') {
    html += stepBar(1) + '<div class="card"><h2>' + esc(tx('voice.consentTitle')) + '</h2><div class="ink2">' + esc(tx('voice.consentIntro', { name: (V.me && V.me.name) || '' })) + '</div></div>';
    if (V.existing) html += '<div class="banner warn small">' + esc(tx('voice.already', { time: fmtDT(V.existing.enrolledAt || V.existing.consentAt) })) + '</div>';
    html += '<div class="card">' + [['purposeTitle', 'purpose'], ['scopeTitle', 'scope'], ['storeTitle', 'store'], ['withdrawTitle', 'withdraw']].map(function (k) {
      return '<div style="margin-bottom:10px"><b>' + esc(tx('voice.' + k[0])) + '</b><div class="ink2 small">' + esc(tx('voice.' + k[1])) + '</div></div>';
    }).join('') + '</div>';
    html += '<div class="card"><label class="chk"><input type="checkbox" id="agree"' + (V.agreed ? ' checked' : '') + '><span>' + esc(tx('voice.agree')) + '</span></label>' +
      '<div class="muted small" style="margin-top:10px">' + esc(personLine()) + '</div><div class="muted small">' + esc(tx('voice.authTimeLater')) + '</div></div>';
    bar = '<button class="btn pri" data-v="start" id="start"' + (V.agreed ? '' : ' disabled') + '>' + esc(tx('voice.start')) + '</button>';
  } else if (s === 'record') {
    var p = V.me || {};
    html += stepBar(2) + '<div class="card"><h2>' + esc(tx('voice.recordTitle')) + '</h2><div class="muted small" style="margin-bottom:8px">' + esc(tx('voice.recordTip')) + '</div>' +
      '<div class="vp-script">' + esc(tx('voice.script', { dept: V.deptName || '', name: p.name || '' })) + '</div></div>';
    if (canInPageRecord()) {
      var on = !!V.rec;
      html += '<div class="card"><button class="rec' + (on ? ' on' : '') + '" data-v="' + (on ? 'recStop' : 'recStart') + '">' + esc(on ? tx('voice.recStop') : tx('voice.recStart')) + '</button>' +
        '<div class="rec-t" id="rec-t">' + esc(tx('voice.recTimer', { s: on ? Math.floor((Date.now() - V.rec.t0) / 1000) : 0 })) + '</div></div>';
      html += '<label class="btn ghost block"><input type="file" accept="audio/*" class="hidden-input" id="f-pick">' + esc(tx('voice.recPickFile')) + '</label>';
    } else {
      // Audio only, never video. Explain why the page can't record and give the ways that still record audio.
      if (!window.isSecureContext) {
        html += '<div class="banner warn">' + esc(tx('voice.httpNoMic')) + '</div>';
        if (META.httpsBase) html += '<a class="btn pri block" style="min-height:52px;margin-bottom:10px" href="' + esc(META.httpsBase + '/v?t=' + encodeURIComponent(TOKEN)) + '">' + esc(tx('voice.openHttps')) + '</a>';
      } else if (V.micFailed) {
        html += '<div class="banner warn">' + esc(tx('voice.micBlocked')) + '</div><button class="btn block" style="margin-bottom:10px" data-v="micRetry">' + esc(tx('voice.micRetry')) + '</button>';
      }
      if (!VIDEO_FIRST) html += '<label class="btn ' + (META.httpsBase && !window.isSecureContext ? 'ghost' : 'pri') + ' block" style="min-height:52px;margin-bottom:10px"><input type="file" accept="audio/*" capture class="hidden-input" id="f-rec">' + esc(tx('voice.recNative')) + '</label>';
      html += '<label class="btn ghost block" style="margin-bottom:10px"><input type="file" accept="audio/*" class="hidden-input" id="f-pick">' + esc(tx('voice.recPickAudio')) + '</label>' +
        '<div class="muted small">' + esc(tx('voice.recPickAudioHint')) + '</div>';
    }
  } else if (s === 'review') {
    var secs = V.dur || V.recSecs || 0;
    html += stepBar(3) + '<div class="card"><h2>' + esc(tx('voice.reviewTitle')) + '</h2><div class="muted small">' + esc(tx('voice.reviewTip')) + '</div>' +
      '<audio controls preload="metadata" id="pv" src="' + esc(V.url) + '"></audio><div id="pv-info" class="small muted">' + (secs ? esc(tx('voice.durationLabel', { s: Math.round(secs) })) : '') + '</div>' +
      (secs && secs < 9.5 ? '<div class="small warn">' + esc(tx('voice.tooShortLocal', { s: Math.round(secs) })) + '</div>' : '') + '</div>';
    if (V.err) html += '<div class="banner bad"><b>' + esc(tx('voice.failTitle')) + '</b>' + esc(V.err) + '</div>';
    bar = '<button class="btn ' + (V.err ? 'pri' : 'ghost') + '" data-v="rerecord">' + esc(tx('voice.rerecord')) + '</button>' +
      '<button class="btn ' + (V.err ? 'ghost' : 'pri') + '" data-v="submit">' + esc(tx('voice.submit')) + '</button>';
  } else if (s === 'submitting') {
    html += stepBar(3) + '<div class="card" style="text-align:center;padding:40px 14px"><div class="loading" style="padding:0" id="sub-t">' +
      esc(V.checking ? tx('voice.checking') : tx('voice.uploading', { p: V.progress })) + '</div></div>';
  } else if (s === 'done') {
    var r = V.result || {};
    var sec = r.sampleSeconds || r.seconds;
    html += '<div class="okmark">&#10003;</div><div style="text-align:center"><div style="font-size:20px;font-weight:700">' + esc(tx('voice.doneTitle')) + '</div>' +
      '<p class="ink2" style="margin:8px 16px">' + esc(tx('voice.doneBody', { name: (V.me && V.me.name) || '' })) + '</p>' +
      (sec ? '<div class="muted small">' + esc(tx('voice.doneSeconds', { s: Math.round(sec) })) + '</div>' : '') +
      '<div class="muted small">' + esc(personLine()) + '</div><div class="muted small">' + esc(tx('voice.authTime', { time: fmtDT(r.consentAt || Date.now()) })) + '</div>' +
      '<a class="btn ghost" style="margin-top:20px" href="m?t=' + encodeURIComponent(TOKEN) + '#/me">' + esc(tx('voice.backHome')) + '</a></div>';
  }
  html += '</div>' + (bar ? '<div class="bar"><div class="bar-in">' + bar + '</div></div>' : '');
  ROOT.innerHTML = html;
  bind();
}

function bind() {
  var agree = document.getElementById('agree');
  if (agree) agree.addEventListener('change', function () {
    V.agreed = agree.checked;
    var b = document.getElementById('start');
    if (b) b.disabled = !V.agreed;
  });
  ['f-rec', 'f-pick'].forEach(function (id) {
    var inp = document.getElementById(id);
    if (!inp) return;
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      inp.value = '';
      if (!f) return;
      if (f.size > META.maxUploadBytes) { toast(tx('common.tooLarge', { max: fmtSize(META.maxUploadBytes) }), 'err'); return; }
      V.recSecs = 0;
      setFile(f);
    });
  });
  var pv = document.getElementById('pv');
  if (pv) {
    pv.addEventListener('loadedmetadata', function () {
      if (isFinite(pv.duration) && pv.duration > 0 && !V.recSecs) {
        V.dur = pv.duration;
        var info = document.getElementById('pv-info');
        if (info) info.textContent = tx('voice.durationLabel', { s: Math.round(V.dur) });
        if (V.dur < 9.5 && info) info.insertAdjacentHTML('afterend', '<div class="small warn">' + esc(tx('voice.tooShortLocal', { s: Math.round(V.dur) })) + '</div>');
      }
    });
    pv.addEventListener('error', function () {
      var info = document.getElementById('pv-info');
      pv.style.display = 'none';
      if (info) info.textContent = tx('voice.noPreview');
    });
  }
}

function setFile(f) {
  if (V.url) { try { URL.revokeObjectURL(V.url); } catch (e) { /* ignore */ } }
  V.file = f;
  V.url = URL.createObjectURL(f);
  V.dur = 0;
  V.err = '';
  V.step = 'review';
  draw();
}

async function recStart() {
  var stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true } });
  } catch (e) {
    V.micFailed = true;
    toast(tx('voice.micDenied'));
    draw();
    return;
  }
  var types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  var mime = '';
  for (var i = 0; i < types.length; i++) {
    if (window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported(types[i])) { mime = types[i]; break; }
  }
  var mr;
  try { mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); }
  catch (e) { stream.getTracks().forEach(function (t) { t.stop(); }); V.micFailed = true; draw(); return; }
  var chunks = [];
  mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
  mr.onstop = function () {
    stream.getTracks().forEach(function (t) { t.stop(); });
    var type = mr.mimeType || mime || 'audio/webm';
    var ext = /mp4|aac/.test(type) ? 'm4a' : /ogg/.test(type) ? 'ogg' : 'webm';
    var blob = new Blob(chunks, { type: type });
    var file;
    try { file = new File([blob], 'voiceprint.' + ext, { type: type }); } catch (e) { file = blob; file.name = 'voiceprint.' + ext; }
    setFile(file);
  };
  V.rec = { mr: mr, t0: Date.now(), timer: 0 };
  V.recSecs = 0;
  mr.start(250);
  draw();
  V.rec.timer = setInterval(function () {
    if (!V.rec) return;
    var secs = (Date.now() - V.rec.t0) / 1000;
    var el = document.getElementById('rec-t');
    if (el) el.textContent = tx('voice.recTimer', { s: Math.floor(secs) });
    if (secs >= 15) { toast(tx('voice.recAutoStop')); recStop(); }
  }, 250);
}
function recStop() {
  if (!V.rec) return;
  clearInterval(V.rec.timer);
  V.recSecs = (Date.now() - V.rec.t0) / 1000;
  var mr = V.rec.mr;
  V.rec = null;
  if (V.recSecs < 10) toast(tx('voice.recTooShort'), 'err');
  try { mr.stop(); } catch (e) { draw(); }
}

async function submit() {
  if (!V.file) { V.step = 'record'; draw(); return; }
  V.step = 'submitting';
  V.progress = 0;
  V.checking = false;
  draw();
  var label = function () {
    var el = document.getElementById('sub-t');
    if (el) el.textContent = V.checking ? tx('voice.checking') : tx('voice.uploading', { p: V.progress });
  };
  try {
    var up = await uploadFile(V.file, function (loaded, total) { V.progress = Math.floor(loaded * 100 / (total || 1)); label(); });
    V.checking = true;
    label();
    var res = await api('voiceprint.enroll', { personId: V.me.id, path: up.path, consent: true });
    V.result = res || {};
    V.step = 'done';
    draw();
  } catch (e) {
    if (EXPIRED) return;
    V.err = e && e.message ? e.message : String(e);
    V.step = 'review';
    draw();
  }
}

ROOT.addEventListener('click', function (ev) {
  var el = ev.target && ev.target.closest ? ev.target.closest('[data-v]') : null;
  if (!el) return;
  var a = el.getAttribute('data-v');
  if (a === 'start' && V.agreed) { V.step = 'record'; draw(); }
  else if (a === 'recStart') recStart();
  else if (a === 'micRetry') { V.micFailed = false; draw(); }
  else if (a === 'recStop') recStop();
  else if (a === 'rerecord') {
    if (V.url) { try { URL.revokeObjectURL(V.url); } catch (e) { /* ignore */ } }
    V.file = null; V.url = ''; V.err = ''; V.dur = 0; V.recSecs = 0;
    V.step = 'record';
    draw();
  }
  else if (a === 'submit') submit();
  else if (a === 'reload') location.reload();
});

async function startVoice() {
  if (!TOKEN) { showExpired(); return; }
  draw();
  var boot;
  try {
    await loadMeta();
    boot = await api('boot');
  } catch (e) {
    if (EXPIRED) return;
    V.err = e && e.message ? e.message : String(e);
    V.step = 'error';
    draw();
    return;
  }
  if (!boot || !boot.me || !boot.me.person) { V.step = 'nouser'; draw(); return; }
  V.me = boot.me.person;
  try {
    var org = await api('people.list');
    (org && org.depts || []).forEach(function (d) { if (d.id === V.me.deptId) V.deptName = d.name; });
  } catch (e) { /* dept name is optional */ }
  try {
    var list = await api('voiceprint.list');
    (list || []).forEach(function (x) { if (x && x.person && x.person.id === V.me.id && x.status === 'collected') V.existing = x; });
  } catch (e) { /* only admins may list; ignore */ }
  if (EXPIRED) return;
  V.step = 'consent';
  draw();
}
window.__mmVoice = { state: V, ready: startVoice() };
`;

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/mobile/pages.ts
var LS = String.fromCharCode(8232);
var PS = String.fromCharCode(8233);
function scriptSafeJson(v) {
  return JSON.stringify(v).replace(/</g, "\\u003c").split(LS).join("\\u2028").split(PS).join("\\u2029");
}
function escHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function head(title) {
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="format-detection" content="telephone=no"><meta name="referrer" content="no-referrer"><title>${escHtml(title)}</title><style>${MM_MOBILE_CSS}</style></head>`;
}
function buildPageScript(pageJs) {
  return `(function(){"use strict";var T=${scriptSafeJson(MM_MOBILE_TEXT)};${MM_CLIENT_COMMON_JS}
${pageJs}
})();`;
}
function shell(title, pageJs) {
  return `${head(title)}<body><div id="app"></div><script>${buildPageScript(pageJs)}</script></body></html>`;
}
var MEETING_MOBILE_APP_HTML = shell(mmText("appTitle"), MM_APP_JS);
var MEETING_VOICE_PAGE_HTML = shell(mmText("voiceTitle"), MM_VOICE_JS);
var expiredBody = `<body><div id="app"><div class="expired"><div class="ic">!</div><h1>${escHtml(mmText("expired.title"))}</h1><p>${escHtml(mmText("expired.body"))}</p><p class="muted">${escHtml(mmText("expired.hint"))}</p></div></div>`;
var MM_TOKEN_STORAGE_KEY = "mm.token";
var MEETING_MOBILE_EXPIRED_HTML = `${head(mmText("expired.title"))}${expiredBody}</body></html>`;
var MEETING_MOBILE_EXPIRED_CLEAR_HTML = `${head(mmText("expired.title"))}${expiredBody}<script>try{localStorage.removeItem(${JSON.stringify(MM_TOKEN_STORAGE_KEY)})}catch(e){}</script></body></html>`;
var MEETING_GROUP_ENTRY_HTML = `${head(mmText("group.title"))}<body><div id="app"><div class="expired"><p id="g-open">${escHtml(mmText("group.opening"))}</p><div id="g-need" style="display:none"><div class="ic">i</div><h1>${escHtml(mmText("group.need"))}</h1><p class="muted">${escHtml(mmText("group.how"))}</p></div></div></div><script>(function(){var t='';try{t=localStorage.getItem(${JSON.stringify(MM_TOKEN_STORAGE_KEY)})||''}catch(e){}var p='m';try{if(new URLSearchParams(location.search).get('p')==='v')p='v'}catch(e){}if(t){location.replace(p+'?t='+encodeURIComponent(t)+location.hash);return}document.getElementById('g-open').style.display='none';document.getElementById('g-need').style.display='block'})();</script></body></html>`;

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/mobile/server.ts
var MM_MOBILE_DEFAULT_PORT = 8280;
var MM_MOBILE_MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;
var JSON_BODY_LIMIT = 2 * 1024 * 1024;
var UPLOAD_TTL_MS = 24 * 36e5;
var SWEEP_INTERVAL_MS = 36e5;
var CLIP_CACHE_TTL_MS = 6e4;
var CLIP_CACHE_MAX = 16;
var UPLOAD_DIR_RE = /^p-[0-9a-f]{12}$/;
var UPLOAD_FILE_RE = /^\d{8}-\d{6}-[0-9a-f]{6}-/;
var MM_MOBILE_ACTIONS = /* @__PURE__ */ new Set([
  "boot",
  "people.list",
  "home.get",
  "notice.list",
  "notice.read",
  "project.list",
  "project.get",
  "project.create",
  "project.members",
  "project.close",
  "project.summary.regenerate",
  "project.summary.save",
  "project.summary.approve",
  "project.report.generate",
  "meeting.list",
  "meeting.get",
  "meeting.create",
  "meeting.upload",
  "meeting.retry",
  "meeting.speaker.assign",
  "meeting.speaker.clip",
  "meeting.segment.audio",
  "meeting.segment.edit",
  "meeting.segment.speaker",
  "meeting.confirm",
  "meeting.review.return",
  "meeting.review.approve",
  "meeting.decide",
  "meeting.plan.owner",
  "meeting.plan.save",
  "meeting.plan.confirm",
  "task.list",
  "task.get",
  "task.accept",
  "task.progress",
  "task.complete",
  "task.objection.raise",
  "task.objection.review",
  "task.objection.reply",
  "task.objection.arbitrate",
  "voiceprint.list",
  "voiceprint.enroll",
  "voiceprint.autoLearn.set",
  "voiceprint.delete"
]);
function mobileHashFor(link) {
  if (!link) return "#/home";
  const id = encodeURIComponent(link.id || "");
  switch (link.kind) {
    case "meeting":
      return `#/meeting/${id}${link.anchor ? `?anchor=${encodeURIComponent(link.anchor)}` : ""}`;
    case "meeting_plan":
      return `#/plan/${id}`;
    case "task":
      return `#/task/${id}`;
    case "project":
      return `#/project/${id}`;
    case "project_summary":
      return `#/summary/${id}`;
    case "report":
      return `#/report/${id}${link.anchor ? `/${encodeURIComponent(link.anchor)}` : ""}`;
    default:
      return "#/home";
  }
}
function isLanOnlyUrl(url) {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^\[|\]$/g, "");
  } catch {
    return false;
  }
  if (!host) return false;
  if (host === "localhost" || /\.(local|lan|home|internal|intranet|corp|home\.arpa)$/.test(host)) return true;
  const v4 = /^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(host);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    return a === 10 || a === 127 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 169 && b === 254 || a === 100 && b >= 64 && b <= 127;
  }
  if (host.includes(":")) return host === "::1" || /^f[cd]/.test(host) || /^fe[89ab]/.test(host);
  return !host.includes(".");
}
function buildGroupUrl(baseUrl, link, page) {
  const base = baseUrl.replace(/\/+$/, "");
  return page === "voiceprint" ? `${base}/g?p=v` : `${base}/g${mobileHashFor(link)}`;
}
function buildMobileUrl(baseUrl, token, link) {
  return `${baseUrl.replace(/\/+$/, "")}/m?t=${encodeURIComponent(token)}${mobileHashFor(link)}`;
}
function buildVoiceprintUrl(baseUrl, token) {
  return `${baseUrl.replace(/\/+$/, "")}/v?t=${encodeURIComponent(token)}`;
}
function isInside(root, p) {
  const rel = (0, import_node_path2.relative)((0, import_node_path2.resolve)(root), (0, import_node_path2.resolve)(p));
  return !!rel && !rel.startsWith("..") && !(0, import_node_path2.isAbsolute)(rel);
}
function safeUploadName(raw) {
  let n = (0, import_node_path2.basename)(String(raw || "").replace(/\\/g, "/"));
  n = Array.from(n).map((ch) => {
    const code = ch.charCodeAt(0);
    return code < 32 || code === 127 || '<>:"/\\|?*'.includes(ch) ? "_" : ch;
  }).join("").replace(/\s+/g, " ").trim().replace(/^\.+/, "");
  if (!n) n = "upload.bin";
  if (n.length > 80) {
    const ext = (0, import_node_path2.extname)(n).slice(0, 12);
    n = n.slice(0, 80 - ext.length) + ext;
  }
  return n;
}
function personKey(personId) {
  return `p-${(0, import_node_crypto4.createHash)("sha1").update(String(personId)).digest("hex").slice(0, 12)}`;
}
function stamp(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
function safeUnlink(p) {
  try {
    (0, import_node_fs3.unlinkSync)(p);
  } catch {
  }
}
function sweepUploads(root, now = Date.now(), ttlMs = UPLOAD_TTL_MS) {
  let removed = 0;
  let dirs = [];
  try {
    dirs = (0, import_node_fs3.readdirSync)(root);
  } catch {
    return 0;
  }
  for (const d of dirs) {
    if (!UPLOAD_DIR_RE.test(d)) continue;
    const dir = (0, import_node_path2.join)(root, d);
    let files = [];
    try {
      files = (0, import_node_fs3.readdirSync)(dir);
    } catch {
      continue;
    }
    for (const f of files) {
      if (!UPLOAD_FILE_RE.test(f)) continue;
      const p = (0, import_node_path2.join)(dir, f);
      try {
        const st = (0, import_node_fs3.statSync)(p);
        if (st.isFile() && now - st.mtimeMs > ttlMs) {
          (0, import_node_fs3.unlinkSync)(p);
          removed++;
        }
      } catch {
      }
    }
  }
  return removed;
}
function tokenOf(req) {
  const h = String(req.headers.authorization || "");
  if (h.startsWith("Bearer ")) return h.slice(7).trim();
  try {
    return new URL(req.url || "/", "http://x").searchParams.get("t") || "";
  } catch {
    return "";
  }
}
function queryOf(req) {
  try {
    return new URL(req.url || "/", "http://x").searchParams;
  } catch {
    return new URLSearchParams();
  }
}
function errMsg(e) {
  const m = e instanceof Error ? e.message : String(e ?? "");
  return (m || "INTERNAL").slice(0, 500);
}
function sendJson(res, code, data, close = false) {
  if (res.headersSent) {
    try {
      res.end();
    } catch {
    }
    return;
  }
  const body = JSON.stringify(data);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...close ? { Connection: "close" } : {}
  });
  res.end(body);
}
function closeSoon(req, res) {
  if (req.complete) return;
  try {
    req.resume();
  } catch {
  }
  const kill = () => {
    const t = setTimeout(() => {
      try {
        req.socket?.destroy();
      } catch {
      }
    }, 1e3);
    t.unref?.();
  };
  if (res.writableFinished) kill();
  else res.once("finish", kill);
}
var CSP = [
  "default-src 'self'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob: data:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'"
].join("; ");
function prepare(html) {
  return { html, gz: (0, import_node_zlib.gzipSync)(Buffer.from(html, "utf-8")), etag: `"${(0, import_node_crypto4.createHash)("sha1").update(html).digest("hex").slice(0, 16)}"` };
}
function sendPage(req, res, page, status = 200) {
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": status === 200 ? "no-cache" : "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": CSP,
    Vary: "Accept-Encoding"
  };
  if (status === 200) {
    headers.ETag = page.etag;
    if (req.headers["if-none-match"] === page.etag) {
      res.writeHead(304, { ETag: page.etag });
      res.end();
      return;
    }
  }
  const gz = String(req.headers["accept-encoding"] || "").includes("gzip");
  if (gz) headers["Content-Encoding"] = "gzip";
  res.writeHead(status, headers);
  res.end(gz ? page.gz : page.html);
}
function decodeClip(r) {
  const fromDataUrl = (s) => {
    if (!s.startsWith("data:")) return null;
    const comma = s.indexOf(",");
    if (comma < 0) return null;
    const meta = s.slice(5, comma);
    const body = s.slice(comma + 1);
    const isB64 = /;base64$/i.test(meta) || /;base64;/i.test(meta);
    const mime = meta.split(";")[0] || "audio/wav";
    const buf = isB64 ? Buffer.from(body, "base64") : Buffer.from(decodeURIComponent(body), "utf-8");
    return buf.length ? { buf, mime } : null;
  };
  if (typeof r === "string") return fromDataUrl(r);
  if (!r || typeof r !== "object") return null;
  const o = r;
  if (typeof o.dataUrl === "string" && o.dataUrl) return fromDataUrl(o.dataUrl);
  const p = typeof o.path === "string" ? o.path : typeof o.clipPath === "string" ? o.clipPath : "";
  return p ? { path: p } : null;
}
function sendBuffer(req, res, buf, mime) {
  const total = buf.length;
  const range = req.headers.range;
  const m = range ? /bytes=(\d*)-(\d*)/.exec(range) : null;
  const base = { "Content-Type": mime, "Accept-Ranges": "bytes", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (m && (m[1] || m[2])) {
    let start;
    let end;
    if (!m[1]) {
      start = Math.max(0, total - parseInt(m[2], 10));
      end = total - 1;
    } else {
      start = parseInt(m[1], 10);
      end = m[2] ? parseInt(m[2], 10) : total - 1;
    }
    if (!Number.isFinite(end) || end >= total) end = total - 1;
    if (!Number.isFinite(start) || start < 0 || start > end) {
      res.writeHead(416, { "Content-Range": `bytes */${total}` });
      res.end();
      return;
    }
    res.writeHead(206, { ...base, "Content-Range": `bytes ${start}-${end}/${total}`, "Content-Length": String(end - start + 1) });
    res.end(buf.subarray(start, end + 1));
    return;
  }
  res.writeHead(200, { ...base, "Content-Length": String(total) });
  res.end(buf);
}
var AUDIO_MIME = {
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".opus": "audio/ogg",
  ".webm": "audio/webm",
  ".flac": "audio/flac"
};
async function startMeetingMobileServer(o) {
  const maxUpload = o.maxUploadBytes && o.maxUploadBytes > 0 ? o.maxUploadBytes : MM_MOBILE_MAX_UPLOAD_BYTES;
  const uploadRoot = (0, import_node_path2.resolve)(o.uploadDir);
  const dataRoot = (0, import_node_path2.resolve)(o.dataDir);
  const badTokens = new import_lanServer.RateBucket(30, 6e4);
  const appPage = prepare(MEETING_MOBILE_APP_HTML);
  const voicePage = prepare(MEETING_VOICE_PAGE_HTML);
  const expiredPage = prepare(MEETING_MOBILE_EXPIRED_HTML);
  const expiredClearPage = prepare(MEETING_MOBILE_EXPIRED_CLEAR_HTML);
  const groupPage = prepare(MEETING_GROUP_ENTRY_HTML);
  const clipCache = /* @__PURE__ */ new Map();
  const log2 = (msg, meta) => {
    try {
      o.log?.(msg, meta);
    } catch {
    }
  };
  const personDir = (personId) => (0, import_node_path2.join)(uploadRoot, personKey(personId));
  const ownsUpload = (personId, p) => {
    if (typeof p !== "string" || !p) return false;
    const abs = (0, import_node_path2.resolve)(p);
    if (!isInside(personDir(personId), abs) || !UPLOAD_FILE_RE.test((0, import_node_path2.basename)(abs))) return false;
    try {
      return (0, import_node_fs3.statSync)(abs).isFile();
    } catch {
      return false;
    }
  };
  const authPerson = (c, page) => {
    if (badTokens.locked(c.clientIp)) {
      if (page) sendPage(c.req, c.res, expiredPage, 429);
      else sendJson(c.res, 429, { ok: false, error: "TOO_MANY" }, true);
      return null;
    }
    const token = tokenOf(c.req);
    let personId = null;
    if (token) {
      try {
        personId = o.personByToken(token) || null;
      } catch (e) {
        log2("personByToken failed", { err: errMsg(e) });
        personId = null;
      }
    }
    if (!personId) {
      if (token && badTokens.fail(c.clientIp)) log2("mobile token brute-force locked", { ip: c.clientIp });
      if (page) sendPage(c.req, c.res, expiredClearPage, 401);
      else sendJson(c.res, 401, { ok: false, error: "UNAUTHORIZED" }, !c.req.complete);
      return null;
    }
    badTokens.pass(c.clientIp);
    return personId;
  };
  const pageRoute = (path, page) => ({
    method: "GET",
    path,
    auth: "none",
    handler: (c) => {
      if (authPerson(c, page)) sendPage(c.req, c.res, page);
    }
  });
  const handleInvoke = async (c) => {
    const personId = authPerson(c);
    if (!personId) {
      closeSoon(c.req, c.res);
      return;
    }
    let body;
    try {
      body = await c.body();
    } catch {
      sendJson(c.res, 413, { ok: false, error: "TOO_LARGE", max: JSON_BODY_LIMIT }, true);
      closeSoon(c.req, c.res);
      return;
    }
    const action = typeof body?.action === "string" ? body.action : "";
    if (!action) {
      sendJson(c.res, 400, { ok: false, error: "BAD_REQUEST" });
      return;
    }
    if (!MM_MOBILE_ACTIONS.has(action)) {
      sendJson(c.res, 403, { ok: false, error: "FORBIDDEN_ACTION" });
      return;
    }
    let payload = body.payload && typeof body.payload === "object" && !Array.isArray(body.payload) ? body.payload : {};
    let cleanup2 = null;
    if (action === "meeting.upload") {
      const paths = Array.isArray(payload.paths) ? payload.paths : [];
      if (!paths.length || !paths.every((p) => ownsUpload(personId, p))) {
        sendJson(c.res, 400, { ok: false, error: "BAD_PATH" });
        return;
      }
      payload = { ...payload, paths: paths.map((p) => (0, import_node_path2.resolve)(p)) };
    } else if (action === "voiceprint.enroll") {
      if (!ownsUpload(personId, payload.path)) {
        sendJson(c.res, 400, { ok: false, error: "BAD_PATH" });
        return;
      }
      cleanup2 = (0, import_node_path2.resolve)(payload.path);
      payload = { ...payload, personId, path: cleanup2 };
    } else if (action === "voiceprint.delete") {
      payload = { ...payload, personId };
    }
    try {
      const data = await o.dispatch(personId, action, payload);
      sendJson(c.res, 200, { ok: true, data: data === void 0 ? null : data });
    } catch (e) {
      const msg = errMsg(e);
      log2("mobile invoke failed", { action, personId, err: msg });
      sendJson(c.res, 400, { ok: false, error: msg });
    } finally {
      if (cleanup2) safeUnlink(cleanup2);
    }
  };
  const handleUpload = async (c) => {
    const personId = authPerson(c);
    if (!personId) {
      closeSoon(c.req, c.res);
      return;
    }
    const declared = Number(c.req.headers["content-length"]);
    if (Number.isFinite(declared) && declared > maxUpload) {
      sendJson(c.res, 413, { ok: false, error: "TOO_LARGE", max: maxUpload }, true);
      closeSoon(c.req, c.res);
      return;
    }
    const q = queryOf(c.req);
    let headerName = "";
    try {
      headerName = decodeURIComponent(String(c.req.headers["x-file-name"] || ""));
    } catch {
      headerName = "";
    }
    const name = safeUploadName(q.get("name") || headerName);
    const dir = personDir(personId);
    try {
      (0, import_node_fs3.mkdirSync)(dir, { recursive: true });
    } catch (e) {
      log2("mobile upload mkdir failed", { err: errMsg(e) });
      sendJson(c.res, 500, { ok: false, error: "WRITE_FAILED" }, true);
      closeSoon(c.req, c.res);
      return;
    }
    const file = (0, import_node_path2.join)(dir, `${stamp(/* @__PURE__ */ new Date())}-${(0, import_node_crypto4.randomBytes)(3).toString("hex")}-${name}`);
    await new Promise((done) => {
      const ws = (0, import_node_fs3.createWriteStream)(file, { flags: "wx" });
      let size = 0;
      let settled = false;
      const fail2 = (code, error, extra) => {
        if (settled) return;
        settled = true;
        c.req.unpipe(ws);
        ws.destroy();
        ws.once("close", () => safeUnlink(file));
        safeUnlink(file);
        sendJson(c.res, code, { ok: false, error, ...extra || {} }, true);
        closeSoon(c.req, c.res);
        done();
      };
      c.req.on("data", (chunk) => {
        size += chunk.length;
        if (size > maxUpload) fail2(413, "TOO_LARGE", { max: maxUpload });
      });
      c.req.on("error", () => fail2(400, "ABORTED"));
      c.req.on("close", () => {
        if (!c.req.complete) fail2(400, "ABORTED");
      });
      ws.on("error", (e) => {
        log2("mobile upload write failed", { err: errMsg(e) });
        fail2(500, "WRITE_FAILED");
      });
      ws.on("finish", () => {
        if (settled) return;
        settled = true;
        if (size === 0) {
          safeUnlink(file);
          sendJson(c.res, 400, { ok: false, error: "EMPTY" });
        } else {
          log2("mobile upload ok", { personId, name, size });
          sendJson(c.res, 200, { ok: true, data: { path: file, name, size } });
        }
        done();
      });
      c.req.pipe(ws);
    });
  };
  const handleClip = async (c) => {
    const personId = authPerson(c);
    if (!personId) return;
    const q = queryOf(c.req);
    const meetingId = q.get("meetingId") || q.get("id") || "";
    const label = q.get("label") || "";
    if (!meetingId || !label) {
      sendJson(c.res, 400, { ok: false, error: "BAD_REQUEST" });
      return;
    }
    const key2 = `${personId}
${meetingId}
${label}`;
    const now = Date.now();
    const hit = clipCache.get(key2);
    if (hit && now - hit.at < CLIP_CACHE_TTL_MS) {
      sendBuffer(c.req, c.res, hit.buf, hit.mime);
      return;
    }
    let clip;
    try {
      clip = decodeClip(await o.dispatch(personId, "meeting.speaker.clip", { id: meetingId, label }));
    } catch (e) {
      sendJson(c.res, 400, { ok: false, error: errMsg(e) });
      return;
    }
    if (!clip) {
      sendJson(c.res, 404, { ok: false, error: "NOT_FOUND" });
      return;
    }
    if (clip.path) {
      const abs = (0, import_node_path2.resolve)(clip.path);
      c.serveFile(isInside(dataRoot, abs) && (0, import_node_fs3.existsSync)(abs) ? abs : null, AUDIO_MIME[(0, import_node_path2.extname)(abs).toLowerCase()] || "application/octet-stream");
      return;
    }
    const buf = clip.buf;
    const mime = clip.mime || "audio/wav";
    clipCache.set(key2, { at: now, buf, mime });
    while (clipCache.size > CLIP_CACHE_MAX) clipCache.delete(clipCache.keys().next().value);
    sendBuffer(c.req, c.res, buf, mime);
  };
  const routes = [
    pageRoute(/^\/m\/?$/, appPage),
    pageRoute(/^\/v\/?$/, voicePage),
    // 群链接入口：不带令牌、不校验，页面用本机记着的令牌跳到 /m 或 /v
    { method: "GET", path: /^\/g\/?$/, auth: "none", handler: (c) => sendPage(c.req, c.res, groupPage) },
    { method: "GET", path: "/api/ping", auth: "none", handler: (c) => c.json(200, { ok: true }) },
    { method: "GET", path: "/api/meta", auth: "none", handler: (c) => {
      let httpsBase = "";
      try {
        const b = String(o.publicBase?.() || "").trim().replace(/\/+$/, "");
        if (/^https:\/\//i.test(b)) httpsBase = b;
      } catch {
      }
      return c.json(200, { maxUploadBytes: maxUpload, httpsBase });
    } },
    { method: "POST", path: "/api/invoke", auth: "none", handler: handleInvoke },
    { method: "POST", path: "/api/upload", auth: "none", handler: handleUpload },
    { method: "GET", path: "/api/clip", auth: "none", handler: handleClip }
  ];
  const lan = new import_lanServer.LanServer({
    name: "meeting-mgmt-mobile",
    pageHtml: MEETING_MOBILE_APP_HTML,
    routes,
    auth: () => null,
    // 所有路由自己鉴权（令牌既可能在 ?t= 也可能在 Authorization 头）
    defaultPort: o.port ?? MM_MOBILE_DEFAULT_PORT,
    maxBodyBytes: JSON_BODY_LIMIT
  });
  try {
    (0, import_node_fs3.mkdirSync)(uploadRoot, { recursive: true });
  } catch {
  }
  const swept = sweepUploads(uploadRoot);
  if (swept) log2("mobile upload sweep", { removed: swept });
  const timer = setInterval(() => {
    sweepUploads(uploadRoot);
  }, SWEEP_INTERVAL_MS);
  timer.unref?.();
  let port;
  try {
    port = await lan.start();
  } catch (e) {
    clearInterval(timer);
    throw e;
  }
  const url = lan.url || `http://127.0.0.1:${port}`;
  log2("mobile server started", { url });
  let stopped = false;
  return {
    url,
    port,
    stop: async () => {
      if (stopped) return;
      stopped = true;
      clearInterval(timer);
      clipCache.clear();
      await lan.stop();
      log2("mobile server stopped", { port });
    }
  };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/service.ts
var import_sealedSecret = require("host:apps/desktop-shell/src/main/services/sealedSecret.ts");
function defaultExternals() {
  return {
    runMeetingPipeline: (i) => runMeetingPipeline(i),
    generatePlan: (i) => generatePlan(i),
    organizeMinutes: (i) => organizeMinutes(i),
    generateWeeklyReport: (i) => generateWeeklyReport(i),
    generateProjectSummary: (i) => generateProjectSummary(i),
    enrollVoiceprint: (p) => enrollVoiceprint(p),
    meetingVoiceSample: (d, r) => meetingVoiceSample(d, r),
    exportSpeakerClip: (i) => exportSpeakerClip(i),
    createWecom: (cfg) => new WecomClient(cfg),
    createWebhook: (url) => new WecomWebhook(url),
    diffOrg: (prev, next) => diffOrg(prev, next),
    noticeCard: (n, ctx) => noticeCard(n, ctx),
    dueReminders: (s, now) => dueReminders(s, now),
    startScheduler: (tick, ms) => startMeetingScheduler(tick, ms),
    startMobileServer: (o) => startMeetingMobileServer(o),
    seal: { can: import_sealedSecret.canSealSecret, seal: import_sealedSecret.sealSecret, unseal: import_sealedSecret.unsealSecret },
    checkRuntime: async () => {
      const { resolveMeetingRuntime: resolveMeetingRuntime2 } = await Promise.resolve().then(() => (init_runtime(), runtime_exports));
      const rt = await resolveMeetingRuntime2();
      return { python: !!rt.python, ffmpeg: !!rt.ffmpeg, asrModel: rt.whisperModel, senseVoice: !!rt.senseVoiceDir, fireRed: !!rt.fireRedDir, speaker: !!rt.campp, speaker2: !!rt.campp2, modelsDir: rt.whisperModelsDir };
    },
    detectHardware: (dir) => detectHardware(dir),
    cloudTranscribe: (cfg, wav) => cloudTranscribe(cfg, wav, { timeoutMs: 3e4 }),
    segmentAudio: (workDir, start, end) => {
      const f = (0, import_node_path3.join)(workDir, AUDIO_FILE);
      return (0, import_node_fs4.existsSync)(f) ? sliceWavBase64(f, { start, end }) : null;
    }
  };
}
var AUDIO_EXT = /* @__PURE__ */ new Set(["mp3", "m4a", "wav", "aac", "amr", "flac", "ogg", "oga", "opus", "wma", "caf", "aiff", "aif", "aifc", "m4b", "3ga", "spx", "ape", "ac3", "mka", "silk", "slk"]);
var VIDEO_EXT = /* @__PURE__ */ new Set(["mp4", "mov", "mkv", "avi", "flv", "wmv", "webm", "m4v", "3gp", "3g2", "mpeg", "mpg", "ts", "mts", "m2ts", "vob", "rmvb", "rm", "asf", "ogv"]);
var TRANSCRIPT_EXT = /* @__PURE__ */ new Set(["txt", "md", "docx", "srt", "vtt", "json"]);
function fileKindOf(name) {
  const ext = (0, import_node_path3.extname)(name).slice(1).toLowerCase();
  if (TRANSCRIPT_EXT.has(ext)) return "transcript";
  if (VIDEO_EXT.has(ext)) return "video";
  return "audio";
}
var MM_PICK_EXTENSIONS = [...AUDIO_EXT, ...VIDEO_EXT, ...TRANSCRIPT_EXT];
var MOBILE_BLOCKED = /* @__PURE__ */ new Set([
  "identity.set",
  "meeting.pickFiles",
  "file.open",
  "mobile.start",
  "mobile.stop",
  "mobile.status",
  "mobile.link",
  "demo.load",
  "demo.clear",
  "demo.transcript",
  "wecom.save",
  "wecom.test",
  "wecom.webhook.save",
  "wecom.webhook.test",
  "org.sync",
  "org.import",
  "org.person.contact",
  "setup.status",
  "setup.finish",
  "setup.llmTest",
  "voiceprint.enrollData",
  "wecom.secret.reveal",
  "settings.save",
  "voiceprint.link",
  "voiceprint.send",
  "voiceprint.import",
  "asr.mode.save",
  "asr.cloud.save",
  "asr.cloud.test",
  "asr.cloud.reveal"
]);
var PC_ONLY_IPC = /* @__PURE__ */ new Set(["meeting.pickFiles", "file.open", "voiceprint.import", "org.importFile"]);
var MEETING_FILTER_PROCESSING = ["pending_upload", "processing", "failed", "pending_assign", "pending_confirm", "pending_review"];
var MEETING_FILTER_FINAL = ["finalized", "ended", "pending_owner", "plan_confirm", "dispatched"];
var TASK_STATUSES = ["to_accept", "not_started", "in_progress", "done", "cancelled"];
var MAX_CLIP_BYTES = 30 * 1024 * 1024;
var LEARN_MIN_SELF_SIM = 0.35;
var SEGMENT_AUDIO_MAX_SEC = 180;
var str2 = (v, max = 500) => String(v ?? "").trim().slice(0, max);
var strArr = (v) => Array.isArray(v) ? [...new Set(v.map((x) => String(x ?? "").trim()).filter(Boolean))] : [];
var MeetingMgmtService = class {
  store;
  llm;
  emitFn;
  nowFn;
  logger;
  ext;
  schedulerIntervalMs;
  initializedRoot = "";
  jobs = /* @__PURE__ */ new Map();
  planJobs = /* @__PURE__ */ new Set();
  summaryJobs = /* @__PURE__ */ new Set();
  reorganizing = /* @__PURE__ */ new Set();
  background = /* @__PURE__ */ new Set();
  stopScheduler = null;
  mobile = null;
  stopped = false;
  constructor(o) {
    this.store = o.store ?? new MeetingMgmtStore(void 0, (m) => o.logger?.warn?.("meeting-mgmt", m));
    this.llm = o.llm;
    this.emitFn = o.emit ?? (() => {
    });
    this.nowFn = o.now ?? Date.now;
    this.logger = o.logger;
    this.ext = { ...defaultExternals(), ...o.ext || {} };
    this.schedulerIntervalMs = o.schedulerIntervalMs;
  }
  // ─── 生命周期 ───────────────────────────────────────────────────────
  /** 启动定时提醒 */
  startBackground() {
    if (this.stopScheduler) return;
    this.stopped = false;
    this.stopScheduler = this.ext.startScheduler(() => this.tick(), this.schedulerIntervalMs);
  }
  /** 停掉定时器、手机页服务、正在跑的流水线（应用退出 / 工作台卸载） */
  async stop() {
    this.stopped = true;
    try {
      this.stopScheduler?.();
    } catch {
    }
    this.stopScheduler = null;
    for (const c of this.jobs.values()) {
      try {
        c.abort();
      } catch {
      }
    }
    const m = this.mobile;
    this.mobile = null;
    if (m) {
      try {
        await m.stop();
      } catch {
      }
    }
  }
  /** 等后台任务（流水线、方案、总结、企微发送）都跑完（单测用） */
  async idle() {
    while (this.background.size) await Promise.allSettled([...this.background]);
  }
  track(p) {
    this.background.add(p);
    void p.finally(() => this.background.delete(p)).catch(() => {
    });
    return p;
  }
  emit(ev) {
    try {
      this.emitFn(ev);
    } catch {
    }
  }
  changed(scope, id) {
    this.emit({ type: "changed", scope, ...id ? { id } : {} });
  }
  warn(msg, meta) {
    this.logger?.warn?.("meeting-mgmt", msg, meta);
  }
  // ─── 入口 ───────────────────────────────────────────────────────────
  /** PC 端当前身份 */
  pcActorId() {
    this.ensureInit();
    return this.store.read().meId;
  }
  dispatchPc(action, payload) {
    return this.dispatch(this.pcActorId(), action, payload, "pc");
  }
  async dispatch(actorId, action, payload, origin = "pc") {
    this.ensureInit();
    const name = String(action || "");
    if (origin === "mobile" && MOBILE_BLOCKED.has(name)) throw new Error((0, import_i18n15.t)("\u624B\u673A\u9875\u4E0D\u80FD\u6267\u884C\u8FD9\u4E2A\u64CD\u4F5C\uFF0C\u8BF7\u5728\u7535\u8111\u7AEF\u64CD\u4F5C"));
    if (PC_ONLY_IPC.has(name)) throw new Error((0, import_i18n15.t)("\u8FD9\u4E2A\u64CD\u4F5C\u53EA\u80FD\u5728\u7535\u8111\u7AEF\u4F7F\u7528"));
    const fn = this.actions[name];
    if (!fn) throw new Error((0, import_i18n15.t)("\u672A\u77E5\u64CD\u4F5C\uFF1A{p0}", { p0: name }));
    const p = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
    return fn({ actorId: actorId || null, origin, now: this.nowFn() }, p);
  }
  /** 第一次使用 / 换账号后：没有组织就载入演示组织；中断的处理标失败；当前身份兜底 */
  ensureInit() {
    const root = this.store.root();
    if (this.initializedRoot === root) return;
    this.initializedRoot = root;
    const now = this.nowFn();
    let s = this.store.read();
    if (s.org.source === "none" && !s.org.people.length && !s.settings.adminIds.length) {
      this.loadDemo(now, null);
      s = this.store.read();
    }
    const interrupted = s.meetings.filter((m) => m.status === "processing" && !this.jobs.has(m.id));
    const stuckPlans = s.meetings.filter((m) => m.status === "finalized" && m.taskDecision === "generate" && !this.planJobs.has(m.id));
    const meBad = !activePerson(s.org, s.meId);
    if (!interrupted.length && !stuckPlans.length && !meBad) return;
    this.store.update((st) => {
      for (const m of st.meetings) {
        if (interrupted.some((x) => x.id === m.id)) failProcessing(m, (0, import_i18n15.t)("\u5904\u7406\u88AB\u4E2D\u65AD\uFF08\u5E94\u7528\u9000\u51FA\u6216\u91CD\u542F\uFF09\uFF0C\u8BF7\u91CD\u8BD5"), now);
        if (stuckPlans.some((x) => x.id === m.id)) m.taskDecision = void 0;
      }
      if (!activePerson(st.org, st.meId)) st.meId = st.settings.adminIds.find((id) => activePerson(st.org, id)) ?? null;
    });
  }
  // ─── 身份与权限 ─────────────────────────────────────────────────────
  s() {
    return this.store.read();
  }
  isAdmin(id) {
    const s = this.s();
    return !!id && s.settings.adminIds.includes(id) && !!activePerson(s.org, id);
  }
  hasActiveAdmin() {
    const s = this.s();
    return s.settings.adminIds.some((id) => !!activePerson(s.org, id));
  }
  me(c) {
    const p = activePerson(this.s().org, c.actorId);
    if (!p) throw new Error((0, import_i18n15.t)("\u5F53\u524D\u8EAB\u4EFD\u65E0\u6548\uFF0C\u8BF7\u5148\u9009\u62E9\u8EAB\u4EFD"));
    return p;
  }
  requireAdmin(c, what) {
    const p = this.me(c);
    if (!this.isAdmin(p.id)) throw new Error((0, import_i18n15.t)("\u53EA\u6709\u7BA1\u7406\u5458\u53EF\u4EE5{p0}", { p0: what }));
    return p;
  }
  meView(id) {
    const s = this.s();
    const person = activePerson(s.org, id);
    return {
      person,
      isAdmin: this.isAdmin(person?.id),
      canCreateProject: !!person && (this.isAdmin(person.id) || s.settings.projectCreatorIds.includes(person.id))
    };
  }
  /** PC 端能不能切身份：还没有管理员，或当前身份 / 本机操作人是管理员 */
  canSwitch(c) {
    if (c.origin !== "pc") return false;
    return !this.hasActiveAdmin() || this.isAdmin(c.actorId) || this.isAdmin(this.s().operatorId);
  }
  /** 我参与的项目：负责人、成员、创建人（管理员替别人建的项目也看得到） */
  inProject(pid, p) {
    return p.ownerId === pid || p.memberIds.includes(pid) || p.createdBy === pid;
  }
  canSeeProject(pid, p) {
    return this.isAdmin(pid) || this.inProject(pid, p);
  }
  canSeeMeeting(pid, m, p) {
    return !!p && this.canSeeProject(pid, p) || m.hostId === pid || m.attendeeIds.includes(pid) || planOwners(m.plan).includes(pid) || m.confirmations.some((c) => c.personId === pid);
  }
  canDeleteMeeting(pid, m, p) {
    if (p?.status === "archived") return false;
    return this.isAdmin(pid) || m.hostId === pid || m.createdBy === pid || p?.ownerId === pid;
  }
  canSeeTask(pid, t, p) {
    return !!p && this.canSeeProject(pid, p) || t.assigneeId === pid || taskOwners(t).includes(pid);
  }
  findProject(s, id) {
    const p = s.projects.find((x) => x.id === id);
    if (!p) throw new Error((0, import_i18n15.t)("\u9879\u76EE\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
    return p;
  }
  findMeeting(s, id) {
    const m = s.meetings.find((x) => x.id === id);
    if (!m) throw new Error((0, import_i18n15.t)("\u4F1A\u8BAE\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
    return m;
  }
  findTask(s, id) {
    const t = s.tasks.find((x) => x.id === id);
    if (!t) throw new Error((0, import_i18n15.t)("\u4EFB\u52A1\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664"));
    return t;
  }
  visibleMeeting(c, id) {
    const me = this.me(c);
    const s = this.s();
    const m = this.findMeeting(s, id);
    const p = this.findProject(s, m.projectId);
    if (!this.canSeeMeeting(me.id, m, p)) throw new Error((0, import_i18n15.t)("\u4F60\u6CA1\u6709\u53C2\u4E0E\u8FD9\u573A\u4F1A\u8BAE"));
    return { m, p };
  }
  visibleTask(c, id) {
    const me = this.me(c);
    const s = this.s();
    const t = this.findTask(s, id);
    const p = this.findProject(s, t.projectId);
    if (!this.canSeeTask(me.id, t, p)) throw new Error((0, import_i18n15.t)("\u4F60\u6CA1\u6709\u53C2\u4E0E\u8FD9\u4E2A\u4EFB\u52A1"));
    return { t, p };
  }
  nameOf = (id) => personName(this.s().org, id);
  /** 多个人名用顿号连起来（任务负责人可以多位） */
  namesOf = (ids) => ids.map((id) => this.nameOf(id)).filter(Boolean).join((0, import_i18n15.t)("\u3001"));
  // ─── 令牌与链接 ─────────────────────────────────────────────────────
  /**
   * 手机页服务调用：令牌 → 人员 id；令牌不对返回 null。
   * 令牌的主人已离职 / 不在组织里了也照样返回 id：boot 会回 me.person = null，页面提示「请联系管理员同步通讯录」
   * （而不是「链接已失效」）；其它动作由 me() 拦下。
   */
  personByToken(token) {
    const tok = String(token || "");
    if (!tok) return null;
    for (const [pid, t] of Object.entries(this.s().tokens)) if (t === tok) return pid;
    return null;
  }
  ensureToken(personId, reset = false) {
    const cur = this.s().tokens[personId];
    if (cur && !reset) return cur;
    const token = (0, import_node_crypto5.randomBytes)(18).toString("base64url");
    this.store.update((s) => {
      s.tokens[personId] = token;
    });
    return token;
  }
  /** 卡片 / 专属链接的地址前缀：设置里的卡片地址，否则手机页服务的局域网地址 */
  linkBase() {
    const base = this.s().settings.wecom.cardBaseUrl || this.mobile?.url || "";
    return base.replace(/\/+$/, "");
  }
  /** 发出去的链接只有公司内网能打开（没填外网地址，用的是手机页服务的局域网地址） */
  lanOnly() {
    const base = this.linkBase();
    return !!base && isLanOnlyUrl(base);
  }
  /** 某人的专属链接（带令牌，格式由手机页服务定：<base>/m?t=…#/… ；声纹采集页 <base>/v?t=…） */
  personUrl(personId, target, reset = false) {
    const base = this.linkBase();
    if (!base) return "";
    const token = this.ensureToken(personId, reset);
    return target?.page === "voiceprint" ? buildVoiceprintUrl(base, token) : buildMobileUrl(base, token, target?.link ?? null);
  }
  // ─── 通知 ───────────────────────────────────────────────────────────
  wecomConfigured() {
    const w = this.s().settings.wecom;
    return !!(w.corpId && w.agentId && w.hasSecret);
  }
  /** 群机器人发送地址（解密后）；没配 / 解不开返回 '' */
  webhookUrl() {
    if (!this.s().settings.wecom.hasWebhook) return "";
    const sealed = this.store.readWebhook();
    if (!sealed) return "";
    try {
      return this.ext.seal.unseal(sealed) || "";
    } catch (e) {
      this.warn("wecom webhook unseal failed", { error: e?.message });
      return "";
    }
  }
  /** 通知往哪发：配了自建应用 → 发给个人；没配但有群机器人 → 发进群；都没有 → 只进消息中心 */
  pushChannel() {
    if (this.wecomConfigured()) return "app";
    if (this.s().settings.wecom.hasWebhook && this.store.readWebhook()) return "webhook";
    return null;
  }
  pushNotices(list) {
    const ch = this.pushChannel();
    return ch === "app" ? this.pushWecom(list) : ch === "webhook" ? this.pushGroup(list) : Promise.resolve();
  }
  wecomClient() {
    if (!this.wecomConfigured()) return null;
    const w = this.s().settings.wecom;
    const sealed = this.store.readSecret();
    if (!sealed) return null;
    let secret = "";
    try {
      secret = this.ext.seal.unseal(sealed);
    } catch (e) {
      this.warn("wecom secret unseal failed", { error: e?.message });
      return null;
    }
    if (!secret) return null;
    return this.ext.createWecom({ corpId: w.corpId, agentId: w.agentId, secret });
  }
  /** 写消息中心（同一批里同一人同一事件同一对象只发一条），有企微配置再异步发卡片 */
  notify(drafts, now) {
    const s = this.s();
    const seen = /* @__PURE__ */ new Set();
    const list = [];
    for (const d of drafts) {
      if (!d.to || !activePerson(s.org, d.to)) continue;
      const key2 = `${d.to}|${d.type}|${d.link.kind}|${d.link.id}`;
      if (seen.has(key2)) continue;
      seen.add(key2);
      list.push({ id: newId("nt"), at: now, to: d.to, type: d.type, title: d.title, summary: d.summary, link: d.link, read: false });
    }
    if (!list.length) return [];
    this.store.update((st) => {
      st.notices.push(...list);
    });
    this.changed("notice");
    if (this.pushChannel()) this.track(this.pushNotices(list));
    return list;
  }
  async pushWecom(list) {
    const client = this.wecomClient();
    if (!client) return;
    const base = this.linkBase();
    for (const n of list) {
      let r;
      const person = this.s().org.people.find((p) => p.id === n.to);
      if (!base) {
        r = { ok: false, error: (0, import_i18n15.t)("\u6CA1\u6709\u53EF\u7528\u7684\u5361\u7247\u8DF3\u8F6C\u5730\u5740\uFF1A\u8BF7\u5F00\u542F\u624B\u673A\u9875\u670D\u52A1\uFF0C\u6216\u5728\u8BBE\u7F6E\u91CC\u586B\u5199\u5361\u7247\u5730\u5740") };
      } else {
        try {
          const card = this.ext.noticeCard(n, { linkFor: (pid, link) => this.personUrl(pid, { link }), footnote: this.lanOnly() ? lanLinkNote() : void 0 });
          const uid = person?.wecomUserId || n.to;
          const sent = await client.sendCard([uid], card);
          r = sent.ok && sent.invalidUsers?.includes(uid) ? { ok: false, error: (0, import_i18n15.t)("\u63A5\u6536\u4EBA\u4E0D\u5728\u4F01\u5FAE\u5E94\u7528\u53EF\u89C1\u8303\u56F4\u5185\u6216\u5DF2\u79BB\u804C\uFF0C\u6536\u4E0D\u5230\u5361\u7247") } : sent;
        } catch (e) {
          r = { ok: false, error: e?.message || (0, import_i18n15.t)("\u53D1\u9001\u5931\u8D25") };
        }
      }
      const at = this.nowFn();
      try {
        this.store.update((s) => {
          const x = s.notices.find((y) => y.id === n.id);
          if (x) x.wecom = r.ok ? { sentAt: at } : { error: r.error || (0, import_i18n15.t)("\u53D1\u9001\u5931\u8D25") };
        });
      } catch {
      }
      if (!r.ok) this.warn("wecom card failed", { type: n.type, error: r.error });
    }
    this.changed("notice");
  }
  /**
   * 群消息里怎么 @ 这个人：有手机号按手机号；企微账号可信（企微同步 / 导入的通讯录，或管理员手动填过）按账号；
   * 都没有只写姓名。演示组织里自带的账号是编的，不能拿来 @。
   */
  mentionOf(person, fallbackName) {
    if (!person) return { name: fallbackName };
    const source = this.s().org.source;
    const trusted = person.wecomUserId && (source === "wecom" || source === "import" || person.wecomIdManual);
    return { name: person.name, ...trusted ? { userId: person.wecomUserId } : {}, ...person.mobile ? { mobile: person.mobile } : {} };
  }
  /** 同步 / 导入换新通讯录时，管理员手动填的手机号、企微账号带过去（新数据里没有才带） */
  carryContacts(prev, next) {
    const old = new Map(prev.map((p) => [p.id, p]));
    return next.map((p) => {
      const o = old.get(p.id);
      if (!o) return p;
      return {
        ...p,
        ...!p.mobile && o.mobile ? { mobile: o.mobile } : {},
        ...o.wecomIdManual && o.wecomUserId && !p.wecomUserId ? { wecomUserId: o.wecomUserId, wecomIdManual: true } : {}
      };
    });
  }
  /** 换上新通讯录：企微里 / 表里没有了的人标离职（保留历史数据） */
  replaceOrg(next, source, result) {
    const nextIds = new Set(next.people.map((x) => x.id));
    this.store.update((st) => {
      const people = this.carryContacts(st.org.people, next.people);
      const left = st.org.people.filter((x) => !nextIds.has(x.id)).map((x) => ({ ...x, left: true }));
      st.org = { depts: next.depts, people: [...people.map((x) => ({ ...x, left: void 0 })), ...left], source, lastSync: result };
    });
    this.changed("org");
  }
  /**
   * 群机器人：同一事件同一对象的几条通知合成一条群消息（@ 每位接收人），按钮是不带令牌的群链接。
   * 通讯录来自企微同步才真 @（`<@userid>`），演示组织只写姓名。
   */
  async pushGroup(list) {
    const url = this.webhookUrl();
    if (!url) return;
    const hook = this.ext.createWebhook(url);
    const base = this.linkBase();
    const groups = /* @__PURE__ */ new Map();
    for (const n of list) {
      const key2 = `${n.type}|${n.link.kind}|${n.link.id}|${n.link.anchor || ""}`;
      const g = groups.get(key2);
      if (g) g.push(n);
      else groups.set(key2, [n]);
    }
    for (const g of groups.values()) {
      const first = g[0];
      const org = this.s().org;
      const mentions = g.map((n) => this.mentionOf(org.people.find((p) => p.id === n.to), n.to));
      let r;
      try {
        r = await hook.send(buildGroupMessage({
          label: noticeTypeLabel(first.type),
          title: first.title,
          summary: first.summary,
          mentions,
          url: base ? buildGroupUrl(base, first.link) : "",
          buttonText: noticeButtonText(first.type),
          lanOnly: !!base && isLanOnlyUrl(base)
        }));
      } catch (e) {
        r = { ok: false, error: e?.message || (0, import_i18n15.t)("\u53D1\u9001\u5931\u8D25") };
      }
      const at = this.nowFn();
      const ids = new Set(g.map((n) => n.id));
      try {
        this.store.update((s) => {
          for (const x of s.notices) if (ids.has(x.id)) x.wecom = r.ok ? { sentAt: at } : { error: r.error || (0, import_i18n15.t)("\u53D1\u9001\u5931\u8D25") };
        });
      } catch {
      }
      if (!r.ok) this.warn("wecom webhook failed", { type: first.type, error: r.error });
    }
    this.changed("notice");
  }
  // ─── 演示数据 ───────────────────────────────────────────────────────
  loadDemo(now, by) {
    const org = buildDemoOrg();
    const data = buildDemoData(now);
    const old = this.s().meetings.map((m) => m.id);
    const valid = (id) => !!id && org.people.some((p) => p.id === id);
    this.store.update((s) => {
      s.org = {
        depts: org.depts,
        people: org.people,
        source: "demo",
        lastSync: { at: now, by: by || DEMO_ADMIN_ID, source: "demo", added: org.people.map((p) => p.id), changed: [], left: [] }
      };
      s.projects = data.projects;
      s.meetings = data.meetings;
      s.tasks = data.tasks;
      s.notices = data.notices;
      s.demoLoaded = true;
      s.settings.adminIds = s.settings.adminIds.filter(valid);
      if (!s.settings.adminIds.length) s.settings.adminIds = [DEMO_ADMIN_ID];
      s.settings.projectCreatorIds = s.settings.projectCreatorIds.filter(valid);
      if (!valid(s.meId)) s.meId = s.settings.adminIds[0];
      if (!valid(s.operatorId)) s.operatorId = s.settings.adminIds[0];
      s.voiceprints = s.voiceprints.filter((v) => valid(v.personId));
      s.tokens = Object.fromEntries(Object.entries(s.tokens).filter(([pid]) => valid(pid)));
    });
    for (const id of old) this.store.removeMeetingFiles(id);
  }
  // ─── 视图 ───────────────────────────────────────────────────────────
  taskView(t, now) {
    return taskView(t, this.s(), now);
  }
  projectCard(p, now) {
    const tasks = this.s().tasks.filter((t) => t.projectId === p.id && t.status !== "cancelled");
    const done = tasks.filter((t) => t.status === "done").length;
    const total = tasks.length;
    return {
      id: p.id,
      name: p.name,
      desc: p.desc,
      status: p.status,
      ownerId: p.ownerId,
      ownerName: this.nameOf(p.ownerId),
      done,
      total,
      overdue: tasks.filter((t) => isTaskOverdue(t, now)).length,
      rate: total ? Math.round(done / total * 100) : 0,
      memberCount: p.memberIds.length,
      meetingCount: this.s().meetings.filter((m) => m.projectId === p.id).length
    };
  }
  meetingCard(m, needsMe, actorId) {
    const s = this.s();
    const project = s.projects.find((p) => p.id === m.projectId);
    const done = m.confirmations.filter((c) => c.status === "confirmed").length;
    const confirmText = m.status === "pending_confirm" ? (0, import_i18n15.t)("\u5DF2\u786E\u8BA4 {p0}/{p1}", { p0: done, p1: m.confirmations.length }) : m.status === "processing" ? stageText(m.process?.stage) : "";
    const taskCount = s.tasks.filter((t) => t.meetingId === m.id).length;
    return {
      id: m.id,
      title: m.title,
      projectId: m.projectId,
      projectName: project?.name || "",
      time: m.time,
      status: m.status,
      source: m.source,
      hostId: m.hostId,
      hostName: this.nameOf(m.hostId),
      needsMe: needsMe.has(m.id),
      canDelete: this.canDeleteMeeting(actorId, m, project),
      ...taskCount ? { taskCount } : {},
      ...confirmText ? { confirmText } : {}
    };
  }
  namesFor(ids) {
    const org = this.s().org;
    const out = {};
    for (const id of ids) {
      if (!id || out[id]) continue;
      const p = org.people.find((x) => x.id === id);
      out[id] = { name: p?.name || (0, import_i18n15.t)("\u672A\u77E5\u4EBA\u5458"), deptName: p ? deptName(org, p.deptId) : "" };
    }
    return out;
  }
  /** 返回给调用方的会议快照（不是缓存里的活对象：后台流水线改状态不会影响已返回的结果）；手机页拿到的不带本机文件路径 */
  forOrigin(m, origin) {
    const copy = structuredClone(m);
    if (origin !== "mobile") return copy;
    return { ...copy, files: copy.files.map((f) => ({ ...f, path: "" })), speakers: copy.speakers.map((sp) => ({ ...sp, clipPath: void 0 })) };
  }
  myTodos(c) {
    return computeTodos(this.s(), c.actorId, c.now);
  }
  // ─── 动作 ───────────────────────────────────────────────────────────
  actions = {
    "boot": (c) => {
      void this.resumeMobile();
      const s = this.s();
      const todos = activePerson(s.org, c.actorId) ? this.myTodos(c) : [];
      const operator = activePerson(s.org, s.operatorId);
      return {
        me: this.meView(c.actorId),
        canSwitchIdentity: this.canSwitch(c),
        // 坐在这台电脑前的管理员：切成别人代办后，界面给「回到 X（管理员）」
        operatorId: operator && this.isAdmin(operator.id) ? operator.id : null,
        operator: operator && this.isAdmin(operator.id) ? { id: operator.id, name: operator.name } : null,
        org: { source: s.org.source, deptCount: s.org.depts.length, peopleCount: s.org.people.filter((p) => !p.left).length, lastSync: s.org.lastSync },
        settings: s.settings,
        wecomConnected: this.wecomConfigured(),
        pushChannel: this.pushChannel(),
        mobile: this.mobileStatus(),
        /** 发送失败的企微卡片条数（只给管理员看） */
        pushFailed: this.isAdmin(c.actorId || "") ? s.notices.filter((n) => n.wecom?.error).length : 0,
        badges: todoBadges(todos),
        demoLoaded: s.demoLoaded,
        /** 管理员还没走过配置引导：界面自动弹引导 */
        setupPending: this.isAdmin(c.actorId || "") && !s.setupDoneAt
      };
    },
    // ── 配置引导（管理员）：组织、通知推送、手机端、语音模型、声纹、大模型一步步配 ──
    "setup.status": async (c) => {
      const me = this.requireAdmin(c, (0, import_i18n15.t)("\u67E5\u770B\u914D\u7F6E\u5F15\u5BFC"));
      const s = this.s();
      const active = s.org.people.filter((p) => !p.left);
      let rt = null;
      try {
        rt = await this.ext.checkRuntime();
      } catch (e) {
        this.warn("setup runtime check failed", { error: e?.message });
      }
      const hardware = this.ext.detectHardware(rt?.modelsDir || void 0);
      const rec = recommendAsr(hardware);
      return {
        done: !!s.setupDoneAt,
        doneAt: s.setupDoneAt ?? null,
        org: {
          source: s.org.source,
          people: active.length,
          depts: s.org.depts.length,
          lastSync: s.org.lastSync ?? null,
          mentionable: active.filter((p) => {
            const m = this.mentionOf(p, p.name);
            return !!(m.mobile || m.userId);
          }).length
        },
        push: { channel: this.pushChannel(), hasWebhook: !!s.settings.wecom.hasWebhook, webhookMasked: s.settings.wecom.webhookMasked || "", appConfigured: this.wecomConfigured() },
        // 自建应用已填的内容：引导再打开时原样带出（Secret 只回「有没有」，要看原文走 wecom.secret.reveal）
        wecom: { corpId: s.settings.wecom.corpId, agentId: s.settings.wecom.agentId, hasSecret: !!s.settings.wecom.hasSecret && !!this.store.readSecret() },
        me: { id: me.id, name: me.name, deptName: deptName(s.org, me.deptId), mobile: me.mobile || "", voiceprint: s.voiceprints.some((v) => v.personId === me.id) },
        mobile: this.mobileStatus(),
        voiceprints: { collected: s.voiceprints.filter((v) => active.some((p) => p.id === v.personId)).length, total: active.length },
        hardware,
        models: {
          python: !!rt?.python,
          ffmpeg: !!rt?.ffmpeg,
          asrModel: rt?.asrModel ?? null,
          speaker: !!rt?.speaker,
          senseVoice: !!rt?.senseVoice,
          fireRed: !!rt?.fireRed,
          // 推荐方案要的模型都下好了没有（FireRedASR2 方案 = FireRedASR2 + SenseVoice 兜底）
          asrReady: rec.installIds.every((id) => id === MEETING_ASR_IDS.firered ? !!rt?.fireRed : !!rt?.senseVoice)
        },
        recommend: { ...rec, speakerInstallId: SPEAKER_INSTALL_ID },
        /** 两个本机模型在这台电脑上处理 1 小时录音各要几分钟（粗估） */
        estimates: { firered: estimateMinPerHour("firered", hardware).minutes, sensevoice: estimateMinPerHour("sensevoice", hardware).minutes },
        asr: this.asrSettingsView()
      };
    },
    "setup.finish": (c) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u5B8C\u6210\u914D\u7F6E\u5F15\u5BFC"));
      const at = this.nowFn();
      this.store.update((st) => {
        st.setupDoneAt = at;
      });
      return { ok: true, doneAt: at };
    },
    /** 试一下 App 里选的大模型能不能用（纪要整理、拆任务、写报告都靠它；不能用时按规则兜底，效果差很多） */
    "setup.llmTest": async (c) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u6D4B\u8BD5\u5927\u6A21\u578B"));
      const t0 = this.nowFn();
      let reply = null;
      try {
        reply = await this.llm((0, import_i18n15.t)("\u8FD9\u662F\u8FDE\u63A5\u6D4B\u8BD5\uFF0C\u8BF7\u53EA\u56DE\u590D\u4E24\u4E2A\u5B57\uFF1A\u6536\u5230"), { timeoutMs: 45e3 });
      } catch {
        reply = null;
      }
      const text = String(reply ?? "").trim();
      return text ? { ok: true, reply: text.slice(0, 60), ms: this.nowFn() - t0 } : { ok: false };
    },
    "identity.set": (c, p) => {
      if (!this.canSwitch(c)) throw new Error((0, import_i18n15.t)("\u53EA\u6709\u7BA1\u7406\u5458\u53EF\u4EE5\u5207\u6362\u8EAB\u4EFD"));
      const s = this.s();
      const target = requireActivePerson(s.org, str2(p.personId), (0, import_i18n15.t)("\u8981\u5207\u6362\u7684\u4EBA\u5458"));
      const noAdmin = !this.hasActiveAdmin();
      const actorIsAdmin = this.isAdmin(c.actorId);
      this.store.update((st) => {
        if (noAdmin) {
          st.settings.adminIds = [target.id];
          st.operatorId = target.id;
        } else if (actorIsAdmin && !(st.operatorId && st.settings.adminIds.includes(st.operatorId) && activePerson(st.org, st.operatorId))) st.operatorId = c.actorId;
        st.meId = target.id;
      });
      this.changed("all");
      return this.meView(target.id);
    },
    "people.list": () => {
      const org = this.s().org;
      return { depts: org.depts, people: org.people.filter((p) => !p.left) };
    },
    "home.get": (c) => {
      const me = this.me(c);
      const s = this.s();
      const todos = this.myTodos(c);
      const mine = s.notices.filter((n) => n.to === me.id);
      const unread = mine.filter((n) => !n.read).length;
      const visibleMeetings = s.meetings.filter((m) => this.canSeeMeeting(me.id, m, s.projects.find((p) => p.id === m.projectId)));
      return {
        me: this.meView(me.id),
        greetingName: me.name,
        counts: homeCounts(todos, s, me.id, unread, c.now),
        todos,
        myTasksThisWeek: myTasksThisWeek(s, me.id, c.now),
        projects: s.projects.filter((p) => this.inProject(me.id, p)).map((p) => {
          const x = this.projectCard(p, c.now);
          return { id: x.id, name: x.name, status: x.status, done: x.done, total: x.total, overdue: x.overdue, ownerName: x.ownerName };
        }),
        recentMeetings: [...visibleMeetings].sort((a, b) => b.time - a.time).slice(0, 6).map((m) => ({ id: m.id, title: m.title, projectName: s.projects.find((p) => p.id === m.projectId)?.name || "", status: m.status, time: m.time })),
        notices: [...mine].sort((a, b) => b.at - a.at).slice(0, 10)
      };
    },
    // ── 通知 ──
    "notice.list": (c, p) => {
      const me = this.me(c);
      return this.s().notices.filter((n) => n.to === me.id && (!p.unreadOnly || !n.read)).sort((a, b) => b.at - a.at).slice(0, 300);
    },
    /** 企微推送失败记录（管理员）：最近 200 条 */
    "notice.push.failed": (c) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u67E5\u770B\u63A8\u9001\u5931\u8D25\u8BB0\u5F55"));
      const s = this.s();
      const failed = s.notices.filter((n) => n.wecom?.error);
      return {
        total: failed.length,
        items: failed.slice(-200).reverse().map((n) => ({
          id: n.id,
          at: n.at,
          to: n.to,
          toName: s.org.people.find((p) => p.id === n.to)?.name || n.to,
          type: n.type,
          title: n.title,
          error: n.wecom.error
        }))
      };
    },
    /** 重发失败的企微卡片（管理员）：p.ids 指定几条，或 p.all = true 全部重发；等发完返回结果 */
    "notice.push.retry": async (c, p) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u91CD\u53D1\u4F01\u5FAE\u901A\u77E5"));
      if (!this.pushChannel()) throw new Error((0, import_i18n15.t)("\u8FD8\u6CA1\u6709\u914D\u7F6E\u4F01\u4E1A\u5FAE\u4FE1\uFF08\u81EA\u5EFA\u5E94\u7528\u6216\u7FA4\u673A\u5668\u4EBA\uFF09"));
      const ids = Array.isArray(p.ids) ? new Set(p.ids.map(String)) : null;
      if (!ids && p.all !== true) throw new Error((0, import_i18n15.t)("\u8BF7\u9009\u62E9\u8981\u91CD\u53D1\u7684\u901A\u77E5"));
      const list = this.store.update((st) => {
        const pick = st.notices.filter((n) => n.wecom?.error && (!ids || ids.has(n.id)) && activePerson(st.org, n.to));
        for (const n of pick) n.wecom = void 0;
        return pick.map((n) => ({ ...n }));
      });
      if (!list.length) return { sent: 0, failed: 0 };
      await this.pushNotices(list);
      const after = this.s().notices.filter((n) => list.some((x) => x.id === n.id));
      return { sent: after.filter((n) => n.wecom?.sentAt).length, failed: after.filter((n) => n.wecom?.error).length };
    },
    "notice.read": (c, p) => {
      const me = this.me(c);
      const ids = strArr(p.ids);
      this.store.update((s) => {
        for (const n of s.notices) if (n.to === me.id && (p.all === true || ids.includes(n.id))) n.read = true;
      });
      this.changed("notice");
      return { ok: true, unread: this.s().notices.filter((n) => n.to === me.id && !n.read).length };
    },
    // ── 项目 ──
    "project.list": (c, p) => {
      const me = this.me(c);
      const q = str2(p.q, 100).toLowerCase();
      const status = ["active", "closing", "archived"].includes(p.status) ? p.status : null;
      return this.s().projects.filter((x) => this.inProject(me.id, x)).filter((x) => !status || x.status === status).filter((x) => !q || x.name.toLowerCase().includes(q) || x.desc.toLowerCase().includes(q)).sort((a, b) => b.createdAt - a.createdAt).map((x) => this.projectCard(x, c.now));
    },
    "project.get": (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const project = this.findProject(s, p.id);
      if (!this.canSeeProject(me.id, project)) throw new Error((0, import_i18n15.t)("\u4F60\u4E0D\u662F\u8FD9\u4E2A\u9879\u76EE\u7684\u6210\u5458"));
      const meetings = s.meetings.filter((m) => m.projectId === project.id).sort((a, b) => b.time - a.time);
      const tasks = s.tasks.filter((t) => t.projectId === project.id);
      const live = tasks.filter((t) => t.status !== "cancelled");
      const week = weekRange(c.now);
      const weekTasks = live.filter((t) => t.due >= week.fromYmd && t.due <= week.toYmd);
      const todos = this.myTodos(c);
      const needsMe = new Set(todos.filter((t) => t.group === "meeting").map((t) => t.link.id));
      const deptIds = [...new Set(live.map((t) => t.deptId))];
      const isOwner = project.ownerId === me.id;
      return {
        project,
        ownerName: this.nameOf(project.ownerId),
        members: project.memberIds.map((id) => s.org.people.find((x) => x.id === id)).filter(Boolean),
        meetings: meetings.map((m) => this.meetingCard(m, needsMe, me.id)),
        tasks: tasks.map((t) => this.taskView(t, c.now)),
        stats: {
          meetings: meetings.length,
          done: live.filter((t) => t.status === "done").length,
          total: live.length,
          overdue: live.filter((t) => isTaskOverdue(t, c.now)).length,
          objections: tasks.filter((t) => hasOpenObjection(t)).length,
          weekRate: weekTasks.length ? Math.round(weekTasks.filter((t) => t.status === "done").length / weekTasks.length * 100) : 0
        },
        deptProgress: deptIds.map((deptId) => {
          const list = live.filter((t) => t.deptId === deptId);
          return { deptId, name: deptName(s.org, deptId), done: list.filter((t) => t.status === "done").length, total: list.length };
        }),
        decisions: meetings.filter((m) => isMinutesLocked(m)).flatMap((m) => m.decisions.map((d) => ({ text: d.text, at: m.finalizedAt || m.time, meetingTitle: m.title, meetingId: m.id }))),
        closeBlockers: project.status === "active" ? closeCheckItems(project, s.meetings, s.tasks) : [],
        summaryGenerating: this.summaryJobs.has(project.id),
        can: {
          editMembers: isOwner && project.status !== "archived",
          close: isOwner && project.status === "active",
          reviewSummary: isOwner && project.status === "closing" && !!project.summary,
          createMeeting: project.status === "active" && (isOwner || project.memberIds.includes(me.id) || this.isAdmin(me.id)),
          generateReport: (isOwner || this.isAdmin(me.id)) && project.status !== "archived"
        }
      };
    },
    "project.create": (c, p) => {
      const me = this.me(c);
      const s = this.s();
      if (!this.meView(me.id).canCreateProject) throw new Error((0, import_i18n15.t)("\u53EA\u6709\u7BA1\u7406\u5458\u6216\u88AB\u6388\u6743\u7684\u4EBA\u53EF\u4EE5\u65B0\u5EFA\u9879\u76EE"));
      const name = str2(p.name, 100);
      if (!name) throw new Error((0, import_i18n15.t)("\u8BF7\u586B\u5199\u9879\u76EE\u540D\u79F0"));
      const owner = requireActivePerson(s.org, str2(p.ownerId), (0, import_i18n15.t)("\u9879\u76EE\u8D1F\u8D23\u4EBA"));
      const members = strArr(p.memberIds).map((id) => requireActivePerson(s.org, id, (0, import_i18n15.t)("\u9879\u76EE\u6210\u5458")).id);
      const project = {
        id: newId("pj"),
        name,
        desc: str2(p.desc, 2e3),
        ownerId: owner.id,
        memberIds: [.../* @__PURE__ */ new Set([owner.id, ...members])],
        status: "active",
        createdAt: c.now,
        createdBy: me.id,
        weeklyReports: []
      };
      this.store.update((st) => {
        st.projects.push(project);
      });
      this.changed("project", project.id);
      return project;
    },
    "project.members": (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const ids = strArr(p.memberIds);
      for (const id of ids) {
        const person = s.org.people.find((x) => x.id === id);
        if (!person) throw new Error((0, import_i18n15.t)("\u6709\u6210\u5458\u4E0D\u5728\u7EC4\u7EC7\u91CC"));
      }
      const project = this.store.update((st) => {
        const pj = this.findProject(st, p.id);
        const fresh = ids.filter((id) => !pj.memberIds.includes(id));
        for (const id of fresh) requireActivePerson(st.org, id, (0, import_i18n15.t)("\u9879\u76EE\u6210\u5458"));
        applyMembers(pj, me.id, ids, st.meetings, st.tasks, this.nameOf);
        return pj;
      });
      this.changed("project", project.id);
      return project;
    },
    "project.close": (c, p) => {
      const me = this.me(c);
      const r = this.store.update((st) => {
        const pj = this.findProject(st, p.id);
        const items = closeCheckItems(pj, st.meetings, st.tasks);
        const ok = startClose(pj, me.id, items, c.now);
        return { ok, items };
      });
      this.changed("project", String(p.id));
      if (r.ok) this.track(this.runSummary(String(p.id)).catch(() => {
      }));
      return r;
    },
    "project.summary.regenerate": async (c, p) => {
      const me = this.me(c);
      const pj = this.findProject(this.s(), p.id);
      assertSummaryEditable(pj, me.id);
      return this.track(this.runSummary(pj.id, true));
    },
    "project.summary.save": (c, p) => {
      const me = this.me(c);
      const markdown = String(p.markdown ?? "");
      if (!markdown.trim()) throw new Error((0, import_i18n15.t)("\u603B\u7ED3\u62A5\u544A\u4E0D\u80FD\u4E3A\u7A7A"));
      const summary = this.store.update((st) => {
        const pj = this.findProject(st, p.id);
        assertSummaryEditable(pj, me.id);
        if (!pj.summary) throw new Error((0, import_i18n15.t)("\u603B\u7ED3\u62A5\u544A\u8FD8\u6CA1\u6709\u751F\u6210\u597D"));
        pj.summary.markdown = markdown.slice(0, 2e5);
        pj.summary.editedAt = c.now;
        return pj.summary;
      });
      this.changed("project", String(p.id));
      return summary;
    },
    "project.summary.approve": (c, p) => {
      const me = this.me(c);
      if (this.summaryJobs.has(String(p.id))) throw new Error((0, import_i18n15.t)("\u603B\u7ED3\u62A5\u544A\u6B63\u5728\u751F\u6210\uFF0C\u8BF7\u7A0D\u5019"));
      const pj = this.store.update((st) => {
        const x = this.findProject(st, p.id);
        approveSummary(x, me.id, c.now);
        return x;
      });
      this.notify(pj.memberIds.map((to) => ({
        to,
        type: "project_archived",
        title: (0, import_i18n15.t)("\u9879\u76EE\u5DF2\u5F52\u6863\uFF1A{p0}", { p0: pj.name }),
        summary: (0, import_i18n15.t)("\u9879\u76EE\u5DF2\u5F52\u6863\uFF0C\u9879\u76EE\u5185\u5BB9\u8F6C\u4E3A\u53EA\u8BFB\uFF0C\u603B\u7ED3\u62A5\u544A\u53EF\u5728\u7CFB\u7EDF\u5185\u67E5\u770B"),
        link: { kind: "project_summary", id: pj.id }
      })), c.now);
      this.changed("project", pj.id);
      return pj;
    },
    "project.report.generate": async (c, p) => {
      const me = this.me(c);
      const pj = this.findProject(this.s(), p.id);
      assertProjectNotArchived(pj);
      if (pj.ownerId !== me.id && !this.isAdmin(me.id)) throw new Error((0, import_i18n15.t)("\u53EA\u6709\u9879\u76EE\u8D1F\u8D23\u4EBA\u53EF\u4EE5\u751F\u6210\u8FDB\u5EA6\u6C47\u603B\u62A5\u544A"));
      return this.track(this.runWeeklyReport(pj.id, c.now));
    },
    // ── 会议 ──
    "meeting.list": (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const todos = this.myTodos(c);
      const needsMe = new Set(todos.filter((t) => t.group === "meeting").map((t) => t.link.id));
      const q = str2(p.q, 100).toLowerCase();
      const filter = String(p.filter || "all");
      return s.meetings.filter((m) => this.canSeeMeeting(me.id, m, s.projects.find((x) => x.id === m.projectId))).filter((m) => !p.projectId || m.projectId === p.projectId).filter((m) => filter === "todo" ? needsMe.has(m.id) : filter === "processing" ? MEETING_FILTER_PROCESSING.includes(m.status) : filter === "final" ? MEETING_FILTER_FINAL.includes(m.status) : true).filter((m) => !q || this.meetingSearchText(m, s).includes(q)).sort((a, b) => b.time - a.time).map((m) => this.meetingCard(m, needsMe, me.id));
    },
    "meeting.get": (c, p) => {
      const me = this.me(c);
      const { m, p: project } = this.visibleMeeting(c, p.id);
      const s = this.s();
      const tasks = s.tasks.filter((t) => t.meetingId === m.id).map((t) => this.taskView(t, c.now));
      const isHost = m.hostId === me.id;
      const isPlanOwner = planOwners(m.plan).includes(me.id);
      const myConf = m.confirmations.find((x) => x.personId === me.id);
      const live = project.status !== "archived";
      const planDepts = [.../* @__PURE__ */ new Set([...(m.plan?.items || []).map((i) => i.deptId), ...s.org.depts.map((d) => d.id)])];
      const ids = /* @__PURE__ */ new Set([m.hostId, ...m.attendeeIds, ...speakerPersonIds(m), ...m.confirmations.map((x) => x.personId)]);
      for (const o of planOwners(m.plan)) ids.add(o);
      for (const t of tasks) {
        ids.add(t.assigneeId);
        for (const o of taskOwners(t)) ids.add(o);
      }
      const deptLeaders = {};
      for (const d of planDepts) {
        const l = firstLeader(s.org, d);
        deptLeaders[d] = l ? { id: l.id, name: l.name } : null;
        if (l) ids.add(l.id);
      }
      return {
        meeting: this.forOrigin(m, c.origin),
        projectName: project.name,
        projectStatus: project.status,
        names: this.namesFor(ids),
        my: { isHost, isSpeaker: !!myConf, isPlanOwner, myLabels: labelsOf(m, me.id) },
        confirm: { done: m.confirmations.filter((x) => x.status === "confirmed").length, total: m.confirmations.length },
        tasks,
        deptNames: Object.fromEntries(s.org.depts.map((d) => [d.id, d.name])),
        deptLeaders,
        planGenerating: this.planJobs.has(m.id),
        can: {
          upload: live && isHost && (m.status === "pending_upload" || m.status === "failed"),
          retry: live && isHost && m.status === "failed" && m.files.length > 0,
          assign: live && isHost && (m.status === "pending_assign" || m.status === "pending_confirm"),
          edit: live && (m.status === "pending_confirm" && myConf?.status === "pending" || m.status === "pending_review" && isHost),
          confirm: live && m.status === "pending_confirm" && myConf?.status === "pending",
          review: live && isHost && m.status === "pending_review",
          decide: live && isHost && m.status === "finalized" && !m.taskDecision,
          setOwner: live && isHost && (m.status === "pending_owner" || m.status === "plan_confirm"),
          editPlan: live && isPlanOwner && m.status === "plan_confirm",
          confirmPlan: live && isPlanOwner && m.status === "plan_confirm" && project.status === "active"
        }
      };
    },
    "meeting.create": (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const project = this.findProject(s, p.projectId);
      if (!(project.ownerId === me.id || project.memberIds.includes(me.id) || this.isAdmin(me.id))) throw new Error((0, import_i18n15.t)("\u4F60\u4E0D\u662F\u8FD9\u4E2A\u9879\u76EE\u7684\u6210\u5458"));
      assertProjectActive(project);
      const title = str2(p.title, 200);
      if (!title) throw new Error((0, import_i18n15.t)("\u8BF7\u586B\u5199\u4F1A\u8BAE\u4E3B\u9898"));
      const time = Number(p.time) > 0 ? Number(p.time) : c.now;
      const source = ["offline", "tencent", "zoom"].includes(p.source) ? p.source : "offline";
      const host = requireActivePerson(s.org, str2(p.hostId) || me.id, (0, import_i18n15.t)("\u4E3B\u6301\u4EBA"));
      const attendees = strArr(p.attendeeIds).map((id) => requireActivePerson(s.org, id, (0, import_i18n15.t)("\u53C2\u4F1A\u4EBA")).id);
      const meeting = {
        id: newId("mt"),
        projectId: project.id,
        title,
        time,
        source,
        hostId: host.id,
        attendeeIds: [.../* @__PURE__ */ new Set([host.id, ...attendees])],
        createdBy: me.id,
        createdAt: c.now,
        status: "pending_upload",
        files: [],
        speakers: [],
        segments: [],
        topics: [],
        decisions: [],
        summaryLines: [],
        confirmations: [],
        taskIds: []
      };
      this.store.update((st) => {
        const pj = this.findProject(st, project.id);
        assertProjectActive(pj);
        st.meetings.push(meeting);
        ensureMembers(pj, meeting.attendeeIds);
      });
      this.changed("meeting", meeting.id);
      this.changed("project", project.id);
      return meeting;
    },
    "meeting.delete": (c, p) => {
      const me = this.me(c);
      const id = str2(p.id);
      const deletedTasks = this.store.update((st) => {
        const m = this.findMeeting(st, id);
        const project = st.projects.find((x) => x.id === m.projectId);
        if (project) assertProjectNotArchived(project);
        if (!this.canDeleteMeeting(me.id, m, project)) {
          throw new Error((0, import_i18n15.t)("\u53EA\u6709\u4E3B\u6301\u4EBA\u3001\u521B\u5EFA\u4EBA\u3001\u9879\u76EE\u8D1F\u8D23\u4EBA\u6216\u7BA1\u7406\u5458\u53EF\u4EE5\u5220\u9664\u4F1A\u8BAE"));
        }
        const linkedTaskIds = new Set(m.taskIds);
        const removedTaskIds = /* @__PURE__ */ new Set();
        st.tasks = st.tasks.filter((t) => {
          const drop = t.meetingId === m.id || linkedTaskIds.has(t.id);
          if (drop) removedTaskIds.add(t.id);
          return !drop;
        });
        st.notices = st.notices.filter((n) => {
          if ((n.link.kind === "meeting" || n.link.kind === "meeting_plan") && n.link.id === m.id) return false;
          if (n.link.kind === "task" && removedTaskIds.has(n.link.id)) return false;
          return true;
        });
        st.meetings = st.meetings.filter((x) => x.id !== m.id);
        return removedTaskIds.size;
      });
      const job = this.jobs.get(id);
      if (job) {
        try {
          job.abort();
        } catch {
        }
        this.jobs.delete(id);
      }
      this.store.removeMeetingFiles(id);
      this.changed("all");
      return { ok: true, id, deletedTasks };
    },
    "meeting.upload": async (c, p) => this.upload(c, String(p.id || ""), p.paths),
    "meeting.retry": (c, p) => {
      const me = this.me(c);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        assertProjectActive(this.findProject(st, mm.projectId));
        startProcessing(mm, me.id, c.now, { retry: true });
        return mm;
      });
      this.changed("meeting", m.id);
      this.startPipeline(m.id);
      return this.forOrigin(m, c.origin);
    },
    /** 主持人用当前的转写模型重新转写（定稿前；已确认、改过的内容会清掉） */
    "meeting.reprocess": (c, p) => {
      const me = this.me(c);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        assertProjectActive(this.findProject(st, mm.projectId));
        startProcessing(mm, me.id, c.now, { reprocess: true });
        return mm;
      });
      this.changed("meeting", m.id);
      this.startPipeline(m.id);
      return this.forOrigin(m, c.origin);
    },
    "meeting.speaker.assign": (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const person = requireActivePerson(s.org, str2(p.personId), (0, import_i18n15.t)("\u53D1\u8A00\u4EBA"));
      const r = this.store.update((st) => {
        const m = this.findMeeting(st, p.id);
        const pj = this.findProject(st, m.projectId);
        assertProjectNotArchived(pj);
        const prev = m.status;
        const out = assignSpeaker(m, me.id, String(p.label ?? ""), person.id, c.now);
        ensureMembers(pj, [person.id]);
        replaceSpeakerLabels(m, (id) => activePerson(st.org, id)?.name);
        return { m, prev, pending: out.pending, projectName: pj.name };
      });
      if (r.pending.length || r.m.status !== r.prev) this.afterSpeakersSettled(r.m, r.pending, r.projectName, c.now);
      this.changed("meeting", r.m.id);
      return this.forOrigin(r.m, c.origin);
    },
    /** 逐段改发言人：p.label = 改给已有的发言人；p.personId = 改给某位员工 */
    "meeting.segment.speaker": (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const label = str2(p.label);
      const personId = label ? "" : requireActivePerson(s.org, str2(p.personId), (0, import_i18n15.t)("\u53D1\u8A00\u4EBA")).id;
      const r = this.store.update((st) => {
        const m = this.findMeeting(st, p.id);
        const pj = this.findProject(st, m.projectId);
        assertProjectNotArchived(pj);
        const prev = m.status;
        const out = moveSegment(m, me.id, String(p.segmentId ?? ""), label ? { label } : { personId }, c.now);
        ensureMembers(pj, speakerPersonIds(m));
        replaceSpeakerLabels(m, (id) => activePerson(st.org, id)?.name);
        return { m, prev, pending: out.pending, projectName: pj.name };
      });
      if (r.pending.length || r.m.status !== r.prev) this.afterSpeakersSettled(r.m, r.pending, r.projectName, c.now);
      this.changed("meeting", r.m.id);
      return this.forOrigin(r.m, c.origin);
    },
    /** 播放某一段发言的原声（能看这场会议的人都能听，手机页也能听） */
    "meeting.segment.audio": (c, p) => {
      const { m } = this.visibleMeeting(c, p.id);
      const seg = m.segments.find((x) => x.id === String(p.segmentId ?? ""));
      if (!seg) throw new Error((0, import_i18n15.t)("\u6CA1\u6709\u627E\u5230\u8FD9\u6BB5\u53D1\u8A00"));
      const start = Math.max(0, seg.start - 0.3);
      const end = Math.min(seg.end + 0.3, start + SEGMENT_AUDIO_MAX_SEC);
      let b64 = null;
      try {
        b64 = this.ext.segmentAudio(this.store.filesDir(m.id), start, end);
      } catch (e) {
        this.warn("segment audio failed", { error: e?.message });
      }
      if (!b64) throw new Error((0, import_i18n15.t)("\u8FD9\u573A\u4F1A\u8BAE\u6CA1\u6709\u53EF\u64AD\u653E\u7684\u5F55\u97F3\uFF08\u6587\u5B57\u8BB0\u5F55\u5BFC\u5165\u7684\u4F1A\u8BAE\u6CA1\u6709\u539F\u58F0\uFF09"));
      return { dataUrl: `data:audio/wav;base64,${b64}`, start, end, clipped: seg.end + 0.3 > end };
    },
    "meeting.speaker.clip": async (c, p) => {
      const me = this.me(c);
      const { m } = this.visibleMeeting(c, p.id);
      assertHost(m, me.id, (0, import_i18n15.t)("\u8BD5\u542C\u53D1\u8A00\u7247\u6BB5"));
      const label = String(p.label ?? "");
      const slot = m.speakers.find((x) => x.label === label);
      if (!slot) throw new Error((0, import_i18n15.t)("\u6CA1\u6709\u627E\u5230\u53D1\u8A00\u4EBA\u300C{p0}\u300D", { p0: label }));
      let path = slot.clipPath && (0, import_node_fs4.existsSync)(slot.clipPath) && this.store.isInsideRoot(slot.clipPath) ? slot.clipPath : "";
      if (!path) {
        const out = await this.ext.exportSpeakerClip({ meeting: m, label, workDir: this.store.filesDir(m.id) });
        if (out && (0, import_node_fs4.existsSync)(out) && this.store.isInsideRoot(out)) {
          path = out;
          this.store.update((st) => {
            const sp = st.meetings.find((x) => x.id === m.id)?.speakers.find((x) => x.label === label);
            if (sp) sp.clipPath = out;
          });
        }
      }
      if (!path) throw new Error((0, import_i18n15.t)("\u8FD9\u4F4D\u53D1\u8A00\u4EBA\u6CA1\u6709\u53EF\u8BD5\u542C\u7684\u5F55\u97F3\u7247\u6BB5"));
      const size = (0, import_node_fs4.statSync)(path).size;
      if (size > MAX_CLIP_BYTES) throw new Error((0, import_i18n15.t)("\u8BD5\u542C\u7247\u6BB5\u592A\u5927"));
      return { dataUrl: `data:audio/wav;base64,${(0, import_node_fs4.readFileSync)(path).toString("base64")}` };
    },
    /** 主持人定稿前改决议事项和 3 行摘要：p.decisions = [{ id?, text }]，p.summaryLines = [..] */
    "meeting.minutes.save": (c, p) => {
      const me = this.me(c);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        assertProjectNotArchived(this.findProject(st, mm.projectId));
        saveMinutesDraft(mm, me.id, {
          decisions: Array.isArray(p.decisions) ? p.decisions : void 0,
          summaryLines: Array.isArray(p.summaryLines) ? p.summaryLines.map(String) : void 0
        }, () => newId("dc"));
        return mm;
      });
      this.changed("meeting", m.id);
      return this.forOrigin(m, c.origin);
    },
    /** 按当前的发言人、改过的文字让模型重新整理议题 / 决议 / 摘要（覆盖初稿，包括手改的） */
    "meeting.minutes.reorganize": async (c, p) => {
      const me = this.me(c);
      const what = (0, import_i18n15.t)("\u91CD\u65B0\u6574\u7406\u7EAA\u8981");
      const s0 = this.s();
      const m0 = this.findMeeting(s0, p.id);
      assertProjectNotArchived(this.findProject(s0, m0.projectId));
      assertMinutesDraftEditable(m0, me.id, what);
      if (!m0.segments.length) throw new Error((0, import_i18n15.t)("\u8FD8\u6CA1\u6709\u53D1\u8A00\u5185\u5BB9\u53EF\u4EE5\u6574\u7406"));
      if (this.reorganizing.has(m0.id)) throw new Error((0, import_i18n15.t)("\u6B63\u5728\u91CD\u65B0\u6574\u7406\uFF0C\u8BF7\u7A0D\u5019"));
      this.reorganizing.add(m0.id);
      try {
        const nameOf = (id) => id ? activePerson(s0.org, id)?.name : void 0;
        const speakerNames = {};
        for (const sp of m0.speakers) speakerNames[sp.label] = nameOf(sp.personId) || sp.label;
        const org = await this.ext.organizeMinutes({
          segments: m0.segments.map((x) => ({ ...x })),
          speakerNames,
          attendeeNames: m0.attendeeIds.map((id) => nameOf(id) || "").filter(Boolean),
          llm: this.llm,
          prompt: s0.settings.ai.organizePrompt
        });
        const m = this.store.update((st) => {
          const mm = this.findMeeting(st, m0.id);
          assertMinutesDraftEditable(mm, me.id, what);
          const topicOf = new Map(org.segments.map((x) => [x.id, x.topicId]));
          for (const seg of mm.segments) seg.topicId = topicOf.get(seg.id);
          const ids = new Set(mm.segments.map((x) => x.id));
          mm.topics = org.topics.map((t) => ({ ...t, segmentIds: t.segmentIds.filter((id) => ids.has(id)) })).filter((t) => t.segmentIds.length);
          mm.decisions = org.decisions.map((d) => ({ ...d, segmentIds: d.segmentIds.filter((id) => ids.has(id)) }));
          mm.summaryLines = org.summaryLines.slice(0, 3);
          replaceSpeakerLabels(mm, (id) => activePerson(st.org, id)?.name);
          return mm;
        });
        this.changed("meeting", m.id);
        return { ...this.forOrigin(m, c.origin), note: org.note || "" };
      } finally {
        this.reorganizing.delete(m0.id);
      }
    },
    "meeting.segment.edit": (c, p) => {
      const me = this.me(c);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        assertProjectNotArchived(this.findProject(st, mm.projectId));
        editSegment(mm, me.id, String(p.segmentId ?? ""), String(p.text ?? ""), c.now);
        return mm;
      });
      this.changed("meeting", m.id);
      return this.forOrigin(m, c.origin);
    },
    "meeting.confirm": (c, p) => {
      const me = this.me(c);
      const r = this.store.update((st) => {
        const m = this.findMeeting(st, p.id);
        const pj = this.findProject(st, m.projectId);
        assertProjectNotArchived(pj);
        const out = confirmSpeech(m, me.id, c.now);
        return { m, all: out.allConfirmed, projectName: pj.name };
      });
      if (r.all) this.notifyReview(r.m, r.projectName, c.now);
      this.changed("meeting", r.m.id);
      if (this.s().voiceprints.find((v) => v.personId === me.id)?.autoLearn) void this.track(this.learnVoiceprint(r.m.id, me.id));
      return this.forOrigin(r.m, c.origin);
    },
    /** 本人开 / 关「用确认过的会议补充声纹」（采集同意里已包含，默认开）；关掉时已补的样本一起删，之后重录也保持关 */
    "voiceprint.autoLearn.set": (c, p) => {
      const me = this.me(c);
      const on = p.enabled === true;
      const v = this.s().voiceprints.find((x) => x.personId === me.id);
      if (!v) throw new Error((0, import_i18n15.t)("\u8FD8\u6CA1\u6709\u91C7\u96C6\u4F60\u7684\u58F0\u7EB9\uFF0C\u8BF7\u5148\u91C7\u96C6"));
      const now = this.nowFn();
      this.store.update((st) => {
        const x = st.voiceprints.find((y) => y.personId === me.id);
        if (!x) return;
        if (on) {
          x.autoLearn = true;
          x.autoLearnAt = now;
        } else {
          x.autoLearn = false;
          delete x.autoLearnAt;
          delete x.extra;
        }
      });
      this.changed("org");
      return { autoLearn: on };
    },
    "meeting.review.return": (c, p) => {
      const me = this.me(c);
      const personId = str2(p.personId);
      const note = str2(p.note, 500);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        assertProjectNotArchived(this.findProject(st, mm.projectId));
        returnToSpeaker(mm, me.id, personId, note, c.now);
        return mm;
      });
      this.notify([{
        to: personId,
        type: "speech_confirm",
        title: (0, import_i18n15.t)("\u53D1\u8A00\u88AB\u9000\u56DE\uFF1A{p0}", { p0: m.title }),
        summary: note || (0, import_i18n15.t)("\u4E3B\u6301\u4EBA\u9000\u56DE\u4E86\u4F60\u7684\u53D1\u8A00\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u786E\u8BA4"),
        link: { kind: "meeting", id: m.id }
      }], c.now);
      this.changed("meeting", m.id);
      return this.forOrigin(m, c.origin);
    },
    "meeting.review.approve": (c, p) => {
      const me = this.me(c);
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        assertProjectNotArchived(this.findProject(st, mm.projectId));
        approveMinutes(mm, me.id, c.now);
        return mm;
      });
      this.notify(m.attendeeIds.map((to) => ({
        to,
        type: "minutes_final",
        title: (0, import_i18n15.t)("\u6B63\u5F0F\u7EAA\u8981\uFF1A{p0}", { p0: m.title }),
        summary: cardSummary.minutes(m.summaryLines) || m.title,
        link: { kind: "meeting", id: m.id }
      })), c.now);
      this.changed("meeting", m.id);
      return this.forOrigin(m, c.origin);
    },
    "meeting.decide": async (c, p) => {
      const me = this.me(c);
      const id = String(p.id || "");
      if (this.planJobs.has(id)) throw new Error((0, import_i18n15.t)("\u6267\u884C\u65B9\u6848\u6B63\u5728\u751F\u6210\uFF0C\u8BF7\u7A0D\u5019"));
      const decision = p.decision === "generate" ? "generate" : p.decision === "none" ? "none" : p.decision;
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, id);
        const pj = this.findProject(st, mm.projectId);
        if (decision === "generate") assertProjectActive(pj);
        else assertProjectNotArchived(pj);
        decideTasks(mm, me.id, decision);
        return mm;
      });
      this.changed("meeting", id);
      if (decision === "none") {
        this.changed("project", m.projectId);
        return this.forOrigin(m, c.origin);
      }
      this.planJobs.add(id);
      try {
        const s = this.s();
        const plan = await this.ext.generatePlan({
          meeting: m,
          project: this.findProject(s, m.projectId),
          org: s.org,
          today: ymd(c.now),
          prompt: s.settings.ai.planPrompt,
          llm: this.llm
        });
        const out = this.store.update((st) => {
          const mm = this.findMeeting(st, id);
          attachPlan(mm, { ...plan, generatedAt: plan.generatedAt || this.nowFn(), items: (plan.items || []).map((it) => ({ ...it, id: it.id || newId("pi") })) });
          return mm;
        });
        return this.forOrigin(out, c.origin);
      } catch (e) {
        try {
          this.store.update((st) => {
            const mm = st.meetings.find((x) => x.id === id);
            if (mm && mm.status === "finalized" && mm.taskDecision === "generate") mm.taskDecision = void 0;
          });
        } catch {
        }
        throw e;
      } finally {
        this.planJobs.delete(id);
        this.changed("meeting", id);
      }
    },
    /** 指定任务负责人（可多位：ownerIds；兼容旧调用 ownerId）。新加进来的人收到「方案待确认」，原来就在的不重复发 */
    "meeting.plan.owner": (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const raw = Array.isArray(p.ownerIds) ? p.ownerIds : [p.ownerId];
      const ids = [...new Set(raw.map((x) => str2(x)).filter(Boolean))];
      if (!ids.length) throw new Error((0, import_i18n15.t)("\u8BF7\u81F3\u5C11\u9009\u4E00\u4F4D\u4EFB\u52A1\u8D1F\u8D23\u4EBA"));
      const owners = ids.map((id) => requireActivePerson(s.org, id, (0, import_i18n15.t)("\u4EFB\u52A1\u8D1F\u8D23\u4EBA")).id);
      let before = [];
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        const pj = this.findProject(st, mm.projectId);
        assertProjectActive(pj);
        before = planOwners(mm.plan);
        setPlanOwner(mm, me.id, owners);
        ensureMembers(pj, owners);
        return mm;
      });
      const added = owners.filter((id) => !before.includes(id));
      this.notify(added.map((to) => ({
        to,
        type: "plan_confirm",
        title: (0, import_i18n15.t)("\u6267\u884C\u65B9\u6848\u5F85\u786E\u8BA4\uFF1A{p0}", { p0: m.title }),
        summary: cardSummary.plan(m.plan?.items || []),
        link: { kind: "meeting_plan", id: m.id }
      })), c.now);
      this.changed("meeting", m.id);
      return this.forOrigin(m, c.origin);
    },
    "meeting.plan.save": (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const items = sanitizePlanItems(p.items, s.org, () => newId("pi"));
      const m = this.store.update((st) => {
        const mm = this.findMeeting(st, p.id);
        assertProjectActive(this.findProject(st, mm.projectId));
        savePlan(mm, me.id, items, typeof p.summary === "string" ? p.summary : void 0);
        return mm;
      });
      this.changed("meeting", m.id);
      return m.plan;
    },
    "meeting.plan.confirm": (c, p) => {
      const me = this.me(c);
      const r = this.store.update((st) => {
        const m = this.findMeeting(st, p.id);
        const pj = this.findProject(st, m.projectId);
        const tasks = confirmPlan(m, me.id, pj, st.org, c.now, () => newId("tk"));
        st.tasks.push(...tasks);
        ensureMembers(pj, tasks.flatMap((t) => [t.assigneeId, ...taskOwners(t)]));
        return { m, tasks, projectId: pj.id };
      });
      this.notify(r.tasks.map((t) => ({
        to: t.assigneeId,
        type: "task_new",
        title: (0, import_i18n15.t)("\u65B0\u4EFB\u52A1\u5F85\u63A5\u6536\uFF1A{p0}", { p0: t.title }),
        summary: cardSummary.task(t),
        link: { kind: "task", id: t.id }
      })), c.now);
      this.changed("meeting", r.m.id);
      this.changed("task");
      this.changed("project", r.projectId);
      return this.forOrigin(r.m, c.origin);
    },
    // ── 任务 ──
    "task.list": (c, p) => {
      const me = this.me(c);
      const s = this.s();
      const view = p.view === "received" || p.view === "assigned" ? p.view : "all";
      const q = str2(p.q, 100).toLowerCase();
      const status = String(p.status || "");
      const list = s.tasks.filter((t) => {
        if (view === "received" && t.assigneeId !== me.id) return false;
        if (view === "assigned" && !taskOwners(t).includes(me.id)) return false;
        if (view === "all" && !this.canSeeTask(me.id, t, s.projects.find((x) => x.id === t.projectId))) return false;
        if (p.projectId && t.projectId !== p.projectId) return false;
        if (p.meetingId && t.meetingId !== p.meetingId) return false;
        if (p.deptId && t.deptId !== p.deptId) return false;
        if (status === "overdue" && !isTaskOverdue(t, c.now)) return false;
        if (status === "objection" && !hasOpenObjection(t)) return false;
        if (status === "active" && isTaskClosed(t)) return false;
        if (TASK_STATUSES.includes(status) && t.status !== status) return false;
        if (q && !t.title.toLowerCase().includes(q)) return false;
        return true;
      });
      const rank = (t) => isTaskClosed(t) ? 1 : 0;
      return list.sort((a, b) => rank(a) - rank(b) || (rank(a) ? (b.doneAt || b.createdAt) - (a.doneAt || a.createdAt) : a.due.localeCompare(b.due))).map((t) => this.taskView(t, c.now));
    },
    "task.get": (c, p) => {
      const me = this.me(c);
      const { t, p: project } = this.visibleTask(c, p.id);
      const s = this.s();
      const live = project.status !== "archived";
      const o = hasOpenObjection(t) ? t.objection : void 0;
      const isAssignee = t.assigneeId === me.id;
      const running = t.status === "not_started" || t.status === "in_progress";
      const ids = /* @__PURE__ */ new Set([t.assigneeId, t.ownerId, project.ownerId, ...t.events.map((e) => e.by), ...t.progressLog.map((x) => x.by)]);
      for (const h of [...t.objectionHistory, ...o ? [o] : []]) {
        ids.add(h.raisedBy);
        if (h.review) ids.add(h.review.by);
        if (h.arbitration) ids.add(h.arbitration.by);
      }
      const meeting = s.meetings.find((m) => m.id === t.meetingId);
      return {
        task: this.taskView(t, c.now),
        names: this.namesFor(ids),
        project: { id: project.id, name: project.name, status: project.status, ownerId: project.ownerId },
        meeting: meeting ? { id: meeting.id, title: meeting.title } : null,
        can: {
          accept: live && isAssignee && t.status === "to_accept" && !o,
          object: live && isAssignee && t.status === "to_accept" && !o,
          progress: live && isAssignee && running && !o,
          complete: live && isAssignee && t.status === "in_progress" && !o,
          change: live && isAssignee && running && !o,
          review: live && !!o && o.stage === "review" && taskOwners(t).includes(me.id),
          reply: live && !!o && o.stage === "dept_reply" && isAssignee,
          escalate: live && !!o && o.stage === "dept_reply" && isAssignee,
          arbitrate: live && !!o && o.stage === "arbitration" && project.ownerId === me.id
        }
      };
    },
    "task.accept": (c, p) => this.taskAction(c, p.id, (t, me) => {
      acceptTask(t, me, c.now);
    }),
    /** 更新进度：每位任务负责人收到一条「进度更新」（自己更新的不发给自己），点开就是这个任务 */
    "task.progress": (c, p) => {
      const t = this.taskAction(c, p.id, (x, me) => {
        updateProgress(x, me, Number(p.percent), String(p.note ?? ""), c.now, p.status === "not_started" ? "not_started" : void 0);
      });
      const actor = this.me(c).id;
      const note = String(p.note ?? "").trim();
      const summary = note ? (0, import_i18n15.t)("{p0}\u66F4\u65B0\u5230 {p1}%\uFF1A{p2}", { p0: this.nameOf(actor), p1: t.percent, p2: note }) : (0, import_i18n15.t)("{p0}\u66F4\u65B0\u5230 {p1}%", { p0: this.nameOf(actor), p1: t.percent });
      this.notify(taskOwners(t).filter((to) => to !== actor).map((to) => ({
        to,
        type: "task_progress",
        title: (0, import_i18n15.t)("\u4EFB\u52A1\u8FDB\u5EA6\u66F4\u65B0\uFF1A{p0}", { p0: t.title }),
        summary,
        link: { kind: "task", id: t.id }
      })), c.now);
      return t;
    },
    "task.complete": (c, p) => {
      const t = this.taskAction(c, p.id, (x, me) => {
        completeTask(x, me, typeof p.note === "string" ? p.note : void 0, c.now);
      });
      this.notify(taskOwners(t).map((to) => ({
        to,
        type: "task_done",
        title: (0, import_i18n15.t)("\u4EFB\u52A1\u5DF2\u5B8C\u6210\uFF1A{p0}", { p0: t.title }),
        summary: (0, import_i18n15.t)("{p0}\u5DF2\u6807\u8BB0\u5B8C\u6210", { p0: this.nameOf(t.assigneeId) }),
        link: { kind: "task", id: t.id }
      })), c.now);
      return t;
    },
    "task.objection.raise": (c, p) => {
      const t = this.taskAction(c, p.id, (x, me) => {
        raiseObjection(x, me, { target: p.target, reason: String(p.reason ?? ""), suggestion: String(p.suggestion ?? ""), suggestedDue: p.suggestedDue ? String(p.suggestedDue) : void 0 }, c.now, newId("ob"));
      });
      const o = t.objection;
      this.notify(taskOwners(t).map((to) => ({
        to,
        type: "objection_review",
        title: o.kind === "change" ? (0, import_i18n15.t)("\u53D8\u66F4\u7533\u8BF7\u5F85\u590D\u6838\uFF1A{p0}", { p0: t.title }) : (0, import_i18n15.t)("\u5F02\u8BAE\u5F85\u590D\u6838\uFF1A{p0}", { p0: t.title }),
        summary: (0, import_i18n15.t)("{p0}\uFF1A{p1}", { p0: this.nameOf(o.raisedBy), p1: o.reason }),
        link: { kind: "task", id: t.id }
      })), c.now);
      return t;
    },
    "task.objection.review": (c, p) => {
      let result = "rejected";
      const decision = p.decision === "adopt" ? "adopt" : p.decision === "reject" ? "reject" : p.decision;
      const t = this.taskAction(c, p.id, (x, me) => {
        result = reviewObjection(x, me, decision, String(p.note ?? ""), p.changes, c.now);
      });
      if (result === "adopted") {
        this.notify([{ to: t.assigneeId, type: "plan_adjusted", title: (0, import_i18n15.t)("\u8C03\u6574\u540E\u65B9\u6848\u5F85\u786E\u8BA4\uFF1A{p0}", { p0: t.title }), summary: cardSummary.task(t), link: { kind: "task", id: t.id } }], c.now);
      } else if (result === "cancelled") {
        this.notify([{ to: t.assigneeId, type: "arbitration_result", title: (0, import_i18n15.t)("\u4EFB\u52A1\u5DF2\u53D6\u6D88\uFF1A{p0}", { p0: t.title }), summary: str2(p.note, 200) || (0, import_i18n15.t)("\u4EFB\u52A1\u8D1F\u8D23\u4EBA\u91C7\u7EB3\u4E86\u5F02\u8BAE\u5E76\u5220\u9664\u4E86\u8BE5\u4EFB\u52A1"), link: { kind: "task", id: t.id } }], c.now);
      }
      return t;
    },
    "task.objection.reply": (c, p) => {
      let result = "accepted_reject";
      const decision = p.decision === "accept" ? "accept" : p.decision === "escalate" ? "escalate" : p.decision;
      const t = this.taskAction(c, p.id, (x, me) => {
        result = replyObjection(x, me, decision, c.now);
      });
      if (result === "escalated") {
        const project = this.findProject(this.s(), t.projectId);
        this.notify([{
          to: project.ownerId,
          type: "arbitration",
          title: (0, import_i18n15.t)("\u5F02\u8BAE\u5F85\u88C1\u51B3\uFF1A{p0}", { p0: t.title }),
          summary: t.objection?.suggestedDue ? (0, import_i18n15.t)("{p0}\u4E0E{p1}\u5BF9\u622A\u6B62\u65E5\u6709\u5206\u6B67\uFF08{p2} / {p3}\uFF09", { p0: this.nameOf(t.assigneeId), p1: this.namesOf(taskOwners(t)), p2: t.due, p3: t.objection.suggestedDue }) : (0, import_i18n15.t)("{p0}\u4E0E{p1}\u5BF9\u4EFB\u52A1\u6709\u5206\u6B67\uFF0C\u8BF7\u88C1\u51B3", { p0: this.nameOf(t.assigneeId), p1: this.namesOf(taskOwners(t)) }),
          link: { kind: "task", id: t.id }
        }], c.now);
      }
      return t;
    },
    "task.objection.arbitrate": (c, p) => {
      let result = "kept";
      const decision = p.decision === "keep" ? "keep" : p.decision === "adjust" ? "adjust" : p.decision;
      const t = this.taskAction(c, p.id, (x, me, pj) => {
        result = arbitrateObjection(x, me, pj.ownerId, decision, String(p.note ?? ""), p.changes, c.now);
      });
      const summary = result === "cancelled" ? (0, import_i18n15.t)("\u88C1\u51B3\uFF1A\u5220\u9664\u8BE5\u4EFB\u52A1") : result === "adjusted" ? (0, import_i18n15.t)("\u88C1\u51B3\uFF1A\u6309\u5F02\u8BAE\u8C03\u6574\uFF08\u622A\u6B62 {p0}\uFF09", { p0: t.due }) : (0, import_i18n15.t)("\u88C1\u51B3\uFF1A\u7EF4\u6301\u539F\u65B9\u6848\uFF08\u622A\u6B62 {p0}\uFF09", { p0: t.due });
      this.notify([.../* @__PURE__ */ new Set([...taskOwners(t), t.assigneeId])].map((to) => ({
        to,
        type: "arbitration_result",
        title: (0, import_i18n15.t)("\u88C1\u51B3\u7ED3\u679C\uFF1A{p0}", { p0: t.title }),
        summary,
        link: { kind: "task", id: t.id }
      })), c.now);
      return t;
    },
    // ── 组织与设置 ──
    "org.sync": async (c) => {
      const me = this.requireAdmin(c, (0, import_i18n15.t)("\u540C\u6B65\u901A\u8BAF\u5F55"));
      const prev = this.s().org;
      const client = this.wecomClient();
      let next;
      let source = "demo";
      if (client) {
        source = "wecom";
        try {
          next = await client.fetchOrg();
        } catch (e) {
          const result2 = { at: this.nowFn(), by: me.id, source, added: [], changed: [], left: [], error: e?.message || (0, import_i18n15.t)("\u540C\u6B65\u5931\u8D25") };
          this.store.update((st) => {
            st.org.lastSync = result2;
          });
          this.changed("org");
          return result2;
        }
      } else {
        next = buildDemoOrg();
      }
      const diff = this.ext.diffOrg(prev, next);
      const result = { at: this.nowFn(), by: me.id, source, ...diff };
      this.replaceOrg(next, source, result);
      return { ...result, needIdentity: !activePerson(this.s().org, c.actorId) };
    },
    /** 导入通讯录表格（企微后台「通讯录 → 导出成员」，或自己整理的）：没有自建应用、读不了通讯录接口时用 */
    "org.import": (c, p) => {
      const me = this.requireAdmin(c, (0, import_i18n15.t)("\u5BFC\u5165\u901A\u8BAF\u5F55"));
      const path = String(p.path ?? "");
      if (!path || !(0, import_node_fs4.existsSync)(path) || !(0, import_node_fs4.statSync)(path).isFile()) throw new Error((0, import_i18n15.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      const wb = (0, import_spreadsheetRead.openSpreadsheetFile)(path);
      const ws = wb.Sheets[wb.SheetNames[0] || ""];
      if (!ws) throw new Error((0, import_i18n15.t)("\u8868\u683C\u662F\u7A7A\u7684"));
      const parsed = parseOrgTable((0, import_spreadsheetRead.readWorksheetData)(ws, { raw: false, defval: "" }).rows);
      const diff = this.ext.diffOrg(this.s().org, parsed);
      const result = { at: this.nowFn(), by: me.id, source: "import", ...diff, ...parsed.warnings.length ? { warnings: parsed.warnings } : {} };
      this.replaceOrg(parsed, "import", result);
      return { ...result, people: parsed.people.length, depts: parsed.depts.length, needIdentity: !activePerson(this.s().org, c.actorId) };
    },
    /** 给某人填群里 @ 用的手机号 / 企微账号（管理员）；空串 = 清掉 */
    "org.person.contact": (c, p) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u4FEE\u6539\u4EBA\u5458\u7684\u624B\u673A\u53F7\u548C\u4F01\u5FAE\u8D26\u53F7"));
      const personId = str2(p.personId);
      requireActivePerson(this.s().org, personId, (0, import_i18n15.t)("\u4EBA\u5458"));
      const mobileRaw = String(p.mobile ?? "").trim();
      const uidRaw = String(p.wecomUserId ?? "").trim();
      const mobile = normalizeMobile(mobileRaw);
      const uid = normalizeWecomUserId(uidRaw);
      if (mobileRaw && !mobile) throw new Error((0, import_i18n15.t)("\u624B\u673A\u53F7\u683C\u5F0F\u4E0D\u5BF9"));
      if (uidRaw && !uid) throw new Error((0, import_i18n15.t)("\u4F01\u5FAE\u8D26\u53F7\u683C\u5F0F\u4E0D\u5BF9\uFF1A\u53EA\u80FD\u6709\u5B57\u6BCD\u3001\u6570\u5B57\u548C\u4E0B\u5212\u7EBF\u3001\u70B9\u3001\u77ED\u6A2A\u7EBF"));
      const person = this.store.update((st) => {
        const x = st.org.people.find((y) => y.id === personId);
        if (mobile) x.mobile = mobile;
        else delete x.mobile;
        if (p.wecomUserId !== void 0) {
          if (uid) {
            x.wecomUserId = uid;
            x.wecomIdManual = true;
          } else {
            delete x.wecomUserId;
            delete x.wecomIdManual;
          }
        }
        return { ...x };
      });
      this.changed("org");
      return person;
    },
    "settings.get": () => this.s().settings,
    "settings.save": (c, p) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u4FEE\u6539\u7CFB\u7EDF\u8BBE\u7F6E"));
      const patch = p.patch && typeof p.patch === "object" ? p.patch : {};
      const settings = this.store.update((st) => {
        applySettingsPatch(st, patch);
        return st.settings;
      });
      this.changed("settings");
      return settings;
    },
    "wecom.save": (c, p) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u914D\u7F6E\u4F01\u4E1A\u5FAE\u4FE1"));
      const corpId = str2(p.corpId, 100);
      const agentId = str2(p.agentId, 50);
      const secret = String(p.secret ?? "").trim();
      const cardBaseUrl = str2(p.cardBaseUrl, 500);
      if (cardBaseUrl && !/^https?:\/\/[^\s]+$/i.test(cardBaseUrl)) throw new Error((0, import_i18n15.t)("\u5361\u7247\u5730\u5740\u8BF7\u586B\u5199 http:// \u6216 https:// \u5F00\u5934\u7684\u7F51\u5740"));
      if (secret) {
        if (!this.ext.seal.can()) throw new Error((0, import_i18n15.t)("\u672C\u673A\u65E0\u6CD5\u5B89\u5168\u4FDD\u5B58\u4F01\u5FAE Secret\uFF08\u7CFB\u7EDF\u94A5\u5319\u4E32\u4E0D\u53EF\u7528\uFF09"));
        this.store.writeSecret(this.ext.seal.seal(secret));
      }
      const clear = !corpId && !agentId;
      if (clear) this.store.writeSecret(null);
      const wecom = this.store.update((st) => {
        const { hasWebhook, webhookMasked } = st.settings.wecom;
        st.settings.wecom = {
          corpId,
          agentId,
          hasSecret: clear ? false : secret ? true : st.settings.wecom.hasSecret && !!this.store.readSecret(),
          ...cardBaseUrl ? { cardBaseUrl } : {},
          ...hasWebhook ? { hasWebhook, webhookMasked } : {}
        };
        return st.settings.wecom;
      });
      this.changed("settings");
      return wecom;
    },
    /** 群机器人：p.url 为空 = 移除；只认 qyapi.weixin.qq.com 的 webhook 地址（或只贴 key） */
    "wecom.webhook.save": (c, p) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u914D\u7F6E\u4F01\u5FAE\u7FA4\u673A\u5668\u4EBA"));
      const raw = String(p.url ?? "").trim();
      if (!raw) {
        this.store.writeWebhook(null);
        const wecom2 = this.store.update((st) => {
          delete st.settings.wecom.hasWebhook;
          delete st.settings.wecom.webhookMasked;
          return st.settings.wecom;
        });
        this.changed("settings");
        return wecom2;
      }
      const url = normalizeWebhookUrl(raw);
      if (!url) throw new Error((0, import_i18n15.t)("\u4E0D\u662F\u4F01\u4E1A\u5FAE\u4FE1\u7FA4\u673A\u5668\u4EBA\u7684\u5730\u5740\uFF1A\u5E94\u5F62\u5982 https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=\u2026"));
      if (!this.ext.seal.can()) throw new Error((0, import_i18n15.t)("\u672C\u673A\u65E0\u6CD5\u5B89\u5168\u4FDD\u5B58\u7FA4\u673A\u5668\u4EBA\u5730\u5740\uFF08\u7CFB\u7EDF\u94A5\u5319\u4E32\u4E0D\u53EF\u7528\uFF09"));
      this.store.writeWebhook(this.ext.seal.seal(url));
      const wecom = this.store.update((st) => {
        st.settings.wecom.hasWebhook = true;
        st.settings.wecom.webhookMasked = maskWebhookUrl(url);
        return st.settings.wecom;
      });
      this.changed("settings");
      return wecom;
    },
    "wecom.webhook.test": async (c) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u6D4B\u8BD5\u4F01\u5FAE\u7FA4\u673A\u5668\u4EBA"));
      const url = this.webhookUrl();
      if (!url) throw new Error((0, import_i18n15.t)("\u8BF7\u5148\u586B\u5199\u7FA4\u673A\u5668\u4EBA\u7684 Webhook \u5730\u5740"));
      return this.ext.createWebhook(url).test();
    },
    // ── 会议转写方式：本机模型（推荐，录音不出电脑）/ App 的 AI 服务 / 自己填的在线语音识别接口 ──
    "asr.mode.save": (c, p) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u4FEE\u6539\u4F1A\u8BAE\u8F6C\u5199\u65B9\u5F0F"));
      const mode = p.mode === "cloud" ? "cloud" : p.mode === "agent" ? "agent" : "local";
      if (mode === "cloud" && !this.cloudAsrConfig()) throw new Error((0, import_i18n15.t)("\u5728\u7EBF\u63A5\u53E3\u8FD8\u6CA1\u586B\u5B8C\u6574\uFF08\u5730\u5740\u3001\u6A21\u578B\u3001API Key\uFF09\uFF0C\u8BF7\u5148\u4FDD\u5B58\u5728\u7EBF\u63A5\u53E3"));
      const localModel = ["firered", "sensevoice", "whisper"].includes(p.localModel) ? p.localModel : "auto";
      this.store.update((st) => {
        st.settings.ai.asr = mode;
        st.settings.ai.localAsrModel = localModel;
      });
      this.changed("settings");
      return this.asrSettingsView();
    },
    "asr.cloud.save": (c, p) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u914D\u7F6E\u5728\u7EBF\u8BED\u97F3\u8BC6\u522B\u63A5\u53E3"));
      if (p.clear === true) {
        this.store.writeCloudAsrKey(null);
        this.store.update((st) => {
          delete st.settings.ai.cloudAsr;
          if (st.settings.ai.asr === "cloud") st.settings.ai.asr = "local";
        });
        this.changed("settings");
        return this.asrSettingsView();
      }
      const provider = cloudAsrPreset(str2(p.provider)).id;
      const baseUrl = normalizeBaseUrl(str2(p.baseUrl, 500) || cloudAsrPreset(provider).baseUrl);
      if (!baseUrl) throw new Error((0, import_i18n15.t)("\u5728\u7EBF\u63A5\u53E3\u5730\u5740\u4E0D\u5BF9\uFF0C\u8BF7\u586B http:// \u6216 https:// \u5F00\u5934\u7684\u5730\u5740"));
      const model = str2(p.model, 200);
      if (!model) throw new Error((0, import_i18n15.t)("\u8BF7\u586B\u5199\u5728\u7EBF\u63A5\u53E3\u7684\u6A21\u578B\u540D"));
      const apiKey = str2(p.apiKey, 500);
      if (apiKey) {
        if (!this.ext.seal.can()) throw new Error((0, import_i18n15.t)("\u8FD9\u53F0\u7535\u8111\u7684\u7CFB\u7EDF\u52A0\u5BC6\u5B58\u50A8\u4E0D\u53EF\u7528\uFF0CAPI Key \u6CA1\u6CD5\u5B89\u5168\u4FDD\u5B58"));
        this.store.writeCloudAsrKey(this.ext.seal.seal(apiKey));
      }
      const hasKey = !!this.store.readCloudAsrKey();
      if (!hasKey) throw new Error((0, import_i18n15.t)("\u8BF7\u586B\u5199\u5728\u7EBF\u63A5\u53E3\u7684 API Key"));
      this.store.update((st) => {
        st.settings.ai.cloudAsr = { provider, baseUrl, model, hasKey };
      });
      this.changed("settings");
      return this.asrSettingsView();
    },
    /** 用 1 秒静音试一下地址 / Key / 模型对不对（没填的项用已保存的） */
    "asr.cloud.test": async (c, p) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u6D4B\u8BD5\u5728\u7EBF\u8BED\u97F3\u8BC6\u522B\u63A5\u53E3"));
      const saved = this.cloudAsrConfig();
      const provider = cloudAsrPreset(str2(p.provider) || saved?.provider).id;
      const cfg = {
        provider,
        baseUrl: str2(p.baseUrl, 500) || saved?.baseUrl || cloudAsrPreset(provider).baseUrl,
        model: str2(p.model, 200) || saved?.model || "",
        apiKey: str2(p.apiKey, 500) || saved?.apiKey || ""
      };
      const t0 = Date.now();
      const r = await this.ext.cloudTranscribe(cfg, silenceWav(1.2));
      return r.ok ? { ok: true, ms: Date.now() - t0 } : { ok: false, error: r.error || (0, import_i18n15.t)("\u8FDE\u63A5\u5931\u8D25") };
    },
    "asr.cloud.reveal": (c) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u67E5\u770B\u5728\u7EBF\u63A5\u53E3 API Key"));
      const sealed = this.store.readCloudAsrKey();
      if (!sealed) return { apiKey: "" };
      try {
        return { apiKey: this.ext.seal.unseal(sealed) || "" };
      } catch {
        throw new Error((0, import_i18n15.t)("\u672C\u673A\u8BFB\u4E0D\u51FA\u5DF2\u4FDD\u5B58\u7684 API Key\uFF08\u7CFB\u7EDF\u94A5\u5319\u4E32\u4E0D\u53EF\u7528\uFF09\uFF0C\u8BF7\u91CD\u65B0\u586B\u5199"));
      }
    },
    /** 管理员在本机查看已保存的企微 Secret（只在电脑端；手机页调不了） */
    "wecom.secret.reveal": (c) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u67E5\u770B\u4F01\u5FAE Secret"));
      const sealed = this.store.readSecret();
      if (!sealed) return { secret: "" };
      try {
        return { secret: this.ext.seal.unseal(sealed) || "" };
      } catch {
        throw new Error((0, import_i18n15.t)("\u672C\u673A\u8BFB\u4E0D\u51FA\u5DF2\u4FDD\u5B58\u7684 Secret\uFF08\u7CFB\u7EDF\u94A5\u5319\u4E32\u4E0D\u53EF\u7528\uFF09\uFF0C\u8BF7\u91CD\u65B0\u586B\u5199"));
      }
    },
    "wecom.test": async (c) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u6D4B\u8BD5\u4F01\u4E1A\u5FAE\u4FE1\u8FDE\u63A5"));
      const client = this.wecomClient();
      if (!client) throw new Error((0, import_i18n15.t)("\u8BF7\u5148\u586B\u5199\u4F01\u4E1A\u5FAE\u4FE1\u7684 CorpID\u3001AgentID \u548C Secret"));
      return client.test();
    },
    // ── 声纹 ──
    "voiceprint.list": async (c) => {
      const me = this.me(c);
      let speaker2 = false;
      try {
        speaker2 = !!(await this.ext.checkRuntime()).speaker2;
      } catch {
      }
      const s = this.s();
      const people = this.isAdmin(me.id) ? s.org.people.filter((x) => !x.left) : [me];
      return people.map((person) => {
        const v = s.voiceprints.find((x) => x.personId === person.id);
        return {
          person,
          deptName: deptName(s.org, person.deptId),
          status: v ? "collected" : "missing",
          ...v ? {
            consentAt: v.consentAt,
            enrolledAt: v.enrolledAt,
            sampleSeconds: v.sampleSeconds,
            // 声纹向量本身不出主进程；只给界面看：是不是新模型的、会议补充开没开、补了几条
            newModel: !!(v.vector2 && v.vector2.length),
            autoLearn: !!v.autoLearn,
            extraCount: (v.extra || []).length,
            // 本机装了更准的 ERes2NetV2，但这份声纹是旧模型采的：建议本人重录一次（不然整场会议只能用旧模型认人）
            needsUpdate: speaker2 && !(v.vector2 && v.vector2.length)
          } : {}
        };
      });
    },
    "voiceprint.enroll": async (c, p) => {
      const me = this.me(c);
      const personId = str2(p.personId) || me.id;
      if (personId !== me.id && !this.isAdmin(me.id)) throw new Error((0, import_i18n15.t)("\u53EA\u80FD\u91C7\u96C6\u672C\u4EBA\u7684\u58F0\u7EB9"));
      requireActivePerson(this.s().org, personId, (0, import_i18n15.t)("\u4EBA\u5458"));
      if (p.consent !== true) throw new Error((0, import_i18n15.t)("\u91C7\u96C6\u58F0\u7EB9\u9700\u8981\u672C\u4EBA\u6388\u6743\u540C\u610F"));
      const path = String(p.path ?? "");
      if (!path || !(0, import_node_fs4.existsSync)(path) || !(0, import_node_fs4.statSync)(path).isFile()) throw new Error((0, import_i18n15.t)("\u5F55\u97F3\u6587\u4EF6\u4E0D\u5B58\u5728"));
      const fromUpload = MeetingMgmtStore.isInside(this.store.uploadsDir(), path);
      if (c.origin === "mobile" && !fromUpload) throw new Error((0, import_i18n15.t)("\u5F55\u97F3\u6587\u4EF6\u4E0D\u5728\u4E0A\u4F20\u76EE\u5F55\u91CC"));
      try {
        const r = await this.ext.enrollVoiceprint(path);
        if (!r.ok) throw new Error(r.reason || (0, import_i18n15.t)("\u5F55\u97F3\u8D28\u91CF\u4E0D\u5408\u683C\uFF0C\u8BF7\u91CD\u5F55"));
        const now = this.nowFn();
        this.store.update((st) => {
          const prev = st.voiceprints.find((v) => v.personId === personId);
          const self = personId === me.id;
          const autoLearn = self && typeof p.autoLearn === "boolean" ? p.autoLearn : prev?.autoLearn !== false;
          st.voiceprints = st.voiceprints.filter((v) => v.personId !== personId);
          st.voiceprints.push({
            personId,
            consentAt: now,
            enrolledAt: now,
            vector: r.vector,
            ...r.vector2 ? { vector2: r.vector2 } : {},
            sampleSeconds: r.seconds,
            ...autoLearn ? { autoLearn: true, autoLearnAt: prev?.autoLearn ? prev.autoLearnAt ?? now : now, ...prev?.extra?.length ? { extra: prev.extra } : {} } : { autoLearn: false }
          });
        });
        this.changed("org");
        return { ok: true, seconds: r.seconds };
      } finally {
        if (fromUpload) {
          try {
            (0, import_node_fs4.unlinkSync)(path);
          } catch {
          }
        }
      }
    },
    /** 电脑上现场录的声纹（配置引导 / 声纹库里「现场录音」）：录音数据落到上传目录，提完声纹即删 */
    "voiceprint.enrollData": async (c, p) => {
      const data = String(p.data ?? "");
      if (!data || data.length > 8 * 1024 * 1024) throw new Error((0, import_i18n15.t)("\u5F55\u97F3\u6570\u636E\u65E0\u6548\uFF0C\u8BF7\u91CD\u5F55"));
      const ext = /^(webm|ogg|wav|m4a|mp4)$/.test(String(p.ext ?? "")) ? String(p.ext) : "webm";
      const path = (0, import_node_path3.join)(this.store.uploadsDir(), `pc-voice-${(0, import_node_crypto5.randomBytes)(6).toString("hex")}.${ext}`);
      (0, import_node_fs4.writeFileSync)(path, Buffer.from(data, "base64"));
      return this.actions["voiceprint.enroll"](c, { personId: p.personId, consent: p.consent, path, ...typeof p.autoLearn === "boolean" ? { autoLearn: p.autoLearn } : {} });
    },
    "voiceprint.delete": (c, p) => {
      const me = this.me(c);
      const personId = str2(p.personId) || me.id;
      if (personId !== me.id && !this.isAdmin(me.id)) throw new Error((0, import_i18n15.t)("\u53EA\u80FD\u64A4\u56DE\u672C\u4EBA\u7684\u58F0\u7EB9\u6388\u6743"));
      this.store.update((st) => {
        st.voiceprints = st.voiceprints.filter((v) => v.personId !== personId);
      });
      this.changed("org");
      return { ok: true };
    },
    "voiceprint.link": (c) => {
      const me = this.me(c);
      if (!this.linkBase()) throw new Error((0, import_i18n15.t)("\u8BF7\u5148\u5F00\u542F\u624B\u673A\u9875\u670D\u52A1\uFF08\u6216\u5728\u8BBE\u7F6E\u91CC\u586B\u5199\u5361\u7247\u5730\u5740\uFF09"));
      const s = this.s();
      const people = this.isAdmin(me.id) ? s.org.people.filter((x) => !x.left) : [me];
      return {
        url: this.personUrl(me.id, { page: "voiceprint" }),
        links: people.map((x) => ({ personId: x.id, name: x.name, deptName: deptName(s.org, x.deptId), url: this.personUrl(x.id, { page: "voiceprint" }) }))
      };
    },
    "voiceprint.send": async (c) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u63A8\u9001\u58F0\u7EB9\u91C7\u96C6"));
      const ch = this.pushChannel();
      if (!ch) throw new Error((0, import_i18n15.t)("\u672A\u8FDE\u63A5\u4F01\u4E1A\u5FAE\u4FE1\uFF0C\u8BF7\u5148\u5728\u8BBE\u7F6E\u91CC\u914D\u7F6E\u4F01\u5FAE\u81EA\u5EFA\u5E94\u7528\u6216\u7FA4\u673A\u5668\u4EBA"));
      if (!this.linkBase()) throw new Error((0, import_i18n15.t)("\u8BF7\u5148\u5F00\u542F\u624B\u673A\u9875\u670D\u52A1\uFF08\u6216\u5728\u8BBE\u7F6E\u91CC\u586B\u5199\u5361\u7247\u5730\u5740\uFF09"));
      const s = this.s();
      const todo = s.org.people.filter((x) => !x.left && !s.voiceprints.some((v) => v.personId === x.id));
      if (!todo.length) return { sent: 0, failed: [], skipped: s.org.people.filter((x) => !x.left).length };
      if (ch === "webhook") {
        const r = await this.ext.createWebhook(this.webhookUrl()).send(buildGroupMessage({
          label: (0, import_i18n15.t)("\u58F0\u7EB9\u91C7\u96C6\u9080\u8BF7"),
          title: (0, import_i18n15.t)("\u8BF7\u8FD8\u6CA1\u91C7\u96C6\u58F0\u7EB9\u7684\u540C\u4E8B\u5F55\u4E00\u6BB5 10~15 \u79D2\u7684\u58F0\u97F3"),
          summary: (0, import_i18n15.t)("\u7528\u4E8E\u5728\u4F1A\u8BAE\u7EAA\u8981\u91CC\u81EA\u52A8\u8BC6\u522B\u4F60\u7684\u53D1\u8A00\uFF0C\u9700\u8981\u672C\u4EBA\u6388\u6743\u540C\u610F\u3002\u6CA1\u6253\u5F00\u8FC7\u4E2A\u4EBA\u4E13\u5C5E\u94FE\u63A5\u7684\u540C\u4E8B\uFF0C\u8BF7\u5148\u627E\u7BA1\u7406\u5458\u8981\u4E00\u6B21\u94FE\u63A5\u3002"),
          mentions: todo.map((x) => this.mentionOf(x, x.name)),
          url: buildGroupUrl(this.linkBase(), null, "voiceprint"),
          buttonText: (0, import_i18n15.t)("\u53BB\u91C7\u96C6"),
          lanOnly: this.lanOnly()
        })).catch((e) => ({ ok: false, error: e?.message }));
        return r.ok ? { sent: todo.length, failed: [], group: true } : { sent: 0, failed: todo.map((x) => ({ personId: x.id, error: r.error || (0, import_i18n15.t)("\u53D1\u9001\u5931\u8D25") })), group: true };
      }
      const client = this.wecomClient();
      if (!client) throw new Error((0, import_i18n15.t)("\u672A\u8FDE\u63A5\u4F01\u4E1A\u5FAE\u4FE1\uFF0C\u8BF7\u5148\u5728\u8BBE\u7F6E\u91CC\u914D\u7F6E\u4F01\u5FAE"));
      let sent = 0;
      const failed = [];
      for (const person of todo) {
        const r = await client.sendCard([person.wecomUserId || person.id], {
          title: (0, import_i18n15.t)("\u58F0\u7EB9\u91C7\u96C6\u9080\u8BF7"),
          description: (0, import_i18n15.t)("\u4E3A\u4E86\u5728\u4F1A\u8BAE\u7EAA\u8981\u91CC\u81EA\u52A8\u8BC6\u522B\u4F60\u7684\u53D1\u8A00\uFF0C\u8BF7\u5F55 10~15 \u79D2\u58F0\u97F3\u5B8C\u6210\u58F0\u7EB9\u91C7\u96C6\uFF08\u9700\u672C\u4EBA\u6388\u6743\u540C\u610F\uFF09\u3002") + (this.lanOnly() ? `<div class="gray">${lanLinkNote()}</div>` : ""),
          url: this.personUrl(person.id, { page: "voiceprint" }),
          btntxt: (0, import_i18n15.t)("\u53BB\u91C7\u96C6")
        }).catch((e) => ({ ok: false, error: e?.message }));
        if (r.ok) sent += 1;
        else failed.push({ personId: person.id, error: r.error || (0, import_i18n15.t)("\u53D1\u9001\u5931\u8D25") });
      }
      return { sent, failed };
    },
    // ── 手机页 ──
    "mobile.start": async (c, p) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u5F00\u542F\u624B\u673A\u9875\u670D\u52A1"));
      await this.startMobile(Number(p.port) > 0 ? Number(p.port) : void 0);
      this.store.update((st) => {
        st.mobileOn = true;
      });
      return this.mobileStatus();
    },
    "mobile.stop": async (c) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u5173\u95ED\u624B\u673A\u9875\u670D\u52A1"));
      this.store.update((st) => {
        st.mobileOn = false;
      });
      const m = this.mobile;
      this.mobile = null;
      if (m) await m.stop().catch(() => {
      });
      this.emit({ type: "mobile", running: false });
      return this.mobileStatus();
    },
    "mobile.status": () => this.mobileStatus(),
    "mobile.link": (c, p) => {
      const me = this.me(c);
      const personId = str2(p.personId) || me.id;
      if (personId !== me.id && !this.isAdmin(me.id)) throw new Error((0, import_i18n15.t)("\u53EA\u80FD\u67E5\u770B\u672C\u4EBA\u7684\u4E13\u5C5E\u94FE\u63A5"));
      requireActivePerson(this.s().org, personId, (0, import_i18n15.t)("\u4EBA\u5458"));
      if (!this.linkBase()) throw new Error((0, import_i18n15.t)("\u8BF7\u5148\u5F00\u542F\u624B\u673A\u9875\u670D\u52A1\uFF08\u6216\u5728\u8BBE\u7F6E\u91CC\u586B\u5199\u5361\u7247\u5730\u5740\uFF09"));
      return { url: this.personUrl(personId, void 0, p.reset === true) };
    },
    // ── 演示数据 ──
    "demo.load": (c) => {
      if (this.hasActiveAdmin()) this.requireAdmin(c, (0, import_i18n15.t)("\u8F7D\u5165\u6F14\u793A\u6570\u636E"));
      for (const j of this.jobs.values()) j.abort();
      this.loadDemo(c.now, c.actorId);
      this.changed("all");
      return { ok: true };
    },
    "demo.clear": (c) => {
      this.requireAdmin(c, (0, import_i18n15.t)("\u6E05\u7A7A\u6F14\u793A\u6570\u636E"));
      for (const j of this.jobs.values()) j.abort();
      const ids = this.s().meetings.map((m) => m.id);
      this.store.update((st) => {
        st.projects = [];
        st.meetings = [];
        st.tasks = [];
        st.notices = [];
        st.demoLoaded = false;
      });
      for (const id of ids) this.store.removeMeetingFiles(id);
      this.changed("all");
      return { ok: true };
    },
    /** 写出演示用文字记录；给了 meetingId 就直接上传到这场会议（不靠音频走通闭环） */
    "demo.transcript": async (c, p) => {
      this.me(c);
      const path = (0, import_node_path3.join)(this.store.demoDir(), DEMO_TRANSCRIPT_NAME);
      (0, import_node_fs4.writeFileSync)(path, DEMO_TRANSCRIPT, "utf-8");
      if (!p.meetingId) return { path };
      const meeting = await this.upload(c, String(p.meetingId), [path]);
      return { path, meeting };
    }
  };
  // ─── 动作实现 ───────────────────────────────────────────────────────
  /** 会议搜索匹配的文字：标题、项目名、主持人和参会人姓名 */
  meetingSearchText(m, s) {
    const names = [m.hostId, ...m.attendeeIds].map((id) => s.org.people.find((x) => x.id === id)?.name || "");
    return [m.title, s.projects.find((x) => x.id === m.projectId)?.name || "", ...names].join("\n").toLowerCase();
  }
  /** 在线语音识别接口的完整配置（Key 解密，只在主进程里用）；没配齐为 null */
  cloudAsrConfig() {
    const c = this.s().settings.ai.cloudAsr;
    const sealed = this.store.readCloudAsrKey();
    if (!c || !sealed) return null;
    let apiKey = "";
    try {
      apiKey = this.ext.seal.unseal(sealed) || "";
    } catch {
      apiKey = "";
    }
    return apiKey ? { provider: c.provider, baseUrl: c.baseUrl, model: c.model, apiKey } : null;
  }
  /** 给界面看的转写设置（不含 Key 原文） */
  asrSettingsView() {
    const a = this.s().settings.ai;
    return {
      mode: a.asr,
      localModel: a.localAsrModel ?? "auto",
      cloud: a.cloudAsr ? { ...a.cloudAsr, hasKey: !!this.store.readCloudAsrKey() } : null,
      presets: CLOUD_ASR_PRESETS
    };
  }
  mobileStatus() {
    const publicBase = this.s().settings.wecom.cardBaseUrl || void 0;
    if (!this.mobile) return { running: false, ...publicBase ? { publicBase } : {} };
    return { running: true, url: this.mobile.url, lanOnly: this.lanOnly(), ...publicBase ? { publicBase } : {} };
  }
  mobileStarting = null;
  /** 开手机页服务（已开 / 正在开就复用）；不查权限，调用方负责 */
  startMobile(port) {
    if (this.mobile) return Promise.resolve();
    if (this.mobileStarting) return this.mobileStarting;
    const run = (async () => {
      const handle = await this.ext.startMobileServer({
        ...port ? { port } : {},
        dataDir: this.store.root(),
        dispatch: (personId, action, payload) => this.dispatch(personId, action, payload, "mobile"),
        personByToken: (token) => this.personByToken(token),
        uploadDir: this.store.uploadsDir(),
        // 设置里填的外网 https 地址：内网 http 页面录不了音时引导到这里
        publicBase: () => this.s().settings.wecom.cardBaseUrl,
        log: (msg, meta) => this.logger?.info?.("meeting-mgmt", msg, meta)
      });
      if (this.stopped) {
        await handle.stop().catch(() => {
        });
        throw new Error((0, import_i18n15.t)("\u5DE5\u4F5C\u53F0\u5DF2\u505C\u6B62"));
      }
      this.mobile = handle;
      this.emit({ type: "mobile", running: true, url: handle.url });
    })();
    this.mobileStarting = run;
    return run.finally(() => {
      this.mobileStarting = null;
    });
  }
  /** 上次开着的手机页服务：应用重启后自动重新开（不然已发出的企微卡片按钮全打不开）。失败只记日志，界面上仍可手动开 */
  async resumeMobile() {
    if (this.stopped || this.mobile || this.mobileStarting || !this.store.read().mobileOn) return;
    try {
      await this.startMobile();
      this.logger?.info?.("meeting-mgmt", "mobile server resumed", { url: this.mobileStatus().url });
    } catch (e) {
      this.logger?.warn?.("meeting-mgmt", "mobile server resume failed", { error: e?.message });
    }
  }
  /** 任务类动作的公共部分：项目未归档 → 改任务 → 刷新 */
  taskAction(c, id, fn) {
    const me = this.me(c);
    const t = this.store.update((st) => {
      const task = this.findTask(st, id);
      const pj = this.findProject(st, task.projectId);
      assertProjectNotArchived(pj);
      fn(task, me.id, pj);
      return task;
    });
    this.changed("task", t.id);
    this.changed("project", t.projectId);
    return this.taskView(t, c.now);
  }
  async upload(c, id, rawPaths) {
    const me = this.me(c);
    const s = this.s();
    const m = this.findMeeting(s, id);
    const pj = this.findProject(s, m.projectId);
    assertProjectActive(pj);
    assertHost(m, me.id, (0, import_i18n15.t)("\u4E0A\u4F20\u4F1A\u8BAE\u6587\u4EF6"));
    if (m.status !== "pending_upload" && m.status !== "failed") {
      throw new Error((0, import_i18n15.t)("\u4F1A\u8BAE\u5F53\u524D\u72B6\u6001\u662F\u300C{p0}\u300D\uFF0C\u4E0D\u80FD{p1}", { p0: meetingStatusLabel(m.status), p1: (0, import_i18n15.t)("\u4E0A\u4F20\u4F1A\u8BAE\u6587\u4EF6") }));
    }
    if (this.jobs.has(id)) throw new Error((0, import_i18n15.t)("\u4F1A\u8BAE\u6B63\u5728\u5904\u7406\u4E2D"));
    const paths = strArr(rawPaths);
    if (!paths.length) throw new Error((0, import_i18n15.t)("\u8BF7\u9009\u62E9\u8981\u4E0A\u4F20\u7684\u4F1A\u8BAE\u6587\u4EF6"));
    if (paths.length > 20) throw new Error((0, import_i18n15.t)("\u4E00\u6B21\u6700\u591A\u4E0A\u4F20 20 \u4E2A\u6587\u4EF6"));
    const uploads = this.store.uploadsDir();
    for (const src of paths) {
      if (!(0, import_node_fs4.existsSync)(src) || !(0, import_node_fs4.statSync)(src).isFile()) throw new Error((0, import_i18n15.t)("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: (0, import_node_path3.basename)(src) }));
      if (c.origin === "mobile" && !MeetingMgmtStore.isInside(uploads, src)) throw new Error((0, import_i18n15.t)("\u6587\u4EF6\u4E0D\u5728\u4E0A\u4F20\u76EE\u5F55\u91CC"));
    }
    const dir = this.store.filesDir(id);
    const files = [];
    for (const src of paths) {
      const fileId = newId("mf");
      const name = (0, import_node_path3.basename)(src);
      const dest = (0, import_node_path3.join)(dir, `${fileId}${(0, import_node_path3.extname)(name).toLowerCase().replace(/[^.a-z0-9]/g, "")}`);
      if (c.origin === "mobile") {
        try {
          await import_node_fs4.promises.rename(src, dest);
        } catch {
          await import_node_fs4.promises.copyFile(src, dest);
          try {
            (0, import_node_fs4.unlinkSync)(src);
          } catch {
          }
        }
      } else {
        await import_node_fs4.promises.copyFile(src, dest);
      }
      files.push({ id: fileId, name, kind: fileKindOf(name), size: (0, import_node_fs4.statSync)(dest).size, path: dest, uploadedAt: this.nowFn() });
    }
    const oldFiles = m.files.map((f) => f.path);
    let out;
    try {
      out = this.store.update((st) => {
        const mm = this.findMeeting(st, id);
        assertProjectActive(this.findProject(st, mm.projectId));
        startProcessing(mm, me.id, this.nowFn(), { files });
        return mm;
      });
    } catch (e) {
      for (const f of files) {
        try {
          (0, import_node_fs4.unlinkSync)(f.path);
        } catch {
        }
      }
      throw e;
    }
    for (const f of oldFiles) if (f && this.store.isInsideRoot(f) && !files.some((x) => x.path === f)) {
      try {
        (0, import_node_fs4.unlinkSync)(f);
      } catch {
      }
    }
    this.changed("meeting", id);
    this.startPipeline(id);
    return this.forOrigin(out, c.origin);
  }
  /** 异步跑流水线；进度经 process 事件推，阶段变化 / 日志落盘 */
  startPipeline(meetingId) {
    const ctrl = new AbortController();
    this.jobs.set(meetingId, ctrl);
    const job = (async () => {
      const s = this.s();
      const m = this.findMeeting(s, meetingId);
      const attendees = s.org.people.filter((x) => m.attendeeIds.includes(x.id));
      const voiceprints = s.voiceprints.filter((v) => m.attendeeIds.includes(v.personId));
      let lastStage = m.process?.stage;
      const onStage = (stage, progress, text) => {
        if (ctrl.signal.aborted) return;
        const pct2 = Math.max(0, Math.min(100, Math.round(Number(progress) || 0)));
        this.emit({ type: "process", meetingId, stage, progress: pct2, ...text ? { text } : {} });
        if (stage === lastStage && !text) return;
        lastStage = stage;
        try {
          this.store.update((st) => {
            const mm = st.meetings.find((x) => x.id === meetingId);
            if (!mm || mm.status !== "processing" || !mm.process) return;
            mm.process.stage = stage;
            mm.process.progress = pct2;
            if (text) mm.process.log = [...mm.process.log, { at: this.nowFn(), text: String(text).slice(0, 500) }].slice(-200);
          });
        } catch {
        }
      };
      try {
        const r = await this.ext.runMeetingPipeline({
          meetingId,
          workDir: this.store.filesDir(meetingId),
          files: m.files,
          attendees,
          voiceprints,
          threshold: s.settings.ai.voiceprintThreshold,
          asr: s.settings.ai.asr,
          asrModel: s.settings.ai.localAsrModel ?? "auto",
          ...s.settings.ai.asr === "cloud" ? { cloudAsr: this.cloudAsrConfig() ?? void 0 } : {},
          organizePrompt: s.settings.ai.organizePrompt,
          llm: this.llm,
          signal: ctrl.signal,
          onStage
        });
        if (ctrl.signal.aborted) return;
        const now = this.nowFn();
        const out = this.store.update((st) => {
          const mm = this.findMeeting(st, meetingId);
          const pj = this.findProject(st, mm.projectId);
          const res = applyPipelineResult(mm, r, now);
          ensureMembers(pj, mm.attendeeIds);
          return { m: mm, pending: res.pending, projectName: pj.name };
        });
        this.emit({ type: "process", meetingId, stage: "done", progress: 100 });
        this.afterSpeakersSettled(out.m, out.pending, out.projectName, now);
      } catch (e) {
        if (ctrl.signal.aborted) return;
        const msg = e?.message || (0, import_i18n15.t)("\u5904\u7406\u5931\u8D25");
        this.warn("pipeline failed", { meetingId, error: msg });
        try {
          this.store.update((st) => {
            const mm = st.meetings.find((x) => x.id === meetingId);
            if (mm) failProcessing(mm, msg, this.nowFn());
          });
        } catch {
        }
      } finally {
        if (this.jobs.get(meetingId) === ctrl) this.jobs.delete(meetingId);
        this.changed("meeting", meetingId);
      }
    })();
    this.track(job);
  }
  /** 发言人识别 / 指认之后：通知新进入未确认的人；没有发言人要确认就直接通知主持人终审 */
  afterSpeakersSettled(m, pending, projectName, now) {
    if (m.status === "pending_confirm" && pending.length) {
      this.notify(pending.map((to) => ({
        to,
        type: "speech_confirm",
        title: (0, import_i18n15.t)("\u53D1\u8A00\u5F85\u786E\u8BA4\uFF1A{p0}", { p0: m.title }),
        summary: (0, import_i18n15.t)("\u8BF7\u6838\u5BF9\u5E76\u786E\u8BA4\u4F60\u5728\u4F1A\u4E0A\u7684\u53D1\u8A00\uFF08{p0}\uFF09", { p0: projectName }),
        link: { kind: "meeting", id: m.id }
      })), now);
    } else if (m.status === "pending_review") {
      this.notifyReview(m, projectName, now);
    }
  }
  notifyReview(m, projectName, now) {
    this.notify([{
      to: m.hostId,
      type: "minutes_review",
      title: (0, import_i18n15.t)("\u7EAA\u8981\u5F85\u7EC8\u5BA1\uFF1A{p0}", { p0: m.title }),
      summary: (0, import_i18n15.t)("\u53D1\u8A00\u4EBA\u5DF2\u5168\u90E8\u786E\u8BA4\uFF0C\u8BF7\u7EC8\u5BA1\uFF08{p0}\uFF09", { p0: projectName }),
      link: { kind: "meeting", id: m.id }
    }], now);
  }
  /** 生成项目总结（结项通过 / 重新生成）；生成好通知项目负责人审核 */
  async runSummary(projectId, rethrow = false) {
    if (this.summaryJobs.has(projectId)) {
      if (rethrow) throw new Error((0, import_i18n15.t)("\u603B\u7ED3\u62A5\u544A\u6B63\u5728\u751F\u6210\uFF0C\u8BF7\u7A0D\u5019"));
      return null;
    }
    this.summaryJobs.add(projectId);
    this.changed("project", projectId);
    try {
      const s = this.s();
      const project = this.findProject(s, projectId);
      const report = await this.ext.generateProjectSummary({
        project,
        meetings: s.meetings.filter((m) => m.projectId === projectId),
        tasks: s.tasks.filter((t) => t.projectId === projectId),
        org: s.org,
        prompt: s.settings.ai.summaryPrompt,
        llm: this.llm
      });
      const pj = this.store.update((st) => {
        const x = this.findProject(st, projectId);
        if (x.status !== "closing") throw new Error((0, import_i18n15.t)("\u9879\u76EE\u72B6\u6001\u5DF2\u53D8\u5316"));
        x.summary = { ...report, kind: "summary", id: report.id || newId("rp"), generatedAt: report.generatedAt || this.nowFn() };
        return x;
      });
      this.notify([{
        to: pj.ownerId,
        type: "summary_review",
        title: (0, import_i18n15.t)("\u603B\u7ED3\u62A5\u544A\u5F85\u5BA1\u6838\uFF1A{p0}", { p0: pj.name }),
        summary: (0, import_i18n15.t)("AI \u5DF2\u751F\u6210\u9879\u76EE\u603B\u7ED3\u62A5\u544A\uFF0C\u8BF7\u5BA1\u6838\u540E\u5F52\u6863"),
        link: { kind: "project_summary", id: pj.id }
      }], this.nowFn());
      return pj.summary;
    } catch (e) {
      this.warn("summary failed", { projectId, error: e?.message });
      if (rethrow) throw e;
      return null;
    } finally {
      this.summaryJobs.delete(projectId);
      this.changed("project", projectId);
    }
  }
  /** 生成一份进度汇总报告（手动 / 定时），推给项目负责人和各任务负责人 */
  /**
   * 本人确认发言后，从这场会议里本人的发言补一份声纹样本（只在本人开了「用确认过的会议补充声纹」时调用）。
   * 两道保护，防止认错的段把别人的声音混进来：① 和本人注册声纹余弦 ≥ LEARN_MIN_SELF_SIM（同一个人换了麦克风 / 房间
   * 通常还有 0.4 以上，明显是别人的通常更低）；② 不能比任何其他人的声纹更像。都在同一个模型空间里比（有 ERes2NetV2 优先用它）。
   */
  async learnVoiceprint(meetingId, personId) {
    const s = this.s();
    const m = s.meetings.find((x) => x.id === meetingId);
    const vp = s.voiceprints.find((x) => x.personId === personId);
    if (!m || !vp?.autoLearn || !m.files.some((f) => f.kind === "audio" || f.kind === "video")) return;
    const labels = new Set(m.speakers.filter((x) => x.personId === personId).map((x) => x.label));
    const ranges = m.segments.filter((x) => labels.has(x.speakerLabel)).map((x) => ({ start: x.start, end: x.end }));
    if (!ranges.length) return;
    let sample = null;
    try {
      sample = await this.ext.meetingVoiceSample(this.store.filesDir(meetingId), ranges);
    } catch (e) {
      this.warn("voiceprint learn failed", { error: e?.message });
      return;
    }
    if (!sample) return;
    const space = sample.vector2 && vp.vector2?.length ? "vector2" : sample.vector && vp.vector?.length ? "vector" : null;
    if (!space) return;
    const mine = sample[space];
    const self = cosineSim(mine, vp[space]);
    const others = this.s().voiceprints.filter((x) => x.personId !== personId && x[space]?.length).map((x) => cosineSim(mine, x[space]));
    if (self < LEARN_MIN_SELF_SIM || others.some((o) => o >= self)) {
      this.logger?.info?.("meeting-mgmt", "voiceprint sample skipped", { meetingId, personId, self: Math.round(self * 100) / 100, maxOther: others.length ? Math.round(Math.max(...others) * 100) / 100 : null });
      return;
    }
    const at = this.nowFn();
    this.store.update((st) => {
      const x = st.voiceprints.find((y) => y.personId === personId);
      if (!x?.autoLearn) return;
      const item = { meetingId, at, seconds: sample.seconds, ...sample.vector ? { vector: sample.vector } : {}, ...sample.vector2 ? { vector2: sample.vector2 } : {} };
      x.extra = [item, ...(x.extra || []).filter((e) => e.meetingId !== meetingId)].slice(0, MM_VOICEPRINT_MAX_EXTRA);
    });
    this.changed("org");
  }
  async runWeeklyReport(projectId, now, notifyIds, from) {
    const s = this.s();
    const project = this.findProject(s, projectId);
    const last = [...project.weeklyReports].sort((a, b) => b.generatedAt - a.generatedAt)[0];
    const periodFrom = from ?? (last ? last.periodTo ?? last.generatedAt : project.createdAt);
    const tasks = s.tasks.filter((t) => t.projectId === projectId);
    const report = await this.ext.generateWeeklyReport({
      project,
      meetings: s.meetings.filter((m) => m.projectId === projectId),
      tasks,
      org: s.org,
      from: periodFrom,
      to: now,
      llm: this.llm
    });
    const saved = { ...report, kind: "weekly", id: report.id || newId("rp"), generatedAt: report.generatedAt || now, periodFrom: report.periodFrom ?? periodFrom, periodTo: report.periodTo ?? now };
    this.store.update((st) => {
      const pj = this.findProject(st, projectId);
      assertProjectNotArchived(pj);
      pj.weeklyReports = [...pj.weeklyReports, saved].slice(-60);
    });
    const to = notifyIds?.length ? notifyIds : [project.ownerId, ...tasks.filter((t) => t.status !== "cancelled").map((t) => t.ownerId)];
    this.notify([...new Set(to)].map((id) => ({
      to: id,
      type: "progress_report",
      title: (0, import_i18n15.t)("\u8FDB\u5EA6\u6C47\u603B\u62A5\u544A\uFF1A{p0}", { p0: project.name }),
      summary: cardSummary.report(saved.stats),
      link: { kind: "report", id: projectId, anchor: saved.id }
    })), this.nowFn());
    this.changed("project", projectId);
    return saved;
  }
  // ─── 定时提醒 ───────────────────────────────────────────────────────
  /** 定时器每轮：算该发的提醒 → 记提醒时间（不改状态）→ 发通知；周报逐个生成 */
  async tick() {
    if (this.stopped) return;
    this.ensureInit();
    await this.resumeMobile();
    const now = this.nowFn();
    const s = this.s();
    const actions = this.ext.dueReminders({ meetings: s.meetings, tasks: s.tasks, projects: s.projects, settings: s.settings }, now);
    if (!actions.length) return;
    const drafts = [];
    const weekly = [];
    this.store.update((st) => {
      for (const a of actions) {
        if (a.kind === "weekly_report") {
          weekly.push(a);
          continue;
        }
        if (a.kind === "speech_remind") {
          const m = st.meetings.find((x) => x.id === a.meetingId);
          const conf = m?.confirmations.find((x) => x.personId === a.personId);
          if (!m || !conf || m.status !== "pending_confirm" || conf.status !== "pending") continue;
          conf.remindedAt = now;
          const hours = a.waitedHours ?? Math.floor((now - confirmStartAt(m, a.personId)) / HOUR_MS);
          drafts.push({
            to: a.personId,
            type: "speech_remind",
            title: (0, import_i18n15.t)("\u53D1\u8A00\u786E\u8BA4\u50AC\u529E\uFF1A{p0}", { p0: m.title }),
            summary: (0, import_i18n15.t)("\u4F1A\u8BAE\u7EAA\u8981\u8FD8\u5728\u7B49\u4F60\u786E\u8BA4\u53D1\u8A00\uFF0C\u5DF2\u7B49\u5F85 {n} \u5C0F\u65F6", { n: Math.max(1, hours) }),
            link: { kind: "meeting", id: m.id }
          });
          continue;
        }
        const t = st.tasks.find((x) => x.id === a.taskId);
        if (!t || isTaskClosed(t)) continue;
        const link = { kind: "task", id: t.id };
        if (a.kind === "task_progress_remind") {
          t.reminders.weeklyAt = now;
          for (const to of a.notify?.length ? a.notify : [t.assigneeId]) {
            drafts.push({ to, type: "task_progress_remind", title: (0, import_i18n15.t)("\u8BF7\u66F4\u65B0\u8FDB\u5EA6\uFF1A{p0}", { p0: t.title }), summary: (0, import_i18n15.t)("{p0} \xB7 \u5F53\u524D\u8FDB\u5EA6 {n}%", { p0: cardSummary.task(t), n: t.percent }), link });
          }
        } else if (a.kind === "task_due_remind") {
          t.reminders.dueAt = now;
          const left = a.daysLeft ?? Math.max(0, daysBetweenYmd(ymd(now), t.due));
          const summary = left <= 0 ? (0, import_i18n15.t)("\u4ECA\u5929\u5230\u671F\uFF08\u622A\u6B62 {p0}\uFF09", { p0: t.due }) : (0, import_i18n15.t)("\u8FD8\u5269 {n} \u5929\u5230\u671F\uFF08\u622A\u6B62 {p0}\uFF09", { n: left, p0: t.due });
          for (const to of a.notify?.length ? a.notify : [t.assigneeId]) drafts.push({ to, type: "task_due_remind", title: (0, import_i18n15.t)("\u5230\u671F\u63D0\u9192\uFF1A{p0}", { p0: t.title }), summary, link });
        } else if (a.kind === "task_overdue") {
          t.reminders.overdueAt = now;
          const days = a.overdueDays ?? taskOverdueDays(t, now);
          const summary = (0, import_i18n15.t)("\u622A\u6B62 {p0}\uFF0C\u5DF2\u903E\u671F {n} \u5929", { p0: t.due, n: Math.max(1, days) });
          for (const to of a.notify?.length ? a.notify : [.../* @__PURE__ */ new Set([t.assigneeId, ...taskOwners(t)])]) drafts.push({ to, type: "task_overdue", title: (0, import_i18n15.t)("\u903E\u671F\u63D0\u9192\uFF1A{p0}", { p0: t.title }), summary, link });
        }
      }
    });
    this.notify(drafts, now);
    if (drafts.length) {
      this.changed("task");
      this.changed("meeting");
    }
    for (const a of weekly) {
      if (this.stopped) return;
      try {
        await this.track(this.runWeeklyReport(a.projectId, a.periodTo ?? now, a.notify, a.periodFrom));
      } catch (e) {
        this.warn("weekly report failed", { projectId: a.projectId, error: e?.message });
      }
    }
  }
  // ─── 给 ipc 层用 ────────────────────────────────────────────────────
  /** file.open：会议文件的本机路径（要能看到这场会议；路径必须在工作台数据目录里） */
  resolveMeetingFile(actorId, payload) {
    this.ensureInit();
    const p = payload && typeof payload === "object" ? payload : {};
    const c = { actorId, origin: "pc", now: this.nowFn() };
    const { m } = this.visibleMeeting(c, p.meetingId ?? p.id);
    const f = m.files.find((x) => x.id === p.fileId);
    if (!f || !f.path) throw new Error((0, import_i18n15.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
    if (!this.store.isInsideRoot(f.path) || !(0, import_node_fs4.existsSync)(f.path)) throw new Error((0, import_i18n15.t)("\u6587\u4EF6\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u79FB\u8D70"));
    return f.path;
  }
};
function stageText(stage) {
  switch (stage) {
    case "extract":
      return (0, import_i18n15.t)("\u63D0\u53D6\u97F3\u8F68");
    case "transcribe":
      return (0, import_i18n15.t)("\u8F6C\u5199\u4E2D");
    case "diarize":
      return (0, import_i18n15.t)("\u8BC6\u522B\u53D1\u8A00\u4EBA");
    case "parse":
      return (0, import_i18n15.t)("\u89E3\u6790\u6587\u5B57\u8BB0\u5F55");
    case "organize":
      return (0, import_i18n15.t)("\u6574\u7406\u4E2D");
    case "done":
      return (0, import_i18n15.t)("\u5904\u7406\u5B8C\u6210");
    default:
      return (0, import_i18n15.t)("\u5904\u7406\u4E2D");
  }
}
var clampNum = (v, min, max, cur) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return cur;
  return Math.min(max, Math.max(min, n));
};
function applySettingsPatch(st, patch) {
  const s = st.settings;
  const active = (id) => !!activePerson(st.org, id);
  if (patch.adminIds !== void 0) {
    const ids = strArr(patch.adminIds).filter(active);
    if (!ids.length) throw new Error((0, import_i18n15.t)("\u81F3\u5C11\u4FDD\u7559\u4E00\u4F4D\u7BA1\u7406\u5458"));
    s.adminIds = ids;
  }
  if (patch.projectCreatorIds !== void 0) s.projectCreatorIds = strArr(patch.projectCreatorIds).filter(active);
  if (patch.confirmTimeoutHours !== void 0) s.confirmTimeoutHours = Math.round(clampNum(patch.confirmTimeoutHours, 1, 720, s.confirmTimeoutHours));
  if (patch.dueRemindDays !== void 0) s.dueRemindDays = Math.round(clampNum(patch.dueRemindDays, 0, 30, s.dueRemindDays));
  if (patch.trackCycleDays !== void 0) s.trackCycleDays = Math.round(clampNum(patch.trackCycleDays, 1, 90, s.trackCycleDays));
  if (patch.reportCycleDays !== void 0) s.reportCycleDays = Math.round(clampNum(patch.reportCycleDays, 1, 90, s.reportCycleDays));
  if (patch.wecom && typeof patch.wecom === "object" && patch.wecom.cardBaseUrl !== void 0) {
    const url = str2(patch.wecom.cardBaseUrl, 500);
    if (url && !/^https?:\/\/[^\s]+$/i.test(url)) throw new Error((0, import_i18n15.t)("\u5361\u7247\u5730\u5740\u8BF7\u586B\u5199 http:// \u6216 https:// \u5F00\u5934\u7684\u7F51\u5740"));
    s.wecom = { ...s.wecom, cardBaseUrl: url || void 0 };
  }
  if (patch.ai && typeof patch.ai === "object") {
    const a = patch.ai;
    if (a.asr !== void 0) s.ai.asr = a.asr === "agent" ? "agent" : a.asr === "cloud" ? "cloud" : "local";
    if (a.localAsrModel !== void 0) s.ai.localAsrModel = ["firered", "sensevoice", "whisper"].includes(a.localAsrModel) ? a.localAsrModel : "auto";
    if (a.voiceprintThreshold !== void 0) s.ai.voiceprintThreshold = clampNum(a.voiceprintThreshold, 0, 1, s.ai.voiceprintThreshold);
    for (const k of ["planPrompt", "summaryPrompt", "organizePrompt"]) {
      if (a[k] !== void 0) {
        const v = String(a[k] ?? "").trim().slice(0, 8e3);
        if (v) s.ai[k] = v;
        else delete s.ai[k];
      }
    }
  }
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/services/meetingMgmt/llm.ts
var import_councilChatRouter = require("host:apps/desktop-shell/src/main/services/councilChatRouter.ts");
var import_llmReply = require("host:apps/desktop-shell/src/main/services/bidWriter/llmReply.ts");
var MM_LLM_DEFAULT_TIMEOUT_MS = 12e4;
var JSON_DIRECTIVE = "\n\nReturn ONLY one valid JSON object. No explanation, no Markdown code fences.";
async function e2eStub(prompt, json, timeoutMs, fetchImpl) {
  const url = process.env.TOTALCLAW_E2E === "1" ? String(process.env.TOTALCLAW_E2E_LLM_URL || "") : "";
  if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) return void 0;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ module: "meeting-mgmt", prompt, json }), signal: ctrl.signal });
    const data = await res.json();
    const text = String(data?.text ?? "").trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
function createMeetingLlm(deps, opts = {}) {
  const run = opts.run ?? ((d, p, o) => (0, import_councilChatRouter.runOneshotChat)(d, p, o));
  const fetchImpl = opts.fetchImpl ?? ((...a) => globalThis.fetch(...a));
  const tag = opts.logTag || "meeting-mgmt";
  return async (prompt, o = {}) => {
    const timeoutMs = Math.max(1e3, Number(o.timeoutMs) || MM_LLM_DEFAULT_TIMEOUT_MS);
    const text = o.json ? `${prompt}${JSON_DIRECTIVE}` : prompt;
    const stub = await e2eStub(text, !!o.json, timeoutMs, fetchImpl);
    if (stub !== void 0) return stub;
    let timer;
    const wall = new Promise((resolve3) => {
      timer = setTimeout(() => resolve3(null), timeoutMs * 4);
    });
    try {
      const reply = await Promise.race([run(deps, text, { timeoutMs, plainCompletion: true, temperature: 0 }), wall]);
      if (reply === null) {
        deps.logger?.warn?.(tag, "llm wall timeout", { timeoutMs });
        return null;
      }
      const out = String(reply ?? "").trim();
      if (!out || (0, import_llmReply.isChannelErrorReply)(out)) {
        if (out) deps.logger?.warn?.(tag, "llm channel error reply", { head: out.slice(0, 200) });
        return null;
      }
      return out;
    } catch (error) {
      deps.logger?.warn?.(tag, "llm unavailable", { error: error?.message });
      return null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };
}

// ../totalclaw-solutions/solutions/workbench-meeting-mgmt/src/main/ipc/meetingMgmt.ipc.ts
init_runtime();
var VOICE_EXTENSIONS = ["wav", "mp3", "m4a", "aac", "amr", "flac", "ogg", "opus", "webm", "caf", "aiff", "wma"];
function registerMeetingMgmtHandlers(deps) {
  const logger = deps.logger;
  const win = () => deps.getMainWindow?.() ?? null;
  const emit = (ev) => {
    try {
      win()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_MM_EVENT, ev);
    } catch {
    }
  };
  configureMeetingPipeline({
    agentTranscribe: async (wavBase64) => {
      const [{ transcribeWavViaAgent }, { QiyeApiClient }] = await Promise.all([Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/localAsr.ts"), 1)), Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/qiyeApiClient.ts"), 1))]);
      const proc = deps.qiyeApiProc;
      const client = proc && proc.getStatus() === "ready" ? new QiyeApiClient({ baseUrl: proc.getBaseUrl(), getBearerToken: () => proc.getBearerToken(), defaultTimeoutMs: 18e4 }) : null;
      return transcribeWavViaAgent(wavBase64, client);
    }
  });
  const service = new MeetingMgmtService({ llm: createMeetingLlm(deps), emit, logger });
  service.startBackground();
  const pick = async (opts) => {
    const w = win();
    const r = w ? await import_electron.dialog.showOpenDialog(w, opts) : await import_electron.dialog.showOpenDialog(opts);
    return r.canceled ? [] : r.filePaths;
  };
  const handlers = {
    "meeting.pickFiles": async (p) => {
      const paths = await pick({
        title: (0, import_i18n16.t)("\u9009\u62E9\u4F1A\u8BAE\u5F55\u97F3\u3001\u5F55\u5C4F\u6216\u6587\u5B57\u8BB0\u5F55"),
        properties: ["openFile", "multiSelections"],
        filters: [{ name: (0, import_i18n16.t)("\u4F1A\u8BAE\u6587\u4EF6"), extensions: MM_PICK_EXTENSIONS }, { name: (0, import_i18n16.t)("\u6240\u6709\u6587\u4EF6"), extensions: ["*"] }]
      });
      if (!paths.length) return null;
      return service.dispatchPc("meeting.upload", { id: p?.id, paths });
    },
    "voiceprint.import": async (p) => {
      const paths = await pick({
        title: (0, import_i18n16.t)("\u9009\u62E9\u4E00\u6BB5 10~15 \u79D2\u7684\u672C\u4EBA\u5F55\u97F3"),
        properties: ["openFile"],
        filters: [{ name: (0, import_i18n16.t)("\u5F55\u97F3"), extensions: VOICE_EXTENSIONS }, { name: (0, import_i18n16.t)("\u6240\u6709\u6587\u4EF6"), extensions: ["*"] }]
      });
      if (!paths.length) return null;
      return service.dispatchPc("voiceprint.enroll", { personId: p?.personId, path: paths[0], consent: p?.consent === true, ...typeof p?.autoLearn === "boolean" ? { autoLearn: p.autoLearn } : {} });
    },
    "org.importFile": async () => {
      const paths = await pick({
        title: (0, import_i18n16.t)("\u9009\u62E9\u901A\u8BAF\u5F55\u8868\u683C\uFF08\u4F01\u5FAE\u540E\u53F0\u300C\u901A\u8BAF\u5F55 \u2192 \u5BFC\u51FA\u6210\u5458\u300D\u5BFC\u51FA\u7684\u6587\u4EF6\uFF09"),
        properties: ["openFile"],
        filters: [{ name: (0, import_i18n16.t)("\u8868\u683C"), extensions: ["xlsx", "xls", "csv"] }, { name: (0, import_i18n16.t)("\u6240\u6709\u6587\u4EF6"), extensions: ["*"] }]
      });
      if (!paths.length) return null;
      return service.dispatchPc("org.import", { path: paths[0] });
    },
    "file.open": async (p) => {
      const path = service.resolveMeetingFile(service.pcActorId(), p);
      const err = await (0, import_openPathGuarded.openPathGuarded)(path);
      if (err) throw new Error((0, import_i18n16.t)("\u6253\u5F00\u6587\u4EF6\u5931\u8D25\uFF1A{p0}", { p0: err }));
      return true;
    }
  };
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_MM_INVOKE, async (_e, req) => {
    const action = String(req?.action || "");
    const payload = req?.payload ?? {};
    try {
      const h = handlers[action];
      return h ? await h(payload) : await service.dispatchPc(action, payload);
    } catch (error) {
      logger?.warn?.("meeting-mgmt", `${action} failed`, { error: error?.message });
      throw new Error((0, import_userFacingError.userFacingError)(error));
    }
  });
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    void service.stop();
  };
  const offQuit = (0, import_quitRegistry.onAppWillQuit)("meeting-mgmt", stop, { once: true });
  return () => {
    offQuit();
    stop();
  };
}

// apps/desktop-shell/node_modules/.cache/solutions-build/workbench-meeting-mgmt/entry.main.ts
var hostApi = 2;
var registerFunction = "registerMeetingMgmtHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerMeetingMgmtHandlers(ctx.host.deps);
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
