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

// node_modules/.cache/solutions-build/workbench-digital-human/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-digital-human/src/main/ipc/digitalHuman.ipc.ts
var import_electron = require("electron");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n = require("npm:@totalclaw/i18n");
var import_shared = require("host:apps/desktop-shell/src/main/ipc/shared.ts");
function registerDigitalHumanHandlers(deps) {
  const { logger } = deps;
  const proc = () => deps.digitalHumanProc ?? null;
  async function run(label, fn) {
    const p = proc();
    if (!p) return { ok: false, message: (0, import_i18n.t)("\u6570\u5B57\u4EBA\u670D\u52A1\u672A\u5C31\u7EEA") };
    try {
      const res = await fn(p);
      return typeof res?.ok === "boolean" ? res : { ok: true, ...res ?? {} };
    } catch (error) {
      const message = error?.message || String(error);
      logger.warn?.("digital-human", `${label} \u5931\u8D25`, { detail: message });
      return { ok: false, message };
    }
  }
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_STATUS, async () => run("status", (p) => p.getStatus()));
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_CONFIGURE, async (_e, payload) => {
    const res = await run("configure", (p) => p.configure(payload || {}));
    if (res.ok) {
      logger.info?.("digital-human", "\u6570\u5B57\u4EBA\u914D\u7F6E\u5DF2\u66F4\u65B0", {
        enabled: payload?.enabled,
        provider: payload?.provider,
        providers: Object.keys(payload?.providers || {})
      });
    }
    return res;
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_USAGE, async () => run("usage", (p) => p.getUsage()));
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_SYNTHESIZE, async (_e, payload) => {
    (0, import_shared.validatePayload)(payload, "DIGITAL_HUMAN_SYNTHESIZE", { script: "string" });
    return run("synthesize", (p) => p.synthesize(payload));
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_QUERY, async (_e, payload) => {
    (0, import_shared.validatePayload)(payload, "DIGITAL_HUMAN_QUERY", { taskId: "string" });
    return run("query", (p) => p.queryTask(payload.taskId, payload.provider));
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_LIVE_START, async (_e, payload) => {
    const res = await run("live/start", (p) => p.liveStart(payload || {}));
    if (res.ok) logger.info?.("digital-human", "\u5B9E\u65F6\u4F1A\u8BDD\u5DF2\u8D77", { sessionId: res.sessionId, scene: payload?.scene });
    return res;
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_LIVE_ENQUEUE, async (_e, payload) => {
    (0, import_shared.validatePayload)(payload, "DIGITAL_HUMAN_LIVE_ENQUEUE", { sessionId: "string" });
    return run("live/enqueue", (p) => p.liveEnqueue(payload.sessionId, String(payload.text ?? ""), payload.done));
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_LIVE_INTERACTION, async (_e, payload) => {
    (0, import_shared.validatePayload)(payload, "DIGITAL_HUMAN_LIVE_INTERACTION", { sessionId: "string", text: "string" });
    return run("live/interaction", (p) => p.liveInteraction(payload.sessionId, payload.text));
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_LIVE_TAKEOVER, async (_e, payload) => {
    (0, import_shared.validatePayload)(payload, "DIGITAL_HUMAN_LIVE_TAKEOVER", { sessionId: "string", text: "string" });
    const res = await run("live/takeover", (p) => p.liveTakeover(payload.sessionId, payload.text));
    if (res.ok) logger.info?.("digital-human", "\u771F\u4EBA\u63A5\u7BA1", { sessionId: payload.sessionId });
    return res;
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_LIVE_PAUSE, async (_e, payload) => {
    (0, import_shared.validatePayload)(payload, "DIGITAL_HUMAN_LIVE_PAUSE", { sessionId: "string" });
    return run("live/pause", (p) => p.livePause(payload.sessionId, payload.resume));
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_LIVE_STATUS, async (_e, payload) => {
    return run("live/status", (p) => p.liveStatus(payload?.sessionId));
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_LIVE_STOP, async (_e, payload) => {
    (0, import_shared.validatePayload)(payload, "DIGITAL_HUMAN_LIVE_STOP", { sessionId: "string" });
    const res = await run("live/stop", (p) => p.stopSession(payload.sessionId, !!payload.emergency));
    logger.info?.("digital-human", "\u5B9E\u65F6\u4F1A\u8BDD\u5DF2\u505C", { sessionId: payload.sessionId, emergency: !!payload.emergency, ok: res.ok });
    return res;
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_SESSION_START, async (_e, payload) => run("session/start", (p) => p.sessionStart(payload || {})));
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_SESSION_SPEAK, async (_e, payload) => {
    (0, import_shared.validatePayload)(payload, "DIGITAL_HUMAN_SESSION_SPEAK", { sessionId: "string", text: "string" });
    return run("session/speak", (p) => p.sessionSpeak(payload.sessionId, payload.text, payload.stream));
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_SESSION_INTERRUPT, async (_e, payload) => {
    (0, import_shared.validatePayload)(payload, "DIGITAL_HUMAN_SESSION_INTERRUPT", { sessionId: "string" });
    return run("session/interrupt", (p) => p.sessionInterrupt(payload.sessionId));
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_SESSION_STOP, async (_e, payload) => {
    (0, import_shared.validatePayload)(payload, "DIGITAL_HUMAN_SESSION_STOP", { sessionId: "string" });
    return run("session/stop", (p) => p.stopSession(payload.sessionId, false));
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_SESSION_LIST, async () => run("session/list", (p) => p.listRemote()));
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_TRACKED, async () => {
    const p = proc();
    return { ok: true, sessions: p?.listTracked() ?? [] };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_STOP_ALL, async (_e, payload) => {
    const p = proc();
    if (!p) return { ok: true, stopped: 0, failed: 0 };
    const r = await p.stopAll(!!payload?.emergency);
    logger.info?.("digital-human", "\u4E00\u952E\u5168\u505C", r);
    return { ok: true, ...r };
  });
  proc()?.on("sessions", (sessions) => {
    try {
      deps.getMainWindow()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_EVENT, { type: "sessions", sessions });
    } catch {
    }
  });
  proc()?.on("status", (snapshot) => {
    try {
      deps.getMainWindow()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.DIGITAL_HUMAN_EVENT, { type: "status", snapshot });
    } catch {
    }
  });
}

// node_modules/.cache/solutions-build/workbench-digital-human/entry.main.ts
var hostApi = 2;
var registerFunction = "registerDigitalHumanHandlers";
function activate(ctx) {
  registerDigitalHumanHandlers(ctx.host.deps);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  hostApi,
  registerFunction
});
