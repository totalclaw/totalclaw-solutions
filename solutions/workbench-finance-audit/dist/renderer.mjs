const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const ye = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!ye) throw new Error("宿主模块未就绪：npm:vue-router");
ye.default;
const ue = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!ue) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
ue.default;
const ie = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/financeAudit/catalog/index.ts"];
if (!ie) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/financeAudit/catalog/index.ts");
ie.default;
const ge = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/financeAudit/regions.ts"];
if (!ge) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/financeAudit/regions.ts");
ge.default;
const Nt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!Nt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Kt = Nt.default, s = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!s) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
s.default;
const pe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useLocale.ts"];
if (!pe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useLocale.ts");
pe.default;
const Vt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!Vt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const se = Vt.default, Et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!Et) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const Je = Et.default, kt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/TableMapping.vue"];
if (!kt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/TableMapping.vue");
const Ze = kt.default, Q = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!Q) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
Q.default;
const Xe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!Xe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
Xe.default;
function vt() {
  return window.electronAPI?.workbenches?.financeAudit || null;
}
async function Y(c, _) {
  const t = vt();
  if (!t?.invoke) throw new Error(s.t("当前环境不支持财会审计工作台"));
  return t.invoke(c, Xe.toPlain(_ ?? {}));
}
function gt(c) {
  return vt()?.onEvent?.(c) ?? (() => {
  });
}
function Z(c) {
  return c ? s.t(c.key, c.params) : "";
}
const Se = ["setup", "upload", "validate", "analyze", "draft", "signoff", "archive"];
function ft() {
  return [
    { key: "setup", title: s.t("选择项目与模式"), hint: s.t("期间、主体、场景模式与本次输出语言") },
    { key: "upload", title: s.t("上传数据"), hint: s.t("按模块列出必需与可选的数据，自动识别列后由你确认") },
    { key: "validate", title: s.t("校验"), hint: s.t("借贷平衡、期间覆盖、科目映射等检查，分阻断项与提醒项") },
    { key: "analyze", title: s.t("分析与计算"), hint: s.t("规则引擎算数，模型只写说明，引用的数字逐条回原文核对") },
    { key: "draft", title: s.t("生成底稿"), hint: s.t("预览关键数字与检查项，生成带「草稿—待签核」水印的文件") },
    { key: "signoff", title: s.t("人工签核"), hint: s.t("编制 → 复核 → 批准，提醒项逐条确认已知悉") },
    { key: "archive", title: s.t("归档与转交"), hint: s.t("签核后复制文件、签核页与哈希清单到项目归档区") }
  ];
}
function At(c) {
  if (!c) return { state: "todo" };
  const _ = { startedAt: c.startedAt, finishedAt: c.finishedAt, progressAt: c.progressAt, kind: c.kind, estimateSec: c.estimateSec };
  switch (c.status) {
    case "running":
      return { ..._, state: "running" };
    case "done":
      return { ..._, state: "done", summary: Z(c.summary) || void 0 };
    case "failed":
    case "blocked":
      return { ..._, state: "failed", error: Z(c.error) || s.t("失败") };
    case "interrupted":
      return { ..._, state: "failed", error: s.t("已中断：应用重启前这一步还在运行，请重新运行") };
    default:
      return { ..._, state: "todo", summary: Z(c.summary) || void 0 };
  }
}
const ve = { prepare: s.i18nKey("编制"), review: s.i18nKey("复核"), approve: s.i18nKey("批准") };
function we() {
  const c = pe.currentLocale();
  return c === "ar" ? "ar-u-nu-latn" : c;
}
function Te(c) {
  return c == null || !Number.isFinite(c) ? "-" : new Intl.NumberFormat(we(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(c / 100);
}
function Ft(c) {
  return c == null || !Number.isFinite(c) ? "-" : new Intl.NumberFormat(we(), { style: "percent", maximumFractionDigits: 1 }).format(c);
}
function Le(c) {
  if (!c) return "";
  const _ = new Date(c);
  if (Number.isNaN(_.getTime())) return c;
  const t = (N) => String(N).padStart(2, "0");
  return `${_.getFullYear()}-${t(_.getMonth() + 1)}-${t(_.getDate())} ${t(_.getHours())}:${t(_.getMinutes())}`;
}
function De(c = /* @__PURE__ */ new Date()) {
  const _ = new Date(c.getFullYear(), c.getMonth() - 1, 1);
  return `${_.getFullYear()}-${String(_.getMonth() + 1).padStart(2, "0")}`;
}
const ht = { "zh-CN": s.i18nKey("中文"), "en-US": "English", ar: "العربية" };
function It(c, _) {
  const N = {
    journal: {
      yonyou: s.i18nKey("用友：总账 → 凭证 → 凭证查询，按月份筛选后引出为 Excel"),
      kingdee: s.i18nKey("金蝶：总账 → 凭证查询，选会计期间后引出"),
      sap: s.i18nKey("SAP：FBL3N / FAGLL03 按过账期间导出总账行项目"),
      oracle: s.i18nKey("Oracle：General Ledger → Journals → Export 按期间导出"),
      chanjet: s.i18nKey("畅捷通 T+：总账 → 凭证查询 → 导出"),
      other: s.i18nKey("从财务软件导出本期全部凭证明细（日期、凭证号、科目、摘要、借贷金额）")
    },
    tb: {
      yonyou: s.i18nKey("用友：总账 → 账表 → 科目余额表，含期初、本期发生、期末，引出为 Excel"),
      kingdee: s.i18nKey("金蝶：总账 → 科目余额表，勾选显示期初与本期发生后引出"),
      sap: s.i18nKey("SAP：F.01 / FAGLB03 导出科目余额（期初、借贷发生、期末）"),
      oracle: s.i18nKey("Oracle：Trial Balance 报表按期间导出"),
      chanjet: s.i18nKey("畅捷通 T+：总账 → 科目余额表 → 导出"),
      other: s.i18nKey("导出科目余额表：科目编码、科目名称、期初 / 本期 / 期末借贷方")
    },
    bank: { other: s.i18nKey("企业网银 → 账户明细查询，选本月后导出 Excel 或 CSV；多个账户可以分别导出") },
    subledger: { other: s.i18nKey("应收、应付、固定资产或存货模块导出明细，带上与总账一致的键列（单号、资产编号或往来单位）") }
  }[c];
  return N ? s.t(N[_] || N.other || "") : "";
}
const $t = { xlsx: "Excel", docx: "Word", pdf: "PDF", pptx: "PowerPoint", md: "Markdown", je_import_xlsx: "Excel (JE)" }, Pt = {
  skill: s.i18nKey("技能"),
  "m365-skill": s.i18nKey("技能"),
  knowledge: s.i18nKey("知识与规则文档"),
  reference: s.i18nKey("知识与规则文档"),
  convention: s.i18nKey("知识与规则文档"),
  "scenario-config": s.i18nKey("知识与规则文档"),
  scenario: s.i18nKey("知识与规则文档"),
  command: s.i18nKey("快捷命令"),
  "m365-command": s.i18nKey("快捷命令"),
  agent: s.i18nKey("智能体与子代理"),
  subagent: s.i18nKey("智能体与子代理"),
  connector: s.i18nKey("数据连接器"),
  "mcp-endpoint": s.i18nKey("数据连接器"),
  "cookbook-service": s.i18nKey("数据连接器")
};
function Ot(c, _) {
  const t = /* @__PURE__ */ new Map();
  for (const N of c) {
    const r = Pt[N.type] || s.i18nKey("工程组件");
    t.set(r, (t.get(r) || 0) + 1);
  }
  return [...t].map(([N, r]) => `${s.t(N)} ${r}`).join(_);
}
const We = (c) => Number(c.toFixed(6));
function Ye(c, _) {
  return c.amount ? We(_ / 100) : c.percent ? We(_ * 100) : _;
}
function zt(c, _) {
  const t = Number(_);
  return _.trim() === "" || !Number.isFinite(t) || t < 0 ? null : c.amount ? Math.round(t * 100) : c.percent ? We(t / 100) : t;
}
function _t(c, _) {
  return c.amount ? Te(_) : new Intl.NumberFormat(we(), { maximumFractionDigits: c.percent ? 2 : 4 }).format(Ye(c, _));
}
function Ge(c, _) {
  return c.percent ? "%" : c.amount ? !_ || _ === "CNY" ? s.t("元") : _ : "";
}
function He(c) {
  return [c.basis ? s.t("依据：{p0}", { p0: s.t(c.basis) }) : "", c.section ? s.t(c.section) : ""].filter(Boolean).join(" · ");
}
function ze(c) {
  return c.original ? s.t(c.original) : "";
}
function Bt(c) {
  return c.label ? s.t(c.label) : ze(c);
}
const Ae = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!Ae) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
Ae.default;
const Mt = { class: "fau-drop__text" }, jt = ["disabled"], Rt = /* @__PURE__ */ e.defineComponent({
  __name: "FauFileDrop",
  props: {
    label: {},
    hint: { default: "" },
    kind: { default: "" },
    multi: { type: Boolean, default: !1 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["picked"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = e.ref(!1), n = /\.(pdf|ofd|docx|xlsx|xls|png|jpe?g)$/i, i = /\.(xlsx|xls|xlsm|csv|sta|mt940|940|txt|xml|053)$/i;
    async function a() {
      try {
        const E = await Y("data.pick", { kind: t.kind, multi: t.multi });
        E?.paths?.length && N("picked", t.multi ? E.paths : E.paths.slice(0, 1));
      } catch (E) {
        Ae.useNotificationStore().error(Q.errorMessage(E));
      }
    }
    function m(E) {
      if (r.value = !1, t.disabled) return;
      const u = Q.droppedPaths(E, t.kind === "evidence" ? n : t.kind === "bank" ? i : Q.EXCEL_RE);
      u.length && N("picked", t.multi ? u : u.slice(0, 1));
    }
    return (E, u) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        class: e.normalizeClass(["fau-drop", { over: r.value, disabled: c.disabled }]),
        role: "button",
        tabindex: "0",
        onClick: u[0] || (u[0] = (L) => !c.disabled && a()),
        onKeydown: u[1] || (u[1] = e.withKeys(e.withModifiers((L) => !c.disabled && a(), ["prevent"]), ["enter"])),
        onDragover: u[2] || (u[2] = e.withModifiers((L) => !c.disabled && (r.value = !0), ["prevent"])),
        onDragleave: u[3] || (u[3] = e.withModifiers((L) => r.value = !1, ["prevent"])),
        onDrop: e.withModifiers(m, ["prevent"])
      },
      [
        e.createElementVNode(
          "i",
          {
            class: e.normalizeClass(c.kind === "evidence" ? "ri-file-text-line" : "ri-file-excel-2-line")
          },
          null,
          2
          /* CLASS */
        ),
        e.createElementVNode("div", Mt, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(c.label),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(c.hint || (c.multi ? E.$t("把文件拖到这里，或点击选择（可多选）") : E.$t("把文件拖到这里，或点击选择"))),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn ghost sm",
          disabled: c.disabled,
          onClick: e.withModifiers(a, ["stop"])
        }, [
          u[4] || (u[4] = e.createElementVNode(
            "i",
            { class: "ri-folder-open-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(E.$t("选择文件")),
            1
            /* TEXT */
          )
        ], 8, jt)
      ],
      34
      /* CLASS, NEED_HYDRATION */
    ));
  }
}), ae = (c, _) => {
  const t = c.__vccOpts || c;
  for (const [N, r] of _)
    t[N] = r;
  return t;
}, bt = /* @__PURE__ */ ae(Rt, [["__scopeId", "data-v-d1bc3c9f"]]), qt = {
  dir: "ltr",
  class: "fau-num"
}, l = /* @__PURE__ */ e.defineComponent({
  __name: "FauNum",
  props: {
    cents: {},
    ratio: {},
    value: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.cents !== void 0 ? Te(_.cents) : _.ratio !== void 0 ? Ft(_.ratio) : _.value === null || _.value === void 0 || _.value === "" ? "-" : String(_.value));
    return (N, r) => (e.openBlock(), e.createElementBlock("bdi", qt, [
      e.renderSlot(N.$slots, "default", {}, () => [
        e.createTextVNode(
          e.toDisplayString(t.value),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), Ut = ["title"], Wt = { class: "ss-muted" }, Yt = ["aria-label"], Gt = ["aria-checked", "disabled", "data-test", "onClick"], Me = /* @__PURE__ */ e.defineComponent({
  __name: "OutputLocalePicker",
  props: {
    modelValue: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(c, { emit: _ }) {
    const t = _, N = ["zh-CN", "en-US", "ar"];
    return (r, n) => (e.openBlock(), e.createElementBlock("span", {
      class: "fau-row",
      title: r.$t("产出物语言与界面语言独立")
    }, [
      e.createElementVNode(
        "small",
        Wt,
        e.toDisplayString(r.$t("输出语言")),
        1
        /* TEXT */
      ),
      e.createElementVNode("span", {
        class: "fau-seg",
        role: "radiogroup",
        "aria-label": r.$t("输出语言")
      }, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(N, (i) => e.createElementVNode("button", {
            key: i,
            type: "button",
            role: "radio",
            "aria-checked": c.modelValue === i,
            class: e.normalizeClass({ on: c.modelValue === i }),
            disabled: c.disabled,
            "data-test": `fau-locale-${i}`,
            onClick: (a) => t("update:modelValue", i)
          }, e.toDisplayString(r.$t(e.unref(ht)[i])), 11, Gt)),
          64
          /* STABLE_FRAGMENT */
        ))
      ], 8, Yt)
    ], 8, Ut));
  }
}), Ht = {
  class: "fau-wizard ss-module",
  "data-test": "fau-setup"
}, Qt = { class: "fau-steps" }, Jt = { class: "ss-grid" }, Zt = { class: "ss-field" }, Xt = { class: "ss-field" }, xt = { class: "ss-field" }, el = { class: "ss-field" }, tl = { class: "ss-field" }, ll = ["value"], nl = { class: "fau-row" }, al = { class: "ss-muted" }, ol = { class: "fau-regions" }, sl = ["value", "checked", "disabled", "data-test", "onChange"], rl = ["data-batch"], il = {
  key: 1,
  class: "fau-primary"
}, cl = ["value"], dl = {
  key: 2,
  class: "fau-tax"
}, ul = { class: "ss-actions" }, ml = ["disabled"], pl = ["disabled"], yl = {
  key: 0,
  class: "ss-muted fau-quick-hint"
}, Nl = { class: "ss-field" }, Vl = ["value"], El = {
  key: 0,
  class: "ss-note ok",
  "data-test": "fau-map-auto"
}, kl = {
  key: 1,
  class: "ss-note warn",
  "data-test": "fau-map-review"
}, vl = {
  key: 2,
  class: "fau-table-wrap"
}, gl = { class: "fau-table" }, fl = ["onUpdate:modelValue", "data-test", "onChange"], hl = { value: "" }, $l = ["value"], _l = {
  key: 2,
  class: "ss-note danger"
}, Bl = { class: "ss-actions" }, bl = ["disabled"], Sl = { class: "fau-seg" }, Dl = ["onClick"], Cl = { class: "ss-muted" }, wl = { class: "ss-actions" }, Tl = { class: "fau-row" }, Ll = ["placeholder"], Kl = { class: "ss-muted" }, Al = { class: "fau-table-wrap fau-th-wrap" }, Fl = {
  class: "fau-table",
  "data-test": "fau-th-table"
}, Il = { class: "num" }, Pl = { class: "fau-th-group" }, Ol = { colspan: "4" }, zl = ["data-test"], Ml = { class: "fau-th-mod" }, jl = { colspan: "4" }, Rl = ["aria-expanded", "data-test", "onClick"], ql = { class: "fau-code" }, Ul = ["data-test"], Wl = { class: "wrap" }, Yl = ["title"], Gl = { class: "num" }, Hl = { class: "fau-th-input" }, Ql = ["value", "placeholder", "data-test", "onChange"], Jl = { class: "wrap" }, Zl = {
  key: 0,
  class: "ss-muted fau-th-empty"
}, Xl = { class: "ss-actions" }, xl = ["onUpdate:modelValue", "placeholder", "data-test"], en = ["onUpdate:modelValue", "placeholder", "data-test"], tn = ["checked", "onChange"], ln = ["title", "onClick"], nn = { class: "ss-actions" }, an = { class: "fau-row" }, on = { class: "ss-muted" }, sn = { class: "fau-seg" }, rn = { class: "ss-actions" }, cn = { class: "fau-regions" }, dn = ["checked", "disabled", "data-test", "onChange"], un = { class: "ss-actions" }, mn = ["disabled"], pn = /* @__PURE__ */ e.defineComponent({
  __name: "SetupWizard",
  props: {
    company: {},
    startAt: {}
  },
  emits: ["saved", "cancel", "sample"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = Q.useSteps([
      { key: "company", title: s.t("公司与地区"), hint: s.t("公司名称、登记号与税号、地区档案、本位币、会计年度") },
      { key: "standard", title: s.t("准则与科目映射"), hint: s.t("选准则；上传一份余额表把科目映射到报表大类，以后各期复用") },
      { key: "erp", title: s.t("ERP 与数据来源"), hint: s.t("决定上传步骤里显示哪份导出指引") },
      { key: "thresholds", title: s.t("重要性水平与阈值"), hint: s.t("默认值逐条注明出处，可按公司修改") },
      { key: "signers", title: s.t("签核人与岗位"), hint: s.t("编制人、复核人、批准人；是否强制职责分离") },
      { key: "packages", title: s.t("启用套餐"), hint: s.t("选择首页显示的分组；投融资扩展包默认折叠") }
    ]), n = ["prepare", "review", "approve"], i = s.listSeparator(), a = {
      asset: s.i18nKey("资产"),
      liability: s.i18nKey("负债"),
      equity: s.i18nKey("所有者权益"),
      revenue: s.i18nKey("收入"),
      expense: s.i18nKey("费用"),
      common: s.i18nKey("共同类")
    }, m = {
      yonyou: s.i18nKey("用友"),
      kingdee: s.i18nKey("金蝶"),
      sap: "SAP",
      oracle: "Oracle",
      chanjet: s.i18nKey("畅捷通"),
      other: s.i18nKey("其它")
    }, E = t.company, u = e.reactive({
      id: E?.id,
      name: E?.name || "",
      regNo: E?.regNo || "",
      vatNo: E?.vatNo || "",
      regions: [...E?.regions || ["CN"]],
      region: E?.region || "CN",
      standard: E?.standard || "CAS",
      currency: E?.currency || "CNY",
      fiscalYearStartMonth: E?.fiscalYearStartMonth || 1,
      hijriFiscalYear: !!E?.hijriFiscalYear,
      erp: E?.erp || "other",
      accountMap: [...E?.accountMap || []],
      accountMapConfirmed: !!E?.accountMapConfirmed,
      thresholds: { ...E?.thresholds || {} },
      signers: (E?.signers || []).map((D) => ({ ...D, levels: [...D.levels] })),
      sodMode: E?.sodMode || "block",
      packages: [...E?.packages || ie.DEFAULT_PACKAGES],
      // 财会审计报告只有中英阿三种输出语言；越南语 / 马来语界面默认出英文报告
      outputLocale: E?.outputLocale || (["zh-CN", "en-US", "ar"].includes(pe.currentLocale()) ? pe.currentLocale() : "en-US")
    }), L = e.ref([]), g = e.ref({}), v = e.ref([]), b = e.ref(null), h = e.ref(null), K = e.ref(""), T = e.ref(!1), z = e.ref(!1), S = e.computed(() => L.value.find((D) => D.id === u.region)?.standards || ["CAS"]), w = e.ref(""), p = e.ref(/* @__PURE__ */ new Set()), f = (D) => !!w.value || p.value.has(D);
    function y(D) {
      const O = new Set(p.value);
      O.has(D) ? O.delete(D) : O.add(D), p.value = O;
    }
    const I = e.computed(() => {
      const D = w.value.toLowerCase(), O = [];
      for (const P of ie.FAU_MODULES) {
        if (!u.packages.includes(P.package)) continue;
        const J = v.value.filter((re) => re.module === P.id), X = (re) => !D || [s.t(P.name), P.code, re.label ? s.t(re.label) : "", re.original, ze(re), He(re)].some((Ne) => Ne.toLowerCase().includes(D)), de = J.filter(X);
        if (!de.length) continue;
        const he = J.filter((re) => u.thresholds[re.key] != null && u.thresholds[re.key] !== re.value).length;
        let oe = O.find((re) => re.group === P.group);
        oe || O.push(oe = { group: P.group, modules: [] }), oe.modules.push({ id: P.id, code: P.code, name: P.name, items: de, changed: he });
      }
      return O;
    }), B = e.computed(() => h.value ? h.value.entries.filter((D) => !D.cls).length : 0);
    e.onMounted(async () => {
      if (t.startAt && r.indexOf(t.startAt) > 0) {
        for (const D of r.metas.slice(0, r.indexOf(t.startAt))) r.done(D.key);
        Q.scrollToStep(t.startAt);
      }
      try {
        const D = await Y("region.profiles");
        L.value = D.profiles, g.value = D.standards, v.value = await Y("thresholds.get", { modules: ie.FAU_MODULES.filter((O) => O.status === "ready" && O.group !== "platform").map((O) => O.id) });
      } catch (D) {
        r.fail("company", D);
      }
    });
    function k(D) {
      r.done(D), Q.scrollToStep(r.currentKey.value);
    }
    function R(D) {
      u.regions = u.regions.includes(D) ? u.regions.filter((O) => O !== D) : [...u.regions, D], u.regions.includes(u.region) || (u.region = u.regions[0] || "CN");
    }
    function d() {
      if (!u.name)
        return r.fail("company", s.t("请填写公司名称")), !1;
      if (!u.regions.length)
        return r.fail("company", s.t("请至少选择一个地区档案")), !1;
      const D = L.value.find((O) => O.id === u.region);
      return D && !D.standards.includes(u.standard) && (u.standard = D.defaultStandard), (D && !t.company && !z.value || D && !u.currency) && (u.currency = D.currency), !0;
    }
    function M() {
      d() && k("company");
    }
    async function V() {
      if (d()) {
        T.value = !0, r.start("company");
        try {
          const D = await Y("company.save", { company: { ...u, signers: [], quickStart: !0 } });
          await Y("project.create", { type: "month_close", period: De() }), r.done("company", s.t("已保存")), N("saved", D);
        } catch (D) {
          r.fail("company", D);
        } finally {
          T.value = !1;
        }
      }
    }
    async function te(D, O, P) {
      K.value = "";
      try {
        const J = await Y("company.mapAccounts", { path: D, mapping: O, sheet: P, standard: u.standard, previous: u.accountMap });
        b.value = J.inspect, h.value = J.result;
      } catch (J) {
        K.value = Q.errorMessage(J);
      }
    }
    function j() {
      h.value && (u.accountMap = h.value.entries.map((D) => ({ ...D, source: h.value.autoComplete ? D.source : "manual" })), u.accountMapConfirmed = h.value.entries.every((D) => D.cls)), k("standard");
    }
    function W(D, O) {
      if (O.trim() === "") {
        delete u.thresholds[D.key];
        return;
      }
      const P = zt(D, O);
      P != null && (u.thresholds[D.key] = P);
    }
    function U() {
      u.signers.push({ id: `sg_${Math.random().toString(36).slice(2, 10)}`, name: "", title: "", levels: ["prepare"] });
    }
    function H(D, O) {
      D.levels = D.levels.includes(O) ? D.levels.filter((P) => P !== O) : [...D.levels, O];
    }
    function ce(D) {
      u.packages = u.packages.includes(D) ? u.packages.filter((O) => O !== D) : [...u.packages, D];
    }
    async function ne() {
      T.value = !0, r.start("packages");
      try {
        const D = await Y("company.save", { company: { ...u, signers: u.signers.filter((O) => O.name) } });
        r.done("packages", s.t("已保存")), N("saved", D);
      } catch (D) {
        r.fail("packages", D);
      } finally {
        T.value = !1;
      }
    }
    return (D, O) => (e.openBlock(), e.createElementBlock("div", Ht, [
      e.createVNode(Je, {
        title: D.$t("首次配置"),
        metas: e.unref(r).metas,
        runtime: e.unref(r).runtime,
        "current-key": e.unref(r).currentKey.value,
        onJump: e.unref(Q.scrollToStep)
      }, null, 8, ["title", "metas", "runtime", "current-key", "onJump"]),
      e.createElementVNode("div", Qt, [
        e.createCommentVNode(" ① 公司与地区 "),
        e.createVNode(se, {
          "step-key": "company",
          index: 0,
          title: e.unref(r).metas[0].title,
          hint: e.unref(r).metas[0].hint,
          runtime: e.unref(r).runtime.company,
          "is-current": e.unref(r).currentKey.value === "company"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Jt, [
              e.createElementVNode("label", Zt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(D.$t("公司名称")) + " *",
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": O[0] || (O[0] = (P) => u.name = P),
                    "data-test": "fau-company-name"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    u.name,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", Xt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(D.$t("统一社会信用代码 / 商业登记号")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": O[1] || (O[1] = (P) => u.regNo = P),
                    dir: "ltr"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    u.regNo,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", xt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(D.$t("增值税号")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": O[2] || (O[2] = (P) => u.vatNo = P),
                    dir: "ltr"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    u.vatNo,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", el, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(D.$t("记账本位币")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": O[3] || (O[3] = (P) => u.currency = P),
                    dir: "ltr",
                    maxlength: "3",
                    "data-test": "fau-currency",
                    onInput: O[4] || (O[4] = (P) => z.value = !0)
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    u.currency,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", tl, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(D.$t("会计年度起始月")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": O[5] || (O[5] = (P) => u.fiscalYearStartMonth = P)
                  },
                  [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(12, (P) => e.createElementVNode("option", {
                        key: P,
                        value: P
                      }, e.toDisplayString(P), 9, ll)),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelSelect,
                    u.fiscalYearStartMonth,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ])
            ]),
            e.createElementVNode("div", nl, [
              e.createElementVNode(
                "span",
                al,
                e.toDisplayString(D.$t("地区档案（可多选，主地区决定准则与报表口径）")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", ol, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(L.value, (P) => (e.openBlock(), e.createElementBlock(
                  "label",
                  {
                    key: P.id,
                    class: e.normalizeClass(["fau-region", { off: !P.available }])
                  },
                  [
                    e.createElementVNode("input", {
                      type: "checkbox",
                      value: P.id,
                      checked: u.regions.includes(P.id),
                      disabled: !P.available,
                      "data-test": `fau-region-${P.id}`,
                      onChange: (J) => R(P.id)
                    }, null, 40, sl),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(D.$t(P.name)),
                      1
                      /* TEXT */
                    ),
                    P.available ? u.regions.includes(P.id) ? (e.openBlock(), e.createElementBlock("label", il, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": O[6] || (O[6] = (J) => u.region = J),
                        type: "radio",
                        value: P.id
                      }, null, 8, cl), [
                        [e.vModelRadio, u.region]
                      ]),
                      e.createTextVNode(
                        e.toDisplayString(D.$t("主地区")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("small", {
                      key: 0,
                      class: "fau-badge muted",
                      "data-batch": P.plannedBatch
                    }, e.toDisplayString(D.$t("即将上线")), 9, rl)),
                    P.taxRegimes?.length ? (e.openBlock(), e.createElementBlock(
                      "small",
                      dl,
                      e.toDisplayString(P.taxRegimes.map((J) => D.$t(J)).join(e.unref(i))),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", ul, [
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn primary",
                  "data-test": "fau-setup-next-company",
                  onClick: M
                },
                e.toDisplayString(D.$t("下一步")),
                1
                /* TEXT */
              ),
              c.company ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: T.value,
                    "data-test": "fau-setup-quick",
                    onClick: V
                  }, [
                    O[20] || (O[20] = e.createElementVNode(
                      "i",
                      { class: "ri-flashlight-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(D.$t("用默认配置开始")),
                      1
                      /* TEXT */
                    )
                  ], 8, ml),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost",
                    disabled: T.value,
                    "data-test": "fau-setup-sample",
                    onClick: O[7] || (O[7] = (P) => N("sample"))
                  }, [
                    O[21] || (O[21] = e.createElementVNode(
                      "i",
                      { class: "ri-flask-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(D.$t("打开示例项目")),
                      1
                      /* TEXT */
                    )
                  ], 8, pl)
                ],
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            c.company ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              yl,
              e.toDisplayString(D.$t("「用默认配置开始」：其余五步（准则与科目映射、ERP、阈值、签核人、套餐）先用默认值，直接进首页，之后随时可以完善。「打开示例项目」：用一套示例数据把各模块先跑一遍看效果。")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ② 准则 + 科目映射 "),
        e.createVNode(se, {
          "step-key": "standard",
          index: 1,
          title: e.unref(r).metas[1].title,
          hint: e.unref(r).metas[1].hint,
          runtime: e.unref(r).runtime.standard,
          "is-current": e.unref(r).currentKey.value === "standard"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("label", Nl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(D.$t("会计准则")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": O[8] || (O[8] = (P) => u.standard = P),
                  "data-test": "fau-standard"
                },
                [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(S.value, (P) => (e.openBlock(), e.createElementBlock("option", {
                      key: P,
                      value: P
                    }, e.toDisplayString(D.$t(g.value[P] || P)), 9, Vl))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, u.standard]
              ])
            ]),
            e.createVNode(bt, {
              label: D.$t("上传一份科目余额表做科目映射"),
              hint: D.$t("中国科目编码按前缀自动识别；其它科目表自动给出建议后由你确认"),
              onPicked: O[9] || (O[9] = (P) => te(P[0]))
            }, null, 8, ["label", "hint"]),
            b.value && !h.value ? (e.openBlock(), e.createBlock(Ze, {
              key: 0,
              table: b.value,
              roles: b.value.roles.map((P) => ({ ...P, label: D.$t(P.label) })),
              onUpdate: O[10] || (O[10] = (P) => te(b.value.path, P)),
              onSheet: O[11] || (O[11] = (P) => te(b.value.path, void 0, P))
            }, null, 8, ["table", "roles"])) : e.createCommentVNode("v-if", !0),
            h.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                h.value.autoComplete ? (e.openBlock(), e.createElementBlock("p", El, [
                  O[22] || (O[22] = e.createElementVNode(
                    "i",
                    { class: "ri-checkbox-circle-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(D.$t("已自动完成：{n} 个科目全部映射到报表大类", { n: h.value.entries.length })),
                    1
                    /* TEXT */
                  )
                ])) : (e.openBlock(), e.createElementBlock("p", kl, [
                  O[23] || (O[23] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(D.$t("这份科目表需要人工确认：{n} 个科目，其中 {m} 个还没有大类", { n: h.value.entries.length, m: B.value })),
                    1
                    /* TEXT */
                  )
                ])),
                h.value.autoComplete ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("div", vl, [
                  e.createElementVNode("table", gl, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(D.$t("科目编码")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(D.$t("科目名称")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(D.$t("报表大类")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(h.value.entries, (P, J) => (e.openBlock(), e.createElementBlock(
                          "tr",
                          {
                            key: P.code + P.name,
                            class: e.normalizeClass({ warn: !P.cls })
                          },
                          [
                            e.createElementVNode("td", null, [
                              e.createVNode(l, {
                                value: P.code
                              }, null, 8, ["value"])
                            ]),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(P.name),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("td", null, [
                              e.withDirectives(e.createElementVNode("select", {
                                "onUpdate:modelValue": (X) => P.cls = X,
                                "data-test": `fau-map-cls-${J}`,
                                onChange: (X) => P.source = "manual"
                              }, [
                                e.createElementVNode(
                                  "option",
                                  hl,
                                  e.toDisplayString(D.$t("请选择…")),
                                  1
                                  /* TEXT */
                                ),
                                (e.openBlock(), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(a, (X, de) => e.createElementVNode("option", {
                                    key: de,
                                    value: de
                                  }, e.toDisplayString(D.$t(X)), 9, $l)),
                                  64
                                  /* STABLE_FRAGMENT */
                                ))
                              ], 40, fl), [
                                [e.vModelSelect, P.cls]
                              ])
                            ])
                          ],
                          2
                          /* CLASS */
                        ))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ]))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0),
            K.value ? (e.openBlock(), e.createElementBlock("p", _l, [
              O[24] || (O[24] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(K.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", Bl, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!h.value && B.value > 0,
                "data-test": "fau-setup-next-standard",
                onClick: j
              }, e.toDisplayString(h.value ? D.$t("确认映射并继续") : D.$t("稍后再做，继续")), 9, bl)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ③ ERP 与数据来源 "),
        e.createVNode(se, {
          "step-key": "erp",
          index: 2,
          title: e.unref(r).metas[2].title,
          hint: e.unref(r).metas[2].hint,
          runtime: e.unref(r).runtime.erp,
          "is-current": e.unref(r).currentKey.value === "erp"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Sl, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(m, (P, J) => e.createElementVNode("button", {
                  key: J,
                  type: "button",
                  class: e.normalizeClass({ on: u.erp === J }),
                  onClick: (X) => u.erp = J
                }, e.toDisplayString(D.$t(P)), 11, Dl)),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode(
              "p",
              Cl,
              e.toDisplayString(D.$t("ERP 类型决定上传步骤里显示哪份「怎么导出」指引；连接器取数即将上线，现在以上传文件为主。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", wl, [
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn primary",
                  onClick: O[12] || (O[12] = (P) => k("erp"))
                },
                e.toDisplayString(D.$t("下一步")),
                1
                /* TEXT */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ④ 重要性水平与阈值 "),
        e.createVNode(se, {
          "step-key": "thresholds",
          index: 3,
          title: e.unref(r).metas[3].title,
          hint: e.unref(r).metas[3].hint,
          runtime: e.unref(r).runtime.thresholds,
          "is-current": e.unref(r).currentKey.value === "thresholds"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Tl, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": O[13] || (O[13] = (P) => w.value = P),
                type: "search",
                class: "fau-th-search",
                placeholder: D.$t("搜索阈值、模块或依据"),
                "data-test": "fau-th-search"
              }, null, 8, Ll), [
                [
                  e.vModelText,
                  w.value,
                  void 0,
                  { trim: !0 }
                ]
              ]),
              e.createElementVNode(
                "span",
                Kl,
                e.toDisplayString(D.$t("只列已启用套餐里的模块；金额按元、比例按百分比填写。没改的沿用默认值。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Al, [
              e.createElementVNode("table", Fl, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(D.$t("阈值")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Il,
                      e.toDisplayString(D.$t("默认值")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(D.$t("本公司")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(D.$t("依据")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(I.value, (P) => (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    {
                      key: P.group
                    },
                    [
                      e.createElementVNode("tbody", null, [
                        e.createElementVNode("tr", Pl, [
                          e.createElementVNode(
                            "td",
                            Ol,
                            e.toDisplayString(D.$t(e.unref(ie.GROUP_LABELS)[P.group])),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(P.modules, (J) => (e.openBlock(), e.createElementBlock("tbody", {
                          key: J.id,
                          "data-test": `fau-th-mod-${J.id}`
                        }, [
                          e.createElementVNode("tr", Ml, [
                            e.createElementVNode("td", jl, [
                              e.createElementVNode("button", {
                                type: "button",
                                class: "fau-th-toggle",
                                "aria-expanded": f(J.id),
                                "data-test": `fau-th-toggle-${J.id}`,
                                onClick: (X) => y(J.id)
                              }, [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(["fau-dir-icon", f(J.id) ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"])
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createElementVNode(
                                  "span",
                                  ql,
                                  e.toDisplayString(J.code),
                                  1
                                  /* TEXT */
                                ),
                                e.createTextVNode(
                                  e.toDisplayString(D.$t(J.name)) + " ",
                                  1
                                  /* TEXT */
                                ),
                                J.changed ? (e.openBlock(), e.createElementBlock("span", {
                                  key: 0,
                                  class: "fau-badge warn",
                                  "data-test": `fau-th-changed-${J.id}`
                                }, e.toDisplayString(D.$t("已改 {n} 项", { n: J.changed })), 9, Ul)) : e.createCommentVNode("v-if", !0)
                              ], 8, Rl)
                            ])
                          ]),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(J.items, (X) => e.withDirectives((e.openBlock(), e.createElementBlock("tr", {
                              key: X.key
                            }, [
                              e.createElementVNode("td", Wl, [
                                e.createElementVNode(
                                  "div",
                                  null,
                                  e.toDisplayString(e.unref(Bt)(X)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode("small", {
                                  class: "ss-muted",
                                  title: D.$t("以原文为准")
                                }, e.toDisplayString(e.unref(ze)(X)), 9, Yl)
                              ]),
                              e.createElementVNode("td", Gl, [
                                e.createVNode(l, {
                                  value: e.unref(_t)(X, X.value)
                                }, null, 8, ["value"]),
                                O[25] || (O[25] = e.createTextVNode()),
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(e.unref(Ge)(X, u.currency)),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              e.createElementVNode("td", Hl, [
                                e.createElementVNode("input", {
                                  type: "number",
                                  step: "any",
                                  min: "0",
                                  dir: "ltr",
                                  value: u.thresholds[X.key] == null ? "" : e.unref(Ye)(X, u.thresholds[X.key]),
                                  placeholder: String(e.unref(Ye)(X, X.value)),
                                  "data-test": `fau-th-input-${X.key}`,
                                  onChange: (de) => W(X, de.target.value)
                                }, null, 40, Ql),
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(e.unref(Ge)(X, u.currency)),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              e.createElementVNode("td", Jl, [
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(e.unref(He)(X)),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ])), [
                              [e.vShow, f(J.id)]
                            ])),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 8, zl))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              I.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "p",
                Zl,
                e.toDisplayString(w.value ? D.$t("没有匹配的阈值") : D.$t("已启用的套餐里没有可设置的阈值")),
                1
                /* TEXT */
              ))
            ]),
            e.createElementVNode("div", Xl, [
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn primary",
                  onClick: O[14] || (O[14] = (P) => k("thresholds"))
                },
                e.toDisplayString(D.$t("下一步")),
                1
                /* TEXT */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ⑤ 签核人与岗位 "),
        e.createVNode(se, {
          "step-key": "signers",
          index: 4,
          title: e.unref(r).metas[4].title,
          hint: e.unref(r).metas[4].hint,
          runtime: e.unref(r).runtime.signers,
          "is-current": e.unref(r).currentKey.value === "signers"
        }, {
          default: e.withCtx(() => [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(u.signers, (P, J) => (e.openBlock(), e.createElementBlock("div", {
                key: P.id,
                class: "fau-row fau-signer"
              }, [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": (X) => P.name = X,
                  placeholder: D.$t("姓名"),
                  "data-test": `fau-signer-name-${J}`
                }, null, 8, xl), [
                  [
                    e.vModelText,
                    P.name,
                    void 0,
                    { trim: !0 }
                  ]
                ]),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": (X) => P.title = X,
                  placeholder: D.$t("岗位"),
                  "data-test": `fau-signer-title-${J}`
                }, null, 8, en), [
                  [
                    e.vModelText,
                    P.title,
                    void 0,
                    { trim: !0 }
                  ]
                ]),
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(n, (X) => e.createElementVNode("label", {
                    key: X,
                    class: "fau-check"
                  }, [
                    e.createElementVNode("input", {
                      type: "checkbox",
                      checked: P.levels.includes(X),
                      onChange: (de) => H(P, X)
                    }, null, 40, tn),
                    e.createTextVNode(
                      e.toDisplayString(D.$t(e.unref(ve)[X])),
                      1
                      /* TEXT */
                    )
                  ])),
                  64
                  /* STABLE_FRAGMENT */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn ghost sm",
                  title: D.$t("移除"),
                  onClick: (X) => u.signers.splice(J, 1)
                }, [...O[26] || (O[26] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-delete-bin-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, ln)
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            e.createElementVNode("div", nn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                "data-test": "fau-signer-add",
                onClick: U
              }, [
                O[27] || (O[27] = e.createElementVNode(
                  "i",
                  { class: "ri-user-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(D.$t("添加签核人")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("div", an, [
              e.createElementVNode(
                "span",
                on,
                e.toDisplayString(D.$t("职责分离（同一次运行里编制人与复核人不能是同一人）")),
                1
                /* TEXT */
              ),
              e.createElementVNode("span", sn, [
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: e.normalizeClass({ on: u.sodMode === "block" }),
                    onClick: O[15] || (O[15] = (P) => u.sodMode = "block")
                  },
                  e.toDisplayString(D.$t("阻断")),
                  3
                  /* TEXT, CLASS */
                ),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: e.normalizeClass({ on: u.sodMode === "record" }),
                    onClick: O[16] || (O[16] = (P) => u.sodMode = "record")
                  },
                  e.toDisplayString(D.$t("允许但记录")),
                  3
                  /* TEXT, CLASS */
                )
              ])
            ]),
            e.createElementVNode("div", rn, [
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn primary",
                  onClick: O[17] || (O[17] = (P) => k("signers"))
                },
                e.toDisplayString(D.$t("下一步")),
                1
                /* TEXT */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ⑥ 启用套餐 "),
        e.createVNode(se, {
          "step-key": "packages",
          index: 5,
          title: e.unref(r).metas[5].title,
          hint: e.unref(r).metas[5].hint,
          runtime: e.unref(r).runtime.packages,
          "is-current": e.unref(r).currentKey.value === "packages"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", cn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(ie.PACKAGE_LABELS), (P, J) => (e.openBlock(), e.createElementBlock("label", {
                  key: J,
                  class: "fau-region"
                }, [
                  e.createElementVNode("input", {
                    type: "checkbox",
                    checked: u.packages.includes(J),
                    disabled: J === "core",
                    "data-test": `fau-pkg-${J}`,
                    onChange: (X) => ce(J)
                  }, null, 40, dn),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(D.$t(P)),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createVNode(Me, {
              modelValue: u.outputLocale,
              "onUpdate:modelValue": O[18] || (O[18] = (P) => u.outputLocale = P)
            }, null, 8, ["modelValue"]),
            e.createElementVNode("div", un, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: T.value,
                "data-test": "fau-setup-save",
                onClick: ne
              }, [
                O[28] || (O[28] = e.createElementVNode(
                  "i",
                  { class: "ri-save-3-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(D.$t("保存配置")),
                  1
                  /* TEXT */
                )
              ], 8, mn),
              c.company ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-btn ghost",
                  onClick: O[19] || (O[19] = (P) => N("cancel"))
                },
                e.toDisplayString(D.$t("取消")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"])
      ])
    ]));
  }
}), yn = /* @__PURE__ */ ae(pn, [["__scopeId", "data-v-5363012e"]]), Nn = { class: "fau-row" }, Vn = { class: "ss-muted" }, En = ["value"], kn = {
  key: 0,
  value: ""
}, vn = ["value"], gn = {
  key: 0,
  class: "fau-panel fau-newproj",
  "data-test": "fau-project-form"
}, fn = { class: "ss-grid" }, hn = { class: "ss-field" }, $n = ["value"], _n = { class: "ss-field" }, Bn = { class: "ss-field" }, bn = { class: "ss-field" }, Sn = { value: "" }, Dn = ["value"], Cn = { class: "ss-muted" }, wn = { class: "ss-actions" }, Tn = ["disabled"], Ln = {
  key: 0,
  class: "ss-note danger"
}, Kn = ["aria-label"], An = { class: "fau-drawer__body" }, Fn = { class: "fau-kv" }, In = { class: "fau-list" }, Pn = ["onClick"], On = { class: "grow" }, zn = { class: "ss-muted" }, Mn = {
  key: 0,
  class: "ss-muted"
}, jn = { class: "fau-list" }, Rn = { class: "grow" }, qn = { class: "ss-muted" }, Un = {
  key: 0,
  class: "ss-muted"
}, Wn = { class: "ss-actions" }, Yn = ["disabled"], Gn = ["disabled"], Hn = {
  key: 0,
  class: "ss-note ok",
  "data-test": "fau-project-md"
}, Qn = {
  key: 1,
  class: "ss-note danger"
}, Jn = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectBar",
  props: {
    projects: {},
    project: {},
    openDetailOnMount: { type: Boolean }
  },
  emits: ["changed", "open-run"],
  setup(c, { expose: _, emit: t }) {
    const N = c, r = t, n = {
      month_close: s.i18nKey("月结"),
      annual_audit: s.i18nKey("年审"),
      filing: s.i18nKey("申报"),
      controls: s.i18nKey("内控"),
      ma: s.i18nKey("并购"),
      custom: s.i18nKey("自定义")
    }, i = { open: s.i18nKey("进行中"), closed: s.i18nKey("已关闭"), archived: s.i18nKey("已归档") }, a = {
      draft: s.i18nKey("草稿"),
      running: s.i18nKey("进行中"),
      ready: s.i18nKey("待签核"),
      signing: s.i18nKey("签核中"),
      returned: s.i18nKey("被退回"),
      archived: s.i18nKey("已归档"),
      void: s.i18nKey("已作废")
    }, m = e.ref(!1), E = e.ref(!1), u = e.ref(""), L = e.ref(null), g = e.ref(""), v = e.ref({ type: "month_close", period: De(), name: "", prevProjectId: N.project?.id || "" });
    function b(p) {
      const f = ie.moduleById(p);
      return f ? `${f.code} ${s.t(f.name)}` : p;
    }
    async function h(p) {
      if (p)
        try {
          await Y("project.switch", { id: p }), r("changed");
        } catch (f) {
          u.value = Q.errorMessage(f);
        }
    }
    async function K() {
      E.value = !0, u.value = "";
      try {
        await Y("project.create", { ...v.value, prevProjectId: v.value.prevProjectId || void 0 }), m.value = !1, r("changed");
      } catch (p) {
        u.value = Q.errorMessage(p);
      } finally {
        E.value = !1;
      }
    }
    async function T() {
      u.value = "";
      try {
        L.value = await Y("project.status", { id: N.project?.id });
      } catch (p) {
        u.value = Q.errorMessage(p);
      }
    }
    async function z() {
      if (L.value) {
        E.value = !0, u.value = "";
        try {
          await Y("project.archive", { id: L.value.project.id }), await T(), r("changed");
        } catch (p) {
          u.value = Q.errorMessage(p);
        } finally {
          E.value = !1;
        }
      }
    }
    async function S() {
      if (L.value) {
        E.value = !0, u.value = "";
        try {
          g.value = (await Y("project.exportMd", { id: L.value.project.id })).path;
        } catch (p) {
          u.value = Q.errorMessage(p);
        } finally {
          E.value = !1;
        }
      }
    }
    async function w() {
      try {
        await Y("artifact.reveal", { path: g.value });
      } catch (p) {
        u.value = Q.errorMessage(p);
      }
    }
    return _({ openDetail: T, openCreate: () => {
      m.value = !0;
    } }), N.openDetailOnMount && T(), (p, f) => (e.openBlock(), e.createElementBlock(
      e.Fragment,
      null,
      [
        e.createElementVNode("span", Nn, [
          e.createElementVNode(
            "small",
            Vn,
            e.toDisplayString(p.$t("项目")),
            1
            /* TEXT */
          ),
          e.createElementVNode("select", {
            value: c.project?.id || "",
            "data-test": "fau-project-select",
            onChange: f[0] || (f[0] = (y) => h(y.target.value))
          }, [
            c.projects.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "option",
              kn,
              e.toDisplayString(p.$t("还没有项目")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(c.projects, (y) => (e.openBlock(), e.createElementBlock("option", {
                key: y.id,
                value: y.id
              }, e.toDisplayString(y.name) + e.toDisplayString(y.status === "archived" ? ` · ${p.$t("已归档")}` : ""), 9, vn))),
              128
              /* KEYED_FRAGMENT */
            ))
          ], 40, En),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            "data-test": "fau-project-new",
            onClick: f[1] || (f[1] = (y) => m.value = !m.value)
          }, [
            f[9] || (f[9] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(p.$t("新建项目")),
              1
              /* TEXT */
            )
          ]),
          c.project ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-btn sm ghost",
            "data-test": "fau-project-detail",
            onClick: T
          }, [
            f[10] || (f[10] = e.createElementVNode(
              "i",
              { class: "ri-information-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(p.$t("项目详情")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ]),
        m.value ? (e.openBlock(), e.createElementBlock("div", gn, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(p.$t("新建项目")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", fn, [
            e.createElementVNode("label", hn, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(p.$t("类型")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": f[2] || (f[2] = (y) => v.value.type = y)
                },
                [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(n, (y, I) => e.createElementVNode("option", {
                      key: I,
                      value: I
                    }, e.toDisplayString(p.$t(y)), 9, $n)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, v.value.type]
              ])
            ]),
            e.createElementVNode("label", _n, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(v.value.type === "month_close" ? p.$t("期间（YYYY-MM）") : p.$t("期间（YYYY 或 YYYY-MM）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": f[3] || (f[3] = (y) => v.value.period = y),
                  dir: "ltr",
                  "data-test": "fau-project-period"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  v.value.period,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", Bn, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(p.$t("名称（可不填）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": f[4] || (f[4] = (y) => v.value.name = y)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  v.value.name,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", bn, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(p.$t("上一期项目（可选）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": f[5] || (f[5] = (y) => v.value.prevProjectId = y)
                },
                [
                  e.createElementVNode(
                    "option",
                    Sn,
                    e.toDisplayString(p.$t("无")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(c.projects, (y) => (e.openBlock(), e.createElementBlock("option", {
                      key: y.id,
                      value: y.id
                    }, e.toDisplayString(y.name), 9, Dn))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, v.value.prevProjectId]
              ])
            ])
          ]),
          e.createElementVNode(
            "p",
            Cn,
            e.toDisplayString(p.$t("关联上一期后，上期期末余额与未达账项会带入本期比对（如连续 3 个月同方向未达）。")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", wn, [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: E.value,
              "data-test": "fau-project-create",
              onClick: K
            }, [
              f[11] || (f[11] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(p.$t("创建")),
                1
                /* TEXT */
              )
            ], 8, Tn),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-btn ghost",
                onClick: f[6] || (f[6] = (y) => m.value = !1)
              },
              e.toDisplayString(p.$t("取消")),
              1
              /* TEXT */
            )
          ]),
          u.value ? (e.openBlock(), e.createElementBlock("p", Ln, [
            f[12] || (f[12] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(u.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ])) : e.createCommentVNode("v-if", !0),
        L.value ? (e.openBlock(), e.createElementBlock("div", {
          key: 1,
          class: "fau-drawer-mask",
          onClick: f[7] || (f[7] = (y) => L.value = null)
        })) : e.createCommentVNode("v-if", !0),
        L.value ? (e.openBlock(), e.createElementBlock("aside", {
          key: 2,
          class: "fau-drawer",
          role: "dialog",
          "aria-label": p.$t("项目详情"),
          "data-test": "fau-project-drawer"
        }, [
          e.createElementVNode("header", null, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(L.value.project.name),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn ghost sm",
              onClick: f[8] || (f[8] = (y) => L.value = null)
            }, [...f[13] || (f[13] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])])
          ]),
          e.createElementVNode("div", An, [
            e.createElementVNode("dl", Fn, [
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(p.$t("类型")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(p.$t(n[L.value.project.type])),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(p.$t("期间")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createVNode(l, {
                  value: L.value.project.period
                }, null, 8, ["value"])
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(p.$t("状态")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(p.$t(i[L.value.project.status])),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(p.$t("上一期项目")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(L.value.prev?.name || p.$t("无")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(p.$t("签核")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(p.$t("待签 {a} · 已归档 {b} · 被退回 {c}", { a: L.value.signoff.pending, b: L.value.signoff.signed, c: L.value.signoff.returned })),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(p.$t("运行记录")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", In, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(L.value.runs, (y) => (e.openBlock(), e.createElementBlock("li", {
                  key: y.id,
                  onClick: (I) => r("open-run", y.moduleId, y.id)
                }, [
                  e.createElementVNode(
                    "span",
                    On,
                    e.toDisplayString(b(y.moduleId)) + " · " + e.toDisplayString(p.$t(a[y.status] || y.status)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("small", zn, [
                    e.createVNode(l, {
                      value: e.unref(Le)(y.updatedAt)
                    }, null, 8, ["value"])
                  ])
                ], 8, Pn))),
                128
                /* KEYED_FRAGMENT */
              )),
              L.value.runs.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "li",
                Mn,
                e.toDisplayString(p.$t("还没有运行")),
                1
                /* TEXT */
              ))
            ]),
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(p.$t("数据集")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", jn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(L.value.datasets, (y) => (e.openBlock(), e.createElementBlock("li", {
                  key: y.id
                }, [
                  e.createElementVNode(
                    "span",
                    Rn,
                    e.toDisplayString(y.label),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    qn,
                    e.toDisplayString(p.$t("{n} 行", { n: y.rowCount })),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              )),
              L.value.datasets.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "li",
                Un,
                e.toDisplayString(p.$t("还没有导入数据")),
                1
                /* TEXT */
              ))
            ]),
            e.createElementVNode("div", Wn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: E.value,
                "data-test": "fau-project-export-md",
                onClick: S
              }, [
                f[14] || (f[14] = e.createElementVNode(
                  "i",
                  { class: "ri-markdown-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(p.$t("导出项目上下文（project.md）")),
                  1
                  /* TEXT */
                )
              ], 8, Yn),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn danger",
                disabled: E.value || L.value.project.status === "archived",
                "data-test": "fau-project-archive",
                onClick: z
              }, [
                f[15] || (f[15] = e.createElementVNode(
                  "i",
                  { class: "ri-archive-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(p.$t("归档项目（只读）")),
                  1
                  /* TEXT */
                )
              ], 8, Gn)
            ]),
            g.value ? (e.openBlock(), e.createElementBlock("p", Hn, [
              f[16] || (f[16] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(p.$t("已导出：{p0}", { p0: g.value })) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: w
                },
                e.toDisplayString(p.$t("在文件夹中显示")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            u.value ? (e.openBlock(), e.createElementBlock("p", Qn, [
              f[17] || (f[17] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(u.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ])
        ], 8, Kn)) : e.createCommentVNode("v-if", !0)
      ],
      64
      /* STABLE_FRAGMENT */
    ));
  }
}), Zn = /* @__PURE__ */ ae(Jn, [["__scopeId", "data-v-f29d9650"]]), Xn = { class: "fau-queue" }, xn = { class: "fau-row" }, ea = { class: "fau-badge" }, ta = { class: "fau-badge" }, la = { class: "fau-badge" }, na = {
  key: 0,
  class: "fau-list"
}, aa = ["data-test", "onClick"], oa = { class: "grow" }, sa = { class: "ss-muted" }, ra = {
  key: 1,
  class: "ss-muted"
}, ia = /* @__PURE__ */ e.defineComponent({
  __name: "SignoffQueue",
  props: {
    items: {}
  },
  emits: ["open"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = (a) => t.items.filter((m) => !m.returned && m.level === a).length, n = e.computed(() => t.items.filter((a) => a.returned).length);
    function i(a) {
      const m = ie.moduleById(a);
      return m ? `${m.code} ${s.t(m.name)}` : a;
    }
    return (a, m) => (e.openBlock(), e.createElementBlock("div", Xn, [
      e.createElementVNode("div", xn, [
        e.createElementVNode(
          "span",
          ea,
          e.toDisplayString(a.$t("待编制 {n}", { n: r("prepare") })),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          ta,
          e.toDisplayString(a.$t("待复核 {n}", { n: r("review") })),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          la,
          e.toDisplayString(a.$t("待批准 {n}", { n: r("approve") })),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["fau-badge", n.value ? "bad" : "muted"])
          },
          e.toDisplayString(a.$t("被退回 {n}", { n: n.value })),
          3
          /* TEXT, CLASS */
        )
      ]),
      c.items.length ? (e.openBlock(), e.createElementBlock("ul", na, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(c.items, (E) => (e.openBlock(), e.createElementBlock("li", {
            key: E.runId + E.level,
            "data-test": `fau-queue-${E.moduleId}`,
            onClick: (u) => N("open", E)
          }, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["fau-dot", E.returned ? "danger" : ""])
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              oa,
              e.toDisplayString(i(E.moduleId)) + " · " + e.toDisplayString(E.returned ? a.$t("被退回") : a.$t("待{p0}", { p0: a.$t(e.unref(ve)[E.level]) })),
              1
              /* TEXT */
            ),
            e.createElementVNode("small", sa, [
              e.createVNode(l, {
                value: e.unref(Le)(E.since)
              }, null, 8, ["value"])
            ])
          ], 8, aa))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        ra,
        e.toDisplayString(a.$t("没有待签项")),
        1
        /* TEXT */
      ))
    ]));
  }
}), ca = {
  class: "fau-arts",
  "data-test": "fau-artifacts"
}, da = {
  key: 0,
  class: "ss-note"
}, ua = ["title"], ma = ["onClick"], pa = ["onClick"], ya = ["onClick"], Na = {
  key: 1,
  class: "fau-preview",
  "data-test": "fau-preview"
}, Va = { class: "fau-row" }, Ea = { class: "grow" }, ka = {
  key: 0,
  class: "fau-badge muted"
}, va = {
  key: 0,
  class: "ss-note danger"
}, ga = { class: "fau-seg fau-sheets" }, fa = ["onClick"], ha = ["dir"], $a = { class: "fau-table" }, _a = ["dir"], Ba = /* @__PURE__ */ e.defineComponent({
  __name: "ArtifactPreview",
  props: {
    artifacts: {},
    archived: { type: Boolean }
  },
  setup(c) {
    const _ = e.ref(null), t = e.ref(null), N = e.ref(0), r = e.ref(""), n = (m) => m.split(/[\\/]/).pop() || m;
    async function i(m) {
      _.value = m, t.value = null, N.value = 0, r.value = "";
      try {
        t.value = await Y("artifact.preview", { path: m.path, maxRows: 40 });
      } catch (E) {
        r.value = Q.errorMessage(E);
      }
    }
    async function a(m, E) {
      try {
        await Y(E ? "artifact.reveal" : "artifact.open", { path: m.path });
      } catch (u) {
        Ae.useNotificationStore().error(Q.errorMessage(u));
      }
    }
    return (m, E) => (e.openBlock(), e.createElementBlock("div", ca, [
      c.artifacts.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", da, [
        E[1] || (E[1] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(m.$t("还没有生成文件")),
          1
          /* TEXT */
        )
      ])),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(c.artifacts, (u) => (e.openBlock(), e.createElementBlock("div", {
          key: u.id,
          class: "ss-file-out"
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(u.kind === "docx" ? "ri-file-word-2-line" : "ri-file-excel-2-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(Z)(u.title)),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", c.archived ? "ok" : "warn"])
            },
            e.toDisplayString(c.archived ? m.$t("已签核·已归档") : m.$t("草稿—待签核")),
            3
            /* TEXT, CLASS */
          ),
          e.createElementVNode("code", {
            title: u.path
          }, [
            e.createVNode(l, {
              value: n(u.path)
            }, null, 8, ["value"])
          ], 8, ua),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            onClick: (L) => i(u)
          }, [
            E[2] || (E[2] = e.createElementVNode(
              "i",
              { class: "ri-eye-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(m.$t("预览")),
              1
              /* TEXT */
            )
          ], 8, ma),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            onClick: (L) => a(u, !1)
          }, [
            E[3] || (E[3] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(m.$t("打开")),
              1
              /* TEXT */
            )
          ], 8, pa),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            onClick: (L) => a(u, !0)
          }, [
            E[4] || (E[4] = e.createElementVNode(
              "i",
              { class: "ri-folder-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(m.$t("在文件夹中显示")),
              1
              /* TEXT */
            )
          ], 8, ya)
        ]))),
        128
        /* KEYED_FRAGMENT */
      )),
      _.value ? (e.openBlock(), e.createElementBlock("div", Na, [
        e.createElementVNode("div", Va, [
          e.createElementVNode(
            "strong",
            Ea,
            e.toDisplayString(e.unref(Z)(_.value.title)),
            1
            /* TEXT */
          ),
          t.value?.rtl ? (e.openBlock(), e.createElementBlock("span", ka, "RTL")) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn ghost sm",
            onClick: E[0] || (E[0] = (u) => _.value = null)
          }, [...E[5] || (E[5] = [
            e.createElementVNode(
              "i",
              { class: "ri-close-line" },
              null,
              -1
              /* CACHED */
            )
          ])])
        ]),
        r.value ? (e.openBlock(), e.createElementBlock("p", va, [
          E[6] || (E[6] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(r.value),
            1
            /* TEXT */
          )
        ])) : t.value?.kind === "xlsx" ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 1 },
          [
            e.createElementVNode("div", ga, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.sheets, (u, L) => (e.openBlock(), e.createElementBlock("button", {
                  key: u.name,
                  type: "button",
                  class: e.normalizeClass({ on: N.value === L }),
                  onClick: (g) => N.value = L
                }, e.toDisplayString(u.name), 11, fa))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", {
              class: "fau-table-wrap",
              dir: t.value.rtl ? "rtl" : void 0
            }, [
              e.createElementVNode("table", $a, [
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(t.value.sheets[N.value]?.rows || [], (u, L) => (e.openBlock(), e.createElementBlock("tr", { key: L }, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(u, (g, v) => (e.openBlock(), e.createElementBlock(
                          "td",
                          {
                            key: v,
                            class: e.normalizeClass({ num: typeof g == "number" })
                          },
                          [
                            typeof g == "number" ? (e.openBlock(), e.createBlock(l, {
                              key: 0,
                              value: g
                            }, null, 8, ["value"])) : (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              { key: 1 },
                              [
                                e.createTextVNode(
                                  e.toDisplayString(g),
                                  1
                                  /* TEXT */
                                )
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            ))
                          ],
                          2
                          /* CLASS */
                        ))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ], 8, ha)
          ],
          64
          /* STABLE_FRAGMENT */
        )) : t.value?.kind === "docx" ? (e.openBlock(), e.createElementBlock("div", {
          key: 2,
          class: "fau-docx",
          dir: t.value.rtl ? "rtl" : void 0
        }, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.paragraphs, (u, L) => (e.openBlock(), e.createElementBlock(
              "p",
              { key: L },
              e.toDisplayString(u),
              1
              /* TEXT */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 8, _a)) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), ba = /* @__PURE__ */ ae(Ba, [["__scopeId", "data-v-37292dfb"]]), Sa = ["aria-label"], Da = { class: "fau-drawer__body" }, Ca = { class: "ss-note info" }, wa = {
  key: 0,
  class: "ss-note danger"
}, Ta = {
  key: 1,
  class: "fau-table-wrap"
}, La = { class: "fau-table" }, Ka = { class: "num" }, Aa = { class: "wrap" }, Fa = ["title"], Ia = { class: "num" }, Pa = {
  key: 0,
  class: "ss-muted"
}, Oa = { class: "wrap" }, za = /* @__PURE__ */ e.defineComponent({
  __name: "JudgementDrawer",
  props: {
    open: { type: Boolean },
    modules: {},
    currency: {}
  },
  emits: ["close"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = e.ref([]), n = e.ref("");
    return e.watch(() => t.open, async (i) => {
      if (i)
        try {
          r.value = await Y("thresholds.get", { modules: t.modules }), n.value = "";
        } catch (a) {
          n.value = Q.errorMessage(a);
        }
    }, { immediate: !0 }), (i, a) => (e.openBlock(), e.createElementBlock(
      e.Fragment,
      null,
      [
        c.open ? (e.openBlock(), e.createElementBlock("div", {
          key: 0,
          class: "fau-drawer-mask",
          onClick: a[0] || (a[0] = (m) => N("close"))
        })) : e.createCommentVNode("v-if", !0),
        c.open ? (e.openBlock(), e.createElementBlock("aside", {
          key: 1,
          class: "fau-drawer",
          role: "dialog",
          "aria-label": i.$t("判断依据"),
          "data-test": "fau-judgement-drawer"
        }, [
          e.createElementVNode("header", null, [
            e.createElementVNode("h3", null, [
              a[2] || (a[2] = e.createElementVNode(
                "i",
                { class: "ri-scales-3-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                " " + e.toDisplayString(i.$t("判断依据")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn ghost sm",
              onClick: a[1] || (a[1] = (m) => N("close"))
            }, [...a[3] || (a[3] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])])
          ]),
          e.createElementVNode("div", Da, [
            e.createElementVNode("p", Ca, [
              a[4] || (a[4] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(i.$t("阈值默认值来自源技能的判断框架，可在首次配置里按公司修改；原文为中文，以原文为准。")),
                1
                /* TEXT */
              )
            ]),
            n.value ? (e.openBlock(), e.createElementBlock("p", wa, [
              a[5] || (a[5] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.value),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock("div", Ta, [
              e.createElementVNode("table", La, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("阈值")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Ka,
                      e.toDisplayString(i.$t("当前值")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("依据")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(r.value, (m) => (e.openBlock(), e.createElementBlock("tr", {
                      key: m.key
                    }, [
                      e.createElementVNode("td", Aa, [
                        e.createElementVNode(
                          "div",
                          null,
                          e.toDisplayString(e.unref(Bt)(m)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("small", {
                          class: "ss-muted",
                          title: i.$t("以原文为准")
                        }, e.toDisplayString(e.unref(ze)(m)), 9, Fa)
                      ]),
                      e.createElementVNode("td", Ia, [
                        e.createVNode(l, {
                          value: e.unref(_t)(m, m.override ?? m.value)
                        }, null, 8, ["value"]),
                        e.createTextVNode(
                          " " + e.toDisplayString(e.unref(Ge)(m, c.currency || "")) + " ",
                          1
                          /* TEXT */
                        ),
                        m.override != null ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Pa,
                          " · " + e.toDisplayString(i.$t("已按公司覆盖")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", Oa, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(e.unref(He)(m)),
                          1
                          /* TEXT */
                        )
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ]))
          ])
        ], 8, Sa)) : e.createCommentVNode("v-if", !0)
      ],
      64
      /* STABLE_FRAGMENT */
    ));
  }
}), Ma = {
  class: "fau-sign",
  "data-test": "fau-signoff"
}, ja = { class: "fau-levels" }, Ra = { key: 0 }, qa = { key: 1 }, Ua = { key: 2 }, Wa = {
  key: 0,
  class: "ss-note warn"
}, Ya = {
  key: 1,
  class: "ss-note danger",
  "data-test": "fau-returned"
}, Ga = {
  key: 2,
  class: "fau-sign__form"
}, Ha = { class: "ss-grid" }, Qa = { class: "ss-field" }, Ja = ["value"], Za = { value: "__manual" }, Xa = { class: "ss-field" }, xa = { class: "ss-field" }, eo = {
  key: 0,
  class: "fau-acks"
}, to = { class: "fau-row" }, lo = { class: "grow" }, no = ["value", "disabled", "data-test"], ao = { class: "grow" }, oo = {
  key: 0,
  class: "fau-badge warn"
}, so = {
  key: 1,
  class: "fau-badge bad"
}, ro = { class: "ss-field" }, io = { class: "ss-actions" }, co = ["disabled"], uo = ["disabled"], mo = { class: "ss-field inline" }, po = ["value"], yo = ["disabled"], No = {
  key: 1,
  class: "ss-note danger",
  "data-test": "fau-sign-error"
}, Vo = {
  key: 3,
  class: "ss-note"
}, Eo = {
  key: 4,
  class: "ss-note ok"
}, ko = { class: "fau-row" }, vo = { class: "grow" }, go = ["disabled"], fo = {
  key: 6,
  class: "fau-prov"
}, ho = {
  key: 7,
  class: "fau-table-wrap"
}, $o = { class: "fau-table" }, _o = {
  key: 0,
  class: "fau-badge warn"
}, Bo = { class: "wrap" }, bo = /* @__PURE__ */ e.defineComponent({
  __name: "SignoffCard",
  props: {
    run: {},
    company: {},
    active: {},
    nextLevel: {},
    baseLevels: {}
  },
  emits: ["changed"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = ["validate", "analyze", "draft"], n = (B) => ft().find((k) => k.key === B)?.title || B, i = e.ref(!1), a = e.ref(""), m = e.ref([]), E = e.ref(""), u = e.ref("analyze"), L = e.ref(""), g = e.ref({ name: "", title: "" }), v = e.ref([]), b = e.ref(null), h = e.computed(() => !!t.nextLevel && t.run.artifacts.length > 0 && ["ready", "signing"].includes(t.run.status)), K = e.computed(() => t.run.requiredLevels.includes("approve") && !t.baseLevels.includes("approve")), T = e.computed(() => t.company.signers.filter((B) => t.nextLevel && B.levels.includes(t.nextLevel))), z = (B) => t.active.find((k) => k.level === B && k.decision === "approve"), S = (B) => z(B) ? "done" : t.nextLevel === B ? "current" : "todo";
    e.watch(() => [t.nextLevel, t.run.id], () => {
      L.value = T.value[0]?.id || "__manual", m.value = [], E.value = "", a.value = "", w();
    }, { immediate: !0 });
    async function w() {
      try {
        v.value = await Y("signoff.history", { runId: t.run.id });
      } catch {
        v.value = [];
      }
    }
    function p() {
      m.value = t.run.reminders.filter((B) => !(B.approverOnly && t.nextLevel !== "approve")).map((B) => B.id);
    }
    function f() {
      if (L.value === "__manual") return { ...g.value };
      const B = t.company.signers.find((k) => k.id === L.value);
      return B ? { name: B.name, title: B.title } : { name: "", title: "" };
    }
    async function y(B) {
      if (t.nextLevel) {
        i.value = !0, a.value = "";
        try {
          const k = { runId: t.run.id, level: t.nextLevel, decision: B, signer: f(), comment: E.value, acknowledged: m.value, returnToStep: u.value };
          await Y(t.nextLevel === "prepare" ? "signoff.submit" : "signoff.decide", k), N("changed"), await w();
        } catch (k) {
          a.value = Q.errorMessage(k);
        } finally {
          i.value = !1;
        }
      }
    }
    async function I() {
      i.value = !0;
      try {
        b.value = await Y("signoff.verify", { runId: t.run.id });
      } catch (B) {
        a.value = Q.errorMessage(B);
      } finally {
        i.value = !1;
      }
    }
    return (B, k) => (e.openBlock(), e.createElementBlock("div", Ma, [
      e.createElementVNode("div", ja, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(c.run.requiredLevels, (R) => (e.openBlock(), e.createElementBlock(
            "div",
            {
              key: R,
              class: e.normalizeClass(["fau-level", S(R)])
            },
            [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(B.$t(e.unref(ve)[R])),
                1
                /* TEXT */
              ),
              z(R) ? (e.openBlock(), e.createElementBlock("small", Ra, [
                e.createTextVNode(
                  e.toDisplayString(z(R).signer.name) + " · ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: e.unref(Le)(z(R).at)
                }, null, 8, ["value"])
              ])) : c.nextLevel === R ? (e.openBlock(), e.createElementBlock(
                "small",
                qa,
                e.toDisplayString(B.$t("轮到这一级")),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "small",
                Ua,
                e.toDisplayString(B.$t("待签")),
                1
                /* TEXT */
              ))
            ],
            2
            /* CLASS */
          ))),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      K.value ? (e.openBlock(), e.createElementBlock("p", Wa, [
        k[9] || (k[9] = e.createElementVNode(
          "i",
          { class: "ri-alarm-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(B.$t("命中升级条件（如试算不平、跨期 > 5 万、不明扣款 > 1000），必须由批准人签核")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      c.run.status === "returned" && c.run.returned ? (e.openBlock(), e.createElementBlock("p", Ya, [
        k[10] || (k[10] = e.createElementVNode(
          "i",
          { class: "ri-arrow-go-back-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(B.$t("{p0}退回：{p1}（回到第 {n} 步）", { p0: B.$t(e.unref(ve)[c.run.returned.level]), p1: c.run.returned.comment, n: e.unref(Se).indexOf(c.run.returned.toStep) + 1 })),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      h.value ? (e.openBlock(), e.createElementBlock("div", Ga, [
        e.createElementVNode("div", Ha, [
          e.createElementVNode("label", Qa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(B.$t("签核人身份（{p0}）", { p0: B.$t(e.unref(ve)[c.nextLevel]) })),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": k[0] || (k[0] = (R) => L.value = R),
                "data-test": "fau-signer"
              },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(T.value, (R) => (e.openBlock(), e.createElementBlock("option", {
                    key: R.id,
                    value: R.id
                  }, e.toDisplayString(R.name) + " · " + e.toDisplayString(R.title), 9, Ja))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                e.createElementVNode(
                  "option",
                  Za,
                  e.toDisplayString(B.$t("手动填写")),
                  1
                  /* TEXT */
                )
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, L.value]
            ])
          ]),
          L.value === "__manual" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createElementVNode("label", Xa, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(B.$t("姓名")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": k[1] || (k[1] = (R) => g.value.name = R),
                    "data-test": "fau-signer-name"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    g.value.name,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", xa, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(B.$t("岗位")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": k[2] || (k[2] = (R) => g.value.title = R),
                    "data-test": "fau-signer-title"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    g.value.title,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ])
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        c.run.reminders.length ? (e.openBlock(), e.createElementBlock("div", eo, [
          e.createElementVNode("div", to, [
            e.createElementVNode(
              "strong",
              lo,
              e.toDisplayString(B.$t("提醒项：逐条确认「已知悉」")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-link",
                onClick: p
              },
              e.toDisplayString(B.$t("全部勾选")),
              1
              /* TEXT */
            )
          ]),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(c.run.reminders, (R) => (e.openBlock(), e.createElementBlock(
              "label",
              {
                key: R.id,
                class: e.normalizeClass(["fau-ack", { locked: R.approverOnly && c.nextLevel !== "approve" }])
              },
              [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": k[3] || (k[3] = (d) => m.value = d),
                  type: "checkbox",
                  value: R.id,
                  disabled: R.approverOnly && c.nextLevel !== "approve",
                  "data-test": `fau-ack-${R.id}`
                }, null, 8, no), [
                  [e.vModelCheckbox, m.value]
                ]),
                e.createElementVNode(
                  "span",
                  ao,
                  e.toDisplayString(e.unref(Z)(R.message)),
                  1
                  /* TEXT */
                ),
                R.approverOnly ? (e.openBlock(), e.createElementBlock(
                  "span",
                  oo,
                  e.toDisplayString(B.$t("批准人确认")),
                  1
                  /* TEXT */
                )) : R.source === "escalation" ? (e.openBlock(), e.createElementBlock(
                  "span",
                  so,
                  e.toDisplayString(B.$t("升级")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ],
              2
              /* CLASS */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("label", ro, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(c.run.reminders.length ? B.$t("意见 / 知悉理由（必填）") : B.$t("意见")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": k[4] || (k[4] = (R) => E.value = R),
              "data-test": "fau-sign-comment"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, E.value]
          ])
        ]),
        e.createElementVNode("div", io, [
          c.nextLevel === "prepare" ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-btn primary",
            disabled: i.value,
            "data-test": "fau-sign-prepare",
            onClick: k[5] || (k[5] = (R) => y("approve"))
          }, [
            k[11] || (k[11] = e.createElementVNode(
              "i",
              { class: "ri-quill-pen-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(B.$t("编制签核")),
              1
              /* TEXT */
            )
          ], 8, co)) : (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 1 },
            [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: i.value,
                "data-test": "fau-sign-approve",
                onClick: k[6] || (k[6] = (R) => y("approve"))
              }, [
                k[12] || (k[12] = e.createElementVNode(
                  "i",
                  { class: "ri-check-double-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(B.$t("通过（{p0}）", { p0: B.$t(e.unref(ve)[c.nextLevel]) })),
                  1
                  /* TEXT */
                )
              ], 8, uo),
              k[14] || (k[14] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("label", mo, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(B.$t("退回到")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": k[7] || (k[7] = (R) => u.value = R),
                    "data-test": "fau-return-step"
                  },
                  [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(r, (R) => e.createElementVNode("option", {
                        key: R,
                        value: R
                      }, e.toDisplayString(B.$t("第 {n} 步", { n: e.unref(Se).indexOf(R) + 1 })) + " · " + e.toDisplayString(n(R)), 9, po)),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, u.value]
                ])
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn danger",
                disabled: i.value,
                "data-test": "fau-sign-return",
                onClick: k[8] || (k[8] = (R) => y("return"))
              }, [
                k[13] || (k[13] = e.createElementVNode(
                  "i",
                  { class: "ri-arrow-go-back-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(B.$t("退回")),
                  1
                  /* TEXT */
                )
              ], 8, yo)
            ],
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        a.value ? (e.openBlock(), e.createElementBlock("p", No, [
          k[15] || (k[15] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(a.value),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ])) : c.run.artifacts.length ? c.run.status === "archived" ? (e.openBlock(), e.createElementBlock("p", Eo, [
        k[17] || (k[17] = e.createElementVNode(
          "i",
          { class: "ri-shield-check-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(B.$t("各级签核完成，已归档")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Vo, [
        k[16] || (k[16] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(B.$t("还没有生成底稿，不能签核")),
          1
          /* TEXT */
        )
      ])),
      e.createElementVNode("div", ko, [
        e.createElementVNode(
          "strong",
          vo,
          e.toDisplayString(B.$t("签核历史")),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: i.value,
          "data-test": "fau-verify",
          onClick: I
        }, [
          k[18] || (k[18] = e.createElementVNode(
            "i",
            { class: "ri-shield-keyhole-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(B.$t("校验签核")),
            1
            /* TEXT */
          )
        ], 8, go)
      ]),
      b.value ? (e.openBlock(), e.createElementBlock(
        "p",
        {
          key: 5,
          class: e.normalizeClass(["ss-note", b.value.ok ? "ok" : "danger"]),
          "data-test": "fau-verify-result"
        },
        [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(b.value.ok ? "ri-shield-check-line" : "ri-shield-cross-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(e.unref(Z)(b.value.message)),
            1
            /* TEXT */
          )
        ],
        2
        /* CLASS */
      )) : e.createCommentVNode("v-if", !0),
      b.value && b.value.tampered.length ? (e.openBlock(), e.createElementBlock("ul", fo, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(b.value.tampered, (R) => (e.openBlock(), e.createElementBlock("li", {
            key: R.path
          }, [
            e.createVNode(l, {
              value: R.path
            }, null, 8, ["value"])
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      v.value.length ? (e.openBlock(), e.createElementBlock("div", ho, [
        e.createElementVNode("table", $o, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("签核级别")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("决定")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("签核人")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("签核时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("意见")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(v.value, (R) => (e.openBlock(), e.createElementBlock(
                "tr",
                {
                  key: R.id,
                  class: e.normalizeClass({ bad: R.decision === "return" })
                },
                [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(B.$t(e.unref(ve)[R.level])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createTextVNode(
                      e.toDisplayString(R.decision === "approve" ? B.$t("通过") : B.$t("退回")),
                      1
                      /* TEXT */
                    ),
                    R.sodWaived ? (e.openBlock(), e.createElementBlock(
                      "span",
                      _o,
                      e.toDisplayString(B.$t("职责未分离")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(R.signer.name) + " · " + e.toDisplayString(R.signer.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: e.unref(Le)(R.at)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    Bo,
                    e.toDisplayString(R.comment),
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
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), So = /* @__PURE__ */ ae(bo, [["__scopeId", "data-v-f2e197aa"]]), Do = {
  class: "fau-vr",
  "data-test": "fau-validation"
}, Co = {
  key: 0,
  class: "ss-note"
}, wo = { class: "fau-row" }, To = {
  key: 0,
  class: "fau-table-wrap"
}, Lo = { class: "fau-table" }, Ko = { class: "wrap" }, Ao = { class: "grow" }, Fo = { key: 0 }, Io = /* @__PURE__ */ e.defineComponent({
  __name: "ValidationReport",
  props: {
    report: {}
  },
  setup(c) {
    return (_, t) => (e.openBlock(), e.createElementBlock("div", Do, [
      c.report ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("div", wo, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["fau-badge", c.report.blockers.length ? "bad" : "ok"])
              },
              e.toDisplayString(_.$t("阻断项 {n}", { n: c.report.blockers.length })),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["fau-badge", c.report.warnings.length ? "warn" : "muted"])
              },
              e.toDisplayString(_.$t("提醒项 {n}", { n: c.report.warnings.length })),
              3
              /* TEXT, CLASS */
            )
          ]),
          c.report.checks.length ? (e.openBlock(), e.createElementBlock("div", To, [
            e.createElementVNode("table", Lo, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(_.$t("检查项")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(_.$t("结果")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(c.report.checks, (N) => (e.openBlock(), e.createElementBlock(
                    "tr",
                    {
                      key: N.id,
                      class: e.normalizeClass({ bad: !N.ok && N.level === "block", warn: !N.ok && N.level === "warn" })
                    },
                    [
                      e.createElementVNode(
                        "td",
                        Ko,
                        e.toDisplayString(e.unref(Z)(N.message)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(N.ok ? "fau-true" : "fau-false")
                          },
                          e.toDisplayString(N.ok ? "TRUE" : "FALSE"),
                          3
                          /* TEXT, CLASS */
                        )
                      ])
                    ],
                    2
                    /* CLASS */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])) : e.createCommentVNode("v-if", !0),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList({ block: c.report.blockers, warn: c.report.warnings }, (N, r) => (e.openBlock(), e.createElementBlock("ul", {
              key: r,
              class: "fau-issues"
            }, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(N, (n) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: n.id,
                    class: e.normalizeClass(r)
                  },
                  [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(r === "block" ? "ri-close-circle-line" : "ri-error-warning-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createElementVNode(
                      "span",
                      Ao,
                      e.toDisplayString(e.unref(Z)(n.message)),
                      1
                      /* TEXT */
                    ),
                    n.rows?.length ? (e.openBlock(), e.createElementBlock("small", Fo, [
                      e.createTextVNode(
                        e.toDisplayString(_.$t("行号")) + ": ",
                        1
                        /* TEXT */
                      ),
                      e.createVNode(l, {
                        value: n.rows.join(", ")
                      }, null, 8, ["value"])
                    ])) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock("p", Co, [
        t[0] || (t[0] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(_.$t("还没有校验结果")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), Po = /* @__PURE__ */ ae(Io, [["__scopeId", "data-v-9ebbb0cd"]]), Oo = {
  key: 0,
  class: "fau-close",
  "data-test": "fau-close-panel"
}, zo = {
  key: 0,
  open: "",
  class: "fau-sec",
  "data-test": "fau-checklist"
}, Mo = { class: "ss-muted" }, jo = {
  key: 0,
  class: "fau-prov"
}, Ro = { class: "fau-table-wrap" }, qo = { class: "fau-table" }, Uo = { class: "wrap" }, Wo = {
  key: 0,
  class: "fau-badge muted"
}, Yo = ["value", "disabled", "data-test", "onChange"], Go = ["value"], Ho = { class: "wrap" }, Qo = {
  key: 0,
  class: "ss-muted"
}, Jo = ["value", "disabled", "placeholder", "onChange"], Zo = {
  key: 1,
  class: "ss-note danger"
}, Xo = {
  key: 1,
  open: "",
  class: "fau-sec",
  "data-test": "fau-trial"
}, xo = { class: "fau-table-wrap" }, es = { class: "fau-table" }, ts = { class: "num" }, ls = { class: "num" }, ns = { class: "num" }, as = { class: "num" }, os = { class: "num" }, ss = { class: "num" }, rs = { class: "num" }, is = { class: "num" }, cs = { class: "fau-table-wrap" }, ds = { class: "fau-table" }, us = { class: "num" }, ms = { class: "num" }, ps = { class: "num" }, ys = ["data-test"], Ns = { class: "wrap" }, Vs = { class: "ss-muted" }, Es = { class: "num" }, ks = { class: "num" }, vs = { class: "num" }, gs = ["open"], fs = {
  key: 0,
  class: "fau-table-wrap"
}, hs = { class: "fau-table" }, $s = { class: "num" }, _s = { class: "num" }, Bs = ["data-test"], bs = { class: "num" }, Ss = { class: "num" }, Ds = {
  key: 0,
  class: "fau-badge warn"
}, Cs = { class: "wrap" }, ws = {
  key: 1,
  class: "ss-muted"
}, Ts = {
  key: 3,
  open: "",
  class: "fau-sec",
  "data-test": "fau-accruals"
}, Ls = { class: "fau-badge muted" }, Ks = { class: "ss-actions" }, As = ["disabled"], Fs = ["onClick"], Is = {
  key: 0,
  class: "fau-table-wrap"
}, Ps = { class: "fau-table" }, Os = { class: "num" }, zs = { class: "num" }, Ms = { class: "num" }, js = ["data-test"], Rs = { class: "num" }, qs = { class: "num" }, Us = { class: "num" }, Ws = {
  key: 1,
  class: "ss-muted"
}, Ys = {
  key: 4,
  open: "",
  class: "fau-sec",
  "data-test": "fau-roll"
}, Gs = { class: "ss-muted" }, Hs = { class: "fau-table-wrap" }, Qs = { class: "fau-table" }, Js = { class: "num" }, Zs = { class: "num" }, Xs = { class: "num" }, xs = { class: "num" }, er = { class: "num" }, tr = { class: "num" }, lr = { class: "num" }, nr = { class: "num" }, ar = { class: "num" }, or = ["data-test"], sr = { class: "num" }, rr = { class: "num" }, ir = { class: "num" }, cr = { class: "num" }, dr = { class: "num" }, ur = { class: "num" }, mr = { class: "num" }, pr = { class: "num" }, yr = { class: "num" }, Nr = {
  key: 5,
  open: "",
  class: "fau-sec",
  "data-test": "fau-flux"
}, Vr = { class: "fau-badge muted" }, Er = { class: "fau-table-wrap" }, kr = { class: "fau-table" }, vr = { class: "num" }, gr = { class: "num" }, fr = { class: "num" }, hr = ["data-test"], $r = { class: "num" }, _r = { class: "num" }, Br = { class: "num" }, br = { class: "num" }, Sr = { class: "wrap" }, Dr = ["open"], Cr = { class: "fau-badge muted" }, wr = {
  key: 0,
  class: "fau-prov"
}, Tr = {
  key: 1,
  class: "ss-muted"
}, Lr = /* @__PURE__ */ e.defineComponent({
  __name: "ClosePanel",
  props: {
    run: {},
    def: {}
  },
  emits: ["changed"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = ye.useRouter(), n = e.computed(() => t.run.result), i = e.computed(() => ["signing", "archived", "void"].includes(t.run.status)), a = e.computed(() => (n.value?.rollForward || []).filter((S) => S.unexplained !== 0).length), m = e.computed(() => t.def.reuse || []), E = e.ref(!1), u = e.ref(""), L = { ok: s.i18nKey("通过"), warn: s.i18nKey("提醒"), fail: s.i18nKey("不通过"), pending: s.i18nKey("待评") }, g = {
      trial: s.i18nKey("试算平衡"),
      bs: s.i18nKey("资产 = 负债 + 所有者权益"),
      np_retained: s.i18nKey("净利润 = 未分配利润本期增加"),
      cashflow: s.i18nKey("现金流量净额 = 货币资金变动"),
      opening: s.i18nKey("期初 = 上期期末"),
      movement: s.i18nKey("序时账发生额 = 余额表本期发生")
    }, v = { omitted: s.i18nKey("漏做"), early: s.i18nKey("提前"), late: s.i18nKey("延迟") }, b = { preparer: s.i18nKey("编制人"), reviewer: s.i18nKey("复核人"), approver: s.i18nKey("批准人") }, h = { none: s.i18nKey("未写说明"), verified: s.i18nKey("已核实"), unverified: s.i18nKey("未核实"), unknown: s.i18nKey("原因不明，待主管确认") }, K = { none: "muted", verified: "ok", unverified: "bad", unknown: "warn" };
    async function T(S, w, p) {
      E.value = !0, u.value = "";
      try {
        await Y("close.checklist.update", { runId: t.run.id, itemId: S, mark: w, evidence: p }), N("changed");
      } catch (f) {
        u.value = Q.errorMessage(f);
      } finally {
        E.value = !1;
      }
    }
    async function z() {
      E.value = !0;
      try {
        const S = await Y("close.policyTemplate", { locale: t.run.outputLocale });
        await Y("artifact.reveal", { path: S.path });
      } catch (S) {
        Ae.useNotificationStore().error(Q.errorMessage(S));
      } finally {
        E.value = !1;
      }
    }
    return (S, w) => n.value ? (e.openBlock(), e.createElementBlock("div", Oo, [
      n.value.checklist ? (e.openBlock(), e.createElementBlock("details", zo, [
        e.createElementVNode("summary", null, [
          e.createTextVNode(
            e.toDisplayString(S.$t("关账清单")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", n.value.checklist.canStart ? "ok" : "warn"])
            },
            e.toDisplayString(n.value.checklist.canStart ? S.$t("可以开始结账") : S.$t("暂不能开始结账")),
            3
            /* TEXT, CLASS */
          ),
          e.createElementVNode(
            "small",
            Mo,
            e.toDisplayString(S.$t("通过 {a} · 提醒 {b} · 不通过 {c} · 待评 {d}", { a: n.value.checklist.counts.ok, b: n.value.checklist.counts.warn, c: n.value.checklist.counts.fail, d: n.value.checklist.counts.pending })),
            1
            /* TEXT */
          )
        ]),
        n.value.checklist.reasons.length ? (e.openBlock(), e.createElementBlock("ul", jo, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n.value.checklist.reasons, (p, f) => (e.openBlock(), e.createElementBlock(
              "li",
              { key: f },
              e.toDisplayString(e.unref(Z)(p)),
              1
              /* TEXT */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", Ro, [
          e.createElementVNode("table", qo, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                w[0] || (w[0] = e.createElementVNode(
                  "th",
                  null,
                  "#",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("检查项")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("判断方式")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("结果")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("证据 / 说明")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(n.value.checklist.items, (p, f) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: p.id,
                    class: e.normalizeClass({ bad: p.mark === "fail", warn: p.mark === "warn" })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(f + 1),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", Uo, [
                      e.createTextVNode(
                        e.toDisplayString(e.unref(Z)(p.label)) + " ",
                        1
                        /* TEXT */
                      ),
                      p.critical ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Wo,
                        e.toDisplayString(S.$t("关键项")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(p.auto ? S.$t("自动") : S.$t("人工")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode("select", {
                        value: p.mark,
                        disabled: i.value || E.value,
                        "data-test": `fau-mark-${p.id}`,
                        onChange: (y) => T(p.id, y.target.value, p.evidence)
                      }, [
                        (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(L, (y, I) => e.createElementVNode("option", {
                            key: I,
                            value: I
                          }, e.toDisplayString(S.$t(y)), 9, Go)),
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ], 40, Yo)
                    ]),
                    e.createElementVNode("td", Ho, [
                      p.note ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Qo,
                        e.toDisplayString(e.unref(Z)(p.note)),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      p.auto ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("input", {
                        key: 1,
                        value: p.evidence || "",
                        disabled: i.value || E.value,
                        placeholder: S.$t("证据（凭证号、文件名…）"),
                        onChange: (y) => T(p.id, p.mark, y.target.value)
                      }, null, 40, Jo))
                    ])
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        u.value ? (e.openBlock(), e.createElementBlock("p", Zo, [
          w[1] || (w[1] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(u.value),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      n.value.trial ? (e.openBlock(), e.createElementBlock("details", Xo, [
        e.createElementVNode("summary", null, [
          e.createTextVNode(
            e.toDisplayString(S.$t("试算与勾稽")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", n.value.trial.balanced ? "ok" : "bad"])
            },
            e.toDisplayString(n.value.trial.balanced ? S.$t("试算平衡") : S.$t("试算不平")),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode("div", xo, [
          e.createElementVNode("table", es, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("项目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ts,
                  e.toDisplayString(S.$t("借方")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ls,
                  e.toDisplayString(S.$t("贷方")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(S.$t("期初余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", ns, [
                  e.createVNode(l, {
                    cents: n.value.trial.totals.openingDr
                  }, null, 8, ["cents"])
                ]),
                e.createElementVNode("td", as, [
                  e.createVNode(l, {
                    cents: n.value.trial.totals.openingCr
                  }, null, 8, ["cents"])
                ])
              ]),
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(S.$t("本期发生额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", os, [
                  e.createVNode(l, {
                    cents: n.value.trial.totals.periodDr
                  }, null, 8, ["cents"])
                ]),
                e.createElementVNode("td", ss, [
                  e.createVNode(l, {
                    cents: n.value.trial.totals.periodCr
                  }, null, 8, ["cents"])
                ])
              ]),
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(S.$t("期末余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", rs, [
                  e.createVNode(l, {
                    cents: n.value.trial.totals.closingDr
                  }, null, 8, ["cents"])
                ]),
                e.createElementVNode("td", is, [
                  e.createVNode(l, {
                    cents: n.value.trial.totals.closingCr
                  }, null, 8, ["cents"])
                ])
              ])
            ])
          ])
        ]),
        e.createElementVNode("div", cs, [
          e.createElementVNode("table", ds, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("检查项")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  us,
                  e.toDisplayString(S.$t("左边")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ms,
                  e.toDisplayString(S.$t("右边")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ps,
                  e.toDisplayString(S.$t("差额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("结果")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(n.value.trial.checks, (p) => (e.openBlock(), e.createElementBlock("tr", {
                  key: p.id,
                  class: e.normalizeClass({ bad: !p.ok }),
                  "data-test": `fau-tie-${p.id}`
                }, [
                  e.createElementVNode("td", Ns, [
                    e.createTextVNode(
                      e.toDisplayString(S.$t(g[p.id] || p.id)),
                      1
                      /* TEXT */
                    ),
                    w[2] || (w[2] = e.createElementVNode(
                      "br",
                      null,
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "small",
                      Vs,
                      e.toDisplayString(e.unref(Z)(p.message)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", Es, [
                    e.createVNode(l, {
                      cents: p.left
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ks, [
                    e.createVNode(l, {
                      cents: p.right
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", vs, [
                    e.createVNode(l, {
                      cents: p.diff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(p.ok ? "fau-true" : "fau-false")
                      },
                      e.toDisplayString(p.ok ? "TRUE" : "FALSE"),
                      3
                      /* TEXT, CLASS */
                    )
                  ])
                ], 10, ys))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      n.value.crossPeriod ? (e.openBlock(), e.createElementBlock("details", {
        key: 2,
        open: !!n.value.crossPeriod.length,
        class: "fau-sec",
        "data-test": "fau-cross"
      }, [
        e.createElementVNode("summary", null, [
          e.createTextVNode(
            e.toDisplayString(S.$t("跨期调整")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", n.value.crossPeriod.length ? "warn" : "muted"])
            },
            e.toDisplayString(n.value.crossPeriod.length),
            3
            /* TEXT, CLASS */
          )
        ]),
        n.value.crossPeriod.length ? (e.openBlock(), e.createElementBlock("div", fs, [
          e.createElementVNode("table", hs, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("凭证号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("记账日期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("业务日期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("科目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  $s,
                  e.toDisplayString(S.$t("金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("类型")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  _s,
                  e.toDisplayString(S.$t("天数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("审批层级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("建议")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(n.value.crossPeriod, (p) => (e.openBlock(), e.createElementBlock("tr", {
                  key: p.id,
                  class: e.normalizeClass({ warn: p.adjustThisPeriod, bad: p.approval === "approver" }),
                  "data-test": `fau-cross-${p.voucherNo}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.voucherNo
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.date
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.businessDate
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.accountCode
                    }, null, 8, ["value"]),
                    e.createTextVNode(
                      " " + e.toDisplayString(p.accountName),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", bs, [
                    e.createVNode(l, {
                      cents: p.amount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(S.$t(v[p.type])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Ss, [
                    e.createVNode(l, {
                      value: p.days
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createTextVNode(
                      e.toDisplayString(S.$t(b[p.approval])),
                      1
                      /* TEXT */
                    ),
                    p.adjustThisPeriod ? (e.openBlock(), e.createElementBlock(
                      "span",
                      Ds,
                      e.toDisplayString(S.$t("必须本期调整")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode(
                    "td",
                    Cs,
                    e.toDisplayString(e.unref(Z)(p.advice)),
                    1
                    /* TEXT */
                  )
                ], 10, Bs))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          ws,
          e.toDisplayString(S.$t("没有识别到跨期分录")),
          1
          /* TEXT */
        ))
      ], 8, gs)) : e.createCommentVNode("v-if", !0),
      n.value.accruals ? (e.openBlock(), e.createElementBlock("details", Ts, [
        e.createElementVNode("summary", null, [
          e.createTextVNode(
            e.toDisplayString(S.$t("计提表")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            Ls,
            e.toDisplayString(n.value.accruals.length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ks, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: E.value,
            onClick: z
          }, [
            w[3] || (w[3] = e.createElementVNode(
              "i",
              { class: "ri-download-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(S.$t("下载计提政策表模板")),
              1
              /* TEXT */
            )
          ], 8, As),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(m.value, (p) => (e.openBlock(), e.createElementBlock("button", {
              key: p.workbench,
              type: "button",
              class: "ss-btn sm ghost",
              onClick: (f) => e.unref(r).push(p.route || "/")
            }, [
              w[4] || (w[4] = e.createElementVNode(
                "i",
                { class: "ri-external-link-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(S.$t(p.label || "")),
                1
                /* TEXT */
              )
            ], 8, Fs))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        n.value.accruals.length ? (e.openBlock(), e.createElementBlock("div", Is, [
          e.createElementVNode("table", Ps, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("政策编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("计提项目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("费用科目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("负债科目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Os,
                  e.toDisplayString(S.$t("本期应摊")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  zs,
                  e.toDisplayString(S.$t("已入账")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ms,
                  e.toDisplayString(S.$t("本期计提")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("算式")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("自动冲回")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(n.value.accruals, (p) => (e.openBlock(), e.createElementBlock("tr", {
                  key: p.policyId,
                  "data-test": `fau-accrual-${p.policyId}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.policyId
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(p.description),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.expenseAccount
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.liabilityAccount
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Rs, [
                    e.createVNode(l, {
                      cents: p.due
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", qs, [
                    e.createVNode(l, {
                      cents: p.booked
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Us, [
                    e.createElementVNode("strong", null, [
                      e.createVNode(l, {
                        cents: p.accrual
                      }, null, 8, ["cents"])
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.formula
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(p.autoReverse ? S.$t("是") : S.$t("否")),
                    1
                    /* TEXT */
                  )
                ], 8, js))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0),
        n.value.jeDraft?.length ? (e.openBlock(), e.createElementBlock(
          "p",
          Ws,
          e.toDisplayString(S.$t("已生成分录草稿 {n} 行（通用凭证导入格式，不过账）", { n: n.value.jeDraft.length })),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      n.value.rollForward ? (e.openBlock(), e.createElementBlock("details", Ys, [
        e.createElementVNode("summary", null, [
          e.createTextVNode(
            e.toDisplayString(S.$t("滚动表")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", a.value ? "bad" : "ok"])
            },
            e.toDisplayString(a.value ? S.$t("{n} 个科目有未解释差异", { n: a.value }) : S.$t("全部轧平")),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode(
          "p",
          Gs,
          e.toDisplayString(S.$t("期初 + 增加 + 计提 − 冲回 − 付款 ± 重分类 ± 折算 = 期末；轧不平的差额列为「未解释差异」，未倒挤。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Hs, [
          e.createElementVNode("table", Qs, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("科目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Js,
                  e.toDisplayString(S.$t("期初")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Zs,
                  e.toDisplayString(S.$t("增加")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Xs,
                  e.toDisplayString(S.$t("计提")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  xs,
                  e.toDisplayString(S.$t("冲回")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  er,
                  e.toDisplayString(S.$t("付款")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  tr,
                  e.toDisplayString(S.$t("其他")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  lr,
                  e.toDisplayString(S.$t("计算期末")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  nr,
                  e.toDisplayString(S.$t("余额表期末")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ar,
                  e.toDisplayString(S.$t("未解释差异")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(n.value.rollForward, (p) => (e.openBlock(), e.createElementBlock("tr", {
                  key: p.accountCode,
                  class: e.normalizeClass({ bad: p.unexplained !== 0 }),
                  "data-test": `fau-roll-${p.accountCode}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.accountCode
                    }, null, 8, ["value"]),
                    e.createTextVNode(
                      " " + e.toDisplayString(p.accountName),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", sr, [
                    e.createVNode(l, {
                      cents: p.opening
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", rr, [
                    e.createVNode(l, {
                      cents: p.additions
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ir, [
                    e.createVNode(l, {
                      cents: p.accruals
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", cr, [
                    e.createVNode(l, {
                      cents: p.reversals
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", dr, [
                    e.createVNode(l, {
                      cents: p.payments
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ur, [
                    e.createVNode(l, {
                      cents: p.other + p.reclass + p.fx
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", mr, [
                    e.createVNode(l, {
                      cents: p.computed
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", pr, [
                    e.createVNode(l, {
                      cents: p.closing
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", yr, [
                    e.createElementVNode("strong", null, [
                      e.createVNode(l, {
                        cents: p.unexplained
                      }, null, 8, ["cents"])
                    ])
                  ])
                ], 10, or))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      n.value.flux ? (e.openBlock(), e.createElementBlock("details", Nr, [
        e.createElementVNode("summary", null, [
          e.createTextVNode(
            e.toDisplayString(S.$t("波动说明")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            Vr,
            e.toDisplayString(n.value.flux.length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Er, [
          e.createElementVNode("table", kr, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("科目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  vr,
                  e.toDisplayString(S.$t("本期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  gr,
                  e.toDisplayString(S.$t("上期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  fr,
                  e.toDisplayString(S.$t("对上期差额")),
                  1
                  /* TEXT */
                ),
                w[5] || (w[5] = e.createElementVNode(
                  "th",
                  { class: "num" },
                  "%",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("说明")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(S.$t("回核")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(n.value.flux, (p) => (e.openBlock(), e.createElementBlock("tr", {
                  key: p.accountCode,
                  class: e.normalizeClass({ bad: p.commentaryStatus === "unverified" }),
                  "data-test": `fau-flux-${p.accountCode}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.accountCode
                    }, null, 8, ["value"]),
                    e.createTextVNode(
                      " " + e.toDisplayString(p.accountName),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", $r, [
                    e.createVNode(l, {
                      cents: p.current
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", _r, [
                    e.createVNode(l, {
                      cents: p.prior
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Br, [
                    e.createVNode(l, {
                      cents: p.diffPrior
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", br, [
                    e.createVNode(l, {
                      ratio: p.diffPriorPct
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode(
                    "td",
                    Sr,
                    e.toDisplayString(p.commentary),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["fau-badge", K[p.commentaryStatus]])
                      },
                      e.toDisplayString(S.$t(h[p.commentaryStatus])),
                      3
                      /* TEXT, CLASS */
                    )
                  ])
                ], 10, hr))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("details", {
        class: "fau-sec",
        open: !!n.value.openItems.length,
        "data-test": "fau-open-items"
      }, [
        e.createElementVNode("summary", null, [
          e.createTextVNode(
            e.toDisplayString(S.$t("未结事项")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            Cr,
            e.toDisplayString(n.value.openItems.length),
            1
            /* TEXT */
          )
        ]),
        n.value.openItems.length ? (e.openBlock(), e.createElementBlock("ul", wr, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n.value.openItems, (p) => (e.openBlock(), e.createElementBlock("li", {
              key: p.id
            }, [
              e.createTextVNode(
                e.toDisplayString(p.description) + " · ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                cents: p.amount
              }, null, 8, ["cents"])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Tr,
          e.toDisplayString(S.$t("对账中心签核后转交过来的差异会出现在这里")),
          1
          /* TEXT */
        ))
      ], 8, Dr)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Kr = /* @__PURE__ */ ae(Lr, [["__scopeId", "data-v-af060347"]]), Ar = {
  key: 0,
  class: "fau-recon",
  "data-test": "fau-recon-panel"
}, Fr = ["data-test"], Ir = { class: "fau-row" }, Pr = { class: "grow" }, Or = { class: "fau-counts" }, zr = ["data-test"], Mr = { class: "fau-table-wrap" }, jr = { class: "fau-table" }, Rr = { class: "num" }, qr = { class: "num" }, Ur = { class: "num" }, Wr = { class: "num" }, Yr = { class: "num" }, Gr = { class: "num" }, Hr = { class: "num" }, Qr = { class: "num" }, Jr = { class: "num" }, Zr = {
  key: 0,
  class: "fau-esc",
  "data-test": "fau-bank-escalations"
}, Xr = ["open"], xr = { class: "fau-table-wrap" }, ei = { class: "fau-table" }, ti = { class: "num" }, li = { class: "num" }, ni = { class: "num" }, ai = { class: "num" }, oi = {
  key: 0,
  class: "fau-badge bad"
}, si = { class: "fau-table-wrap" }, ri = { class: "fau-table" }, ii = { class: "num" }, ci = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-glsub"
}, di = { class: "fau-row" }, ui = { class: "grow" }, mi = { class: "fau-badge" }, pi = { class: "fau-counts" }, yi = ["data-test"], Ni = {
  key: 0,
  class: "fau-esc"
}, Vi = { class: "fau-table-wrap" }, Ei = { class: "fau-table" }, ki = { class: "num" }, vi = { class: "num" }, gi = { class: "num" }, fi = ["data-test"], hi = {
  key: 0,
  class: "fau-badge bad"
}, $i = { class: "num" }, _i = { class: "num" }, Bi = { class: "num" }, bi = { class: "wrap" }, Si = {
  key: 0,
  class: "ss-muted"
}, Di = ["data-test"], Ci = {
  key: 1,
  class: "ss-muted"
}, wi = ["disabled", "onClick"], Ti = {
  key: 1,
  class: "ss-note danger"
}, Li = /* @__PURE__ */ e.defineComponent({
  __name: "ReconPanel",
  props: {
    run: {}
  },
  emits: ["open-run"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = e.computed(() => t.run.result), n = e.ref(!1), i = e.ref(""), a = ue.FAU_BANK_CLASSES, m = s.listSeparator(), E = ue.FAU_GLSUB_CLASSES, u = {
      matched: s.i18nKey("已达"),
      book_out_bank_not: s.i18nKey("企业已付银行未付"),
      book_in_bank_not: s.i18nKey("企业已收银行未收"),
      bank_out_book_not: s.i18nKey("银行已付企业未付"),
      bank_in_book_not: s.i18nKey("银行已收企业未收"),
      amount_diff: s.i18nKey("金额差异"),
      unmatched: s.i18nKey("无法匹配")
    }, L = {
      matched: s.i18nKey("相符"),
      amount: s.i18nKey("金额差异"),
      quantity: s.i18nKey("数量差异"),
      timing: s.i18nKey("时间差异"),
      gl_only: s.i18nKey("仅总账有"),
      sub_only: s.i18nKey("仅子账有")
    }, g = {
      timing: s.i18nKey("时间性差异"),
      fx: s.i18nKey("汇率"),
      mapping: s.i18nKey("映射"),
      duplicate_or_missing: s.i18nKey("重复或漏记"),
      fee_or_accrual: s.i18nKey("费用 / 计提"),
      data_quality: s.i18nKey("数据质量"),
      fee: s.i18nKey("银行手续费"),
      interest: s.i18nKey("利息"),
      unknown_deduction: s.i18nKey("不明扣款")
    }, v = (h) => h.items.some((K) => K.cls !== "matched");
    async function b(h) {
      n.value = !0, i.value = "";
      try {
        const K = await Y("recon.break.retrace", { runId: t.run.id, breakId: h });
        N("open-run", K.id);
      } catch (K) {
        i.value = Q.errorMessage(K);
      } finally {
        n.value = !1;
      }
    }
    return (h, K) => r.value ? (e.openBlock(), e.createElementBlock("div", Ar, [
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(r.value.bank || [], (T) => (e.openBlock(), e.createElementBlock("section", {
          key: T.account,
          class: "fau-sec",
          "data-test": `fau-bank-${T.account}`
        }, [
          e.createElementVNode("header", Ir, [
            e.createElementVNode("strong", Pr, [
              e.createTextVNode(
                e.toDisplayString(h.$t("银行账户")) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: T.account
              }, null, 8, ["value"])
            ]),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["fau-badge", T.statement.balanced ? "ok" : "bad"]),
                "data-test": "fau-bank-balanced"
              },
              e.toDisplayString(T.statement.balanced ? h.$t("调节后两边相等") : h.$t("调节后两边不相等")),
              3
              /* TEXT, CLASS */
            )
          ]),
          e.createElementVNode("div", Or, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(a), (z) => (e.openBlock(), e.createElementBlock("span", {
                key: z,
                class: e.normalizeClass(["fau-badge", z === "matched" ? "ok" : T.counts[z] ? "warn" : "muted"]),
                "data-test": `fau-bank-count-${z}`
              }, [
                e.createTextVNode(
                  e.toDisplayString(h.$t(u[z])) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: T.counts[z] || 0
                }, null, 8, ["value"])
              ], 10, zr))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", Mr, [
            e.createElementVNode("table", jr, [
              e.createElementVNode("tbody", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(h.$t("企业账面余额")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Rr, [
                    e.createVNode(l, {
                      cents: T.statement.bookBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(h.$t("银行对账单余额")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", qr, [
                    e.createVNode(l, {
                      cents: T.statement.bankBalance
                    }, null, 8, ["cents"])
                  ])
                ]),
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(h.$t("加：银行已收企业未收")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Ur, [
                    e.createVNode(l, {
                      cents: T.statement.addBankInNotBook
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(h.$t("加：企业已收银行未收")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Wr, [
                    e.createVNode(l, {
                      cents: T.statement.addBookInNotBank
                    }, null, 8, ["cents"])
                  ])
                ]),
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(h.$t("减：银行已付企业未付")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Yr, [
                    e.createVNode(l, {
                      cents: T.statement.lessBankOutNotBook
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(h.$t("减：企业已付银行未付")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Gr, [
                    e.createVNode(l, {
                      cents: T.statement.lessBookOutNotBank
                    }, null, 8, ["cents"])
                  ])
                ]),
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(h.$t("加减：金额差异调整")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Hr, [
                    e.createVNode(l, {
                      cents: T.statement.amountDiffAdj
                    }, null, 8, ["cents"])
                  ]),
                  K[0] || (K[0] = e.createElementVNode(
                    "td",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  K[1] || (K[1] = e.createElementVNode(
                    "td",
                    null,
                    null,
                    -1
                    /* CACHED */
                  ))
                ]),
                e.createElementVNode("tr", null, [
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(h.$t("调整后企业余额")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", Qr, [
                    e.createElementVNode("strong", null, [
                      e.createVNode(l, {
                        cents: T.statement.adjustedBook
                      }, null, 8, ["cents"])
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(h.$t("调整后银行余额")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", Jr, [
                    e.createElementVNode("strong", null, [
                      e.createVNode(l, {
                        cents: T.statement.adjustedBank
                      }, null, 8, ["cents"])
                    ])
                  ])
                ])
              ])
            ])
          ]),
          T.escalations.length ? (e.openBlock(), e.createElementBlock("ul", Zr, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(T.escalations, (z, S) => (e.openBlock(), e.createElementBlock("li", { key: S }, [
                K[2] || (K[2] = e.createElementVNode(
                  "i",
                  { class: "ri-alarm-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(e.unref(Z)(z)),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("details", {
            open: v(T)
          }, [
            e.createElementVNode(
              "summary",
              null,
              e.toDisplayString(h.$t("未达账项明细")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", xr, [
              e.createElementVNode("table", ei, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(h.$t("分类")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(h.$t("日期")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(h.$t("流水号 / 单号")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(h.$t("对方")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(h.$t("摘要")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      ti,
                      e.toDisplayString(h.$t("账面金额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      li,
                      e.toDisplayString(h.$t("银行金额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(h.$t("原因")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(T.items.filter((z) => z.cls !== "matched"), (z) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: z.id,
                        class: e.normalizeClass({ bad: !!z.escalate })
                      },
                      [
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(h.$t(u[z.cls])),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.createVNode(l, {
                            value: z.date
                          }, null, 8, ["value"])
                        ]),
                        e.createElementVNode("td", null, [
                          e.createVNode(l, {
                            value: z.ref
                          }, null, 8, ["value"])
                        ]),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(z.counterparty),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(z.summary),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", ni, [
                          e.createVNode(l, {
                            cents: z.bookAmount
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", ai, [
                          e.createVNode(l, {
                            cents: z.bankAmount
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", null, [
                          e.createTextVNode(
                            e.toDisplayString(z.cause ? h.$t(g[z.cause] || z.cause) : ""),
                            1
                            /* TEXT */
                          ),
                          z.escalate ? (e.openBlock(), e.createElementBlock(
                            "span",
                            oi,
                            e.toDisplayString(e.unref(Z)(z.escalate)),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ],
                      2
                      /* CLASS */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ], 8, Xr),
          e.createElementVNode("details", null, [
            e.createElementVNode(
              "summary",
              null,
              e.toDisplayString(h.$t("已达账项")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", si, [
              e.createElementVNode("table", ri, [
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(T.items.filter((z) => z.cls === "matched"), (z) => (e.openBlock(), e.createElementBlock("tr", {
                      key: z.id
                    }, [
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: z.date
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: z.ref
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(z.summary),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", ii, [
                        e.createVNode(l, {
                          cents: z.bankAmount
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(h.$t("第 {n} 轮", { n: z.pass || "-" })),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ])
        ], 8, Fr))),
        128
        /* KEYED_FRAGMENT */
      )),
      r.value.glsub ? (e.openBlock(), e.createElementBlock("section", ci, [
        e.createElementVNode("header", di, [
          e.createElementVNode(
            "strong",
            ui,
            e.toDisplayString(h.$t("总账与子账")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", mi, [
            e.createTextVNode(
              e.toDisplayString(h.$t("相符率")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              ratio: r.value.glsub.matchRate
            }, null, 8, ["ratio"])
          ])
        ]),
        e.createElementVNode("div", pi, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(E), (T) => (e.openBlock(), e.createElementBlock("span", {
              key: T,
              class: e.normalizeClass(["fau-badge", T === "matched" ? "ok" : r.value.glsub.counts[T] ? "warn" : "muted"]),
              "data-test": `fau-glsub-count-${T}`
            }, [
              e.createTextVNode(
                e.toDisplayString(h.$t(L[T])) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: r.value.glsub.counts[T] || 0
              }, null, 8, ["value"])
            ], 10, yi))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        r.value.glsub.escalations.length ? (e.openBlock(), e.createElementBlock("ul", Ni, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(r.value.glsub.escalations, (T, z) => (e.openBlock(), e.createElementBlock("li", { key: z }, [
              K[3] || (K[3] = e.createElementVNode(
                "i",
                { class: "ri-alarm-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(e.unref(Z)(T)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", Vi, [
          e.createElementVNode("table", Ei, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(h.$t("对账键")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(h.$t("分类")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ki,
                  e.toDisplayString(h.$t("总账金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  vi,
                  e.toDisplayString(h.$t("子账金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  gi,
                  e.toDisplayString(h.$t("差额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(h.$t("可能成因")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(h.$t("根因")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(h.$t("回核")),
                  1
                  /* TEXT */
                ),
                K[4] || (K[4] = e.createElementVNode(
                  "th",
                  null,
                  null,
                  -1
                  /* CACHED */
                ))
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.glsub.breaks.filter((T) => T.cls !== "matched"), (T) => (e.openBlock(), e.createElementBlock("tr", {
                  key: T.id,
                  class: e.normalizeClass({ bad: T.major }),
                  "data-test": `fau-break-${T.key}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: T.key
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createTextVNode(
                      e.toDisplayString(h.$t(L[T.cls])),
                      1
                      /* TEXT */
                    ),
                    T.major ? (e.openBlock(), e.createElementBlock(
                      "span",
                      hi,
                      e.toDisplayString(h.$t("重大")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("td", $i, [
                    e.createVNode(l, {
                      cents: T.glAmount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", _i, [
                    e.createVNode(l, {
                      cents: T.subAmount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Bi, [
                    e.createVNode(l, {
                      cents: T.diff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(T.causes.map((z) => h.$t(g[z] || z)).join(e.unref(m))),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", bi, [
                    e.createTextVNode(
                      e.toDisplayString(T.trace?.rootCause),
                      1
                      /* TEXT */
                    ),
                    T.trace ? (e.openBlock(), e.createElementBlock("small", Si, [
                      K[5] || (K[5] = e.createElementVNode(
                        "br",
                        null,
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(T.trace.owner) + " · ",
                        1
                        /* TEXT */
                      ),
                      e.createVNode(l, {
                        value: T.trace.expectedClearDate
                      }, null, 8, ["value"])
                    ])) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("td", null, [
                    T.trace ? (e.openBlock(), e.createElementBlock("span", {
                      key: 0,
                      class: e.normalizeClass(["fau-badge", T.trace.status === "verified" ? "ok" : "bad"]),
                      "data-test": `fau-trace-${T.key}`
                    }, e.toDisplayString(T.trace.status === "verified" ? h.$t("已核实") : T.trace.status === "rejected" ? h.$t("已打回") : h.$t("未核实")), 11, Di)) : e.createCommentVNode("v-if", !0),
                    T.trace?.missing?.length ? (e.openBlock(), e.createElementBlock("small", Ci, [
                      K[6] || (K[6] = e.createElementVNode(
                        "br",
                        null,
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createVNode(l, {
                        value: T.trace.missing.join(", ")
                      }, null, 8, ["value"])
                    ])) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("td", null, [
                    c.run.modeId === "glsub" ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-btn sm ghost",
                      disabled: n.value,
                      onClick: (z) => b(T.id)
                    }, [
                      K[7] || (K[7] = e.createElementVNode(
                        "i",
                        { class: "ri-search-eye-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(h.$t("重新追溯")),
                        1
                        /* TEXT */
                      )
                    ], 8, wi)) : e.createCommentVNode("v-if", !0)
                  ])
                ], 10, fi))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        i.value ? (e.openBlock(), e.createElementBlock("p", Ti, [
          K[8] || (K[8] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(i.value),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Ki = /* @__PURE__ */ ae(Li, [["__scopeId", "data-v-f7ae4859"]]), Ai = ["data-test"], Fi = {
  key: 0,
  class: "fau-fpa-sec"
}, Ii = { class: "fau-fpa-alerts" }, Pi = ["data-test"], Oi = {
  key: 1,
  class: "fau-fpa-sec",
  "data-test": "fau-fpa-sources"
}, zi = { class: "fau-row" }, Mi = ["data-test"], ji = ["data-test"], Ri = { class: "fau-fpa-legend" }, qi = { class: "fau-fpa-chart" }, Ui = { class: "lbl" }, Wi = { class: "bars" }, Yi = ["data-test"], Gi = { class: "ss-muted" }, Hi = { class: "fau-table-wrap" }, Qi = { class: "fau-table" }, Ji = ["data-test"], Zi = {
  key: 2,
  class: "fau-fpa-sec"
}, Xi = ["data-test"], xi = { class: "fau-row" }, ec = { class: "grow" }, tc = {
  key: 0,
  class: "ss-muted"
}, lc = {
  key: 3,
  class: "fau-fpa-sec",
  "data-test": "fau-fpa-checks"
}, nc = { class: "fau-fpa-checks" }, ac = ["data-test"], oc = /* @__PURE__ */ e.defineComponent({
  __name: "FpaPanel",
  props: {
    run: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result), N = { green: s.i18nKey("绿灯"), yellow: s.i18nKey("黄灯"), red: s.i18nKey("红灯") }, r = { green: "ok", yellow: "warn", red: "bad" }, n = { verified: s.i18nKey("已核实"), unverified: s.i18nKey("未核实"), unknown: s.i18nKey("原因不明，待主管确认") }, i = ["amount", "pct", "num"], a = (u) => typeof u == "number" ? u : null;
    function m(u, L) {
      const g = Math.max(...u.series.flatMap((v) => v.values.map((b) => Math.abs(b ?? 0))), 0);
      return g && L != null ? Math.max(1, Math.round(Math.abs(L) / g * 75)) : 0;
    }
    function E(u, L) {
      const g = u.columns.filter((v) => v.kind === "level").map((v) => L[v.key]);
      return g.includes("red") || u.columns.some((v) => v.kind === "label" && L[v.key] === s.i18nKey("未核实")) ? "bad" : g.includes("yellow") ? "warn" : "";
    }
    return (u, L) => t.value ? (e.openBlock(), e.createElementBlock("div", {
      key: 0,
      class: "fau-fpa",
      "data-test": `fau-fpa-${t.value.moduleId}`
    }, [
      t.value.alerts.length ? (e.openBlock(), e.createElementBlock("section", Fi, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(u.$t("预警")),
          1
          /* TEXT */
        ),
        e.createElementVNode("ul", Ii, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.alerts, (g) => (e.openBlock(), e.createElementBlock("li", {
              key: g.id,
              class: e.normalizeClass(g.level),
              "data-test": `fau-fpa-alert-${g.id}`
            }, [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["fau-badge", r[g.level]])
                },
                e.toDisplayString(u.$t(N[g.level])),
                3
                /* TEXT, CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(e.unref(Z)(g.message)),
                1
                /* TEXT */
              )
            ], 10, Pi))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.sources.length ? (e.openBlock(), e.createElementBlock("section", Oi, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(u.$t("数据来源")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", zi, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.sources, (g) => (e.openBlock(), e.createElementBlock("span", {
              key: g.datasetId,
              class: e.normalizeClass(["fau-badge", g.signed ? "ok" : "warn"]),
              "data-test": `fau-fpa-source-${g.slot}`
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(g.signed ? "ri-shield-check-line" : "ri-error-warning-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(g.label) + " · " + e.toDisplayString(g.signed ? u.$t("已签核") : u.$t("未签核")),
                1
                /* TEXT */
              )
            ], 10, Mi))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(t.value.charts, (g) => (e.openBlock(), e.createElementBlock("section", {
          key: g.id,
          class: "fau-fpa-sec",
          "data-test": `fau-fpa-chart-${g.id}`
        }, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(u.$t(g.title)),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", Ri, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(g.series, (v, b) => (e.openBlock(), e.createElementBlock("span", {
                key: v.name
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(["sw", `s${b % 3}`])
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(u.$t(v.name)),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", qi, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(g.labels, (v, b) => (e.openBlock(), e.createElementBlock("div", {
                key: b,
                class: "fau-fpa-bar-row"
              }, [
                e.createElementVNode(
                  "span",
                  Ui,
                  e.toDisplayString(g.labelKeys ? u.$t(v) : v),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", Wi, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(g.series, (h, K) => (e.openBlock(), e.createElementBlock("div", {
                      key: h.name,
                      class: "bar-line"
                    }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["bar", [`s${K % 3}`, { neg: (h.values[b] ?? 0) < 0 }]]),
                          style: e.normalizeStyle({ inlineSize: `${m(g, h.values[b])}%` })
                        },
                        null,
                        6
                        /* CLASS, STYLE */
                      ),
                      g.unit === "amount" ? (e.openBlock(), e.createBlock(l, {
                        key: 0,
                        cents: h.values[b]
                      }, null, 8, ["cents"])) : g.unit === "pct" ? (e.openBlock(), e.createBlock(l, {
                        key: 1,
                        ratio: h.values[b]
                      }, null, 8, ["ratio"])) : (e.openBlock(), e.createBlock(l, {
                        key: 2,
                        value: h.values[b]
                      }, null, 8, ["value"]))
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ], 8, ji))),
        128
        /* KEYED_FRAGMENT */
      )),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(t.value.tables, (g) => (e.openBlock(), e.createElementBlock("section", {
          key: g.id,
          class: "fau-fpa-sec",
          "data-test": `fau-fpa-table-${g.id}`
        }, [
          e.createElementVNode("h4", null, [
            e.createTextVNode(
              e.toDisplayString(u.$t(g.title)) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              Gi,
              e.toDisplayString(u.$t("{n} 行", { n: g.rows.length })),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Hi, [
            e.createElementVNode("table", Qi, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(g.columns, (v) => (e.openBlock(), e.createElementBlock(
                      "th",
                      {
                        key: v.key,
                        class: e.normalizeClass({ num: i.includes(v.kind) })
                      },
                      e.toDisplayString(u.$t(v.label)),
                      3
                      /* TEXT, CLASS */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(g.rows, (v, b) => (e.openBlock(), e.createElementBlock("tr", {
                    key: b,
                    class: e.normalizeClass(E(g, v)),
                    "data-test": `fau-fpa-row-${g.id}-${b}`
                  }, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(g.columns, (h) => (e.openBlock(), e.createElementBlock(
                        "td",
                        {
                          key: h.key,
                          class: e.normalizeClass({ num: i.includes(h.kind), wrap: h.kind === "text" && String(v[h.key] ?? "").length > 40 })
                        },
                        [
                          h.kind === "amount" ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            cents: a(v[h.key])
                          }, null, 8, ["cents"])) : h.kind === "pct" ? (e.openBlock(), e.createBlock(l, {
                            key: 1,
                            ratio: a(v[h.key])
                          }, null, 8, ["ratio"])) : h.kind === "num" ? (e.openBlock(), e.createBlock(l, {
                            key: 2,
                            value: v[h.key]
                          }, null, 8, ["value"])) : h.kind === "level" && v[h.key] ? (e.openBlock(), e.createElementBlock(
                            "span",
                            {
                              key: 3,
                              class: e.normalizeClass(["fau-badge", r[String(v[h.key])]])
                            },
                            e.toDisplayString(u.$t(N[String(v[h.key])] || String(v[h.key]))),
                            3
                            /* TEXT, CLASS */
                          )) : h.kind === "label" ? (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 4 },
                            [
                              e.createTextVNode(
                                e.toDisplayString(v[h.key] ? u.$t(String(v[h.key])) : ""),
                                1
                                /* TEXT */
                              )
                            ],
                            64
                            /* STABLE_FRAGMENT */
                          )) : (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 5 },
                            [
                              e.createTextVNode(
                                e.toDisplayString(v[h.key] ?? ""),
                                1
                                /* TEXT */
                              )
                            ],
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ],
                        2
                        /* CLASS */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ], 10, Ji))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])
        ], 8, Yi))),
        128
        /* KEYED_FRAGMENT */
      )),
      t.value.narratives.length ? (e.openBlock(), e.createElementBlock("section", Zi, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(u.$t("说明")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.narratives, (g) => (e.openBlock(), e.createElementBlock("article", {
            key: g.id,
            class: e.normalizeClass(["fau-fpa-nar", { bad: g.status === "unverified" }]),
            "data-test": `fau-fpa-nar-${g.id}`
          }, [
            e.createElementVNode("header", xi, [
              e.createElementVNode(
                "strong",
                ec,
                e.toDisplayString(u.$t(g.heading)),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["fau-badge", g.status === "verified" ? "ok" : g.status === "unverified" ? "bad" : "muted"])
                },
                e.toDisplayString(u.$t(n[g.status])),
                3
                /* TEXT, CLASS */
              )
            ]),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(g.text),
              1
              /* TEXT */
            ),
            g.missing?.length ? (e.openBlock(), e.createElementBlock("small", tc, [
              e.createTextVNode(
                e.toDisplayString(u.$t("数据里找不到")) + ": ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: g.missing.join(", ")
              }, null, 8, ["value"])
            ])) : e.createCommentVNode("v-if", !0)
          ], 10, Xi))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      t.value.checks.length ? (e.openBlock(), e.createElementBlock("section", lc, [
        L[0] || (L[0] = e.createElementVNode(
          "h4",
          null,
          "Checks",
          -1
          /* CACHED */
        )),
        e.createElementVNode("ul", nc, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.checks, (g) => (e.openBlock(), e.createElementBlock("li", {
              key: g.id,
              "data-test": `fau-fpa-check-${g.id}`
            }, [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(g.ok ? "fau-true" : "fau-false")
                },
                e.toDisplayString(g.ok ? "TRUE" : "FALSE"),
                3
                /* TEXT, CLASS */
              ),
              e.createTextVNode(
                " " + e.toDisplayString(e.unref(Z)(g.message)),
                1
                /* TEXT */
              )
            ], 8, ac))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0)
    ], 8, Ai)) : e.createCommentVNode("v-if", !0);
  }
}), sc = /* @__PURE__ */ ae(oc, [["__scopeId", "data-v-d21ce60c"]]), rc = {
  class: "fau-input fau-tax-params",
  "data-test": "fau-tax-params"
}, ic = { class: "fau-badge muted" }, cc = ["data-test", "disabled", "onClick"], dc = { class: "ss-grid" }, uc = ["onUpdate:modelValue", "disabled", "data-test"], mc = ["value"], pc = ["onUpdate:modelValue", "disabled", "data-test"], yc = ["onUpdate:modelValue", "inputmode", "placeholder", "disabled", "data-test"], Nc = {
  key: 0,
  class: "ss-note info"
}, Vc = { class: "ss-actions" }, Ec = ["disabled"], kc = {
  key: 0,
  class: "fau-badge ok"
}, vc = {
  key: 1,
  class: "ss-note danger"
}, gc = /* @__PURE__ */ e.defineComponent({
  __name: "TaxParams",
  props: {
    run: {},
    def: {},
    editable: { type: Boolean }
  },
  emits: ["save"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = {
      vat_lines: s.i18nKey("销项与进项明细"),
      iit_rows: s.i18nKey("工资个税明细"),
      wht_payments: s.i18nKey("向非居民付款明细"),
      temp_diffs: s.i18nKey("暂时性差异明细"),
      disclosure_events: s.i18nKey("重大事项与交易清单"),
      rp_transactions: s.i18nKey("关联交易明细"),
      tp_comparables: s.i18nKey("可比公司财务数据")
    }, n = Object.keys(r), i = { key: "period", label: s.i18nKey("税期（不填用项目期间；YYYY-MM / YYYY-Qn / YYYY）"), type: "text", placeholder: "2026-09" }, a = (y, I) => ({ key: y, label: I, type: "number" }), m = (y, I) => ({ key: y, label: I, type: "bool", dflt: !1 }), E = {
      cn: [
        i,
        { key: "taxpayerType", label: s.i18nKey("纳税人类型"), type: "select", dflt: "general", options: [{ value: "general", label: s.i18nKey("一般纳税人") }, { value: "small", label: s.i18nKey("小规模纳税人") }] },
        { key: "cityTier", label: s.i18nKey("城市维护建设税档次"), type: "select", dflt: "urban", options: [{ value: "urban", label: s.i18nKey("市区（7%）") }, { value: "county", label: s.i18nKey("县城、镇（5%）") }, { value: "other", label: s.i18nKey("其他（1%）") }] },
        m("smallLowProfit", s.i18nKey("小型微利企业（享受所得税优惠与六税两费减半）")),
        m("quarterly", s.i18nKey("按季申报")),
        a("uninvoicedSales", s.i18nKey("未开票收入（不含税）")),
        a("inputTransferOut", s.i18nKey("进项税额转出")),
        a("carriedCredit", s.i18nKey("上期留抵税额")),
        a("citPaidYtd", s.i18nKey("本年已预缴企业所得税"))
      ],
      sa_vat: [i, a("carriedCredit", s.i18nKey("上期留抵税额")), a("priorCorrection", s.i18nKey("上期更正（补税为正，少报进项为负）"))],
      ae_vat: [i, a("carriedCredit", s.i18nKey("上期留抵税额")), a("priorCorrection", s.i18nKey("上期更正（补税为正，少报进项为负）"))],
      sa_zakat: [
        { ...i, label: s.i18nKey("会计年度（YYYY，或年末月份 YYYY-MM）"), placeholder: "2025" },
        { key: "zakatYearBasis", label: s.i18nKey("天课年度口径"), type: "select", dflt: "", options: [{ value: "", label: s.i18nKey("按公司档案") }, { value: "gregorian", label: s.i18nKey("公历年（按天数折算）") }, { value: "hijri", label: s.i18nKey("回历年") }] },
        { key: "saudiShare", label: s.i18nKey("沙特 / 海湾国家股东持股比例（%）"), type: "number", placeholder: "100" },
        a("profitAdjust", s.i18nKey("调整后净利润的调整额（不可扣除项为正）"))
      ],
      sa_wht: [i],
      ae_cit: [
        { ...i, label: s.i18nKey("税期（YYYY，或年末月份 YYYY-MM）"), placeholder: "2025" },
        a("citAdjust", s.i18nKey("纳税调整（不可扣除为正，免税收入为负）")),
        m("smallBusinessRelief", s.i18nKey("选择适用小企业减免")),
        m("qualifyingFreeZone", s.i18nKey("自由区合格主体"))
      ],
      intl: [
        i,
        { key: "vatStandardRate", label: s.i18nKey("增值税 / 商品服务税标准税率（%）"), type: "number" },
        { key: "incomeTaxRate", label: s.i18nKey("所得税税率（%）"), type: "number" },
        a("taxAdjust", s.i18nKey("纳税调整（不可扣除为正，免税收入为负）")),
        a("carriedCredit", s.i18nKey("上期留抵税额"))
      ],
      disclosure: [
        i,
        { key: "regime", label: s.i18nKey("披露规则"), type: "select", dflt: "", options: [{ value: "", label: s.i18nKey("按公司主地区") }, { value: "cn_sse", label: s.i18nKey("中国：上交所股票上市规则") }, { value: "sa_cma", label: s.i18nKey("沙特：资本市场管理局规则") }, { value: "intl", label: s.i18nKey("国际：IAS 24 与重要性") }] },
        a("auditedTotalAssets", s.i18nKey("最近一期经审计总资产")),
        a("auditedNetAssets", s.i18nKey("最近一期经审计净资产")),
        a("auditedRevenue", s.i18nKey("最近一个会计年度经审计营业收入")),
        a("auditedNetProfit", s.i18nKey("最近一个会计年度经审计净利润"))
      ],
      local_file: [],
      benchmark: []
    }, u = [
      i,
      { key: "tpJurisdiction", label: s.i18nKey("按哪个地区的规定判断"), type: "select", dflt: "", options: [{ value: "", label: s.i18nKey("按公司主地区") }, { value: "CN", label: s.i18nKey("中国") }, { value: "SA", label: s.i18nKey("沙特") }, { value: "AE", label: s.i18nKey("阿联酋") }, { value: "INTL", label: s.i18nKey("国际") }] },
      { key: "pli", label: s.i18nKey("利润水平指标"), type: "select", dflt: "ncp", options: [{ value: "ncp", label: s.i18nKey("完全成本加成率") }, { value: "om", label: s.i18nKey("营业利润率") }] },
      a("testedRevenue", s.i18nKey("受测方营业收入")),
      a("testedOperatingProfit", s.i18nKey("受测方营业利润")),
      a("testedTotalCost", s.i18nKey("受测方总成本"))
    ], L = [
      a("groupRevenue", s.i18nKey("集团合并收入")),
      m("groupHasMasterFile", s.i18nKey("集团已准备主体文档")),
      m("hasDisclosure", s.i18nKey("已准备关联交易披露表")),
      m("hasMasterFile", s.i18nKey("已准备主体文档")),
      m("hasLocalFile", s.i18nKey("已准备本地文档")),
      m("hasCbcr", s.i18nKey("已准备国别报告")),
      a("intlCbcrThreshold", s.i18nKey("国际口径国别报告门槛（按本位币）"))
    ];
    E.local_file = [...u, ...L], E.benchmark = u;
    const g = {
      cn: s.i18nKey("中国口径直接调用财务智能体的计算，结果与它逐项相同；申报代填请到财务智能体「申报上报」，由人提交。"),
      sa_zakat: s.i18nKey("天课基数按年末余额表逐行归类，计算结果为草稿口径，需当地专业人士复核。"),
      ae_cit: s.i18nKey("应纳税所得额 375,000 迪拉姆以内按 0%，超过部分按 9%；结果为草稿口径，需当地专业人士复核。"),
      disclosure: s.i18nKey("分母请填最近一期经审计的数字；不填时用上传的余额表计算。")
    }, v = e.computed(() => E[t.run.modeId] || []), b = e.computed(() => g[t.run.modeId] || ""), h = e.computed(() => [...new Set(ie.inputsForMode(t.def, t.run.modeId).map((y) => y.kind).filter((y) => n.includes(y)))]), K = e.reactive({}), T = e.ref(!1), z = e.ref(!1), S = e.ref("");
    function w() {
      for (const y of Object.keys(K)) delete K[y];
      for (const y of v.value) {
        const I = t.run.params[y.key];
        K[y.key] = I === void 0 ? y.dflt ?? "" : y.key === "saudiShare" && typeof I == "number" && I <= 1 ? I * 100 : I;
      }
    }
    e.watch(() => [t.run.id, t.run.modeId, t.run.updatedAt], w, { immediate: !0 });
    function p() {
      const y = {};
      for (const I of v.value) {
        const B = K[I.key];
        if (I.type === "number") {
          const k = Number(String(B ?? "").replace(/[,\s%]/g, ""));
          y[I.key] = String(B ?? "").trim() !== "" && Number.isFinite(k) ? k : "";
        } else I.type === "bool" ? y[I.key] = !!B : y[I.key] = String(B ?? "").trim();
      }
      N("save", y), z.value = !0, setTimeout(() => {
        z.value = !1;
      }, 2e3);
    }
    async function f(y) {
      T.value = !0, S.value = "";
      try {
        const I = await Y("tax.template", { kind: y, locale: t.run.outputLocale });
        await Y("artifact.reveal", { path: I.path });
      } catch (I) {
        S.value = Q.errorMessage(I);
      } finally {
        T.value = !1;
      }
    }
    return (y, I) => (e.openBlock(), e.createElementBlock("div", rc, [
      e.createElementVNode("header", null, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(y.$t("申报参数")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          ic,
          e.toDisplayString(y.$t("金额按主单位填写")),
          1
          /* TEXT */
        ),
        I[1] || (I[1] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(h.value, (B) => (e.openBlock(), e.createElementBlock("button", {
            key: B,
            type: "button",
            class: "ss-link",
            "data-test": `fau-tax-template-${B}`,
            disabled: T.value,
            onClick: (k) => f(B)
          }, [
            I[0] || (I[0] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(y.$t("下载模板：{p0}", { p0: y.$t(r[B] || B) })),
              1
              /* TEXT */
            )
          ], 8, cc))),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      e.createElementVNode("div", dc, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(v.value, (B) => (e.openBlock(), e.createElementBlock(
            "label",
            {
              key: B.key,
              class: e.normalizeClass(["ss-field", { check: B.type === "bool" }])
            },
            [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(y.$t(B.label)),
                1
                /* TEXT */
              ),
              B.type === "select" ? e.withDirectives((e.openBlock(), e.createElementBlock("select", {
                key: 0,
                "onUpdate:modelValue": (k) => K[B.key] = k,
                disabled: !c.editable,
                "data-test": `fau-param-${B.key}`
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(B.options, (k) => (e.openBlock(), e.createElementBlock("option", {
                    key: k.value,
                    value: k.value
                  }, e.toDisplayString(y.$t(k.label)), 9, mc))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 8, uc)), [
                [e.vModelSelect, K[B.key]]
              ]) : B.type === "bool" ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                key: 1,
                "onUpdate:modelValue": (k) => K[B.key] = k,
                type: "checkbox",
                disabled: !c.editable,
                "data-test": `fau-param-${B.key}`
              }, null, 8, pc)), [
                [e.vModelCheckbox, K[B.key]]
              ]) : e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                key: 2,
                "onUpdate:modelValue": (k) => K[B.key] = k,
                inputmode: B.type === "number" ? "decimal" : "text",
                dir: "ltr",
                placeholder: B.placeholder || "",
                disabled: !c.editable,
                "data-test": `fau-param-${B.key}`
              }, null, 8, yc)), [
                [
                  e.vModelText,
                  K[B.key],
                  void 0,
                  { trim: !0 }
                ]
              ])
            ],
            2
            /* CLASS */
          ))),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      b.value ? (e.openBlock(), e.createElementBlock("p", Nc, [
        I[2] || (I[2] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t(b.value)),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Vc, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: !c.editable || T.value,
          "data-test": "fau-tax-params-save",
          onClick: p
        }, [
          I[3] || (I[3] = e.createElementVNode(
            "i",
            { class: "ri-save-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(y.$t("保存参数")),
            1
            /* TEXT */
          )
        ], 8, Ec),
        z.value ? (e.openBlock(), e.createElementBlock(
          "span",
          kc,
          e.toDisplayString(y.$t("已保存")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      S.value ? (e.openBlock(), e.createElementBlock("p", vc, [
        I[4] || (I[4] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(S.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), fc = /* @__PURE__ */ ae(gc, [["__scopeId", "data-v-9e48cd51"]]), hc = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-tax-findings"
}, $c = { class: "fau-findings" }, _c = ["data-test"], Bc = {
  key: 0,
  class: "ss-muted"
}, bc = {
  key: 1,
  class: "ss-muted"
}, Sc = {
  key: 2,
  class: "ss-muted"
}, Dc = /* @__PURE__ */ e.defineComponent({
  __name: "FindingList",
  props: {
    findings: {}
  },
  setup(c) {
    const _ = { info: s.i18nKey("提示"), warn: s.i18nKey("提醒"), high: s.i18nKey("高风险") };
    return (t, N) => c.findings.length ? (e.openBlock(), e.createElementBlock("section", hc, [
      e.createElementVNode(
        "strong",
        null,
        e.toDisplayString(t.$t("风险与提醒")),
        1
        /* TEXT */
      ),
      e.createElementVNode("ul", $c, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(c.findings, (r) => (e.openBlock(), e.createElementBlock("li", {
            key: r.id,
            class: e.normalizeClass(r.level),
            "data-test": `fau-finding-${r.id}`
          }, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["fau-badge", r.level === "high" ? "bad" : r.level === "warn" ? "warn" : "muted"])
              },
              e.toDisplayString(t.$t(_[r.level])),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "div",
                null,
                e.toDisplayString(e.unref(Z)(r.title)),
                1
                /* TEXT */
              ),
              r.detail ? (e.openBlock(), e.createElementBlock(
                "small",
                Bc,
                e.toDisplayString(e.unref(Z)(r.detail)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0),
              r.suggestion ? (e.openBlock(), e.createElementBlock("small", bc, [
                N[0] || (N[0] = e.createElementVNode(
                  "br",
                  null,
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(e.unref(Z)(r.suggestion)),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              r.rows?.length ? (e.openBlock(), e.createElementBlock("small", Sc, [
                N[1] || (N[1] = e.createElementVNode(
                  "br",
                  null,
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("来源行")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: r.rows.slice(0, 20).join(",")
                }, null, 8, ["value"])
              ])) : e.createCommentVNode("v-if", !0)
            ])
          ], 10, _c))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Re = /* @__PURE__ */ ae(Dc, [["__scopeId", "data-v-b2a27619"]]), Cc = ["open"], wc = { class: "fau-badge muted" }, Tc = {
  key: 0,
  class: "fau-badge warn",
  "data-test": "fau-rules-draft"
}, Lc = {
  key: 0,
  class: "ss-muted"
}, Kc = {
  key: 1,
  class: "fau-table-wrap"
}, Ac = { class: "fau-table" }, Fc = ["data-test"], Ic = { class: "wrap" }, Pc = { class: "ss-muted" }, Oc = { class: "wrap" }, zc = { class: "ss-muted" }, Mc = { class: "wrap" }, jc = { class: "wrap" }, Rc = ["lang", "dir"], qc = {
  key: 0,
  class: "ss-muted"
}, Uc = { class: "fau-badge muted" }, Wc = {
  key: 1,
  class: "ss-muted"
}, Yc = /* @__PURE__ */ e.defineComponent({
  __name: "RuleSources",
  props: {
    rules: {},
    open: { type: Boolean }
  },
  setup(c) {
    function _(i, a) {
      if (!(!i || !a))
        return i[a] ?? (a !== "zh-CN" ? i["en-US"] : void 0);
    }
    const t = (i) => _(i.translations, pe.currentLocale())?.label || i.label, N = (i) => typeof i.value == "number" || /^\d{4}-\d{2}-\d{2}$/.test(String(i.value)), r = (i) => String(_(i.translations, pe.currentLocale())?.value || i.value), n = (i) => i.source.language === pe.currentLocale().slice(0, 2) ? "" : _(i.source.translations, pe.currentLocale()) || "";
    return (i, a) => (e.openBlock(), e.createElementBlock("details", {
      class: "fau-sec",
      "data-test": "fau-rule-sources",
      open: c.open
    }, [
      e.createElementVNode("summary", null, [
        e.createTextVNode(
          e.toDisplayString(i.$t("地区规则与出处")) + " ",
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          wc,
          e.toDisplayString(c.rules.length),
          1
          /* TEXT */
        ),
        c.rules.some((m) => !m.reviewed) ? (e.openBlock(), e.createElementBlock(
          "span",
          Tc,
          e.toDisplayString(i.$t("草稿口径，需当地专业人士复核")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      c.rules.length ? (e.openBlock(), e.createElementBlock("div", Kc, [
        e.createElementVNode("table", Ac, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(i.$t("规则")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(i.$t("取值")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(i.$t("版本 / 生效日期")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(i.$t("出处")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(i.$t("原文")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(i.$t("审核状态")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(c.rules, (m) => (e.openBlock(), e.createElementBlock("tr", {
                key: `${m.id}@${m.version}`,
                "data-test": `fau-rule-${m.id}`
              }, [
                e.createElementVNode("td", Ic, [
                  e.createTextVNode(
                    e.toDisplayString(t(m)),
                    1
                    /* TEXT */
                  ),
                  a[0] || (a[0] = e.createElementVNode(
                    "br",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("small", Pc, [
                    e.createVNode(l, {
                      value: m.id
                    }, null, 8, ["value"])
                  ])
                ]),
                e.createElementVNode("td", Oc, [
                  N(m) ? (e.openBlock(), e.createBlock(l, {
                    key: 0,
                    value: `${m.value}${m.unit ? ` ${m.unit}` : ""}`
                  }, null, 8, ["value"])) : (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(r(m)),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("td", null, [
                  e.createVNode(l, {
                    value: m.version
                  }, null, 8, ["value"]),
                  a[2] || (a[2] = e.createElementVNode(
                    "br",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("small", zc, [
                    e.createVNode(l, {
                      value: m.effectiveFrom
                    }, null, 8, ["value"]),
                    m.effectiveTo ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 0 },
                      [
                        a[1] || (a[1] = e.createTextVNode(
                          " ~ ",
                          -1
                          /* CACHED */
                        )),
                        e.createVNode(l, {
                          value: m.effectiveTo
                        }, null, 8, ["value"])
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode("td", Mc, [
                  e.createTextVNode(
                    e.toDisplayString(m.source.issuer) + " · " + e.toDisplayString(m.source.title),
                    1
                    /* TEXT */
                  ),
                  m.source.clause ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        " · " + e.toDisplayString(m.source.clause),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("td", jc, [
                  m.source.originalText ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("div", {
                        lang: m.source.language,
                        dir: m.source.language === "ar" ? "rtl" : "ltr",
                        class: "fau-original",
                        "data-test": "fau-rule-original"
                      }, e.toDisplayString(m.source.originalText), 9, Rc),
                      n(m) ? (e.openBlock(), e.createElementBlock(
                        "small",
                        qc,
                        e.toDisplayString(i.$t("译文")) + ": " + e.toDisplayString(n(m)),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode(
                        "small",
                        Uc,
                        e.toDisplayString(i.$t("以原文为准")),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock(
                    "small",
                    Wc,
                    e.toDisplayString(i.$t("原文摘录待当地专业人员核对补录")),
                    1
                    /* TEXT */
                  ))
                ]),
                e.createElementVNode("td", null, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["fau-badge", m.reviewed ? "ok" : "warn"])
                    },
                    e.toDisplayString(m.reviewed ? i.$t("已经当地专业人员审核") : i.$t("草稿口径")),
                    3
                    /* TEXT, CLASS */
                  )
                ])
              ], 8, Fc))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        Lc,
        e.toDisplayString(i.$t("本次没有用到地区规则（中国口径沿用财务智能体）")),
        1
        /* TEXT */
      ))
    ], 8, Cc));
  }
}), qe = /* @__PURE__ */ ae(Yc, [["__scopeId", "data-v-42d41c70"]]), Gc = {
  class: "fau-tax",
  "data-test": "fau-tax-panel"
}, Hc = {
  key: 0,
  class: "ss-note warn",
  "data-test": "fau-draft-basis"
}, Qc = { class: "ss-note info" }, Jc = {
  key: 0,
  class: "ss-actions"
}, Zc = ["data-test"], Xc = { class: "fau-row" }, xc = { class: "grow" }, ed = { class: "ss-muted" }, td = { class: "fau-table-wrap" }, ld = { class: "fau-table" }, nd = { class: "num" }, ad = { class: "num" }, od = { class: "num" }, sd = ["data-test"], rd = { class: "wrap" }, id = {
  key: 0,
  class: "ss-muted"
}, cd = { class: "num" }, dd = { class: "num" }, ud = { class: "num" }, md = { class: "wrap" }, pd = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-zakat"
}, yd = { class: "fau-row" }, Nd = { class: "grow" }, Vd = { class: "fau-badge" }, Ed = {
  key: 0,
  class: "fau-badge warn"
}, kd = { class: "fau-table-wrap" }, vd = { class: "fau-table" }, gd = { class: "num" }, fd = ["data-test"], hd = ["value", "disabled", "onChange"], $d = ["value"], _d = {
  key: 0,
  class: "fau-badge muted"
}, Bd = { class: "num" }, bd = { class: "fau-kv" }, Sd = { "data-test": "fau-zakat-due" }, Dd = {
  key: 0,
  class: "ss-actions"
}, Cd = ["disabled"], wd = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-tax-calendar"
}, Td = { class: "fau-table-wrap" }, Ld = { class: "fau-table" }, Kd = { key: 0 }, Ad = { key: 0 }, Fd = { class: "fau-row" }, Id = ["data-test"], Pd = { class: "fau-kv" }, Od = { class: "fau-table-wrap" }, zd = { class: "fau-table" }, Md = { class: "num" }, jd = ["data-test"], Rd = { class: "wrap" }, qd = {
  key: 0,
  class: "ss-muted"
}, Ud = { class: "num" }, Wd = { class: "wrap" }, Yd = { class: "wrap" }, Gd = {
  class: "fau-sec",
  "data-test": "fau-tp-range"
}, Hd = { class: "fau-row" }, Qd = { class: "grow" }, Jd = { class: "fau-kv" }, Zd = { "data-test": "fau-tp-q1" }, Xd = { "data-test": "fau-tp-median" }, xd = { "data-test": "fau-tp-q3" }, eu = { class: "fau-table-wrap" }, tu = { class: "fau-table" }, lu = { class: "num" }, nu = { class: "num" }, au = {
  key: 0,
  class: "ri-check-line"
}, ou = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-tp-docs"
}, su = {
  key: 0,
  class: "fau-table-wrap"
}, ru = { class: "fau-table" }, iu = { class: "num" }, cu = { class: "num" }, du = { class: "num" }, uu = { class: "num" }, mu = {
  key: 1,
  class: "fau-table-wrap"
}, pu = { class: "fau-table" }, yu = ["data-test"], Nu = {
  key: 0,
  class: "ri-check-line"
}, Vu = { class: "wrap" }, Eu = {
  key: 0,
  class: "ri-check-line"
}, ku = { class: "fau-narr" }, vu = {
  key: 4,
  class: "ss-note danger"
}, gu = /* @__PURE__ */ e.defineComponent({
  __name: "TaxResult",
  props: {
    run: {},
    def: {},
    editable: { type: Boolean }
  },
  emits: ["changed"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = ye.useRouter(), n = e.computed(() => t.def.id === "tax" ? t.run.result : null), i = e.computed(() => t.def.id === "regulatory" ? t.run.result : null), a = e.computed(() => t.def.id === "transfer-pricing" ? t.run.result : null), m = e.computed(() => !!(n.value?.draftBasis || i.value?.draftBasis || a.value?.draftBasis)), E = ue.FAU_ZAKAT_CATEGORIES, u = ue.FAU_DISCLOSURE_LEVELS, L = {
      add_equity: s.i18nKey("加项：权益"),
      add_provision: s.i18nKey("加项：准备"),
      add_liability: s.i18nKey("加项：非流动负债"),
      deduct_fixed: s.i18nKey("减项：固定资产净值"),
      deduct_investment: s.i18nKey("减项：长期投资"),
      deduct_intangible: s.i18nKey("减项：无形资产"),
      deduct_other: s.i18nKey("减项：其他"),
      none: s.i18nKey("不计入")
    }, g = { shareholder: s.i18nKey("提交股东大会并披露"), disclose: s.i18nKey("及时披露"), notes: s.i18nKey("在报表附注披露"), none: s.i18nKey("暂不需要披露") }, v = { transaction: s.i18nKey("交易"), related_party: s.i18nKey("关联交易"), guarantee: s.i18nKey("担保"), litigation: s.i18nKey("诉讼 / 仲裁"), impairment: s.i18nKey("减值"), other: s.i18nKey("其他") }, b = { ncp: s.i18nKey("完全成本加成率"), om: s.i18nKey("营业利润率") }, h = { below: s.i18nKey("低于下四分位"), within: s.i18nKey("在四分位区间内"), above: s.i18nKey("高于上四分位"), na: s.i18nKey("无法判断") }, K = {
      tangible: s.i18nKey("有形资产"),
      intangible_transfer: s.i18nKey("无形资产所有权转让"),
      intangible_license: s.i18nKey("无形资产使用权许可"),
      service: s.i18nKey("劳务"),
      financing: s.i18nKey("资金融通"),
      financial_asset: s.i18nKey("金融资产转让"),
      other: s.i18nKey("其他")
    }, T = { disclosure: s.i18nKey("关联交易披露表"), master: s.i18nKey("主体文档"), local: s.i18nKey("本地文档"), cbcr: s.i18nKey("国别报告") }, z = e.reactive({}), S = e.ref(!1), w = e.ref("");
    e.watch(() => t.run.id, () => {
      for (const k of Object.keys(z)) delete z[k];
    });
    const p = (k) => k.length > 12 ? `${k.slice(0, 12).join(",")} …` : k.join(","), f = (k) => `${Math.round(k * 1e6) / 1e4}%`, y = (k) => `${Math.round(k * 1e6) / 1e4}%`;
    function I(k) {
      try {
        return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" }).format(/* @__PURE__ */ new Date(`${k}T00:00:00Z`));
      } catch {
        return "";
      }
    }
    async function B() {
      S.value = !0, w.value = "";
      try {
        const k = t.run.params.zakatMap || {};
        await Y("run.setInputs", { runId: t.run.id, inputs: t.run.inputs, params: { zakatMap: { ...k, ...z } } }), await Y("run.start", { runId: t.run.id, fromStep: "validate" }), N("changed");
      } catch (k) {
        w.value = Q.errorMessage(k);
      } finally {
        S.value = !1;
      }
    }
    return (k, R) => (e.openBlock(), e.createElementBlock("div", Gc, [
      m.value ? (e.openBlock(), e.createElementBlock("p", Hc, [
        R[1] || (R[1] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(k.$t("草稿口径，需当地专业人士复核")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("p", Qc, [
        R[2] || (R[2] = e.createElementVNode(
          "i",
          { class: "ri-shield-check-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(k.$t("只出申报底稿，不提交申报：中国由人在电子税务局提交（代填可去财务智能体），沙特由人在 ZATCA 平台提交，阿联酋由人在 FTA 平台提交。")),
          1
          /* TEXT */
        )
      ]),
      e.createCommentVNode(" C1 纳税申报准备 "),
      n.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          n.value.mode === "cn" ? (e.openBlock(), e.createElementBlock("div", Jc, [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm",
              "data-test": "fau-go-finance-agent",
              onClick: R[0] || (R[0] = (d) => e.unref(r).push("/workbenches/finance-agent"))
            }, [
              R[3] || (R[3] = e.createElementVNode(
                "i",
                { class: "ri-external-link-line fau-dir-icon" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.$t("申报代填去财务智能体「申报上报」（由人提交）")),
                1
                /* TEXT */
              )
            ])
          ])) : e.createCommentVNode("v-if", !0),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n.value.sections, (d) => (e.openBlock(), e.createElementBlock("section", {
              key: d.id,
              class: "fau-sec",
              "data-test": `fau-tax-sec-${d.id}`
            }, [
              e.createElementVNode("header", Xc, [
                e.createElementVNode("strong", xc, [
                  e.createTextVNode(
                    e.toDisplayString(e.unref(Z)(d.title)) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("small", ed, [
                    e.createVNode(l, {
                      value: d.currency
                    }, null, 8, ["value"])
                  ])
                ]),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["fau-badge", d.payable >= 0 ? "warn" : "ok"])
                  },
                  [
                    e.createTextVNode(
                      e.toDisplayString(k.$t("本节应缴")) + " ",
                      1
                      /* TEXT */
                    ),
                    e.createVNode(l, {
                      cents: d.payable
                    }, null, 8, ["cents"])
                  ],
                  2
                  /* CLASS */
                )
              ]),
              e.createElementVNode("div", td, [
                e.createElementVNode("table", ld, [
                  e.createElementVNode("thead", null, [
                    e.createElementVNode("tr", null, [
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(k.$t("项目")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        nd,
                        e.toDisplayString(k.$t("计税基数")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        ad,
                        e.toDisplayString(k.$t("税率")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        od,
                        e.toDisplayString(k.$t("税额")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(k.$t("计算过程")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(d.lines, (M) => (e.openBlock(), e.createElementBlock("tr", {
                        key: M.id,
                        "data-test": `fau-tax-line-${d.id}-${M.id}`
                      }, [
                        e.createElementVNode("td", rd, [
                          e.createTextVNode(
                            e.toDisplayString(e.unref(Z)(M.label)),
                            1
                            /* TEXT */
                          ),
                          M.rows?.length ? (e.openBlock(), e.createElementBlock("small", id, [
                            R[4] || (R[4] = e.createElementVNode(
                              "br",
                              null,
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(k.$t("来源行")) + " ",
                              1
                              /* TEXT */
                            ),
                            e.createVNode(l, {
                              value: p(M.rows)
                            }, null, 8, ["value"])
                          ])) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", cd, [
                          M.base != null ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            cents: M.base
                          }, null, 8, ["cents"])) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", dd, [
                          M.rate != null ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            ratio: M.rate
                          }, null, 8, ["ratio"])) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", ud, [
                          M.tax != null ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            cents: M.tax
                          }, null, 8, ["cents"])) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", md, [
                          M.formula ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            value: M.formula
                          }, null, 8, ["value"])) : e.createCommentVNode("v-if", !0)
                        ])
                      ], 8, sd))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ], 8, Zc))),
            128
            /* KEYED_FRAGMENT */
          )),
          n.value.zakat ? (e.openBlock(), e.createElementBlock("section", pd, [
            e.createElementVNode("header", yd, [
              e.createElementVNode(
                "strong",
                Nd,
                e.toDisplayString(k.$t("天课基数")),
                1
                /* TEXT */
              ),
              e.createElementVNode("span", Vd, [
                e.createTextVNode(
                  e.toDisplayString(n.value.zakat.yearBasis === "hijri" ? k.$t("天课率（回历年）") : k.$t("天课率（公历年按天数折算）")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: f(n.value.zakat.rate)
                }, null, 8, ["value"])
              ]),
              n.value.zakat.floorApplied ? (e.openBlock(), e.createElementBlock(
                "span",
                Ed,
                e.toDisplayString(k.$t("按调整后净利润（下限）")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("div", kd, [
              e.createElementVNode("table", vd, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("行号")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("科目")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("类别")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      gd,
                      e.toDisplayString(k.$t("金额")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(n.value.zakat.items, (d) => (e.openBlock(), e.createElementBlock("tr", {
                      key: d.row,
                      class: e.normalizeClass({ warn: d.category === "none" }),
                      "data-test": `fau-zakat-${d.row}`
                    }, [
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: d.row
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: d.accountCode
                        }, null, 8, ["value"]),
                        e.createTextVNode(
                          " " + e.toDisplayString(d.accountName),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("select", {
                          value: z[d.accountCode || d.accountName] || d.category,
                          disabled: !c.editable || S.value,
                          onChange: (M) => z[d.accountCode || d.accountName] = M.target.value
                        }, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(e.unref(E), (M) => (e.openBlock(), e.createElementBlock("option", {
                              key: M,
                              value: M
                            }, e.toDisplayString(k.$t(L[M])), 9, $d))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 40, hd),
                        d.source === "manual" ? (e.openBlock(), e.createElementBlock(
                          "span",
                          _d,
                          e.toDisplayString(k.$t("人工")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", Bd, [
                        e.createVNode(l, {
                          cents: d.amount
                        }, null, 8, ["cents"])
                      ])
                    ], 10, fd))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode("dl", bd, [
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("加项合计")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createVNode(l, {
                  cents: n.value.zakat.additions
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("减项合计")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createVNode(l, {
                  cents: n.value.zakat.deductions
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("调整后净利润（基数下限）")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createVNode(l, {
                  cents: n.value.zakat.adjustedProfit
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("天课基数")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createVNode(l, {
                  cents: n.value.zakat.base
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("应缴天课")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", Sd, [
                e.createVNode(l, {
                  cents: n.value.zakat.zakatDue
                }, null, 8, ["cents"])
              ])
            ]),
            c.editable ? (e.openBlock(), e.createElementBlock("div", Dd, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: S.value || !Object.keys(z).length,
                "data-test": "fau-zakat-rerun",
                onClick: B
              }, [
                R[5] || (R[5] = e.createElementVNode(
                  "i",
                  { class: "ri-refresh-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(k.$t("按新归类重算")),
                  1
                  /* TEXT */
                )
              ], 8, Cd)
            ])) : e.createCommentVNode("v-if", !0)
          ])) : e.createCommentVNode("v-if", !0),
          n.value.calendar.length ? (e.openBlock(), e.createElementBlock("section", wd, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(k.$t("申报日历")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Td, [
              e.createElementVNode("table", Ld, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("事项")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("期间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("截止日")),
                      1
                      /* TEXT */
                    ),
                    n.value.region === "SA" ? (e.openBlock(), e.createElementBlock(
                      "th",
                      Kd,
                      e.toDisplayString(k.$t("截止日（回历）")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(n.value.calendar, (d) => (e.openBlock(), e.createElementBlock("tr", {
                      key: d.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(Z)(d.label)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: d.period
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: d.due
                        }, null, 8, ["value"])
                      ]),
                      n.value.region === "SA" ? (e.openBlock(), e.createElementBlock("td", Ad, [
                        e.createVNode(l, {
                          value: I(d.due)
                        }, null, 8, ["value"])
                      ])) : e.createCommentVNode("v-if", !0)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createVNode(Re, {
            findings: n.value.findings
          }, null, 8, ["findings"]),
          e.createVNode(qe, {
            rules: n.value.rules,
            open: m.value
          }, null, 8, ["rules", "open"])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" C2 监管报送与信息披露 "),
      i.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createElementVNode("div", Fd, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(u), (d) => (e.openBlock(), e.createElementBlock("span", {
                key: d,
                class: e.normalizeClass(["fau-badge", d === "none" ? "muted" : "warn"]),
                "data-test": `fau-disclosure-count-${d}`
              }, [
                e.createTextVNode(
                  e.toDisplayString(k.$t(g[d])) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: i.value.counts[d] || 0
                }, null, 8, ["value"])
              ], 10, Id))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("dl", Pd, [
            e.createElementVNode(
              "dt",
              null,
              e.toDisplayString(k.$t("总资产")),
              1
              /* TEXT */
            ),
            e.createElementVNode("dd", null, [
              e.createVNode(l, {
                cents: i.value.base.totalAssets
              }, null, 8, ["cents"])
            ]),
            e.createElementVNode(
              "dt",
              null,
              e.toDisplayString(k.$t("净资产")),
              1
              /* TEXT */
            ),
            e.createElementVNode("dd", null, [
              e.createVNode(l, {
                cents: i.value.base.netAssets
              }, null, 8, ["cents"])
            ]),
            e.createElementVNode(
              "dt",
              null,
              e.toDisplayString(k.$t("营业收入")),
              1
              /* TEXT */
            ),
            e.createElementVNode("dd", null, [
              e.createVNode(l, {
                cents: i.value.base.revenue
              }, null, 8, ["cents"])
            ]),
            e.createElementVNode(
              "dt",
              null,
              e.toDisplayString(k.$t("净利润")),
              1
              /* TEXT */
            ),
            e.createElementVNode("dd", null, [
              e.createVNode(l, {
                cents: i.value.base.netProfit
              }, null, 8, ["cents"])
            ])
          ]),
          e.createElementVNode("div", Od, [
            e.createElementVNode("table", zd, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(k.$t("日期")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(k.$t("类型")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(k.$t("事项说明")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    Md,
                    e.toDisplayString(k.$t("金额")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(k.$t("结论")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(k.$t("达到的标准")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(k.$t("披露草稿")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(i.value.items, (d) => (e.openBlock(), e.createElementBlock("tr", {
                    key: d.id,
                    class: e.normalizeClass({ warn: d.level === "disclose", bad: d.level === "shareholder" }),
                    "data-test": `fau-disclosure-${d.row}`
                  }, [
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: d.date
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(k.$t(v[d.type] || v.other)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", Rd, [
                      e.createTextVNode(
                        e.toDisplayString(d.description),
                        1
                        /* TEXT */
                      ),
                      d.counterparty ? (e.openBlock(), e.createElementBlock("small", qd, [
                        R[6] || (R[6] = e.createElementVNode(
                          "br",
                          null,
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(d.counterparty),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode("td", Ud, [
                      e.createVNode(l, {
                        cents: d.amount
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(k.$t(g[d.level])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", Wd, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(d.tests.filter((M) => M.hit), (M) => (e.openBlock(), e.createElementBlock("div", {
                          key: M.id
                        }, [
                          e.createTextVNode(
                            e.toDisplayString(e.unref(Z)(M.label)),
                            1
                            /* TEXT */
                          ),
                          M.ratio != null ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            ratio: M.ratio
                          }, null, 8, ["ratio"])) : e.createCommentVNode("v-if", !0)
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode("td", Yd, [
                      d.draft ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createTextVNode(
                            e.toDisplayString(d.draft),
                            1
                            /* TEXT */
                          ),
                          R[7] || (R[7] = e.createElementVNode(
                            "br",
                            null,
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["fau-badge", d.draftStatus === "verified" ? "ok" : "bad"])
                            },
                            e.toDisplayString(d.draftStatus === "verified" ? k.$t("已核实") : k.$t("未核实")),
                            3
                            /* TEXT, CLASS */
                          )
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ])
                  ], 10, jd))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ]),
          e.createVNode(Re, {
            findings: i.value.dataChecks
          }, null, 8, ["findings"]),
          i.value.rules.length ? (e.openBlock(), e.createBlock(qe, {
            key: 0,
            rules: i.value.rules,
            open: m.value
          }, null, 8, ["rules", "open"])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" C3 转让定价 "),
      a.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 3 },
        [
          e.createElementVNode("section", Gd, [
            e.createElementVNode("header", Hd, [
              e.createElementVNode(
                "strong",
                Qd,
                e.toDisplayString(k.$t(b[a.value.pli])),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["fau-badge", a.value.position === "below" ? "bad" : a.value.position === "within" ? "ok" : "warn"]),
                  "data-test": "fau-tp-position"
                },
                e.toDisplayString(k.$t(h[a.value.position])),
                3
                /* TEXT, CLASS */
              )
            ]),
            e.createElementVNode("dl", Jd, [
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(k.$t("受测方")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", null, [
                e.createVNode(l, {
                  ratio: a.value.tested.pli
                }, null, 8, ["ratio"])
              ]),
              a.value.range ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(k.$t("可比公司家数")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("dd", null, [
                    e.createVNode(l, {
                      value: a.value.range.n
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(k.$t("下四分位")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("dd", Zd, [
                    e.createVNode(l, {
                      value: y(a.value.range.q1)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(k.$t("中位值")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("dd", Xd, [
                    e.createVNode(l, {
                      value: y(a.value.range.median)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(k.$t("上四分位")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("dd", xd, [
                    e.createVNode(l, {
                      value: y(a.value.range.q3)
                    }, null, 8, ["value"])
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0),
              a.value.adjustment ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 1 },
                [
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(k.$t("调整到中位值需增加的营业利润")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("dd", null, [
                    e.createVNode(l, {
                      cents: a.value.adjustment.amount
                    }, null, 8, ["cents"])
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("div", eu, [
              e.createElementVNode("table", tu, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("可比公司")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("年度")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      lu,
                      e.toDisplayString(k.$t(b[a.value.pli])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("参与计算")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.comparables, (d) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: d.row,
                        class: e.normalizeClass({ warn: !d.included })
                      },
                      [
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(d.name),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.createVNode(l, {
                            value: d.year
                          }, null, 8, ["value"])
                        ]),
                        e.createElementVNode("td", nu, [
                          e.createVNode(l, {
                            ratio: d.pli
                          }, null, 8, ["ratio"])
                        ]),
                        e.createElementVNode("td", null, [
                          d.included ? (e.openBlock(), e.createElementBlock("i", au)) : (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 1 },
                            [
                              e.createTextVNode(
                                e.toDisplayString(e.unref(Z)(d.reason)),
                                1
                                /* TEXT */
                              )
                            ],
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ])
                      ],
                      2
                      /* CLASS */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ]),
          a.value.rpt.length || a.value.docs.length ? (e.openBlock(), e.createElementBlock("section", ou, [
            a.value.rpt.length ? (e.openBlock(), e.createElementBlock("div", su, [
              e.createElementVNode("table", ru, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("交易类型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      iu,
                      e.toDisplayString(k.$t("笔数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      cu,
                      e.toDisplayString(k.$t("金额")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.rpt, (d) => (e.openBlock(), e.createElementBlock("tr", {
                      key: d.type
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(k.$t(K[d.type])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", du, [
                        e.createVNode(l, {
                          value: d.count
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", uu, [
                        e.createVNode(l, {
                          cents: d.amount
                        }, null, 8, ["cents"])
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            a.value.docs.length ? (e.openBlock(), e.createElementBlock("div", mu, [
              e.createElementVNode("table", pu, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("文档")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("须准备")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("依据")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(k.$t("已准备")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.docs, (d) => (e.openBlock(), e.createElementBlock("tr", {
                      key: d.id,
                      class: e.normalizeClass({ bad: d.required && !d.prepared }),
                      "data-test": `fau-tp-doc-${d.id}`
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(k.$t(T[d.id])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        d.required ? (e.openBlock(), e.createElementBlock("i", Nu)) : (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 1 },
                          [
                            e.createTextVNode("—")
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ]),
                      e.createElementVNode(
                        "td",
                        Vu,
                        e.toDisplayString(e.unref(Z)(d.reason)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        d.prepared ? (e.openBlock(), e.createElementBlock("i", Eu)) : (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 1 },
                          [
                            e.createTextVNode("—")
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ])
                    ], 10, yu))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ])) : e.createCommentVNode("v-if", !0),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(a.value.narrative, (d) => (e.openBlock(), e.createElementBlock("section", {
              key: d.id,
              class: "fau-sec"
            }, [
              e.createElementVNode("strong", null, [
                e.createTextVNode(
                  e.toDisplayString(e.unref(Z)(d.heading)) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["fau-badge", d.status === "verified" ? "ok" : "bad"])
                  },
                  e.toDisplayString(d.status === "verified" ? k.$t("已核实") : k.$t("未核实")),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              e.createElementVNode(
                "p",
                ku,
                e.toDisplayString(d.text),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createVNode(Re, {
            findings: a.value.findings
          }, null, 8, ["findings"]),
          a.value.rules.length ? (e.openBlock(), e.createBlock(qe, {
            key: 1,
            rules: a.value.rules,
            open: m.value
          }, null, 8, ["rules", "open"])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      w.value ? (e.openBlock(), e.createElementBlock("p", vu, [
        R[8] || (R[8] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(w.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), fu = /* @__PURE__ */ ae(gu, [["__scopeId", "data-v-ef0b616c"]]), o = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/i18n"];
if (!o) throw new Error("宿主模块未就绪：npm:@totalclaw/i18n");
o.default;
const hu = {
  current: o.i18nKey("未逾期"),
  d1_30: o.i18nKey("逾期 1–30 天"),
  d31_60: o.i18nKey("逾期 31–60 天"),
  d61_90: o.i18nKey("逾期 61–90 天"),
  d91_180: o.i18nKey("逾期 91–180 天"),
  d181_365: o.i18nKey("逾期 181–365 天"),
  over365: o.i18nKey("逾期 1 年以上")
}, $u = {
  current: "-",
  d1_30: "< 5%",
  d31_60: "5–15%",
  d61_90: "5–15%",
  d91_180: "15–40%",
  d181_365: "40–70%",
  over365: "> 70%"
}, _u = { low: o.i18nKey("低"), medium: o.i18nKey("中"), high: o.i18nKey("高") }, Bu = {
  0: o.i18nKey("未逾期"),
  1: o.i18nKey("阶段 1：友好提醒"),
  2: o.i18nKey("阶段 2：正式提醒"),
  3: o.i18nKey("阶段 3：书面催款"),
  4: o.i18nKey("阶段 4：最后通知并暂停接单"),
  5: o.i18nKey("阶段 5：诉讼评估或核销评估")
}, bu = {
  excellent: o.i18nKey("优秀"),
  good: o.i18nKey("良好"),
  fair: o.i18nKey("一般"),
  poor: o.i18nKey("较差"),
  bad: o.i18nKey("极差"),
  unknown: o.i18nKey("无记录")
}, Su = {
  ar_supervisor: o.i18nKey("AR 主管"),
  credit_manager: o.i18nKey("AR 主管 + 信用管理经理"),
  cfo: o.i18nKey("AR 主管 + 信用管理经理 + 财务总监")
}, Du = {
  full: o.i18nKey("数量完全匹配"),
  partial: o.i18nKey("部分交货"),
  invoice_short: o.i18nKey("发票数量少于收货"),
  over_invoiced: o.i18nKey("发票数量多于收货"),
  not_received: o.i18nKey("未收货"),
  not_invoiced: o.i18nKey("未开票")
}, ot = {
  match: o.i18nKey("完全匹配"),
  within_tol: o.i18nKey("容差内"),
  review: o.i18nKey("需说明，主管审批"),
  reject: o.i18nKey("不付，联系供应商")
};
o.i18nKey("税率一致"), o.i18nKey("发票税率低于订单"), o.i18nKey("发票税率高于订单"), o.i18nKey("税率未知");
const st = {
  P0: o.i18nKey("P0 已逾期"),
  P1: o.i18nKey("P1 战略供应商"),
  P2: o.i18nKey("P2 7 天内到期"),
  P3: o.i18nKey("P3 8–30 天到期"),
  P4: o.i18nKey("P4 30 天后到期")
}, Cu = {
  l1: o.i18nKey("AP 专员 → AP 主管"),
  l2: o.i18nKey("加财务经理"),
  l3: o.i18nKey("加财务总监"),
  l4: o.i18nKey("加 CEO")
};
o.i18nKey("未逾期"), o.i18nKey("正常"), o.i18nKey("关注"), o.i18nKey("警告"), o.i18nKey("高风险");
const wu = {
  none: o.i18nKey("资金充足"),
  small: o.i18nKey("小额缺口：延后 P3 / P4 或加速催收"),
  medium: o.i18nKey("中等缺口：短期融资并协商延后"),
  large: o.i18nKey("大额缺口：升级财务总监")
}, Tu = { approve: o.i18nKey("可付"), conditional: o.i18nKey("附条件"), hold: o.i18nKey("暂停付款") }, rt = { pass: o.i18nKey("通过"), review: o.i18nKey("需补正"), reject: o.i18nKey("驳回"), escalate: o.i18nKey("升级") }, Lu = {
  high_frequency: o.i18nKey("高频异常员工"),
  split: o.i18nKey("疑似拆单"),
  supplier_concentration: o.i18nKey("供应商集中"),
  cross_period: o.i18nKey("跨期规律"),
  weekend: o.i18nKey("周末票据"),
  round_amount: o.i18nKey("整数金额"),
  sequential: o.i18nKey("发票连号"),
  duplicate: o.i18nKey("同票多报")
}, Ku = {
  decode: o.i18nKey("二维码解不开"),
  missing_tags: o.i18nKey("缺必填字段"),
  seller: o.i18nKey("卖方名称不一致"),
  vat_no: o.i18nKey("增值税号不一致"),
  vat_no_format: o.i18nKey("增值税号格式不对"),
  date: o.i18nKey("开票时间不一致"),
  total: o.i18nKey("含税总额不一致"),
  vat: o.i18nKey("增值税额不一致")
}, Au = {
  straight_line: o.i18nKey("直线法"),
  units: o.i18nKey("工作量法"),
  ddb: o.i18nKey("双倍余额递减法"),
  syd: o.i18nKey("年数总和法")
}, Fu = { cn: o.i18nKey("中国"), sa: o.i18nKey("沙特"), intl: o.i18nKey("国际") };
o.i18nKey("在上下限内"), o.i18nKey("低于下限"), o.i18nKey("高于上限"), o.i18nKey("未检查");
const Iu = {
  matched: o.i18nKey("相符"),
  amount: o.i18nKey("金额差异"),
  quantity: o.i18nKey("数量差异"),
  timing: o.i18nKey("时间差异"),
  gl_only: o.i18nKey("仅本方入账"),
  sub_only: o.i18nKey("仅对方入账")
}, it = {
  arap: o.i18nKey("应收 ↔ 应付"),
  sales: o.i18nKey("内部销售 ↔ 内部采购"),
  loan: o.i18nKey("借出 ↔ 借入"),
  interest: o.i18nKey("利息收入 ↔ 利息支出"),
  other: o.i18nKey("其他往来")
}, Pu = {
  // A3
  "ar.utilization": o.i18nKey("信用额度使用率 {p0}"),
  "ar.risk_signal": o.i18nKey("高风险信号：{p0}"),
  "ar.disputed": o.i18nKey("有争议款项"),
  "credit.no_history": o.i18nKey("没有付款记录，按新客户评估"),
  "credit.late": o.i18nKey("逾期 {n} 次，最长 {m} 天"),
  "credit.high_debt": o.i18nKey("资产负债率 {p0}，高负债"),
  "credit.negative_cf": o.i18nKey("经营现金流为负"),
  "credit.high_risk": o.i18nKey("高风险信号：{p0}，否决授信"),
  "credit.over_limit_minor": o.i18nKey("超额度 {p0}，AR 主管审批"),
  "credit.over_limit": o.i18nKey("超额度 {p0}，须重新评估信用"),
  // A4
  "match.no_po": o.i18nKey("发票没有对应的采购订单"),
  "match.over_received": o.i18nKey("收货数量多于订单"),
  "match.over_invoiced": o.i18nKey("发票数量多于收货，多出 {n} 不付"),
  "match.invoice_short": o.i18nKey("发票数量少于收货，联系供应商补票"),
  "match.partial": o.i18nKey("部分交货，按实收结算"),
  "match.not_received": o.i18nKey("已开票未收货，暂不付"),
  "match.price": o.i18nKey("单价差异率 {p0}"),
  "match.tax_lower": o.i18nKey("发票税率 {p0} 低于订单税率 {p1}，收到正确发票前不付"),
  "match.tax_higher": o.i18nKey("发票税率 {p0} 高于订单税率 {p1}，须说明"),
  "plan.hold_match": o.i18nKey("三单不符暂扣"),
  "plan.hold_supplier": o.i18nKey("供应商复核未通过暂停"),
  "sup.account_changed": o.i18nKey("收款账户变更：{p0} → {p1}"),
  "sup.personal_account": o.i18nKey("账户名「{p0}」与供应商名称不一致，疑似个人账户"),
  "sup.related_party": o.i18nKey("关联方"),
  "sup.blacklist": o.i18nKey("在黑名单或制裁名单中"),
  "sup.credit_code": o.i18nKey("信用代码 {p0} 校验位不对"),
  "sup.not_in_master": o.i18nKey("供应商档案里找不到"),
  "sup.split": o.i18nKey("{p0} 同日 {n} 笔金额贴近审批限额，疑似分拆"),
  "sup.concentration": o.i18nKey("占应付总额 {p0}，集中度过高"),
  // A5（财务智能体预审规则的结论码，只读复用）
  "inv.duplicate": o.i18nKey("同一张发票重复报销"),
  "inv.title": o.i18nKey("发票抬头不是本公司"),
  "inv.title_wrong": o.i18nKey("购买方税号不是本公司"),
  "inv.title_unknown": o.i18nKey("购买方和销售方都不是本公司，请确认抬头"),
  "inv.expired": o.i18nKey("票据开具已 {n} 天，超过 {m} 天有效期"),
  "inv.cross_year": o.i18nKey("跨年票据，超过次年 1 月 31 日报销期限"),
  "inv.no_date": o.i18nKey("没有开票日期"),
  "inv.need_special": o.i18nKey("该类费用要求增值税专用发票"),
  "inv.no_rule": o.i18nKey("费用类别没有报销标准，需人工判断"),
  "inv.not_invoice": o.i18nKey("不是正式发票（收据 / 小票）"),
  "inv.sum_mismatch": o.i18nKey("金额 + 税额 ≠ 价税合计"),
  "inv.rate_mismatch": o.i18nKey("税额与金额 × 税率对不上"),
  "inv.items_mismatch": o.i18nKey("明细金额合计与票面不一致"),
  "inv.uscc_invalid": o.i18nKey("税号校验位不对"),
  "inv.future_date": o.i18nKey("开票日期晚于截止日"),
  "inv.old_date": o.i18nKey("票据开具已超过 360 天"),
  "inv.red_letter": o.i18nKey("红字（负数）票据"),
  "inv.no_number": o.i18nKey("没有发票号码，无法查重"),
  "inv.no_total": o.i18nKey("没有金额"),
  "inv.normal_no_deduct": o.i18nKey("普通发票税额不能抵扣"),
  "inv.missing": o.i18nKey("票据缺失"),
  "inv.quota": o.i18nKey("超出本月报销额度"),
  "inv.other": o.i18nKey("预审提示：{p0}"),
  "exp.over_minor": o.i18nKey("超标 {p0}（标准 {p1}），轻微，直属上级确认"),
  "exp.over_review": o.i18nKey("超标 {p0}（标准 {p1}），须上级加签"),
  "exp.over_reject": o.i18nKey("超标 {p0}（标准 {p1}），初步驳回"),
  "exp.late_warn": o.i18nKey("提交距开票 {n} 天，须说明原因"),
  "exp.late_reject": o.i18nKey("提交距开票 {n} 天，超过时限"),
  "exp.qr_mismatch": o.i18nKey("ZATCA 二维码与票面不一致：{p0}"),
  "exp.qr_invalid": o.i18nKey("ZATCA 二维码无法解析"),
  "exp.escalate_single": o.i18nKey("单笔金额超过升级门槛"),
  // A6
  "asset.dep_diff": o.i18nKey("本期折旧重算 {p0}，账面 {p1}，差 {p2}"),
  "asset.accum_diff": o.i18nKey("累计折旧重算 {p0}，账面 {p1}，差 {p2}"),
  "asset.not_depreciated": o.i18nKey("在用资产本期应提未提"),
  "asset.early_dep": o.i18nKey("本月新增资产当月不提折旧，账面已提"),
  "asset.fully_in_use": o.i18nKey("已提足折旧仍在使用"),
  "asset.no_life": o.i18nKey("没有使用年限，无法重算"),
  "asset.units_missing": o.i18nKey("工作量法缺总工作量或本期工作量"),
  "asset.method_unknown": o.i18nKey("折旧方法「{p0}」认不出，按直线法重算"),
  "asset.below_cap": o.i18nKey("金额 {p0} 低于资本化门槛，可能应费用化"),
  "asset.large_cap": o.i18nKey("大额资本化 {p0}，须核对审批"),
  "asset.disposal_not_found": o.i18nKey("处置单的资产在台账里找不到"),
  "asset.disposal_loss": o.i18nKey("处置损失 {p0}"),
  "asset.impaired": o.i18nKey("有减值准备：后续折旧按减值后账面价值另行核对，不在这里比较"),
  // A7
  "pay.gross_mismatch": o.i18nKey("应发明细合计 {p0} ≠ 应发合计 {p1}"),
  "pay.net_mismatch": o.i18nKey("实发 {p0} ≠ 应发减扣款 {p1}"),
  "pay.personal_mismatch": o.i18nKey("个人社保公积金实扣 {p0}，按基数应扣 {p1}"),
  "pay.iit_mismatch": o.i18nKey("个税实扣 {p0}，累计预扣法应扣 {p1}"),
  "pay.iit_escalate": o.i18nKey("个税误差超过升级门槛"),
  "pay.base_below": o.i18nKey("缴费基数 {p0} 低于下限"),
  "pay.base_above": o.i18nKey("缴费基数 {p0} 高于上限"),
  "pay.no_base": o.i18nKey("没有缴费基数，按应发合计核对"),
  "pay.gosi_mismatch": o.i18nKey("GOSI 个人实扣 {p0}，应扣 {p1}"),
  "pay.eosb_mismatch": o.i18nKey("期末服务金账面 {p0}，重算 {p1}"),
  "pay.no_service_start": o.i18nKey("没有服务起始日，期末服务金按入职日期计算"),
  "pay.no_nationality": o.i18nKey("没有国籍，按沙特籍计算 GOSI"),
  "pay.new_hire": o.i18nKey("本期新增人员"),
  "pay.hire_no_base": o.i18nKey("新增人员没有参保基数"),
  "pay.leaver": o.i18nKey("本期减员"),
  "pay.leaver_paid": o.i18nKey("{p0} 已离职仍在本期工资表"),
  // A8
  "gua.over_limit": o.i18nKey("担保余额占净资产 {p0}，超过上限 {p1}"),
  "gua.expiring": o.i18nKey("{p0} 到期，须安排续保或解除"),
  "gua.expired_active": o.i18nKey("已于 {p0} 到期，状态仍为有效"),
  "gua.unapproved": o.i18nKey("没有审批记录"),
  "gua.no_fee": o.i18nKey("免担保费或费率为 0"),
  "gua.single_over": o.i18nKey("单笔担保超过上限"),
  "gua.no_net_assets": o.i18nKey("没有担保方净资产，不能算担保比例")
};
function Ou(c) {
  return Pu[c] || c;
}
const zu = {
  key: 0,
  class: "fau-flags"
}, Mu = {
  key: 1,
  class: "fau-badge ok"
}, ju = /* @__PURE__ */ e.defineComponent({
  __name: "FauFlags",
  props: {
    flags: {},
    okText: {}
  },
  setup(c) {
    return (_, t) => c.flags?.length ? (e.openBlock(), e.createElementBlock("span", zu, [
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(c.flags, (N, r) => (e.openBlock(), e.createElementBlock(
          "span",
          {
            key: `${N.code}-${r}`,
            class: e.normalizeClass(["fau-badge", N.level === "block" ? "bad" : N.level === "warn" ? "warn" : "muted"])
          },
          e.toDisplayString(_.$t(e.unref(Ou)(N.code), N.params || {})),
          3
          /* TEXT, CLASS */
        ))),
        128
        /* KEYED_FRAGMENT */
      ))
    ])) : c.okText ? (e.openBlock(), e.createElementBlock(
      "span",
      Mu,
      e.toDisplayString(c.okText),
      1
      /* TEXT */
    )) : e.createCommentVNode("v-if", !0);
  }
}), me = /* @__PURE__ */ ae(ju, [["__scopeId", "data-v-049073de"]]), Ru = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-ar-panel"
}, qu = { class: "fau-acc-sec" }, Uu = { class: "fau-badge muted" }, Wu = { class: "fau-badge" }, Yu = { class: "fau-badge warn" }, Gu = {
  class: "fau-badge bad",
  "data-test": "fau-ar-provision"
}, Hu = { class: "fau-table-wrap" }, Qu = { class: "fau-table" }, Ju = { class: "num" }, Zu = { class: "num" }, Xu = { class: "num" }, xu = { class: "num" }, em = { class: "num" }, tm = ["data-test"], lm = {
  class: "num",
  "data-test": "amount"
}, nm = { class: "num" }, am = { class: "num" }, om = { class: "num" }, sm = { class: "num" }, rm = { class: "fau-acc-sec" }, im = { class: "fau-badge warn" }, cm = { class: "fau-table-wrap" }, dm = { class: "fau-table" }, um = { class: "num" }, mm = { class: "num" }, pm = { class: "num" }, ym = { class: "num" }, Nm = { class: "num" }, Vm = ["data-test"], Em = { class: "num" }, km = { class: "num" }, vm = { class: "num" }, gm = { class: "num" }, fm = { class: "num" }, hm = { class: "wrap" }, $m = {
  key: 0,
  class: "ss-note warn",
  "data-test": "fau-ar-letters"
}, _m = {
  key: 0,
  class: "fau-acc-sec",
  "data-test": "fau-ar-credit"
}, Bm = { class: "fau-table-wrap" }, bm = { class: "fau-table" }, Sm = { class: "num" }, Dm = { class: "num" }, Cm = { class: "num" }, wm = { class: "num" }, Tm = { class: "num" }, Lm = { class: "num" }, Km = { class: "wrap" }, Am = {
  key: 1,
  class: "fau-acc-esc",
  "data-test": "fau-ar-escalations"
}, Fm = /* @__PURE__ */ e.defineComponent({
  __name: "ArPanel",
  props: {
    run: {},
    def: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result), N = s.listSeparator();
    return (r, n) => t.value ? (e.openBlock(), e.createElementBlock("div", Ru, [
      e.createElementVNode("section", qu, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(r.$t("账龄分布与坏账准备")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", Uu, [
            e.createTextVNode(
              e.toDisplayString(r.$t("截止日")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: t.value.asOf
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("span", Wu, [
            e.createTextVNode(
              e.toDisplayString(r.$t("未清合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.total
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", Yu, [
            e.createTextVNode(
              e.toDisplayString(r.$t("逾期金额")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.overdue
            }, null, 8, ["cents"]),
            n[0] || (n[0] = e.createTextVNode(
              " · ",
              -1
              /* CACHED */
            )),
            e.createVNode(l, {
              ratio: t.value.overdueRate
            }, null, 8, ["ratio"])
          ]),
          e.createElementVNode("span", Gu, [
            e.createTextVNode(
              e.toDisplayString(r.$t("坏账准备")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.provision
            }, null, 8, ["cents"])
          ])
        ]),
        e.createElementVNode("div", Hu, [
          e.createElementVNode("table", Qu, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("账龄分层")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ju,
                  e.toDisplayString(r.$t("未清金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Zu,
                  e.toDisplayString(r.$t("占比")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Xu,
                  e.toDisplayString(r.$t("笔数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("坏账概率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  xu,
                  e.toDisplayString(r.$t("计提比例")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  em,
                  e.toDisplayString(r.$t("坏账准备")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.buckets, (i) => (e.openBlock(), e.createElementBlock("tr", {
                  key: i.bucket,
                  "data-test": `fau-ar-bucket-${i.bucket}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(r.$t(e.unref(hu)[i.bucket])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", lm, [
                    e.createVNode(l, {
                      cents: i.amount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", nm, [
                    e.createVNode(l, {
                      ratio: i.share
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", am, [
                    e.createVNode(l, {
                      value: i.count
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: e.unref($u)[i.bucket]
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", om, [
                    e.createVNode(l, {
                      ratio: i.provisionRate
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", sm, [
                    e.createVNode(l, {
                      cents: i.provision
                    }, null, 8, ["cents"])
                  ])
                ], 8, tm))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", rm, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(r.$t("客户账龄")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            im,
            e.toDisplayString(r.$t("TOP 风险客户")) + ": " + e.toDisplayString(t.value.top.join(e.unref(N)) || "-"),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", cm, [
          e.createElementVNode("table", dm, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("客户")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  um,
                  e.toDisplayString(r.$t("未清合计")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  mm,
                  e.toDisplayString(r.$t("逾期金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  pm,
                  e.toDisplayString(r.$t("最长逾期天数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ym,
                  e.toDisplayString(r.$t("坏账准备")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("风险")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("催款阶段")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Nm,
                  e.toDisplayString(r.$t("额度使用率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.customers, (i) => (e.openBlock(), e.createElementBlock("tr", {
                  key: i.customer,
                  class: e.normalizeClass({ bad: i.risk === "high", warn: i.risk === "medium" }),
                  "data-test": `fau-ar-customer-${i.customer}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(i.customer),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Em, [
                    e.createVNode(l, {
                      cents: i.open
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", km, [
                    e.createVNode(l, {
                      cents: i.overdue
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", vm, [
                    e.createVNode(l, {
                      value: i.maxOverdueDays
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", gm, [
                    e.createVNode(l, {
                      cents: i.provision
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(r.$t(e.unref(_u)[i.risk])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(r.$t(e.unref(Bu)[i.stage])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", fm, [
                    e.createVNode(l, {
                      ratio: i.utilization
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", hm, [
                    e.createVNode(me, {
                      flags: i.flags
                    }, null, 8, ["flags"])
                  ])
                ], 10, Vm))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        t.value.letters.length ? (e.openBlock(), e.createElementBlock("p", $m, [
          n[1] || (n[1] = e.createElementVNode(
            "i",
            { class: "ri-mail-forbid-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(r.$t("催款函 {n} 份只是草稿，不会自动发送；由人确认后自行发出", { n: t.value.letters.length })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      t.value.credit.length ? (e.openBlock(), e.createElementBlock("section", _m, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(r.$t("信用评估")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Bm, [
          e.createElementVNode("table", bm, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("客户")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("付款历史")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("建议等级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Sm,
                  e.toDisplayString(r.$t("建议账期（天）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Dm,
                  e.toDisplayString(r.$t("现有额度")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Cm,
                  e.toDisplayString(r.$t("建议额度")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("审批层级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("依据")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.credit, (i) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: i.customer,
                    class: e.normalizeClass({ bad: i.grade === "D" })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(i.customer),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(r.$t(e.unref(bu)[i.history])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: i.grade
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", wm, [
                      e.createVNode(l, {
                        value: i.termDays
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", Tm, [
                      e.createVNode(l, {
                        cents: i.currentLimit
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", Lm, [
                      e.createVNode(l, {
                        cents: i.suggestedLimit
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(r.$t(e.unref(Su)[i.approval])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", Km, [
                      e.createVNode(me, {
                        flags: i.reasons
                      }, null, 8, ["flags"])
                    ])
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", Am, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (i, a) => (e.openBlock(), e.createElementBlock("li", { key: a }, [
            n[2] || (n[2] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(Z)(i)),
              1
              /* TEXT */
            )
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Im = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-ap-panel"
}, Pm = {
  key: 0,
  class: "fau-acc-sec",
  "data-test": "fau-ap-match"
}, Om = ["data-test"], zm = { class: "fau-table-wrap" }, Mm = { class: "fau-table" }, jm = { class: "num" }, Rm = { class: "num" }, qm = { class: "num" }, Um = { class: "num" }, Wm = { class: "num" }, Ym = { class: "num" }, Gm = ["data-test"], Hm = {
  key: 0,
  class: "ss-muted"
}, Qm = { class: "num" }, Jm = { class: "num" }, Zm = { class: "num" }, Xm = { class: "num" }, xm = { "data-test": "grade" }, ep = { class: "num" }, tp = { class: "num" }, lp = { class: "wrap" }, np = {
  key: 1,
  class: "fau-acc-sec",
  "data-test": "fau-ap-plan"
}, ap = { class: "fau-badge muted" }, op = { class: "fau-badge" }, sp = { class: "fau-acc-kpis" }, rp = {
  class: "fau-badge ok",
  "data-test": "fau-ap-scheduled"
}, ip = { class: "fau-badge warn" }, cp = { class: "fau-badge bad" }, dp = ["data-test"], up = { class: "ss-note warn" }, mp = { class: "fau-table-wrap" }, pp = { class: "fau-table" }, yp = { class: "num" }, Np = { class: "num" }, Vp = { class: "num" }, Ep = { class: "num" }, kp = { class: "num" }, vp = { class: "num" }, gp = {
  key: 0,
  class: "ss-muted"
}, fp = {
  key: 2,
  class: "fau-acc-sec",
  "data-test": "fau-ap-suppliers"
}, hp = { class: "fau-table-wrap" }, $p = { class: "fau-table" }, _p = { class: "num" }, Bp = ["data-test"], bp = { class: "num" }, Sp = { class: "wrap" }, Dp = {
  key: 3,
  class: "fau-acc-esc",
  "data-test": "fau-ap-escalations"
}, Cp = /* @__PURE__ */ e.defineComponent({
  __name: "ApPanel",
  props: {
    run: {},
    def: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result), N = ue.FAU_MATCH_GRADES, r = ue.FAU_PAY_PRIORITIES;
    return (n, i) => t.value ? (e.openBlock(), e.createElementBlock("div", Im, [
      t.value.match ? (e.openBlock(), e.createElementBlock("section", Pm, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(n.$t("三单匹配")),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(N), (a) => (e.openBlock(), e.createElementBlock("span", {
              key: a,
              class: e.normalizeClass(["fau-badge", a === "reject" ? "bad" : a === "review" ? "warn" : "ok"]),
              "data-test": `fau-ap-grade-${a}`
            }, [
              e.createTextVNode(
                e.toDisplayString(n.$t(e.unref(ot)[a])) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: t.value.matchCounts?.[a] ?? 0
              }, null, 8, ["value"])
            ], 10, Om))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        e.createElementVNode("div", zm, [
          e.createElementVNode("table", Mm, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("采购订单号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("物料 / 品名")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("供应商")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  jm,
                  e.toDisplayString(n.$t("订单数量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Rm,
                  e.toDisplayString(n.$t("收货数量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  qm,
                  e.toDisplayString(n.$t("发票数量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Um,
                  e.toDisplayString(n.$t("单价差异")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("数量判定")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("结论")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Wm,
                  e.toDisplayString(n.$t("可付")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ym,
                  e.toDisplayString(n.$t("暂扣")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.match, (a) => (e.openBlock(), e.createElementBlock("tr", {
                  key: a.key,
                  class: e.normalizeClass({ bad: a.grade === "reject", warn: a.grade === "review" }),
                  "data-test": `fau-ap-line-${a.poNo}-${a.line || a.item}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: a.poNo
                    }, null, 8, ["value"]),
                    a.line ? (e.openBlock(), e.createElementBlock("small", Hm, [
                      i[0] || (i[0] = e.createTextVNode(
                        " #",
                        -1
                        /* CACHED */
                      )),
                      e.createVNode(l, {
                        value: a.line
                      }, null, 8, ["value"])
                    ])) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.item),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.supplier),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Qm, [
                    e.createVNode(l, {
                      value: a.poQty
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Jm, [
                    e.createVNode(l, {
                      value: a.grnQty
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Zm, [
                    e.createVNode(l, {
                      value: a.invQty
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Xm, [
                    e.createVNode(l, {
                      cents: a.priceDiff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(n.$t(e.unref(Du)[a.qty])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    xm,
                    e.toDisplayString(n.$t(e.unref(ot)[a.grade])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", ep, [
                    e.createVNode(l, {
                      cents: a.payable
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", tp, [
                    e.createVNode(l, {
                      cents: a.hold
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", lp, [
                    e.createVNode(me, {
                      flags: a.flags
                    }, null, 8, ["flags"])
                  ])
                ], 10, Gm))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.plan ? (e.openBlock(), e.createElementBlock("section", np, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(n.$t("付款计划草稿")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", ap, [
            e.createTextVNode(
              e.toDisplayString(n.$t("可用资金")) + " ",
              1
              /* TEXT */
            ),
            t.value.plan.available != null ? (e.openBlock(), e.createBlock(l, {
              key: 0,
              cents: t.value.plan.available
            }, null, 8, ["cents"])) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createTextVNode(
                  e.toDisplayString(n.$t("未提供")),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.createElementVNode("span", op, [
            e.createTextVNode(
              e.toDisplayString(n.$t("30 天内到期应付（含已逾期）")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.plan.due30
            }, null, 8, ["cents"])
          ]),
          t.value.plan.gapTier ? (e.openBlock(), e.createElementBlock(
            "span",
            {
              key: 0,
              class: e.normalizeClass(["fau-badge", t.value.plan.gapTier === "none" ? "ok" : t.value.plan.gapTier === "large" ? "bad" : "warn"]),
              "data-test": "fau-ap-gap"
            },
            [
              e.createTextVNode(
                e.toDisplayString(n.$t(e.unref(wu)[t.value.plan.gapTier])) + " ",
                1
                /* TEXT */
              ),
              t.value.plan.gap != null && t.value.plan.gap > 0 ? (e.openBlock(), e.createBlock(l, {
                key: 0,
                cents: t.value.plan.gap
              }, null, 8, ["cents"])) : e.createCommentVNode("v-if", !0)
            ],
            2
            /* CLASS */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("div", sp, [
          e.createElementVNode("span", rp, [
            e.createTextVNode(
              e.toDisplayString(n.$t("本次计划付款")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.plan.scheduledTotal
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", ip, [
            e.createTextVNode(
              e.toDisplayString(n.$t("延后")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.plan.deferredTotal
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", cp, [
            e.createTextVNode(
              e.toDisplayString(n.$t("暂扣")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.plan.heldTotal
            }, null, 8, ["cents"])
          ]),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(r), (a) => (e.openBlock(), e.createElementBlock("span", {
              key: a,
              class: "fau-badge muted",
              "data-test": `fau-ap-priority-${a}`
            }, [
              e.createTextVNode(
                e.toDisplayString(n.$t(e.unref(st)[a])) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: t.value.plan.byPriority[a].count
              }, null, 8, ["value"])
            ], 8, dp))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        e.createElementVNode("p", up, [
          i[1] || (i[1] = e.createElementVNode(
            "i",
            { class: "ri-bank-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("付款计划只是草稿：本方案不付款，由人按审批层级在网银或资金系统里操作")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", mp, [
          e.createElementVNode("table", pp, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("优先级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("供应商")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("发票号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("到期日")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  yp,
                  e.toDisplayString(n.$t("逾期天数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Np,
                  e.toDisplayString(n.$t("未付金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Vp,
                  e.toDisplayString(n.$t("暂扣")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("安排")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("审批层级")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.plan.lines, (a) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: a.row,
                    class: e.normalizeClass({ bad: a.hold > 0, warn: !a.scheduled && !a.hold })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.$t(e.unref(st)[a.priority])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(a.supplier),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: a.docNo
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: a.dueDate
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", Ep, [
                      e.createVNode(l, {
                        value: a.overdueDays
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", kp, [
                      e.createVNode(l, {
                        cents: a.open
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", vp, [
                      e.createVNode(l, {
                        cents: a.hold
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", null, [
                      e.createTextVNode(
                        e.toDisplayString(a.scheduled ? n.$t("本次计划") : n.$t("延后")),
                        1
                        /* TEXT */
                      ),
                      a.deferTo ? (e.openBlock(), e.createElementBlock("small", gp, [
                        i[2] || (i[2] = e.createTextVNode(
                          " → ",
                          -1
                          /* CACHED */
                        )),
                        e.createVNode(l, {
                          value: a.deferTo
                        }, null, 8, ["value"])
                      ])) : e.createCommentVNode("v-if", !0),
                      a.holdReason ? (e.openBlock(), e.createBlock(me, {
                        key: 1,
                        flags: [a.holdReason]
                      }, null, 8, ["flags"])) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.$t(e.unref(Cu)[a.approval])),
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
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.suppliers.length ? (e.openBlock(), e.createElementBlock("section", fp, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(n.$t("供应商复核")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", hp, [
          e.createElementVNode("table", $p, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("供应商")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  _p,
                  e.toDisplayString(n.$t("未付金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("结论")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("复核发现")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.suppliers, (a) => (e.openBlock(), e.createElementBlock("tr", {
                  key: a.supplier,
                  class: e.normalizeClass({ bad: a.conclusion === "hold", warn: a.conclusion === "conditional" }),
                  "data-test": `fau-ap-supplier-${a.supplier}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.supplier),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", bp, [
                    e.createVNode(l, {
                      cents: a.open
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(n.$t(e.unref(Tu)[a.conclusion])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Sp, [
                    e.createVNode(me, {
                      flags: a.flags
                    }, null, 8, ["flags"])
                  ])
                ], 10, Bp))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", Dp, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (a, m) => (e.openBlock(), e.createElementBlock("li", { key: m }, [
            i[3] || (i[3] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(Z)(a)),
              1
              /* TEXT */
            )
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), wp = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-expense-panel"
}, Tp = { class: "fau-acc-sec" }, Lp = ["data-test"], Kp = { class: "fau-badge muted" }, Ap = { class: "fau-table-wrap" }, Fp = { class: "fau-table" }, Ip = { class: "num" }, Pp = ["data-test"], Op = { class: "num" }, zp = { "data-test": "verdict" }, Mp = { class: "wrap" }, jp = {
  class: "fau-acc-sec",
  "data-test": "fau-exp-anomalies"
}, Rp = {
  key: 0,
  class: "ss-muted"
}, qp = {
  key: 1,
  class: "fau-table-wrap"
}, Up = { class: "fau-table" }, Wp = { class: "num" }, Yp = { class: "num" }, Gp = ["data-test"], Hp = { class: "num" }, Qp = { class: "num" }, Jp = {
  key: 0,
  class: "fau-acc-sec",
  "data-test": "fau-exp-zatca"
}, Zp = { class: "fau-table-wrap" }, Xp = { class: "fau-table" }, xp = { class: "num" }, ey = { class: "num" }, ty = ["data-test"], ly = { class: "num" }, ny = { class: "num" }, ay = { "data-test": "qr-result" }, oy = {
  key: 0,
  class: "fau-badge ok"
}, sy = { class: "fau-acc-sec" }, ry = { class: "fau-table-wrap" }, iy = { class: "fau-table" }, cy = { class: "num" }, dy = { class: "num" }, uy = { class: "wrap" }, my = {
  key: 1,
  class: "fau-acc-esc",
  "data-test": "fau-exp-escalations"
}, py = /* @__PURE__ */ e.defineComponent({
  __name: "ExpensePanel",
  props: {
    run: {},
    def: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result), N = e.computed(() => (t.value?.lines || []).filter((n) => n.qr)), r = ue.FAU_CLAIM_VERDICTS;
    return (n, i) => t.value ? (e.openBlock(), e.createElementBlock("div", wp, [
      e.createElementVNode("section", Tp, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(n.$t("逐单结论")),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(r), (a) => (e.openBlock(), e.createElementBlock("span", {
              key: a,
              class: e.normalizeClass(["fau-badge", a === "pass" ? "ok" : a === "review" ? "warn" : "bad"]),
              "data-test": `fau-exp-verdict-${a}`
            }, [
              e.createTextVNode(
                e.toDisplayString(n.$t(e.unref(rt)[a])) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: t.value.counts[a]
              }, null, 8, ["value"])
            ], 10, Lp))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("span", Kp, [
            e.createTextVNode(
              e.toDisplayString(n.$t("报销合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.totals.amount
            }, null, 8, ["cents"])
          ])
        ]),
        e.createElementVNode("div", Ap, [
          e.createElementVNode("table", Fp, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("报销单号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("报销人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("部门")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ip,
                  e.toDisplayString(n.$t("金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("结论")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("原因")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.claims, (a) => (e.openBlock(), e.createElementBlock("tr", {
                  key: a.claimNo,
                  class: e.normalizeClass({ bad: a.verdict === "reject" || a.verdict === "escalate", warn: a.verdict === "review" }),
                  "data-test": `fau-exp-claim-${a.claimNo}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: a.claimNo
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.employee),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.dept),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Op, [
                    e.createVNode(l, {
                      cents: a.total
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    zp,
                    e.toDisplayString(n.$t(e.unref(rt)[a.verdict])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Mp, [
                    e.createVNode(me, {
                      flags: a.reasons
                    }, null, 8, ["flags"])
                  ])
                ], 10, Pp))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", jp, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(n.$t("异常模式")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", t.value.anomalies.length ? "warn" : "ok"])
            },
            [
              e.createVNode(l, {
                value: t.value.anomalies.length
              }, null, 8, ["value"])
            ],
            2
            /* CLASS */
          )
        ]),
        t.value.anomalies.length ? (e.openBlock(), e.createElementBlock("div", qp, [
          e.createElementVNode("table", Up, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("异常模式")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("级别")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("对象")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Wp,
                  e.toDisplayString(n.$t("笔数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Yp,
                  e.toDisplayString(n.$t("金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("行号")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.anomalies, (a, m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: m,
                  class: e.normalizeClass({ bad: a.level === "block", warn: a.level === "warn" }),
                  "data-test": `fau-exp-anomaly-${a.code}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(n.$t(e.unref(Lu)[a.code])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.level === "block" ? n.$t("须升级") : n.$t("须抽查")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.subject),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Hp, [
                    e.createVNode(l, {
                      value: a.count
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Qp, [
                    e.createVNode(l, {
                      cents: a.amount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: a.rows.join(", ")
                    }, null, 8, ["value"])
                  ])
                ], 10, Gp))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Rp,
          e.toDisplayString(n.$t("无")),
          1
          /* TEXT */
        ))
      ]),
      N.value.length ? (e.openBlock(), e.createElementBlock("section", Jp, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(n.$t("ZATCA 二维码")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Zp, [
          e.createElementVNode("table", Xp, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("行号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("阶段")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("卖方名称")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("增值税号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("开票时间")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  xp,
                  e.toDisplayString(n.$t("含税总额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ey,
                  e.toDisplayString(n.$t("增值税额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("结果")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(N.value, (a) => (e.openBlock(), e.createElementBlock("tr", {
                  key: a.row,
                  class: e.normalizeClass({ bad: !a.qr.ok }),
                  "data-test": `fau-exp-qr-${a.row}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: a.row
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: a.qr.phase
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.qr.sellerName),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: a.qr.vatNo
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: a.qr.timestamp
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", ly, [
                    e.createVNode(l, {
                      cents: a.qr.total
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ny, [
                    e.createVNode(l, {
                      cents: a.qr.vat
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ay, [
                    a.qr.ok ? (e.openBlock(), e.createElementBlock(
                      "span",
                      oy,
                      e.toDisplayString(n.$t("与票面一致")),
                      1
                      /* TEXT */
                    )) : (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      e.renderList(a.qr.problems, (m) => (e.openBlock(), e.createElementBlock(
                        "span",
                        {
                          key: m,
                          class: "fau-badge bad"
                        },
                        e.toDisplayString(n.$t(e.unref(Ku)[m] || m)),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ], 10, ty))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("details", sy, [
        e.createElementVNode(
          "summary",
          null,
          e.toDisplayString(n.$t("逐张票据检查")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", ry, [
          e.createElementVNode("table", iy, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("行号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("报销人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("发票号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("开票日期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("销售方")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  cy,
                  e.toDisplayString(n.$t("价税合计")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("检查结果")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.lines, (a) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: a.row,
                    class: e.normalizeClass({ bad: a.flags.some((m) => m.level === "block"), warn: a.flags.some((m) => m.level === "warn") })
                  },
                  [
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: a.row
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(a.employee),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: a.invoiceNo
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: a.invoiceDate
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(a.seller),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", dy, [
                      e.createVNode(l, {
                        cents: a.total
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", uy, [
                      e.createVNode(me, {
                        flags: a.flags,
                        "ok-text": n.$t("符合规则")
                      }, null, 8, ["flags", "ok-text"])
                    ])
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", my, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (a, m) => (e.openBlock(), e.createElementBlock("li", { key: m }, [
            i[0] || (i[0] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(Z)(a)),
              1
              /* TEXT */
            )
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), yy = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-fa-panel"
}, Ny = { class: "fau-acc-sec" }, Vy = { class: "fau-badge muted" }, Ey = { class: "fau-table-wrap" }, ky = { class: "fau-table" }, vy = { class: "num" }, gy = { class: "num" }, fy = { class: "num" }, hy = { class: "num" }, $y = { class: "num" }, _y = { class: "num" }, By = ["data-test"], by = { class: "num" }, Sy = {
  class: "num",
  "data-test": "expected"
}, Dy = { class: "num" }, Cy = {
  class: "num",
  "data-test": "diff"
}, wy = { class: "num" }, Ty = { class: "num" }, Ly = { class: "wrap" }, Ky = {
  class: "fau-acc-sec",
  "data-test": "fau-fa-roll"
}, Ay = { class: "fau-table-wrap" }, Fy = { class: "fau-table" }, Iy = { class: "num" }, Py = { class: "num" }, Oy = { class: "num" }, zy = { class: "num" }, My = { class: "num" }, jy = { class: "num" }, Ry = { class: "num" }, qy = { class: "num" }, Uy = { class: "num" }, Wy = { class: "num" }, Yy = { class: "num" }, Gy = { class: "num" }, Hy = { class: "num" }, Qy = { class: "num" }, Jy = { class: "num" }, Zy = { class: "num" }, Xy = { class: "num" }, xy = { class: "num" }, eN = {
  key: 0,
  class: "fau-acc-kpis"
}, tN = {
  key: 0,
  class: "fau-acc-sec",
  "data-test": "fau-fa-review"
}, lN = {
  key: 0,
  class: "fau-table-wrap"
}, nN = { class: "fau-table" }, aN = { class: "num" }, oN = { class: "num" }, sN = { class: "num" }, rN = ["data-test"], iN = { class: "num" }, cN = { class: "num" }, dN = {
  class: "num",
  "data-test": "gain"
}, uN = { class: "wrap" }, mN = {
  key: 1,
  class: "fau-list"
}, pN = { class: "grow" }, yN = {
  key: 2,
  class: "ss-note info"
}, NN = {
  key: 1,
  class: "fau-acc-esc",
  "data-test": "fau-fa-escalations"
}, VN = /* @__PURE__ */ e.defineComponent({
  __name: "FixedAssetsPanel",
  props: {
    run: {},
    def: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result), N = e.ref(!1), r = e.computed(() => (t.value?.lines || []).filter((i) => i.flags.some((a) => a.level !== "info"))), n = e.computed(() => N.value || !r.value.length ? t.value?.lines || [] : r.value);
    return (i, a) => t.value ? (e.openBlock(), e.createElementBlock("div", yy, [
      e.createElementVNode("section", Ny, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(i.$t("折旧核对表")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", r.value.length ? "warn" : "ok"]),
              "data-test": "fau-fa-diffs"
            },
            [
              e.createTextVNode(
                e.toDisplayString(i.$t("差异")) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: r.value.length
              }, null, 8, ["value"])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("label", Vy, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[0] || (a[0] = (m) => N.value = m),
                type: "checkbox"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, N.value]
            ]),
            e.createTextVNode(
              " " + e.toDisplayString(i.$t("显示全部资产")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Ey, [
          e.createElementVNode("table", ky, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("资产编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("资产名称")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("折旧方法")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  vy,
                  e.toDisplayString(i.$t("原值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  gy,
                  e.toDisplayString(i.$t("本期应提（重算）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  fy,
                  e.toDisplayString(i.$t("本期账面")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  hy,
                  e.toDisplayString(i.$t("本期差异")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  $y,
                  e.toDisplayString(i.$t("累计折旧（重算）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  _y,
                  e.toDisplayString(i.$t("累计差异")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(n.value, (m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: m.assetNo,
                  class: e.normalizeClass({ bad: m.flags.some((E) => E.level === "block"), warn: m.flags.some((E) => E.level === "warn") }),
                  "data-test": `fau-fa-asset-${m.assetNo}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.assetNo
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(m.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(i.$t(e.unref(Au)[m.method])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", by, [
                    e.createVNode(l, {
                      cents: m.cost
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Sy, [
                    e.createVNode(l, {
                      cents: m.expectedPeriod
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Dy, [
                    e.createVNode(l, {
                      cents: m.bookedPeriod
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Cy, [
                    e.createVNode(l, {
                      cents: m.diffPeriod
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", wy, [
                    e.createVNode(l, {
                      cents: m.expectedAccum
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Ty, [
                    e.createVNode(l, {
                      cents: m.diffAccum
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Ly, [
                    e.createVNode(me, {
                      flags: m.flags
                    }, null, 8, ["flags"])
                  ])
                ], 10, By))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", Ky, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(i.$t("资产滚动表")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ay, [
          e.createElementVNode("table", Fy, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("资产类别")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Iy,
                  e.toDisplayString(i.$t("期初原值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Py,
                  e.toDisplayString(i.$t("本期新增")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Oy,
                  e.toDisplayString(i.$t("本期处置")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  zy,
                  e.toDisplayString(i.$t("期末原值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  My,
                  e.toDisplayString(i.$t("期初累计折旧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  jy,
                  e.toDisplayString(i.$t("本期折旧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ry,
                  e.toDisplayString(i.$t("处置转出折旧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  qy,
                  e.toDisplayString(i.$t("期末累计折旧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Uy,
                  e.toDisplayString(i.$t("期末净值")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.roll, (m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: m.category
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(m.category),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Wy, [
                    e.createVNode(l, {
                      cents: m.openingCost
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Yy, [
                    e.createVNode(l, {
                      cents: m.additions
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Gy, [
                    e.createVNode(l, {
                      cents: m.disposals
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Hy, [
                    e.createVNode(l, {
                      cents: m.closingCost
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Qy, [
                    e.createVNode(l, {
                      cents: m.openingAccum
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Jy, [
                    e.createVNode(l, {
                      cents: m.depreciation
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Zy, [
                    e.createVNode(l, {
                      cents: m.disposalAccum
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Xy, [
                    e.createVNode(l, {
                      cents: m.closingAccum
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", xy, [
                    e.createVNode(l, {
                      cents: m.nbv
                    }, null, 8, ["cents"])
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        t.value.glTie ? (e.openBlock(), e.createElementBlock("div", eN, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.glTie, (m) => (e.openBlock(), e.createElementBlock(
              "span",
              {
                key: m.item,
                class: e.normalizeClass(["fau-badge", m.diff ? "bad" : "ok"])
              },
              [
                e.createTextVNode(
                  e.toDisplayString(m.item === "cost" ? i.$t("原值") : i.$t("累计折旧")) + " · " + e.toDisplayString(i.$t("与总账差")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: m.diff
                }, null, 8, ["cents"])
              ],
              2
              /* CLASS */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      t.value.disposals.length || t.value.additions.length ? (e.openBlock(), e.createElementBlock("section", tN, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(i.$t("购置与处置审核")),
            1
            /* TEXT */
          )
        ]),
        t.value.disposals.length ? (e.openBlock(), e.createElementBlock("div", lN, [
          e.createElementVNode("table", nN, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("资产编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("处置日期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  aN,
                  e.toDisplayString(i.$t("账面净值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  oN,
                  e.toDisplayString(i.$t("净收入")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  sN,
                  e.toDisplayString(i.$t("处置损益")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.disposals, (m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: `${m.assetNo}-${m.row}`,
                  "data-test": `fau-fa-disposal-${m.assetNo}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.assetNo
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.date
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", iN, [
                    e.createVNode(l, {
                      cents: m.nbv
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", cN, [
                    e.createVNode(l, {
                      cents: m.net
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", dN, [
                    e.createVNode(l, {
                      cents: m.gainLoss
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", uN, [
                    e.createVNode(me, {
                      flags: m.flags
                    }, null, 8, ["flags"])
                  ])
                ], 8, rN))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0),
        t.value.additions.length ? (e.openBlock(), e.createElementBlock("ul", mN, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.additions, (m) => (e.openBlock(), e.createElementBlock("li", {
              key: `${m.assetNo}-${m.row}`
            }, [
              e.createVNode(l, {
                value: m.assetNo
              }, null, 8, ["value"]),
              e.createElementVNode(
                "span",
                pN,
                e.toDisplayString(m.name),
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                cents: m.amount
              }, null, 8, ["cents"]),
              e.createVNode(me, {
                flags: m.flags,
                "ok-text": i.$t("符合资本化条件")
              }, null, 8, ["flags", "ok-text"])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0),
        t.value.je.length ? (e.openBlock(), e.createElementBlock("p", yN, [
          a[1] || (a[1] = e.createElementVNode(
            "i",
            { class: "ri-file-list-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(i.$t("处置分录草稿 {n} 行，借贷合计相等，只出导入格式，不过账", { n: t.value.je.length })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", NN, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (m, E) => (e.openBlock(), e.createElementBlock("li", { key: E }, [
            a[2] || (a[2] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(Z)(m)),
              1
              /* TEXT */
            )
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), EN = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-payroll-panel"
}, kN = { class: "fau-acc-sec" }, vN = { class: "fau-badge muted" }, gN = { class: "fau-badge" }, fN = { class: "fau-badge" }, hN = { class: "fau-badge muted" }, $N = {
  key: 0,
  class: "fau-badge warn",
  "data-test": "fau-pay-eosb-total"
}, _N = {
  key: 0,
  class: "ss-note warn"
}, BN = { class: "fau-table-wrap" }, bN = { class: "fau-table" }, SN = { class: "num" }, DN = { class: "num" }, CN = { class: "num" }, wN = { class: "num" }, TN = { class: "num" }, LN = { class: "num" }, KN = { class: "num" }, AN = { class: "num" }, FN = { class: "num" }, IN = ["data-test"], PN = { class: "num" }, ON = { class: "num" }, zN = { class: "num" }, MN = {
  class: "num",
  "data-test": "iit-expected"
}, jN = { class: "num" }, RN = { class: "num" }, qN = {
  class: "num",
  "data-test": "eosb"
}, UN = { class: "num" }, WN = { class: "num" }, YN = { class: "wrap" }, GN = {
  key: 0,
  class: "fau-acc-sec",
  "data-test": "fau-pay-changes"
}, HN = {
  key: 0,
  class: "ss-muted"
}, QN = {
  key: 1,
  class: "fau-list"
}, JN = { class: "grow" }, ZN = {
  key: 1,
  class: "ss-note info",
  "data-test": "fau-pay-je"
}, XN = {
  key: 2,
  class: "fau-acc-esc",
  "data-test": "fau-pay-escalations"
}, xN = /* @__PURE__ */ e.defineComponent({
  __name: "PayrollPanel",
  props: {
    run: {},
    def: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result);
    return (N, r) => t.value ? (e.openBlock(), e.createElementBlock("div", EN, [
      e.createElementVNode("section", kN, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(N.$t("薪资复核表")) + " · " + e.toDisplayString(N.$t(e.unref(Fu)[t.value.regime])),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", vN, [
            e.createTextVNode(
              e.toDisplayString(N.$t("人数")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: t.value.totals.headcount
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("span", gN, [
            e.createTextVNode(
              e.toDisplayString(N.$t("应发合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.totals.gross
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", fN, [
            e.createTextVNode(
              e.toDisplayString(N.$t("实发合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.totals.net
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", hN, [
            e.createTextVNode(
              e.toDisplayString(N.$t("单位负担")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.totals.employer
            }, null, 8, ["cents"])
          ]),
          t.value.regime === "sa" ? (e.openBlock(), e.createElementBlock("span", $N, [
            e.createTextVNode(
              e.toDisplayString(N.$t("期末服务金本期计提")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.totals.eosbAccrual
            }, null, 8, ["cents"])
          ])) : e.createCommentVNode("v-if", !0)
        ]),
        t.value.regime === "sa" ? (e.openBlock(), e.createElementBlock("p", _N, [
          r[0] || (r[0] = e.createElementVNode(
            "i",
            { class: "ri-scales-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(N.$t("沙特 GOSI 比例与期末服务金口径为草稿口径，待当地专业人员审核")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", BN, [
          e.createElementVNode("table", bN, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("员工编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("姓名")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  SN,
                  e.toDisplayString(N.$t("应发合计")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  DN,
                  e.toDisplayString(t.value.regime === "sa" ? N.$t("GOSI 个人应扣") : N.$t("个人扣款（应扣）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  CN,
                  e.toDisplayString(N.$t("个人扣款（实扣）")),
                  1
                  /* TEXT */
                ),
                t.value.regime === "cn" ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode(
                      "th",
                      wN,
                      e.toDisplayString(N.$t("个税应扣")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      TN,
                      e.toDisplayString(N.$t("个税实扣")),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0),
                t.value.regime === "sa" ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    e.createElementVNode(
                      "th",
                      LN,
                      e.toDisplayString(N.$t("服务年限")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      KN,
                      e.toDisplayString(N.$t("期末服务金（重算）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      AN,
                      e.toDisplayString(N.$t("期末服务金（账面）")),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0),
                e.createElementVNode(
                  "th",
                  FN,
                  e.toDisplayString(N.$t("实发（重算）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.lines, (n) => (e.openBlock(), e.createElementBlock("tr", {
                  key: n.empId,
                  class: e.normalizeClass({ bad: n.flags.some((i) => i.level === "block"), warn: n.flags.some((i) => i.level === "warn") }),
                  "data-test": `fau-pay-emp-${n.empId}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: n.empId
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(n.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", PN, [
                    e.createVNode(l, {
                      cents: n.gross
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ON, [
                    e.createVNode(l, {
                      cents: n.personalExpected
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", zN, [
                    e.createVNode(l, {
                      cents: n.personal
                    }, null, 8, ["cents"])
                  ]),
                  t.value.regime === "cn" ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("td", MN, [
                        e.createVNode(l, {
                          cents: n.iitExpected
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", jN, [
                        e.createVNode(l, {
                          cents: n.iitWithheld
                        }, null, 8, ["cents"])
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0),
                  t.value.regime === "sa" ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createElementVNode("td", RN, [
                        e.createVNode(l, {
                          value: n.eosb?.years ?? "-"
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", qN, [
                        e.createVNode(l, {
                          cents: n.eosb?.liability ?? null
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", UN, [
                        e.createVNode(l, {
                          cents: n.eosb?.booked ?? null
                        }, null, 8, ["cents"])
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("td", WN, [
                    e.createVNode(l, {
                      cents: n.netExpected
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", YN, [
                    e.createVNode(me, {
                      flags: n.flags
                    }, null, 8, ["flags"])
                  ])
                ], 10, IN))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      t.value.changes ? (e.openBlock(), e.createElementBlock("section", GN, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(N.$t("增减员")),
            1
            /* TEXT */
          )
        ]),
        t.value.changes.length ? (e.openBlock(), e.createElementBlock("ul", QN, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.changes, (n) => (e.openBlock(), e.createElementBlock("li", {
              key: `${n.kind}-${n.empId}`
            }, [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["fau-badge", n.kind === "hire" ? "ok" : "muted"])
                },
                e.toDisplayString(n.kind === "hire" ? N.$t("新增") : N.$t("减员")),
                3
                /* TEXT, CLASS */
              ),
              e.createVNode(l, {
                value: n.empId
              }, null, 8, ["value"]),
              e.createElementVNode(
                "span",
                JN,
                e.toDisplayString(n.name),
                1
                /* TEXT */
              ),
              e.createVNode(me, {
                flags: n.flags.filter((i) => i.level !== "info")
              }, null, 8, ["flags"])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          HN,
          e.toDisplayString(N.$t("无")),
          1
          /* TEXT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      t.value.je.length ? (e.openBlock(), e.createElementBlock("p", ZN, [
        r[1] || (r[1] = e.createElementVNode(
          "i",
          { class: "ri-file-list-3-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(N.$t("工资计提分录草稿 {n} 行，借贷合计相等，只出导入格式，不过账", { n: t.value.je.length })),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", XN, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (n, i) => (e.openBlock(), e.createElementBlock("li", { key: i }, [
            r[2] || (r[2] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(Z)(n)),
              1
              /* TEXT */
            )
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), eV = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-ic-panel"
}, tV = {
  key: 0,
  class: "fau-acc-sec"
}, lV = { class: "fau-table-wrap" }, nV = { class: "fau-table" }, aV = { class: "num" }, oV = { class: "num" }, sV = { class: "num" }, rV = { class: "num" }, iV = ["data-test"], cV = { class: "num" }, dV = { class: "num" }, uV = { class: "num" }, mV = {
  class: "num",
  "data-test": "eliminated"
}, pV = ["open"], yV = { class: "fau-table-wrap" }, NV = { class: "fau-table" }, VV = { class: "num" }, EV = { class: "num" }, kV = { class: "num" }, vV = { class: "num" }, gV = { class: "num" }, fV = { class: "num" }, hV = { class: "ss-note info" }, $V = {
  key: 1,
  class: "fau-acc-sec",
  "data-test": "fau-ic-guarantees"
}, _V = { class: "fau-table-wrap" }, BV = { class: "fau-table" }, bV = { class: "num" }, SV = { class: "num" }, DV = { class: "num" }, CV = { class: "num" }, wV = { class: "wrap" }, TV = {
  key: 2,
  class: "fau-acc-sec",
  "data-test": "fau-ic-pricing"
}, LV = { class: "fau-table-wrap" }, KV = { class: "fau-table" }, AV = { class: "num" }, FV = { class: "num" }, IV = { class: "num" }, PV = { class: "num" }, OV = { class: "num" }, zV = { class: "num" }, MV = {
  key: 3,
  class: "fau-acc-esc",
  "data-test": "fau-ic-escalations"
}, jV = /* @__PURE__ */ e.defineComponent({
  __name: "IntercompanyPanel",
  props: {
    run: {},
    def: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result);
    return (N, r) => t.value ? (e.openBlock(), e.createElementBlock("div", eV, [
      t.value.pairs.length ? (e.openBlock(), e.createElementBlock("section", tV, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(N.$t("对账汇总")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", t.value.breaks.length ? "warn" : "ok"])
            },
            [
              e.createTextVNode(
                e.toDisplayString(N.$t("差异")) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: t.value.breaks.length
              }, null, 8, ["value"])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", t.value.balanced ? "ok" : "bad"]),
              "data-test": "fau-ic-balanced"
            },
            e.toDisplayString(t.value.balanced ? N.$t("抵销分录借贷平衡") : N.$t("抵销分录借贷不平")),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode("div", lV, [
          e.createElementVNode("table", nV, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("配对类别")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("本方公司")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("对方公司")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  aV,
                  e.toDisplayString(N.$t("本方金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  oV,
                  e.toDisplayString(N.$t("对方金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  sV,
                  e.toDisplayString(N.$t("差额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  rV,
                  e.toDisplayString(N.$t("抵销金额")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.pairs, (n, i) => (e.openBlock(), e.createElementBlock("tr", {
                  key: i,
                  class: e.normalizeClass({ warn: n.diff !== 0 }),
                  "data-test": `fau-ic-pair-${n.pair}-${n.entity}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(N.$t(e.unref(it)[n.pair])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(n.entity),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(n.counterparty),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", cV, [
                    e.createVNode(l, {
                      cents: n.own
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", dV, [
                    e.createVNode(l, {
                      cents: n.other
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", uV, [
                    e.createVNode(l, {
                      cents: n.diff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", mV, [
                    e.createVNode(l, {
                      cents: n.eliminated
                    }, null, 8, ["cents"])
                  ])
                ], 10, iV))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        t.value.breaks.length ? (e.openBlock(), e.createElementBlock("details", {
          key: 0,
          open: t.value.breaks.length <= 10
        }, [
          e.createElementVNode(
            "summary",
            null,
            e.toDisplayString(N.$t("差异明细")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", yV, [
            e.createElementVNode("table", NV, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(N.$t("配对类别")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(N.$t("本方公司")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(N.$t("对账键")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(N.$t("分类")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    VV,
                    e.toDisplayString(N.$t("本方金额")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    EV,
                    e.toDisplayString(N.$t("对方金额")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    kV,
                    e.toDisplayString(N.$t("差额")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(t.value.breaks, (n) => (e.openBlock(), e.createElementBlock("tr", {
                    key: n.id
                  }, [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(N.$t(e.unref(it)[n.pair])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.entity),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: n.key
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(N.$t(e.unref(Iu)[n.cls] || n.cls)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", vV, [
                      e.createVNode(l, {
                        cents: n.own
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", gV, [
                      e.createVNode(l, {
                        cents: n.other
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", fV, [
                      e.createVNode(l, {
                        cents: n.diff
                      }, null, 8, ["cents"])
                    ])
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])
        ], 8, pV)) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("p", hV, [
          r[0] || (r[0] = e.createElementVNode(
            "i",
            { class: "ri-information-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(N.$t("抵销分录不含存货中的未实现内部利润，需按毛利率与期末结存另行计算")),
            1
            /* TEXT */
          )
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.guarantees ? (e.openBlock(), e.createElementBlock("section", $V, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(N.$t("担保检查")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", _V, [
          e.createElementVNode("table", BV, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("担保方")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("被担保方")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  bV,
                  e.toDisplayString(N.$t("担保金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("到期日")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  SV,
                  e.toDisplayString(N.$t("担保余额 / 净资产")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.guarantees, (n) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: n.row,
                    class: e.normalizeClass({ bad: n.flags.some((i) => i.level === "block"), warn: n.flags.some((i) => i.level === "warn") })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.guarantor),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.beneficiary),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", DV, [
                      e.createVNode(l, {
                        cents: n.amount
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: n.endDate
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", CV, [
                      e.createVNode(l, {
                        ratio: n.ratio
                      }, null, 8, ["ratio"])
                    ]),
                    e.createElementVNode("td", wV, [
                      e.createVNode(me, {
                        flags: n.flags
                      }, null, 8, ["flags"])
                    ])
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.pricing ? (e.openBlock(), e.createElementBlock("section", TV, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(N.$t("内部定价偏离")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", LV, [
          e.createElementVNode("table", KV, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("本方公司")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("对方公司")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("往来类型 / 科目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  AV,
                  e.toDisplayString(N.$t("内部价格")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  FV,
                  e.toDisplayString(N.$t("市场价格")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  IV,
                  e.toDisplayString(N.$t("偏离率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("结论")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.pricing, (n) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: n.row,
                    class: e.normalizeClass({ warn: n.flagged })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.entity),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.counterparty),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.type),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", PV, [
                      e.createVNode(l, {
                        value: n.internalPrice
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", OV, [
                      e.createVNode(l, {
                        value: n.marketPrice
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", zV, [
                      e.createVNode(l, {
                        ratio: n.deviation
                      }, null, 8, ["ratio"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.flagged ? N.$t("偏离，转转让定价") : N.$t("在范围内")),
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
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", MV, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (n, i) => (e.openBlock(), e.createElementBlock("li", { key: i }, [
            r[1] || (r[1] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(Z)(n)),
              1
              /* TEXT */
            )
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), RV = {
  ar: Fm,
  ap: Cp,
  expense: py,
  "fixed-assets": VN,
  payroll: xN,
  intercompany: jV
}, qV = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PANELS: RV
}, Symbol.toStringTag, { value: "Module" })), ee = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/financeAudit/auditLabels.ts"];
if (!ee) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/financeAudit/auditLabels.ts");
ee.default;
const UV = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-icfr-panel"
}, WV = {
  key: 0,
  class: "fau-sec"
}, YV = { class: "grow" }, GV = { class: "fau-badge warn" }, HV = { class: "fau-table-wrap" }, QV = { class: "fau-table" }, JV = ["data-test"], ZV = { class: "wrap" }, XV = { class: "fau-quote" }, xV = ["open"], eE = { class: "fau-table-wrap" }, tE = { class: "fau-table" }, lE = { class: "wrap" }, nE = { class: "fau-quote" }, aE = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-icfr-plans"
}, oE = { class: "grow" }, sE = { class: "fau-row" }, rE = { class: "ss-muted" }, iE = ["disabled"], cE = ["disabled"], dE = { class: "fau-table-wrap" }, uE = { class: "fau-table" }, mE = { class: "num" }, pE = { class: "num" }, yE = { class: "num" }, NE = { class: "num" }, VE = ["data-test"], EE = { class: "num" }, kE = { class: "num" }, vE = { class: "num" }, gE = ["data-test"], fE = {
  key: 0,
  class: "fau-badge muted"
}, hE = { open: "" }, $E = { class: "fau-table-wrap" }, _E = { class: "fau-table" }, BE = { class: "num" }, bE = { class: "num" }, SE = { class: "num" }, DE = { class: "num" }, CE = { class: "fau-seg" }, wE = ["disabled", "data-test", "onClick"], TE = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-icfr-deficiencies"
}, LE = { class: "grow" }, KE = ["data-test"], AE = {
  key: 0,
  class: "ss-muted"
}, FE = {
  key: 1,
  class: "fau-table-wrap"
}, IE = { class: "fau-table" }, PE = { class: "num" }, OE = ["data-test"], zE = { class: "wrap" }, ME = { class: "num" }, jE = ["value", "disabled", "data-test", "onChange"], RE = ["value"], qE = ["value", "disabled", "data-test", "onChange"], UE = ["value"], WE = ["data-test"], YE = {
  key: 3,
  class: "ss-note danger"
}, GE = /* @__PURE__ */ e.defineComponent({
  __name: "IcfrPanel",
  props: {
    run: {},
    def: {}
  },
  emits: ["changed"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = e.computed(() => t.run.result), n = e.computed(() => !["signing", "archived", "void"].includes(t.run.status)), i = e.ref(!1), a = e.ref(""), m = e.ref(typeof t.run.params.seed == "number" ? t.run.params.seed : r.value?.plans[0]?.seed ?? 0), E = ["pass", "fail", "pending"], u = ue.FAU_DEFICIENCY_GRADES, L = ue.FAU_IMPACT_LEVELS, g = ue.FAU_COMPENSATING, v = { material_weakness: "bad", significant: "warn", deficiency: "muted", improvement: "ok" }, b = { effective: "ok", ineffective: "bad", pending: "muted" }, h = (w) => r.value?.tests.find((p) => p.controlId === w);
    async function K(w) {
      i.value = !0, a.value = "";
      try {
        await w(), N("changed");
      } catch (p) {
        a.value = Q.errorMessage(p);
      } finally {
        i.value = !1;
      }
    }
    const T = (w, p, f) => K(() => Y("icfr.sample.update", { runId: t.run.id, controlId: w, row: p, result: f })), z = (w, p) => K(() => Y("icfr.deficiency.update", { runId: t.run.id, id: w, ...p })), S = () => K(() => Y("audit.params.set", { runId: t.run.id, moduleId: "icfr", params: { seed: Math.max(0, Math.floor(Number(m.value) || 0)) } }));
    return (w, p) => r.value ? (e.openBlock(), e.createElementBlock("div", UV, [
      r.value.mode === "design" ? (e.openBlock(), e.createElementBlock("section", WV, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            YV,
            e.toDisplayString(w.$t("风险控制矩阵（草稿）")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            GV,
            e.toDisplayString(w.$t("起草的控制须经测试才能下结论")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", HV, [
          e.createElementVNode("table", QV, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("控制编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("流程")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("控制描述")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("频率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("关键控制")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("回核")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.controls, (f) => (e.openBlock(), e.createElementBlock("tr", {
                  key: f.id,
                  class: e.normalizeClass({ warn: !f.verified }),
                  "data-test": `fau-rcm-${f.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: f.id
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(f.process),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", ZV, [
                    e.createTextVNode(
                      e.toDisplayString(f.description),
                      1
                      /* TEXT */
                    ),
                    p[1] || (p[1] = e.createElementVNode(
                      "br",
                      null,
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "small",
                      XV,
                      e.toDisplayString(f.quote),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(w.$t(e.unref(ee.FREQ_LABEL)[f.frequency])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(f.key ? w.$t("是") : ""),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["fau-badge", f.verified ? "ok" : "bad"])
                      },
                      e.toDisplayString(f.verified ? w.$t("已核实") : w.$t("未核实")),
                      3
                      /* TEXT, CLASS */
                    )
                  ])
                ], 10, JV))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        e.createElementVNode("details", {
          open: r.value.approvalMatrix.length > 0
        }, [
          e.createElementVNode("summary", null, [
            e.createTextVNode(
              e.toDisplayString(w.$t("审批矩阵")) + " · ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: r.value.approvalMatrix.length
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("div", eE, [
            e.createElementVNode("table", tE, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(w.$t("事项")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(w.$t("权限条件")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(w.$t("审批人")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(w.$t("原文依据")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(r.value.approvalMatrix, (f, y) => (e.openBlock(), e.createElementBlock("tr", { key: y }, [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(f.matter),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(f.threshold),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(f.approver),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", lE, [
                      e.createElementVNode(
                        "small",
                        nE,
                        e.toDisplayString(f.quote),
                        1
                        /* TEXT */
                      )
                    ])
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])
        ], 8, xV)
      ])) : e.createCommentVNode("v-if", !0),
      r.value.mode === "testing" ? (e.openBlock(), e.createElementBlock("section", aE, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            oE,
            e.toDisplayString(w.$t("抽样计划")),
            1
            /* TEXT */
          ),
          e.createElementVNode("label", sE, [
            e.createElementVNode(
              "span",
              rE,
              e.toDisplayString(w.$t("随机种子")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": p[0] || (p[0] = (f) => m.value = f),
              type: "number",
              min: "0",
              disabled: !n.value,
              "data-test": "fau-icfr-seed"
            }, null, 8, iE), [
              [
                e.vModelText,
                m.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: i.value || !n.value,
            "data-test": "fau-icfr-reseed",
            onClick: S
          }, e.toDisplayString(w.$t("按这个种子重新抽样")), 9, cE)
        ]),
        e.createElementVNode("div", dE, [
          e.createElementVNode("table", uE, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("控制编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("频率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  mE,
                  e.toDisplayString(w.$t("总体数量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  pE,
                  e.toDisplayString(w.$t("属性抽样样本量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  yE,
                  e.toDisplayString(w.$t("频率最小样本量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  NE,
                  e.toDisplayString(w.$t("样本量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("随机种子")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("结论")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.plans, (f) => (e.openBlock(), e.createElementBlock("tr", {
                  key: f.controlId,
                  "data-test": `fau-plan-${f.controlId}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: f.controlId
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(w.$t(e.unref(ee.FREQ_LABEL)[f.frequency])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", EE, [
                    e.createVNode(l, {
                      value: f.population
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", kE, [
                    e.createVNode(l, {
                      value: f.attributeN
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", vE, [
                    e.createVNode(l, {
                      value: f.frequencyMin
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", {
                    class: "num",
                    "data-test": `fau-plan-n-${f.controlId}`
                  }, [
                    e.createVNode(l, {
                      value: f.n
                    }, null, 8, ["value"]),
                    f.testAll ? (e.openBlock(), e.createElementBlock(
                      "span",
                      fE,
                      e.toDisplayString(w.$t("全量测试")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ], 8, gE),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: f.seed
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["fau-badge", b[h(f.controlId)?.conclusion || "pending"]])
                      },
                      e.toDisplayString(w.$t(e.unref(ee.CONCLUSION_LABEL)[h(f.controlId)?.conclusion || "pending"])),
                      3
                      /* TEXT, CLASS */
                    )
                  ])
                ], 8, VE))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        e.createElementVNode("details", hE, [
          e.createElementVNode("summary", null, [
            e.createTextVNode(
              e.toDisplayString(w.$t("样本明细与测试结论")) + " · ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: r.value.samples.length
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("div", $E, [
            e.createElementVNode("table", _E, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(w.$t("控制编号")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    BE,
                    e.toDisplayString(w.$t("序号")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(w.$t("单号")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(w.$t("日期")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    bE,
                    e.toDisplayString(w.$t("金额")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(w.$t("测试结论")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(r.value.samples, (f) => (e.openBlock(), e.createElementBlock(
                    "tr",
                    {
                      key: `${f.controlId}#${f.row}`,
                      class: e.normalizeClass({ bad: f.result === "fail" })
                    },
                    [
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: f.controlId
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", SE, [
                        e.createVNode(l, {
                          value: f.seq
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: f.ref
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: f.date
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", DE, [
                        e.createVNode(l, {
                          cents: f.amount
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("span", CE, [
                          (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(E, (y) => e.createElementVNode("button", {
                              key: y,
                              type: "button",
                              class: e.normalizeClass({ on: f.result === y }),
                              disabled: i.value || !n.value,
                              "data-test": `fau-sample-${f.controlId}-${f.seq}-${y}`,
                              onClick: (I) => T(f.controlId, f.row, y)
                            }, e.toDisplayString(w.$t(e.unref(ee.RESULT_LABEL)[y])), 11, wE)),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ])
                      ])
                    ],
                    2
                    /* CLASS */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      r.value.mode !== "design" ? (e.openBlock(), e.createElementBlock("section", TE, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            LE,
            e.toDisplayString(w.$t("缺陷评估")),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(u), (f) => (e.openBlock(), e.createElementBlock("span", {
              key: f,
              class: e.normalizeClass(["fau-badge", v[f]]),
              "data-test": `fau-grade-count-${f}`
            }, [
              e.createTextVNode(
                e.toDisplayString(w.$t(e.unref(ee.GRADE_LABEL)[f])) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: r.value.counts[f] || 0
              }, null, 8, ["value"])
            ], 10, KE))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        r.value.deficiencies.length ? (e.openBlock(), e.createElementBlock("div", FE, [
          e.createElementVNode("table", IE, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("缺陷编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("缺陷描述")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  PE,
                  e.toDisplayString(w.$t("涉及金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("财务影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("运营影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("补偿性控制")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(w.$t("缺陷等级")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.deficiencies, (f) => (e.openBlock(), e.createElementBlock("tr", {
                  key: f.id,
                  class: e.normalizeClass({ bad: f.grade === "material_weakness" }),
                  "data-test": `fau-def-${f.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: f.id
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    zE,
                    e.toDisplayString(f.description),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", ME, [
                    e.createVNode(l, {
                      cents: f.amount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(w.$t(e.unref(ee.IMPACT_LABEL)[f.amountTier])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("select", {
                      value: f.opImpact,
                      disabled: i.value || !n.value,
                      "data-test": `fau-def-op-${f.id}`,
                      onChange: (y) => z(f.id, { opImpact: y.target.value })
                    }, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(L), (y) => (e.openBlock(), e.createElementBlock("option", {
                          key: y,
                          value: y
                        }, e.toDisplayString(w.$t(e.unref(ee.IMPACT_LABEL)[y])), 9, RE))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 40, jE)
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("select", {
                      value: f.compensating,
                      disabled: i.value || !n.value,
                      "data-test": `fau-def-comp-${f.id}`,
                      onChange: (y) => z(f.id, { compensating: y.target.value })
                    }, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(g), (y) => (e.openBlock(), e.createElementBlock("option", {
                          key: y,
                          value: y
                        }, e.toDisplayString(w.$t(e.unref(ee.COMP_LABEL)[y])), 9, UE))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 40, qE)
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("span", {
                      class: e.normalizeClass(["fau-badge", v[f.grade]]),
                      "data-test": `fau-def-grade-${f.id}`
                    }, e.toDisplayString(w.$t(e.unref(ee.GRADE_LABEL)[f.grade])), 11, WE)
                  ])
                ], 10, OE))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          AE,
          e.toDisplayString(w.$t("没有缺陷")),
          1
          /* TEXT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", YE, [
        p[2] || (p[2] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(a.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), HE = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-ia-panel"
}, QE = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-ia-plan"
}, JE = { class: "grow" }, ZE = { class: "fau-row" }, XE = { class: "ss-muted" }, xE = ["disabled"], e1 = ["disabled"], t1 = { class: "fau-counts" }, l1 = { class: "fau-badge" }, n1 = { class: "fau-badge" }, a1 = { class: "fau-table-wrap" }, o1 = { class: "fau-table" }, s1 = { class: "num" }, r1 = ["data-test"], i1 = { class: "num" }, c1 = { class: "wrap" }, d1 = {
  key: 0,
  class: "fau-badge bad"
}, u1 = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-ia-fieldwork"
}, m1 = { class: "grow" }, p1 = { class: "fau-badge" }, y1 = {
  key: 0,
  class: "ss-muted"
}, N1 = {
  key: 1,
  class: "fau-table-wrap"
}, V1 = { class: "fau-table" }, E1 = { class: "wrap" }, k1 = { class: "wrap" }, v1 = { class: "wrap" }, g1 = { class: "fau-quote" }, f1 = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-ia-tracking"
}, h1 = { class: "grow" }, $1 = { class: "fau-row" }, _1 = { class: "ss-muted" }, B1 = ["disabled"], b1 = ["disabled"], S1 = { class: "fau-counts" }, D1 = ["data-test"], C1 = { class: "fau-table-wrap" }, w1 = { class: "fau-table" }, T1 = { class: "num" }, L1 = ["data-test"], K1 = { class: "wrap" }, A1 = { class: "num" }, F1 = {
  key: 3,
  class: "ss-note danger"
}, I1 = /* @__PURE__ */ e.defineComponent({
  __name: "InternalAuditPanel",
  props: {
    run: {},
    def: {}
  },
  emits: ["changed"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = e.computed(() => t.run.result), n = e.computed(() => !["signing", "archived", "void"].includes(t.run.status)), i = e.ref(!1), a = e.ref(""), m = e.ref(r.value?.plan?.availableDays ?? 240), E = e.ref(r.value?.asOf || ""), u = [3, 2, 1];
    async function L(g) {
      i.value = !0, a.value = "";
      try {
        await Y("audit.params.set", { runId: t.run.id, moduleId: "internal-audit", params: g }), N("changed");
      } catch (v) {
        a.value = Q.errorMessage(v);
      } finally {
        i.value = !1;
      }
    }
    return (g, v) => r.value ? (e.openBlock(), e.createElementBlock("div", HE, [
      r.value.plan ? (e.openBlock(), e.createElementBlock("section", QE, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            JE,
            e.toDisplayString(g.$t("年度审计计划")),
            1
            /* TEXT */
          ),
          e.createElementVNode("label", ZE, [
            e.createElementVNode(
              "span",
              XE,
              e.toDisplayString(g.$t("年度可用审计人天")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": v[0] || (v[0] = (b) => m.value = b),
              type: "number",
              min: "0",
              disabled: !n.value,
              "data-test": "fau-ia-days"
            }, null, 8, xE), [
              [
                e.vModelText,
                m.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: i.value || !n.value,
            onClick: v[1] || (v[1] = (b) => L({ availableDays: Number(m.value) || 0 }))
          }, e.toDisplayString(g.$t("按新人天重算")), 9, e1)
        ]),
        e.createElementVNode("div", t1, [
          e.createElementVNode("span", l1, [
            e.createTextVNode(
              e.toDisplayString(g.$t("需求人天")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: r.value.plan.requiredDays
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("span", n1, [
            e.createTextVNode(
              e.toDisplayString(g.$t("可用人天")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: r.value.plan.availableDays
            }, null, 8, ["value"])
          ]),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", r.value.plan.gap > 0 ? "bad" : "ok"]),
              "data-test": "fau-ia-gap"
            },
            [
              e.createTextVNode(
                e.toDisplayString(g.$t("缺口")) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: r.value.plan.gap
              }, null, 8, ["value"])
            ],
            2
            /* CLASS */
          )
        ]),
        e.createElementVNode("div", a1, [
          e.createElementVNode("table", o1, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("审计领域")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("可能性")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("风险等级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("必审")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  s1,
                  e.toDisplayString(g.$t("预计人天")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("季度")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.plan.areas, (b) => (e.openBlock(), e.createElementBlock("tr", {
                  key: b.id,
                  class: e.normalizeClass({ warn: !b.included }),
                  "data-test": `fau-ia-area-${b.id}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(b.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(g.$t(e.unref(ee.IMPACT_LABEL)[b.likelihood])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(g.$t(e.unref(ee.IMPACT_LABEL)[b.impact])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["fau-badge", b.risk === "high" ? "bad" : b.risk === "medium" ? "warn" : "muted"])
                      },
                      e.toDisplayString(g.$t(e.unref(ee.IMPACT_LABEL)[b.risk])),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(b.mandatory ? g.$t("是") : ""),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", i1, [
                    e.createVNode(l, {
                      value: b.days
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(b.included ? b.quarter : g.$t("未纳入")),
                    1
                    /* TEXT */
                  )
                ], 10, r1))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        e.createElementVNode("p", c1, [
          e.createTextVNode(
            e.toDisplayString(r.value.plan.narrative) + " ",
            1
            /* TEXT */
          ),
          r.value.plan.narrativeStatus === "unverified" ? (e.openBlock(), e.createElementBlock(
            "span",
            d1,
            e.toDisplayString(g.$t("未核实")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      r.value.mode === "fieldwork" ? (e.openBlock(), e.createElementBlock("section", u1, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            m1,
            e.toDisplayString(g.$t("审计发现")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", p1, [
            e.createTextVNode(
              e.toDisplayString(g.$t("审计程序")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: r.value.procedures?.length || 0
            }, null, 8, ["value"])
          ])
        ]),
        r.value.findings?.length ? (e.openBlock(), e.createElementBlock("div", N1, [
          e.createElementVNode("table", V1, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("标题")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("严重程度")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("建议")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("原文依据")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.findings, (b) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: b.id,
                    class: e.normalizeClass({ bad: b.severity === "major" })
                  },
                  [
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: b.id
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode(
                      "td",
                      E1,
                      e.toDisplayString(b.title),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["fau-badge", b.severity === "major" ? "bad" : b.severity === "moderate" ? "warn" : "muted"])
                        },
                        e.toDisplayString(g.$t(e.unref(ee.SEVERITY_LABEL)[b.severity])),
                        3
                        /* TEXT, CLASS */
                      )
                    ]),
                    e.createElementVNode(
                      "td",
                      k1,
                      e.toDisplayString(b.recommendation),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", v1, [
                      e.createElementVNode(
                        "small",
                        g1,
                        e.toDisplayString(b.quote) + " · " + e.toDisplayString(b.docName),
                        1
                        /* TEXT */
                      )
                    ])
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          y1,
          e.toDisplayString(g.$t("没有能引用原文的发现")),
          1
          /* TEXT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      r.value.tracked ? (e.openBlock(), e.createElementBlock("section", f1, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            h1,
            e.toDisplayString(g.$t("发现整改台账")),
            1
            /* TEXT */
          ),
          e.createElementVNode("label", $1, [
            e.createElementVNode(
              "span",
              _1,
              e.toDisplayString(g.$t("截至日")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": v[2] || (v[2] = (b) => E.value = b),
              type: "date",
              disabled: !n.value
            }, null, 8, B1), [
              [e.vModelText, E.value]
            ])
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: i.value || !n.value,
            onClick: v[3] || (v[3] = (b) => L({ asOf: E.value }))
          }, e.toDisplayString(g.$t("按截至日重算")), 9, b1)
        ]),
        e.createElementVNode("div", S1, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(u, (b) => e.createElementVNode("span", {
              key: b,
              class: e.normalizeClass(["fau-badge", b >= 2 ? "bad" : b === 1 ? "warn" : "muted"]),
              "data-test": `fau-ia-tier-${b}`
            }, [
              e.createTextVNode(
                e.toDisplayString(g.$t(e.unref(ee.TIER_LABEL)[b])) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: r.value.tracked.filter((h) => h.tier === b && h.status !== "closed").length
              }, null, 8, ["value"])
            ], 10, D1)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        e.createElementVNode("div", C1, [
          e.createElementVNode("table", w1, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("标题")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("严重程度")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("负责人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("整改期限")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  T1,
                  e.toDisplayString(g.$t("超期天数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("升级")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.tracked, (b) => (e.openBlock(), e.createElementBlock("tr", {
                  key: b.id,
                  class: e.normalizeClass({ bad: b.tier >= 2, warn: b.tier === 1 }),
                  "data-test": `fau-ia-track-${b.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: b.id
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    K1,
                    e.toDisplayString(b.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(g.$t(e.unref(ee.SEVERITY_LABEL)[b.severity])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(b.owner),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: b.dueDate
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(g.$t(e.unref(ee.TRACK_STATUS_LABEL)[b.status])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", A1, [
                    e.createVNode(l, {
                      value: b.overdueDays || ""
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(g.$t(e.unref(ee.TIER_LABEL)[b.tier])),
                    1
                    /* TEXT */
                  )
                ], 10, L1))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", F1, [
        v[4] || (v[4] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(a.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), P1 = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-ea-panel"
}, O1 = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-ea-support"
}, z1 = { class: "grow" }, M1 = { class: "fau-row" }, j1 = { class: "ss-muted" }, R1 = ["disabled"], q1 = ["disabled"], U1 = { class: "fau-counts" }, W1 = ["open"], Y1 = { class: "fau-table-wrap" }, G1 = { class: "fau-table" }, H1 = { class: "wrap" }, Q1 = {
  key: 0,
  class: "fau-table-wrap",
  "data-test": "fau-ea-adjustments"
}, J1 = { class: "fau-table" }, Z1 = { class: "num" }, X1 = { class: "num" }, x1 = { class: "num" }, ek = { class: "num" }, tk = ["data-test"], lk = { class: "wrap" }, nk = { class: "num" }, ak = { class: "num" }, ok = { class: "num" }, sk = { class: "num" }, rk = { key: 0 }, ik = { colspan: "2" }, ck = { class: "num" }, dk = { class: "num" }, uk = { class: "num" }, mk = { class: "num" }, pk = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-ea-confirmations"
}, yk = { class: "grow" }, Nk = {
  key: 0,
  class: "fau-badge"
}, Vk = {
  key: 0,
  class: "fau-badge warn",
  "data-test": "fau-ea-send-locked"
}, Ek = ["disabled"], kk = { class: "ss-note info" }, vk = { class: "fau-table-wrap" }, gk = { class: "fau-table" }, fk = { class: "num" }, hk = { class: "num" }, $k = { class: "num" }, _k = ["data-test"], Bk = { class: "num" }, bk = { class: "num" }, Sk = { class: "num" }, Dk = ["data-test"], Ck = {
  key: 0,
  class: "fau-badge ok"
}, wk = { class: "wrap" }, Tk = {
  class: "fau-modal",
  role: "dialog",
  "aria-modal": "true"
}, Lk = { class: "ss-note warn" }, Kk = {
  key: 0,
  class: "ss-muted"
}, Ak = { class: "fau-list" }, Fk = ["data-test"], Ik = { class: "grow" }, Pk = { class: "ss-muted" }, Ok = {
  key: 1,
  class: "fau-esc"
}, zk = { class: "ss-actions" }, Mk = ["disabled"], jk = {
  key: 3,
  class: "ss-note ok",
  "data-test": "fau-ea-sent"
}, Rk = {
  key: 4,
  class: "ss-note danger"
}, qk = /* @__PURE__ */ e.defineComponent({
  __name: "ExtAuditPanel",
  props: {
    run: {},
    def: {}
  },
  emits: ["changed"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = e.computed(() => t.run.result), n = e.computed(() => !["signing", "archived", "void"].includes(t.run.status)), i = e.ref(!1), a = e.ref(""), m = e.ref(""), E = e.ref((r.value?.materiality || 0) / 100), u = e.ref(null), L = e.ref([]), g = e.computed(() => new Set(L.value.filter((p) => p.ok).map((p) => p.id))), v = s.listSeparator(), b = ["provided", "requested", "overdue"], h = { draft: "muted", sent: "warn", replied_match: "ok", replied_diff: "bad", no_reply: "bad" };
    async function K(p) {
      i.value = !0, a.value = "";
      try {
        await p();
      } catch (f) {
        a.value = Q.errorMessage(f);
      } finally {
        i.value = !1;
      }
    }
    const T = (p) => K(async () => {
      await Y("audit.params.set", { runId: t.run.id, moduleId: "ext-audit", params: p }), N("changed");
    }), z = async () => {
      r.value?.mode === "confirm_prepare" && (L.value = await Y("ext-audit.confirm.sentLog", { runId: t.run.id }));
    }, S = () => K(async () => {
      u.value = await Y("ext-audit.confirm.prepareSend", { runId: t.run.id });
    }), w = () => K(async () => {
      const p = u.value;
      if (!p) return;
      const f = await Y("ext-audit.confirm.send", { runId: t.run.id, token: p.token });
      u.value = null, m.value = s.t("已发送 {n} 份，失败 {m} 份", { n: f.filter((y) => y.ok).length, m: f.filter((y) => !y.ok).length }), await z(), N("changed");
    });
    return e.onMounted(() => {
      z().catch(() => {
      });
    }), (p, f) => r.value ? (e.openBlock(), e.createElementBlock("div", P1, [
      r.value.mode === "support" ? (e.openBlock(), e.createElementBlock("section", O1, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            z1,
            e.toDisplayString(p.$t("资料清单与审计调整")),
            1
            /* TEXT */
          ),
          e.createElementVNode("label", M1, [
            e.createElementVNode(
              "span",
              j1,
              e.toDisplayString(p.$t("重要性水平")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": f[0] || (f[0] = (y) => E.value = y),
              type: "number",
              min: "0",
              disabled: !n.value,
              "data-test": "fau-ea-materiality"
            }, null, 8, R1), [
              [
                e.vModelText,
                E.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: i.value || !n.value,
            onClick: f[1] || (f[1] = (y) => T({ materiality: Number(E.value) || 0 }))
          }, e.toDisplayString(p.$t("按重要性水平重算")), 9, q1)
        ]),
        e.createElementVNode("div", U1, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(b, (y) => e.createElementVNode(
              "span",
              {
                key: y,
                class: e.normalizeClass(["fau-badge", y === "provided" ? "ok" : y === "overdue" ? "bad" : "muted"])
              },
              [
                e.createTextVNode(
                  e.toDisplayString(p.$t(e.unref(ee.PBC_STATUS_LABEL)[y])) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: (r.value.pbc || []).filter((I) => I.status === y).length
                }, null, 8, ["value"])
              ],
              2
              /* CLASS */
            )),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        e.createElementVNode("details", {
          open: !!r.value.pbc?.length
        }, [
          e.createElementVNode(
            "summary",
            null,
            e.toDisplayString(p.$t("PBC 进度")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", Y1, [
            e.createElementVNode("table", G1, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(p.$t("编号")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(p.$t("资料名称")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(p.$t("负责人")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(p.$t("截止日期")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(p.$t("状态")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(r.value.pbc || [], (y) => (e.openBlock(), e.createElementBlock(
                    "tr",
                    {
                      key: y.id,
                      class: e.normalizeClass({ bad: y.status === "overdue" })
                    },
                    [
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: y.id
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode(
                        "td",
                        H1,
                        e.toDisplayString(y.item),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(y.owner),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: y.dueDate
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(p.$t(e.unref(ee.PBC_STATUS_LABEL)[y.status])),
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
              ])
            ])
          ])
        ], 8, W1),
        r.value.adjustments?.length ? (e.openBlock(), e.createElementBlock("div", Q1, [
          e.createElementVNode("table", J1, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(p.$t("凭证号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(p.$t("摘要")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Z1,
                  e.toDisplayString(p.$t("利润影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  X1,
                  e.toDisplayString(p.$t("资产影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  x1,
                  e.toDisplayString(p.$t("负债影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ek,
                  e.toDisplayString(p.$t("权益影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(p.$t("超过重要性水平")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.adjustments, (y) => (e.openBlock(), e.createElementBlock("tr", {
                  key: y.voucherNo,
                  class: e.normalizeClass({ bad: y.exceedsMateriality || !y.balanced }),
                  "data-test": `fau-ea-adj-${y.voucherNo}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: y.voucherNo
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    lk,
                    e.toDisplayString(y.summary),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", nk, [
                    e.createVNode(l, {
                      cents: y.profitImpact
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ak, [
                    e.createVNode(l, {
                      cents: y.assetImpact
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ok, [
                    e.createVNode(l, {
                      cents: y.liabilityImpact
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", sk, [
                    e.createVNode(l, {
                      cents: y.equityImpact
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(y.exceedsMateriality ? p.$t("是") : ""),
                    1
                    /* TEXT */
                  )
                ], 10, tk))),
                128
                /* KEYED_FRAGMENT */
              )),
              r.value.adjustmentTotals ? (e.openBlock(), e.createElementBlock("tr", rk, [
                e.createElementVNode("td", ik, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(p.$t("合计")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("td", ck, [
                  e.createElementVNode("strong", null, [
                    e.createVNode(l, {
                      cents: r.value.adjustmentTotals.profit
                    }, null, 8, ["cents"])
                  ])
                ]),
                e.createElementVNode("td", dk, [
                  e.createVNode(l, {
                    cents: r.value.adjustmentTotals.assets
                  }, null, 8, ["cents"])
                ]),
                e.createElementVNode("td", uk, [
                  e.createVNode(l, {
                    cents: r.value.adjustmentTotals.liabilities
                  }, null, 8, ["cents"])
                ]),
                e.createElementVNode("td", mk, [
                  e.createVNode(l, {
                    cents: r.value.adjustmentTotals.equity
                  }, null, 8, ["cents"])
                ]),
                f[4] || (f[4] = e.createElementVNode(
                  "td",
                  null,
                  null,
                  -1
                  /* CACHED */
                ))
              ])) : e.createCommentVNode("v-if", !0)
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      r.value.confirmations ? (e.openBlock(), e.createElementBlock("section", pk, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            yk,
            e.toDisplayString(p.$t("函证控制表")),
            1
            /* TEXT */
          ),
          r.value.responseRate !== null && r.value.responseRate !== void 0 ? (e.openBlock(), e.createElementBlock("span", Nk, [
            e.createTextVNode(
              e.toDisplayString(p.$t("回函率")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              ratio: r.value.responseRate
            }, null, 8, ["ratio"])
          ])) : e.createCommentVNode("v-if", !0),
          r.value.mode === "confirm_prepare" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 1 },
            [
              c.run.status !== "archived" ? (e.openBlock(), e.createElementBlock(
                "span",
                Vk,
                e.toDisplayString(p.$t("签核归档后才能发送")),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn sm primary",
                disabled: i.value,
                "data-test": "fau-ea-send",
                onClick: S
              }, [
                f[5] || (f[5] = e.createElementVNode(
                  "i",
                  { class: "ri-mail-send-line fau-dir-icon" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(p.$t("发送函证")),
                  1
                  /* TEXT */
                )
              ], 8, Ek))
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("p", kk, [
          f[6] || (f[6] = e.createElementVNode(
            "i",
            { class: "ri-shield-check-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(p.$t("函证只生成草稿，不会自动发送；签核归档后由人点「发送」并在确认框确认")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", vk, [
          e.createElementVNode("table", gk, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(p.$t("函证编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(p.$t("类型")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(p.$t("函证对象")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(p.$t("邮箱")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  fk,
                  e.toDisplayString(p.$t("账面金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  hk,
                  e.toDisplayString(p.$t("回函金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  $k,
                  e.toDisplayString(p.$t("差额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(p.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(p.$t("替代程序")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.confirmations, (y) => (e.openBlock(), e.createElementBlock("tr", {
                  key: y.id,
                  class: e.normalizeClass({ bad: y.status === "replied_diff" || y.status === "no_reply" }),
                  "data-test": `fau-conf-${y.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: y.id
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(p.$t(e.unref(ee.CONFIRM_TYPE_LABEL)[y.type])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(y.party),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: y.email
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Bk, [
                    e.createVNode(l, {
                      cents: y.bookAmount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", bk, [
                    e.createVNode(l, {
                      cents: y.replyAmount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Sk, [
                    e.createVNode(l, {
                      cents: y.diff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("span", {
                      class: e.normalizeClass(["fau-badge", h[y.status]]),
                      "data-test": `fau-conf-status-${y.id}`
                    }, e.toDisplayString(p.$t(e.unref(ee.CONFIRM_STATUS_LABEL)[y.status])), 11, Dk),
                    g.value.has(y.id) ? (e.openBlock(), e.createElementBlock(
                      "span",
                      Ck,
                      e.toDisplayString(p.$t("已发送")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode(
                    "td",
                    wk,
                    e.toDisplayString(y.alternative.map((I) => p.$t(I)).join(e.unref(v))),
                    1
                    /* TEXT */
                  )
                ], 10, _k))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      u.value ? (e.openBlock(), e.createElementBlock("div", {
        key: 2,
        class: "fau-modal-mask",
        "data-test": "fau-ea-confirm-dialog",
        onClick: f[3] || (f[3] = e.withModifiers((y) => u.value = null, ["self"]))
      }, [
        e.createElementVNode("div", Tk, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(p.$t("确认发送函证")),
            1
            /* TEXT */
          ),
          e.createElementVNode("p", Lk, [
            f[7] || (f[7] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(p.$t("以下函证将以邮件发给对方，附件是签核归档时的询证函副本。发出后不能撤回。")),
              1
              /* TEXT */
            )
          ]),
          u.value.via === "official" ? (e.openBlock(), e.createElementBlock(
            "p",
            Kk,
            e.toDisplayString(p.$t("你没有配置自己的发信邮箱，将由官方代发；对方回信不会直接到你的邮箱")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("ul", Ak, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(u.value.items, (y) => (e.openBlock(), e.createElementBlock("li", {
                key: y.id,
                "data-test": `fau-ea-send-item-${y.id}`
              }, [
                e.createVNode(l, {
                  value: y.id
                }, null, 8, ["value"]),
                e.createElementVNode("span", Ik, [
                  e.createTextVNode(
                    e.toDisplayString(y.party) + " · ",
                    1
                    /* TEXT */
                  ),
                  e.createVNode(l, {
                    value: y.email
                  }, null, 8, ["value"])
                ]),
                e.createElementVNode(
                  "small",
                  Pk,
                  e.toDisplayString(y.attachment),
                  1
                  /* TEXT */
                )
              ], 8, Fk))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          u.value.blocked.length ? (e.openBlock(), e.createElementBlock("ul", Ok, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(u.value.blocked, (y, I) => (e.openBlock(), e.createElementBlock("li", { key: I }, [
                f[8] || (f[8] = e.createElementVNode(
                  "i",
                  { class: "ri-forbid-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(e.unref(Z)(y)),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", zk, [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: i.value || !u.value.items.length,
              "data-test": "fau-ea-send-confirm",
              onClick: w
            }, e.toDisplayString(p.$t("确认发送 {n} 份", { n: u.value.items.length })), 9, Mk),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-btn ghost",
                onClick: f[2] || (f[2] = (y) => u.value = null)
              },
              e.toDisplayString(p.$t("取消")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      m.value ? (e.openBlock(), e.createElementBlock("p", jk, [
        f[9] || (f[9] = e.createElementVNode(
          "i",
          { class: "ri-mail-check-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(m.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", Rk, [
        f[10] || (f[10] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(a.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Uk = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-review-panel"
}, Wk = { class: "fau-sec" }, Yk = { class: "grow" }, Gk = {
  key: 0,
  class: "fau-esc"
}, Hk = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-review-trial"
}, Qk = { class: "grow" }, Jk = { class: "fau-list" }, Zk = ["data-test"], Xk = { class: "grow" }, xk = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-review-xls"
}, ev = { class: "grow" }, tv = {
  key: 0,
  class: "ss-muted"
}, lv = {
  key: 1,
  class: "fau-table-wrap"
}, nv = { class: "fau-table" }, av = ["data-test"], ov = { key: 2 }, sv = { class: "fau-list" }, rv = { class: "grow" }, iv = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-review-nav"
}, cv = { class: "grow" }, dv = { class: "fau-table-wrap" }, uv = { class: "fau-table" }, mv = { class: "num" }, pv = { class: "num" }, yv = { class: "num" }, Nv = ["data-test"], Vv = { class: "num" }, Ev = { class: "num" }, kv = { class: "num" }, vv = ["data-test"], gv = /* @__PURE__ */ e.defineComponent({
  __name: "ReviewPanel",
  props: {
    run: {},
    def: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result);
    return (N, r) => t.value ? (e.openBlock(), e.createElementBlock("div", Uk, [
      e.createElementVNode("section", Wk, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            Yk,
            e.toDisplayString(N.$t("放行建议")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", t.value.recommendation === "release" ? "ok" : "bad"]),
              "data-test": "fau-review-decision"
            },
            e.toDisplayString(t.value.recommendation === "release" ? N.$t("建议放行") : N.$t("建议暂扣")),
            3
            /* TEXT, CLASS */
          )
        ]),
        t.value.reasons.length ? (e.openBlock(), e.createElementBlock("ul", Gk, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.reasons, (n, i) => (e.openBlock(), e.createElementBlock("li", { key: i }, [
              r[0] || (r[0] = e.createElementVNode(
                "i",
                { class: "ri-alarm-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(e.unref(Z)(n)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      t.value.trial ? (e.openBlock(), e.createElementBlock("section", Hk, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            Qk,
            e.toDisplayString(N.$t("报表勾稽")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("ul", Jk, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.trial.checks, (n) => (e.openBlock(), e.createElementBlock("li", {
              key: n.id,
              "data-test": `fau-review-tie-${n.id}`
            }, [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(n.ok ? "fau-true" : "fau-false")
                },
                e.toDisplayString(n.ok ? "TRUE" : "FALSE"),
                3
                /* TEXT, CLASS */
              ),
              e.createElementVNode(
                "span",
                Xk,
                e.toDisplayString(e.unref(Z)(n.message)),
                1
                /* TEXT */
              )
            ], 8, Zk))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.xls ? (e.openBlock(), e.createElementBlock("section", xk, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            ev,
            e.toDisplayString(N.$t("底稿质检")),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.files || [], (n) => (e.openBlock(), e.createElementBlock("span", {
              key: n.file,
              class: "fau-badge muted"
            }, [
              e.createTextVNode(
                e.toDisplayString(n.file) + " · ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: n.findings
              }, null, 8, ["value"])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        t.value.xls.length ? (e.openBlock(), e.createElementBlock("div", lv, [
          e.createElementVNode("table", nv, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("文件")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("单元格")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("规则")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("严重程度")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("公式")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.xls, (n) => (e.openBlock(), e.createElementBlock("tr", {
                  key: `${n.file}:${n.id}`,
                  class: e.normalizeClass({ bad: n.severity === "critical" }),
                  "data-test": `fau-xls-${n.rule}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(n.file),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: `${n.sheet}!${n.cell}`
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(N.$t(e.unref(ee.XLS_RULE_LABEL)[n.rule])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(N.$t(e.unref(ee.QC_SEVERITY_LABEL)[n.severity])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: n.formula ? `=${n.formula}` : n.detail || ""
                    }, null, 8, ["value"])
                  ])
                ], 10, av))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          tv,
          e.toDisplayString(N.$t("没有发现问题")),
          1
          /* TEXT */
        )),
        t.value.crossRefs?.length ? (e.openBlock(), e.createElementBlock("details", ov, [
          e.createElementVNode("summary", null, [
            e.createTextVNode(
              e.toDisplayString(N.$t("交叉索引")) + " · ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: t.value.crossRefs.filter((n) => !n.found).length
            }, null, 8, ["value"]),
            r[1] || (r[1] = e.createTextVNode(
              " / ",
              -1
              /* CACHED */
            )),
            e.createVNode(l, {
              value: t.value.crossRefs.length
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("ul", sv, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(t.value.crossRefs, (n) => (e.openBlock(), e.createElementBlock("li", {
                key: `${n.file}:${n.ref}`
              }, [
                e.createVNode(l, {
                  value: n.ref
                }, null, 8, ["value"]),
                e.createElementVNode(
                  "span",
                  rv,
                  e.toDisplayString(n.file),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["fau-badge", n.found ? "ok" : "bad"])
                  },
                  e.toDisplayString(n.found ? N.$t("已找到") : N.$t("断链")),
                  3
                  /* TEXT, CLASS */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      t.value.nav ? (e.openBlock(), e.createElementBlock("section", iv, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            cv,
            e.toDisplayString(N.$t("LP 资本账户重算")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", t.value.nav.navTies ? "ok" : "bad"])
            },
            e.toDisplayString(N.$t("LP 期末资本合计 = 基金净值")),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode("div", dv, [
          e.createElementVNode("table", uv, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("LP 编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("行项目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  mv,
                  e.toDisplayString(N.$t("对账单金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  pv,
                  e.toDisplayString(N.$t("重算金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  yv,
                  e.toDisplayString(N.$t("差额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(N.$t("放行建议")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.nav.lps, (n) => (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  {
                    key: n.lpId
                  },
                  [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(n.lines, (i) => (e.openBlock(), e.createElementBlock("tr", {
                        key: `${n.lpId}:${i.line}`,
                        class: e.normalizeClass({ bad: !i.ok }),
                        "data-test": `fau-nav-${n.lpId}-${i.line}`
                      }, [
                        e.createElementVNode("td", null, [
                          e.createVNode(l, {
                            value: n.lpId
                          }, null, 8, ["value"])
                        ]),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(N.$t(e.unref(ee.NAV_LINE_LABEL)[i.line])),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", Vv, [
                          e.createVNode(l, {
                            cents: i.statement
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", Ev, [
                          e.createVNode(l, {
                            cents: i.recomputed
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", kv, [
                          e.createVNode(l, {
                            cents: i.diff
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode("span", {
                            class: e.normalizeClass(["fau-badge", n.decision === "release" ? "ok" : "bad"]),
                            "data-test": `fau-nav-decision-${n.lpId}`
                          }, e.toDisplayString(n.decision === "release" ? N.$t("建议放行") : N.$t("建议暂扣")), 11, vv)
                        ])
                      ], 10, Nv))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), fv = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-fraud-panel"
}, hv = {
  class: "fau-sec",
  "data-test": "fau-fraud-benford"
}, $v = { class: "grow" }, _v = { class: "fau-badge muted" }, Bv = { class: "fau-table-wrap" }, bv = { class: "fau-table" }, Sv = {
  class: "fau-sec",
  "data-test": "fau-fraud-hits"
}, Dv = { class: "grow" }, Cv = ["data-test"], wv = { class: "fau-list" }, Tv = { class: "grow" }, Lv = {
  key: 0,
  class: "ss-muted"
}, Kv = {
  key: 1,
  class: "fau-table-wrap"
}, Av = { class: "fau-table" }, Fv = { class: "num" }, Iv = { class: "num" }, Pv = { class: "wrap" }, Ov = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-fraud-plan"
}, zv = { class: "grow" }, Mv = {
  key: 0,
  class: "fau-badge bad"
}, jv = { class: "wrap" }, Rv = { class: "fau-steps-list" }, qv = {
  key: 0,
  class: "fau-badge bad"
}, Uv = /* @__PURE__ */ e.defineComponent({
  __name: "FraudPanel",
  props: {
    run: {},
    def: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result), N = { high: s.i18nKey("高"), warn: s.i18nKey("中"), info: s.i18nKey("低") }, r = { close: "ok", acceptable: "ok", marginal: "warn", nonconformity: "bad", insufficient: "muted" };
    return (n, i) => t.value ? (e.openBlock(), e.createElementBlock("div", fv, [
      e.createElementVNode("section", hv, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            $v,
            e.toDisplayString(n.$t("本福特检验")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", r[t.value.benford.conformity]]),
              "data-test": "fau-benford-conformity"
            },
            e.toDisplayString(n.$t(e.unref(ee.BENFORD_LABEL)[t.value.benford.conformity])),
            3
            /* TEXT, CLASS */
          ),
          e.createElementVNode("span", _v, [
            i[0] || (i[0] = e.createTextVNode(
              "n ",
              -1
              /* CACHED */
            )),
            e.createVNode(l, {
              value: t.value.benford.n
            }, null, 8, ["value"]),
            i[1] || (i[1] = e.createTextVNode(
              " · MAD ",
              -1
              /* CACHED */
            )),
            e.createVNode(l, {
              value: t.value.benford.mad.toFixed(4)
            }, null, 8, ["value"])
          ])
        ]),
        e.createElementVNode("div", Bv, [
          e.createElementVNode("table", bv, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("首位数字")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(9, (a) => e.createElementVNode("th", {
                    key: a,
                    class: "num"
                  }, [
                    e.createVNode(l, { value: a }, null, 8, ["value"])
                  ])),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])
            ]),
            e.createElementVNode("tbody", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(n.$t("实际占比")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(t.value.benford.observed, (a, m) => (e.openBlock(), e.createElementBlock(
                    "td",
                    {
                      key: m,
                      class: e.normalizeClass(["num", { bad: t.value.benford.spikes.includes(m + 1) }])
                    },
                    [
                      e.createVNode(l, { ratio: a }, null, 8, ["ratio"])
                    ],
                    2
                    /* CLASS */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(n.$t("期望占比")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(t.value.benford.expected, (a, m) => (e.openBlock(), e.createElementBlock("td", {
                    key: m,
                    class: "num"
                  }, [
                    e.createVNode(l, { ratio: a }, null, 8, ["ratio"])
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", Sv, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            Dv,
            e.toDisplayString(n.$t("异常清单")),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.coverage.filter((a) => a.hits > 0), (a) => (e.openBlock(), e.createElementBlock("span", {
              key: a.rule,
              class: "fau-badge warn",
              "data-test": `fau-fraud-rule-${a.rule}`
            }, [
              e.createTextVNode(
                e.toDisplayString(n.$t(e.unref(ee.FRAUD_RULE_LABEL)[a.rule] || a.rule)) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: a.hits
              }, null, 8, ["value"])
            ], 8, Cv))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        e.createElementVNode("details", null, [
          e.createElementVNode(
            "summary",
            null,
            e.toDisplayString(n.$t("规则覆盖")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", wv, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(t.value.coverage, (a) => (e.openBlock(), e.createElementBlock("li", {
                key: a.rule
              }, [
                e.createElementVNode(
                  "span",
                  Tv,
                  e.toDisplayString(n.$t(e.unref(ee.FRAUD_RULE_LABEL)[a.rule] || a.rule)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["fau-badge", a.status === "ran" ? "ok" : "muted"])
                  },
                  e.toDisplayString(a.status === "ran" ? n.$t("已执行") : n.$t("不适用")),
                  3
                  /* TEXT, CLASS */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        t.value.hits.length ? (e.openBlock(), e.createElementBlock("div", Kv, [
          e.createElementVNode("table", Av, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("规则")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("风险")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("单号 / 对象")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Fv,
                  e.toDisplayString(n.$t("金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("说明")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.hits, (a) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: a.id,
                    class: e.normalizeClass({ bad: a.level === "high", warn: a.level === "warn" })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.$t(e.unref(ee.FRAUD_RULE_LABEL)[a.rule] || a.rule)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.$t(N[a.level])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: a.refs.join(", ")
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", Iv, [
                      e.createVNode(l, {
                        cents: a.amount
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode(
                      "td",
                      Pv,
                      e.toDisplayString(a.detail),
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
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Lv,
          e.toDisplayString(n.$t("没有异常")),
          1
          /* TEXT */
        ))
      ]),
      t.value.plan.length || t.value.summary ? (e.openBlock(), e.createElementBlock("section", Ov, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            zv,
            e.toDisplayString(n.$t("调查计划（草稿，须批准立项）")),
            1
            /* TEXT */
          ),
          t.value.summaryStatus === "unverified" ? (e.openBlock(), e.createElementBlock(
            "span",
            Mv,
            e.toDisplayString(n.$t("摘要未核实")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode(
          "p",
          jv,
          e.toDisplayString(t.value.summary),
          1
          /* TEXT */
        ),
        e.createElementVNode("ol", Rv, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.plan, (a) => (e.openBlock(), e.createElementBlock("li", {
              key: a.id
            }, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(a.objective),
                1
                /* TEXT */
              ),
              e.createTextVNode(
                " — " + e.toDisplayString(a.procedure) + " ",
                1
                /* TEXT */
              ),
              a.verified ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "span",
                qv,
                e.toDisplayString(n.$t("未核实")),
                1
                /* TEXT */
              ))
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Wv = /* @__PURE__ */ ae(Uv, [["__scopeId", "data-v-b140dd4d"]]), Yv = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-kyc-panel"
}, Gv = { class: "fau-sec" }, Hv = { class: "grow" }, Qv = ["data-disposition"], Jv = { class: "ss-note info" }, Zv = {
  key: 0,
  class: "fau-esc"
}, Xv = {
  class: "fau-sec",
  "data-test": "fau-kyc-record"
}, xv = { class: "grow" }, eg = { class: "fau-badge muted" }, tg = { class: "fau-kv" }, lg = {
  key: 0,
  class: "fau-quote"
}, ng = {
  key: 0,
  class: "ss-note warn"
}, ag = {
  key: 1,
  class: "fau-list"
}, og = { class: "grow" }, sg = {
  class: "fau-sec",
  "data-test": "fau-kyc-rules"
}, rg = { class: "grow" }, ig = { class: "fau-table-wrap" }, cg = { class: "fau-table" }, dg = ["data-test"], ug = { class: "wrap" }, mg = { class: "wrap" }, pg = {
  key: 0,
  class: "fau-table-wrap",
  "data-test": "fau-kyc-hits"
}, yg = { class: "fau-table" }, Ng = { class: "num" }, Vg = { class: "num" }, Eg = /* @__PURE__ */ e.defineComponent({
  __name: "KycPanel",
  props: {
    run: {},
    def: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result), N = { clear: "ok", "request-docs": "warn", "escalate-EDD": "bad", "decline-recommend": "bad" }, r = [
      { key: "legalName", label: s.i18nKey("名称") },
      { key: "dobOrFormation", label: s.i18nKey("出生 / 成立日期") },
      { key: "jurisdiction", label: s.i18nKey("国籍 / 注册地") },
      { key: "address", label: s.i18nKey("地址") },
      { key: "sourceOfFunds", label: s.i18nKey("资金来源") }
    ];
    return (n, i) => t.value ? (e.openBlock(), e.createElementBlock("div", Yv, [
      e.createElementVNode("section", Gv, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            Hv,
            e.toDisplayString(n.$t("处置建议")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", {
            class: e.normalizeClass(["fau-badge", N[t.value.disposition]]),
            "data-test": "fau-kyc-disposition",
            "data-disposition": t.value.disposition
          }, e.toDisplayString(n.$t(e.unref(ee.KYC_DISPOSITION_LABEL)[t.value.disposition])), 11, Qv),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", t.value.rating === "high" ? "bad" : t.value.rating === "medium" ? "warn" : "ok"])
            },
            e.toDisplayString(n.$t("风险等级")) + " · " + e.toDisplayString(n.$t(e.unref(ee.IMPACT_LABEL)[t.value.rating])),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode("p", Jv, [
          i[0] || (i[0] = e.createElementVNode(
            "i",
            { class: "ri-shield-user-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("处置建议只是建议，从不批准；由合规官决定")),
            1
            /* TEXT */
          )
        ]),
        t.value.missingDocs.length ? (e.openBlock(), e.createElementBlock("ul", Zv, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.missingDocs, (a) => (e.openBlock(), e.createElementBlock("li", { key: a }, [
              i[1] || (i[1] = e.createElementVNode(
                "i",
                { class: "ri-file-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("缺少的文件")) + ": " + e.toDisplayString(a),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("section", Xv, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            xv,
            e.toDisplayString(n.$t("主体档案")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            eg,
            e.toDisplayString(n.$t(e.unref(ee.APPLICANT_LABEL)[t.value.record.applicantType])),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("dl", tg, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(r, (a) => (e.openBlock(), e.createElementBlock(
              e.Fragment,
              {
                key: a.key
              },
              [
                e.createElementVNode(
                  "dt",
                  null,
                  e.toDisplayString(n.$t(a.label)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("dd", null, [
                  e.createElementVNode(
                    "bdi",
                    null,
                    e.toDisplayString(t.value.record[a.key]?.value || "-"),
                    1
                    /* TEXT */
                  ),
                  t.value.record[a.key] ? (e.openBlock(), e.createElementBlock(
                    "small",
                    lg,
                    " · " + e.toDisplayString(t.value.record[a.key]?.docName),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            ))),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        t.value.record.dropped.length ? (e.openBlock(), e.createElementBlock("p", ng, [
          i[2] || (i[2] = e.createElementVNode(
            "i",
            { class: "ri-eraser-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("原文定位不到、已丢弃的字段：{p0}", { p0: t.value.record.dropped.join(", ") })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        t.value.record.beneficialOwners.length ? (e.openBlock(), e.createElementBlock("ul", ag, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.record.beneficialOwners, (a, m) => (e.openBlock(), e.createElementBlock("li", { key: m }, [
              e.createElementVNode("span", og, [
                e.createElementVNode(
                  "bdi",
                  null,
                  e.toDisplayString(a.name.value),
                  1
                  /* TEXT */
                )
              ]),
              e.createVNode(l, {
                value: a.nationality
              }, null, 8, ["value"]),
              i[3] || (i[3] = e.createTextVNode(
                " · ",
                -1
                /* CACHED */
              )),
              e.createVNode(l, {
                value: a.pct ?? "-"
              }, null, 8, ["value"])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("section", sg, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            rg,
            e.toDisplayString(n.$t("规则结论")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ig, [
          e.createElementVNode("table", cg, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("规则编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("规则")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("结论")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("依据")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.outcomes, (a) => (e.openBlock(), e.createElementBlock("tr", {
                  key: a.ruleId,
                  class: e.normalizeClass({ bad: a.outcome === "fail" && a.effect !== "risk" }),
                  "data-test": `fau-kyc-rule-${a.ruleId}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: a.ruleId
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    ug,
                    e.toDisplayString(a.builtin ? n.$t(a.text) : a.text),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.outcome === "fail" ? n.$t("规则已触发") : a.outcome === "pass" ? n.$t("规则未触发") : n.$t("不适用")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", mg, [
                    e.createElementVNode(
                      "bdi",
                      null,
                      e.toDisplayString(a.evidence),
                      1
                      /* TEXT */
                    )
                  ])
                ], 10, dg))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        t.value.hits.length ? (e.openBlock(), e.createElementBlock("div", pg, [
          e.createElementVNode("table", yg, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("被筛查对象")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("名单")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("名单条目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ng,
                  e.toDisplayString(n.$t("相似度")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("强度")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.hits, (a, m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: m,
                  class: "bad"
                }, [
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "bdi",
                      null,
                      e.toDisplayString(a.subject),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.listName),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "bdi",
                      null,
                      e.toDisplayString(a.entry),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", Vg, [
                    e.createVNode(l, {
                      value: a.score
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(a.strength === "strong" ? n.$t("强命中") : n.$t("疑似命中")),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), kg = {
  icfr: GE,
  "internal-audit": I1,
  "ext-audit": qk,
  review: gv,
  fraud: Wv,
  kyc: Eg
}, vg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PANELS: kg
}, Symbol.toStringTag, { value: "Module" })), Ke = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/financeAudit/capital/specs.ts"];
if (!Ke) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/financeAudit/capital/specs.ts");
Ke.default;
const gg = ["money", "pct", "x", "num", "int", "years", "months", "bp"], fe = (c) => gg.includes(c);
function be(c, _) {
  if (c == null || c === "") return "-";
  if (typeof c == "object") return Z(c);
  if (typeof c != "number") return _ === "text" || _ === "select" || _ === "date" ? c : s.t(c);
  if (!Number.isFinite(c)) return "-";
  const t = (N) => new Intl.NumberFormat(we(), N).format(c);
  switch (_) {
    case "pct":
      return new Intl.NumberFormat(we(), { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(c);
    case "money":
      return t({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case "x":
      return `${t({ minimumFractionDigits: 1, maximumFractionDigits: 2 })}x`;
    case "bp":
      return `${t({ maximumFractionDigits: 1 })} bp`;
    case "int":
      return t({ maximumFractionDigits: 0 });
    default:
      return t({ maximumFractionDigits: 4 });
  }
}
function Oe(c) {
  return Z(Ke.sourceTag(c));
}
function ct(c, _) {
  return c == null ? "" : String(typeof c == "number" && _ === "pct" ? Math.round(c * 1e8) / 1e6 : c);
}
function dt(c, _) {
  const t = c.trim();
  if (!t) return null;
  if (!fe(_)) return t;
  const N = Number(t.replace(/[٠-٩]/g, (r) => String("٠١٢٣٤٥٦٧٨٩".indexOf(r))).replace(/[,\s%]/g, "").replace("٫", "."));
  return Number.isFinite(N) ? _ === "pct" ? N / 100 : N : null;
}
const fg = {
  key: 0,
  class: "cap-in",
  "data-test": "cap-input"
}, hg = { class: "fau-row" }, $g = { class: "grow" }, _g = {
  key: 0,
  class: "fau-badge muted",
  "data-test": "cap-command"
}, Bg = { class: "ss-note info" }, bg = {
  key: 0,
  class: "fau-row cap-conn",
  "data-test": "cap-connectors"
}, Sg = { class: "ss-muted" }, Dg = ["title", "data-test"], Cg = {
  key: 1,
  class: "cap-grid"
}, wg = ["data-test"], Tg = { class: "cap-label" }, Lg = { key: 0 }, Kg = { class: "cap-control" }, Ag = ["value", "disabled", "onChange"], Fg = { value: "" }, Ig = ["value"], Pg = ["type", "inputmode", "value", "disabled", "onChange"], Og = {
  key: 2,
  class: "ss-muted"
}, zg = { class: "cap-src" }, Mg = ["value", "disabled", "aria-label", "onChange"], jg = ["value"], Rg = ["placeholder", "value", "disabled", "onChange"], qg = ["data-test"], Ug = { class: "fau-row" }, Wg = { class: "grow" }, Yg = { class: "ss-muted" }, Gg = ["data-test", "onClick"], Hg = ["onClick"], Qg = { class: "ss-muted cap-help" }, Jg = { class: "ss-actions" }, Zg = ["disabled", "data-test"], Xg = ["disabled"], xg = { class: "fau-table-wrap" }, ef = { class: "fau-table" }, tf = { key: 1 }, lf = ["data-test"], nf = ["value", "disabled", "onChange"], af = ["value"], of = ["type", "value", "disabled", "onChange"], sf = { class: "cap-src" }, rf = {
  key: 0,
  class: "ss-muted"
}, cf = ["value", "disabled", "aria-label", "onChange"], df = ["value"], uf = ["placeholder", "value", "disabled", "onChange"], mf = ["title", "onClick"], pf = ["data-test", "onClick"], yf = { class: "ss-actions" }, Nf = ["disabled"], Vf = {
  key: 1,
  class: "ss-muted"
}, Ef = {
  key: 2,
  class: "fau-badge ok"
}, kf = {
  key: 2,
  class: "ss-note danger",
  "data-test": "cap-error"
}, vf = /* @__PURE__ */ e.defineComponent({
  __name: "CapitalInputPanel",
  props: {
    run: {},
    def: {},
    editable: { type: Boolean }
  },
  emits: ["changed"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = ye.useRouter(), n = {
      manual: s.i18nKey("手工录入"),
      public: s.i18nKey("公开数据（填链接）"),
      connector: s.i18nKey("来自授权连接器"),
      default: s.i18nKey("模板默认值（未注明来源）"),
      upload: s.i18nKey("上传文件"),
      handoff: s.i18nKey("上游转交")
    }, i = { needs_auth: s.i18nKey("需授权"), added: s.i18nKey("已添加，待授权"), authorized: s.i18nKey("已授权") }, a = e.computed(() => Ke.capSpec(t.def.id, t.run.modeId)), m = e.computed(() => t.def.quickActions?.find((j) => j.id === t.run.modeId)?.command || ""), E = e.reactive({}), u = e.reactive({}), L = e.ref([]), g = e.ref(null), v = e.ref(!1), b = e.ref(!1), h = e.ref(!1), K = e.ref("");
    function T() {
      const j = t.run.params.cap || (a.value ? Ke.initialInputs(t.def.id, t.run.modeId) : { fields: {}, tables: {} });
      for (const W of Object.keys(E)) delete E[W];
      for (const W of Object.keys(u)) delete u[W];
      for (const [W, U] of Object.entries(j.fields || {})) E[W] = { v: U.v, src: { ...U.src } };
      for (const W of a.value?.tables || []) u[W.id] = (j.tables?.[W.id] || []).map((U) => ({ cells: { ...U.cells }, src: { ...U.src } }));
      v.value = !t.run.params.cap && Object.keys(E).length > 0;
    }
    const z = (j) => E[j]?.src || { kind: "default" }, S = (j) => [...j === "default" ? ["default"] : [], "manual", "public", "connector"];
    function w(j, W) {
      const U = j.unit === "select" ? W || null : dt(W, j.unit);
      U === null ? delete E[j.key] : E[j.key] = { v: U, src: E[j.key] && E[j.key].src.kind !== "default" ? E[j.key].src : { kind: "manual" } }, v.value = !0;
    }
    function p(j, W, U) {
      j.cells[W.key] = W.unit === "select" ? U || null : dt(U, W.unit), (j.src.kind === "upload" || j.src.kind === "default") && (j.src = { kind: "manual" }), v.value = !0;
    }
    function f(j, W) {
      j && (j.src = { kind: W, ...W === "public" && j.src.url ? { url: j.src.url } : {} }, v.value = !0);
    }
    function y(j, W) {
      j && (j.src = { ...j.src, url: W.trim() }, v.value = !0);
    }
    function I(j) {
      (u[j] ||= []).push({ cells: {}, src: { kind: "manual" } }), v.value = !0;
    }
    function B(j, W) {
      u[j]?.splice(W, 1), v.value = !0;
    }
    async function k(j) {
      h.value = !0, K.value = "";
      try {
        await j();
      } catch (W) {
        K.value = Q.errorMessage(W);
      } finally {
        h.value = !1;
      }
    }
    function R() {
      return k(async () => {
        await Y("capital.save", { runId: t.run.id, cap: { fields: E, tables: u } }), v.value = !1, b.value = !0, N("changed");
      });
    }
    function d(j) {
      return k(async () => {
        const W = await Y("capital.pickTable");
        W.paths.length && (g.value = { tableId: j, path: W.paths[0], inspect: null }, await M());
      });
    }
    async function M(j, W) {
      const U = g.value;
      U && await k(async () => {
        U.inspect = await Y("capital.inspectTable", { runId: t.run.id, path: U.path, tableId: U.tableId, mapping: j ?? U.inspect?.mapping, sheet: W ?? U.inspect?.sheetName });
      });
    }
    function V(j) {
      const W = g.value;
      return W?.inspect ? k(async () => {
        v.value && await Y("capital.save", { runId: t.run.id, cap: { fields: E, tables: u } }), await Y("capital.importTable", { runId: t.run.id, path: W.path, tableId: W.tableId, mapping: W.inspect.mapping, sheet: W.inspect.sheetName, append: j }), g.value = null, v.value = !1, N("changed");
      }) : Promise.resolve();
    }
    function te(j) {
      return k(async () => {
        const W = await Y("capital.template", { moduleId: t.def.id, modeId: t.run.modeId, tableId: j });
        await Y("artifact.reveal", { path: W.path });
      });
    }
    return e.watch(() => [t.run.id, t.run.updatedAt], () => {
      v.value || T();
    }), e.onMounted(async () => {
      T();
      try {
        L.value = await Y("capital.connectors", { moduleId: t.def.id });
      } catch {
        L.value = [];
      }
    }), (j, W) => a.value ? (e.openBlock(), e.createElementBlock("section", fg, [
      e.createElementVNode("header", hg, [
        e.createElementVNode("strong", $g, [
          W[6] || (W[6] = e.createElementVNode(
            "i",
            { class: "ri-database-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            " " + e.toDisplayString(j.$t("录入与来源")),
            1
            /* TEXT */
          )
        ]),
        m.value ? (e.openBlock(), e.createElementBlock("span", _g, [
          e.createTextVNode(
            e.toDisplayString(j.$t("对应命令")) + " ",
            1
            /* TEXT */
          ),
          e.createVNode(l, { value: m.value }, null, 8, ["value"])
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("p", Bg, [
        W[7] || (W[7] = e.createElementVNode(
          "i",
          { class: "ri-shield-check-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(j.$t("付费数据源默认关闭、标「需授权」；没有授权时用上传、公开数据或手工录入，每个数字都带来源，没有来源的产出里标 [未注明来源]。")),
          1
          /* TEXT */
        )
      ]),
      L.value.length ? (e.openBlock(), e.createElementBlock("div", bg, [
        e.createElementVNode(
          "span",
          Sg,
          e.toDisplayString(j.$t("可选的授权数据源")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(L.value, (U) => (e.openBlock(), e.createElementBlock("span", {
            key: U.id,
            class: e.normalizeClass(["fau-badge", U.status === "authorized" ? "ok" : "muted"]),
            title: U.fallback ? j.$t(U.fallback) : "",
            "data-test": `cap-conn-${U.id}`
          }, e.toDisplayString(j.$t(U.name)) + " · " + e.toDisplayString(j.$t(i[U.status])), 11, Dg))),
          128
          /* KEYED_FRAGMENT */
        )),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: W[0] || (W[0] = (U) => e.unref(r).push({ path: "/agents", query: { tab: "connectors" } }))
          },
          e.toDisplayString(j.$t("去连接器设置")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 字段 "),
      a.value.fields.length ? (e.openBlock(), e.createElementBlock("div", Cg, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(a.value.fields, (U) => (e.openBlock(), e.createElementBlock("label", {
            key: U.key,
            class: e.normalizeClass(["cap-field", { need: U.required, unsourced: z(U.key).kind === "default" && E[U.key]?.v != null }]),
            "data-test": `cap-f-${U.key}`
          }, [
            e.createElementVNode("span", Tg, [
              e.createTextVNode(
                e.toDisplayString(j.$t(U.label)),
                1
                /* TEXT */
              ),
              U.required ? (e.openBlock(), e.createElementBlock("em", Lg, "*")) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("span", Kg, [
              U.unit === "select" ? (e.openBlock(), e.createElementBlock("select", {
                key: 0,
                value: E[U.key]?.v ?? "",
                disabled: !c.editable,
                onChange: (H) => w(U, H.target.value)
              }, [
                e.createElementVNode(
                  "option",
                  Fg,
                  e.toDisplayString(j.$t("请选择…")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(U.options || [], (H) => (e.openBlock(), e.createElementBlock("option", {
                    key: H.v,
                    value: H.v
                  }, e.toDisplayString(j.$t(H.label)), 9, Ig))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 40, Ag)) : (e.openBlock(), e.createElementBlock("input", {
                key: 1,
                type: U.unit === "date" ? "date" : "text",
                inputmode: e.unref(fe)(U.unit) ? "decimal" : void 0,
                dir: "auto",
                value: e.unref(ct)(E[U.key]?.v, U.unit),
                disabled: !c.editable,
                onChange: (H) => w(U, H.target.value)
              }, null, 40, Pg)),
              U.unit === "pct" ? (e.openBlock(), e.createElementBlock("small", Og, "%")) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("span", zg, [
              e.createElementVNode("select", {
                value: z(U.key).kind,
                disabled: !c.editable || E[U.key]?.v == null,
                "aria-label": j.$t("来源"),
                onChange: (H) => f(E[U.key], H.target.value)
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(S(z(U.key).kind), (H) => (e.openBlock(), e.createElementBlock("option", {
                    key: H,
                    value: H
                  }, e.toDisplayString(j.$t(n[H])), 9, jg))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 40, Mg),
              z(U.key).kind === "public" ? (e.openBlock(), e.createElementBlock("input", {
                key: 0,
                type: "url",
                dir: "ltr",
                placeholder: j.$t("公开来源链接（https://…）"),
                value: z(U.key).url || "",
                disabled: !c.editable,
                onChange: (H) => y(E[U.key], H.target.value)
              }, null, 40, Rg)) : e.createCommentVNode("v-if", !0)
            ])
          ], 10, wg))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 录入表 "),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(a.value.tables, (U) => (e.openBlock(), e.createElementBlock("div", {
          key: U.id,
          class: "cap-table",
          "data-test": `cap-t-${U.id}`
        }, [
          e.createElementVNode("header", Ug, [
            e.createElementVNode("strong", Wg, [
              e.createTextVNode(
                e.toDisplayString(j.$t(U.label)) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode("small", Yg, [
                e.createTextVNode(
                  e.toDisplayString(j.$t("{n} 行", { n: u[U.id]?.length || 0 })),
                  1
                  /* TEXT */
                ),
                U.minRows ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      " · " + e.toDisplayString(j.$t("至少 {n} 行", { n: U.minRows })),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ])
            ]),
            c.editable ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-btn sm ghost",
              "data-test": `cap-import-${U.id}`,
              onClick: (H) => d(U.id)
            }, [
              W[8] || (W[8] = e.createElementVNode(
                "i",
                { class: "ri-file-upload-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(j.$t("从文件导入")),
                1
                /* TEXT */
              )
            ], 8, Gg)) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm ghost",
              onClick: (H) => te(U.id)
            }, [
              W[9] || (W[9] = e.createElementVNode(
                "i",
                { class: "ri-download-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(j.$t("下载模板")),
                1
                /* TEXT */
              )
            ], 8, Hg)
          ]),
          e.createElementVNode(
            "p",
            Qg,
            e.toDisplayString(j.$t(U.help)),
            1
            /* TEXT */
          ),
          g.value?.tableId === U.id && g.value.inspect ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createVNode(Ze, {
                table: g.value.inspect,
                roles: g.value.inspect.roles.map((H) => ({ ...H, label: j.$t(H.label) })),
                onUpdate: W[1] || (W[1] = (H) => M(H)),
                onSheet: W[2] || (W[2] = (H) => M(void 0, H))
              }, null, 8, ["table", "roles"]),
              e.createElementVNode("div", Jg, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: h.value || g.value.inspect.missing.length > 0,
                  "data-test": `cap-import-confirm-${U.id}`,
                  onClick: W[3] || (W[3] = (H) => V(!1))
                }, [
                  W[10] || (W[10] = e.createElementVNode(
                    "i",
                    { class: "ri-download-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(j.$t("替换为文件里的行")),
                    1
                    /* TEXT */
                  )
                ], 8, Zg),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: h.value || g.value.inspect.missing.length > 0,
                  onClick: W[4] || (W[4] = (H) => V(!0))
                }, e.toDisplayString(j.$t("追加到现有行")), 9, Xg),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-btn ghost sm",
                    onClick: W[5] || (W[5] = (H) => g.value = null)
                  },
                  e.toDisplayString(j.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", xg, [
            e.createElementVNode("table", ef, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(U.columns, (H) => (e.openBlock(), e.createElementBlock(
                      "th",
                      {
                        key: H.key,
                        class: e.normalizeClass({ num: e.unref(fe)(H.unit) })
                      },
                      [
                        e.createTextVNode(
                          e.toDisplayString(j.$t(H.label)),
                          1
                          /* TEXT */
                        ),
                        H.unit === "pct" ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createTextVNode(" (%)")
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0),
                        H.required ? (e.openBlock(), e.createElementBlock("em", tf, "*")) : e.createCommentVNode("v-if", !0)
                      ],
                      2
                      /* CLASS */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(j.$t("来源")),
                    1
                    /* TEXT */
                  ),
                  W[11] || (W[11] = e.createElementVNode(
                    "th",
                    null,
                    null,
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(u[U.id] || [], (H, ce) => (e.openBlock(), e.createElementBlock("tr", {
                    key: ce,
                    "data-test": `cap-row-${U.id}-${ce}`
                  }, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(U.columns, (ne) => (e.openBlock(), e.createElementBlock(
                        "td",
                        {
                          key: ne.key,
                          class: e.normalizeClass({ num: e.unref(fe)(ne.unit) })
                        },
                        [
                          ne.unit === "select" ? (e.openBlock(), e.createElementBlock("select", {
                            key: 0,
                            value: H.cells[ne.key] ?? "",
                            disabled: !c.editable,
                            onChange: (D) => p(H, ne, D.target.value)
                          }, [
                            W[12] || (W[12] = e.createElementVNode(
                              "option",
                              { value: "" },
                              "-",
                              -1
                              /* CACHED */
                            )),
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(ne.options || [], (D) => (e.openBlock(), e.createElementBlock("option", {
                                key: D.v,
                                value: D.v
                              }, e.toDisplayString(j.$t(D.label)), 9, af))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ], 40, nf)) : (e.openBlock(), e.createElementBlock("input", {
                            key: 1,
                            type: ne.unit === "date" ? "date" : "text",
                            dir: "auto",
                            value: e.unref(ct)(H.cells[ne.key], ne.unit),
                            disabled: !c.editable,
                            onChange: (D) => p(H, ne, D.target.value)
                          }, null, 40, of))
                        ],
                        2
                        /* CLASS */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode("td", sf, [
                      H.src.kind === "upload" || H.src.kind === "handoff" ? (e.openBlock(), e.createElementBlock("small", rf, [
                        e.createVNode(l, {
                          value: e.unref(Oe)(H.src)
                        }, null, 8, ["value"])
                      ])) : (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createElementVNode("select", {
                            value: H.src.kind,
                            disabled: !c.editable,
                            "aria-label": j.$t("来源"),
                            onChange: (ne) => f(H, ne.target.value)
                          }, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(S(H.src.kind), (ne) => (e.openBlock(), e.createElementBlock("option", {
                                key: ne,
                                value: ne
                              }, e.toDisplayString(j.$t(n[ne])), 9, df))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ], 40, cf),
                          H.src.kind === "public" ? (e.openBlock(), e.createElementBlock("input", {
                            key: 0,
                            type: "url",
                            dir: "ltr",
                            placeholder: j.$t("公开来源链接（https://…）"),
                            value: H.src.url || "",
                            disabled: !c.editable,
                            onChange: (ne) => y(H, ne.target.value)
                          }, null, 40, uf)) : e.createCommentVNode("v-if", !0)
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode("td", null, [
                      c.editable ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-iconbtn",
                        title: j.$t("删除这一行"),
                        onClick: (ne) => B(U.id, ce)
                      }, [...W[13] || (W[13] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-delete-bin-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, mf)) : e.createCommentVNode("v-if", !0)
                    ])
                  ], 8, lf))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ]),
          c.editable ? (e.openBlock(), e.createElementBlock("button", {
            key: 1,
            type: "button",
            class: "ss-btn sm ghost",
            "data-test": `cap-addrow-${U.id}`,
            onClick: (H) => I(U.id)
          }, [
            W[14] || (W[14] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(j.$t("加一行（手工录入）")),
              1
              /* TEXT */
            )
          ], 8, pf)) : e.createCommentVNode("v-if", !0)
        ], 8, qg))),
        128
        /* KEYED_FRAGMENT */
      )),
      e.createElementVNode("div", yf, [
        c.editable ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn primary",
          disabled: h.value || !v.value,
          "data-test": "cap-save",
          onClick: R
        }, [
          W[15] || (W[15] = e.createElementVNode(
            "i",
            { class: "ri-save-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(j.$t("保存录入")),
            1
            /* TEXT */
          )
        ], 8, Nf)) : e.createCommentVNode("v-if", !0),
        v.value ? (e.openBlock(), e.createElementBlock(
          "span",
          Vf,
          e.toDisplayString(j.$t("有改动还没保存；保存后再开始校验")),
          1
          /* TEXT */
        )) : b.value ? (e.openBlock(), e.createElementBlock(
          "span",
          Ef,
          e.toDisplayString(j.$t("已保存")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      K.value ? (e.openBlock(), e.createElementBlock("p", kf, [
        W[16] || (W[16] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(K.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), gf = /* @__PURE__ */ ae(vf, [["__scopeId", "data-v-0e170a1d"]]), ff = {
  key: 0,
  class: "cap-res",
  "data-test": "cap-result"
}, hf = {
  key: 0,
  class: "ss-note warn",
  "data-test": "cap-degraded"
}, $f = {
  key: 1,
  class: "ss-note danger",
  "data-test": "cap-disclaimer"
}, _f = {
  key: 2,
  class: "cap-sec",
  "data-test": "cap-upstream"
}, Bf = { class: "fau-badge muted" }, bf = {
  key: 3,
  class: "cap-metrics",
  "data-test": "cap-metrics"
}, Sf = ["data-test"], Df = {
  key: 4,
  class: "cap-flags",
  "data-test": "cap-flags"
}, Cf = ["data-test"], wf = ["open", "data-test"], Tf = { class: "ss-muted" }, Lf = { class: "fau-table-wrap" }, Kf = { class: "fau-table" }, Af = {
  key: 5,
  class: "cap-sec",
  "data-test": "cap-narrative"
}, Ff = ["data-test"], If = {
  key: 0,
  class: "fau-badge bad"
}, Pf = {
  key: 1,
  class: "fau-badge warn"
}, Of = {
  key: 2,
  class: "ss-muted"
}, zf = {
  key: 6,
  class: "cap-sec",
  "data-test": "cap-facts"
}, Mf = { class: "fau-table-wrap" }, jf = { class: "fau-table" }, Rf = { class: "wrap" }, qf = {
  key: 0,
  class: "ss-muted"
}, Uf = { class: "cap-sec" }, Wf = { class: "fau-table-wrap" }, Yf = { class: "fau-table" }, Gf = { class: "num" }, Hf = /* @__PURE__ */ e.defineComponent({
  __name: "CapitalResultPanel",
  props: {
    run: {}
  },
  setup(c) {
    const _ = c, t = e.computed(() => _.run.result), N = {
      research: s.i18nKey("仅供内部研究，非投资建议"),
      markets: s.i18nKey("仅供分析参考，非投资建议，不构成交易指令"),
      wealth: s.i18nKey("仅供持牌顾问内部使用，非投资建议，不发给客户，不执行交易")
    }, r = (i) => i.page ? s.t("[上传: {p0} 第 {n} 页]", { p0: i.doc, n: i.page }) : Oe({ kind: "upload", file: i.doc }), n = { high: s.i18nKey("高"), medium: s.i18nKey("中"), low: s.i18nKey("低") };
    return (i, a) => t.value ? (e.openBlock(), e.createElementBlock("div", ff, [
      t.value.degraded.authorized ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", hf, [
        a[0] || (a[0] = e.createElementVNode(
          "i",
          { class: "ri-database-2-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.$t("本结果未使用授权数据源，数据完整度：{p0}", { p0: i.$t(n[t.value.degraded.completeness]) })),
          1
          /* TEXT */
        )
      ])),
      t.value.disclaimer ? (e.openBlock(), e.createElementBlock("p", $f, [
        a[1] || (a[1] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.$t(N[t.value.disclaimer])),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      t.value.upstream.length ? (e.openBlock(), e.createElementBlock("section", _f, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(i.$t("上游转交的估值引用")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.upstream, (m) => (e.openBlock(), e.createElementBlock("div", {
            key: m.runId,
            class: "fau-row"
          }, [
            e.createElementVNode("span", Bf, [
              e.createVNode(l, {
                value: e.unref(Oe)({ kind: "handoff", name: `${m.moduleId}/${m.modeId}` })
              }, null, 8, ["value"])
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(m.metrics.slice(0, 6), (E) => (e.openBlock(), e.createElementBlock("span", {
                key: E.id,
                class: "cap-chip"
              }, [
                e.createTextVNode(
                  e.toDisplayString(i.$t(E.label)) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: e.unref(be)(E.value, E.unit)
                }, null, 8, ["value"])
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      t.value.metrics.length ? (e.openBlock(), e.createElementBlock("section", bf, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.metrics, (m) => (e.openBlock(), e.createElementBlock("div", {
            key: m.id,
            class: e.normalizeClass(["cap-metric", m.flag]),
            "data-test": `cap-m-${m.id}`
          }, [
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(i.$t(m.label)),
              1
              /* TEXT */
            ),
            e.createElementVNode("strong", null, [
              e.createVNode(l, {
                value: e.unref(be)(m.value, m.unit)
              }, null, 8, ["value"])
            ])
          ], 10, Sf))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      t.value.flags.length ? (e.openBlock(), e.createElementBlock("ul", Df, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.flags, (m) => (e.openBlock(), e.createElementBlock("li", {
            key: m.id,
            class: e.normalizeClass(m.level),
            "data-test": `cap-flag-${m.id}`
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(m.level === "warn" ? "ri-alarm-warning-line" : "ri-information-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(e.unref(Z)(m.message)),
              1
              /* TEXT */
            )
          ], 10, Cf))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(t.value.tables, (m) => (e.openBlock(), e.createElementBlock("details", {
          key: m.id,
          class: "cap-sec",
          open: t.value.tables.length <= 2,
          "data-test": `cap-table-${m.id}`
        }, [
          e.createElementVNode("summary", null, [
            e.createTextVNode(
              e.toDisplayString(i.$t(m.title)) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              Tf,
              e.toDisplayString(i.$t("{n} 行", { n: m.rows.length })),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Lf, [
            e.createElementVNode("table", Kf, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(m.columns, (E) => (e.openBlock(), e.createElementBlock(
                      "th",
                      {
                        key: E.key,
                        class: e.normalizeClass({ num: e.unref(fe)(E.unit) })
                      },
                      e.toDisplayString(i.$t(E.label)),
                      3
                      /* TEXT, CLASS */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(m.rows, (E, u) => (e.openBlock(), e.createElementBlock("tr", { key: u }, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(m.columns, (L) => (e.openBlock(), e.createElementBlock(
                        "td",
                        {
                          key: L.key,
                          class: e.normalizeClass({ num: e.unref(fe)(L.unit) })
                        },
                        [
                          e.unref(fe)(L.unit) || L.unit === "date" ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            value: e.unref(be)(E[L.key], L.unit)
                          }, null, 8, ["value"])) : (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 1 },
                            [
                              e.createTextVNode(
                                e.toDisplayString(e.unref(be)(E[L.key], L.unit)),
                                1
                                /* TEXT */
                              )
                            ],
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ],
                        2
                        /* CLASS */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])
        ], 8, wf))),
        128
        /* KEYED_FRAGMENT */
      )),
      t.value.sections?.length ? (e.openBlock(), e.createElementBlock("section", Af, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(i.$t("叙述与回核")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.sections, (m, E) => (e.openBlock(), e.createElementBlock("div", {
            key: E,
            class: "cap-narr"
          }, [
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(m.heading),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(m.paragraphs, (u, L) => (e.openBlock(), e.createElementBlock("p", {
                key: L,
                class: e.normalizeClass({ bad: u.status !== "verified" }),
                "data-test": `cap-p-${E}-${L}`
              }, [
                e.createTextVNode(
                  e.toDisplayString(u.text) + " ",
                  1
                  /* TEXT */
                ),
                u.status !== "verified" ? (e.openBlock(), e.createElementBlock(
                  "span",
                  If,
                  e.toDisplayString(i.$t("[未注明来源]")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                u.advice ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Pf,
                  e.toDisplayString(i.$t("含买卖或配置建议措辞，签核前须删改")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                u.missing?.length ? (e.openBlock(), e.createElementBlock("small", Of, [
                  a[2] || (a[2] = e.createElementVNode(
                    "br",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(i.$t("数据里找不到")) + ": ",
                    1
                    /* TEXT */
                  ),
                  e.createVNode(l, {
                    value: u.missing.join(", ")
                  }, null, 8, ["value"])
                ])) : e.createCommentVNode("v-if", !0)
              ], 10, Ff))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      t.value.facts?.length ? (e.openBlock(), e.createElementBlock("section", zf, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(i.$t("事实与出处")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Mf, [
          e.createElementVNode("table", jf, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("指标 / 事实")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("数值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("来源")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("原文引文")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.facts, (m, E) => (e.openBlock(), e.createElementBlock("tr", { key: E }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(m.label),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.value
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: r(m)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    Rf,
                    e.toDisplayString(m.quote),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        t.value.droppedFacts ? (e.openBlock(), e.createElementBlock(
          "p",
          qf,
          e.toDisplayString(i.$t("模型给出的 {n} 条事实在原文里定位不到，已丢弃", { n: t.value.droppedFacts })),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("details", Uf, [
        e.createElementVNode(
          "summary",
          null,
          e.toDisplayString(i.$t("输入与来源")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Wf, [
          e.createElementVNode("table", Yf, [
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.inputs.fields, (m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: m.key
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(i.$t(m.label)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Gf, [
                    e.createVNode(l, {
                      value: e.unref(be)(m.value, m.unit)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    {
                      class: e.normalizeClass({ "cap-unsourced": m.src.kind === "default" })
                    },
                    [
                      e.createVNode(l, {
                        value: e.unref(Oe)(m.src)
                      }, null, 8, ["value"])
                    ],
                    2
                    /* CLASS */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Qf = /* @__PURE__ */ ae(Hf, [["__scopeId", "data-v-aaad4525"]]), St = ["valuation", "capex", "ma", "ib", "pe", "research", "markets", "wealth"], Jf = Object.fromEntries(St.map((c) => [c, Qf])), Zf = Object.fromEntries(St.map((c) => [c, gf])), Xf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  INPUTS: Zf,
  PANELS: Jf
}, Symbol.toStringTag, { value: "Module" })), Ce = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/editionSnapshot.ts"];
if (!Ce) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/editionSnapshot.ts");
Ce.default;
const xf = {
  class: "fau-panel",
  "data-test": "fau-skill-studio"
}, eh = { class: "ss-muted" }, th = { class: "fau-steps-list" }, lh = { key: 0 }, nh = { key: 1 }, ah = { class: "ss-actions" }, oh = {
  key: 0,
  class: "ss-note info"
}, sh = /* @__PURE__ */ e.defineComponent({
  __name: "SkillStudioPanel",
  setup(c) {
    const _ = ye.useRouter();
    function t() {
      try {
        localStorage.setItem("tc.autocoder.tab", "skill");
      } catch {
      }
      _.push("/solution-studio");
    }
    return (N, r) => (e.openBlock(), e.createElementBlock("section", xf, [
      e.createElementVNode("h3", null, [
        r[1] || (r[1] = e.createElementVNode(
          "i",
          { class: "ri-tools-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(N.$t("把本企业的制度与模板做成技能")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode(
        "p",
        eh,
        e.toDisplayString(N.$t("报销制度、审批口径、底稿模板、科目使用说明……写成技能后，对话、专家团和流程里的 AI 员工遇到对应任务就按它来做。")),
        1
        /* TEXT */
      ),
      e.createElementVNode("ol", th, [
        e.createCommentVNode(" AutoCoder 只按账号开通：没开通的账号这里不提它，改成在对话里做 "),
        e.unref(Ce.autoCoderEnabled)() ? (e.openBlock(), e.createElementBlock(
          "li",
          lh,
          e.toDisplayString(N.$t("在 AutoCoder 的「Skill 开发」里新建一个技能，把制度原文、模板和示例发给 AI。")),
          1
          /* TEXT */
        )) : (e.openBlock(), e.createElementBlock(
          "li",
          nh,
          e.toDisplayString(N.$t("在对话里直接说：「用 fa-skill-creator 把《费用报销制度》做成技能」，再把制度原文、模板和示例发给 AI。")),
          1
          /* TEXT */
        )),
        e.createElementVNode(
          "li",
          null,
          e.toDisplayString(N.$t("AI 按随本方案安装的 fa-skill-creator 的写法整理成技能说明与参考资料；财会口径沿用 fa-conventions、术语沿用 fa-glossary。")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "li",
          null,
          e.toDisplayString(N.$t("检查无误后装到本机；金额仍由工作台规则引擎计算，技能只负责口径与写法。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("div", ah, [
        e.unref(Ce.autoCoderEnabled)() ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn primary",
          "data-test": "fau-skill-new",
          onClick: t
        }, [
          r[2] || (r[2] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(N.$t("去新建技能")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn",
          "data-test": "fau-skill-store",
          onClick: r[0] || (r[0] = (n) => e.unref(_).push("/store/skills"))
        }, [
          r[3] || (r[3] = e.createElementVNode(
            "i",
            { class: "ri-apps-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(N.$t("查看已装技能")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.unref(Ce.autoCoderEnabled)() ? (e.openBlock(), e.createElementBlock("p", oh, [
        r[4] || (r[4] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(N.$t("不想用 AutoCoder 也可以在对话里直接说：「用 fa-skill-creator 把《费用报销制度》做成技能」。")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), rh = /* @__PURE__ */ ae(sh, [["__scopeId", "data-v-f43fc037"]]), ih = { "skill-studio": rh }, ch = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PANELS: ih
}, Symbol.toStringTag, { value: "Module" })), Ue = { ok: o.i18nKey("正常"), watch: o.i18nKey("关注"), breach: o.i18nKey("越线") }, dh = { ok: o.i18nKey("三方一致"), watch: o.i18nKey("轻微差异"), breach: o.i18nKey("差异较大") }, Qe = {
  optimistic: o.i18nKey("乐观"),
  base: o.i18nKey("基准"),
  pessimistic: o.i18nKey("悲观")
};
o.i18nKey("确定"), o.i18nKey("预计"), o.i18nKey("可能");
o.i18nKey("资金计划"), o.i18nKey("应收到期"), o.i18nKey("应付到期");
const uh = { none: o.i18nKey("无缺口"), small: o.i18nKey("小额缺口"), large: o.i18nKey("大额缺口"), severe: o.i18nKey("超大额缺口") }, mh = {
  P0: o.i18nKey("立即支付，不可延后（工资社保、税款、到期贷款、判决）"),
  P1: o.i18nKey("优先支付（紧急供应商、租金水电等固定支出）"),
  P2: o.i18nKey("正常支付（按账期的常规付款）"),
  P3: o.i18nKey("可延后 1–2 周"),
  P4: o.i18nKey("战略延后，与对方协商")
}, ph = { schedule: o.i18nKey("排入计划"), defer: o.i18nKey("延后"), hold: o.i18nKey("暂停核实") }, yh = { given: o.i18nKey("表内指定"), category: o.i18nKey("按类别"), default: o.i18nKey("默认") }, Nh = {
  proceed: o.i18nKey("建议放行（由有权人审批）"),
  request_docs: o.i18nKey("补充资料"),
  hold: o.i18nKey("暂缓"),
  reject_recommend: o.i18nKey("建议拒绝")
}, Vh = { core: o.i18nKey("核心合作银行"), key: o.i18nKey("重点维护银行"), general: o.i18nKey("一般关系银行") };
o.i18nKey("一级优质流动性资产"), o.i18nKey("二级 A 优质流动性资产"), o.i18nKey("二级 B 优质流动性资产"), o.i18nKey("30 天现金流出"), o.i18nKey("30 天现金流入"), o.i18nKey("可用稳定资金"), o.i18nKey("所需稳定资金");
o.i18nKey("外币应收"), o.i18nKey("外币应付"), o.i18nKey("预测外币收入"), o.i18nKey("预测外币支出"), o.i18nKey("外币资产"), o.i18nKey("外币负债"), o.i18nKey("外币计价收入"), o.i18nKey("外币计价成本"), o.i18nKey("已卖出远期"), o.i18nKey("已买入远期");
const Eh = { firm: o.i18nKey("确定敞口"), highly_probable: o.i18nKey("很可能敞口"), possible: o.i18nKey("可能敞口") }, kh = { sell: o.i18nKey("卖出外币"), buy: o.i18nKey("买入外币") }, vh = {
  debt_to_ebitda: o.i18nKey("有息负债 / EBITDA"),
  interest_cover: o.i18nKey("利息保障倍数"),
  current_ratio: o.i18nKey("流动比率"),
  debt_ratio: o.i18nKey("资产负债率"),
  dscr: o.i18nKey("偿债覆盖率"),
  net_worth: o.i18nKey("净资产")
}, gh = { le: "≤", ge: "≥" };
o.i18nKey("1 年内"), o.i18nKey("1–2 年"), o.i18nKey("2–3 年"), o.i18nKey("3–5 年"), o.i18nKey("5 年以上");
o.i18nKey("银行贷款"), o.i18nKey("债券"), o.i18nKey("融资租赁"), o.i18nKey("其它");
const fh = {
  dpd90: o.i18nKey("逾期 90 天以上"),
  default_rating: o.i18nKey("评级为违约"),
  impaired: o.i18nKey("已发生信用减值"),
  dpd30: o.i18nKey("逾期 30 天以上"),
  downgrade: o.i18nKey("评级下调 2 级以上"),
  watchlist: o.i18nKey("进入关注名单"),
  ig_to_sub: o.i18nKey("投资级降为投机级")
}, Fe = { 0: o.i18nKey("本期新增"), 1: o.i18nKey("第一阶段"), 2: o.i18nKey("第二阶段"), 3: o.i18nKey("第三阶段") }, hh = {
  current: o.i18nKey("未到期"),
  d30: o.i18nKey("逾期 1–30 天"),
  d60: o.i18nKey("逾期 31–60 天"),
  d90: o.i18nKey("逾期 61–90 天"),
  d180: o.i18nKey("逾期 91–180 天"),
  d365: o.i18nKey("逾期 181–365 天"),
  d365plus: o.i18nKey("逾期 365 天以上")
}, ut = { active: o.i18nKey("正常周转"), slow: o.i18nKey("呆滞"), obsolete: o.i18nKey("过时") }, $h = {
  reverse_factoring: o.i18nKey("反向保理（供应商融资）"),
  receivables_factoring: o.i18nKey("应收账款保理"),
  dynamic_discounting: o.i18nKey("动态折扣（提前付款换折扣）"),
  inventory_finance: o.i18nKey("存货融资")
}, _h = {
  deposit: o.i18nKey("存款"),
  money_fund: o.i18nKey("货币基金"),
  wmp: o.i18nKey("银行理财"),
  bond: o.i18nKey("债券"),
  equity: o.i18nKey("股票"),
  fund: o.i18nKey("基金"),
  other: o.i18nKey("其它")
};
o.i18nKey("30 天内"), o.i18nKey("31–90 天"), o.i18nKey("91–180 天"), o.i18nKey("181–365 天"), o.i18nKey("1 年以上"), o.i18nKey("无固定期限");
o.i18nKey("现金池结构"), o.i18nKey("归集效益与风险"), o.i18nKey("对冲策略"), o.i18nKey("工具与成本"), o.i18nKey("债务重组选项"), o.i18nKey("风险与前提"), o.i18nKey("组合复盘"), o.i18nKey("流动性评估");
const xe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/core"];
if (!xe) throw new Error("宿主模块未就绪：npm:echarts/core");
xe.default;
const et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/renderers"];
if (!et) throw new Error("宿主模块未就绪：npm:echarts/renderers");
et.default;
const tt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/charts"];
if (!tt) throw new Error("宿主模块未就绪：npm:echarts/charts");
tt.default;
const $e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/components"];
if (!$e) throw new Error("宿主模块未就绪：npm:echarts/components");
$e.default;
const Dt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-echarts"];
if (!Dt) throw new Error("宿主模块未就绪：npm:vue-echarts");
const Bh = Dt.default;
function bh(c) {
  return {
    grid: { top: 36, bottom: 28, containLabel: !0 },
    legend: { data: c.series.map((_) => _.name), top: 0, [c.rtl ? "right" : "left"]: 0, align: c.rtl ? "right" : "left" },
    tooltip: { trigger: "axis", valueFormatter: (_) => c.fmt(_) },
    xAxis: { type: "category", data: c.weeks, inverse: c.rtl, boundaryGap: !1 },
    yAxis: { type: "value", position: c.rtl ? "right" : "left", axisLabel: { formatter: (_) => c.fmt(_) } },
    series: c.series.map((_, t) => ({
      name: _.name,
      type: "line",
      data: _.data,
      smooth: !1,
      symbolSize: 5,
      // 基准情景画 0 线，缺口一眼看出来
      ...t === 1 ? { markLine: { silent: !0, symbol: "none", data: [{ yAxis: 0, name: c.zeroLabel }] } } : {}
    }))
  };
}
const Sh = /* @__PURE__ */ e.defineComponent({
  __name: "CashForecastChart",
  props: {
    forecast: {}
  },
  setup(c) {
    xe.use([et.CanvasRenderer, tt.LineChart, $e.GridComponent, $e.LegendComponent, $e.TooltipComponent, $e.MarkLineComponent]);
    const _ = c, t = e.computed(() => bh({
      weeks: _.forecast.scenarios[1].weeks.map((N) => `W${N.week}`),
      series: _.forecast.scenarios.map((N) => ({ name: s.t(Qe[N.id]), data: N.weeks.map((r) => r.closing / 100) })),
      rtl: pe.currentLocale() === "ar",
      fmt: (N) => Te(Math.round(N * 100)),
      zeroLabel: "0"
    }));
    return (N, r) => (e.openBlock(), e.createBlock(e.unref(Bh), {
      class: "fau-tr-chart",
      option: t.value,
      autoresize: "",
      "data-test": "fau-cash-chart"
    }, null, 8, ["option"]));
  }
}), Dh = /* @__PURE__ */ ae(Sh, [["__scopeId", "data-v-6127b65d"]]), Ch = {
  key: 0,
  class: "fau-tr",
  "data-test": "fau-treasury-panel"
}, wh = {
  key: 0,
  class: "ss-note warn"
}, Th = {
  key: 1,
  class: "ss-note warn"
}, Lh = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-cash-position"
}, Kh = { class: "fau-row" }, Ah = { class: "grow" }, Fh = { class: "fau-badge" }, Ih = { class: "fau-table-wrap" }, Ph = { class: "fau-table" }, Oh = { class: "num" }, zh = { class: "num" }, Mh = { class: "num" }, jh = { class: "num" }, Rh = { class: "num" }, qh = ["data-test"], Uh = { class: "num" }, Wh = { class: "num" }, Yh = { class: "num" }, Gh = { class: "num" }, Hh = {
  key: 0,
  class: "fau-badge bad"
}, Qh = { class: "num" }, Jh = {
  key: 3,
  class: "fau-sec",
  "data-test": "fau-cash-forecast"
}, Zh = { class: "fau-row" }, Xh = { class: "grow" }, xh = {
  key: 0,
  class: "fau-badge muted"
}, e$ = { class: "fau-table-wrap" }, t$ = { class: "fau-table" }, l$ = { class: "num" }, n$ = { class: "num" }, a$ = { class: "num" }, o$ = { class: "num" }, s$ = { class: "num" }, r$ = ["data-test"], i$ = { class: "num" }, c$ = { class: "num" }, d$ = {
  class: "num",
  "data-test": "fau-scenario-end"
}, u$ = { class: "num" }, m$ = { class: "num" }, p$ = {
  key: 0,
  class: "fau-tr-flags"
}, y$ = {
  key: 4,
  class: "fau-sec",
  "data-test": "fau-payment-plan"
}, N$ = { class: "fau-tr-kpis" }, V$ = { class: "fau-badge muted" }, E$ = { class: "fau-badge ok" }, k$ = { class: "fau-badge warn" }, v$ = { class: "fau-badge bad" }, g$ = {
  key: 0,
  class: "fau-badge bad"
}, f$ = { class: "fau-table-wrap" }, h$ = { class: "fau-table" }, $$ = { class: "num" }, _$ = ["data-test"], B$ = { class: "num" }, b$ = ["title"], S$ = { class: "ss-muted" }, D$ = { class: "wrap" }, C$ = {
  key: 5,
  class: "fau-sec",
  "data-test": "fau-auth"
}, w$ = { class: "fau-table-wrap" }, T$ = { class: "fau-table" }, L$ = { class: "num" }, K$ = ["data-test"], A$ = { class: "num" }, F$ = {
  key: 0,
  class: "fau-badge warn"
}, I$ = { class: "wrap" }, P$ = {
  key: 6,
  class: "fau-sec",
  "data-test": "fau-pool"
}, O$ = { class: "fau-tr-kpis" }, z$ = { class: "fau-badge muted" }, M$ = { class: "fau-badge" }, j$ = { class: "fau-badge" }, R$ = { class: "fau-badge ok" }, q$ = {
  class: "fau-badge ok",
  "data-test": "fau-pool-gain"
}, U$ = { class: "fau-table-wrap" }, W$ = { class: "fau-table" }, Y$ = { class: "num" }, G$ = { class: "num" }, H$ = { class: "num" }, Q$ = { class: "num" }, J$ = { class: "num" }, Z$ = { class: "num" }, X$ = {
  key: 7,
  class: "fau-sec",
  "data-test": "fau-banks"
}, x$ = { class: "fau-table-wrap" }, e_ = { class: "fau-table" }, t_ = { class: "num" }, l_ = { class: "num" }, n_ = { class: "num" }, a_ = ["data-test"], o_ = { class: "num" }, s_ = { class: "num" }, r_ = { class: "num" }, i_ = { class: "wrap" }, c_ = {
  key: 8,
  class: "fau-sec",
  "data-test": "fau-lcr"
}, d_ = { class: "fau-tr-kpis" }, u_ = { class: "fau-badge muted" }, m_ = { class: "fau-badge muted" }, p_ = {
  class: "fau-sec",
  "data-test": "fau-fx"
}, y_ = { class: "fau-table-wrap" }, N_ = { class: "fau-table" }, V_ = { class: "num" }, E_ = { class: "num" }, k_ = { class: "num" }, v_ = { class: "num" }, g_ = { class: "num" }, f_ = { class: "num" }, h_ = { class: "num" }, $_ = ["data-test"], __ = { class: "num" }, B_ = { class: "num" }, b_ = { class: "num" }, S_ = { class: "num" }, D_ = { class: "num" }, C_ = { class: "num" }, w_ = { class: "num" }, T_ = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-rfq"
}, L_ = { class: "fau-table-wrap" }, K_ = { class: "fau-table" }, A_ = { class: "num" }, F_ = ["data-test"], I_ = { class: "num" }, P_ = {
  key: 10,
  class: "fau-sec",
  "data-test": "fau-fin-cost"
}, O_ = { class: "fau-tr-kpis" }, z_ = { class: "fau-badge muted" }, M_ = { class: "fau-badge" }, j_ = { class: "fau-badge" }, R_ = {
  class: "fau-badge ok",
  "data-test": "fau-wacc"
}, q_ = ["disabled"], U_ = ["disabled"], W_ = ["disabled"], Y_ = ["disabled"], G_ = ["disabled"], H_ = ["disabled"], Q_ = { class: "fau-table-wrap" }, J_ = { class: "fau-table" }, Z_ = { class: "num" }, X_ = { class: "num" }, x_ = { class: "num" }, eB = { class: "num" }, tB = {
  key: 11,
  class: "fau-sec",
  "data-test": "fau-covenants"
}, lB = { class: "fau-table-wrap" }, nB = { class: "fau-table" }, aB = {
  key: 0,
  class: "ss-muted"
}, oB = ["data-test"], sB = { class: "ss-muted" }, rB = {
  class: "fau-sec",
  "data-test": "fau-ecl"
}, iB = { class: "fau-tr-kpis" }, cB = { class: "fau-badge muted" }, dB = {
  class: "fau-badge",
  "data-test": "fau-ecl-total"
}, uB = { class: "fau-badge muted" }, mB = {
  key: 0,
  class: "fau-table-wrap"
}, pB = { class: "fau-table" }, yB = { class: "num" }, NB = { class: "num" }, VB = { class: "num" }, EB = { class: "num" }, kB = ["data-test"], vB = { class: "num" }, gB = { class: "num" }, fB = { class: "num" }, hB = { class: "num" }, $B = {
  key: 1,
  class: "fau-table-wrap"
}, _B = { class: "fau-table" }, BB = { class: "num" }, bB = { class: "num" }, SB = { class: "num" }, DB = { class: "num" }, CB = {
  key: 2,
  class: "fau-table-wrap"
}, wB = { class: "fau-table" }, TB = { class: "num" }, LB = { class: "num" }, KB = { class: "num" }, AB = ["data-test"], FB = { class: "num" }, IB = { class: "num" }, PB = { class: "num" }, OB = {
  key: 0,
  class: "fau-sec"
}, zB = { class: "fau-table-wrap" }, MB = { class: "fau-table" }, jB = { class: "num" }, RB = { class: "num" }, qB = { class: "num" }, UB = { class: "wrap" }, WB = { class: "num" }, YB = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-ccc"
}, GB = { class: "fau-tr-kpis" }, HB = { class: "fau-badge" }, QB = { class: "fau-badge" }, JB = { class: "fau-badge" }, ZB = {
  class: "fau-badge ok",
  "data-test": "fau-ccc-value"
}, XB = { class: "fau-badge muted" }, xB = { class: "fau-badge warn" }, eb = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-inventory"
}, tb = { class: "fau-tr-kpis" }, lb = { class: "fau-badge warn" }, nb = { class: "fau-badge bad" }, ab = {
  class: "fau-badge ok",
  "data-test": "fau-inv-release"
}, ob = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-suppliers"
}, sb = { class: "fau-table-wrap" }, rb = { class: "fau-table" }, ib = { class: "num" }, cb = { class: "num" }, db = { class: "num" }, ub = { class: "num" }, mb = { class: "num" }, pb = { class: "num" }, yb = { class: "num" }, Nb = { class: "num" }, Vb = {
  key: 3,
  class: "fau-sec",
  "data-test": "fau-scf"
}, Eb = { class: "fau-table-wrap" }, kb = { class: "fau-table" }, vb = { class: "num" }, gb = { class: "num" }, fb = { class: "num" }, hb = { class: "num" }, $b = { class: "num" }, _b = { class: "num" }, Bb = {
  key: 14,
  class: "fau-sec",
  "data-test": "fau-portfolio"
}, bb = { class: "fau-tr-kpis" }, Sb = { class: "fau-badge muted" }, Db = { class: "fau-badge muted" }, Cb = { class: "fau-table-wrap" }, wb = { class: "fau-table" }, Tb = { class: "num" }, Lb = { class: "num" }, Kb = { class: "num" }, Ab = { class: "num" }, Fb = { class: "wrap" }, Ib = {
  key: 15,
  class: "fau-sec",
  "data-test": "fau-liquidity"
}, Pb = { class: "fau-tr-kpis" }, Ob = { class: "fau-badge ok" }, zb = { class: "fau-badge muted" }, Mb = {
  key: 16,
  class: "fau-sec",
  "data-test": "fau-narrative"
}, jb = {
  key: 17,
  class: "ss-note danger"
}, Rb = /* @__PURE__ */ e.defineComponent({
  __name: "TreasuryPanel",
  props: {
    run: {},
    def: {}
  },
  emits: ["changed"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = s.listSeparator(), n = e.ref(!1), i = e.ref(""), a = e.computed(() => t.run.result), m = e.computed(() => t.def.id === "cash" ? a.value : null), E = e.computed(() => t.def.id === "treasury" ? a.value : null), u = e.computed(() => t.def.id === "fx" ? a.value : null), L = e.computed(() => t.def.id === "financing" ? a.value : null), g = e.computed(() => t.def.id === "ifrs9" ? a.value : null), v = e.computed(() => t.def.id === "working-capital" ? a.value : null), b = e.computed(() => t.def.id === "investments" ? a.value : null), h = e.computed(() => m.value?.position || E.value?.position || null), K = e.computed(() => m.value?.forecast || E.value?.forecast || null), T = e.computed(() => m.value?.payments || null), z = e.computed(() => a.value?.narrative || []), S = e.computed(() => ["signing", "archived", "void"].includes(t.run.status)), w = { ok: "ok", watch: "warn", breach: "bad" }, p = { proceed: "ok", request_docs: "warn", hold: "bad", reject_recommend: "bad" }, f = (d) => d == null ? "-" : d.toFixed(1), y = (d) => d == null ? "-" : d.toFixed(2), I = (d) => Te(d), B = (d, M) => M == null ? "-" : d === "net_worth" ? Te(M) : M.toFixed(2), k = e.reactive({ rf: "", beta: "", erp: "", taxRate: "", equity: "" });
    e.watch(() => L.value?.cost, (d) => {
      if (!d) return;
      const M = (V) => String(Math.round(V * 1e4) / 100);
      Object.assign(k, { rf: M(d.rf), beta: String(d.beta), erp: M(d.erp), taxRate: M(d.taxRate), equity: String(Math.round(d.equity) / 100) });
    }, { immediate: !0 });
    async function R() {
      n.value = !0, i.value = "";
      try {
        await Y("financing.params.update", { runId: t.run.id, ...k }), N("changed");
      } catch (d) {
        i.value = Q.errorMessage(d);
      } finally {
        n.value = !1;
      }
    }
    return (d, M) => a.value ? (e.openBlock(), e.createElementBlock("div", Ch, [
      c.def.id === "cash" && c.run.modeId === "payment" || c.def.id === "treasury" && c.run.modeId === "authorization" ? (e.openBlock(), e.createElementBlock("p", wh, [
        M[5] || (M[5] = e.createElementVNode(
          "i",
          { class: "ri-shield-check-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(d.$t("付款计划与授权意见只是草稿和建议：本工作台不付款、不审批付款，付款由有权人在网银或资金系统里完成。")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      c.def.id === "fx" ? (e.openBlock(), e.createElementBlock("p", Th, [
        M[6] || (M[6] = e.createElementVNode(
          "i",
          { class: "ri-shield-check-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(d.$t("对冲方案与询价单只是草稿：本工作台不下单、不成交、不确认交易，是否交易由有权人在银行渠道完成。")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 资金日报：三方核对 "),
      h.value ? (e.openBlock(), e.createElementBlock("section", Lh, [
        e.createElementVNode("header", Kh, [
          e.createElementVNode("strong", Ah, [
            e.createTextVNode(
              e.toDisplayString(d.$t("资金日报")) + " · ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: h.value.asOf
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("span", Fh, [
            e.createTextVNode(
              e.toDisplayString(d.$t("本位币可用余额")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: h.value.totals.available
            }, null, 8, ["cents"])
          ])
        ]),
        e.createElementVNode("div", Ih, [
          e.createElementVNode("table", Ph, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("银行账号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("开户银行")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("币种")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Oh,
                  e.toDisplayString(d.$t("银行余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  zh,
                  e.toDisplayString(d.$t("账面余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Mh,
                  e.toDisplayString(d.$t("资金系统余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  jh,
                  e.toDisplayString(d.$t("最大差额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("三方核对")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Rh,
                  e.toDisplayString(d.$t("可用余额")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(h.value.accounts, (V) => (e.openBlock(), e.createElementBlock("tr", {
                  key: V.row,
                  class: e.normalizeClass({ bad: V.status === "breach" || V.belowSafety }),
                  "data-test": `fau-acct-${V.account}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: V.account
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(V.bank),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: V.currency
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Uh, [
                    e.createVNode(l, {
                      cents: V.bankBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Wh, [
                    e.createVNode(l, {
                      cents: V.bookBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Yh, [
                    e.createVNode(l, {
                      cents: V.systemBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Gh, [
                    e.createVNode(l, {
                      cents: V.maxDiff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["fau-badge", w[V.status]])
                      },
                      e.toDisplayString(V.sources < 2 ? d.$t("来源不足，未核对") : d.$t(e.unref(dh)[V.status])),
                      3
                      /* TEXT, CLASS */
                    ),
                    V.belowSafety ? (e.openBlock(), e.createElementBlock(
                      "span",
                      Hh,
                      e.toDisplayString(d.$t("低于安全线")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("td", Qh, [
                    e.createVNode(l, {
                      cents: V.available
                    }, null, 8, ["cents"])
                  ])
                ], 10, qh))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 13 周预测 "),
      K.value ? (e.openBlock(), e.createElementBlock("section", Jh, [
        e.createElementVNode("header", Zh, [
          e.createElementVNode(
            "strong",
            Xh,
            e.toDisplayString(d.$t("13 周现金预测")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", K.value.gapTier === "none" ? "ok" : "warn"])
            },
            e.toDisplayString(d.$t(e.unref(uh)[K.value.gapTier])),
            3
            /* TEXT, CLASS */
          ),
          K.value.facilityAvailable != null ? (e.openBlock(), e.createElementBlock("span", xh, [
            e.createTextVNode(
              e.toDisplayString(d.$t("可用授信")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: K.value.facilityAvailable
            }, null, 8, ["cents"])
          ])) : e.createCommentVNode("v-if", !0)
        ]),
        e.createVNode(Dh, { forecast: K.value }, null, 8, ["forecast"]),
        e.createElementVNode("div", e$, [
          e.createElementVNode("table", t$, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("情景")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  l$,
                  e.toDisplayString(d.$t("合计流入")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  n$,
                  e.toDisplayString(d.$t("合计流出")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  a$,
                  e.toDisplayString(d.$t("期末余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  o$,
                  e.toDisplayString(d.$t("最低余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("首个缺口周")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  s$,
                  e.toDisplayString(d.$t("最大缺口")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(K.value.scenarios, (V) => (e.openBlock(), e.createElementBlock("tr", {
                  key: V.id,
                  class: e.normalizeClass({ bad: V.maxGap > 0 }),
                  "data-test": `fau-scenario-${V.id}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.$t(e.unref(Qe)[V.id])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", i$, [
                    e.createVNode(l, {
                      cents: V.totalIn
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", c$, [
                    e.createVNode(l, {
                      cents: V.totalOut
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", d$, [
                    e.createVNode(l, {
                      cents: V.endBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", u$, [
                    e.createVNode(l, {
                      cents: V.minBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: V.firstGapWeek ? `W${V.firstGapWeek}` : "-"
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", m$, [
                    e.createVNode(l, {
                      cents: V.maxGap
                    }, null, 8, ["cents"])
                  ])
                ], 10, r$))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        K.value.concentration.some((V) => V.status !== "ok") ? (e.openBlock(), e.createElementBlock("ul", p$, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(K.value.concentration.filter((V) => V.status !== "ok"), (V) => (e.openBlock(), e.createElementBlock("li", {
              key: V.counterparty
            }, [
              M[7] || (M[7] = e.createElementVNode(
                "i",
                { class: "ri-alarm-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(V.counterparty) + " · ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                ratio: V.share
              }, null, 8, ["ratio"]),
              e.createTextVNode(
                " · " + e.toDisplayString(d.$t(e.unref(Ue)[V.status])),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 付款计划草稿 "),
      T.value ? (e.openBlock(), e.createElementBlock("section", y$, [
        e.createElementVNode("div", N$, [
          e.createElementVNode("span", V$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("可用资金")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: T.value.available
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", E$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("排入计划")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: T.value.scheduled
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", k$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("延后")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: T.value.deferred
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", v$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("暂停核实")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: T.value.held
            }, null, 8, ["cents"])
          ]),
          T.value.gap ? (e.openBlock(), e.createElementBlock("span", g$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("P0 资金缺口")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: T.value.gap
            }, null, 8, ["cents"])
          ])) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("div", f$, [
          e.createElementVNode("table", h$, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("申请单号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("收款方")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  $$,
                  e.toDisplayString(d.$t("付款金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("到期日")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("优先级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("计划")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(T.value.lines, (V) => (e.openBlock(), e.createElementBlock("tr", {
                  key: V.id,
                  class: e.normalizeClass({ bad: V.plan === "hold", warn: V.plan === "defer" }),
                  "data-test": `fau-pay-${V.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: V.id
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(V.payee),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", B$, [
                    e.createVNode(l, {
                      cents: V.amount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: V.dueDate
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", {
                    title: d.$t(e.unref(mh)[V.priority])
                  }, [
                    e.createVNode(l, {
                      value: V.priority
                    }, null, 8, ["value"]),
                    M[8] || (M[8] = e.createTextVNode()),
                    e.createElementVNode(
                      "small",
                      S$,
                      e.toDisplayString(d.$t(e.unref(yh)[V.prioritySource])),
                      1
                      /* TEXT */
                    )
                  ], 8, b$),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.$t(e.unref(ph)[V.plan])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    D$,
                    e.toDisplayString(V.flags.map((te) => e.unref(Z)(te)).join(e.unref(r))),
                    1
                    /* TEXT */
                  )
                ], 10, _$))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 授权复核 "),
      E.value?.authorizations ? (e.openBlock(), e.createElementBlock("section", C$, [
        e.createElementVNode("div", w$, [
          e.createElementVNode("table", T$, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("申请单号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("收款方")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  L$,
                  e.toDisplayString(d.$t("付款金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("复核建议")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("问题")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(E.value.authorizations, (V) => (e.openBlock(), e.createElementBlock("tr", {
                  key: V.id,
                  class: e.normalizeClass({ bad: V.advice === "hold" || V.advice === "reject_recommend" }),
                  "data-test": `fau-auth-${V.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: V.id
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(V.payee),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", A$, [
                    e.createVNode(l, {
                      cents: V.amount
                    }, null, 8, ["cents"]),
                    V.large ? (e.openBlock(), e.createElementBlock(
                      "span",
                      F$,
                      e.toDisplayString(d.$t("大额")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["fau-badge", p[V.advice]])
                      },
                      e.toDisplayString(d.$t(e.unref(Nh)[V.advice])),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode(
                    "td",
                    I$,
                    e.toDisplayString(V.checks.filter((te) => !te.ok).map((te) => e.unref(Z)(te.message)).join(e.unref(r))),
                    1
                    /* TEXT */
                  )
                ], 10, K$))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 现金池 "),
      E.value?.pool ? (e.openBlock(), e.createElementBlock("section", P$, [
        e.createElementVNode("div", O$, [
          e.createElementVNode("span", z$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("主账户")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: E.value.pool.header
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("span", M$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("上划合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: E.value.pool.sweepUp
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", j$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("下拨合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: E.value.pool.sweepDown
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", R$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("归集后可调度资金")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: E.value.pool.pooled
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", q$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("年化利息增益估算")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: E.value.pool.interestGain
            }, null, 8, ["cents"])
          ])
        ]),
        e.createElementVNode("div", U$, [
          e.createElementVNode("table", W$, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("银行账号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("主体")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Y$,
                  e.toDisplayString(d.$t("余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  G$,
                  e.toDisplayString(d.$t("留存目标")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  H$,
                  e.toDisplayString(d.$t("上划 / 下拨")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(E.value.pool.accounts, (V) => (e.openBlock(), e.createElementBlock("tr", {
                  key: V.account
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: V.account
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(V.entity),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Q$, [
                    e.createVNode(l, {
                      cents: V.balance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", J$, [
                    e.createVNode(l, {
                      cents: V.target
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Z$, [
                    e.createVNode(l, {
                      cents: V.sweep
                    }, null, 8, ["cents"])
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 银行关系 "),
      E.value?.banks ? (e.openBlock(), e.createElementBlock("section", X$, [
        e.createElementVNode("div", x$, [
          e.createElementVNode("table", e_, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("银行")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  t_,
                  e.toDisplayString(d.$t("授信使用率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  l_,
                  e.toDisplayString(d.$t("利率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  n_,
                  e.toDisplayString(d.$t("综合评分")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("分级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(E.value.banks, (V) => (e.openBlock(), e.createElementBlock("tr", {
                  key: V.bank,
                  "data-test": `fau-bank-score-${V.bank}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(V.bank),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", o_, [
                    e.createVNode(l, {
                      ratio: V.utilization
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", s_, [
                    e.createVNode(l, {
                      ratio: V.rate
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", r_, [
                    e.createVNode(l, {
                      value: V.total.toFixed(2)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.$t(e.unref(Vh)[V.tier])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    i_,
                    e.toDisplayString(V.flags.map((te) => e.unref(Z)(te)).join(e.unref(r))),
                    1
                    /* TEXT */
                  )
                ], 8, a_))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" LCR / NSFR "),
      E.value?.liquidity ? (e.openBlock(), e.createElementBlock("section", c_, [
        e.createElementVNode("div", d_, [
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", w[E.value.liquidity.lcrStatus]]),
              "data-test": "fau-lcr-value"
            },
            [
              M[9] || (M[9] = e.createTextVNode(
                "LCR ",
                -1
                /* CACHED */
              )),
              e.createVNode(l, {
                ratio: E.value.liquidity.lcr
              }, null, 8, ["ratio"])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", w[E.value.liquidity.nsfrStatus]])
            },
            [
              M[10] || (M[10] = e.createTextVNode(
                "NSFR ",
                -1
                /* CACHED */
              )),
              e.createVNode(l, {
                ratio: E.value.liquidity.nsfr
              }, null, 8, ["ratio"])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("span", u_, [
            e.createTextVNode(
              e.toDisplayString(d.$t("优质流动性资产合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: E.value.liquidity.hqla.total
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", m_, [
            e.createTextVNode(
              e.toDisplayString(d.$t("净现金流出")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: E.value.liquidity.netOutflows
            }, null, 8, ["cents"])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 外汇 "),
      u.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 9 },
        [
          e.createElementVNode("section", p_, [
            e.createElementVNode("div", y_, [
              e.createElementVNode("table", N_, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("币种")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      V_,
                      e.toDisplayString(d.$t("交易敞口（外币）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      E_,
                      e.toDisplayString(d.$t("会计敞口（外币）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      k_,
                      e.toDisplayString(d.$t("交易敞口（本位币）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      v_,
                      e.toDisplayString(d.$t("已对冲")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      g_,
                      e.toDisplayString(d.$t("目标对冲额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      f_,
                      e.toDisplayString(d.$t("还需对冲")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      h_,
                      e.toDisplayString(d.$t("已对冲比例")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(u.value.exposures, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: V.currency,
                      class: e.normalizeClass({ bad: V.overLimit }),
                      "data-test": `fau-fx-${V.currency}`
                    }, [
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: V.currency
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", __, [
                        e.createVNode(l, {
                          cents: V.transaction
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", B_, [
                        e.createVNode(l, {
                          cents: V.translation
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", b_, [
                        e.createVNode(l, {
                          cents: V.transactionLocal
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", S_, [
                        e.createVNode(l, {
                          cents: V.hedged
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", D_, [
                        e.createVNode(l, {
                          cents: V.hedgeTarget
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", C_, [
                        e.createVNode(l, {
                          cents: V.hedgeNeed
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", w_, [
                        e.createVNode(l, {
                          ratio: V.hedgeRatio
                        }, null, 8, ["ratio"])
                      ])
                    ], 10, $_))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ]),
          u.value.rfq.length ? (e.openBlock(), e.createElementBlock("section", T_, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(d.$t("询价单草稿")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", L_, [
              e.createElementVNode("table", K_, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("币种")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("方向")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      A_,
                      e.toDisplayString(d.$t("名义本金（外币）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("交割月份")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("覆盖的敞口层级")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(u.value.rfq, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: V.id,
                      "data-test": `fau-rfq-${V.id}`
                    }, [
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: V.currency
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(kh)[V.side])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", I_, [
                        e.createVNode(l, {
                          cents: V.notional
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: V.valueMonth
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Eh)[V.layer])),
                        1
                        /* TEXT */
                      )
                    ], 8, F_))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 融资 "),
      L.value?.cost ? (e.openBlock(), e.createElementBlock("section", P_, [
        e.createElementVNode("div", O_, [
          e.createElementVNode("span", z_, [
            e.createTextVNode(
              e.toDisplayString(d.$t("有息负债合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: L.value.cost.debt
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", M_, [
            e.createTextVNode(
              e.toDisplayString(d.$t("税后债务成本")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              ratio: L.value.cost.kdAfterTax
            }, null, 8, ["ratio"])
          ]),
          e.createElementVNode("span", j_, [
            e.createTextVNode(
              e.toDisplayString(d.$t("股权成本")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              ratio: L.value.cost.ke
            }, null, 8, ["ratio"])
          ]),
          e.createElementVNode("span", R_, [
            M[11] || (M[11] = e.createTextVNode(
              "WACC ",
              -1
              /* CACHED */
            )),
            e.createVNode(l, {
              ratio: L.value.cost.wacc
            }, null, 8, ["ratio"])
          ])
        ]),
        e.createElementVNode(
          "form",
          {
            class: "fau-tr-params",
            onSubmit: e.withModifiers(R, ["prevent"])
          },
          [
            e.createElementVNode("label", null, [
              e.createTextVNode(
                e.toDisplayString(d.$t("无风险利率")) + " (%)",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": M[0] || (M[0] = (V) => k.rf = V),
                type: "number",
                step: "0.01",
                disabled: S.value,
                "data-test": "fau-param-rf"
              }, null, 8, q_), [
                [e.vModelText, k.rf]
              ])
            ]),
            e.createElementVNode("label", null, [
              M[12] || (M[12] = e.createTextVNode(
                "Beta",
                -1
                /* CACHED */
              )),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": M[1] || (M[1] = (V) => k.beta = V),
                type: "number",
                step: "0.01",
                disabled: S.value,
                "data-test": "fau-param-beta"
              }, null, 8, U_), [
                [e.vModelText, k.beta]
              ])
            ]),
            e.createElementVNode("label", null, [
              e.createTextVNode(
                e.toDisplayString(d.$t("市场风险溢价")) + " (%)",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": M[2] || (M[2] = (V) => k.erp = V),
                type: "number",
                step: "0.01",
                disabled: S.value
              }, null, 8, W_), [
                [e.vModelText, k.erp]
              ])
            ]),
            e.createElementVNode("label", null, [
              e.createTextVNode(
                e.toDisplayString(d.$t("所得税率")) + " (%)",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": M[3] || (M[3] = (V) => k.taxRate = V),
                type: "number",
                step: "0.01",
                disabled: S.value
              }, null, 8, Y_), [
                [e.vModelText, k.taxRate]
              ])
            ]),
            e.createElementVNode("label", null, [
              e.createTextVNode(
                e.toDisplayString(d.$t("权益价值")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": M[4] || (M[4] = (V) => k.equity = V),
                type: "number",
                step: "0.01",
                disabled: S.value
              }, null, 8, G_), [
                [e.vModelText, k.equity]
              ])
            ]),
            e.createElementVNode("button", {
              type: "submit",
              class: "ss-btn sm",
              disabled: S.value || n.value,
              "data-test": "fau-param-save"
            }, [
              M[13] || (M[13] = e.createElementVNode(
                "i",
                { class: "ri-refresh-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(d.$t("按新假设重算")),
                1
                /* TEXT */
              )
            ], 8, H_)
          ],
          32
          /* NEED_HYDRATION */
        ),
        e.createElementVNode("div", Q_, [
          e.createElementVNode("table", J_, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("贷款人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Z_,
                  e.toDisplayString(d.$t("本金余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  X_,
                  e.toDisplayString(d.$t("综合成本")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("到期日")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(L.value.cost.loans, (V) => (e.openBlock(), e.createElementBlock("tr", {
                  key: V.id
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(V.lender),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", x_, [
                    e.createVNode(l, {
                      cents: V.principal
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", eB, [
                    e.createVNode(l, {
                      ratio: V.allIn
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: V.maturity
                    }, null, 8, ["value"])
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      L.value?.covenants ? (e.openBlock(), e.createElementBlock("section", tB, [
        e.createElementVNode("div", lB, [
          e.createElementVNode("table", nB, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("贷款人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("条款")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("限值")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(L.value.covenants[0]?.values || [], (V) => (e.openBlock(), e.createElementBlock("th", {
                    key: V.period
                  }, [
                    e.createVNode(l, {
                      value: V.period
                    }, null, 8, ["value"]),
                    V.forecast ? (e.openBlock(), e.createElementBlock(
                      "small",
                      aB,
                      " · " + e.toDisplayString(d.$t("预测")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(L.value.covenants, (V) => (e.openBlock(), e.createElementBlock("tr", {
                  key: V.id,
                  class: e.normalizeClass({ bad: V.current === "breach" }),
                  "data-test": `fau-covenant-${V.id}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(V.lender),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createTextVNode(
                      e.toDisplayString(V.name) + " ",
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      sB,
                      e.toDisplayString(d.$t(e.unref(vh)[V.metric])),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: `${e.unref(gh)[V.op]} ${V.metric === "net_worth" ? I(V.limit) : V.limit}`
                    }, null, 8, ["value"])
                  ]),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(V.values, (te) => (e.openBlock(), e.createElementBlock("td", {
                      key: te.period
                    }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["fau-badge", w[te.status]])
                        },
                        [
                          e.createVNode(l, {
                            value: B(V.metric, te.value)
                          }, null, 8, ["value"]),
                          e.createTextVNode(
                            " · " + e.toDisplayString(d.$t(e.unref(Ue)[te.status])),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ], 10, oB))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" ECL "),
      g.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 12 },
        [
          e.createElementVNode("section", rB, [
            e.createElementVNode("div", iB, [
              e.createElementVNode("span", cB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("违约敞口合计")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: g.value.totalEad
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode("span", dB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("预期信用损失合计")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: g.value.totalEcl
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode("span", uB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("前瞻系数")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: g.value.forwardFactor.toFixed(4)
                }, null, 8, ["value"])
              ]),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(g.value.scenarios, (V) => (e.openBlock(), e.createElementBlock("span", {
                  key: V.id,
                  class: "fau-badge muted"
                }, [
                  e.createTextVNode(
                    e.toDisplayString(d.$t(e.unref(Qe)[V.id] || V.name)) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createVNode(l, {
                    ratio: V.weight
                  }, null, 8, ["ratio"]),
                  M[14] || (M[14] = e.createTextVNode(
                    " × ",
                    -1
                    /* CACHED */
                  )),
                  e.createVNode(l, {
                    value: V.pdMultiplier
                  }, null, 8, ["value"])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            g.value.stages ? (e.openBlock(), e.createElementBlock("div", mB, [
              e.createElementVNode("table", pB, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("阶段")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      yB,
                      e.toDisplayString(d.$t("笔数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      NB,
                      e.toDisplayString(d.$t("违约敞口")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      VB,
                      e.toDisplayString(d.$t("加权 ECL")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      EB,
                      e.toDisplayString(d.$t("覆盖率")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(g.value.stages, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: V.stage,
                      "data-test": `fau-ecl-stage-${V.stage}`
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Fe)[V.stage])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", vB, [
                        e.createVNode(l, {
                          value: V.count
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", gB, [
                        e.createVNode(l, {
                          cents: V.ead
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", fB, [
                        e.createVNode(l, {
                          cents: V.ecl
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", hB, [
                        e.createVNode(l, {
                          ratio: V.coverage
                        }, null, 8, ["ratio"])
                      ])
                    ], 8, kB))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            g.value.migration ? (e.openBlock(), e.createElementBlock("div", $B, [
              e.createElementVNode("table", _B, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("上期阶段")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("本期阶段")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      BB,
                      e.toDisplayString(d.$t("笔数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      bB,
                      e.toDisplayString(d.$t("违约敞口")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(g.value.migration, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: `${V.from}-${V.to}`
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Fe)[V.from])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Fe)[V.to])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", SB, [
                        e.createVNode(l, {
                          value: V.count
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", DB, [
                        e.createVNode(l, {
                          cents: V.ead
                        }, null, 8, ["cents"])
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            g.value.matrix ? (e.openBlock(), e.createElementBlock("div", CB, [
              e.createElementVNode("table", wB, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("账龄区间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      TB,
                      e.toDisplayString(d.$t("应收余额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      LB,
                      e.toDisplayString(d.$t("损失率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      KB,
                      e.toDisplayString(d.$t("预期信用损失")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(g.value.matrix, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: V.bucket,
                      "data-test": `fau-ecl-bucket-${V.bucket}`
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(hh)[V.bucket])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", FB, [
                        e.createVNode(l, {
                          cents: V.amount
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", IB, [
                        e.createVNode(l, {
                          ratio: V.rate
                        }, null, 8, ["ratio"])
                      ]),
                      e.createElementVNode("td", PB, [
                        e.createVNode(l, {
                          cents: V.ecl
                        }, null, 8, ["cents"])
                      ])
                    ], 8, AB))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          g.value.lines ? (e.openBlock(), e.createElementBlock("details", OB, [
            e.createElementVNode(
              "summary",
              null,
              e.toDisplayString(d.$t("阶段与计量")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", zB, [
              e.createElementVNode("table", MB, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("敞口编号")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("交易对手")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      jB,
                      e.toDisplayString(d.$t("违约敞口")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("阶段")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("判定理由")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      RB,
                      e.toDisplayString(d.$t("加权 ECL")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(g.value.lines, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: V.id
                    }, [
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: V.id
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(V.counterparty),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", qB, [
                        e.createVNode(l, {
                          cents: V.ead
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Fe)[V.stage])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        UB,
                        e.toDisplayString(V.reasons.map((te) => d.$t(e.unref(fh)[te] || te)).join(e.unref(r))),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", WB, [
                        e.createVNode(l, {
                          cents: V.weighted
                        }, null, 8, ["cents"])
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 营运资本 "),
      v.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 13 },
        [
          v.value.ccc ? (e.openBlock(), e.createElementBlock("section", YB, [
            e.createElementVNode("div", GB, [
              e.createElementVNode("span", HB, [
                M[15] || (M[15] = e.createTextVNode(
                  "DSO ",
                  -1
                  /* CACHED */
                )),
                e.createVNode(l, {
                  value: f(v.value.ccc.dso)
                }, null, 8, ["value"])
              ]),
              e.createElementVNode("span", QB, [
                M[16] || (M[16] = e.createTextVNode(
                  "DIO ",
                  -1
                  /* CACHED */
                )),
                e.createVNode(l, {
                  value: f(v.value.ccc.dio)
                }, null, 8, ["value"])
              ]),
              e.createElementVNode("span", JB, [
                M[17] || (M[17] = e.createTextVNode(
                  "DPO ",
                  -1
                  /* CACHED */
                )),
                e.createVNode(l, {
                  value: f(v.value.ccc.dpo)
                }, null, 8, ["value"])
              ]),
              e.createElementVNode("span", ZB, [
                M[18] || (M[18] = e.createTextVNode(
                  "CCC ",
                  -1
                  /* CACHED */
                )),
                e.createVNode(l, {
                  value: f(v.value.ccc.ccc)
                }, null, 8, ["value"])
              ]),
              e.createElementVNode("span", XB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("应收每缩短 1 天释放")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: v.value.ccc.perDay.dso
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode("span", xB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("逾期应收")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: v.value.ccc.overdueAr
                }, null, 8, ["cents"])
              ])
            ])
          ])) : e.createCommentVNode("v-if", !0),
          v.value.inventory ? (e.openBlock(), e.createElementBlock("section", eb, [
            e.createElementVNode("div", tb, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(["A", "B", "C"], (V) => e.createElementVNode("span", {
                  key: V,
                  class: "fau-badge muted"
                }, [
                  e.createVNode(l, { value: V }, null, 8, ["value"]),
                  M[19] || (M[19] = e.createTextVNode()),
                  e.createVNode(l, {
                    value: v.value.inventory.byClass[V].count
                  }, null, 8, ["value"]),
                  M[20] || (M[20] = e.createTextVNode(
                    " · ",
                    -1
                    /* CACHED */
                  )),
                  e.createVNode(l, {
                    cents: v.value.inventory.byClass[V].amount
                  }, null, 8, ["cents"])
                ])),
                64
                /* STABLE_FRAGMENT */
              )),
              e.createElementVNode("span", lb, [
                e.createTextVNode(
                  e.toDisplayString(d.$t(e.unref(ut).slow)) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: v.value.inventory.slow
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode("span", nb, [
                e.createTextVNode(
                  e.toDisplayString(d.$t(e.unref(ut).obsolete)) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: v.value.inventory.obsolete
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode("span", ab, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("可释放资金占用")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: v.value.inventory.release
                }, null, 8, ["cents"])
              ])
            ])
          ])) : e.createCommentVNode("v-if", !0),
          v.value.suppliers ? (e.openBlock(), e.createElementBlock("section", ob, [
            e.createElementVNode("div", sb, [
              e.createElementVNode("table", rb, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("供应商")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      ib,
                      e.toDisplayString(d.$t("未清金额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      cb,
                      e.toDisplayString(d.$t("占比")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      db,
                      e.toDisplayString(d.$t("平均账期（天）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      ub,
                      e.toDisplayString(d.$t("30 天内到期")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(v.value.suppliers, (V) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: V.supplier,
                        class: e.normalizeClass({ warn: V.status !== "ok" })
                      },
                      [
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(V.supplier),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", mb, [
                          e.createVNode(l, {
                            cents: V.open
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", pb, [
                          e.createVNode(l, {
                            ratio: V.share
                          }, null, 8, ["ratio"])
                        ]),
                        e.createElementVNode("td", yb, [
                          e.createVNode(l, {
                            value: f(V.avgTermDays)
                          }, null, 8, ["value"])
                        ]),
                        e.createElementVNode("td", Nb, [
                          e.createVNode(l, {
                            cents: V.dueIn30
                          }, null, 8, ["cents"])
                        ])
                      ],
                      2
                      /* CLASS */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ])) : e.createCommentVNode("v-if", !0),
          v.value.scf ? (e.openBlock(), e.createElementBlock("section", Vb, [
            e.createElementVNode("div", Eb, [
              e.createElementVNode("table", kb, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(d.$t("方案")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      vb,
                      e.toDisplayString(d.$t("基数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      gb,
                      e.toDisplayString(d.$t("现金效应")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      fb,
                      e.toDisplayString(d.$t("年化成本（负数为节约）")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(v.value.scf, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: V.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref($h)[V.id])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", hb, [
                        e.createVNode(l, {
                          cents: V.base
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", $b, [
                        e.createVNode(l, {
                          cents: V.cashEffect
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", _b, [
                        e.createVNode(l, {
                          cents: V.annualCost
                        }, null, 8, ["cents"])
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 投融资 "),
      b.value?.portfolio ? (e.openBlock(), e.createElementBlock("section", Bb, [
        e.createElementVNode("div", bb, [
          e.createElementVNode("span", Sb, [
            e.createTextVNode(
              e.toDisplayString(d.$t("市值")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: b.value.portfolio.totals.marketValue
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", b.value.portfolio.totals.pnl < 0 ? "warn" : "ok"]),
              "data-test": "fau-portfolio-pnl"
            },
            [
              e.createTextVNode(
                e.toDisplayString(d.$t("浮动盈亏")) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                cents: b.value.portfolio.totals.pnl
              }, null, 8, ["cents"])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("span", Db, [
            e.createTextVNode(
              e.toDisplayString(d.$t("加权收益率")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              ratio: b.value.portfolio.weightedYield
            }, null, 8, ["ratio"])
          ])
        ]),
        e.createElementVNode("div", Cb, [
          e.createElementVNode("table", wb, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("产品名称")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("投资类型")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Tb,
                  e.toDisplayString(d.$t("市值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Lb,
                  e.toDisplayString(d.$t("浮动盈亏")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(b.value.portfolio.lines, (V) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: V.id,
                    class: e.normalizeClass({ bad: V.status === "breach", warn: V.status === "watch" })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(V.product),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(d.$t(e.unref(_h)[V.type])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", Kb, [
                      e.createVNode(l, {
                        cents: V.marketValue
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", Ab, [
                      e.createVNode(l, {
                        cents: V.pnl
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(d.$t(e.unref(Ue)[V.status])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Fb,
                      e.toDisplayString(V.flags.map((te) => e.unref(Z)(te)).join(e.unref(r))),
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
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      b.value?.liquidity ? (e.openBlock(), e.createElementBlock("section", Ib, [
        e.createElementVNode("div", Pb, [
          e.createElementVNode("span", Ob, [
            e.createTextVNode(
              e.toDisplayString(d.$t("可用流动性合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: b.value.liquidity.available
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", zb, [
            e.createTextVNode(
              e.toDisplayString(d.$t("一年内到期债务")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: b.value.liquidity.debtDue12m
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", w[b.value.liquidity.statuses.current]])
            },
            [
              e.createTextVNode(
                e.toDisplayString(d.$t("流动比率")) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: y(b.value.liquidity.currentRatio)
              }, null, 8, ["value"])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", w[b.value.liquidity.statuses.quick]])
            },
            [
              e.createTextVNode(
                e.toDisplayString(d.$t("速动比率")) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: y(b.value.liquidity.quickRatio)
              }, null, 8, ["value"])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", w[b.value.liquidity.statuses.coverage]])
            },
            [
              e.createTextVNode(
                e.toDisplayString(d.$t("短期债务覆盖")) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: y(b.value.liquidity.coverage)
              }, null, 8, ["value"])
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", w[b.value.liquidity.statuses.facility]])
            },
            [
              e.createTextVNode(
                e.toDisplayString(d.$t("授信使用率")) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                ratio: b.value.liquidity.facilityUtilization
              }, null, 8, ["ratio"])
            ],
            2
            /* CLASS */
          )
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 模型说明（H 型） "),
      z.value.length ? (e.openBlock(), e.createElementBlock("section", Mb, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(d.$t("模型说明（数字已回核）")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(z.value, (V) => (e.openBlock(), e.createElementBlock(
            "div",
            {
              key: V.id,
              class: e.normalizeClass(["fau-tr-para", { bad: V.status !== "verified" }])
            },
            [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["fau-badge", V.status === "verified" ? "ok" : "bad"])
                },
                e.toDisplayString(d.$t(V.topic)) + " · " + e.toDisplayString(V.status === "verified" ? d.$t("已核实") : d.$t("未核实")),
                3
                /* TEXT, CLASS */
              ),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(V.text),
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
      i.value ? (e.openBlock(), e.createElementBlock("p", jb, [
        M[21] || (M[21] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), qb = /* @__PURE__ */ ae(Rb, [["__scopeId", "data-v-391ff6ce"]]), Ub = Object.fromEntries(
  ["cash", "treasury", "fx", "financing", "ifrs9", "working-capital", "investments"].map((c) => [c, qb])
), Wb = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PANELS: Ub
}, Symbol.toStringTag, { value: "Module" })), Ct = /* @__PURE__ */ Object.assign({ "./accounting/panels.ts": qV, "./audit/panels.ts": vg, "./capital/panels.ts": Xf, "./platform/panels.ts": ch, "./treasury/panels.ts": Wb }), Ie = Object.assign({}, ...Object.values(Ct).map((c) => c.PANELS || {})), mt = Object.assign({}, ...Object.values(Ct).map((c) => c.INPUTS || {})), Yb = {
  class: "fau-audit ss-module",
  "data-test": "fau-qc-panel"
}, Gb = { class: "fau-steps" }, Hb = { class: "ss-actions" }, Qb = ["disabled"], Jb = ["disabled"], Zb = {
  key: 0,
  class: "ss-note info",
  "data-test": "fau-qc-file"
}, Xb = {
  key: 0,
  class: "ss-muted"
}, xb = { class: "fau-row" }, eS = { class: "ss-muted" }, tS = { class: "fau-seg" }, lS = ["data-test", "onClick"], nS = {
  key: 0,
  class: "fau-row"
}, aS = { class: "fau-row" }, oS = { class: "ss-muted" }, sS = ["value"], rS = {
  key: 0,
  class: "fau-row"
}, iS = { class: "ss-muted" }, cS = {
  key: 2,
  class: "ss-muted"
}, dS = {
  key: 3,
  class: "ss-actions"
}, uS = { class: "ss-actions" }, mS = ["disabled"], pS = { class: "fau-counts" }, yS = ["data-test"], NS = { class: "fau-table-wrap" }, VS = { class: "fau-table" }, ES = ["data-test"], kS = { class: "wrap" }, vS = {
  key: 1,
  class: "ss-muted"
}, gS = {
  key: 0,
  class: "ss-muted"
}, fS = ["onUpdate:modelValue", "placeholder", "data-test"], hS = ["onUpdate:modelValue", "placeholder", "data-test"], $S = ["onClick"], _S = { class: "ss-actions" }, BS = ["disabled"], bS = { class: "fau-table-wrap" }, SS = { class: "fau-table" }, DS = ["data-test"], CS = {
  key: 0,
  class: "fau-esc"
}, wS = { class: "ss-actions" }, TS = ["disabled"], LS = {
  key: 1,
  class: "ss-note ok",
  "data-test": "fau-qc-refreshed"
}, KS = {
  key: 0,
  class: "ss-note danger",
  "data-test": "fau-qc-error"
}, AS = /* @__PURE__ */ e.defineComponent({
  __name: "OfficeQcPanel",
  props: {
    home: {}
  },
  setup(c) {
    const _ = c, t = Q.useSteps([
      { key: "qc-pick", title: s.t("选择文件"), hint: s.t("Excel 底稿 / 模型，或演示文稿；只读检查，不改原文件") },
      { key: "qc-scope", title: s.t("质检范围"), hint: s.t("选区、单表或整个模型（含资产负债平衡与隐藏表检查）") },
      { key: "qc-run", title: s.t("质检"), hint: s.t("按表格与模型审计、演示文稿质检的规则逐项检查") },
      { key: "qc-report", title: s.t("查看报告"), hint: s.t("按严重、重要、次要列出问题，另存一份质检报告") },
      { key: "qc-refresh", title: s.t("用新数字刷新"), hint: s.t("演示文稿：按旧值 → 新值找出所有写法，先出计划，确认后另存新文件") }
    ]), N = ["selection", "sheet", "model"], r = { selection: s.i18nKey("选区"), sheet: s.i18nKey("单表"), model: s.i18nKey("整个模型") }, n = ["critical", "important", "minor"], i = e.ref(!1), a = e.ref(""), m = e.ref(""), E = e.ref(null), u = e.ref("model"), L = e.ref(""), g = e.ref(""), v = e.ref(_.home.company?.outputLocale || "zh-CN"), b = e.ref(null), h = e.reactive([{ from: "", to: "" }]), K = e.ref(null), T = e.ref("");
    async function z(y) {
      a.value = "";
      try {
        const I = await Y("office-output.pick", { kind: y });
        if (!I.paths.length) return;
        t.start("qc-pick"), m.value = I.paths[0], E.value = await Y("office-output.inspect", { path: m.value }), L.value = E.value?.sheets?.[0] || "", b.value = null, K.value = null, T.value = "", t.resetAfter("qc-pick"), t.done("qc-pick", E.value?.file);
      } catch (I) {
        t.fail("qc-pick", I), a.value = Q.errorMessage(I);
      }
    }
    async function S() {
      i.value = !0, a.value = "", t.start("qc-run");
      try {
        b.value = await Y("office-output.check", { path: m.value, scope: u.value, sheet: L.value, range: g.value, locale: v.value }), t.done("qc-run", s.t("问题 {n} 处", { n: b.value.findings.length })), t.done("qc-report");
      } catch (y) {
        t.fail("qc-run", y), a.value = Q.errorMessage(y);
      } finally {
        i.value = !1;
      }
    }
    async function w() {
      if (b.value) try {
        await Y("artifact.open", { path: b.value.reportPath });
      } catch (y) {
        a.value = Q.errorMessage(y);
      }
    }
    async function p() {
      i.value = !0, a.value = "", T.value = "", t.start("qc-refresh");
      try {
        K.value = await Y("office-output.refreshPlan", { path: m.value, mapping: h.map((y) => ({ ...y })) }), t.set("qc-refresh", { state: "todo", summary: s.t("计划替换 {n} 处，待确认", { n: K.value?.changes.length || 0 }) });
      } catch (y) {
        t.fail("qc-refresh", y), a.value = Q.errorMessage(y);
      } finally {
        i.value = !1;
      }
    }
    async function f() {
      i.value = !0, a.value = "", t.start("qc-refresh");
      try {
        const y = await Y("office-output.refreshApply", { path: m.value, mapping: h.map((I) => ({ ...I })), confirmed: !0, locale: v.value });
        T.value = y.path, t.done("qc-refresh", s.t("已替换 {n} 处", { n: y.changes }));
      } catch (y) {
        t.fail("qc-refresh", y), a.value = Q.errorMessage(y);
      } finally {
        i.value = !1;
      }
    }
    return (y, I) => (e.openBlock(), e.createElementBlock("div", Yb, [
      e.createVNode(Je, {
        title: y.$t("办公产出与质检"),
        metas: e.unref(t).metas,
        runtime: e.unref(t).runtime,
        "current-key": e.unref(t).currentKey.value,
        onJump: e.unref(Q.scrollToStep)
      }, null, 8, ["title", "metas", "runtime", "current-key", "onJump"]),
      e.createElementVNode("div", Gb, [
        e.createCommentVNode(" ① 选择文件 "),
        e.createVNode(se, {
          "step-key": "qc-pick",
          index: 0,
          title: e.unref(t).metas[0].title,
          hint: e.unref(t).metas[0].hint,
          runtime: e.unref(t).runtime["qc-pick"],
          "is-current": e.unref(t).currentKey.value === "qc-pick"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Hb, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: i.value,
                "data-test": "fau-qc-pick-xlsx",
                onClick: I[0] || (I[0] = (B) => z("xlsx"))
              }, [
                I[7] || (I[7] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(y.$t("选择 Excel 底稿或模型")),
                  1
                  /* TEXT */
                )
              ], 8, Qb),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: i.value,
                "data-test": "fau-qc-pick-pptx",
                onClick: I[1] || (I[1] = (B) => z("pptx"))
              }, [
                I[8] || (I[8] = e.createElementVNode(
                  "i",
                  { class: "ri-slideshow-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(y.$t("选择演示文稿")),
                  1
                  /* TEXT */
                )
              ], 8, Jb)
            ]),
            E.value ? (e.openBlock(), e.createElementBlock("p", Zb, [
              I[9] || (I[9] = e.createElementVNode(
                "i",
                { class: "ri-file-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(E.value.file) + " · ",
                1
                /* TEXT */
              ),
              E.value.kind === "xlsx" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.createTextVNode(
                    e.toDisplayString(y.$t("{n} 张工作表", { n: E.value.sheets?.length || 0 })),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 1 },
                [
                  e.createTextVNode(
                    e.toDisplayString(y.$t("{n} 页", { n: E.value.slides || 0 })),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ② 质检范围 "),
        e.createVNode(se, {
          "step-key": "qc-scope",
          index: 1,
          title: e.unref(t).metas[1].title,
          hint: e.unref(t).metas[1].hint,
          runtime: e.unref(t).runtime["qc-scope"],
          "is-current": e.unref(t).currentKey.value === "qc-scope"
        }, {
          default: e.withCtx(() => [
            E.value ? E.value.kind === "xlsx" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", xb, [
                  e.createElementVNode(
                    "span",
                    eS,
                    e.toDisplayString(y.$t("范围")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("span", tS, [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(N, (B) => e.createElementVNode("button", {
                        key: B,
                        type: "button",
                        class: e.normalizeClass({ on: u.value === B }),
                        "data-test": `fau-qc-scope-${B}`,
                        onClick: (k) => u.value = B
                      }, e.toDisplayString(y.$t(r[B])), 11, lS)),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ])
                ]),
                u.value !== "model" ? (e.openBlock(), e.createElementBlock("div", nS, [
                  e.createElementVNode("label", aS, [
                    e.createElementVNode(
                      "span",
                      oS,
                      e.toDisplayString(y.$t("工作表")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": I[2] || (I[2] = (B) => L.value = B)
                      },
                      [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(E.value.sheets || [], (B) => (e.openBlock(), e.createElementBlock("option", {
                            key: B,
                            value: B
                          }, e.toDisplayString(B), 9, sS))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelSelect, L.value]
                    ])
                  ]),
                  u.value === "selection" ? (e.openBlock(), e.createElementBlock("label", rS, [
                    e.createElementVNode(
                      "span",
                      iS,
                      e.toDisplayString(y.$t("区域")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": I[3] || (I[3] = (B) => g.value = B),
                        type: "text",
                        dir: "ltr",
                        placeholder: "B3:F20",
                        "data-test": "fau-qc-range"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        g.value,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ])) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              cS,
              e.toDisplayString(y.$t("演示文稿检查全部页：跨页数字一致性、单位与日期写法、措辞与占位符、数据来源")),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Xb,
              e.toDisplayString(y.$t("先完成第 1 步")),
              1
              /* TEXT */
            )),
            E.value ? (e.openBlock(), e.createElementBlock("div", dS, [
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn primary",
                  "data-test": "fau-qc-scope-next",
                  onClick: I[4] || (I[4] = (B) => e.unref(t).done("qc-scope"))
                },
                e.toDisplayString(y.$t("下一步")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ③ 质检 "),
        e.createVNode(se, {
          "step-key": "qc-run",
          index: 2,
          title: e.unref(t).metas[2].title,
          hint: e.unref(t).metas[2].hint,
          runtime: e.unref(t).runtime["qc-run"],
          "is-current": e.unref(t).currentKey.value === "qc-run",
          retry: E.value ? S : void 0
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", uS, [
              e.createVNode(Me, {
                modelValue: v.value,
                "onUpdate:modelValue": I[5] || (I[5] = (B) => v.value = B)
              }, null, 8, ["modelValue"]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: i.value || !E.value || e.unref(t).runtime["qc-scope"].state !== "done",
                "data-test": "fau-qc-run",
                onClick: S
              }, [
                I[10] || (I[10] = e.createElementVNode(
                  "i",
                  { class: "ri-search-eye-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(y.$t("开始质检")),
                  1
                  /* TEXT */
                )
              ], 8, mS)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry"]),
        e.createCommentVNode(" ④ 查看报告 "),
        e.createVNode(se, {
          "step-key": "qc-report",
          index: 3,
          title: e.unref(t).metas[3].title,
          hint: e.unref(t).metas[3].hint,
          runtime: e.unref(t).runtime["qc-report"],
          "is-current": e.unref(t).currentKey.value === "qc-report"
        }, {
          default: e.withCtx(() => [
            b.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", pS, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(n, (B) => e.createElementVNode("span", {
                      key: B,
                      class: e.normalizeClass(["fau-badge", B === "critical" ? "bad" : B === "important" ? "warn" : "muted"]),
                      "data-test": `fau-qc-count-${B}`
                    }, [
                      e.createTextVNode(
                        e.toDisplayString(y.$t(e.unref(ee.QC_SEVERITY_LABEL)[B])) + " ",
                        1
                        /* TEXT */
                      ),
                      e.createVNode(l, {
                        value: b.value.counts[B]
                      }, null, 8, ["value"])
                    ], 10, yS)),
                    64
                    /* STABLE_FRAGMENT */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    "data-test": "fau-qc-open",
                    onClick: w
                  }, [
                    I[11] || (I[11] = e.createElementVNode(
                      "i",
                      { class: "ri-external-link-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(y.$t("打开质检报告")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("div", NS, [
                  e.createElementVNode("table", VS, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(y.$t("位置")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(y.$t("规则")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(y.$t("严重程度")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(y.$t("说明")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(b.value.findings, (B) => (e.openBlock(), e.createElementBlock("tr", {
                          key: B.id,
                          class: e.normalizeClass({ bad: B.severity === "critical" }),
                          "data-test": `fau-qc-finding-${B.rule}`
                        }, [
                          e.createElementVNode("td", null, [
                            e.createVNode(l, {
                              value: B.location
                            }, null, 8, ["value"])
                          ]),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(y.$t(e.unref(ee.XLS_RULE_LABEL)[B.rule] || e.unref(ee.DECK_RULE_LABEL)[B.rule] || B.rule)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(y.$t(e.unref(ee.QC_SEVERITY_LABEL)[B.severity])),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", kS, [
                            e.createElementVNode(
                              "bdi",
                              null,
                              e.toDisplayString(B.detail),
                              1
                              /* TEXT */
                            )
                          ])
                        ], 10, ES))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              vS,
              e.toDisplayString(y.$t("质检完成后在这里看结果")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ⑤ 用新数字刷新（演示文稿） "),
        e.createVNode(se, {
          "step-key": "qc-refresh",
          index: 4,
          title: e.unref(t).metas[4].title,
          hint: e.unref(t).metas[4].hint,
          runtime: e.unref(t).runtime["qc-refresh"],
          "is-current": e.unref(t).currentKey.value === "qc-refresh"
        }, {
          default: e.withCtx(() => [
            E.value?.kind !== "pptx" ? (e.openBlock(), e.createElementBlock(
              "p",
              gS,
              e.toDisplayString(y.$t("只对演示文稿可用")),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(h, (B, k) => (e.openBlock(), e.createElementBlock("div", {
                    key: k,
                    class: "fau-row"
                  }, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (R) => B.from = R,
                      type: "text",
                      dir: "ltr",
                      placeholder: y.$t("旧值，如 $485M"),
                      "data-test": `fau-qc-from-${k}`
                    }, null, 8, fS), [
                      [
                        e.vModelText,
                        B.from,
                        void 0,
                        { trim: !0 }
                      ]
                    ]),
                    I[12] || (I[12] = e.createElementVNode(
                      "i",
                      { class: "ri-arrow-right-line fau-dir-icon" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (R) => B.to = R,
                      type: "text",
                      dir: "ltr",
                      placeholder: y.$t("新值，如 $512M"),
                      "data-test": `fau-qc-to-${k}`
                    }, null, 8, hS), [
                      [
                        e.vModelText,
                        B.to,
                        void 0,
                        { trim: !0 }
                      ]
                    ]),
                    h.length > 1 ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: (R) => h.splice(k, 1)
                    }, e.toDisplayString(y.$t("删除")), 9, $S)) : e.createCommentVNode("v-if", !0)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                e.createElementVNode("div", _S, [
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-btn sm ghost",
                      onClick: I[6] || (I[6] = (B) => h.push({ from: "", to: "" }))
                    },
                    e.toDisplayString(y.$t("再加一组")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: i.value,
                    "data-test": "fau-qc-plan",
                    onClick: p
                  }, e.toDisplayString(y.$t("生成刷新计划")), 9, BS)
                ]),
                K.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode("div", bS, [
                      e.createElementVNode("table", SS, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(y.$t("页")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(y.$t("原文")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(y.$t("改成")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(K.value.changes, (B, k) => (e.openBlock(), e.createElementBlock("tr", {
                              key: k,
                              "data-test": `fau-qc-change-${k}`
                            }, [
                              e.createElementVNode("td", null, [
                                e.createVNode(l, {
                                  value: B.slide
                                }, null, 8, ["value"])
                              ]),
                              e.createElementVNode("td", null, [
                                e.createVNode(l, {
                                  value: B.before
                                }, null, 8, ["value"])
                              ]),
                              e.createElementVNode("td", null, [
                                e.createVNode(l, {
                                  value: B.after
                                }, null, 8, ["value"])
                              ])
                            ], 8, DS))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ])
                    ]),
                    K.value.flagged.length ? (e.openBlock(), e.createElementBlock("ul", CS, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(K.value.flagged, (B, k) => (e.openBlock(), e.createElementBlock("li", { key: k }, [
                          I[13] || (I[13] = e.createElementVNode(
                            "i",
                            { class: "ri-error-warning-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(y.$t("第 {n} 页可能是派生数字，未改：", { n: B.slide })),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "bdi",
                            null,
                            e.toDisplayString(B.text),
                            1
                            /* TEXT */
                          )
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode("div", wS, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn primary",
                        disabled: i.value || !K.value.changes.length,
                        "data-test": "fau-qc-apply",
                        onClick: f
                      }, e.toDisplayString(y.$t("确认刷新（另存新文件，原文件不动）")), 9, TS)
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0),
                T.value ? (e.openBlock(), e.createElementBlock("p", LS, [
                  I[14] || (I[14] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(y.$t("已另存：{p0}", { p0: T.value })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"])
      ]),
      a.value ? (e.openBlock(), e.createElementBlock("p", KS, [
        I[15] || (I[15] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(a.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), FS = [
  {
    id: "daloopa",
    name: "Daloopa",
    layer: "market",
    modules: [
      "F1",
      "F4",
      "F6"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "daloopa",
    sources: [
      "daloopa"
    ]
  },
  {
    id: "morningstar",
    name: "Morningstar",
    layer: "market",
    modules: [
      "F1",
      "F6",
      "F8"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "morningstar",
    sources: [
      "morningstar"
    ]
  },
  {
    id: "sp-global",
    name: "S&P Global (Kensho / Capital IQ)",
    layer: "market",
    modules: [
      "F1",
      "F4",
      "F5",
      "F6"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "sp-global",
    sources: [
      "sp-global",
      "spglobal",
      "capiq",
      "Capital IQ (LSEG)"
    ]
  },
  {
    id: "factset",
    name: "FactSet",
    layer: "market",
    modules: [
      "F1",
      "F4",
      "F6"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "factset",
    sources: [
      "factset"
    ]
  },
  {
    id: "moodys",
    name: "Moody's",
    layer: "market",
    modules: [
      "F6",
      "F7",
      "E5"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "moodys",
    sources: [
      "moodys"
    ]
  },
  {
    id: "mtnewswire",
    name: "MT Newswires",
    layer: "market",
    modules: [
      "F6"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "mtnewswire",
    sources: [
      "mtnewswire"
    ]
  },
  {
    id: "aiera",
    name: "Aiera",
    layer: "market",
    modules: [
      "F6"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "aiera",
    sources: [
      "aiera"
    ]
  },
  {
    id: "lseg",
    name: "LSEG (LFA)",
    layer: "market",
    modules: [
      "F7",
      "E3"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "lseg",
    sources: [
      "lseg"
    ]
  },
  {
    id: "pitchbook",
    name: "PitchBook",
    layer: "market",
    modules: [
      "F4",
      "F5"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "pitchbook",
    sources: [
      "pitchbook"
    ]
  },
  {
    id: "chronograph",
    name: "Chronograph",
    layer: "market",
    modules: [
      "F5"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "chronograph",
    sources: [
      "chronograph"
    ]
  },
  {
    id: "egnyte",
    name: "Egnyte",
    layer: "docs",
    modules: [
      "F3",
      "B3"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "egnyte",
    sources: [
      "egnyte"
    ]
  },
  {
    id: "box",
    name: "Box",
    layer: "docs",
    modules: [
      "F3",
      "B3"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "box",
    sources: [
      "box"
    ]
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    layer: "docs",
    modules: [
      "F3",
      "B3",
      "D7"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "sharepoint",
    sources: [
      "SharePoint",
      "sharepoint"
    ]
  },
  {
    id: "google-drive",
    name: "Google Drive",
    layer: "docs",
    modules: [
      "F3",
      "B3"
    ],
    access: "mcp",
    status: "needs_auth",
    connectorId: "google-workspace",
    sources: [
      "Google Drive"
    ]
  },
  {
    id: "internal-gl",
    name: "internal-gl",
    layer: "enterprise",
    modules: [
      "A1",
      "A2"
    ],
    access: "mcp",
    status: "needs_auth",
    sources: [
      "internal-gl"
    ]
  },
  {
    id: "subledger",
    name: "subledger",
    layer: "enterprise",
    modules: [
      "A2"
    ],
    access: "mcp",
    status: "needs_auth",
    sources: [
      "subledger"
    ]
  },
  {
    id: "nav",
    name: "nav",
    layer: "enterprise",
    modules: [
      "B4",
      "F5"
    ],
    access: "mcp",
    status: "needs_auth",
    sources: [
      "nav"
    ]
  },
  {
    id: "portfolio",
    name: "portfolio",
    layer: "enterprise",
    modules: [
      "F5"
    ],
    access: "mcp",
    status: "needs_auth",
    sources: [
      "portfolio"
    ]
  },
  {
    id: "screening",
    name: "screening",
    layer: "enterprise",
    modules: [
      "B6"
    ],
    access: "mcp",
    status: "needs_auth",
    sources: [
      "screening"
    ]
  },
  {
    id: "crm",
    name: "CRM",
    layer: "enterprise",
    modules: [
      "F8",
      "F5"
    ],
    access: "mcp",
    status: "needs_auth",
    sources: [
      "crm"
    ]
  },
  {
    id: "sap-s4hana",
    name: "SAP S/4HANA",
    layer: "erp",
    modules: [
      "A1",
      "A2",
      "P3"
    ],
    access: "file",
    status: "available",
    sources: [
      "SAP S/4HANA",
      "sap-s4hana"
    ]
  },
  {
    id: "oracle",
    name: "Oracle EBS / Fusion",
    layer: "erp",
    modules: [
      "A1",
      "A2",
      "P3"
    ],
    access: "file",
    status: "available",
    sources: [
      "Oracle EBS / Fusion"
    ]
  },
  {
    id: "yonyou",
    name: "Yonyou NC / U8 / Cloud",
    layer: "erp",
    modules: [
      "A1",
      "A2",
      "P3"
    ],
    access: "erp-plugin",
    status: "available",
    erpProviders: [
      "yonyou_u8"
    ],
    sources: [
      "用友 NC/U8/Cloud"
    ]
  },
  {
    id: "kingdee",
    name: "Kingdee K3 / Cloud",
    layer: "erp",
    modules: [
      "A1",
      "A2",
      "P3"
    ],
    access: "erp-plugin",
    status: "available",
    erpProviders: [
      "kingdee_cloud",
      "jdy"
    ],
    sources: [
      "金蝶 K3/Cloud"
    ]
  },
  {
    id: "chanjet",
    name: "Chanjet T+",
    layer: "erp",
    modules: [
      "A1",
      "A2",
      "P3"
    ],
    access: "erp-plugin",
    status: "available",
    erpProviders: [
      "changjietong"
    ],
    sources: []
  },
  {
    id: "fa-assets-system",
    name: "Fixed asset system",
    layer: "erp",
    modules: [
      "A6"
    ],
    access: "file",
    status: "available",
    sources: [
      "fa-assets-system"
    ]
  },
  {
    id: "power-bi",
    name: "Power BI",
    layer: "bi",
    modules: [
      "D1",
      "D3"
    ],
    access: "file",
    status: "available",
    sources: [
      "Power BI",
      "power-bi"
    ]
  },
  {
    id: "tableau",
    name: "Tableau",
    layer: "bi",
    modules: [
      "D1",
      "D3"
    ],
    access: "file",
    status: "available",
    sources: [
      "Tableau",
      "tableau"
    ]
  },
  {
    id: "finereport",
    name: "FineReport",
    layer: "bi",
    modules: [
      "D1",
      "D3"
    ],
    access: "file",
    status: "available",
    sources: [
      "FineReport / 帆软",
      "finereport"
    ]
  },
  {
    id: "excel-csv",
    name: "Excel / CSV",
    layer: "bi",
    modules: [
      "P3"
    ],
    access: "file",
    status: "available",
    sources: [
      "Excel / CSV"
    ]
  },
  {
    id: "blackline",
    name: "BlackLine",
    layer: "execution",
    modules: [
      "A2"
    ],
    access: "file",
    status: "available",
    sources: [
      "BlackLine",
      "blackline"
    ]
  },
  {
    id: "sap-concur",
    name: "SAP Concur",
    layer: "execution",
    modules: [
      "A5"
    ],
    access: "file",
    status: "available",
    sources: [
      "SAP Concur",
      "sap-concur"
    ]
  },
  {
    id: "expensify",
    name: "Expensify",
    layer: "execution",
    modules: [
      "A5"
    ],
    access: "file",
    status: "available",
    sources: [
      "Expensify"
    ]
  },
  {
    id: "kyriba",
    name: "Kyriba",
    layer: "execution",
    modules: [
      "E1",
      "E2"
    ],
    access: "file",
    status: "available",
    sources: [
      "Kyriba",
      "kyriba",
      "kyriba-treasury"
    ]
  },
  {
    id: "gtreasury",
    name: "GTreasury (Finastra)",
    layer: "execution",
    modules: [
      "E1",
      "E2"
    ],
    access: "file",
    status: "available",
    sources: [
      "GTreasury (Finastra)"
    ]
  },
  {
    id: "bloomberg",
    name: "Bloomberg",
    layer: "market",
    modules: [
      "E3",
      "F7"
    ],
    access: "manual",
    status: "needs_auth",
    sources: [
      "Bloomberg (TSOX)",
      "bloomberg",
      "bloomberg-tsux"
    ]
  },
  {
    id: "refinitiv",
    name: "Refinitiv Eikon",
    layer: "market",
    modules: [
      "E3",
      "F7"
    ],
    access: "manual",
    status: "needs_auth",
    sources: [
      "Refinitiv Eikon",
      "refinitiv",
      "refinitiv-eikon"
    ]
  },
  {
    id: "wind",
    name: "Wind",
    layer: "market",
    modules: [
      "F1",
      "F6",
      "F7"
    ],
    access: "manual",
    status: "needs_auth",
    sources: [
      "Wind (万得)"
    ]
  },
  {
    id: "auditboard",
    name: "AuditBoard",
    layer: "execution",
    modules: [
      "B1",
      "B2"
    ],
    access: "file",
    status: "available",
    sources: [
      "AuditBoard",
      "auditboard-grc"
    ]
  },
  {
    id: "workday-adaptive",
    name: "Workday Adaptive Planning",
    layer: "docs",
    modules: [
      "D4"
    ],
    access: "file",
    status: "available",
    sources: [
      "Workday Adaptive Planning"
    ]
  },
  {
    id: "anaplan",
    name: "Anaplan",
    layer: "docs",
    modules: [
      "D4"
    ],
    access: "file",
    status: "available",
    sources: [
      "Anaplan",
      "anaplan"
    ]
  },
  {
    id: "tagetik",
    name: "Tagetik / CCH Tagetik",
    layer: "docs",
    modules: [
      "A8",
      "D4"
    ],
    access: "file",
    status: "available",
    sources: [
      "Tagetik / CCH Tagetik"
    ]
  },
  {
    id: "workiva",
    name: "Workiva",
    layer: "docs",
    modules: [
      "C2"
    ],
    access: "file",
    status: "available",
    sources: [
      "Workiva"
    ]
  },
  {
    id: "workday-hcm",
    name: "Workday HCM",
    layer: "hr_tax",
    modules: [
      "A7"
    ],
    access: "file",
    status: "available",
    sources: [
      "Workday HCM",
      "workday-hcm"
    ]
  },
  {
    id: "bamboohr",
    name: "BambooHR",
    layer: "hr_tax",
    modules: [
      "A7"
    ],
    access: "file",
    status: "available",
    sources: [
      "BambooHR"
    ]
  },
  {
    id: "adp",
    name: "ADP",
    layer: "hr_tax",
    modules: [
      "A7"
    ],
    access: "file",
    status: "available",
    sources: [
      "ADP"
    ]
  },
  {
    id: "taxdome",
    name: "TaxDome",
    layer: "hr_tax",
    modules: [
      "C1"
    ],
    access: "file",
    status: "available",
    sources: [
      "TaxDome",
      "taxdome"
    ]
  },
  {
    id: "vertex",
    name: "Vertex / Sovos",
    layer: "hr_tax",
    modules: [
      "C1"
    ],
    access: "file",
    status: "available",
    sources: [
      "Vertex / Sovos",
      "vertex-o"
    ]
  },
  {
    id: "tax-einvoicing",
    name: "E-invoicing platform",
    layer: "hr_tax",
    modules: [
      "C1"
    ],
    access: "file",
    status: "available",
    sources: [
      "tax-einvoicing"
    ]
  },
  {
    id: "sustainalytics",
    name: "Sustainalytics",
    layer: "esg_ir",
    modules: [
      "D8"
    ],
    access: "manual",
    status: "needs_auth",
    sources: [
      "Sustainalytics"
    ]
  },
  {
    id: "msci-esg",
    name: "MSCI ESG Research",
    layer: "esg_ir",
    modules: [
      "D8"
    ],
    access: "manual",
    status: "needs_auth",
    sources: [
      "MSCI ESG Research"
    ]
  },
  {
    id: "bloomberg-esg",
    name: "Bloomberg ESG",
    layer: "esg_ir",
    modules: [
      "D8"
    ],
    access: "manual",
    status: "needs_auth",
    sources: [
      "Bloomberg ESG"
    ]
  },
  {
    id: "diligent",
    name: "Diligent (Board Portal)",
    layer: "esg_ir",
    modules: [
      "D7"
    ],
    access: "file",
    status: "available",
    sources: [
      "Diligent (Board Portal)"
    ]
  },
  {
    id: "q4",
    name: "Q4 (IR Platform)",
    layer: "esg_ir",
    modules: [
      "D10"
    ],
    access: "file",
    status: "available",
    sources: [
      "Q4 (IR Platform)"
    ]
  },
  {
    id: "m365",
    name: "Microsoft 365",
    layer: "reference",
    modules: [
      "P5"
    ],
    access: "manual",
    status: "planned",
    sources: [
      "setup",
      "manifest",
      "consent",
      "entra-app",
      "access-policies",
      "bootstrap",
      "update-user-attrs",
      "export-data",
      "debug",
      "verify",
      "install scripts"
    ]
  },
  {
    id: "mcp-categories",
    name: "mcp-categories.json",
    layer: "reference",
    modules: [
      "P5"
    ],
    access: "manual",
    status: "available",
    sources: [
      "mcp-categories.json"
    ]
  }
], IS = {
  sources: FS
};
o.i18nKey("ERP 与总账"), o.i18nKey("BI 与报表"), o.i18nKey("业务执行与资金"), o.i18nKey("文档与计划"), o.i18nKey("人力与税务"), o.i18nKey("ESG 与投资者关系"), o.i18nKey("市场与研究数据"), o.i18nKey("企业自有服务"), o.i18nKey("接入参考");
o.i18nKey("可用"), o.i18nKey("需授权"), o.i18nKey("规划中");
o.i18nKey("用友 NC / U8 / Cloud"), o.i18nKey("金蝶 K3 / Cloud"), o.i18nKey("畅捷通 T+"), o.i18nKey("帆软 FineReport"), o.i18nKey("万得 Wind");
const PS = {
  market: o.i18nKey("没有授权时：上传终端导出的 CSV / xlsx，或用公开数据、手工录入"),
  enterprise: o.i18nKey("企业自建 MCP 服务，填地址后可用；没有时上传导出文件"),
  reference: o.i18nKey("只作接入参考，加载项本体不迁移"),
  erp: o.i18nKey("没有授权时：上传系统导出的文件"),
  bi: o.i18nKey("没有授权时：上传系统导出的文件"),
  execution: o.i18nKey("没有授权时：上传系统导出的文件"),
  docs: o.i18nKey("没有授权时：上传系统导出的文件"),
  hr_tax: o.i18nKey("没有授权时：上传系统导出的文件"),
  esg_ir: o.i18nKey("没有授权时：上传系统导出的文件")
};
IS.sources.map((c) => ({ ...c, fallback: PS[c.layer] }));
const Pe = [
  { id: "kingdee_cloud", name: o.i18nKey("金蝶云星空"), erp: "kingdee", capped: !0 },
  { id: "yonyou_u8", name: o.i18nKey("用友 U8"), erp: "yonyou", capped: !0 },
  { id: "changjietong", name: o.i18nKey("畅捷通 T+"), erp: "chanjet", capped: !1 },
  { id: "jdy", name: o.i18nKey("精斗云"), erp: "kingdee", capped: !1 }
], OS = ["journal", "tb", "subledger", "ar", "ap", "po", "grn", "invoice", "fa_register", "payroll", "budget"], zS = 5e3, MS = {
  kingdee_cloud: {
    journal: {
      docType: "GL_VOUCHER",
      filters: {
        field_keys: "FDate,FBillNo,FEntity_FAccountId.FNumber,FEntity_FAccountId.FName,FEntity_FEXPLANATION,FEntity_FDEBIT,FEntity_FCREDIT",
        filter_string: "FDate>='{from}' and FDate<='{to}'"
      }
    }
  },
  yonyou_u8: {
    journal: { docType: "GL_accvouch", filters: { _sql: "SELECT dbill_date, ino_id, ccode, cdigest, md, mc FROM GL_accvouch WHERE iyear = {year} AND iperiod = {month}" } },
    tb: { docType: "GL_accsum", filters: { _sql: "SELECT ccode, mb, md, mc, me FROM GL_accsum WHERE iyear = {year} AND iperiod = {month}" } }
  },
  changjietong: {
    ar: { docType: "/tplus/api/v2/receivable/Query", filters: { period: "{year}-{month}" } }
  }
}, jS = ["data-test"], RS = ["data-test"], qS = { class: "fau-row" }, US = { class: "grow" }, WS = {
  key: 0,
  class: "ss-muted"
}, YS = {
  key: 1,
  class: "ss-note warn",
  "data-test": "fau-erp-unavailable"
}, GS = { class: "ss-grid" }, HS = { class: "ss-field" }, QS = ["value"], JS = { class: "ss-field" }, ZS = { class: "ss-field" }, XS = { class: "ss-muted" }, xS = { class: "ss-muted" }, e8 = { class: "ss-actions" }, t8 = ["disabled"], l8 = {
  key: 3,
  class: "ss-note danger",
  "data-test": "fau-erp-error"
}, n8 = /* @__PURE__ */ e.defineComponent({
  __name: "ErpPull",
  props: {
    kind: {}
  },
  emits: ["picked"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = e.ref(!1), n = e.ref(!1), i = e.ref(""), a = e.ref(null), m = e.ref(Pe[0].id), E = e.ref(""), u = e.ref("{}"), L = (h) => !!a.value?.providers.find((K) => K.id === h)?.configured;
    function g() {
      const h = MS[m.value]?.[t.kind];
      E.value = h?.docType || "", u.value = JSON.stringify(h?.filters || {}, null, 2);
    }
    async function v() {
      r.value = !0, i.value = "";
      try {
        a.value = await Y("erp.status");
        const h = a.value.defaultProvider && Pe.some((K) => K.id === a.value.defaultProvider) ? a.value.defaultProvider : Pe.find((K) => L(K.id))?.id;
        h && (m.value = h), g();
      } catch (h) {
        i.value = Q.errorMessage(h);
      }
    }
    async function b() {
      n.value = !0, i.value = "";
      try {
        const h = await Y("erp.pull", { provider: m.value, docType: E.value, filters: u.value });
        N("picked", [h.path]), r.value = !1;
      } catch (h) {
        i.value = Q.errorMessage(h);
      } finally {
        n.value = !1;
      }
    }
    return (h, K) => e.unref(OS).includes(c.kind) ? (e.openBlock(), e.createElementBlock("div", {
      key: 0,
      class: "fau-erp",
      "data-test": `fau-erp-${c.kind}`
    }, [
      r.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("header", qS, [
            e.createElementVNode("strong", US, [
              K[5] || (K[5] = e.createElementVNode(
                "i",
                { class: "ri-database-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                " " + e.toDisplayString(h.$t("从 ERP 取数（只读）")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-btn ghost sm",
                onClick: K[0] || (K[0] = (T) => r.value = !1)
              },
              e.toDisplayString(h.$t("收起")),
              1
              /* TEXT */
            )
          ]),
          a.value ? !a.value.available || !a.value.enabled ? (e.openBlock(), e.createElementBlock("p", YS, [
            K[6] || (K[6] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.value.reason || h.$t("ERP 插件没有启用，请先上传导出文件")),
              1
              /* TEXT */
            )
          ])) : (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 2 },
            [
              e.createElementVNode("div", GS, [
                e.createElementVNode("label", HS, [
                  K[7] || (K[7] = e.createElementVNode(
                    "span",
                    null,
                    "ERP",
                    -1
                    /* CACHED */
                  )),
                  e.withDirectives(e.createElementVNode(
                    "select",
                    {
                      "onUpdate:modelValue": K[1] || (K[1] = (T) => m.value = T),
                      "data-test": "fau-erp-provider",
                      onChange: g
                    },
                    [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(Pe), (T) => (e.openBlock(), e.createElementBlock("option", {
                          key: T.id,
                          value: T.id
                        }, e.toDisplayString(h.$t(T.name)) + e.toDisplayString(L(T.id) ? "" : ` · ${h.$t("未配置")}`), 9, QS))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ],
                    544
                    /* NEED_HYDRATION, NEED_PATCH */
                  ), [
                    [e.vModelSelect, m.value]
                  ])
                ]),
                e.createElementVNode("label", JS, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(h.$t("单据类型")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": K[2] || (K[2] = (T) => E.value = T),
                      dir: "ltr",
                      "data-test": "fau-erp-doctype"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      e.vModelText,
                      E.value,
                      void 0,
                      { trim: !0 }
                    ]
                  ])
                ])
              ]),
              e.createElementVNode("label", ZS, [
                e.createElementVNode("span", null, [
                  e.createTextVNode(
                    e.toDisplayString(h.$t("查询条件（JSON）")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("small", XS, [
                    e.createTextVNode(
                      e.toDisplayString(h.$t("占位符按项目期间代入")) + " ",
                      1
                      /* TEXT */
                    ),
                    K[8] || (K[8] = e.createElementVNode(
                      "bdi",
                      { dir: "ltr" },
                      "{from} {to} {year} {month}",
                      -1
                      /* CACHED */
                    ))
                  ])
                ]),
                e.withDirectives(e.createElementVNode(
                  "textarea",
                  {
                    "onUpdate:modelValue": K[3] || (K[3] = (T) => u.value = T),
                    dir: "ltr",
                    rows: "3",
                    "data-test": "fau-erp-filters"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, u.value]
                ])
              ]),
              e.createElementVNode(
                "p",
                xS,
                e.toDisplayString(h.$t("只调用只读查询；单次最多 {n} 行，被截断就判失败、不导入部分数据。取回后照上传文件同一步识别列、确认后导入。", { n: e.unref(zS) })),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", e8, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: n.value || !E.value,
                  "data-test": "fau-erp-pull",
                  onClick: b
                }, [
                  K[9] || (K[9] = e.createElementVNode(
                    "i",
                    { class: "ri-download-cloud-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(h.$t("取数")),
                    1
                    /* TEXT */
                  )
                ], 8, t8)
              ])
            ],
            64
            /* STABLE_FRAGMENT */
          )) : (e.openBlock(), e.createElementBlock(
            "p",
            WS,
            e.toDisplayString(h.$t("正在读取 ERP 状态…")),
            1
            /* TEXT */
          )),
          i.value ? (e.openBlock(), e.createElementBlock("p", l8, [
            K[10] || (K[10] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(i.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock("button", {
        key: 0,
        type: "button",
        class: "ss-link",
        "data-test": `fau-erp-open-${c.kind}`,
        onClick: v
      }, [
        K[4] || (K[4] = e.createElementVNode(
          "i",
          { class: "ri-database-2-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(h.$t("从 ERP 取数（只读）")),
          1
          /* TEXT */
        )
      ], 8, RS))
    ], 8, jS)) : e.createCommentVNode("v-if", !0);
  }
}), a8 = /* @__PURE__ */ ae(n8, [["__scopeId", "data-v-635593f7"]]), lt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/financeAudit/auditTables.ts"];
if (!lt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/financeAudit/auditTables.ts");
lt.default;
const o8 = ["data-test"], s8 = { class: "fau-panel fau-mhead" }, r8 = { class: "fau-row" }, i8 = { class: "fau-code" }, c8 = { class: "grow" }, d8 = { class: "fau-badge muted" }, u8 = { class: "ss-muted" }, m8 = { class: "fau-kv" }, p8 = ["value"], y8 = { value: "" }, N8 = ["value"], V8 = {
  key: 2,
  class: "fau-panel",
  "data-test": "fau-not-runnable"
}, E8 = {
  key: 0,
  class: "ss-note warn"
}, k8 = {
  key: 1,
  class: "ss-note info"
}, v8 = { class: "ss-actions" }, g8 = {
  key: 4,
  class: "fau-steps"
}, f8 = {
  key: 0,
  class: "ss-note warn"
}, h8 = { class: "fau-row" }, $8 = { class: "ss-muted" }, _8 = { class: "fau-seg" }, B8 = ["disabled", "data-test", "onClick"], b8 = { class: "fau-row" }, S8 = { class: "fau-badge muted" }, D8 = { class: "fau-badge muted" }, C8 = {
  key: 1,
  class: "fau-row"
}, w8 = { class: "ss-muted" }, T8 = ["value"], L8 = { value: "" }, K8 = ["value"], A8 = { class: "ss-actions" }, F8 = ["disabled"], I8 = {
  key: 1,
  class: "fau-badge ok"
}, P8 = {
  key: 0,
  class: "ss-muted"
}, O8 = ["data-test"], z8 = ["onClick"], M8 = ["data-test", "onClick"], j8 = {
  key: 0,
  class: "ss-note info"
}, R8 = {
  key: 1,
  class: "fau-row"
}, q8 = ["type", "name", "checked", "disabled", "onChange"], U8 = { class: "ss-muted" }, W8 = {
  key: 0,
  class: "fau-badge warn"
}, Y8 = { class: "ss-actions" }, G8 = ["disabled", "data-test", "onClick"], H8 = ["onClick"], Q8 = {
  key: 0,
  class: "fau-input",
  "data-test": "fau-bank-pairing"
}, J8 = {
  key: 0,
  class: "ss-note ok"
}, Z8 = ["onUpdate:modelValue", "disabled"], X8 = { value: "" }, x8 = ["value"], eD = {
  key: 1,
  class: "ss-actions"
}, tD = ["disabled"], lD = {
  key: 3,
  class: "ss-note warn"
}, nD = {
  key: 0,
  class: "ss-note warn"
}, aD = { class: "ss-actions" }, oD = ["disabled"], sD = { class: "ss-muted" }, rD = {
  key: 0,
  class: "fau-subs"
}, iD = { class: "ss-note warn" }, cD = {
  key: 0,
  class: "fau-row"
}, dD = { class: "fau-badge" }, uD = { class: "fau-badge" }, mD = { class: "fau-badge" }, pD = {
  key: 1,
  class: "fau-table-wrap",
  "data-test": "fau-verification"
}, yD = { class: "fau-table" }, ND = { class: "wrap" }, VD = {
  key: 0,
  class: "ss-muted"
}, ED = {
  key: 0,
  class: "ss-note ok",
  "data-test": "fau-archived"
}, kD = {
  key: 1,
  class: "ss-muted"
}, vD = {
  key: 2,
  class: "ss-actions"
}, gD = { class: "ss-muted" }, fD = ["data-test", "disabled", "title", "onClick"], hD = { key: 0 }, $D = {
  key: 5,
  class: "ss-note danger",
  "data-test": "fau-runner-error"
}, _D = {
  key: 1,
  class: "ss-note warn"
}, BD = /* @__PURE__ */ e.defineComponent({
  __name: "ModuleRunner",
  props: {
    moduleId: {},
    home: {},
    runId: {},
    step: {}
  },
  emits: ["home-changed"],
  setup(c, { emit: _ }) {
    const t = c, N = _, r = ye.useRouter(), n = { R: s.i18nKey("规则型"), S: s.i18nKey("技能型"), H: s.i18nKey("混合型"), P: s.i18nKey("平台") }, i = {
      draft: s.i18nKey("草稿"),
      running: s.i18nKey("进行中"),
      ready: s.i18nKey("待签核"),
      signing: s.i18nKey("签核中"),
      returned: s.i18nKey("被退回"),
      archived: s.i18nKey("已归档"),
      void: s.i18nKey("已作废")
    }, a = { high: s.i18nKey("高"), medium: s.i18nKey("中"), low: s.i18nKey("低") }, m = { todo: "ri-checkbox-blank-circle-line", running: "ri-loader-4-line spin", done: "ri-checkbox-circle-line", failed: "ri-close-circle-line", skipped: "ri-skip-forward-line" }, E = s.listSeparator(), u = e.computed(() => ie.moduleById(t.moduleId)), L = e.computed(() => !!u.value && u.value.status === "ready" && u.value.group !== "platform"), g = ft(), v = e.ref(null), b = e.ref(null), h = e.ref([]), K = e.ref([]), T = e.ref(null), z = e.ref(u.value?.modes[0]?.id || ""), S = e.ref(t.home.company?.outputLocale || "zh-CN"), w = e.reactive({}), p = e.reactive({}), f = e.ref(null), y = e.reactive({}), I = e.ref(""), B = e.ref(!1), k = e.ref(""), R = e.ref(!1), d = e.computed(() => ge.regionProfile(t.home.company?.region || "CN").name), M = e.computed(() => u.value && v.value ? ie.inputsForMode(u.value, v.value.modeId) : []), V = e.computed(() => !!v.value && ["draft", "returned"].includes(v.value.status) && !te.value), te = e.computed(() => !!v.value && Object.values(v.value.steps).some(($) => $.status === "running")), j = e.computed(() => (b.value?.missing || []).map(($) => s.t($))), W = e.computed(() => {
      const $ = v.value, F = {};
      for (const C of Se) F[C] = $ ? At($.steps[C]) : { state: "todo" };
      return $ || (F.setup = { state: "todo" }), F;
    }), U = e.computed(() => {
      const $ = v.value;
      if (!$) return "setup";
      const F = Se.find((C) => ["running", "failed", "blocked", "interrupted"].includes($.steps[C].status));
      return F || Se.find((C) => $.steps[C].status !== "done") || "archive";
    });
    e.watch(U, ($) => {
      Q.scrollToStep($);
    });
    function H($) {
      const F = u.value?.modes.find((C) => C.id === $);
      return F ? s.t(F.name) : $;
    }
    function ce($) {
      const F = ie.moduleById($);
      return F ? `${F.code} ${s.t(F.name)}` : $;
    }
    const ne = ($) => ie.moduleById($)?.status !== "ready", D = ($) => Le($), O = ($, F) => K.value.filter((C) => C.kind === $ && ($ !== "evidence" || !C.slot || !F || C.slot === F));
    async function P() {
      if (!u.value) return;
      const [$, F] = await Promise.all([Y("run.list", { moduleId: u.value.id }), Y("data.list")]);
      h.value = $.filter((C) => C.status !== "void"), K.value = F;
    }
    async function J($) {
      const F = await Y("run.get", { runId: $ });
      v.value = F.run, b.value = { nextLevel: F.nextLevel, active: F.active, missing: F.missing, running: F.running }, z.value = F.run.modeId, S.value = F.run.outputLocale;
      for (const C of Object.keys(w)) delete w[C];
      for (const [C, x] of Object.entries(F.run.inputs)) w[C] = [...x];
      if (F.run.moduleId === "recon" && F.run.modeId === "bank" && F.run.inputs.bank?.length && F.run.inputs.bankJournal?.length)
        try {
          f.value = await Y("recon.bankAccounts", { runId: $ });
        } catch {
          f.value = null;
        }
      else f.value = null;
    }
    async function X() {
      k.value = "";
      try {
        await P(), v.value && await J(v.value.id), N("home-changed");
      } catch ($) {
        k.value = Q.errorMessage($);
      }
    }
    async function de($) {
      if (!$) {
        v.value = null, b.value = null, r.replace({ query: {} });
        return;
      }
      await J($), r.replace({ query: { run: $ } });
    }
    function he($) {
      r.push({ path: `/workbenches/finance-audit/m/${t.moduleId}`, query: { run: $ } });
    }
    async function oe($) {
      B.value = !0, k.value = "";
      try {
        await $();
      } catch (F) {
        k.value = Q.errorMessage(F);
      } finally {
        B.value = !1;
      }
    }
    function re() {
      return oe(async () => {
        const $ = await Y("run.create", { moduleId: t.moduleId, modeId: z.value, outputLocale: S.value });
        await P(), await de($.id);
      });
    }
    async function Ne($, F) {
      if ($.kind === "evidence") {
        await oe(async () => {
          const C = [];
          for (const x of F) C.push((await Y("data.import", { path: x, kind: $.kind, slot: $.id, moduleId: t.moduleId })).id);
          await Ve({ ...w, [$.id]: [...w[$.id] || [], ...C] });
        });
        return;
      }
      p[$.id] = { path: F[0], inspect: null }, await _e($);
    }
    async function _e($, F, C) {
      const x = p[$.id];
      x && await oe(async () => {
        x.inspect = await Y("data.inspect", { path: x.path, kind: $.kind, mapping: F ?? x.inspect?.mapping, sheet: C ?? x.inspect?.sheetName });
      });
    }
    function je($) {
      const F = p[$.id];
      return F ? oe(async () => {
        const C = await Y("data.import", { path: F.path, kind: $.kind, slot: $.id, moduleId: t.moduleId, mapping: F.inspect?.mapping, sheet: F.inspect?.sheetName });
        delete p[$.id], await Ve({ ...w, [$.id]: $.multi ? [...w[$.id] || [], C.id] : [C.id] });
      }) : Promise.resolve();
    }
    async function Ve($, F) {
      v.value && (await Y("run.setInputs", { runId: v.value.id, inputs: $, params: F }), await X());
    }
    function ke($, F, C) {
      const x = w[$] || [], at = C ? x.includes(F) ? x.filter((Lt) => Lt !== F) : [...x, F] : x.includes(F) ? [] : [F];
      return oe(() => Ve({ ...w, [$]: at }));
    }
    function A($) {
      return oe(async () => {
        const F = await Y("audit.template", { moduleId: t.moduleId, slot: $.id, locale: S.value });
        await Y("artifact.reveal", { path: F.path });
      });
    }
    function q() {
      const $ = [...f.value?.pairing.pairs || [], ...Object.entries(y).filter(([, F]) => F).map(([F, C]) => ({ bookAccount: C, bankAccount: F }))];
      return oe(() => Ve({ ...w }, { accountPairs: $ }));
    }
    function G() {
      return oe(async () => {
        await Y("run.start", { runId: v.value.id }), await X(), Q.scrollToStep("validate");
      });
    }
    async function le($) {
      await oe(async () => {
        await Y("run.retry", { runId: v.value.id, fromStep: $ }), await X();
      });
    }
    async function Ee() {
      v.value && await Y("run.cancel", { runId: v.value.id });
    }
    function wt($) {
      return oe(async () => {
        await Y("handoff.send", { fromRunId: v.value.id, toModuleId: $ }), N("home-changed");
      });
    }
    async function Tt($) {
      await oe(async () => {
        await Y("settings.patch", { moduleModels: { ...t.home.settings.moduleModels, [t.moduleId]: $ } }), N("home-changed");
      });
    }
    let nt = null, Be = null;
    return e.onMounted(async () => {
      nt = gt(($) => {
        if ($.type === "todo.changed") {
          P().catch(() => {
          });
          return;
        }
        ($.type === "run.progress" || $.type === "run.state") && $.runId === v.value?.id && (Be && clearTimeout(Be), Be = setTimeout(() => {
          J($.runId).catch(() => {
          });
        }, 150));
      });
      try {
        await P();
        const $ = t.runId || h.value.find((F) => !["archived", "void"].includes(F.status))?.id;
        $ && await J($), t.step && Q.scrollToStep(t.step);
      } catch ($) {
        k.value = Q.errorMessage($);
      }
      Y("models.list").then(($) => {
        T.value = $;
      }).catch(() => {
      });
    }), e.onBeforeUnmount(() => {
      nt?.(), Be && clearTimeout(Be);
    }), e.watch(() => t.runId, ($) => {
      $ && $ !== v.value?.id && J($).catch((F) => {
        k.value = Q.errorMessage(F);
      });
    }), ($, F) => u.value ? (e.openBlock(), e.createElementBlock("div", {
      key: 0,
      class: "fau-runner ss-module",
      "data-test": `fau-module-${u.value.id}`
    }, [
      e.createCommentVNode(" ModuleHeader "),
      e.createElementVNode("section", s8, [
        e.createElementVNode("div", r8, [
          e.createElementVNode(
            "span",
            i8,
            e.toDisplayString(u.value.code),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "h2",
            c8,
            e.toDisplayString($.$t(u.value.name)),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            d8,
            e.toDisplayString($.$t(n[u.value.archetype])),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            "data-test": "fau-judgement",
            onClick: F[0] || (F[0] = (C) => R.value = !0)
          }, [
            F[7] || (F[7] = e.createElementVNode(
              "i",
              { class: "ri-scales-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString($.$t("判断依据")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode(
          "p",
          u8,
          e.toDisplayString($.$t(u.value.summary)),
          1
          /* TEXT */
        ),
        e.createElementVNode("dl", m8, [
          e.createElementVNode(
            "dt",
            null,
            e.toDisplayString($.$t("输出物")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "dd",
            null,
            e.toDisplayString(u.value.outputs.map((C) => e.unref($t)[C] || C).join(" / ")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "dt",
            null,
            e.toDisplayString($.$t("适用地区与准则")),
            1
            /* TEXT */
          ),
          e.createElementVNode("dd", null, [
            e.createTextVNode(
              e.toDisplayString(u.value.regions === "all" ? $.$t("全部地区") : u.value.regions.join(" / ")),
              1
              /* TEXT */
            ),
            u.value.standards?.length ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createTextVNode(
                  " · " + e.toDisplayString(u.value.standards.map((C) => $.$t(e.unref(ge.STANDARD_LABELS)[C] || C)).join(" / ")),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode(
            "dt",
            null,
            e.toDisplayString($.$t("来源能力")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "dd",
            null,
            e.toDisplayString(e.unref(Ot)(u.value.provenance, e.unref(E))),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "dt",
            null,
            e.toDisplayString($.$t("本模块模型")),
            1
            /* TEXT */
          ),
          e.createElementVNode("dd", null, [
            e.createElementVNode("select", {
              value: c.home.settings.moduleModels[u.value.id] || "",
              "data-test": "fau-model",
              onChange: F[1] || (F[1] = (C) => Tt(C.target.value))
            }, [
              e.createElementVNode(
                "option",
                y8,
                e.toDisplayString($.$t("系统默认（{p0}）", { p0: T.value?.defaultLabel || "-" })),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(T.value?.options || [], (C) => (e.openBlock(), e.createElementBlock("option", {
                  key: C.value,
                  value: C.value
                }, e.toDisplayString(C.group ? `${C.group} · ` : "") + e.toDisplayString(C.label), 9, N8))),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 40, p8)
          ])
        ])
      ]),
      e.createCommentVNode(" 规划中 / 平台模块：没有七步流程，直接说明（从 URL 直达时不让人点出主进程报错） "),
      u.value.id === "office-output" && u.value.status === "ready" ? (e.openBlock(), e.createBlock(AS, {
        key: 0,
        home: c.home
      }, null, 8, ["home"])) : u.value.group === "platform" && u.value.status === "ready" && e.unref(Ie)[u.value.id] ? (e.openBlock(), e.createBlock(e.resolveDynamicComponent(e.unref(Ie)[u.value.id]), { key: 1 })) : L.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("section", V8, [
        u.value.status !== "ready" ? (e.openBlock(), e.createElementBlock("p", E8, [
          F[8] || (F[8] = e.createElementVNode(
            "i",
            { class: "ri-time-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString($.$t("这个模块即将上线，上方「来源能力」列出了它整合的开源能力")),
            1
            /* TEXT */
          )
        ])) : (e.openBlock(), e.createElementBlock("p", k8, [
          F[9] || (F[9] = e.createElementVNode(
            "i",
            { class: "ri-information-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString($.$t("这个模块在工作台首页使用：配置向导、项目空间、数据管理")),
            1
            /* TEXT */
          )
        ])),
        e.createElementVNode("div", v8, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            onClick: F[2] || (F[2] = (C) => e.unref(r).push("/workbenches/finance-audit"))
          }, [
            F[10] || (F[10] = e.createElementVNode(
              "i",
              { class: "ri-arrow-go-back-line fau-dir-icon" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString($.$t("回到首页")),
              1
              /* TEXT */
            )
          ])
        ])
      ])),
      L.value ? (e.openBlock(), e.createBlock(Je, {
        key: 3,
        title: `${u.value.code} · ${$.$t(u.value.name)}`,
        metas: e.unref(g),
        runtime: W.value,
        "current-key": U.value,
        onJump: e.unref(Q.scrollToStep)
      }, null, 8, ["title", "metas", "runtime", "current-key", "onJump"])) : e.createCommentVNode("v-if", !0),
      L.value ? (e.openBlock(), e.createElementBlock("div", g8, [
        e.createCommentVNode(" ① 选择项目与模式 "),
        e.createVNode(se, {
          "step-key": "setup",
          index: 0,
          title: e.unref(g)[0].title,
          hint: e.unref(g)[0].hint,
          runtime: W.value.setup,
          "is-current": U.value === "setup"
        }, {
          default: e.withCtx(() => [
            c.home.project?.status === "archived" ? (e.openBlock(), e.createElementBlock("p", f8, [
              F[11] || (F[11] = e.createElementVNode(
                "i",
                { class: "ri-lock-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString($.$t("项目已归档，只读；请新建项目")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", h8, [
              e.createElementVNode(
                "span",
                $8,
                e.toDisplayString($.$t("场景模式")),
                1
                /* TEXT */
              ),
              e.createElementVNode("span", _8, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(u.value.modes, (C) => (e.openBlock(), e.createElementBlock("button", {
                    key: C.id,
                    type: "button",
                    class: e.normalizeClass({ on: z.value === C.id }),
                    disabled: !!v.value && v.value.status !== "draft",
                    "data-test": `fau-mode-${C.id}`,
                    onClick: (x) => z.value = C.id
                  }, e.toDisplayString($.$t(C.name)), 11, B8))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            e.createElementVNode("div", b8, [
              e.createVNode(Me, {
                modelValue: S.value,
                "onUpdate:modelValue": F[3] || (F[3] = (C) => S.value = C),
                disabled: !!v.value
              }, null, 8, ["modelValue", "disabled"]),
              e.createElementVNode("span", S8, [
                e.createTextVNode(
                  e.toDisplayString($.$t("期间")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: c.home.project?.period
                }, null, 8, ["value"])
              ]),
              e.createElementVNode(
                "span",
                D8,
                e.toDisplayString($.$t(d.value)) + " · " + e.toDisplayString($.$t(e.unref(ge.STANDARD_LABELS)[c.home.company?.standard || "CAS"] || "")),
                1
                /* TEXT */
              )
            ]),
            h.value.length ? (e.openBlock(), e.createElementBlock("div", C8, [
              e.createElementVNode(
                "span",
                w8,
                e.toDisplayString($.$t("继续本项目里的运行")),
                1
                /* TEXT */
              ),
              e.createElementVNode("select", {
                value: v.value?.id || "",
                "data-test": "fau-run-select",
                onChange: F[4] || (F[4] = (C) => de(C.target.value))
              }, [
                e.createElementVNode(
                  "option",
                  L8,
                  e.toDisplayString($.$t("新建一次运行")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(h.value, (C) => (e.openBlock(), e.createElementBlock("option", {
                    key: C.id,
                    value: C.id
                  }, e.toDisplayString(H(C.modeId)) + " · " + e.toDisplayString($.$t(i[C.status] || C.status)) + " · " + e.toDisplayString(D(C.updatedAt)), 9, K8))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 40, T8)
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", A8, [
              v.value ? (e.openBlock(), e.createElementBlock(
                "span",
                I8,
                e.toDisplayString($.$t("本次运行：{p0}", { p0: H(v.value.modeId) })) + " · " + e.toDisplayString($.$t(e.unref(ht)[v.value.outputLocale])),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn primary",
                disabled: B.value || c.home.project?.status === "archived",
                "data-test": "fau-run-create",
                onClick: re
              }, [
                F[12] || (F[12] = e.createElementVNode(
                  "i",
                  { class: "ri-play-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString($.$t("开始这次运行")),
                  1
                  /* TEXT */
                )
              ], 8, F8))
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ② 上传数据 "),
        e.createVNode(se, {
          "step-key": "upload",
          index: 1,
          title: e.unref(g)[1].title,
          hint: e.unref(g)[1].hint,
          runtime: W.value.upload,
          "is-current": U.value === "upload"
        }, {
          default: e.withCtx(() => [
            v.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(M.value, (C) => (e.openBlock(), e.createElementBlock("div", {
                    key: C.id,
                    class: e.normalizeClass(["fau-input", { need: C.needed, ok: (w[C.id] || []).length > 0 }]),
                    "data-test": `fau-input-${C.id}`
                  }, [
                    e.createElementVNode("header", null, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString($.$t(C.label)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["fau-badge", C.needed ? "warn" : "muted"])
                        },
                        e.toDisplayString(C.needed ? $.$t("必需") : $.$t("可选")),
                        3
                        /* TEXT, CLASS */
                      ),
                      F[13] || (F[13] = e.createElementVNode(
                        "span",
                        { class: "grow" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        onClick: (x) => I.value = I.value === C.id ? "" : C.id
                      }, e.toDisplayString($.$t("怎么导出这份数据")), 9, z8),
                      e.unref(lt.hasTemplate)(u.value.id, C.id) ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-link",
                        "data-test": `fau-template-${C.id}`,
                        onClick: (x) => A(C)
                      }, e.toDisplayString($.$t("下载模板")), 9, M8)) : e.createCommentVNode("v-if", !0)
                    ]),
                    I.value === C.id ? (e.openBlock(), e.createElementBlock("p", j8, [
                      F[14] || (F[14] = e.createElementVNode(
                        "i",
                        { class: "ri-question-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString($.$t(C.help)) + " " + e.toDisplayString(e.unref(It)(C.kind, c.home.company?.erp || "other")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    O(C.kind, C.id).length ? (e.openBlock(), e.createElementBlock("div", R8, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(O(C.kind, C.id), (x) => (e.openBlock(), e.createElementBlock("label", {
                          key: x.id,
                          class: "fau-ds"
                        }, [
                          e.createElementVNode("input", {
                            type: C.multi ? "checkbox" : "radio",
                            name: `slot-${C.id}`,
                            checked: (w[C.id] || []).includes(x.id),
                            disabled: !V.value,
                            onChange: (at) => ke(C.id, x.id, !!C.multi)
                          }, null, 40, q8),
                          e.createTextVNode(
                            " " + e.toDisplayString(x.label) + " ",
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            U8,
                            e.toDisplayString($.$t("{n} 行", { n: x.rowCount })),
                            1
                            /* TEXT */
                          ),
                          x.issues.length ? (e.openBlock(), e.createElementBlock(
                            "span",
                            W8,
                            e.toDisplayString(x.issues.length),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : e.createCommentVNode("v-if", !0),
                    V.value ? (e.openBlock(), e.createBlock(bt, {
                      key: 2,
                      label: $.$t("上传：{p0}", { p0: $.$t(C.label) }),
                      kind: C.kind,
                      multi: C.kind === "evidence",
                      onPicked: (x) => Ne(C, x)
                    }, null, 8, ["label", "kind", "multi", "onPicked"])) : e.createCommentVNode("v-if", !0),
                    V.value ? (e.openBlock(), e.createBlock(a8, {
                      key: 3,
                      kind: C.kind,
                      onPicked: (x) => Ne(C, x)
                    }, null, 8, ["kind", "onPicked"])) : e.createCommentVNode("v-if", !0),
                    p[C.id] ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 4 },
                      [
                        p[C.id].inspect ? (e.openBlock(), e.createBlock(Ze, {
                          key: 0,
                          table: p[C.id].inspect,
                          roles: p[C.id].inspect.roles.map((x) => ({ ...x, label: $.$t(x.label) })),
                          onUpdate: (x) => _e(C, x),
                          onSheet: (x) => _e(C, void 0, x)
                        }, null, 8, ["table", "roles", "onUpdate", "onSheet"])) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode("div", Y8, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn primary sm",
                            disabled: B.value || !!p[C.id].inspect?.missing.length,
                            "data-test": `fau-import-${C.id}`,
                            onClick: (x) => je(C)
                          }, [
                            F[15] || (F[15] = e.createElementVNode(
                              "i",
                              { class: "ri-download-2-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString($.$t("确认导入")),
                              1
                              /* TEXT */
                            )
                          ], 8, G8),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn ghost sm",
                            onClick: (x) => delete p[C.id]
                          }, e.toDisplayString($.$t("取消")), 9, H8)
                        ])
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0)
                  ], 10, O8))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                u.value.id === "recon" && v.value.modeId === "bank" && f.value ? (e.openBlock(), e.createElementBlock("div", Q8, [
                  e.createElementVNode("header", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString($.$t("银行账户配对")),
                      1
                      /* TEXT */
                    )
                  ]),
                  !f.value.pairing.unpairedBook.length && !f.value.pairing.unpairedBank.length ? (e.openBlock(), e.createElementBlock("p", J8, [
                    F[16] || (F[16] = e.createElementVNode(
                      "i",
                      { class: "ri-links-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString($.$t("已自动配对 {n} 个账户", { n: f.value.pairing.pairs.length })),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(f.value.pairing.unpairedBank, (C) => (e.openBlock(), e.createElementBlock("div", {
                      key: C,
                      class: "fau-row"
                    }, [
                      e.createVNode(l, { value: C }, null, 8, ["value"]),
                      F[17] || (F[17] = e.createTextVNode(
                        " ↔ ",
                        -1
                        /* CACHED */
                      )),
                      e.withDirectives(e.createElementVNode("select", {
                        "onUpdate:modelValue": (x) => y[C] = x,
                        disabled: !V.value
                      }, [
                        e.createElementVNode(
                          "option",
                          X8,
                          e.toDisplayString($.$t("请选择…")),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(f.value.book, (x) => (e.openBlock(), e.createElementBlock("option", {
                            key: x.code,
                            value: x.code
                          }, e.toDisplayString(x.code) + " " + e.toDisplayString(x.name), 9, x8))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ], 8, Z8), [
                        [e.vModelSelect, y[C]]
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  f.value.pairing.unpairedBank.length ? (e.openBlock(), e.createElementBlock("div", eD, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      disabled: B.value,
                      onClick: q
                    }, e.toDisplayString($.$t("保存配对")), 9, tD)
                  ])) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0),
                e.createCommentVNode(" 批次 4：税务组的申报参数与模板 "),
                u.value.group === "tax" ? (e.openBlock(), e.createBlock(fc, {
                  key: 1,
                  run: v.value,
                  def: u.value,
                  editable: V.value,
                  onSave: F[5] || (F[5] = (C) => oe(() => Ve({ ...w }, C)))
                }, null, 8, ["run", "def", "editable"])) : e.createCommentVNode("v-if", !0),
                e.unref(mt)[u.value.id] ? (e.openBlock(), e.createBlock(e.resolveDynamicComponent(e.unref(mt)[u.value.id]), {
                  key: 2,
                  run: v.value,
                  def: u.value,
                  editable: V.value,
                  onChanged: X
                }, null, 40, ["run", "def", "editable"])) : e.createCommentVNode("v-if", !0),
                v.value.steps.upload.status !== "done" && j.value.length ? (e.openBlock(), e.createElementBlock("p", lD, [
                  F[18] || (F[18] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString($.$t("还缺：{p0}", { p0: j.value.join(e.unref(E)) })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              P8,
              e.toDisplayString($.$t("先完成第 1 步")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ③ 校验 "),
        e.createVNode(se, {
          "step-key": "validate",
          index: 2,
          title: e.unref(g)[2].title,
          hint: e.unref(g)[2].hint,
          runtime: W.value.validate,
          "is-current": U.value === "validate",
          retry: v.value ? () => le("validate") : void 0,
          cancel: Ee
        }, {
          default: e.withCtx(() => [
            v.value && j.value.length ? (e.openBlock(), e.createElementBlock("p", nD, [
              F[19] || (F[19] = e.createElementVNode(
                "i",
                { class: "ri-forbid-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString($.$t("必需数据还缺：{p0}，补齐后才能校验", { p0: j.value.join(e.unref(E)) })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", aD, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !v.value || B.value || j.value.length > 0 || te.value || !V.value,
                "data-test": "fau-run-start",
                onClick: G
              }, [
                F[20] || (F[20] = e.createElementVNode(
                  "i",
                  { class: "ri-play-circle-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString($.$t("开始校验并计算")),
                  1
                  /* TEXT */
                )
              ], 8, oD),
              e.createElementVNode(
                "span",
                sD,
                e.toDisplayString($.$t("校验、计算、生成底稿会连续跑完；有阻断项会停在这一步")),
                1
                /* TEXT */
              )
            ]),
            v.value?.validation ? (e.openBlock(), e.createBlock(Po, {
              key: 1,
              report: v.value.validation
            }, null, 8, ["report"])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry"]),
        e.createCommentVNode(" ④ 分析 / 计算 "),
        e.createVNode(se, {
          "step-key": "analyze",
          index: 3,
          title: e.unref(g)[3].title,
          hint: e.unref(g)[3].hint,
          runtime: W.value.analyze,
          "is-current": U.value === "analyze",
          retry: v.value ? () => le("analyze") : void 0,
          cancel: Ee
        }, {
          default: e.withCtx(() => [
            v.value?.steps.analyze.sub?.length ? (e.openBlock(), e.createElementBlock("ul", rD, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(v.value.steps.analyze.sub, (C) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: C.id,
                    class: e.normalizeClass(C.status)
                  },
                  [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(m[C.status])
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(e.unref(Z)(C.label)),
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
            v.value?.result && u.value.id === "close" ? (e.openBlock(), e.createBlock(Kr, {
              key: 1,
              run: v.value,
              def: u.value,
              onChanged: X
            }, null, 8, ["run", "def"])) : v.value?.result && u.value.id === "recon" ? (e.openBlock(), e.createBlock(Ki, {
              key: 2,
              run: v.value,
              onOpenRun: he
            }, null, 8, ["run"])) : v.value?.result && u.value.group === "fpa" ? (e.openBlock(), e.createBlock(sc, {
              key: 3,
              run: v.value
            }, null, 8, ["run"])) : v.value?.result && u.value.group === "tax" ? (e.openBlock(), e.createBlock(fu, {
              key: 4,
              run: v.value,
              def: u.value,
              editable: V.value,
              onChanged: X
            }, null, 8, ["run", "def", "editable"])) : v.value?.result && e.unref(Ie)[u.value.id] ? (e.openBlock(), e.createBlock(e.resolveDynamicComponent(e.unref(Ie)[u.value.id]), {
              key: 5,
              run: v.value,
              def: u.value,
              onChanged: X,
              onOpenRun: he
            }, null, 40, ["run", "def"])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry"]),
        e.createCommentVNode(" ⑤ 生成底稿 "),
        e.createVNode(se, {
          "step-key": "draft",
          index: 4,
          title: e.unref(g)[4].title,
          hint: e.unref(g)[4].hint,
          runtime: W.value.draft,
          "is-current": U.value === "draft",
          retry: v.value ? () => le("draft") : void 0,
          cancel: Ee
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", iD, [
              F[21] || (F[21] = e.createElementVNode(
                "i",
                { class: "ri-draft-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString($.$t("全部为草稿，带「草稿—待签核」水印；签核后归档区放签核时的副本")),
                1
                /* TEXT */
              )
            ]),
            v.value?.confidence ? (e.openBlock(), e.createElementBlock("div", cD, [
              e.createElementVNode(
                "span",
                dD,
                e.toDisplayString($.$t("数据完整度")) + ": " + e.toDisplayString($.$t(a[v.value.confidence.data])),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                uD,
                e.toDisplayString($.$t("方案成熟度")) + ": " + e.toDisplayString($.$t(a[v.value.confidence.method])),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                mD,
                e.toDisplayString($.$t("整体置信度")) + ": " + e.toDisplayString($.$t(a[v.value.confidence.overall])),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            v.value?.verification.length ? (e.openBlock(), e.createElementBlock("div", pD, [
              e.createElementVNode("table", yD, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString($.$t("回核报告")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString($.$t("结果")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(v.value.verification, (C) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: C.id,
                        class: e.normalizeClass({ bad: C.status === "unverified" })
                      },
                      [
                        e.createElementVNode("td", ND, [
                          e.createTextVNode(
                            e.toDisplayString(C.text),
                            1
                            /* TEXT */
                          ),
                          C.missing?.length ? (e.openBlock(), e.createElementBlock("small", VD, [
                            F[22] || (F[22] = e.createElementVNode(
                              "br",
                              null,
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString($.$t("数据里找不到")) + ": ",
                              1
                              /* TEXT */
                            ),
                            e.createVNode(l, {
                              value: C.missing.join(", ")
                            }, null, 8, ["value"])
                          ])) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["fau-badge", C.status === "verified" ? "ok" : "bad"])
                            },
                            e.toDisplayString(C.status === "verified" ? $.$t("已核实") : $.$t("未核实")),
                            3
                            /* TEXT, CLASS */
                          )
                        ])
                      ],
                      2
                      /* CLASS */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            v.value ? (e.openBlock(), e.createBlock(ba, {
              key: 2,
              artifacts: v.value.artifacts,
              archived: v.value.status === "archived"
            }, null, 8, ["artifacts", "archived"])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry"]),
        e.createCommentVNode(" ⑥ 人工签核 "),
        e.createVNode(se, {
          "step-key": "signoff",
          index: 5,
          title: e.unref(g)[5].title,
          hint: e.unref(g)[5].hint,
          runtime: W.value.signoff,
          "is-current": U.value === "signoff"
        }, {
          default: e.withCtx(() => [
            v.value && c.home.company && b.value ? (e.openBlock(), e.createBlock(So, {
              key: 0,
              run: v.value,
              company: c.home.company,
              active: b.value.active,
              "next-level": b.value.nextLevel,
              "base-levels": u.value.signoff.levels,
              onChanged: X
            }, null, 8, ["run", "company", "active", "next-level", "base-levels"])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ⑦ 归档与转交 "),
        e.createVNode(se, {
          "step-key": "archive",
          index: 6,
          title: e.unref(g)[6].title,
          hint: e.unref(g)[6].hint,
          runtime: W.value.archive,
          "is-current": U.value === "archive"
        }, {
          default: e.withCtx(() => [
            v.value?.status === "archived" ? (e.openBlock(), e.createElementBlock("p", ED, [
              F[23] || (F[23] = e.createElementVNode(
                "i",
                { class: "ri-archive-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString($.$t("已归档：文件、签核页、数据集快照与哈希清单在项目归档区")),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              kD,
              e.toDisplayString($.$t("最后一级签核通过后自动归档")),
              1
              /* TEXT */
            )),
            u.value.handoffTo?.length ? (e.openBlock(), e.createElementBlock("div", vD, [
              e.createElementVNode(
                "span",
                gD,
                e.toDisplayString($.$t("转交下游模块")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(u.value.handoffTo, (C) => (e.openBlock(), e.createElementBlock("button", {
                  key: C,
                  type: "button",
                  class: "ss-btn sm",
                  "data-test": `fau-handoff-${C}`,
                  disabled: B.value || v.value?.status !== "archived" || ne(C),
                  title: ne(C) ? $.$t("即将上线") : "",
                  onClick: (x) => wt(C)
                }, [
                  F[24] || (F[24] = e.createElementVNode(
                    "i",
                    { class: "ri-share-forward-line fau-dir-icon" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(ce(C)),
                    1
                    /* TEXT */
                  ),
                  ne(C) ? (e.openBlock(), e.createElementBlock(
                    "small",
                    hD,
                    " · " + e.toDisplayString($.$t("即将上线")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ], 8, fD))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"])
      ])) : e.createCommentVNode("v-if", !0),
      k.value ? (e.openBlock(), e.createElementBlock("p", $D, [
        F[25] || (F[25] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(k.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createVNode(za, {
        open: R.value,
        modules: [u.value.id],
        currency: c.home.company?.currency,
        onClose: F[6] || (F[6] = (C) => R.value = !1)
      }, null, 8, ["open", "modules", "currency"])
    ], 8, o8)) : (e.openBlock(), e.createElementBlock("p", _D, [
      F[26] || (F[26] = e.createElementVNode(
        "i",
        { class: "ri-error-warning-line" },
        null,
        -1
        /* CACHED */
      )),
      e.createTextVNode(
        e.toDisplayString($.$t("未知模块：{p0}", { p0: c.moduleId })),
        1
        /* TEXT */
      )
    ]));
  }
}), bD = /* @__PURE__ */ ae(BD, [["__scopeId", "data-v-98a100ef"]]), SD = {
  class: "fau-page",
  "data-test": "fau-workbench"
}, DD = { class: "fau-head" }, CD = { class: "grow" }, wD = { class: "fau-sub" }, TD = ["disabled"], LD = {
  key: 0,
  class: "ss-note danger"
}, KD = {
  key: 1,
  class: "ss-note"
}, AD = {
  class: "fau-bar",
  "data-test": "fau-topbar"
}, FD = { class: "fau-row" }, ID = { class: "ss-muted" }, PD = ["value"], OD = ["value"], zD = { value: "__new" }, MD = {
  class: "fau-badge",
  "data-test": "fau-region-badge"
}, jD = { class: "fau-row" }, RD = { class: "ss-muted" }, qD = ["value"], UD = ["value"], WD = ["disabled"], YD = { class: "fau-boundary" }, GD = {
  key: 0,
  class: "ss-note warn fau-hint",
  "data-test": "fau-sample-banner"
}, HD = { class: "grow" }, QD = ["disabled"], JD = {
  key: 1,
  class: "ss-note info fau-hint",
  "data-test": "fau-defaults-hint"
}, ZD = { class: "grow" }, XD = ["aria-label"], xD = {
  key: 2,
  class: "fau-panel",
  "data-test": "fau-first-project"
}, eC = { class: "ss-muted" }, tC = { class: "ss-actions" }, lC = ["disabled"], nC = { class: "fau-panels" }, aC = {
  class: "fau-panel",
  "data-test": "fau-todos"
}, oC = {
  key: 0,
  class: "fau-list"
}, sC = ["data-test", "onClick"], rC = { class: "grow" }, iC = {
  key: 1,
  class: "ss-muted"
}, cC = {
  class: "fau-panel",
  "data-test": "fau-queue"
}, dC = {
  class: "fau-panel",
  "data-test": "fau-close-progress"
}, uC = { class: "fau-row" }, mC = { class: "grow" }, pC = { class: "fau-row" }, yC = { class: "grow" }, NC = { class: "fau-row" }, VC = { class: "grow" }, EC = {
  key: 1,
  class: "ss-muted"
}, kC = { class: "ss-actions" }, vC = {
  class: "ss-muted fau-overview",
  "data-test": "fau-overview"
}, gC = {
  class: "fau-groups",
  "data-test": "fau-modules"
}, fC = { class: "fau-badge muted" }, hC = {
  key: 0,
  class: "ss-muted"
}, $C = { class: "fau-mods" }, _C = { class: "fau-code" }, BC = { class: "fau-mod-foot" }, bC = {
  key: 0,
  class: "fau-badge ok"
}, SC = ["data-test", "data-batch"], DC = {
  class: "fau-panel",
  "data-test": "fau-recent"
}, CC = {
  key: 0,
  class: "fau-list"
}, wC = ["onClick"], TC = { class: "grow" }, LC = {
  key: 1,
  class: "ss-muted"
}, KC = ["aria-label"], AC = { class: "fau-drawer__body" }, FC = { class: "ss-muted" }, IC = { class: "fau-table-wrap" }, PC = { class: "fau-table" }, OC = { class: "num" }, zC = { class: "wrap" }, MC = {
  key: 0,
  class: "ss-muted"
}, jC = { class: "num" }, RC = ["onClick"], qC = { class: "fau-row" }, UC = { value: "" }, WC = ["value"], YC = ["disabled"], GC = {
  key: 0,
  class: "ss-note danger"
}, HC = {
  key: 5,
  class: "ss-note danger"
}, pt = "totalclaw:finance-audit:capital-open:v1", yt = "totalclaw:finance-audit:defaults-hint-closed:v1:", QC = /* @__PURE__ */ e.defineComponent({
  __name: "FinanceAuditWorkbenchView",
  setup(c) {
    const _ = ye.useRoute(), t = ye.useRouter(), N = ue.FAU_GROUPS, r = e.ref(null), n = e.ref([]), i = e.ref(!1), a = e.ref(!1), m = e.ref(""), E = e.ref(""), u = e.ref(!1), L = e.ref(""), g = s.listSeparator(), v = e.ref(null), b = e.ref(!1), h = e.ref([]), K = e.ref([]), T = e.ref(""), z = e.ref(""), S = e.ref(""), w = e.computed(() => String(_.params.moduleId || "")), p = e.computed(() => ge.regionProfile(r.value?.company?.region || "CN").name), f = (A) => A.split(/[\\/]/).pop() || A, y = (A) => A === "capital", I = e.ref(B());
    function B() {
      try {
        return localStorage.getItem(pt) === "1";
      } catch {
        return !1;
      }
    }
    function k(A) {
      I.value = A.target.open;
      try {
        localStorage.setItem(pt, I.value ? "1" : "0");
      } catch {
      }
    }
    const R = e.computed(() => n.value.filter((A) => A.status === "ready").length), d = e.computed(() => n.value.length - R.value), M = e.computed(() => {
      const A = r.value?.company;
      return A?.quickStart ? [
        { step: "standard", label: s.i18nKey("准则与科目映射"), left: !A.accountMapConfirmed },
        { step: "erp", label: s.i18nKey("ERP 与数据来源"), left: A.erp === "other" },
        { step: "thresholds", label: s.i18nKey("重要性水平与阈值"), left: !Object.keys(A.thresholds).length },
        { step: "signers", label: s.i18nKey("签核人与岗位"), left: !A.signers.length }
      ].filter((q) => q.left) : [];
    }), V = e.ref(""), te = e.computed(() => {
      const A = r.value?.company?.id || "";
      if (V.value === A) return !0;
      try {
        return localStorage.getItem(yt + A) === "1";
      } catch {
        return !1;
      }
    });
    function j() {
      const A = r.value?.company?.id || "";
      V.value = A;
      try {
        localStorage.setItem(yt + A, "1");
      } catch {
      }
    }
    function W(A) {
      L.value = A, u.value = "edit";
    }
    function U(A) {
      return n.value.filter((q) => q.group === A && q.applicable && q.visible);
    }
    async function H() {
      i.value = !0;
      try {
        const [A, q] = await Promise.all([Y("home.get"), Y("catalog.get")]);
        r.value = A, n.value = q, m.value = "", z.value || (z.value = A.project?.period || De());
      } catch (A) {
        m.value = Q.errorMessage(A);
      } finally {
        i.value = !1;
      }
    }
    async function ce(A) {
      a.value = !0, E.value = "";
      try {
        await A();
      } catch (q) {
        E.value = Q.errorMessage(q);
      } finally {
        a.value = !1;
      }
    }
    async function ne() {
      u.value = !1, L.value = "", await H();
    }
    function D() {
      return ce(async () => {
        await Y("sample.open"), u.value = !1, L.value = "", w.value && await t.push("/workbenches/finance-audit"), await H();
      });
    }
    function O() {
      return ce(async () => {
        await Y("sample.remove"), w.value && await t.push("/workbenches/finance-audit"), await H();
      });
    }
    function P(A) {
      return A === "__new" ? (u.value = "new", Promise.resolve()) : ce(async () => {
        await Y("company.switch", { id: A }), await H();
      });
    }
    function J(A) {
      return ce(async () => {
        await Y("company.save", { company: { ...r.value.company, outputLocale: A } }), await H();
      });
    }
    function X(A) {
      return ce(async () => {
        await Y("settings.patch", { bundle: A }), await H();
      });
    }
    function de() {
      return ce(async () => {
        await Y("project.create", { type: "month_close", period: De() }), await H();
      });
    }
    function he(A) {
      t.push({ path: `/workbenches/finance-audit/m/${A.moduleId}`, query: { ...A.runId ? { run: A.runId } : {}, ...A.step ? { step: A.step } : {} } });
    }
    async function oe(A) {
      if (A.id === "setup") {
        u.value = "edit";
        return;
      }
      if (A.id === "projects") {
        await v.value?.openDetail();
        return;
      }
      if (A.id === "data-intake") {
        await Ne();
        return;
      }
      t.push(`/workbenches/finance-audit/m/${A.id}`);
    }
    async function re(A) {
      try {
        await Y("artifact.open", { path: A });
      } catch (q) {
        E.value = Q.errorMessage(q);
      }
    }
    async function Ne() {
      b.value = !0, S.value = "";
      try {
        h.value = await Y("data.list"), K.value = await Y("data.financeAgentLedgers");
      } catch (A) {
        S.value = Q.errorMessage(A);
      }
    }
    async function _e(A) {
      try {
        await Y("data.remove", { id: A }), await Ne();
      } catch (q) {
        S.value = Q.errorMessage(q);
      }
    }
    async function je() {
      a.value = !0;
      try {
        await Y("data.importFromFinanceAgent", { ledgerId: T.value, period: z.value }), await Ne();
      } catch (A) {
        S.value = Q.errorMessage(A);
      } finally {
        a.value = !1;
      }
    }
    let Ve = null, ke = null;
    return e.onMounted(() => {
      H(), Ve = gt((A) => {
        A.type === "todo.changed" && (ke && clearTimeout(ke), ke = setTimeout(() => {
          H();
        }, 300));
      });
    }), e.onBeforeUnmount(() => {
      Ve?.(), ke && clearTimeout(ke);
    }), (A, q) => (e.openBlock(), e.createElementBlock("div", SD, [
      e.createElementVNode("header", DD, [
        e.createVNode(Kt),
        q[15] || (q[15] = e.createElementVNode(
          "span",
          { class: "heading-icon" },
          [
            e.createElementVNode("i", { class: "ri-scales-3-line" })
          ],
          -1
          /* CACHED */
        )),
        e.createElementVNode("div", CD, [
          e.createElementVNode(
            "h1",
            null,
            e.toDisplayString(A.$t("财会审计解决方案")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            wD,
            e.toDisplayString(A.$t("月结关账、对账、审计与内控、税务合规、管理报告、资金风险与投融资估值，48 个模块分步出底稿，人工签核后归档；中英阿三语，适配中国、国际、沙特与阿联酋准则税制。")),
            1
            /* TEXT */
          )
        ]),
        w.value ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn",
          "data-test": "fau-home",
          onClick: q[0] || (q[0] = (G) => e.unref(t).push("/workbenches/finance-audit"))
        }, [
          q[14] || (q[14] = e.createElementVNode(
            "i",
            { class: "ri-home-4-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(A.$t("工作台首页")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn",
          disabled: i.value,
          onClick: H
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(i.value ? "ri-loader-4-line spin" : "ri-refresh-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(A.$t("刷新")),
            1
            /* TEXT */
          )
        ], 8, TD)
      ]),
      m.value ? (e.openBlock(), e.createElementBlock("p", LD, [
        q[16] || (q[16] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(m.value),
          1
          /* TEXT */
        )
      ])) : r.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          !r.value.company || u.value ? (e.openBlock(), e.createBlock(yn, {
            key: u.value ? `edit:${L.value}` : "new",
            company: u.value === "edit" ? r.value.company : null,
            "start-at": L.value,
            onSaved: ne,
            onCancel: q[1] || (q[1] = (G) => {
              u.value = !1, L.value = "";
            }),
            onSample: D
          }, null, 8, ["company", "start-at"])) : (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 1 },
            [
              e.createCommentVNode(" 顶部条 "),
              e.createElementVNode("section", AD, [
                e.createElementVNode("span", FD, [
                  e.createElementVNode(
                    "small",
                    ID,
                    e.toDisplayString(A.$t("公司")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("select", {
                    value: r.value.company.id,
                    "data-test": "fau-company-select",
                    onChange: q[2] || (q[2] = (G) => P(G.target.value))
                  }, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(r.value.companies, (G) => (e.openBlock(), e.createElementBlock("option", {
                        key: G.id,
                        value: G.id
                      }, e.toDisplayString(G.name), 9, OD))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode(
                      "option",
                      zD,
                      e.toDisplayString(A.$t("+ 新建公司档案")),
                      1
                      /* TEXT */
                    )
                  ], 40, PD)
                ]),
                e.createVNode(Zn, {
                  ref_key: "projectBar",
                  ref: v,
                  projects: r.value.projects,
                  project: r.value.project,
                  onChanged: H,
                  onOpenRun: q[3] || (q[3] = (G, le) => e.unref(t).push({ path: `/workbenches/finance-audit/m/${G}`, query: { run: le } }))
                }, null, 8, ["projects", "project"]),
                e.createElementVNode(
                  "span",
                  MD,
                  e.toDisplayString(A.$t(p.value)) + " · " + e.toDisplayString(A.$t(e.unref(ge.STANDARD_LABELS)[r.value.company.standard] || r.value.company.standard)),
                  1
                  /* TEXT */
                ),
                e.createVNode(Me, {
                  "model-value": r.value.company.outputLocale,
                  "onUpdate:modelValue": J
                }, null, 8, ["model-value"]),
                e.createElementVNode("span", jD, [
                  e.createElementVNode(
                    "small",
                    RD,
                    e.toDisplayString(A.$t("套餐")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("select", {
                    value: r.value.settings.bundle,
                    "data-test": "fau-bundle",
                    onChange: q[4] || (q[4] = (G) => X(G.target.value))
                  }, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(ie.BUNDLE_LABELS), (G, le) => (e.openBlock(), e.createElementBlock("option", {
                        key: le,
                        value: le
                      }, e.toDisplayString(A.$t(G)), 9, UD))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ], 40, qD)
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm ghost",
                  onClick: q[5] || (q[5] = (G) => u.value = "edit")
                }, [
                  q[18] || (q[18] = e.createElementVNode(
                    "i",
                    { class: "ri-settings-3-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(A.$t("配置")),
                    1
                    /* TEXT */
                  )
                ]),
                r.value.company.sample ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  type: "button",
                  class: "ss-btn sm ghost",
                  disabled: a.value,
                  "data-test": "fau-sample-open",
                  onClick: D
                }, [
                  q[19] || (q[19] = e.createElementVNode(
                    "i",
                    { class: "ri-flask-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(A.$t("打开示例项目")),
                    1
                    /* TEXT */
                  )
                ], 8, WD)),
                e.createElementVNode("span", YD, [
                  q[20] || (q[20] = e.createElementVNode(
                    "i",
                    { class: "ri-shield-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    " " + e.toDisplayString(A.$t("全部为草稿：不过账·不付款·不申报·不发送·不出具意见")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              r.value.company.sample ? (e.openBlock(), e.createElementBlock("p", GD, [
                q[22] || (q[22] = e.createElementVNode(
                  "i",
                  { class: "ri-flask-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  HD,
                  e.toDisplayString(A.$t("这是示例项目，用的都是示例数据。每个模块的第 2 步已经备好数据，进去点「开始校验并计算」就能看到结果与底稿。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: a.value,
                  "data-test": "fau-sample-remove",
                  onClick: O
                }, [
                  q[21] || (q[21] = e.createElementVNode(
                    "i",
                    { class: "ri-delete-bin-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(A.$t("删除示例项目")),
                    1
                    /* TEXT */
                  )
                ], 8, QD)
              ])) : M.value.length && !te.value ? (e.openBlock(), e.createElementBlock("p", JD, [
                q[24] || (q[24] = e.createElementVNode(
                  "i",
                  { class: "ri-information-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  ZD,
                  e.toDisplayString(A.$t("还有 {n} 项配置用的是默认值：{p0}", { n: M.value.length, p0: M.value.map((G) => A.$t(G.label)).join(e.unref(g)) })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-btn sm",
                    "data-test": "fau-defaults-go",
                    onClick: q[6] || (q[6] = (G) => W(M.value[0].step))
                  },
                  e.toDisplayString(A.$t("去完善")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn ghost sm",
                  "aria-label": A.$t("不再提示"),
                  "data-test": "fau-defaults-close",
                  onClick: j
                }, [...q[23] || (q[23] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-close-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, XD)
              ])) : e.createCommentVNode("v-if", !0),
              r.value.project ? w.value ? (e.openBlock(), e.createBlock(bD, {
                key: `${w.value}:${r.value.project.id}`,
                "module-id": w.value,
                home: r.value,
                "run-id": String(e.unref(_).query.run || "") || void 0,
                step: String(e.unref(_).query.step || "") || void 0,
                onHomeChanged: H
              }, null, 8, ["module-id", "home", "run-id", "step"])) : (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 4 },
                [
                  e.createElementVNode("div", nC, [
                    e.createElementVNode("section", aC, [
                      e.createElementVNode("h3", null, [
                        q[26] || (q[26] = e.createElementVNode(
                          "i",
                          { class: "ri-todo-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(A.$t("我的待办")),
                          1
                          /* TEXT */
                        )
                      ]),
                      r.value.todos.length ? (e.openBlock(), e.createElementBlock("ul", oC, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(r.value.todos, (G) => (e.openBlock(), e.createElementBlock("li", {
                            key: G.id,
                            "data-test": `fau-todo-${G.kind}`,
                            onClick: (le) => he(G)
                          }, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["fau-dot", G.severity === "info" ? "" : G.severity])
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createElementVNode(
                              "span",
                              rC,
                              e.toDisplayString(e.unref(Z)(G.message)),
                              1
                              /* TEXT */
                            ),
                            q[27] || (q[27] = e.createElementVNode(
                              "i",
                              { class: "ri-arrow-right-s-line fau-dir-icon" },
                              null,
                              -1
                              /* CACHED */
                            ))
                          ], 8, sC))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])) : (e.openBlock(), e.createElementBlock(
                        "p",
                        iC,
                        e.toDisplayString(A.$t("没有待办")),
                        1
                        /* TEXT */
                      ))
                    ]),
                    e.createElementVNode("section", cC, [
                      e.createElementVNode("h3", null, [
                        q[28] || (q[28] = e.createElementVNode(
                          "i",
                          { class: "ri-quill-pen-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(A.$t("签核队列")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createVNode(ia, {
                        items: r.value.queue,
                        onOpen: q[8] || (q[8] = (G) => e.unref(t).push({ path: `/workbenches/finance-audit/m/${G.moduleId}`, query: { run: G.runId, step: "signoff" } }))
                      }, null, 8, ["items"])
                    ]),
                    e.createElementVNode("section", dC, [
                      e.createElementVNode("h3", null, [
                        q[29] || (q[29] = e.createElementVNode(
                          "i",
                          { class: "ri-calendar-check-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(A.$t("本期关账进度")),
                          1
                          /* TEXT */
                        )
                      ]),
                      r.value.closeProgress ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createElementVNode("div", uC, [
                            e.createElementVNode(
                              "span",
                              mC,
                              e.toDisplayString(A.$t("关账清单")),
                              1
                              /* TEXT */
                            ),
                            e.createVNode(l, {
                              value: `${r.value.closeProgress.checklistDone}/${r.value.closeProgress.checklistTotal}`
                            }, null, 8, ["value"])
                          ]),
                          e.createElementVNode("div", pC, [
                            e.createElementVNode(
                              "span",
                              yC,
                              e.toDisplayString(A.$t("试算平衡")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(r.value.closeProgress.trialOk ? "fau-true" : "fau-false")
                              },
                              [
                                r.value.closeProgress.trialOk === null ? (e.openBlock(), e.createElementBlock(
                                  e.Fragment,
                                  { key: 0 },
                                  [
                                    e.createTextVNode("-")
                                  ],
                                  64
                                  /* STABLE_FRAGMENT */
                                )) : (e.openBlock(), e.createElementBlock(
                                  "i",
                                  {
                                    key: 1,
                                    class: e.normalizeClass(r.value.closeProgress.trialOk ? "ri-check-line" : "ri-close-line")
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ))
                              ],
                              2
                              /* CLASS */
                            )
                          ]),
                          e.createElementVNode("div", NC, [
                            e.createElementVNode(
                              "span",
                              VC,
                              e.toDisplayString(A.$t("勾稽未通过")),
                              1
                              /* TEXT */
                            ),
                            e.createVNode(l, {
                              value: r.value.closeProgress.tieIssues
                            }, null, 8, ["value"])
                          ])
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : (e.openBlock(), e.createElementBlock(
                        "p",
                        EC,
                        e.toDisplayString(A.$t("本项目还没有跑月结关账")),
                        1
                        /* TEXT */
                      )),
                      e.createElementVNode("div", kC, [
                        e.createElementVNode(
                          "button",
                          {
                            type: "button",
                            class: "ss-btn sm",
                            onClick: q[9] || (q[9] = (G) => e.unref(t).push("/workbenches/finance-audit/m/close"))
                          },
                          e.toDisplayString(A.$t("继续月结")),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ]),
                  e.createCommentVNode(" 模块入口：七个分组；每张卡说清楚能产出什么、现在能不能用 "),
                  e.createElementVNode(
                    "p",
                    vC,
                    e.toDisplayString(A.$t("{n} 个模块已可用、{m} 个即将上线：点可用的卡片进入，按七步出底稿；每张卡写着它产出什么。", { n: R.value, m: d.value })),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", gC, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(N), (G) => (e.openBlock(), e.createBlock(e.resolveDynamicComponent(y(G) ? "details" : "section"), {
                        key: G,
                        class: "fau-group",
                        "data-test": `fau-group-${G}`,
                        open: y(G) ? I.value : void 0,
                        onToggle: (le) => y(G) && k(le)
                      }, {
                        default: e.withCtx(() => [
                          (e.openBlock(), e.createBlock(
                            e.resolveDynamicComponent(y(G) ? "summary" : "header"),
                            null,
                            {
                              default: e.withCtx(() => [
                                e.createElementVNode(
                                  "h3",
                                  null,
                                  e.toDisplayString(A.$t(e.unref(ie.GROUP_LABELS)[G])),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "span",
                                  fC,
                                  e.toDisplayString(U(G).length),
                                  1
                                  /* TEXT */
                                ),
                                y(G) ? (e.openBlock(), e.createElementBlock(
                                  "small",
                                  hC,
                                  e.toDisplayString(I.value ? A.$t("点击收起") : A.$t("点击展开")),
                                  1
                                  /* TEXT */
                                )) : e.createCommentVNode("v-if", !0)
                              ]),
                              _: 2
                              /* DYNAMIC */
                            },
                            1024
                            /* DYNAMIC_SLOTS */
                          )),
                          e.createElementVNode("div", $C, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(U(G), (le) => (e.openBlock(), e.createBlock(e.resolveDynamicComponent(le.status === "ready" ? "button" : "div"), {
                                key: le.id,
                                type: le.status === "ready" ? "button" : void 0,
                                class: e.normalizeClass(["fau-mod", { planned: le.status !== "ready" }]),
                                "data-test": `fau-mod-${le.id}`,
                                onClick: (Ee) => le.status === "ready" && oe(le)
                              }, {
                                default: e.withCtx(() => [
                                  e.createElementVNode("strong", null, [
                                    e.createElementVNode(
                                      "span",
                                      _C,
                                      e.toDisplayString(le.code),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createTextVNode(
                                      e.toDisplayString(A.$t(le.name)),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  e.createElementVNode(
                                    "small",
                                    null,
                                    e.toDisplayString(A.$t(le.summary)),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode("span", BC, [
                                    le.status === "ready" ? (e.openBlock(), e.createElementBlock(
                                      "span",
                                      bC,
                                      e.toDisplayString(A.$t("可用")),
                                      1
                                      /* TEXT */
                                    )) : (e.openBlock(), e.createElementBlock("span", {
                                      key: 1,
                                      class: "fau-badge muted",
                                      "data-test": `fau-planned-${le.id}`,
                                      "data-batch": le.batch
                                    }, e.toDisplayString(A.$t("即将上线")), 9, SC)),
                                    (e.openBlock(!0), e.createElementBlock(
                                      e.Fragment,
                                      null,
                                      e.renderList(le.outputs, (Ee) => (e.openBlock(), e.createElementBlock(
                                        "span",
                                        {
                                          key: Ee,
                                          class: "fau-out"
                                        },
                                        e.toDisplayString(e.unref($t)[Ee] || Ee),
                                        1
                                        /* TEXT */
                                      ))),
                                      128
                                      /* KEYED_FRAGMENT */
                                    ))
                                  ])
                                ]),
                                _: 2
                                /* DYNAMIC */
                              }, 1032, ["type", "class", "data-test", "onClick"]))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ])
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1064, ["data-test", "open", "onToggle"]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]),
                  e.createElementVNode("section", DC, [
                    e.createElementVNode("h3", null, [
                      q[30] || (q[30] = e.createElementVNode(
                        "i",
                        { class: "ri-file-list-3-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(A.$t("最近产出")),
                        1
                        /* TEXT */
                      )
                    ]),
                    r.value.recent.length ? (e.openBlock(), e.createElementBlock("ul", CC, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(r.value.recent, (G) => (e.openBlock(), e.createElementBlock("li", {
                          key: G.id,
                          onClick: (le) => re(G.path)
                        }, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(G.kind === "docx" ? "ri-file-word-2-line" : "ri-file-excel-2-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createElementVNode("span", TC, [
                            e.createTextVNode(
                              e.toDisplayString(e.unref(Z)(G.title)) + " · ",
                              1
                              /* TEXT */
                            ),
                            e.createVNode(l, {
                              value: f(G.path)
                            }, null, 8, ["value"])
                          ]),
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["fau-badge", G.archived ? "ok" : "warn"])
                            },
                            e.toDisplayString(G.archived ? A.$t("已签核·已归档") : A.$t("草稿·待复核")),
                            3
                            /* TEXT, CLASS */
                          )
                        ], 8, wC))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : (e.openBlock(), e.createElementBlock(
                      "p",
                      LC,
                      e.toDisplayString(A.$t("还没有产出")),
                      1
                      /* TEXT */
                    ))
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : (e.openBlock(), e.createElementBlock("section", xD, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(A.$t("先新建一个项目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "p",
                  eC,
                  e.toDisplayString(A.$t("每个项目对应一个月结期、年审或申报周期，数据、运行和签核都挂在项目下。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", tC, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: a.value,
                    "data-test": "fau-first-project-create",
                    onClick: de
                  }, [
                    q[25] || (q[25] = e.createElementVNode(
                      "i",
                      { class: "ri-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(A.$t("新建「{p0} 月结」", { p0: e.unref(De)() })),
                      1
                      /* TEXT */
                    )
                  ], 8, lC),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-btn",
                      onClick: q[7] || (q[7] = (G) => v.value?.openCreate())
                    },
                    e.toDisplayString(A.$t("自定义…")),
                    1
                    /* TEXT */
                  )
                ])
              ]))
            ],
            64
            /* STABLE_FRAGMENT */
          ))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock("p", KD, [
        q[17] || (q[17] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(A.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ])),
      e.createCommentVNode(" P3 数据管理抽屉 "),
      b.value ? (e.openBlock(), e.createElementBlock("div", {
        key: 3,
        class: "fau-drawer-mask",
        onClick: q[10] || (q[10] = (G) => b.value = !1)
      })) : e.createCommentVNode("v-if", !0),
      b.value ? (e.openBlock(), e.createElementBlock("aside", {
        key: 4,
        class: "fau-drawer",
        role: "dialog",
        "aria-label": A.$t("数据接入与清洗"),
        "data-test": "fau-data-drawer"
      }, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(A.$t("数据接入与清洗")),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn ghost sm",
            onClick: q[11] || (q[11] = (G) => b.value = !1)
          }, [...q[31] || (q[31] = [
            e.createElementVNode(
              "i",
              { class: "ri-close-line" },
              null,
              -1
              /* CACHED */
            )
          ])])
        ]),
        e.createElementVNode("div", AC, [
          e.createElementVNode(
            "p",
            FC,
            e.toDisplayString(A.$t("在模块的第 2 步上传数据；这里管理本项目已导入的数据集，也可以从财务智能体账套只读导入。")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", IC, [
            e.createElementVNode("table", PC, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(A.$t("数据集")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(A.$t("类型")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    OC,
                    e.toDisplayString(A.$t("行数")),
                    1
                    /* TEXT */
                  ),
                  q[32] || (q[32] = e.createElementVNode(
                    "th",
                    null,
                    null,
                    -1
                    /* CACHED */
                  ))
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(h.value, (G) => (e.openBlock(), e.createElementBlock("tr", {
                    key: G.id
                  }, [
                    e.createElementVNode("td", zC, [
                      e.createTextVNode(
                        e.toDisplayString(G.label),
                        1
                        /* TEXT */
                      ),
                      G.issues.length ? (e.openBlock(), e.createElementBlock(
                        "small",
                        MC,
                        " · " + e.toDisplayString(A.$t("问题 {n}", { n: G.issues.length })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(G.kind),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", jC, [
                      e.createVNode(l, {
                        value: G.rowCount
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", null, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn ghost sm",
                        onClick: (le) => _e(G.id)
                      }, [...q[33] || (q[33] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-delete-bin-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, RC)
                    ])
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ]),
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(A.$t("从财务智能体账套导入")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", qC, [
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": q[12] || (q[12] = (G) => T.value = G),
                "data-test": "fau-fa-ledger"
              },
              [
                e.createElementVNode(
                  "option",
                  UC,
                  e.toDisplayString(K.value.length ? A.$t("选择账套") : A.$t("财务智能体里还没有账套")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(K.value, (G) => (e.openBlock(), e.createElementBlock("option", {
                    key: G.id,
                    value: G.id
                  }, e.toDisplayString(G.name), 9, WC))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, T.value]
            ]),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": q[13] || (q[13] = (G) => z.value = G),
                dir: "ltr",
                placeholder: "YYYY-MM"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                z.value,
                void 0,
                { trim: !0 }
              ]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm",
              disabled: !T.value || a.value,
              onClick: je
            }, e.toDisplayString(A.$t("只读导入")), 9, YC)
          ]),
          S.value ? (e.openBlock(), e.createElementBlock("p", GC, [
            q[34] || (q[34] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(S.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ])
      ], 8, KC)) : e.createCommentVNode("v-if", !0),
      E.value ? (e.openBlock(), e.createElementBlock("p", HC, [
        q[35] || (q[35] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(E.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), JC = /* @__PURE__ */ ae(QC, [["__scopeId", "data-v-b6a33bbf"]]);
export {
  JC as default
};
