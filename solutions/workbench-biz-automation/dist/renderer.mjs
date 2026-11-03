const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const n = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!n) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
n.default;
const ce = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!ce) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const me = ce.default, ee = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!ee) throw new Error("宿主模块未就绪：npm:vue-router");
ee.default;
const Y = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!Y) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
Y.default;
const de = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!de) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const O = de.default, ue = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!ue) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const se = ue.default, l = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/biz-automation/shared.ts"];
if (!l) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/biz-automation/shared.ts");
l.default;
const pe = { class: "ba-mhead" }, ve = { class: "ba-mhead__main" }, ye = { class: "ba-mhead__split" }, he = { class: "ss-chip brand" }, ke = { class: "ss-chip" }, Ve = ["title"], ge = ["value", "disabled"], be = { value: "" }, Ne = ["label"], fe = ["value"], Ee = ["value"], $e = /* @__PURE__ */ e.defineComponent({
  __name: "ModuleHeader",
  props: {
    moduleKey: {},
    icon: {},
    title: {},
    ability: {},
    output: {}
  },
  setup(K) {
    const F = K, L = Y.useNotificationStore(), k = e.ref(!1), _ = e.computed(() => F.moduleKey && l.baState.value?.settings.moduleModels[F.moduleKey] || "");
    async function U(B) {
      if (F.moduleKey) {
        k.value = !0;
        try {
          const w = { ...l.baState.value?.settings.moduleModels || {} };
          B ? w[F.moduleKey] = B : delete w[F.moduleKey], await l.ba("settings.patch", { patch: { moduleModels: w } }), await l.refreshState();
        } catch (w) {
          L.error(l.errorMessage(w));
        } finally {
          k.value = !1;
        }
      }
    }
    return (B, w) => (e.openBlock(), e.createElementBlock("section", pe, [
      e.createElementVNode("div", ve, [
        e.createElementVNode("h2", null, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(K.icon)
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(K.title),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ye, [
          e.createElementVNode("span", null, [
            e.createElementVNode(
              "em",
              he,
              e.toDisplayString(B.$t("能力")),
              1
              /* TEXT */
            ),
            e.createTextVNode(
              e.toDisplayString(K.ability),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", null, [
            e.createElementVNode(
              "em",
              ke,
              e.toDisplayString(B.$t("输出物")),
              1
              /* TEXT */
            ),
            e.createTextVNode(
              e.toDisplayString(K.output),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      K.moduleKey ? (e.openBlock(), e.createElementBlock("label", {
        key: 0,
        class: "ba-mhead__model",
        title: B.$t("本模块的脚本、文案、解读都用这个模型；金额与指标由规则计算，不经过模型")
      }, [
        e.createElementVNode("small", null, [
          w[1] || (w[1] = e.createElementVNode(
            "i",
            { class: "ri-cpu-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(B.$t("本模块使用模型")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("select", {
          value: _.value,
          disabled: k.value,
          onChange: w[0] || (w[0] = (A) => U(A.target.value))
        }, [
          e.createElementVNode(
            "option",
            be,
            e.toDisplayString(B.$t("跟随系统默认（{p0}）", { p0: e.unref(l.baModels).defaultLabel || B.$t("未配置") })),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(l.modelGroups)(), (A) => (e.openBlock(), e.createElementBlock("optgroup", {
              key: A.group,
              label: A.group
            }, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(A.options, (h) => (e.openBlock(), e.createElementBlock("option", {
                  key: h.value,
                  value: h.value
                }, e.toDisplayString(h.label), 9, fe))),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 8, Ne))),
            128
            /* KEYED_FRAGMENT */
          )),
          _.value && !e.unref(l.baModels).options.some((A) => A.value === _.value) ? (e.openBlock(), e.createElementBlock("option", {
            key: 0,
            value: _.value
          }, e.toDisplayString(_.value), 9, Ee)) : e.createCommentVNode("v-if", !0)
        ], 40, ge)
      ], 8, Ve)) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Q = (K, F) => {
  const L = K.__vccOpts || K;
  for (const [k, _] of F)
    L[k] = _;
  return L;
}, oe = /* @__PURE__ */ Q($e, [["__scopeId", "data-v-4804e143"]]), _e = { class: "ss-module" }, Se = { class: "ba-projbar" }, De = { class: "ss-field" }, Be = { value: "" }, we = ["value"], Ce = { class: "ss-steps" }, Te = { class: "ba-types" }, Le = ["onClick"], Ae = {
  key: 0,
  class: "ss-note warn"
}, Me = { class: "ba-gpick" }, Ie = ["onClick"], Fe = ["src"], Ue = { class: "ss-field" }, Re = { class: "ss-actions" }, Oe = { class: "ss-muted" }, ze = ["value"], Pe = { class: "ba-check" }, Ke = { value: "female" }, je = { value: "male" }, We = { class: "ss-actions" }, Je = ["disabled"], qe = {
  key: 1,
  class: "ba-summary"
}, He = { class: "ss-chip brand" }, Ge = {
  key: 0,
  class: "ss-muted"
}, Ye = { class: "ss-muted" }, xe = { class: "ba-thumbs" }, Qe = ["src"], Xe = { class: "ss-actions" }, Ze = ["disabled"], et = ["disabled"], tt = { class: "ss-muted" }, lt = { class: "ss-actions" }, nt = ["disabled"], st = {
  key: 0,
  class: "ss-muted"
}, ot = {
  key: 0,
  class: "ba-scenes"
}, at = ["src"], it = ["onUpdate:modelValue"], rt = ["value"], ct = ["onUpdate:modelValue"], dt = ["aria-label", "onClick"], ut = {
  key: 1,
  class: "ba-copies"
}, mt = ["onUpdate:modelValue", "placeholder"], pt = ["onUpdate:modelValue"], vt = ["value", "placeholder", "onChange"], yt = {
  key: 2,
  class: "ss-actions"
}, ht = ["disabled"], kt = {
  key: 0,
  class: "ss-muted"
}, Vt = {
  key: 0,
  class: "ss-note warn"
}, gt = { class: "ss-actions" }, bt = ["disabled"], Nt = ["disabled"], ft = { class: "ss-muted" }, Et = {
  key: 1,
  class: "ba-player"
}, $t = ["src"], _t = { class: "ba-player__side" }, St = {
  key: 0,
  class: "ss-muted"
}, Dt = {
  key: 0,
  class: "ba-check"
}, Bt = { class: "ss-actions" }, wt = ["disabled"], Ct = {
  key: 0,
  class: "ss-muted"
}, Tt = { class: "ss-muted" }, Lt = { class: "ss-actions" }, At = ["disabled"], Mt = {
  key: 2,
  class: "ss-chip ok"
}, It = {
  key: 0,
  class: "ss-actions"
}, Ft = { class: "ss-muted" }, Ut = ["disabled"], Rt = {
  key: 0,
  class: "ss-chip brand"
}, Ot = {
  key: 1,
  class: "ss-muted"
}, zt = { class: "ss-actions" }, Pt = ["disabled"], Kt = { class: "ss-muted" }, jt = { class: "ss-table-wrap" }, Wt = { class: "ss-table" }, Jt = { class: "num" }, qt = { class: "num" }, Ht = { class: "num" }, Gt = { class: "num" }, Yt = ["onUpdate:modelValue"], xt = ["onClick"], Qt = {
  key: 0,
  class: "ss-muted"
}, Xt = { class: "ss-subhead" }, Zt = { class: "ss-table-wrap" }, el = { class: "ss-table" }, tl = { class: "num" }, ll = { class: "num" }, nl = { class: "num" }, sl = { class: "num" }, ol = { class: "num" }, al = { class: "num" }, il = { class: "num" }, rl = { class: "num" }, cl = { class: "num" }, dl = { class: "num" }, ul = 120, ml = /* @__PURE__ */ e.defineComponent({
  __name: "VideoTab",
  props: {
    focus: {}
  },
  setup(K) {
    const F = K, L = Y.useNotificationStore(), k = ee.useRouter(), _ = l.baState;
    l.ensureBaProgressTracking();
    const U = ["new_arrival", "multi_look", "store_tour", "promotion", "styling_tips"], B = ["douyin", "kuaishou", "xiaohongshu", "wxchannels"], w = {
      new_arrival: n.t("商品图 + AI 模特图 + 卖点，15～30 秒"),
      multi_look: n.t("同一件衣服 × 多组试穿造型"),
      store_tour: n.t("邀请进店，适合带定位发布"),
      promotion: n.t("活动信息 + 主推款"),
      styling_tips: n.t("按场合给穿搭建议")
    }, A = e.computed(() => l.baGarments.value), h = e.computed(() => _.value?.videos || []), b = e.ref(""), o = e.computed(() => h.value.find((t) => t.id === b.value) || null);
    e.watch(() => F.focus, (t) => {
      t?.id && (b.value = t.id);
    }, { immediate: !0 });
    const d = e.reactive({ type: "new_arrival", garmentIds: [], brief: "", platforms: ["douyin", "xiaohongshu"], narration: !0, voiceGender: "female" }), D = e.reactive({ scenes: [], copies: {} });
    e.watch(o, (t) => {
      D.scenes = t ? JSON.parse(JSON.stringify(t.scenes)) : [], D.copies = t ? JSON.parse(JSON.stringify(t.copies)) : {};
    }, { immediate: !0 });
    const y = e.computed(() => !!o.value && (JSON.stringify(D.scenes) !== JSON.stringify(o.value.scenes) || JSON.stringify(D.copies) !== JSON.stringify(o.value.copies))), v = e.ref(""), N = e.ref({}), E = e.ref(!1), S = [
      { key: "v-pick", title: n.t("选类型与商品"), hint: n.t("新品上新 / 一衣多搭 / 门店探店 / 促销 / 穿搭教程") },
      { key: "v-material", title: n.t("素材准备"), hint: n.t("自动带入商品图与试穿图，可补充门店实拍") },
      { key: "v-script", title: n.t("脚本与文案"), hint: n.t("分镜口播 + 各平台标题、正文、话题，逐段可改") },
      { key: "v-render", title: n.t("成片"), hint: n.t("配音、字幕、推拉镜头、配乐，9:16") },
      { key: "v-approve", title: n.t("审核"), hint: n.t("极限词、来路不明的价格会提示") },
      { key: "v-publish", title: n.t("发布"), hint: n.t("立即或定时发到抖音 / 快手 / 小红书 / 视频号，平台回执逐条显示") },
      { key: "v-review", title: n.t("复盘"), hint: n.t("回收播放、点赞、评论数，按款式看引流效果") }
    ];
    function T(t, a, c, I = !1, q = "", ae) {
      return v.value === t || I ? { state: "running", ...ae || {} } : N.value[t] || q ? { state: "failed", error: N.value[t] || q } : a ? { state: "done", summary: c } : { state: "todo" };
    }
    const C = e.computed(() => {
      const t = o.value;
      return {
        "v-pick": T("v-pick", !!t, t?.name),
        "v-material": T("v-material", !!t && t.materials.length > 0, t ? n.t("{n} 张素材", { n: t.materials.length }) : ""),
        "v-script": T("v-script", !!t && (t.scenes.length > 0 || !!t.video), t ? n.t("{n} 个镜头", { n: t.scenes.length }) : ""),
        // 成片：看门狗要的真实开始时刻 / 最近进度 / 类型 / 预计，一并写进 runtime（换 tab 回来计时不归零）
        "v-render": T(
          "v-render",
          !!t?.video,
          t?.durationSec ? n.t("{s} 秒", { s: t.durationSec }) : "",
          t?.status === "rendering",
          t?.status === "failed" && t.error || "",
          t ? { kind: "video", estimateSec: ul, startedAt: l.renderStartedAt(t), progressAt: l.baProgressAt.video } : void 0
        ),
        "v-approve": T("v-approve", !!t && ["approved", "publishing", "published"].includes(t.status)),
        "v-publish": T("v-publish", t?.status === "published", t?.publishRunNote),
        "v-review": T("v-review", !!t?.stats && Object.keys(t.stats).length > 0)
      };
    }), M = e.computed(() => S.find((t) => C.value[t.key].state !== "done")?.key || "v-review"), R = ["plays", "likes", "comments", "shares"], j = e.reactive({});
    e.watch(o, (t) => {
      for (const a of B) {
        const c = t?.stats?.[a];
        j[a] = { plays: c?.plays || 0, likes: c?.likes || 0, comments: c?.comments || 0, shares: c?.shares || 0 };
      }
    }, { immediate: !0 });
    const H = e.ref([]);
    async function P() {
      H.value = await l.ba("video.review").catch(() => []);
    }
    P();
    const W = e.ref("");
    e.watch(() => d.type, (t) => {
      if (t !== "new_arrival" || d.garmentIds.length) return;
      const a = A.value.filter((c) => Date.now() - Date.parse(c.createdAt) < 7 * 864e5).slice(0, 5).map((c) => c.id);
      d.garmentIds.push(...a);
    }, { immediate: !0 });
    function u(t) {
      return { draft: n.t("草稿"), scripted: n.t("已写脚本"), rendering: n.t("成片中"), rendered: n.t("已成片"), approved: n.t("已审核"), publishing: n.t("发布中"), published: n.t("已发布"), failed: n.t("失败") }[t];
    }
    function p(t) {
      const a = d.garmentIds.indexOf(t);
      a >= 0 ? d.garmentIds.splice(a, 1) : d.garmentIds.length < 5 && d.garmentIds.push(t);
    }
    async function i(t, a) {
      v.value = t, N.value = { ...N.value, [t]: "" };
      try {
        return await a(), await l.refreshState(), !0;
      } catch (c) {
        return N.value = { ...N.value, [t]: l.errorMessage(c) }, l.scrollToStep(t), !1;
      } finally {
        v.value = "";
      }
    }
    async function s() {
      await i("v-pick", async () => {
        const t = await l.ba("video.create", { ...d });
        b.value = t.id, await l.refreshState(), await l.ba("video.script", { id: t.id });
      });
    }
    async function f() {
      const t = await l.pickFiles("image", !0);
      t.length && o.value && await i("v-material", () => l.ba("video.addMaterials", { id: o.value.id, paths: t }));
    }
    async function $() {
      o.value && await i("v-script", () => l.ba("video.script", { id: o.value.id }));
    }
    async function z() {
      o.value && await i("v-script", () => l.ba("video.update", { id: o.value.id, patch: { scenes: D.scenes, copies: D.copies } }));
    }
    async function x() {
      const t = o.value;
      !t || v.value || t.status === "rendering" || (l.noteRenderStarted(t.id), await i("v-render", () => l.ba("video.render", { id: t.id })));
    }
    const G = e.ref(!1);
    async function X() {
      const t = o.value;
      if (!(!t || G.value)) {
        G.value = !0;
        try {
          await l.ba("video.cancel", { id: t.id }).catch(() => {
          });
          const a = Date.now() + 2e4;
          for (; Date.now() < a; ) {
            if (await l.refreshState().catch(() => {
            }), v.value !== "v-render" && o.value?.status !== "rendering") return;
            await new Promise((c) => setTimeout(c, 300));
          }
          L.warn(n.t("上次成片的任务还没退出，请稍后再试或重启应用"));
        } finally {
          G.value = !1;
        }
      }
    }
    async function te() {
      o.value && await i("v-approve", () => l.ba("video.approve", { id: o.value.id, force: E.value }));
    }
    async function le() {
      if (!o.value) return;
      await i("v-publish", async () => {
        const a = await l.ba("video.publishInput", { id: o.value.id });
        await l.startPublishWorkflow(a, o.value.id);
      }) && await k.push({ path: "/workflow" });
    }
    async function Z(t) {
      o.value && await i("v-publish", () => l.ba("video.markPublished", { id: o.value.id, ok: t, note: t ? n.t("已在发布工作流完成") : n.t("发布未完成") }));
    }
    async function ne() {
      if (!o.value) return;
      const t = o.value.materials.length;
      await i("v-material", () => l.ba("video.fillModels", { id: o.value.id })) && L.info((o.value?.materials.length || 0) > t ? n.t("已补 {n} 张模特图", { n: (o.value?.materials.length || 0) - t }) : n.t("选中的款都已有试穿图，不用补"));
    }
    async function m(t) {
      o.value && await i("v-publish", () => l.ba("video.schedule", { id: o.value.id, at: t ? new Date(t).toISOString() : null }));
    }
    async function g() {
      if (!o.value) return;
      await i("v-review", async () => {
        const a = await l.ba("video.statsInstruction", { id: o.value.id });
        await l.handToDigitalEmployee(n.t("回读视频数据：{p0}", { p0: o.value.name }), a);
      }) && L.success(n.t("已交给数字员工，读回后请把数字填到表里"));
    }
    async function V(t) {
      o.value && (await i("v-review", () => l.ba("video.recordStats", { id: o.value.id, platform: t, stats: { ...j[t], source: "manual" } })), await P());
    }
    async function J() {
      if (!(!o.value || !window.confirm(n.t("删除视频项目「{p0}」？成片文件保留在输出目录。", { p0: o.value.name }))))
        try {
          await l.ba("video.remove", { id: o.value.id }), b.value = "", await l.refreshState();
        } catch (t) {
          L.error(l.errorMessage(t));
        }
    }
    function r(t) {
      l.scrollToStep(t);
    }
    return (t, a) => (e.openBlock(), e.createElementBlock("div", _e, [
      e.createVNode(oe, {
        "module-key": "video",
        icon: "ri-movie-2-line",
        title: t.$t("短视频生成并发布自媒体"),
        ability: t.$t("商品图、试穿图、门店实拍 → 分镜脚本与各平台文案 → 配音字幕配乐成片 → 审核 → 发到抖音、快手、小红书、视频号"),
        output: t.$t("9:16 成片、各平台标题文案话题、平台发布回执；价格与折扣只许来自你填的活动信息")
      }, null, 8, ["title", "ability", "output"]),
      e.createElementVNode("div", Se, [
        e.createElementVNode("label", De, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(t.$t("视频项目")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": a[0] || (a[0] = (c) => b.value = c)
            },
            [
              e.createElementVNode(
                "option",
                Be,
                e.toDisplayString(t.$t("— 新建视频 —")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(h.value, (c) => (e.openBlock(), e.createElementBlock("option", {
                  key: c.id,
                  value: c.id
                }, e.toDisplayString(c.name) + " · " + e.toDisplayString(u(c.status)), 9, we))),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, b.value]
          ])
        ]),
        o.value ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn sm ghost danger",
          onClick: J
        }, [
          a[12] || (a[12] = e.createElementVNode(
            "i",
            { class: "ri-delete-bin-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(t.$t("删除项目")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createVNode(se, {
        title: t.$t("短视频发布"),
        metas: S,
        runtime: C.value,
        "current-key": M.value,
        onJump: r
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", Ce, [
        e.createVNode(O, {
          "step-key": "v-pick",
          index: 0,
          title: S[0].title,
          hint: S[0].hint,
          runtime: C.value["v-pick"],
          "is-current": M.value === "v-pick"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock("div", qe, [
              e.createElementVNode(
                "span",
                He,
                e.toDisplayString(e.unref(l.videoTypeLabel)(o.value.type)),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(o.value.garmentIds.map(e.unref(l.garmentName)).join("、") || t.$t("数字人成片")),
                1
                /* TEXT */
              ),
              o.value.brief ? (e.openBlock(), e.createElementBlock(
                "span",
                Ge,
                e.toDisplayString(o.value.brief),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0),
              e.createElementVNode(
                "span",
                Ye,
                e.toDisplayString(o.value.platforms.map(e.unref(l.platformLabel)).join(" / ")),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Te, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(U, (c) => e.createElementVNode("button", {
                      key: c,
                      type: "button",
                      class: e.normalizeClass(["ba-type", { on: d.type === c }]),
                      onClick: (I) => d.type = c
                    }, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(e.unref(l.videoTypeLabel)(c)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(w[c]),
                        1
                        /* TEXT */
                      )
                    ], 10, Le)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                A.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Ae, [
                  a[13] || (a[13] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("商品库是空的：先到「服装AI试衣 → 商品库」导入服装图")),
                    1
                    /* TEXT */
                  )
                ])),
                e.createElementVNode("div", Me, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(A.value, (c) => (e.openBlock(), e.createElementBlock("button", {
                      key: c.id,
                      type: "button",
                      class: e.normalizeClass({ on: d.garmentIds.includes(c.id) }),
                      onClick: (I) => p(c.id)
                    }, [
                      e.createElementVNode("img", {
                        src: e.unref(l.fileUrl)(c.image),
                        alt: "",
                        loading: "lazy"
                      }, null, 8, Fe),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(c.name),
                        1
                        /* TEXT */
                      )
                    ], 10, Ie))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("label", Ue, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.$t("活动信息 / 主题（促销价、活动时间等，脚本里的价格与折扣只许来自这里和商品价格）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": a[1] || (a[1] = (c) => d.brief = c),
                      rows: "2"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, d.brief]
                  ])
                ]),
                e.createElementVNode("div", Re, [
                  e.createElementVNode(
                    "span",
                    Oe,
                    e.toDisplayString(t.$t("发布平台")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(B, (c) => e.createElementVNode("label", {
                      key: c,
                      class: "ba-check"
                    }, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": a[2] || (a[2] = (I) => d.platforms = I),
                        type: "checkbox",
                        value: c
                      }, null, 8, ze), [
                        [e.vModelCheckbox, d.platforms]
                      ]),
                      e.createTextVNode(
                        e.toDisplayString(e.unref(l.platformLabel)(c)),
                        1
                        /* TEXT */
                      )
                    ])),
                    64
                    /* STABLE_FRAGMENT */
                  )),
                  e.createElementVNode("label", Pe, [
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": a[3] || (a[3] = (c) => d.narration = c),
                        type: "checkbox"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelCheckbox, d.narration]
                    ]),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("AI 配音")),
                      1
                      /* TEXT */
                    )
                  ]),
                  d.narration ? e.withDirectives((e.openBlock(), e.createElementBlock(
                    "select",
                    {
                      key: 0,
                      "onUpdate:modelValue": a[4] || (a[4] = (c) => d.voiceGender = c),
                      class: "ba-mini"
                    },
                    [
                      e.createElementVNode(
                        "option",
                        Ke,
                        e.toDisplayString(t.$t("女声")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        je,
                        e.toDisplayString(t.$t("男声")),
                        1
                        /* TEXT */
                      )
                    ],
                    512
                    /* NEED_PATCH */
                  )), [
                    [e.vModelSelect, d.voiceGender]
                  ]) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", We, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!v.value || !d.garmentIds.length || !d.platforms.length,
                    onClick: s
                  }, [
                    a[14] || (a[14] = e.createElementVNode(
                      "i",
                      { class: "ri-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("创建视频项目")),
                      1
                      /* TEXT */
                    )
                  ], 8, Je)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "v-material",
          index: 1,
          title: S[1].title,
          hint: S[1].hint,
          runtime: C.value["v-material"],
          "is-current": M.value === "v-material"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", xe, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.materials, (c, I) => (e.openBlock(), e.createElementBlock("figure", { key: c }, [
                      e.createElementVNode("img", {
                        src: e.unref(l.fileUrl)(c),
                        alt: "",
                        loading: "lazy"
                      }, null, 8, Qe),
                      e.createElementVNode(
                        "figcaption",
                        null,
                        "#" + e.toDisplayString(I),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", Xe, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!v.value || !o.value.garmentIds.length,
                    onClick: f
                  }, [
                    a[15] || (a[15] = e.createElementVNode(
                      "i",
                      { class: "ri-image-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("补充门店实拍 / 其它图片")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ze),
                  o.value.garmentIds.length ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!v.value,
                    onClick: ne
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(v.value === "v-material" ? "ri-loader-4-line spin" : "ri-user-star-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("为没有试穿图的款补模特图")),
                      1
                      /* TEXT */
                    )
                  ], 8, et)) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode(
                    "span",
                    tt,
                    e.toDisplayString(t.$t("商品图与该款已生成的试穿图已自动带入")),
                    1
                    /* TEXT */
                  )
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "v-script",
          index: 2,
          title: S[2].title,
          hint: S[2].hint,
          runtime: C.value["v-script"],
          "is-current": M.value === "v-script"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", lt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!v.value || !o.value.garmentIds.length,
                    onClick: $
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(v.value === "v-script" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(o.value.scenes.length ? t.$t("重写脚本") : t.$t("写分镜脚本与文案")),
                      1
                      /* TEXT */
                    )
                  ], 8, nt),
                  o.value.model ? (e.openBlock(), e.createElementBlock(
                    "span",
                    st,
                    e.toDisplayString(t.$t("由 {p0} 撰写", { p0: e.unref(l.modelLabel)(o.value.model) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.value.warnings, (c) => (e.openBlock(), e.createElementBlock("p", {
                    key: c,
                    class: "ss-note warn"
                  }, [
                    a[16] || (a[16] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(c),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                D.scenes.length ? (e.openBlock(), e.createElementBlock("div", ot, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(D.scenes, (c, I) => (e.openBlock(), e.createElementBlock("div", {
                      key: I,
                      class: "ba-scene"
                    }, [
                      e.createElementVNode("img", {
                        src: e.unref(l.fileUrl)(c.image),
                        alt: ""
                      }, null, 8, at),
                      e.createElementVNode("div", null, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("镜头 {n}", { n: I + 1 })),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode("select", {
                          "onUpdate:modelValue": (q) => c.image = q,
                          class: "ba-mini"
                        }, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(o.value.materials, (q, ae) => (e.openBlock(), e.createElementBlock("option", {
                              key: q,
                              value: q
                            }, e.toDisplayString(t.$t("图片 #{n}", { n: ae })), 9, rt))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 8, it), [
                          [e.vModelSelect, c.image]
                        ]),
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (q) => c.line = q,
                          type: "text",
                          maxlength: "40"
                        }, null, 8, ct), [
                          [e.vModelText, c.line]
                        ])
                      ]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        "aria-label": t.$t("删除"),
                        onClick: (q) => D.scenes.splice(I, 1)
                      }, [...a[17] || (a[17] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-close-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, dt)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0),
                Object.keys(D.copies).length ? (e.openBlock(), e.createElementBlock("div", ut, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.platforms, (c) => (e.openBlock(), e.createElementBlock("div", {
                      key: c,
                      class: "ba-copy"
                    }, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(e.unref(l.platformLabel)(c)),
                        1
                        /* TEXT */
                      ),
                      D.copies[c] ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (I) => D.copies[c].title = I,
                            type: "text",
                            placeholder: t.$t("标题")
                          }, null, 8, mt), [
                            [e.vModelText, D.copies[c].title]
                          ]),
                          e.withDirectives(e.createElementVNode("textarea", {
                            "onUpdate:modelValue": (I) => D.copies[c].caption = I,
                            rows: "3"
                          }, null, 8, pt), [
                            [e.vModelText, D.copies[c].caption]
                          ]),
                          e.createElementVNode("input", {
                            value: D.copies[c].topics.join(" "),
                            type: "text",
                            placeholder: t.$t("话题，空格分隔"),
                            onChange: (I) => D.copies[c].topics = I.target.value.split(/\s+/).map((q) => q.replace(/^#/, "")).filter(Boolean)
                          }, null, 40, vt)
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0),
                D.scenes.length ? (e.openBlock(), e.createElementBlock("div", yt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!v.value || !y.value,
                    onClick: z
                  }, [
                    a[18] || (a[18] = e.createElementVNode(
                      "i",
                      { class: "ri-save-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("保存修改")),
                      1
                      /* TEXT */
                    )
                  ], 8, ht),
                  y.value ? (e.openBlock(), e.createElementBlock(
                    "span",
                    kt,
                    e.toDisplayString(t.$t("有未保存的修改（改了镜头要重新成片）")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 成片：失败 / 可能已超时的红黄卡与「重新生成」由步骤卡自带（retry = 重新成片，cancel = 先停掉旧任务） "),
        e.createVNode(O, {
          "step-key": "v-render",
          index: 3,
          title: S[3].title,
          hint: S[3].hint,
          runtime: C.value["v-render"],
          "is-current": M.value === "v-render",
          retry: x,
          cancel: X,
          "retry-label": t.$t("重新成片")
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.unref(_)?.ready.ffmpeg ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Vt, [
                  a[19] || (a[19] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("找不到 ffmpeg，无法成片")),
                    1
                    /* TEXT */
                  )
                ])),
                e.createElementVNode("div", gt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!v.value || !o.value.scenes.length || o.value.status === "rendering" || y.value || !o.value.garmentIds.length,
                    onClick: x
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(o.value.status === "rendering" ? "ri-loader-4-line spin" : "ri-film-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(o.value.video ? t.$t("重新成片") : t.$t("开始成片")),
                      1
                      /* TEXT */
                    )
                  ], 8, bt),
                  o.value.status === "rendering" ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn sm ghost",
                    disabled: G.value,
                    onClick: X
                  }, e.toDisplayString(t.$t("取消")), 9, Nt)) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode(
                    "span",
                    ft,
                    e.toDisplayString(t.$t("配音优先高保真，不可用时用标准音色；字幕与镜头逐句对齐")),
                    1
                    /* TEXT */
                  )
                ]),
                o.value.video ? (e.openBlock(), e.createElementBlock("div", Et, [
                  e.createElementVNode("video", {
                    src: e.unref(l.fileUrl)(o.value.video),
                    controls: "",
                    playsinline: ""
                  }, null, 8, $t),
                  e.createElementVNode("div", _t, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("时长 {s} 秒", { s: o.value.durationSec || "—" })),
                      1
                      /* TEXT */
                    ),
                    o.value.voiceQuality ? (e.openBlock(), e.createElementBlock(
                      "span",
                      St,
                      e.toDisplayString(o.value.voiceQuality === "hd" ? t.$t("高保真配音") : t.$t("标准音质配音（备用）")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "button",
                      {
                        type: "button",
                        class: "ss-link",
                        onClick: a[5] || (a[5] = (c) => e.unref(l.openPath)(o.value.video, !0))
                      },
                      e.toDisplayString(t.$t("所在文件夹")),
                      1
                      /* TEXT */
                    )
                  ])
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry-label"]),
        e.createVNode(O, {
          "step-key": "v-approve",
          index: 4,
          title: S[4].title,
          hint: S[4].hint,
          runtime: C.value["v-approve"],
          "is-current": M.value === "v-approve"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                o.value.warnings.length ? (e.openBlock(), e.createElementBlock("label", Dt, [
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": a[6] || (a[6] = (c) => E.value = c),
                      type: "checkbox"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelCheckbox, E.value]
                  ]),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("我已看过上面的提示，仍然通过")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", Bt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!v.value || !o.value.video || o.value.status === "approved" || o.value.status === "published",
                    onClick: te
                  }, [
                    a[20] || (a[20] = e.createElementVNode(
                      "i",
                      { class: "ri-shield-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("审核通过")),
                      1
                      /* TEXT */
                    )
                  ], 8, wt),
                  o.value.approvedAt ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Ct,
                    e.toDisplayString(t.$t("审核于 {p0}", { p0: e.unref(l.fmtDateTime)(o.value.approvedAt) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "v-publish",
          index: 5,
          title: S[5].title,
          hint: S[5].hint,
          runtime: C.value["v-publish"],
          "is-current": M.value === "v-publish"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "p",
                  Tt,
                  e.toDisplayString(t.$t("用你在内置浏览器里登录的平台账号发布：先确认登录，再逐个平台上传、填文案、提交，平台回执逐条显示。建议每个账号每天不超过 3 条。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", Lt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!v.value || o.value.status !== "approved" && o.value.status !== "published" && o.value.status !== "publishing",
                    onClick: le
                  }, [
                    a[21] || (a[21] = e.createElementVNode(
                      "i",
                      { class: "ri-send-plane-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("发布到 {p0}", { p0: o.value.platforms.map(e.unref(l.platformLabel)).join("、") })),
                      1
                      /* TEXT */
                    )
                  ], 8, At),
                  o.value.status === "publishing" ? (e.openBlock(), e.createElementBlock(
                    "button",
                    {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: a[7] || (a[7] = (c) => Z(!0))
                    },
                    e.toDisplayString(t.$t("已在工作流里发完")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  o.value.status === "publishing" ? (e.openBlock(), e.createElementBlock(
                    "button",
                    {
                      key: 1,
                      type: "button",
                      class: "ss-link",
                      onClick: a[8] || (a[8] = (c) => Z(!1))
                    },
                    e.toDisplayString(t.$t("没发成功，退回")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  o.value.publishedAt ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Mt,
                    e.toDisplayString(t.$t("已发布 {p0}", { p0: e.unref(l.fmtDateTime)(o.value.publishedAt) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                o.value.status === "approved" ? (e.openBlock(), e.createElementBlock("div", It, [
                  e.createElementVNode(
                    "span",
                    Ft,
                    e.toDisplayString(t.$t("或定时发布")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": a[9] || (a[9] = (c) => W.value = c),
                      type: "datetime-local",
                      class: "ba-dt"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, W.value]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!v.value || !W.value,
                    onClick: a[10] || (a[10] = (c) => m(W.value))
                  }, [
                    a[22] || (a[22] = e.createElementVNode(
                      "i",
                      { class: "ri-timer-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("设定时")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ut),
                  o.value.publishAt ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Rt,
                    e.toDisplayString(o.value.publishDue ? t.$t("已到发布时间") : t.$t("定时 {p0}", { p0: e.unref(l.fmtDateTime)(o.value.publishAt) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  o.value.publishAt ? (e.openBlock(), e.createElementBlock(
                    "button",
                    {
                      key: 1,
                      type: "button",
                      class: "ss-link",
                      onClick: a[11] || (a[11] = (c) => m(null))
                    },
                    e.toDisplayString(t.$t("取消定时")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0),
                o.value.publishAt ? (e.openBlock(), e.createElementBlock(
                  "p",
                  Ot,
                  e.toDisplayString(t.$t("到点会弹系统通知；经营自动化智能体打开着时自动发起发布（要用内置浏览器里各平台的登录态）")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "v-review",
          index: 6,
          title: S[6].title,
          hint: S[6].hint,
          runtime: C.value["v-review"],
          "is-current": M.value === "v-review"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", zt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!v.value || o.value.status !== "published",
                    onClick: g
                  }, [
                    a[23] || (a[23] = e.createElementVNode(
                      "i",
                      { class: "ri-robot-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("交给数字员工回读各平台数据")),
                      1
                      /* TEXT */
                    )
                  ], 8, Pt),
                  e.createElementVNode(
                    "span",
                    Kt,
                    e.toDisplayString(t.$t("数字员工只读取创作者后台的播放、点赞、评论、分享；读回后填到下表")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", jt, [
                  e.createElementVNode("table", Wt, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("平台")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Jt,
                          e.toDisplayString(t.$t("播放")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          qt,
                          e.toDisplayString(t.$t("点赞")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Ht,
                          e.toDisplayString(t.$t("评论")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Gt,
                          e.toDisplayString(t.$t("分享")),
                          1
                          /* TEXT */
                        ),
                        a[24] || (a[24] = e.createElementVNode(
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
                        e.renderList(o.value.platforms, (c) => (e.openBlock(), e.createElementBlock("tr", { key: c }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(e.unref(l.platformLabel)(c)),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(R, (I) => e.createElementVNode("td", { key: I }, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": (q) => j[c][I] = q,
                                type: "number",
                                min: "0",
                                class: "ba-stat"
                              }, null, 8, Yt), [
                                [
                                  e.vModelText,
                                  j[c][I],
                                  void 0,
                                  { number: !0 }
                                ]
                              ])
                            ])),
                            64
                            /* STABLE_FRAGMENT */
                          )),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (I) => V(c)
                            }, e.toDisplayString(t.$t("保存")), 9, xt),
                            o.value.stats?.[c] ? (e.openBlock(), e.createElementBlock(
                              "small",
                              Qt,
                              " · " + e.toDisplayString(e.unref(l.fmtDateTime)(o.value.stats[c].at)),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ]),
                H.value.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode(
                      "span",
                      Xt,
                      e.toDisplayString(t.$t("按款式看引流效果（全部视频）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Zt, [
                      e.createElementVNode("table", el, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(t.$t("款式")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              tl,
                              e.toDisplayString(t.$t("视频数")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              ll,
                              e.toDisplayString(t.$t("播放")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              nl,
                              e.toDisplayString(t.$t("点赞")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              sl,
                              e.toDisplayString(t.$t("评论")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              ol,
                              e.toDisplayString(t.$t("分享")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(H.value, (c) => (e.openBlock(), e.createElementBlock("tr", {
                              key: c.garmentId
                            }, [
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(e.unref(l.garmentName)(c.garmentId)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                al,
                                e.toDisplayString(c.videos),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                il,
                                e.toDisplayString(c.plays),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                rl,
                                e.toDisplayString(c.likes),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                cl,
                                e.toDisplayString(c.comments),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                dl,
                                e.toDisplayString(c.shares),
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
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"])
      ])
    ]));
  }
}), pl = /* @__PURE__ */ Q(ml, [["__scopeId", "data-v-ff2d8821"]]), vl = { class: "ss-module" }, yl = { class: "ba-projbar" }, hl = { class: "ss-field" }, kl = { value: "" }, Vl = ["value"], gl = { class: "ss-steps" }, bl = { class: "ba-types" }, Nl = ["onClick"], fl = { class: "ss-grid" }, El = { class: "ss-field" }, $l = { class: "ss-field" }, _l = { class: "ba-facts" }, Sl = {
  key: 0,
  class: "ss-muted"
}, Dl = { class: "ss-actions" }, Bl = ["disabled"], wl = {
  key: 1,
  class: "ss-muted"
}, Cl = { class: "ss-actions" }, Tl = ["disabled"], Ll = { class: "ss-muted" }, Al = { class: "ss-grid" }, Ml = { class: "ss-field" }, Il = { class: "ss-field" }, Fl = { class: "ss-field" }, Ul = { value: "9:16" }, Rl = { value: "16:9" }, Ol = { class: "ss-field" }, zl = { class: "ss-actions" }, Pl = ["disabled"], Kl = { class: "ss-muted" }, jl = { class: "ss-actions" }, Wl = ["disabled"], Jl = { class: "ss-muted" }, ql = { class: "ss-muted" }, Hl = ["src"], Gl = { class: "ss-actions" }, Yl = ["value"], xl = ["disabled"], Ql = { class: "ss-muted" }, Xl = 240, Zl = /* @__PURE__ */ e.defineComponent({
  __name: "AvatarTab",
  emits: ["goto"],
  setup(K, { emit: F }) {
    const L = F, k = Y.useNotificationStore();
    l.ensureBaProgressTracking();
    const _ = ["company_intro", "brand_story", "store_opening", "service_intro", "recruiting", "holiday"], U = ["douyin", "kuaishou", "xiaohongshu", "wxchannels"], B = (s) => ({ company_intro: n.t("企业介绍"), brand_story: n.t("品牌故事"), store_opening: n.t("新店开业"), service_intro: n.t("门店服务介绍"), recruiting: n.t("招聘"), holiday: n.t("节日祝福") })[s], w = e.computed(() => l.baState.value?.avatars || []), A = e.ref(""), h = e.computed(() => w.value.find((s) => s.id === A.value) || null), b = e.reactive({ topic: "company_intro", seconds: 45, brief: "" }), o = e.ref([]), d = e.ref(null), D = e.ref(""), y = e.reactive({ avatarId: "", voiceId: "", aspectRatio: "9:16", likenessConsent: "" }), v = e.ref(["douyin", "wxchannels"]), N = e.ref(""), E = e.ref({});
    e.watch(h, (s) => {
      D.value = s?.script || "", Object.assign(y, { avatarId: s?.avatarId || "", voiceId: s?.voiceId || "", aspectRatio: s?.aspectRatio || "9:16", likenessConsent: s?.likenessConsent || "" });
    }, { immediate: !0 }), e.onMounted(async () => {
      o.value = await l.ba("avatar.facts").catch(() => []), d.value = await l.ba("avatar.status").catch(() => ({ ready: !1 }));
    });
    const S = [
      { key: "a-topic", title: n.t("选主题"), hint: n.t("企业介绍 / 品牌故事 / 新店开业 / 服务介绍 / 招聘 / 节日祝福") },
      { key: "a-script", title: n.t("讲稿"), hint: n.t("事实只取知识库，缺的写【待补充】") },
      { key: "a-avatar", title: n.t("选数字人"), hint: n.t("形象、音色、画幅；真人分身需书面授权") },
      { key: "a-render", title: n.t("口播成片"), hint: n.t("带字幕与 AI 生成标识") },
      { key: "a-publish", title: n.t("进入发布"), hint: n.t("交给「短视频发布」审核后发出") }
    ];
    function T(s, f, $, z = !1, x = "", G) {
      return N.value === s || z ? { state: "running", ...G || {} } : E.value[s] || x ? { state: "failed", error: E.value[s] || x } : f ? { state: "done", summary: $ } : { state: "todo" };
    }
    const C = e.computed(() => {
      const s = h.value;
      return {
        "a-topic": T("a-topic", !!s, s ? B(s.topic) : ""),
        "a-script": T("a-script", !!s && !/【待补充/.test(s.script), s ? n.t("{n} 字", { n: s.script.length }) : ""),
        "a-avatar": T("a-avatar", !!s && (!!s.avatarId || !!s.video || s.status === "rendering")),
        "a-render": T(
          "a-render",
          !!s?.video,
          "",
          s?.status === "rendering",
          s?.status === "failed" && s.error || "",
          s ? { kind: "video", estimateSec: Xl, startedAt: l.renderStartedAt(s), progressAt: l.baProgressAt.avatar } : void 0
        ),
        "a-publish": T("a-publish", !!s && (l.baState.value?.videos || []).some((f) => f.video === s.video && !!s.video))
      };
    }), M = e.computed(() => S.find((s) => C.value[s.key].state !== "done")?.key || "a-publish");
    async function R(s, f) {
      N.value = s, E.value = { ...E.value, [s]: "" };
      try {
        return await f(), await l.refreshState(), !0;
      } catch ($) {
        return E.value = { ...E.value, [s]: l.errorMessage($) }, l.scrollToStep(s), !1;
      } finally {
        N.value = "";
      }
    }
    async function j() {
      await R("a-topic", async () => {
        const s = await l.ba("avatar.create", { ...b });
        A.value = s.id;
      });
    }
    async function H() {
      h.value && await R("a-script", () => l.ba("avatar.update", { id: h.value.id, patch: { script: D.value } }));
    }
    async function P() {
      h.value && await R("a-avatar", () => l.ba("avatar.update", { id: h.value.id, patch: { ...y } }));
    }
    async function W() {
      const s = h.value;
      !s || N.value || s.status === "rendering" || (l.noteRenderStarted(s.id), await R("a-render", () => l.ba("avatar.render", { id: s.id })));
    }
    async function u() {
      if (!h.value) return;
      let s = "";
      await R("a-publish", async () => {
        s = (await l.ba("avatar.toVideo", { id: h.value.id, platforms: v.value })).id;
      }) && L("goto", "video", { id: s });
    }
    async function p() {
      if (!(!h.value || !window.confirm(n.t("删除数字人项目「{p0}」？", { p0: h.value.name }))))
        try {
          await l.ba("avatar.remove", { id: h.value.id }), A.value = "", await l.refreshState();
        } catch (s) {
          k.error(l.errorMessage(s));
        }
    }
    function i(s) {
      l.scrollToStep(s);
    }
    return (s, f) => (e.openBlock(), e.createElementBlock("div", vl, [
      e.createVNode(oe, {
        "module-key": "avatar",
        icon: "ri-user-voice-line",
        title: s.$t("数字人出镜介绍企业"),
        ability: s.$t("从知识库取公司名称、地址、主营、特色服务写讲稿（没有的写【待补充】）→ 数字人口播成片带字幕 → 进入短视频发布"),
        output: s.$t("30～120 秒口播成片，画面固定标注 AI 生成；讲稿自检广告法极限词")
      }, null, 8, ["title", "ability", "output"]),
      e.createElementVNode("div", yl, [
        e.createElementVNode("label", hl, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(s.$t("数字人项目")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": f[0] || (f[0] = ($) => A.value = $)
            },
            [
              e.createElementVNode(
                "option",
                kl,
                e.toDisplayString(s.$t("— 新建 —")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(w.value, ($) => (e.openBlock(), e.createElementBlock("option", {
                  key: $.id,
                  value: $.id
                }, e.toDisplayString($.name), 9, Vl))),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, A.value]
          ])
        ]),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["ss-chip", d.value?.ready ? "ok" : "warn"])
          },
          e.toDisplayString(d.value?.ready ? s.$t("数字人服务已就绪") : s.$t("数字人服务未配置")),
          3
          /* TEXT, CLASS */
        ),
        h.value ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn sm ghost danger",
          onClick: p
        }, [
          f[9] || (f[9] = e.createElementVNode(
            "i",
            { class: "ri-delete-bin-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(s.$t("删除项目")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createVNode(se, {
        title: s.$t("数字人介绍"),
        metas: S,
        runtime: C.value,
        "current-key": M.value,
        onJump: i
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", gl, [
        e.createVNode(O, {
          "step-key": "a-topic",
          index: 0,
          title: S[0].title,
          hint: S[0].hint,
          runtime: C.value["a-topic"],
          "is-current": M.value === "a-topic"
        }, {
          default: e.withCtx(() => [
            h.value ? (e.openBlock(), e.createElementBlock(
              "p",
              wl,
              e.toDisplayString(h.value.name),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", bl, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(_, ($) => e.createElementVNode("button", {
                      key: $,
                      type: "button",
                      class: e.normalizeClass(["ba-type", { on: b.topic === $ }]),
                      onClick: (z) => b.topic = $
                    }, e.toDisplayString(B($)), 11, Nl)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", fl, [
                  e.createElementVNode("label", El, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(s.$t("时长（秒）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": f[1] || (f[1] = ($) => b.seconds = $),
                        type: "number",
                        min: "20",
                        max: "120"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        b.seconds,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])
                ]),
                e.createElementVNode("label", $l, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.$t("补充说明（选填，例如开业日期、活动内容）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": f[2] || (f[2] = ($) => b.brief = $),
                      rows: "2"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, b.brief]
                  ])
                ]),
                e.createElementVNode("details", _l, [
                  e.createElementVNode(
                    "summary",
                    null,
                    e.toDisplayString(s.$t("知识库里可用的资料 {n} 条", { n: o.value.length })),
                    1
                    /* TEXT */
                  ),
                  o.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Sl,
                    e.toDisplayString(s.$t("知识库还没有公司资料：到左侧「知识库」导入营业执照、公司介绍等文档，讲稿会更完整")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode("ul", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(o.value, ($) => (e.openBlock(), e.createElementBlock("li", {
                        key: $.label + $.value
                      }, [
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString($.label),
                          1
                          /* TEXT */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(s.$t("：{p0}", { p0: $.value })),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]),
                e.createElementVNode("div", Dl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!N.value,
                    onClick: j
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(N.value === "a-topic" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("写讲稿")),
                      1
                      /* TEXT */
                    )
                  ], 8, Bl)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "a-script",
          index: 1,
          title: S[1].title,
          hint: S[1].hint,
          runtime: C.value["a-script"],
          "is-current": M.value === "a-script"
        }, {
          default: e.withCtx(() => [
            h.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(h.value.warnings, ($) => (e.openBlock(), e.createElementBlock("p", {
                    key: $,
                    class: "ss-note warn"
                  }, [
                    f[10] || (f[10] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString($),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                e.withDirectives(e.createElementVNode(
                  "textarea",
                  {
                    "onUpdate:modelValue": f[3] || (f[3] = ($) => D.value = $),
                    class: "ba-script",
                    rows: "10"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, D.value]
                ]),
                e.createElementVNode("div", Cl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!N.value || D.value === h.value.script,
                    onClick: H
                  }, [
                    f[11] || (f[11] = e.createElementVNode(
                      "i",
                      { class: "ri-save-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("保存讲稿")),
                      1
                      /* TEXT */
                    )
                  ], 8, Tl),
                  e.createElementVNode(
                    "span",
                    Ll,
                    e.toDisplayString(s.$t("约 {n} 字 · 由 {p0} 撰写", { n: D.value.length, p0: e.unref(l.modelLabel)(h.value.model) })),
                    1
                    /* TEXT */
                  )
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "a-avatar",
          index: 2,
          title: S[2].title,
          hint: S[2].hint,
          runtime: C.value["a-avatar"],
          "is-current": M.value === "a-avatar"
        }, {
          default: e.withCtx(() => [
            h.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Al, [
                  e.createElementVNode("label", Ml, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(s.$t("形象 ID（留空用服务商默认）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": f[4] || (f[4] = ($) => y.avatarId = $),
                        type: "text"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        y.avatarId,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("label", Il, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(s.$t("音色 ID（留空用默认）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": f[5] || (f[5] = ($) => y.voiceId = $),
                        type: "text"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        y.voiceId,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("label", Fl, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(s.$t("画幅")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": f[6] || (f[6] = ($) => y.aspectRatio = $)
                      },
                      [
                        e.createElementVNode(
                          "option",
                          Ul,
                          e.toDisplayString(s.$t("竖屏 9:16（短视频）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "option",
                          Rl,
                          e.toDisplayString(s.$t("横屏 16:9")),
                          1
                          /* TEXT */
                        )
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelSelect, y.aspectRatio]
                    ])
                  ])
                ]),
                e.createElementVNode("label", Ol, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.$t("如使用真人定制分身：授权说明（本人姓名、授权日期、授权书存放位置）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": f[7] || (f[7] = ($) => y.likenessConsent = $),
                      type: "text"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      e.vModelText,
                      y.likenessConsent,
                      void 0,
                      { trim: !0 }
                    ]
                  ])
                ]),
                e.createElementVNode("div", zl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!N.value,
                    onClick: P
                  }, [
                    f[12] || (f[12] = e.createElementVNode(
                      "i",
                      { class: "ri-save-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("保存")),
                      1
                      /* TEXT */
                    )
                  ], 8, Pl),
                  e.createElementVNode(
                    "span",
                    Kl,
                    e.toDisplayString(s.$t("形象与音色在「数字人工作台 → 配置」里查看；使用真人形象必须有本人书面授权")),
                    1
                    /* TEXT */
                  )
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(`
        数字人成片没有取消通道（云端任务），还在跑时「可能已超时」卡只给 继续等待 / 查看日志，不放重新生成
        （放了就是第二轮并行烧钱）；失败后才有「重新成片」。
      `),
        e.createVNode(O, {
          "step-key": "a-render",
          index: 3,
          title: S[3].title,
          hint: S[3].hint,
          runtime: C.value["a-render"],
          "is-current": M.value === "a-render",
          retry: h.value && h.value.status !== "rendering" ? W : void 0,
          "retry-label": s.$t("重新成片")
        }, {
          default: e.withCtx(() => [
            h.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", jl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!N.value || h.value.status === "rendering" || D.value !== h.value.script,
                    onClick: W
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(h.value.status === "rendering" ? "ri-loader-4-line spin" : "ri-film-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(h.value.video ? s.$t("重新成片") : s.$t("数字人成片")),
                      1
                      /* TEXT */
                    )
                  ], 8, Wl),
                  e.createElementVNode(
                    "span",
                    Jl,
                    e.toDisplayString(s.$t("通常 1～5 分钟；讲稿里的【待补充】要先补完")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "p",
                  ql,
                  e.toDisplayString(s.$t("成片后自动在画面顶部加「本视频由 AI 生成」标识，最后 3 秒叠片尾（门店名、地址、营业时间，在「设置」里填）")),
                  1
                  /* TEXT */
                ),
                h.value.video ? (e.openBlock(), e.createElementBlock("video", {
                  key: 0,
                  src: e.unref(l.fileUrl)(h.value.video),
                  controls: "",
                  playsinline: "",
                  class: e.normalizeClass(["ba-video", { wide: h.value.aspectRatio === "16:9" }])
                }, null, 10, Hl)) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry", "retry-label"]),
        e.createVNode(O, {
          "step-key": "a-publish",
          index: 4,
          title: S[4].title,
          hint: S[4].hint,
          runtime: C.value["a-publish"],
          "is-current": M.value === "a-publish"
        }, {
          default: e.withCtx(() => [
            h.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Gl, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(U, ($) => e.createElementVNode("label", {
                      key: $,
                      class: "ba-check"
                    }, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": f[8] || (f[8] = (z) => v.value = z),
                        type: "checkbox",
                        value: $
                      }, null, 8, Yl), [
                        [e.vModelCheckbox, v.value]
                      ]),
                      e.createTextVNode(
                        e.toDisplayString(e.unref(l.platformLabel)($)),
                        1
                        /* TEXT */
                      )
                    ])),
                    64
                    /* STABLE_FRAGMENT */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!N.value || !h.value.video || !v.value.length,
                    onClick: u
                  }, [
                    f[13] || (f[13] = e.createElementVNode(
                      "i",
                      { class: "ri-send-plane-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("写发布文案并进入发布")),
                      1
                      /* TEXT */
                    )
                  ], 8, xl)
                ]),
                e.createElementVNode(
                  "p",
                  Ql,
                  e.toDisplayString(s.$t("生成一个已成片的视频项目，在「短视频发布」里审核后发布；文案末尾自动加「本视频由 AI 生成」")),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"])
      ])
    ]));
  }
}), en = /* @__PURE__ */ Q(Zl, [["__scopeId", "data-v-41ca6478"]]), tn = { class: "ss-module" }, ln = { class: "ss-steps" }, nn = { class: "ss-actions" }, sn = ["disabled"], on = ["disabled"], an = { class: "ss-muted" }, rn = { class: "ss-muted" }, cn = {
  key: 0,
  class: "ss-note info"
}, dn = {
  key: 1,
  class: "ss-note ok"
}, un = {
  key: 2,
  class: "ss-table-wrap"
}, mn = { class: "ss-table" }, pn = { class: "ba-wrap" }, vn = ["onUpdate:modelValue"], yn = ["value"], hn = { class: "ba-row" }, kn = ["disabled", "onClick"], Vn = ["onClick"], gn = { class: "ba-gpick" }, bn = ["onClick"], Nn = ["src"], fn = { class: "ss-actions" }, En = { class: "ss-muted" }, $n = ["checked", "onChange"], _n = { class: "ss-actions" }, Sn = ["disabled"], Dn = { class: "ss-muted" }, Bn = {
  key: 0,
  class: "ss-empty"
}, wn = { class: "ba-listing__imgs" }, Cn = ["src"], Tn = { class: "ba-listing__body" }, Ln = { class: "ba-listing__head" }, An = { class: "ss-muted" }, Mn = ["onUpdate:modelValue"], In = ["onUpdate:modelValue", "placeholder"], Fn = ["onUpdate:modelValue"], Un = { class: "ss-actions" }, Rn = ["disabled", "onClick"], On = ["disabled", "onClick"], zn = ["onClick"], Pn = { class: "ss-muted" }, Kn = {
  key: 0,
  class: "ss-empty"
}, jn = { class: "ss-chip" }, Wn = ["disabled", "onClick"], Jn = {
  key: 0,
  class: "ss-empty"
}, qn = {
  key: 1,
  class: "ss-table-wrap"
}, Hn = { class: "ss-table" }, Gn = ["onUpdate:modelValue", "placeholder", "onChange"], Yn = { class: "ba-row" }, xn = ["onClick"], Qn = ["onClick"], Xn = ["onClick"], Zn = /* @__PURE__ */ e.defineComponent({
  __name: "ListingTab",
  setup(K) {
    const F = Y.useNotificationStore(), L = ee.useRouter(), k = l.baState, _ = e.computed(() => l.baGarments.value), U = e.computed(() => (k.value?.settings.channels || []).filter((r) => r.enabled)), B = e.computed(() => k.value?.ruleHits || []), w = e.computed(() => k.value?.listings || []), A = e.computed(() => w.value.filter((r) => r.status === "draft" || r.status === "confirmed")), h = e.computed(() => w.value.filter((r) => r.status === "confirmed")), b = e.computed(() => w.value.filter((r) => r.status === "handed" || r.status === "listed" || r.status === "delisted")), o = e.ref([]), d = e.ref([]);
    e.watch(U, (r) => {
      d.value.length || (d.value = r.slice(0, 1).map((t) => t.id));
    }, { immediate: !0 });
    const D = e.ref(!1), y = e.ref([]), v = e.reactive({}), N = e.reactive({});
    e.watch(w, (r) => {
      for (const t of r)
        v[t.id] || (v[t.id] = { title: t.title, points: t.sellingPoints.join(`
`), detail: t.detail }), N[t.id] === void 0 && (N[t.id] = t.productUrl || "");
    }, { immediate: !0 });
    const E = e.ref(""), S = e.ref({}), T = [
      { key: "l-rules", title: n.t("库存巡检"), hint: n.t("售罄下架、断码提醒、过季提醒、试穿多成交少换主图") },
      { key: "l-pick", title: n.t("选商品与渠道"), hint: n.t("商品来自服装AI试衣的商品库") },
      { key: "l-gen", title: n.t("生成图文"), hint: n.t("标题、卖点、详情、关键词 + 主图") },
      { key: "l-confirm", title: n.t("确认"), hint: n.t("逐条改、逐条确认；含极限词的不能确认") },
      { key: "l-hand", title: n.t("数字员工上架"), hint: n.t("在网店后台填写，停在提交前等你确认") },
      { key: "l-ledger", title: n.t("上架台账"), hint: n.t("记录商品链接，下架时用") }
    ];
    function C(r, t, a) {
      return E.value === r ? { state: "running" } : S.value[r] ? { state: "failed", error: S.value[r] } : t ? { state: "done", summary: a } : { state: "todo" };
    }
    const M = e.computed(() => ({
      "l-rules": C("l-rules", D.value, n.t("{n} 条提醒", { n: B.value.length })),
      "l-pick": C("l-pick", o.value.length > 0 && d.value.length > 0),
      "l-gen": C("l-gen", w.value.length > 0, n.t("{n} 份草稿", { n: A.value.length })),
      "l-confirm": C("l-confirm", w.value.some((r) => r.status !== "draft")),
      "l-hand": C("l-hand", b.value.length > 0),
      "l-ledger": C("l-ledger", w.value.some((r) => r.status === "listed"))
    })), R = e.computed(() => T.find((r) => M.value[r.key].state !== "done")?.key || "l-ledger"), j = e.reactive({});
    e.watch(B, (r) => {
      for (const t of r) {
        const a = `${t.garmentId}:${t.rule}`;
        j[a] || (j[a] = t.action);
      }
    }, { immediate: !0 });
    const H = (r) => ({ delist: n.t("下架"), presale: n.t("改为预售"), delist_color: n.t("下架该颜色"), badge_sale: n.t("主图加「断码特价」"), clearance: n.t("转入清仓专区"), swap_image: n.t("换主图（试穿最多的造型图）"), remind: n.t("提醒店长") })[r], P = e.ref("");
    async function W() {
      const r = await l.pickFiles("excel");
      r.length && await z("l-rules", async () => {
        const t = await l.ba("finance.import", { path: r[0], kind: "inventory" });
        D.value = !0, P.value = t.unmatched.length ? n.t("已同步 {n} 行；这些货号在商品库里找不到：{p0}", { n: t.rows, p0: t.unmatched.slice(0, 8).join("、") }) : n.t("已同步 {n} 行库存", { n: t.rows });
      });
    }
    async function u(r) {
      const t = j[`${r.garmentId}:${r.rule}`] || r.action;
      await z("l-rules", async () => {
        const a = await l.ba("rules.handle", { garmentId: r.garmentId, action: t });
        if (a.text) {
          const c = await l.handToDigitalEmployee(n.t("{p0}：{p1}", { p0: H(t), p1: l.garmentName(r.garmentId) }), a.text);
          if (t === "delist") for (const I of a.listingIds) await l.ba("listing.status", { id: I, status: "handed", conversationId: c });
          F.success(n.t("已交给数字员工处理"));
        } else a.done.length && F.info(a.done.join(n.t("；")));
      });
    }
    const p = (r) => ({ soldout: n.t("售罄"), broken_size: n.t("断码"), off_season: n.t("过季"), lagging: n.t("试穿多成交少") })[r], i = (r) => ({ draft: n.t("草稿"), confirmed: n.t("已确认"), handed: n.t("数字员工处理中"), listed: n.t("已上架"), delisted: n.t("已下架") })[r], s = (r) => k.value?.settings.channels.find((t) => t.id === r)?.name || r, f = (r) => !!l.baGarments.value.find((t) => t.id === r)?.onShelf;
    function $(r, t) {
      const a = r.indexOf(t);
      a >= 0 ? r.splice(a, 1) : r.push(t);
    }
    async function z(r, t) {
      E.value = r, S.value = { ...S.value, [r]: "" };
      try {
        return await t(), await l.refreshState(), !0;
      } catch (a) {
        return S.value = { ...S.value, [r]: l.errorMessage(a) }, l.scrollToStep(r), !1;
      } finally {
        E.value = "";
      }
    }
    async function x() {
      await z("l-rules", async () => {
        const r = await l.ba("rules.evaluate");
        D.value = !0, r.delisted && F.info(n.t("已把 {n} 款售罄商品从门店试穿手机端下架", { n: r.delisted }));
      });
    }
    async function G(r, t) {
      await z("l-rules", () => l.ba("local.shelf", { garmentId: r, onShelf: t }));
    }
    async function X() {
      y.value = [], await z("l-gen", async () => {
        const r = await l.ba("listing.generate", { garmentIds: o.value, channelIds: d.value });
        y.value = r.errors;
      });
    }
    async function te(r) {
      const t = v[r];
      await z("l-confirm", () => l.ba("listing.update", { id: r, patch: { title: t.title, detail: t.detail, sellingPoints: t.points.split(`
`).map((c) => c.trim()).filter(Boolean) } }));
      const a = w.value.find((c) => c.id === r);
      a && (v[r] = { title: a.title, points: a.sellingPoints.join(`
`), detail: a.detail });
    }
    async function le(r) {
      await z("l-confirm", () => l.ba("listing.confirm", { id: r }));
    }
    async function Z(r) {
      await z("l-confirm", () => l.ba("listing.remove", { id: r }));
    }
    async function ne(r) {
      await z("l-hand", async () => {
        const a = await l.ba("listing.instruction", { id: r }), c = w.value.find((q) => q.id === r), I = await l.handToDigitalEmployee(n.t("{p0} 上架：{p1}", { p0: s(c.channelId), p1: c.title.slice(0, 20) }), a);
        await l.ba("listing.status", { id: r, status: "handed", conversationId: I });
      }) && F.success(n.t("已交给数字员工，点「查看执行过程」可以看它操作；提交前会请你确认"));
    }
    async function m(r, t) {
      await z("l-ledger", () => l.ba("listing.status", { id: r, status: t }));
    }
    async function g(r) {
      await z("l-ledger", () => l.ba("listing.update", { id: r, patch: { productUrl: N[r] } }));
    }
    function V(r) {
      L.push(`/conversations/${r}`).catch((t) => F.error(l.errorMessage(t)));
    }
    function J(r) {
      l.scrollToStep(r);
    }
    return (r, t) => (e.openBlock(), e.createElementBlock("div", tn, [
      e.createVNode(oe, {
        "module-key": "listing",
        icon: "ri-store-3-line",
        title: r.$t("商品图文自动上下架"),
        ability: r.$t("按渠道生成标题、卖点、详情与主图（按渠道比例补白边）→ 你确认 → 数字员工在网店后台填写、停在提交前；售罄 / 断码 / 过季 / 试穿多成交少按规则下架或提醒"),
        output: r.$t("各渠道上架草稿、上架台账、下架指令；价格与库存取自商品库，不让模型填")
      }, null, 8, ["title", "ability", "output"]),
      e.createVNode(se, {
        title: r.$t("商品上下架"),
        metas: T,
        runtime: M.value,
        "current-key": R.value,
        onJump: J
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", ln, [
        e.createVNode(O, {
          "step-key": "l-rules",
          index: 0,
          title: T[0].title,
          hint: T[0].hint,
          runtime: M.value["l-rules"],
          "is-current": R.value === "l-rules"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", nn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!E.value,
                onClick: x
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(E.value === "l-rules" ? "ri-loader-4-line spin" : "ri-radar-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(r.$t("库存巡检")),
                  1
                  /* TEXT */
                )
              ], 8, sn),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!E.value,
                onClick: W
              }, [
                t[0] || (t[0] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(r.$t("同步库存表")),
                  1
                  /* TEXT */
                )
              ], 8, on),
              e.createElementVNode(
                "span",
                an,
                e.toDisplayString(e.unref(k)?.settings.autoDelistLocal ? r.$t("售罄款会自动从门店试穿手机端下架（只动本机，网店要人确认）") : r.$t("只提醒，不自动下架")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "p",
              rn,
              e.toDisplayString(r.$t("库存是自动下架的前提：导入收银 / 进销存导出的「货号 × 尺码 × 库存」表同步到商品库；读不到库存时只做上架与人工下架。")),
              1
              /* TEXT */
            ),
            P.value ? (e.openBlock(), e.createElementBlock("p", cn, [
              t[1] || (t[1] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(P.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            D.value && !B.value.length ? (e.openBlock(), e.createElementBlock("p", dn, [
              t[2] || (t[2] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(r.$t("没有需要处理的款")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            B.value.length ? (e.openBlock(), e.createElementBlock("div", un, [
              e.createElementVNode("table", mn, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("商品")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("规则")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("情况")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("建议")),
                      1
                      /* TEXT */
                    ),
                    t[3] || (t[3] = e.createElementVNode(
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
                    e.renderList(B.value, (a, c) => (e.openBlock(), e.createElementBlock("tr", { key: c }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(l.garmentName)(a.garmentId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", a.rule === "soldout" ? "bad" : "warn"])
                          },
                          e.toDisplayString(p(a.rule)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        pn,
                        e.toDisplayString(a.detail),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("select", {
                          "onUpdate:modelValue": (I) => j[`${a.garmentId}:${a.rule}`] = I,
                          class: "ba-mini"
                        }, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(a.options || [a.action], (I) => (e.openBlock(), e.createElementBlock("option", {
                              key: I,
                              value: I
                            }, e.toDisplayString(H(I)) + e.toDisplayString(I === a.action ? r.$t("（默认）") : ""), 9, yn))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 8, vn), [
                          [e.vModelSelect, j[`${a.garmentId}:${a.rule}`]]
                        ])
                      ]),
                      e.createElementVNode("td", hn, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm",
                          disabled: !!E.value,
                          onClick: (I) => u(a)
                        }, e.toDisplayString(r.$t("执行")), 9, kn),
                        f(a.garmentId) ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: (I) => G(a.garmentId, !1)
                        }, e.toDisplayString(r.$t("门店手机端下架")), 9, Vn)) : e.createCommentVNode("v-if", !0)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "l-pick",
          index: 1,
          title: T[1].title,
          hint: T[1].hint,
          runtime: M.value["l-pick"],
          "is-current": R.value === "l-pick"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", gn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(_.value, (a) => (e.openBlock(), e.createElementBlock("button", {
                  key: a.id,
                  type: "button",
                  class: e.normalizeClass({ on: o.value.includes(a.id) }),
                  onClick: (c) => $(o.value, a.id)
                }, [
                  e.createElementVNode("img", {
                    src: e.unref(l.fileUrl)(a.image),
                    alt: "",
                    loading: "lazy"
                  }, null, 8, Nn),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(a.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    "¥" + e.toDisplayString(a.price),
                    1
                    /* TEXT */
                  )
                ], 10, bn))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", fn, [
              e.createElementVNode(
                "span",
                En,
                e.toDisplayString(r.$t("上架渠道")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(U.value, (a) => (e.openBlock(), e.createElementBlock("label", {
                  key: a.id,
                  class: "ba-check"
                }, [
                  e.createElementVNode("input", {
                    type: "checkbox",
                    checked: d.value.includes(a.id),
                    onChange: (c) => $(d.value, a.id)
                  }, null, 40, $n),
                  e.createTextVNode(
                    e.toDisplayString(a.name),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "l-gen",
          index: 2,
          title: T[2].title,
          hint: T[2].hint,
          runtime: M.value["l-gen"],
          "is-current": R.value === "l-gen"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", _n, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!E.value || !o.value.length || !d.value.length,
                onClick: X
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(E.value === "l-gen" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(r.$t("生成 {n} 份上架草稿", { n: o.value.length * d.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, Sn),
              e.createElementVNode(
                "span",
                Dn,
                e.toDisplayString(r.$t("主图 = 商品图 + 该款试穿图，按渠道比例补白边")),
                1
                /* TEXT */
              )
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(y.value, (a) => (e.openBlock(), e.createElementBlock("p", {
                key: a,
                class: "ss-note warn"
              }, [
                t[4] || (t[4] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(a),
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
        e.createVNode(O, {
          "step-key": "l-confirm",
          index: 3,
          title: T[3].title,
          hint: T[3].hint,
          runtime: M.value["l-confirm"],
          "is-current": R.value === "l-confirm"
        }, {
          default: e.withCtx(() => [
            A.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              Bn,
              e.toDisplayString(r.$t("生成后的草稿在这里逐条确认")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(A.value, (a) => (e.openBlock(), e.createElementBlock("div", {
                key: a.id,
                class: "ba-listing"
              }, [
                e.createElementVNode("div", wn, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.images.slice(0, 4), (c) => (e.openBlock(), e.createElementBlock("img", {
                      key: c,
                      src: e.unref(l.fileUrl)(c),
                      alt: ""
                    }, null, 8, Cn))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", Tn, [
                  e.createElementVNode("div", Ln, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(s(a.channelId)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      An,
                      e.toDisplayString(e.unref(l.garmentName)(a.garmentId)) + " · ¥" + e.toDisplayString(a.price),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", a.status === "confirmed" ? "ok" : ""])
                      },
                      e.toDisplayString(i(a.status)),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.warnings, (c) => (e.openBlock(), e.createElementBlock("p", {
                      key: c,
                      class: "ss-note warn"
                    }, [
                      t[5] || (t[5] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(c),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (c) => v[a.id].title = c,
                    type: "text"
                  }, null, 8, Mn), [
                    [e.vModelText, v[a.id].title]
                  ]),
                  e.withDirectives(e.createElementVNode("textarea", {
                    "onUpdate:modelValue": (c) => v[a.id].points = c,
                    rows: "2",
                    placeholder: r.$t("卖点，一行一条")
                  }, null, 8, In), [
                    [e.vModelText, v[a.id].points]
                  ]),
                  e.withDirectives(e.createElementVNode("textarea", {
                    "onUpdate:modelValue": (c) => v[a.id].detail = c,
                    rows: "3"
                  }, null, 8, Fn), [
                    [e.vModelText, v[a.id].detail]
                  ]),
                  e.createElementVNode("div", Un, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!E.value,
                      onClick: (c) => te(a.id)
                    }, [
                      t[6] || (t[6] = e.createElementVNode(
                        "i",
                        { class: "ri-save-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(r.$t("保存")),
                        1
                        /* TEXT */
                      )
                    ], 8, Rn),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm primary",
                      disabled: !!E.value || a.status === "confirmed" || a.warnings.length > 0,
                      onClick: (c) => le(a.id)
                    }, [
                      t[7] || (t[7] = e.createElementVNode(
                        "i",
                        { class: "ri-check-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(r.$t("确认")),
                        1
                        /* TEXT */
                      )
                    ], 8, On),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (c) => Z(a.id)
                    }, e.toDisplayString(r.$t("删除")), 9, zn)
                  ])
                ])
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "l-hand",
          index: 4,
          title: T[4].title,
          hint: T[4].hint,
          runtime: M.value["l-hand"],
          "is-current": R.value === "l-hand"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode(
              "p",
              Pn,
              e.toDisplayString(r.$t("先在内置浏览器里登录各网店后台。数字员工按草稿填写，停在「提交 / 发布」前截图给你，由你亲自点提交。")),
              1
              /* TEXT */
            ),
            h.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              Kn,
              e.toDisplayString(r.$t("没有待上架的已确认草稿")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(h.value, (a) => (e.openBlock(), e.createElementBlock("div", {
                key: a.id,
                class: "ss-actions"
              }, [
                e.createElementVNode(
                  "span",
                  jn,
                  e.toDisplayString(s(a.channelId)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(a.title),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: !!E.value,
                  onClick: (c) => ne(a.id)
                }, [
                  t[8] || (t[8] = e.createElementVNode(
                    "i",
                    { class: "ri-robot-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(r.$t("交给数字员工上架")),
                    1
                    /* TEXT */
                  )
                ], 8, Wn)
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "l-ledger",
          index: 5,
          title: T[5].title,
          hint: T[5].hint,
          runtime: M.value["l-ledger"],
          "is-current": R.value === "l-ledger"
        }, {
          default: e.withCtx(() => [
            b.value.length ? (e.openBlock(), e.createElementBlock("div", qn, [
              e.createElementVNode("table", Hn, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("商品")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("渠道")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("商品链接")),
                      1
                      /* TEXT */
                    ),
                    t[9] || (t[9] = e.createElementVNode(
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
                    e.renderList(b.value, (a) => (e.openBlock(), e.createElementBlock("tr", {
                      key: a.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(l.garmentName)(a.garmentId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(s(a.channelId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", a.status === "listed" ? "ok" : a.status === "delisted" ? "bad" : "brand"])
                          },
                          e.toDisplayString(i(a.status)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (c) => N[a.id] = c,
                          type: "text",
                          placeholder: r.$t("上架成功后粘贴商品链接"),
                          onChange: (c) => g(a.id)
                        }, null, 40, Gn), [
                          [e.vModelText, N[a.id]]
                        ])
                      ]),
                      e.createElementVNode("td", Yn, [
                        a.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: (c) => V(a.conversationId)
                        }, e.toDisplayString(r.$t("查看执行过程")), 9, xn)) : e.createCommentVNode("v-if", !0),
                        a.status === "handed" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 1,
                          type: "button",
                          class: "ss-link",
                          onClick: (c) => m(a.id, "listed")
                        }, e.toDisplayString(r.$t("已上架")), 9, Qn)) : e.createCommentVNode("v-if", !0),
                        a.status === "listed" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 2,
                          type: "button",
                          class: "ss-link",
                          onClick: (c) => m(a.id, "delisted")
                        }, e.toDisplayString(r.$t("标记已下架")), 9, Xn)) : e.createCommentVNode("v-if", !0)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              Jn,
              e.toDisplayString(r.$t("还没有上架记录")),
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
}), es = /* @__PURE__ */ Q(Zn, [["__scopeId", "data-v-aa93eb57"]]), ts = { class: "ss-module" }, ls = { class: "ss-steps" }, ns = { class: "ss-actions" }, ss = ["disabled"], os = { class: "ss-muted" }, as = { class: "ss-actions" }, is = ["disabled"], rs = { class: "ss-muted" }, cs = { class: "ss-muted" }, ds = { class: "ss-actions" }, us = ["disabled"], ms = { class: "ss-muted" }, ps = { class: "ss-actions" }, vs = { class: "ss-field" }, ys = { class: "ss-field" }, hs = ["disabled"], ks = { class: "ss-kpis" }, Vs = { class: "ss-kpi accent" }, gs = { key: 0 }, bs = { class: "ss-kpi" }, Ns = { class: "ss-kpi" }, fs = { class: "ss-kpi" }, Es = { class: "ss-kpi" }, $s = { class: "ss-kpi" }, _s = { class: "ss-kpi" }, Ss = { class: "ss-kpi" }, Ds = { key: 0 }, Bs = {
  key: 0,
  class: "ss-note warn"
}, ws = ["title"], Cs = ["title"], Ts = {
  key: 2,
  class: "ss-note warn"
}, Ls = { class: "ba-blocks" }, As = {
  key: 0,
  class: "ss-muted"
}, Ms = { class: "ss-actions" }, Is = { class: "ss-subhead" }, Fs = { value: "amount" }, Us = { value: "qty" }, Rs = { value: "grossProfit" }, Os = { value: "sellThrough" }, zs = { class: "ss-table-wrap ba-scroll" }, Ps = { class: "ss-table" }, Ks = { class: "num" }, js = { class: "num" }, Ws = { class: "num" }, Js = { class: "num" }, qs = { class: "num" }, Hs = { class: "num" }, Gs = { class: "num" }, Ys = { class: "num" }, xs = { class: "ss-subhead" }, Qs = { class: "ba-slow" }, Xs = { class: "ss-actions" }, Zs = ["disabled", "onClick"], eo = ["disabled"], to = {
  key: 0,
  class: "ba-report"
}, lo = { class: "ss-muted" }, no = {
  key: 0,
  class: "ss-note warn"
}, so = {
  key: 1,
  class: "ss-note danger"
}, oo = {
  key: 2,
  class: "ss-note ok"
}, ao = {
  key: 1,
  class: "ba-history"
}, io = { class: "ss-muted" }, ro = ["onClick"], co = { class: "ss-actions" }, uo = ["disabled"], mo = ["disabled"], po = ["disabled"], vo = ["disabled"], yo = {
  key: 0,
  class: "ss-muted"
}, ho = {
  key: 1,
  class: "ss-actions"
}, ko = ["title"], Vo = ["placeholder"], go = ["disabled"], bo = { class: "ss-muted" }, No = /* @__PURE__ */ e.defineComponent({
  __name: "FinanceTab",
  setup(K) {
    const F = e.defineComponent({
      props: { items: { type: Array, required: !0 } },
      setup(m) {
        return () => m.items.length ? e.h("ul", { class: "ba-imports" }, m.items.slice(0, 5).map((g) => e.h("li", {}, n.t("{p0}：{a} ~ {b}，{n} 行（跳过 {m} 行）· 识别列 {c}", { p0: g.file, a: g.from, b: g.to, n: g.rows, m: g.skipped, c: Object.values(g.mapping).join(" / ") })))) : null;
      }
    }), L = Y.useNotificationStore(), k = ee.useRouter(), _ = l.baState, U = ["daily", "weekly", "monthly"], B = e.computed(() => _.value?.imports || []), w = e.computed(() => _.value?.reports || []), A = e.ref(""), h = e.computed(() => w.value.find((m) => m.id === A.value) || w.value[0] || null), b = e.ref(""), o = e.ref(""), d = e.ref(null), D = e.ref(!1), y = e.ref(""), v = e.ref(""), N = e.ref({});
    e.onMounted(async () => {
      const m = await l.ba("finance.range").catch(() => ({ from: "", to: "" }));
      if (m.to) {
        o.value = m.to;
        const g = /* @__PURE__ */ new Date(`${m.to}T00:00:00`);
        g.setDate(g.getDate() - 29), b.value = g.toISOString().slice(0, 10) < m.from ? m.from : g.toISOString().slice(0, 10);
      }
    });
    const E = [
      { key: "f-sales", title: n.t("导入销售数据"), hint: n.t("收银系统 / 网店导出的销售明细（只读）") },
      { key: "f-expense", title: n.t("导入费用"), hint: n.t("房租、工资、水电、推广等，可跳过") },
      { key: "f-metrics", title: n.t("经营指标"), hint: n.t("营业额、毛利、客单价、连带率、费用率、售罄率") },
      { key: "f-report", title: n.t("生成报表"), hint: n.t("日报 / 周报 / 月报；解读里的数字回原数据核对") },
      { key: "f-push", title: n.t("推送与导出"), hint: n.t("企业微信 / 钉钉 / 邮件，或导出 Excel") },
      { key: "f-qa", title: n.t("随时问数"), hint: n.t("用大白话问，回答注明期间与口径") }
    ];
    function S(m, g, V) {
      return v.value === m ? { state: "running" } : N.value[m] ? { state: "failed", error: N.value[m] } : g ? { state: "done", summary: V } : { state: "todo" };
    }
    const T = e.computed(() => ({
      "f-sales": S("f-sales", (_.value?.salesRows || 0) > 0, n.t("{n} 行", { n: _.value?.salesRows || 0 })),
      "f-expense": S("f-expense", (_.value?.expenseRows || 0) > 0 || D.value, _.value?.expenseRows ? n.t("{n} 行", { n: _.value.expenseRows }) : n.t("已跳过")),
      "f-metrics": S("f-metrics", !!d.value || w.value.length > 0),
      "f-report": S("f-report", !!h.value, h.value ? `${h.value.metrics.from} ~ ${h.value.metrics.to}` : ""),
      "f-push": S("f-push", !!h.value && (!!h.value.pushed?.some((m) => m.ok) || !!h.value.exportPath)),
      "f-qa": S("f-qa", (_.value?.qa.length || 0) > 0)
    })), C = e.computed(() => E.find((m) => T.value[m.key].state !== "done")?.key || "f-qa"), M = e.computed(() => {
      const m = d.value;
      return m ? [
        { title: n.t("渠道"), rows: m.byChannel.slice(0, 6), pct: !1 },
        { title: n.t("品类"), rows: m.byCategory.slice(0, 6), pct: !1 },
        { title: n.t("畅销款"), rows: m.topItems.slice(0, 6).map((g) => ({ ...g, share: m.netRevenue ? g.value / m.netRevenue : 0 })), pct: !1 },
        { title: n.t("售罄率"), rows: m.sellThrough.slice(0, 6), pct: !0 }
      ] : [];
    }), R = e.ref("amount"), j = e.computed(() => [...d.value?.items || []].sort((m, g) => (g[R.value] ?? -1) - (m[R.value] ?? -1)).slice(0, 30)), H = e.computed(() => Math.max(1, ...d.value?.daily.map((m) => m.netRevenue) || [1])), P = e.ref([]);
    async function W() {
      await f("f-sales", async () => {
        if (P.value = await l.ba("finance.folderImport"), !P.value.length) throw new Error(n.t("还没有配置共享文件夹：到「设置 → 共享文件夹取数」选择"));
      });
    }
    async function u() {
      h.value && await f("f-push", async () => {
        const m = await l.ba("finance.exportPdf", { id: h.value.id });
        await l.openPath(m, !0);
      });
    }
    async function p() {
      if (!h.value || !window.confirm(n.t("把 {a} ~ {b} 的营业额、成本、费用汇总成序时账草稿，导入财务智能体当前账套？金额为含税，价税分离与科目请在财务智能体里复核。", { a: h.value.metrics.from, b: h.value.metrics.to }))) return;
      await f("f-push", async () => {
        const g = await l.ba("finance.toJournal", { id: h.value.id }), V = window.electronAPI, J = V?.workbenches?.financeAgent, r = new Error(n.t("财务智能体未开通，序时账已导出：{p0}", { p0: g })), t = await V?.solutionPkg?.prepare?.({ id: "workbench-finance-agent" }).catch(() => null);
        if (!J?.invoke || t && t.ok === !1) throw r;
        try {
          await J.invoke("data.importJournal", { path: g, append: !0 });
        } catch (a) {
          throw /No handler registered/i.test(String(a?.message)) ? r : a;
        }
      }) && (L.success(n.t("已导入财务智能体")), k.push("/workbenches/finance-agent"));
    }
    const i = (m) => ({ daily: n.t("日报（昨天）"), weekly: n.t("周报（上周）"), monthly: n.t("月报（上月）"), custom: n.t("自定义期间") })[m];
    function s(m, g) {
      if (!g) return "";
      const V = (m - g) / g;
      return `${V >= 0 ? "↑" : "↓"} ${l.fmtPct(Math.abs(V), 1)} ${n.t("较上期")}`;
    }
    async function f(m, g) {
      v.value = m, N.value = { ...N.value, [m]: "" };
      try {
        return await g(), await l.refreshState(), !0;
      } catch (V) {
        return N.value = { ...N.value, [m]: l.errorMessage(V) }, l.scrollToStep(m), !1;
      } finally {
        v.value = "";
      }
    }
    async function $(m) {
      const g = await l.pickFiles("excel");
      g.length && await f(m === "sales" ? "f-sales" : "f-expense", async () => {
        if (await l.ba("finance.import", { path: g[0], kind: m }), m === "sales") {
          const V = await l.ba("finance.range");
          b.value || (b.value = V.from), o.value || (o.value = V.to);
        }
      });
    }
    async function z(m) {
      window.confirm(n.t("清空已导入的数据？")) && (await f("f-sales", () => l.ba("finance.clear", { kind: m })), d.value = null);
    }
    async function x() {
      await f("f-metrics", async () => {
        d.value = await l.ba("finance.metrics", { from: b.value, to: o.value });
      });
    }
    async function G(m) {
      await f("f-report", async () => {
        const g = await l.ba("finance.report", { kind: m, from: b.value, to: o.value });
        A.value = g.id, d.value = g.metrics;
      });
    }
    async function X() {
      if (!h.value) return;
      await f("f-push", () => l.ba("finance.push", { id: h.value.id })) && L.success(n.t("已推送"));
    }
    async function te() {
      h.value && await f("f-push", async () => {
        const m = await l.ba("finance.export", { id: h.value.id });
        await l.openPath(m, !0);
      });
    }
    async function le() {
      if (h.value)
        try {
          await navigator.clipboard.writeText(await l.ba("finance.reportText", { id: h.value.id })), L.success(n.t("已复制"));
        } catch (m) {
          L.error(l.errorMessage(m));
        }
    }
    async function Z() {
      await f("f-qa", () => l.ba("finance.ask", { q: y.value })) && (y.value = "");
    }
    function ne(m) {
      l.scrollToStep(m);
    }
    return (m, g) => (e.openBlock(), e.createElementBlock("div", ts, [
      e.createVNode(oe, {
        "module-key": "finance",
        icon: "ri-line-chart-line",
        title: m.$t("经营数据调取与统计"),
        ability: m.$t("导入收银系统 / 网店导出的销售明细与费用表（只读）→ 按固定口径算营业额、毛利、客单价、连带率、售罄率 → 模型只写解读，解读里的数字逐个回原数据核对 → 推送、导出"),
        output: m.$t("经营日报 / 周报 / 月报、Excel 报表、随时问数；数字全部由规则计算")
      }, null, 8, ["title", "ability", "output"]),
      e.createVNode(se, {
        title: m.$t("经营数据"),
        metas: E,
        runtime: T.value,
        "current-key": C.value,
        onJump: ne
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", ls, [
        e.createVNode(O, {
          "step-key": "f-sales",
          index: 0,
          title: E[0].title,
          hint: E[0].hint,
          runtime: T.value["f-sales"],
          "is-current": C.value === "f-sales"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", ns, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!v.value,
                onClick: g[0] || (g[0] = (V) => $("sales"))
              }, [
                g[10] || (g[10] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(m.$t("导入销售明细")),
                  1
                  /* TEXT */
                )
              ], 8, ss),
              e.createElementVNode(
                "span",
                os,
                e.toDisplayString(m.$t("已有 {n} 行。列：日期、单号、商品 / 货号、品类、数量、实收金额、成本（可选）、渠道（可选）；同一日期段重复导入会覆盖", { n: e.unref(_)?.salesRows || 0 })),
                1
                /* TEXT */
              ),
              e.unref(_)?.salesRows ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: g[1] || (g[1] = (V) => z("sales"))
                },
                e.toDisplayString(m.$t("清空")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("div", as, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: !!v.value,
                onClick: W
              }, [
                g[11] || (g[11] = e.createElementVNode(
                  "i",
                  { class: "ri-folder-received-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(m.$t("从共享文件夹取数")),
                  1
                  /* TEXT */
                )
              ], 8, is),
              e.createElementVNode(
                "span",
                rs,
                e.toDisplayString(m.$t("文件夹在「设置」里配置；定时取数在「定时与联动」里打开")),
                1
                /* TEXT */
              )
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(P.value, (V) => (e.openBlock(), e.createElementBlock(
                "p",
                {
                  key: V.kind,
                  class: e.normalizeClass(["ss-note", V.ok ? "ok" : "danger"])
                },
                [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(V.ok ? "ri-check-line" : "ri-error-warning-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(m.$t("{p0} {p1}：{p2}", { p0: V.kind, p1: V.file || "", p2: V.note })),
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
            e.createElementVNode(
              "p",
              cs,
              e.toDisplayString(m.$t("取数方式：收银系统（秦丝、有赞零售、管家婆等）后台导出 Excel；有开放接口或数据库的，可在「数据查询」里配数据源后导出同样的表。只读，不改原系统。")),
              1
              /* TEXT */
            ),
            e.createVNode(e.unref(F), {
              items: B.value.filter((V) => V.kind === "sales")
            }, null, 8, ["items"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "f-expense",
          index: 1,
          title: E[1].title,
          hint: E[1].hint,
          runtime: T.value["f-expense"],
          "is-current": C.value === "f-expense"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", ds, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!v.value,
                onClick: g[2] || (g[2] = (V) => $("expense"))
              }, [
                g[12] || (g[12] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(m.$t("导入费用表")),
                  1
                  /* TEXT */
                )
              ], 8, us),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn ghost sm",
                  onClick: g[3] || (g[3] = (V) => D.value = !0)
                },
                e.toDisplayString(m.$t("没有，跳过")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                ms,
                e.toDisplayString(m.$t("已有 {n} 行。列：日期 / 月份、费用项目、金额（房租、工资、水电、推广等）", { n: e.unref(_)?.expenseRows || 0 })),
                1
                /* TEXT */
              )
            ]),
            e.createVNode(e.unref(F), {
              items: B.value.filter((V) => V.kind === "expense")
            }, null, 8, ["items"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "f-metrics",
          index: 2,
          title: E[2].title,
          hint: E[2].hint,
          runtime: T.value["f-metrics"],
          "is-current": C.value === "f-metrics"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", ps, [
              e.createElementVNode("label", vs, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(m.$t("开始")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": g[4] || (g[4] = (V) => b.value = V),
                    type: "date"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, b.value]
                ])
              ]),
              e.createElementVNode("label", ys, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(m.$t("结束")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": g[5] || (g[5] = (V) => o.value = V),
                    type: "date"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, o.value]
                ])
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!v.value || !e.unref(_)?.salesRows,
                onClick: x
              }, [
                g[13] || (g[13] = e.createElementVNode(
                  "i",
                  { class: "ri-calculator-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(m.$t("计算")),
                  1
                  /* TEXT */
                )
              ], 8, hs)
            ]),
            d.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", ks, [
                  e.createElementVNode("div", Vs, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("净营业额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(l.fmtMoney)(d.value.netRevenue)),
                      1
                      /* TEXT */
                    ),
                    d.value.prev ? (e.openBlock(), e.createElementBlock(
                      "small",
                      gs,
                      e.toDisplayString(s(d.value.netRevenue, d.value.prev.revenue)),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("div", bs, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("毛利")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(l.fmtMoney)(d.value.grossProfit)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("毛利率 {p0}", { p0: e.unref(l.fmtPct)(d.value.grossMargin, 1) })),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Ns, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("订单")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(d.value.orders),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", fs, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("客单价")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(l.fmtMoney)(d.value.avgOrderValue)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Es, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("连带率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(d.value.unitsPerOrder),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", $s, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("费用")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(l.fmtMoney)(d.value.expenses)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("费用率 {p0}", { p0: e.unref(l.fmtPct)(d.value.expenseRate, 1) })),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", _s, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("净利润")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(l.fmtMoney)(d.value.netProfit)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Ss, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("库存周转天数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(d.value.turnoverDays ?? "—"),
                      1
                      /* TEXT */
                    ),
                    d.value.inventoryValue != null ? (e.openBlock(), e.createElementBlock(
                      "small",
                      Ds,
                      e.toDisplayString(m.$t("库存金额约 {p0}", { p0: e.unref(l.fmtMoney)(d.value.inventoryValue) })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                d.value.lastDataDay && d.value.lastDataDay < o.value ? (e.openBlock(), e.createElementBlock("p", Bs, [
                  g[14] || (g[14] = e.createElementVNode(
                    "i",
                    { class: "ri-time-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(m.$t("销售数据只到 {p0}，之后的日期还没取到数据", { p0: d.value.lastDataDay })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                d.value.daily.length > 1 ? (e.openBlock(), e.createElementBlock("div", {
                  key: 1,
                  class: "ba-trend",
                  title: m.$t("每日净营业额")
                }, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(d.value.daily, (V) => (e.openBlock(), e.createElementBlock("i", {
                      key: V.day,
                      style: e.normalizeStyle({ height: `${Math.max(2, Math.max(0, V.netRevenue) / H.value * 100)}%` }),
                      title: `${V.day}：${e.unref(l.fmtMoney)(V.netRevenue)}`
                    }, null, 12, Cs))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ], 8, ws)) : e.createCommentVNode("v-if", !0),
                d.value.costCoverage < 1 ? (e.openBlock(), e.createElementBlock("p", Ts, [
                  g[15] || (g[15] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(m.$t("只有 {p0} 的销售带成本，毛利按带成本的部分计算；导入带「成本」列的明细后更准", { p0: e.unref(l.fmtPct)(d.value.costCoverage, 0) })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", Ls, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(M.value, (V) => (e.openBlock(), e.createElementBlock("div", {
                      key: V.title,
                      class: "ba-block"
                    }, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(V.title),
                        1
                        /* TEXT */
                      ),
                      V.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", As, "—")),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(V.rows, (J) => (e.openBlock(), e.createElementBlock("div", {
                          key: J.key,
                          class: "ba-bar"
                        }, [
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(J.label),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "i",
                            {
                              style: e.normalizeStyle({ width: `${Math.max(2, (V.pct ? J.value : J.share ?? 0) * 100)}%` })
                            },
                            null,
                            4
                            /* STYLE */
                          ),
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(V.pct ? e.unref(l.fmtPct)(J.value, 0) : e.unref(l.fmtMoney)(J.value)),
                            1
                            /* TEXT */
                          )
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", Ms, [
                  e.createElementVNode(
                    "span",
                    Is,
                    e.toDisplayString(m.$t("款式排行")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "select",
                    {
                      "onUpdate:modelValue": g[6] || (g[6] = (V) => R.value = V),
                      class: "ba-mini"
                    },
                    [
                      e.createElementVNode(
                        "option",
                        Fs,
                        e.toDisplayString(m.$t("按销售额")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        Us,
                        e.toDisplayString(m.$t("按销量")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        Rs,
                        e.toDisplayString(m.$t("按毛利")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        Os,
                        e.toDisplayString(m.$t("按售罄率")),
                        1
                        /* TEXT */
                      )
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelSelect, R.value]
                  ])
                ]),
                e.createElementVNode("div", zs, [
                  e.createElementVNode("table", Ps, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(m.$t("商品")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Ks,
                          e.toDisplayString(m.$t("销量")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          js,
                          e.toDisplayString(m.$t("销售额")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Ws,
                          e.toDisplayString(m.$t("毛利")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Js,
                          e.toDisplayString(m.$t("售罄率")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(j.value, (V) => (e.openBlock(), e.createElementBlock("tr", {
                          key: V.key
                        }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(V.label),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            qs,
                            e.toDisplayString(V.qty),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Hs,
                            e.toDisplayString(e.unref(l.fmtMoney)(V.amount)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Gs,
                            e.toDisplayString(V.grossProfit == null ? "—" : e.unref(l.fmtMoney)(V.grossProfit)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Ys,
                            e.toDisplayString(V.sellThrough == null ? "—" : e.unref(l.fmtPct)(V.sellThrough, 0)),
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
                d.value.slowMovers.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 3 },
                  [
                    e.createElementVNode(
                      "span",
                      xs,
                      e.toDisplayString(m.$t("滞销清单（有库存、本期卖出不超过 1 件）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Qs, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(d.value.slowMovers, (V) => (e.openBlock(), e.createElementBlock(
                          "span",
                          {
                            key: V.key,
                            class: "ss-chip warn"
                          },
                          e.toDisplayString(V.label) + " · " + e.toDisplayString(m.$t("库存 {a}，卖出 {b}", { a: V.stock, b: V.qty })),
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
                )) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "f-report",
          index: 3,
          title: E[3].title,
          hint: E[3].hint,
          runtime: T.value["f-report"],
          "is-current": C.value === "f-report"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Xs, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(U, (V) => e.createElementVNode("button", {
                  key: V,
                  type: "button",
                  class: e.normalizeClass(["ss-btn sm", { primary: V === "daily" }]),
                  disabled: !!v.value || !e.unref(_)?.salesRows,
                  onClick: (J) => G(V)
                }, e.toDisplayString(i(V)), 11, Zs)),
                64
                /* STABLE_FRAGMENT */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                disabled: !!v.value || !e.unref(_)?.salesRows || !b.value || !o.value,
                onClick: g[7] || (g[7] = (V) => G("custom"))
              }, e.toDisplayString(m.$t("按上面选的期间")), 9, eo)
            ]),
            h.value ? (e.openBlock(), e.createElementBlock("div", to, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(i(h.value.kind)) + " · " + e.toDisplayString(h.value.metrics.from) + " ~ " + e.toDisplayString(h.value.metrics.to),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  lo,
                  e.toDisplayString(h.value.model ? m.$t("解读由 {p0} 撰写", { p0: e.unref(l.modelLabel)(h.value.model) }) : ""),
                  1
                  /* TEXT */
                )
              ]),
              h.value.staleNote ? (e.openBlock(), e.createElementBlock("p", no, [
                g[16] || (g[16] = e.createElementVNode(
                  "i",
                  { class: "ri-time-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(h.value.staleNote),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode(
                "pre",
                null,
                e.toDisplayString(h.value.commentary),
                1
                /* TEXT */
              ),
              h.value.unverified.length ? (e.openBlock(), e.createElementBlock("p", so, [
                g[17] || (g[17] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(m.$t("这些数字在数据里找不到来源，请核对后再发：{p0}", { p0: h.value.unverified.join("、") })),
                  1
                  /* TEXT */
                )
              ])) : h.value.model ? (e.openBlock(), e.createElementBlock("p", oo, [
                g[18] || (g[18] = e.createElementVNode(
                  "i",
                  { class: "ri-check-double-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(m.$t("解读里的数字都已回原数据核对")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ])) : e.createCommentVNode("v-if", !0),
            w.value.length > 1 ? (e.openBlock(), e.createElementBlock("div", ao, [
              e.createElementVNode(
                "span",
                io,
                e.toDisplayString(m.$t("历史报表")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(w.value.slice(0, 8), (V) => (e.openBlock(), e.createElementBlock("button", {
                  key: V.id,
                  type: "button",
                  class: e.normalizeClass(["ss-chip", { brand: V.id === h.value?.id }]),
                  onClick: (J) => A.value = V.id
                }, e.toDisplayString(i(V.kind)) + " " + e.toDisplayString(V.metrics.from), 11, ro))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "f-push",
          index: 4,
          title: E[4].title,
          hint: E[4].hint,
          runtime: T.value["f-push"],
          "is-current": C.value === "f-push"
        }, {
          default: e.withCtx(() => [
            h.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", co, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!v.value || !e.unref(_)?.ready.push,
                    onClick: X
                  }, [
                    g[19] || (g[19] = e.createElementVNode(
                      "i",
                      { class: "ri-send-plane-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(m.$t("推送")),
                      1
                      /* TEXT */
                    )
                  ], 8, uo),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: !!v.value,
                    onClick: te
                  }, [
                    g[20] || (g[20] = e.createElementVNode(
                      "i",
                      { class: "ri-download-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(m.$t("导出 Excel")),
                      1
                      /* TEXT */
                    )
                  ], 8, mo),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: !!v.value,
                    onClick: u
                  }, [
                    g[21] || (g[21] = e.createElementVNode(
                      "i",
                      { class: "ri-file-pdf-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(m.$t("导出 PDF")),
                      1
                      /* TEXT */
                    )
                  ], 8, po),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: le
                  }, [
                    g[22] || (g[22] = e.createElementVNode(
                      "i",
                      { class: "ri-file-copy-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(m.$t("复制文字版")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    disabled: !!v.value,
                    onClick: p
                  }, [
                    g[23] || (g[23] = e.createElementVNode(
                      "i",
                      { class: "ri-calculator-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(m.$t("转入财务智能体")),
                      1
                      /* TEXT */
                    )
                  ], 8, vo),
                  h.value.exportPath ? (e.openBlock(), e.createElementBlock(
                    "button",
                    {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: g[8] || (g[8] = (V) => e.unref(l.openPath)(h.value.exportPath, !0))
                    },
                    e.toDisplayString(m.$t("所在文件夹")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.unref(_)?.ready.push ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  yo,
                  e.toDisplayString(m.$t("推送渠道在「设置 → 通知与推送」配置（企业微信 / 钉钉机器人、邮箱）")),
                  1
                  /* TEXT */
                )),
                h.value.pushed?.length ? (e.openBlock(), e.createElementBlock("div", ho, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(h.value.pushed, (V) => (e.openBlock(), e.createElementBlock("span", {
                      key: V.channel,
                      class: e.normalizeClass(["ss-chip", V.ok ? "ok" : "bad"]),
                      title: V.error
                    }, [
                      e.createTextVNode(
                        e.toDisplayString(V.channel) + " ",
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(V.ok ? "ri-check-line" : "ri-close-line")
                        },
                        null,
                        2
                        /* CLASS */
                      )
                    ], 10, ko))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "f-qa",
          index: 5,
          title: E[5].title,
          hint: E[5].hint,
          runtime: T.value["f-qa"],
          "is-current": C.value === "f-qa"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode(
              "form",
              {
                class: "ba-ask",
                onSubmit: e.withModifiers(Z, ["prevent"])
              },
              [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": g[9] || (g[9] = (V) => y.value = V),
                  type: "text",
                  placeholder: m.$t("例如：上个月连衣裙卖了多少？哪个渠道毛利最高？")
                }, null, 8, Vo), [
                  [e.vModelText, y.value]
                ]),
                e.createElementVNode("button", {
                  type: "submit",
                  class: "ss-btn primary",
                  disabled: !!v.value || !y.value.trim() || !e.unref(_)?.salesRows
                }, [
                  g[24] || (g[24] = e.createElementVNode(
                    "i",
                    { class: "ri-question-answer-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(m.$t("提问")),
                    1
                    /* TEXT */
                  )
                ], 8, go)
              ],
              32
              /* NEED_HYDRATION */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList((e.unref(_)?.qa || []).slice(0, 6), (V, J) => (e.openBlock(), e.createElementBlock("div", {
                key: J,
                class: "ba-qa"
              }, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(V.q),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "pre",
                  null,
                  e.toDisplayString(V.a),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  bo,
                  e.toDisplayString(e.unref(l.fmtDateTime)(V.at)) + " · " + e.toDisplayString(e.unref(l.modelLabel)(V.model)),
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
        }, 8, ["title", "hint", "runtime", "is-current"])
      ])
    ]));
  }
}), fo = /* @__PURE__ */ Q(No, [["__scopeId", "data-v-96ec09ec"]]), Eo = { class: "ba-sched" }, $o = { class: "ss-panel" }, _o = { class: "ba-head" }, So = { class: "ss-muted" }, Do = { class: "ba-jobs" }, Bo = { class: "ba-job" }, wo = { class: "ba-check" }, Co = { class: "ba-check" }, To = { class: "ss-muted" }, Lo = { class: "ba-job" }, Ao = { class: "ba-check" }, Mo = { class: "ss-muted" }, Io = { class: "ba-job" }, Fo = { class: "ba-check" }, Uo = ["value"], Ro = { class: "ss-muted" }, Oo = { class: "ba-job" }, zo = { class: "ba-check" }, Po = { class: "ss-muted" }, Ko = { class: "ba-job" }, jo = { class: "ba-check" }, Wo = { class: "ba-check" }, Jo = { class: "ss-muted" }, qo = { class: "ba-job" }, Ho = { class: "ba-check" }, Go = { class: "ss-muted" }, Yo = { class: "ss-muted" }, xo = { class: "ba-job ba-job--cal" }, Qo = { class: "ba-check" }, Xo = { class: "ss-muted" }, Zo = { class: "ba-cal" }, ea = ["onUpdate:modelValue"], ta = ["onUpdate:modelValue"], la = ["onUpdate:modelValue"], na = { value: "holiday" }, sa = { value: "store_opening" }, oa = ["onClick"], aa = { class: "ss-actions" }, ia = ["disabled"], ra = ["disabled"], ca = { class: "ss-panel" }, da = { class: "ba-head" }, ua = {
  key: 0,
  class: "ss-empty"
}, ma = { class: "ba-log" }, pa = { class: "ss-chip" }, va = /* @__PURE__ */ e.defineComponent({
  __name: "ScheduleTab",
  setup(K) {
    const F = Y.useNotificationStore(), L = [n.t("周日"), n.t("周一"), n.t("周二"), n.t("周三"), n.t("周四"), n.t("周五"), n.t("周六")], k = e.reactive({
      dailyReport: { enabled: !1, time: "08:30", push: !0 },
      inventoryPatrol: { enabled: !1, time: "09:00" },
      weeklyVideo: { enabled: !1, weekday: 1, time: "10:00" },
      monthlyReport: { enabled: !1, day: 1, time: "09:30", push: !0 },
      newArrival: { enabled: !1 },
      calendar: { enabled: !1, leadDays: 3, days: [] },
      folderImport: { enabled: !1, time: "08:00" }
    });
    e.watch(() => l.baState.value?.settings.schedule, (b) => {
      b && Object.assign(k, JSON.parse(JSON.stringify(b)));
    }, { immediate: !0 });
    const _ = e.computed(() => JSON.stringify(k) !== JSON.stringify(l.baState.value?.settings.schedule)), U = e.computed(() => l.baState.value?.log || []), B = e.ref(!1);
    async function w() {
      try {
        await l.ba("settings.patch", { patch: { schedule: k } }), await l.refreshState(), F.success(n.t("已保存"));
      } catch (b) {
        F.error(l.errorMessage(b));
      }
    }
    async function A() {
      B.value = !0;
      try {
        _.value && await w(), await l.ba("schedule.runNow"), await l.refreshState();
      } catch (b) {
        F.error(l.errorMessage(b));
      } finally {
        B.value = !1;
      }
    }
    async function h() {
      await l.ba("log.clear").catch(() => {
      }), await l.refreshState();
    }
    return (b, o) => (e.openBlock(), e.createElementBlock("div", Eo, [
      e.createElementVNode("section", $o, [
        e.createElementVNode("header", _o, [
          e.createElementVNode("strong", null, [
            o[17] || (o[17] = e.createElementVNode(
              "i",
              { class: "ri-timer-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(b.$t("定时任务与模块联动")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            So,
            e.toDisplayString(b.$t("应用开着时每分钟检查一次，到点执行；错过的当天补跑一次")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Do, [
          e.createElementVNode("div", Bo, [
            e.createElementVNode("label", wo, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[0] || (o[0] = (d) => k.dailyReport.enabled = d),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, k.dailyReport.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(b.$t("经营日报")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(b.$t("每天")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[1] || (o[1] = (d) => k.dailyReport.time = d),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, k.dailyReport.time]
              ])
            ]),
            e.createElementVNode("label", Co, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[2] || (o[2] = (d) => k.dailyReport.push = d),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, k.dailyReport.push]
              ]),
              e.createTextVNode(
                e.toDisplayString(b.$t("生成后推送")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "small",
              To,
              e.toDisplayString(b.$t("模块 D：取昨天数据 → 指标 → 解读 → 推送店长")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Lo, [
            e.createElementVNode("label", Ao, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[3] || (o[3] = (d) => k.inventoryPatrol.enabled = d),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, k.inventoryPatrol.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(b.$t("库存巡检")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(b.$t("每天")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[4] || (o[4] = (d) => k.inventoryPatrol.time = d),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, k.inventoryPatrol.time]
              ])
            ]),
            e.createElementVNode(
              "small",
              Mo,
              e.toDisplayString(b.$t("模块 C：售罄下架（门店手机端）、断码 / 过季提醒")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Io, [
            e.createElementVNode("label", Fo, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[5] || (o[5] = (d) => k.weeklyVideo.enabled = d),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, k.weeklyVideo.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(b.$t("本周主推视频")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": o[6] || (o[6] = (d) => k.weeklyVideo.weekday = d)
                },
                [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(L, (d, D) => e.createElementVNode("option", {
                      key: D,
                      value: D
                    }, e.toDisplayString(d), 9, Uo)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelSelect,
                  k.weeklyVideo.weekday,
                  void 0,
                  { number: !0 }
                ]
              ]),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[7] || (o[7] = (d) => k.weeklyVideo.time = d),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, k.weeklyVideo.time]
              ])
            ]),
            e.createElementVNode(
              "small",
              Ro,
              e.toDisplayString(b.$t("模块 A：按上周销量前 3 款写好脚本，等你审核后成片发布（不会自动发出去）")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Oo, [
            e.createElementVNode("label", zo, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[8] || (o[8] = (d) => k.folderImport.enabled = d),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, k.folderImport.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(b.$t("共享文件夹取数")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(b.$t("每天")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[9] || (o[9] = (d) => k.folderImport.time = d),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, k.folderImport.time]
              ])
            ]),
            o[18] || (o[18] = e.createElementVNode(
              "span",
              null,
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "small",
              Po,
              e.toDisplayString(b.$t("模块 D：从「设置」里配置的文件夹取最新的销售 / 费用 / 库存表，排在日报之前；失败会提醒")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Ko, [
            e.createElementVNode("label", jo, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[10] || (o[10] = (d) => k.monthlyReport.enabled = d),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, k.monthlyReport.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(b.$t("经营月报")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(b.$t("每月 {n} 日", { n: k.monthlyReport.day })) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[11] || (o[11] = (d) => k.monthlyReport.time = d),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, k.monthlyReport.time]
              ])
            ]),
            e.createElementVNode("label", Wo, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[12] || (o[12] = (d) => k.monthlyReport.push = d),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, k.monthlyReport.push]
              ]),
              e.createTextVNode(
                e.toDisplayString(b.$t("生成后推送")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "small",
              Jo,
              e.toDisplayString(b.$t("模块 D：上月月报推送老板")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", qo, [
            e.createElementVNode("label", Ho, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[13] || (o[13] = (d) => k.newArrival.enabled = d),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, k.newArrival.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(b.$t("新品入库联动")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "span",
              Go,
              e.toDisplayString(b.$t("随时")),
              1
              /* TEXT */
            ),
            o[19] || (o[19] = e.createElementVNode(
              "span",
              null,
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "small",
              Yo,
              e.toDisplayString(b.$t("新款导入商品库后：模块 C 生成上架草稿、模块 A 写新品上新视频脚本，都等你审核")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", xo, [
            e.createElementVNode("label", Qo, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[14] || (o[14] = (d) => k.calendar.enabled = d),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, k.calendar.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(b.$t("节日 / 周年数字人")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(b.$t("提前")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[15] || (o[15] = (d) => k.calendar.leadDays = d),
                  type: "number",
                  min: "0",
                  max: "30",
                  class: "ba-num"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  k.calendar.leadDays,
                  void 0,
                  { number: !0 }
                ]
              ]),
              e.createTextVNode(
                " " + e.toDisplayString(b.$t("天")),
                1
                /* TEXT */
              )
            ]),
            o[22] || (o[22] = e.createElementVNode(
              "span",
              null,
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "small",
              Xo,
              e.toDisplayString(b.$t("模块 B：到日子前生成数字人祝福讲稿草稿，等你审核后成片发布")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Zo, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(k.calendar.days, (d, D) => (e.openBlock(), e.createElementBlock("span", {
                  key: D,
                  class: "ba-cal__day"
                }, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (y) => d.date = y,
                    type: "text",
                    placeholder: "MM-DD",
                    class: "ba-num"
                  }, null, 8, ea), [
                    [e.vModelText, d.date]
                  ]),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (y) => d.name = y,
                    type: "text"
                  }, null, 8, ta), [
                    [e.vModelText, d.name]
                  ]),
                  e.withDirectives(e.createElementVNode("select", {
                    "onUpdate:modelValue": (y) => d.topic = y
                  }, [
                    e.createElementVNode(
                      "option",
                      na,
                      e.toDisplayString(b.$t("节日")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      sa,
                      e.toDisplayString(b.$t("开业周年")),
                      1
                      /* TEXT */
                    )
                  ], 8, la), [
                    [e.vModelSelect, d.topic]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (y) => k.calendar.days.splice(D, 1)
                  }, [...o[20] || (o[20] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-close-line" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, oa)
                ]))),
                128
                /* KEYED_FRAGMENT */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                onClick: o[16] || (o[16] = (d) => k.calendar.days.push({ date: "", name: "", topic: "holiday" }))
              }, [
                o[21] || (o[21] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(b.$t("加一天（农历节日每年日期不同，请按当年日期填）")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])
        ]),
        e.createElementVNode("div", aa, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: !_.value,
            onClick: w
          }, [
            o[23] || (o[23] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(b.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, ia),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: B.value,
            onClick: A
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(B.value ? "ri-loader-4-line spin" : "ri-play-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(b.$t("立即执行一次已开启的任务")),
              1
              /* TEXT */
            )
          ], 8, ra)
        ])
      ]),
      e.createElementVNode("section", ca, [
        e.createElementVNode("header", da, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(b.$t("执行记录")),
            1
            /* TEXT */
          ),
          o[24] || (o[24] = e.createElementVNode(
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
              onClick: h
            },
            e.toDisplayString(b.$t("清空")),
            1
            /* TEXT */
          )
        ]),
        U.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "p",
          ua,
          e.toDisplayString(b.$t("暂无")),
          1
          /* TEXT */
        )),
        e.createElementVNode("ul", ma, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(U.value, (d, D) => (e.openBlock(), e.createElementBlock(
              "li",
              {
                key: D,
                class: e.normalizeClass({ bad: !d.ok })
              },
              [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(e.unref(l.fmtDateTime)(d.at)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  pa,
                  e.toDisplayString(d.module === "schedule" ? b.$t("定时") : e.unref(l.moduleTitle)(d.module)),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(d.text),
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
    ]));
  }
}), ya = /* @__PURE__ */ Q(va, [["__scopeId", "data-v-8729ccfc"]]), ha = {
  key: 0,
  class: "ba-set"
}, ka = { class: "ss-panel" }, Va = { class: "ba-head" }, ga = { class: "ss-grid" }, ba = { class: "ss-field" }, Na = { class: "ss-field" }, fa = { class: "ss-field" }, Ea = { class: "ss-muted" }, $a = { class: "ss-panel" }, _a = { class: "ba-head" }, Sa = { class: "ss-muted" }, Da = ["onClick"], Ba = ["onClick"], wa = { class: "ss-panel" }, Ca = { class: "ba-head" }, Ta = { class: "ss-table-wrap" }, La = { class: "ss-table" }, Aa = ["title"], Ma = ["onUpdate:modelValue"], Ia = ["onUpdate:modelValue"], Fa = ["onUpdate:modelValue"], Ua = ["onUpdate:modelValue"], Ra = ["onUpdate:modelValue"], Oa = ["checked", "onChange"], za = { class: "ss-panel" }, Pa = { class: "ba-head" }, Ka = { class: "ba-check" }, ja = { class: "ss-field" }, Wa = { class: "ba-seasons" }, Ja = { class: "ss-subhead" }, qa = ["value", "placeholder", "onChange"], Ha = { class: "ss-panel" }, Ga = { class: "ba-head" }, Ya = { class: "ba-ready" }, xa = { class: "ss-actions" }, Qa = ["disabled"], Xa = {
  key: 0,
  class: "ss-muted"
}, Za = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(K) {
    const F = Y.useNotificationStore(), L = e.computed(() => l.baState.value), k = e.reactive({}), _ = e.ref("");
    let U = null;
    const B = (y, v) => JSON.stringify(y) === JSON.stringify(v);
    e.watch(() => L.value?.settings, (y) => {
      if (!y) return;
      const v = JSON.parse(JSON.stringify(y)), N = U;
      for (const E of Object.keys(v))
        (!N || B(k[E], N[E])) && (k[E] = v[E]);
      (!N || _.value === N.coreSizes.join(",")) && (_.value = v.coreSizes.join(",")), U = v;
    }, { immediate: !0 });
    const w = e.computed(() => !!L.value && JSON.stringify({ ...k, coreSizes: d(_.value) }) !== JSON.stringify(L.value.settings)), A = [
      { key: "sales", label: n.t("销售明细") },
      { key: "expense", label: n.t("费用") },
      { key: "inventory", label: n.t("库存快照") }
    ];
    async function h(y) {
      const v = await l.ba("dirs.pick").catch(() => "");
      v && (k.dataFolders = { ...k.dataFolders, [y]: v });
    }
    function b(y, v) {
      if (v.checked && !window.confirm(n.t("打开「{p0}」全自动提交？数字员工填完后会直接提交上架 / 下架，不再等你确认。建议稳定运行两周后再打开。", { p0: y.name }))) {
        v.checked = !1;
        return;
      }
      y.autoSubmit = v.checked;
    }
    function o(y) {
      return [...new Set(y.split(/[,，\s]+/).map(Number).filter((v) => Number.isInteger(v) && v >= 1 && v <= 12))];
    }
    function d(y) {
      return y.split(/[,，\s]+/).map((v) => v.trim().toUpperCase()).filter(Boolean);
    }
    async function D() {
      try {
        await l.ba("settings.patch", { patch: { brandName: k.brandName, storeAddress: k.storeAddress, openingHours: k.openingHours, dataFolders: k.dataFolders, channels: k.channels, seasonMonths: k.seasonMonths, coreSizes: d(_.value), autoDelistLocal: k.autoDelistLocal } }), await l.refreshState(), F.success(n.t("已保存"));
      } catch (y) {
        F.error(l.errorMessage(y));
      }
    }
    return (y, v) => L.value ? (e.openBlock(), e.createElementBlock("div", ha, [
      e.createElementVNode("section", ka, [
        e.createElementVNode("header", Va, [
          e.createElementVNode("strong", null, [
            v[5] || (v[5] = e.createElementVNode(
              "i",
              { class: "ri-store-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(y.$t("品牌与输出")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", ga, [
          e.createElementVNode("label", ba, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(y.$t("品牌 / 门店名（视频顶部标题、报表抬头）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": v[0] || (v[0] = (N) => k.brandName = N),
                type: "text",
                maxlength: "30"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                k.brandName,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Na, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(y.$t("门店地址（数字人片尾）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": v[1] || (v[1] = (N) => k.storeAddress = N),
                type: "text",
                maxlength: "80"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                k.storeAddress,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", fa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(y.$t("营业时间（数字人片尾）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": v[2] || (v[2] = (N) => k.openingHours = N),
                type: "text",
                maxlength: "40"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                k.openingHours,
                void 0,
                { trim: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode(
          "p",
          Ea,
          e.toDisplayString(y.$t("输出目录：{p0}", { p0: L.value.outputDir })),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", $a, [
        e.createElementVNode("header", _a, [
          e.createElementVNode("strong", null, [
            v[6] || (v[6] = e.createElementVNode(
              "i",
              { class: "ri-folder-received-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(y.$t("共享文件夹取数")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode(
          "p",
          Sa,
          e.toDisplayString(y.$t("收银 / 进销存系统每天把报表导出到这些文件夹（或数字员工登录后台导出到这里），定时任务取最新一份；只读，不改原文件。")),
          1
          /* TEXT */
        ),
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(A, (N) => e.createElementVNode("div", {
            key: N.key,
            class: "ba-folder"
          }, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(N.label),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "code",
              null,
              e.toDisplayString(k.dataFolders?.[N.key] || y.$t("未设置")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm",
              onClick: (E) => h(N.key)
            }, [
              v[7] || (v[7] = e.createElementVNode(
                "i",
                { class: "ri-folder-open-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(y.$t("选择文件夹")),
                1
                /* TEXT */
              )
            ], 8, Da),
            k.dataFolders?.[N.key] ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-link",
              onClick: (E) => k.dataFolders[N.key] = ""
            }, e.toDisplayString(y.$t("清除")), 9, Ba)) : e.createCommentVNode("v-if", !0)
          ])),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      e.createElementVNode("section", wa, [
        e.createElementVNode("header", Ca, [
          e.createElementVNode("strong", null, [
            v[8] || (v[8] = e.createElementVNode(
              "i",
              { class: "ri-store-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(y.$t("上架渠道")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Ta, [
          e.createElementVNode("table", La, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("启用")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("渠道")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("商家后台地址")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("主图比例")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(y.$t("标题字数上限")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("th", {
                  title: y.$t("打开后数字员工填完直接提交，不再停在提交前；每次执行记为「自动执行」")
                }, e.toDisplayString(y.$t("全自动提交")), 9, Aa)
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(k.channels, (N) => (e.openBlock(), e.createElementBlock("tr", {
                  key: N.id
                }, [
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (E) => N.enabled = E,
                      type: "checkbox"
                    }, null, 8, Ma), [
                      [e.vModelCheckbox, N.enabled]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (E) => N.name = E,
                      type: "text"
                    }, null, 8, Ia), [
                      [
                        e.vModelText,
                        N.name,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (E) => N.url = E,
                      type: "text",
                      class: "ba-url"
                    }, null, 8, Fa), [
                      [
                        e.vModelText,
                        N.url,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("select", {
                      "onUpdate:modelValue": (E) => N.aspect = E
                    }, [...v[9] || (v[9] = [
                      e.createElementVNode(
                        "option",
                        { value: "1:1" },
                        "1:1",
                        -1
                        /* CACHED */
                      ),
                      e.createElementVNode(
                        "option",
                        { value: "3:4" },
                        "3:4",
                        -1
                        /* CACHED */
                      )
                    ])], 8, Ua), [
                      [e.vModelSelect, N.aspect]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (E) => N.titleMax = E,
                      type: "number",
                      min: "10",
                      max: "60"
                    }, null, 8, Ra), [
                      [
                        e.vModelText,
                        N.titleMax,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("input", {
                      type: "checkbox",
                      checked: !!N.autoSubmit,
                      onChange: (E) => b(N, E.target)
                    }, null, 40, Oa)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", za, [
        e.createElementVNode("header", Pa, [
          e.createElementVNode("strong", null, [
            v[10] || (v[10] = e.createElementVNode(
              "i",
              { class: "ri-scales-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(y.$t("上下架规则")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("label", Ka, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": v[3] || (v[3] = (N) => k.autoDelistLocal = N),
              type: "checkbox"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelCheckbox, k.autoDelistLocal]
          ]),
          e.createTextVNode(
            e.toDisplayString(y.$t("售罄时自动把门店试穿手机端下架（只动本机，网店下架要人确认）")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", ja, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(y.$t("主力尺码（这些尺码缺货算断码，逗号分隔）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": v[4] || (v[4] = (N) => _.value = N),
              type: "text"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, _.value]
          ])
        ]),
        e.createElementVNode("div", Wa, [
          e.createElementVNode(
            "span",
            Ja,
            e.toDisplayString(y.$t("季节在售月份（不在这些月份的款提醒过季）")),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(k.seasonMonths, (N, E) => (e.openBlock(), e.createElementBlock("label", {
              key: E,
              class: "ba-season"
            }, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(E),
                1
                /* TEXT */
              ),
              e.createElementVNode("input", {
                value: N.join(","),
                type: "text",
                placeholder: y.$t("如 5,6,7,8；留空表示四季都卖"),
                onChange: (S) => k.seasonMonths[E] = o(S.target.value)
              }, null, 40, qa)
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      e.createElementVNode("section", Ha, [
        e.createElementVNode("header", Ga, [
          e.createElementVNode("strong", null, [
            v[11] || (v[11] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(y.$t("能力就绪")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("ul", Ya, [
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", L.value.ready.ffmpeg ? "ok" : "bad"])
              },
              "ffmpeg",
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(y.$t("短视频成片")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", L.value.ready.image ? "ok" : "warn"])
              },
              e.toDisplayString(y.$t("图像 / 语音服务")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(y.$t("高保真配音；没有时用标准音色")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", L.value.ready.digitalHuman ? "ok" : "warn"])
              },
              e.toDisplayString(y.$t("数字人服务")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(y.$t("在「数字人工作台 → 配置」设置")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", L.value.ready.knowledge ? "ok" : "warn"])
              },
              e.toDisplayString(y.$t("知识库")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(y.$t("数字人讲稿的公司资料来源")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", L.value.ready.push ? "ok" : "warn"])
              },
              e.toDisplayString(y.$t("推送渠道")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(y.$t("在「设置 → 通知与推送」配置")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createElementVNode("div", xa, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: !w.value,
          onClick: D
        }, [
          v[12] || (v[12] = e.createElementVNode(
            "i",
            { class: "ri-save-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(y.$t("保存设置")),
            1
            /* TEXT */
          )
        ], 8, Qa),
        w.value ? (e.openBlock(), e.createElementBlock(
          "span",
          Xa,
          e.toDisplayString(y.$t("有未保存的修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), ei = /* @__PURE__ */ Q(Za, [["__scopeId", "data-v-60385293"]]), ti = { class: "ba-hist" }, li = { class: "ss-kpis" }, ni = { class: "ss-kpi" }, si = { class: "ss-kpi accent" }, oi = { class: "ss-kpi" }, ai = { class: "ss-kpi" }, ii = { class: "ss-panel" }, ri = { class: "ba-hist__bar" }, ci = {
  class: "ba-hist__filters",
  role: "tablist"
}, di = ["aria-selected", "onClick"], ui = ["placeholder"], mi = {
  key: 0,
  class: "ss-empty"
}, pi = ["onClick", "onKeydown"], vi = { class: "ba-hist__thumb" }, yi = ["src"], hi = {
  key: 1,
  class: "ri-film-line"
}, ki = {
  key: 2,
  class: "ba-hist__dur"
}, Vi = { class: "ba-hist__main" }, gi = { class: "ba-hist__title" }, bi = { class: "ss-chip" }, Ni = { class: "ba-hist__meta" }, fi = { key: 0 }, Ei = { key: 1 }, $i = {
  key: 0,
  class: "ba-hist__plats"
}, _i = {
  key: 1,
  class: "ss-muted ba-hist__note"
}, Si = ["onClick"], Di = ["onClick"], Bi = {
  key: 0,
  class: "ba-hist__detail"
}, wi = { class: "ba-hist__cols" }, Ci = { class: "ba-hist__col" }, Ti = { class: "ss-subhead" }, Li = { class: "ba-hist__tl" }, Ai = {
  key: 0,
  class: "ss-muted"
}, Mi = { class: "ba-hist__col" }, Ii = { class: "ss-subhead" }, Fi = ["src"], Ui = { class: "ss-subhead" }, Ri = {
  key: 1,
  class: "ss-muted"
}, Oi = { class: "ba-hist__runhead" }, zi = { class: "ss-muted" }, Pi = { class: "ba-hist__receipts" }, Ki = ["onClick"], ji = {
  key: 1,
  class: "ss-muted"
}, Wi = {
  key: 0,
  class: "ss-muted"
}, Ji = { class: "ss-subhead" }, qi = { class: "ss-table-wrap" }, Hi = { class: "ss-table" }, Gi = { class: "num" }, Yi = { class: "num" }, xi = { class: "num" }, Qi = { class: "num" }, Xi = { class: "num" }, Zi = { class: "num" }, er = { class: "num" }, tr = { class: "num" }, lr = { class: "ss-subhead" }, nr = {
  key: 0,
  class: "ss-muted"
}, sr = /* @__PURE__ */ e.defineComponent({
  __name: "HistoryTab",
  emits: ["goto"],
  setup(K) {
    const F = [
      { key: "all", label: n.t("全部") },
      { key: "published", label: n.t("已发布") },
      { key: "active", label: n.t("进行中") },
      { key: "failed", label: n.t("失败 / 未发成") }
    ], L = e.ref("all"), k = e.ref(""), _ = e.ref(""), U = e.computed(() => l.baState.value?.videos || []);
    function B(u) {
      const p = [u.createdAt, u.updatedAt, u.publishedAt, u.history?.[u.history.length - 1]?.at].map((i) => Date.parse(i || "")).filter(Number.isFinite);
      return p.length ? Math.max(...p) : 0;
    }
    function w(u) {
      const p = y(u);
      return u.status === "failed" || u.status !== "published" && !!p && !p.published.length;
    }
    function A(u, p) {
      return p === "published" ? u.status === "published" : p === "failed" ? w(u) : p === "active" ? u.status !== "published" && !w(u) : !0;
    }
    function h(u) {
      return U.value.filter((p) => A(p, u)).length;
    }
    const b = e.computed(() => {
      const u = k.value.trim().toLowerCase();
      return U.value.filter((p) => A(p, L.value)).filter((p) => !u || [p.name, p.brief, ...Object.values(p.copies).flatMap((i) => [i?.title, i?.caption])].join(`
`).toLowerCase().includes(u)).sort((p, i) => B(i) - B(p));
    }), o = e.computed(() => {
      let u = 0, p = 0, i = 0;
      for (const s of U.value)
        s.status === "published" && u++, p += (s.publishRuns || []).reduce((f, $) => f + $.published.length, 0), i += Object.values(s.stats || {}).reduce((f, $) => f + ($?.plays || 0), 0);
      return { published: u, platformPosts: p, plays: i };
    });
    function d(u) {
      _.value = _.value === u ? "" : u;
    }
    function D(u) {
      return u.scenes[0]?.image || u.materials[0];
    }
    function y(u) {
      return u.publishRuns?.[u.publishRuns.length - 1];
    }
    function v(u) {
      return u.split(/[\\/]/).pop() || u;
    }
    function N(u) {
      window.electronAPI?.openExternal?.(u) ?? window.open(u, "_blank");
    }
    function E(u) {
      return { draft: n.t("草稿"), scripted: n.t("已写脚本"), rendering: n.t("成片中"), rendered: n.t("已成片"), approved: n.t("已审核"), publishing: n.t("发布中"), published: n.t("已发布"), failed: n.t("失败") }[u] || u;
    }
    function S(u) {
      return u === "published" ? "ok" : u === "failed" ? "bad" : u === "publishing" || u === "rendering" ? "warn" : "brand";
    }
    function T(u) {
      return u.outcome === "cancelled" ? n.t("发布已取消") : u.published.length ? n.t("发布成功 {n} 个平台", { n: u.published.length }) : u.outcome === "failed" ? n.t("发布工作流失败") : n.t("没有平台发成功");
    }
    const C = { douyin: n.t("抖音"), kuaishou: n.t("快手"), xiaohongshu: n.t("小红书"), wxchannels: n.t("视频号") };
    function M(u) {
      const p = new Map(u.receipts.map((s) => [s.platform, s])), i = (s) => C[s] || s;
      return [
        ...u.published.map((s) => ({ platform: s, label: n.t("{p0} 已发布", { p0: i(s) }), tone: "ok", url: p.get(s)?.url })),
        ...u.unconfirmed.map((s) => ({ platform: s, label: n.t("{p0} 待核对", { p0: i(s) }), tone: "warn", url: p.get(s)?.url, error: p.get(s)?.error })),
        ...u.failed.map((s) => ({ platform: s, label: n.t("{p0} 未发成", { p0: i(s) }), tone: "bad", error: p.get(s)?.error }))
      ];
    }
    const R = {
      create: n.t("创建"),
      material: n.t("素材"),
      script: n.t("脚本与文案"),
      edit: n.t("修改"),
      render: n.t("成片"),
      approve: n.t("审核"),
      schedule: n.t("定时"),
      publish: n.t("发布"),
      stats: n.t("数据回收")
    }, j = {
      create: "ri-add-circle-line",
      material: "ri-image-add-line",
      script: "ri-quill-pen-line",
      edit: "ri-edit-line",
      render: "ri-film-line",
      approve: "ri-shield-check-line",
      schedule: "ri-timer-line",
      publish: "ri-send-plane-line",
      stats: "ri-bar-chart-2-line"
    };
    function H(u) {
      return R[u] || u;
    }
    function P(u) {
      return j[u] || "ri-checkbox-blank-circle-line";
    }
    function W(u) {
      if (u.history?.length) return [...u.history].reverse();
      const p = [{ at: u.createdAt, step: "create", text: n.t("创建项目：{p0}", { p0: l.videoTypeLabel(u.type) }), ok: !0 }];
      u.scenes.length && p.push({ at: u.createdAt, step: "script", text: n.t("写好分镜脚本 {n} 个镜头", { n: u.scenes.length }), ok: !0 }), u.video && p.push({ at: u.approvedAt || u.updatedAt || u.createdAt, step: "render", text: n.t("成片：{f}", { f: v(u.video) }), ok: !0 }), u.approvedAt && p.push({ at: u.approvedAt, step: "approve", text: n.t("审核通过"), ok: !0 }), u.publishedAt && p.push({ at: u.publishedAt, step: "publish", text: u.publishRunNote || n.t("已发布"), ok: !0 });
      for (const i of u.platforms) {
        const s = u.stats?.[i];
        s && p.push({ at: s.at, step: "stats", text: n.t("{p0} 数据：播放 {a} · 点赞 {b}", { p0: l.platformLabel(i), a: s.plays, b: s.likes }), ok: !0 });
      }
      return p.sort((i, s) => Date.parse(s.at) - Date.parse(i.at));
    }
    return (u, p) => (e.openBlock(), e.createElementBlock("div", ti, [
      e.createElementVNode("div", li, [
        e.createElementVNode("div", ni, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("视频项目")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(U.value.length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", si, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("已发布")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(o.value.published),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", oi, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("平台发布成功（次）")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(o.value.platformPosts),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ai, [
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(u.$t("累计播放")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(o.value.plays),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("section", ii, [
        e.createElementVNode("header", ri, [
          e.createElementVNode("div", ci, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(F, (i) => e.createElementVNode("button", {
                key: i.key,
                type: "button",
                role: "tab",
                class: e.normalizeClass(["ba-hist__f", { on: L.value === i.key }]),
                "aria-selected": L.value === i.key,
                onClick: (s) => L.value = i.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(i.label),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(h(i.key)),
                  1
                  /* TEXT */
                )
              ], 10, di)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": p[0] || (p[0] = (i) => k.value = i),
            type: "search",
            class: "ba-hist__q",
            placeholder: u.$t("按名称 / 商品 / 文案搜索")
          }, null, 8, ui), [
            [e.vModelText, k.value]
          ])
        ]),
        b.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "p",
          mi,
          e.toDisplayString(U.value.length ? u.$t("没有符合条件的记录") : u.$t("还没有视频项目。在「短视频发布」或「数字人介绍」里做完的视频，每一步都会记在这里。")),
          1
          /* TEXT */
        )),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(b.value, (i) => (e.openBlock(), e.createElementBlock(
            "article",
            {
              key: i.id,
              class: e.normalizeClass(["ba-hist__item", { open: _.value === i.id }])
            },
            [
              e.createElementVNode("div", {
                class: "ba-hist__row",
                role: "button",
                tabindex: "0",
                onClick: (s) => d(i.id),
                onKeydown: e.withKeys((s) => d(i.id), ["enter"])
              }, [
                e.createElementVNode("div", vi, [
                  D(i) ? (e.openBlock(), e.createElementBlock("img", {
                    key: 0,
                    src: e.unref(l.fileUrl)(D(i)),
                    alt: "",
                    loading: "lazy"
                  }, null, 8, yi)) : (e.openBlock(), e.createElementBlock("i", hi)),
                  i.durationSec ? (e.openBlock(), e.createElementBlock(
                    "span",
                    ki,
                    e.toDisplayString(u.$t("{s} 秒", { s: i.durationSec })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", Vi, [
                  e.createElementVNode("div", gi, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(i.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", S(i.status)])
                      },
                      e.toDisplayString(E(i.status)),
                      3
                      /* TEXT, CLASS */
                    ),
                    e.createElementVNode(
                      "span",
                      bi,
                      e.toDisplayString(e.unref(l.videoTypeLabel)(i.type)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Ni, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(u.$t("创建 {p0}", { p0: e.unref(l.fmtDateTime)(i.createdAt) })),
                      1
                      /* TEXT */
                    ),
                    i.publishedAt ? (e.openBlock(), e.createElementBlock(
                      "span",
                      fi,
                      e.toDisplayString(u.$t("发布 {p0}", { p0: e.unref(l.fmtDateTime)(i.publishedAt) })),
                      1
                      /* TEXT */
                    )) : i.updatedAt ? (e.openBlock(), e.createElementBlock(
                      "span",
                      Ei,
                      e.toDisplayString(u.$t("最近更新 {p0}", { p0: e.unref(l.fmtDateTime)(i.updatedAt) })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(i.platforms.map(e.unref(l.platformLabel)).join(" / ")),
                      1
                      /* TEXT */
                    )
                  ]),
                  y(i) ? (e.openBlock(), e.createElementBlock("div", $i, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(M(y(i)), (s) => (e.openBlock(), e.createElementBlock(
                        "span",
                        {
                          key: s.platform,
                          class: e.normalizeClass(["ss-chip", s.tone])
                        },
                        e.toDisplayString(s.label),
                        3
                        /* TEXT, CLASS */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : i.publishRunNote ? (e.openBlock(), e.createElementBlock(
                    "p",
                    _i,
                    e.toDisplayString(i.publishRunNote),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", {
                  class: "ba-hist__ops",
                  onClick: p[1] || (p[1] = e.withModifiers(() => {
                  }, ["stop"]))
                }, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    onClick: (s) => u.$emit("goto", "video", { id: i.id })
                  }, [
                    p[2] || (p[2] = e.createElementVNode(
                      "i",
                      { class: "ri-external-link-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(u.$t("打开项目")),
                      1
                      /* TEXT */
                    )
                  ], 8, Si),
                  i.video ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: (s) => e.unref(l.openPath)(i.video, !0)
                  }, [
                    p[3] || (p[3] = e.createElementVNode(
                      "i",
                      { class: "ri-folder-open-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(u.$t("所在文件夹")),
                      1
                      /* TEXT */
                    )
                  ], 8, Di)) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(["ba-hist__chev", _.value === i.id ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"])
                    },
                    null,
                    2
                    /* CLASS */
                  )
                ])
              ], 40, pi),
              _.value === i.id ? (e.openBlock(), e.createElementBlock("div", Bi, [
                e.createElementVNode("div", wi, [
                  e.createElementVNode("div", Ci, [
                    e.createElementVNode(
                      "span",
                      Ti,
                      e.toDisplayString(u.$t("节点记录")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("ol", Li, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(W(i), (s, f) => (e.openBlock(), e.createElementBlock(
                          "li",
                          {
                            key: f,
                            class: e.normalizeClass({ bad: !s.ok })
                          },
                          [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(P(s.step))
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createElementVNode("div", null, [
                              e.createElementVNode(
                                "b",
                                null,
                                e.toDisplayString(H(s.step)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(e.unref(l.fmtDateTime)(s.at)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "p",
                                null,
                                e.toDisplayString(s.text),
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
                    i.history?.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                      "p",
                      Ai,
                      e.toDisplayString(u.$t("这条视频做于留痕功能上线前，节点记录按已有时间还原，不含失败记录。")),
                      1
                      /* TEXT */
                    ))
                  ]),
                  e.createElementVNode("div", Mi, [
                    i.video ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 0 },
                      [
                        e.createElementVNode(
                          "span",
                          Ii,
                          e.toDisplayString(u.$t("成片")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("video", {
                          src: e.unref(l.fileUrl)(i.video),
                          controls: "",
                          playsinline: "",
                          preload: "metadata",
                          class: "ba-hist__video"
                        }, null, 8, Fi)
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "span",
                      Ui,
                      e.toDisplayString(u.$t("发布记录")),
                      1
                      /* TEXT */
                    ),
                    i.publishRuns?.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                      "p",
                      Ri,
                      e.toDisplayString(i.status === "published" ? u.$t("已人工确认发布（没有平台回执）") : u.$t("还没有发布记录")),
                      1
                      /* TEXT */
                    )),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList([...i.publishRuns || []].reverse(), (s, f) => (e.openBlock(), e.createElementBlock("div", {
                        key: s.runId || f,
                        class: "ba-hist__run"
                      }, [
                        e.createElementVNode("div", Oi, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", s.published.length ? "ok" : s.outcome === "cancelled" ? "" : "bad"])
                            },
                            e.toDisplayString(T(s)),
                            3
                            /* TEXT, CLASS */
                          ),
                          e.createElementVNode(
                            "small",
                            zi,
                            e.toDisplayString(e.unref(l.fmtDateTime)(s.at)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("ul", Pi, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(M(s), ($) => (e.openBlock(), e.createElementBlock("li", {
                              key: $.platform
                            }, [
                              e.createElementVNode(
                                "span",
                                {
                                  class: e.normalizeClass(["ss-chip", $.tone])
                                },
                                e.toDisplayString($.label),
                                3
                                /* TEXT, CLASS */
                              ),
                              $.url ? (e.openBlock(), e.createElementBlock("a", {
                                key: 0,
                                href: "#",
                                class: "ss-link",
                                onClick: e.withModifiers((z) => N($.url), ["prevent"])
                              }, e.toDisplayString(u.$t("查看作品")), 9, Ki)) : e.createCommentVNode("v-if", !0),
                              $.error ? (e.openBlock(), e.createElementBlock(
                                "small",
                                ji,
                                e.toDisplayString($.error),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ]),
                        s.videoFile && s.videoFile !== i.video ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Wi,
                          e.toDisplayString(u.$t("当时发布的成片：{p0}", { p0: v(s.videoFile) })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    i.stats && Object.keys(i.stats).length ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 2 },
                      [
                        e.createElementVNode(
                          "span",
                          Ji,
                          e.toDisplayString(u.$t("平台数据")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", qi, [
                          e.createElementVNode("table", Hi, [
                            e.createElementVNode("thead", null, [
                              e.createElementVNode("tr", null, [
                                e.createElementVNode(
                                  "th",
                                  null,
                                  e.toDisplayString(u.$t("平台")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Gi,
                                  e.toDisplayString(u.$t("播放")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Yi,
                                  e.toDisplayString(u.$t("点赞")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  xi,
                                  e.toDisplayString(u.$t("评论")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Qi,
                                  e.toDisplayString(u.$t("分享")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  null,
                                  e.toDisplayString(u.$t("记录于")),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ]),
                            e.createElementVNode("tbody", null, [
                              (e.openBlock(!0), e.createElementBlock(
                                e.Fragment,
                                null,
                                e.renderList(i.platforms.filter((s) => i.stats?.[s]), (s) => (e.openBlock(), e.createElementBlock("tr", { key: s }, [
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(e.unref(l.platformLabel)(s)),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    Xi,
                                    e.toDisplayString(i.stats[s].plays),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    Zi,
                                    e.toDisplayString(i.stats[s].likes),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    er,
                                    e.toDisplayString(i.stats[s].comments),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    tr,
                                    e.toDisplayString(i.stats[s].shares),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(e.unref(l.fmtDateTime)(i.stats[s].at)),
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
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0),
                    Object.keys(i.copies).length ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 3 },
                      [
                        e.createElementVNode(
                          "span",
                          lr,
                          e.toDisplayString(u.$t("发布文案")),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(i.platforms.filter((s) => i.copies[s]), (s) => (e.openBlock(), e.createElementBlock("div", {
                            key: s,
                            class: "ba-hist__copy"
                          }, [
                            e.createElementVNode(
                              "b",
                              null,
                              e.toDisplayString(e.unref(l.platformLabel)(s)) + " · " + e.toDisplayString(i.copies[s].title),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "p",
                              null,
                              e.toDisplayString(i.copies[s].caption),
                              1
                              /* TEXT */
                            ),
                            i.copies[s].topics.length ? (e.openBlock(), e.createElementBlock(
                              "small",
                              nr,
                              e.toDisplayString(i.copies[s].topics.map((f) => "#" + f).join(" ")),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])
                ])
              ])) : e.createCommentVNode("v-if", !0)
            ],
            2
            /* CLASS */
          ))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]));
  }
}), or = /* @__PURE__ */ Q(sr, [["__scopeId", "data-v-98085cb3"]]), ie = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useDialog.ts"];
if (!ie) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useDialog.ts");
ie.default;
const ar = { class: "ba-workbench" }, ir = { class: "workbench-header" }, rr = { class: "heading" }, cr = { class: "eyebrow" }, dr = { class: "subtitle" }, ur = { class: "header-actions" }, mr = ["disabled"], pr = ["disabled"], vr = ["disabled"], yr = {
  key: 0,
  class: "ba-bar"
}, hr = {
  key: 0,
  class: "ss-chip warn",
  "data-test": "ba-demo-chip"
}, kr = { class: "ss-muted" }, Vr = { class: "ba-bar__rule" }, gr = { class: "no" }, br = { class: "yes" }, Nr = {
  class: "ba-tabs",
  role: "tablist"
}, fr = ["aria-selected", "onClick"], Er = {
  key: 0,
  class: "ba-badge"
}, $r = ["onClick"], _r = {
  key: 1,
  class: "ss-note info ba-progress"
}, Sr = {
  key: 2,
  class: "ba-body"
}, Dr = {
  key: 7,
  class: "ba-ov"
}, Br = { class: "ss-panel" }, wr = { class: "ba-ov__cards" }, Cr = ["onClick"], Tr = { class: "ss-muted" }, Lr = { class: "ss-panel" }, Ar = { class: "ba-list" }, Mr = { class: "ss-panel" }, Ir = { class: "ba-list" }, Fr = {
  key: 3,
  class: "ss-note danger"
}, Ur = {
  key: 4,
  class: "ss-note"
}, re = "totalclaw:biz-automation-tab:v1", Rr = /* @__PURE__ */ e.defineComponent({
  __name: "BizAutomationWorkbenchView",
  setup(K) {
    const F = [
      { key: "video", icon: "ri-movie-2-line", title: n.t("短视频发布") },
      { key: "avatar", icon: "ri-user-voice-line", title: n.t("数字人介绍") },
      { key: "listing", icon: "ri-store-3-line", title: n.t("商品上下架") },
      { key: "finance", icon: "ri-line-chart-line", title: n.t("经营数据") },
      { key: "schedule", icon: "ri-timer-line", title: n.t("定时与联动") },
      { key: "history", icon: "ri-history-line", title: n.t("历史记录") },
      { key: "overview", icon: "ri-book-open-line", title: n.t("方案说明") },
      { key: "settings", icon: "ri-settings-3-line", title: n.t("设置") }
    ], L = [
      { key: "video", icon: "ri-movie-2-line", title: n.t("短视频发布"), text: n.t("商品图、试穿图 → 脚本与各平台文案 → 配音字幕成片 → 审核 → 抖音 / 快手 / 小红书 / 视频号") },
      { key: "avatar", icon: "ri-user-voice-line", title: n.t("数字人介绍"), text: n.t("知识库资料写讲稿，数字人口播成片，进入发布") },
      { key: "listing", icon: "ri-store-3-line", title: n.t("商品上下架"), text: n.t("按渠道生成图文，数字员工在网店后台上架；售罄、断码、过季按规则处理") },
      { key: "finance", icon: "ri-line-chart-line", title: n.t("经营数据"), text: n.t("导入收银 / 费用数据，规则算指标，模型写解读并回核，日报定时推送") }
    ];
    function k() {
      try {
        const p = localStorage.getItem(re);
        return F.some((i) => i.key === p) ? p : "overview";
      } catch {
        return "overview";
      }
    }
    const _ = l.baState, U = e.computed(() => l.baGarments.value), B = e.ref(k()), w = e.reactive({}), A = e.ref(!1), h = e.ref(!1), b = e.ref(""), o = e.computed(() => l.baProgress[B.value] || ""), d = e.computed(() => (_.value?.videos || []).filter((p) => p.publishDue && p.status === "approved")), D = ee.useRouter(), y = Y.useNotificationStore();
    async function v(p) {
      try {
        const i = await l.ba("video.publishInput", { id: p });
        await l.startPublishWorkflow(i, p), await D.push({ path: "/workflow" });
      } catch (i) {
        y.error(l.errorMessage(i));
      }
    }
    function N(p) {
      const i = _.value;
      if (!i) return "";
      if (p === "listing") {
        const s = i.ruleHits.filter((f) => f.rule === "soldout" || f.rule === "broken_size").length;
        return s ? String(s) : "";
      }
      if (p === "video") {
        const s = i.videos.filter((f) => f.status === "rendered" || f.status === "scripted").length;
        return s ? String(s) : "";
      }
      return "";
    }
    function E(p) {
      B.value = p;
      try {
        localStorage.setItem(re, p);
      } catch {
      }
    }
    function S(p, i) {
      F.some((s) => s.key === p) && (w[p] = { ...i || {}, at: Date.now() }, E(p));
    }
    const T = ie.useDialog(), C = e.ref(!1), M = e.computed(() => {
      const p = _.value?.demo;
      return !!p && p.videos + p.avatars + p.listings + p.sales + p.reports > 0;
    });
    async function R() {
      if (await T.confirm({
        title: M.value ? n.t("重新生成演示数据") : n.t("演示模式"),
        message: n.t(`生成一整套示例数据，六个页签都能直接演示：短视频 4 个（含已发布、待定时发布）、数字人讲稿 2 份、上架记录 8 条、近 60 天收银与费用数据和日报 / 月报。商品库里没有演示商品时，会连带生成服装AI试衣的演示数据。
全部在本机生成，不调用 AI、不发布、不推送；门店自己的数据不受影响，随时可以一键清除。`),
        confirmLabel: n.t("生成")
      })) {
        C.value = !0;
        try {
          await l.ba("demo.seed"), await l.refreshState(), y.success(n.t("演示数据已生成"));
        } catch (i) {
          y.error(l.errorMessage(i));
        } finally {
          C.value = !1;
        }
      }
    }
    async function j() {
      if (await T.confirm({ title: n.t("清除演示数据"), message: n.t("只删除演示模式生成的视频、讲稿、上架记录、收银与费用数据和报表；门店自己的数据不受影响。服装AI试衣的演示商品在那个页面单独清除。"), confirmLabel: n.t("清除"), danger: !0 })) {
        C.value = !0;
        try {
          await l.ba("demo.clear"), await l.refreshState(), y.success(n.t("演示数据已清除"));
        } catch (i) {
          y.error(l.errorMessage(i));
        } finally {
          C.value = !1;
        }
      }
    }
    async function H() {
      h.value = !0;
      try {
        const p = await l.consumePublishResult().catch(() => !1);
        await Promise.all([l.refreshState(), l.loadModels()]), p && y.info(n.t("发布结果已记入历史记录")), A.value = !0, b.value = "";
      } catch (p) {
        b.value = l.errorMessage(p);
      } finally {
        h.value = !1;
      }
    }
    let P = null;
    const W = {};
    let u = null;
    return e.onMounted(() => {
      H(), u = l.onBaEvent((p) => {
        if (p.type === "publish-due" && p.payload?.id) {
          v(String(p.payload.id));
          return;
        }
        if (p.type === "progress" && p.payload?.key) {
          const i = String(p.payload.key);
          l.baProgress[i] = String(p.payload.message || ""), clearTimeout(W[i]), W[i] = setTimeout(() => {
            l.baProgress[i] = "";
          }, 2e4);
          return;
        }
        P || (P = setTimeout(() => {
          P = null, l.refreshState().catch(() => {
          });
        }, 250));
      });
    }), e.onBeforeUnmount(() => {
      u?.(), P && clearTimeout(P);
      for (const p of Object.values(W)) clearTimeout(p);
    }), (p, i) => (e.openBlock(), e.createElementBlock("div", ar, [
      e.createElementVNode("header", ir, [
        e.createElementVNode("div", rr, [
          e.createVNode(me),
          i[0] || (i[0] = e.createElementVNode(
            "span",
            { class: "heading-icon" },
            [
              e.createElementVNode("i", { class: "ri-rocket-2-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "p",
              cr,
              e.toDisplayString(p.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(p.$t("经营自动化智能体")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              dr,
              e.toDisplayString(p.$t("短视频发自媒体、数字人介绍企业、商品图文上下架、经营数据自动统计推送。发布与上架默认停在提交前由你确认，数字全部由规则计算，财务数据只读。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", ur, [
          e.createCommentVNode(" 演示模式：六个页签一键造好示例数据（本机生成、不调用 AI、不发布、不推送）；旧版 App 没有这个动作就不显示 "),
          e.unref(_)?.demo ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              M.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                class: "ss-btn",
                disabled: C.value,
                "data-test": "ba-demo-clear",
                onClick: j
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(C.value ? "ri-loader-4-line spin" : "ri-delete-bin-6-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(p.$t("清除演示数据")),
                  1
                  /* TEXT */
                )
              ], 8, mr)) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("button", {
                class: e.normalizeClass(["ss-btn", { primary: !M.value }]),
                disabled: C.value,
                "data-test": "ba-demo-seed",
                onClick: R
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(C.value ? "ri-loader-4-line spin" : "ri-slideshow-3-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(M.value ? p.$t("重新生成演示数据") : p.$t("演示模式")),
                  1
                  /* TEXT */
                )
              ], 10, pr)
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: h.value,
            onClick: H
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(h.value ? "ri-loader-4-line spin" : "ri-refresh-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(p.$t("刷新")),
              1
              /* TEXT */
            )
          ], 8, vr)
        ])
      ]),
      e.unref(_) ? (e.openBlock(), e.createElementBlock("section", yr, [
        e.createElementVNode("span", null, [
          i[1] || (i[1] = e.createElementVNode(
            "i",
            { class: "ri-store-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(e.unref(_).settings.brandName || p.$t("未设置品牌名")),
            1
            /* TEXT */
          )
        ]),
        M.value ? (e.openBlock(), e.createElementBlock("span", hr, [
          i[2] || (i[2] = e.createElementVNode(
            "i",
            { class: "ri-slideshow-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(p.$t("含演示数据")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode(
          "span",
          kr,
          e.toDisplayString(p.$t("商品 {a} · 视频 {b} · 上架 {c} · 销售数据 {d} 行", { a: U.value.length, b: e.unref(_).videos.length, c: e.unref(_).listings.filter((s) => s.status === "listed").length, d: e.unref(_).salesRows })),
          1
          /* TEXT */
        ),
        e.createElementVNode("p", Vr, [
          e.createElementVNode("span", gr, [
            i[3] || (i[3] = e.createElementVNode(
              "i",
              { class: "ri-close-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(p.$t("模型不算钱、不改财务数据、不擅自提交")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", br, [
            i[4] || (i[4] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(p.$t("发布 / 上架停在提交前由你确认")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("nav", Nr, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(F, (s) => e.createElementVNode("button", {
            key: s.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["ba-tab", { active: B.value === s.key }]),
            "aria-selected": B.value === s.key,
            onClick: (f) => E(s.key)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(s.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(s.title),
              1
              /* TEXT */
            ),
            N(s.key) ? (e.openBlock(), e.createElementBlock(
              "em",
              Er,
              e.toDisplayString(N(s.key)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, fr)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(d.value, (s) => (e.openBlock(), e.createElementBlock("p", {
          key: s.id,
          class: "ss-note warn"
        }, [
          i[5] || (i[5] = e.createElementVNode(
            "i",
            { class: "ri-timer-flash-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(p.$t("「{p0}」到了定时发布时间", { p0: s.name })),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            onClick: (f) => v(s.id)
          }, e.toDisplayString(p.$t("立即发布")), 9, $r)
        ]))),
        128
        /* KEYED_FRAGMENT */
      )),
      o.value ? (e.openBlock(), e.createElementBlock("p", _r, [
        i[6] || (i[6] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(o.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      A.value ? (e.openBlock(), e.createElementBlock("div", Sr, [
        B.value === "video" ? (e.openBlock(), e.createBlock(pl, {
          key: 0,
          focus: w.video || null
        }, null, 8, ["focus"])) : B.value === "avatar" ? (e.openBlock(), e.createBlock(en, {
          key: 1,
          onGoto: S
        })) : B.value === "listing" ? (e.openBlock(), e.createBlock(es, { key: 2 })) : B.value === "finance" ? (e.openBlock(), e.createBlock(fo, { key: 3 })) : B.value === "schedule" ? (e.openBlock(), e.createBlock(ya, { key: 4 })) : B.value === "history" ? (e.openBlock(), e.createBlock(or, {
          key: 5,
          onGoto: S
        })) : B.value === "settings" ? (e.openBlock(), e.createBlock(ei, { key: 6 })) : (e.openBlock(), e.createElementBlock("div", Dr, [
          e.createElementVNode("section", Br, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(p.$t("四个模块，一个商品库")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", wr, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(L, (s) => e.createElementVNode("button", {
                  key: s.key,
                  type: "button",
                  class: "ba-ov__card",
                  onClick: (f) => E(s.key)
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(s.icon)
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(s.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.text),
                    1
                    /* TEXT */
                  )
                ], 8, Cr)),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode(
              "p",
              Tr,
              e.toDisplayString(p.$t("商品库在「服装AI试衣」里维护（导入、AI 打标签、尺码库存）；试穿图会自动成为短视频与上架图的素材。")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("section", Lr, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(p.$t("三条红线")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Ar, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(p.$t("钱和数字不交给模型算：营业额、毛利、库存、价格全部由规则计算；模型只写解读与文案，写出来的数字回原数据核对")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(p.$t("对外发布与上下架有人工闸门：发布视频、上架、改价默认停在提交前等你确认，每次执行都留痕")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(p.$t("财务数据只读：只导入、只统计，不写回收银或财务系统")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", Mr, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(p.$t("合规")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Ir, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(p.$t("数字人视频画面带「AI 生成」标识，发布文案末尾注明；使用真人形象须本人书面授权")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(p.$t("脚本、标题、讲稿自动检查广告法极限词；活动信息里没有的价格 / 折扣会被标出来")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(p.$t("平台账号由你在内置浏览器登录，系统不保存密码；按人的节奏操作，建议每账号每天发布不超过 3 条")),
                1
                /* TEXT */
              )
            ])
          ])
        ]))
      ])) : b.value ? (e.openBlock(), e.createElementBlock("p", Fr, [
        i[7] || (i[7] = e.createElementVNode(
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
      ])) : (e.openBlock(), e.createElementBlock("p", Ur, [
        i[8] || (i[8] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(p.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), Or = /* @__PURE__ */ Q(Rr, [["__scopeId", "data-v-d9391b97"]]);
export {
  Or as default
};
