const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const Ol = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!Ol) throw new Error("宿主模块未就绪：npm:vue-router");
Ol.default;
const oo = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!oo) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Ba = oo.default, ao = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/WorkbenchStepBar.vue"];
if (!ao) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/WorkbenchStepBar.vue");
const Ta = ao.default, ro = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/StepRunAlert.vue"];
if (!ro) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/StepRunAlert.vue");
const La = ro.default, Wl = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts"];
if (!Wl) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts");
Wl.default;
const io = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-echarts"];
if (!io) throw new Error("宿主模块未就绪：npm:vue-echarts");
const Pa = io.default, Fl = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/core"];
if (!Fl) throw new Error("宿主模块未就绪：npm:echarts/core");
Fl.default;
const Rl = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/renderers"];
if (!Rl) throw new Error("宿主模块未就绪：npm:echarts/renderers");
Rl.default;
const ll = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/charts"];
if (!ll) throw new Error("宿主模块未就绪：npm:echarts/charts");
ll.default;
const Pt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:echarts/components"];
if (!Pt) throw new Error("宿主模块未就绪：npm:echarts/components");
Pt.default;
function Ia(O) {
  if (!O || O.success === !1 || O.ok === !1) return [];
  const je = Array.isArray(O.metrics) ? O.metrics : [], H = /* @__PURE__ */ new Map(), b = (g) => {
    if (typeof g != "number" && typeof g != "string" || String(g).trim() === "") return null;
    const j = Number(g);
    return Number.isFinite(j) ? j : null;
  };
  for (const g of je) {
    if (!g || typeof g != "object") continue;
    const j = g["segments.date"] ?? g.segments?.date ?? g.date;
    if (typeof j != "string" || !/^\d{4}-\d{2}-\d{2}$/.test(j)) continue;
    const le = H.get(j) ?? { date: j, clicks: null, conversions: null, spend: null }, ct = {
      clicks: b(g.clicks ?? g["metrics.clicks"] ?? g.metrics?.clicks),
      conversions: b(g.conversions ?? g["metrics.conversions"] ?? g.metrics?.conversions),
      spend: b(g.spend)
    };
    for (const ne of ["clicks", "conversions", "spend"])
      ct[ne] !== null && (le[ne] = (le[ne] ?? 0) + ct[ne]);
    (le.clicks !== null || le.conversions !== null || le.spend !== null) && H.set(j, le);
  }
  return [...H.values()].sort((g, j) => g.date.localeCompare(j.date));
}
const o = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!o) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
o.default;
const Ul = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/humanize.ts"];
if (!Ul) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/humanize.ts");
Ul.default;
const zl = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!zl) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
zl.default;
const Kl = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useNativeBrowserModalLock.ts"];
if (!Kl) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useNativeBrowserModalLock.ts");
Kl.default;
const so = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/AutomationOpsConsole.vue"];
if (!so) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/AutomationOpsConsole.vue");
const Ma = so.default;
function co() {
  return window.electronAPI?.globalAdsRun || null;
}
const $ = e.ref(""), V = e.ref([]), N = e.ref(!1), k = e.ref([]), T = e.ref(""), pe = e.ref(""), It = e.ref(0), it = e.ref(!1), Mt = e.ref(0), nl = e.ref(0);
function Oa() {
  k.value = k.value.map((O) => O.state === "running" ? { ...O, state: "failed" } : O);
}
function x() {
  const O = co();
  if (O?.save)
    try {
      O.save({
        startedAt: It.value,
        busy: !!$.value || N.value,
        // JSON 化一层，剥掉 Vue 的响应式 Proxy —— 直接把 ref 的 .value 交给 IPC，
        // 结构化克隆遇到 Proxy 会抛「An object could not be cloned.」
        runs: JSON.parse(JSON.stringify(V.value)),
        genNodes: JSON.parse(JSON.stringify(k.value)),
        genMessage: T.value,
        genPreviewPath: pe.value,
        genProgressAt: Mt.value,
        savedAt: Date.now()
      }).catch(() => {
      });
    } catch {
    }
}
async function Wa() {
  const O = !!$.value || N.value;
  if ((V.value.length > 0 || k.value.length > 0) && !O)
    if (!(V.value.some((g) => g.state === "failed" || g.state === "running" || g.state === "pending") || k.value.some((g) => g.state === "failed" || g.state === "running"))) uo();
    else return;
  if (V.value.length || k.value.length) return;
  const H = co();
  if (H?.load)
    try {
      const g = (await H.load())?.state;
      if (!g || typeof g != "object") return;
      const j = Array.isArray(g.runs) ? g.runs : [], le = Array.isArray(g.genNodes) ? g.genNodes : [];
      if (!(!!g.busy || j.some((m) => m?.state === "failed" || m?.state === "running" || m?.state === "pending") || le.some((m) => m?.state === "failed" || m?.state === "running"))) {
        try {
          H.save?.({ startedAt: 0, busy: !1, runs: [], genNodes: [], genMessage: "", genPreviewPath: "", savedAt: Date.now() }).catch(() => {
          });
        } catch {
        }
        return;
      }
      It.value = Number(g.startedAt) || 0, T.value = String(g.genMessage || ""), pe.value = String(g.genPreviewPath || ""), Mt.value = Number(g.genProgressAt) || 0, nl.value = 0;
      const ne = (m) => m && typeof m.key == "string" ? { key: String(m.key), label: String(m.label || m.key), state: m.state || "pending" } : null, v = (m) => m && typeof m.platformId == "string" ? {
        // 落库数据清洗后仍只是「大致是个字符串」，不是编译期能保证的 OverseasPlatformId 字面量；
        // 真正的合法性校验交给消费方按 platformId 查平台定义时做（查不到就当无效平台处理）。
        platformId: String(m.platformId),
        platform: String(m.platform || m.platformId),
        icon: String(m.icon || ""),
        color: String(m.color || ""),
        file: String(m.file || ""),
        filePath: m.filePath ? String(m.filePath) : void 0,
        aspect: String(m.aspect || ""),
        steps: (Array.isArray(m.steps) ? m.steps : []).map(ne).filter(Boolean),
        state: ["pending", "running", "done", "failed"].includes(m.state) ? m.state : "pending",
        status: String(m.status || ""),
        detail: String(m.detail || "")
      } : null;
      k.value = (Array.isArray(g.genNodes) ? g.genNodes : []).filter((m) => m && typeof m.id == "string").map((m) => ({
        id: String(m.id),
        name: String(m.name || m.id),
        state: ["pending", "running", "done", "failed", "cancelled"].includes(m.state) ? m.state : "pending",
        etaSec: Number(m.etaSec) > 0 ? Number(m.etaSec) : void 0,
        startedAt: Number(m.startedAt) > 0 ? Number(m.startedAt) : void 0,
        kind: typeof m.kind == "string" ? m.kind : void 0
      })), V.value = (Array.isArray(g.runs) ? g.runs : []).map(v).filter(Boolean), g.busy && (it.value = !0, N.value = !1, k.value = k.value.map((m) => m.state === "running" || m.state === "pending" ? { ...m, state: "failed" } : m), V.value = V.value.map((m) => m.state === "running" || m.state === "pending" ? {
        ...m,
        state: "failed",
        status: m.status === "running" || !m.status ? "interrupted" : m.status,
        detail: m.detail || o.t("应用退出导致本次执行中断，未能确认平台状态；请到平台核对后重跑。"),
        steps: m.steps.map((L) => L.state === "running" || L.state === "pending" ? { ...L, state: "failed" } : L)
      } : m));
    } catch {
    }
}
function uo() {
  it.value = !1, It.value = Date.now(), V.value = [], k.value = [], T.value = "", pe.value = "", Mt.value = 0, nl.value = 0;
}
const ze = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/core-domain"];
if (!ze) throw new Error("宿主模块未就绪：npm:@totalclaw/core-domain");
ze.default;
const st = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/workflowResult.ts"];
if (!st) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/workflowResult.ts");
st.default;
const Ke = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/workflowAutoRun.ts"];
if (!Ke) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/workflowAutoRun.ts");
Ke.default;
const Y = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/overseasPublish.ts"];
if (!Y) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/overseasPublish.ts");
Y.default;
const Fa = ["dir"], Ra = { class: "hero" }, Ua = { class: "hero-copy" }, za = { class: "eyebrow" }, Ka = { class: "hero-tags" }, ja = ["aria-label"], Ga = ["title"], Ha = {
  key: 0,
  "aria-hidden": "true"
}, Ja = { class: "hero-actions" }, qa = ["disabled"], Ya = ["aria-label"], Za = ["aria-selected", "onClick"], Xa = { class: "ads-tab-intro" }, Qa = {
  key: 0,
  class: "campaign-guide"
}, xa = { class: "step-no" }, er = {
  key: 0,
  class: "ri-check-line"
}, tr = { class: "step-body" }, lr = { class: "media-engine-grid" }, nr = { key: 0 }, or = {
  key: 0,
  class: "media-engine-warning"
}, ar = { class: "production-settings" }, rr = { class: "ps-block" }, ir = { class: "ps-label" }, sr = { class: "ps-modes" }, cr = ["onClick"], dr = { class: "ps-block" }, ur = { class: "ps-label" }, mr = { class: "ps-aspects" }, pr = ["checked", "onChange"], vr = { class: "ps-hint" }, gr = { class: "ps-block ps-audio-row" }, fr = { class: "ps-switch-text" }, yr = { class: "ps-field" }, hr = ["value"], kr = { class: "ps-field" }, br = ["value"], Er = { class: "ps-field-hint" }, Nr = { class: "step-no" }, Vr = {
  key: 0,
  class: "ri-check-line"
}, Sr = { class: "step-body" }, wr = { class: "guide-platform-strip" }, _r = ["checked", "onChange"], Dr = ["title"], Ar = { class: "guide-id-note" }, $r = ["onClick"], Cr = { class: "step-no" }, Br = {
  key: 0,
  class: "ri-check-line"
}, Tr = { class: "step-body" }, Lr = { class: "creative-source-actions" }, Pr = ["disabled"], Ir = ["disabled"], Mr = {
  key: 0,
  class: "ri-checkbox-circle-fill chosen-mark"
}, Or = {
  key: 0,
  class: "prompt-inline"
}, Wr = { class: "prompt-brief" }, Fr = { class: "prompt-scenes" }, Rr = ["onUpdate:modelValue", "title"], Ur = { value: "" }, zr = ["value"], Kr = ["onUpdate:modelValue"], jr = ["onUpdate:modelValue"], Gr = ["onUpdate:modelValue"], Hr = { class: "creative-preview" }, Jr = ["src"], qr = {
  key: 1,
  class: "ri-image-line"
}, Yr = {
  key: 2,
  class: "ri-video-line"
}, Zr = { class: "creative-meta" }, Xr = { class: "creative-meta" }, Qr = ["aria-label"], xr = ["title", "onClick"], ei = {
  key: 2,
  class: "creative-error"
}, ti = { class: "step-no" }, li = {
  key: 0,
  class: "ri-check-line"
}, ni = { class: "step-body" }, oi = { class: "creative-fields" }, ai = ["placeholder"], ri = { class: "span-wide" }, ii = ["placeholder"], si = ["aria-label"], ci = { class: "platform-topics-head" }, di = ["onUpdate:modelValue", "placeholder"], ui = {
  key: 0,
  class: "platform-topics-empty"
}, mi = { class: "step-body run-body" }, pi = ["disabled"], vi = { class: "run-live-head" }, gi = ["disabled"], fi = { class: "publish-progress-bar" }, yi = { class: "run-live-nodes" }, hi = { class: "node-eta" }, ki = {
  key: 0,
  class: "run-gen-msg"
}, bi = { class: "run-live-head" }, Ei = { class: "publish-progress-bar" }, Ni = { class: "run-live-nodes" }, Vi = ["title", "onClick"], Si = {
  key: 2,
  class: "run-blocked"
}, wi = { class: "run-blocked" }, _i = { class: "run-ok" }, Di = { class: "guide-side" }, Ai = { class: "side-head" }, $i = ["disabled"], Ci = { class: "side-note" }, Bi = { class: "ps-toggle auto-publish-toggle" }, Ti = {
  key: 0,
  class: "section-state"
}, Li = {
  key: 1,
  class: "ads-video-history"
}, Pi = { class: "ads-video-icon" }, Ii = { class: "ads-video-meta" }, Mi = {
  key: 0,
  class: "ads-video-aspect"
}, Oi = {
  key: 0,
  class: "ads-video-fit"
}, Wi = { class: "fit-ok" }, Fi = {
  key: 0,
  class: "fit-miss"
}, Ri = { class: "ads-video-actions" }, Ui = ["disabled", "title", "onClick"], zi = ["disabled", "onClick"], Ki = ["disabled", "onClick"], ji = ["onClick"], Gi = { class: "ads-video-pager" }, Hi = ["disabled"], Ji = ["disabled"], qi = ["aria-label"], Yi = { class: "publish-runs-head" }, Zi = { class: "publish-progress-bar" }, Xi = { class: "run-aspect" }, Qi = ["title"], xi = { class: "run-steps" }, es = {
  key: 0,
  class: "run-detail"
}, ts = {
  key: 1,
  class: "growth-entry-grid solo"
}, ls = {
  key: 0,
  class: "platform-entry-card"
}, ns = { class: "entry-heading" }, os = { class: "section-kicker" }, as = { class: "platform-login-grid" }, rs = { class: "access-tile-heading" }, is = { class: "platform-logo" }, ss = ["title"], cs = ["checked", "onChange"], ds = ["aria-label"], us = ["aria-checked", "onClick"], ms = ["aria-checked", "onClick"], ps = {
  key: 0,
  class: "access-google-note"
}, vs = ["disabled", "onClick"], gs = {
  key: 0,
  class: "quick-login-note"
}, fs = {
  key: 2,
  class: "generated-ad-preview"
}, ys = { class: "ad-preview-copy" }, hs = { class: "section-kicker" }, ks = ["aria-label"], bs = ["aria-selected", "onClick"], Es = { class: "ad-preview-avatar" }, Ns = { class: "ad-preview-visual" }, Vs = ["src", "alt"], Ss = {
  key: 1,
  class: "ad-preview-video"
}, ws = {
  class: "ad-preview-body",
  dir: "rtl"
}, _s = { class: "gate-icon" }, Ds = {
  key: 0,
  class: "ri-loader-4-line spin"
}, As = {
  key: 1,
  class: "ri-cloud-off-line"
}, $s = {
  key: 2,
  class: "ri-shield-check-line"
}, Cs = {
  key: 3,
  class: "ri-forbid-2-line"
}, Bs = { key: 0 }, Ts = { key: 1 }, Ls = { key: 2 }, Ps = { key: 3 }, Is = { key: 4 }, Ms = { key: 5 }, Os = { key: 6 }, Ws = {
  key: 0,
  class: "gate-state"
}, Fs = ["aria-label"], Rs = {
  key: 6,
  class: "panel"
}, Us = { class: "section-head" }, zs = { class: "section-kicker" }, Ks = { class: "section-note" }, js = { class: "muted" }, Gs = {
  key: 0,
  class: "section-state"
}, Hs = {
  key: 1,
  class: "platform-grid"
}, Js = { class: "platform-title" }, qs = { class: "platform-mark" }, Ys = { key: 0 }, Zs = { key: 1 }, Xs = {
  key: 0,
  class: "platform-warning"
}, Qs = {
  key: 1,
  class: "platform-warning"
}, xs = {
  key: 2,
  class: "capabilities"
}, ec = { key: 0 }, tc = { class: "platform-actions" }, lc = ["disabled", "onClick"], nc = ["disabled", "onClick"], oc = ["disabled", "onClick"], ac = {
  key: 4,
  class: "web-session"
}, rc = { class: "web-session-actions" }, ic = ["disabled", "onClick"], sc = ["disabled", "onClick"], cc = {
  key: 2,
  class: "inline-error"
}, dc = {
  key: 7,
  class: "panel"
}, uc = { class: "section-head" }, mc = { class: "section-kicker" }, pc = { class: "muted" }, vc = { class: "review-controls" }, gc = { class: "field" }, fc = { class: "field" }, yc = { class: "field" }, hc = ["value"], kc = { class: "field" }, bc = { class: "review-platforms" }, Ec = ["value"], Nc = { class: "review-actions" }, Vc = ["disabled"], Sc = ["disabled"], wc = { class: "ads-chart-card" }, _c = { class: "ads-chart-head" }, Dc = {
  key: 1,
  class: "ads-chart sd-hint"
}, Ac = {
  key: 0,
  class: "result-block wide"
}, $c = { class: "result-title" }, Cc = {
  key: 1,
  class: "report"
}, Bc = { class: "metric-grid" }, Tc = { class: "ads-chart-card" }, Lc = { class: "ads-chart-head" }, Pc = { class: "ads-chart sd-hint" }, Ic = {
  key: 0,
  class: "report-platform-grid"
}, Mc = {
  key: 1,
  class: "findings"
}, Oc = { key: 0 }, Wc = {
  key: 2,
  class: "report-notes"
}, Fc = { class: "result-block wide" }, Rc = { class: "result-title" }, Uc = {
  key: 8,
  class: "panel"
}, zc = { class: "section-head" }, Kc = { class: "section-kicker" }, jc = ["disabled"], Gc = { class: "audit-filters" }, Hc = { class: "field" }, Jc = { value: "" }, qc = ["value"], Yc = { class: "field" }, Zc = ["placeholder"], Xc = ["disabled"], Qc = {
  key: 0,
  class: "section-state"
}, xc = {
  key: 1,
  class: "inline-error"
}, ed = {
  key: 2,
  class: "section-state"
}, td = {
  key: 3,
  class: "audit-table-wrap"
}, ld = { class: "audit-table" }, nd = ["aria-label"], od = ["disabled"], ad = ["aria-current", "onClick"], rd = ["disabled"], id = {
  key: 9,
  class: "panel automation-panel"
}, sd = { class: "section-head" }, cd = { class: "section-kicker" }, dd = ["disabled"], ud = { class: "tab-section-note" }, md = { class: "cron-list" }, pd = { class: "cron-toggle" }, vd = ["onUpdate:modelValue", "disabled"], gd = { class: "cron-plan" }, fd = ["onUpdate:modelValue"], yd = { value: "daily" }, hd = { value: "weekly" }, kd = { value: "hours" }, bd = { key: 0 }, Ed = ["onUpdate:modelValue"], Nd = ["value"], Vd = { key: 1 }, Sd = ["onUpdate:modelValue"], wd = ["value"], _d = { key: 2 }, Dd = { class: "cron-time" }, Ad = ["onUpdate:modelValue"], $d = ["value"], Cd = ["onUpdate:modelValue"], Bd = ["value"], Td = { class: "cron-hint" }, Ld = {
  key: 0,
  class: "cron-video-dir"
}, Pd = { class: "credential-input with-action" }, Id = ["placeholder"], Md = {
  key: 0,
  class: "operation-state"
}, Od = ["aria-label"], Wd = { class: "section-kicker" }, Fd = ["aria-label"], Rd = { class: "credential-fields" }, Ud = ["value"], zd = { key: 0 }, Kd = { key: 1 }, jd = { key: 3 }, Gd = ["onUpdate:modelValue", "type", "placeholder"], Hd = ["aria-label", "onClick"], Jd = { class: "credential-input" }, qd = ["placeholder"], Yd = {
  key: 0,
  class: "credential-error"
}, Zd = ["disabled"], Xd = ["disabled"], Qd = ["aria-label"], xd = { class: "section-kicker" }, eu = ["aria-label"], tu = { class: "credential-fields" }, lu = { class: "credential-input with-action" }, nu = ["placeholder"], ou = { class: "span-wide" }, au = { class: "prompt-actions" }, ru = ["disabled"], iu = { key: 0 }, su = {
  key: 0,
  class: "prompt-scenes"
}, cu = ["onUpdate:modelValue", "title"], du = { value: "" }, uu = ["value"], mu = ["onUpdate:modelValue"], pu = ["onUpdate:modelValue"], vu = ["onUpdate:modelValue"], gu = {
  key: 1,
  class: "credential-hint"
}, fu = {
  key: 2,
  class: "credential-error"
}, yu = ["disabled"], hu = ["aria-label"], ku = { class: "section-kicker" }, bu = { class: "preview-path" }, Eu = ["aria-label"], Nu = { class: "video-preview-body" }, Vu = {
  key: 0,
  class: "ri-loader-4-line spin"
}, Su = ["src"], wu = { key: 2 }, _u = ["aria-label"], Du = { class: "section-kicker" }, Au = ["aria-label"], $u = {
  key: 0,
  class: "credential-info"
}, Cu = {
  key: 1,
  class: "credential-info"
}, Bu = { class: "credential-fields" }, Tu = { key: 0 }, Lu = { key: 1 }, Pu = ["onUpdate:modelValue", "type", "placeholder"], Iu = ["aria-label", "onClick"], Mu = { key: 0 }, Ou = {
  key: 0,
  class: "credential-error"
}, Wu = ["disabled"], Fu = ["disabled"], rt = 10, Zn = "totalclaw:global-ads-material-fallback:v1", Xn = "totalclaw:global-ads-auto-publish:v1", Qn = "totalclaw:global-ads-video-history:v1", Ml = 5, xn = "totalclaw:global-ads-prompt-scenes:v1", eo = "totalclaw:global-ads-prompt-chosen:v1", to = "totalclaw:global-ads-material-dir:v1", lo = "totalclaw:global-ads-cron-video-dir:v1", no = "totalclaw:global-ads-publish-log:v1", Ru = /* @__PURE__ */ e.defineComponent({
  __name: "GlobalAdsWorkbenchView",
  setup(O) {
    Fl.use([Rl.CanvasRenderer, ll.BarChart, ll.LineChart, Pt.GridComponent, Pt.LegendComponent, Pt.TooltipComponent]);
    const je = [
      {
        id: "facebook",
        label: "Facebook",
        caption: "Business Manager",
        loginUrl: "https://business.facebook.com/",
        icon: "ri-facebook-fill",
        color: "#1877f2"
      },
      {
        id: "instagram",
        label: "Instagram",
        caption: "Professional Account",
        loginUrl: "https://www.instagram.com/accounts/login/",
        icon: "ri-instagram-line",
        color: "#d62976"
      },
      {
        id: "google_ads",
        label: "Google Ads",
        caption: "Ads Manager",
        loginUrl: "https://ads.google.com/",
        icon: "ri-google-fill",
        color: "#4285f4"
      },
      {
        id: "youtube",
        label: "YouTube",
        caption: "YouTube Studio",
        loginUrl: "https://studio.youtube.com/",
        icon: "ri-youtube-fill",
        color: "#ff0033"
      }
    ], H = /* @__PURE__ */ new Set(["google_ads"]), b = je.filter((t) => !H.has(t.id)), g = {
      facebook: o.t("FB 广告账户 act_…"),
      instagram: o.t("IG 商业账号 ID"),
      youtube: o.t("YouTube 频道 ID"),
      google_ads: "Google Ads Customer ID"
    }, j = H.has("google_ads") ? ["web-login"] : [], le = b.map((t) => t.label).join(o.t("、")), ct = b.map((t) => o.t(g[t.id])).join(o.t("、")), ne = {
      facebook: [
        { key: "system_user_token", label: "Meta System User Token", placeholder: "EAAG…", secret: !0, required: !0 },
        { key: "app_secret", label: "Meta App Secret", placeholder: "App Secret", secret: !0 },
        { key: "app_id", label: "App ID", placeholder: "1234567890123456" },
        { key: "business_id", label: "Business ID", placeholder: "987654321098765" },
        { key: "ad_account_id", label: "Ad Account ID", placeholder: "act_1112223334445" },
        { key: "page_id", label: "Page ID", placeholder: "101010101010101" },
        { key: "pixel_id", label: "Pixel ID", placeholder: "202020202020202" },
        { key: "api_version", label: o.t("Graph API 版本"), placeholder: "v20.0", defaultValue: "v20.0" }
      ],
      instagram: [
        {
          key: "system_user_token",
          label: o.t("共享 Meta System User Token"),
          placeholder: "EAAG…",
          secret: !0,
          required: !0,
          sharedMeta: !0
        },
        { key: "app_secret", label: o.t("共享 Meta App Secret"), placeholder: "App Secret", secret: !0, sharedMeta: !0 },
        {
          key: "ig_business_account_id",
          label: "Instagram Business Account ID",
          placeholder: "17841400000000000",
          hint: "必须是 Business / Creator 账号对应的数字 ID，不是 @handle。"
        },
        { key: "linked_page_id", label: o.t("关联 Facebook Page ID"), placeholder: "101010101010101" },
        { key: "ad_account_id", label: "Ad Account ID", placeholder: "act_1112223334445" },
        { key: "api_version", label: o.t("Graph API 版本"), placeholder: "v20.0", defaultValue: "v20.0" }
      ],
      google_ads: [
        { key: "developer_token", label: "Developer Token", placeholder: "AbC-dEf…", secret: !0, required: !0 },
        { key: "refresh_token", label: "OAuth Refresh Token", placeholder: "1//0g…", secret: !0, required: !0 },
        { key: "client_secret", label: "OAuth Client Secret", placeholder: "GOCSPX-…", secret: !0 },
        {
          key: "login_customer_id",
          label: "Manager Customer ID",
          placeholder: "1234567890",
          hint: o.t("10 位纯数字，不要输入横杠。")
        },
        { key: "customer_id", label: "Customer ID", placeholder: "9876543210", hint: o.t("10 位纯数字，不要输入横杠。") },
        { key: "oauth_client_id", label: "OAuth Client ID", placeholder: "8888-xxxx.apps.googleusercontent.com" },
        { key: "api_version", label: o.t("Google Ads API 版本"), placeholder: "v18", defaultValue: "v18" }
      ],
      youtube: [
        { key: "refresh_token", label: "YouTube Refresh Token", placeholder: "1//0g…", secret: !0, required: !0 },
        { key: "client_secret", label: "OAuth Client Secret", placeholder: "GOCSPX-…", secret: !0 },
        { key: "channel_id", label: "Channel ID", placeholder: "UCxxxxxxxxxxxxxxxxxxxx" },
        { key: "oauth_client_id", label: "OAuth Client ID", placeholder: "8888-yyyy.apps.googleusercontent.com" },
        { key: "paid_delegate_to", label: o.t("付费广告委派平台"), placeholder: "google_ads", defaultValue: "google_ads" }
      ]
    }, v = zl.useNotificationStore(), m = Ol.useRouter(), L = e.ref(null), dt = e.ref(!1), De = e.ref(""), ol = e.ref([]), al = e.ref(!1), ut = e.ref(""), mt = e.ref(!1), K = e.reactive({}), ve = e.reactive({}), P = e.reactive({}), ee = e.reactive({
      facebook: "web",
      instagram: "web",
      google_ads: "web",
      youtube: "web"
    }), pt = e.ref(!1), jl = Kl.createNativeBrowserModalLock(), Ge = e.ref("facebook"), ge = e.reactive({}), Ae = e.reactive({}), $e = e.ref(!1), He = e.ref(""), rl = e.ref(null), Gl = e.ref(null), w = e.ref([]), vt = e.ref(!1), oe = e.ref(""), _ = e.reactive({
      brandName: "UAE Growth Campaign",
      arabicHeadline: "اكتشف علامتنا في الإمارات"
    }), Ot = e.ref("facebook"), Ce = e.ref(""), ae = e.ref(""), A = e.reactive({
      mode: "api",
      tenantId: "tenant-uae-demo"
    }), Hl = e.ref(null), Be = e.ref([]), h = e.reactive({
      since: qn(6),
      until: qn(0),
      insightsPlatform: "facebook",
      insightsMode: "api",
      platforms: b.map((t) => t.id),
      comparePrevious: !0
    }), Wt = e.ref(!1), fe = e.ref(null), Ft = e.ref(!1), ye = e.ref(null), Je = e.ref(!1), Rt = e.ref(""), he = e.ref([]), qe = e.reactive({ platform: "", tenantId: "" }), Z = e.ref(1), il = e.computed(() => Math.max(1, Math.ceil(he.value.length / rt))), mo = e.computed(() => {
      const t = (Z.value - 1) * rt;
      return he.value.slice(t, t + rt);
    }), po = e.computed(() => Array.from({ length: il.value }, (t, n) => n + 1)), vo = e.computed(() => he.value.length ? (Z.value - 1) * rt + 1 : 0), go = e.computed(() => Math.min(Z.value * rt, he.value.length)), sl = [
      {
        id: "campaign",
        icon: "ri-advertisement-line",
        label: o.t("投放工作区"),
        desc: o.t("上传客户素材、配置制作引擎（视频模型与 TTS 配音）、真实生成并挑选广告视频，然后一键进入多平台投放工作流。")
      },
      {
        id: "connect",
        icon: "ri-plug-line",
        label: o.t("平台连接"),
        desc: o.t("接入并登录下方列出的各投放平台：每个平台可选 Web 登录（客户本人扫码或输密码）或 API 凭据接入，实时展示各平台连接与登录状态。")
      },
      {
        id: "scenarios",
        icon: "ri-slideshow-3-line",
        label: o.t("场景执行台"),
        desc: o.t("与「投放工作区」五步向导相互独立的演示 / 排查场景：作业包发布、跨平台指标复盘等。日常投放请用五步向导。")
      },
      {
        id: "insights",
        icon: "ri-line-chart-line",
        label: o.t("指标与复盘"),
        desc: o.t("拉取各平台真实投放指标，生成跨平台复盘报告与确定性优化发现；未授权平台不会出现虚构数据。")
      },
      {
        id: "audit",
        icon: "ri-shield-check-line",
        label: o.t("操作审计"),
        desc: o.t("每一次广告校验、创建与平台回执都有可追溯的审计流水，支持按平台与租户筛选。")
      },
      {
        id: "automation",
        icon: "ri-timer-line",
        label: o.t("定时自动化"),
        desc: o.t("把跨平台复盘、平台巡检等环节配置成真实定时任务，让投放链路按节奏自动运转；预算变更始终保留人工确认。")
      }
    ], z = e.ref("campaign"), fo = e.computed(() => sl.find((t) => t.id === z.value) || sl[0]), cl = e.reactive({ platforms: !1, info: !1 }), gt = e.computed(() => X.value.length > 0), Ut = e.computed(() => J.value === "dynamic" && Ne.value && I.value.length > 0 && !!G.value.trim()), Ye = e.computed(() => !!ce.value || !!B.value || Ut.value), ft = e.computed(() => cl.info && !!A.tenantId.trim()), Jl = [
      { icon: "ri-briefcase-4-line", label: o.t("客户需求"), detail: o.t("品牌、市场、预算、KPI、受众") },
      { icon: "ri-focus-3-line", label: o.t("市场策略"), detail: o.t("阿英双语 · 本地化 · 渠道组合") },
      { icon: "ri-palette-line", label: o.t("素材适配"), detail: o.t("客户上传素材 · 阿语文案") },
      { icon: "ri-advertisement-line", label: o.t("跨平台投放"), detail: "Facebook · Instagram · Ads · YouTube" },
      { icon: "ri-line-chart-line", label: o.t("数据复盘"), detail: o.t("花费 · 触达 · 点击 · 转化") },
      { icon: "ri-settings-4-line", label: o.t("账户优化"), detail: o.t("预算 · 受众 · 素材 · 落地页") }
    ], dl = e.ref([]), ql = e.ref(!1);
    let ul = null;
    e.onUnmounted(() => {
      try {
        ul?.();
      } catch {
      }
      ul = null;
    });
    async function Te(t = 0) {
      ql.value = !0;
      try {
        const n = await window.electronAPI?.mediaModel?.get?.(), a = Array.isArray(n?.kinds) ? n.kinds : [];
        a.length ? dl.value = a : !dl.value.length && t < 5 && window.setTimeout(() => {
          Te(t + 1);
        }, 2e3 * (t + 1));
      } catch (n) {
        console.warn("[ads-media] 读取媒体模型配置失败，稍后重试", { attempt: t, error: n }), t < 5 && window.setTimeout(() => {
          Te(t + 1);
        }, 2e3 * (t + 1));
      } finally {
        ql.value = !1;
      }
    }
    function Ze(t) {
      return dl.value.find((n) => n.kind === t) || null;
    }
    const ke = e.computed(() => {
      const t = Ze("video"), n = t?.providers.find((a) => a.id === t.activeProvider);
      return n?.configured ? String(t?.activeModel || "").trim() || n.defaultModel || n.label : "";
    }), yt = e.computed(() => {
      const t = Ze("video");
      if (!t) return { tone: "missing", detail: o.t("登录后可读取视频生成模型配置") };
      if (t.providers.find((l) => l.id === t.activeProvider)?.configured)
        return { tone: "ready", detail: "" };
      const a = t.providers.find((l) => l.configured);
      return a ? { tone: "partial", detail: o.t("{p0} 已接入，还未设为默认视频生成引擎", { p0: a.label }) } : { tone: "missing", detail: o.t("未配置 —— 请选择接入引擎并填入密钥") };
    }), ml = e.computed(() => {
      const t = Ze("tts");
      if (!t) return { tone: "missing", detail: o.t("登录后可读取当前 TTS 配置") };
      const n = t.providers.find((l) => l.id === t.activeProvider);
      if (n?.configured)
        return { tone: "ready", detail: o.t("当前默认：{p0}", { p0: n.label }) };
      const a = t.providers.find((l) => l.configured);
      return a ? { tone: "partial", detail: o.t("已接入 {p0}，建议设为默认", { p0: a.label }) } : { tone: "missing", detail: o.t("配置一个配音引擎后旁白才可用") };
    }), pl = e.computed(() => yt.value.tone === "ready"), yo = e.computed(() => [
      { id: "slideshow", icon: "ri-slideshow-3-line", label: o.t("图片成片"), desc: o.t("素材图片一键成片（oneclick_from_folder 脚本，快、稳定）") },
      {
        id: "dynamic",
        icon: "ri-movie-2-line",
        label: o.t("动态视频生成"),
        desc: ke.value ? o.t("由 {p0} 用参考图生成运镜与动态镜头", { p0: ke.value }) : o.t("用参考图生成运镜与动态镜头（需先在上方配置视频生成模型）")
      }
    ]), J = e.ref("slideshow"), ho = [
      { value: "9:16", label: "9:16", hint: o.t("竖屏 / Reels / Shorts") },
      { value: "4:5", label: "4:5", hint: o.t("竖版信息流帖子") },
      { value: "16:9", label: "16:9", hint: o.t("横屏 / 常规视频") },
      { value: "1:1", label: "1:1", hint: o.t("方形") }
    ], Le = e.ref(["9:16"]), Yl = e.ref(!1);
    function ko(t) {
      Yl.value = !0;
      const n = new Set(Le.value);
      n.has(t) ? n.delete(t) : n.add(t), Le.value = n.size ? [...n] : [t];
    }
    const ht = {
      instagram: { recommended: "9:16", accepts: ["9:16", "4:5", "1:1", "16:9"], note: o.t("Reels 收 9:16；普通帖只接受 4:5 ~ 16:9") },
      // ⚠️ accepts 里**不能**有 9:16：Business Suite 的帖子编辑器发布目标是 IG 账号，
      // 实测直接拒 9:16（"doesn't fit within Instagram's accepted aspect ratio range of 4:5 to 16:9"），
      // Publish 会一直 aria-disabled。9:16 只能走 Reels 编辑器（= instagram 那条）。
      facebook: { recommended: "4:5", accepts: ["4:5", "1:1", "16:9"], note: o.t("Feed 帖只接受 4:5 ~ 16:9；9:16 请走 Reels") },
      youtube: { recommended: "16:9", accepts: ["16:9", "9:16"], note: o.t("常规视频 16:9；≤60 秒 9:16 自动识别为 Shorts") },
      google_ads: { recommended: "16:9", accepts: ["16:9", "1:1", "4:5"], note: o.t("视频广告由 YouTube 承载，以 16:9 为主") }
    }, zt = e.computed(() => Le.value.length ? Le.value : ["9:16"]);
    function bo(t) {
      const n = X.value.filter((l) => ht[l.id]?.recommended === t).map((l) => l.label);
      if (n.length) return o.t("{p0} 推荐", { p0: n.join(" / ") });
      const a = X.value.filter((l) => (ht[l.id]?.accepts || []).includes(t)).map((l) => l.label);
      return a.length ? o.t("{p0} 可用", { p0: a.join(" / ") }) : "";
    }
    function vl(t) {
      const n = t.path.replace(/-(9x16|4x5|16x9|1x1)\.mp4$/i, ""), a = W.value.filter((i) => i.path === t.path || i.path.startsWith(n) && C[i.path]), l = [], r = [];
      for (const i of X.value)
        a.some((d) => Zl(i.id, d.path)) ? l.push(i.label) : r.push(i.label);
      return { ok: l, miss: r };
    }
    function Eo(t) {
      const n = String(t.projectName || "").replace(/[（(]\s*\d+\s*[:：]\s*\d+\s*[）)]\s*$/, "").trim() || o.t("广告成片");
      return C[t.path] ? n : `${n}（${o.t("生成中")}）`;
    }
    function Xe(t) {
      const n = String(t || "").match(/-(9x16|4x5|16x9|1x1)\./i);
      return n ? n[1].replace("x", ":") : "";
    }
    function Zl(t, n) {
      const a = Xe(n);
      return a ? (ht[t]?.accepts || []).includes(a) : !0;
    }
    const Pe = e.ref(!0), No = [
      { id: "upbeat", label: o.t("轻快活力") },
      { id: "energetic", label: o.t("热烈有冲击力") },
      { id: "chill", label: o.t("松弛治愈") },
      { id: "emotional", label: o.t("温暖情绪") },
      { id: "dramatic", label: o.t("戏剧张力（电影感）") },
      { id: "corporate", label: o.t("商务专业") },
      { id: "lofi", label: o.t("Lo-Fi 慵懒") }
    ], Kt = e.ref("dramatic"), Ie = e.ref(
      localStorage.getItem(Zn) || ze.DEFAULT_MATERIAL_FALLBACK
    );
    ze.isMaterialFallbackStrategy(Ie.value) || (Ie.value = ze.DEFAULT_MATERIAL_FALLBACK), e.watch(Ie, (t) => {
      try {
        localStorage.setItem(Zn, t);
      } catch {
      }
    });
    const Vo = e.computed(
      () => ze.MATERIAL_FALLBACK_OPTIONS.find((t) => t.id === Ie.value)?.hint ?? ""
    ), kt = e.ref(localStorage.getItem(Xn) !== "false");
    e.watch(kt, (t) => {
      try {
        localStorage.setItem(Xn, t ? "true" : "false");
      } catch {
      }
    });
    const be = e.computed(() => J.value === "slideshow" || pl.value), Xl = e.ref(null), Ql = e.ref(1), So = e.computed(() => [
      { id: 1, label: o.t("配置制作引擎"), done: be.value },
      { id: 2, label: o.t("选择投放平台"), done: gt.value },
      { id: 3, label: o.t("准备素材"), done: Ye.value },
      { id: 4, label: o.t("填写投放信息"), done: ft.value },
      { id: 5, label: o.t("一键执行投放"), done: !1 }
    ]);
    function wo(t) {
      Ql.value = t;
      const n = Xl.value?.querySelectorAll(".guide-step")[t - 1];
      n && typeof n.scrollIntoView == "function" && n.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const jt = e.ref(!1), re = e.ref("video"), Ee = e.ref(""), Me = e.reactive({}), Oe = e.reactive({}), bt = e.ref(""), We = e.ref(!1), Qe = e.ref(""), xl = e.computed(() => Ze(re.value)?.providers || []), en = e.computed(() => xl.value.find((t) => t.id === Ee.value) || null), gl = e.computed(() => en.value?.keys || []), _o = e.computed(() => re.value === "tts" ? o.t("留空使用引擎默认声线") : en.value?.defaultModel || o.t("留空使用引擎默认模型"));
    e.watch(Ee, () => {
      for (const n of Object.keys(Me)) delete Me[n];
      const t = Ze(re.value);
      bt.value = t?.activeProvider === Ee.value ? String(t?.activeModel || "") : "";
    });
    function fl(t) {
      re.value = t, Qe.value = "";
      for (const n of Object.keys(Me)) delete Me[n];
      for (const n of Object.keys(Oe)) delete Oe[n];
      Ee.value = "", jt.value = !0;
      try {
        ul = window.electronAPI?.onMediaModelChanged?.(() => {
          Te();
        });
      } catch {
      }
      Te().then(() => {
        const n = Ze(t), a = t === "video" ? n?.providers.find((l) => l.id === "seedance")?.id || n?.activeProvider || n?.providers[0]?.id || "" : n?.activeProvider || n?.providers.find((l) => l.configured)?.id || n?.providers[0]?.id || "";
        Ee.value = a;
      });
    }
    function yl() {
      We.value || (jt.value = !1, Qe.value = "");
    }
    async function Do() {
      const t = Ee.value;
      if (t) {
        We.value = !0, Qe.value = "";
        try {
          const n = {};
          for (const r of gl.value) {
            const i = String(Me[r.env] || "").trim();
            i && (n[r.env] = i);
          }
          const a = gl.value.filter((r) => r.required && !r.set && !n[r.env]);
          if (a.length)
            throw new Error(o.t("请填写：{p0}", { p0: a.map((r) => r.label).join(", ") }));
          const l = window.electronAPI;
          if (!l?.mediaModel?.save) throw new Error(o.t("当前版本未开放媒体模型配置"));
          await l.mediaModel.save({
            kind: re.value,
            provider: t,
            env: n,
            setDefault: !0,
            ...bt.value.trim() ? { model: bt.value.trim() } : {}
          }), await Te(), window.dispatchEvent(new CustomEvent("totalclaw:media-model-changed", {
            detail: { kind: re.value, provider: t }
          })), v.success(re.value === "video" ? o.t("视频生成模型已保存并设为默认") : o.t("TTS 配音引擎已保存并设为默认")), jt.value = !1;
        } catch (n) {
          Qe.value = R(n);
        } finally {
          We.value = !1;
        }
      }
    }
    function Ao() {
      try {
        const t = localStorage.getItem(Qn), n = t ? JSON.parse(t) : [];
        return Array.isArray(n) ? n.filter((a) => !!a && typeof a.path == "string" && !!a.path) : [];
      } catch {
        return [];
      }
    }
    const W = e.ref(Ao()), C = e.reactive({}), te = e.ref(1), tn = e.computed(() => [...W.value].sort((t, n) => (n.createdAt || 0) - (t.createdAt || 0))), xe = e.computed(() => Math.max(1, Math.ceil(tn.value.length / Ml))), $o = e.computed(() => tn.value.slice((te.value - 1) * Ml, te.value * Ml));
    e.watch(xe, (t) => {
      te.value > t && (te.value = t);
    });
    const Et = e.ref(!1), B = e.ref(""), I = e.ref((() => {
      try {
        const t = JSON.parse(localStorage.getItem(xn) || "[]");
        return Array.isArray(t) ? t.filter((n) => n && typeof n.prompt == "string") : [];
      } catch {
        return [];
      }
    })()), ln = e.computed(() => {
      const t = /* @__PURE__ */ new Set();
      for (const n of w.value) n.kind === "image" && n.absolutePath && t.add(String(n.absolutePath));
      for (const n of I.value) n.referenceImage && t.add(n.referenceImage);
      return [...t];
    }), Ne = e.ref((() => {
      const t = localStorage.getItem(eo);
      return t === null ? I.value.length > 0 : t === "1";
    })());
    e.watch(Ne, (t) => {
      try {
        localStorage.setItem(eo, t ? "1" : "0");
      } catch {
      }
    });
    const se = e.ref(!1), Ve = e.ref("");
    function et() {
      try {
        localStorage.setItem(xn, JSON.stringify(I.value));
      } catch {
      }
    }
    async function Co() {
      if (se.value) return;
      const t = window.electronAPI?.solution?.listMediaDir, n = G.value.trim();
      if (!n || typeof t != "function") {
        Ve.value = o.t("请先选择素材文件夹");
        return;
      }
      se.value = !0, Ve.value = o.t("正在读取素材并撰写分镜…");
      try {
        const l = ((await t(n))?.files || []).filter((d) => d?.kind === "image").map((d) => String(d.path)).slice(0, 6);
        if (!l.length) {
          Ve.value = o.t("这个文件夹里没有图片素材，视频模型需要参考图作为首帧。");
          return;
        }
        const r = _.brandName.trim() || "UAE Growth Campaign";
        let i = [];
        try {
          const d = await Y.askLlmOnce("marketing-content-creator", [
            o.t("为品牌「{p0}」写一条面向阿联酋市场的 15–30 秒广告分镜，3 个场景。", { p0: r }),
            Se.value.trim(),
            o.t("可用的首帧参考图（按顺序分配，一个场景一张）：") + `
` + l.map((s, p) => `${p + 1}. ${s}`).join(`
`),
            // 运镜 prompt 必须是英文（视频模型只吃英文），但字幕是给人看/给 TTS 念的，跟随界面语言。
            // 2026-11-27 用户要求：本工作台生成的视频一律中文（运镜提示、字幕、旁白），不再带阿语副字幕。
            // 运镜 prompt 必须英文（视频模型只吃英文）。
            Gn(),
            o.t("只输出 JSON，不要解释、不要代码块。格式：") + ' {"scenes":[{"reference_image":"上面列出的绝对路径","duration":5,"prompt":"中文运镜提示…","caption":"中文字幕"}]}',
            o.t("严禁编造价格、优惠、功效或上下文里没有的事实。")
          ].filter(Boolean).join(`
`), 4e4), c = Y.extractJsonObject(d);
          i = (Array.isArray(c?.scenes) ? c.scenes : []).slice(0, 4).map((s, p) => ({
            id: `0${p + 1}`,
            referenceImage: l.includes(String(s?.reference_image)) ? String(s.reference_image) : l[p % l.length],
            duration: Number(s?.duration) > 0 ? Math.min(10, Number(s.duration)) : 5,
            prompt: String(s?.prompt || "").trim(),
            caption: String(s?.caption || "").trim(),
            // 成片统一中文（2026-11-27 用户要求）：不再要阿语副字幕
            captionAr: ""
          })).filter((s) => s.prompt), Ve.value = i.length ? o.t("已按素材生成分镜提示词，可逐条修改。") : "";
        } catch (d) {
          Ve.value = o.t("模型未按时返回，已按参考图顺序生成基础提示词，可自行修改：{p0}", { p0: R(d) });
        }
        if (!i.length) {
          const d = Hn(), c = r;
          i = l.slice(0, 3).map((s, p) => ({
            id: `0${p + 1}`,
            referenceImage: s,
            duration: 5,
            prompt: d[p % d.length],
            caption: p === 0 ? c : "",
            captionAr: ""
          }));
        }
        I.value = i, et();
      } catch (a) {
        Ve.value = R(a);
      } finally {
        se.value = !1;
      }
    }
    async function Bo() {
      I.value = I.value.map((a) => ({ ...a, prompt: a.prompt.trim(), caption: a.caption.trim(), captionAr: (a.captionAr || "").trim() })).filter((a) => a.prompt), et(), Ne.value = I.value.length > 0;
      const t = G.value.trim(), n = window.electronAPI?.solution?.listMediaDir;
      if (t && typeof n == "function" && !w.value.length)
        try {
          const a = await n(t);
          a?.ok && Array.isArray(a.files) && a.files.length && cn(a);
        } catch (a) {
          console.warn("[ads-assets] 保存提示词时载入素材失败（不影响提示词已保存）", a);
        }
      tt.value = !1, v.success(o.t("已保存 {p0} 个分镜提示词；第 5 步将按它出片", { p0: I.value.length }));
    }
    const tt = e.ref(!1);
    e.ref(!1);
    const G = e.ref(localStorage.getItem(to) || "");
    e.watch(G, (t) => {
      try {
        localStorage.setItem(to, t || "");
      } catch {
      }
    });
    function nn() {
      const t = zt.value.join(" / "), n = J.value === "slideshow" ? o.t("图片成片") : ke.value || o.t("动态视频生成"), a = Pe.value ? o.t("中文字幕 + 中文 TTS 旁白") : o.t("中文字幕（不加 AI 旁白，保留素材原声）");
      return o.t("制作一条 15–30 秒广告视频（画幅：{p0}；成片方式：{p1}）：{p2}，画面内文字一律用简体中文；突出品牌核心卖点与明确的行动引导；只使用素材内可核验的事实。", {
        p0: t,
        p1: n,
        p2: a
      });
    }
    const Se = e.ref(""), on = e.ref(!1);
    e.watch(Se, (t) => {
      t && t !== nn() && (on.value = !0);
    });
    const Gt = e.ref(!1), hl = e.ref(!1), Nt = e.ref(""), kl = e.ref("");
    function Ht() {
      try {
        localStorage.setItem(Qn, JSON.stringify(W.value));
      } catch {
      }
    }
    function an(t) {
      const n = new Date(t), a = (l) => String(l).padStart(2, "0");
      return `${n.getFullYear()}-${a(n.getMonth() + 1)}-${a(n.getDate())} ${a(n.getHours())}:${a(n.getMinutes())}`;
    }
    async function To() {
      const t = G.value.trim(), n = window.electronAPI?.solution?.listMediaDir;
      if (!t || typeof n != "function") return;
      const a = t.includes("\\") ? "\\" : "/", l = `${t.replace(/[\\/]+$/, "")}${a}${o.t("广告成片")}`;
      try {
        const r = await n(l);
        if (!r?.ok || !Array.isArray(r.files)) return;
        const i = new Set(W.value.map((c) => c.path)), d = r.files.filter((c) => c?.kind === "video" && !i.has(String(c.path))).map((c, s) => ({
          id: `disk-${Number(c.mtimeMs) || Date.now()}-${s}`,
          projectName: _.brandName.trim() || String(c.name).replace(/\.[^.]+$/, ""),
          path: String(c.path),
          createdAt: Number(c.mtimeMs) || Date.now()
        }));
        if (!d.length) return;
        W.value = [...d, ...W.value].sort((c, s) => (s.createdAt || 0) - (c.createdAt || 0)).slice(0, 200), Ht();
      } catch (r) {
        console.warn("[ads-video] 扫描成片目录失败（不影响已有历史）", r);
      }
    }
    async function rn() {
      if (!Et.value) {
        Et.value = !0;
        try {
          await To();
          for (const t of W.value)
            try {
              const n = await window.electronAPI?.solution?.inspectMedia?.(t.path);
              C[t.path] = n?.ok === !0;
            } catch {
              C[t.path] = !1;
            }
          B.value && !C[B.value] && (B.value = "");
        } finally {
          Et.value = !1;
        }
      }
    }
    function sn() {
      if (!be.value) {
        v.warn(o.t("请先配置视频生成模型，再生成广告视频")), fl("video");
        return;
      }
      on.value || (Se.value = nn()), tt.value = !0;
    }
    const lt = e.ref(!1), Jt = e.ref(8);
    function Lo(t) {
      const n = t.absolutePath || t.relativePath || t.name, a = w.value.filter((l) => (l.absolutePath || l.relativePath || l.name) !== n);
      if (t.previewUrl && t.previewUrl.startsWith("blob:"))
        try {
          URL.revokeObjectURL(t.previewUrl);
        } catch {
        }
      w.value = a, a.length || (oe.value = "");
    }
    async function Po() {
      if (Ne.value = !1, lt.value) return;
      const t = window.electronAPI?.solution;
      if (typeof t?.pickFolder != "function" || typeof t?.listMediaDir != "function") {
        Gl.value?.click();
        return;
      }
      try {
        const n = await t.pickFolder({ title: o.t("选择素材文件夹") });
        if (console.info("[ads-assets] 选择素材文件夹", { dir: n }), !n) return;
        lt.value = !0;
        const a = await t.listMediaDir(String(n));
        if (console.info("[ads-assets] 扫描结果", { ok: a?.ok, count: a?.files?.length, error: a?.error }), !a?.ok) {
          oe.value = a?.error || o.t("读取素材文件夹失败");
          return;
        }
        if (!Array.isArray(a.files) || !a.files.length) {
          oe.value = o.t("这个文件夹里没有找到可用的图片或视频素材。");
          return;
        }
        cn(a), G.value = String(a.dir || n), oe.value = "", console.info("[ads-assets] 已载入素材", { count: w.value.length, dir: G.value }), v.success(o.t("已载入 {p0} 个素材", { p0: w.value.length }));
      } catch (n) {
        console.error("[ads-assets] 读取素材文件夹失败", n), oe.value = R(n), v.fromException(o.t("读取素材文件夹失败"), n);
      } finally {
        lt.value = !1;
      }
    }
    function cn(t) {
      _l();
      const n = String(t.thumbDataUrl || "");
      let a = !1;
      w.value = t.files.map((l) => {
        const r = l.kind !== "video", i = r && !a && !!n;
        return i && (a = !0), {
          name: String(l.name),
          size: Number(l.size) || 0,
          type: String(l.type || ""),
          kind: r ? "image" : "video",
          previewUrl: i ? n : "",
          previewDataUrl: i ? n : "",
          relativePath: String(l.path),
          // 绝对路径是关键：生成与发布都靠它
          absolutePath: String(l.path)
        };
      });
    }
    async function dn() {
      try {
        const t = await window.electronAPI?.solution?.pickFolder?.();
        t && (G.value = t);
      } catch (t) {
        v.fromException(o.t("选择素材文件夹失败"), t);
      }
    }
    function Io(t) {
      B.value = B.value === t.path ? "" : t.path;
    }
    function un(t) {
      return [
        { key: "pick", label: o.t("按平台挑选成片画幅"), state: "pending" },
        ...Y.overseasPublishStepsFor(t)
      ];
    }
    function bl(t, n, a, l) {
      Y.finishOverseasPublishRun(t, n, a, l), V.value = [...V.value];
    }
    function Mo(t) {
      const n = (l) => l >= 60 ? o.t("{p0} 分 {p1} 秒", { p0: Math.floor(l / 60), p1: l % 60 }) : o.t("{p0} 秒", { p0: l }), a = Number(t.etaSec) > 0 ? n(Number(t.etaSec)) : "";
      if (t.state === "running" && t.startedAt) {
        const l = Math.max(0, Math.round((we.now.value - t.startedAt) / 1e3));
        if (we.suspect.value) return o.t("已用 {p0} · 可能已超时", { p0: n(l) });
        if (!a) return o.t("已用 {p0}", { p0: n(l) });
        const r = l - Number(t.etaSec);
        if (r > 5) {
          const i = we.sinceHeartbeatSec.value;
          return i != null && i < 120 ? o.t("已用 {p0} · 已超预计 {p1} · 仍在生成（{p2} 前有进度）", { p0: n(l), p1: n(r), p2: n(i) }) : o.t("已用 {p0} · 已超预计 {p1}", { p0: n(l), p1: n(r) });
        }
        return o.t("已用 {p0} · 预计 {p1}", { p0: n(l), p1: a });
      }
      return t.state === "done" ? "" : a ? o.t("预计 {p0}", { p0: a }) : "";
    }
    const qt = e.ref(null), nt = e.computed(() => k.value.find((t) => t.state === "running") || null), we = Wl.useStepWatchdog({
      running: () => N.value && !!nt.value,
      startedAt: () => nt.value?.startedAt,
      estimateMs: () => Number(nt.value?.etaSec) > 0 ? Number(nt.value.etaSec) * 1e3 : null,
      kind: () => nt.value?.kind || "generic",
      lastProgressAt: () => Mt.value || null,
      waitExtendedAt: () => nl.value || null,
      onHeartbeat: (t) => {
        Mt.value = t;
      },
      onKeepWaiting: (t) => {
        nl.value = t;
      }
    });
    function mn() {
      we.heartbeat();
    }
    const Vt = e.ref(""), St = e.ref(!1), wt = e.computed(() => N.value ? we.suspect.value ? { state: "suspect", message: "" } : null : k.value.some((n) => n.state === "failed") ? it.value && !V.value.length ? { state: "interrupted", message: T.value } : { state: "failed", message: T.value || o.t("成片生成失败") } : null);
    e.onBeforeUnmount(() => {
      window.removeEventListener("totalclaw:media-model-changed", Yn);
    });
    function Oo(t, n) {
      return new Promise((a) => {
        const l = Date.now(), r = window.setInterval(() => {
          if (t()) {
            window.clearInterval(r), a(!0);
            return;
          }
          Date.now() - l >= n && (window.clearInterval(r), a(!1));
        }, 200);
      });
    }
    async function Wo() {
      if (!(St.value || $.value)) {
        St.value = !0;
        try {
          if (N.value && (await _n(), !await Oo(() => !N.value, 2e4))) {
            v.warn(o.t("旧任务还没有退出，暂时无法重新生成；请稍后再试或重启应用。"));
            return;
          }
          await wn();
        } finally {
          St.value = !1;
        }
      }
    }
    class El extends Error {
      constructor() {
        super(...arguments), this.preflight = !0;
      }
    }
    async function Fo(t) {
      const n = window.electronAPI?.solution?.listMediaDir;
      if (typeof n != "function") return;
      if (J.value === "dynamic") {
        const r = Ne.value && I.value.some((d) => d.prompt.trim()), i = w.value.some((d) => d.kind === "image" && d.absolutePath);
        if (r || i) return;
      }
      let a = null;
      try {
        a = await n(t);
      } catch (r) {
        throw new El(o.t("素材文件夹读取失败：{p0}", { p0: R(r) }));
      }
      if (!a?.ok)
        throw new El(a?.error ? o.t("素材文件夹读取失败：{p0}", { p0: String(a.error) }) : o.t("素材文件夹读不到（可能已被移动或删除）：{p0}", { p0: t }));
      if (!(Array.isArray(a.files) ? a.files : []).filter((r) => r?.kind === "image").length)
        throw new El(J.value === "slideshow" ? o.t("素材文件夹里没有图片（jpg/png/webp/heic…），图片成片无法开始：{p0}。请在第 3 步换一个含图片的文件夹。", { p0: t }) : o.t("素材文件夹里没有图片，动态视频生成需要图片作为首帧参考图：{p0}。请在第 3 步换一个含图片的文件夹，或先生成分镜提示词。", { p0: t }));
    }
    function Ro(t) {
      if (t.state === "running") {
        const n = (Array.isArray(t.steps) ? t.steps : []).find((a) => a.state === "running");
        return n ? o.t(n.label) : o.t("执行中…");
      }
      return t.state === "done" ? t.status || o.t("已完成") : t.state === "failed" ? t.status || o.t("未完成") : o.t("待执行");
    }
    const pn = e.computed(() => V.value.filter((t) => t.state === "failed").length), ot = e.computed(() => {
      const t = V.value, n = (r) => Array.isArray(r?.steps) ? r.steps : [], a = t.reduce((r, i) => r + n(i).length, 0), l = t.reduce(
        (r, i) => r + n(i).filter((d) => d.state === "done" || d.state === "failed" || d.state === "skipped").length,
        0
      );
      return {
        total: a,
        done: l,
        percent: a ? Math.round(l / a * 100) : 0,
        platformsDone: t.filter((r) => r.state === "done" || r.state === "failed").length,
        platforms: t.length
      };
    });
    async function vn(t) {
      if ($.value) return;
      if (!C[t.path]) {
        v.warn(o.t("这条成片的文件当前读不到（可能已被移动或删除）：{p0}", { p0: t.path }));
        return;
      }
      const n = Dl();
      if (!n || typeof n.publish != "function") {
        v.warn(o.t("当前版本未开放广告内容发布"));
        return;
      }
      B.value = t.path;
      const a = t.path.replace(/-(9x16|4x5|16x9|1x1)\.mp4$/i, ""), l = W.value.filter((c) => c.path === t.path || c.path.startsWith(a) && C[c.path]), r = (c) => {
        const s = ht[c], p = l.find((y) => Xe(y.path) === s?.recommended);
        return p || l.find((y) => Zl(c, y.path)) || null;
      }, i = [], d = [];
      for (const c of X.value) {
        const s = r(c.id);
        s ? i.push({ platform: c, video: s }) : d.push(c.label);
      }
      if (d.length) {
        const c = new Set(de.value);
        for (const s of X.value)
          d.includes(s.label) && c.add(s.id);
        de.value = c, v.warn(o.t("这批成片的画幅（{p0}）不适用于 {p1}，已在第 2 步取消勾选。需要投这些平台请在「成片比例」里补勾对应画幅后重新生成。", {
          p0: [...new Set(l.map((s) => Xe(s.path)).filter(Boolean))].join(" / ") || o.t("未知"),
          p1: d.join(" / ")
        }));
      }
      if (!i.length) {
        v.warn(o.t("没有平台能接受这批成片的画幅，未执行发布。"));
        return;
      }
      $.value = t.id, V.value = i.map(({ platform: c, video: s }) => ({
        platformId: c.id,
        platform: c.label,
        icon: c.icon,
        color: c.color,
        file: s.path.split(/[\\/]/).pop() || s.path,
        // 重试要按这条绝对路径重新发，只留文件名是不够的
        filePath: s.path,
        aspect: Xe(s.path) || o.t("未标注"),
        steps: un(c.id),
        state: "pending",
        status: "pending",
        detail: ""
      }));
      try {
        for (let c = 0; c < i.length; c += 1) {
          const { platform: s, video: p } = i[c], y = V.value[c];
          await gn(y, s, p);
        }
      } finally {
        $.value = "", x();
      }
    }
    async function gn(t, n, a) {
      const l = Dl();
      if (!l || typeof l.publish != "function") {
        bl(t, !1, "blocked", o.t("当前版本未开放广告内容发布"));
        return;
      }
      const r = String(ue.youtube || "").trim(), i = _.arabicHeadline.trim(), d = [
        o.t("品牌 / 产品：{p0}", { p0: _.brandName.trim() || a.projectName }),
        i ? o.t("阿语广告标题：{p0}", { p0: i }) : "",
        r ? o.t("话题：{p0}", { p0: r }) : "",
        o.t("目标市场：阿联酋（UAE），受众为一般成年消费者。"),
        o.t("上面没给到的字段就别自己编：没有话题就不要加话题标签，没有阿语标题就只用中英文写。")
      ].filter(Boolean).join(`
`);
      await Y.runOverseasPublish(t, {
        platform: n.id,
        videoPath: a.path,
        title: a.projectName,
        caption: [_.arabicHeadline, ue[n.id] || ""].filter(Boolean).join(`
`),
        hashtags: String(ue[n.id] || "").split(/[\s,，]+/).filter(Boolean),
        tenantId: A.tenantId.trim() || "tenant-uae-demo",
        autoPublish: kt.value,
        contextBrief: d
      }, () => {
        V.value = [...V.value], x();
      });
    }
    async function fn(t) {
      if ($.value || N.value) return;
      const n = V.value.filter((a) => a.state === "failed" && (!t || a.platformId === t));
      if (n.length) {
        it.value = !1, $.value = `retry-${Date.now()}`;
        try {
          for (const a of n) {
            const l = b.find((d) => d.id === a.platformId), r = String(a.filePath || "");
            if (!l || !r) {
              bl(a, !1, "blocked", o.t("这条运行记录缺少成片路径，无法重试；请重新选择成片后执行。"));
              continue;
            }
            if ((await window.electronAPI?.solution?.inspectMedia?.(r))?.ok !== !0) {
              bl(
                a,
                !1,
                "blocked",
                o.t("这条成片的文件当前读不到（可能已被移动或删除）：{p0}", { p0: r })
              );
              continue;
            }
            C[r] = !0, a.steps = un(l.id), a.state = "pending", a.status = "pending", a.detail = "", V.value = [...V.value], await gn(a, l, {
              id: `retry-${l.id}`,
              projectName: _.brandName.trim() || l.label,
              path: r,
              createdAt: Date.now()
            });
          }
        } finally {
          $.value = "", x();
        }
      }
    }
    function Uo(t) {
      const n = W.value.find((a) => a.id === t);
      W.value = W.value.filter((a) => a.id !== t), Ht(), n && B.value === n.path && (B.value = "");
    }
    async function yn(t) {
      Gt.value = !0, hl.value = !0, Nt.value = "", kl.value = t.path;
      try {
        const n = await window.electronAPI?.solution?.previewMedia?.(t.path), a = n?.srcUrl || n?.dataUrl;
        if (!n?.ok || !a) throw new Error(n?.error || o.t("无法读取成片"));
        Nt.value = a, kl.value = n.path || t.path;
      } catch (n) {
        v.fromException(o.t("成片预览失败"), n);
      } finally {
        hl.value = !1;
      }
    }
    const Yt = [
      {
        key: "review",
        name: o.t("阿联酋广告·每日跨平台复盘"),
        desc: o.t("每天 09:00 拉取各投放平台指标并生成复盘报告"),
        cron: "0 9 * * *",
        prompt: o.t("用「阿联酋广告投放」能力拉取已开放投放平台最近 7 天的真实投放指标，生成跨平台复盘报告（中文+阿拉伯语摘要），标记创意疲劳与预算异常；不要执行任何预算修改，预算调整只生成待办交人工确认。")
      },
      {
        key: "patrol",
        name: o.t("阿联酋广告·平台登录巡检"),
        desc: o.t("每 6 小时检查各平台登录态与 API 凭据有效性，失效即生成提醒"),
        cron: "0 */6 * * *",
        prompt: o.t("巡检阿联酋广告工作台各已开放平台的登录会话与 API 凭据有效性；发现登录失效或凭据过期时生成一条明确的提醒说明哪个平台需要重新登录或补凭据，不要自动重试登录。")
      },
      {
        key: "weekly",
        name: o.t("阿联酋广告·每周投放周报"),
        desc: o.t("每周一 10:00 汇总上周投放数据，产出阿英双语周报"),
        cron: "0 10 * * 1",
        prompt: o.t("汇总阿联酋广告投放上一周（周一到周日）的跨平台投放数据，产出一份阿拉伯语+英语双语周报：花费、展示、点击、转化、各平台对比、发现与下周建议；数据缺失的平台如实标记，不得编造。")
      },
      {
        key: "video",
        name: o.t("阿联酋广告·定时视频投放"),
        desc: o.t("按计划从素材库真实生成 UAE 广告视频并自动发布到已登录平台（需先选择素材库）"),
        cron: "30 10 * * *",
        prompt: o.t("用「阿联酋广告投放」能力执行一轮定时视频投放：从素材库 {materialDir} 读取素材，真实生成一条 15–30 秒 9:16 的广告视频（中文字幕 + 中文 TTS 旁白，画面内文字一律用简体中文），随后对已登录的平台执行真实发布（YouTube 经外部 Chrome 上传，Meta 经 Business Suite），发布结果与回执写入审计；未登录的平台如实标记跳过，不得伪造成功。")
      }
    ], _t = e.reactive({ review: !0, patrol: !0, weekly: !0, video: !1 }), Dt = e.ref(!1), At = e.ref(""), Fe = e.ref(localStorage.getItem(lo) || "");
    e.watch(Fe, (t) => {
      try {
        localStorage.setItem(lo, t || "");
      } catch {
      }
      t.trim() || (_t.video = !1);
    });
    async function zo() {
      try {
        const t = await window.electronAPI?.solution?.pickFolder?.();
        t && (Fe.value = t);
      } catch (t) {
        v.fromException(o.t("选择素材文件夹失败"), t);
      }
    }
    const F = e.reactive({
      review: { freq: "daily", hour: 9, minute: 0, weekday: 1, everyHours: 6 },
      patrol: { freq: "hours", hour: 9, minute: 0, weekday: 1, everyHours: 6 },
      weekly: { freq: "weekly", hour: 10, minute: 0, weekday: 1, everyHours: 6 },
      video: { freq: "daily", hour: 10, minute: 30, weekday: 1, everyHours: 6 }
    }), Ko = Array.from({ length: 24 }, (t, n) => n), jo = [0, 15, 30, 45], Go = [1, 2, 3, 4, 6, 8, 12], Ho = [
      { value: 1, label: o.t("周一") },
      { value: 2, label: o.t("周二") },
      { value: 3, label: o.t("周三") },
      { value: 4, label: o.t("周四") },
      { value: 5, label: o.t("周五") },
      { value: 6, label: o.t("周六") },
      { value: 0, label: o.t("周日") }
    ];
    function hn(t) {
      return t.freq === "hours" ? `0 */${t.everyHours} * * *` : t.freq === "weekly" ? `${t.minute} ${t.hour} * * ${t.weekday}` : `${t.minute} ${t.hour} * * *`;
    }
    function Jo(t, n) {
      const a = String(t || "").trim().split(/\s+/);
      if (a.length !== 5) return { ...n };
      const [l, r, , , i] = a;
      return r.startsWith("*/") ? { ...n, freq: "hours", everyHours: Number(r.slice(2)) || n.everyHours } : /^\d+$/.test(l) && /^\d+$/.test(r) ? /^\d+$/.test(i) ? { ...n, freq: "weekly", minute: Number(l), hour: Number(r), weekday: Number(i) } : { ...n, freq: "daily", minute: Number(l), hour: Number(r) } : { ...n };
    }
    const kn = (t) => String(t).padStart(2, "0");
    function qo(t) {
      const n = String(t || "").trim().split(/\s+/);
      if (n.length !== 5) return o.t("5 段 cron 表达式：分 时 日 月 周");
      const [a, l, , , r] = n;
      return /^\d+$/.test(a) && /^\d+$/.test(l) && r === "*" ? o.t("每天 {p0}:{p1} 执行", { p0: l.padStart(2, "0"), p1: a.padStart(2, "0") }) : /^\d+$/.test(a) && l.startsWith("*/") ? o.t("每 {p0} 小时执行一次", { p0: l.slice(2) }) : /^\d+$/.test(a) && /^\d+$/.test(l) && /^\d+$/.test(r) ? o.t("每周第 {p0} 天 {p1}:{p2} 执行", { p0: r, p1: l.padStart(2, "0"), p2: a.padStart(2, "0") }) : o.t("按 cron 表达式执行");
    }
    async function Yo() {
      try {
        const t = await window.electronAPI?.listOpenclawCronJobs?.(), n = Array.isArray(t) ? t : t?.jobs || [];
        for (const a of Yt) {
          const l = n.find((r) => String(r?.name || "") === o.t(a.name));
          l && (_t[a.key] = l.enabled !== !1, l.cron && (F[a.key] = Jo(String(l.cron), F[a.key])));
        }
      } catch {
      }
    }
    async function Zo() {
      if (!Dt.value) {
        Dt.value = !0, At.value = "";
        try {
          const t = window.electronAPI;
          if (!t?.saveOpenclawCronJobs) throw new Error(o.t("当前版本未开放定时任务"));
          const n = await t.listOpenclawCronJobs?.(), a = Array.isArray(n) ? n : n?.jobs || [], l = Yt.map((c) => o.t(c.name)), r = Yt.filter((c) => _t[c.key] ? c.key === "video" && !Fe.value.trim() ? (v.warn(o.t("「定时视频投放」需要先选择素材库，本次未写入该任务")), !1) : !0 : !1).map((c) => ({
            name: o.t(c.name),
            cron: hn(F[c.key]),
            prompt: c.key === "video" ? o.t(c.prompt, { materialDir: Fe.value.trim() }) : o.t(c.prompt),
            deliver: "local",
            enabled: !0
          })), { upserts: i, deleteIds: d } = Ke.reconcileModuleCronJobs(a, r, l);
          i.length && await t.saveOpenclawCronJobs(i);
          for (const c of d) await t.deleteOpenclawCronJob?.(c);
          At.value = o.t("已写入 {p0} 条定时任务，可在「定时任务」页查看管理", { p0: r.length }), v.success(At.value);
        } catch (t) {
          v.fromException(o.t("定时任务保存失败"), t);
        } finally {
          Dt.value = !1;
        }
      }
    }
    const Xo = e.computed(
      () => o.i18n.global.locale.value === "ar" || document.documentElement.getAttribute("dir") === "rtl"
    ), $t = e.computed(() => !!L.value && !dt.value), _e = e.computed(() => (L.value?.regionAllowed ?? L.value?.region_allowed) !== !1), Zt = e.computed(
      () => !!h.since && !!h.until && h.since <= h.until
    ), bn = e.computed(() => ne[Ge.value]), Qo = e.computed(() => ie(Ge.value)), En = e.computed(
      () => bn.value.some((t) => String(ge[t.key] || "").trim())
    );
    e.watch(
      pt,
      (t) => jl.set(t),
      { flush: "post" }
    );
    const Ct = e.computed(() => {
      const t = /* @__PURE__ */ new Map();
      for (const n of ol.value) {
        const a = String(n?.platform || n?.id || "").toLowerCase();
        a && t.set(a, n);
      }
      return b.map((n) => {
        const a = t.get(n.id), l = ee[n.id];
        if (!a)
          return {
            id: n.id,
            label: n.label,
            enabled: !1,
            configured: !1,
            mode: l,
            driverFamily: "",
            accountKeys: [],
            missingSecrets: [],
            capabilities: [],
            webLogin: null,
            error: ut.value || o.t("平台未返回状态"),
            tone: "muted",
            statusLabel: o.t("未知"),
            isSandbox: !1
          };
        const r = a.configured === !0, i = a.enabled !== !1, d = l || (a.mode === "web" ? "web" : "api"), c = (a.demoSandbox === !0 || a.demo_sandbox === !0) && d === "api", s = Il(a.missingSecrets ?? a.missing_secrets), p = String(a.errorMessage || a.error_message || a.error || ""), y = Q(a.webLogin ?? a.web_login) ? a.webLogin ?? a.web_login : null, U = String(y?.state || "");
        let M = "ready", f = o.t("就绪");
        return c ? (M = "ready", f = o.t("Mock 沙箱")) : i ? d === "web" && U !== "ready" ? (M = "warning", f = o.t("待登录")) : d === "api" && (!r || s.length) ? (M = "warning", f = r ? o.t("待补凭据") : o.t("未配置")) : p && (M = "error", f = o.t("异常")) : (M = "muted", f = o.t("未启用")), {
          id: n.id,
          label: String(a.label || n.label),
          enabled: i,
          configured: r,
          mode: d,
          driverFamily: String(a.driverFamily || a.driver_family || ""),
          accountKeys: Il(a.accountKeys ?? a.account_keys).filter(Boolean),
          missingSecrets: s,
          capabilities: Il(a.capabilities),
          webLogin: y,
          error: p,
          tone: M,
          statusLabel: f,
          isSandbox: c
        };
      });
    }), Re = e.computed(() => Ct.value.some((t) => t.isSandbox && t.tone === "ready")), xo = e.computed(
      () => Ct.value.filter((t) => t.configured && t.enabled).length
    ), ce = e.computed(() => w.value.find((t) => t.kind === "image") ?? w.value[0] ?? null), Xt = e.computed(() => ce.value), Nn = e.computed(() => b.find((t) => t.id === Ot.value) || b[0]), Bt = e.computed(() => w.value.filter((t) => t.kind === "image").length), Tt = e.computed(() => w.value.filter((t) => t.kind === "video").length), Nl = e.computed(() => w.value.reduce((t, n) => t + n.size, 0)), ea = e.computed(() => {
      const t = [];
      return Bt.value && t.push(o.t("{count} 张图片", { count: Bt.value })), Tt.value && t.push(o.t("{count} 个视频", { count: Tt.value })), t.join(" · ");
    }), de = e.ref(/* @__PURE__ */ new Set()), ue = e.reactive({
      facebook: "",
      instagram: "",
      google_ads: "",
      youtube: ""
    }), X = e.computed(() => b.filter((t) => !de.value.has(t.id)));
    function ta() {
      return JSON.stringify(Object.fromEntries(
        X.value.map((t) => [t.id, String(ue[t.id] || "").trim()]).filter(([, t]) => t.length > 0)
      ));
    }
    e.watch(
      [() => _.brandName, () => _.arabicHeadline, () => A.tenantId, ue],
      () => {
        cl.info = !0;
      },
      { deep: !0 }
    ), e.watch(
      X,
      (t) => {
        if (Yl.value) return;
        const n = /* @__PURE__ */ new Set();
        for (const a of t) n.add(ht[a.id]?.recommended || "9:16");
        n.size && (Le.value = [...n]);
      },
      { immediate: !0 }
    );
    function Vn(t) {
      const n = new Set(de.value);
      n.has(t) ? n.delete(t) : n.add(t), de.value = n, cl.platforms = !0;
    }
    const Vl = e.computed(() => Ke.selectGlobalAdsWorkflowPlatforms(Ct.value).filter((t) => !de.value.has(t.id)));
    function Qt(t) {
      return t !== "campaign-launch" ? !0 : be.value && Ye.value && !!A.tenantId.trim() && Vl.value.length > 0;
    }
    function Sn(t) {
      return t !== "campaign-launch" ? "" : be.value ? Ye.value ? A.tenantId.trim() ? Vl.value.length ? "" : o.t("请至少启用一个 Web 目标平台，或为一个 API 平台配齐凭据；Web 登录会在工作流中完成。") : o.t("请填写客户标识，用于账户隔离与审计。") : o.t("请先在上方上传客户广告素材，或在「广告视频」历史列表中选择一条已生成的成片。") : o.t("请先配置视频生成模型：在「投放工作区 → 制作引擎配置」点开弹层完成接入后，才能执行后续投放流程。");
    }
    async function wn() {
      if ($.value || N.value) return;
      Vt.value = "", uo();
      let t = null;
      try {
        const n = await aa();
        t = W.value.find((a) => a.path === n) || null;
      } catch (n) {
        if (N.value = !1, la(n)) {
          k.value = k.value.map((a) => a.state === "running" || a.state === "pending" ? { ...a, state: "cancelled" } : a), T.value = o.t("已取消本次成片");
          try {
            x();
          } catch {
          }
          St.value || v.info(o.t("已取消本次成片"));
          return;
        }
        if (n?.preflight) {
          Vt.value = R(n), v.warn(Vt.value);
          return;
        }
        Oa(), T.value = R(n);
        try {
          x();
        } catch {
        }
        v.fromException(o.t("生成广告成片失败"), n);
        return;
      }
      if (!t) {
        v.warn(o.t("本轮没有产出可用成片，未进入发布。"));
        return;
      }
      if (!C[t.path])
        try {
          const n = await window.electronAPI?.solution?.inspectMedia?.(t.path);
          C[t.path] = n?.ok === !0;
        } catch {
          C[t.path] = !1;
        }
      if (!C[t.path]) {
        v.warn(o.t("这条成片的文件当前读不到（可能已被移动或删除）：{p0}", { p0: t.path }));
        return;
      }
      await vn(t), sa(t);
    }
    const Sl = e.computed(() => {
      const t = k.value.length || 1, n = k.value.filter((a) => a.state === "done" || a.state === "failed").length;
      return { done: n, total: t, percent: Math.round(n / t * 100) };
    }), at = e.ref(!1);
    e.watch(N, (t) => {
      t || (at.value = !1);
    });
    async function _n() {
      if (!(!N.value || at.value)) {
        at.value = !0, T.value = o.t("正在停止本次成片…");
        try {
          const t = window.electronAPI?.globalAdsRun;
          if (typeof t?.cancelSlideshow != "function") throw new Error(o.t("当前版本不支持取消成片"));
          await t.cancelSlideshow();
        } catch (t) {
          at.value = !1, v.fromException(o.t("取消成片失败"), t);
        }
      }
    }
    function Dn() {
      const t = new Error(o.t("已取消本次成片"));
      return t.cancelled = !0, t;
    }
    function la(t) {
      return !!t?.cancelled;
    }
    function na(t) {
      const n = Array.isArray(t?.skippedFiles) ? t.skippedFiles : [];
      if (!n.length) return;
      const a = n.slice(0, 5).map((l) => `${String(l.name)}（${String(l.reason)}）`).join(o.t("、"));
      v.warn(o.t("有 {p0} 个素材读不出来，已跳过：{p1}", {
        p0: n.length,
        p1: a + (n.length > 5 ? "…" : "")
      }));
    }
    async function oa(t, n, a) {
      const l = window.electronAPI?.globalAdsRun;
      if (typeof l?.slideshow != "function")
        throw N.value = !1, new Error(o.t("当前版本未开放图片成片快路"));
      const r = Math.max(1, n.length);
      k.value = [
        { id: "script", name: o.t("① 生成旁白与字幕文案"), state: "pending", etaSec: 25, kind: "llm" },
        { id: "render", name: o.t("② 图片拼接成片"), state: "pending", etaSec: 45 * r, kind: "image" },
        { id: "mix", name: o.t("③ 混入旁白与配乐"), state: "pending", etaSec: 20 * r, kind: "tts" },
        { id: "subtitle", name: o.t("④ 烧录字幕"), state: "pending", etaSec: 30 * r, kind: "image" }
      ];
      const i = (f, S) => {
        k.value = k.value.map((u) => u.id === f ? { ...u, state: S, startedAt: S === "running" ? Date.now() : u.startedAt } : u);
        try {
          x();
        } catch (u) {
          console.warn("[ads-gen] 运行态落库失败（不影响出片）", u);
        }
      };
      let d = [], c = [];
      const s = jn(), p = () => {
        const f = a.trim(), S = String(ue.instagram || ue.facebook || "").trim(), u = [];
        return f && u.push({ en: f, ar: "" }), S && u.push({ en: S, ar: "" }), u.filter((E) => E.en || E.ar);
      };
      if (Pe.value) {
        i("script", "running"), T.value = o.t("正在撰写旁白与字幕文案…");
        try {
          const f = await Y.askLlmOnce("marketing-content-creator", [
            o.t("为品牌「{p0}」写一条短视频广告旁白，3 句，每句 12–24 个字，口语、可直接朗读。", { p0: a }),
            // 旁白语言跟随界面语言（原来写死英文），否则中文用户会听到中文音色念英文
            o.t("旁白（primary 字段）必须用{p0}撰写。", { p0: s.label }),
            o.t("只输出 JSON，不要解释、不要代码块。格式：") + ` {"lines":[{"primary":"${s.label}旁白"}]}`,
            o.t("严禁编造价格、优惠、功效或上下文里没有的事实。")
          ].filter(Boolean).join(`
`), 25e3), S = Y.extractJsonObject(f), u = Array.isArray(S?.lines) && S.lines.length ? S.lines.slice(0, 3) : p(), E = (D) => String(D?.primary || D?.[s.code] || D?.en || "").trim();
          d = u.map((D, Ue) => ({
            id: `s${Ue + 1}`,
            text: E(D)
          })).filter((D) => D.text), c = u.map((D, Ue) => ({
            start: 1 + Ue * 7,
            end: 6.5 + Ue * 7,
            text: E(D)
          })).filter((D) => D.text);
        } catch (f) {
          const S = p();
          d = S.map((u, E) => ({ id: `s${E + 1}`, text: String(u.en || u.ar || "").trim() })).filter((u) => u.text), c = S.map((u, E) => ({
            start: 1 + E * 7,
            end: 6.5 + E * 7,
            // 兜底文案只含用户自己填过的品牌 / 话题，原样呈现
            text: String(u.en || "").trim()
          })).filter((u) => u.text), T.value = d.length ? o.t("模型未在 25 秒内返回，已改用你填写的品牌与标题作为文案：{p0}", { p0: R(f) }) : o.t("旁白文案生成失败，本次成片不带旁白与字幕：{p0}", { p0: R(f) });
        }
        i("script", d.length ? "done" : "failed");
      } else
        i("script", "done");
      const y = ["script", "render", "mix", "subtitle"], U = (f) => {
        const S = y.indexOf(f);
        if (!(S < 0)) {
          k.value = k.value.map((u) => {
            const E = y.indexOf(u.id);
            return E < S ? u.state === "failed" ? u : { ...u, state: "done" } : E > S ? { ...u, state: "pending", startedAt: void 0 } : u.state === "running" ? u : { ...u, state: "running", startedAt: Date.now() };
          });
          try {
            x();
          } catch {
          }
        }
      }, M = window.electronAPI?.globalAdsRun?.onSlideshowProgress?.((f) => {
        mn(), f?.msg && (T.value = String(f.msg));
        const S = Number(f?.total) || 0;
        qt.value = S > 1 ? { done: Number(f?.done) || 0, total: S } : null, typeof f?.stage == "string" && U(String(f.stage));
      });
      try {
        U("render");
        const f = await l.slideshow({
          materialDir: t,
          outputs: n,
          title: a,
          narration: d,
          subtitles: c,
          // 音色必须跟文案同语言：tts.py 的 edge 引擎默认是中文女声，不传就会用中文声音念外文
          narrationVoice: s.voice
        });
        if (f?.cancelled) throw Dn();
        if (!f?.ok) throw new Error(f?.error || o.t("图片成片失败"));
        for (const E of ["render", "mix", "subtitle"]) i(E, "done");
        na(f);
        const S = (f.produced || []).map((E) => String(E.path)), u = [];
        for (const E of S)
          (await window.electronAPI?.solution?.inspectMedia?.(E))?.ok === !0 && (C[E] = !0, u.push(E));
        if (!u.length) throw new Error(o.t("脚本已结束但没有产出可用成片"));
        return W.value = [
          ...u.map((E, D) => ({
            id: `adv-${Date.now()}-${D}`,
            projectName: a,
            path: E,
            createdAt: Date.now()
          })),
          ...W.value
        ].slice(0, 200), Ht(), te.value = 1, B.value = u[0], pe.value = u[0], T.value = o.t("成片已生成，可预览；即将进入发布。"), x(), u[0];
      } finally {
        typeof M == "function" && M(), N.value = !1;
      }
    }
    async function aa() {
      G.value.trim() || (T.value = o.t("请选择素材所在的文件夹（生成脚本需要绝对路径）"), await dn());
      const t = G.value.trim();
      if (!t) throw new Error(o.t("没有选择素材文件夹，无法生成成片。"));
      await Fo(t);
      const n = t.includes("\\") ? "\\" : "/", a = /* @__PURE__ */ new Date(), l = (p) => String(p).padStart(2, "0"), r = `${a.getFullYear()}${l(a.getMonth() + 1)}${l(a.getDate())}-${l(a.getHours())}${l(a.getMinutes())}${l(a.getSeconds())}`, i = `${t.replace(/[\\/]+$/, "")}${n}${o.t("广告成片")}`, c = zt.value.map((p) => ({
        aspect: p,
        path: `${i}${n}uae-ad-${r}-${p.replace(":", "x")}.mp4`
      })), s = {
        brand: _.brandName.trim() || "UAE Growth Campaign",
        headlineAr: _.arabicHeadline.trim(),
        outputPath: c[0].path,
        brief: Se.value.trim(),
        mode: J.value,
        videoModel: ke.value,
        aspectRatio: c[0].aspect,
        voiceover: Pe.value ? "true" : "false",
        bgmMood: Kt.value,
        extraOutputs: c.slice(1).map((p) => `${p.aspect}=${p.path}`).join(","),
        // 素材不足时怎么办由用户显式选（P3-6），不让链路自己决定要不要花钱生图
        materialFallback: Ie.value
      };
      return N.value = !0, pe.value = "", J.value === "slideshow" ? oa(t, c, s.brand) : ia(c, s.brand);
    }
    function ra(t) {
      let n = 0;
      const a = [];
      for (const [l, r] of t.entries()) {
        const i = String(r?.caption || "").split(/\r?\n/)[0].replace(/\s+/g, " ").trim(), d = Number(r?.duration) > 0 ? Number(r.duration) : 5;
        i && a.push({ id: `s${l + 1}`, text: i, start: n }), n += d;
      }
      return a;
    }
    async function ia(t, n) {
      const a = window.electronAPI?.globalAdsRun;
      if (typeof a?.slideshow != "function") throw new Error(o.t("当前版本未开放视频生成快路"));
      Math.max(1, t.length), k.value = [
        { id: "script", name: o.t("① 生成分镜与运镜提示"), state: "pending", etaSec: 40, kind: "llm" },
        // 镜头只生成一次、多画幅共用（主进程侧重排版），不再按画幅乘倍数
        { id: "render", name: o.t("② 视频模型出片并拼接"), state: "pending", etaSec: 180, kind: "video" }
      ];
      const l = (s, p) => {
        k.value = k.value.map((y) => y.id === s ? { ...y, state: p, startedAt: p === "running" ? Date.now() : y.startedAt } : y), x();
      }, r = (Ne.value ? I.value : []).filter((s) => s.prompt.trim()).map((s, p) => ({
        id: s.id || `0${p + 1}`,
        reference_image: s.referenceImage || "",
        duration: Number(s.duration) > 0 ? Math.min(10, Number(s.duration)) : 5,
        prompt: s.prompt.trim(),
        // 成片统一中文：只烧中文字幕（旧数据里存着的阿语副字幕不再带进画面）
        caption: s.caption.trim()
      }));
      if (r.length)
        return k.value = k.value.map((s) => s.id === "script" ? { ...s, state: "done", etaSec: 1 } : s), T.value = o.t("使用第 3 步保存的 {p0} 个分镜提示词", { p0: r.length }), x(), An(r, t, n, a);
      const i = w.value.filter((s) => s.kind === "image" && s.absolutePath).map((s) => String(s.absolutePath)).slice(0, 6);
      if (!i.length)
        throw l("script", "failed"), new Error(o.t("动态视频生成需要图片素材作为首帧参考图；请在第 3 步先「生成广告视频提示词」，或用「选择素材文件夹」载入素材。"));
      const d = (s) => {
        const p = Hn(), y = n.trim();
        return s.slice(0, 4).map((U, M) => ({
          id: `0${M + 1}`,
          reference_image: U,
          duration: 5,
          prompt: p[M % p.length],
          caption: M === 0 ? y : ""
        }));
      };
      l("script", "running"), T.value = o.t("正在生成分镜与运镜提示…");
      let c = [];
      try {
        const s = await Y.askLlmOnce("marketing-content-creator", [
          o.t("为品牌「{p0}」写一条面向阿联酋市场的 15–30 秒广告分镜，3 个场景。", { p0: n }),
          o.t("可用的首帧参考图（按顺序分配，一个场景一张）：") + `
` + i.map((y, U) => `${U + 1}. ${y}`).join(`
`),
          Gn(),
          o.t("只输出 JSON，不要解释、不要代码块。格式：") + ' {"scenes":[{"reference_image":"上面列出的绝对路径","duration":5,"prompt":"中文运镜提示…","caption":"中文字幕"}]}',
          o.t("严禁编造价格、优惠、功效或上下文里没有的事实。")
        ].filter(Boolean).join(`
`), 4e4), p = Y.extractJsonObject(s);
        c = (Array.isArray(p?.scenes) ? p.scenes : []).slice(0, 4).map((y, U) => ({
          id: `0${U + 1}`,
          reference_image: i.includes(String(y?.reference_image)) ? String(y.reference_image) : i[U % i.length],
          duration: Number(y?.duration) > 0 ? Math.min(10, Number(y.duration)) : 5,
          prompt: String(y?.prompt || "").trim(),
          caption: String(y?.caption || "").trim()
        })).filter((y) => y.prompt);
      } catch (s) {
        c = d(i), T.value = c.length ? o.t("模型未按时返回分镜，已改用参考图顺序与你填写的标题生成分镜：{p0}", { p0: R(s) }) : o.t("分镜生成失败：{p0}", { p0: R(s) });
      }
      if (!c.length)
        throw l("script", "failed"), new Error(o.t("模型没有返回可用的分镜，未开始出片。"));
      return l("script", "done"), An(c, t, n, a);
    }
    async function An(t, n, a, l) {
      const r = (d, c) => {
        k.value = k.value.map((s) => s.id === d ? { ...s, state: c, startedAt: c === "running" ? Date.now() : s.startedAt } : s);
        try {
          x();
        } catch {
        }
      }, i = l.onSlideshowProgress?.((d) => {
        mn(), d?.msg && (T.value = String(d.msg)), (d?.stage === "render" || d?.stage === "mix") && r("render", "running");
      });
      try {
        r("render", "running");
        const d = await l.slideshow({
          mode: "fal",
          materialDir: G.value.trim(),
          outputs: n,
          title: a,
          bgmMood: Kt.value,
          scenes: t,
          /**
           * 旁白开关对动态模式同样生效。
           * 文案直接复用分镜里的 caption（它本来就是给这一镜写的字幕），
           * 不再单独多问一次模型 —— 那会再压上一次 agent 冷启动的等待。
           * 起始秒按各镜头累计时长推，和画面对齐。
           */
          narration: Pe.value ? ra(t) : [],
          // 与图片成片同理：音色跟随文案语言，否则中文音色念外文
          narrationVoice: jn().voice
        });
        if (d?.cancelled) throw Dn();
        if (!d?.ok) throw new Error(d?.error || o.t("动态视频生成失败"));
        r("render", "done");
        const c = [];
        for (const s of d.produced || []) {
          const p = String(s.path);
          (await window.electronAPI?.solution?.inspectMedia?.(p))?.ok === !0 && (C[p] = !0, c.push(p));
        }
        if (!c.length) throw new Error(o.t("脚本已结束但没有产出可用成片"));
        return W.value = [
          ...c.map((s, p) => ({
            id: `adv-${Date.now()}-${p}`,
            projectName: a,
            path: s,
            createdAt: Date.now()
          })),
          ...W.value
        ].slice(0, 200), Ht(), te.value = 1, B.value = c[0], pe.value = c[0], T.value = o.t("成片已生成，可预览；即将进入发布。"), x(), c[0];
      } finally {
        typeof i == "function" && i(), N.value = !1;
      }
    }
    function sa(t) {
      if (V.value.length)
        try {
          const n = JSON.parse(localStorage.getItem(no) || "[]"), l = [{
            at: Date.now(),
            tenantId: A.tenantId.trim(),
            brand: _.brandName.trim(),
            source: t.path,
            runs: V.value.map((r) => ({
              platform: r.platformId,
              file: r.file,
              aspect: r.aspect,
              state: r.state,
              status: r.status,
              detail: r.detail
            }))
          }, ...Array.isArray(n) ? n : []].slice(0, 100);
          localStorage.setItem(no, JSON.stringify(l));
        } catch {
        }
    }
    async function ca(t) {
      if (t !== "campaign-launch") return !1;
      const n = Vl.value, a = w.value.map((r) => ({
        name: r.name,
        kind: r.kind,
        type: r.type,
        size: r.size,
        relativePath: r.relativePath,
        previewDataUrl: r.previewDataUrl
      }));
      if (B.value) {
        const r = B.value.split(/[\\/]/).pop() || "ad-video.mp4";
        a.push({
          name: r,
          kind: "video",
          type: "video/mp4",
          size: 0,
          relativePath: B.value,
          absolutePath: B.value,
          source: "generated",
          previewDataUrl: ""
        });
      }
      const l = {
        tenantId: A.tenantId.trim(),
        brand: _.brandName.trim(),
        platforms: JSON.stringify(n),
        assets: JSON.stringify(a),
        headlineAr: _.arabicHeadline.trim(),
        topics: ta(),
        workflowSource: "global-ads",
        returnPath: "/workbenches/global-ads",
        returnLabel: o.t("返回广告投放工作台")
      };
      try {
        const r = window.electronAPI;
        if (!r?.saveWorkflow || !r?.runWorkflow)
          throw new Error(o.t("当前版本未开放工作流运行"));
        return await r.saveWorkflow(Ke.buildGlobalAdsPublishWorkflow(l)), Ke.setWorkflowAutoRun(Ke.FIXED_ADS_PUBLISH_WORKFLOW_ID, l), await m.push({ path: "/workflow" }), !0;
      } catch (r) {
        return v.fromException(o.t("无法进入广告投放工作流"), r), !0;
      }
    }
    function wl(t) {
      return t < 1024 ? `${t} B` : t < 1024 * 1024 ? `${(t / 1024).toFixed(1)} KB` : `${(t / 1024 / 1024).toFixed(1)} MB`;
    }
    function da(t) {
      if (t.type.startsWith("image/")) return "image";
      if (t.type.startsWith("video/")) return "video";
      const n = t.name.split(".").pop()?.toLowerCase() || "";
      return ["jpg", "jpeg", "png", "webp", "gif"].includes(n) ? "image" : ["mp4", "mov", "webm"].includes(n) ? "video" : "";
    }
    function _l() {
      for (const t of w.value)
        t.previewUrl && URL.revokeObjectURL(t.previewUrl);
    }
    async function $n(t) {
      if (Ne.value = !1, vt.value = !1, oe.value = "", !t.length) return;
      const n = [], a = [];
      let l = !1;
      for (const r of t) {
        const i = da(r);
        if (!i) {
          a.push(o.t("{p0}（不支持的格式）", { p0: r.name }));
          continue;
        }
        const d = String(r.webkitRelativePath || ""), c = i === "image" && !l, s = c ? URL.createObjectURL(r) : "";
        c && (l = !0), n.push({
          name: r.name,
          size: r.size,
          type: r.type,
          kind: i,
          previewUrl: s,
          previewDataUrl: s ? await ua(s) : "",
          relativePath: d
        });
      }
      if (!n.length) {
        oe.value = a.length ? o.t("没有可用素材：{details}", { details: a.slice(0, 3).join(o.t("；")) }) : o.t("请选择图片或视频文件。");
        return;
      }
      _l(), w.value = n, a.length && (oe.value = o.t("已载入 {count} 个素材，跳过 {rejected} 个：{details}", {
        count: n.length,
        rejected: a.length,
        details: a.slice(0, 3).join(o.t("；"))
      })), ae.value = o.t("整批 {count} 个素材已就绪，Agent 将全部用于脚本、剪辑和投放流程。", {
        count: n.length
      });
    }
    async function ua(t) {
      return new Promise((n) => {
        const a = new Image();
        a.onload = () => {
          const r = Math.min(1, 720 / Math.max(a.naturalWidth, a.naturalHeight)), i = document.createElement("canvas");
          i.width = Math.max(1, Math.round(a.naturalWidth * r)), i.height = Math.max(1, Math.round(a.naturalHeight * r));
          const d = i.getContext("2d");
          if (!d) return n("");
          d.drawImage(a, 0, 0, i.width, i.height), n(i.toDataURL("image/jpeg", 0.76));
        }, a.onerror = () => n(""), a.src = t;
      });
    }
    function Cn(t) {
      const n = t.target;
      $n(Array.from(n.files || [])), n.value = "";
    }
    function ma(t) {
      $n(Array.from(t.dataTransfer?.files || []));
    }
    const me = e.computed(
      () => Q(ye.value?.report) ? ye.value.report : ye.value || {}
    ), Bn = e.computed(
      () => Array.isArray(me.value.byPlatform) ? me.value.byPlatform : Array.isArray(me.value.by_platform) ? me.value.by_platform : []
    ), Tn = e.computed(
      () => Array.isArray(me.value.findings) ? me.value.findings : []
    ), Ln = e.computed(() => String(me.value.notes || "")), pa = e.computed(() => {
      const t = Q(me.value.totals) ? me.value.totals : {};
      return [
        ["spend", o.t("花费")],
        ["impressions", o.t("展示")],
        ["clicks", o.t("点击")],
        ["conversions", o.t("转化")],
        ["cpa", "CPA"],
        ["roas", "ROAS"]
      ].map(([a, l]) => ({
        key: a,
        label: l,
        value: t[a] == null ? "—" : Lt(t[a])
      }));
    });
    function Dl() {
      return window.electronAPI?.workbenches?.globalAds || null;
    }
    let Pn;
    function Al() {
      const t = window.electronAPI?.browserTabs;
      if (!t?.create || !t?.command)
        throw new Error(o.t("内置浏览器自动操作接口不可用"));
      return t;
    }
    function va(t) {
      if (t?.success === !1) throw new Error(String(t?.error || o.t("浏览器操作失败")));
      const n = t?.data?.result;
      if (typeof n != "string") return n ?? t?.data ?? t;
      const a = n.trim();
      if (!a) return "";
      if (/^(?:true|false|null|-?\d+(?:\.\d+)?|\{|\[)/.test(a))
        try {
          return JSON.parse(a);
        } catch {
        }
      return n;
    }
    async function In(t, n = [], a) {
      const l = await Al().command({
        contextId: a,
        command: t,
        args: n
      });
      return va(l);
    }
    const Mn = e.computed(() => {
      const t = Ia(fe.value);
      if (!t.length) return null;
      const n = b.find((a) => a.id === fe.value?.platform);
      return {
        tooltip: { trigger: "axis" },
        legend: { top: 0, textStyle: { fontSize: 11 } },
        grid: { left: 8, right: 8, top: 40, bottom: 4, containLabel: !0 },
        xAxis: { type: "category", data: t.map((a) => String(a.date).slice(5)), axisTick: { show: !1 } },
        yAxis: [
          { type: "value", name: o.t("点击"), splitLine: { lineStyle: { type: "dashed" } }, axisLabel: { fontSize: 11 } },
          { type: "value", name: o.t("花费（账户币种）"), splitLine: { show: !1 }, axisLabel: { fontSize: 11 } }
        ],
        series: [
          { name: o.t("点击"), type: "bar", barMaxWidth: 28, itemStyle: { color: n?.color || "#4a7cff", borderRadius: [3, 3, 0, 0] }, data: t.map((a) => a.clicks) },
          { name: o.t("转化"), type: "bar", barMaxWidth: 28, itemStyle: { color: "#22c55e", borderRadius: [3, 3, 0, 0] }, data: t.map((a) => a.conversions) },
          { name: o.t("花费"), type: "line", yAxisIndex: 1, smooth: !0, lineStyle: { width: 2, color: "#f59e0b" }, itemStyle: { color: "#f59e0b" }, data: t.map((a) => a.spend) }
        ]
      };
    });
    function $l(t) {
      return t === "google_ads" || t === "youtube";
    }
    async function On(t) {
      const n = b.find((l) => l.id === t);
      if (!n) return !1;
      Ce.value = t, ae.value = "";
      const a = `ads-publish-${t}`;
      try {
        if ($l(t)) {
          const l = window.electronAPI?.browserTabs?.openForeground;
          if (typeof l != "function") throw new Error(o.t("当前版本未开放外部浏览器登录"));
          return await l({ contextId: a, url: n.loginUrl, browserKey: Y.FOREGROUND_SHARED_BROWSER_KEY }), ae.value = o.t("{platform} 已在弹出的系统 Chrome 窗口打开（Google 限制内嵌浏览器登录），请由客户本人完成账号、密码与 MFA。", {
            platform: n.label
          }), !0;
        }
        return await Al().create({ contextId: a, source: "user", activate: !0 }), await In("open", [n.loginUrl], a), ae.value = o.t("{platform} 官方登录页已在右侧打开，请由客户本人完成账号、密码与 MFA。", {
          platform: n.label
        }), !0;
      } catch (l) {
        return ae.value = o.t("无法打开 {platform}：{message}", {
          platform: n.label,
          message: R(l)
        }), !1;
      } finally {
        Ce.value = "";
      }
    }
    function Wn(t, n) {
      ee[t] = n, ve[t] = null, ae.value = n === "api" ? o.t("{p0} 已选择 API 模式，请配置 Token 后验证访问。", { p0: ie(t) }) : o.t("{p0} 已选择 Web 模式，点击“打开 Web 登录”由客户本人完成登录。", { p0: ie(t) });
    }
    function Cl(t) {
      Ge.value = t, He.value = "";
      for (const n of Object.keys(ge)) delete ge[n];
      for (const n of Object.keys(Ae)) delete Ae[n];
      for (const n of ne[t])
        ge[n.key] = n.defaultValue || "";
      pt.value = !0;
    }
    function Bl() {
      $e.value || (pt.value = !1, He.value = "");
    }
    async function ga(t) {
      if (ee[t] === "api") {
        Cl(t);
        return;
      }
      Ce.value = t;
      try {
        const n = q();
        if (typeof n.platformConfigure != "function") throw new Error(o.t("平台配置接口不可用"));
        await n.platformConfigure({ platform: t, enabled: !0, mode: "web" }), await xt();
      } catch (n) {
        v.fromException(o.t("切换 Web 模式失败"), n), Ce.value = "";
        return;
      }
      Ce.value = "", await On(t);
    }
    async function fa() {
      if (!En.value) return;
      const t = Ge.value;
      $e.value = !0, He.value = "";
      try {
        const n = q();
        if (typeof n.platformConfigure != "function") throw new Error(o.t("平台配置接口不可用"));
        const a = ne[t];
        if (t === "instagram") {
          const r = { platform: "facebook" };
          for (const i of a.filter((d) => d.sharedMeta)) {
            const d = String(ge[i.key] || "").trim();
            d && (r[i.key] = d);
          }
          Object.keys(r).length > 1 && await n.platformConfigure(r);
        }
        const l = {
          platform: t,
          enabled: !0,
          mode: ee[t] || "web"
        };
        for (const r of a.filter((i) => !i.sharedMeta)) {
          const i = String(ge[r.key] || "").trim();
          i && (l[r.key] = i);
        }
        await n.platformConfigure(l), ve[t] = null, ae.value = o.t("{p0} 凭据/账号 ID 已保存。", {
          p0: ie(t)
        }), pt.value = !1, v.success(o.t("{p0} API 凭据已保存", { p0: ie(t) })), await xt();
      } catch (n) {
        He.value = R(n);
      } finally {
        $e.value = !1;
      }
    }
    function Tl(t = 550) {
      const n = Pn?.signal;
      return n ? (n.throwIfAborted(), new Promise((a, l) => {
        const r = window.setTimeout(() => {
          n.removeEventListener("abort", i), a();
        }, t), i = () => {
          window.clearTimeout(r), l(new DOMException(o.t("广告自动化已由人工接管"), "AbortError"));
        };
        n.addEventListener("abort", i, { once: !0 });
      })) : new Promise((a) => window.setTimeout(a, t));
    }
    async function ya(t, n, a, l) {
      if (Pn = l, l?.throwIfCancelled(), t === "campaign-launch" && n === "prepare") {
        const r = ce.value;
        if (!r) throw new Error(o.t("请先上传客户广告素材"));
        const i = w.value.map((u) => ({
          name: u.name,
          kind: u.kind,
          type: u.type,
          size: u.size,
          relativePath: u.relativePath
        })), d = Ct.value.filter((u) => u.tone === "ready");
        if (!d.length)
          throw new Error(o.t("没有通过真实验证的投放平台，已阻止创建广告系列"));
        const c = {
          tenantId: A.tenantId.trim(),
          brand: _.brandName,
          asset: { name: r.name, kind: r.kind, size: r.size },
          assets: i,
          assetSummary: {
            total: i.length,
            images: Bt.value,
            videos: Tt.value,
            totalBytes: Nl.value
          },
          targetMarket: "United Arab Emirates",
          languages: ["ar", "en"],
          platforms: d.map((u) => ({ id: u.id, mode: u.mode })),
          environment: Re.value ? "mock" : "connected-account"
        };
        a?.(0, o.t("客户策略 Agent 已读取客户标识、UAE 市场目标和整批 {count} 个真实素材", {
          count: i.length
        }), {
          actor: o.t("客户策略 Agent"),
          actorId: "client-strategy",
          actorType: "agent",
          tool: o.t("客户 Brief / 批量素材库"),
          evidence: `${Bt.value} images · ${Tt.value} videos · ${wl(Nl.value)}`,
          output: i.map((u) => u.relativePath || u.name).slice(0, 20).join(`
`)
        });
        const s = q();
        if (typeof s.runWorkflow != "function") throw new Error(o.t("广告多 Agent 工作流接口不可用"));
        const p = l?.runId || `ads-${Date.now()}`, y = l?.registerCancellation(async () => {
          await s.cancelWorkflow?.({ runId: p });
        }), U = await s.runWorkflow({
          runId: p,
          taskType: "campaign",
          brief: c
        }).finally(() => y?.());
        l?.throwIfCancelled();
        const M = st.workflowOutput(U, ["reviewed_package"]), f = st.workflowRunId(U) || l?.runId || "";
        if (a?.(1, o.t("广告动态工作流已完成策略拆解、渠道分工和预算边界"), {
          actor: o.t("广告多 Agent 工作流"),
          actorId: "client-strategy",
          actorType: "agent",
          tool: "/v1/workflows/dynamic/run",
          evidence: f,
          output: M.slice(0, 320)
        }), a?.(2, o.t("工作流中的素材本地化、媒体计划和合规复核 Agent 已并行完成"), {
          actor: o.t("素材本地化 Agent"),
          actorId: "creative-localizer",
          actorType: "agent",
          tool: "Dynamic AST · parallel + reduce",
          evidence: f,
          output: M.slice(0, 320)
        }), typeof s.campaignCreate != "function") throw new Error(o.t("真实广告创建接口不可用"));
        Be.value = [];
        for (const u of d) {
          l?.throwIfCancelled();
          const E = {
            name: `${_.brandName} · UAE · ${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`,
            campaign_key: `uae-${A.tenantId.trim()}`,
            objective: "traffic",
            daily_budget_usd: 25,
            bid_strategy: "lowest_cost",
            landing_url: "https://example.com/uae-growth",
            targeting: {
              countries: ["AE"],
              languages: ["ar", "en"],
              age_min: 21,
              age_max: 55
            },
            creative: {
              asset_name: r.name,
              asset_kind: r.kind,
              asset_count: i.length,
              asset_batch: i,
              image_count: Bt.value,
              video_count: Tt.value,
              headline_ar: _.arabicHeadline,
              localized_copy: M
            },
            demo_sandbox: u.isSandbox
          }, D = await s.campaignCreate({
            platform: u.id,
            mode: u.mode,
            tenantId: A.tenantId.trim(),
            tenant_id: A.tenantId.trim(),
            actor: "totalclaw-media-buyer",
            dryRun: !0,
            dry_run: !0,
            spec: E
          });
          tl(D, o.t("{p0} 广告计划校验失败", { p0: u.label }));
          const Ue = String(
            D?.confirmToken || D?.confirm_token || D?.raw?.confirmToken || D?.raw?.confirm_token || ""
          );
          if (!Ue)
            throw new Error(o.t("{p0} 未返回人工确认令牌，已阻止真实花费动作", { p0: u.label }));
          Be.value.push({
            platform: u.id,
            mode: u.mode,
            spec: E,
            confirmToken: Ue,
            validation: D
          });
        }
        a?.(3, o.t("媒体投放 Agent 已通过平台驱动校验 {count} 个 Mock 广告系列计划", {
          count: Be.value.length
        }), {
          actor: o.t("媒体投放 Agent"),
          actorId: "media-buyer",
          actorType: "agent",
          tool: "/v1/global_ads/campaign/create",
          evidence: Be.value.map((u) => `${u.platform}:validated`).join(" · ")
        }), a?.(4, o.t("预算、受众、素材和目标平台已固化，正在提交 Mock 平台发布"), {
          actor: o.t("媒体投放 Agent"),
          actorId: "media-buyer",
          actorType: "agent",
          tool: "Platform Drivers",
          evidence: o.t("{count} 个已校验发布计划", { count: Be.value.length })
        });
        const S = [];
        for (const u of Be.value) {
          l?.throwIfCancelled();
          const E = JSON.parse(JSON.stringify(u.spec)), D = await s.campaignCreate({
            platform: u.platform,
            mode: u.mode,
            tenantId: A.tenantId.trim(),
            tenant_id: A.tenantId.trim(),
            actor: "totalclaw-media-buyer",
            dryRun: !1,
            dry_run: !1,
            confirmToken: u.confirmToken,
            confirm_token: u.confirmToken,
            spec: E
          });
          tl(D, o.t("{p0} 广告系列创建失败", { p0: ie(u.platform) })), S.push({ platform: u.platform, result: D });
        }
        return Hl.value = {
          status: "created",
          execution: "global-ads-platform-drivers",
          results: S,
          runId: l?.runId
        }, a?.(5, o.t("Mock 平台驱动已返回 {count} 个发布结果，审计记录正在刷新", {
          count: S.length
        }), {
          actor: o.t("媒体投放 Agent"),
          actorId: "media-buyer",
          actorType: "agent",
          tool: "/v1/global_ads/campaign/create",
          evidence: S.map((u) => `${u.platform}:success`).join(" · "),
          output: JSON.stringify(S).slice(0, 360)
        }), Be.value = [], await el(), {
          note: o.t("Mock 广告平台发布已完成，系列回执与执行证据已进入审计。"),
          progressManaged: !0
        };
      }
      if (t === "cross-platform-review" && n === "prepare") {
        a?.(0, o.t("正在读取 Facebook、Instagram、Google Ads 与 YouTube 指标"), {
          actor: o.t("增长分析 Agent"),
          actorId: "growth-analyst",
          actorType: "agent",
          tool: "/v1/global_ads/review-report"
        }), await Al().create({
          contextId: "global-ads-review",
          source: "agent",
          activate: !0
        }), await In("open", ["https://ads.google.com/aw/overview"], "global-ads-review"), await Tl(700);
        const r = q();
        if (typeof r.reviewReport != "function") throw new Error(o.t("跨平台复盘接口不可用"));
        const i = await r.reviewReport({
          since: h.since,
          until: h.until,
          platforms: b.map((f) => f.id),
          compare: "previous_period",
          tenantId: A.tenantId.trim() || "tenant-ae-demo",
          tenant_id: A.tenantId.trim() || "tenant-ae-demo",
          demoSandbox: Re.value,
          demo_sandbox: Re.value
        });
        tl(i, o.t("真实平台指标读取失败；已停止后续复盘，不生成虚假结论")), ye.value = i;
        const d = Q(i?.report) ? i.report : i, c = Array.isArray(d?.byPlatform) ? d.byPlatform.map((f) => f.platform).filter(Boolean) : [];
        if (!c.length && !Object.keys(d?.totals || {}).length)
          throw new Error(o.t("复盘接口没有返回任何真实指标，已停止后续 Agent 分析"));
        if (a?.(1, o.t("确定性接口已统一真实返回的花费、展示、点击、转化与时间口径"), {
          actor: o.t("增长分析 Agent"),
          actorId: "growth-analyst",
          actorType: "agent",
          tool: "Metric Normalizer",
          evidence: o.t("{count} 个数据源 · {since}—{until}", {
            count: c.length || 1,
            since: h.since,
            until: h.until
          })
        }), typeof r.runWorkflow != "function") throw new Error(o.t("广告复盘工作流接口不可用"));
        const s = l?.runId || `ads-review-${Date.now()}`, p = l?.registerCancellation(async () => {
          await r.cancelWorkflow?.({ runId: s });
        }), y = await r.runWorkflow({
          runId: s,
          taskType: "review",
          brief: { report: i, since: h.since, until: h.until }
        }).finally(() => p?.());
        l?.throwIfCancelled();
        const U = st.workflowOutput(y, ["reviewed_package"]), M = st.workflowRunId(y) || l?.runId || "";
        return a?.(2, o.t("增长、创意和账户审计 Agent 已在动态工作流中并行复核真实指标"), {
          actor: o.t("广告复盘工作流"),
          actorId: "growth-analyst",
          actorType: "agent",
          tool: "/v1/workflows/dynamic/run",
          evidence: M,
          output: U.slice(0, 320)
        }), a?.(3, o.t("阿英双语复盘已生成，并保留平台数据覆盖说明"), {
          actor: o.t("增长分析 Agent"),
          actorId: "growth-analyst",
          actorType: "agent",
          tool: "Report Builder",
          evidence: l?.runId,
          output: U.slice(0, 320)
        }), a?.(4, o.t("优化待办已生成，预算调整等待客户确认"), {
          actor: o.t("账户优化 Agent"),
          actorId: "account-optimizer",
          actorType: "agent",
          tool: "Human Gate",
          evidence: o.t("未执行任何花费变更")
        }), {
          note: o.t("真实指标已完成归一和 Agent 复盘；预算调整仍未执行。"),
          progressManaged: !0
        };
      }
      if (t === "cross-platform-review" && n === "commit")
        return a?.(4, o.t("客户已确认，优化待办已写入审计队列")), {
          note: o.t("复盘结果和客户确认记录已完成留痕。"),
          progressManaged: !0
        };
      if (t === "web-login" && n === "prepare") {
        if (a?.(0, o.t("正在弹出系统 Chrome 打开 Google Ads 登录（Google 限制内嵌浏览器登录）"), {
          actor: o.t("媒体投放 Agent"),
          actorId: "media-buyer",
          actorType: "agent",
          tool: o.t("系统 Chrome · Google Ads")
        }), !await On("google_ads")) throw new Error(ae.value || o.t("Google Ads 官方登录页打开失败"));
        return P.google_ads = {
          state: "awaiting_customer",
          platform: "google_ads",
          loginUrl: "https://ads.google.com/"
        }, a?.(1, o.t("Google Ads 官方登录页已打开，请客户本人输入账号、密码和 MFA"), {
          actor: o.t("客户本人"),
          actorType: "human",
          tool: "Google Ads Login",
          evidence: o.t("密码与 MFA 不经过 TotalClaw")
        }), {
          note: o.t("登录页已在右侧打开；完成登录后请在人工确认弹窗中核对详情并继续。"),
          progressManaged: !0
        };
      }
      if (t === "web-login" && n === "commit") {
        a?.(2, o.t("正在回读 Google Ads 当前页面与账户访问状态"));
        const r = window.electronAPI?.browserTabs?.readForeground;
        if (typeof r != "function") throw new Error(o.t("当前版本未开放外部浏览器登录"));
        const i = await r({
          contextId: "ads-publish-google_ads",
          browserKey: Y.FOREGROUND_SHARED_BROWSER_KEY
        }), d = String(i?.url || ""), c = String(i?.text || "");
        if (!/ads\.google\.com/i.test(d) || /sign in|choose an account|登录|选择帐号|verify it'?s you/i.test(c))
          throw new Error(o.t("尚未验证 Google Ads 已登录账户；请完成账号与 MFA 后再确认"));
        return await Tl(320), a?.(3, o.t("已验证登录后页面，并按当前账户能力注册读取、预览与受控写入操作"), {
          actor: o.t("媒体投放 Agent"),
          actorId: "media-buyer",
          actorType: "agent",
          tool: "browser.eval",
          evidence: d
        }), await Tl(320), a?.(4, o.t("人工接管结束，会话状态与访问地址已写入审计记录"), {
          actor: o.t("媒体投放 Agent"),
          actorId: "media-buyer",
          actorType: "agent",
          tool: "Web Session Registry",
          evidence: d
        }), P.google_ads = {
          ...P.google_ads || {},
          state: "ready",
          currentUrl: d
        }, {
          note: o.t("Google Ads 会话已接入，当前页面：{url}", { url: d }),
          progressManaged: !0
        };
      }
      return { note: o.t("人工确认已记录，优化动作进入审计队列。") };
    }
    function q() {
      const t = Dl();
      if (!t) throw new Error(o.t("当前版本未提供海外广告工作台 IPC"));
      return t;
    }
    async function Fn() {
      dt.value = !0, De.value = "";
      try {
        const t = q();
        if (typeof t.status != "function") throw new Error(o.t("状态接口不可用"));
        const n = await t.status();
        if (!Q(n)) throw new Error(o.t("状态接口返回格式无效"));
        L.value = n;
      } catch (t) {
        L.value = null, De.value = R(t);
      } finally {
        dt.value = !1;
      }
    }
    async function xt() {
      al.value = !0, ut.value = "";
      try {
        const t = q();
        if (typeof t.platforms != "function") throw new Error(o.t("平台状态接口不可用"));
        const n = await t.platforms(), a = Array.isArray(n) ? n : n?.platforms;
        if (!Array.isArray(a)) throw new Error(o.t("平台状态接口返回格式无效"));
        ol.value = a;
        for (const r of a) {
          const i = String(r?.platform || r?.id || ""), d = String(r?.mode || ""), c = r?.demoSandbox === !0 || r?.demo_sandbox === !0;
          b.some((s) => s.id === i) && (d === "api" || d === "web") && !c && r?.configured === !0 && (ee[i] = d);
        }
        const l = n?.defaultMode ?? n?.default_mode;
        (l === "api" || l === "web") && (A.mode = l);
      } catch (t) {
        ol.value = [], ut.value = R(t);
      } finally {
        al.value = !1;
      }
    }
    async function Rn() {
      mt.value = !0, await Promise.allSettled([Fn(), xt(), el()]), mt.value = !1;
    }
    async function ha(t) {
      K[t.id] = "verify";
      try {
        const n = q();
        if (typeof n.platformVerify != "function") throw new Error(o.t("平台验证接口不可用"));
        const a = await n.platformVerify({
          platform: t.id,
          mode: t.mode || A.mode
        });
        if (!Q(a)) throw new Error(o.t("平台验证接口返回格式无效"));
        ve[t.id] = a, a.verified === !0 && a.success === !0 ? v.success(o.t("{p0} 访问验证通过", { p0: t.label })) : v.warn(Un(a));
      } catch (n) {
        ve[t.id] = {
          verified: !1,
          error_message: R(n)
        }, v.fromException(o.t("{p0} 访问验证失败", { p0: t.label }), n);
      } finally {
        K[t.id] = "";
      }
    }
    async function ka(t) {
      if (!$t.value || !_e.value) {
        v.warn(o.t("当前区域不允许启动 Web 登录会话"));
        return;
      }
      K[t.id] = "start";
      try {
        const n = q();
        if (typeof n.webLoginStart != "function") throw new Error(o.t("Web 登录接口不可用"));
        const a = A.tenantId.trim(), l = await n.webLoginStart({
          platform: t.id,
          ...a ? { tenantId: a, tenant_id: a } : {}
        });
        if (!Q(l) || !String(l.sessionId || l.session_id || "").trim())
          throw new Error(o.t("Web 登录接口没有返回有效会话"));
        P[t.id] = l, l.state === "ready" ? v.success(o.t("{p0} Web 登录已验证就绪", { p0: t.label })) : l.state === "failed" || l.state === "timeout" ? v.warn(String(l.errorMessage || l.error_message || o.t("Web 登录会话未就绪"))) : v.info(o.t("请在已打开的浏览器窗口中由本人完成登录，再点击“探测一次”"));
      } catch (n) {
        v.fromException(o.t("启动 Web 登录失败"), n);
      } finally {
        K[t.id] = "";
      }
    }
    async function ba(t) {
      const n = String(
        P[t]?.sessionId || P[t]?.session_id || ""
      ).trim();
      if (n) {
        K[t] = "poll";
        try {
          const a = q();
          if (typeof a.webLoginStatus != "function") throw new Error(o.t("Web 登录状态接口不可用"));
          const l = await a.webLoginStatus({ sessionId: n });
          if (!Q(l)) throw new Error(o.t("Web 登录状态返回格式无效"));
          P[t] = l, l.state === "ready" ? (v.success(o.t("{p0} Web 登录已验证就绪", { p0: ie(t) })), await xt()) : (l.state === "failed" || l.state === "timeout") && v.warn(String(l.errorMessage || l.error_message || o.t("Web 登录会话未就绪")));
        } catch (a) {
          v.fromException(o.t("探测 Web 登录失败"), a);
        } finally {
          K[t] = "";
        }
      }
    }
    async function Ea(t) {
      const n = String(
        P[t]?.sessionId || P[t]?.session_id || ""
      ).trim();
      if (n) {
        K[t] = "cancel";
        try {
          const a = q();
          if (typeof a.webLoginCancel != "function") throw new Error(o.t("Web 登录取消接口不可用"));
          const l = await a.webLoginCancel({
            sessionId: n,
            reason: o.t("用户在广告工作台主动取消")
          });
          if (!Q(l)) throw new Error(o.t("Web 登录取消接口返回格式无效"));
          P[t] = l, v.info(o.t("Web 登录会话已取消")), await Fn();
        } catch (a) {
          v.fromException(o.t("取消 Web 登录失败"), a);
        } finally {
          K[t] = "";
        }
      }
    }
    async function Na() {
      if (!Zt.value) {
        v.warn(o.t("复盘日期无效"));
        return;
      }
      Wt.value = !0, fe.value = null;
      try {
        const t = q();
        if (typeof t.insights != "function") throw new Error(o.t("广告指标接口不可用"));
        const n = await t.insights({
          platform: h.insightsPlatform,
          mode: h.insightsMode,
          level: "campaign",
          since: h.since,
          until: h.until,
          demoSandbox: Re.value,
          demo_sandbox: Re.value
        });
        fe.value = Q(n) ? n : { response: n }, tl(n, o.t("指标拉取未成功")), v.success(o.t("已读取平台真实指标"));
      } catch (t) {
        v.fromException(o.t("指标拉取失败"), t);
      } finally {
        Wt.value = !1;
      }
    }
    async function Va() {
      if (!Zt.value || !h.platforms.length) {
        v.warn(o.t("请选择有效日期和至少一个复盘平台"));
        return;
      }
      Ft.value = !0, ye.value = null;
      try {
        const t = q();
        if (typeof t.reviewReport != "function") throw new Error(o.t("广告复盘接口不可用"));
        const n = await t.reviewReport({
          since: h.since,
          until: h.until,
          platforms: [...h.platforms],
          compare: h.comparePrevious ? "previous_period" : "",
          tenant_id: A.tenantId.trim(),
          tenantId: A.tenantId.trim(),
          demoSandbox: Re.value,
          demo_sandbox: Re.value
        });
        if (!Q(n)) throw new Error(o.t("复盘接口返回格式无效"));
        if (n.ok === !1 || n.error)
          throw new Error(String(n.errorMessage || n.error_message || n.error || o.t("复盘未成功")));
        ye.value = n, v.success(o.t("跨平台复盘已生成"));
      } catch (t) {
        v.fromException(o.t("生成复盘失败"), t);
      } finally {
        Ft.value = !1;
      }
    }
    async function el() {
      Je.value = !0, Rt.value = "", Z.value = 1;
      try {
        const t = q();
        if (typeof t.audit != "function") throw new Error(o.t("广告审计接口不可用"));
        const n = await t.audit({
          platform: qe.platform,
          tenantId: qe.tenantId.trim(),
          limit: 100
        }), a = Array.isArray(n) ? n : n?.entries;
        if (!Array.isArray(a)) throw new Error(o.t("审计接口返回格式无效"));
        he.value = a;
      } catch (t) {
        he.value = [], Rt.value = R(t);
      } finally {
        Je.value = !1;
      }
    }
    function Ll(t) {
      Z.value = Math.min(il.value, Math.max(1, t));
    }
    function tl(t, n) {
      if (!Q(t)) throw new Error(n);
      if (t.ok === !1 || t.success !== !0)
        throw new Error(String(
          t.error_message || t.errorMessage || t.error || t.remediation || t.status || n
        ));
    }
    function Sa(t) {
      if (t?.success !== !0 || t?.ok === !1) return "result-bad";
      const n = String(t?.status || "").toLowerCase();
      return n === "needs_human" || t?.handbackId || t?.handback_id ? "result-warn" : n === "pending_review" ? "result-pending" : "result-ok";
    }
    function wa(t) {
      return t?.success === !0 && t?.ok !== !1 ? String(t.status || o.t("成功")) : String(t?.status || t?.errorCode || t?.error_code || o.t("未成功"));
    }
    function _a(t) {
      return t ? t.loggedIn === !0 || t.logged_in === !0 ? o.t("已登录") : t.configured === !0 || t.profileExists === !0 || t.profile_exists === !0 ? o.t("已准备，待验证") : String(t.status || t.state || "") || o.t("未登录") : o.t("未报告");
    }
    function Un(t) {
      return t ? t.verified === !0 && t.success === !0 ? o.t("真实访问验证通过") : String(
        t.error_message || t.errorMessage || t.remediation || t.status || o.t("访问验证未通过")
      ) : o.t("尚未验证");
    }
    function zn(t) {
      return ["ready", "failed", "cancelled", "timeout"].includes(String(t?.state || ""));
    }
    function Da(t) {
      return t === "api" ? "API" : t === "web" ? "Web" : t || "—";
    }
    function Aa(t) {
      return { facebook: "f", instagram: "◎", google_ads: "G", youtube: "▶" }[t];
    }
    function ie(t) {
      return b.find((n) => n.id === t)?.label || t || "—";
    }
    function $a(t) {
      if (t.iso) {
        const n = new Date(t.iso);
        return Number.isNaN(n.getTime()) ? String(t.iso) : n.toLocaleString(Pl());
      }
      return t.ts ? new Date(Number(t.ts) * 1e3).toLocaleString(Pl()) : "—";
    }
    function Lt(t) {
      const n = Number(t);
      return Number.isFinite(n) ? new Intl.NumberFormat(Pl(), { maximumFractionDigits: 4 }).format(n) : String(t ?? "—");
    }
    function Kn(t) {
      return Number.isFinite(Number(t)) ? String(Number(t)) : "—";
    }
    function jn() {
      return { code: "zh", label: o.t("简体中文"), voice: "zh-CN-XiaoxiaoNeural" };
    }
    function Gn() {
      return o.t('每个场景给两样：① 运镜与画面的中文提示词（交给视频模型，写清镜头运动、主体、光线与质感，要有明确的镜头运动，不要只"轻微动"，画面里不要出现可读文字）；② 一句简体中文字幕（会同时用于配音朗读）。全部用简体中文，不要阿拉伯语或英文字幕。');
    }
    const Ca = [
      "缓慢推镜，电影感布光，轻微视差",
      "缓慢向右横移，浅景深，自然光",
      "缓慢拉远展现全景，电影级调色",
      "缓慢上摇，柔和高光，高级质感"
    ];
    function Hn() {
      return [...Ca];
    }
    function Pl() {
      return o.i18n.global.locale.value === "ar" ? "ar-AE" : o.i18n.global.locale.value;
    }
    function Jn(t) {
      try {
        return JSON.stringify(t, null, 2);
      } catch {
        return String(t);
      }
    }
    function R(t) {
      return Ul.humanizeErrorMessage(t, o.t("未知错误"));
    }
    function Q(t) {
      return !!t && typeof t == "object" && !Array.isArray(t);
    }
    function Il(t) {
      return Array.isArray(t) ? t.map((n) => String(n)) : [];
    }
    function qn(t) {
      const n = /* @__PURE__ */ new Date();
      return n.setHours(12, 0, 0, 0), n.setDate(n.getDate() - t), n.toISOString().slice(0, 10);
    }
    function Yn() {
      Te();
    }
    return e.onMounted(() => {
      Wa(), window.addEventListener("totalclaw:media-model-changed", Yn);
      try {
        const t = JSON.parse(localStorage.getItem("totalclaw:publish-workflow-result:global-ads") || "null");
        t?.kind === "run:completed" && (Hl.value = JSON.parse(String(t?.finalVariables?.node_receipt_result || "{}")));
      } catch {
      }
      Rn(), Te(), rn(), Yo();
    }), e.onBeforeUnmount(() => {
      jl.release(), _l();
    }), (t, n) => {
      const a = e.resolveDirective("kb-fill");
      return e.openBlock(), e.createElementBlock("div", {
        class: "ads-workbench",
        dir: Xo.value ? "rtl" : "ltr"
      }, [
        e.createElementVNode("header", Ra, [
          e.createVNode(Ba),
          e.createElementVNode("div", Ua, [
            e.createElementVNode("span", za, [
              n[46] || (n[46] = e.createElementVNode(
                "i",
                { class: "ri-map-pin-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("UAE GROWTH DESK · 阿联酋")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(t.$t("海外广告投放工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(t.$t("依托 {p0} 等海外主流推广渠道，为客户提供产品广告投放、品牌曝光、用户增长、数据复盘与账户优化全链路服务，助力品牌实现持续增长与业务突破。", { p0: e.unref(le) })),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Ka, [
              e.createElementVNode("span", null, [
                n[47] || (n[47] = e.createElementVNode(
                  "i",
                  { class: "ri-global-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("四大主流渠道")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("span", null, [
                n[48] || (n[48] = e.createElementVNode(
                  "i",
                  { class: "ri-line-chart-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("全链路增长")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("span", null, [
                n[49] || (n[49] = e.createElementVNode(
                  "i",
                  { class: "ri-shield-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("客户授权登录")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createCommentVNode(" 服务链压缩版：原六张大卡改为一行小 icon（悬停看明细），不再占独立区块 "),
            e.createElementVNode("div", {
              class: "hero-chain",
              "aria-label": t.$t("阿联酋广告代投放服务链")
            }, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(Jl, (l, r) => e.createElementVNode("span", {
                  key: l.label,
                  class: "hero-chain-step",
                  title: t.$t(l.detail)
                }, [
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
                    e.toDisplayString(t.$t(l.label)) + " ",
                    1
                    /* TEXT */
                  ),
                  r < Jl.length - 1 ? (e.openBlock(), e.createElementBlock("em", Ha, "›")) : e.createCommentVNode("v-if", !0)
                ], 8, Ga)),
                64
                /* STABLE_FRAGMENT */
              ))
            ], 8, ja)
          ]),
          e.createElementVNode("div", Ja, [
            e.createElementVNode("button", {
              class: "button ghost",
              disabled: mt.value,
              onClick: Rn
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(mt.value ? "ri-loader-4-line spin" : "ri-refresh-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                " " + e.toDisplayString(mt.value ? t.$t("刷新中…") : t.$t("刷新状态")),
                1
                /* TEXT */
              )
            ], 8, qa)
          ])
        ]),
        e.createCommentVNode(" ══ 多 Tab 导航：投放工作区 / 平台连接 / 指标与复盘 / 操作审计 / 定时自动化 ══ "),
        e.createElementVNode("nav", {
          class: "ads-tabs",
          role: "tablist",
          "aria-label": t.$t("广告工作台功能分区")
        }, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(sl, (l) => e.createElementVNode("button", {
              key: l.id,
              type: "button",
              role: "tab",
              "aria-selected": z.value === l.id,
              class: e.normalizeClass({ active: z.value === l.id }),
              onClick: (r) => z.value = l.id
            }, [
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
                e.toDisplayString(t.$t(l.label)),
                1
                /* TEXT */
              )
            ], 10, Za)),
            64
            /* STABLE_FRAGMENT */
          ))
        ], 8, Ya),
        e.createElementVNode("p", Xa, [
          n[50] || (n[50] = e.createElementVNode(
            "i",
            { class: "ri-information-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(t.$t(fo.value.desc)),
            1
            /* TEXT */
          )
        ]),
        e.createCommentVNode(" ══ 投放工作区 Tab：引导式分步（左）+ 历史视频（右）══ "),
        z.value === "campaign" ? (e.openBlock(), e.createElementBlock("section", Qa, [
          e.createElementVNode(
            "div",
            {
              ref_key: "guideMainEl",
              ref: Xl,
              class: "guide-main"
            },
            [
              e.createCommentVNode(" 解决方案工作台硬规则：共享步骤条粘顶常驻视口；点选滚到对应步骤卡片 "),
              e.createVNode(Ta, {
                steps: So.value,
                "model-value": Ql.value,
                "onUpdate:modelValue": wo
              }, null, 8, ["steps", "model-value"]),
              e.createCommentVNode(" 第 1 步：制作引擎 "),
              e.createElementVNode(
                "article",
                {
                  class: e.normalizeClass(["guide-step", { done: be.value }])
                },
                [
                  e.createElementVNode("header", null, [
                    e.createElementVNode("span", xa, [
                      be.value ? (e.openBlock(), e.createElementBlock("i", er)) : (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createTextVNode("1")
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(t.$t("第 1 步 · 配置制作引擎")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(t.$t("接入视频生成模型与 TTS 配音；点击卡片在弹出层完成，不跳转页面。")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "em",
                      {
                        class: e.normalizeClass(["step-state", be.value ? "ok" : "todo"])
                      },
                      e.toDisplayString(be.value ? t.$t("已完成") : t.$t("待完成")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", tr, [
                    e.createElementVNode("div", lr, [
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: e.normalizeClass(["media-engine-chip", `tone-${yt.value.tone}`]),
                          onClick: n[0] || (n[0] = (l) => fl("video"))
                        },
                        [
                          n[51] || (n[51] = e.createElementVNode(
                            "i",
                            { class: "ri-film-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createElementVNode("span", null, [
                            e.createElementVNode("strong", null, [
                              e.createTextVNode(
                                e.toDisplayString(t.$t("视频生成模型")),
                                1
                                /* TEXT */
                              ),
                              ke.value ? (e.openBlock(), e.createElementBlock(
                                e.Fragment,
                                { key: 0 },
                                [
                                  e.createTextVNode(
                                    " · " + e.toDisplayString(ke.value),
                                    1
                                    /* TEXT */
                                  )
                                ],
                                64
                                /* STABLE_FRAGMENT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]),
                            yt.value.detail ? (e.openBlock(), e.createElementBlock(
                              "small",
                              nr,
                              e.toDisplayString(yt.value.detail),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ]),
                          e.createElementVNode(
                            "em",
                            null,
                            e.toDisplayString(yt.value.tone === "ready" ? t.$t("已就绪") : t.$t("去配置")),
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
                          type: "button",
                          class: e.normalizeClass(["media-engine-chip", `tone-${ml.value.tone}`]),
                          onClick: n[1] || (n[1] = (l) => fl("tts"))
                        },
                        [
                          n[52] || (n[52] = e.createElementVNode(
                            "i",
                            { class: "ri-mic-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createElementVNode("span", null, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(t.$t("TTS 配音")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(ml.value.detail),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode(
                            "em",
                            null,
                            e.toDisplayString(ml.value.tone === "ready" ? t.$t("已就绪") : t.$t("去配置")),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      )
                    ]),
                    J.value === "dynamic" && !pl.value ? (e.openBlock(), e.createElementBlock("p", or, [
                      n[53] || (n[53] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("尚未配置视频剪辑模型：生成广告视频与后续投放流程都会被阻止，请先完成配置。")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createCommentVNode(" #17 成片设置：成片方式 / 成片比例 / 配音与配乐 "),
                    e.createElementVNode("div", ar, [
                      e.createElementVNode("div", rr, [
                        e.createElementVNode(
                          "span",
                          ir,
                          e.toDisplayString(t.$t("成片方式")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", sr, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(yo.value, (l) => (e.openBlock(), e.createElementBlock("button", {
                              key: l.id,
                              type: "button",
                              class: e.normalizeClass({ active: J.value === l.id }),
                              onClick: (r) => J.value = l.id
                            }, [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(l.icon)
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              e.createElementVNode("span", null, [
                                e.createElementVNode(
                                  "strong",
                                  null,
                                  e.toDisplayString(t.$t(l.label)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(t.$t(l.desc)),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ], 10, cr))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ]),
                      e.createCommentVNode(" #22 成片比例：多选，勾几个出几份；默认随第 2 步平台自动预勾 "),
                      e.createElementVNode("div", dr, [
                        e.createElementVNode(
                          "span",
                          ur,
                          e.toDisplayString(t.$t("成片比例")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", mr, [
                          (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(ho, (l) => e.createElementVNode(
                              "label",
                              {
                                key: l.value,
                                class: e.normalizeClass(["ps-aspect", { on: Le.value.includes(l.value) }])
                              },
                              [
                                e.createElementVNode("input", {
                                  type: "checkbox",
                                  checked: Le.value.includes(l.value),
                                  onChange: (r) => ko(l.value)
                                }, null, 40, pr),
                                e.createElementVNode("span", null, [
                                  e.createElementVNode(
                                    "strong",
                                    null,
                                    e.toDisplayString(l.label),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "small",
                                    null,
                                    e.toDisplayString(bo(l.value) || t.$t(l.hint)),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ],
                              2
                              /* CLASS */
                            )),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ]),
                        e.createElementVNode(
                          "small",
                          vr,
                          e.toDisplayString(t.$t("将按勾选的比例各出一份成片（当前 {p0} 份：{p1}）；发布时自动挑该平台收得下的那一份。", {
                            p0: zt.value.length,
                            p1: zt.value.join(" / ")
                          })),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createCommentVNode(" #23 配音与配乐：独立一行，不跟成片比例挤在一起 "),
                      e.createElementVNode("div", gr, [
                        e.createElementVNode(
                          "label",
                          {
                            class: e.normalizeClass(["ps-switch", { on: Pe.value }])
                          },
                          [
                            n[54] || (n[54] = e.createElementVNode(
                              "span",
                              { class: "ps-switch-icon" },
                              [
                                e.createElementVNode("i", { class: "ri-mic-line" })
                              ],
                              -1
                              /* CACHED */
                            )),
                            e.createElementVNode("span", fr, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(t.$t("生成 AI 旁白与字幕")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(t.$t("用默认 TTS 配音，并把同一时间轴的字幕烧进画面")),
                                1
                                /* TEXT */
                              )
                            ]),
                            e.withDirectives(e.createElementVNode(
                              "input",
                              {
                                "onUpdate:modelValue": n[2] || (n[2] = (l) => Pe.value = l),
                                type: "checkbox"
                              },
                              null,
                              512
                              /* NEED_PATCH */
                            ), [
                              [e.vModelCheckbox, Pe.value]
                            ]),
                            n[55] || (n[55] = e.createElementVNode(
                              "span",
                              {
                                class: "ps-switch-track",
                                "aria-hidden": "true"
                              },
                              [
                                e.createElementVNode("span", { class: "ps-switch-thumb" })
                              ],
                              -1
                              /* CACHED */
                            ))
                          ],
                          2
                          /* CLASS */
                        ),
                        e.createElementVNode("label", yr, [
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(t.$t("配乐情绪")),
                            1
                            /* TEXT */
                          ),
                          e.withDirectives(e.createElementVNode(
                            "select",
                            {
                              "onUpdate:modelValue": n[3] || (n[3] = (l) => Kt.value = l)
                            },
                            [
                              (e.openBlock(), e.createElementBlock(
                                e.Fragment,
                                null,
                                e.renderList(No, (l) => e.createElementVNode("option", {
                                  key: l.id,
                                  value: l.id
                                }, e.toDisplayString(t.$t(l.label)), 9, hr)),
                                64
                                /* STABLE_FRAGMENT */
                              ))
                            ],
                            512
                            /* NEED_PATCH */
                          ), [
                            [e.vModelSelect, Kt.value]
                          ])
                        ]),
                        e.createCommentVNode(`
                  素材兜底策略（P3-6）。以前素材不够时链路**自己决定**怎么办 ——
                  用户既不知道会发生什么，也无从选择。这几条的差别是要不要花钱、要不要等，
                  必须显式选；**默认那条不花钱**（点「生成」不等于同意为补素材额外付费）。
                `),
                        e.createElementVNode("label", kr, [
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(t.$t("素材不足时")),
                            1
                            /* TEXT */
                          ),
                          e.withDirectives(e.createElementVNode(
                            "select",
                            {
                              "onUpdate:modelValue": n[4] || (n[4] = (l) => Ie.value = l)
                            },
                            [
                              (e.openBlock(!0), e.createElementBlock(
                                e.Fragment,
                                null,
                                e.renderList(e.unref(ze.MATERIAL_FALLBACK_OPTIONS), (l) => (e.openBlock(), e.createElementBlock("option", {
                                  key: l.id,
                                  value: l.id
                                }, e.toDisplayString(t.$t(l.label)) + e.toDisplayString(l.costs ? t.$t("（花钱）") : ""), 9, br))),
                                128
                                /* KEYED_FRAGMENT */
                              ))
                            ],
                            512
                            /* NEED_PATCH */
                          ), [
                            [e.vModelSelect, Ie.value]
                          ]),
                          e.createElementVNode(
                            "small",
                            Er,
                            e.toDisplayString(t.$t(Vo.value)),
                            1
                            /* TEXT */
                          )
                        ])
                      ])
                    ])
                  ])
                ],
                2
                /* CLASS */
              ),
              e.createCommentVNode(" 第 2 步：勾选并连接平台（用户实际操作过才算完成，默认全选不白送对号） "),
              e.createElementVNode(
                "article",
                {
                  class: e.normalizeClass(["guide-step", { done: gt.value }])
                },
                [
                  e.createElementVNode("header", null, [
                    e.createElementVNode("span", Nr, [
                      gt.value ? (e.openBlock(), e.createElementBlock("i", Vr)) : (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createTextVNode("2")
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(t.$t("第 2 步 · 选择并连接投放平台")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(t.$t("勾选本次要投放的平台；Web 登录在工作流里完成，Google 系会弹外部 Chrome。详细配置在「平台连接」Tab。")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "em",
                      {
                        class: e.normalizeClass(["step-state", gt.value ? "ok" : "todo"])
                      },
                      e.toDisplayString(gt.value ? t.$t("已选 {p0} 个平台", { p0: X.value.length }) : t.$t("待确认")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", Sr, [
                    e.createElementVNode("div", wr, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(b), (l) => (e.openBlock(), e.createElementBlock(
                          "label",
                          {
                            key: `guide-${l.id}`,
                            class: e.normalizeClass(["guide-platform-chip", { off: de.value.has(l.id) }]),
                            style: e.normalizeStyle({ "--platform-color": l.color })
                          },
                          [
                            e.createElementVNode("input", {
                              type: "checkbox",
                              checked: !de.value.has(l.id),
                              onChange: (r) => Vn(l.id)
                            }, null, 40, _r),
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(l.icon)
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createElementVNode(
                              "span",
                              null,
                              e.toDisplayString(t.$t(l.label)),
                              1
                              /* TEXT */
                            ),
                            $l(l.id) ? (e.openBlock(), e.createElementBlock("em", {
                              key: 0,
                              title: t.$t("受 Google 登录限制，该平台无法在内置浏览器登录，会自动弹出外部系统浏览器（Chrome）完成登录。")
                            }, [...n[56] || (n[56] = [
                              e.createElementVNode(
                                "i",
                                { class: "ri-external-link-line" },
                                null,
                                -1
                                /* CACHED */
                              )
                            ])], 8, Dr)) : e.createCommentVNode("v-if", !0)
                          ],
                          6
                          /* CLASS, STYLE */
                        ))),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      e.createElementVNode("button", {
                        class: "mini-button",
                        type: "button",
                        onClick: n[5] || (n[5] = (l) => z.value = "connect")
                      }, [
                        n[57] || (n[57] = e.createElementVNode(
                          "i",
                          { class: "ri-settings-3-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("平台详细配置")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("div", Ar, [
                      e.createElementVNode("span", null, [
                        n[58] || (n[58] = e.createElementVNode(
                          "i",
                          { class: "ri-key-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("真实发布需要各平台账号 ID（{p0}），点击补填：", { p0: e.unref(ct) })),
                          1
                          /* TEXT */
                        )
                      ]),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(X.value, (l) => (e.openBlock(), e.createElementBlock("button", {
                          key: `id-${l.id}`,
                          class: "mini-button",
                          type: "button",
                          onClick: (r) => Cl(l.id)
                        }, [
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
                            e.toDisplayString(t.$t(l.label)),
                            1
                            /* TEXT */
                          )
                        ], 8, $r))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ],
                2
                /* CLASS */
              ),
              e.createCommentVNode(" 第 3 步：素材与广告视频 "),
              e.createElementVNode(
                "article",
                {
                  class: e.normalizeClass(["guide-step", { done: Ye.value }])
                },
                [
                  e.createElementVNode("header", null, [
                    e.createElementVNode("span", Cr, [
                      Ye.value ? (e.openBlock(), e.createElementBlock("i", Br)) : (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createTextVNode("3")
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(t.$t("第 3 步 · 准备素材或广告视频")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(J.value === "slideshow" ? t.$t("上传客户素材（图片/视频）——第 1 步选的是「图片成片」，会把这些图片按分镜拼成成片；也可在右侧历史列表直接选一条已生成的。") : t.$t("上传客户素材作为参考图——第 1 步选的是「动态视频生成」，视频模型会据此生成运镜镜头；也可在右侧历史列表直接选一条已生成的。")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "em",
                      {
                        class: e.normalizeClass(["step-state", Ye.value ? "ok" : "todo"])
                      },
                      e.toDisplayString(B.value ? t.$t("已选历史成片") : ce.value ? t.$t("素材已就绪") : Ut.value ? t.$t("提示词已就绪") : t.$t("待完成")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", Tr, [
                    e.createElementVNode(
                      "input",
                      {
                        ref_key: "creativeInput",
                        ref: rl,
                        class: "file-input",
                        type: "file",
                        multiple: "",
                        accept: "image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm",
                        onChange: Cn
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ),
                    e.createElementVNode(
                      "input",
                      {
                        ref_key: "creativeFolderInput",
                        ref: Gl,
                        class: "file-input",
                        type: "file",
                        multiple: "",
                        webkitdirectory: "",
                        directory: "",
                        accept: "image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm",
                        onChange: Cn
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ),
                    e.createElementVNode("div", Lr, [
                      e.createElementVNode("button", {
                        class: "creative-source-button",
                        type: "button",
                        onClick: n[6] || (n[6] = (l) => rl.value?.click())
                      }, [
                        n[59] || (n[59] = e.createElementVNode(
                          "i",
                          { class: "ri-file-add-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode("span", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(t.$t("多选素材文件")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(t.$t("一次选择多张图片和多个视频")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("button", {
                        class: "creative-source-button",
                        type: "button",
                        disabled: lt.value,
                        onClick: Po
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(lt.value ? "ri-loader-4-line spin" : "ri-folder-upload-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createElementVNode("span", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(t.$t("选择素材文件夹")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(lt.value ? t.$t("正在扫描素材…") : t.$t("递归读取文件夹中的全部支持素材")),
                            1
                            /* TEXT */
                          )
                        ])
                      ], 8, Pr),
                      e.createCommentVNode(" 只有「动态视频生成」需要提示词：图片成片是确定性拼接，没有分镜可写 "),
                      J.value === "dynamic" ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        class: e.normalizeClass(["creative-source-button generate", { chosen: Ut.value }]),
                        type: "button",
                        disabled: se.value,
                        onClick: sn
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(se.value ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        Ut.value && !se.value ? (e.openBlock(), e.createElementBlock("i", Mr)) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode("span", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(t.$t("生成广告视频提示词")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(I.value.length ? t.$t("已生成 {p0} 个分镜提示词，点击查看或重写", { p0: I.value.length }) : ke.value ? t.$t("先写分镜与运镜提示，第 5 步按它调用 {p0} 出片", { p0: ke.value }) : t.$t("先写分镜与运镜提示；需在第 1 步配置视频生成模型")),
                            1
                            /* TEXT */
                          )
                        ])
                      ], 10, Ir)) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createCommentVNode(` 保存后的分镜提示词就地展示、就地可改：第 5 步按这份出片，
                 藏在弹层里用户看不到自己到底在用什么提示词（实测反馈） `),
                    J.value === "dynamic" && Ne.value && I.value.length ? (e.openBlock(), e.createElementBlock("section", Or, [
                      e.createElementVNode("header", null, [
                        e.createElementVNode("span", null, [
                          n[60] || (n[60] = e.createElementVNode(
                            "i",
                            { class: "ri-film-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(t.$t("分镜提示词")),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("第 5 步按这份提示词调用视频模型出片；可直接修改，改完自动保存。")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("button", {
                          class: "mini-button",
                          type: "button",
                          onClick: sn
                        }, [
                          n[61] || (n[61] = e.createElementVNode(
                            "i",
                            { class: "ri-edit-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(t.$t("重新生成")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("label", Wr, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(t.$t("投放要求 / 创意简报")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "textarea",
                          {
                            "onUpdate:modelValue": n[7] || (n[7] = (l) => Se.value = l),
                            rows: "3"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            Se.value,
                            void 0,
                            { trim: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("ol", Fr, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(I.value, (l, r) => (e.openBlock(), e.createElementBlock("li", {
                            key: `inline-${l.id}`
                          }, [
                            e.createElementVNode("header", null, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(t.$t("镜头 {p0}", { p0: r + 1 })),
                                1
                                /* TEXT */
                              ),
                              e.withDirectives(e.createElementVNode("select", {
                                "onUpdate:modelValue": (i) => l.referenceImage = i,
                                class: "scene-ref",
                                title: t.$t("首帧参考图"),
                                onChange: et
                              }, [
                                e.createElementVNode(
                                  "option",
                                  Ur,
                                  e.toDisplayString(t.$t("不用参考图（纯文生视频）")),
                                  1
                                  /* TEXT */
                                ),
                                (e.openBlock(!0), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(ln.value, (i) => (e.openBlock(), e.createElementBlock("option", {
                                    key: i,
                                    value: i
                                  }, e.toDisplayString(t.$t("首帧：{p0}", { p0: i.split(/[\\/]/).pop() })), 9, zr))),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ], 40, Rr), [
                                [e.vModelSelect, l.referenceImage]
                              ]),
                              e.createElementVNode("em", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (i) => l.duration = i,
                                  type: "number",
                                  min: "2",
                                  max: "10",
                                  onChange: et
                                }, null, 40, Kr), [
                                  [
                                    e.vModelText,
                                    l.duration,
                                    void 0,
                                    { number: !0 }
                                  ]
                                ]),
                                e.createTextVNode(
                                  e.toDisplayString(t.$t("秒")),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ]),
                            e.createElementVNode("label", null, [
                              e.createElementVNode(
                                "span",
                                null,
                                e.toDisplayString(t.$t("运镜提示（交给视频模型）")),
                                1
                                /* TEXT */
                              ),
                              e.withDirectives(e.createElementVNode("textarea", {
                                "onUpdate:modelValue": (i) => l.prompt = i,
                                rows: "2",
                                onChange: et
                              }, null, 40, jr), [
                                [
                                  e.vModelText,
                                  l.prompt,
                                  void 0,
                                  { trim: !0 }
                                ]
                              ])
                            ]),
                            e.createElementVNode("label", null, [
                              e.createElementVNode(
                                "span",
                                null,
                                e.toDisplayString(t.$t("字幕 / 旁白文案")),
                                1
                                /* TEXT */
                              ),
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": (i) => l.caption = i,
                                type: "text",
                                onChange: et
                              }, null, 40, Gr), [
                                [
                                  e.vModelText,
                                  l.caption,
                                  void 0,
                                  { trim: !0 }
                                ]
                              ])
                            ])
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "button",
                      {
                        class: e.normalizeClass(["creative-dropzone", { filled: w.value.length, dragging: vt.value }]),
                        type: "button",
                        onClick: n[8] || (n[8] = (l) => rl.value?.click()),
                        onDragenter: n[9] || (n[9] = e.withModifiers((l) => vt.value = !0, ["prevent"])),
                        onDragover: n[10] || (n[10] = e.withModifiers((l) => vt.value = !0, ["prevent"])),
                        onDragleave: n[11] || (n[11] = e.withModifiers((l) => vt.value = !1, ["prevent"])),
                        onDrop: e.withModifiers(ma, ["prevent"])
                      },
                      [
                        ce.value ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createElementVNode("span", Hr, [
                              e.createCommentVNode(' 只有真有预览图才渲染 <img>：走原生目录选择器时素材没有 blob 预览，\n                       `src=""` 会被浏览器画成裂图占位符（实测就是这个现象） '),
                              ce.value.kind === "image" && ce.value.previewUrl ? (e.openBlock(), e.createElementBlock("img", {
                                key: 0,
                                src: ce.value.previewUrl,
                                alt: ""
                              }, null, 8, Jr)) : ce.value.kind === "image" ? (e.openBlock(), e.createElementBlock("i", qr)) : (e.openBlock(), e.createElementBlock("i", Yr))
                            ]),
                            e.createElementVNode("span", Zr, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(t.$t("{count} 个客户素材已就绪", { count: w.value.length })),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(ea.value) + " · " + e.toDisplayString(wl(Nl.value)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("em", null, [
                                n[62] || (n[62] = e.createElementVNode(
                                  "i",
                                  { class: "ri-add-circle-line" },
                                  null,
                                  -1
                                  /* CACHED */
                                )),
                                e.createTextVNode(
                                  e.toDisplayString(t.$t("点击重新多选，或拖入一整批素材")),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ]),
                            n[63] || (n[63] = e.createElementVNode(
                              "i",
                              { class: "ri-checkbox-circle-fill uploaded-check" },
                              null,
                              -1
                              /* CACHED */
                            ))
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 1 },
                          [
                            n[64] || (n[64] = e.createElementVNode(
                              "span",
                              { class: "upload-icon" },
                              [
                                e.createElementVNode("i", { class: "ri-upload-cloud-2-line" })
                              ],
                              -1
                              /* CACHED */
                            )),
                            e.createElementVNode("span", Xr, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(t.$t("拖入多张图片和多个视频，或在上方选择整个文件夹")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(t.$t("点击也可多选文件 · 不限制素材文件大小")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "em",
                                null,
                                e.toDisplayString(t.$t("支持 JPG、PNG、WebP、GIF、MP4、MOV、WebM")),
                                1
                                /* TEXT */
                              )
                            ])
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ],
                      34
                      /* CLASS, NEED_HYDRATION */
                    ),
                    w.value.length ? (e.openBlock(), e.createElementBlock("div", {
                      key: 1,
                      class: "creative-file-list",
                      "aria-label": t.$t("已选择素材")
                    }, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(w.value.slice(0, Jt.value), (l) => (e.openBlock(), e.createElementBlock("span", {
                          key: `${l.relativePath}-${l.name}`
                        }, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(l.kind === "video" ? "ri-video-line" : "ri-image-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createElementVNode("span", null, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(l.name),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(l.relativePath || wl(l.size)),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createCommentVNode(" 一次扫进来几百个素材，用不上的要能单条剔除 "),
                          e.createElementVNode("button", {
                            class: "creative-remove",
                            type: "button",
                            title: t.$t("移除这个素材"),
                            onClick: e.withModifiers((r) => Lo(l), ["stop"])
                          }, [...n[65] || (n[65] = [
                            e.createElementVNode(
                              "i",
                              { class: "ri-close-line" },
                              null,
                              -1
                              /* CACHED */
                            )
                          ])], 8, xr)
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      w.value.length > Jt.value ? (e.openBlock(), e.createElementBlock(
                        "button",
                        {
                          key: 0,
                          class: "creative-more",
                          type: "button",
                          onClick: n[12] || (n[12] = (l) => Jt.value += 40)
                        },
                        " +" + e.toDisplayString(w.value.length - Jt.value) + " " + e.toDisplayString(t.$t("个素材，点击展开")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ], 8, Qr)) : e.createCommentVNode("v-if", !0),
                    oe.value ? (e.openBlock(), e.createElementBlock("p", ei, [
                      n[66] || (n[66] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(oe.value),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ])
                ],
                2
                /* CLASS */
              ),
              e.createCommentVNode(" 第 4 步：投放信息（用户实际编辑过才算完成，预填默认值不白送对号） "),
              e.createElementVNode(
                "article",
                {
                  class: e.normalizeClass(["guide-step", { done: ft.value }])
                },
                [
                  e.createElementVNode("header", null, [
                    e.createElementVNode("span", ti, [
                      ft.value ? (e.openBlock(), e.createElementBlock("i", li)) : (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 1 },
                        [
                          e.createTextVNode("4")
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(t.$t("第 4 步 · 填写投放信息")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(t.$t("品牌、阿语标题、客户标识与各平台话题；勾选了几个平台就展示几个话题输入框。")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "em",
                      {
                        class: e.normalizeClass(["step-state", ft.value ? "ok" : "todo"])
                      },
                      e.toDisplayString(ft.value ? t.$t("已完成") : t.$t("待确认")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", ni, [
                    e.createElementVNode("div", oi, [
                      e.createElementVNode("label", null, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(t.$t("品牌 / 产品名称")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": n[13] || (n[13] = (l) => _.brandName = l),
                          type: "text",
                          placeholder: t.$t("例如：UAE Market Entry")
                        }, null, 8, ai), [
                          [
                            e.vModelText,
                            _.brandName,
                            void 0,
                            { trim: !0 }
                          ],
                          [a, "brand"]
                        ])
                      ]),
                      e.createElementVNode("label", null, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(t.$t("阿语广告标题")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": n[14] || (n[14] = (l) => _.arabicHeadline = l),
                            dir: "rtl",
                            type: "text",
                            placeholder: "اكتشف علامتنا في الإمارات"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            _.arabicHeadline,
                            void 0,
                            { trim: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", ri, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(t.$t("客户标识（账户隔离与审计）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": n[15] || (n[15] = (l) => A.tenantId = l),
                          type: "text",
                          placeholder: t.$t("例如：tenant-uae-demo")
                        }, null, 8, ii), [
                          [
                            e.vModelText,
                            A.tenantId,
                            void 0,
                            { trim: !0 }
                          ]
                        ])
                      ])
                    ]),
                    e.createElementVNode("div", {
                      class: "platform-topics",
                      "aria-label": t.$t("各平台话题")
                    }, [
                      e.createElementVNode("div", ci, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(t.$t("各平台话题")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("勾选了哪些「本次投放」平台就展示哪些；发布时写入对应平台的内容与广告系列。")),
                          1
                          /* TEXT */
                        )
                      ]),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(X.value, (l) => (e.openBlock(), e.createElementBlock("label", {
                          key: `topic-${l.id}`
                        }, [
                          e.createElementVNode(
                            "span",
                            {
                              style: e.normalizeStyle({ color: l.color })
                            },
                            [
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
                                e.toDisplayString(t.$t(l.label)),
                                1
                                /* TEXT */
                              )
                            ],
                            4
                            /* STYLE */
                          ),
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (r) => ue[l.id] = r,
                            type: "text",
                            placeholder: t.$t("例如：#UAE #Dubai #迪拜")
                          }, null, 8, di), [
                            [
                              e.vModelText,
                              ue[l.id],
                              void 0,
                              { trim: !0 }
                            ]
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      X.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                        "p",
                        ui,
                        e.toDisplayString(t.$t("当前没有勾选任何「本次投放」平台；先在平台连接 Tab 勾选后再填写话题。")),
                        1
                        /* TEXT */
                      ))
                    ], 8, si)
                  ])
                ],
                2
                /* CLASS */
              ),
              e.createCommentVNode(" 第 5 步：一键执行 "),
              e.createElementVNode(
                "article",
                {
                  class: e.normalizeClass(["guide-step run-step", { ready: Qt("campaign-launch") }])
                },
                [
                  e.createElementVNode("header", null, [
                    n[67] || (n[67] = e.createElementVNode(
                      "span",
                      { class: "step-no" },
                      [
                        e.createElementVNode("i", { class: "ri-rocket-2-line" })
                      ],
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode("div", null, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(t.$t("第 5 步 · 一键执行投放")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(t.$t("前 4 步就绪后点击执行：按第 1 步的设置重新生成成片 → 逐平台打开编辑器 → 注入成片 → 填写文案 → 提交发布。想用现成成片再投一次，请点右侧历史列表里那条的「一键发布」。")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  e.createElementVNode("div", mi, [
                    e.createElementVNode("button", {
                      class: "button primary run-button",
                      type: "button",
                      disabled: !Qt("campaign-launch") || !!e.unref($) || e.unref(N),
                      onClick: wn
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(e.unref($) || e.unref(N) ? "ri-loader-4-line spin" : "ri-rocket-2-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        " " + e.toDisplayString(e.unref(N) ? t.$t("正在生成成片…") : e.unref($) ? t.$t("正在执行投放…") : e.unref(V).length ? t.$t("执行新一轮投放任务") : t.$t("一键执行投放任务")),
                        1
                        /* TEXT */
                      )
                    ], 8, pi),
                    e.createCommentVNode(" 生成阶段：动态视频生成模式下第 5 步先真调模型出片，进度与预览都在这里 "),
                    e.createCommentVNode(` 失败后也要留着：只认 active/preview 的话，一出错整块就消失，
                 用户看不到哪一步挂了、也无从判断要不要重试（实测反馈） `),
                    e.unref(N) || e.unref(pe) || e.unref(k).length ? (e.openBlock(), e.createElementBlock(
                      "div",
                      {
                        key: 0,
                        class: e.normalizeClass(["run-live", { active: e.unref(N) }])
                      },
                      [
                        e.createElementVNode("div", vi, [
                          e.createCommentVNode(" 取消是中性终态：不用告警图标、不说「失败」（用户自己叫停的，不是出错） "),
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(e.unref(N) ? "ri-loader-4-line spin" : e.unref(k).some((l) => l.state === "failed") ? "ri-error-warning-line" : e.unref(k).some((l) => l.state === "cancelled") ? "ri-stop-circle-line" : "ri-checkbox-circle-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(e.unref(N) ? t.$t("正在生成广告成片") : e.unref(k).some((l) => l.state === "failed") ? t.$t("成片生成失败") : e.unref(k).some((l) => l.state === "cancelled") ? t.$t("已取消本次成片") : t.$t("成片已生成")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("em", null, [
                            qt.value ? (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              { key: 0 },
                              [
                                e.createTextVNode(
                                  e.toDisplayString(t.$t("画幅 {p0}/{p1}", { p0: qt.value.done + 1, p1: qt.value.total })) + " · ",
                                  1
                                  /* TEXT */
                                )
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            )) : e.createCommentVNode("v-if", !0),
                            e.createTextVNode(
                              " " + e.toDisplayString(Sl.value.done) + " / " + e.toDisplayString(Sl.value.total),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createCommentVNode(` 主进程一直有取消通道（preload 的 cancelSlideshow），界面上却没有入口：
                     跑起来之后用户只能干等或杀应用。成片是分钟级的重活，必须给得起后悔药。 `),
                          e.unref(N) ? (e.openBlock(), e.createElementBlock("button", {
                            key: 0,
                            class: "mini-button run-retry",
                            type: "button",
                            disabled: at.value,
                            onClick: n[16] || (n[16] = (l) => _n())
                          }, [
                            n[68] || (n[68] = e.createElementVNode(
                              "i",
                              { class: "ri-stop-circle-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(at.value ? t.$t("正在停止…") : t.$t("取消生成")),
                              1
                              /* TEXT */
                            )
                          ], 8, gi)) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("div", fi, [
                          e.createElementVNode(
                            "span",
                            {
                              style: e.normalizeStyle({ width: `${Sl.value.percent}%` })
                            },
                            null,
                            4
                            /* STYLE */
                          )
                        ]),
                        e.createElementVNode("ol", yi, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(e.unref(k), (l) => (e.openBlock(), e.createElementBlock(
                              "li",
                              {
                                key: l.id,
                                class: e.normalizeClass(l.state)
                              },
                              [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(l.state === "running" ? "ri-loader-4-line spin" : l.state === "done" ? "ri-check-line" : l.state === "failed" ? "ri-close-line" : l.state === "cancelled" ? "ri-stop-circle-line" : "ri-time-line")
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createElementVNode(
                                  "strong",
                                  null,
                                  e.toDisplayString(t.$t(l.name)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "span",
                                  hi,
                                  e.toDisplayString(Mo(l)),
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
                        ]),
                        e.createCommentVNode(" 失败原因进下面的告警卡（带重新生成）；其它阶段性消息仍在这里 "),
                        e.unref(T) && wt.value?.state !== "failed" ? (e.openBlock(), e.createElementBlock(
                          "p",
                          ki,
                          e.toDisplayString(e.unref(T)),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createCommentVNode(`
                三种必须有人处理的终态：失败 / 可能已超时 / 上次运行已中断。
                失败即终止：spinner 已由 failAdsGenRunningNodes 收掉；这里给原因与「重新生成」。
                超时由看门狗判（跑过 max(预计×3, 预计+5min) 或很久没进度），可「继续等待」或「重新生成」
                （重新生成会先取消还在跑的旧任务，不堆僵尸进程）。
              `),
                        wt.value ? (e.openBlock(), e.createBlock(La, {
                          key: 1,
                          state: wt.value.state,
                          message: wt.value.message,
                          "elapsed-sec": e.unref(we).elapsedSec.value,
                          "estimate-sec": nt.value?.etaSec || null,
                          "since-heartbeat-sec": e.unref(we).sinceHeartbeatSec.value,
                          "retry-label": t.$t("重新生成并执行投放"),
                          busy: St.value,
                          onRetry: n[17] || (n[17] = (l) => Wo()),
                          onKeepWaiting: n[18] || (n[18] = (l) => e.unref(we).keepWaiting())
                        }, null, 8, ["state", "message", "elapsed-sec", "estimate-sec", "since-heartbeat-sec", "retry-label", "busy"])) : e.createCommentVNode("v-if", !0),
                        e.unref(pe) ? (e.openBlock(), e.createElementBlock("button", {
                          key: 2,
                          class: "mini-button primary",
                          type: "button",
                          onClick: n[19] || (n[19] = (l) => yn({ id: "gen", projectName: _.brandName, path: e.unref(pe), createdAt: Date.now() }))
                        }, [
                          n[69] || (n[69] = e.createElementVNode(
                            "i",
                            { class: "ri-play-circle-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(t.$t("预览成片")),
                            1
                            /* TEXT */
                          )
                        ])) : e.createCommentVNode("v-if", !0)
                      ],
                      2
                      /* CLASS */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createCommentVNode(' 执行中就地展开多节点状态：用户点完立刻看到"程序在跑"，不必去右侧找 '),
                    e.unref(V).length ? (e.openBlock(), e.createElementBlock(
                      "div",
                      {
                        key: 1,
                        class: e.normalizeClass(["run-live", { active: !!e.unref($) }])
                      },
                      [
                        e.createElementVNode("div", bi, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(e.unref($) ? "ri-loader-4-line spin" : e.unref(it) ? "ri-error-warning-line" : "ri-checkbox-circle-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(e.unref($) ? t.$t("投放执行中") : e.unref(it) ? t.$t("上次执行被中断") : t.$t("本次投放已结束")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("em", null, [
                            e.unref(It) && !e.unref($) ? (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              { key: 0 },
                              [
                                e.createTextVNode(
                                  e.toDisplayString(an(e.unref(It))) + " · ",
                                  1
                                  /* TEXT */
                                )
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            )) : e.createCommentVNode("v-if", !0),
                            e.createTextVNode(
                              " " + e.toDisplayString(ot.value.platformsDone) + " / " + e.toDisplayString(ot.value.platforms),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createCommentVNode(" 中断/失败可重试：只重跑没成功的那几条，已发出去的不动（重发会在平台侧堆重复内容） "),
                          pn.value && !e.unref($) && !e.unref(N) ? (e.openBlock(), e.createElementBlock("button", {
                            key: 0,
                            class: "mini-button primary run-retry",
                            type: "button",
                            onClick: n[20] || (n[20] = (l) => fn())
                          }, [
                            n[70] || (n[70] = e.createElementVNode(
                              "i",
                              { class: "ri-refresh-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(t.$t("重试未完成的 {p0} 个平台", { p0: pn.value })),
                              1
                              /* TEXT */
                            )
                          ])) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("div", Ei, [
                          e.createElementVNode(
                            "span",
                            {
                              style: e.normalizeStyle({ width: `${ot.value.percent}%` })
                            },
                            null,
                            4
                            /* STYLE */
                          )
                        ]),
                        e.createElementVNode("ol", Ni, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(e.unref(V), (l) => (e.openBlock(), e.createElementBlock(
                              "li",
                              {
                                key: `live-${l.platformId}`,
                                class: e.normalizeClass(l.state)
                              },
                              [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(l.state === "running" ? "ri-loader-4-line spin" : l.state === "done" ? "ri-check-line" : l.state === "failed" ? "ri-close-line" : "ri-time-line")
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                ),
                                e.createElementVNode(
                                  "strong",
                                  null,
                                  e.toDisplayString(l.platform),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "span",
                                  null,
                                  e.toDisplayString(Ro(l)),
                                  1
                                  /* TEXT */
                                ),
                                l.state === "failed" && !e.unref($) && !e.unref(N) ? (e.openBlock(), e.createElementBlock("button", {
                                  key: 0,
                                  class: "mini-button run-retry-one",
                                  type: "button",
                                  title: t.$t("只重跑这个平台"),
                                  onClick: (r) => fn(l.platformId)
                                }, [
                                  n[71] || (n[71] = e.createElementVNode(
                                    "i",
                                    { class: "ri-refresh-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  e.createTextVNode(
                                    e.toDisplayString(t.$t("重试")),
                                    1
                                    /* TEXT */
                                  )
                                ], 8, Vi)) : e.createCommentVNode("v-if", !0)
                              ],
                              2
                              /* CLASS */
                            ))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ],
                      2
                      /* CLASS */
                    )) : e.createCommentVNode("v-if", !0),
                    !Qt("campaign-launch") && !e.unref($) && !e.unref(N) ? (e.openBlock(), e.createElementBlock("p", Si, [
                      n[72] || (n[72] = e.createElementVNode(
                        "i",
                        { class: "ri-information-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(Sn("campaign-launch")),
                        1
                        /* TEXT */
                      )
                    ])) : Vt.value ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 3 },
                      [
                        e.createCommentVNode(" 开跑前的预检没过（例如素材目录里一张图都没有）：原地说清，不去起任务 "),
                        e.createElementVNode("p", wi, [
                          n[73] || (n[73] = e.createElementVNode(
                            "i",
                            { class: "ri-error-warning-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(Vt.value),
                            1
                            /* TEXT */
                          )
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : !e.unref(V).length && !e.unref(N) && !wt.value ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 4 },
                      [
                        e.createCommentVNode(" 「全部就绪」只在真的空闲且上一轮没有失败/超时时显示；和失败态同屏是自相矛盾（实测截图） "),
                        e.createElementVNode("p", _i, [
                          n[74] || (n[74] = e.createElementVNode(
                            "i",
                            { class: "ri-checkbox-circle-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(t.$t("全部就绪，可一键执行。")),
                            1
                            /* TEXT */
                          )
                        ])
                      ],
                      2112
                      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])
                ],
                2
                /* CLASS */
              )
            ],
            512
            /* NEED_PATCH */
          ),
          e.createCommentVNode(" 右侧：历史生成视频 + 发布回执 "),
          e.createElementVNode("aside", Di, [
            e.createElementVNode("div", Ai, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(t.$t("历史生成视频")),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                class: "mini-button",
                disabled: Et.value,
                onClick: rn
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(Et.value ? "ri-loader-4-line spin" : "ri-refresh-line")
                  },
                  null,
                  2
                  /* CLASS */
                )
              ], 8, $i)
            ]),
            e.createElementVNode(
              "p",
              Ci,
              e.toDisplayString(t.$t("生成过的广告视频都在这里：可预览、选为发布视频，或直接一键发布测试发布链路。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("label", Bi, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": n[21] || (n[21] = (l) => kt.value = l),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, kt.value]
              ]),
              e.createElementVNode("span", null, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(t.$t("自动完成发布")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(kt.value ? t.$t("注入成片后自动填文案并点击「发布」，全程无需人工") : t.$t("只准备成片与文案，最终「发布」由你手动点击")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            W.value.length ? (e.openBlock(), e.createElementBlock("div", Li, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList($o.value, (l) => (e.openBlock(), e.createElementBlock(
                  "article",
                  {
                    key: l.id,
                    class: e.normalizeClass(["ads-video-item", { selected: B.value === l.path }])
                  },
                  [
                    e.createElementVNode("span", Pi, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(C[l.path] ? "ri-movie-2-line" : "ri-time-line")
                        },
                        null,
                        2
                        /* CLASS */
                      )
                    ]),
                    e.createElementVNode("div", Ii, [
                      e.createElementVNode("strong", null, [
                        e.createTextVNode(
                          e.toDisplayString(Eo(l)) + " ",
                          1
                          /* TEXT */
                        ),
                        e.createCommentVNode(` 画幅徽标从**文件名**解析，不依赖 projectName 怎么拼 ——
                     名字是生成时拼好存进 localStorage 的，历史数据/改过命名规则时就没有画幅了 `),
                        Xe(l.path) ? (e.openBlock(), e.createElementBlock(
                          "span",
                          Mi,
                          e.toDisplayString(Xe(l.path)),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(an(l.createdAt)) + " · " + e.toDisplayString(l.path),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "em",
                        {
                          class: e.normalizeClass(C[l.path] ? "ok" : "pending")
                        },
                        e.toDisplayString(C[l.path] ? t.$t("已生成，可用于发布") : t.$t("生成中 / 文件尚未出现")),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createCommentVNode(" 画幅是硬约束：先摆出这批成片能覆盖哪些平台，免得点了才发现平台被摘 "),
                      C[l.path] ? (e.openBlock(), e.createElementBlock("small", Oi, [
                        e.createElementVNode(
                          "span",
                          Wi,
                          e.toDisplayString(t.$t("{p0}：{p1}", { p0: t.$t("可发布"), p1: vl(l).ok.join(" / ") || t.$t("无") })),
                          1
                          /* TEXT */
                        ),
                        vl(l).miss.length ? (e.openBlock(), e.createElementBlock(
                          "span",
                          Fi,
                          e.toDisplayString(t.$t("{p0}：{p1}", { p0: t.$t("画幅不符"), p1: vl(l).miss.join(" / ") })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode("div", Ri, [
                      e.createElementVNode("button", {
                        class: "mini-button primary",
                        disabled: !C[l.path] || !!e.unref($),
                        title: t.$t("对勾选的「本次投放」平台直接执行真实视频发布（测试发布链路）"),
                        onClick: (r) => vn(l)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(e.unref($) === l.id ? "ri-loader-4-line spin" : "ri-send-plane-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          " " + e.toDisplayString(t.$t("一键发布")),
                          1
                          /* TEXT */
                        )
                      ], 8, Ui),
                      e.createElementVNode("button", {
                        class: "mini-button",
                        disabled: !C[l.path],
                        onClick: (r) => yn(l)
                      }, [
                        n[75] || (n[75] = e.createElementVNode(
                          "i",
                          { class: "ri-play-circle-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("预览")),
                          1
                          /* TEXT */
                        )
                      ], 8, zi),
                      e.createElementVNode("button", {
                        class: e.normalizeClass(["mini-button", { primary: B.value !== l.path }]),
                        disabled: !C[l.path],
                        onClick: (r) => Io(l)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(B.value === l.path ? "ri-checkbox-circle-fill" : "ri-checkbox-blank-circle-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          " " + e.toDisplayString(B.value === l.path ? t.$t("已选为发布视频") : t.$t("选为发布视频")),
                          1
                          /* TEXT */
                        )
                      ], 10, Ki),
                      e.createElementVNode("button", {
                        class: "mini-button warn",
                        onClick: (r) => Uo(l.id)
                      }, [
                        n[76] || (n[76] = e.createElementVNode(
                          "i",
                          { class: "ri-delete-bin-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("移除")),
                          1
                          /* TEXT */
                        )
                      ], 8, ji)
                    ])
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              )),
              e.createCommentVNode(` #32 分页：第 1 页恒为最新（按生成时间倒序）。
               只有一页时也保留这一行显示总条数 —— 否则条数减少后整块凭空消失，看着像功能没了。 `),
              e.createElementVNode("div", Gi, [
                xe.value > 1 ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  class: "mini-button",
                  disabled: te.value <= 1,
                  onClick: n[22] || (n[22] = (l) => te.value -= 1)
                }, [
                  n[77] || (n[77] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-left-s-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("上一页")),
                    1
                    /* TEXT */
                  )
                ], 8, Hi)) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("span", null, [
                  e.createTextVNode(
                    e.toDisplayString(t.$t("共 {p0} 条", { p0: W.value.length })) + " ",
                    1
                    /* TEXT */
                  ),
                  xe.value > 1 ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode(
                        " · " + e.toDisplayString(te.value) + " / " + e.toDisplayString(xe.value),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                xe.value > 1 ? (e.openBlock(), e.createElementBlock("button", {
                  key: 1,
                  class: "mini-button",
                  disabled: te.value >= xe.value,
                  onClick: n[23] || (n[23] = (l) => te.value += 1)
                }, [
                  e.createTextVNode(
                    e.toDisplayString(t.$t("下一页")),
                    1
                    /* TEXT */
                  ),
                  n[78] || (n[78] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-s-line" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ], 8, Ji)) : e.createCommentVNode("v-if", !0)
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "div",
              Ti,
              e.toDisplayString(t.$t("还没有生成过广告视频。点击右上角「生成广告视频」开始第一条。")),
              1
              /* TEXT */
            )),
            e.createCommentVNode(" #28 发布运行状态：和工作流「实时执行记录」同一套读法 —— 总进度条 + 每平台逐步点亮 "),
            e.unref(V).length ? (e.openBlock(), e.createElementBlock("div", {
              key: 2,
              class: "publish-runs",
              "aria-label": t.$t("发布运行状态")
            }, [
              e.createElementVNode("div", Yi, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(t.$t("发布运行状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(ot.value.platformsDone) + "/" + e.toDisplayString(ot.value.platforms),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", Zi, [
                e.createElementVNode(
                  "span",
                  {
                    style: e.normalizeStyle({ width: `${ot.value.percent}%` })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ]),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(V), (l) => (e.openBlock(), e.createElementBlock(
                  "article",
                  {
                    key: l.platformId,
                    class: e.normalizeClass(["publish-run", l.state])
                  },
                  [
                    e.createElementVNode("header", null, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(l.icon),
                          style: e.normalizeStyle({ color: l.color })
                        },
                        null,
                        6
                        /* CLASS, STYLE */
                      ),
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(l.platform),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        Xi,
                        e.toDisplayString(l.aspect),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "em",
                        {
                          class: e.normalizeClass(["status-pill", l.state === "running" ? "warning" : l.state === "done" ? "ready" : l.state === "failed" ? "error" : ""])
                        },
                        e.toDisplayString(l.status || t.$t("待执行")),
                        3
                        /* TEXT, CLASS */
                      )
                    ]),
                    e.createElementVNode("small", {
                      class: "run-file",
                      title: l.file
                    }, e.toDisplayString(l.file), 9, Qi),
                    e.createElementVNode("ol", xi, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(l.steps, (r) => (e.openBlock(), e.createElementBlock(
                          "li",
                          {
                            key: r.key,
                            class: e.normalizeClass(r.state)
                          },
                          [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(r.state === "done" ? "ri-check-line" : r.state === "running" ? "ri-loader-4-line spin" : r.state === "failed" ? "ri-close-line" : r.state === "skipped" ? "ri-subtract-line" : "ri-circle-line")
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createElementVNode(
                              "span",
                              null,
                              e.toDisplayString(t.$t(r.label)),
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
                    ]),
                    l.detail ? (e.openBlock(), e.createElementBlock(
                      "p",
                      es,
                      e.toDisplayString(l.detail),
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
            ], 8, qi)) : e.createCommentVNode("v-if", !0)
          ])
        ])) : e.createCommentVNode("v-if", !0),
        z.value === "connect" ? (e.openBlock(), e.createElementBlock("section", ts, [
          z.value === "connect" ? (e.openBlock(), e.createElementBlock("article", ls, [
            e.createElementVNode("div", ns, [
              e.createElementVNode(
                "span",
                os,
                e.toDisplayString(t.$t("Channel Access")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(t.$t("主流投放平台")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(t.$t("每个平台只能选择一种接入方式：API 使用 Token，Web 登录由客户本人在右侧浏览器完成账号、密码与 MFA。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", as, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(b), (l) => (e.openBlock(), e.createElementBlock(
                  "article",
                  {
                    key: `login-${l.id}`,
                    class: "platform-access-tile",
                    style: e.normalizeStyle({ "--platform-color": l.color })
                  },
                  [
                    e.createElementVNode("div", rs, [
                      e.createElementVNode("span", is, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(l.icon)
                          },
                          null,
                          2
                          /* CLASS */
                        )
                      ]),
                      e.createElementVNode("span", null, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(t.$t(l.label)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(l.caption),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("label", {
                        class: "access-tile-include",
                        title: t.$t("取消勾选后，本次发布不会打开该平台，也不会等待它登录")
                      }, [
                        e.createElementVNode("input", {
                          type: "checkbox",
                          checked: !de.value.has(l.id),
                          onChange: (r) => Vn(l.id)
                        }, null, 40, cs),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(t.$t("本次投放")),
                          1
                          /* TEXT */
                        )
                      ], 8, ss)
                    ]),
                    e.createElementVNode("div", {
                      class: "access-mode-switch",
                      role: "radiogroup",
                      "aria-label": t.$t("{platform} 接入方式", { platform: l.label })
                    }, [
                      e.createElementVNode("button", {
                        type: "button",
                        role: "radio",
                        "aria-checked": ee[l.id] === "api",
                        class: e.normalizeClass({ active: ee[l.id] === "api" }),
                        onClick: (r) => Wn(l.id, "api")
                      }, [...n[79] || (n[79] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-key-2-line" },
                          null,
                          -1
                          /* CACHED */
                        ),
                        e.createTextVNode(
                          "API ",
                          -1
                          /* CACHED */
                        )
                      ])], 10, us),
                      e.createElementVNode("button", {
                        type: "button",
                        role: "radio",
                        "aria-checked": ee[l.id] === "web",
                        class: e.normalizeClass({ active: ee[l.id] === "web" }),
                        onClick: (r) => Wn(l.id, "web")
                      }, [...n[80] || (n[80] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-window-line" },
                          null,
                          -1
                          /* CACHED */
                        ),
                        e.createTextVNode(
                          "Web ",
                          -1
                          /* CACHED */
                        )
                      ])], 10, ms)
                    ], 8, ds),
                    $l(l.id) ? (e.openBlock(), e.createElementBlock("p", ps, [
                      n[81] || (n[81] = e.createElementVNode(
                        "i",
                        { class: "ri-external-link-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("受 Google 登录限制，该平台无法在内置浏览器登录，会自动弹出外部系统浏览器（Chrome）完成登录。")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode("button", {
                      class: "access-connect-button",
                      type: "button",
                      disabled: Ce.value === l.id,
                      onClick: (r) => ga(l.id)
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(Ce.value === l.id ? "ri-loader-4-line spin" : ee[l.id] === "api" ? "ri-settings-3-line" : "ri-arrow-right-up-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        " " + e.toDisplayString(ee[l.id] === "api" ? t.$t("配置 API 凭据") : t.$t("打开 Web 登录")),
                        1
                        /* TEXT */
                      )
                    ], 8, vs)
                  ],
                  4
                  /* STYLE */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            ae.value ? (e.openBlock(), e.createElementBlock("p", gs, [
              n[82] || (n[82] = e.createElementVNode(
                "i",
                { class: "ri-window-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(ae.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ])) : e.createCommentVNode("v-if", !0)
        ])) : e.createCommentVNode("v-if", !0),
        z.value === "campaign" && w.value.length ? (e.openBlock(), e.createElementBlock("section", fs, [
          e.createElementVNode("div", ys, [
            e.createElementVNode(
              "span",
              hs,
              e.toDisplayString(t.$t("Agent Creative Preview")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h2",
              null,
              e.toDisplayString(t.$t("广告成品预览")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(t.$t("Agent 根据客户上传素材、品牌信息与阿语 RTL 标题实时合成。这里展示的是即将交给发布工作流的广告成品，不是素材原图。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", {
              class: "ad-preview-platforms",
              role: "tablist",
              "aria-label": t.$t("选择预览平台")
            }, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(b), (l) => (e.openBlock(), e.createElementBlock("button", {
                  key: `preview-${l.id}`,
                  type: "button",
                  role: "tab",
                  "aria-selected": Ot.value === l.id,
                  class: e.normalizeClass({ active: Ot.value === l.id }),
                  style: e.normalizeStyle({ "--platform-color": l.color }),
                  onClick: (r) => Ot.value = l.id
                }, [
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
                    e.toDisplayString(t.$t(l.label)),
                    1
                    /* TEXT */
                  )
                ], 14, bs))),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 8, ks),
            e.createElementVNode("ul", null, [
              e.createElementVNode("li", null, [
                n[83] || (n[83] = e.createElementVNode(
                  "i",
                  { class: "ri-checkbox-circle-fill" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("已应用 UAE 地区与阿拉伯语 RTL 版式")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("li", null, [
                n[84] || (n[84] = e.createElementVNode(
                  "i",
                  { class: "ri-checkbox-circle-fill" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("已生成平台 CTA、品牌署名与投放安全区")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("li", null, [
                n[85] || (n[85] = e.createElementVNode(
                  "i",
                  { class: "ri-checkbox-circle-fill" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("发布前会在工作流人工确认节点再次展示")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          e.createElementVNode(
            "article",
            {
              class: "ad-preview-device",
              style: e.normalizeStyle({ "--platform-color": Nn.value.color })
            },
            [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "span",
                  Es,
                  e.toDisplayString(_.brandName.slice(0, 1).toUpperCase() || "U"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(_.brandName || t.$t("客户品牌")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(t.$t(Nn.value.label)) + " · " + e.toDisplayString(t.$t("赞助内容")),
                    1
                    /* TEXT */
                  )
                ]),
                n[86] || (n[86] = e.createElementVNode(
                  "i",
                  { class: "ri-more-fill" },
                  null,
                  -1
                  /* CACHED */
                ))
              ]),
              e.createElementVNode("div", Ns, [
                Xt.value?.kind === "image" && Xt.value.previewUrl ? (e.openBlock(), e.createElementBlock("img", {
                  key: 0,
                  src: Xt.value.previewUrl,
                  alt: t.$t("客户素材生成的广告预览")
                }, null, 8, Vs)) : (e.openBlock(), e.createElementBlock("div", Ss, [
                  n[87] || (n[87] = e.createElementVNode(
                    "i",
                    { class: "ri-video-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(Xt.value?.name),
                    1
                    /* TEXT */
                  )
                ])),
                n[88] || (n[88] = e.createElementVNode(
                  "span",
                  { class: "ad-preview-market" },
                  "UAE · AR / EN",
                  -1
                  /* CACHED */
                ))
              ]),
              e.createElementVNode("div", ws, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(_.brandName || t.$t("客户品牌")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(_.arabicHeadline || "اكتشف علامتنا في الإمارات"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "p",
                  null,
                  e.toDisplayString(t.$t("اكتشف تجربة مصممة خصيصاً لعملائنا في دولة الإمارات.")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("footer", null, [
                e.createElementVNode("span", null, [
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(t.$t("الوجهة")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(t.$t("اكتشف المزيد")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    onClick: n[24] || (n[24] = (l) => e.unref(v).info(e.unref(o.t)("广告落地页地址待确认，当前仅预览广告素材。")))
                  },
                  e.toDisplayString(t.$t("了解更多")),
                  1
                  /* TEXT */
                )
              ])
            ],
            4
            /* STYLE */
          )
        ])) : e.createCommentVNode("v-if", !0),
        z.value === "scenarios" ? (e.openBlock(), e.createBlock(Ma, {
          key: 3,
          domain: "global-ads",
          execute: ya,
          "can-start": Qt,
          "start-blocked-reason": Sn,
          "before-start": ca,
          "hidden-scenarios": e.unref(j)
        }, null, 8, ["hidden-scenarios"])) : e.createCommentVNode("v-if", !0),
        z.value === "connect" ? (e.openBlock(), e.createElementBlock(
          "section",
          {
            key: 4,
            class: e.normalizeClass(["region-gate", {
              blocked: $t.value && !_e.value,
              allowed: $t.value && _e.value,
              unavailable: De.value
            }])
          },
          [
            e.createElementVNode("span", _s, [
              dt.value ? (e.openBlock(), e.createElementBlock("i", Ds)) : De.value ? (e.openBlock(), e.createElementBlock("i", As)) : _e.value ? (e.openBlock(), e.createElementBlock("i", $s)) : (e.openBlock(), e.createElementBlock("i", Cs))
            ]),
            e.createElementVNode("div", null, [
              dt.value ? (e.openBlock(), e.createElementBlock(
                "strong",
                Bs,
                e.toDisplayString(t.$t("正在核验区域与投放护栏")),
                1
                /* TEXT */
              )) : De.value ? (e.openBlock(), e.createElementBlock(
                "strong",
                Ts,
                e.toDisplayString(t.$t("区域状态不可用，写操作保持关闭")),
                1
                /* TEXT */
              )) : _e.value ? (e.openBlock(), e.createElementBlock(
                "strong",
                Ls,
                e.toDisplayString(t.$t("当前区域允许广告写操作")),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "strong",
                Ps,
                e.toDisplayString(t.$t("当前区域禁止广告写操作")),
                1
                /* TEXT */
              )),
              De.value ? (e.openBlock(), e.createElementBlock(
                "p",
                Is,
                e.toDisplayString(De.value),
                1
                /* TEXT */
              )) : _e.value ? (e.openBlock(), e.createElementBlock(
                "p",
                Os,
                e.toDisplayString(t.$t(`{p0}：{p1}
          · {p2}：{p3}
          · {p4}：{p5}
          · {p6}`, { p0: t.$t("区域"), p1: L.value?.region || "—", p2: t.$t("币种"), p3: L.value?.currency || "—", p4: t.$t("时区"), p5: L.value?.timezone || "—", p6: t.$t("写操作始终受预算护栏与人工确认保护。") })),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "p",
                Ms,
                e.toDisplayString(t.$t(String(L.value?.regionBlockReason || L.value?.region_block_reason || "请由管理员核对运行区域与 global_ads 配置。"))),
                1
                /* TEXT */
              ))
            ]),
            $t.value ? (e.openBlock(), e.createElementBlock(
              "span",
              Ws,
              e.toDisplayString(_e.value ? t.$t("可投放") : t.$t("只读")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ],
          2
          /* CLASS */
        )) : e.createCommentVNode("v-if", !0),
        z.value === "connect" ? (e.openBlock(), e.createElementBlock("section", {
          key: 5,
          class: "truth-grid",
          "aria-label": t.$t("能力边界")
        }, [
          e.createElementVNode("article", null, [
            n[89] || (n[89] = e.createElementVNode(
              "i",
              { class: "ri-close-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(t.$t("Snapchat / TikTok 暂未支持")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("当前只支持下方四个平台，不会把未实现平台显示为可用。")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("article", null, [
            n[90] || (n[90] = e.createElementVNode(
              "i",
              { class: "ri-window-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(t.$t("Web 会话：单进程最多 1 个")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("当前活跃")) + " " + e.toDisplayString(Kn(L.value?.web?.activeSessions ?? L.value?.web?.active_sessions)) + " / " + e.toDisplayString(t.$t("上限")) + " " + e.toDisplayString(Kn(L.value?.web?.maxParallelSessions ?? L.value?.web?.max_parallel_sessions)),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("article", null, [
            n[91] || (n[91] = e.createElementVNode(
              "i",
              { class: "ri-bar-chart-box-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(t.$t("Web 数据只有天粒度")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("Web 控制台导出不提供 breakdown，复盘报告会保留这项限制说明。")),
                1
                /* TEXT */
              )
            ])
          ])
        ], 8, Fs)) : e.createCommentVNode("v-if", !0),
        z.value === "connect" ? (e.openBlock(), e.createElementBlock("section", Rs, [
          e.createElementVNode("div", Us, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                zs,
                e.toDisplayString(t.$t("连接状态")),
                1
                /* TEXT */
              ),
              e.createCommentVNode(" 平台数跟着 PLATFORM_DEFS 走：隐藏一个平台就少一个，别再写死「四平台」 "),
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(t.$t("{p0} 个平台状态", { p0: e.unref(b).length })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                Ks,
                e.toDisplayString(t.$t("未来会支持更多平台")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "span",
              js,
              e.toDisplayString(xo.value) + " / " + e.toDisplayString(e.unref(b).length) + " " + e.toDisplayString(t.$t("已配置")),
              1
              /* TEXT */
            )
          ]),
          al.value ? (e.openBlock(), e.createElementBlock("div", Gs, [
            n[92] || (n[92] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("读取真实平台状态…")),
              1
              /* TEXT */
            )
          ])) : (e.openBlock(), e.createElementBlock("div", Hs, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(Ct.value, (l) => (e.openBlock(), e.createElementBlock("article", {
                key: l.id,
                class: "platform-card"
              }, [
                e.createElementVNode("div", Js, [
                  e.createElementVNode(
                    "span",
                    qs,
                    e.toDisplayString(Aa(l.id)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t(l.label)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(l.driverFamily || t.$t("驱动未报告")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["status-pill", l.tone])
                    },
                    e.toDisplayString(l.statusLabel),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("dl", null, [
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "dt",
                      null,
                      e.toDisplayString(t.$t("模式")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "dd",
                      null,
                      e.toDisplayString(Da(l.mode)),
                      1
                      /* TEXT */
                    )
                  ]),
                  l.mode === "api" ? (e.openBlock(), e.createElementBlock("div", Ys, [
                    e.createElementVNode(
                      "dt",
                      null,
                      e.toDisplayString(t.$t("API 账户")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "dd",
                      null,
                      e.toDisplayString(l.accountKeys.join(", ") || "—"),
                      1
                      /* TEXT */
                    )
                  ])) : (e.openBlock(), e.createElementBlock("div", Zs, [
                    e.createElementVNode(
                      "dt",
                      null,
                      e.toDisplayString(t.$t("Web 登录")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "dd",
                      null,
                      e.toDisplayString(_a(l.webLogin)),
                      1
                      /* TEXT */
                    )
                  ]))
                ]),
                l.mode === "api" && l.missingSecrets.length ? (e.openBlock(), e.createElementBlock("p", Xs, [
                  n[93] || (n[93] = e.createElementVNode(
                    "i",
                    { class: "ri-key-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    " " + e.toDisplayString(t.$t("{p0}：{p1}", { p0: t.$t("缺少凭据项"), p1: l.missingSecrets.join(", ") })),
                    1
                    /* TEXT */
                  )
                ])) : l.error ? (e.openBlock(), e.createElementBlock("p", Qs, [
                  n[94] || (n[94] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(l.error),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                l.capabilities.length ? (e.openBlock(), e.createElementBlock("div", xs, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(l.capabilities.slice(0, 5), (r) => (e.openBlock(), e.createElementBlock(
                      "span",
                      { key: r },
                      e.toDisplayString(r),
                      1
                      /* TEXT */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  l.capabilities.length > 5 ? (e.openBlock(), e.createElementBlock(
                    "span",
                    ec,
                    "+" + e.toDisplayString(l.capabilities.length - 5),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", tc, [
                  l.mode === "api" ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    class: "mini-button primary",
                    disabled: !!K[l.id],
                    onClick: (r) => Cl(l.id)
                  }, [
                    n[95] || (n[95] = e.createElementVNode(
                      "i",
                      { class: "ri-settings-3-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      " " + e.toDisplayString(l.missingSecrets.length ? t.$t("配置凭据") : t.$t("更新凭据")),
                      1
                      /* TEXT */
                    )
                  ], 8, lc)) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("button", {
                    class: "mini-button",
                    disabled: !!K[l.id] || l.mode === "api" && l.missingSecrets.length > 0,
                    onClick: (r) => ha(l)
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(K[l.id] === "verify" ? "ri-loader-4-line spin" : "ri-radar-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      " " + e.toDisplayString(t.$t("验证访问")),
                      1
                      /* TEXT */
                    )
                  ], 8, nc),
                  l.mode === "web" ? (e.openBlock(), e.createElementBlock("button", {
                    key: 1,
                    class: "mini-button",
                    disabled: !!K[l.id] || !_e.value || !$t.value,
                    onClick: (r) => ka(l)
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(K[l.id] === "start" ? "ri-loader-4-line spin" : "ri-window-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      " " + e.toDisplayString(t.$t("启动 Web 登录")),
                      1
                      /* TEXT */
                    )
                  ], 8, oc)) : e.createCommentVNode("v-if", !0)
                ]),
                ve[l.id] ? (e.openBlock(), e.createElementBlock(
                  "p",
                  {
                    key: 3,
                    class: e.normalizeClass(["operation-state", { bad: ve[l.id]?.verified !== !0 }])
                  },
                  [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(ve[l.id]?.verified === !0 ? "ri-checkbox-circle-line" : "ri-error-warning-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      " " + e.toDisplayString(Un(ve[l.id])),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                )) : e.createCommentVNode("v-if", !0),
                P[l.id] ? (e.openBlock(), e.createElementBlock("div", ac, [
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t("Web 会话")) + " · " + e.toDisplayString(P[l.id]?.state || t.$t("未知")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(P[l.id]?.humanHint || P[l.id]?.human_hint || P[l.id]?.detail || P[l.id]?.errorMessage || P[l.id]?.error_message || t.$t("请以已打开浏览器中的真实页面为准。")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", rc, [
                    e.createElementVNode("button", {
                      class: "mini-button",
                      disabled: !!K[l.id] || zn(P[l.id]),
                      onClick: (r) => ba(l.id)
                    }, e.toDisplayString(t.$t("探测一次")), 9, ic),
                    e.createElementVNode("button", {
                      class: "mini-button warn",
                      disabled: !!K[l.id] || zn(P[l.id]),
                      onClick: (r) => Ea(l.id)
                    }, e.toDisplayString(t.$t("取消")), 9, sc)
                  ])
                ])) : e.createCommentVNode("v-if", !0)
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])),
          ut.value ? (e.openBlock(), e.createElementBlock("p", cc, [
            n[96] || (n[96] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(ut.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ])) : e.createCommentVNode("v-if", !0),
        z.value === "insights" ? (e.openBlock(), e.createElementBlock("section", dc, [
          e.createElementVNode("div", uc, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                mc,
                e.toDisplayString(t.$t("只读分析")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(t.$t("指标与跨平台复盘")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "span",
              pc,
              e.toDisplayString(t.$t("findings 由确定性规则计算")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", vc, [
            e.createElementVNode("label", gc, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("开始日期")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": n[25] || (n[25] = (l) => h.since = l),
                  type: "date"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, h.since]
              ])
            ]),
            e.createElementVNode("label", fc, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("结束日期")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": n[26] || (n[26] = (l) => h.until = l),
                  type: "date"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, h.until]
              ])
            ]),
            e.createElementVNode("label", yc, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("指标平台")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": n[27] || (n[27] = (l) => h.insightsPlatform = l)
                },
                [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(b), (l) => (e.openBlock(), e.createElementBlock("option", {
                      key: l.id,
                      value: l.id
                    }, e.toDisplayString(t.$t(l.label)), 9, hc))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, h.insightsPlatform]
              ])
            ]),
            e.createElementVNode("label", kc, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("指标模式")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": n[28] || (n[28] = (l) => h.insightsMode = l)
                },
                [...n[97] || (n[97] = [
                  e.createElementVNode(
                    "option",
                    { value: "api" },
                    "API",
                    -1
                    /* CACHED */
                  ),
                  e.createElementVNode(
                    "option",
                    { value: "web" },
                    "Web",
                    -1
                    /* CACHED */
                  )
                ])],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, h.insightsMode]
              ])
            ])
          ]),
          e.createElementVNode("div", bc, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("复盘平台")),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(b), (l) => (e.openBlock(), e.createElementBlock("label", {
                key: l.id
              }, [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": n[29] || (n[29] = (r) => h.platforms = r),
                  type: "checkbox",
                  value: l.id
                }, null, 8, Ec), [
                  [e.vModelCheckbox, h.platforms]
                ]),
                e.createTextVNode(
                  " " + e.toDisplayString(t.$t(l.label)),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            e.createElementVNode("label", null, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": n[30] || (n[30] = (l) => h.comparePrevious = l),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, h.comparePrevious]
              ]),
              e.createTextVNode(
                " " + e.toDisplayString(t.$t("对比紧邻上一周期")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("div", Nc, [
            e.createElementVNode("button", {
              class: "button ghost",
              disabled: Wt.value || !Zt.value,
              onClick: Na
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(Wt.value ? "ri-loader-4-line spin" : "ri-line-chart-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                " " + e.toDisplayString(t.$t("拉取单平台指标")),
                1
                /* TEXT */
              )
            ], 8, Vc),
            e.createElementVNode("button", {
              class: "button primary",
              disabled: Ft.value || !Zt.value || !h.platforms.length,
              onClick: Va
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(Ft.value ? "ri-loader-4-line spin" : "ri-file-chart-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                " " + e.toDisplayString(t.$t("生成跨平台复盘")),
                1
                /* TEXT */
              )
            ], 8, Sc)
          ]),
          e.createElementVNode("div", wc, [
            e.createElementVNode("div", _c, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(t.$t("平台每日指标")) + " · " + e.toDisplayString(h.since) + " — " + e.toDisplayString(h.until),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(t.$t("点击 / 转化（柱）· 花费（线）")),
                1
                /* TEXT */
              )
            ]),
            Mn.value ? (e.openBlock(), e.createBlock(e.unref(Pa), {
              key: 0,
              class: "ads-chart",
              option: Mn.value,
              autoresize: ""
            }, null, 8, ["option"])) : (e.openBlock(), e.createElementBlock(
              "p",
              Dc,
              e.toDisplayString(t.$t("暂无可绘制的每日指标，请先读取平台数据；区间汇总不会转换为日趋势。")),
              1
              /* TEXT */
            ))
          ]),
          fe.value ? (e.openBlock(), e.createElementBlock("div", Ac, [
            e.createElementVNode("div", $c, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(t.$t("指标真实响应")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(Sa(fe.value))
                },
                e.toDisplayString(wa(fe.value)),
                3
                /* TEXT, CLASS */
              )
            ]),
            e.createElementVNode(
              "pre",
              null,
              e.toDisplayString(Jn(fe.value)),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          ye.value ? (e.openBlock(), e.createElementBlock("div", Cc, [
            e.createElementVNode("div", Bc, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(pa.value, (l) => (e.openBlock(), e.createElementBlock("article", {
                  key: l.key
                }, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.$t(l.label)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(l.value),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", Tc, [
              e.createElementVNode("div", Lc, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(t.$t("各平台每日花费与转化")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "p",
                Pc,
                e.toDisplayString(t.$t("每日复盘明细待确认：现有报告仅返回平台区间汇总，暂不绘制趋势。")),
                1
                /* TEXT */
              )
            ]),
            Bn.value.length ? (e.openBlock(), e.createElementBlock("div", Ic, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(Bn.value, (l) => (e.openBlock(), e.createElementBlock("article", {
                  key: String(l.platform)
                }, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(ie(String(l.platform))),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.$t("花费")) + " " + e.toDisplayString(Lt(l.spend)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.$t("点击")) + " " + e.toDisplayString(Lt(l.clicks)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.$t("转化")) + " " + e.toDisplayString(Lt(l.conversions)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "em",
                    null,
                    e.toDisplayString(t.$t(String(l.verdict || "未给出结论"))),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0),
            Tn.value.length ? (e.openBlock(), e.createElementBlock("div", Mc, [
              e.createElementVNode(
                "h3",
                null,
                e.toDisplayString(t.$t("确定性发现")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(Tn.value, (l, r) => (e.openBlock(), e.createElementBlock("article", {
                  key: `${l.code || "finding"}-${r}`
                }, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(`severity-${l.severity || "info"}`)
                    },
                    e.toDisplayString(l.severity || "info"),
                    3
                    /* TEXT, CLASS */
                  ),
                  e.createElementVNode("div", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(l.code || t.$t("发现")) + " · " + e.toDisplayString(ie(String(l.platform || ""))),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "p",
                      null,
                      e.toDisplayString(l.detail || "—"),
                      1
                      /* TEXT */
                    ),
                    l.suggestion ? (e.openBlock(), e.createElementBlock(
                      "small",
                      Oc,
                      e.toDisplayString(l.suggestion),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0),
            Ln.value ? (e.openBlock(), e.createElementBlock("p", Wc, [
              n[98] || (n[98] = e.createElementVNode(
                "i",
                { class: "ri-sticky-note-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(Ln.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", Fc, [
              e.createElementVNode("div", Rc, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(t.$t("复盘完整响应")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "pre",
                null,
                e.toDisplayString(Jn(ye.value)),
                1
                /* TEXT */
              )
            ])
          ])) : e.createCommentVNode("v-if", !0)
        ])) : e.createCommentVNode("v-if", !0),
        z.value === "audit" ? (e.openBlock(), e.createElementBlock("section", Uc, [
          e.createElementVNode("div", zc, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                Kc,
                e.toDisplayString(t.$t("可追溯性")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(t.$t("广告操作审计")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("button", {
              class: "button ghost compact",
              disabled: Je.value,
              onClick: el
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(Je.value ? "ri-loader-4-line spin" : "ri-refresh-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(t.$t("刷新")),
                1
                /* TEXT */
              )
            ], 8, jc)
          ]),
          e.createElementVNode("div", Gc, [
            e.createElementVNode("label", Hc, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("平台")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": n[31] || (n[31] = (l) => qe.platform = l)
                },
                [
                  e.createElementVNode(
                    "option",
                    Jc,
                    e.toDisplayString(t.$t("全部平台")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(b), (l) => (e.openBlock(), e.createElementBlock("option", {
                      key: l.id,
                      value: l.id
                    }, e.toDisplayString(t.$t(l.label)), 9, qc))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, qe.platform]
              ])
            ]),
            e.createElementVNode("label", Yc, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("租户标识")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": n[32] || (n[32] = (l) => qe.tenantId = l),
                placeholder: t.$t("可选")
              }, null, 8, Zc), [
                [
                  e.vModelText,
                  qe.tenantId,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("button", {
              class: "button ghost compact",
              disabled: Je.value,
              onClick: el
            }, e.toDisplayString(t.$t("应用筛选")), 9, Xc)
          ]),
          Je.value ? (e.openBlock(), e.createElementBlock("div", Qc, [
            n[99] || (n[99] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("读取审计流水…")),
              1
              /* TEXT */
            )
          ])) : Rt.value ? (e.openBlock(), e.createElementBlock("p", xc, [
            n[100] || (n[100] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(Rt.value),
              1
              /* TEXT */
            )
          ])) : he.value.length ? (e.openBlock(), e.createElementBlock("div", td, [
            e.createElementVNode("table", ld, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(t.$t("时间")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(t.$t("平台 / 模式")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(t.$t("动作")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(t.$t("租户")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(t.$t("结果")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(t.$t("预算")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(mo.value, (l, r) => (e.openBlock(), e.createElementBlock("tr", {
                    key: `${l.ts || l.iso || r}-${(Z.value - 1) * rt + r}`
                  }, [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString($a(l)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(ie(String(l.platform || ""))),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(l.mode || "—"),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(l.action || "—"),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(l.tenantId || l.tenant_id || "—"),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["status-pill", l.success ? "ready" : "error"])
                        },
                        e.toDisplayString(l.success ? t.$t("成功") : t.$t("失败")),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(l.status || l.errorCode || l.error_code || "—"),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString((l.budgetUsd ?? l.budget_usd) == null ? "—" : `${Lt(l.budgetUsd ?? l.budget_usd)} USD`),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            e.createElementVNode("nav", {
              class: "audit-pagination",
              "aria-label": t.$t("广告审计分页")
            }, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("共 {p0} 条", { p0: he.value.length })) + " · " + e.toDisplayString(vo.value) + "–" + e.toDisplayString(go.value) + " · " + e.toDisplayString(t.$t("每页 10 条")),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", null, [
                e.createElementVNode("button", {
                  type: "button",
                  disabled: Z.value === 1,
                  onClick: n[33] || (n[33] = (l) => Ll(Z.value - 1))
                }, [
                  n[101] || (n[101] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-left-s-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("上一页")),
                    1
                    /* TEXT */
                  )
                ], 8, od),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(po.value, (l) => (e.openBlock(), e.createElementBlock("button", {
                    key: l,
                    type: "button",
                    class: e.normalizeClass({ active: Z.value === l }),
                    "aria-current": Z.value === l ? "page" : void 0,
                    onClick: (r) => Ll(l)
                  }, e.toDisplayString(l), 11, ad))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  disabled: Z.value === il.value,
                  onClick: n[34] || (n[34] = (l) => Ll(Z.value + 1))
                }, [
                  e.createTextVNode(
                    e.toDisplayString(t.$t("下一页")),
                    1
                    /* TEXT */
                  ),
                  n[102] || (n[102] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-s-line" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ], 8, rd)
              ])
            ], 8, nd)
          ])) : (e.openBlock(), e.createElementBlock(
            "div",
            ed,
            e.toDisplayString(t.$t("当前筛选下没有审计记录。")),
            1
            /* TEXT */
          ))
        ])) : e.createCommentVNode("v-if", !0),
        e.createCommentVNode(" ══ 定时自动化 Tab ══ "),
        z.value === "automation" ? (e.openBlock(), e.createElementBlock("section", id, [
          e.createElementVNode("div", sd, [
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "span",
                cd,
                e.toDisplayString(t.$t("Scheduling")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(t.$t("定时自动化")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("button", {
              class: "button primary compact",
              disabled: Dt.value,
              onClick: Zo
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(Dt.value ? "ri-loader-4-line spin" : "ri-save-3-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(t.$t("保存定时任务")),
                1
                /* TEXT */
              )
            ], 8, dd)
          ]),
          e.createElementVNode(
            "p",
            ud,
            e.toDisplayString(t.$t("把复盘、巡检等环节写成真实定时任务（保存后在 左侧菜单 → 定时任务 也可统一管理），让投放链路按节奏自动运转；预算变更始终保留人工确认。")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", md, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(Yt, (l) => e.createElementVNode("article", {
                key: l.key,
                class: "cron-item"
              }, [
                e.createElementVNode("label", pd, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (r) => _t[l.key] = r,
                    type: "checkbox",
                    disabled: l.key === "video" && !Fe.value.trim()
                  }, null, 8, vd), [
                    [e.vModelCheckbox, _t[l.key]]
                  ]),
                  e.createElementVNode("span", null, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(t.$t(l.name)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(t.$t(l.desc)),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createCommentVNode(" 人话排期：频率 + 时间/星期/间隔 下拉；底层自动生成 cron，不让用户写表达式 "),
                e.createElementVNode("div", gd, [
                  e.createElementVNode("label", null, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("执行频率")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode("select", {
                      "onUpdate:modelValue": (r) => F[l.key].freq = r
                    }, [
                      e.createElementVNode(
                        "option",
                        yd,
                        e.toDisplayString(t.$t("每天")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        hd,
                        e.toDisplayString(t.$t("每周")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        kd,
                        e.toDisplayString(t.$t("每隔几小时")),
                        1
                        /* TEXT */
                      )
                    ], 8, fd), [
                      [e.vModelSelect, F[l.key].freq]
                    ])
                  ]),
                  F[l.key].freq === "weekly" ? (e.openBlock(), e.createElementBlock("label", bd, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("星期")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode("select", {
                      "onUpdate:modelValue": (r) => F[l.key].weekday = r
                    }, [
                      (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(Ho, (r) => e.createElementVNode("option", {
                          key: r.value,
                          value: r.value
                        }, e.toDisplayString(t.$t(r.label)), 9, Nd)),
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ], 8, Ed), [
                      [
                        e.vModelSelect,
                        F[l.key].weekday,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])) : e.createCommentVNode("v-if", !0),
                  F[l.key].freq === "hours" ? (e.openBlock(), e.createElementBlock("label", Vd, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("间隔")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode("select", {
                      "onUpdate:modelValue": (r) => F[l.key].everyHours = r
                    }, [
                      (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(Go, (r) => e.createElementVNode("option", {
                          key: r,
                          value: r
                        }, e.toDisplayString(t.$t("{p0} 小时", { p0: r })), 9, wd)),
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ], 8, Sd), [
                      [
                        e.vModelSelect,
                        F[l.key].everyHours,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])) : e.createCommentVNode("v-if", !0),
                  F[l.key].freq !== "hours" ? (e.openBlock(), e.createElementBlock("label", _d, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("时间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("span", Dd, [
                      e.withDirectives(e.createElementVNode("select", {
                        "onUpdate:modelValue": (r) => F[l.key].hour = r
                      }, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(e.unref(Ko), (r) => (e.openBlock(), e.createElementBlock("option", {
                            key: r,
                            value: r
                          }, e.toDisplayString(kn(r)), 9, $d))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ], 8, Ad), [
                        [
                          e.vModelSelect,
                          F[l.key].hour,
                          void 0,
                          { number: !0 }
                        ]
                      ]),
                      n[103] || (n[103] = e.createElementVNode(
                        "em",
                        null,
                        ":",
                        -1
                        /* CACHED */
                      )),
                      e.withDirectives(e.createElementVNode("select", {
                        "onUpdate:modelValue": (r) => F[l.key].minute = r
                      }, [
                        (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(jo, (r) => e.createElementVNode("option", {
                            key: r,
                            value: r
                          }, e.toDisplayString(kn(r)), 9, Bd)),
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ], 8, Cd), [
                        [
                          e.vModelSelect,
                          F[l.key].minute,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])
                  ])) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode(
                    "small",
                    Td,
                    e.toDisplayString(qo(hn(F[l.key]))),
                    1
                    /* TEXT */
                  )
                ]),
                l.key === "video" ? (e.openBlock(), e.createElementBlock("div", Ld, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.$t("素材库（必选）")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", Pd, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": n[35] || (n[35] = (r) => Fe.value = r),
                      type: "text",
                      placeholder: t.$t("包含图片 / 视频素材的本地文件夹绝对路径")
                    }, null, 8, Id), [
                      [
                        e.vModelText,
                        Fe.value,
                        void 0,
                        { trim: !0 }
                      ]
                    ]),
                    e.createElementVNode("button", {
                      type: "button",
                      onClick: zo
                    }, [...n[104] || (n[104] = [
                      e.createElementVNode(
                        "i",
                        { class: "ri-folder-open-line" },
                        null,
                        -1
                        /* CACHED */
                      )
                    ])])
                  ])
                ])) : e.createCommentVNode("v-if", !0)
              ])),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          At.value ? (e.openBlock(), e.createElementBlock("p", Md, [
            n[105] || (n[105] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(At.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ])) : e.createCommentVNode("v-if", !0),
        e.createCommentVNode(" ══ 弹出层：媒体模型配置（视频 / TTS），不跳转设置页 ══ "),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          jt.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            role: "dialog",
            class: "credential-backdrop",
            onClick: e.withModifiers(yl, ["self"])
          }, [
            e.createElementVNode("section", {
              class: "credential-dialog",
              role: "dialog",
              "aria-modal": "true",
              "aria-label": t.$t("配置制作引擎")
            }, [
              e.createElementVNode("header", null, [
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    Wd,
                    e.toDisplayString(re.value === "video" ? t.$t("Video Engine") : t.$t("Voice Engine")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(re.value === "video" ? t.$t("视频生成模型配置") : t.$t("TTS 配音配置")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(re.value === "video" ? t.$t("选择接入引擎并填入密钥；保存后立即设为默认视频生成引擎。") : t.$t("配置旁白使用的 TTS 引擎；保存后立即设为默认配音引擎。")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  "aria-label": t.$t("关闭"),
                  onClick: yl
                }, [...n[106] || (n[106] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-close-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, Fd)
              ]),
              e.createElementVNode(
                "form",
                {
                  onSubmit: e.withModifiers(Do, ["prevent"])
                },
                [
                  e.createElementVNode("div", Rd, [
                    e.createElementVNode("label", null, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("接入引擎")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "select",
                        {
                          "onUpdate:modelValue": n[36] || (n[36] = (l) => Ee.value = l)
                        },
                        [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(xl.value, (l) => (e.openBlock(), e.createElementBlock("option", {
                              key: l.id,
                              value: l.id
                            }, e.toDisplayString(l.label) + e.toDisplayString(l.configured ? ` · ${t.$t("已接入")}` : ""), 9, Ud))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ],
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelSelect, Ee.value]
                      ])
                    ]),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(gl.value, (l) => (e.openBlock(), e.createElementBlock("label", {
                        key: l.env
                      }, [
                        e.createElementVNode("span", null, [
                          e.createTextVNode(
                            e.toDisplayString(l.label) + " ",
                            1
                            /* TEXT */
                          ),
                          l.required ? (e.openBlock(), e.createElementBlock(
                            "em",
                            zd,
                            e.toDisplayString(t.$t("必填")),
                            1
                            /* TEXT */
                          )) : l.set ? (e.openBlock(), e.createElementBlock(
                            "small",
                            Kd,
                            e.toDisplayString(t.$t("已保存，留空即不覆盖")),
                            1
                            /* TEXT */
                          )) : l.placeholder ? (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 2 },
                            [
                              e.createCommentVNode(` 有官方默认值的选填项（如 ARK Base URL）必须说清「不用填」，
                       否则灰色 placeholder 看着和空的必填框一模一样，用户会以为漏填了 `),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(t.$t("可选，留空用默认值")),
                                1
                                /* TEXT */
                              )
                            ],
                            2112
                            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                          )) : (e.openBlock(), e.createElementBlock(
                            "small",
                            jd,
                            e.toDisplayString(t.$t("可选")),
                            1
                            /* TEXT */
                          ))
                        ]),
                        e.createElementVNode(
                          "div",
                          {
                            class: e.normalizeClass(["credential-input", { secret: l.secret }])
                          },
                          [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (r) => Me[l.env] = r,
                              type: l.secret && !Oe[l.env] ? "password" : "text",
                              placeholder: l.set ? l.masked || "••••••" : l.placeholder || "",
                              autocomplete: "off"
                            }, null, 8, Gd), [
                              [
                                e.vModelDynamic,
                                Me[l.env],
                                void 0,
                                { trim: !0 }
                              ]
                            ]),
                            l.secret ? (e.openBlock(), e.createElementBlock("button", {
                              key: 0,
                              type: "button",
                              "aria-label": Oe[l.env] ? t.$t("隐藏") : t.$t("显示"),
                              onClick: (r) => Oe[l.env] = !Oe[l.env]
                            }, [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(Oe[l.env] ? "ri-eye-off-line" : "ri-eye-line")
                                },
                                null,
                                2
                                /* CLASS */
                              )
                            ], 8, Hd)) : e.createCommentVNode("v-if", !0)
                          ],
                          2
                          /* CLASS */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode("label", null, [
                      e.createElementVNode("span", null, [
                        e.createTextVNode(
                          e.toDisplayString(t.$t("模型名称")) + " ",
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("可选，留空用引擎默认")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", Jd, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": n[37] || (n[37] = (l) => bt.value = l),
                          type: "text",
                          placeholder: _o.value,
                          autocomplete: "off"
                        }, null, 8, qd), [
                          [
                            e.vModelText,
                            bt.value,
                            void 0,
                            { trim: !0 }
                          ]
                        ])
                      ])
                    ])
                  ]),
                  Qe.value ? (e.openBlock(), e.createElementBlock("p", Yd, [
                    n[107] || (n[107] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(Qe.value),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("footer", null, [
                    e.createElementVNode("button", {
                      class: "button ghost",
                      type: "button",
                      disabled: We.value,
                      onClick: yl
                    }, e.toDisplayString(t.$t("取消")), 9, Zd),
                    e.createElementVNode("button", {
                      class: "button primary",
                      type: "submit",
                      disabled: We.value
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(We.value ? "ri-loader-4-line spin" : "ri-save-3-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        " " + e.toDisplayString(We.value ? t.$t("正在保存…") : t.$t("保存并设为默认")),
                        1
                        /* TEXT */
                      )
                    ], 8, Xd)
                  ])
                ],
                32
                /* NEED_HYDRATION */
              )
            ], 8, Od)
          ])) : e.createCommentVNode("v-if", !0)
        ])),
        e.createCommentVNode(" ══ 弹出层：生成广告视频提示词（只服务动态视频生成）══ "),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          tt.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            role: "dialog",
            class: "credential-backdrop",
            onClick: n[42] || (n[42] = e.withModifiers((l) => tt.value = !1, ["self"]))
          }, [
            e.createElementVNode("section", {
              class: "credential-dialog",
              role: "dialog",
              "aria-modal": "true",
              "aria-label": t.$t("生成广告视频提示词")
            }, [
              e.createElementVNode("header", null, [
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    xd,
                    e.toDisplayString(t.$t("Ad Prompt")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(t.$t("生成广告视频提示词")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("先把分镜与运镜提示写出来，可逐条修改；第 5 步执行投放时按这份提示词调用视频模型出片。")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  "aria-label": t.$t("关闭"),
                  onClick: n[38] || (n[38] = (l) => tt.value = !1)
                }, [...n[108] || (n[108] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-close-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, eu)
              ]),
              e.createElementVNode(
                "form",
                {
                  onSubmit: e.withModifiers(Bo, ["prevent"])
                },
                [
                  e.createElementVNode("div", tu, [
                    e.createElementVNode("label", null, [
                      e.createElementVNode("span", null, [
                        e.createTextVNode(
                          e.toDisplayString(t.$t("素材文件夹")) + " ",
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "em",
                          null,
                          e.toDisplayString(t.$t("必填")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", lu, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": n[39] || (n[39] = (l) => G.value = l),
                          type: "text",
                          placeholder: t.$t("包含图片 / 视频素材的本地文件夹绝对路径")
                        }, null, 8, nu), [
                          [
                            e.vModelText,
                            G.value,
                            void 0,
                            { trim: !0 }
                          ]
                        ]),
                        e.createElementVNode("button", {
                          type: "button",
                          onClick: dn
                        }, [...n[109] || (n[109] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-folder-open-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])])
                      ])
                    ]),
                    e.createElementVNode("label", ou, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("投放要求 / 创意简报")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "textarea",
                        {
                          "onUpdate:modelValue": n[40] || (n[40] = (l) => Se.value = l),
                          rows: "4"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [
                          e.vModelText,
                          Se.value,
                          void 0,
                          { trim: !0 }
                        ]
                      ])
                    ])
                  ]),
                  e.createElementVNode("div", au, [
                    e.createElementVNode("button", {
                      class: "button ghost",
                      type: "button",
                      disabled: se.value || !G.value,
                      onClick: Co
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(se.value ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        " " + e.toDisplayString(se.value ? t.$t("正在生成提示词…") : I.value.length ? t.$t("重新生成提示词") : t.$t("生成提示词")),
                        1
                        /* TEXT */
                      )
                    ], 8, ru),
                    Ve.value ? (e.openBlock(), e.createElementBlock(
                      "small",
                      iu,
                      e.toDisplayString(Ve.value),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  I.value.length ? (e.openBlock(), e.createElementBlock("ol", su, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(I.value, (l, r) => (e.openBlock(), e.createElementBlock("li", {
                        key: l.id
                      }, [
                        e.createElementVNode("header", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(t.$t("镜头 {p0}", { p0: r + 1 })),
                            1
                            /* TEXT */
                          ),
                          e.withDirectives(e.createElementVNode("select", {
                            "onUpdate:modelValue": (i) => l.referenceImage = i,
                            class: "scene-ref",
                            title: t.$t("首帧参考图")
                          }, [
                            e.createElementVNode(
                              "option",
                              du,
                              e.toDisplayString(t.$t("不用参考图（纯文生视频）")),
                              1
                              /* TEXT */
                            ),
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(ln.value, (i) => (e.openBlock(), e.createElementBlock("option", {
                                key: i,
                                value: i
                              }, e.toDisplayString(t.$t("首帧：{p0}", { p0: i.split(/[\\/]/).pop() })), 9, uu))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ], 8, cu), [
                            [e.vModelSelect, l.referenceImage]
                          ]),
                          e.createElementVNode("em", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (i) => l.duration = i,
                              type: "number",
                              min: "2",
                              max: "10"
                            }, null, 8, mu), [
                              [
                                e.vModelText,
                                l.duration,
                                void 0,
                                { number: !0 }
                              ]
                            ]),
                            e.createTextVNode(
                              e.toDisplayString(t.$t("秒")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("label", null, [
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(t.$t("运镜提示（交给视频模型）")),
                            1
                            /* TEXT */
                          ),
                          e.withDirectives(e.createElementVNode("textarea", {
                            "onUpdate:modelValue": (i) => l.prompt = i,
                            rows: "2"
                          }, null, 8, pu), [
                            [
                              e.vModelText,
                              l.prompt,
                              void 0,
                              { trim: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("label", null, [
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(t.$t("字幕 / 旁白文案")),
                            1
                            /* TEXT */
                          ),
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (i) => l.caption = i,
                            type: "text"
                          }, null, 8, vu), [
                            [
                              e.vModelText,
                              l.caption,
                              void 0,
                              { trim: !0 }
                            ]
                          ])
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (e.openBlock(), e.createElementBlock("p", gu, [
                    n[110] || (n[110] = e.createElementVNode(
                      "i",
                      { class: "ri-information-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("还没有提示词。选好素材文件夹后点「生成提示词」，会按素材图片顺序写出分镜与运镜提示。")),
                      1
                      /* TEXT */
                    )
                  ])),
                  pl.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", fu, [
                    n[111] || (n[111] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("尚未配置视频生成模型，无法开始生成；请先在「制作引擎配置」中完成接入。")),
                      1
                      /* TEXT */
                    )
                  ])),
                  e.createElementVNode("footer", null, [
                    e.createElementVNode(
                      "button",
                      {
                        class: "button ghost",
                        type: "button",
                        onClick: n[41] || (n[41] = (l) => tt.value = !1)
                      },
                      e.toDisplayString(t.$t("取消")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("button", {
                      class: "button primary",
                      type: "submit",
                      disabled: !I.value.length
                    }, [
                      n[112] || (n[112] = e.createElementVNode(
                        "i",
                        { class: "ri-save-3-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("保存提示词")),
                        1
                        /* TEXT */
                      )
                    ], 8, yu)
                  ])
                ],
                32
                /* NEED_HYDRATION */
              )
            ], 8, Qd)
          ])) : e.createCommentVNode("v-if", !0)
        ])),
        e.createCommentVNode(" ══ 弹出层：历史成片预览 ══ "),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          Gt.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            role: "dialog",
            class: "credential-backdrop",
            onClick: n[45] || (n[45] = e.withModifiers((l) => Gt.value = !1, ["self"]))
          }, [
            e.createElementVNode("section", {
              class: "credential-dialog video-preview-dialog",
              role: "dialog",
              "aria-modal": "true",
              "aria-label": t.$t("广告成片预览")
            }, [
              e.createElementVNode("header", null, [
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    ku,
                    e.toDisplayString(t.$t("Preview")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(t.$t("广告成片预览")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    bu,
                    e.toDisplayString(kl.value),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  "aria-label": t.$t("关闭"),
                  onClick: n[43] || (n[43] = (l) => Gt.value = !1)
                }, [...n[113] || (n[113] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-close-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, Eu)
              ]),
              e.createElementVNode("div", Nu, [
                hl.value ? (e.openBlock(), e.createElementBlock("i", Vu)) : Nt.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    e.createCommentVNode(" @error：协议 404 / 解码失败时清 src 亮出失败态，不让用户对着黑屏（与确认卡预览同规则） "),
                    e.createElementVNode("video", {
                      src: Nt.value,
                      controls: "",
                      autoplay: "",
                      onError: n[44] || (n[44] = (l) => Nt.value = "")
                    }, null, 40, Su)
                  ],
                  2112
                  /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                )) : (e.openBlock(), e.createElementBlock(
                  "p",
                  wu,
                  e.toDisplayString(t.$t("无法读取成片")),
                  1
                  /* TEXT */
                ))
              ])
            ], 8, hu)
          ])) : e.createCommentVNode("v-if", !0)
        ])),
        (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
          pt.value ? (e.openBlock(), e.createElementBlock("div", {
            key: 0,
            role: "dialog",
            class: "credential-backdrop",
            onClick: e.withModifiers(Bl, ["self"])
          }, [
            e.createElementVNode("section", {
              class: "credential-dialog",
              role: "dialog",
              "aria-modal": "true",
              "aria-label": t.$t("配置 API 凭据")
            }, [
              e.createElementVNode("header", null, [
                e.createElementVNode("div", null, [
                  e.createElementVNode(
                    "span",
                    Du,
                    e.toDisplayString(t.$t("API Connection")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "h2",
                    null,
                    e.toDisplayString(Qo.value) + " · " + e.toDisplayString(t.$t("API 凭据配置")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    null,
                    e.toDisplayString(t.$t("只保存本次填写的字段；已经保存的 Token 不会回显，也不会因留空而被覆盖。")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  "aria-label": t.$t("关闭"),
                  onClick: Bl
                }, [...n[114] || (n[114] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-close-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, Au)
              ]),
              Ge.value === "instagram" ? (e.openBlock(), e.createElementBlock("p", $u, [
                n[115] || (n[115] = e.createElementVNode(
                  "i",
                  { class: "ri-information-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  " " + e.toDisplayString(t.$t("Instagram API 共用 Facebook 的 Meta System User Token；此处保存后会同时更新共享 Meta 凭据。")),
                  1
                  /* TEXT */
                )
              ])) : Ge.value === "youtube" ? (e.openBlock(), e.createElementBlock("p", Cu, [
                n[116] || (n[116] = e.createElementVNode(
                  "i",
                  { class: "ri-information-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  " " + e.toDisplayString(t.$t("YouTube 此处管理自然内容上传与数据；付费 Video Campaign 由 Google Ads 执行。")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode(
                "form",
                {
                  onSubmit: e.withModifiers(fa, ["prevent"])
                },
                [
                  e.createElementVNode("div", Bu, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(bn.value, (l) => (e.openBlock(), e.createElementBlock("label", {
                        key: l.key
                      }, [
                        e.createElementVNode("span", null, [
                          e.createTextVNode(
                            e.toDisplayString(t.$t(l.label)) + " ",
                            1
                            /* TEXT */
                          ),
                          l.required ? (e.openBlock(), e.createElementBlock(
                            "em",
                            Tu,
                            e.toDisplayString(t.$t("必填")),
                            1
                            /* TEXT */
                          )) : (e.openBlock(), e.createElementBlock(
                            "small",
                            Lu,
                            e.toDisplayString(t.$t("可选")),
                            1
                            /* TEXT */
                          ))
                        ]),
                        e.createElementVNode(
                          "div",
                          {
                            class: e.normalizeClass(["credential-input", { secret: l.secret }])
                          },
                          [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (r) => ge[l.key] = r,
                              type: l.secret && !Ae[l.key] ? "password" : "text",
                              placeholder: l.placeholder,
                              autocomplete: "off"
                            }, null, 8, Pu), [
                              [
                                e.vModelDynamic,
                                ge[l.key],
                                void 0,
                                { trim: !0 }
                              ]
                            ]),
                            l.secret ? (e.openBlock(), e.createElementBlock("button", {
                              key: 0,
                              type: "button",
                              "aria-label": Ae[l.key] ? t.$t("隐藏") : t.$t("显示"),
                              onClick: (r) => Ae[l.key] = !Ae[l.key]
                            }, [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(Ae[l.key] ? "ri-eye-off-line" : "ri-eye-line")
                                },
                                null,
                                2
                                /* CLASS */
                              )
                            ], 8, Iu)) : e.createCommentVNode("v-if", !0)
                          ],
                          2
                          /* CLASS */
                        ),
                        l.hint ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Mu,
                          e.toDisplayString(t.$t(l.hint)),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]),
                  He.value ? (e.openBlock(), e.createElementBlock("p", Ou, [
                    n[117] || (n[117] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(He.value),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("footer", null, [
                    e.createElementVNode("button", {
                      class: "button ghost",
                      type: "button",
                      disabled: $e.value,
                      onClick: Bl
                    }, e.toDisplayString(t.$t("取消")), 9, Wu),
                    e.createElementVNode("button", {
                      class: "button primary",
                      type: "submit",
                      disabled: $e.value || !En.value
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass($e.value ? "ri-loader-4-line spin" : "ri-save-3-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        " " + e.toDisplayString($e.value ? t.$t("正在保存…") : t.$t("保存并切换到 API")),
                        1
                        /* TEXT */
                      )
                    ], 8, Fu)
                  ])
                ],
                32
                /* NEED_HYDRATION */
              )
            ], 8, _u)
          ])) : e.createCommentVNode("v-if", !0)
        ]))
      ], 8, Fa);
    };
  }
}), Uu = (O, je) => {
  const H = O.__vccOpts || O;
  for (const [b, g] of je)
    H[b] = g;
  return H;
}, zu = /* @__PURE__ */ Uu(Ru, [["__scopeId", "data-v-4086a892"]]);
export {
  zu as default
};
