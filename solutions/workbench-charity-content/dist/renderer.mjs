const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const Et = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!Et) throw new Error("宿主模块未就绪：npm:vue-router");
Et.default;
const Ie = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!Ie) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
Ie.default;
const o = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!o) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
o.default;
const ge = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts"];
if (!ge) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts");
ge.default;
const tl = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!tl) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Rl = tl.default, ll = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/WorkbenchStepBar.vue"];
if (!ll) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/WorkbenchStepBar.vue");
const Kl = ll.default, Ul = ["aria-label"], jl = { class: "cc-progress__meta" }, xl = {
  key: 1,
  class: "live ok"
}, Hl = {
  key: 2,
  class: "live bad"
}, Gl = { key: 3 }, ql = /* @__PURE__ */ e.defineComponent({
  __name: "CcProgress",
  props: {
    metas: {},
    runtime: {},
    currentKey: {},
    live: {}
  },
  emits: ["jump", "cancel"],
  setup(a, { emit: c }) {
    const r = a, f = c;
    function d(g) {
      return g === "material" ? r.live?.step === "scan" || r.live?.step === "archive" ? r.live.step : "scan" : g === "report" ? r.live?.step === "analyze" || r.live?.step === "report" ? r.live.step : "report" : g === "speech" ? "tts" : "video";
    }
    function h(g) {
      const _ = r.runtime[g];
      if (_.state === "running")
        return F.suspect.value ? o.t("可能已超时") : r.live && r.live.step === d(g) && r.live.msg || o.t("进行中");
      if (_.state === "failed") return _.error || o.t("失败");
      if (_.state === "done") return _.summary || void 0;
    }
    const k = e.computed(() => Math.max(0, r.metas.findIndex((g) => g.key === r.currentKey))), v = e.computed(() => r.metas.filter((g) => r.runtime[g.key].state === "done").length), m = e.computed(() => r.metas.find((g) => r.runtime[g.key].state === "running") || null), s = e.computed(() => !!m.value), L = e.computed(() => m.value ? r.runtime[m.value.key] : null), p = e.computed(() => v.value === r.metas.length), S = e.computed(() => r.metas.findIndex((g) => r.runtime[g.key].state === "failed")), P = e.computed(() => F.suspect.value ? o.t("可能已超时") : r.live?.msg || o.t("进行中")), O = e.computed(() => r.metas.map((g, _) => ({
      id: _ + 1,
      label: g.title,
      done: r.runtime[g.key].state === "done",
      sub: h(g.key)
    }))), V = e.ref(k.value + 1);
    e.watch(k, (g) => {
      V.value = g + 1;
    });
    function C(g) {
      V.value = g;
      const _ = r.metas[g - 1]?.key;
      _ && f("jump", _);
    }
    const F = ge.useStepWatchdog({
      running: () => s.value,
      startedAt: () => L.value?.startedAt,
      estimateMs: () => L.value?.estimateSec ? L.value.estimateSec * 1e3 : null,
      kind: () => L.value?.kind || "generic",
      lastProgressAt: () => L.value?.progressAt
    }), j = e.computed(() => F.elapsedSec.value >= 3 ? ` · ${ge.formatStepDuration(F.elapsedSec.value)}` : "");
    return (g, _) => (e.openBlock(), e.createElementBlock("nav", {
      class: e.normalizeClass(["cc-progress", { busy: s.value, "all-done": p.value }]),
      "aria-label": g.$t("流程进度")
    }, [
      e.createVNode(Kl, {
        steps: O.value,
        "model-value": V.value,
        "onUpdate:modelValue": C
      }, null, 8, ["steps", "model-value"]),
      e.createElementVNode("div", jl, [
        s.value ? (e.openBlock(), e.createElementBlock(
          "em",
          {
            key: 0,
            class: e.normalizeClass(["live", { suspect: e.unref(F).suspect.value }])
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(e.unref(F).suspect.value ? "ri-timer-flash-line" : "ri-loader-4-line cc-spin")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(P.value) + e.toDisplayString(j.value),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )) : p.value ? (e.openBlock(), e.createElementBlock("em", xl, [
          _[1] || (_[1] = e.createElementVNode(
            "i",
            { class: "ri-check-double-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(g.$t("全部完成")),
            1
            /* TEXT */
          )
        ])) : S.value >= 0 ? (e.openBlock(), e.createElementBlock("em", Hl, [
          _[2] || (_[2] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(g.$t("第 {n} 步失败", { n: S.value + 1 })),
            1
            /* TEXT */
          )
        ])) : (e.openBlock(), e.createElementBlock(
          "span",
          Gl,
          e.toDisplayString(g.$t("每一步可单独重跑；点步骤名跳到对应区块")),
          1
          /* TEXT */
        )),
        s.value ? (e.openBlock(), e.createElementBlock("button", {
          key: 4,
          type: "button",
          class: "cc-btn sm ghost",
          onClick: _[0] || (_[0] = (M) => g.$emit("cancel"))
        }, [
          _[3] || (_[3] = e.createElementVNode(
            "i",
            { class: "ri-stop-circle-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(g.$t("停止")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ])
    ], 10, Ul));
  }
}), nl = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/StepRunAlert.vue"];
if (!nl) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/StepRunAlert.vue");
const Kt = nl.default, Jl = ["data-cc-step"], Xl = { class: "cc-step__head" }, Yl = { class: "cc-step__no" }, Ql = {
  key: 0,
  class: "cc-check",
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, Zl = {
  key: 1,
  class: "ri-loader-4-line cc-spin"
}, en = {
  key: 2,
  class: "ri-close-line"
}, tn = { class: "cc-step__title" }, ln = { class: "cc-step__tools" }, nn = {
  key: 2,
  class: "cc-step__summary"
}, an = { class: "cc-step__body" }, Fe = /* @__PURE__ */ e.defineComponent({
  __name: "CcStep",
  props: {
    stepKey: {},
    index: {},
    title: {},
    hint: {},
    icon: {},
    runtime: {},
    isCurrent: { type: Boolean },
    retry: { type: Function },
    cancel: { type: Function },
    retryLabel: {}
  },
  setup(a) {
    const c = a, r = ge.useStepWatchdog({
      running: () => c.runtime.state === "running",
      startedAt: () => c.runtime.startedAt,
      estimateMs: () => c.runtime.estimateSec && c.runtime.estimateSec > 0 ? c.runtime.estimateSec * 1e3 : null,
      kind: () => c.runtime.kind || "generic",
      lastProgressAt: () => c.runtime.progressAt
    }), f = e.computed(() => {
      const k = r.elapsedSec.value;
      if (k < 3) return o.t("进行中");
      const v = o.t("进行中 · {p0}", { p0: ge.formatStepDuration(k) });
      return r.suspect.value ? o.t("{p0} · 可能已超时", { p0: v }) : r.overdue.value ? o.t("{p0} · 比预计慢", { p0: v }) : v;
    }), d = e.ref(!1);
    async function h() {
      if (!(!c.retry || d.value)) {
        d.value = !0;
        try {
          c.runtime.state === "running" && c.cancel && await c.cancel(), await c.retry();
        } finally {
          d.value = !1;
        }
      }
    }
    return (k, v) => (e.openBlock(), e.createElementBlock("article", {
      class: e.normalizeClass(["cc-step", [`is-${a.runtime.state}`, { current: a.isCurrent, "is-suspect": e.unref(r).suspect.value }]]),
      "data-cc-step": a.stepKey
    }, [
      e.createElementVNode("header", Xl, [
        e.createElementVNode("span", Yl, [
          a.runtime.state === "done" ? (e.openBlock(), e.createElementBlock("svg", Ql, [...v[1] || (v[1] = [
            e.createElementVNode(
              "path",
              { d: "M5 12.5l4.5 4.5L19 7.5" },
              null,
              -1
              /* CACHED */
            )
          ])])) : a.runtime.state === "running" ? (e.openBlock(), e.createElementBlock("i", Zl)) : a.runtime.state === "failed" ? (e.openBlock(), e.createElementBlock("i", en)) : (e.openBlock(), e.createElementBlock(
            "i",
            {
              key: 3,
              class: e.normalizeClass(a.icon)
            },
            null,
            2
            /* CLASS */
          ))
        ]),
        e.createElementVNode("div", tn, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(k.$t("第 {n} 步", { n: a.index + 1 })) + " · " + e.toDisplayString(a.title),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(a.hint),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ln, [
          e.renderSlot(k.$slots, "tools")
        ]),
        e.createElementVNode(
          "em",
          {
            class: e.normalizeClass(["cc-step__state", [a.runtime.state, { suspect: e.unref(r).suspect.value }]])
          },
          [
            a.runtime.state === "todo" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createTextVNode(
                  e.toDisplayString(k.$t("待执行")),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : a.runtime.state === "running" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createTextVNode(
                  e.toDisplayString(f.value),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : a.runtime.state === "done" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 2 },
              [
                e.createTextVNode(
                  e.toDisplayString(k.$t("完成")),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 3 },
              [
                e.createTextVNode(
                  e.toDisplayString(k.$t("失败")),
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
        )
      ]),
      e.createCommentVNode(" 失败即终止：红卡 + 真实原因 + 「重新生成」（宿主传了 retry 才有）+ 「查看日志」 "),
      a.runtime.state === "failed" && a.runtime.error ? (e.openBlock(), e.createBlock(Kt, {
        key: 0,
        state: "failed",
        message: a.runtime.error,
        "hide-retry": !a.retry,
        "retry-label": a.retryLabel,
        busy: d.value,
        onRetry: h
      }, null, 8, ["message", "hide-retry", "retry-label", "busy"])) : a.runtime.state === "running" && e.unref(r).suspect.value ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createCommentVNode(" 跑过预计 / 很久没进度：「可能已超时」，可继续等待 / 重新生成（先取消旧任务）/ 查看日志 "),
          e.createVNode(Kt, {
            state: "suspect",
            "elapsed-sec": e.unref(r).elapsedSec.value,
            "estimate-sec": a.runtime.estimateSec || null,
            "since-heartbeat-sec": e.unref(r).sinceHeartbeatSec.value,
            "hide-retry": !a.retry,
            "retry-label": a.retryLabel,
            busy: d.value,
            onRetry: h,
            onKeepWaiting: v[0] || (v[0] = (m) => e.unref(r).keepWaiting())
          }, null, 8, ["elapsed-sec", "estimate-sec", "since-heartbeat-sec", "hide-retry", "retry-label", "busy"])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )) : a.runtime.state === "done" && a.runtime.summary ? (e.openBlock(), e.createElementBlock("p", nn, [
        v[2] || (v[2] = e.createElementVNode(
          "i",
          { class: "ri-checkbox-circle-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(a.runtime.summary),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", an, [
        e.renderSlot(k.$slots, "default")
      ])
    ], 10, Jl));
  }
}), ee = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/charityPrompts.ts"];
if (!ee) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/charityPrompts.ts");
ee.default;
const bt = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!bt) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
bt.default;
const ue = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!ue) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
ue.default;
const $ = ["zh", "en", "ar"], z = { zh: o.contentLangLabel("zh"), en: o.contentLangLabel("en"), ar: o.contentLangLabel("ar") }, $e = { zh: "ltr", en: "ltr", ar: "rtl" }, Ut = {
  material: { kind: "scan" },
  report: { kind: "llm", estimateSec: 120 },
  speech: { kind: "tts", estimateSec: 60 },
  video: { kind: "video", estimateSec: 300 },
  publish: { kind: "publish" }
};
function on() {
  return [
    { key: "event", title: o.t("活动记录与宣传材料"), hint: o.t("上传现场照片与视频，自动整理成报告、海报与宣传短视频"), icon: "ri-camera-3-line" },
    { key: "article", title: o.t("文章转语音"), hint: o.t("文章 / 活动介绍 / 项目说明转三语配音，再出一条宣传短视频"), icon: "ri-mic-2-line" }
  ];
}
function sn() {
  return {
    material: { title: o.t("上传素材"), hint: o.t("拖入照片 / 视频 / PDF，视觉模型自动起草活动档案"), icon: "ri-image-add-line" },
    report: { title: o.t("整理与报告"), hint: o.t("逐图与视频抽帧描述 → 三语报告 PDF + 9:16 海报"), icon: "ri-file-text-line" },
    speech: { title: o.t("文章转语音"), hint: o.t("粘贴文字 / 导入 PDF / 取报告摘要 → 中英阿三语高保真配音"), icon: "ri-mic-line" },
    video: { title: o.t("宣传短视频"), hint: o.t("9:16 竖版：字幕 + 配音 + 配乐，一键成片"), icon: "ri-film-line" },
    publish: { title: o.t("多平台发布"), hint: o.t("选平台与文案 → 内置浏览器登录 → 分平台上传，登录确认后自动发布"), icon: "ri-send-plane-line" }
  };
}
function ht(a = "event") {
  const c = a === "article" ? ["speech", "video", "publish"] : ["material", "report", "speech", "video", "publish"], r = sn();
  return c.map((f) => ({ key: f, ...r[f] }));
}
function jt(a) {
  const c = e.reactive(Object.fromEntries(a.map((p) => [p.key, { state: "todo" }]))), r = e.ref(a[0].key);
  function f(p) {
    const S = (c[p].gen || 0) + 1;
    return Object.assign(c[p], {
      state: "running",
      error: void 0,
      summary: void 0,
      startedAt: Date.now(),
      finishedAt: void 0,
      progressAt: void 0,
      gen: S,
      kind: Ut[p]?.kind,
      estimateSec: Ut[p]?.estimateSec
    }), r.value = p, nt(p), S;
  }
  function d(p, S) {
    return typeof S == "number" && (c[p].gen || 0) !== S;
  }
  function h(p, S, P) {
    if (d(p, P)) return;
    Object.assign(c[p], { state: "done", summary: S, error: void 0, finishedAt: Date.now() });
    const O = a.findIndex((V) => V.key === p);
    a[O + 1] && (r.value = a[O + 1].key);
  }
  function k(p, S, P) {
    d(p, P) || (Object.assign(c[p], { state: "failed", error: De(S), finishedAt: Date.now() }), r.value = p, nt(p));
  }
  function v(p) {
    Object.assign(c[p], { state: "todo", error: void 0, summary: void 0 });
  }
  function m(p) {
    const S = a.findIndex((P) => P.key === p);
    a.slice(S + 1).forEach((P) => {
      c[P.key].state !== "todo" && v(P.key);
    });
  }
  function s() {
    return a.some((p) => c[p.key].state === "running");
  }
  function L(p = Date.now()) {
    for (const S of a) c[S.key].state === "running" && (c[S.key].progressAt = p);
  }
  return { metas: a, runtime: c, currentKey: r, start: f, done: h, fail: k, reset: v, resetAfter: m, isRunning: s, heartbeat: L };
}
async function nt(a) {
  await e.nextTick();
  const c = document.querySelector(`[data-cc-step="${a}"]`);
  if (c)
    try {
      c.scrollIntoView({ behavior: al() ? "auto" : "smooth", block: "start" });
    } catch {
      c.scrollIntoView();
    }
}
function al() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return !1;
  }
}
let yt = null, xt = null;
function b() {
  const a = window.electronAPI?.workbenches?.charityContent;
  if (!a) return a;
  if (yt && xt === a) return yt;
  const c = {};
  for (const r of Object.keys(a)) {
    const f = a[r];
    if (typeof f != "function" || r === "onEvent") {
      c[r] = f;
      continue;
    }
    c[r] = (...d) => f(...d.map((h) => bt.toPlain(h)));
  }
  return yt = c, xt = a, c;
}
function rn() {
  return window.electronAPI?.solution;
}
function De(a) {
  return a ? (a?.message || String(a)).replace(/^Error invoking remote method '[^']+': /, "").replace(/^Error: /, "") : o.t("未知错误");
}
async function cn(a, c) {
  const r = await b()?.saveAs({ path: a, suggestedName: c });
  if (r && r.ok === !1 && !r.cancelled) throw new Error(r.error || o.t("保存失败"));
  return !!r?.ok;
}
function un(a) {
  const c = Array.from(a.dataTransfer?.files || []), r = window.electronAPI?.getPathForFile;
  return c.map((f) => r ? r(f) : f.path || "").filter(Boolean);
}
function dn(a) {
  return a && `⁦${a}⁩`;
}
function Nt(a) {
  return a ? a < 1024 * 1024 ? `${Math.round(a / 1024)} KB` : `${(a / 1024 / 1024).toFixed(1)} MB` : "";
}
function Ce(a) {
  if (!a) return "";
  const c = Math.round(a);
  return `${Math.floor(c / 60)}:${String(c % 60).padStart(2, "0")}`;
}
function Ht(a) {
  const c = a.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/);
  return c ? `${c[1]}-${c[2]}-${c[3]} ${c[4]}:${c[5]}` : a;
}
function ae() {
  return { zh: "", en: "", ar: "" };
}
function mn() {
  return { orgName: ae(), eventName: ae(), date: "", location: ae(), participants: null, donation: "", organizer: ae(), summary: ae(), source: "manual" };
}
function Gt(a) {
  return !!a && !!(a.orgName.zh || a.orgName.en) && !!(a.eventName.zh || a.eventName.en);
}
function pn(a) {
  return a ? { zh: a.zh.summary, en: a.en.summary, ar: a.ar.summary } : {};
}
function ke(a, c) {
  if (!c || !c.ok) throw new Error(c?.error || o.t("{step} 失败", { step: a }));
  return c.fallback && console.info(`[charity-content] ${a}: prebaked fallback used`), c;
}
function ol() {
  return {
    zh: {
      female: [
        { id: "Wise_Woman", label: o.t("知性女声 · Wise Woman") },
        { id: "Calm_Woman", label: o.t("沉静女声 · Calm Woman") }
      ],
      male: [
        { id: "Chinese (Mandarin)_Reliable_Executive", label: o.t("稳重男声 · Reliable Executive") },
        { id: "Elegant_Man", label: o.t("儒雅男声 · Elegant Man") },
        { id: "Deep_Voice_Man", label: o.t("低沉男声 · Deep Voice Man") }
      ]
    },
    en: {
      female: [
        { id: "Calm_Woman", label: "Calm Woman" },
        { id: "Wise_Woman", label: "Wise Woman" },
        { id: "Friendly_Person", label: "Friendly Person" }
      ],
      male: [
        { id: "English_Trustworth_Man", label: "Trustworthy Man" },
        { id: "Patient_Man", label: "Patient Man" }
      ]
    },
    ar: {
      female: [
        { id: "Calm_Woman", label: "صوت أنثوي رزين · Calm Woman" },
        { id: "Wise_Woman", label: "صوت أنثوي هادئ · Wise Woman" }
      ],
      male: [
        { id: "Arabic_FriendlyGuy", label: "صوت رجالي ودود · Arabic Friendly Guy" },
        { id: "Deep_Voice_Man", label: "صوت رجالي عميق · Deep Voice Man" }
      ]
    }
  };
}
function qt(a) {
  const c = ol();
  return { zh: c.zh[a][0].id, en: c.en[a][0].id, ar: c.ar[a][0].id };
}
o.t("晓晓（女）");
const vn = {
  ai: ["upload", "shots", "edit", "music", "compose"],
  clip: ["edit", "music", "compose"]
};
function fn(a, c = 3) {
  switch (a) {
    case "upload":
      return o.t("上传素材");
    case "shots":
      return o.t("动态镜头");
    case "edit":
      return o.t("剪辑串联");
    case "music":
      return o.t("配乐");
    default:
      return c === 3 ? o.t("三语合成") : o.t("多语合成");
  }
}
function kn(a) {
  if (!a?.plan?.length || !a.phase) return null;
  const c = a.plan.indexOf(a.phase);
  if (c < 0) return null;
  const r = a.total > 0 ? Math.min(1, Math.max(0, a.done / a.total)) : 0;
  return Math.min(1, (c + r) / a.plan.length);
}
const gn = { content: "charity-content.contentPrompt", video: "charity-content.videoPrompt" };
function hn(a, c = o.uiContentLang()) {
  return (a === "content" ? ee.DEFAULT_CONTENT_PROMPT : ee.DEFAULT_VIDEO_PROMPT)[c];
}
function Jt() {
  try {
    return typeof sessionStorage > "u" ? null : sessionStorage;
  } catch {
    return null;
  }
}
function Xt(a, c = hn(a)) {
  const r = gn[a];
  let f = c;
  try {
    const h = Jt()?.getItem(r);
    h != null && (f = h.slice(0, ee.CHARITY_PROMPT_MAX));
  } catch {
  }
  const d = e.ref(f);
  return e.watch(d, (h) => {
    try {
      Jt()?.setItem(r, h);
    } catch {
    }
  }), { value: d, defaultValue: c, reset: () => {
    d.value = c;
  } };
}
function Yt(a) {
  const c = (a.match(/[؀-ۿ]/g) || []).length, r = (a.match(new RegExp("\\p{Script=Han}", "gu")) || []).length;
  return c > 0 && c >= r ? "ar" : r > 0 ? "zh" : "en";
}
const yn = {
  class: "cc-langs",
  role: "tablist"
}, Vn = ["aria-selected", "lang", "onClick"], Nn = ["title"], En = ["title"], Vt = /* @__PURE__ */ e.defineComponent({
  __name: "LangChips",
  props: {
    modelValue: {},
    langs: { default: () => $ },
    missing: { default: () => [] },
    done: { default: () => [] }
  },
  emits: ["update:modelValue"],
  setup(a) {
    return (c, r) => (e.openBlock(), e.createElementBlock("div", yn, [
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(a.langs, (f) => (e.openBlock(), e.createElementBlock("button", {
          key: f,
          type: "button",
          role: "tab",
          class: e.normalizeClass(["cc-lang", { active: f === a.modelValue, missing: a.missing?.includes(f), done: a.done?.includes(f) }]),
          "aria-selected": f === a.modelValue,
          lang: f,
          onClick: (d) => c.$emit("update:modelValue", f)
        }, [
          e.createTextVNode(
            e.toDisplayString(e.unref(z)[f]),
            1
            /* TEXT */
          ),
          a.done?.includes(f) ? (e.openBlock(), e.createElementBlock("i", {
            key: 0,
            class: "ri-check-line",
            title: c.$t("已合成")
          }, null, 8, Nn)) : a.missing?.includes(f) ? (e.openBlock(), e.createElementBlock("i", {
            key: 1,
            class: "ri-time-line",
            title: c.$t("尚未生成")
          }, null, 8, En)) : e.createCommentVNode("v-if", !0)
        ], 10, Vn))),
        128
        /* KEYED_FRAGMENT */
      ))
    ]));
  }
}), bn = { class: "cc-actions" }, _n = ["disabled"], Sn = ["disabled"], Bn = {
  key: 1,
  class: "cc-grid__list"
}, $n = { class: "cc-tile__media" }, Dn = ["src", "alt"], Cn = {
  key: 1,
  class: "cc-tile__icon"
}, wn = { class: "cc-tile__badge" }, Tn = ["title", "disabled", "onClick"], Ln = { class: "cc-tile__meta" }, An = ["title"], Pn = {
  key: 0,
  class: "bad"
}, On = { key: 1 }, Mn = { dir: "ltr" }, zn = { dir: "ltr" }, Fn = /* @__PURE__ */ e.defineComponent({
  __name: "MaterialGrid",
  props: {
    items: {},
    disabled: { type: Boolean }
  },
  emits: ["pick-dir", "pick-files", "remove", "dropped"],
  setup(a, { emit: c }) {
    const r = a, f = c, d = e.ref(!1);
    function h() {
      r.disabled || (d.value = !0);
    }
    function k(v) {
      if (d.value = !1, r.disabled) return;
      const m = un(v);
      m.length && f("dropped", m);
    }
    return (v, m) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        class: e.normalizeClass(["cc-grid", { over: d.value, disabled: a.disabled }]),
        onDragover: e.withModifiers(h, ["prevent"]),
        onDragleave: m[6] || (m[6] = e.withModifiers((s) => d.value = !1, ["prevent"])),
        onDrop: e.withModifiers(k, ["prevent"])
      },
      [
        a.items.length ? (e.openBlock(), e.createElementBlock("ul", Bn, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(a.items, (s, L) => (e.openBlock(), e.createElementBlock(
              "li",
              {
                key: s.path,
                class: e.normalizeClass(["cc-tile", [s.kind, { bad: !s.ok }]]),
                style: e.normalizeStyle({ "--i": L })
              },
              [
                e.createElementVNode("div", $n, [
                  s.thumbDataUrl ? (e.openBlock(), e.createElementBlock("img", {
                    key: 0,
                    src: s.thumbDataUrl,
                    alt: s.name,
                    loading: "lazy"
                  }, null, 8, Dn)) : (e.openBlock(), e.createElementBlock("span", Cn, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(s.kind === "video" ? "ri-film-line" : s.kind === "pdf" ? "ri-file-pdf-2-line" : "ri-image-line")
                      },
                      null,
                      2
                      /* CLASS */
                    )
                  ])),
                  e.createElementVNode(
                    "span",
                    wn,
                    e.toDisplayString(s.kind === "video" ? e.unref(Ce)(s.durationSec) || "VIDEO" : s.kind === "pdf" ? "PDF" : "IMG"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "cc-tile__remove",
                    title: v.$t("移除"),
                    disabled: a.disabled,
                    onClick: e.withModifiers((p) => v.$emit("remove", s.path), ["stop"])
                  }, [...m[10] || (m[10] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-close-line" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, Tn)
                ]),
                e.createElementVNode("div", Ln, [
                  e.createElementVNode("span", {
                    class: "name",
                    title: s.path
                  }, e.toDisplayString(s.name), 9, An),
                  s.ok ? (e.openBlock(), e.createElementBlock("small", On, [
                    e.createElementVNode(
                      "bdi",
                      Mn,
                      e.toDisplayString(e.unref(Nt)(s.size)),
                      1
                      /* TEXT */
                    ),
                    s.width ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 0 },
                      [
                        m[11] || (m[11] = e.createTextVNode(
                          " · ",
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode(
                          "bdi",
                          zn,
                          e.toDisplayString(s.width) + "×" + e.toDisplayString(s.height),
                          1
                          /* TEXT */
                        )
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])) : (e.openBlock(), e.createElementBlock(
                    "small",
                    Pn,
                    e.toDisplayString(s.error),
                    1
                    /* TEXT */
                  ))
                ])
              ],
              6
              /* CLASS, STYLE */
            ))),
            128
            /* KEYED_FRAGMENT */
          )),
          e.createElementVNode(
            "li",
            {
              class: "cc-tile cc-tile--add",
              role: "button",
              tabindex: "0",
              onClick: m[4] || (m[4] = (s) => v.$emit("pick-files")),
              onKeydown: m[5] || (m[5] = e.withKeys(e.withModifiers((s) => v.$emit("pick-files"), ["prevent"]), ["enter"]))
            },
            [
              m[12] || (m[12] = e.createElementVNode(
                "i",
                { class: "ri-add-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(v.$t("再加几个")),
                1
                /* TEXT */
              )
            ],
            32
            /* NEED_HYDRATION */
          )
        ])) : (e.openBlock(), e.createElementBlock(
          "div",
          {
            key: 0,
            class: "cc-grid__empty",
            role: "button",
            tabindex: "0",
            onClick: m[2] || (m[2] = (s) => v.$emit("pick-dir")),
            onKeydown: m[3] || (m[3] = e.withKeys(e.withModifiers((s) => v.$emit("pick-dir"), ["prevent"]), ["enter"]))
          },
          [
            m[9] || (m[9] = e.createElementVNode(
              "span",
              { class: "cc-grid__glyph" },
              [
                e.createElementVNode("i", { class: "ri-upload-cloud-2-line" })
              ],
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(v.$t("把活动素材目录或文件拖到这里")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(v.$t("支持 JPG / PNG / MP4 / MOV / PDF，可多选")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", bn, [
              e.createElementVNode("button", {
                type: "button",
                class: "cc-btn primary",
                disabled: a.disabled,
                onClick: m[0] || (m[0] = e.withModifiers((s) => v.$emit("pick-dir"), ["stop"]))
              }, [
                m[7] || (m[7] = e.createElementVNode(
                  "i",
                  { class: "ri-folder-open-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(v.$t("选择目录")),
                  1
                  /* TEXT */
                )
              ], 8, _n),
              e.createElementVNode("button", {
                type: "button",
                class: "cc-btn",
                disabled: a.disabled,
                onClick: m[1] || (m[1] = e.withModifiers((s) => v.$emit("pick-files"), ["stop"]))
              }, [
                m[8] || (m[8] = e.createElementVNode(
                  "i",
                  { class: "ri-file-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(v.$t("选择文件")),
                  1
                  /* TEXT */
                )
              ], 8, Sn)
            ])
          ],
          32
          /* NEED_HYDRATION */
        ))
      ],
      34
      /* CLASS, NEED_HYDRATION */
    ));
  }
}), Wn = ["aria-label"], In = { class: "cc-audio__time" }, Rn = ["src"], Kn = /* @__PURE__ */ e.defineComponent({
  __name: "AudioWave",
  props: {
    src: {}
  },
  setup(a) {
    const c = a, r = e.ref(null), f = e.ref(null), d = e.ref(!1), h = e.ref(0), k = e.ref(0);
    let v = [], m = null;
    async function s() {
      v = [];
      try {
        const C = await (await fetch(c.src)).arrayBuffer();
        m = m || new (window.AudioContext || window.webkitAudioContext)();
        const j = (await m.decodeAudioData(C.slice(0))).getChannelData(0), g = 96, _ = Math.max(1, Math.floor(j.length / g)), M = [];
        for (let w = 0; w < g; w += 1) {
          let T = 0;
          const u = w * _;
          for (let D = 0; D < _; D += 8) {
            const E = Math.abs(j[u + D] || 0);
            E > T && (T = E);
          }
          M.push(T);
        }
        const A = Math.max(0.05, ...M);
        v = M.map((w) => w / A);
      } catch {
        v = [];
      }
      L();
    }
    function L() {
      const V = f.value;
      if (!V) return;
      const C = window.devicePixelRatio || 1, F = V.clientWidth || 300, j = V.clientHeight || 40;
      V.width = F * C, V.height = j * C;
      const g = V.getContext("2d");
      if (!g) return;
      g.scale(C, C), g.clearRect(0, 0, F, j);
      const _ = getComputedStyle(V), M = _.getPropertyValue("--color-brand").trim() || "#675cf3", A = _.getPropertyValue("--color-border").trim() || "#ccc", w = v.length || 96, T = 2, u = Math.max(1.5, (F - T * (w - 1)) / w), D = k.value ? h.value / k.value : 0;
      for (let E = 0; E < w; E += 1) {
        const Q = v.length ? v[E] : 0.35, oe = Math.max(3, Q * (j - 6));
        g.fillStyle = E / w <= D ? M : A;
        const Re = E * (u + T), we = (j - oe) / 2;
        g.beginPath(), g.roundRect ? g.roundRect(Re, we, u, oe, 1.5) : g.rect(Re, we, u, oe), g.fill();
      }
    }
    function p() {
      const V = r.value;
      V && (V.paused ? V.play() : V.pause());
    }
    function S() {
      h.value = r.value?.currentTime || 0, L();
    }
    function P() {
      k.value = r.value?.duration || 0, L();
    }
    function O(V) {
      const C = r.value, F = f.value;
      if (!C || !F || !k.value) return;
      const j = F.getBoundingClientRect();
      C.currentTime = Math.max(0, Math.min(k.value, (V.clientX - j.left) / j.width * k.value));
    }
    return e.onMounted(() => {
      s();
    }), e.watch(() => c.src, () => {
      h.value = 0, d.value = !1, s();
    }), e.onBeforeUnmount(() => {
      try {
        r.value?.pause(), m?.close();
      } catch {
      }
    }), (V, C) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        class: e.normalizeClass(["cc-audio", { playing: d.value }])
      },
      [
        e.createElementVNode("button", {
          type: "button",
          class: "cc-audio__play",
          "aria-label": d.value ? V.$t("暂停") : V.$t("播放"),
          onClick: p
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(d.value ? "ri-pause-fill" : "ri-play-fill")
            },
            null,
            2
            /* CLASS */
          )
        ], 8, Wn),
        e.createElementVNode(
          "canvas",
          {
            ref_key: "canvas",
            ref: f,
            class: "cc-audio__wave",
            onClick: O
          },
          null,
          512
          /* NEED_PATCH */
        ),
        e.createElementVNode(
          "span",
          In,
          e.toDisplayString(e.unref(Ce)(h.value)) + " / " + e.toDisplayString(e.unref(Ce)(k.value)),
          1
          /* TEXT */
        ),
        e.createElementVNode("audio", {
          ref_key: "audio",
          ref: r,
          src: a.src,
          preload: "metadata",
          onTimeupdate: S,
          onLoadedmetadata: P,
          onEnded: C[0] || (C[0] = (F) => d.value = !1),
          onPause: C[1] || (C[1] = (F) => d.value = !1),
          onPlay: C[2] || (C[2] = (F) => d.value = !0)
        }, null, 40, Rn)
      ],
      2
      /* CLASS */
    ));
  }
}), Un = ["title"], jn = ["disabled", "title"], xn = { key: 0 }, Hn = ["disabled", "title"], Gn = { key: 0 }, qn = ["disabled", "title"], Jn = { key: 0 }, Xn = ["title"], Yn = { key: 0 }, lt = /* @__PURE__ */ e.defineComponent({
  __name: "AssetActions",
  props: {
    path: {},
    label: {},
    compact: { type: Boolean }
  },
  emits: ["regen"],
  setup(a) {
    const c = a, r = e.ref(!1);
    async function f() {
      if (c.path) {
        r.value = !0;
        try {
          await cn(c.path, c.label) && Ie.useNotificationStore().success(o.t("已保存"));
        } catch (d) {
          Ie.useNotificationStore().error(De(d));
        } finally {
          r.value = !1;
        }
      }
    }
    return (d, h) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        class: e.normalizeClass(["cc-asset", { compact: a.compact }])
      },
      [
        a.compact ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("span", {
          key: 0,
          class: "cc-asset__name",
          title: a.path
        }, e.toDisplayString(a.label), 9, Un)),
        e.createElementVNode("button", {
          type: "button",
          class: "cc-btn sm",
          disabled: !a.path || r.value,
          title: d.$t("下载"),
          onClick: f
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(r.value ? "ri-loader-4-line cc-spin" : "ri-download-2-line")
            },
            null,
            2
            /* CLASS */
          ),
          a.compact ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "span",
            xn,
            e.toDisplayString(d.$t("下载")),
            1
            /* TEXT */
          ))
        ], 8, jn),
        e.createElementVNode("button", {
          type: "button",
          class: "cc-btn sm ghost",
          disabled: !a.path,
          title: d.$t("打开所在目录"),
          onClick: h[0] || (h[0] = (k) => e.unref(ue.openPath)(a.path, !0))
        }, [
          h[3] || (h[3] = e.createElementVNode(
            "i",
            { class: "ri-folder-open-line" },
            null,
            -1
            /* CACHED */
          )),
          a.compact ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "span",
            Gn,
            e.toDisplayString(d.$t("所在目录")),
            1
            /* TEXT */
          ))
        ], 8, Hn),
        e.createElementVNode("button", {
          type: "button",
          class: "cc-btn sm ghost",
          disabled: !a.path,
          title: d.$t("打开"),
          onClick: h[1] || (h[1] = (k) => e.unref(ue.openPath)(a.path))
        }, [
          h[4] || (h[4] = e.createElementVNode(
            "i",
            { class: "ri-external-link-line" },
            null,
            -1
            /* CACHED */
          )),
          a.compact ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "span",
            Jn,
            e.toDisplayString(d.$t("打开")),
            1
            /* TEXT */
          ))
        ], 8, qn),
        e.createElementVNode("button", {
          type: "button",
          class: "cc-btn sm ghost",
          title: d.$t("重新生成"),
          onClick: h[2] || (h[2] = (k) => d.$emit("regen"))
        }, [
          h[5] || (h[5] = e.createElementVNode(
            "i",
            { class: "ri-refresh-line" },
            null,
            -1
            /* CACHED */
          )),
          a.compact ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "span",
            Yn,
            e.toDisplayString(d.$t("重新生成")),
            1
            /* TEXT */
          ))
        ], 8, Xn)
      ],
      2
      /* CLASS */
    ));
  }
}), Qn = ["aria-label"], Zn = { class: "cc-phases__list" }, ea = { class: "cc-phases__dot" }, ta = {
  key: 0,
  class: "ri-check-line"
}, la = {
  key: 1,
  class: "ri-loader-4-line cc-spin"
}, na = { class: "cc-phases__label" }, aa = { key: 0 }, oa = ["aria-valuenow"], sa = { class: "cc-phases__foot" }, ra = { class: "cc-skeleton__live" }, ia = /* @__PURE__ */ e.defineComponent({
  __name: "CcVideoPhases",
  props: {
    live: {},
    fallbackPlan: {},
    langCount: {}
  },
  emits: ["cancel"],
  setup(a) {
    const c = a, r = e.computed(() => c.live?.step === "video" && c.live.plan?.length ? c.live : null), f = e.computed(() => r.value?.plan || c.fallbackPlan), d = e.computed(() => r.value?.phase ? f.value.indexOf(r.value.phase) : 0);
    function h(v) {
      return v < d.value ? "done" : v === d.value ? "running" : "todo";
    }
    const k = e.computed(() => Math.round((kn(r.value) ?? 0) * 100));
    return (v, m) => (e.openBlock(), e.createElementBlock("div", {
      class: "cc-phases",
      "aria-label": v.$t("成片进度")
    }, [
      e.createElementVNode("ol", Zn, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(f.value, (s, L) => (e.openBlock(), e.createElementBlock(
            "li",
            {
              key: s,
              class: e.normalizeClass(h(L))
            },
            [
              e.createElementVNode("span", ea, [
                h(L) === "done" ? (e.openBlock(), e.createElementBlock("i", ta)) : h(L) === "running" ? (e.openBlock(), e.createElementBlock("i", la)) : (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 2 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(L + 1),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]),
              e.createElementVNode("span", na, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(e.unref(fn)(s, a.langCount)),
                  1
                  /* TEXT */
                ),
                h(L) === "running" && r.value && r.value.total > 1 ? (e.openBlock(), e.createElementBlock(
                  "small",
                  aa,
                  e.toDisplayString(r.value.done) + "/" + e.toDisplayString(r.value.total),
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
      ]),
      e.createElementVNode("div", {
        class: "cc-stagebar",
        role: "progressbar",
        "aria-valuenow": k.value,
        "aria-valuemin": "0",
        "aria-valuemax": "100"
      }, [
        e.createElementVNode(
          "span",
          {
            style: e.normalizeStyle({ width: `${k.value}%` })
          },
          null,
          4
          /* STYLE */
        )
      ], 8, oa),
      e.createElementVNode("div", sa, [
        e.createElementVNode("p", ra, [
          m[1] || (m[1] = e.createElementVNode(
            "i",
            { class: "ri-loader-4-line cc-spin" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(a.live?.step === "video" && a.live.msg || v.$t("准备中…")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "cc-btn sm ghost",
          onClick: m[0] || (m[0] = (s) => v.$emit("cancel"))
        }, [
          m[2] || (m[2] = e.createElementVNode(
            "i",
            { class: "ri-stop-circle-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(v.$t("停止生成")),
            1
            /* TEXT */
          )
        ])
      ])
    ], 8, Qn));
  }
}), ca = ["data-cc-prompt"], ua = { class: "cc-panel__head" }, da = { class: "cc-muted" }, ma = {
  class: "cc-muted",
  dir: "ltr"
}, pa = ["disabled"], va = ["maxlength", "disabled", "value", "dir", "lang", "placeholder"], fa = {
  key: 0,
  class: "cc-prompt__effective"
}, Qt = /* @__PURE__ */ e.defineComponent({
  __name: "CcPromptBox",
  props: {
    kind: {},
    modelValue: {},
    defaultValue: {},
    label: {},
    hint: {},
    icon: { default: "ri-quill-pen-line" },
    disabled: { type: Boolean, default: !1 },
    dir: { default: "auto" },
    lang: { default: void 0 },
    max: { default: ee.CHARITY_PROMPT_MAX }
  },
  emits: ["update:modelValue"],
  setup(a) {
    return (c, r) => (e.openBlock(), e.createElementBlock("section", {
      class: "cc-panel cc-prompt",
      "data-cc-prompt": a.kind
    }, [
      e.createElementVNode("header", ua, [
        e.createElementVNode("strong", null, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(a.icon)
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(a.label),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          da,
          e.toDisplayString(a.hint),
          1
          /* TEXT */
        ),
        r[3] || (r[3] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "small",
          ma,
          e.toDisplayString(c.$t("{n}/{max} 字", { n: a.modelValue.length, max: a.max })),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "cc-btn sm ghost",
          "data-act": "reset",
          disabled: a.disabled || a.modelValue === a.defaultValue,
          onClick: r[0] || (r[0] = (f) => c.$emit("update:modelValue", a.defaultValue))
        }, [
          r[2] || (r[2] = e.createElementVNode(
            "i",
            { class: "ri-arrow-go-back-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(c.$t("恢复默认")),
            1
            /* TEXT */
          )
        ], 8, pa)
      ]),
      e.createElementVNode("textarea", {
        class: "cc-textarea",
        rows: "3",
        maxlength: a.max,
        disabled: a.disabled,
        value: a.modelValue,
        dir: a.dir,
        lang: a.lang,
        placeholder: c.$t("留空则按不加提示词的方式生成"),
        onInput: r[1] || (r[1] = (f) => c.$emit("update:modelValue", f.target.value))
      }, null, 40, va),
      c.$slots.effective ? (e.openBlock(), e.createElementBlock("details", fa, [
        e.createElementVNode("summary", null, [
          r[4] || (r[4] = e.createElementVNode(
            "i",
            { class: "ri-eye-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(c.$t("本次实际使用的提示词")),
            1
            /* TEXT */
          )
        ]),
        e.renderSlot(c.$slots, "effective")
      ])) : e.createCommentVNode("v-if", !0)
    ], 8, ca));
  }
}), sl = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/FalServiceConfig.vue"];
if (!sl) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/FalServiceConfig.vue");
const Zt = sl.default, We = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/workflowAutoRun.ts"];
if (!We) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/workflowAutoRun.ts");
We.default;
const at = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/publishPlatforms.ts"];
if (!at) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/publishPlatforms.ts");
at.default;
const ot = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/overseasPublish.ts"];
if (!ot) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/overseasPublish.ts");
ot.default;
const ka = { class: "cc-hero" }, ga = { class: "cc-hero__copy" }, ha = { class: "cc-hero__eyebrow" }, ya = { class: "cc-hero__sub" }, Va = {
  class: "cc-hero__chain",
  "aria-hidden": "true"
}, Na = {
  key: 0,
  class: "ri-arrow-right-s-line arrow"
}, Ea = { class: "cc-hero__actions" }, ba = ["disabled", "title"], _a = ["disabled", "title"], Sa = ["aria-label"], Ba = ["aria-selected", "disabled", "title", "onClick"], $a = { class: "cc-line__text" }, Da = {
  key: 0,
  class: "cc-note warn cc-orphan",
  role: "status"
}, Ca = { class: "grow" }, wa = ["disabled"], Ta = { class: "cc-steps" }, La = ["title"], Aa = { dir: "ltr" }, Pa = {
  key: 0,
  class: "cc-note info"
}, Oa = { class: "cc-panel" }, Ma = { class: "cc-panel__head" }, za = { class: "cc-muted" }, Fa = ["disabled"], Wa = ["disabled"], Ia = {
  key: 0,
  class: "cc-skeleton cc-skeleton--form",
  "aria-hidden": "true"
}, Ra = {
  key: 1,
  class: "cc-archive"
}, Ka = ["dir"], Ua = { class: "cc-field" }, ja = ["lang"], xa = { class: "cc-field" }, Ha = ["lang"], Ga = { class: "cc-field" }, qa = ["lang"], Ja = { class: "cc-field" }, Xa = ["lang"], Ya = { class: "cc-field wide" }, Qa = ["lang"], Za = {
  class: "cc-form",
  dir: "ltr"
}, eo = { class: "cc-field" }, to = { class: "cc-field" }, lo = ["value", "placeholder"], no = { class: "cc-field" }, ao = {
  key: 2,
  class: "cc-note"
}, oo = { class: "cc-actions end" }, so = ["disabled"], ro = ["disabled"], io = {
  key: 0,
  class: "cc-note warn"
}, co = {
  key: 1,
  class: "cc-note warn"
}, uo = {
  key: 2,
  class: "cc-skeleton cc-skeleton--report",
  "aria-hidden": "true"
}, mo = { class: "cc-skeleton__row" }, po = { class: "cc-skeleton__live" }, vo = { class: "cc-panel" }, fo = { class: "cc-panel__head" }, ko = { class: "cc-muted" }, go = {
  key: 0,
  class: "cc-desc"
}, ho = ["src"], yo = {
  key: 1,
  class: "cc-desc__icon"
}, Vo = ["dir", "lang"], No = ["title"], Eo = { class: "cc-panel" }, bo = { class: "cc-panel__head" }, _o = { class: "cc-report" }, So = ["dir", "lang"], Bo = { class: "cc-report__pdf" }, $o = ["src", "alt"], Do = {
  key: 1,
  class: "cc-pdfpage__empty"
}, Co = { class: "cc-panel" }, wo = { class: "cc-panel__head" }, To = { class: "cc-muted" }, Lo = { class: "cc-posters" }, Ao = ["onClick"], Po = { class: "cc-poster__inner" }, Oo = { class: "cc-poster__face front" }, Mo = ["src", "alt"], zo = ["lang"], Fo = ["dir", "lang"], Wo = {
  key: 4,
  class: "cc-note"
}, Io = {
  key: 5,
  class: "cc-actions end"
}, Ro = ["disabled"], Ko = { class: "cc-panel" }, Uo = { class: "cc-panel__head" }, jo = {
  class: "cc-seg",
  role: "tablist"
}, xo = ["onClick"], Ho = { class: "cc-chip ok" }, Go = {
  key: 0,
  class: "cc-actions"
}, qo = { value: "" }, Jo = ["value"], Xo = ["disabled"], Yo = ["title"], Qo = { dir: "ltr" }, Zo = { class: "cc-field inline" }, es = ["disabled"], ts = {
  key: 2,
  class: "cc-muted"
}, ls = ["dir", "lang", "placeholder"], ns = {
  key: 1,
  class: "cc-note info"
}, as = { class: "cc-voice-pick" }, os = { class: "cc-voice-pick__row" }, ss = { class: "cc-voice-pick__label" }, rs = ["aria-label"], is = ["aria-pressed", "lang", "onClick"], cs = ["title"], us = {
  key: 0,
  class: "cc-muted"
}, ds = ["lang"], ms = ["aria-label"], ps = ["aria-checked", "data-gender", "onClick"], vs = ["onUpdate:modelValue", "aria-label"], fs = ["value"], ks = { class: "cc-actions" }, gs = ["disabled"], hs = { class: "cc-muted" }, ys = {
  key: 0,
  class: "cc-skeleton cc-skeleton--audio",
  "aria-hidden": "true"
}, Vs = { class: "cc-skeleton__live" }, Ns = {
  key: 1,
  class: "cc-panel"
}, Es = { class: "cc-panel__head" }, bs = { class: "cc-toggle" }, _s = { class: "cc-speech" }, Ss = { class: "cc-speech__head" }, Bs = ["lang"], $s = ["title"], Ds = { class: "cc-muted" }, Cs = {
  key: 2,
  class: "cc-actions end"
}, ws = ["disabled"], Ts = { class: "cc-panel" }, Ls = { class: "cc-panel__head" }, As = { class: "cc-modes" }, Ps = {
  key: 0,
  class: "warn"
}, Os = { class: "cc-mode__badge" }, Ms = { class: "cc-form" }, zs = { class: "cc-field" }, Fs = { class: "cc-checks" }, Ws = ["value"], Is = ["lang"], Rs = { class: "cc-field" }, Ks = { value: "warm" }, Us = { value: "hopeful" }, js = { value: "calm" }, xs = { value: "inspiring" }, Hs = { class: "cc-field" }, Gs = { class: "cc-muted" }, qs = {
  key: 0,
  class: "cc-note info"
}, Js = { class: "cc-prompt__dl" }, Xs = { dir: "auto" }, Ys = { dir: "auto" }, Qs = { dir: "auto" }, Zs = { class: "cc-actions" }, er = ["disabled"], tr = {
  class: "cc-skeleton cc-skeleton--video",
  "aria-hidden": "true"
}, lr = { class: "cc-skeleton__row" }, nr = {
  key: 1,
  class: "cc-panel"
}, ar = { class: "cc-panel__head" }, or = ["title"], sr = {
  key: 0,
  class: "cc-note warn"
}, rr = {
  key: 1,
  class: "cc-shots"
}, ir = ["title"], cr = { key: 0 }, ur = ["title"], dr = { key: 0 }, mr = { class: "cc-videos" }, pr = { class: "cc-video__phone" }, vr = ["src"], fr = { class: "cc-video__meta" }, kr = ["lang"], gr = { class: "cc-muted" }, hr = { dir: "ltr" }, yr = { dir: "ltr" }, Vr = {
  key: 0,
  class: "cc-note"
}, Nr = { class: "cc-panel" }, Er = { class: "cc-panel__head" }, br = { class: "cc-muted" }, _r = {
  key: 0,
  class: "cc-note info"
}, Sr = { class: "grow" }, Br = ["aria-label"], $r = ["aria-checked", "lang", "onClick"], Dr = {
  key: 2,
  class: "cc-pubpick"
}, Cr = { class: "cc-pubpick__meta" }, wr = ["lang"], Tr = { class: "cc-muted" }, Lr = {
  key: 0,
  class: "cc-video__phone"
}, Ar = ["src"], Pr = {
  key: 1,
  class: "cc-muted"
}, Or = { class: "cc-panel" }, Mr = { class: "cc-panel__head" }, zr = { class: "cc-muted" }, Fr = { class: "cc-muted" }, Wr = { class: "cc-platforms" }, Ir = ["aria-pressed", "onClick"], Rr = { class: "cc-platform__mark" }, Kr = { class: "cc-platform__text" }, Ur = {
  key: 0,
  class: "ri-check-line"
}, jr = { class: "cc-muted" }, xr = { class: "cc-platforms" }, Hr = ["aria-pressed", "onClick"], Gr = { class: "cc-platform__text" }, qr = {
  key: 0,
  class: "ri-check-line"
}, Jr = { class: "cc-note info" }, Xr = {
  key: 0,
  class: "cc-panel"
}, Yr = { class: "cc-panel__head" }, Qr = { class: "cc-oruns" }, Zr = { class: "cc-orun__text" }, ei = { class: "cc-panel" }, ti = { class: "cc-panel__head" }, li = { class: "cc-muted" }, ni = ["disabled"], ai = ["dir", "lang", "placeholder"], oi = { class: "cc-field" }, si = ["placeholder"], ri = { class: "cc-note info" }, ii = { class: "cc-actions" }, ci = ["disabled"], ui = {
  key: 1,
  class: "cc-panel cc-history"
}, di = { class: "cc-panel__head" }, mi = { class: "cc-muted" }, pi = { class: "cc-history__list" }, vi = { class: "cc-history__head" }, fi = {
  key: 0,
  class: "cc-muted"
}, ki = ["onClick"], gi = {
  key: 0,
  class: "cc-history__prompts"
}, hi = { key: 0 }, yi = { dir: "auto" }, Vi = { key: 1 }, Ni = { dir: "auto" }, Ei = { class: "cc-history__assets" }, bi = ["onClick"], _i = ["onClick"], Si = ["onClick"], Bi = ["onClick"], $i = ["title", "onClick"], Di = ["onClick"], Ci = ["title", "onClick"], wi = { class: "cc-video__phone big" }, Ti = ["src"], el = "charity-content.line", Li = /* @__PURE__ */ e.defineComponent({
  __name: "CharityContentWorkbenchView",
  setup(a) {
    const c = Et.useRouter(), r = Ie.useNotificationStore(), f = al(), d = on();
    function h() {
      try {
        const t = localStorage.getItem(el);
        if (t === "event" || t === "article") return t;
      } catch {
      }
      return "event";
    }
    const k = e.ref(h()), v = e.computed(() => d.find((t) => t.key === k.value) || d[0]), m = e.computed(() => k.value === "article" ? $.some((t) => !!B.value[t]) : be.value), s = e.shallowRef(jt(ht(k.value)));
    function L(t) {
      if (!(t === k.value || s.value.isRunning())) {
        k.value = t;
        try {
          localStorage.setItem(el, t);
        } catch {
        }
        s.value = jt(ht(t)), P.value = null;
      }
    }
    function p(t) {
      return s.value.metas.find((l) => l.key === t) || ht("event").find((l) => l.key === t);
    }
    function S(t) {
      const l = s.value.metas.findIndex((n) => n.key === t);
      return l < 0 ? 0 : l;
    }
    const P = e.ref(null), O = e.reactive({}), V = e.ref(null), C = e.ref(!1), F = ge.useStepWatchdog({
      running: () => !!V.value,
      startedAt: () => V.value?.firstAt,
      lastProgressAt: () => V.value?.lastAt,
      kind: "video"
    });
    e.watch(F.suspect, (t) => {
      t && (V.value = null);
    });
    async function j() {
      const t = V.value;
      if (!(!t || C.value)) {
        C.value = !0;
        try {
          await b().cancel({ runId: t.runId }), V.value = null, r.info(o.t("已停止"));
        } catch (l) {
          r.error(De(l));
        } finally {
          C.value = !1;
        }
      }
    }
    function g(t) {
      return s.value.isRunning() ? !A.value || t.runId === A.value ? !0 : s.value.runtime.material?.state === "running" && (t.step === "scan" || t.step === "archive") : !1;
    }
    function _(t) {
      if (t.runId === "demo-pack") return;
      const l = Date.now();
      if (g(t)) {
        P.value = t, s.value.heartbeat(l);
        return;
      }
      if (A.value && t.runId === A.value) return;
      const n = V.value;
      V.value = { runId: t.runId, step: t.step, msg: t.msg, firstAt: n && n.runId === t.runId ? n.firstAt : l, lastAt: l };
    }
    const M = e.ref(""), A = e.ref(""), w = e.ref(""), T = e.ref([]), u = e.ref(null), D = e.ref(o.uiContentLang()), E = e.ref(o.uiContentLang()), Q = e.ref([]), oe = e.ref(""), Re = /默认模型|default model/i;
    function we(t) {
      return !!t && Re.test(t);
    }
    function rl() {
      c.push({ path: "/settings", query: { section: "ai-models" } });
    }
    const K = e.ref(null), st = e.reactive(ae()), rt = e.reactive(ae()), Ke = e.reactive(ae()), it = e.reactive(ae()), ct = e.reactive({ zh: !1, en: !1, ar: !1 }), Ue = e.ref(k.value === "article" ? "paste" : "summary"), _t = [
      { key: "summary", label: o.t("报告摘要") },
      { key: "paste", label: o.t("粘贴文字") },
      { key: "pdf", label: o.t("上传 PDF 抽文字") }
    ], il = e.computed(() => k.value === "article" ? _t.filter((t) => t.key !== "summary") : _t), se = e.ref(""), je = e.computed(() => Yt(se.value)), W = e.ref([o.uiContentLang()]), St = e.computed(() => W.value.filter((t) => t !== je.value));
    function cl(t) {
      W.value = W.value.includes(t) ? W.value.filter((l) => l !== t) : [...W.value, t];
    }
    const H = e.reactive({ zh: "", en: "", ar: "" }), he = e.reactive({ zh: "female", en: "female", ar: "female" }), ul = e.computed(() => [
      { key: "female", label: o.t("女声") },
      { key: "male", label: o.t("男声") }
    ]), xe = e.reactive(qt("female"));
    function dl(t, l) {
      he[t] !== l && (he[t] = l, xe[t] = qt(l)[t]);
    }
    const He = e.ref(""), B = e.ref({}), ye = e.ref(!0), te = e.ref(""), ut = e.ref(2), Te = e.ref(!1), Ge = e.ref(""), le = e.ref("ai"), de = e.ref("ai"), I = e.ref(null);
    function ml(t) {
      return t === "fal" ? o.t("配乐 · Stable Audio") : t === "library" ? o.t("配乐 · 本地配乐库（回退）") : t === "synth" ? o.t("配乐 · 本地合成（回退）") : o.t("无配乐");
    }
    const Ve = e.ref(["zh", "en", "ar"]), qe = e.ref("warm"), U = e.ref({}), Je = e.ref([]), Le = e.ref(""), Xe = e.ref("clip"), Z = e.ref(null), Ne = e.ref(!1), Bt = Xt("content"), $t = Xt("video"), re = Bt.value, ie = $t.value, me = e.ref(null), pl = e.computed(() => {
      const t = ee.mergeShotPrompt(re.value, ie.value, qe.value), l = ee.endSloganFromPrompt(ie.value), n = {};
      if (l.wanted) for (const i of $) n[i] = l.text || u.value?.eventName[i] || u.value?.orgName[i] || "";
      return { shot: t.shot, music: t.music, contentPoints: t.contentPoints, stylePoints: t.stylePoints, clipStyle: ee.clipStyleFromPrompt(ie.value), endSlogan: n };
    }), Ee = e.computed(() => me.value || pl.value), vl = e.computed(() => ee.needsCondense(re.value, ie.value)), fl = e.computed(() => Ee.value.endSlogan[o.uiContentLang()] || $.map((t) => Ee.value.endSlogan[t]).find(Boolean) || "");
    function kl(t) {
      return t === "slow" ? o.t("舒缓节奏") : t === "fast" ? o.t("明快节奏") : o.t("正常节奏");
    }
    function gl(t) {
      return t === "fade" ? o.t("淡入淡出") : o.t("直切");
    }
    const be = e.computed(() => T.value.some((t) => t.ok && (t.kind === "image" || t.kind === "video"))), Dt = e.computed(() => T.value.filter((t) => t.ok && (t.kind === "image" || t.kind === "video")).map((t) => t.path)), Ct = e.computed(() => T.value.filter((t) => t.ok && t.kind === "image").map((t) => t.path));
    function Ye(t) {
      return T.value.filter((l) => l.kind === t && l.ok).length;
    }
    function wt(t) {
      return T.value.find((l) => l.path === t)?.thumbDataUrl || "";
    }
    function Tt(t) {
      return t.split(/[\\/]/).pop() || t;
    }
    function hl(t) {
      const l = Number(t);
      return t === "" || !Number.isFinite(l) ? null : Math.max(0, Math.round(l));
    }
    function Lt(t) {
      return JSON.parse(JSON.stringify(t));
    }
    async function _e(t) {
      O.material = () => _e(t);
      const l = s.value.start("material");
      try {
        const n = ke(o.t("素材探测"), await b().scan(t));
        M.value = n.dir, A.value = n.runId, w.value = n.outDir, T.value = n.items, s.value.resetAfter("material"), K.value = null, Q.value = [], B.value = {}, U.value = {}, s.value.done("material", o.t("已探测 {n} 个素材", { n: T.value.filter((i) => i.ok).length }), l), await X();
      } catch (n) {
        s.value.fail("material", n, l);
      }
    }
    async function yl() {
      (w.value ? await Promise.resolve(rn()?.openPath?.(w.value, { reveal: !0 })).catch(() => null) : null)?.ok || ue.openPath(M.value, !0);
    }
    async function Vl() {
      const t = await b().pickDir();
      t?.path && await _e({ dir: t.path });
    }
    async function Nl() {
      const t = await b().pickFiles();
      t?.paths?.length && await _e({ dir: M.value || void 0, files: [...T.value.map((l) => l.path), ...t.paths] });
    }
    async function El(t) {
      t.length === 1 && !/\.[a-z0-9]{2,5}$/i.test(t[0]) ? await _e({ dir: t[0] }) : await _e({ dir: M.value || void 0, files: [...T.value.map((n) => n.path), ...t] });
    }
    function bl(t) {
      T.value = T.value.filter((l) => l.path !== t);
    }
    async function _l() {
      let t = null;
      try {
        t = await b().demoMaterials();
      } catch (l) {
        t = { ok: !1, error: De(l) };
      }
      if (!t?.ok || !t.dir) {
        r.warn(t?.error || o.t("演示素材准备失败，请手动选择素材目录"));
        return;
      }
      await _e({ dir: t.dir }), s.value.runtime.material.state !== "failed" && !u.value && Z.value?.archive && (u.value = Lt(Z.value.archive));
    }
    async function dt(t = !1) {
      O.material = () => dt(t);
      const l = s.value.start("material");
      try {
        const n = ke(o.t("档案草案"), await b().archiveDraft({ runId: A.value, outDir: w.value, images: Ct.value, fallbackToPrebaked: t }));
        u.value = n.archive, s.value.done("material", o.t("档案草案已生成：{ev}", { ev: o.pickContentLang(n.archive.eventName) }), l);
      } catch (n) {
        s.value.fail("material", n, l);
      }
    }
    async function Se(t = !1) {
      if (!u.value) return !1;
      O.report = () => Se(t);
      const l = s.value.start("report");
      K.value = null, oe.value = "";
      try {
        const n = ke(o.t("素材整理"), await b().analyze({ runId: A.value, outDir: w.value, items: Dt.value, archive: u.value, contentPrompt: re.value, fallbackToPrebaked: t }));
        Q.value = n.descriptions || [], oe.value = n.warning || "";
        const i = ke(o.t("报告生成"), await b().report({ runId: A.value, outDir: w.value, archive: u.value, descriptions: Q.value, images: Ct.value, contentPrompt: re.value, fallbackToPrebaked: t }));
        K.value = i.report, Object.assign(st, i.pdf), Object.assign(rt, i.poster), Object.assign(Ke, i.posterPreview);
        for (const y of $) {
          const N = await b().fileUrl({ path: i.pdf[y], kind: "pdf" });
          it[y] = N?.url || "";
        }
        return s.value.resetAfter("report"), s.value.done("report", o.t("三语报告 PDF 与海报已生成，{n} 个素材已整理", { n: Q.value.length }), l), Qe(), await X(), !0;
      } catch (n) {
        return s.value.fail("report", n, l), !1;
      }
    }
    function Qe() {
      const t = pn(K.value);
      for (const n of $) t[n] && (H[n] = t[n]);
      const l = $.filter((n) => H[n].trim());
      l.length && (W.value = l), se.value = H[o.uiContentLang()] || H[l[0]] || "", He.value = "", Ue.value = "summary";
    }
    async function Sl() {
      const t = await b().pickPdf();
      t?.path && (te.value = t.path, await At());
    }
    async function At() {
      if (te.value) {
        Te.value = !0, Ge.value = "";
        try {
          const t = await b().pdfText({ path: te.value, pages: ut.value });
          if (!t?.ok) throw new Error(t?.error || o.t("抽取失败"));
          for (const n of $) H[n] = "";
          se.value = t.text;
          const l = Yt(t.text);
          W.value.includes(l) || (W.value = [...W.value, l]), He.value = "", Ge.value = o.t("已抽取第 {p} 页（共 {t} 页）", { p: t.pages.join(o.listSeparator()), t: t.totalPages });
        } catch (t) {
          r.error(De(t));
        } finally {
          Te.value = !1;
        }
      }
    }
    async function Ae() {
      if (A.value && w.value) return !0;
      const t = await b().startRun({ dir: M.value || void 0 });
      return !t?.ok || !t.runId || !t.outDir ? (r.warn(t?.error || o.t("无法建立本次运行的输出目录")), !1) : (A.value = t.runId, w.value = t.outDir, M.value = t.dir || M.value, await X(), !0);
    }
    async function mt(t, l) {
      const n = H[t].trim();
      if (!n) return;
      const i = ke(o.t("语音合成"), await b().tts({
        runId: A.value,
        outDir: w.value,
        text: { [t]: n },
        voices: { [t]: xe[t] },
        gender: he[t],
        quality: "hd",
        fallbackToPrebaked: l
      }));
      B.value = { ...B.value, ...i.items };
    }
    function pt(t) {
      const l = $.filter((i) => B.value[i]), n = l.filter((i) => B.value[i]?.quality === "hd").length;
      s.value.resetAfter("speech"), s.value.done("speech", o.t("{n} 种语言已合成（{hd} 种高保真）", { n: l.length, hd: n }), t);
    }
    async function Bl(t) {
      const l = je.value, n = se.value.trim();
      for (const N of $) H[N] = "";
      H[l] = n;
      const i = t.filter((N) => N !== l);
      if (!i.length) return t.filter((N) => H[N].trim());
      const y = await b().translate({ runId: A.value, text: n, targets: i });
      if (!y?.ok) throw new Error(y?.error || o.t("转译失败"));
      for (const N of i) y.items?.[N] && (H[N] = String(y.items[N]).trim());
      return y.failed?.length && r.warn(o.t("{langs} 转译失败，这几种没有合成", { langs: y.failed.map((N) => z[N]).join(o.listSeparator()) })), t.filter((N) => H[N].trim());
    }
    async function Pt(t = !1) {
      if (!se.value.trim() || !W.value.length || !await Ae()) return !1;
      O.speech = () => Pt(t);
      const l = s.value.start("speech");
      try {
        for (const n of await Bl([...W.value])) await mt(n, t);
        return pt(l), await X(), !0;
      } catch (n) {
        return s.value.fail("speech", n, l), !1;
      }
    }
    async function Ot(t) {
      if (!H[t].trim() || !await Ae()) return;
      O.speech = () => Ot(t);
      const l = s.value.start("speech");
      try {
        await mt(t, !1), pt(l), await X();
      } catch (n) {
        s.value.fail("speech", n, l);
      }
    }
    async function vt(t = !1) {
      const l = $.filter((i) => H[i].trim());
      if (!l.length || !await Ae()) return !1;
      O.speech = () => vt(t);
      const n = s.value.start("speech");
      try {
        for (const i of l) await mt(i, t);
        return pt(n), await X(), !0;
      } catch (i) {
        return s.value.fail("speech", i, n), !1;
      }
    }
    const $l = at.publishPlatforms(), Dl = ot.overseasPlatforms().filter((t) => t.id !== "google_ads"), G = e.ref([]), { runs: Pe, publish: Cl, cancel: wl } = ot.useOverseasPublish();
    function Tl(t) {
      G.value = G.value.includes(t) ? G.value.filter((l) => l !== t) : [...G.value, t];
    }
    function Mt(t) {
      return t.state === "done" ? t.status === "handback" ? o.t("等你确认") : o.t("已发布") : t.state === "cancelled" ? o.t("已停止") : t.state === "failed" ? t.status === "blocked" ? o.t("被挡住") : o.t("失败") : t.state === "running" ? o.t("进行中") : o.t("待发布");
    }
    const R = e.ref(o.uiContentLang()), q = e.ref(null), J = e.ref([]), Y = e.ref(""), ft = e.ref(""), Oe = e.ref(!1), Ze = e.ref(!1), pe = e.computed(() => $.filter((t) => U.value[t])), ne = e.computed(() => {
      if (q.value) return q.value;
      const t = R.value, l = U.value[t];
      return l ? { path: l.path, lang: t, runId: A.value, archive: u.value || void 0 } : null;
    }), Ll = e.computed(() => {
      const t = ne.value;
      if (!t) return "";
      const l = q.value ? null : U.value[t.lang], n = [], i = q.value?.mode || l?.mode;
      return i && n.push(i === "ai" ? o.t("AI 增强版") : o.t("素材剪辑版")), l?.durationSec && n.push(Ce(l.durationSec)), l?.size && n.push(Nt(l.size)), n.push(t.path.split(/[/\\]/).pop() || ""), n.filter(Boolean).join(" · ");
    }), et = e.ref("");
    e.watch(ne, async (t) => {
      if (et.value = "", !t?.path) return;
      const l = t.path, n = await b().fileUrl({ path: l, kind: "video" }).catch(() => null);
      ne.value?.path === l && (et.value = n?.ok && n.url ? n.url : "");
    }, { immediate: !0 });
    function Al(t) {
      J.value = J.value.includes(t) ? J.value.filter((l) => l !== t) : [...J.value, t];
    }
    async function Me(t = !1) {
      const l = R.value, n = q.value?.archive || u.value || void 0, y = [(q.value ? n?.summary[l] : K.value?.[l]?.summary || n?.summary[l]) || "", n?.eventName[l] || ""].map((N) => String(N || "").trim()).filter(Boolean).join(" ");
      if (!(!t && Y.value.trim())) {
        if (!t) {
          Y.value = y.slice(0, 300);
          return;
        }
        Ze.value = !0;
        try {
          const N = window.electronAPI?.llmOneshot;
          if (!N || !y) {
            Y.value = y.slice(0, 300);
            return;
          }
          const gt = await N({
            systemPrompt: o.t("你是公益机构的新媒体运营。只输出发布正文本身，不要解释、不要引号、不要话题标签。"),
            prompt: [
              o.t("机构：{p0}", { p0: n?.orgName[l] || "" }),
              o.t("活动：{p0}", { p0: n?.eventName[l] || "" }),
              "",
              o.t("可用事实（不得超出这些内容虚构）："),
              y.slice(0, 1200),
              "",
              o.t("写一条 120 字以内的发布正文：开头一句话说清这是什么活动，中间讲最打动人的一个事实，结尾一句温和的号召。只依据上面的事实，不得虚构人数、金额、地点。现在只输出正文。")
            ].join(`
`),
            timeoutMs: 12e4,
            plainCompletion: !0
          }), x = String(gt?.text || "").trim().replace(/^["\'「」]+|["\'「」]+$/g, "");
          Y.value = (x || y).slice(0, 300);
        } catch {
          Y.value = y.slice(0, 300);
        } finally {
          Ze.value = !1;
        }
      }
    }
    const Pl = "：";
    async function zt() {
      const t = ne.value;
      if (!t || Oe.value || !J.value.length && !G.value.length) return;
      const l = t.lang;
      Oe.value = !0, O.publish = () => zt();
      const n = s.value.start("publish");
      try {
        const i = Y.value.trim(), y = ft.value.split(/[\s,，#]+/).map((x) => x.trim()).filter(Boolean).slice(0, 8), N = t.archive?.eventName[l] || t.archive?.orgName[l] || o.t("慈善活动内容工场");
        if (G.value.length) {
          const x = [
            o.t("机构：{p0}", { p0: t.archive?.orgName[l] || "" }),
            o.t("活动：{p0}", { p0: t.archive?.eventName[l] || "" }),
            i
          ].filter((ce) => ce && !ce.endsWith(Pl)).join(`
`);
          await Cl(G.value.map((ce) => ({
            platform: ce,
            videoPath: t.path,
            title: N,
            caption: i,
            hashtags: y,
            autoPublish: !0,
            contextBrief: x
          })));
        }
        if (J.value.length) {
          const x = window.electronAPI;
          if (!x?.saveWorkflow || !x?.runWorkflow) throw new Error(o.t("当前版本未开放工作流运行"));
          const ce = J.value, Rt = {
            videoPath: t.path,
            projectName: N,
            platforms: at.platformIdsParam(ce),
            topics: JSON.stringify(Object.fromEntries(ce.map((Il) => [Il, y]))),
            caption: i,
            workflowSource: "charity-content",
            returnPath: "/workbenches/charity-content",
            returnLabel: o.t("返回慈善活动内容工场")
          };
          await x.saveWorkflow(We.buildVideoPublishWorkflow(Rt)), We.setWorkflowAutoRun(We.FIXED_VIDEO_PUBLISH_WORKFLOW_ID, Rt), s.value.done("publish", o.t("已交给发布工作流：{n} 个平台 · {lang} 版", { n: ce.length, lang: z[l] }), n), await c.push({ path: "/workflow" });
          return;
        }
        if (Pe.value.some((x) => x.state === "cancelled")) return;
        const gt = Pe.value.filter((x) => x.state === "done" && x.status !== "handback").length;
        s.value.done("publish", o.t("海外发布完成：{ok} / {n} 个平台", { ok: gt, n: Pe.value.length }), n);
      } catch (i) {
        s.value.fail("publish", i, n);
      } finally {
        Oe.value = !1;
      }
    }
    const Be = e.ref(!1), tt = e.ref(""), ve = e.ref(null), Ol = e.computed(() => ve.value?.ready ? o.t("直接摆出一整套真跑出来的成品，不花时间生成") : ve.value?.baseUrl ? o.t("首次使用会先下载演示数据（约 {mb} MB），之后本地复用", { mb: Math.round((ve.value?.totalBytes || 0) / 1024 / 1024) }) : o.t("演示包地址未配置，请联系管理员"));
    async function Ml() {
      if (!Be.value) {
        Be.value = !0, tt.value = "";
        try {
          const t = await b().demoPackStatus();
          if (ve.value = t, t?.ok && !t.ready) {
            if (!t.baseUrl) {
              r.warn(o.t("演示包地址未配置，请联系管理员"));
              return;
            }
            tt.value = o.t("下载演示数据…");
            const n = await b().demoPackFetch();
            if (!n?.ok) {
              r.error(n?.error || o.t("演示数据下载失败"));
              return;
            }
            ve.value = n;
          }
          if (!await Ae()) return;
          const l = ke(o.t("演示成品"), await b().demoResult({ runId: A.value, outDir: w.value, mode: le.value }));
          u.value = l.archive, K.value = l.report, Object.assign(st, l.pdf || {}), Object.assign(rt, l.poster || {}), Object.assign(Ke, l.posterPreview || {}), B.value = l.speech || {}, U.value = l.videos || {}, de.value = l.mode || "clip", I.value = null;
          for (const n of s.value.metas)
            n.key !== "publish" && s.value.done(n.key, o.t("已载入演示成品"));
          pe.value.includes(R.value) || (R.value = pe.value[0] || R.value), await Me(), await X(), r.info(o.t("演示成品已就绪，可直接播放、下载或发布"));
        } catch (t) {
          r.error(De(t));
        } finally {
          Be.value = !1, tt.value = "";
        }
      }
    }
    async function ze(t = !1) {
      if (!u.value && k.value === "article" && (u.value = mn()), !u.value || !await Ae()) return !1;
      O.video = () => ze(t);
      const l = s.value.start("video");
      U.value = {}, I.value = null, me.value = null, P.value = null;
      try {
        const n = {};
        for (const N of $) n[N] = K.value?.[N]?.captions || [u.value.eventName[N], u.value.orgName[N]].filter(Boolean);
        const i = {};
        if (ye.value)
          for (const N of $) B.value[N] && (i[N] = B.value[N].path);
        const y = ke(o.t("短视频"), await b().video({ runId: A.value, outDir: w.value, items: Dt.value, mode: le.value, langs: Ve.value, archive: u.value, captions: n, narration: i, bgmMood: qe.value, contentPrompt: re.value, videoPrompt: ie.value, visuals: k.value === "article" ? "ai-text" : "materials", fallbackToPrebaked: t }));
        return U.value = y.items, me.value = y.prompts || null, de.value = y.mode || le.value, I.value = y.ai || null, s.value.done("video", zl(Object.keys(y.items).length, de.value, I.value), l), pe.value.includes(R.value) || (R.value = pe.value[0] || R.value), await Me(), await X(), !0;
      } catch (n) {
        return s.value.fail("video", n, l), !1;
      }
    }
    function zl(t, l, n) {
      if (n?.fallbackReason) return o.t("{n} 个语言版本成片完成 · 已改用素材剪辑版（{why}）", { n: t, why: n.fallbackReason });
      if (l !== "ai" || !n) return o.t("{n} 个语言版本成片完成", { n: t });
      const i = n.shots.filter((y) => y.source !== "fal").map((y) => y.index);
      return i.length ? o.t("{n} 个语言版本 AI 增强版完成 · 第 {shots} 镜回退本地推拉", { n: t, shots: i.join(o.listSeparator()) }) : o.t("{n} 个语言版本 AI 增强版完成 · {k} 个动态镜头", { n: t, k: n.shots.length });
    }
    async function Fl() {
      if (!Ne.value) {
        Ne.value = !0;
        try {
          for (const t of ["material", "report", "speech", "video"]) s.value.reset(t);
          if (!u.value || u.value.source === "vlm" ? await dt(!0) : s.value.done("material", o.t("已探测 {n} 个素材，档案就绪：{ev}", { n: T.value.filter((t) => t.ok).length, ev: o.pickContentLang(u.value.eventName) })), s.value.runtime.material.state === "failed" || !await Se(!0) || (Qe(), !await vt(!0))) return;
          ye.value = !0, le.value = "ai", await ze(!0);
        } finally {
          Ne.value = !1;
        }
      }
    }
    async function fe() {
      A.value && await b().cancel({ runId: A.value }), wl();
      for (const t of s.value.metas) s.value.runtime[t.key].state === "running" && s.value.fail(t.key, o.t("已停止"));
    }
    async function X() {
      if (M.value)
        try {
          const t = await b().history({ dir: M.value });
          Je.value = t?.runs || [];
        } catch {
          Je.value = [];
        }
    }
    async function kt(t) {
      const l = /\.mp4$/i.test(t) ? "video" : /\.mp3$/i.test(t) ? "audio" : /\.pdf$/i.test(t) ? "pdf" : "image", n = await b().fileUrl({ path: t, kind: l });
      if (!n?.ok) {
        r.error(n?.error || o.t("文件已不存在")), await X();
        return;
      }
      ue.openPath(t);
    }
    async function Ft(t, l, n, i) {
      const y = await b().fileUrl({ path: n, kind: "video" });
      if (!y?.ok || !y.url) {
        r.error(y?.error || o.t("文件已不存在")), await X();
        return;
      }
      q.value = { path: n, lang: l, runId: t.runId, archive: t.archive, mode: i }, R.value = l, Y.value = "", await Me(), s.value.reset("publish"), nt("publish");
    }
    function Wl() {
      q.value = null, R.value = pe.value[0] || R.value, Y.value = "", Me();
    }
    async function Wt(t, l) {
      const n = await b().fileUrl({ path: t, kind: "video" });
      if (!n?.ok || !n.url) {
        r.error(n?.error || o.t("文件已不存在")), await X();
        return;
      }
      Xe.value = l, Le.value = n.url;
    }
    let It = null;
    return e.onMounted(async () => {
      It = b()?.onEvent?.(_) || null;
      try {
        Z.value = await b().prebaked();
      } catch {
        Z.value = null;
      }
      try {
        ve.value = await b().demoPackStatus();
      } catch {
        ve.value = null;
      }
    }), e.onBeforeUnmount(() => {
      It?.();
    }), (t, l) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        class: e.normalizeClass(["cc-workbench", { "reduced-motion": e.unref(f) }])
      },
      [
        e.createCommentVNode(" Hero "),
        e.createElementVNode("header", ka, [
          e.createVNode(Rl),
          l[42] || (l[42] = e.createElementVNode(
            "div",
            {
              class: "cc-hero__glow",
              "aria-hidden": "true"
            },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", ga, [
            e.createElementVNode("p", ha, [
              l[40] || (l[40] = e.createElementVNode(
                "i",
                { class: "ri-heart-3-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("公益传播 · 项目工作台")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(t.$t("慈善活动内容工场")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              ya,
              e.toDisplayString(v.value.hint),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Va, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(s.value.metas, (n, i) => (e.openBlock(), e.createElementBlock(
                  "span",
                  {
                    key: n.key,
                    class: e.normalizeClass(["cc-hero__chip", s.value.runtime[n.key].state])
                  },
                  [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(n.icon)
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(n.title),
                      1
                      /* TEXT */
                    ),
                    i < s.value.metas.length - 1 ? (e.openBlock(), e.createElementBlock("i", Na)) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          e.createElementVNode("div", Ea, [
            e.createVNode(Zt, { "solution-id": "workbench-charity-content" }),
            k.value === "event" ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "cc-btn hero",
              disabled: Ne.value || s.value.isRunning() || !be.value,
              title: be.value ? "" : t.$t("先放进素材"),
              onClick: Fl
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(Ne.value ? "ri-loader-4-line cc-spin" : "ri-play-circle-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(Ne.value ? t.$t("一键流程进行中…") : t.$t("一键完整流程")),
                1
                /* TEXT */
              )
            ], 8, ba)) : e.createCommentVNode("v-if", !0),
            k.value === "event" && Z.value?.available && !be.value ? (e.openBlock(), e.createElementBlock("button", {
              key: 1,
              type: "button",
              class: "cc-btn ghost",
              onClick: _l
            }, [
              l[41] || (l[41] = e.createElementVNode(
                "i",
                { class: "ri-folder-download-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("载入演示素材")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createCommentVNode(`
          演示现场最常用的一条：不跑任何生成，直接摆出一整套真跑出来的成品。
          讲解的人没有十分钟等真跑，而这些报告 / 海报 / 语音 / 成片本来就是真跑的产物。
        `),
            e.createElementVNode("button", {
              type: "button",
              class: "cc-btn hero",
              disabled: Be.value || s.value.isRunning(),
              title: Ol.value,
              onClick: Ml
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(Be.value ? "ri-loader-4-line cc-spin" : "ri-flashlight-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(Be.value ? tt.value || t.$t("准备演示成品…") : t.$t("直接出演示成品")),
                1
                /* TEXT */
              )
            ], 8, _a)
          ])
        ]),
        e.createCommentVNode(`
      先选制作方向。两条线是隔离的：只想给一篇项目说明配音出片时，不该被迫先传现场素材走报告。
      切线会换掉下面整条步骤链（各自的进度、各自的产物），已跑出来的东西留在原地不清。
    `),
        e.createElementVNode("nav", {
          class: "cc-lines",
          role: "tablist",
          "aria-label": t.$t("制作方向")
        }, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(d), (n) => (e.openBlock(), e.createElementBlock("button", {
              key: n.key,
              type: "button",
              role: "tab",
              class: e.normalizeClass(["cc-line", { active: k.value === n.key }]),
              "aria-selected": k.value === n.key ? "true" : "false",
              disabled: s.value.isRunning(),
              title: s.value.isRunning() ? t.$t("当前步骤进行中，结束后可切换") : "",
              onClick: (i) => L(n.key)
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(n.icon)
                },
                null,
                2
                /* CLASS */
              ),
              e.createElementVNode("span", $a, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(n.title),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(n.hint),
                  1
                  /* TEXT */
                )
              ])
            ], 10, Ba))),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 8, Sa),
        e.createCommentVNode(" 没有任何 fal key（本地没填、管理员也没为本方案下发）时的顶部提示；AI 步骤照常能跑，只是走回退 "),
        e.createVNode(Zt, {
          "solution-id": "workbench-charity-content",
          variant: "banner",
          "fallback-hint": t.$t("未配置时各步自动回退：短视频出素材剪辑版、语音用标准音质（备用）、看图用默认模型。")
        }, null, 8, ["fallback-hint"]),
        e.createVNode(ql, {
          metas: s.value.metas,
          runtime: s.value.runtime,
          "current-key": s.value.currentKey.value,
          live: P.value,
          onJump: e.unref(nt),
          onCancel: fe
        }, null, 8, ["metas", "runtime", "current-key", "live", "onJump"]),
        e.createCommentVNode(`
      换页 / 重进后发现主进程里上一次的运行还在跑（本组件的状态是组件内的，runId 随卸载丢了）：
      从事件里认领那个 runId，至少让人知道「它还在后台跑」并且能把它停掉，不至于以为卡死又点一轮。
    `),
        V.value ? (e.openBlock(), e.createElementBlock("div", Da, [
          l[44] || (l[44] = e.createElementVNode(
            "i",
            { class: "ri-loader-4-line cc-spin" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode(
            "span",
            Ca,
            e.toDisplayString(t.$t("上一次的运行仍在后台进行：{p0}", { p0: V.value.msg || V.value.step })),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "cc-btn sm ghost",
            disabled: C.value,
            onClick: j
          }, [
            l[43] || (l[43] = e.createElementVNode(
              "i",
              { class: "ri-stop-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("停止")),
              1
              /* TEXT */
            )
          ], 8, wa)
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", Ta, [
          e.createCommentVNode(" ── 第 1 步：上传素材 + 活动档案 ── "),
          k.value === "event" ? (e.openBlock(), e.createBlock(Fe, {
            key: 0,
            "step-key": "material",
            index: S("material"),
            title: p("material").title,
            hint: p("material").hint,
            icon: p("material").icon,
            runtime: s.value.runtime.material,
            "is-current": s.value.currentKey.value === "material",
            retry: O.material,
            cancel: fe
          }, {
            tools: e.withCtx(() => [
              M.value ? (e.openBlock(), e.createElementBlock("span", {
                key: 0,
                class: "cc-path",
                title: M.value
              }, [
                l[45] || (l[45] = e.createElementVNode(
                  "i",
                  { class: "ri-folder-3-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "bdi",
                  Aa,
                  e.toDisplayString(M.value),
                  1
                  /* TEXT */
                )
              ], 8, La)) : e.createCommentVNode("v-if", !0),
              M.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "cc-btn sm ghost",
                onClick: yl
              }, [
                l[46] || (l[46] = e.createElementVNode(
                  "i",
                  { class: "ri-external-link-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("输出目录")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            default: e.withCtx(() => [
              e.createVNode(Fn, {
                items: T.value,
                disabled: s.value.isRunning(),
                onPickDir: Vl,
                onPickFiles: Nl,
                onDropped: El,
                onRemove: bl
              }, null, 8, ["items", "disabled"]),
              T.value.length ? (e.openBlock(), e.createElementBlock("p", Pa, [
                l[47] || (l[47] = e.createElementVNode(
                  "i",
                  { class: "ri-information-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("{img} 张照片 · {vid} 段视频 · {pdf} 份 PDF；输出到 {out}", { img: Ye("image"), vid: Ye("video"), pdf: Ye("pdf"), out: e.unref(dn)(w.value) })),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createVNode(Qt, {
                modelValue: e.unref(re),
                "onUpdate:modelValue": l[0] || (l[0] = (n) => e.isRef(re) ? re.value = n : null),
                kind: "content",
                "default-value": e.unref(Bt).defaultValue,
                icon: "ri-quill-pen-line",
                disabled: s.value.isRunning(),
                label: t.$t("内容提示词"),
                hint: t.$t("讲什么：看图描述的侧重点、报告与海报文案、第 3 步默认旁白都按它写；数字仍只用活动档案")
              }, null, 8, ["modelValue", "default-value", "disabled", "label", "hint"]),
              e.createElementVNode("section", Oa, [
                e.createElementVNode("header", Ma, [
                  e.createElementVNode("strong", null, [
                    l[48] || (l[48] = e.createElementVNode(
                      "i",
                      { class: "ri-profile-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("活动档案")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "span",
                    za,
                    e.toDisplayString(t.$t("报告、海报、旁白里的数字只来自这里；视觉模型先起草，你可以随时改。")),
                    1
                    /* TEXT */
                  ),
                  l[51] || (l[51] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  u.value ? (e.openBlock(), e.createElementBlock(
                    "span",
                    {
                      key: 0,
                      class: e.normalizeClass(["cc-chip", u.value.source === "vlm" ? "ok" : u.value.source === "demo" ? "info" : ""])
                    },
                    e.toDisplayString(u.value.source === "vlm" ? t.$t("视觉模型草案") : u.value.source === "demo" ? t.$t("演示档案") : t.$t("手工填写")),
                    3
                    /* TEXT, CLASS */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "cc-btn sm primary",
                    disabled: !Ye("image") || s.value.isRunning(),
                    onClick: l[1] || (l[1] = (n) => dt())
                  }, [
                    l[49] || (l[49] = e.createElementVNode(
                      "i",
                      { class: "ri-eye-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(u.value ? t.$t("重新识别") : t.$t("看图生成档案")),
                      1
                      /* TEXT */
                    )
                  ], 8, Fa),
                  Z.value?.archive ? (e.openBlock(), e.createElementBlock("button", {
                    key: 1,
                    type: "button",
                    class: "cc-btn sm ghost",
                    disabled: s.value.isRunning(),
                    onClick: l[2] || (l[2] = (n) => u.value = Lt(Z.value.archive))
                  }, [
                    l[50] || (l[50] = e.createElementVNode(
                      "i",
                      { class: "ri-archive-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("用演示档案")),
                      1
                      /* TEXT */
                    )
                  ], 8, Wa)) : e.createCommentVNode("v-if", !0)
                ]),
                s.value.runtime.material.state === "running" && !u.value ? (e.openBlock(), e.createElementBlock("div", Ia, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(6, (n) => e.createElementVNode("span", { key: n })),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])) : u.value ? (e.openBlock(), e.createElementBlock("div", Ra, [
                  e.createVNode(Vt, {
                    modelValue: D.value,
                    "onUpdate:modelValue": l[3] || (l[3] = (n) => D.value = n)
                  }, null, 8, ["modelValue"]),
                  e.createElementVNode("div", {
                    class: "cc-form",
                    dir: e.unref($e)[D.value]
                  }, [
                    e.createElementVNode("label", Ua, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("机构名")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": l[4] || (l[4] = (n) => u.value.orgName[D.value] = n),
                        type: "text",
                        lang: D.value
                      }, null, 8, ja), [
                        [e.vModelText, u.value.orgName[D.value]]
                      ])
                    ]),
                    e.createElementVNode("label", xa, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("活动名")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": l[5] || (l[5] = (n) => u.value.eventName[D.value] = n),
                        type: "text",
                        lang: D.value
                      }, null, 8, Ha), [
                        [e.vModelText, u.value.eventName[D.value]]
                      ])
                    ]),
                    e.createElementVNode("label", Ga, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("地点")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": l[6] || (l[6] = (n) => u.value.location[D.value] = n),
                        type: "text",
                        lang: D.value
                      }, null, 8, qa), [
                        [e.vModelText, u.value.location[D.value]]
                      ])
                    ]),
                    e.createElementVNode("label", Ja, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("主办方")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": l[7] || (l[7] = (n) => u.value.organizer[D.value] = n),
                        type: "text",
                        lang: D.value
                      }, null, 8, Xa), [
                        [e.vModelText, u.value.organizer[D.value]]
                      ])
                    ]),
                    e.createElementVNode("label", Ya, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("一句话简介")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("textarea", {
                        "onUpdate:modelValue": l[8] || (l[8] = (n) => u.value.summary[D.value] = n),
                        rows: "2",
                        lang: D.value
                      }, null, 8, Qa), [
                        [e.vModelText, u.value.summary[D.value]]
                      ])
                    ])
                  ], 8, Ka),
                  e.createElementVNode("div", Za, [
                    e.createElementVNode("label", eo, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("日期")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": l[9] || (l[9] = (n) => u.value.date = n),
                          type: "date"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, u.value.date]
                      ])
                    ]),
                    e.createElementVNode("label", to, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("参与人数")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("input", {
                        value: u.value.participants ?? "",
                        type: "number",
                        min: "0",
                        placeholder: t.$t("未披露"),
                        onInput: l[10] || (l[10] = (n) => u.value.participants = hl(n.target.value))
                      }, null, 40, lo)
                    ]),
                    e.createElementVNode("label", no, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("善款金额")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": l[11] || (l[11] = (n) => u.value.donation = n),
                          type: "text",
                          placeholder: "SAR 120,000"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, u.value.donation]
                      ])
                    ])
                  ])
                ])) : (e.openBlock(), e.createElementBlock("p", ao, [
                  l[52] || (l[52] = e.createElementVNode(
                    "i",
                    { class: "ri-lightbulb-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("放进照片后点「看图生成档案」，或直接用演示档案。")),
                    1
                    /* TEXT */
                  )
                ]))
              ]),
              e.createElementVNode("div", oo, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "cc-btn primary lg",
                  disabled: !be.value || !e.unref(Gt)(u.value) || s.value.isRunning(),
                  onClick: l[12] || (l[12] = (n) => Se())
                }, [
                  l[53] || (l[53] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("下一步：整理与报告")),
                    1
                    /* TEXT */
                  )
                ], 8, so)
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["index", "title", "hint", "icon", "runtime", "is-current", "retry"])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" ── 第 2 步：整理与报告 ── "),
          k.value === "event" ? (e.openBlock(), e.createBlock(Fe, {
            key: 1,
            "step-key": "report",
            index: S("report"),
            title: p("report").title,
            hint: p("report").hint,
            icon: p("report").icon,
            runtime: s.value.runtime.report,
            "is-current": s.value.currentKey.value === "report",
            retry: O.report,
            cancel: fe
          }, {
            tools: e.withCtx(() => [
              e.createElementVNode("button", {
                type: "button",
                class: "cc-btn sm",
                disabled: !be.value || !e.unref(Gt)(u.value) || s.value.isRunning(),
                onClick: l[13] || (l[13] = (n) => Se())
              }, [
                l[54] || (l[54] = e.createElementVNode(
                  "i",
                  { class: "ri-refresh-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(K.value ? t.$t("重新生成") : t.$t("生成")),
                  1
                  /* TEXT */
                )
              ], 8, ro)
            ]),
            default: e.withCtx(() => [
              we(s.value.runtime.report.error) || we(s.value.runtime.material.error) ? (e.openBlock(), e.createElementBlock("p", io, [
                l[56] || (l[56] = e.createElementVNode(
                  "i",
                  { class: "ri-cpu-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("还没有默认模型：报告与看图都要用它。")) + " ",
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "cc-btn sm primary",
                  onClick: rl
                }, [
                  l[55] || (l[55] = e.createElementVNode(
                    "i",
                    { class: "ri-settings-3-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("去设置 → 模型")),
                    1
                    /* TEXT */
                  )
                ])
              ])) : e.createCommentVNode("v-if", !0),
              oe.value && s.value.runtime.report.state !== "running" ? (e.openBlock(), e.createElementBlock("p", co, [
                l[57] || (l[57] = e.createElementVNode(
                  "i",
                  { class: "ri-eye-off-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(oe.value),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              s.value.runtime.report.state === "running" ? (e.openBlock(), e.createElementBlock("div", uo, [
                e.createElementVNode("div", mo, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(3, (n) => e.createElementVNode("span", {
                      key: n,
                      class: "tile"
                    })),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(5, (n) => e.createElementVNode(
                    "span",
                    {
                      key: "l" + n,
                      class: "line",
                      style: e.normalizeStyle({ width: `${92 - n * 9}%` })
                    },
                    null,
                    4
                    /* STYLE */
                  )),
                  64
                  /* STABLE_FRAGMENT */
                )),
                e.createElementVNode("p", po, [
                  l[58] || (l[58] = e.createElementVNode(
                    "i",
                    { class: "ri-loader-4-line cc-spin" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(P.value?.msg || t.$t("准备中…")),
                    1
                    /* TEXT */
                  )
                ])
              ])) : K.value ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 3 },
                [
                  e.createElementVNode("section", vo, [
                    e.createElementVNode("header", fo, [
                      e.createElementVNode("strong", null, [
                        l[59] || (l[59] = e.createElementVNode(
                          "i",
                          { class: "ri-image-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("素材整理")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "span",
                        ko,
                        e.toDisplayString(Q.value.length ? t.$t("{n} 个素材已生成画面描述（视频按每 10 秒抽帧）", { n: Q.value.length }) : t.$t("本次没有画面描述，报告只依据活动档案撰写")),
                        1
                        /* TEXT */
                      ),
                      l[60] || (l[60] = e.createElementVNode(
                        "span",
                        { class: "grow" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createVNode(Vt, {
                        modelValue: E.value,
                        "onUpdate:modelValue": l[14] || (l[14] = (n) => E.value = n)
                      }, null, 8, ["modelValue"])
                    ]),
                    Q.value.length ? (e.openBlock(), e.createElementBlock("ul", go, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(Q.value, (n) => (e.openBlock(), e.createElementBlock("li", {
                          key: n.path
                        }, [
                          wt(n.path) ? (e.openBlock(), e.createElementBlock("img", {
                            key: 0,
                            src: wt(n.path),
                            alt: ""
                          }, null, 8, ho)) : (e.openBlock(), e.createElementBlock("span", yo, [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(n.kind === "video" ? "ri-film-line" : "ri-image-line")
                              },
                              null,
                              2
                              /* CLASS */
                            )
                          ])),
                          e.createElementVNode("div", {
                            dir: e.unref($e)[E.value],
                            lang: E.value
                          }, [
                            e.createElementVNode("small", null, [
                              e.createTextVNode(
                                e.toDisplayString(Tt(n.path)),
                                1
                                /* TEXT */
                              ),
                              n.frames?.length ? (e.openBlock(), e.createElementBlock(
                                e.Fragment,
                                { key: 0 },
                                [
                                  e.createTextVNode(
                                    " · " + e.toDisplayString(t.$t("{n} 帧", { n: n.frames.length })),
                                    1
                                    /* TEXT */
                                  )
                                ],
                                64
                                /* STABLE_FRAGMENT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]),
                            l[62] || (l[62] = e.createTextVNode()),
                            n.unrecognized ? (e.openBlock(), e.createElementBlock("span", {
                              key: 0,
                              class: "cc-chip warn",
                              title: t.$t("模型回复无法解析，这里先用活动档案信息代替；报告不会采用这条描述")
                            }, [
                              l[61] || (l[61] = e.createElementVNode(
                                "i",
                                { class: "ri-question-line" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(t.$t("未识别")),
                                1
                                /* TEXT */
                              )
                            ], 8, No)) : e.createCommentVNode("v-if", !0),
                            e.createElementVNode(
                              "p",
                              null,
                              e.toDisplayString(n.description[E.value]),
                              1
                              /* TEXT */
                            )
                          ], 8, Vo)
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("section", Eo, [
                    e.createElementVNode("header", bo, [
                      e.createElementVNode("strong", null, [
                        l[63] || (l[63] = e.createElementVNode(
                          "i",
                          { class: "ri-file-text-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("活动报告")),
                          1
                          /* TEXT */
                        )
                      ]),
                      l[64] || (l[64] = e.createElementVNode(
                        "span",
                        { class: "grow" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createVNode(Vt, {
                        modelValue: E.value,
                        "onUpdate:modelValue": l[15] || (l[15] = (n) => E.value = n)
                      }, null, 8, ["modelValue"])
                    ]),
                    e.createElementVNode("div", _o, [
                      e.createElementVNode("article", {
                        class: "cc-report__text",
                        dir: e.unref($e)[E.value],
                        lang: E.value
                      }, [
                        e.createElementVNode(
                          "h3",
                          null,
                          e.toDisplayString(K.value[E.value].title),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "h4",
                          null,
                          e.toDisplayString(t.$t("活动概况")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "p",
                          null,
                          e.toDisplayString(K.value[E.value].overview),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "h4",
                          null,
                          e.toDisplayString(t.$t("活动亮点")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("ul", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(K.value[E.value].highlights, (n, i) => (e.openBlock(), e.createElementBlock(
                              "li",
                              { key: i },
                              e.toDisplayString(n),
                              1
                              /* TEXT */
                            ))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ]),
                        e.createElementVNode(
                          "h4",
                          null,
                          e.toDisplayString(t.$t("现场回顾")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "p",
                          null,
                          e.toDisplayString(K.value[E.value].scene),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "h4",
                          null,
                          e.toDisplayString(t.$t("致谢")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "p",
                          null,
                          e.toDisplayString(K.value[E.value].thanks),
                          1
                          /* TEXT */
                        )
                      ], 8, So),
                      e.createElementVNode("aside", Bo, [
                        e.createElementVNode(
                          "div",
                          {
                            class: e.normalizeClass(["cc-pdfpage", { rtl: E.value === "ar" }])
                          },
                          [
                            it[E.value] ? (e.openBlock(), e.createElementBlock("img", {
                              key: 0,
                              src: it[E.value],
                              alt: t.$t("报告首页")
                            }, null, 8, $o)) : (e.openBlock(), e.createElementBlock("span", Do, [...l[65] || (l[65] = [
                              e.createElementVNode(
                                "i",
                                { class: "ri-file-pdf-2-line" },
                                null,
                                -1
                                /* CACHED */
                              ),
                              e.createTextVNode(
                                "PDF",
                                -1
                                /* CACHED */
                              )
                            ])]))
                          ],
                          2
                          /* CLASS */
                        ),
                        e.createVNode(lt, {
                          path: st[E.value],
                          label: `report-${E.value}.pdf`,
                          onRegen: l[16] || (l[16] = (n) => Se())
                        }, null, 8, ["path", "label"])
                      ])
                    ])
                  ]),
                  e.createElementVNode("section", Co, [
                    e.createElementVNode("header", wo, [
                      e.createElementVNode("strong", null, [
                        l[66] || (l[66] = e.createElementVNode(
                          "i",
                          { class: "ri-layout-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("宣传海报 9:16")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "span",
                        To,
                        e.toDisplayString(t.$t("素材照片做背景；点卡片翻面看三语版本")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", Lo, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref($), (n) => (e.openBlock(), e.createElementBlock("div", {
                          key: n,
                          class: e.normalizeClass(["cc-poster", { flipped: ct[n] }]),
                          onClick: (i) => ct[n] = !ct[n]
                        }, [
                          e.createElementVNode("div", Po, [
                            e.createElementVNode("div", Oo, [
                              Ke[n] ? (e.openBlock(), e.createElementBlock("img", {
                                key: 0,
                                src: Ke[n],
                                alt: e.unref(z)[n]
                              }, null, 8, Mo)) : e.createCommentVNode("v-if", !0),
                              e.createElementVNode("span", {
                                class: "cc-poster__tag",
                                lang: n
                              }, e.toDisplayString(e.unref(z)[n]), 9, zo)
                            ]),
                            e.createElementVNode("div", {
                              class: "cc-poster__face back",
                              dir: e.unref($e)[n],
                              lang: n
                            }, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(u.value?.eventName[n]),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "span",
                                null,
                                e.toDisplayString(u.value?.orgName[n]),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(u.value?.date) + " · " + e.toDisplayString(u.value?.location[n]),
                                1
                                /* TEXT */
                              ),
                              e.createVNode(lt, {
                                path: rt[n],
                                label: `poster-${n}.jpg`,
                                compact: "",
                                onRegen: l[17] || (l[17] = (i) => Se()),
                                onClick: l[18] || (l[18] = e.withModifiers(() => {
                                }, ["stop"]))
                              }, null, 8, ["path", "label"])
                            ], 8, Fo)
                          ])
                        ], 10, Ao))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : (e.openBlock(), e.createElementBlock("p", Wo, [
                l[67] || (l[67] = e.createElementVNode(
                  "i",
                  { class: "ri-lightbulb-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("第 1 步准备好素材与档案后，这里会生成画面描述、三语报告 PDF 和海报。")),
                  1
                  /* TEXT */
                )
              ])),
              K.value ? (e.openBlock(), e.createElementBlock("div", Io, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "cc-btn primary lg",
                  disabled: s.value.isRunning(),
                  onClick: l[19] || (l[19] = (n) => {
                    Qe(), vt();
                  })
                }, [
                  l[68] || (l[68] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("下一步：报告摘要转语音")),
                    1
                    /* TEXT */
                  )
                ], 8, Ro)
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            _: 1
            /* STABLE */
          }, 8, ["index", "title", "hint", "icon", "runtime", "is-current", "retry"])) : e.createCommentVNode("v-if", !0),
          e.createCommentVNode(" ── 第 3 步：文章转语音 ── "),
          e.createVNode(Fe, {
            "step-key": "speech",
            index: S("speech"),
            title: p("speech").title,
            hint: p("speech").hint,
            icon: p("speech").icon,
            runtime: s.value.runtime.speech,
            "is-current": s.value.currentKey.value === "speech",
            retry: O.speech,
            cancel: fe
          }, {
            default: e.withCtx(() => [
              e.createElementVNode("section", Ko, [
                e.createElementVNode("header", Uo, [
                  e.createElementVNode("strong", null, [
                    l[69] || (l[69] = e.createElementVNode(
                      "i",
                      { class: "ri-text" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("朗读来源")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", jo, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(il.value, (n) => (e.openBlock(), e.createElementBlock("button", {
                        key: n.key,
                        type: "button",
                        class: e.normalizeClass(["cc-seg__btn", { active: Ue.value === n.key }]),
                        onClick: (i) => {
                          Ue.value = n.key, n.key === "summary" && Qe();
                        }
                      }, e.toDisplayString(n.label), 11, xo))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]),
                  l[71] || (l[71] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("span", Ho, [
                    l[70] || (l[70] = e.createElementVNode(
                      "i",
                      { class: "ri-hd-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("高保真 · MiniMax speech-02-hd（fal）")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                Ue.value === "pdf" ? (e.openBlock(), e.createElementBlock("div", Go, [
                  e.createCommentVNode(" event 线从已上传素材里挑；article 线没有素材清单，直接选本机文件 "),
                  k.value === "event" ? e.withDirectives((e.openBlock(), e.createElementBlock(
                    "select",
                    {
                      key: 0,
                      "onUpdate:modelValue": l[20] || (l[20] = (n) => te.value = n),
                      class: "cc-select"
                    },
                    [
                      e.createElementVNode(
                        "option",
                        qo,
                        e.toDisplayString(t.$t("选择素材里的 PDF…")),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(T.value.filter((n) => n.kind === "pdf"), (n) => (e.openBlock(), e.createElementBlock("option", {
                          key: n.path,
                          value: n.path
                        }, e.toDisplayString(n.name), 9, Jo))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ],
                    512
                    /* NEED_PATCH */
                  )), [
                    [e.vModelSelect, te.value]
                  ]) : (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "cc-btn sm",
                        disabled: Te.value,
                        onClick: Sl
                      }, [
                        l[72] || (l[72] = e.createElementVNode(
                          "i",
                          { class: "ri-file-upload-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("选择 PDF 文件")),
                          1
                          /* TEXT */
                        )
                      ], 8, Xo),
                      te.value ? (e.openBlock(), e.createElementBlock("span", {
                        key: 0,
                        class: "cc-path",
                        title: te.value
                      }, [
                        e.createElementVNode(
                          "bdi",
                          Qo,
                          e.toDisplayString(te.value.split("/").pop()),
                          1
                          /* TEXT */
                        )
                      ], 8, Yo)) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )),
                  e.createElementVNode("label", Zo, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("取前")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": l[21] || (l[21] = (n) => ut.value = n),
                        type: "number",
                        min: "1",
                        max: "10",
                        style: { width: "64px" }
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        ut.value,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("页有文字的页")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "cc-btn sm primary",
                    disabled: !te.value || Te.value,
                    onClick: At
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(Te.value ? "ri-loader-4-line cc-spin" : "ri-file-search-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("抽取文字")),
                      1
                      /* TEXT */
                    )
                  ], 8, es),
                  Ge.value ? (e.openBlock(), e.createElementBlock(
                    "small",
                    ts,
                    e.toDisplayString(Ge.value),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0),
                e.createCommentVNode(" 文稿在上，生成配置紧贴按钮：从上往下就是「要读什么 → 读成什么 → 开始生成」 "),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": l[22] || (l[22] = (n) => se.value = n),
                  class: "cc-textarea",
                  rows: "5",
                  dir: e.unref($e)[je.value],
                  lang: je.value,
                  placeholder: t.$t("要朗读的文稿（粘贴 / 抽取 / 取报告摘要）")
                }, null, 8, ls), [
                  [e.vModelText, se.value]
                ]),
                He.value ? (e.openBlock(), e.createElementBlock("p", ns, [
                  l[73] || (l[73] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
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
                e.createElementVNode("div", as, [
                  e.createElementVNode("div", os, [
                    e.createElementVNode(
                      "span",
                      ss,
                      e.toDisplayString(t.$t("目标语言")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", {
                      class: "cc-langs",
                      role: "group",
                      "aria-label": t.$t("目标语言")
                    }, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref($), (n) => (e.openBlock(), e.createElementBlock("button", {
                          key: n,
                          type: "button",
                          class: e.normalizeClass(["cc-lang", { active: W.value.includes(n), done: !!B.value[n] }]),
                          "aria-pressed": W.value.includes(n) ? "true" : "false",
                          lang: n,
                          onClick: (i) => cl(n)
                        }, [
                          e.createTextVNode(
                            e.toDisplayString(e.unref(z)[n]),
                            1
                            /* TEXT */
                          ),
                          B.value[n] ? (e.openBlock(), e.createElementBlock("i", {
                            key: 0,
                            class: "ri-check-line",
                            title: t.$t("已合成")
                          }, null, 8, cs)) : e.createCommentVNode("v-if", !0)
                        ], 10, is))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 8, rs),
                    St.value.length ? (e.openBlock(), e.createElementBlock(
                      "small",
                      us,
                      e.toDisplayString(t.$t("{langs} 会先从文稿转译再配音", { langs: St.value.map((n) => e.unref(z)[n]).join(e.unref(o.listSeparator)()) })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createCommentVNode(" 每种选中的语言各自定性别与音色：中文要男声、阿语要女声是常见需求 "),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(W.value, (n) => (e.openBlock(), e.createElementBlock("div", {
                      key: n,
                      class: "cc-voice-pick__row"
                    }, [
                      e.createElementVNode("span", {
                        class: "cc-voice-pick__label",
                        lang: n
                      }, e.toDisplayString(e.unref(z)[n]), 9, ds),
                      e.createElementVNode("div", {
                        class: "cc-seg",
                        role: "radiogroup",
                        "aria-label": t.$t("声音性别")
                      }, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(ul.value, (i) => (e.openBlock(), e.createElementBlock("button", {
                            key: i.key,
                            type: "button",
                            role: "radio",
                            class: e.normalizeClass(["cc-seg__btn", { active: he[n] === i.key }]),
                            "aria-checked": he[n] === i.key,
                            "data-gender": i.key,
                            onClick: (y) => dl(n, i.key)
                          }, e.toDisplayString(i.label), 11, ps))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ], 8, ms),
                      e.withDirectives(e.createElementVNode("select", {
                        "onUpdate:modelValue": (i) => xe[n] = i,
                        class: "cc-select",
                        "aria-label": t.$t("声音音色")
                      }, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(e.unref(ol)()[n][he[n]], (i) => (e.openBlock(), e.createElementBlock("option", {
                            key: i.id,
                            value: i.id
                          }, e.toDisplayString(i.label), 9, fs))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ], 8, vs), [
                        [e.vModelSelect, xe[n]]
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", ks, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "cc-btn primary lg",
                    disabled: !se.value.trim() || !W.value.length || s.value.isRunning(),
                    onClick: l[23] || (l[23] = (n) => Pt())
                  }, [
                    l[74] || (l[74] = e.createElementVNode(
                      "i",
                      { class: "ri-mic-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(W.value.length ? t.$t("合成 {langs} 语音", { langs: W.value.map((n) => e.unref(z)[n]).join(e.unref(o.listSeparator)()) }) : t.$t("合成语音")),
                      1
                      /* TEXT */
                    )
                  ], 8, gs),
                  e.createElementVNode(
                    "small",
                    hs,
                    e.toDisplayString(t.$t("每次都按文稿框里当前的文字生成；与文稿语言不同的目标会先转译。视频配音用这里合成的语音")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              s.value.runtime.speech.state === "running" ? (e.openBlock(), e.createElementBlock("div", ys, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(3, (n) => e.createElementVNode("span", { key: n })),
                  64
                  /* STABLE_FRAGMENT */
                )),
                e.createElementVNode("p", Vs, [
                  l[75] || (l[75] = e.createElementVNode(
                    "i",
                    { class: "ri-loader-4-line cc-spin" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(P.value?.msg || t.$t("合成中…")),
                    1
                    /* TEXT */
                  )
                ])
              ])) : Object.keys(B.value).length ? (e.openBlock(), e.createElementBlock("section", Ns, [
                e.createElementVNode("header", Es, [
                  e.createElementVNode("strong", null, [
                    l[76] || (l[76] = e.createElementVNode(
                      "i",
                      { class: "ri-headphone-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("语音成品")),
                      1
                      /* TEXT */
                    )
                  ]),
                  l[78] || (l[78] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("label", bs, [
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": l[24] || (l[24] = (n) => ye.value = n),
                        type: "checkbox"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelCheckbox, ye.value]
                    ]),
                    l[77] || (l[77] = e.createElementVNode(
                      "span",
                      null,
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("作为视频配音")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("ul", _s, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref($).filter((n) => B.value[n]), (n) => (e.openBlock(), e.createElementBlock("li", {
                      key: n,
                      class: "cc-reveal"
                    }, [
                      e.createElementVNode("div", Ss, [
                        e.createElementVNode("strong", { lang: n }, e.toDisplayString(e.unref(z)[n]), 9, Bs),
                        e.createElementVNode("span", {
                          class: e.normalizeClass(["cc-chip", B.value[n].quality === "hd" ? "ok" : "warn"]),
                          title: B.value[n].quality === "hd" ? "" : t.$t("fal 不可用（未配置密钥 / 额度用尽 / 接口失败），已用本地 edge-tts 兜底")
                        }, e.toDisplayString(B.value[n].quality === "hd" ? t.$t("高保真") : t.$t("标准音质（备用）")), 11, $s),
                        e.createElementVNode(
                          "small",
                          Ds,
                          e.toDisplayString(B.value[n].voice) + " · " + e.toDisplayString(e.unref(Ce)(B.value[n].durationSec)),
                          1
                          /* TEXT */
                        )
                      ]),
                      B.value[n].dataUrl ? (e.openBlock(), e.createBlock(Kn, {
                        key: 0,
                        src: B.value[n].dataUrl
                      }, null, 8, ["src"])) : e.createCommentVNode("v-if", !0),
                      e.createVNode(lt, {
                        path: B.value[n].path,
                        label: `speech-${n}.mp3`,
                        compact: "",
                        onRegen: (i) => Ot(n)
                      }, null, 8, ["path", "label", "onRegen"])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : e.createCommentVNode("v-if", !0),
              Object.keys(B.value).length ? (e.openBlock(), e.createElementBlock("div", Cs, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "cc-btn primary lg",
                  disabled: s.value.isRunning() || !m.value,
                  onClick: l[25] || (l[25] = (n) => ze())
                }, [
                  l[79] || (l[79] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-right-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("下一步：生成宣传短视频")),
                    1
                    /* TEXT */
                  )
                ], 8, ws)
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            _: 1
            /* STABLE */
          }, 8, ["index", "title", "hint", "icon", "runtime", "is-current", "retry"]),
          e.createCommentVNode(" ── 第 4 步：宣传短视频 ── "),
          e.createVNode(Fe, {
            "step-key": "video",
            index: S("video"),
            title: p("video").title,
            hint: p("video").hint,
            icon: p("video").icon,
            runtime: s.value.runtime.video,
            "is-current": s.value.currentKey.value === "video",
            retry: O.video,
            cancel: fe
          }, {
            default: e.withCtx(() => [
              e.createElementVNode("section", Ts, [
                e.createElementVNode("header", Ls, [
                  e.createElementVNode("strong", null, [
                    l[80] || (l[80] = e.createElementVNode(
                      "i",
                      { class: "ri-clapperboard-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("成片方式")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("div", As, [
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: e.normalizeClass(["cc-mode", { active: le.value === "ai" }]),
                      onClick: l[26] || (l[26] = (n) => le.value = "ai")
                    },
                    [
                      l[82] || (l[82] = e.createElementVNode(
                        "i",
                        { class: "ri-movie-2-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(t.$t("AI 增强版")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(t.$t("fal 图生视频把照片变成 2–3 个动态镜头 + Stable Audio 配乐，再本地合成")),
                        1
                        /* TEXT */
                      ),
                      Z.value && Z.value.falReady === !1 ? (e.openBlock(), e.createElementBlock("small", Ps, [
                        l[81] || (l[81] = e.createElementVNode(
                          "i",
                          { class: "ri-error-warning-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          " " + e.toDisplayString(t.$t("未检测到 fal 密钥：生成时会自动改用素材剪辑版")),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode(
                        "span",
                        Os,
                        e.toDisplayString(t.$t("推荐")),
                        1
                        /* TEXT */
                      ),
                      l[83] || (l[83] = e.createElementVNode(
                        "span",
                        { class: "cc-mode__check" },
                        [
                          e.createElementVNode("i", { class: "ri-check-line" })
                        ],
                        -1
                        /* CACHED */
                      ))
                    ],
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: e.normalizeClass(["cc-mode", { active: le.value === "clip" }]),
                      onClick: l[27] || (l[27] = (n) => le.value = "clip")
                    },
                    [
                      l[84] || (l[84] = e.createElementVNode(
                        "i",
                        { class: "ri-scissors-cut-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(t.$t("素材剪辑版")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(t.$t("本地合成：照片缓推 + 视频片段 + 三语字幕 + 配音 + 配乐，时长跟随配音")),
                        1
                        /* TEXT */
                      ),
                      l[85] || (l[85] = e.createElementVNode(
                        "span",
                        { class: "cc-mode__check" },
                        [
                          e.createElementVNode("i", { class: "ri-check-line" })
                        ],
                        -1
                        /* CACHED */
                      ))
                    ],
                    2
                    /* CLASS */
                  )
                ]),
                e.createElementVNode("div", Ms, [
                  e.createElementVNode("div", zs, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("输出语言")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Fs, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref($), (n) => (e.openBlock(), e.createElementBlock("label", { key: n }, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": l[28] || (l[28] = (i) => Ve.value = i),
                            type: "checkbox",
                            value: n
                          }, null, 8, Ws), [
                            [e.vModelCheckbox, Ve.value]
                          ]),
                          e.createElementVNode("span", { lang: n }, e.toDisplayString(e.unref(z)[n]), 9, Is)
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]),
                  e.createElementVNode("label", Rs, [
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
                        "onUpdate:modelValue": l[29] || (l[29] = (n) => qe.value = n),
                        class: "cc-select"
                      },
                      [
                        e.createElementVNode(
                          "option",
                          Ks,
                          e.toDisplayString(t.$t("温暖")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "option",
                          Us,
                          e.toDisplayString(t.$t("希望")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "option",
                          js,
                          e.toDisplayString(t.$t("平静")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "option",
                          xs,
                          e.toDisplayString(t.$t("振奋")),
                          1
                          /* TEXT */
                        )
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelSelect, qe.value]
                    ])
                  ]),
                  e.createElementVNode("div", Hs, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("配音")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["cc-chip", ye.value && Object.keys(B.value).length ? "ok" : ""])
                      },
                      e.toDisplayString(ye.value && Object.keys(B.value).length ? t.$t("用第 3 步的语音（{n} 种语言）", { n: e.unref($).filter((n) => B.value[n]).length }) : t.$t("无配音（只字幕 + 配乐）")),
                      3
                      /* TEXT, CLASS */
                    )
                  ])
                ])
              ]),
              e.createVNode(Qt, {
                modelValue: e.unref(ie),
                "onUpdate:modelValue": l[30] || (l[30] = (n) => e.isRef(ie) ? ie.value = n : null),
                kind: "video",
                "default-value": e.unref($t).defaultValue,
                icon: "ri-movie-line",
                disabled: s.value.isRunning(),
                label: t.$t("视频提示词"),
                hint: t.$t("怎么拍：AI 镜头的画面风格、配乐、剪辑节奏与转场、片尾标语；与内容提示词合并成最终镜头提示词")
              }, {
                effective: e.withCtx(() => [
                  e.createElementVNode(
                    "p",
                    Gs,
                    e.toDisplayString(me.value ? t.$t("这是上一次生成实际送给模型的提示词") : t.$t("还没生成：下面是按当前两个提示词合并的预览")),
                    1
                    /* TEXT */
                  ),
                  (me.value ? me.value.condensed : vl.value) ? (e.openBlock(), e.createElementBlock("p", qs, [
                    l[86] || (l[86] = e.createElementVNode(
                      "i",
                      { class: "ri-compress-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(me.value ? t.$t("提示词较长，已先用文本模型浓缩成要点再拼进镜头与配乐提示词") : t.$t("提示词较长：生成时会先用文本模型浓缩成要点，再拼进镜头与配乐提示词（报告与旁白仍整段使用）")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("dl", Js, [
                    e.createElementVNode(
                      "dt",
                      null,
                      e.toDisplayString(t.$t("镜头提示词（内容要点 + 视觉风格）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "dd",
                      Xs,
                      e.toDisplayString(Ee.value.shot),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "dt",
                      null,
                      e.toDisplayString(t.$t("配乐提示词")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "dd",
                      Ys,
                      e.toDisplayString(Ee.value.music),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "dt",
                      null,
                      e.toDisplayString(t.$t("剪辑节奏与转场")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "dd",
                      null,
                      e.toDisplayString(kl(Ee.value.clipStyle.pace)) + " · " + e.toDisplayString(gl(Ee.value.clipStyle.transition)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "dt",
                      null,
                      e.toDisplayString(t.$t("片尾标语")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "dd",
                      Qs,
                      e.toDisplayString(fl.value || t.$t("无片尾")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["modelValue", "default-value", "disabled", "label", "hint"]),
              e.createElementVNode("div", Zs, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "cc-btn primary lg",
                  disabled: !m.value || !Ve.value.length || s.value.isRunning(),
                  onClick: l[31] || (l[31] = (n) => ze())
                }, [
                  l[87] || (l[87] = e.createElementVNode(
                    "i",
                    { class: "ri-film-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("生成短视频")),
                    1
                    /* TEXT */
                  )
                ], 8, er)
              ]),
              s.value.runtime.video.state === "running" ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.createVNode(ia, {
                    live: P.value,
                    "fallback-plan": e.unref(vn)[le.value === "ai" && Z.value?.falReady !== !1 ? "ai" : "clip"],
                    "lang-count": Ve.value.length,
                    onCancel: fe
                  }, null, 8, ["live", "fallback-plan", "lang-count"]),
                  e.createElementVNode("div", tr, [
                    e.createElementVNode("div", lr, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(Ve.value.length || 3, (n) => (e.openBlock(), e.createElementBlock("span", {
                          key: n,
                          class: "phone"
                        }))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : Object.keys(U.value).length ? (e.openBlock(), e.createElementBlock("section", nr, [
                e.createElementVNode("header", ar, [
                  e.createElementVNode("strong", null, [
                    l[88] || (l[88] = e.createElementVNode(
                      "i",
                      { class: "ri-movie-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("成片")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["cc-chip", de.value === "ai" ? "ok" : ""])
                    },
                    [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(de.value === "ai" ? "ri-movie-2-line" : "ri-scissors-cut-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("9:16 · {mode}", { mode: de.value === "ai" ? t.$t("AI 增强版") : t.$t("素材剪辑版") })),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  ),
                  l[90] || (l[90] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  I.value && I.value.estUsd > 0 ? (e.openBlock(), e.createElementBlock("span", {
                    key: 0,
                    class: "cc-chip info",
                    title: t.$t("按 fal 单价估算：动态镜头按秒计，配乐按次计；上传不计费")
                  }, [
                    l[89] || (l[89] = e.createElementVNode(
                      "i",
                      { class: "ri-coins-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("本次 fal 费用约 {usd} 美元", { usd: I.value.estUsd.toFixed(2) })),
                      1
                      /* TEXT */
                    )
                  ], 8, or)) : e.createCommentVNode("v-if", !0)
                ]),
                I.value?.fallbackReason ? (e.openBlock(), e.createElementBlock("p", sr, [
                  l[91] || (l[91] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("已改用素材剪辑版（{why}）", { why: I.value.fallbackReason })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                I.value && de.value === "ai" ? (e.openBlock(), e.createElementBlock("ul", rr, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(I.value.shots, (n) => (e.openBlock(), e.createElementBlock("li", {
                      key: n.index,
                      class: e.normalizeClass(n.source),
                      title: n.reason || ""
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(n.source === "fal" ? "ri-image-edit-line" : "ri-image-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        " " + e.toDisplayString(n.source === "fal" ? n.reused ? t.$t("镜头 {n} · AI 动态（复用）", { n: n.index }) : t.$t("镜头 {n} · AI 动态", { n: n.index }) : t.$t("镜头 {n} · 本地推拉（回退）", { n: n.index })) + " ",
                        1
                        /* TEXT */
                      ),
                      n.source !== "fal" && n.reason ? (e.openBlock(), e.createElementBlock(
                        "small",
                        cr,
                        e.toDisplayString(n.reason),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ], 10, ir))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  e.createElementVNode("li", {
                    class: e.normalizeClass(I.value.music.source === "fal" ? "" : "fallback"),
                    title: I.value.music.reason || ""
                  }, [
                    l[92] || (l[92] = e.createElementVNode(
                      "i",
                      { class: "ri-music-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(ml(I.value.music.source)) + " ",
                      1
                      /* TEXT */
                    ),
                    I.value.music.source !== "fal" && I.value.music.reason ? (e.openBlock(), e.createElementBlock(
                      "small",
                      dr,
                      e.toDisplayString(I.value.music.reason),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ], 10, ur)
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", mr, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref($).filter((n) => U.value[n]), (n) => (e.openBlock(), e.createElementBlock("div", {
                      key: n + U.value[n].path,
                      class: "cc-video cc-unveil"
                    }, [
                      e.createElementVNode("div", pr, [
                        e.createElementVNode("video", {
                          src: U.value[n].srcUrl,
                          controls: "",
                          playsinline: "",
                          preload: "metadata"
                        }, null, 8, vr)
                      ]),
                      e.createElementVNode("div", fr, [
                        e.createElementVNode("strong", { lang: n }, e.toDisplayString(e.unref(z)[n]), 9, kr),
                        e.createElementVNode("small", gr, [
                          e.createElementVNode(
                            "bdi",
                            hr,
                            e.toDisplayString(e.unref(Ce)(U.value[n].durationSec)),
                            1
                            /* TEXT */
                          ),
                          l[93] || (l[93] = e.createTextVNode(
                            " · ",
                            -1
                            /* CACHED */
                          )),
                          e.createElementVNode(
                            "bdi",
                            yr,
                            e.toDisplayString(e.unref(Nt)(U.value[n].size)),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createVNode(lt, {
                        path: U.value[n].path,
                        label: Tt(U.value[n].path),
                        compact: "",
                        onRegen: l[32] || (l[32] = (i) => ze())
                      }, null, 8, ["path", "label"])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            _: 1
            /* STABLE */
          }, 8, ["index", "title", "hint", "icon", "runtime", "is-current", "retry"]),
          e.createCommentVNode(" ── 最后一步：多平台发布 ── "),
          e.createVNode(Fe, {
            "step-key": "publish",
            index: S("publish"),
            title: p("publish").title,
            hint: p("publish").hint,
            icon: p("publish").icon,
            runtime: s.value.runtime.publish,
            "is-current": s.value.currentKey.value === "publish",
            retry: O.publish,
            cancel: fe,
            "retry-label": t.$t("重新发布")
          }, {
            default: e.withCtx(() => [
              ne.value ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 1 },
                [
                  e.createElementVNode("section", Nr, [
                    e.createElementVNode("header", Er, [
                      e.createElementVNode("strong", null, [
                        l[95] || (l[95] = e.createElementVNode(
                          "i",
                          { class: "ri-movie-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("发布哪一版成片")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "span",
                        br,
                        e.toDisplayString(t.$t("一次发一版；其它语言版本可以再发一次")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createCommentVNode(" 选了历史成品：直说发的是哪一次的哪一版，并留一条退路回到本次成片 "),
                    q.value ? (e.openBlock(), e.createElementBlock("div", _r, [
                      l[97] || (l[97] = e.createElementVNode(
                        "i",
                        { class: "ri-history-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode(
                        "span",
                        Sr,
                        e.toDisplayString(t.$t("发布历史成品：{time} · {lang} · {mode}", { time: e.unref(Ht)(q.value.runId), lang: e.unref(z)[q.value.lang], mode: q.value.mode === "ai" ? t.$t("AI 增强版") : t.$t("素材剪辑版") })),
                        1
                        /* TEXT */
                      ),
                      pe.value.length ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "cc-btn sm ghost",
                        onClick: Wl
                      }, [
                        l[96] || (l[96] = e.createElementVNode(
                          "i",
                          { class: "ri-arrow-go-back-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("改发本次成片")),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0)
                    ])) : (e.openBlock(), e.createElementBlock("div", {
                      key: 1,
                      class: "cc-seg",
                      role: "radiogroup",
                      "aria-label": t.$t("发布哪一版成片")
                    }, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(pe.value, (n) => (e.openBlock(), e.createElementBlock("button", {
                          key: n,
                          type: "button",
                          role: "radio",
                          class: e.normalizeClass(["cc-seg__btn", { active: R.value === n }]),
                          "aria-checked": R.value === n,
                          lang: n,
                          onClick: (i) => R.value = n
                        }, e.toDisplayString(e.unref(z)[n]), 11, $r))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 8, Br)),
                    e.createCommentVNode(`
              发布前把「到底要发哪条片子」摆出来：语言、时长、体积、成片方式、文件名，
              再配一个能直接播的预览。以前这里只有三个语言按钮，用户没法确认选中的那一版
              是不是自己要的 —— 发出去才发现发错语言，在平台侧是删不干净的。
            `),
                    ne.value ? (e.openBlock(), e.createElementBlock("div", Dr, [
                      e.createElementVNode("div", Cr, [
                        e.createElementVNode("span", {
                          class: "cc-pubpick__lang",
                          lang: ne.value.lang
                        }, e.toDisplayString(e.unref(z)[ne.value.lang]), 9, wr),
                        e.createElementVNode(
                          "span",
                          Tr,
                          e.toDisplayString(Ll.value),
                          1
                          /* TEXT */
                        ),
                        l[99] || (l[99] = e.createElementVNode(
                          "span",
                          { class: "grow" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "cc-btn sm ghost",
                          onClick: l[33] || (l[33] = (n) => e.unref(ue.openPath)(ne.value.path, !0))
                        }, [
                          l[98] || (l[98] = e.createElementVNode(
                            "i",
                            { class: "ri-folder-open-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(t.$t("打开文件位置")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      et.value ? (e.openBlock(), e.createElementBlock("div", Lr, [
                        e.createElementVNode("video", {
                          src: et.value,
                          controls: "",
                          playsinline: "",
                          preload: "metadata"
                        }, null, 8, Ar)
                      ])) : (e.openBlock(), e.createElementBlock("p", Pr, [
                        l[100] || (l[100] = e.createElementVNode(
                          "i",
                          { class: "ri-loader-4-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("预览加载中…")),
                          1
                          /* TEXT */
                        )
                      ]))
                    ])) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("section", Or, [
                    e.createElementVNode("header", Mr, [
                      e.createElementVNode("strong", null, [
                        l[101] || (l[101] = e.createElementVNode(
                          "i",
                          { class: "ri-send-plane-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("选择发布平台")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "span",
                        zr,
                        e.toDisplayString(t.$t("登录一律在浏览器里完成；没勾的平台不会被碰")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "p",
                      Fr,
                      e.toDisplayString(t.$t("国内平台")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Wr, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref($l), (n) => (e.openBlock(), e.createElementBlock("button", {
                          key: n.id,
                          type: "button",
                          class: e.normalizeClass(["cc-platform", { active: J.value.includes(n.id) }]),
                          "aria-pressed": J.value.includes(n.id) ? "true" : "false",
                          onClick: (i) => Al(n.id)
                        }, [
                          e.createElementVNode(
                            "span",
                            Rr,
                            e.toDisplayString(n.mark),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("span", Kr, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(n.label),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(n.desc),
                              1
                              /* TEXT */
                            )
                          ]),
                          J.value.includes(n.id) ? (e.openBlock(), e.createElementBlock("i", Ur)) : e.createCommentVNode("v-if", !0)
                        ], 10, Ir))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode(
                      "p",
                      jr,
                      e.toDisplayString(t.$t("海外平台")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", xr, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(Dl), (n) => (e.openBlock(), e.createElementBlock("button", {
                          key: n.id,
                          type: "button",
                          class: e.normalizeClass(["cc-platform", { active: G.value.includes(n.id) }]),
                          "aria-pressed": G.value.includes(n.id) ? "true" : "false",
                          onClick: (i) => Tl(n.id)
                        }, [
                          e.createElementVNode(
                            "span",
                            {
                              class: "cc-platform__mark",
                              style: e.normalizeStyle({ color: n.color, background: `color-mix(in srgb, ${n.color} 14%, transparent)` })
                            },
                            [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(n.icon)
                                },
                                null,
                                2
                                /* CLASS */
                              )
                            ],
                            4
                            /* STYLE */
                          ),
                          e.createElementVNode("span", Gr, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(n.label),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(n.desc),
                              1
                              /* TEXT */
                            )
                          ]),
                          G.value.includes(n.id) ? (e.openBlock(), e.createElementBlock("i", qr)) : e.createCommentVNode("v-if", !0)
                        ], 10, Hr))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode("p", Jr, [
                      l[102] || (l[102] = e.createElementVNode(
                        "i",
                        { class: "ri-information-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("两组可以同时勾选：国内走发布工作流（内置浏览器登录），海外直接驱动（YouTube 走系统 Chrome，Meta 走 Business Suite），各走各的链路。")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  e.createCommentVNode(" 海外发布是直驱的，回执必须原样摆出来：成功 / 停在人工闸门 / 被什么挡住 "),
                  e.unref(Pe).length ? (e.openBlock(), e.createElementBlock("section", Xr, [
                    e.createElementVNode("header", Yr, [
                      e.createElementVNode("strong", null, [
                        l[103] || (l[103] = e.createElementVNode(
                          "i",
                          { class: "ri-global-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("海外发布回执")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("ul", Qr, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(Pe), (n) => (e.openBlock(), e.createElementBlock(
                          "li",
                          {
                            key: n.platformId,
                            class: e.normalizeClass(n.state)
                          },
                          [
                            e.createElementVNode(
                              "span",
                              {
                                class: "cc-orun__icon",
                                style: e.normalizeStyle({ color: n.color })
                              },
                              [
                                e.createElementVNode(
                                  "i",
                                  {
                                    class: e.normalizeClass(n.icon)
                                  },
                                  null,
                                  2
                                  /* CLASS */
                                )
                              ],
                              4
                              /* STYLE */
                            ),
                            e.createElementVNode("span", Zr, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(n.platform),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(n.detail || Mt(n)),
                                1
                                /* TEXT */
                              )
                            ]),
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["cc-chip", n.state === "done" && n.status !== "handback" ? "ok" : n.state === "failed" || n.state === "cancelled" ? "warn" : ""])
                              },
                              e.toDisplayString(Mt(n)),
                              3
                              /* TEXT, CLASS */
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
                  e.createElementVNode("section", ei, [
                    e.createElementVNode("header", ti, [
                      e.createElementVNode("strong", null, [
                        l[104] || (l[104] = e.createElementVNode(
                          "i",
                          { class: "ri-chat-quote-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("发布文案")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "span",
                        li,
                        e.toDisplayString(t.$t("发布前可改；话题标签单独填，正文里不用再写")),
                        1
                        /* TEXT */
                      ),
                      l[105] || (l[105] = e.createElementVNode(
                        "span",
                        { class: "grow" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "cc-btn sm ghost",
                        disabled: Ze.value,
                        onClick: l[34] || (l[34] = (n) => Me(!0))
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(Ze.value ? "ri-loader-4-line cc-spin" : "ri-quill-pen-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("重新生成文案")),
                          1
                          /* TEXT */
                        )
                      ], 8, ni)
                    ]),
                    e.withDirectives(e.createElementVNode("textarea", {
                      "onUpdate:modelValue": l[35] || (l[35] = (n) => Y.value = n),
                      class: "cc-textarea",
                      rows: "3",
                      dir: e.unref($e)[R.value],
                      lang: R.value,
                      placeholder: t.$t("这条视频的发布正文")
                    }, null, 8, ai), [
                      [e.vModelText, Y.value]
                    ]),
                    e.createElementVNode("label", oi, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("话题标签")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": l[36] || (l[36] = (n) => ft.value = n),
                        type: "text",
                        placeholder: t.$t("公益 慈善 用空格分隔")
                      }, null, 8, si), [
                        [e.vModelText, ft.value]
                      ])
                    ])
                  ]),
                  e.createElementVNode("p", ri, [
                    l[106] || (l[106] = e.createElementVNode(
                      "i",
                      { class: "ri-shield-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("发布会走工作流：打开内置浏览器 → 你扫码登录后点一下确认 → 自动上传、填写文案并发布。未登录的平台会被拦下并列出，不会带着空登录态硬发。")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", ii, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "cc-btn primary lg",
                      disabled: !J.value.length && !G.value.length || !Y.value.trim() || Oe.value,
                      onClick: l[37] || (l[37] = (n) => zt())
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(Oe.value ? "ri-loader-4-line cc-spin" : "ri-send-plane-fill")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("开始发布（{n} 个平台）", { n: J.value.length + G.value.length })),
                        1
                        /* TEXT */
                      )
                    ], 8, ci)
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : (e.openBlock(), e.createElementBlock("p", Vr, [
                l[94] || (l[94] = e.createElementVNode(
                  "i",
                  { class: "ri-lightbulb-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("先在上一步生成成片，或在下面的历史成品里点「发布」。")),
                  1
                  /* TEXT */
                )
              ]))
            ]),
            _: 1
            /* STABLE */
          }, 8, ["index", "title", "hint", "icon", "runtime", "is-current", "retry", "retry-label"])
        ]),
        e.createCommentVNode(" 历史 "),
        Je.value.length ? (e.openBlock(), e.createElementBlock("section", ui, [
          e.createElementVNode("header", di, [
            e.createElementVNode("strong", null, [
              l[107] || (l[107] = e.createElementVNode(
                "i",
                { class: "ri-history-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("历史成品")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "span",
              mi,
              e.toDisplayString(t.$t("按次归档在 输出/<时间戳>/ 下；打开前会重新验真文件")),
              1
              /* TEXT */
            ),
            l[109] || (l[109] = e.createElementVNode(
              "span",
              { class: "grow" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("button", {
              type: "button",
              class: "cc-btn sm ghost",
              onClick: X
            }, [
              l[108] || (l[108] = e.createElementVNode(
                "i",
                { class: "ri-refresh-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("刷新")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("ul", pi, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(Je.value, (n) => (e.openBlock(), e.createElementBlock("li", {
                key: n.runId
              }, [
                e.createElementVNode("div", vi, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(e.unref(Ht)(n.runId)),
                    1
                    /* TEXT */
                  ),
                  n.archive ? (e.openBlock(), e.createElementBlock(
                    "span",
                    fi,
                    e.toDisplayString(e.unref(o.pickContentLang)(n.archive.eventName)),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  l[111] || (l[111] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "cc-btn sm ghost",
                    onClick: (i) => e.unref(ue.openPath)(n.outDir, !0)
                  }, [
                    l[110] || (l[110] = e.createElementVNode(
                      "i",
                      { class: "ri-folder-open-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("打开目录")),
                      1
                      /* TEXT */
                    )
                  ], 8, ki)
                ]),
                n.prompts ? (e.openBlock(), e.createElementBlock("details", gi, [
                  e.createElementVNode("summary", null, [
                    l[112] || (l[112] = e.createElementVNode(
                      "i",
                      { class: "ri-quill-pen-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("本次用的提示词")),
                      1
                      /* TEXT */
                    )
                  ]),
                  n.prompts.content ? (e.openBlock(), e.createElementBlock("p", hi, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(t.$t("内容提示词")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      yi,
                      e.toDisplayString(n.prompts.content),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  n.prompts.video ? (e.openBlock(), e.createElementBlock("p", Vi, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(t.$t("视频提示词")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      Ni,
                      e.toDisplayString(n.prompts.video),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", Ei, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref($).filter((i) => n.pdf?.[i]), (i) => (e.openBlock(), e.createElementBlock("span", {
                      key: "p" + i,
                      class: "cc-chip link",
                      onClick: (y) => kt(n.pdf[i])
                    }, [
                      l[113] || (l[113] = e.createElementVNode(
                        "i",
                        { class: "ri-file-pdf-2-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        "PDF " + e.toDisplayString(e.unref(z)[i]),
                        1
                        /* TEXT */
                      )
                    ], 8, bi))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref($).filter((i) => n.poster?.[i]), (i) => (e.openBlock(), e.createElementBlock("span", {
                      key: "o" + i,
                      class: "cc-chip link",
                      onClick: (y) => kt(n.poster[i])
                    }, [
                      l[114] || (l[114] = e.createElementVNode(
                        "i",
                        { class: "ri-image-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("海报")) + " " + e.toDisplayString(e.unref(z)[i]),
                        1
                        /* TEXT */
                      )
                    ], 8, _i))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref($).filter((i) => n.speech?.[i]), (i) => (e.openBlock(), e.createElementBlock("span", {
                      key: "s" + i,
                      class: "cc-chip link",
                      onClick: (y) => kt(n.speech[i])
                    }, [
                      l[115] || (l[115] = e.createElementVNode(
                        "i",
                        { class: "ri-mic-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("语音")) + " " + e.toDisplayString(e.unref(z)[i]),
                        1
                        /* TEXT */
                      )
                    ], 8, Si))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  e.createCommentVNode(" 成片这一类多一个发布入口：看一眼是预览，直接发是发布，两个动作分开不误点 "),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref($).filter((i) => n.videoAi?.[i]), (i) => (e.openBlock(), e.createElementBlock("span", {
                      key: "va" + i,
                      class: "cc-chip link ok cc-chip--act"
                    }, [
                      e.createElementVNode("span", {
                        class: "cc-chip__main",
                        onClick: (y) => Wt(n.videoAi[i], "ai")
                      }, [
                        l[116] || (l[116] = e.createElementVNode(
                          "i",
                          { class: "ri-movie-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("视频")) + " " + e.toDisplayString(e.unref(z)[i]) + " · " + e.toDisplayString(t.$t("AI 增强版")),
                          1
                          /* TEXT */
                        )
                      ], 8, Bi),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "cc-chip__act",
                        title: t.$t("发布这一条"),
                        onClick: e.withModifiers((y) => Ft(n, i, n.videoAi[i], "ai"), ["stop"])
                      }, [
                        l[117] || (l[117] = e.createElementVNode(
                          "i",
                          { class: "ri-send-plane-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("发布")),
                          1
                          /* TEXT */
                        )
                      ], 8, $i)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref($).filter((i) => n.video?.[i]), (i) => (e.openBlock(), e.createElementBlock("span", {
                      key: "v" + i,
                      class: "cc-chip link cc-chip--act"
                    }, [
                      e.createElementVNode("span", {
                        class: "cc-chip__main",
                        onClick: (y) => Wt(n.video[i], "clip")
                      }, [
                        l[118] || (l[118] = e.createElementVNode(
                          "i",
                          { class: "ri-scissors-cut-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("视频")) + " " + e.toDisplayString(e.unref(z)[i]) + " · " + e.toDisplayString(t.$t("素材剪辑版")),
                          1
                          /* TEXT */
                        )
                      ], 8, Di),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "cc-chip__act",
                        title: t.$t("发布这一条"),
                        onClick: e.withModifiers((y) => Ft(n, i, n.video[i], "clip"), ["stop"])
                      }, [
                        l[119] || (l[119] = e.createElementVNode(
                          "i",
                          { class: "ri-send-plane-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("发布")),
                          1
                          /* TEXT */
                        )
                      ], 8, Ci)
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
        ])) : e.createCommentVNode("v-if", !0),
        Le.value ? (e.openBlock(), e.createElementBlock("div", {
          key: 2,
          class: "cc-lightbox",
          onClick: l[39] || (l[39] = e.withModifiers((n) => Le.value = "", ["self"]))
        }, [
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["cc-chip", Xe.value === "ai" ? "ok" : ""])
            },
            [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(Xe.value === "ai" ? "ri-movie-2-line" : "ri-scissors-cut-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(Xe.value === "ai" ? t.$t("AI 增强版") : t.$t("素材剪辑版")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("div", wi, [
            e.createElementVNode("video", {
              src: Le.value,
              controls: "",
              autoplay: "",
              playsinline: ""
            }, null, 8, Ti)
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "cc-btn ghost light",
            onClick: l[38] || (l[38] = (n) => Le.value = "")
          }, [
            l[120] || (l[120] = e.createElementVNode(
              "i",
              { class: "ri-close-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("关闭")),
              1
              /* TEXT */
            )
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ],
      2
      /* CLASS */
    ));
  }
}), Ai = (a, c) => {
  const r = a.__vccOpts || a;
  for (const [f, d] of c)
    r[f] = d;
  return r;
}, Pi = /* @__PURE__ */ Ai(Li, [["__scopeId", "data-v-2611e084"]]);
export {
  Pi as default
};
