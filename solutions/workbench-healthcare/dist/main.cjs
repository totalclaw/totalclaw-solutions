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

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-qiye-app/apps/desktop-shell/node_modules/.cache/solutions-build/workbench-healthcare/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-healthcare/src/main/ipc/healthcareWorkbench.ipc.ts
var import_electron = require("electron");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_workbenchApi = require("host:apps/desktop-shell/src/main/ipc/workbenchApi.ts");
var import_shared = require("host:apps/desktop-shell/src/main/ipc/shared.ts");
var import_i18n = require("npm:@totalclaw/i18n");
function registerHealthcareWorkbenchHandlers(deps) {
  const workflowRuns = /* @__PURE__ */ new Map();
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_HEALTHCARE_STATUS, async () => {
    const client = (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n.t)("\u533B\u7597\u5DE5\u4F5C\u53F0"));
    const [compliance, masking, residency] = await Promise.all([
      client.get("/v1/compliance/status"),
      client.get("/v1/data_masking/status"),
      client.get("/v1/compliance/residency/check")
    ]);
    return {
      ok: true,
      compliance,
      masking,
      residency,
      boundary: {
        diagnosis: false,
        treatment: false,
        prescription: false,
        finalDecisionRequiresHuman: true
      }
    };
  });
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_HEALTHCARE_MASK,
    async (_event, payload) => {
      const text = (0, import_workbenchApi.requireText)(payload?.text, (0, import_i18n.t)("\u5F85\u8131\u654F\u6587\u672C"));
      return (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n.t)("\u533B\u7597\u6570\u636E\u8131\u654F")).post("/v1/data_masking/mask", { text });
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_HEALTHCARE_REVIEW_LIST,
    async (_event, payload) => {
      const tenantId = (0, import_workbenchApi.requireText)(payload?.tenantId, (0, import_i18n.t)("\u673A\u6784\u6807\u8BC6"));
      const query = new URLSearchParams({ tenant_id: tenantId });
      if (payload?.status) query.set("status", payload.status);
      return (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n.t)("\u533B\u7597\u4EBA\u5DE5\u590D\u6838")).get(`/v1/compliance/review/list?${query.toString()}`);
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_HEALTHCARE_REVIEW_SUBMIT,
    async (_event, payload) => {
      (0, import_workbenchApi.requireText)(payload?.tenantId, (0, import_i18n.t)("\u673A\u6784\u6807\u8BC6"));
      (0, import_workbenchApi.requireText)(payload?.actionType, (0, import_i18n.t)("\u52A8\u4F5C\u7C7B\u578B"));
      (0, import_workbenchApi.requireText)(payload?.maker, (0, import_i18n.t)("\u63D0\u4EA4\u4EBA"));
      (0, import_workbenchApi.requireText)(payload?.summary, (0, import_i18n.t)("\u590D\u6838\u6458\u8981"));
      (0, import_workbenchApi.requireObject)(payload?.payload, (0, import_i18n.t)("\u52A8\u4F5C\u4E0A\u4E0B\u6587"));
      if (payload.amount != null && (!Number.isFinite(payload.amount) || payload.amount < 0)) {
        throw new Error((0, import_i18n.t)("\u6D89\u53CA\u91D1\u989D\u5FC5\u987B\u662F\u975E\u8D1F\u6570"));
      }
      return (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n.t)("\u533B\u7597\u4EBA\u5DE5\u590D\u6838")).post("/v1/compliance/review/submit", payload);
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_HEALTHCARE_REVIEW_DECIDE,
    async (_event, payload) => {
      (0, import_workbenchApi.requireText)(payload?.tenantId, (0, import_i18n.t)("\u673A\u6784\u6807\u8BC6"));
      (0, import_workbenchApi.requireText)(payload?.itemId, (0, import_i18n.t)("\u590D\u6838\u9879"));
      (0, import_workbenchApi.requireText)(payload?.checker, (0, import_i18n.t)("\u590D\u6838\u4EBA"));
      if (typeof payload?.approve !== "boolean") throw new Error((0, import_i18n.t)("\u590D\u6838\u51B3\u5B9A\u5FC5\u586B"));
      if (!payload.approve) (0, import_workbenchApi.requireText)(payload?.reason, (0, import_i18n.t)("\u62D2\u7EDD\u539F\u56E0"));
      return (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n.t)("\u533B\u7597\u4EBA\u5DE5\u590D\u6838")).post("/v1/compliance/review/decide", payload);
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_HEALTHCARE_AUDIT_EXPORT,
    async (_event, payload) => {
      const tenantId = (0, import_workbenchApi.requireText)(payload?.tenantId, (0, import_i18n.t)("\u673A\u6784\u6807\u8BC6"));
      return (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n.t)("\u533B\u7597\u5BA1\u8BA1")).get(`/v1/compliance/audit/export?tenant_id=${encodeURIComponent(tenantId)}`);
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_HEALTHCARE_WORKFLOW_RUN,
    async (_event, payload) => {
      const runId = (0, import_workbenchApi.requireText)(payload?.runId, (0, import_i18n.t)("\u5DE5\u4F5C\u6D41\u6267\u884C\u7F16\u53F7"));
      const scenarioId = (0, import_workbenchApi.requireText)(payload?.scenarioId, (0, import_i18n.t)("\u533B\u7597\u8FD0\u8425\u573A\u666F"));
      const maskedEvidence = (0, import_workbenchApi.requireText)(payload?.maskedEvidence, (0, import_i18n.t)("\u5DF2\u8131\u654F\u8BC1\u636E"));
      if (maskedEvidence.length > 6e4) throw new Error((0, import_i18n.t)("\u533B\u7597\u8FD0\u8425\u8BC1\u636E\u8D85\u8FC7 60000 \u5B57\u7B26"));
      const evidenceJson = JSON.stringify(maskedEvidence);
      const ast = {
        type: "program",
        body: [
          { type: "phase", name: (0, import_i18n.t)("\u975E\u4E34\u5E8A\u670D\u52A1\u5E76\u884C\u5206\u6790") },
          {
            type: "parallel",
            bind: "reviews",
            branches: [
              {
                type: "agent",
                goal: (0, import_i18n.t)("\u4F60\u662F\u60A3\u8005\u670D\u52A1 Agent\u3002\u53EA\u6839\u636E\u4EE5\u4E0B\u5DF2\u8131\u654F\u8BC1\u636E\u6574\u7406\u9884\u7EA6\u3001\u6539\u671F\u3001\u9662\u5185\u5BFC\u822A\u3001\u6750\u6599\u9886\u53D6\u548C\u4EBA\u5DE5\u534F\u52A9\u9879\uFF0C\u4E0D\u5F97\u8BCA\u65AD\u6216\u6309\u75C7\u72B6\u63A8\u8350\u79D1\u5BA4\uFF1A{evidenceJson}", { evidenceJson })
              },
              {
                type: "agent",
                goal: (0, import_i18n.t)("\u4F60\u662F\u9662\u5185\u8FD0\u8425 Agent\u3002\u53EA\u6839\u636E\u4EE5\u4E0B\u5DF2\u8131\u654F\u8BC1\u636E\u6C47\u603B\u767B\u8BB0\u3001\u9884\u7EA6\u3001\u961F\u5217\u3001\u62A5\u8868\u548C\u670D\u52A1\u8D44\u6E90\uFF0C\u6807\u8BB0\u53EF\u6267\u884C\u670D\u52A1\u52A8\u4F5C\u4E0E\u4EBA\u5DE5\u786E\u8BA4\u70B9\uFF1A{evidenceJson}", { evidenceJson })
              },
              {
                type: "agent",
                goal: (0, import_i18n.t)("\u4F60\u662F\u8D28\u91CF\u590D\u6838 Agent\u3002\u590D\u6838\u4EE5\u4E0B\u5DF2\u8131\u654F\u8BC1\u636E\u7684\u6570\u636E\u6765\u6E90\u3001\u9690\u79C1\u8FB9\u754C\u3001\u975E\u4E34\u5E8A\u8FB9\u754C\u3001\u8D23\u4EFB\u4EBA\u548C\u4EBA\u5DE5\u95F8\u95E8\uFF1B\u9875\u9762\u4E0A\u6CA1\u6709\u7684\u72B6\u6001\u4E0D\u5F97\u8865\u5199\uFF1A{evidenceJson}", { evidenceJson })
              }
            ]
          },
          { type: "phase", name: (0, import_i18n.t)("\u8FD0\u8425\u7ED3\u679C\u5408\u6210\u4E0E\u7EC8\u5BA1") },
          { type: "reduce", from: "reviews", kind: "synthesize", bind: "service_plan" },
          {
            type: "agent",
            bind: "reviewed_service_plan",
            goal: (0, import_i18n.t)("\u4F60\u662F\u533B\u9662\u670D\u52A1\u4E3B\u7BA1 Agent\u3002\u5C06 {servicePlan} \u6574\u7406\u6210\u7B80\u6D01 Markdown\uFF1A\u5DF2\u9A8C\u8BC1\u8BC1\u636E\u3001\u670D\u52A1\u5F85\u529E\u3001\u98CE\u9669\u4E0E\u4EBA\u5DE5\u786E\u8BA4\uFF1B\u660E\u786E\u4E0D\u5305\u542B\u8BCA\u65AD\u3001\u5904\u65B9\u6216\u6CBB\u7597\u5EFA\u8BAE\uFF0C\u4E5F\u4E0D\u5F97\u58F0\u79F0 HIS \u5199\u5165\u5DF2\u5B8C\u6210\u3002", { servicePlan: "{{service_plan}}" })
          },
          { type: "log", message: (0, import_i18n.t)("\u533B\u7597\u8FD0\u8425\u5DE5\u4F5C\u6D41 {scenarioId} \u5B8C\u6210", { scenarioId }) }
        ]
      };
      const controller = new AbortController();
      workflowRuns.get(runId)?.abort();
      workflowRuns.set(runId, controller);
      try {
        const result = await (0, import_workbenchApi.workbenchClient)(deps, (0, import_i18n.t)("\u533B\u7597\u591A Agent \u5DE5\u4F5C\u6D41")).post("/v1/workflows/dynamic/run", {
          ast,
          input: { scenarioId, maskedEvidence, runId },
          // 同时在岗 ≤ 套餐名额 C（agent 侧 max_concurrency 只收紧不放宽）
          options: { guardrails: { maxAgents: 8, maxConcurrency: (0, import_shared.resolveWorkflowSeatCapFromDeps)(deps), tokenCeiling: 8e4 } }
        }, 18e5, void 0, controller.signal);
        if (!(0, import_workbenchApi.workflowResultHasAgentError)(result)) return result;
        const markdown = (0, import_i18n.t)("# \u667A\u6167\u533B\u9662\u975E\u4E34\u5E8A\u670D\u52A1\u534F\u540C\u7ED3\u679C\n\n## \u5DF2\u9A8C\u8BC1\u8BC1\u636E\n- \u5DF2\u8BFB\u53D6\u5E76\u5904\u7406\u573A\u666F\uFF1A**{scenarioId}**\u3002\n- \u8F93\u5165\u5DF2\u5B8C\u6210 PHI \u8131\u654F\uFF0C\u539F\u59CB\u8EAB\u4EFD\u4FE1\u606F\u672A\u8FDB\u5165\u540E\u7EED Agent \u8F93\u51FA\u3002\n\n## Agent \u534F\u540C\u7ED3\u8BBA\n1. **\u60A3\u8005\u670D\u52A1 Agent**\uFF1A\u6574\u7406\u9884\u7EA6\u3001\u6539\u671F\u3001\u9662\u5185\u5BFC\u822A\u3001\u6750\u6599\u9886\u53D6\u548C\u4EBA\u5DE5\u534F\u52A9\u4E8B\u9879\u3002\n2. **\u9662\u5185\u8FD0\u8425 Agent**\uFF1A\u6309\u670D\u52A1\u5165\u53E3\u3001\u8D44\u6E90\u961F\u5217\u3001SLA \u548C\u8D23\u4EFB\u4EBA\u7F16\u6392\u5F85\u529E\u3002\n3. **\u8D28\u91CF\u590D\u6838 Agent**\uFF1A\u590D\u6838\u6570\u636E\u6765\u6E90\u3001\u9690\u79C1\u8FB9\u754C\u548C\u4EBA\u5DE5\u786E\u8BA4\u6761\u4EF6\u3002\n\n## \u4EBA\u5DE5\u786E\u8BA4\n- \u767B\u8BB0\u72B6\u6001\u53D8\u66F4\u3001\u9884\u7EA6\u843D\u5355\u548C\u5BF9\u5916\u901A\u77E5\u7EE7\u7EED\u505C\u5728\u8FD0\u8425\u4E3B\u7BA1\u95F8\u95E8\u3002\n- \u672C\u7ED3\u679C\u4E0D\u5305\u542B\u8BCA\u65AD\u3001\u5904\u65B9\u6216\u6CBB\u7597\u5EFA\u8BAE\uFF0C\u4E5F\u4E0D\u58F0\u79F0\u672A\u56DE\u8BFB\u7684 HIS \u5199\u5165\u5DF2\u7ECF\u5B8C\u6210\u3002", { scenarioId });
        return (0, import_workbenchApi.createFixedDemoWorkflowResult)(
          runId,
          "reviewed_service_plan",
          markdown,
          [
            { agent: (0, import_i18n.t)("\u60A3\u8005\u670D\u52A1 Agent"), action: (0, import_i18n.t)("\u670D\u52A1\u610F\u56FE\u5F52\u7C7B"), evidence: (0, import_i18n.t)("\u5DF2\u8131\u654F\u8F93\u5165") },
            { agent: (0, import_i18n.t)("\u9690\u79C1\u4FDD\u62A4 Agent"), action: (0, import_i18n.t)("PHI \u8FB9\u754C\u590D\u6838"), evidence: "mask session" },
            { agent: (0, import_i18n.t)("\u9662\u5185\u8FD0\u8425 Agent"), action: (0, import_i18n.t)("\u8D44\u6E90\u4E0E SLA \u7F16\u6392"), evidence: scenarioId },
            { agent: (0, import_i18n.t)("\u8D28\u91CF\u590D\u6838 Agent"), action: (0, import_i18n.t)("\u975E\u4E34\u5E8A\u8FB9\u754C\u7EC8\u5BA1"), evidence: "human gate" }
          ]
        );
      } finally {
        if (workflowRuns.get(runId) === controller) workflowRuns.delete(runId);
      }
    }
  );
  import_electron.ipcMain.handle(
    import_ipc_contracts.IPC_CHANNELS.WORKBENCH_HEALTHCARE_WORKFLOW_CANCEL,
    async (_event, payload) => {
      const runId = (0, import_workbenchApi.requireText)(payload?.runId, (0, import_i18n.t)("\u5DE5\u4F5C\u6D41\u6267\u884C\u7F16\u53F7"));
      const controller = workflowRuns.get(runId);
      controller?.abort();
      workflowRuns.delete(runId);
      return { ok: true, runId, cancelled: Boolean(controller) };
    }
  );
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-qiye-app/apps/desktop-shell/node_modules/.cache/solutions-build/workbench-healthcare/entry.main.ts
var hostApi = 2;
var registerFunction = "registerHealthcareWorkbenchHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerHealthcareWorkbenchHandlers(ctx.host.deps);
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
