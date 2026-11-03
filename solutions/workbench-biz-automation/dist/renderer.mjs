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
    const F = K, T = Y.useNotificationStore(), y = e.ref(!1), $ = e.computed(() => F.moduleKey && l.baState.value?.settings.moduleModels[F.moduleKey] || "");
    async function U(S) {
      if (F.moduleKey) {
        y.value = !0;
        try {
          const w = { ...l.baState.value?.settings.moduleModels || {} };
          S ? w[F.moduleKey] = S : delete w[F.moduleKey], await l.ba("settings.patch", { patch: { moduleModels: w } }), await l.refreshState();
        } catch (w) {
          T.error(l.errorMessage(w));
        } finally {
          y.value = !1;
        }
      }
    }
    return (S, w) => (e.openBlock(), e.createElementBlock("section", pe, [
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
              e.toDisplayString(S.$t("能力")),
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
              e.toDisplayString(S.$t("输出物")),
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
        title: S.$t("本模块的脚本、文案、解读都用这个模型；金额与指标由规则计算，不经过模型")
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
            e.toDisplayString(S.$t("本模块使用模型")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("select", {
          value: $.value,
          disabled: y.value,
          onChange: w[0] || (w[0] = (A) => U(A.target.value))
        }, [
          e.createElementVNode(
            "option",
            be,
            e.toDisplayString(S.$t("跟随系统默认（{p0}）", { p0: e.unref(l.baModels).defaultLabel || S.$t("未配置") })),
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
                e.renderList(A.options, (v) => (e.openBlock(), e.createElementBlock("option", {
                  key: v.value,
                  value: v.value
                }, e.toDisplayString(v.label), 9, fe))),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 8, Ne))),
            128
            /* KEYED_FRAGMENT */
          )),
          $.value && !e.unref(l.baModels).options.some((A) => A.value === $.value) ? (e.openBlock(), e.createElementBlock("option", {
            key: 0,
            value: $.value
          }, e.toDisplayString($.value), 9, Ee)) : e.createCommentVNode("v-if", !0)
        ], 40, ge)
      ], 8, Ve)) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), x = (K, F) => {
  const T = K.__vccOpts || K;
  for (const [y, $] of F)
    T[y] = $;
  return T;
}, oe = /* @__PURE__ */ x($e, [["__scopeId", "data-v-4804e143"]]), _e = { class: "ss-module" }, Se = { class: "ba-projbar" }, De = { class: "ss-field" }, Be = { value: "" }, we = ["value"], Ce = { class: "ss-steps" }, Te = { class: "ba-types" }, Le = ["onClick"], Ae = {
  key: 0,
  class: "ss-note warn"
}, Me = { class: "ba-gpick" }, Ie = ["onClick"], Fe = ["src"], Ue = { class: "ss-field" }, Re = { class: "ss-actions" }, Oe = { class: "ss-muted" }, Pe = ["value"], ze = { class: "ba-check" }, Ke = { value: "female" }, je = { value: "male" }, We = { class: "ss-actions" }, qe = ["disabled"], Je = {
  key: 1,
  class: "ba-summary"
}, He = { class: "ss-chip brand" }, Ge = {
  key: 0,
  class: "ss-muted"
}, Ye = { class: "ss-muted" }, Qe = { class: "ba-thumbs" }, xe = ["src"], Xe = { class: "ss-actions" }, Ze = ["disabled"], et = ["disabled"], tt = { class: "ss-muted" }, lt = { class: "ss-actions" }, nt = ["disabled"], st = {
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
}, Pt = { class: "ss-actions" }, zt = ["disabled"], Kt = { class: "ss-muted" }, jt = { class: "ss-table-wrap" }, Wt = { class: "ss-table" }, qt = { class: "num" }, Jt = { class: "num" }, Ht = { class: "num" }, Gt = { class: "num" }, Yt = ["onUpdate:modelValue"], Qt = ["onClick"], xt = {
  key: 0,
  class: "ss-muted"
}, Xt = { class: "ss-subhead" }, Zt = { class: "ss-table-wrap" }, el = { class: "ss-table" }, tl = { class: "num" }, ll = { class: "num" }, nl = { class: "num" }, sl = { class: "num" }, ol = { class: "num" }, al = { class: "num" }, il = { class: "num" }, rl = { class: "num" }, cl = { class: "num" }, dl = { class: "num" }, ul = 120, ml = /* @__PURE__ */ e.defineComponent({
  __name: "VideoTab",
  props: {
    focus: {}
  },
  setup(K) {
    const F = K, T = Y.useNotificationStore(), y = ee.useRouter(), $ = l.baState;
    l.ensureBaProgressTracking();
    const U = ["new_arrival", "multi_look", "store_tour", "promotion", "styling_tips"], S = ["douyin", "kuaishou", "xiaohongshu", "wxchannels"], w = {
      new_arrival: n.t("商品图 + AI 模特图 + 卖点，15～30 秒"),
      multi_look: n.t("同一件衣服 × 多组试穿造型"),
      store_tour: n.t("邀请进店，适合带定位发布"),
      promotion: n.t("活动信息 + 主推款"),
      styling_tips: n.t("按场合给穿搭建议")
    }, A = e.computed(() => l.baGarments.value), v = e.computed(() => $.value?.videos || []), g = e.ref(""), o = e.computed(() => v.value.find((t) => t.id === g.value) || null);
    e.watch(() => F.focus, (t) => {
      t?.id && (g.value = t.id);
    }, { immediate: !0 });
    const a = e.reactive({ type: "new_arrival", garmentIds: [], brief: "", platforms: ["douyin", "xiaohongshu"], narration: !0, voiceGender: "female" }), V = e.reactive({ scenes: [], copies: {} });
    e.watch(o, (t) => {
      V.scenes = t ? JSON.parse(JSON.stringify(t.scenes)) : [], V.copies = t ? JSON.parse(JSON.stringify(t.copies)) : {};
    }, { immediate: !0 });
    const b = e.computed(() => !!o.value && (JSON.stringify(V.scenes) !== JSON.stringify(o.value.scenes) || JSON.stringify(V.copies) !== JSON.stringify(o.value.copies))), N = e.ref(""), L = e.ref({}), D = e.ref(!1), _ = [
      { key: "v-pick", title: n.t("选类型与商品"), hint: n.t("新品上新 / 一衣多搭 / 门店探店 / 促销 / 穿搭教程") },
      { key: "v-material", title: n.t("素材准备"), hint: n.t("自动带入商品图与试穿图，可补充门店实拍") },
      { key: "v-script", title: n.t("脚本与文案"), hint: n.t("分镜口播 + 各平台标题、正文、话题，逐段可改") },
      { key: "v-render", title: n.t("成片"), hint: n.t("配音、字幕、推拉镜头、配乐，9:16") },
      { key: "v-approve", title: n.t("审核"), hint: n.t("极限词、来路不明的价格会提示") },
      { key: "v-publish", title: n.t("发布"), hint: n.t("立即或定时发到抖音 / 快手 / 小红书 / 视频号，平台回执逐条显示") },
      { key: "v-review", title: n.t("复盘"), hint: n.t("回收播放、点赞、评论数，按款式看引流效果") }
    ];
    function C(t, i, d, I = !1, J = "", ae) {
      return N.value === t || I ? { state: "running", ...ae || {} } : L.value[t] || J ? { state: "failed", error: L.value[t] || J } : i ? { state: "done", summary: d } : { state: "todo" };
    }
    const B = e.computed(() => {
      const t = o.value;
      return {
        "v-pick": C("v-pick", !!t, t?.name),
        "v-material": C("v-material", !!t && t.materials.length > 0, t ? n.t("{n} 张素材", { n: t.materials.length }) : ""),
        "v-script": C("v-script", !!t && (t.scenes.length > 0 || !!t.video), t ? n.t("{n} 个镜头", { n: t.scenes.length }) : ""),
        // 成片：看门狗要的真实开始时刻 / 最近进度 / 类型 / 预计，一并写进 runtime（换 tab 回来计时不归零）
        "v-render": C(
          "v-render",
          !!t?.video,
          t?.durationSec ? n.t("{s} 秒", { s: t.durationSec }) : "",
          t?.status === "rendering",
          t?.status === "failed" && t.error || "",
          t ? { kind: "video", estimateSec: ul, startedAt: l.renderStartedAt(t), progressAt: l.baProgressAt.video } : void 0
        ),
        "v-approve": C("v-approve", !!t && ["approved", "publishing", "published"].includes(t.status)),
        "v-publish": C("v-publish", t?.status === "published", t?.publishRunNote),
        "v-review": C("v-review", !!t?.stats && Object.keys(t.stats).length > 0)
      };
    }), M = e.computed(() => _.find((t) => B.value[t.key].state !== "done")?.key || "v-review"), R = ["plays", "likes", "comments", "shares"], j = e.reactive({});
    e.watch(o, (t) => {
      for (const i of S) {
        const d = t?.stats?.[i];
        j[i] = { plays: d?.plays || 0, likes: d?.likes || 0, comments: d?.comments || 0, shares: d?.shares || 0 };
      }
    }, { immediate: !0 });
    const H = e.ref([]);
    async function z() {
      H.value = await l.ba("video.review").catch(() => []);
    }
    z();
    const W = e.ref("");
    e.watch(() => a.type, (t) => {
      if (t !== "new_arrival" || a.garmentIds.length) return;
      const i = A.value.filter((d) => Date.now() - Date.parse(d.createdAt) < 7 * 864e5).slice(0, 5).map((d) => d.id);
      a.garmentIds.push(...i);
    }, { immediate: !0 });
    function u(t) {
      return { draft: n.t("草稿"), scripted: n.t("已写脚本"), rendering: n.t("成片中"), rendered: n.t("已成片"), approved: n.t("已审核"), publishing: n.t("发布中"), published: n.t("已发布"), failed: n.t("失败") }[t];
    }
    function p(t) {
      const i = a.garmentIds.indexOf(t);
      i >= 0 ? a.garmentIds.splice(i, 1) : a.garmentIds.length < 5 && a.garmentIds.push(t);
    }
    async function r(t, i) {
      N.value = t, L.value = { ...L.value, [t]: "" };
      try {
        return await i(), await l.refreshState(), !0;
      } catch (d) {
        return L.value = { ...L.value, [t]: l.errorMessage(d) }, l.scrollToStep(t), !1;
      } finally {
        N.value = "";
      }
    }
    async function s() {
      await r("v-pick", async () => {
        const t = await l.ba("video.create", { ...a });
        g.value = t.id, await l.refreshState(), await l.ba("video.script", { id: t.id });
      });
    }
    async function f() {
      const t = await l.pickFiles("image", !0);
      t.length && o.value && await r("v-material", () => l.ba("video.addMaterials", { id: o.value.id, paths: t }));
    }
    async function E() {
      o.value && await r("v-script", () => l.ba("video.script", { id: o.value.id }));
    }
    async function P() {
      o.value && await r("v-script", () => l.ba("video.update", { id: o.value.id, patch: { scenes: V.scenes, copies: V.copies } }));
    }
    async function Q() {
      const t = o.value;
      !t || N.value || t.status === "rendering" || (l.noteRenderStarted(t.id), await r("v-render", () => l.ba("video.render", { id: t.id })));
    }
    const G = e.ref(!1);
    async function X() {
      const t = o.value;
      if (!(!t || G.value)) {
        G.value = !0;
        try {
          await l.ba("video.cancel", { id: t.id }).catch(() => {
          });
          const i = Date.now() + 2e4;
          for (; Date.now() < i; ) {
            if (await l.refreshState().catch(() => {
            }), N.value !== "v-render" && o.value?.status !== "rendering") return;
            await new Promise((d) => setTimeout(d, 300));
          }
          T.warn(n.t("上次成片的任务还没退出，请稍后再试或重启应用"));
        } finally {
          G.value = !1;
        }
      }
    }
    async function te() {
      o.value && await r("v-approve", () => l.ba("video.approve", { id: o.value.id, force: D.value }));
    }
    async function le() {
      if (!o.value) return;
      await r("v-publish", async () => {
        const i = await l.ba("video.publishInput", { id: o.value.id });
        await l.startPublishWorkflow(i, o.value.id);
      }) && await y.push({ path: "/workflow" });
    }
    async function Z(t) {
      o.value && await r("v-publish", () => l.ba("video.markPublished", { id: o.value.id, ok: t, note: t ? n.t("已在发布工作流完成") : n.t("发布未完成") }));
    }
    async function ne() {
      if (!o.value) return;
      const t = o.value.materials.length;
      await r("v-material", () => l.ba("video.fillModels", { id: o.value.id })) && T.info((o.value?.materials.length || 0) > t ? n.t("已补 {n} 张模特图", { n: (o.value?.materials.length || 0) - t }) : n.t("选中的款都已有试穿图，不用补"));
    }
    async function m(t) {
      o.value && await r("v-publish", () => l.ba("video.schedule", { id: o.value.id, at: t ? new Date(t).toISOString() : null }));
    }
    async function k() {
      if (!o.value) return;
      await r("v-review", async () => {
        const i = await l.ba("video.statsInstruction", { id: o.value.id });
        await l.handToDigitalEmployee(n.t("回读视频数据：{p0}", { p0: o.value.name }), i);
      }) && T.success(n.t("已交给数字员工，读回后请把数字填到表里"));
    }
    async function h(t) {
      o.value && (await r("v-review", () => l.ba("video.recordStats", { id: o.value.id, platform: t, stats: { ...j[t], source: "manual" } })), await z());
    }
    async function q() {
      if (!(!o.value || !window.confirm(n.t("删除视频项目「{p0}」？成片文件保留在输出目录。", { p0: o.value.name }))))
        try {
          await l.ba("video.remove", { id: o.value.id }), g.value = "", await l.refreshState();
        } catch (t) {
          T.error(l.errorMessage(t));
        }
    }
    function c(t) {
      l.scrollToStep(t);
    }
    return (t, i) => (e.openBlock(), e.createElementBlock("div", _e, [
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
              "onUpdate:modelValue": i[0] || (i[0] = (d) => g.value = d)
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
                e.renderList(v.value, (d) => (e.openBlock(), e.createElementBlock("option", {
                  key: d.id,
                  value: d.id
                }, e.toDisplayString(d.name) + " · " + e.toDisplayString(u(d.status)), 9, we))),
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
        o.value ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn sm ghost danger",
          onClick: q
        }, [
          i[12] || (i[12] = e.createElementVNode(
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
        metas: _,
        runtime: B.value,
        "current-key": M.value,
        onJump: c
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", Ce, [
        e.createVNode(O, {
          "step-key": "v-pick",
          index: 0,
          title: _[0].title,
          hint: _[0].hint,
          runtime: B.value["v-pick"],
          "is-current": M.value === "v-pick"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock("div", Je, [
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
                    e.renderList(U, (d) => e.createElementVNode("button", {
                      key: d,
                      type: "button",
                      class: e.normalizeClass(["ba-type", { on: a.type === d }]),
                      onClick: (I) => a.type = d
                    }, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(e.unref(l.videoTypeLabel)(d)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(w[d]),
                        1
                        /* TEXT */
                      )
                    ], 10, Le)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                A.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Ae, [
                  i[13] || (i[13] = e.createElementVNode(
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
                    e.renderList(A.value, (d) => (e.openBlock(), e.createElementBlock("button", {
                      key: d.id,
                      type: "button",
                      class: e.normalizeClass({ on: a.garmentIds.includes(d.id) }),
                      onClick: (I) => p(d.id)
                    }, [
                      e.createElementVNode("img", {
                        src: e.unref(l.fileUrl)(d.image),
                        alt: "",
                        loading: "lazy"
                      }, null, 8, Fe),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(d.name),
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
                      "onUpdate:modelValue": i[1] || (i[1] = (d) => a.brief = d),
                      rows: "2"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, a.brief]
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
                    e.renderList(S, (d) => e.createElementVNode("label", {
                      key: d,
                      class: "ba-check"
                    }, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": i[2] || (i[2] = (I) => a.platforms = I),
                        type: "checkbox",
                        value: d
                      }, null, 8, Pe), [
                        [e.vModelCheckbox, a.platforms]
                      ]),
                      e.createTextVNode(
                        e.toDisplayString(e.unref(l.platformLabel)(d)),
                        1
                        /* TEXT */
                      )
                    ])),
                    64
                    /* STABLE_FRAGMENT */
                  )),
                  e.createElementVNode("label", ze, [
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": i[3] || (i[3] = (d) => a.narration = d),
                        type: "checkbox"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelCheckbox, a.narration]
                    ]),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("AI 配音")),
                      1
                      /* TEXT */
                    )
                  ]),
                  a.narration ? e.withDirectives((e.openBlock(), e.createElementBlock(
                    "select",
                    {
                      key: 0,
                      "onUpdate:modelValue": i[4] || (i[4] = (d) => a.voiceGender = d),
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
                    [e.vModelSelect, a.voiceGender]
                  ]) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", We, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!N.value || !a.garmentIds.length || !a.platforms.length,
                    onClick: s
                  }, [
                    i[14] || (i[14] = e.createElementVNode(
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
                  ], 8, qe)
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
          title: _[1].title,
          hint: _[1].hint,
          runtime: B.value["v-material"],
          "is-current": M.value === "v-material"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Qe, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.materials, (d, I) => (e.openBlock(), e.createElementBlock("figure", { key: d }, [
                      e.createElementVNode("img", {
                        src: e.unref(l.fileUrl)(d),
                        alt: "",
                        loading: "lazy"
                      }, null, 8, xe),
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
                    disabled: !!N.value || !o.value.garmentIds.length,
                    onClick: f
                  }, [
                    i[15] || (i[15] = e.createElementVNode(
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
                    disabled: !!N.value,
                    onClick: ne
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(N.value === "v-material" ? "ri-loader-4-line spin" : "ri-user-star-line")
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
          title: _[2].title,
          hint: _[2].hint,
          runtime: B.value["v-script"],
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
                    disabled: !!N.value || !o.value.garmentIds.length,
                    onClick: E
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(N.value === "v-script" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
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
                  e.renderList(o.value.warnings, (d) => (e.openBlock(), e.createElementBlock("p", {
                    key: d,
                    class: "ss-note warn"
                  }, [
                    i[16] || (i[16] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                V.scenes.length ? (e.openBlock(), e.createElementBlock("div", ot, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(V.scenes, (d, I) => (e.openBlock(), e.createElementBlock("div", {
                      key: I,
                      class: "ba-scene"
                    }, [
                      e.createElementVNode("img", {
                        src: e.unref(l.fileUrl)(d.image),
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
                          "onUpdate:modelValue": (J) => d.image = J,
                          class: "ba-mini"
                        }, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(o.value.materials, (J, ae) => (e.openBlock(), e.createElementBlock("option", {
                              key: J,
                              value: J
                            }, e.toDisplayString(t.$t("图片 #{n}", { n: ae })), 9, rt))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 8, it), [
                          [e.vModelSelect, d.image]
                        ]),
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (J) => d.line = J,
                          type: "text",
                          maxlength: "40"
                        }, null, 8, ct), [
                          [e.vModelText, d.line]
                        ])
                      ]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        "aria-label": t.$t("删除"),
                        onClick: (J) => V.scenes.splice(I, 1)
                      }, [...i[17] || (i[17] = [
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
                Object.keys(V.copies).length ? (e.openBlock(), e.createElementBlock("div", ut, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.platforms, (d) => (e.openBlock(), e.createElementBlock("div", {
                      key: d,
                      class: "ba-copy"
                    }, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(e.unref(l.platformLabel)(d)),
                        1
                        /* TEXT */
                      ),
                      V.copies[d] ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (I) => V.copies[d].title = I,
                            type: "text",
                            placeholder: t.$t("标题")
                          }, null, 8, mt), [
                            [e.vModelText, V.copies[d].title]
                          ]),
                          e.withDirectives(e.createElementVNode("textarea", {
                            "onUpdate:modelValue": (I) => V.copies[d].caption = I,
                            rows: "3"
                          }, null, 8, pt), [
                            [e.vModelText, V.copies[d].caption]
                          ]),
                          e.createElementVNode("input", {
                            value: V.copies[d].topics.join(" "),
                            type: "text",
                            placeholder: t.$t("话题，空格分隔"),
                            onChange: (I) => V.copies[d].topics = I.target.value.split(/\s+/).map((J) => J.replace(/^#/, "")).filter(Boolean)
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
                V.scenes.length ? (e.openBlock(), e.createElementBlock("div", yt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!N.value || !b.value,
                    onClick: P
                  }, [
                    i[18] || (i[18] = e.createElementVNode(
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
                  b.value ? (e.openBlock(), e.createElementBlock(
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
          title: _[3].title,
          hint: _[3].hint,
          runtime: B.value["v-render"],
          "is-current": M.value === "v-render",
          retry: Q,
          cancel: X,
          "retry-label": t.$t("重新成片")
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.unref($)?.ready.ffmpeg ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Vt, [
                  i[19] || (i[19] = e.createElementVNode(
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
                    disabled: !!N.value || !o.value.scenes.length || o.value.status === "rendering" || b.value || !o.value.garmentIds.length,
                    onClick: Q
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
                        onClick: i[5] || (i[5] = (d) => e.unref(l.openPath)(o.value.video, !0))
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
          title: _[4].title,
          hint: _[4].hint,
          runtime: B.value["v-approve"],
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
                      "onUpdate:modelValue": i[6] || (i[6] = (d) => D.value = d),
                      type: "checkbox"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelCheckbox, D.value]
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
                    disabled: !!N.value || !o.value.video || o.value.status === "approved" || o.value.status === "published",
                    onClick: te
                  }, [
                    i[20] || (i[20] = e.createElementVNode(
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
          title: _[5].title,
          hint: _[5].hint,
          runtime: B.value["v-publish"],
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
                    disabled: !!N.value || o.value.status !== "approved" && o.value.status !== "published" && o.value.status !== "publishing",
                    onClick: le
                  }, [
                    i[21] || (i[21] = e.createElementVNode(
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
                      onClick: i[7] || (i[7] = (d) => Z(!0))
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
                      onClick: i[8] || (i[8] = (d) => Z(!1))
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
                      "onUpdate:modelValue": i[9] || (i[9] = (d) => W.value = d),
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
                    disabled: !!N.value || !W.value,
                    onClick: i[10] || (i[10] = (d) => m(W.value))
                  }, [
                    i[22] || (i[22] = e.createElementVNode(
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
                      onClick: i[11] || (i[11] = (d) => m(null))
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
          title: _[6].title,
          hint: _[6].hint,
          runtime: B.value["v-review"],
          "is-current": M.value === "v-review"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Pt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!N.value || o.value.status !== "published",
                    onClick: k
                  }, [
                    i[23] || (i[23] = e.createElementVNode(
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
                  ], 8, zt),
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
                          qt,
                          e.toDisplayString(t.$t("播放")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Jt,
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
                        i[24] || (i[24] = e.createElementVNode(
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
                        e.renderList(o.value.platforms, (d) => (e.openBlock(), e.createElementBlock("tr", { key: d }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(e.unref(l.platformLabel)(d)),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(R, (I) => e.createElementVNode("td", { key: I }, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": (J) => j[d][I] = J,
                                type: "number",
                                min: "0",
                                class: "ba-stat"
                              }, null, 8, Yt), [
                                [
                                  e.vModelText,
                                  j[d][I],
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
                              onClick: (I) => h(d)
                            }, e.toDisplayString(t.$t("保存")), 9, Qt),
                            o.value.stats?.[d] ? (e.openBlock(), e.createElementBlock(
                              "small",
                              xt,
                              " · " + e.toDisplayString(e.unref(l.fmtDateTime)(o.value.stats[d].at)),
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
                            e.renderList(H.value, (d) => (e.openBlock(), e.createElementBlock("tr", {
                              key: d.garmentId
                            }, [
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(e.unref(l.garmentName)(d.garmentId)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                al,
                                e.toDisplayString(d.videos),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                il,
                                e.toDisplayString(d.plays),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                rl,
                                e.toDisplayString(d.likes),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                cl,
                                e.toDisplayString(d.comments),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                dl,
                                e.toDisplayString(d.shares),
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
}), pl = /* @__PURE__ */ x(ml, [["__scopeId", "data-v-ff2d8821"]]), vl = { class: "ss-module" }, yl = { class: "ba-projbar" }, hl = { class: "ss-field" }, kl = { value: "" }, Vl = ["value"], gl = { class: "ss-steps" }, bl = { class: "ba-types" }, Nl = ["onClick"], fl = { class: "ss-grid" }, El = { class: "ss-field" }, $l = { class: "ss-field" }, _l = { class: "ba-facts" }, Sl = {
  key: 0,
  class: "ss-muted"
}, Dl = { class: "ss-actions" }, Bl = ["disabled"], wl = {
  key: 1,
  class: "ss-muted"
}, Cl = { class: "ss-actions" }, Tl = ["disabled"], Ll = { class: "ss-muted" }, Al = { class: "ss-grid" }, Ml = { class: "ss-field" }, Il = { class: "ss-field" }, Fl = { class: "ss-field" }, Ul = { value: "9:16" }, Rl = { value: "16:9" }, Ol = { class: "ss-field" }, Pl = { class: "ss-actions" }, zl = ["disabled"], Kl = { class: "ss-muted" }, jl = { class: "ss-actions" }, Wl = ["disabled"], ql = { class: "ss-muted" }, Jl = { class: "ss-muted" }, Hl = ["src"], Gl = { class: "ss-actions" }, Yl = ["value"], Ql = ["disabled"], xl = { class: "ss-muted" }, Xl = 240, Zl = /* @__PURE__ */ e.defineComponent({
  __name: "AvatarTab",
  emits: ["goto"],
  setup(K, { emit: F }) {
    const T = F, y = Y.useNotificationStore();
    l.ensureBaProgressTracking();
    const $ = ["company_intro", "brand_story", "store_opening", "service_intro", "recruiting", "holiday"], U = ["douyin", "kuaishou", "xiaohongshu", "wxchannels"], S = (s) => ({ company_intro: n.t("企业介绍"), brand_story: n.t("品牌故事"), store_opening: n.t("新店开业"), service_intro: n.t("门店服务介绍"), recruiting: n.t("招聘"), holiday: n.t("节日祝福") })[s], w = e.computed(() => l.baState.value?.avatars || []), A = e.ref(""), v = e.computed(() => w.value.find((s) => s.id === A.value) || null), g = e.reactive({ topic: "company_intro", seconds: 45, brief: "" }), o = e.ref([]), a = e.ref(null), V = e.ref(""), b = e.reactive({ avatarId: "", voiceId: "", aspectRatio: "9:16", likenessConsent: "" }), N = e.ref(["douyin", "wxchannels"]), L = e.ref(""), D = e.ref({});
    e.watch(v, (s) => {
      V.value = s?.script || "", Object.assign(b, { avatarId: s?.avatarId || "", voiceId: s?.voiceId || "", aspectRatio: s?.aspectRatio || "9:16", likenessConsent: s?.likenessConsent || "" });
    }, { immediate: !0 }), e.onMounted(async () => {
      o.value = await l.ba("avatar.facts").catch(() => []), a.value = await l.ba("avatar.status").catch(() => ({ ready: !1 }));
    });
    const _ = [
      { key: "a-topic", title: n.t("选主题"), hint: n.t("企业介绍 / 品牌故事 / 新店开业 / 服务介绍 / 招聘 / 节日祝福") },
      { key: "a-script", title: n.t("讲稿"), hint: n.t("事实只取知识库，缺的写【待补充】") },
      { key: "a-avatar", title: n.t("选数字人"), hint: n.t("形象、音色、画幅；真人分身需书面授权") },
      { key: "a-render", title: n.t("口播成片"), hint: n.t("带字幕与 AI 生成标识") },
      { key: "a-publish", title: n.t("进入发布"), hint: n.t("交给「短视频发布」审核后发出") }
    ];
    function C(s, f, E, P = !1, Q = "", G) {
      return L.value === s || P ? { state: "running", ...G || {} } : D.value[s] || Q ? { state: "failed", error: D.value[s] || Q } : f ? { state: "done", summary: E } : { state: "todo" };
    }
    const B = e.computed(() => {
      const s = v.value;
      return {
        "a-topic": C("a-topic", !!s, s ? S(s.topic) : ""),
        "a-script": C("a-script", !!s && !/【待补充/.test(s.script), s ? n.t("{n} 字", { n: s.script.length }) : ""),
        "a-avatar": C("a-avatar", !!s && (!!s.avatarId || !!s.video || s.status === "rendering")),
        "a-render": C(
          "a-render",
          !!s?.video,
          "",
          s?.status === "rendering",
          s?.status === "failed" && s.error || "",
          s ? { kind: "video", estimateSec: Xl, startedAt: l.renderStartedAt(s), progressAt: l.baProgressAt.avatar } : void 0
        ),
        "a-publish": C("a-publish", !!s && (l.baState.value?.videos || []).some((f) => f.video === s.video && !!s.video))
      };
    }), M = e.computed(() => _.find((s) => B.value[s.key].state !== "done")?.key || "a-publish");
    async function R(s, f) {
      L.value = s, D.value = { ...D.value, [s]: "" };
      try {
        return await f(), await l.refreshState(), !0;
      } catch (E) {
        return D.value = { ...D.value, [s]: l.errorMessage(E) }, l.scrollToStep(s), !1;
      } finally {
        L.value = "";
      }
    }
    async function j() {
      await R("a-topic", async () => {
        const s = await l.ba("avatar.create", { ...g });
        A.value = s.id;
      });
    }
    async function H() {
      v.value && await R("a-script", () => l.ba("avatar.update", { id: v.value.id, patch: { script: V.value } }));
    }
    async function z() {
      v.value && await R("a-avatar", () => l.ba("avatar.update", { id: v.value.id, patch: { ...b } }));
    }
    async function W() {
      const s = v.value;
      !s || L.value || s.status === "rendering" || (l.noteRenderStarted(s.id), await R("a-render", () => l.ba("avatar.render", { id: s.id })));
    }
    async function u() {
      if (!v.value) return;
      let s = "";
      await R("a-publish", async () => {
        s = (await l.ba("avatar.toVideo", { id: v.value.id, platforms: N.value })).id;
      }) && T("goto", "video", { id: s });
    }
    async function p() {
      if (!(!v.value || !window.confirm(n.t("删除数字人项目「{p0}」？", { p0: v.value.name }))))
        try {
          await l.ba("avatar.remove", { id: v.value.id }), A.value = "", await l.refreshState();
        } catch (s) {
          y.error(l.errorMessage(s));
        }
    }
    function r(s) {
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
              "onUpdate:modelValue": f[0] || (f[0] = (E) => A.value = E)
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
                e.renderList(w.value, (E) => (e.openBlock(), e.createElementBlock("option", {
                  key: E.id,
                  value: E.id
                }, e.toDisplayString(E.name), 9, Vl))),
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
            class: e.normalizeClass(["ss-chip", a.value?.ready ? "ok" : "warn"])
          },
          e.toDisplayString(a.value?.ready ? s.$t("数字人服务已就绪") : s.$t("数字人服务未配置")),
          3
          /* TEXT, CLASS */
        ),
        v.value ? (e.openBlock(), e.createElementBlock("button", {
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
        metas: _,
        runtime: B.value,
        "current-key": M.value,
        onJump: r
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", gl, [
        e.createVNode(O, {
          "step-key": "a-topic",
          index: 0,
          title: _[0].title,
          hint: _[0].hint,
          runtime: B.value["a-topic"],
          "is-current": M.value === "a-topic"
        }, {
          default: e.withCtx(() => [
            v.value ? (e.openBlock(), e.createElementBlock(
              "p",
              wl,
              e.toDisplayString(v.value.name),
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
                    e.renderList($, (E) => e.createElementVNode("button", {
                      key: E,
                      type: "button",
                      class: e.normalizeClass(["ba-type", { on: g.topic === E }]),
                      onClick: (P) => g.topic = E
                    }, e.toDisplayString(S(E)), 11, Nl)),
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
                        "onUpdate:modelValue": f[1] || (f[1] = (E) => g.seconds = E),
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
                        g.seconds,
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
                      "onUpdate:modelValue": f[2] || (f[2] = (E) => g.brief = E),
                      rows: "2"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, g.brief]
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
                      e.renderList(o.value, (E) => (e.openBlock(), e.createElementBlock("li", {
                        key: E.label + E.value
                      }, [
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(E.label),
                          1
                          /* TEXT */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(s.$t("：{p0}", { p0: E.value })),
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
                    disabled: !!L.value,
                    onClick: j
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(L.value === "a-topic" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
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
          title: _[1].title,
          hint: _[1].hint,
          runtime: B.value["a-script"],
          "is-current": M.value === "a-script"
        }, {
          default: e.withCtx(() => [
            v.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(v.value.warnings, (E) => (e.openBlock(), e.createElementBlock("p", {
                    key: E,
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
                      e.toDisplayString(E),
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
                    "onUpdate:modelValue": f[3] || (f[3] = (E) => V.value = E),
                    class: "ba-script",
                    rows: "10"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, V.value]
                ]),
                e.createElementVNode("div", Cl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!L.value || V.value === v.value.script,
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
                    e.toDisplayString(s.$t("约 {n} 字 · 由 {p0} 撰写", { n: V.value.length, p0: e.unref(l.modelLabel)(v.value.model) })),
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
          title: _[2].title,
          hint: _[2].hint,
          runtime: B.value["a-avatar"],
          "is-current": M.value === "a-avatar"
        }, {
          default: e.withCtx(() => [
            v.value ? (e.openBlock(), e.createElementBlock(
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
                        "onUpdate:modelValue": f[4] || (f[4] = (E) => b.avatarId = E),
                        type: "text"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        b.avatarId,
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
                        "onUpdate:modelValue": f[5] || (f[5] = (E) => b.voiceId = E),
                        type: "text"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        b.voiceId,
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
                        "onUpdate:modelValue": f[6] || (f[6] = (E) => b.aspectRatio = E)
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
                      [e.vModelSelect, b.aspectRatio]
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
                      "onUpdate:modelValue": f[7] || (f[7] = (E) => b.likenessConsent = E),
                      type: "text"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      e.vModelText,
                      b.likenessConsent,
                      void 0,
                      { trim: !0 }
                    ]
                  ])
                ]),
                e.createElementVNode("div", Pl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!L.value,
                    onClick: z
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
                  ], 8, zl),
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
          title: _[3].title,
          hint: _[3].hint,
          runtime: B.value["a-render"],
          "is-current": M.value === "a-render",
          retry: v.value && v.value.status !== "rendering" ? W : void 0,
          "retry-label": s.$t("重新成片")
        }, {
          default: e.withCtx(() => [
            v.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", jl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!L.value || v.value.status === "rendering" || V.value !== v.value.script,
                    onClick: W
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(v.value.status === "rendering" ? "ri-loader-4-line spin" : "ri-film-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(v.value.video ? s.$t("重新成片") : s.$t("数字人成片")),
                      1
                      /* TEXT */
                    )
                  ], 8, Wl),
                  e.createElementVNode(
                    "span",
                    ql,
                    e.toDisplayString(s.$t("通常 1～5 分钟；讲稿里的【待补充】要先补完")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "p",
                  Jl,
                  e.toDisplayString(s.$t("成片后自动在画面顶部加「本视频由 AI 生成」标识，最后 3 秒叠片尾（门店名、地址、营业时间，在「设置」里填）")),
                  1
                  /* TEXT */
                ),
                v.value.video ? (e.openBlock(), e.createElementBlock("video", {
                  key: 0,
                  src: e.unref(l.fileUrl)(v.value.video),
                  controls: "",
                  playsinline: "",
                  class: e.normalizeClass(["ba-video", { wide: v.value.aspectRatio === "16:9" }])
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
          title: _[4].title,
          hint: _[4].hint,
          runtime: B.value["a-publish"],
          "is-current": M.value === "a-publish"
        }, {
          default: e.withCtx(() => [
            v.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Gl, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(U, (E) => e.createElementVNode("label", {
                      key: E,
                      class: "ba-check"
                    }, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": f[8] || (f[8] = (P) => N.value = P),
                        type: "checkbox",
                        value: E
                      }, null, 8, Yl), [
                        [e.vModelCheckbox, N.value]
                      ]),
                      e.createTextVNode(
                        e.toDisplayString(e.unref(l.platformLabel)(E)),
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
                    disabled: !!L.value || !v.value.video || !N.value.length,
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
                  ], 8, Ql)
                ]),
                e.createElementVNode(
                  "p",
                  xl,
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
}), en = /* @__PURE__ */ x(Zl, [["__scopeId", "data-v-41ca6478"]]), tn = { class: "ss-module" }, ln = { class: "ss-steps" }, nn = { class: "ss-actions" }, sn = ["disabled"], on = ["disabled"], an = { class: "ss-muted" }, rn = { class: "ss-muted" }, cn = {
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
}, wn = { class: "ba-listing__imgs" }, Cn = ["src"], Tn = { class: "ba-listing__body" }, Ln = { class: "ba-listing__head" }, An = { class: "ss-muted" }, Mn = ["onUpdate:modelValue"], In = ["onUpdate:modelValue", "placeholder"], Fn = ["onUpdate:modelValue"], Un = { class: "ss-actions" }, Rn = ["disabled", "onClick"], On = ["disabled", "onClick"], Pn = ["onClick"], zn = { class: "ss-muted" }, Kn = {
  key: 0,
  class: "ss-empty"
}, jn = { class: "ss-chip" }, Wn = ["disabled", "onClick"], qn = {
  key: 0,
  class: "ss-empty"
}, Jn = {
  key: 1,
  class: "ss-table-wrap"
}, Hn = { class: "ss-table" }, Gn = ["onUpdate:modelValue", "placeholder", "onChange"], Yn = { class: "ba-row" }, Qn = ["onClick"], xn = ["onClick"], Xn = ["onClick"], Zn = /* @__PURE__ */ e.defineComponent({
  __name: "ListingTab",
  setup(K) {
    const F = Y.useNotificationStore(), T = ee.useRouter(), y = l.baState, $ = e.computed(() => l.baGarments.value), U = e.computed(() => (y.value?.settings.channels || []).filter((c) => c.enabled)), S = e.computed(() => y.value?.ruleHits || []), w = e.computed(() => y.value?.listings || []), A = e.computed(() => w.value.filter((c) => c.status === "draft" || c.status === "confirmed")), v = e.computed(() => w.value.filter((c) => c.status === "confirmed")), g = e.computed(() => w.value.filter((c) => c.status === "handed" || c.status === "listed" || c.status === "delisted")), o = e.ref([]), a = e.ref([]);
    e.watch(U, (c) => {
      a.value.length || (a.value = c.slice(0, 1).map((t) => t.id));
    }, { immediate: !0 });
    const V = e.ref(!1), b = e.ref([]), N = e.reactive({}), L = e.reactive({});
    e.watch(w, (c) => {
      for (const t of c)
        N[t.id] || (N[t.id] = { title: t.title, points: t.sellingPoints.join(`
`), detail: t.detail }), L[t.id] === void 0 && (L[t.id] = t.productUrl || "");
    }, { immediate: !0 });
    const D = e.ref(""), _ = e.ref({}), C = [
      { key: "l-rules", title: n.t("库存巡检"), hint: n.t("售罄下架、断码提醒、过季提醒、试穿多成交少换主图") },
      { key: "l-pick", title: n.t("选商品与渠道"), hint: n.t("商品来自服装AI试衣的商品库") },
      { key: "l-gen", title: n.t("生成图文"), hint: n.t("标题、卖点、详情、关键词 + 主图") },
      { key: "l-confirm", title: n.t("确认"), hint: n.t("逐条改、逐条确认；含极限词的不能确认") },
      { key: "l-hand", title: n.t("数字员工上架"), hint: n.t("在网店后台填写，停在提交前等你确认") },
      { key: "l-ledger", title: n.t("上架台账"), hint: n.t("记录商品链接，下架时用") }
    ];
    function B(c, t, i) {
      return D.value === c ? { state: "running" } : _.value[c] ? { state: "failed", error: _.value[c] } : t ? { state: "done", summary: i } : { state: "todo" };
    }
    const M = e.computed(() => ({
      "l-rules": B("l-rules", V.value, n.t("{n} 条提醒", { n: S.value.length })),
      "l-pick": B("l-pick", o.value.length > 0 && a.value.length > 0),
      "l-gen": B("l-gen", w.value.length > 0, n.t("{n} 份草稿", { n: A.value.length })),
      "l-confirm": B("l-confirm", w.value.some((c) => c.status !== "draft")),
      "l-hand": B("l-hand", g.value.length > 0),
      "l-ledger": B("l-ledger", w.value.some((c) => c.status === "listed"))
    })), R = e.computed(() => C.find((c) => M.value[c.key].state !== "done")?.key || "l-ledger"), j = e.reactive({});
    e.watch(S, (c) => {
      for (const t of c) {
        const i = `${t.garmentId}:${t.rule}`;
        j[i] || (j[i] = t.action);
      }
    }, { immediate: !0 });
    const H = (c) => ({ delist: n.t("下架"), presale: n.t("改为预售"), delist_color: n.t("下架该颜色"), badge_sale: n.t("主图加「断码特价」"), clearance: n.t("转入清仓专区"), swap_image: n.t("换主图（试穿最多的造型图）"), remind: n.t("提醒店长") })[c], z = e.ref("");
    async function W() {
      const c = await l.pickFiles("excel");
      c.length && await P("l-rules", async () => {
        const t = await l.ba("finance.import", { path: c[0], kind: "inventory" });
        V.value = !0, z.value = t.unmatched.length ? n.t("已同步 {n} 行；这些货号在商品库里找不到：{p0}", { n: t.rows, p0: t.unmatched.slice(0, 8).join("、") }) : n.t("已同步 {n} 行库存", { n: t.rows });
      });
    }
    async function u(c) {
      const t = j[`${c.garmentId}:${c.rule}`] || c.action;
      await P("l-rules", async () => {
        const i = await l.ba("rules.handle", { garmentId: c.garmentId, action: t });
        if (i.text) {
          const d = await l.handToDigitalEmployee(n.t("{p0}：{p1}", { p0: H(t), p1: l.garmentName(c.garmentId) }), i.text);
          if (t === "delist") for (const I of i.listingIds) await l.ba("listing.status", { id: I, status: "handed", conversationId: d });
          F.success(n.t("已交给数字员工处理"));
        } else i.done.length && F.info(i.done.join(n.t("；")));
      });
    }
    const p = (c) => ({ soldout: n.t("售罄"), broken_size: n.t("断码"), off_season: n.t("过季"), lagging: n.t("试穿多成交少") })[c], r = (c) => ({ draft: n.t("草稿"), confirmed: n.t("已确认"), handed: n.t("数字员工处理中"), listed: n.t("已上架"), delisted: n.t("已下架") })[c], s = (c) => y.value?.settings.channels.find((t) => t.id === c)?.name || c, f = (c) => !!l.baGarments.value.find((t) => t.id === c)?.onShelf;
    function E(c, t) {
      const i = c.indexOf(t);
      i >= 0 ? c.splice(i, 1) : c.push(t);
    }
    async function P(c, t) {
      D.value = c, _.value = { ..._.value, [c]: "" };
      try {
        return await t(), await l.refreshState(), !0;
      } catch (i) {
        return _.value = { ..._.value, [c]: l.errorMessage(i) }, l.scrollToStep(c), !1;
      } finally {
        D.value = "";
      }
    }
    async function Q() {
      await P("l-rules", async () => {
        const c = await l.ba("rules.evaluate");
        V.value = !0, c.delisted && F.info(n.t("已把 {n} 款售罄商品从门店试穿手机端下架", { n: c.delisted }));
      });
    }
    async function G(c, t) {
      await P("l-rules", () => l.ba("local.shelf", { garmentId: c, onShelf: t }));
    }
    async function X() {
      b.value = [], await P("l-gen", async () => {
        const c = await l.ba("listing.generate", { garmentIds: o.value, channelIds: a.value });
        b.value = c.errors;
      });
    }
    async function te(c) {
      const t = N[c];
      await P("l-confirm", () => l.ba("listing.update", { id: c, patch: { title: t.title, detail: t.detail, sellingPoints: t.points.split(`
`).map((d) => d.trim()).filter(Boolean) } }));
      const i = w.value.find((d) => d.id === c);
      i && (N[c] = { title: i.title, points: i.sellingPoints.join(`
`), detail: i.detail });
    }
    async function le(c) {
      await P("l-confirm", () => l.ba("listing.confirm", { id: c }));
    }
    async function Z(c) {
      await P("l-confirm", () => l.ba("listing.remove", { id: c }));
    }
    async function ne(c) {
      await P("l-hand", async () => {
        const i = await l.ba("listing.instruction", { id: c }), d = w.value.find((J) => J.id === c), I = await l.handToDigitalEmployee(n.t("{p0} 上架：{p1}", { p0: s(d.channelId), p1: d.title.slice(0, 20) }), i);
        await l.ba("listing.status", { id: c, status: "handed", conversationId: I });
      }) && F.success(n.t("已交给数字员工，点「查看执行过程」可以看它操作；提交前会请你确认"));
    }
    async function m(c, t) {
      await P("l-ledger", () => l.ba("listing.status", { id: c, status: t }));
    }
    async function k(c) {
      await P("l-ledger", () => l.ba("listing.update", { id: c, patch: { productUrl: L[c] } }));
    }
    function h(c) {
      T.push(`/conversations/${c}`).catch((t) => F.error(l.errorMessage(t)));
    }
    function q(c) {
      l.scrollToStep(c);
    }
    return (c, t) => (e.openBlock(), e.createElementBlock("div", tn, [
      e.createVNode(oe, {
        "module-key": "listing",
        icon: "ri-store-3-line",
        title: c.$t("商品图文自动上下架"),
        ability: c.$t("按渠道生成标题、卖点、详情与主图（按渠道比例补白边）→ 你确认 → 数字员工在网店后台填写、停在提交前；售罄 / 断码 / 过季 / 试穿多成交少按规则下架或提醒"),
        output: c.$t("各渠道上架草稿、上架台账、下架指令；价格与库存取自商品库，不让模型填")
      }, null, 8, ["title", "ability", "output"]),
      e.createVNode(se, {
        title: c.$t("商品上下架"),
        metas: C,
        runtime: M.value,
        "current-key": R.value,
        onJump: q
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", ln, [
        e.createVNode(O, {
          "step-key": "l-rules",
          index: 0,
          title: C[0].title,
          hint: C[0].hint,
          runtime: M.value["l-rules"],
          "is-current": R.value === "l-rules"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", nn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!D.value,
                onClick: Q
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(D.value === "l-rules" ? "ri-loader-4-line spin" : "ri-radar-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(c.$t("库存巡检")),
                  1
                  /* TEXT */
                )
              ], 8, sn),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!D.value,
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
                  e.toDisplayString(c.$t("同步库存表")),
                  1
                  /* TEXT */
                )
              ], 8, on),
              e.createElementVNode(
                "span",
                an,
                e.toDisplayString(e.unref(y)?.settings.autoDelistLocal ? c.$t("售罄款会自动从门店试穿手机端下架（只动本机，网店要人确认）") : c.$t("只提醒，不自动下架")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "p",
              rn,
              e.toDisplayString(c.$t("库存是自动下架的前提：导入收银 / 进销存导出的「货号 × 尺码 × 库存」表同步到商品库；读不到库存时只做上架与人工下架。")),
              1
              /* TEXT */
            ),
            z.value ? (e.openBlock(), e.createElementBlock("p", cn, [
              t[1] || (t[1] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(z.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            V.value && !S.value.length ? (e.openBlock(), e.createElementBlock("p", dn, [
              t[2] || (t[2] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(c.$t("没有需要处理的款")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            S.value.length ? (e.openBlock(), e.createElementBlock("div", un, [
              e.createElementVNode("table", mn, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(c.$t("商品")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(c.$t("规则")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(c.$t("情况")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(c.$t("建议")),
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
                    e.renderList(S.value, (i, d) => (e.openBlock(), e.createElementBlock("tr", { key: d }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(l.garmentName)(i.garmentId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", i.rule === "soldout" ? "bad" : "warn"])
                          },
                          e.toDisplayString(p(i.rule)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        pn,
                        e.toDisplayString(i.detail),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("select", {
                          "onUpdate:modelValue": (I) => j[`${i.garmentId}:${i.rule}`] = I,
                          class: "ba-mini"
                        }, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(i.options || [i.action], (I) => (e.openBlock(), e.createElementBlock("option", {
                              key: I,
                              value: I
                            }, e.toDisplayString(H(I)) + e.toDisplayString(I === i.action ? c.$t("（默认）") : ""), 9, yn))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 8, vn), [
                          [e.vModelSelect, j[`${i.garmentId}:${i.rule}`]]
                        ])
                      ]),
                      e.createElementVNode("td", hn, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm",
                          disabled: !!D.value,
                          onClick: (I) => u(i)
                        }, e.toDisplayString(c.$t("执行")), 9, kn),
                        f(i.garmentId) ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: (I) => G(i.garmentId, !1)
                        }, e.toDisplayString(c.$t("门店手机端下架")), 9, Vn)) : e.createCommentVNode("v-if", !0)
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
          title: C[1].title,
          hint: C[1].hint,
          runtime: M.value["l-pick"],
          "is-current": R.value === "l-pick"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", gn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList($.value, (i) => (e.openBlock(), e.createElementBlock("button", {
                  key: i.id,
                  type: "button",
                  class: e.normalizeClass({ on: o.value.includes(i.id) }),
                  onClick: (d) => E(o.value, i.id)
                }, [
                  e.createElementVNode("img", {
                    src: e.unref(l.fileUrl)(i.image),
                    alt: "",
                    loading: "lazy"
                  }, null, 8, Nn),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(i.name),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    "¥" + e.toDisplayString(i.price),
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
                e.toDisplayString(c.$t("上架渠道")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(U.value, (i) => (e.openBlock(), e.createElementBlock("label", {
                  key: i.id,
                  class: "ba-check"
                }, [
                  e.createElementVNode("input", {
                    type: "checkbox",
                    checked: a.value.includes(i.id),
                    onChange: (d) => E(a.value, i.id)
                  }, null, 40, $n),
                  e.createTextVNode(
                    e.toDisplayString(i.name),
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
          title: C[2].title,
          hint: C[2].hint,
          runtime: M.value["l-gen"],
          "is-current": R.value === "l-gen"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", _n, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!D.value || !o.value.length || !a.value.length,
                onClick: X
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(D.value === "l-gen" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(c.$t("生成 {n} 份上架草稿", { n: o.value.length * a.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, Sn),
              e.createElementVNode(
                "span",
                Dn,
                e.toDisplayString(c.$t("主图 = 商品图 + 该款试穿图，按渠道比例补白边")),
                1
                /* TEXT */
              )
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(b.value, (i) => (e.openBlock(), e.createElementBlock("p", {
                key: i,
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
                  e.toDisplayString(i),
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
          title: C[3].title,
          hint: C[3].hint,
          runtime: M.value["l-confirm"],
          "is-current": R.value === "l-confirm"
        }, {
          default: e.withCtx(() => [
            A.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              Bn,
              e.toDisplayString(c.$t("生成后的草稿在这里逐条确认")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(A.value, (i) => (e.openBlock(), e.createElementBlock("div", {
                key: i.id,
                class: "ba-listing"
              }, [
                e.createElementVNode("div", wn, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(i.images.slice(0, 4), (d) => (e.openBlock(), e.createElementBlock("img", {
                      key: d,
                      src: e.unref(l.fileUrl)(d),
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
                      e.toDisplayString(s(i.channelId)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      An,
                      e.toDisplayString(e.unref(l.garmentName)(i.garmentId)) + " · ¥" + e.toDisplayString(i.price),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", i.status === "confirmed" ? "ok" : ""])
                      },
                      e.toDisplayString(r(i.status)),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(i.warnings, (d) => (e.openBlock(), e.createElementBlock("p", {
                      key: d,
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
                        e.toDisplayString(d),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (d) => N[i.id].title = d,
                    type: "text"
                  }, null, 8, Mn), [
                    [e.vModelText, N[i.id].title]
                  ]),
                  e.withDirectives(e.createElementVNode("textarea", {
                    "onUpdate:modelValue": (d) => N[i.id].points = d,
                    rows: "2",
                    placeholder: c.$t("卖点，一行一条")
                  }, null, 8, In), [
                    [e.vModelText, N[i.id].points]
                  ]),
                  e.withDirectives(e.createElementVNode("textarea", {
                    "onUpdate:modelValue": (d) => N[i.id].detail = d,
                    rows: "3"
                  }, null, 8, Fn), [
                    [e.vModelText, N[i.id].detail]
                  ]),
                  e.createElementVNode("div", Un, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!D.value,
                      onClick: (d) => te(i.id)
                    }, [
                      t[6] || (t[6] = e.createElementVNode(
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
                    ], 8, Rn),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm primary",
                      disabled: !!D.value || i.status === "confirmed" || i.warnings.length > 0,
                      onClick: (d) => le(i.id)
                    }, [
                      t[7] || (t[7] = e.createElementVNode(
                        "i",
                        { class: "ri-check-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(c.$t("确认")),
                        1
                        /* TEXT */
                      )
                    ], 8, On),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (d) => Z(i.id)
                    }, e.toDisplayString(c.$t("删除")), 9, Pn)
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
          title: C[4].title,
          hint: C[4].hint,
          runtime: M.value["l-hand"],
          "is-current": R.value === "l-hand"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode(
              "p",
              zn,
              e.toDisplayString(c.$t("先在内置浏览器里登录各网店后台。数字员工按草稿填写，停在「提交 / 发布」前截图给你，由你亲自点提交。")),
              1
              /* TEXT */
            ),
            v.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              Kn,
              e.toDisplayString(c.$t("没有待上架的已确认草稿")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(v.value, (i) => (e.openBlock(), e.createElementBlock("div", {
                key: i.id,
                class: "ss-actions"
              }, [
                e.createElementVNode(
                  "span",
                  jn,
                  e.toDisplayString(s(i.channelId)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.title),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: !!D.value,
                  onClick: (d) => ne(i.id)
                }, [
                  t[8] || (t[8] = e.createElementVNode(
                    "i",
                    { class: "ri-robot-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(c.$t("交给数字员工上架")),
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
          title: C[5].title,
          hint: C[5].hint,
          runtime: M.value["l-ledger"],
          "is-current": R.value === "l-ledger"
        }, {
          default: e.withCtx(() => [
            g.value.length ? (e.openBlock(), e.createElementBlock("div", Jn, [
              e.createElementVNode("table", Hn, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(c.$t("商品")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(c.$t("渠道")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(c.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(c.$t("商品链接")),
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
                    e.renderList(g.value, (i) => (e.openBlock(), e.createElementBlock("tr", {
                      key: i.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(l.garmentName)(i.garmentId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(s(i.channelId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", i.status === "listed" ? "ok" : i.status === "delisted" ? "bad" : "brand"])
                          },
                          e.toDisplayString(r(i.status)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (d) => L[i.id] = d,
                          type: "text",
                          placeholder: c.$t("上架成功后粘贴商品链接"),
                          onChange: (d) => k(i.id)
                        }, null, 40, Gn), [
                          [e.vModelText, L[i.id]]
                        ])
                      ]),
                      e.createElementVNode("td", Yn, [
                        i.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: (d) => h(i.conversationId)
                        }, e.toDisplayString(c.$t("查看执行过程")), 9, Qn)) : e.createCommentVNode("v-if", !0),
                        i.status === "handed" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 1,
                          type: "button",
                          class: "ss-link",
                          onClick: (d) => m(i.id, "listed")
                        }, e.toDisplayString(c.$t("已上架")), 9, xn)) : e.createCommentVNode("v-if", !0),
                        i.status === "listed" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 2,
                          type: "button",
                          class: "ss-link",
                          onClick: (d) => m(i.id, "delisted")
                        }, e.toDisplayString(c.$t("标记已下架")), 9, Xn)) : e.createCommentVNode("v-if", !0)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              qn,
              e.toDisplayString(c.$t("还没有上架记录")),
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
}), es = /* @__PURE__ */ x(Zn, [["__scopeId", "data-v-aa93eb57"]]), ts = { class: "ss-module" }, ls = { class: "ss-steps" }, ns = { class: "ss-actions" }, ss = ["disabled"], os = { class: "ss-muted" }, as = { class: "ss-actions" }, is = ["disabled"], rs = { class: "ss-muted" }, cs = { class: "ss-muted" }, ds = { class: "ss-actions" }, us = ["disabled"], ms = { class: "ss-muted" }, ps = { class: "ss-actions" }, vs = { class: "ss-field" }, ys = { class: "ss-field" }, hs = ["disabled"], ks = { class: "ss-kpis" }, Vs = { class: "ss-kpi accent" }, gs = { key: 0 }, bs = { class: "ss-kpi" }, Ns = { class: "ss-kpi" }, fs = { class: "ss-kpi" }, Es = { class: "ss-kpi" }, $s = { class: "ss-kpi" }, _s = { class: "ss-kpi" }, Ss = { class: "ss-kpi" }, Ds = { key: 0 }, Bs = {
  key: 0,
  class: "ss-note warn"
}, ws = ["title"], Cs = ["title"], Ts = {
  key: 2,
  class: "ss-note warn"
}, Ls = { class: "ba-blocks" }, As = {
  key: 0,
  class: "ss-muted"
}, Ms = { class: "ss-actions" }, Is = { class: "ss-subhead" }, Fs = { value: "amount" }, Us = { value: "qty" }, Rs = { value: "grossProfit" }, Os = { value: "sellThrough" }, Ps = { class: "ss-table-wrap ba-scroll" }, zs = { class: "ss-table" }, Ks = { class: "num" }, js = { class: "num" }, Ws = { class: "num" }, qs = { class: "num" }, Js = { class: "num" }, Hs = { class: "num" }, Gs = { class: "num" }, Ys = { class: "num" }, Qs = { class: "ss-subhead" }, xs = { class: "ba-slow" }, Xs = { class: "ss-actions" }, Zs = ["disabled", "onClick"], eo = ["disabled"], to = {
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
        return () => m.items.length ? e.h("ul", { class: "ba-imports" }, m.items.slice(0, 5).map((k) => e.h("li", {}, n.t("{p0}：{a} ~ {b}，{n} 行（跳过 {m} 行）· 识别列 {c}", { p0: k.file, a: k.from, b: k.to, n: k.rows, m: k.skipped, c: Object.values(k.mapping).join(" / ") })))) : null;
      }
    }), T = Y.useNotificationStore(), y = ee.useRouter(), $ = l.baState, U = ["daily", "weekly", "monthly"], S = e.computed(() => $.value?.imports || []), w = e.computed(() => $.value?.reports || []), A = e.ref(""), v = e.computed(() => w.value.find((m) => m.id === A.value) || w.value[0] || null), g = e.ref(""), o = e.ref(""), a = e.ref(null), V = e.ref(!1), b = e.ref(""), N = e.ref(""), L = e.ref({});
    e.onMounted(async () => {
      const m = await l.ba("finance.range").catch(() => ({ from: "", to: "" }));
      if (m.to) {
        o.value = m.to;
        const k = /* @__PURE__ */ new Date(`${m.to}T00:00:00`);
        k.setDate(k.getDate() - 29), g.value = k.toISOString().slice(0, 10) < m.from ? m.from : k.toISOString().slice(0, 10);
      }
    });
    const D = [
      { key: "f-sales", title: n.t("导入销售数据"), hint: n.t("收银系统 / 网店导出的销售明细（只读）") },
      { key: "f-expense", title: n.t("导入费用"), hint: n.t("房租、工资、水电、推广等，可跳过") },
      { key: "f-metrics", title: n.t("经营指标"), hint: n.t("营业额、毛利、客单价、连带率、费用率、售罄率") },
      { key: "f-report", title: n.t("生成报表"), hint: n.t("日报 / 周报 / 月报；解读里的数字回原数据核对") },
      { key: "f-push", title: n.t("推送与导出"), hint: n.t("企业微信 / 钉钉 / 邮件，或导出 Excel") },
      { key: "f-qa", title: n.t("随时问数"), hint: n.t("用大白话问，回答注明期间与口径") }
    ];
    function _(m, k, h) {
      return N.value === m ? { state: "running" } : L.value[m] ? { state: "failed", error: L.value[m] } : k ? { state: "done", summary: h } : { state: "todo" };
    }
    const C = e.computed(() => ({
      "f-sales": _("f-sales", ($.value?.salesRows || 0) > 0, n.t("{n} 行", { n: $.value?.salesRows || 0 })),
      "f-expense": _("f-expense", ($.value?.expenseRows || 0) > 0 || V.value, $.value?.expenseRows ? n.t("{n} 行", { n: $.value.expenseRows }) : n.t("已跳过")),
      "f-metrics": _("f-metrics", !!a.value || w.value.length > 0),
      "f-report": _("f-report", !!v.value, v.value ? `${v.value.metrics.from} ~ ${v.value.metrics.to}` : ""),
      "f-push": _("f-push", !!v.value && (!!v.value.pushed?.some((m) => m.ok) || !!v.value.exportPath)),
      "f-qa": _("f-qa", ($.value?.qa.length || 0) > 0)
    })), B = e.computed(() => D.find((m) => C.value[m.key].state !== "done")?.key || "f-qa"), M = e.computed(() => {
      const m = a.value;
      return m ? [
        { title: n.t("渠道"), rows: m.byChannel.slice(0, 6), pct: !1 },
        { title: n.t("品类"), rows: m.byCategory.slice(0, 6), pct: !1 },
        { title: n.t("畅销款"), rows: m.topItems.slice(0, 6).map((k) => ({ ...k, share: m.netRevenue ? k.value / m.netRevenue : 0 })), pct: !1 },
        { title: n.t("售罄率"), rows: m.sellThrough.slice(0, 6), pct: !0 }
      ] : [];
    }), R = e.ref("amount"), j = e.computed(() => [...a.value?.items || []].sort((m, k) => (k[R.value] ?? -1) - (m[R.value] ?? -1)).slice(0, 30)), H = e.computed(() => Math.max(1, ...a.value?.daily.map((m) => m.netRevenue) || [1])), z = e.ref([]);
    async function W() {
      await f("f-sales", async () => {
        if (z.value = await l.ba("finance.folderImport"), !z.value.length) throw new Error(n.t("还没有配置共享文件夹：到「设置 → 共享文件夹取数」选择"));
      });
    }
    async function u() {
      v.value && await f("f-push", async () => {
        const m = await l.ba("finance.exportPdf", { id: v.value.id });
        await l.openPath(m, !0);
      });
    }
    async function p() {
      if (!v.value || !window.confirm(n.t("把 {a} ~ {b} 的营业额、成本、费用汇总成序时账草稿，导入财务智能体当前账套？金额为含税，价税分离与科目请在财务智能体里复核。", { a: v.value.metrics.from, b: v.value.metrics.to }))) return;
      await f("f-push", async () => {
        const k = await l.ba("finance.toJournal", { id: v.value.id }), h = window.electronAPI, q = h?.workbenches?.financeAgent, c = new Error(n.t("财务智能体未开通，序时账已导出：{p0}", { p0: k })), t = await h?.solutionPkg?.prepare?.({ id: "workbench-finance-agent" }).catch(() => null);
        if (!q?.invoke || t && t.ok === !1) throw c;
        try {
          await q.invoke("data.importJournal", { path: k, append: !0 });
        } catch (i) {
          throw /No handler registered/i.test(String(i?.message)) ? c : i;
        }
      }) && (T.success(n.t("已导入财务智能体")), y.push("/workbenches/finance-agent"));
    }
    const r = (m) => ({ daily: n.t("日报（昨天）"), weekly: n.t("周报（上周）"), monthly: n.t("月报（上月）"), custom: n.t("自定义期间") })[m];
    function s(m, k) {
      if (!k) return "";
      const h = (m - k) / k;
      return `${h >= 0 ? "↑" : "↓"} ${l.fmtPct(Math.abs(h), 1)} ${n.t("较上期")}`;
    }
    async function f(m, k) {
      N.value = m, L.value = { ...L.value, [m]: "" };
      try {
        return await k(), await l.refreshState(), !0;
      } catch (h) {
        return L.value = { ...L.value, [m]: l.errorMessage(h) }, l.scrollToStep(m), !1;
      } finally {
        N.value = "";
      }
    }
    async function E(m) {
      const k = await l.pickFiles("excel");
      k.length && await f(m === "sales" ? "f-sales" : "f-expense", async () => {
        if (await l.ba("finance.import", { path: k[0], kind: m }), m === "sales") {
          const h = await l.ba("finance.range");
          g.value || (g.value = h.from), o.value || (o.value = h.to);
        }
      });
    }
    async function P(m) {
      window.confirm(n.t("清空已导入的数据？")) && (await f("f-sales", () => l.ba("finance.clear", { kind: m })), a.value = null);
    }
    async function Q() {
      await f("f-metrics", async () => {
        a.value = await l.ba("finance.metrics", { from: g.value, to: o.value });
      });
    }
    async function G(m) {
      await f("f-report", async () => {
        const k = await l.ba("finance.report", { kind: m, from: g.value, to: o.value });
        A.value = k.id, a.value = k.metrics;
      });
    }
    async function X() {
      if (!v.value) return;
      await f("f-push", () => l.ba("finance.push", { id: v.value.id })) && T.success(n.t("已推送"));
    }
    async function te() {
      v.value && await f("f-push", async () => {
        const m = await l.ba("finance.export", { id: v.value.id });
        await l.openPath(m, !0);
      });
    }
    async function le() {
      if (v.value)
        try {
          await navigator.clipboard.writeText(await l.ba("finance.reportText", { id: v.value.id })), T.success(n.t("已复制"));
        } catch (m) {
          T.error(l.errorMessage(m));
        }
    }
    async function Z() {
      await f("f-qa", () => l.ba("finance.ask", { q: b.value })) && (b.value = "");
    }
    function ne(m) {
      l.scrollToStep(m);
    }
    return (m, k) => (e.openBlock(), e.createElementBlock("div", ts, [
      e.createVNode(oe, {
        "module-key": "finance",
        icon: "ri-line-chart-line",
        title: m.$t("经营数据调取与统计"),
        ability: m.$t("导入收银系统 / 网店导出的销售明细与费用表（只读）→ 按固定口径算营业额、毛利、客单价、连带率、售罄率 → 模型只写解读，解读里的数字逐个回原数据核对 → 推送、导出"),
        output: m.$t("经营日报 / 周报 / 月报、Excel 报表、随时问数；数字全部由规则计算")
      }, null, 8, ["title", "ability", "output"]),
      e.createVNode(se, {
        title: m.$t("经营数据"),
        metas: D,
        runtime: C.value,
        "current-key": B.value,
        onJump: ne
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", ls, [
        e.createVNode(O, {
          "step-key": "f-sales",
          index: 0,
          title: D[0].title,
          hint: D[0].hint,
          runtime: C.value["f-sales"],
          "is-current": B.value === "f-sales"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", ns, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!N.value,
                onClick: k[0] || (k[0] = (h) => E("sales"))
              }, [
                k[10] || (k[10] = e.createElementVNode(
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
                e.toDisplayString(m.$t("已有 {n} 行。列：日期、单号、商品 / 货号、品类、数量、实收金额、成本（可选）、渠道（可选）；同一日期段重复导入会覆盖", { n: e.unref($)?.salesRows || 0 })),
                1
                /* TEXT */
              ),
              e.unref($)?.salesRows ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: k[1] || (k[1] = (h) => P("sales"))
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
                disabled: !!N.value,
                onClick: W
              }, [
                k[11] || (k[11] = e.createElementVNode(
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
              e.renderList(z.value, (h) => (e.openBlock(), e.createElementBlock(
                "p",
                {
                  key: h.kind,
                  class: e.normalizeClass(["ss-note", h.ok ? "ok" : "danger"])
                },
                [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(h.ok ? "ri-check-line" : "ri-error-warning-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(m.$t("{p0} {p1}：{p2}", { p0: h.kind, p1: h.file || "", p2: h.note })),
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
              items: S.value.filter((h) => h.kind === "sales")
            }, null, 8, ["items"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "f-expense",
          index: 1,
          title: D[1].title,
          hint: D[1].hint,
          runtime: C.value["f-expense"],
          "is-current": B.value === "f-expense"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", ds, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!N.value,
                onClick: k[2] || (k[2] = (h) => E("expense"))
              }, [
                k[12] || (k[12] = e.createElementVNode(
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
                  onClick: k[3] || (k[3] = (h) => V.value = !0)
                },
                e.toDisplayString(m.$t("没有，跳过")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                ms,
                e.toDisplayString(m.$t("已有 {n} 行。列：日期 / 月份、费用项目、金额（房租、工资、水电、推广等）", { n: e.unref($)?.expenseRows || 0 })),
                1
                /* TEXT */
              )
            ]),
            e.createVNode(e.unref(F), {
              items: S.value.filter((h) => h.kind === "expense")
            }, null, 8, ["items"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(O, {
          "step-key": "f-metrics",
          index: 2,
          title: D[2].title,
          hint: D[2].hint,
          runtime: C.value["f-metrics"],
          "is-current": B.value === "f-metrics"
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
                    "onUpdate:modelValue": k[4] || (k[4] = (h) => g.value = h),
                    type: "date"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, g.value]
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
                    "onUpdate:modelValue": k[5] || (k[5] = (h) => o.value = h),
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
                disabled: !!N.value || !e.unref($)?.salesRows,
                onClick: Q
              }, [
                k[13] || (k[13] = e.createElementVNode(
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
            a.value ? (e.openBlock(), e.createElementBlock(
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
                      e.toDisplayString(e.unref(l.fmtMoney)(a.value.netRevenue)),
                      1
                      /* TEXT */
                    ),
                    a.value.prev ? (e.openBlock(), e.createElementBlock(
                      "small",
                      gs,
                      e.toDisplayString(s(a.value.netRevenue, a.value.prev.revenue)),
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
                      e.toDisplayString(e.unref(l.fmtMoney)(a.value.grossProfit)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("毛利率 {p0}", { p0: e.unref(l.fmtPct)(a.value.grossMargin, 1) })),
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
                      e.toDisplayString(a.value.orders),
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
                      e.toDisplayString(e.unref(l.fmtMoney)(a.value.avgOrderValue)),
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
                      e.toDisplayString(a.value.unitsPerOrder),
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
                      e.toDisplayString(e.unref(l.fmtMoney)(a.value.expenses)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("费用率 {p0}", { p0: e.unref(l.fmtPct)(a.value.expenseRate, 1) })),
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
                      e.toDisplayString(e.unref(l.fmtMoney)(a.value.netProfit)),
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
                      e.toDisplayString(a.value.turnoverDays ?? "—"),
                      1
                      /* TEXT */
                    ),
                    a.value.inventoryValue != null ? (e.openBlock(), e.createElementBlock(
                      "small",
                      Ds,
                      e.toDisplayString(m.$t("库存金额约 {p0}", { p0: e.unref(l.fmtMoney)(a.value.inventoryValue) })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                a.value.lastDataDay && a.value.lastDataDay < o.value ? (e.openBlock(), e.createElementBlock("p", Bs, [
                  k[14] || (k[14] = e.createElementVNode(
                    "i",
                    { class: "ri-time-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(m.$t("销售数据只到 {p0}，之后的日期还没取到数据", { p0: a.value.lastDataDay })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                a.value.daily.length > 1 ? (e.openBlock(), e.createElementBlock("div", {
                  key: 1,
                  class: "ba-trend",
                  title: m.$t("每日净营业额")
                }, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(a.value.daily, (h) => (e.openBlock(), e.createElementBlock("i", {
                      key: h.day,
                      style: e.normalizeStyle({ height: `${Math.max(2, Math.max(0, h.netRevenue) / H.value * 100)}%` }),
                      title: `${h.day}：${e.unref(l.fmtMoney)(h.netRevenue)}`
                    }, null, 12, Cs))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ], 8, ws)) : e.createCommentVNode("v-if", !0),
                a.value.costCoverage < 1 ? (e.openBlock(), e.createElementBlock("p", Ts, [
                  k[15] || (k[15] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(m.$t("只有 {p0} 的销售带成本，毛利按带成本的部分计算；导入带「成本」列的明细后更准", { p0: e.unref(l.fmtPct)(a.value.costCoverage, 0) })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", Ls, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(M.value, (h) => (e.openBlock(), e.createElementBlock("div", {
                      key: h.title,
                      class: "ba-block"
                    }, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(h.title),
                        1
                        /* TEXT */
                      ),
                      h.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", As, "—")),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(h.rows, (q) => (e.openBlock(), e.createElementBlock("div", {
                          key: q.key,
                          class: "ba-bar"
                        }, [
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(q.label),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "i",
                            {
                              style: e.normalizeStyle({ width: `${Math.max(2, (h.pct ? q.value : q.share ?? 0) * 100)}%` })
                            },
                            null,
                            4
                            /* STYLE */
                          ),
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(h.pct ? e.unref(l.fmtPct)(q.value, 0) : e.unref(l.fmtMoney)(q.value)),
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
                      "onUpdate:modelValue": k[6] || (k[6] = (h) => R.value = h),
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
                e.createElementVNode("div", Ps, [
                  e.createElementVNode("table", zs, [
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
                          qs,
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
                        e.renderList(j.value, (h) => (e.openBlock(), e.createElementBlock("tr", {
                          key: h.key
                        }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(h.label),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Js,
                            e.toDisplayString(h.qty),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Hs,
                            e.toDisplayString(e.unref(l.fmtMoney)(h.amount)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Gs,
                            e.toDisplayString(h.grossProfit == null ? "—" : e.unref(l.fmtMoney)(h.grossProfit)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Ys,
                            e.toDisplayString(h.sellThrough == null ? "—" : e.unref(l.fmtPct)(h.sellThrough, 0)),
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
                a.value.slowMovers.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 3 },
                  [
                    e.createElementVNode(
                      "span",
                      Qs,
                      e.toDisplayString(m.$t("滞销清单（有库存、本期卖出不超过 1 件）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", xs, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(a.value.slowMovers, (h) => (e.openBlock(), e.createElementBlock(
                          "span",
                          {
                            key: h.key,
                            class: "ss-chip warn"
                          },
                          e.toDisplayString(h.label) + " · " + e.toDisplayString(m.$t("库存 {a}，卖出 {b}", { a: h.stock, b: h.qty })),
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
          title: D[3].title,
          hint: D[3].hint,
          runtime: C.value["f-report"],
          "is-current": B.value === "f-report"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Xs, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(U, (h) => e.createElementVNode("button", {
                  key: h,
                  type: "button",
                  class: e.normalizeClass(["ss-btn sm", { primary: h === "daily" }]),
                  disabled: !!N.value || !e.unref($)?.salesRows,
                  onClick: (q) => G(h)
                }, e.toDisplayString(r(h)), 11, Zs)),
                64
                /* STABLE_FRAGMENT */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                disabled: !!N.value || !e.unref($)?.salesRows || !g.value || !o.value,
                onClick: k[7] || (k[7] = (h) => G("custom"))
              }, e.toDisplayString(m.$t("按上面选的期间")), 9, eo)
            ]),
            v.value ? (e.openBlock(), e.createElementBlock("div", to, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(r(v.value.kind)) + " · " + e.toDisplayString(v.value.metrics.from) + " ~ " + e.toDisplayString(v.value.metrics.to),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  lo,
                  e.toDisplayString(v.value.model ? m.$t("解读由 {p0} 撰写", { p0: e.unref(l.modelLabel)(v.value.model) }) : ""),
                  1
                  /* TEXT */
                )
              ]),
              v.value.staleNote ? (e.openBlock(), e.createElementBlock("p", no, [
                k[16] || (k[16] = e.createElementVNode(
                  "i",
                  { class: "ri-time-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(v.value.staleNote),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode(
                "pre",
                null,
                e.toDisplayString(v.value.commentary),
                1
                /* TEXT */
              ),
              v.value.unverified.length ? (e.openBlock(), e.createElementBlock("p", so, [
                k[17] || (k[17] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(m.$t("这些数字在数据里找不到来源，请核对后再发：{p0}", { p0: v.value.unverified.join("、") })),
                  1
                  /* TEXT */
                )
              ])) : v.value.model ? (e.openBlock(), e.createElementBlock("p", oo, [
                k[18] || (k[18] = e.createElementVNode(
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
                e.renderList(w.value.slice(0, 8), (h) => (e.openBlock(), e.createElementBlock("button", {
                  key: h.id,
                  type: "button",
                  class: e.normalizeClass(["ss-chip", { brand: h.id === v.value?.id }]),
                  onClick: (q) => A.value = h.id
                }, e.toDisplayString(r(h.kind)) + " " + e.toDisplayString(h.metrics.from), 11, ro))),
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
          title: D[4].title,
          hint: D[4].hint,
          runtime: C.value["f-push"],
          "is-current": B.value === "f-push"
        }, {
          default: e.withCtx(() => [
            v.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", co, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!N.value || !e.unref($)?.ready.push,
                    onClick: X
                  }, [
                    k[19] || (k[19] = e.createElementVNode(
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
                    disabled: !!N.value,
                    onClick: te
                  }, [
                    k[20] || (k[20] = e.createElementVNode(
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
                    disabled: !!N.value,
                    onClick: u
                  }, [
                    k[21] || (k[21] = e.createElementVNode(
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
                    k[22] || (k[22] = e.createElementVNode(
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
                    disabled: !!N.value,
                    onClick: p
                  }, [
                    k[23] || (k[23] = e.createElementVNode(
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
                  v.value.exportPath ? (e.openBlock(), e.createElementBlock(
                    "button",
                    {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: k[8] || (k[8] = (h) => e.unref(l.openPath)(v.value.exportPath, !0))
                    },
                    e.toDisplayString(m.$t("所在文件夹")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.unref($)?.ready.push ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  yo,
                  e.toDisplayString(m.$t("推送渠道在「设置 → 通知与推送」配置（企业微信 / 钉钉机器人、邮箱）")),
                  1
                  /* TEXT */
                )),
                v.value.pushed?.length ? (e.openBlock(), e.createElementBlock("div", ho, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(v.value.pushed, (h) => (e.openBlock(), e.createElementBlock("span", {
                      key: h.channel,
                      class: e.normalizeClass(["ss-chip", h.ok ? "ok" : "bad"]),
                      title: h.error
                    }, [
                      e.createTextVNode(
                        e.toDisplayString(h.channel) + " ",
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(h.ok ? "ri-check-line" : "ri-close-line")
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
          title: D[5].title,
          hint: D[5].hint,
          runtime: C.value["f-qa"],
          "is-current": B.value === "f-qa"
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
                  "onUpdate:modelValue": k[9] || (k[9] = (h) => b.value = h),
                  type: "text",
                  placeholder: m.$t("例如：上个月连衣裙卖了多少？哪个渠道毛利最高？")
                }, null, 8, Vo), [
                  [e.vModelText, b.value]
                ]),
                e.createElementVNode("button", {
                  type: "submit",
                  class: "ss-btn primary",
                  disabled: !!N.value || !b.value.trim() || !e.unref($)?.salesRows
                }, [
                  k[24] || (k[24] = e.createElementVNode(
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
              e.renderList((e.unref($)?.qa || []).slice(0, 6), (h, q) => (e.openBlock(), e.createElementBlock("div", {
                key: q,
                class: "ba-qa"
              }, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(h.q),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "pre",
                  null,
                  e.toDisplayString(h.a),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  bo,
                  e.toDisplayString(e.unref(l.fmtDateTime)(h.at)) + " · " + e.toDisplayString(e.unref(l.modelLabel)(h.model)),
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
}), fo = /* @__PURE__ */ x(No, [["__scopeId", "data-v-96ec09ec"]]), Eo = { class: "ba-sched" }, $o = { class: "ss-panel" }, _o = { class: "ba-head" }, So = { class: "ss-muted" }, Do = { class: "ba-jobs" }, Bo = { class: "ba-job" }, wo = { class: "ba-check" }, Co = { class: "ba-check" }, To = { class: "ss-muted" }, Lo = { class: "ba-job" }, Ao = { class: "ba-check" }, Mo = { class: "ss-muted" }, Io = { class: "ba-job" }, Fo = { class: "ba-check" }, Uo = ["value"], Ro = { class: "ss-muted" }, Oo = { class: "ba-job" }, Po = { class: "ba-check" }, zo = { class: "ss-muted" }, Ko = { class: "ba-job" }, jo = { class: "ba-check" }, Wo = { class: "ba-check" }, qo = { class: "ss-muted" }, Jo = { class: "ba-job" }, Ho = { class: "ba-check" }, Go = { class: "ss-muted" }, Yo = { class: "ss-muted" }, Qo = { class: "ba-job ba-job--cal" }, xo = { class: "ba-check" }, Xo = { class: "ss-muted" }, Zo = { class: "ba-cal" }, ea = ["onUpdate:modelValue"], ta = ["onUpdate:modelValue"], la = ["onUpdate:modelValue"], na = { value: "holiday" }, sa = { value: "store_opening" }, oa = ["onClick"], aa = { class: "ss-actions" }, ia = ["disabled"], ra = ["disabled"], ca = { class: "ss-panel" }, da = { class: "ba-head" }, ua = {
  key: 0,
  class: "ss-empty"
}, ma = { class: "ba-log" }, pa = { class: "ss-chip" }, va = /* @__PURE__ */ e.defineComponent({
  __name: "ScheduleTab",
  setup(K) {
    const F = Y.useNotificationStore(), T = [n.t("周日"), n.t("周一"), n.t("周二"), n.t("周三"), n.t("周四"), n.t("周五"), n.t("周六")], y = e.reactive({
      dailyReport: { enabled: !1, time: "08:30", push: !0 },
      inventoryPatrol: { enabled: !1, time: "09:00" },
      weeklyVideo: { enabled: !1, weekday: 1, time: "10:00" },
      monthlyReport: { enabled: !1, day: 1, time: "09:30", push: !0 },
      newArrival: { enabled: !1 },
      calendar: { enabled: !1, leadDays: 3, days: [] },
      folderImport: { enabled: !1, time: "08:00" }
    });
    e.watch(() => l.baState.value?.settings.schedule, (g) => {
      g && Object.assign(y, JSON.parse(JSON.stringify(g)));
    }, { immediate: !0 });
    const $ = e.computed(() => JSON.stringify(y) !== JSON.stringify(l.baState.value?.settings.schedule)), U = e.computed(() => l.baState.value?.log || []), S = e.ref(!1);
    async function w() {
      try {
        await l.ba("settings.patch", { patch: { schedule: y } }), await l.refreshState(), F.success(n.t("已保存"));
      } catch (g) {
        F.error(l.errorMessage(g));
      }
    }
    async function A() {
      S.value = !0;
      try {
        $.value && await w(), await l.ba("schedule.runNow"), await l.refreshState();
      } catch (g) {
        F.error(l.errorMessage(g));
      } finally {
        S.value = !1;
      }
    }
    async function v() {
      await l.ba("log.clear").catch(() => {
      }), await l.refreshState();
    }
    return (g, o) => (e.openBlock(), e.createElementBlock("div", Eo, [
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
              e.toDisplayString(g.$t("定时任务与模块联动")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            So,
            e.toDisplayString(g.$t("应用开着时每分钟检查一次，到点执行；错过的当天补跑一次")),
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
                  "onUpdate:modelValue": o[0] || (o[0] = (a) => y.dailyReport.enabled = a),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, y.dailyReport.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(g.$t("经营日报")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(g.$t("每天")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[1] || (o[1] = (a) => y.dailyReport.time = a),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, y.dailyReport.time]
              ])
            ]),
            e.createElementVNode("label", Co, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[2] || (o[2] = (a) => y.dailyReport.push = a),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, y.dailyReport.push]
              ]),
              e.createTextVNode(
                e.toDisplayString(g.$t("生成后推送")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "small",
              To,
              e.toDisplayString(g.$t("模块 D：取昨天数据 → 指标 → 解读 → 推送店长")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Lo, [
            e.createElementVNode("label", Ao, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[3] || (o[3] = (a) => y.inventoryPatrol.enabled = a),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, y.inventoryPatrol.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(g.$t("库存巡检")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(g.$t("每天")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[4] || (o[4] = (a) => y.inventoryPatrol.time = a),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, y.inventoryPatrol.time]
              ])
            ]),
            e.createElementVNode(
              "small",
              Mo,
              e.toDisplayString(g.$t("模块 C：售罄下架（门店手机端）、断码 / 过季提醒")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Io, [
            e.createElementVNode("label", Fo, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[5] || (o[5] = (a) => y.weeklyVideo.enabled = a),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, y.weeklyVideo.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(g.$t("本周主推视频")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": o[6] || (o[6] = (a) => y.weeklyVideo.weekday = a)
                },
                [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(T, (a, V) => e.createElementVNode("option", {
                      key: V,
                      value: V
                    }, e.toDisplayString(a), 9, Uo)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelSelect,
                  y.weeklyVideo.weekday,
                  void 0,
                  { number: !0 }
                ]
              ]),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[7] || (o[7] = (a) => y.weeklyVideo.time = a),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, y.weeklyVideo.time]
              ])
            ]),
            e.createElementVNode(
              "small",
              Ro,
              e.toDisplayString(g.$t("模块 A：按上周销量前 3 款写好脚本，等你审核后成片发布（不会自动发出去）")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Oo, [
            e.createElementVNode("label", Po, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[8] || (o[8] = (a) => y.folderImport.enabled = a),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, y.folderImport.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(g.$t("共享文件夹取数")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(g.$t("每天")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[9] || (o[9] = (a) => y.folderImport.time = a),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, y.folderImport.time]
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
              zo,
              e.toDisplayString(g.$t("模块 D：从「设置」里配置的文件夹取最新的销售 / 费用 / 库存表，排在日报之前；失败会提醒")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Ko, [
            e.createElementVNode("label", jo, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[10] || (o[10] = (a) => y.monthlyReport.enabled = a),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, y.monthlyReport.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(g.$t("经营月报")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(g.$t("每月 {n} 日", { n: y.monthlyReport.day })) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[11] || (o[11] = (a) => y.monthlyReport.time = a),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, y.monthlyReport.time]
              ])
            ]),
            e.createElementVNode("label", Wo, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[12] || (o[12] = (a) => y.monthlyReport.push = a),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, y.monthlyReport.push]
              ]),
              e.createTextVNode(
                e.toDisplayString(g.$t("生成后推送")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "small",
              qo,
              e.toDisplayString(g.$t("模块 D：上月月报推送老板")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Jo, [
            e.createElementVNode("label", Ho, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[13] || (o[13] = (a) => y.newArrival.enabled = a),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, y.newArrival.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(g.$t("新品入库联动")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "span",
              Go,
              e.toDisplayString(g.$t("随时")),
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
              e.toDisplayString(g.$t("新款导入商品库后：模块 C 生成上架草稿、模块 A 写新品上新视频脚本，都等你审核")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Qo, [
            e.createElementVNode("label", xo, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[14] || (o[14] = (a) => y.calendar.enabled = a),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, y.calendar.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(g.$t("节日 / 周年数字人")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(g.$t("提前")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[15] || (o[15] = (a) => y.calendar.leadDays = a),
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
                  y.calendar.leadDays,
                  void 0,
                  { number: !0 }
                ]
              ]),
              e.createTextVNode(
                " " + e.toDisplayString(g.$t("天")),
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
              e.toDisplayString(g.$t("模块 B：到日子前生成数字人祝福讲稿草稿，等你审核后成片发布")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Zo, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(y.calendar.days, (a, V) => (e.openBlock(), e.createElementBlock("span", {
                  key: V,
                  class: "ba-cal__day"
                }, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (b) => a.date = b,
                    type: "text",
                    placeholder: "MM-DD",
                    class: "ba-num"
                  }, null, 8, ea), [
                    [e.vModelText, a.date]
                  ]),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (b) => a.name = b,
                    type: "text"
                  }, null, 8, ta), [
                    [e.vModelText, a.name]
                  ]),
                  e.withDirectives(e.createElementVNode("select", {
                    "onUpdate:modelValue": (b) => a.topic = b
                  }, [
                    e.createElementVNode(
                      "option",
                      na,
                      e.toDisplayString(g.$t("节日")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      sa,
                      e.toDisplayString(g.$t("开业周年")),
                      1
                      /* TEXT */
                    )
                  ], 8, la), [
                    [e.vModelSelect, a.topic]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (b) => y.calendar.days.splice(V, 1)
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
                onClick: o[16] || (o[16] = (a) => y.calendar.days.push({ date: "", name: "", topic: "holiday" }))
              }, [
                o[21] || (o[21] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(g.$t("加一天（农历节日每年日期不同，请按当年日期填）")),
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
            disabled: !$.value,
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
              e.toDisplayString(g.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, ia),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: S.value,
            onClick: A
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(S.value ? "ri-loader-4-line spin" : "ri-play-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(g.$t("立即执行一次已开启的任务")),
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
            e.toDisplayString(g.$t("执行记录")),
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
              onClick: v
            },
            e.toDisplayString(g.$t("清空")),
            1
            /* TEXT */
          )
        ]),
        U.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "p",
          ua,
          e.toDisplayString(g.$t("暂无")),
          1
          /* TEXT */
        )),
        e.createElementVNode("ul", ma, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(U.value, (a, V) => (e.openBlock(), e.createElementBlock(
              "li",
              {
                key: V,
                class: e.normalizeClass({ bad: !a.ok })
              },
              [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(e.unref(l.fmtDateTime)(a.at)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  pa,
                  e.toDisplayString(a.module === "schedule" ? g.$t("定时") : e.unref(l.moduleTitle)(a.module)),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(a.text),
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
}), ya = /* @__PURE__ */ x(va, [["__scopeId", "data-v-8729ccfc"]]), ha = {
  key: 0,
  class: "ba-set"
}, ka = { class: "ss-panel" }, Va = { class: "ba-head" }, ga = { class: "ss-grid" }, ba = { class: "ss-field" }, Na = { class: "ss-field" }, fa = { class: "ss-field" }, Ea = { class: "ss-muted" }, $a = { class: "ss-panel" }, _a = { class: "ba-head" }, Sa = { class: "ss-muted" }, Da = ["onClick"], Ba = ["onClick"], wa = { class: "ss-panel" }, Ca = { class: "ba-head" }, Ta = { class: "ss-table-wrap" }, La = { class: "ss-table" }, Aa = ["title"], Ma = ["onUpdate:modelValue"], Ia = ["onUpdate:modelValue"], Fa = ["onUpdate:modelValue"], Ua = ["onUpdate:modelValue"], Ra = ["onUpdate:modelValue"], Oa = ["checked", "onChange"], Pa = { class: "ss-panel" }, za = { class: "ba-head" }, Ka = { class: "ba-check" }, ja = { class: "ss-field" }, Wa = { class: "ba-seasons" }, qa = { class: "ss-subhead" }, Ja = ["value", "placeholder", "onChange"], Ha = { class: "ss-panel" }, Ga = { class: "ba-head" }, Ya = { class: "ba-ready" }, Qa = { class: "ss-actions" }, xa = ["disabled"], Xa = {
  key: 0,
  class: "ss-muted"
}, Za = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(K) {
    const F = Y.useNotificationStore(), T = e.computed(() => l.baState.value), y = e.reactive({}), $ = e.ref("");
    e.watch(() => T.value?.settings, (a) => {
      a && (Object.assign(y, JSON.parse(JSON.stringify(a))), $.value = a.coreSizes.join(","));
    }, { immediate: !0 });
    const U = e.computed(() => !!T.value && JSON.stringify({ ...y, coreSizes: g($.value) }) !== JSON.stringify(T.value.settings)), S = [
      { key: "sales", label: n.t("销售明细") },
      { key: "expense", label: n.t("费用") },
      { key: "inventory", label: n.t("库存快照") }
    ];
    async function w(a) {
      const V = await l.ba("dirs.pick").catch(() => "");
      V && (y.dataFolders = { ...y.dataFolders, [a]: V });
    }
    function A(a, V) {
      if (V.checked && !window.confirm(n.t("打开「{p0}」全自动提交？数字员工填完后会直接提交上架 / 下架，不再等你确认。建议稳定运行两周后再打开。", { p0: a.name }))) {
        V.checked = !1;
        return;
      }
      a.autoSubmit = V.checked;
    }
    function v(a) {
      return [...new Set(a.split(/[,，\s]+/).map(Number).filter((V) => Number.isInteger(V) && V >= 1 && V <= 12))];
    }
    function g(a) {
      return a.split(/[,，\s]+/).map((V) => V.trim().toUpperCase()).filter(Boolean);
    }
    async function o() {
      try {
        await l.ba("settings.patch", { patch: { brandName: y.brandName, storeAddress: y.storeAddress, openingHours: y.openingHours, dataFolders: y.dataFolders, channels: y.channels, seasonMonths: y.seasonMonths, coreSizes: g($.value), autoDelistLocal: y.autoDelistLocal } }), await l.refreshState(), F.success(n.t("已保存"));
      } catch (a) {
        F.error(l.errorMessage(a));
      }
    }
    return (a, V) => T.value ? (e.openBlock(), e.createElementBlock("div", ha, [
      e.createElementVNode("section", ka, [
        e.createElementVNode("header", Va, [
          e.createElementVNode("strong", null, [
            V[5] || (V[5] = e.createElementVNode(
              "i",
              { class: "ri-store-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.$t("品牌与输出")),
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
              e.toDisplayString(a.$t("品牌 / 门店名（视频顶部标题、报表抬头）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": V[0] || (V[0] = (b) => y.brandName = b),
                type: "text",
                maxlength: "30"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                y.brandName,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Na, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("门店地址（数字人片尾）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": V[1] || (V[1] = (b) => y.storeAddress = b),
                type: "text",
                maxlength: "80"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                y.storeAddress,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", fa, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(a.$t("营业时间（数字人片尾）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": V[2] || (V[2] = (b) => y.openingHours = b),
                type: "text",
                maxlength: "40"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                y.openingHours,
                void 0,
                { trim: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode(
          "p",
          Ea,
          e.toDisplayString(a.$t("输出目录：{p0}", { p0: T.value.outputDir })),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", $a, [
        e.createElementVNode("header", _a, [
          e.createElementVNode("strong", null, [
            V[6] || (V[6] = e.createElementVNode(
              "i",
              { class: "ri-folder-received-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.$t("共享文件夹取数")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode(
          "p",
          Sa,
          e.toDisplayString(a.$t("收银 / 进销存系统每天把报表导出到这些文件夹（或数字员工登录后台导出到这里），定时任务取最新一份；只读，不改原文件。")),
          1
          /* TEXT */
        ),
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(S, (b) => e.createElementVNode("div", {
            key: b.key,
            class: "ba-folder"
          }, [
            e.createElementVNode(
              "b",
              null,
              e.toDisplayString(b.label),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "code",
              null,
              e.toDisplayString(y.dataFolders?.[b.key] || a.$t("未设置")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm",
              onClick: (N) => w(b.key)
            }, [
              V[7] || (V[7] = e.createElementVNode(
                "i",
                { class: "ri-folder-open-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(a.$t("选择文件夹")),
                1
                /* TEXT */
              )
            ], 8, Da),
            y.dataFolders?.[b.key] ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-link",
              onClick: (N) => y.dataFolders[b.key] = ""
            }, e.toDisplayString(a.$t("清除")), 9, Ba)) : e.createCommentVNode("v-if", !0)
          ])),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      e.createElementVNode("section", wa, [
        e.createElementVNode("header", Ca, [
          e.createElementVNode("strong", null, [
            V[8] || (V[8] = e.createElementVNode(
              "i",
              { class: "ri-store-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.$t("上架渠道")),
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
                  e.toDisplayString(a.$t("启用")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("渠道")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("商家后台地址")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("主图比例")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(a.$t("标题字数上限")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("th", {
                  title: a.$t("打开后数字员工填完直接提交，不再停在提交前；每次执行记为「自动执行」")
                }, e.toDisplayString(a.$t("全自动提交")), 9, Aa)
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(y.channels, (b) => (e.openBlock(), e.createElementBlock("tr", {
                  key: b.id
                }, [
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (N) => b.enabled = N,
                      type: "checkbox"
                    }, null, 8, Ma), [
                      [e.vModelCheckbox, b.enabled]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (N) => b.name = N,
                      type: "text"
                    }, null, 8, Ia), [
                      [
                        e.vModelText,
                        b.name,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (N) => b.url = N,
                      type: "text",
                      class: "ba-url"
                    }, null, 8, Fa), [
                      [
                        e.vModelText,
                        b.url,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("select", {
                      "onUpdate:modelValue": (N) => b.aspect = N
                    }, [...V[9] || (V[9] = [
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
                      [e.vModelSelect, b.aspect]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (N) => b.titleMax = N,
                      type: "number",
                      min: "10",
                      max: "60"
                    }, null, 8, Ra), [
                      [
                        e.vModelText,
                        b.titleMax,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("input", {
                      type: "checkbox",
                      checked: !!b.autoSubmit,
                      onChange: (N) => A(b, N.target)
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
      e.createElementVNode("section", Pa, [
        e.createElementVNode("header", za, [
          e.createElementVNode("strong", null, [
            V[10] || (V[10] = e.createElementVNode(
              "i",
              { class: "ri-scales-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.$t("上下架规则")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("label", Ka, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": V[3] || (V[3] = (b) => y.autoDelistLocal = b),
              type: "checkbox"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelCheckbox, y.autoDelistLocal]
          ]),
          e.createTextVNode(
            e.toDisplayString(a.$t("售罄时自动把门店试穿手机端下架（只动本机，网店下架要人确认）")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", ja, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(a.$t("主力尺码（这些尺码缺货算断码，逗号分隔）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": V[4] || (V[4] = (b) => $.value = b),
              type: "text"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, $.value]
          ])
        ]),
        e.createElementVNode("div", Wa, [
          e.createElementVNode(
            "span",
            qa,
            e.toDisplayString(a.$t("季节在售月份（不在这些月份的款提醒过季）")),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(y.seasonMonths, (b, N) => (e.openBlock(), e.createElementBlock("label", {
              key: N,
              class: "ba-season"
            }, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(N),
                1
                /* TEXT */
              ),
              e.createElementVNode("input", {
                value: b.join(","),
                type: "text",
                placeholder: a.$t("如 5,6,7,8；留空表示四季都卖"),
                onChange: (L) => y.seasonMonths[N] = v(L.target.value)
              }, null, 40, Ja)
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      e.createElementVNode("section", Ha, [
        e.createElementVNode("header", Ga, [
          e.createElementVNode("strong", null, [
            V[11] || (V[11] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.$t("能力就绪")),
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
                class: e.normalizeClass(["ss-chip", T.value.ready.ffmpeg ? "ok" : "bad"])
              },
              "ffmpeg",
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(a.$t("短视频成片")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", T.value.ready.image ? "ok" : "warn"])
              },
              e.toDisplayString(a.$t("图像 / 语音服务")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(a.$t("高保真配音；没有时用标准音色")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", T.value.ready.digitalHuman ? "ok" : "warn"])
              },
              e.toDisplayString(a.$t("数字人服务")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(a.$t("在「数字人工作台 → 配置」设置")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", T.value.ready.knowledge ? "ok" : "warn"])
              },
              e.toDisplayString(a.$t("知识库")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(a.$t("数字人讲稿的公司资料来源")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", T.value.ready.push ? "ok" : "warn"])
              },
              e.toDisplayString(a.$t("推送渠道")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(a.$t("在「设置 → 通知与推送」配置")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createElementVNode("div", Qa, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: !U.value,
          onClick: o
        }, [
          V[12] || (V[12] = e.createElementVNode(
            "i",
            { class: "ri-save-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(a.$t("保存设置")),
            1
            /* TEXT */
          )
        ], 8, xa),
        U.value ? (e.openBlock(), e.createElementBlock(
          "span",
          Xa,
          e.toDisplayString(a.$t("有未保存的修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), ei = /* @__PURE__ */ x(Za, [["__scopeId", "data-v-f8f54ee4"]]), ti = { class: "ba-hist" }, li = { class: "ss-kpis" }, ni = { class: "ss-kpi" }, si = { class: "ss-kpi accent" }, oi = { class: "ss-kpi" }, ai = { class: "ss-kpi" }, ii = { class: "ss-panel" }, ri = { class: "ba-hist__bar" }, ci = {
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
}, Oi = { class: "ba-hist__runhead" }, Pi = { class: "ss-muted" }, zi = { class: "ba-hist__receipts" }, Ki = ["onClick"], ji = {
  key: 1,
  class: "ss-muted"
}, Wi = {
  key: 0,
  class: "ss-muted"
}, qi = { class: "ss-subhead" }, Ji = { class: "ss-table-wrap" }, Hi = { class: "ss-table" }, Gi = { class: "num" }, Yi = { class: "num" }, Qi = { class: "num" }, xi = { class: "num" }, Xi = { class: "num" }, Zi = { class: "num" }, er = { class: "num" }, tr = { class: "num" }, lr = { class: "ss-subhead" }, nr = {
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
    ], T = e.ref("all"), y = e.ref(""), $ = e.ref(""), U = e.computed(() => l.baState.value?.videos || []);
    function S(u) {
      const p = [u.createdAt, u.updatedAt, u.publishedAt, u.history?.[u.history.length - 1]?.at].map((r) => Date.parse(r || "")).filter(Number.isFinite);
      return p.length ? Math.max(...p) : 0;
    }
    function w(u) {
      const p = b(u);
      return u.status === "failed" || u.status !== "published" && !!p && !p.published.length;
    }
    function A(u, p) {
      return p === "published" ? u.status === "published" : p === "failed" ? w(u) : p === "active" ? u.status !== "published" && !w(u) : !0;
    }
    function v(u) {
      return U.value.filter((p) => A(p, u)).length;
    }
    const g = e.computed(() => {
      const u = y.value.trim().toLowerCase();
      return U.value.filter((p) => A(p, T.value)).filter((p) => !u || [p.name, p.brief, ...Object.values(p.copies).flatMap((r) => [r?.title, r?.caption])].join(`
`).toLowerCase().includes(u)).sort((p, r) => S(r) - S(p));
    }), o = e.computed(() => {
      let u = 0, p = 0, r = 0;
      for (const s of U.value)
        s.status === "published" && u++, p += (s.publishRuns || []).reduce((f, E) => f + E.published.length, 0), r += Object.values(s.stats || {}).reduce((f, E) => f + (E?.plays || 0), 0);
      return { published: u, platformPosts: p, plays: r };
    });
    function a(u) {
      $.value = $.value === u ? "" : u;
    }
    function V(u) {
      return u.scenes[0]?.image || u.materials[0];
    }
    function b(u) {
      return u.publishRuns?.[u.publishRuns.length - 1];
    }
    function N(u) {
      return u.split(/[\\/]/).pop() || u;
    }
    function L(u) {
      window.electronAPI?.openExternal?.(u) ?? window.open(u, "_blank");
    }
    function D(u) {
      return { draft: n.t("草稿"), scripted: n.t("已写脚本"), rendering: n.t("成片中"), rendered: n.t("已成片"), approved: n.t("已审核"), publishing: n.t("发布中"), published: n.t("已发布"), failed: n.t("失败") }[u] || u;
    }
    function _(u) {
      return u === "published" ? "ok" : u === "failed" ? "bad" : u === "publishing" || u === "rendering" ? "warn" : "brand";
    }
    function C(u) {
      return u.outcome === "cancelled" ? n.t("发布已取消") : u.published.length ? n.t("发布成功 {n} 个平台", { n: u.published.length }) : u.outcome === "failed" ? n.t("发布工作流失败") : n.t("没有平台发成功");
    }
    const B = { douyin: n.t("抖音"), kuaishou: n.t("快手"), xiaohongshu: n.t("小红书"), wxchannels: n.t("视频号") };
    function M(u) {
      const p = new Map(u.receipts.map((s) => [s.platform, s])), r = (s) => B[s] || s;
      return [
        ...u.published.map((s) => ({ platform: s, label: n.t("{p0} 已发布", { p0: r(s) }), tone: "ok", url: p.get(s)?.url })),
        ...u.unconfirmed.map((s) => ({ platform: s, label: n.t("{p0} 待核对", { p0: r(s) }), tone: "warn", url: p.get(s)?.url, error: p.get(s)?.error })),
        ...u.failed.map((s) => ({ platform: s, label: n.t("{p0} 未发成", { p0: r(s) }), tone: "bad", error: p.get(s)?.error }))
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
    function z(u) {
      return j[u] || "ri-checkbox-blank-circle-line";
    }
    function W(u) {
      if (u.history?.length) return [...u.history].reverse();
      const p = [{ at: u.createdAt, step: "create", text: n.t("创建项目：{p0}", { p0: l.videoTypeLabel(u.type) }), ok: !0 }];
      u.scenes.length && p.push({ at: u.createdAt, step: "script", text: n.t("写好分镜脚本 {n} 个镜头", { n: u.scenes.length }), ok: !0 }), u.video && p.push({ at: u.approvedAt || u.updatedAt || u.createdAt, step: "render", text: n.t("成片：{f}", { f: N(u.video) }), ok: !0 }), u.approvedAt && p.push({ at: u.approvedAt, step: "approve", text: n.t("审核通过"), ok: !0 }), u.publishedAt && p.push({ at: u.publishedAt, step: "publish", text: u.publishRunNote || n.t("已发布"), ok: !0 });
      for (const r of u.platforms) {
        const s = u.stats?.[r];
        s && p.push({ at: s.at, step: "stats", text: n.t("{p0} 数据：播放 {a} · 点赞 {b}", { p0: l.platformLabel(r), a: s.plays, b: s.likes }), ok: !0 });
      }
      return p.sort((r, s) => Date.parse(s.at) - Date.parse(r.at));
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
              e.renderList(F, (r) => e.createElementVNode("button", {
                key: r.key,
                type: "button",
                role: "tab",
                class: e.normalizeClass(["ba-hist__f", { on: T.value === r.key }]),
                "aria-selected": T.value === r.key,
                onClick: (s) => T.value = r.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(r.label),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(v(r.key)),
                  1
                  /* TEXT */
                )
              ], 10, di)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": p[0] || (p[0] = (r) => y.value = r),
            type: "search",
            class: "ba-hist__q",
            placeholder: u.$t("按名称 / 商品 / 文案搜索")
          }, null, 8, ui), [
            [e.vModelText, y.value]
          ])
        ]),
        g.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "p",
          mi,
          e.toDisplayString(U.value.length ? u.$t("没有符合条件的记录") : u.$t("还没有视频项目。在「短视频发布」或「数字人介绍」里做完的视频，每一步都会记在这里。")),
          1
          /* TEXT */
        )),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(g.value, (r) => (e.openBlock(), e.createElementBlock(
            "article",
            {
              key: r.id,
              class: e.normalizeClass(["ba-hist__item", { open: $.value === r.id }])
            },
            [
              e.createElementVNode("div", {
                class: "ba-hist__row",
                role: "button",
                tabindex: "0",
                onClick: (s) => a(r.id),
                onKeydown: e.withKeys((s) => a(r.id), ["enter"])
              }, [
                e.createElementVNode("div", vi, [
                  V(r) ? (e.openBlock(), e.createElementBlock("img", {
                    key: 0,
                    src: e.unref(l.fileUrl)(V(r)),
                    alt: "",
                    loading: "lazy"
                  }, null, 8, yi)) : (e.openBlock(), e.createElementBlock("i", hi)),
                  r.durationSec ? (e.openBlock(), e.createElementBlock(
                    "span",
                    ki,
                    e.toDisplayString(u.$t("{s} 秒", { s: r.durationSec })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", Vi, [
                  e.createElementVNode("div", gi, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(r.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", _(r.status)])
                      },
                      e.toDisplayString(D(r.status)),
                      3
                      /* TEXT, CLASS */
                    ),
                    e.createElementVNode(
                      "span",
                      bi,
                      e.toDisplayString(e.unref(l.videoTypeLabel)(r.type)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Ni, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(u.$t("创建 {p0}", { p0: e.unref(l.fmtDateTime)(r.createdAt) })),
                      1
                      /* TEXT */
                    ),
                    r.publishedAt ? (e.openBlock(), e.createElementBlock(
                      "span",
                      fi,
                      e.toDisplayString(u.$t("发布 {p0}", { p0: e.unref(l.fmtDateTime)(r.publishedAt) })),
                      1
                      /* TEXT */
                    )) : r.updatedAt ? (e.openBlock(), e.createElementBlock(
                      "span",
                      Ei,
                      e.toDisplayString(u.$t("最近更新 {p0}", { p0: e.unref(l.fmtDateTime)(r.updatedAt) })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(r.platforms.map(e.unref(l.platformLabel)).join(" / ")),
                      1
                      /* TEXT */
                    )
                  ]),
                  b(r) ? (e.openBlock(), e.createElementBlock("div", $i, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(M(b(r)), (s) => (e.openBlock(), e.createElementBlock(
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
                  ])) : r.publishRunNote ? (e.openBlock(), e.createElementBlock(
                    "p",
                    _i,
                    e.toDisplayString(r.publishRunNote),
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
                    onClick: (s) => u.$emit("goto", "video", { id: r.id })
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
                  r.video ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: (s) => e.unref(l.openPath)(r.video, !0)
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
                      class: e.normalizeClass(["ba-hist__chev", $.value === r.id ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"])
                    },
                    null,
                    2
                    /* CLASS */
                  )
                ])
              ], 40, pi),
              $.value === r.id ? (e.openBlock(), e.createElementBlock("div", Bi, [
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
                        e.renderList(W(r), (s, f) => (e.openBlock(), e.createElementBlock(
                          "li",
                          {
                            key: f,
                            class: e.normalizeClass({ bad: !s.ok })
                          },
                          [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(z(s.step))
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
                    r.history?.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                      "p",
                      Ai,
                      e.toDisplayString(u.$t("这条视频做于留痕功能上线前，节点记录按已有时间还原，不含失败记录。")),
                      1
                      /* TEXT */
                    ))
                  ]),
                  e.createElementVNode("div", Mi, [
                    r.video ? (e.openBlock(), e.createElementBlock(
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
                          src: e.unref(l.fileUrl)(r.video),
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
                    r.publishRuns?.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                      "p",
                      Ri,
                      e.toDisplayString(r.status === "published" ? u.$t("已人工确认发布（没有平台回执）") : u.$t("还没有发布记录")),
                      1
                      /* TEXT */
                    )),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList([...r.publishRuns || []].reverse(), (s, f) => (e.openBlock(), e.createElementBlock("div", {
                        key: s.runId || f,
                        class: "ba-hist__run"
                      }, [
                        e.createElementVNode("div", Oi, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", s.published.length ? "ok" : s.outcome === "cancelled" ? "" : "bad"])
                            },
                            e.toDisplayString(C(s)),
                            3
                            /* TEXT, CLASS */
                          ),
                          e.createElementVNode(
                            "small",
                            Pi,
                            e.toDisplayString(e.unref(l.fmtDateTime)(s.at)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("ul", zi, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(M(s), (E) => (e.openBlock(), e.createElementBlock("li", {
                              key: E.platform
                            }, [
                              e.createElementVNode(
                                "span",
                                {
                                  class: e.normalizeClass(["ss-chip", E.tone])
                                },
                                e.toDisplayString(E.label),
                                3
                                /* TEXT, CLASS */
                              ),
                              E.url ? (e.openBlock(), e.createElementBlock("a", {
                                key: 0,
                                href: "#",
                                class: "ss-link",
                                onClick: e.withModifiers((P) => L(E.url), ["prevent"])
                              }, e.toDisplayString(u.$t("查看作品")), 9, Ki)) : e.createCommentVNode("v-if", !0),
                              E.error ? (e.openBlock(), e.createElementBlock(
                                "small",
                                ji,
                                e.toDisplayString(E.error),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ]),
                        s.videoFile && s.videoFile !== r.video ? (e.openBlock(), e.createElementBlock(
                          "small",
                          Wi,
                          e.toDisplayString(u.$t("当时发布的成片：{p0}", { p0: N(s.videoFile) })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    r.stats && Object.keys(r.stats).length ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 2 },
                      [
                        e.createElementVNode(
                          "span",
                          qi,
                          e.toDisplayString(u.$t("平台数据")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", Ji, [
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
                                  Qi,
                                  e.toDisplayString(u.$t("评论")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  xi,
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
                                e.renderList(r.platforms.filter((s) => r.stats?.[s]), (s) => (e.openBlock(), e.createElementBlock("tr", { key: s }, [
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
                                    e.toDisplayString(r.stats[s].plays),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    Zi,
                                    e.toDisplayString(r.stats[s].likes),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    er,
                                    e.toDisplayString(r.stats[s].comments),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    tr,
                                    e.toDisplayString(r.stats[s].shares),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(e.unref(l.fmtDateTime)(r.stats[s].at)),
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
                    Object.keys(r.copies).length ? (e.openBlock(), e.createElementBlock(
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
                          e.renderList(r.platforms.filter((s) => r.copies[s]), (s) => (e.openBlock(), e.createElementBlock("div", {
                            key: s,
                            class: "ba-hist__copy"
                          }, [
                            e.createElementVNode(
                              "b",
                              null,
                              e.toDisplayString(e.unref(l.platformLabel)(s)) + " · " + e.toDisplayString(r.copies[s].title),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "p",
                              null,
                              e.toDisplayString(r.copies[s].caption),
                              1
                              /* TEXT */
                            ),
                            r.copies[s].topics.length ? (e.openBlock(), e.createElementBlock(
                              "small",
                              nr,
                              e.toDisplayString(r.copies[s].topics.map((f) => "#" + f).join(" ")),
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
}), or = /* @__PURE__ */ x(sr, [["__scopeId", "data-v-98085cb3"]]), ie = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useDialog.ts"];
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
    ], T = [
      { key: "video", icon: "ri-movie-2-line", title: n.t("短视频发布"), text: n.t("商品图、试穿图 → 脚本与各平台文案 → 配音字幕成片 → 审核 → 抖音 / 快手 / 小红书 / 视频号") },
      { key: "avatar", icon: "ri-user-voice-line", title: n.t("数字人介绍"), text: n.t("知识库资料写讲稿，数字人口播成片，进入发布") },
      { key: "listing", icon: "ri-store-3-line", title: n.t("商品上下架"), text: n.t("按渠道生成图文，数字员工在网店后台上架；售罄、断码、过季按规则处理") },
      { key: "finance", icon: "ri-line-chart-line", title: n.t("经营数据"), text: n.t("导入收银 / 费用数据，规则算指标，模型写解读并回核，日报定时推送") }
    ];
    function y() {
      try {
        const p = localStorage.getItem(re);
        return F.some((r) => r.key === p) ? p : "overview";
      } catch {
        return "overview";
      }
    }
    const $ = l.baState, U = e.computed(() => l.baGarments.value), S = e.ref(y()), w = e.reactive({}), A = e.ref(!1), v = e.ref(!1), g = e.ref(""), o = e.computed(() => l.baProgress[S.value] || ""), a = e.computed(() => ($.value?.videos || []).filter((p) => p.publishDue && p.status === "approved")), V = ee.useRouter(), b = Y.useNotificationStore();
    async function N(p) {
      try {
        const r = await l.ba("video.publishInput", { id: p });
        await l.startPublishWorkflow(r, p), await V.push({ path: "/workflow" });
      } catch (r) {
        b.error(l.errorMessage(r));
      }
    }
    function L(p) {
      const r = $.value;
      if (!r) return "";
      if (p === "listing") {
        const s = r.ruleHits.filter((f) => f.rule === "soldout" || f.rule === "broken_size").length;
        return s ? String(s) : "";
      }
      if (p === "video") {
        const s = r.videos.filter((f) => f.status === "rendered" || f.status === "scripted").length;
        return s ? String(s) : "";
      }
      return "";
    }
    function D(p) {
      S.value = p;
      try {
        localStorage.setItem(re, p);
      } catch {
      }
    }
    function _(p, r) {
      F.some((s) => s.key === p) && (w[p] = { ...r || {}, at: Date.now() }, D(p));
    }
    const C = ie.useDialog(), B = e.ref(!1), M = e.computed(() => {
      const p = $.value?.demo;
      return !!p && p.videos + p.avatars + p.listings + p.sales + p.reports > 0;
    });
    async function R() {
      if (await C.confirm({
        title: M.value ? n.t("重新生成演示数据") : n.t("演示模式"),
        message: n.t(`生成一整套示例数据，六个页签都能直接演示：短视频 4 个（含已发布、待定时发布）、数字人讲稿 2 份、上架记录 8 条、近 60 天收银与费用数据和日报 / 月报。商品库里没有演示商品时，会连带生成服装AI试衣的演示数据。
全部在本机生成，不调用 AI、不发布、不推送；门店自己的数据不受影响，随时可以一键清除。`),
        confirmLabel: n.t("生成")
      })) {
        B.value = !0;
        try {
          await l.ba("demo.seed"), await l.refreshState(), b.success(n.t("演示数据已生成"));
        } catch (r) {
          b.error(l.errorMessage(r));
        } finally {
          B.value = !1;
        }
      }
    }
    async function j() {
      if (await C.confirm({ title: n.t("清除演示数据"), message: n.t("只删除演示模式生成的视频、讲稿、上架记录、收银与费用数据和报表；门店自己的数据不受影响。服装AI试衣的演示商品在那个页面单独清除。"), confirmLabel: n.t("清除"), danger: !0 })) {
        B.value = !0;
        try {
          await l.ba("demo.clear"), await l.refreshState(), b.success(n.t("演示数据已清除"));
        } catch (r) {
          b.error(l.errorMessage(r));
        } finally {
          B.value = !1;
        }
      }
    }
    async function H() {
      v.value = !0;
      try {
        const p = await l.consumePublishResult().catch(() => !1);
        await Promise.all([l.refreshState(), l.loadModels()]), p && b.info(n.t("发布结果已记入历史记录")), A.value = !0, g.value = "";
      } catch (p) {
        g.value = l.errorMessage(p);
      } finally {
        v.value = !1;
      }
    }
    let z = null;
    const W = {};
    let u = null;
    return e.onMounted(() => {
      H(), u = l.onBaEvent((p) => {
        if (p.type === "publish-due" && p.payload?.id) {
          N(String(p.payload.id));
          return;
        }
        if (p.type === "progress" && p.payload?.key) {
          const r = String(p.payload.key);
          l.baProgress[r] = String(p.payload.message || ""), clearTimeout(W[r]), W[r] = setTimeout(() => {
            l.baProgress[r] = "";
          }, 2e4);
          return;
        }
        z || (z = setTimeout(() => {
          z = null, l.refreshState().catch(() => {
          });
        }, 250));
      });
    }), e.onBeforeUnmount(() => {
      u?.(), z && clearTimeout(z);
      for (const p of Object.values(W)) clearTimeout(p);
    }), (p, r) => (e.openBlock(), e.createElementBlock("div", ar, [
      e.createElementVNode("header", ir, [
        e.createElementVNode("div", rr, [
          e.createVNode(me),
          r[0] || (r[0] = e.createElementVNode(
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
          e.unref($)?.demo ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              M.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                class: "ss-btn",
                disabled: B.value,
                "data-test": "ba-demo-clear",
                onClick: j
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(B.value ? "ri-loader-4-line spin" : "ri-delete-bin-6-line")
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
                disabled: B.value,
                "data-test": "ba-demo-seed",
                onClick: R
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(B.value ? "ri-loader-4-line spin" : "ri-slideshow-3-line")
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
            disabled: v.value,
            onClick: H
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(v.value ? "ri-loader-4-line spin" : "ri-refresh-line")
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
      e.unref($) ? (e.openBlock(), e.createElementBlock("section", yr, [
        e.createElementVNode("span", null, [
          r[1] || (r[1] = e.createElementVNode(
            "i",
            { class: "ri-store-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(e.unref($).settings.brandName || p.$t("未设置品牌名")),
            1
            /* TEXT */
          )
        ]),
        M.value ? (e.openBlock(), e.createElementBlock("span", hr, [
          r[2] || (r[2] = e.createElementVNode(
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
          e.toDisplayString(p.$t("商品 {a} · 视频 {b} · 上架 {c} · 销售数据 {d} 行", { a: U.value.length, b: e.unref($).videos.length, c: e.unref($).listings.filter((s) => s.status === "listed").length, d: e.unref($).salesRows })),
          1
          /* TEXT */
        ),
        e.createElementVNode("p", Vr, [
          e.createElementVNode("span", gr, [
            r[3] || (r[3] = e.createElementVNode(
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
            r[4] || (r[4] = e.createElementVNode(
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
            class: e.normalizeClass(["ba-tab", { active: S.value === s.key }]),
            "aria-selected": S.value === s.key,
            onClick: (f) => D(s.key)
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
            L(s.key) ? (e.openBlock(), e.createElementBlock(
              "em",
              Er,
              e.toDisplayString(L(s.key)),
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
        e.renderList(a.value, (s) => (e.openBlock(), e.createElementBlock("p", {
          key: s.id,
          class: "ss-note warn"
        }, [
          r[5] || (r[5] = e.createElementVNode(
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
            onClick: (f) => N(s.id)
          }, e.toDisplayString(p.$t("立即发布")), 9, $r)
        ]))),
        128
        /* KEYED_FRAGMENT */
      )),
      o.value ? (e.openBlock(), e.createElementBlock("p", _r, [
        r[6] || (r[6] = e.createElementVNode(
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
        S.value === "video" ? (e.openBlock(), e.createBlock(pl, {
          key: 0,
          focus: w.video || null
        }, null, 8, ["focus"])) : S.value === "avatar" ? (e.openBlock(), e.createBlock(en, {
          key: 1,
          onGoto: _
        })) : S.value === "listing" ? (e.openBlock(), e.createBlock(es, { key: 2 })) : S.value === "finance" ? (e.openBlock(), e.createBlock(fo, { key: 3 })) : S.value === "schedule" ? (e.openBlock(), e.createBlock(ya, { key: 4 })) : S.value === "history" ? (e.openBlock(), e.createBlock(or, {
          key: 5,
          onGoto: _
        })) : S.value === "settings" ? (e.openBlock(), e.createBlock(ei, { key: 6 })) : (e.openBlock(), e.createElementBlock("div", Dr, [
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
                e.renderList(T, (s) => e.createElementVNode("button", {
                  key: s.key,
                  type: "button",
                  class: "ba-ov__card",
                  onClick: (f) => D(s.key)
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
      ])) : g.value ? (e.openBlock(), e.createElementBlock("p", Fr, [
        r[7] || (r[7] = e.createElementVNode(
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
      ])) : (e.openBlock(), e.createElementBlock("p", Ur, [
        r[8] || (r[8] = e.createElementVNode(
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
}), Or = /* @__PURE__ */ x(Rr, [["__scopeId", "data-v-d9391b97"]]);
export {
  Or as default
};
