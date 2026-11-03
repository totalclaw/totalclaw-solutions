const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const o = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!o) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
o.default;
const be = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!be) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
be.default;
const Et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!Et) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const zt = Et.default, Ge = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!Ge) throw new Error("宿主模块未就绪：npm:vue-router");
Ge.default;
const Me = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!Me) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
Me.default;
const Vt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!Vt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const ge = Vt.default, ht = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!ht) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const It = ht.default, kt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/FileDropField.vue"];
if (!kt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/FileDropField.vue");
const at = kt.default, ft = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/TableMapping.vue"];
if (!ft) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/TableMapping.vue");
const rt = ft.default, Je = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!Je) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
Je.default;
const q = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!q) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
q.default;
async function D(u, k) {
  const y = window.electronAPI?.workbenches?.flowSla;
  if (!y?.invoke) throw new Error(o.t("流程时效监控接口不可用，请重启应用"));
  return y.invoke(u, Je.toPlain(k ?? {}));
}
function Pt(u) {
  const k = window.electronAPI?.workbenches?.flowSla;
  return k?.onEvent ? k.onEvent(u) : () => {
  };
}
const J = e.ref(null);
async function ne() {
  const u = await D("state.get");
  return J.value = u, u;
}
function ie(u, k = !1) {
  return D("path.open", { path: u, reveal: k });
}
const G = (u) => u == null ? "-" : `${(Math.round(u * 1e3) / 10).toFixed(1)}%`, j = (u) => u == null ? "-" : String(Math.round(u * 100) / 100), Oe = (u) => u == null ? "-" : `${u > 0 ? "+" : ""}${Math.round(u * 100) / 100}`, Pe = (u) => u == null ? "-" : `${u > 0 ? "+" : ""}${(Math.round(u * 1e3) / 10).toFixed(1)}`, Re = (u) => String(u).padStart(2, "0");
function x(u) {
  const k = new Date(u);
  return `${k.getFullYear()}-${Re(k.getMonth() + 1)}-${Re(k.getDate())}`;
}
function Se(u) {
  const k = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(u || ""));
  return k ? new Date(Number(k[1]), Number(k[2]) - 1, Number(k[3])).getTime() : NaN;
}
function Ke(u) {
  if (!u) return "";
  const k = new Date(u);
  return `${x(u)} ${Re(k.getHours())}:${Re(k.getMinutes())}`;
}
function it(u, k = Date.now()) {
  const y = new Date(k);
  if (y.setHours(0, 0, 0, 0), u === "monthly") {
    const C = new Date(y.getFullYear(), y.getMonth() - 1, 1), b = new Date(y.getFullYear(), y.getMonth(), 0);
    return { kind: u, start: x(C.getTime()), lastDay: x(b.getTime()), asOf: x(k) };
  }
  const E = (y.getDay() + 6) % 7, $ = new Date(y.getFullYear(), y.getMonth(), y.getDate() - E - 7), g = new Date(y.getFullYear(), y.getMonth(), y.getDate() - E - 1);
  return { kind: u, start: x($.getTime()), lastDay: x(g.getTime()), asOf: x(k) };
}
function dt(u, k = Date.now()) {
  const y = Se(u.start), E = Se(u.lastDay);
  if (!Number.isFinite(y) || !Number.isFinite(E)) throw new Error(o.t("请填写统计周期的起止日期"));
  if (E < y) throw new Error(o.t("统计周期的结束日期不能早于开始日期"));
  const $ = new Date(E);
  $.setDate($.getDate() + 1);
  const g = Se(u.asOf), C = Number.isFinite(g) ? g + 864e5 - 1e3 : k;
  return { kind: u.kind, start: y, end: $.getTime(), asOf: Math.min(C, k), label: "" };
}
function ct(u) {
  const k = new Date(u.end);
  return k.setDate(k.getDate() - 1), { kind: u.kind, start: x(u.start), lastDay: x(k.getTime()), asOf: x(u.asOf) };
}
const $e = (u) => u === "monthly" ? o.t("月报") : o.t("周报");
function je(u) {
  return {
    flowNo: o.t("单号"),
    flowName: o.t("流程名称 / 事务类型"),
    feeType: o.t("费用类型"),
    title: o.t("标题"),
    initiator: o.t("发起人"),
    dept: o.t("部门"),
    status: o.t("状态"),
    startAt: o.t("流程开始时间"),
    endAt: o.t("流程结束时间"),
    amount: o.t("金额"),
    currentNode: o.t("当前节点"),
    currentHandler: o.t("当前处理人"),
    node: o.t("节点 / 环节名称"),
    handler: o.t("处理人 / 审核人"),
    nodeStart: o.t("节点到达时间"),
    nodeEnd: o.t("节点完成时间"),
    name: o.t("姓名"),
    email: o.t("邮箱"),
    identity: o.t("身份")
  }[u] || u;
}
const ut = ["flowNo", "flowName", "feeType", "title", "initiator", "dept", "status", "startAt", "endAt", "amount", "currentNode", "currentHandler"], mt = ["node", "handler", "nodeStart", "nodeEnd"];
function He(u, k, y) {
  if (u === "roster") return ["name", "dept", "email", "identity"].map((g) => ({ key: g, label: je(g), required: g === "name" }));
  if (!(u === "node" || !!k.node && !!k.nodeStart)) return [...ut, ...mt].map((g) => ({ key: g, label: je(g), required: ["flowNo", "flowName", "startAt"].includes(g) }));
  const $ = /* @__PURE__ */ new Set(["flowNo", "node", "handler", "nodeStart"]);
  return (!y || u === "flow") && $.add("flowName"), [...mt, ...ut].map((g) => ({ key: g, label: je(g), required: $.has(g) }));
}
function pt(u, k, y) {
  return He(u, k, y).filter((E) => E.required && !k[E.key]).map((E) => E.key);
}
function yt(u) {
  switch (u) {
    case "materials":
      return o.t("资料不全退回");
    case "absence":
      return o.t("审批人出差/休假");
    case "cross_dept":
      return o.t("跨部门沟通等待");
    case "external":
      return o.t("外部单位未反馈");
    case "system":
      return o.t("系统/操作问题");
    case "design":
      return o.t("流程设计环节过多");
    case "other":
      return o.t("其他");
    default:
      return o.t("未归类");
  }
}
function Dt(u) {
  return u.status === "done" ? u.overtime === !0 ? o.t("办结超时") : u.overtime === !1 ? o.t("办结合规") : o.t("办结（无时效要求）") : u.runningLabel === "overdue" ? o.t("在途已逾期") : u.runningLabel === "risk" ? o.t("较大逾期风险") : u.runningLabel === "no_limit" ? o.t("在途（无时效要求）") : o.t("在途正常");
}
function St(u) {
  return u.overtime === !0 || u.runningLabel === "overdue" ? "bad" : u.runningLabel === "risk" ? "warn" : u.overtime === !1 ? "ok" : "";
}
function qe(u) {
  return { doing: o.t("进行中"), done: o.t("已完成"), overdue: o.t("逾期"), archived: o.t("已归档") }[u];
}
function jt(u) {
  return { doing: "brand", done: "ok", overdue: "bad", archived: "" }[u];
}
function Ye(u, k = Date.now()) {
  const y = Se(u);
  return Number.isFinite(y) ? Math.round((y - Se(x(k))) / 864e5) : null;
}
function qt(u) {
  const k = String(u || "").split(/[,;，；\s]+/).map((E) => E.trim()).filter(Boolean), y = k.filter((E) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(E));
  return { ok: new Set(k.filter((E) => !y.includes(E))).size, bad: y };
}
const Yt = { class: "ss-module" }, Ht = { class: "ss-steps" }, Gt = { class: "ss-actions" }, Jt = {
  class: "fs-seg",
  role: "radiogroup"
}, Xt = ["data-test", "onClick"], Qt = { class: "ss-field inline" }, Zt = { class: "ss-field inline" }, xt = { class: "ss-field inline" }, el = { class: "ss-muted" }, tl = { class: "fs-slots" }, ll = {
  key: 0,
  class: "ss-note info"
}, nl = { class: "fs-sys" }, sl = { class: "ss-actions" }, ol = ["disabled"], al = ["disabled"], rl = {
  key: 0,
  class: "ss-muted"
}, il = {
  key: 0,
  class: "ss-file-out"
}, dl = {
  key: 1,
  class: "ss-table-wrap"
}, cl = { class: "ss-table" }, ul = { class: "num" }, ml = { class: "num" }, pl = {
  key: 0,
  class: "ss-empty"
}, yl = { class: "ss-kpis" }, gl = { class: "ss-kpi" }, vl = { class: "ss-subhead" }, Nl = {
  key: 0,
  class: "ss-note ok"
}, El = {
  key: 1,
  class: "ss-table-wrap fs-scroll"
}, Vl = { class: "ss-table" }, hl = { class: "num" }, kl = { class: "num" }, fl = ["disabled", "data-test", "onChange"], Dl = { value: "" }, Sl = ["value"], $l = {
  key: 2,
  class: "ss-muted"
}, bl = ["title", "onClick"], _l = { class: "ss-subhead" }, wl = {
  key: 3,
  class: "ss-note ok"
}, Bl = { class: "ss-note warn" }, Cl = { class: "ss-table-wrap fs-scroll" }, Tl = { class: "ss-table" }, Ll = { class: "num" }, Al = { class: "num" }, Fl = { class: "fs-ops" }, Ol = ["disabled", "onClick"], Ml = ["disabled", "onClick"], Rl = {
  key: 5,
  class: "ss-muted"
}, Kl = ["title", "onClick"], Wl = { class: "ss-subhead" }, Ul = { class: "fs-chips" }, zl = { class: "ss-actions" }, Il = ["disabled"], Pl = { class: "ss-actions" }, jl = ["disabled"], ql = ["disabled"], Yl = {
  key: 0,
  class: "ss-file-out"
}, Hl = {
  class: "ss-kpis",
  "data-test": "fs-kpis"
}, Gl = { class: "ss-kpi" }, Jl = { class: "ss-kpi" }, Xl = { class: "ss-kpi accent" }, Ql = { class: "ss-kpi" }, Zl = { class: "ss-kpi" }, xl = { class: "ss-kpi" }, en = { class: "ss-kpi accent" }, tn = {
  key: 1,
  class: "ss-note warn"
}, ln = {
  key: 2,
  class: "ss-note info"
}, nn = { class: "ss-subhead" }, sn = { class: "ss-table-wrap" }, on = { class: "ss-table" }, an = { class: "num" }, rn = { class: "num" }, dn = { class: "num" }, cn = { class: "num" }, un = { class: "num" }, mn = { class: "num" }, pn = { class: "num" }, yn = { class: "num" }, gn = { class: "num" }, vn = { class: "num" }, Nn = { class: "num" }, En = { class: "num" }, Vn = { class: "num" }, hn = { class: "num" }, kn = { class: "ss-subhead" }, fn = { class: "ss-table-wrap fs-scroll" }, Dn = { class: "ss-table" }, Sn = { class: "num" }, $n = { class: "num" }, bn = { class: "num" }, _n = { class: "num" }, wn = { class: "num" }, Bn = { class: "num" }, Cn = { class: "num" }, Tn = { class: "num" }, Ln = { class: "num" }, An = { class: "num" }, Fn = { class: "num" }, On = { class: "num" }, Mn = { class: "num" }, Rn = { class: "num" }, Kn = { class: "fs-two" }, Wn = { class: "ss-subhead" }, Un = { class: "ss-table-wrap fs-scroll" }, zn = { class: "ss-table" }, In = { class: "num" }, Pn = { class: "num" }, jn = { class: "num" }, qn = { class: "num" }, Yn = { class: "num" }, Hn = { class: "num" }, Gn = { class: "num" }, Jn = { class: "num" }, Xn = { class: "ss-subhead" }, Qn = { class: "ss-table-wrap fs-scroll" }, Zn = { class: "ss-table" }, xn = { class: "num" }, es = { class: "num" }, ts = { class: "num" }, ls = { class: "num" }, ns = { class: "num" }, ss = { class: "num" }, os = { class: "num" }, as = { class: "num" }, rs = { class: "ss-subhead" }, is = { class: "ss-subhead" }, ds = {
  key: 0,
  class: "ss-empty"
}, cs = { class: "ss-actions" }, us = {
  key: 0,
  class: "ss-field inline"
}, ms = { value: "" }, ps = ["value"], ys = ["disabled"], gs = {
  key: 0,
  class: "ss-note warn"
}, vs = {
  key: 1,
  class: "ss-kpis"
}, Ns = { class: "ss-kpi" }, Es = { class: "fs-small" }, Vs = { class: "ss-kpi" }, hs = { class: "ss-kpi" }, ks = { class: "ss-kpi" }, fs = { class: "ss-kpi" }, Ds = { class: "ss-kpi" }, Ss = { class: "ss-subhead" }, $s = { class: "ss-table-wrap fs-scroll" }, bs = { class: "ss-table" }, _s = { class: "num" }, ws = { class: "num" }, Bs = { class: "num" }, Cs = { class: "num" }, Ts = { class: "num" }, Ls = { class: "num" }, As = { class: "num" }, Fs = { class: "num" }, Os = { class: "num" }, Ms = { class: "num" }, Rs = { class: "num" }, Ks = { class: "num" }, Ws = { class: "num" }, Us = { class: "num" }, zs = { class: "fs-wrap" }, Is = { class: "ss-chip" }, Ps = {
  key: 0,
  class: "ss-chip warn"
}, js = {
  key: 0,
  class: "ss-muted"
}, qs = {
  key: 1,
  class: "ss-table-wrap"
}, Ys = { class: "ss-table" }, Hs = { class: "num" }, Gs = { class: "num" }, Js = { class: "num" }, Xs = { class: "num" }, Qs = { class: "num" }, Zs = { class: "num" }, xs = { class: "num" }, eo = { class: "num" }, to = { class: "num" }, lo = { class: "num" }, no = { class: "num" }, so = { class: "num" }, oo = { class: "num" }, ao = { class: "num" }, ro = { class: "ss-subhead" }, io = {
  key: 0,
  class: "ss-empty"
}, co = {
  key: 0,
  class: "ss-note ok"
}, uo = { class: "ss-subhead" }, mo = { class: "ss-table-wrap fs-scroll" }, po = { class: "ss-table" }, yo = ["checked"], go = { class: "num" }, vo = ["value", "disabled"], No = { class: "num" }, Eo = ["value", "placeholder", "onChange"], Vo = {
  key: 0,
  class: "ss-chip ok"
}, ho = {
  key: 1,
  class: "ss-chip warn"
}, ko = {
  key: 2,
  class: "ss-chip"
}, fo = ["onClick"], Do = { key: 0 }, So = { colspan: "6" }, $o = { class: "fs-mail" }, bo = { class: "ss-actions" }, _o = ["disabled"], wo = ["disabled"], Bo = ["disabled"], Co = {
  key: 0,
  class: "ss-file-out"
}, To = { class: "ss-subhead" }, Lo = { class: "ss-table-wrap fs-scroll" }, Ao = { class: "ss-table" }, Fo = { class: "num" }, Oo = { class: "num" }, Mo = ["value", "placeholder", "data-test", "onChange"], Ro = ["value", "disabled", "onChange"], Ko = { value: "" }, Wo = ["value"], Uo = { class: "ss-actions" }, zo = ["disabled"], Io = ["disabled"], Po = { class: "ss-muted" }, jo = {
  key: 1,
  class: "fs-roots"
}, qo = ["value", "placeholder", "onChange"], Yo = { class: "ss-actions" }, Ho = ["disabled"], Go = {
  key: 0,
  class: "ss-empty"
}, Jo = { class: "ss-actions" }, Xo = ["disabled"], Qo = ["disabled"], Zo = {
  key: 0,
  class: "ss-muted"
}, xo = { class: "ss-field" }, ea = { class: "ss-subhead" }, ta = { class: "ss-table-wrap" }, la = { class: "ss-table fs-sug" }, na = ["onUpdate:modelValue"], sa = ["onUpdate:modelValue"], oa = ["onUpdate:modelValue"], aa = ["onUpdate:modelValue"], ra = ["onUpdate:modelValue"], ia = ["onUpdate:modelValue"], da = ["onClick"], ca = { class: "ss-actions" }, ua = { class: "ss-actions" }, ma = ["disabled"], pa = ["onClick"], ya = ["onClick"], ga = { class: "ss-subhead" }, va = ["srcdoc", "title"], Na = { class: "ss-field" }, Ea = { class: "ss-field" }, Va = { class: "ss-field" }, ha = {
  key: 0,
  class: "ss-note danger"
}, ka = { class: "ss-actions" }, fa = ["disabled"], Da = ["disabled"], Sa = {
  key: 1,
  class: "ss-chip ok"
}, $a = {
  key: 2,
  class: "ss-chip ok"
}, ba = {
  key: 1,
  class: "ss-note ok"
}, gt = "__regular__", _a = /* @__PURE__ */ e.defineComponent({
  __name: "BulletinTab",
  setup(u, { expose: k }) {
    const y = ["weekly", "monthly"], E = Me.FS_SYSTEMS, $ = ["flow", "node"], g = Me.FS_REASON_CATEGORIES, C = be.useNotificationStore(), b = Ge.useRouter(), U = e.computed(() => J.value?.session ?? null), R = e.computed(() => J.value?.thresholds.minComplianceRate ?? 0.95), V = [
      { key: "fs-import", title: o.t("导入报表与花名册"), hint: o.t("放进 OA、费控、CSS 导出的时效报表和中心花名册，选周报还是月报") },
      { key: "fs-check", title: o.t("标准化与规则核对"), hint: o.t("看流程名、节点、人员和规则表对不对得上，对不上的在这里定") },
      { key: "fs-calc", title: o.t("计算"), hint: o.t("按时效规则算端到端用时、个人审核用时、合规率和排名，识别临期与超时") },
      { key: "fs-compare", title: o.t("环比与异常分析"), hint: o.t("和上一周期比，找出异常流程类型，展开看卡在哪个节点") },
      { key: "fs-reason", title: o.t("超时原因收集"), hint: o.t("按责任人发邮件收集原因，回填后归类并写根因") },
      { key: "fs-report", title: o.t("生成并发送通报"), hint: o.t("周报出邮件和明细表，月报出分析报告 PDF；预览后由你点发送") }
    ], B = q.useSteps(V), { runtime: F, currentKey: I } = B, f = e.ref("");
    async function A(t, n, l = {}) {
      const p = l.mark !== !1, M = F[t].state === "failed" || F[t].state === "running" ? "todo" : F[t].state;
      f.value = l.busyKey || t, p ? B.start(t) : B.set(t, { state: "running", error: void 0, startedAt: Date.now() });
      try {
        const L = await n();
        return p ? B.done(t, L || void 0) : B.set(t, { state: M }), !0;
      } catch (L) {
        return B.fail(t, L), !1;
      } finally {
        f.value = "";
      }
    }
    function Y(t) {
      q.scrollToStep(t);
    }
    const d = e.reactive(it("weekly"));
    function O(t) {
      Object.assign(d, it(t));
    }
    const _ = e.reactive(Object.fromEntries(E.map((t) => [t, { flow: null, node: null }]))), T = e.ref(null), z = e.ref(null), X = e.ref("");
    function se(t) {
      return t === "OA" ? o.t("审批类流程：状态看「审批状态」，结束 = 办结，待审 = 在途") : t === "CSS" ? o.t("售后服务类流程：状态看「状态」，已审核 = 办结，审核中 = 在途；用时只累计内部节点") : o.t("费用类流程：状态看「当前处理人」，结束 = 办结，终止不统计，其余在途");
    }
    async function c(t, n, l, p) {
      l && await A("fs-import", async () => {
        _[t][n] = await D("ingest.preview", { path: l, slot: n, sheet: p, hasFlowTable: n === "node" && !!_[t].flow });
      }, { mark: !1 });
    }
    async function s(t, n) {
      t && await A("fs-import", async () => {
        T.value = await D("ingest.preview", { path: t, slot: "roster", sheet: n });
      }, { mark: !1 });
    }
    const a = e.computed(() => E.flatMap((t) => $.map((n) => ({ sys: t, slot: n, t: _[t][n] }))).filter((t) => t.t)), r = e.computed(() => {
      if (!a.value.length) return o.t("至少放一个系统的报表");
      for (const t of a.value)
        if (pt(t.slot, t.t.mapping, !!_[t.sys].flow).length) return o.t("{p0}：还有必填列没有对应上", { p0: t.t.fileName });
      return T.value && pt("roster", T.value.mapping, !1).length ? o.t("花名册还没有对应上姓名列") : "";
    }), m = e.computed(() => !r.value);
    function S(t) {
      return t.systems.map((n) => o.t("{p0} {p1} 个流程", { p0: n.system, p1: n.flows })).join(o.t("，")) + o.t("；花名册 {p0} 人", { p0: t.roster });
    }
    async function v(t) {
      z.value = t.summary, Object.assign(d, ct(t.period)), oe("fs-import"), await ne();
    }
    async function K() {
      X.value = "", await A("fs-import", async () => {
        const n = {};
        for (const p of E) {
          const { flow: M, node: L } = _[p];
          !M && !L || (n[p] = {
            ...M ? { flow: { path: M.path, sheet: M.sheetName, mapping: M.mapping } } : {},
            ...L ? { node: { path: L.path, sheet: L.sheetName, mapping: L.mapping } } : {}
          });
        }
        const l = await D("ingest.commit", {
          period: dt(d),
          systems: n,
          ...T.value ? { roster: { path: T.value.path, sheet: T.value.sheetName, mapping: T.value.mapping } } : {}
        });
        return await v(l), S(l.summary);
      }) && await h();
    }
    async function de() {
      await A("fs-import", async () => {
        const n = await D("demo.generate", { period: dt(d) });
        for (const l of E)
          _[l].flow = null, _[l].node = null;
        return T.value = null, await v(n), X.value = n.dir, o.t("已载入示例数据：{p0}", { p0: S(n.summary) });
      }) && await h();
    }
    function oe(t) {
      B.resetAfter(t);
      const n = V.findIndex((l) => l.key === t);
      n < 1 && (W.value = null), n < 2 && (w.value = null, ce.value = "", we.value = ""), n < 3 && (P.value = null), n < 4 && (he.value = [], ke.value = ""), n < 5 && (le.value = null, De.value = "", Le.value = "");
    }
    const W = e.ref(null), _e = e.computed(() => (W.value?.unmatched || []).filter((t) => !t.regular)), Ve = e.computed(() => (W.value?.aliases || []).filter((t) => t.target !== gt)), i = (t) => (W.value?.ruleTypes || []).filter((n) => n.system.toUpperCase().split("/").includes(t.toUpperCase()));
    async function h() {
      return A("fs-check", async () => {
        W.value = await D("check.run");
      }, { mark: !1 });
    }
    async function N(t, n, l) {
      !l && !W.value?.aliases.some((p) => p.system === t && p.flowName === n) || await A("fs-check", async () => {
        await D("alias.set", { system: t, flowName: n, target: l }), oe("fs-check"), W.value = await D("check.run");
      }, { mark: !1 });
    }
    async function H(t, n) {
      await A("fs-check", async () => {
        await D("node.decide", { system: t.system, flowName: t.flowName, node: t.node, internal: n }), oe("fs-check"), W.value = await D("check.run");
      }, { mark: !1 });
    }
    function ee() {
      if (!W.value) return;
      const t = W.value;
      B.done("fs-check", o.t("流程名待定 {a} 个，未登记节点 {b} 个，花名册外审核人 {c} 人", { a: _e.value.length, b: t.unknownNodes.length, c: t.outOfRoster.length })), q.scrollToStep("fs-calc");
    }
    const w = e.ref(null), ce = e.ref(""), we = e.ref("");
    function xe(t) {
      return o.t("办结 {a} 单，合规率 {b}，在途逾期 {c} 单", { a: t.overall.doneCount, b: G(t.overall.complianceRate), c: t.overall.runningOverdue });
    }
    async function et() {
      F["fs-check"].state !== "done" && ee(), await A("fs-calc", async () => {
        oe("fs-calc");
        const n = await D("calc.run");
        return w.value = n, we.value = n.tracking.added || n.tracking.closed ? o.t("在途跟进名单：新增 {a} 条，闭环 {b} 条（见「在途跟进」页）", { a: n.tracking.added, b: n.tracking.closed }) : "", await ne(), xe(n);
      }) && await fe();
    }
    async function bt() {
      await A("fs-calc", async () => {
        ce.value = await D("calc.export");
      }, { mark: !1 });
    }
    const P = e.ref(null), Ue = e.ref("");
    async function tt() {
      await A("fs-compare", async () => {
        const t = await D("compare.run", { prevId: Ue.value || void 0 });
        return P.value = t, t.previous ? o.t("对比 {a}：异常流程类型 {b} 个", { a: t.previous.label, b: t.abnormal.length }) : o.t("没有上一周期，异常流程类型 {b} 个", { b: t.abnormal.length });
      });
    }
    function Be(t, n) {
      return t == null || t === 0 ? "" : t > 0 === n ? "fs-ok" : "fs-bad";
    }
    const Q = e.ref([]), ue = e.ref([]), Z = e.ref([]), Ce = e.ref(""), he = e.ref([]), ke = e.ref(""), Te = e.ref({}), me = e.computed(() => Q.value.filter((t) => t.reason.trim()).length), _t = e.computed(() => ue.value.some((t) => t.email) && ue.value.filter((t) => t.email).every((t) => Z.value.includes(t.owner))), lt = e.computed(() => g.map((t) => ({ id: t, count: Q.value.filter((n) => n.reason.trim() && n.categoryId === t).length })).filter((t) => t.count > 0));
    function wt(t) {
      Z.value = t ? ue.value.filter((n) => n.email).map((n) => n.owner) : [];
    }
    async function fe() {
      try {
        const t = await D("cases.get");
        Q.value = t.cases, ue.value = t.mails, Z.value = Z.value.filter((n) => t.mails.some((l) => l.owner === n && l.email)), Te.value = { ...J.value?.session.rootCauses || {} };
      } catch (t) {
        B.fail("fs-reason", t);
      }
    }
    async function ae(t, n) {
      await A("fs-reason", n, { mark: !1, busyKey: t });
    }
    async function Bt(t, n) {
      await ae("fs-reason", async () => {
        await D("cases.setEmail", { owner: t, email: n }), await fe();
      });
    }
    async function Ct() {
      const t = Z.value.length;
      window.confirm(o.t("给 {n} 位责任人各发一封原因收集邮件？", { n: t })) && await ae("fs-reason-send", async () => {
        const n = await D("reasons.send", { owners: Z.value });
        he.value = [
          ...n.sent.length ? [{ text: o.t("已发送给 {n} 人：{p0}", { n: n.sent.length, p0: n.sent.join("、") }), cls: "ok" }] : [],
          ...n.skipped.length ? [{ text: o.t("没有邮箱，没有发：{p0}", { p0: n.skipped.join("、") }), cls: "warn" }] : [],
          ...n.failed.map((l) => ({ text: o.t("{p0} 发送失败：{p1}", { p0: l.owner, p1: l.message }), cls: "danger" }))
        ], Z.value = [], await fe();
      });
    }
    async function Tt() {
      await ae("fs-reason", async () => {
        ke.value = await D("reasons.export");
      });
    }
    async function Lt() {
      const t = await D("files.pick", { multi: !1 });
      t.length && await ae("fs-reason", async () => {
        const n = await D("reasons.import", { path: t[0] });
        he.value = [{ text: o.t("回填了 {a} 个流程的原因", { a: n.filled }) + (n.unmatched ? o.t("；{b} 行的单号在本期名单里找不到", { b: n.unmatched }) : ""), cls: n.unmatched ? "warn" : "ok" }], await fe();
      });
    }
    async function At(t, n) {
      await ae("fs-reason", async () => {
        Q.value = await D("reasons.set", { key: t, reason: n });
      });
    }
    async function Ft(t, n) {
      await ae("fs-reason", async () => {
        Q.value = await D("reasons.set", { key: t, categoryId: n });
      });
    }
    async function nt(t) {
      await ae("fs-classify", async () => {
        const n = await D("reasons.classify", { useModel: t });
        Q.value = n.cases, Te.value = { ...n.rootCauses }, he.value = [
          n.modelError ? { text: o.t("模型没有用上（{p0}），已按关键字归类", { p0: n.modelError }), cls: "warn" } : { text: n.by === "model" ? o.t("模型已归类") + (n.rejected ? o.t("；{n} 处没通过核对，保留关键字归类或通用说明", { n: n.rejected }) : "") : o.t("已按关键字归类，归得不对的可以在表里改"), cls: "ok" }
        ];
      });
    }
    async function Ot(t, n) {
      await ae("fs-reason", async () => {
        Te.value = { ...await D("rootCause.set", { id: t, text: n }) };
      });
    }
    function Mt() {
      B.done("fs-reason", Q.value.length ? o.t("需要说明 {a} 个流程，已收到 {b} 个原因", { a: Q.value.length, b: me.value }) : o.t("本期不需要收集原因")), q.scrollToStep("fs-report");
    }
    const re = e.ref(""), te = e.ref([]), Le = e.ref(""), le = e.ref(null), Ae = e.ref(""), Fe = e.ref(""), pe = e.ref(""), De = e.ref(""), ye = e.computed(() => qt(pe.value));
    async function ze(t, n) {
      return A("fs-report", n, { mark: !1, busyKey: t });
    }
    async function st(t) {
      await ze("fs-draft", async () => {
        const n = await D("summary.draft", { useModel: t });
        re.value = n.summary, te.value = n.suggestions, Le.value = n.modelError ? o.t("模型没有用上（{p0}），已按数据起草", { p0: n.modelError }) : n.by === "model" ? o.t("模型起草") + (n.dropped ? o.t("，去掉了 {n} 句带有材料里没有的数字的话", { n: n.dropped }) : "") : t ? o.t("模型写的内容没有通过数字核对，已按数据起草") : o.t("已按数据起草，可以直接改");
      });
    }
    async function Rt() {
      De.value = "", await ze("fs-report-build", async () => {
        if (!re.value.trim() && w.value?.period.kind === "monthly") {
          const l = await D("summary.draft", { useModel: !1 });
          re.value = l.summary, te.value = l.suggestions;
        }
        await D("summary.save", { summary: re.value, suggestions: te.value });
        const t = await D("report.build");
        le.value = t, Ae.value = t.subject, Fe.value = t.text;
        const n = await ne();
        pe.value.trim() || (pe.value = t.kind === "monthly" ? n.settings.monthlyRecipients : n.settings.weeklyRecipients);
      });
    }
    async function Kt() {
      if (le.value && window.confirm(o.t("把通报发给 {n} 位收件人？附件 {m} 个。", { n: ye.value.ok, m: le.value.files.length }))) {
        f.value = "fs-report-send", B.start("fs-report");
        try {
          const t = await D("report.send", { to: pe.value, subject: Ae.value, text: Fe.value });
          De.value = o.t("已发送给 {n} 位收件人", { n: t.recipients }) + (t.via === "official" ? o.t("（经官方代发，发件人不是你自己的邮箱）") : "") + (t.ledgerAdded ? o.t("；{n} 条改善建议已记入改善台账", { n: t.ledgerAdded }) : "") + (t.notice ? ` ${t.notice}` : ""), B.done("fs-report", o.t("通报已发送给 {n} 位收件人", { n: t.recipients })), await ne();
        } catch (t) {
          B.fail("fs-report", t);
        } finally {
          f.value = "";
        }
      }
    }
    async function Wt() {
      await ze("fs-report", async () => {
        await D("summary.save", { summary: re.value, suggestions: te.value });
        const t = await D("report.toLedger");
        C.success(o.t("{n} 条改善建议已记入改善台账", { n: t })), await ne();
      });
    }
    const ot = e.defineComponent({
      name: "FsMailStatus",
      setup() {
        return () => {
          const t = J.value?.mail;
          if (!t) return null;
          const n = () => {
            b.push({ path: "/settings", query: { section: "notify", focus: "smtp" } });
          }, l = e.h("button", { type: "button", class: "ss-link", onClick: n }, o.t("去设置邮箱"));
          return t.smtpConfigured ? e.h("p", { class: "ss-note ok" }, [e.h("i", { class: "ri-mail-check-line" }), o.t("发件邮箱：{p0}", { p0: t.address })]) : t.officialRelay ? e.h("p", { class: "ss-note warn" }, [e.h("i", { class: "ri-mail-line" }), o.t("还没有配置自己的发件邮箱，会经官方代发（发件人不是你的邮箱，对方回信到不了你这里）。"), l]) : e.h("p", { class: "ss-note danger" }, [e.h("i", { class: "ri-mail-close-line" }), o.t("还没有配置发件邮箱，邮件发不出去。"), l]);
        };
      }
    }), Ie = e.defineComponent({
      name: "FsFlowTable",
      props: { flows: { type: Array, required: !0 }, running: Boolean, empty: { type: String, default: "" } },
      setup(t) {
        const n = e.ref(!1);
        return () => {
          if (!t.flows.length) return e.h("p", { class: "ss-note ok" }, [e.h("i", { class: "ri-checkbox-circle-line" }), t.empty]);
          const l = n.value ? t.flows : t.flows.slice(0, 30), p = [
            o.t("系统"),
            o.t("单号"),
            o.t("流程细类"),
            o.t("标题"),
            o.t("发起人"),
            o.t("状态"),
            t.running ? o.t("在途（天）") : o.t("用时（天）"),
            o.t("时效要求"),
            o.t("超出（天）"),
            ...t.running ? [o.t("当前节点"), o.t("当前处理人"), o.t("节点停留（天）")] : [o.t("开始"), o.t("结束")]
          ], M = new Set(t.running ? [6, 7, 8, 11] : [6, 7, 8]);
          return e.h("div", { class: "fs-flowtable" }, [
            e.h("div", { class: "ss-table-wrap fs-scroll" }, e.h("table", { class: "ss-table" }, [
              e.h("thead", e.h("tr", p.map((L, Ut) => e.h("th", { class: M.has(Ut) ? "num" : "" }, L)))),
              e.h("tbody", l.map((L) => e.h("tr", { key: `${L.system}|${L.flowNo}` }, [
                e.h("td", L.system),
                e.h("td", L.flowNo),
                e.h("td", L.flowType),
                e.h("td", { class: "fs-wrap" }, L.title),
                e.h("td", L.initiator),
                e.h("td", e.h("span", { class: ["ss-chip", St(L)] }, Dt(L))),
                e.h("td", { class: "num" }, j(L.days) + (L.approx ? " *" : "")),
                e.h("td", { class: "num" }, L.limitDays ?? "-"),
                e.h("td", { class: "num" }, L.overdueDays ? j(L.overdueDays) : "-"),
                ...t.running ? [e.h("td", L.currentNode), e.h("td", L.currentHandler), e.h("td", { class: "num" }, j(L.currentNodeDays))] : [e.h("td", Ke(L.startAt)), e.h("td", Ke(L.endAt))]
              ])))
            ])),
            t.flows.length > 30 ? e.h("button", { type: "button", class: "ss-link", onClick: () => {
              n.value = !n.value;
            } }, n.value ? o.t("只看前 30 条") : o.t("显示全部 {n} 条", { n: t.flows.length })) : null
          ]);
        };
      }
    });
    return e.onMounted(async () => {
      const t = J.value?.session;
      if (!(!t?.period || !t.ingest || !J.value?.hasData) && (Object.assign(d, ct(t.period)), z.value = t.ingest, B.set("fs-import", { state: "done", summary: S(t.ingest) }), !!await h())) {
        if (!t.snapshotId) {
          I.value = "fs-check";
          return;
        }
        try {
          w.value = await D("calc.view"), B.set("fs-check", { state: "done" }), B.set("fs-calc", { state: "done", summary: xe(w.value) }), I.value = "fs-compare", re.value = t.summary, te.value = t.suggestions.map((n) => ({ ...n })), await fe();
        } catch (n) {
          B.fail("fs-calc", n);
        }
      }
    }), e.watch(() => J.value?.session.snapshotId, (t, n) => {
      n && !t && w.value && !f.value && (oe("fs-check"), B.set("fs-check", { state: "todo", summary: void 0 }), I.value = "fs-check", h());
    }), k({ pick: c, commit: K, demo: de, runCalc: et, runCompare: tt, tables: _, form: d }), (t, n) => (e.openBlock(), e.createElementBlock("div", Yt, [
      e.createVNode(It, {
        title: t.$t("时效通报"),
        metas: V,
        runtime: e.unref(F),
        "current-key": e.unref(I),
        onJump: Y
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", Ht, [
        e.createCommentVNode(" 1 导入 "),
        e.createVNode(ge, {
          "step-key": "fs-import",
          index: 0,
          title: V[0].title,
          hint: V[0].hint,
          runtime: e.unref(F)["fs-import"],
          "is-current": e.unref(I) === "fs-import"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Gt, [
              e.createElementVNode("div", Jt, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(y, (l) => e.createElementVNode("button", {
                    key: l,
                    type: "button",
                    class: e.normalizeClass({ on: d.kind === l }),
                    "data-test": `fs-kind-${l}`,
                    onClick: (p) => O(l)
                  }, e.toDisplayString(e.unref($e)(l)), 11, Xt)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]),
              e.createElementVNode("label", Qt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("统计周期")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": n[0] || (n[0] = (l) => d.start = l),
                    type: "date",
                    "data-test": "fs-period-start"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, d.start]
                ])
              ]),
              e.createElementVNode("label", Zt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("至")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": n[1] || (n[1] = (l) => d.lastDay = l),
                    type: "date",
                    "data-test": "fs-period-end"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, d.lastDay]
                ])
              ]),
              e.createElementVNode("label", xt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("报表导出日期")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": n[2] || (n[2] = (l) => d.asOf = l),
                    type: "date"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, d.asOf]
                ])
              ]),
              e.createElementVNode(
                "span",
                el,
                e.toDisplayString(t.$t("在途时长算到报表导出那一天")),
                1
                /* TEXT */
              )
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(E), (l) => (e.openBlock(), e.createElementBlock("div", {
                key: l,
                class: "fs-sys"
              }, [
                e.createElementVNode("h4", null, [
                  n[23] || (n[23] = e.createElementVNode(
                    "i",
                    { class: "ri-database-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(l),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(se(l)),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", tl, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList($, (p) => e.createElementVNode("div", {
                      key: p,
                      class: "fs-slot"
                    }, [
                      e.createVNode(at, {
                        label: p === "flow" ? t.$t("{sys} 流程表（一行一个流程）", { sys: l }) : t.$t("{sys} 节点表（一行一次节点处理）", { sys: l }),
                        hint: p === "flow" ? t.$t("发起人维度的时效报表；一行一个节点的合并表也放这里") : t.$t("处理人维度的时效报表，算个人审核用时要用"),
                        multi: !1,
                        compact: "",
                        disabled: !!f.value,
                        files: _[l][p] ? [{ path: _[l][p].path, name: _[l][p].fileName }] : [],
                        onPicked: (M) => c(l, p, M[0]),
                        onRemove: (M) => _[l][p] = null
                      }, null, 8, ["label", "hint", "disabled", "files", "onPicked", "onRemove"]),
                      _[l][p] ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          _[l][p].combined && p === "flow" ? (e.openBlock(), e.createElementBlock("p", ll, [
                            n[24] || (n[24] = e.createElementVNode(
                              "i",
                              { class: "ri-information-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(t.$t("这张表一行是一个节点，流程会按单号归并出来，不用再放节点表")),
                              1
                              /* TEXT */
                            )
                          ])) : e.createCommentVNode("v-if", !0),
                          e.createVNode(rt, {
                            table: _[l][p],
                            roles: e.unref(He)(p, _[l][p].mapping, !!_[l].flow),
                            onUpdate: (M) => _[l][p].mapping = M,
                            onSheet: (M) => c(l, p, _[l][p].path, M)
                          }, null, 8, ["table", "roles", "onUpdate", "onSheet"])
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ])),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            e.createElementVNode("div", nl, [
              e.createElementVNode("h4", null, [
                n[25] || (n[25] = e.createElementVNode(
                  "i",
                  { class: "ri-team-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("花名册")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(t.$t("本中心人员名单：个人排名只统计名单里的人；有邮箱才能发原因收集和提醒邮件")),
                  1
                  /* TEXT */
                )
              ]),
              e.createVNode(at, {
                label: t.$t("中心人员花名册"),
                multi: !1,
                compact: "",
                disabled: !!f.value,
                files: T.value ? [{ path: T.value.path, name: T.value.fileName }] : [],
                onPicked: n[3] || (n[3] = (l) => s(l[0])),
                onRemove: n[4] || (n[4] = (l) => T.value = null)
              }, null, 8, ["label", "disabled", "files"]),
              T.value ? (e.openBlock(), e.createBlock(rt, {
                key: 0,
                table: T.value,
                roles: e.unref(He)("roster", T.value.mapping, !1),
                onUpdate: n[5] || (n[5] = (l) => T.value.mapping = l),
                onSheet: n[6] || (n[6] = (l) => s(T.value.path, l))
              }, null, 8, ["table", "roles"])) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("div", sl, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!f.value || !m.value,
                "data-test": "fs-import-commit",
                onClick: K
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(f.value === "fs-import" ? "ri-loader-4-line spin" : "ri-download-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("导入并标准化")),
                  1
                  /* TEXT */
                )
              ], 8, ol),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!f.value,
                "data-test": "fs-demo",
                onClick: de
              }, [
                n[26] || (n[26] = e.createElementVNode(
                  "i",
                  { class: "ri-file-download-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("生成示例数据")),
                  1
                  /* TEXT */
                )
              ], 8, al),
              r.value ? (e.openBlock(), e.createElementBlock(
                "span",
                rl,
                e.toDisplayString(r.value),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            z.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                X.value ? (e.openBlock(), e.createElementBlock("p", il, [
                  n[27] || (n[27] = e.createElementVNode(
                    "i",
                    { class: "ri-folder-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "code",
                    null,
                    e.toDisplayString(X.value),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: n[7] || (n[7] = (l) => e.unref(ie)(X.value, !0))
                    },
                    e.toDisplayString(t.$t("打开示例数据所在文件夹")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(z.value.warnings, (l) => (e.openBlock(), e.createElementBlock("p", {
                    key: l,
                    class: "ss-note warn"
                  }, [
                    n[28] || (n[28] = e.createElementVNode(
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
                )),
                z.value.skipped.length ? (e.openBlock(), e.createElementBlock("div", dl, [
                  e.createElementVNode("table", cl, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("没有收的行")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("原因")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          ul,
                          e.toDisplayString(t.$t("行数")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("在文件里的行号")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(z.value.skipped, (l) => (e.openBlock(), e.createElementBlock("tr", {
                          key: l.file + l.reason
                        }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(l.file),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(l.reason),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            ml,
                            e.toDisplayString(l.count),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(l.rows.join(t.$t("、"))) + e.toDisplayString(l.count > l.rows.length ? " …" : ""),
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
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 2 核对 "),
        e.createVNode(ge, {
          "step-key": "fs-check",
          index: 1,
          title: V[1].title,
          hint: V[1].hint,
          runtime: e.unref(F)["fs-check"],
          "is-current": e.unref(I) === "fs-check"
        }, {
          default: e.withCtx(() => [
            W.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", yl, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(W.value.counts, (l) => (e.openBlock(), e.createElementBlock("div", {
                      key: l.system,
                      class: "ss-kpi"
                    }, [
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(l.system) + e.toDisplayString(l.derived ? t.$t("（按单号归并）") : ""),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(l.flows),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(t.$t("办结 {a} · 在途 {b} · 终止 {c} · 节点 {d} 行", { a: l.done, b: l.running, c: l.terminated, d: l.nodes })),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  e.createElementVNode("div", gl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("花名册")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(W.value.rosterCount),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(W.value.rosterCount ? t.$t("个人排名只统计名单里的人") : t.$t("没有花名册：所有审核人都参与排名")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode(
                  "div",
                  vl,
                  e.toDisplayString(t.$t("对不上规则表的流程名（{n} 个）", { n: _e.value.length })),
                  1
                  /* TEXT */
                ),
                W.value.unmatched.length ? (e.openBlock(), e.createElementBlock("div", El, [
                  e.createElementVNode("table", Vl, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("系统")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("报表里的流程名")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          hl,
                          e.toDisplayString(t.$t("流程数")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("现在怎么算")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("改成按这个细类算")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(W.value.unmatched, (l) => (e.openBlock(), e.createElementBlock(
                          "tr",
                          {
                            key: l.system + l.flowName,
                            class: e.normalizeClass({ bad: !l.regular && l.system === "CSS" })
                          },
                          [
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(l.system),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(l.flowName),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              kl,
                              e.toDisplayString(l.count),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(l.system === "CSS" ? t.$t("没有时效要求，不参与合规率") : l.regular ? t.$t("已确认为常规流程") : t.$t("按常规流程（无整体时效要求）")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("td", null, [
                              e.createElementVNode("select", {
                                disabled: !!f.value,
                                "data-test": `fs-alias-${l.flowName}`,
                                onChange: (p) => N(l.system, l.flowName, p.target.value)
                              }, [
                                e.createElementVNode(
                                  "option",
                                  Dl,
                                  e.toDisplayString(t.$t("— 选择规则细类 —")),
                                  1
                                  /* TEXT */
                                ),
                                l.system !== "CSS" && !l.regular ? (e.openBlock(), e.createElementBlock(
                                  "option",
                                  {
                                    key: 0,
                                    value: gt
                                  },
                                  e.toDisplayString(t.$t("确认是常规流程，不再提示")),
                                  1
                                  /* TEXT */
                                )) : e.createCommentVNode("v-if", !0),
                                (e.openBlock(!0), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(i(l.system), (p) => (e.openBlock(), e.createElementBlock("option", {
                                    key: p.flowType,
                                    value: p.flowType
                                  }, e.toDisplayString(p.category) + " · " + e.toDisplayString(p.flowType), 9, Sl))),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ], 40, fl)
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
                  n[29] || (n[29] = e.createElementVNode(
                    "i",
                    { class: "ri-checkbox-circle-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("所有流程名都对上了规则表")),
                    1
                    /* TEXT */
                  )
                ])),
                Ve.value.length ? (e.openBlock(), e.createElementBlock("p", $l, [
                  e.createTextVNode(
                    e.toDisplayString(t.$t("已对应：")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(Ve.value, (l) => (e.openBlock(), e.createElementBlock("span", {
                      key: l.system + l.flowName,
                      class: "ss-chip brand fs-chip"
                    }, [
                      e.createTextVNode(
                        e.toDisplayString(l.system) + " · " + e.toDisplayString(l.flowName) + " → " + e.toDisplayString(l.target),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("button", {
                        type: "button",
                        title: t.$t("取消"),
                        onClick: (p) => N(l.system, l.flowName, "")
                      }, [...n[30] || (n[30] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-close-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, bl)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode(
                  "div",
                  _l,
                  e.toDisplayString(t.$t("没有登记内外部属性的节点（{n} 个）", { n: W.value.unknownNodes.length })),
                  1
                  /* TEXT */
                ),
                W.value.unknownNodes.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 4 },
                  [
                    e.createElementVNode("p", Bl, [
                      n[32] || (n[32] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("没定之前这些节点不计入个人审核用时。选「计入」= 内部节点，算审核人的用时；选「不计入」= 外部节点。")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", Cl, [
                      e.createElementVNode("table", Tl, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("系统")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("流程名")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("节点")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Ll,
                              e.toDisplayString(t.$t("出现次数")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("怎么处理")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(W.value.unknownNodes, (l) => (e.openBlock(), e.createElementBlock("tr", {
                              key: l.system + l.flowName + l.node
                            }, [
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.system),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.flowName),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.node),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Al,
                                e.toDisplayString(l.count),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("td", Fl, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-btn sm",
                                  disabled: !!f.value,
                                  "data-test": "fs-node-in",
                                  onClick: (p) => H(l, !0)
                                }, e.toDisplayString(t.$t("计入")), 9, Ol),
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-btn sm",
                                  disabled: !!f.value,
                                  "data-test": "fs-node-out",
                                  onClick: (p) => H(l, !1)
                                }, e.toDisplayString(t.$t("不计入")), 9, Ml)
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
                )) : (e.openBlock(), e.createElementBlock("p", wl, [
                  n[31] || (n[31] = e.createElementVNode(
                    "i",
                    { class: "ri-checkbox-circle-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("所有节点都有内外部属性")),
                    1
                    /* TEXT */
                  )
                ])),
                W.value.decisions.length ? (e.openBlock(), e.createElementBlock("p", Rl, [
                  e.createTextVNode(
                    e.toDisplayString(t.$t("已定：")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(W.value.decisions, (l) => (e.openBlock(), e.createElementBlock("span", {
                      key: l.system + l.flowName + l.node,
                      class: "ss-chip fs-chip"
                    }, [
                      e.createTextVNode(
                        e.toDisplayString(t.$t("{p0} · {p1}：{p2}", { p0: l.flowName, p1: l.node, p2: l.internal ? t.$t("计入") : t.$t("不计入") })),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("button", {
                        type: "button",
                        title: t.$t("取消"),
                        onClick: (p) => H(l, null)
                      }, [...n[33] || (n[33] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-close-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, Kl)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0),
                W.value.outOfRoster.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 6 },
                  [
                    e.createElementVNode(
                      "div",
                      Wl,
                      e.toDisplayString(t.$t("不在花名册里的审核人（{n} 人，不参与个人排名）", { n: W.value.outOfRoster.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("p", Ul, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(W.value.outOfRoster, (l) => (e.openBlock(), e.createElementBlock(
                          "span",
                          {
                            key: l,
                            class: "ss-chip"
                          },
                          e.toDisplayString(l),
                          1
                          /* TEXT */
                        ))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", zl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!f.value,
                    "data-test": "fs-check-done",
                    onClick: ee
                  }, [
                    n[34] || (n[34] = e.createElementVNode(
                      "i",
                      { class: "ri-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("核对好了，去计算")),
                      1
                      /* TEXT */
                    )
                  ], 8, Il)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              pl,
              e.toDisplayString(t.$t("导入后在这里核对规则对得上对不上")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 3 计算 "),
        e.createVNode(ge, {
          "step-key": "fs-calc",
          index: 2,
          title: V[2].title,
          hint: V[2].hint,
          runtime: e.unref(F)["fs-calc"],
          "is-current": e.unref(I) === "fs-calc"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Pl, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!f.value || !W.value,
                "data-test": "fs-calc-run",
                onClick: et
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(f.value === "fs-calc" ? "ri-loader-4-line spin" : "ri-calculator-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(w.value ? t.$t("重新计算") : t.$t("开始计算")),
                  1
                  /* TEXT */
                )
              ], 8, jl),
              w.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn",
                disabled: !!f.value,
                "data-test": "fs-calc-export",
                onClick: bt
              }, [
                n[35] || (n[35] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("导出全部明细")),
                  1
                  /* TEXT */
                )
              ], 8, ql)) : e.createCommentVNode("v-if", !0)
            ]),
            w.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                ce.value ? (e.openBlock(), e.createElementBlock("p", Yl, [
                  n[36] || (n[36] = e.createElementVNode(
                    "i",
                    { class: "ri-file-excel-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "code",
                    null,
                    e.toDisplayString(ce.value),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: n[8] || (n[8] = (l) => e.unref(ie)(ce.value))
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
                      onClick: n[9] || (n[9] = (l) => e.unref(ie)(ce.value, !0))
                    },
                    e.toDisplayString(t.$t("所在文件夹")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", Hl, [
                  e.createElementVNode("div", Gl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("办结数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(w.value.overall.doneCount),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Jl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("平均用时（天）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(j)(w.value.overall.avgDays)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Xl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("流程时效合规率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(G)(w.value.overall.complianceRate)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("超时 {a} / 参与判定 {b}", { a: w.value.overall.overtime, b: w.value.overall.judged })),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Ql, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("在途数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(w.value.overall.runningCount),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Zl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("已逾期")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      {
                        class: e.normalizeClass({ "fs-bad": w.value.overall.runningOverdue > 0 })
                      },
                      e.toDisplayString(w.value.overall.runningOverdue),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", xl, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("较大逾期风险")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      {
                        class: e.normalizeClass({ "fs-warn": w.value.overall.runningRisk > 0 })
                      },
                      e.toDisplayString(w.value.overall.runningRisk),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", en, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("个人审核合规率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(G)(w.value.overall.reviewRate)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("合规 {a} / 审核 {b} 次", { a: w.value.overall.reviewCompliant, b: w.value.overall.reviewCount })),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                w.value.approxCount ? (e.openBlock(), e.createElementBlock("p", tn, [
                  n[37] || (n[37] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("{n} 个 CSS 流程没有节点明细，用时按「结束 − 开始」估算（规则要求只累计内部节点）", { n: w.value.approxCount })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                we.value ? (e.openBlock(), e.createElementBlock("p", ln, [
                  n[38] || (n[38] = e.createElementVNode(
                    "i",
                    { class: "ri-notification-3-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(we.value),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode(
                  "div",
                  nn,
                  e.toDisplayString(t.$t("按大类")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", sn, [
                  e.createElementVNode("table", on, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("大类")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          an,
                          e.toDisplayString(t.$t("办结")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          rn,
                          e.toDisplayString(t.$t("平均用时（天）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          dn,
                          e.toDisplayString(t.$t("超时")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          cn,
                          e.toDisplayString(t.$t("合规率")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          un,
                          e.toDisplayString(t.$t("在途")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          mn,
                          e.toDisplayString(t.$t("在途逾期")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          pn,
                          e.toDisplayString(t.$t("在途超时占比")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(w.value.byCategory, (l) => (e.openBlock(), e.createElementBlock("tr", {
                          key: l.category
                        }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(l.category),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            yn,
                            e.toDisplayString(l.doneCount),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            gn,
                            e.toDisplayString(e.unref(j)(l.avgDays)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            vn,
                            e.toDisplayString(l.overtime),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Nn,
                            e.toDisplayString(e.unref(G)(l.complianceRate)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            En,
                            e.toDisplayString(l.runningCount),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Vn,
                            e.toDisplayString(l.runningOverdue),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            hn,
                            e.toDisplayString(e.unref(G)(l.runningOverdueRate)),
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
                e.createElementVNode(
                  "div",
                  kn,
                  e.toDisplayString(t.$t("按细类（{n} 类）", { n: w.value.byType.length })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", fn, [
                  e.createElementVNode("table", Dn, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("大类")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("流程细类")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("系统")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Sn,
                          e.toDisplayString(t.$t("办结")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          $n,
                          e.toDisplayString(t.$t("平均用时（天）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          bn,
                          e.toDisplayString(t.$t("时效要求")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          _n,
                          e.toDisplayString(t.$t("超时")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          wn,
                          e.toDisplayString(t.$t("合规率")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Bn,
                          e.toDisplayString(t.$t("在途")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Cn,
                          e.toDisplayString(t.$t("在途逾期")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(w.value.byType, (l) => (e.openBlock(), e.createElementBlock(
                          "tr",
                          {
                            key: l.category + l.flowType + l.system,
                            class: e.normalizeClass({ bad: l.complianceRate !== null && l.complianceRate < R.value })
                          },
                          [
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(l.category),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(l.flowType),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(l.system),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Tn,
                              e.toDisplayString(l.doneCount),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Ln,
                              e.toDisplayString(e.unref(j)(l.avgDays)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              An,
                              e.toDisplayString(l.limitDays ?? "-"),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Fn,
                              e.toDisplayString(l.overtime),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              On,
                              e.toDisplayString(e.unref(G)(l.complianceRate)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Mn,
                              e.toDisplayString(l.runningCount),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Rn,
                              e.toDisplayString(l.runningOverdue),
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
                ]),
                e.createElementVNode("div", Kn, [
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "div",
                      Wn,
                      e.toDisplayString(t.$t("审核人合规率排名（{n} 人）", { n: w.value.reviewerRank.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Un, [
                      e.createElementVNode("table", zn, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              In,
                              e.toDisplayString(t.$t("排名")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("姓名")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("部门")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("身份")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Pn,
                              e.toDisplayString(t.$t("审核次数")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              jn,
                              e.toDisplayString(t.$t("合规率")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              qn,
                              e.toDisplayString(t.$t("平均用时")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(w.value.reviewerRank, (l) => (e.openBlock(), e.createElementBlock("tr", {
                              key: l.name
                            }, [
                              e.createElementVNode(
                                "td",
                                Yn,
                                e.toDisplayString(l.rank),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.name),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.dept),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.identity),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Hn,
                                e.toDisplayString(l.count),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Gn,
                                e.toDisplayString(e.unref(G)(l.rate)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Jn,
                                e.toDisplayString(e.unref(j)(l.avgDays)),
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
                  ]),
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "div",
                      Xn,
                      e.toDisplayString(t.$t("发起人合规率排名（{n} 人）", { n: w.value.initiatorRank.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Qn, [
                      e.createElementVNode("table", Zn, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              xn,
                              e.toDisplayString(t.$t("排名")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("姓名")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("部门")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              es,
                              e.toDisplayString(t.$t("办结数")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              ts,
                              e.toDisplayString(t.$t("合规率")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              ls,
                              e.toDisplayString(t.$t("平均用时")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(w.value.initiatorRank, (l) => (e.openBlock(), e.createElementBlock("tr", {
                              key: l.name
                            }, [
                              e.createElementVNode(
                                "td",
                                ns,
                                e.toDisplayString(l.rank),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.name),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.dept),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                ss,
                                e.toDisplayString(l.count),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                os,
                                e.toDisplayString(e.unref(G)(l.rate)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                as,
                                e.toDisplayString(e.unref(j)(l.avgDays)),
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
                ]),
                e.createElementVNode(
                  "div",
                  rs,
                  e.toDisplayString(t.$t("本期办结超时（{n} 单）", { n: w.value.overtime.length })),
                  1
                  /* TEXT */
                ),
                e.createVNode(e.unref(Ie), {
                  flows: w.value.overtime,
                  empty: t.$t("本期没有办结超时的流程")
                }, null, 8, ["flows", "empty"]),
                e.createElementVNode(
                  "div",
                  is,
                  e.toDisplayString(t.$t("在途已逾期与较大逾期风险（{n} 单）", { n: w.value.runningAbnormal.length })),
                  1
                  /* TEXT */
                ),
                e.createVNode(e.unref(Ie), {
                  flows: w.value.runningAbnormal,
                  running: "",
                  empty: t.$t("没有逾期或临期的在途流程")
                }, null, 8, ["flows", "empty"])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 4 环比与异常 "),
        e.createVNode(ge, {
          "step-key": "fs-compare",
          index: 3,
          title: V[3].title,
          hint: V[3].hint,
          runtime: e.unref(F)["fs-compare"],
          "is-current": e.unref(I) === "fs-compare"
        }, {
          default: e.withCtx(() => [
            w.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", cs, [
                  P.value && P.value.candidates.length ? (e.openBlock(), e.createElementBlock("label", us, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("对比周期")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": n[10] || (n[10] = (l) => Ue.value = l),
                        "data-test": "fs-prev"
                      },
                      [
                        e.createElementVNode(
                          "option",
                          ms,
                          e.toDisplayString(t.$t("自动（上一个同类周期）")),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(P.value.candidates, (l) => (e.openBlock(), e.createElementBlock("option", {
                            key: l.id,
                            value: l.id
                          }, e.toDisplayString(l.label), 9, ps))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelSelect, Ue.value]
                    ])
                  ])) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!f.value,
                    "data-test": "fs-compare-run",
                    onClick: tt
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(f.value === "fs-compare" ? "ri-loader-4-line spin" : "ri-line-chart-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(P.value ? t.$t("重新分析") : t.$t("环比分析")),
                      1
                      /* TEXT */
                    )
                  ], 8, ys)
                ]),
                P.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    P.value.previous ? (e.openBlock(), e.createElementBlock("div", vs, [
                      e.createElementVNode("div", Ns, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("对比周期")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          Es,
                          e.toDisplayString(P.value.previous.label),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", Vs, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("合规率变化（百分点）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          {
                            class: e.normalizeClass(Be(P.value.delta.complianceRate, !0))
                          },
                          e.toDisplayString(e.unref(Pe)(P.value.delta.complianceRate)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("div", hs, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("平均用时变化（天）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          {
                            class: e.normalizeClass(Be(P.value.delta.avgDays, !1))
                          },
                          e.toDisplayString(e.unref(Oe)(P.value.delta.avgDays)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("div", ks, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("办结量变化")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(e.unref(Oe)(P.value.delta.doneCount)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", fs, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("在途逾期变化")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          {
                            class: e.normalizeClass(Be(P.value.delta.runningOverdue, !1))
                          },
                          e.toDisplayString(e.unref(Oe)(P.value.delta.runningOverdue)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("div", Ds, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("个人审核合规率变化（百分点）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          {
                            class: e.normalizeClass(Be(P.value.delta.reviewRate, !0))
                          },
                          e.toDisplayString(e.unref(Pe)(P.value.delta.reviewRate)),
                          3
                          /* TEXT, CLASS */
                        )
                      ])
                    ])) : (e.openBlock(), e.createElementBlock("p", gs, [
                      n[39] || (n[39] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("还没有上一周期的快照，这一期只按「合规率低于 {p0}」判断异常；下一期起会有环比。", { p0: e.unref(G)(R.value) })),
                        1
                        /* TEXT */
                      )
                    ])),
                    e.createElementVNode(
                      "div",
                      Ss,
                      e.toDisplayString(t.$t("各流程类型环比（异常 {n} 类）", { n: P.value.abnormal.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", $s, [
                      e.createElementVNode("table", bs, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("流程细类")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("系统")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              _s,
                              e.toDisplayString(t.$t("办结")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              ws,
                              e.toDisplayString(t.$t("平均用时")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Bs,
                              e.toDisplayString(t.$t("上期")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Cs,
                              e.toDisplayString(t.$t("变化")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Ts,
                              e.toDisplayString(t.$t("合规率")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Ls,
                              e.toDisplayString(t.$t("上期")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              As,
                              e.toDisplayString(t.$t("变化（百分点）")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("异常原因")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(P.value.types, (l) => (e.openBlock(), e.createElementBlock(
                              "tr",
                              {
                                key: l.flowType + l.system,
                                class: e.normalizeClass({ bad: l.abnormal })
                              },
                              [
                                e.createElementVNode(
                                  "td",
                                  null,
                                  e.toDisplayString(l.flowType),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  null,
                                  e.toDisplayString(l.system),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Fs,
                                  e.toDisplayString(l.doneCount),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Os,
                                  e.toDisplayString(e.unref(j)(l.avgDays)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Ms,
                                  e.toDisplayString(e.unref(j)(l.prevAvgDays)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Rs,
                                  e.toDisplayString(e.unref(Oe)(l.avgDelta)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Ks,
                                  e.toDisplayString(e.unref(G)(l.complianceRate)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Ws,
                                  e.toDisplayString(e.unref(G)(l.prevComplianceRate)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Us,
                                  e.toDisplayString(e.unref(Pe)(l.rateDelta)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  zs,
                                  e.toDisplayString(l.reasons.join(t.$t("；"))),
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
                    ]),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(P.value.abnormal, (l) => (e.openBlock(), e.createElementBlock("div", {
                        key: l.flowType + l.system,
                        class: "fs-abn",
                        "data-test": "fs-abnormal"
                      }, [
                        e.createElementVNode("header", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(l.flowType),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "span",
                            Is,
                            e.toDisplayString(l.system),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(l.reasons, (p) => (e.openBlock(), e.createElementBlock(
                              "span",
                              {
                                key: p,
                                class: "ss-chip bad"
                              },
                              e.toDisplayString(p),
                              1
                              /* TEXT */
                            ))),
                            128
                            /* KEYED_FRAGMENT */
                          )),
                          l.analysis.longestNode ? (e.openBlock(), e.createElementBlock("span", Ps, [
                            n[40] || (n[40] = e.createElementVNode(
                              "i",
                              { class: "ri-timer-flash-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(t.$t("耗时最长的节点：{p0}", { p0: l.analysis.longestNode })),
                              1
                              /* TEXT */
                            )
                          ])) : e.createCommentVNode("v-if", !0)
                        ]),
                        l.analysis.nodes.length ? (e.openBlock(), e.createElementBlock("div", qs, [
                          e.createElementVNode("table", Ys, [
                            e.createElementVNode("thead", null, [
                              e.createElementVNode("tr", null, [
                                e.createElementVNode(
                                  "th",
                                  null,
                                  e.toDisplayString(t.$t("节点")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  null,
                                  e.toDisplayString(t.$t("内外部")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Hs,
                                  e.toDisplayString(t.$t("处理次数")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Gs,
                                  e.toDisplayString(t.$t("平均耗时（天）")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Js,
                                  e.toDisplayString(t.$t("最长（天）")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Xs,
                                  e.toDisplayString(t.$t("平均等待（天）")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Qs,
                                  e.toDisplayString(t.$t("耗时占比")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Zs,
                                  e.toDisplayString(t.$t("在途停留数")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  xs,
                                  e.toDisplayString(t.$t("平均停留（天）")),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ]),
                            e.createElementVNode("tbody", null, [
                              (e.openBlock(!0), e.createElementBlock(
                                e.Fragment,
                                null,
                                e.renderList(l.analysis.nodes, (p) => (e.openBlock(), e.createElementBlock(
                                  "tr",
                                  {
                                    key: p.node,
                                    class: e.normalizeClass({ bad: p.node === l.analysis.longestNode })
                                  },
                                  [
                                    e.createElementVNode(
                                      "td",
                                      null,
                                      e.toDisplayString(p.node),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      null,
                                      e.toDisplayString(p.internal == null ? t.$t("未登记") : p.internal ? t.$t("内部") : t.$t("外部")),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      eo,
                                      e.toDisplayString(p.count),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      to,
                                      e.toDisplayString(e.unref(j)(p.avgDays)),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      lo,
                                      e.toDisplayString(e.unref(j)(p.maxDays)),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      no,
                                      e.toDisplayString(e.unref(j)(p.avgWaitDays)),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      so,
                                      e.toDisplayString(e.unref(G)(p.share)),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      oo,
                                      e.toDisplayString(p.stuckCount),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      ao,
                                      e.toDisplayString(e.unref(j)(p.avgStuckDays)),
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
                          js,
                          e.toDisplayString(t.$t("这一类流程没有节点明细，定位不到具体节点")),
                          1
                          /* TEXT */
                        ))
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    w.value.period.kind === "monthly" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 2 },
                      [
                        e.createElementVNode(
                          "div",
                          ro,
                          e.toDisplayString(t.$t("本年度发起、仍未办结且已超时的在途流程（{n} 单）", { n: P.value.yearOverdue.length })),
                          1
                          /* TEXT */
                        ),
                        e.createVNode(e.unref(Ie), {
                          flows: P.value.yearOverdue,
                          running: "",
                          empty: t.$t("本年度没有超时未办结的在途流程")
                        }, null, 8, ["flows", "empty"])
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              ds,
              e.toDisplayString(t.$t("计算完成后在这里和上一周期对比")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 5 原因 "),
        e.createVNode(ge, {
          "step-key": "fs-reason",
          index: 4,
          title: V[4].title,
          hint: V[4].hint,
          runtime: e.unref(F)["fs-reason"],
          "is-current": e.unref(I) === "fs-reason"
        }, {
          default: e.withCtx(() => [
            w.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                Q.value.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    e.createVNode(e.unref(ot)),
                    e.createElementVNode(
                      "div",
                      uo,
                      e.toDisplayString(t.$t("按责任人发原因收集邮件（{a} 人，{b} 个流程）", { a: ue.value.length, b: Q.value.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", mo, [
                      e.createElementVNode("table", po, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode("th", null, [
                              e.createElementVNode("input", {
                                type: "checkbox",
                                checked: _t.value,
                                onChange: n[11] || (n[11] = (l) => wt(l.target.checked))
                              }, null, 40, yo)
                            ]),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("责任人")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              go,
                              e.toDisplayString(t.$t("流程数")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("邮箱")),
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
                            n[42] || (n[42] = e.createElementVNode(
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
                            e.renderList(ue.value, (l) => (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              {
                                key: l.owner
                              },
                              [
                                e.createElementVNode("tr", null, [
                                  e.createElementVNode("td", null, [
                                    e.withDirectives(e.createElementVNode("input", {
                                      "onUpdate:modelValue": n[12] || (n[12] = (p) => Z.value = p),
                                      type: "checkbox",
                                      value: l.owner,
                                      disabled: !l.email
                                    }, null, 8, vo), [
                                      [e.vModelCheckbox, Z.value]
                                    ])
                                  ]),
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(l.owner || t.$t("（没有责任人）")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    No,
                                    e.toDisplayString(l.count),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode("td", null, [
                                    e.createElementVNode("input", {
                                      type: "text",
                                      value: l.email,
                                      placeholder: t.$t("花名册里没有邮箱，可在这里补"),
                                      onChange: (p) => Bt(l.owner, p.target.value)
                                    }, null, 40, Eo)
                                  ]),
                                  e.createElementVNode("td", null, [
                                    l.mailedAt ? (e.openBlock(), e.createElementBlock(
                                      "span",
                                      Vo,
                                      e.toDisplayString(t.$t("已发 {p0}", { p0: e.unref(q.fmtDateTime)(l.mailedAt) })),
                                      1
                                      /* TEXT */
                                    )) : l.email ? (e.openBlock(), e.createElementBlock(
                                      "span",
                                      ko,
                                      e.toDisplayString(t.$t("未发")),
                                      1
                                      /* TEXT */
                                    )) : (e.openBlock(), e.createElementBlock(
                                      "span",
                                      ho,
                                      e.toDisplayString(t.$t("没有邮箱，发不了")),
                                      1
                                      /* TEXT */
                                    ))
                                  ]),
                                  e.createElementVNode("td", null, [
                                    e.createElementVNode("button", {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: (p) => Ce.value = Ce.value === l.owner ? "" : l.owner
                                    }, e.toDisplayString(Ce.value === l.owner ? t.$t("收起") : t.$t("预览邮件")), 9, fo)
                                  ])
                                ]),
                                Ce.value === l.owner ? (e.openBlock(), e.createElementBlock("tr", Do, [
                                  e.createElementVNode("td", So, [
                                    e.createElementVNode("div", $o, [
                                      e.createElementVNode(
                                        "b",
                                        null,
                                        e.toDisplayString(l.subject),
                                        1
                                        /* TEXT */
                                      ),
                                      e.createElementVNode(
                                        "pre",
                                        null,
                                        e.toDisplayString(l.body),
                                        1
                                        /* TEXT */
                                      ),
                                      e.createElementVNode(
                                        "small",
                                        null,
                                        e.toDisplayString(t.$t("附件：这位责任人名下流程的《超时原因收集表》")),
                                        1
                                        /* TEXT */
                                      )
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
                    ]),
                    e.createElementVNode("div", bo, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn primary",
                        disabled: !!f.value || !Z.value.length,
                        "data-test": "fs-reason-send",
                        onClick: Ct
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(f.value === "fs-reason-send" ? "ri-loader-4-line spin" : "ri-mail-send-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("发送给所选的 {n} 人", { n: Z.value.length })),
                          1
                          /* TEXT */
                        )
                      ], 8, _o),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn",
                        disabled: !!f.value,
                        onClick: Tt
                      }, [
                        n[43] || (n[43] = e.createElementVNode(
                          "i",
                          { class: "ri-file-excel-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("导出原因收集表")),
                          1
                          /* TEXT */
                        )
                      ], 8, wo),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn",
                        disabled: !!f.value,
                        onClick: Lt
                      }, [
                        n[44] || (n[44] = e.createElementVNode(
                          "i",
                          { class: "ri-upload-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("导入填好的表")),
                          1
                          /* TEXT */
                        )
                      ], 8, Bo)
                    ]),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(he.value, (l) => (e.openBlock(), e.createElementBlock(
                        "p",
                        {
                          key: l.text,
                          class: e.normalizeClass(["ss-note", l.cls])
                        },
                        [
                          n[45] || (n[45] = e.createElementVNode(
                            "i",
                            { class: "ri-information-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(l.text),
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
                    ke.value ? (e.openBlock(), e.createElementBlock("p", Co, [
                      n[46] || (n[46] = e.createElementVNode(
                        "i",
                        { class: "ri-file-excel-2-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode(
                        "code",
                        null,
                        e.toDisplayString(ke.value),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: "ss-link",
                          onClick: n[13] || (n[13] = (l) => e.unref(ie)(ke.value))
                        },
                        e.toDisplayString(t.$t("打开")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "div",
                      To,
                      e.toDisplayString(t.$t("原因回填与归类（已填 {a} / {b}）", { a: me.value, b: Q.value.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Lo, [
                      e.createElementVNode("table", Ao, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("责任人")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("系统")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("单号")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("流程细类")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("类型")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Fo,
                              e.toDisplayString(t.$t("超出（天）")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("超时原因")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("原因类别")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(Q.value, (l) => (e.openBlock(), e.createElementBlock("tr", {
                              key: l.key
                            }, [
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.owner),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.system),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.flowNo),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(l.flowType),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("td", null, [
                                e.createElementVNode(
                                  "span",
                                  {
                                    class: e.normalizeClass(["ss-chip", l.kind === "running" ? "bad" : "warn"])
                                  },
                                  e.toDisplayString(l.kind === "running" ? t.$t("在途已逾期") : t.$t("已办结超时")),
                                  3
                                  /* TEXT, CLASS */
                                )
                              ]),
                              e.createElementVNode(
                                "td",
                                Oo,
                                e.toDisplayString(e.unref(j)(l.overdueDays)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("td", null, [
                                e.createElementVNode("input", {
                                  type: "text",
                                  class: "fs-reason",
                                  value: l.reason,
                                  placeholder: t.$t("填责任人反馈的原因"),
                                  "data-test": `fs-reason-${l.flowNo}`,
                                  onChange: (p) => At(l.key, p.target.value)
                                }, null, 40, Mo)
                              ]),
                              e.createElementVNode("td", null, [
                                e.createElementVNode("select", {
                                  value: l.categoryId,
                                  disabled: !l.reason,
                                  onChange: (p) => Ft(l.key, p.target.value)
                                }, [
                                  e.createElementVNode(
                                    "option",
                                    Ko,
                                    e.toDisplayString(t.$t("未归类")),
                                    1
                                    /* TEXT */
                                  ),
                                  (e.openBlock(!0), e.createElementBlock(
                                    e.Fragment,
                                    null,
                                    e.renderList(e.unref(g), (p) => (e.openBlock(), e.createElementBlock("option", {
                                      key: p,
                                      value: p
                                    }, e.toDisplayString(e.unref(yt)(p)), 9, Wo))),
                                    128
                                    /* KEYED_FRAGMENT */
                                  ))
                                ], 40, Ro)
                              ])
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ])
                    ]),
                    e.createElementVNode("div", Uo, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn",
                        disabled: !!f.value || !me.value,
                        "data-test": "fs-classify-rule",
                        onClick: n[14] || (n[14] = (l) => nt(!1))
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(f.value === "fs-classify" ? "ri-loader-4-line spin" : "ri-price-tag-3-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("按关键字归类")),
                          1
                          /* TEXT */
                        )
                      ], 8, zo),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn",
                        disabled: !!f.value || !me.value,
                        onClick: n[15] || (n[15] = (l) => nt(!0))
                      }, [
                        n[47] || (n[47] = e.createElementVNode(
                          "i",
                          { class: "ri-price-tag-3-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("用模型归类并写根因")),
                          1
                          /* TEXT */
                        )
                      ], 8, Io),
                      e.createElementVNode(
                        "span",
                        Po,
                        e.toDisplayString(t.$t("模型只在固定的七类里选，不算任何数字；它写的话里出现材料里没有的数字会被去掉")),
                        1
                        /* TEXT */
                      )
                    ]),
                    lt.value.length ? (e.openBlock(), e.createElementBlock("div", jo, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(lt.value, (l) => (e.openBlock(), e.createElementBlock("label", {
                          key: l.id,
                          class: "ss-field"
                        }, [
                          e.createElementVNode("span", null, [
                            e.createElementVNode(
                              "b",
                              null,
                              e.toDisplayString(e.unref(yt)(l.id)),
                              1
                              /* TEXT */
                            ),
                            e.createTextVNode(
                              " · " + e.toDisplayString(t.$t("{n} 单", { n: l.count })),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode("textarea", {
                            value: Te.value[l.id] || "",
                            rows: "2",
                            placeholder: t.$t("根因说明"),
                            onChange: (p) => Ot(l.id, p.target.value)
                          }, null, 40, qo)
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : (e.openBlock(), e.createElementBlock("p", co, [
                  n[41] || (n[41] = e.createElementVNode(
                    "i",
                    { class: "ri-checkbox-circle-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("本期没有办结超时或在途逾期的流程，不需要收集原因")),
                    1
                    /* TEXT */
                  )
                ])),
                e.createElementVNode("div", Yo, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!f.value,
                    "data-test": "fs-reason-done",
                    onClick: Mt
                  }, [
                    n[48] || (n[48] = e.createElementVNode(
                      "i",
                      { class: "ri-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(Q.value.length && me.value < Q.value.length ? t.$t("先按已收到的继续（还有 {n} 个没填）", { n: Q.value.length - me.value }) : t.$t("原因收集完成")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ho)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              io,
              e.toDisplayString(t.$t("计算完成后在这里收集超时原因")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 6 通报 "),
        e.createVNode(ge, {
          "step-key": "fs-report",
          index: 5,
          title: V[5].title,
          hint: V[5].hint,
          runtime: e.unref(F)["fs-report"],
          "is-current": e.unref(I) === "fs-report"
        }, {
          default: e.withCtx(() => [
            w.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", Jo, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: !!f.value,
                    "data-test": "fs-draft-rule",
                    onClick: n[16] || (n[16] = (l) => st(!1))
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(f.value === "fs-draft" ? "ri-loader-4-line spin" : "ri-file-text-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("按数据起草总结与建议")),
                      1
                      /* TEXT */
                    )
                  ], 8, Xo),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: !!f.value,
                    onClick: n[17] || (n[17] = (l) => st(!0))
                  }, [
                    n[49] || (n[49] = e.createElementVNode(
                      "i",
                      { class: "ri-quill-pen-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("用模型起草")),
                      1
                      /* TEXT */
                    )
                  ], 8, Qo),
                  Le.value ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Zo,
                    e.toDisplayString(Le.value),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("label", xo, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(w.value.period.kind === "monthly" ? t.$t("月度总结（整体表现 / 异常趋势 / 重点问题 / 责任维度）") : t.$t("小结（可留空）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": n[18] || (n[18] = (l) => re.value = l),
                      rows: "8",
                      "data-test": "fs-summary"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, re.value]
                  ])
                ]),
                w.value.period.kind === "monthly" ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode(
                      "div",
                      ea,
                      e.toDisplayString(t.$t("改善建议（{n} 条，发送月报时记入改善台账）", { n: te.value.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", ta, [
                      e.createElementVNode("table", la, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("建议事项")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("责任部门")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("责任人")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("执行要求")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("执行期限")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("验收要求")),
                              1
                              /* TEXT */
                            ),
                            n[50] || (n[50] = e.createElementVNode(
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
                            e.renderList(te.value, (l, p) => (e.openBlock(), e.createElementBlock("tr", { key: p }, [
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (M) => l.item = M,
                                  type: "text",
                                  class: "fs-wide"
                                }, null, 8, na), [
                                  [e.vModelText, l.item]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (M) => l.dept = M,
                                  type: "text"
                                }, null, 8, sa), [
                                  [e.vModelText, l.dept]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (M) => l.owner = M,
                                  type: "text"
                                }, null, 8, oa), [
                                  [e.vModelText, l.owner]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (M) => l.requirement = M,
                                  type: "text",
                                  class: "fs-wide"
                                }, null, 8, aa), [
                                  [e.vModelText, l.requirement]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (M) => l.deadline = M,
                                  type: "date"
                                }, null, 8, ra), [
                                  [e.vModelText, l.deadline]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (M) => l.acceptance = M,
                                  type: "text",
                                  class: "fs-wide"
                                }, null, 8, ia), [
                                  [e.vModelText, l.acceptance]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-link",
                                  onClick: (M) => te.value.splice(p, 1)
                                }, e.toDisplayString(t.$t("删除")), 9, da)
                              ])
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ])
                    ]),
                    e.createElementVNode("div", ca, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm",
                        onClick: n[19] || (n[19] = (l) => te.value.push({ item: "", dept: "", owner: "", requirement: "", deadline: "", acceptance: "" }))
                      }, [
                        n[51] || (n[51] = e.createElementVNode(
                          "i",
                          { class: "ri-add-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("加一条")),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", ua, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!f.value,
                    "data-test": "fs-report-build",
                    onClick: Rt
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(f.value === "fs-report-build" ? "ri-loader-4-line spin" : "ri-file-chart-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(le.value ? t.$t("重新生成通报") : t.$t("生成通报并预览")),
                      1
                      /* TEXT */
                    )
                  ], 8, ma)
                ]),
                le.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(le.value.files, (l) => (e.openBlock(), e.createElementBlock("p", {
                        key: l.path,
                        class: "ss-file-out"
                      }, [
                        n[52] || (n[52] = e.createElementVNode(
                          "i",
                          { class: "ri-attachment-2" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode(
                          "code",
                          null,
                          e.toDisplayString(l.path),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (p) => e.unref(ie)(l.path)
                        }, e.toDisplayString(t.$t("打开")), 9, pa),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (p) => e.unref(ie)(l.path, !0)
                        }, e.toDisplayString(t.$t("所在文件夹")), 9, ya)
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode(
                      "div",
                      ga,
                      e.toDisplayString(le.value.kind === "monthly" ? t.$t("分析报告预览（附件 PDF 的内容）") : t.$t("通报预览（附件网页版的内容）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("iframe", {
                      class: "fs-preview",
                      sandbox: "",
                      srcdoc: le.value.html,
                      title: t.$t("通报预览"),
                      "data-test": "fs-preview"
                    }, null, 8, va),
                    e.createVNode(e.unref(ot)),
                    e.createElementVNode("label", Na, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("邮件主题")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": n[20] || (n[20] = (l) => Ae.value = l),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, Ae.value]
                      ])
                    ]),
                    e.createElementVNode("label", Ea, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("邮件正文")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "textarea",
                        {
                          "onUpdate:modelValue": n[21] || (n[21] = (l) => Fe.value = l),
                          rows: "9"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, Fe.value]
                      ])
                    ]),
                    e.createElementVNode("label", Va, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("收件人（多个用逗号、分号或换行隔开，下次自动带出）")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "textarea",
                        {
                          "onUpdate:modelValue": n[22] || (n[22] = (l) => pe.value = l),
                          rows: "2",
                          placeholder: "a@example.com; b@example.com",
                          "data-test": "fs-recipients"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, pe.value]
                      ])
                    ]),
                    ye.value.bad.length ? (e.openBlock(), e.createElementBlock("p", ha, [
                      n[53] || (n[53] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("这些地址写得不对：{p0}", { p0: ye.value.bad.join("、") })),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode("div", ka, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn primary",
                        disabled: !!f.value || !ye.value.ok || ye.value.bad.length > 0,
                        "data-test": "fs-report-send",
                        onClick: Kt
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(f.value === "fs-report-send" ? "ri-loader-4-line spin" : "ri-mail-send-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("发送给 {n} 位收件人", { n: ye.value.ok })),
                          1
                          /* TEXT */
                        )
                      ], 8, fa),
                      le.value.kind === "monthly" && !U.value?.ledgerWritten && te.value.length ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-btn",
                        disabled: !!f.value,
                        onClick: Wt
                      }, [
                        n[54] || (n[54] = e.createElementVNode(
                          "i",
                          { class: "ri-book-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("不发邮件，只把建议记入台账")),
                          1
                          /* TEXT */
                        )
                      ], 8, Da)) : e.createCommentVNode("v-if", !0),
                      U.value?.sentAt ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Sa,
                        e.toDisplayString(t.$t("已发送 {p0}", { p0: e.unref(q.fmtDateTime)(U.value.sentAt) })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      U.value?.ledgerWritten ? (e.openBlock(), e.createElementBlock(
                        "span",
                        $a,
                        e.toDisplayString(t.$t("改善建议已记入台账")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]),
                    De.value ? (e.openBlock(), e.createElementBlock("p", ba, [
                      n[55] || (n[55] = e.createElementVNode(
                        "i",
                        { class: "ri-checkbox-circle-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(De.value),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Go,
              e.toDisplayString(t.$t("计算完成后在这里生成通报")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"])
      ])
    ]));
  }
}), Ee = (u, k) => {
  const y = u.__vccOpts || u;
  for (const [E, $] of k)
    y[E] = $;
  return y;
}, wa = /* @__PURE__ */ Ee(_a, [["__scopeId", "data-v-703d3f90"]]), Xe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/core"];
if (!Xe) throw new Error("宿主模块未就绪：npm:echarts/core");
Xe.default;
const Qe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/renderers"];
if (!Qe) throw new Error("宿主模块未就绪：npm:echarts/renderers");
Qe.default;
const We = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/charts"];
if (!We) throw new Error("宿主模块未就绪：npm:echarts/charts");
We.default;
const Ne = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/components"];
if (!Ne) throw new Error("宿主模块未就绪：npm:echarts/components");
Ne.default;
const $t = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-echarts"];
if (!$t) throw new Error("宿主模块未就绪：npm:vue-echarts");
const vt = $t.default, Ba = { class: "fs-board" }, Ca = {
  key: 0,
  class: "ss-note danger"
}, Ta = {
  key: 1,
  class: "ss-empty",
  "data-test": "fs-board-empty"
}, La = { class: "ss-actions fs-filters" }, Aa = { class: "ss-field inline" }, Fa = ["value"], Oa = { class: "ss-field inline" }, Ma = { value: "" }, Ra = ["value"], Ka = { class: "ss-field inline" }, Wa = { value: "" }, Ua = ["value"], za = { class: "ss-field inline" }, Ia = { value: "" }, Pa = ["value"], ja = { class: "ss-field inline" }, qa = { value: "" }, Ya = ["value"], Ha = {
  key: 1,
  class: "ri-loader-4-line spin"
}, Ga = {
  key: 0,
  class: "ss-kpis",
  "data-test": "fs-board-kpis"
}, Ja = { class: "ss-kpi" }, Xa = { class: "ss-kpi" }, Qa = { class: "ss-kpi accent" }, Za = { class: "ss-kpi" }, xa = { class: "ss-kpi" }, er = { class: "ss-kpi" }, tr = { class: "ss-kpi accent" }, lr = { class: "fs-charts" }, nr = { class: "fs-card" }, sr = { class: "fs-seg" }, or = ["onClick"], ar = {
  key: 0,
  class: "ss-empty"
}, rr = { class: "ss-muted" }, ir = { class: "fs-card" }, dr = { class: "ss-muted" }, cr = {
  key: 0,
  class: "ss-empty"
}, ur = { class: "fs-card" }, mr = { class: "ss-table-wrap fs-scroll" }, pr = { class: "ss-table" }, yr = { class: "num" }, gr = { class: "num" }, vr = { class: "num" }, Nr = { class: "num" }, Er = { class: "num" }, Vr = { class: "num" }, hr = ["onClick"], kr = { class: "num" }, fr = { class: "num" }, Dr = { class: "num" }, Sr = { class: "num" }, $r = { class: "num" }, br = { class: "num" }, _r = { class: "ss-muted" }, wr = { class: "fs-card" }, Br = { class: "ss-muted" }, Cr = { class: "ss-table-wrap fs-scroll" }, Tr = { class: "ss-table" }, Lr = { class: "num" }, Ar = { class: "num" }, Fr = { class: "num" }, Or = { class: "num" }, Mr = { class: "num" }, Rr = { class: "num" }, Kr = { class: "num" }, Wr = { class: "num" }, Ur = { class: "num" }, zr = { class: "num" }, Ir = { class: "fs-card" }, Pr = { class: "ss-muted" }, jr = { class: "ss-field inline fs-only" }, qr = { class: "ss-table-wrap fs-scroll tall" }, Yr = { class: "ss-table" }, Hr = { class: "num" }, Gr = { class: "num" }, Jr = { class: "num" }, Xr = { class: "num" }, Qr = { class: "num" }, Zr = { class: "num" }, xr = {
  key: 3,
  class: "ss-note"
}, ei = /* @__PURE__ */ e.defineComponent({
  __name: "BoardTab",
  setup(u) {
    Xe.use([Qe.CanvasRenderer, We.BarChart, We.LineChart, Ne.GridComponent, Ne.TooltipComponent, Ne.LegendComponent, Ne.MarkLineComponent]);
    const k = ["weekly", "monthly"], y = e.ref(null), E = e.ref(!1), $ = e.ref(""), g = e.reactive({ snapshotId: "", system: "", category: "", flowType: "", dept: "" }), C = e.ref("weekly"), b = e.ref(!1), U = e.computed(() => J.value?.snapshots ?? []), R = e.computed(() => J.value?.thresholds.minComplianceRate ?? 0.95), V = e.computed(() => !!(g.system || g.category || g.flowType || g.dept));
    let B = 0, F = "";
    const I = () => JSON.stringify(g);
    async function f() {
      const s = ++B;
      F = I(), E.value = !0;
      try {
        const a = await D("board.get", g);
        if (s !== B) return;
        y.value = a, $.value = "", a.snapshot && g.snapshotId !== a.snapshot.id && (g.snapshotId = a.snapshot.id, C.value = a.snapshot.kind, F = I()), g.flowType && !a.options.flowTypes.includes(g.flowType) && (g.flowType = "");
      } catch (a) {
        s === B && ($.value = q.errorMessage(a));
      } finally {
        s === B && (E.value = !1);
      }
    }
    e.watch(g, () => {
      I() !== F && f();
    }), e.watch(() => `${U.value[0]?.id}|${U.value.length}|${U.value.map((s) => s.savedAt).join()}`, () => {
      g.snapshotId = "", f();
    }), e.onMounted(f);
    function A() {
      Object.assign(g, { system: "", category: "", flowType: "", dept: "" });
    }
    function Y(s) {
      Object.assign(g, { system: s.system, category: s.category, flowType: s.flowType });
    }
    async function d() {
      const s = y.value?.snapshot;
      if (!(!s || !window.confirm(o.t("删除「{p0}」这个周期的快照？趋势里也不再有它。", { p0: s.label }))))
        try {
          await D("snapshot.remove", { id: s.id });
        } catch (a) {
          $.value = q.errorMessage(a);
        }
    }
    const O = e.computed(() => (y.value?.flows ?? []).filter((s) => !b.value || s.overtime === !0 || s.runningLabel === "overdue")), _ = e.computed(() => (y.value?.trend ?? []).filter((s) => s.kind === C.value).slice(-16)), T = e.computed(() => [...y.value?.byType ?? []].filter((s) => s.doneCount > 0 && s.complianceRate !== null).sort((s, a) => a.doneCount - s.doneCount).slice(0, 12).reverse());
    function z(s, a) {
      try {
        return getComputedStyle(document.documentElement).getPropertyValue(s).trim() || a;
      } catch {
        return a;
      }
    }
    const X = e.computed(() => ({ brand: z("--color-brand", "#3b6cf6"), warn: z("--color-warning", "#f59e0b"), bad: z("--color-danger", "#e5484d"), axis: z("--color-text-secondary", "#8a8fa3"), grid: z("--color-border", "#e6e8ef") })), se = e.computed(() => {
      const s = X.value, a = _.value;
      return {
        tooltip: { trigger: "axis" },
        legend: { data: [o.t("合规率（%）"), o.t("平均用时（天）")], textStyle: { color: s.axis }, top: 0 },
        grid: { left: 44, right: 44, top: 34, bottom: 28 },
        xAxis: { type: "category", data: a.map((r) => r.label), axisLabel: { color: s.axis, fontSize: 10, hideOverlap: !0 }, axisLine: { lineStyle: { color: s.grid } } },
        yAxis: [
          { type: "value", max: 100, min: (r) => Math.max(0, Math.floor((r.min - 5) / 5) * 5), axisLabel: { color: s.axis, formatter: "{value}%" }, splitLine: { lineStyle: { color: s.grid } } },
          { type: "value", axisLabel: { color: s.axis }, splitLine: { show: !1 } }
        ],
        series: [
          {
            name: o.t("合规率（%）"),
            type: "line",
            data: a.map((r) => r.complianceRate == null ? null : Math.round(r.complianceRate * 1e3) / 10),
            itemStyle: { color: s.brand },
            lineStyle: { color: s.brand },
            connectNulls: !0,
            markLine: { silent: !0, symbol: "none", lineStyle: { color: s.bad, type: "dashed" }, label: { formatter: G(R.value), color: s.bad }, data: [{ yAxis: Math.round(R.value * 1e3) / 10 }] }
          },
          { name: o.t("平均用时（天）"), type: "line", yAxisIndex: 1, data: a.map((r) => r.avgDays), itemStyle: { color: s.warn }, lineStyle: { color: s.warn }, connectNulls: !0 }
        ]
      };
    }), c = e.computed(() => {
      const s = X.value, a = T.value;
      return {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: 8, right: 52, top: 8, bottom: 8, containLabel: !0 },
        xAxis: { type: "value", max: 100, axisLabel: { color: s.axis, formatter: "{value}%" }, splitLine: { lineStyle: { color: s.grid } } },
        yAxis: { type: "category", data: a.map((r) => r.flowType.length > 14 ? `${r.flowType.slice(0, 13)}…` : r.flowType), axisLabel: { color: s.axis, fontSize: 11 }, axisLine: { lineStyle: { color: s.grid } } },
        series: [{
          type: "bar",
          barMaxWidth: 16,
          data: a.map((r) => ({ value: Math.round(r.complianceRate * 1e3) / 10, itemStyle: { color: r.complianceRate < R.value ? s.bad : s.brand, borderRadius: 3 } })),
          label: { show: !0, position: "right", formatter: "{c}%", color: s.axis, fontSize: 11 },
          markLine: { silent: !0, symbol: "none", lineStyle: { color: s.warn, type: "dashed" }, label: { show: !1 }, data: [{ xAxis: Math.round(R.value * 1e3) / 10 }] }
        }]
      };
    });
    return (s, a) => (e.openBlock(), e.createElementBlock("div", Ba, [
      $.value ? (e.openBlock(), e.createElementBlock("p", Ca, [
        a[6] || (a[6] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString($.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      y.value && !y.value.snapshot ? (e.openBlock(), e.createElementBlock(
        "p",
        Ta,
        e.toDisplayString(s.$t("还没有周期快照。在「通报」页走到第 3 步「计算」，每算一个周期就会存一份，看板从这里取数。")),
        1
        /* TEXT */
      )) : y.value && y.value.snapshot ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createElementVNode("div", La, [
            e.createElementVNode("label", Aa, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(s.$t("周期")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": a[0] || (a[0] = (r) => g.snapshotId = r),
                  "data-test": "fs-board-period"
                },
                [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(U.value, (r) => (e.openBlock(), e.createElementBlock("option", {
                      key: r.id,
                      value: r.id
                    }, e.toDisplayString(e.unref($e)(r.kind)) + " · " + e.toDisplayString(r.label), 9, Fa))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, g.snapshotId]
              ])
            ]),
            e.createElementVNode("label", Oa, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(s.$t("系统")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": a[1] || (a[1] = (r) => g.system = r),
                  "data-test": "fs-board-system"
                },
                [
                  e.createElementVNode(
                    "option",
                    Ma,
                    e.toDisplayString(s.$t("全部")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.options.systems, (r) => (e.openBlock(), e.createElementBlock("option", {
                      key: r,
                      value: r
                    }, e.toDisplayString(r), 9, Ra))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, g.system]
              ])
            ]),
            e.createElementVNode("label", Ka, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(s.$t("大类")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": a[2] || (a[2] = (r) => g.category = r)
                },
                [
                  e.createElementVNode(
                    "option",
                    Wa,
                    e.toDisplayString(s.$t("全部")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.options.categories, (r) => (e.openBlock(), e.createElementBlock("option", {
                      key: r,
                      value: r
                    }, e.toDisplayString(r), 9, Ua))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, g.category]
              ])
            ]),
            e.createElementVNode("label", za, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(s.$t("细类")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": a[3] || (a[3] = (r) => g.flowType = r)
                },
                [
                  e.createElementVNode(
                    "option",
                    Ia,
                    e.toDisplayString(s.$t("全部")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.options.flowTypes, (r) => (e.openBlock(), e.createElementBlock("option", {
                      key: r,
                      value: r
                    }, e.toDisplayString(r), 9, Pa))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, g.flowType]
              ])
            ]),
            e.createElementVNode("label", ja, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(s.$t("部门")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": a[4] || (a[4] = (r) => g.dept = r)
                },
                [
                  e.createElementVNode(
                    "option",
                    qa,
                    e.toDisplayString(s.$t("全部")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.options.depts, (r) => (e.openBlock(), e.createElementBlock("option", {
                      key: r,
                      value: r
                    }, e.toDisplayString(r), 9, Ya))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, g.dept]
              ])
            ]),
            V.value ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-link",
                onClick: A
              },
              e.toDisplayString(s.$t("清除筛选")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            E.value ? (e.openBlock(), e.createElementBlock("i", Ha)) : e.createCommentVNode("v-if", !0),
            a[7] || (a[7] = e.createElementVNode(
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
                onClick: d
              },
              e.toDisplayString(s.$t("删除这个周期的快照")),
              1
              /* TEXT */
            )
          ]),
          y.value.overall ? (e.openBlock(), e.createElementBlock("div", Ga, [
            e.createElementVNode("div", Ja, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(s.$t("办结数")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(y.value.overall.doneCount),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Xa, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(s.$t("平均用时（天）")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(e.unref(j)(y.value.overall.avgDays)),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Qa, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(s.$t("流程时效合规率")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(e.unref(G)(y.value.overall.complianceRate)),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Za, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(s.$t("在途数")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(y.value.overall.runningCount),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", xa, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(s.$t("已逾期")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                {
                  class: e.normalizeClass({ bad: y.value.overall.runningOverdue > 0 })
                },
                e.toDisplayString(y.value.overall.runningOverdue),
                3
                /* TEXT, CLASS */
              )
            ]),
            e.createElementVNode("div", er, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(s.$t("较大逾期风险")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(y.value.overall.runningRisk),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", tr, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(s.$t("个人审核合规率")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(e.unref(G)(y.value.overall.reviewRate)),
                1
                /* TEXT */
              )
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", lr, [
            e.createElementVNode("section", nr, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(s.$t("合规率与平均用时趋势")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", sr, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(k, (r) => e.createElementVNode("button", {
                      key: r,
                      type: "button",
                      class: e.normalizeClass({ on: C.value === r }),
                      onClick: (m) => C.value = r
                    }, e.toDisplayString(e.unref($e)(r)), 11, or)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ]),
              _.value.length < 2 ? (e.openBlock(), e.createElementBlock(
                "p",
                ar,
                e.toDisplayString(s.$t("存了两个以上的{p0}周期后显示趋势", { p0: e.unref($e)(C.value) })),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createBlock(e.unref(vt), {
                key: 1,
                class: "fs-chart",
                option: se.value,
                autoresize: ""
              }, null, 8, ["option"])),
              e.createElementVNode(
                "p",
                rr,
                e.toDisplayString(s.$t("趋势用的是各周期保存时的整体数字，不随上面的筛选变化")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("section", ir, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(s.$t("各流程细类合规率")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  dr,
                  e.toDisplayString(s.$t("办结数最多的前 {n} 类", { n: T.value.length })),
                  1
                  /* TEXT */
                )
              ]),
              T.value.length ? (e.openBlock(), e.createBlock(e.unref(vt), {
                key: 1,
                class: "fs-chart",
                option: c.value,
                autoresize: ""
              }, null, 8, ["option"])) : (e.openBlock(), e.createElementBlock(
                "p",
                cr,
                e.toDisplayString(s.$t("这个筛选条件下没有办结的流程")),
                1
                /* TEXT */
              ))
            ])
          ]),
          e.createElementVNode("section", ur, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(s.$t("按细类")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", mr, [
              e.createElementVNode("table", pr, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("大类")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("流程细类")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("系统")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      yr,
                      e.toDisplayString(s.$t("办结")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      gr,
                      e.toDisplayString(s.$t("平均用时（天）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      vr,
                      e.toDisplayString(s.$t("时效要求")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Nr,
                      e.toDisplayString(s.$t("合规率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Er,
                      e.toDisplayString(s.$t("在途")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Vr,
                      e.toDisplayString(s.$t("在途逾期")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.byType, (r) => (e.openBlock(), e.createElementBlock("tr", {
                      key: r.category + r.flowType + r.system,
                      class: e.normalizeClass(["fs-click", { bad: r.complianceRate !== null && r.complianceRate < R.value }]),
                      onClick: (m) => Y(r)
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.category),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.flowType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.system),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        kr,
                        e.toDisplayString(r.doneCount),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        fr,
                        e.toDisplayString(e.unref(j)(r.avgDays)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Dr,
                        e.toDisplayString(r.limitDays ?? "-"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Sr,
                        e.toDisplayString(e.unref(G)(r.complianceRate)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        $r,
                        e.toDisplayString(r.runningCount),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        br,
                        e.toDisplayString(r.runningOverdue),
                        1
                        /* TEXT */
                      )
                    ], 10, hr))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode(
              "p",
              _r,
              e.toDisplayString(s.$t("点一行只看这一类的流程明细")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("section", wr, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(s.$t("个人审核合规率排名")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                Br,
                e.toDisplayString(s.$t("{n} 人", { n: y.value.reviewerRank.length })),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Cr, [
              e.createElementVNode("table", Tr, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      Lr,
                      e.toDisplayString(s.$t("排名")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("姓名")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("部门")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("身份")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Ar,
                      e.toDisplayString(s.$t("审核次数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Fr,
                      e.toDisplayString(s.$t("合规")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Or,
                      e.toDisplayString(s.$t("合规率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Mr,
                      e.toDisplayString(s.$t("平均用时")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.reviewerRank, (r) => (e.openBlock(), e.createElementBlock("tr", {
                      key: r.name
                    }, [
                      e.createElementVNode(
                        "td",
                        Rr,
                        e.toDisplayString(r.rank),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.name),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.dept),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.identity),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Kr,
                        e.toDisplayString(r.count),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Wr,
                        e.toDisplayString(r.compliant),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Ur,
                        e.toDisplayString(e.unref(G)(r.rate)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        zr,
                        e.toDisplayString(e.unref(j)(r.avgDays)),
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
          ]),
          e.createElementVNode("section", Ir, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(s.$t("流程明细")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                Pr,
                e.toDisplayString(y.value.flowTotal > y.value.flows.length ? s.$t("共 {a} 单，这里列前 {b} 单；全部明细在「通报」第 3 步导出", { a: y.value.flowTotal, b: y.value.flows.length }) : s.$t("共 {a} 单", { a: y.value.flowTotal })),
                1
                /* TEXT */
              ),
              e.createElementVNode("label", jr, [
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": a[5] || (a[5] = (r) => b.value = r),
                    type: "checkbox"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelCheckbox, b.value]
                ]),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(s.$t("只看超时和逾期")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("div", qr, [
              e.createElementVNode("table", Yr, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("系统")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("单号")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("流程细类")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("发起人")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("部门")),
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
                      Hr,
                      e.toDisplayString(s.$t("用时（天）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Gr,
                      e.toDisplayString(s.$t("时效要求")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Jr,
                      e.toDisplayString(s.$t("超出（天）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("当前节点")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("当前处理人")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("开始")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(s.$t("结束")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(O.value, (r) => (e.openBlock(), e.createElementBlock("tr", {
                      key: r.system + r.flowNo
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.system),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.flowNo),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.flowType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.initiator),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.dept),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", e.unref(St)(r)])
                          },
                          e.toDisplayString(e.unref(Dt)(r)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        Xr,
                        e.toDisplayString(e.unref(j)(r.days)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Qr,
                        e.toDisplayString(r.limitDays ?? "-"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Zr,
                        e.toDisplayString(r.overdueDays ? e.unref(j)(r.overdueDays) : "-"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.currentNode),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(r.currentHandler),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(Ke)(r.startAt)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(Ke)(r.endAt)),
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
        ],
        64
        /* STABLE_FRAGMENT */
      )) : $.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", xr, [
        a[8] || (a[8] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(s.$t("正在加载看板…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), ti = /* @__PURE__ */ Ee(ei, [["__scopeId", "data-v-17f8aa45"]]), Ze = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useDialog.ts"];
if (!Ze) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useDialog.ts");
Ze.default;
const li = { class: "fs-track" }, ni = { class: "ss-kpis" }, si = { class: "ss-kpi" }, oi = { "data-test": "fs-track-open" }, ai = { class: "ss-kpi" }, ri = { class: "ss-kpi" }, ii = { class: "ss-kpi" }, di = { class: "ss-kpi" }, ci = { class: "ss-note info" }, ui = {
  key: 0,
  class: "ss-note danger"
}, mi = { class: "ss-actions" }, pi = { class: "fs-seg" }, yi = ["data-test", "onClick"], gi = { class: "ss-field inline" }, vi = ["placeholder"], Ni = ["disabled"], Ei = {
  key: 1,
  class: "ss-empty"
}, Vi = ["data-test"], hi = { class: "ss-chip" }, ki = {
  key: 0,
  class: "ss-muted"
}, fi = {
  key: 1,
  class: "ss-chip ok"
}, Di = {
  key: 2,
  class: "ss-chip bad"
}, Si = {
  key: 3,
  class: "ss-chip"
}, $i = { class: "fs-facts" }, bi = { class: "bad" }, _i = { key: 0 }, wi = { class: "fs-notes" }, Bi = { key: 0 }, Ci = ["onClick"], Ti = { class: "ss-actions" }, Li = ["onUpdate:modelValue", "placeholder", "data-test", "onKeydown"], Ai = ["disabled", "data-test", "onClick"], Fi = ["disabled", "onClick"], Oi = ["disabled", "onClick"], Mi = {
  key: 0,
  class: "fs-mailbox"
}, Ri = { class: "ss-field" }, Ki = ["placeholder"], Wi = { class: "ss-field" }, Ui = { class: "ss-field" }, zi = { class: "ss-actions" }, Ii = ["disabled", "onClick"], Pi = {
  key: 2,
  class: "fs-card"
}, ji = { class: "fs-notes" }, qi = /* @__PURE__ */ e.defineComponent({
  __name: "TrackTab",
  setup(u) {
    const k = [{ key: "open", title: o.t("跟进中") }, { key: "due", title: o.t("今天该跟进") }, { key: "closed", title: o.t("已闭环") }], y = be.useNotificationStore(), E = Ze.useDialog(), $ = e.ref("open"), g = e.ref(""), C = e.ref(!1), b = e.ref(""), U = e.ref(""), R = e.reactive({}), V = e.ref(null), B = e.computed(() => J.value?.thresholds), F = e.computed(() => J.value?.tracking ?? []), I = e.computed(() => J.value?.reminders ?? []), f = e.computed(() => F.value.filter((m) => !m.closedAt)), A = e.computed(() => F.value.filter((m) => !!m.closedAt)), Y = (m) => !m.closedAt && !!m.nextFollowAt && Date.parse(m.nextFollowAt) <= Date.now(), d = (m) => m.intervalDays === (B.value?.externalDays ?? 7) && m.intervalDays !== (B.value?.internalDays ?? 3), O = e.computed(() => f.value.filter(Y)), _ = e.computed(() => {
      const m = $.value === "closed" ? A.value : $.value === "due" ? O.value : f.value, S = g.value.trim().toLowerCase();
      return (S ? m.filter((v) => [v.flowNo, v.flowName, v.flowType, v.title, v.handler, v.initiator].some((K) => String(K || "").toLowerCase().includes(S))) : m).slice(0, 200);
    }), T = (m) => U.value === m.key ? m.notes : m.notes.slice(-4);
    async function z(m) {
      C.value = !0, b.value = "";
      try {
        await m(), await ne();
      } catch (S) {
        b.value = q.errorMessage(S);
      } finally {
        C.value = !1;
      }
    }
    async function X(m) {
      const S = (R[m.key] || "").trim();
      S && await z(async () => {
        await D("track.note", { key: m.key, text: S }), R[m.key] = "";
      });
    }
    async function se(m) {
      await z(async () => {
        const S = await D("track.mailPreview", { key: m.key });
        V.value = { key: m.key, ...S };
      });
    }
    async function c(m) {
      const S = V.value;
      !S || !window.confirm(o.t("给 {p0} 发送进度提醒邮件？", { p0: S.to })) || await z(async () => {
        S.to.trim() !== m.handlerEmail && await D("track.setEmail", { key: m.key, email: S.to.trim() });
        const v = await D("track.remind", { key: m.key, subject: S.subject, body: S.body });
        V.value = null, y.success(v.via === "official" ? o.t("提醒已发送（经官方代发）") : o.t("提醒已发送"));
      });
    }
    async function s(m) {
      const S = await E.prompt(o.t("闭环原因（如：已线下办结）"), "");
      S !== null && await z(async () => {
        await D("track.close", { key: m.key, reason: S });
      });
    }
    async function a() {
      await z(async () => {
        const m = await D("reminders.check");
        y.info(m ? o.t("发出了 {n} 条提醒", { n: m }) : o.t("现在没有新的到期提醒"));
      });
    }
    async function r() {
      await z(async () => {
        await D("reminders.clear");
      });
    }
    return (m, S) => (e.openBlock(), e.createElementBlock("div", li, [
      e.createElementVNode("div", ni, [
        e.createElementVNode("div", si, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(m.$t("跟进中")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            oi,
            e.toDisplayString(f.value.length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ai, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(m.$t("今天该跟进")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            {
              class: e.normalizeClass({ bad: O.value.length > 0 }),
              "data-test": "fs-track-due"
            },
            e.toDisplayString(O.value.length),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode("div", ri, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(m.$t("内部流程（每 {n} 天）", { n: B.value?.internalDays ?? 3 })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(f.value.filter((v) => !d(v)).length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ii, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(m.$t("外部流程（每 {n} 天）", { n: B.value?.externalDays ?? 7 })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(f.value.filter(d).length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", di, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(m.$t("已闭环")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(A.value.length),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("p", ci, [
        S[5] || (S[5] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(m.$t("名单来自「通报」第 3 步的计算：在途且已逾期的流程进名单；以后导入的报表显示它已办结或终止，就自动闭环。到了跟进日，应用会在这里和系统通知里提醒你。")),
          1
          /* TEXT */
        )
      ]),
      b.value ? (e.openBlock(), e.createElementBlock("p", ui, [
        S[6] || (S[6] = e.createElementVNode(
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
      e.createElementVNode("div", mi, [
        e.createElementVNode("div", pi, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(k, (v) => e.createElementVNode("button", {
              key: v.key,
              type: "button",
              class: e.normalizeClass({ on: $.value === v.key }),
              "data-test": `fs-track-view-${v.key}`,
              onClick: (K) => $.value = v.key
            }, e.toDisplayString(v.title), 11, yi)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        e.createElementVNode("label", gi, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(m.$t("搜索")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": S[0] || (S[0] = (v) => g.value = v),
            type: "text",
            placeholder: m.$t("单号、流程名、处理人")
          }, null, 8, vi), [
            [e.vModelText, g.value]
          ])
        ]),
        S[8] || (S[8] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: C.value,
          onClick: a
        }, [
          S[7] || (S[7] = e.createElementVNode(
            "i",
            { class: "ri-notification-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(m.$t("现在检查一次提醒")),
            1
            /* TEXT */
          )
        ], 8, Ni)
      ]),
      _.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
        "p",
        Ei,
        e.toDisplayString($.value === "closed" ? m.$t("还没有闭环的记录") : $.value === "due" ? m.$t("今天没有到跟进日的流程") : m.$t("没有需要跟进的在途流程")),
        1
        /* TEXT */
      )),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(_.value, (v) => (e.openBlock(), e.createElementBlock("article", {
          key: v.key + v.firstSeenAt,
          class: e.normalizeClass(["fs-item", { due: Y(v), closed: !!v.closedAt }]),
          "data-test": `fs-track-${v.flowNo}`
        }, [
          e.createElementVNode("header", null, [
            e.createElementVNode(
              "span",
              hi,
              e.toDisplayString(v.system),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(v.flowNo),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(v.flowType),
              1
              /* TEXT */
            ),
            v.title ? (e.openBlock(), e.createElementBlock(
              "span",
              ki,
              e.toDisplayString(v.title),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", d(v) ? "brand" : ""])
              },
              e.toDisplayString(d(v) ? m.$t("外部流转 · 每 {n} 天", { n: v.intervalDays }) : m.$t("内部 · 每 {n} 天", { n: v.intervalDays })),
              3
              /* TEXT, CLASS */
            ),
            v.closedAt ? (e.openBlock(), e.createElementBlock(
              "span",
              fi,
              e.toDisplayString(m.$t("已闭环 {p0}", { p0: e.unref(q.fmtDateTime)(v.closedAt) })),
              1
              /* TEXT */
            )) : Y(v) ? (e.openBlock(), e.createElementBlock(
              "span",
              Di,
              e.toDisplayString(m.$t("该跟进了")),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              "span",
              Si,
              e.toDisplayString(m.$t("下次跟进 {p0}", { p0: e.unref(q.fmtDateTime)(v.nextFollowAt) })),
              1
              /* TEXT */
            ))
          ]),
          e.createElementVNode("p", $i, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("在途 {p0} 天", { p0: e.unref(j)(v.days) })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("时效要求 {p0} 天", { p0: v.limitDays ?? "-" })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              bi,
              e.toDisplayString(m.$t("超出 {p0} 天", { p0: e.unref(j)(v.overdueDays) })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("当前节点：{p0}", { p0: v.currentNode || "-" })),
              1
              /* TEXT */
            ),
            v.currentNodeDays != null ? (e.openBlock(), e.createElementBlock(
              "span",
              _i,
              e.toDisplayString(m.$t("节点停留 {p0} 天", { p0: e.unref(j)(v.currentNodeDays) })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("处理人：{p0}", { p0: v.handler || "-" })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(m.$t("发起人：{p0}", { p0: v.initiator || "-" })),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("ul", wi, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(T(v), (K, de) => (e.openBlock(), e.createElementBlock(
                "li",
                {
                  key: de,
                  class: e.normalizeClass(K.kind)
                },
                [
                  e.createElementVNode(
                    "time",
                    null,
                    e.toDisplayString(e.unref(q.fmtDateTime)(K.at)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(K.kind === "mail" ? "ri-mail-send-line" : K.kind === "note" ? "ri-chat-1-line" : "ri-robot-2-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(K.text),
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
            v.notes.length > 4 && U.value !== v.key ? (e.openBlock(), e.createElementBlock("li", Bi, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-link",
                onClick: (K) => U.value = v.key
              }, e.toDisplayString(m.$t("看全部 {n} 条记录", { n: v.notes.length })), 9, Ci)
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          v.closedAt ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createElementVNode("div", Ti, [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": (K) => R[v.key] = K,
                  type: "text",
                  class: "fs-note-input",
                  placeholder: m.$t("记一条处理进度（记完自动顺延下次跟进时间）"),
                  "data-test": `fs-note-${v.flowNo}`,
                  onKeydown: e.withKeys(e.withModifiers((K) => X(v), ["prevent"]), ["enter"])
                }, null, 40, Li), [
                  [e.vModelText, R[v.key]]
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: C.value || !(R[v.key] || "").trim(),
                  "data-test": `fs-note-save-${v.flowNo}`,
                  onClick: (K) => X(v)
                }, [
                  S[9] || (S[9] = e.createElementVNode(
                    "i",
                    { class: "ri-add-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(m.$t("记进展")),
                    1
                    /* TEXT */
                  )
                ], 8, Ai),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: C.value,
                  onClick: (K) => se(v)
                }, [
                  S[10] || (S[10] = e.createElementVNode(
                    "i",
                    { class: "ri-mail-send-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(m.$t("发送提醒")),
                    1
                    /* TEXT */
                  )
                ], 8, Fi),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm ghost",
                  disabled: C.value,
                  onClick: (K) => s(v)
                }, [
                  S[11] || (S[11] = e.createElementVNode(
                    "i",
                    { class: "ri-check-double-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(m.$t("手工闭环")),
                    1
                    /* TEXT */
                  )
                ], 8, Oi)
              ]),
              V.value && V.value.key === v.key ? (e.openBlock(), e.createElementBlock("div", Mi, [
                e.createElementVNode("label", Ri, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(m.$t("收件人（处理人邮箱）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": S[1] || (S[1] = (K) => V.value.to = K),
                    type: "text",
                    placeholder: m.$t("花名册里没有邮箱，在这里填")
                  }, null, 8, Ki), [
                    [e.vModelText, V.value.to]
                  ])
                ]),
                e.createElementVNode("label", Wi, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(m.$t("主题")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": S[2] || (S[2] = (K) => V.value.subject = K),
                      type: "text"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, V.value.subject]
                  ])
                ]),
                e.createElementVNode("label", Ui, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(m.$t("正文")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": S[3] || (S[3] = (K) => V.value.body = K),
                      rows: "6"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, V.value.body]
                  ])
                ]),
                e.createElementVNode("div", zi, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary sm",
                    disabled: C.value || !V.value.to.trim(),
                    "data-test": "fs-track-send",
                    onClick: (K) => c(v)
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(C.value ? "ri-loader-4-line spin" : "ri-mail-send-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(m.$t("确认发送")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ii),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: S[4] || (S[4] = (K) => V.value = null)
                    },
                    e.toDisplayString(m.$t("取消")),
                    1
                    /* TEXT */
                  )
                ])
              ])) : e.createCommentVNode("v-if", !0)
            ],
            64
            /* STABLE_FRAGMENT */
          ))
        ], 10, Vi))),
        128
        /* KEYED_FRAGMENT */
      )),
      I.value.length ? (e.openBlock(), e.createElementBlock("section", Pi, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(m.$t("最近的提醒")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: r
            },
            e.toDisplayString(m.$t("清空")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("ul", ji, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(I.value.slice(0, 12), (v) => (e.openBlock(), e.createElementBlock("li", {
              key: v.id
            }, [
              e.createElementVNode(
                "time",
                null,
                e.toDisplayString(e.unref(q.fmtDateTime)(v.at)),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(v.type === "follow_up" ? "ri-route-line" : "ri-book-2-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createElementVNode("span", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(v.title),
                  1
                  /* TEXT */
                ),
                S[12] || (S[12] = e.createElementVNode(
                  "br",
                  null,
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(v.body),
                  1
                  /* TEXT */
                )
              ])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Yi = /* @__PURE__ */ Ee(qi, [["__scopeId", "data-v-e7a13b34"]]), Hi = { class: "fs-ledger" }, Gi = { class: "ss-kpis" }, Ji = ["data-test"], Xi = { class: "ss-kpi" }, Qi = { class: "ss-note info" }, Zi = {
  key: 0,
  class: "ss-note danger"
}, xi = { class: "ss-actions" }, ed = { class: "fs-seg" }, td = ["data-test", "onClick"], ld = ["disabled"], nd = ["disabled"], sd = {
  key: 1,
  class: "ss-file-out"
}, od = { class: "ss-field" }, ad = { class: "ss-grid" }, rd = { class: "ss-field" }, id = { class: "ss-field" }, dd = { class: "ss-field" }, cd = { class: "ss-field" }, ud = { class: "ss-field" }, md = { class: "ss-actions" }, pd = ["disabled"], yd = {
  key: 3,
  class: "ss-empty"
}, gd = {
  key: 0,
  class: "ss-chip bad"
}, vd = { class: "fs-facts" }, Nd = {
  key: 0,
  class: "fs-line"
}, Ed = {
  key: 1,
  class: "fs-line"
}, Vd = {
  key: 2,
  class: "fs-notes"
}, hd = { key: 0 }, kd = ["onClick"], fd = { class: "ss-actions" }, Dd = ["onUpdate:modelValue", "placeholder", "onKeydown"], Sd = ["disabled", "onClick"], $d = ["disabled", "onClick"], bd = ["disabled", "onClick"], _d = ["disabled", "onClick"], wd = ["disabled", "onClick"], Bd = ["disabled", "onClick"], Cd = /* @__PURE__ */ e.defineComponent({
  __name: "LedgerTab",
  setup(u, { expose: k }) {
    const y = ["doing", "overdue", "done", "archived"], E = e.ref(!1), $ = e.ref(""), g = e.ref(""), C = e.ref(""), b = e.ref(null), U = e.ref(""), R = e.reactive({}), V = e.computed(() => J.value?.ledger ?? []), B = e.computed(() => J.value?.thresholds.improveRemindDays ?? 7), F = e.computed(() => Object.fromEntries(y.map((c) => [c, V.value.filter((s) => s.status === c).length]))), I = e.computed(() => V.value.filter((c) => c.status === "doing" && (() => {
      const s = Ye(c.deadline);
      return s !== null && s >= 0 && s <= B.value;
    })())), f = e.computed(() => {
      const c = { overdue: 0, doing: 1, done: 2, archived: 3 };
      return V.value.filter((s) => !C.value || s.status === C.value).slice().sort((s, a) => c[s.status] - c[a.status] || (s.deadline || "9999").localeCompare(a.deadline || "9999"));
    });
    function A(c) {
      const s = Ye(c.deadline);
      return s === null || c.status === "done" || c.status === "archived" ? c.deadline : s < 0 ? o.t("已过期 {n} 天", { n: -s }) : s === 0 ? o.t("今天到期") : o.t("还有 {n} 天", { n: s });
    }
    function Y(c) {
      const s = Ye(c.deadline);
      return s === null || c.status === "done" || c.status === "archived" ? "" : s < 0 ? "bad" : s <= B.value ? "warn" : "";
    }
    async function d(c) {
      E.value = !0, $.value = "";
      try {
        return await c(), await ne(), !0;
      } catch (s) {
        return $.value = q.errorMessage(s), !1;
      } finally {
        E.value = !1;
      }
    }
    function O(c) {
      b.value = c ? { id: c.id, item: c.item, dept: c.dept, owner: c.owner, requirement: c.requirement, deadline: c.deadline, acceptance: c.acceptance } : { id: "", item: "", dept: "", owner: "", requirement: "", deadline: "", acceptance: "" };
    }
    async function _() {
      const c = b.value;
      c && await d(async () => {
        await D("ledger.save", { item: c.id ? c : { ...c, id: void 0 } });
      }) && (b.value = null);
    }
    async function T(c, s) {
      await d(async () => {
        await D("ledger.save", { item: { id: c.id, item: c.item, status: s } });
      });
    }
    async function z(c) {
      const s = (R[c.id] || "").trim();
      s && await d(async () => {
        await D("ledger.progress", { id: c.id, text: s }), R[c.id] = "";
      });
    }
    async function X(c) {
      window.confirm(o.t("删除「{p0}」？进展记录也会一起删掉。", { p0: c.item })) && await d(async () => {
        await D("ledger.remove", { id: c.id });
      });
    }
    async function se() {
      await d(async () => {
        g.value = await D("ledger.export");
      });
    }
    return k({ startEdit: O, save: _, editing: b }), (c, s) => (e.openBlock(), e.createElementBlock("div", Hi, [
      e.createElementVNode("div", Gi, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(y, (a) => e.createElementVNode("div", {
            key: a,
            class: "ss-kpi"
          }, [
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(e.unref(qe)(a)),
              1
              /* TEXT */
            ),
            e.createElementVNode("strong", {
              class: e.normalizeClass({ bad: a === "overdue" && F.value[a] > 0 }),
              "data-test": `fs-ledger-count-${a}`
            }, e.toDisplayString(F.value[a]), 11, Ji)
          ])),
          64
          /* STABLE_FRAGMENT */
        )),
        e.createElementVNode("div", Xi, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(c.$t("{n} 天内到期", { n: B.value })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            {
              class: e.normalizeClass({ warn: I.value.length > 0 })
            },
            e.toDisplayString(I.value.length),
            3
            /* TEXT, CLASS */
          )
        ])
      ]),
      e.createElementVNode("p", Qi, [
        s[11] || (s[11] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(c.$t("月度通报发出后，改善建议会自动记到这里。执行期限前 {n} 天应用会提醒你与责任人确认执行情况；过了期限还没完成的标为逾期并升级督办；完成后可以归档。", { n: B.value })),
          1
          /* TEXT */
        )
      ]),
      $.value ? (e.openBlock(), e.createElementBlock("p", Zi, [
        s[12] || (s[12] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString($.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", xi, [
        e.createElementVNode("div", ed, [
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: e.normalizeClass({ on: C.value === "" }),
              onClick: s[0] || (s[0] = (a) => C.value = "")
            },
            e.toDisplayString(c.$t("全部")),
            3
            /* TEXT, CLASS */
          ),
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(y, (a) => e.createElementVNode("button", {
              key: a,
              type: "button",
              class: e.normalizeClass({ on: C.value === a }),
              "data-test": `fs-ledger-filter-${a}`,
              onClick: (r) => C.value = a
            }, e.toDisplayString(e.unref(qe)(a)), 11, td)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        s[15] || (s[15] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: E.value,
          "data-test": "fs-ledger-add",
          onClick: s[1] || (s[1] = (a) => O(null))
        }, [
          s[13] || (s[13] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(c.$t("登记改善事项")),
            1
            /* TEXT */
          )
        ], 8, ld),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn",
          disabled: E.value || !V.value.length,
          "data-test": "fs-ledger-export",
          onClick: se
        }, [
          s[14] || (s[14] = e.createElementVNode(
            "i",
            { class: "ri-file-excel-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(c.$t("导出台账")),
            1
            /* TEXT */
          )
        ], 8, nd)
      ]),
      g.value ? (e.openBlock(), e.createElementBlock("p", sd, [
        s[16] || (s[16] = e.createElementVNode(
          "i",
          { class: "ri-file-excel-2-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "code",
          null,
          e.toDisplayString(g.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: s[2] || (s[2] = (a) => e.unref(ie)(g.value))
          },
          e.toDisplayString(c.$t("打开")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: s[3] || (s[3] = (a) => e.unref(ie)(g.value, !0))
          },
          e.toDisplayString(c.$t("所在文件夹")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      b.value ? (e.openBlock(), e.createElementBlock(
        "form",
        {
          key: 2,
          class: "fs-form",
          onSubmit: e.withModifiers(_, ["prevent"])
        },
        [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(b.value.id ? c.$t("修改改善事项") : c.$t("登记改善事项")),
            1
            /* TEXT */
          ),
          e.createElementVNode("label", od, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(c.$t("改善事项")) + " *",
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": s[4] || (s[4] = (a) => b.value.item = a),
                type: "text",
                "data-test": "fs-ledger-item"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, b.value.item]
            ])
          ]),
          e.createElementVNode("div", ad, [
            e.createElementVNode("label", rd, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("责任部门")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": s[5] || (s[5] = (a) => b.value.dept = a),
                  type: "text",
                  "data-test": "fs-ledger-dept"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, b.value.dept]
              ])
            ]),
            e.createElementVNode("label", id, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("责任人")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": s[6] || (s[6] = (a) => b.value.owner = a),
                  type: "text",
                  "data-test": "fs-ledger-owner"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, b.value.owner]
              ])
            ]),
            e.createElementVNode("label", dd, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("执行期限")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": s[7] || (s[7] = (a) => b.value.deadline = a),
                  type: "date",
                  "data-test": "fs-ledger-deadline"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, b.value.deadline]
              ])
            ])
          ]),
          e.createElementVNode("label", cd, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(c.$t("执行要求")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": s[8] || (s[8] = (a) => b.value.requirement = a),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, b.value.requirement]
            ])
          ]),
          e.createElementVNode("label", ud, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(c.$t("验收要求")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": s[9] || (s[9] = (a) => b.value.acceptance = a),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, b.value.acceptance]
            ])
          ]),
          e.createElementVNode("div", md, [
            e.createElementVNode("button", {
              type: "submit",
              class: "ss-btn primary",
              disabled: E.value || !b.value.item.trim(),
              "data-test": "fs-ledger-save"
            }, [
              s[17] || (s[17] = e.createElementVNode(
                "i",
                { class: "ri-save-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(c.$t("保存")),
                1
                /* TEXT */
              )
            ], 8, pd),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-link",
                onClick: s[10] || (s[10] = (a) => b.value = null)
              },
              e.toDisplayString(c.$t("取消")),
              1
              /* TEXT */
            )
          ])
        ],
        32
        /* NEED_HYDRATION */
      )) : e.createCommentVNode("v-if", !0),
      f.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
        "p",
        yd,
        e.toDisplayString(V.value.length ? c.$t("这个状态下没有事项") : c.$t("台账还是空的。月度通报发出后改善建议会记到这里，也可以手工登记。")),
        1
        /* TEXT */
      )),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(f.value, (a) => (e.openBlock(), e.createElementBlock(
          "article",
          {
            key: a.id,
            class: e.normalizeClass(["fs-item", a.status]),
            "data-test": "fs-ledger-row"
          },
          [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", e.unref(jt)(a.status)])
                },
                e.toDisplayString(e.unref(qe)(a.status)),
                3
                /* TEXT, CLASS */
              ),
              a.escalated && a.status === "overdue" ? (e.openBlock(), e.createElementBlock("span", gd, [
                s[18] || (s[18] = e.createElementVNode(
                  "i",
                  { class: "ri-alarm-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(c.$t("升级督办")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(a.item),
                1
                /* TEXT */
              ),
              s[19] || (s[19] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              a.deadline ? (e.openBlock(), e.createElementBlock(
                "span",
                {
                  key: 1,
                  class: e.normalizeClass(["ss-chip", Y(a)])
                },
                e.toDisplayString(A(a)),
                3
                /* TEXT, CLASS */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("p", vd, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("责任部门：{p0}", { p0: a.dept || "-" })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("责任人：{p0}", { p0: a.owner || "-" })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("执行期限：{p0}", { p0: a.deadline || c.$t("未定") })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("来源：{p0}", { p0: a.source || "-" })),
                1
                /* TEXT */
              )
            ]),
            a.requirement ? (e.openBlock(), e.createElementBlock("p", Nd, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(c.$t("执行要求")),
                1
                /* TEXT */
              ),
              e.createTextVNode(
                e.toDisplayString(a.requirement),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            a.acceptance ? (e.openBlock(), e.createElementBlock("p", Ed, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(c.$t("验收要求")),
                1
                /* TEXT */
              ),
              e.createTextVNode(
                e.toDisplayString(a.acceptance),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            a.progress.length ? (e.openBlock(), e.createElementBlock("ul", Vd, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(U.value === a.id ? a.progress : a.progress.slice(-3), (r, m) => (e.openBlock(), e.createElementBlock("li", { key: m }, [
                  e.createElementVNode(
                    "time",
                    null,
                    e.toDisplayString(e.unref(q.fmtDateTime)(r.at)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(r.text),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              )),
              a.progress.length > 3 && U.value !== a.id ? (e.openBlock(), e.createElementBlock("li", hd, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: (r) => U.value = a.id
                }, e.toDisplayString(c.$t("看全部 {n} 条进展", { n: a.progress.length })), 9, kd)
              ])) : e.createCommentVNode("v-if", !0)
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", fd, [
              a.status !== "archived" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (r) => R[a.id] = r,
                    type: "text",
                    class: "fs-note-input",
                    placeholder: c.$t("记一条执行进展（与责任人确认的情况）"),
                    "data-test": "fs-ledger-progress",
                    onKeydown: e.withKeys(e.withModifiers((r) => z(a), ["prevent"]), ["enter"])
                  }, null, 40, Dd), [
                    [e.vModelText, R[a.id]]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: E.value || !(R[a.id] || "").trim(),
                    "data-test": "fs-ledger-progress-save",
                    onClick: (r) => z(a)
                  }, [
                    s[20] || (s[20] = e.createElementVNode(
                      "i",
                      { class: "ri-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(c.$t("记进展")),
                      1
                      /* TEXT */
                    )
                  ], 8, Sd)
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0),
              a.status === "doing" || a.status === "overdue" ? (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn sm primary",
                disabled: E.value,
                "data-test": "fs-ledger-done",
                onClick: (r) => T(a, "done")
              }, [
                s[21] || (s[21] = e.createElementVNode(
                  "i",
                  { class: "ri-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(c.$t("标为已完成")),
                  1
                  /* TEXT */
                )
              ], 8, $d)) : e.createCommentVNode("v-if", !0),
              a.status === "done" ? (e.openBlock(), e.createElementBlock("button", {
                key: 2,
                type: "button",
                class: "ss-btn sm",
                disabled: E.value,
                "data-test": "fs-ledger-archive",
                onClick: (r) => T(a, "archived")
              }, [
                s[22] || (s[22] = e.createElementVNode(
                  "i",
                  { class: "ri-archive-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(c.$t("归档")),
                  1
                  /* TEXT */
                )
              ], 8, bd)) : e.createCommentVNode("v-if", !0),
              a.status === "done" || a.status === "archived" ? (e.openBlock(), e.createElementBlock("button", {
                key: 3,
                type: "button",
                class: "ss-link",
                disabled: E.value,
                onClick: (r) => T(a, "doing")
              }, e.toDisplayString(c.$t("重新打开")), 9, _d)) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-link",
                disabled: E.value,
                onClick: (r) => O(a)
              }, e.toDisplayString(c.$t("修改")), 9, wd),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-link danger",
                disabled: E.value,
                onClick: (r) => X(a)
              }, e.toDisplayString(c.$t("删除")), 9, Bd)
            ])
          ],
          2
          /* CLASS */
        ))),
        128
        /* KEYED_FRAGMENT */
      ))
    ]));
  }
}), Td = /* @__PURE__ */ Ee(Cd, [["__scopeId", "data-v-e10df1bf"]]), Ld = { class: "fs-rules" }, Ad = {
  key: 0,
  class: "ss-note danger"
}, Fd = {
  key: 1,
  class: "ss-note"
}, Od = { class: "fs-card" }, Md = ["disabled"], Rd = ["disabled"], Kd = { class: "ss-muted" }, Wd = { class: "ss-actions" }, Ud = { class: "fs-seg" }, zd = ["data-test", "onClick"], Id = { class: "ss-field inline" }, Pd = ["placeholder"], jd = { class: "ss-table-wrap fs-scroll" }, qd = {
  key: 0,
  class: "ss-table"
}, Yd = {
  key: 1,
  class: "ss-table"
}, Hd = { class: "num" }, Gd = { class: "num" }, Jd = {
  key: 2,
  class: "ss-table"
}, Xd = {
  key: 3,
  class: "ss-table"
}, Qd = { class: "num" }, Zd = { class: "num" }, xd = {
  key: 4,
  class: "ss-table"
}, ec = { class: "ss-muted" }, tc = { class: "fs-card" }, lc = ["disabled"], nc = { class: "ss-grid" }, sc = { class: "ss-field" }, oc = { class: "ss-field" }, ac = { class: "ss-field" }, rc = { class: "ss-field" }, ic = { class: "ss-field" }, dc = { class: "ss-field" }, cc = { class: "ss-field" }, uc = { class: "ss-actions" }, mc = ["disabled"], pc = {
  key: 0,
  class: "ss-chip ok"
}, yc = { class: "fs-card" }, gc = { class: "ss-muted" }, vc = { class: "fs-cal" }, Nc = { class: "ss-field" }, Ec = { class: "ss-field" }, Vc = { class: "ss-actions" }, hc = ["disabled"], kc = {
  key: 0,
  class: "ss-chip ok"
}, fc = { class: "fs-card" }, Dc = { class: "ss-file-out" }, Sc = { class: "ss-muted" }, ve = 300, $c = /* @__PURE__ */ e.defineComponent({
  __name: "RulesTab",
  setup(u) {
    const k = [
      { key: "e2e", title: o.t("端到端用时") },
      { key: "cssNodes", title: o.t("CSS 各节点") },
      { key: "oaFkNodes", title: o.t("OA / 费控节点内外部") },
      { key: "personal", title: o.t("OA / 费控个人节点") },
      { key: "managers", title: o.t("审核人身份") }
    ], y = J, E = e.ref(null), $ = e.ref(!1), g = e.ref(""), C = e.ref([]), b = e.ref("e2e"), U = e.ref(""), R = e.ref(""), V = e.reactive({ riskPct: 80, avgIncreaseDays: 3, minPct: 95, amountThreshold: 1e5, internalDays: 3, externalDays: 7, improveRemindDays: 7 }), B = e.ref(""), F = e.ref("");
    function I(i) {
      E.value = i, f(i.thresholds), B.value = i.holidays.join(`
`), F.value = i.extraWorkdays.join(`
`);
    }
    function f(i) {
      Object.assign(V, { riskPct: Math.round(i.riskRatio * 1e3) / 10, avgIncreaseDays: i.avgIncreaseDays, minPct: Math.round(i.minComplianceRate * 1e3) / 10, amountThreshold: i.amountThreshold, internalDays: i.internalDays, externalDays: i.externalDays, improveRemindDays: i.improveRemindDays });
    }
    async function A() {
      try {
        I(await D("rules.get")), g.value = "";
      } catch (i) {
        g.value = q.errorMessage(i);
      }
    }
    e.onMounted(A);
    const Y = (...i) => {
      const h = U.value.trim().toLowerCase();
      return !h || i.some((N) => String(N || "").toLowerCase().includes(h));
    }, d = e.computed(() => ({ e2e: E.value?.e2e.length ?? 0, cssNodes: E.value?.cssNodes.length ?? 0, oaFkNodes: E.value?.oaFkNodes.length ?? 0, personal: E.value?.personal.length ?? 0, managers: E.value?.managers.length ?? 0 })), O = e.computed(() => (E.value?.e2e ?? []).filter((i) => Y(i.category, i.flowType, i.system))), _ = e.computed(() => (E.value?.cssNodes ?? []).filter((i) => Y(i.flowType, i.feeType, i.node))), T = e.computed(() => (E.value?.oaFkNodes ?? []).filter((i) => Y(i[0], i[1]))), z = e.computed(() => (E.value?.personal ?? []).filter((i) => Y(i.identity, i.category, i.flowType, i.platform))), X = e.computed(() => (E.value?.managers ?? []).filter((i) => Y(i))), se = e.computed(() => O.value.slice(0, ve)), c = e.computed(() => _.value.slice(0, ve)), s = e.computed(() => T.value.slice(0, ve)), a = e.computed(() => z.value.slice(0, ve)), r = e.computed(() => {
      const i = { e2e: O.value.length, cssNodes: _.value.length, oaFkNodes: T.value.length, personal: z.value.length, managers: X.value.length }[b.value];
      return i > ve ? o.t("符合条件的有 {a} 行，这里列前 {b} 行；用搜索缩小范围", { a: i, b: ve }) : o.t("{a} 行", { a: i });
    });
    async function m(i) {
      $.value = !0, g.value = "", R.value = "";
      try {
        return await i(), await ne(), !0;
      } catch (h) {
        return g.value = q.errorMessage(h), !1;
      } finally {
        $.value = !1;
      }
    }
    async function S() {
      const i = await D("files.pick", { multi: !1 });
      i.length && (C.value = [], await m(async () => {
        const h = await D("rules.import", { path: i[0] });
        C.value = h.warnings, await A();
      }));
    }
    async function v() {
      window.confirm(o.t("恢复成内置的规则表？导入的规则会被丢掉。")) && (C.value = [], await m(async () => {
        await D("rules.reset"), await A();
      }));
    }
    async function K() {
      await m(async () => {
        const h = (H, ee) => {
          if (!(H > 0 && H <= 100)) throw new Error(o.t("{p0}要填 1 到 100 之间的数", { p0: ee }));
          return Math.round(H * 10) / 1e3;
        }, N = {
          riskRatio: h(Number(V.riskPct), o.t("较大逾期风险的比例")),
          minComplianceRate: h(Number(V.minPct), o.t("合规率下限")),
          avgIncreaseDays: Number(V.avgIncreaseDays),
          amountThreshold: Number(V.amountThreshold),
          internalDays: Number(V.internalDays),
          externalDays: Number(V.externalDays),
          improveRemindDays: Number(V.improveRemindDays)
        };
        for (const [H, ee] of Object.entries(N)) if (!Number.isFinite(ee) || ee < 0) throw new Error(o.t("阈值里有没填或填错的数（{p0}）", { p0: H }));
        f(await D("rules.thresholds", { patch: N }));
      }) && (R.value = "th");
    }
    async function de() {
      await m(async () => {
        f(await D("rules.thresholds", { patch: null }));
      });
    }
    const oe = (i) => i.split(/[\s,，;；]+/).map((h) => h.trim()).filter(Boolean);
    async function W() {
      await m(async () => {
        await D("calendar.save", { holidays: oe(B.value), extraWorkdays: oe(F.value) }), await A();
      }) && (R.value = "cal");
    }
    async function _e() {
      const i = await D("dirs.pick");
      i && await Ve(i);
    }
    async function Ve(i) {
      await m(async () => {
        await D("settings.patch", { patch: { outputDir: i } });
      });
    }
    return (i, h) => (e.openBlock(), e.createElementBlock("div", Ld, [
      g.value ? (e.openBlock(), e.createElementBlock("p", Ad, [
        h[11] || (h[11] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(g.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      !E.value && !g.value ? (e.openBlock(), e.createElementBlock("p", Fd, [
        h[12] || (h[12] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.$t("正在加载规则…")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      E.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createElementVNode("section", Od, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(i.$t("时效规则表")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", E.value.custom ? "brand" : ""]),
                  "data-test": "fs-rules-source"
                },
                e.toDisplayString(E.value.custom ? i.$t("导入的：{p0}", { p0: E.value.version }) : i.$t("内置：{p0}", { p0: E.value.version })),
                3
                /* TEXT, CLASS */
              ),
              h[15] || (h[15] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: $.value,
                "data-test": "fs-rules-import",
                onClick: S
              }, [
                h[13] || (h[13] = e.createElementVNode(
                  "i",
                  { class: "ri-upload-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(i.$t("导入更新后的《时效看板指标》")),
                  1
                  /* TEXT */
                )
              ], 8, Md),
              E.value.custom ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn",
                disabled: $.value,
                "data-test": "fs-rules-reset",
                onClick: v
              }, [
                h[14] || (h[14] = e.createElementVNode(
                  "i",
                  { class: "ri-arrow-go-back-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(i.$t("恢复内置规则")),
                  1
                  /* TEXT */
                )
              ], 8, Rd)) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              Kd,
              e.toDisplayString(i.$t("导入时整体替换下面五张表。工作簿里要有这五张工作表：端到端用时、CSS各节点时效要求、oa、费控节点内外部、oa费控个人节点时效要求、审核人身份。导入后「通报」里已经算过的结果要重新计算。")),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(C.value, (N) => (e.openBlock(), e.createElementBlock("p", {
                key: N,
                class: "ss-note warn"
              }, [
                h[16] || (h[16] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(N),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            e.createElementVNode("div", Wd, [
              e.createElementVNode("div", Ud, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(k, (N) => e.createElementVNode("button", {
                    key: N.key,
                    type: "button",
                    class: e.normalizeClass({ on: b.value === N.key }),
                    "data-test": `fs-rules-tab-${N.key}`,
                    onClick: (H) => b.value = N.key
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(N.title),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "em",
                      null,
                      e.toDisplayString(d.value[N.key]),
                      1
                      /* TEXT */
                    )
                  ], 10, zd)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]),
              e.createElementVNode("label", Id, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("搜索")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": h[0] || (h[0] = (N) => U.value = N),
                  type: "text",
                  placeholder: i.$t("流程名、节点、姓名")
                }, null, 8, Pd), [
                  [e.vModelText, U.value]
                ])
              ])
            ]),
            e.createElementVNode("div", jd, [
              b.value === "e2e" ? (e.openBlock(), e.createElementBlock("table", qd, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("大类")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("流程细类")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("所属系统")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("整体时效要求")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(se.value, (N, H) => (e.openBlock(), e.createElementBlock("tr", { key: H }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.category),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.flowType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.system),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.variants?.length ? N.variants.map((ee) => i.$t("标题含「{a}」{b} 天", { a: ee.keyword, b: ee.limitDays })).join("；") : N.limitDays == null ? i.$t("无整体时效要求") : i.$t("{n} 天", { n: N.limitDays })),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : b.value === "cssNodes" ? (e.openBlock(), e.createElementBlock("table", Yd, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("事务类型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("费用类型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("审批节点")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("是否计入端到端")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Hd,
                      e.toDisplayString(i.$t("单节点要求（工作日）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("备注")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(c.value, (N, H) => (e.openBlock(), e.createElementBlock("tr", { key: H }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.flowType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.feeType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.node),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", N.internal ? "brand" : ""])
                          },
                          e.toDisplayString(N.internal ? i.$t("内部（计入）") : i.$t("外部（不计入）")),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        Gd,
                        e.toDisplayString(N.limitWorkdays ?? "-"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.note),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : b.value === "oaFkNodes" ? (e.openBlock(), e.createElementBlock("table", Jd, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("流程名")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("环节名称")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("节点属性")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(s.value, (N, H) => (e.openBlock(), e.createElementBlock("tr", { key: H }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N[0]),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N[1]),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", N[2] ? "brand" : ""])
                          },
                          e.toDisplayString(N[2] ? i.$t("内部") : i.$t("外部")),
                          3
                          /* TEXT, CLASS */
                        )
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : b.value === "personal" ? (e.openBlock(), e.createElementBlock("table", Xd, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("审核人身份")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("大类")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("流程细类")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("平台")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("金额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("重要性")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Qd,
                      e.toDisplayString(i.$t("时效要求（天）")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value, (N, H) => (e.openBlock(), e.createElementBlock("tr", { key: H }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.identity),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.category),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.flowType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.platform),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.amount === "le10w" ? i.$t("金额线以内") : N.amount === "gt10w" ? i.$t("金额线以上") : i.$t("不分金额")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N.importance),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Zd,
                        e.toDisplayString(N.limitDays ?? "-"),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : (e.openBlock(), e.createElementBlock("table", xd, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("姓名")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("身份")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(X.value, (N) => (e.openBlock(), e.createElementBlock("tr", { key: N }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(N),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(i.$t("管理干部")),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]))
            ]),
            e.createElementVNode(
              "p",
              ec,
              e.toDisplayString(b.value === "managers" ? i.$t("名单以外的人按非管理干部算；花名册里「身份」写了管理干部的人也会算作管理干部。") : r.value),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("section", tc, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(i.$t("判定阈值")),
                1
                /* TEXT */
              ),
              h[17] || (h[17] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-link",
                disabled: $.value,
                onClick: de
              }, e.toDisplayString(i.$t("恢复默认")), 9, lc)
            ]),
            e.createElementVNode("div", nc, [
              e.createElementVNode("label", sc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("较大逾期风险：在途时长超过时效要求的（%）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[1] || (h[1] = (N) => V.riskPct = N),
                    type: "number",
                    min: "1",
                    max: "100",
                    step: "1",
                    "data-test": "fs-th-risk"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    V.riskPct,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", oc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("异常：平均用时环比增加超过（天）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[2] || (h[2] = (N) => V.avgIncreaseDays = N),
                    type: "number",
                    min: "0",
                    step: "0.5"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    V.avgIncreaseDays,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", ac, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("异常：时效合规率低于（%）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[3] || (h[3] = (N) => V.minPct = N),
                    type: "number",
                    min: "0",
                    max: "100",
                    step: "1",
                    "data-test": "fs-th-min"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    V.minPct,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", rc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("金额线（元，管理干部审核时效按它分两档）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[4] || (h[4] = (N) => V.amountThreshold = N),
                    type: "number",
                    min: "0",
                    step: "10000"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    V.amountThreshold,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", ic, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("内部流程在途跟进间隔（天）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[5] || (h[5] = (N) => V.internalDays = N),
                    type: "number",
                    min: "1",
                    step: "1"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    V.internalDays,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", dc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("外部流程在途跟进间隔（天）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[6] || (h[6] = (N) => V.externalDays = N),
                    type: "number",
                    min: "1",
                    step: "1"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    V.externalDays,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", cc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("改善事项到期前几天提醒")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[7] || (h[7] = (N) => V.improveRemindDays = N),
                    type: "number",
                    min: "0",
                    step: "1"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    V.improveRemindDays,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ])
            ]),
            e.createElementVNode("div", uc, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: $.value,
                "data-test": "fs-th-save",
                onClick: K
              }, [
                h[18] || (h[18] = e.createElementVNode(
                  "i",
                  { class: "ri-save-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(i.$t("保存阈值")),
                  1
                  /* TEXT */
                )
              ], 8, mc),
              R.value === "th" ? (e.openBlock(), e.createElementBlock(
                "span",
                pc,
                e.toDisplayString(i.$t("已保存")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          e.createElementVNode("section", yc, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(i.$t("节假日日历")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                gc,
                e.toDisplayString(i.$t("CSS 节点的个人审核用时只算工作日：周末不算，下面的节假日不算，调休上班的周末要算")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", vc, [
              e.createElementVNode("label", Nc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("节假日（工作日里放假的日期，一行一个，如 2026-10-01）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "textarea",
                  {
                    "onUpdate:modelValue": h[8] || (h[8] = (N) => B.value = N),
                    rows: "7",
                    "data-test": "fs-holidays"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, B.value]
                ])
              ]),
              e.createElementVNode("label", Ec, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("调休上班（要上班的周六、周日，一行一个）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "textarea",
                  {
                    "onUpdate:modelValue": h[9] || (h[9] = (N) => F.value = N),
                    rows: "7",
                    "data-test": "fs-extra"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, F.value]
                ])
              ])
            ]),
            e.createElementVNode("div", Vc, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: $.value,
                "data-test": "fs-cal-save",
                onClick: W
              }, [
                h[19] || (h[19] = e.createElementVNode(
                  "i",
                  { class: "ri-save-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(i.$t("保存日历")),
                  1
                  /* TEXT */
                )
              ], 8, hc),
              R.value === "cal" ? (e.openBlock(), e.createElementBlock(
                "span",
                kc,
                e.toDisplayString(i.$t("已保存")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          e.createElementVNode("section", fc, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(i.$t("输出目录")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("p", Dc, [
              h[20] || (h[20] = e.createElementVNode(
                "i",
                { class: "ri-folder-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "code",
                null,
                e.toDisplayString(e.unref(y)?.outputDir),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: _e
                },
                e.toDisplayString(i.$t("更改")),
                1
                /* TEXT */
              ),
              e.unref(y)?.settings.outputDir ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: h[10] || (h[10] = (N) => Ve(""))
                },
                e.toDisplayString(i.$t("恢复默认位置")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              Sc,
              e.toDisplayString(i.$t("通报、明细表、原因收集表、示例数据和台账导出都放在这里")),
              1
              /* TEXT */
            )
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), bc = /* @__PURE__ */ Ee($c, [["__scopeId", "data-v-b38aae3f"]]), _c = { class: "fs-workbench" }, wc = { class: "workbench-header" }, Bc = { class: "heading" }, Cc = { class: "eyebrow" }, Tc = { class: "subtitle" }, Lc = { class: "header-actions" }, Ac = ["disabled"], Fc = {
  key: 0,
  class: "fs-bar"
}, Oc = { class: "ss-muted" }, Mc = { class: "fs-bar__rule" }, Rc = { class: "no" }, Kc = { class: "yes" }, Wc = {
  class: "fs-tabs",
  role: "tablist"
}, Uc = ["aria-selected", "data-test", "onClick"], zc = {
  key: 0,
  class: "fs-badge"
}, Ic = {
  key: 1,
  class: "fs-badge"
}, Pc = {
  key: 1,
  class: "fs-body"
}, jc = {
  key: 4,
  class: "fs-ov"
}, qc = { class: "ss-panel" }, Yc = { class: "fs-list" }, Hc = { class: "ss-panel" }, Gc = { class: "fs-list" }, Jc = { class: "ss-panel" }, Xc = { class: "fs-list" }, Qc = { class: "ss-panel" }, Zc = { class: "fs-list" }, xc = {
  key: 2,
  class: "ss-note danger"
}, eu = {
  key: 3,
  class: "ss-note"
}, Nt = "totalclaw:flow-sla-tab:v1", tu = /* @__PURE__ */ e.defineComponent({
  __name: "FlowSlaWorkbenchView",
  setup(u) {
    const k = [
      { key: "bulletin", icon: "ri-mail-send-line", title: o.t("通报") },
      { key: "board", icon: "ri-dashboard-3-line", title: o.t("时效看板") },
      { key: "track", icon: "ri-route-line", title: o.t("在途跟进") },
      { key: "ledger", icon: "ri-book-2-line", title: o.t("改善台账") },
      { key: "rules", icon: "ri-ruler-2-line", title: o.t("规则") },
      { key: "overview", icon: "ri-book-open-line", title: o.t("方案说明") }
    ];
    function y() {
      try {
        const d = localStorage.getItem(Nt);
        return k.some((O) => O.key === d) ? d : "bulletin";
      } catch {
        return "bulletin";
      }
    }
    const E = be.useNotificationStore(), $ = J, g = e.ref(y()), C = e.ref(!1), b = e.ref(!1), U = e.ref(""), R = e.computed(() => ($.value?.tracking || []).filter((d) => !d.closedAt).length), V = e.computed(() => ($.value?.tracking || []).filter((d) => !d.closedAt && d.nextFollowAt && Date.parse(d.nextFollowAt) <= Date.now()).length), B = e.computed(() => ($.value?.ledger || []).filter((d) => d.status === "doing" || d.status === "overdue").length), F = e.computed(() => ($.value?.ledger || []).filter((d) => d.status === "overdue").length);
    function I(d) {
      g.value = d;
      try {
        localStorage.setItem(Nt, d);
      } catch {
      }
    }
    async function f() {
      b.value = !0;
      try {
        await ne(), C.value = !0, U.value = "";
      } catch (d) {
        U.value = q.errorMessage(d);
      } finally {
        b.value = !1;
      }
    }
    let A = null, Y = null;
    return e.onMounted(() => {
      f(), Y = Pt((d) => {
        d?.type === "reminder" && d.payload?.title && E.warn(String(d.payload.title), 8e3), !A && (A = setTimeout(() => {
          A = null, ne().catch(() => {
          });
        }, 250));
      });
    }), e.onBeforeUnmount(() => {
      Y?.(), A && clearTimeout(A);
    }), (d, O) => (e.openBlock(), e.createElementBlock("div", _c, [
      e.createElementVNode("header", wc, [
        e.createElementVNode("div", Bc, [
          e.createVNode(zt),
          O[0] || (O[0] = e.createElementVNode(
            "span",
            { class: "heading-icon" },
            [
              e.createElementVNode("i", { class: "ri-timer-flash-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "p",
              Cc,
              e.toDisplayString(d.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(d.$t("流程时效监控智能体")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Tc,
              e.toDisplayString(d.$t("把 OA、费控、CSS 三个系统导出的流程报表放进来，按《时效看板指标》的规则算出每个流程和每位审核人是否超时，出时效看板、周报和月度分析报告，跟进在途流程和改善建议。数字全部由规则计算，邮件由你确认后发出。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Lc, [
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: b.value,
            onClick: f
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(b.value ? "ri-loader-4-line spin" : "ri-refresh-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(d.$t("刷新")),
              1
              /* TEXT */
            )
          ], 8, Ac)
        ])
      ]),
      e.unref($) ? (e.openBlock(), e.createElementBlock("section", Fc, [
        e.createElementVNode("span", null, [
          O[1] || (O[1] = e.createElementVNode(
            "i",
            { class: "ri-calendar-check-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(e.unref($).session.period ? `${e.unref($e)(e.unref($).session.period.kind)} · ${e.unref($).session.period.label}` : d.$t("还没有导入报表")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          Oc,
          e.toDisplayString(d.$t("周期快照 {a} · 在途跟进 {b} · 改善事项 {c} · 规则 {d}", { a: e.unref($).snapshots.length, b: R.value, c: B.value, d: e.unref($).rules.custom ? d.$t("导入版") : d.$t("内置版") })),
          1
          /* TEXT */
        ),
        e.createElementVNode("p", Mc, [
          e.createElementVNode("span", Rc, [
            O[2] || (O[2] = e.createElementVNode(
              "i",
              { class: "ri-close-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(d.$t("模型不算数、不自己发邮件")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", Kc, [
            O[3] || (O[3] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(d.$t("每个数字都能追到流程和节点，发送由你点")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("nav", Wc, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(k, (_) => e.createElementVNode("button", {
            key: _.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["fs-tab", { active: g.value === _.key }]),
            "aria-selected": g.value === _.key,
            "data-test": `fs-tab-${_.key}`,
            onClick: (T) => I(_.key)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(_.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(_.title),
              1
              /* TEXT */
            ),
            _.key === "track" && V.value ? (e.openBlock(), e.createElementBlock(
              "em",
              zc,
              e.toDisplayString(V.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            _.key === "ledger" && F.value ? (e.openBlock(), e.createElementBlock(
              "em",
              Ic,
              e.toDisplayString(F.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, Uc)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      C.value ? (e.openBlock(), e.createElementBlock("div", Pc, [
        e.withDirectives(e.createVNode(
          wa,
          null,
          null,
          512
          /* NEED_PATCH */
        ), [
          [e.vShow, g.value === "bulletin"]
        ]),
        g.value === "board" ? (e.openBlock(), e.createBlock(ti, { key: 0 })) : g.value === "track" ? (e.openBlock(), e.createBlock(Yi, { key: 1 })) : g.value === "ledger" ? (e.openBlock(), e.createBlock(Td, { key: 2 })) : g.value === "rules" ? (e.openBlock(), e.createBlock(bc, { key: 3 })) : g.value === "overview" ? (e.openBlock(), e.createElementBlock("div", jc, [
          e.createElementVNode("section", qc, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(d.$t("它替流程管理员做什么")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Yc, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("读报表：OA、费控、CSS 导出的时效报表列名各不相同，自动认出单号、流程名、发起人、状态、时间、节点、处理人等列，认不准的让你点选；读不了的行会告诉你是哪一行、为什么")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("对规则：把报表里的流程名对到规则表的流程细类，对不上的列出来由你指定；没登记内外部属性的节点由你定计入还是不计入，定过一次以后都记得")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("算时效：每个流程的端到端用时、每次审核的个人用时，是否超时；在途流程是否已逾期、是否临期；各大类 / 细类的平均用时和合规率；审核人和发起人的合规率排名")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("找异常：和上一周期比，平均用时增加超过 3 天或合规率低于 95% 的流程类型标为异常，展开每个节点的耗时、等待和在途停留，指出耗时最长的节点")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("收原因：按责任人各出一封邮件列明名下的超时流程，你看过后点发送；原因回填后归到固定的七类并写根因")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("出通报：周报是邮件正文加明细表，月报是带图表的分析报告 PDF 加明细表；预览、改字、填收件人之后由你点发送")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("盯闭环：在途逾期的流程进跟进名单，内部流程每 3 天、外部流程每 7 天提醒一次，直到报表显示它办结；月报的改善建议记入改善台账，到期前 7 天提醒确认，逾期升级督办")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", Hc, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(d.$t("指标是怎么算的")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Gc, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("已办结：OA 审批状态为「结束」，CSS 状态为「已审核」，费控当前处理人为「结束」；按单号去重。终止的流程不统计")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("在途：OA 审批状态为「待审」，CSS 状态为「审核中」，费控当前处理人既不是「结束」也不是「终止」")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("OA / 费控单个流程用时 = 流程结束时间 − 起草（创建）时间，按自然日")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("CSS 单个流程用时 = 各内部审核节点用时之和（外部节点不算）；退换货申请只算最后一次审核的用时")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("流程时效合规率 = 不超时的办结流程数 ÷ 有时效要求的办结流程数；各大类平均用时 = 这一大类下各细类平均用时的平均值")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("个人审核用时：OA / 费控只算内部节点，按自然日，管理干部按流程细类（费控还看金额是否超过 10 万）、非管理干部统一 3 天；CSS 按节点各自的要求，只算工作日")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("个人审核合规率 = 这个人不超时的审核次数 ÷ 被统计的审核次数；花名册以外的人不参与排名")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("在途标签：在途时长超过时效要求 = 已逾期；超过时效要求的 80% = 较大逾期风险。在途时长算到报表导出那一天")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("统计周期：办结流程按结束时间落在周期内的算本期；个人审核按审核完成时间落在周期内的算本期；在途流程不分周期，全部统计")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", Jc, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(d.$t("三条红线")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Xc, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("数字不交给模型：用时、合规率、排名、环比全部由规则计算。模型只做两件事——把原因归到固定的七类并写根因、根据已算出的数字写总结和建议；它写的话里出现材料里没有的数字，那句话会被去掉，去掉太多就改用规则写的版本。不用模型一样能走完全程")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("邮件由人发：原因收集邮件、进度提醒、周报月报，都是先预览、你点了才发；没有邮箱的责任人会列出来，不会悄悄跳过")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("每个数字可回溯：看板和通报里的数都能在明细表里找到对应的流程和节点；对不上规则的流程名、没登记的节点、没收的行都列出来，不悄悄丢")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", Qc, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(d.$t("先知道这几件事")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Zc, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("数据来自你导出的报表文件：应用不登录 OA、费控、CSS，也不改里面的任何东西。报表导出得越全（尤其是处理人维度的节点表），个人审核和节点分析越准")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("CSS 的报表如果没有节点明细，流程用时只能按「结束 − 开始」估算，会在结果里标出来")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("环比要有上一周期的快照：第一次用没有环比，从第二个周期开始才有")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("改善建议记在本机的改善台账里，可以导出 Excel 发给相关人；它目前代替企业微信的共享台账，不会自动写到企业微信里")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("在途跟进和台账提醒由应用在后台检查，应用开着才会提醒；提醒出现在本页和系统通知里")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(d.$t("规则表更新后，在「规则」页导入新的《时效看板指标》工作簿即可；节假日要在「规则」页自己维护")),
                1
                /* TEXT */
              )
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ])) : U.value ? (e.openBlock(), e.createElementBlock("p", xc, [
        O[4] || (O[4] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(U.value),
          1
          /* TEXT */
        )
      ])) : (e.openBlock(), e.createElementBlock("p", eu, [
        O[5] || (O[5] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(d.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), lu = /* @__PURE__ */ Ee(tu, [["__scopeId", "data-v-6735afe1"]]);
export {
  lu as default
};
