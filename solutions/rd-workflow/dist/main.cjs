var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-qiye-app/apps/desktop-shell/node_modules/.cache/solutions-build/rd-workflow/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/rd-workflow/src/main/ipc/rdWorkflow.ipc.ts
var import_electron = require("electron");
var import_path = require("path");
var import_fs = require("fs");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n = require("npm:@totalclaw/i18n");
function registerRdWorkflowHandlers(_deps) {
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_RD_PICK_OUTPUT_DIR, async () => {
    const picked = await import_electron.dialog.showOpenDialog({
      title: (0, import_i18n.t)("\u9009\u62E9\u4EA7\u51FA\u5730\u5740\uFF08\u4EE3\u7801\u843D\u5730\u76EE\u5F55\uFF09"),
      properties: ["openDirectory", "createDirectory"]
    });
    if (picked.canceled || !picked.filePaths.length) return { ok: false, canceled: true };
    const dir = picked.filePaths[0];
    try {
      (0, import_fs.mkdirSync)(dir, { recursive: true });
    } catch (e) {
      return { ok: false, message: e?.message || (0, import_i18n.t)("\u76EE\u5F55\u4E0D\u53EF\u5199") };
    }
    return { ok: true, dir };
  });
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_RD_PARSE_DOC, async () => {
    const picked = await import_electron.dialog.showOpenDialog({
      title: (0, import_i18n.t)("\u9009\u62E9\u9700\u6C42\u6587\u6863"),
      properties: ["openFile", "multiSelections"],
      filters: [
        { name: (0, import_i18n.t)("\u53EF\u89E3\u6790\u6587\u6863"), extensions: ["pdf", "docx", "doc", "pptx", "xlsx", "xls", "csv", "txt", "md", "markdown", "log", "json", "html", "htm"] },
        { name: (0, import_i18n.t)("\u6240\u6709\u6587\u4EF6"), extensions: ["*"] }
      ]
    });
    if (picked.canceled || !picked.filePaths.length) return { ok: false, canceled: true };
    const { extractDocument } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/documentExtractor.ts"), 1));
    const files = [];
    for (const fp of picked.filePaths) {
      const name = (0, import_path.basename)(fp);
      if (!(0, import_fs.existsSync)(fp)) {
        files.push({ name, text: "", reason: (0, import_i18n.t)("\u6587\u4EF6\u4E0D\u5B58\u5728") });
        continue;
      }
      try {
        const doc = await extractDocument(fp, name);
        const text = (doc.text || "").trim();
        files.push({ name, text, reason: text ? void 0 : doc.warning || (0, import_i18n.t)("\u672A\u89E3\u6790\u5230\u6587\u672C\uFF08\u53EF\u80FD\u662F\u626B\u63CF\u4EF6/\u52A0\u5BC6/\u4E0D\u652F\u6301\u7684\u683C\u5F0F\uFF09") });
      } catch (e) {
        files.push({ name, text: "", reason: e?.message || String(e) });
      }
    }
    const combinedText = files.filter((f) => f.text).map((f) => `# ${f.name}
${f.text}`).join("\n\n");
    return { ok: true, files, combinedText };
  });
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-qiye-app/apps/desktop-shell/node_modules/.cache/solutions-build/rd-workflow/entry.main.ts
var hostApi = 2;
var registerFunction = "registerRdWorkflowHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerRdWorkflowHandlers(ctx.host.deps);
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
