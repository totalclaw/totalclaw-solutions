const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const X = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!X) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
X.default;
const Y = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!Y) throw new Error("宿主模块未就绪：npm:vue-router");
Y.default;
const ie = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!ie) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Oe = ie.default, ce = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/StepRunAlert.vue"];
if (!ce) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/StepRunAlert.vue");
const Re = ce.default, G = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts"];
if (!G) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts");
G.default;
const a = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!a) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
a.default;
const je = {
  class: "fdv",
  dir: "ltr"
}, qe = { class: "fdv-caret" }, Pe = ["title"], Fe = { class: "fdv-stat" }, He = { class: "add" }, Ke = { class: "del" }, Me = ["title"], xe = {
  key: 0,
  class: "fdv-body"
}, Ue = { class: "fdv-gutter" }, ze = { class: "fdv-txt" }, Xe = {
  key: 0,
  class: "fdv-empty"
}, Ye = /* @__PURE__ */ e.defineComponent({
  __name: "FileDiffViewer",
  props: {
    change: {}
  },
  emits: ["open"],
  setup(v) {
    const c = v, p = e.ref(!1), V = e.computed(() => c.change.action), C = e.computed(() => ({ write: a.t("写入"), patch: a.t("修改"), read: a.t("读取") })[c.change.action] || c.change.action), r = e.computed(() => {
      const d = c.change, f = [], i = (m) => (m || "").replace(/\n$/, "").split(`
`);
      if (d.action === "write" && d.content != null)
        for (const m of i(d.content)) f.push({ t: "add", text: m });
      else if (d.action === "patch")
        if (d.patchText)
          for (const m of i(d.patchText))
            f.push({ t: m.startsWith("+") ? "add" : m.startsWith("-") ? "del" : "ctx", text: m });
        else {
          for (const m of i(d.oldString || "")) f.push({ t: "del", text: m });
          for (const m of i(d.newString || "")) f.push({ t: "add", text: m });
        }
      return f.slice(0, 400);
    }), L = e.computed(() => r.value.filter((d) => d.t === "add").length), T = e.computed(() => r.value.filter((d) => d.t === "del").length);
    return (d, f) => (e.openBlock(), e.createElementBlock(
      e.Fragment,
      null,
      [
        e.createCommentVNode(" 代码 diff 始终左到右（界面整体随语言 RTL 时也一样） "),
        e.createElementVNode("div", je, [
          e.createElementVNode("div", {
            class: "fdv-head",
            onClick: f[1] || (f[1] = (i) => p.value = !p.value)
          }, [
            e.createElementVNode(
              "span",
              qe,
              e.toDisplayString(p.value ? "▸" : "▾"),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["fdv-action", V.value])
              },
              e.toDisplayString(C.value),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode("span", {
              class: "fdv-path",
              title: v.change.path
            }, e.toDisplayString(v.change.path), 9, Pe),
            e.createElementVNode("span", Fe, [
              e.createElementVNode(
                "span",
                He,
                "+" + e.toDisplayString(L.value),
                1
                /* TEXT */
              ),
              f[2] || (f[2] = e.createTextVNode()),
              e.createElementVNode(
                "span",
                Ke,
                "-" + e.toDisplayString(T.value),
                1
                /* TEXT */
              )
            ]),
            v.change.path ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              class: "fdv-open",
              title: d.$t("打开文件"),
              onClick: f[0] || (f[0] = e.withModifiers((i) => d.$emit("open", v.change.path), ["stop"]))
            }, "↗", 8, Me)) : e.createCommentVNode("v-if", !0)
          ]),
          p.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("div", xe, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(r.value, (i, m) => (e.openBlock(), e.createElementBlock(
                "div",
                {
                  key: m,
                  class: e.normalizeClass(["fdv-line", i.t])
                },
                [
                  e.createElementVNode(
                    "span",
                    Ue,
                    e.toDisplayString(i.t === "add" ? "+" : i.t === "del" ? "-" : " "),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    ze,
                    e.toDisplayString(i.text),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              ))),
              128
              /* KEYED_FRAGMENT */
            )),
            r.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "div",
              Xe,
              e.toDisplayString(d.$t("（无文本改动内容）")),
              1
              /* TEXT */
            ))
          ]))
        ])
      ],
      2112
      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    ));
  }
}), de = (v, c) => {
  const p = v.__vccOpts || v;
  for (const [V, C] of c)
    p[V] = C;
  return p;
}, Ge = /* @__PURE__ */ de(Ye, [["__scopeId", "data-v-6cf7e50f"]]), ue = "sol-rd-workflow", Je = [
  { id: "web", label: a.t("Web 网站 / 应用"), stackHint: "React/Vue + TypeScript" },
  { id: "h5", label: a.t("H5 页面 / 活动页"), stackHint: a.t("Vue/React + 移动端适配") },
  { id: "miniprogram", label: a.t("小程序"), stackHint: a.t("微信小程序 / uni-app / Taro") },
  { id: "app", label: a.t("App（移动端）"), stackHint: a.t("Flutter/React Native 或原生") },
  { id: "desktop", label: a.t("桌面应用"), stackHint: "Electron/Tauri" },
  { id: "backend", label: a.t("后端 / 服务"), stackHint: "Node/Python/Go + REST/gRPC" },
  { id: "data_ai", label: a.t("数据 / AI"), stackHint: a.t("Python + 数据管道/大模型") },
  { id: "other", label: a.t("其他（自填技术栈）"), stackHint: "" }
], Qe = [
  { id: "intake", name: a.t("客户交付需求"), roleId: "", icon: "clipboard", duty: a.t("收集需求与开发类型，缺必填不放行"), writesFiles: !1 },
  { id: "pm", name: a.t("AI 产品经理"), roleId: "ai-pm", icon: "clipboard", duty: a.t("需求分析、选项式头脑风暴、用户故事与任务拆解"), writesFiles: !1 },
  { id: "dev", name: a.t("AI 开发工程师"), roleId: "ai-dev", icon: "code", duty: a.t("技术方案 + 在工作区编写代码 + 基础自测"), writesFiles: !0 },
  { id: "reviewer", name: a.t("AI 代码评审员"), roleId: "ai-reviewer", icon: "search", duty: a.t("审查 Bug 与安全、规范检查、生成单元测试"), writesFiles: !0 },
  { id: "qa", name: a.t("AI 测试工程师"), roleId: "ai-qa", icon: "bug", duty: a.t("编写并执行测试用例、回归、Bug 报告"), writesFiles: !0 },
  { id: "ops", name: a.t("AI 运维工程师"), roleId: "ai-ops", icon: "server", duty: a.t("自动化部署发布、监控告警、故障自愈与成本优化"), writesFiles: !1 }
], I = Object.fromEntries(
  [
    "projectName",
    "devType",
    "requirement",
    "constraints",
    "techStack",
    "outputDir",
    "node_pm_result",
    "node_brainstorm_choice",
    "node_dev_result",
    "node_reviewer_result",
    "node_qa_result"
  ].map((v) => [v, `{${v}}`])
), j = a.t("\n\n【缺料规则】遇到必须由用户拍板或补充才能继续的关键信息（缺账号/密钥/接口文档/目标平台细节/歧义需求等），不要臆造，在回复**开头**用一行 `【需要补充】` 列出缺什么、为什么，并只在已知信息范围内先给出可交付的部分，把待补项清楚标出，等用户补齐后可在下一轮继续。"), z = a.t("\n\n【工作区·必须遵守】你的**当前工作目录就是本项目产出目录**「${outputDir}/${projectName}/」（已自动创建好，可直接写入，不用自己再建）。用文件工具（write_file/patch/read_file）把代码真实写进来：**直接用相对路径即可**（例如 write_file 到 `src/index.html`、`README.md`），也可用完整绝对路径「${outputDir}/${projectName}/src/index.html」。不要把文件写到工作目录之外。每个文件用规范项目结构 + 必要注释；改动前先 read_file 看现状再 patch。", I), Ze = a.t(`

【机器可读方向清单·必须输出】在全部内容的最末尾另起一段，严格用如下格式列出你上面第 2 步提出的候选产品方向（系统据此为用户生成可勾选的方向按钮）。每个方向单独一行、控制在 40 字内、格式「方向名：一句话卖点」，不要编号字母、不要在这两行标记之外添加任何字符：
===BRAINSTORM_OPTIONS===
方向一名称：一句话卖点
方向二名称：一句话卖点
===END_BRAINSTORM_OPTIONS===`), E = [
  {
    id: "pm",
    name: a.t("② AI 产品经理 · 需求与规划"),
    roleId: "ai-pm",
    goal: a.t(`你是资深 AI 产品经理，负责需求分析与产品规划。项目「\${projectName}」，开发类型：\${devType}。基于客户需求，产出（Markdown）：
1. 需求澄清：列 3-6 个关键待确认问题；
2. **选项式头脑风暴（重要）**：给出 3-5 个候选产品方向/功能组合，每个含「一句话卖点 + 适用场景 + 粗略工作量」，清晰编号列出供用户选择（工作流会在你产出后暂停，让用户勾选一个方向或自填后再继续）；
3. 供用户拍板：给出你推荐的方向与理由，以及基于该方向的 MVP 范围(本期做/不做)、用户故事(含验收标准)、编号任务拆解(标 P0/P1/P2 与依赖)、产品路线图。
结构化、可直接交付开发。信息不足处显式标「缺：X」，不编造。

客户需求：
\${requirement}

约束：\${constraints}`, I) + Ze + j
  },
  {
    id: "dev",
    name: a.t("③ AI 开发工程师 · 技术方案 + 编码"),
    roleId: "ai-dev",
    goal: a.t(`你是资深 AI 开发工程师。基于产品经理的规划，开发类型「\${devType}」，技术栈偏好「\${techStack}」（未指定则按开发类型选主流栈并说明理由）：
1. 给《技术设计》：架构、模块划分、数据模型、关键接口、依赖选型；
2. **真实编写代码**：按任务逐模块用文件工具把可运行代码写进工作区，遵循该语言/框架规范；
3. 基础自测：给自测步骤或简单自测用例与预期。
未实现/待定/需第三方凭据处标「缺：X」。

产品规划：
\${node_pm_result}

【用户已拍板的产品方向 —— 必须严格按此方向开发，不要另选方向】
\${node_brainstorm_choice}`, I) + z + j
  },
  {
    id: "reviewer",
    name: a.t("④ AI 代码评审员 · 评审 + 单测"),
    roleId: "ai-reviewer",
    goal: a.t(`你是严格的 AI 代码评审员。read_file 读开发写入工作区的代码，逐项审查：
1. 潜在 Bug（问题/场景/影响/修法）、边界与错误处理；
2. 安全审查（注入/越权/密钥硬编码/依赖漏洞…按 P0/P1/P2 排）；
3. 规范与可维护性，给具体修改建议；
4. **用文件工具为核心逻辑写真实可运行的单元测试**（标框架，覆盖正常/边界/异常）。
给出是否可进入测试的结论与必须先改的 P0 阻塞项（有 P0 建议打回开发）。

技术方案：
\${node_dev_result}`, I) + z + j
  },
  {
    id: "qa",
    name: a.t("⑤ AI 测试工程师 · 测试用例 + 执行"),
    roleId: "ai-qa",
    goal: a.t(`你是 AI 测试工程师。基于规划、代码与评审：
1. 按验收标准编写功能/边界/异常/兼容测试用例（表格：编号/前置/步骤/预期/优先级）；
2. 设计集成与回归用例；
3. **用文件工具把可执行的自动化测试写进工作区并尽量执行**，记录通过/失败，失败项自动生成 Bug 报告（标题/复现/期望vs实际/严重度/指向模块）；
4. 给发布准入准出结论，未达标列阻断项。
缺可执行环境/测试数据标「缺：X」。

规划：
\${node_pm_result}

评审：
\${node_reviewer_result}`, I) + z + j
  },
  {
    id: "ops",
    name: a.t("⑥ AI 运维工程师 · 部署运维"),
    roleId: "ai-ops",
    goal: a.t(`你是 AI 运维工程师，负责自动化部署与发布、监控告警、故障自愈与成本优化。基于已通过测试的产物、开发类型「\${devType}」：
1. 自动化部署与发布：环境、构建、CI/CD 步骤、回滚策略（结合平台给容器/Serverless/静态托管/应用商店等具体做法，可写 CI 配置/部署脚本到工作区）；
2. 智能监控与告警：关键指标(可用/延迟/错误率/资源/成本)、阈值、通知方式；
3. 故障自愈：常见故障与自愈动作(重启/扩缩容/熔断/切流)及人工介入边界；
4. 成本优化 + 上线检查清单。
缺目标环境/云账号/密钥标「缺：X」，不臆造真实凭据。

测试结论：
\${node_qa_result}

技术方案：
\${node_dev_result}`, I) + j
  }
];
function et(v) {
  const c = Date.now(), p = [];
  return p.push({ id: "start", type: "start", name: a.t("开始"), config: {}, next: ["pm"], position: { x: 40, y: 40 } }), p.push({ id: "pm", type: "llm_call", name: E[0].name, config: { goal: E[0].goal, roleId: "ai-pm" }, next: ["brainstorm"], position: { x: 340, y: 40 } }), p.push({
    id: "brainstorm",
    type: "human_confirm",
    name: a.t("确认产品方向（可自填）"),
    config: {
      question: a.t("从产品经理提出的候选方向里勾选一个，或在下方回答它的澄清问题 / 自填你的方向与优先级"),
      detail: a.t(`AI 产品经理的候选方向与澄清问题如下，请勾选一个方向，并可在下方补充框回答上面的澄清问题：

\${node_pm_result}`, I),
      // optionsFrom：运行时从 PM 产出（node_pm_result）里抽取模型真实给出的候选方向当选项；
      // 抽不到（模型没按格式输出）才回落下面这组静态通用项。这样"可选项"永远贴合模型实际产出。
      optionsFrom: "node_pm_result",
      options: [a.t("MVP 快速验证（先跑通核心闭环）"), a.t("完整功能（覆盖主要场景）"), a.t("技术预研（验证可行性/难点）")],
      requireComment: !1,
      approveLabel: a.t("按此方向继续"),
      rejectLabel: a.t("打回产品经理重做")
    },
    next: ["dev"],
    position: { x: 640, y: 40 }
  }), p.push({ id: "dev", type: "llm_call", name: E[1].name, config: { goal: E[1].goal, roleId: "ai-dev" }, next: ["reviewer"], position: { x: 40, y: 230 } }), p.push({ id: "reviewer", type: "llm_call", name: E[2].name, config: { goal: E[2].goal, roleId: "ai-reviewer" }, next: ["qa"], position: { x: 340, y: 230 } }), p.push({ id: "qa", type: "llm_call", name: E[3].name, config: { goal: E[3].goal, roleId: "ai-qa" }, next: ["ops"], position: { x: 640, y: 230 } }), p.push({ id: "ops", type: "llm_call", name: E[4].name, config: { goal: E[4].goal, roleId: "ai-ops" }, next: ["end"], position: { x: 40, y: 420 } }), p.push({ id: "end", type: "end", name: a.t("完成"), config: {}, next: [], position: { x: 340, y: 420 } }), {
    id: ue,
    name: a.t("研发工作流"),
    description: a.t("客户需求 → AI 产品经理(选项式头脑风暴) → AI 开发(工作区写代码) → AI 代码评审(+单测) → AI 测试 → AI 运维，逐节点真执行、缺料暂停补充"),
    version: 1,
    nodes: p,
    inputs: [
      { key: "requirement", label: a.t("客户交付需求"), defaultValue: v?.requirement || "" },
      { key: "projectName", label: a.t("项目名称"), defaultValue: v?.projectName },
      { key: "devType", label: a.t("开发类型"), defaultValue: v?.devType || "" },
      { key: "techStack", label: a.t("技术栈偏好（可选）"), defaultValue: v?.techStack || "" },
      { key: "constraints", label: a.t("约束（截止/预算/合规，可选）"), defaultValue: v?.constraints || "" },
      { key: "outputDir", label: a.t("产出地址"), defaultValue: v?.outputDir || "" }
    ],
    createdAt: c,
    updatedAt: c
  };
}
const tt = { class: "rdw" }, nt = { class: "rdw-top" }, ot = { class: "rdw-title" }, at = { class: "rdw-sub" }, rt = {
  key: 0,
  class: "rdw-intake"
}, lt = { class: "rdw-field" }, st = ["disabled"], it = {
  key: 0,
  class: "ri-attachment-2",
  "aria-hidden": "true"
}, ct = ["placeholder"], dt = {
  key: 0,
  class: "rdw-attached"
}, ut = ["title"], pt = { class: "rdw-row" }, mt = { class: "rdw-field" }, vt = {
  value: "",
  disabled: ""
}, ft = ["value"], ht = { class: "rdw-field" }, _t = ["placeholder"], gt = { class: "rdw-field" }, yt = { class: "rdw-outdir" }, kt = ["placeholder"], wt = ["disabled"], Nt = {
  key: 0,
  class: "rdw-outdir-hint"
}, St = { class: "rdw-row" }, bt = { class: "rdw-field" }, Et = ["placeholder"], Vt = { class: "rdw-field" }, Dt = ["placeholder"], Tt = {
  key: 0,
  class: "rdw-err"
}, $t = ["disabled"], Bt = {
  key: 1,
  class: "rdw-history"
}, At = { class: "rdw-history-head" }, It = { class: "rdw-history-sub" }, Ct = { class: "rdw-history-list" }, Lt = { class: "rdw-history-main" }, Wt = { class: "rdw-history-name" }, Ot = {
  key: 0,
  class: "rdw-history-type"
}, Rt = { class: "rdw-history-time" }, jt = ["title"], qt = {
  key: 0,
  class: "rdw-history-req"
}, Pt = { class: "rdw-history-actions" }, Ft = ["disabled", "onClick"], Ht = ["onClick"], Kt = ["onClick"], Mt = ["onClick"], xt = { class: "rdw-run" }, Ut = { class: "rdw-run-head" }, zt = { class: "rdw-run-actions" }, Xt = ["disabled"], Yt = { class: "rdw-nodes" }, Gt = ["onClick"], Jt = { class: "rdw-node-name" }, Qt = { class: "rdw-node-badge" }, Zt = {
  key: 0,
  class: "rdw-node-elapsed"
}, en = { class: "rdw-node-metrics" }, tn = { class: "rdw-node-duty" }, nn = {
  key: 0,
  class: "rdw-node-activity"
}, on = ["data-human-confirm"], an = { class: "rdw-confirm-q" }, rn = {
  key: 0,
  class: "rdw-confirm-detail"
}, ln = {
  key: 1,
  class: "rdw-opts"
}, sn = ["value"], cn = ["placeholder"], dn = { class: "rdw-confirm-actions" }, un = {
  key: 2,
  class: "rdw-node-output"
}, pn = {
  key: 3,
  class: "rdw-node-changes"
}, le = "rdw.history.v1", se = 30, mn = /* @__PURE__ */ e.defineComponent({
  __name: "RdWorkflowWorkbenchView",
  setup(v) {
    const c = () => window.electronAPI, p = Y.useRouter(), V = Je, C = Qe.filter((t) => t.id !== "intake"), r = e.reactive({ requirement: "", projectName: "", devType: "", techStack: "", constraints: "", outputDir: "" }), L = e.ref(!1), T = e.ref(!1), d = e.ref(!1), f = e.ref([]), i = e.ref(""), m = e.ref(!1), g = e.ref(""), _ = e.ref("running"), N = e.ref("");
    function pe() {
      try {
        const t = localStorage.getItem(le), n = t ? JSON.parse(t) : [];
        return Array.isArray(n) ? n : [];
      } catch {
        return [];
      }
    }
    const b = e.ref(pe());
    let y = "";
    function H() {
      try {
        localStorage.setItem(le, JSON.stringify(b.value.slice(0, se)));
      } catch {
      }
    }
    function me(t) {
      b.value = [t, ...b.value].slice(0, se), H();
    }
    function D(t, n) {
      if (!t) return;
      const o = b.value.findIndex((l) => l.id === t);
      o >= 0 && (b.value[o] = { ...b.value[o], ...n }, H());
    }
    async function J(t) {
      if (t)
        try {
          const n = await c().solution?.openPath?.(t);
          n && n.ok === !1 && (i.value = n.error || a.t("打不开目录（可能还没生成，或已被移动）"));
        } catch (n) {
          i.value = n?.message || String(n);
        }
    }
    function ve(t) {
      J(t.projectDir);
    }
    function fe(t) {
      r.requirement = t.requirement || "", r.projectName = t.projectName || "", r.outputDir = t.outputDir || "", r.techStack = t.techStack || "", r.constraints = t.constraints || "", r.devType = t.devTypeId || "", i.value = "";
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
      }
    }
    function he(t) {
      b.value = b.value.filter((n) => n.id !== t), H();
    }
    function _e(t) {
      try {
        return new Date(t).toLocaleString();
      } catch {
        return "";
      }
    }
    function ge(t) {
      return { running: a.t("执行中"), paused: a.t("等待补充"), done: a.t("已完成"), failed: a.t("失败"), cancelled: a.t("已取消") }[t] || t;
    }
    const s = e.reactive({}), q = () => ({ status: "pending", output: "", files: [] });
    for (const t of C) s[t.id] = q();
    s.brainstorm = q();
    const h = (t) => s[t] || q(), W = e.reactive(/* @__PURE__ */ new Set()), ye = (t) => {
      W.has(t) ? W.delete(t) : W.add(t);
    }, Q = e.ref(0);
    let O = null;
    function Z() {
      O || (O = setInterval(() => {
        Q.value++;
      }, 1e3));
    }
    function ke() {
      O && (clearInterval(O), O = null);
    }
    function we(t) {
      const n = s[t]?.startedAt;
      return n ? (Q.value, Math.max(0, Math.floor((Date.now() - n) / 1e3))) : 0;
    }
    const ee = e.ref(0);
    function K() {
      ee.value = Date.now();
    }
    const P = G.useStepWatchdog({
      running: () => m.value && _.value === "running",
      startedAt: () => {
        let t = 0;
        for (const n of Object.values(s)) n.status === "running" && n.startedAt && n.startedAt > t && (t = n.startedAt);
        return t || null;
      },
      kind: "llm",
      lastProgressAt: () => ee.value || null
    });
    function Ne(t) {
      return (s[t]?.files || []).reduce((n, o) => o.action === "write" ? n + (o.content ? o.content.split(`
`).length : 0) : o.action === "patch" ? n + (o.newString ? o.newString.split(`
`).length : o.patchText ? o.patchText.split(`
`).filter((l) => l.startsWith("+")).length : 0) : n, 0);
    }
    const u = e.ref(null);
    let R = "", M = null, x = null, U = null;
    const Se = e.computed(() => {
      const t = V.find((n) => n.id === r.devType);
      return t?.stackHint ? a.t("留空则默认：") + t.stackHint : a.t("如 React + TS / FastAPI …");
    }), be = e.computed(() => ({ running: a.t("执行中"), paused: a.t("等待补充"), done: a.t("已完成"), failed: a.t("失败"), cancelled: a.t("已取消") })[_.value]);
    function Ee(t) {
      return { pending: a.t("待执行"), running: a.t("执行中"), paused: a.t("等待补充"), done: a.t("已完成"), failed: a.t("失败") }[t];
    }
    async function Ve() {
      if (!T.value) {
        T.value = !0;
        try {
          const t = await c().rdParseDoc();
          if (t?.canceled) return;
          if (!t?.ok) {
            i.value = t?.message || a.t("解析失败");
            return;
          }
          f.value = (t.files || []).map((n) => ({ name: n.name, reason: n.reason })), t.combinedText && (r.requirement = (r.requirement.trim() ? r.requirement.trim() + `

` : "") + t.combinedText), i.value = "";
        } catch (t) {
          i.value = t?.message || String(t);
        } finally {
          T.value = !1;
        }
      }
    }
    async function te() {
      if (!d.value) {
        d.value = !0;
        try {
          const t = await c().rdPickOutputDir?.();
          if (t?.canceled) return;
          if (!t?.ok) {
            i.value = t?.message || a.t("选择产出地址失败");
            return;
          }
          t.dir && (r.outputDir = t.dir, i.value = "");
        } catch (t) {
          i.value = t?.message || String(t);
        } finally {
          d.value = !1;
        }
      }
    }
    async function De() {
      if (i.value = "", !r.requirement.trim()) {
        i.value = a.t("请填写需求描述");
        return;
      }
      if (!r.devType) {
        i.value = a.t("请选择开发类型");
        return;
      }
      if (!r.outputDir.trim()) {
        i.value = a.t("请先选择产出地址（代码落地目录），否则无法开始研发");
        return;
      }
      L.value = !0;
      try {
        const t = V.find((w) => w.id === r.devType)?.label || r.devType, n = r.projectName.trim() || "rd-project", o = r.outputDir.trim(), l = et({
          requirement: r.requirement.trim(),
          projectName: n,
          devType: a.t(t),
          techStack: r.techStack.trim() || V.find((w) => w.id === r.devType)?.stackHint || "",
          constraints: r.constraints.trim() || a.t("（无特殊约束）"),
          outputDir: o
        });
        await c().saveWorkflow(l), Te(), m.value = !0, _.value = "running", N.value = `${o}/${n}`, y = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, me({
          id: y,
          projectName: n,
          outputDir: o,
          projectDir: N.value,
          requirement: r.requirement.trim().slice(0, 400),
          devTypeId: r.devType,
          devTypeLabel: a.t(t),
          techStack: r.techStack.trim(),
          constraints: r.constraints.trim(),
          startedAt: Date.now(),
          status: "running"
        }), s.pm && (s.pm.status = "running"), R = "pm";
        const S = await c().runWorkflow({ workflowId: ue, input: {
          requirement: r.requirement.trim(),
          projectName: n,
          devType: a.t(t),
          techStack: r.techStack.trim() || V.find((w) => w.id === r.devType)?.stackHint || "",
          constraints: r.constraints.trim() || a.t("（无特殊约束）"),
          outputDir: o
        } }), k = S?.runId || S?.id || $.find((w) => w.runId)?.runId || "";
        if (k) {
          D(y, { id: k }), y = k, g.value = k;
          const w = $;
          $ = [];
          for (const A of w)
            (!A.runId || A.runId === k) && ne(A);
        }
      } catch (t) {
        i.value = t?.message || String(t), m.value = !1, _.value = "failed", y && D(y, { status: "failed" }), F();
      } finally {
        L.value = !1;
      }
    }
    function Te() {
      F(), M = c().onWorkflowEvent((t) => Be(t)), x = c().onStreamToolUse((t) => Ae(t)), U = c().onStreamSubagentProgress?.((t) => $e(t)) || null, Z();
    }
    function F() {
      try {
        M?.();
      } catch {
      }
      try {
        x?.();
      } catch {
      }
      try {
        U?.();
      } catch {
      }
      M = x = U = null, ke();
    }
    function $e(t) {
      if (t?.runId && g.value && t.runId !== g.value) return;
      const n = s[t?.nodeId || R];
      if (!n || n.status !== "running") return;
      K();
      const o = t?.kind === "tool_use" ? a.t("调用工具") : t?.kind === "nested_summary" ? a.t("小结") : a.t("思考"), l = String(t?.toolName || t?.preview || "").slice(0, 80);
      n.activity = l ? `${o}：${l}` : o;
    }
    let $ = [];
    function Be(t) {
      if (t) {
        if (!g.value) {
          $.push(t), $.length > 800 && $.shift();
          return;
        }
        t.runId && t.runId !== g.value || ne(t);
      }
    }
    function ne(t) {
      const n = t.nodeId;
      switch (K(), t.kind) {
        case "run:started":
          _.value = "running";
          break;
        case "node:entered":
          n && s[n] && (s[n].status = "running", s[n].startedAt = Date.now(), s[n].activity = a.t("启动中…"), R = n, Z());
          break;
        case "node:token":
          n && s[n] && (s[n].output += String(t.delta ?? t.result ?? ""), s[n].activity = a.t("生成中…"));
          break;
        case "node:completed":
          n && s[n] && (s[n].status = "done", s[n].activity = void 0, t.result != null && (s[n].output = String(t.result)));
          break;
        case "node:failed":
          n && s[n] && (s[n].status = "failed", s[n].activity = void 0, s[n].output = String(t.error || a.t("执行失败")));
          break;
        case "node:rerun":
          n && s[n] && (s[n].status = "running");
          break;
        case "node:waiting_human":
          _.value = "paused", D(y, { status: "paused" }), n && s[n] && (s[n].status = "paused"), u.value = {
            nodeId: n || "brainstorm",
            question: t.question || a.t("需要你确认/补充后继续"),
            detail: t.confirmationDetail,
            options: t.confirmationOptions || [],
            selected: "",
            reply: "",
            approveLabel: t.confirmationApproveLabel,
            rejectLabel: t.confirmationRejectLabel
          };
          break;
        case "human-confirm-resolved":
          n && u.value?.nodeId === n && (u.value = null, _.value = "running", D(y, { status: "running" }), s[n]?.status === "paused" && (s[n].status = "running"));
          break;
        case "run:completed":
          _.value = "done", D(y, { status: "done" }), Ie();
          break;
        case "run:failed":
          _.value = "failed", D(y, { status: "failed" });
          break;
        case "run:cancelled":
          _.value = "cancelled", D(y, { status: "cancelled" });
          break;
      }
    }
    function Ae(t) {
      if (!t || typeof t.sessionId != "string" || !t.sessionId.startsWith("wf_") || t.runId && g.value && t.runId !== g.value) return;
      K();
      const n = t.toolInput || {}, o = n.path || n.file_path || n.filePath;
      if (!o) return;
      const l = s[t.nodeId || R];
      if (!l) return;
      const S = String(t.toolName || ""), k = String(o).split("/").pop();
      /write_file|create_file|write/i.test(S) ? (l.files.push({ path: o, action: "write", content: n.content ?? n.text }), l.activity = a.t("写入 {p0}", { p0: k })) : /patch|edit|apply_patch|replace/i.test(S) ? (l.files.push({ path: o, action: "patch", patchText: n.patch, oldString: n.old_string ?? n.oldString, newString: n.new_string ?? n.newString }), l.activity = a.t("修改 {p0}", { p0: k })) : /read_file|read/i.test(S) && (l.activity = a.t("读取 {p0}", { p0: k })), !N.value && typeof o == "string" && o.startsWith("/");
    }
    async function oe(t) {
      const n = u.value;
      if (!(!n || !g.value))
        try {
          await c().respondWorkflowHumanConfirm({ runId: g.value, nodeId: n.nodeId, approved: t, reply: n.reply || void 0, selectedOption: n.selected || void 0 }), _.value = "running", D(y, { status: "running" }), s[n.nodeId] && (s[n.nodeId].status = t ? "done" : "running"), u.value = null;
        } catch (o) {
          i.value = o?.message || String(o);
        }
    }
    async function Ie() {
      try {
        const t = await c().getRunArtifacts?.({ runId: g.value }), n = t?.deliverables?.[0]?.path || t?.changes?.[0]?.target;
        n && !N.value && (N.value = n);
      } catch {
      }
    }
    function Ce() {
      J(N.value);
    }
    const B = e.ref("");
    async function ae(t, n) {
      const o = (t || "").trim();
      if (!(!o || B.value)) {
        B.value = o, i.value = "";
        try {
          const l = c(), k = (await l.workFolder?.register?.({ name: n || "rd-project", path: o }))?.folder?.id, w = await l.conversation?.create?.({ kind: "single", members: ["ai-dev"], title: a.t("微调：{p0}", { p0: n || "rd-project" }) }), A = w?.id;
          if (!A) {
            i.value = a.t("进入对话失败，请重试");
            return;
          }
          if (k)
            try {
              await l.conversation?.setWorkFolder?.(A, k);
            } catch {
            }
          w?.navigateTo ? p.push(w.navigateTo) : p.push({ path: "/conversations", query: { id: A } });
        } catch (l) {
          i.value = l?.message || String(l);
        } finally {
          B.value = "";
        }
      }
    }
    async function Le(t) {
      t && X.openPath(t, !0);
    }
    async function re() {
      if (g.value)
        try {
          if (!c()?.cancelWorkflowRun) throw new Error(a.t("取消接口不可用"));
          const t = await c().cancelWorkflowRun({ runId: g.value });
          if (!t?.ok || t.accepted === !1) throw new Error(t?.error || a.t("运行已结束，未执行取消"));
          _.value = "cancelled", u.value = null, D(y, { status: "cancelled" });
        } catch (t) {
          i.value = t?.message || String(t);
        }
    }
    function We() {
      F(), m.value = !1, g.value = "", R = "", u.value = null, N.value = "", f.value = [], $ = [], y = "";
      for (const t of Object.keys(s)) s[t] = q();
    }
    return e.onBeforeUnmount(F), (t, n) => (e.openBlock(), e.createElementBlock("div", tt, [
      e.createElementVNode("header", nt, [
        e.createVNode(Oe),
        e.createElementVNode(
          "div",
          ot,
          e.toDisplayString(t.$t("研发工作流")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "div",
          at,
          e.toDisplayString(t.$t("客户需求 → AI 产品经理 → 开发 → 评审 → 测试 → 运维，逐节点真执行")),
          1
          /* TEXT */
        )
      ]),
      e.createCommentVNode(" ① 客户交付需求（表单，缺必填不放行） "),
      m.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("section", rt, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(t.$t("客户交付需求")),
          1
          /* TEXT */
        ),
        e.createElementVNode("label", lt, [
          e.createElementVNode("span", null, [
            e.createTextVNode(
              e.toDisplayString(t.$t("需求描述")) + " ",
              1
              /* TEXT */
            ),
            n[12] || (n[12] = e.createElementVNode(
              "em",
              null,
              "*",
              -1
              /* CACHED */
            )),
            e.createElementVNode("button", {
              type: "button",
              class: "rdw-upload",
              disabled: T.value,
              onClick: Ve
            }, [
              T.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("i", it)),
              e.createTextVNode(
                " " + e.toDisplayString(T.value ? t.$t("解析中…") : t.$t("上传文档解析")),
                1
                /* TEXT */
              )
            ], 8, st)
          ]),
          e.withDirectives(e.createElementVNode("textarea", {
            "onUpdate:modelValue": n[0] || (n[0] = (o) => r.requirement = o),
            rows: "5",
            placeholder: t.$t("把你要做的产品/功能讲清楚：目标用户、要解决的问题、核心功能…（也可上传需求文档，自动解析填入）")
          }, null, 8, ct), [
            [e.vModelText, r.requirement]
          ]),
          f.value.length ? (e.openBlock(), e.createElementBlock("div", dt, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(f.value, (o, l) => (e.openBlock(), e.createElementBlock("span", {
                key: l,
                class: e.normalizeClass(["rdw-chip", { warn: !!o.reason }]),
                title: o.reason || ""
              }, [
                n[13] || (n[13] = e.createElementVNode(
                  "i",
                  {
                    class: "ri-file-text-line",
                    "aria-hidden": "true"
                  },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  " " + e.toDisplayString(o.name),
                  1
                  /* TEXT */
                ),
                o.reason ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      " · " + e.toDisplayString(o.reason),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, ut))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("div", pt, [
          e.createElementVNode("label", mt, [
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(t.$t("开发类型")) + " ",
                1
                /* TEXT */
              ),
              n[14] || (n[14] = e.createElementVNode(
                "em",
                null,
                "*",
                -1
                /* CACHED */
              ))
            ]),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": n[1] || (n[1] = (o) => r.devType = o)
              },
              [
                e.createElementVNode(
                  "option",
                  vt,
                  e.toDisplayString(t.$t("请选择")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(V), (o) => (e.openBlock(), e.createElementBlock("option", {
                    key: o.id,
                    value: o.id
                  }, e.toDisplayString(t.$t(o.label)), 9, ft))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, r.devType]
            ])
          ]),
          e.createElementVNode("label", ht, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("项目名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": n[2] || (n[2] = (o) => r.projectName = o),
              placeholder: t.$t("如 my-app（代码将落在产出地址下的此子目录）")
            }, null, 8, _t), [
              [e.vModelText, r.projectName]
            ])
          ])
        ]),
        e.createElementVNode("label", gt, [
          e.createElementVNode("span", null, [
            e.createTextVNode(
              e.toDisplayString(t.$t("产出地址")) + " ",
              1
              /* TEXT */
            ),
            n[15] || (n[15] = e.createElementVNode(
              "em",
              null,
              "*",
              -1
              /* CACHED */
            ))
          ]),
          e.createElementVNode("div", yt, [
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": n[3] || (n[3] = (o) => r.outputDir = o),
              readonly: "",
              placeholder: t.$t("必填：选择代码落地的文件夹，全部产出写入这里"),
              onClick: te
            }, null, 8, kt), [
              [e.vModelText, r.outputDir]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "rdw-btn ghost",
              disabled: d.value,
              onClick: te
            }, e.toDisplayString(d.value ? t.$t("选择中…") : t.$t("选择文件夹")), 9, wt)
          ]),
          r.outputDir ? (e.openBlock(), e.createElementBlock(
            "small",
            Nt,
            e.toDisplayString(t.$t("代码将写入 {p0}", { p0: `${r.outputDir}/${r.projectName.trim() || "rd-project"}/` })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("div", St, [
          e.createElementVNode("label", bt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("技术栈偏好（可选）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": n[4] || (n[4] = (o) => r.techStack = o),
              placeholder: Se.value
            }, null, 8, Et), [
              [e.vModelText, r.techStack]
            ])
          ]),
          e.createElementVNode("label", Vt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("约束（截止/预算/合规，可选）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": n[5] || (n[5] = (o) => r.constraints = o),
              placeholder: t.$t("如 两周内 / 需过等保 / 预算有限")
            }, null, 8, Dt), [
              [e.vModelText, r.constraints]
            ])
          ])
        ]),
        i.value ? (e.openBlock(), e.createElementBlock(
          "p",
          Tt,
          e.toDisplayString(i.value),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("button", {
          class: "rdw-start",
          disabled: L.value,
          onClick: De
        }, e.toDisplayString(L.value ? t.$t("启动中…") : t.$t("开始研发")), 9, $t)
      ])),
      e.createCommentVNode(" 产出历史：每跑一版就留一条记录 "),
      !m.value && b.value.length ? (e.openBlock(), e.createElementBlock("section", Bt, [
        e.createElementVNode("div", At, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(t.$t("产出历史")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            It,
            e.toDisplayString(t.$t("每跑一版都会留一条记录，可打开产出目录或复用需求再来一版")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("ul", Ct, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(b.value, (o) => (e.openBlock(), e.createElementBlock("li", {
              key: o.id,
              class: "rdw-history-item"
            }, [
              e.createElementVNode("div", Lt, [
                e.createElementVNode(
                  "span",
                  Wt,
                  e.toDisplayString(o.projectName || t.$t("研发工作流")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["rdw-history-badge", o.status])
                  },
                  e.toDisplayString(ge(o.status)),
                  3
                  /* TEXT, CLASS */
                ),
                o.devTypeLabel ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Ot,
                  e.toDisplayString(o.devTypeLabel),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                e.createElementVNode(
                  "span",
                  Rt,
                  e.toDisplayString(_e(o.startedAt)),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", {
                class: "rdw-history-dir",
                title: o.projectDir
              }, [
                n[16] || (n[16] = e.createElementVNode(
                  "i",
                  {
                    class: "ri-folder-line",
                    "aria-hidden": "true"
                  },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  " " + e.toDisplayString(o.projectDir),
                  1
                  /* TEXT */
                )
              ], 8, jt),
              o.requirement ? (e.openBlock(), e.createElementBlock(
                "div",
                qt,
                e.toDisplayString(o.requirement),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", Pt, [
                e.createElementVNode("button", {
                  class: "rdw-btn primary",
                  disabled: B.value === o.projectDir,
                  onClick: (l) => ae(o.projectDir, o.projectName)
                }, e.toDisplayString(B.value === o.projectDir ? t.$t("进入中…") : t.$t("去对话微调")), 9, Ft),
                e.createElementVNode("button", {
                  class: "rdw-btn ghost",
                  onClick: (l) => ve(o)
                }, e.toDisplayString(t.$t("打开目录")), 9, Ht),
                e.createElementVNode("button", {
                  class: "rdw-btn ghost",
                  onClick: (l) => fe(o)
                }, e.toDisplayString(t.$t("用此需求再来一版")), 9, Kt),
                e.createElementVNode("button", {
                  class: "rdw-btn ghost rdw-history-del",
                  onClick: (l) => he(o.id)
                }, e.toDisplayString(t.$t("删除")), 9, Mt)
              ])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 运行态：6 节点流水线 "),
          e.createElementVNode("section", xt, [
            e.createElementVNode("div", Ut, [
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(r.projectName || t.$t("研发工作流")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["rdw-run-status", _.value])
                  },
                  e.toDisplayString(be.value),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              e.createElementVNode("div", zt, [
                N.value && h("dev").status === "done" ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  class: "rdw-btn primary",
                  disabled: B.value === N.value,
                  onClick: n[6] || (n[6] = (o) => ae(N.value, r.projectName.trim() || "rd-project"))
                }, e.toDisplayString(B.value === N.value ? t.$t("进入中…") : t.$t("去对话微调")), 9, Xt)) : e.createCommentVNode("v-if", !0),
                N.value ? (e.openBlock(), e.createElementBlock(
                  "button",
                  {
                    key: 1,
                    class: "rdw-btn ghost",
                    onClick: Ce
                  },
                  e.toDisplayString(t.$t("打开项目目录")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                _.value === "running" || _.value === "paused" ? (e.openBlock(), e.createElementBlock(
                  "button",
                  {
                    key: 2,
                    class: "rdw-btn ghost",
                    onClick: re
                  },
                  e.toDisplayString(t.$t("取消")),
                  1
                  /* TEXT */
                )) : (e.openBlock(), e.createElementBlock(
                  "button",
                  {
                    key: 3,
                    class: "rdw-btn ghost",
                    onClick: We
                  },
                  e.toDisplayString(t.$t("新建一次研发")),
                  1
                  /* TEXT */
                ))
              ])
            ]),
            e.createCommentVNode(" 某个节点很久没有任何动静（token / 工具 / 子代理进度都没有）：如实说「可能已超时」 "),
            e.unref(P).suspect.value ? (e.openBlock(), e.createBlock(Re, {
              key: 0,
              state: "suspect",
              "elapsed-sec": e.unref(P).elapsedSec.value,
              "since-heartbeat-sec": e.unref(P).sinceHeartbeatSec.value,
              "retry-label": t.$t("中止运行"),
              onRetry: re,
              onKeepWaiting: n[7] || (n[7] = (o) => e.unref(P).keepWaiting())
            }, null, 8, ["elapsed-sec", "since-heartbeat-sec", "retry-label"])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", Yt, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(C), (o) => (e.openBlock(), e.createElementBlock(
                  "article",
                  {
                    key: o.id,
                    class: e.normalizeClass(["rdw-node", h(o.id).status])
                  },
                  [
                    e.createElementVNode("div", {
                      class: "rdw-node-head",
                      onClick: (l) => ye(o.id)
                    }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["rdw-dot", h(o.id).status])
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createElementVNode(
                        "span",
                        Jt,
                        e.toDisplayString(t.$t(o.name)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        Qt,
                        e.toDisplayString(Ee(h(o.id).status)),
                        1
                        /* TEXT */
                      ),
                      h(o.id).status === "running" ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Zt,
                        "⏱ " + e.toDisplayString(we(o.id)) + "s",
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("span", en, [
                        h(o.id).output.length ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createTextVNode(
                              e.toDisplayString(h(o.id).output.length) + " " + e.toDisplayString(t.$t("字")),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0),
                        h(o.id).files.length ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 1 },
                          [
                            n[17] || (n[17] = e.createTextVNode(
                              " · ",
                              -1
                              /* CACHED */
                            )),
                            n[18] || (n[18] = e.createElementVNode(
                              "i",
                              {
                                class: "ri-file-text-line",
                                "aria-hidden": "true"
                              },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              " " + e.toDisplayString(h(o.id).files.length) + " · +" + e.toDisplayString(Ne(o.id)) + " " + e.toDisplayString(t.$t("行")),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])
                    ], 8, Gt),
                    e.createElementVNode(
                      "div",
                      tn,
                      e.toDisplayString(t.$t(o.duty)),
                      1
                      /* TEXT */
                    ),
                    e.createCommentVNode(" running 空窗期实时活动（填补 agent 首字延迟） "),
                    h(o.id).status === "running" ? (e.openBlock(), e.createElementBlock("div", nn, [
                      n[19] || (n[19] = e.createElementVNode(
                        "span",
                        { class: "rdw-spin" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(h(o.id).activity || t.$t("执行中…")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createCommentVNode(" 人在环：该节点等待用户拍板/补料 "),
                    h(o.id).status === "paused" && u.value && u.value.nodeId === o.id ? (e.openBlock(), e.createElementBlock("div", {
                      key: 1,
                      class: "rdw-confirm",
                      "data-human-confirm": `${g.value}:${u.value.nodeId}`
                    }, [
                      e.createElementVNode(
                        "div",
                        an,
                        e.toDisplayString(u.value.question),
                        1
                        /* TEXT */
                      ),
                      u.value.detail ? (e.openBlock(), e.createElementBlock(
                        "div",
                        rn,
                        e.toDisplayString(u.value.detail),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      u.value.options?.length ? (e.openBlock(), e.createElementBlock("div", ln, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(u.value.options, (l, S) => (e.openBlock(), e.createElementBlock(
                            "label",
                            {
                              key: S,
                              class: e.normalizeClass(["rdw-opt", { on: u.value.selected === l }])
                            },
                            [
                              e.withDirectives(e.createElementVNode("input", {
                                type: "radio",
                                value: l,
                                "onUpdate:modelValue": n[8] || (n[8] = (k) => u.value.selected = k)
                              }, null, 8, sn), [
                                [e.vModelRadio, u.value.selected]
                              ]),
                              e.createTextVNode(
                                " " + e.toDisplayString(l),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          ))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])) : e.createCommentVNode("v-if", !0),
                      e.withDirectives(e.createElementVNode("textarea", {
                        "onUpdate:modelValue": n[9] || (n[9] = (l) => u.value.reply = l),
                        rows: "2",
                        placeholder: t.$t("补充说明 / 自填你的方向（可选）")
                      }, null, 8, cn), [
                        [e.vModelText, u.value.reply]
                      ]),
                      e.createElementVNode("div", dn, [
                        e.createElementVNode(
                          "button",
                          {
                            class: "rdw-btn primary",
                            onClick: n[10] || (n[10] = (l) => oe(!0))
                          },
                          e.toDisplayString(u.value.approveLabel || t.$t("继续")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "button",
                          {
                            class: "rdw-btn ghost",
                            onClick: n[11] || (n[11] = (l) => oe(!1))
                          },
                          e.toDisplayString(u.value.rejectLabel || t.$t("打回重做")),
                          1
                          /* TEXT */
                        )
                      ])
                    ], 8, on)) : e.createCommentVNode("v-if", !0),
                    e.createCommentVNode(" 实时活动输出 "),
                    !W.has(o.id) && h(o.id).output ? (e.openBlock(), e.createElementBlock(
                      "div",
                      un,
                      e.toDisplayString(h(o.id).output),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createCommentVNode(" 编辑了哪些文件（Codex 式 diff） "),
                    !W.has(o.id) && h(o.id).files.length ? (e.openBlock(), e.createElementBlock("div", pn, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(h(o.id).files, (l, S) => (e.openBlock(), e.createBlock(Ge, {
                          key: S,
                          change: l,
                          onOpen: Le
                        }, null, 8, ["change"]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]));
  }
}), vn = /* @__PURE__ */ de(mn, [["__scopeId", "data-v-f5a60a88"]]);
export {
  vn as default
};
