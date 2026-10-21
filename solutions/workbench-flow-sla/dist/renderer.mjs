const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const a = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!a) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
a.default;
const $e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!$e) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
$e.default;
const Nt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!Nt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Ut = Nt.default, Ge = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!Ge) throw new Error("宿主模块未就绪：npm:vue-router");
Ge.default;
const Me = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!Me) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
Me.default;
const Et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!Et) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const ye = Et.default, Vt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!Vt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const zt = Vt.default, ht = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/FileDropField.vue"];
if (!ht) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/FileDropField.vue");
const ot = ht.default, kt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/TableMapping.vue"];
if (!kt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/TableMapping.vue");
const at = kt.default, Je = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!Je) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
Je.default;
const j = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!j) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
j.default;
async function k(u, h) {
  const y = window.electronAPI?.workbenches?.flowSla;
  if (!y?.invoke) throw new Error(a.t("流程时效监控接口不可用，请重启应用"));
  return y.invoke(u, Je.toPlain(h ?? {}));
}
function It(u) {
  const h = window.electronAPI?.workbenches?.flowSla;
  return h?.onEvent ? h.onEvent(u) : () => {
  };
}
const G = e.ref(null);
async function le() {
  const u = await k("state.get");
  return G.value = u, u;
}
function re(u, h = !1) {
  return k("path.open", { path: u, reveal: h });
}
const H = (u) => u == null ? "-" : `${(Math.round(u * 1e3) / 10).toFixed(1)}%`, I = (u) => u == null ? "-" : String(Math.round(u * 100) / 100), Oe = (u) => u == null ? "-" : `${u > 0 ? "+" : ""}${Math.round(u * 100) / 100}`, Pe = (u) => u == null ? "-" : `${u > 0 ? "+" : ""}${(Math.round(u * 1e3) / 10).toFixed(1)}`, Re = (u) => String(u).padStart(2, "0");
function Z(u) {
  const h = new Date(u);
  return `${h.getFullYear()}-${Re(h.getMonth() + 1)}-${Re(h.getDate())}`;
}
function De(u) {
  const h = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(u || ""));
  return h ? new Date(Number(h[1]), Number(h[2]) - 1, Number(h[3])).getTime() : NaN;
}
function Ke(u) {
  if (!u) return "";
  const h = new Date(u);
  return `${Z(u)} ${Re(h.getHours())}:${Re(h.getMinutes())}`;
}
function rt(u, h = Date.now()) {
  const y = new Date(h);
  if (y.setHours(0, 0, 0, 0), u === "monthly") {
    const T = new Date(y.getFullYear(), y.getMonth() - 1, 1), $ = new Date(y.getFullYear(), y.getMonth(), 0);
    return { kind: u, start: Z(T.getTime()), lastDay: Z($.getTime()), asOf: Z(h) };
  }
  const N = (y.getDay() + 6) % 7, S = new Date(y.getFullYear(), y.getMonth(), y.getDate() - N - 7), m = new Date(y.getFullYear(), y.getMonth(), y.getDate() - N - 1);
  return { kind: u, start: Z(S.getTime()), lastDay: Z(m.getTime()), asOf: Z(h) };
}
function it(u, h = Date.now()) {
  const y = De(u.start), N = De(u.lastDay);
  if (!Number.isFinite(y) || !Number.isFinite(N)) throw new Error(a.t("请填写统计周期的起止日期"));
  if (N < y) throw new Error(a.t("统计周期的结束日期不能早于开始日期"));
  const S = new Date(N);
  S.setDate(S.getDate() + 1);
  const m = De(u.asOf), T = Number.isFinite(m) ? m + 864e5 - 1e3 : h;
  return { kind: u.kind, start: y, end: S.getTime(), asOf: Math.min(T, h), label: "" };
}
function dt(u) {
  const h = new Date(u.end);
  return h.setDate(h.getDate() - 1), { kind: u.kind, start: Z(u.start), lastDay: Z(h.getTime()), asOf: Z(u.asOf) };
}
const Se = (u) => u === "monthly" ? a.t("月报") : a.t("周报");
function je(u) {
  return {
    flowNo: a.t("单号"),
    flowName: a.t("流程名称 / 事务类型"),
    feeType: a.t("费用类型"),
    title: a.t("标题"),
    initiator: a.t("发起人"),
    dept: a.t("部门"),
    status: a.t("状态"),
    startAt: a.t("流程开始时间"),
    endAt: a.t("流程结束时间"),
    amount: a.t("金额"),
    currentNode: a.t("当前节点"),
    currentHandler: a.t("当前处理人"),
    node: a.t("节点 / 环节名称"),
    handler: a.t("处理人 / 审核人"),
    nodeStart: a.t("节点到达时间"),
    nodeEnd: a.t("节点完成时间"),
    name: a.t("姓名"),
    email: a.t("邮箱"),
    identity: a.t("身份")
  }[u] || u;
}
const ct = ["flowNo", "flowName", "feeType", "title", "initiator", "dept", "status", "startAt", "endAt", "amount", "currentNode", "currentHandler"], ut = ["node", "handler", "nodeStart", "nodeEnd"];
function He(u, h, y) {
  if (u === "roster") return ["name", "dept", "email", "identity"].map((m) => ({ key: m, label: je(m), required: m === "name" }));
  if (!(u === "node" || !!h.node && !!h.nodeStart)) return [...ct, ...ut].map((m) => ({ key: m, label: je(m), required: ["flowNo", "flowName", "startAt"].includes(m) }));
  const S = /* @__PURE__ */ new Set(["flowNo", "node", "handler", "nodeStart"]);
  return (!y || u === "flow") && S.add("flowName"), [...ut, ...ct].map((m) => ({ key: m, label: je(m), required: S.has(m) }));
}
function mt(u, h, y) {
  return He(u, h, y).filter((N) => N.required && !h[N.key]).map((N) => N.key);
}
function pt(u) {
  switch (u) {
    case "materials":
      return a.t("资料不全退回");
    case "absence":
      return a.t("审批人出差/休假");
    case "cross_dept":
      return a.t("跨部门沟通等待");
    case "external":
      return a.t("外部单位未反馈");
    case "system":
      return a.t("系统/操作问题");
    case "design":
      return a.t("流程设计环节过多");
    case "other":
      return a.t("其他");
    default:
      return a.t("未归类");
  }
}
function ft(u) {
  return u.status === "done" ? u.overtime === !0 ? a.t("办结超时") : u.overtime === !1 ? a.t("办结合规") : a.t("办结（无时效要求）") : u.runningLabel === "overdue" ? a.t("在途已逾期") : u.runningLabel === "risk" ? a.t("较大逾期风险") : u.runningLabel === "no_limit" ? a.t("在途（无时效要求）") : a.t("在途正常");
}
function Dt(u) {
  return u.overtime === !0 || u.runningLabel === "overdue" ? "bad" : u.runningLabel === "risk" ? "warn" : u.overtime === !1 ? "ok" : "";
}
function qe(u) {
  return { doing: a.t("进行中"), done: a.t("已完成"), overdue: a.t("逾期"), archived: a.t("已归档") }[u];
}
function Pt(u) {
  return { doing: "brand", done: "ok", overdue: "bad", archived: "" }[u];
}
function Ye(u, h = Date.now()) {
  const y = De(u);
  return Number.isFinite(y) ? Math.round((y - De(Z(h))) / 864e5) : null;
}
function jt(u) {
  const h = String(u || "").split(/[,;，；\s]+/).map((N) => N.trim()).filter(Boolean), y = h.filter((N) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(N));
  return { ok: new Set(h.filter((N) => !y.includes(N))).size, bad: y };
}
const qt = { class: "ss-module" }, Yt = { class: "ss-steps" }, Ht = { class: "ss-actions" }, Gt = {
  class: "fs-seg",
  role: "radiogroup"
}, Jt = ["data-test", "onClick"], Xt = { class: "ss-field inline" }, Qt = { class: "ss-field inline" }, Zt = { class: "ss-field inline" }, xt = { class: "ss-muted" }, el = { class: "fs-slots" }, tl = {
  key: 0,
  class: "ss-note info"
}, ll = { class: "fs-sys" }, nl = { class: "ss-actions" }, sl = ["disabled"], ol = ["disabled"], al = {
  key: 0,
  class: "ss-muted"
}, rl = {
  key: 0,
  class: "ss-file-out"
}, il = {
  key: 1,
  class: "ss-table-wrap"
}, dl = { class: "ss-table" }, cl = { class: "num" }, ul = { class: "num" }, ml = {
  key: 0,
  class: "ss-empty"
}, pl = { class: "ss-kpis" }, yl = { class: "ss-kpi" }, gl = { class: "ss-subhead" }, vl = {
  key: 0,
  class: "ss-note ok"
}, Nl = {
  key: 1,
  class: "ss-table-wrap fs-scroll"
}, El = { class: "ss-table" }, Vl = { class: "num" }, hl = { class: "num" }, kl = ["disabled", "data-test", "onChange"], fl = { value: "" }, Dl = ["value"], Sl = {
  key: 2,
  class: "ss-muted"
}, $l = ["title", "onClick"], bl = { class: "ss-subhead" }, _l = {
  key: 3,
  class: "ss-note ok"
}, wl = { class: "ss-note warn" }, Bl = { class: "ss-table-wrap fs-scroll" }, Cl = { class: "ss-table" }, Tl = { class: "num" }, Ll = { class: "num" }, Al = { class: "fs-ops" }, Fl = ["disabled", "onClick"], Ol = ["disabled", "onClick"], Ml = {
  key: 5,
  class: "ss-muted"
}, Rl = ["title", "onClick"], Kl = { class: "ss-subhead" }, Wl = { class: "fs-chips" }, Ul = { class: "ss-actions" }, zl = ["disabled"], Il = { class: "ss-actions" }, Pl = ["disabled"], jl = ["disabled"], ql = {
  key: 0,
  class: "ss-file-out"
}, Yl = {
  class: "ss-kpis",
  "data-test": "fs-kpis"
}, Hl = { class: "ss-kpi" }, Gl = { class: "ss-kpi" }, Jl = { class: "ss-kpi accent" }, Xl = { class: "ss-kpi" }, Ql = { class: "ss-kpi" }, Zl = { class: "ss-kpi" }, xl = { class: "ss-kpi accent" }, en = {
  key: 1,
  class: "ss-note warn"
}, tn = {
  key: 2,
  class: "ss-note info"
}, ln = { class: "ss-subhead" }, nn = { class: "ss-table-wrap" }, sn = { class: "ss-table" }, on = { class: "num" }, an = { class: "num" }, rn = { class: "num" }, dn = { class: "num" }, cn = { class: "num" }, un = { class: "num" }, mn = { class: "num" }, pn = { class: "num" }, yn = { class: "num" }, gn = { class: "num" }, vn = { class: "num" }, Nn = { class: "num" }, En = { class: "num" }, Vn = { class: "num" }, hn = { class: "ss-subhead" }, kn = { class: "ss-table-wrap fs-scroll" }, fn = { class: "ss-table" }, Dn = { class: "num" }, Sn = { class: "num" }, $n = { class: "num" }, bn = { class: "num" }, _n = { class: "num" }, wn = { class: "num" }, Bn = { class: "num" }, Cn = { class: "num" }, Tn = { class: "num" }, Ln = { class: "num" }, An = { class: "num" }, Fn = { class: "num" }, On = { class: "num" }, Mn = { class: "num" }, Rn = { class: "fs-two" }, Kn = { class: "ss-subhead" }, Wn = { class: "ss-table-wrap fs-scroll" }, Un = { class: "ss-table" }, zn = { class: "num" }, In = { class: "num" }, Pn = { class: "num" }, jn = { class: "num" }, qn = { class: "num" }, Yn = { class: "num" }, Hn = { class: "num" }, Gn = { class: "num" }, Jn = { class: "ss-subhead" }, Xn = { class: "ss-table-wrap fs-scroll" }, Qn = { class: "ss-table" }, Zn = { class: "num" }, xn = { class: "num" }, es = { class: "num" }, ts = { class: "num" }, ls = { class: "num" }, ns = { class: "num" }, ss = { class: "num" }, os = { class: "num" }, as = { class: "ss-subhead" }, rs = { class: "ss-subhead" }, is = {
  key: 0,
  class: "ss-empty"
}, ds = { class: "ss-actions" }, cs = {
  key: 0,
  class: "ss-field inline"
}, us = { value: "" }, ms = ["value"], ps = ["disabled"], ys = {
  key: 0,
  class: "ss-note warn"
}, gs = {
  key: 1,
  class: "ss-kpis"
}, vs = { class: "ss-kpi" }, Ns = { class: "fs-small" }, Es = { class: "ss-kpi" }, Vs = { class: "ss-kpi" }, hs = { class: "ss-kpi" }, ks = { class: "ss-kpi" }, fs = { class: "ss-kpi" }, Ds = { class: "ss-subhead" }, Ss = { class: "ss-table-wrap fs-scroll" }, $s = { class: "ss-table" }, bs = { class: "num" }, _s = { class: "num" }, ws = { class: "num" }, Bs = { class: "num" }, Cs = { class: "num" }, Ts = { class: "num" }, Ls = { class: "num" }, As = { class: "num" }, Fs = { class: "num" }, Os = { class: "num" }, Ms = { class: "num" }, Rs = { class: "num" }, Ks = { class: "num" }, Ws = { class: "num" }, Us = { class: "fs-wrap" }, zs = { class: "ss-chip" }, Is = {
  key: 0,
  class: "ss-chip warn"
}, Ps = {
  key: 0,
  class: "ss-muted"
}, js = {
  key: 1,
  class: "ss-table-wrap"
}, qs = { class: "ss-table" }, Ys = { class: "num" }, Hs = { class: "num" }, Gs = { class: "num" }, Js = { class: "num" }, Xs = { class: "num" }, Qs = { class: "num" }, Zs = { class: "num" }, xs = { class: "num" }, eo = { class: "num" }, to = { class: "num" }, lo = { class: "num" }, no = { class: "num" }, so = { class: "num" }, oo = { class: "num" }, ao = { class: "ss-subhead" }, ro = {
  key: 0,
  class: "ss-empty"
}, io = {
  key: 0,
  class: "ss-note ok"
}, co = { class: "ss-subhead" }, uo = { class: "ss-table-wrap fs-scroll" }, mo = { class: "ss-table" }, po = ["checked"], yo = { class: "num" }, go = ["value", "disabled"], vo = { class: "num" }, No = ["value", "placeholder", "onChange"], Eo = {
  key: 0,
  class: "ss-chip ok"
}, Vo = {
  key: 1,
  class: "ss-chip warn"
}, ho = {
  key: 2,
  class: "ss-chip"
}, ko = ["onClick"], fo = { key: 0 }, Do = { colspan: "6" }, So = { class: "fs-mail" }, $o = { class: "ss-actions" }, bo = ["disabled"], _o = ["disabled"], wo = ["disabled"], Bo = {
  key: 0,
  class: "ss-file-out"
}, Co = { class: "ss-subhead" }, To = { class: "ss-table-wrap fs-scroll" }, Lo = { class: "ss-table" }, Ao = { class: "num" }, Fo = { class: "num" }, Oo = ["value", "placeholder", "data-test", "onChange"], Mo = ["value", "disabled", "onChange"], Ro = { value: "" }, Ko = ["value"], Wo = { class: "ss-actions" }, Uo = ["disabled"], zo = ["disabled"], Io = { class: "ss-muted" }, Po = {
  key: 1,
  class: "fs-roots"
}, jo = ["value", "placeholder", "onChange"], qo = { class: "ss-actions" }, Yo = ["disabled"], Ho = {
  key: 0,
  class: "ss-empty"
}, Go = { class: "ss-actions" }, Jo = ["disabled"], Xo = ["disabled"], Qo = {
  key: 0,
  class: "ss-muted"
}, Zo = { class: "ss-field" }, xo = { class: "ss-subhead" }, ea = { class: "ss-table-wrap" }, ta = { class: "ss-table fs-sug" }, la = ["onUpdate:modelValue"], na = ["onUpdate:modelValue"], sa = ["onUpdate:modelValue"], oa = ["onUpdate:modelValue"], aa = ["onUpdate:modelValue"], ra = ["onUpdate:modelValue"], ia = ["onClick"], da = { class: "ss-actions" }, ca = { class: "ss-actions" }, ua = ["disabled"], ma = ["onClick"], pa = ["onClick"], ya = { class: "ss-subhead" }, ga = ["srcdoc", "title"], va = { class: "ss-field" }, Na = { class: "ss-field" }, Ea = { class: "ss-field" }, Va = {
  key: 0,
  class: "ss-note danger"
}, ha = { class: "ss-actions" }, ka = ["disabled"], fa = ["disabled"], Da = {
  key: 1,
  class: "ss-chip ok"
}, Sa = {
  key: 2,
  class: "ss-chip ok"
}, $a = {
  key: 1,
  class: "ss-note ok"
}, yt = "__regular__", ba = /* @__PURE__ */ e.defineComponent({
  __name: "BulletinTab",
  setup(u, { expose: h }) {
    const y = ["weekly", "monthly"], N = Me.FS_SYSTEMS, S = ["flow", "node"], m = Me.FS_REASON_CATEGORIES, T = $e.useNotificationStore(), $ = Ge.useRouter(), M = e.computed(() => G.value?.session ?? null), B = e.computed(() => G.value?.thresholds.minComplianceRate ?? 0.95), f = [
      { key: "fs-import", title: a.t("导入报表与花名册"), hint: a.t("放进 OA、费控、CSS 导出的时效报表和中心花名册，选周报还是月报") },
      { key: "fs-check", title: a.t("标准化与规则核对"), hint: a.t("看流程名、节点、人员和规则表对不对得上，对不上的在这里定") },
      { key: "fs-calc", title: a.t("计算"), hint: a.t("按时效规则算端到端用时、个人审核用时、合规率和排名，识别临期与超时") },
      { key: "fs-compare", title: a.t("环比与异常分析"), hint: a.t("和上一周期比，找出异常流程类型，展开看卡在哪个节点") },
      { key: "fs-reason", title: a.t("超时原因收集"), hint: a.t("按责任人发邮件收集原因，回填后归类并写根因") },
      { key: "fs-report", title: a.t("生成并发送通报"), hint: a.t("周报出邮件和明细表，月报出分析报告 PDF；预览后由你点发送") }
    ], w = j.useSteps(f), { runtime: F, currentKey: W } = w, D = e.ref("");
    async function L(t, n, l = {}) {
      const p = l.mark !== !1, O = F[t].state === "failed" || F[t].state === "running" ? "todo" : F[t].state;
      D.value = l.busyKey || t, p ? w.start(t) : w.set(t, { state: "running", error: void 0, startedAt: Date.now() });
      try {
        const A = await n();
        return p ? w.done(t, A || void 0) : w.set(t, { state: O }), !0;
      } catch (A) {
        return w.fail(t, A), !1;
      } finally {
        D.value = "";
      }
    }
    function q(t) {
      j.scrollToStep(t);
    }
    const d = e.reactive(rt("weekly"));
    function R(t) {
      Object.assign(d, rt(t));
    }
    const _ = e.reactive(Object.fromEntries(N.map((t) => [t, { flow: null, node: null }]))), C = e.ref(null), P = e.ref(null), J = e.ref("");
    function ne(t) {
      return t === "OA" ? a.t("审批类流程：状态看「审批状态」，结束 = 办结，待审 = 在途") : t === "CSS" ? a.t("售后服务类流程：状态看「状态」，已审核 = 办结，审核中 = 在途；用时只累计内部节点") : a.t("费用类流程：状态看「当前处理人」，结束 = 办结，终止不统计，其余在途");
    }
    async function c(t, n, l, p) {
      l && await L("fs-import", async () => {
        _[t][n] = await k("ingest.preview", { path: l, slot: n, sheet: p, hasFlowTable: n === "node" && !!_[t].flow });
      }, { mark: !1 });
    }
    async function s(t, n) {
      t && await L("fs-import", async () => {
        C.value = await k("ingest.preview", { path: t, slot: "roster", sheet: n });
      }, { mark: !1 });
    }
    const r = e.computed(() => N.flatMap((t) => S.map((n) => ({ sys: t, slot: n, t: _[t][n] }))).filter((t) => t.t)), o = e.computed(() => {
      if (!r.value.length) return a.t("至少放一个系统的报表");
      for (const t of r.value)
        if (mt(t.slot, t.t.mapping, !!_[t.sys].flow).length) return a.t("{p0}：还有必填列没有对应上", { p0: t.t.fileName });
      return C.value && mt("roster", C.value.mapping, !1).length ? a.t("花名册还没有对应上姓名列") : "";
    }), E = e.computed(() => !o.value);
    function g(t) {
      return t.systems.map((n) => a.t("{p0} {p1} 个流程", { p0: n.system, p1: n.flows })).join(a.t("，")) + a.t("；花名册 {p0} 人", { p0: t.roster });
    }
    async function K(t) {
      P.value = t.summary, Object.assign(d, dt(t.period)), se("fs-import"), await le();
    }
    async function ie() {
      J.value = "", await L("fs-import", async () => {
        const n = {};
        for (const p of N) {
          const { flow: O, node: A } = _[p];
          !O && !A || (n[p] = {
            ...O ? { flow: { path: O.path, sheet: O.sheetName, mapping: O.mapping } } : {},
            ...A ? { node: { path: A.path, sheet: A.sheetName, mapping: A.mapping } } : {}
          });
        }
        const l = await k("ingest.commit", {
          period: it(d),
          systems: n,
          ...C.value ? { roster: { path: C.value.path, sheet: C.value.sheetName, mapping: C.value.mapping } } : {}
        });
        return await K(l), g(l.summary);
      }) && await V();
    }
    async function be() {
      await L("fs-import", async () => {
        const n = await k("demo.generate", { period: it(d) });
        for (const l of N)
          _[l].flow = null, _[l].node = null;
        return C.value = null, await K(n), J.value = n.dir, a.t("已载入示例数据：{p0}", { p0: g(n.summary) });
      }) && await V();
    }
    function se(t) {
      w.resetAfter(t);
      const n = f.findIndex((l) => l.key === t);
      n < 1 && (U.value = null), n < 2 && (b.value = null, de.value = "", we.value = ""), n < 3 && (z.value = null), n < 4 && (Ve.value = [], he.value = ""), n < 5 && (te.value = null, fe.value = "", Le.value = "");
    }
    const U = e.ref(null), _e = e.computed(() => (U.value?.unmatched || []).filter((t) => !t.regular)), Ee = e.computed(() => (U.value?.aliases || []).filter((t) => t.target !== yt)), i = (t) => (U.value?.ruleTypes || []).filter((n) => n.system.toUpperCase().split("/").includes(t.toUpperCase()));
    async function V() {
      return L("fs-check", async () => {
        U.value = await k("check.run");
      }, { mark: !1 });
    }
    async function v(t, n, l) {
      !l && !U.value?.aliases.some((p) => p.system === t && p.flowName === n) || await L("fs-check", async () => {
        await k("alias.set", { system: t, flowName: n, target: l }), se("fs-check"), U.value = await k("check.run");
      }, { mark: !1 });
    }
    async function Y(t, n) {
      await L("fs-check", async () => {
        await k("node.decide", { system: t.system, flowName: t.flowName, node: t.node, internal: n }), se("fs-check"), U.value = await k("check.run");
      }, { mark: !1 });
    }
    function x() {
      if (!U.value) return;
      const t = U.value;
      w.done("fs-check", a.t("流程名待定 {a} 个，未登记节点 {b} 个，花名册外审核人 {c} 人", { a: _e.value.length, b: t.unknownNodes.length, c: t.outOfRoster.length })), j.scrollToStep("fs-calc");
    }
    const b = e.ref(null), de = e.ref(""), we = e.ref("");
    function Ze(t) {
      return a.t("办结 {a} 单，合规率 {b}，在途逾期 {c} 单", { a: t.overall.doneCount, b: H(t.overall.complianceRate), c: t.overall.runningOverdue });
    }
    async function xe() {
      F["fs-check"].state !== "done" && x(), await L("fs-calc", async () => {
        se("fs-calc");
        const n = await k("calc.run");
        return b.value = n, we.value = n.tracking.added || n.tracking.closed ? a.t("在途跟进名单：新增 {a} 条，闭环 {b} 条（见「在途跟进」页）", { a: n.tracking.added, b: n.tracking.closed }) : "", await le(), Ze(n);
      }) && await ke();
    }
    async function $t() {
      await L("fs-calc", async () => {
        de.value = await k("calc.export");
      }, { mark: !1 });
    }
    const z = e.ref(null), Ue = e.ref("");
    async function et() {
      await L("fs-compare", async () => {
        const t = await k("compare.run", { prevId: Ue.value || void 0 });
        return z.value = t, t.previous ? a.t("对比 {a}：异常流程类型 {b} 个", { a: t.previous.label, b: t.abnormal.length }) : a.t("没有上一周期，异常流程类型 {b} 个", { b: t.abnormal.length });
      });
    }
    function Be(t, n) {
      return t == null || t === 0 ? "" : t > 0 === n ? "fs-ok" : "fs-bad";
    }
    const X = e.ref([]), ce = e.ref([]), Q = e.ref([]), Ce = e.ref(""), Ve = e.ref([]), he = e.ref(""), Te = e.ref({}), ue = e.computed(() => X.value.filter((t) => t.reason.trim()).length), bt = e.computed(() => ce.value.some((t) => t.email) && ce.value.filter((t) => t.email).every((t) => Q.value.includes(t.owner))), tt = e.computed(() => m.map((t) => ({ id: t, count: X.value.filter((n) => n.reason.trim() && n.categoryId === t).length })).filter((t) => t.count > 0));
    function _t(t) {
      Q.value = t ? ce.value.filter((n) => n.email).map((n) => n.owner) : [];
    }
    async function ke() {
      try {
        const t = await k("cases.get");
        X.value = t.cases, ce.value = t.mails, Q.value = Q.value.filter((n) => t.mails.some((l) => l.owner === n && l.email)), Te.value = { ...G.value?.session.rootCauses || {} };
      } catch (t) {
        w.fail("fs-reason", t);
      }
    }
    async function oe(t, n) {
      await L("fs-reason", n, { mark: !1, busyKey: t });
    }
    async function wt(t, n) {
      await oe("fs-reason", async () => {
        await k("cases.setEmail", { owner: t, email: n }), await ke();
      });
    }
    async function Bt() {
      const t = Q.value.length;
      window.confirm(a.t("给 {n} 位责任人各发一封原因收集邮件？", { n: t })) && await oe("fs-reason-send", async () => {
        const n = await k("reasons.send", { owners: Q.value });
        Ve.value = [
          ...n.sent.length ? [{ text: a.t("已发送给 {n} 人：{p0}", { n: n.sent.length, p0: n.sent.join("、") }), cls: "ok" }] : [],
          ...n.skipped.length ? [{ text: a.t("没有邮箱，没有发：{p0}", { p0: n.skipped.join("、") }), cls: "warn" }] : [],
          ...n.failed.map((l) => ({ text: a.t("{p0} 发送失败：{p1}", { p0: l.owner, p1: l.message }), cls: "danger" }))
        ], Q.value = [], await ke();
      });
    }
    async function Ct() {
      await oe("fs-reason", async () => {
        he.value = await k("reasons.export");
      });
    }
    async function Tt() {
      const t = await k("files.pick", { multi: !1 });
      t.length && await oe("fs-reason", async () => {
        const n = await k("reasons.import", { path: t[0] });
        Ve.value = [{ text: a.t("回填了 {a} 个流程的原因", { a: n.filled }) + (n.unmatched ? a.t("；{b} 行的单号在本期名单里找不到", { b: n.unmatched }) : ""), cls: n.unmatched ? "warn" : "ok" }], await ke();
      });
    }
    async function Lt(t, n) {
      await oe("fs-reason", async () => {
        X.value = await k("reasons.set", { key: t, reason: n });
      });
    }
    async function At(t, n) {
      await oe("fs-reason", async () => {
        X.value = await k("reasons.set", { key: t, categoryId: n });
      });
    }
    async function lt(t) {
      await oe("fs-classify", async () => {
        const n = await k("reasons.classify", { useModel: t });
        X.value = n.cases, Te.value = { ...n.rootCauses }, Ve.value = [
          n.modelError ? { text: a.t("模型没有用上（{p0}），已按关键字归类", { p0: n.modelError }), cls: "warn" } : { text: n.by === "model" ? a.t("模型已归类") + (n.rejected ? a.t("；{n} 处没通过核对，保留关键字归类或通用说明", { n: n.rejected }) : "") : a.t("已按关键字归类，归得不对的可以在表里改"), cls: "ok" }
        ];
      });
    }
    async function Ft(t, n) {
      await oe("fs-reason", async () => {
        Te.value = { ...await k("rootCause.set", { id: t, text: n }) };
      });
    }
    function Ot() {
      w.done("fs-reason", X.value.length ? a.t("需要说明 {a} 个流程，已收到 {b} 个原因", { a: X.value.length, b: ue.value }) : a.t("本期不需要收集原因")), j.scrollToStep("fs-report");
    }
    const ae = e.ref(""), ee = e.ref([]), Le = e.ref(""), te = e.ref(null), Ae = e.ref(""), Fe = e.ref(""), me = e.ref(""), fe = e.ref(""), pe = e.computed(() => jt(me.value));
    async function ze(t, n) {
      return L("fs-report", n, { mark: !1, busyKey: t });
    }
    async function nt(t) {
      await ze("fs-draft", async () => {
        const n = await k("summary.draft", { useModel: t });
        ae.value = n.summary, ee.value = n.suggestions, Le.value = n.modelError ? a.t("模型没有用上（{p0}），已按数据起草", { p0: n.modelError }) : n.by === "model" ? a.t("模型起草") + (n.dropped ? a.t("，去掉了 {n} 句带有材料里没有的数字的话", { n: n.dropped }) : "") : t ? a.t("模型写的内容没有通过数字核对，已按数据起草") : a.t("已按数据起草，可以直接改");
      });
    }
    async function Mt() {
      fe.value = "", await ze("fs-report-build", async () => {
        if (!ae.value.trim() && b.value?.period.kind === "monthly") {
          const l = await k("summary.draft", { useModel: !1 });
          ae.value = l.summary, ee.value = l.suggestions;
        }
        await k("summary.save", { summary: ae.value, suggestions: ee.value });
        const t = await k("report.build");
        te.value = t, Ae.value = t.subject, Fe.value = t.text;
        const n = await le();
        me.value.trim() || (me.value = t.kind === "monthly" ? n.settings.monthlyRecipients : n.settings.weeklyRecipients);
      });
    }
    async function Rt() {
      if (te.value && window.confirm(a.t("把通报发给 {n} 位收件人？附件 {m} 个。", { n: pe.value.ok, m: te.value.files.length }))) {
        D.value = "fs-report-send", w.start("fs-report");
        try {
          const t = await k("report.send", { to: me.value, subject: Ae.value, text: Fe.value });
          fe.value = a.t("已发送给 {n} 位收件人", { n: t.recipients }) + (t.via === "official" ? a.t("（经官方代发，发件人不是你自己的邮箱）") : "") + (t.ledgerAdded ? a.t("；{n} 条改善建议已记入改善台账", { n: t.ledgerAdded }) : "") + (t.notice ? ` ${t.notice}` : ""), w.done("fs-report", a.t("通报已发送给 {n} 位收件人", { n: t.recipients })), await le();
        } catch (t) {
          w.fail("fs-report", t);
        } finally {
          D.value = "";
        }
      }
    }
    async function Kt() {
      await ze("fs-report", async () => {
        await k("summary.save", { summary: ae.value, suggestions: ee.value });
        const t = await k("report.toLedger");
        T.success(a.t("{n} 条改善建议已记入改善台账", { n: t })), await le();
      });
    }
    const st = e.defineComponent({
      name: "FsMailStatus",
      setup() {
        return () => {
          const t = G.value?.mail;
          if (!t) return null;
          const n = () => {
            $.push({ path: "/settings", query: { section: "notify", focus: "smtp" } });
          }, l = e.h("button", { type: "button", class: "ss-link", onClick: n }, a.t("去设置邮箱"));
          return t.smtpConfigured ? e.h("p", { class: "ss-note ok" }, [e.h("i", { class: "ri-mail-check-line" }), a.t("发件邮箱：{p0}", { p0: t.address })]) : t.officialRelay ? e.h("p", { class: "ss-note warn" }, [e.h("i", { class: "ri-mail-line" }), a.t("还没有配置自己的发件邮箱，会经官方代发（发件人不是你的邮箱，对方回信到不了你这里）。"), l]) : e.h("p", { class: "ss-note danger" }, [e.h("i", { class: "ri-mail-close-line" }), a.t("还没有配置发件邮箱，邮件发不出去。"), l]);
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
            a.t("系统"),
            a.t("单号"),
            a.t("流程细类"),
            a.t("标题"),
            a.t("发起人"),
            a.t("状态"),
            t.running ? a.t("在途（天）") : a.t("用时（天）"),
            a.t("时效要求"),
            a.t("超出（天）"),
            ...t.running ? [a.t("当前节点"), a.t("当前处理人"), a.t("节点停留（天）")] : [a.t("开始"), a.t("结束")]
          ], O = new Set(t.running ? [6, 7, 8, 11] : [6, 7, 8]);
          return e.h("div", { class: "fs-flowtable" }, [
            e.h("div", { class: "ss-table-wrap fs-scroll" }, e.h("table", { class: "ss-table" }, [
              e.h("thead", e.h("tr", p.map((A, Wt) => e.h("th", { class: O.has(Wt) ? "num" : "" }, A)))),
              e.h("tbody", l.map((A) => e.h("tr", { key: `${A.system}|${A.flowNo}` }, [
                e.h("td", A.system),
                e.h("td", A.flowNo),
                e.h("td", A.flowType),
                e.h("td", { class: "fs-wrap" }, A.title),
                e.h("td", A.initiator),
                e.h("td", e.h("span", { class: ["ss-chip", Dt(A)] }, ft(A))),
                e.h("td", { class: "num" }, I(A.days) + (A.approx ? " *" : "")),
                e.h("td", { class: "num" }, A.limitDays ?? "-"),
                e.h("td", { class: "num" }, A.overdueDays ? I(A.overdueDays) : "-"),
                ...t.running ? [e.h("td", A.currentNode), e.h("td", A.currentHandler), e.h("td", { class: "num" }, I(A.currentNodeDays))] : [e.h("td", Ke(A.startAt)), e.h("td", Ke(A.endAt))]
              ])))
            ])),
            t.flows.length > 30 ? e.h("button", { type: "button", class: "ss-link", onClick: () => {
              n.value = !n.value;
            } }, n.value ? a.t("只看前 30 条") : a.t("显示全部 {n} 条", { n: t.flows.length })) : null
          ]);
        };
      }
    });
    return e.onMounted(async () => {
      const t = G.value?.session;
      if (!(!t?.period || !t.ingest || !G.value?.hasData) && (Object.assign(d, dt(t.period)), P.value = t.ingest, w.set("fs-import", { state: "done", summary: g(t.ingest) }), !!await V())) {
        if (!t.snapshotId) {
          W.value = "fs-check";
          return;
        }
        try {
          b.value = await k("calc.view"), w.set("fs-check", { state: "done" }), w.set("fs-calc", { state: "done", summary: Ze(b.value) }), W.value = "fs-compare", ae.value = t.summary, ee.value = t.suggestions.map((n) => ({ ...n })), await ke();
        } catch (n) {
          w.fail("fs-calc", n);
        }
      }
    }), e.watch(() => G.value?.session.snapshotId, (t, n) => {
      n && !t && b.value && !D.value && (se("fs-check"), w.set("fs-check", { state: "todo", summary: void 0 }), W.value = "fs-check", V());
    }), h({ pick: c, commit: ie, demo: be, runCalc: xe, runCompare: et, tables: _, form: d }), (t, n) => (e.openBlock(), e.createElementBlock("div", qt, [
      e.createVNode(zt, {
        title: t.$t("时效通报"),
        metas: f,
        runtime: e.unref(F),
        "current-key": e.unref(W),
        onJump: q
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", Yt, [
        e.createCommentVNode(" 1 导入 "),
        e.createVNode(ye, {
          "step-key": "fs-import",
          index: 0,
          title: f[0].title,
          hint: f[0].hint,
          runtime: e.unref(F)["fs-import"],
          "is-current": e.unref(W) === "fs-import"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Ht, [
              e.createElementVNode("div", Gt, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(y, (l) => e.createElementVNode("button", {
                    key: l,
                    type: "button",
                    class: e.normalizeClass({ on: d.kind === l }),
                    "data-test": `fs-kind-${l}`,
                    onClick: (p) => R(l)
                  }, e.toDisplayString(e.unref(Se)(l)), 11, Jt)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]),
              e.createElementVNode("label", Xt, [
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
              e.createElementVNode("label", Qt, [
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
              e.createElementVNode("label", Zt, [
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
                xt,
                e.toDisplayString(t.$t("在途时长算到报表导出那一天")),
                1
                /* TEXT */
              )
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(N), (l) => (e.openBlock(), e.createElementBlock("div", {
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
                    e.toDisplayString(ne(l)),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", el, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(S, (p) => e.createElementVNode("div", {
                      key: p,
                      class: "fs-slot"
                    }, [
                      e.createVNode(ot, {
                        label: p === "flow" ? t.$t("{sys} 流程表（一行一个流程）", { sys: l }) : t.$t("{sys} 节点表（一行一次节点处理）", { sys: l }),
                        hint: p === "flow" ? t.$t("发起人维度的时效报表；一行一个节点的合并表也放这里") : t.$t("处理人维度的时效报表，算个人审核用时要用"),
                        multi: !1,
                        compact: "",
                        disabled: !!D.value,
                        files: _[l][p] ? [{ path: _[l][p].path, name: _[l][p].fileName }] : [],
                        onPicked: (O) => c(l, p, O[0]),
                        onRemove: (O) => _[l][p] = null
                      }, null, 8, ["label", "hint", "disabled", "files", "onPicked", "onRemove"]),
                      _[l][p] ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          _[l][p].combined && p === "flow" ? (e.openBlock(), e.createElementBlock("p", tl, [
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
                          e.createVNode(at, {
                            table: _[l][p],
                            roles: e.unref(He)(p, _[l][p].mapping, !!_[l].flow),
                            onUpdate: (O) => _[l][p].mapping = O,
                            onSheet: (O) => c(l, p, _[l][p].path, O)
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
            e.createElementVNode("div", ll, [
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
              e.createVNode(ot, {
                label: t.$t("中心人员花名册"),
                multi: !1,
                compact: "",
                disabled: !!D.value,
                files: C.value ? [{ path: C.value.path, name: C.value.fileName }] : [],
                onPicked: n[3] || (n[3] = (l) => s(l[0])),
                onRemove: n[4] || (n[4] = (l) => C.value = null)
              }, null, 8, ["label", "disabled", "files"]),
              C.value ? (e.openBlock(), e.createBlock(at, {
                key: 0,
                table: C.value,
                roles: e.unref(He)("roster", C.value.mapping, !1),
                onUpdate: n[5] || (n[5] = (l) => C.value.mapping = l),
                onSheet: n[6] || (n[6] = (l) => s(C.value.path, l))
              }, null, 8, ["table", "roles"])) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("div", nl, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!D.value || !E.value,
                "data-test": "fs-import-commit",
                onClick: ie
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(D.value === "fs-import" ? "ri-loader-4-line spin" : "ri-download-2-line")
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
              ], 8, sl),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!D.value,
                "data-test": "fs-demo",
                onClick: be
              }, [
                n[26] || (n[26] = e.createElementVNode(
                  "i",
                  { class: "ri-magic-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("生成示例数据")),
                  1
                  /* TEXT */
                )
              ], 8, ol),
              o.value ? (e.openBlock(), e.createElementBlock(
                "span",
                al,
                e.toDisplayString(o.value),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            P.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                J.value ? (e.openBlock(), e.createElementBlock("p", rl, [
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
                    e.toDisplayString(J.value),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: n[7] || (n[7] = (l) => e.unref(re)(J.value, !0))
                    },
                    e.toDisplayString(t.$t("打开示例数据所在文件夹")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(P.value.warnings, (l) => (e.openBlock(), e.createElementBlock("p", {
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
                P.value.skipped.length ? (e.openBlock(), e.createElementBlock("div", il, [
                  e.createElementVNode("table", dl, [
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
                          cl,
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
                        e.renderList(P.value.skipped, (l) => (e.openBlock(), e.createElementBlock("tr", {
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
                            ul,
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
        e.createVNode(ye, {
          "step-key": "fs-check",
          index: 1,
          title: f[1].title,
          hint: f[1].hint,
          runtime: e.unref(F)["fs-check"],
          "is-current": e.unref(W) === "fs-check"
        }, {
          default: e.withCtx(() => [
            U.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", pl, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(U.value.counts, (l) => (e.openBlock(), e.createElementBlock("div", {
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
                  e.createElementVNode("div", yl, [
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
                      e.toDisplayString(U.value.rosterCount),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(U.value.rosterCount ? t.$t("个人排名只统计名单里的人") : t.$t("没有花名册：所有审核人都参与排名")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode(
                  "div",
                  gl,
                  e.toDisplayString(t.$t("对不上规则表的流程名（{n} 个）", { n: _e.value.length })),
                  1
                  /* TEXT */
                ),
                U.value.unmatched.length ? (e.openBlock(), e.createElementBlock("div", Nl, [
                  e.createElementVNode("table", El, [
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
                          Vl,
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
                        e.renderList(U.value.unmatched, (l) => (e.openBlock(), e.createElementBlock(
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
                              hl,
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
                                disabled: !!D.value,
                                "data-test": `fs-alias-${l.flowName}`,
                                onChange: (p) => v(l.system, l.flowName, p.target.value)
                              }, [
                                e.createElementVNode(
                                  "option",
                                  fl,
                                  e.toDisplayString(t.$t("— 选择规则细类 —")),
                                  1
                                  /* TEXT */
                                ),
                                l.system !== "CSS" && !l.regular ? (e.openBlock(), e.createElementBlock(
                                  "option",
                                  {
                                    key: 0,
                                    value: yt
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
                                  }, e.toDisplayString(p.category) + " · " + e.toDisplayString(p.flowType), 9, Dl))),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ], 40, kl)
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
                ])) : (e.openBlock(), e.createElementBlock("p", vl, [
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
                Ee.value.length ? (e.openBlock(), e.createElementBlock("p", Sl, [
                  e.createTextVNode(
                    e.toDisplayString(t.$t("已对应：")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(Ee.value, (l) => (e.openBlock(), e.createElementBlock("span", {
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
                        onClick: (p) => v(l.system, l.flowName, "")
                      }, [...n[30] || (n[30] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-close-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, $l)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode(
                  "div",
                  bl,
                  e.toDisplayString(t.$t("没有登记内外部属性的节点（{n} 个）", { n: U.value.unknownNodes.length })),
                  1
                  /* TEXT */
                ),
                U.value.unknownNodes.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 4 },
                  [
                    e.createElementVNode("p", wl, [
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
                    e.createElementVNode("div", Bl, [
                      e.createElementVNode("table", Cl, [
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
                              Tl,
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
                            e.renderList(U.value.unknownNodes, (l) => (e.openBlock(), e.createElementBlock("tr", {
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
                                Ll,
                                e.toDisplayString(l.count),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("td", Al, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-btn sm",
                                  disabled: !!D.value,
                                  "data-test": "fs-node-in",
                                  onClick: (p) => Y(l, !0)
                                }, e.toDisplayString(t.$t("计入")), 9, Fl),
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-btn sm",
                                  disabled: !!D.value,
                                  "data-test": "fs-node-out",
                                  onClick: (p) => Y(l, !1)
                                }, e.toDisplayString(t.$t("不计入")), 9, Ol)
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
                )) : (e.openBlock(), e.createElementBlock("p", _l, [
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
                U.value.decisions.length ? (e.openBlock(), e.createElementBlock("p", Ml, [
                  e.createTextVNode(
                    e.toDisplayString(t.$t("已定：")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(U.value.decisions, (l) => (e.openBlock(), e.createElementBlock("span", {
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
                        onClick: (p) => Y(l, null)
                      }, [...n[33] || (n[33] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-close-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, Rl)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0),
                U.value.outOfRoster.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 6 },
                  [
                    e.createElementVNode(
                      "div",
                      Kl,
                      e.toDisplayString(t.$t("不在花名册里的审核人（{n} 人，不参与个人排名）", { n: U.value.outOfRoster.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("p", Wl, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(U.value.outOfRoster, (l) => (e.openBlock(), e.createElementBlock(
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
                e.createElementVNode("div", Ul, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!D.value,
                    "data-test": "fs-check-done",
                    onClick: x
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
                  ], 8, zl)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              ml,
              e.toDisplayString(t.$t("导入后在这里核对规则对得上对不上")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 3 计算 "),
        e.createVNode(ye, {
          "step-key": "fs-calc",
          index: 2,
          title: f[2].title,
          hint: f[2].hint,
          runtime: e.unref(F)["fs-calc"],
          "is-current": e.unref(W) === "fs-calc"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Il, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!D.value || !U.value,
                "data-test": "fs-calc-run",
                onClick: xe
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(D.value === "fs-calc" ? "ri-loader-4-line spin" : "ri-calculator-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(b.value ? t.$t("重新计算") : t.$t("开始计算")),
                  1
                  /* TEXT */
                )
              ], 8, Pl),
              b.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn",
                disabled: !!D.value,
                "data-test": "fs-calc-export",
                onClick: $t
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
              ], 8, jl)) : e.createCommentVNode("v-if", !0)
            ]),
            b.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                de.value ? (e.openBlock(), e.createElementBlock("p", ql, [
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
                    e.toDisplayString(de.value),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: n[8] || (n[8] = (l) => e.unref(re)(de.value))
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
                      onClick: n[9] || (n[9] = (l) => e.unref(re)(de.value, !0))
                    },
                    e.toDisplayString(t.$t("所在文件夹")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", Yl, [
                  e.createElementVNode("div", Hl, [
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
                      e.toDisplayString(b.value.overall.doneCount),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Gl, [
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
                      e.toDisplayString(e.unref(I)(b.value.overall.avgDays)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Jl, [
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
                      e.toDisplayString(e.unref(H)(b.value.overall.complianceRate)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("超时 {a} / 参与判定 {b}", { a: b.value.overall.overtime, b: b.value.overall.judged })),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Xl, [
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
                      e.toDisplayString(b.value.overall.runningCount),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Ql, [
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
                        class: e.normalizeClass({ "fs-bad": b.value.overall.runningOverdue > 0 })
                      },
                      e.toDisplayString(b.value.overall.runningOverdue),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", Zl, [
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
                        class: e.normalizeClass({ "fs-warn": b.value.overall.runningRisk > 0 })
                      },
                      e.toDisplayString(b.value.overall.runningRisk),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", xl, [
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
                      e.toDisplayString(e.unref(H)(b.value.overall.reviewRate)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t("合规 {a} / 审核 {b} 次", { a: b.value.overall.reviewCompliant, b: b.value.overall.reviewCount })),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                b.value.approxCount ? (e.openBlock(), e.createElementBlock("p", en, [
                  n[37] || (n[37] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("{n} 个 CSS 流程没有节点明细，用时按「结束 − 开始」估算（规则要求只累计内部节点）", { n: b.value.approxCount })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                we.value ? (e.openBlock(), e.createElementBlock("p", tn, [
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
                  ln,
                  e.toDisplayString(t.$t("按大类")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", nn, [
                  e.createElementVNode("table", sn, [
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
                          on,
                          e.toDisplayString(t.$t("办结")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          an,
                          e.toDisplayString(t.$t("平均用时（天）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          rn,
                          e.toDisplayString(t.$t("超时")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          dn,
                          e.toDisplayString(t.$t("合规率")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          cn,
                          e.toDisplayString(t.$t("在途")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          un,
                          e.toDisplayString(t.$t("在途逾期")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          mn,
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
                        e.renderList(b.value.byCategory, (l) => (e.openBlock(), e.createElementBlock("tr", {
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
                            pn,
                            e.toDisplayString(l.doneCount),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            yn,
                            e.toDisplayString(e.unref(I)(l.avgDays)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            gn,
                            e.toDisplayString(l.overtime),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            vn,
                            e.toDisplayString(e.unref(H)(l.complianceRate)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Nn,
                            e.toDisplayString(l.runningCount),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            En,
                            e.toDisplayString(l.runningOverdue),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Vn,
                            e.toDisplayString(e.unref(H)(l.runningOverdueRate)),
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
                  hn,
                  e.toDisplayString(t.$t("按细类（{n} 类）", { n: b.value.byType.length })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", kn, [
                  e.createElementVNode("table", fn, [
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
                          Dn,
                          e.toDisplayString(t.$t("办结")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Sn,
                          e.toDisplayString(t.$t("平均用时（天）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          $n,
                          e.toDisplayString(t.$t("时效要求")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          bn,
                          e.toDisplayString(t.$t("超时")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          _n,
                          e.toDisplayString(t.$t("合规率")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          wn,
                          e.toDisplayString(t.$t("在途")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Bn,
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
                        e.renderList(b.value.byType, (l) => (e.openBlock(), e.createElementBlock(
                          "tr",
                          {
                            key: l.category + l.flowType + l.system,
                            class: e.normalizeClass({ bad: l.complianceRate !== null && l.complianceRate < B.value })
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
                              Cn,
                              e.toDisplayString(l.doneCount),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Tn,
                              e.toDisplayString(e.unref(I)(l.avgDays)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Ln,
                              e.toDisplayString(l.limitDays ?? "-"),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              An,
                              e.toDisplayString(l.overtime),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Fn,
                              e.toDisplayString(e.unref(H)(l.complianceRate)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              On,
                              e.toDisplayString(l.runningCount),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Mn,
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
                e.createElementVNode("div", Rn, [
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "div",
                      Kn,
                      e.toDisplayString(t.$t("审核人合规率排名（{n} 人）", { n: b.value.reviewerRank.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Wn, [
                      e.createElementVNode("table", Un, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              zn,
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
                              In,
                              e.toDisplayString(t.$t("审核次数")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Pn,
                              e.toDisplayString(t.$t("合规率")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              jn,
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
                            e.renderList(b.value.reviewerRank, (l) => (e.openBlock(), e.createElementBlock("tr", {
                              key: l.name
                            }, [
                              e.createElementVNode(
                                "td",
                                qn,
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
                                Yn,
                                e.toDisplayString(l.count),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Hn,
                                e.toDisplayString(e.unref(H)(l.rate)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Gn,
                                e.toDisplayString(e.unref(I)(l.avgDays)),
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
                      Jn,
                      e.toDisplayString(t.$t("发起人合规率排名（{n} 人）", { n: b.value.initiatorRank.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Xn, [
                      e.createElementVNode("table", Qn, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              Zn,
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
                              xn,
                              e.toDisplayString(t.$t("办结数")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              es,
                              e.toDisplayString(t.$t("合规率")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              ts,
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
                            e.renderList(b.value.initiatorRank, (l) => (e.openBlock(), e.createElementBlock("tr", {
                              key: l.name
                            }, [
                              e.createElementVNode(
                                "td",
                                ls,
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
                                ns,
                                e.toDisplayString(l.count),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                ss,
                                e.toDisplayString(e.unref(H)(l.rate)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                os,
                                e.toDisplayString(e.unref(I)(l.avgDays)),
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
                  as,
                  e.toDisplayString(t.$t("本期办结超时（{n} 单）", { n: b.value.overtime.length })),
                  1
                  /* TEXT */
                ),
                e.createVNode(e.unref(Ie), {
                  flows: b.value.overtime,
                  empty: t.$t("本期没有办结超时的流程")
                }, null, 8, ["flows", "empty"]),
                e.createElementVNode(
                  "div",
                  rs,
                  e.toDisplayString(t.$t("在途已逾期与较大逾期风险（{n} 单）", { n: b.value.runningAbnormal.length })),
                  1
                  /* TEXT */
                ),
                e.createVNode(e.unref(Ie), {
                  flows: b.value.runningAbnormal,
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
        e.createVNode(ye, {
          "step-key": "fs-compare",
          index: 3,
          title: f[3].title,
          hint: f[3].hint,
          runtime: e.unref(F)["fs-compare"],
          "is-current": e.unref(W) === "fs-compare"
        }, {
          default: e.withCtx(() => [
            b.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", ds, [
                  z.value && z.value.candidates.length ? (e.openBlock(), e.createElementBlock("label", cs, [
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
                          us,
                          e.toDisplayString(t.$t("自动（上一个同类周期）")),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(z.value.candidates, (l) => (e.openBlock(), e.createElementBlock("option", {
                            key: l.id,
                            value: l.id
                          }, e.toDisplayString(l.label), 9, ms))),
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
                    disabled: !!D.value,
                    "data-test": "fs-compare-run",
                    onClick: et
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(D.value === "fs-compare" ? "ri-loader-4-line spin" : "ri-line-chart-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(z.value ? t.$t("重新分析") : t.$t("环比分析")),
                      1
                      /* TEXT */
                    )
                  ], 8, ps)
                ]),
                z.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    z.value.previous ? (e.openBlock(), e.createElementBlock("div", gs, [
                      e.createElementVNode("div", vs, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("对比周期")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          Ns,
                          e.toDisplayString(z.value.previous.label),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", Es, [
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
                            class: e.normalizeClass(Be(z.value.delta.complianceRate, !0))
                          },
                          e.toDisplayString(e.unref(Pe)(z.value.delta.complianceRate)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("div", Vs, [
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
                            class: e.normalizeClass(Be(z.value.delta.avgDays, !1))
                          },
                          e.toDisplayString(e.unref(Oe)(z.value.delta.avgDays)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("div", hs, [
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
                          e.toDisplayString(e.unref(Oe)(z.value.delta.doneCount)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", ks, [
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
                            class: e.normalizeClass(Be(z.value.delta.runningOverdue, !1))
                          },
                          e.toDisplayString(e.unref(Oe)(z.value.delta.runningOverdue)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("div", fs, [
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
                            class: e.normalizeClass(Be(z.value.delta.reviewRate, !0))
                          },
                          e.toDisplayString(e.unref(Pe)(z.value.delta.reviewRate)),
                          3
                          /* TEXT, CLASS */
                        )
                      ])
                    ])) : (e.openBlock(), e.createElementBlock("p", ys, [
                      n[39] || (n[39] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("还没有上一周期的快照，这一期只按「合规率低于 {p0}」判断异常；下一期起会有环比。", { p0: e.unref(H)(B.value) })),
                        1
                        /* TEXT */
                      )
                    ])),
                    e.createElementVNode(
                      "div",
                      Ds,
                      e.toDisplayString(t.$t("各流程类型环比（异常 {n} 类）", { n: z.value.abnormal.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Ss, [
                      e.createElementVNode("table", $s, [
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
                              bs,
                              e.toDisplayString(t.$t("办结")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              _s,
                              e.toDisplayString(t.$t("平均用时")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              ws,
                              e.toDisplayString(t.$t("上期")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Bs,
                              e.toDisplayString(t.$t("变化")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Cs,
                              e.toDisplayString(t.$t("合规率")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Ts,
                              e.toDisplayString(t.$t("上期")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Ls,
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
                            e.renderList(z.value.types, (l) => (e.openBlock(), e.createElementBlock(
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
                                  As,
                                  e.toDisplayString(l.doneCount),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Fs,
                                  e.toDisplayString(e.unref(I)(l.avgDays)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Os,
                                  e.toDisplayString(e.unref(I)(l.prevAvgDays)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Ms,
                                  e.toDisplayString(e.unref(Oe)(l.avgDelta)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Rs,
                                  e.toDisplayString(e.unref(H)(l.complianceRate)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Ks,
                                  e.toDisplayString(e.unref(H)(l.prevComplianceRate)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Ws,
                                  e.toDisplayString(e.unref(Pe)(l.rateDelta)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Us,
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
                      e.renderList(z.value.abnormal, (l) => (e.openBlock(), e.createElementBlock("div", {
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
                            zs,
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
                          l.analysis.longestNode ? (e.openBlock(), e.createElementBlock("span", Is, [
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
                        l.analysis.nodes.length ? (e.openBlock(), e.createElementBlock("div", js, [
                          e.createElementVNode("table", qs, [
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
                                  Ys,
                                  e.toDisplayString(t.$t("处理次数")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Hs,
                                  e.toDisplayString(t.$t("平均耗时（天）")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Gs,
                                  e.toDisplayString(t.$t("最长（天）")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Js,
                                  e.toDisplayString(t.$t("平均等待（天）")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Xs,
                                  e.toDisplayString(t.$t("耗时占比")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Qs,
                                  e.toDisplayString(t.$t("在途停留数")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Zs,
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
                                      xs,
                                      e.toDisplayString(p.count),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      eo,
                                      e.toDisplayString(e.unref(I)(p.avgDays)),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      to,
                                      e.toDisplayString(e.unref(I)(p.maxDays)),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      lo,
                                      e.toDisplayString(e.unref(I)(p.avgWaitDays)),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      no,
                                      e.toDisplayString(e.unref(H)(p.share)),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      so,
                                      e.toDisplayString(p.stuckCount),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "td",
                                      oo,
                                      e.toDisplayString(e.unref(I)(p.avgStuckDays)),
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
                          Ps,
                          e.toDisplayString(t.$t("这一类流程没有节点明细，定位不到具体节点")),
                          1
                          /* TEXT */
                        ))
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    b.value.period.kind === "monthly" ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 2 },
                      [
                        e.createElementVNode(
                          "div",
                          ao,
                          e.toDisplayString(t.$t("本年度发起、仍未办结且已超时的在途流程（{n} 单）", { n: z.value.yearOverdue.length })),
                          1
                          /* TEXT */
                        ),
                        e.createVNode(e.unref(Ie), {
                          flows: z.value.yearOverdue,
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
              is,
              e.toDisplayString(t.$t("计算完成后在这里和上一周期对比")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 5 原因 "),
        e.createVNode(ye, {
          "step-key": "fs-reason",
          index: 4,
          title: f[4].title,
          hint: f[4].hint,
          runtime: e.unref(F)["fs-reason"],
          "is-current": e.unref(W) === "fs-reason"
        }, {
          default: e.withCtx(() => [
            b.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                X.value.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    e.createVNode(e.unref(st)),
                    e.createElementVNode(
                      "div",
                      co,
                      e.toDisplayString(t.$t("按责任人发原因收集邮件（{a} 人，{b} 个流程）", { a: ce.value.length, b: X.value.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", uo, [
                      e.createElementVNode("table", mo, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode("th", null, [
                              e.createElementVNode("input", {
                                type: "checkbox",
                                checked: bt.value,
                                onChange: n[11] || (n[11] = (l) => _t(l.target.checked))
                              }, null, 40, po)
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
                              yo,
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
                            e.renderList(ce.value, (l) => (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              {
                                key: l.owner
                              },
                              [
                                e.createElementVNode("tr", null, [
                                  e.createElementVNode("td", null, [
                                    e.withDirectives(e.createElementVNode("input", {
                                      "onUpdate:modelValue": n[12] || (n[12] = (p) => Q.value = p),
                                      type: "checkbox",
                                      value: l.owner,
                                      disabled: !l.email
                                    }, null, 8, go), [
                                      [e.vModelCheckbox, Q.value]
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
                                    vo,
                                    e.toDisplayString(l.count),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode("td", null, [
                                    e.createElementVNode("input", {
                                      type: "text",
                                      value: l.email,
                                      placeholder: t.$t("花名册里没有邮箱，可在这里补"),
                                      onChange: (p) => wt(l.owner, p.target.value)
                                    }, null, 40, No)
                                  ]),
                                  e.createElementVNode("td", null, [
                                    l.mailedAt ? (e.openBlock(), e.createElementBlock(
                                      "span",
                                      Eo,
                                      e.toDisplayString(t.$t("已发 {p0}", { p0: e.unref(j.fmtDateTime)(l.mailedAt) })),
                                      1
                                      /* TEXT */
                                    )) : l.email ? (e.openBlock(), e.createElementBlock(
                                      "span",
                                      ho,
                                      e.toDisplayString(t.$t("未发")),
                                      1
                                      /* TEXT */
                                    )) : (e.openBlock(), e.createElementBlock(
                                      "span",
                                      Vo,
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
                                    }, e.toDisplayString(Ce.value === l.owner ? t.$t("收起") : t.$t("预览邮件")), 9, ko)
                                  ])
                                ]),
                                Ce.value === l.owner ? (e.openBlock(), e.createElementBlock("tr", fo, [
                                  e.createElementVNode("td", Do, [
                                    e.createElementVNode("div", So, [
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
                    e.createElementVNode("div", $o, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn primary",
                        disabled: !!D.value || !Q.value.length,
                        "data-test": "fs-reason-send",
                        onClick: Bt
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(D.value === "fs-reason-send" ? "ri-loader-4-line spin" : "ri-mail-send-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("发送给所选的 {n} 人", { n: Q.value.length })),
                          1
                          /* TEXT */
                        )
                      ], 8, bo),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn",
                        disabled: !!D.value,
                        onClick: Ct
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
                      ], 8, _o),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn",
                        disabled: !!D.value,
                        onClick: Tt
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
                      ], 8, wo)
                    ]),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(Ve.value, (l) => (e.openBlock(), e.createElementBlock(
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
                    he.value ? (e.openBlock(), e.createElementBlock("p", Bo, [
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
                        e.toDisplayString(he.value),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: "ss-link",
                          onClick: n[13] || (n[13] = (l) => e.unref(re)(he.value))
                        },
                        e.toDisplayString(t.$t("打开")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "div",
                      Co,
                      e.toDisplayString(t.$t("原因回填与归类（已填 {a} / {b}）", { a: ue.value, b: X.value.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", To, [
                      e.createElementVNode("table", Lo, [
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
                              Ao,
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
                            e.renderList(X.value, (l) => (e.openBlock(), e.createElementBlock("tr", {
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
                                Fo,
                                e.toDisplayString(e.unref(I)(l.overdueDays)),
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
                                  onChange: (p) => Lt(l.key, p.target.value)
                                }, null, 40, Oo)
                              ]),
                              e.createElementVNode("td", null, [
                                e.createElementVNode("select", {
                                  value: l.categoryId,
                                  disabled: !l.reason,
                                  onChange: (p) => At(l.key, p.target.value)
                                }, [
                                  e.createElementVNode(
                                    "option",
                                    Ro,
                                    e.toDisplayString(t.$t("未归类")),
                                    1
                                    /* TEXT */
                                  ),
                                  (e.openBlock(!0), e.createElementBlock(
                                    e.Fragment,
                                    null,
                                    e.renderList(e.unref(m), (p) => (e.openBlock(), e.createElementBlock("option", {
                                      key: p,
                                      value: p
                                    }, e.toDisplayString(e.unref(pt)(p)), 9, Ko))),
                                    128
                                    /* KEYED_FRAGMENT */
                                  ))
                                ], 40, Mo)
                              ])
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ])
                    ]),
                    e.createElementVNode("div", Wo, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn",
                        disabled: !!D.value || !ue.value,
                        "data-test": "fs-classify-rule",
                        onClick: n[14] || (n[14] = (l) => lt(!1))
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(D.value === "fs-classify" ? "ri-loader-4-line spin" : "ri-price-tag-3-line")
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
                      ], 8, Uo),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn",
                        disabled: !!D.value || !ue.value,
                        onClick: n[15] || (n[15] = (l) => lt(!0))
                      }, [
                        n[47] || (n[47] = e.createElementVNode(
                          "i",
                          { class: "ri-sparkling-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("用模型归类并写根因")),
                          1
                          /* TEXT */
                        )
                      ], 8, zo),
                      e.createElementVNode(
                        "span",
                        Io,
                        e.toDisplayString(t.$t("模型只在固定的七类里选，不算任何数字；它写的话里出现材料里没有的数字会被去掉")),
                        1
                        /* TEXT */
                      )
                    ]),
                    tt.value.length ? (e.openBlock(), e.createElementBlock("div", Po, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(tt.value, (l) => (e.openBlock(), e.createElementBlock("label", {
                          key: l.id,
                          class: "ss-field"
                        }, [
                          e.createElementVNode("span", null, [
                            e.createElementVNode(
                              "b",
                              null,
                              e.toDisplayString(e.unref(pt)(l.id)),
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
                            onChange: (p) => Ft(l.id, p.target.value)
                          }, null, 40, jo)
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : (e.openBlock(), e.createElementBlock("p", io, [
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
                e.createElementVNode("div", qo, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!D.value,
                    "data-test": "fs-reason-done",
                    onClick: Ot
                  }, [
                    n[48] || (n[48] = e.createElementVNode(
                      "i",
                      { class: "ri-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(X.value.length && ue.value < X.value.length ? t.$t("先按已收到的继续（还有 {n} 个没填）", { n: X.value.length - ue.value }) : t.$t("原因收集完成")),
                      1
                      /* TEXT */
                    )
                  ], 8, Yo)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              ro,
              e.toDisplayString(t.$t("计算完成后在这里收集超时原因")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 6 通报 "),
        e.createVNode(ye, {
          "step-key": "fs-report",
          index: 5,
          title: f[5].title,
          hint: f[5].hint,
          runtime: e.unref(F)["fs-report"],
          "is-current": e.unref(W) === "fs-report"
        }, {
          default: e.withCtx(() => [
            b.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", Go, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: !!D.value,
                    "data-test": "fs-draft-rule",
                    onClick: n[16] || (n[16] = (l) => nt(!1))
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(D.value === "fs-draft" ? "ri-loader-4-line spin" : "ri-file-text-line")
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
                  ], 8, Jo),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: !!D.value,
                    onClick: n[17] || (n[17] = (l) => nt(!0))
                  }, [
                    n[49] || (n[49] = e.createElementVNode(
                      "i",
                      { class: "ri-sparkling-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("用模型起草")),
                      1
                      /* TEXT */
                    )
                  ], 8, Xo),
                  Le.value ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Qo,
                    e.toDisplayString(Le.value),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("label", Zo, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(b.value.period.kind === "monthly" ? t.$t("月度总结（整体表现 / 异常趋势 / 重点问题 / 责任维度）") : t.$t("小结（可留空）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": n[18] || (n[18] = (l) => ae.value = l),
                      rows: "8",
                      "data-test": "fs-summary"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, ae.value]
                  ])
                ]),
                b.value.period.kind === "monthly" ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode(
                      "div",
                      xo,
                      e.toDisplayString(t.$t("改善建议（{n} 条，发送月报时记入改善台账）", { n: ee.value.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", ea, [
                      e.createElementVNode("table", ta, [
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
                            e.renderList(ee.value, (l, p) => (e.openBlock(), e.createElementBlock("tr", { key: p }, [
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (O) => l.item = O,
                                  type: "text",
                                  class: "fs-wide"
                                }, null, 8, la), [
                                  [e.vModelText, l.item]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (O) => l.dept = O,
                                  type: "text"
                                }, null, 8, na), [
                                  [e.vModelText, l.dept]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (O) => l.owner = O,
                                  type: "text"
                                }, null, 8, sa), [
                                  [e.vModelText, l.owner]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (O) => l.requirement = O,
                                  type: "text",
                                  class: "fs-wide"
                                }, null, 8, oa), [
                                  [e.vModelText, l.requirement]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (O) => l.deadline = O,
                                  type: "date"
                                }, null, 8, aa), [
                                  [e.vModelText, l.deadline]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (O) => l.acceptance = O,
                                  type: "text",
                                  class: "fs-wide"
                                }, null, 8, ra), [
                                  [e.vModelText, l.acceptance]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-link",
                                  onClick: (O) => ee.value.splice(p, 1)
                                }, e.toDisplayString(t.$t("删除")), 9, ia)
                              ])
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ])
                    ]),
                    e.createElementVNode("div", da, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm",
                        onClick: n[19] || (n[19] = (l) => ee.value.push({ item: "", dept: "", owner: "", requirement: "", deadline: "", acceptance: "" }))
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
                e.createElementVNode("div", ca, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!D.value,
                    "data-test": "fs-report-build",
                    onClick: Mt
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(D.value === "fs-report-build" ? "ri-loader-4-line spin" : "ri-file-chart-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(te.value ? t.$t("重新生成通报") : t.$t("生成通报并预览")),
                      1
                      /* TEXT */
                    )
                  ], 8, ua)
                ]),
                te.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(te.value.files, (l) => (e.openBlock(), e.createElementBlock("p", {
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
                          onClick: (p) => e.unref(re)(l.path)
                        }, e.toDisplayString(t.$t("打开")), 9, ma),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (p) => e.unref(re)(l.path, !0)
                        }, e.toDisplayString(t.$t("所在文件夹")), 9, pa)
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode(
                      "div",
                      ya,
                      e.toDisplayString(te.value.kind === "monthly" ? t.$t("分析报告预览（附件 PDF 的内容）") : t.$t("通报预览（附件网页版的内容）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("iframe", {
                      class: "fs-preview",
                      sandbox: "",
                      srcdoc: te.value.html,
                      title: t.$t("通报预览"),
                      "data-test": "fs-preview"
                    }, null, 8, ga),
                    e.createVNode(e.unref(st)),
                    e.createElementVNode("label", va, [
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
                    e.createElementVNode("label", Na, [
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
                    e.createElementVNode("label", Ea, [
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
                          "onUpdate:modelValue": n[22] || (n[22] = (l) => me.value = l),
                          rows: "2",
                          placeholder: "a@example.com; b@example.com",
                          "data-test": "fs-recipients"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, me.value]
                      ])
                    ]),
                    pe.value.bad.length ? (e.openBlock(), e.createElementBlock("p", Va, [
                      n[53] || (n[53] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("这些地址写得不对：{p0}", { p0: pe.value.bad.join("、") })),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode("div", ha, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn primary",
                        disabled: !!D.value || !pe.value.ok || pe.value.bad.length > 0,
                        "data-test": "fs-report-send",
                        onClick: Rt
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(D.value === "fs-report-send" ? "ri-loader-4-line spin" : "ri-mail-send-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("发送给 {n} 位收件人", { n: pe.value.ok })),
                          1
                          /* TEXT */
                        )
                      ], 8, ka),
                      te.value.kind === "monthly" && !M.value?.ledgerWritten && ee.value.length ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-btn",
                        disabled: !!D.value,
                        onClick: Kt
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
                      ], 8, fa)) : e.createCommentVNode("v-if", !0),
                      M.value?.sentAt ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Da,
                        e.toDisplayString(t.$t("已发送 {p0}", { p0: e.unref(j.fmtDateTime)(M.value.sentAt) })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      M.value?.ledgerWritten ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Sa,
                        e.toDisplayString(t.$t("改善建议已记入台账")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]),
                    fe.value ? (e.openBlock(), e.createElementBlock("p", $a, [
                      n[55] || (n[55] = e.createElementVNode(
                        "i",
                        { class: "ri-checkbox-circle-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(fe.value),
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
              Ho,
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
}), Ne = (u, h) => {
  const y = u.__vccOpts || u;
  for (const [N, S] of h)
    y[N] = S;
  return y;
}, _a = /* @__PURE__ */ Ne(ba, [["__scopeId", "data-v-19fd98c1"]]), Xe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/core"];
if (!Xe) throw new Error("宿主模块未就绪：npm:echarts/core");
Xe.default;
const Qe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/renderers"];
if (!Qe) throw new Error("宿主模块未就绪：npm:echarts/renderers");
Qe.default;
const We = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/charts"];
if (!We) throw new Error("宿主模块未就绪：npm:echarts/charts");
We.default;
const ve = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/components"];
if (!ve) throw new Error("宿主模块未就绪：npm:echarts/components");
ve.default;
const St = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-echarts"];
if (!St) throw new Error("宿主模块未就绪：npm:vue-echarts");
const gt = St.default, wa = { class: "fs-board" }, Ba = {
  key: 0,
  class: "ss-note danger"
}, Ca = {
  key: 1,
  class: "ss-empty",
  "data-test": "fs-board-empty"
}, Ta = { class: "ss-actions fs-filters" }, La = { class: "ss-field inline" }, Aa = ["value"], Fa = { class: "ss-field inline" }, Oa = { value: "" }, Ma = ["value"], Ra = { class: "ss-field inline" }, Ka = { value: "" }, Wa = ["value"], Ua = { class: "ss-field inline" }, za = { value: "" }, Ia = ["value"], Pa = { class: "ss-field inline" }, ja = { value: "" }, qa = ["value"], Ya = {
  key: 1,
  class: "ri-loader-4-line spin"
}, Ha = {
  key: 0,
  class: "ss-kpis",
  "data-test": "fs-board-kpis"
}, Ga = { class: "ss-kpi" }, Ja = { class: "ss-kpi" }, Xa = { class: "ss-kpi accent" }, Qa = { class: "ss-kpi" }, Za = { class: "ss-kpi" }, xa = { class: "ss-kpi" }, er = { class: "ss-kpi accent" }, tr = { class: "fs-charts" }, lr = { class: "fs-card" }, nr = { class: "fs-seg" }, sr = ["onClick"], or = {
  key: 0,
  class: "ss-empty"
}, ar = { class: "ss-muted" }, rr = { class: "fs-card" }, ir = { class: "ss-muted" }, dr = {
  key: 0,
  class: "ss-empty"
}, cr = { class: "fs-card" }, ur = { class: "ss-table-wrap fs-scroll" }, mr = { class: "ss-table" }, pr = { class: "num" }, yr = { class: "num" }, gr = { class: "num" }, vr = { class: "num" }, Nr = { class: "num" }, Er = { class: "num" }, Vr = ["onClick"], hr = { class: "num" }, kr = { class: "num" }, fr = { class: "num" }, Dr = { class: "num" }, Sr = { class: "num" }, $r = { class: "num" }, br = { class: "ss-muted" }, _r = { class: "fs-card" }, wr = { class: "ss-muted" }, Br = { class: "ss-table-wrap fs-scroll" }, Cr = { class: "ss-table" }, Tr = { class: "num" }, Lr = { class: "num" }, Ar = { class: "num" }, Fr = { class: "num" }, Or = { class: "num" }, Mr = { class: "num" }, Rr = { class: "num" }, Kr = { class: "num" }, Wr = { class: "num" }, Ur = { class: "num" }, zr = { class: "fs-card" }, Ir = { class: "ss-muted" }, Pr = { class: "ss-field inline fs-only" }, jr = { class: "ss-table-wrap fs-scroll tall" }, qr = { class: "ss-table" }, Yr = { class: "num" }, Hr = { class: "num" }, Gr = { class: "num" }, Jr = { class: "num" }, Xr = { class: "num" }, Qr = { class: "num" }, Zr = {
  key: 3,
  class: "ss-note"
}, xr = /* @__PURE__ */ e.defineComponent({
  __name: "BoardTab",
  setup(u) {
    Xe.use([Qe.CanvasRenderer, We.BarChart, We.LineChart, ve.GridComponent, ve.TooltipComponent, ve.LegendComponent, ve.MarkLineComponent]);
    const h = ["weekly", "monthly"], y = e.ref(null), N = e.ref(!1), S = e.ref(""), m = e.reactive({ snapshotId: "", system: "", category: "", flowType: "", dept: "" }), T = e.ref("weekly"), $ = e.ref(!1), M = e.computed(() => G.value?.snapshots ?? []), B = e.computed(() => G.value?.thresholds.minComplianceRate ?? 0.95), f = e.computed(() => !!(m.system || m.category || m.flowType || m.dept));
    let w = 0, F = "";
    const W = () => JSON.stringify(m);
    async function D() {
      const s = ++w;
      F = W(), N.value = !0;
      try {
        const r = await k("board.get", m);
        if (s !== w) return;
        y.value = r, S.value = "", r.snapshot && m.snapshotId !== r.snapshot.id && (m.snapshotId = r.snapshot.id, T.value = r.snapshot.kind, F = W()), m.flowType && !r.options.flowTypes.includes(m.flowType) && (m.flowType = "");
      } catch (r) {
        s === w && (S.value = j.errorMessage(r));
      } finally {
        s === w && (N.value = !1);
      }
    }
    e.watch(m, () => {
      W() !== F && D();
    }), e.watch(() => `${M.value[0]?.id}|${M.value.length}|${M.value.map((s) => s.savedAt).join()}`, () => {
      m.snapshotId = "", D();
    }), e.onMounted(D);
    function L() {
      Object.assign(m, { system: "", category: "", flowType: "", dept: "" });
    }
    function q(s) {
      Object.assign(m, { system: s.system, category: s.category, flowType: s.flowType });
    }
    async function d() {
      const s = y.value?.snapshot;
      if (!(!s || !window.confirm(a.t("删除「{p0}」这个周期的快照？趋势里也不再有它。", { p0: s.label }))))
        try {
          await k("snapshot.remove", { id: s.id });
        } catch (r) {
          S.value = j.errorMessage(r);
        }
    }
    const R = e.computed(() => (y.value?.flows ?? []).filter((s) => !$.value || s.overtime === !0 || s.runningLabel === "overdue")), _ = e.computed(() => (y.value?.trend ?? []).filter((s) => s.kind === T.value).slice(-16)), C = e.computed(() => [...y.value?.byType ?? []].filter((s) => s.doneCount > 0 && s.complianceRate !== null).sort((s, r) => r.doneCount - s.doneCount).slice(0, 12).reverse());
    function P(s, r) {
      try {
        return getComputedStyle(document.documentElement).getPropertyValue(s).trim() || r;
      } catch {
        return r;
      }
    }
    const J = e.computed(() => ({ brand: P("--color-brand", "#3b6cf6"), warn: P("--color-warning", "#f59e0b"), bad: P("--color-danger", "#e5484d"), axis: P("--color-text-secondary", "#8a8fa3"), grid: P("--color-border", "#e6e8ef") })), ne = e.computed(() => {
      const s = J.value, r = _.value;
      return {
        tooltip: { trigger: "axis" },
        legend: { data: [a.t("合规率（%）"), a.t("平均用时（天）")], textStyle: { color: s.axis }, top: 0 },
        grid: { left: 44, right: 44, top: 34, bottom: 28 },
        xAxis: { type: "category", data: r.map((o) => o.label), axisLabel: { color: s.axis, fontSize: 10, hideOverlap: !0 }, axisLine: { lineStyle: { color: s.grid } } },
        yAxis: [
          { type: "value", max: 100, min: (o) => Math.max(0, Math.floor((o.min - 5) / 5) * 5), axisLabel: { color: s.axis, formatter: "{value}%" }, splitLine: { lineStyle: { color: s.grid } } },
          { type: "value", axisLabel: { color: s.axis }, splitLine: { show: !1 } }
        ],
        series: [
          {
            name: a.t("合规率（%）"),
            type: "line",
            data: r.map((o) => o.complianceRate == null ? null : Math.round(o.complianceRate * 1e3) / 10),
            itemStyle: { color: s.brand },
            lineStyle: { color: s.brand },
            connectNulls: !0,
            markLine: { silent: !0, symbol: "none", lineStyle: { color: s.bad, type: "dashed" }, label: { formatter: H(B.value), color: s.bad }, data: [{ yAxis: Math.round(B.value * 1e3) / 10 }] }
          },
          { name: a.t("平均用时（天）"), type: "line", yAxisIndex: 1, data: r.map((o) => o.avgDays), itemStyle: { color: s.warn }, lineStyle: { color: s.warn }, connectNulls: !0 }
        ]
      };
    }), c = e.computed(() => {
      const s = J.value, r = C.value;
      return {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: 8, right: 52, top: 8, bottom: 8, containLabel: !0 },
        xAxis: { type: "value", max: 100, axisLabel: { color: s.axis, formatter: "{value}%" }, splitLine: { lineStyle: { color: s.grid } } },
        yAxis: { type: "category", data: r.map((o) => o.flowType.length > 14 ? `${o.flowType.slice(0, 13)}…` : o.flowType), axisLabel: { color: s.axis, fontSize: 11 }, axisLine: { lineStyle: { color: s.grid } } },
        series: [{
          type: "bar",
          barMaxWidth: 16,
          data: r.map((o) => ({ value: Math.round(o.complianceRate * 1e3) / 10, itemStyle: { color: o.complianceRate < B.value ? s.bad : s.brand, borderRadius: 3 } })),
          label: { show: !0, position: "right", formatter: "{c}%", color: s.axis, fontSize: 11 },
          markLine: { silent: !0, symbol: "none", lineStyle: { color: s.warn, type: "dashed" }, label: { show: !1 }, data: [{ xAxis: Math.round(B.value * 1e3) / 10 }] }
        }]
      };
    });
    return (s, r) => (e.openBlock(), e.createElementBlock("div", wa, [
      S.value ? (e.openBlock(), e.createElementBlock("p", Ba, [
        r[6] || (r[6] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0),
      y.value && !y.value.snapshot ? (e.openBlock(), e.createElementBlock(
        "p",
        Ca,
        e.toDisplayString(s.$t("还没有周期快照。在「通报」页走到第 3 步「计算」，每算一个周期就会存一份，看板从这里取数。")),
        1
        /* TEXT */
      )) : y.value && y.value.snapshot ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createElementVNode("div", Ta, [
            e.createElementVNode("label", La, [
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
                  "onUpdate:modelValue": r[0] || (r[0] = (o) => m.snapshotId = o),
                  "data-test": "fs-board-period"
                },
                [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(M.value, (o) => (e.openBlock(), e.createElementBlock("option", {
                      key: o.id,
                      value: o.id
                    }, e.toDisplayString(e.unref(Se)(o.kind)) + " · " + e.toDisplayString(o.label), 9, Aa))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, m.snapshotId]
              ])
            ]),
            e.createElementVNode("label", Fa, [
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
                  "onUpdate:modelValue": r[1] || (r[1] = (o) => m.system = o),
                  "data-test": "fs-board-system"
                },
                [
                  e.createElementVNode(
                    "option",
                    Oa,
                    e.toDisplayString(s.$t("全部")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.options.systems, (o) => (e.openBlock(), e.createElementBlock("option", {
                      key: o,
                      value: o
                    }, e.toDisplayString(o), 9, Ma))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, m.system]
              ])
            ]),
            e.createElementVNode("label", Ra, [
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
                  "onUpdate:modelValue": r[2] || (r[2] = (o) => m.category = o)
                },
                [
                  e.createElementVNode(
                    "option",
                    Ka,
                    e.toDisplayString(s.$t("全部")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.options.categories, (o) => (e.openBlock(), e.createElementBlock("option", {
                      key: o,
                      value: o
                    }, e.toDisplayString(o), 9, Wa))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, m.category]
              ])
            ]),
            e.createElementVNode("label", Ua, [
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
                  "onUpdate:modelValue": r[3] || (r[3] = (o) => m.flowType = o)
                },
                [
                  e.createElementVNode(
                    "option",
                    za,
                    e.toDisplayString(s.$t("全部")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.options.flowTypes, (o) => (e.openBlock(), e.createElementBlock("option", {
                      key: o,
                      value: o
                    }, e.toDisplayString(o), 9, Ia))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, m.flowType]
              ])
            ]),
            e.createElementVNode("label", Pa, [
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
                  "onUpdate:modelValue": r[4] || (r[4] = (o) => m.dept = o)
                },
                [
                  e.createElementVNode(
                    "option",
                    ja,
                    e.toDisplayString(s.$t("全部")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.value.options.depts, (o) => (e.openBlock(), e.createElementBlock("option", {
                      key: o,
                      value: o
                    }, e.toDisplayString(o), 9, qa))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, m.dept]
              ])
            ]),
            f.value ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-link",
                onClick: L
              },
              e.toDisplayString(s.$t("清除筛选")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            N.value ? (e.openBlock(), e.createElementBlock("i", Ya)) : e.createCommentVNode("v-if", !0),
            r[7] || (r[7] = e.createElementVNode(
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
          y.value.overall ? (e.openBlock(), e.createElementBlock("div", Ha, [
            e.createElementVNode("div", Ga, [
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
            e.createElementVNode("div", Ja, [
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
                e.toDisplayString(e.unref(I)(y.value.overall.avgDays)),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Xa, [
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
                e.toDisplayString(e.unref(H)(y.value.overall.complianceRate)),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Qa, [
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
            e.createElementVNode("div", Za, [
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
            e.createElementVNode("div", xa, [
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
            e.createElementVNode("div", er, [
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
                e.toDisplayString(e.unref(H)(y.value.overall.reviewRate)),
                1
                /* TEXT */
              )
            ])
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", tr, [
            e.createElementVNode("section", lr, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(s.$t("合规率与平均用时趋势")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", nr, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(h, (o) => e.createElementVNode("button", {
                      key: o,
                      type: "button",
                      class: e.normalizeClass({ on: T.value === o }),
                      onClick: (E) => T.value = o
                    }, e.toDisplayString(e.unref(Se)(o)), 11, sr)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ]),
              _.value.length < 2 ? (e.openBlock(), e.createElementBlock(
                "p",
                or,
                e.toDisplayString(s.$t("存了两个以上的{p0}周期后显示趋势", { p0: e.unref(Se)(T.value) })),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createBlock(e.unref(gt), {
                key: 1,
                class: "fs-chart",
                option: ne.value,
                autoresize: ""
              }, null, 8, ["option"])),
              e.createElementVNode(
                "p",
                ar,
                e.toDisplayString(s.$t("趋势用的是各周期保存时的整体数字，不随上面的筛选变化")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("section", rr, [
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
                  ir,
                  e.toDisplayString(s.$t("办结数最多的前 {n} 类", { n: C.value.length })),
                  1
                  /* TEXT */
                )
              ]),
              C.value.length ? (e.openBlock(), e.createBlock(e.unref(gt), {
                key: 1,
                class: "fs-chart",
                option: c.value,
                autoresize: ""
              }, null, 8, ["option"])) : (e.openBlock(), e.createElementBlock(
                "p",
                dr,
                e.toDisplayString(s.$t("这个筛选条件下没有办结的流程")),
                1
                /* TEXT */
              ))
            ])
          ]),
          e.createElementVNode("section", cr, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(s.$t("按细类")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", ur, [
              e.createElementVNode("table", mr, [
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
                      pr,
                      e.toDisplayString(s.$t("办结")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      yr,
                      e.toDisplayString(s.$t("平均用时（天）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      gr,
                      e.toDisplayString(s.$t("时效要求")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      vr,
                      e.toDisplayString(s.$t("合规率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Nr,
                      e.toDisplayString(s.$t("在途")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Er,
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
                    e.renderList(y.value.byType, (o) => (e.openBlock(), e.createElementBlock("tr", {
                      key: o.category + o.flowType + o.system,
                      class: e.normalizeClass(["fs-click", { bad: o.complianceRate !== null && o.complianceRate < B.value }]),
                      onClick: (E) => q(o)
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.category),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.flowType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.system),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        hr,
                        e.toDisplayString(o.doneCount),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        kr,
                        e.toDisplayString(e.unref(I)(o.avgDays)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        fr,
                        e.toDisplayString(o.limitDays ?? "-"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Dr,
                        e.toDisplayString(e.unref(H)(o.complianceRate)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Sr,
                        e.toDisplayString(o.runningCount),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        $r,
                        e.toDisplayString(o.runningOverdue),
                        1
                        /* TEXT */
                      )
                    ], 10, Vr))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ]),
            e.createElementVNode(
              "p",
              br,
              e.toDisplayString(s.$t("点一行只看这一类的流程明细")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("section", _r, [
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
                wr,
                e.toDisplayString(s.$t("{n} 人", { n: y.value.reviewerRank.length })),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Br, [
              e.createElementVNode("table", Cr, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      Tr,
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
                      Lr,
                      e.toDisplayString(s.$t("审核次数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Ar,
                      e.toDisplayString(s.$t("合规")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Fr,
                      e.toDisplayString(s.$t("合规率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Or,
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
                    e.renderList(y.value.reviewerRank, (o) => (e.openBlock(), e.createElementBlock("tr", {
                      key: o.name
                    }, [
                      e.createElementVNode(
                        "td",
                        Mr,
                        e.toDisplayString(o.rank),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.name),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.dept),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.identity),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Rr,
                        e.toDisplayString(o.count),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Kr,
                        e.toDisplayString(o.compliant),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Wr,
                        e.toDisplayString(e.unref(H)(o.rate)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Ur,
                        e.toDisplayString(e.unref(I)(o.avgDays)),
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
          e.createElementVNode("section", zr, [
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
                Ir,
                e.toDisplayString(y.value.flowTotal > y.value.flows.length ? s.$t("共 {a} 单，这里列前 {b} 单；全部明细在「通报」第 3 步导出", { a: y.value.flowTotal, b: y.value.flows.length }) : s.$t("共 {a} 单", { a: y.value.flowTotal })),
                1
                /* TEXT */
              ),
              e.createElementVNode("label", Pr, [
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[5] || (r[5] = (o) => $.value = o),
                    type: "checkbox"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelCheckbox, $.value]
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
            e.createElementVNode("div", jr, [
              e.createElementVNode("table", qr, [
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
                      Yr,
                      e.toDisplayString(s.$t("用时（天）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Hr,
                      e.toDisplayString(s.$t("时效要求")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Gr,
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
                    e.renderList(R.value, (o) => (e.openBlock(), e.createElementBlock("tr", {
                      key: o.system + o.flowNo
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.system),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.flowNo),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.flowType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.initiator),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.dept),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", e.unref(Dt)(o)])
                          },
                          e.toDisplayString(e.unref(ft)(o)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        Jr,
                        e.toDisplayString(e.unref(I)(o.days)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Xr,
                        e.toDisplayString(o.limitDays ?? "-"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Qr,
                        e.toDisplayString(o.overdueDays ? e.unref(I)(o.overdueDays) : "-"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.currentNode),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.currentHandler),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(Ke)(o.startAt)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(Ke)(o.endAt)),
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
      )) : S.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Zr, [
        r[8] || (r[8] = e.createElementVNode(
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
}), ei = /* @__PURE__ */ Ne(xr, [["__scopeId", "data-v-e45cd2ef"]]), ti = { class: "fs-track" }, li = { class: "ss-kpis" }, ni = { class: "ss-kpi" }, si = { "data-test": "fs-track-open" }, oi = { class: "ss-kpi" }, ai = { class: "ss-kpi" }, ri = { class: "ss-kpi" }, ii = { class: "ss-kpi" }, di = { class: "ss-note info" }, ci = {
  key: 0,
  class: "ss-note danger"
}, ui = { class: "ss-actions" }, mi = { class: "fs-seg" }, pi = ["data-test", "onClick"], yi = { class: "ss-field inline" }, gi = ["placeholder"], vi = ["disabled"], Ni = {
  key: 1,
  class: "ss-empty"
}, Ei = ["data-test"], Vi = { class: "ss-chip" }, hi = {
  key: 0,
  class: "ss-muted"
}, ki = {
  key: 1,
  class: "ss-chip ok"
}, fi = {
  key: 2,
  class: "ss-chip bad"
}, Di = {
  key: 3,
  class: "ss-chip"
}, Si = { class: "fs-facts" }, $i = { class: "bad" }, bi = { key: 0 }, _i = { class: "fs-notes" }, wi = { key: 0 }, Bi = ["onClick"], Ci = { class: "ss-actions" }, Ti = ["onUpdate:modelValue", "placeholder", "data-test", "onKeydown"], Li = ["disabled", "data-test", "onClick"], Ai = ["disabled", "onClick"], Fi = ["disabled", "onClick"], Oi = {
  key: 0,
  class: "fs-mailbox"
}, Mi = { class: "ss-field" }, Ri = ["placeholder"], Ki = { class: "ss-field" }, Wi = { class: "ss-field" }, Ui = { class: "ss-actions" }, zi = ["disabled", "onClick"], Ii = {
  key: 2,
  class: "fs-card"
}, Pi = { class: "fs-notes" }, ji = /* @__PURE__ */ e.defineComponent({
  __name: "TrackTab",
  setup(u) {
    const h = [{ key: "open", title: a.t("跟进中") }, { key: "due", title: a.t("今天该跟进") }, { key: "closed", title: a.t("已闭环") }], y = $e.useNotificationStore(), N = e.ref("open"), S = e.ref(""), m = e.ref(!1), T = e.ref(""), $ = e.ref(""), M = e.reactive({}), B = e.ref(null), f = e.computed(() => G.value?.thresholds), w = e.computed(() => G.value?.tracking ?? []), F = e.computed(() => G.value?.reminders ?? []), W = e.computed(() => w.value.filter((o) => !o.closedAt)), D = e.computed(() => w.value.filter((o) => !!o.closedAt)), L = (o) => !o.closedAt && !!o.nextFollowAt && Date.parse(o.nextFollowAt) <= Date.now(), q = (o) => o.intervalDays === (f.value?.externalDays ?? 7) && o.intervalDays !== (f.value?.internalDays ?? 3), d = e.computed(() => W.value.filter(L)), R = e.computed(() => {
      const o = N.value === "closed" ? D.value : N.value === "due" ? d.value : W.value, E = S.value.trim().toLowerCase();
      return (E ? o.filter((g) => [g.flowNo, g.flowName, g.flowType, g.title, g.handler, g.initiator].some((K) => String(K || "").toLowerCase().includes(E))) : o).slice(0, 200);
    }), _ = (o) => $.value === o.key ? o.notes : o.notes.slice(-4);
    async function C(o) {
      m.value = !0, T.value = "";
      try {
        await o(), await le();
      } catch (E) {
        T.value = j.errorMessage(E);
      } finally {
        m.value = !1;
      }
    }
    async function P(o) {
      const E = (M[o.key] || "").trim();
      E && await C(async () => {
        await k("track.note", { key: o.key, text: E }), M[o.key] = "";
      });
    }
    async function J(o) {
      await C(async () => {
        const E = await k("track.mailPreview", { key: o.key });
        B.value = { key: o.key, ...E };
      });
    }
    async function ne(o) {
      const E = B.value;
      !E || !window.confirm(a.t("给 {p0} 发送进度提醒邮件？", { p0: E.to })) || await C(async () => {
        E.to.trim() !== o.handlerEmail && await k("track.setEmail", { key: o.key, email: E.to.trim() });
        const g = await k("track.remind", { key: o.key, subject: E.subject, body: E.body });
        B.value = null, y.success(g.via === "official" ? a.t("提醒已发送（经官方代发）") : a.t("提醒已发送"));
      });
    }
    async function c(o) {
      const E = window.prompt(a.t("闭环原因（如：已线下办结）"), "");
      E !== null && await C(async () => {
        await k("track.close", { key: o.key, reason: E });
      });
    }
    async function s() {
      await C(async () => {
        const o = await k("reminders.check");
        y.info(o ? a.t("发出了 {n} 条提醒", { n: o }) : a.t("现在没有新的到期提醒"));
      });
    }
    async function r() {
      await C(async () => {
        await k("reminders.clear");
      });
    }
    return (o, E) => (e.openBlock(), e.createElementBlock("div", ti, [
      e.createElementVNode("div", li, [
        e.createElementVNode("div", ni, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(o.$t("跟进中")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            si,
            e.toDisplayString(W.value.length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", oi, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(o.$t("今天该跟进")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            {
              class: e.normalizeClass({ bad: d.value.length > 0 }),
              "data-test": "fs-track-due"
            },
            e.toDisplayString(d.value.length),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode("div", ai, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(o.$t("内部流程（每 {n} 天）", { n: f.value?.internalDays ?? 3 })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(W.value.filter((g) => !q(g)).length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ri, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(o.$t("外部流程（每 {n} 天）", { n: f.value?.externalDays ?? 7 })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(W.value.filter(q).length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ii, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(o.$t("已闭环")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(D.value.length),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("p", di, [
        E[5] || (E[5] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(o.$t("名单来自「通报」第 3 步的计算：在途且已逾期的流程进名单；以后导入的报表显示它已办结或终止，就自动闭环。到了跟进日，应用会在这里和系统通知里提醒你。")),
          1
          /* TEXT */
        )
      ]),
      T.value ? (e.openBlock(), e.createElementBlock("p", ci, [
        E[6] || (E[6] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(T.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", ui, [
        e.createElementVNode("div", mi, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(h, (g) => e.createElementVNode("button", {
              key: g.key,
              type: "button",
              class: e.normalizeClass({ on: N.value === g.key }),
              "data-test": `fs-track-view-${g.key}`,
              onClick: (K) => N.value = g.key
            }, e.toDisplayString(g.title), 11, pi)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        e.createElementVNode("label", yi, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(o.$t("搜索")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": E[0] || (E[0] = (g) => S.value = g),
            type: "text",
            placeholder: o.$t("单号、流程名、处理人")
          }, null, 8, gi), [
            [e.vModelText, S.value]
          ])
        ]),
        E[8] || (E[8] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: m.value,
          onClick: s
        }, [
          E[7] || (E[7] = e.createElementVNode(
            "i",
            { class: "ri-notification-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(o.$t("现在检查一次提醒")),
            1
            /* TEXT */
          )
        ], 8, vi)
      ]),
      R.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
        "p",
        Ni,
        e.toDisplayString(N.value === "closed" ? o.$t("还没有闭环的记录") : N.value === "due" ? o.$t("今天没有到跟进日的流程") : o.$t("没有需要跟进的在途流程")),
        1
        /* TEXT */
      )),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(R.value, (g) => (e.openBlock(), e.createElementBlock("article", {
          key: g.key + g.firstSeenAt,
          class: e.normalizeClass(["fs-item", { due: L(g), closed: !!g.closedAt }]),
          "data-test": `fs-track-${g.flowNo}`
        }, [
          e.createElementVNode("header", null, [
            e.createElementVNode(
              "span",
              Vi,
              e.toDisplayString(g.system),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(g.flowNo),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(g.flowType),
              1
              /* TEXT */
            ),
            g.title ? (e.openBlock(), e.createElementBlock(
              "span",
              hi,
              e.toDisplayString(g.title),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", q(g) ? "brand" : ""])
              },
              e.toDisplayString(q(g) ? o.$t("外部流转 · 每 {n} 天", { n: g.intervalDays }) : o.$t("内部 · 每 {n} 天", { n: g.intervalDays })),
              3
              /* TEXT, CLASS */
            ),
            g.closedAt ? (e.openBlock(), e.createElementBlock(
              "span",
              ki,
              e.toDisplayString(o.$t("已闭环 {p0}", { p0: e.unref(j.fmtDateTime)(g.closedAt) })),
              1
              /* TEXT */
            )) : L(g) ? (e.openBlock(), e.createElementBlock(
              "span",
              fi,
              e.toDisplayString(o.$t("该跟进了")),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              "span",
              Di,
              e.toDisplayString(o.$t("下次跟进 {p0}", { p0: e.unref(j.fmtDateTime)(g.nextFollowAt) })),
              1
              /* TEXT */
            ))
          ]),
          e.createElementVNode("p", Si, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("在途 {p0} 天", { p0: e.unref(I)(g.days) })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("时效要求 {p0} 天", { p0: g.limitDays ?? "-" })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              $i,
              e.toDisplayString(o.$t("超出 {p0} 天", { p0: e.unref(I)(g.overdueDays) })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("当前节点：{p0}", { p0: g.currentNode || "-" })),
              1
              /* TEXT */
            ),
            g.currentNodeDays != null ? (e.openBlock(), e.createElementBlock(
              "span",
              bi,
              e.toDisplayString(o.$t("节点停留 {p0} 天", { p0: e.unref(I)(g.currentNodeDays) })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("处理人：{p0}", { p0: g.handler || "-" })),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("发起人：{p0}", { p0: g.initiator || "-" })),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("ul", _i, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(_(g), (K, ie) => (e.openBlock(), e.createElementBlock(
                "li",
                {
                  key: ie,
                  class: e.normalizeClass(K.kind)
                },
                [
                  e.createElementVNode(
                    "time",
                    null,
                    e.toDisplayString(e.unref(j.fmtDateTime)(K.at)),
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
            g.notes.length > 4 && $.value !== g.key ? (e.openBlock(), e.createElementBlock("li", wi, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-link",
                onClick: (K) => $.value = g.key
              }, e.toDisplayString(o.$t("看全部 {n} 条记录", { n: g.notes.length })), 9, Bi)
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          g.closedAt ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createElementVNode("div", Ci, [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": (K) => M[g.key] = K,
                  type: "text",
                  class: "fs-note-input",
                  placeholder: o.$t("记一条处理进度（记完自动顺延下次跟进时间）"),
                  "data-test": `fs-note-${g.flowNo}`,
                  onKeydown: e.withKeys(e.withModifiers((K) => P(g), ["prevent"]), ["enter"])
                }, null, 40, Ti), [
                  [e.vModelText, M[g.key]]
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: m.value || !(M[g.key] || "").trim(),
                  "data-test": `fs-note-save-${g.flowNo}`,
                  onClick: (K) => P(g)
                }, [
                  E[9] || (E[9] = e.createElementVNode(
                    "i",
                    { class: "ri-add-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(o.$t("记进展")),
                    1
                    /* TEXT */
                  )
                ], 8, Li),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: m.value,
                  onClick: (K) => J(g)
                }, [
                  E[10] || (E[10] = e.createElementVNode(
                    "i",
                    { class: "ri-mail-send-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(o.$t("发送提醒")),
                    1
                    /* TEXT */
                  )
                ], 8, Ai),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm ghost",
                  disabled: m.value,
                  onClick: (K) => c(g)
                }, [
                  E[11] || (E[11] = e.createElementVNode(
                    "i",
                    { class: "ri-check-double-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(o.$t("手工闭环")),
                    1
                    /* TEXT */
                  )
                ], 8, Fi)
              ]),
              B.value && B.value.key === g.key ? (e.openBlock(), e.createElementBlock("div", Oi, [
                e.createElementVNode("label", Mi, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(o.$t("收件人（处理人邮箱）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": E[1] || (E[1] = (K) => B.value.to = K),
                    type: "text",
                    placeholder: o.$t("花名册里没有邮箱，在这里填")
                  }, null, 8, Ri), [
                    [e.vModelText, B.value.to]
                  ])
                ]),
                e.createElementVNode("label", Ki, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(o.$t("主题")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": E[2] || (E[2] = (K) => B.value.subject = K),
                      type: "text"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, B.value.subject]
                  ])
                ]),
                e.createElementVNode("label", Wi, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(o.$t("正文")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": E[3] || (E[3] = (K) => B.value.body = K),
                      rows: "6"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, B.value.body]
                  ])
                ]),
                e.createElementVNode("div", Ui, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary sm",
                    disabled: m.value || !B.value.to.trim(),
                    "data-test": "fs-track-send",
                    onClick: (K) => ne(g)
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(m.value ? "ri-loader-4-line spin" : "ri-mail-send-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("确认发送")),
                      1
                      /* TEXT */
                    )
                  ], 8, zi),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: E[4] || (E[4] = (K) => B.value = null)
                    },
                    e.toDisplayString(o.$t("取消")),
                    1
                    /* TEXT */
                  )
                ])
              ])) : e.createCommentVNode("v-if", !0)
            ],
            64
            /* STABLE_FRAGMENT */
          ))
        ], 10, Ei))),
        128
        /* KEYED_FRAGMENT */
      )),
      F.value.length ? (e.openBlock(), e.createElementBlock("section", Ii, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(o.$t("最近的提醒")),
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
            e.toDisplayString(o.$t("清空")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("ul", Pi, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(F.value.slice(0, 12), (g) => (e.openBlock(), e.createElementBlock("li", {
              key: g.id
            }, [
              e.createElementVNode(
                "time",
                null,
                e.toDisplayString(e.unref(j.fmtDateTime)(g.at)),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(g.type === "follow_up" ? "ri-route-line" : "ri-book-2-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createElementVNode("span", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(g.title),
                  1
                  /* TEXT */
                ),
                E[12] || (E[12] = e.createElementVNode(
                  "br",
                  null,
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(g.body),
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
}), qi = /* @__PURE__ */ Ne(ji, [["__scopeId", "data-v-60fa765d"]]), Yi = { class: "fs-ledger" }, Hi = { class: "ss-kpis" }, Gi = ["data-test"], Ji = { class: "ss-kpi" }, Xi = { class: "ss-note info" }, Qi = {
  key: 0,
  class: "ss-note danger"
}, Zi = { class: "ss-actions" }, xi = { class: "fs-seg" }, ed = ["data-test", "onClick"], td = ["disabled"], ld = ["disabled"], nd = {
  key: 1,
  class: "ss-file-out"
}, sd = { class: "ss-field" }, od = { class: "ss-grid" }, ad = { class: "ss-field" }, rd = { class: "ss-field" }, id = { class: "ss-field" }, dd = { class: "ss-field" }, cd = { class: "ss-field" }, ud = { class: "ss-actions" }, md = ["disabled"], pd = {
  key: 3,
  class: "ss-empty"
}, yd = {
  key: 0,
  class: "ss-chip bad"
}, gd = { class: "fs-facts" }, vd = {
  key: 0,
  class: "fs-line"
}, Nd = {
  key: 1,
  class: "fs-line"
}, Ed = {
  key: 2,
  class: "fs-notes"
}, Vd = { key: 0 }, hd = ["onClick"], kd = { class: "ss-actions" }, fd = ["onUpdate:modelValue", "placeholder", "onKeydown"], Dd = ["disabled", "onClick"], Sd = ["disabled", "onClick"], $d = ["disabled", "onClick"], bd = ["disabled", "onClick"], _d = ["disabled", "onClick"], wd = ["disabled", "onClick"], Bd = /* @__PURE__ */ e.defineComponent({
  __name: "LedgerTab",
  setup(u, { expose: h }) {
    const y = ["doing", "overdue", "done", "archived"], N = e.ref(!1), S = e.ref(""), m = e.ref(""), T = e.ref(""), $ = e.ref(null), M = e.ref(""), B = e.reactive({}), f = e.computed(() => G.value?.ledger ?? []), w = e.computed(() => G.value?.thresholds.improveRemindDays ?? 7), F = e.computed(() => Object.fromEntries(y.map((c) => [c, f.value.filter((s) => s.status === c).length]))), W = e.computed(() => f.value.filter((c) => c.status === "doing" && (() => {
      const s = Ye(c.deadline);
      return s !== null && s >= 0 && s <= w.value;
    })())), D = e.computed(() => {
      const c = { overdue: 0, doing: 1, done: 2, archived: 3 };
      return f.value.filter((s) => !T.value || s.status === T.value).slice().sort((s, r) => c[s.status] - c[r.status] || (s.deadline || "9999").localeCompare(r.deadline || "9999"));
    });
    function L(c) {
      const s = Ye(c.deadline);
      return s === null || c.status === "done" || c.status === "archived" ? c.deadline : s < 0 ? a.t("已过期 {n} 天", { n: -s }) : s === 0 ? a.t("今天到期") : a.t("还有 {n} 天", { n: s });
    }
    function q(c) {
      const s = Ye(c.deadline);
      return s === null || c.status === "done" || c.status === "archived" ? "" : s < 0 ? "bad" : s <= w.value ? "warn" : "";
    }
    async function d(c) {
      N.value = !0, S.value = "";
      try {
        return await c(), await le(), !0;
      } catch (s) {
        return S.value = j.errorMessage(s), !1;
      } finally {
        N.value = !1;
      }
    }
    function R(c) {
      $.value = c ? { id: c.id, item: c.item, dept: c.dept, owner: c.owner, requirement: c.requirement, deadline: c.deadline, acceptance: c.acceptance } : { id: "", item: "", dept: "", owner: "", requirement: "", deadline: "", acceptance: "" };
    }
    async function _() {
      const c = $.value;
      c && await d(async () => {
        await k("ledger.save", { item: c.id ? c : { ...c, id: void 0 } });
      }) && ($.value = null);
    }
    async function C(c, s) {
      await d(async () => {
        await k("ledger.save", { item: { id: c.id, item: c.item, status: s } });
      });
    }
    async function P(c) {
      const s = (B[c.id] || "").trim();
      s && await d(async () => {
        await k("ledger.progress", { id: c.id, text: s }), B[c.id] = "";
      });
    }
    async function J(c) {
      window.confirm(a.t("删除「{p0}」？进展记录也会一起删掉。", { p0: c.item })) && await d(async () => {
        await k("ledger.remove", { id: c.id });
      });
    }
    async function ne() {
      await d(async () => {
        m.value = await k("ledger.export");
      });
    }
    return h({ startEdit: R, save: _, editing: $ }), (c, s) => (e.openBlock(), e.createElementBlock("div", Yi, [
      e.createElementVNode("div", Hi, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(y, (r) => e.createElementVNode("div", {
            key: r,
            class: "ss-kpi"
          }, [
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(e.unref(qe)(r)),
              1
              /* TEXT */
            ),
            e.createElementVNode("strong", {
              class: e.normalizeClass({ bad: r === "overdue" && F.value[r] > 0 }),
              "data-test": `fs-ledger-count-${r}`
            }, e.toDisplayString(F.value[r]), 11, Gi)
          ])),
          64
          /* STABLE_FRAGMENT */
        )),
        e.createElementVNode("div", Ji, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(c.$t("{n} 天内到期", { n: w.value })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            {
              class: e.normalizeClass({ warn: W.value.length > 0 })
            },
            e.toDisplayString(W.value.length),
            3
            /* TEXT, CLASS */
          )
        ])
      ]),
      e.createElementVNode("p", Xi, [
        s[11] || (s[11] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(c.$t("月度通报发出后，改善建议会自动记到这里。执行期限前 {n} 天应用会提醒你与责任人确认执行情况；过了期限还没完成的标为逾期并升级督办；完成后可以归档。", { n: w.value })),
          1
          /* TEXT */
        )
      ]),
      S.value ? (e.openBlock(), e.createElementBlock("p", Qi, [
        s[12] || (s[12] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Zi, [
        e.createElementVNode("div", xi, [
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: e.normalizeClass({ on: T.value === "" }),
              onClick: s[0] || (s[0] = (r) => T.value = "")
            },
            e.toDisplayString(c.$t("全部")),
            3
            /* TEXT, CLASS */
          ),
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(y, (r) => e.createElementVNode("button", {
              key: r,
              type: "button",
              class: e.normalizeClass({ on: T.value === r }),
              "data-test": `fs-ledger-filter-${r}`,
              onClick: (o) => T.value = r
            }, e.toDisplayString(e.unref(qe)(r)), 11, ed)),
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
          disabled: N.value,
          "data-test": "fs-ledger-add",
          onClick: s[1] || (s[1] = (r) => R(null))
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
        ], 8, td),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn",
          disabled: N.value || !f.value.length,
          "data-test": "fs-ledger-export",
          onClick: ne
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
        ], 8, ld)
      ]),
      m.value ? (e.openBlock(), e.createElementBlock("p", nd, [
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
          e.toDisplayString(m.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: s[2] || (s[2] = (r) => e.unref(re)(m.value))
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
            onClick: s[3] || (s[3] = (r) => e.unref(re)(m.value, !0))
          },
          e.toDisplayString(c.$t("所在文件夹")),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      $.value ? (e.openBlock(), e.createElementBlock(
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
            e.toDisplayString($.value.id ? c.$t("修改改善事项") : c.$t("登记改善事项")),
            1
            /* TEXT */
          ),
          e.createElementVNode("label", sd, [
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
                "onUpdate:modelValue": s[4] || (s[4] = (r) => $.value.item = r),
                type: "text",
                "data-test": "fs-ledger-item"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, $.value.item]
            ])
          ]),
          e.createElementVNode("div", od, [
            e.createElementVNode("label", ad, [
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
                  "onUpdate:modelValue": s[5] || (s[5] = (r) => $.value.dept = r),
                  type: "text",
                  "data-test": "fs-ledger-dept"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, $.value.dept]
              ])
            ]),
            e.createElementVNode("label", rd, [
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
                  "onUpdate:modelValue": s[6] || (s[6] = (r) => $.value.owner = r),
                  type: "text",
                  "data-test": "fs-ledger-owner"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, $.value.owner]
              ])
            ]),
            e.createElementVNode("label", id, [
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
                  "onUpdate:modelValue": s[7] || (s[7] = (r) => $.value.deadline = r),
                  type: "date",
                  "data-test": "fs-ledger-deadline"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, $.value.deadline]
              ])
            ])
          ]),
          e.createElementVNode("label", dd, [
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
                "onUpdate:modelValue": s[8] || (s[8] = (r) => $.value.requirement = r),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, $.value.requirement]
            ])
          ]),
          e.createElementVNode("label", cd, [
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
                "onUpdate:modelValue": s[9] || (s[9] = (r) => $.value.acceptance = r),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, $.value.acceptance]
            ])
          ]),
          e.createElementVNode("div", ud, [
            e.createElementVNode("button", {
              type: "submit",
              class: "ss-btn primary",
              disabled: N.value || !$.value.item.trim(),
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
            ], 8, md),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-link",
                onClick: s[10] || (s[10] = (r) => $.value = null)
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
      D.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
        "p",
        pd,
        e.toDisplayString(f.value.length ? c.$t("这个状态下没有事项") : c.$t("台账还是空的。月度通报发出后改善建议会记到这里，也可以手工登记。")),
        1
        /* TEXT */
      )),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(D.value, (r) => (e.openBlock(), e.createElementBlock(
          "article",
          {
            key: r.id,
            class: e.normalizeClass(["fs-item", r.status]),
            "data-test": "fs-ledger-row"
          },
          [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", e.unref(Pt)(r.status)])
                },
                e.toDisplayString(e.unref(qe)(r.status)),
                3
                /* TEXT, CLASS */
              ),
              r.escalated && r.status === "overdue" ? (e.openBlock(), e.createElementBlock("span", yd, [
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
                e.toDisplayString(r.item),
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
              r.deadline ? (e.openBlock(), e.createElementBlock(
                "span",
                {
                  key: 1,
                  class: e.normalizeClass(["ss-chip", q(r)])
                },
                e.toDisplayString(L(r)),
                3
                /* TEXT, CLASS */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("p", gd, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("责任部门：{p0}", { p0: r.dept || "-" })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("责任人：{p0}", { p0: r.owner || "-" })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("执行期限：{p0}", { p0: r.deadline || c.$t("未定") })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("来源：{p0}", { p0: r.source || "-" })),
                1
                /* TEXT */
              )
            ]),
            r.requirement ? (e.openBlock(), e.createElementBlock("p", vd, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(c.$t("执行要求")),
                1
                /* TEXT */
              ),
              e.createTextVNode(
                e.toDisplayString(r.requirement),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            r.acceptance ? (e.openBlock(), e.createElementBlock("p", Nd, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(c.$t("验收要求")),
                1
                /* TEXT */
              ),
              e.createTextVNode(
                e.toDisplayString(r.acceptance),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            r.progress.length ? (e.openBlock(), e.createElementBlock("ul", Ed, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(M.value === r.id ? r.progress : r.progress.slice(-3), (o, E) => (e.openBlock(), e.createElementBlock("li", { key: E }, [
                  e.createElementVNode(
                    "time",
                    null,
                    e.toDisplayString(e.unref(j.fmtDateTime)(o.at)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(o.text),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              )),
              r.progress.length > 3 && M.value !== r.id ? (e.openBlock(), e.createElementBlock("li", Vd, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: (o) => M.value = r.id
                }, e.toDisplayString(c.$t("看全部 {n} 条进展", { n: r.progress.length })), 9, hd)
              ])) : e.createCommentVNode("v-if", !0)
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", kd, [
              r.status !== "archived" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (o) => B[r.id] = o,
                    type: "text",
                    class: "fs-note-input",
                    placeholder: c.$t("记一条执行进展（与责任人确认的情况）"),
                    "data-test": "fs-ledger-progress",
                    onKeydown: e.withKeys(e.withModifiers((o) => P(r), ["prevent"]), ["enter"])
                  }, null, 40, fd), [
                    [e.vModelText, B[r.id]]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: N.value || !(B[r.id] || "").trim(),
                    "data-test": "fs-ledger-progress-save",
                    onClick: (o) => P(r)
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
                  ], 8, Dd)
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0),
              r.status === "doing" || r.status === "overdue" ? (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn sm primary",
                disabled: N.value,
                "data-test": "fs-ledger-done",
                onClick: (o) => C(r, "done")
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
              ], 8, Sd)) : e.createCommentVNode("v-if", !0),
              r.status === "done" ? (e.openBlock(), e.createElementBlock("button", {
                key: 2,
                type: "button",
                class: "ss-btn sm",
                disabled: N.value,
                "data-test": "fs-ledger-archive",
                onClick: (o) => C(r, "archived")
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
              ], 8, $d)) : e.createCommentVNode("v-if", !0),
              r.status === "done" || r.status === "archived" ? (e.openBlock(), e.createElementBlock("button", {
                key: 3,
                type: "button",
                class: "ss-link",
                disabled: N.value,
                onClick: (o) => C(r, "doing")
              }, e.toDisplayString(c.$t("重新打开")), 9, bd)) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-link",
                disabled: N.value,
                onClick: (o) => R(r)
              }, e.toDisplayString(c.$t("修改")), 9, _d),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-link danger",
                disabled: N.value,
                onClick: (o) => J(r)
              }, e.toDisplayString(c.$t("删除")), 9, wd)
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
}), Cd = /* @__PURE__ */ Ne(Bd, [["__scopeId", "data-v-ff9ce086"]]), Td = { class: "fs-rules" }, Ld = {
  key: 0,
  class: "ss-note danger"
}, Ad = {
  key: 1,
  class: "ss-note"
}, Fd = { class: "fs-card" }, Od = ["disabled"], Md = ["disabled"], Rd = { class: "ss-muted" }, Kd = { class: "ss-actions" }, Wd = { class: "fs-seg" }, Ud = ["data-test", "onClick"], zd = { class: "ss-field inline" }, Id = ["placeholder"], Pd = { class: "ss-table-wrap fs-scroll" }, jd = {
  key: 0,
  class: "ss-table"
}, qd = {
  key: 1,
  class: "ss-table"
}, Yd = { class: "num" }, Hd = { class: "num" }, Gd = {
  key: 2,
  class: "ss-table"
}, Jd = {
  key: 3,
  class: "ss-table"
}, Xd = { class: "num" }, Qd = { class: "num" }, Zd = {
  key: 4,
  class: "ss-table"
}, xd = { class: "ss-muted" }, ec = { class: "fs-card" }, tc = ["disabled"], lc = { class: "ss-grid" }, nc = { class: "ss-field" }, sc = { class: "ss-field" }, oc = { class: "ss-field" }, ac = { class: "ss-field" }, rc = { class: "ss-field" }, ic = { class: "ss-field" }, dc = { class: "ss-field" }, cc = { class: "ss-actions" }, uc = ["disabled"], mc = {
  key: 0,
  class: "ss-chip ok"
}, pc = { class: "fs-card" }, yc = { class: "ss-muted" }, gc = { class: "fs-cal" }, vc = { class: "ss-field" }, Nc = { class: "ss-field" }, Ec = { class: "ss-actions" }, Vc = ["disabled"], hc = {
  key: 0,
  class: "ss-chip ok"
}, kc = { class: "fs-card" }, fc = { class: "ss-file-out" }, Dc = { class: "ss-muted" }, ge = 300, Sc = /* @__PURE__ */ e.defineComponent({
  __name: "RulesTab",
  setup(u) {
    const h = [
      { key: "e2e", title: a.t("端到端用时") },
      { key: "cssNodes", title: a.t("CSS 各节点") },
      { key: "oaFkNodes", title: a.t("OA / 费控节点内外部") },
      { key: "personal", title: a.t("OA / 费控个人节点") },
      { key: "managers", title: a.t("审核人身份") }
    ], y = G, N = e.ref(null), S = e.ref(!1), m = e.ref(""), T = e.ref([]), $ = e.ref("e2e"), M = e.ref(""), B = e.ref(""), f = e.reactive({ riskPct: 80, avgIncreaseDays: 3, minPct: 95, amountThreshold: 1e5, internalDays: 3, externalDays: 7, improveRemindDays: 7 }), w = e.ref(""), F = e.ref("");
    function W(i) {
      N.value = i, D(i.thresholds), w.value = i.holidays.join(`
`), F.value = i.extraWorkdays.join(`
`);
    }
    function D(i) {
      Object.assign(f, { riskPct: Math.round(i.riskRatio * 1e3) / 10, avgIncreaseDays: i.avgIncreaseDays, minPct: Math.round(i.minComplianceRate * 1e3) / 10, amountThreshold: i.amountThreshold, internalDays: i.internalDays, externalDays: i.externalDays, improveRemindDays: i.improveRemindDays });
    }
    async function L() {
      try {
        W(await k("rules.get")), m.value = "";
      } catch (i) {
        m.value = j.errorMessage(i);
      }
    }
    e.onMounted(L);
    const q = (...i) => {
      const V = M.value.trim().toLowerCase();
      return !V || i.some((v) => String(v || "").toLowerCase().includes(V));
    }, d = e.computed(() => ({ e2e: N.value?.e2e.length ?? 0, cssNodes: N.value?.cssNodes.length ?? 0, oaFkNodes: N.value?.oaFkNodes.length ?? 0, personal: N.value?.personal.length ?? 0, managers: N.value?.managers.length ?? 0 })), R = e.computed(() => (N.value?.e2e ?? []).filter((i) => q(i.category, i.flowType, i.system))), _ = e.computed(() => (N.value?.cssNodes ?? []).filter((i) => q(i.flowType, i.feeType, i.node))), C = e.computed(() => (N.value?.oaFkNodes ?? []).filter((i) => q(i[0], i[1]))), P = e.computed(() => (N.value?.personal ?? []).filter((i) => q(i.identity, i.category, i.flowType, i.platform))), J = e.computed(() => (N.value?.managers ?? []).filter((i) => q(i))), ne = e.computed(() => R.value.slice(0, ge)), c = e.computed(() => _.value.slice(0, ge)), s = e.computed(() => C.value.slice(0, ge)), r = e.computed(() => P.value.slice(0, ge)), o = e.computed(() => {
      const i = { e2e: R.value.length, cssNodes: _.value.length, oaFkNodes: C.value.length, personal: P.value.length, managers: J.value.length }[$.value];
      return i > ge ? a.t("符合条件的有 {a} 行，这里列前 {b} 行；用搜索缩小范围", { a: i, b: ge }) : a.t("{a} 行", { a: i });
    });
    async function E(i) {
      S.value = !0, m.value = "", B.value = "";
      try {
        return await i(), await le(), !0;
      } catch (V) {
        return m.value = j.errorMessage(V), !1;
      } finally {
        S.value = !1;
      }
    }
    async function g() {
      const i = await k("files.pick", { multi: !1 });
      i.length && (T.value = [], await E(async () => {
        const V = await k("rules.import", { path: i[0] });
        T.value = V.warnings, await L();
      }));
    }
    async function K() {
      window.confirm(a.t("恢复成内置的规则表？导入的规则会被丢掉。")) && (T.value = [], await E(async () => {
        await k("rules.reset"), await L();
      }));
    }
    async function ie() {
      await E(async () => {
        const V = (Y, x) => {
          if (!(Y > 0 && Y <= 100)) throw new Error(a.t("{p0}要填 1 到 100 之间的数", { p0: x }));
          return Math.round(Y * 10) / 1e3;
        }, v = {
          riskRatio: V(Number(f.riskPct), a.t("较大逾期风险的比例")),
          minComplianceRate: V(Number(f.minPct), a.t("合规率下限")),
          avgIncreaseDays: Number(f.avgIncreaseDays),
          amountThreshold: Number(f.amountThreshold),
          internalDays: Number(f.internalDays),
          externalDays: Number(f.externalDays),
          improveRemindDays: Number(f.improveRemindDays)
        };
        for (const [Y, x] of Object.entries(v)) if (!Number.isFinite(x) || x < 0) throw new Error(a.t("阈值里有没填或填错的数（{p0}）", { p0: Y }));
        D(await k("rules.thresholds", { patch: v }));
      }) && (B.value = "th");
    }
    async function be() {
      await E(async () => {
        D(await k("rules.thresholds", { patch: null }));
      });
    }
    const se = (i) => i.split(/[\s,，;；]+/).map((V) => V.trim()).filter(Boolean);
    async function U() {
      await E(async () => {
        await k("calendar.save", { holidays: se(w.value), extraWorkdays: se(F.value) }), await L();
      }) && (B.value = "cal");
    }
    async function _e() {
      const i = await k("dirs.pick");
      i && await Ee(i);
    }
    async function Ee(i) {
      await E(async () => {
        await k("settings.patch", { patch: { outputDir: i } });
      });
    }
    return (i, V) => (e.openBlock(), e.createElementBlock("div", Td, [
      m.value ? (e.openBlock(), e.createElementBlock("p", Ld, [
        V[11] || (V[11] = e.createElementVNode(
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
      ])) : e.createCommentVNode("v-if", !0),
      !N.value && !m.value ? (e.openBlock(), e.createElementBlock("p", Ad, [
        V[12] || (V[12] = e.createElementVNode(
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
      N.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createElementVNode("section", Fd, [
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
                  class: e.normalizeClass(["ss-chip", N.value.custom ? "brand" : ""]),
                  "data-test": "fs-rules-source"
                },
                e.toDisplayString(N.value.custom ? i.$t("导入的：{p0}", { p0: N.value.version }) : i.$t("内置：{p0}", { p0: N.value.version })),
                3
                /* TEXT, CLASS */
              ),
              V[15] || (V[15] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: S.value,
                "data-test": "fs-rules-import",
                onClick: g
              }, [
                V[13] || (V[13] = e.createElementVNode(
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
              ], 8, Od),
              N.value.custom ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn",
                disabled: S.value,
                "data-test": "fs-rules-reset",
                onClick: K
              }, [
                V[14] || (V[14] = e.createElementVNode(
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
              ], 8, Md)) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              Rd,
              e.toDisplayString(i.$t("导入时整体替换下面五张表。工作簿里要有这五张工作表：端到端用时、CSS各节点时效要求、oa、费控节点内外部、oa费控个人节点时效要求、审核人身份。导入后「通报」里已经算过的结果要重新计算。")),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(T.value, (v) => (e.openBlock(), e.createElementBlock("p", {
                key: v,
                class: "ss-note warn"
              }, [
                V[16] || (V[16] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(v),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            e.createElementVNode("div", Kd, [
              e.createElementVNode("div", Wd, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(h, (v) => e.createElementVNode("button", {
                    key: v.key,
                    type: "button",
                    class: e.normalizeClass({ on: $.value === v.key }),
                    "data-test": `fs-rules-tab-${v.key}`,
                    onClick: (Y) => $.value = v.key
                  }, [
                    e.createTextVNode(
                      e.toDisplayString(v.title),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "em",
                      null,
                      e.toDisplayString(d.value[v.key]),
                      1
                      /* TEXT */
                    )
                  ], 10, Ud)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]),
              e.createElementVNode("label", zd, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("搜索")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": V[0] || (V[0] = (v) => M.value = v),
                  type: "text",
                  placeholder: i.$t("流程名、节点、姓名")
                }, null, 8, Id), [
                  [e.vModelText, M.value]
                ])
              ])
            ]),
            e.createElementVNode("div", Pd, [
              $.value === "e2e" ? (e.openBlock(), e.createElementBlock("table", jd, [
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
                    e.renderList(ne.value, (v, Y) => (e.openBlock(), e.createElementBlock("tr", { key: Y }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.category),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.flowType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.system),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.variants?.length ? v.variants.map((x) => i.$t("标题含「{a}」{b} 天", { a: x.keyword, b: x.limitDays })).join("；") : v.limitDays == null ? i.$t("无整体时效要求") : i.$t("{n} 天", { n: v.limitDays })),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : $.value === "cssNodes" ? (e.openBlock(), e.createElementBlock("table", qd, [
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
                      Yd,
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
                    e.renderList(c.value, (v, Y) => (e.openBlock(), e.createElementBlock("tr", { key: Y }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.flowType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.feeType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.node),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", v.internal ? "brand" : ""])
                          },
                          e.toDisplayString(v.internal ? i.$t("内部（计入）") : i.$t("外部（不计入）")),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        Hd,
                        e.toDisplayString(v.limitWorkdays ?? "-"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.note),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : $.value === "oaFkNodes" ? (e.openBlock(), e.createElementBlock("table", Gd, [
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
                    e.renderList(s.value, (v, Y) => (e.openBlock(), e.createElementBlock("tr", { key: Y }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v[0]),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v[1]),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", v[2] ? "brand" : ""])
                          },
                          e.toDisplayString(v[2] ? i.$t("内部") : i.$t("外部")),
                          3
                          /* TEXT, CLASS */
                        )
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : $.value === "personal" ? (e.openBlock(), e.createElementBlock("table", Jd, [
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
                      Xd,
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
                    e.renderList(r.value, (v, Y) => (e.openBlock(), e.createElementBlock("tr", { key: Y }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.identity),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.category),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.flowType),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.platform),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.amount === "le10w" ? i.$t("金额线以内") : v.amount === "gt10w" ? i.$t("金额线以上") : i.$t("不分金额")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.importance),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Qd,
                        e.toDisplayString(v.limitDays ?? "-"),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : (e.openBlock(), e.createElementBlock("table", Zd, [
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
                    e.renderList(J.value, (v) => (e.openBlock(), e.createElementBlock("tr", { key: v }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v),
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
              xd,
              e.toDisplayString($.value === "managers" ? i.$t("名单以外的人按非管理干部算；花名册里「身份」写了管理干部的人也会算作管理干部。") : o.value),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("section", ec, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(i.$t("判定阈值")),
                1
                /* TEXT */
              ),
              V[17] || (V[17] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-link",
                disabled: S.value,
                onClick: be
              }, e.toDisplayString(i.$t("恢复默认")), 9, tc)
            ]),
            e.createElementVNode("div", lc, [
              e.createElementVNode("label", nc, [
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
                    "onUpdate:modelValue": V[1] || (V[1] = (v) => f.riskPct = v),
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
                    f.riskPct,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", sc, [
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
                    "onUpdate:modelValue": V[2] || (V[2] = (v) => f.avgIncreaseDays = v),
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
                    f.avgIncreaseDays,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", oc, [
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
                    "onUpdate:modelValue": V[3] || (V[3] = (v) => f.minPct = v),
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
                    f.minPct,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", ac, [
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
                    "onUpdate:modelValue": V[4] || (V[4] = (v) => f.amountThreshold = v),
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
                    f.amountThreshold,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", rc, [
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
                    "onUpdate:modelValue": V[5] || (V[5] = (v) => f.internalDays = v),
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
                    f.internalDays,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", ic, [
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
                    "onUpdate:modelValue": V[6] || (V[6] = (v) => f.externalDays = v),
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
                    f.externalDays,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", dc, [
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
                    "onUpdate:modelValue": V[7] || (V[7] = (v) => f.improveRemindDays = v),
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
                    f.improveRemindDays,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ])
            ]),
            e.createElementVNode("div", cc, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: S.value,
                "data-test": "fs-th-save",
                onClick: ie
              }, [
                V[18] || (V[18] = e.createElementVNode(
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
              ], 8, uc),
              B.value === "th" ? (e.openBlock(), e.createElementBlock(
                "span",
                mc,
                e.toDisplayString(i.$t("已保存")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          e.createElementVNode("section", pc, [
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
                yc,
                e.toDisplayString(i.$t("CSS 节点的个人审核用时只算工作日：周末不算，下面的节假日不算，调休上班的周末要算")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", gc, [
              e.createElementVNode("label", vc, [
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
                    "onUpdate:modelValue": V[8] || (V[8] = (v) => w.value = v),
                    rows: "7",
                    "data-test": "fs-holidays"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, w.value]
                ])
              ]),
              e.createElementVNode("label", Nc, [
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
                    "onUpdate:modelValue": V[9] || (V[9] = (v) => F.value = v),
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
            e.createElementVNode("div", Ec, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: S.value,
                "data-test": "fs-cal-save",
                onClick: U
              }, [
                V[19] || (V[19] = e.createElementVNode(
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
              ], 8, Vc),
              B.value === "cal" ? (e.openBlock(), e.createElementBlock(
                "span",
                hc,
                e.toDisplayString(i.$t("已保存")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          e.createElementVNode("section", kc, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(i.$t("输出目录")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("p", fc, [
              V[20] || (V[20] = e.createElementVNode(
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
                  onClick: V[10] || (V[10] = (v) => Ee(""))
                },
                e.toDisplayString(i.$t("恢复默认位置")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              Dc,
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
}), $c = /* @__PURE__ */ Ne(Sc, [["__scopeId", "data-v-ec6beae6"]]), bc = { class: "fs-workbench" }, _c = { class: "workbench-header" }, wc = { class: "heading" }, Bc = { class: "eyebrow" }, Cc = { class: "subtitle" }, Tc = { class: "header-actions" }, Lc = ["disabled"], Ac = {
  key: 0,
  class: "fs-bar"
}, Fc = { class: "ss-muted" }, Oc = { class: "fs-bar__rule" }, Mc = { class: "no" }, Rc = { class: "yes" }, Kc = {
  class: "fs-tabs",
  role: "tablist"
}, Wc = ["aria-selected", "data-test", "onClick"], Uc = {
  key: 0,
  class: "fs-badge"
}, zc = {
  key: 1,
  class: "fs-badge"
}, Ic = {
  key: 1,
  class: "fs-body"
}, Pc = {
  key: 4,
  class: "fs-ov"
}, jc = { class: "ss-panel" }, qc = { class: "fs-list" }, Yc = { class: "ss-panel" }, Hc = { class: "fs-list" }, Gc = { class: "ss-panel" }, Jc = { class: "fs-list" }, Xc = { class: "ss-panel" }, Qc = { class: "fs-list" }, Zc = {
  key: 2,
  class: "ss-note danger"
}, xc = {
  key: 3,
  class: "ss-note"
}, vt = "totalclaw:flow-sla-tab:v1", eu = /* @__PURE__ */ e.defineComponent({
  __name: "FlowSlaWorkbenchView",
  setup(u) {
    const h = [
      { key: "bulletin", icon: "ri-mail-send-line", title: a.t("通报") },
      { key: "board", icon: "ri-dashboard-3-line", title: a.t("时效看板") },
      { key: "track", icon: "ri-route-line", title: a.t("在途跟进") },
      { key: "ledger", icon: "ri-book-2-line", title: a.t("改善台账") },
      { key: "rules", icon: "ri-ruler-2-line", title: a.t("规则") },
      { key: "overview", icon: "ri-book-open-line", title: a.t("方案说明") }
    ];
    function y() {
      try {
        const d = localStorage.getItem(vt);
        return h.some((R) => R.key === d) ? d : "bulletin";
      } catch {
        return "bulletin";
      }
    }
    const N = $e.useNotificationStore(), S = G, m = e.ref(y()), T = e.ref(!1), $ = e.ref(!1), M = e.ref(""), B = e.computed(() => (S.value?.tracking || []).filter((d) => !d.closedAt).length), f = e.computed(() => (S.value?.tracking || []).filter((d) => !d.closedAt && d.nextFollowAt && Date.parse(d.nextFollowAt) <= Date.now()).length), w = e.computed(() => (S.value?.ledger || []).filter((d) => d.status === "doing" || d.status === "overdue").length), F = e.computed(() => (S.value?.ledger || []).filter((d) => d.status === "overdue").length);
    function W(d) {
      m.value = d;
      try {
        localStorage.setItem(vt, d);
      } catch {
      }
    }
    async function D() {
      $.value = !0;
      try {
        await le(), T.value = !0, M.value = "";
      } catch (d) {
        M.value = j.errorMessage(d);
      } finally {
        $.value = !1;
      }
    }
    let L = null, q = null;
    return e.onMounted(() => {
      D(), q = It((d) => {
        d?.type === "reminder" && d.payload?.title && N.warn(String(d.payload.title), 8e3), !L && (L = setTimeout(() => {
          L = null, le().catch(() => {
          });
        }, 250));
      });
    }), e.onBeforeUnmount(() => {
      q?.(), L && clearTimeout(L);
    }), (d, R) => (e.openBlock(), e.createElementBlock("div", bc, [
      e.createElementVNode("header", _c, [
        e.createElementVNode("div", wc, [
          e.createVNode(Ut),
          R[0] || (R[0] = e.createElementVNode(
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
              Bc,
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
              Cc,
              e.toDisplayString(d.$t("把 OA、费控、CSS 三个系统导出的流程报表放进来，按《时效看板指标》的规则算出每个流程和每位审核人是否超时，出时效看板、周报和月度分析报告，跟进在途流程和改善建议。数字全部由规则计算，邮件由你确认后发出。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Tc, [
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: $.value,
            onClick: D
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass($.value ? "ri-loader-4-line spin" : "ri-refresh-line")
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
          ], 8, Lc)
        ])
      ]),
      e.unref(S) ? (e.openBlock(), e.createElementBlock("section", Ac, [
        e.createElementVNode("span", null, [
          R[1] || (R[1] = e.createElementVNode(
            "i",
            { class: "ri-calendar-check-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(e.unref(S).session.period ? `${e.unref(Se)(e.unref(S).session.period.kind)} · ${e.unref(S).session.period.label}` : d.$t("还没有导入报表")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          Fc,
          e.toDisplayString(d.$t("周期快照 {a} · 在途跟进 {b} · 改善事项 {c} · 规则 {d}", { a: e.unref(S).snapshots.length, b: B.value, c: w.value, d: e.unref(S).rules.custom ? d.$t("导入版") : d.$t("内置版") })),
          1
          /* TEXT */
        ),
        e.createElementVNode("p", Oc, [
          e.createElementVNode("span", Mc, [
            R[2] || (R[2] = e.createElementVNode(
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
          e.createElementVNode("span", Rc, [
            R[3] || (R[3] = e.createElementVNode(
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
      e.createElementVNode("nav", Kc, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(h, (_) => e.createElementVNode("button", {
            key: _.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["fs-tab", { active: m.value === _.key }]),
            "aria-selected": m.value === _.key,
            "data-test": `fs-tab-${_.key}`,
            onClick: (C) => W(_.key)
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
            _.key === "track" && f.value ? (e.openBlock(), e.createElementBlock(
              "em",
              Uc,
              e.toDisplayString(f.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            _.key === "ledger" && F.value ? (e.openBlock(), e.createElementBlock(
              "em",
              zc,
              e.toDisplayString(F.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, Wc)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      T.value ? (e.openBlock(), e.createElementBlock("div", Ic, [
        e.withDirectives(e.createVNode(
          _a,
          null,
          null,
          512
          /* NEED_PATCH */
        ), [
          [e.vShow, m.value === "bulletin"]
        ]),
        m.value === "board" ? (e.openBlock(), e.createBlock(ei, { key: 0 })) : m.value === "track" ? (e.openBlock(), e.createBlock(qi, { key: 1 })) : m.value === "ledger" ? (e.openBlock(), e.createBlock(Cd, { key: 2 })) : m.value === "rules" ? (e.openBlock(), e.createBlock($c, { key: 3 })) : m.value === "overview" ? (e.openBlock(), e.createElementBlock("div", Pc, [
          e.createElementVNode("section", jc, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(d.$t("它替流程管理员做什么")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", qc, [
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
          e.createElementVNode("section", Yc, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(d.$t("指标是怎么算的")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Hc, [
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
          e.createElementVNode("section", Gc, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(d.$t("三条红线")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Jc, [
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
          e.createElementVNode("section", Xc, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(d.$t("先知道这几件事")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Qc, [
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
      ])) : M.value ? (e.openBlock(), e.createElementBlock("p", Zc, [
        R[4] || (R[4] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(M.value),
          1
          /* TEXT */
        )
      ])) : (e.openBlock(), e.createElementBlock("p", xc, [
        R[5] || (R[5] = e.createElementVNode(
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
}), tu = /* @__PURE__ */ Ne(eu, [["__scopeId", "data-v-1caffd80"]]);
export {
  tu as default
};
