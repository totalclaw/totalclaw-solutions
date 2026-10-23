const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const o = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!o) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
o.default;
const We = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!We) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const yt = We.default, we = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!we) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
we.default;
const le = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!le) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
le.default;
const ze = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!ze) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const X = ze.default, Re = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!Re) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const Nt = Re.default, Ce = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!Ce) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
Ce.default;
const F = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!F) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
F.default;
async function v(b, D) {
  const B = window.electronAPI?.workbenches?.invoiceAgent;
  if (!B?.invoke) throw new Error(o.t("发票智能体接口不可用，请重启应用"));
  return B.invoke(b, Ce.toPlain(D ?? {}));
}
function Vt(b) {
  const D = window.electronAPI?.workbenches?.invoiceAgent;
  return D?.onEvent ? D.onEvent(b) : () => {
  };
}
const R = e.ref(null), Ee = e.ref("");
async function Z() {
  const b = await v("state.get");
  return R.value = b, Ee.value && !b.batches.some((D) => D.id === Ee.value) && (Ee.value = ""), b;
}
function Oe(b) {
  return {
    buyerName: o.t("购买方名称"),
    buyerTaxNo: o.t("购买方税号"),
    itemName: o.t("项目名称"),
    amount: o.t("金额"),
    qty: o.t("数量"),
    price: o.t("单价"),
    taxRate: o.t("税率"),
    taxIncluded: o.t("是否含税"),
    spec: o.t("规格型号"),
    unit: o.t("单位"),
    kind: o.t("发票类型"),
    orderNo: o.t("订单号"),
    remark: o.t("备注"),
    buyerAddress: o.t("购买方地址"),
    buyerPhone: o.t("购买方电话"),
    buyerBank: o.t("购买方开户银行"),
    buyerBankAccount: o.t("购买方银行账号"),
    email: o.t("邮箱"),
    mobile: o.t("手机号")
  }[b] || b;
}
function ke(b) {
  return { draft: o.t("草稿"), confirmed: o.t("已确认"), handed: o.t("开具中"), issued: o.t("已开具"), failed: o.t("开具失败"), red: o.t("已红冲") }[b];
}
function Pe(b) {
  return { draft: "", confirmed: "brand", handed: "warn", issued: "ok", failed: "bad", red: "bad" }[b];
}
const je = (b) => b === "special" ? o.t("专用发票") : o.t("普通发票"), Ve = (b) => `${Math.round(b * 1e4) / 100}%`, T = (b) => (Number(b) || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function ce(b, D = !1) {
  return v("path.open", { path: b, reveal: D });
}
const Et = { class: "ss-module" }, kt = { class: "ss-steps" }, gt = { class: "ss-grid" }, ht = { class: "ss-field" }, ft = { class: "ss-field" }, bt = { class: "ss-field" }, $t = { value: "general" }, Dt = { value: "small" }, St = { class: "ss-field" }, _t = ["value"], Bt = { class: "ss-field" }, wt = { class: "ss-field" }, Ct = { class: "ss-field" }, Tt = { class: "iv-channels" }, Lt = ["data-test", "onClick"], At = { class: "ss-actions" }, Mt = ["disabled"], Ut = { class: "ss-muted" }, It = { class: "ss-actions" }, Kt = {
  key: 0,
  class: "ss-field inline"
}, Ot = { value: "" }, Ft = ["value"], Wt = { class: "ss-actions" }, zt = ["disabled"], Rt = ["disabled"], Pt = {
  key: 0,
  class: "iv-paste"
}, jt = ["placeholder"], qt = ["disabled"], Qt = { class: "iv-preview__head" }, Gt = ["value", "onChange"], Ht = ["value"], Jt = { class: "ss-muted" }, Yt = ["onClick"], Xt = {
  key: 0,
  class: "ss-note danger"
}, Zt = { class: "iv-map" }, xt = { key: 0 }, el = ["onUpdate:modelValue"], tl = { value: "" }, ll = ["value"], nl = {
  key: 1,
  class: "ss-actions"
}, ol = ["disabled"], sl = {
  key: 0,
  class: "ss-empty"
}, al = { class: "ss-kpis" }, il = { class: "ss-kpi" }, rl = { class: "ss-kpi" }, dl = { class: "ss-kpi accent" }, cl = { class: "ss-kpi" }, ul = { class: "ss-kpi" }, ml = { class: "ss-actions" }, pl = { class: "iv-check" }, vl = ["disabled"], yl = { class: "ss-muted" }, Nl = {
  key: 0,
  class: "ss-note ok"
}, Vl = {
  key: 1,
  class: "ss-table-wrap iv-rows"
}, El = { class: "ss-table" }, kl = { class: "num" }, gl = ["title"], hl = ["value", "onChange"], fl = ["value", "onChange"], bl = ["value", "onChange"], $l = { class: "num" }, Dl = ["value", "onChange"], Sl = ["value", "onChange"], _l = ["value"], Bl = ["value"], wl = ["value", "onChange"], Cl = { value: "normal" }, Tl = { value: "special" }, Ll = { class: "iv-issues" }, Al = ["title"], Ml = { class: "iv-ops" }, Ul = ["title", "onClick"], Il = ["onClick"], Kl = {
  key: 0,
  class: "ss-empty"
}, Ol = { class: "ss-actions" }, Fl = ["disabled"], Wl = { class: "ss-muted" }, zl = {
  key: 0,
  class: "ss-note info"
}, Rl = { class: "ss-table-wrap" }, Pl = { class: "ss-table" }, jl = ["onUpdate:modelValue", "data-test"], ql = ["onUpdate:modelValue"], Ql = ["disabled", "onClick"], Gl = {
  key: 0,
  class: "ss-empty"
}, Hl = { class: "ss-actions" }, Jl = { class: "ss-field inline" }, Yl = ["disabled"], Xl = { value: "buyer" }, Zl = { value: "order" }, xl = { value: "row" }, en = ["disabled"], tn = ["disabled"], ln = {
  key: 1,
  class: "ss-muted"
}, nn = {
  key: 0,
  class: "ss-note warn"
}, on = {
  key: 1,
  class: "ss-note danger"
}, sn = {
  key: 2,
  class: "ss-kpis"
}, an = { class: "ss-kpi" }, rn = { "data-test": "iv-draft-count" }, dn = { class: "ss-kpi" }, cn = { class: "ss-kpi" }, un = { class: "ss-kpi accent" }, mn = { "data-test": "iv-draft-total" }, pn = { class: "iv-draft__head" }, vn = { key: 0 }, yn = {
  key: 1,
  class: "ss-chip"
}, Nn = { class: "ss-chip brand" }, Vn = {
  key: 2,
  class: "ss-chip warn"
}, En = { class: "iv-total" }, kn = ["onClick"], gn = ["disabled", "onClick"], hn = ["onClick"], fn = {
  key: 0,
  class: "ss-table-wrap"
}, bn = { class: "ss-table" }, $n = { class: "num" }, Dn = { class: "num" }, Sn = { class: "num" }, _n = { class: "num" }, Bn = { class: "iv-mono" }, wn = { class: "num" }, Cn = { class: "num" }, Tn = { class: "num" }, Ln = { class: "num" }, An = { class: "total" }, Mn = { colspan: "5" }, Un = { class: "num" }, In = { class: "num" }, Kn = { class: "num" }, On = {
  key: 0,
  class: "ss-muted"
}, Fn = {
  key: 0,
  class: "ss-empty"
}, Wn = { class: "ss-note info" }, zn = { class: "iv-sub-step" }, Rn = { class: "ss-actions" }, Pn = ["disabled"], jn = { class: "ss-muted" }, qn = { class: "ss-file-out" }, Qn = { "data-test": "iv-export-file" }, Gn = {
  key: 0,
  class: "ss-muted",
  "data-test": "iv-export-template"
}, Hn = {
  key: 1,
  class: "ss-note danger"
}, Jn = {
  key: 2,
  class: "ss-note danger"
}, Yn = { class: "iv-sub-step" }, Xn = { class: "ss-actions" }, Zn = ["disabled"], xn = ["disabled"], eo = ["disabled"], to = {
  key: 0,
  class: "iv-etax",
  "data-test": "iv-etax-state"
}, lo = { key: 0 }, no = {
  key: 1,
  class: "ss-muted"
}, oo = {
  key: 2,
  class: "ss-muted"
}, so = {
  key: 1,
  class: "ss-note warn",
  "data-test": "iv-etax-need"
}, ao = {
  key: 2,
  class: "ss-note danger"
}, io = {
  key: 3,
  class: "ss-note warn"
}, ro = { class: "iv-sub-step" }, co = { class: "ss-actions" }, uo = ["disabled"], mo = ["disabled"], po = { class: "ss-note info" }, vo = { class: "ss-note info" }, yo = { class: "iv-sub-step" }, No = {
  key: 0,
  class: "ss-note warn"
}, Vo = { class: "ss-grid" }, Eo = { class: "ss-field" }, ko = { class: "ss-field" }, go = ["placeholder"], ho = { class: "ss-field" }, fo = { value: !0 }, bo = { value: !1 }, $o = { class: "ss-field" }, Do = ["placeholder"], So = { class: "ss-field" }, _o = { class: "ss-actions" }, Bo = ["disabled"], wo = {
  key: 0,
  class: "ss-chip ok",
  "data-test": "iv-api-saved"
}, Co = { class: "iv-sub-step" }, To = { class: "ss-actions" }, Lo = ["disabled"], Ao = ["disabled"], Mo = {
  key: 0,
  class: "ss-note ok"
}, Uo = { class: "ss-muted" }, Io = { class: "ss-actions" }, Ko = ["placeholder"], Oo = ["disabled"], Fo = { class: "ss-muted" }, Wo = { class: "iv-qr" }, zo = { class: "ss-actions" }, Ro = ["disabled"], Po = {
  key: 3,
  class: "ss-note danger"
}, jo = {
  key: 4,
  class: "ss-note ok"
}, qo = { class: "iv-sub-step" }, Qo = { class: "ss-actions" }, Go = ["disabled"], Ho = { class: "ss-muted" }, Jo = { class: "iv-serial" }, Yo = {
  key: 0,
  class: "ss-muted"
}, Xo = { class: "ss-actions" }, Zo = ["disabled"], xo = ["disabled"], es = ["disabled"], ts = { class: "ss-muted" }, ls = {
  key: 0,
  class: "ss-note info",
  "data-test": "iv-fill-note"
}, ns = {
  key: 1,
  class: "ss-empty"
}, os = {
  key: 2,
  class: "ss-table-wrap"
}, ss = { class: "ss-table" }, as = { class: "num" }, is = { class: "iv-mono" }, rs = { class: "num" }, ds = ["onUpdate:modelValue", "placeholder", "data-test"], cs = { class: "iv-ops" }, us = ["disabled", "data-test", "onClick"], ms = ["onUpdate:modelValue", "placeholder"], ps = ["disabled", "onClick"], vs = ["onClick"], ys = {
  key: 3,
  class: "ss-note ok"
}, Ns = /* @__PURE__ */ e.defineComponent({
  __name: "IssueTab",
  setup(b, { expose: D }) {
    const B = le.useNotificationStore(), f = R, s = Ee, M = we.IV_FIELDS, c = e.ref(""), E = e.ref({}), m = e.reactive({ name: "", taxNo: "", address: "", phone: "", bank: "", bankAccount: "", drawer: "", taxpayerType: "general", defaultTaxRate: 0.13, province: "", perInvoiceLimit: 0, remainingQuota: 0 }), C = e.ref("etax_batch"), U = e.ref("buyer");
    let r = !1;
    e.watch(f, (t) => {
      !t || r || (r = !0, Object.assign(m, t.settings.seller), C.value = t.settings.channel, U.value = t.settings.mergeMode);
    }, { immediate: !0 });
    const u = e.computed(() => m.taxpayerType === "small" ? [0.01, 0.03, 0.05, 0] : [0.13, 0.09, 0.06, 0.05, 0.03, 0.01, 0]), g = [
      { key: "etax_batch", icon: "ri-file-upload-line", title: o.t("电子税务局批量开票（推荐）"), text: o.t("不用接口、不用额外付费：系统浏览器打开电子税务局，你登录扫脸，应用走到批量开票页并放入导入文件，你点「批量开具」，结果自动读回") },
      { key: "api", icon: "ri-plug-line", title: o.t("开票服务商接口（诺诺）"), text: o.t("已经开通诺税通 SaaS 接口开票的企业用：提交后由服务商开具，结果按流水号查回；税局登录验证仍要你做") }
    ];
    async function y() {
      await S("i-seller", async () => {
        if (!m.name.trim() || !m.taxNo.trim()) throw new Error(o.t("请填销售方名称和税号"));
        await v("settings.patch", { patch: { seller: { ...m }, channel: C.value, mergeMode: U.value } });
      });
    }
    const h = e.ref([]), a = e.ref([]), N = e.ref(!1), d = e.ref(""), Q = (t) => t.split(/[\\/]/).pop() || t, ne = (t) => M.filter((n) => n.required && !t.mapping[n.key]).map((n) => n.key);
    async function p() {
      const t = await v("files.pick", { kind: "excel", multi: !0 });
      await k(t);
    }
    async function k(t) {
      await S("i-import", async () => {
        for (const n of t) {
          if (h.value.some((i) => i.path === n)) continue;
          const l = await v("import.preview", { path: n });
          h.value.push({ ...l, path: n });
        }
      }, !1);
    }
    async function V(t, n) {
      const l = h.value[t];
      await S("i-import", async () => {
        h.value[t] = { ...await v("import.preview", { path: l.path, sheet: n }), path: l.path };
      }, !1);
    }
    async function W() {
      a.value = [], await S("i-import", async () => {
        const t = await v("import.commit", { items: h.value.map((n) => ({ path: n.path, sheet: n.sheet, mapping: n.mapping })) });
        h.value = [], s.value = t.batchId, t.filled && (a.value = [o.t("有 {n} 行用客户档案补全了税号等信息", { n: t.filled })]);
      });
    }
    async function qe() {
      const t = await v("files.pick", { kind: "slip", multi: !0 });
      t.length && await Le(t);
    }
    async function Le(t) {
      a.value = [], await S("i-import", async () => {
        const n = await v("import.slips", { paths: t, text: d.value });
        s.value = n.batchId, d.value = "", N.value = !1, a.value = [
          ...n.rejected.map((l) => o.t("没有收下（和原文对不上）：{p0}", { p0: l })),
          ...n.unreadable.length ? [o.t("这些文件读不出文字：{p0}", { p0: n.unreadable.join("、") })] : [],
          o.t("付款回单里通常没有税号和规范的开票项目，请在下一步补全")
        ];
      });
    }
    async function Qe() {
      !s.value || !window.confirm(o.t("删除这一批导入的数据和它的发票草稿？")) || await S("i-import", async () => {
        await v("batch.remove", { id: s.value }), s.value = "";
      });
    }
    const me = e.ref([]), A = e.ref(null), ge = e.ref(!0), oe = (t) => t.issues.some((n) => n.level === "error"), Ae = e.computed(() => (ge.value ? me.value.filter((t) => t.issues.length || t.skipped) : me.value).slice(0, 300)), x = (t) => t.target.value;
    function he(t) {
      t && (me.value = t.rows, A.value = t.summary);
    }
    async function Me() {
      if (!s.value) {
        me.value = [], A.value = null, ee.value = [];
        return;
      }
      he(await v("rows.list", { batchId: s.value })), await pe();
    }
    async function H(t, n) {
      await S("i-check", async () => {
        he(await v("rows.update", { id: t.id, patch: n })), await pe();
      }, !1);
    }
    async function Ge() {
      await S("i-check", async () => {
        const t = await v("rows.refill", { batchId: s.value });
        he(t), B.info(o.t("补全了 {n} 行", { n: t.filled }));
      }, !1);
    }
    async function He(t) {
      window.confirm(o.t("确认「{p0}」的税号 {p1} 核对无误，加入客户档案？", { p0: t.buyerName, p1: t.buyerTaxNo })) && await S("i-check", async () => {
        await v("customers.upsert", { name: t.buyerName, taxNo: t.buyerTaxNo, batchId: s.value }), await Me();
      });
    }
    const ee = e.ref([]), P = e.reactive({}), se = e.ref("");
    async function pe() {
      if (!s.value) return;
      const t = await v("goods.missing", { batchId: s.value });
      for (const n of t) (!P[n.name] || n.goods && !P[n.name].taxCode) && (P[n.name] = { taxCode: n.goods?.taxCode || "", shortName: n.goods?.shortName || "" });
      ee.value = t;
    }
    async function Je() {
      se.value = "", await S("i-code", async () => {
        const t = await v("goods.suggest", { batchId: s.value });
        await pe(), se.value = o.t("模型建议了 {a} 个，请逐条核对后点确认", { a: t.suggested }) + (t.unsure.length ? o.t("；这些它没把握，要你自己查：{p0}", { p0: t.unsure.join("、") }) : "");
      });
    }
    async function Ye(t) {
      await S("i-code", async () => {
        await v("goods.upsert", { name: t, ...P[t] }), await pe();
      });
    }
    const I = e.computed(() => (f.value?.drafts || []).filter((t) => t.batchId === s.value)), fe = e.computed(() => I.value.some((t) => t.status !== "draft" && t.status !== "confirmed")), J = e.computed(() => I.value.filter((t) => t.status === "confirmed")), j = e.computed(() => I.value.filter((t) => t.status === "handed" || t.status === "failed")), ae = e.computed(() => I.value.filter((t) => t.status === "issued").length), be = (t) => Math.round(I.value.reduce((n, l) => n + Math.round(l[t] * 100), 0)) / 100, $e = e.computed(() => be("amount")), Xe = e.computed(() => m.remainingQuota > 0 && $e.value > m.remainingQuota), ie = e.reactive(/* @__PURE__ */ new Set());
    function Ze(t) {
      ie.has(t) ? ie.delete(t) : ie.add(t);
    }
    async function xe() {
      await S("i-build", async () => {
        await v("settings.patch", { patch: { mergeMode: U.value, channel: C.value } }), await v("drafts.build", { batchId: s.value }), $.value = null;
      });
    }
    async function De(t, n) {
      await S("i-build", async () => {
        const l = await v("drafts.confirm", { ids: t, confirmed: n });
        l.blocked && B.warn(o.t("{n} 张有错误，没有确认", { n: l.blocked })), $.value = null;
      });
    }
    const et = () => De(I.value.filter((t) => t.status === "draft").map((t) => t.id), !0), $ = e.ref(null), w = e.ref(null), O = e.ref(null), tt = e.computed(() => {
      const t = w.value;
      return !t || !t.opened ? o.t("还没打开") : { portal: o.t("门户（未登录）"), login: o.t("登录页"), portal_login: o.t("门户（已登录）"), invoice_business: o.t("发票业务"), blue: o.t("蓝字发票开具"), batch: o.t("批量开票页"), makeout: o.t("单张开票表单"), other: o.t("其它页面") }[t.kind] || t.kind;
    }), lt = e.computed(() => ({
      login: o.t("请在浏览器里登录电子税务局（企业业务，扫码或账号密码 + 扫脸），登录后再点「带我到批量开票页」"),
      face: o.t("页面上弹出了扫脸二维码：请用电子税务局 APP 扫码完成扫脸认证，然后再点「带我到批量开票页」"),
      level: o.t("页面提示「当前认证等级无法访问该功能」：请在页面上点「开始认证」完成实人认证，然后再点「带我到批量开票页」"),
      ack: o.t("扫脸已通过：请在页面上点「我已知晓，继续开票」"),
      session: o.t("数电平台的会话失效了：请回到门户页重新登录，再点「带我到批量开票页」")
    })[w.value?.need || ""] || "");
    async function Se(t) {
      await S("i-issue", async () => {
        w.value = await v(t, t === "etax.goto" ? { goal: "batch" } : {});
      }, t !== "etax.state");
    }
    async function nt() {
      O.value = null, await S("i-issue", async () => {
        $.value = await v("issue.exportBatch", { batchId: s.value });
      });
    }
    async function ot() {
      const t = $.value;
      t && await S("i-issue", async () => {
        O.value = await v("etax.attach", { file: t.file, ids: t.ids });
      });
    }
    async function st(t) {
      await S("i-issue", async () => {
        await v("drafts.status", { ids: t, status: "handed" });
      });
    }
    const _ = e.reactive({ appKey: "", appSecret: "", token: "", sandbox: !0, eleAccount: "" }), ve = e.ref([]), z = e.ref(null), _e = e.ref(!1), re = e.ref("");
    e.watch(f, (t) => {
      t && !_.appKey && !_.eleAccount && Object.assign(_, { appKey: t.settings.api.appKey, sandbox: t.settings.api.sandbox, eleAccount: t.settings.api.eleAccount });
    }, { immediate: !0 });
    async function Ue() {
      const t = await S("i-issue", () => v("api.save", { appKey: _.appKey, sandbox: _.sandbox, eleAccount: _.eleAccount, ..._.appSecret ? { appSecret: _.appSecret } : {}, ..._.token ? { token: _.token } : {} }));
      return t && (_.appSecret = "", _.token = ""), t;
    }
    async function Ie(t) {
      _e.value = !1, re.value = "", await Ue() && await S("i-issue", async () => {
        z.value = { type: t, ...await v("api.login.send", { type: t }) };
      }, !1);
    }
    async function Ke() {
      const t = z.value;
      t && await S("i-issue", async () => {
        const n = await v("api.login.submit", { type: t.type, ...t.type === "1" ? { smsCode: re.value } : {} });
        _e.value = n.verifyStatus === "4", z.value = { ...t, failMsg: n.verifyStatus === "5" ? n.failMsg || o.t("验证失败") : n.verifyStatus === "3" ? o.t("还在验证中，请稍后再点一次") : "" };
      }, !1);
    }
    async function at() {
      ve.value = [], !(!_.sandbox && !window.confirm(o.t("正式环境：确定把 {n} 张发票提交给服务商开具？提交后就会真的开出发票。", { n: J.value.length }))) && await S("i-issue", async () => {
        const t = await v("api.submit", { batchId: s.value });
        ve.value = t.errors;
      });
    }
    const ye = e.reactive({}), Ne = e.reactive({}), Be = e.ref([]), te = e.ref("");
    async function it() {
      const t = await v("files.pick", { kind: "excel" });
      t.length && await S("i-fill", async () => {
        const n = await v("ledger.importIssued", { path: t[0] });
        Be.value = n.ambiguous, te.value = o.t("表里 {a} 张有效发票：回填 {b} 张；{c} 张对不上唯一一条（标红，请手填）；{d} 张不属于待回填的发票", { a: n.records, b: n.matched, c: n.ambiguous.length, d: n.unmatched });
      });
    }
    async function rt() {
      await S("i-fill", async () => {
        const t = await v("etax.records");
        te.value = o.t("批量开票记录里读到 {a} 条：回填已开具 {b} 张，失败 {c} 张", { a: t.records, b: t.issued, c: t.failed });
      });
    }
    async function dt() {
      await S("i-fill", async () => {
        const t = await v("api.poll");
        te.value = o.t("已开具 {a} 张，失败 {b} 张，还在开具中 {c} 张", { a: t.issued, b: t.failed, c: t.pending });
      });
    }
    async function ct(t) {
      await S("i-fill", () => v("drafts.status", { ids: [t.id], status: "confirmed" }));
    }
    async function ut(t) {
      await S("i-fill", () => v("drafts.status", { ids: [t.id], status: "issued", invoiceNo: ye[t.id] }));
    }
    async function mt(t) {
      await S("i-fill", () => v("drafts.status", { ids: [t.id], status: "failed", failReason: Ne[t.id] || "" }));
    }
    const K = [
      { key: "i-seller", title: o.t("销售方与开票通道"), hint: o.t("确认是哪家公司开票、走哪条通道") },
      { key: "i-import", title: o.t("导入付款单或表格"), hint: o.t("Excel / CSV 自动识别列；付款回单由模型读出后回原文核对") },
      { key: "i-check", title: o.t("逐行校验"), hint: o.t("税号、名称与税号是否矛盾、金额、税率、重复开票") },
      { key: "i-code", title: o.t("税收分类编码"), hint: o.t("每个开票项目对应一个 19 位编码，确认一次以后都记得") },
      { key: "i-build", title: o.t("组票与确认"), hint: o.t("按规则合并、拆票、算税，逐张确认") },
      { key: "i-issue", title: o.t("开具"), hint: o.t("电子税务局批量开票或服务商接口；最终按钮由你点") },
      { key: "i-fill", title: o.t("回填发票号码"), hint: o.t("按发票流水号读回结果，进入台账") }
    ];
    function Y(t, n, l) {
      return c.value === t ? { state: "running" } : E.value[t] ? { state: "failed", error: E.value[t] } : n ? { state: "done", summary: l } : { state: "todo" };
    }
    const pt = e.computed(() => !!f.value?.settings.seller.name && !!f.value?.settings.seller.taxNo), q = e.computed(() => {
      const t = A.value, n = ee.value.length > 0 && ee.value.every((l) => l.goods?.confirmed);
      return {
        "i-seller": Y("i-seller", pt.value, f.value?.settings.seller.name),
        "i-import": Y("i-import", !!s.value, t ? o.t("{n} 行", { n: t.rows }) : ""),
        "i-check": Y("i-check", !!t && t.rows > t.skipped && t.errors === 0, t ? o.t("{a} 家购买方，合计 {b} 元", { a: t.buyers, b: T(t.total) }) : ""),
        "i-code": Y("i-code", !!s.value && n),
        "i-build": Y("i-build", I.value.length > 0 && !I.value.some((l) => l.status === "draft" && !oe(l)), o.t("{n} 张", { n: I.value.length })),
        "i-issue": Y("i-issue", I.value.length > 0 && J.value.length === 0 && I.value.some((l) => l.status === "handed" || l.status === "issued")),
        "i-fill": Y("i-fill", ae.value > 0 && j.value.length === 0, o.t("已开具 {n} 张", { n: ae.value }))
      };
    }), G = e.computed(() => K.find((t) => q.value[t.key].state !== "done")?.key || "i-fill");
    async function S(t, n, l = !0) {
      c.value = t, E.value = { ...E.value, [t]: "" };
      try {
        return await n(), l && await Z(), !0;
      } catch (i) {
        return E.value = { ...E.value, [t]: F.errorMessage(i) }, F.scrollToStep(t), !1;
      } finally {
        c.value = "";
      }
    }
    function vt(t) {
      F.scrollToStep(t);
    }
    return e.watch(s, () => {
      $.value = null, O.value = null, ve.value = [], Be.value = [], te.value = "", se.value = "", Me().catch((t) => B.error(F.errorMessage(t)));
    }, { immediate: !0 }), D({ addExcel: k }), (t, n) => (e.openBlock(), e.createElementBlock("div", Et, [
      e.createVNode(Nt, {
        title: t.$t("批量开票"),
        metas: K,
        runtime: q.value,
        "current-key": G.value,
        onJump: vt
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", kt, [
        e.createCommentVNode(" 1 销售方与通道 "),
        e.createVNode(X, {
          "step-key": "i-seller",
          index: 0,
          title: K[0].title,
          hint: K[0].hint,
          runtime: q.value["i-seller"],
          "is-current": G.value === "i-seller"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", gt, [
              e.createElementVNode("label", ht, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("销售方名称")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": n[0] || (n[0] = (l) => m.name = l),
                    type: "text",
                    "data-test": "iv-seller-name"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, m.name]
                ])
              ]),
              e.createElementVNode("label", ft, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("销售方税号")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": n[1] || (n[1] = (l) => m.taxNo = l),
                    type: "text",
                    "data-test": "iv-seller-taxno"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, m.taxNo]
                ])
              ]),
              e.createElementVNode("label", bt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("纳税人类型")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": n[2] || (n[2] = (l) => m.taxpayerType = l)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      $t,
                      e.toDisplayString(t.$t("一般纳税人")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      Dt,
                      e.toDisplayString(t.$t("小规模纳税人")),
                      1
                      /* TEXT */
                    )
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, m.taxpayerType]
                ])
              ]),
              e.createElementVNode("label", St, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("默认税率（表里没写时用）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": n[3] || (n[3] = (l) => m.defaultTaxRate = l)
                  },
                  [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(u.value, (l) => (e.openBlock(), e.createElementBlock("option", {
                        key: l,
                        value: l
                      }, e.toDisplayString(e.unref(Ve)(l)), 9, _t))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelSelect,
                    m.defaultTaxRate,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", Bt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("电子税务局省份（拼音，如 jilin）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": n[4] || (n[4] = (l) => m.province = l),
                    type: "text",
                    placeholder: "jilin",
                    "data-test": "iv-seller-province"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, m.province]
                ])
              ]),
              e.createElementVNode("label", wt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("单张限额（价税合计，0 = 不拆）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": n[5] || (n[5] = (l) => m.perInvoiceLimit = l),
                    type: "number",
                    min: "0"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    m.perInvoiceLimit,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", Ct, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("本月剩余可开额度（不含税，0 = 不检查）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": n[6] || (n[6] = (l) => m.remainingQuota = l),
                    type: "number",
                    min: "0"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    m.remainingQuota,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ])
            ]),
            e.createElementVNode("div", Tt, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(g, (l) => e.createElementVNode("button", {
                  key: l.key,
                  type: "button",
                  class: e.normalizeClass(["iv-channel", { on: C.value === l.key }]),
                  "data-test": `iv-channel-${l.key}`,
                  onClick: (i) => C.value = l.key
                }, [
                  e.createElementVNode("strong", null, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(l.icon)
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(l.title),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(l.text),
                    1
                    /* TEXT */
                  )
                ], 10, Lt)),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", At, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!c.value,
                "data-test": "iv-seller-save",
                onClick: y
              }, [
                n[27] || (n[27] = e.createElementVNode(
                  "i",
                  { class: "ri-save-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("保存")),
                  1
                  /* TEXT */
                )
              ], 8, Mt),
              e.createElementVNode(
                "span",
                Ut,
                e.toDisplayString(t.$t("走电子税务局通道时，剩余额度会在第 6 步从页面上自动读回来；额度不够要先申请调额，系统不会代办")),
                1
                /* TEXT */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 2 导入 "),
        e.createVNode(X, {
          "step-key": "i-import",
          index: 1,
          title: K[1].title,
          hint: K[1].hint,
          runtime: q.value["i-import"],
          "is-current": G.value === "i-import"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", It, [
              e.unref(f)?.batches.length ? (e.openBlock(), e.createElementBlock("label", Kt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("继续处理")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": n[7] || (n[7] = (l) => e.isRef(s) ? s.value = l : null),
                    "data-test": "iv-batch-select"
                  },
                  [
                    e.createElementVNode(
                      "option",
                      Ot,
                      e.toDisplayString(t.$t("— 新建一批 —")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(f).batches, (l) => (e.openBlock(), e.createElementBlock("option", {
                        key: l.id,
                        value: l.id
                      }, e.toDisplayString(t.$t("{p0}（{n} 行）", { p0: l.name, n: l.rowCount })), 9, Ft))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, e.unref(s)]
                ])
              ])) : e.createCommentVNode("v-if", !0),
              e.unref(s) ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 1,
                  type: "button",
                  class: "ss-link",
                  onClick: Qe
                },
                e.toDisplayString(t.$t("删除这一批")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.unref(s) ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Wt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!c.value,
                    "data-test": "iv-pick-excel",
                    onClick: p
                  }, [
                    n[28] || (n[28] = e.createElementVNode(
                      "i",
                      { class: "ri-file-excel-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("选择付款单 / 开票申请表")),
                      1
                      /* TEXT */
                    )
                  ], 8, zt),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: !!c.value,
                    onClick: qe
                  }, [
                    n[29] || (n[29] = e.createElementVNode(
                      "i",
                      { class: "ri-bank-card-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("选择付款回单（PDF / 图片）")),
                      1
                      /* TEXT */
                    )
                  ], 8, Rt),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: n[8] || (n[8] = (l) => N.value = !N.value)
                    },
                    e.toDisplayString(t.$t("粘贴付款信息文字")),
                    1
                    /* TEXT */
                  )
                ]),
                N.value ? (e.openBlock(), e.createElementBlock("div", Pt, [
                  e.withDirectives(e.createElementVNode("textarea", {
                    "onUpdate:modelValue": n[9] || (n[9] = (l) => d.value = l),
                    rows: "5",
                    placeholder: t.$t("把银行回单、付款通知里的文字粘贴到这里；模型只负责读出付款方和金额，读出来的内容会逐条回原文核对")
                  }, null, 8, jt), [
                    [e.vModelText, d.value]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm primary",
                    disabled: !!c.value || !d.value.trim(),
                    onClick: n[10] || (n[10] = (l) => Le([]))
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(c.value === "i-import" ? "ri-loader-4-line spin" : "ri-file-search-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("抽取")),
                      1
                      /* TEXT */
                    )
                  ], 8, qt)
                ])) : e.createCommentVNode("v-if", !0),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(h.value, (l, i) => (e.openBlock(), e.createElementBlock("div", {
                    key: l.path,
                    class: "iv-preview"
                  }, [
                    e.createElementVNode("div", Qt, [
                      e.createElementVNode("b", null, [
                        n[30] || (n[30] = e.createElementVNode(
                          "i",
                          { class: "ri-file-excel-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(Q(l.path)),
                          1
                          /* TEXT */
                        )
                      ]),
                      l.sheets.length > 1 ? (e.openBlock(), e.createElementBlock("select", {
                        key: 0,
                        value: l.sheet,
                        onChange: (L) => V(i, L.target.value)
                      }, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(l.sheets, (L) => (e.openBlock(), e.createElementBlock("option", {
                            key: L,
                            value: L
                          }, e.toDisplayString(L), 9, Ht))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ], 40, Gt)) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode(
                        "span",
                        Jt,
                        e.toDisplayString(t.$t("{n} 行", { n: l.rowCount })),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        onClick: (L) => h.value.splice(i, 1)
                      }, e.toDisplayString(t.$t("移除")), 9, Yt)
                    ]),
                    ne(l).length ? (e.openBlock(), e.createElementBlock("p", Xt, [
                      n[31] || (n[31] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("这些必填列没认出来，请在下面手动对应：{p0}", { p0: ne(l).map(e.unref(Oe)).join("、") })),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode("div", Zt, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(M), (L) => (e.openBlock(), e.createElementBlock("label", {
                          key: L.key,
                          class: "ss-field"
                        }, [
                          e.createElementVNode("span", null, [
                            e.createTextVNode(
                              e.toDisplayString(e.unref(Oe)(L.key)),
                              1
                              /* TEXT */
                            ),
                            L.required ? (e.openBlock(), e.createElementBlock("em", xt, "*")) : e.createCommentVNode("v-if", !0)
                          ]),
                          e.withDirectives(e.createElementVNode("select", {
                            "onUpdate:modelValue": (de) => l.mapping[L.key] = de
                          }, [
                            e.createElementVNode(
                              "option",
                              tl,
                              e.toDisplayString(t.$t("（没有这一列）")),
                              1
                              /* TEXT */
                            ),
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(l.headers, (de) => (e.openBlock(), e.createElementBlock("option", {
                                key: de,
                                value: de
                              }, e.toDisplayString(de), 9, ll))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ], 8, el), [
                            [e.vModelSelect, l.mapping[L.key]]
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                h.value.length ? (e.openBlock(), e.createElementBlock("div", nl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!c.value || h.value.some((l) => ne(l).length > 0),
                    "data-test": "iv-import-commit",
                    onClick: W
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(c.value === "i-import" ? "ri-loader-4-line spin" : "ri-download-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("导入 {n} 行", { n: h.value.reduce((l, i) => l + i.rowCount, 0) })),
                      1
                      /* TEXT */
                    )
                  ], 8, ol)
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(a.value, (l) => (e.openBlock(), e.createElementBlock("p", {
                key: l,
                class: "ss-note warn"
              }, [
                n[32] || (n[32] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(l),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 3 校验 "),
        e.createVNode(X, {
          "step-key": "i-check",
          index: 2,
          title: K[2].title,
          hint: K[2].hint,
          runtime: q.value["i-check"],
          "is-current": G.value === "i-check"
        }, {
          default: e.withCtx(() => [
            e.unref(s) ? A.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", al, [
                  e.createElementVNode("div", il, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("明细行")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(A.value.rows - A.value.skipped),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", rl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("购买方")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(A.value.buyers),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", dl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("金额合计")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(T)(A.value.total)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", cl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("要修的行")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      {
                        class: e.normalizeClass({ "iv-bad": A.value.errors > 0 }),
                        "data-test": "iv-error-count"
                      },
                      e.toDisplayString(A.value.errors),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", ul, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("有提醒的行")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(A.value.warnings),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("div", ml, [
                  e.createElementVNode("label", pl, [
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": n[11] || (n[11] = (l) => ge.value = l),
                        type: "checkbox"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelCheckbox, ge.value]
                    ]),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("只看有问题的行")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!c.value,
                    onClick: Ge
                  }, [
                    n[33] || (n[33] = e.createElementVNode(
                      "i",
                      { class: "ri-contacts-book-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("用客户档案补全")),
                      1
                      /* TEXT */
                    )
                  ], 8, vl),
                  e.createElementVNode(
                    "span",
                    yl,
                    e.toDisplayString(t.$t("改完一格按回车或点别处即保存；有错误的行不会进发票")),
                    1
                    /* TEXT */
                  )
                ]),
                Ae.value.length ? (e.openBlock(), e.createElementBlock("div", Vl, [
                  e.createElementVNode("table", El, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("行")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("购买方名称")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("购买方税号")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("项目名称")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          kl,
                          e.toDisplayString(t.$t("金额")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("税率")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("发票类型")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("问题")),
                          1
                          /* TEXT */
                        ),
                        n[35] || (n[35] = e.createElementVNode(
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
                        e.renderList(Ae.value, (l) => (e.openBlock(), e.createElementBlock(
                          "tr",
                          {
                            key: l.id,
                            class: e.normalizeClass({ bad: oe(l), "iv-skipped": l.skipped })
                          },
                          [
                            e.createElementVNode("td", {
                              title: `${l.file} ${l.sheet}`
                            }, e.toDisplayString(l.rowNo), 9, gl),
                            e.createElementVNode("td", null, [
                              e.createElementVNode("input", {
                                value: l.buyerName,
                                type: "text",
                                onChange: (i) => H(l, { buyerName: x(i) })
                              }, null, 40, hl)
                            ]),
                            e.createElementVNode("td", null, [
                              e.createElementVNode("input", {
                                value: l.buyerTaxNo,
                                type: "text",
                                class: "iv-mono",
                                onChange: (i) => H(l, { buyerTaxNo: x(i) })
                              }, null, 40, fl)
                            ]),
                            e.createElementVNode("td", null, [
                              e.createElementVNode("input", {
                                value: l.itemName,
                                type: "text",
                                onChange: (i) => H(l, { itemName: x(i) })
                              }, null, 40, bl)
                            ]),
                            e.createElementVNode("td", $l, [
                              e.createElementVNode("input", {
                                value: l.amount,
                                type: "number",
                                class: "iv-num",
                                onChange: (i) => H(l, { amount: Number(x(i)) })
                              }, null, 40, Dl)
                            ]),
                            e.createElementVNode("td", null, [
                              e.createElementVNode("select", {
                                value: l.taxRate,
                                onChange: (i) => H(l, { taxRate: Number(x(i)) })
                              }, [
                                (e.openBlock(!0), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(u.value, (i) => (e.openBlock(), e.createElementBlock("option", {
                                    key: i,
                                    value: i
                                  }, e.toDisplayString(e.unref(Ve)(i)), 9, _l))),
                                  128
                                  /* KEYED_FRAGMENT */
                                )),
                                u.value.includes(l.taxRate) ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("option", {
                                  key: 0,
                                  value: l.taxRate
                                }, e.toDisplayString(Number.isNaN(l.taxRate) ? "?" : e.unref(Ve)(l.taxRate)), 9, Bl))
                              ], 40, Sl)
                            ]),
                            e.createElementVNode("td", null, [
                              e.createElementVNode("select", {
                                value: l.kind,
                                onChange: (i) => H(l, { kind: x(i) })
                              }, [
                                e.createElementVNode(
                                  "option",
                                  Cl,
                                  e.toDisplayString(t.$t("普通发票")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "option",
                                  Tl,
                                  e.toDisplayString(t.$t("专用发票")),
                                  1
                                  /* TEXT */
                                )
                              ], 40, wl)
                            ]),
                            e.createElementVNode("td", Ll, [
                              (e.openBlock(!0), e.createElementBlock(
                                e.Fragment,
                                null,
                                e.renderList(l.issues, (i, L) => (e.openBlock(), e.createElementBlock("span", {
                                  key: L,
                                  class: e.normalizeClass(["ss-chip", i.level === "error" ? "bad" : "warn"]),
                                  title: i.message
                                }, e.toDisplayString(i.message), 11, Al))),
                                128
                                /* KEYED_FRAGMENT */
                              ))
                            ]),
                            e.createElementVNode("td", Ml, [
                              l.issues.some((i) => i.code === "taxno_checksum") ? (e.openBlock(), e.createElementBlock("button", {
                                key: 0,
                                type: "button",
                                class: "ss-link",
                                title: t.$t("税号核对无误：加入客户档案后不再拦"),
                                onClick: (i) => He(l)
                              }, e.toDisplayString(t.$t("税号无误")), 9, Ul)) : e.createCommentVNode("v-if", !0),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-link",
                                onClick: (i) => H(l, { skipped: !l.skipped })
                              }, e.toDisplayString(l.skipped ? t.$t("恢复") : t.$t("不开这行")), 9, Il)
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
                ])) : (e.openBlock(), e.createElementBlock("p", Nl, [
                  n[34] || (n[34] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("没有需要处理的行")),
                    1
                    /* TEXT */
                  )
                ]))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              sl,
              e.toDisplayString(t.$t("导入后在这里逐行校验")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 4 税收分类编码 "),
        e.createVNode(X, {
          "step-key": "i-code",
          index: 3,
          title: K[3].title,
          hint: K[3].hint,
          runtime: q.value["i-code"],
          "is-current": G.value === "i-code"
        }, {
          default: e.withCtx(() => [
            e.unref(s) ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", Ol, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: !!c.value || !ee.value.some((l) => !l.goods?.taxCode),
                    onClick: Je
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(c.value === "i-code" ? "ri-loader-4-line spin" : "ri-barcode-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("让模型建议编码")),
                      1
                      /* TEXT */
                    )
                  ], 8, Fl),
                  e.createElementVNode(
                    "span",
                    Wl,
                    e.toDisplayString(t.$t("批量导入模板里「商品和服务税收编码」是必填；模型建议的要你逐条确认")),
                    1
                    /* TEXT */
                  )
                ]),
                se.value ? (e.openBlock(), e.createElementBlock("p", zl, [
                  n[36] || (n[36] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(se.value),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", Rl, [
                  e.createElementVNode("table", Pl, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("项目名称")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("税收分类编码（19 位）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("分类简称")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("状态")),
                          1
                          /* TEXT */
                        ),
                        n[37] || (n[37] = e.createElementVNode(
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
                        e.renderList(ee.value, (l) => (e.openBlock(), e.createElementBlock("tr", {
                          key: l.name
                        }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(l.name),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (i) => P[l.name].taxCode = i,
                              type: "text",
                              class: "iv-mono iv-code",
                              maxlength: "19",
                              "data-test": `iv-code-${l.name}`
                            }, null, 8, jl), [
                              [e.vModelText, P[l.name].taxCode]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (i) => P[l.name].shortName = i,
                              type: "text"
                            }, null, 8, ql), [
                              [e.vModelText, P[l.name].shortName]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["ss-chip", l.goods?.confirmed ? "ok" : l.goods?.taxCode ? "warn" : ""])
                              },
                              e.toDisplayString(l.goods?.confirmed ? t.$t("已确认") : l.goods?.taxCode ? t.$t("模型建议，待确认") : t.$t("未填")),
                              3
                              /* TEXT, CLASS */
                            )
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn sm",
                              disabled: !!c.value || P[l.name].taxCode.length !== 19,
                              onClick: (i) => Ye(l.name)
                            }, e.toDisplayString(l.goods?.confirmed ? t.$t("保存") : t.$t("确认")), 9, Ql)
                          ])
                        ]))),
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
              Kl,
              e.toDisplayString(t.$t("导入后列出这一批用到的开票项目")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 5 组票与确认 "),
        e.createVNode(X, {
          "step-key": "i-build",
          index: 4,
          title: K[4].title,
          hint: K[4].hint,
          runtime: q.value["i-build"],
          "is-current": G.value === "i-build"
        }, {
          default: e.withCtx(() => [
            e.unref(s) ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", Hl, [
                  e.createElementVNode("label", Jl, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("合并方式")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode("select", {
                      "onUpdate:modelValue": n[12] || (n[12] = (l) => U.value = l),
                      disabled: fe.value
                    }, [
                      e.createElementVNode(
                        "option",
                        Xl,
                        e.toDisplayString(t.$t("同一购买方合成一张")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        Zl,
                        e.toDisplayString(t.$t("同一订单号一张")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        xl,
                        e.toDisplayString(t.$t("一行一张")),
                        1
                        /* TEXT */
                      )
                    ], 8, Yl), [
                      [e.vModelSelect, U.value]
                    ])
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!c.value || fe.value || !A.value || A.value.rows === A.value.skipped,
                    "data-test": "iv-build",
                    onClick: xe
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(c.value === "i-build" ? "ri-loader-4-line spin" : "ri-stack-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(I.value.length ? t.$t("重新组票") : t.$t("组票")),
                      1
                      /* TEXT */
                    )
                  ], 8, en),
                  I.value.some((l) => l.status === "draft" && !oe(l)) ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn",
                    disabled: !!c.value,
                    "data-test": "iv-confirm-all",
                    onClick: et
                  }, [
                    n[38] || (n[38] = e.createElementVNode(
                      "i",
                      { class: "ri-check-double-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("全部确认（跳过有错误的）")),
                      1
                      /* TEXT */
                    )
                  ], 8, tn)) : e.createCommentVNode("v-if", !0),
                  fe.value ? (e.openBlock(), e.createElementBlock(
                    "span",
                    ln,
                    e.toDisplayString(t.$t("这一批已有交出去的发票，不能重新组票")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                A.value && A.value.errors ? (e.openBlock(), e.createElementBlock("p", nn, [
                  n[39] || (n[39] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("有 {n} 行还有错误，这些行不会进发票", { n: A.value.errors })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                Xe.value ? (e.openBlock(), e.createElementBlock("p", on, [
                  n[40] || (n[40] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("这一批不含税合计 {p0} 元，超过你填的本月剩余额度 {p1} 元：先在电子税务局申请调额，或只确认一部分", { p0: e.unref(T)($e.value), p1: e.unref(T)(m.remainingQuota) })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                I.value.length ? (e.openBlock(), e.createElementBlock("div", sn, [
                  e.createElementVNode("div", an, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("发票张数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      rn,
                      e.toDisplayString(I.value.length),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", dn, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("不含税金额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(T)($e.value)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", cn, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("税额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(T)(be("tax"))),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", un, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("价税合计")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      mn,
                      e.toDisplayString(e.unref(T)(be("total"))),
                      1
                      /* TEXT */
                    )
                  ])
                ])) : e.createCommentVNode("v-if", !0),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(I.value, (l) => (e.openBlock(), e.createElementBlock(
                    "div",
                    {
                      key: l.id,
                      class: e.normalizeClass(["iv-draft", { bad: oe(l) }])
                    },
                    [
                      e.createElementVNode("div", pn, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", e.unref(Pe)(l.status)])
                          },
                          e.toDisplayString(e.unref(ke)(l.status)),
                          3
                          /* TEXT, CLASS */
                        ),
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(l.buyerName),
                          1
                          /* TEXT */
                        ),
                        l.buyerTaxNo ? (e.openBlock(), e.createElementBlock(
                          "code",
                          vn,
                          e.toDisplayString(l.buyerTaxNo),
                          1
                          /* TEXT */
                        )) : l.personal ? (e.openBlock(), e.createElementBlock(
                          "span",
                          yn,
                          e.toDisplayString(t.$t("自然人")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode(
                          "span",
                          Nn,
                          e.toDisplayString(e.unref(je)(l.kind)),
                          1
                          /* TEXT */
                        ),
                        l.part ? (e.openBlock(), e.createElementBlock(
                          "span",
                          Vn,
                          e.toDisplayString(t.$t("拆 {a}/{b}", { a: l.part.index, b: l.part.of })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        n[41] || (n[41] = e.createElementVNode(
                          "span",
                          { class: "iv-grow" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode(
                          "span",
                          En,
                          e.toDisplayString(e.unref(T)(l.total)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (i) => Ze(l.id)
                        }, e.toDisplayString(ie.has(l.id) ? t.$t("收起") : t.$t("{n} 行明细", { n: l.lines.length })), 9, kn),
                        l.status === "draft" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 3,
                          type: "button",
                          class: "ss-btn sm primary",
                          disabled: !!c.value || oe(l),
                          onClick: (i) => De([l.id], !0)
                        }, e.toDisplayString(t.$t("确认")), 9, gn)) : l.status === "confirmed" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 4,
                          type: "button",
                          class: "ss-link",
                          onClick: (i) => De([l.id], !1)
                        }, e.toDisplayString(t.$t("撤回确认")), 9, hn)) : e.createCommentVNode("v-if", !0)
                      ]),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(l.issues, (i, L) => (e.openBlock(), e.createElementBlock(
                          "p",
                          {
                            key: L,
                            class: e.normalizeClass(["ss-note", i.level === "error" ? "danger" : "warn"])
                          },
                          [
                            n[42] || (n[42] = e.createElementVNode(
                              "i",
                              { class: "ri-error-warning-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(i.message),
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
                      ie.has(l.id) ? (e.openBlock(), e.createElementBlock("div", fn, [
                        e.createElementVNode("table", bn, [
                          e.createElementVNode("thead", null, [
                            e.createElementVNode("tr", null, [
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("项目名称")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("税收分类编码")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("规格型号")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("单位")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                $n,
                                e.toDisplayString(t.$t("数量")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                Dn,
                                e.toDisplayString(t.$t("不含税金额")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("税率")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                Sn,
                                e.toDisplayString(t.$t("税额")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                _n,
                                e.toDisplayString(t.$t("价税合计")),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          e.createElementVNode("tbody", null, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(l.lines, (i, L) => (e.openBlock(), e.createElementBlock("tr", { key: L }, [
                                e.createElementVNode(
                                  "td",
                                  null,
                                  e.toDisplayString(i.shortName ? `*${i.shortName}*` : "") + e.toDisplayString(i.itemName),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Bn,
                                  e.toDisplayString(i.taxCode),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  null,
                                  e.toDisplayString(i.spec),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  null,
                                  e.toDisplayString(i.unit),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  wn,
                                  e.toDisplayString(i.qty || ""),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Cn,
                                  e.toDisplayString(e.unref(T)(i.amount)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  null,
                                  e.toDisplayString(e.unref(Ve)(i.taxRate)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Tn,
                                  e.toDisplayString(e.unref(T)(i.tax)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Ln,
                                  e.toDisplayString(e.unref(T)(i.total)),
                                  1
                                  /* TEXT */
                                )
                              ]))),
                              128
                              /* KEYED_FRAGMENT */
                            )),
                            e.createElementVNode("tr", An, [
                              e.createElementVNode(
                                "td",
                                Mn,
                                e.toDisplayString(t.$t("合计")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Un,
                                e.toDisplayString(e.unref(T)(l.amount)),
                                1
                                /* TEXT */
                              ),
                              n[43] || (n[43] = e.createElementVNode(
                                "td",
                                null,
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createElementVNode(
                                "td",
                                In,
                                e.toDisplayString(e.unref(T)(l.tax)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Kn,
                                e.toDisplayString(e.unref(T)(l.total)),
                                1
                                /* TEXT */
                              )
                            ])
                          ])
                        ]),
                        l.remark ? (e.openBlock(), e.createElementBlock(
                          "p",
                          On,
                          e.toDisplayString(t.$t("备注：{p0}", { p0: l.remark })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])) : e.createCommentVNode("v-if", !0)
                    ],
                    2
                    /* CLASS */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Gl,
              e.toDisplayString(t.$t("校验通过后在这里组票")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 6 开具 "),
        e.createVNode(X, {
          "step-key": "i-issue",
          index: 5,
          title: K[5].title,
          hint: K[5].hint,
          runtime: q.value["i-issue"],
          "is-current": G.value === "i-issue"
        }, {
          default: e.withCtx(() => [
            !J.value.length && !j.value.length ? (e.openBlock(), e.createElementBlock(
              "p",
              Fn,
              e.toDisplayString(t.$t("没有已确认的发票")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            C.value === "etax_batch" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("p", Wn, [
                  n[44] || (n[44] = e.createElementVNode(
                    "i",
                    { class: "ri-shield-user-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("电子税务局不接受应用的内置浏览器，这里用系统的 Chrome / Edge 打开。登录和扫脸只能你本人完成；应用只负责走到「批量开票」页、放入导入文件、读回结果，不会点「批量开具」。")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", zn, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(t.$t("① 生成导入文件")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", Rn, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary",
                      disabled: !!c.value || !J.value.length,
                      "data-test": "iv-export",
                      onClick: nt
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(c.value === "i-issue" ? "ri-loader-4-line spin" : "ri-file-download-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("生成批量导入文件（{n} 张）", { n: J.value.length })),
                        1
                        /* TEXT */
                      )
                    ], 8, Pn),
                    e.createElementVNode(
                      "span",
                      jn,
                      e.toDisplayString(t.$t("在官方《批量导入开具发票模板》原文件上追加数据，其它内容不动")),
                      1
                      /* TEXT */
                    )
                  ]),
                  $.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("div", qn, [
                        n[45] || (n[45] = e.createElementVNode(
                          "i",
                          { class: "ri-file-excel-2-fill" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode(
                          "code",
                          Qn,
                          e.toDisplayString($.value.file),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(t.$t("{a} 张 · {c} 行明细 · 价税合计 {b} 元", { a: $.value.count, b: e.unref(T)($.value.total), c: $.value.lines })),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "button",
                          {
                            type: "button",
                            class: "ss-link",
                            onClick: n[13] || (n[13] = (l) => e.unref(ce)($.value.file))
                          },
                          e.toDisplayString(t.$t("打开")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "button",
                          {
                            type: "button",
                            class: "ss-link",
                            onClick: n[14] || (n[14] = (l) => e.unref(ce)($.value.file, !0))
                          },
                          e.toDisplayString(t.$t("在文件夹中显示")),
                          1
                          /* TEXT */
                        )
                      ]),
                      $.value.usedOfficial ? (e.openBlock(), e.createElementBlock(
                        "p",
                        Gn,
                        e.toDisplayString($.value.ownTemplate ? t.$t("用的是你提供的模板（{p0}）", { p0: $.value.templateVersion }) : t.$t("用的是应用自带的官方模板（{p0}）", { p0: $.value.templateVersion })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      $.value.templateIgnored || !$.value.usedOfficial ? (e.openBlock(), e.createElementBlock("p", Hn, [
                        n[46] || (n[46] = e.createElementVNode(
                          "i",
                          { class: "ri-error-warning-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("官方模板没用上（文件读不了或结构不对），这份文件只有两张数据表，电子税务局可能拒收")),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0),
                      $.value.unplaced.length ? (e.openBlock(), e.createElementBlock("p", Jn, [
                        n[47] || (n[47] = e.createElementVNode(
                          "i",
                          { class: "ri-error-warning-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("这些数据在模板里找不到对应的列，没有写进文件，请手工处理：{p0}", { p0: $.value.unplaced.join("、") })),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList($.value.warnings, (l) => (e.openBlock(), e.createElementBlock("p", {
                          key: l,
                          class: "ss-note warn"
                        }, [
                          n[48] || (n[48] = e.createElementVNode(
                            "i",
                            { class: "ri-error-warning-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(l),
                            1
                            /* TEXT */
                          )
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", Yn, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(t.$t("② 打开电子税务局，走到「批量开票」页")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", Xn, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn",
                      disabled: !!c.value,
                      "data-test": "iv-etax-open",
                      onClick: n[15] || (n[15] = (l) => Se("etax.open"))
                    }, [
                      n[49] || (n[49] = e.createElementVNode(
                        "i",
                        { class: "ri-global-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("打开电子税务局")),
                        1
                        /* TEXT */
                      )
                    ], 8, Zn),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary",
                      disabled: !!c.value,
                      "data-test": "iv-etax-goto",
                      onClick: n[16] || (n[16] = (l) => Se("etax.goto"))
                    }, [
                      n[50] || (n[50] = e.createElementVNode(
                        "i",
                        { class: "ri-route-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("带我到批量开票页")),
                        1
                        /* TEXT */
                      )
                    ], 8, xn),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      disabled: !!c.value,
                      onClick: n[17] || (n[17] = (l) => Se("etax.state"))
                    }, e.toDisplayString(t.$t("刷新状态")), 9, eo)
                  ]),
                  w.value ? (e.openBlock(), e.createElementBlock("div", to, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", w.value.need ? "warn" : w.value.kind === "batch" ? "ok" : "brand"])
                      },
                      e.toDisplayString(tt.value),
                      3
                      /* TEXT, CLASS */
                    ),
                    w.value.company ? (e.openBlock(), e.createElementBlock(
                      "span",
                      lo,
                      e.toDisplayString(w.value.company),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    w.value.quota != null ? (e.openBlock(), e.createElementBlock(
                      "span",
                      no,
                      e.toDisplayString(t.$t("可用额度 {p0} 元", { p0: e.unref(T)(w.value.quota) })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    w.value.templateVersion ? (e.openBlock(), e.createElementBlock(
                      "span",
                      oo,
                      e.toDisplayString(t.$t("页面要求的模板 {p0}", { p0: w.value.templateVersion })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])) : e.createCommentVNode("v-if", !0),
                  w.value?.need ? (e.openBlock(), e.createElementBlock("p", so, [
                    n[51] || (n[51] = e.createElementVNode(
                      "i",
                      { class: "ri-user-follow-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(lt.value),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  w.value?.sellerMismatch ? (e.openBlock(), e.createElementBlock("p", ao, [
                    n[52] || (n[52] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("电子税务局登录的是「{p0}」，和第 1 步的销售方不是同一家", { p0: w.value.company })),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  w.value && $.value && w.value.templateVersion && $.value.templateVersion && !$.value.templateVersion.includes(w.value.templateVersion.replace("V", "20")) ? (e.openBlock(), e.createElementBlock("p", io, [
                    n[53] || (n[53] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("页面要求的模板是 {p0}，这份文件用的是 {p1}：请在页面上下载最新模板，放到「设置 → 官方批量导入模板」后重新生成", { p0: w.value.templateVersion, p1: $.value.templateVersion })),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", ro, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(t.$t("③ 放入导入文件，核对后由你点「批量开具」")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", co, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary",
                      disabled: !!c.value || !$.value || w.value?.kind !== "batch" || !!w.value?.need,
                      "data-test": "iv-etax-attach",
                      onClick: ot
                    }, [
                      n[54] || (n[54] = e.createElementVNode(
                        "i",
                        { class: "ri-upload-2-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("把导入文件放进「选择文件」")),
                        1
                        /* TEXT */
                      )
                    ], 8, uo),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn",
                      disabled: !!c.value || !$.value,
                      "data-test": "iv-self-import",
                      onClick: n[18] || (n[18] = (l) => st($.value.ids))
                    }, [
                      n[55] || (n[55] = e.createElementVNode(
                        "i",
                        { class: "ri-user-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("我自己选文件导入，标记为开具中")),
                        1
                        /* TEXT */
                      )
                    ], 8, mo)
                  ]),
                  O.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode(
                        "p",
                        {
                          class: e.normalizeClass(["ss-note", O.value.previewCount === O.value.expected && !O.value.diff.length ? "ok" : "danger"])
                        },
                        [
                          n[56] || (n[56] = e.createElementVNode(
                            "i",
                            { class: "ri-list-check-2" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(t.$t("页面导入后列出 {a} 张，应为 {b} 张", { a: O.value.previewCount, b: O.value.expected })) + e.toDisplayString(O.value.diff.length ? t.$t("；这些流水号的价税合计和页面上的不一致：{p0}", { p0: O.value.diff.join("、") }) : "") + e.toDisplayString(O.value.missing.length ? t.$t("；页面上没有这些流水号：{p0}", { p0: O.value.missing.slice(0, 5).join("、") }) : ""),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(O.value.messages, (l) => (e.openBlock(), e.createElementBlock("p", {
                          key: l,
                          class: "ss-note warn"
                        }, [
                          n[57] || (n[57] = e.createElementVNode(
                            "i",
                            { class: "ri-message-2-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(l.slice(0, 200)),
                            1
                            /* TEXT */
                          )
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      e.createElementVNode("p", po, [
                        n[58] || (n[58] = e.createElementVNode(
                          "i",
                          { class: "ri-cursor-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("现在请在电子税务局页面上核对列表，确认无误后亲自点「批量开具」。开完回到下一步读回结果。")),
                          1
                          /* TEXT */
                        )
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 2 },
              [
                e.createElementVNode("p", vo, [
                  n[59] || (n[59] = e.createElementVNode(
                    "i",
                    { class: "ri-plug-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("接口通道对接的是诺诺开放平台（诺税通 SaaS）。要先在诺诺开通接口开票权限并拿到 appKey / appSecret；数电账号仍要在诺诺这边做税局登录验证（短信或扫码），失效后要重做。这条通道没有用真实诺诺账号跑通过。")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", yo, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(t.$t("① 接口凭据")),
                    1
                    /* TEXT */
                  ),
                  e.unref(f) && !e.unref(f).secretStorage ? (e.openBlock(), e.createElementBlock("p", No, [
                    n[60] || (n[60] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("这台电脑的系统钥匙串不可用，接口密钥没法安全保存，接口通道用不了")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("div", Vo, [
                    e.createElementVNode("label", Eo, [
                      n[61] || (n[61] = e.createElementVNode(
                        "span",
                        null,
                        "appKey",
                        -1
                        /* CACHED */
                      )),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": n[19] || (n[19] = (l) => _.appKey = l),
                          type: "text",
                          autocomplete: "off",
                          "data-test": "iv-api-key"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, _.appKey]
                      ])
                    ]),
                    e.createElementVNode("label", ko, [
                      n[62] || (n[62] = e.createElementVNode(
                        "span",
                        null,
                        "appSecret",
                        -1
                        /* CACHED */
                      )),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": n[20] || (n[20] = (l) => _.appSecret = l),
                        type: "password",
                        autocomplete: "new-password",
                        placeholder: e.unref(f)?.settings.api.hasSecret ? t.$t("已保存，留空不改") : "",
                        "data-test": "iv-api-secret"
                      }, null, 8, go), [
                        [e.vModelText, _.appSecret]
                      ])
                    ]),
                    e.createElementVNode("label", ho, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("环境")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "select",
                        {
                          "onUpdate:modelValue": n[21] || (n[21] = (l) => _.sandbox = l)
                        },
                        [
                          e.createElementVNode(
                            "option",
                            fo,
                            e.toDisplayString(t.$t("沙箱（测试税号，不产生真实发票）")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            bo,
                            e.toDisplayString(t.$t("正式")),
                            1
                            /* TEXT */
                          )
                        ],
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelSelect, _.sandbox]
                      ])
                    ]),
                    e.createElementVNode("label", $o, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("accessToken（沙箱应用给的才填；正式环境留空）")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": n[22] || (n[22] = (l) => _.token = l),
                        type: "password",
                        autocomplete: "new-password",
                        placeholder: e.unref(f)?.settings.api.hasToken ? t.$t("已保存，留空不改") : ""
                      }, null, 8, Do), [
                        [e.vModelText, _.token]
                      ])
                    ]),
                    e.createElementVNode("label", So, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("数电账号（登录电子税务局的手机号或证件号）")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": n[23] || (n[23] = (l) => _.eleAccount = l),
                          type: "text",
                          autocomplete: "off"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, _.eleAccount]
                      ])
                    ])
                  ]),
                  e.createElementVNode("div", _o, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn",
                      disabled: !!c.value,
                      "data-test": "iv-api-save",
                      onClick: Ue
                    }, [
                      n[63] || (n[63] = e.createElementVNode(
                        "i",
                        { class: "ri-save-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("保存凭据")),
                        1
                        /* TEXT */
                      )
                    ], 8, Bo),
                    e.unref(f)?.settings.api.hasSecret ? (e.openBlock(), e.createElementBlock("span", wo, [
                      n[64] || (n[64] = e.createElementVNode(
                        "i",
                        { class: "ri-lock-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("密钥已加密保存")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                e.createElementVNode("div", Co, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(t.$t("② 税局登录验证（登录失效时做）")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", To, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn",
                      disabled: !!c.value,
                      onClick: n[24] || (n[24] = (l) => Ie("1"))
                    }, [
                      n[65] || (n[65] = e.createElementVNode(
                        "i",
                        { class: "ri-message-3-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("发短信验证码")),
                        1
                        /* TEXT */
                      )
                    ], 8, Lo),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn",
                      disabled: !!c.value,
                      onClick: n[25] || (n[25] = (l) => Ie("3"))
                    }, [
                      n[66] || (n[66] = e.createElementVNode(
                        "i",
                        { class: "ri-qr-code-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("税务 APP 扫码")),
                        1
                        /* TEXT */
                      )
                    ], 8, Ao)
                  ]),
                  z.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      z.value.already ? (e.openBlock(), e.createElementBlock("p", Mo, [
                        n[67] || (n[67] = e.createElementVNode(
                          "i",
                          { class: "ri-check-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("已经是登录状态，不用验证")),
                          1
                          /* TEXT */
                        )
                      ])) : z.value.type === "1" ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createElementVNode(
                            "p",
                            Uo,
                            e.toDisplayString(t.$t("验证码已发到 {p0}", { p0: z.value.verifyData || t.$t("数电账号绑定的手机") })),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("div", Io, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": n[26] || (n[26] = (l) => re.value = l),
                              type: "text",
                              class: "iv-sms",
                              placeholder: t.$t("短信验证码")
                            }, null, 8, Ko), [
                              [e.vModelText, re.value]
                            ]),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn sm primary",
                              disabled: !!c.value || !re.value,
                              onClick: Ke
                            }, e.toDisplayString(t.$t("提交验证")), 9, Oo)
                          ])
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 2 },
                        [
                          e.createElementVNode(
                            "p",
                            Fo,
                            e.toDisplayString(t.$t("请用税务 APP 扫描服务商返回的二维码内容（下面是二维码字符串，可粘到任意二维码生成工具），扫完点「我已扫码」")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "code",
                            Wo,
                            e.toDisplayString(z.value.verifyData || t.$t("还没拿到二维码，请稍后重试")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("div", zo, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn sm primary",
                              disabled: !!c.value,
                              onClick: Ke
                            }, e.toDisplayString(t.$t("我已扫码")), 9, Ro)
                          ])
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )),
                      z.value.failMsg ? (e.openBlock(), e.createElementBlock("p", Po, [
                        n[68] || (n[68] = e.createElementVNode(
                          "i",
                          { class: "ri-error-warning-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(z.value.failMsg),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0),
                      _e.value ? (e.openBlock(), e.createElementBlock("p", jo, [
                        n[69] || (n[69] = e.createElementVNode(
                          "i",
                          { class: "ri-check-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("税局登录验证成功")),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", qo, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(t.$t("③ 提交开票")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", Qo, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary",
                      disabled: !!c.value || !J.value.length,
                      "data-test": "iv-api-submit",
                      onClick: at
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(c.value === "i-issue" ? "ri-loader-4-line spin" : "ri-send-plane-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("提交 {n} 张到服务商开具", { n: J.value.length })),
                        1
                        /* TEXT */
                      )
                    ], 8, Go),
                    e.createElementVNode(
                      "span",
                      Ho,
                      e.toDisplayString(_.sandbox ? t.$t("沙箱环境：不会产生真实发票") : t.$t("正式环境：点了就会真的开出发票")),
                      1
                      /* TEXT */
                    )
                  ]),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(ve.value, (l) => (e.openBlock(), e.createElementBlock("p", {
                      key: l,
                      class: "ss-note danger"
                    }, [
                      n[70] || (n[70] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(l),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(j.value, (l) => (e.openBlock(), e.createElementBlock("div", {
                key: l.id,
                class: "ss-actions"
              }, [
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["ss-chip", l.status === "failed" ? "bad" : "warn"])
                  },
                  e.toDisplayString(e.unref(ke)(l.status)),
                  3
                  /* TEXT, CLASS */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(l.buyerName) + " · " + e.toDisplayString(e.unref(T)(l.total)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "code",
                  Jo,
                  e.toDisplayString(l.serial),
                  1
                  /* TEXT */
                ),
                l.failReason ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Yo,
                  e.toDisplayString(l.failReason),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 7 回填 "),
        e.createVNode(X, {
          "step-key": "i-fill",
          index: 6,
          title: K[6].title,
          hint: K[6].hint,
          runtime: q.value["i-fill"],
          "is-current": G.value === "i-fill"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Xo, [
              C.value === "etax_batch" ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn primary",
                disabled: !!c.value || !j.value.length,
                "data-test": "iv-etax-records",
                onClick: rt
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(c.value === "i-fill" ? "ri-loader-4-line spin" : "ri-download-cloud-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("从「批量开票记录」读回结果")),
                  1
                  /* TEXT */
                )
              ], 8, Zo)) : (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn primary",
                disabled: !!c.value || !j.value.length,
                "data-test": "iv-api-poll",
                onClick: dt
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(c.value === "i-fill" ? "ri-loader-4-line spin" : "ri-refresh-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("查询开票结果")),
                  1
                  /* TEXT */
                )
              ], 8, xo)),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!c.value || !j.value.length,
                onClick: it
              }, [
                n[71] || (n[71] = e.createElementVNode(
                  "i",
                  { class: "ri-file-search-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("导入已开发票清单回填")),
                  1
                  /* TEXT */
                )
              ], 8, es),
              e.createElementVNode(
                "span",
                ts,
                e.toDisplayString(C.value === "etax_batch" ? t.$t("按发票流水号精确回填，不用猜；也可以导入「全量发票查询」导出的表") : t.$t("开票是异步的，提交后过一会儿再查")),
                1
                /* TEXT */
              )
            ]),
            te.value ? (e.openBlock(), e.createElementBlock("p", ls, [
              n[72] || (n[72] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(te.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            !j.value.length && !ae.value ? (e.openBlock(), e.createElementBlock(
              "p",
              ns,
              e.toDisplayString(t.$t("交出去的发票在这里登记结果")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            j.value.length ? (e.openBlock(), e.createElementBlock("div", os, [
              e.createElementVNode("table", ss, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("发票流水号")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("购买方名称")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      as,
                      e.toDisplayString(t.$t("价税合计")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("发票号码")),
                      1
                      /* TEXT */
                    ),
                    n[73] || (n[73] = e.createElementVNode(
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
                    e.renderList(j.value, (l) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: l.id,
                        class: e.normalizeClass({ bad: Be.value.includes(l.id) || l.status === "failed" })
                      },
                      [
                        e.createElementVNode(
                          "td",
                          is,
                          e.toDisplayString(l.serial),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(l.buyerName),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          rs,
                          e.toDisplayString(e.unref(T)(l.total)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (i) => ye[l.id] = i,
                            type: "text",
                            class: "iv-mono",
                            placeholder: t.$t("20 位数电发票号码"),
                            "data-test": `iv-no-${l.serial.slice(-4)}`
                          }, null, 8, ds), [
                            [e.vModelText, ye[l.id]]
                          ])
                        ]),
                        e.createElementVNode("td", cs, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn sm primary",
                            disabled: !!c.value || !ye[l.id],
                            "data-test": `iv-issued-${l.serial.slice(-4)}`,
                            onClick: (i) => ut(l)
                          }, e.toDisplayString(t.$t("已开具")), 9, us),
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (i) => Ne[l.id] = i,
                            type: "text",
                            placeholder: t.$t("没开成的原因")
                          }, null, 8, ms), [
                            [e.vModelText, Ne[l.id]]
                          ]),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            disabled: !Ne[l.id],
                            onClick: (i) => mt(l)
                          }, e.toDisplayString(t.$t("标记没开成")), 9, ps),
                          l.status === "failed" ? (e.openBlock(), e.createElementBlock("button", {
                            key: 0,
                            type: "button",
                            class: "ss-link",
                            onClick: (i) => ct(l)
                          }, e.toDisplayString(t.$t("改回已确认，重新开")), 9, vs)) : e.createCommentVNode("v-if", !0)
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
            ae.value ? (e.openBlock(), e.createElementBlock("p", ys, [
              n[74] || (n[74] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("这一批已开具 {n} 张，在「发票台账」里可以导出、附发票文件、登记红冲", { n: ae.value })),
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
}), ue = (b, D) => {
  const B = b.__vccOpts || b;
  for (const [f, s] of D)
    B[f] = s;
  return B;
}, Vs = /* @__PURE__ */ ue(Ns, [["__scopeId", "data-v-062b4f59"]]), Te = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!Te) throw new Error("宿主模块未就绪：npm:vue-router");
Te.default;
const Es = { class: "ss-module" }, ks = { class: "ss-kpis" }, gs = { class: "ss-kpi" }, hs = { class: "ss-kpi accent" }, fs = { class: "ss-kpi" }, bs = { class: "ss-kpi" }, $s = { class: "ss-kpi" }, Ds = { class: "ss-actions" }, Ss = ["placeholder"], _s = { value: "" }, Bs = ["value"], ws = ["disabled"], Cs = {
  key: 0,
  class: "ss-file-out"
}, Ts = {
  key: 1,
  class: "ss-empty"
}, Ls = {
  key: 2,
  class: "ss-table-wrap"
}, As = {
  class: "ss-table",
  "data-test": "iv-ledger"
}, Ms = { class: "num" }, Us = ["title"], Is = {
  key: 0,
  class: "iv-sub"
}, Ks = { class: "num" }, Os = { class: "iv-mono" }, Fs = { class: "iv-ops" }, Ws = ["onClick"], zs = ["onClick"], Rs = ["href"], Ps = ["onClick"], js = ["onClick"], qs = ["onClick"], Qs = { key: 0 }, Gs = {
  colspan: "8",
  class: "iv-red"
}, Hs = { class: "ss-muted" }, Js = { class: "ss-actions" }, Ys = ["placeholder"], Xs = ["disabled", "onClick"], Zs = ["disabled", "onClick"], xs = /* @__PURE__ */ e.defineComponent({
  __name: "LedgerTab",
  setup(b) {
    const D = le.useNotificationStore(), B = Te.useRouter(), f = ["confirmed", "handed", "issued", "failed", "red"], s = e.ref(""), M = e.ref(""), c = e.ref(!1), E = e.ref(""), m = e.ref(""), C = e.ref(""), U = e.computed(() => (R.value?.drafts || []).filter((p) => p.status !== "draft")), r = e.computed(() => {
      const p = s.value.trim().toLowerCase();
      return U.value.filter((k) => (!M.value || k.status === M.value) && (!p || [k.buyerName, k.buyerTaxNo, k.invoiceNo || "", ...k.orderNos].some((V) => V.toLowerCase().includes(p))));
    }), u = (p) => U.value.filter((k) => k.status === p).length, g = e.computed(() => Math.round(U.value.filter((p) => p.status === "issued").reduce((p, k) => p + Math.round(k.total * 100), 0)) / 100), y = (p) => R.value?.batches.find((k) => k.id === p)?.name || "";
    async function h(p) {
      c.value = !0;
      try {
        return await p(), await Z(), !0;
      } catch (k) {
        return D.error(F.errorMessage(k)), !1;
      } finally {
        c.value = !1;
      }
    }
    async function a() {
      await h(async () => {
        E.value = await v("ledger.export");
      });
    }
    async function N(p) {
      await h(() => v("ledger.attach", { id: p.id }));
    }
    async function d(p, k) {
      await h(() => v("drafts.status", { ids: [p.id], status: k })) && (m.value = "");
    }
    async function Q(p) {
      await h(() => v("ledger.redNote", { id: p.id, reason: C.value })) && D.success(o.t("已记下，红冲完成后回来点「我已红冲」"));
    }
    function ne(p) {
      B.push(`/conversations/${p}`).catch((k) => D.error(F.errorMessage(k)));
    }
    return (p, k) => (e.openBlock(), e.createElementBlock("div", Es, [
      e.createElementVNode("div", ks, [
        e.createElementVNode("div", gs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(p.$t("已开具")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(u("issued")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", hs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(p.$t("已开具价税合计")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(T)(g.value)),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", fs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(p.$t("开具中")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(u("handed")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", bs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(p.$t("开具失败")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(u("failed")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", $s, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(p.$t("已红冲")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(u("red")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("div", Ds, [
        e.withDirectives(e.createElementVNode("input", {
          "onUpdate:modelValue": k[0] || (k[0] = (V) => s.value = V),
          type: "search",
          class: "iv-search",
          placeholder: p.$t("搜购买方、税号、发票号码、订单号")
        }, null, 8, Ss), [
          [e.vModelText, s.value]
        ]),
        e.withDirectives(e.createElementVNode(
          "select",
          {
            "onUpdate:modelValue": k[1] || (k[1] = (V) => M.value = V),
            class: "iv-filter"
          },
          [
            e.createElementVNode(
              "option",
              _s,
              e.toDisplayString(p.$t("全部状态")),
              1
              /* TEXT */
            ),
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(f, (V) => e.createElementVNode("option", {
                key: V,
                value: V
              }, e.toDisplayString(e.unref(ke)(V)), 9, Bs)),
              64
              /* STABLE_FRAGMENT */
            ))
          ],
          512
          /* NEED_PATCH */
        ), [
          [e.vModelSelect, M.value]
        ]),
        k[6] || (k[6] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn",
          disabled: c.value || !r.value.length,
          "data-test": "iv-ledger-export",
          onClick: a
        }, [
          k[5] || (k[5] = e.createElementVNode(
            "i",
            { class: "ri-file-excel-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(p.$t("导出台账")),
            1
            /* TEXT */
          )
        ], 8, ws)
      ]),
      E.value ? (e.openBlock(), e.createElementBlock("div", Cs, [
        k[7] || (k[7] = e.createElementVNode(
          "i",
          { class: "ri-file-excel-2-fill" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "code",
          null,
          e.toDisplayString(E.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: k[2] || (k[2] = (V) => e.unref(ce)(E.value))
          },
          e.toDisplayString(p.$t("打开")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: k[3] || (k[3] = (V) => e.unref(ce)(E.value, !0))
          },
          e.toDisplayString(p.$t("在文件夹中显示")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      r.value.length ? (e.openBlock(), e.createElementBlock("div", Ls, [
        e.createElementVNode("table", As, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
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
                e.toDisplayString(p.$t("购买方名称")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(p.$t("票种")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                Ms,
                e.toDisplayString(p.$t("价税合计")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(p.$t("发票号码")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(p.$t("开票日期")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(p.$t("批次")),
                1
                /* TEXT */
              ),
              k[8] || (k[8] = e.createElementVNode(
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
              e.renderList(r.value, (V) => (e.openBlock(), e.createElementBlock(
                e.Fragment,
                {
                  key: V.id
                },
                [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode("td", null, [
                      e.createElementVNode("span", {
                        class: e.normalizeClass(["ss-chip", e.unref(Pe)(V.status)]),
                        title: V.failReason || V.redReason
                      }, e.toDisplayString(e.unref(ke)(V.status)), 11, Us)
                    ]),
                    e.createElementVNode("td", null, [
                      e.createTextVNode(
                        e.toDisplayString(V.buyerName),
                        1
                        /* TEXT */
                      ),
                      V.buyerTaxNo ? (e.openBlock(), e.createElementBlock(
                        "small",
                        Is,
                        e.toDisplayString(V.buyerTaxNo),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(e.unref(je)(V.kind)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Ks,
                      e.toDisplayString(e.unref(T)(V.total)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Os,
                      e.toDisplayString(V.invoiceNo || "—"),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(V.issuedAt || "—"),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(y(V.batchId)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", Fs, [
                      V.file ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-link",
                        onClick: (W) => e.unref(ce)(V.file)
                      }, e.toDisplayString(p.$t("发票文件")), 9, Ws)) : V.status === "issued" ? (e.openBlock(), e.createElementBlock("button", {
                        key: 1,
                        type: "button",
                        class: "ss-link",
                        onClick: (W) => N(V)
                      }, e.toDisplayString(p.$t("附发票文件")), 9, zs)) : e.createCommentVNode("v-if", !0),
                      V.pdfUrl ? (e.openBlock(), e.createElementBlock("a", {
                        key: 2,
                        class: "ss-link",
                        href: V.pdfUrl,
                        target: "_blank",
                        rel: "noopener"
                      }, "PDF", 8, Rs)) : e.createCommentVNode("v-if", !0),
                      V.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                        key: 3,
                        type: "button",
                        class: "ss-link",
                        onClick: (W) => ne(V.conversationId)
                      }, e.toDisplayString(p.$t("执行过程")), 9, Ps)) : e.createCommentVNode("v-if", !0),
                      V.status === "issued" ? (e.openBlock(), e.createElementBlock("button", {
                        key: 4,
                        type: "button",
                        class: "ss-link",
                        onClick: (W) => m.value = m.value === V.id ? "" : V.id
                      }, e.toDisplayString(p.$t("红冲")), 9, js)) : e.createCommentVNode("v-if", !0),
                      V.status === "failed" ? (e.openBlock(), e.createElementBlock("button", {
                        key: 5,
                        type: "button",
                        class: "ss-link",
                        onClick: (W) => d(V, "confirmed")
                      }, e.toDisplayString(p.$t("重新开具")), 9, qs)) : e.createCommentVNode("v-if", !0)
                    ])
                  ]),
                  m.value === V.id ? (e.openBlock(), e.createElementBlock("tr", Qs, [
                    e.createElementVNode("td", Gs, [
                      e.createElementVNode(
                        "p",
                        Hs,
                        e.toDisplayString(p.$t("红冲要你本人在电子税务局「发票业务 → 红字发票开具」里发起《红字发票信息确认单》：对方未确认用途的由你直接开具红字发票，已确认用途的要对方确认后才能开。这里只登记原因和结果，不代你操作。")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("div", Js, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": k[4] || (k[4] = (W) => C.value = W),
                          type: "text",
                          class: "iv-search",
                          placeholder: p.$t("冲红原因，如：开票有误、销货退回、服务中止、销售折让")
                        }, null, 8, Ys), [
                          [e.vModelText, C.value]
                        ]),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm",
                          disabled: c.value || !C.value.trim(),
                          onClick: (W) => Q(V)
                        }, e.toDisplayString(p.$t("记下原因")), 9, Xs),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm primary",
                          disabled: c.value,
                          onClick: (W) => d(V, "red")
                        }, e.toDisplayString(p.$t("我已红冲，标记")), 9, Zs)
                      ])
                    ])
                  ])) : e.createCommentVNode("v-if", !0)
                ],
                64
                /* STABLE_FRAGMENT */
              ))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        Ts,
        e.toDisplayString(p.$t("确认过的发票会出现在这里")),
        1
        /* TEXT */
      ))
    ]));
  }
}), ea = /* @__PURE__ */ ue(xs, [["__scopeId", "data-v-a580ca8f"]]), ta = { class: "ss-module" }, la = { class: "iv-panel" }, na = { class: "ss-grid" }, oa = { class: "ss-field" }, sa = { class: "ss-field" }, aa = { class: "ss-field" }, ia = { class: "ss-field" }, ra = { class: "ss-field" }, da = { class: "ss-field" }, ca = { class: "ss-field" }, ua = { class: "ss-actions" }, ma = ["disabled"], pa = ["disabled"], va = {
  key: 0,
  class: "ss-empty"
}, ya = {
  key: 1,
  class: "ss-table-wrap iv-scroll"
}, Na = { class: "ss-table" }, Va = { class: "iv-mono" }, Ea = { class: "iv-ops" }, ka = ["onClick"], ga = ["onClick"], ha = { class: "iv-panel" }, fa = { class: "ss-grid" }, ba = { class: "ss-field" }, $a = { class: "ss-field" }, Da = { class: "ss-field" }, Sa = { class: "ss-field" }, _a = { class: "ss-field" }, Ba = { class: "ss-actions" }, wa = ["disabled"], Ca = {
  key: 0,
  class: "ss-empty"
}, Ta = {
  key: 1,
  class: "ss-table-wrap iv-scroll"
}, La = { class: "ss-table" }, Aa = { class: "iv-mono" }, Ma = { class: "iv-ops" }, Ua = ["onClick"], Ia = ["onClick"], Ka = ["onClick"], Oa = /* @__PURE__ */ e.defineComponent({
  __name: "ArchiveTab",
  setup(b) {
    const D = le.useNotificationStore(), B = e.ref(!1), f = e.computed(() => R.value?.customers || []), s = e.computed(() => R.value?.goods || []), M = () => ({ id: "", name: "", taxNo: "", address: "", phone: "", bank: "", bankAccount: "", email: "" }), c = () => ({ id: "", name: "", taxCode: "", shortName: "", spec: "", unit: "" }), E = e.reactive(M()), m = e.reactive(c()), C = () => Object.assign(E, M()), U = () => Object.assign(m, c());
    async function r(a) {
      B.value = !0;
      try {
        return await a(), await Z(), !0;
      } catch (N) {
        return D.error(F.errorMessage(N)), !1;
      } finally {
        B.value = !1;
      }
    }
    async function u() {
      await r(() => v("customers.upsert", { ...E, ...E.id ? {} : { id: void 0 } })) && C();
    }
    async function g(a) {
      await r(() => v("customers.remove", { id: a }));
    }
    async function y() {
      const a = await v("files.pick", { kind: "excel" });
      a.length && await r(async () => {
        const N = await v("customers.import", { path: a[0] });
        D.success(o.t("导入 {a} 家客户（表里 {b} 行）", { a: N.imported, b: N.total }));
      });
    }
    async function h() {
      await r(() => v("goods.upsert", { ...m, ...m.id ? {} : { id: void 0 } })) && U();
    }
    return (a, N) => (e.openBlock(), e.createElementBlock("div", ta, [
      e.createElementVNode("section", la, [
        e.createElementVNode("h3", null, [
          e.createTextVNode(
            e.toDisplayString(a.$t("客户档案")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(a.$t("开过票的购买方自动记进来；下次表里只写名称，税号等信息自动补全")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", na, [
          e.createElementVNode("label", oa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[0] || (N[0] = (d) => E.name = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, E.name]
            ])
          ]),
          e.createElementVNode("label", sa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("税号")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[1] || (N[1] = (d) => E.taxNo = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, E.taxNo]
            ])
          ]),
          e.createElementVNode("label", aa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("地址")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[2] || (N[2] = (d) => E.address = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, E.address]
            ])
          ]),
          e.createElementVNode("label", ia, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("电话")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[3] || (N[3] = (d) => E.phone = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, E.phone]
            ])
          ]),
          e.createElementVNode("label", ra, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("开户银行")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[4] || (N[4] = (d) => E.bank = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, E.bank]
            ])
          ]),
          e.createElementVNode("label", da, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("银行账号")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[5] || (N[5] = (d) => E.bankAccount = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, E.bankAccount]
            ])
          ]),
          e.createElementVNode("label", ca, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("邮箱")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[6] || (N[6] = (d) => E.email = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, E.email]
            ])
          ])
        ]),
        e.createElementVNode("div", ua, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: B.value || !E.name.trim(),
            onClick: u
          }, [
            N[12] || (N[12] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.id ? a.$t("保存修改") : a.$t("添加客户")),
              1
              /* TEXT */
            )
          ], 8, ma),
          E.id ? (e.openBlock(), e.createElementBlock(
            "button",
            {
              key: 0,
              type: "button",
              class: "ss-link",
              onClick: C
            },
            e.toDisplayString(a.$t("取消")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: B.value,
            onClick: y
          }, [
            N[13] || (N[13] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.$t("从表格导入")),
              1
              /* TEXT */
            )
          ], 8, pa)
        ]),
        f.value.length ? (e.openBlock(), e.createElementBlock("div", ya, [
          e.createElementVNode("table", Na, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("名称")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("税号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("地址、电话")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("开户行及账号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("邮箱")),
                  1
                  /* TEXT */
                ),
                N[14] || (N[14] = e.createElementVNode(
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
                e.renderList(f.value, (d) => (e.openBlock(), e.createElementBlock("tr", {
                  key: d.id
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    Va,
                    e.toDisplayString(d.taxNo),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.address) + " " + e.toDisplayString(d.phone),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.bank) + " " + e.toDisplayString(d.bankAccount),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.email),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", Ea, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (Q) => Object.assign(E, d)
                    }, e.toDisplayString(a.$t("改")), 9, ka),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (Q) => g(d.id)
                    }, e.toDisplayString(a.$t("删除")), 9, ga)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          va,
          e.toDisplayString(a.$t("还没有客户")),
          1
          /* TEXT */
        ))
      ]),
      e.createElementVNode("section", ha, [
        e.createElementVNode("h3", null, [
          e.createTextVNode(
            e.toDisplayString(a.$t("商品档案")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(a.$t("开票项目名称对应的税收分类编码；模型建议的要你确认后才会用")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", fa, [
          e.createElementVNode("label", ba, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("项目名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[7] || (N[7] = (d) => m.name = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, m.name]
            ])
          ]),
          e.createElementVNode("label", $a, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("税收分类编码（19 位）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[8] || (N[8] = (d) => m.taxCode = d),
                type: "text",
                maxlength: "19"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, m.taxCode]
            ])
          ]),
          e.createElementVNode("label", Da, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("分类简称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[9] || (N[9] = (d) => m.shortName = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, m.shortName]
            ])
          ]),
          e.createElementVNode("label", Sa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("规格型号")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[10] || (N[10] = (d) => m.spec = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, m.spec]
            ])
          ]),
          e.createElementVNode("label", _a, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("单位")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": N[11] || (N[11] = (d) => m.unit = d),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, m.unit]
            ])
          ])
        ]),
        e.createElementVNode("div", Ba, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: B.value || !m.name.trim() || m.taxCode.length !== 19,
            onClick: h
          }, [
            N[15] || (N[15] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(m.id ? a.$t("保存修改") : a.$t("添加商品")),
              1
              /* TEXT */
            )
          ], 8, wa),
          m.id ? (e.openBlock(), e.createElementBlock(
            "button",
            {
              key: 0,
              type: "button",
              class: "ss-link",
              onClick: U
            },
            e.toDisplayString(a.$t("取消")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        s.value.length ? (e.openBlock(), e.createElementBlock("div", Ta, [
          e.createElementVNode("table", La, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("项目名称")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("税收分类编码")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("分类简称")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("规格型号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("单位")),
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
                N[16] || (N[16] = e.createElementVNode(
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
                e.renderList(s.value, (d) => (e.openBlock(), e.createElementBlock("tr", {
                  key: d.id
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    Aa,
                    e.toDisplayString(d.taxCode),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.shortName),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.spec),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(d.unit),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", d.confirmed ? "ok" : "warn"])
                      },
                      e.toDisplayString(d.confirmed ? a.$t("已确认") : a.$t("模型建议，待确认")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("td", Ma, [
                    d.confirmed ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: (Q) => r(() => e.unref(v)("goods.confirm", { id: d.id }))
                    }, e.toDisplayString(a.$t("确认")), 9, Ua)),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (Q) => Object.assign(m, { id: d.id, name: d.name, taxCode: d.taxCode, shortName: d.shortName, spec: d.spec, unit: d.unit })
                    }, e.toDisplayString(a.$t("改")), 9, Ia),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (Q) => r(() => e.unref(v)("goods.remove", { id: d.id }))
                    }, e.toDisplayString(a.$t("删除")), 9, Ka)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Ca,
          e.toDisplayString(a.$t("还没有商品")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), Fa = /* @__PURE__ */ ue(Oa, [["__scopeId", "data-v-36916a01"]]), Wa = { class: "ss-module iv-settings" }, za = { class: "iv-panel" }, Ra = { class: "ss-grid" }, Pa = { class: "ss-field" }, ja = { class: "ss-field" }, qa = { class: "ss-field" }, Qa = { class: "ss-field" }, Ga = { class: "ss-field" }, Ha = { class: "ss-muted" }, Ja = { class: "iv-panel" }, Ya = { class: "ss-grid" }, Xa = { class: "ss-field" }, Za = { value: "normal" }, xa = { value: "special" }, ei = { class: "ss-field" }, ti = { value: !0 }, li = { value: !1 }, ni = { class: "ss-field" }, oi = { class: "iv-panel" }, si = { class: "ss-muted" }, ai = { class: "ss-actions" }, ii = {
  key: 0,
  class: "iv-path"
}, ri = { class: "iv-panel" }, di = { class: "ss-actions" }, ci = { class: "iv-path" }, ui = { class: "ss-field iv-model" }, mi = { value: "" }, pi = ["value"], vi = { class: "ss-muted" }, yi = { class: "ss-actions" }, Ni = ["disabled"], Vi = { class: "iv-panel" }, Ei = {
  key: 0,
  class: "ss-empty"
}, ki = {
  key: 1,
  class: "iv-log"
}, gi = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(b) {
    const D = le.useNotificationStore(), B = e.ref(!1), f = e.reactive({ options: [], defaultLabel: "" }), s = e.reactive({ seller: { address: "", phone: "", bank: "", bankAccount: "", drawer: "" }, defaultKind: "normal", amountTaxIncluded: !0, maxLines: 100, officialTemplate: "", outputDir: "", model: "" }), M = e.computed(() => R.value?.log || []);
    let c = !1;
    e.watch(R, (r) => {
      if (!r || c) return;
      c = !0;
      const u = r.settings;
      Object.assign(s.seller, { address: u.seller.address, phone: u.seller.phone, bank: u.seller.bank, bankAccount: u.seller.bankAccount, drawer: u.seller.drawer }), Object.assign(s, { defaultKind: u.defaultKind, amountTaxIncluded: u.amountTaxIncluded, maxLines: u.maxLines, officialTemplate: u.officialTemplate, outputDir: u.outputDir, model: u.model });
    }, { immediate: !0 });
    async function E() {
      const r = await v("files.pick", { kind: "excel" });
      r[0] && (s.officialTemplate = r[0]);
    }
    async function m() {
      const r = await v("dirs.pick");
      r && (s.outputDir = r);
    }
    async function C() {
      B.value = !0;
      try {
        const r = R.value.settings.seller;
        await v("settings.patch", { patch: { seller: { ...r, ...s.seller }, defaultKind: s.defaultKind, amountTaxIncluded: s.amountTaxIncluded, maxLines: s.maxLines, officialTemplate: s.officialTemplate, outputDir: s.outputDir, model: s.model } }), await Z(), D.success(o.t("已保存"));
      } catch (r) {
        D.error(F.errorMessage(r));
      } finally {
        B.value = !1;
      }
    }
    async function U() {
      try {
        await v("log.clear"), await Z();
      } catch (r) {
        D.error(F.errorMessage(r));
      }
    }
    return e.onMounted(async () => {
      try {
        Object.assign(f, await v("models.list"));
      } catch {
      }
    }), (r, u) => (e.openBlock(), e.createElementBlock("div", Wa, [
      e.createElementVNode("section", za, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(r.$t("销售方信息")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Ra, [
          e.createElementVNode("label", Pa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(r.$t("地址")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": u[0] || (u[0] = (g) => s.seller.address = g),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, s.seller.address]
            ])
          ]),
          e.createElementVNode("label", ja, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(r.$t("电话")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": u[1] || (u[1] = (g) => s.seller.phone = g),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, s.seller.phone]
            ])
          ]),
          e.createElementVNode("label", qa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(r.$t("开户银行")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": u[2] || (u[2] = (g) => s.seller.bank = g),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, s.seller.bank]
            ])
          ]),
          e.createElementVNode("label", Qa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(r.$t("银行账号")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": u[3] || (u[3] = (g) => s.seller.bankAccount = g),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, s.seller.bankAccount]
            ])
          ]),
          e.createElementVNode("label", Ga, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(r.$t("开票人")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": u[4] || (u[4] = (g) => s.seller.drawer = g),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, s.seller.drawer]
            ])
          ])
        ]),
        e.createElementVNode(
          "p",
          Ha,
          e.toDisplayString(r.$t("名称、税号、税率、限额与额度在「开票」页的第 1 步里改。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", Ja, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(r.$t("开票默认值")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Ya, [
          e.createElementVNode("label", Xa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(r.$t("表里没写票种时")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": u[5] || (u[5] = (g) => s.defaultKind = g)
              },
              [
                e.createElementVNode(
                  "option",
                  Za,
                  e.toDisplayString(r.$t("普通发票")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  xa,
                  e.toDisplayString(r.$t("专用发票")),
                  1
                  /* TEXT */
                )
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, s.defaultKind]
            ])
          ]),
          e.createElementVNode("label", ei, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(r.$t("表里没写是否含税时，金额按")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": u[6] || (u[6] = (g) => s.amountTaxIncluded = g)
              },
              [
                e.createElementVNode(
                  "option",
                  ti,
                  e.toDisplayString(r.$t("含税")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  li,
                  e.toDisplayString(r.$t("不含税")),
                  1
                  /* TEXT */
                )
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, s.amountTaxIncluded]
            ])
          ]),
          e.createElementVNode("label", ni, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(r.$t("单张发票明细行上限")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": u[7] || (u[7] = (g) => s.maxLines = g),
                type: "number",
                min: "1",
                max: "2000"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                s.maxLines,
                void 0,
                { number: !0 }
              ]
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", oi, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(r.$t("官方批量导入模板")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          si,
          e.toDisplayString(r.$t("应用自带一份电子税务局官方《批量导入开具发票模板》（V260401 版，2026 年 10 月从吉林电子税务局下载）。批量开票页提示「导入模板已更新」时，在页面上下载新模板放到这里，生成导入文件就会改用它。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", ai, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            onClick: E
          }, [
            u[10] || (u[10] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(r.$t("选择官方模板")),
              1
              /* TEXT */
            )
          ]),
          s.officialTemplate ? (e.openBlock(), e.createElementBlock(
            "code",
            ii,
            e.toDisplayString(s.officialTemplate),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          s.officialTemplate ? (e.openBlock(), e.createElementBlock(
            "button",
            {
              key: 1,
              type: "button",
              class: "ss-link",
              onClick: u[8] || (u[8] = (g) => s.officialTemplate = "")
            },
            e.toDisplayString(r.$t("改回自带模板")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ])
      ]),
      e.createElementVNode("section", ri, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(r.$t("输出目录与模型")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", di, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            onClick: m
          }, [
            u[11] || (u[11] = e.createElementVNode(
              "i",
              { class: "ri-folder-open-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(r.$t("选择输出目录")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "code",
            ci,
            e.toDisplayString(s.outputDir || r.$t("默认：文档 / TotalClaw / 发票智能体")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", ui, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(r.$t("读付款回单、建议税收编码用的模型")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": u[9] || (u[9] = (g) => s.model = g)
            },
            [
              e.createElementVNode(
                "option",
                mi,
                e.toDisplayString(r.$t("跟随系统默认（{p0}）", { p0: f.defaultLabel || r.$t("未配置") })),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(f.options, (g) => (e.openBlock(), e.createElementBlock("option", {
                  key: g.value,
                  value: g.value
                }, e.toDisplayString(g.group ? `${g.group} · ` : "") + e.toDisplayString(g.label), 9, pi))),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, s.model]
          ])
        ]),
        e.createElementVNode(
          "p",
          vi,
          e.toDisplayString(r.$t("模型只读文字和给编码建议；金额、税额、拆票全部由规则计算。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("div", yi, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: B.value,
          onClick: C
        }, [
          u[12] || (u[12] = e.createElementVNode(
            "i",
            { class: "ri-save-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(r.$t("保存设置")),
            1
            /* TEXT */
          )
        ], 8, Ni)
      ]),
      e.createElementVNode("section", Vi, [
        e.createElementVNode("h3", null, [
          e.createTextVNode(
            e.toDisplayString(r.$t("操作记录")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: U
            },
            e.toDisplayString(r.$t("清空")),
            1
            /* TEXT */
          )
        ]),
        M.value.length ? (e.openBlock(), e.createElementBlock("ul", ki, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(M.value, (g, y) => (e.openBlock(), e.createElementBlock(
              "li",
              {
                key: y,
                class: e.normalizeClass({ bad: !g.ok })
              },
              [
                e.createElementVNode(
                  "time",
                  null,
                  e.toDisplayString(e.unref(F.fmtDateTime)(g.at)),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(g.text),
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
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Ei,
          e.toDisplayString(r.$t("还没有记录")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), hi = /* @__PURE__ */ ue(gi, [["__scopeId", "data-v-9353fdba"]]), fi = { class: "iv-workbench" }, bi = { class: "workbench-header" }, $i = { class: "heading" }, Di = { class: "eyebrow" }, Si = { class: "subtitle" }, _i = { class: "header-actions" }, Bi = ["disabled"], wi = {
  key: 0,
  class: "iv-bar"
}, Ci = { class: "ss-muted" }, Ti = { class: "iv-bar__rule" }, Li = { class: "no" }, Ai = { class: "yes" }, Mi = {
  class: "iv-tabs",
  role: "tablist"
}, Ui = ["aria-selected", "data-test", "onClick"], Ii = {
  key: 0,
  class: "iv-badge"
}, Ki = {
  key: 1,
  class: "iv-body"
}, Oi = {
  key: 3,
  class: "iv-ov"
}, Fi = { class: "ss-panel" }, Wi = { class: "iv-list" }, zi = { class: "ss-panel" }, Ri = { class: "iv-list" }, Pi = { class: "ss-panel" }, ji = { class: "iv-list" }, qi = {
  key: 2,
  class: "ss-note danger"
}, Qi = {
  key: 3,
  class: "ss-note"
}, Fe = "totalclaw:invoice-agent-tab:v1", Gi = /* @__PURE__ */ e.defineComponent({
  __name: "InvoiceAgentWorkbenchView",
  setup(b) {
    const D = [
      { key: "issue", icon: "ri-bill-line", title: o.t("开票") },
      { key: "ledger", icon: "ri-book-2-line", title: o.t("发票台账") },
      { key: "archive", icon: "ri-contacts-book-2-line", title: o.t("客户与商品") },
      { key: "overview", icon: "ri-book-open-line", title: o.t("方案说明") },
      { key: "settings", icon: "ri-settings-3-line", title: o.t("设置") }
    ];
    function B() {
      try {
        const y = localStorage.getItem(Fe);
        return D.some((h) => h.key === y) ? y : "issue";
      } catch {
        return "issue";
      }
    }
    const f = R, s = e.ref(B()), M = e.ref(!1), c = e.ref(!1), E = e.ref(""), m = e.computed(() => (f.value?.drafts || []).filter((y) => y.status === "confirmed" || y.status === "handed" || y.status === "failed").length), C = e.computed(() => (f.value?.drafts || []).filter((y) => y.status === "issued").length);
    function U(y) {
      s.value = y;
      try {
        localStorage.setItem(Fe, y);
      } catch {
      }
    }
    async function r() {
      c.value = !0;
      try {
        await Z(), M.value = !0, E.value = "";
      } catch (y) {
        E.value = F.errorMessage(y);
      } finally {
        c.value = !1;
      }
    }
    let u = null, g = null;
    return e.onMounted(() => {
      r(), g = Vt(() => {
        u || (u = setTimeout(() => {
          u = null, Z().catch(() => {
          });
        }, 250));
      });
    }), e.onBeforeUnmount(() => {
      g?.(), u && clearTimeout(u);
    }), (y, h) => (e.openBlock(), e.createElementBlock("div", fi, [
      e.createElementVNode("header", bi, [
        e.createElementVNode("div", $i, [
          e.createVNode(yt),
          h[0] || (h[0] = e.createElementVNode(
            "span",
            { class: "heading-icon" },
            [
              e.createElementVNode("i", { class: "ri-bill-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "p",
              Di,
              e.toDisplayString(y.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(y.$t("发票智能体")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Si,
              e.toDisplayString(y.$t("拿着付款单或一张开票申请表（很多行、很多家购买方），自动识别、校验、组票拆票算税，在系统浏览器里走到电子税务局的批量开票页并放入导入文件，或经开票服务商接口开具。金额由规则计算，「批量开具」由你亲自点。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", _i, [
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: c.value,
            onClick: r
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
              e.toDisplayString(y.$t("刷新")),
              1
              /* TEXT */
            )
          ], 8, Bi)
        ])
      ]),
      e.unref(f) ? (e.openBlock(), e.createElementBlock("section", wi, [
        e.createElementVNode("span", null, [
          h[1] || (h[1] = e.createElementVNode(
            "i",
            { class: "ri-building-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(e.unref(f).settings.seller.name || y.$t("未设置销售方")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          Ci,
          e.toDisplayString(y.$t("批次 {a} · 待开具 {b} · 已开具 {c} · 客户 {d}", { a: e.unref(f).batches.length, b: m.value, c: C.value, d: e.unref(f).customers.length })),
          1
          /* TEXT */
        ),
        e.createElementVNode("p", Ti, [
          e.createElementVNode("span", Li, [
            h[2] || (h[2] = e.createElementVNode(
              "i",
              { class: "ri-close-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(y.$t("模型不算钱、不代过扫脸与验证码、不擅自开具")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", Ai, [
            h[3] || (h[3] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(y.$t("每张发票可追到来源行，开具由你亲自点")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("nav", Mi, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(D, (a) => e.createElementVNode("button", {
            key: a.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["iv-tab", { active: s.value === a.key }]),
            "aria-selected": s.value === a.key,
            "data-test": `iv-tab-${a.key}`,
            onClick: (N) => U(a.key)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(a.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.title),
              1
              /* TEXT */
            ),
            a.key === "ledger" && m.value ? (e.openBlock(), e.createElementBlock(
              "em",
              Ii,
              e.toDisplayString(m.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, Ui)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      M.value ? (e.openBlock(), e.createElementBlock("div", Ki, [
        e.withDirectives(e.createVNode(
          Vs,
          null,
          null,
          512
          /* NEED_PATCH */
        ), [
          [e.vShow, s.value === "issue"]
        ]),
        s.value === "ledger" ? (e.openBlock(), e.createBlock(ea, { key: 0 })) : s.value === "archive" ? (e.openBlock(), e.createBlock(Fa, { key: 1 })) : s.value === "settings" ? (e.openBlock(), e.createBlock(hi, { key: 2 })) : s.value === "overview" ? (e.openBlock(), e.createElementBlock("div", Oi, [
          e.createElementVNode("section", Fi, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(y.$t("它替财务做什么")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Wi, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("识别表格：付款单、开票申请表的列名五花八门，自动认出购买方、税号、项目、金额等列，认不准的让你点选")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("逐行校验：税号位数与校验位、同名不同税号、与客户档案不一致、数量 × 单价 ≠ 金额、税率不合法、疑似重复开票")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("组票拆票：按购买方 / 订单号 / 逐行合并，超过单张限额或行数上限自动拆，价税分离按分做整数运算，合计一分不差")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("开具：系统浏览器打开电子税务局，应用走到「批量开票」页并放入导入文件，你核对后点「批量开具」；或经诺诺接口提交")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("台账：从「批量开票记录」按发票流水号读回号码，附发票文件，登记红冲，导出台账")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", zi, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(y.$t("三条红线")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Ri, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("钱不交给模型算：金额、税额、拆票全部由规则计算；模型只读付款回单上的文字、给税收编码建议，读出来的名称和金额逐条回原文核对，编码要你确认")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("开具有人工闸门：应用不会点「批量开具」「发票开具」；登录、扫脸（实人认证）、短信验证码只能由你本人完成，不做任何绕过")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("每张票可回溯：发票 → 明细行 → 来源文件的第几行，重复开票会被提示")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", Pi, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(y.$t("先知道这几件事")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", ji, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("数电发票必须在电子税务局开具，开票前要实人认证；认证多久一次由税务机关按企业风险设定")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("发票额度按自然月的不含税总额管理，额度不够要先在电子税务局申请调额")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("应用自带电子税务局官方《批量导入开具发票模板》（V260401 版）；页面提示模板更新时，下载新模板放到设置里即可")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("建筑服务、不动产租赁、货物运输等特定业务，以及差额开具、减按开具，这一版不处理，请在电子税务局手工开")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("电子税务局不接受应用的内置浏览器，所以用系统的 Chrome / Edge；进「蓝字发票开具」和「批量开票」前各要扫一次脸")),
                1
                /* TEXT */
              )
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ])) : E.value ? (e.openBlock(), e.createElementBlock("p", qi, [
        h[4] || (h[4] = e.createElementVNode(
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
      ])) : (e.openBlock(), e.createElementBlock("p", Qi, [
        h[5] || (h[5] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), Hi = /* @__PURE__ */ ue(Gi, [["__scopeId", "data-v-20d5b2e1"]]);
export {
  Hi as default
};
