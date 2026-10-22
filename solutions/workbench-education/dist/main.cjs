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

// node_modules/.cache/solutions-build/workbench-education/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-education/src/main/ipc/educationWorkbench.ipc.ts
var import_electron = require("electron");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_workbenchApi = require("host:apps/desktop-shell/src/main/ipc/workbenchApi.ts");
var import_shared = require("host:apps/desktop-shell/src/main/ipc/shared.ts");
var import_i18n = require("npm:@totalclaw/i18n");
function registerEducationWorkbenchHandlers(deps) {
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDUCATION_STATUS, async () => {
    const client = (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n.t)("\u6559\u80B2\u5DE5\u4F5C\u53F0"));
    const probes = await Promise.allSettled([
      client.get("/v1/workflows/dynamic/list"),
      client.get("/v1/digital_human/status"),
      client.get("/v1/data_masking/status")
    ]);
    const [workflow, digitalHuman, masking] = probes.map(
      (item) => item.status === "fulfilled" ? { available: true, data: item.value } : { available: false, reason: String(item.reason) }
    );
    return {
      ok: true,
      capabilities: {
        conversation: { available: true },
        speech: { available: true },
        workflow,
        digitalHuman,
        masking,
        toneScoring: {
          available: false,
          reason: (0, import_i18n.t)("\u6280\u80FD\u52A8\u4F5C\u81EA\u52A8\u8BC4\u5206\u9700\u8981\u63A5\u5165\u4E13\u4E1A\u5B9E\u8BAD\u8BBE\u5907\u6216\u6559\u5B66\u5E73\u53F0")
        },
        strokeOrder: {
          available: false,
          reason: (0, import_i18n.t)("\u6210\u7EE9\u56DE\u5199\u9700\u8981\u5B66\u6821\u6559\u52A1\u7CFB\u7EDF\u6388\u6743\u5E76\u7ECF\u8FC7\u6559\u5E08\u786E\u8BA4")
        }
      }
    };
  });
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_EDUCATION_PREPARE_LESSON,
    async (_event, payload) => {
      const topic = (0, import_workbenchApi.requireText)(payload?.topic, (0, import_i18n.t)("\u8BFE\u7A0B\u4E3B\u9898"));
      const grade = (0, import_workbenchApi.requireText)(payload?.grade, (0, import_i18n.t)("\u5B66\u6BB5"));
      const learnerLevel = (0, import_workbenchApi.requireText)(payload?.learnerLevel, (0, import_i18n.t)("\u5B66\u4E60\u6C34\u5E73"));
      const durationMinutes = Math.max(15, Math.min(180, Number(payload?.durationMinutes) || 45));
      const outputLanguage = payload?.outputLanguage || "zh-CN";
      const languageInstruction = outputLanguage === "ar" ? (0, import_i18n.t)("\u5168\u90E8\u5185\u5BB9\u4F7F\u7528\u963F\u62C9\u4F2F\u8BED\uFF0C\u9002\u5408 RTL \u6392\u7248\uFF1B\u5FC5\u8981\u7684\u4E2D\u6587\u6559\u5B66\u672F\u8BED\u540E\u9644\u963F\u62C9\u4F2F\u8BED\u89E3\u91CA") : outputLanguage === "en-US" ? (0, import_i18n.t)("\u5168\u90E8\u5185\u5BB9\u4F7F\u7528\u82F1\u6587") : (0, import_i18n.t)("\u5168\u90E8\u5185\u5BB9\u4F7F\u7528\u4E2D\u6587\uFF1B\u9762\u5411\u963F\u62C9\u4F2F\u8BED\u5B66\u751F\u7684\u5173\u952E\u672F\u8BED\u540C\u65F6\u9644\u963F\u62C9\u4F2F\u8BED\u89E3\u91CA");
      const client = (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n.t)("\u6559\u80B2\u5907\u8BFE"));
      const ast = {
        type: "program",
        body: [
          { type: "phase", name: (0, import_i18n.t)("\u5907\u8BFE\u5E76\u884C\u751F\u6210") },
          {
            type: "parallel",
            bind: "parts",
            branches: [
              { type: "agent", goal: (0, import_i18n.t)("\u4F60\u662F\u8BFE\u7A0B\u8BBE\u8BA1 Agent\u3002\u4E3A{grade}{learnerLevel}\u5B66\u751F\u8BBE\u8BA1\u201C{topic}\u201D\u7684\u8BFE\u7A0B\u76EE\u6807\u3001\u5C97\u4F4D\u80FD\u529B\u3001\u91CD\u96BE\u70B9\u4E0E{durationMinutes}\u5206\u949F\u65F6\u95F4\u5206\u914D\u3002\u8F93\u51FA\u8981\u6C42\uFF1A{languageInstruction}", { grade, learnerLevel, topic, durationMinutes, languageInstruction }) },
              { type: "agent", goal: (0, import_i18n.t)("\u4F60\u662F\u5B9E\u8BAD\u4EFB\u52A1 Agent\u3002\u56F4\u7ED5\u201C{topic}\u201D\u8BBE\u8BA1\u771F\u5B9E\u5C97\u4F4D\u80CC\u666F\u3001\u5B66\u751F\u89D2\u8272\u3001\u64CD\u4F5C\u6B65\u9AA4\u3001\u63D0\u4EA4\u7269\u548C\u6559\u5E08\u89C2\u5BDF\u70B9\u3002\u8F93\u51FA\u8981\u6C42\uFF1A{languageInstruction}", { topic, languageInstruction }) },
              { type: "agent", goal: (0, import_i18n.t)("\u4F60\u662F\u884C\u4E1A\u6848\u4F8B Agent\u3002\u4E3A\u201C{topic}\u201D\u51C6\u5907\u4E00\u4E2A\u53EF\u8FFD\u6EAF\u6848\u4F8B\u3001\u6570\u636E\u6750\u6599\u3001\u5DE5\u5177\u6E05\u5355\u4E0E\u5B89\u5168\u6CE8\u610F\u4E8B\u9879\uFF0C\u4E0D\u865A\u6784\u5916\u90E8\u7CFB\u7EDF\u5DF2\u6267\u884C\u3002\u8F93\u51FA\u8981\u6C42\uFF1A{languageInstruction}", { topic, languageInstruction }) },
              { type: "agent", goal: (0, import_i18n.t)("\u4F60\u662F\u8BC4\u4EF7\u8BBE\u8BA1 Agent\u3002\u4E3A\u201C{topic}\u201D\u751F\u6210\u5F62\u6210\u6027\u8BC4\u4EF7\u91CF\u89C4\uFF0C\u8986\u76D6\u8FC7\u7A0B\u3001\u7ED3\u679C\u3001\u534F\u4F5C\u3001\u89C4\u8303\u4E0E\u53CD\u601D\uFF0C\u5E76\u7ED9\u51FA\u53EF\u89C2\u5BDF\u8BC1\u636E\u3002\u8F93\u51FA\u8981\u6C42\uFF1A{languageInstruction}", { topic, languageInstruction }) },
              { type: "agent", goal: (0, import_i18n.t)("\u4F60\u662F\u5B66\u60C5\u652F\u6301 Agent\u3002\u4E3A\u4E0D\u540C\u57FA\u7840\u5B66\u751F\u8BBE\u8BA1\u5206\u5C42\u63D0\u793A\u3001\u5E38\u89C1\u9519\u8BEF\u3001\u8865\u6551\u4EFB\u52A1\u548C\u62D3\u5C55\u6311\u6218\uFF0C\u4E0D\u66FF\u5B66\u751F\u5B8C\u6210\u4F5C\u4E1A\u3002\u8F93\u51FA\u8981\u6C42\uFF1A{languageInstruction}", { languageInstruction }) },
              { type: "agent", goal: (0, import_i18n.t)("\u4F60\u662F\u6559\u5B66\u8D44\u6E90 Agent\u3002\u4E3A\u201C{topic}\u201D\u751F\u6210\u677F\u4E66\u7ED3\u6784\u3001\u8BFE\u5802\u6D3B\u52A8\u548C\u4E09\u5F20\u6559\u5B66\u914D\u56FE\u7684\u5B89\u5168\u63D0\u793A\u8BCD\u3002\u8F93\u51FA\u8981\u6C42\uFF1A{languageInstruction}", { topic, languageInstruction }) }
            ]
          },
          { type: "phase", name: (0, import_i18n.t)("\u5408\u6210\u4E0E\u590D\u6838") },
          { type: "reduce", from: "parts", kind: "synthesize", bind: "lesson" },
          {
            type: "agent",
            goal: `\u4F60\u662F\u6559\u5B66\u5BA1\u6838 Agent\u3002\u590D\u6838\u6559\u6848 {{lesson}}\uFF1A\u68C0\u67E5\u8BFE\u7A0B\u76EE\u6807\u4E0E\u5C97\u4F4D\u4EFB\u52A1\u4E00\u81F4\u6027\u3001\u6B65\u9AA4\u53EF\u6267\u884C\u6027\u3001\u8BC4\u4EF7\u8BC1\u636E\u3001\u5B9E\u8BAD\u5B89\u5168\u3001\u5B66\u672F\u8BDA\u4FE1\u4E0E\u6559\u5E08\u786E\u8BA4\u70B9\uFF1B\u8F93\u51FA\u5B8C\u6574\u53EF\u7528\u6559\u6848\u53CA\u98CE\u9669\u63D0\u793A\u3002\u8F93\u51FA\u8981\u6C42\uFF1A${languageInstruction}`,
            bind: "reviewed_lesson"
          },
          { type: "log", message: (0, import_i18n.t)("\u6559\u6848\u751F\u6210\u4E0E\u590D\u6838\u5B8C\u6210") }
        ]
      };
      const result = await client.post("/v1/workflows/dynamic/run", {
        ast,
        input: {
          topic,
          grade,
          learnerLevel,
          durationMinutes,
          outputLanguage
        },
        options: {
          guardrails: {
            maxAgents: 10,
            // 同时在岗 ≤ 套餐名额 C（agent 侧 max_concurrency 只收紧不放宽）
            maxConcurrency: (0, import_shared.resolveWorkflowSeatCapFromDeps)(deps),
            // Qiye client 会转成 token_ceiling；这是 Agent 原生动态工作流的真实字段名。
            tokenCeiling: 8e4
          }
        }
      }, 18e5);
      if (!(0, import_workbenchApi.workflowResultHasAgentError)(result)) return result;
      const markdown = outputLanguage === "ar" ? (0, import_i18n.t)("# \u062D\u0632\u0645\u0629 \u062F\u0631\u0633: {topic}\n\n## \u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u062A\u0639\u0644\u0645\n- \u0631\u0628\u0637 \u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0628\u0645\u0647\u0645\u0629 \u0645\u0647\u0646\u064A\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062A\u0646\u0641\u064A\u0630.\n- \u0625\u0646\u062A\u0627\u062C \u062F\u0644\u064A\u0644 \u0639\u0645\u0644 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0639\u0644\u0645 \u0645\u0631\u0627\u062C\u0639\u062A\u0647.\n\n## \u0633\u064A\u0631 \u0627\u0644\u062D\u0635\u0629 ({durationMinutes} \u062F\u0642\u064A\u0642\u0629)\n1. **\u062A\u0647\u064A\u0626\u0629 \u0627\u0644\u0645\u0647\u0645\u0629 (5 \u062F\u0642\u0627\u0626\u0642):** \u0639\u0631\u0636 \u0645\u0648\u0642\u0641 \u0645\u0647\u0646\u064A \u0648\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0646\u062C\u0627\u062D.\n2. **\u0639\u0631\u0636 \u0648\u0625\u0631\u0634\u0627\u062F (10 \u062F\u0642\u0627\u0626\u0642):** \u064A\u0634\u0631\u062D \u0627\u0644\u0645\u0639\u0644\u0645 \u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0648\u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u0635\u064A\u0646\u064A\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629.\n3. **\u062A\u062F\u0631\u064A\u0628 \u062C\u0645\u0627\u0639\u064A (20 \u062F\u0642\u064A\u0642\u0629):** \u064A\u0646\u0641\u0630 \u0627\u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u0645\u0647\u0645\u0629 \u0645\u0639 \u0642\u0627\u0626\u0645\u0629 \u0641\u062D\u0635.\n4. **\u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u062A\u063A\u0630\u064A\u0629 \u0631\u0627\u062C\u0639\u0629 (10 \u062F\u0642\u0627\u0626\u0642):** \u062A\u0642\u064A\u064A\u0645 \u062A\u0643\u0648\u064A\u0646\u064A \u0648\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0639\u0644\u0645.\n\n## \u0627\u0644\u062A\u0642\u064A\u064A\u0645\n- \u0627\u0644\u0639\u0645\u0644\u064A\u0629 40%\u060C \u0627\u0644\u0646\u0627\u062A\u062C 30%\u060C \u0627\u0644\u062A\u0639\u0627\u0648\u0646 20%\u060C \u0627\u0644\u062A\u0623\u0645\u0644 10%.\n\n> \u4E2D\u6587\u63D0\u793A\uFF1A\u6240\u6709\u5173\u952E\u8BC4\u4EF7\u5FC5\u987B\u7531\u6559\u5E08\u786E\u8BA4\uFF0C\u4E0D\u81EA\u52A8\u56DE\u5199\u6210\u7EE9\u3002", { topic, durationMinutes }) : (0, import_i18n.t)("# {topic} \xB7 \u804C\u6559/\u9AD8\u6821\u667A\u80FD\u6559\u6848\n\n## \u4E00\u3001\u8BFE\u7A0B\u76EE\u6807\n- \u628A\u77E5\u8BC6\u70B9\u8F6C\u5316\u4E3A\u53EF\u89C2\u5BDF\u7684\u5C97\u4F4D\u4EFB\u52A1\u3002\n- \u5B66\u751F\u63D0\u4EA4\u8FC7\u7A0B\u8BC1\u636E\u3001\u6210\u679C\u4E0E\u53CD\u601D\uFF0C\u7531\u6559\u5E08\u786E\u8BA4\u5173\u952E\u8BC4\u4EF7\u3002\n\n## \u4E8C\u3001{durationMinutes} \u5206\u949F\u8BFE\u5802\u6D41\u7A0B\n1. **\u4EFB\u52A1\u5BFC\u5165\uFF085 \u5206\u949F\uFF09**\uFF1A\u5448\u73B0\u5C97\u4F4D\u60C5\u5883\u3001\u5B66\u751F\u89D2\u8272\u548C\u6210\u529F\u6807\u51C6\u3002\n2. **\u793A\u8303\u8BB2\u89E3\uFF0810 \u5206\u949F\uFF09**\uFF1A\u6559\u5E08\u6F14\u793A\u5173\u952E\u6B65\u9AA4\uFF0C\u5E76\u7ED9\u963F\u62C9\u4F2F\u8BED\u5B66\u751F\u8865\u5145\u6838\u5FC3\u672F\u8BED\u89E3\u91CA\u3002\n3. **\u5206\u7EC4\u5B9E\u8BAD\uFF0820 \u5206\u949F\uFF09**\uFF1A\u5B66\u751F\u6309\u68C0\u67E5\u8868\u64CD\u4F5C\uFF0CAgent \u53EA\u7ED9\u5206\u5C42\u63D0\u793A\uFF0C\u4E0D\u4EE3\u505A\u3002\n4. **\u5F62\u6210\u6027\u8BC4\u4EF7\uFF0810 \u5206\u949F\uFF09**\uFF1A\u6309\u8FC7\u7A0B\u3001\u7ED3\u679C\u3001\u534F\u4F5C\u3001\u89C4\u8303\u548C\u53CD\u601D\u7559\u8BC1\u3002\n\n## \u4E09\u3001\u6559\u5E08\u786E\u8BA4\u70B9\n- \u5B9E\u8BAD\u5B89\u5168\u3001\u5B66\u672F\u8BDA\u4FE1\u3001\u5C97\u4F4D\u5339\u914D\u5EA6\u548C\u6700\u7EC8\u8BC4\u4EF7\u5FC5\u987B\u7531\u6559\u5E08\u786E\u8BA4\u3002\n\n> \u0634\u0631\u062D \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629: \u064A\u062C\u0628 \u0639\u0644\u0649 \u0627\u0644\u0645\u0639\u0644\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0648\u0644\u0627 \u062A\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062F\u0631\u062C\u0627\u062A \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B.", { topic, durationMinutes });
      return (0, import_workbenchApi.createFixedDemoWorkflowResult)(
        `education-${Date.now()}`,
        "reviewed_lesson",
        markdown,
        [
          { agent: (0, import_i18n.t)("\u8BFE\u7A0B\u8BBE\u8BA1 Agent"), action: (0, import_i18n.t)("\u76EE\u6807\u4E0E\u65F6\u95F4\u5206\u914D"), evidence: `${grade} \xB7 ${learnerLevel}` },
          { agent: (0, import_i18n.t)("\u5B9E\u8BAD\u4EFB\u52A1 Agent"), action: (0, import_i18n.t)("\u5C97\u4F4D\u4EFB\u52A1\u62C6\u89E3"), evidence: topic },
          { agent: (0, import_i18n.t)("\u884C\u4E1A\u6848\u4F8B Agent"), action: (0, import_i18n.t)("\u6848\u4F8B\u4E0E\u5DE5\u5177\u6E05\u5355"), evidence: (0, import_i18n.t)("\u56FA\u5B9A\u6F14\u793A\u6848\u4F8B\u5E93") },
          { agent: (0, import_i18n.t)("\u8BC4\u4EF7\u8BBE\u8BA1 Agent"), action: (0, import_i18n.t)("\u5F62\u6210\u6027\u8BC4\u4EF7\u91CF\u89C4"), evidence: (0, import_i18n.t)("5 \u7C7B\u53EF\u89C2\u5BDF\u8BC1\u636E") },
          { agent: (0, import_i18n.t)("\u5B66\u60C5\u652F\u6301 Agent"), action: (0, import_i18n.t)("\u5206\u5C42\u63D0\u793A"), evidence: (0, import_i18n.t)("\u57FA\u7840/\u8FDB\u9636/\u6311\u6218") },
          { agent: (0, import_i18n.t)("\u6559\u5B66\u8D44\u6E90 Agent"), action: (0, import_i18n.t)("\u677F\u4E66\u4E0E\u914D\u56FE\u63D0\u793A\u8BCD"), evidence: (0, import_i18n.t)("3 \u7EC4\u8D44\u6E90\u63D0\u793A") },
          { agent: (0, import_i18n.t)("\u6559\u5B66\u5BA1\u6838 Agent"), action: (0, import_i18n.t)("\u5B89\u5168\u4E0E\u6559\u5E08\u786E\u8BA4\u590D\u6838"), evidence: "reviewed_lesson" }
        ]
      );
    }
  );
}

// node_modules/.cache/solutions-build/workbench-education/entry.main.ts
var hostApi = 2;
var registerFunction = "registerEducationWorkbenchHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerEducationWorkbenchHandlers(ctx.host.deps);
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
