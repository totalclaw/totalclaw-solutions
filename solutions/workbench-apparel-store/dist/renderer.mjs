const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const i = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!i) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
i.default;
const pe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!pe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Ye = pe.default, ge = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:qrcode"];
if (!ge) throw new Error("宿主模块未就绪：npm:qrcode");
const ve = ge.default, W = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!W) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
W.default;
const ye = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!ye) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const q = ye.default, ke = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!ke) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const Je = ke.default, x = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!x) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
x.default;
const b = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!b) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
b.default;
const I = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/foreign-trade/shared.ts"];
if (!I) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/foreign-trade/shared.ts");
I.default;
const he = /\.(jpe?g|png|webp|heic|bmp)$/i;
async function $(E, m) {
  const v = window.electronAPI?.workbenches?.apparelStore;
  if (!v?.invoke) throw new Error(i.t("服装实体店智能体接口不可用，请重启应用"));
  return v.invoke(E, x.toPlain(m ?? {}));
}
function Ve(E) {
  const m = window.electronAPI?.workbenches?.apparelStore;
  return m?.onEvent ? m.onEvent(E) : () => {
  };
}
const C = e.ref(null), G = e.ref([]), Ee = e.ref(null), Q = e.reactive({ message: "" }), Ne = e.ref(0);
let ie = null, re = null;
function Xe() {
  const E = window.electronAPI?.workbenches?.apparelStore;
  !E?.onEvent || E === ie || (re?.(), ie = E, re = Ve((m) => {
    (m.type === "progress" || m.type === "state") && (Ne.value = Date.now());
  }));
}
function Ze(E) {
  let m = Number.POSITIVE_INFINITY;
  for (const v of E) {
    if (v.status !== "queued" && v.status !== "running") continue;
    const c = Date.parse(v.status === "running" && v.startedAt || v.createdAt || "");
    Number.isFinite(c) && c < m && (m = c);
  }
  return Number.isFinite(m) ? m : void 0;
}
async function T() {
  const E = await $("state.get");
  return C.value = E, E;
}
async function xe() {
  G.value = await $("options.list");
}
async function ce() {
  Ee.value = await $("stats.get");
}
function fe(E) {
  return G.value.find((m) => m.id === E);
}
function et(E, m) {
  return G.value.filter((v) => v.kind === E && (!m || v.audience.includes(m)));
}
function J(E, m) {
  const v = fe(E);
  if (!v) return "";
  const c = v.variants.find((h) => h.id === m);
  return c ? `${v.label} · ${c.label}` : v.label;
}
function K(E) {
  return [J(E.backgroundId, E.backgroundVariant), J(E.poseId, E.poseVariant), J(E.hairId, E.hairVariant)].filter(Boolean).join(" / ");
}
function _e(E) {
  return { background: i.t("背景"), pose: i.t("姿势"), hair: i.t("发型") }[E];
}
function be(E) {
  return { women: i.t("女装"), men: i.t("男装"), kids: i.t("童装") }[E];
}
function de(E) {
  return { pear: i.t("梨形"), apple: i.t("苹果形"), hourglass: i.t("沙漏形"), rectangle: i.t("直筒形"), inverted_triangle: i.t("倒三角形") }[E] || i.t("未判断");
}
function tt(E) {
  return { queued: i.t("排队中"), running: i.t("生成中"), done: i.t("已完成"), failed: i.t("失败") }[E];
}
function $e(E) {
  return { prepared: i.t("已备货"), tried: i.t("已试穿"), purchased: i.t("已成交"), left: i.t("未成交") }[E];
}
function Se(E) {
  return { "fal-ai/nano-banana/edit": "Nano Banana Edit", "fal-ai/bytedance/seedream/v4/edit": "Seedream 4 Edit" }[E] || E;
}
async function X(E = !0, m) {
  const v = await $("files.pick", { multi: E, title: m });
  return Array.isArray(v) ? v : [];
}
function nt(E) {
  return Object.values(E || {}).reduce((m, v) => m + (Number(v) || 0), 0);
}
async function ue(E, m) {
  const v = await fetch(E);
  if (!v.ok) throw new Error(i.t("读取试穿图失败（{status}）", { status: String(v.status) }));
  const c = await createImageBitmap(await v.blob()), h = document.createElement("canvas");
  h.width = c.width, h.height = c.height;
  const p = h.getContext("2d");
  p.drawImage(c, 0, 0), c.close();
  const u = Math.max(14, Math.round(h.width / 32));
  p.font = `700 ${u}px -apple-system, "PingFang SC", sans-serif`;
  const N = p.measureText(m).width + u * 1.2, o = u * 1.9, d = h.width - N - u * 0.8, f = h.height - o - u * 0.8;
  return p.fillStyle = "rgba(0,0,0,.45)", p.beginPath(), p.roundRect ? p.roundRect(d, f, N, o, o / 2) : p.rect(d, f, N, o), p.fill(), p.fillStyle = "#fff", p.textBaseline = "middle", p.fillText(m, d + u * 0.6, f + o / 2), h.toDataURL("image/jpeg", 0.92);
}
const lt = { class: "ap-picker" }, ot = {
  class: "ap-picker__kinds",
  role: "tablist"
}, st = ["aria-selected", "onClick"], at = { class: "ap-picker__groups" }, it = { class: "ap-picker__chips" }, rt = ["title", "onClick"], ct = ["src"], dt = {
  key: 1,
  class: "ap-picker__variants"
}, ut = { class: "ap-picker__chips" }, mt = ["onClick"], pt = /* @__PURE__ */ e.defineComponent({
  __name: "StylePicker",
  props: {
    modelValue: {},
    audience: {},
    disabledIds: {}
  },
  emits: ["update:modelValue"],
  setup(E, { emit: m }) {
    const v = E, c = m, h = ["background", "pose", "hair"], p = { background: "ri-landscape-line", pose: "ri-walk-line", hair: "ri-scissors-cut-line" }, u = e.ref("background"), N = e.computed(() => v.modelValue), o = (t) => t === "background" ? "backgroundId" : t === "pose" ? "poseId" : "hairId", d = (t) => t === "background" ? "backgroundVariant" : t === "pose" ? "poseVariant" : "hairVariant", f = e.ref(!1), S = e.computed(() => C.value?.thumbs || {}), D = e.computed(() => et(u.value, f.value ? null : v.audience).filter((t) => !v.disabledIds?.includes(t.id))), w = e.computed(() => [...new Set(D.value.map((t) => t.group))]), g = (t) => D.value.filter((l) => l.group === t), V = e.computed(() => fe(N.value[o(u.value)]));
    function y(t) {
      const l = { ...v.modelValue };
      l[o(u.value)] = t, delete l[d(u.value)], c("update:modelValue", l);
    }
    function k(t) {
      const l = { ...v.modelValue };
      l[d(u.value)] = l[d(u.value)] === t ? void 0 : t, c("update:modelValue", l);
    }
    return (t, l) => (e.openBlock(), e.createElementBlock("div", lt, [
      e.createElementVNode("div", ot, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(h, (s) => e.createElementVNode("button", {
            key: s,
            type: "button",
            role: "tab",
            class: e.normalizeClass({ on: u.value === s }),
            "aria-selected": u.value === s,
            onClick: (_) => u.value = s
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(p[s])
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(e.unref(_e)(s)),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "em",
              null,
              e.toDisplayString(e.unref(J)(N.value[o(s)], N.value[d(s)]) || t.$t("未选")),
              1
              /* TEXT */
            )
          ], 10, st)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      e.createElementVNode("div", at, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(w.value, (s) => (e.openBlock(), e.createElementBlock("div", {
            key: s,
            class: "ap-picker__group"
          }, [
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(s),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", it, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(g(s), (_) => (e.openBlock(), e.createElementBlock("button", {
                  key: _.id,
                  type: "button",
                  class: e.normalizeClass(["ap-chip", { on: N.value[o(u.value)] === _.id }]),
                  title: _.detail,
                  onClick: (A) => y(_.id)
                }, [
                  S.value[_.id] ? (e.openBlock(), e.createElementBlock("img", {
                    key: 0,
                    src: e.unref(I.fileUrl)(S.value[_.id]),
                    alt: "",
                    loading: "lazy"
                  }, null, 8, ct)) : e.createCommentVNode("v-if", !0),
                  e.createTextVNode(
                    e.toDisplayString(_.label),
                    1
                    /* TEXT */
                  )
                ], 10, rt))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      u.value === "hair" && E.audience ? (e.openBlock(), e.createElementBlock(
        "button",
        {
          key: 0,
          type: "button",
          class: "ss-link ap-picker__all",
          onClick: l[0] || (l[0] = (s) => f.value = !f.value)
        },
        e.toDisplayString(f.value ? t.$t("只看适合该商品人群的发型") : t.$t("显示全部发型")),
        1
        /* TEXT */
      )) : e.createCommentVNode("v-if", !0),
      V.value && V.value.variants.length ? (e.openBlock(), e.createElementBlock("div", dt, [
        e.createElementVNode("small", null, [
          e.createTextVNode(
            e.toDisplayString(t.$t("细分场景")) + " · " + e.toDisplayString(V.value.label),
            1
            /* TEXT */
          ),
          V.value.detail ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createTextVNode(
                e.toDisplayString(t.$t("（{p0}）", { p0: V.value.detail })),
                1
                /* TEXT */
              )
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("div", ut, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(V.value.variants, (s) => (e.openBlock(), e.createElementBlock("button", {
              key: s.id,
              type: "button",
              class: e.normalizeClass(["ap-chip sub", { on: N.value[d(u.value)] === s.id }]),
              onClick: (_) => k(s.id)
            }, e.toDisplayString(s.label), 11, mt))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : e.createCommentVNode("v-if", !0),
      V.value?.needsUpload ? e.renderSlot(t.$slots, "upload", { key: 2 }, void 0, !0) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), O = (E, m) => {
  const v = E.__vccOpts || E;
  for (const [c, h] of m)
    v[c] = h;
  return v;
}, De = /* @__PURE__ */ O(pt, [["__scopeId", "data-v-cdfb2510"]]), gt = { class: "ss-module" }, vt = { class: "ss-steps" }, yt = ["title", "onClick"], kt = ["src"], ht = { class: "ap-g__name" }, Vt = { class: "ap-g__meta" }, Et = { class: "ss-actions" }, Nt = ["disabled"], ft = { class: "ss-muted" }, _t = { class: "ss-actions" }, bt = { class: "ss-field ap-grow" }, $t = { value: "" }, St = ["value"], Dt = { class: "ss-grid" }, Bt = { class: "ss-field" }, wt = { class: "ss-field" }, Ct = { class: "ss-field" }, Tt = { class: "ap-consent" }, At = { class: "ss-actions" }, Lt = ["disabled"], It = { class: "ss-muted" }, Mt = {
  key: 1,
  class: "ap-customer"
}, Ot = ["src"], zt = {
  key: 1,
  class: "ap-customer__empty"
}, Ut = { class: "ap-customer__info" }, Kt = { class: "ss-muted" }, Ft = {
  key: 0,
  class: "ss-note warn"
}, Pt = {
  key: 1,
  class: "ss-muted"
}, Wt = {
  key: 2,
  class: "ss-note danger"
}, Rt = {
  key: 3,
  class: "ss-note ok"
}, jt = { class: "ss-actions" }, qt = ["disabled"], Gt = { class: "ap-inline" }, Ht = { class: "ap-inline" }, Qt = ["disabled"], Yt = { class: "ss-actions" }, Jt = ["disabled"], Xt = ["disabled"], Zt = { class: "ss-muted" }, xt = { class: "ss-kpis" }, en = { class: "ss-kpi" }, tn = { class: "ss-kpi" }, nn = { class: "ss-kpi" }, ln = {
  key: 0,
  class: "ss-note info"
}, on = { class: "ap-sugs" }, sn = { key: 0 }, an = { class: "ss-actions" }, rn = ["disabled"], cn = { class: "ap-looks" }, dn = ["onClick"], un = ["aria-label", "onClick"], mn = { class: "ss-actions" }, pn = { class: "ss-actions" }, gn = ["disabled"], vn = {
  key: 0,
  class: "ss-chip ok"
}, yn = {
  key: 0,
  class: "ss-note warn"
}, kn = { class: "ss-actions" }, hn = ["disabled"], Vn = { class: "ss-muted" }, En = {
  key: 1,
  class: "ap-queue"
}, Nn = {
  key: 0,
  class: "ri-loader-4-line spin"
}, fn = { class: "ap-q__what" }, _n = {
  key: 0,
  class: "ap-q__err"
}, bn = ["onClick"], $n = {
  key: 0,
  class: "ss-empty"
}, Sn = {
  key: 1,
  class: "ap-results"
}, Dn = ["onClick"], Bn = ["src"], wn = {
  key: 2,
  class: "ap-preview"
}, Cn = ["src"], Tn = { class: "ap-preview__side" }, An = { class: "ss-muted" }, Ln = { class: "ss-muted" }, In = { class: "ap-code" }, Mn = { class: "ss-actions" }, On = { class: "ap-phone" }, zn = ["src"], Un = {
  key: 1,
  class: "ss-muted"
}, Kn = {
  key: 0,
  class: "ss-empty"
}, Fn = {
  key: 1,
  class: "ss-table-wrap"
}, Pn = { class: "ss-table" }, Wn = { class: "ap-wrap" }, Rn = { class: "ap-code" }, jn = {
  key: 1,
  class: "ss-muted"
}, qn = { class: "ap-row-actions" }, Gn = ["onClick"], Hn = ["onClick"], Qn = ["onClick"], Yn = ["onClick"], Jn = ["onClick"], Xn = 30, Zn = 2, xn = /* @__PURE__ */ e.defineComponent({
  __name: "TryonFlow",
  setup(E, { expose: m }) {
    const v = W.useNotificationStore(), c = C;
    Xe();
    const h = { backgroundId: "B29", backgroundVariant: "B29-1", poseId: "P01", poseVariant: "P01-1", hairId: "H00" }, p = e.computed(() => c.value?.garments || []), u = e.computed(() => (c.value?.customers || []).filter((n) => !n.purgedAt)), N = e.ref([]), o = e.ref(""), d = e.computed(() => c.value?.customers.find((n) => n.id === o.value) || null), f = e.computed(() => p.value.find((n) => n.id === N.value[0]) || null), S = e.reactive({ nickname: "", heightCm: void 0, weightKg: void 0, consent: !1 }), D = e.reactive({ heightCm: void 0, weightKg: void 0 }), w = e.ref(!1), g = e.ref([{ ...h }]), V = e.ref(0), y = e.ref(!1), k = e.ref(!1), t = e.ref(null), l = e.ref(""), s = e.ref(""), _ = e.ref({});
    e.watch(d, (n) => {
      D.heightCm = n?.heightCm, D.weightKg = n?.weightKg, w.value = !1, l.value = "", t.value = null, se();
    }, { immediate: !1 }), e.watch(o, () => {
      l.value = "";
    }), e.watch(g, () => {
      y.value = !0;
    }, { deep: !0 });
    const A = e.computed(() => (c.value?.tryons || []).filter((n) => n.customerId === o.value)), z = e.computed(() => A.value.filter((n) => n.status === "done" && n.image)), ee = e.computed(() => A.value.filter((n) => n.status === "queued" || n.status === "running")), te = e.computed(() => !!d.value?.photo && !d.value.purgedAt && (!!d.value.photoCheck?.ok || !d.value.photoCheck && !c.value?.imageReady)), Be = e.computed(() => te.value && N.value.length > 0 && g.value.length > 0), L = [
      { key: "ap-garment", title: i.t("选衣服"), hint: i.t("从商品库挑 1～4 件要试的衣服；新款可当场导入，AI 自动打标签") },
      { key: "ap-photo", title: i.t("顾客照片与授权"), hint: i.t("勾选授权后上传一张全身正面照（电脑上传，或顾客扫门店码用手机上传）") },
      { key: "ap-analyze", title: i.t("AI 形象分析"), hint: i.t("识别体型、肤色、脸型，推荐 3 组造型（可跳过）") },
      { key: "ap-style", title: i.t("选造型"), hint: i.t("背景 / 姿势 / 发型及细分场景，一次最多 4 组") },
      { key: "ap-generate", title: i.t("AI 合成"), hint: i.t("衣服 × 造型逐张生成，失败的单张可重试") },
      { key: "ap-view", title: i.t("手机、电脑查看"), hint: i.t("电脑大图对比；顾客扫码在手机上看、长按保存（带门店名与试穿码）") },
      { key: "ap-visit", title: i.t("到店试实物"), hint: i.t("想试实物 → 试穿码 + 推荐尺码 → 店员备货、登记试穿与成交") }
    ];
    function R(n, r, a, B = !1, j) {
      return s.value === n || B ? { state: "running", ...j || {} } : _.value[n] ? { state: "failed", error: _.value[n] } : r ? { state: "done", summary: a } : { state: "todo" };
    }
    const U = e.computed(() => {
      const n = d.value, r = ee.value, a = r.length > 0, B = A.value.length > 0 && A.value.every((P) => P.status === "failed"), j = a ? {
        kind: "image",
        estimateSec: Math.ceil(r.length / Zn) * Xn,
        startedAt: Ze(r),
        progressAt: Ne.value || void 0
      } : void 0;
      return {
        "ap-garment": R("ap-garment", N.value.length > 0, i.t("已选 {n} 件", { n: N.value.length })),
        "ap-photo": n?.photoCheck && !n.photoCheck.ok && !s.value ? { state: "failed", error: i.t("照片不合格，请重拍") } : R("ap-photo", te.value, n?.nickname),
        "ap-analyze": R("ap-analyze", !!n?.profile || w.value && !!n?.photo, n?.profile ? de(n.profile.bodyShape) : i.t("已跳过")),
        "ap-style": R("ap-style", !!n?.photo && (y.value || !!n?.profile), i.t("{n} 组造型", { n: g.value.length })),
        // 预检 / 本组件自己的报错优先于「上一批全失败」的汇总，否则点生成被拦下时卡上还写着上一批的旧原因
        "ap-generate": _.value["ap-generate"] && !a ? { state: "failed", error: _.value["ap-generate"] } : B && !a ? { state: "failed", error: A.value[0]?.error || i.t("生成失败") } : R("ap-generate", z.value.length > 0, i.t("{n} 张完成", { n: z.value.length }), a, j),
        "ap-view": R("ap-view", z.value.length > 0 && (!!t.value || !!l.value || n?.source === "mobile")),
        "ap-visit": R("ap-visit", A.value.some((P) => !!P.visit), i.t("{n} 件已登记", { n: A.value.filter((P) => P.visit).length }))
      };
    }), F = e.computed(() => L.find((n) => U.value[n.key].state !== "done")?.key || "ap-visit");
    function H(n) {
      return p.value.find((r) => r.id === n)?.name || i.t("已删除的商品");
    }
    function we(n) {
      const r = N.value.indexOf(n);
      r >= 0 ? N.value.splice(r, 1) : N.value.length < 4 ? N.value.push(n) : v.warn(i.t("一次最多选 4 件"));
    }
    async function M(n, r) {
      s.value = n, _.value = { ..._.value, [n]: "" };
      try {
        await r(), await T();
      } catch (a) {
        _.value = { ..._.value, [n]: b.errorMessage(a) }, b.scrollToStep(n);
      } finally {
        s.value = "";
      }
    }
    async function Ce() {
      const n = await X(!0, i.t("选择服装白底图 / 平铺图"));
      n.length && await le(n);
    }
    function ne(n) {
      const r = b.droppedPaths(n, he);
      r.length && le(r);
    }
    async function le(n) {
      await M("ap-garment", async () => {
        const r = await $("garments.import", { paths: n });
        N.value = [.../* @__PURE__ */ new Set([...N.value, ...r.map((a) => a.id)])].slice(0, 4), await T();
        for (const a of r)
          try {
            await $("garment.tag", { id: a.id });
          } catch (B) {
            v.warn(b.errorMessage(B));
            break;
          }
      });
    }
    async function Te() {
      await M("ap-photo", async () => {
        const n = await $("customer.create", { ...S });
        o.value = n.id, Object.assign(S, { nickname: "", heightCm: void 0, weightKg: void 0, consent: !1 }), await T(), await oe();
      });
    }
    async function oe() {
      const n = await X(!1, i.t("选择顾客全身照"));
      n.length && await $("customer.image", { id: o.value, path: n[0], kind: "photo" });
    }
    async function Ae() {
      await M("ap-photo", oe);
    }
    async function Le() {
      await M("ap-photo", () => $("customer.update", { id: o.value, patch: { heightCm: D.heightCm ?? null, weightKg: D.weightKg ?? null } }));
    }
    async function Ie() {
      !d.value || !window.confirm(i.t("删除「{p0}」的照片、试穿图与分析结果？此操作不可恢复。", { p0: d.value.nickname })) || await M("ap-photo", () => $("customer.purge", { id: o.value }));
    }
    async function Me() {
      await M("ap-analyze", () => $("customer.analyze", { id: o.value, audience: f.value?.audience }));
    }
    function Oe() {
      const n = d.value?.profile?.suggestions || [];
      n.length && (g.value = n.map(({ reason: r, ...a }) => ({ ...a })), V.value = 0, b.scrollToStep("ap-style"));
    }
    function ze() {
      f.value?.recommended && (g.value[V.value] = { ...f.value.recommended });
    }
    function Ue() {
      g.value.push({ ...g.value[g.value.length - 1] || h }), V.value = g.value.length - 1;
    }
    function Ke(n) {
      g.value.splice(n, 1), V.value = Math.min(V.value, g.value.length - 1);
    }
    async function se() {
      k.value = o.value ? !!await $("customer.hasBackground", { id: o.value }).catch(() => !1) : !1;
    }
    async function Fe() {
      const n = await X(!1, i.t("选择背景照片"));
      n.length && await M("ap-style", async () => {
        await $("customer.image", { id: o.value, path: n[0], kind: "background" }), await se();
      });
    }
    async function ae() {
      if (!c.value?.imageReady) {
        const n = i.t("还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发");
        _.value = { ..._.value, "ap-generate": n }, v.warn(n), b.scrollToStep("ap-generate");
        return;
      }
      await M("ap-generate", () => $("tryon.enqueue", {
        customerId: o.value,
        garmentIds: N.value,
        choices: g.value.map((n) => ({ ...n, customBackground: n.backgroundId === "B30" && k.value ? "yes" : void 0 }))
      }));
    }
    async function Pe(n) {
      await M("ap-generate", () => $("tryon.retry", { id: n }));
    }
    async function We() {
      const n = A.value.filter((r) => r.status === "failed");
      if (!n.length) {
        await ae();
        return;
      }
      await M("ap-generate", async () => {
        for (const r of n) await $("tryon.retry", { id: r.id });
      });
    }
    async function Re(n) {
      try {
        const r = c.value?.settings.watermark ? await ue(I.fileUrl(n.image), `${c.value.settings.storeName} · ${i.t("试穿码")} ${n.code}`) : I.fileUrl(n.image), a = await (await fetch(r)).blob(), B = a.type === "image/png" ? a : await je(a);
        await navigator.clipboard.write([new ClipboardItem({ "image/png": B })]), v.success(i.t("已复制，可直接粘贴到微信、朋友圈编辑器"));
      } catch (r) {
        v.error(b.errorMessage(r));
      }
    }
    async function je(n) {
      const r = await createImageBitmap(n), a = document.createElement("canvas");
      return a.width = r.width, a.height = r.height, a.getContext("2d").drawImage(r, 0, 0), new Promise((B, j) => a.toBlob((P) => P ? B(P) : j(new Error("toBlob")), "image/png"));
    }
    async function qe() {
      try {
        const n = c.value, r = n?.settings.watermark ? await $("tryon.exportData", { items: await Promise.all(z.value.map(async (a) => ({
          name: `${H(a.garmentId)}-${a.code}`,
          dataUrl: await ue(I.fileUrl(a.image), `${n.settings.storeName} · ${i.t("试穿码")} ${a.code}`)
        }))) }) : await $("tryon.export", { ids: z.value.map((a) => a.id) });
        await $("path.open", { path: r[0], reveal: !0 });
      } catch (n) {
        v.error(b.errorMessage(n));
      }
    }
    async function Ge() {
      try {
        const n = await $("mobile.customerLink", { id: o.value });
        l.value = await ve.toDataURL(n, { margin: 1, width: 180 });
      } catch (n) {
        v.error(b.errorMessage(n));
      }
    }
    async function He(n) {
      await M("ap-visit", () => $("tryon.want", { id: n }));
    }
    async function Y(n, r) {
      await M("ap-visit", () => $("tryon.visit", { id: n, status: r }));
    }
    function Qe(n) {
      b.scrollToStep(n);
    }
    return m({ focusCustomer: (n) => {
      o.value = n;
    } }), (n, r) => (e.openBlock(), e.createElementBlock("div", gt, [
      e.createVNode(Je, {
        title: n.$t("AI 一键换装"),
        metas: L,
        runtime: U.value,
        "current-key": F.value,
        onJump: Qe
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", vt, [
        e.createCommentVNode(" ① 选衣服 "),
        e.createVNode(q, {
          "step-key": "ap-garment",
          index: 0,
          title: L[0].title,
          hint: L[0].hint,
          runtime: U.value["ap-garment"],
          "is-current": F.value === "ap-garment"
        }, {
          default: e.withCtx(() => [
            p.value.length ? (e.openBlock(), e.createElementBlock(
              "div",
              {
                key: 1,
                class: "ap-grid",
                onDragover: r[1] || (r[1] = e.withModifiers(() => {
                }, ["prevent"])),
                onDrop: e.withModifiers(ne, ["prevent"])
              },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(p.value, (a) => (e.openBlock(), e.createElementBlock("button", {
                    key: a.id,
                    type: "button",
                    class: e.normalizeClass(["ap-g", { on: N.value.includes(a.id) }]),
                    title: a.sellingPoints,
                    onClick: (B) => we(a.id)
                  }, [
                    e.createElementVNode("img", {
                      src: e.unref(I.fileUrl)(a.image),
                      alt: "",
                      loading: "lazy"
                    }, null, 8, kt),
                    e.createElementVNode(
                      "span",
                      ht,
                      e.toDisplayString(a.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      Vt,
                      e.toDisplayString([a.category, a.color, e.unref(be)(a.audience)].filter(Boolean).join(" · ")),
                      1
                      /* TEXT */
                    )
                  ], 10, yt))),
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
                onDragover: r[0] || (r[0] = e.withModifiers(() => {
                }, ["prevent"])),
                onDrop: e.withModifiers(ne, ["prevent"])
              },
              e.toDisplayString(n.$t("商品库还是空的：先导入服装白底图或平铺图（可直接拖进来）")),
              33
              /* TEXT, NEED_HYDRATION */
            )),
            e.createElementVNode("div", Et, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: !!s.value,
                onClick: Ce
              }, [
                r[12] || (r[12] = e.createElementVNode(
                  "i",
                  { class: "ri-image-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("导入新款（AI 自动打标签）")),
                  1
                  /* TEXT */
                )
              ], 8, Nt),
              e.createElementVNode(
                "span",
                ft,
                e.toDisplayString(n.$t("已选 {n} / 4 件", { n: N.value.length })),
                1
                /* TEXT */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" ② 顾客照片与授权 "),
        e.createVNode(q, {
          "step-key": "ap-photo",
          index: 1,
          title: L[1].title,
          hint: L[1].hint,
          runtime: U.value["ap-photo"],
          "is-current": F.value === "ap-photo"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", _t, [
              e.createElementVNode("label", bt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("顾客")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": r[2] || (r[2] = (a) => o.value = a)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      $t,
                      e.toDisplayString(n.$t("— 新顾客 —")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(u.value, (a) => (e.openBlock(), e.createElementBlock("option", {
                        key: a.id,
                        value: a.id
                      }, e.toDisplayString(a.nickname) + e.toDisplayString(a.source === "mobile" ? n.$t("（手机）") : "") + " · " + e.toDisplayString(e.unref(b.fmtDateTime)(a.createdAt)), 9, St))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, o.value]
                ])
              ])
            ]),
            d.value ? (e.openBlock(), e.createElementBlock("div", Mt, [
              d.value.photo ? (e.openBlock(), e.createElementBlock("img", {
                key: 0,
                src: e.unref(I.fileUrl)(d.value.photo),
                alt: ""
              }, null, 8, Ot)) : (e.openBlock(), e.createElementBlock("div", zt, [...r[14] || (r[14] = [
                e.createElementVNode(
                  "i",
                  { class: "ri-user-line" },
                  null,
                  -1
                  /* CACHED */
                )
              ])])),
              e.createElementVNode("div", Ut, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(d.value.nickname),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  Kt,
                  e.toDisplayString(d.value.source === "mobile" ? n.$t("手机端顾客") : n.$t("店内建档")) + " · " + e.toDisplayString(n.$t("授权于 {p0}", { p0: e.unref(b.fmtDateTime)(d.value.consentAt) })),
                  1
                  /* TEXT */
                ),
                d.value.purgedAt ? (e.openBlock(), e.createElementBlock("p", Ft, [
                  r[15] || (r[15] = e.createElementVNode(
                    "i",
                    { class: "ri-delete-bin-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("该顾客的照片与试穿图已清除")),
                    1
                    /* TEXT */
                  )
                ])) : d.value.photo && !d.value.photoCheck ? (e.openBlock(), e.createElementBlock("p", Pt, [
                  r[16] || (r[16] = e.createElementVNode(
                    "i",
                    { class: "ri-loader-4-line spin" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("正在检查照片…")),
                    1
                    /* TEXT */
                  )
                ])) : d.value.photoCheck && !d.value.photoCheck.ok ? (e.openBlock(), e.createElementBlock("p", Wt, [
                  r[17] || (r[17] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("照片不适合试穿：{p0}。请重拍一张单人、全身正面、光线充足的照片", { p0: d.value.photoCheck.issues.join("；") || n.$t("不符合要求") })),
                    1
                    /* TEXT */
                  )
                ])) : d.value.photoCheck?.ok ? (e.openBlock(), e.createElementBlock("p", Rt, [
                  r[18] || (r[18] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("照片合格：单人、全身、光线正常")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", jt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: e.normalizeClass(["ss-btn sm", { primary: !d.value.photo }]),
                    disabled: !!s.value,
                    onClick: Ae
                  }, [
                    r[19] || (r[19] = e.createElementVNode(
                      "i",
                      { class: "ri-camera-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.value.photo ? n.$t("换一张照片") : n.$t("上传全身照")),
                      1
                      /* TEXT */
                    )
                  ], 10, qt),
                  e.createElementVNode("label", Gt, [
                    e.createTextVNode(
                      e.toDisplayString(n.$t("身高")) + " ",
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": r[7] || (r[7] = (a) => D.heightCm = a),
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
                    ]),
                    r[20] || (r[20] = e.createTextVNode(
                      " cm",
                      -1
                      /* CACHED */
                    ))
                  ]),
                  e.createElementVNode("label", Ht, [
                    e.createTextVNode(
                      e.toDisplayString(n.$t("体重")) + " ",
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": r[8] || (r[8] = (a) => D.weightKg = a),
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
                    ]),
                    r[21] || (r[21] = e.createTextVNode(
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
                      onClick: Le
                    },
                    e.toDisplayString(n.$t("保存")),
                    1
                    /* TEXT */
                  ),
                  r[23] || (r[23] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm danger",
                    disabled: !!s.value || !!d.value.purgedAt,
                    onClick: Ie
                  }, [
                    r[22] || (r[22] = e.createElementVNode(
                      "i",
                      { class: "ri-delete-bin-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("删除该顾客照片")),
                      1
                      /* TEXT */
                    )
                  ], 8, Qt)
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Dt, [
                  e.createElementVNode("label", Bt, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("称呼（选填）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": r[3] || (r[3] = (a) => S.nickname = a),
                        type: "text",
                        maxlength: "20"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        S.nickname,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("label", wt, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("身高 cm（选填，尺码助手用）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": r[4] || (r[4] = (a) => S.heightCm = a),
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
                        S.heightCm,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("label", Ct, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("体重 kg（选填）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": r[5] || (r[5] = (a) => S.weightKg = a),
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
                        S.weightKg,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])
                ]),
                e.createElementVNode("label", Tt, [
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": r[6] || (r[6] = (a) => S.consent = a),
                      type: "checkbox"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelCheckbox, S.consent]
                  ]),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(n.$t("顾客已同意：照片仅用于本次试穿，会发送到云端 AI 生成试穿图，保存在本店电脑，{d} 天后自动删除，可随时一键删除。", { d: e.unref(c)?.settings.retentionDays || 7 })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", At, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!s.value || !S.consent,
                    onClick: Te
                  }, [
                    r[13] || (r[13] = e.createElementVNode(
                      "i",
                      { class: "ri-user-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("建档并上传照片")),
                      1
                      /* TEXT */
                    )
                  ], 8, Lt),
                  e.createElementVNode(
                    "span",
                    It,
                    e.toDisplayString(n.$t("或让顾客扫「手机端」页签里的门店码自己上传，顾客会出现在上面的列表里")),
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
        e.createVNode(q, {
          "step-key": "ap-analyze",
          index: 2,
          title: L[2].title,
          hint: L[2].hint,
          runtime: U.value["ap-analyze"],
          "is-current": F.value === "ap-analyze"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Yt, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!s.value || !d.value?.photo,
                onClick: Me
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(s.value === "ap-analyze" ? "ri-loader-4-line spin" : "ri-body-scan-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(d.value?.profile ? n.$t("重新分析") : n.$t("分析体型、肤色、脸型")),
                  1
                  /* TEXT */
                )
              ], 8, Jt),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost sm",
                disabled: !d.value?.photo,
                onClick: r[9] || (r[9] = (a) => w.value = !0)
              }, e.toDisplayString(n.$t("跳过")), 9, Xt),
              e.createElementVNode(
                "span",
                Zt,
                e.toDisplayString(n.$t("AI 估计，仅供搭配参考")),
                1
                /* TEXT */
              )
            ]),
            d.value?.profile ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", xt, [
                  e.createElementVNode("div", en, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(n.$t("体型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(de)(d.value.profile.bodyShape)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", tn, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(n.$t("肤色")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(d.value.profile.skinTone || "—"),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", nn, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(n.$t("脸型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(d.value.profile.faceShape || "—"),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                d.value.profile.notes ? (e.openBlock(), e.createElementBlock("p", ln, [
                  r[24] || (r[24] = e.createElementVNode(
                    "i",
                    { class: "ri-lightbulb-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(d.value.profile.notes),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", on, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(d.value.profile.suggestions, (a, B) => (e.openBlock(), e.createElementBlock("div", {
                      key: B,
                      class: "ap-sug"
                    }, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(n.$t("推荐 {n}", { n: B + 1 })),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(e.unref(K)(a)),
                        1
                        /* TEXT */
                      ),
                      a.reason ? (e.openBlock(), e.createElementBlock(
                        "small",
                        sn,
                        e.toDisplayString(a.reason),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", an, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !d.value.profile.suggestions.length,
                    onClick: Oe
                  }, [
                    r[25] || (r[25] = e.createElementVNode(
                      "i",
                      { class: "ri-lightbulb-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("套用这 {n} 组推荐", { n: d.value.profile.suggestions.length })),
                      1
                      /* TEXT */
                    )
                  ], 8, rn)
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
        e.createVNode(q, {
          "step-key": "ap-style",
          index: 3,
          title: L[3].title,
          hint: L[3].hint,
          runtime: U.value["ap-style"],
          "is-current": F.value === "ap-style"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", cn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(g.value, (a, B) => (e.openBlock(), e.createElementBlock("button", {
                  key: B,
                  type: "button",
                  class: e.normalizeClass(["ap-look", { on: V.value === B }]),
                  onClick: (j) => V.value = B
                }, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(n.$t("造型 {n}", { n: B + 1 })),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(K)(a)),
                    1
                    /* TEXT */
                  ),
                  g.value.length > 1 ? (e.openBlock(), e.createElementBlock("i", {
                    key: 0,
                    class: "ri-close-line",
                    role: "button",
                    "aria-label": n.$t("删除"),
                    onClick: e.withModifiers((j) => Ke(B), ["stop"])
                  }, null, 8, un)) : e.createCommentVNode("v-if", !0)
                ], 10, dn))),
                128
                /* KEYED_FRAGMENT */
              )),
              g.value.length < 4 ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ap-look add",
                onClick: Ue
              }, [
                r[26] || (r[26] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("再加一组")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("div", mn, [
              f.value?.recommended ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn sm ghost",
                onClick: ze
              }, [
                r[27] || (r[27] = e.createElementVNode(
                  "i",
                  { class: "ri-star-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("用「{p0}」的店长推荐", { p0: f.value.name })),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            e.createVNode(De, {
              modelValue: g.value[V.value],
              "onUpdate:modelValue": r[10] || (r[10] = (a) => g.value[V.value] = a),
              audience: f.value?.audience || null
            }, {
              upload: e.withCtx(() => [
                e.createElementVNode("div", pn, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !d.value || !!s.value,
                    onClick: Fe
                  }, [
                    r[28] || (r[28] = e.createElementVNode(
                      "i",
                      { class: "ri-image-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(k.value ? n.$t("换一张背景照片") : n.$t("上传背景照片")),
                      1
                      /* TEXT */
                    )
                  ], 8, gn),
                  k.value ? (e.openBlock(), e.createElementBlock(
                    "span",
                    vn,
                    e.toDisplayString(n.$t("已上传")),
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
        e.createVNode(q, {
          "step-key": "ap-generate",
          index: 4,
          title: L[4].title,
          hint: L[4].hint,
          runtime: U.value["ap-generate"],
          "is-current": F.value === "ap-generate",
          retry: ee.value.length ? void 0 : We
        }, {
          default: e.withCtx(() => [
            e.unref(c)?.imageReady ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", yn, [
              r[29] || (r[29] = e.createElementVNode(
                "i",
                { class: "ri-key-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发")),
                1
                /* TEXT */
              )
            ])),
            e.createElementVNode("div", kn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!s.value || !Be.value,
                onClick: ae
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(s.value === "ap-generate" ? "ri-loader-4-line spin" : "ri-shirt-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(n.$t("生成 {n} 张试穿图", { n: N.value.length * g.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, hn),
              e.createElementVNode(
                "span",
                Vn,
                e.toDisplayString(n.$t("{a} 件 × {b} 组造型，单张约 5–30 秒，同时生成 2 张", { a: N.value.length, b: g.value.length })),
                1
                /* TEXT */
              )
            ]),
            A.value.length ? (e.openBlock(), e.createElementBlock("div", En, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(A.value, (a) => (e.openBlock(), e.createElementBlock(
                  "div",
                  {
                    key: a.id,
                    class: e.normalizeClass(["ap-q", a.status])
                  },
                  [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", a.status === "done" ? "ok" : a.status === "failed" ? "bad" : "brand"])
                      },
                      [
                        a.status === "running" || a.status === "queued" ? (e.openBlock(), e.createElementBlock("i", Nn)) : e.createCommentVNode("v-if", !0),
                        e.createTextVNode(
                          e.toDisplayString(e.unref(tt)(a.status)),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    ),
                    e.createElementVNode(
                      "span",
                      fn,
                      e.toDisplayString(H(a.garmentId)) + " · " + e.toDisplayString(e.unref(K)(a.choice)),
                      1
                      /* TEXT */
                    ),
                    a.error ? (e.openBlock(), e.createElementBlock(
                      "span",
                      _n,
                      e.toDisplayString(a.error),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    a.status === "failed" ? (e.openBlock(), e.createElementBlock("button", {
                      key: 1,
                      type: "button",
                      class: "ss-link",
                      onClick: (B) => Pe(a.id)
                    }, e.toDisplayString(n.$t("重试")), 9, bn)) : e.createCommentVNode("v-if", !0)
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
        e.createVNode(q, {
          "step-key": "ap-view",
          index: 5,
          title: L[5].title,
          hint: L[5].hint,
          runtime: U.value["ap-view"],
          "is-current": F.value === "ap-view"
        }, {
          default: e.withCtx(() => [
            z.value.length ? (e.openBlock(), e.createElementBlock("div", Sn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(z.value, (a) => (e.openBlock(), e.createElementBlock("figure", {
                  key: a.id,
                  class: e.normalizeClass({ on: t.value?.id === a.id }),
                  onClick: (B) => t.value = a
                }, [
                  e.createElementVNode("img", {
                    src: e.unref(I.fileUrl)(a.image),
                    alt: "",
                    loading: "lazy"
                  }, null, 8, Bn),
                  e.createElementVNode("figcaption", null, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(H(a.garmentId)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(e.unref(K)(a.choice)),
                      1
                      /* TEXT */
                    )
                  ])
                ], 10, Dn))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              $n,
              e.toDisplayString(n.$t("生成完成的试穿图会出现在这里")),
              1
              /* TEXT */
            )),
            t.value ? (e.openBlock(), e.createElementBlock("div", wn, [
              e.createElementVNode("img", {
                src: e.unref(I.fileUrl)(t.value.image),
                alt: ""
              }, null, 8, Cn),
              e.createElementVNode("div", Tn, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(H(t.value.garmentId)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  An,
                  e.toDisplayString(e.unref(K)(t.value.choice)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("span", Ln, [
                  e.createTextVNode(
                    e.toDisplayString(n.$t("试穿码")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "b",
                    In,
                    e.toDisplayString(t.value.code),
                    1
                    /* TEXT */
                  ),
                  e.createTextVNode(
                    " · " + e.toDisplayString(e.unref(Se)(t.value.model || "")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Mn, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    onClick: r[11] || (r[11] = (a) => Re(t.value))
                  }, [
                    r[30] || (r[30] = e.createElementVNode(
                      "i",
                      { class: "ri-file-copy-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("复制（带门店水印）")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    onClick: qe
                  }, [
                    r[31] || (r[31] = e.createElementVNode(
                      "i",
                      { class: "ri-download-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("导出全部试穿图")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("div", On, [
                  e.createElementVNode("strong", null, [
                    r[32] || (r[32] = e.createElementVNode(
                      "i",
                      { class: "ri-smartphone-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("在顾客手机上查看")),
                      1
                      /* TEXT */
                    )
                  ]),
                  l.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("img", {
                        src: l.value,
                        alt: ""
                      }, null, 8, zn),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(n.$t("顾客连店内 Wi-Fi 扫码，即可在手机上看到并长按保存这些试穿图")),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.unref(c)?.mobile.running ? (e.openBlock(), e.createElementBlock("button", {
                    key: 2,
                    type: "button",
                    class: "ss-btn sm",
                    onClick: Ge
                  }, [
                    r[33] || (r[33] = e.createElementVNode(
                      "i",
                      { class: "ri-qr-code-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("生成顾客查看码")),
                      1
                      /* TEXT */
                    )
                  ])) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Un,
                    e.toDisplayString(n.$t("先在「手机端」页签开启门店手机服务")),
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
        e.createVNode(q, {
          "step-key": "ap-visit",
          index: 6,
          title: L[6].title,
          hint: L[6].hint,
          runtime: U.value["ap-visit"],
          "is-current": F.value === "ap-visit"
        }, {
          default: e.withCtx(() => [
            z.value.length ? (e.openBlock(), e.createElementBlock("div", Fn, [
              e.createElementVNode("table", Pn, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("款式")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("造型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("试穿码")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("推荐尺码")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("到店")),
                      1
                      /* TEXT */
                    ),
                    r[34] || (r[34] = e.createElementVNode(
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
                    e.renderList(z.value, (a) => (e.openBlock(), e.createElementBlock("tr", {
                      key: a.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(H(a.garmentId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Wn,
                        e.toDisplayString(e.unref(K)(a.choice)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "b",
                          Rn,
                          e.toDisplayString(a.wantVisit ? a.code : "—"),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(a.size || (a.wantVisit ? n.$t("未填身高") : "—")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        a.visit ? (e.openBlock(), e.createElementBlock(
                          "span",
                          {
                            key: 0,
                            class: e.normalizeClass(["ss-chip", a.visit.status === "purchased" ? "ok" : a.visit.status === "left" ? "bad" : "brand"])
                          },
                          e.toDisplayString(e.unref($e)(a.visit.status)) + e.toDisplayString(a.visit.size ? ` · ${a.visit.size}` : ""),
                          3
                          /* TEXT, CLASS */
                        )) : (e.openBlock(), e.createElementBlock("span", jn, "—"))
                      ]),
                      e.createElementVNode("td", qn, [
                        a.wantVisit ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 1 },
                          [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (B) => Y(a.id, "prepared")
                            }, e.toDisplayString(n.$t("已备货")), 9, Hn),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (B) => Y(a.id, "tried")
                            }, e.toDisplayString(n.$t("已试穿")), 9, Qn),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (B) => Y(a.id, "purchased")
                            }, e.toDisplayString(n.$t("成交")), 9, Yn),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (B) => Y(a.id, "left")
                            }, e.toDisplayString(n.$t("未成交")), 9, Jn)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-btn sm primary",
                          onClick: (B) => He(a.id)
                        }, e.toDisplayString(n.$t("想试实物")), 9, Gn))
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              Kn,
              e.toDisplayString(n.$t("有试穿图后，顾客点「想试实物」就会得到试穿码与推荐尺码")),
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
}), el = /* @__PURE__ */ O(xn, [["__scopeId", "data-v-f11bc0c7"]]), tl = { class: "ap-gl" }, nl = { class: "ap-head" }, ll = { class: "ss-muted" }, ol = ["disabled"], sl = { class: "ss-muted" }, al = {
  key: 0,
  class: "ss-empty"
}, il = { class: "ap-gl__items" }, rl = ["onClick"], cl = ["src"], dl = {
  key: 0,
  class: "ss-panel ap-gl__edit"
}, ul = { class: "ap-head" }, ml = {
  key: 0,
  class: "ss-chip brand"
}, pl = ["disabled"], gl = { class: "ap-gl__top" }, vl = ["src"], yl = { class: "ss-grid" }, kl = { class: "ss-field" }, hl = { class: "ss-field" }, Vl = { class: "ss-field" }, El = { class: "ss-field" }, Nl = { class: "ss-field" }, fl = { class: "ss-field" }, _l = { class: "ss-field" }, bl = { class: "ss-field" }, $l = ["value"], Sl = { class: "ss-field" }, Dl = { value: "women" }, Bl = { value: "men" }, wl = { value: "kids" }, Cl = { class: "ss-field" }, Tl = { class: "ss-field" }, Al = { class: "ap-stock" }, Ll = { class: "ss-subhead" }, Il = { class: "ap-stock__row" }, Ml = ["onUpdate:modelValue"], Ol = ["aria-label", "onClick"], zl = { class: "ap-stock__add" }, Ul = ["placeholder", "onKeydown"], Kl = { class: "ap-check" }, Fl = { class: "ap-rec" }, Pl = { class: "ss-subhead" }, Wl = { class: "ss-actions" }, Rl = ["disabled"], jl = ["disabled"], ql = /* @__PURE__ */ e.defineComponent({
  __name: "GarmentsTab",
  setup(E) {
    const m = W.useNotificationStore(), v = [i.t("春"), i.t("夏"), i.t("秋"), i.t("冬"), i.t("四季")], c = e.computed(() => C.value?.garments || []), h = e.ref(null), p = e.reactive({}), u = e.ref({ backgroundId: "B29", poseId: "P01", hairId: "H00" }), N = e.ref(""), o = e.ref(""), d = e.ref("");
    function f(t) {
      const l = c.value.find((s) => s.id === t);
      l && (h.value = l, Object.assign(p, JSON.parse(JSON.stringify(l))), u.value = l.recommended ? { ...l.recommended } : { backgroundId: "B29", backgroundVariant: "B29-1", poseId: "P01", poseVariant: "P01-1", hairId: "H00" }, N.value = l.tags.join(i.t("，")));
    }
    function S() {
      const t = o.value.trim().toUpperCase();
      t && !(t in p.stock) && (p.stock[t] = 0), o.value = "";
    }
    const D = e.ref(!1);
    function w(t) {
      D.value = !1;
      const l = b.droppedPaths(t, he);
      l.length && g(l);
    }
    async function g(t) {
      const l = t?.length ? t : await X(!0, i.t("选择服装白底图 / 平铺图"));
      if (l.length) {
        d.value = "import";
        try {
          const s = await $("garments.import", { paths: l });
          await T();
          for (const _ of s)
            try {
              await $("garment.tag", { id: _.id });
            } catch (A) {
              m.warn(b.errorMessage(A));
              break;
            }
          await T(), s[0] && f(s[0].id);
        } catch (s) {
          m.error(b.errorMessage(s));
        } finally {
          d.value = "";
        }
      }
    }
    async function V() {
      if (h.value) {
        d.value = "tag";
        try {
          await $("garment.tag", { id: h.value.id }), await T(), f(h.value.id);
        } catch (t) {
          m.error(b.errorMessage(t));
        } finally {
          d.value = "";
        }
      }
    }
    async function y() {
      d.value = "save";
      try {
        await $("garment.save", { input: { ...p, tags: N.value.split(/[,，、\s]+/).filter(Boolean), recommended: u.value } }), await T(), f(p.id), m.success(i.t("已保存"));
      } catch (t) {
        m.error(b.errorMessage(t));
      } finally {
        d.value = "";
      }
    }
    async function k() {
      if (!(!h.value || !window.confirm(i.t("删除商品「{p0}」？", { p0: h.value.name }))))
        try {
          await $("garment.remove", { id: h.value.id }), h.value = null, await T();
        } catch (t) {
          m.error(b.errorMessage(t));
        }
    }
    return (t, l) => (e.openBlock(), e.createElementBlock("div", tl, [
      e.createElementVNode(
        "section",
        {
          class: e.normalizeClass(["ss-panel ap-gl__list", { over: D.value }]),
          onDragover: l[1] || (l[1] = e.withModifiers((s) => D.value = !0, ["prevent"])),
          onDragleave: l[2] || (l[2] = e.withModifiers((s) => D.value = !1, ["prevent"])),
          onDrop: e.withModifiers(w, ["prevent"])
        },
        [
          e.createElementVNode("header", nl, [
            e.createElementVNode("strong", null, [
              l[18] || (l[18] = e.createElementVNode(
                "i",
                { class: "ri-t-shirt-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("商品库")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "span",
              ll,
              e.toDisplayString(t.$t("{n} 件，手机端上架 {m} 件", { n: c.value.length, m: c.value.filter((s) => s.onShelf).length })),
              1
              /* TEXT */
            ),
            l[20] || (l[20] = e.createElementVNode(
              "span",
              { class: "grow" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm primary",
              disabled: !!d.value,
              onClick: l[0] || (l[0] = (s) => g())
            }, [
              l[19] || (l[19] = e.createElementVNode(
                "i",
                { class: "ri-image-add-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("导入服装图")),
                1
                /* TEXT */
              )
            ], 8, ol)
          ]),
          e.createElementVNode(
            "p",
            sl,
            e.toDisplayString(t.$t("可把图片直接拖进来批量导入。")) + e.toDisplayString(t.$t("白底图或平铺图效果最好。导入后 AI 自动识别品类、颜色、风格、面料、季节与适用人群，并给一组推荐造型；识别结果可手改。经营自动化智能体的上下架与短视频也用这份商品库。")),
            1
            /* TEXT */
          ),
          c.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            al,
            e.toDisplayString(t.$t("还没有商品")),
            1
            /* TEXT */
          )),
          e.createElementVNode("div", il, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(c.value, (s) => (e.openBlock(), e.createElementBlock("button", {
                key: s.id,
                type: "button",
                class: e.normalizeClass(["ap-gl__item", { on: h.value?.id === s.id }]),
                onClick: (_) => f(s.id)
              }, [
                e.createElementVNode("img", {
                  src: e.unref(I.fileUrl)(s.image),
                  alt: "",
                  loading: "lazy"
                }, null, 8, cl),
                e.createElementVNode("span", null, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(s.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString([s.category, s.color, s.style].filter(Boolean).join(" · ") || t.$t("未打标签")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    "¥" + e.toDisplayString(s.price) + " · " + e.toDisplayString(t.$t("库存 {n}", { n: e.unref(nt)(s.stock) })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "em",
                  {
                    class: e.normalizeClass(["ss-chip", s.onShelf ? "ok" : ""])
                  },
                  e.toDisplayString(s.onShelf ? t.$t("已上架") : t.$t("未上架")),
                  3
                  /* TEXT, CLASS */
                )
              ], 10, rl))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ],
        34
        /* CLASS, NEED_HYDRATION */
      ),
      h.value ? (e.openBlock(), e.createElementBlock("section", dl, [
        e.createElementVNode("header", ul, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(t.$t("编辑商品")),
            1
            /* TEXT */
          ),
          h.value.taggedBy ? (e.openBlock(), e.createElementBlock(
            "span",
            ml,
            e.toDisplayString(t.$t("AI 已打标签")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          l[21] || (l[21] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: !!d.value,
            onClick: V
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(d.value === "tag" ? "ri-loader-4-line spin" : "ri-price-tag-3-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(t.$t("AI 重新打标签")),
              1
              /* TEXT */
            )
          ], 8, pl)
        ]),
        e.createElementVNode("div", gl, [
          e.createElementVNode("img", {
            src: e.unref(I.fileUrl)(h.value.image),
            alt: ""
          }, null, 8, vl),
          e.createElementVNode("div", yl, [
            e.createElementVNode("label", kl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("名称")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": l[3] || (l[3] = (s) => p.name = s),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  p.name,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", hl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("货号")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": l[4] || (l[4] = (s) => p.sku = s),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  p.sku,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", Vl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("价格（元）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": l[5] || (l[5] = (s) => p.price = s),
                  type: "number",
                  min: "0"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  p.price,
                  void 0,
                  { number: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", El, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("品类")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": l[6] || (l[6] = (s) => p.category = s),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  p.category,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", Nl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("颜色")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": l[7] || (l[7] = (s) => p.color = s),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  p.color,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", fl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("风格")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": l[8] || (l[8] = (s) => p.style = s),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  p.style,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", _l, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("面料")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": l[9] || (l[9] = (s) => p.fabric = s),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  p.fabric,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", bl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("季节")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": l[10] || (l[10] = (s) => p.season = s)
                },
                [
                  l[22] || (l[22] = e.createElementVNode(
                    "option",
                    { value: "" },
                    "—",
                    -1
                    /* CACHED */
                  )),
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(v, (s) => e.createElementVNode("option", {
                      key: s,
                      value: s
                    }, e.toDisplayString(s), 9, $l)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, p.season]
              ])
            ]),
            e.createElementVNode("label", Sl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("适用人群")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": l[11] || (l[11] = (s) => p.audience = s)
                },
                [
                  e.createElementVNode(
                    "option",
                    Dl,
                    e.toDisplayString(t.$t("女装")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "option",
                    Bl,
                    e.toDisplayString(t.$t("男装")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "option",
                    wl,
                    e.toDisplayString(t.$t("童装")),
                    1
                    /* TEXT */
                  )
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, p.audience]
              ])
            ])
          ])
        ]),
        e.createElementVNode("label", Cl, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(t.$t("卖点（上架文案、短视频脚本用）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": l[12] || (l[12] = (s) => p.sellingPoints = s),
              rows: "2"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, p.sellingPoints]
          ])
        ]),
        e.createElementVNode("label", Tl, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(t.$t("标签（逗号分隔）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": l[13] || (l[13] = (s) => N.value = s),
              type: "text"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, N.value]
          ])
        ]),
        e.createElementVNode("div", Al, [
          e.createElementVNode(
            "span",
            Ll,
            e.toDisplayString(t.$t("尺码与库存")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", Il, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(p.stock, (s, _) => (e.openBlock(), e.createElementBlock("label", {
                key: _,
                class: "ap-stock__cell"
              }, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(_),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": (A) => p.stock[_] = A,
                  type: "number",
                  min: "0"
                }, null, 8, Ml), [
                  [
                    e.vModelText,
                    p.stock[_],
                    void 0,
                    { number: !0 }
                  ]
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  "aria-label": t.$t("删除"),
                  onClick: (A) => delete p.stock[_]
                }, [...l[23] || (l[23] = [
                  e.createElementVNode(
                    "i",
                    { class: "ri-close-line" },
                    null,
                    -1
                    /* CACHED */
                  )
                ])], 8, Ol)
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            e.createElementVNode("span", zl, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": l[14] || (l[14] = (s) => o.value = s),
                type: "text",
                placeholder: t.$t("加尺码，如 XL 或 120"),
                onKeydown: e.withKeys(e.withModifiers(S, ["prevent"]), ["enter"])
              }, null, 40, Ul), [
                [
                  e.vModelText,
                  o.value,
                  void 0,
                  { trim: !0 }
                ]
              ]),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: S
                },
                e.toDisplayString(t.$t("添加")),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        e.createElementVNode("label", Kl, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": l[15] || (l[15] = (s) => p.onShelf = s),
              type: "checkbox"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelCheckbox, p.onShelf]
          ]),
          e.createTextVNode(
            e.toDisplayString(t.$t("在门店试穿手机端上架")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Fl, [
          e.createElementVNode(
            "span",
            Pl,
            e.toDisplayString(t.$t("推荐造型（店长推荐）")),
            1
            /* TEXT */
          ),
          e.createVNode(De, {
            modelValue: u.value,
            "onUpdate:modelValue": l[16] || (l[16] = (s) => u.value = s),
            audience: p.audience
          }, null, 8, ["modelValue", "audience"])
        ]),
        e.createElementVNode("div", Wl, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: !!d.value,
            onClick: y
          }, [
            l[24] || (l[24] = e.createElementVNode(
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
          ], 8, Rl),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn ghost",
              onClick: l[17] || (l[17] = (s) => h.value = null)
            },
            e.toDisplayString(t.$t("关闭")),
            1
            /* TEXT */
          ),
          l[26] || (l[26] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm danger",
            disabled: !!d.value,
            onClick: k
          }, [
            l[25] || (l[25] = e.createElementVNode(
              "i",
              { class: "ri-delete-bin-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("删除商品")),
              1
              /* TEXT */
            )
          ], 8, jl)
        ])
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Gl = /* @__PURE__ */ O(ql, [["__scopeId", "data-v-b9476c55"]]), Hl = { class: "ap-lib" }, Ql = { class: "ap-lib__head" }, Yl = {
  class: "ap-lib__kinds",
  role: "tablist"
}, Jl = ["onClick"], Xl = { class: "ss-muted" }, Zl = { class: "ss-muted" }, xl = ["disabled"], eo = {
  key: 0,
  class: "ss-note warn"
}, to = { class: "ap-lib__cards" }, no = ["title"], lo = ["checked", "onChange"], oo = ["src"], so = {
  key: 1,
  class: "ss-muted"
}, ao = { class: "ap-lib__vars" }, io = { class: "ss-muted" }, ro = /* @__PURE__ */ e.defineComponent({
  __name: "StylesTab",
  setup(E) {
    const m = W.useNotificationStore(), v = ["background", "pose", "hair"], c = e.ref("background"), h = e.computed(() => C.value?.settings.disabledOptions || []), p = e.computed(() => G.value.filter((y) => y.kind === c.value)), u = e.computed(() => [...new Set(p.value.map((y) => y.group))]), N = (y) => p.value.filter((k) => k.group === y), o = (y) => G.value.filter((k) => k.kind === y).length, d = e.computed(() => C.value?.thumbs || {}), f = e.computed(() => G.value.filter((y) => !y.needsUpload && y.id !== "H00")), S = e.computed(() => f.value.length), D = e.computed(() => f.value.filter((y) => d.value[y.id]).length), w = e.ref(!1);
    async function g() {
      w.value = !0;
      try {
        const y = await $("options.thumbs", {});
        await T(), y.errors.length ? m.warn(i.t("生成了 {n} 张，{m} 张失败：{p0}", { n: y.made, m: y.errors.length, p0: y.errors[0] })) : m.success(i.t("已生成 {n} 张示意图", { n: y.made }));
      } catch (y) {
        m.error(b.errorMessage(y));
      } finally {
        w.value = !1;
      }
    }
    async function V(y) {
      const k = new Set(h.value);
      k.has(y) ? k.delete(y) : k.add(y);
      try {
        await $("settings.patch", { patch: { disabledOptions: [...k] } }), await T();
      } catch (t) {
        m.error(b.errorMessage(t));
      }
    }
    return (y, k) => (e.openBlock(), e.createElementBlock("section", Hl, [
      e.createElementVNode("header", Ql, [
        e.createElementVNode("div", Yl, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(v, (t) => e.createElementVNode("button", {
              key: t,
              type: "button",
              role: "tab",
              class: e.normalizeClass({ on: c.value === t }),
              onClick: (l) => c.value = t
            }, [
              e.createTextVNode(
                e.toDisplayString(e.unref(_e)(t)) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "em",
                null,
                e.toDisplayString(o(t)),
                1
                /* TEXT */
              )
            ], 10, Jl)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        e.createElementVNode(
          "span",
          Xl,
          e.toDisplayString(y.$t("关掉的选项在顾客手机端不显示；每项都能再选细分场景")),
          1
          /* TEXT */
        ),
        k[0] || (k[0] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "span",
          Zl,
          e.toDisplayString(y.$t("示意图 {a} / {b}", { a: D.value, b: S.value })),
          1
          /* TEXT */
        ),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: w.value || D.value >= S.value,
          onClick: g
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(w.value ? "ri-loader-4-line spin" : "ri-image-ai-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(y.$t("生成缺少的示意图")),
            1
            /* TEXT */
          )
        ], 8, xl)
      ]),
      e.unref(C)?.imageReady ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", eo, [
        k[1] || (k[1] = e.createElementVNode(
          "i",
          { class: "ri-key-2-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t("示意图用图像服务生成（每张约 0.02～0.2 元）；还没有配置图像服务")),
          1
          /* TEXT */
        )
      ])),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(u.value, (t) => (e.openBlock(), e.createElementBlock("div", {
          key: t,
          class: "ap-lib__group"
        }, [
          e.createElementVNode(
            "h4",
            null,
            e.toDisplayString(t),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", to, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(N(t), (l) => (e.openBlock(), e.createElementBlock(
                "article",
                {
                  key: l.id,
                  class: e.normalizeClass(["ap-lib__card", { off: h.value.includes(l.id) }])
                },
                [
                  e.createElementVNode("header", null, [
                    e.createElementVNode(
                      "code",
                      null,
                      e.toDisplayString(l.id),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(l.label),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("label", {
                      class: "ap-switch",
                      title: h.value.includes(l.id) ? y.$t("已关闭") : y.$t("已开启")
                    }, [
                      e.createElementVNode("input", {
                        type: "checkbox",
                        checked: !h.value.includes(l.id),
                        onChange: (s) => V(l.id)
                      }, null, 40, lo),
                      k[2] || (k[2] = e.createElementVNode(
                        "span",
                        null,
                        null,
                        -1
                        /* CACHED */
                      ))
                    ], 8, no)
                  ]),
                  d.value[l.id] ? (e.openBlock(), e.createElementBlock("img", {
                    key: 0,
                    src: e.unref(I.fileUrl)(d.value[l.id]),
                    alt: "",
                    class: "ap-lib__thumb",
                    loading: "lazy"
                  }, null, 8, oo)) : e.createCommentVNode("v-if", !0),
                  l.detail ? (e.openBlock(), e.createElementBlock(
                    "p",
                    so,
                    e.toDisplayString(l.detail),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("div", ao, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(l.variants, (s) => (e.openBlock(), e.createElementBlock(
                        "span",
                        {
                          key: s.id
                        },
                        e.toDisplayString(s.label),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]),
                  e.createElementVNode(
                    "small",
                    io,
                    e.toDisplayString(l.audience.map(e.unref(be)).join(" / ")),
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
}), co = /* @__PURE__ */ O(ro, [["__scopeId", "data-v-b66be867"]]), uo = { class: "ap-mob" }, mo = { class: "ss-panel" }, po = { class: "ap-head" }, go = {
  key: 0,
  class: "ss-muted"
}, vo = ["disabled"], yo = ["disabled"], ko = { class: "ss-muted" }, ho = {
  key: 0,
  class: "ap-mob__qr"
}, Vo = ["src"], Eo = { class: "ap-mob__info" }, No = { class: "ss-actions" }, fo = { class: "ss-muted" }, _o = { class: "ss-muted" }, bo = { class: "ss-panel" }, $o = { class: "ap-head" }, So = { class: "ss-muted" }, Do = {
  key: 0,
  class: "ss-empty"
}, Bo = {
  key: 1,
  class: "ss-table-wrap"
}, wo = { class: "ss-table" }, Co = ["onClick"], To = /* @__PURE__ */ e.defineComponent({
  __name: "MobileTab",
  emits: ["open-customer"],
  setup(E) {
    const m = W.useNotificationStore(), v = C, c = e.computed(() => v.value?.mobile), h = e.ref(""), p = e.ref(!1), u = e.computed(() => (v.value?.customers || []).filter((g) => g.source === "mobile")), N = (g) => (v.value?.tryons || []).filter((V) => V.customerId === g);
    e.watch(() => c.value?.joinUrl, async (g) => {
      h.value = g ? await ve.toDataURL(g, { margin: 1, width: 240 }) : "";
    }, { immediate: !0 });
    async function o(g) {
      p.value = !0;
      try {
        await $(g), await T();
      } catch (V) {
        m.error(b.errorMessage(V));
      } finally {
        p.value = !1;
      }
    }
    const d = () => o("mobile.start"), f = () => o("mobile.stop");
    async function S() {
      window.confirm(i.t("更换门店码？已打印的旧码会失效。")) && await o("mobile.rotateKey");
    }
    async function D(g) {
      try {
        await navigator.clipboard.writeText(g), m.success(i.t("已复制"));
      } catch (V) {
        m.error(b.errorMessage(V));
      }
    }
    async function w() {
      if (!h.value) return;
      const g = new Image();
      g.src = h.value, await g.decode();
      const V = document.createElement("canvas");
      V.width = 600, V.height = 760;
      const y = V.getContext("2d");
      y.fillStyle = "#fff", y.fillRect(0, 0, V.width, V.height), y.fillStyle = "#222", y.textAlign = "center", y.font = '700 36px -apple-system, "PingFang SC", sans-serif', y.fillText(v.value?.settings.storeName || "", 300, 80), y.font = '24px -apple-system, "PingFang SC", sans-serif', y.fillText(i.t("连店内 Wi-Fi，扫码 AI 试穿"), 300, 130), y.drawImage(g, 90, 170, 420, 420);
      const k = document.createElement("a");
      k.href = V.toDataURL("image/png"), k.download = `${v.value?.settings.storeName || "store"}-${i.t("门店码")}.png`, k.click();
    }
    return (g, V) => (e.openBlock(), e.createElementBlock("div", uo, [
      e.createElementVNode("section", mo, [
        e.createElementVNode("header", po, [
          e.createElementVNode("strong", null, [
            V[1] || (V[1] = e.createElementVNode(
              "i",
              { class: "ri-smartphone-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(g.$t("门店手机端")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ss-chip", c.value?.running ? "ok" : ""])
            },
            e.toDisplayString(c.value?.running ? g.$t("运行中") : g.$t("未开启")),
            3
            /* TEXT, CLASS */
          ),
          c.value?.running ? (e.openBlock(), e.createElementBlock(
            "span",
            go,
            e.toDisplayString(g.$t("最近 10 分钟在线 {n} 位顾客", { n: c.value.activeSessions })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          V[4] || (V[4] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          c.value?.running ? (e.openBlock(), e.createElementBlock("button", {
            key: 2,
            type: "button",
            class: "ss-btn",
            disabled: p.value,
            onClick: f
          }, [
            V[3] || (V[3] = e.createElementVNode(
              "i",
              { class: "ri-stop-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(g.$t("关闭")),
              1
              /* TEXT */
            )
          ], 8, yo)) : (e.openBlock(), e.createElementBlock("button", {
            key: 1,
            type: "button",
            class: "ss-btn primary",
            disabled: p.value,
            onClick: d
          }, [
            V[2] || (V[2] = e.createElementVNode(
              "i",
              { class: "ri-play-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(g.$t("开启手机服务")),
              1
              /* TEXT */
            )
          ], 8, vo))
        ]),
        e.createElementVNode(
          "p",
          ko,
          e.toDisplayString(g.$t("顾客连店内 Wi-Fi 扫下面的门店码，用手机浏览器即可：授权 → 拍照 → 选衣服与造型 → 生成试穿图 → 想试实物拿试穿码。照片只存在这台电脑上，不需要小程序。")),
          1
          /* TEXT */
        ),
        c.value?.running && c.value.joinUrl ? (e.openBlock(), e.createElementBlock("div", ho, [
          h.value ? (e.openBlock(), e.createElementBlock("img", {
            key: 0,
            src: h.value,
            alt: ""
          }, null, 8, Vo)) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", Eo, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(e.unref(v)?.settings.storeName),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "code",
              null,
              e.toDisplayString(c.value.joinUrl),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", No, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                onClick: V[0] || (V[0] = (y) => D(c.value.joinUrl))
              }, [
                V[5] || (V[5] = e.createElementVNode(
                  "i",
                  { class: "ri-file-copy-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(g.$t("复制链接")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                onClick: w
              }, [
                V[6] || (V[6] = e.createElementVNode(
                  "i",
                  { class: "ri-download-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(g.$t("保存门店码图片（打印用）")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                onClick: S
              }, [
                V[7] || (V[7] = e.createElementVNode(
                  "i",
                  { class: "ri-refresh-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(g.$t("更换门店码")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode(
              "small",
              fo,
              e.toDisplayString(g.$t("更换后旧码立刻失效（已进来的顾客不受影响）。建议贴在试衣间、收银台。")),
              1
              /* TEXT */
            ),
            c.value.candidates.length ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "small",
                  _o,
                  e.toDisplayString(g.$t("顾客扫码打不开？换下面的地址试试（电脑有多块网卡时）：")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(c.value.candidates, (y) => (e.openBlock(), e.createElementBlock(
                    "code",
                    {
                      key: y,
                      class: "ap-mob__alt"
                    },
                    e.toDisplayString(y),
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
      e.createElementVNode("section", bo, [
        e.createElementVNode("header", $o, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(g.$t("手机端顾客")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            So,
            e.toDisplayString(g.$t("按时间倒序")),
            1
            /* TEXT */
          )
        ]),
        u.value.length ? (e.openBlock(), e.createElementBlock("div", Bo, [
          e.createElementVNode("table", wo, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("顾客")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("照片")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("试穿图")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("想试实物")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(g.$t("进入时间")),
                  1
                  /* TEXT */
                ),
                V[8] || (V[8] = e.createElementVNode(
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
                e.renderList(u.value, (y) => (e.openBlock(), e.createElementBlock("tr", {
                  key: y.id
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(y.nickname),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(y.purgedAt ? g.$t("已清除") : y.photo ? g.$t("已上传") : "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(N(y.id).filter((k) => k.status === "done").length),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(N(y.id).filter((k) => k.wantVisit).length),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(e.unref(b.fmtDateTime)(y.createdAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    y.purgedAt ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: (k) => g.$emit("open-customer", y.id)
                    }, e.toDisplayString(g.$t("在一键换装里打开")), 9, Co))
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Do,
          e.toDisplayString(g.$t("还没有顾客通过手机端使用")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), Ao = /* @__PURE__ */ O(To, [["__scopeId", "data-v-b4e67dc8"]]), Lo = { class: "ap-ci" }, Io = { class: "ss-panel" }, Mo = { class: "ap-head" }, Oo = { class: "ss-muted" }, zo = ["placeholder"], Uo = ["disabled"], Ko = {
  key: 0,
  class: "ss-note danger"
}, Fo = {
  key: 1,
  class: "ap-ci__hit"
}, Po = ["src"], Wo = { class: "ap-ci__info" }, Ro = { class: "ss-muted" }, jo = {
  key: 0,
  class: "ss-note warn"
}, qo = { key: 1 }, Go = { class: "ss-field ap-ci__size" }, Ho = ["value"], Qo = { class: "ss-actions" }, Yo = ["onClick"], Jo = { class: "ss-muted" }, Xo = { class: "ss-panel" }, Zo = { class: "ap-head" }, xo = { class: "ss-muted" }, es = {
  key: 0,
  class: "ss-empty"
}, ts = {
  key: 1,
  class: "ss-table-wrap"
}, ns = { class: "ss-table" }, ls = { class: "ap-code" }, os = ["onClick"], ss = /* @__PURE__ */ e.defineComponent({
  __name: "CheckinTab",
  setup(E) {
    const m = W.useNotificationStore(), v = ["prepared", "tried", "purchased", "left"], c = e.ref(""), h = e.ref(""), p = e.ref(!1), u = e.ref(""), N = e.ref(""), o = e.computed(() => C.value?.tryons.find((t) => t.id === h.value) || null), d = e.computed(() => o.value ? D(o.value.garmentId) : void 0), f = e.computed(() => C.value?.customers.find((t) => t.id === o.value?.customerId)), S = e.computed(() => (C.value?.tryons || []).filter((t) => t.wantVisit && (!t.visit || t.visit.status === "prepared"))), D = (t) => C.value?.garments.find((l) => l.id === t), w = (t) => C.value?.customers.find((l) => l.id === t)?.nickname || "—";
    async function g() {
      p.value = !1;
      try {
        const t = await $("tryon.byCode", { code: c.value });
        h.value = t?.id || "", p.value = !t, N.value = t?.size || "", u.value = t?.visit?.size || t?.size || "";
      } catch (t) {
        m.error(b.errorMessage(t));
      }
    }
    function V(t) {
      const l = new Date(t.wantAt || t.createdAt), s = /* @__PURE__ */ new Date();
      return l.toDateString() === s.toDateString();
    }
    function y(t) {
      c.value = t, g();
    }
    async function k(t) {
      if (o.value)
        try {
          await $("tryon.visit", { id: o.value.id, status: t, size: u.value }), await T();
        } catch (l) {
          m.error(b.errorMessage(l));
        }
    }
    return (t, l) => (e.openBlock(), e.createElementBlock("div", Lo, [
      e.createElementVNode("section", Io, [
        e.createElementVNode("header", Mo, [
          e.createElementVNode("strong", null, [
            l[2] || (l[2] = e.createElementVNode(
              "i",
              { class: "ri-qr-scan-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("到店核销")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            Oo,
            e.toDisplayString(t.$t("顾客出示 6 位试穿码；读混 0/O、1/I 也能认")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "form",
          {
            class: "ap-ci__form",
            onSubmit: e.withModifiers(g, ["prevent"])
          },
          [
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": l[0] || (l[0] = (s) => c.value = s),
              type: "text",
              maxlength: "8",
              placeholder: t.$t("输入试穿码"),
              autofocus: ""
            }, null, 8, zo), [
              [e.vModelText, c.value]
            ]),
            e.createElementVNode("button", {
              type: "submit",
              class: "ss-btn primary",
              disabled: c.value.trim().length < 6
            }, [
              l[3] || (l[3] = e.createElementVNode(
                "i",
                { class: "ri-search-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("查找")),
                1
                /* TEXT */
              )
            ], 8, Uo)
          ],
          32
          /* NEED_HYDRATION */
        ),
        p.value ? (e.openBlock(), e.createElementBlock("p", Ko, [
          l[4] || (l[4] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(t.$t("没有找到这个试穿码")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        o.value ? (e.openBlock(), e.createElementBlock("div", Fo, [
          o.value.image ? (e.openBlock(), e.createElementBlock("img", {
            key: 0,
            src: e.unref(I.fileUrl)(o.value.image),
            alt: ""
          }, null, 8, Po)) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", Wo, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(d.value?.name || t.$t("已删除的商品")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              Ro,
              e.toDisplayString(f.value?.nickname) + " · " + e.toDisplayString(e.unref(K)(o.value.choice)),
              1
              /* TEXT */
            ),
            V(o.value) ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", jo, [
              l[5] || (l[5] = e.createElementVNode(
                "i",
                { class: "ri-time-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("试穿码已过期（当天有效，生成于 {p0}）。确认是本人后仍可登记。", { p0: e.unref(b.fmtDateTime)(o.value.wantAt || o.value.createdAt) })),
                1
                /* TEXT */
              )
            ])),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(t.$t("{p0}：", { p0: t.$t("推荐尺码") })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(o.value.size || N.value || t.$t("未填身高，按顾客意愿")),
                1
                /* TEXT */
              )
            ]),
            d.value ? (e.openBlock(), e.createElementBlock("span", qo, [
              e.createTextVNode(
                e.toDisplayString(t.$t("{p0}：", { p0: t.$t("库存") })),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(d.value.stock, (s, _) => (e.openBlock(), e.createElementBlock(
                  "span",
                  {
                    key: _,
                    class: e.normalizeClass(["ss-chip", s > 0 ? "" : "bad"])
                  },
                  e.toDisplayString(_) + " × " + e.toDisplayString(s),
                  3
                  /* TEXT, CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("label", Go, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("实际尺码")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": l[1] || (l[1] = (s) => u.value = s)
                },
                [
                  l[6] || (l[6] = e.createElementVNode(
                    "option",
                    { value: "" },
                    "—",
                    -1
                    /* CACHED */
                  )),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(d.value?.stock || {}, (s, _) => (e.openBlock(), e.createElementBlock("option", {
                      key: _,
                      value: _
                    }, e.toDisplayString(_), 9, Ho))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, u.value]
              ])
            ]),
            e.createElementVNode("div", Qo, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(v, (s) => e.createElementVNode("button", {
                  key: s,
                  type: "button",
                  class: e.normalizeClass(["ss-btn sm", { primary: o.value.visit?.status === s }]),
                  onClick: (_) => k(s)
                }, e.toDisplayString(e.unref($e)(s)), 11, Yo)),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode(
              "small",
              Jo,
              e.toDisplayString(t.$t("登记「成交」会自动扣减该尺码库存 1 件")),
              1
              /* TEXT */
            )
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("section", Xo, [
        e.createElementVNode("header", Zo, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(t.$t("待到店")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            xo,
            e.toDisplayString(t.$t("顾客点了「想试实物」，还没登记结果")),
            1
            /* TEXT */
          )
        ]),
        S.value.length ? (e.openBlock(), e.createElementBlock("div", ts, [
          e.createElementVNode("table", ns, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(t.$t("试穿码")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(t.$t("顾客")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(t.$t("款式")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(t.$t("推荐尺码")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(t.$t("时间")),
                  1
                  /* TEXT */
                ),
                l[7] || (l[7] = e.createElementVNode(
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
                e.renderList(S.value, (s) => (e.openBlock(), e.createElementBlock("tr", {
                  key: s.id
                }, [
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "b",
                      ls,
                      e.toDisplayString(s.code),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(w(s.customerId)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(D(s.garmentId)?.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(s.size || "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(e.unref(b.fmtDateTime)(s.wantAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (_) => y(s.code)
                    }, e.toDisplayString(t.$t("核销")), 9, os)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          es,
          e.toDisplayString(t.$t("暂无")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), as = /* @__PURE__ */ O(ss, [["__scopeId", "data-v-77ae1de4"]]), is = {
  key: 0,
  class: "ap-dash"
}, rs = { class: "ss-kpis" }, cs = { class: "ss-kpi accent" }, ds = { class: "ss-kpi" }, us = { class: "ss-kpi" }, ms = { class: "ss-kpi" }, ps = { class: "ss-kpi" }, gs = { class: "ss-kpi" }, vs = { class: "ss-kpi" }, ys = { class: "ss-panel" }, ks = { class: "ap-head" }, hs = { class: "ss-muted" }, Vs = { class: "ap-funnel" }, Es = { class: "ap-funnel__bar" }, Ns = { class: "ss-panel" }, fs = { class: "ap-head" }, _s = { class: "ss-muted" }, bs = { class: "ap-days" }, $s = ["title"], Ss = { class: "ap-days__bars" }, Ds = { class: "ss-panel" }, Bs = { class: "ap-head" }, ws = {
  key: 0,
  class: "ss-note warn"
}, Cs = { class: "ss-table-wrap" }, Ts = { class: "ss-table" }, As = { class: "num" }, Ls = { class: "num" }, Is = { class: "num" }, Ms = { class: "num" }, Os = { class: "num" }, zs = { class: "num" }, Us = { class: "num" }, Ks = { class: "num" }, Fs = { class: "num" }, Ps = { class: "num" }, Ws = { class: "ap-dash__two" }, Rs = { class: "ss-panel" }, js = { class: "ap-head" }, qs = { class: "ss-muted" }, Gs = {
  key: 0,
  class: "ss-empty"
}, Hs = { class: "ap-rank" }, Qs = { class: "ss-panel" }, Ys = { class: "ap-head" }, Js = { class: "ap-mini__chips" }, Xs = {
  key: 1,
  class: "ss-note"
}, Zs = /* @__PURE__ */ e.defineComponent({
  __name: "DashboardTab",
  setup(E) {
    const m = Ee;
    e.onMounted(() => {
      ce();
    }), e.watch(() => C.value?.tryons, () => {
      ce();
    });
    const v = (u) => C.value?.garments.find((N) => N.id === u)?.name || u, c = e.computed(() => Math.max(1, ...m.value?.byDay.map((u) => u.tryons) || [1])), h = e.computed(() => {
      const u = m.value;
      if (!u) return [];
      const N = Math.max(1, u.done);
      return [
        { label: i.t("生成成功"), value: u.done },
        { label: i.t("想试实物"), value: u.wantVisit },
        { label: i.t("到店试穿"), value: u.tried },
        { label: i.t("成交"), value: u.purchased }
      ].map((o) => ({ ...o, pct: Math.round(o.value / N * 100) }));
    }), p = e.computed(() => [
      { title: i.t("背景"), kind: "b", items: m.value?.backgrounds || [] },
      { title: i.t("姿势"), kind: "p", items: m.value?.poses || [] },
      { title: i.t("发型"), kind: "h", items: m.value?.hairs || [] }
    ]);
    return (u, N) => e.unref(m) ? (e.openBlock(), e.createElementBlock("div", is, [
      e.createElementVNode("div", rs, [
        e.createElementVNode("div", cs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("试穿次数")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(m).tryons),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ds, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("生成成功")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(m).done),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", us, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("顾客")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(m).customers),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ms, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("手机端占比")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(b.fmtPct)(e.unref(m).mobileShare, 0)),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ps, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("想试实物率")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(b.fmtPct)(e.unref(m).wantRate, 0)),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", gs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("到店率")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(b.fmtPct)(e.unref(m).visitRate, 0)),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", vs, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("成交率")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(e.unref(b.fmtPct)(e.unref(m).closeRate, 0)),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("section", ys, [
        e.createElementVNode("header", ks, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(u.$t("转化漏斗")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            hs,
            e.toDisplayString(u.$t("生成成功 → 想试实物 → 到店试穿 → 成交")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Vs, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(h.value, (o) => (e.openBlock(), e.createElementBlock("div", {
              key: o.label,
              class: "ap-funnel__row"
            }, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(o.label),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", Es, [
                e.createElementVNode(
                  "i",
                  {
                    style: e.normalizeStyle({ width: `${o.pct}%` })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(o.value),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      e.createElementVNode("section", Ns, [
        e.createElementVNode("header", fs, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(u.$t("近 14 天")),
            1
            /* TEXT */
          ),
          e.createElementVNode("span", _s, [
            N[0] || (N[0] = e.createElementVNode(
              "i",
              { class: "ap-dot a" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(u.$t("试穿")) + " ",
              1
              /* TEXT */
            ),
            N[1] || (N[1] = e.createElementVNode(
              "i",
              { class: "ap-dot b" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(u.$t("成交")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", bs, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(m).byDay, (o) => (e.openBlock(), e.createElementBlock("div", {
              key: o.day,
              class: "ap-days__col",
              title: `${o.day}：${u.$t("试穿")} ${o.tryons} / ${u.$t("成交")} ${o.purchased}`
            }, [
              e.createElementVNode("div", Ss, [
                e.createElementVNode(
                  "i",
                  {
                    class: "a",
                    style: e.normalizeStyle({ height: `${o.tryons / c.value * 100}%` })
                  },
                  null,
                  4
                  /* STYLE */
                ),
                e.createElementVNode(
                  "i",
                  {
                    class: "b",
                    style: e.normalizeStyle({ height: `${o.purchased / c.value * 100}%` })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ]),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(o.day.slice(5)),
                1
                /* TEXT */
              )
            ], 8, $s))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      e.createElementVNode("section", Ds, [
        e.createElementVNode("header", Bs, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(u.$t("款式排行")),
            1
            /* TEXT */
          )
        ]),
        e.unref(m).lagging.length ? (e.openBlock(), e.createElementBlock("p", ws, [
          N[2] || (N[2] = e.createElementVNode(
            "i",
            { class: "ri-alert-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(u.$t("试穿多、成交少：{p0}。建议检查价格、尺码是否齐全、实物与图片是否一致。", { p0: e.unref(m).lagging.map(v).join("、") })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", Cs, [
          e.createElementVNode("table", Ts, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(u.$t("款式")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  As,
                  e.toDisplayString(u.$t("试穿")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ls,
                  e.toDisplayString(u.$t("成功")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Is,
                  e.toDisplayString(u.$t("想试实物")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Ms,
                  e.toDisplayString(u.$t("到店")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Os,
                  e.toDisplayString(u.$t("成交")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(m).garments, (o) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: o.garmentId,
                    class: e.normalizeClass({ bad: e.unref(m).lagging.includes(o.garmentId) })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(o.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      zs,
                      e.toDisplayString(o.tryons),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Us,
                      e.toDisplayString(o.done),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Ks,
                      e.toDisplayString(o.wantVisit),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Fs,
                      e.toDisplayString(o.tried),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Ps,
                      e.toDisplayString(o.purchased),
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
      e.createElementVNode("div", Ws, [
        e.createElementVNode("section", Rs, [
          e.createElementVNode("header", js, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(u.$t("热门造型组合 Top 10")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "span",
              qs,
              e.toDisplayString(u.$t("指导商品图拍摄与门店陈列主题")),
              1
              /* TEXT */
            )
          ]),
          e.unref(m).combos.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "p",
            Gs,
            e.toDisplayString(u.$t("暂无数据")),
            1
            /* TEXT */
          )),
          e.createElementVNode("ol", Hs, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(m).combos, (o, d) => (e.openBlock(), e.createElementBlock("li", { key: d }, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(e.unref(K)({ backgroundId: o.backgroundId, poseId: o.poseId, hairId: o.hairId })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(o.count),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        e.createElementVNode("section", Qs, [
          e.createElementVNode("header", Ys, [
            e.createElementVNode(
              "strong",
              null,
              e.toDisplayString(u.$t("各类选项热度")),
              1
              /* TEXT */
            )
          ]),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(p.value, (o) => (e.openBlock(), e.createElementBlock("div", {
              key: o.title,
              class: "ap-mini"
            }, [
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(o.title),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", Js, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.items.slice(0, 6), (d) => (e.openBlock(), e.createElementBlock(
                    "span",
                    {
                      key: d.id,
                      class: "ss-chip"
                    },
                    e.toDisplayString(e.unref(K)({ backgroundId: o.kind === "b" ? d.id : "", poseId: o.kind === "p" ? d.id : "", hairId: o.kind === "h" ? d.id : "" })) + " × " + e.toDisplayString(d.count),
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
    ])) : (e.openBlock(), e.createElementBlock("p", Xs, [
      N[3] || (N[3] = e.createElementVNode(
        "i",
        { class: "ri-loader-4-line spin" },
        null,
        -1
        /* CACHED */
      )),
      e.createTextVNode(
        e.toDisplayString(u.$t("正在统计…")),
        1
        /* TEXT */
      )
    ]));
  }
}), xs = /* @__PURE__ */ O(Zs, [["__scopeId", "data-v-8dafc412"]]), ea = { class: "ap-ov" }, ta = { class: "ss-panel" }, na = { class: "ss-muted" }, la = { class: "ap-ov__cards" }, oa = { class: "ss-panel" }, sa = { class: "ss-table-wrap" }, aa = { class: "ss-table" }, ia = { class: "ap-wrap" }, ra = { class: "ap-wrap" }, ca = { class: "ss-panel" }, da = { class: "ap-list" }, ua = { class: "ss-panel" }, ma = { class: "ss-muted" }, pa = /* @__PURE__ */ e.defineComponent({
  __name: "OverviewTab",
  setup(E) {
    const m = [
      { icon: "ri-t-shirt-air-line", title: i.t("AI 一键换装"), text: i.t("顾客照片 + 服装图，按所选背景、姿势、发型生成照片级试穿图") },
      { icon: "ri-landscape-line", title: i.t("75 项造型 · 200+ 细分场景"), text: i.t("背景 30、姿势 20、发型 25（含男装、童装），每项再选细分场景") },
      { icon: "ri-smartphone-line", title: i.t("手机、电脑同时看"), text: i.t("门店码扫码即用；店员建档的顾客也能扫专属码在手机上看、保存") },
      { icon: "ri-qr-scan-2-line", title: i.t("试穿码到店"), text: i.t("想试实物 → 试穿码 + 推荐尺码，店员提前备货，登记成交自动扣库存") },
      { icon: "ri-bar-chart-2-line", title: i.t("试穿数据看板"), text: i.t("漏斗、款式排行、高试穿低成交预警、热门造型组合") },
      { icon: "ri-shield-user-line", title: i.t("隐私优先"), text: i.t("先授权后上传，照片只存门店电脑，到期自动删除，顾客可随时删除") }
    ], v = [
      [i.t("商品库导入与 AI 打标签"), i.t("3D 服装建模、AR 实时试穿")],
      [i.t("顾客授权、照片质检、形象分析"), i.t("微信小程序（先用店内手机网页）")],
      [i.t("背景 / 姿势 / 发型选项库与细分场景"), i.t("对接收银 / 进销存（库存先手工维护）")],
      [i.t("AI 合成、手机电脑同时查看、带码保存"), i.t("顾客在店外通过公网访问")],
      [i.t("试穿码核销、尺码助手、试穿数据看板"), i.t("会员营销、补货预测、巡店（后续规划）")]
    ];
    return (c, h) => (e.openBlock(), e.createElementBlock("div", ea, [
      e.createElementVNode("section", ta, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(c.$t("不止一键换装：先把「试穿 → 到店 → 成交」跑通")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          na,
          e.toDisplayString(c.$t("顾客在手机上 30 秒内看到自己穿上店里衣服的样子，想试实物再进试衣间；店员凭试穿码提前备好尺码；老板看每件款式的试穿、到店与成交，决定主推款。不需要智能试衣镜，也不需要小程序。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", la, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(m, (p) => e.createElementVNode("div", {
              key: p.title,
              class: "ap-ov__card"
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
                "strong",
                null,
                e.toDisplayString(p.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(p.text),
                1
                /* TEXT */
              )
            ])),
            64
            /* STABLE_FRAGMENT */
          ))
        ])
      ]),
      e.createElementVNode("section", oa, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(c.$t("能力边界")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", sa, [
          e.createElementVNode("table", aa, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("本方案做")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(c.$t("本方案不做")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(v, (p, u) => e.createElementVNode("tr", { key: u }, [
                  e.createElementVNode(
                    "td",
                    ia,
                    e.toDisplayString(p[0]),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    ra,
                    e.toDisplayString(p[1]),
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
      e.createElementVNode("section", ca, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(c.$t("AI 结果的可信边界")),
          1
          /* TEXT */
        ),
        e.createElementVNode("ul", da, [
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(c.$t("形象分析只作搭配参考，界面标注「AI 估计」，不给任何身材评价")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(c.$t("推荐造型只能来自选项库，模型给出库外选项一律丢弃")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(c.$t("尺码推荐由尺码表规则计算，不交给模型；没填身高不推荐")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(c.$t("AI 打标签可手改，手改后以人工为准")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(c.$t("未配置图像服务时明确提示去哪配置，不出假图")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("section", ua, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(c.$t("配套：经营自动化智能体")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          ma,
          e.toDisplayString(c.$t("同一个商品库继续用于：短视频生成并发布抖音 / 快手 / 小红书 / 视频号、商品图文上下架、数字人介绍门店、经营数据日报。")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), ga = /* @__PURE__ */ O(pa, [["__scopeId", "data-v-9661ab0e"]]), Z = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!Z) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
Z.default;
const va = {
  key: 0,
  class: "ap-set"
}, ya = { class: "ss-panel" }, ka = { class: "ap-head" }, ha = { class: "ss-grid" }, Va = { class: "ss-field" }, Ea = { class: "ss-field" }, Na = ["value"], fa = { class: "ss-field" }, _a = { class: "ap-check" }, ba = { class: "ss-panel" }, $a = { class: "ap-head" }, Sa = { class: "ss-grid" }, Da = { class: "ss-field" }, Ba = { class: "ap-list" }, wa = { class: "ss-actions" }, Ca = { class: "ss-actions" }, Ta = ["disabled"], Aa = {
  key: 0,
  class: "ss-muted"
}, La = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(E) {
    const m = W.useNotificationStore(), v = e.computed(() => C.value), c = e.reactive({});
    e.watch(() => v.value?.settings, (o) => {
      o && Object.assign(c, o);
    }, { immediate: !0 });
    const h = e.computed(() => !!v.value && ["storeName", "editModel", "mobileDailyLimit", "watermark", "retentionDays"].some((o) => c[o] !== v.value.settings[o]));
    async function p() {
      try {
        await $("settings.patch", { patch: c }), await T(), m.success(i.t("已保存"));
      } catch (o) {
        m.error(b.errorMessage(o));
      }
    }
    async function u() {
      try {
        const o = await $("privacy.purgeExpired");
        await T(), m.success(i.t("已清除 {n} 位顾客的过期照片", { n: o }));
      } catch (o) {
        m.error(b.errorMessage(o));
      }
    }
    async function N() {
      if (window.confirm(i.t("清空全部顾客的照片、试穿图与分析结果？此操作不可恢复。")))
        try {
          const o = await $("privacy.purgeAll");
          await T(), m.success(i.t("已清除 {n} 位顾客的照片与试穿图", { n: o }));
        } catch (o) {
          m.error(b.errorMessage(o));
        }
    }
    return (o, d) => v.value ? (e.openBlock(), e.createElementBlock("div", va, [
      e.createElementVNode("section", ya, [
        e.createElementVNode("header", ka, [
          e.createElementVNode("strong", null, [
            d[5] || (d[5] = e.createElementVNode(
              "i",
              { class: "ri-store-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.$t("门店与生成")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", ha, [
          e.createElementVNode("label", Va, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("门店名称（手机端标题、试穿图水印）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": d[0] || (d[0] = (f) => c.storeName = f),
                type: "text",
                maxlength: "30"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                c.storeName,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Ea, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("换装模型")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": d[1] || (d[1] = (f) => c.editModel = f)
              },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(Z.AP_EDIT_MODELS), (f) => (e.openBlock(), e.createElementBlock("option", {
                    key: f,
                    value: f
                  }, e.toDisplayString(e.unref(Se)(f)) + e.toDisplayString(f === e.unref(Z.AP_EDIT_MODELS)[0] ? o.$t("（推荐，保脸更稳）") : o.$t("（中文提示友好）")), 9, Na))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, c.editModel]
            ])
          ]),
          e.createElementVNode("label", fa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("手机端每人每天最多生成（张）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": d[2] || (d[2] = (f) => c.mobileDailyLimit = f),
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
                c.mobileDailyLimit,
                void 0,
                { number: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode("label", _a, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": d[3] || (d[3] = (f) => c.watermark = f),
              type: "checkbox"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelCheckbox, c.watermark]
          ]),
          e.createTextVNode(
            e.toDisplayString(o.$t("试穿图右下角加门店名与试穿码（顾客保存、分享时带上）")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          {
            class: e.normalizeClass(["ss-note", v.value.imageReady ? "ok" : "warn"])
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(v.value.imageReady ? "ri-check-line" : "ri-key-2-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              " " + e.toDisplayString(v.value.imageReady ? o.$t("图像服务已就绪（换装、打标签、形象分析都用它）") : o.$t("还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ]),
      e.createElementVNode("section", ba, [
        e.createElementVNode("header", $a, [
          e.createElementVNode("strong", null, [
            d[6] || (d[6] = e.createElementVNode(
              "i",
              { class: "ri-shield-user-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.$t("隐私")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Sa, [
          e.createElementVNode("label", Da, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(o.$t("顾客照片与试穿图保留天数（1～30）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": d[4] || (d[4] = (f) => c.retentionDays = f),
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
                c.retentionDays,
                void 0,
                { number: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode("ul", Ba, [
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(o.$t("先授权后上传：没有勾选授权不能上传照片，授权时间记入顾客档案")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(o.$t("照片、试穿图只存在本机账号私有目录；到期自动删除，统计只保留匿名计数")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(o.$t("顾客可在手机端一键删除自己的照片和试穿图；体型分析只存标签，不存测量数据")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(o.$t("照片只用于生成试穿图，不用于营销素材、不用于模型训练")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", wa, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            onClick: u
          }, [
            d[7] || (d[7] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.$t("立即清除过期照片")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm danger",
            onClick: N
          }, [
            d[8] || (d[8] = e.createElementVNode(
              "i",
              { class: "ri-delete-bin-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.$t("清空全部顾客照片与试穿图")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createElementVNode("div", Ca, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: !h.value,
          onClick: p
        }, [
          d[9] || (d[9] = e.createElementVNode(
            "i",
            { class: "ri-save-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(o.$t("保存设置")),
            1
            /* TEXT */
          )
        ], 8, Ta),
        h.value ? (e.openBlock(), e.createElementBlock(
          "span",
          Aa,
          e.toDisplayString(o.$t("有未保存的修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Ia = /* @__PURE__ */ O(La, [["__scopeId", "data-v-e6af58e3"]]), Ma = { class: "ap-workbench" }, Oa = { class: "workbench-header" }, za = { class: "heading" }, Ua = { class: "eyebrow" }, Ka = { class: "subtitle" }, Fa = { class: "header-actions" }, Pa = ["disabled"], Wa = {
  key: 0,
  class: "ap-bar"
}, Ra = { class: "ss-muted" }, ja = { class: "ap-bar__rule" }, qa = {
  class: "ap-tabs",
  role: "tablist"
}, Ga = ["aria-selected", "onClick"], Ha = {
  key: 0,
  class: "ap-badge"
}, Qa = {
  key: 1,
  class: "ss-note info ap-progress"
}, Ya = {
  key: 2,
  class: "ap-body"
}, Ja = {
  key: 3,
  class: "ss-note danger"
}, Xa = {
  key: 4,
  class: "ss-note"
}, me = "totalclaw:apparel-store-tab:v1", Za = /* @__PURE__ */ e.defineComponent({
  __name: "ApparelStoreWorkbenchView",
  setup(E) {
    const m = [
      { key: "flow", icon: "ri-shirt-line", title: i.t("一键换装") },
      { key: "garments", icon: "ri-t-shirt-line", title: i.t("商品库") },
      { key: "styles", icon: "ri-landscape-line", title: i.t("造型库") },
      { key: "mobile", icon: "ri-smartphone-line", title: i.t("手机端") },
      { key: "checkin", icon: "ri-qr-scan-2-line", title: i.t("到店核销") },
      { key: "dashboard", icon: "ri-bar-chart-2-line", title: i.t("数据看板") },
      { key: "overview", icon: "ri-book-open-line", title: i.t("方案说明") },
      { key: "settings", icon: "ri-settings-3-line", title: i.t("设置") }
    ];
    function v() {
      try {
        const k = localStorage.getItem(me);
        return m.some((t) => t.key === k) ? k : "flow";
      } catch {
        return "flow";
      }
    }
    const c = C, h = e.ref(v()), p = e.ref(!1), u = e.ref(!1), N = e.ref(""), o = e.ref(null), d = e.computed(() => (c.value?.tryons || []).filter((k) => k.wantVisit && !k.visit).length);
    function f(k) {
      return k === "checkin" ? d.value ? String(d.value) : "" : k === "mobile" && c.value?.mobile.activeSessions ? String(c.value.mobile.activeSessions) : "";
    }
    function S(k) {
      h.value = k;
      try {
        localStorage.setItem(me, k);
      } catch {
      }
    }
    function D(k) {
      S("flow"), o.value?.focusCustomer(k);
    }
    async function w() {
      u.value = !0;
      try {
        await Promise.all([T(), xe()]), p.value = !0, N.value = "";
      } catch (k) {
        N.value = b.errorMessage(k);
      } finally {
        u.value = !1;
      }
    }
    let g = null, V = null, y = null;
    return e.onMounted(() => {
      w(), y = Ve((k) => {
        if (k.type === "progress") {
          Q.message = String(k.payload?.message || ""), V && clearTimeout(V), V = setTimeout(() => {
            Q.message = "";
          }, 15e3);
          return;
        }
        g || (g = setTimeout(() => {
          g = null, T().catch(() => {
          });
        }, 200));
      });
    }), e.onBeforeUnmount(() => {
      y?.(), g && clearTimeout(g), V && clearTimeout(V), Q.message = "";
    }), (k, t) => (e.openBlock(), e.createElementBlock("div", Ma, [
      e.createElementVNode("header", Oa, [
        e.createElementVNode("div", za, [
          e.createVNode(Ye),
          t[1] || (t[1] = e.createElementVNode(
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
              Ua,
              e.toDisplayString(k.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(k.$t("服装实体店智能体")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              Ka,
              e.toDisplayString(k.$t("AI 一键换装：顾客在手机上、店员在电脑上都能看到试穿效果；背景、姿势、发型自由选；试穿码到店试实物，试穿数据指导主推款。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Fa, [
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: u.value,
            onClick: w
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
              e.toDisplayString(k.$t("刷新")),
              1
              /* TEXT */
            )
          ], 8, Pa)
        ])
      ]),
      e.unref(c) ? (e.openBlock(), e.createElementBlock("section", Wa, [
        e.createElementVNode("span", null, [
          t[2] || (t[2] = e.createElementVNode(
            "i",
            { class: "ri-store-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(e.unref(c).settings.storeName),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["ss-chip", e.unref(c).imageReady ? "ok" : "warn"])
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(e.unref(c).imageReady ? "ri-check-line" : "ri-key-2-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(e.unref(c).imageReady ? k.$t("图像服务已就绪") : k.$t("图像服务未配置")),
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
            class: e.normalizeClass(["ss-chip", e.unref(c).mobile.running ? "ok" : ""]),
            onClick: t[0] || (t[0] = (l) => S("mobile"))
          },
          [
            t[3] || (t[3] = e.createElementVNode(
              "i",
              { class: "ri-smartphone-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(c).mobile.running ? k.$t("手机端运行中") : k.$t("手机端未开启")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        ),
        e.createElementVNode(
          "span",
          Ra,
          e.toDisplayString(k.$t("商品 {a} · 顾客 {b} · 试穿图 {c}", { a: e.unref(c).garments.length, b: e.unref(c).customers.filter((l) => !l.purgedAt).length, c: e.unref(c).tryons.filter((l) => l.status === "done").length })),
          1
          /* TEXT */
        ),
        e.createElementVNode("span", ja, [
          t[4] || (t[4] = e.createElementVNode(
            "i",
            { class: "ri-shield-user-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(k.$t("先授权后上传 · 照片只存本机 · {d} 天自动删除", { d: e.unref(c).settings.retentionDays })),
            1
            /* TEXT */
          )
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("nav", qa, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(m, (l) => e.createElementVNode("button", {
            key: l.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["ap-tab", { active: h.value === l.key }]),
            "aria-selected": h.value === l.key,
            onClick: (s) => S(l.key)
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
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(l.title),
              1
              /* TEXT */
            ),
            f(l.key) ? (e.openBlock(), e.createElementBlock(
              "em",
              Ha,
              e.toDisplayString(f(l.key)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, Ga)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      e.unref(Q).message ? (e.openBlock(), e.createElementBlock("p", Qa, [
        t[5] || (t[5] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(e.unref(Q).message),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      p.value ? (e.openBlock(), e.createElementBlock("div", Ya, [
        e.withDirectives(e.createVNode(
          el,
          {
            ref_key: "flowRef",
            ref: o
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [e.vShow, h.value === "flow"]
        ]),
        h.value === "garments" ? (e.openBlock(), e.createBlock(Gl, { key: 0 })) : h.value === "styles" ? (e.openBlock(), e.createBlock(co, { key: 1 })) : h.value === "mobile" ? (e.openBlock(), e.createBlock(Ao, {
          key: 2,
          onOpenCustomer: D
        })) : h.value === "checkin" ? (e.openBlock(), e.createBlock(as, { key: 3 })) : h.value === "dashboard" ? (e.openBlock(), e.createBlock(xs, { key: 4 })) : h.value === "overview" ? (e.openBlock(), e.createBlock(ga, { key: 5 })) : h.value === "settings" ? (e.openBlock(), e.createBlock(Ia, { key: 6 })) : e.createCommentVNode("v-if", !0)
      ])) : N.value ? (e.openBlock(), e.createElementBlock("p", Ja, [
        t[6] || (t[6] = e.createElementVNode(
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
      ])) : (e.openBlock(), e.createElementBlock("p", Xa, [
        t[7] || (t[7] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(k.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), xa = /* @__PURE__ */ O(Za, [["__scopeId", "data-v-df7b70ad"]]);
export {
  xa as default
};
