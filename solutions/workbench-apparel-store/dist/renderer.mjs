const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const r = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!r) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
r.default;
const Ne = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!Ne) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Je = Ne.default, _e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:qrcode"];
if (!_e) throw new Error("宿主模块未就绪：npm:qrcode");
const be = _e.default, Q = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!Q) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
Q.default;
const $e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!$e) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const ee = $e.default, Se = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!Se) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const Xe = Se.default, pe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!pe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
pe.default;
const w = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!w) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
w.default;
const P = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/foreign-trade/shared.ts"];
if (!P) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/foreign-trade/shared.ts");
P.default;
const De = /\.(jpe?g|png|webp|heic|bmp)$/i;
async function C(f, u) {
  const s = window.electronAPI?.workbenches?.apparelStore;
  if (!s?.invoke) throw new Error(r.t("服装AI试衣接口不可用，请重启应用"));
  return s.invoke(f, pe.toPlain(u ?? {}));
}
function we(f) {
  const u = window.electronAPI?.workbenches?.apparelStore;
  return u?.onEvent ? u.onEvent(f) : () => {
  };
}
const K = e.ref(null), ne = e.ref([]), Be = e.ref(null), le = e.reactive({ message: "" }), Ce = e.ref(0);
let ke = null, he = null;
function Ze() {
  const f = window.electronAPI?.workbenches?.apparelStore;
  !f?.onEvent || f === ke || (he?.(), ke = f, he = we((u) => {
    (u.type === "progress" || u.type === "state") && (Ce.value = Date.now());
  }));
}
function xe(f) {
  let u = Number.POSITIVE_INFINITY;
  for (const s of f) {
    if (s.status !== "queued" && s.status !== "running") continue;
    const d = Date.parse(s.status === "running" && s.startedAt || s.createdAt || "");
    Number.isFinite(d) && d < u && (u = d);
  }
  return Number.isFinite(u) ? u : void 0;
}
async function F() {
  const f = await C("state.get");
  return K.value = f, f;
}
async function et() {
  ne.value = await C("options.list");
}
async function ce() {
  Be.value = await C("stats.get");
}
function Te(f) {
  return ne.value.find((u) => u.id === f);
}
function tt(f, u) {
  return ne.value.filter((s) => s.kind === f && (!u || s.audience.includes(u)));
}
function re(f, u) {
  const s = Te(f);
  if (!s) return "";
  const d = s.variants.find((y) => y.id === u);
  return d ? `${s.label} · ${d.label}` : s.label;
}
function H(f) {
  return [re(f.backgroundId, f.backgroundVariant), re(f.poseId, f.poseVariant), re(f.hairId, f.hairVariant)].filter(Boolean).join(" / ");
}
function Ae(f) {
  return { background: r.t("背景"), pose: r.t("姿势"), hair: r.t("发型") }[f];
}
function Le(f) {
  return { women: r.t("女装"), men: r.t("男装"), kids: r.t("童装") }[f];
}
function fe(f) {
  return { pear: r.t("梨形"), apple: r.t("苹果形"), hourglass: r.t("沙漏形"), rectangle: r.t("直筒形"), inverted_triangle: r.t("倒三角形") }[f] || r.t("未判断");
}
function nt(f) {
  return { queued: r.t("排队中"), running: r.t("生成中"), done: r.t("已完成"), failed: r.t("失败") }[f];
}
function Ie(f) {
  return { prepared: r.t("已备货"), tried: r.t("已试穿"), purchased: r.t("已成交"), left: r.t("未成交") }[f];
}
function Me(f) {
  return { "fal-ai/nano-banana/edit": "Nano Banana Edit", "fal-ai/bytedance/seedream/v4/edit": "Seedream 4 Edit" }[f] || f;
}
async function ie(f = !0, u) {
  const s = await C("files.pick", { multi: f, title: u });
  return Array.isArray(s) ? s : [];
}
function lt(f) {
  return Object.values(f || {}).reduce((u, s) => u + (Number(s) || 0), 0);
}
async function Ve(f, u) {
  const s = await fetch(f);
  if (!s.ok) throw new Error(r.t("读取试穿图失败（{status}）", { status: String(s.status) }));
  const d = await createImageBitmap(await s.blob()), y = document.createElement("canvas");
  y.width = d.width, y.height = d.height;
  const v = y.getContext("2d");
  v.drawImage(d, 0, 0), d.close();
  const g = Math.max(14, Math.round(y.width / 32));
  v.font = `700 ${g}px -apple-system, "PingFang SC", sans-serif`;
  const c = v.measureText(u).width + g * 1.2, t = g * 1.9, n = y.width - c - g * 0.8, V = y.height - t - g * 0.8;
  return v.fillStyle = "rgba(0,0,0,.45)", v.beginPath(), v.roundRect ? v.roundRect(n, V, c, t, t / 2) : v.rect(n, V, c, t), v.fill(), v.fillStyle = "#fff", v.textBaseline = "middle", v.fillText(u, n + g * 0.6, V + t / 2), y.toDataURL("image/jpeg", 0.92);
}
const ot = { class: "ap-picker" }, st = {
  class: "ap-picker__kinds",
  role: "tablist"
}, at = ["aria-selected", "onClick"], rt = { class: "ap-picker__groups" }, it = { class: "ap-picker__chips" }, ct = ["title", "onClick"], dt = ["src"], ut = {
  key: 1,
  class: "ap-picker__variants"
}, mt = { class: "ap-picker__chips" }, pt = ["onClick"], gt = /* @__PURE__ */ e.defineComponent({
  __name: "StylePicker",
  props: {
    modelValue: {},
    audience: {},
    disabledIds: {}
  },
  emits: ["update:modelValue"],
  setup(f, { emit: u }) {
    const s = f, d = u, y = ["background", "pose", "hair"], v = { background: "ri-landscape-line", pose: "ri-walk-line", hair: "ri-scissors-cut-line" }, g = e.ref("background"), c = e.computed(() => s.modelValue), t = (l) => l === "background" ? "backgroundId" : l === "pose" ? "poseId" : "hairId", n = (l) => l === "background" ? "backgroundVariant" : l === "pose" ? "poseVariant" : "hairVariant", V = e.ref(!1), D = e.computed(() => K.value?.thumbs || {}), A = e.computed(() => tt(g.value, V.value ? null : s.audience).filter((l) => !s.disabledIds?.includes(l.id))), U = e.computed(() => [...new Set(A.value.map((l) => l.group))]), k = (l) => A.value.filter((a) => a.group === l), E = e.computed(() => Te(c.value[t(g.value)]));
    function h(l) {
      const a = { ...s.modelValue };
      a[t(g.value)] = l, delete a[n(g.value)], d("update:modelValue", a);
    }
    function B(l) {
      const a = { ...s.modelValue };
      a[n(g.value)] = a[n(g.value)] === l ? void 0 : l, d("update:modelValue", a);
    }
    return (l, a) => (e.openBlock(), e.createElementBlock("div", ot, [
      e.createElementVNode("div", st, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(y, (i) => e.createElementVNode("button", {
            key: i,
            type: "button",
            role: "tab",
            class: e.normalizeClass({ on: g.value === i }),
            "aria-selected": g.value === i,
            onClick: ($) => g.value = i
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(v[i])
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(e.unref(Ae)(i)),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "em",
              null,
              e.toDisplayString(e.unref(re)(c.value[t(i)], c.value[n(i)]) || l.$t("未选")),
              1
              /* TEXT */
            )
          ], 10, at)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      e.createElementVNode("div", rt, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(U.value, (i) => (e.openBlock(), e.createElementBlock("div", {
            key: i,
            class: "ap-picker__group"
          }, [
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(i),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", it, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(k(i), ($) => (e.openBlock(), e.createElementBlock("button", {
                  key: $.id,
                  type: "button",
                  class: e.normalizeClass(["ap-chip", { on: c.value[t(g.value)] === $.id }]),
                  title: $.detail,
                  onClick: (I) => h($.id)
                }, [
                  D.value[$.id] ? (e.openBlock(), e.createElementBlock("img", {
                    key: 0,
                    src: e.unref(P.fileUrl)(D.value[$.id]),
                    alt: "",
                    loading: "lazy"
                  }, null, 8, dt)) : e.createCommentVNode("v-if", !0),
                  e.createTextVNode(
                    e.toDisplayString($.label),
                    1
                    /* TEXT */
                  )
                ], 10, ct))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      g.value === "hair" && f.audience ? (e.openBlock(), e.createElementBlock(
        "button",
        {
          key: 0,
          type: "button",
          class: "ss-link ap-picker__all",
          onClick: a[0] || (a[0] = (i) => V.value = !V.value)
        },
        e.toDisplayString(V.value ? l.$t("只看适合该商品人群的发型") : l.$t("显示全部发型")),
        1
        /* TEXT */
      )) : e.createCommentVNode("v-if", !0),
      E.value && E.value.variants.length ? (e.openBlock(), e.createElementBlock("div", ut, [
        e.createElementVNode("small", null, [
          e.createTextVNode(
            e.toDisplayString(l.$t("细分场景")) + " · " + e.toDisplayString(E.value.label),
            1
            /* TEXT */
          ),
          E.value.detail ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createTextVNode(
                e.toDisplayString(l.$t("（{p0}）", { p0: E.value.detail })),
                1
                /* TEXT */
              )
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("div", mt, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(E.value.variants, (i) => (e.openBlock(), e.createElementBlock("button", {
              key: i.id,
              type: "button",
              class: e.normalizeClass(["ap-chip sub", { on: c.value[n(g.value)] === i.id }]),
              onClick: ($) => B(i.id)
            }, e.toDisplayString(i.label), 11, pt))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      E.value?.needsUpload ? e.renderSlot(l.$slots, "upload", { key: 2 }, void 0, !0) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), j = (f, u) => {
  const s = f.__vccOpts || f;
  for (const [d, y] of u)
    s[d] = y;
  return s;
}, Ue = /* @__PURE__ */ j(gt, [["__scopeId", "data-v-cdfb2510"]]), vt = { class: "ss-module" }, yt = { class: "ss-steps" }, kt = ["title", "onClick"], ht = ["src"], ft = { class: "ap-g__name" }, Vt = { class: "ap-g__meta" }, Et = { class: "ss-actions" }, Nt = ["disabled"], _t = { class: "ss-muted" }, bt = { class: "ss-actions" }, $t = { class: "ss-field ap-grow" }, St = { value: "" }, Dt = ["value"], wt = { class: "ss-grid" }, Bt = { class: "ss-field" }, Ct = { class: "ss-field" }, Tt = { class: "ss-field" }, At = { class: "ap-consent" }, Lt = { class: "ss-actions" }, It = ["disabled"], Mt = { class: "ss-muted" }, Ut = {
  key: 1,
  class: "ap-customer"
}, Ot = ["src"], zt = {
  key: 1,
  class: "ap-customer__empty"
}, Ft = { class: "ap-customer__info" }, Kt = { class: "ss-muted" }, Pt = {
  key: 0,
  class: "ss-note warn"
}, Wt = {
  key: 1,
  class: "ss-muted"
}, Rt = {
  key: 2,
  class: "ss-note warn"
}, jt = {
  key: 3,
  class: "ss-note danger"
}, qt = {
  key: 4,
  class: "ss-note ok"
}, Gt = { class: "ss-actions" }, Ht = ["disabled"], Qt = { class: "ap-inline" }, Yt = { class: "ap-inline" }, Jt = ["disabled"], Xt = { class: "ss-actions" }, Zt = ["disabled"], xt = ["disabled"], en = { class: "ss-muted" }, tn = { class: "ss-kpis" }, nn = { class: "ss-kpi" }, ln = { class: "ss-kpi" }, on = { class: "ss-kpi" }, sn = {
  key: 0,
  class: "ss-note info"
}, an = { class: "ap-sugs" }, rn = { key: 0 }, cn = { class: "ss-actions" }, dn = ["disabled"], un = { class: "ap-looks" }, mn = ["onClick"], pn = ["aria-label", "onClick"], gn = { class: "ss-actions" }, vn = { class: "ss-actions" }, yn = ["disabled"], kn = {
  key: 0,
  class: "ss-chip ok"
}, hn = {
  key: 0,
  class: "ss-note warn"
}, fn = { class: "ss-actions" }, Vn = ["disabled"], En = { class: "ss-muted" }, Nn = {
  key: 1,
  class: "ap-queue"
}, _n = {
  key: 0,
  class: "ri-loader-4-line spin"
}, bn = { class: "ap-q__what" }, $n = {
  key: 0,
  class: "ap-q__err"
}, Sn = ["onClick"], Dn = {
  key: 0,
  class: "ss-empty"
}, wn = {
  key: 1,
  class: "ap-results"
}, Bn = ["onClick"], Cn = ["src"], Tn = {
  key: 2,
  class: "ap-preview"
}, An = ["src"], Ln = { class: "ap-preview__side" }, In = { class: "ss-muted" }, Mn = { class: "ss-muted" }, Un = { class: "ap-code" }, On = { class: "ss-actions" }, zn = { class: "ap-phone" }, Fn = ["src"], Kn = {
  key: 1,
  class: "ss-muted"
}, Pn = {
  key: 0,
  class: "ss-empty"
}, Wn = {
  key: 1,
  class: "ss-table-wrap"
}, Rn = { class: "ss-table" }, jn = { class: "ap-wrap" }, qn = { class: "ap-code" }, Gn = {
  key: 1,
  class: "ss-muted"
}, Hn = { class: "ap-row-actions" }, Qn = ["onClick"], Yn = ["onClick"], Jn = ["onClick"], Xn = ["onClick"], Zn = ["onClick"], xn = 30, el = 2, tl = /* @__PURE__ */ e.defineComponent({
  __name: "TryonFlow",
  setup(f, { expose: u }) {
    const s = Q.useNotificationStore(), d = K;
    Ze();
    const y = { backgroundId: "B29", backgroundVariant: "B29-1", poseId: "P01", poseVariant: "P01-1", hairId: "H00" }, v = e.computed(() => d.value?.garments || []), g = e.computed(() => (d.value?.customers || []).filter((o) => !o.purgedAt)), c = e.ref([]), t = e.ref(""), n = e.computed(() => d.value?.customers.find((o) => o.id === t.value) || null), V = e.computed(() => v.value.find((o) => o.id === c.value[0]) || null), D = e.reactive({ nickname: "", heightCm: void 0, weightKg: void 0, consent: !1 }), A = e.reactive({ heightCm: void 0, weightKg: void 0 }), U = e.ref(!1), k = e.ref([{ ...y }]), E = e.ref(0), h = e.ref(!1), B = e.ref(!1), l = e.ref(null), a = e.ref(""), i = e.ref(""), $ = e.ref({});
    e.watch(n, (o) => {
      A.heightCm = o?.heightCm, A.weightKg = o?.weightKg, U.value = !1, a.value = "", l.value = null, ve();
    }, { immediate: !1 }), e.watch(t, () => {
      a.value = "";
    }), e.watch(k, () => {
      h.value = !0;
    }, { deep: !0 });
    const I = e.computed(() => (d.value?.tryons || []).filter((o) => o.customerId === t.value)), N = e.computed(() => I.value.filter((o) => o.status === "done" && o.image)), T = e.computed(() => I.value.filter((o) => o.status === "queued" || o.status === "running")), O = e.computed(() => !!n.value?.photo && !n.value.purgedAt && (!!n.value.photoCheck?.ok || !!n.value.photoCheck?.unchecked || !n.value.photoCheck && !d.value?.imageReady)), te = e.computed(() => O.value && c.value.length > 0 && k.value.length > 0), z = [
      { key: "ap-garment", title: r.t("选衣服"), hint: r.t("从商品库挑 1～4 件要试的衣服；新款可当场导入，AI 自动打标签") },
      { key: "ap-photo", title: r.t("顾客照片与授权"), hint: r.t("勾选授权后上传一张全身正面照（电脑上传，或顾客扫门店码用手机上传）") },
      { key: "ap-analyze", title: r.t("AI 形象分析"), hint: r.t("识别体型、肤色、脸型，推荐 3 组造型（可跳过）") },
      { key: "ap-style", title: r.t("选造型"), hint: r.t("背景 / 姿势 / 发型及细分场景，一次最多 4 组") },
      { key: "ap-generate", title: r.t("AI 合成"), hint: r.t("衣服 × 造型逐张生成，失败的单张可重试") },
      { key: "ap-view", title: r.t("手机、电脑查看"), hint: r.t("电脑大图对比；顾客扫码在手机上看、长按保存（带门店名与试穿码）") },
      { key: "ap-visit", title: r.t("到店试实物"), hint: r.t("想试实物 → 试穿码 + 推荐尺码 → 店员备货、登记试穿与成交") }
    ];
    function q(o, p, m, M = !1, x) {
      return i.value === o || M ? { state: "running", ...x || {} } : $.value[o] ? { state: "failed", error: $.value[o] } : p ? { state: "done", summary: m } : { state: "todo" };
    }
    const R = e.computed(() => {
      const o = n.value, p = T.value, m = p.length > 0, M = I.value.length > 0 && I.value.every((Z) => Z.status === "failed"), x = m ? {
        kind: "image",
        estimateSec: Math.ceil(p.length / el) * xn,
        startedAt: xe(p),
        progressAt: Ce.value || void 0
      } : void 0;
      return {
        "ap-garment": q("ap-garment", c.value.length > 0, r.t("已选 {n} 件", { n: c.value.length })),
        "ap-photo": o?.photoCheck && !o.photoCheck.ok && !o.photoCheck.unchecked && !i.value ? { state: "failed", error: r.t("照片不合格，请重拍") } : q("ap-photo", O.value, o?.nickname),
        "ap-analyze": q("ap-analyze", !!o?.profile || U.value && !!o?.photo, o?.profile ? fe(o.profile.bodyShape) : r.t("已跳过")),
        "ap-style": q("ap-style", !!o?.photo && (h.value || !!o?.profile), r.t("{n} 组造型", { n: k.value.length })),
        // 预检 / 本组件自己的报错优先于「上一批全失败」的汇总，否则点生成被拦下时卡上还写着上一批的旧原因
        "ap-generate": $.value["ap-generate"] && !m ? { state: "failed", error: $.value["ap-generate"] } : M && !m ? { state: "failed", error: I.value[0]?.error || r.t("生成失败") } : q("ap-generate", N.value.length > 0, r.t("{n} 张完成", { n: N.value.length }), m, x),
        "ap-view": q("ap-view", N.value.length > 0 && (!!l.value || !!a.value || o?.source === "mobile")),
        "ap-visit": q("ap-visit", I.value.some((Z) => !!Z.visit), r.t("{n} 件已登记", { n: I.value.filter((Z) => Z.visit).length }))
      };
    }), G = e.computed(() => z.find((o) => R.value[o.key].state !== "done")?.key || "ap-visit");
    function Y(o) {
      return v.value.find((p) => p.id === o)?.name || r.t("已删除的商品");
    }
    function oe(o) {
      const p = c.value.indexOf(o);
      p >= 0 ? c.value.splice(p, 1) : c.value.length < 4 ? c.value.push(o) : s.warn(r.t("一次最多选 4 件"));
    }
    async function W(o, p) {
      i.value = o, $.value = { ...$.value, [o]: "" };
      try {
        await p(), await F();
      } catch (m) {
        $.value = { ...$.value, [o]: w.errorMessage(m) }, w.scrollToStep(o);
      } finally {
        i.value = "";
      }
    }
    async function ue() {
      const o = await ie(!0, r.t("选择服装白底图 / 平铺图"));
      o.length && await J(o);
    }
    function se(o) {
      const p = w.droppedPaths(o, De);
      p.length && J(p);
    }
    async function J(o) {
      await W("ap-garment", async () => {
        const p = await C("garments.import", { paths: o });
        c.value = [.../* @__PURE__ */ new Set([...c.value, ...p.map((m) => m.id)])].slice(0, 4), await F();
        for (const m of p)
          try {
            await C("garment.tag", { id: m.id });
          } catch (M) {
            s.warn(w.errorMessage(M));
            break;
          }
      });
    }
    async function X() {
      await W("ap-photo", async () => {
        const o = await C("customer.create", { ...D });
        t.value = o.id, Object.assign(D, { nickname: "", heightCm: void 0, weightKg: void 0, consent: !1 }), await F(), await b();
      });
    }
    async function b() {
      const o = await ie(!1, r.t("选择顾客全身照"));
      o.length && await C("customer.image", { id: t.value, path: o[0], kind: "photo" });
    }
    async function _() {
      await W("ap-photo", b);
    }
    async function S() {
      await W("ap-photo", () => C("customer.update", { id: t.value, patch: { heightCm: A.heightCm ?? null, weightKg: A.weightKg ?? null } }));
    }
    async function L() {
      !n.value || !window.confirm(r.t("删除「{p0}」的照片、试穿图与分析结果？此操作不可恢复。", { p0: n.value.nickname })) || await W("ap-photo", () => C("customer.purge", { id: t.value }));
    }
    async function me() {
      await W("ap-analyze", () => C("customer.analyze", { id: t.value, audience: V.value?.audience }));
    }
    function Oe() {
      const o = n.value?.profile?.suggestions || [];
      o.length && (k.value = o.map(({ reason: p, ...m }) => ({ ...m })), E.value = 0, w.scrollToStep("ap-style"));
    }
    function ze() {
      V.value?.recommended && (k.value[E.value] = { ...V.value.recommended });
    }
    function Fe() {
      k.value.push({ ...k.value[k.value.length - 1] || y }), E.value = k.value.length - 1;
    }
    function Ke(o) {
      k.value.splice(o, 1), E.value = Math.min(E.value, k.value.length - 1);
    }
    async function ve() {
      B.value = t.value ? !!await C("customer.hasBackground", { id: t.value }).catch(() => !1) : !1;
    }
    async function Pe() {
      const o = await ie(!1, r.t("选择背景照片"));
      o.length && await W("ap-style", async () => {
        await C("customer.image", { id: t.value, path: o[0], kind: "background" }), await ve();
      });
    }
    async function ye() {
      if (!d.value?.imageReady) {
        const o = r.t("还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发");
        $.value = { ...$.value, "ap-generate": o }, s.warn(o), w.scrollToStep("ap-generate");
        return;
      }
      await W("ap-generate", () => C("tryon.enqueue", {
        customerId: t.value,
        garmentIds: c.value,
        choices: k.value.map((o) => ({ ...o, customBackground: o.backgroundId === "B30" && B.value ? "yes" : void 0 }))
      }));
    }
    async function We(o) {
      await W("ap-generate", () => C("tryon.retry", { id: o }));
    }
    async function Re() {
      const o = I.value.filter((p) => p.status === "failed");
      if (!o.length) {
        await ye();
        return;
      }
      await W("ap-generate", async () => {
        for (const p of o) await C("tryon.retry", { id: p.id });
      });
    }
    async function je(o) {
      try {
        const p = d.value?.settings.watermark ? await Ve(P.fileUrl(o.image), `${d.value.settings.storeName} · ${r.t("试穿码")} ${o.code}`) : P.fileUrl(o.image), m = await (await fetch(p)).blob(), M = m.type === "image/png" ? m : await qe(m);
        await navigator.clipboard.write([new ClipboardItem({ "image/png": M })]), s.success(r.t("已复制，可直接粘贴到微信、朋友圈编辑器"));
      } catch (p) {
        s.error(w.errorMessage(p));
      }
    }
    async function qe(o) {
      const p = await createImageBitmap(o), m = document.createElement("canvas");
      return m.width = p.width, m.height = p.height, m.getContext("2d").drawImage(p, 0, 0), new Promise((M, x) => m.toBlob((Z) => Z ? M(Z) : x(new Error("toBlob")), "image/png"));
    }
    async function Ge() {
      try {
        const o = d.value, p = o?.settings.watermark ? await C("tryon.exportData", { items: await Promise.all(N.value.map(async (m) => ({
          name: `${Y(m.garmentId)}-${m.code}`,
          dataUrl: await Ve(P.fileUrl(m.image), `${o.settings.storeName} · ${r.t("试穿码")} ${m.code}`)
        }))) }) : await C("tryon.export", { ids: N.value.map((m) => m.id) });
        await C("path.open", { path: p[0], reveal: !0 });
      } catch (o) {
        s.error(w.errorMessage(o));
      }
    }
    async function He() {
      try {
        const o = await C("mobile.customerLink", { id: t.value });
        a.value = await be.toDataURL(o, { margin: 1, width: 180 });
      } catch (o) {
        s.error(w.errorMessage(o));
      }
    }
    async function Qe(o) {
      await W("ap-visit", () => C("tryon.want", { id: o }));
    }
    async function ae(o, p) {
      await W("ap-visit", () => C("tryon.visit", { id: o, status: p }));
    }
    function Ye(o) {
      w.scrollToStep(o);
    }
    return u({ focusCustomer: (o) => {
      t.value = o;
    } }), (o, p) => (e.openBlock(), e.createElementBlock("div", vt, [
      e.createVNode(Xe, {
        title: o.$t("AI 一键换装"),
        metas: z,
        runtime: R.value,
        "current-key": G.value,
        onJump: Ye
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", yt, [
        e.createCommentVNode(" ① 选衣服 "),
        e.createVNode(ee, {
          "step-key": "ap-garment",
          index: 0,
          title: z[0].title,
          hint: z[0].hint,
          runtime: R.value["ap-garment"],
          "is-current": G.value === "ap-garment"
        }, {
          default: e.withCtx(() => [
            v.value.length ? (e.openBlock(), e.createElementBlock(
              "div",
              {
                key: 1,
                class: "ap-grid",
                onDragover: p[1] || (p[1] = e.withModifiers(() => {
                }, ["prevent"])),
                onDrop: e.withModifiers(se, ["prevent"])
              },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(v.value, (m) => (e.openBlock(), e.createElementBlock("button", {
                    key: m.id,
                    type: "button",
                    class: e.normalizeClass(["ap-g", { on: c.value.includes(m.id) }]),
                    title: m.sellingPoints,
                    onClick: (M) => oe(m.id)
                  }, [
                    e.createElementVNode("img", {
                      src: e.unref(P.fileUrl)(m.image),
                      alt: "",
                      loading: "lazy"
                    }, null, 8, ht),
                    e.createElementVNode(
                      "span",
                      ft,
                      e.toDisplayString(m.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      Vt,
                      e.toDisplayString([m.category, m.color, e.unref(Le)(m.audience)].filter(Boolean).join(" · ")),
                      1
                      /* TEXT */
                    )
                  ], 10, kt))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              32
              /* NEED_HYDRATION */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              {
                key: 0,
                class: "ss-empty",
                onDragover: p[0] || (p[0] = e.withModifiers(() => {
                }, ["prevent"])),
                onDrop: e.withModifiers(se, ["prevent"])
              },
              e.toDisplayString(o.$t("商品库还是空的：先导入服装白底图或平铺图（可直接拖进来）")),
              33
              /* TEXT, NEED_HYDRATION */
            )),
            e.createElementVNode("div", Et, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: !!i.value,
                onClick: ue
              }, [
                p[12] || (p[12] = e.createElementVNode(
                  "i",
                  { class: "ri-image-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("导入新款（AI 自动打标签）")),
                  1
                  /* TEXT */
                )
              ], 8, Nt),
              e.createElementVNode(
                "span",
                _t,
                e.toDisplayString(o.$t("已选 {n} / 4 件", { n: c.value.length })),
                1
                /* TEXT */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ② 顾客照片与授权 "),
        e.createVNode(ee, {
          "step-key": "ap-photo",
          index: 1,
          title: z[1].title,
          hint: z[1].hint,
          runtime: R.value["ap-photo"],
          "is-current": G.value === "ap-photo"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", bt, [
              e.createElementVNode("label", $t, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(o.$t("顾客")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": p[2] || (p[2] = (m) => t.value = m)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      St,
                      e.toDisplayString(o.$t("— 新顾客 —")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(g.value, (m) => (e.openBlock(), e.createElementBlock("option", {
                        key: m.id,
                        value: m.id
                      }, e.toDisplayString(m.nickname) + e.toDisplayString(m.source === "mobile" ? o.$t("（手机）") : "") + " · " + e.toDisplayString(e.unref(w.fmtDateTime)(m.createdAt)), 9, Dt))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, t.value]
                ])
              ])
            ]),
            n.value ? (e.openBlock(), e.createElementBlock("div", Ut, [
              n.value.photo ? (e.openBlock(), e.createElementBlock("img", {
                key: 0,
                src: e.unref(P.fileUrl)(n.value.photo),
                alt: ""
              }, null, 8, Ot)) : (e.openBlock(), e.createElementBlock("div", zt, [...p[14] || (p[14] = [
                e.createElementVNode(
                  "i",
                  { class: "ri-user-line" },
                  null,
                  -1
                  /* CACHED */
                )
              ])])),
              e.createElementVNode("div", Ft, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(n.value.nickname),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  Kt,
                  e.toDisplayString(n.value.source === "mobile" ? o.$t("手机端顾客") : o.$t("店内建档")) + " · " + e.toDisplayString(o.$t("授权于 {p0}", { p0: e.unref(w.fmtDateTime)(n.value.consentAt) })),
                  1
                  /* TEXT */
                ),
                n.value.purgedAt ? (e.openBlock(), e.createElementBlock("p", Pt, [
                  p[15] || (p[15] = e.createElementVNode(
                    "i",
                    { class: "ri-delete-bin-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(o.$t("该顾客的照片与试穿图已清除")),
                    1
                    /* TEXT */
                  )
                ])) : n.value.photo && !n.value.photoCheck ? (e.openBlock(), e.createElementBlock("p", Wt, [
                  p[16] || (p[16] = e.createElementVNode(
                    "i",
                    { class: "ri-loader-4-line spin" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(o.$t("正在检查照片…")),
                    1
                    /* TEXT */
                  )
                ])) : n.value.photoCheck?.unchecked ? (e.openBlock(), e.createElementBlock("p", Rt, [
                  p[17] || (p[17] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.value.photoCheck.issues.join(o.$t("；"))),
                    1
                    /* TEXT */
                  )
                ])) : n.value.photoCheck && !n.value.photoCheck.ok ? (e.openBlock(), e.createElementBlock("p", jt, [
                  p[18] || (p[18] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(o.$t("照片不适合试穿：{p0}。请重拍一张单人、全身正面、光线充足的照片", { p0: n.value.photoCheck.issues.join("；") || o.$t("不符合要求") })),
                    1
                    /* TEXT */
                  )
                ])) : n.value.photoCheck?.ok ? (e.openBlock(), e.createElementBlock("p", qt, [
                  p[19] || (p[19] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(o.$t("照片合格：单人、全身、光线正常")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", Gt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: e.normalizeClass(["ss-btn sm", { primary: !n.value.photo }]),
                    disabled: !!i.value,
                    onClick: _
                  }, [
                    p[20] || (p[20] = e.createElementVNode(
                      "i",
                      { class: "ri-camera-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.value.photo ? o.$t("换一张照片") : o.$t("上传全身照")),
                      1
                      /* TEXT */
                    )
                  ], 10, Ht),
                  e.createElementVNode("label", Qt, [
                    e.createTextVNode(
                      e.toDisplayString(o.$t("身高")) + " ",
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": p[7] || (p[7] = (m) => A.heightCm = m),
                        type: "number",
                        min: "50",
                        max: "230"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        A.heightCm,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    p[21] || (p[21] = e.createTextVNode(
                      " cm",
                      -1
                      /* CACHED */
                    ))
                  ]),
                  e.createElementVNode("label", Yt, [
                    e.createTextVNode(
                      e.toDisplayString(o.$t("体重")) + " ",
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": p[8] || (p[8] = (m) => A.weightKg = m),
                        type: "number",
                        min: "10",
                        max: "250"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        A.weightKg,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    p[22] || (p[22] = e.createTextVNode(
                      " kg",
                      -1
                      /* CACHED */
                    ))
                  ]),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: S
                    },
                    e.toDisplayString(o.$t("保存")),
                    1
                    /* TEXT */
                  ),
                  p[24] || (p[24] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm danger",
                    disabled: !!i.value || !!n.value.purgedAt,
                    onClick: L
                  }, [
                    p[23] || (p[23] = e.createElementVNode(
                      "i",
                      { class: "ri-delete-bin-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("删除该顾客照片")),
                      1
                      /* TEXT */
                    )
                  ], 8, Jt)
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", wt, [
                  e.createElementVNode("label", Bt, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(o.$t("称呼（选填）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": p[3] || (p[3] = (m) => D.nickname = m),
                        type: "text",
                        maxlength: "20"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        D.nickname,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("label", Ct, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(o.$t("身高 cm（选填，尺码助手用）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": p[4] || (p[4] = (m) => D.heightCm = m),
                        type: "number",
                        min: "50",
                        max: "230"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        D.heightCm,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("label", Tt, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(o.$t("体重 kg（选填）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": p[5] || (p[5] = (m) => D.weightKg = m),
                        type: "number",
                        min: "10",
                        max: "250"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        D.weightKg,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])
                ]),
                e.createElementVNode("label", At, [
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": p[6] || (p[6] = (m) => D.consent = m),
                      type: "checkbox"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelCheckbox, D.consent]
                  ]),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(o.$t("顾客已同意：照片仅用于本次试穿，会发送到云端 AI 生成试穿图，保存在本店电脑，{d} 天后自动删除，可随时一键删除。", { d: e.unref(d)?.settings.retentionDays || 7 })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Lt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!i.value || !D.consent,
                    onClick: X
                  }, [
                    p[13] || (p[13] = e.createElementVNode(
                      "i",
                      { class: "ri-user-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("建档并上传照片")),
                      1
                      /* TEXT */
                    )
                  ], 8, It),
                  e.createElementVNode(
                    "span",
                    Mt,
                    e.toDisplayString(o.$t("或让顾客扫「手机端」页签里的门店码自己上传，顾客会出现在上面的列表里")),
                    1
                    /* TEXT */
                  )
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ③ AI 形象分析 "),
        e.createVNode(ee, {
          "step-key": "ap-analyze",
          index: 2,
          title: z[2].title,
          hint: z[2].hint,
          runtime: R.value["ap-analyze"],
          "is-current": G.value === "ap-analyze"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Xt, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!i.value || !n.value?.photo,
                onClick: me
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(i.value === "ap-analyze" ? "ri-loader-4-line spin" : "ri-body-scan-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(n.value?.profile ? o.$t("重新分析") : o.$t("分析体型、肤色、脸型")),
                  1
                  /* TEXT */
                )
              ], 8, Zt),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost sm",
                disabled: !n.value?.photo,
                onClick: p[9] || (p[9] = (m) => U.value = !0)
              }, e.toDisplayString(o.$t("跳过")), 9, xt),
              e.createElementVNode(
                "span",
                en,
                e.toDisplayString(o.$t("AI 估计，仅供搭配参考")),
                1
                /* TEXT */
              )
            ]),
            n.value?.profile ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", tn, [
                  e.createElementVNode("div", nn, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(o.$t("体型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(fe)(n.value.profile.bodyShape)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", ln, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(o.$t("肤色")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(n.value.profile.skinTone || "—"),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", on, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(o.$t("脸型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(n.value.profile.faceShape || "—"),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                n.value.profile.notes ? (e.openBlock(), e.createElementBlock("p", sn, [
                  p[25] || (p[25] = e.createElementVNode(
                    "i",
                    { class: "ri-lightbulb-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.value.profile.notes),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", an, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(n.value.profile.suggestions, (m, M) => (e.openBlock(), e.createElementBlock("div", {
                      key: M,
                      class: "ap-sug"
                    }, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(o.$t("推荐 {n}", { n: M + 1 })),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(e.unref(H)(m)),
                        1
                        /* TEXT */
                      ),
                      m.reason ? (e.openBlock(), e.createElementBlock(
                        "small",
                        rn,
                        e.toDisplayString(m.reason),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", cn, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !n.value.profile.suggestions.length,
                    onClick: Oe
                  }, [
                    p[26] || (p[26] = e.createElementVNode(
                      "i",
                      { class: "ri-lightbulb-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("套用这 {n} 组推荐", { n: n.value.profile.suggestions.length })),
                      1
                      /* TEXT */
                    )
                  ], 8, dn)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ④ 选造型 "),
        e.createVNode(ee, {
          "step-key": "ap-style",
          index: 3,
          title: z[3].title,
          hint: z[3].hint,
          runtime: R.value["ap-style"],
          "is-current": G.value === "ap-style"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", un, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(k.value, (m, M) => (e.openBlock(), e.createElementBlock("button", {
                  key: M,
                  type: "button",
                  class: e.normalizeClass(["ap-look", { on: E.value === M }]),
                  onClick: (x) => E.value = M
                }, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(o.$t("造型 {n}", { n: M + 1 })),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(H)(m)),
                    1
                    /* TEXT */
                  ),
                  k.value.length > 1 ? (e.openBlock(), e.createElementBlock("i", {
                    key: 0,
                    class: "ri-close-line",
                    role: "button",
                    "aria-label": o.$t("删除"),
                    onClick: e.withModifiers((x) => Ke(M), ["stop"])
                  }, null, 8, pn)) : e.createCommentVNode("v-if", !0)
                ], 10, mn))),
                128
                /* KEYED_FRAGMENT */
              )),
              k.value.length < 4 ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ap-look add",
                onClick: Fe
              }, [
                p[27] || (p[27] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("再加一组")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("div", gn, [
              V.value?.recommended ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn sm ghost",
                onClick: ze
              }, [
                p[28] || (p[28] = e.createElementVNode(
                  "i",
                  { class: "ri-star-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("用「{p0}」的店长推荐", { p0: V.value.name })),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            e.createVNode(Ue, {
              modelValue: k.value[E.value],
              "onUpdate:modelValue": p[10] || (p[10] = (m) => k.value[E.value] = m),
              audience: V.value?.audience || null
            }, {
              upload: e.withCtx(() => [
                e.createElementVNode("div", vn, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !n.value || !!i.value,
                    onClick: Pe
                  }, [
                    p[29] || (p[29] = e.createElementVNode(
                      "i",
                      { class: "ri-image-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(B.value ? o.$t("换一张背景照片") : o.$t("上传背景照片")),
                      1
                      /* TEXT */
                    )
                  ], 8, yn),
                  B.value ? (e.openBlock(), e.createElementBlock(
                    "span",
                    kn,
                    e.toDisplayString(o.$t("已上传")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["modelValue", "audience"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(`
        ⑤ AI 合成。队列没有取消通道：还在跑时「可能已超时」卡只给 继续等待 / 查看日志（不放重新生成，
        放了就是重复排队烧钱）；全部失败 / 预检没过时才给「重新生成」= 失败的逐张重试，或重新发起。
      `),
        e.createVNode(ee, {
          "step-key": "ap-generate",
          index: 4,
          title: z[4].title,
          hint: z[4].hint,
          runtime: R.value["ap-generate"],
          "is-current": G.value === "ap-generate",
          retry: T.value.length ? void 0 : Re
        }, {
          default: e.withCtx(() => [
            e.unref(d)?.imageReady ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", hn, [
              p[30] || (p[30] = e.createElementVNode(
                "i",
                { class: "ri-key-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(o.$t("还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发")),
                1
                /* TEXT */
              )
            ])),
            e.createElementVNode("div", fn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!i.value || !te.value,
                onClick: ye
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(i.value === "ap-generate" ? "ri-loader-4-line spin" : "ri-shirt-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(o.$t("生成 {n} 张试穿图", { n: c.value.length * k.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, Vn),
              e.createElementVNode(
                "span",
                En,
                e.toDisplayString(o.$t("{a} 件 × {b} 组造型，单张约 5–30 秒，同时生成 2 张", { a: c.value.length, b: k.value.length })),
                1
                /* TEXT */
              )
            ]),
            I.value.length ? (e.openBlock(), e.createElementBlock("div", Nn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(I.value, (m) => (e.openBlock(), e.createElementBlock(
                  "div",
                  {
                    key: m.id,
                    class: e.normalizeClass(["ap-q", m.status])
                  },
                  [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", m.status === "done" ? "ok" : m.status === "failed" ? "bad" : "brand"])
                      },
                      [
                        m.status === "running" || m.status === "queued" ? (e.openBlock(), e.createElementBlock("i", _n)) : e.createCommentVNode("v-if", !0),
                        e.createTextVNode(
                          e.toDisplayString(e.unref(nt)(m.status)),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    ),
                    e.createElementVNode(
                      "span",
                      bn,
                      e.toDisplayString(Y(m.garmentId)) + " · " + e.toDisplayString(e.unref(H)(m.choice)),
                      1
                      /* TEXT */
                    ),
                    m.error ? (e.openBlock(), e.createElementBlock(
                      "span",
                      $n,
                      e.toDisplayString(m.error),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    m.status === "failed" ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "ss-link",
                      onClick: (M) => We(m.id)
                    }, e.toDisplayString(o.$t("重试")), 9, Sn)) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry"]),
        e.createCommentVNode(" ⑥ 查看与分享 "),
        e.createVNode(ee, {
          "step-key": "ap-view",
          index: 5,
          title: z[5].title,
          hint: z[5].hint,
          runtime: R.value["ap-view"],
          "is-current": G.value === "ap-view"
        }, {
          default: e.withCtx(() => [
            N.value.length ? (e.openBlock(), e.createElementBlock("div", wn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(N.value, (m) => (e.openBlock(), e.createElementBlock("figure", {
                  key: m.id,
                  class: e.normalizeClass({ on: l.value?.id === m.id }),
                  onClick: (M) => l.value = m
                }, [
                  e.createElementVNode("img", {
                    src: e.unref(P.fileUrl)(m.image),
                    alt: "",
                    loading: "lazy"
                  }, null, 8, Cn),
                  e.createElementVNode("figcaption", null, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(Y(m.garmentId)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(e.unref(H)(m.choice)),
                      1
                      /* TEXT */
                    )
                  ])
                ], 10, Bn))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              Dn,
              e.toDisplayString(o.$t("生成完成的试穿图会出现在这里")),
              1
              /* TEXT */
            )),
            l.value ? (e.openBlock(), e.createElementBlock("div", Tn, [
              e.createElementVNode("img", {
                src: e.unref(P.fileUrl)(l.value.image),
                alt: ""
              }, null, 8, An),
              e.createElementVNode("div", Ln, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(Y(l.value.garmentId)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  In,
                  e.toDisplayString(e.unref(H)(l.value.choice)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("span", Mn, [
                  e.createTextVNode(
                    e.toDisplayString(o.$t("试穿码")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "b",
                    Un,
                    e.toDisplayString(l.value.code),
                    1
                    /* TEXT */
                  ),
                  e.createTextVNode(
                    " · " + e.toDisplayString(e.unref(Me)(l.value.model || "")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", On, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    onClick: p[11] || (p[11] = (m) => je(l.value))
                  }, [
                    p[31] || (p[31] = e.createElementVNode(
                      "i",
                      { class: "ri-file-copy-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("复制（带门店水印）")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    onClick: Ge
                  }, [
                    p[32] || (p[32] = e.createElementVNode(
                      "i",
                      { class: "ri-download-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("导出全部试穿图")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("div", zn, [
                  e.createElementVNode("strong", null, [
                    p[33] || (p[33] = e.createElementVNode(
                      "i",
                      { class: "ri-smartphone-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("在顾客手机上查看")),
                      1
                      /* TEXT */
                    )
                  ]),
                  a.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("img", {
                        src: a.value,
                        alt: ""
                      }, null, 8, Fn),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(o.$t("顾客连店内 Wi-Fi 扫码，即可在手机上看到并长按保存这些试穿图")),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.unref(d)?.mobile.running ? (e.openBlock(), e.createElementBlock("button", {
                    key: 2,
                    type: "button",
                    class: "ss-btn sm",
                    onClick: He
                  }, [
                    p[34] || (p[34] = e.createElementVNode(
                      "i",
                      { class: "ri-qr-code-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("生成顾客查看码")),
                      1
                      /* TEXT */
                    )
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Kn,
                    e.toDisplayString(o.$t("先在「手机端」页签开启门店手机服务")),
                    1
                    /* TEXT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ⑦ 到店试实物 "),
        e.createVNode(ee, {
          "step-key": "ap-visit",
          index: 6,
          title: z[6].title,
          hint: z[6].hint,
          runtime: R.value["ap-visit"],
          "is-current": G.value === "ap-visit"
        }, {
          default: e.withCtx(() => [
            N.value.length ? (e.openBlock(), e.createElementBlock("div", Wn, [
              e.createElementVNode("table", Rn, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("款式")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("造型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("试穿码")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("推荐尺码")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("到店")),
                      1
                      /* TEXT */
                    ),
                    p[35] || (p[35] = e.createElementVNode(
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
                    e.renderList(N.value, (m) => (e.openBlock(), e.createElementBlock("tr", {
                      key: m.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(Y(m.garmentId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        jn,
                        e.toDisplayString(e.unref(H)(m.choice)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "b",
                          qn,
                          e.toDisplayString(m.wantVisit ? m.code : "—"),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(m.size || (m.wantVisit ? o.$t("未填身高") : "—")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        m.visit ? (e.openBlock(), e.createElementBlock(
                          "span",
                          {
                            key: 0,
                            class: e.normalizeClass(["ss-chip", m.visit.status === "purchased" ? "ok" : m.visit.status === "left" ? "bad" : "brand"])
                          },
                          e.toDisplayString(e.unref(Ie)(m.visit.status)) + e.toDisplayString(m.visit.size ? ` · ${m.visit.size}` : ""),
                          3
                          /* TEXT, CLASS */
                        )) : (e.openBlock(), e.createElementBlock("span", Gn, "—"))
                      ]),
                      e.createElementVNode("td", Hn, [
                        m.wantVisit ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 1 },
                          [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (M) => ae(m.id, "prepared")
                            }, e.toDisplayString(o.$t("已备货")), 9, Yn),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (M) => ae(m.id, "tried")
                            }, e.toDisplayString(o.$t("已试穿")), 9, Jn),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (M) => ae(m.id, "purchased")
                            }, e.toDisplayString(o.$t("成交")), 9, Xn),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (M) => ae(m.id, "left")
                            }, e.toDisplayString(o.$t("未成交")), 9, Zn)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-btn sm primary",
                          onClick: (M) => Qe(m.id)
                        }, e.toDisplayString(o.$t("想试实物")), 9, Qn))
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              Pn,
              e.toDisplayString(o.$t("有试穿图后，顾客点「想试实物」就会得到试穿码与推荐尺码")),
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
}), nl = /* @__PURE__ */ j(tl, [["__scopeId", "data-v-9bf72ce2"]]), ll = { class: "ap-gl" }, ol = { class: "ap-head" }, sl = { class: "ss-muted" }, al = ["disabled"], rl = { class: "ss-muted" }, il = {
  key: 0,
  class: "ss-empty"
}, cl = { class: "ap-gl__items" }, dl = ["onClick"], ul = ["src"], ml = {
  key: 0,
  class: "ss-panel ap-gl__edit"
}, pl = { class: "ap-head" }, gl = {
  key: 0,
  class: "ss-chip brand"
}, vl = ["disabled"], yl = { class: "ap-gl__top" }, kl = ["src"], hl = { class: "ss-grid" }, fl = { class: "ss-field" }, Vl = { class: "ss-field" }, El = { class: "ss-field" }, Nl = { class: "ss-field" }, _l = { class: "ss-field" }, bl = { class: "ss-field" }, $l = { class: "ss-field" }, Sl = { class: "ss-field" }, Dl = ["value"], wl = { class: "ss-field" }, Bl = { value: "women" }, Cl = { value: "men" }, Tl = { value: "kids" }, Al = { class: "ss-field" }, Ll = { class: "ss-field" }, Il = { class: "ap-stock" }, Ml = { class: "ss-subhead" }, Ul = { class: "ap-stock__row" }, Ol = ["onUpdate:modelValue"], zl = ["aria-label", "onClick"], Fl = { class: "ap-stock__add" }, Kl = ["placeholder", "onKeydown"], Pl = { class: "ap-check" }, Wl = { class: "ap-rec" }, Rl = { class: "ss-subhead" }, jl = { class: "ss-actions" }, ql = ["disabled"], Gl = ["disabled"], Hl = /* @__PURE__ */ e.defineComponent({
  __name: "GarmentsTab",
  setup(f) {
    const u = Q.useNotificationStore(), s = [r.t("春"), r.t("夏"), r.t("秋"), r.t("冬"), r.t("四季")], d = e.computed(() => K.value?.garments || []), y = e.ref(null), v = e.reactive({}), g = e.ref({ backgroundId: "B29", poseId: "P01", hairId: "H00" }), c = e.ref(""), t = e.ref(""), n = e.ref("");
    function V(l) {
      const a = d.value.find((i) => i.id === l);
      a && (y.value = a, Object.assign(v, JSON.parse(JSON.stringify(a))), g.value = a.recommended ? { ...a.recommended } : { backgroundId: "B29", backgroundVariant: "B29-1", poseId: "P01", poseVariant: "P01-1", hairId: "H00" }, c.value = a.tags.join(r.t("，")));
    }
    function D() {
      const l = t.value.trim().toUpperCase();
      l && !(l in v.stock) && (v.stock[l] = 0), t.value = "";
    }
    const A = e.ref(!1);
    function U(l) {
      A.value = !1;
      const a = w.droppedPaths(l, De);
      a.length && k(a);
    }
    async function k(l) {
      const a = l?.length ? l : await ie(!0, r.t("选择服装白底图 / 平铺图"));
      if (a.length) {
        n.value = "import";
        try {
          const i = await C("garments.import", { paths: a });
          await F();
          for (const $ of i)
            try {
              await C("garment.tag", { id: $.id });
            } catch (I) {
              u.warn(w.errorMessage(I));
              break;
            }
          await F(), i[0] && V(i[0].id);
        } catch (i) {
          u.error(w.errorMessage(i));
        } finally {
          n.value = "";
        }
      }
    }
    async function E() {
      if (y.value) {
        n.value = "tag";
        try {
          await C("garment.tag", { id: y.value.id }), await F(), V(y.value.id);
        } catch (l) {
          u.error(w.errorMessage(l));
        } finally {
          n.value = "";
        }
      }
    }
    async function h() {
      n.value = "save";
      try {
        await C("garment.save", { input: { ...v, tags: c.value.split(/[,，、\s]+/).filter(Boolean), recommended: g.value } }), await F(), V(v.id), u.success(r.t("已保存"));
      } catch (l) {
        u.error(w.errorMessage(l));
      } finally {
        n.value = "";
      }
    }
    async function B() {
      if (!(!y.value || !window.confirm(r.t("删除商品「{p0}」？", { p0: y.value.name }))))
        try {
          await C("garment.remove", { id: y.value.id }), y.value = null, await F();
        } catch (l) {
          u.error(w.errorMessage(l));
        }
    }
    return (l, a) => (e.openBlock(), e.createElementBlock("div", ll, [
      e.createElementVNode(
        "section",
        {
          class: e.normalizeClass(["ss-panel ap-gl__list", { over: A.value }]),
          onDragover: a[1] || (a[1] = e.withModifiers((i) => A.value = !0, ["prevent"])),
          onDragleave: a[2] || (a[2] = e.withModifiers((i) => A.value = !1, ["prevent"])),
          onDrop: e.withModifiers(U, ["prevent"])
        },
        [
          e.createElementVNode("header", ol, [
            e.createElementVNode("strong", null, [
              a[18] || (a[18] = e.createElementVNode(
                "i",
                { class: "ri-t-shirt-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(l.$t("商品库")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "span",
              sl,
              e.toDisplayString(l.$t("{n} 件，手机端上架 {m} 件", { n: d.value.length, m: d.value.filter((i) => i.onShelf).length })),
              1
              /* TEXT */
            ),
            a[20] || (a[20] = e.createElementVNode(
              "span",
              { class: "grow" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm primary",
              disabled: !!n.value,
              onClick: a[0] || (a[0] = (i) => k())
            }, [
              a[19] || (a[19] = e.createElementVNode(
                "i",
                { class: "ri-image-add-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(l.$t("导入服装图")),
                1
                /* TEXT */
              )
            ], 8, al)
          ]),
          e.createElementVNode(
            "p",
            rl,
            e.toDisplayString(l.$t("可把图片直接拖进来批量导入。")) + e.toDisplayString(l.$t("白底图或平铺图效果最好。导入后 AI 自动识别品类、颜色、风格、面料、季节与适用人群，并给一组推荐造型；识别结果可手改。经营自动化智能体的上下架与短视频也用这份商品库。")),
            1
            /* TEXT */
          ),
          d.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            il,
            e.toDisplayString(l.$t("还没有商品")),
            1
            /* TEXT */
          )),
          e.createElementVNode("div", cl, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(d.value, (i) => (e.openBlock(), e.createElementBlock("button", {
                key: i.id,
                type: "button",
                class: e.normalizeClass(["ap-gl__item", { on: y.value?.id === i.id }]),
                onClick: ($) => V(i.id)
              }, [
                e.createElementVNode("img", {
                  src: e.unref(P.fileUrl)(i.image),
                  alt: "",
                  loading: "lazy"
                }, null, 8, ul),
                e.createElementVNode("span", null, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(i.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString([i.category, i.color, i.style].filter(Boolean).join(" · ") || l.$t("未打标签")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    "¥" + e.toDisplayString(i.price) + " · " + e.toDisplayString(l.$t("库存 {n}", { n: e.unref(lt)(i.stock) })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "em",
                  {
                    class: e.normalizeClass(["ss-chip", i.onShelf ? "ok" : ""])
                  },
                  e.toDisplayString(i.onShelf ? l.$t("已上架") : l.$t("未上架")),
                  3
                  /* TEXT, CLASS */
                )
              ], 10, dl))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ],
        34
        /* CLASS, NEED_HYDRATION */
      ),
      y.value ? (e.openBlock(), e.createElementBlock("section", ml, [
        e.createElementVNode("header", pl, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(l.$t("编辑商品")),
            1
            /* TEXT */
          ),
          y.value.taggedBy ? (e.openBlock(), e.createElementBlock(
            "span",
            gl,
            e.toDisplayString(l.$t("AI 已打标签")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          a[21] || (a[21] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: !!n.value,
            onClick: E
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(n.value === "tag" ? "ri-loader-4-line spin" : "ri-price-tag-3-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(l.$t("AI 重新打标签")),
              1
              /* TEXT */
            )
          ], 8, vl)
        ]),
        e.createElementVNode("div", yl, [
          e.createElementVNode("img", {
            src: e.unref(P.fileUrl)(y.value.image),
            alt: ""
          }, null, 8, kl),
          e.createElementVNode("div", hl, [
            e.createElementVNode("label", fl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(l.$t("名称")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": a[3] || (a[3] = (i) => v.name = i),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  v.name,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", Vl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(l.$t("货号")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": a[4] || (a[4] = (i) => v.sku = i),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  v.sku,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", El, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(l.$t("价格（元）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": a[5] || (a[5] = (i) => v.price = i),
                  type: "number",
                  min: "0"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  v.price,
                  void 0,
                  { number: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", Nl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(l.$t("品类")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": a[6] || (a[6] = (i) => v.category = i),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  v.category,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", _l, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(l.$t("颜色")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": a[7] || (a[7] = (i) => v.color = i),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  v.color,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", bl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(l.$t("风格")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": a[8] || (a[8] = (i) => v.style = i),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  v.style,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", $l, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(l.$t("面料")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": a[9] || (a[9] = (i) => v.fabric = i),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  v.fabric,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", Sl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(l.$t("季节")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": a[10] || (a[10] = (i) => v.season = i)
                },
                [
                  a[22] || (a[22] = e.createElementVNode(
                    "option",
                    { value: "" },
                    "—",
                    -1
                    /* CACHED */
                  )),
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(s, (i) => e.createElementVNode("option", {
                      key: i,
                      value: i
                    }, e.toDisplayString(i), 9, Dl)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, v.season]
              ])
            ]),
            e.createElementVNode("label", wl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(l.$t("适用人群")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": a[11] || (a[11] = (i) => v.audience = i)
                },
                [
                  e.createElementVNode(
                    "option",
                    Bl,
                    e.toDisplayString(l.$t("女装")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "option",
                    Cl,
                    e.toDisplayString(l.$t("男装")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "option",
                    Tl,
                    e.toDisplayString(l.$t("童装")),
                    1
                    /* TEXT */
                  )
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, v.audience]
              ])
            ])
          ])
        ]),
        e.createElementVNode("label", Al, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(l.$t("卖点（上架文案、短视频脚本用）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": a[12] || (a[12] = (i) => v.sellingPoints = i),
              rows: "2"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, v.sellingPoints]
          ])
        ]),
        e.createElementVNode("label", Ll, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(l.$t("标签（逗号分隔）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": a[13] || (a[13] = (i) => c.value = i),
              type: "text"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, c.value]
          ])
        ]),
        e.createElementVNode("div", Il, [
          e.createElementVNode(
            "span",
            Ml,
            e.toDisplayString(l.$t("尺码与库存")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", Ul, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(v.stock, (i, $) => (e.openBlock(), e.createElementBlock("label", {
                key: $,
                class: "ap-stock__cell"
              }, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString($),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": (I) => v.stock[$] = I,
                  type: "number",
                  min: "0"
                }, null, 8, Ol), [
                  [
                    e.vModelText,
                    v.stock[$],
                    void 0,
                    { number: !0 }
                  ]
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  "aria-label": l.$t("删除"),
                  onClick: (I) => delete v.stock[$]
                }, [...a[23] || (a[23] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-close-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, zl)
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            e.createElementVNode("span", Fl, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": a[14] || (a[14] = (i) => t.value = i),
                type: "text",
                placeholder: l.$t("加尺码，如 XL 或 120"),
                onKeydown: e.withKeys(e.withModifiers(D, ["prevent"]), ["enter"])
              }, null, 40, Kl), [
                [
                  e.vModelText,
                  t.value,
                  void 0,
                  { trim: !0 }
                ]
              ]),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: D
                },
                e.toDisplayString(l.$t("添加")),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        e.createElementVNode("label", Pl, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": a[15] || (a[15] = (i) => v.onShelf = i),
              type: "checkbox"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelCheckbox, v.onShelf]
          ]),
          e.createTextVNode(
            e.toDisplayString(l.$t("在门店试穿手机端上架")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Wl, [
          e.createElementVNode(
            "span",
            Rl,
            e.toDisplayString(l.$t("推荐造型（店长推荐）")),
            1
            /* TEXT */
          ),
          e.createVNode(Ue, {
            modelValue: g.value,
            "onUpdate:modelValue": a[16] || (a[16] = (i) => g.value = i),
            audience: v.audience
          }, null, 8, ["modelValue", "audience"])
        ]),
        e.createElementVNode("div", jl, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: !!n.value,
            onClick: h
          }, [
            a[24] || (a[24] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(l.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, ql),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn ghost",
              onClick: a[17] || (a[17] = (i) => y.value = null)
            },
            e.toDisplayString(l.$t("关闭")),
            1
            /* TEXT */
          ),
          a[26] || (a[26] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm danger",
            disabled: !!n.value,
            onClick: B
          }, [
            a[25] || (a[25] = e.createElementVNode(
              "i",
              { class: "ri-delete-bin-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(l.$t("删除商品")),
              1
              /* TEXT */
            )
          ], 8, Gl)
        ])
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Ql = /* @__PURE__ */ j(Hl, [["__scopeId", "data-v-b9476c55"]]), Yl = new TextEncoder(), Jl = new TextDecoder();
function Xl(f) {
  const u = [], s = (c) => u.push(c & 255), d = (c) => {
    s(c >> 8), s(c);
  }, y = (c) => {
    s(c >>> 24), s(c >>> 16), s(c >>> 8), s(c);
  }, v = (c) => {
    for (const t of c) u.push(t);
  }, g = (c) => {
    if (c == null) {
      s(192);
      return;
    }
    if (c === !1) {
      s(194);
      return;
    }
    if (c === !0) {
      s(195);
      return;
    }
    if (typeof c == "number") {
      if (Number.isInteger(c) && c >= 0 && c <= 4294967295)
        c < 128 ? s(c) : c < 256 ? (s(204), s(c)) : c < 65536 ? (s(205), d(c)) : (s(206), y(c));
      else if (Number.isInteger(c) && c < 0 && c >= -2147483648)
        c >= -32 ? s(c) : c >= -128 ? (s(208), s(c)) : c >= -32768 ? (s(209), d(c)) : (s(210), y(c));
      else {
        const t = new Uint8Array(8);
        new DataView(t.buffer).setFloat64(0, c), s(203), v(t);
      }
      return;
    }
    if (typeof c == "string") {
      const t = Yl.encode(c), n = t.length;
      n < 32 ? s(160 | n) : n < 256 ? (s(217), s(n)) : n < 65536 ? (s(218), d(n)) : (s(219), y(n)), v(t);
      return;
    }
    if (c instanceof Uint8Array) {
      const t = c.length;
      t < 256 ? (s(196), s(t)) : t < 65536 ? (s(197), d(t)) : (s(198), y(t)), v(c);
      return;
    }
    if (Array.isArray(c)) {
      const t = c.length;
      t < 16 ? s(144 | t) : t < 65536 ? (s(220), d(t)) : (s(221), y(t));
      for (const n of c) g(n);
      return;
    }
    if (typeof c == "object") {
      const t = Object.entries(c).filter(([, V]) => V !== void 0), n = t.length;
      n < 16 ? s(128 | n) : n < 65536 ? (s(222), d(n)) : (s(223), y(n));
      for (const [V, D] of t)
        g(V), g(D);
      return;
    }
    throw new Error(`msgpack: unsupported ${typeof c}`);
  };
  return g(f), Uint8Array.from(u);
}
function Zl(f) {
  const u = new DataView(f.buffer, f.byteOffset, f.byteLength);
  let s = 0;
  const d = (t) => {
    const n = Jl.decode(f.subarray(s, s + t));
    return s += t, n;
  }, y = (t) => {
    const n = f.slice(s, s + t);
    return s += t, n;
  }, v = (t) => {
    const n = [];
    for (let V = 0; V < t; V += 1) n.push(c());
    return n;
  }, g = (t) => {
    const n = {};
    for (let V = 0; V < t; V += 1) {
      const D = c();
      n[String(D)] = c();
    }
    return n;
  }, c = () => {
    const t = u.getUint8(s++);
    if (t < 128) return t;
    if (t >= 224) return t - 256;
    if ((t & 240) === 128) return g(t & 15);
    if ((t & 240) === 144) return v(t & 15);
    if ((t & 224) === 160) return d(t & 31);
    switch (t) {
      case 192:
        return null;
      case 194:
        return !1;
      case 195:
        return !0;
      case 196: {
        const n = u.getUint8(s);
        return s += 1, y(n);
      }
      case 197: {
        const n = u.getUint16(s);
        return s += 2, y(n);
      }
      case 198: {
        const n = u.getUint32(s);
        return s += 4, y(n);
      }
      case 202: {
        const n = u.getFloat32(s);
        return s += 4, n;
      }
      case 203: {
        const n = u.getFloat64(s);
        return s += 8, n;
      }
      case 204: {
        const n = u.getUint8(s);
        return s += 1, n;
      }
      case 205: {
        const n = u.getUint16(s);
        return s += 2, n;
      }
      case 206: {
        const n = u.getUint32(s);
        return s += 4, n;
      }
      case 207: {
        const n = Number(u.getBigUint64(s));
        return s += 8, n;
      }
      case 208: {
        const n = u.getInt8(s);
        return s += 1, n;
      }
      case 209: {
        const n = u.getInt16(s);
        return s += 2, n;
      }
      case 210: {
        const n = u.getInt32(s);
        return s += 4, n;
      }
      case 211: {
        const n = Number(u.getBigInt64(s));
        return s += 8, n;
      }
      case 217: {
        const n = u.getUint8(s);
        return s += 1, d(n);
      }
      case 218: {
        const n = u.getUint16(s);
        return s += 2, d(n);
      }
      case 219: {
        const n = u.getUint32(s);
        return s += 4, d(n);
      }
      case 220: {
        const n = u.getUint16(s);
        return s += 2, v(n);
      }
      case 221: {
        const n = u.getUint32(s);
        return s += 4, v(n);
      }
      case 222: {
        const n = u.getUint16(s);
        return s += 2, g(n);
      }
      case 223: {
        const n = u.getUint32(s);
        return s += 4, g(n);
      }
      default:
        throw new Error(`msgpack: unsupported byte 0x${t.toString(16)}`);
    }
  };
  return c();
}
const xl = { class: "ap-live" }, eo = { class: "ss-panel" }, to = { class: "ap-head" }, no = {
  key: 0,
  class: "ss-muted",
  "data-test": "ap-live-timer"
}, lo = ["disabled"], oo = { class: "ss-muted" }, so = {
  key: 0,
  class: "ss-note warn"
}, ao = {
  key: 1,
  class: "ss-note danger",
  "data-test": "ap-live-error"
}, ro = { class: "ap-live__grid" }, io = { class: "ss-panel" }, co = { class: "ap-head" }, uo = {
  class: "ap-live__modes",
  role: "radiogroup"
}, mo = ["aria-checked", "data-test", "onClick"], po = { class: "ap-head" }, go = { class: "ss-muted" }, vo = {
  key: 0,
  class: "ap-live__pick"
}, yo = {
  key: 0,
  class: "ss-empty"
}, ko = ["title", "data-test", "onClick"], ho = ["src"], fo = {
  key: 1,
  class: "ap-live__pick"
}, Vo = {
  key: 0,
  class: "ss-empty"
}, Eo = ["title", "onClick"], No = ["src"], _o = { class: "ss-panel" }, bo = { class: "ap-head" }, $o = { class: "ss-muted" }, So = { class: "ap-live__videos" }, Do = /* @__PURE__ */ e.defineComponent({
  __name: "LiveTab",
  setup(f) {
    const u = [
      { key: "outfit", icon: "ri-t-shirt-line", title: r.t("实时换衣"), desc: r.t("顾客站在镜头前，画面里身上换成选中的衣服") },
      { key: "person", icon: "ri-user-shared-line", title: r.t("店员代穿"), desc: r.t("店员穿着实物站在镜头前，画面里换成顾客本人（需顾客授权的照片）") }
    ], s = [{ urls: "stun:stun.l.google.com:19302" }], d = K, y = e.ref("outfit"), v = e.ref(""), g = e.ref(""), c = e.ref("idle"), t = e.ref(""), n = e.ref(""), V = e.ref(0), D = e.ref(180), A = e.ref(null), U = e.ref(null), k = e.computed(() => (d.value?.garments || []).filter((b) => !!b.image)), E = e.computed(() => (d.value?.customers || []).filter((b) => !b.purgedAt && !!b.photo && !!b.consentAt && !b.demoPlaceholder)), h = e.computed(() => !!d.value?.imageReady && (y.value === "outfit" ? !!v.value : !!g.value)), B = e.computed(() => t.value || { idle: r.t("未连接"), connecting: r.t("连接中…"), live: r.t("直播中"), error: r.t("已停止") }[c.value]);
    let l = null, a = null, i = null, $ = [], I = null, N = null, T = 0, O = 0;
    const te = (b) => {
      l?.readyState === WebSocket.OPEN && l.send(Xl(b));
    }, z = () => I && te({ prompt: I.prompt, enable_prompt_expansion: !0, reference_image_url: I.referenceImage }), q = () => y.value === "outfit" ? { mode: y.value, garmentId: v.value } : { mode: y.value, customerId: g.value };
    async function R() {
      X(!1), n.value = "", c.value = "connecting", t.value = r.t("连接中…");
      const b = ++O;
      try {
        const _ = await C("live.start", q());
        if (b !== O) return;
        if (I = { prompt: _.prompt, referenceImage: _.referenceImage }, D.value = _.maxSeconds, i = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, frameRate: 30 } }), b !== O) {
          i.getTracks().forEach((S) => S.stop());
          return;
        }
        A.value && (A.value.srcObject = i), l = new WebSocket(_.url), l.binaryType = "arraybuffer", l.onopen = () => z(), l.onmessage = (S) => {
          G(S).catch((L) => J(w.errorMessage(L)));
        }, l.onclose = (S) => {
          b === O && c.value !== "idle" && J(r.t("连接已关闭（{p0}）", { p0: `${S.code}${S.reason ? ` ${S.reason}` : ""}` }));
        }, T = Date.now(), V.value = 0, N = setInterval(() => {
          V.value = Math.round((Date.now() - T) / 1e3), V.value >= D.value && X();
        }, 1e3);
      } catch (_) {
        const S = _?.name;
        J(S === "NotAllowedError" || S === "NotFoundError" ? r.t("打不开摄像头：请确认电脑有摄像头，并在系统设置里允许本应用使用摄像头") : w.errorMessage(_));
      }
    }
    async function G(b) {
      const _ = typeof b.data == "string" ? JSON.parse(b.data) : Zl(new Uint8Array(b.data)), S = String(_?.type || "").toLowerCase();
      if (_?.error) {
        J(r.t("实时试衣服务报错：{p0}", { p0: `${_.error} ${_.reason ?? ""}`.trim() }));
        return;
      }
      if (S === "ready" || S === "iceservers") {
        const L = _.iceServers ?? _.iceservers ?? _.ice_servers;
        if (L) {
          await Y(L);
          return;
        }
        const me = l;
        setTimeout(() => {
          me === l && Y(s);
        }, 1e3);
      } else if (S === "answer" && a) {
        await a.setRemoteDescription({ type: "answer", sdp: _.sdp });
        for (const L of $.splice(0)) await a.addIceCandidate(L);
      } else S === "icecandidate" && _.candidate && (a?.remoteDescription ? await a.addIceCandidate(_.candidate) : $.push(_.candidate));
    }
    async function Y(b) {
      if (a || !i) return;
      const _ = a = new RTCPeerConnection({ iceServers: b });
      i.getTracks().forEach((L) => _.addTrack(L, i)), _.ontrack = (L) => {
        U.value && (U.value.srcObject = L.streams[0] ?? new MediaStream([L.track]));
      }, _.onicecandidate = ({ candidate: L }) => {
        L && te({ type: "icecandidate", candidate: { candidate: L.candidate, sdpMid: L.sdpMid, sdpMLineIndex: L.sdpMLineIndex } });
      }, _.onconnectionstatechange = () => {
        const L = _.connectionState;
        L === "connected" ? (c.value = "live", t.value = r.t("直播中")) : L === "failed" ? J(r.t("视频连接失败：网络可能挡住了 UDP，换个网络再试")) : L === "disconnected" ? t.value = r.t("视频断开，正在重连…") : L === "connecting" && (t.value = r.t("连接视频中…"));
      };
      const S = await _.createOffer();
      await _.setLocalDescription(S), te({ type: "offer", sdp: S.sdp });
    }
    async function oe() {
      if (l)
        try {
          I = await C("live.ref", q()), z(), t.value = r.t("已换，稍等几秒");
        } catch (b) {
          n.value = w.errorMessage(b);
        }
    }
    function W(b) {
      v.value = b, oe();
    }
    function ue(b) {
      g.value = b, oe();
    }
    function se(b) {
      if (y.value === b) return;
      const _ = !!l;
      X(), y.value = b, _ && h.value && R();
    }
    function J(b) {
      X(!1, b), c.value = "error", n.value = b, t.value = "";
    }
    function X(b = !0, _) {
      const S = !!l || !!i;
      if (O += 1, l) {
        l.onclose = null, l.onmessage = null;
        try {
          l.close();
        } catch {
        }
      }
      try {
        a?.close();
      } catch {
      }
      if (i?.getTracks().forEach((L) => L.stop()), l = null, a = null, i = null, $ = [], I = null, N && (clearInterval(N), N = null), A.value && (A.value.srcObject = null), U.value && (U.value.srcObject = null), S && T) {
        const L = Math.round((Date.now() - T) / 1e3);
        C("live.ended", { mode: y.value, seconds: L, ok: !_, ..._ ? { error: _ } : {} }).catch(() => {
        });
      }
      T = 0, b && (c.value = "idle", t.value = "");
    }
    return e.onBeforeUnmount(() => X()), (b, _) => (e.openBlock(), e.createElementBlock("div", xl, [
      e.createElementVNode("section", eo, [
        e.createElementVNode("header", to, [
          e.createElementVNode("strong", null, [
            _[1] || (_[1] = e.createElementVNode(
              "i",
              { class: "ri-live-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(b.$t("实时试衣")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ss-chip", c.value === "live" ? "ok" : c.value === "error" ? "danger" : ""])
            },
            e.toDisplayString(B.value),
            3
            /* TEXT, CLASS */
          ),
          c.value === "live" || c.value === "connecting" ? (e.openBlock(), e.createElementBlock(
            "span",
            no,
            e.toDisplayString(b.$t("已用 {a} 秒 / 最长 {b} 秒", { a: V.value, b: D.value })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          _[4] || (_[4] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          c.value === "idle" || c.value === "error" ? (e.openBlock(), e.createElementBlock("button", {
            key: 1,
            type: "button",
            class: "ss-btn primary",
            disabled: !h.value,
            "data-test": "ap-live-start",
            onClick: R
          }, [
            _[2] || (_[2] = e.createElementVNode(
              "i",
              { class: "ri-play-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(b.$t("开始")),
              1
              /* TEXT */
            )
          ], 8, lo)) : (e.openBlock(), e.createElementBlock("button", {
            key: 2,
            type: "button",
            class: "ss-btn",
            "data-test": "ap-live-stop",
            onClick: _[0] || (_[0] = (S) => X())
          }, [
            _[3] || (_[3] = e.createElementVNode(
              "i",
              { class: "ri-stop-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(b.$t("停止")),
              1
              /* TEXT */
            )
          ]))
        ]),
        e.createElementVNode(
          "p",
          oo,
          e.toDisplayString(b.$t("摄像头画面实时交给 AI：几秒后右边就是穿上所选衣服的样子，顾客转身、走动都跟着变。实时模型按秒计费，单次最长 {n} 秒自动停；不用时请点「停止」。", { n: D.value })),
          1
          /* TEXT */
        ),
        e.unref(d)?.imageReady ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", so, [
          _[5] || (_[5] = e.createElementVNode(
            "i",
            { class: "ri-key-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(b.$t("还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发")),
            1
            /* TEXT */
          )
        ])),
        n.value ? (e.openBlock(), e.createElementBlock("p", ao, [
          _[6] || (_[6] = e.createElementVNode(
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
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("div", ro, [
        e.createElementVNode("section", io, [
          e.createElementVNode("header", co, [
            _[7] || (_[7] = e.createElementVNode(
              "span",
              { class: "ap-live__no" },
              "1",
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(b.$t("选方式")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", uo, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(u, (S) => e.createElementVNode("button", {
                key: S.key,
                type: "button",
                role: "radio",
                class: e.normalizeClass(["ap-live__mode", { on: y.value === S.key }]),
                "aria-checked": y.value === S.key,
                "data-test": `ap-live-mode-${S.key}`,
                onClick: (L) => se(S.key)
              }, [
                e.createElementVNode("strong", null, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(S.icon)
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(S.title),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(S.desc),
                  1
                  /* TEXT */
                )
              ], 10, mo)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.createElementVNode("header", po, [
            _[8] || (_[8] = e.createElementVNode(
              "span",
              { class: "ap-live__no" },
              "2",
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(y.value === "outfit" ? b.$t("选衣服") : b.$t("选顾客")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              go,
              e.toDisplayString(y.value === "outfit" ? b.$t("上衣、外套、连衣裙效果最好；直播中点别的衣服几秒内就换") : b.$t("只列出已授权、已上传照片的顾客")),
              1
              /* TEXT */
            )
          ]),
          y.value === "outfit" ? (e.openBlock(), e.createElementBlock("div", vo, [
            k.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              yo,
              e.toDisplayString(b.$t("商品库还没有带商品图的衣服：先到「商品库」导入，或点右上角「演示模式」")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(k.value, (S) => (e.openBlock(), e.createElementBlock("button", {
                key: S.id,
                type: "button",
                class: e.normalizeClass(["ap-live__item", { on: v.value === S.id }]),
                title: S.name,
                "data-test": `ap-live-garment-${S.id}`,
                onClick: (L) => W(S.id)
              }, [
                e.createElementVNode("img", {
                  src: e.unref(P.fileUrl)(S.image),
                  alt: "",
                  loading: "lazy"
                }, null, 8, ho),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(S.name),
                  1
                  /* TEXT */
                )
              ], 10, ko))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : (e.openBlock(), e.createElementBlock("div", fo, [
            E.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              Vo,
              e.toDisplayString(b.$t("还没有可用的顾客照片：先在「一键换装」里给顾客建档、勾选授权并上传照片")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(E.value, (S) => (e.openBlock(), e.createElementBlock("button", {
                key: S.id,
                type: "button",
                class: e.normalizeClass(["ap-live__item", { on: g.value === S.id }]),
                title: S.nickname,
                onClick: (L) => ue(S.id)
              }, [
                e.createElementVNode("img", {
                  src: e.unref(P.fileUrl)(S.photo),
                  alt: "",
                  loading: "lazy"
                }, null, 8, No),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(S.nickname),
                  1
                  /* TEXT */
                )
              ], 10, Eo))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]))
        ]),
        e.createElementVNode("section", _o, [
          e.createElementVNode("header", bo, [
            _[9] || (_[9] = e.createElementVNode(
              "span",
              { class: "ap-live__no" },
              "3",
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(b.$t("看效果")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              $o,
              e.toDisplayString(y.value === "outfit" ? b.$t("请顾客站在镜头前，上半身入镜") : b.$t("请店员穿上实物站在镜头前")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", So, [
            e.createElementVNode("figure", null, [
              e.createElementVNode(
                "video",
                {
                  ref_key: "camEl",
                  ref: A,
                  class: "mirror",
                  autoplay: "",
                  muted: "",
                  playsinline: ""
                },
                null,
                512
                /* NEED_PATCH */
              ),
              e.createElementVNode(
                "figcaption",
                null,
                e.toDisplayString(b.$t("摄像头原画")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("figure", null, [
              e.createElementVNode(
                "video",
                {
                  ref_key: "outEl",
                  ref: U,
                  autoplay: "",
                  muted: "",
                  playsinline: "",
                  "data-test": "ap-live-output"
                },
                null,
                512
                /* NEED_PATCH */
              ),
              e.createElementVNode(
                "figcaption",
                null,
                e.toDisplayString(b.$t("AI 实时画面")),
                1
                /* TEXT */
              )
            ])
          ])
        ])
      ])
    ]));
  }
}), wo = /* @__PURE__ */ j(Do, [["__scopeId", "data-v-2c1f2396"]]), Bo = { class: "ap-lib" }, Co = { class: "ap-lib__head" }, To = {
  class: "ap-lib__kinds",
  role: "tablist"
}, Ao = ["onClick"], Lo = { class: "ss-muted" }, Io = { class: "ss-muted" }, Mo = ["disabled"], Uo = {
  key: 0,
  class: "ss-note warn"
}, Oo = { class: "ap-lib__cards" }, zo = ["title"], Fo = ["checked", "onChange"], Ko = ["src"], Po = {
  key: 1,
  class: "ss-muted"
}, Wo = { class: "ap-lib__vars" }, Ro = { class: "ss-muted" }, jo = /* @__PURE__ */ e.defineComponent({
  __name: "StylesTab",
  setup(f) {
    const u = Q.useNotificationStore(), s = ["background", "pose", "hair"], d = e.ref("background"), y = e.computed(() => K.value?.settings.disabledOptions || []), v = e.computed(() => ne.value.filter((h) => h.kind === d.value)), g = e.computed(() => [...new Set(v.value.map((h) => h.group))]), c = (h) => v.value.filter((B) => B.group === h), t = (h) => ne.value.filter((B) => B.kind === h).length, n = e.computed(() => K.value?.thumbs || {}), V = e.computed(() => ne.value.filter((h) => !h.needsUpload && h.id !== "H00")), D = e.computed(() => V.value.length), A = e.computed(() => V.value.filter((h) => n.value[h.id]).length), U = e.ref(!1);
    async function k() {
      U.value = !0;
      try {
        const h = await C("options.thumbs", {});
        await F(), h.errors.length ? u.warn(r.t("生成了 {n} 张，{m} 张失败：{p0}", { n: h.made, m: h.errors.length, p0: h.errors[0] })) : u.success(r.t("已生成 {n} 张示意图", { n: h.made }));
      } catch (h) {
        u.error(w.errorMessage(h));
      } finally {
        U.value = !1;
      }
    }
    async function E(h) {
      const B = new Set(y.value);
      B.has(h) ? B.delete(h) : B.add(h);
      try {
        await C("settings.patch", { patch: { disabledOptions: [...B] } }), await F();
      } catch (l) {
        u.error(w.errorMessage(l));
      }
    }
    return (h, B) => (e.openBlock(), e.createElementBlock("section", Bo, [
      e.createElementVNode("header", Co, [
        e.createElementVNode("div", To, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(s, (l) => e.createElementVNode("button", {
              key: l,
              type: "button",
              role: "tab",
              class: e.normalizeClass({ on: d.value === l }),
              onClick: (a) => d.value = l
            }, [
              e.createTextVNode(
                e.toDisplayString(e.unref(Ae)(l)) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(t(l)),
                1
                /* TEXT */
              )
            ], 10, Ao)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        e.createElementVNode(
          "span",
          Lo,
          e.toDisplayString(h.$t("关掉的选项在顾客手机端不显示；每项都能再选细分场景")),
          1
          /* TEXT */
        ),
        B[0] || (B[0] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          Io,
          e.toDisplayString(h.$t("示意图 {a} / {b}", { a: A.value, b: D.value })),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: U.value || A.value >= D.value,
          onClick: k
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(U.value ? "ri-loader-4-line spin" : "ri-image-ai-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(h.$t("生成缺少的示意图")),
            1
            /* TEXT */
          )
        ], 8, Mo)
      ]),
      e.unref(K)?.imageReady ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Uo, [
        B[1] || (B[1] = e.createElementVNode(
          "i",
          { class: "ri-key-2-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(h.$t("示意图用图像服务生成（每张约 0.02～0.2 元）；还没有配置图像服务")),
          1
          /* TEXT */
        )
      ])),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(g.value, (l) => (e.openBlock(), e.createElementBlock("div", {
          key: l,
          class: "ap-lib__group"
        }, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(l),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", Oo, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(c(l), (a) => (e.openBlock(), e.createElementBlock(
                "article",
                {
                  key: a.id,
                  class: e.normalizeClass(["ap-lib__card", { off: y.value.includes(a.id) }])
                },
                [
                  e.createElementVNode("header", null, [
                    e.createElementVNode(
                      "code",
                      null,
                      e.toDisplayString(a.id),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(a.label),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("label", {
                      class: "ap-switch",
                      title: y.value.includes(a.id) ? h.$t("已关闭") : h.$t("已开启")
                    }, [
                      e.createElementVNode("input", {
                        type: "checkbox",
                        checked: !y.value.includes(a.id),
                        onChange: (i) => E(a.id)
                      }, null, 40, Fo),
                      B[2] || (B[2] = e.createElementVNode(
                        "span",
                        null,
                        null,
                        -1
                        /* CACHED */
                      ))
                    ], 8, zo)
                  ]),
                  n.value[a.id] ? (e.openBlock(), e.createElementBlock("img", {
                    key: 0,
                    src: e.unref(P.fileUrl)(n.value[a.id]),
                    alt: "",
                    class: "ap-lib__thumb",
                    loading: "lazy"
                  }, null, 8, Ko)) : e.createCommentVNode("v-if", !0),
                  a.detail ? (e.openBlock(), e.createElementBlock(
                    "p",
                    Po,
                    e.toDisplayString(a.detail),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("div", Wo, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(a.variants, (i) => (e.openBlock(), e.createElementBlock(
                        "span",
                        {
                          key: i.id
                        },
                        e.toDisplayString(i.label),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]),
                  e.createElementVNode(
                    "small",
                    Ro,
                    e.toDisplayString(a.audience.map(e.unref(Le)).join(" / ")),
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
        ]))),
        128
        /* KEYED_FRAGMENT */
      ))
    ]));
  }
}), qo = /* @__PURE__ */ j(jo, [["__scopeId", "data-v-b66be867"]]), Go = { class: "ap-mob" }, Ho = { class: "ss-panel" }, Qo = { class: "ap-head" }, Yo = {
  key: 0,
  class: "ss-muted"
}, Jo = ["disabled"], Xo = ["disabled"], Zo = { class: "ss-muted" }, xo = {
  key: 0,
  class: "ap-mob__qr"
}, es = ["src"], ts = { class: "ap-mob__info" }, ns = { class: "ss-actions" }, ls = { class: "ss-muted" }, os = { class: "ss-muted" }, ss = { class: "ss-panel" }, as = { class: "ap-head" }, rs = { class: "ss-muted" }, is = {
  key: 0,
  class: "ss-empty"
}, cs = {
  key: 1,
  class: "ss-table-wrap"
}, ds = { class: "ss-table" }, us = ["onClick"], ms = /* @__PURE__ */ e.defineComponent({
  __name: "MobileTab",
  emits: ["open-customer"],
  setup(f) {
    const u = Q.useNotificationStore(), s = K, d = e.computed(() => s.value?.mobile), y = e.ref(""), v = e.ref(!1), g = e.computed(() => (s.value?.customers || []).filter((k) => k.source === "mobile")), c = (k) => (s.value?.tryons || []).filter((E) => E.customerId === k);
    e.watch(() => d.value?.joinUrl, async (k) => {
      y.value = k ? await be.toDataURL(k, { margin: 1, width: 240 }) : "";
    }, { immediate: !0 });
    async function t(k) {
      v.value = !0;
      try {
        await C(k), await F();
      } catch (E) {
        u.error(w.errorMessage(E));
      } finally {
        v.value = !1;
      }
    }
    const n = () => t("mobile.start"), V = () => t("mobile.stop");
    async function D() {
      window.confirm(r.t("更换门店码？已打印的旧码会失效。")) && await t("mobile.rotateKey");
    }
    async function A(k) {
      try {
        await navigator.clipboard.writeText(k), u.success(r.t("已复制"));
      } catch (E) {
        u.error(w.errorMessage(E));
      }
    }
    async function U() {
      if (!y.value) return;
      const k = new Image();
      k.src = y.value, await k.decode();
      const E = document.createElement("canvas");
      E.width = 600, E.height = 760;
      const h = E.getContext("2d");
      h.fillStyle = "#fff", h.fillRect(0, 0, E.width, E.height), h.fillStyle = "#222", h.textAlign = "center", h.font = '700 36px -apple-system, "PingFang SC", sans-serif', h.fillText(s.value?.settings.storeName || "", 300, 80), h.font = '24px -apple-system, "PingFang SC", sans-serif', h.fillText(r.t("连店内 Wi-Fi，扫码 AI 试穿"), 300, 130), h.drawImage(k, 90, 170, 420, 420);
      const B = document.createElement("a");
      B.href = E.toDataURL("image/png"), B.download = `${s.value?.settings.storeName || "store"}-${r.t("门店码")}.png`, B.click();
    }
    return (k, E) => (e.openBlock(), e.createElementBlock("div", Go, [
      e.createElementVNode("section", Ho, [
        e.createElementVNode("header", Qo, [
          e.createElementVNode("strong", null, [
            E[1] || (E[1] = e.createElementVNode(
              "i",
              { class: "ri-smartphone-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(k.$t("门店手机端")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ss-chip", d.value?.running ? "ok" : ""])
            },
            e.toDisplayString(d.value?.running ? k.$t("运行中") : k.$t("未开启")),
            3
            /* TEXT, CLASS */
          ),
          d.value?.running ? (e.openBlock(), e.createElementBlock(
            "span",
            Yo,
            e.toDisplayString(k.$t("最近 10 分钟在线 {n} 位顾客", { n: d.value.activeSessions })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          E[4] || (E[4] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          d.value?.running ? (e.openBlock(), e.createElementBlock("button", {
            key: 2,
            type: "button",
            class: "ss-btn",
            disabled: v.value,
            onClick: V
          }, [
            E[3] || (E[3] = e.createElementVNode(
              "i",
              { class: "ri-stop-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(k.$t("关闭")),
              1
              /* TEXT */
            )
          ], 8, Xo)) : (e.openBlock(), e.createElementBlock("button", {
            key: 1,
            type: "button",
            class: "ss-btn primary",
            disabled: v.value,
            onClick: n
          }, [
            E[2] || (E[2] = e.createElementVNode(
              "i",
              { class: "ri-play-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(k.$t("开启手机服务")),
              1
              /* TEXT */
            )
          ], 8, Jo))
        ]),
        e.createElementVNode(
          "p",
          Zo,
          e.toDisplayString(k.$t("顾客连店内 Wi-Fi 扫下面的门店码，用手机浏览器即可：授权 → 拍照 → 选衣服与造型 → 生成试穿图 → 想试实物拿试穿码。照片只存在这台电脑上，不需要小程序。")),
          1
          /* TEXT */
        ),
        d.value?.running && d.value.joinUrl ? (e.openBlock(), e.createElementBlock("div", xo, [
          y.value ? (e.openBlock(), e.createElementBlock("img", {
            key: 0,
            src: y.value,
            alt: ""
          }, null, 8, es)) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", ts, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(e.unref(s)?.settings.storeName),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "code",
              null,
              e.toDisplayString(d.value.joinUrl),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", ns, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                onClick: E[0] || (E[0] = (h) => A(d.value.joinUrl))
              }, [
                E[5] || (E[5] = e.createElementVNode(
                  "i",
                  { class: "ri-file-copy-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(k.$t("复制链接")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                onClick: U
              }, [
                E[6] || (E[6] = e.createElementVNode(
                  "i",
                  { class: "ri-download-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(k.$t("保存门店码图片（打印用）")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                onClick: D
              }, [
                E[7] || (E[7] = e.createElementVNode(
                  "i",
                  { class: "ri-refresh-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(k.$t("更换门店码")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode(
              "small",
              ls,
              e.toDisplayString(k.$t("更换后旧码立刻失效（已进来的顾客不受影响）。建议贴在试衣间、收银台。")),
              1
              /* TEXT */
            ),
            d.value.candidates.length ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "small",
                  os,
                  e.toDisplayString(k.$t("顾客扫码打不开？换下面的地址试试（电脑有多块网卡时）：")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(d.value.candidates, (h) => (e.openBlock(), e.createElementBlock(
                    "code",
                    {
                      key: h,
                      class: "ap-mob__alt"
                    },
                    e.toDisplayString(h),
                    1
                    /* TEXT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("section", ss, [
        e.createElementVNode("header", as, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(k.$t("手机端顾客")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            rs,
            e.toDisplayString(k.$t("按时间倒序")),
            1
            /* TEXT */
          )
        ]),
        g.value.length ? (e.openBlock(), e.createElementBlock("div", cs, [
          e.createElementVNode("table", ds, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("顾客")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("照片")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("试穿图")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("想试实物")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(k.$t("进入时间")),
                  1
                  /* TEXT */
                ),
                E[8] || (E[8] = e.createElementVNode(
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
                e.renderList(g.value, (h) => (e.openBlock(), e.createElementBlock("tr", {
                  key: h.id
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(h.nickname),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(h.purgedAt ? k.$t("已清除") : h.photo ? k.$t("已上传") : "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(c(h.id).filter((B) => B.status === "done").length),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(c(h.id).filter((B) => B.wantVisit).length),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(e.unref(w.fmtDateTime)(h.createdAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    h.purgedAt ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: (B) => k.$emit("open-customer", h.id)
                    }, e.toDisplayString(k.$t("在一键换装里打开")), 9, us))
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          is,
          e.toDisplayString(k.$t("还没有顾客通过手机端使用")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), ps = /* @__PURE__ */ j(ms, [["__scopeId", "data-v-b4e67dc8"]]), gs = { class: "ap-ci" }, vs = { class: "ss-panel" }, ys = { class: "ap-head" }, ks = { class: "ss-muted" }, hs = ["placeholder"], fs = ["disabled"], Vs = {
  key: 0,
  class: "ss-note danger"
}, Es = {
  key: 1,
  class: "ap-ci__hit"
}, Ns = ["src"], _s = { class: "ap-ci__info" }, bs = { class: "ss-muted" }, $s = {
  key: 0,
  class: "ss-note warn"
}, Ss = { key: 1 }, Ds = { class: "ss-field ap-ci__size" }, ws = ["value"], Bs = { class: "ss-actions" }, Cs = ["onClick"], Ts = { class: "ss-muted" }, As = { class: "ss-panel" }, Ls = { class: "ap-head" }, Is = { class: "ss-muted" }, Ms = {
  key: 0,
  class: "ss-empty"
}, Us = {
  key: 1,
  class: "ss-table-wrap"
}, Os = { class: "ss-table" }, zs = { class: "ap-code" }, Fs = ["onClick"], Ks = /* @__PURE__ */ e.defineComponent({
  __name: "CheckinTab",
  setup(f) {
    const u = Q.useNotificationStore(), s = ["prepared", "tried", "purchased", "left"], d = e.ref(""), y = e.ref(""), v = e.ref(!1), g = e.ref(""), c = e.ref(""), t = e.computed(() => K.value?.tryons.find((l) => l.id === y.value) || null), n = e.computed(() => t.value ? A(t.value.garmentId) : void 0), V = e.computed(() => K.value?.customers.find((l) => l.id === t.value?.customerId)), D = e.computed(() => (K.value?.tryons || []).filter((l) => l.wantVisit && (!l.visit || l.visit.status === "prepared"))), A = (l) => K.value?.garments.find((a) => a.id === l), U = (l) => K.value?.customers.find((a) => a.id === l)?.nickname || "—";
    async function k() {
      v.value = !1;
      try {
        const l = await C("tryon.byCode", { code: d.value });
        y.value = l?.id || "", v.value = !l, c.value = l?.size || "", g.value = l?.visit?.size || l?.size || "";
      } catch (l) {
        u.error(w.errorMessage(l));
      }
    }
    function E(l) {
      const a = new Date(l.wantAt || l.createdAt), i = /* @__PURE__ */ new Date();
      return a.toDateString() === i.toDateString();
    }
    function h(l) {
      d.value = l, k();
    }
    async function B(l) {
      if (t.value)
        try {
          await C("tryon.visit", { id: t.value.id, status: l, size: g.value }), await F();
        } catch (a) {
          u.error(w.errorMessage(a));
        }
    }
    return (l, a) => (e.openBlock(), e.createElementBlock("div", gs, [
      e.createElementVNode("section", vs, [
        e.createElementVNode("header", ys, [
          e.createElementVNode("strong", null, [
            a[2] || (a[2] = e.createElementVNode(
              "i",
              { class: "ri-qr-scan-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(l.$t("到店核销")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            ks,
            e.toDisplayString(l.$t("顾客出示 6 位试穿码；读混 0/O、1/I 也能认")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "form",
          {
            class: "ap-ci__form",
            onSubmit: e.withModifiers(k, ["prevent"])
          },
          [
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": a[0] || (a[0] = (i) => d.value = i),
              type: "text",
              maxlength: "8",
              placeholder: l.$t("输入试穿码"),
              autofocus: ""
            }, null, 8, hs), [
              [e.vModelText, d.value]
            ]),
            e.createElementVNode("button", {
              type: "submit",
              class: "ss-btn primary",
              disabled: d.value.trim().length < 6
            }, [
              a[3] || (a[3] = e.createElementVNode(
                "i",
                { class: "ri-search-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(l.$t("查找")),
                1
                /* TEXT */
              )
            ], 8, fs)
          ],
          32
          /* NEED_HYDRATION */
        ),
        v.value ? (e.openBlock(), e.createElementBlock("p", Vs, [
          a[4] || (a[4] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(l.$t("没有找到这个试穿码")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        t.value ? (e.openBlock(), e.createElementBlock("div", Es, [
          t.value.image ? (e.openBlock(), e.createElementBlock("img", {
            key: 0,
            src: e.unref(P.fileUrl)(t.value.image),
            alt: ""
          }, null, 8, Ns)) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", _s, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(n.value?.name || l.$t("已删除的商品")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              bs,
              e.toDisplayString(V.value?.nickname) + " · " + e.toDisplayString(e.unref(H)(t.value.choice)),
              1
              /* TEXT */
            ),
            E(t.value) ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", $s, [
              a[5] || (a[5] = e.createElementVNode(
                "i",
                { class: "ri-time-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(l.$t("试穿码已过期（当天有效，生成于 {p0}）。确认是本人后仍可登记。", { p0: e.unref(w.fmtDateTime)(t.value.wantAt || t.value.createdAt) })),
                1
                /* TEXT */
              )
            ])),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(l.$t("{p0}：", { p0: l.$t("推荐尺码") })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(t.value.size || c.value || l.$t("未填身高，按顾客意愿")),
                1
                /* TEXT */
              )
            ]),
            n.value ? (e.openBlock(), e.createElementBlock("span", Ss, [
              e.createTextVNode(
                e.toDisplayString(l.$t("{p0}：", { p0: l.$t("库存") })),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(n.value.stock, (i, $) => (e.openBlock(), e.createElementBlock(
                  "span",
                  {
                    key: $,
                    class: e.normalizeClass(["ss-chip", i > 0 ? "" : "bad"])
                  },
                  e.toDisplayString($) + " × " + e.toDisplayString(i),
                  3
                  /* TEXT, CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("label", Ds, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(l.$t("实际尺码")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": a[1] || (a[1] = (i) => g.value = i)
                },
                [
                  a[6] || (a[6] = e.createElementVNode(
                    "option",
                    { value: "" },
                    "—",
                    -1
                    /* CACHED */
                  )),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(n.value?.stock || {}, (i, $) => (e.openBlock(), e.createElementBlock("option", {
                      key: $,
                      value: $
                    }, e.toDisplayString($), 9, ws))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, g.value]
              ])
            ]),
            e.createElementVNode("div", Bs, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(s, (i) => e.createElementVNode("button", {
                  key: i,
                  type: "button",
                  class: e.normalizeClass(["ss-btn sm", { primary: t.value.visit?.status === i }]),
                  onClick: ($) => B(i)
                }, e.toDisplayString(e.unref(Ie)(i)), 11, Cs)),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode(
              "small",
              Ts,
              e.toDisplayString(l.$t("登记「成交」会自动扣减该尺码库存 1 件")),
              1
              /* TEXT */
            )
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("section", As, [
        e.createElementVNode("header", Ls, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(l.$t("待到店")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            Is,
            e.toDisplayString(l.$t("顾客点了「想试实物」，还没登记结果")),
            1
            /* TEXT */
          )
        ]),
        D.value.length ? (e.openBlock(), e.createElementBlock("div", Us, [
          e.createElementVNode("table", Os, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(l.$t("试穿码")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(l.$t("顾客")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(l.$t("款式")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(l.$t("推荐尺码")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(l.$t("时间")),
                  1
                  /* TEXT */
                ),
                a[7] || (a[7] = e.createElementVNode(
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
                e.renderList(D.value, (i) => (e.openBlock(), e.createElementBlock("tr", {
                  key: i.id
                }, [
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "b",
                      zs,
                      e.toDisplayString(i.code),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(U(i.customerId)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(A(i.garmentId)?.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(i.size || "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(e.unref(w.fmtDateTime)(i.wantAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: ($) => h(i.code)
                    }, e.toDisplayString(l.$t("核销")), 9, Fs)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Ms,
          e.toDisplayString(l.$t("暂无")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), Ps = /* @__PURE__ */ j(Ks, [["__scopeId", "data-v-77ae1de4"]]), Ws = {
  key: 0,
  class: "ap-dash"
}, Rs = { class: "ss-kpis" }, js = { class: "ss-kpi accent" }, qs = { class: "ss-kpi" }, Gs = { class: "ss-kpi" }, Hs = { class: "ss-kpi" }, Qs = { class: "ss-kpi" }, Ys = { class: "ss-kpi" }, Js = { class: "ss-kpi" }, Xs = { class: "ss-panel" }, Zs = { class: "ap-head" }, xs = { class: "ss-muted" }, ea = { class: "ap-funnel" }, ta = { class: "ap-funnel__bar" }, na = { class: "ss-panel" }, la = { class: "ap-head" }, oa = { class: "ss-muted" }, sa = { class: "ap-days" }, aa = ["title"], ra = { class: "ap-days__bars" }, ia = { class: "ss-panel" }, ca = { class: "ap-head" }, da = {
  key: 0,
  class: "ss-note warn"
}, ua = { class: "ss-table-wrap" }, ma = { class: "ss-table" }, pa = { class: "num" }, ga = { class: "num" }, va = { class: "num" }, ya = { class: "num" }, ka = { class: "num" }, ha = { class: "num" }, fa = { class: "num" }, Va = { class: "num" }, Ea = { class: "num" }, Na = { class: "num" }, _a = { class: "ap-dash__two" }, ba = { class: "ss-panel" }, $a = { class: "ap-head" }, Sa = { class: "ss-muted" }, Da = {
  key: 0,
  class: "ss-empty"
}, wa = { class: "ap-rank" }, Ba = { class: "ss-panel" }, Ca = { class: "ap-head" }, Ta = { class: "ap-mini__chips" }, Aa = {
  key: 1,
  class: "ss-note"
}, La = /* @__PURE__ */ e.defineComponent({
  __name: "DashboardTab",
  setup(f) {
    const u = Be;
    e.onMounted(() => {
      ce();
    }), e.watch(() => K.value?.tryons, () => {
      ce();
    });
    const s = (g) => K.value?.garments.find((c) => c.id === g)?.name || g, d = e.computed(() => Math.max(1, ...u.value?.byDay.map((g) => g.tryons) || [1])), y = e.computed(() => {
      const g = u.value;
      if (!g) return [];
      const c = Math.max(1, g.done);
      return [
        { label: r.t("生成成功"), value: g.done },
        { label: r.t("想试实物"), value: g.wantVisit },
        { label: r.t("到店试穿"), value: g.tried },
        { label: r.t("成交"), value: g.purchased }
      ].map((t) => ({ ...t, pct: Math.round(t.value / c * 100) }));
    }), v = e.computed(() => [
      { title: r.t("背景"), kind: "b", items: u.value?.backgrounds || [] },
      { title: r.t("姿势"), kind: "p", items: u.value?.poses || [] },
      { title: r.t("发型"), kind: "h", items: u.value?.hairs || [] }
    ]);
    return (g, c) => e.unref(u) ? (e.openBlock(), e.createElementBlock("div", Ws, [
      e.createElementVNode("div", Rs, [
        e.createElementVNode("div", js, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(g.$t("试穿次数")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(u).tryons),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", qs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(g.$t("生成成功")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(u).done),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Gs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(g.$t("顾客")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(u).customers),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Hs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(g.$t("手机端占比")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(w.fmtPct)(e.unref(u).mobileShare, 0)),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Qs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(g.$t("想试实物率")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(w.fmtPct)(e.unref(u).wantRate, 0)),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ys, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(g.$t("到店率")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(w.fmtPct)(e.unref(u).visitRate, 0)),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Js, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(g.$t("成交率")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(w.fmtPct)(e.unref(u).closeRate, 0)),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("section", Xs, [
        e.createElementVNode("header", Zs, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(g.$t("转化漏斗")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            xs,
            e.toDisplayString(g.$t("生成成功 → 想试实物 → 到店试穿 → 成交")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ea, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(y.value, (t) => (e.openBlock(), e.createElementBlock("div", {
              key: t.label,
              class: "ap-funnel__row"
            }, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.label),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", ta, [
                e.createElementVNode(
                  "i",
                  {
                    style: e.normalizeStyle({ width: `${t.pct}%` })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(t.value),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      e.createElementVNode("section", na, [
        e.createElementVNode("header", la, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(g.$t("近 14 天")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", oa, [
            c[0] || (c[0] = e.createElementVNode(
              "i",
              { class: "ap-dot a" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(g.$t("试穿")) + " ",
              1
              /* TEXT */
            ),
            c[1] || (c[1] = e.createElementVNode(
              "i",
              { class: "ap-dot b" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(g.$t("成交")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", sa, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(u).byDay, (t) => (e.openBlock(), e.createElementBlock("div", {
              key: t.day,
              class: "ap-days__col",
              title: `${t.day}：${g.$t("试穿")} ${t.tryons} / ${g.$t("成交")} ${t.purchased}`
            }, [
              e.createElementVNode("div", ra, [
                e.createElementVNode(
                  "i",
                  {
                    class: "a",
                    style: e.normalizeStyle({ height: `${t.tryons / d.value * 100}%` })
                  },
                  null,
                  4
                  /* STYLE */
                ),
                e.createElementVNode(
                  "i",
                  {
                    class: "b",
                    style: e.normalizeStyle({ height: `${t.purchased / d.value * 100}%` })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ]),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(t.day.slice(5)),
                1
                /* TEXT */
              )
            ], 8, aa))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      e.createElementVNode("section", ia, [
        e.createElementVNode("header", ca, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(g.$t("款式排行")),
            1
            /* TEXT */
          )
        ]),
        e.unref(u).lagging.length ? (e.openBlock(), e.createElementBlock("p", da, [
          c[2] || (c[2] = e.createElementVNode(
            "i",
            { class: "ri-alert-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(g.$t("试穿多、成交少：{p0}。建议检查价格、尺码是否齐全、实物与图片是否一致。", { p0: e.unref(u).lagging.map(s).join("、") })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", ua, [
          e.createElementVNode("table", ma, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("款式")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  pa,
                  e.toDisplayString(g.$t("试穿")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ga,
                  e.toDisplayString(g.$t("成功")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  va,
                  e.toDisplayString(g.$t("想试实物")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ya,
                  e.toDisplayString(g.$t("到店")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  ka,
                  e.toDisplayString(g.$t("成交")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(u).garments, (t) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: t.garmentId,
                    class: e.normalizeClass({ bad: e.unref(u).lagging.includes(t.garmentId) })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(t.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      ha,
                      e.toDisplayString(t.tryons),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      fa,
                      e.toDisplayString(t.done),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Va,
                      e.toDisplayString(t.wantVisit),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Ea,
                      e.toDisplayString(t.tried),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Na,
                      e.toDisplayString(t.purchased),
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
      e.createElementVNode("div", _a, [
        e.createElementVNode("section", ba, [
          e.createElementVNode("header", $a, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(g.$t("热门造型组合 Top 10")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              Sa,
              e.toDisplayString(g.$t("指导商品图拍摄与门店陈列主题")),
              1
              /* TEXT */
            )
          ]),
          e.unref(u).combos.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            Da,
            e.toDisplayString(g.$t("暂无数据")),
            1
            /* TEXT */
          )),
          e.createElementVNode("ol", wa, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(u).combos, (t, n) => (e.openBlock(), e.createElementBlock("li", { key: n }, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(e.unref(H)({ backgroundId: t.backgroundId, poseId: t.poseId, hairId: t.hairId })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(t.count),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        e.createElementVNode("section", Ba, [
          e.createElementVNode("header", Ca, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(g.$t("各类选项热度")),
              1
              /* TEXT */
            )
          ]),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(v.value, (t) => (e.openBlock(), e.createElementBlock("div", {
              key: t.title,
              class: "ap-mini"
            }, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(t.title),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", Ta, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(t.items.slice(0, 6), (n) => (e.openBlock(), e.createElementBlock(
                    "span",
                    {
                      key: n.id,
                      class: "ss-chip"
                    },
                    e.toDisplayString(e.unref(H)({ backgroundId: t.kind === "b" ? n.id : "", poseId: t.kind === "p" ? n.id : "", hairId: t.kind === "h" ? n.id : "" })) + " × " + e.toDisplayString(n.count),
                    1
                    /* TEXT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])
    ])) : (e.openBlock(), e.createElementBlock("p", Aa, [
      c[3] || (c[3] = e.createElementVNode(
        "i",
        { class: "ri-loader-4-line spin" },
        null,
        -1
        /* CACHED */
      )),
      e.createTextVNode(
        e.toDisplayString(g.$t("正在统计…")),
        1
        /* TEXT */
      )
    ]));
  }
}), Ia = /* @__PURE__ */ j(La, [["__scopeId", "data-v-8dafc412"]]), Ma = { class: "ap-ov" }, Ua = { class: "ss-panel" }, Oa = { class: "ss-muted" }, za = { class: "ap-ov__cards" }, Fa = { class: "ss-panel" }, Ka = { class: "ss-table-wrap" }, Pa = { class: "ss-table" }, Wa = { class: "ap-wrap" }, Ra = { class: "ap-wrap" }, ja = { class: "ss-panel" }, qa = { class: "ap-list" }, Ga = { class: "ss-panel" }, Ha = { class: "ss-muted" }, Qa = /* @__PURE__ */ e.defineComponent({
  __name: "OverviewTab",
  setup(f) {
    const u = [
      { icon: "ri-t-shirt-air-line", title: r.t("AI 一键换装"), text: r.t("顾客照片 + 服装图，按所选背景、姿势、发型生成照片级试穿图") },
      { icon: "ri-landscape-line", title: r.t("75 项造型 · 200+ 细分场景"), text: r.t("背景 30、姿势 20、发型 25（含男装、童装），每项再选细分场景") },
      { icon: "ri-smartphone-line", title: r.t("手机、电脑同时看"), text: r.t("门店码扫码即用；店员建档的顾客也能扫专属码在手机上看、保存") },
      { icon: "ri-qr-scan-2-line", title: r.t("试穿码到店"), text: r.t("想试实物 → 试穿码 + 推荐尺码，店员提前备货，登记成交自动扣库存") },
      { icon: "ri-bar-chart-2-line", title: r.t("试穿数据看板"), text: r.t("漏斗、款式排行、高试穿低成交预警、热门造型组合") },
      { icon: "ri-shield-user-line", title: r.t("隐私优先"), text: r.t("先授权后上传，照片只存门店电脑，到期自动删除，顾客可随时删除") }
    ], s = [
      [r.t("商品库导入与 AI 打标签"), r.t("3D 服装建模、AR 实时试穿")],
      [r.t("顾客授权、照片质检、形象分析"), r.t("微信小程序（先用店内手机网页）")],
      [r.t("背景 / 姿势 / 发型选项库与细分场景"), r.t("对接收银 / 进销存（库存先手工维护）")],
      [r.t("AI 合成、手机电脑同时查看、带码保存"), r.t("顾客在店外通过公网访问")],
      [r.t("试穿码核销、尺码助手、试穿数据看板"), r.t("会员营销、补货预测、巡店（后续规划）")]
    ];
    return (d, y) => (e.openBlock(), e.createElementBlock("div", Ma, [
      e.createElementVNode("section", Ua, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(d.$t("不止一键换装：先把「试穿 → 到店 → 成交」跑通")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          Oa,
          e.toDisplayString(d.$t("顾客在手机上 30 秒内看到自己穿上店里衣服的样子，想试实物再进试衣间；店员凭试穿码提前备好尺码；老板看每件款式的试穿、到店与成交，决定主推款。不需要智能试衣镜，也不需要小程序。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", za, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(u, (v) => e.createElementVNode("div", {
              key: v.title,
              class: "ap-ov__card"
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(v.icon)
                },
                null,
                2
                /* CLASS */
              ),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(v.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(v.text),
                1
                /* TEXT */
              )
            ])),
            64
            /* STABLE_FRAGMENT */
          ))
        ])
      ]),
      e.createElementVNode("section", Fa, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(d.$t("能力边界")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Ka, [
          e.createElementVNode("table", Pa, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("本方案做")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(d.$t("本方案不做")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(s, (v, g) => e.createElementVNode("tr", { key: g }, [
                  e.createElementVNode(
                    "td",
                    Wa,
                    e.toDisplayString(v[0]),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    Ra,
                    e.toDisplayString(v[1]),
                    1
                    /* TEXT */
                  )
                ])),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", ja, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(d.$t("AI 结果的可信边界")),
          1
          /* TEXT */
        ),
        e.createElementVNode("ul", qa, [
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(d.$t("形象分析只作搭配参考，界面标注「AI 估计」，不给任何身材评价")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(d.$t("推荐造型只能来自选项库，模型给出库外选项一律丢弃")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(d.$t("尺码推荐由尺码表规则计算，不交给模型；没填身高不推荐")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(d.$t("AI 打标签可手改，手改后以人工为准")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(d.$t("未配置图像服务时明确提示去哪配置，不出假图")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("section", Ga, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(d.$t("配套：经营自动化智能体")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          Ha,
          e.toDisplayString(d.$t("同一个商品库继续用于：短视频生成并发布抖音 / 快手 / 小红书 / 视频号、商品图文上下架、数字人介绍门店、经营数据日报。")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), Ya = /* @__PURE__ */ j(Qa, [["__scopeId", "data-v-9661ab0e"]]), de = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!de) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
de.default;
const Ja = {
  key: 0,
  class: "ap-set"
}, Xa = { class: "ss-panel" }, Za = { class: "ap-head" }, xa = { class: "ss-grid" }, er = { class: "ss-field" }, tr = { class: "ss-field" }, nr = ["value"], lr = { class: "ss-field" }, or = { class: "ap-check" }, sr = { class: "ss-panel" }, ar = { class: "ap-head" }, rr = { class: "ss-grid" }, ir = { class: "ss-field" }, cr = { class: "ap-list" }, dr = { class: "ss-actions" }, ur = { class: "ss-actions" }, mr = ["disabled"], pr = {
  key: 0,
  class: "ss-muted"
}, gr = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(f) {
    const u = Q.useNotificationStore(), s = e.computed(() => K.value), d = e.reactive({});
    e.watch(() => s.value?.settings, (t) => {
      t && Object.assign(d, t);
    }, { immediate: !0 });
    const y = e.computed(() => !!s.value && ["storeName", "editModel", "mobileDailyLimit", "watermark", "retentionDays"].some((t) => d[t] !== s.value.settings[t]));
    async function v() {
      try {
        await C("settings.patch", { patch: d }), await F(), u.success(r.t("已保存"));
      } catch (t) {
        u.error(w.errorMessage(t));
      }
    }
    async function g() {
      try {
        const t = await C("privacy.purgeExpired");
        await F(), u.success(r.t("已清除 {n} 位顾客的过期照片", { n: t }));
      } catch (t) {
        u.error(w.errorMessage(t));
      }
    }
    async function c() {
      if (window.confirm(r.t("清空全部顾客的照片、试穿图与分析结果？此操作不可恢复。")))
        try {
          const t = await C("privacy.purgeAll");
          await F(), u.success(r.t("已清除 {n} 位顾客的照片与试穿图", { n: t }));
        } catch (t) {
          u.error(w.errorMessage(t));
        }
    }
    return (t, n) => s.value ? (e.openBlock(), e.createElementBlock("div", Ja, [
      e.createElementVNode("section", Xa, [
        e.createElementVNode("header", Za, [
          e.createElementVNode("strong", null, [
            n[5] || (n[5] = e.createElementVNode(
              "i",
              { class: "ri-store-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("门店与生成")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", xa, [
          e.createElementVNode("label", er, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("门店名称（手机端标题、试穿图水印）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": n[0] || (n[0] = (V) => d.storeName = V),
                type: "text",
                maxlength: "30"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                d.storeName,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", tr, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("换装模型")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": n[1] || (n[1] = (V) => d.editModel = V)
              },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(de.AP_EDIT_MODELS), (V) => (e.openBlock(), e.createElementBlock("option", {
                    key: V,
                    value: V
                  }, e.toDisplayString(e.unref(Me)(V)) + e.toDisplayString(V === e.unref(de.AP_EDIT_MODELS)[0] ? t.$t("（推荐，保脸更稳）") : t.$t("（中文提示友好）")), 9, nr))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, d.editModel]
            ])
          ]),
          e.createElementVNode("label", lr, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("手机端每人每天最多生成（张）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": n[2] || (n[2] = (V) => d.mobileDailyLimit = V),
                type: "number",
                min: "1",
                max: "100"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                d.mobileDailyLimit,
                void 0,
                { number: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode("label", or, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": n[3] || (n[3] = (V) => d.watermark = V),
              type: "checkbox"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelCheckbox, d.watermark]
          ]),
          e.createTextVNode(
            e.toDisplayString(t.$t("试穿图右下角加门店名与试穿码（顾客保存、分享时带上）")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          {
            class: e.normalizeClass(["ss-note", s.value.imageReady ? "ok" : "warn"])
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(s.value.imageReady ? "ri-check-line" : "ri-key-2-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              " " + e.toDisplayString(s.value.imageReady ? t.$t("图像服务已就绪（换装、打标签、形象分析都用它）") : t.$t("还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ]),
      e.createElementVNode("section", sr, [
        e.createElementVNode("header", ar, [
          e.createElementVNode("strong", null, [
            n[6] || (n[6] = e.createElementVNode(
              "i",
              { class: "ri-shield-user-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("隐私")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", rr, [
          e.createElementVNode("label", ir, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("顾客照片与试穿图保留天数（1～30）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": n[4] || (n[4] = (V) => d.retentionDays = V),
                type: "number",
                min: "1",
                max: "30"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                d.retentionDays,
                void 0,
                { number: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode("ul", cr, [
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(t.$t("先授权后上传：没有勾选授权不能上传照片，授权时间记入顾客档案")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(t.$t("照片、试穿图只存在本机账号私有目录；到期自动删除，统计只保留匿名计数")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(t.$t("顾客可在手机端一键删除自己的照片和试穿图；体型分析只存标签，不存测量数据")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(t.$t("照片只用于生成试穿图，不用于营销素材、不用于模型训练")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", dr, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            onClick: g
          }, [
            n[7] || (n[7] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("立即清除过期照片")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm danger",
            onClick: c
          }, [
            n[8] || (n[8] = e.createElementVNode(
              "i",
              { class: "ri-delete-bin-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("清空全部顾客照片与试穿图")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createElementVNode("div", ur, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: !y.value,
          onClick: v
        }, [
          n[9] || (n[9] = e.createElementVNode(
            "i",
            { class: "ri-save-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(t.$t("保存设置")),
            1
            /* TEXT */
          )
        ], 8, mr),
        y.value ? (e.openBlock(), e.createElementBlock(
          "span",
          pr,
          e.toDisplayString(t.$t("有未保存的修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), vr = /* @__PURE__ */ j(gr, [["__scopeId", "data-v-e6af58e3"]]), ge = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useDialog.ts"];
if (!ge) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useDialog.ts");
ge.default;
const yr = { class: "ap-workbench" }, kr = { class: "workbench-header" }, hr = { class: "heading" }, fr = { class: "eyebrow" }, Vr = { class: "subtitle" }, Er = { class: "header-actions" }, Nr = ["disabled"], _r = ["disabled"], br = ["disabled"], $r = {
  key: 0,
  class: "ap-bar"
}, Sr = {
  key: 0,
  class: "ss-chip warn",
  "data-test": "ap-demo-chip"
}, Dr = { class: "ss-muted" }, wr = { class: "ap-bar__rule" }, Br = {
  class: "ap-tabs",
  role: "tablist"
}, Cr = ["aria-selected", "onClick"], Tr = {
  key: 0,
  class: "ap-badge"
}, Ar = {
  key: 1,
  class: "ss-note info ap-progress"
}, Lr = {
  key: 2,
  class: "ap-body"
}, Ir = {
  key: 3,
  class: "ss-note danger"
}, Mr = {
  key: 4,
  class: "ss-note"
}, Ee = "totalclaw:apparel-store-tab:v1", Ur = /* @__PURE__ */ e.defineComponent({
  __name: "ApparelStoreWorkbenchView",
  setup(f) {
    const u = [
      { key: "flow", icon: "ri-shirt-line", title: r.t("一键换装") },
      { key: "live", icon: "ri-live-line", title: r.t("实时试衣") },
      { key: "garments", icon: "ri-t-shirt-line", title: r.t("商品库") },
      { key: "styles", icon: "ri-landscape-line", title: r.t("造型库") },
      { key: "mobile", icon: "ri-smartphone-line", title: r.t("手机端") },
      { key: "checkin", icon: "ri-qr-scan-2-line", title: r.t("到店核销") },
      { key: "dashboard", icon: "ri-bar-chart-2-line", title: r.t("数据看板") },
      { key: "overview", icon: "ri-book-open-line", title: r.t("方案说明") },
      { key: "settings", icon: "ri-settings-3-line", title: r.t("设置") }
    ];
    function s() {
      try {
        const N = localStorage.getItem(Ee);
        return u.some((T) => T.key === N) ? N : "flow";
      } catch {
        return "flow";
      }
    }
    const d = K, y = e.ref(s()), v = e.ref(!1), g = e.ref(!1), c = e.ref(""), t = e.ref(null), n = ge.useDialog(), V = Q.useNotificationStore(), D = e.ref(!1), A = e.computed(() => {
      const N = d.value?.demo;
      return !!N && N.garments + N.customers + N.tryons > 0;
    });
    async function U() {
      if (await n.confirm({
        title: A.value ? r.t("重新生成演示数据") : r.t("演示模式"),
        message: r.t(`生成一整套示例数据，每个页签都能直接演示：商品 12 件、顾客 11 位（含 3 位已按保留期清除）、试穿图 30 多张（含待核销的试穿码、到店结果和 14 天数据走势）。
全部在本机生成，不调用 AI、不产生费用；门店自己录入的数据不受影响，随时可以一键清除。`),
        confirmLabel: r.t("生成")
      })) {
        D.value = !0;
        try {
          const T = await C("demo.seed");
          await Promise.all([F(), ce().catch(() => {
          })]), V.success(r.t("已生成演示数据：商品 {a} 件、顾客 {b} 位、试穿 {c} 张", { a: T.garments, b: T.customers, c: T.tryons }));
        } catch (T) {
          V.error(w.errorMessage(T));
        } finally {
          D.value = !1;
        }
      }
    }
    async function k() {
      if (await n.confirm({ title: r.t("清除演示数据"), message: r.t("只删除演示模式生成的商品、顾客和试穿图（连同图片）；门店自己录入的数据不受影响。"), confirmLabel: r.t("清除"), danger: !0 })) {
        D.value = !0;
        try {
          await C("demo.clear"), await Promise.all([F(), ce().catch(() => {
          })]), V.success(r.t("演示数据已清除"));
        } catch (T) {
          V.error(w.errorMessage(T));
        } finally {
          D.value = !1;
        }
      }
    }
    const E = e.computed(() => (d.value?.tryons || []).filter((N) => N.wantVisit && !N.visit).length);
    function h(N) {
      return N === "checkin" ? E.value ? String(E.value) : "" : N === "mobile" && d.value?.mobile.activeSessions ? String(d.value.mobile.activeSessions) : "";
    }
    function B(N) {
      y.value = N;
      try {
        localStorage.setItem(Ee, N);
      } catch {
      }
    }
    function l(N) {
      B("flow"), t.value?.focusCustomer(N);
    }
    async function a() {
      g.value = !0;
      try {
        await Promise.all([F(), et()]), v.value = !0, c.value = "";
      } catch (N) {
        c.value = w.errorMessage(N);
      } finally {
        g.value = !1;
      }
    }
    let i = null, $ = null, I = null;
    return e.onMounted(() => {
      a(), I = we((N) => {
        if (N.type === "progress") {
          le.message = String(N.payload?.message || ""), $ && clearTimeout($), $ = setTimeout(() => {
            le.message = "";
          }, 15e3);
          return;
        }
        i || (i = setTimeout(() => {
          i = null, F().catch(() => {
          });
        }, 200));
      });
    }), e.onBeforeUnmount(() => {
      I?.(), i && clearTimeout(i), $ && clearTimeout($), le.message = "";
    }), (N, T) => (e.openBlock(), e.createElementBlock("div", yr, [
      e.createElementVNode("header", kr, [
        e.createElementVNode("div", hr, [
          e.createVNode(Je),
          T[1] || (T[1] = e.createElementVNode(
            "span",
            { class: "heading-icon" },
            [
              e.createElementVNode("i", { class: "ri-t-shirt-air-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "p",
              fr,
              e.toDisplayString(N.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(N.$t("服装AI试衣")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Vr,
              e.toDisplayString(N.$t("AI 一键换装：顾客在手机上、店员在电脑上都能看到试穿效果；背景、姿势、发型自由选；试穿码到店试实物，试穿数据指导主推款。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Er, [
          e.createCommentVNode(" 演示模式：一键给每个页签造好示例数据（本机生成、不调用 AI）；旧版 App 的主进程没有这个动作，就不显示 "),
          e.unref(d)?.demo ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              A.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                class: "ss-btn",
                disabled: D.value,
                "data-test": "ap-demo-clear",
                onClick: k
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(D.value ? "ri-loader-4-line spin" : "ri-delete-bin-6-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(N.$t("清除演示数据")),
                  1
                  /* TEXT */
                )
              ], 8, Nr)) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("button", {
                class: e.normalizeClass(["ss-btn", { primary: !A.value }]),
                disabled: D.value,
                "data-test": "ap-demo-seed",
                onClick: U
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(D.value ? "ri-loader-4-line spin" : "ri-slideshow-3-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(A.value ? N.$t("重新生成演示数据") : N.$t("演示模式")),
                  1
                  /* TEXT */
                )
              ], 10, _r)
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: g.value,
            onClick: a
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(g.value ? "ri-loader-4-line spin" : "ri-refresh-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(N.$t("刷新")),
              1
              /* TEXT */
            )
          ], 8, br)
        ])
      ]),
      e.unref(d) ? (e.openBlock(), e.createElementBlock("section", $r, [
        e.createElementVNode("span", null, [
          T[2] || (T[2] = e.createElementVNode(
            "i",
            { class: "ri-store-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(e.unref(d).settings.storeName),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["ss-chip", e.unref(d).imageReady ? "ok" : "warn"])
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(e.unref(d).imageReady ? "ri-check-line" : "ri-key-2-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(e.unref(d).imageReady ? N.$t("图像服务已就绪") : N.$t("图像服务未配置")),
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
            class: e.normalizeClass(["ss-chip", e.unref(d).mobile.running ? "ok" : ""]),
            onClick: T[0] || (T[0] = (O) => B("mobile"))
          },
          [
            T[3] || (T[3] = e.createElementVNode(
              "i",
              { class: "ri-smartphone-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(d).mobile.running ? N.$t("手机端运行中") : N.$t("手机端未开启")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        ),
        A.value ? (e.openBlock(), e.createElementBlock("span", Sr, [
          T[4] || (T[4] = e.createElementVNode(
            "i",
            { class: "ri-slideshow-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(N.$t("含演示数据")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode(
          "span",
          Dr,
          e.toDisplayString(N.$t("商品 {a} · 顾客 {b} · 试穿图 {c}", { a: e.unref(d).garments.length, b: e.unref(d).customers.filter((O) => !O.purgedAt).length, c: e.unref(d).tryons.filter((O) => O.status === "done").length })),
          1
          /* TEXT */
        ),
        e.createElementVNode("span", wr, [
          T[5] || (T[5] = e.createElementVNode(
            "i",
            { class: "ri-shield-user-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(N.$t("先授权后上传 · 照片只存本机 · {d} 天自动删除", { d: e.unref(d).settings.retentionDays })),
            1
            /* TEXT */
          )
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("nav", Br, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(u, (O) => e.createElementVNode("button", {
            key: O.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["ap-tab", { active: y.value === O.key }]),
            "aria-selected": y.value === O.key,
            onClick: (te) => B(O.key)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(O.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(O.title),
              1
              /* TEXT */
            ),
            h(O.key) ? (e.openBlock(), e.createElementBlock(
              "em",
              Tr,
              e.toDisplayString(h(O.key)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, Cr)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      e.unref(le).message ? (e.openBlock(), e.createElementBlock("p", Ar, [
        T[6] || (T[6] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(e.unref(le).message),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      v.value ? (e.openBlock(), e.createElementBlock("div", Lr, [
        e.withDirectives(e.createVNode(
          nl,
          {
            ref_key: "flowRef",
            ref: t
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [e.vShow, y.value === "flow"]
        ]),
        y.value === "live" ? (e.openBlock(), e.createBlock(wo, { key: 0 })) : y.value === "garments" ? (e.openBlock(), e.createBlock(Ql, { key: 1 })) : y.value === "styles" ? (e.openBlock(), e.createBlock(qo, { key: 2 })) : y.value === "mobile" ? (e.openBlock(), e.createBlock(ps, {
          key: 3,
          onOpenCustomer: l
        })) : y.value === "checkin" ? (e.openBlock(), e.createBlock(Ps, { key: 4 })) : y.value === "dashboard" ? (e.openBlock(), e.createBlock(Ia, { key: 5 })) : y.value === "overview" ? (e.openBlock(), e.createBlock(Ya, { key: 6 })) : y.value === "settings" ? (e.openBlock(), e.createBlock(vr, { key: 7 })) : e.createCommentVNode("v-if", !0)
      ])) : c.value ? (e.openBlock(), e.createElementBlock("p", Ir, [
        T[7] || (T[7] = e.createElementVNode(
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
      ])) : (e.openBlock(), e.createElementBlock("p", Mr, [
        T[8] || (T[8] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(N.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), Or = /* @__PURE__ */ j(Ur, [["__scopeId", "data-v-4d607c95"]]);
export {
  Or as default
};
