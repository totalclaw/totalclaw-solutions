const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const n = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!n) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
n.default;
const ye = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!ye) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const we = ye.default, U = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!U) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
U.default;
const K = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!K) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
K.default;
const ke = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!ke) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const q = ke.default, ve = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!ve) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const Le = ve.default, he = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/TableMapping.vue"];
if (!he) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/TableMapping.vue");
const Ae = he.default, ee = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!ee) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
ee.default;
const w = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!w) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
w.default;
async function A(t, v) {
  const c = window.electronAPI?.workbenches?.partsAlert;
  if (!c?.invoke) throw new Error(n.t("配件预警与补库接口不可用，请重启应用"));
  return c.invoke(t, ee.toPlain(v ?? {}));
}
function Oe(t) {
  const v = window.electronAPI?.workbenches?.partsAlert;
  return v?.onEvent ? v.onEvent(t) : () => {
  };
}
const W = e.ref(null), x = e.ref([]), Y = e.ref([]);
let oe = "", ae = "";
async function F() {
  const t = await A("state.get");
  W.value = t;
  const v = t.run ? t.run.id : "";
  (v !== oe || v && !x.value.length) && (x.value = v ? await A("results.get", { which: "result" }) : [], oe = v);
  const c = t.latest ? t.latest.at : "";
  return (c !== ae || c && !Y.value.length) && (Y.value = c ? await A("results.get", { which: "latest" }) : [], ae = c), t;
}
function te(t, v = !1) {
  return A("path.open", { path: t, reveal: v });
}
function P(t) {
  return { stagnant: n.t("库存呆滞"), redundant: n.t("库存冗余"), healthy: n.t("库存健康"), at_risk: n.t("库存将缺货"), out_of_stock: n.t("库存已缺货") }[t];
}
function Q(t) {
  return { stagnant: "mute", redundant: "brand", healthy: "ok", at_risk: "warn", out_of_stock: "bad" }[t];
}
const re = { out_of_stock: "#e5484d", at_risk: "#f59e0b", stagnant: "#8b8d98", redundant: "#3b82f6", healthy: "#22c55e" };
function Me(t) {
  return {
    stagnant: n.t("呆滞库存处理建议"),
    redundant: n.t("冗余库存处理建议"),
    shortage_transit: n.t("有采购在途的管控举措"),
    shortage_none: n.t("无采购在途的管控举措")
  }[t];
}
function Ke(t) {
  return {
    stagnant: n.t("有库存但长期没有发货：停止采购、调拨消化，超期的做报废评估"),
    redundant: n.t("库存够用的时间超过上限：暂停补货，在途的协商延期"),
    shortage_transit: n.t("缺货或即将缺货，已经下了采购单：盯到货、催交、调拨应急，在途不够的追加"),
    shortage_none: n.t("缺货或即将缺货，还没有下采购单：按最迟下单日补库，到货前调拨或用替代件")
  }[t];
}
function ge(t) {
  return { monthly: n.t("历史发货（按月）"), yearly: n.t("历史发货（按年）"), leadTime: n.t("采购提前期"), inTransit: n.t("采购在途"), stock: n.t("实时库存") }[t];
}
function Pe(t) {
  return {
    monthly: n.t("近 3 年每个月的发货数量。一行一条（配件、月份、数量）或一列一个月份的横表都可以"),
    yearly: n.t("近 5 年每年的发货数量，用来看年度趋势；没有可以不传"),
    leadTime: n.t("近 1 年平均采购天数，可带最小起订量、单价、供应商；没有的配件按默认天数"),
    inTransit: n.t("已下单未到货的采购订单：在途数量、预计到货日期"),
    stock: n.t("各仓库现在的库存数量；同一配件多个仓库会相加")
  }[t];
}
function ie(t) {
  return {
    partNo: n.t("配件编码"),
    partName: n.t("配件名称"),
    month: n.t("月份"),
    year: n.t("年份"),
    shipQty: n.t("发货数量"),
    leadDays: n.t("采购提前期（天）"),
    moq: n.t("最小起订量"),
    unitPrice: n.t("单价"),
    supplier: n.t("供应商"),
    transitQty: n.t("在途数量"),
    eta: n.t("预计到货日期"),
    orderNo: n.t("采购订单号"),
    stockQty: n.t("库存数量"),
    warehouse: n.t("仓库")
  }[t] || t;
}
function We(t) {
  return t === "confirmed" ? n.t("已确认") : t === "rejected" ? n.t("已驳回") : n.t("待检验");
}
const O = (t, v = 0) => {
  const c = Number(t);
  return Number.isFinite(c) ? c.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: v }) : "—";
};
function Fe(t = /* @__PURE__ */ new Date()) {
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function ze(t) {
  return t.state === "stagnant" ? "stagnant" : t.state === "redundant" ? "redundant" : t.state === "at_risk" || t.state === "out_of_stock" ? t.hasInTransit ? "shortage_transit" : "shortage_none" : null;
}
function ce(t) {
  return t.actions.map((v, c) => `${c + 1}. ${v.text}`).join(`
`);
}
function de(t, v, c) {
  const $ = t == null || t === "", y = v == null || v === "";
  if ($ || y) return $ === y ? 0 : $ ? 1 : -1;
  const E = typeof t == "number" && typeof v == "number" ? t - v : String(t).localeCompare(String(v));
  return c ? -E : E;
}
function Qe(t, v) {
  const c = v.keyword.trim().toLowerCase(), $ = new Map(K.PA_STATES.map((E, b) => [E, b]));
  return t.filter((E) => (!v.states.length || v.states.includes(E.state)) && (!c || E.partNo.toLowerCase().includes(c) || E.partName.toLowerCase().includes(c) || E.supplier.toLowerCase().includes(c))).sort((E, b) => (v.sort === "state" ? de($.get(E.state), $.get(b.state), v.desc) : de(E[v.sort], b[v.sort], v.desc)) || E.partNo.localeCompare(b.partNo));
}
const Ne = ["pa-feed", "pa-compute", "pa-plan", "pa-replenish", "pa-order"];
function Ee(t) {
  return K.PA_BLOCKING_GROUPS.reduce((v, c) => v + (t.pending[c] || 0), 0);
}
function Re(t, v, c) {
  const $ = !!t?.run && !t.run.stale, y = !!t?.datasets.monthly?.loaded && !!t?.datasets.stock?.loaded, E = t ? Object.values(t.datasets).filter((B) => B?.loaded).length : 0, b = $ && Ee(t) === 0, u = t ? t.lines.filter((B) => B.selected) : [], D = $ && b && !!t.run.replenishConfirmedAt, g = t?.run?.exported, N = D && !!g && g.at >= t.run.replenishConfirmedAt, m = {
    "pa-feed": y ? { state: "done", summary: n.t("已投喂 {n} 份数据", { n: E }) } : { state: "todo" },
    "pa-compute": $ ? { state: "done", summary: n.t("基准日 {p0}，共 {n} 个配件", { p0: t.run.asOf, n: t.run.summary.total }) } : { state: "todo" },
    "pa-plan": b ? { state: "done", summary: n.t("缺货管控计划已全部检验") } : { state: "todo" },
    "pa-replenish": D ? { state: "done", summary: n.t("已确认 {n} 行补库", { n: u.length }) } : { state: "todo" },
    "pa-order": N ? { state: "done", summary: n.t("采购订单已生成：{n} 行", { n: g.lines }) } : { state: "todo" }
  };
  for (const B of Ne)
    v === B ? m[B] = { state: "running" } : c[B] && (m[B] = { state: "failed", error: c[B] });
  return m;
}
function Ie(t) {
  return Ne.find((v) => t[v].state !== "done") || "pa-order";
}
const Ue = ["data-test"], je = { class: "pa-slot__head" }, qe = {
  key: 0,
  class: "ss-chip"
}, Ge = {
  key: 1,
  class: "ss-chip brand"
}, He = {
  key: 2,
  class: "ss-chip warn"
}, Ye = {
  key: 3,
  class: "ss-chip ok"
}, Je = ["onKeydown"], Xe = ["disabled"], Ze = {
  key: 0,
  class: "ss-note info"
}, xe = {
  key: 1,
  class: "ss-muted"
}, et = {
  key: 2,
  class: "ss-note danger"
}, tt = {
  key: 0,
  class: "pa-skip"
}, lt = { class: "ss-note warn" }, nt = {
  key: 0,
  class: "pa-skip__list"
}, st = {
  key: 0,
  class: "ss-muted"
}, ot = /* @__PURE__ */ e.defineComponent({
  __name: "DataSlot",
  props: {
    dataset: {},
    meta: {},
    busy: { type: Boolean },
    optional: { type: Boolean },
    recommended: { type: Boolean }
  },
  emits: ["pick", "update", "sheet", "remove"],
  setup(t, { emit: v }) {
    const c = t, $ = v, y = e.ref(!1), E = e.ref(!1), b = e.computed(() => K.PA_DATASET_ROLES[c.dataset].filter((g) => !(c.meta?.layout === "wide" && ["month", "year", "shipQty"].includes(g.key))).map((g) => ({ key: g.key, label: ie(g.key), required: !!g.required })));
    async function u() {
      if (c.busy) return;
      const g = await A("files.pick", {});
      g[0] && $("pick", g[0]);
    }
    function D(g) {
      if (y.value = !1, c.busy) return;
      const N = w.droppedPaths(g, w.EXCEL_RE);
      N[0] && $("pick", N[0]);
    }
    return (g, N) => (e.openBlock(), e.createElementBlock("section", {
      class: e.normalizeClass(["pa-slot", { loaded: t.meta?.loaded, bad: t.meta && !t.meta.loaded }]),
      "data-test": `pa-slot-${t.dataset}`
    }, [
      e.createElementVNode("header", je, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(e.unref(ge)(t.dataset)),
          1
          /* TEXT */
        ),
        t.optional ? (e.openBlock(), e.createElementBlock(
          "span",
          qe,
          e.toDisplayString(g.$t("可选")),
          1
          /* TEXT */
        )) : t.recommended ? (e.openBlock(), e.createElementBlock(
          "span",
          Ge,
          e.toDisplayString(g.$t("建议投喂")),
          1
          /* TEXT */
        )) : (e.openBlock(), e.createElementBlock(
          "span",
          He,
          e.toDisplayString(g.$t("必须")),
          1
          /* TEXT */
        )),
        t.meta?.loaded ? (e.openBlock(), e.createElementBlock("span", Ye, [
          N[6] || (N[6] = e.createElementVNode(
            "i",
            { class: "ri-check-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(g.$t("已读入 {n} 条", { n: e.unref(O)(t.meta.count) })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode(
          "small",
          null,
          e.toDisplayString(e.unref(Pe)(t.dataset)),
          1
          /* TEXT */
        )
      ]),
      t.meta ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createVNode(Ae, {
            table: t.meta,
            roles: b.value,
            removable: "",
            onUpdate: N[2] || (N[2] = (m) => g.$emit("update", m)),
            onSheet: N[3] || (N[3] = (m) => g.$emit("sheet", m)),
            onRemove: N[4] || (N[4] = (m) => g.$emit("remove"))
          }, null, 8, ["table", "roles"]),
          t.meta.layout === "wide" ? (e.openBlock(), e.createElementBlock("p", Ze, [
            N[9] || (N[9] = e.createElementVNode(
              "i",
              { class: "ri-layout-column-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(g.$t("识别为横表：{n} 个期间列（{a} ~ {b}），已按配件拆成一行一条", { n: t.meta.periodColumns, a: t.meta.periodFrom, b: t.meta.periodTo })),
              1
              /* TEXT */
            )
          ])) : t.meta.loaded && t.meta.periodFrom ? (e.openBlock(), e.createElementBlock(
            "p",
            xe,
            e.toDisplayString(g.$t("数据期间：{a} ~ {b}", { a: t.meta.periodFrom, b: t.meta.periodTo })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          t.meta.loaded ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 3 },
            [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(t.meta.notes, (m, B) => (e.openBlock(), e.createElementBlock("p", {
                  key: B,
                  class: "ss-note"
                }, [
                  N[11] || (N[11] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(m),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              )),
              t.meta.skippedCount ? (e.openBlock(), e.createElementBlock("div", tt, [
                e.createElementVNode("p", lt, [
                  N[12] || (N[12] = e.createElementVNode(
                    "i",
                    { class: "ri-alert-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(g.$t("表里 {a} 行，读入 {b} 条，跳过 {c} 处", { a: e.unref(O)(t.meta.rowCount), b: e.unref(O)(t.meta.count), c: e.unref(O)(t.meta.skippedCount) })),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: N[5] || (N[5] = (m) => E.value = !E.value)
                    },
                    e.toDisplayString(E.value ? g.$t("收起") : g.$t("看跳过的原因")),
                    1
                    /* TEXT */
                  )
                ]),
                E.value ? (e.openBlock(), e.createElementBlock("ul", nt, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(t.meta.skipped, (m, B) => (e.openBlock(), e.createElementBlock("li", { key: B }, [
                      e.createElementVNode(
                        "b",
                        null,
                        e.toDisplayString(g.$t("第 {n} 条数据", { n: m.row })),
                        1
                        /* TEXT */
                      ),
                      e.createTextVNode(
                        e.toDisplayString(m.reason),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  t.meta.skippedCount > t.meta.skipped.length ? (e.openBlock(), e.createElementBlock(
                    "li",
                    st,
                    e.toDisplayString(g.$t("…… 其余 {n} 处没有列出", { n: t.meta.skippedCount - t.meta.skipped.length })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0)
              ])) : e.createCommentVNode("v-if", !0)
            ],
            64
            /* STABLE_FRAGMENT */
          )) : (e.openBlock(), e.createElementBlock("p", et, [
            N[10] || (N[10] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(g.$t("这份表还没有读入：{p0} 没有对应的列，请在上面选好", { p0: t.meta.missing.map(e.unref(ie)).join("、") })),
              1
              /* TEXT */
            )
          ]))
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock("div", {
        key: 0,
        class: e.normalizeClass(["pa-drop", { over: y.value }]),
        role: "button",
        tabindex: "0",
        onClick: u,
        onKeydown: e.withKeys(e.withModifiers(u, ["prevent"]), ["enter"]),
        onDragover: N[0] || (N[0] = e.withModifiers((m) => y.value = !0, ["prevent"])),
        onDragleave: N[1] || (N[1] = e.withModifiers((m) => y.value = !1, ["prevent"])),
        onDrop: e.withModifiers(D, ["prevent"])
      }, [
        N[8] || (N[8] = e.createElementVNode(
          "i",
          { class: "ri-file-excel-2-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(g.$t("把 Excel / CSV 拖到这里，或点击选择")),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm ghost",
          disabled: t.busy,
          onClick: e.withModifiers(u, ["stop"])
        }, [
          N[7] || (N[7] = e.createElementVNode(
            "i",
            { class: "ri-folder-open-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(g.$t("选择文件")),
            1
            /* TEXT */
          )
        ], 8, Xe)
      ], 42, Je))
    ], 10, Ue));
  }
}), z = (t, v) => {
  const c = t.__vccOpts || t;
  for (const [$, y] of v)
    c[$] = y;
  return c;
}, at = /* @__PURE__ */ z(ot, [["__scopeId", "data-v-45ab2081"]]), rt = { class: "pa-rt" }, it = { class: "ss-actions" }, ct = ["placeholder"], dt = ["onClick"], ut = { class: "ss-muted" }, mt = { class: "ss-table-wrap" }, pt = {
  class: "ss-table",
  "data-test": "pa-result-table"
}, yt = ["onClick"], kt = ["data-test", "onClick"], vt = { class: "ss-muted" }, ht = { class: "num" }, gt = { class: "num" }, Nt = { class: "num" }, Et = { class: "num" }, ft = { class: "num" }, Vt = {
  key: 0,
  class: "ss-muted"
}, $t = { class: "num" }, bt = {
  key: 0,
  class: "pa-rt__basis"
}, St = ["colspan"], _t = {
  key: 0,
  class: "ss-muted"
}, Dt = { key: 0 }, Bt = ["colspan"], Tt = {
  key: 0,
  class: "ss-actions"
}, Ct = ["disabled"], wt = { class: "ss-muted" }, Lt = ["disabled"], Z = 50, At = /* @__PURE__ */ e.defineComponent({
  __name: "ResultTable",
  props: /* @__PURE__ */ e.mergeModels({
    rows: {},
    counts: {}
  }, {
    states: { default: () => [] },
    statesModifiers: {}
  }),
  emits: ["update:states"],
  setup(t) {
    const v = t, c = e.useModel(t, "states"), $ = K.PA_STATES, y = [
      { key: "state", title: n.t("状态") },
      { key: "partNo", title: n.t("配件") },
      { key: "stockQty", title: n.t("库存"), num: !0 },
      { key: "inTransitQty", title: n.t("在途"), num: !0 },
      { key: "earliestEta", title: n.t("最早到货") },
      { key: "dailyDemand", title: n.t("日均需求"), num: !0 },
      { key: "coverDays", title: n.t("可用天数"), num: !0 },
      { key: "stockoutDate", title: n.t("断货日") },
      { key: "leadDays", title: n.t("提前期"), num: !0 },
      { key: "suggestQty", title: n.t("建议补库"), num: !0 }
    ], E = e.ref(""), b = e.ref("state"), u = e.ref(!1), D = e.ref(1), g = e.ref(/* @__PURE__ */ new Set()), N = e.computed(() => Qe(v.rows, { states: c.value, keyword: E.value, sort: b.value, desc: u.value })), m = e.computed(() => Math.max(1, Math.ceil(N.value.length / Z))), B = e.computed(() => N.value.slice((D.value - 1) * Z, D.value * Z));
    e.watch([E, c, b, u, () => v.rows], () => {
      D.value = 1;
    });
    function k(S) {
      b.value === S ? u.value = !u.value : (b.value = S, u.value = !1);
    }
    function l(S) {
      c.value = c.value.includes(S) ? c.value.filter((T) => T !== S) : [...c.value, S];
    }
    function o() {
      c.value = [], E.value = "";
    }
    function p(S) {
      const T = new Set(g.value);
      T.has(S) ? T.delete(S) : T.add(S), g.value = T;
    }
    return (S, T) => (e.openBlock(), e.createElementBlock("div", rt, [
      e.createElementVNode("div", it, [
        e.withDirectives(e.createElementVNode("input", {
          "onUpdate:modelValue": T[0] || (T[0] = (f) => E.value = f),
          type: "search",
          class: "pa-rt__search",
          placeholder: S.$t("按配件编码、名称、供应商筛选"),
          "data-test": "pa-result-search"
        }, null, 8, ct), [
          [e.vModelText, E.value]
        ]),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(e.unref($), (f) => (e.openBlock(), e.createElementBlock("button", {
            key: f,
            type: "button",
            class: e.normalizeClass(["pa-rt__chip", [e.unref(Q)(f), { on: c.value.includes(f) }]]),
            onClick: (a) => l(f)
          }, e.toDisplayString(e.unref(P)(f)) + " " + e.toDisplayString(t.counts[f]), 11, dt))),
          128
          /* KEYED_FRAGMENT */
        )),
        c.value.length || E.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: o
          },
          e.toDisplayString(S.$t("清除筛选")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0),
        T[3] || (T[3] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          ut,
          e.toDisplayString(S.$t("共 {n} 个配件", { n: N.value.length })),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("div", mt, [
        e.createElementVNode("table", pt, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              T[4] || (T[4] = e.createElementVNode(
                "th",
                null,
                null,
                -1
                /* CACHED */
              )),
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(y, (f) => e.createElementVNode("th", {
                  key: f.key,
                  class: e.normalizeClass({ num: f.num, sortable: !0 }),
                  onClick: (a) => k(f.key)
                }, [
                  e.createTextVNode(
                    e.toDisplayString(f.title),
                    1
                    /* TEXT */
                  ),
                  b.value === f.key ? (e.openBlock(), e.createElementBlock(
                    "i",
                    {
                      key: 0,
                      class: e.normalizeClass(u.value ? "ri-arrow-down-s-fill" : "ri-arrow-up-s-fill")
                    },
                    null,
                    2
                    /* CLASS */
                  )) : e.createCommentVNode("v-if", !0)
                ], 10, yt)),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ]),
          e.createElementVNode("tbody", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(B.value, (f) => (e.openBlock(), e.createElementBlock(
                e.Fragment,
                {
                  key: f.partNo
                },
                [
                  e.createElementVNode(
                    "tr",
                    {
                      class: e.normalizeClass({ bad: f.state === "out_of_stock" })
                    },
                    [
                      e.createElementVNode("td", null, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          "data-test": `pa-basis-${f.partNo}`,
                          onClick: (a) => p(f.partNo)
                        }, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(g.value.has(f.partNo) ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createTextVNode(
                            e.toDisplayString(S.$t("算式依据")),
                            1
                            /* TEXT */
                          )
                        ], 8, kt)
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", e.unref(Q)(f.state)])
                          },
                          e.toDisplayString(e.unref(P)(f.state)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(f.partNo),
                          1
                          /* TEXT */
                        ),
                        T[5] || (T[5] = e.createTextVNode()),
                        e.createElementVNode(
                          "span",
                          vt,
                          e.toDisplayString(f.partName),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        ht,
                        e.toDisplayString(e.unref(O)(f.stockQty)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        gt,
                        e.toDisplayString(f.inTransitQty ? e.unref(O)(f.inTransitQty) : "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(f.earliestEta || "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Nt,
                        e.toDisplayString(e.unref(O)(f.dailyDemand, 2)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Et,
                        e.toDisplayString(f.coverDays === null ? "—" : e.unref(O)(f.coverDays, 1)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(f.stockoutDate || "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", ft, [
                        e.createTextVNode(
                          e.toDisplayString(f.leadDays),
                          1
                          /* TEXT */
                        ),
                        f.leadDaysDefaulted ? (e.openBlock(), e.createElementBlock(
                          "span",
                          Vt,
                          e.toDisplayString(S.$t("（默认）")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode(
                        "td",
                        $t,
                        e.toDisplayString(f.suggestQty ? e.unref(O)(f.suggestQty) : "—"),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  ),
                  g.value.has(f.partNo) ? (e.openBlock(), e.createElementBlock("tr", bt, [
                    e.createElementVNode("td", {
                      colspan: y.length + 1
                    }, [
                      e.createElementVNode("ol", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(f.basis, (a, _) => (e.openBlock(), e.createElementBlock(
                            "li",
                            { key: _ },
                            e.toDisplayString(a),
                            1
                            /* TEXT */
                          ))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ]),
                      f.actions.length ? (e.openBlock(), e.createElementBlock(
                        "p",
                        _t,
                        e.toDisplayString(S.$t("建议举措：")) + e.toDisplayString(f.actions.map((a) => a.text).join(S.$t("；"))),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ], 8, St)
                  ])) : e.createCommentVNode("v-if", !0)
                ],
                64
                /* STABLE_FRAGMENT */
              ))),
              128
              /* KEYED_FRAGMENT */
            )),
            B.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Dt, [
              e.createElementVNode("td", {
                colspan: y.length + 1,
                class: "ss-muted"
              }, e.toDisplayString(S.$t("没有符合条件的配件")), 9, Bt)
            ]))
          ])
        ])
      ]),
      m.value > 1 ? (e.openBlock(), e.createElementBlock("div", Tt, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: D.value <= 1,
          onClick: T[1] || (T[1] = (f) => D.value -= 1)
        }, [
          T[6] || (T[6] = e.createElementVNode(
            "i",
            { class: "ri-arrow-left-s-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(S.$t("上一页")),
            1
            /* TEXT */
          )
        ], 8, Ct),
        e.createElementVNode(
          "span",
          wt,
          e.toDisplayString(S.$t("第 {a} / {b} 页", { a: D.value, b: m.value })),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: D.value >= m.value,
          onClick: T[2] || (T[2] = (f) => D.value += 1)
        }, [
          e.createTextVNode(
            e.toDisplayString(S.$t("下一页")),
            1
            /* TEXT */
          ),
          T[7] || (T[7] = e.createElementVNode(
            "i",
            { class: "ri-arrow-right-s-line" },
            null,
            -1
            /* CACHED */
          ))
        ], 8, Lt)
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Ot = /* @__PURE__ */ z(At, [["__scopeId", "data-v-cc15c054"]]), Mt = { class: "pa-plan" }, Kt = ["data-test"], Pt = { class: "pa-plan__head" }, Wt = ["onClick"], Ft = { class: "ss-chip" }, zt = {
  key: 1,
  class: "ss-chip ok"
}, Qt = {
  key: 2,
  class: "ss-muted"
}, Rt = ["disabled", "data-test", "onClick"], It = { class: "ss-muted pa-plan__hint" }, Ut = {
  key: 0,
  class: "ss-empty"
}, jt = { class: "pa-item__head" }, qt = { class: "ss-muted" }, Gt = ["value", "rows", "disabled", "aria-label", "data-test", "onChange"], Ht = { class: "pa-item__ops" }, Yt = ["value", "placeholder", "disabled", "onChange"], Jt = ["onClick"], Xt = ["disabled", "onClick"], Zt = ["disabled", "data-test", "onClick"], xt = ["disabled", "data-test", "onClick"], el = ["onClick"], I = 20, tl = /* @__PURE__ */ e.defineComponent({
  __name: "PlanReview",
  props: {
    results: {},
    reviews: {},
    pending: {},
    busy: { type: Boolean }
  },
  emits: ["set", "bulk"],
  setup(t, { emit: v }) {
    const c = t, $ = v, y = K.PA_PLAN_GROUPS, E = e.reactive({ shortage_none: !1, shortage_transit: !1, stagnant: !0, redundant: !0 }), b = e.reactive({ shortage_none: I, shortage_transit: I, stagnant: I, redundant: I }), u = (k) => K.PA_BLOCKING_GROUPS.includes(k), D = (k) => c.reviews[k.partNo]?.status || "pending", g = (k) => c.reviews[k.partNo]?.text || ce(k), N = e.computed(() => {
      const k = { shortage_none: [], shortage_transit: [], stagnant: [], redundant: [] };
      for (const l of c.results) {
        const o = ze(l);
        o && k[o].push(l);
      }
      for (const l of y)
        k[l].sort((o, p) => (o.state === p.state ? 0 : o.state === "out_of_stock" ? -1 : p.state === "out_of_stock" ? 1 : 0) || (o.stockoutDate || "9999").localeCompare(p.stockoutDate || "9999") || o.partNo.localeCompare(p.partNo));
      return k;
    });
    function m(k) {
      const l = [n.t("库存 {n}", { n: O(k.stockQty) })];
      return k.inTransitQty && l.push(n.t("在途 {n}，最早 {p0} 到", { n: O(k.inTransitQty), p0: k.earliestEta })), k.stockoutDate && l.push(n.t("断货日 {p0}", { p0: k.stockoutDate })), k.lastShipMonth && (k.state === "stagnant" || k.state === "redundant") && l.push(n.t("最近发货 {p0}", { p0: k.lastShipMonth })), k.suggestQty && l.push(n.t("建议补库 {n}", { n: O(k.suggestQty) })), l.join(" · ");
    }
    function B(k, l) {
      const o = l.trim();
      $("set", [{ partNo: k.partNo, text: o === ce(k) ? "" : o }]);
    }
    return (k, l) => (e.openBlock(), e.createElementBlock("div", Mt, [
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(e.unref(y), (o) => (e.openBlock(), e.createElementBlock("section", {
          key: o,
          class: e.normalizeClass(["pa-plan__group", { blocking: u(o) }]),
          "data-test": `pa-group-${o}`
        }, [
          e.createElementVNode("header", Pt, [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link",
              onClick: (p) => E[o] = !E[o]
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(E[o] ? "ri-arrow-right-s-line" : "ri-arrow-down-s-line")
                },
                null,
                2
                /* CLASS */
              )
            ], 8, Wt),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(e.unref(Me)(o)),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              Ft,
              e.toDisplayString(k.$t("{n} 个配件", { n: N.value[o].length })),
              1
              /* TEXT */
            ),
            t.pending[o] ? (e.openBlock(), e.createElementBlock(
              "span",
              {
                key: 0,
                class: e.normalizeClass(["ss-chip", u(o) ? "warn" : ""])
              },
              e.toDisplayString(k.$t("还有 {n} 个没检验", { n: t.pending[o] })),
              3
              /* TEXT, CLASS */
            )) : N.value[o].length ? (e.openBlock(), e.createElementBlock("span", zt, [
              l[0] || (l[0] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.$t("已全部检验")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            u(o) ? (e.openBlock(), e.createElementBlock(
              "span",
              Qt,
              e.toDisplayString(k.$t("检验完才能进补库清单")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            l[2] || (l[2] = e.createElementVNode(
              "span",
              { class: "grow" },
              null,
              -1
              /* CACHED */
            )),
            t.pending[o] ? (e.openBlock(), e.createElementBlock("button", {
              key: 3,
              type: "button",
              class: "ss-btn sm primary",
              disabled: t.busy,
              "data-test": `pa-bulk-${o}`,
              onClick: (p) => k.$emit("bulk", o, "confirmed")
            }, [
              l[1] || (l[1] = e.createElementVNode(
                "i",
                { class: "ri-check-double-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.$t("本组未检验的全部确认")),
                1
                /* TEXT */
              )
            ], 8, Rt)) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode(
            "p",
            It,
            e.toDisplayString(e.unref(Ke)(o)),
            1
            /* TEXT */
          ),
          E[o] ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              N.value[o].length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "p",
                Ut,
                e.toDisplayString(k.$t("这一类没有配件")),
                1
                /* TEXT */
              )),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(N.value[o].slice(0, b[o]), (p) => (e.openBlock(), e.createElementBlock(
                  "article",
                  {
                    key: p.partNo,
                    class: e.normalizeClass(["pa-item", D(p)])
                  },
                  [
                    e.createElementVNode("div", jt, [
                      e.createElementVNode(
                        "b",
                        null,
                        e.toDisplayString(p.partNo),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(p.partName),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", e.unref(Q)(p.state)])
                        },
                        e.toDisplayString(e.unref(P)(p.state)),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createElementVNode(
                        "span",
                        qt,
                        e.toDisplayString(m(p)),
                        1
                        /* TEXT */
                      ),
                      l[3] || (l[3] = e.createElementVNode(
                        "span",
                        { class: "grow" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", { ok: D(p) === "confirmed", bad: D(p) === "rejected" }])
                        },
                        e.toDisplayString(e.unref(We)(D(p))),
                        3
                        /* TEXT, CLASS */
                      )
                    ]),
                    e.createElementVNode("textarea", {
                      value: g(p),
                      rows: Math.min(6, Math.max(2, p.actions.length)),
                      disabled: t.busy,
                      "aria-label": k.$t("行动计划"),
                      "data-test": `pa-plan-text-${p.partNo}`,
                      onChange: (S) => B(p, S.target.value)
                    }, null, 40, Gt),
                    e.createElementVNode("div", Ht, [
                      e.createElementVNode("input", {
                        type: "text",
                        value: t.reviews[p.partNo]?.remark || "",
                        placeholder: k.$t("备注（可不填）"),
                        disabled: t.busy,
                        onChange: (S) => k.$emit("set", [{ partNo: p.partNo, remark: S.target.value }])
                      }, null, 40, Yt),
                      t.reviews[p.partNo]?.text ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-link",
                        onClick: (S) => k.$emit("set", [{ partNo: p.partNo, text: "" }])
                      }, e.toDisplayString(k.$t("恢复系统建议")), 9, Jt)) : e.createCommentVNode("v-if", !0),
                      l[6] || (l[6] = e.createElementVNode(
                        "span",
                        { class: "grow" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      D(p) !== "pending" ? (e.openBlock(), e.createElementBlock("button", {
                        key: 1,
                        type: "button",
                        class: "ss-link",
                        disabled: t.busy,
                        onClick: (S) => k.$emit("set", [{ partNo: p.partNo, status: "pending" }])
                      }, e.toDisplayString(k.$t("撤回重新检验")), 9, Xt)) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm danger",
                        disabled: t.busy || D(p) === "rejected",
                        "data-test": `pa-reject-${p.partNo}`,
                        onClick: (S) => k.$emit("set", [{ partNo: p.partNo, status: "rejected" }])
                      }, [
                        l[4] || (l[4] = e.createElementVNode(
                          "i",
                          { class: "ri-close-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(k.$t("驳回")),
                          1
                          /* TEXT */
                        )
                      ], 8, Zt),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm primary",
                        disabled: t.busy || D(p) === "confirmed",
                        "data-test": `pa-confirm-${p.partNo}`,
                        onClick: (S) => k.$emit("set", [{ partNo: p.partNo, status: "confirmed" }])
                      }, [
                        l[5] || (l[5] = e.createElementVNode(
                          "i",
                          { class: "ri-check-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(k.$t("确认")),
                          1
                          /* TEXT */
                        )
                      ], 8, xt)
                    ])
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              )),
              N.value[o].length > b[o] ? (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn sm",
                onClick: (p) => b[o] += I
              }, e.toDisplayString(k.$t("再显示 {a} 个（还有 {b} 个）", { a: Math.min(I, N.value[o].length - b[o]), b: N.value[o].length - b[o] })), 9, el)) : e.createCommentVNode("v-if", !0)
            ],
            64
            /* STABLE_FRAGMENT */
          ))
        ], 10, Kt))),
        128
        /* KEYED_FRAGMENT */
      ))
    ]));
  }
}), ll = /* @__PURE__ */ z(tl, [["__scopeId", "data-v-811e59b6"]]), nl = { class: "ss-module" }, sl = { class: "ss-steps" }, ol = { class: "ss-actions" }, al = ["disabled"], rl = { class: "ss-muted" }, il = {
  key: 0,
  class: "ss-file-out"
}, cl = { class: "pa-slots" }, dl = {
  key: 1,
  class: "ss-note warn"
}, ul = {
  key: 2,
  class: "ss-note warn"
}, ml = { class: "ss-actions" }, pl = { class: "ss-field inline" }, yl = ["disabled"], kl = {
  key: 0,
  class: "ss-muted"
}, vl = {
  key: 1,
  class: "ss-muted"
}, hl = {
  key: 0,
  class: "ss-note warn",
  "data-test": "pa-stale"
}, gl = ["data-test", "onClick"], Nl = { class: "pa-state total" }, El = {
  key: 0,
  class: "ss-note warn"
}, fl = {
  key: 1,
  class: "ss-note"
}, Vl = {
  key: 0,
  class: "ss-empty"
}, $l = {
  key: 0,
  class: "ss-note warn",
  "data-test": "pa-plan-left"
}, bl = {
  key: 1,
  class: "ss-note ok"
}, Sl = {
  key: 0,
  class: "ss-empty"
}, _l = {
  key: 0,
  class: "ss-empty",
  "data-test": "pa-lines-empty"
}, Dl = { class: "ss-actions" }, Bl = ["disabled"], Tl = ["disabled"], Cl = { class: "ss-muted" }, wl = { class: "ss-table-wrap" }, Ll = {
  class: "ss-table",
  "data-test": "pa-lines"
}, Al = { class: "num" }, Ol = { class: "num" }, Ml = ["checked", "disabled", "data-test", "onChange"], Kl = { class: "ss-muted" }, Pl = { class: "num" }, Wl = ["value", "disabled", "data-test", "onChange"], Fl = {
  key: 0,
  class: "pa-changed"
}, zl = ["onClick"], Ql = ["value", "disabled", "placeholder", "onChange"], Rl = ["value", "disabled", "onChange"], Il = ["value", "disabled", "placeholder", "onChange"], Ul = { class: "num" }, jl = { class: "total" }, ql = { colspan: "3" }, Gl = { class: "num" }, Hl = { class: "num" }, Yl = {
  key: 0,
  class: "ss-muted"
}, Jl = { class: "ss-actions" }, Xl = ["disabled"], Zl = {
  key: 0,
  class: "ss-muted"
}, xl = {
  key: 1,
  class: "ss-muted"
}, en = { class: "ss-note info" }, tn = { class: "ss-actions" }, ln = ["disabled"], nn = ["disabled"], sn = {
  key: 0,
  class: "ss-muted"
}, on = {
  key: 1,
  class: "ss-muted"
}, an = {
  key: 0,
  class: "ss-note warn"
}, rn = ["title"], cn = ["onClick"], dn = ["onClick"], un = {
  key: 1,
  class: "ss-file-out"
}, mn = ["title"], pn = /* @__PURE__ */ e.defineComponent({
  __name: "RunTab",
  setup(t) {
    const v = U.useNotificationStore(), c = W, $ = x, y = K.PA_DATASETS, E = K.PA_STATES, b = [
      { key: "pa-feed", title: n.t("投喂数据"), hint: n.t("历史发货、采购提前期、采购在途、实时库存；自动认列，认不准的你来改") },
      { key: "pa-compute", title: n.t("运算库存状态"), hint: n.t("按公式算出每个配件是呆滞、冗余、健康、将缺货还是已缺货，每条都带算式") },
      { key: "pa-plan", title: n.t("检验行动计划"), hint: n.t("呆滞处理建议、有采购在途和无采购在途两类缺货管控举措，逐条确认、修改或驳回") },
      { key: "pa-replenish", title: n.t("确认补库清单"), hint: n.t("只收缺货计划已确认且需要补库的配件；数量、供应商、到货日可以改") },
      { key: "pa-order", title: n.t("转采购订单"), hint: n.t("由你点击生成采购订单文件，交给采购系统；应用不代为提交") }
    ], u = e.ref(""), D = e.ref({}), g = e.computed(() => Re(c.value, u.value, D.value)), N = e.computed(() => Ie(g.value)), m = e.computed(() => c.value?.run || null), B = e.computed(() => !!m.value && !m.value.stale), k = e.computed(() => !!c.value?.datasets.monthly?.loaded && !!c.value?.datasets.stock?.loaded), l = e.computed(() => c.value && B.value ? Ee(c.value) : 0), o = e.computed(() => c.value?.lines || []), p = e.computed(() => B.value && !l.value && !!m.value?.replenishConfirmedAt), S = e.computed(() => {
      const s = o.value.filter((d) => d.selected);
      return {
        lines: s.length,
        qty: s.reduce((d, r) => d + r.qty, 0),
        amount: Math.round(s.reduce((d, r) => d + (r.amount ?? 0), 0) * 100) / 100,
        unpriced: s.filter((d) => d.amount === null).length
      };
    }), T = e.ref(Fe()), f = e.ref([]), a = e.ref(""), _ = e.ref("");
    e.watch(() => m.value?.id, () => {
      m.value && (T.value = m.value.asOf), f.value = [], _.value = "";
    }, { immediate: !0 });
    let h = !1;
    e.watch(N, (s, d) => {
      if (!h) {
        h = !0;
        return;
      }
      d && b.findIndex((r) => r.key === s) > b.findIndex((r) => r.key === d) && w.scrollToStep(s);
    });
    async function L(s, d) {
      u.value = s, D.value = { ...D.value, [s]: "" };
      try {
        return await d(), await F(), !0;
      } catch (r) {
        return D.value = { ...D.value, [s]: w.errorMessage(r) }, F().catch(() => {
        }), w.scrollToStep(s), !1;
      } finally {
        u.value = "";
      }
    }
    function j(s) {
      w.scrollToStep(s);
    }
    const H = (s) => s.slice(0, 8).join(n.t("、")) + (s.length > 8 ? " …" : "");
    function i(s, d = !1) {
      te(s, d).catch((r) => v.error(w.errorMessage(r)));
    }
    function V(s, d, r, M) {
      L("pa-feed", () => A("data.import", { dataset: s, path: d, sheet: r, mapping: M || null }));
    }
    function C(s) {
      L("pa-feed", () => A("data.clear", { dataset: s }));
    }
    function X() {
      L("pa-feed", async () => {
        const s = await A("data.demo");
        a.value = s.dir;
      });
    }
    function Ve() {
      L("pa-compute", () => A("compute.run", { asOf: T.value }));
    }
    function $e(s) {
      f.value = f.value.includes(s) ? f.value.filter((d) => d !== s) : [...f.value, s];
    }
    function be(s) {
      L("pa-plan", () => A("review.set", { items: s }));
    }
    function Se(s, d) {
      L("pa-plan", () => A("review.bulk", { group: s, status: d, onlyPending: !0 }));
    }
    function R(s, d) {
      L("pa-replenish", () => A("replenish.set", { items: [{ partNo: s, ...d }] }));
    }
    function _e(s, d) {
      const r = Number(d.value);
      if (!Number.isInteger(r) || r <= 0) {
        d.value = String(s.qty), D.value = { ...D.value, "pa-replenish": n.t("配件 {p0} 的下单数量要是大于 0 的整数", { p0: s.partNo }) };
        return;
      }
      R(s.partNo, { qty: r });
    }
    function De(s, d) {
      R(s, { unitPrice: d.trim() === "" ? null : Number(d) });
    }
    function se(s) {
      L("pa-replenish", () => A("replenish.set", { items: o.value.map((d) => ({ partNo: d.partNo, selected: s })) }));
    }
    function Be() {
      L("pa-replenish", () => A("replenish.confirm"));
    }
    function Te() {
      L("pa-order", async () => {
        await A("order.export"), _.value = "";
      });
    }
    function Ce() {
      L("pa-order", async () => {
        _.value = await A("plan.export");
      });
    }
    return (s, d) => (e.openBlock(), e.createElementBlock("div", nl, [
      e.createVNode(Le, {
        title: s.$t("配件预警与补库"),
        metas: b,
        runtime: g.value,
        "current-key": N.value,
        onJump: j
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", sl, [
        e.createCommentVNode(" 1 投喂数据 "),
        e.createVNode(q, {
          "step-key": "pa-feed",
          index: 0,
          title: b[0].title,
          hint: b[0].hint,
          runtime: g.value["pa-feed"],
          "is-current": N.value === "pa-feed"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", ol, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!u.value,
                "data-test": "pa-demo",
                onClick: X
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(u.value === "pa-feed" ? "ri-loader-4-line spin" : "ri-file-download-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(s.$t("生成示例数据")),
                  1
                  /* TEXT */
                )
              ], 8, al),
              e.createElementVNode(
                "span",
                rl,
                e.toDisplayString(s.$t("没有现成的表？点一下生成 60 个配件的示例数据并自动投喂，文件放在输出目录的「示例数据」文件夹里")),
                1
                /* TEXT */
              )
            ]),
            a.value ? (e.openBlock(), e.createElementBlock("p", il, [
              d[7] || (d[7] = e.createElementVNode(
                "i",
                { class: "ri-folder-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "code",
                null,
                e.toDisplayString(a.value),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: d[0] || (d[0] = (r) => i(a.value))
                },
                e.toDisplayString(s.$t("打开文件夹")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", cl, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(y), (r) => (e.openBlock(), e.createBlock(at, {
                  key: r,
                  dataset: r,
                  meta: e.unref(c)?.datasets[r] || null,
                  busy: !!u.value,
                  optional: r === "yearly",
                  recommended: r === "leadTime" || r === "inTransit",
                  onPick: (M) => V(r, M),
                  onUpdate: (M) => V(r, e.unref(c).datasets[r].path, e.unref(c).datasets[r].sheetName, M),
                  onSheet: (M) => V(r, e.unref(c).datasets[r].path, M),
                  onRemove: (M) => C(r)
                }, null, 8, ["dataset", "meta", "busy", "optional", "recommended", "onPick", "onUpdate", "onSheet", "onRemove"]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            k.value && !e.unref(c)?.datasets.leadTime?.loaded ? (e.openBlock(), e.createElementBlock("p", dl, [
              d[8] || (d[8] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(s.$t("没有投喂采购提前期：所有配件都按默认 {n} 天计算（可在「规则」里改）", { n: e.unref(c)?.settings.rules.defaultLeadDays })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            k.value && !e.unref(c)?.datasets.inTransit?.loaded ? (e.openBlock(), e.createElementBlock("p", ul, [
              d[9] || (d[9] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(s.$t("没有投喂采购在途：所有配件都按没有在途计算")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 2 运算库存状态 "),
        e.createVNode(q, {
          "step-key": "pa-compute",
          index: 1,
          title: b[1].title,
          hint: b[1].hint,
          runtime: g.value["pa-compute"],
          "is-current": N.value === "pa-compute"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", ml, [
              e.createElementVNode("label", pl, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(s.$t("基准日")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": d[1] || (d[1] = (r) => T.value = r),
                    type: "date",
                    "data-test": "pa-asof"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, T.value]
                ])
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!u.value || !k.value,
                "data-test": "pa-compute-run",
                onClick: Ve
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(u.value === "pa-compute" ? "ri-loader-4-line spin" : "ri-calculator-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(m.value ? s.$t("重新运算") : s.$t("运算库存状态")),
                  1
                  /* TEXT */
                )
              ], 8, yl),
              k.value ? m.value && !m.value.stale ? (e.openBlock(), e.createElementBlock(
                "span",
                vl,
                e.toDisplayString(s.$t("上次运算：{p0}", { p0: e.unref(w.fmtDateTime)(m.value.computedAt) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "span",
                kl,
                e.toDisplayString(s.$t("先在第 1 步投喂历史发货（按月）和实时库存")),
                1
                /* TEXT */
              ))
            ]),
            m.value?.stale ? (e.openBlock(), e.createElementBlock("p", hl, [
              d[10] || (d[10] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(s.$t("{p0}，下面的结果已经过期，请重新运算", { p0: m.value.staleReason || s.$t("规则或数据已经改过") })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            m.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode(
                  "div",
                  {
                    class: e.normalizeClass(["pa-states", { stale: m.value.stale }])
                  },
                  [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(E), (r) => (e.openBlock(), e.createElementBlock("button", {
                        key: r,
                        type: "button",
                        class: e.normalizeClass(["pa-state", [e.unref(Q)(r), { on: f.value.includes(r) }]]),
                        "data-test": `pa-state-${r}`,
                        onClick: (M) => $e(r)
                      }, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(e.unref(P)(r)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(m.value.summary.byState[r]),
                          1
                          /* TEXT */
                        )
                      ], 10, gl))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode("div", Nl, [
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(s.$t("建议补库")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(m.value.summary.replenishParts),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "em",
                        null,
                        e.toDisplayString(s.$t("数量 {a}，金额 {b}", { a: e.unref(O)(m.value.summary.replenishQty), b: e.unref(w.fmtMoney)(m.value.summary.replenishAmount) })),
                        1
                        /* TEXT */
                      )
                    ])
                  ],
                  2
                  /* CLASS */
                ),
                m.value.summary.partsWithoutStockRow.length ? (e.openBlock(), e.createElementBlock("p", El, [
                  d[11] || (d[11] = e.createElementVNode(
                    "i",
                    { class: "ri-alert-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(s.$t("{n} 个配件在发货或在途里出现，但库存表里没有，按库存 0 处理：{p0}", { n: m.value.summary.partsWithoutStockRow.length, p0: H(m.value.summary.partsWithoutStockRow) })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                m.value.summary.partsWithDefaultLead.length ? (e.openBlock(), e.createElementBlock("p", fl, [
                  d[12] || (d[12] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(s.$t("{n} 个配件没有采购提前期，用了默认 {d} 天：{p0}", { n: m.value.summary.partsWithDefaultLead.length, d: m.value.rules.defaultLeadDays, p0: H(m.value.summary.partsWithDefaultLead) })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createVNode(Ot, {
                  states: f.value,
                  "onUpdate:states": d[2] || (d[2] = (r) => f.value = r),
                  rows: e.unref($),
                  counts: m.value.summary.byState
                }, null, 8, ["states", "rows", "counts"])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 3 检验行动计划 "),
        e.createVNode(q, {
          "step-key": "pa-plan",
          index: 2,
          title: b[2].title,
          hint: b[2].hint,
          runtime: g.value["pa-plan"],
          "is-current": N.value === "pa-plan"
        }, {
          default: e.withCtx(() => [
            B.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                l.value ? (e.openBlock(), e.createElementBlock("p", $l, [
                  d[13] || (d[13] = e.createElementVNode(
                    "i",
                    { class: "ri-alert-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(s.$t("缺货管控计划还有 {n} 个没有检验，检验完才能进入补库清单", { n: l.value })),
                    1
                    /* TEXT */
                  )
                ])) : (e.openBlock(), e.createElementBlock("p", bl, [
                  d[14] || (d[14] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(s.$t("缺货管控计划已全部检验。呆滞和冗余的处理建议可以随时回来检验，不影响补库")),
                    1
                    /* TEXT */
                  )
                ])),
                e.createVNode(ll, {
                  results: e.unref($),
                  reviews: m.value.reviews,
                  pending: e.unref(c).pending,
                  busy: !!u.value,
                  onSet: be,
                  onBulk: Se
                }, null, 8, ["results", "reviews", "pending", "busy"])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Vl,
              e.toDisplayString(s.$t("运算完成后，这里列出每个配件的行动计划等你检验")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 4 确认补库清单 "),
        e.createVNode(q, {
          "step-key": "pa-replenish",
          index: 3,
          title: b[3].title,
          hint: b[3].hint,
          runtime: g.value["pa-replenish"],
          "is-current": N.value === "pa-replenish"
        }, {
          default: e.withCtx(() => [
            B.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                o.value.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    e.createElementVNode("div", Dl, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        disabled: !!u.value,
                        onClick: d[3] || (d[3] = (r) => se(!0))
                      }, e.toDisplayString(s.$t("全选")), 9, Bl),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        disabled: !!u.value,
                        onClick: d[4] || (d[4] = (r) => se(!1))
                      }, e.toDisplayString(s.$t("全不选")), 9, Tl),
                      e.createElementVNode(
                        "span",
                        Cl,
                        e.toDisplayString(s.$t("下单量默认等于公式建议量，改了会并排显示；期望到货日默认是基准日加采购提前期")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", wl, [
                      e.createElementVNode("table", Ll, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            d[15] || (d[15] = e.createElementVNode(
                              "th",
                              null,
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(s.$t("配件")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(s.$t("状态")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Al,
                              e.toDisplayString(s.$t("公式建议量")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(s.$t("下单量")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(s.$t("供应商")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(s.$t("期望到货日")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(s.$t("单价")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Ol,
                              e.toDisplayString(s.$t("金额")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(s.$t("断货日")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(o.value, (r) => (e.openBlock(), e.createElementBlock(
                              "tr",
                              {
                                key: r.partNo,
                                class: e.normalizeClass({ off: !r.selected })
                              },
                              [
                                e.createElementVNode("td", null, [
                                  e.createElementVNode("input", {
                                    type: "checkbox",
                                    checked: r.selected,
                                    disabled: !!u.value,
                                    "data-test": `pa-line-check-${r.partNo}`,
                                    onChange: (M) => R(r.partNo, { selected: M.target.checked })
                                  }, null, 40, Ml)
                                ]),
                                e.createElementVNode("td", null, [
                                  e.createElementVNode(
                                    "b",
                                    null,
                                    e.toDisplayString(r.partNo),
                                    1
                                    /* TEXT */
                                  ),
                                  d[16] || (d[16] = e.createTextVNode()),
                                  e.createElementVNode(
                                    "span",
                                    Kl,
                                    e.toDisplayString(r.partName),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                e.createElementVNode("td", null, [
                                  e.createElementVNode(
                                    "span",
                                    {
                                      class: e.normalizeClass(["ss-chip", e.unref(Q)(r.state)])
                                    },
                                    e.toDisplayString(e.unref(P)(r.state)),
                                    3
                                    /* TEXT, CLASS */
                                  )
                                ]),
                                e.createElementVNode(
                                  "td",
                                  Pl,
                                  e.toDisplayString(e.unref(O)(r.suggestQty)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode("td", null, [
                                  e.createElementVNode("input", {
                                    type: "number",
                                    min: "1",
                                    step: "1",
                                    class: "pa-qty",
                                    value: r.qty,
                                    disabled: !!u.value,
                                    "data-test": `pa-line-qty-${r.partNo}`,
                                    onChange: (M) => _e(r, M.target)
                                  }, null, 40, Wl),
                                  r.qty !== r.suggestQty ? (e.openBlock(), e.createElementBlock("small", Fl, [
                                    e.createTextVNode(
                                      e.toDisplayString(s.$t("建议 {a}，改为 {b}", { a: e.unref(O)(r.suggestQty), b: e.unref(O)(r.qty) })),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode("button", {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: (M) => R(r.partNo, { qty: r.suggestQty })
                                    }, e.toDisplayString(s.$t("恢复")), 9, zl)
                                  ])) : e.createCommentVNode("v-if", !0)
                                ]),
                                e.createElementVNode("td", null, [
                                  e.createElementVNode("input", {
                                    type: "text",
                                    value: r.supplier,
                                    disabled: !!u.value,
                                    placeholder: s.$t("未知"),
                                    onChange: (M) => R(r.partNo, { supplier: M.target.value })
                                  }, null, 40, Ql)
                                ]),
                                e.createElementVNode("td", null, [
                                  e.createElementVNode("input", {
                                    type: "date",
                                    value: r.expectDate,
                                    disabled: !!u.value,
                                    onChange: (M) => R(r.partNo, { expectDate: M.target.value })
                                  }, null, 40, Rl)
                                ]),
                                e.createElementVNode("td", null, [
                                  e.createElementVNode("input", {
                                    type: "number",
                                    min: "0",
                                    step: "0.01",
                                    class: "pa-qty",
                                    value: r.unitPrice ?? "",
                                    disabled: !!u.value,
                                    placeholder: s.$t("没有"),
                                    onChange: (M) => De(r.partNo, M.target.value)
                                  }, null, 40, Il)
                                ]),
                                e.createElementVNode(
                                  "td",
                                  Ul,
                                  e.toDisplayString(r.amount === null ? "—" : e.unref(w.fmtMoney)(r.amount)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  null,
                                  e.toDisplayString(r.stockoutDate || "—"),
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
                          e.createElementVNode("tr", jl, [
                            d[17] || (d[17] = e.createElementVNode(
                              "td",
                              null,
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createElementVNode(
                              "td",
                              ql,
                              e.toDisplayString(s.$t("已勾选 {a} / {b} 行", { a: S.value.lines, b: o.value.length })),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Gl,
                              e.toDisplayString(e.unref(O)(S.value.qty)),
                              1
                              /* TEXT */
                            ),
                            d[18] || (d[18] = e.createElementVNode(
                              "td",
                              { colspan: "3" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createElementVNode(
                              "td",
                              Hl,
                              e.toDisplayString(e.unref(w.fmtMoney)(S.value.amount)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("td", null, [
                              S.value.unpriced ? (e.openBlock(), e.createElementBlock(
                                "span",
                                Yl,
                                e.toDisplayString(s.$t("{n} 行没有单价，未计入", { n: S.value.unpriced })),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ])
                          ])
                        ])
                      ])
                    ]),
                    e.createElementVNode("div", Jl, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn primary",
                        disabled: !!u.value || !!l.value || !S.value.lines,
                        "data-test": "pa-lines-confirm",
                        onClick: Be
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(u.value === "pa-replenish" ? "ri-loader-4-line spin" : "ri-check-double-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(s.$t("确认补库清单")),
                          1
                          /* TEXT */
                        )
                      ], 8, Xl),
                      l.value ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Zl,
                        e.toDisplayString(s.$t("第 3 步还有 {n} 个缺货计划没检验", { n: l.value })),
                        1
                        /* TEXT */
                      )) : m.value.replenishConfirmedAt ? (e.openBlock(), e.createElementBlock(
                        "span",
                        xl,
                        e.toDisplayString(s.$t("已于 {p0} 确认；再改清单需要重新确认", { p0: e.unref(w.fmtDateTime)(m.value.replenishConfirmedAt) })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : (e.openBlock(), e.createElementBlock(
                  "p",
                  _l,
                  e.toDisplayString(l.value ? s.$t("还没有确认任何需要补库的缺货计划") : s.$t("本次没有需要补库的配件：缺货计划被驳回，或在途数量已经够用")),
                  1
                  /* TEXT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Sl,
              e.toDisplayString(s.$t("缺货管控计划确认后，需要补库的配件会出现在这里")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 5 转采购订单 "),
        e.createVNode(q, {
          "step-key": "pa-order",
          index: 4,
          title: b[4].title,
          hint: b[4].hint,
          runtime: g.value["pa-order"],
          "is-current": N.value === "pa-order"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", en, [
              d[19] || (d[19] = e.createElementVNode(
                "i",
                { class: "ri-shield-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(s.$t("生成的是给采购系统录入或导入用的 Excel 文件。应用不会向任何系统提交订单，也不会发给供应商；下不下单、什么时候下，由采购人员决定。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", tn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!u.value || !p.value,
                "data-test": "pa-order-export",
                onClick: Te
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(u.value === "pa-order" ? "ri-loader-4-line spin" : "ri-file-list-3-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(s.$t("生成采购订单")),
                  1
                  /* TEXT */
                )
              ], 8, ln),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!u.value || !B.value,
                "data-test": "pa-plan-export",
                onClick: Ce
              }, [
                d[20] || (d[20] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(s.$t("只导出库存状态与行动计划")),
                  1
                  /* TEXT */
                )
              ], 8, nn),
              p.value ? (e.openBlock(), e.createElementBlock(
                "span",
                on,
                e.toDisplayString(s.$t("将生成 {a} 行，数量 {b}，金额 {c}", { a: S.value.lines, b: e.unref(O)(S.value.qty), c: e.unref(w.fmtMoney)(S.value.amount) })),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "span",
                sn,
                e.toDisplayString(s.$t("先在第 4 步确认补库清单")),
                1
                /* TEXT */
              ))
            ]),
            m.value?.exported ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                m.value.exported.at < (m.value.replenishConfirmedAt || "") || !m.value.replenishConfirmedAt || m.value.stale ? (e.openBlock(), e.createElementBlock("p", an, [
                  d[21] || (d[21] = e.createElementVNode(
                    "i",
                    { class: "ri-alert-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(s.$t("下面是 {p0} 生成的文件；之后清单或数据改过，需要的话重新生成", { p0: e.unref(w.fmtDateTime)(m.value.exported.at) })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList([m.value.exported.orderFile, m.value.exported.planFile], (r) => (e.openBlock(), e.createElementBlock("div", {
                    key: r,
                    class: "ss-file-out"
                  }, [
                    d[22] || (d[22] = e.createElementVNode(
                      "i",
                      { class: "ri-file-excel-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode("code", { title: r }, e.toDisplayString(r), 9, rn),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      onClick: (M) => i(r)
                    }, e.toDisplayString(s.$t("打开文件")), 9, cn),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      onClick: (M) => i(r, !0)
                    }, e.toDisplayString(s.$t("打开所在文件夹")), 9, dn)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0),
            _.value ? (e.openBlock(), e.createElementBlock("div", un, [
              d[23] || (d[23] = e.createElementVNode(
                "i",
                { class: "ri-file-excel-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("code", { title: _.value }, e.toDisplayString(_.value), 9, mn),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn sm",
                  onClick: d[5] || (d[5] = (r) => i(_.value))
                },
                e.toDisplayString(s.$t("打开文件")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn sm",
                  onClick: d[6] || (d[6] = (r) => i(_.value, !0))
                },
                e.toDisplayString(s.$t("打开所在文件夹")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"])
      ])
    ]));
  }
}), yn = /* @__PURE__ */ z(pn, [["__scopeId", "data-v-cbfef771"]]), le = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/core"];
if (!le) throw new Error("宿主模块未就绪：npm:echarts/core");
le.default;
const ne = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/renderers"];
if (!ne) throw new Error("宿主模块未就绪：npm:echarts/renderers");
ne.default;
const J = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/charts"];
if (!J) throw new Error("宿主模块未就绪：npm:echarts/charts");
J.default;
const G = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/components"];
if (!G) throw new Error("宿主模块未就绪：npm:echarts/components");
G.default;
const fe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-echarts"];
if (!fe) throw new Error("宿主模块未就绪：npm:vue-echarts");
const ue = fe.default, kn = { class: "pa-board" }, vn = {
  key: 0,
  class: "ss-empty"
}, hn = { class: "ss-panel" }, gn = { class: "pa-board__head" }, Nn = { class: "ss-muted" }, En = { class: "ss-kpis" }, fn = { key: 0 }, Vn = { class: "ss-kpi accent" }, $n = {
  key: 0,
  class: "ss-note warn"
}, bn = { class: "pa-board__cols" }, Sn = { class: "ss-panel" }, _n = { class: "ss-muted" }, Dn = {
  key: 0,
  class: "ss-empty"
}, Bn = {
  key: 1,
  class: "ss-table-wrap"
}, Tn = { class: "ss-table" }, Cn = { class: "num" }, wn = { class: "num" }, Ln = { class: "num" }, An = { class: "ss-muted" }, On = { class: "num" }, Mn = { class: "num" }, Kn = { class: "num" }, Pn = { class: "ss-panel" }, Wn = { class: "pa-board__head" }, Fn = { class: "ss-muted" }, zn = {
  key: 0,
  class: "ss-empty"
}, Qn = {
  key: 1,
  class: "ss-table-wrap"
}, Rn = { class: "ss-table" }, In = { class: "num" }, Un = { class: "num" }, jn = { class: "num" }, qn = { class: "ss-muted" }, Gn = { class: "num" }, Hn = { class: "num" }, Yn = { class: "num" }, Jn = { class: "ss-panel" }, Xn = { class: "pa-board__head" }, Zn = { class: "ss-muted" }, xn = {
  key: 1,
  class: "ss-muted"
}, es = { class: "ss-table-wrap" }, ts = { class: "ss-table" }, ls = { class: "num" }, ns = { class: "num" }, ss = { class: "num" }, os = { class: "num" }, as = ["title", "onClick"], rs = { class: "pa-note" }, me = 12, is = /* @__PURE__ */ e.defineComponent({
  __name: "BoardTab",
  setup(t) {
    le.use([ne.CanvasRenderer, J.BarChart, J.LineChart, G.GridComponent, G.LegendComponent, G.TooltipComponent]);
    const v = U.useNotificationStore(), c = K.PA_STATES, $ = e.computed(() => W.value?.latest || null), y = e.computed(() => W.value?.history || []), E = e.computed(() => y.value[0] || null), b = e.computed(() => $.value?.summary.total || 0), u = e.ref(!0), D = e.ref(20), g = (a) => `${Math.round(a / Math.max(1, b.value) * 1e3) / 10}%`, N = (a) => a.split(/[\\/]/).pop() || a, m = e.computed(() => Y.value.filter((a) => a.state === "out_of_stock" || a.state === "at_risk").sort((a, _) => (a.state === _.state ? 0 : a.state === "out_of_stock" ? -1 : 1) || (a.stockoutDate || "9999").localeCompare(_.stockoutDate || "9999") || a.partNo.localeCompare(_.partNo)).slice(0, me)), B = e.computed(() => {
      const a = (_) => _.unitPrice === null ? -1 : _.stockQty * _.unitPrice;
      return Y.value.filter((_) => _.state === "stagnant").sort((_, h) => (u.value ? a(h) - a(_) : 0) || h.stockQty - _.stockQty || _.partNo.localeCompare(h.partNo)).slice(0, me);
    });
    function k(a, _) {
      return typeof getComputedStyle > "u" || typeof document > "u" ? _ : getComputedStyle(document.documentElement).getPropertyValue(a).trim() || _;
    }
    const l = () => k("--color-text-muted", "#8a8fa3"), o = () => k("--color-border-subtle", "#eceef3"), p = e.computed(() => {
      const a = $.value?.summary.byState, _ = [...c].reverse();
      return {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: 86, right: 40, top: 8, bottom: 8 },
        xAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 11, color: l() }, splitLine: { lineStyle: { type: "dashed", color: o() } } },
        yAxis: { type: "category", data: _.map(P), axisLabel: { fontSize: 12, color: l() }, axisTick: { show: !1 }, axisLine: { show: !1 } },
        series: [{
          type: "bar",
          barMaxWidth: 20,
          label: { show: !0, position: "right", fontSize: 11, color: l() },
          data: _.map((h) => ({ value: a ? a[h] : 0, itemStyle: { color: re[h], borderRadius: [0, 4, 4, 0] } }))
        }]
      };
    }), S = e.computed(() => {
      const a = [...y.value].slice(0, 30).reverse(), _ = c.filter((h) => h !== "healthy");
      return {
        tooltip: { trigger: "axis" },
        legend: { top: 0, right: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11, color: l() } },
        grid: { left: 40, right: 16, top: 30, bottom: 24 },
        xAxis: { type: "category", data: a.map((h) => w.fmtDateTime(h.at).slice(5)), axisLabel: { fontSize: 11, color: l() }, axisTick: { show: !1 } },
        yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 11, color: l() }, splitLine: { lineStyle: { type: "dashed", color: o() } } },
        series: _.map((h) => ({ name: P(h), type: "line", data: a.map((L) => L.byState[h]), itemStyle: { color: re[h] }, lineStyle: { width: 2 }, symbolSize: 6 }))
      };
    });
    function T(a) {
      te(a).catch((_) => v.error(w.errorMessage(_)));
    }
    async function f() {
      try {
        await A("history.clear"), await F();
      } catch (a) {
        v.error(w.errorMessage(a));
      }
    }
    return (a, _) => (e.openBlock(), e.createElementBlock("div", kn, [
      $.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createElementVNode("section", hn, [
            e.createElementVNode("header", gn, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(a.$t("最近一次运算")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", $.value.source === "schedule" ? "brand" : ""])
                },
                e.toDisplayString($.value.source === "schedule" ? a.$t("定时运算") : a.$t("手动运算")),
                3
                /* TEXT, CLASS */
              ),
              e.createElementVNode(
                "span",
                Nn,
                e.toDisplayString(a.$t("基准日 {a} · 运算时间 {b} · 共 {n} 个配件", { a: $.value.asOf, b: e.unref(w.fmtDateTime)($.value.at), n: $.value.summary.total })),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", En, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(c), (h) => (e.openBlock(), e.createElementBlock(
                  "div",
                  {
                    key: h,
                    class: e.normalizeClass(["ss-kpi pa-kpi", e.unref(Q)(h)])
                  },
                  [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(e.unref(P)(h)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString($.value.summary.byState[h]),
                      1
                      /* TEXT */
                    ),
                    b.value ? (e.openBlock(), e.createElementBlock(
                      "em",
                      fn,
                      e.toDisplayString(g($.value.summary.byState[h])),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              )),
              e.createElementVNode("div", Vn, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(a.$t("建议补库")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString($.value.summary.replenishParts),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(a.$t("数量 {a} · 金额 {b}", { a: e.unref(O)($.value.summary.replenishQty), b: e.unref(w.fmtMoney)($.value.summary.replenishAmount) })),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createVNode(e.unref(ue), {
              class: "pa-chart",
              option: p.value,
              autoresize: ""
            }, null, 8, ["option"]),
            E.value && (E.value.newOut.length || E.value.newRisk.length) ? (e.openBlock(), e.createElementBlock("p", $n, [
              _[2] || (_[2] = e.createElementVNode(
                "i",
                { class: "ri-alarm-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(a.$t("相比上一次运算：新增已缺货 {a} 个，新增将缺货 {b} 个", { a: E.value.newOut.length, b: E.value.newRisk.length })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("div", bn, [
            e.createElementVNode("section", Sn, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(a.$t("最紧急的缺货")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                _n,
                e.toDisplayString(a.$t("已缺货的排最前，其余按预计断货日从早到晚")),
                1
                /* TEXT */
              ),
              m.value.length ? (e.openBlock(), e.createElementBlock("div", Bn, [
                e.createElementVNode("table", Tn, [
                  e.createElementVNode("thead", null, [
                    e.createElementVNode("tr", null, [
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(a.$t("配件")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(a.$t("状态")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(a.$t("断货日")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        Cn,
                        e.toDisplayString(a.$t("库存")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        wn,
                        e.toDisplayString(a.$t("在途")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(a.$t("最早到货")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        Ln,
                        e.toDisplayString(a.$t("建议补库")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(m.value, (h) => (e.openBlock(), e.createElementBlock("tr", {
                        key: h.partNo
                      }, [
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(h.partNo),
                            1
                            /* TEXT */
                          ),
                          _[3] || (_[3] = e.createTextVNode()),
                          e.createElementVNode(
                            "span",
                            An,
                            e.toDisplayString(h.partName),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", e.unref(Q)(h.state)])
                            },
                            e.toDisplayString(e.unref(P)(h.state)),
                            3
                            /* TEXT, CLASS */
                          )
                        ]),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(h.stockoutDate || "—"),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          On,
                          e.toDisplayString(e.unref(O)(h.stockQty)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          Mn,
                          e.toDisplayString(h.inTransitQty ? e.unref(O)(h.inTransitQty) : "—"),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(h.earliestEta || "—"),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          Kn,
                          e.toDisplayString(h.suggestQty ? e.unref(O)(h.suggestQty) : "—"),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])) : (e.openBlock(), e.createElementBlock(
                "p",
                Dn,
                e.toDisplayString(a.$t("没有缺货或将缺货的配件")),
                1
                /* TEXT */
              ))
            ]),
            e.createElementVNode("section", Pn, [
              e.createElementVNode("header", Wn, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(a.$t("占用最多的呆滞库存")),
                  1
                  /* TEXT */
                ),
                _[4] || (_[4] = e.createElementVNode(
                  "span",
                  { class: "grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: _[0] || (_[0] = (h) => u.value = !u.value)
                  },
                  e.toDisplayString(u.value ? a.$t("改按数量排") : a.$t("改按金额排")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "p",
                Fn,
                e.toDisplayString(u.value ? a.$t("按库存金额从高到低（没有单价的排在后面）") : a.$t("按库存数量从高到低")),
                1
                /* TEXT */
              ),
              B.value.length ? (e.openBlock(), e.createElementBlock("div", Qn, [
                e.createElementVNode("table", Rn, [
                  e.createElementVNode("thead", null, [
                    e.createElementVNode("tr", null, [
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(a.$t("配件")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        In,
                        e.toDisplayString(a.$t("库存")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        Un,
                        e.toDisplayString(a.$t("库存金额")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(a.$t("最近发货")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        jn,
                        e.toDisplayString(a.$t("未发货月数")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(B.value, (h) => (e.openBlock(), e.createElementBlock("tr", {
                        key: h.partNo
                      }, [
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(h.partNo),
                            1
                            /* TEXT */
                          ),
                          _[5] || (_[5] = e.createTextVNode()),
                          e.createElementVNode(
                            "span",
                            qn,
                            e.toDisplayString(h.partName),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "td",
                          Gn,
                          e.toDisplayString(e.unref(O)(h.stockQty)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          Hn,
                          e.toDisplayString(h.unitPrice === null ? "—" : e.unref(w.fmtMoney)(h.stockQty * h.unitPrice)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(h.lastShipMonth || a.$t("没有发货记录")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          Yn,
                          e.toDisplayString(h.monthsSinceLastShip ?? "—"),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])) : (e.openBlock(), e.createElementBlock(
                "p",
                zn,
                e.toDisplayString(a.$t("没有呆滞的配件")),
                1
                /* TEXT */
              ))
            ])
          ]),
          e.createElementVNode("section", Jn, [
            e.createElementVNode("header", Xn, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(a.$t("运算历史")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                Zn,
                e.toDisplayString(a.$t("共 {n} 次", { n: y.value.length })),
                1
                /* TEXT */
              ),
              _[6] || (_[6] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              y.value.length ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: f
                },
                e.toDisplayString(a.$t("清空历史")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            y.value.length > 1 ? (e.openBlock(), e.createBlock(e.unref(ue), {
              key: 0,
              class: "pa-chart tall",
              option: S.value,
              autoresize: ""
            }, null, 8, ["option"])) : (e.openBlock(), e.createElementBlock(
              "p",
              xn,
              e.toDisplayString(a.$t("运算两次以上后，这里显示各状态数量的变化趋势")),
              1
              /* TEXT */
            )),
            e.createElementVNode("div", es, [
              e.createElementVNode("table", ts, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(a.$t("运算时间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(a.$t("基准日")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(a.$t("来源")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(c), (h) => (e.openBlock(), e.createElementBlock(
                        "th",
                        {
                          key: h,
                          class: "num"
                        },
                        e.toDisplayString(e.unref(P)(h)),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode(
                      "th",
                      ls,
                      e.toDisplayString(a.$t("新增已缺货")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      ns,
                      e.toDisplayString(a.$t("新增将缺货")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(a.$t("文件")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(a.$t("说明")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.slice(0, D.value), (h) => (e.openBlock(), e.createElementBlock("tr", {
                      key: h.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(w.fmtDateTime)(h.at)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(h.asOf),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(h.source === "schedule" ? a.$t("定时运算") : a.$t("手动运算")),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(c), (L) => (e.openBlock(), e.createElementBlock(
                          "td",
                          {
                            key: L,
                            class: "num"
                          },
                          e.toDisplayString(h.byState[L]),
                          1
                          /* TEXT */
                        ))),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      e.createElementVNode(
                        "td",
                        ss,
                        e.toDisplayString(h.newOut.length),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        os,
                        e.toDisplayString(h.newRisk.length),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(h.files, (L) => (e.openBlock(), e.createElementBlock("button", {
                            key: L,
                            type: "button",
                            class: "ss-link pa-file",
                            title: L,
                            onClick: (j) => T(L)
                          }, e.toDisplayString(N(L)), 9, as))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ]),
                      e.createElementVNode(
                        "td",
                        rs,
                        e.toDisplayString(h.note),
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
            y.value.length > D.value ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 2,
                type: "button",
                class: "ss-btn sm",
                onClick: _[1] || (_[1] = (h) => D.value += 20)
              },
              e.toDisplayString(a.$t("显示更早的记录")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        "p",
        vn,
        e.toDisplayString(a.$t("还没有运算过。到「运算」页签投喂数据并运算，或在「定时运算」里设置自动运算，结果会汇总到这里")),
        1
        /* TEXT */
      ))
    ]));
  }
}), cs = /* @__PURE__ */ z(is, [["__scopeId", "data-v-e10ef176"]]), ds = { class: "pa-rules" }, us = { class: "ss-panel" }, ms = { class: "pa-rules__head" }, ps = { class: "ss-muted" }, ys = { class: "pa-rule__input" }, ks = ["onUpdate:modelValue", "min", "max", "data-test"], vs = {
  key: 0,
  class: "ss-muted"
}, hs = { class: "pa-rule" }, gs = { class: "pa-rule__input" }, Ns = {
  key: 0,
  class: "ss-note danger"
}, Es = {
  key: 1,
  class: "ss-note ok"
}, fs = { class: "ss-actions" }, Vs = ["disabled"], $s = ["disabled"], bs = {
  key: 0,
  class: "ss-muted"
}, Ss = { class: "ss-panel" }, _s = { class: "pa-list" }, Ds = /* @__PURE__ */ e.defineComponent({
  __name: "RulesTab",
  setup(t) {
    const v = [
      { key: "safetyDays", title: n.t("安全库存天数"), unit: n.t("天"), min: 0, max: 365, text: n.t("给到货延误、需求突增留的余量。断货日落在「采购提前期 + 这个天数」以内就报将缺货；补库量里也多备这么多天的用量。调大会更早预警、备货更多。") },
      { key: "reviewDays", title: n.t("补货周期"), unit: n.t("天"), min: 1, max: 365, text: n.t("两次下单之间隔多久。补一次货要够用到下次下单的货到为止，所以补库量里包含这么多天的用量。") },
      { key: "redundantMonths", title: n.t("冗余月数"), unit: n.t("个月"), min: 1, max: 120, text: n.t("现有库存按预测需求够用超过这么多个月，就算冗余，建议暂停补货。") },
      { key: "stagnantMonths", title: n.t("呆滞月数"), unit: n.t("个月"), min: 1, max: 120, text: n.t("有库存、连续这么多个月没有发货，就算呆滞，建议停止采购并调拨消化。") },
      { key: "scrapMonths", title: n.t("报废评估月数"), unit: n.t("个月"), min: 1, max: 240, text: n.t("呆滞的配件超过这么多个月没有发货，行动计划里会加一条「提交报废评估」。不能小于呆滞月数。") },
      { key: "defaultLeadDays", title: n.t("默认提前期"), unit: n.t("天"), min: 1, max: 365, text: n.t("采购提前期表里没有的配件，按这个天数算。用了默认值的配件会在结果里标出来。") }
    ], c = e.computed(() => W.value?.defaults.rules || null), $ = e.computed(() => W.value?.settings.rules || null), y = e.reactive({ safetyDays: 15, reviewDays: 30, redundantMonths: 6, stagnantMonths: 12, scrapMonths: 24, defaultLeadDays: 30, seasonal: !0 }), E = e.ref(!1), b = e.ref(""), u = e.ref("");
    e.watch($, (l) => {
      l && Object.assign(y, l);
    }, { immediate: !0 });
    const D = (l, o) => !!l && Object.keys(o).every((p) => l[p] === o[p]), g = e.computed(() => !D($.value, y)), N = e.computed(() => D(c.value, y) && !g.value);
    async function m(l, o, p) {
      E.value = !0, b.value = "", u.value = "";
      try {
        const S = !!W.value?.run && !W.value.run.stale;
        await A(l, o);
        const T = await F();
        Object.assign(y, T.settings.rules), u.value = S && T.run?.stale ? n.t("{p0}。当前的运算结果已标为过期，请到「运算」页签重新运算", { p0: p }) : p;
      } catch (S) {
        b.value = w.errorMessage(S);
      } finally {
        E.value = !1;
      }
    }
    function B() {
      for (const l of v) {
        const o = Number(y[l.key]);
        if (!Number.isInteger(o) || o < l.min || o > l.max) {
          b.value = n.t("{p0}要填 {a} 到 {b} 之间的整数", { p0: l.title, a: l.min, b: l.max });
          return;
        }
      }
      if (y.scrapMonths < y.stagnantMonths) {
        b.value = n.t("报废评估月数不能小于呆滞月数");
        return;
      }
      m("rules.save", { rules: { ...y } }, n.t("规则已保存"));
    }
    function k() {
      m("rules.reset", {}, n.t("已恢复默认规则"));
    }
    return (l, o) => (e.openBlock(), e.createElementBlock("div", ds, [
      e.createElementVNode("section", us, [
        e.createElementVNode("header", ms, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(l.$t("运算规则")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            ps,
            e.toDisplayString(l.$t("所有状态和数量都按下面的规则用公式计算。改了规则，当前这次运算的结果会标为过期，需要重新运算")),
            1
            /* TEXT */
          )
        ]),
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(v, (p) => e.createElementVNode("div", {
            key: p.key,
            class: "pa-rule"
          }, [
            e.createElementVNode("label", ys, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(p.title),
                1
                /* TEXT */
              ),
              e.createElementVNode("span", null, [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": (S) => y[p.key] = S,
                  type: "number",
                  min: p.min,
                  max: p.max,
                  step: "1",
                  "data-test": `pa-rule-${p.key}`
                }, null, 8, ks), [
                  [
                    e.vModelText,
                    y[p.key],
                    void 0,
                    { number: !0 }
                  ]
                ]),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(p.unit),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(p.text),
              1
              /* TEXT */
            ),
            c.value && y[p.key] !== c.value[p.key] ? (e.openBlock(), e.createElementBlock(
              "small",
              vs,
              e.toDisplayString(l.$t("默认 {n}", { n: c.value[p.key] })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ])),
          64
          /* STABLE_FRAGMENT */
        )),
        e.createElementVNode("div", hs, [
          e.createElementVNode("label", gs, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(l.$t("季节修正")),
              1
              /* TEXT */
            ),
            e.createElementVNode("span", null, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[0] || (o[0] = (p) => y.seasonal = p),
                  type: "checkbox",
                  "data-test": "pa-rule-seasonal"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, y.seasonal]
              ]),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(y.seasonal ? l.$t("开") : l.$t("关")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(l.$t("打开后，预测需求会参考去年同期：去年这个月和下个月的发货相对去年月均偏高或偏低多少，就把预测乘上这个比例（限制在 0.5 到 2 倍之间）。发货数据不满 24 个月的配件不修正。")),
            1
            /* TEXT */
          )
        ]),
        b.value ? (e.openBlock(), e.createElementBlock("p", Ns, [
          o[1] || (o[1] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(b.value),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        u.value ? (e.openBlock(), e.createElementBlock("p", Es, [
          o[2] || (o[2] = e.createElementVNode(
            "i",
            { class: "ri-check-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(u.value),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", fs, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: E.value || !g.value,
            "data-test": "pa-rules-save",
            onClick: B
          }, [
            o[3] || (o[3] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(l.$t("保存规则")),
              1
              /* TEXT */
            )
          ], 8, Vs),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: E.value || N.value,
            "data-test": "pa-rules-reset",
            onClick: k
          }, [
            o[4] || (o[4] = e.createElementVNode(
              "i",
              { class: "ri-arrow-go-back-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(l.$t("恢复默认")),
              1
              /* TEXT */
            )
          ], 8, $s),
          g.value ? (e.openBlock(), e.createElementBlock(
            "span",
            bs,
            e.toDisplayString(l.$t("有改动还没保存")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ])
      ]),
      e.createElementVNode("section", Ss, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(l.$t("规则怎么用")),
          1
          /* TEXT */
        ),
        e.createElementVNode("ul", _s, [
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(l.$t("预测月均需求 = 近 3 个月均值 × 0.5 + 近 6 个月均值 × 0.3 + 近 12 个月均值 × 0.2（只用基准日所在月之前的完整月份），再乘季节系数；日均 = 月均 ÷ 30")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(l.$t("已缺货：现有库存不大于 0，而且有需求")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(l.$t("呆滞：有库存，但连续 {n} 个月没有发货，或预测需求为 0", { n: y.stagnantMonths })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(l.$t("将缺货：库存按日均需求消耗、在途按预计到货日加回，推算出的断货日距基准日不超过「采购提前期 + {n} 天安全天数」", { n: y.safetyDays })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(l.$t("冗余：库存够用的天数超过 {n} 个月", { n: y.redundantMonths })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(l.$t("健康：以上都不是")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(l.$t("建议补库量 = 日均需求 ×（采购提前期 + 补货周期 {a} 天 + 安全天数 {b} 天）− 现有库存 − 在途数量，有最小起订量的向上取整到整倍数", { a: y.reviewDays, b: y.safetyDays })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(l.$t("最迟下单日 = 断货日 − 采购提前期；已经过了就是立即")),
            1
            /* TEXT */
          )
        ])
      ])
    ]));
  }
}), Bs = /* @__PURE__ */ z(Ds, [["__scopeId", "data-v-040e6a94"]]), Ts = { class: "pa-sched" }, Cs = { class: "ss-panel" }, ws = { class: "pa-sched__head" }, Ls = { class: "ss-muted" }, As = { class: "ss-grid" }, Os = { class: "ss-field inline pa-check" }, Ms = { class: "ss-field" }, Ks = { class: "ss-field" }, Ps = { class: "pa-folder" }, Ws = ["placeholder"], Fs = { class: "pa-kw" }, zs = { class: "ss-muted" }, Qs = { key: 0 }, Rs = ["onUpdate:modelValue", "data-test"], Is = { class: "ss-grid" }, Us = { class: "ss-field inline pa-check" }, js = { class: "ss-field inline pa-check" }, qs = {
  key: 0,
  class: "ss-field"
}, Gs = {
  key: 1,
  class: "ss-note danger",
  "data-test": "pa-sched-error"
}, Hs = {
  key: 2,
  class: "ss-note ok"
}, Ys = { class: "ss-actions" }, Js = ["disabled"], Xs = ["disabled"], Zs = { class: "ss-muted" }, xs = { class: "ss-panel" }, eo = {
  key: 0,
  class: "ss-empty"
}, to = {
  key: 0,
  class: "ss-muted"
}, lo = {
  key: 1,
  class: "ss-file-out"
}, no = ["title"], so = { class: "ss-panel" }, oo = { class: "ss-file-out" }, ao = { class: "ss-muted" }, ro = /* @__PURE__ */ e.defineComponent({
  __name: "ScheduleTab",
  setup(t) {
    const v = U.useNotificationStore(), c = K.PA_DATASETS, $ = W, y = e.computed(() => $.value?.scheduleStatus || null), E = e.computed(() => ($.value?.history || []).find((i) => i.source === "schedule") || null), b = e.computed(() => $.value?.settings.schedule.folder || ""), u = e.reactive({ enabled: !1, time: "08:00", folder: "", notify: !0, emailEnabled: !1, emailTo: "" }), D = e.reactive({ monthly: "", yearly: "", leadTime: "", inTransit: "", stock: "" }), g = e.ref({}), N = e.ref(!1), m = e.ref(!1), B = e.ref(""), k = e.ref("");
    function l(i) {
      Object.assign(u, { enabled: i.enabled, time: i.time, folder: i.folder, notify: i.notify, emailEnabled: i.emailEnabled, emailTo: i.emailTo });
      for (const V of c) D[V] = (i.keywords[V] || []).join(n.t("，"));
    }
    let o = !1;
    e.watch(() => $.value?.settings.schedule, (i) => {
      i && !o && (o = !0, l(i), p());
    }, { immediate: !0 });
    async function p() {
      try {
        g.value = await A("schedule.preview");
      } catch {
        g.value = {};
      }
    }
    function S() {
      const i = {};
      for (const V of c) i[V] = D[V].split(/[,，;；、\s]+/).map((C) => C.trim()).filter(Boolean);
      return { ...u, folder: u.folder.trim(), emailTo: u.emailTo.trim(), keywords: i };
    }
    async function T() {
      N.value = !0, B.value = "", k.value = "";
      try {
        const i = await A("schedule.save", { schedule: S() });
        return await F(), l(i), await p(), !0;
      } catch (i) {
        return B.value = w.errorMessage(i), !1;
      } finally {
        N.value = !1;
      }
    }
    async function f() {
      await T() && (k.value = u.enabled ? n.t("已保存，每天 {p0} 运行", { p0: u.time }) : n.t("已保存（定时运算没有开启）"));
    }
    async function a() {
      if (await T()) {
        m.value = !0;
        try {
          const i = await A("schedule.runNow");
          await F(), i.ok ? k.value = n.t("运行完成，结果见下方和「预警看板」") : B.value = i.message;
        } catch (i) {
          B.value = w.errorMessage(i);
        } finally {
          m.value = !1;
        }
      }
    }
    async function _() {
      try {
        const i = await A("dirs.pick");
        i && (u.folder = i);
      } catch (i) {
        v.error(w.errorMessage(i));
      }
    }
    function h() {
      const i = $.value?.defaults.keywords;
      if (i) for (const V of c) D[V] = i[V].join(n.t("，"));
    }
    function L(i, V = !1) {
      i && te(i, V).catch((C) => v.error(w.errorMessage(C)));
    }
    async function j(i) {
      try {
        await A("settings.outputDir", { dir: i }), await F();
      } catch (V) {
        v.error(w.errorMessage(V));
      }
    }
    async function H() {
      try {
        const i = await A("dirs.pick");
        i && await j(i);
      } catch (i) {
        v.error(w.errorMessage(i));
      }
    }
    return (i, V) => (e.openBlock(), e.createElementBlock("div", Ts, [
      e.createElementVNode("section", Cs, [
        e.createElementVNode("header", ws, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(i.$t("定时运算")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ss-chip", u.enabled ? "ok" : ""])
            },
            e.toDisplayString(u.enabled ? i.$t("已开启") : i.$t("未开启")),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode(
          "p",
          Ls,
          e.toDisplayString(i.$t("每天到点，从数据文件夹里按文件名找出每类数据最新的一份，重新运算，把结果存进看板和历史，并提醒相比上一次新增的已缺货、将缺货配件。应用开着才会运行。定时运算不改动「运算」页签里正在检验的那一次结果，也不会生成采购订单。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", As, [
          e.createElementVNode("label", Os, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": V[0] || (V[0] = (C) => u.enabled = C),
                type: "checkbox",
                "data-test": "pa-sched-enabled"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, u.enabled]
            ]),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("开启定时运算")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("label", Ms, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("每天几点运行")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": V[1] || (V[1] = (C) => u.time = C),
                type: "time",
                "data-test": "pa-sched-time"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, u.time]
            ])
          ])
        ]),
        e.createElementVNode("label", Ks, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(i.$t("数据文件夹（业务系统每天把导出的表放到这里）")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", Ps, [
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": V[2] || (V[2] = (C) => u.folder = C),
              type: "text",
              placeholder: i.$t("选择或粘贴文件夹路径"),
              "data-test": "pa-sched-folder"
            }, null, 8, Ws), [
              [e.vModelText, u.folder]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn",
              onClick: _
            }, [
              V[10] || (V[10] = e.createElementVNode(
                "i",
                { class: "ri-folder-open-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(i.$t("选择文件夹")),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        e.createElementVNode("div", Fs, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(i.$t("按文件名认数据")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            zs,
            e.toDisplayString(i.$t("文件名里带下面任意一个字样，就当作这类数据；同一类有多份时取修改时间最新的。多个字样用逗号隔开")),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(c), (C) => (e.openBlock(), e.createElementBlock("div", {
              key: C,
              class: "pa-kw__row"
            }, [
              e.createElementVNode("span", null, [
                e.createTextVNode(
                  e.toDisplayString(e.unref(ge)(C)),
                  1
                  /* TEXT */
                ),
                C === "monthly" || C === "stock" ? (e.openBlock(), e.createElementBlock("em", Qs, "*")) : e.createCommentVNode("v-if", !0)
              ]),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (X) => D[C] = X,
                type: "text",
                "data-test": `pa-sched-kw-${C}`
              }, null, 8, Rs), [
                [e.vModelText, D[C]]
              ]),
              e.createElementVNode(
                "small",
                {
                  class: e.normalizeClass(g.value[C] ? "hit" : "miss")
                },
                [
                  g.value[C] ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      V[11] || (V[11] = e.createElementVNode(
                        "i",
                        { class: "ri-file-excel-2-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(g.value[C]),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : b.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createTextVNode(
                        e.toDisplayString(C === "monthly" || C === "stock" ? i.$t("文件夹里没有找到，定时运算会失败") : i.$t("文件夹里没有找到")),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ],
                2
                /* CLASS */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: h
            },
            e.toDisplayString(i.$t("恢复默认字样")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Is, [
          e.createElementVNode("label", Us, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": V[3] || (V[3] = (C) => u.notify = C),
                type: "checkbox"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, u.notify]
            ]),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("运算完弹系统通知")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("label", js, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": V[4] || (V[4] = (C) => u.emailEnabled = C),
                type: "checkbox",
                "data-test": "pa-sched-email"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, u.emailEnabled]
            ]),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("把预警摘要和结果表发邮件")),
              1
              /* TEXT */
            )
          ])
        ]),
        u.emailEnabled ? (e.openBlock(), e.createElementBlock("label", qs, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(i.$t("收件人（多个用逗号隔开）。用应用里已配置的邮件通道发送，附件是「库存状态与行动计划」表")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": V[5] || (V[5] = (C) => u.emailTo = C),
              type: "text",
              placeholder: "buyer@example.com, manager@example.com",
              "data-test": "pa-sched-email-to"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, u.emailTo]
          ])
        ])) : e.createCommentVNode("v-if", !0),
        B.value ? (e.openBlock(), e.createElementBlock("p", Gs, [
          V[12] || (V[12] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(B.value),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        k.value ? (e.openBlock(), e.createElementBlock("p", Hs, [
          V[13] || (V[13] = e.createElementVNode(
            "i",
            { class: "ri-check-line" },
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
        e.createElementVNode("div", Ys, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: N.value,
            "data-test": "pa-sched-save",
            onClick: f
          }, [
            V[14] || (V[14] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(i.$t("保存设置")),
              1
              /* TEXT */
            )
          ], 8, Js),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: N.value || m.value,
            "data-test": "pa-sched-run",
            onClick: a
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(m.value ? "ri-loader-4-line spin" : "ri-play-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(m.value ? i.$t("正在运算…") : i.$t("立即运行一次")),
              1
              /* TEXT */
            )
          ], 8, Xs),
          e.createElementVNode(
            "span",
            Zs,
            e.toDisplayString(i.$t("「立即运行一次」会先保存上面的设置")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("section", xs, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(i.$t("上一次定时运算")),
          1
          /* TEXT */
        ),
        y.value?.lastRunAt ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 1 },
          [
            e.createElementVNode(
              "p",
              {
                class: e.normalizeClass(["ss-note", y.value.lastOk ? "ok" : "danger"]),
                "data-test": "pa-sched-last"
              },
              [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(y.value.lastOk ? "ri-check-line" : "ri-error-warning-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createElementVNode("span", null, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(e.unref(w.fmtDateTime)(y.value.lastRunAt)) + " · " + e.toDisplayString(y.value.lastOk ? i.$t("完成") : i.$t("没有完成")),
                    1
                    /* TEXT */
                  ),
                  V[15] || (V[15] = e.createElementVNode(
                    "br",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(y.value.lastMessage),
                    1
                    /* TEXT */
                  )
                ])
              ],
              2
              /* CLASS */
            ),
            y.value.lastFiles.length ? (e.openBlock(), e.createElementBlock(
              "p",
              to,
              e.toDisplayString(i.$t("用到的文件：{p0}", { p0: y.value.lastFiles.join("、") })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            E.value?.files.length ? (e.openBlock(), e.createElementBlock("div", lo, [
              V[16] || (V[16] = e.createElementVNode(
                "i",
                { class: "ri-file-excel-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("code", {
                title: E.value.files[0]
              }, e.toDisplayString(E.value.files[0]), 9, no),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn sm",
                  onClick: V[6] || (V[6] = (C) => L(E.value.files[0]))
                },
                e.toDisplayString(i.$t("打开文件")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn sm",
                  onClick: V[7] || (V[7] = (C) => L(E.value.files[0], !0))
                },
                e.toDisplayString(i.$t("打开所在文件夹")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ],
          64
          /* STABLE_FRAGMENT */
        )) : (e.openBlock(), e.createElementBlock(
          "p",
          eo,
          e.toDisplayString(i.$t("还没有运行过")),
          1
          /* TEXT */
        ))
      ]),
      e.createElementVNode("section", so, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(i.$t("输出目录")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", oo, [
          V[17] || (V[17] = e.createElementVNode(
            "i",
            { class: "ri-folder-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode(
            "code",
            null,
            e.toDisplayString(e.unref($)?.outputDir),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn sm",
              onClick: H
            },
            e.toDisplayString(i.$t("更换")),
            1
            /* TEXT */
          ),
          e.unref($)?.settings.outputDir ? (e.openBlock(), e.createElementBlock(
            "button",
            {
              key: 0,
              type: "button",
              class: "ss-btn sm",
              onClick: V[8] || (V[8] = (C) => j(""))
            },
            e.toDisplayString(i.$t("用默认目录")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn sm",
              onClick: V[9] || (V[9] = (C) => L(e.unref($)?.outputDir || ""))
            },
            e.toDisplayString(i.$t("打开")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          ao,
          e.toDisplayString(i.$t("采购订单、库存状态与行动计划、示例数据都写到这里；定时运算的结果在其中的「定时运算」文件夹")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), io = /* @__PURE__ */ z(ro, [["__scopeId", "data-v-db82c885"]]), co = { class: "pa-workbench" }, uo = { class: "workbench-header" }, mo = { class: "heading" }, po = { class: "eyebrow" }, yo = { class: "subtitle" }, ko = { class: "header-actions" }, vo = ["disabled"], ho = {
  key: 0,
  class: "pa-bar"
}, go = { key: 0 }, No = { key: 1 }, Eo = { class: "ss-muted" }, fo = { class: "pa-bar__rule" }, Vo = { class: "no" }, $o = { class: "yes" }, bo = {
  class: "pa-tabs",
  role: "tablist"
}, So = ["aria-selected", "data-test", "onClick"], _o = {
  key: 0,
  class: "pa-badge"
}, Do = {
  key: 1,
  class: "pa-body"
}, Bo = {
  key: 3,
  class: "pa-ov"
}, To = { class: "ss-panel" }, Co = { class: "pa-list" }, wo = { class: "ss-panel" }, Lo = { class: "pa-list" }, Ao = { class: "ss-panel" }, Oo = { class: "pa-list" }, Mo = { class: "ss-panel" }, Ko = { class: "pa-list" }, Po = {
  key: 2,
  class: "ss-note danger"
}, Wo = {
  key: 3,
  class: "ss-note"
}, pe = "totalclaw:parts-alert-tab:v1", Fo = /* @__PURE__ */ e.defineComponent({
  __name: "PartsAlertWorkbenchView",
  setup(t) {
    const v = [
      { key: "run", icon: "ri-calculator-line", title: n.t("运算") },
      { key: "board", icon: "ri-dashboard-3-line", title: n.t("预警看板") },
      { key: "rules", icon: "ri-equalizer-line", title: n.t("规则") },
      { key: "schedule", icon: "ri-timer-line", title: n.t("定时运算") },
      { key: "overview", icon: "ri-book-open-line", title: n.t("方案说明") }
    ];
    function c() {
      try {
        const l = localStorage.getItem(pe);
        return v.some((o) => o.key === l) ? l : "run";
      } catch {
        return "run";
      }
    }
    const $ = U.useNotificationStore(), y = W, E = e.ref(c()), b = e.ref(!1), u = e.ref(!1), D = e.ref(""), g = e.computed(() => y.value?.latest ? y.value.latest.summary.byState.out_of_stock + y.value.latest.summary.byState.at_risk : 0);
    function N(l) {
      E.value = l;
      try {
        localStorage.setItem(pe, l);
      } catch {
      }
    }
    async function m() {
      u.value = !0;
      try {
        await F(), b.value = !0, D.value = "";
      } catch (l) {
        D.value = w.errorMessage(l);
      } finally {
        u.value = !1;
      }
    }
    let B = null, k = null;
    return e.onMounted(() => {
      m(), k = Oe((l) => {
        if (l?.type === "schedule" && l.payload?.message) {
          const o = n.t("定时运算：{p0}", { p0: String(l.payload.message) });
          l.payload.ok ? $.info(o, 8e3) : $.error(o, 8e3);
        }
        B || (B = setTimeout(() => {
          B = null, F().catch(() => {
          });
        }, 250));
      });
    }), e.onBeforeUnmount(() => {
      k?.(), B && clearTimeout(B);
    }), (l, o) => (e.openBlock(), e.createElementBlock("div", co, [
      e.createElementVNode("header", uo, [
        e.createElementVNode("div", mo, [
          e.createVNode(we),
          o[0] || (o[0] = e.createElementVNode(
            "span",
            { class: "heading-icon" },
            [
              e.createElementVNode("i", { class: "ri-alarm-warning-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "p",
              po,
              e.toDisplayString(l.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(l.$t("智能库存管理")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              yo,
              e.toDisplayString(l.$t("投喂配件历史发货、采购提前期、采购在途和实时库存，算出每个配件是呆滞、冗余、健康、将缺货还是已缺货，给出行动计划和补库清单；你检验后生成采购订单文件，并可每天定时运算预警。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", ko, [
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: u.value,
            onClick: m
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(u.value ? "ri-loader-4-line spin" : "ri-refresh-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(l.$t("刷新")),
              1
              /* TEXT */
            )
          ], 8, vo)
        ])
      ]),
      e.unref(y) ? (e.openBlock(), e.createElementBlock("section", ho, [
        e.unref(y).latest ? (e.openBlock(), e.createElementBlock("span", go, [
          o[1] || (o[1] = e.createElementVNode(
            "i",
            { class: "ri-pulse-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(l.$t("最近运算 {a}：已缺货 {b} · 将缺货 {c} · 呆滞 {d} · 冗余 {e}", { a: e.unref(y).latest.asOf, b: e.unref(y).latest.summary.byState.out_of_stock, c: e.unref(y).latest.summary.byState.at_risk, d: e.unref(y).latest.summary.byState.stagnant, e: e.unref(y).latest.summary.byState.redundant })),
            1
            /* TEXT */
          )
        ])) : (e.openBlock(), e.createElementBlock("span", No, [
          o[2] || (o[2] = e.createElementVNode(
            "i",
            { class: "ri-pulse-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(l.$t("还没有运算过")),
            1
            /* TEXT */
          )
        ])),
        e.createElementVNode(
          "span",
          Eo,
          e.toDisplayString(e.unref(y).settings.schedule.enabled ? l.$t("定时运算：每天 {p0}", { p0: e.unref(y).settings.schedule.time }) : l.$t("定时运算未开启")),
          1
          /* TEXT */
        ),
        e.createElementVNode("p", fo, [
          e.createElementVNode("span", Vo, [
            o[3] || (o[3] = e.createElementVNode(
              "i",
              { class: "ri-close-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(l.$t("数量、日期、状态不交给模型算；不自动下采购订单")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", $o, [
            o[4] || (o[4] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(l.$t("每个结论带算式，补库清单由你确认")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("nav", bo, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(v, (p) => e.createElementVNode("button", {
            key: p.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["pa-tab", { active: E.value === p.key }]),
            "aria-selected": E.value === p.key,
            "data-test": `pa-tab-${p.key}`,
            onClick: (S) => N(p.key)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(p.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(p.title),
              1
              /* TEXT */
            ),
            p.key === "board" && g.value ? (e.openBlock(), e.createElementBlock(
              "em",
              _o,
              e.toDisplayString(g.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, So)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      b.value ? (e.openBlock(), e.createElementBlock("div", Do, [
        e.withDirectives(e.createVNode(
          yn,
          null,
          null,
          512
          /* NEED_PATCH */
        ), [
          [e.vShow, E.value === "run"]
        ]),
        E.value === "board" ? (e.openBlock(), e.createBlock(cs, { key: 0 })) : E.value === "rules" ? (e.openBlock(), e.createBlock(Bs, { key: 1 })) : E.value === "schedule" ? (e.openBlock(), e.createBlock(io, { key: 2 })) : E.value === "overview" ? (e.openBlock(), e.createElementBlock("div", Bo, [
          e.createElementVNode("section", To, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(l.$t("它替配件计划做什么")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Co, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("读四类数据：配件历史发货（按月近 3 年、按年近 5 年）、采购提前期（近 1 年平均采购天数）、采购在途订单、实时库存。Excel 和 CSV 都行，列名自动认，认不准的你点选；一列一个月份的横表会自动拆开")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("算库存状态：按库存量、采购在途量和预计回货时间，把每个配件归到库存呆滞、库存冗余、库存健康、库存将缺货、库存已缺货之一，并给出预计断货日")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("拟行动计划：呆滞库存处理建议；缺货的分「有采购在途」和「无采购在途」两套管控举措；你逐条确认、修改或驳回")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("出补库清单：缺货计划确认后，按公式给出建议补库量，你可以改数量、供应商和期望到货日")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("转采购订单：你点「生成采购订单」后写出 Excel 文件，交给采购系统")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("定时循环：每天到点读数据文件夹里最新的表重新运算，提醒新增的缺货，可发邮件")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", wo, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(l.$t("判定规则（大白话）")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Lo, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("先估需求：最近 3 个月、6 个月、12 个月的月均发货按 5 : 3 : 2 加权，越近的越重要；有两年以上数据时再按去年同期的淡旺季修正")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("已缺货：现在库存是 0（或负数），而这个配件还有人要")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("将缺货：照现在的消耗速度，加上在途按时到货，仍会在「采购提前期 + 安全天数」之内断货——也就是现在不处理就来不及了")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("呆滞：有库存，但已经连续很多个月（默认 12 个月）没有发过货")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("冗余：库存够用的时间太长（默认超过 6 个月）")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("健康：不缺也不多")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("补多少：够用到「下一批货到 + 下次下单 + 安全余量」为止，减掉手上的库存和已经在路上的；有最小起订量的凑整")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("这些天数和月数都能在「规则」页签里改")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", Ao, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(l.$t("两条红线")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Oo, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("数字只由公式算：库存状态、断货日、补库量、金额都是程序按规则算出来的，模型不参与计算；每个结论旁边都能展开看算式，导出的文件里也带")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("采购订单要人确认：行动计划要你检验，补库清单要你确认，「生成采购订单」要你点；生成的只是文件，应用不向采购系统或供应商提交任何东西")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", Mo, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(l.$t("先知道这几件事")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Ko, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("历史发货（按月）和实时库存是必须的；没有采购提前期就全部按默认天数，没有采购在途就按没有在途算，页面上会提示")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("读表时跳过的行（没有配件编码、数量不是数字、合计行等）会列出原因，不会悄悄丢掉")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("在途订单没有预计到货日期的，按「基准日 + 采购提前期」推算到货")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("同一个配件在多个仓库的库存会相加后再判断")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(l.$t("定时运算要应用开着才会跑；它只更新看板和历史，不动你正在检验的那一次结果")),
                1
                /* TEXT */
              )
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ])) : D.value ? (e.openBlock(), e.createElementBlock("p", Po, [
        o[5] || (o[5] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(D.value),
          1
          /* TEXT */
        )
      ])) : (e.openBlock(), e.createElementBlock("p", Wo, [
        o[6] || (o[6] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(l.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), zo = /* @__PURE__ */ z(Fo, [["__scopeId", "data-v-493b4ced"]]);
export {
  zo as default
};
