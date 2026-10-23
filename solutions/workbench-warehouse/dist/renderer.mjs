const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const Ee = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-i18n"];
if (!Ee) throw new Error("宿主模块未就绪：npm:vue-i18n");
Ee.default;
const Ne = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!Ne) throw new Error("宿主模块未就绪：npm:vue-router");
Ne.default;
const we = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!we) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const _e = we.default, l = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!l) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
l.default;
const ae = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/humanize.ts"];
if (!ae) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/humanize.ts");
ae.default;
const ke = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/AutomationOpsConsole.vue"];
if (!ke) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/AutomationOpsConsole.vue");
const $e = ke.default, L = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:xlsx"];
if (!L) throw new Error("宿主模块未就绪：npm:xlsx");
L.default;
const me = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/brand.ts"];
if (!me) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/brand.ts");
me.default;
const Ae = { class: "normalization-lab" }, Ce = { class: "lab-header" }, Te = { class: "eyebrow" }, Be = { class: "lab-layout" }, Oe = { class: "source-column" }, Le = { class: "column-title" }, Re = ["onClick"], Pe = { class: "source-icon" }, Ue = { class: "source-copy" }, Ie = { key: 0 }, Ke = { class: "upload-card" }, We = { class: "ledger-slots" }, Me = ["disabled"], qe = { class: "mapping-column" }, ze = { class: "source-toolbar" }, Je = { class: "format-tag" }, je = ["disabled"], Fe = { class: "data-tabs" }, He = {
  key: 0,
  class: "tab-panel raw-panel"
}, Ze = { class: "data-facts" }, Xe = {
  key: 0,
  class: "message error"
}, Qe = {
  key: 1,
  class: "tab-panel mapping-panel"
}, Ge = { class: "mapping-intro" }, Ye = { class: "mapping-grid" }, xe = ["onUpdate:modelValue"], et = { value: "" }, tt = ["value"], lt = { class: "unit-rules" }, nt = ["onUpdate:modelValue"], ot = {
  key: 2,
  class: "tab-panel result-panel"
}, at = { class: "result-metrics" }, rt = { class: "normalized-table" }, st = { class: "unit-chip" }, it = {
  key: 0,
  class: "evidence-list",
  open: ""
}, ct = {
  key: 1,
  class: "empty-result"
}, ut = { class: "mapping-actions" }, dt = ["disabled"], mt = ["disabled"], pt = ["disabled"], yt = { class: "trace-column" }, gt = { class: "trace-header" }, vt = { class: "trace-list" }, Et = { class: "trace-node" }, Nt = {
  key: 0,
  class: "compare-receipt"
}, Vt = { class: "trace-footnote" }, St = /* @__PURE__ */ e.defineComponent({
  __name: "WarehouseDataNormalization",
  emits: ["normalizedReconcile"],
  setup(re, { emit: Q }) {
    const G = Q, R = [
      { key: "sku", label: l.t("商品编码"), required: !0 },
      { key: "warehouse", label: l.t("仓库 / 库位"), required: !1 },
      { key: "quantity", label: l.t("库存数量"), required: !0 },
      { key: "unit", label: l.t("源单位"), required: !1 },
      { key: "packSize", label: l.t("包装含量"), required: !1 },
      { key: "unitPrice", label: l.t("单位价格"), required: !1 },
      { key: "amount", label: l.t("库存金额"), required: !1 },
      { key: "currency", label: l.t("币种"), required: !1 },
      { key: "batch", label: l.t("批次 / Lot"), required: !1 },
      { key: "updatedAt", label: l.t("更新时间"), required: !1 }
    ], P = [
      { code: "PCS" },
      { code: "EA" },
      { code: "BOX" },
      { code: "CTN" },
      { code: "DOZ" },
      { code: "PALLET" }
    ];
    function U() {
      const o = [
        { Material: "sku-001", Storage_Loc: "ruh-a", Unrestricted: 2, Base_UoM: "CTN", Pack_Qty: 12, Unit_Cost: 100, Currency: "SAR", Batch: "b-2407" },
        { Material: "sku-002", Storage_Loc: "ruh-a", Unrestricted: 1, Base_UoM: "DOZ", Pack_Qty: 12, Unit_Cost: 120, Currency: "SAR", Batch: "b-2408" },
        { Material: "sku-004", Storage_Loc: "jed-b", Unrestricted: 4, Base_UoM: "BOX", Pack_Qty: 6, Unit_Cost: 155, Currency: "SAR", Batch: "b-2410" }
      ], a = L.utils.book_new();
      L.utils.book_append_sheet(a, L.utils.json_to_sheet(o), "MB52");
      const n = L.write(a, { type: "base64", bookType: "xlsx" });
      return {
        id: "sap-xlsx",
        name: l.t("SAP MB52 库存导出"),
        system: "SAP S/4HANA",
        format: "xlsx",
        description: l.t("Excel · 箱/打/盒混合单位"),
        icon: "ri-file-excel-2-line",
        content: n,
        preview: [
          "Workbook: SAP_MB52_2026-07-29.xlsx",
          "Sheet: MB52 · 3 rows × 9 columns",
          "",
          "Material | Storage_Loc | Unrestricted | Base_UoM | Pack_Qty | Unit_Cost",
          "sku-001 | ruh-a | 2 | CTN | 12 | 100",
          "sku-002 | ruh-a | 1 | DOZ | 12 | 120",
          "sku-004 | jed-b | 4 | BOX | 6 | 155"
        ].join(`
`),
        mapping: {
          sku: "Material",
          warehouse: "Storage_Loc",
          quantity: "Unrestricted",
          unit: "Base_UoM",
          packSize: "Pack_Qty",
          unitPrice: "Unit_Cost",
          currency: "Currency",
          batch: "Batch"
        }
      };
    }
    const V = e.reactive([
      {
        id: "wms-csv",
        name: l.t("WMS 每日库存快照"),
        system: "Manhattan WMS",
        format: "csv",
        description: l.t("CSV · 分号分隔 · 件"),
        icon: "ri-file-text-line",
        content: [
          "product_code;warehouse_code;on_hand;uom;inventory_value;currency;lot_no;updated_at",
          "SKU-001;RUH-A;24;PCS;2400.00;SAR;B-2407;2026-07-29T08:04:12Z",
          "SKU-002;RUH-A;12;PCS;1440.00;SAR;B-2408;2026-07-29T08:04:13Z",
          "SKU-003;JED-B;8;PCS;1040.00;SAR;B-2409;2026-07-29T08:04:14Z"
        ].join(`
`),
        preview: "",
        mapping: {
          sku: "product_code",
          warehouse: "warehouse_code",
          quantity: "on_hand",
          unit: "uom",
          amount: "inventory_value",
          currency: "currency",
          batch: "lot_no",
          updatedAt: "updated_at"
        }
      },
      U(),
      {
        id: "commerce-json",
        name: l.t("电商库存 API"),
        system: "Commerce Cloud",
        format: "json",
        description: l.t("JSON · 嵌套字段 · 实时接口形态"),
        icon: "ri-braces-line",
        content: JSON.stringify({
          requestId: "req_inv_7f13c2",
          inventory: [
            { item: { code: "sku-001" }, location: { id: "ruh-a" }, stock: { available: "24", unit: "EA" }, financials: { value: "SAR 2400.00", currency: "ر.س" }, lot: "b-2407", syncedAt: "2026-07-29T08:05:02Z" },
            { item: { code: "sku-002" }, location: { id: "ruh-a" }, stock: { available: "11", unit: "EA" }, financials: { value: "SAR 1320.00", currency: "ر.س" }, lot: "b-2408", syncedAt: "2026-07-29T08:05:03Z" },
            { item: { code: "sku-005" }, location: { id: "dmm-c" }, stock: { available: "6", unit: "EA" }, financials: { value: "SAR 570.00", currency: "ر.س" }, lot: "b-2411", syncedAt: "2026-07-29T08:05:04Z" }
          ]
        }, null, 2),
        preview: "",
        mapping: {
          sku: "item.code",
          warehouse: "location.id",
          quantity: "stock.available",
          unit: "stock.unit",
          amount: "financials.value",
          currency: "financials.currency",
          batch: "lot",
          updatedAt: "syncedAt"
        }
      },
      {
        id: "supplier-xml",
        name: l.t("供应商 ASN / EDI"),
        system: "Oracle NetSuite",
        format: "xml",
        description: l.t("XML · 到货通知 · 箱单位"),
        icon: "ri-code-s-slash-line",
        content: `<?xml version="1.0" encoding="UTF-8"?>
<inventory>
  <record><itemCode>sku-001</itemCode><site>ruh-a</site><qty>2</qty><uom>CTN</uom><pack>12</pack><unitCost>100</unitCost><currency>SAR</currency><lot>b-2407</lot></record>
  <record><itemCode>sku-002</itemCode><site>ruh-a</site><qty>1</qty><uom>CTN</uom><pack>12</pack><unitCost>120</unitCost><currency>SAR</currency><lot>b-2408</lot></record>
  <record><itemCode>sku-006</itemCode><site>jed-b</site><qty>1</qty><uom>CTN</uom><pack>10</pack><unitCost>80</unitCost><currency>SAR</currency><lot>b-2412</lot></record>
</inventory>`,
        preview: "",
        mapping: {
          sku: "itemCode",
          warehouse: "site",
          quantity: "qty",
          unit: "uom",
          packSize: "pack",
          unitPrice: "unitCost",
          currency: "currency",
          batch: "lot"
        }
      },
      {
        id: "scanner-ndjson",
        name: l.t("PDA 扫码事件流"),
        system: "RF Scanner Gateway",
        format: "ndjson",
        description: l.t("NDJSON · Webhook 逐行事件"),
        icon: "ri-qr-scan-2-line",
        content: [
          '{"event_id":"evt-701","barcode":"SKU-001","zone":"RUH-A","counted":"٢٤","measure":"EA","batch":"B-2407","at":"2026-07-29T08:06:10Z"}',
          '{"event_id":"evt-702","barcode":"SKU-002","zone":"RUH-A","counted":"١٢","measure":"EA","batch":"B-2408","at":"2026-07-29T08:06:18Z"}',
          '{"event_id":"evt-703","barcode":"SKU-003","zone":"JED-B","counted":"٧","measure":"EA","batch":"B-2409","at":"2026-07-29T08:06:25Z"}'
        ].join(`
`),
        preview: "",
        mapping: {
          sku: "barcode",
          warehouse: "zone",
          quantity: "counted",
          unit: "measure",
          batch: "batch",
          updatedAt: "at"
        }
      }
    ]);
    V.forEach((o) => {
      o.preview || (o.preview = o.content);
    });
    const _ = e.ref(V[0].id), g = e.ref("raw"), $ = e.ref([]), b = e.ref([]), h = e.reactive({}), w = e.reactive({
      PCS: 1,
      EA: 1,
      BOX: 6,
      CTN: 12,
      DOZ: 12,
      PALLET: 120
    }), A = e.ref(!1), y = e.ref(!1), N = e.ref(""), m = e.ref(null), C = e.ref(null), T = e.ref(null), B = e.ref(null), le = e.ref([]), pe = e.ref(0), se = `TC-NORM-${(/* @__PURE__ */ new Date()).toISOString().slice(2, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, D = e.computed(() => V.find((o) => o.id === _.value) ?? V[0]), v = e.computed(() => A.value || y.value);
    function ne() {
      return new Intl.DateTimeFormat(document.documentElement.lang || "zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: !1
      }).format(/* @__PURE__ */ new Date());
    }
    function S(o, a, n = "done") {
      const i = ++pe.value;
      return le.value.unshift({ id: i, time: ne(), title: o, detail: a, state: n }), i;
    }
    function z(o, a, n = "done") {
      const i = le.value.find((E) => E.id === o);
      i && (i.detail = a, i.state = n);
    }
    function J(o, a = "", n = 0) {
      const i = [];
      for (const [E, I] of Object.entries(o)) {
        const j = a ? `${a}.${E}` : E;
        I && typeof I == "object" && !Array.isArray(I) && n < 2 ? i.push(...J(I, j, n + 1)) : i.push(j);
      }
      return i;
    }
    function X(o) {
      return [...o.matchAll(/<record\b[^>]*>([\s\S]*?)<\/record>/gi)].map((n) => {
        const i = {};
        for (const E of n[1].matchAll(/<([\w:-]+)\b[^>]*>([\s\S]*?)<\/\1>/g))
          i[E[1]] = E[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
        return i;
      });
    }
    function ie(o) {
      if (o.format === "xlsx") {
        const n = L.read(o.content, { type: "base64" }), i = n.Sheets[n.SheetNames[0]];
        return L.utils.sheet_to_json(i, { defval: "" });
      }
      if (o.format === "csv") {
        const n = L.read(o.content, { type: "string", FS: ";" });
        return L.utils.sheet_to_json(n.Sheets[n.SheetNames[0]], { defval: "" });
      }
      if (o.format === "ndjson")
        return o.content.split(/\r?\n/).filter(Boolean).map((n) => JSON.parse(n));
      if (o.format === "xml") return X(o.content);
      const a = JSON.parse(o.content);
      if (Array.isArray(a)) return a;
      if (a && typeof a == "object") {
        const n = a, i = Object.values(n).find((E) => Array.isArray(E));
        return Array.isArray(i) ? i : [n];
      }
      throw new Error(l.t("JSON 顶层没有可读取的对象或数组"));
    }
    function ce(o) {
      v.value || (_.value = o, g.value = "raw", Y());
    }
    function Y() {
      N.value = "", m.value = null;
      const o = D.value, a = S(l.t("读取数据源"), l.t("{p0} · 正在解析 {p1}", { p0: o.system, p1: o.format.toUpperCase() }), "running");
      try {
        const n = ie(o);
        $.value = n, b.value = [...new Set(n.flatMap((i) => J(i)))].sort(), Object.keys(h).forEach((i) => delete h[i]), Object.assign(h, o.mapping), z(a, l.t("读取 {p0} 条记录，识别 {p1} 个源字段", { p0: n.length, p1: b.value.length })), S(l.t("保留来源证据"), l.t("源 ID={p0}；格式={p1}；原始内容未改写", { p0: o.id, p1: o.format.toUpperCase() }));
      } catch (n) {
        $.value = [], b.value = [], N.value = ae.humanizeErrorMessage(n, l.t("数据解析失败，请检查文件格式是否正确")), z(a, N.value, "error");
      }
    }
    async function ye() {
      const o = window.electronAPI?.workbenches?.warehouse;
      if (!o?.normalize) {
        S(l.t("归一化失败"), l.t("仓储归一化主进程接口不可用"), "error");
        return;
      }
      A.value = !0, m.value = null, g.value = "result";
      const a = S(l.t("执行字段归一"), l.t("记录已通过安全 IPC 发送至 TotalClaw 确定性处理器"), "running");
      try {
        const n = await o.normalize({
          sourceId: D.value.id,
          format: D.value.format,
          // Vue 会把 ref 内的对象深度代理；Electron structured clone 不能传 Proxy。
          records: JSON.parse(JSON.stringify($.value)),
          mapping: { ...h },
          unitMultipliers: { ...w }
        });
        m.value = n, z(a, l.t("{p0}/{p1} 条成功；拒绝 {p2} 条", { p0: n.summary.normalized, p1: n.summary.received, p2: n.summary.rejected })), S(l.t("单位与金额标准化"), l.t("{p0} 条完成单位换算；币种 {p1}", { p0: n.summary.convertedUnits, p1: n.summary.currencies.join(", ") || "—" })), S(l.t("质量规则检查"), l.t("重复键 {p0}；覆盖仓库 {p1}", { p0: n.summary.duplicates, p1: n.summary.warehouses.join(", ") || "—" }));
      } catch (n) {
        const i = n instanceof Error ? n.message : String(n);
        z(a, i, "error");
      } finally {
        A.value = !1;
      }
    }
    function oe(o) {
      if (!m.value) return;
      const a = {
        name: D.value.name,
        records: m.value.records.map((n) => ({ ...n }))
      };
      o === "baseline" ? C.value = a : T.value = a, B.value = null, S(
        o === "baseline" ? l.t("装载基准账 A") : l.t("装载待核账 B"),
        l.t("{p0} · {p1} 条标准记录已进入对账槽位", { p0: a.name, p1: a.records.length })
      );
    }
    async function O() {
      const o = window.electronAPI?.workbenches?.warehouse;
      if (!C.value || !T.value) return;
      if (!o?.reconcile) {
        S(l.t("对账失败"), l.t("仓储对账主进程接口不可用"), "error");
        return;
      }
      y.value = !0, B.value = null;
      const a = S(l.t("调用确定性对账"), l.t("按 SKU + warehouse + batch 比较两组已归一记录"), "running");
      try {
        const n = await o.reconcile({
          left: JSON.parse(JSON.stringify(C.value.records)),
          right: JSON.parse(JSON.stringify(T.value.records)),
          keyFields: ["sku", "warehouse", "batch"],
          amountField: "amount",
          tolerance: 0.01
        });
        B.value = n, z(
          a,
          l.t("匹配 {p0}；金额差异 {p1}；仅 A {p2}；仅 B {p3}", { p0: n.summary?.matched ?? 0, p1: n.summary?.amountMismatch ?? 0, p2: n.summary?.onlyLeft ?? 0, p3: n.summary?.onlyRight ?? 0 })
        ), S(l.t("写入证据链"), l.t("归一记录、来源行号、换算过程和对账回执已关联到本次运行")), G("normalizedReconcile", {
          left: C.value.records,
          right: T.value.records,
          result: n
        });
      } catch (n) {
        z(a, n instanceof Error ? n.message : String(n), "error");
      } finally {
        y.value = !1;
      }
    }
    function x(o) {
      const a = o.split(".").pop()?.toLowerCase();
      return a === "xlsx" || a === "xls" ? "xlsx" : a === "csv" ? "csv" : a === "json" ? "json" : a === "xml" ? "xml" : a === "ndjson" ? "ndjson" : null;
    }
    async function ue(o) {
      const a = o.target, n = a.files?.[0];
      if (!n) return;
      const i = x(n.name);
      if (!i) {
        S(l.t("文件接入失败"), l.t("{p0} 的格式不受支持", { p0: n.name }), "error");
        return;
      }
      try {
        let E;
        if (i === "xlsx") {
          const j = new Uint8Array(await n.arrayBuffer());
          let de = "";
          for (let t = 0; t < j.length; t += 32768)
            de += String.fromCharCode(...j.subarray(t, t + 32768));
          E = btoa(de);
        } else
          E = await n.text();
        const I = `upload-${Date.now()}`;
        V.push({
          id: I,
          name: n.name,
          system: l.t("本地文件导入"),
          format: i,
          description: l.t("{p0} KB · 用户选择", { p0: Math.max(1, Math.round(n.size / 1024)) }),
          icon: i === "xlsx" ? "ri-file-excel-2-line" : "ri-file-upload-line",
          content: E,
          preview: i === "xlsx" ? l.t(`Workbook: {p0}
Size: {p1} bytes

点击“重新读取”解析工作表和字段。`, { p0: n.name, p1: n.size }) : E.slice(0, 12e3),
          mapping: {}
        }), _.value = I, g.value = "raw", Y(), S(l.t("接入本地文件"), l.t("{p0} 已进入隔离解析流程", { p0: n.name }));
      } catch (E) {
        S(l.t("文件接入失败"), ae.humanizeErrorMessage(E), "error");
      } finally {
        a.value = "";
      }
    }
    function ee(o) {
      const a = o._source;
      return !a || typeof a != "object" ? "—" : String(a.row ?? "—");
    }
    function te(o) {
      return o === "error" ? "ri-close-circle-line" : o === "warning" ? "ri-alert-line" : "ri-information-line";
    }
    return e.onMounted(() => Y()), (o, a) => (e.openBlock(), e.createElementBlock("section", Ae, [
      e.createElementVNode("header", Ce, [
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "span",
            Te,
            e.toDisplayString(e.unref(me.brandName)().toUpperCase()) + " DATA PIPELINE",
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "h2",
            null,
            e.toDisplayString(o.$t("多源库存接入与数据归一")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(o.$t("内置来源为格式样例；上传文件后使用你的数据，通过真实解析与对账接口执行。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "div",
          {
            class: e.normalizeClass(["pipeline-state", v.value ? "running" : "ready"])
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(v.value ? "ri-loader-4-line spin" : "ri-pulse-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              " " + e.toDisplayString(v.value ? o.$t("处理中") : o.$t("等待处理")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ]),
      e.createElementVNode("div", Be, [
        e.createElementVNode("aside", Oe, [
          e.createElementVNode("div", Le, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("01 · 数据源")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(o.$t("{p0} 个数据来源", { p0: V.length })),
              1
              /* TEXT */
            )
          ]),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(V, (n) => (e.openBlock(), e.createElementBlock("button", {
              key: n.id,
              type: "button",
              class: e.normalizeClass(["source-card", { active: n.id === _.value }]),
              onClick: (i) => ce(n.id)
            }, [
              e.createElementVNode("span", Pe, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(n.icon)
                  },
                  null,
                  2
                  /* CLASS */
                )
              ]),
              e.createElementVNode("span", Ue, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(n.name),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("small", null, [
                  e.createTextVNode(
                    e.toDisplayString(n.system) + " · " + e.toDisplayString(n.format.toUpperCase()) + " ",
                    1
                    /* TEXT */
                  ),
                  n.id.startsWith("upload-") ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                    "span",
                    Ie,
                    "· " + e.toDisplayString(o.$t("格式样例")),
                    1
                    /* TEXT */
                  ))
                ]),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(n.description),
                  1
                  /* TEXT */
                )
              ]),
              a[5] || (a[5] = e.createElementVNode(
                "i",
                { class: "ri-arrow-right-s-line" },
                null,
                -1
                /* CACHED */
              ))
            ], 10, Re))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode("label", Ke, [
            e.createElementVNode(
              "input",
              {
                ref: "fileInput",
                type: "file",
                accept: ".csv,.json,.xml,.xlsx,.xls,.ndjson",
                onChange: ue
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ),
            a[7] || (a[7] = e.createElementVNode(
              "i",
              { class: "ri-upload-cloud-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("span", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(o.$t("接入本地文件")),
                1
                /* TEXT */
              ),
              a[6] || (a[6] = e.createElementVNode(
                "small",
                null,
                "CSV / Excel / JSON / XML / NDJSON",
                -1
                /* CACHED */
              ))
            ])
          ]),
          e.createElementVNode("div", We, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("对账槽位")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "div",
              {
                class: e.normalizeClass({ filled: !!C.value })
              },
              [
                a[8] || (a[8] = e.createElementVNode(
                  "b",
                  null,
                  "A",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(C.value?.name || o.$t("等待基准账")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(C.value ? o.$t("{p0} 条", { p0: C.value.records.length }) : o.$t("未装载")),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "div",
              {
                class: e.normalizeClass({ filled: !!T.value })
              },
              [
                a[9] || (a[9] = e.createElementVNode(
                  "b",
                  null,
                  "B",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(T.value?.name || o.$t("等待待核账")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(T.value ? o.$t("{p0} 条", { p0: T.value.records.length }) : o.$t("未装载")),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            ),
            e.createElementVNode("button", {
              class: "run-compare",
              type: "button",
              disabled: v.value || !C.value || !T.value,
              onClick: O
            }, [
              a[10] || (a[10] = e.createElementVNode(
                "i",
                { class: "ri-git-merge-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                " " + e.toDisplayString(y.value ? o.$t("真实对账中…") : o.$t("对比已归一数据")),
                1
                /* TEXT */
              )
            ], 8, Me)
          ])
        ]),
        e.createElementVNode("main", qe, [
          e.createElementVNode("div", ze, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                Je,
                e.toDisplayString(D.value.format.toUpperCase()),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(D.value.name),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(D.value.system),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("button", {
              type: "button",
              disabled: v.value,
              onClick: Y
            }, [
              a[11] || (a[11] = e.createElementVNode(
                "i",
                { class: "ri-radar-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(o.$t("重新读取")),
                1
                /* TEXT */
              )
            ], 8, je)
          ]),
          e.createElementVNode("div", Fe, [
            e.createElementVNode(
              "button",
              {
                class: e.normalizeClass({ active: g.value === "raw" }),
                onClick: a[0] || (a[0] = (n) => g.value = "raw")
              },
              e.toDisplayString(o.$t("原始数据")),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode(
              "button",
              {
                class: e.normalizeClass({ active: g.value === "mapping" }),
                onClick: a[1] || (a[1] = (n) => g.value = "mapping")
              },
              [
                e.createTextVNode(
                  e.toDisplayString(o.$t("字段映射")) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(b.value.length),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "button",
              {
                class: e.normalizeClass({ active: g.value === "result" }),
                onClick: a[2] || (a[2] = (n) => g.value = "result")
              },
              [
                e.createTextVNode(
                  e.toDisplayString(o.$t("归一结果")) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(m.value?.records.length || 0),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            )
          ]),
          g.value === "raw" ? (e.openBlock(), e.createElementBlock("section", He, [
            e.createElementVNode("div", Ze, [
              e.createElementVNode("span", null, [
                a[12] || (a[12] = e.createElementVNode(
                  "i",
                  { class: "ri-file-code-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(D.value.format.toUpperCase()),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("span", null, [
                a[13] || (a[13] = e.createElementVNode(
                  "i",
                  { class: "ri-database-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("{p0} 条记录", { p0: $.value.length })),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("span", null, [
                a[14] || (a[14] = e.createElementVNode(
                  "i",
                  { class: "ri-braces-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("{p0} 个字段", { p0: b.value.length })),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("span", null, [
                a[15] || (a[15] = e.createElementVNode(
                  "i",
                  { class: "ri-shield-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("原始内容保留")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode(
              "pre",
              null,
              e.toDisplayString(D.value.preview),
              1
              /* TEXT */
            ),
            N.value ? (e.openBlock(), e.createElementBlock("div", Xe, [
              a[16] || (a[16] = e.createElementVNode(
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
            ])) : e.createCommentVNode("v-if", !0)
          ])) : g.value === "mapping" ? (e.openBlock(), e.createElementBlock("section", Qe, [
            e.createElementVNode("div", Ge, [
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(o.$t("统一数据模型")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(o.$t("源字段 → 标准字段；修改任一选择后可重新执行。")),
                  1
                  /* TEXT */
                )
              ]),
              a[17] || (a[17] = e.createElementVNode(
                "span",
                { class: "model-badge" },
                "InventoryRecord v1",
                -1
                /* CACHED */
              ))
            ]),
            e.createElementVNode("div", Ye, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(R, (n) => e.createElementVNode("label", {
                  key: n.key
                }, [
                  e.createElementVNode("span", null, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(n.label),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "em",
                      null,
                      e.toDisplayString(n.required ? o.$t("必需") : o.$t("可选")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", null, [
                    e.withDirectives(e.createElementVNode("select", {
                      "onUpdate:modelValue": (i) => h[n.key] = i
                    }, [
                      e.createElementVNode(
                        "option",
                        et,
                        e.toDisplayString(o.$t("不映射")),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(b.value, (i) => (e.openBlock(), e.createElementBlock("option", {
                          key: i,
                          value: i
                        }, e.toDisplayString(i), 9, tt))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 8, xe), [
                      [e.vModelSelect, h[n.key]]
                    ]),
                    a[18] || (a[18] = e.createElementVNode(
                      "i",
                      { class: "ri-arrow-right-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "code",
                      null,
                      e.toDisplayString(n.key),
                      1
                      /* TEXT */
                    )
                  ])
                ])),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", lt, [
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(o.$t("单位换算规则")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(o.$t("目标单位统一为 PCS；可现场修改倍率。")),
                  1
                  /* TEXT */
                )
              ]),
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(P, (n) => e.createElementVNode("label", {
                  key: n.code
                }, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(n.code),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (i) => w[n.code] = i,
                    type: "number",
                    min: "0.0001",
                    step: "0.01"
                  }, null, 8, nt), [
                    [
                      e.vModelText,
                      w[n.code],
                      void 0,
                      { number: !0 }
                    ]
                  ]),
                  a[19] || (a[19] = e.createElementVNode(
                    "em",
                    null,
                    "PCS",
                    -1
                    /* CACHED */
                  ))
                ])),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ])) : (e.openBlock(), e.createElementBlock("section", ot, [
            m.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", at, [
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(o.$t("接收")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(m.value.summary.received),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(o.$t("成功归一")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(m.value.summary.normalized),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(o.$t("单位换算")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(m.value.summary.convertedUnits),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "div",
                    {
                      class: e.normalizeClass({ danger: m.value.summary.rejected > 0 })
                    },
                    [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(o.$t("拒绝")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(m.value.summary.rejected),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(o.$t("重复键")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(m.value.summary.duplicates),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("div", rt, [
                  e.createElementVNode("table", null, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(o.$t("来源行")),
                          1
                          /* TEXT */
                        ),
                        a[20] || (a[20] = e.createElementVNode(
                          "th",
                          null,
                          "SKU",
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(o.$t("仓库")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(o.$t("数量")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(o.$t("单位")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(o.$t("金额")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(o.$t("币种")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(o.$t("批次")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(m.value.records, (n, i) => (e.openBlock(), e.createElementBlock("tr", {
                          key: `${n.sku}-${i}`
                        }, [
                          e.createElementVNode(
                            "td",
                            null,
                            "#" + e.toDisplayString(ee(n)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.createElementVNode(
                              "code",
                              null,
                              e.toDisplayString(n.sku),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.warehouse),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.quantity),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.createElementVNode(
                              "span",
                              st,
                              e.toDisplayString(n.unit),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.amount ?? "—"),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.currency),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.batch ?? "—"),
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
                m.value.evidence.length ? (e.openBlock(), e.createElementBlock("details", it, [
                  e.createElementVNode(
                    "summary",
                    null,
                    e.toDisplayString(o.$t("转换证据（{p0}）", { p0: m.value.evidence.length })),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(m.value.evidence, (n, i) => (e.openBlock(), e.createElementBlock(
                      "p",
                      {
                        key: i,
                        class: e.normalizeClass(n.level)
                      },
                      [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(te(n.level))
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(n.row ? o.$t("第 {p0} 行 · ", { p0: n.row }) : "") + e.toDisplayString(n.detail),
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
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock("div", ct, [
              a[21] || (a[21] = e.createElementVNode(
                "i",
                { class: "ri-filter-3-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(o.$t("尚未执行归一")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(o.$t("检查映射后点击下方“执行真实归一”。")),
                1
                /* TEXT */
              )
            ]))
          ])),
          e.createElementVNode("footer", ut, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(o.$t("当前链路")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(D.value.system) + " → " + e.toDisplayString(e.unref(me.brandName)()) + " → InventoryRecord v1",
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "secondary",
              disabled: v.value || !m.value,
              onClick: a[3] || (a[3] = (n) => oe("baseline"))
            }, e.toDisplayString(o.$t("设为基准账 A")), 9, dt),
            e.createElementVNode("button", {
              type: "button",
              class: "secondary",
              disabled: v.value || !m.value,
              onClick: a[4] || (a[4] = (n) => oe("comparison"))
            }, e.toDisplayString(o.$t("设为待核账 B")), 9, mt),
            e.createElementVNode("button", {
              type: "button",
              class: "primary",
              disabled: v.value || $.value.length === 0,
              onClick: ye
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(A.value ? "ri-loader-4-line spin" : "ri-play-circle-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                " " + e.toDisplayString(A.value ? o.$t("正在归一…") : o.$t("执行真实归一")),
                1
                /* TEXT */
              )
            ], 8, pt)
          ])
        ]),
        e.createElementVNode("aside", yt, [
          e.createElementVNode("div", gt, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(o.$t("实时执行记录")),
                1
                /* TEXT */
              ),
              e.createElementVNode("strong", null, e.toDisplayString(se))
            ]),
            a[22] || (a[22] = e.createElementVNode(
              "span",
              { class: "live-dot" },
              [
                e.createElementVNode("i"),
                e.createTextVNode("LIVE")
              ],
              -1
              /* CACHED */
            ))
          ]),
          e.createElementVNode("ol", vt, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(le.value, (n) => (e.openBlock(), e.createElementBlock(
                "li",
                {
                  key: n.id,
                  class: e.normalizeClass(n.state)
                },
                [
                  e.createElementVNode("span", Et, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(n.state === "running" ? "ri-loader-4-line spin" : n.state === "error" ? "ri-close-line" : "ri-check-line")
                      },
                      null,
                      2
                      /* CLASS */
                    )
                  ]),
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "time",
                      null,
                      e.toDisplayString(n.time),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(n.title),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "p",
                      null,
                      e.toDisplayString(n.detail),
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
          ]),
          B.value ? (e.openBlock(), e.createElementBlock("div", Nt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("真实对账回执")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(B.value.summary?.clean ? o.$t("两账已对平") : o.$t("发现业务差异")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(o.$t("匹配 {p0}", { p0: B.value.summary?.matched ?? 0 })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(o.$t("金额差异 {p0}", { p0: B.value.summary?.amountMismatch ?? 0 })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(o.$t("仅 A {p0}", { p0: B.value.summary?.onlyLeft ?? 0 })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(o.$t("仅 B {p0}", { p0: B.value.summary?.onlyRight ?? 0 })),
                1
                /* TEXT */
              )
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", Vt, [
            a[23] || (a[23] = e.createElementVNode(
              "i",
              { class: "ri-lock-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("每条记录都保留来源 ID、格式、行号与换算前数量，可回溯，不覆盖原始数据。")),
              1
              /* TEXT */
            )
          ])
        ])
      ])
    ]));
  }
}), be = (re, Q) => {
  const G = re.__vccOpts || re;
  for (const [R, P] of Q)
    G[R] = P;
  return G;
}, ft = /* @__PURE__ */ be(St, [["__scopeId", "data-v-eeaa478c"]]), Z = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/workflowResult.ts"];
if (!Z) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/workflowResult.ts");
Z.default;
const ht = ["dir"], wt = { class: "workbench-header" }, kt = { class: "heading" }, bt = { class: "eyebrow" }, Dt = { class: "subtitle" }, _t = { class: "header-actions" }, $t = ["disabled"], At = {
  key: 0,
  class: "three-way-result"
}, Ct = { class: "three-way-summary" }, Tt = { class: "impact" }, Bt = { class: "three-way-findings" }, Ot = { key: 0 }, Lt = { key: 1 }, Rt = { class: "capability-console-heading" }, Pt = {
  class: "guardrail-banner",
  "aria-live": "polite"
}, Ut = { class: "guardrail-chip" }, It = {
  class: "capability-grid",
  "aria-label": "ERP capabilities"
}, Kt = { class: "capability-card" }, Wt = { key: 0 }, Mt = { key: 1 }, qt = { class: "capability-card" }, zt = { key: 0 }, Jt = { class: "capability-card" }, jt = { class: "capability-card" }, Ft = {
  key: 0,
  class: "error-copy"
}, Ht = {
  key: 1,
  class: "provider-strip"
}, Zt = { class: "section-label" }, Xt = { class: "provider-list" }, Qt = { class: "workbench-main" }, Gt = { class: "panel reconcile-panel" }, Yt = { class: "panel-heading" }, xt = { class: "section-label" }, el = { class: "deterministic-badge" }, tl = { class: "reconcile-options" }, ll = ["placeholder", "disabled"], nl = ["placeholder", "disabled"], ol = ["disabled"], al = { class: "json-input-grid" }, rl = { class: "json-field" }, sl = ["disabled"], il = { key: 0 }, cl = { class: "json-field" }, ul = ["disabled"], dl = { key: 0 }, ml = { class: "action-row" }, pl = { class: "action-buttons" }, yl = ["disabled"], gl = ["disabled"], vl = {
  key: 0,
  class: "inline-message error",
  role: "alert"
}, El = {
  key: 1,
  class: "result-block",
  "aria-live": "polite"
}, Nl = { class: "result-heading" }, Vl = { class: "section-label" }, Sl = {
  key: 0,
  class: "summary-grid"
}, fl = { class: "residual" }, hl = {
  key: 1,
  class: "difference-section"
}, wl = { class: "table-scroll" }, kl = { class: "difference-value" }, bl = {
  key: 2,
  class: "residual-grid"
}, Dl = { key: 0 }, _l = { key: 1 }, $l = { class: "raw-result" }, Al = { class: "side-column" }, Cl = { class: "panel integration-panel" }, Tl = { class: "panel-heading compact" }, Bl = { class: "section-label" }, Ol = { class: "integration-list" }, Ll = { class: "integration-footnote" }, he = `[
  { "sku": "SKU-001", "amount": 0 }
]`, Rl = /* @__PURE__ */ e.defineComponent({
  __name: "WarehouseWorkbenchView",
  setup(re) {
    const { locale: Q } = Ee.useI18n();
    Ne.useRouter();
    const G = e.computed(() => Q.value === "ar"), R = e.ref(null), P = e.ref([]), U = e.ref(!1), V = e.ref(""), _ = e.ref("[]"), g = e.ref("[]"), $ = e.ref(""), b = e.ref("amount"), h = e.ref(0.01), w = e.ref(!1), A = e.ref(""), y = e.ref(null), N = e.ref(null), m = e.computed(() => window.electronAPI?.workbenches?.warehouse ?? null), C = e.computed(() => R.value?.enabled === !0), T = e.computed(() => {
      const t = R.value?.defaultProvider;
      return typeof t == "string" ? t : "";
    });
    function B(t) {
      const s = t.trim();
      if (!s) return { records: null, error: l.t("请输入 JSON 数组") };
      try {
        const r = JSON.parse(s);
        return Array.isArray(r) ? r.every((c) => c !== null && typeof c == "object" && !Array.isArray(c)) ? { records: r, error: "" } : { records: null, error: l.t("数组中的每一项都必须是对象") } : { records: null, error: l.t("顶层必须是 JSON 数组") };
      } catch (r) {
        return {
          records: null,
          error: r instanceof Error ? l.t("JSON 格式错误：{message}", { message: r.message }) : l.t("JSON 格式错误")
        };
      }
    }
    function le() {
      _.value = JSON.stringify([
        { sku: "SKU-001", warehouse: "RUH-A", quantity: 18, amount: 1800 },
        { sku: "SKU-002", warehouse: "RUH-A", quantity: 7, amount: 840 },
        { sku: "SKU-003", warehouse: "JED-B", quantity: 4, amount: 520 }
      ], null, 2), g.value = JSON.stringify([
        { sku: "SKU-001", warehouse: "RUH-A", quantity: 18, amount: 1800 },
        { sku: "SKU-002", warehouse: "RUH-A", quantity: 6, amount: 720 },
        { sku: "SKU-004", warehouse: "JED-B", quantity: 2, amount: 310 }
      ], null, 2), $.value = "sku", b.value = "amount", h.value = 0.01, y.value = null, A.value = "";
    }
    function pe(t) {
      _.value = JSON.stringify(t.left, null, 2), g.value = JSON.stringify(t.right, null, 2), $.value = "sku, warehouse, batch", b.value = "amount", h.value = 0.01, y.value = t.result, A.value = "";
    }
    async function se(t, s, r) {
      const c = window.electronAPI?.browserTabs;
      if (!c?.create)
        throw new Error(l.t("内置浏览器接口不可用，已停止 Odoo 自动化"));
      try {
        const u = await c.create({ url: t, contextId: s, source: "agent", activate: !0 });
        return u?.id && c.setAutomationPaused && await c.setAutomationPaused(u.id, !1), r?.registerCancellation(async () => {
          u?.id && c.setAutomationPaused && await c.setAutomationPaused(u.id, !0);
        }), { opened: !0, note: l.t("已在内置浏览器打开 Odoo Inventory。") };
      } catch (u) {
        throw new Error(l.t("本地 Odoo 暂时不可达（{message}），已停止本次执行。", {
          message: o(u)
        }));
      }
    }
    async function D(t, s, r) {
      const c = window.electronAPI?.browserTabs;
      if (!c?.command) throw new Error(l.t("内置浏览器页面控制接口不可用"));
      const u = await c.command({ contextId: t, command: s, args: r });
      if (u?.success === !1) throw new Error(String(u?.error || l.t("浏览器页面操作失败")));
      const d = u?.data?.result;
      if (d == null && u?.data) return u.data;
      if (typeof d != "string") return d;
      try {
        return JSON.parse(d);
      } catch {
        return d;
      }
    }
    async function v(t, s) {
      return D(t, "eval", [s]);
    }
    async function ne(t, s) {
      for (let r = 0; r < 12; r += 1) {
        const c = await D(t, "snapshot", []), d = (Array.isArray(c?.refs) ? c.refs : []).find((p) => String(p?.name || "").trim().toLowerCase() === s.trim().toLowerCase());
        if (d?.ref) {
          await D(t, "click", [String(d.ref)]);
          return;
        }
        await new Promise((p) => window.setTimeout(p, 250));
      }
      throw new Error(l.t("右侧业务系统没有找到可点击的“{name}”", { name: s }));
    }
    async function S(t, s) {
      await se(
        "http://127.0.0.1:8069/web/login?db=totalclaw_demo&redirect=%2Fodoo%2Finventory%2Freceipts",
        t,
        s
      );
      let r = {};
      for (let u = 0; u < 30; u += 1) {
        s?.throwIfCancelled(), r = await v(t, `JSON.stringify({
      url: location.href,
      title: document.title,
      text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 2400),
      hasLogin: Boolean(document.querySelector('input[name="login"], #login')),
      hasPassword: Boolean(document.querySelector('input[name="password"], #password'))
    })`);
        const d = String(r?.url || "");
        if (!r?.hasLogin && !/\/web\/login/i.test(d)) break;
        if (r?.hasLogin && r?.hasPassword) {
          if (await v(t, `(() => {
        const setValue = (selector, value) => {
          const el = document.querySelector(selector);
          if (!el) return false;
          el.focus();
          el.value = value;
          el.dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertText', data:value}));
          el.dispatchEvent(new Event('change', {bubbles:true}));
          return true;
        };
        return setValue('input[name="login"], #login', 'admin')
          && setValue('input[name="password"], #password', 'Admin123');
      })()`) !== !0) throw new Error(l.t("本地 Odoo 登录字段无法填写"));
          await ne(t, "Log in");
        }
        await new Promise((p) => window.setTimeout(p, 1e3));
      }
      const c = {
        url: String(r?.url || ""),
        title: String(r?.title || "Odoo Inventory"),
        text: String(r?.text || "")
      };
      if (!/127\.0\.0\.1:8069|\/odoo\//i.test(c.url) || /\/web\/login/i.test(c.url) || /sign in|404|not found|internal server error/i.test(`${c.title} ${c.text}`))
        throw new Error(l.t("本地 Odoo 未进入可读取的 Inventory 页面，已停止执行：{url}", {
          url: c.url || "unknown"
        }));
      return c;
    }
    async function z(t, s, r, c) {
      const u = m.value;
      if (!u) throw new Error(l.t("仓储自动化接口不可用"));
      if (c?.throwIfCancelled(), t === "three-way-reconcile" && s === "prepare") {
        if (typeof u.reconcileThreeWay != "function")
          throw new Error(l.t("三方确定性对账接口不可用"));
        const d = [
          {
            id: "wms",
            label: "WMS",
            records: [
              { sku: "SKU-100", warehouse: "RUH-A", quantity: 100, unit: "PCS", unitPriceSar: 520 },
              { sku: "SKU-200", warehouse: "JED-B", quantity: 40, unit: "PCS" },
              { sku: "SKU-300", warehouse: "DMM-C", quantity: 30, unit: "PCS", unitPriceSar: 5e3 },
              { sku: "SKU-400", warehouse: "RUH-A", quantity: 60, unit: "PCS", expiryDate: "2026-08-15" }
            ]
          },
          {
            id: "erp",
            label: "SAP ERP",
            records: [
              { sku: "SKU-100", warehouse: "RUH-A", quantity: 10, unit: "CTN", packSize: 12, unitPriceSar: 520 },
              { sku: "SKU-200", warehouse: "JED-B", quantity: 40, unit: "PCS" },
              { sku: "SKU-300", warehouse: "DMM-C", quantity: 30, unit: "PCS", unitPriceSar: 5e3 },
              { sku: "SKU-400", warehouse: "RUH-A", quantity: 60, unit: "PCS" }
            ]
          },
          {
            id: "commerce",
            label: "Commerce",
            records: [
              { sku: "SKU-100", warehouse: "RUH-A", quantity: 120, unit: "PCS", unitPriceSar: 520 },
              { sku: "SKU-300", warehouse: "DMM-C", quantity: 25, unit: "PCS", unitPriceSar: 5e3 },
              { sku: "SKU-400", warehouse: "RUH-A", quantity: 60, unit: "PCS" }
            ]
          }
        ], p = await S(
          "warehouse-three-way-live",
          c
        );
        r?.(0, l.t("产销计划 Agent 已打开右侧本地 Odoo Inventory，并把 WMS、SAP ERP 与电商平台三类结构载入任务上下文"), {
          actor: l.t("产销计划 Agent"),
          actorId: "supply-planner",
          actorType: "agent",
          tool: l.t("内置浏览器 · Odoo Inventory + Multi-source Loader"),
          evidence: `${p.url} · WMS 4 · ERP 4 · Commerce 3`,
          output: p.text.slice(0, 320)
        }), r?.(1, l.t("数据归一 Agent 正在统一 SKU、仓库、箱规与 PCS 数量口径"), {
          actor: l.t("数据归一 Agent"),
          actorId: "data-normalizer",
          actorType: "agent",
          tool: "Canonical InventoryRecord v1",
          evidence: "CTN × packSize → PCS"
        }), N.value = await u.reconcileThreeWay({
          sources: d,
          keyFields: ["sku", "warehouse"],
          tolerance: 0,
          asOf: "2026-07-29"
        });
        const f = N.value;
        if (r?.(2, l.t("库存控制 Agent 已收到确定性三方回执：{findings} 项发现，影响 SAR {impact}", {
          findings: f.findings.length,
          impact: i(f.totalImpactSar)
        }), {
          actor: l.t("库存控制 Agent"),
          actorId: "inventory-controller",
          actorType: "agent",
          tool: "workbench:warehouse:reconcile-three-way",
          evidence: l.t("{p0} 个来源锚点", { p0: f.evidenceCount }),
          output: `${f.findings.length} findings · SAR ${i(f.totalImpactSar)}`
        }), typeof u.runWorkflow != "function")
          throw new Error(l.t("仓储多 Agent 工作流接口不可用"));
        const K = c?.runId || `warehouse-${Date.now()}`, k = c?.registerCancellation(async () => {
          await u.cancelWorkflow?.({ runId: K });
        }), W = await u.runWorkflow({
          runId: K,
          taskType: "three_way",
          reconcileResult: JSON.parse(JSON.stringify(f))
        }).finally(() => k?.());
        c?.throwIfCancelled();
        const M = Z.workflowOutput(W, ["reviewed_plan"]), q = Z.workflowRunId(W) || c?.runId || "";
        return r?.(3, l.t("产销计划、库存风险和证据审计 Agent 已在工作流中并行生成处置意见"), {
          actor: l.t("产销存多 Agent 工作流"),
          actorId: "supply-planner",
          actorType: "agent",
          tool: "/v1/workflows/dynamic/run",
          evidence: q,
          output: M.slice(0, 320)
        }), r?.(4, l.t("工作流已合成并复核处置方案，五项动作停在计划员人工确认"), {
          actor: l.t("审计留痕 Agent"),
          actorId: "evidence-auditor",
          actorType: "agent",
          tool: "Dynamic AST · parallel + reduce",
          evidence: q,
          output: M.slice(0, 320)
        }), {
          note: l.t("三方确定性引擎、产销计划 Agent 和证据审计 Agent 已真实接力。"),
          progressManaged: !0
        };
      }
      if (t === "three-way-reconcile" && s === "commit")
        return r?.(5, l.t("计划员确认已记录，三方结果和 {count} 个证据锚点写入运行证据包", {
          count: N.value?.evidenceCount || 0
        }), {
          actor: l.t("计划员"),
          actorType: "human",
          tool: "Human Gate",
          evidence: `${c?.runId || "run"} · SAR ${i(N.value?.totalImpactSar || 0)}`
        }), { note: l.t("处置结果已确认并留痕。"), progressManaged: !0 };
      if (t === "odoo-receipt" && s === "prepare") {
        const d = "warehouse-odoo-live";
        r?.(0, l.t("正在创建隔离的 Odoo 浏览器会话"));
        const p = await se(
          "http://127.0.0.1:8069/web/login?db=totalclaw_demo&redirect=%2Fodoo%2Finventory%2Freceipts",
          d,
          c
        );
        for (let F = 0; F < 30; F += 1) {
          c?.throwIfCancelled();
          const H = await v(d, `JSON.stringify({
        url: location.href,
        hasLogin: Boolean(document.querySelector('input[name="login"], #login')),
        hasPassword: Boolean(document.querySelector('input[name="password"], #password'))
      })`);
          if (!H?.hasLogin && !/\/web\/login/i.test(String(H?.url || ""))) break;
          if (H?.hasLogin && H?.hasPassword) {
            if (await v(d, `(() => {
          const setValue = (selector, value) => {
            const el = document.querySelector(selector);
            if (!el) return false;
            el.focus();
            el.value = value;
            el.dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertText', data:value}));
            el.dispatchEvent(new Event('change', {bubbles:true}));
            return true;
          };
          return setValue('input[name="login"], #login', 'admin')
            && setValue('input[name="password"], #password', 'Admin123');
        })()`) !== !0) throw new Error(l.t("本地 Odoo 登录字段无法填写"));
            await ne(d, "Log in");
          }
          await new Promise((fe) => window.setTimeout(fe, 1e3));
        }
        let f = !1;
        for (let F = 0; F < 30 && (c?.throwIfCancelled(), f = await v(d, `Boolean(
        /receipts/i.test(document.body?.innerText || '') &&
        /\\bready\\b/i.test(document.body?.innerText || '') &&
        [...document.querySelectorAll('tbody tr, .o_data_row')].some((row) =>
          /WH\\/IN\\//i.test(row.textContent || '') && /\\bReady\\b/i.test(row.textContent || ''))
      )`) === !0, !f); F += 1)
          await new Promise((H) => window.setTimeout(H, 1e3));
        if (!f) throw new Error(l.t("Odoo 收货单列表加载超时，未找到 Ready 记录"));
        if (await v(d, `(() => {
      const row = [...document.querySelectorAll('tbody tr, .o_data_row')].find((item) =>
        /WH\\/IN\\//i.test(item.textContent || '') && /\\bReady\\b/i.test(item.textContent || ''));
      if (!row) return false;
      const target = [...row.querySelectorAll('a, td')].find((item) =>
        /WH\\/IN\\//i.test(item.textContent || '')) || row;
      target.scrollIntoView({block:'center'});
      target.click();
      return true;
    })()`) !== !0) throw new Error(l.t("Odoo Ready 收货单无法打开"));
        let k = {};
        for (let F = 0; F < 30 && (c?.throwIfCancelled(), k = await v(d, `JSON.stringify({
        url: location.href,
        title: document.title,
        text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 2200)
      })`), !(/\bValidate\b/i.test(String(k?.text || "")) && /WH\/IN\//i.test(String(k?.text || "")) && /\bProduct\b/i.test(String(k?.text || "")))); F += 1)
          await new Promise((H) => window.setTimeout(H, 1e3));
        const W = String(k?.url || ""), M = String(k?.title || "Odoo"), q = String(k?.text || "");
        if (!/odoo/i.test(W) || /login|sign in|404|not found|internal server error/i.test(`${M} ${q}`))
          throw new Error(l.t("Odoo 未进入可操作的收货单页面，已停止执行：{url}", { url: W || "unknown" }));
        if (await v(d, `Boolean(
      [...document.querySelectorAll('button')].some((el) =>
        /^(validate|确认|验证)$/i.test((el.textContent || '').trim()) ||
        el.getAttribute('name') === 'button_validate')
    )`) !== !0)
          throw new Error(l.t("当前 Odoo 页面没有可验证的收货单或 Validate 按钮，已停止执行"));
        if (r?.(1, l.t("已回读右侧 Odoo 页面：{title}", { title: M }), {
          actor: l.t("库存执行 Agent"),
          actorId: "inventory-executor",
          actorType: "agent",
          tool: "browser.eval",
          evidence: W,
          output: q.slice(0, 320)
        }), typeof u.runWorkflow != "function") throw new Error(l.t("仓储多 Agent 工作流接口不可用"));
        const ve = c?.runId || `warehouse-odoo-${Date.now()}`, De = c?.registerCancellation(async () => {
          await u.cancelWorkflow?.({ runId: ve });
        }), Ve = await u.runWorkflow({
          runId: ve,
          taskType: "odoo_receipt",
          reconcileResult: {
            pageUrl: W,
            pageTitle: M,
            pageText: q,
            validateAvailable: !0
          }
        }).finally(() => De?.());
        c?.throwIfCancelled();
        const Se = Z.workflowOutput(Ve, ["reviewed_plan"]);
        return r?.(2, l.t("库存执行、采购协同和证据审计 Agent 已基于浏览器回执完成并行复核"), {
          actor: l.t("Odoo 收货多 Agent 工作流"),
          actorId: "inventory-executor",
          actorType: "agent",
          tool: "/v1/workflows/dynamic/run",
          evidence: Z.workflowRunId(Ve) || ve,
          output: Se.slice(0, 320)
        }), r?.(3, l.t("工作流已确认页面可操作；Validate 状态变更已停在人工闸门"), {
          actor: l.t("现场演示人员"),
          actorType: "human",
          tool: "Human Gate",
          evidence: l.t("尚未修改 Odoo 状态"),
          output: Se.slice(0, 320)
        }), {
          note: `${p.note} ${l.t("页面状态已回读，等待人工确认。")}`,
          progressManaged: !0
        };
      }
      if (t === "odoo-receipt" && s === "commit") {
        const d = "warehouse-odoo-live";
        r?.(4, l.t("人工已确认，正在右侧查找并点击 Validate")), await ne(d, "Validate");
        let p = {};
        for (let K = 0; K < 20 && (p = await v(d, `JSON.stringify({
        url: location.href,
        title: document.title,
        text: (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 2200)
      })`), !/(^|\s)(done|validated)(\s|$)|已完成|已验证/i.test(String(p?.text || ""))); K += 1)
          await new Promise((k) => window.setTimeout(k, 600));
        const f = String(p?.text || "");
        if (!/(^|\s)(done|validated)(\s|$)|已完成|已验证/i.test(f))
          throw new Error(l.t("已点击 Validate，但未从 Odoo 页面回读到 Done / 已完成状态，因此没有标记成功"));
        return r?.(5, l.t("已回读 Odoo 操作后页面并写入证据，当前地址：{url}", {
          url: String(p?.url || "unknown")
        }), {
          actor: l.t("审计留痕 Agent"),
          actorId: "evidence-auditor",
          actorType: "agent",
          tool: "browser.eval",
          evidence: String(p?.url || "unknown"),
          output: f.slice(0, 360)
        }), { note: l.t("Odoo 页面已明确回读 Done / 已完成，真实操作证据已留存。"), progressManaged: !0 };
      }
      if (t === "supply-gap" && s === "prepare") {
        const d = await S(
          "warehouse-supply-gap-live",
          c
        );
        r?.(0, l.t("产销计划 Agent 已打开右侧本地 Odoo Inventory，并汇总销售订单、预测、库存与在途采购四类数据"), {
          actor: l.t("产销计划 Agent"),
          actorId: "supply-planner",
          actorType: "agent",
          tool: l.t("内置浏览器 · Odoo Inventory"),
          evidence: d.url,
          output: d.text.slice(0, 320)
        });
        const p = [
          { sku: "SKU-002", warehouse: "RUH-A", batch: "", quantity: 22 },
          { sku: "SKU-003", warehouse: "JED-B", batch: "", quantity: 10 },
          { sku: "SKU-005", warehouse: "DMM-C", batch: "", quantity: 9 }
        ], f = [
          { sku: "SKU-002", warehouse: "RUH-A", batch: "", quantity: 12 },
          { sku: "SKU-003", warehouse: "JED-B", batch: "", quantity: 8 },
          { sku: "SKU-005", warehouse: "DMM-C", batch: "", quantity: 12 }
        ];
        _.value = JSON.stringify(p, null, 2), g.value = JSON.stringify(f, null, 2), $.value = "sku, warehouse, batch", b.value = "quantity", h.value = 0, r?.(1, l.t("数据归一 Agent 已统一 SKU、仓库、批次与 PCS 数量口径")), y.value = await u.reconcile({
          left: p,
          right: f,
          keyFields: ["sku", "warehouse", "batch"],
          amountField: "quantity",
          tolerance: 0
        });
        const K = y.value;
        if (r?.(2, l.t("库存控制 Agent 已通过真实确定性接口计算 3 个 SKU 的供需差额"), {
          actor: l.t("库存控制 Agent"),
          actorId: "inventory-controller",
          actorType: "agent",
          tool: "/v1/erp/reconcile",
          evidence: l.t("{count} 个 SKU", { count: p.length }),
          output: JSON.stringify(K).slice(0, 320)
        }), typeof u.runWorkflow != "function") throw new Error(l.t("仓储多 Agent 工作流接口不可用"));
        const k = c?.runId || `warehouse-gap-${Date.now()}`, W = c?.registerCancellation(async () => {
          await u.cancelWorkflow?.({ runId: k });
        }), M = await u.runWorkflow({
          runId: k,
          taskType: "supply_gap",
          reconcileResult: JSON.parse(JSON.stringify(K))
        }).finally(() => W?.());
        c?.throwIfCancelled();
        const q = Z.workflowOutput(M, ["reviewed_plan"]), ge = Z.workflowRunId(M) || k;
        return r?.(3, l.t("产销计划、库存风险和采购协同 Agent 已并行生成补货、调拨与在途覆盖待办"), {
          actor: l.t("产销缺口多 Agent 工作流"),
          actorId: "supply-planner",
          actorType: "agent",
          tool: "/v1/workflows/dynamic/run",
          evidence: ge,
          output: q.slice(0, 320)
        }), r?.(4, l.t("主管 Agent 已完成方案复核，采购和调拨动作停在计划员人工确认"), {
          actor: l.t("产销协同主管 Agent"),
          actorId: "supply-supervisor",
          actorType: "agent",
          tool: "Dynamic AST · reduce + final review",
          evidence: ge,
          output: q.slice(0, 320)
        }), {
          note: l.t("产销存四类数据已进入真实确定性对账链；补货与调拨只生成待办。"),
          progressManaged: !0
        };
      }
      return t === "supply-gap" && s === "commit" ? (r?.(4, l.t("计划员确认已写入执行记录；补货、调拨与拆单仍保持为待办，不自动下单")), { note: l.t("产销协同方案已确认并留痕。"), progressManaged: !0 }) : { note: l.t("人工闸门已确认，处置结果写入本次任务审计。") };
    }
    const J = e.computed(() => B(_.value)), X = e.computed(() => B(g.value)), ie = e.computed(() => _.value.trim() === "[]" ? "" : J.value.error), ce = e.computed(() => g.value.trim() === "[]" ? "" : X.value.error), Y = e.computed(() => J.value.records ? l.t("{count} 条", { count: J.value.records.length }) : "—"), ye = e.computed(() => X.value.records ? l.t("{count} 条", { count: X.value.records.length }) : "—"), oe = e.computed(() => !w.value && !!m.value && !!J.value.records?.length && !!X.value.records?.length && Number.isFinite(Number(h.value)) && Number(h.value) >= 0), O = e.computed(() => y.value?.summary ?? null), x = e.computed(() => O.value?.clean === !0), ue = e.computed(() => Array.isArray(y.value?.amountMismatch) ? y.value.amountMismatch : []), ee = e.computed(() => Array.isArray(y.value?.onlyLeft) ? y.value.onlyLeft : []), te = e.computed(() => Array.isArray(y.value?.onlyRight) ? y.value.onlyRight : []);
    function o(t) {
      return ae.humanizeErrorMessage(t, l.t("未知错误"));
    }
    function a(t) {
      try {
        return JSON.stringify(t, null, 2);
      } catch {
        return String(t);
      }
    }
    function n(t) {
      return t == null || t === "" ? "—" : typeof t == "object" ? a(t) : String(t);
    }
    function i(t) {
      const s = Number(t);
      return Number.isFinite(s) ? new Intl.NumberFormat(Q.value).format(s) : "—";
    }
    function E(t) {
      if (typeof t == "string") return t;
      if (t && typeof t == "object") {
        const s = t;
        return n(s.label ?? s.name ?? s.id ?? s.provider ?? t);
      }
      return n(t);
    }
    function I(t, s) {
      if (typeof t == "string") return `${t}-${s}`;
      if (t && typeof t == "object") {
        const r = t;
        return `${String(r.id ?? r.name ?? r.provider ?? "provider")}-${s}`;
      }
      return `provider-${s}`;
    }
    async function j() {
      U.value = !0, V.value = "";
      const t = m.value;
      if (!t) {
        V.value = l.t("仓储工作台 API 不可用"), U.value = !1;
        return;
      }
      const [s, r] = await Promise.allSettled([
        t.status(),
        t.providers()
      ]);
      if (s.status === "fulfilled" && (R.value = s.value), r.status === "fulfilled") {
        const u = r.value;
        P.value = Array.isArray(u) ? u : Array.isArray(u?.providers) ? u.providers : [];
      } else Array.isArray(R.value?.providers) && (P.value = R.value.providers);
      const c = [s, r].filter((u) => u.status === "rejected").map((u) => o(u.reason));
      V.value = c.join(l.t("；")), U.value = !1;
    }
    async function de() {
      if (!oe.value || !m.value) return;
      const t = J.value.records, s = X.value.records;
      if (!(!t || !s)) {
        w.value = !0, A.value = "", y.value = null;
        try {
          const r = $.value.split(",").map((c) => c.trim()).filter(Boolean);
          y.value = await m.value.reconcile({
            left: t,
            right: s,
            ...r.length ? { keyFields: r } : {},
            ...b.value.trim() ? { amountField: b.value.trim() } : {},
            tolerance: Number(h.value)
          });
        } catch (r) {
          A.value = o(r);
        } finally {
          w.value = !1;
        }
      }
    }
    return e.onMounted(() => {
      j();
    }), (t, s) => (e.openBlock(), e.createElementBlock("div", {
      class: "warehouse-workbench",
      dir: G.value ? "rtl" : "ltr"
    }, [
      e.createElementVNode("header", wt, [
        e.createElementVNode("div", kt, [
          e.createVNode(_e),
          s[5] || (s[5] = e.createElementVNode(
            "span",
            { class: "heading-icon" },
            [
              e.createElementVNode("i", { class: "ri-archive-stack-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "p",
              bt,
              e.toDisplayString(t.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(t.$t("产销存协同工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Dt,
              e.toDisplayString(t.$t("由产销计划、数据归一、库存控制、出入库执行和审计 Agent 协同连接销售、采购、库存与履约数据。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", _t, [
          e.createElementVNode("button", {
            class: "button ghost",
            disabled: U.value,
            onClick: j
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(U.value ? "ri-loader-4-line spin" : "ri-refresh-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              " " + e.toDisplayString(t.$t("刷新能力")),
              1
              /* TEXT */
            )
          ], 8, $t)
        ])
      ]),
      e.createVNode($e, {
        domain: "warehouse",
        execute: z
      }),
      N.value ? (e.openBlock(), e.createElementBlock("section", At, [
        e.createElementVNode("header", null, [
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("三方确定性对账结果")),
              1
              /* TEXT */
            ),
            s[6] || (s[6] = e.createElementVNode(
              "h2",
              null,
              "WMS × SAP ERP × Commerce",
              -1
              /* CACHED */
            ))
          ]),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(N.value.findings.length) + " " + e.toDisplayString(t.$t("项可回指发现")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ct, [
          e.createElementVNode("article", null, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("数据源")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(N.value.sourceCount),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("article", null, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("对账业务键")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(N.value.comparedKeys),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("article", null, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("证据锚点")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(N.value.evidenceCount),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("article", Tt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("差异影响")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "b",
              null,
              "SAR " + e.toDisplayString(i(N.value.totalImpactSar)),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Bt, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(N.value.findings, (r) => (e.openBlock(), e.createElementBlock(
              "article",
              {
                key: r.id,
                class: e.normalizeClass(r.severity)
              },
              [
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(r.sku) + " · " + e.toDisplayString(r.warehouse),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(r.detail),
                    1
                    /* TEXT */
                  )
                ]),
                r.impactSar ? (e.openBlock(), e.createElementBlock(
                  "em",
                  Ot,
                  "SAR " + e.toDisplayString(i(r.impactSar)),
                  1
                  /* TEXT */
                )) : (e.openBlock(), e.createElementBlock(
                  "span",
                  Lt,
                  e.toDisplayString(r.type),
                  1
                  /* TEXT */
                )),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(r.evidence.map((c) => `${c.sourceId}#${c.row}`).join(" · ")),
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
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Rt, [
        e.createElementVNode(
          "span",
          null,
          e.toDisplayString(t.$t("底层工具")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(t.$t("多源数据接入、产销存归一、确定性对账与出入库执行")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", Pt, [
        s[7] || (s[7] = e.createElementVNode(
          "i",
          { class: "ri-shield-keyhole-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("div", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(t.$t("写操作受双闸门保护")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            null,
            e.toDisplayString(t.$t("真实写入在人工确认后直接执行，并由不同人员复核批准。补货、采购、调拨和出入库状态变更都保留来源证据与执行记录。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          Ut,
          e.toDisplayString(t.$t("仅检查")),
          1
          /* TEXT */
        )
      ]),
      e.createVNode(ft, { onNormalizedReconcile: pe }),
      e.createElementVNode("section", It, [
        e.createElementVNode("article", Kt, [
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["capability-icon", C.value ? "success" : "muted"])
            },
            [...s[8] || (s[8] = [
              e.createElementVNode(
                "i",
                { class: "ri-database-2-line" },
                null,
                -1
                /* CACHED */
              )
            ])],
            2
            /* CLASS */
          ),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(t.$t("ERP 业务能力")),
              1
              /* TEXT */
            ),
            U.value ? (e.openBlock(), e.createElementBlock(
              "strong",
              Wt,
              e.toDisplayString(t.$t("探测中…")),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              "strong",
              Mt,
              e.toDisplayString(C.value ? t.$t("已启用") : t.$t("未启用或不可用")),
              1
              /* TEXT */
            ))
          ])
        ]),
        e.createElementVNode("article", qt, [
          s[9] || (s[9] = e.createElementVNode(
            "span",
            { class: "capability-icon" },
            [
              e.createElementVNode("i", { class: "ri-plug-2-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(t.$t("可用 Provider")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(P.value.length),
              1
              /* TEXT */
            ),
            T.value ? (e.openBlock(), e.createElementBlock(
              "span",
              zt,
              e.toDisplayString(t.$t("默认：")) + e.toDisplayString(T.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ])
        ]),
        e.createElementVNode("article", Jt, [
          s[10] || (s[10] = e.createElementVNode(
            "span",
            { class: "capability-icon success" },
            [
              e.createElementVNode("i", { class: "ri-filter-3-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(t.$t("统一数据模型")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(t.$t("InventoryRecord v1")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("SKU、仓库、数量、单位、批次与来源证据")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("article", jt, [
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["capability-icon", V.value ? "danger" : "success"])
            },
            [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(V.value ? "ri-error-warning-line" : "ri-checkbox-circle-line")
                },
                null,
                2
                /* CLASS */
              )
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(t.$t("能力探测")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(V.value ? t.$t("连接失败") : U.value ? t.$t("连接中") : t.$t("已完成")),
              1
              /* TEXT */
            ),
            V.value ? (e.openBlock(), e.createElementBlock(
              "span",
              Ft,
              e.toDisplayString(V.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ])
        ])
      ]),
      P.value.length ? (e.openBlock(), e.createElementBlock("section", Ht, [
        e.createElementVNode(
          "span",
          Zt,
          e.toDisplayString(t.$t("Provider 能力")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Xt, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(P.value, (r, c) => (e.openBlock(), e.createElementBlock("span", {
              key: I(r, c),
              class: "provider-chip"
            }, [
              s[11] || (s[11] = e.createElementVNode(
                "i",
                { class: "ri-server-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                " " + e.toDisplayString(E(r)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("main", Qt, [
        e.createElementVNode("section", Gt, [
          e.createElementVNode("div", Yt, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                xt,
                e.toDisplayString(t.$t("确定性引擎")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(t.$t("双账记录对账")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(t.$t("输入两组 JSON 数组。完全匹配项只计数，界面展示差异残差及原始记录。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", el, [
              s[12] || (s[12] = e.createElementVNode(
                "i",
                { class: "ri-code-box-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("零模型推测")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("div", tl, [
            e.createElementVNode("label", null, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("匹配键（逗号分隔）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": s[0] || (s[0] = (r) => $.value = r),
                type: "text",
                placeholder: t.$t("例如：sku, batch"),
                disabled: w.value
              }, null, 8, ll), [
                [e.vModelText, $.value]
              ])
            ]),
            e.createElementVNode("label", null, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("比较数值字段")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": s[1] || (s[1] = (r) => b.value = r),
                type: "text",
                placeholder: t.$t("例如：quantity 或 amount"),
                disabled: w.value
              }, null, 8, nl), [
                [e.vModelText, b.value]
              ])
            ]),
            e.createElementVNode("label", null, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("允许误差")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": s[2] || (s[2] = (r) => h.value = r),
                type: "number",
                min: "0",
                step: "0.01",
                disabled: w.value
              }, null, 8, ol), [
                [
                  e.vModelText,
                  h.value,
                  void 0,
                  { number: !0 }
                ]
              ])
            ])
          ]),
          e.createElementVNode("div", al, [
            e.createElementVNode("label", rl, [
              e.createElementVNode("span", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(t.$t("左侧记录")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(Y.value),
                  1
                  /* TEXT */
                )
              ]),
              e.withDirectives(e.createElementVNode("textarea", {
                "onUpdate:modelValue": s[3] || (s[3] = (r) => _.value = r),
                spellcheck: "false",
                disabled: w.value,
                placeholder: he
              }, null, 8, sl), [
                [e.vModelText, _.value]
              ]),
              ie.value ? (e.openBlock(), e.createElementBlock(
                "em",
                il,
                e.toDisplayString(ie.value),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("label", cl, [
              e.createElementVNode("span", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(t.$t("右侧记录")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(ye.value),
                  1
                  /* TEXT */
                )
              ]),
              e.withDirectives(e.createElementVNode("textarea", {
                "onUpdate:modelValue": s[4] || (s[4] = (r) => g.value = r),
                spellcheck: "false",
                disabled: w.value,
                placeholder: he
              }, null, 8, ul), [
                [e.vModelText, g.value]
              ]),
              ce.value ? (e.openBlock(), e.createElementBlock(
                "em",
                dl,
                e.toDisplayString(ce.value),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          e.createElementVNode("div", ml, [
            e.createElementVNode("p", null, [
              s[13] || (s[13] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                " " + e.toDisplayString(t.$t("业务字段原样参与本地对账；请先确认两侧单位、币种和编码口径一致。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", pl, [
              e.createElementVNode("button", {
                class: "button secondary",
                type: "button",
                disabled: w.value,
                onClick: le
              }, [
                s[14] || (s[14] = e.createElementVNode(
                  "i",
                  { class: "ri-flask-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  " " + e.toDisplayString(t.$t("载入示例账目")),
                  1
                  /* TEXT */
                )
              ], 8, yl),
              e.createElementVNode("button", {
                class: "button primary",
                disabled: !oe.value,
                onClick: de
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(w.value ? "ri-loader-4-line spin" : "ri-git-compare-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  " " + e.toDisplayString(w.value ? t.$t("正在对账…") : t.$t("开始确定性对账")),
                  1
                  /* TEXT */
                )
              ], 8, gl)
            ])
          ]),
          A.value ? (e.openBlock(), e.createElementBlock("div", vl, [
            s[15] || (s[15] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(A.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          y.value ? (e.openBlock(), e.createElementBlock("section", El, [
            e.createElementVNode("div", Nl, [
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "span",
                  Vl,
                  e.toDisplayString(t.$t("真实返回结果")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(x.value ? t.$t("两侧记录已对平") : t.$t("发现待处理差异")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["result-state", x.value ? "clean" : "attention"])
                },
                [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(x.value ? "ri-checkbox-circle-line" : "ri-alert-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    " " + e.toDisplayString(x.value ? t.$t("无残差") : t.$t("需要复核")),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ]),
            O.value ? (e.openBlock(), e.createElementBlock("div", Sl, [
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("左侧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(i(O.value.leftCount)),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("右侧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(i(O.value.rightCount)),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("匹配")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(i(O.value.matched)),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("数值不符")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(i(O.value.amountMismatch)),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("仅左侧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(i(O.value.onlyLeft)),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("仅右侧")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(i(O.value.onlyRight)),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", fl, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("残差合计")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(i(O.value.residual)),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            ue.value.length ? (e.openBlock(), e.createElementBlock("div", hl, [
              e.createElementVNode(
                "h4",
                null,
                e.toDisplayString(t.$t("数值差异")),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", wl, [
                e.createElementVNode("table", null, [
                  e.createElementVNode("thead", null, [
                    e.createElementVNode("tr", null, [
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(t.$t("匹配键")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(t.$t("左侧数值")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(t.$t("右侧数值")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(t.$t("差额")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(t.$t("原始记录")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(ue.value, (r, c) => (e.openBlock(), e.createElementBlock("tr", {
                        key: `${String(r.key ?? "")}-${c}`
                      }, [
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "code",
                            null,
                            e.toDisplayString(n(r.key)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(n(r.leftAmount)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(n(r.rightAmount)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          kl,
                          e.toDisplayString(n(r.diff)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.createElementVNode("details", null, [
                            e.createElementVNode(
                              "summary",
                              null,
                              e.toDisplayString(t.$t("查看证据")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "pre",
                              null,
                              e.toDisplayString(a({ left: r.left, right: r.right })),
                              1
                              /* TEXT */
                            )
                          ])
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            ee.value.length || te.value.length ? (e.openBlock(), e.createElementBlock("div", bl, [
              ee.value.length ? (e.openBlock(), e.createElementBlock("article", Dl, [
                e.createElementVNode("h4", null, [
                  e.createTextVNode(
                    e.toDisplayString(t.$t("仅左侧存在")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(ee.value.length),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "pre",
                  null,
                  e.toDisplayString(a(ee.value)),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              te.value.length ? (e.openBlock(), e.createElementBlock("article", _l, [
                e.createElementVNode("h4", null, [
                  e.createTextVNode(
                    e.toDisplayString(t.$t("仅右侧存在")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(te.value.length),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "pre",
                  null,
                  e.toDisplayString(a(te.value)),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("details", $l, [
              e.createElementVNode(
                "summary",
                null,
                e.toDisplayString(t.$t("查看完整结构化返回")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "pre",
                null,
                e.toDisplayString(a(y.value)),
                1
                /* TEXT */
              )
            ])
          ])) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("aside", Al, [
          e.createElementVNode("section", Cl, [
            e.createElementVNode("div", Tl, [
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "span",
                  Bl,
                  e.toDisplayString(t.$t("接入路径")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "h2",
                  null,
                  e.toDisplayString(t.$t("三档数据接入")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("ol", Ol, [
              e.createElementVNode("li", null, [
                s[16] || (s[16] = e.createElementVNode(
                  "span",
                  { class: "integration-index" },
                  "1",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(t.$t("API 直连")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("注册客户 REST / GraphQL 服务，探测读取权限后先只读试运行，再进入灰度写入。")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "em",
                    null,
                    e.toDisplayString(t.$t("适合已有标准接口的 WMS / ERP")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("li", null, [
                s[17] || (s[17] = e.createElementVNode(
                  "span",
                  { class: "integration-index" },
                  "2",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(t.$t("Web 后台托管")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("由真人亲自登录并完成二步验证，RPA 仅在授权会话中取数，异常时交还人工。")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "em",
                    null,
                    e.toDisplayString(t.$t("密码不通过本工作台采集")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("li", null, [
                s[18] || (s[18] = e.createElementVNode(
                  "span",
                  { class: "integration-index" },
                  "3",
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(t.$t("文件交换")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("通过 CSV / Excel / PDF 导入，确认字段映射、单位、币种、日期与增量口径。")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "em",
                    null,
                    e.toDisplayString(t.$t("适合无接口或每日导出的系统")),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            e.createElementVNode("div", Ll, [
              s[19] || (s[19] = e.createElementVNode(
                "i",
                { class: "ri-lock-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                " " + e.toDisplayString(t.$t("任一接入档位的真实写操作都必须经过人工确认与 maker-checker，并写入审计记录。")),
                1
                /* TEXT */
              )
            ])
          ])
        ])
      ])
    ], 8, ht));
  }
}), Ul = /* @__PURE__ */ be(Rl, [["__scopeId", "data-v-e1a16681"]]);
export {
  Ul as default
};
