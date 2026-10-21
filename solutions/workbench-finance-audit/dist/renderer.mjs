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
const ke = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/financeAudit/regions.ts"];
if (!ke) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/financeAudit/regions.ts");
ke.default;
const yt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!yt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Tt = yt.default, s = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!s) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
s.default;
const pe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useLocale.ts"];
if (!pe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useLocale.ts");
pe.default;
const Nt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!Nt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const se = Nt.default, Vt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!Vt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const He = Vt.default, Et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/TableMapping.vue"];
if (!Et) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/TableMapping.vue");
const Qe = Et.default, Q = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!Q) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
Q.default;
const Je = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!Je) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
Je.default;
function vt() {
  return window.electronAPI?.workbenches?.financeAudit || null;
}
async function Y(i, B) {
  const t = vt();
  if (!t?.invoke) throw new Error(s.t("当前环境不支持财会审计工作台"));
  return t.invoke(i, Je.toPlain(B ?? {}));
}
function gt(i) {
  return vt()?.onEvent?.(i) ?? (() => {
  });
}
function X(i) {
  return i ? s.t(i.key, i.params) : "";
}
const Se = ["setup", "upload", "validate", "analyze", "draft", "signoff", "archive"];
function kt() {
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
function Lt(i) {
  if (!i) return { state: "todo" };
  const B = { startedAt: i.startedAt, finishedAt: i.finishedAt, progressAt: i.progressAt, kind: i.kind, estimateSec: i.estimateSec };
  switch (i.status) {
    case "running":
      return { ...B, state: "running" };
    case "done":
      return { ...B, state: "done", summary: X(i.summary) || void 0 };
    case "failed":
    case "blocked":
      return { ...B, state: "failed", error: X(i.error) || s.t("失败") };
    case "interrupted":
      return { ...B, state: "failed", error: s.t("已中断：应用重启前这一步还在运行，请重新运行") };
    default:
      return { ...B, state: "todo", summary: X(i.summary) || void 0 };
  }
}
const ge = { prepare: s.i18nKey("编制"), review: s.i18nKey("复核"), approve: s.i18nKey("批准") };
function Ce() {
  const i = pe.currentLocale();
  return i === "ar" ? "ar-u-nu-latn" : i;
}
function we(i) {
  return i == null || !Number.isFinite(i) ? "-" : new Intl.NumberFormat(Ce(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(i / 100);
}
function Kt(i) {
  return i == null || !Number.isFinite(i) ? "-" : new Intl.NumberFormat(Ce(), { style: "percent", maximumFractionDigits: 1 }).format(i);
}
function Te(i) {
  if (!i) return "";
  const B = new Date(i);
  if (Number.isNaN(B.getTime())) return i;
  const t = (y) => String(y).padStart(2, "0");
  return `${B.getFullYear()}-${t(B.getMonth() + 1)}-${t(B.getDate())} ${t(B.getHours())}:${t(B.getMinutes())}`;
}
function De(i = /* @__PURE__ */ new Date()) {
  const B = new Date(i.getFullYear(), i.getMonth() - 1, 1);
  return `${B.getFullYear()}-${String(B.getMonth() + 1).padStart(2, "0")}`;
}
const ft = { "zh-CN": s.i18nKey("中文"), "en-US": "English", ar: "العربية" };
function At(i, B) {
  const y = {
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
  }[i];
  return y ? s.t(y[B] || y.other || "") : "";
}
const ht = { xlsx: "Excel", docx: "Word", pdf: "PDF", pptx: "PowerPoint", md: "Markdown", je_import_xlsx: "Excel (JE)" }, Ft = {
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
function It(i, B) {
  const t = /* @__PURE__ */ new Map();
  for (const y of i) {
    const r = Ft[y.type] || s.i18nKey("工程组件");
    t.set(r, (t.get(r) || 0) + 1);
  }
  return [...t].map(([y, r]) => `${s.t(y)} ${r}`).join(B);
}
const qe = (i) => Number(i.toFixed(6));
function Ue(i, B) {
  return i.amount ? qe(B / 100) : i.percent ? qe(B * 100) : B;
}
function Pt(i, B) {
  const t = Number(B);
  return B.trim() === "" || !Number.isFinite(t) || t < 0 ? null : i.amount ? Math.round(t * 100) : i.percent ? qe(t / 100) : t;
}
function $t(i, B) {
  return i.amount ? we(B) : new Intl.NumberFormat(Ce(), { maximumFractionDigits: i.percent ? 2 : 4 }).format(Ue(i, B));
}
function We(i, B) {
  return i.percent ? "%" : i.amount ? !B || B === "CNY" ? s.t("元") : B : "";
}
function Ye(i) {
  return [i.basis ? s.t("依据：{p0}", { p0: s.t(i.basis) }) : "", i.section].filter(Boolean).join(" · ");
}
const Ke = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!Ke) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
Ke.default;
const Ot = { class: "fau-drop__text" }, zt = ["disabled"], Mt = /* @__PURE__ */ e.defineComponent({
  __name: "FauFileDrop",
  props: {
    label: {},
    hint: { default: "" },
    kind: { default: "" },
    multi: { type: Boolean, default: !1 },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["picked"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = e.ref(!1), n = /\.(pdf|ofd|docx|xlsx|xls|png|jpe?g)$/i, c = /\.(xlsx|xls|xlsm|csv|sta|mt940|940|txt|xml|053)$/i;
    async function a() {
      try {
        const E = await Y("data.pick", { kind: t.kind, multi: t.multi });
        E?.paths?.length && y("picked", t.multi ? E.paths : E.paths.slice(0, 1));
      } catch (E) {
        Ke.useNotificationStore().error(Q.errorMessage(E));
      }
    }
    function N(E) {
      if (r.value = !1, t.disabled) return;
      const u = Q.droppedPaths(E, t.kind === "evidence" ? n : t.kind === "bank" ? c : Q.EXCEL_RE);
      u.length && y("picked", t.multi ? u : u.slice(0, 1));
    }
    return (E, u) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        class: e.normalizeClass(["fau-drop", { over: r.value, disabled: i.disabled }]),
        role: "button",
        tabindex: "0",
        onClick: u[0] || (u[0] = (L) => !i.disabled && a()),
        onKeydown: u[1] || (u[1] = e.withKeys(e.withModifiers((L) => !i.disabled && a(), ["prevent"]), ["enter"])),
        onDragover: u[2] || (u[2] = e.withModifiers((L) => !i.disabled && (r.value = !0), ["prevent"])),
        onDragleave: u[3] || (u[3] = e.withModifiers((L) => r.value = !1, ["prevent"])),
        onDrop: e.withModifiers(N, ["prevent"])
      },
      [
        e.createElementVNode(
          "i",
          {
            class: e.normalizeClass(i.kind === "evidence" ? "ri-file-text-line" : "ri-file-excel-2-line")
          },
          null,
          2
          /* CLASS */
        ),
        e.createElementVNode("div", Ot, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(i.label),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(i.hint || (i.multi ? E.$t("把文件拖到这里，或点击选择（可多选）") : E.$t("把文件拖到这里，或点击选择"))),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn ghost sm",
          disabled: i.disabled,
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
        ], 8, zt)
      ],
      34
      /* CLASS, NEED_HYDRATION */
    ));
  }
}), ae = (i, B) => {
  const t = i.__vccOpts || i;
  for (const [y, r] of B)
    t[y] = r;
  return t;
}, _t = /* @__PURE__ */ ae(Mt, [["__scopeId", "data-v-aad4a5cd"]]), jt = {
  dir: "ltr",
  class: "fau-num"
}, l = /* @__PURE__ */ e.defineComponent({
  __name: "FauNum",
  props: {
    cents: {},
    ratio: {},
    value: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.cents !== void 0 ? we(B.cents) : B.ratio !== void 0 ? Kt(B.ratio) : B.value === null || B.value === void 0 || B.value === "" ? "-" : String(B.value));
    return (y, r) => (e.openBlock(), e.createElementBlock("bdi", jt, [
      e.renderSlot(y.$slots, "default", {}, () => [
        e.createTextVNode(
          e.toDisplayString(t.value),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), Rt = ["title"], qt = { class: "ss-muted" }, Ut = ["aria-label"], Wt = ["aria-checked", "disabled", "data-test", "onClick"], Oe = /* @__PURE__ */ e.defineComponent({
  __name: "OutputLocalePicker",
  props: {
    modelValue: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(i, { emit: B }) {
    const t = B, y = ["zh-CN", "en-US", "ar"];
    return (r, n) => (e.openBlock(), e.createElementBlock("span", {
      class: "fau-row",
      title: r.$t("产出物语言与界面语言独立")
    }, [
      e.createElementVNode(
        "small",
        qt,
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
          e.renderList(y, (c) => e.createElementVNode("button", {
            key: c,
            type: "button",
            role: "radio",
            "aria-checked": i.modelValue === c,
            class: e.normalizeClass({ on: i.modelValue === c }),
            disabled: i.disabled,
            "data-test": `fau-locale-${c}`,
            onClick: (a) => t("update:modelValue", c)
          }, e.toDisplayString(r.$t(e.unref(ft)[c])), 11, Wt)),
          64
          /* STABLE_FRAGMENT */
        ))
      ], 8, Ut)
    ], 8, Rt));
  }
}), Yt = {
  class: "fau-wizard ss-module",
  "data-test": "fau-setup"
}, Gt = { class: "fau-steps" }, Ht = { class: "ss-grid" }, Qt = { class: "ss-field" }, Jt = { class: "ss-field" }, Zt = { class: "ss-field" }, Xt = { class: "ss-field" }, xt = { class: "ss-field" }, el = ["value"], tl = { class: "fau-row" }, ll = { class: "ss-muted" }, nl = { class: "fau-regions" }, al = ["value", "checked", "disabled", "data-test", "onChange"], ol = ["data-batch"], sl = {
  key: 1,
  class: "fau-primary"
}, rl = ["value"], il = {
  key: 2,
  class: "fau-tax"
}, cl = { class: "ss-actions" }, dl = ["disabled"], ul = ["disabled"], ml = {
  key: 0,
  class: "ss-muted fau-quick-hint"
}, pl = { class: "ss-field" }, yl = ["value"], Nl = {
  key: 0,
  class: "ss-note ok",
  "data-test": "fau-map-auto"
}, Vl = {
  key: 1,
  class: "ss-note warn",
  "data-test": "fau-map-review"
}, El = {
  key: 2,
  class: "fau-table-wrap"
}, vl = { class: "fau-table" }, gl = ["onUpdate:modelValue", "data-test", "onChange"], kl = { value: "" }, fl = ["value"], hl = {
  key: 2,
  class: "ss-note danger"
}, $l = { class: "ss-actions" }, _l = ["disabled"], Bl = { class: "fau-seg" }, bl = ["onClick"], Sl = { class: "ss-muted" }, Dl = { class: "ss-actions" }, Cl = { class: "fau-row" }, wl = ["placeholder"], Tl = { class: "ss-muted" }, Ll = { class: "fau-table-wrap fau-th-wrap" }, Kl = {
  class: "fau-table",
  "data-test": "fau-th-table"
}, Al = { class: "num" }, Fl = { class: "fau-th-group" }, Il = { colspan: "4" }, Pl = ["data-test"], Ol = { class: "fau-th-mod" }, zl = { colspan: "4" }, Ml = ["aria-expanded", "data-test", "onClick"], jl = { class: "fau-code" }, Rl = ["data-test"], ql = { class: "wrap" }, Ul = ["title"], Wl = { class: "num" }, Yl = { class: "fau-th-input" }, Gl = ["value", "placeholder", "data-test", "onChange"], Hl = { class: "wrap" }, Ql = {
  key: 0,
  class: "ss-muted fau-th-empty"
}, Jl = { class: "ss-actions" }, Zl = ["onUpdate:modelValue", "placeholder", "data-test"], Xl = ["onUpdate:modelValue", "placeholder", "data-test"], xl = ["checked", "onChange"], en = ["title", "onClick"], tn = { class: "ss-actions" }, ln = { class: "fau-row" }, nn = { class: "ss-muted" }, an = { class: "fau-seg" }, on = { class: "ss-actions" }, sn = { class: "fau-regions" }, rn = ["checked", "disabled", "data-test", "onChange"], cn = { class: "ss-actions" }, dn = ["disabled"], un = /* @__PURE__ */ e.defineComponent({
  __name: "SetupWizard",
  props: {
    company: {},
    startAt: {}
  },
  emits: ["saved", "cancel", "sample"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = Q.useSteps([
      { key: "company", title: s.t("公司与地区"), hint: s.t("公司名称、登记号与税号、地区档案、本位币、会计年度") },
      { key: "standard", title: s.t("准则与科目映射"), hint: s.t("选准则；上传一份余额表把科目映射到报表大类，以后各期复用") },
      { key: "erp", title: s.t("ERP 与数据来源"), hint: s.t("决定上传步骤里显示哪份导出指引") },
      { key: "thresholds", title: s.t("重要性水平与阈值"), hint: s.t("默认值逐条注明出处，可按公司修改") },
      { key: "signers", title: s.t("签核人与岗位"), hint: s.t("编制人、复核人、批准人；是否强制职责分离") },
      { key: "packages", title: s.t("启用套餐"), hint: s.t("选择首页显示的分组；投融资扩展包默认折叠") }
    ]), n = ["prepare", "review", "approve"], c = s.listSeparator(), a = {
      asset: s.i18nKey("资产"),
      liability: s.i18nKey("负债"),
      equity: s.i18nKey("所有者权益"),
      revenue: s.i18nKey("收入"),
      expense: s.i18nKey("费用"),
      common: s.i18nKey("共同类")
    }, N = {
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
      outputLocale: E?.outputLocale || pe.currentLocale()
    }), L = e.ref([]), k = e.ref({}), g = e.ref([]), b = e.ref(null), h = e.ref(null), K = e.ref(""), T = e.ref(!1), z = e.ref(!1), S = e.computed(() => L.value.find((D) => D.id === u.region)?.standards || ["CAS"]), w = e.ref(""), m = e.ref(/* @__PURE__ */ new Set()), f = (D) => !!w.value || m.value.has(D);
    function p(D) {
      const O = new Set(m.value);
      O.has(D) ? O.delete(D) : O.add(D), m.value = O;
    }
    const I = e.computed(() => {
      const D = w.value.toLowerCase(), O = [];
      for (const P of ie.FAU_MODULES) {
        if (!u.packages.includes(P.package)) continue;
        const J = g.value.filter((re) => re.module === P.id), Z = (re) => !D || [s.t(P.name), P.code, re.label ? s.t(re.label) : "", re.original, Ye(re)].some((Ne) => Ne.toLowerCase().includes(D)), de = J.filter(Z);
        if (!de.length) continue;
        const he = J.filter((re) => u.thresholds[re.key] != null && u.thresholds[re.key] !== re.value).length;
        let oe = O.find((re) => re.group === P.group);
        oe || O.push(oe = { group: P.group, modules: [] }), oe.modules.push({ id: P.id, code: P.code, name: P.name, items: de, changed: he });
      }
      return O;
    }), _ = e.computed(() => h.value ? h.value.entries.filter((D) => !D.cls).length : 0);
    e.onMounted(async () => {
      if (t.startAt && r.indexOf(t.startAt) > 0) {
        for (const D of r.metas.slice(0, r.indexOf(t.startAt))) r.done(D.key);
        Q.scrollToStep(t.startAt);
      }
      try {
        const D = await Y("region.profiles");
        L.value = D.profiles, k.value = D.standards, g.value = await Y("thresholds.get", { modules: ie.FAU_MODULES.filter((O) => O.status === "ready" && O.group !== "platform").map((O) => O.id) });
      } catch (D) {
        r.fail("company", D);
      }
    });
    function v(D) {
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
      d() && v("company");
    }
    async function V() {
      if (d()) {
        T.value = !0, r.start("company");
        try {
          const D = await Y("company.save", { company: { ...u, signers: [], quickStart: !0 } });
          await Y("project.create", { type: "month_close", period: De() }), r.done("company", s.t("已保存")), y("saved", D);
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
      h.value && (u.accountMap = h.value.entries.map((D) => ({ ...D, source: h.value.autoComplete ? D.source : "manual" })), u.accountMapConfirmed = h.value.entries.every((D) => D.cls)), v("standard");
    }
    function W(D, O) {
      if (O.trim() === "") {
        delete u.thresholds[D.key];
        return;
      }
      const P = Pt(D, O);
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
        r.done("packages", s.t("已保存")), y("saved", D);
      } catch (D) {
        r.fail("packages", D);
      } finally {
        T.value = !1;
      }
    }
    return (D, O) => (e.openBlock(), e.createElementBlock("div", Yt, [
      e.createVNode(He, {
        title: D.$t("首次配置"),
        metas: e.unref(r).metas,
        runtime: e.unref(r).runtime,
        "current-key": e.unref(r).currentKey.value,
        onJump: e.unref(Q.scrollToStep)
      }, null, 8, ["title", "metas", "runtime", "current-key", "onJump"]),
      e.createElementVNode("div", Gt, [
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
            e.createElementVNode("div", Ht, [
              e.createElementVNode("label", Qt, [
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
              e.createElementVNode("label", Jt, [
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
              e.createElementVNode("label", Zt, [
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
              e.createElementVNode("label", Xt, [
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
              e.createElementVNode("label", xt, [
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
                      }, e.toDisplayString(P), 9, el)),
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
            e.createElementVNode("div", tl, [
              e.createElementVNode(
                "span",
                ll,
                e.toDisplayString(D.$t("地区档案（可多选，主地区决定准则与报表口径）")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", nl, [
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
                    }, null, 40, al),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(D.$t(P.name)),
                      1
                      /* TEXT */
                    ),
                    P.available ? u.regions.includes(P.id) ? (e.openBlock(), e.createElementBlock("label", sl, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": O[6] || (O[6] = (J) => u.region = J),
                        type: "radio",
                        value: P.id
                      }, null, 8, rl), [
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
                    }, e.toDisplayString(D.$t("即将上线")), 9, ol)),
                    P.taxRegimes?.length ? (e.openBlock(), e.createElementBlock(
                      "small",
                      il,
                      e.toDisplayString(P.taxRegimes.map((J) => D.$t(J)).join(e.unref(c))),
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
            e.createElementVNode("div", cl, [
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
              i.company ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
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
                  ], 8, dl),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost",
                    disabled: T.value,
                    "data-test": "fau-setup-sample",
                    onClick: O[7] || (O[7] = (P) => y("sample"))
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
                  ], 8, ul)
                ],
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            i.company ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              ml,
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
            e.createElementVNode("label", pl, [
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
                    }, e.toDisplayString(D.$t(k.value[P] || P)), 9, yl))),
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
            e.createVNode(_t, {
              label: D.$t("上传一份科目余额表做科目映射"),
              hint: D.$t("中国科目编码按前缀自动识别；其它科目表自动给出建议后由你确认"),
              onPicked: O[9] || (O[9] = (P) => te(P[0]))
            }, null, 8, ["label", "hint"]),
            b.value && !h.value ? (e.openBlock(), e.createBlock(Qe, {
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
                h.value.autoComplete ? (e.openBlock(), e.createElementBlock("p", Nl, [
                  O[22] || (O[22] = e.createElementVNode(
                    "i",
                    { class: "ri-magic-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(D.$t("已自动完成：{n} 个科目全部映射到报表大类", { n: h.value.entries.length })),
                    1
                    /* TEXT */
                  )
                ])) : (e.openBlock(), e.createElementBlock("p", Vl, [
                  O[23] || (O[23] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(D.$t("这份科目表需要人工确认：{n} 个科目，其中 {m} 个还没有大类", { n: h.value.entries.length, m: _.value })),
                    1
                    /* TEXT */
                  )
                ])),
                h.value.autoComplete ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("div", El, [
                  e.createElementVNode("table", vl, [
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
                                "onUpdate:modelValue": (Z) => P.cls = Z,
                                "data-test": `fau-map-cls-${J}`,
                                onChange: (Z) => P.source = "manual"
                              }, [
                                e.createElementVNode(
                                  "option",
                                  kl,
                                  e.toDisplayString(D.$t("请选择…")),
                                  1
                                  /* TEXT */
                                ),
                                (e.openBlock(), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(a, (Z, de) => e.createElementVNode("option", {
                                    key: de,
                                    value: de
                                  }, e.toDisplayString(D.$t(Z)), 9, fl)),
                                  64
                                  /* STABLE_FRAGMENT */
                                ))
                              ], 40, gl), [
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
            K.value ? (e.openBlock(), e.createElementBlock("p", hl, [
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
            e.createElementVNode("div", $l, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!h.value && _.value > 0,
                "data-test": "fau-setup-next-standard",
                onClick: j
              }, e.toDisplayString(h.value ? D.$t("确认映射并继续") : D.$t("稍后再做，继续")), 9, _l)
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
            e.createElementVNode("div", Bl, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(N, (P, J) => e.createElementVNode("button", {
                  key: J,
                  type: "button",
                  class: e.normalizeClass({ on: u.erp === J }),
                  onClick: (Z) => u.erp = J
                }, e.toDisplayString(D.$t(P)), 11, bl)),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode(
              "p",
              Sl,
              e.toDisplayString(D.$t("ERP 类型决定上传步骤里显示哪份「怎么导出」指引；连接器取数即将上线，现在以上传文件为主。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Dl, [
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn primary",
                  onClick: O[12] || (O[12] = (P) => v("erp"))
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
            e.createElementVNode("div", Cl, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": O[13] || (O[13] = (P) => w.value = P),
                type: "search",
                class: "fau-th-search",
                placeholder: D.$t("搜索阈值、模块或依据"),
                "data-test": "fau-th-search"
              }, null, 8, wl), [
                [
                  e.vModelText,
                  w.value,
                  void 0,
                  { trim: !0 }
                ]
              ]),
              e.createElementVNode(
                "span",
                Tl,
                e.toDisplayString(D.$t("只列已启用套餐里的模块；金额按元、比例按百分比填写。没改的沿用默认值。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Ll, [
              e.createElementVNode("table", Kl, [
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
                      Al,
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
                        e.createElementVNode("tr", Fl, [
                          e.createElementVNode(
                            "td",
                            Il,
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
                          e.createElementVNode("tr", Ol, [
                            e.createElementVNode("td", zl, [
                              e.createElementVNode("button", {
                                type: "button",
                                class: "fau-th-toggle",
                                "aria-expanded": f(J.id),
                                "data-test": `fau-th-toggle-${J.id}`,
                                onClick: (Z) => p(J.id)
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
                                  jl,
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
                                }, e.toDisplayString(D.$t("已改 {n} 项", { n: J.changed })), 9, Rl)) : e.createCommentVNode("v-if", !0)
                              ], 8, Ml)
                            ])
                          ]),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(J.items, (Z) => e.withDirectives((e.openBlock(), e.createElementBlock("tr", {
                              key: Z.key
                            }, [
                              e.createElementVNode("td", ql, [
                                e.createElementVNode(
                                  "div",
                                  null,
                                  e.toDisplayString(Z.label ? D.$t(Z.label) : Z.original),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode("small", {
                                  class: "ss-muted",
                                  title: D.$t("以原文为准")
                                }, e.toDisplayString(Z.original), 9, Ul)
                              ]),
                              e.createElementVNode("td", Wl, [
                                e.createVNode(l, {
                                  value: e.unref($t)(Z, Z.value)
                                }, null, 8, ["value"]),
                                O[25] || (O[25] = e.createTextVNode()),
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(e.unref(We)(Z, u.currency)),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              e.createElementVNode("td", Yl, [
                                e.createElementVNode("input", {
                                  type: "number",
                                  step: "any",
                                  min: "0",
                                  dir: "ltr",
                                  value: u.thresholds[Z.key] == null ? "" : e.unref(Ue)(Z, u.thresholds[Z.key]),
                                  placeholder: String(e.unref(Ue)(Z, Z.value)),
                                  "data-test": `fau-th-input-${Z.key}`,
                                  onChange: (de) => W(Z, de.target.value)
                                }, null, 40, Gl),
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(e.unref(We)(Z, u.currency)),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              e.createElementVNode("td", Hl, [
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(e.unref(Ye)(Z)),
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
                        ], 8, Pl))),
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
                Ql,
                e.toDisplayString(w.value ? D.$t("没有匹配的阈值") : D.$t("已启用的套餐里没有可设置的阈值")),
                1
                /* TEXT */
              ))
            ]),
            e.createElementVNode("div", Jl, [
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn primary",
                  onClick: O[14] || (O[14] = (P) => v("thresholds"))
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
                  "onUpdate:modelValue": (Z) => P.name = Z,
                  placeholder: D.$t("姓名"),
                  "data-test": `fau-signer-name-${J}`
                }, null, 8, Zl), [
                  [
                    e.vModelText,
                    P.name,
                    void 0,
                    { trim: !0 }
                  ]
                ]),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": (Z) => P.title = Z,
                  placeholder: D.$t("岗位"),
                  "data-test": `fau-signer-title-${J}`
                }, null, 8, Xl), [
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
                  e.renderList(n, (Z) => e.createElementVNode("label", {
                    key: Z,
                    class: "fau-check"
                  }, [
                    e.createElementVNode("input", {
                      type: "checkbox",
                      checked: P.levels.includes(Z),
                      onChange: (de) => H(P, Z)
                    }, null, 40, xl),
                    e.createTextVNode(
                      e.toDisplayString(D.$t(e.unref(ge)[Z])),
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
                  onClick: (Z) => u.signers.splice(J, 1)
                }, [...O[26] || (O[26] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-delete-bin-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, en)
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            e.createElementVNode("div", tn, [
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
            e.createElementVNode("div", ln, [
              e.createElementVNode(
                "span",
                nn,
                e.toDisplayString(D.$t("职责分离（同一次运行里编制人与复核人不能是同一人）")),
                1
                /* TEXT */
              ),
              e.createElementVNode("span", an, [
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
            e.createElementVNode("div", on, [
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn primary",
                  onClick: O[17] || (O[17] = (P) => v("signers"))
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
            e.createElementVNode("div", sn, [
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
                    onChange: (Z) => ce(J)
                  }, null, 40, rn),
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
            e.createVNode(Oe, {
              modelValue: u.outputLocale,
              "onUpdate:modelValue": O[18] || (O[18] = (P) => u.outputLocale = P)
            }, null, 8, ["modelValue"]),
            e.createElementVNode("div", cn, [
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
              ], 8, dn),
              i.company ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-btn ghost",
                  onClick: O[19] || (O[19] = (P) => y("cancel"))
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
}), mn = /* @__PURE__ */ ae(un, [["__scopeId", "data-v-d964846c"]]), pn = { class: "fau-row" }, yn = { class: "ss-muted" }, Nn = ["value"], Vn = {
  key: 0,
  value: ""
}, En = ["value"], vn = {
  key: 0,
  class: "fau-panel fau-newproj",
  "data-test": "fau-project-form"
}, gn = { class: "ss-grid" }, kn = { class: "ss-field" }, fn = ["value"], hn = { class: "ss-field" }, $n = { class: "ss-field" }, _n = { class: "ss-field" }, Bn = { value: "" }, bn = ["value"], Sn = { class: "ss-muted" }, Dn = { class: "ss-actions" }, Cn = ["disabled"], wn = {
  key: 0,
  class: "ss-note danger"
}, Tn = ["aria-label"], Ln = { class: "fau-drawer__body" }, Kn = { class: "fau-kv" }, An = { class: "fau-list" }, Fn = ["onClick"], In = { class: "grow" }, Pn = { class: "ss-muted" }, On = {
  key: 0,
  class: "ss-muted"
}, zn = { class: "fau-list" }, Mn = { class: "grow" }, jn = { class: "ss-muted" }, Rn = {
  key: 0,
  class: "ss-muted"
}, qn = { class: "ss-actions" }, Un = ["disabled"], Wn = ["disabled"], Yn = {
  key: 0,
  class: "ss-note ok",
  "data-test": "fau-project-md"
}, Gn = {
  key: 1,
  class: "ss-note danger"
}, Hn = /* @__PURE__ */ e.defineComponent({
  __name: "ProjectBar",
  props: {
    projects: {},
    project: {},
    openDetailOnMount: { type: Boolean }
  },
  emits: ["changed", "open-run"],
  setup(i, { expose: B, emit: t }) {
    const y = i, r = t, n = {
      month_close: s.i18nKey("月结"),
      annual_audit: s.i18nKey("年审"),
      filing: s.i18nKey("申报"),
      controls: s.i18nKey("内控"),
      ma: s.i18nKey("并购"),
      custom: s.i18nKey("自定义")
    }, c = { open: s.i18nKey("进行中"), closed: s.i18nKey("已关闭"), archived: s.i18nKey("已归档") }, a = {
      draft: s.i18nKey("草稿"),
      running: s.i18nKey("进行中"),
      ready: s.i18nKey("待签核"),
      signing: s.i18nKey("签核中"),
      returned: s.i18nKey("被退回"),
      archived: s.i18nKey("已归档"),
      void: s.i18nKey("已作废")
    }, N = e.ref(!1), E = e.ref(!1), u = e.ref(""), L = e.ref(null), k = e.ref(""), g = e.ref({ type: "month_close", period: De(), name: "", prevProjectId: y.project?.id || "" });
    function b(m) {
      const f = ie.moduleById(m);
      return f ? `${f.code} ${s.t(f.name)}` : m;
    }
    async function h(m) {
      if (m)
        try {
          await Y("project.switch", { id: m }), r("changed");
        } catch (f) {
          u.value = Q.errorMessage(f);
        }
    }
    async function K() {
      E.value = !0, u.value = "";
      try {
        await Y("project.create", { ...g.value, prevProjectId: g.value.prevProjectId || void 0 }), N.value = !1, r("changed");
      } catch (m) {
        u.value = Q.errorMessage(m);
      } finally {
        E.value = !1;
      }
    }
    async function T() {
      u.value = "";
      try {
        L.value = await Y("project.status", { id: y.project?.id });
      } catch (m) {
        u.value = Q.errorMessage(m);
      }
    }
    async function z() {
      if (L.value) {
        E.value = !0, u.value = "";
        try {
          await Y("project.archive", { id: L.value.project.id }), await T(), r("changed");
        } catch (m) {
          u.value = Q.errorMessage(m);
        } finally {
          E.value = !1;
        }
      }
    }
    async function S() {
      if (L.value) {
        E.value = !0, u.value = "";
        try {
          k.value = (await Y("project.exportMd", { id: L.value.project.id })).path;
        } catch (m) {
          u.value = Q.errorMessage(m);
        } finally {
          E.value = !1;
        }
      }
    }
    async function w() {
      try {
        await Y("artifact.reveal", { path: k.value });
      } catch (m) {
        u.value = Q.errorMessage(m);
      }
    }
    return B({ openDetail: T, openCreate: () => {
      N.value = !0;
    } }), y.openDetailOnMount && T(), (m, f) => (e.openBlock(), e.createElementBlock(
      e.Fragment,
      null,
      [
        e.createElementVNode("span", pn, [
          e.createElementVNode(
            "small",
            yn,
            e.toDisplayString(m.$t("项目")),
            1
            /* TEXT */
          ),
          e.createElementVNode("select", {
            value: i.project?.id || "",
            "data-test": "fau-project-select",
            onChange: f[0] || (f[0] = (p) => h(p.target.value))
          }, [
            i.projects.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "option",
              Vn,
              e.toDisplayString(m.$t("还没有项目")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(i.projects, (p) => (e.openBlock(), e.createElementBlock("option", {
                key: p.id,
                value: p.id
              }, e.toDisplayString(p.name) + e.toDisplayString(p.status === "archived" ? ` · ${m.$t("已归档")}` : ""), 9, En))),
              128
              /* KEYED_FRAGMENT */
            ))
          ], 40, Nn),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            "data-test": "fau-project-new",
            onClick: f[1] || (f[1] = (p) => N.value = !N.value)
          }, [
            f[9] || (f[9] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(m.$t("新建项目")),
              1
              /* TEXT */
            )
          ]),
          i.project ? (e.openBlock(), e.createElementBlock("button", {
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
              e.toDisplayString(m.$t("项目详情")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ]),
        N.value ? (e.openBlock(), e.createElementBlock("div", vn, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(m.$t("新建项目")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", gn, [
            e.createElementVNode("label", kn, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(m.$t("类型")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": f[2] || (f[2] = (p) => g.value.type = p)
                },
                [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(n, (p, I) => e.createElementVNode("option", {
                      key: I,
                      value: I
                    }, e.toDisplayString(m.$t(p)), 9, fn)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, g.value.type]
              ])
            ]),
            e.createElementVNode("label", hn, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(g.value.type === "month_close" ? m.$t("期间（YYYY-MM）") : m.$t("期间（YYYY 或 YYYY-MM）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": f[3] || (f[3] = (p) => g.value.period = p),
                  dir: "ltr",
                  "data-test": "fau-project-period"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  g.value.period,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", $n, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(m.$t("名称（可不填）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": f[4] || (f[4] = (p) => g.value.name = p)
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
            e.createElementVNode("label", _n, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(m.$t("上一期项目（可选）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": f[5] || (f[5] = (p) => g.value.prevProjectId = p)
                },
                [
                  e.createElementVNode(
                    "option",
                    Bn,
                    e.toDisplayString(m.$t("无")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(i.projects, (p) => (e.openBlock(), e.createElementBlock("option", {
                      key: p.id,
                      value: p.id
                    }, e.toDisplayString(p.name), 9, bn))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, g.value.prevProjectId]
              ])
            ])
          ]),
          e.createElementVNode(
            "p",
            Sn,
            e.toDisplayString(m.$t("关联上一期后，上期期末余额与未达账项会带入本期比对（如连续 3 个月同方向未达）。")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", Dn, [
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
                e.toDisplayString(m.$t("创建")),
                1
                /* TEXT */
              )
            ], 8, Cn),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-btn ghost",
                onClick: f[6] || (f[6] = (p) => N.value = !1)
              },
              e.toDisplayString(m.$t("取消")),
              1
              /* TEXT */
            )
          ]),
          u.value ? (e.openBlock(), e.createElementBlock("p", wn, [
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
          onClick: f[7] || (f[7] = (p) => L.value = null)
        })) : e.createCommentVNode("v-if", !0),
        L.value ? (e.openBlock(), e.createElementBlock("aside", {
          key: 2,
          class: "fau-drawer",
          role: "dialog",
          "aria-label": m.$t("项目详情"),
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
              onClick: f[8] || (f[8] = (p) => L.value = null)
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
          e.createElementVNode("div", Ln, [
            e.createElementVNode("dl", Kn, [
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(m.$t("类型")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(m.$t(n[L.value.project.type])),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(m.$t("期间")),
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
                e.toDisplayString(m.$t("状态")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(m.$t(c[L.value.project.status])),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(m.$t("上一期项目")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(L.value.prev?.name || m.$t("无")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(m.$t("签核")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "dd",
                null,
                e.toDisplayString(m.$t("待签 {a} · 已归档 {b} · 被退回 {c}", { a: L.value.signoff.pending, b: L.value.signoff.signed, c: L.value.signoff.returned })),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(m.$t("运行记录")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", An, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(L.value.runs, (p) => (e.openBlock(), e.createElementBlock("li", {
                  key: p.id,
                  onClick: (I) => r("open-run", p.moduleId, p.id)
                }, [
                  e.createElementVNode(
                    "span",
                    In,
                    e.toDisplayString(b(p.moduleId)) + " · " + e.toDisplayString(m.$t(a[p.status] || p.status)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("small", Pn, [
                    e.createVNode(l, {
                      value: e.unref(Te)(p.updatedAt)
                    }, null, 8, ["value"])
                  ])
                ], 8, Fn))),
                128
                /* KEYED_FRAGMENT */
              )),
              L.value.runs.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "li",
                On,
                e.toDisplayString(m.$t("还没有运行")),
                1
                /* TEXT */
              ))
            ]),
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(m.$t("数据集")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", zn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(L.value.datasets, (p) => (e.openBlock(), e.createElementBlock("li", {
                  key: p.id
                }, [
                  e.createElementVNode(
                    "span",
                    Mn,
                    e.toDisplayString(p.label),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    jn,
                    e.toDisplayString(m.$t("{n} 行", { n: p.rowCount })),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              )),
              L.value.datasets.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "li",
                Rn,
                e.toDisplayString(m.$t("还没有导入数据")),
                1
                /* TEXT */
              ))
            ]),
            e.createElementVNode("div", qn, [
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
                  e.toDisplayString(m.$t("导出项目上下文（project.md）")),
                  1
                  /* TEXT */
                )
              ], 8, Un),
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
                  e.toDisplayString(m.$t("归档项目（只读）")),
                  1
                  /* TEXT */
                )
              ], 8, Wn)
            ]),
            k.value ? (e.openBlock(), e.createElementBlock("p", Yn, [
              f[16] || (f[16] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(m.$t("已导出：{p0}", { p0: k.value })) + " ",
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
                e.toDisplayString(m.$t("在文件夹中显示")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            u.value ? (e.openBlock(), e.createElementBlock("p", Gn, [
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
        ], 8, Tn)) : e.createCommentVNode("v-if", !0)
      ],
      64
      /* STABLE_FRAGMENT */
    ));
  }
}), Qn = /* @__PURE__ */ ae(Hn, [["__scopeId", "data-v-78691167"]]), Jn = { class: "fau-queue" }, Zn = { class: "fau-row" }, Xn = { class: "fau-badge" }, xn = { class: "fau-badge" }, ea = { class: "fau-badge" }, ta = {
  key: 0,
  class: "fau-list"
}, la = ["data-test", "onClick"], na = { class: "grow" }, aa = { class: "ss-muted" }, oa = {
  key: 1,
  class: "ss-muted"
}, sa = /* @__PURE__ */ e.defineComponent({
  __name: "SignoffQueue",
  props: {
    items: {}
  },
  emits: ["open"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = (a) => t.items.filter((N) => !N.returned && N.level === a).length, n = e.computed(() => t.items.filter((a) => a.returned).length);
    function c(a) {
      const N = ie.moduleById(a);
      return N ? `${N.code} ${s.t(N.name)}` : a;
    }
    return (a, N) => (e.openBlock(), e.createElementBlock("div", Jn, [
      e.createElementVNode("div", Zn, [
        e.createElementVNode(
          "span",
          Xn,
          e.toDisplayString(a.$t("待编制 {n}", { n: r("prepare") })),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          xn,
          e.toDisplayString(a.$t("待复核 {n}", { n: r("review") })),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          ea,
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
      i.items.length ? (e.openBlock(), e.createElementBlock("ul", ta, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(i.items, (E) => (e.openBlock(), e.createElementBlock("li", {
            key: E.runId + E.level,
            "data-test": `fau-queue-${E.moduleId}`,
            onClick: (u) => y("open", E)
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
              na,
              e.toDisplayString(c(E.moduleId)) + " · " + e.toDisplayString(E.returned ? a.$t("被退回") : a.$t("待{p0}", { p0: a.$t(e.unref(ge)[E.level]) })),
              1
              /* TEXT */
            ),
            e.createElementVNode("small", aa, [
              e.createVNode(l, {
                value: e.unref(Te)(E.since)
              }, null, 8, ["value"])
            ])
          ], 8, la))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        oa,
        e.toDisplayString(a.$t("没有待签项")),
        1
        /* TEXT */
      ))
    ]));
  }
}), ra = {
  class: "fau-arts",
  "data-test": "fau-artifacts"
}, ia = {
  key: 0,
  class: "ss-note"
}, ca = ["title"], da = ["onClick"], ua = ["onClick"], ma = ["onClick"], pa = {
  key: 1,
  class: "fau-preview",
  "data-test": "fau-preview"
}, ya = { class: "fau-row" }, Na = { class: "grow" }, Va = {
  key: 0,
  class: "fau-badge muted"
}, Ea = {
  key: 0,
  class: "ss-note danger"
}, va = { class: "fau-seg fau-sheets" }, ga = ["onClick"], ka = ["dir"], fa = { class: "fau-table" }, ha = ["dir"], $a = /* @__PURE__ */ e.defineComponent({
  __name: "ArtifactPreview",
  props: {
    artifacts: {},
    archived: { type: Boolean }
  },
  setup(i) {
    const B = e.ref(null), t = e.ref(null), y = e.ref(0), r = e.ref(""), n = (N) => N.split(/[\\/]/).pop() || N;
    async function c(N) {
      B.value = N, t.value = null, y.value = 0, r.value = "";
      try {
        t.value = await Y("artifact.preview", { path: N.path, maxRows: 40 });
      } catch (E) {
        r.value = Q.errorMessage(E);
      }
    }
    async function a(N, E) {
      try {
        await Y(E ? "artifact.reveal" : "artifact.open", { path: N.path });
      } catch (u) {
        Ke.useNotificationStore().error(Q.errorMessage(u));
      }
    }
    return (N, E) => (e.openBlock(), e.createElementBlock("div", ra, [
      i.artifacts.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", ia, [
        E[1] || (E[1] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(N.$t("还没有生成文件")),
          1
          /* TEXT */
        )
      ])),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(i.artifacts, (u) => (e.openBlock(), e.createElementBlock("div", {
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
            e.toDisplayString(e.unref(X)(u.title)),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", i.archived ? "ok" : "warn"])
            },
            e.toDisplayString(i.archived ? N.$t("已签核·已归档") : N.$t("草稿—待签核")),
            3
            /* TEXT, CLASS */
          ),
          e.createElementVNode("code", {
            title: u.path
          }, [
            e.createVNode(l, {
              value: n(u.path)
            }, null, 8, ["value"])
          ], 8, ca),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            onClick: (L) => c(u)
          }, [
            E[2] || (E[2] = e.createElementVNode(
              "i",
              { class: "ri-eye-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(N.$t("预览")),
              1
              /* TEXT */
            )
          ], 8, da),
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
              e.toDisplayString(N.$t("打开")),
              1
              /* TEXT */
            )
          ], 8, ua),
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
              e.toDisplayString(N.$t("在文件夹中显示")),
              1
              /* TEXT */
            )
          ], 8, ma)
        ]))),
        128
        /* KEYED_FRAGMENT */
      )),
      B.value ? (e.openBlock(), e.createElementBlock("div", pa, [
        e.createElementVNode("div", ya, [
          e.createElementVNode(
            "strong",
            Na,
            e.toDisplayString(e.unref(X)(B.value.title)),
            1
            /* TEXT */
          ),
          t.value?.rtl ? (e.openBlock(), e.createElementBlock("span", Va, "RTL")) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn ghost sm",
            onClick: E[0] || (E[0] = (u) => B.value = null)
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
        r.value ? (e.openBlock(), e.createElementBlock("p", Ea, [
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
            e.createElementVNode("div", va, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.sheets, (u, L) => (e.openBlock(), e.createElementBlock("button", {
                  key: u.name,
                  type: "button",
                  class: e.normalizeClass({ on: y.value === L }),
                  onClick: (k) => y.value = L
                }, e.toDisplayString(u.name), 11, ga))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", {
              class: "fau-table-wrap",
              dir: t.value.rtl ? "rtl" : void 0
            }, [
              e.createElementVNode("table", fa, [
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(t.value.sheets[y.value]?.rows || [], (u, L) => (e.openBlock(), e.createElementBlock("tr", { key: L }, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(u, (k, g) => (e.openBlock(), e.createElementBlock(
                          "td",
                          {
                            key: g,
                            class: e.normalizeClass({ num: typeof k == "number" })
                          },
                          [
                            typeof k == "number" ? (e.openBlock(), e.createBlock(l, {
                              key: 0,
                              value: k
                            }, null, 8, ["value"])) : (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              { key: 1 },
                              [
                                e.createTextVNode(
                                  e.toDisplayString(k),
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
            ], 8, ka)
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
        ], 8, ha)) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), _a = /* @__PURE__ */ ae($a, [["__scopeId", "data-v-9be22def"]]), Ba = ["aria-label"], ba = { class: "fau-drawer__body" }, Sa = { class: "ss-note info" }, Da = {
  key: 0,
  class: "ss-note danger"
}, Ca = {
  key: 1,
  class: "fau-table-wrap"
}, wa = { class: "fau-table" }, Ta = { class: "num" }, La = { class: "wrap" }, Ka = ["title"], Aa = { class: "num" }, Fa = {
  key: 0,
  class: "ss-muted"
}, Ia = { class: "wrap" }, Pa = /* @__PURE__ */ e.defineComponent({
  __name: "JudgementDrawer",
  props: {
    open: { type: Boolean },
    modules: {},
    currency: {}
  },
  emits: ["close"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = e.ref([]), n = e.ref("");
    return e.watch(() => t.open, async (c) => {
      if (c)
        try {
          r.value = await Y("thresholds.get", { modules: t.modules }), n.value = "";
        } catch (a) {
          n.value = Q.errorMessage(a);
        }
    }, { immediate: !0 }), (c, a) => (e.openBlock(), e.createElementBlock(
      e.Fragment,
      null,
      [
        i.open ? (e.openBlock(), e.createElementBlock("div", {
          key: 0,
          class: "fau-drawer-mask",
          onClick: a[0] || (a[0] = (N) => y("close"))
        })) : e.createCommentVNode("v-if", !0),
        i.open ? (e.openBlock(), e.createElementBlock("aside", {
          key: 1,
          class: "fau-drawer",
          role: "dialog",
          "aria-label": c.$t("判断依据"),
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
                " " + e.toDisplayString(c.$t("判断依据")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn ghost sm",
              onClick: a[1] || (a[1] = (N) => y("close"))
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
          e.createElementVNode("div", ba, [
            e.createElementVNode("p", Sa, [
              a[4] || (a[4] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(c.$t("阈值默认值来自源技能的判断框架，可在首次配置里按公司修改；原文为中文，以原文为准。")),
                1
                /* TEXT */
              )
            ]),
            n.value ? (e.openBlock(), e.createElementBlock("p", Da, [
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
            ])) : (e.openBlock(), e.createElementBlock("div", Ca, [
              e.createElementVNode("table", wa, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(c.$t("阈值")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Ta,
                      e.toDisplayString(c.$t("当前值")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(c.$t("依据")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(r.value, (N) => (e.openBlock(), e.createElementBlock("tr", {
                      key: N.key
                    }, [
                      e.createElementVNode("td", La, [
                        e.createElementVNode(
                          "div",
                          null,
                          e.toDisplayString(N.label ? c.$t(N.label) : N.original),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("small", {
                          class: "ss-muted",
                          title: c.$t("以原文为准")
                        }, e.toDisplayString(N.original), 9, Ka)
                      ]),
                      e.createElementVNode("td", Aa, [
                        e.createVNode(l, {
                          value: e.unref($t)(N, N.override ?? N.value)
                        }, null, 8, ["value"]),
                        e.createTextVNode(
                          " " + e.toDisplayString(e.unref(We)(N, i.currency || "")) + " ",
                          1
                          /* TEXT */
                        ),
                        N.override != null ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Fa,
                          " · " + e.toDisplayString(c.$t("已按公司覆盖")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", Ia, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(e.unref(Ye)(N)),
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
        ], 8, Ba)) : e.createCommentVNode("v-if", !0)
      ],
      64
      /* STABLE_FRAGMENT */
    ));
  }
}), Oa = {
  class: "fau-sign",
  "data-test": "fau-signoff"
}, za = { class: "fau-levels" }, Ma = { key: 0 }, ja = { key: 1 }, Ra = { key: 2 }, qa = {
  key: 0,
  class: "ss-note warn"
}, Ua = {
  key: 1,
  class: "ss-note danger",
  "data-test": "fau-returned"
}, Wa = {
  key: 2,
  class: "fau-sign__form"
}, Ya = { class: "ss-grid" }, Ga = { class: "ss-field" }, Ha = ["value"], Qa = { value: "__manual" }, Ja = { class: "ss-field" }, Za = { class: "ss-field" }, Xa = {
  key: 0,
  class: "fau-acks"
}, xa = { class: "fau-row" }, eo = { class: "grow" }, to = ["value", "disabled", "data-test"], lo = { class: "grow" }, no = {
  key: 0,
  class: "fau-badge warn"
}, ao = {
  key: 1,
  class: "fau-badge bad"
}, oo = { class: "ss-field" }, so = { class: "ss-actions" }, ro = ["disabled"], io = ["disabled"], co = { class: "ss-field inline" }, uo = ["value"], mo = ["disabled"], po = {
  key: 1,
  class: "ss-note danger",
  "data-test": "fau-sign-error"
}, yo = {
  key: 3,
  class: "ss-note"
}, No = {
  key: 4,
  class: "ss-note ok"
}, Vo = { class: "fau-row" }, Eo = { class: "grow" }, vo = ["disabled"], go = {
  key: 6,
  class: "fau-prov"
}, ko = {
  key: 7,
  class: "fau-table-wrap"
}, fo = { class: "fau-table" }, ho = {
  key: 0,
  class: "fau-badge warn"
}, $o = { class: "wrap" }, _o = /* @__PURE__ */ e.defineComponent({
  __name: "SignoffCard",
  props: {
    run: {},
    company: {},
    active: {},
    nextLevel: {},
    baseLevels: {}
  },
  emits: ["changed"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = ["validate", "analyze", "draft"], n = (_) => kt().find((v) => v.key === _)?.title || _, c = e.ref(!1), a = e.ref(""), N = e.ref([]), E = e.ref(""), u = e.ref("analyze"), L = e.ref(""), k = e.ref({ name: "", title: "" }), g = e.ref([]), b = e.ref(null), h = e.computed(() => !!t.nextLevel && t.run.artifacts.length > 0 && ["ready", "signing"].includes(t.run.status)), K = e.computed(() => t.run.requiredLevels.includes("approve") && !t.baseLevels.includes("approve")), T = e.computed(() => t.company.signers.filter((_) => t.nextLevel && _.levels.includes(t.nextLevel))), z = (_) => t.active.find((v) => v.level === _ && v.decision === "approve"), S = (_) => z(_) ? "done" : t.nextLevel === _ ? "current" : "todo";
    e.watch(() => [t.nextLevel, t.run.id], () => {
      L.value = T.value[0]?.id || "__manual", N.value = [], E.value = "", a.value = "", w();
    }, { immediate: !0 });
    async function w() {
      try {
        g.value = await Y("signoff.history", { runId: t.run.id });
      } catch {
        g.value = [];
      }
    }
    function m() {
      N.value = t.run.reminders.filter((_) => !(_.approverOnly && t.nextLevel !== "approve")).map((_) => _.id);
    }
    function f() {
      if (L.value === "__manual") return { ...k.value };
      const _ = t.company.signers.find((v) => v.id === L.value);
      return _ ? { name: _.name, title: _.title } : { name: "", title: "" };
    }
    async function p(_) {
      if (t.nextLevel) {
        c.value = !0, a.value = "";
        try {
          const v = { runId: t.run.id, level: t.nextLevel, decision: _, signer: f(), comment: E.value, acknowledged: N.value, returnToStep: u.value };
          await Y(t.nextLevel === "prepare" ? "signoff.submit" : "signoff.decide", v), y("changed"), await w();
        } catch (v) {
          a.value = Q.errorMessage(v);
        } finally {
          c.value = !1;
        }
      }
    }
    async function I() {
      c.value = !0;
      try {
        b.value = await Y("signoff.verify", { runId: t.run.id });
      } catch (_) {
        a.value = Q.errorMessage(_);
      } finally {
        c.value = !1;
      }
    }
    return (_, v) => (e.openBlock(), e.createElementBlock("div", Oa, [
      e.createElementVNode("div", za, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(i.run.requiredLevels, (R) => (e.openBlock(), e.createElementBlock(
            "div",
            {
              key: R,
              class: e.normalizeClass(["fau-level", S(R)])
            },
            [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(_.$t(e.unref(ge)[R])),
                1
                /* TEXT */
              ),
              z(R) ? (e.openBlock(), e.createElementBlock("small", Ma, [
                e.createTextVNode(
                  e.toDisplayString(z(R).signer.name) + " · ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: e.unref(Te)(z(R).at)
                }, null, 8, ["value"])
              ])) : i.nextLevel === R ? (e.openBlock(), e.createElementBlock(
                "small",
                ja,
                e.toDisplayString(_.$t("轮到这一级")),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "small",
                Ra,
                e.toDisplayString(_.$t("待签")),
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
      K.value ? (e.openBlock(), e.createElementBlock("p", qa, [
        v[9] || (v[9] = e.createElementVNode(
          "i",
          { class: "ri-alarm-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(_.$t("命中升级条件（如试算不平、跨期 > 5 万、不明扣款 > 1000），必须由批准人签核")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      i.run.status === "returned" && i.run.returned ? (e.openBlock(), e.createElementBlock("p", Ua, [
        v[10] || (v[10] = e.createElementVNode(
          "i",
          { class: "ri-arrow-go-back-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(_.$t("{p0}退回：{p1}（回到第 {n} 步）", { p0: _.$t(e.unref(ge)[i.run.returned.level]), p1: i.run.returned.comment, n: e.unref(Se).indexOf(i.run.returned.toStep) + 1 })),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      h.value ? (e.openBlock(), e.createElementBlock("div", Wa, [
        e.createElementVNode("div", Ya, [
          e.createElementVNode("label", Ga, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(_.$t("签核人身份（{p0}）", { p0: _.$t(e.unref(ge)[i.nextLevel]) })),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": v[0] || (v[0] = (R) => L.value = R),
                "data-test": "fau-signer"
              },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(T.value, (R) => (e.openBlock(), e.createElementBlock("option", {
                    key: R.id,
                    value: R.id
                  }, e.toDisplayString(R.name) + " · " + e.toDisplayString(R.title), 9, Ha))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                e.createElementVNode(
                  "option",
                  Qa,
                  e.toDisplayString(_.$t("手动填写")),
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
              e.createElementVNode("label", Ja, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(_.$t("姓名")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": v[1] || (v[1] = (R) => k.value.name = R),
                    "data-test": "fau-signer-name"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    k.value.name,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", Za, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(_.$t("岗位")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": v[2] || (v[2] = (R) => k.value.title = R),
                    "data-test": "fau-signer-title"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    k.value.title,
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
        i.run.reminders.length ? (e.openBlock(), e.createElementBlock("div", Xa, [
          e.createElementVNode("div", xa, [
            e.createElementVNode(
              "strong",
              eo,
              e.toDisplayString(_.$t("提醒项：逐条确认「已知悉」")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-link",
                onClick: m
              },
              e.toDisplayString(_.$t("全部勾选")),
              1
              /* TEXT */
            )
          ]),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(i.run.reminders, (R) => (e.openBlock(), e.createElementBlock(
              "label",
              {
                key: R.id,
                class: e.normalizeClass(["fau-ack", { locked: R.approverOnly && i.nextLevel !== "approve" }])
              },
              [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": v[3] || (v[3] = (d) => N.value = d),
                  type: "checkbox",
                  value: R.id,
                  disabled: R.approverOnly && i.nextLevel !== "approve",
                  "data-test": `fau-ack-${R.id}`
                }, null, 8, to), [
                  [e.vModelCheckbox, N.value]
                ]),
                e.createElementVNode(
                  "span",
                  lo,
                  e.toDisplayString(e.unref(X)(R.message)),
                  1
                  /* TEXT */
                ),
                R.approverOnly ? (e.openBlock(), e.createElementBlock(
                  "span",
                  no,
                  e.toDisplayString(_.$t("批准人确认")),
                  1
                  /* TEXT */
                )) : R.source === "escalation" ? (e.openBlock(), e.createElementBlock(
                  "span",
                  ao,
                  e.toDisplayString(_.$t("升级")),
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
        e.createElementVNode("label", oo, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(i.run.reminders.length ? _.$t("意见 / 知悉理由（必填）") : _.$t("意见")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": v[4] || (v[4] = (R) => E.value = R),
              "data-test": "fau-sign-comment"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, E.value]
          ])
        ]),
        e.createElementVNode("div", so, [
          i.nextLevel === "prepare" ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-btn primary",
            disabled: c.value,
            "data-test": "fau-sign-prepare",
            onClick: v[5] || (v[5] = (R) => p("approve"))
          }, [
            v[11] || (v[11] = e.createElementVNode(
              "i",
              { class: "ri-quill-pen-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(_.$t("编制签核")),
              1
              /* TEXT */
            )
          ], 8, ro)) : (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 1 },
            [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: c.value,
                "data-test": "fau-sign-approve",
                onClick: v[6] || (v[6] = (R) => p("approve"))
              }, [
                v[12] || (v[12] = e.createElementVNode(
                  "i",
                  { class: "ri-check-double-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(_.$t("通过（{p0}）", { p0: _.$t(e.unref(ge)[i.nextLevel]) })),
                  1
                  /* TEXT */
                )
              ], 8, io),
              v[14] || (v[14] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("label", co, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(_.$t("退回到")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": v[7] || (v[7] = (R) => u.value = R),
                    "data-test": "fau-return-step"
                  },
                  [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(r, (R) => e.createElementVNode("option", {
                        key: R,
                        value: R
                      }, e.toDisplayString(_.$t("第 {n} 步", { n: e.unref(Se).indexOf(R) + 1 })) + " · " + e.toDisplayString(n(R)), 9, uo)),
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
                disabled: c.value,
                "data-test": "fau-sign-return",
                onClick: v[8] || (v[8] = (R) => p("return"))
              }, [
                v[13] || (v[13] = e.createElementVNode(
                  "i",
                  { class: "ri-arrow-go-back-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(_.$t("退回")),
                  1
                  /* TEXT */
                )
              ], 8, mo)
            ],
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        a.value ? (e.openBlock(), e.createElementBlock("p", po, [
          v[15] || (v[15] = e.createElementVNode(
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
      ])) : i.run.artifacts.length ? i.run.status === "archived" ? (e.openBlock(), e.createElementBlock("p", No, [
        v[17] || (v[17] = e.createElementVNode(
          "i",
          { class: "ri-shield-check-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(_.$t("各级签核完成，已归档")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", yo, [
        v[16] || (v[16] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(_.$t("还没有生成底稿，不能签核")),
          1
          /* TEXT */
        )
      ])),
      e.createElementVNode("div", Vo, [
        e.createElementVNode(
          "strong",
          Eo,
          e.toDisplayString(_.$t("签核历史")),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: c.value,
          "data-test": "fau-verify",
          onClick: I
        }, [
          v[18] || (v[18] = e.createElementVNode(
            "i",
            { class: "ri-shield-keyhole-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(_.$t("校验签核")),
            1
            /* TEXT */
          )
        ], 8, vo)
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
            e.toDisplayString(e.unref(X)(b.value.message)),
            1
            /* TEXT */
          )
        ],
        2
        /* CLASS */
      )) : e.createCommentVNode("v-if", !0),
      b.value && b.value.tampered.length ? (e.openBlock(), e.createElementBlock("ul", go, [
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
      g.value.length ? (e.openBlock(), e.createElementBlock("div", ko, [
        e.createElementVNode("table", fo, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(_.$t("签核级别")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(_.$t("决定")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(_.$t("签核人")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(_.$t("签核时间")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(_.$t("意见")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(g.value, (R) => (e.openBlock(), e.createElementBlock(
                "tr",
                {
                  key: R.id,
                  class: e.normalizeClass({ bad: R.decision === "return" })
                },
                [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(_.$t(e.unref(ge)[R.level])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createTextVNode(
                      e.toDisplayString(R.decision === "approve" ? _.$t("通过") : _.$t("退回")),
                      1
                      /* TEXT */
                    ),
                    R.sodWaived ? (e.openBlock(), e.createElementBlock(
                      "span",
                      ho,
                      e.toDisplayString(_.$t("职责未分离")),
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
                      value: e.unref(Te)(R.at)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    $o,
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
}), Bo = /* @__PURE__ */ ae(_o, [["__scopeId", "data-v-e0800251"]]), bo = {
  class: "fau-vr",
  "data-test": "fau-validation"
}, So = {
  key: 0,
  class: "ss-note"
}, Do = { class: "fau-row" }, Co = {
  key: 0,
  class: "fau-table-wrap"
}, wo = { class: "fau-table" }, To = { class: "wrap" }, Lo = { class: "grow" }, Ko = { key: 0 }, Ao = /* @__PURE__ */ e.defineComponent({
  __name: "ValidationReport",
  props: {
    report: {}
  },
  setup(i) {
    return (B, t) => (e.openBlock(), e.createElementBlock("div", bo, [
      i.report ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("div", Do, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["fau-badge", i.report.blockers.length ? "bad" : "ok"])
              },
              e.toDisplayString(B.$t("阻断项 {n}", { n: i.report.blockers.length })),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["fau-badge", i.report.warnings.length ? "warn" : "muted"])
              },
              e.toDisplayString(B.$t("提醒项 {n}", { n: i.report.warnings.length })),
              3
              /* TEXT, CLASS */
            )
          ]),
          i.report.checks.length ? (e.openBlock(), e.createElementBlock("div", Co, [
            e.createElementVNode("table", wo, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(B.$t("检查项")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(B.$t("结果")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(i.report.checks, (y) => (e.openBlock(), e.createElementBlock(
                    "tr",
                    {
                      key: y.id,
                      class: e.normalizeClass({ bad: !y.ok && y.level === "block", warn: !y.ok && y.level === "warn" })
                    },
                    [
                      e.createElementVNode(
                        "td",
                        To,
                        e.toDisplayString(e.unref(X)(y.message)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(y.ok ? "fau-true" : "fau-false")
                          },
                          e.toDisplayString(y.ok ? "TRUE" : "FALSE"),
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
            e.renderList({ block: i.report.blockers, warn: i.report.warnings }, (y, r) => (e.openBlock(), e.createElementBlock("ul", {
              key: r,
              class: "fau-issues"
            }, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(y, (n) => (e.openBlock(), e.createElementBlock(
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
                      Lo,
                      e.toDisplayString(e.unref(X)(n.message)),
                      1
                      /* TEXT */
                    ),
                    n.rows?.length ? (e.openBlock(), e.createElementBlock("small", Ko, [
                      e.createTextVNode(
                        e.toDisplayString(B.$t("行号")) + ": ",
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
      )) : (e.openBlock(), e.createElementBlock("p", So, [
        t[0] || (t[0] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(B.$t("还没有校验结果")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), Fo = /* @__PURE__ */ ae(Ao, [["__scopeId", "data-v-59267f4c"]]), Io = {
  key: 0,
  class: "fau-close",
  "data-test": "fau-close-panel"
}, Po = {
  key: 0,
  open: "",
  class: "fau-sec",
  "data-test": "fau-checklist"
}, Oo = { class: "ss-muted" }, zo = {
  key: 0,
  class: "fau-prov"
}, Mo = { class: "fau-table-wrap" }, jo = { class: "fau-table" }, Ro = { class: "wrap" }, qo = {
  key: 0,
  class: "fau-badge muted"
}, Uo = ["value", "disabled", "data-test", "onChange"], Wo = ["value"], Yo = { class: "wrap" }, Go = {
  key: 0,
  class: "ss-muted"
}, Ho = ["value", "disabled", "placeholder", "onChange"], Qo = {
  key: 1,
  class: "ss-note danger"
}, Jo = {
  key: 1,
  open: "",
  class: "fau-sec",
  "data-test": "fau-trial"
}, Zo = { class: "fau-table-wrap" }, Xo = { class: "fau-table" }, xo = { class: "num" }, es = { class: "num" }, ts = { class: "num" }, ls = { class: "num" }, ns = { class: "num" }, as = { class: "num" }, os = { class: "num" }, ss = { class: "num" }, rs = { class: "fau-table-wrap" }, is = { class: "fau-table" }, cs = { class: "num" }, ds = { class: "num" }, us = { class: "num" }, ms = ["data-test"], ps = { class: "wrap" }, ys = { class: "ss-muted" }, Ns = { class: "num" }, Vs = { class: "num" }, Es = { class: "num" }, vs = ["open"], gs = {
  key: 0,
  class: "fau-table-wrap"
}, ks = { class: "fau-table" }, fs = { class: "num" }, hs = { class: "num" }, $s = ["data-test"], _s = { class: "num" }, Bs = { class: "num" }, bs = {
  key: 0,
  class: "fau-badge warn"
}, Ss = { class: "wrap" }, Ds = {
  key: 1,
  class: "ss-muted"
}, Cs = {
  key: 3,
  open: "",
  class: "fau-sec",
  "data-test": "fau-accruals"
}, ws = { class: "fau-badge muted" }, Ts = { class: "ss-actions" }, Ls = ["disabled"], Ks = ["onClick"], As = {
  key: 0,
  class: "fau-table-wrap"
}, Fs = { class: "fau-table" }, Is = { class: "num" }, Ps = { class: "num" }, Os = { class: "num" }, zs = ["data-test"], Ms = { class: "num" }, js = { class: "num" }, Rs = { class: "num" }, qs = {
  key: 1,
  class: "ss-muted"
}, Us = {
  key: 4,
  open: "",
  class: "fau-sec",
  "data-test": "fau-roll"
}, Ws = { class: "ss-muted" }, Ys = { class: "fau-table-wrap" }, Gs = { class: "fau-table" }, Hs = { class: "num" }, Qs = { class: "num" }, Js = { class: "num" }, Zs = { class: "num" }, Xs = { class: "num" }, xs = { class: "num" }, er = { class: "num" }, tr = { class: "num" }, lr = { class: "num" }, nr = ["data-test"], ar = { class: "num" }, or = { class: "num" }, sr = { class: "num" }, rr = { class: "num" }, ir = { class: "num" }, cr = { class: "num" }, dr = { class: "num" }, ur = { class: "num" }, mr = { class: "num" }, pr = {
  key: 5,
  open: "",
  class: "fau-sec",
  "data-test": "fau-flux"
}, yr = { class: "fau-badge muted" }, Nr = { class: "fau-table-wrap" }, Vr = { class: "fau-table" }, Er = { class: "num" }, vr = { class: "num" }, gr = { class: "num" }, kr = ["data-test"], fr = { class: "num" }, hr = { class: "num" }, $r = { class: "num" }, _r = { class: "num" }, Br = { class: "wrap" }, br = ["open"], Sr = { class: "fau-badge muted" }, Dr = {
  key: 0,
  class: "fau-prov"
}, Cr = {
  key: 1,
  class: "ss-muted"
}, wr = /* @__PURE__ */ e.defineComponent({
  __name: "ClosePanel",
  props: {
    run: {},
    def: {}
  },
  emits: ["changed"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = ye.useRouter(), n = e.computed(() => t.run.result), c = e.computed(() => ["signing", "archived", "void"].includes(t.run.status)), a = e.computed(() => (n.value?.rollForward || []).filter((S) => S.unexplained !== 0).length), N = e.computed(() => t.def.reuse || []), E = e.ref(!1), u = e.ref(""), L = { ok: s.i18nKey("通过"), warn: s.i18nKey("提醒"), fail: s.i18nKey("不通过"), pending: s.i18nKey("待评") }, k = {
      trial: s.i18nKey("试算平衡"),
      bs: s.i18nKey("资产 = 负债 + 所有者权益"),
      np_retained: s.i18nKey("净利润 = 未分配利润本期增加"),
      cashflow: s.i18nKey("现金流量净额 = 货币资金变动"),
      opening: s.i18nKey("期初 = 上期期末"),
      movement: s.i18nKey("序时账发生额 = 余额表本期发生")
    }, g = { omitted: s.i18nKey("漏做"), early: s.i18nKey("提前"), late: s.i18nKey("延迟") }, b = { preparer: s.i18nKey("编制人"), reviewer: s.i18nKey("复核人"), approver: s.i18nKey("批准人") }, h = { none: s.i18nKey("未写说明"), verified: s.i18nKey("已核实"), unverified: s.i18nKey("未核实"), unknown: s.i18nKey("原因不明，待主管确认") }, K = { none: "muted", verified: "ok", unverified: "bad", unknown: "warn" };
    async function T(S, w, m) {
      E.value = !0, u.value = "";
      try {
        await Y("close.checklist.update", { runId: t.run.id, itemId: S, mark: w, evidence: m }), y("changed");
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
        Ke.useNotificationStore().error(Q.errorMessage(S));
      } finally {
        E.value = !1;
      }
    }
    return (S, w) => n.value ? (e.openBlock(), e.createElementBlock("div", Io, [
      n.value.checklist ? (e.openBlock(), e.createElementBlock("details", Po, [
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
            Oo,
            e.toDisplayString(S.$t("通过 {a} · 提醒 {b} · 不通过 {c} · 待评 {d}", { a: n.value.checklist.counts.ok, b: n.value.checklist.counts.warn, c: n.value.checklist.counts.fail, d: n.value.checklist.counts.pending })),
            1
            /* TEXT */
          )
        ]),
        n.value.checklist.reasons.length ? (e.openBlock(), e.createElementBlock("ul", zo, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n.value.checklist.reasons, (m, f) => (e.openBlock(), e.createElementBlock(
              "li",
              { key: f },
              e.toDisplayString(e.unref(X)(m)),
              1
              /* TEXT */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", Mo, [
          e.createElementVNode("table", jo, [
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
                e.renderList(n.value.checklist.items, (m, f) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: m.id,
                    class: e.normalizeClass({ bad: m.mark === "fail", warn: m.mark === "warn" })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(f + 1),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", Ro, [
                      e.createTextVNode(
                        e.toDisplayString(e.unref(X)(m.label)) + " ",
                        1
                        /* TEXT */
                      ),
                      m.critical ? (e.openBlock(), e.createElementBlock(
                        "span",
                        qo,
                        e.toDisplayString(S.$t("关键项")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(m.auto ? S.$t("自动") : S.$t("人工")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode("select", {
                        value: m.mark,
                        disabled: c.value || E.value,
                        "data-test": `fau-mark-${m.id}`,
                        onChange: (p) => T(m.id, p.target.value, m.evidence)
                      }, [
                        (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(L, (p, I) => e.createElementVNode("option", {
                            key: I,
                            value: I
                          }, e.toDisplayString(S.$t(p)), 9, Wo)),
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ], 40, Uo)
                    ]),
                    e.createElementVNode("td", Yo, [
                      m.note ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Go,
                        e.toDisplayString(e.unref(X)(m.note)),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      m.auto ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("input", {
                        key: 1,
                        value: m.evidence || "",
                        disabled: c.value || E.value,
                        placeholder: S.$t("证据（凭证号、文件名…）"),
                        onChange: (p) => T(m.id, m.mark, p.target.value)
                      }, null, 40, Ho))
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
        u.value ? (e.openBlock(), e.createElementBlock("p", Qo, [
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
      n.value.trial ? (e.openBlock(), e.createElementBlock("details", Jo, [
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
        e.createElementVNode("div", Zo, [
          e.createElementVNode("table", Xo, [
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
                  xo,
                  e.toDisplayString(S.$t("借方")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  es,
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
                e.createElementVNode("td", ts, [
                  e.createVNode(l, {
                    cents: n.value.trial.totals.openingDr
                  }, null, 8, ["cents"])
                ]),
                e.createElementVNode("td", ls, [
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
                e.createElementVNode("td", ns, [
                  e.createVNode(l, {
                    cents: n.value.trial.totals.periodDr
                  }, null, 8, ["cents"])
                ]),
                e.createElementVNode("td", as, [
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
                e.createElementVNode("td", os, [
                  e.createVNode(l, {
                    cents: n.value.trial.totals.closingDr
                  }, null, 8, ["cents"])
                ]),
                e.createElementVNode("td", ss, [
                  e.createVNode(l, {
                    cents: n.value.trial.totals.closingCr
                  }, null, 8, ["cents"])
                ])
              ])
            ])
          ])
        ]),
        e.createElementVNode("div", rs, [
          e.createElementVNode("table", is, [
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
                  cs,
                  e.toDisplayString(S.$t("左边")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ds,
                  e.toDisplayString(S.$t("右边")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  us,
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
                e.renderList(n.value.trial.checks, (m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: m.id,
                  class: e.normalizeClass({ bad: !m.ok }),
                  "data-test": `fau-tie-${m.id}`
                }, [
                  e.createElementVNode("td", ps, [
                    e.createTextVNode(
                      e.toDisplayString(S.$t(k[m.id] || m.id)),
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
                      ys,
                      e.toDisplayString(e.unref(X)(m.message)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", Ns, [
                    e.createVNode(l, {
                      cents: m.left
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Vs, [
                    e.createVNode(l, {
                      cents: m.right
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Es, [
                    e.createVNode(l, {
                      cents: m.diff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(m.ok ? "fau-true" : "fau-false")
                      },
                      e.toDisplayString(m.ok ? "TRUE" : "FALSE"),
                      3
                      /* TEXT, CLASS */
                    )
                  ])
                ], 10, ms))),
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
        n.value.crossPeriod.length ? (e.openBlock(), e.createElementBlock("div", gs, [
          e.createElementVNode("table", ks, [
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
                  fs,
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
                  hs,
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
                e.renderList(n.value.crossPeriod, (m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: m.id,
                  class: e.normalizeClass({ warn: m.adjustThisPeriod, bad: m.approval === "approver" }),
                  "data-test": `fau-cross-${m.voucherNo}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.voucherNo
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.date
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.businessDate
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.accountCode
                    }, null, 8, ["value"]),
                    e.createTextVNode(
                      " " + e.toDisplayString(m.accountName),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", _s, [
                    e.createVNode(l, {
                      cents: m.amount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(S.$t(g[m.type])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Bs, [
                    e.createVNode(l, {
                      value: m.days
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createTextVNode(
                      e.toDisplayString(S.$t(b[m.approval])),
                      1
                      /* TEXT */
                    ),
                    m.adjustThisPeriod ? (e.openBlock(), e.createElementBlock(
                      "span",
                      bs,
                      e.toDisplayString(S.$t("必须本期调整")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode(
                    "td",
                    Ss,
                    e.toDisplayString(e.unref(X)(m.advice)),
                    1
                    /* TEXT */
                  )
                ], 10, $s))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Ds,
          e.toDisplayString(S.$t("没有识别到跨期分录")),
          1
          /* TEXT */
        ))
      ], 8, vs)) : e.createCommentVNode("v-if", !0),
      n.value.accruals ? (e.openBlock(), e.createElementBlock("details", Cs, [
        e.createElementVNode("summary", null, [
          e.createTextVNode(
            e.toDisplayString(S.$t("计提表")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            ws,
            e.toDisplayString(n.value.accruals.length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ts, [
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
          ], 8, Ls),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(N.value, (m) => (e.openBlock(), e.createElementBlock("button", {
              key: m.workbench,
              type: "button",
              class: "ss-btn sm ghost",
              onClick: (f) => e.unref(r).push(m.route || "/")
            }, [
              w[4] || (w[4] = e.createElementVNode(
                "i",
                { class: "ri-external-link-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(S.$t(m.label || "")),
                1
                /* TEXT */
              )
            ], 8, Ks))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        n.value.accruals.length ? (e.openBlock(), e.createElementBlock("div", As, [
          e.createElementVNode("table", Fs, [
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
                  Is,
                  e.toDisplayString(S.$t("本期应摊")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ps,
                  e.toDisplayString(S.$t("已入账")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Os,
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
                e.renderList(n.value.accruals, (m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: m.policyId,
                  "data-test": `fau-accrual-${m.policyId}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.policyId
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(m.description),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.expenseAccount
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.liabilityAccount
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Ms, [
                    e.createVNode(l, {
                      cents: m.due
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", js, [
                    e.createVNode(l, {
                      cents: m.booked
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Rs, [
                    e.createElementVNode("strong", null, [
                      e.createVNode(l, {
                        cents: m.accrual
                      }, null, 8, ["cents"])
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.formula
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(m.autoReverse ? S.$t("是") : S.$t("否")),
                    1
                    /* TEXT */
                  )
                ], 8, zs))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0),
        n.value.jeDraft?.length ? (e.openBlock(), e.createElementBlock(
          "p",
          qs,
          e.toDisplayString(S.$t("已生成分录草稿 {n} 行（通用凭证导入格式，不过账）", { n: n.value.jeDraft.length })),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      n.value.rollForward ? (e.openBlock(), e.createElementBlock("details", Us, [
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
          Ws,
          e.toDisplayString(S.$t("期初 + 增加 + 计提 − 冲回 − 付款 ± 重分类 ± 折算 = 期末；轧不平的差额列为「未解释差异」，未倒挤。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Ys, [
          e.createElementVNode("table", Gs, [
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
                  Hs,
                  e.toDisplayString(S.$t("期初")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Qs,
                  e.toDisplayString(S.$t("增加")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Js,
                  e.toDisplayString(S.$t("计提")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Zs,
                  e.toDisplayString(S.$t("冲回")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Xs,
                  e.toDisplayString(S.$t("付款")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  xs,
                  e.toDisplayString(S.$t("其他")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  er,
                  e.toDisplayString(S.$t("计算期末")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  tr,
                  e.toDisplayString(S.$t("余额表期末")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  lr,
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
                e.renderList(n.value.rollForward, (m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: m.accountCode,
                  class: e.normalizeClass({ bad: m.unexplained !== 0 }),
                  "data-test": `fau-roll-${m.accountCode}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.accountCode
                    }, null, 8, ["value"]),
                    e.createTextVNode(
                      " " + e.toDisplayString(m.accountName),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", ar, [
                    e.createVNode(l, {
                      cents: m.opening
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", or, [
                    e.createVNode(l, {
                      cents: m.additions
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", sr, [
                    e.createVNode(l, {
                      cents: m.accruals
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", rr, [
                    e.createVNode(l, {
                      cents: m.reversals
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ir, [
                    e.createVNode(l, {
                      cents: m.payments
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", cr, [
                    e.createVNode(l, {
                      cents: m.other + m.reclass + m.fx
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", dr, [
                    e.createVNode(l, {
                      cents: m.computed
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ur, [
                    e.createVNode(l, {
                      cents: m.closing
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", mr, [
                    e.createElementVNode("strong", null, [
                      e.createVNode(l, {
                        cents: m.unexplained
                      }, null, 8, ["cents"])
                    ])
                  ])
                ], 10, nr))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      n.value.flux ? (e.openBlock(), e.createElementBlock("details", pr, [
        e.createElementVNode("summary", null, [
          e.createTextVNode(
            e.toDisplayString(S.$t("波动说明")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            yr,
            e.toDisplayString(n.value.flux.length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Nr, [
          e.createElementVNode("table", Vr, [
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
                  Er,
                  e.toDisplayString(S.$t("本期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  vr,
                  e.toDisplayString(S.$t("上期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  gr,
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
                e.renderList(n.value.flux, (m) => (e.openBlock(), e.createElementBlock("tr", {
                  key: m.accountCode,
                  class: e.normalizeClass({ bad: m.commentaryStatus === "unverified" }),
                  "data-test": `fau-flux-${m.accountCode}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: m.accountCode
                    }, null, 8, ["value"]),
                    e.createTextVNode(
                      " " + e.toDisplayString(m.accountName),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", fr, [
                    e.createVNode(l, {
                      cents: m.current
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", hr, [
                    e.createVNode(l, {
                      cents: m.prior
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", $r, [
                    e.createVNode(l, {
                      cents: m.diffPrior
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", _r, [
                    e.createVNode(l, {
                      ratio: m.diffPriorPct
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode(
                    "td",
                    Br,
                    e.toDisplayString(m.commentary),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["fau-badge", K[m.commentaryStatus]])
                      },
                      e.toDisplayString(S.$t(h[m.commentaryStatus])),
                      3
                      /* TEXT, CLASS */
                    )
                  ])
                ], 10, kr))),
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
            Sr,
            e.toDisplayString(n.value.openItems.length),
            1
            /* TEXT */
          )
        ]),
        n.value.openItems.length ? (e.openBlock(), e.createElementBlock("ul", Dr, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(n.value.openItems, (m) => (e.openBlock(), e.createElementBlock("li", {
              key: m.id
            }, [
              e.createTextVNode(
                e.toDisplayString(m.description) + " · ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                cents: m.amount
              }, null, 8, ["cents"])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Cr,
          e.toDisplayString(S.$t("对账中心签核后转交过来的差异会出现在这里")),
          1
          /* TEXT */
        ))
      ], 8, br)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Tr = /* @__PURE__ */ ae(wr, [["__scopeId", "data-v-4fe7f80a"]]), Lr = {
  key: 0,
  class: "fau-recon",
  "data-test": "fau-recon-panel"
}, Kr = ["data-test"], Ar = { class: "fau-row" }, Fr = { class: "grow" }, Ir = { class: "fau-counts" }, Pr = ["data-test"], Or = { class: "fau-table-wrap" }, zr = { class: "fau-table" }, Mr = { class: "num" }, jr = { class: "num" }, Rr = { class: "num" }, qr = { class: "num" }, Ur = { class: "num" }, Wr = { class: "num" }, Yr = { class: "num" }, Gr = { class: "num" }, Hr = { class: "num" }, Qr = {
  key: 0,
  class: "fau-esc",
  "data-test": "fau-bank-escalations"
}, Jr = ["open"], Zr = { class: "fau-table-wrap" }, Xr = { class: "fau-table" }, xr = { class: "num" }, ei = { class: "num" }, ti = { class: "num" }, li = { class: "num" }, ni = {
  key: 0,
  class: "fau-badge bad"
}, ai = { class: "fau-table-wrap" }, oi = { class: "fau-table" }, si = { class: "num" }, ri = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-glsub"
}, ii = { class: "fau-row" }, ci = { class: "grow" }, di = { class: "fau-badge" }, ui = { class: "fau-counts" }, mi = ["data-test"], pi = {
  key: 0,
  class: "fau-esc"
}, yi = { class: "fau-table-wrap" }, Ni = { class: "fau-table" }, Vi = { class: "num" }, Ei = { class: "num" }, vi = { class: "num" }, gi = ["data-test"], ki = {
  key: 0,
  class: "fau-badge bad"
}, fi = { class: "num" }, hi = { class: "num" }, $i = { class: "num" }, _i = { class: "wrap" }, Bi = {
  key: 0,
  class: "ss-muted"
}, bi = ["data-test"], Si = {
  key: 1,
  class: "ss-muted"
}, Di = ["disabled", "onClick"], Ci = {
  key: 1,
  class: "ss-note danger"
}, wi = /* @__PURE__ */ e.defineComponent({
  __name: "ReconPanel",
  props: {
    run: {}
  },
  emits: ["open-run"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = e.computed(() => t.run.result), n = e.ref(!1), c = e.ref(""), a = ue.FAU_BANK_CLASSES, N = s.listSeparator(), E = ue.FAU_GLSUB_CLASSES, u = {
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
    }, k = {
      timing: s.i18nKey("时间性差异"),
      fx: s.i18nKey("汇率"),
      mapping: s.i18nKey("映射"),
      duplicate_or_missing: s.i18nKey("重复或漏记"),
      fee_or_accrual: s.i18nKey("费用 / 计提"),
      data_quality: s.i18nKey("数据质量"),
      fee: s.i18nKey("银行手续费"),
      interest: s.i18nKey("利息"),
      unknown_deduction: s.i18nKey("不明扣款")
    }, g = (h) => h.items.some((K) => K.cls !== "matched");
    async function b(h) {
      n.value = !0, c.value = "";
      try {
        const K = await Y("recon.break.retrace", { runId: t.run.id, breakId: h });
        y("open-run", K.id);
      } catch (K) {
        c.value = Q.errorMessage(K);
      } finally {
        n.value = !1;
      }
    }
    return (h, K) => r.value ? (e.openBlock(), e.createElementBlock("div", Lr, [
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(r.value.bank || [], (T) => (e.openBlock(), e.createElementBlock("section", {
          key: T.account,
          class: "fau-sec",
          "data-test": `fau-bank-${T.account}`
        }, [
          e.createElementVNode("header", Ar, [
            e.createElementVNode("strong", Fr, [
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
          e.createElementVNode("div", Ir, [
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
              ], 10, Pr))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", Or, [
            e.createElementVNode("table", zr, [
              e.createElementVNode("tbody", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(h.$t("企业账面余额")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Mr, [
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
                  e.createElementVNode("td", jr, [
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
                  e.createElementVNode("td", Rr, [
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
                  e.createElementVNode("td", qr, [
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
                  e.createElementVNode("td", Ur, [
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
                  e.createElementVNode("td", Wr, [
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
                  e.createElementVNode("td", Yr, [
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
                  e.createElementVNode("td", Gr, [
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
                  e.createElementVNode("td", Hr, [
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
          T.escalations.length ? (e.openBlock(), e.createElementBlock("ul", Qr, [
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
                  e.toDisplayString(e.unref(X)(z)),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("details", {
            open: g(T)
          }, [
            e.createElementVNode(
              "summary",
              null,
              e.toDisplayString(h.$t("未达账项明细")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Zr, [
              e.createElementVNode("table", Xr, [
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
                      xr,
                      e.toDisplayString(h.$t("账面金额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      ei,
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
                        e.createElementVNode("td", ti, [
                          e.createVNode(l, {
                            cents: z.bookAmount
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", li, [
                          e.createVNode(l, {
                            cents: z.bankAmount
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", null, [
                          e.createTextVNode(
                            e.toDisplayString(z.cause ? h.$t(k[z.cause] || z.cause) : ""),
                            1
                            /* TEXT */
                          ),
                          z.escalate ? (e.openBlock(), e.createElementBlock(
                            "span",
                            ni,
                            e.toDisplayString(e.unref(X)(z.escalate)),
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
          ], 8, Jr),
          e.createElementVNode("details", null, [
            e.createElementVNode(
              "summary",
              null,
              e.toDisplayString(h.$t("已达账项")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", ai, [
              e.createElementVNode("table", oi, [
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
                      e.createElementVNode("td", si, [
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
        ], 8, Kr))),
        128
        /* KEYED_FRAGMENT */
      )),
      r.value.glsub ? (e.openBlock(), e.createElementBlock("section", ri, [
        e.createElementVNode("header", ii, [
          e.createElementVNode(
            "strong",
            ci,
            e.toDisplayString(h.$t("总账与子账")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", di, [
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
        e.createElementVNode("div", ui, [
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
            ], 10, mi))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        r.value.glsub.escalations.length ? (e.openBlock(), e.createElementBlock("ul", pi, [
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
                e.toDisplayString(e.unref(X)(T)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", yi, [
          e.createElementVNode("table", Ni, [
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
                  Vi,
                  e.toDisplayString(h.$t("总账金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ei,
                  e.toDisplayString(h.$t("子账金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  vi,
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
                      ki,
                      e.toDisplayString(h.$t("重大")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("td", fi, [
                    e.createVNode(l, {
                      cents: T.glAmount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", hi, [
                    e.createVNode(l, {
                      cents: T.subAmount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", $i, [
                    e.createVNode(l, {
                      cents: T.diff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(T.causes.map((z) => h.$t(k[z] || z)).join(e.unref(N))),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", _i, [
                    e.createTextVNode(
                      e.toDisplayString(T.trace?.rootCause),
                      1
                      /* TEXT */
                    ),
                    T.trace ? (e.openBlock(), e.createElementBlock("small", Bi, [
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
                    }, e.toDisplayString(T.trace.status === "verified" ? h.$t("已核实") : T.trace.status === "rejected" ? h.$t("已打回") : h.$t("未核实")), 11, bi)) : e.createCommentVNode("v-if", !0),
                    T.trace?.missing?.length ? (e.openBlock(), e.createElementBlock("small", Si, [
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
                    i.run.modeId === "glsub" ? (e.openBlock(), e.createElementBlock("button", {
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
                    ], 8, Di)) : e.createCommentVNode("v-if", !0)
                  ])
                ], 10, gi))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        c.value ? (e.openBlock(), e.createElementBlock("p", Ci, [
          K[8] || (K[8] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(c.value),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Ti = /* @__PURE__ */ ae(wi, [["__scopeId", "data-v-4d4d9531"]]), Li = ["data-test"], Ki = {
  key: 0,
  class: "fau-fpa-sec"
}, Ai = { class: "fau-fpa-alerts" }, Fi = ["data-test"], Ii = {
  key: 1,
  class: "fau-fpa-sec",
  "data-test": "fau-fpa-sources"
}, Pi = { class: "fau-row" }, Oi = ["data-test"], zi = ["data-test"], Mi = { class: "fau-fpa-legend" }, ji = { class: "fau-fpa-chart" }, Ri = { class: "lbl" }, qi = { class: "bars" }, Ui = ["data-test"], Wi = { class: "ss-muted" }, Yi = { class: "fau-table-wrap" }, Gi = { class: "fau-table" }, Hi = ["data-test"], Qi = {
  key: 2,
  class: "fau-fpa-sec"
}, Ji = ["data-test"], Zi = { class: "fau-row" }, Xi = { class: "grow" }, xi = {
  key: 0,
  class: "ss-muted"
}, ec = {
  key: 3,
  class: "fau-fpa-sec",
  "data-test": "fau-fpa-checks"
}, tc = { class: "fau-fpa-checks" }, lc = ["data-test"], nc = /* @__PURE__ */ e.defineComponent({
  __name: "FpaPanel",
  props: {
    run: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result), y = { green: s.i18nKey("绿灯"), yellow: s.i18nKey("黄灯"), red: s.i18nKey("红灯") }, r = { green: "ok", yellow: "warn", red: "bad" }, n = { verified: s.i18nKey("已核实"), unverified: s.i18nKey("未核实"), unknown: s.i18nKey("原因不明，待主管确认") }, c = ["amount", "pct", "num"], a = (u) => typeof u == "number" ? u : null;
    function N(u, L) {
      const k = Math.max(...u.series.flatMap((g) => g.values.map((b) => Math.abs(b ?? 0))), 0);
      return k && L != null ? Math.max(1, Math.round(Math.abs(L) / k * 75)) : 0;
    }
    function E(u, L) {
      const k = u.columns.filter((g) => g.kind === "level").map((g) => L[g.key]);
      return k.includes("red") || u.columns.some((g) => g.kind === "label" && L[g.key] === s.i18nKey("未核实")) ? "bad" : k.includes("yellow") ? "warn" : "";
    }
    return (u, L) => t.value ? (e.openBlock(), e.createElementBlock("div", {
      key: 0,
      class: "fau-fpa",
      "data-test": `fau-fpa-${t.value.moduleId}`
    }, [
      t.value.alerts.length ? (e.openBlock(), e.createElementBlock("section", Ki, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(u.$t("预警")),
          1
          /* TEXT */
        ),
        e.createElementVNode("ul", Ai, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.alerts, (k) => (e.openBlock(), e.createElementBlock("li", {
              key: k.id,
              class: e.normalizeClass(k.level),
              "data-test": `fau-fpa-alert-${k.id}`
            }, [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["fau-badge", r[k.level]])
                },
                e.toDisplayString(u.$t(y[k.level])),
                3
                /* TEXT, CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(e.unref(X)(k.message)),
                1
                /* TEXT */
              )
            ], 10, Fi))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.sources.length ? (e.openBlock(), e.createElementBlock("section", Ii, [
        e.createElementVNode(
          "h4",
          null,
          e.toDisplayString(u.$t("数据来源")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Pi, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.sources, (k) => (e.openBlock(), e.createElementBlock("span", {
              key: k.datasetId,
              class: e.normalizeClass(["fau-badge", k.signed ? "ok" : "warn"]),
              "data-test": `fau-fpa-source-${k.slot}`
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(k.signed ? "ri-shield-check-line" : "ri-error-warning-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(k.label) + " · " + e.toDisplayString(k.signed ? u.$t("已签核") : u.$t("未签核")),
                1
                /* TEXT */
              )
            ], 10, Oi))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(t.value.charts, (k) => (e.openBlock(), e.createElementBlock("section", {
          key: k.id,
          class: "fau-fpa-sec",
          "data-test": `fau-fpa-chart-${k.id}`
        }, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(u.$t(k.title)),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", Mi, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(k.series, (g, b) => (e.openBlock(), e.createElementBlock("span", {
                key: g.name
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
                  e.toDisplayString(u.$t(g.name)),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", ji, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(k.labels, (g, b) => (e.openBlock(), e.createElementBlock("div", {
                key: b,
                class: "fau-fpa-bar-row"
              }, [
                e.createElementVNode(
                  "span",
                  Ri,
                  e.toDisplayString(k.labelKeys ? u.$t(g) : g),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", qi, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(k.series, (h, K) => (e.openBlock(), e.createElementBlock("div", {
                      key: h.name,
                      class: "bar-line"
                    }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["bar", [`s${K % 3}`, { neg: (h.values[b] ?? 0) < 0 }]]),
                          style: e.normalizeStyle({ inlineSize: `${N(k, h.values[b])}%` })
                        },
                        null,
                        6
                        /* CLASS, STYLE */
                      ),
                      k.unit === "amount" ? (e.openBlock(), e.createBlock(l, {
                        key: 0,
                        cents: h.values[b]
                      }, null, 8, ["cents"])) : k.unit === "pct" ? (e.openBlock(), e.createBlock(l, {
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
        ], 8, zi))),
        128
        /* KEYED_FRAGMENT */
      )),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(t.value.tables, (k) => (e.openBlock(), e.createElementBlock("section", {
          key: k.id,
          class: "fau-fpa-sec",
          "data-test": `fau-fpa-table-${k.id}`
        }, [
          e.createElementVNode("h4", null, [
            e.createTextVNode(
              e.toDisplayString(u.$t(k.title)) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              Wi,
              e.toDisplayString(u.$t("{n} 行", { n: k.rows.length })),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Yi, [
            e.createElementVNode("table", Gi, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(k.columns, (g) => (e.openBlock(), e.createElementBlock(
                      "th",
                      {
                        key: g.key,
                        class: e.normalizeClass({ num: c.includes(g.kind) })
                      },
                      e.toDisplayString(u.$t(g.label)),
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
                  e.renderList(k.rows, (g, b) => (e.openBlock(), e.createElementBlock("tr", {
                    key: b,
                    class: e.normalizeClass(E(k, g)),
                    "data-test": `fau-fpa-row-${k.id}-${b}`
                  }, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(k.columns, (h) => (e.openBlock(), e.createElementBlock(
                        "td",
                        {
                          key: h.key,
                          class: e.normalizeClass({ num: c.includes(h.kind), wrap: h.kind === "text" && String(g[h.key] ?? "").length > 40 })
                        },
                        [
                          h.kind === "amount" ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            cents: a(g[h.key])
                          }, null, 8, ["cents"])) : h.kind === "pct" ? (e.openBlock(), e.createBlock(l, {
                            key: 1,
                            ratio: a(g[h.key])
                          }, null, 8, ["ratio"])) : h.kind === "num" ? (e.openBlock(), e.createBlock(l, {
                            key: 2,
                            value: g[h.key]
                          }, null, 8, ["value"])) : h.kind === "level" && g[h.key] ? (e.openBlock(), e.createElementBlock(
                            "span",
                            {
                              key: 3,
                              class: e.normalizeClass(["fau-badge", r[String(g[h.key])]])
                            },
                            e.toDisplayString(u.$t(y[String(g[h.key])] || String(g[h.key]))),
                            3
                            /* TEXT, CLASS */
                          )) : h.kind === "label" ? (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 4 },
                            [
                              e.createTextVNode(
                                e.toDisplayString(g[h.key] ? u.$t(String(g[h.key])) : ""),
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
                                e.toDisplayString(g[h.key] ?? ""),
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
                  ], 10, Hi))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])
        ], 8, Ui))),
        128
        /* KEYED_FRAGMENT */
      )),
      t.value.narratives.length ? (e.openBlock(), e.createElementBlock("section", Qi, [
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
          e.renderList(t.value.narratives, (k) => (e.openBlock(), e.createElementBlock("article", {
            key: k.id,
            class: e.normalizeClass(["fau-fpa-nar", { bad: k.status === "unverified" }]),
            "data-test": `fau-fpa-nar-${k.id}`
          }, [
            e.createElementVNode("header", Zi, [
              e.createElementVNode(
                "strong",
                Xi,
                e.toDisplayString(u.$t(k.heading)),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["fau-badge", k.status === "verified" ? "ok" : k.status === "unverified" ? "bad" : "muted"])
                },
                e.toDisplayString(u.$t(n[k.status])),
                3
                /* TEXT, CLASS */
              )
            ]),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(k.text),
              1
              /* TEXT */
            ),
            k.missing?.length ? (e.openBlock(), e.createElementBlock("small", xi, [
              e.createTextVNode(
                e.toDisplayString(u.$t("数据里找不到")) + ": ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: k.missing.join(", ")
              }, null, 8, ["value"])
            ])) : e.createCommentVNode("v-if", !0)
          ], 10, Ji))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      t.value.checks.length ? (e.openBlock(), e.createElementBlock("section", ec, [
        L[0] || (L[0] = e.createElementVNode(
          "h4",
          null,
          "Checks",
          -1
          /* CACHED */
        )),
        e.createElementVNode("ul", tc, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.checks, (k) => (e.openBlock(), e.createElementBlock("li", {
              key: k.id,
              "data-test": `fau-fpa-check-${k.id}`
            }, [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(k.ok ? "fau-true" : "fau-false")
                },
                e.toDisplayString(k.ok ? "TRUE" : "FALSE"),
                3
                /* TEXT, CLASS */
              ),
              e.createTextVNode(
                " " + e.toDisplayString(e.unref(X)(k.message)),
                1
                /* TEXT */
              )
            ], 8, lc))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0)
    ], 8, Li)) : e.createCommentVNode("v-if", !0);
  }
}), ac = /* @__PURE__ */ ae(nc, [["__scopeId", "data-v-df962e0b"]]), oc = {
  class: "fau-input fau-tax-params",
  "data-test": "fau-tax-params"
}, sc = { class: "fau-badge muted" }, rc = ["data-test", "disabled", "onClick"], ic = { class: "ss-grid" }, cc = ["onUpdate:modelValue", "disabled", "data-test"], dc = ["value"], uc = ["onUpdate:modelValue", "disabled", "data-test"], mc = ["onUpdate:modelValue", "inputmode", "placeholder", "disabled", "data-test"], pc = {
  key: 0,
  class: "ss-note info"
}, yc = { class: "ss-actions" }, Nc = ["disabled"], Vc = {
  key: 0,
  class: "fau-badge ok"
}, Ec = {
  key: 1,
  class: "ss-note danger"
}, vc = /* @__PURE__ */ e.defineComponent({
  __name: "TaxParams",
  props: {
    run: {},
    def: {},
    editable: { type: Boolean }
  },
  emits: ["save"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = {
      vat_lines: s.i18nKey("销项与进项明细"),
      iit_rows: s.i18nKey("工资个税明细"),
      wht_payments: s.i18nKey("向非居民付款明细"),
      temp_diffs: s.i18nKey("暂时性差异明细"),
      disclosure_events: s.i18nKey("重大事项与交易清单"),
      rp_transactions: s.i18nKey("关联交易明细"),
      tp_comparables: s.i18nKey("可比公司财务数据")
    }, n = Object.keys(r), c = { key: "period", label: s.i18nKey("税期（不填用项目期间；YYYY-MM / YYYY-Qn / YYYY）"), type: "text", placeholder: "2026-09" }, a = (p, I) => ({ key: p, label: I, type: "number" }), N = (p, I) => ({ key: p, label: I, type: "bool", dflt: !1 }), E = {
      cn: [
        c,
        { key: "taxpayerType", label: s.i18nKey("纳税人类型"), type: "select", dflt: "general", options: [{ value: "general", label: s.i18nKey("一般纳税人") }, { value: "small", label: s.i18nKey("小规模纳税人") }] },
        { key: "cityTier", label: s.i18nKey("城市维护建设税档次"), type: "select", dflt: "urban", options: [{ value: "urban", label: s.i18nKey("市区（7%）") }, { value: "county", label: s.i18nKey("县城、镇（5%）") }, { value: "other", label: s.i18nKey("其他（1%）") }] },
        N("smallLowProfit", s.i18nKey("小型微利企业（享受所得税优惠与六税两费减半）")),
        N("quarterly", s.i18nKey("按季申报")),
        a("uninvoicedSales", s.i18nKey("未开票收入（不含税）")),
        a("inputTransferOut", s.i18nKey("进项税额转出")),
        a("carriedCredit", s.i18nKey("上期留抵税额")),
        a("citPaidYtd", s.i18nKey("本年已预缴企业所得税"))
      ],
      sa_vat: [c, a("carriedCredit", s.i18nKey("上期留抵税额")), a("priorCorrection", s.i18nKey("上期更正（补税为正，少报进项为负）"))],
      ae_vat: [c, a("carriedCredit", s.i18nKey("上期留抵税额")), a("priorCorrection", s.i18nKey("上期更正（补税为正，少报进项为负）"))],
      sa_zakat: [
        { ...c, label: s.i18nKey("会计年度（YYYY，或年末月份 YYYY-MM）"), placeholder: "2025" },
        { key: "zakatYearBasis", label: s.i18nKey("天课年度口径"), type: "select", dflt: "", options: [{ value: "", label: s.i18nKey("按公司档案") }, { value: "gregorian", label: s.i18nKey("公历年（按天数折算）") }, { value: "hijri", label: s.i18nKey("回历年") }] },
        { key: "saudiShare", label: s.i18nKey("沙特 / 海湾国家股东持股比例（%）"), type: "number", placeholder: "100" },
        a("profitAdjust", s.i18nKey("调整后净利润的调整额（不可扣除项为正）"))
      ],
      sa_wht: [c],
      ae_cit: [
        { ...c, label: s.i18nKey("税期（YYYY，或年末月份 YYYY-MM）"), placeholder: "2025" },
        a("citAdjust", s.i18nKey("纳税调整（不可扣除为正，免税收入为负）")),
        N("smallBusinessRelief", s.i18nKey("选择适用小企业减免")),
        N("qualifyingFreeZone", s.i18nKey("自由区合格主体"))
      ],
      intl: [
        c,
        { key: "vatStandardRate", label: s.i18nKey("增值税 / 商品服务税标准税率（%）"), type: "number" },
        { key: "incomeTaxRate", label: s.i18nKey("所得税税率（%）"), type: "number" },
        a("taxAdjust", s.i18nKey("纳税调整（不可扣除为正，免税收入为负）")),
        a("carriedCredit", s.i18nKey("上期留抵税额"))
      ],
      disclosure: [
        c,
        { key: "regime", label: s.i18nKey("披露规则"), type: "select", dflt: "", options: [{ value: "", label: s.i18nKey("按公司主地区") }, { value: "cn_sse", label: s.i18nKey("中国：上交所股票上市规则") }, { value: "sa_cma", label: s.i18nKey("沙特：资本市场管理局规则") }, { value: "intl", label: s.i18nKey("国际：IAS 24 与重要性") }] },
        a("auditedTotalAssets", s.i18nKey("最近一期经审计总资产")),
        a("auditedNetAssets", s.i18nKey("最近一期经审计净资产")),
        a("auditedRevenue", s.i18nKey("最近一个会计年度经审计营业收入")),
        a("auditedNetProfit", s.i18nKey("最近一个会计年度经审计净利润"))
      ],
      local_file: [],
      benchmark: []
    }, u = [
      c,
      { key: "tpJurisdiction", label: s.i18nKey("按哪个地区的规定判断"), type: "select", dflt: "", options: [{ value: "", label: s.i18nKey("按公司主地区") }, { value: "CN", label: s.i18nKey("中国") }, { value: "SA", label: s.i18nKey("沙特") }, { value: "AE", label: s.i18nKey("阿联酋") }, { value: "INTL", label: s.i18nKey("国际") }] },
      { key: "pli", label: s.i18nKey("利润水平指标"), type: "select", dflt: "ncp", options: [{ value: "ncp", label: s.i18nKey("完全成本加成率") }, { value: "om", label: s.i18nKey("营业利润率") }] },
      a("testedRevenue", s.i18nKey("受测方营业收入")),
      a("testedOperatingProfit", s.i18nKey("受测方营业利润")),
      a("testedTotalCost", s.i18nKey("受测方总成本"))
    ], L = [
      a("groupRevenue", s.i18nKey("集团合并收入")),
      N("groupHasMasterFile", s.i18nKey("集团已准备主体文档")),
      N("hasDisclosure", s.i18nKey("已准备关联交易披露表")),
      N("hasMasterFile", s.i18nKey("已准备主体文档")),
      N("hasLocalFile", s.i18nKey("已准备本地文档")),
      N("hasCbcr", s.i18nKey("已准备国别报告")),
      a("intlCbcrThreshold", s.i18nKey("国际口径国别报告门槛（按本位币）"))
    ];
    E.local_file = [...u, ...L], E.benchmark = u;
    const k = {
      cn: s.i18nKey("中国口径直接调用财务智能体的计算，结果与它逐项相同；申报代填请到财务智能体「申报上报」，由人提交。"),
      sa_zakat: s.i18nKey("天课基数按年末余额表逐行归类，计算结果为草稿口径，需当地专业人士复核。"),
      ae_cit: s.i18nKey("应纳税所得额 375,000 迪拉姆以内按 0%，超过部分按 9%；结果为草稿口径，需当地专业人士复核。"),
      disclosure: s.i18nKey("分母请填最近一期经审计的数字；不填时用上传的余额表计算。")
    }, g = e.computed(() => E[t.run.modeId] || []), b = e.computed(() => k[t.run.modeId] || ""), h = e.computed(() => [...new Set(ie.inputsForMode(t.def, t.run.modeId).map((p) => p.kind).filter((p) => n.includes(p)))]), K = e.reactive({}), T = e.ref(!1), z = e.ref(!1), S = e.ref("");
    function w() {
      for (const p of Object.keys(K)) delete K[p];
      for (const p of g.value) {
        const I = t.run.params[p.key];
        K[p.key] = I === void 0 ? p.dflt ?? "" : p.key === "saudiShare" && typeof I == "number" && I <= 1 ? I * 100 : I;
      }
    }
    e.watch(() => [t.run.id, t.run.modeId, t.run.updatedAt], w, { immediate: !0 });
    function m() {
      const p = {};
      for (const I of g.value) {
        const _ = K[I.key];
        if (I.type === "number") {
          const v = Number(String(_ ?? "").replace(/[,\s%]/g, ""));
          p[I.key] = String(_ ?? "").trim() !== "" && Number.isFinite(v) ? v : "";
        } else I.type === "bool" ? p[I.key] = !!_ : p[I.key] = String(_ ?? "").trim();
      }
      y("save", p), z.value = !0, setTimeout(() => {
        z.value = !1;
      }, 2e3);
    }
    async function f(p) {
      T.value = !0, S.value = "";
      try {
        const I = await Y("tax.template", { kind: p, locale: t.run.outputLocale });
        await Y("artifact.reveal", { path: I.path });
      } catch (I) {
        S.value = Q.errorMessage(I);
      } finally {
        T.value = !1;
      }
    }
    return (p, I) => (e.openBlock(), e.createElementBlock("div", oc, [
      e.createElementVNode("header", null, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(p.$t("申报参数")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          sc,
          e.toDisplayString(p.$t("金额按主单位填写")),
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
          e.renderList(h.value, (_) => (e.openBlock(), e.createElementBlock("button", {
            key: _,
            type: "button",
            class: "ss-link",
            "data-test": `fau-tax-template-${_}`,
            disabled: T.value,
            onClick: (v) => f(_)
          }, [
            I[0] || (I[0] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(p.$t("下载模板：{p0}", { p0: p.$t(r[_] || _) })),
              1
              /* TEXT */
            )
          ], 8, rc))),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      e.createElementVNode("div", ic, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(g.value, (_) => (e.openBlock(), e.createElementBlock(
            "label",
            {
              key: _.key,
              class: e.normalizeClass(["ss-field", { check: _.type === "bool" }])
            },
            [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(p.$t(_.label)),
                1
                /* TEXT */
              ),
              _.type === "select" ? e.withDirectives((e.openBlock(), e.createElementBlock("select", {
                key: 0,
                "onUpdate:modelValue": (v) => K[_.key] = v,
                disabled: !i.editable,
                "data-test": `fau-param-${_.key}`
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(_.options, (v) => (e.openBlock(), e.createElementBlock("option", {
                    key: v.value,
                    value: v.value
                  }, e.toDisplayString(p.$t(v.label)), 9, dc))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 8, cc)), [
                [e.vModelSelect, K[_.key]]
              ]) : _.type === "bool" ? e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                key: 1,
                "onUpdate:modelValue": (v) => K[_.key] = v,
                type: "checkbox",
                disabled: !i.editable,
                "data-test": `fau-param-${_.key}`
              }, null, 8, uc)), [
                [e.vModelCheckbox, K[_.key]]
              ]) : e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                key: 2,
                "onUpdate:modelValue": (v) => K[_.key] = v,
                inputmode: _.type === "number" ? "decimal" : "text",
                dir: "ltr",
                placeholder: _.placeholder || "",
                disabled: !i.editable,
                "data-test": `fau-param-${_.key}`
              }, null, 8, mc)), [
                [
                  e.vModelText,
                  K[_.key],
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
      b.value ? (e.openBlock(), e.createElementBlock("p", pc, [
        I[2] || (I[2] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(p.$t(b.value)),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", yc, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: !i.editable || T.value,
          "data-test": "fau-tax-params-save",
          onClick: m
        }, [
          I[3] || (I[3] = e.createElementVNode(
            "i",
            { class: "ri-save-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(p.$t("保存参数")),
            1
            /* TEXT */
          )
        ], 8, Nc),
        z.value ? (e.openBlock(), e.createElementBlock(
          "span",
          Vc,
          e.toDisplayString(p.$t("已保存")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      S.value ? (e.openBlock(), e.createElementBlock("p", Ec, [
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
}), gc = /* @__PURE__ */ ae(vc, [["__scopeId", "data-v-9e48cd51"]]), kc = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-tax-findings"
}, fc = { class: "fau-findings" }, hc = ["data-test"], $c = {
  key: 0,
  class: "ss-muted"
}, _c = {
  key: 1,
  class: "ss-muted"
}, Bc = {
  key: 2,
  class: "ss-muted"
}, bc = /* @__PURE__ */ e.defineComponent({
  __name: "FindingList",
  props: {
    findings: {}
  },
  setup(i) {
    const B = { info: s.i18nKey("提示"), warn: s.i18nKey("提醒"), high: s.i18nKey("高风险") };
    return (t, y) => i.findings.length ? (e.openBlock(), e.createElementBlock("section", kc, [
      e.createElementVNode(
        "strong",
        null,
        e.toDisplayString(t.$t("风险与提醒")),
        1
        /* TEXT */
      ),
      e.createElementVNode("ul", fc, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(i.findings, (r) => (e.openBlock(), e.createElementBlock("li", {
            key: r.id,
            class: e.normalizeClass(r.level),
            "data-test": `fau-finding-${r.id}`
          }, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["fau-badge", r.level === "high" ? "bad" : r.level === "warn" ? "warn" : "muted"])
              },
              e.toDisplayString(t.$t(B[r.level])),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "div",
                null,
                e.toDisplayString(e.unref(X)(r.title)),
                1
                /* TEXT */
              ),
              r.detail ? (e.openBlock(), e.createElementBlock(
                "small",
                $c,
                e.toDisplayString(e.unref(X)(r.detail)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0),
              r.suggestion ? (e.openBlock(), e.createElementBlock("small", _c, [
                y[0] || (y[0] = e.createElementVNode(
                  "br",
                  null,
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(e.unref(X)(r.suggestion)),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              r.rows?.length ? (e.openBlock(), e.createElementBlock("small", Bc, [
                y[1] || (y[1] = e.createElementVNode(
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
          ], 10, hc))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Me = /* @__PURE__ */ ae(bc, [["__scopeId", "data-v-3807e2e3"]]), Sc = ["open"], Dc = { class: "fau-badge muted" }, Cc = {
  key: 0,
  class: "fau-badge warn",
  "data-test": "fau-rules-draft"
}, wc = {
  key: 0,
  class: "ss-muted"
}, Tc = {
  key: 1,
  class: "fau-table-wrap"
}, Lc = { class: "fau-table" }, Kc = ["data-test"], Ac = { class: "wrap" }, Fc = { class: "ss-muted" }, Ic = { class: "wrap" }, Pc = { class: "ss-muted" }, Oc = { class: "wrap" }, zc = { class: "wrap" }, Mc = ["lang", "dir"], jc = {
  key: 0,
  class: "ss-muted"
}, Rc = { class: "fau-badge muted" }, qc = {
  key: 1,
  class: "ss-muted"
}, Uc = /* @__PURE__ */ e.defineComponent({
  __name: "RuleSources",
  props: {
    rules: {},
    open: { type: Boolean }
  },
  setup(i) {
    const B = (n) => n.translations?.[pe.currentLocale()]?.label || n.label, t = (n) => typeof n.value == "number" || /^\d{4}-\d{2}-\d{2}$/.test(String(n.value)), y = (n) => String(n.translations?.[pe.currentLocale()]?.value || n.value), r = (n) => n.source.language === pe.currentLocale().slice(0, 2) ? "" : n.source.translations?.[pe.currentLocale()] || "";
    return (n, c) => (e.openBlock(), e.createElementBlock("details", {
      class: "fau-sec",
      "data-test": "fau-rule-sources",
      open: i.open
    }, [
      e.createElementVNode("summary", null, [
        e.createTextVNode(
          e.toDisplayString(n.$t("地区规则与出处")) + " ",
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          Dc,
          e.toDisplayString(i.rules.length),
          1
          /* TEXT */
        ),
        i.rules.some((a) => !a.reviewed) ? (e.openBlock(), e.createElementBlock(
          "span",
          Cc,
          e.toDisplayString(n.$t("草稿口径，需当地专业人士复核")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      i.rules.length ? (e.openBlock(), e.createElementBlock("div", Tc, [
        e.createElementVNode("table", Lc, [
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
                e.toDisplayString(n.$t("取值")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(n.$t("版本 / 生效日期")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(n.$t("出处")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(n.$t("原文")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(n.$t("审核状态")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(i.rules, (a) => (e.openBlock(), e.createElementBlock("tr", {
                key: `${a.id}@${a.version}`,
                "data-test": `fau-rule-${a.id}`
              }, [
                e.createElementVNode("td", Ac, [
                  e.createTextVNode(
                    e.toDisplayString(B(a)),
                    1
                    /* TEXT */
                  ),
                  c[0] || (c[0] = e.createElementVNode(
                    "br",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("small", Fc, [
                    e.createVNode(l, {
                      value: a.id
                    }, null, 8, ["value"])
                  ])
                ]),
                e.createElementVNode("td", Ic, [
                  t(a) ? (e.openBlock(), e.createBlock(l, {
                    key: 0,
                    value: `${a.value}${a.unit ? ` ${a.unit}` : ""}`
                  }, null, 8, ["value"])) : (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(y(a)),
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
                    value: a.version
                  }, null, 8, ["value"]),
                  c[2] || (c[2] = e.createElementVNode(
                    "br",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("small", Pc, [
                    e.createVNode(l, {
                      value: a.effectiveFrom
                    }, null, 8, ["value"]),
                    a.effectiveTo ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 0 },
                      [
                        c[1] || (c[1] = e.createTextVNode(
                          " ~ ",
                          -1
                          /* CACHED */
                        )),
                        e.createVNode(l, {
                          value: a.effectiveTo
                        }, null, 8, ["value"])
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode("td", Oc, [
                  e.createTextVNode(
                    e.toDisplayString(a.source.issuer) + " · " + e.toDisplayString(a.source.title),
                    1
                    /* TEXT */
                  ),
                  a.source.clause ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        " · " + e.toDisplayString(a.source.clause),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("td", zc, [
                  a.source.originalText ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("div", {
                        lang: a.source.language,
                        dir: a.source.language === "ar" ? "rtl" : "ltr",
                        class: "fau-original",
                        "data-test": "fau-rule-original"
                      }, e.toDisplayString(a.source.originalText), 9, Mc),
                      r(a) ? (e.openBlock(), e.createElementBlock(
                        "small",
                        jc,
                        e.toDisplayString(n.$t("译文")) + ": " + e.toDisplayString(r(a)),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode(
                        "small",
                        Rc,
                        e.toDisplayString(n.$t("以原文为准")),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock(
                    "small",
                    qc,
                    e.toDisplayString(n.$t("原文摘录待当地专业人员核对补录")),
                    1
                    /* TEXT */
                  ))
                ]),
                e.createElementVNode("td", null, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["fau-badge", a.reviewed ? "ok" : "warn"])
                    },
                    e.toDisplayString(a.reviewed ? n.$t("已经当地专业人员审核") : n.$t("草稿口径")),
                    3
                    /* TEXT, CLASS */
                  )
                ])
              ], 8, Kc))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        wc,
        e.toDisplayString(n.$t("本次没有用到地区规则（中国口径沿用财务智能体）")),
        1
        /* TEXT */
      ))
    ], 8, Sc));
  }
}), je = /* @__PURE__ */ ae(Uc, [["__scopeId", "data-v-94c08f9e"]]), Wc = {
  class: "fau-tax",
  "data-test": "fau-tax-panel"
}, Yc = {
  key: 0,
  class: "ss-note warn",
  "data-test": "fau-draft-basis"
}, Gc = { class: "ss-note info" }, Hc = {
  key: 0,
  class: "ss-actions"
}, Qc = ["data-test"], Jc = { class: "fau-row" }, Zc = { class: "grow" }, Xc = { class: "ss-muted" }, xc = { class: "fau-table-wrap" }, ed = { class: "fau-table" }, td = { class: "num" }, ld = { class: "num" }, nd = { class: "num" }, ad = ["data-test"], od = { class: "wrap" }, sd = {
  key: 0,
  class: "ss-muted"
}, rd = { class: "num" }, id = { class: "num" }, cd = { class: "num" }, dd = { class: "wrap" }, ud = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-zakat"
}, md = { class: "fau-row" }, pd = { class: "grow" }, yd = { class: "fau-badge" }, Nd = {
  key: 0,
  class: "fau-badge warn"
}, Vd = { class: "fau-table-wrap" }, Ed = { class: "fau-table" }, vd = { class: "num" }, gd = ["data-test"], kd = ["value", "disabled", "onChange"], fd = ["value"], hd = {
  key: 0,
  class: "fau-badge muted"
}, $d = { class: "num" }, _d = { class: "fau-kv" }, Bd = { "data-test": "fau-zakat-due" }, bd = {
  key: 0,
  class: "ss-actions"
}, Sd = ["disabled"], Dd = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-tax-calendar"
}, Cd = { class: "fau-table-wrap" }, wd = { class: "fau-table" }, Td = { key: 0 }, Ld = { key: 0 }, Kd = { class: "fau-row" }, Ad = ["data-test"], Fd = { class: "fau-kv" }, Id = { class: "fau-table-wrap" }, Pd = { class: "fau-table" }, Od = { class: "num" }, zd = ["data-test"], Md = { class: "wrap" }, jd = {
  key: 0,
  class: "ss-muted"
}, Rd = { class: "num" }, qd = { class: "wrap" }, Ud = { class: "wrap" }, Wd = {
  class: "fau-sec",
  "data-test": "fau-tp-range"
}, Yd = { class: "fau-row" }, Gd = { class: "grow" }, Hd = { class: "fau-kv" }, Qd = { "data-test": "fau-tp-q1" }, Jd = { "data-test": "fau-tp-median" }, Zd = { "data-test": "fau-tp-q3" }, Xd = { class: "fau-table-wrap" }, xd = { class: "fau-table" }, eu = { class: "num" }, tu = { class: "num" }, lu = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-tp-docs"
}, nu = {
  key: 0,
  class: "fau-table-wrap"
}, au = { class: "fau-table" }, ou = { class: "num" }, su = { class: "num" }, ru = { class: "num" }, iu = { class: "num" }, cu = {
  key: 1,
  class: "fau-table-wrap"
}, du = { class: "fau-table" }, uu = ["data-test"], mu = { class: "wrap" }, pu = { class: "fau-narr" }, yu = {
  key: 4,
  class: "ss-note danger"
}, Nu = /* @__PURE__ */ e.defineComponent({
  __name: "TaxResult",
  props: {
    run: {},
    def: {},
    editable: { type: Boolean }
  },
  emits: ["changed"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = ye.useRouter(), n = e.computed(() => t.def.id === "tax" ? t.run.result : null), c = e.computed(() => t.def.id === "regulatory" ? t.run.result : null), a = e.computed(() => t.def.id === "transfer-pricing" ? t.run.result : null), N = e.computed(() => !!(n.value?.draftBasis || c.value?.draftBasis || a.value?.draftBasis)), E = ue.FAU_ZAKAT_CATEGORIES, u = ue.FAU_DISCLOSURE_LEVELS, L = {
      add_equity: s.i18nKey("加项：权益"),
      add_provision: s.i18nKey("加项：准备"),
      add_liability: s.i18nKey("加项：非流动负债"),
      deduct_fixed: s.i18nKey("减项：固定资产净值"),
      deduct_investment: s.i18nKey("减项：长期投资"),
      deduct_intangible: s.i18nKey("减项：无形资产"),
      deduct_other: s.i18nKey("减项：其他"),
      none: s.i18nKey("不计入")
    }, k = { shareholder: s.i18nKey("提交股东大会并披露"), disclose: s.i18nKey("及时披露"), notes: s.i18nKey("在报表附注披露"), none: s.i18nKey("暂不需要披露") }, g = { transaction: s.i18nKey("交易"), related_party: s.i18nKey("关联交易"), guarantee: s.i18nKey("担保"), litigation: s.i18nKey("诉讼 / 仲裁"), impairment: s.i18nKey("减值"), other: s.i18nKey("其他") }, b = { ncp: s.i18nKey("完全成本加成率"), om: s.i18nKey("营业利润率") }, h = { below: s.i18nKey("低于下四分位"), within: s.i18nKey("在四分位区间内"), above: s.i18nKey("高于上四分位"), na: s.i18nKey("无法判断") }, K = {
      tangible: s.i18nKey("有形资产"),
      intangible_transfer: s.i18nKey("无形资产所有权转让"),
      intangible_license: s.i18nKey("无形资产使用权许可"),
      service: s.i18nKey("劳务"),
      financing: s.i18nKey("资金融通"),
      financial_asset: s.i18nKey("金融资产转让"),
      other: s.i18nKey("其他")
    }, T = { disclosure: s.i18nKey("关联交易披露表"), master: s.i18nKey("主体文档"), local: s.i18nKey("本地文档"), cbcr: s.i18nKey("国别报告") }, z = e.reactive({}), S = e.ref(!1), w = e.ref("");
    e.watch(() => t.run.id, () => {
      for (const v of Object.keys(z)) delete z[v];
    });
    const m = (v) => v.length > 12 ? `${v.slice(0, 12).join(",")} …` : v.join(","), f = (v) => `${Math.round(v * 1e6) / 1e4}%`, p = (v) => `${Math.round(v * 1e6) / 1e4}%`;
    function I(v) {
      try {
        return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" }).format(/* @__PURE__ */ new Date(`${v}T00:00:00Z`));
      } catch {
        return "";
      }
    }
    async function _() {
      S.value = !0, w.value = "";
      try {
        const v = t.run.params.zakatMap || {};
        await Y("run.setInputs", { runId: t.run.id, inputs: t.run.inputs, params: { zakatMap: { ...v, ...z } } }), await Y("run.start", { runId: t.run.id, fromStep: "validate" }), y("changed");
      } catch (v) {
        w.value = Q.errorMessage(v);
      } finally {
        S.value = !1;
      }
    }
    return (v, R) => (e.openBlock(), e.createElementBlock("div", Wc, [
      N.value ? (e.openBlock(), e.createElementBlock("p", Yc, [
        R[1] || (R[1] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(v.$t("草稿口径，需当地专业人士复核")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("p", Gc, [
        R[2] || (R[2] = e.createElementVNode(
          "i",
          { class: "ri-shield-check-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(v.$t("只出申报底稿，不提交申报：中国由人在电子税务局提交（代填可去财务智能体），沙特由人在 ZATCA 平台提交，阿联酋由人在 FTA 平台提交。")),
          1
          /* TEXT */
        )
      ]),
      e.createCommentVNode(" C1 纳税申报准备 "),
      n.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          n.value.mode === "cn" ? (e.openBlock(), e.createElementBlock("div", Hc, [
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
                e.toDisplayString(v.$t("申报代填去财务智能体「申报上报」（由人提交）")),
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
              e.createElementVNode("header", Jc, [
                e.createElementVNode("strong", Zc, [
                  e.createTextVNode(
                    e.toDisplayString(e.unref(X)(d.title)) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("small", Xc, [
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
                      e.toDisplayString(v.$t("本节应缴")) + " ",
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
              e.createElementVNode("div", xc, [
                e.createElementVNode("table", ed, [
                  e.createElementVNode("thead", null, [
                    e.createElementVNode("tr", null, [
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(v.$t("项目")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        td,
                        e.toDisplayString(v.$t("计税基数")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        ld,
                        e.toDisplayString(v.$t("税率")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        nd,
                        e.toDisplayString(v.$t("税额")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(v.$t("计算过程")),
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
                        e.createElementVNode("td", od, [
                          e.createTextVNode(
                            e.toDisplayString(e.unref(X)(M.label)),
                            1
                            /* TEXT */
                          ),
                          M.rows?.length ? (e.openBlock(), e.createElementBlock("small", sd, [
                            R[4] || (R[4] = e.createElementVNode(
                              "br",
                              null,
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(v.$t("来源行")) + " ",
                              1
                              /* TEXT */
                            ),
                            e.createVNode(l, {
                              value: m(M.rows)
                            }, null, 8, ["value"])
                          ])) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", rd, [
                          M.base != null ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            cents: M.base
                          }, null, 8, ["cents"])) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", id, [
                          M.rate != null ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            ratio: M.rate
                          }, null, 8, ["ratio"])) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", cd, [
                          M.tax != null ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            cents: M.tax
                          }, null, 8, ["cents"])) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", dd, [
                          M.formula ? (e.openBlock(), e.createBlock(l, {
                            key: 0,
                            value: M.formula
                          }, null, 8, ["value"])) : e.createCommentVNode("v-if", !0)
                        ])
                      ], 8, ad))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ], 8, Qc))),
            128
            /* KEYED_FRAGMENT */
          )),
          n.value.zakat ? (e.openBlock(), e.createElementBlock("section", ud, [
            e.createElementVNode("header", md, [
              e.createElementVNode(
                "strong",
                pd,
                e.toDisplayString(v.$t("天课基数")),
                1
                /* TEXT */
              ),
              e.createElementVNode("span", yd, [
                e.createTextVNode(
                  e.toDisplayString(n.value.zakat.yearBasis === "hijri" ? v.$t("天课率（回历年）") : v.$t("天课率（公历年按天数折算）")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: f(n.value.zakat.rate)
                }, null, 8, ["value"])
              ]),
              n.value.zakat.floorApplied ? (e.openBlock(), e.createElementBlock(
                "span",
                Nd,
                e.toDisplayString(v.$t("按调整后净利润（下限）")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("div", Vd, [
              e.createElementVNode("table", Ed, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("行号")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("科目")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("类别")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      vd,
                      e.toDisplayString(v.$t("金额")),
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
                          disabled: !i.editable || S.value,
                          onChange: (M) => z[d.accountCode || d.accountName] = M.target.value
                        }, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(e.unref(E), (M) => (e.openBlock(), e.createElementBlock("option", {
                              key: M,
                              value: M
                            }, e.toDisplayString(v.$t(L[M])), 9, fd))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 40, kd),
                        d.source === "manual" ? (e.openBlock(), e.createElementBlock(
                          "span",
                          hd,
                          e.toDisplayString(v.$t("人工")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", $d, [
                        e.createVNode(l, {
                          cents: d.amount
                        }, null, 8, ["cents"])
                      ])
                    ], 10, gd))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode("dl", _d, [
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(v.$t("加项合计")),
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
                e.toDisplayString(v.$t("减项合计")),
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
                e.toDisplayString(v.$t("调整后净利润（基数下限）")),
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
                e.toDisplayString(v.$t("天课基数")),
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
                e.toDisplayString(v.$t("应缴天课")),
                1
                /* TEXT */
              ),
              e.createElementVNode("dd", Bd, [
                e.createVNode(l, {
                  cents: n.value.zakat.zakatDue
                }, null, 8, ["cents"])
              ])
            ]),
            i.editable ? (e.openBlock(), e.createElementBlock("div", bd, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: S.value || !Object.keys(z).length,
                "data-test": "fau-zakat-rerun",
                onClick: _
              }, [
                R[5] || (R[5] = e.createElementVNode(
                  "i",
                  { class: "ri-refresh-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(v.$t("按新归类重算")),
                  1
                  /* TEXT */
                )
              ], 8, Sd)
            ])) : e.createCommentVNode("v-if", !0)
          ])) : e.createCommentVNode("v-if", !0),
          n.value.calendar.length ? (e.openBlock(), e.createElementBlock("section", Dd, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(v.$t("申报日历")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Cd, [
              e.createElementVNode("table", wd, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("事项")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("期间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("截止日")),
                      1
                      /* TEXT */
                    ),
                    n.value.region === "SA" ? (e.openBlock(), e.createElementBlock(
                      "th",
                      Td,
                      e.toDisplayString(v.$t("截止日（回历）")),
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
                        e.toDisplayString(e.unref(X)(d.label)),
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
                      n.value.region === "SA" ? (e.openBlock(), e.createElementBlock("td", Ld, [
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
          e.createVNode(Me, {
            findings: n.value.findings
          }, null, 8, ["findings"]),
          e.createVNode(je, {
            rules: n.value.rules,
            open: N.value
          }, null, 8, ["rules", "open"])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" C2 监管报送与信息披露 "),
      c.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createElementVNode("div", Kd, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(u), (d) => (e.openBlock(), e.createElementBlock("span", {
                key: d,
                class: e.normalizeClass(["fau-badge", d === "none" ? "muted" : "warn"]),
                "data-test": `fau-disclosure-count-${d}`
              }, [
                e.createTextVNode(
                  e.toDisplayString(v.$t(k[d])) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: c.value.counts[d] || 0
                }, null, 8, ["value"])
              ], 10, Ad))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("dl", Fd, [
            e.createElementVNode(
              "dt",
              null,
              e.toDisplayString(v.$t("总资产")),
              1
              /* TEXT */
            ),
            e.createElementVNode("dd", null, [
              e.createVNode(l, {
                cents: c.value.base.totalAssets
              }, null, 8, ["cents"])
            ]),
            e.createElementVNode(
              "dt",
              null,
              e.toDisplayString(v.$t("净资产")),
              1
              /* TEXT */
            ),
            e.createElementVNode("dd", null, [
              e.createVNode(l, {
                cents: c.value.base.netAssets
              }, null, 8, ["cents"])
            ]),
            e.createElementVNode(
              "dt",
              null,
              e.toDisplayString(v.$t("营业收入")),
              1
              /* TEXT */
            ),
            e.createElementVNode("dd", null, [
              e.createVNode(l, {
                cents: c.value.base.revenue
              }, null, 8, ["cents"])
            ]),
            e.createElementVNode(
              "dt",
              null,
              e.toDisplayString(v.$t("净利润")),
              1
              /* TEXT */
            ),
            e.createElementVNode("dd", null, [
              e.createVNode(l, {
                cents: c.value.base.netProfit
              }, null, 8, ["cents"])
            ])
          ]),
          e.createElementVNode("div", Id, [
            e.createElementVNode("table", Pd, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(v.$t("日期")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(v.$t("类型")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(v.$t("事项说明")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    Od,
                    e.toDisplayString(v.$t("金额")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(v.$t("结论")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(v.$t("达到的标准")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(v.$t("披露草稿")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(c.value.items, (d) => (e.openBlock(), e.createElementBlock("tr", {
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
                      e.toDisplayString(v.$t(g[d.type] || g.other)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", Md, [
                      e.createTextVNode(
                        e.toDisplayString(d.description),
                        1
                        /* TEXT */
                      ),
                      d.counterparty ? (e.openBlock(), e.createElementBlock("small", jd, [
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
                    e.createElementVNode("td", Rd, [
                      e.createVNode(l, {
                        cents: d.amount
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(v.$t(k[d.level])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", qd, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(d.tests.filter((M) => M.hit), (M) => (e.openBlock(), e.createElementBlock("div", {
                          key: M.id
                        }, [
                          e.createTextVNode(
                            e.toDisplayString(e.unref(X)(M.label)),
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
                    e.createElementVNode("td", Ud, [
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
                            e.toDisplayString(d.draftStatus === "verified" ? v.$t("已核实") : v.$t("未核实")),
                            3
                            /* TEXT, CLASS */
                          )
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ])
                  ], 10, zd))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ]),
          e.createVNode(Me, {
            findings: c.value.dataChecks
          }, null, 8, ["findings"]),
          c.value.rules.length ? (e.openBlock(), e.createBlock(je, {
            key: 0,
            rules: c.value.rules,
            open: N.value
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
          e.createElementVNode("section", Wd, [
            e.createElementVNode("header", Yd, [
              e.createElementVNode(
                "strong",
                Gd,
                e.toDisplayString(v.$t(b[a.value.pli])),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["fau-badge", a.value.position === "below" ? "bad" : a.value.position === "within" ? "ok" : "warn"]),
                  "data-test": "fau-tp-position"
                },
                e.toDisplayString(v.$t(h[a.value.position])),
                3
                /* TEXT, CLASS */
              )
            ]),
            e.createElementVNode("dl", Hd, [
              e.createElementVNode(
                "dt",
                null,
                e.toDisplayString(v.$t("受测方")),
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
                    e.toDisplayString(v.$t("可比公司家数")),
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
                    e.toDisplayString(v.$t("下四分位")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("dd", Qd, [
                    e.createVNode(l, {
                      value: p(a.value.range.q1)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(v.$t("中位值")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("dd", Jd, [
                    e.createVNode(l, {
                      value: p(a.value.range.median)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "dt",
                    null,
                    e.toDisplayString(v.$t("上四分位")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("dd", Zd, [
                    e.createVNode(l, {
                      value: p(a.value.range.q3)
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
                    e.toDisplayString(v.$t("调整到中位值需增加的营业利润")),
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
            e.createElementVNode("div", Xd, [
              e.createElementVNode("table", xd, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("可比公司")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("年度")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      eu,
                      e.toDisplayString(v.$t(b[a.value.pli])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("参与计算")),
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
                        e.createElementVNode("td", tu, [
                          e.createVNode(l, {
                            ratio: d.pli
                          }, null, 8, ["ratio"])
                        ]),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(d.included ? "✓" : e.unref(X)(d.reason)),
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
          ]),
          a.value.rpt.length || a.value.docs.length ? (e.openBlock(), e.createElementBlock("section", lu, [
            a.value.rpt.length ? (e.openBlock(), e.createElementBlock("div", nu, [
              e.createElementVNode("table", au, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("交易类型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      ou,
                      e.toDisplayString(v.$t("笔数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      su,
                      e.toDisplayString(v.$t("金额")),
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
                        e.toDisplayString(v.$t(K[d.type])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", ru, [
                        e.createVNode(l, {
                          value: d.count
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", iu, [
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
            a.value.docs.length ? (e.openBlock(), e.createElementBlock("div", cu, [
              e.createElementVNode("table", du, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("文档")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("须准备")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("依据")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(v.$t("已准备")),
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
                        e.toDisplayString(v.$t(T[d.id])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.required ? "✓" : "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        mu,
                        e.toDisplayString(e.unref(X)(d.reason)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.prepared ? "✓" : "—"),
                        1
                        /* TEXT */
                      )
                    ], 10, uu))),
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
                  e.toDisplayString(e.unref(X)(d.heading)) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["fau-badge", d.status === "verified" ? "ok" : "bad"])
                  },
                  e.toDisplayString(d.status === "verified" ? v.$t("已核实") : v.$t("未核实")),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              e.createElementVNode(
                "p",
                pu,
                e.toDisplayString(d.text),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createVNode(Me, {
            findings: a.value.findings
          }, null, 8, ["findings"]),
          a.value.rules.length ? (e.openBlock(), e.createBlock(je, {
            key: 1,
            rules: a.value.rules,
            open: N.value
          }, null, 8, ["rules", "open"])) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0),
      w.value ? (e.openBlock(), e.createElementBlock("p", yu, [
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
}), Vu = /* @__PURE__ */ ae(Nu, [["__scopeId", "data-v-1f8f3583"]]), o = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/i18n"];
if (!o) throw new Error("宿主模块未就绪：npm:@totalclaw/i18n");
o.default;
const Eu = {
  current: o.i18nKey("未逾期"),
  d1_30: o.i18nKey("逾期 1–30 天"),
  d31_60: o.i18nKey("逾期 31–60 天"),
  d61_90: o.i18nKey("逾期 61–90 天"),
  d91_180: o.i18nKey("逾期 91–180 天"),
  d181_365: o.i18nKey("逾期 181–365 天"),
  over365: o.i18nKey("逾期 1 年以上")
}, vu = {
  current: "-",
  d1_30: "< 5%",
  d31_60: "5–15%",
  d61_90: "5–15%",
  d91_180: "15–40%",
  d181_365: "40–70%",
  over365: "> 70%"
}, gu = { low: o.i18nKey("低"), medium: o.i18nKey("中"), high: o.i18nKey("高") }, ku = {
  0: o.i18nKey("未逾期"),
  1: o.i18nKey("阶段 1：友好提醒"),
  2: o.i18nKey("阶段 2：正式提醒"),
  3: o.i18nKey("阶段 3：书面催款"),
  4: o.i18nKey("阶段 4：最后通知并暂停接单"),
  5: o.i18nKey("阶段 5：诉讼评估或核销评估")
}, fu = {
  excellent: o.i18nKey("优秀"),
  good: o.i18nKey("良好"),
  fair: o.i18nKey("一般"),
  poor: o.i18nKey("较差"),
  bad: o.i18nKey("极差"),
  unknown: o.i18nKey("无记录")
}, hu = {
  ar_supervisor: o.i18nKey("AR 主管"),
  credit_manager: o.i18nKey("AR 主管 + 信用管理经理"),
  cfo: o.i18nKey("AR 主管 + 信用管理经理 + 财务总监")
}, $u = {
  full: o.i18nKey("数量完全匹配"),
  partial: o.i18nKey("部分交货"),
  invoice_short: o.i18nKey("发票数量少于收货"),
  over_invoiced: o.i18nKey("发票数量多于收货"),
  not_received: o.i18nKey("未收货"),
  not_invoiced: o.i18nKey("未开票")
}, at = {
  match: o.i18nKey("完全匹配"),
  within_tol: o.i18nKey("容差内"),
  review: o.i18nKey("需说明，主管审批"),
  reject: o.i18nKey("不付，联系供应商")
};
o.i18nKey("税率一致"), o.i18nKey("发票税率低于订单"), o.i18nKey("发票税率高于订单"), o.i18nKey("税率未知");
const ot = {
  P0: o.i18nKey("P0 已逾期"),
  P1: o.i18nKey("P1 战略供应商"),
  P2: o.i18nKey("P2 7 天内到期"),
  P3: o.i18nKey("P3 8–30 天到期"),
  P4: o.i18nKey("P4 30 天后到期")
}, _u = {
  l1: o.i18nKey("AP 专员 → AP 主管"),
  l2: o.i18nKey("加财务经理"),
  l3: o.i18nKey("加财务总监"),
  l4: o.i18nKey("加 CEO")
};
o.i18nKey("未逾期"), o.i18nKey("正常"), o.i18nKey("关注"), o.i18nKey("警告"), o.i18nKey("高风险");
const Bu = {
  none: o.i18nKey("资金充足"),
  small: o.i18nKey("小额缺口：延后 P3 / P4 或加速催收"),
  medium: o.i18nKey("中等缺口：短期融资并协商延后"),
  large: o.i18nKey("大额缺口：升级财务总监")
}, bu = { approve: o.i18nKey("可付"), conditional: o.i18nKey("附条件"), hold: o.i18nKey("暂停付款") }, st = { pass: o.i18nKey("通过"), review: o.i18nKey("需补正"), reject: o.i18nKey("驳回"), escalate: o.i18nKey("升级") }, Su = {
  high_frequency: o.i18nKey("高频异常员工"),
  split: o.i18nKey("疑似拆单"),
  supplier_concentration: o.i18nKey("供应商集中"),
  cross_period: o.i18nKey("跨期规律"),
  weekend: o.i18nKey("周末票据"),
  round_amount: o.i18nKey("整数金额"),
  sequential: o.i18nKey("发票连号"),
  duplicate: o.i18nKey("同票多报")
}, Du = {
  decode: o.i18nKey("二维码解不开"),
  missing_tags: o.i18nKey("缺必填字段"),
  seller: o.i18nKey("卖方名称不一致"),
  vat_no: o.i18nKey("增值税号不一致"),
  vat_no_format: o.i18nKey("增值税号格式不对"),
  date: o.i18nKey("开票时间不一致"),
  total: o.i18nKey("含税总额不一致"),
  vat: o.i18nKey("增值税额不一致")
}, Cu = {
  straight_line: o.i18nKey("直线法"),
  units: o.i18nKey("工作量法"),
  ddb: o.i18nKey("双倍余额递减法"),
  syd: o.i18nKey("年数总和法")
}, wu = { cn: o.i18nKey("中国"), sa: o.i18nKey("沙特"), intl: o.i18nKey("国际") };
o.i18nKey("在上下限内"), o.i18nKey("低于下限"), o.i18nKey("高于上限"), o.i18nKey("未检查");
const Tu = {
  matched: o.i18nKey("相符"),
  amount: o.i18nKey("金额差异"),
  quantity: o.i18nKey("数量差异"),
  timing: o.i18nKey("时间差异"),
  gl_only: o.i18nKey("仅本方入账"),
  sub_only: o.i18nKey("仅对方入账")
}, rt = {
  arap: o.i18nKey("应收 ↔ 应付"),
  sales: o.i18nKey("内部销售 ↔ 内部采购"),
  loan: o.i18nKey("借出 ↔ 借入"),
  interest: o.i18nKey("利息收入 ↔ 利息支出"),
  other: o.i18nKey("其他往来")
}, Lu = {
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
function Ku(i) {
  return Lu[i] || i;
}
const Au = {
  key: 0,
  class: "fau-flags"
}, Fu = {
  key: 1,
  class: "fau-badge ok"
}, Iu = /* @__PURE__ */ e.defineComponent({
  __name: "FauFlags",
  props: {
    flags: {},
    okText: {}
  },
  setup(i) {
    return (B, t) => i.flags?.length ? (e.openBlock(), e.createElementBlock("span", Au, [
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(i.flags, (y, r) => (e.openBlock(), e.createElementBlock(
          "span",
          {
            key: `${y.code}-${r}`,
            class: e.normalizeClass(["fau-badge", y.level === "block" ? "bad" : y.level === "warn" ? "warn" : "muted"])
          },
          e.toDisplayString(B.$t(e.unref(Ku)(y.code), y.params || {})),
          3
          /* TEXT, CLASS */
        ))),
        128
        /* KEYED_FRAGMENT */
      ))
    ])) : i.okText ? (e.openBlock(), e.createElementBlock(
      "span",
      Fu,
      e.toDisplayString(i.okText),
      1
      /* TEXT */
    )) : e.createCommentVNode("v-if", !0);
  }
}), me = /* @__PURE__ */ ae(Iu, [["__scopeId", "data-v-049073de"]]), Pu = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-ar-panel"
}, Ou = { class: "fau-acc-sec" }, zu = { class: "fau-badge muted" }, Mu = { class: "fau-badge" }, ju = { class: "fau-badge warn" }, Ru = {
  class: "fau-badge bad",
  "data-test": "fau-ar-provision"
}, qu = { class: "fau-table-wrap" }, Uu = { class: "fau-table" }, Wu = { class: "num" }, Yu = { class: "num" }, Gu = { class: "num" }, Hu = { class: "num" }, Qu = { class: "num" }, Ju = ["data-test"], Zu = {
  class: "num",
  "data-test": "amount"
}, Xu = { class: "num" }, xu = { class: "num" }, em = { class: "num" }, tm = { class: "num" }, lm = { class: "fau-acc-sec" }, nm = { class: "fau-badge warn" }, am = { class: "fau-table-wrap" }, om = { class: "fau-table" }, sm = { class: "num" }, rm = { class: "num" }, im = { class: "num" }, cm = { class: "num" }, dm = { class: "num" }, um = ["data-test"], mm = { class: "num" }, pm = { class: "num" }, ym = { class: "num" }, Nm = { class: "num" }, Vm = { class: "num" }, Em = { class: "wrap" }, vm = {
  key: 0,
  class: "ss-note warn",
  "data-test": "fau-ar-letters"
}, gm = {
  key: 0,
  class: "fau-acc-sec",
  "data-test": "fau-ar-credit"
}, km = { class: "fau-table-wrap" }, fm = { class: "fau-table" }, hm = { class: "num" }, $m = { class: "num" }, _m = { class: "num" }, Bm = { class: "num" }, bm = { class: "num" }, Sm = { class: "num" }, Dm = { class: "wrap" }, Cm = {
  key: 1,
  class: "fau-acc-esc",
  "data-test": "fau-ar-escalations"
}, wm = /* @__PURE__ */ e.defineComponent({
  __name: "ArPanel",
  props: {
    run: {},
    def: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result), y = s.listSeparator();
    return (r, n) => t.value ? (e.openBlock(), e.createElementBlock("div", Pu, [
      e.createElementVNode("section", Ou, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(r.$t("账龄分布与坏账准备")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", zu, [
            e.createTextVNode(
              e.toDisplayString(r.$t("截止日")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: t.value.asOf
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("span", Mu, [
            e.createTextVNode(
              e.toDisplayString(r.$t("未清合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.total
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", ju, [
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
          e.createElementVNode("span", Ru, [
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
        e.createElementVNode("div", qu, [
          e.createElementVNode("table", Uu, [
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
                  Wu,
                  e.toDisplayString(r.$t("未清金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Yu,
                  e.toDisplayString(r.$t("占比")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Gu,
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
                  Hu,
                  e.toDisplayString(r.$t("计提比例")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Qu,
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
                e.renderList(t.value.buckets, (c) => (e.openBlock(), e.createElementBlock("tr", {
                  key: c.bucket,
                  "data-test": `fau-ar-bucket-${c.bucket}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(r.$t(e.unref(Eu)[c.bucket])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Zu, [
                    e.createVNode(l, {
                      cents: c.amount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Xu, [
                    e.createVNode(l, {
                      ratio: c.share
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", xu, [
                    e.createVNode(l, {
                      value: c.count
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: e.unref(vu)[c.bucket]
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", em, [
                    e.createVNode(l, {
                      ratio: c.provisionRate
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", tm, [
                    e.createVNode(l, {
                      cents: c.provision
                    }, null, 8, ["cents"])
                  ])
                ], 8, Ju))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", lm, [
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
            nm,
            e.toDisplayString(r.$t("TOP 风险客户")) + ": " + e.toDisplayString(t.value.top.join(e.unref(y)) || "-"),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", am, [
          e.createElementVNode("table", om, [
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
                  sm,
                  e.toDisplayString(r.$t("未清合计")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  rm,
                  e.toDisplayString(r.$t("逾期金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  im,
                  e.toDisplayString(r.$t("最长逾期天数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  cm,
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
                  dm,
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
                e.renderList(t.value.customers, (c) => (e.openBlock(), e.createElementBlock("tr", {
                  key: c.customer,
                  class: e.normalizeClass({ bad: c.risk === "high", warn: c.risk === "medium" }),
                  "data-test": `fau-ar-customer-${c.customer}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(c.customer),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", mm, [
                    e.createVNode(l, {
                      cents: c.open
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", pm, [
                    e.createVNode(l, {
                      cents: c.overdue
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ym, [
                    e.createVNode(l, {
                      value: c.maxOverdueDays
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Nm, [
                    e.createVNode(l, {
                      cents: c.provision
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(r.$t(e.unref(gu)[c.risk])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(r.$t(e.unref(ku)[c.stage])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Vm, [
                    e.createVNode(l, {
                      ratio: c.utilization
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", Em, [
                    e.createVNode(me, {
                      flags: c.flags
                    }, null, 8, ["flags"])
                  ])
                ], 10, um))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        t.value.letters.length ? (e.openBlock(), e.createElementBlock("p", vm, [
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
      t.value.credit.length ? (e.openBlock(), e.createElementBlock("section", gm, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(r.$t("信用评估")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", km, [
          e.createElementVNode("table", fm, [
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
                  hm,
                  e.toDisplayString(r.$t("建议账期（天）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  $m,
                  e.toDisplayString(r.$t("现有额度")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  _m,
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
                e.renderList(t.value.credit, (c) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: c.customer,
                    class: e.normalizeClass({ bad: c.grade === "D" })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(c.customer),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(r.$t(e.unref(fu)[c.history])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: c.grade
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", Bm, [
                      e.createVNode(l, {
                        value: c.termDays
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", bm, [
                      e.createVNode(l, {
                        cents: c.currentLimit
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", Sm, [
                      e.createVNode(l, {
                        cents: c.suggestedLimit
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(r.$t(e.unref(hu)[c.approval])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", Dm, [
                      e.createVNode(me, {
                        flags: c.reasons
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
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", Cm, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (c, a) => (e.openBlock(), e.createElementBlock("li", { key: a }, [
            n[2] || (n[2] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(X)(c)),
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
}), Tm = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-ap-panel"
}, Lm = {
  key: 0,
  class: "fau-acc-sec",
  "data-test": "fau-ap-match"
}, Km = ["data-test"], Am = { class: "fau-table-wrap" }, Fm = { class: "fau-table" }, Im = { class: "num" }, Pm = { class: "num" }, Om = { class: "num" }, zm = { class: "num" }, Mm = { class: "num" }, jm = { class: "num" }, Rm = ["data-test"], qm = {
  key: 0,
  class: "ss-muted"
}, Um = { class: "num" }, Wm = { class: "num" }, Ym = { class: "num" }, Gm = { class: "num" }, Hm = { "data-test": "grade" }, Qm = { class: "num" }, Jm = { class: "num" }, Zm = { class: "wrap" }, Xm = {
  key: 1,
  class: "fau-acc-sec",
  "data-test": "fau-ap-plan"
}, xm = { class: "fau-badge muted" }, ep = { class: "fau-badge" }, tp = { class: "fau-acc-kpis" }, lp = {
  class: "fau-badge ok",
  "data-test": "fau-ap-scheduled"
}, np = { class: "fau-badge warn" }, ap = { class: "fau-badge bad" }, op = ["data-test"], sp = { class: "ss-note warn" }, rp = { class: "fau-table-wrap" }, ip = { class: "fau-table" }, cp = { class: "num" }, dp = { class: "num" }, up = { class: "num" }, mp = { class: "num" }, pp = { class: "num" }, yp = { class: "num" }, Np = {
  key: 0,
  class: "ss-muted"
}, Vp = {
  key: 2,
  class: "fau-acc-sec",
  "data-test": "fau-ap-suppliers"
}, Ep = { class: "fau-table-wrap" }, vp = { class: "fau-table" }, gp = { class: "num" }, kp = ["data-test"], fp = { class: "num" }, hp = { class: "wrap" }, $p = {
  key: 3,
  class: "fau-acc-esc",
  "data-test": "fau-ap-escalations"
}, _p = /* @__PURE__ */ e.defineComponent({
  __name: "ApPanel",
  props: {
    run: {},
    def: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result), y = ue.FAU_MATCH_GRADES, r = ue.FAU_PAY_PRIORITIES;
    return (n, c) => t.value ? (e.openBlock(), e.createElementBlock("div", Tm, [
      t.value.match ? (e.openBlock(), e.createElementBlock("section", Lm, [
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
            e.renderList(e.unref(y), (a) => (e.openBlock(), e.createElementBlock("span", {
              key: a,
              class: e.normalizeClass(["fau-badge", a === "reject" ? "bad" : a === "review" ? "warn" : "ok"]),
              "data-test": `fau-ap-grade-${a}`
            }, [
              e.createTextVNode(
                e.toDisplayString(n.$t(e.unref(at)[a])) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: t.value.matchCounts?.[a] ?? 0
              }, null, 8, ["value"])
            ], 10, Km))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        e.createElementVNode("div", Am, [
          e.createElementVNode("table", Fm, [
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
                  Im,
                  e.toDisplayString(n.$t("订单数量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Pm,
                  e.toDisplayString(n.$t("收货数量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Om,
                  e.toDisplayString(n.$t("发票数量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  zm,
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
                  Mm,
                  e.toDisplayString(n.$t("可付")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  jm,
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
                    a.line ? (e.openBlock(), e.createElementBlock("small", qm, [
                      c[0] || (c[0] = e.createTextVNode(
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
                  e.createElementVNode("td", Um, [
                    e.createVNode(l, {
                      value: a.poQty
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Wm, [
                    e.createVNode(l, {
                      value: a.grnQty
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Ym, [
                    e.createVNode(l, {
                      value: a.invQty
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Gm, [
                    e.createVNode(l, {
                      cents: a.priceDiff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(n.$t(e.unref($u)[a.qty])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    Hm,
                    e.toDisplayString(n.$t(e.unref(at)[a.grade])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Qm, [
                    e.createVNode(l, {
                      cents: a.payable
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Jm, [
                    e.createVNode(l, {
                      cents: a.hold
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Zm, [
                    e.createVNode(me, {
                      flags: a.flags
                    }, null, 8, ["flags"])
                  ])
                ], 10, Rm))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.plan ? (e.openBlock(), e.createElementBlock("section", Xm, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(n.$t("付款计划草稿")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", xm, [
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
          e.createElementVNode("span", ep, [
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
                e.toDisplayString(n.$t(e.unref(Bu)[t.value.plan.gapTier])) + " ",
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
        e.createElementVNode("div", tp, [
          e.createElementVNode("span", lp, [
            e.createTextVNode(
              e.toDisplayString(n.$t("本次计划付款")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.plan.scheduledTotal
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", np, [
            e.createTextVNode(
              e.toDisplayString(n.$t("延后")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.plan.deferredTotal
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", ap, [
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
                e.toDisplayString(n.$t(e.unref(ot)[a])) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: t.value.plan.byPriority[a].count
              }, null, 8, ["value"])
            ], 8, op))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        e.createElementVNode("p", sp, [
          c[1] || (c[1] = e.createElementVNode(
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
        e.createElementVNode("div", rp, [
          e.createElementVNode("table", ip, [
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
                  cp,
                  e.toDisplayString(n.$t("逾期天数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  dp,
                  e.toDisplayString(n.$t("未付金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  up,
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
                      e.toDisplayString(n.$t(e.unref(ot)[a.priority])),
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
                    e.createElementVNode("td", mp, [
                      e.createVNode(l, {
                        value: a.overdueDays
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", pp, [
                      e.createVNode(l, {
                        cents: a.open
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", yp, [
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
                      a.deferTo ? (e.openBlock(), e.createElementBlock("small", Np, [
                        c[2] || (c[2] = e.createTextVNode(
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
                      e.toDisplayString(n.$t(e.unref(_u)[a.approval])),
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
      t.value.suppliers.length ? (e.openBlock(), e.createElementBlock("section", Vp, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(n.$t("供应商复核")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ep, [
          e.createElementVNode("table", vp, [
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
                  gp,
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
                  e.createElementVNode("td", fp, [
                    e.createVNode(l, {
                      cents: a.open
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(n.$t(e.unref(bu)[a.conclusion])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", hp, [
                    e.createVNode(me, {
                      flags: a.flags
                    }, null, 8, ["flags"])
                  ])
                ], 10, kp))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", $p, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (a, N) => (e.openBlock(), e.createElementBlock("li", { key: N }, [
            c[3] || (c[3] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(X)(a)),
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
}), Bp = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-expense-panel"
}, bp = { class: "fau-acc-sec" }, Sp = ["data-test"], Dp = { class: "fau-badge muted" }, Cp = { class: "fau-table-wrap" }, wp = { class: "fau-table" }, Tp = { class: "num" }, Lp = ["data-test"], Kp = { class: "num" }, Ap = { "data-test": "verdict" }, Fp = { class: "wrap" }, Ip = {
  class: "fau-acc-sec",
  "data-test": "fau-exp-anomalies"
}, Pp = {
  key: 0,
  class: "ss-muted"
}, Op = {
  key: 1,
  class: "fau-table-wrap"
}, zp = { class: "fau-table" }, Mp = { class: "num" }, jp = { class: "num" }, Rp = ["data-test"], qp = { class: "num" }, Up = { class: "num" }, Wp = {
  key: 0,
  class: "fau-acc-sec",
  "data-test": "fau-exp-zatca"
}, Yp = { class: "fau-table-wrap" }, Gp = { class: "fau-table" }, Hp = { class: "num" }, Qp = { class: "num" }, Jp = ["data-test"], Zp = { class: "num" }, Xp = { class: "num" }, xp = { "data-test": "qr-result" }, ey = {
  key: 0,
  class: "fau-badge ok"
}, ty = { class: "fau-acc-sec" }, ly = { class: "fau-table-wrap" }, ny = { class: "fau-table" }, ay = { class: "num" }, oy = { class: "num" }, sy = { class: "wrap" }, ry = {
  key: 1,
  class: "fau-acc-esc",
  "data-test": "fau-exp-escalations"
}, iy = /* @__PURE__ */ e.defineComponent({
  __name: "ExpensePanel",
  props: {
    run: {},
    def: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result), y = e.computed(() => (t.value?.lines || []).filter((n) => n.qr)), r = ue.FAU_CLAIM_VERDICTS;
    return (n, c) => t.value ? (e.openBlock(), e.createElementBlock("div", Bp, [
      e.createElementVNode("section", bp, [
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
                e.toDisplayString(n.$t(e.unref(st)[a])) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: t.value.counts[a]
              }, null, 8, ["value"])
            ], 10, Sp))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("span", Dp, [
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
        e.createElementVNode("div", Cp, [
          e.createElementVNode("table", wp, [
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
                  Tp,
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
                  e.createElementVNode("td", Kp, [
                    e.createVNode(l, {
                      cents: a.total
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    Ap,
                    e.toDisplayString(n.$t(e.unref(st)[a.verdict])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Fp, [
                    e.createVNode(me, {
                      flags: a.reasons
                    }, null, 8, ["flags"])
                  ])
                ], 10, Lp))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", Ip, [
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
        t.value.anomalies.length ? (e.openBlock(), e.createElementBlock("div", Op, [
          e.createElementVNode("table", zp, [
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
                  Mp,
                  e.toDisplayString(n.$t("笔数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  jp,
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
                e.renderList(t.value.anomalies, (a, N) => (e.openBlock(), e.createElementBlock("tr", {
                  key: N,
                  class: e.normalizeClass({ bad: a.level === "block", warn: a.level === "warn" }),
                  "data-test": `fau-exp-anomaly-${a.code}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(n.$t(e.unref(Su)[a.code])),
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
                  e.createElementVNode("td", qp, [
                    e.createVNode(l, {
                      value: a.count
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", Up, [
                    e.createVNode(l, {
                      cents: a.amount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: a.rows.join(", ")
                    }, null, 8, ["value"])
                  ])
                ], 10, Rp))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Pp,
          e.toDisplayString(n.$t("无")),
          1
          /* TEXT */
        ))
      ]),
      y.value.length ? (e.openBlock(), e.createElementBlock("section", Wp, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(n.$t("ZATCA 二维码")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Yp, [
          e.createElementVNode("table", Gp, [
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
                  Hp,
                  e.toDisplayString(n.$t("含税总额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Qp,
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
                e.renderList(y.value, (a) => (e.openBlock(), e.createElementBlock("tr", {
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
                  e.createElementVNode("td", Zp, [
                    e.createVNode(l, {
                      cents: a.qr.total
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Xp, [
                    e.createVNode(l, {
                      cents: a.qr.vat
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", xp, [
                    a.qr.ok ? (e.openBlock(), e.createElementBlock(
                      "span",
                      ey,
                      e.toDisplayString(n.$t("与票面一致")),
                      1
                      /* TEXT */
                    )) : (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      e.renderList(a.qr.problems, (N) => (e.openBlock(), e.createElementBlock(
                        "span",
                        {
                          key: N,
                          class: "fau-badge bad"
                        },
                        e.toDisplayString(n.$t(e.unref(Du)[N] || N)),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ], 10, Jp))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("details", ty, [
        e.createElementVNode(
          "summary",
          null,
          e.toDisplayString(n.$t("逐张票据检查")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", ly, [
          e.createElementVNode("table", ny, [
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
                  ay,
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
                    class: e.normalizeClass({ bad: a.flags.some((N) => N.level === "block"), warn: a.flags.some((N) => N.level === "warn") })
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
                    e.createElementVNode("td", oy, [
                      e.createVNode(l, {
                        cents: a.total
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", sy, [
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
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", ry, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (a, N) => (e.openBlock(), e.createElementBlock("li", { key: N }, [
            c[0] || (c[0] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(X)(a)),
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
}), cy = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-fa-panel"
}, dy = { class: "fau-acc-sec" }, uy = { class: "fau-badge muted" }, my = { class: "fau-table-wrap" }, py = { class: "fau-table" }, yy = { class: "num" }, Ny = { class: "num" }, Vy = { class: "num" }, Ey = { class: "num" }, vy = { class: "num" }, gy = { class: "num" }, ky = ["data-test"], fy = { class: "num" }, hy = {
  class: "num",
  "data-test": "expected"
}, $y = { class: "num" }, _y = {
  class: "num",
  "data-test": "diff"
}, By = { class: "num" }, by = { class: "num" }, Sy = { class: "wrap" }, Dy = {
  class: "fau-acc-sec",
  "data-test": "fau-fa-roll"
}, Cy = { class: "fau-table-wrap" }, wy = { class: "fau-table" }, Ty = { class: "num" }, Ly = { class: "num" }, Ky = { class: "num" }, Ay = { class: "num" }, Fy = { class: "num" }, Iy = { class: "num" }, Py = { class: "num" }, Oy = { class: "num" }, zy = { class: "num" }, My = { class: "num" }, jy = { class: "num" }, Ry = { class: "num" }, qy = { class: "num" }, Uy = { class: "num" }, Wy = { class: "num" }, Yy = { class: "num" }, Gy = { class: "num" }, Hy = { class: "num" }, Qy = {
  key: 0,
  class: "fau-acc-kpis"
}, Jy = {
  key: 0,
  class: "fau-acc-sec",
  "data-test": "fau-fa-review"
}, Zy = {
  key: 0,
  class: "fau-table-wrap"
}, Xy = { class: "fau-table" }, xy = { class: "num" }, eN = { class: "num" }, tN = { class: "num" }, lN = ["data-test"], nN = { class: "num" }, aN = { class: "num" }, oN = {
  class: "num",
  "data-test": "gain"
}, sN = { class: "wrap" }, rN = {
  key: 1,
  class: "fau-list"
}, iN = { class: "grow" }, cN = {
  key: 2,
  class: "ss-note info"
}, dN = {
  key: 1,
  class: "fau-acc-esc",
  "data-test": "fau-fa-escalations"
}, uN = /* @__PURE__ */ e.defineComponent({
  __name: "FixedAssetsPanel",
  props: {
    run: {},
    def: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result), y = e.ref(!1), r = e.computed(() => (t.value?.lines || []).filter((c) => c.flags.some((a) => a.level !== "info"))), n = e.computed(() => y.value || !r.value.length ? t.value?.lines || [] : r.value);
    return (c, a) => t.value ? (e.openBlock(), e.createElementBlock("div", cy, [
      e.createElementVNode("section", dy, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(c.$t("折旧核对表")),
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
                e.toDisplayString(c.$t("差异")) + " ",
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
          e.createElementVNode("label", uy, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[0] || (a[0] = (N) => y.value = N),
                type: "checkbox"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, y.value]
            ]),
            e.createTextVNode(
              " " + e.toDisplayString(c.$t("显示全部资产")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", my, [
          e.createElementVNode("table", py, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("资产编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("资产名称")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("折旧方法")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  yy,
                  e.toDisplayString(c.$t("原值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ny,
                  e.toDisplayString(c.$t("本期应提（重算）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Vy,
                  e.toDisplayString(c.$t("本期账面")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ey,
                  e.toDisplayString(c.$t("本期差异")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  vy,
                  e.toDisplayString(c.$t("累计折旧（重算）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  gy,
                  e.toDisplayString(c.$t("累计差异")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(n.value, (N) => (e.openBlock(), e.createElementBlock("tr", {
                  key: N.assetNo,
                  class: e.normalizeClass({ bad: N.flags.some((E) => E.level === "block"), warn: N.flags.some((E) => E.level === "warn") }),
                  "data-test": `fau-fa-asset-${N.assetNo}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: N.assetNo
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(N.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(c.$t(e.unref(Cu)[N.method])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", fy, [
                    e.createVNode(l, {
                      cents: N.cost
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", hy, [
                    e.createVNode(l, {
                      cents: N.expectedPeriod
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", $y, [
                    e.createVNode(l, {
                      cents: N.bookedPeriod
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", _y, [
                    e.createVNode(l, {
                      cents: N.diffPeriod
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", By, [
                    e.createVNode(l, {
                      cents: N.expectedAccum
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", by, [
                    e.createVNode(l, {
                      cents: N.diffAccum
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Sy, [
                    e.createVNode(me, {
                      flags: N.flags
                    }, null, 8, ["flags"])
                  ])
                ], 10, ky))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", Dy, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(c.$t("资产滚动表")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Cy, [
          e.createElementVNode("table", wy, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("资产类别")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ty,
                  e.toDisplayString(c.$t("期初原值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ly,
                  e.toDisplayString(c.$t("本期新增")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ky,
                  e.toDisplayString(c.$t("本期处置")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ay,
                  e.toDisplayString(c.$t("期末原值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Fy,
                  e.toDisplayString(c.$t("期初累计折旧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Iy,
                  e.toDisplayString(c.$t("本期折旧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Py,
                  e.toDisplayString(c.$t("处置转出折旧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Oy,
                  e.toDisplayString(c.$t("期末累计折旧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  zy,
                  e.toDisplayString(c.$t("期末净值")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.roll, (N) => (e.openBlock(), e.createElementBlock("tr", {
                  key: N.category
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(N.category),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", My, [
                    e.createVNode(l, {
                      cents: N.openingCost
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", jy, [
                    e.createVNode(l, {
                      cents: N.additions
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Ry, [
                    e.createVNode(l, {
                      cents: N.disposals
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", qy, [
                    e.createVNode(l, {
                      cents: N.closingCost
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Uy, [
                    e.createVNode(l, {
                      cents: N.openingAccum
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Wy, [
                    e.createVNode(l, {
                      cents: N.depreciation
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Yy, [
                    e.createVNode(l, {
                      cents: N.disposalAccum
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Gy, [
                    e.createVNode(l, {
                      cents: N.closingAccum
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Hy, [
                    e.createVNode(l, {
                      cents: N.nbv
                    }, null, 8, ["cents"])
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        t.value.glTie ? (e.openBlock(), e.createElementBlock("div", Qy, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.glTie, (N) => (e.openBlock(), e.createElementBlock(
              "span",
              {
                key: N.item,
                class: e.normalizeClass(["fau-badge", N.diff ? "bad" : "ok"])
              },
              [
                e.createTextVNode(
                  e.toDisplayString(N.item === "cost" ? c.$t("原值") : c.$t("累计折旧")) + " · " + e.toDisplayString(c.$t("与总账差")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: N.diff
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
      t.value.disposals.length || t.value.additions.length ? (e.openBlock(), e.createElementBlock("section", Jy, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(c.$t("购置与处置审核")),
            1
            /* TEXT */
          )
        ]),
        t.value.disposals.length ? (e.openBlock(), e.createElementBlock("div", Zy, [
          e.createElementVNode("table", Xy, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("资产编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("处置日期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  xy,
                  e.toDisplayString(c.$t("账面净值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  eN,
                  e.toDisplayString(c.$t("净收入")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  tN,
                  e.toDisplayString(c.$t("处置损益")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("提示")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.disposals, (N) => (e.openBlock(), e.createElementBlock("tr", {
                  key: `${N.assetNo}-${N.row}`,
                  "data-test": `fau-fa-disposal-${N.assetNo}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: N.assetNo
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: N.date
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", nN, [
                    e.createVNode(l, {
                      cents: N.nbv
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", aN, [
                    e.createVNode(l, {
                      cents: N.net
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", oN, [
                    e.createVNode(l, {
                      cents: N.gainLoss
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", sN, [
                    e.createVNode(me, {
                      flags: N.flags
                    }, null, 8, ["flags"])
                  ])
                ], 8, lN))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0),
        t.value.additions.length ? (e.openBlock(), e.createElementBlock("ul", rN, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.additions, (N) => (e.openBlock(), e.createElementBlock("li", {
              key: `${N.assetNo}-${N.row}`
            }, [
              e.createVNode(l, {
                value: N.assetNo
              }, null, 8, ["value"]),
              e.createElementVNode(
                "span",
                iN,
                e.toDisplayString(N.name),
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                cents: N.amount
              }, null, 8, ["cents"]),
              e.createVNode(me, {
                flags: N.flags,
                "ok-text": c.$t("符合资本化条件")
              }, null, 8, ["flags", "ok-text"])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0),
        t.value.je.length ? (e.openBlock(), e.createElementBlock("p", cN, [
          a[1] || (a[1] = e.createElementVNode(
            "i",
            { class: "ri-file-list-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(c.$t("处置分录草稿 {n} 行，借贷合计相等，只出导入格式，不过账", { n: t.value.je.length })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", dN, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (N, E) => (e.openBlock(), e.createElementBlock("li", { key: E }, [
            a[2] || (a[2] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(X)(N)),
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
}), mN = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-payroll-panel"
}, pN = { class: "fau-acc-sec" }, yN = { class: "fau-badge muted" }, NN = { class: "fau-badge" }, VN = { class: "fau-badge" }, EN = { class: "fau-badge muted" }, vN = {
  key: 0,
  class: "fau-badge warn",
  "data-test": "fau-pay-eosb-total"
}, gN = {
  key: 0,
  class: "ss-note warn"
}, kN = { class: "fau-table-wrap" }, fN = { class: "fau-table" }, hN = { class: "num" }, $N = { class: "num" }, _N = { class: "num" }, BN = { class: "num" }, bN = { class: "num" }, SN = { class: "num" }, DN = { class: "num" }, CN = { class: "num" }, wN = { class: "num" }, TN = ["data-test"], LN = { class: "num" }, KN = { class: "num" }, AN = { class: "num" }, FN = {
  class: "num",
  "data-test": "iit-expected"
}, IN = { class: "num" }, PN = { class: "num" }, ON = {
  class: "num",
  "data-test": "eosb"
}, zN = { class: "num" }, MN = { class: "num" }, jN = { class: "wrap" }, RN = {
  key: 0,
  class: "fau-acc-sec",
  "data-test": "fau-pay-changes"
}, qN = {
  key: 0,
  class: "ss-muted"
}, UN = {
  key: 1,
  class: "fau-list"
}, WN = { class: "grow" }, YN = {
  key: 1,
  class: "ss-note info",
  "data-test": "fau-pay-je"
}, GN = {
  key: 2,
  class: "fau-acc-esc",
  "data-test": "fau-pay-escalations"
}, HN = /* @__PURE__ */ e.defineComponent({
  __name: "PayrollPanel",
  props: {
    run: {},
    def: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result);
    return (y, r) => t.value ? (e.openBlock(), e.createElementBlock("div", mN, [
      e.createElementVNode("section", pN, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(y.$t("薪资复核表")) + " · " + e.toDisplayString(y.$t(e.unref(wu)[t.value.regime])),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", yN, [
            e.createTextVNode(
              e.toDisplayString(y.$t("人数")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: t.value.totals.headcount
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("span", NN, [
            e.createTextVNode(
              e.toDisplayString(y.$t("应发合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.totals.gross
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", VN, [
            e.createTextVNode(
              e.toDisplayString(y.$t("实发合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.totals.net
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", EN, [
            e.createTextVNode(
              e.toDisplayString(y.$t("单位负担")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.totals.employer
            }, null, 8, ["cents"])
          ]),
          t.value.regime === "sa" ? (e.openBlock(), e.createElementBlock("span", vN, [
            e.createTextVNode(
              e.toDisplayString(y.$t("期末服务金本期计提")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: t.value.totals.eosbAccrual
            }, null, 8, ["cents"])
          ])) : e.createCommentVNode("v-if", !0)
        ]),
        t.value.regime === "sa" ? (e.openBlock(), e.createElementBlock("p", gN, [
          r[0] || (r[0] = e.createElementVNode(
            "i",
            { class: "ri-scales-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(y.$t("沙特 GOSI 比例与期末服务金口径为草稿口径，待当地专业人员审核")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", kN, [
          e.createElementVNode("table", fN, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("员工编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("姓名")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  hN,
                  e.toDisplayString(y.$t("应发合计")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  $N,
                  e.toDisplayString(t.value.regime === "sa" ? y.$t("GOSI 个人应扣") : y.$t("个人扣款（应扣）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  _N,
                  e.toDisplayString(y.$t("个人扣款（实扣）")),
                  1
                  /* TEXT */
                ),
                t.value.regime === "cn" ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode(
                      "th",
                      BN,
                      e.toDisplayString(y.$t("个税应扣")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      bN,
                      e.toDisplayString(y.$t("个税实扣")),
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
                      SN,
                      e.toDisplayString(y.$t("服务年限")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      DN,
                      e.toDisplayString(y.$t("期末服务金（重算）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      CN,
                      e.toDisplayString(y.$t("期末服务金（账面）")),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0),
                e.createElementVNode(
                  "th",
                  wN,
                  e.toDisplayString(y.$t("实发（重算）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("提示")),
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
                  class: e.normalizeClass({ bad: n.flags.some((c) => c.level === "block"), warn: n.flags.some((c) => c.level === "warn") }),
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
                  e.createElementVNode("td", LN, [
                    e.createVNode(l, {
                      cents: n.gross
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", KN, [
                    e.createVNode(l, {
                      cents: n.personalExpected
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", AN, [
                    e.createVNode(l, {
                      cents: n.personal
                    }, null, 8, ["cents"])
                  ]),
                  t.value.regime === "cn" ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("td", FN, [
                        e.createVNode(l, {
                          cents: n.iitExpected
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", IN, [
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
                      e.createElementVNode("td", PN, [
                        e.createVNode(l, {
                          value: n.eosb?.years ?? "-"
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", ON, [
                        e.createVNode(l, {
                          cents: n.eosb?.liability ?? null
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", zN, [
                        e.createVNode(l, {
                          cents: n.eosb?.booked ?? null
                        }, null, 8, ["cents"])
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("td", MN, [
                    e.createVNode(l, {
                      cents: n.netExpected
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", jN, [
                    e.createVNode(me, {
                      flags: n.flags
                    }, null, 8, ["flags"])
                  ])
                ], 10, TN))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      t.value.changes ? (e.openBlock(), e.createElementBlock("section", RN, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(y.$t("增减员")),
            1
            /* TEXT */
          )
        ]),
        t.value.changes.length ? (e.openBlock(), e.createElementBlock("ul", UN, [
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
                e.toDisplayString(n.kind === "hire" ? y.$t("新增") : y.$t("减员")),
                3
                /* TEXT, CLASS */
              ),
              e.createVNode(l, {
                value: n.empId
              }, null, 8, ["value"]),
              e.createElementVNode(
                "span",
                WN,
                e.toDisplayString(n.name),
                1
                /* TEXT */
              ),
              e.createVNode(me, {
                flags: n.flags.filter((c) => c.level !== "info")
              }, null, 8, ["flags"])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          qN,
          e.toDisplayString(y.$t("无")),
          1
          /* TEXT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      t.value.je.length ? (e.openBlock(), e.createElementBlock("p", YN, [
        r[1] || (r[1] = e.createElementVNode(
          "i",
          { class: "ri-file-list-3-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t("工资计提分录草稿 {n} 行，借贷合计相等，只出导入格式，不过账", { n: t.value.je.length })),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", GN, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (n, c) => (e.openBlock(), e.createElementBlock("li", { key: c }, [
            r[2] || (r[2] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(X)(n)),
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
}), QN = {
  key: 0,
  class: "fau-acc",
  "data-test": "fau-ic-panel"
}, JN = {
  key: 0,
  class: "fau-acc-sec"
}, ZN = { class: "fau-table-wrap" }, XN = { class: "fau-table" }, xN = { class: "num" }, eV = { class: "num" }, tV = { class: "num" }, lV = { class: "num" }, nV = ["data-test"], aV = { class: "num" }, oV = { class: "num" }, sV = { class: "num" }, rV = {
  class: "num",
  "data-test": "eliminated"
}, iV = ["open"], cV = { class: "fau-table-wrap" }, dV = { class: "fau-table" }, uV = { class: "num" }, mV = { class: "num" }, pV = { class: "num" }, yV = { class: "num" }, NV = { class: "num" }, VV = { class: "num" }, EV = { class: "ss-note info" }, vV = {
  key: 1,
  class: "fau-acc-sec",
  "data-test": "fau-ic-guarantees"
}, gV = { class: "fau-table-wrap" }, kV = { class: "fau-table" }, fV = { class: "num" }, hV = { class: "num" }, $V = { class: "num" }, _V = { class: "num" }, BV = { class: "wrap" }, bV = {
  key: 2,
  class: "fau-acc-sec",
  "data-test": "fau-ic-pricing"
}, SV = { class: "fau-table-wrap" }, DV = { class: "fau-table" }, CV = { class: "num" }, wV = { class: "num" }, TV = { class: "num" }, LV = { class: "num" }, KV = { class: "num" }, AV = { class: "num" }, FV = {
  key: 3,
  class: "fau-acc-esc",
  "data-test": "fau-ic-escalations"
}, IV = /* @__PURE__ */ e.defineComponent({
  __name: "IntercompanyPanel",
  props: {
    run: {},
    def: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result);
    return (y, r) => t.value ? (e.openBlock(), e.createElementBlock("div", QN, [
      t.value.pairs.length ? (e.openBlock(), e.createElementBlock("section", JN, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(y.$t("对账汇总")),
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
                e.toDisplayString(y.$t("差异")) + " ",
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
            e.toDisplayString(t.value.balanced ? y.$t("抵销分录借贷平衡") : y.$t("抵销分录借贷不平")),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode("div", ZN, [
          e.createElementVNode("table", XN, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("配对类别")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("本方公司")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("对方公司")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  xN,
                  e.toDisplayString(y.$t("本方金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  eV,
                  e.toDisplayString(y.$t("对方金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  tV,
                  e.toDisplayString(y.$t("差额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  lV,
                  e.toDisplayString(y.$t("抵销金额")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.pairs, (n, c) => (e.openBlock(), e.createElementBlock("tr", {
                  key: c,
                  class: e.normalizeClass({ warn: n.diff !== 0 }),
                  "data-test": `fau-ic-pair-${n.pair}-${n.entity}`
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(y.$t(e.unref(rt)[n.pair])),
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
                  e.createElementVNode("td", aV, [
                    e.createVNode(l, {
                      cents: n.own
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", oV, [
                    e.createVNode(l, {
                      cents: n.other
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", sV, [
                    e.createVNode(l, {
                      cents: n.diff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", rV, [
                    e.createVNode(l, {
                      cents: n.eliminated
                    }, null, 8, ["cents"])
                  ])
                ], 10, nV))),
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
            e.toDisplayString(y.$t("差异明细")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", cV, [
            e.createElementVNode("table", dV, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(y.$t("配对类别")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(y.$t("本方公司")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(y.$t("对账键")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(y.$t("分类")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    uV,
                    e.toDisplayString(y.$t("本方金额")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    mV,
                    e.toDisplayString(y.$t("对方金额")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    pV,
                    e.toDisplayString(y.$t("差额")),
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
                      e.toDisplayString(y.$t(e.unref(rt)[n.pair])),
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
                      e.toDisplayString(y.$t(e.unref(Tu)[n.cls] || n.cls)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", yV, [
                      e.createVNode(l, {
                        cents: n.own
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", NV, [
                      e.createVNode(l, {
                        cents: n.other
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", VV, [
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
        ], 8, iV)) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("p", EV, [
          r[0] || (r[0] = e.createElementVNode(
            "i",
            { class: "ri-information-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(y.$t("抵销分录不含存货中的未实现内部利润，需按毛利率与期末结存另行计算")),
            1
            /* TEXT */
          )
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.guarantees ? (e.openBlock(), e.createElementBlock("section", vV, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(y.$t("担保检查")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", gV, [
          e.createElementVNode("table", kV, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("担保方")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("被担保方")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  fV,
                  e.toDisplayString(y.$t("担保金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("到期日")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  hV,
                  e.toDisplayString(y.$t("担保余额 / 净资产")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("提示")),
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
                    class: e.normalizeClass({ bad: n.flags.some((c) => c.level === "block"), warn: n.flags.some((c) => c.level === "warn") })
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
                    e.createElementVNode("td", $V, [
                      e.createVNode(l, {
                        cents: n.amount
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: n.endDate
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", _V, [
                      e.createVNode(l, {
                        ratio: n.ratio
                      }, null, 8, ["ratio"])
                    ]),
                    e.createElementVNode("td", BV, [
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
      t.value.pricing ? (e.openBlock(), e.createElementBlock("section", bV, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(y.$t("内部定价偏离")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", SV, [
          e.createElementVNode("table", DV, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("本方公司")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("对方公司")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("往来类型 / 科目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  CV,
                  e.toDisplayString(y.$t("内部价格")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  wV,
                  e.toDisplayString(y.$t("市场价格")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  TV,
                  e.toDisplayString(y.$t("偏离率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("结论")),
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
                    e.createElementVNode("td", LV, [
                      e.createVNode(l, {
                        value: n.internalPrice
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", KV, [
                      e.createVNode(l, {
                        value: n.marketPrice
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", AV, [
                      e.createVNode(l, {
                        ratio: n.deviation
                      }, null, 8, ["ratio"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(n.flagged ? y.$t("偏离，转转让定价") : y.$t("在范围内")),
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
      t.value.escalations.length ? (e.openBlock(), e.createElementBlock("ul", FV, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.escalations, (n, c) => (e.openBlock(), e.createElementBlock("li", { key: c }, [
            r[1] || (r[1] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(X)(n)),
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
}), PV = {
  ar: wm,
  ap: _p,
  expense: iy,
  "fixed-assets": uN,
  payroll: HN,
  intercompany: IV
}, OV = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PANELS: PV
}, Symbol.toStringTag, { value: "Module" })), ee = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/financeAudit/auditLabels.ts"];
if (!ee) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/financeAudit/auditLabels.ts");
ee.default;
const zV = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-icfr-panel"
}, MV = {
  key: 0,
  class: "fau-sec"
}, jV = { class: "grow" }, RV = { class: "fau-badge warn" }, qV = { class: "fau-table-wrap" }, UV = { class: "fau-table" }, WV = ["data-test"], YV = { class: "wrap" }, GV = { class: "fau-quote" }, HV = ["open"], QV = { class: "fau-table-wrap" }, JV = { class: "fau-table" }, ZV = { class: "wrap" }, XV = { class: "fau-quote" }, xV = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-icfr-plans"
}, eE = { class: "grow" }, tE = { class: "fau-row" }, lE = { class: "ss-muted" }, nE = ["disabled"], aE = ["disabled"], oE = { class: "fau-table-wrap" }, sE = { class: "fau-table" }, rE = { class: "num" }, iE = { class: "num" }, cE = { class: "num" }, dE = { class: "num" }, uE = ["data-test"], mE = { class: "num" }, pE = { class: "num" }, yE = { class: "num" }, NE = ["data-test"], VE = {
  key: 0,
  class: "fau-badge muted"
}, EE = { open: "" }, vE = { class: "fau-table-wrap" }, gE = { class: "fau-table" }, kE = { class: "num" }, fE = { class: "num" }, hE = { class: "num" }, $E = { class: "num" }, _E = { class: "fau-seg" }, BE = ["disabled", "data-test", "onClick"], bE = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-icfr-deficiencies"
}, SE = { class: "grow" }, DE = ["data-test"], CE = {
  key: 0,
  class: "ss-muted"
}, wE = {
  key: 1,
  class: "fau-table-wrap"
}, TE = { class: "fau-table" }, LE = { class: "num" }, KE = ["data-test"], AE = { class: "wrap" }, FE = { class: "num" }, IE = ["value", "disabled", "data-test", "onChange"], PE = ["value"], OE = ["value", "disabled", "data-test", "onChange"], zE = ["value"], ME = ["data-test"], jE = {
  key: 3,
  class: "ss-note danger"
}, RE = /* @__PURE__ */ e.defineComponent({
  __name: "IcfrPanel",
  props: {
    run: {},
    def: {}
  },
  emits: ["changed"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = e.computed(() => t.run.result), n = e.computed(() => !["signing", "archived", "void"].includes(t.run.status)), c = e.ref(!1), a = e.ref(""), N = e.ref(typeof t.run.params.seed == "number" ? t.run.params.seed : r.value?.plans[0]?.seed ?? 0), E = ["pass", "fail", "pending"], u = ue.FAU_DEFICIENCY_GRADES, L = ue.FAU_IMPACT_LEVELS, k = ue.FAU_COMPENSATING, g = { material_weakness: "bad", significant: "warn", deficiency: "muted", improvement: "ok" }, b = { effective: "ok", ineffective: "bad", pending: "muted" }, h = (w) => r.value?.tests.find((m) => m.controlId === w);
    async function K(w) {
      c.value = !0, a.value = "";
      try {
        await w(), y("changed");
      } catch (m) {
        a.value = Q.errorMessage(m);
      } finally {
        c.value = !1;
      }
    }
    const T = (w, m, f) => K(() => Y("icfr.sample.update", { runId: t.run.id, controlId: w, row: m, result: f })), z = (w, m) => K(() => Y("icfr.deficiency.update", { runId: t.run.id, id: w, ...m })), S = () => K(() => Y("audit.params.set", { runId: t.run.id, moduleId: "icfr", params: { seed: Math.max(0, Math.floor(Number(N.value) || 0)) } }));
    return (w, m) => r.value ? (e.openBlock(), e.createElementBlock("div", zV, [
      r.value.mode === "design" ? (e.openBlock(), e.createElementBlock("section", MV, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            jV,
            e.toDisplayString(w.$t("风险控制矩阵（草稿）")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            RV,
            e.toDisplayString(w.$t("起草的控制须经测试才能下结论")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", qV, [
          e.createElementVNode("table", UV, [
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
                  e.createElementVNode("td", YV, [
                    e.createTextVNode(
                      e.toDisplayString(f.description),
                      1
                      /* TEXT */
                    ),
                    m[1] || (m[1] = e.createElementVNode(
                      "br",
                      null,
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "small",
                      GV,
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
                ], 10, WV))),
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
          e.createElementVNode("div", QV, [
            e.createElementVNode("table", JV, [
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
                  e.renderList(r.value.approvalMatrix, (f, p) => (e.openBlock(), e.createElementBlock("tr", { key: p }, [
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
                    e.createElementVNode("td", ZV, [
                      e.createElementVNode(
                        "small",
                        XV,
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
        ], 8, HV)
      ])) : e.createCommentVNode("v-if", !0),
      r.value.mode === "testing" ? (e.openBlock(), e.createElementBlock("section", xV, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            eE,
            e.toDisplayString(w.$t("抽样计划")),
            1
            /* TEXT */
          ),
          e.createElementVNode("label", tE, [
            e.createElementVNode(
              "span",
              lE,
              e.toDisplayString(w.$t("随机种子")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": m[0] || (m[0] = (f) => N.value = f),
              type: "number",
              min: "0",
              disabled: !n.value,
              "data-test": "fau-icfr-seed"
            }, null, 8, nE), [
              [
                e.vModelText,
                N.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: c.value || !n.value,
            "data-test": "fau-icfr-reseed",
            onClick: S
          }, e.toDisplayString(w.$t("按这个种子重新抽样")), 9, aE)
        ]),
        e.createElementVNode("div", oE, [
          e.createElementVNode("table", sE, [
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
                  rE,
                  e.toDisplayString(w.$t("总体数量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  iE,
                  e.toDisplayString(w.$t("属性抽样样本量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  cE,
                  e.toDisplayString(w.$t("频率最小样本量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  dE,
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
                  e.createElementVNode("td", mE, [
                    e.createVNode(l, {
                      value: f.population
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", pE, [
                    e.createVNode(l, {
                      value: f.attributeN
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", yE, [
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
                      VE,
                      e.toDisplayString(w.$t("全量测试")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ], 8, NE),
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
                ], 8, uE))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        e.createElementVNode("details", EE, [
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
          e.createElementVNode("div", vE, [
            e.createElementVNode("table", gE, [
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
                    kE,
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
                    fE,
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
                      e.createElementVNode("td", hE, [
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
                      e.createElementVNode("td", $E, [
                        e.createVNode(l, {
                          cents: f.amount
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("span", _E, [
                          (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(E, (p) => e.createElementVNode("button", {
                              key: p,
                              type: "button",
                              class: e.normalizeClass({ on: f.result === p }),
                              disabled: c.value || !n.value,
                              "data-test": `fau-sample-${f.controlId}-${f.seq}-${p}`,
                              onClick: (I) => T(f.controlId, f.row, p)
                            }, e.toDisplayString(w.$t(e.unref(ee.RESULT_LABEL)[p])), 11, BE)),
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
      r.value.mode !== "design" ? (e.openBlock(), e.createElementBlock("section", bE, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            SE,
            e.toDisplayString(w.$t("缺陷评估")),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(u), (f) => (e.openBlock(), e.createElementBlock("span", {
              key: f,
              class: e.normalizeClass(["fau-badge", g[f]]),
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
            ], 10, DE))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        r.value.deficiencies.length ? (e.openBlock(), e.createElementBlock("div", wE, [
          e.createElementVNode("table", TE, [
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
                  LE,
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
                    AE,
                    e.toDisplayString(f.description),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", FE, [
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
                      disabled: c.value || !n.value,
                      "data-test": `fau-def-op-${f.id}`,
                      onChange: (p) => z(f.id, { opImpact: p.target.value })
                    }, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(L), (p) => (e.openBlock(), e.createElementBlock("option", {
                          key: p,
                          value: p
                        }, e.toDisplayString(w.$t(e.unref(ee.IMPACT_LABEL)[p])), 9, PE))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 40, IE)
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("select", {
                      value: f.compensating,
                      disabled: c.value || !n.value,
                      "data-test": `fau-def-comp-${f.id}`,
                      onChange: (p) => z(f.id, { compensating: p.target.value })
                    }, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(k), (p) => (e.openBlock(), e.createElementBlock("option", {
                          key: p,
                          value: p
                        }, e.toDisplayString(w.$t(e.unref(ee.COMP_LABEL)[p])), 9, zE))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 40, OE)
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("span", {
                      class: e.normalizeClass(["fau-badge", g[f.grade]]),
                      "data-test": `fau-def-grade-${f.id}`
                    }, e.toDisplayString(w.$t(e.unref(ee.GRADE_LABEL)[f.grade])), 11, ME)
                  ])
                ], 10, KE))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          CE,
          e.toDisplayString(w.$t("没有缺陷")),
          1
          /* TEXT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", jE, [
        m[2] || (m[2] = e.createElementVNode(
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
}), qE = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-ia-panel"
}, UE = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-ia-plan"
}, WE = { class: "grow" }, YE = { class: "fau-row" }, GE = { class: "ss-muted" }, HE = ["disabled"], QE = ["disabled"], JE = { class: "fau-counts" }, ZE = { class: "fau-badge" }, XE = { class: "fau-badge" }, xE = { class: "fau-table-wrap" }, e1 = { class: "fau-table" }, t1 = { class: "num" }, l1 = ["data-test"], n1 = { class: "num" }, a1 = { class: "wrap" }, o1 = {
  key: 0,
  class: "fau-badge bad"
}, s1 = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-ia-fieldwork"
}, r1 = { class: "grow" }, i1 = { class: "fau-badge" }, c1 = {
  key: 0,
  class: "ss-muted"
}, d1 = {
  key: 1,
  class: "fau-table-wrap"
}, u1 = { class: "fau-table" }, m1 = { class: "wrap" }, p1 = { class: "wrap" }, y1 = { class: "wrap" }, N1 = { class: "fau-quote" }, V1 = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-ia-tracking"
}, E1 = { class: "grow" }, v1 = { class: "fau-row" }, g1 = { class: "ss-muted" }, k1 = ["disabled"], f1 = ["disabled"], h1 = { class: "fau-counts" }, $1 = ["data-test"], _1 = { class: "fau-table-wrap" }, B1 = { class: "fau-table" }, b1 = { class: "num" }, S1 = ["data-test"], D1 = { class: "wrap" }, C1 = { class: "num" }, w1 = {
  key: 3,
  class: "ss-note danger"
}, T1 = /* @__PURE__ */ e.defineComponent({
  __name: "InternalAuditPanel",
  props: {
    run: {},
    def: {}
  },
  emits: ["changed"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = e.computed(() => t.run.result), n = e.computed(() => !["signing", "archived", "void"].includes(t.run.status)), c = e.ref(!1), a = e.ref(""), N = e.ref(r.value?.plan?.availableDays ?? 240), E = e.ref(r.value?.asOf || ""), u = [3, 2, 1];
    async function L(k) {
      c.value = !0, a.value = "";
      try {
        await Y("audit.params.set", { runId: t.run.id, moduleId: "internal-audit", params: k }), y("changed");
      } catch (g) {
        a.value = Q.errorMessage(g);
      } finally {
        c.value = !1;
      }
    }
    return (k, g) => r.value ? (e.openBlock(), e.createElementBlock("div", qE, [
      r.value.plan ? (e.openBlock(), e.createElementBlock("section", UE, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            WE,
            e.toDisplayString(k.$t("年度审计计划")),
            1
            /* TEXT */
          ),
          e.createElementVNode("label", YE, [
            e.createElementVNode(
              "span",
              GE,
              e.toDisplayString(k.$t("年度可用审计人天")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": g[0] || (g[0] = (b) => N.value = b),
              type: "number",
              min: "0",
              disabled: !n.value,
              "data-test": "fau-ia-days"
            }, null, 8, HE), [
              [
                e.vModelText,
                N.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: c.value || !n.value,
            onClick: g[1] || (g[1] = (b) => L({ availableDays: Number(N.value) || 0 }))
          }, e.toDisplayString(k.$t("按新人天重算")), 9, QE)
        ]),
        e.createElementVNode("div", JE, [
          e.createElementVNode("span", ZE, [
            e.createTextVNode(
              e.toDisplayString(k.$t("需求人天")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: r.value.plan.requiredDays
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("span", XE, [
            e.createTextVNode(
              e.toDisplayString(k.$t("可用人天")) + " ",
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
                e.toDisplayString(k.$t("缺口")) + " ",
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
        e.createElementVNode("div", xE, [
          e.createElementVNode("table", e1, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("审计领域")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("可能性")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("风险等级")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("必审")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  t1,
                  e.toDisplayString(k.$t("预计人天")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("季度")),
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
                    e.toDisplayString(k.$t(e.unref(ee.IMPACT_LABEL)[b.likelihood])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(k.$t(e.unref(ee.IMPACT_LABEL)[b.impact])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["fau-badge", b.risk === "high" ? "bad" : b.risk === "medium" ? "warn" : "muted"])
                      },
                      e.toDisplayString(k.$t(e.unref(ee.IMPACT_LABEL)[b.risk])),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(b.mandatory ? k.$t("是") : ""),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", n1, [
                    e.createVNode(l, {
                      value: b.days
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(b.included ? b.quarter : k.$t("未纳入")),
                    1
                    /* TEXT */
                  )
                ], 10, l1))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        e.createElementVNode("p", a1, [
          e.createTextVNode(
            e.toDisplayString(r.value.plan.narrative) + " ",
            1
            /* TEXT */
          ),
          r.value.plan.narrativeStatus === "unverified" ? (e.openBlock(), e.createElementBlock(
            "span",
            o1,
            e.toDisplayString(k.$t("未核实")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      r.value.mode === "fieldwork" ? (e.openBlock(), e.createElementBlock("section", s1, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            r1,
            e.toDisplayString(k.$t("审计发现")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", i1, [
            e.createTextVNode(
              e.toDisplayString(k.$t("审计程序")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: r.value.procedures?.length || 0
            }, null, 8, ["value"])
          ])
        ]),
        r.value.findings?.length ? (e.openBlock(), e.createElementBlock("div", d1, [
          e.createElementVNode("table", u1, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("标题")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("严重程度")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("建议")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("原文依据")),
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
                      m1,
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
                        e.toDisplayString(k.$t(e.unref(ee.SEVERITY_LABEL)[b.severity])),
                        3
                        /* TEXT, CLASS */
                      )
                    ]),
                    e.createElementVNode(
                      "td",
                      p1,
                      e.toDisplayString(b.recommendation),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", y1, [
                      e.createElementVNode(
                        "small",
                        N1,
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
          c1,
          e.toDisplayString(k.$t("没有能引用原文的发现")),
          1
          /* TEXT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      r.value.tracked ? (e.openBlock(), e.createElementBlock("section", V1, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            E1,
            e.toDisplayString(k.$t("发现整改台账")),
            1
            /* TEXT */
          ),
          e.createElementVNode("label", v1, [
            e.createElementVNode(
              "span",
              g1,
              e.toDisplayString(k.$t("截至日")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": g[2] || (g[2] = (b) => E.value = b),
              type: "date",
              disabled: !n.value
            }, null, 8, k1), [
              [e.vModelText, E.value]
            ])
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: c.value || !n.value,
            onClick: g[3] || (g[3] = (b) => L({ asOf: E.value }))
          }, e.toDisplayString(k.$t("按截至日重算")), 9, f1)
        ]),
        e.createElementVNode("div", h1, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(u, (b) => e.createElementVNode("span", {
              key: b,
              class: e.normalizeClass(["fau-badge", b >= 2 ? "bad" : b === 1 ? "warn" : "muted"]),
              "data-test": `fau-ia-tier-${b}`
            }, [
              e.createTextVNode(
                e.toDisplayString(k.$t(e.unref(ee.TIER_LABEL)[b])) + " ",
                1
                /* TEXT */
              ),
              e.createVNode(l, {
                value: r.value.tracked.filter((h) => h.tier === b && h.status !== "closed").length
              }, null, 8, ["value"])
            ], 10, $1)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        e.createElementVNode("div", _1, [
          e.createElementVNode("table", B1, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("标题")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("严重程度")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("负责人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("整改期限")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  b1,
                  e.toDisplayString(k.$t("超期天数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("升级")),
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
                    D1,
                    e.toDisplayString(b.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(k.$t(e.unref(ee.SEVERITY_LABEL)[b.severity])),
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
                    e.toDisplayString(k.$t(e.unref(ee.TRACK_STATUS_LABEL)[b.status])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", C1, [
                    e.createVNode(l, {
                      value: b.overdueDays || ""
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(k.$t(e.unref(ee.TIER_LABEL)[b.tier])),
                    1
                    /* TEXT */
                  )
                ], 10, S1))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", w1, [
        g[4] || (g[4] = e.createElementVNode(
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
}), L1 = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-ea-panel"
}, K1 = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-ea-support"
}, A1 = { class: "grow" }, F1 = { class: "fau-row" }, I1 = { class: "ss-muted" }, P1 = ["disabled"], O1 = ["disabled"], z1 = { class: "fau-counts" }, M1 = ["open"], j1 = { class: "fau-table-wrap" }, R1 = { class: "fau-table" }, q1 = { class: "wrap" }, U1 = {
  key: 0,
  class: "fau-table-wrap",
  "data-test": "fau-ea-adjustments"
}, W1 = { class: "fau-table" }, Y1 = { class: "num" }, G1 = { class: "num" }, H1 = { class: "num" }, Q1 = { class: "num" }, J1 = ["data-test"], Z1 = { class: "wrap" }, X1 = { class: "num" }, x1 = { class: "num" }, ev = { class: "num" }, tv = { class: "num" }, lv = { key: 0 }, nv = { colspan: "2" }, av = { class: "num" }, ov = { class: "num" }, sv = { class: "num" }, rv = { class: "num" }, iv = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-ea-confirmations"
}, cv = { class: "grow" }, dv = {
  key: 0,
  class: "fau-badge"
}, uv = {
  key: 0,
  class: "fau-badge warn",
  "data-test": "fau-ea-send-locked"
}, mv = ["disabled"], pv = { class: "ss-note info" }, yv = { class: "fau-table-wrap" }, Nv = { class: "fau-table" }, Vv = { class: "num" }, Ev = { class: "num" }, vv = { class: "num" }, gv = ["data-test"], kv = { class: "num" }, fv = { class: "num" }, hv = { class: "num" }, $v = ["data-test"], _v = {
  key: 0,
  class: "fau-badge ok"
}, Bv = { class: "wrap" }, bv = {
  class: "fau-modal",
  role: "dialog",
  "aria-modal": "true"
}, Sv = { class: "ss-note warn" }, Dv = {
  key: 0,
  class: "ss-muted"
}, Cv = { class: "fau-list" }, wv = ["data-test"], Tv = { class: "grow" }, Lv = { class: "ss-muted" }, Kv = {
  key: 1,
  class: "fau-esc"
}, Av = { class: "ss-actions" }, Fv = ["disabled"], Iv = {
  key: 3,
  class: "ss-note ok",
  "data-test": "fau-ea-sent"
}, Pv = {
  key: 4,
  class: "ss-note danger"
}, Ov = /* @__PURE__ */ e.defineComponent({
  __name: "ExtAuditPanel",
  props: {
    run: {},
    def: {}
  },
  emits: ["changed"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = e.computed(() => t.run.result), n = e.computed(() => !["signing", "archived", "void"].includes(t.run.status)), c = e.ref(!1), a = e.ref(""), N = e.ref(""), E = e.ref((r.value?.materiality || 0) / 100), u = e.ref(null), L = e.ref([]), k = e.computed(() => new Set(L.value.filter((m) => m.ok).map((m) => m.id))), g = s.listSeparator(), b = ["provided", "requested", "overdue"], h = { draft: "muted", sent: "warn", replied_match: "ok", replied_diff: "bad", no_reply: "bad" };
    async function K(m) {
      c.value = !0, a.value = "";
      try {
        await m();
      } catch (f) {
        a.value = Q.errorMessage(f);
      } finally {
        c.value = !1;
      }
    }
    const T = (m) => K(async () => {
      await Y("audit.params.set", { runId: t.run.id, moduleId: "ext-audit", params: m }), y("changed");
    }), z = async () => {
      r.value?.mode === "confirm_prepare" && (L.value = await Y("ext-audit.confirm.sentLog", { runId: t.run.id }));
    }, S = () => K(async () => {
      u.value = await Y("ext-audit.confirm.prepareSend", { runId: t.run.id });
    }), w = () => K(async () => {
      const m = u.value;
      if (!m) return;
      const f = await Y("ext-audit.confirm.send", { runId: t.run.id, token: m.token });
      u.value = null, N.value = s.t("已发送 {n} 份，失败 {m} 份", { n: f.filter((p) => p.ok).length, m: f.filter((p) => !p.ok).length }), await z(), y("changed");
    });
    return e.onMounted(() => {
      z().catch(() => {
      });
    }), (m, f) => r.value ? (e.openBlock(), e.createElementBlock("div", L1, [
      r.value.mode === "support" ? (e.openBlock(), e.createElementBlock("section", K1, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            A1,
            e.toDisplayString(m.$t("资料清单与审计调整")),
            1
            /* TEXT */
          ),
          e.createElementVNode("label", F1, [
            e.createElementVNode(
              "span",
              I1,
              e.toDisplayString(m.$t("重要性水平")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": f[0] || (f[0] = (p) => E.value = p),
              type: "number",
              min: "0",
              disabled: !n.value,
              "data-test": "fau-ea-materiality"
            }, null, 8, P1), [
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
            disabled: c.value || !n.value,
            onClick: f[1] || (f[1] = (p) => T({ materiality: Number(E.value) || 0 }))
          }, e.toDisplayString(m.$t("按重要性水平重算")), 9, O1)
        ]),
        e.createElementVNode("div", z1, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(b, (p) => e.createElementVNode(
              "span",
              {
                key: p,
                class: e.normalizeClass(["fau-badge", p === "provided" ? "ok" : p === "overdue" ? "bad" : "muted"])
              },
              [
                e.createTextVNode(
                  e.toDisplayString(m.$t(e.unref(ee.PBC_STATUS_LABEL)[p])) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: (r.value.pbc || []).filter((I) => I.status === p).length
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
            e.toDisplayString(m.$t("PBC 进度")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", j1, [
            e.createElementVNode("table", R1, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(m.$t("编号")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(m.$t("资料名称")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(m.$t("负责人")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(m.$t("截止日期")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(m.$t("状态")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(r.value.pbc || [], (p) => (e.openBlock(), e.createElementBlock(
                    "tr",
                    {
                      key: p.id,
                      class: e.normalizeClass({ bad: p.status === "overdue" })
                    },
                    [
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: p.id
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode(
                        "td",
                        q1,
                        e.toDisplayString(p.item),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(p.owner),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createVNode(l, {
                          value: p.dueDate
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(m.$t(e.unref(ee.PBC_STATUS_LABEL)[p.status])),
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
        ], 8, M1),
        r.value.adjustments?.length ? (e.openBlock(), e.createElementBlock("div", U1, [
          e.createElementVNode("table", W1, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("凭证号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("摘要")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Y1,
                  e.toDisplayString(m.$t("利润影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  G1,
                  e.toDisplayString(m.$t("资产影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  H1,
                  e.toDisplayString(m.$t("负债影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Q1,
                  e.toDisplayString(m.$t("权益影响")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("超过重要性水平")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.adjustments, (p) => (e.openBlock(), e.createElementBlock("tr", {
                  key: p.voucherNo,
                  class: e.normalizeClass({ bad: p.exceedsMateriality || !p.balanced }),
                  "data-test": `fau-ea-adj-${p.voucherNo}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.voucherNo
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    Z1,
                    e.toDisplayString(p.summary),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", X1, [
                    e.createVNode(l, {
                      cents: p.profitImpact
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", x1, [
                    e.createVNode(l, {
                      cents: p.assetImpact
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", ev, [
                    e.createVNode(l, {
                      cents: p.liabilityImpact
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", tv, [
                    e.createVNode(l, {
                      cents: p.equityImpact
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(p.exceedsMateriality ? m.$t("是") : ""),
                    1
                    /* TEXT */
                  )
                ], 10, J1))),
                128
                /* KEYED_FRAGMENT */
              )),
              r.value.adjustmentTotals ? (e.openBlock(), e.createElementBlock("tr", lv, [
                e.createElementVNode("td", nv, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(m.$t("合计")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("td", av, [
                  e.createElementVNode("strong", null, [
                    e.createVNode(l, {
                      cents: r.value.adjustmentTotals.profit
                    }, null, 8, ["cents"])
                  ])
                ]),
                e.createElementVNode("td", ov, [
                  e.createVNode(l, {
                    cents: r.value.adjustmentTotals.assets
                  }, null, 8, ["cents"])
                ]),
                e.createElementVNode("td", sv, [
                  e.createVNode(l, {
                    cents: r.value.adjustmentTotals.liabilities
                  }, null, 8, ["cents"])
                ]),
                e.createElementVNode("td", rv, [
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
      r.value.confirmations ? (e.openBlock(), e.createElementBlock("section", iv, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            cv,
            e.toDisplayString(m.$t("函证控制表")),
            1
            /* TEXT */
          ),
          r.value.responseRate !== null && r.value.responseRate !== void 0 ? (e.openBlock(), e.createElementBlock("span", dv, [
            e.createTextVNode(
              e.toDisplayString(m.$t("回函率")) + " ",
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
              i.run.status !== "archived" ? (e.openBlock(), e.createElementBlock(
                "span",
                uv,
                e.toDisplayString(m.$t("签核归档后才能发送")),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn sm primary",
                disabled: c.value,
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
                  e.toDisplayString(m.$t("发送函证")),
                  1
                  /* TEXT */
                )
              ], 8, mv))
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("p", pv, [
          f[6] || (f[6] = e.createElementVNode(
            "i",
            { class: "ri-shield-check-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(m.$t("函证只生成草稿，不会自动发送；签核归档后由人点「发送」并在确认框确认")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", yv, [
          e.createElementVNode("table", Nv, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("函证编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("类型")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("函证对象")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("邮箱")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Vv,
                  e.toDisplayString(m.$t("账面金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ev,
                  e.toDisplayString(m.$t("回函金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  vv,
                  e.toDisplayString(m.$t("差额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("替代程序")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(r.value.confirmations, (p) => (e.openBlock(), e.createElementBlock("tr", {
                  key: p.id,
                  class: e.normalizeClass({ bad: p.status === "replied_diff" || p.status === "no_reply" }),
                  "data-test": `fau-conf-${p.id}`
                }, [
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.id
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(m.$t(e.unref(ee.CONFIRM_TYPE_LABEL)[p.type])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(p.party),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: p.email
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", kv, [
                    e.createVNode(l, {
                      cents: p.bookAmount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", fv, [
                    e.createVNode(l, {
                      cents: p.replyAmount
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", hv, [
                    e.createVNode(l, {
                      cents: p.diff
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("span", {
                      class: e.normalizeClass(["fau-badge", h[p.status]]),
                      "data-test": `fau-conf-status-${p.id}`
                    }, e.toDisplayString(m.$t(e.unref(ee.CONFIRM_STATUS_LABEL)[p.status])), 11, $v),
                    k.value.has(p.id) ? (e.openBlock(), e.createElementBlock(
                      "span",
                      _v,
                      e.toDisplayString(m.$t("已发送")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode(
                    "td",
                    Bv,
                    e.toDisplayString(p.alternative.map((I) => m.$t(I)).join(e.unref(g))),
                    1
                    /* TEXT */
                  )
                ], 10, gv))),
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
        onClick: f[3] || (f[3] = e.withModifiers((p) => u.value = null, ["self"]))
      }, [
        e.createElementVNode("div", bv, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(m.$t("确认发送函证")),
            1
            /* TEXT */
          ),
          e.createElementVNode("p", Sv, [
            f[7] || (f[7] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(m.$t("以下函证将以邮件发给对方，附件是签核归档时的询证函副本。发出后不能撤回。")),
              1
              /* TEXT */
            )
          ]),
          u.value.via === "official" ? (e.openBlock(), e.createElementBlock(
            "p",
            Dv,
            e.toDisplayString(m.$t("你没有配置自己的发信邮箱，将由官方代发；对方回信不会直接到你的邮箱")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("ul", Cv, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(u.value.items, (p) => (e.openBlock(), e.createElementBlock("li", {
                key: p.id,
                "data-test": `fau-ea-send-item-${p.id}`
              }, [
                e.createVNode(l, {
                  value: p.id
                }, null, 8, ["value"]),
                e.createElementVNode("span", Tv, [
                  e.createTextVNode(
                    e.toDisplayString(p.party) + " · ",
                    1
                    /* TEXT */
                  ),
                  e.createVNode(l, {
                    value: p.email
                  }, null, 8, ["value"])
                ]),
                e.createElementVNode(
                  "small",
                  Lv,
                  e.toDisplayString(p.attachment),
                  1
                  /* TEXT */
                )
              ], 8, wv))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          u.value.blocked.length ? (e.openBlock(), e.createElementBlock("ul", Kv, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(u.value.blocked, (p, I) => (e.openBlock(), e.createElementBlock("li", { key: I }, [
                f[8] || (f[8] = e.createElementVNode(
                  "i",
                  { class: "ri-forbid-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(e.unref(X)(p)),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", Av, [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary",
              disabled: c.value || !u.value.items.length,
              "data-test": "fau-ea-send-confirm",
              onClick: w
            }, e.toDisplayString(m.$t("确认发送 {n} 份", { n: u.value.items.length })), 9, Fv),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-btn ghost",
                onClick: f[2] || (f[2] = (p) => u.value = null)
              },
              e.toDisplayString(m.$t("取消")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      N.value ? (e.openBlock(), e.createElementBlock("p", Iv, [
        f[9] || (f[9] = e.createElementVNode(
          "i",
          { class: "ri-mail-check-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(N.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("p", Pv, [
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
}), zv = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-review-panel"
}, Mv = { class: "fau-sec" }, jv = { class: "grow" }, Rv = {
  key: 0,
  class: "fau-esc"
}, qv = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-review-trial"
}, Uv = { class: "grow" }, Wv = { class: "fau-list" }, Yv = ["data-test"], Gv = { class: "grow" }, Hv = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-review-xls"
}, Qv = { class: "grow" }, Jv = {
  key: 0,
  class: "ss-muted"
}, Zv = {
  key: 1,
  class: "fau-table-wrap"
}, Xv = { class: "fau-table" }, xv = ["data-test"], eg = { key: 2 }, tg = { class: "fau-list" }, lg = { class: "grow" }, ng = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-review-nav"
}, ag = { class: "grow" }, og = { class: "fau-table-wrap" }, sg = { class: "fau-table" }, rg = { class: "num" }, ig = { class: "num" }, cg = { class: "num" }, dg = ["data-test"], ug = { class: "num" }, mg = { class: "num" }, pg = { class: "num" }, yg = ["data-test"], Ng = /* @__PURE__ */ e.defineComponent({
  __name: "ReviewPanel",
  props: {
    run: {},
    def: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result);
    return (y, r) => t.value ? (e.openBlock(), e.createElementBlock("div", zv, [
      e.createElementVNode("section", Mv, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            jv,
            e.toDisplayString(y.$t("放行建议")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", t.value.recommendation === "release" ? "ok" : "bad"]),
              "data-test": "fau-review-decision"
            },
            e.toDisplayString(t.value.recommendation === "release" ? y.$t("建议放行") : y.$t("建议暂扣")),
            3
            /* TEXT, CLASS */
          )
        ]),
        t.value.reasons.length ? (e.openBlock(), e.createElementBlock("ul", Rv, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.reasons, (n, c) => (e.openBlock(), e.createElementBlock("li", { key: c }, [
              r[0] || (r[0] = e.createElementVNode(
                "i",
                { class: "ri-alarm-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(e.unref(X)(n)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      t.value.trial ? (e.openBlock(), e.createElementBlock("section", qv, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            Uv,
            e.toDisplayString(y.$t("报表勾稽")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("ul", Wv, [
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
                Gv,
                e.toDisplayString(e.unref(X)(n.message)),
                1
                /* TEXT */
              )
            ], 8, Yv))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      t.value.xls ? (e.openBlock(), e.createElementBlock("section", Hv, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            Qv,
            e.toDisplayString(y.$t("底稿质检")),
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
        t.value.xls.length ? (e.openBlock(), e.createElementBlock("div", Zv, [
          e.createElementVNode("table", Xv, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("文件")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("单元格")),
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
                  e.toDisplayString(y.$t("公式")),
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
                    e.toDisplayString(y.$t(e.unref(ee.XLS_RULE_LABEL)[n.rule])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(y.$t(e.unref(ee.QC_SEVERITY_LABEL)[n.severity])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: n.formula ? `=${n.formula}` : n.detail || ""
                    }, null, 8, ["value"])
                  ])
                ], 10, xv))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Jv,
          e.toDisplayString(y.$t("没有发现问题")),
          1
          /* TEXT */
        )),
        t.value.crossRefs?.length ? (e.openBlock(), e.createElementBlock("details", eg, [
          e.createElementVNode("summary", null, [
            e.createTextVNode(
              e.toDisplayString(y.$t("交叉索引")) + " · ",
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
          e.createElementVNode("ul", tg, [
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
                  lg,
                  e.toDisplayString(n.file),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["fau-badge", n.found ? "ok" : "bad"])
                  },
                  e.toDisplayString(n.found ? y.$t("已找到") : y.$t("断链")),
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
      t.value.nav ? (e.openBlock(), e.createElementBlock("section", ng, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            ag,
            e.toDisplayString(y.$t("LP 资本账户重算")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", t.value.nav.navTies ? "ok" : "bad"])
            },
            e.toDisplayString(y.$t("LP 期末资本合计 = 基金净值")),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode("div", og, [
          e.createElementVNode("table", sg, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("LP 编号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("行项目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  rg,
                  e.toDisplayString(y.$t("对账单金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ig,
                  e.toDisplayString(y.$t("重算金额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  cg,
                  e.toDisplayString(y.$t("差额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("放行建议")),
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
                      e.renderList(n.lines, (c) => (e.openBlock(), e.createElementBlock("tr", {
                        key: `${n.lpId}:${c.line}`,
                        class: e.normalizeClass({ bad: !c.ok }),
                        "data-test": `fau-nav-${n.lpId}-${c.line}`
                      }, [
                        e.createElementVNode("td", null, [
                          e.createVNode(l, {
                            value: n.lpId
                          }, null, 8, ["value"])
                        ]),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(y.$t(e.unref(ee.NAV_LINE_LABEL)[c.line])),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", ug, [
                          e.createVNode(l, {
                            cents: c.statement
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", mg, [
                          e.createVNode(l, {
                            cents: c.recomputed
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", pg, [
                          e.createVNode(l, {
                            cents: c.diff
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode("span", {
                            class: e.normalizeClass(["fau-badge", n.decision === "release" ? "ok" : "bad"]),
                            "data-test": `fau-nav-decision-${n.lpId}`
                          }, e.toDisplayString(n.decision === "release" ? y.$t("建议放行") : y.$t("建议暂扣")), 11, yg)
                        ])
                      ], 10, dg))),
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
}), Vg = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-fraud-panel"
}, Eg = {
  class: "fau-sec",
  "data-test": "fau-fraud-benford"
}, vg = { class: "grow" }, gg = { class: "fau-badge muted" }, kg = { class: "fau-table-wrap" }, fg = { class: "fau-table" }, hg = {
  class: "fau-sec",
  "data-test": "fau-fraud-hits"
}, $g = { class: "grow" }, _g = ["data-test"], Bg = { class: "fau-list" }, bg = { class: "grow" }, Sg = {
  key: 0,
  class: "ss-muted"
}, Dg = {
  key: 1,
  class: "fau-table-wrap"
}, Cg = { class: "fau-table" }, wg = { class: "num" }, Tg = { class: "num" }, Lg = { class: "wrap" }, Kg = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-fraud-plan"
}, Ag = { class: "grow" }, Fg = {
  key: 0,
  class: "fau-badge bad"
}, Ig = { class: "wrap" }, Pg = { class: "fau-steps-list" }, Og = {
  key: 0,
  class: "fau-badge bad"
}, zg = /* @__PURE__ */ e.defineComponent({
  __name: "FraudPanel",
  props: {
    run: {},
    def: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result), y = { high: s.i18nKey("高"), warn: s.i18nKey("中"), info: s.i18nKey("低") }, r = { close: "ok", acceptable: "ok", marginal: "warn", nonconformity: "bad", insufficient: "muted" };
    return (n, c) => t.value ? (e.openBlock(), e.createElementBlock("div", Vg, [
      e.createElementVNode("section", Eg, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            vg,
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
          e.createElementVNode("span", gg, [
            c[0] || (c[0] = e.createTextVNode(
              "n ",
              -1
              /* CACHED */
            )),
            e.createVNode(l, {
              value: t.value.benford.n
            }, null, 8, ["value"]),
            c[1] || (c[1] = e.createTextVNode(
              " · MAD ",
              -1
              /* CACHED */
            )),
            e.createVNode(l, {
              value: t.value.benford.mad.toFixed(4)
            }, null, 8, ["value"])
          ])
        ]),
        e.createElementVNode("div", kg, [
          e.createElementVNode("table", fg, [
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
                  e.renderList(t.value.benford.observed, (a, N) => (e.openBlock(), e.createElementBlock(
                    "td",
                    {
                      key: N,
                      class: e.normalizeClass(["num", { bad: t.value.benford.spikes.includes(N + 1) }])
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
                  e.renderList(t.value.benford.expected, (a, N) => (e.openBlock(), e.createElementBlock("td", {
                    key: N,
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
      e.createElementVNode("section", hg, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            $g,
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
            ], 8, _g))),
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
          e.createElementVNode("ul", Bg, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(t.value.coverage, (a) => (e.openBlock(), e.createElementBlock("li", {
                key: a.rule
              }, [
                e.createElementVNode(
                  "span",
                  bg,
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
        t.value.hits.length ? (e.openBlock(), e.createElementBlock("div", Dg, [
          e.createElementVNode("table", Cg, [
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
                  wg,
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
                      e.toDisplayString(n.$t(y[a.level])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createVNode(l, {
                        value: a.refs.join(", ")
                      }, null, 8, ["value"])
                    ]),
                    e.createElementVNode("td", Tg, [
                      e.createVNode(l, {
                        cents: a.amount
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode(
                      "td",
                      Lg,
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
          Sg,
          e.toDisplayString(n.$t("没有异常")),
          1
          /* TEXT */
        ))
      ]),
      t.value.plan.length || t.value.summary ? (e.openBlock(), e.createElementBlock("section", Kg, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            Ag,
            e.toDisplayString(n.$t("调查计划（草稿，须批准立项）")),
            1
            /* TEXT */
          ),
          t.value.summaryStatus === "unverified" ? (e.openBlock(), e.createElementBlock(
            "span",
            Fg,
            e.toDisplayString(n.$t("摘要未核实")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode(
          "p",
          Ig,
          e.toDisplayString(t.value.summary),
          1
          /* TEXT */
        ),
        e.createElementVNode("ol", Pg, [
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
                Og,
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
}), Mg = /* @__PURE__ */ ae(zg, [["__scopeId", "data-v-b140dd4d"]]), jg = {
  key: 0,
  class: "fau-audit",
  "data-test": "fau-kyc-panel"
}, Rg = { class: "fau-sec" }, qg = { class: "grow" }, Ug = ["data-disposition"], Wg = { class: "ss-note info" }, Yg = {
  key: 0,
  class: "fau-esc"
}, Gg = {
  class: "fau-sec",
  "data-test": "fau-kyc-record"
}, Hg = { class: "grow" }, Qg = { class: "fau-badge muted" }, Jg = { class: "fau-kv" }, Zg = {
  key: 0,
  class: "fau-quote"
}, Xg = {
  key: 0,
  class: "ss-note warn"
}, xg = {
  key: 1,
  class: "fau-list"
}, ek = { class: "grow" }, tk = {
  class: "fau-sec",
  "data-test": "fau-kyc-rules"
}, lk = { class: "grow" }, nk = { class: "fau-table-wrap" }, ak = { class: "fau-table" }, ok = ["data-test"], sk = { class: "wrap" }, rk = { class: "wrap" }, ik = {
  key: 0,
  class: "fau-table-wrap",
  "data-test": "fau-kyc-hits"
}, ck = { class: "fau-table" }, dk = { class: "num" }, uk = { class: "num" }, mk = /* @__PURE__ */ e.defineComponent({
  __name: "KycPanel",
  props: {
    run: {},
    def: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result), y = { clear: "ok", "request-docs": "warn", "escalate-EDD": "bad", "decline-recommend": "bad" }, r = [
      { key: "legalName", label: s.i18nKey("名称") },
      { key: "dobOrFormation", label: s.i18nKey("出生 / 成立日期") },
      { key: "jurisdiction", label: s.i18nKey("国籍 / 注册地") },
      { key: "address", label: s.i18nKey("地址") },
      { key: "sourceOfFunds", label: s.i18nKey("资金来源") }
    ];
    return (n, c) => t.value ? (e.openBlock(), e.createElementBlock("div", jg, [
      e.createElementVNode("section", Rg, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            qg,
            e.toDisplayString(n.$t("处置建议")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", {
            class: e.normalizeClass(["fau-badge", y[t.value.disposition]]),
            "data-test": "fau-kyc-disposition",
            "data-disposition": t.value.disposition
          }, e.toDisplayString(n.$t(e.unref(ee.KYC_DISPOSITION_LABEL)[t.value.disposition])), 11, Ug),
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
        e.createElementVNode("p", Wg, [
          c[0] || (c[0] = e.createElementVNode(
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
        t.value.missingDocs.length ? (e.openBlock(), e.createElementBlock("ul", Yg, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.missingDocs, (a) => (e.openBlock(), e.createElementBlock("li", { key: a }, [
              c[1] || (c[1] = e.createElementVNode(
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
      e.createElementVNode("section", Gg, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            Hg,
            e.toDisplayString(n.$t("主体档案")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            Qg,
            e.toDisplayString(n.$t(e.unref(ee.APPLICANT_LABEL)[t.value.record.applicantType])),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("dl", Jg, [
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
                    Zg,
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
        t.value.record.dropped.length ? (e.openBlock(), e.createElementBlock("p", Xg, [
          c[2] || (c[2] = e.createElementVNode(
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
        t.value.record.beneficialOwners.length ? (e.openBlock(), e.createElementBlock("ul", xg, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(t.value.record.beneficialOwners, (a, N) => (e.openBlock(), e.createElementBlock("li", { key: N }, [
              e.createElementVNode("span", ek, [
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
              c[3] || (c[3] = e.createTextVNode(
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
      e.createElementVNode("section", tk, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            lk,
            e.toDisplayString(n.$t("规则结论")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", nk, [
          e.createElementVNode("table", ak, [
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
                    sk,
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
                  e.createElementVNode("td", rk, [
                    e.createElementVNode(
                      "bdi",
                      null,
                      e.toDisplayString(a.evidence),
                      1
                      /* TEXT */
                    )
                  ])
                ], 10, ok))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        t.value.hits.length ? (e.openBlock(), e.createElementBlock("div", ik, [
          e.createElementVNode("table", ck, [
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
                  dk,
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
                e.renderList(t.value.hits, (a, N) => (e.openBlock(), e.createElementBlock("tr", {
                  key: N,
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
                  e.createElementVNode("td", uk, [
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
}), pk = {
  icfr: RE,
  "internal-audit": T1,
  "ext-audit": Ov,
  review: Ng,
  fraud: Mg,
  kyc: mk
}, yk = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PANELS: pk
}, Symbol.toStringTag, { value: "Module" })), Le = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/financeAudit/capital/specs.ts"];
if (!Le) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/financeAudit/capital/specs.ts");
Le.default;
const Nk = ["money", "pct", "x", "num", "int", "years", "months", "bp"], fe = (i) => Nk.includes(i);
function be(i, B) {
  if (i == null || i === "") return "-";
  if (typeof i == "object") return X(i);
  if (typeof i != "number") return B === "text" || B === "select" || B === "date" ? i : s.t(i);
  if (!Number.isFinite(i)) return "-";
  const t = (y) => new Intl.NumberFormat(Ce(), y).format(i);
  switch (B) {
    case "pct":
      return new Intl.NumberFormat(Ce(), { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(i);
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
function Pe(i) {
  return X(Le.sourceTag(i));
}
function it(i, B) {
  return i == null ? "" : String(typeof i == "number" && B === "pct" ? Math.round(i * 1e8) / 1e6 : i);
}
function ct(i, B) {
  const t = i.trim();
  if (!t) return null;
  if (!fe(B)) return t;
  const y = Number(t.replace(/[٠-٩]/g, (r) => String("٠١٢٣٤٥٦٧٨٩".indexOf(r))).replace(/[,\s%]/g, "").replace("٫", "."));
  return Number.isFinite(y) ? B === "pct" ? y / 100 : y : null;
}
const Vk = {
  key: 0,
  class: "cap-in",
  "data-test": "cap-input"
}, Ek = { class: "fau-row" }, vk = { class: "grow" }, gk = {
  key: 0,
  class: "fau-badge muted",
  "data-test": "cap-command"
}, kk = { class: "ss-note info" }, fk = {
  key: 0,
  class: "fau-row cap-conn",
  "data-test": "cap-connectors"
}, hk = { class: "ss-muted" }, $k = ["title", "data-test"], _k = {
  key: 1,
  class: "cap-grid"
}, Bk = ["data-test"], bk = { class: "cap-label" }, Sk = { key: 0 }, Dk = { class: "cap-control" }, Ck = ["value", "disabled", "onChange"], wk = { value: "" }, Tk = ["value"], Lk = ["type", "inputmode", "value", "disabled", "onChange"], Kk = {
  key: 2,
  class: "ss-muted"
}, Ak = { class: "cap-src" }, Fk = ["value", "disabled", "aria-label", "onChange"], Ik = ["value"], Pk = ["placeholder", "value", "disabled", "onChange"], Ok = ["data-test"], zk = { class: "fau-row" }, Mk = { class: "grow" }, jk = { class: "ss-muted" }, Rk = ["data-test", "onClick"], qk = ["onClick"], Uk = { class: "ss-muted cap-help" }, Wk = { class: "ss-actions" }, Yk = ["disabled", "data-test"], Gk = ["disabled"], Hk = { class: "fau-table-wrap" }, Qk = { class: "fau-table" }, Jk = { key: 1 }, Zk = ["data-test"], Xk = ["value", "disabled", "onChange"], xk = ["value"], ef = ["type", "value", "disabled", "onChange"], tf = { class: "cap-src" }, lf = {
  key: 0,
  class: "ss-muted"
}, nf = ["value", "disabled", "aria-label", "onChange"], af = ["value"], of = ["placeholder", "value", "disabled", "onChange"], sf = ["title", "onClick"], rf = ["data-test", "onClick"], cf = { class: "ss-actions" }, df = ["disabled"], uf = {
  key: 1,
  class: "ss-muted"
}, mf = {
  key: 2,
  class: "fau-badge ok"
}, pf = {
  key: 2,
  class: "ss-note danger",
  "data-test": "cap-error"
}, yf = /* @__PURE__ */ e.defineComponent({
  __name: "CapitalInputPanel",
  props: {
    run: {},
    def: {},
    editable: { type: Boolean }
  },
  emits: ["changed"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = ye.useRouter(), n = {
      manual: s.i18nKey("手工录入"),
      public: s.i18nKey("公开数据（填链接）"),
      connector: s.i18nKey("来自授权连接器"),
      default: s.i18nKey("模板默认值（未注明来源）"),
      upload: s.i18nKey("上传文件"),
      handoff: s.i18nKey("上游转交")
    }, c = { needs_auth: s.i18nKey("需授权"), added: s.i18nKey("已添加，待授权"), authorized: s.i18nKey("已授权") }, a = e.computed(() => Le.capSpec(t.def.id, t.run.modeId)), N = e.computed(() => t.def.quickActions?.find((j) => j.id === t.run.modeId)?.command || ""), E = e.reactive({}), u = e.reactive({}), L = e.ref([]), k = e.ref(null), g = e.ref(!1), b = e.ref(!1), h = e.ref(!1), K = e.ref("");
    function T() {
      const j = t.run.params.cap || (a.value ? Le.initialInputs(t.def.id, t.run.modeId) : { fields: {}, tables: {} });
      for (const W of Object.keys(E)) delete E[W];
      for (const W of Object.keys(u)) delete u[W];
      for (const [W, U] of Object.entries(j.fields || {})) E[W] = { v: U.v, src: { ...U.src } };
      for (const W of a.value?.tables || []) u[W.id] = (j.tables?.[W.id] || []).map((U) => ({ cells: { ...U.cells }, src: { ...U.src } }));
      g.value = !t.run.params.cap && Object.keys(E).length > 0;
    }
    const z = (j) => E[j]?.src || { kind: "default" }, S = (j) => [...j === "default" ? ["default"] : [], "manual", "public", "connector"];
    function w(j, W) {
      const U = j.unit === "select" ? W || null : ct(W, j.unit);
      U === null ? delete E[j.key] : E[j.key] = { v: U, src: E[j.key] && E[j.key].src.kind !== "default" ? E[j.key].src : { kind: "manual" } }, g.value = !0;
    }
    function m(j, W, U) {
      j.cells[W.key] = W.unit === "select" ? U || null : ct(U, W.unit), (j.src.kind === "upload" || j.src.kind === "default") && (j.src = { kind: "manual" }), g.value = !0;
    }
    function f(j, W) {
      j && (j.src = { kind: W, ...W === "public" && j.src.url ? { url: j.src.url } : {} }, g.value = !0);
    }
    function p(j, W) {
      j && (j.src = { ...j.src, url: W.trim() }, g.value = !0);
    }
    function I(j) {
      (u[j] ||= []).push({ cells: {}, src: { kind: "manual" } }), g.value = !0;
    }
    function _(j, W) {
      u[j]?.splice(W, 1), g.value = !0;
    }
    async function v(j) {
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
      return v(async () => {
        await Y("capital.save", { runId: t.run.id, cap: { fields: E, tables: u } }), g.value = !1, b.value = !0, y("changed");
      });
    }
    function d(j) {
      return v(async () => {
        const W = await Y("capital.pickTable");
        W.paths.length && (k.value = { tableId: j, path: W.paths[0], inspect: null }, await M());
      });
    }
    async function M(j, W) {
      const U = k.value;
      U && await v(async () => {
        U.inspect = await Y("capital.inspectTable", { runId: t.run.id, path: U.path, tableId: U.tableId, mapping: j ?? U.inspect?.mapping, sheet: W ?? U.inspect?.sheetName });
      });
    }
    function V(j) {
      const W = k.value;
      return W?.inspect ? v(async () => {
        g.value && await Y("capital.save", { runId: t.run.id, cap: { fields: E, tables: u } }), await Y("capital.importTable", { runId: t.run.id, path: W.path, tableId: W.tableId, mapping: W.inspect.mapping, sheet: W.inspect.sheetName, append: j }), k.value = null, g.value = !1, y("changed");
      }) : Promise.resolve();
    }
    function te(j) {
      return v(async () => {
        const W = await Y("capital.template", { moduleId: t.def.id, modeId: t.run.modeId, tableId: j });
        await Y("artifact.reveal", { path: W.path });
      });
    }
    return e.watch(() => [t.run.id, t.run.updatedAt], () => {
      g.value || T();
    }), e.onMounted(async () => {
      T();
      try {
        L.value = await Y("capital.connectors", { moduleId: t.def.id });
      } catch {
        L.value = [];
      }
    }), (j, W) => a.value ? (e.openBlock(), e.createElementBlock("section", Vk, [
      e.createElementVNode("header", Ek, [
        e.createElementVNode("strong", vk, [
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
        N.value ? (e.openBlock(), e.createElementBlock("span", gk, [
          e.createTextVNode(
            e.toDisplayString(j.$t("对应命令")) + " ",
            1
            /* TEXT */
          ),
          e.createVNode(l, { value: N.value }, null, 8, ["value"])
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("p", kk, [
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
      L.value.length ? (e.openBlock(), e.createElementBlock("div", fk, [
        e.createElementVNode(
          "span",
          hk,
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
          }, e.toDisplayString(j.$t(U.name)) + " · " + e.toDisplayString(j.$t(c[U.status])), 11, $k))),
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
      a.value.fields.length ? (e.openBlock(), e.createElementBlock("div", _k, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(a.value.fields, (U) => (e.openBlock(), e.createElementBlock("label", {
            key: U.key,
            class: e.normalizeClass(["cap-field", { need: U.required, unsourced: z(U.key).kind === "default" && E[U.key]?.v != null }]),
            "data-test": `cap-f-${U.key}`
          }, [
            e.createElementVNode("span", bk, [
              e.createTextVNode(
                e.toDisplayString(j.$t(U.label)),
                1
                /* TEXT */
              ),
              U.required ? (e.openBlock(), e.createElementBlock("em", Sk, "*")) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("span", Dk, [
              U.unit === "select" ? (e.openBlock(), e.createElementBlock("select", {
                key: 0,
                value: E[U.key]?.v ?? "",
                disabled: !i.editable,
                onChange: (H) => w(U, H.target.value)
              }, [
                e.createElementVNode(
                  "option",
                  wk,
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
                  }, e.toDisplayString(j.$t(H.label)), 9, Tk))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 40, Ck)) : (e.openBlock(), e.createElementBlock("input", {
                key: 1,
                type: U.unit === "date" ? "date" : "text",
                inputmode: e.unref(fe)(U.unit) ? "decimal" : void 0,
                dir: "auto",
                value: e.unref(it)(E[U.key]?.v, U.unit),
                disabled: !i.editable,
                onChange: (H) => w(U, H.target.value)
              }, null, 40, Lk)),
              U.unit === "pct" ? (e.openBlock(), e.createElementBlock("small", Kk, "%")) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("span", Ak, [
              e.createElementVNode("select", {
                value: z(U.key).kind,
                disabled: !i.editable || E[U.key]?.v == null,
                "aria-label": j.$t("来源"),
                onChange: (H) => f(E[U.key], H.target.value)
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(S(z(U.key).kind), (H) => (e.openBlock(), e.createElementBlock("option", {
                    key: H,
                    value: H
                  }, e.toDisplayString(j.$t(n[H])), 9, Ik))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 40, Fk),
              z(U.key).kind === "public" ? (e.openBlock(), e.createElementBlock("input", {
                key: 0,
                type: "url",
                dir: "ltr",
                placeholder: j.$t("公开来源链接（https://…）"),
                value: z(U.key).url || "",
                disabled: !i.editable,
                onChange: (H) => p(E[U.key], H.target.value)
              }, null, 40, Pk)) : e.createCommentVNode("v-if", !0)
            ])
          ], 10, Bk))),
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
          e.createElementVNode("header", zk, [
            e.createElementVNode("strong", Mk, [
              e.createTextVNode(
                e.toDisplayString(j.$t(U.label)) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode("small", jk, [
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
            i.editable ? (e.openBlock(), e.createElementBlock("button", {
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
            ], 8, Rk)) : e.createCommentVNode("v-if", !0),
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
            ], 8, qk)
          ]),
          e.createElementVNode(
            "p",
            Uk,
            e.toDisplayString(j.$t(U.help)),
            1
            /* TEXT */
          ),
          k.value?.tableId === U.id && k.value.inspect ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createVNode(Qe, {
                table: k.value.inspect,
                roles: k.value.inspect.roles.map((H) => ({ ...H, label: j.$t(H.label) })),
                onUpdate: W[1] || (W[1] = (H) => M(H)),
                onSheet: W[2] || (W[2] = (H) => M(void 0, H))
              }, null, 8, ["table", "roles"]),
              e.createElementVNode("div", Wk, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: h.value || k.value.inspect.missing.length > 0,
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
                ], 8, Yk),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: h.value || k.value.inspect.missing.length > 0,
                  onClick: W[4] || (W[4] = (H) => V(!0))
                }, e.toDisplayString(j.$t("追加到现有行")), 9, Gk),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-btn ghost sm",
                    onClick: W[5] || (W[5] = (H) => k.value = null)
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
          e.createElementVNode("div", Hk, [
            e.createElementVNode("table", Qk, [
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
                        H.required ? (e.openBlock(), e.createElementBlock("em", Jk, "*")) : e.createCommentVNode("v-if", !0)
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
                            disabled: !i.editable,
                            onChange: (D) => m(H, ne, D.target.value)
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
                              }, e.toDisplayString(j.$t(D.label)), 9, xk))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ], 40, Xk)) : (e.openBlock(), e.createElementBlock("input", {
                            key: 1,
                            type: ne.unit === "date" ? "date" : "text",
                            dir: "auto",
                            value: e.unref(it)(H.cells[ne.key], ne.unit),
                            disabled: !i.editable,
                            onChange: (D) => m(H, ne, D.target.value)
                          }, null, 40, ef))
                        ],
                        2
                        /* CLASS */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode("td", tf, [
                      H.src.kind === "upload" || H.src.kind === "handoff" ? (e.openBlock(), e.createElementBlock("small", lf, [
                        e.createVNode(l, {
                          value: e.unref(Pe)(H.src)
                        }, null, 8, ["value"])
                      ])) : (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createElementVNode("select", {
                            value: H.src.kind,
                            disabled: !i.editable,
                            "aria-label": j.$t("来源"),
                            onChange: (ne) => f(H, ne.target.value)
                          }, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(S(H.src.kind), (ne) => (e.openBlock(), e.createElementBlock("option", {
                                key: ne,
                                value: ne
                              }, e.toDisplayString(j.$t(n[ne])), 9, af))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ], 40, nf),
                          H.src.kind === "public" ? (e.openBlock(), e.createElementBlock("input", {
                            key: 0,
                            type: "url",
                            dir: "ltr",
                            placeholder: j.$t("公开来源链接（https://…）"),
                            value: H.src.url || "",
                            disabled: !i.editable,
                            onChange: (ne) => p(H, ne.target.value)
                          }, null, 40, of)) : e.createCommentVNode("v-if", !0)
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode("td", null, [
                      i.editable ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-iconbtn",
                        title: j.$t("删除这一行"),
                        onClick: (ne) => _(U.id, ce)
                      }, [...W[13] || (W[13] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-delete-bin-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, sf)) : e.createCommentVNode("v-if", !0)
                    ])
                  ], 8, Zk))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ]),
          i.editable ? (e.openBlock(), e.createElementBlock("button", {
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
          ], 8, rf)) : e.createCommentVNode("v-if", !0)
        ], 8, Ok))),
        128
        /* KEYED_FRAGMENT */
      )),
      e.createElementVNode("div", cf, [
        i.editable ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn primary",
          disabled: h.value || !g.value,
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
        ], 8, df)) : e.createCommentVNode("v-if", !0),
        g.value ? (e.openBlock(), e.createElementBlock(
          "span",
          uf,
          e.toDisplayString(j.$t("有改动还没保存；保存后再开始校验")),
          1
          /* TEXT */
        )) : b.value ? (e.openBlock(), e.createElementBlock(
          "span",
          mf,
          e.toDisplayString(j.$t("已保存")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      K.value ? (e.openBlock(), e.createElementBlock("p", pf, [
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
}), Nf = /* @__PURE__ */ ae(yf, [["__scopeId", "data-v-a39c6cb0"]]), Vf = {
  key: 0,
  class: "cap-res",
  "data-test": "cap-result"
}, Ef = {
  key: 0,
  class: "ss-note warn",
  "data-test": "cap-degraded"
}, vf = {
  key: 1,
  class: "ss-note danger",
  "data-test": "cap-disclaimer"
}, gf = {
  key: 2,
  class: "cap-sec",
  "data-test": "cap-upstream"
}, kf = { class: "fau-badge muted" }, ff = {
  key: 3,
  class: "cap-metrics",
  "data-test": "cap-metrics"
}, hf = ["data-test"], $f = {
  key: 4,
  class: "cap-flags",
  "data-test": "cap-flags"
}, _f = ["data-test"], Bf = ["open", "data-test"], bf = { class: "ss-muted" }, Sf = { class: "fau-table-wrap" }, Df = { class: "fau-table" }, Cf = {
  key: 5,
  class: "cap-sec",
  "data-test": "cap-narrative"
}, wf = ["data-test"], Tf = {
  key: 0,
  class: "fau-badge bad"
}, Lf = {
  key: 1,
  class: "fau-badge warn"
}, Kf = {
  key: 2,
  class: "ss-muted"
}, Af = {
  key: 6,
  class: "cap-sec",
  "data-test": "cap-facts"
}, Ff = { class: "fau-table-wrap" }, If = { class: "fau-table" }, Pf = { class: "wrap" }, Of = {
  key: 0,
  class: "ss-muted"
}, zf = { class: "cap-sec" }, Mf = { class: "fau-table-wrap" }, jf = { class: "fau-table" }, Rf = { class: "num" }, qf = /* @__PURE__ */ e.defineComponent({
  __name: "CapitalResultPanel",
  props: {
    run: {}
  },
  setup(i) {
    const B = i, t = e.computed(() => B.run.result), y = {
      research: s.i18nKey("仅供内部研究，非投资建议"),
      markets: s.i18nKey("仅供分析参考，非投资建议，不构成交易指令"),
      wealth: s.i18nKey("仅供持牌顾问内部使用，非投资建议，不发给客户，不执行交易")
    }, r = (c) => c.page ? s.t("[上传: {p0} 第 {n} 页]", { p0: c.doc, n: c.page }) : Pe({ kind: "upload", file: c.doc }), n = { high: s.i18nKey("高"), medium: s.i18nKey("中"), low: s.i18nKey("低") };
    return (c, a) => t.value ? (e.openBlock(), e.createElementBlock("div", Vf, [
      t.value.degraded.authorized ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Ef, [
        a[0] || (a[0] = e.createElementVNode(
          "i",
          { class: "ri-database-2-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(c.$t("本结果未使用授权数据源，数据完整度：{p0}", { p0: c.$t(n[t.value.degraded.completeness]) })),
          1
          /* TEXT */
        )
      ])),
      t.value.disclaimer ? (e.openBlock(), e.createElementBlock("p", vf, [
        a[1] || (a[1] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(c.$t(y[t.value.disclaimer])),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      t.value.upstream.length ? (e.openBlock(), e.createElementBlock("section", gf, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(c.$t("上游转交的估值引用")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.upstream, (N) => (e.openBlock(), e.createElementBlock("div", {
            key: N.runId,
            class: "fau-row"
          }, [
            e.createElementVNode("span", kf, [
              e.createVNode(l, {
                value: e.unref(Pe)({ kind: "handoff", name: `${N.moduleId}/${N.modeId}` })
              }, null, 8, ["value"])
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(N.metrics.slice(0, 6), (E) => (e.openBlock(), e.createElementBlock("span", {
                key: E.id,
                class: "cap-chip"
              }, [
                e.createTextVNode(
                  e.toDisplayString(c.$t(E.label)) + " ",
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
      t.value.metrics.length ? (e.openBlock(), e.createElementBlock("section", ff, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.metrics, (N) => (e.openBlock(), e.createElementBlock("div", {
            key: N.id,
            class: e.normalizeClass(["cap-metric", N.flag]),
            "data-test": `cap-m-${N.id}`
          }, [
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(c.$t(N.label)),
              1
              /* TEXT */
            ),
            e.createElementVNode("strong", null, [
              e.createVNode(l, {
                value: e.unref(be)(N.value, N.unit)
              }, null, 8, ["value"])
            ])
          ], 10, hf))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      t.value.flags.length ? (e.openBlock(), e.createElementBlock("ul", $f, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.flags, (N) => (e.openBlock(), e.createElementBlock("li", {
            key: N.id,
            class: e.normalizeClass(N.level),
            "data-test": `cap-flag-${N.id}`
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(N.level === "warn" ? "ri-alarm-warning-line" : "ri-information-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(e.unref(X)(N.message)),
              1
              /* TEXT */
            )
          ], 10, _f))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(t.value.tables, (N) => (e.openBlock(), e.createElementBlock("details", {
          key: N.id,
          class: "cap-sec",
          open: t.value.tables.length <= 2,
          "data-test": `cap-table-${N.id}`
        }, [
          e.createElementVNode("summary", null, [
            e.createTextVNode(
              e.toDisplayString(c.$t(N.title)) + " ",
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              bf,
              e.toDisplayString(c.$t("{n} 行", { n: N.rows.length })),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Sf, [
            e.createElementVNode("table", Df, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(N.columns, (E) => (e.openBlock(), e.createElementBlock(
                      "th",
                      {
                        key: E.key,
                        class: e.normalizeClass({ num: e.unref(fe)(E.unit) })
                      },
                      e.toDisplayString(c.$t(E.label)),
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
                  e.renderList(N.rows, (E, u) => (e.openBlock(), e.createElementBlock("tr", { key: u }, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(N.columns, (L) => (e.openBlock(), e.createElementBlock(
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
        ], 8, Bf))),
        128
        /* KEYED_FRAGMENT */
      )),
      t.value.sections?.length ? (e.openBlock(), e.createElementBlock("section", Cf, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(c.$t("叙述与回核")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(t.value.sections, (N, E) => (e.openBlock(), e.createElementBlock("div", {
            key: E,
            class: "cap-narr"
          }, [
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(N.heading),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(N.paragraphs, (u, L) => (e.openBlock(), e.createElementBlock("p", {
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
                  Tf,
                  e.toDisplayString(c.$t("[未注明来源]")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                u.advice ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Lf,
                  e.toDisplayString(c.$t("含买卖或配置建议措辞，签核前须删改")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                u.missing?.length ? (e.openBlock(), e.createElementBlock("small", Kf, [
                  a[2] || (a[2] = e.createElementVNode(
                    "br",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(c.$t("数据里找不到")) + ": ",
                    1
                    /* TEXT */
                  ),
                  e.createVNode(l, {
                    value: u.missing.join(", ")
                  }, null, 8, ["value"])
                ])) : e.createCommentVNode("v-if", !0)
              ], 10, wf))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : e.createCommentVNode("v-if", !0),
      t.value.facts?.length ? (e.openBlock(), e.createElementBlock("section", Af, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(c.$t("事实与出处")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Ff, [
          e.createElementVNode("table", If, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("指标 / 事实")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("数值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("来源")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("原文引文")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.facts, (N, E) => (e.openBlock(), e.createElementBlock("tr", { key: E }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(N.label),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: N.value
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: r(N)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    Pf,
                    e.toDisplayString(N.quote),
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
          Of,
          e.toDisplayString(c.$t("模型给出的 {n} 条事实在原文里定位不到，已丢弃", { n: t.value.droppedFacts })),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("details", zf, [
        e.createElementVNode(
          "summary",
          null,
          e.toDisplayString(c.$t("输入与来源")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Mf, [
          e.createElementVNode("table", jf, [
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.value.inputs.fields, (N) => (e.openBlock(), e.createElementBlock("tr", {
                  key: N.key
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(c.$t(N.label)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Rf, [
                    e.createVNode(l, {
                      value: e.unref(be)(N.value, N.unit)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    {
                      class: e.normalizeClass({ "cap-unsourced": N.src.kind === "default" })
                    },
                    [
                      e.createVNode(l, {
                        value: e.unref(Pe)(N.src)
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
}), Uf = /* @__PURE__ */ ae(qf, [["__scopeId", "data-v-599f6132"]]), Bt = ["valuation", "capex", "ma", "ib", "pe", "research", "markets", "wealth"], Wf = Object.fromEntries(Bt.map((i) => [i, Uf])), Yf = Object.fromEntries(Bt.map((i) => [i, Nf])), Gf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  INPUTS: Yf,
  PANELS: Wf
}, Symbol.toStringTag, { value: "Module" })), Ze = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/releaseHidden.ts"];
if (!Ze) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/releaseHidden.ts");
Ze.default;
const Hf = {
  class: "fau-panel",
  "data-test": "fau-skill-studio"
}, Qf = { class: "ss-muted" }, Jf = { class: "fau-steps-list" }, Zf = { class: "ss-actions" }, Xf = { class: "ss-note info" }, xf = /* @__PURE__ */ e.defineComponent({
  __name: "SkillStudioPanel",
  setup(i) {
    const B = ye.useRouter();
    function t() {
      try {
        localStorage.setItem("tc.autocoder.tab", "skill");
      } catch {
      }
      B.push("/solution-studio");
    }
    return (y, r) => (e.openBlock(), e.createElementBlock("section", Hf, [
      e.createElementVNode("h3", null, [
        r[1] || (r[1] = e.createElementVNode(
          "i",
          { class: "ri-tools-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t("把本企业的制度与模板做成技能")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode(
        "p",
        Qf,
        e.toDisplayString(y.$t("报销制度、审批口径、底稿模板、科目使用说明……写成技能后，对话、专家团和流程里的 AI 员工遇到对应任务就按它来做。")),
        1
        /* TEXT */
      ),
      e.createElementVNode("ol", Jf, [
        e.createElementVNode(
          "li",
          null,
          e.toDisplayString(y.$t("在 AutoCoder 的「Skill 开发」里新建一个技能，把制度原文、模板和示例发给 AI。")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "li",
          null,
          e.toDisplayString(y.$t("AI 按随本方案安装的 fa-skill-creator 的写法整理成技能说明与参考资料；财会口径沿用 fa-conventions、术语沿用 fa-glossary。")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "li",
          null,
          e.toDisplayString(y.$t("检查无误后装到本机；金额仍由工作台规则引擎计算，技能只负责口径与写法。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("div", Zf, [
        e.unref(Ze.RELEASE_HIDDEN).autoCoder ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
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
            e.toDisplayString(y.$t("去新建技能")),
            1
            /* TEXT */
          )
        ])),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn",
          "data-test": "fau-skill-store",
          onClick: r[0] || (r[0] = (n) => e.unref(B).push("/store/skills"))
        }, [
          r[3] || (r[3] = e.createElementVNode(
            "i",
            { class: "ri-apps-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(y.$t("查看已装技能")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("p", Xf, [
        r[4] || (r[4] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t("不想用 AutoCoder 也可以在对话里直接说：「用 fa-skill-creator 把《费用报销制度》做成技能」。")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), eh = /* @__PURE__ */ ae(xf, [["__scopeId", "data-v-1bbd6e4e"]]), th = { "skill-studio": eh }, lh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PANELS: th
}, Symbol.toStringTag, { value: "Module" })), Re = { ok: o.i18nKey("正常"), watch: o.i18nKey("关注"), breach: o.i18nKey("越线") }, nh = { ok: o.i18nKey("三方一致"), watch: o.i18nKey("轻微差异"), breach: o.i18nKey("差异较大") }, Ge = {
  optimistic: o.i18nKey("乐观"),
  base: o.i18nKey("基准"),
  pessimistic: o.i18nKey("悲观")
};
o.i18nKey("确定"), o.i18nKey("预计"), o.i18nKey("可能");
o.i18nKey("资金计划"), o.i18nKey("应收到期"), o.i18nKey("应付到期");
const ah = { none: o.i18nKey("无缺口"), small: o.i18nKey("小额缺口"), large: o.i18nKey("大额缺口"), severe: o.i18nKey("超大额缺口") }, oh = {
  P0: o.i18nKey("立即支付，不可延后（工资社保、税款、到期贷款、判决）"),
  P1: o.i18nKey("优先支付（紧急供应商、租金水电等固定支出）"),
  P2: o.i18nKey("正常支付（按账期的常规付款）"),
  P3: o.i18nKey("可延后 1–2 周"),
  P4: o.i18nKey("战略延后，与对方协商")
}, sh = { schedule: o.i18nKey("排入计划"), defer: o.i18nKey("延后"), hold: o.i18nKey("暂停核实") }, rh = { given: o.i18nKey("表内指定"), category: o.i18nKey("按类别"), default: o.i18nKey("默认") }, ih = {
  proceed: o.i18nKey("建议放行（由有权人审批）"),
  request_docs: o.i18nKey("补充资料"),
  hold: o.i18nKey("暂缓"),
  reject_recommend: o.i18nKey("建议拒绝")
}, ch = { core: o.i18nKey("核心合作银行"), key: o.i18nKey("重点维护银行"), general: o.i18nKey("一般关系银行") };
o.i18nKey("一级优质流动性资产"), o.i18nKey("二级 A 优质流动性资产"), o.i18nKey("二级 B 优质流动性资产"), o.i18nKey("30 天现金流出"), o.i18nKey("30 天现金流入"), o.i18nKey("可用稳定资金"), o.i18nKey("所需稳定资金");
o.i18nKey("外币应收"), o.i18nKey("外币应付"), o.i18nKey("预测外币收入"), o.i18nKey("预测外币支出"), o.i18nKey("外币资产"), o.i18nKey("外币负债"), o.i18nKey("外币计价收入"), o.i18nKey("外币计价成本"), o.i18nKey("已卖出远期"), o.i18nKey("已买入远期");
const dh = { firm: o.i18nKey("确定敞口"), highly_probable: o.i18nKey("很可能敞口"), possible: o.i18nKey("可能敞口") }, uh = { sell: o.i18nKey("卖出外币"), buy: o.i18nKey("买入外币") }, mh = {
  debt_to_ebitda: o.i18nKey("有息负债 / EBITDA"),
  interest_cover: o.i18nKey("利息保障倍数"),
  current_ratio: o.i18nKey("流动比率"),
  debt_ratio: o.i18nKey("资产负债率"),
  dscr: o.i18nKey("偿债覆盖率"),
  net_worth: o.i18nKey("净资产")
}, ph = { le: "≤", ge: "≥" };
o.i18nKey("1 年内"), o.i18nKey("1–2 年"), o.i18nKey("2–3 年"), o.i18nKey("3–5 年"), o.i18nKey("5 年以上");
o.i18nKey("银行贷款"), o.i18nKey("债券"), o.i18nKey("融资租赁"), o.i18nKey("其它");
const yh = {
  dpd90: o.i18nKey("逾期 90 天以上"),
  default_rating: o.i18nKey("评级为违约"),
  impaired: o.i18nKey("已发生信用减值"),
  dpd30: o.i18nKey("逾期 30 天以上"),
  downgrade: o.i18nKey("评级下调 2 级以上"),
  watchlist: o.i18nKey("进入关注名单"),
  ig_to_sub: o.i18nKey("投资级降为投机级")
}, Ae = { 0: o.i18nKey("本期新增"), 1: o.i18nKey("第一阶段"), 2: o.i18nKey("第二阶段"), 3: o.i18nKey("第三阶段") }, Nh = {
  current: o.i18nKey("未到期"),
  d30: o.i18nKey("逾期 1–30 天"),
  d60: o.i18nKey("逾期 31–60 天"),
  d90: o.i18nKey("逾期 61–90 天"),
  d180: o.i18nKey("逾期 91–180 天"),
  d365: o.i18nKey("逾期 181–365 天"),
  d365plus: o.i18nKey("逾期 365 天以上")
}, dt = { active: o.i18nKey("正常周转"), slow: o.i18nKey("呆滞"), obsolete: o.i18nKey("过时") }, Vh = {
  reverse_factoring: o.i18nKey("反向保理（供应商融资）"),
  receivables_factoring: o.i18nKey("应收账款保理"),
  dynamic_discounting: o.i18nKey("动态折扣（提前付款换折扣）"),
  inventory_finance: o.i18nKey("存货融资")
}, Eh = {
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
const Xe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/core"];
if (!Xe) throw new Error("宿主模块未就绪：npm:echarts/core");
Xe.default;
const xe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/renderers"];
if (!xe) throw new Error("宿主模块未就绪：npm:echarts/renderers");
xe.default;
const et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/charts"];
if (!et) throw new Error("宿主模块未就绪：npm:echarts/charts");
et.default;
const $e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/components"];
if (!$e) throw new Error("宿主模块未就绪：npm:echarts/components");
$e.default;
const bt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-echarts"];
if (!bt) throw new Error("宿主模块未就绪：npm:vue-echarts");
const vh = bt.default;
function gh(i) {
  return {
    grid: { top: 36, bottom: 28, containLabel: !0 },
    legend: { data: i.series.map((B) => B.name), top: 0, [i.rtl ? "right" : "left"]: 0, align: i.rtl ? "right" : "left" },
    tooltip: { trigger: "axis", valueFormatter: (B) => i.fmt(B) },
    xAxis: { type: "category", data: i.weeks, inverse: i.rtl, boundaryGap: !1 },
    yAxis: { type: "value", position: i.rtl ? "right" : "left", axisLabel: { formatter: (B) => i.fmt(B) } },
    series: i.series.map((B, t) => ({
      name: B.name,
      type: "line",
      data: B.data,
      smooth: !1,
      symbolSize: 5,
      // 基准情景画 0 线，缺口一眼看出来
      ...t === 1 ? { markLine: { silent: !0, symbol: "none", data: [{ yAxis: 0, name: i.zeroLabel }] } } : {}
    }))
  };
}
const kh = /* @__PURE__ */ e.defineComponent({
  __name: "CashForecastChart",
  props: {
    forecast: {}
  },
  setup(i) {
    Xe.use([xe.CanvasRenderer, et.LineChart, $e.GridComponent, $e.LegendComponent, $e.TooltipComponent, $e.MarkLineComponent]);
    const B = i, t = e.computed(() => gh({
      weeks: B.forecast.scenarios[1].weeks.map((y) => `W${y.week}`),
      series: B.forecast.scenarios.map((y) => ({ name: s.t(Ge[y.id]), data: y.weeks.map((r) => r.closing / 100) })),
      rtl: pe.currentLocale() === "ar",
      fmt: (y) => we(Math.round(y * 100)),
      zeroLabel: "0"
    }));
    return (y, r) => (e.openBlock(), e.createBlock(e.unref(vh), {
      class: "fau-tr-chart",
      option: t.value,
      autoresize: "",
      "data-test": "fau-cash-chart"
    }, null, 8, ["option"]));
  }
}), fh = /* @__PURE__ */ ae(kh, [["__scopeId", "data-v-6127b65d"]]), hh = {
  key: 0,
  class: "fau-tr",
  "data-test": "fau-treasury-panel"
}, $h = {
  key: 0,
  class: "ss-note warn"
}, _h = {
  key: 1,
  class: "ss-note warn"
}, Bh = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-cash-position"
}, bh = { class: "fau-row" }, Sh = { class: "grow" }, Dh = { class: "fau-badge" }, Ch = { class: "fau-table-wrap" }, wh = { class: "fau-table" }, Th = { class: "num" }, Lh = { class: "num" }, Kh = { class: "num" }, Ah = { class: "num" }, Fh = { class: "num" }, Ih = ["data-test"], Ph = { class: "num" }, Oh = { class: "num" }, zh = { class: "num" }, Mh = { class: "num" }, jh = {
  key: 0,
  class: "fau-badge bad"
}, Rh = { class: "num" }, qh = {
  key: 3,
  class: "fau-sec",
  "data-test": "fau-cash-forecast"
}, Uh = { class: "fau-row" }, Wh = { class: "grow" }, Yh = {
  key: 0,
  class: "fau-badge muted"
}, Gh = { class: "fau-table-wrap" }, Hh = { class: "fau-table" }, Qh = { class: "num" }, Jh = { class: "num" }, Zh = { class: "num" }, Xh = { class: "num" }, xh = { class: "num" }, e$ = ["data-test"], t$ = { class: "num" }, l$ = { class: "num" }, n$ = {
  class: "num",
  "data-test": "fau-scenario-end"
}, a$ = { class: "num" }, o$ = { class: "num" }, s$ = {
  key: 0,
  class: "fau-tr-flags"
}, r$ = {
  key: 4,
  class: "fau-sec",
  "data-test": "fau-payment-plan"
}, i$ = { class: "fau-tr-kpis" }, c$ = { class: "fau-badge muted" }, d$ = { class: "fau-badge ok" }, u$ = { class: "fau-badge warn" }, m$ = { class: "fau-badge bad" }, p$ = {
  key: 0,
  class: "fau-badge bad"
}, y$ = { class: "fau-table-wrap" }, N$ = { class: "fau-table" }, V$ = { class: "num" }, E$ = ["data-test"], v$ = { class: "num" }, g$ = ["title"], k$ = { class: "ss-muted" }, f$ = { class: "wrap" }, h$ = {
  key: 5,
  class: "fau-sec",
  "data-test": "fau-auth"
}, $$ = { class: "fau-table-wrap" }, _$ = { class: "fau-table" }, B$ = { class: "num" }, b$ = ["data-test"], S$ = { class: "num" }, D$ = {
  key: 0,
  class: "fau-badge warn"
}, C$ = { class: "wrap" }, w$ = {
  key: 6,
  class: "fau-sec",
  "data-test": "fau-pool"
}, T$ = { class: "fau-tr-kpis" }, L$ = { class: "fau-badge muted" }, K$ = { class: "fau-badge" }, A$ = { class: "fau-badge" }, F$ = { class: "fau-badge ok" }, I$ = {
  class: "fau-badge ok",
  "data-test": "fau-pool-gain"
}, P$ = { class: "fau-table-wrap" }, O$ = { class: "fau-table" }, z$ = { class: "num" }, M$ = { class: "num" }, j$ = { class: "num" }, R$ = { class: "num" }, q$ = { class: "num" }, U$ = { class: "num" }, W$ = {
  key: 7,
  class: "fau-sec",
  "data-test": "fau-banks"
}, Y$ = { class: "fau-table-wrap" }, G$ = { class: "fau-table" }, H$ = { class: "num" }, Q$ = { class: "num" }, J$ = { class: "num" }, Z$ = ["data-test"], X$ = { class: "num" }, x$ = { class: "num" }, e_ = { class: "num" }, t_ = { class: "wrap" }, l_ = {
  key: 8,
  class: "fau-sec",
  "data-test": "fau-lcr"
}, n_ = { class: "fau-tr-kpis" }, a_ = { class: "fau-badge muted" }, o_ = { class: "fau-badge muted" }, s_ = {
  class: "fau-sec",
  "data-test": "fau-fx"
}, r_ = { class: "fau-table-wrap" }, i_ = { class: "fau-table" }, c_ = { class: "num" }, d_ = { class: "num" }, u_ = { class: "num" }, m_ = { class: "num" }, p_ = { class: "num" }, y_ = { class: "num" }, N_ = { class: "num" }, V_ = ["data-test"], E_ = { class: "num" }, v_ = { class: "num" }, g_ = { class: "num" }, k_ = { class: "num" }, f_ = { class: "num" }, h_ = { class: "num" }, $_ = { class: "num" }, __ = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-rfq"
}, B_ = { class: "fau-table-wrap" }, b_ = { class: "fau-table" }, S_ = { class: "num" }, D_ = ["data-test"], C_ = { class: "num" }, w_ = {
  key: 10,
  class: "fau-sec",
  "data-test": "fau-fin-cost"
}, T_ = { class: "fau-tr-kpis" }, L_ = { class: "fau-badge muted" }, K_ = { class: "fau-badge" }, A_ = { class: "fau-badge" }, F_ = {
  class: "fau-badge ok",
  "data-test": "fau-wacc"
}, I_ = ["disabled"], P_ = ["disabled"], O_ = ["disabled"], z_ = ["disabled"], M_ = ["disabled"], j_ = ["disabled"], R_ = { class: "fau-table-wrap" }, q_ = { class: "fau-table" }, U_ = { class: "num" }, W_ = { class: "num" }, Y_ = { class: "num" }, G_ = { class: "num" }, H_ = {
  key: 11,
  class: "fau-sec",
  "data-test": "fau-covenants"
}, Q_ = { class: "fau-table-wrap" }, J_ = { class: "fau-table" }, Z_ = {
  key: 0,
  class: "ss-muted"
}, X_ = ["data-test"], x_ = { class: "ss-muted" }, eB = {
  class: "fau-sec",
  "data-test": "fau-ecl"
}, tB = { class: "fau-tr-kpis" }, lB = { class: "fau-badge muted" }, nB = {
  class: "fau-badge",
  "data-test": "fau-ecl-total"
}, aB = { class: "fau-badge muted" }, oB = {
  key: 0,
  class: "fau-table-wrap"
}, sB = { class: "fau-table" }, rB = { class: "num" }, iB = { class: "num" }, cB = { class: "num" }, dB = { class: "num" }, uB = ["data-test"], mB = { class: "num" }, pB = { class: "num" }, yB = { class: "num" }, NB = { class: "num" }, VB = {
  key: 1,
  class: "fau-table-wrap"
}, EB = { class: "fau-table" }, vB = { class: "num" }, gB = { class: "num" }, kB = { class: "num" }, fB = { class: "num" }, hB = {
  key: 2,
  class: "fau-table-wrap"
}, $B = { class: "fau-table" }, _B = { class: "num" }, BB = { class: "num" }, bB = { class: "num" }, SB = ["data-test"], DB = { class: "num" }, CB = { class: "num" }, wB = { class: "num" }, TB = {
  key: 0,
  class: "fau-sec"
}, LB = { class: "fau-table-wrap" }, KB = { class: "fau-table" }, AB = { class: "num" }, FB = { class: "num" }, IB = { class: "num" }, PB = { class: "wrap" }, OB = { class: "num" }, zB = {
  key: 0,
  class: "fau-sec",
  "data-test": "fau-ccc"
}, MB = { class: "fau-tr-kpis" }, jB = { class: "fau-badge" }, RB = { class: "fau-badge" }, qB = { class: "fau-badge" }, UB = {
  class: "fau-badge ok",
  "data-test": "fau-ccc-value"
}, WB = { class: "fau-badge muted" }, YB = { class: "fau-badge warn" }, GB = {
  key: 1,
  class: "fau-sec",
  "data-test": "fau-inventory"
}, HB = { class: "fau-tr-kpis" }, QB = { class: "fau-badge warn" }, JB = { class: "fau-badge bad" }, ZB = {
  class: "fau-badge ok",
  "data-test": "fau-inv-release"
}, XB = {
  key: 2,
  class: "fau-sec",
  "data-test": "fau-suppliers"
}, xB = { class: "fau-table-wrap" }, eb = { class: "fau-table" }, tb = { class: "num" }, lb = { class: "num" }, nb = { class: "num" }, ab = { class: "num" }, ob = { class: "num" }, sb = { class: "num" }, rb = { class: "num" }, ib = { class: "num" }, cb = {
  key: 3,
  class: "fau-sec",
  "data-test": "fau-scf"
}, db = { class: "fau-table-wrap" }, ub = { class: "fau-table" }, mb = { class: "num" }, pb = { class: "num" }, yb = { class: "num" }, Nb = { class: "num" }, Vb = { class: "num" }, Eb = { class: "num" }, vb = {
  key: 14,
  class: "fau-sec",
  "data-test": "fau-portfolio"
}, gb = { class: "fau-tr-kpis" }, kb = { class: "fau-badge muted" }, fb = { class: "fau-badge muted" }, hb = { class: "fau-table-wrap" }, $b = { class: "fau-table" }, _b = { class: "num" }, Bb = { class: "num" }, bb = { class: "num" }, Sb = { class: "num" }, Db = { class: "wrap" }, Cb = {
  key: 15,
  class: "fau-sec",
  "data-test": "fau-liquidity"
}, wb = { class: "fau-tr-kpis" }, Tb = { class: "fau-badge ok" }, Lb = { class: "fau-badge muted" }, Kb = {
  key: 16,
  class: "fau-sec",
  "data-test": "fau-narrative"
}, Ab = {
  key: 17,
  class: "ss-note danger"
}, Fb = /* @__PURE__ */ e.defineComponent({
  __name: "TreasuryPanel",
  props: {
    run: {},
    def: {}
  },
  emits: ["changed"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = s.listSeparator(), n = e.ref(!1), c = e.ref(""), a = e.computed(() => t.run.result), N = e.computed(() => t.def.id === "cash" ? a.value : null), E = e.computed(() => t.def.id === "treasury" ? a.value : null), u = e.computed(() => t.def.id === "fx" ? a.value : null), L = e.computed(() => t.def.id === "financing" ? a.value : null), k = e.computed(() => t.def.id === "ifrs9" ? a.value : null), g = e.computed(() => t.def.id === "working-capital" ? a.value : null), b = e.computed(() => t.def.id === "investments" ? a.value : null), h = e.computed(() => N.value?.position || E.value?.position || null), K = e.computed(() => N.value?.forecast || E.value?.forecast || null), T = e.computed(() => N.value?.payments || null), z = e.computed(() => a.value?.narrative || []), S = e.computed(() => ["signing", "archived", "void"].includes(t.run.status)), w = { ok: "ok", watch: "warn", breach: "bad" }, m = { proceed: "ok", request_docs: "warn", hold: "bad", reject_recommend: "bad" }, f = (d) => d == null ? "-" : d.toFixed(1), p = (d) => d == null ? "-" : d.toFixed(2), I = (d) => we(d), _ = (d, M) => M == null ? "-" : d === "net_worth" ? we(M) : M.toFixed(2), v = e.reactive({ rf: "", beta: "", erp: "", taxRate: "", equity: "" });
    e.watch(() => L.value?.cost, (d) => {
      if (!d) return;
      const M = (V) => String(Math.round(V * 1e4) / 100);
      Object.assign(v, { rf: M(d.rf), beta: String(d.beta), erp: M(d.erp), taxRate: M(d.taxRate), equity: String(Math.round(d.equity) / 100) });
    }, { immediate: !0 });
    async function R() {
      n.value = !0, c.value = "";
      try {
        await Y("financing.params.update", { runId: t.run.id, ...v }), y("changed");
      } catch (d) {
        c.value = Q.errorMessage(d);
      } finally {
        n.value = !1;
      }
    }
    return (d, M) => a.value ? (e.openBlock(), e.createElementBlock("div", hh, [
      i.def.id === "cash" && i.run.modeId === "payment" || i.def.id === "treasury" && i.run.modeId === "authorization" ? (e.openBlock(), e.createElementBlock("p", $h, [
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
      i.def.id === "fx" ? (e.openBlock(), e.createElementBlock("p", _h, [
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
      h.value ? (e.openBlock(), e.createElementBlock("section", Bh, [
        e.createElementVNode("header", bh, [
          e.createElementVNode("strong", Sh, [
            e.createTextVNode(
              e.toDisplayString(d.$t("资金日报")) + " · ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: h.value.asOf
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("span", Dh, [
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
        e.createElementVNode("div", Ch, [
          e.createElementVNode("table", wh, [
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
                  Th,
                  e.toDisplayString(d.$t("银行余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Lh,
                  e.toDisplayString(d.$t("账面余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Kh,
                  e.toDisplayString(d.$t("资金系统余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ah,
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
                  Fh,
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
                  e.createElementVNode("td", Ph, [
                    e.createVNode(l, {
                      cents: V.bankBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Oh, [
                    e.createVNode(l, {
                      cents: V.bookBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", zh, [
                    e.createVNode(l, {
                      cents: V.systemBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", Mh, [
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
                      e.toDisplayString(V.sources < 2 ? d.$t("来源不足，未核对") : d.$t(e.unref(nh)[V.status])),
                      3
                      /* TEXT, CLASS */
                    ),
                    V.belowSafety ? (e.openBlock(), e.createElementBlock(
                      "span",
                      jh,
                      e.toDisplayString(d.$t("低于安全线")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("td", Rh, [
                    e.createVNode(l, {
                      cents: V.available
                    }, null, 8, ["cents"])
                  ])
                ], 10, Ih))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 13 周预测 "),
      K.value ? (e.openBlock(), e.createElementBlock("section", qh, [
        e.createElementVNode("header", Uh, [
          e.createElementVNode(
            "strong",
            Wh,
            e.toDisplayString(d.$t("13 周现金预测")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["fau-badge", K.value.gapTier === "none" ? "ok" : "warn"])
            },
            e.toDisplayString(d.$t(e.unref(ah)[K.value.gapTier])),
            3
            /* TEXT, CLASS */
          ),
          K.value.facilityAvailable != null ? (e.openBlock(), e.createElementBlock("span", Yh, [
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
        e.createVNode(fh, { forecast: K.value }, null, 8, ["forecast"]),
        e.createElementVNode("div", Gh, [
          e.createElementVNode("table", Hh, [
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
                  Qh,
                  e.toDisplayString(d.$t("合计流入")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Jh,
                  e.toDisplayString(d.$t("合计流出")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Zh,
                  e.toDisplayString(d.$t("期末余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Xh,
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
                  xh,
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
                    e.toDisplayString(d.$t(e.unref(Ge)[V.id])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", t$, [
                    e.createVNode(l, {
                      cents: V.totalIn
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", l$, [
                    e.createVNode(l, {
                      cents: V.totalOut
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", n$, [
                    e.createVNode(l, {
                      cents: V.endBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", a$, [
                    e.createVNode(l, {
                      cents: V.minBalance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: V.firstGapWeek ? `W${V.firstGapWeek}` : "-"
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode("td", o$, [
                    e.createVNode(l, {
                      cents: V.maxGap
                    }, null, 8, ["cents"])
                  ])
                ], 10, e$))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        K.value.concentration.some((V) => V.status !== "ok") ? (e.openBlock(), e.createElementBlock("ul", s$, [
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
                " · " + e.toDisplayString(d.$t(e.unref(Re)[V.status])),
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
      T.value ? (e.openBlock(), e.createElementBlock("section", r$, [
        e.createElementVNode("div", i$, [
          e.createElementVNode("span", c$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("可用资金")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: T.value.available
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", d$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("排入计划")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: T.value.scheduled
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", u$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("延后")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: T.value.deferred
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", m$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("暂停核实")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: T.value.held
            }, null, 8, ["cents"])
          ]),
          T.value.gap ? (e.openBlock(), e.createElementBlock("span", p$, [
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
        e.createElementVNode("div", y$, [
          e.createElementVNode("table", N$, [
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
                  V$,
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
                  e.createElementVNode("td", v$, [
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
                    title: d.$t(e.unref(oh)[V.priority])
                  }, [
                    e.createVNode(l, {
                      value: V.priority
                    }, null, 8, ["value"]),
                    M[8] || (M[8] = e.createTextVNode()),
                    e.createElementVNode(
                      "small",
                      k$,
                      e.toDisplayString(d.$t(e.unref(rh)[V.prioritySource])),
                      1
                      /* TEXT */
                    )
                  ], 8, g$),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.$t(e.unref(sh)[V.plan])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    f$,
                    e.toDisplayString(V.flags.map((te) => e.unref(X)(te)).join(e.unref(r))),
                    1
                    /* TEXT */
                  )
                ], 10, E$))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 授权复核 "),
      E.value?.authorizations ? (e.openBlock(), e.createElementBlock("section", h$, [
        e.createElementVNode("div", $$, [
          e.createElementVNode("table", _$, [
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
                  B$,
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
                  e.createElementVNode("td", S$, [
                    e.createVNode(l, {
                      cents: V.amount
                    }, null, 8, ["cents"]),
                    V.large ? (e.openBlock(), e.createElementBlock(
                      "span",
                      D$,
                      e.toDisplayString(d.$t("大额")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["fau-badge", m[V.advice]])
                      },
                      e.toDisplayString(d.$t(e.unref(ih)[V.advice])),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode(
                    "td",
                    C$,
                    e.toDisplayString(V.checks.filter((te) => !te.ok).map((te) => e.unref(X)(te.message)).join(e.unref(r))),
                    1
                    /* TEXT */
                  )
                ], 10, b$))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 现金池 "),
      E.value?.pool ? (e.openBlock(), e.createElementBlock("section", w$, [
        e.createElementVNode("div", T$, [
          e.createElementVNode("span", L$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("主账户")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              value: E.value.pool.header
            }, null, 8, ["value"])
          ]),
          e.createElementVNode("span", K$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("上划合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: E.value.pool.sweepUp
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", A$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("下拨合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: E.value.pool.sweepDown
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", F$, [
            e.createTextVNode(
              e.toDisplayString(d.$t("归集后可调度资金")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: E.value.pool.pooled
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", I$, [
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
        e.createElementVNode("div", P$, [
          e.createElementVNode("table", O$, [
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
                  z$,
                  e.toDisplayString(d.$t("余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  M$,
                  e.toDisplayString(d.$t("留存目标")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  j$,
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
                  e.createElementVNode("td", R$, [
                    e.createVNode(l, {
                      cents: V.balance
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", q$, [
                    e.createVNode(l, {
                      cents: V.target
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", U$, [
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
      E.value?.banks ? (e.openBlock(), e.createElementBlock("section", W$, [
        e.createElementVNode("div", Y$, [
          e.createElementVNode("table", G$, [
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
                  H$,
                  e.toDisplayString(d.$t("授信使用率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Q$,
                  e.toDisplayString(d.$t("利率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  J$,
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
                  e.createElementVNode("td", X$, [
                    e.createVNode(l, {
                      ratio: V.utilization
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", x$, [
                    e.createVNode(l, {
                      ratio: V.rate
                    }, null, 8, ["ratio"])
                  ]),
                  e.createElementVNode("td", e_, [
                    e.createVNode(l, {
                      value: V.total.toFixed(2)
                    }, null, 8, ["value"])
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.$t(e.unref(ch)[V.tier])),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    t_,
                    e.toDisplayString(V.flags.map((te) => e.unref(X)(te)).join(e.unref(r))),
                    1
                    /* TEXT */
                  )
                ], 8, Z$))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" LCR / NSFR "),
      E.value?.liquidity ? (e.openBlock(), e.createElementBlock("section", l_, [
        e.createElementVNode("div", n_, [
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
          e.createElementVNode("span", a_, [
            e.createTextVNode(
              e.toDisplayString(d.$t("优质流动性资产合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: E.value.liquidity.hqla.total
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", o_, [
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
          e.createElementVNode("section", s_, [
            e.createElementVNode("div", r_, [
              e.createElementVNode("table", i_, [
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
                      c_,
                      e.toDisplayString(d.$t("交易敞口（外币）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      d_,
                      e.toDisplayString(d.$t("会计敞口（外币）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      u_,
                      e.toDisplayString(d.$t("交易敞口（本位币）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      m_,
                      e.toDisplayString(d.$t("已对冲")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      p_,
                      e.toDisplayString(d.$t("目标对冲额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      y_,
                      e.toDisplayString(d.$t("还需对冲")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      N_,
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
                      e.createElementVNode("td", E_, [
                        e.createVNode(l, {
                          cents: V.transaction
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", v_, [
                        e.createVNode(l, {
                          cents: V.translation
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", g_, [
                        e.createVNode(l, {
                          cents: V.transactionLocal
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", k_, [
                        e.createVNode(l, {
                          cents: V.hedged
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", f_, [
                        e.createVNode(l, {
                          cents: V.hedgeTarget
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", h_, [
                        e.createVNode(l, {
                          cents: V.hedgeNeed
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", $_, [
                        e.createVNode(l, {
                          ratio: V.hedgeRatio
                        }, null, 8, ["ratio"])
                      ])
                    ], 10, V_))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ]),
          u.value.rfq.length ? (e.openBlock(), e.createElementBlock("section", __, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(d.$t("询价单草稿")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", B_, [
              e.createElementVNode("table", b_, [
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
                      S_,
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
                        e.toDisplayString(d.$t(e.unref(uh)[V.side])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", C_, [
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
                        e.toDisplayString(d.$t(e.unref(dh)[V.layer])),
                        1
                        /* TEXT */
                      )
                    ], 8, D_))),
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
      L.value?.cost ? (e.openBlock(), e.createElementBlock("section", w_, [
        e.createElementVNode("div", T_, [
          e.createElementVNode("span", L_, [
            e.createTextVNode(
              e.toDisplayString(d.$t("有息负债合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: L.value.cost.debt
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", K_, [
            e.createTextVNode(
              e.toDisplayString(d.$t("税后债务成本")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              ratio: L.value.cost.kdAfterTax
            }, null, 8, ["ratio"])
          ]),
          e.createElementVNode("span", A_, [
            e.createTextVNode(
              e.toDisplayString(d.$t("股权成本")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              ratio: L.value.cost.ke
            }, null, 8, ["ratio"])
          ]),
          e.createElementVNode("span", F_, [
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
                "onUpdate:modelValue": M[0] || (M[0] = (V) => v.rf = V),
                type: "number",
                step: "0.01",
                disabled: S.value,
                "data-test": "fau-param-rf"
              }, null, 8, I_), [
                [e.vModelText, v.rf]
              ])
            ]),
            e.createElementVNode("label", null, [
              M[12] || (M[12] = e.createTextVNode(
                "Beta",
                -1
                /* CACHED */
              )),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": M[1] || (M[1] = (V) => v.beta = V),
                type: "number",
                step: "0.01",
                disabled: S.value,
                "data-test": "fau-param-beta"
              }, null, 8, P_), [
                [e.vModelText, v.beta]
              ])
            ]),
            e.createElementVNode("label", null, [
              e.createTextVNode(
                e.toDisplayString(d.$t("市场风险溢价")) + " (%)",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": M[2] || (M[2] = (V) => v.erp = V),
                type: "number",
                step: "0.01",
                disabled: S.value
              }, null, 8, O_), [
                [e.vModelText, v.erp]
              ])
            ]),
            e.createElementVNode("label", null, [
              e.createTextVNode(
                e.toDisplayString(d.$t("所得税率")) + " (%)",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": M[3] || (M[3] = (V) => v.taxRate = V),
                type: "number",
                step: "0.01",
                disabled: S.value
              }, null, 8, z_), [
                [e.vModelText, v.taxRate]
              ])
            ]),
            e.createElementVNode("label", null, [
              e.createTextVNode(
                e.toDisplayString(d.$t("权益价值")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": M[4] || (M[4] = (V) => v.equity = V),
                type: "number",
                step: "0.01",
                disabled: S.value
              }, null, 8, M_), [
                [e.vModelText, v.equity]
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
            ], 8, j_)
          ],
          32
          /* NEED_HYDRATION */
        ),
        e.createElementVNode("div", R_, [
          e.createElementVNode("table", q_, [
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
                  U_,
                  e.toDisplayString(d.$t("本金余额")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  W_,
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
                  e.createElementVNode("td", Y_, [
                    e.createVNode(l, {
                      cents: V.principal
                    }, null, 8, ["cents"])
                  ]),
                  e.createElementVNode("td", G_, [
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
      L.value?.covenants ? (e.openBlock(), e.createElementBlock("section", H_, [
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
                      Z_,
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
                      x_,
                      e.toDisplayString(d.$t(e.unref(mh)[V.metric])),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", null, [
                    e.createVNode(l, {
                      value: `${e.unref(ph)[V.op]} ${V.metric === "net_worth" ? I(V.limit) : V.limit}`
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
                            value: _(V.metric, te.value)
                          }, null, 8, ["value"]),
                          e.createTextVNode(
                            " · " + e.toDisplayString(d.$t(e.unref(Re)[te.status])),
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
                ], 10, X_))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" ECL "),
      k.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 12 },
        [
          e.createElementVNode("section", eB, [
            e.createElementVNode("div", tB, [
              e.createElementVNode("span", lB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("违约敞口合计")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: k.value.totalEad
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode("span", nB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("预期信用损失合计")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: k.value.totalEcl
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode("span", aB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("前瞻系数")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: k.value.forwardFactor.toFixed(4)
                }, null, 8, ["value"])
              ]),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(k.value.scenarios, (V) => (e.openBlock(), e.createElementBlock("span", {
                  key: V.id,
                  class: "fau-badge muted"
                }, [
                  e.createTextVNode(
                    e.toDisplayString(d.$t(e.unref(Ge)[V.id] || V.name)) + " ",
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
            k.value.stages ? (e.openBlock(), e.createElementBlock("div", oB, [
              e.createElementVNode("table", sB, [
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
                      rB,
                      e.toDisplayString(d.$t("笔数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      iB,
                      e.toDisplayString(d.$t("违约敞口")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      cB,
                      e.toDisplayString(d.$t("加权 ECL")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      dB,
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
                    e.renderList(k.value.stages, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: V.stage,
                      "data-test": `fau-ecl-stage-${V.stage}`
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Ae)[V.stage])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", mB, [
                        e.createVNode(l, {
                          value: V.count
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", pB, [
                        e.createVNode(l, {
                          cents: V.ead
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", yB, [
                        e.createVNode(l, {
                          cents: V.ecl
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", NB, [
                        e.createVNode(l, {
                          ratio: V.coverage
                        }, null, 8, ["ratio"])
                      ])
                    ], 8, uB))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            k.value.migration ? (e.openBlock(), e.createElementBlock("div", VB, [
              e.createElementVNode("table", EB, [
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
                      vB,
                      e.toDisplayString(d.$t("笔数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      gB,
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
                    e.renderList(k.value.migration, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: `${V.from}-${V.to}`
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Ae)[V.from])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Ae)[V.to])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", kB, [
                        e.createVNode(l, {
                          value: V.count
                        }, null, 8, ["value"])
                      ]),
                      e.createElementVNode("td", fB, [
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
            k.value.matrix ? (e.openBlock(), e.createElementBlock("div", hB, [
              e.createElementVNode("table", $B, [
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
                      _B,
                      e.toDisplayString(d.$t("应收余额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      BB,
                      e.toDisplayString(d.$t("损失率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      bB,
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
                    e.renderList(k.value.matrix, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: V.bucket,
                      "data-test": `fau-ecl-bucket-${V.bucket}`
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Nh)[V.bucket])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", DB, [
                        e.createVNode(l, {
                          cents: V.amount
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", CB, [
                        e.createVNode(l, {
                          ratio: V.rate
                        }, null, 8, ["ratio"])
                      ]),
                      e.createElementVNode("td", wB, [
                        e.createVNode(l, {
                          cents: V.ecl
                        }, null, 8, ["cents"])
                      ])
                    ], 8, SB))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          k.value.lines ? (e.openBlock(), e.createElementBlock("details", TB, [
            e.createElementVNode(
              "summary",
              null,
              e.toDisplayString(d.$t("阶段与计量")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", LB, [
              e.createElementVNode("table", KB, [
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
                      AB,
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
                      FB,
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
                    e.renderList(k.value.lines, (V) => (e.openBlock(), e.createElementBlock("tr", {
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
                      e.createElementVNode("td", IB, [
                        e.createVNode(l, {
                          cents: V.ead
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Ae)[V.stage])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        PB,
                        e.toDisplayString(V.reasons.map((te) => d.$t(e.unref(yh)[te] || te)).join(e.unref(r))),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", OB, [
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
      g.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 13 },
        [
          g.value.ccc ? (e.openBlock(), e.createElementBlock("section", zB, [
            e.createElementVNode("div", MB, [
              e.createElementVNode("span", jB, [
                M[15] || (M[15] = e.createTextVNode(
                  "DSO ",
                  -1
                  /* CACHED */
                )),
                e.createVNode(l, {
                  value: f(g.value.ccc.dso)
                }, null, 8, ["value"])
              ]),
              e.createElementVNode("span", RB, [
                M[16] || (M[16] = e.createTextVNode(
                  "DIO ",
                  -1
                  /* CACHED */
                )),
                e.createVNode(l, {
                  value: f(g.value.ccc.dio)
                }, null, 8, ["value"])
              ]),
              e.createElementVNode("span", qB, [
                M[17] || (M[17] = e.createTextVNode(
                  "DPO ",
                  -1
                  /* CACHED */
                )),
                e.createVNode(l, {
                  value: f(g.value.ccc.dpo)
                }, null, 8, ["value"])
              ]),
              e.createElementVNode("span", UB, [
                M[18] || (M[18] = e.createTextVNode(
                  "CCC ",
                  -1
                  /* CACHED */
                )),
                e.createVNode(l, {
                  value: f(g.value.ccc.ccc)
                }, null, 8, ["value"])
              ]),
              e.createElementVNode("span", WB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("应收每缩短 1 天释放")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: g.value.ccc.perDay.dso
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode("span", YB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("逾期应收")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: g.value.ccc.overdueAr
                }, null, 8, ["cents"])
              ])
            ])
          ])) : e.createCommentVNode("v-if", !0),
          g.value.inventory ? (e.openBlock(), e.createElementBlock("section", GB, [
            e.createElementVNode("div", HB, [
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
                    value: g.value.inventory.byClass[V].count
                  }, null, 8, ["value"]),
                  M[20] || (M[20] = e.createTextVNode(
                    " · ",
                    -1
                    /* CACHED */
                  )),
                  e.createVNode(l, {
                    cents: g.value.inventory.byClass[V].amount
                  }, null, 8, ["cents"])
                ])),
                64
                /* STABLE_FRAGMENT */
              )),
              e.createElementVNode("span", QB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t(e.unref(dt).slow)) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: g.value.inventory.slow
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode("span", JB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t(e.unref(dt).obsolete)) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: g.value.inventory.obsolete
                }, null, 8, ["cents"])
              ]),
              e.createElementVNode("span", ZB, [
                e.createTextVNode(
                  e.toDisplayString(d.$t("可释放资金占用")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  cents: g.value.inventory.release
                }, null, 8, ["cents"])
              ])
            ])
          ])) : e.createCommentVNode("v-if", !0),
          g.value.suppliers ? (e.openBlock(), e.createElementBlock("section", XB, [
            e.createElementVNode("div", xB, [
              e.createElementVNode("table", eb, [
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
                      tb,
                      e.toDisplayString(d.$t("未清金额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      lb,
                      e.toDisplayString(d.$t("占比")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      nb,
                      e.toDisplayString(d.$t("平均账期（天）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      ab,
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
                    e.renderList(g.value.suppliers, (V) => (e.openBlock(), e.createElementBlock(
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
                        e.createElementVNode("td", ob, [
                          e.createVNode(l, {
                            cents: V.open
                          }, null, 8, ["cents"])
                        ]),
                        e.createElementVNode("td", sb, [
                          e.createVNode(l, {
                            ratio: V.share
                          }, null, 8, ["ratio"])
                        ]),
                        e.createElementVNode("td", rb, [
                          e.createVNode(l, {
                            value: f(V.avgTermDays)
                          }, null, 8, ["value"])
                        ]),
                        e.createElementVNode("td", ib, [
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
          g.value.scf ? (e.openBlock(), e.createElementBlock("section", cb, [
            e.createElementVNode("div", db, [
              e.createElementVNode("table", ub, [
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
                      mb,
                      e.toDisplayString(d.$t("基数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      pb,
                      e.toDisplayString(d.$t("现金效应")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      yb,
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
                    e.renderList(g.value.scf, (V) => (e.openBlock(), e.createElementBlock("tr", {
                      key: V.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d.$t(e.unref(Vh)[V.id])),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", Nb, [
                        e.createVNode(l, {
                          cents: V.base
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", Vb, [
                        e.createVNode(l, {
                          cents: V.cashEffect
                        }, null, 8, ["cents"])
                      ]),
                      e.createElementVNode("td", Eb, [
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
      b.value?.portfolio ? (e.openBlock(), e.createElementBlock("section", vb, [
        e.createElementVNode("div", gb, [
          e.createElementVNode("span", kb, [
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
          e.createElementVNode("span", fb, [
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
        e.createElementVNode("div", hb, [
          e.createElementVNode("table", $b, [
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
                  _b,
                  e.toDisplayString(d.$t("市值")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Bb,
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
                      e.toDisplayString(d.$t(e.unref(Eh)[V.type])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", bb, [
                      e.createVNode(l, {
                        cents: V.marketValue
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode("td", Sb, [
                      e.createVNode(l, {
                        cents: V.pnl
                      }, null, 8, ["cents"])
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(d.$t(e.unref(Re)[V.status])),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Db,
                      e.toDisplayString(V.flags.map((te) => e.unref(X)(te)).join(e.unref(r))),
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
      b.value?.liquidity ? (e.openBlock(), e.createElementBlock("section", Cb, [
        e.createElementVNode("div", wb, [
          e.createElementVNode("span", Tb, [
            e.createTextVNode(
              e.toDisplayString(d.$t("可用流动性合计")) + " ",
              1
              /* TEXT */
            ),
            e.createVNode(l, {
              cents: b.value.liquidity.available
            }, null, 8, ["cents"])
          ]),
          e.createElementVNode("span", Lb, [
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
                value: p(b.value.liquidity.currentRatio)
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
                value: p(b.value.liquidity.quickRatio)
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
                value: p(b.value.liquidity.coverage)
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
      z.value.length ? (e.openBlock(), e.createElementBlock("section", Kb, [
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
      c.value ? (e.openBlock(), e.createElementBlock("p", Ab, [
        M[21] || (M[21] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(c.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0)
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Ib = /* @__PURE__ */ ae(Fb, [["__scopeId", "data-v-29cacb21"]]), Pb = Object.fromEntries(
  ["cash", "treasury", "fx", "financing", "ifrs9", "working-capital", "investments"].map((i) => [i, Ib])
), Ob = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PANELS: Pb
}, Symbol.toStringTag, { value: "Module" })), St = /* @__PURE__ */ Object.assign({ "./accounting/panels.ts": OV, "./audit/panels.ts": yk, "./capital/panels.ts": Gf, "./platform/panels.ts": lh, "./treasury/panels.ts": Ob }), Fe = Object.assign({}, ...Object.values(St).map((i) => i.PANELS || {})), ut = Object.assign({}, ...Object.values(St).map((i) => i.INPUTS || {})), zb = {
  class: "fau-audit ss-module",
  "data-test": "fau-qc-panel"
}, Mb = { class: "fau-steps" }, jb = { class: "ss-actions" }, Rb = ["disabled"], qb = ["disabled"], Ub = {
  key: 0,
  class: "ss-note info",
  "data-test": "fau-qc-file"
}, Wb = {
  key: 0,
  class: "ss-muted"
}, Yb = { class: "fau-row" }, Gb = { class: "ss-muted" }, Hb = { class: "fau-seg" }, Qb = ["data-test", "onClick"], Jb = {
  key: 0,
  class: "fau-row"
}, Zb = { class: "fau-row" }, Xb = { class: "ss-muted" }, xb = ["value"], eS = {
  key: 0,
  class: "fau-row"
}, tS = { class: "ss-muted" }, lS = {
  key: 2,
  class: "ss-muted"
}, nS = {
  key: 3,
  class: "ss-actions"
}, aS = { class: "ss-actions" }, oS = ["disabled"], sS = { class: "fau-counts" }, rS = ["data-test"], iS = { class: "fau-table-wrap" }, cS = { class: "fau-table" }, dS = ["data-test"], uS = { class: "wrap" }, mS = {
  key: 1,
  class: "ss-muted"
}, pS = {
  key: 0,
  class: "ss-muted"
}, yS = ["onUpdate:modelValue", "placeholder", "data-test"], NS = ["onUpdate:modelValue", "placeholder", "data-test"], VS = ["onClick"], ES = { class: "ss-actions" }, vS = ["disabled"], gS = { class: "fau-table-wrap" }, kS = { class: "fau-table" }, fS = ["data-test"], hS = {
  key: 0,
  class: "fau-esc"
}, $S = { class: "ss-actions" }, _S = ["disabled"], BS = {
  key: 1,
  class: "ss-note ok",
  "data-test": "fau-qc-refreshed"
}, bS = {
  key: 0,
  class: "ss-note danger",
  "data-test": "fau-qc-error"
}, SS = /* @__PURE__ */ e.defineComponent({
  __name: "OfficeQcPanel",
  props: {
    home: {}
  },
  setup(i) {
    const B = i, t = Q.useSteps([
      { key: "qc-pick", title: s.t("选择文件"), hint: s.t("Excel 底稿 / 模型，或演示文稿；只读检查，不改原文件") },
      { key: "qc-scope", title: s.t("质检范围"), hint: s.t("选区、单表或整个模型（含资产负债平衡与隐藏表检查）") },
      { key: "qc-run", title: s.t("质检"), hint: s.t("按表格与模型审计、演示文稿质检的规则逐项检查") },
      { key: "qc-report", title: s.t("查看报告"), hint: s.t("按严重、重要、次要列出问题，另存一份质检报告") },
      { key: "qc-refresh", title: s.t("用新数字刷新"), hint: s.t("演示文稿：按旧值 → 新值找出所有写法，先出计划，确认后另存新文件") }
    ]), y = ["selection", "sheet", "model"], r = { selection: s.i18nKey("选区"), sheet: s.i18nKey("单表"), model: s.i18nKey("整个模型") }, n = ["critical", "important", "minor"], c = e.ref(!1), a = e.ref(""), N = e.ref(""), E = e.ref(null), u = e.ref("model"), L = e.ref(""), k = e.ref(""), g = e.ref(B.home.company?.outputLocale || "zh-CN"), b = e.ref(null), h = e.reactive([{ from: "", to: "" }]), K = e.ref(null), T = e.ref("");
    async function z(p) {
      a.value = "";
      try {
        const I = await Y("office-output.pick", { kind: p });
        if (!I.paths.length) return;
        t.start("qc-pick"), N.value = I.paths[0], E.value = await Y("office-output.inspect", { path: N.value }), L.value = E.value?.sheets?.[0] || "", b.value = null, K.value = null, T.value = "", t.resetAfter("qc-pick"), t.done("qc-pick", E.value?.file);
      } catch (I) {
        t.fail("qc-pick", I), a.value = Q.errorMessage(I);
      }
    }
    async function S() {
      c.value = !0, a.value = "", t.start("qc-run");
      try {
        b.value = await Y("office-output.check", { path: N.value, scope: u.value, sheet: L.value, range: k.value, locale: g.value }), t.done("qc-run", s.t("问题 {n} 处", { n: b.value.findings.length })), t.done("qc-report");
      } catch (p) {
        t.fail("qc-run", p), a.value = Q.errorMessage(p);
      } finally {
        c.value = !1;
      }
    }
    async function w() {
      if (b.value) try {
        await Y("artifact.open", { path: b.value.reportPath });
      } catch (p) {
        a.value = Q.errorMessage(p);
      }
    }
    async function m() {
      c.value = !0, a.value = "", T.value = "", t.start("qc-refresh");
      try {
        K.value = await Y("office-output.refreshPlan", { path: N.value, mapping: h.map((p) => ({ ...p })) }), t.set("qc-refresh", { state: "todo", summary: s.t("计划替换 {n} 处，待确认", { n: K.value?.changes.length || 0 }) });
      } catch (p) {
        t.fail("qc-refresh", p), a.value = Q.errorMessage(p);
      } finally {
        c.value = !1;
      }
    }
    async function f() {
      c.value = !0, a.value = "", t.start("qc-refresh");
      try {
        const p = await Y("office-output.refreshApply", { path: N.value, mapping: h.map((I) => ({ ...I })), confirmed: !0, locale: g.value });
        T.value = p.path, t.done("qc-refresh", s.t("已替换 {n} 处", { n: p.changes }));
      } catch (p) {
        t.fail("qc-refresh", p), a.value = Q.errorMessage(p);
      } finally {
        c.value = !1;
      }
    }
    return (p, I) => (e.openBlock(), e.createElementBlock("div", zb, [
      e.createVNode(He, {
        title: p.$t("办公产出与质检"),
        metas: e.unref(t).metas,
        runtime: e.unref(t).runtime,
        "current-key": e.unref(t).currentKey.value,
        onJump: e.unref(Q.scrollToStep)
      }, null, 8, ["title", "metas", "runtime", "current-key", "onJump"]),
      e.createElementVNode("div", Mb, [
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
            e.createElementVNode("div", jb, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: c.value,
                "data-test": "fau-qc-pick-xlsx",
                onClick: I[0] || (I[0] = (_) => z("xlsx"))
              }, [
                I[7] || (I[7] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(p.$t("选择 Excel 底稿或模型")),
                  1
                  /* TEXT */
                )
              ], 8, Rb),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: c.value,
                "data-test": "fau-qc-pick-pptx",
                onClick: I[1] || (I[1] = (_) => z("pptx"))
              }, [
                I[8] || (I[8] = e.createElementVNode(
                  "i",
                  { class: "ri-slideshow-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(p.$t("选择演示文稿")),
                  1
                  /* TEXT */
                )
              ], 8, qb)
            ]),
            E.value ? (e.openBlock(), e.createElementBlock("p", Ub, [
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
                    e.toDisplayString(p.$t("{n} 张工作表", { n: E.value.sheets?.length || 0 })),
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
                    e.toDisplayString(p.$t("{n} 页", { n: E.value.slides || 0 })),
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
                e.createElementVNode("div", Yb, [
                  e.createElementVNode(
                    "span",
                    Gb,
                    e.toDisplayString(p.$t("范围")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("span", Hb, [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(y, (_) => e.createElementVNode("button", {
                        key: _,
                        type: "button",
                        class: e.normalizeClass({ on: u.value === _ }),
                        "data-test": `fau-qc-scope-${_}`,
                        onClick: (v) => u.value = _
                      }, e.toDisplayString(p.$t(r[_])), 11, Qb)),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ])
                ]),
                u.value !== "model" ? (e.openBlock(), e.createElementBlock("div", Jb, [
                  e.createElementVNode("label", Zb, [
                    e.createElementVNode(
                      "span",
                      Xb,
                      e.toDisplayString(p.$t("工作表")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": I[2] || (I[2] = (_) => L.value = _)
                      },
                      [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(E.value.sheets || [], (_) => (e.openBlock(), e.createElementBlock("option", {
                            key: _,
                            value: _
                          }, e.toDisplayString(_), 9, xb))),
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
                  u.value === "selection" ? (e.openBlock(), e.createElementBlock("label", eS, [
                    e.createElementVNode(
                      "span",
                      tS,
                      e.toDisplayString(p.$t("区域")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": I[3] || (I[3] = (_) => k.value = _),
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
                        k.value,
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
              lS,
              e.toDisplayString(p.$t("演示文稿检查全部页：跨页数字一致性、单位与日期写法、措辞与占位符、数据来源")),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Wb,
              e.toDisplayString(p.$t("先完成第 1 步")),
              1
              /* TEXT */
            )),
            E.value ? (e.openBlock(), e.createElementBlock("div", nS, [
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn primary",
                  "data-test": "fau-qc-scope-next",
                  onClick: I[4] || (I[4] = (_) => e.unref(t).done("qc-scope"))
                },
                e.toDisplayString(p.$t("下一步")),
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
            e.createElementVNode("div", aS, [
              e.createVNode(Oe, {
                modelValue: g.value,
                "onUpdate:modelValue": I[5] || (I[5] = (_) => g.value = _)
              }, null, 8, ["modelValue"]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: c.value || !E.value || e.unref(t).runtime["qc-scope"].state !== "done",
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
                  e.toDisplayString(p.$t("开始质检")),
                  1
                  /* TEXT */
                )
              ], 8, oS)
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
                e.createElementVNode("div", sS, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(n, (_) => e.createElementVNode("span", {
                      key: _,
                      class: e.normalizeClass(["fau-badge", _ === "critical" ? "bad" : _ === "important" ? "warn" : "muted"]),
                      "data-test": `fau-qc-count-${_}`
                    }, [
                      e.createTextVNode(
                        e.toDisplayString(p.$t(e.unref(ee.QC_SEVERITY_LABEL)[_])) + " ",
                        1
                        /* TEXT */
                      ),
                      e.createVNode(l, {
                        value: b.value.counts[_]
                      }, null, 8, ["value"])
                    ], 10, rS)),
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
                      e.toDisplayString(p.$t("打开质检报告")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("div", iS, [
                  e.createElementVNode("table", cS, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(p.$t("位置")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(p.$t("规则")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(p.$t("严重程度")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(p.$t("说明")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(b.value.findings, (_) => (e.openBlock(), e.createElementBlock("tr", {
                          key: _.id,
                          class: e.normalizeClass({ bad: _.severity === "critical" }),
                          "data-test": `fau-qc-finding-${_.rule}`
                        }, [
                          e.createElementVNode("td", null, [
                            e.createVNode(l, {
                              value: _.location
                            }, null, 8, ["value"])
                          ]),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(p.$t(e.unref(ee.XLS_RULE_LABEL)[_.rule] || e.unref(ee.DECK_RULE_LABEL)[_.rule] || _.rule)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(p.$t(e.unref(ee.QC_SEVERITY_LABEL)[_.severity])),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", uS, [
                            e.createElementVNode(
                              "bdi",
                              null,
                              e.toDisplayString(_.detail),
                              1
                              /* TEXT */
                            )
                          ])
                        ], 10, dS))),
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
              mS,
              e.toDisplayString(p.$t("质检完成后在这里看结果")),
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
              pS,
              e.toDisplayString(p.$t("只对演示文稿可用")),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(h, (_, v) => (e.openBlock(), e.createElementBlock("div", {
                    key: v,
                    class: "fau-row"
                  }, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (R) => _.from = R,
                      type: "text",
                      dir: "ltr",
                      placeholder: p.$t("旧值，如 $485M"),
                      "data-test": `fau-qc-from-${v}`
                    }, null, 8, yS), [
                      [
                        e.vModelText,
                        _.from,
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
                      "onUpdate:modelValue": (R) => _.to = R,
                      type: "text",
                      dir: "ltr",
                      placeholder: p.$t("新值，如 $512M"),
                      "data-test": `fau-qc-to-${v}`
                    }, null, 8, NS), [
                      [
                        e.vModelText,
                        _.to,
                        void 0,
                        { trim: !0 }
                      ]
                    ]),
                    h.length > 1 ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: (R) => h.splice(v, 1)
                    }, e.toDisplayString(p.$t("删除")), 9, VS)) : e.createCommentVNode("v-if", !0)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                e.createElementVNode("div", ES, [
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-btn sm ghost",
                      onClick: I[6] || (I[6] = (_) => h.push({ from: "", to: "" }))
                    },
                    e.toDisplayString(p.$t("再加一组")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: c.value,
                    "data-test": "fau-qc-plan",
                    onClick: m
                  }, e.toDisplayString(p.$t("生成刷新计划")), 9, vS)
                ]),
                K.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode("div", gS, [
                      e.createElementVNode("table", kS, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(p.$t("页")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(p.$t("原文")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(p.$t("改成")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(K.value.changes, (_, v) => (e.openBlock(), e.createElementBlock("tr", {
                              key: v,
                              "data-test": `fau-qc-change-${v}`
                            }, [
                              e.createElementVNode("td", null, [
                                e.createVNode(l, {
                                  value: _.slide
                                }, null, 8, ["value"])
                              ]),
                              e.createElementVNode("td", null, [
                                e.createVNode(l, {
                                  value: _.before
                                }, null, 8, ["value"])
                              ]),
                              e.createElementVNode("td", null, [
                                e.createVNode(l, {
                                  value: _.after
                                }, null, 8, ["value"])
                              ])
                            ], 8, fS))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ])
                    ]),
                    K.value.flagged.length ? (e.openBlock(), e.createElementBlock("ul", hS, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(K.value.flagged, (_, v) => (e.openBlock(), e.createElementBlock("li", { key: v }, [
                          I[13] || (I[13] = e.createElementVNode(
                            "i",
                            { class: "ri-error-warning-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(p.$t("第 {n} 页可能是派生数字，未改：", { n: _.slide })),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "bdi",
                            null,
                            e.toDisplayString(_.text),
                            1
                            /* TEXT */
                          )
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode("div", $S, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn primary",
                        disabled: c.value || !K.value.changes.length,
                        "data-test": "fau-qc-apply",
                        onClick: f
                      }, e.toDisplayString(p.$t("确认刷新（另存新文件，原文件不动）")), 9, _S)
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0),
                T.value ? (e.openBlock(), e.createElementBlock("p", BS, [
                  I[14] || (I[14] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(p.$t("已另存：{p0}", { p0: T.value })),
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
      a.value ? (e.openBlock(), e.createElementBlock("p", bS, [
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
}), DS = [
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
], CS = {
  sources: DS
};
o.i18nKey("ERP 与总账"), o.i18nKey("BI 与报表"), o.i18nKey("业务执行与资金"), o.i18nKey("文档与计划"), o.i18nKey("人力与税务"), o.i18nKey("ESG 与投资者关系"), o.i18nKey("市场与研究数据"), o.i18nKey("企业自有服务"), o.i18nKey("接入参考");
o.i18nKey("可用"), o.i18nKey("需授权"), o.i18nKey("规划中");
o.i18nKey("用友 NC / U8 / Cloud"), o.i18nKey("金蝶 K3 / Cloud"), o.i18nKey("畅捷通 T+"), o.i18nKey("帆软 FineReport"), o.i18nKey("万得 Wind");
const wS = {
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
CS.sources.map((i) => ({ ...i, fallback: wS[i.layer] }));
const Ie = [
  { id: "kingdee_cloud", name: o.i18nKey("金蝶云星空"), erp: "kingdee", capped: !0 },
  { id: "yonyou_u8", name: o.i18nKey("用友 U8"), erp: "yonyou", capped: !0 },
  { id: "changjietong", name: o.i18nKey("畅捷通 T+"), erp: "chanjet", capped: !1 },
  { id: "jdy", name: o.i18nKey("精斗云"), erp: "kingdee", capped: !1 }
], TS = ["journal", "tb", "subledger", "ar", "ap", "po", "grn", "invoice", "fa_register", "payroll", "budget"], LS = 5e3, KS = {
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
}, AS = ["data-test"], FS = ["data-test"], IS = { class: "fau-row" }, PS = { class: "grow" }, OS = {
  key: 0,
  class: "ss-muted"
}, zS = {
  key: 1,
  class: "ss-note warn",
  "data-test": "fau-erp-unavailable"
}, MS = { class: "ss-grid" }, jS = { class: "ss-field" }, RS = ["value"], qS = { class: "ss-field" }, US = { class: "ss-field" }, WS = { class: "ss-muted" }, YS = { class: "ss-muted" }, GS = { class: "ss-actions" }, HS = ["disabled"], QS = {
  key: 3,
  class: "ss-note danger",
  "data-test": "fau-erp-error"
}, JS = /* @__PURE__ */ e.defineComponent({
  __name: "ErpPull",
  props: {
    kind: {}
  },
  emits: ["picked"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = e.ref(!1), n = e.ref(!1), c = e.ref(""), a = e.ref(null), N = e.ref(Ie[0].id), E = e.ref(""), u = e.ref("{}"), L = (h) => !!a.value?.providers.find((K) => K.id === h)?.configured;
    function k() {
      const h = KS[N.value]?.[t.kind];
      E.value = h?.docType || "", u.value = JSON.stringify(h?.filters || {}, null, 2);
    }
    async function g() {
      r.value = !0, c.value = "";
      try {
        a.value = await Y("erp.status");
        const h = a.value.defaultProvider && Ie.some((K) => K.id === a.value.defaultProvider) ? a.value.defaultProvider : Ie.find((K) => L(K.id))?.id;
        h && (N.value = h), k();
      } catch (h) {
        c.value = Q.errorMessage(h);
      }
    }
    async function b() {
      n.value = !0, c.value = "";
      try {
        const h = await Y("erp.pull", { provider: N.value, docType: E.value, filters: u.value });
        y("picked", [h.path]), r.value = !1;
      } catch (h) {
        c.value = Q.errorMessage(h);
      } finally {
        n.value = !1;
      }
    }
    return (h, K) => e.unref(TS).includes(i.kind) ? (e.openBlock(), e.createElementBlock("div", {
      key: 0,
      class: "fau-erp",
      "data-test": `fau-erp-${i.kind}`
    }, [
      r.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("header", IS, [
            e.createElementVNode("strong", PS, [
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
          a.value ? !a.value.available || !a.value.enabled ? (e.openBlock(), e.createElementBlock("p", zS, [
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
              e.createElementVNode("div", MS, [
                e.createElementVNode("label", jS, [
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
                      "onUpdate:modelValue": K[1] || (K[1] = (T) => N.value = T),
                      "data-test": "fau-erp-provider",
                      onChange: k
                    },
                    [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(Ie), (T) => (e.openBlock(), e.createElementBlock("option", {
                          key: T.id,
                          value: T.id
                        }, e.toDisplayString(h.$t(T.name)) + e.toDisplayString(L(T.id) ? "" : ` · ${h.$t("未配置")}`), 9, RS))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ],
                    544
                    /* NEED_HYDRATION, NEED_PATCH */
                  ), [
                    [e.vModelSelect, N.value]
                  ])
                ]),
                e.createElementVNode("label", qS, [
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
              e.createElementVNode("label", US, [
                e.createElementVNode("span", null, [
                  e.createTextVNode(
                    e.toDisplayString(h.$t("查询条件（JSON）")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("small", WS, [
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
                YS,
                e.toDisplayString(h.$t("只调用只读查询；单次最多 {n} 行，被截断就判失败、不导入部分数据。取回后照上传文件同一步识别列、确认后导入。", { n: e.unref(LS) })),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", GS, [
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
                ], 8, HS)
              ])
            ],
            64
            /* STABLE_FRAGMENT */
          )) : (e.openBlock(), e.createElementBlock(
            "p",
            OS,
            e.toDisplayString(h.$t("正在读取 ERP 状态…")),
            1
            /* TEXT */
          )),
          c.value ? (e.openBlock(), e.createElementBlock("p", QS, [
            K[10] || (K[10] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(c.value),
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
        "data-test": `fau-erp-open-${i.kind}`,
        onClick: g
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
      ], 8, FS))
    ], 8, AS)) : e.createCommentVNode("v-if", !0);
  }
}), ZS = /* @__PURE__ */ ae(JS, [["__scopeId", "data-v-6f7e69cc"]]), tt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/financeAudit/auditTables.ts"];
if (!tt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/financeAudit/auditTables.ts");
tt.default;
const XS = ["data-test"], xS = { class: "fau-panel fau-mhead" }, e8 = { class: "fau-row" }, t8 = { class: "fau-code" }, l8 = { class: "grow" }, n8 = { class: "fau-badge muted" }, a8 = { class: "ss-muted" }, o8 = { class: "fau-kv" }, s8 = ["value"], r8 = { value: "" }, i8 = ["value"], c8 = {
  key: 2,
  class: "fau-panel",
  "data-test": "fau-not-runnable"
}, d8 = {
  key: 0,
  class: "ss-note warn"
}, u8 = {
  key: 1,
  class: "ss-note info"
}, m8 = { class: "ss-actions" }, p8 = {
  key: 4,
  class: "fau-steps"
}, y8 = {
  key: 0,
  class: "ss-note warn"
}, N8 = { class: "fau-row" }, V8 = { class: "ss-muted" }, E8 = { class: "fau-seg" }, v8 = ["disabled", "data-test", "onClick"], g8 = { class: "fau-row" }, k8 = { class: "fau-badge muted" }, f8 = { class: "fau-badge muted" }, h8 = {
  key: 1,
  class: "fau-row"
}, $8 = { class: "ss-muted" }, _8 = ["value"], B8 = { value: "" }, b8 = ["value"], S8 = { class: "ss-actions" }, D8 = ["disabled"], C8 = {
  key: 1,
  class: "fau-badge ok"
}, w8 = {
  key: 0,
  class: "ss-muted"
}, T8 = ["data-test"], L8 = ["onClick"], K8 = ["data-test", "onClick"], A8 = {
  key: 0,
  class: "ss-note info"
}, F8 = {
  key: 1,
  class: "fau-row"
}, I8 = ["type", "name", "checked", "disabled", "onChange"], P8 = { class: "ss-muted" }, O8 = {
  key: 0,
  class: "fau-badge warn"
}, z8 = { class: "ss-actions" }, M8 = ["disabled", "data-test", "onClick"], j8 = ["onClick"], R8 = {
  key: 0,
  class: "fau-input",
  "data-test": "fau-bank-pairing"
}, q8 = {
  key: 0,
  class: "ss-note ok"
}, U8 = ["onUpdate:modelValue", "disabled"], W8 = { value: "" }, Y8 = ["value"], G8 = {
  key: 1,
  class: "ss-actions"
}, H8 = ["disabled"], Q8 = {
  key: 3,
  class: "ss-note warn"
}, J8 = {
  key: 0,
  class: "ss-note warn"
}, Z8 = { class: "ss-actions" }, X8 = ["disabled"], x8 = { class: "ss-muted" }, eD = {
  key: 0,
  class: "fau-subs"
}, tD = { class: "ss-note warn" }, lD = {
  key: 0,
  class: "fau-row"
}, nD = { class: "fau-badge" }, aD = { class: "fau-badge" }, oD = { class: "fau-badge" }, sD = {
  key: 1,
  class: "fau-table-wrap",
  "data-test": "fau-verification"
}, rD = { class: "fau-table" }, iD = { class: "wrap" }, cD = {
  key: 0,
  class: "ss-muted"
}, dD = {
  key: 0,
  class: "ss-note ok",
  "data-test": "fau-archived"
}, uD = {
  key: 1,
  class: "ss-muted"
}, mD = {
  key: 2,
  class: "ss-actions"
}, pD = { class: "ss-muted" }, yD = ["data-test", "disabled", "title", "onClick"], ND = { key: 0 }, VD = {
  key: 5,
  class: "ss-note danger",
  "data-test": "fau-runner-error"
}, ED = {
  key: 1,
  class: "ss-note warn"
}, vD = /* @__PURE__ */ e.defineComponent({
  __name: "ModuleRunner",
  props: {
    moduleId: {},
    home: {},
    runId: {},
    step: {}
  },
  emits: ["home-changed"],
  setup(i, { emit: B }) {
    const t = i, y = B, r = ye.useRouter(), n = { R: s.i18nKey("规则型"), S: s.i18nKey("技能型"), H: s.i18nKey("混合型"), P: s.i18nKey("平台") }, c = {
      draft: s.i18nKey("草稿"),
      running: s.i18nKey("进行中"),
      ready: s.i18nKey("待签核"),
      signing: s.i18nKey("签核中"),
      returned: s.i18nKey("被退回"),
      archived: s.i18nKey("已归档"),
      void: s.i18nKey("已作废")
    }, a = { high: s.i18nKey("高"), medium: s.i18nKey("中"), low: s.i18nKey("低") }, N = { todo: "ri-checkbox-blank-circle-line", running: "ri-loader-4-line spin", done: "ri-checkbox-circle-line", failed: "ri-close-circle-line", skipped: "ri-skip-forward-line" }, E = s.listSeparator(), u = e.computed(() => ie.moduleById(t.moduleId)), L = e.computed(() => !!u.value && u.value.status === "ready" && u.value.group !== "platform"), k = kt(), g = e.ref(null), b = e.ref(null), h = e.ref([]), K = e.ref([]), T = e.ref(null), z = e.ref(u.value?.modes[0]?.id || ""), S = e.ref(t.home.company?.outputLocale || "zh-CN"), w = e.reactive({}), m = e.reactive({}), f = e.ref(null), p = e.reactive({}), I = e.ref(""), _ = e.ref(!1), v = e.ref(""), R = e.ref(!1), d = e.computed(() => ke.regionProfile(t.home.company?.region || "CN").name), M = e.computed(() => u.value && g.value ? ie.inputsForMode(u.value, g.value.modeId) : []), V = e.computed(() => !!g.value && ["draft", "returned"].includes(g.value.status) && !te.value), te = e.computed(() => !!g.value && Object.values(g.value.steps).some(($) => $.status === "running")), j = e.computed(() => (b.value?.missing || []).map(($) => s.t($))), W = e.computed(() => {
      const $ = g.value, F = {};
      for (const C of Se) F[C] = $ ? Lt($.steps[C]) : { state: "todo" };
      return $ || (F.setup = { state: "todo" }), F;
    }), U = e.computed(() => {
      const $ = g.value;
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
    const ne = ($) => ie.moduleById($)?.status !== "ready", D = ($) => Te($), O = ($, F) => K.value.filter((C) => C.kind === $ && ($ !== "evidence" || !C.slot || !F || C.slot === F));
    async function P() {
      if (!u.value) return;
      const [$, F] = await Promise.all([Y("run.list", { moduleId: u.value.id }), Y("data.list")]);
      h.value = $.filter((C) => C.status !== "void"), K.value = F;
    }
    async function J($) {
      const F = await Y("run.get", { runId: $ });
      g.value = F.run, b.value = { nextLevel: F.nextLevel, active: F.active, missing: F.missing, running: F.running }, z.value = F.run.modeId, S.value = F.run.outputLocale;
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
    async function Z() {
      v.value = "";
      try {
        await P(), g.value && await J(g.value.id), y("home-changed");
      } catch ($) {
        v.value = Q.errorMessage($);
      }
    }
    async function de($) {
      if (!$) {
        g.value = null, b.value = null, r.replace({ query: {} });
        return;
      }
      await J($), r.replace({ query: { run: $ } });
    }
    function he($) {
      r.push({ path: `/workbenches/finance-audit/m/${t.moduleId}`, query: { run: $ } });
    }
    async function oe($) {
      _.value = !0, v.value = "";
      try {
        await $();
      } catch (F) {
        v.value = Q.errorMessage(F);
      } finally {
        _.value = !1;
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
      m[$.id] = { path: F[0], inspect: null }, await _e($);
    }
    async function _e($, F, C) {
      const x = m[$.id];
      x && await oe(async () => {
        x.inspect = await Y("data.inspect", { path: x.path, kind: $.kind, mapping: F ?? x.inspect?.mapping, sheet: C ?? x.inspect?.sheetName });
      });
    }
    function ze($) {
      const F = m[$.id];
      return F ? oe(async () => {
        const C = await Y("data.import", { path: F.path, kind: $.kind, slot: $.id, moduleId: t.moduleId, mapping: F.inspect?.mapping, sheet: F.inspect?.sheetName });
        delete m[$.id], await Ve({ ...w, [$.id]: $.multi ? [...w[$.id] || [], C.id] : [C.id] });
      }) : Promise.resolve();
    }
    async function Ve($, F) {
      g.value && (await Y("run.setInputs", { runId: g.value.id, inputs: $, params: F }), await Z());
    }
    function ve($, F, C) {
      const x = w[$] || [], nt = C ? x.includes(F) ? x.filter((wt) => wt !== F) : [...x, F] : x.includes(F) ? [] : [F];
      return oe(() => Ve({ ...w, [$]: nt }));
    }
    function A($) {
      return oe(async () => {
        const F = await Y("audit.template", { moduleId: t.moduleId, slot: $.id, locale: S.value });
        await Y("artifact.reveal", { path: F.path });
      });
    }
    function q() {
      const $ = [...f.value?.pairing.pairs || [], ...Object.entries(p).filter(([, F]) => F).map(([F, C]) => ({ bookAccount: C, bankAccount: F }))];
      return oe(() => Ve({ ...w }, { accountPairs: $ }));
    }
    function G() {
      return oe(async () => {
        await Y("run.start", { runId: g.value.id }), await Z(), Q.scrollToStep("validate");
      });
    }
    async function le($) {
      await oe(async () => {
        await Y("run.retry", { runId: g.value.id, fromStep: $ }), await Z();
      });
    }
    async function Ee() {
      g.value && await Y("run.cancel", { runId: g.value.id });
    }
    function Dt($) {
      return oe(async () => {
        await Y("handoff.send", { fromRunId: g.value.id, toModuleId: $ }), y("home-changed");
      });
    }
    async function Ct($) {
      await oe(async () => {
        await Y("settings.patch", { moduleModels: { ...t.home.settings.moduleModels, [t.moduleId]: $ } }), y("home-changed");
      });
    }
    let lt = null, Be = null;
    return e.onMounted(async () => {
      lt = gt(($) => {
        if ($.type === "todo.changed") {
          P().catch(() => {
          });
          return;
        }
        ($.type === "run.progress" || $.type === "run.state") && $.runId === g.value?.id && (Be && clearTimeout(Be), Be = setTimeout(() => {
          J($.runId).catch(() => {
          });
        }, 150));
      });
      try {
        await P();
        const $ = t.runId || h.value.find((F) => !["archived", "void"].includes(F.status))?.id;
        $ && await J($), t.step && Q.scrollToStep(t.step);
      } catch ($) {
        v.value = Q.errorMessage($);
      }
      Y("models.list").then(($) => {
        T.value = $;
      }).catch(() => {
      });
    }), e.onBeforeUnmount(() => {
      lt?.(), Be && clearTimeout(Be);
    }), e.watch(() => t.runId, ($) => {
      $ && $ !== g.value?.id && J($).catch((F) => {
        v.value = Q.errorMessage(F);
      });
    }), ($, F) => u.value ? (e.openBlock(), e.createElementBlock("div", {
      key: 0,
      class: "fau-runner ss-module",
      "data-test": `fau-module-${u.value.id}`
    }, [
      e.createCommentVNode(" ModuleHeader "),
      e.createElementVNode("section", xS, [
        e.createElementVNode("div", e8, [
          e.createElementVNode(
            "span",
            t8,
            e.toDisplayString(u.value.code),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "h2",
            l8,
            e.toDisplayString($.$t(u.value.name)),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            n8,
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
          a8,
          e.toDisplayString($.$t(u.value.summary)),
          1
          /* TEXT */
        ),
        e.createElementVNode("dl", o8, [
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
            e.toDisplayString(u.value.outputs.map((C) => e.unref(ht)[C] || C).join(" / ")),
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
                  " · " + e.toDisplayString(u.value.standards.map((C) => $.$t(e.unref(ke.STANDARD_LABELS)[C] || C)).join(" / ")),
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
            e.toDisplayString(e.unref(It)(u.value.provenance, e.unref(E))),
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
              value: i.home.settings.moduleModels[u.value.id] || "",
              "data-test": "fau-model",
              onChange: F[1] || (F[1] = (C) => Ct(C.target.value))
            }, [
              e.createElementVNode(
                "option",
                r8,
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
                }, e.toDisplayString(C.group ? `${C.group} · ` : "") + e.toDisplayString(C.label), 9, i8))),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 40, s8)
          ])
        ])
      ]),
      e.createCommentVNode(" 规划中 / 平台模块：没有七步流程，直接说明（从 URL 直达时不让人点出主进程报错） "),
      u.value.id === "office-output" && u.value.status === "ready" ? (e.openBlock(), e.createBlock(SS, {
        key: 0,
        home: i.home
      }, null, 8, ["home"])) : u.value.group === "platform" && u.value.status === "ready" && e.unref(Fe)[u.value.id] ? (e.openBlock(), e.createBlock(e.resolveDynamicComponent(e.unref(Fe)[u.value.id]), { key: 1 })) : L.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("section", c8, [
        u.value.status !== "ready" ? (e.openBlock(), e.createElementBlock("p", d8, [
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
        ])) : (e.openBlock(), e.createElementBlock("p", u8, [
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
        e.createElementVNode("div", m8, [
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
      L.value ? (e.openBlock(), e.createBlock(He, {
        key: 3,
        title: `${u.value.code} · ${$.$t(u.value.name)}`,
        metas: e.unref(k),
        runtime: W.value,
        "current-key": U.value,
        onJump: e.unref(Q.scrollToStep)
      }, null, 8, ["title", "metas", "runtime", "current-key", "onJump"])) : e.createCommentVNode("v-if", !0),
      L.value ? (e.openBlock(), e.createElementBlock("div", p8, [
        e.createCommentVNode(" ① 选择项目与模式 "),
        e.createVNode(se, {
          "step-key": "setup",
          index: 0,
          title: e.unref(k)[0].title,
          hint: e.unref(k)[0].hint,
          runtime: W.value.setup,
          "is-current": U.value === "setup"
        }, {
          default: e.withCtx(() => [
            i.home.project?.status === "archived" ? (e.openBlock(), e.createElementBlock("p", y8, [
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
            e.createElementVNode("div", N8, [
              e.createElementVNode(
                "span",
                V8,
                e.toDisplayString($.$t("场景模式")),
                1
                /* TEXT */
              ),
              e.createElementVNode("span", E8, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(u.value.modes, (C) => (e.openBlock(), e.createElementBlock("button", {
                    key: C.id,
                    type: "button",
                    class: e.normalizeClass({ on: z.value === C.id }),
                    disabled: !!g.value && g.value.status !== "draft",
                    "data-test": `fau-mode-${C.id}`,
                    onClick: (x) => z.value = C.id
                  }, e.toDisplayString($.$t(C.name)), 11, v8))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            e.createElementVNode("div", g8, [
              e.createVNode(Oe, {
                modelValue: S.value,
                "onUpdate:modelValue": F[3] || (F[3] = (C) => S.value = C),
                disabled: !!g.value
              }, null, 8, ["modelValue", "disabled"]),
              e.createElementVNode("span", k8, [
                e.createTextVNode(
                  e.toDisplayString($.$t("期间")) + " ",
                  1
                  /* TEXT */
                ),
                e.createVNode(l, {
                  value: i.home.project?.period
                }, null, 8, ["value"])
              ]),
              e.createElementVNode(
                "span",
                f8,
                e.toDisplayString($.$t(d.value)) + " · " + e.toDisplayString($.$t(e.unref(ke.STANDARD_LABELS)[i.home.company?.standard || "CAS"] || "")),
                1
                /* TEXT */
              )
            ]),
            h.value.length ? (e.openBlock(), e.createElementBlock("div", h8, [
              e.createElementVNode(
                "span",
                $8,
                e.toDisplayString($.$t("继续本项目里的运行")),
                1
                /* TEXT */
              ),
              e.createElementVNode("select", {
                value: g.value?.id || "",
                "data-test": "fau-run-select",
                onChange: F[4] || (F[4] = (C) => de(C.target.value))
              }, [
                e.createElementVNode(
                  "option",
                  B8,
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
                  }, e.toDisplayString(H(C.modeId)) + " · " + e.toDisplayString($.$t(c[C.status] || C.status)) + " · " + e.toDisplayString(D(C.updatedAt)), 9, b8))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 40, _8)
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", S8, [
              g.value ? (e.openBlock(), e.createElementBlock(
                "span",
                C8,
                e.toDisplayString($.$t("本次运行：{p0}", { p0: H(g.value.modeId) })) + " · " + e.toDisplayString($.$t(e.unref(ft)[g.value.outputLocale])),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn primary",
                disabled: _.value || i.home.project?.status === "archived",
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
              ], 8, D8))
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ② 上传数据 "),
        e.createVNode(se, {
          "step-key": "upload",
          index: 1,
          title: e.unref(k)[1].title,
          hint: e.unref(k)[1].hint,
          runtime: W.value.upload,
          "is-current": U.value === "upload"
        }, {
          default: e.withCtx(() => [
            g.value ? (e.openBlock(), e.createElementBlock(
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
                      }, e.toDisplayString($.$t("怎么导出这份数据")), 9, L8),
                      e.unref(tt.hasTemplate)(u.value.id, C.id) ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-link",
                        "data-test": `fau-template-${C.id}`,
                        onClick: (x) => A(C)
                      }, e.toDisplayString($.$t("下载模板")), 9, K8)) : e.createCommentVNode("v-if", !0)
                    ]),
                    I.value === C.id ? (e.openBlock(), e.createElementBlock("p", A8, [
                      F[14] || (F[14] = e.createElementVNode(
                        "i",
                        { class: "ri-question-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString($.$t(C.help)) + " " + e.toDisplayString(e.unref(At)(C.kind, i.home.company?.erp || "other")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    O(C.kind, C.id).length ? (e.openBlock(), e.createElementBlock("div", F8, [
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
                            onChange: (nt) => ve(C.id, x.id, !!C.multi)
                          }, null, 40, I8),
                          e.createTextVNode(
                            " " + e.toDisplayString(x.label) + " ",
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            P8,
                            e.toDisplayString($.$t("{n} 行", { n: x.rowCount })),
                            1
                            /* TEXT */
                          ),
                          x.issues.length ? (e.openBlock(), e.createElementBlock(
                            "span",
                            O8,
                            e.toDisplayString(x.issues.length),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : e.createCommentVNode("v-if", !0),
                    V.value ? (e.openBlock(), e.createBlock(_t, {
                      key: 2,
                      label: $.$t("上传：{p0}", { p0: $.$t(C.label) }),
                      kind: C.kind,
                      multi: C.kind === "evidence",
                      onPicked: (x) => Ne(C, x)
                    }, null, 8, ["label", "kind", "multi", "onPicked"])) : e.createCommentVNode("v-if", !0),
                    V.value ? (e.openBlock(), e.createBlock(ZS, {
                      key: 3,
                      kind: C.kind,
                      onPicked: (x) => Ne(C, x)
                    }, null, 8, ["kind", "onPicked"])) : e.createCommentVNode("v-if", !0),
                    m[C.id] ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 4 },
                      [
                        m[C.id].inspect ? (e.openBlock(), e.createBlock(Qe, {
                          key: 0,
                          table: m[C.id].inspect,
                          roles: m[C.id].inspect.roles.map((x) => ({ ...x, label: $.$t(x.label) })),
                          onUpdate: (x) => _e(C, x),
                          onSheet: (x) => _e(C, void 0, x)
                        }, null, 8, ["table", "roles", "onUpdate", "onSheet"])) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode("div", z8, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn primary sm",
                            disabled: _.value || !!m[C.id].inspect?.missing.length,
                            "data-test": `fau-import-${C.id}`,
                            onClick: (x) => ze(C)
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
                          ], 8, M8),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn ghost sm",
                            onClick: (x) => delete m[C.id]
                          }, e.toDisplayString($.$t("取消")), 9, j8)
                        ])
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0)
                  ], 10, T8))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                u.value.id === "recon" && g.value.modeId === "bank" && f.value ? (e.openBlock(), e.createElementBlock("div", R8, [
                  e.createElementVNode("header", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString($.$t("银行账户配对")),
                      1
                      /* TEXT */
                    )
                  ]),
                  !f.value.pairing.unpairedBook.length && !f.value.pairing.unpairedBank.length ? (e.openBlock(), e.createElementBlock("p", q8, [
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
                        "onUpdate:modelValue": (x) => p[C] = x,
                        disabled: !V.value
                      }, [
                        e.createElementVNode(
                          "option",
                          W8,
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
                          }, e.toDisplayString(x.code) + " " + e.toDisplayString(x.name), 9, Y8))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ], 8, U8), [
                        [e.vModelSelect, p[C]]
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  f.value.pairing.unpairedBank.length ? (e.openBlock(), e.createElementBlock("div", G8, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      disabled: _.value,
                      onClick: q
                    }, e.toDisplayString($.$t("保存配对")), 9, H8)
                  ])) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0),
                e.createCommentVNode(" 批次 4：税务组的申报参数与模板 "),
                u.value.group === "tax" ? (e.openBlock(), e.createBlock(gc, {
                  key: 1,
                  run: g.value,
                  def: u.value,
                  editable: V.value,
                  onSave: F[5] || (F[5] = (C) => oe(() => Ve({ ...w }, C)))
                }, null, 8, ["run", "def", "editable"])) : e.createCommentVNode("v-if", !0),
                e.unref(ut)[u.value.id] ? (e.openBlock(), e.createBlock(e.resolveDynamicComponent(e.unref(ut)[u.value.id]), {
                  key: 2,
                  run: g.value,
                  def: u.value,
                  editable: V.value,
                  onChanged: Z
                }, null, 40, ["run", "def", "editable"])) : e.createCommentVNode("v-if", !0),
                g.value.steps.upload.status !== "done" && j.value.length ? (e.openBlock(), e.createElementBlock("p", Q8, [
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
              w8,
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
          title: e.unref(k)[2].title,
          hint: e.unref(k)[2].hint,
          runtime: W.value.validate,
          "is-current": U.value === "validate",
          retry: g.value ? () => le("validate") : void 0,
          cancel: Ee
        }, {
          default: e.withCtx(() => [
            g.value && j.value.length ? (e.openBlock(), e.createElementBlock("p", J8, [
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
            e.createElementVNode("div", Z8, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !g.value || _.value || j.value.length > 0 || te.value || !V.value,
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
              ], 8, X8),
              e.createElementVNode(
                "span",
                x8,
                e.toDisplayString($.$t("校验、计算、生成底稿会连续跑完；有阻断项会停在这一步")),
                1
                /* TEXT */
              )
            ]),
            g.value?.validation ? (e.openBlock(), e.createBlock(Fo, {
              key: 1,
              report: g.value.validation
            }, null, 8, ["report"])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry"]),
        e.createCommentVNode(" ④ 分析 / 计算 "),
        e.createVNode(se, {
          "step-key": "analyze",
          index: 3,
          title: e.unref(k)[3].title,
          hint: e.unref(k)[3].hint,
          runtime: W.value.analyze,
          "is-current": U.value === "analyze",
          retry: g.value ? () => le("analyze") : void 0,
          cancel: Ee
        }, {
          default: e.withCtx(() => [
            g.value?.steps.analyze.sub?.length ? (e.openBlock(), e.createElementBlock("ul", eD, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(g.value.steps.analyze.sub, (C) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: C.id,
                    class: e.normalizeClass(C.status)
                  },
                  [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(N[C.status])
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(e.unref(X)(C.label)),
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
            g.value?.result && u.value.id === "close" ? (e.openBlock(), e.createBlock(Tr, {
              key: 1,
              run: g.value,
              def: u.value,
              onChanged: Z
            }, null, 8, ["run", "def"])) : g.value?.result && u.value.id === "recon" ? (e.openBlock(), e.createBlock(Ti, {
              key: 2,
              run: g.value,
              onOpenRun: he
            }, null, 8, ["run"])) : g.value?.result && u.value.group === "fpa" ? (e.openBlock(), e.createBlock(ac, {
              key: 3,
              run: g.value
            }, null, 8, ["run"])) : g.value?.result && u.value.group === "tax" ? (e.openBlock(), e.createBlock(Vu, {
              key: 4,
              run: g.value,
              def: u.value,
              editable: V.value,
              onChanged: Z
            }, null, 8, ["run", "def", "editable"])) : g.value?.result && e.unref(Fe)[u.value.id] ? (e.openBlock(), e.createBlock(e.resolveDynamicComponent(e.unref(Fe)[u.value.id]), {
              key: 5,
              run: g.value,
              def: u.value,
              onChanged: Z,
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
          title: e.unref(k)[4].title,
          hint: e.unref(k)[4].hint,
          runtime: W.value.draft,
          "is-current": U.value === "draft",
          retry: g.value ? () => le("draft") : void 0,
          cancel: Ee
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", tD, [
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
            g.value?.confidence ? (e.openBlock(), e.createElementBlock("div", lD, [
              e.createElementVNode(
                "span",
                nD,
                e.toDisplayString($.$t("数据完整度")) + ": " + e.toDisplayString($.$t(a[g.value.confidence.data])),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                aD,
                e.toDisplayString($.$t("方案成熟度")) + ": " + e.toDisplayString($.$t(a[g.value.confidence.method])),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                oD,
                e.toDisplayString($.$t("整体置信度")) + ": " + e.toDisplayString($.$t(a[g.value.confidence.overall])),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            g.value?.verification.length ? (e.openBlock(), e.createElementBlock("div", sD, [
              e.createElementVNode("table", rD, [
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
                    e.renderList(g.value.verification, (C) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: C.id,
                        class: e.normalizeClass({ bad: C.status === "unverified" })
                      },
                      [
                        e.createElementVNode("td", iD, [
                          e.createTextVNode(
                            e.toDisplayString(C.text),
                            1
                            /* TEXT */
                          ),
                          C.missing?.length ? (e.openBlock(), e.createElementBlock("small", cD, [
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
            g.value ? (e.openBlock(), e.createBlock(_a, {
              key: 2,
              artifacts: g.value.artifacts,
              archived: g.value.status === "archived"
            }, null, 8, ["artifacts", "archived"])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry"]),
        e.createCommentVNode(" ⑥ 人工签核 "),
        e.createVNode(se, {
          "step-key": "signoff",
          index: 5,
          title: e.unref(k)[5].title,
          hint: e.unref(k)[5].hint,
          runtime: W.value.signoff,
          "is-current": U.value === "signoff"
        }, {
          default: e.withCtx(() => [
            g.value && i.home.company && b.value ? (e.openBlock(), e.createBlock(Bo, {
              key: 0,
              run: g.value,
              company: i.home.company,
              active: b.value.active,
              "next-level": b.value.nextLevel,
              "base-levels": u.value.signoff.levels,
              onChanged: Z
            }, null, 8, ["run", "company", "active", "next-level", "base-levels"])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ⑦ 归档与转交 "),
        e.createVNode(se, {
          "step-key": "archive",
          index: 6,
          title: e.unref(k)[6].title,
          hint: e.unref(k)[6].hint,
          runtime: W.value.archive,
          "is-current": U.value === "archive"
        }, {
          default: e.withCtx(() => [
            g.value?.status === "archived" ? (e.openBlock(), e.createElementBlock("p", dD, [
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
              uD,
              e.toDisplayString($.$t("最后一级签核通过后自动归档")),
              1
              /* TEXT */
            )),
            u.value.handoffTo?.length ? (e.openBlock(), e.createElementBlock("div", mD, [
              e.createElementVNode(
                "span",
                pD,
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
                  disabled: _.value || g.value?.status !== "archived" || ne(C),
                  title: ne(C) ? $.$t("即将上线") : "",
                  onClick: (x) => Dt(C)
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
                    ND,
                    " · " + e.toDisplayString($.$t("即将上线")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ], 8, yD))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"])
      ])) : e.createCommentVNode("v-if", !0),
      v.value ? (e.openBlock(), e.createElementBlock("p", VD, [
        F[25] || (F[25] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(v.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createVNode(Pa, {
        open: R.value,
        modules: [u.value.id],
        currency: i.home.company?.currency,
        onClose: F[6] || (F[6] = (C) => R.value = !1)
      }, null, 8, ["open", "modules", "currency"])
    ], 8, XS)) : (e.openBlock(), e.createElementBlock("p", ED, [
      F[26] || (F[26] = e.createElementVNode(
        "i",
        { class: "ri-error-warning-line" },
        null,
        -1
        /* CACHED */
      )),
      e.createTextVNode(
        e.toDisplayString($.$t("未知模块：{p0}", { p0: i.moduleId })),
        1
        /* TEXT */
      )
    ]));
  }
}), gD = /* @__PURE__ */ ae(vD, [["__scopeId", "data-v-a36cb0e6"]]), kD = {
  class: "fau-page",
  "data-test": "fau-workbench"
}, fD = { class: "fau-head" }, hD = { class: "grow" }, $D = { class: "fau-sub" }, _D = ["disabled"], BD = {
  key: 0,
  class: "ss-note danger"
}, bD = {
  key: 1,
  class: "ss-note"
}, SD = {
  class: "fau-bar",
  "data-test": "fau-topbar"
}, DD = { class: "fau-row" }, CD = { class: "ss-muted" }, wD = ["value"], TD = ["value"], LD = { value: "__new" }, KD = {
  class: "fau-badge",
  "data-test": "fau-region-badge"
}, AD = { class: "fau-row" }, FD = { class: "ss-muted" }, ID = ["value"], PD = ["value"], OD = ["disabled"], zD = { class: "fau-boundary" }, MD = {
  key: 0,
  class: "ss-note warn fau-hint",
  "data-test": "fau-sample-banner"
}, jD = { class: "grow" }, RD = ["disabled"], qD = {
  key: 1,
  class: "ss-note info fau-hint",
  "data-test": "fau-defaults-hint"
}, UD = { class: "grow" }, WD = ["aria-label"], YD = {
  key: 2,
  class: "fau-panel",
  "data-test": "fau-first-project"
}, GD = { class: "ss-muted" }, HD = { class: "ss-actions" }, QD = ["disabled"], JD = { class: "fau-panels" }, ZD = {
  class: "fau-panel",
  "data-test": "fau-todos"
}, XD = {
  key: 0,
  class: "fau-list"
}, xD = ["data-test", "onClick"], e2 = { class: "grow" }, t2 = {
  key: 1,
  class: "ss-muted"
}, l2 = {
  class: "fau-panel",
  "data-test": "fau-queue"
}, n2 = {
  class: "fau-panel",
  "data-test": "fau-close-progress"
}, a2 = { class: "fau-row" }, o2 = { class: "grow" }, s2 = { class: "fau-row" }, r2 = { class: "grow" }, i2 = { class: "fau-row" }, c2 = { class: "grow" }, d2 = {
  key: 1,
  class: "ss-muted"
}, u2 = { class: "ss-actions" }, m2 = {
  class: "ss-muted fau-overview",
  "data-test": "fau-overview"
}, p2 = {
  class: "fau-groups",
  "data-test": "fau-modules"
}, y2 = { class: "fau-badge muted" }, N2 = {
  key: 0,
  class: "ss-muted"
}, V2 = { class: "fau-mods" }, E2 = { class: "fau-code" }, v2 = { class: "fau-mod-foot" }, g2 = {
  key: 0,
  class: "fau-badge ok"
}, k2 = ["data-test", "data-batch"], f2 = {
  class: "fau-panel",
  "data-test": "fau-recent"
}, h2 = {
  key: 0,
  class: "fau-list"
}, $2 = ["onClick"], _2 = { class: "grow" }, B2 = {
  key: 1,
  class: "ss-muted"
}, b2 = ["aria-label"], S2 = { class: "fau-drawer__body" }, D2 = { class: "ss-muted" }, C2 = { class: "fau-table-wrap" }, w2 = { class: "fau-table" }, T2 = { class: "num" }, L2 = { class: "wrap" }, K2 = {
  key: 0,
  class: "ss-muted"
}, A2 = { class: "num" }, F2 = ["onClick"], I2 = { class: "fau-row" }, P2 = { value: "" }, O2 = ["value"], z2 = ["disabled"], M2 = {
  key: 0,
  class: "ss-note danger"
}, j2 = {
  key: 5,
  class: "ss-note danger"
}, mt = "totalclaw:finance-audit:capital-open:v1", pt = "totalclaw:finance-audit:defaults-hint-closed:v1:", R2 = /* @__PURE__ */ e.defineComponent({
  __name: "FinanceAuditWorkbenchView",
  setup(i) {
    const B = ye.useRoute(), t = ye.useRouter(), y = ue.FAU_GROUPS, r = e.ref(null), n = e.ref([]), c = e.ref(!1), a = e.ref(!1), N = e.ref(""), E = e.ref(""), u = e.ref(!1), L = e.ref(""), k = s.listSeparator(), g = e.ref(null), b = e.ref(!1), h = e.ref([]), K = e.ref([]), T = e.ref(""), z = e.ref(""), S = e.ref(""), w = e.computed(() => String(B.params.moduleId || "")), m = e.computed(() => ke.regionProfile(r.value?.company?.region || "CN").name), f = (A) => A.split(/[\\/]/).pop() || A, p = (A) => A === "capital", I = e.ref(_());
    function _() {
      try {
        return localStorage.getItem(mt) === "1";
      } catch {
        return !1;
      }
    }
    function v(A) {
      I.value = A.target.open;
      try {
        localStorage.setItem(mt, I.value ? "1" : "0");
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
        return localStorage.getItem(pt + A) === "1";
      } catch {
        return !1;
      }
    });
    function j() {
      const A = r.value?.company?.id || "";
      V.value = A;
      try {
        localStorage.setItem(pt + A, "1");
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
      c.value = !0;
      try {
        const [A, q] = await Promise.all([Y("home.get"), Y("catalog.get")]);
        r.value = A, n.value = q, N.value = "", z.value || (z.value = A.project?.period || De());
      } catch (A) {
        N.value = Q.errorMessage(A);
      } finally {
        c.value = !1;
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
    function Z(A) {
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
        await g.value?.openDetail();
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
    async function ze() {
      a.value = !0;
      try {
        await Y("data.importFromFinanceAgent", { ledgerId: T.value, period: z.value }), await Ne();
      } catch (A) {
        S.value = Q.errorMessage(A);
      } finally {
        a.value = !1;
      }
    }
    let Ve = null, ve = null;
    return e.onMounted(() => {
      H(), Ve = gt((A) => {
        A.type === "todo.changed" && (ve && clearTimeout(ve), ve = setTimeout(() => {
          H();
        }, 300));
      });
    }), e.onBeforeUnmount(() => {
      Ve?.(), ve && clearTimeout(ve);
    }), (A, q) => (e.openBlock(), e.createElementBlock("div", kD, [
      e.createElementVNode("header", fD, [
        e.createVNode(Tt),
        q[15] || (q[15] = e.createElementVNode(
          "span",
          { class: "heading-icon" },
          [
            e.createElementVNode("i", { class: "ri-scales-3-line" })
          ],
          -1
          /* CACHED */
        )),
        e.createElementVNode("div", hD, [
          e.createElementVNode(
            "h1",
            null,
            e.toDisplayString(A.$t("财会审计解决方案")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            $D,
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
          disabled: c.value,
          onClick: H
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(c.value ? "ri-loader-4-line spin" : "ri-refresh-line")
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
        ], 8, _D)
      ]),
      N.value ? (e.openBlock(), e.createElementBlock("p", BD, [
        q[16] || (q[16] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(N.value),
          1
          /* TEXT */
        )
      ])) : r.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          !r.value.company || u.value ? (e.openBlock(), e.createBlock(mn, {
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
              e.createElementVNode("section", SD, [
                e.createElementVNode("span", DD, [
                  e.createElementVNode(
                    "small",
                    CD,
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
                      }, e.toDisplayString(G.name), 9, TD))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode(
                      "option",
                      LD,
                      e.toDisplayString(A.$t("+ 新建公司档案")),
                      1
                      /* TEXT */
                    )
                  ], 40, wD)
                ]),
                e.createVNode(Qn, {
                  ref_key: "projectBar",
                  ref: g,
                  projects: r.value.projects,
                  project: r.value.project,
                  onChanged: H,
                  onOpenRun: q[3] || (q[3] = (G, le) => e.unref(t).push({ path: `/workbenches/finance-audit/m/${G}`, query: { run: le } }))
                }, null, 8, ["projects", "project"]),
                e.createElementVNode(
                  "span",
                  KD,
                  e.toDisplayString(A.$t(m.value)) + " · " + e.toDisplayString(A.$t(e.unref(ke.STANDARD_LABELS)[r.value.company.standard] || r.value.company.standard)),
                  1
                  /* TEXT */
                ),
                e.createVNode(Oe, {
                  "model-value": r.value.company.outputLocale,
                  "onUpdate:modelValue": J
                }, null, 8, ["model-value"]),
                e.createElementVNode("span", AD, [
                  e.createElementVNode(
                    "small",
                    FD,
                    e.toDisplayString(A.$t("套餐")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("select", {
                    value: r.value.settings.bundle,
                    "data-test": "fau-bundle",
                    onChange: q[4] || (q[4] = (G) => Z(G.target.value))
                  }, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(ie.BUNDLE_LABELS), (G, le) => (e.openBlock(), e.createElementBlock("option", {
                        key: le,
                        value: le
                      }, e.toDisplayString(A.$t(G)), 9, PD))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ], 40, ID)
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
                ], 8, OD)),
                e.createElementVNode("span", zD, [
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
              r.value.company.sample ? (e.openBlock(), e.createElementBlock("p", MD, [
                q[22] || (q[22] = e.createElementVNode(
                  "i",
                  { class: "ri-flask-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  jD,
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
                ], 8, RD)
              ])) : M.value.length && !te.value ? (e.openBlock(), e.createElementBlock("p", qD, [
                q[24] || (q[24] = e.createElementVNode(
                  "i",
                  { class: "ri-information-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  UD,
                  e.toDisplayString(A.$t("还有 {n} 项配置用的是默认值：{p0}", { n: M.value.length, p0: M.value.map((G) => A.$t(G.label)).join(e.unref(k)) })),
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
                ])], 8, WD)
              ])) : e.createCommentVNode("v-if", !0),
              r.value.project ? w.value ? (e.openBlock(), e.createBlock(gD, {
                key: `${w.value}:${r.value.project.id}`,
                "module-id": w.value,
                home: r.value,
                "run-id": String(e.unref(B).query.run || "") || void 0,
                step: String(e.unref(B).query.step || "") || void 0,
                onHomeChanged: H
              }, null, 8, ["module-id", "home", "run-id", "step"])) : (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 4 },
                [
                  e.createElementVNode("div", JD, [
                    e.createElementVNode("section", ZD, [
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
                      r.value.todos.length ? (e.openBlock(), e.createElementBlock("ul", XD, [
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
                              e2,
                              e.toDisplayString(e.unref(X)(G.message)),
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
                          ], 8, xD))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])) : (e.openBlock(), e.createElementBlock(
                        "p",
                        t2,
                        e.toDisplayString(A.$t("没有待办")),
                        1
                        /* TEXT */
                      ))
                    ]),
                    e.createElementVNode("section", l2, [
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
                      e.createVNode(sa, {
                        items: r.value.queue,
                        onOpen: q[8] || (q[8] = (G) => e.unref(t).push({ path: `/workbenches/finance-audit/m/${G.moduleId}`, query: { run: G.runId, step: "signoff" } }))
                      }, null, 8, ["items"])
                    ]),
                    e.createElementVNode("section", n2, [
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
                          e.createElementVNode("div", a2, [
                            e.createElementVNode(
                              "span",
                              o2,
                              e.toDisplayString(A.$t("关账清单")),
                              1
                              /* TEXT */
                            ),
                            e.createVNode(l, {
                              value: `${r.value.closeProgress.checklistDone}/${r.value.closeProgress.checklistTotal}`
                            }, null, 8, ["value"])
                          ]),
                          e.createElementVNode("div", s2, [
                            e.createElementVNode(
                              "span",
                              r2,
                              e.toDisplayString(A.$t("试算平衡")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(r.value.closeProgress.trialOk ? "fau-true" : "fau-false")
                              },
                              e.toDisplayString(r.value.closeProgress.trialOk === null ? "-" : r.value.closeProgress.trialOk ? "✓" : "✗"),
                              3
                              /* TEXT, CLASS */
                            )
                          ]),
                          e.createElementVNode("div", i2, [
                            e.createElementVNode(
                              "span",
                              c2,
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
                        d2,
                        e.toDisplayString(A.$t("本项目还没有跑月结关账")),
                        1
                        /* TEXT */
                      )),
                      e.createElementVNode("div", u2, [
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
                    m2,
                    e.toDisplayString(A.$t("{n} 个模块已可用、{m} 个即将上线：点可用的卡片进入，按七步出底稿；每张卡写着它产出什么。", { n: R.value, m: d.value })),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", p2, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(y), (G) => (e.openBlock(), e.createBlock(e.resolveDynamicComponent(p(G) ? "details" : "section"), {
                        key: G,
                        class: "fau-group",
                        "data-test": `fau-group-${G}`,
                        open: p(G) ? I.value : void 0,
                        onToggle: (le) => p(G) && v(le)
                      }, {
                        default: e.withCtx(() => [
                          (e.openBlock(), e.createBlock(
                            e.resolveDynamicComponent(p(G) ? "summary" : "header"),
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
                                  y2,
                                  e.toDisplayString(U(G).length),
                                  1
                                  /* TEXT */
                                ),
                                p(G) ? (e.openBlock(), e.createElementBlock(
                                  "small",
                                  N2,
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
                          e.createElementVNode("div", V2, [
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
                                      E2,
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
                                  e.createElementVNode("span", v2, [
                                    le.status === "ready" ? (e.openBlock(), e.createElementBlock(
                                      "span",
                                      g2,
                                      e.toDisplayString(A.$t("可用")),
                                      1
                                      /* TEXT */
                                    )) : (e.openBlock(), e.createElementBlock("span", {
                                      key: 1,
                                      class: "fau-badge muted",
                                      "data-test": `fau-planned-${le.id}`,
                                      "data-batch": le.batch
                                    }, e.toDisplayString(A.$t("即将上线")), 9, k2)),
                                    (e.openBlock(!0), e.createElementBlock(
                                      e.Fragment,
                                      null,
                                      e.renderList(le.outputs, (Ee) => (e.openBlock(), e.createElementBlock(
                                        "span",
                                        {
                                          key: Ee,
                                          class: "fau-out"
                                        },
                                        e.toDisplayString(e.unref(ht)[Ee] || Ee),
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
                  e.createElementVNode("section", f2, [
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
                    r.value.recent.length ? (e.openBlock(), e.createElementBlock("ul", h2, [
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
                          e.createElementVNode("span", _2, [
                            e.createTextVNode(
                              e.toDisplayString(e.unref(X)(G.title)) + " · ",
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
                        ], 8, $2))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : (e.openBlock(), e.createElementBlock(
                      "p",
                      B2,
                      e.toDisplayString(A.$t("还没有产出")),
                      1
                      /* TEXT */
                    ))
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : (e.openBlock(), e.createElementBlock("section", YD, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(A.$t("先新建一个项目")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "p",
                  GD,
                  e.toDisplayString(A.$t("每个项目对应一个月结期、年审或申报周期，数据、运行和签核都挂在项目下。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", HD, [
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
                  ], 8, QD),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-btn",
                      onClick: q[7] || (q[7] = (G) => g.value?.openCreate())
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
      )) : (e.openBlock(), e.createElementBlock("p", bD, [
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
        e.createElementVNode("div", S2, [
          e.createElementVNode(
            "p",
            D2,
            e.toDisplayString(A.$t("在模块的第 2 步上传数据；这里管理本项目已导入的数据集，也可以从财务智能体账套只读导入。")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", C2, [
            e.createElementVNode("table", w2, [
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
                    T2,
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
                    e.createElementVNode("td", L2, [
                      e.createTextVNode(
                        e.toDisplayString(G.label),
                        1
                        /* TEXT */
                      ),
                      G.issues.length ? (e.openBlock(), e.createElementBlock(
                        "small",
                        K2,
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
                    e.createElementVNode("td", A2, [
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
                      ])], 8, F2)
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
          e.createElementVNode("div", I2, [
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": q[12] || (q[12] = (G) => T.value = G),
                "data-test": "fau-fa-ledger"
              },
              [
                e.createElementVNode(
                  "option",
                  P2,
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
                  }, e.toDisplayString(G.name), 9, O2))),
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
              onClick: ze
            }, e.toDisplayString(A.$t("只读导入")), 9, z2)
          ]),
          S.value ? (e.openBlock(), e.createElementBlock("p", M2, [
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
      ], 8, b2)) : e.createCommentVNode("v-if", !0),
      E.value ? (e.openBlock(), e.createElementBlock("p", j2, [
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
}), q2 = /* @__PURE__ */ ae(R2, [["__scopeId", "data-v-4f9527fc"]]);
export {
  q2 as default
};
