const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const n = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!n) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
n.default;
const re = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!re) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const ue = re.default, ee = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!ee) throw new Error("宿主模块未就绪：npm:vue-router");
ee.default;
const Y = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!Y) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
Y.default;
const ce = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!ce) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const K = ce.default, de = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!de) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const oe = de.default, l = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/biz-automation/shared.ts"];
if (!l) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/biz-automation/shared.ts");
l.default;
const me = { class: "ba-mhead" }, pe = { class: "ba-mhead__main" }, ve = { class: "ba-mhead__split" }, ye = { class: "ss-chip brand" }, he = { class: "ss-chip" }, ke = ["title"], Ve = ["value", "disabled"], ge = { value: "" }, be = ["label"], Ne = ["value"], Ee = ["value"], fe = /* @__PURE__ */ e.defineComponent({
  __name: "ModuleHeader",
  props: {
    moduleKey: {},
    icon: {},
    title: {},
    ability: {},
    output: {}
  },
  setup(J) {
    const R = J, A = Y.useNotificationStore(), v = e.ref(!1), $ = e.computed(() => R.moduleKey && l.baState.value?.settings.moduleModels[R.moduleKey] || "");
    async function z(D) {
      if (R.moduleKey) {
        v.value = !0;
        try {
          const T = { ...l.baState.value?.settings.moduleModels || {} };
          D ? T[R.moduleKey] = D : delete T[R.moduleKey], await l.ba("settings.patch", { patch: { moduleModels: T } }), await l.refreshState();
        } catch (T) {
          A.error(l.errorMessage(T));
        } finally {
          v.value = !1;
        }
      }
    }
    return (D, T) => (e.openBlock(), e.createElementBlock("section", me, [
      e.createElementVNode("div", pe, [
        e.createElementVNode("h2", null, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(J.icon)
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(J.title),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ve, [
          e.createElementVNode("span", null, [
            e.createElementVNode(
              "em",
              ye,
              e.toDisplayString(D.$t("能力")),
              1
              /* TEXT */
            ),
            e.createTextVNode(
              e.toDisplayString(J.ability),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", null, [
            e.createElementVNode(
              "em",
              he,
              e.toDisplayString(D.$t("输出物")),
              1
              /* TEXT */
            ),
            e.createTextVNode(
              e.toDisplayString(J.output),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      J.moduleKey ? (e.openBlock(), e.createElementBlock("label", {
        key: 0,
        class: "ba-mhead__model",
        title: D.$t("本模块的脚本、文案、解读都用这个模型；金额与指标由规则计算，不经过模型")
      }, [
        e.createElementVNode("small", null, [
          T[1] || (T[1] = e.createElementVNode(
            "i",
            { class: "ri-cpu-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(D.$t("本模块使用模型")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("select", {
          value: $.value,
          disabled: v.value,
          onChange: T[0] || (T[0] = (F) => z(F.target.value))
        }, [
          e.createElementVNode(
            "option",
            ge,
            e.toDisplayString(D.$t("跟随系统默认（{p0}）", { p0: e.unref(l.baModels).defaultLabel || D.$t("未配置") })),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(l.modelGroups)(), (F) => (e.openBlock(), e.createElementBlock("optgroup", {
              key: F.group,
              label: F.group
            }, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(F.options, (p) => (e.openBlock(), e.createElementBlock("option", {
                  key: p.value,
                  value: p.value
                }, e.toDisplayString(p.label), 9, Ne))),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 8, be))),
            128
            /* KEYED_FRAGMENT */
          )),
          $.value && !e.unref(l.baModels).options.some((F) => F.value === $.value) ? (e.openBlock(), e.createElementBlock("option", {
            key: 0,
            value: $.value
          }, e.toDisplayString($.value), 9, Ee)) : e.createCommentVNode("v-if", !0)
        ], 40, Ve)
      ], 8, ke)) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), x = (J, R) => {
  const A = J.__vccOpts || J;
  for (const [v, $] of R)
    A[v] = $;
  return A;
}, se = /* @__PURE__ */ x(fe, [["__scopeId", "data-v-fd959d3f"]]), $e = { class: "ss-module" }, _e = { class: "ba-projbar" }, Se = { class: "ss-field" }, De = { value: "" }, Be = ["value"], we = { class: "ss-steps" }, Ce = { class: "ba-types" }, Te = ["onClick"], Le = {
  key: 0,
  class: "ss-note warn"
}, Me = { class: "ba-gpick" }, Ae = ["onClick"], Ie = ["src"], Fe = { class: "ss-field" }, Ue = { class: "ss-actions" }, Re = { class: "ss-muted" }, Oe = ["value"], Pe = { class: "ba-check" }, ze = { value: "female" }, Ke = { value: "male" }, je = { class: "ss-actions" }, We = ["disabled"], Je = {
  key: 1,
  class: "ba-summary"
}, qe = { class: "ss-chip brand" }, He = {
  key: 0,
  class: "ss-muted"
}, Ge = { class: "ss-muted" }, Ye = { class: "ba-thumbs" }, Qe = ["src"], xe = { class: "ss-actions" }, Xe = ["disabled"], Ze = ["disabled"], et = { class: "ss-muted" }, tt = { class: "ss-actions" }, lt = ["disabled"], nt = {
  key: 0,
  class: "ss-muted"
}, ot = {
  key: 0,
  class: "ba-scenes"
}, st = ["src"], at = ["onUpdate:modelValue"], it = ["value"], rt = ["onUpdate:modelValue"], ct = ["aria-label", "onClick"], dt = {
  key: 1,
  class: "ba-copies"
}, ut = ["onUpdate:modelValue", "placeholder"], mt = ["onUpdate:modelValue"], pt = ["value", "placeholder", "onChange"], vt = {
  key: 2,
  class: "ss-actions"
}, yt = ["disabled"], ht = {
  key: 0,
  class: "ss-muted"
}, kt = {
  key: 0,
  class: "ss-note warn"
}, Vt = { class: "ss-actions" }, gt = ["disabled"], bt = ["disabled"], Nt = { class: "ss-muted" }, Et = {
  key: 1,
  class: "ba-player"
}, ft = ["src"], $t = { class: "ba-player__side" }, _t = {
  key: 0,
  class: "ss-muted"
}, St = {
  key: 0,
  class: "ba-check"
}, Dt = { class: "ss-actions" }, Bt = ["disabled"], wt = {
  key: 0,
  class: "ss-muted"
}, Ct = { class: "ss-muted" }, Tt = { class: "ss-actions" }, Lt = ["disabled"], Mt = {
  key: 2,
  class: "ss-chip ok"
}, At = {
  key: 0,
  class: "ss-actions"
}, It = { class: "ss-muted" }, Ft = ["disabled"], Ut = {
  key: 0,
  class: "ss-chip brand"
}, Rt = {
  key: 1,
  class: "ss-muted"
}, Ot = { class: "ss-actions" }, Pt = ["disabled"], zt = { class: "ss-muted" }, Kt = { class: "ss-table-wrap" }, jt = { class: "ss-table" }, Wt = { class: "num" }, Jt = { class: "num" }, qt = { class: "num" }, Ht = { class: "num" }, Gt = ["onUpdate:modelValue"], Yt = ["onClick"], Qt = {
  key: 0,
  class: "ss-muted"
}, xt = { class: "ss-subhead" }, Xt = { class: "ss-table-wrap" }, Zt = { class: "ss-table" }, el = { class: "num" }, tl = { class: "num" }, ll = { class: "num" }, nl = { class: "num" }, ol = { class: "num" }, sl = { class: "num" }, al = { class: "num" }, il = { class: "num" }, rl = { class: "num" }, cl = { class: "num" }, dl = 120, ul = /* @__PURE__ */ e.defineComponent({
  __name: "VideoTab",
  props: {
    focus: {}
  },
  setup(J) {
    const R = J, A = Y.useNotificationStore(), v = ee.useRouter(), $ = l.baState;
    l.ensureBaProgressTracking();
    const z = ["new_arrival", "multi_look", "store_tour", "promotion", "styling_tips"], D = ["douyin", "kuaishou", "xiaohongshu", "wxchannels"], T = {
      new_arrival: n.t("商品图 + AI 模特图 + 卖点，15～30 秒"),
      multi_look: n.t("同一件衣服 × 多组试穿造型"),
      store_tour: n.t("邀请进店，适合带定位发布"),
      promotion: n.t("活动信息 + 主推款"),
      styling_tips: n.t("按场合给穿搭建议")
    }, F = e.computed(() => l.baGarments.value), p = e.computed(() => $.value?.videos || []), V = e.ref(""), o = e.computed(() => p.value.find((t) => t.id === V.value) || null);
    e.watch(() => R.focus, (t) => {
      t?.id && (V.value = t.id);
    }, { immediate: !0 });
    const s = e.reactive({ type: "new_arrival", garmentIds: [], brief: "", platforms: ["douyin", "xiaohongshu"], narration: !0, voiceGender: "female" }), k = e.reactive({ scenes: [], copies: {} });
    e.watch(o, (t) => {
      k.scenes = t ? JSON.parse(JSON.stringify(t.scenes)) : [], k.copies = t ? JSON.parse(JSON.stringify(t.copies)) : {};
    }, { immediate: !0 });
    const b = e.computed(() => !!o.value && (JSON.stringify(k.scenes) !== JSON.stringify(o.value.scenes) || JSON.stringify(k.copies) !== JSON.stringify(o.value.copies))), g = e.ref(""), I = e.ref({}), w = e.ref(!1), S = [
      { key: "v-pick", title: n.t("选类型与商品"), hint: n.t("新品上新 / 一衣多搭 / 门店探店 / 促销 / 穿搭教程") },
      { key: "v-material", title: n.t("素材准备"), hint: n.t("自动带入商品图与试穿图，可补充门店实拍") },
      { key: "v-script", title: n.t("脚本与文案"), hint: n.t("分镜口播 + 各平台标题、正文、话题，逐段可改") },
      { key: "v-render", title: n.t("成片"), hint: n.t("配音、字幕、推拉镜头、配乐，9:16") },
      { key: "v-approve", title: n.t("审核"), hint: n.t("极限词、来路不明的价格会提示") },
      { key: "v-publish", title: n.t("发布"), hint: n.t("立即或定时发到抖音 / 快手 / 小红书 / 视频号，平台回执逐条显示") },
      { key: "v-review", title: n.t("复盘"), hint: n.t("回收播放、点赞、评论数，按款式看引流效果") }
    ];
    function L(t, i, c, U = !1, H = "", ae) {
      return g.value === t || U ? { state: "running", ...ae || {} } : I.value[t] || H ? { state: "failed", error: I.value[t] || H } : i ? { state: "done", summary: c } : { state: "todo" };
    }
    const M = e.computed(() => {
      const t = o.value;
      return {
        "v-pick": L("v-pick", !!t, t?.name),
        "v-material": L("v-material", !!t && t.materials.length > 0, t ? n.t("{n} 张素材", { n: t.materials.length }) : ""),
        "v-script": L("v-script", !!t && (t.scenes.length > 0 || !!t.video), t ? n.t("{n} 个镜头", { n: t.scenes.length }) : ""),
        // 成片：看门狗要的真实开始时刻 / 最近进度 / 类型 / 预计，一并写进 runtime（换 tab 回来计时不归零）
        "v-render": L(
          "v-render",
          !!t?.video,
          t?.durationSec ? n.t("{s} 秒", { s: t.durationSec }) : "",
          t?.status === "rendering",
          t?.status === "failed" && t.error || "",
          t ? { kind: "video", estimateSec: dl, startedAt: l.renderStartedAt(t), progressAt: l.baProgressAt.video } : void 0
        ),
        "v-approve": L("v-approve", !!t && ["approved", "publishing", "published"].includes(t.status)),
        "v-publish": L("v-publish", t?.status === "published", t?.publishRunNote),
        "v-review": L("v-review", !!t?.stats && Object.keys(t.stats).length > 0)
      };
    }), O = e.computed(() => S.find((t) => M.value[t.key].state !== "done")?.key || "v-review"), P = ["plays", "likes", "comments", "shares"], N = e.reactive({});
    e.watch(o, (t) => {
      for (const i of D) {
        const c = t?.stats?.[i];
        N[i] = { plays: c?.plays || 0, likes: c?.likes || 0, comments: c?.comments || 0, shares: c?.shares || 0 };
      }
    }, { immediate: !0 });
    const B = e.ref([]);
    async function C() {
      B.value = await l.ba("video.review").catch(() => []);
    }
    C();
    const j = e.ref("");
    e.watch(() => s.type, (t) => {
      if (t !== "new_arrival" || s.garmentIds.length) return;
      const i = F.value.filter((c) => Date.now() - Date.parse(c.createdAt) < 7 * 864e5).slice(0, 5).map((c) => c.id);
      s.garmentIds.push(...i);
    }, { immediate: !0 });
    function u(t) {
      return { draft: n.t("草稿"), scripted: n.t("已写脚本"), rendering: n.t("成片中"), rendered: n.t("已成片"), approved: n.t("已审核"), publishing: n.t("发布中"), published: n.t("已发布"), failed: n.t("失败") }[t];
    }
    function _(t) {
      const i = s.garmentIds.indexOf(t);
      i >= 0 ? s.garmentIds.splice(i, 1) : s.garmentIds.length < 5 && s.garmentIds.push(t);
    }
    async function m(t, i) {
      g.value = t, I.value = { ...I.value, [t]: "" };
      try {
        return await i(), await l.refreshState(), !0;
      } catch (c) {
        return I.value = { ...I.value, [t]: l.errorMessage(c) }, l.scrollToStep(t), !1;
      } finally {
        g.value = "";
      }
    }
    async function a() {
      await m("v-pick", async () => {
        const t = await l.ba("video.create", { ...s });
        V.value = t.id, await l.refreshState(), await l.ba("video.script", { id: t.id });
      });
    }
    async function f() {
      const t = await l.pickFiles("image", !0);
      t.length && o.value && await m("v-material", () => l.ba("video.addMaterials", { id: o.value.id, paths: t }));
    }
    async function E() {
      o.value && await m("v-script", () => l.ba("video.script", { id: o.value.id }));
    }
    async function W() {
      o.value && await m("v-script", () => l.ba("video.update", { id: o.value.id, patch: { scenes: k.scenes, copies: k.copies } }));
    }
    async function Q() {
      const t = o.value;
      !t || g.value || t.status === "rendering" || (l.noteRenderStarted(t.id), await m("v-render", () => l.ba("video.render", { id: t.id })));
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
            }), g.value !== "v-render" && o.value?.status !== "rendering") return;
            await new Promise((c) => setTimeout(c, 300));
          }
          A.warn(n.t("上次成片的任务还没退出，请稍后再试或重启应用"));
        } finally {
          G.value = !1;
        }
      }
    }
    async function te() {
      o.value && await m("v-approve", () => l.ba("video.approve", { id: o.value.id, force: w.value }));
    }
    async function le() {
      if (!o.value) return;
      await m("v-publish", async () => {
        const i = await l.ba("video.publishInput", { id: o.value.id });
        await l.startPublishWorkflow(i, o.value.id);
      }) && await v.push({ path: "/workflow" });
    }
    async function Z(t) {
      o.value && await m("v-publish", () => l.ba("video.markPublished", { id: o.value.id, ok: t, note: t ? n.t("已在发布工作流完成") : n.t("发布未完成") }));
    }
    async function ne() {
      if (!o.value) return;
      const t = o.value.materials.length;
      await m("v-material", () => l.ba("video.fillModels", { id: o.value.id })) && A.info((o.value?.materials.length || 0) > t ? n.t("已补 {n} 张模特图", { n: (o.value?.materials.length || 0) - t }) : n.t("选中的款都已有试穿图，不用补"));
    }
    async function d(t) {
      o.value && await m("v-publish", () => l.ba("video.schedule", { id: o.value.id, at: t ? new Date(t).toISOString() : null }));
    }
    async function h() {
      if (!o.value) return;
      await m("v-review", async () => {
        const i = await l.ba("video.statsInstruction", { id: o.value.id });
        await l.handToDigitalEmployee(n.t("回读视频数据：{p0}", { p0: o.value.name }), i);
      }) && A.success(n.t("已交给数字员工，读回后请把数字填到表里"));
    }
    async function y(t) {
      o.value && (await m("v-review", () => l.ba("video.recordStats", { id: o.value.id, platform: t, stats: { ...N[t], source: "manual" } })), await C());
    }
    async function q() {
      if (!(!o.value || !window.confirm(n.t("删除视频项目「{p0}」？成片文件保留在输出目录。", { p0: o.value.name }))))
        try {
          await l.ba("video.remove", { id: o.value.id }), V.value = "", await l.refreshState();
        } catch (t) {
          A.error(l.errorMessage(t));
        }
    }
    function r(t) {
      l.scrollToStep(t);
    }
    return (t, i) => (e.openBlock(), e.createElementBlock("div", $e, [
      e.createVNode(se, {
        "module-key": "video",
        icon: "ri-movie-2-line",
        title: t.$t("短视频生成并发布自媒体"),
        ability: t.$t("商品图、试穿图、门店实拍 → 分镜脚本与各平台文案 → 配音字幕配乐成片 → 审核 → 发到抖音、快手、小红书、视频号"),
        output: t.$t("9:16 成片、各平台标题文案话题、平台发布回执；价格与折扣只许来自你填的活动信息")
      }, null, 8, ["title", "ability", "output"]),
      e.createElementVNode("div", _e, [
        e.createElementVNode("label", Se, [
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
              "onUpdate:modelValue": i[0] || (i[0] = (c) => V.value = c)
            },
            [
              e.createElementVNode(
                "option",
                De,
                e.toDisplayString(t.$t("— 新建视频 —")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(p.value, (c) => (e.openBlock(), e.createElementBlock("option", {
                  key: c.id,
                  value: c.id
                }, e.toDisplayString(c.name) + " · " + e.toDisplayString(u(c.status)), 9, Be))),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, V.value]
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
      e.createVNode(oe, {
        title: t.$t("短视频发布"),
        metas: S,
        runtime: M.value,
        "current-key": O.value,
        onJump: r
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", we, [
        e.createVNode(K, {
          "step-key": "v-pick",
          index: 0,
          title: S[0].title,
          hint: S[0].hint,
          runtime: M.value["v-pick"],
          "is-current": O.value === "v-pick"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock("div", Je, [
              e.createElementVNode(
                "span",
                qe,
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
                He,
                e.toDisplayString(o.value.brief),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0),
              e.createElementVNode(
                "span",
                Ge,
                e.toDisplayString(o.value.platforms.map(e.unref(l.platformLabel)).join(" / ")),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Ce, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(z, (c) => e.createElementVNode("button", {
                      key: c,
                      type: "button",
                      class: e.normalizeClass(["ba-type", { on: s.type === c }]),
                      onClick: (U) => s.type = c
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
                        e.toDisplayString(T[c]),
                        1
                        /* TEXT */
                      )
                    ], 10, Te)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                F.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Le, [
                  i[13] || (i[13] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("商品库是空的：先到「服装实体店智能体 → 商品库」导入服装图")),
                    1
                    /* TEXT */
                  )
                ])),
                e.createElementVNode("div", Me, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(F.value, (c) => (e.openBlock(), e.createElementBlock("button", {
                      key: c.id,
                      type: "button",
                      class: e.normalizeClass({ on: s.garmentIds.includes(c.id) }),
                      onClick: (U) => _(c.id)
                    }, [
                      e.createElementVNode("img", {
                        src: e.unref(l.fileUrl)(c.image),
                        alt: "",
                        loading: "lazy"
                      }, null, 8, Ie),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(c.name),
                        1
                        /* TEXT */
                      )
                    ], 10, Ae))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("label", Fe, [
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
                      "onUpdate:modelValue": i[1] || (i[1] = (c) => s.brief = c),
                      rows: "2"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, s.brief]
                  ])
                ]),
                e.createElementVNode("div", Ue, [
                  e.createElementVNode(
                    "span",
                    Re,
                    e.toDisplayString(t.$t("发布平台")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(D, (c) => e.createElementVNode("label", {
                      key: c,
                      class: "ba-check"
                    }, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": i[2] || (i[2] = (U) => s.platforms = U),
                        type: "checkbox",
                        value: c
                      }, null, 8, Oe), [
                        [e.vModelCheckbox, s.platforms]
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
                        "onUpdate:modelValue": i[3] || (i[3] = (c) => s.narration = c),
                        type: "checkbox"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelCheckbox, s.narration]
                    ]),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("AI 配音")),
                      1
                      /* TEXT */
                    )
                  ]),
                  s.narration ? e.withDirectives((e.openBlock(), e.createElementBlock(
                    "select",
                    {
                      key: 0,
                      "onUpdate:modelValue": i[4] || (i[4] = (c) => s.voiceGender = c),
                      class: "ba-mini"
                    },
                    [
                      e.createElementVNode(
                        "option",
                        ze,
                        e.toDisplayString(t.$t("女声")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        Ke,
                        e.toDisplayString(t.$t("男声")),
                        1
                        /* TEXT */
                      )
                    ],
                    512
                    /* NEED_PATCH */
                  )), [
                    [e.vModelSelect, s.voiceGender]
                  ]) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", je, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!g.value || !s.garmentIds.length || !s.platforms.length,
                    onClick: a
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
                  ], 8, We)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(K, {
          "step-key": "v-material",
          index: 1,
          title: S[1].title,
          hint: S[1].hint,
          runtime: M.value["v-material"],
          "is-current": O.value === "v-material"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Ye, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(o.value.materials, (c, U) => (e.openBlock(), e.createElementBlock("figure", { key: c }, [
                      e.createElementVNode("img", {
                        src: e.unref(l.fileUrl)(c),
                        alt: "",
                        loading: "lazy"
                      }, null, 8, Qe),
                      e.createElementVNode(
                        "figcaption",
                        null,
                        "#" + e.toDisplayString(U),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", xe, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!g.value || !o.value.garmentIds.length,
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
                  ], 8, Xe),
                  o.value.garmentIds.length ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!g.value,
                    onClick: ne
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(g.value === "v-material" ? "ri-loader-4-line spin" : "ri-user-star-line")
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
                  ], 8, Ze)) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode(
                    "span",
                    et,
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
        e.createVNode(K, {
          "step-key": "v-script",
          index: 2,
          title: S[2].title,
          hint: S[2].hint,
          runtime: M.value["v-script"],
          "is-current": O.value === "v-script"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", tt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!g.value || !o.value.garmentIds.length,
                    onClick: E
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(g.value === "v-script" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
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
                  ], 8, lt),
                  o.value.model ? (e.openBlock(), e.createElementBlock(
                    "span",
                    nt,
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
                    i[16] || (i[16] = e.createElementVNode(
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
                k.scenes.length ? (e.openBlock(), e.createElementBlock("div", ot, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(k.scenes, (c, U) => (e.openBlock(), e.createElementBlock("div", {
                      key: U,
                      class: "ba-scene"
                    }, [
                      e.createElementVNode("img", {
                        src: e.unref(l.fileUrl)(c.image),
                        alt: ""
                      }, null, 8, st),
                      e.createElementVNode("div", null, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(t.$t("镜头 {n}", { n: U + 1 })),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode("select", {
                          "onUpdate:modelValue": (H) => c.image = H,
                          class: "ba-mini"
                        }, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(o.value.materials, (H, ae) => (e.openBlock(), e.createElementBlock("option", {
                              key: H,
                              value: H
                            }, e.toDisplayString(t.$t("图片 #{n}", { n: ae })), 9, it))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 8, at), [
                          [e.vModelSelect, c.image]
                        ]),
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (H) => c.line = H,
                          type: "text",
                          maxlength: "40"
                        }, null, 8, rt), [
                          [e.vModelText, c.line]
                        ])
                      ]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        "aria-label": t.$t("删除"),
                        onClick: (H) => k.scenes.splice(U, 1)
                      }, [...i[17] || (i[17] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-close-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, ct)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0),
                Object.keys(k.copies).length ? (e.openBlock(), e.createElementBlock("div", dt, [
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
                      k.copies[c] ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (U) => k.copies[c].title = U,
                            type: "text",
                            placeholder: t.$t("标题")
                          }, null, 8, ut), [
                            [e.vModelText, k.copies[c].title]
                          ]),
                          e.withDirectives(e.createElementVNode("textarea", {
                            "onUpdate:modelValue": (U) => k.copies[c].caption = U,
                            rows: "3"
                          }, null, 8, mt), [
                            [e.vModelText, k.copies[c].caption]
                          ]),
                          e.createElementVNode("input", {
                            value: k.copies[c].topics.join(" "),
                            type: "text",
                            placeholder: t.$t("话题，空格分隔"),
                            onChange: (U) => k.copies[c].topics = U.target.value.split(/\s+/).map((H) => H.replace(/^#/, "")).filter(Boolean)
                          }, null, 40, pt)
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0),
                k.scenes.length ? (e.openBlock(), e.createElementBlock("div", vt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!g.value || !b.value,
                    onClick: W
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
                  ], 8, yt),
                  b.value ? (e.openBlock(), e.createElementBlock(
                    "span",
                    ht,
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
        e.createVNode(K, {
          "step-key": "v-render",
          index: 3,
          title: S[3].title,
          hint: S[3].hint,
          runtime: M.value["v-render"],
          "is-current": O.value === "v-render",
          retry: Q,
          cancel: X,
          "retry-label": t.$t("重新成片")
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.unref($)?.ready.ffmpeg ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", kt, [
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
                e.createElementVNode("div", Vt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!g.value || !o.value.scenes.length || o.value.status === "rendering" || b.value || !o.value.garmentIds.length,
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
                  ], 8, gt),
                  o.value.status === "rendering" ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn sm ghost",
                    disabled: G.value,
                    onClick: X
                  }, e.toDisplayString(t.$t("取消")), 9, bt)) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode(
                    "span",
                    Nt,
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
                  }, null, 8, ft),
                  e.createElementVNode("div", $t, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("时长 {s} 秒", { s: o.value.durationSec || "—" })),
                      1
                      /* TEXT */
                    ),
                    o.value.voiceQuality ? (e.openBlock(), e.createElementBlock(
                      "span",
                      _t,
                      e.toDisplayString(o.value.voiceQuality === "hd" ? t.$t("高保真配音") : t.$t("标准音质配音（备用）")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "button",
                      {
                        type: "button",
                        class: "ss-link",
                        onClick: i[5] || (i[5] = (c) => e.unref(l.openPath)(o.value.video, !0))
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
        e.createVNode(K, {
          "step-key": "v-approve",
          index: 4,
          title: S[4].title,
          hint: S[4].hint,
          runtime: M.value["v-approve"],
          "is-current": O.value === "v-approve"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                o.value.warnings.length ? (e.openBlock(), e.createElementBlock("label", St, [
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": i[6] || (i[6] = (c) => w.value = c),
                      type: "checkbox"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelCheckbox, w.value]
                  ]),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("我已看过上面的提示，仍然通过")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", Dt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!g.value || !o.value.video || o.value.status === "approved" || o.value.status === "published",
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
                  ], 8, Bt),
                  o.value.approvedAt ? (e.openBlock(), e.createElementBlock(
                    "span",
                    wt,
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
        e.createVNode(K, {
          "step-key": "v-publish",
          index: 5,
          title: S[5].title,
          hint: S[5].hint,
          runtime: M.value["v-publish"],
          "is-current": O.value === "v-publish"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode(
                  "p",
                  Ct,
                  e.toDisplayString(t.$t("用你在内置浏览器里登录的平台账号发布：先确认登录，再逐个平台上传、填文案、提交，平台回执逐条显示。建议每个账号每天不超过 3 条。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", Tt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!g.value || o.value.status !== "approved" && o.value.status !== "published" && o.value.status !== "publishing",
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
                  ], 8, Lt),
                  o.value.status === "publishing" ? (e.openBlock(), e.createElementBlock(
                    "button",
                    {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: i[7] || (i[7] = (c) => Z(!0))
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
                      onClick: i[8] || (i[8] = (c) => Z(!1))
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
                o.value.status === "approved" ? (e.openBlock(), e.createElementBlock("div", At, [
                  e.createElementVNode(
                    "span",
                    It,
                    e.toDisplayString(t.$t("或定时发布")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": i[9] || (i[9] = (c) => j.value = c),
                      type: "datetime-local",
                      class: "ba-dt"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, j.value]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!g.value || !j.value,
                    onClick: i[10] || (i[10] = (c) => d(j.value))
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
                  ], 8, Ft),
                  o.value.publishAt ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Ut,
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
                      onClick: i[11] || (i[11] = (c) => d(null))
                    },
                    e.toDisplayString(t.$t("取消定时")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0),
                o.value.publishAt ? (e.openBlock(), e.createElementBlock(
                  "p",
                  Rt,
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
        e.createVNode(K, {
          "step-key": "v-review",
          index: 6,
          title: S[6].title,
          hint: S[6].hint,
          runtime: M.value["v-review"],
          "is-current": O.value === "v-review"
        }, {
          default: e.withCtx(() => [
            o.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Ot, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!g.value || o.value.status !== "published",
                    onClick: h
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
                  ], 8, Pt),
                  e.createElementVNode(
                    "span",
                    zt,
                    e.toDisplayString(t.$t("数字员工只读取创作者后台的播放、点赞、评论、分享；读回后填到下表")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Kt, [
                  e.createElementVNode("table", jt, [
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
                          Wt,
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
                          qt,
                          e.toDisplayString(t.$t("评论")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Ht,
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
                            e.renderList(P, (U) => e.createElementVNode("td", { key: U }, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": (H) => N[c][U] = H,
                                type: "number",
                                min: "0",
                                class: "ba-stat"
                              }, null, 8, Gt), [
                                [
                                  e.vModelText,
                                  N[c][U],
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
                              onClick: (U) => y(c)
                            }, e.toDisplayString(t.$t("保存")), 9, Yt),
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
                B.value.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode(
                      "span",
                      xt,
                      e.toDisplayString(t.$t("按款式看引流效果（全部视频）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Xt, [
                      e.createElementVNode("table", Zt, [
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
                              el,
                              e.toDisplayString(t.$t("视频数")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              tl,
                              e.toDisplayString(t.$t("播放")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              ll,
                              e.toDisplayString(t.$t("点赞")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              nl,
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
                            e.renderList(B.value, (c) => (e.openBlock(), e.createElementBlock("tr", {
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
                                sl,
                                e.toDisplayString(c.videos),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                al,
                                e.toDisplayString(c.plays),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                il,
                                e.toDisplayString(c.likes),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                rl,
                                e.toDisplayString(c.comments),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                cl,
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
}), ml = /* @__PURE__ */ x(ul, [["__scopeId", "data-v-7732ac26"]]), pl = { class: "ss-module" }, vl = { class: "ba-projbar" }, yl = { class: "ss-field" }, hl = { value: "" }, kl = ["value"], Vl = { class: "ss-steps" }, gl = { class: "ba-types" }, bl = ["onClick"], Nl = { class: "ss-grid" }, El = { class: "ss-field" }, fl = { class: "ss-field" }, $l = { class: "ba-facts" }, _l = {
  key: 0,
  class: "ss-muted"
}, Sl = { class: "ss-actions" }, Dl = ["disabled"], Bl = {
  key: 1,
  class: "ss-muted"
}, wl = { class: "ss-actions" }, Cl = ["disabled"], Tl = { class: "ss-muted" }, Ll = { class: "ss-grid" }, Ml = { class: "ss-field" }, Al = { class: "ss-field" }, Il = { class: "ss-field" }, Fl = { value: "9:16" }, Ul = { value: "16:9" }, Rl = { class: "ss-field" }, Ol = { class: "ss-actions" }, Pl = ["disabled"], zl = { class: "ss-muted" }, Kl = { class: "ss-actions" }, jl = ["disabled"], Wl = { class: "ss-muted" }, Jl = { class: "ss-muted" }, ql = ["src"], Hl = { class: "ss-actions" }, Gl = ["value"], Yl = ["disabled"], Ql = { class: "ss-muted" }, xl = 240, Xl = /* @__PURE__ */ e.defineComponent({
  __name: "AvatarTab",
  emits: ["goto"],
  setup(J, { emit: R }) {
    const A = R, v = Y.useNotificationStore();
    l.ensureBaProgressTracking();
    const $ = ["company_intro", "brand_story", "store_opening", "service_intro", "recruiting", "holiday"], z = ["douyin", "kuaishou", "xiaohongshu", "wxchannels"], D = (a) => ({ company_intro: n.t("企业介绍"), brand_story: n.t("品牌故事"), store_opening: n.t("新店开业"), service_intro: n.t("门店服务介绍"), recruiting: n.t("招聘"), holiday: n.t("节日祝福") })[a], T = e.computed(() => l.baState.value?.avatars || []), F = e.ref(""), p = e.computed(() => T.value.find((a) => a.id === F.value) || null), V = e.reactive({ topic: "company_intro", seconds: 45, brief: "" }), o = e.ref([]), s = e.ref(null), k = e.ref(""), b = e.reactive({ avatarId: "", voiceId: "", aspectRatio: "9:16", likenessConsent: "" }), g = e.ref(["douyin", "wxchannels"]), I = e.ref(""), w = e.ref({});
    e.watch(p, (a) => {
      k.value = a?.script || "", Object.assign(b, { avatarId: a?.avatarId || "", voiceId: a?.voiceId || "", aspectRatio: a?.aspectRatio || "9:16", likenessConsent: a?.likenessConsent || "" });
    }, { immediate: !0 }), e.onMounted(async () => {
      o.value = await l.ba("avatar.facts").catch(() => []), s.value = await l.ba("avatar.status").catch(() => ({ ready: !1 }));
    });
    const S = [
      { key: "a-topic", title: n.t("选主题"), hint: n.t("企业介绍 / 品牌故事 / 新店开业 / 服务介绍 / 招聘 / 节日祝福") },
      { key: "a-script", title: n.t("讲稿"), hint: n.t("事实只取知识库，缺的写【待补充】") },
      { key: "a-avatar", title: n.t("选数字人"), hint: n.t("形象、音色、画幅；真人分身需书面授权") },
      { key: "a-render", title: n.t("口播成片"), hint: n.t("带字幕与 AI 生成标识") },
      { key: "a-publish", title: n.t("进入发布"), hint: n.t("交给「短视频发布」审核后发出") }
    ];
    function L(a, f, E, W = !1, Q = "", G) {
      return I.value === a || W ? { state: "running", ...G || {} } : w.value[a] || Q ? { state: "failed", error: w.value[a] || Q } : f ? { state: "done", summary: E } : { state: "todo" };
    }
    const M = e.computed(() => {
      const a = p.value;
      return {
        "a-topic": L("a-topic", !!a, a ? D(a.topic) : ""),
        "a-script": L("a-script", !!a && !/【待补充/.test(a.script), a ? n.t("{n} 字", { n: a.script.length }) : ""),
        "a-avatar": L("a-avatar", !!a && (!!a.avatarId || !!a.video || a.status === "rendering")),
        "a-render": L(
          "a-render",
          !!a?.video,
          "",
          a?.status === "rendering",
          a?.status === "failed" && a.error || "",
          a ? { kind: "video", estimateSec: xl, startedAt: l.renderStartedAt(a), progressAt: l.baProgressAt.avatar } : void 0
        ),
        "a-publish": L("a-publish", !!a && (l.baState.value?.videos || []).some((f) => f.video === a.video && !!a.video))
      };
    }), O = e.computed(() => S.find((a) => M.value[a.key].state !== "done")?.key || "a-publish");
    async function P(a, f) {
      I.value = a, w.value = { ...w.value, [a]: "" };
      try {
        return await f(), await l.refreshState(), !0;
      } catch (E) {
        return w.value = { ...w.value, [a]: l.errorMessage(E) }, l.scrollToStep(a), !1;
      } finally {
        I.value = "";
      }
    }
    async function N() {
      await P("a-topic", async () => {
        const a = await l.ba("avatar.create", { ...V });
        F.value = a.id;
      });
    }
    async function B() {
      p.value && await P("a-script", () => l.ba("avatar.update", { id: p.value.id, patch: { script: k.value } }));
    }
    async function C() {
      p.value && await P("a-avatar", () => l.ba("avatar.update", { id: p.value.id, patch: { ...b } }));
    }
    async function j() {
      const a = p.value;
      !a || I.value || a.status === "rendering" || (l.noteRenderStarted(a.id), await P("a-render", () => l.ba("avatar.render", { id: a.id })));
    }
    async function u() {
      if (!p.value) return;
      let a = "";
      await P("a-publish", async () => {
        a = (await l.ba("avatar.toVideo", { id: p.value.id, platforms: g.value })).id;
      }) && A("goto", "video", { id: a });
    }
    async function _() {
      if (!(!p.value || !window.confirm(n.t("删除数字人项目「{p0}」？", { p0: p.value.name }))))
        try {
          await l.ba("avatar.remove", { id: p.value.id }), F.value = "", await l.refreshState();
        } catch (a) {
          v.error(l.errorMessage(a));
        }
    }
    function m(a) {
      l.scrollToStep(a);
    }
    return (a, f) => (e.openBlock(), e.createElementBlock("div", pl, [
      e.createVNode(se, {
        "module-key": "avatar",
        icon: "ri-user-voice-line",
        title: a.$t("数字人出镜介绍企业"),
        ability: a.$t("从知识库取公司名称、地址、主营、特色服务写讲稿（没有的写【待补充】）→ 数字人口播成片带字幕 → 进入短视频发布"),
        output: a.$t("30～120 秒口播成片，画面固定标注 AI 生成；讲稿自检广告法极限词")
      }, null, 8, ["title", "ability", "output"]),
      e.createElementVNode("div", vl, [
        e.createElementVNode("label", yl, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(a.$t("数字人项目")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": f[0] || (f[0] = (E) => F.value = E)
            },
            [
              e.createElementVNode(
                "option",
                hl,
                e.toDisplayString(a.$t("— 新建 —")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(T.value, (E) => (e.openBlock(), e.createElementBlock("option", {
                  key: E.id,
                  value: E.id
                }, e.toDisplayString(E.name), 9, kl))),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, F.value]
          ])
        ]),
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["ss-chip", s.value?.ready ? "ok" : "warn"])
          },
          e.toDisplayString(s.value?.ready ? a.$t("数字人服务已就绪") : a.$t("数字人服务未配置")),
          3
          /* TEXT, CLASS */
        ),
        p.value ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn sm ghost danger",
          onClick: _
        }, [
          f[9] || (f[9] = e.createElementVNode(
            "i",
            { class: "ri-delete-bin-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(a.$t("删除项目")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createVNode(oe, {
        title: a.$t("数字人介绍"),
        metas: S,
        runtime: M.value,
        "current-key": O.value,
        onJump: m
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", Vl, [
        e.createVNode(K, {
          "step-key": "a-topic",
          index: 0,
          title: S[0].title,
          hint: S[0].hint,
          runtime: M.value["a-topic"],
          "is-current": O.value === "a-topic"
        }, {
          default: e.withCtx(() => [
            p.value ? (e.openBlock(), e.createElementBlock(
              "p",
              Bl,
              e.toDisplayString(p.value.name),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", gl, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList($, (E) => e.createElementVNode("button", {
                      key: E,
                      type: "button",
                      class: e.normalizeClass(["ba-type", { on: V.topic === E }]),
                      onClick: (W) => V.topic = E
                    }, e.toDisplayString(D(E)), 11, bl)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", Nl, [
                  e.createElementVNode("label", El, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(a.$t("时长（秒）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": f[1] || (f[1] = (E) => V.seconds = E),
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
                        V.seconds,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])
                ]),
                e.createElementVNode("label", fl, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(a.$t("补充说明（选填，例如开业日期、活动内容）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": f[2] || (f[2] = (E) => V.brief = E),
                      rows: "2"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, V.brief]
                  ])
                ]),
                e.createElementVNode("details", $l, [
                  e.createElementVNode(
                    "summary",
                    null,
                    e.toDisplayString(a.$t("知识库里可用的资料 {n} 条", { n: o.value.length })),
                    1
                    /* TEXT */
                  ),
                  o.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                    "p",
                    _l,
                    e.toDisplayString(a.$t("知识库还没有公司资料：到左侧「知识库」导入营业执照、公司介绍等文档，讲稿会更完整")),
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
                          e.toDisplayString(a.$t("：{p0}", { p0: E.value })),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]),
                e.createElementVNode("div", Sl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!I.value,
                    onClick: N
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(I.value === "a-topic" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(a.$t("写讲稿")),
                      1
                      /* TEXT */
                    )
                  ], 8, Dl)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(K, {
          "step-key": "a-script",
          index: 1,
          title: S[1].title,
          hint: S[1].hint,
          runtime: M.value["a-script"],
          "is-current": O.value === "a-script"
        }, {
          default: e.withCtx(() => [
            p.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(p.value.warnings, (E) => (e.openBlock(), e.createElementBlock("p", {
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
                    "onUpdate:modelValue": f[3] || (f[3] = (E) => k.value = E),
                    class: "ba-script",
                    rows: "10"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, k.value]
                ]),
                e.createElementVNode("div", wl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!I.value || k.value === p.value.script,
                    onClick: B
                  }, [
                    f[11] || (f[11] = e.createElementVNode(
                      "i",
                      { class: "ri-save-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(a.$t("保存讲稿")),
                      1
                      /* TEXT */
                    )
                  ], 8, Cl),
                  e.createElementVNode(
                    "span",
                    Tl,
                    e.toDisplayString(a.$t("约 {n} 字 · 由 {p0} 撰写", { n: k.value.length, p0: e.unref(l.modelLabel)(p.value.model) })),
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
        e.createVNode(K, {
          "step-key": "a-avatar",
          index: 2,
          title: S[2].title,
          hint: S[2].hint,
          runtime: M.value["a-avatar"],
          "is-current": O.value === "a-avatar"
        }, {
          default: e.withCtx(() => [
            p.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Ll, [
                  e.createElementVNode("label", Ml, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(a.$t("形象 ID（留空用服务商默认）")),
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
                  e.createElementVNode("label", Al, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(a.$t("音色 ID（留空用默认）")),
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
                  e.createElementVNode("label", Il, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(a.$t("画幅")),
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
                          Fl,
                          e.toDisplayString(a.$t("竖屏 9:16（短视频）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "option",
                          Ul,
                          e.toDisplayString(a.$t("横屏 16:9")),
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
                e.createElementVNode("label", Rl, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(a.$t("如使用真人定制分身：授权说明（本人姓名、授权日期、授权书存放位置）")),
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
                e.createElementVNode("div", Ol, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!I.value,
                    onClick: C
                  }, [
                    f[12] || (f[12] = e.createElementVNode(
                      "i",
                      { class: "ri-save-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(a.$t("保存")),
                      1
                      /* TEXT */
                    )
                  ], 8, Pl),
                  e.createElementVNode(
                    "span",
                    zl,
                    e.toDisplayString(a.$t("形象与音色在「数字人工作台 → 配置」里查看；使用真人形象必须有本人书面授权")),
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
        e.createVNode(K, {
          "step-key": "a-render",
          index: 3,
          title: S[3].title,
          hint: S[3].hint,
          runtime: M.value["a-render"],
          "is-current": O.value === "a-render",
          retry: p.value && p.value.status !== "rendering" ? j : void 0,
          "retry-label": a.$t("重新成片")
        }, {
          default: e.withCtx(() => [
            p.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Kl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!I.value || p.value.status === "rendering" || k.value !== p.value.script,
                    onClick: j
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(p.value.status === "rendering" ? "ri-loader-4-line spin" : "ri-film-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(p.value.video ? a.$t("重新成片") : a.$t("数字人成片")),
                      1
                      /* TEXT */
                    )
                  ], 8, jl),
                  e.createElementVNode(
                    "span",
                    Wl,
                    e.toDisplayString(a.$t("通常 1～5 分钟；讲稿里的【待补充】要先补完")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "p",
                  Jl,
                  e.toDisplayString(a.$t("成片后自动在画面顶部加「本视频由 AI 生成」标识，最后 3 秒叠片尾（门店名、地址、营业时间，在「设置」里填）")),
                  1
                  /* TEXT */
                ),
                p.value.video ? (e.openBlock(), e.createElementBlock("video", {
                  key: 0,
                  src: e.unref(l.fileUrl)(p.value.video),
                  controls: "",
                  playsinline: "",
                  class: e.normalizeClass(["ba-video", { wide: p.value.aspectRatio === "16:9" }])
                }, null, 10, ql)) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry", "retry-label"]),
        e.createVNode(K, {
          "step-key": "a-publish",
          index: 4,
          title: S[4].title,
          hint: S[4].hint,
          runtime: M.value["a-publish"],
          "is-current": O.value === "a-publish"
        }, {
          default: e.withCtx(() => [
            p.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Hl, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(z, (E) => e.createElementVNode("label", {
                      key: E,
                      class: "ba-check"
                    }, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": f[8] || (f[8] = (W) => g.value = W),
                        type: "checkbox",
                        value: E
                      }, null, 8, Gl), [
                        [e.vModelCheckbox, g.value]
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
                    disabled: !!I.value || !p.value.video || !g.value.length,
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
                      e.toDisplayString(a.$t("写发布文案并进入发布")),
                      1
                      /* TEXT */
                    )
                  ], 8, Yl)
                ]),
                e.createElementVNode(
                  "p",
                  Ql,
                  e.toDisplayString(a.$t("生成一个已成片的视频项目，在「短视频发布」里审核后发布；文案末尾自动加「本视频由 AI 生成」")),
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
}), Zl = /* @__PURE__ */ x(Xl, [["__scopeId", "data-v-f8ddb9b2"]]), en = { class: "ss-module" }, tn = { class: "ss-steps" }, ln = { class: "ss-actions" }, nn = ["disabled"], on = ["disabled"], sn = { class: "ss-muted" }, an = { class: "ss-muted" }, rn = {
  key: 0,
  class: "ss-note info"
}, cn = {
  key: 1,
  class: "ss-note ok"
}, dn = {
  key: 2,
  class: "ss-table-wrap"
}, un = { class: "ss-table" }, mn = { class: "ba-wrap" }, pn = ["onUpdate:modelValue"], vn = ["value"], yn = { class: "ba-row" }, hn = ["disabled", "onClick"], kn = ["onClick"], Vn = { class: "ba-gpick" }, gn = ["onClick"], bn = ["src"], Nn = { class: "ss-actions" }, En = { class: "ss-muted" }, fn = ["checked", "onChange"], $n = { class: "ss-actions" }, _n = ["disabled"], Sn = { class: "ss-muted" }, Dn = {
  key: 0,
  class: "ss-empty"
}, Bn = { class: "ba-listing__imgs" }, wn = ["src"], Cn = { class: "ba-listing__body" }, Tn = { class: "ba-listing__head" }, Ln = { class: "ss-muted" }, Mn = ["onUpdate:modelValue"], An = ["onUpdate:modelValue", "placeholder"], In = ["onUpdate:modelValue"], Fn = { class: "ss-actions" }, Un = ["disabled", "onClick"], Rn = ["disabled", "onClick"], On = ["onClick"], Pn = { class: "ss-muted" }, zn = {
  key: 0,
  class: "ss-empty"
}, Kn = { class: "ss-chip" }, jn = ["disabled", "onClick"], Wn = {
  key: 0,
  class: "ss-empty"
}, Jn = {
  key: 1,
  class: "ss-table-wrap"
}, qn = { class: "ss-table" }, Hn = ["onUpdate:modelValue", "placeholder", "onChange"], Gn = { class: "ba-row" }, Yn = ["onClick"], Qn = ["onClick"], xn = ["onClick"], Xn = /* @__PURE__ */ e.defineComponent({
  __name: "ListingTab",
  setup(J) {
    const R = Y.useNotificationStore(), A = ee.useRouter(), v = l.baState, $ = e.computed(() => l.baGarments.value), z = e.computed(() => (v.value?.settings.channels || []).filter((r) => r.enabled)), D = e.computed(() => v.value?.ruleHits || []), T = e.computed(() => v.value?.listings || []), F = e.computed(() => T.value.filter((r) => r.status === "draft" || r.status === "confirmed")), p = e.computed(() => T.value.filter((r) => r.status === "confirmed")), V = e.computed(() => T.value.filter((r) => r.status === "handed" || r.status === "listed" || r.status === "delisted")), o = e.ref([]), s = e.ref([]);
    e.watch(z, (r) => {
      s.value.length || (s.value = r.slice(0, 1).map((t) => t.id));
    }, { immediate: !0 });
    const k = e.ref(!1), b = e.ref([]), g = e.reactive({}), I = e.reactive({});
    e.watch(T, (r) => {
      for (const t of r)
        g[t.id] || (g[t.id] = { title: t.title, points: t.sellingPoints.join(`
`), detail: t.detail }), I[t.id] === void 0 && (I[t.id] = t.productUrl || "");
    }, { immediate: !0 });
    const w = e.ref(""), S = e.ref({}), L = [
      { key: "l-rules", title: n.t("库存巡检"), hint: n.t("售罄下架、断码提醒、过季提醒、试穿多成交少换主图") },
      { key: "l-pick", title: n.t("选商品与渠道"), hint: n.t("商品来自服装实体店智能体的商品库") },
      { key: "l-gen", title: n.t("生成图文"), hint: n.t("标题、卖点、详情、关键词 + 主图") },
      { key: "l-confirm", title: n.t("确认"), hint: n.t("逐条改、逐条确认；含极限词的不能确认") },
      { key: "l-hand", title: n.t("数字员工上架"), hint: n.t("在网店后台填写，停在提交前等你确认") },
      { key: "l-ledger", title: n.t("上架台账"), hint: n.t("记录商品链接，下架时用") }
    ];
    function M(r, t, i) {
      return w.value === r ? { state: "running" } : S.value[r] ? { state: "failed", error: S.value[r] } : t ? { state: "done", summary: i } : { state: "todo" };
    }
    const O = e.computed(() => ({
      "l-rules": M("l-rules", k.value, n.t("{n} 条提醒", { n: D.value.length })),
      "l-pick": M("l-pick", o.value.length > 0 && s.value.length > 0),
      "l-gen": M("l-gen", T.value.length > 0, n.t("{n} 份草稿", { n: F.value.length })),
      "l-confirm": M("l-confirm", T.value.some((r) => r.status !== "draft")),
      "l-hand": M("l-hand", V.value.length > 0),
      "l-ledger": M("l-ledger", T.value.some((r) => r.status === "listed"))
    })), P = e.computed(() => L.find((r) => O.value[r.key].state !== "done")?.key || "l-ledger"), N = e.reactive({});
    e.watch(D, (r) => {
      for (const t of r) {
        const i = `${t.garmentId}:${t.rule}`;
        N[i] || (N[i] = t.action);
      }
    }, { immediate: !0 });
    const B = (r) => ({ delist: n.t("下架"), presale: n.t("改为预售"), delist_color: n.t("下架该颜色"), badge_sale: n.t("主图加「断码特价」"), clearance: n.t("转入清仓专区"), swap_image: n.t("换主图（试穿最多的造型图）"), remind: n.t("提醒店长") })[r], C = e.ref("");
    async function j() {
      const r = await l.pickFiles("excel");
      r.length && await W("l-rules", async () => {
        const t = await l.ba("finance.import", { path: r[0], kind: "inventory" });
        k.value = !0, C.value = t.unmatched.length ? n.t("已同步 {n} 行；这些货号在商品库里找不到：{p0}", { n: t.rows, p0: t.unmatched.slice(0, 8).join("、") }) : n.t("已同步 {n} 行库存", { n: t.rows });
      });
    }
    async function u(r) {
      const t = N[`${r.garmentId}:${r.rule}`] || r.action;
      await W("l-rules", async () => {
        const i = await l.ba("rules.handle", { garmentId: r.garmentId, action: t });
        if (i.text) {
          const c = await l.handToDigitalEmployee(n.t("{p0}：{p1}", { p0: B(t), p1: l.garmentName(r.garmentId) }), i.text);
          if (t === "delist") for (const U of i.listingIds) await l.ba("listing.status", { id: U, status: "handed", conversationId: c });
          R.success(n.t("已交给数字员工处理"));
        } else i.done.length && R.info(i.done.join(n.t("；")));
      });
    }
    const _ = (r) => ({ soldout: n.t("售罄"), broken_size: n.t("断码"), off_season: n.t("过季"), lagging: n.t("试穿多成交少") })[r], m = (r) => ({ draft: n.t("草稿"), confirmed: n.t("已确认"), handed: n.t("数字员工处理中"), listed: n.t("已上架"), delisted: n.t("已下架") })[r], a = (r) => v.value?.settings.channels.find((t) => t.id === r)?.name || r, f = (r) => !!l.baGarments.value.find((t) => t.id === r)?.onShelf;
    function E(r, t) {
      const i = r.indexOf(t);
      i >= 0 ? r.splice(i, 1) : r.push(t);
    }
    async function W(r, t) {
      w.value = r, S.value = { ...S.value, [r]: "" };
      try {
        return await t(), await l.refreshState(), !0;
      } catch (i) {
        return S.value = { ...S.value, [r]: l.errorMessage(i) }, l.scrollToStep(r), !1;
      } finally {
        w.value = "";
      }
    }
    async function Q() {
      await W("l-rules", async () => {
        const r = await l.ba("rules.evaluate");
        k.value = !0, r.delisted && R.info(n.t("已把 {n} 款售罄商品从门店试穿手机端下架", { n: r.delisted }));
      });
    }
    async function G(r, t) {
      await W("l-rules", () => l.ba("local.shelf", { garmentId: r, onShelf: t }));
    }
    async function X() {
      b.value = [], await W("l-gen", async () => {
        const r = await l.ba("listing.generate", { garmentIds: o.value, channelIds: s.value });
        b.value = r.errors;
      });
    }
    async function te(r) {
      const t = g[r];
      await W("l-confirm", () => l.ba("listing.update", { id: r, patch: { title: t.title, detail: t.detail, sellingPoints: t.points.split(`
`).map((c) => c.trim()).filter(Boolean) } }));
      const i = T.value.find((c) => c.id === r);
      i && (g[r] = { title: i.title, points: i.sellingPoints.join(`
`), detail: i.detail });
    }
    async function le(r) {
      await W("l-confirm", () => l.ba("listing.confirm", { id: r }));
    }
    async function Z(r) {
      await W("l-confirm", () => l.ba("listing.remove", { id: r }));
    }
    async function ne(r) {
      await W("l-hand", async () => {
        const i = await l.ba("listing.instruction", { id: r }), c = T.value.find((H) => H.id === r), U = await l.handToDigitalEmployee(n.t("{p0} 上架：{p1}", { p0: a(c.channelId), p1: c.title.slice(0, 20) }), i);
        await l.ba("listing.status", { id: r, status: "handed", conversationId: U });
      }) && R.success(n.t("已交给数字员工，点「查看执行过程」可以看它操作；提交前会请你确认"));
    }
    async function d(r, t) {
      await W("l-ledger", () => l.ba("listing.status", { id: r, status: t }));
    }
    async function h(r) {
      await W("l-ledger", () => l.ba("listing.update", { id: r, patch: { productUrl: I[r] } }));
    }
    function y(r) {
      A.push(`/conversations/${r}`).catch((t) => R.error(l.errorMessage(t)));
    }
    function q(r) {
      l.scrollToStep(r);
    }
    return (r, t) => (e.openBlock(), e.createElementBlock("div", en, [
      e.createVNode(se, {
        "module-key": "listing",
        icon: "ri-store-3-line",
        title: r.$t("商品图文自动上下架"),
        ability: r.$t("按渠道生成标题、卖点、详情与主图（按渠道比例补白边）→ 你确认 → 数字员工在网店后台填写、停在提交前；售罄 / 断码 / 过季 / 试穿多成交少按规则下架或提醒"),
        output: r.$t("各渠道上架草稿、上架台账、下架指令；价格与库存取自商品库，不让模型填")
      }, null, 8, ["title", "ability", "output"]),
      e.createVNode(oe, {
        title: r.$t("商品上下架"),
        metas: L,
        runtime: O.value,
        "current-key": P.value,
        onJump: q
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", tn, [
        e.createVNode(K, {
          "step-key": "l-rules",
          index: 0,
          title: L[0].title,
          hint: L[0].hint,
          runtime: O.value["l-rules"],
          "is-current": P.value === "l-rules"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", ln, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!w.value,
                onClick: Q
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(w.value === "l-rules" ? "ri-loader-4-line spin" : "ri-radar-line")
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
              ], 8, nn),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!w.value,
                onClick: j
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
                sn,
                e.toDisplayString(e.unref(v)?.settings.autoDelistLocal ? r.$t("售罄款会自动从门店试穿手机端下架（只动本机，网店要人确认）") : r.$t("只提醒，不自动下架")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "p",
              an,
              e.toDisplayString(r.$t("库存是自动下架的前提：导入收银 / 进销存导出的「货号 × 尺码 × 库存」表同步到商品库；读不到库存时只做上架与人工下架。")),
              1
              /* TEXT */
            ),
            C.value ? (e.openBlock(), e.createElementBlock("p", rn, [
              t[1] || (t[1] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(C.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            k.value && !D.value.length ? (e.openBlock(), e.createElementBlock("p", cn, [
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
            D.value.length ? (e.openBlock(), e.createElementBlock("div", dn, [
              e.createElementVNode("table", un, [
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
                    e.renderList(D.value, (i, c) => (e.openBlock(), e.createElementBlock("tr", { key: c }, [
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
                          e.toDisplayString(_(i.rule)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        mn,
                        e.toDisplayString(i.detail),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("select", {
                          "onUpdate:modelValue": (U) => N[`${i.garmentId}:${i.rule}`] = U,
                          class: "ba-mini"
                        }, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(i.options || [i.action], (U) => (e.openBlock(), e.createElementBlock("option", {
                              key: U,
                              value: U
                            }, e.toDisplayString(B(U)) + e.toDisplayString(U === i.action ? r.$t("（默认）") : ""), 9, vn))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 8, pn), [
                          [e.vModelSelect, N[`${i.garmentId}:${i.rule}`]]
                        ])
                      ]),
                      e.createElementVNode("td", yn, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm",
                          disabled: !!w.value,
                          onClick: (U) => u(i)
                        }, e.toDisplayString(r.$t("执行")), 9, hn),
                        f(i.garmentId) ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: (U) => G(i.garmentId, !1)
                        }, e.toDisplayString(r.$t("门店手机端下架")), 9, kn)) : e.createCommentVNode("v-if", !0)
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
        e.createVNode(K, {
          "step-key": "l-pick",
          index: 1,
          title: L[1].title,
          hint: L[1].hint,
          runtime: O.value["l-pick"],
          "is-current": P.value === "l-pick"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Vn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList($.value, (i) => (e.openBlock(), e.createElementBlock("button", {
                  key: i.id,
                  type: "button",
                  class: e.normalizeClass({ on: o.value.includes(i.id) }),
                  onClick: (c) => E(o.value, i.id)
                }, [
                  e.createElementVNode("img", {
                    src: e.unref(l.fileUrl)(i.image),
                    alt: "",
                    loading: "lazy"
                  }, null, 8, bn),
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
                ], 10, gn))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", Nn, [
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
                e.renderList(z.value, (i) => (e.openBlock(), e.createElementBlock("label", {
                  key: i.id,
                  class: "ba-check"
                }, [
                  e.createElementVNode("input", {
                    type: "checkbox",
                    checked: s.value.includes(i.id),
                    onChange: (c) => E(s.value, i.id)
                  }, null, 40, fn),
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
        e.createVNode(K, {
          "step-key": "l-gen",
          index: 2,
          title: L[2].title,
          hint: L[2].hint,
          runtime: O.value["l-gen"],
          "is-current": P.value === "l-gen"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", $n, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!w.value || !o.value.length || !s.value.length,
                onClick: X
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(w.value === "l-gen" ? "ri-loader-4-line spin" : "ri-magic-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(r.$t("生成 {n} 份上架草稿", { n: o.value.length * s.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, _n),
              e.createElementVNode(
                "span",
                Sn,
                e.toDisplayString(r.$t("主图 = 商品图 + 该款试穿图，按渠道比例补白边")),
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
        e.createVNode(K, {
          "step-key": "l-confirm",
          index: 3,
          title: L[3].title,
          hint: L[3].hint,
          runtime: O.value["l-confirm"],
          "is-current": P.value === "l-confirm"
        }, {
          default: e.withCtx(() => [
            F.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              Dn,
              e.toDisplayString(r.$t("生成后的草稿在这里逐条确认")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(F.value, (i) => (e.openBlock(), e.createElementBlock("div", {
                key: i.id,
                class: "ba-listing"
              }, [
                e.createElementVNode("div", Bn, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(i.images.slice(0, 4), (c) => (e.openBlock(), e.createElementBlock("img", {
                      key: c,
                      src: e.unref(l.fileUrl)(c),
                      alt: ""
                    }, null, 8, wn))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", Cn, [
                  e.createElementVNode("div", Tn, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(a(i.channelId)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      Ln,
                      e.toDisplayString(e.unref(l.garmentName)(i.garmentId)) + " · ¥" + e.toDisplayString(i.price),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", i.status === "confirmed" ? "ok" : ""])
                      },
                      e.toDisplayString(m(i.status)),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(i.warnings, (c) => (e.openBlock(), e.createElementBlock("p", {
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
                    "onUpdate:modelValue": (c) => g[i.id].title = c,
                    type: "text"
                  }, null, 8, Mn), [
                    [e.vModelText, g[i.id].title]
                  ]),
                  e.withDirectives(e.createElementVNode("textarea", {
                    "onUpdate:modelValue": (c) => g[i.id].points = c,
                    rows: "2",
                    placeholder: r.$t("卖点，一行一条")
                  }, null, 8, An), [
                    [e.vModelText, g[i.id].points]
                  ]),
                  e.withDirectives(e.createElementVNode("textarea", {
                    "onUpdate:modelValue": (c) => g[i.id].detail = c,
                    rows: "3"
                  }, null, 8, In), [
                    [e.vModelText, g[i.id].detail]
                  ]),
                  e.createElementVNode("div", Fn, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!w.value,
                      onClick: (c) => te(i.id)
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
                    ], 8, Un),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm primary",
                      disabled: !!w.value || i.status === "confirmed" || i.warnings.length > 0,
                      onClick: (c) => le(i.id)
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
                    ], 8, Rn),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (c) => Z(i.id)
                    }, e.toDisplayString(r.$t("删除")), 9, On)
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
        e.createVNode(K, {
          "step-key": "l-hand",
          index: 4,
          title: L[4].title,
          hint: L[4].hint,
          runtime: O.value["l-hand"],
          "is-current": P.value === "l-hand"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode(
              "p",
              Pn,
              e.toDisplayString(r.$t("先在内置浏览器里登录各网店后台。数字员工按草稿填写，停在「提交 / 发布」前截图给你，由你亲自点提交。")),
              1
              /* TEXT */
            ),
            p.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              zn,
              e.toDisplayString(r.$t("没有待上架的已确认草稿")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(p.value, (i) => (e.openBlock(), e.createElementBlock("div", {
                key: i.id,
                class: "ss-actions"
              }, [
                e.createElementVNode(
                  "span",
                  Kn,
                  e.toDisplayString(a(i.channelId)),
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
                  disabled: !!w.value,
                  onClick: (c) => ne(i.id)
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
                ], 8, jn)
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(K, {
          "step-key": "l-ledger",
          index: 5,
          title: L[5].title,
          hint: L[5].hint,
          runtime: O.value["l-ledger"],
          "is-current": P.value === "l-ledger"
        }, {
          default: e.withCtx(() => [
            V.value.length ? (e.openBlock(), e.createElementBlock("div", Jn, [
              e.createElementVNode("table", qn, [
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
                    e.renderList(V.value, (i) => (e.openBlock(), e.createElementBlock("tr", {
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
                        e.toDisplayString(a(i.channelId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", i.status === "listed" ? "ok" : i.status === "delisted" ? "bad" : "brand"])
                          },
                          e.toDisplayString(m(i.status)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (c) => I[i.id] = c,
                          type: "text",
                          placeholder: r.$t("上架成功后粘贴商品链接"),
                          onChange: (c) => h(i.id)
                        }, null, 40, Hn), [
                          [e.vModelText, I[i.id]]
                        ])
                      ]),
                      e.createElementVNode("td", Gn, [
                        i.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: (c) => y(i.conversationId)
                        }, e.toDisplayString(r.$t("查看执行过程")), 9, Yn)) : e.createCommentVNode("v-if", !0),
                        i.status === "handed" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 1,
                          type: "button",
                          class: "ss-link",
                          onClick: (c) => d(i.id, "listed")
                        }, e.toDisplayString(r.$t("已上架")), 9, Qn)) : e.createCommentVNode("v-if", !0),
                        i.status === "listed" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 2,
                          type: "button",
                          class: "ss-link",
                          onClick: (c) => d(i.id, "delisted")
                        }, e.toDisplayString(r.$t("标记已下架")), 9, xn)) : e.createCommentVNode("v-if", !0)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              Wn,
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
}), Zn = /* @__PURE__ */ x(Xn, [["__scopeId", "data-v-87f721c0"]]), eo = { class: "ss-module" }, to = { class: "ss-steps" }, lo = { class: "ss-actions" }, no = ["disabled"], oo = { class: "ss-muted" }, so = { class: "ss-actions" }, ao = ["disabled"], io = { class: "ss-muted" }, ro = { class: "ss-muted" }, co = { class: "ss-actions" }, uo = ["disabled"], mo = { class: "ss-muted" }, po = { class: "ss-actions" }, vo = { class: "ss-field" }, yo = { class: "ss-field" }, ho = ["disabled"], ko = { class: "ss-kpis" }, Vo = { class: "ss-kpi accent" }, go = { key: 0 }, bo = { class: "ss-kpi" }, No = { class: "ss-kpi" }, Eo = { class: "ss-kpi" }, fo = { class: "ss-kpi" }, $o = { class: "ss-kpi" }, _o = { class: "ss-kpi" }, So = { class: "ss-kpi" }, Do = { key: 0 }, Bo = {
  key: 0,
  class: "ss-note warn"
}, wo = ["title"], Co = ["title"], To = {
  key: 2,
  class: "ss-note warn"
}, Lo = { class: "ba-blocks" }, Mo = {
  key: 0,
  class: "ss-muted"
}, Ao = { class: "ss-actions" }, Io = { class: "ss-subhead" }, Fo = { value: "amount" }, Uo = { value: "qty" }, Ro = { value: "grossProfit" }, Oo = { value: "sellThrough" }, Po = { class: "ss-table-wrap ba-scroll" }, zo = { class: "ss-table" }, Ko = { class: "num" }, jo = { class: "num" }, Wo = { class: "num" }, Jo = { class: "num" }, qo = { class: "num" }, Ho = { class: "num" }, Go = { class: "num" }, Yo = { class: "num" }, Qo = { class: "ss-subhead" }, xo = { class: "ba-slow" }, Xo = { class: "ss-actions" }, Zo = ["disabled", "onClick"], es = ["disabled"], ts = {
  key: 0,
  class: "ba-report"
}, ls = { class: "ss-muted" }, ns = {
  key: 0,
  class: "ss-note warn"
}, os = {
  key: 1,
  class: "ss-note danger"
}, ss = {
  key: 2,
  class: "ss-note ok"
}, as = {
  key: 1,
  class: "ba-history"
}, is = { class: "ss-muted" }, rs = ["onClick"], cs = { class: "ss-actions" }, ds = ["disabled"], us = ["disabled"], ms = ["disabled"], ps = ["disabled"], vs = {
  key: 0,
  class: "ss-muted"
}, ys = {
  key: 1,
  class: "ss-actions"
}, hs = ["title"], ks = ["placeholder"], Vs = ["disabled"], gs = { class: "ss-muted" }, bs = /* @__PURE__ */ e.defineComponent({
  __name: "FinanceTab",
  setup(J) {
    const R = e.defineComponent({
      props: { items: { type: Array, required: !0 } },
      setup(d) {
        return () => d.items.length ? e.h("ul", { class: "ba-imports" }, d.items.slice(0, 5).map((h) => e.h("li", {}, n.t("{p0}：{a} ~ {b}，{n} 行（跳过 {m} 行）· 识别列 {c}", { p0: h.file, a: h.from, b: h.to, n: h.rows, m: h.skipped, c: Object.values(h.mapping).join(" / ") })))) : null;
      }
    }), A = Y.useNotificationStore(), v = ee.useRouter(), $ = l.baState, z = ["daily", "weekly", "monthly"], D = e.computed(() => $.value?.imports || []), T = e.computed(() => $.value?.reports || []), F = e.ref(""), p = e.computed(() => T.value.find((d) => d.id === F.value) || T.value[0] || null), V = e.ref(""), o = e.ref(""), s = e.ref(null), k = e.ref(!1), b = e.ref(""), g = e.ref(""), I = e.ref({});
    e.onMounted(async () => {
      const d = await l.ba("finance.range").catch(() => ({ from: "", to: "" }));
      if (d.to) {
        o.value = d.to;
        const h = /* @__PURE__ */ new Date(`${d.to}T00:00:00`);
        h.setDate(h.getDate() - 29), V.value = h.toISOString().slice(0, 10) < d.from ? d.from : h.toISOString().slice(0, 10);
      }
    });
    const w = [
      { key: "f-sales", title: n.t("导入销售数据"), hint: n.t("收银系统 / 网店导出的销售明细（只读）") },
      { key: "f-expense", title: n.t("导入费用"), hint: n.t("房租、工资、水电、推广等，可跳过") },
      { key: "f-metrics", title: n.t("经营指标"), hint: n.t("营业额、毛利、客单价、连带率、费用率、售罄率") },
      { key: "f-report", title: n.t("生成报表"), hint: n.t("日报 / 周报 / 月报；解读里的数字回原数据核对") },
      { key: "f-push", title: n.t("推送与导出"), hint: n.t("企业微信 / 钉钉 / 邮件，或导出 Excel") },
      { key: "f-qa", title: n.t("随时问数"), hint: n.t("用大白话问，回答注明期间与口径") }
    ];
    function S(d, h, y) {
      return g.value === d ? { state: "running" } : I.value[d] ? { state: "failed", error: I.value[d] } : h ? { state: "done", summary: y } : { state: "todo" };
    }
    const L = e.computed(() => ({
      "f-sales": S("f-sales", ($.value?.salesRows || 0) > 0, n.t("{n} 行", { n: $.value?.salesRows || 0 })),
      "f-expense": S("f-expense", ($.value?.expenseRows || 0) > 0 || k.value, $.value?.expenseRows ? n.t("{n} 行", { n: $.value.expenseRows }) : n.t("已跳过")),
      "f-metrics": S("f-metrics", !!s.value || T.value.length > 0),
      "f-report": S("f-report", !!p.value, p.value ? `${p.value.metrics.from} ~ ${p.value.metrics.to}` : ""),
      "f-push": S("f-push", !!p.value && (!!p.value.pushed?.some((d) => d.ok) || !!p.value.exportPath)),
      "f-qa": S("f-qa", ($.value?.qa.length || 0) > 0)
    })), M = e.computed(() => w.find((d) => L.value[d.key].state !== "done")?.key || "f-qa"), O = e.computed(() => {
      const d = s.value;
      return d ? [
        { title: n.t("渠道"), rows: d.byChannel.slice(0, 6), pct: !1 },
        { title: n.t("品类"), rows: d.byCategory.slice(0, 6), pct: !1 },
        { title: n.t("畅销款"), rows: d.topItems.slice(0, 6).map((h) => ({ ...h, share: d.netRevenue ? h.value / d.netRevenue : 0 })), pct: !1 },
        { title: n.t("售罄率"), rows: d.sellThrough.slice(0, 6), pct: !0 }
      ] : [];
    }), P = e.ref("amount"), N = e.computed(() => [...s.value?.items || []].sort((d, h) => (h[P.value] ?? -1) - (d[P.value] ?? -1)).slice(0, 30)), B = e.computed(() => Math.max(1, ...s.value?.daily.map((d) => d.netRevenue) || [1])), C = e.ref([]);
    async function j() {
      await f("f-sales", async () => {
        if (C.value = await l.ba("finance.folderImport"), !C.value.length) throw new Error(n.t("还没有配置共享文件夹：到「设置 → 共享文件夹取数」选择"));
      });
    }
    async function u() {
      p.value && await f("f-push", async () => {
        const d = await l.ba("finance.exportPdf", { id: p.value.id });
        await l.openPath(d, !0);
      });
    }
    async function _() {
      if (!p.value || !window.confirm(n.t("把 {a} ~ {b} 的营业额、成本、费用汇总成序时账草稿，导入财务智能体当前账套？金额为含税，价税分离与科目请在财务智能体里复核。", { a: p.value.metrics.from, b: p.value.metrics.to }))) return;
      await f("f-push", async () => {
        const h = await l.ba("finance.toJournal", { id: p.value.id }), y = window.electronAPI, q = y?.workbenches?.financeAgent, r = new Error(n.t("财务智能体未开通，序时账已导出：{p0}", { p0: h })), t = await y?.solutionPkg?.prepare?.({ id: "workbench-finance-agent" }).catch(() => null);
        if (!q?.invoke || t && t.ok === !1) throw r;
        try {
          await q.invoke("data.importJournal", { path: h, append: !0 });
        } catch (i) {
          throw /No handler registered/i.test(String(i?.message)) ? r : i;
        }
      }) && (A.success(n.t("已导入财务智能体")), v.push("/workbenches/finance-agent"));
    }
    const m = (d) => ({ daily: n.t("日报（昨天）"), weekly: n.t("周报（上周）"), monthly: n.t("月报（上月）"), custom: n.t("自定义期间") })[d];
    function a(d, h) {
      if (!h) return "";
      const y = (d - h) / h;
      return `${y >= 0 ? "↑" : "↓"} ${l.fmtPct(Math.abs(y), 1)} ${n.t("较上期")}`;
    }
    async function f(d, h) {
      g.value = d, I.value = { ...I.value, [d]: "" };
      try {
        return await h(), await l.refreshState(), !0;
      } catch (y) {
        return I.value = { ...I.value, [d]: l.errorMessage(y) }, l.scrollToStep(d), !1;
      } finally {
        g.value = "";
      }
    }
    async function E(d) {
      const h = await l.pickFiles("excel");
      h.length && await f(d === "sales" ? "f-sales" : "f-expense", async () => {
        if (await l.ba("finance.import", { path: h[0], kind: d }), d === "sales") {
          const y = await l.ba("finance.range");
          V.value || (V.value = y.from), o.value || (o.value = y.to);
        }
      });
    }
    async function W(d) {
      window.confirm(n.t("清空已导入的数据？")) && (await f("f-sales", () => l.ba("finance.clear", { kind: d })), s.value = null);
    }
    async function Q() {
      await f("f-metrics", async () => {
        s.value = await l.ba("finance.metrics", { from: V.value, to: o.value });
      });
    }
    async function G(d) {
      await f("f-report", async () => {
        const h = await l.ba("finance.report", { kind: d, from: V.value, to: o.value });
        F.value = h.id, s.value = h.metrics;
      });
    }
    async function X() {
      if (!p.value) return;
      await f("f-push", () => l.ba("finance.push", { id: p.value.id })) && A.success(n.t("已推送"));
    }
    async function te() {
      p.value && await f("f-push", async () => {
        const d = await l.ba("finance.export", { id: p.value.id });
        await l.openPath(d, !0);
      });
    }
    async function le() {
      if (p.value)
        try {
          await navigator.clipboard.writeText(await l.ba("finance.reportText", { id: p.value.id })), A.success(n.t("已复制"));
        } catch (d) {
          A.error(l.errorMessage(d));
        }
    }
    async function Z() {
      await f("f-qa", () => l.ba("finance.ask", { q: b.value })) && (b.value = "");
    }
    function ne(d) {
      l.scrollToStep(d);
    }
    return (d, h) => (e.openBlock(), e.createElementBlock("div", eo, [
      e.createVNode(se, {
        "module-key": "finance",
        icon: "ri-line-chart-line",
        title: d.$t("经营数据调取与统计"),
        ability: d.$t("导入收银系统 / 网店导出的销售明细与费用表（只读）→ 按固定口径算营业额、毛利、客单价、连带率、售罄率 → 模型只写解读，解读里的数字逐个回原数据核对 → 推送、导出"),
        output: d.$t("经营日报 / 周报 / 月报、Excel 报表、随时问数；数字全部由规则计算")
      }, null, 8, ["title", "ability", "output"]),
      e.createVNode(oe, {
        title: d.$t("经营数据"),
        metas: w,
        runtime: L.value,
        "current-key": M.value,
        onJump: ne
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", to, [
        e.createVNode(K, {
          "step-key": "f-sales",
          index: 0,
          title: w[0].title,
          hint: w[0].hint,
          runtime: L.value["f-sales"],
          "is-current": M.value === "f-sales"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", lo, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!g.value,
                onClick: h[0] || (h[0] = (y) => E("sales"))
              }, [
                h[10] || (h[10] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(d.$t("导入销售明细")),
                  1
                  /* TEXT */
                )
              ], 8, no),
              e.createElementVNode(
                "span",
                oo,
                e.toDisplayString(d.$t("已有 {n} 行。列：日期、单号、商品 / 货号、品类、数量、实收金额、成本（可选）、渠道（可选）；同一日期段重复导入会覆盖", { n: e.unref($)?.salesRows || 0 })),
                1
                /* TEXT */
              ),
              e.unref($)?.salesRows ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: h[1] || (h[1] = (y) => W("sales"))
                },
                e.toDisplayString(d.$t("清空")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("div", so, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: !!g.value,
                onClick: j
              }, [
                h[11] || (h[11] = e.createElementVNode(
                  "i",
                  { class: "ri-folder-received-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(d.$t("从共享文件夹取数")),
                  1
                  /* TEXT */
                )
              ], 8, ao),
              e.createElementVNode(
                "span",
                io,
                e.toDisplayString(d.$t("文件夹在「设置」里配置；定时取数在「定时与联动」里打开")),
                1
                /* TEXT */
              )
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(C.value, (y) => (e.openBlock(), e.createElementBlock(
                "p",
                {
                  key: y.kind,
                  class: e.normalizeClass(["ss-note", y.ok ? "ok" : "danger"])
                },
                [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(y.ok ? "ri-check-line" : "ri-error-warning-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(d.$t("{p0} {p1}：{p2}", { p0: y.kind, p1: y.file || "", p2: y.note })),
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
              ro,
              e.toDisplayString(d.$t("取数方式：收银系统（秦丝、有赞零售、管家婆等）后台导出 Excel；有开放接口或数据库的，可在「数据查询」里配数据源后导出同样的表。只读，不改原系统。")),
              1
              /* TEXT */
            ),
            e.createVNode(e.unref(R), {
              items: D.value.filter((y) => y.kind === "sales")
            }, null, 8, ["items"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(K, {
          "step-key": "f-expense",
          index: 1,
          title: w[1].title,
          hint: w[1].hint,
          runtime: L.value["f-expense"],
          "is-current": M.value === "f-expense"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", co, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!g.value,
                onClick: h[2] || (h[2] = (y) => E("expense"))
              }, [
                h[12] || (h[12] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(d.$t("导入费用表")),
                  1
                  /* TEXT */
                )
              ], 8, uo),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn ghost sm",
                  onClick: h[3] || (h[3] = (y) => k.value = !0)
                },
                e.toDisplayString(d.$t("没有，跳过")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                mo,
                e.toDisplayString(d.$t("已有 {n} 行。列：日期 / 月份、费用项目、金额（房租、工资、水电、推广等）", { n: e.unref($)?.expenseRows || 0 })),
                1
                /* TEXT */
              )
            ]),
            e.createVNode(e.unref(R), {
              items: D.value.filter((y) => y.kind === "expense")
            }, null, 8, ["items"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(K, {
          "step-key": "f-metrics",
          index: 2,
          title: w[2].title,
          hint: w[2].hint,
          runtime: L.value["f-metrics"],
          "is-current": M.value === "f-metrics"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", po, [
              e.createElementVNode("label", vo, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(d.$t("开始")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[4] || (h[4] = (y) => V.value = y),
                    type: "date"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, V.value]
                ])
              ]),
              e.createElementVNode("label", yo, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(d.$t("结束")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[5] || (h[5] = (y) => o.value = y),
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
                disabled: !!g.value || !e.unref($)?.salesRows,
                onClick: Q
              }, [
                h[13] || (h[13] = e.createElementVNode(
                  "i",
                  { class: "ri-calculator-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(d.$t("计算")),
                  1
                  /* TEXT */
                )
              ], 8, ho)
            ]),
            s.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", ko, [
                  e.createElementVNode("div", Vo, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(d.$t("净营业额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(l.fmtMoney)(s.value.netRevenue)),
                      1
                      /* TEXT */
                    ),
                    s.value.prev ? (e.openBlock(), e.createElementBlock(
                      "small",
                      go,
                      e.toDisplayString(a(s.value.netRevenue, s.value.prev.revenue)),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode("div", bo, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(d.$t("毛利")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(l.fmtMoney)(s.value.grossProfit)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(d.$t("毛利率 {p0}", { p0: e.unref(l.fmtPct)(s.value.grossMargin, 1) })),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", No, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(d.$t("订单")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(s.value.orders),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Eo, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(d.$t("客单价")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(l.fmtMoney)(s.value.avgOrderValue)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", fo, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(d.$t("连带率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(s.value.unitsPerOrder),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", $o, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(d.$t("费用")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(l.fmtMoney)(s.value.expenses)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(d.$t("费用率 {p0}", { p0: e.unref(l.fmtPct)(s.value.expenseRate, 1) })),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", _o, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(d.$t("净利润")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(e.unref(l.fmtMoney)(s.value.netProfit)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", So, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(d.$t("库存周转天数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(s.value.turnoverDays ?? "—"),
                      1
                      /* TEXT */
                    ),
                    s.value.inventoryValue != null ? (e.openBlock(), e.createElementBlock(
                      "small",
                      Do,
                      e.toDisplayString(d.$t("库存金额约 {p0}", { p0: e.unref(l.fmtMoney)(s.value.inventoryValue) })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ])
                ]),
                s.value.lastDataDay && s.value.lastDataDay < o.value ? (e.openBlock(), e.createElementBlock("p", Bo, [
                  h[14] || (h[14] = e.createElementVNode(
                    "i",
                    { class: "ri-time-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(d.$t("销售数据只到 {p0}，之后的日期还没取到数据", { p0: s.value.lastDataDay })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                s.value.daily.length > 1 ? (e.openBlock(), e.createElementBlock("div", {
                  key: 1,
                  class: "ba-trend",
                  title: d.$t("每日净营业额")
                }, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(s.value.daily, (y) => (e.openBlock(), e.createElementBlock("i", {
                      key: y.day,
                      style: e.normalizeStyle({ height: `${Math.max(2, Math.max(0, y.netRevenue) / B.value * 100)}%` }),
                      title: `${y.day}：${e.unref(l.fmtMoney)(y.netRevenue)}`
                    }, null, 12, Co))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ], 8, wo)) : e.createCommentVNode("v-if", !0),
                s.value.costCoverage < 1 ? (e.openBlock(), e.createElementBlock("p", To, [
                  h[15] || (h[15] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(d.$t("只有 {p0} 的销售带成本，毛利按带成本的部分计算；导入带「成本」列的明细后更准", { p0: e.unref(l.fmtPct)(s.value.costCoverage, 0) })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", Lo, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(O.value, (y) => (e.openBlock(), e.createElementBlock("div", {
                      key: y.title,
                      class: "ba-block"
                    }, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(y.title),
                        1
                        /* TEXT */
                      ),
                      y.rows.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Mo, "—")),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(y.rows, (q) => (e.openBlock(), e.createElementBlock("div", {
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
                              style: e.normalizeStyle({ width: `${Math.max(2, (y.pct ? q.value : q.share ?? 0) * 100)}%` })
                            },
                            null,
                            4
                            /* STYLE */
                          ),
                          e.createElementVNode(
                            "b",
                            null,
                            e.toDisplayString(y.pct ? e.unref(l.fmtPct)(q.value, 0) : e.unref(l.fmtMoney)(q.value)),
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
                e.createElementVNode("div", Ao, [
                  e.createElementVNode(
                    "span",
                    Io,
                    e.toDisplayString(d.$t("款式排行")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "select",
                    {
                      "onUpdate:modelValue": h[6] || (h[6] = (y) => P.value = y),
                      class: "ba-mini"
                    },
                    [
                      e.createElementVNode(
                        "option",
                        Fo,
                        e.toDisplayString(d.$t("按销售额")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        Uo,
                        e.toDisplayString(d.$t("按销量")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        Ro,
                        e.toDisplayString(d.$t("按毛利")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "option",
                        Oo,
                        e.toDisplayString(d.$t("按售罄率")),
                        1
                        /* TEXT */
                      )
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelSelect, P.value]
                  ])
                ]),
                e.createElementVNode("div", Po, [
                  e.createElementVNode("table", zo, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(d.$t("商品")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Ko,
                          e.toDisplayString(d.$t("销量")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          jo,
                          e.toDisplayString(d.$t("销售额")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Wo,
                          e.toDisplayString(d.$t("毛利")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Jo,
                          e.toDisplayString(d.$t("售罄率")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(N.value, (y) => (e.openBlock(), e.createElementBlock("tr", {
                          key: y.key
                        }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(y.label),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            qo,
                            e.toDisplayString(y.qty),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Ho,
                            e.toDisplayString(e.unref(l.fmtMoney)(y.amount)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Go,
                            e.toDisplayString(y.grossProfit == null ? "—" : e.unref(l.fmtMoney)(y.grossProfit)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Yo,
                            e.toDisplayString(y.sellThrough == null ? "—" : e.unref(l.fmtPct)(y.sellThrough, 0)),
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
                s.value.slowMovers.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 3 },
                  [
                    e.createElementVNode(
                      "span",
                      Qo,
                      e.toDisplayString(d.$t("滞销清单（有库存、本期卖出不超过 1 件）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", xo, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(s.value.slowMovers, (y) => (e.openBlock(), e.createElementBlock(
                          "span",
                          {
                            key: y.key,
                            class: "ss-chip warn"
                          },
                          e.toDisplayString(y.label) + " · " + e.toDisplayString(d.$t("库存 {a}，卖出 {b}", { a: y.stock, b: y.qty })),
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
        e.createVNode(K, {
          "step-key": "f-report",
          index: 3,
          title: w[3].title,
          hint: w[3].hint,
          runtime: L.value["f-report"],
          "is-current": M.value === "f-report"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Xo, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(z, (y) => e.createElementVNode("button", {
                  key: y,
                  type: "button",
                  class: e.normalizeClass(["ss-btn sm", { primary: y === "daily" }]),
                  disabled: !!g.value || !e.unref($)?.salesRows,
                  onClick: (q) => G(y)
                }, e.toDisplayString(m(y)), 11, Zo)),
                64
                /* STABLE_FRAGMENT */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                disabled: !!g.value || !e.unref($)?.salesRows || !V.value || !o.value,
                onClick: h[7] || (h[7] = (y) => G("custom"))
              }, e.toDisplayString(d.$t("按上面选的期间")), 9, es)
            ]),
            p.value ? (e.openBlock(), e.createElementBlock("div", ts, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(m(p.value.kind)) + " · " + e.toDisplayString(p.value.metrics.from) + " ~ " + e.toDisplayString(p.value.metrics.to),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  ls,
                  e.toDisplayString(p.value.model ? d.$t("解读由 {p0} 撰写", { p0: e.unref(l.modelLabel)(p.value.model) }) : ""),
                  1
                  /* TEXT */
                )
              ]),
              p.value.staleNote ? (e.openBlock(), e.createElementBlock("p", ns, [
                h[16] || (h[16] = e.createElementVNode(
                  "i",
                  { class: "ri-time-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(p.value.staleNote),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode(
                "pre",
                null,
                e.toDisplayString(p.value.commentary),
                1
                /* TEXT */
              ),
              p.value.unverified.length ? (e.openBlock(), e.createElementBlock("p", os, [
                h[17] || (h[17] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(d.$t("这些数字在数据里找不到来源，请核对后再发：{p0}", { p0: p.value.unverified.join("、") })),
                  1
                  /* TEXT */
                )
              ])) : p.value.model ? (e.openBlock(), e.createElementBlock("p", ss, [
                h[18] || (h[18] = e.createElementVNode(
                  "i",
                  { class: "ri-check-double-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(d.$t("解读里的数字都已回原数据核对")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ])) : e.createCommentVNode("v-if", !0),
            T.value.length > 1 ? (e.openBlock(), e.createElementBlock("div", as, [
              e.createElementVNode(
                "span",
                is,
                e.toDisplayString(d.$t("历史报表")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(T.value.slice(0, 8), (y) => (e.openBlock(), e.createElementBlock("button", {
                  key: y.id,
                  type: "button",
                  class: e.normalizeClass(["ss-chip", { brand: y.id === p.value?.id }]),
                  onClick: (q) => F.value = y.id
                }, e.toDisplayString(m(y.kind)) + " " + e.toDisplayString(y.metrics.from), 11, rs))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(K, {
          "step-key": "f-push",
          index: 4,
          title: w[4].title,
          hint: w[4].hint,
          runtime: L.value["f-push"],
          "is-current": M.value === "f-push"
        }, {
          default: e.withCtx(() => [
            p.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", cs, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!g.value || !e.unref($)?.ready.push,
                    onClick: X
                  }, [
                    h[19] || (h[19] = e.createElementVNode(
                      "i",
                      { class: "ri-send-plane-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("推送")),
                      1
                      /* TEXT */
                    )
                  ], 8, ds),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: !!g.value,
                    onClick: te
                  }, [
                    h[20] || (h[20] = e.createElementVNode(
                      "i",
                      { class: "ri-download-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("导出 Excel")),
                      1
                      /* TEXT */
                    )
                  ], 8, us),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: !!g.value,
                    onClick: u
                  }, [
                    h[21] || (h[21] = e.createElementVNode(
                      "i",
                      { class: "ri-file-pdf-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("导出 PDF")),
                      1
                      /* TEXT */
                    )
                  ], 8, ms),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: le
                  }, [
                    h[22] || (h[22] = e.createElementVNode(
                      "i",
                      { class: "ri-file-copy-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("复制文字版")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    disabled: !!g.value,
                    onClick: _
                  }, [
                    h[23] || (h[23] = e.createElementVNode(
                      "i",
                      { class: "ri-calculator-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("转入财务智能体")),
                      1
                      /* TEXT */
                    )
                  ], 8, ps),
                  p.value.exportPath ? (e.openBlock(), e.createElementBlock(
                    "button",
                    {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: h[8] || (h[8] = (y) => e.unref(l.openPath)(p.value.exportPath, !0))
                    },
                    e.toDisplayString(d.$t("所在文件夹")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.unref($)?.ready.push ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  vs,
                  e.toDisplayString(d.$t("推送渠道在「设置 → 通知与推送」配置（企业微信 / 钉钉机器人、邮箱）")),
                  1
                  /* TEXT */
                )),
                p.value.pushed?.length ? (e.openBlock(), e.createElementBlock("div", ys, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(p.value.pushed, (y) => (e.openBlock(), e.createElementBlock("span", {
                      key: y.channel,
                      class: e.normalizeClass(["ss-chip", y.ok ? "ok" : "bad"]),
                      title: y.error
                    }, e.toDisplayString(y.channel) + " " + e.toDisplayString(y.ok ? "✓" : "✗"), 11, hs))),
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
        e.createVNode(K, {
          "step-key": "f-qa",
          index: 5,
          title: w[5].title,
          hint: w[5].hint,
          runtime: L.value["f-qa"],
          "is-current": M.value === "f-qa"
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
                  "onUpdate:modelValue": h[9] || (h[9] = (y) => b.value = y),
                  type: "text",
                  placeholder: d.$t("例如：上个月连衣裙卖了多少？哪个渠道毛利最高？")
                }, null, 8, ks), [
                  [e.vModelText, b.value]
                ]),
                e.createElementVNode("button", {
                  type: "submit",
                  class: "ss-btn primary",
                  disabled: !!g.value || !b.value.trim() || !e.unref($)?.salesRows
                }, [
                  h[24] || (h[24] = e.createElementVNode(
                    "i",
                    { class: "ri-question-answer-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(d.$t("提问")),
                    1
                    /* TEXT */
                  )
                ], 8, Vs)
              ],
              32
              /* NEED_HYDRATION */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList((e.unref($)?.qa || []).slice(0, 6), (y, q) => (e.openBlock(), e.createElementBlock("div", {
                key: q,
                class: "ba-qa"
              }, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(y.q),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "pre",
                  null,
                  e.toDisplayString(y.a),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  gs,
                  e.toDisplayString(e.unref(l.fmtDateTime)(y.at)) + " · " + e.toDisplayString(e.unref(l.modelLabel)(y.model)),
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
}), Ns = /* @__PURE__ */ x(bs, [["__scopeId", "data-v-b0f97700"]]), Es = { class: "ba-sched" }, fs = { class: "ss-panel" }, $s = { class: "ba-head" }, _s = { class: "ss-muted" }, Ss = { class: "ba-jobs" }, Ds = { class: "ba-job" }, Bs = { class: "ba-check" }, ws = { class: "ba-check" }, Cs = { class: "ss-muted" }, Ts = { class: "ba-job" }, Ls = { class: "ba-check" }, Ms = { class: "ss-muted" }, As = { class: "ba-job" }, Is = { class: "ba-check" }, Fs = ["value"], Us = { class: "ss-muted" }, Rs = { class: "ba-job" }, Os = { class: "ba-check" }, Ps = { class: "ss-muted" }, zs = { class: "ba-job" }, Ks = { class: "ba-check" }, js = { class: "ba-check" }, Ws = { class: "ss-muted" }, Js = { class: "ba-job" }, qs = { class: "ba-check" }, Hs = { class: "ss-muted" }, Gs = { class: "ss-muted" }, Ys = { class: "ba-job ba-job--cal" }, Qs = { class: "ba-check" }, xs = { class: "ss-muted" }, Xs = { class: "ba-cal" }, Zs = ["onUpdate:modelValue"], ea = ["onUpdate:modelValue"], ta = ["onUpdate:modelValue"], la = { value: "holiday" }, na = { value: "store_opening" }, oa = ["onClick"], sa = { class: "ss-actions" }, aa = ["disabled"], ia = ["disabled"], ra = { class: "ss-panel" }, ca = { class: "ba-head" }, da = {
  key: 0,
  class: "ss-empty"
}, ua = { class: "ba-log" }, ma = { class: "ss-chip" }, pa = /* @__PURE__ */ e.defineComponent({
  __name: "ScheduleTab",
  setup(J) {
    const R = Y.useNotificationStore(), A = [n.t("周日"), n.t("周一"), n.t("周二"), n.t("周三"), n.t("周四"), n.t("周五"), n.t("周六")], v = e.reactive({
      dailyReport: { enabled: !1, time: "08:30", push: !0 },
      inventoryPatrol: { enabled: !1, time: "09:00" },
      weeklyVideo: { enabled: !1, weekday: 1, time: "10:00" },
      monthlyReport: { enabled: !1, day: 1, time: "09:30", push: !0 },
      newArrival: { enabled: !1 },
      calendar: { enabled: !1, leadDays: 3, days: [] },
      folderImport: { enabled: !1, time: "08:00" }
    });
    e.watch(() => l.baState.value?.settings.schedule, (V) => {
      V && Object.assign(v, JSON.parse(JSON.stringify(V)));
    }, { immediate: !0 });
    const $ = e.computed(() => JSON.stringify(v) !== JSON.stringify(l.baState.value?.settings.schedule)), z = e.computed(() => l.baState.value?.log || []), D = e.ref(!1);
    async function T() {
      try {
        await l.ba("settings.patch", { patch: { schedule: v } }), await l.refreshState(), R.success(n.t("已保存"));
      } catch (V) {
        R.error(l.errorMessage(V));
      }
    }
    async function F() {
      D.value = !0;
      try {
        $.value && await T(), await l.ba("schedule.runNow"), await l.refreshState();
      } catch (V) {
        R.error(l.errorMessage(V));
      } finally {
        D.value = !1;
      }
    }
    async function p() {
      await l.ba("log.clear").catch(() => {
      }), await l.refreshState();
    }
    return (V, o) => (e.openBlock(), e.createElementBlock("div", Es, [
      e.createElementVNode("section", fs, [
        e.createElementVNode("header", $s, [
          e.createElementVNode("strong", null, [
            o[17] || (o[17] = e.createElementVNode(
              "i",
              { class: "ri-timer-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(V.$t("定时任务与模块联动")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            _s,
            e.toDisplayString(V.$t("应用开着时每分钟检查一次，到点执行；错过的当天补跑一次")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ss, [
          e.createElementVNode("div", Ds, [
            e.createElementVNode("label", Bs, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[0] || (o[0] = (s) => v.dailyReport.enabled = s),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, v.dailyReport.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(V.$t("经营日报")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(V.$t("每天")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[1] || (o[1] = (s) => v.dailyReport.time = s),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, v.dailyReport.time]
              ])
            ]),
            e.createElementVNode("label", ws, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[2] || (o[2] = (s) => v.dailyReport.push = s),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, v.dailyReport.push]
              ]),
              e.createTextVNode(
                e.toDisplayString(V.$t("生成后推送")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "small",
              Cs,
              e.toDisplayString(V.$t("模块 D：取昨天数据 → 指标 → 解读 → 推送店长")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Ts, [
            e.createElementVNode("label", Ls, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[3] || (o[3] = (s) => v.inventoryPatrol.enabled = s),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, v.inventoryPatrol.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(V.$t("库存巡检")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(V.$t("每天")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[4] || (o[4] = (s) => v.inventoryPatrol.time = s),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, v.inventoryPatrol.time]
              ])
            ]),
            e.createElementVNode(
              "small",
              Ms,
              e.toDisplayString(V.$t("模块 C：售罄下架（门店手机端）、断码 / 过季提醒")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", As, [
            e.createElementVNode("label", Is, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[5] || (o[5] = (s) => v.weeklyVideo.enabled = s),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, v.weeklyVideo.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(V.$t("本周主推视频")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": o[6] || (o[6] = (s) => v.weeklyVideo.weekday = s)
                },
                [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(A, (s, k) => e.createElementVNode("option", {
                      key: k,
                      value: k
                    }, e.toDisplayString(s), 9, Fs)),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelSelect,
                  v.weeklyVideo.weekday,
                  void 0,
                  { number: !0 }
                ]
              ]),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[7] || (o[7] = (s) => v.weeklyVideo.time = s),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, v.weeklyVideo.time]
              ])
            ]),
            e.createElementVNode(
              "small",
              Us,
              e.toDisplayString(V.$t("模块 A：按上周销量前 3 款写好脚本，等你审核后成片发布（不会自动发出去）")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Rs, [
            e.createElementVNode("label", Os, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[8] || (o[8] = (s) => v.folderImport.enabled = s),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, v.folderImport.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(V.$t("共享文件夹取数")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(V.$t("每天")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[9] || (o[9] = (s) => v.folderImport.time = s),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, v.folderImport.time]
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
              Ps,
              e.toDisplayString(V.$t("模块 D：从「设置」里配置的文件夹取最新的销售 / 费用 / 库存表，排在日报之前；失败会提醒")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", zs, [
            e.createElementVNode("label", Ks, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[10] || (o[10] = (s) => v.monthlyReport.enabled = s),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, v.monthlyReport.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(V.$t("经营月报")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(V.$t("每月 {n} 日", { n: v.monthlyReport.day })) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[11] || (o[11] = (s) => v.monthlyReport.time = s),
                  type: "time"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, v.monthlyReport.time]
              ])
            ]),
            e.createElementVNode("label", js, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[12] || (o[12] = (s) => v.monthlyReport.push = s),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, v.monthlyReport.push]
              ]),
              e.createTextVNode(
                e.toDisplayString(V.$t("生成后推送")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "small",
              Ws,
              e.toDisplayString(V.$t("模块 D：上月月报推送老板")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Js, [
            e.createElementVNode("label", qs, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[13] || (o[13] = (s) => v.newArrival.enabled = s),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, v.newArrival.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(V.$t("新品入库联动")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "span",
              Hs,
              e.toDisplayString(V.$t("随时")),
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
              Gs,
              e.toDisplayString(V.$t("新款导入商品库后：模块 C 生成上架草稿、模块 A 写新品上新视频脚本，都等你审核")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Ys, [
            e.createElementVNode("label", Qs, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[14] || (o[14] = (s) => v.calendar.enabled = s),
                  type: "checkbox"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelCheckbox, v.calendar.enabled]
              ]),
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(V.$t("节日 / 周年数字人")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("span", null, [
              e.createTextVNode(
                e.toDisplayString(V.$t("提前")) + " ",
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": o[15] || (o[15] = (s) => v.calendar.leadDays = s),
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
                  v.calendar.leadDays,
                  void 0,
                  { number: !0 }
                ]
              ]),
              e.createTextVNode(
                " " + e.toDisplayString(V.$t("天")),
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
              xs,
              e.toDisplayString(V.$t("模块 B：到日子前生成数字人祝福讲稿草稿，等你审核后成片发布")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Xs, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(v.calendar.days, (s, k) => (e.openBlock(), e.createElementBlock("span", {
                  key: k,
                  class: "ba-cal__day"
                }, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (b) => s.date = b,
                    type: "text",
                    placeholder: "MM-DD",
                    class: "ba-num"
                  }, null, 8, Zs), [
                    [e.vModelText, s.date]
                  ]),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (b) => s.name = b,
                    type: "text"
                  }, null, 8, ea), [
                    [e.vModelText, s.name]
                  ]),
                  e.withDirectives(e.createElementVNode("select", {
                    "onUpdate:modelValue": (b) => s.topic = b
                  }, [
                    e.createElementVNode(
                      "option",
                      la,
                      e.toDisplayString(V.$t("节日")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      na,
                      e.toDisplayString(V.$t("开业周年")),
                      1
                      /* TEXT */
                    )
                  ], 8, ta), [
                    [e.vModelSelect, s.topic]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (b) => v.calendar.days.splice(k, 1)
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
                onClick: o[16] || (o[16] = (s) => v.calendar.days.push({ date: "", name: "", topic: "holiday" }))
              }, [
                o[21] || (o[21] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(V.$t("加一天（农历节日每年日期不同，请按当年日期填）")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])
        ]),
        e.createElementVNode("div", sa, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: !$.value,
            onClick: T
          }, [
            o[23] || (o[23] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(V.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, aa),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            disabled: D.value,
            onClick: F
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(D.value ? "ri-loader-4-line spin" : "ri-play-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(V.$t("立即执行一次已开启的任务")),
              1
              /* TEXT */
            )
          ], 8, ia)
        ])
      ]),
      e.createElementVNode("section", ra, [
        e.createElementVNode("header", ca, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(V.$t("执行记录")),
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
              onClick: p
            },
            e.toDisplayString(V.$t("清空")),
            1
            /* TEXT */
          )
        ]),
        z.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "p",
          da,
          e.toDisplayString(V.$t("暂无")),
          1
          /* TEXT */
        )),
        e.createElementVNode("ul", ua, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(z.value, (s, k) => (e.openBlock(), e.createElementBlock(
              "li",
              {
                key: k,
                class: e.normalizeClass({ bad: !s.ok })
              },
              [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(e.unref(l.fmtDateTime)(s.at)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  ma,
                  e.toDisplayString(s.module === "schedule" ? V.$t("定时") : e.unref(l.moduleTitle)(s.module)),
                  1
                  /* TEXT */
                ),
                e.createTextVNode(
                  e.toDisplayString(s.text),
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
}), va = /* @__PURE__ */ x(pa, [["__scopeId", "data-v-17cc3a77"]]), ya = {
  key: 0,
  class: "ba-set"
}, ha = { class: "ss-panel" }, ka = { class: "ba-head" }, Va = { class: "ss-grid" }, ga = { class: "ss-field" }, ba = { class: "ss-field" }, Na = { class: "ss-field" }, Ea = { class: "ss-muted" }, fa = { class: "ss-panel" }, $a = { class: "ba-head" }, _a = { class: "ss-muted" }, Sa = ["onClick"], Da = ["onClick"], Ba = { class: "ss-panel" }, wa = { class: "ba-head" }, Ca = { class: "ss-table-wrap" }, Ta = { class: "ss-table" }, La = ["title"], Ma = ["onUpdate:modelValue"], Aa = ["onUpdate:modelValue"], Ia = ["onUpdate:modelValue"], Fa = ["onUpdate:modelValue"], Ua = ["onUpdate:modelValue"], Ra = ["checked", "onChange"], Oa = { class: "ss-panel" }, Pa = { class: "ba-head" }, za = { class: "ba-check" }, Ka = { class: "ss-field" }, ja = { class: "ba-seasons" }, Wa = { class: "ss-subhead" }, Ja = ["value", "placeholder", "onChange"], qa = { class: "ss-panel" }, Ha = { class: "ba-head" }, Ga = { class: "ba-ready" }, Ya = { class: "ss-actions" }, Qa = ["disabled"], xa = {
  key: 0,
  class: "ss-muted"
}, Xa = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(J) {
    const R = Y.useNotificationStore(), A = e.computed(() => l.baState.value), v = e.reactive({}), $ = e.ref("");
    e.watch(() => A.value?.settings, (s) => {
      s && (Object.assign(v, JSON.parse(JSON.stringify(s))), $.value = s.coreSizes.join(","));
    }, { immediate: !0 });
    const z = e.computed(() => !!A.value && JSON.stringify({ ...v, coreSizes: V($.value) }) !== JSON.stringify(A.value.settings)), D = [
      { key: "sales", label: n.t("销售明细") },
      { key: "expense", label: n.t("费用") },
      { key: "inventory", label: n.t("库存快照") }
    ];
    async function T(s) {
      const k = await l.ba("dirs.pick").catch(() => "");
      k && (v.dataFolders = { ...v.dataFolders, [s]: k });
    }
    function F(s, k) {
      if (k.checked && !window.confirm(n.t("打开「{p0}」全自动提交？数字员工填完后会直接提交上架 / 下架，不再等你确认。建议稳定运行两周后再打开。", { p0: s.name }))) {
        k.checked = !1;
        return;
      }
      s.autoSubmit = k.checked;
    }
    function p(s) {
      return [...new Set(s.split(/[,，\s]+/).map(Number).filter((k) => Number.isInteger(k) && k >= 1 && k <= 12))];
    }
    function V(s) {
      return s.split(/[,，\s]+/).map((k) => k.trim().toUpperCase()).filter(Boolean);
    }
    async function o() {
      try {
        await l.ba("settings.patch", { patch: { brandName: v.brandName, storeAddress: v.storeAddress, openingHours: v.openingHours, dataFolders: v.dataFolders, channels: v.channels, seasonMonths: v.seasonMonths, coreSizes: V($.value), autoDelistLocal: v.autoDelistLocal } }), await l.refreshState(), R.success(n.t("已保存"));
      } catch (s) {
        R.error(l.errorMessage(s));
      }
    }
    return (s, k) => A.value ? (e.openBlock(), e.createElementBlock("div", ya, [
      e.createElementVNode("section", ha, [
        e.createElementVNode("header", ka, [
          e.createElementVNode("strong", null, [
            k[5] || (k[5] = e.createElementVNode(
              "i",
              { class: "ri-store-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(s.$t("品牌与输出")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Va, [
          e.createElementVNode("label", ga, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(s.$t("品牌 / 门店名（视频顶部标题、报表抬头）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": k[0] || (k[0] = (b) => v.brandName = b),
                type: "text",
                maxlength: "30"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                v.brandName,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", ba, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(s.$t("门店地址（数字人片尾）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": k[1] || (k[1] = (b) => v.storeAddress = b),
                type: "text",
                maxlength: "80"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                v.storeAddress,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Na, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(s.$t("营业时间（数字人片尾）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": k[2] || (k[2] = (b) => v.openingHours = b),
                type: "text",
                maxlength: "40"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                v.openingHours,
                void 0,
                { trim: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode(
          "p",
          Ea,
          e.toDisplayString(s.$t("输出目录：{p0}", { p0: A.value.outputDir })),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("section", fa, [
        e.createElementVNode("header", $a, [
          e.createElementVNode("strong", null, [
            k[6] || (k[6] = e.createElementVNode(
              "i",
              { class: "ri-folder-received-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(s.$t("共享文件夹取数")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode(
          "p",
          _a,
          e.toDisplayString(s.$t("收银 / 进销存系统每天把报表导出到这些文件夹（或数字员工登录后台导出到这里），定时任务取最新一份；只读，不改原文件。")),
          1
          /* TEXT */
        ),
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(D, (b) => e.createElementVNode("div", {
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
              e.toDisplayString(v.dataFolders?.[b.key] || s.$t("未设置")),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm",
              onClick: (g) => T(b.key)
            }, [
              k[7] || (k[7] = e.createElementVNode(
                "i",
                { class: "ri-folder-open-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(s.$t("选择文件夹")),
                1
                /* TEXT */
              )
            ], 8, Sa),
            v.dataFolders?.[b.key] ? (e.openBlock(), e.createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ss-link",
              onClick: (g) => v.dataFolders[b.key] = ""
            }, e.toDisplayString(s.$t("清除")), 9, Da)) : e.createCommentVNode("v-if", !0)
          ])),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      e.createElementVNode("section", Ba, [
        e.createElementVNode("header", wa, [
          e.createElementVNode("strong", null, [
            k[8] || (k[8] = e.createElementVNode(
              "i",
              { class: "ri-store-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(s.$t("上架渠道")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Ca, [
          e.createElementVNode("table", Ta, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("启用")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("渠道")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("商家后台地址")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("主图比例")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("标题字数上限")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("th", {
                  title: s.$t("打开后数字员工填完直接提交，不再停在提交前；每次执行记为「自动执行」")
                }, e.toDisplayString(s.$t("全自动提交")), 9, La)
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(v.channels, (b) => (e.openBlock(), e.createElementBlock("tr", {
                  key: b.id
                }, [
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (g) => b.enabled = g,
                      type: "checkbox"
                    }, null, 8, Ma), [
                      [e.vModelCheckbox, b.enabled]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (g) => b.name = g,
                      type: "text"
                    }, null, 8, Aa), [
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
                      "onUpdate:modelValue": (g) => b.url = g,
                      type: "text",
                      class: "ba-url"
                    }, null, 8, Ia), [
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
                      "onUpdate:modelValue": (g) => b.aspect = g
                    }, [...k[9] || (k[9] = [
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
                    ])], 8, Fa), [
                      [e.vModelSelect, b.aspect]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (g) => b.titleMax = g,
                      type: "number",
                      min: "10",
                      max: "60"
                    }, null, 8, Ua), [
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
                      onChange: (g) => F(b, g.target)
                    }, null, 40, Ra)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", Oa, [
        e.createElementVNode("header", Pa, [
          e.createElementVNode("strong", null, [
            k[10] || (k[10] = e.createElementVNode(
              "i",
              { class: "ri-scales-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(s.$t("上下架规则")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("label", za, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": k[3] || (k[3] = (b) => v.autoDelistLocal = b),
              type: "checkbox"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelCheckbox, v.autoDelistLocal]
          ]),
          e.createTextVNode(
            e.toDisplayString(s.$t("售罄时自动把门店试穿手机端下架（只动本机，网店下架要人确认）")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", Ka, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(s.$t("主力尺码（这些尺码缺货算断码，逗号分隔）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": k[4] || (k[4] = (b) => $.value = b),
              type: "text"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, $.value]
          ])
        ]),
        e.createElementVNode("div", ja, [
          e.createElementVNode(
            "span",
            Wa,
            e.toDisplayString(s.$t("季节在售月份（不在这些月份的款提醒过季）")),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(v.seasonMonths, (b, g) => (e.openBlock(), e.createElementBlock("label", {
              key: g,
              class: "ba-season"
            }, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(g),
                1
                /* TEXT */
              ),
              e.createElementVNode("input", {
                value: b.join(","),
                type: "text",
                placeholder: s.$t("如 5,6,7,8；留空表示四季都卖"),
                onChange: (I) => v.seasonMonths[g] = p(I.target.value)
              }, null, 40, Ja)
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      e.createElementVNode("section", qa, [
        e.createElementVNode("header", Ha, [
          e.createElementVNode("strong", null, [
            k[11] || (k[11] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(s.$t("能力就绪")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("ul", Ga, [
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", A.value.ready.ffmpeg ? "ok" : "bad"])
              },
              "ffmpeg",
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(s.$t("短视频成片")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", A.value.ready.image ? "ok" : "warn"])
              },
              e.toDisplayString(s.$t("图像 / 语音服务")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(s.$t("高保真配音；没有时用标准音色")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", A.value.ready.digitalHuman ? "ok" : "warn"])
              },
              e.toDisplayString(s.$t("数字人服务")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(s.$t("在「数字人工作台 → 配置」设置")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", A.value.ready.knowledge ? "ok" : "warn"])
              },
              e.toDisplayString(s.$t("知识库")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(s.$t("数字人讲稿的公司资料来源")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("li", null, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", A.value.ready.push ? "ok" : "warn"])
              },
              e.toDisplayString(s.$t("推送渠道")),
              3
              /* TEXT, CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(s.$t("在「设置 → 通知与推送」配置")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createElementVNode("div", Ya, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: !z.value,
          onClick: o
        }, [
          k[12] || (k[12] = e.createElementVNode(
            "i",
            { class: "ri-save-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(s.$t("保存设置")),
            1
            /* TEXT */
          )
        ], 8, Qa),
        z.value ? (e.openBlock(), e.createElementBlock(
          "span",
          xa,
          e.toDisplayString(s.$t("有未保存的修改")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Za = /* @__PURE__ */ x(Xa, [["__scopeId", "data-v-1a3ea6a3"]]), ei = { class: "ba-hist" }, ti = { class: "ss-kpis" }, li = { class: "ss-kpi" }, ni = { class: "ss-kpi accent" }, oi = { class: "ss-kpi" }, si = { class: "ss-kpi" }, ai = { class: "ss-panel" }, ii = { class: "ba-hist__bar" }, ri = {
  class: "ba-hist__filters",
  role: "tablist"
}, ci = ["aria-selected", "onClick"], di = ["placeholder"], ui = {
  key: 0,
  class: "ss-empty"
}, mi = ["onClick", "onKeydown"], pi = { class: "ba-hist__thumb" }, vi = ["src"], yi = {
  key: 1,
  class: "ri-film-line"
}, hi = {
  key: 2,
  class: "ba-hist__dur"
}, ki = { class: "ba-hist__main" }, Vi = { class: "ba-hist__title" }, gi = { class: "ss-chip" }, bi = { class: "ba-hist__meta" }, Ni = { key: 0 }, Ei = { key: 1 }, fi = {
  key: 0,
  class: "ba-hist__plats"
}, $i = {
  key: 1,
  class: "ss-muted ba-hist__note"
}, _i = ["onClick"], Si = ["onClick"], Di = {
  key: 0,
  class: "ba-hist__detail"
}, Bi = { class: "ba-hist__cols" }, wi = { class: "ba-hist__col" }, Ci = { class: "ss-subhead" }, Ti = { class: "ba-hist__tl" }, Li = {
  key: 0,
  class: "ss-muted"
}, Mi = { class: "ba-hist__col" }, Ai = { class: "ss-subhead" }, Ii = ["src"], Fi = { class: "ss-subhead" }, Ui = {
  key: 1,
  class: "ss-muted"
}, Ri = { class: "ba-hist__runhead" }, Oi = { class: "ss-muted" }, Pi = { class: "ba-hist__receipts" }, zi = ["onClick"], Ki = {
  key: 1,
  class: "ss-muted"
}, ji = {
  key: 0,
  class: "ss-muted"
}, Wi = { class: "ss-subhead" }, Ji = { class: "ss-table-wrap" }, qi = { class: "ss-table" }, Hi = { class: "num" }, Gi = { class: "num" }, Yi = { class: "num" }, Qi = { class: "num" }, xi = { class: "num" }, Xi = { class: "num" }, Zi = { class: "num" }, er = { class: "num" }, tr = { class: "ss-subhead" }, lr = {
  key: 0,
  class: "ss-muted"
}, nr = /* @__PURE__ */ e.defineComponent({
  __name: "HistoryTab",
  emits: ["goto"],
  setup(J) {
    const R = [
      { key: "all", label: n.t("全部") },
      { key: "published", label: n.t("已发布") },
      { key: "active", label: n.t("进行中") },
      { key: "failed", label: n.t("失败 / 未发成") }
    ], A = e.ref("all"), v = e.ref(""), $ = e.ref(""), z = e.computed(() => l.baState.value?.videos || []);
    function D(u) {
      const _ = [u.createdAt, u.updatedAt, u.publishedAt, u.history?.[u.history.length - 1]?.at].map((m) => Date.parse(m || "")).filter(Number.isFinite);
      return _.length ? Math.max(..._) : 0;
    }
    function T(u) {
      const _ = b(u);
      return u.status === "failed" || u.status !== "published" && !!_ && !_.published.length;
    }
    function F(u, _) {
      return _ === "published" ? u.status === "published" : _ === "failed" ? T(u) : _ === "active" ? u.status !== "published" && !T(u) : !0;
    }
    function p(u) {
      return z.value.filter((_) => F(_, u)).length;
    }
    const V = e.computed(() => {
      const u = v.value.trim().toLowerCase();
      return z.value.filter((_) => F(_, A.value)).filter((_) => !u || [_.name, _.brief, ...Object.values(_.copies).flatMap((m) => [m?.title, m?.caption])].join(`
`).toLowerCase().includes(u)).sort((_, m) => D(m) - D(_));
    }), o = e.computed(() => {
      let u = 0, _ = 0, m = 0;
      for (const a of z.value)
        a.status === "published" && u++, _ += (a.publishRuns || []).reduce((f, E) => f + E.published.length, 0), m += Object.values(a.stats || {}).reduce((f, E) => f + (E?.plays || 0), 0);
      return { published: u, platformPosts: _, plays: m };
    });
    function s(u) {
      $.value = $.value === u ? "" : u;
    }
    function k(u) {
      return u.scenes[0]?.image || u.materials[0];
    }
    function b(u) {
      return u.publishRuns?.[u.publishRuns.length - 1];
    }
    function g(u) {
      return u.split(/[\\/]/).pop() || u;
    }
    function I(u) {
      window.electronAPI?.openExternal?.(u) ?? window.open(u, "_blank");
    }
    function w(u) {
      return { draft: n.t("草稿"), scripted: n.t("已写脚本"), rendering: n.t("成片中"), rendered: n.t("已成片"), approved: n.t("已审核"), publishing: n.t("发布中"), published: n.t("已发布"), failed: n.t("失败") }[u] || u;
    }
    function S(u) {
      return u === "published" ? "ok" : u === "failed" ? "bad" : u === "publishing" || u === "rendering" ? "warn" : "brand";
    }
    function L(u) {
      return u.outcome === "cancelled" ? n.t("发布已取消") : u.published.length ? n.t("发布成功 {n} 个平台", { n: u.published.length }) : u.outcome === "failed" ? n.t("发布工作流失败") : n.t("没有平台发成功");
    }
    const M = { douyin: n.t("抖音"), kuaishou: n.t("快手"), xiaohongshu: n.t("小红书"), wxchannels: n.t("视频号") };
    function O(u) {
      const _ = new Map(u.receipts.map((a) => [a.platform, a])), m = (a) => M[a] || a;
      return [
        ...u.published.map((a) => ({ platform: a, label: n.t("{p0} 已发布", { p0: m(a) }), tone: "ok", url: _.get(a)?.url })),
        ...u.unconfirmed.map((a) => ({ platform: a, label: n.t("{p0} 待核对", { p0: m(a) }), tone: "warn", url: _.get(a)?.url, error: _.get(a)?.error })),
        ...u.failed.map((a) => ({ platform: a, label: n.t("{p0} 未发成", { p0: m(a) }), tone: "bad", error: _.get(a)?.error }))
      ];
    }
    const P = {
      create: n.t("创建"),
      material: n.t("素材"),
      script: n.t("脚本与文案"),
      edit: n.t("修改"),
      render: n.t("成片"),
      approve: n.t("审核"),
      schedule: n.t("定时"),
      publish: n.t("发布"),
      stats: n.t("数据回收")
    }, N = {
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
    function B(u) {
      return P[u] || u;
    }
    function C(u) {
      return N[u] || "ri-checkbox-blank-circle-line";
    }
    function j(u) {
      if (u.history?.length) return [...u.history].reverse();
      const _ = [{ at: u.createdAt, step: "create", text: n.t("创建项目：{p0}", { p0: l.videoTypeLabel(u.type) }), ok: !0 }];
      u.scenes.length && _.push({ at: u.createdAt, step: "script", text: n.t("写好分镜脚本 {n} 个镜头", { n: u.scenes.length }), ok: !0 }), u.video && _.push({ at: u.approvedAt || u.updatedAt || u.createdAt, step: "render", text: n.t("成片：{f}", { f: g(u.video) }), ok: !0 }), u.approvedAt && _.push({ at: u.approvedAt, step: "approve", text: n.t("审核通过"), ok: !0 }), u.publishedAt && _.push({ at: u.publishedAt, step: "publish", text: u.publishRunNote || n.t("已发布"), ok: !0 });
      for (const m of u.platforms) {
        const a = u.stats?.[m];
        a && _.push({ at: a.at, step: "stats", text: n.t("{p0} 数据：播放 {a} · 点赞 {b}", { p0: l.platformLabel(m), a: a.plays, b: a.likes }), ok: !0 });
      }
      return _.sort((m, a) => Date.parse(a.at) - Date.parse(m.at));
    }
    return (u, _) => (e.openBlock(), e.createElementBlock("div", ei, [
      e.createElementVNode("div", ti, [
        e.createElementVNode("div", li, [
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
            e.toDisplayString(z.value.length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ni, [
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
        e.createElementVNode("div", si, [
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
      e.createElementVNode("section", ai, [
        e.createElementVNode("header", ii, [
          e.createElementVNode("div", ri, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(R, (m) => e.createElementVNode("button", {
                key: m.key,
                type: "button",
                role: "tab",
                class: e.normalizeClass(["ba-hist__f", { on: A.value === m.key }]),
                "aria-selected": A.value === m.key,
                onClick: (a) => A.value = m.key
              }, [
                e.createTextVNode(
                  e.toDisplayString(m.label),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(p(m.key)),
                  1
                  /* TEXT */
                )
              ], 10, ci)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": _[0] || (_[0] = (m) => v.value = m),
            type: "search",
            class: "ba-hist__q",
            placeholder: u.$t("按名称 / 商品 / 文案搜索")
          }, null, 8, di), [
            [e.vModelText, v.value]
          ])
        ]),
        V.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "p",
          ui,
          e.toDisplayString(z.value.length ? u.$t("没有符合条件的记录") : u.$t("还没有视频项目。在「短视频发布」或「数字人介绍」里做完的视频，每一步都会记在这里。")),
          1
          /* TEXT */
        )),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(V.value, (m) => (e.openBlock(), e.createElementBlock(
            "article",
            {
              key: m.id,
              class: e.normalizeClass(["ba-hist__item", { open: $.value === m.id }])
            },
            [
              e.createElementVNode("div", {
                class: "ba-hist__row",
                role: "button",
                tabindex: "0",
                onClick: (a) => s(m.id),
                onKeydown: e.withKeys((a) => s(m.id), ["enter"])
              }, [
                e.createElementVNode("div", pi, [
                  k(m) ? (e.openBlock(), e.createElementBlock("img", {
                    key: 0,
                    src: e.unref(l.fileUrl)(k(m)),
                    alt: "",
                    loading: "lazy"
                  }, null, 8, vi)) : (e.openBlock(), e.createElementBlock("i", yi)),
                  m.durationSec ? (e.openBlock(), e.createElementBlock(
                    "span",
                    hi,
                    e.toDisplayString(u.$t("{s} 秒", { s: m.durationSec })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", ki, [
                  e.createElementVNode("div", Vi, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(m.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", S(m.status)])
                      },
                      e.toDisplayString(w(m.status)),
                      3
                      /* TEXT, CLASS */
                    ),
                    e.createElementVNode(
                      "span",
                      gi,
                      e.toDisplayString(e.unref(l.videoTypeLabel)(m.type)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", bi, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(u.$t("创建 {p0}", { p0: e.unref(l.fmtDateTime)(m.createdAt) })),
                      1
                      /* TEXT */
                    ),
                    m.publishedAt ? (e.openBlock(), e.createElementBlock(
                      "span",
                      Ni,
                      e.toDisplayString(u.$t("发布 {p0}", { p0: e.unref(l.fmtDateTime)(m.publishedAt) })),
                      1
                      /* TEXT */
                    )) : m.updatedAt ? (e.openBlock(), e.createElementBlock(
                      "span",
                      Ei,
                      e.toDisplayString(u.$t("最近更新 {p0}", { p0: e.unref(l.fmtDateTime)(m.updatedAt) })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(m.platforms.map(e.unref(l.platformLabel)).join(" / ")),
                      1
                      /* TEXT */
                    )
                  ]),
                  b(m) ? (e.openBlock(), e.createElementBlock("div", fi, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(O(b(m)), (a) => (e.openBlock(), e.createElementBlock(
                        "span",
                        {
                          key: a.platform,
                          class: e.normalizeClass(["ss-chip", a.tone])
                        },
                        e.toDisplayString(a.label),
                        3
                        /* TEXT, CLASS */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : m.publishRunNote ? (e.openBlock(), e.createElementBlock(
                    "p",
                    $i,
                    e.toDisplayString(m.publishRunNote),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("div", {
                  class: "ba-hist__ops",
                  onClick: _[1] || (_[1] = e.withModifiers(() => {
                  }, ["stop"]))
                }, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    onClick: (a) => u.$emit("goto", "video", { id: m.id })
                  }, [
                    _[2] || (_[2] = e.createElementVNode(
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
                  ], 8, _i),
                  m.video ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: (a) => e.unref(l.openPath)(m.video, !0)
                  }, [
                    _[3] || (_[3] = e.createElementVNode(
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
                  ], 8, Si)) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(["ba-hist__chev", $.value === m.id ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"])
                    },
                    null,
                    2
                    /* CLASS */
                  )
                ])
              ], 40, mi),
              $.value === m.id ? (e.openBlock(), e.createElementBlock("div", Di, [
                e.createElementVNode("div", Bi, [
                  e.createElementVNode("div", wi, [
                    e.createElementVNode(
                      "span",
                      Ci,
                      e.toDisplayString(u.$t("节点记录")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("ol", Ti, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(j(m), (a, f) => (e.openBlock(), e.createElementBlock(
                          "li",
                          {
                            key: f,
                            class: e.normalizeClass({ bad: !a.ok })
                          },
                          [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(C(a.step))
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createElementVNode("div", null, [
                              e.createElementVNode(
                                "b",
                                null,
                                e.toDisplayString(B(a.step)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "small",
                                null,
                                e.toDisplayString(e.unref(l.fmtDateTime)(a.at)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "p",
                                null,
                                e.toDisplayString(a.text),
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
                    m.history?.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                      "p",
                      Li,
                      e.toDisplayString(u.$t("这条视频做于留痕功能上线前，节点记录按已有时间还原，不含失败记录。")),
                      1
                      /* TEXT */
                    ))
                  ]),
                  e.createElementVNode("div", Mi, [
                    m.video ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 0 },
                      [
                        e.createElementVNode(
                          "span",
                          Ai,
                          e.toDisplayString(u.$t("成片")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("video", {
                          src: e.unref(l.fileUrl)(m.video),
                          controls: "",
                          playsinline: "",
                          preload: "metadata",
                          class: "ba-hist__video"
                        }, null, 8, Ii)
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "span",
                      Fi,
                      e.toDisplayString(u.$t("发布记录")),
                      1
                      /* TEXT */
                    ),
                    m.publishRuns?.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                      "p",
                      Ui,
                      e.toDisplayString(m.status === "published" ? u.$t("已人工确认发布（没有平台回执）") : u.$t("还没有发布记录")),
                      1
                      /* TEXT */
                    )),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList([...m.publishRuns || []].reverse(), (a, f) => (e.openBlock(), e.createElementBlock("div", {
                        key: a.runId || f,
                        class: "ba-hist__run"
                      }, [
                        e.createElementVNode("div", Ri, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", a.published.length ? "ok" : a.outcome === "cancelled" ? "" : "bad"])
                            },
                            e.toDisplayString(L(a)),
                            3
                            /* TEXT, CLASS */
                          ),
                          e.createElementVNode(
                            "small",
                            Oi,
                            e.toDisplayString(e.unref(l.fmtDateTime)(a.at)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("ul", Pi, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(O(a), (E) => (e.openBlock(), e.createElementBlock("li", {
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
                                onClick: e.withModifiers((W) => I(E.url), ["prevent"])
                              }, e.toDisplayString(u.$t("查看作品")), 9, zi)) : e.createCommentVNode("v-if", !0),
                              E.error ? (e.openBlock(), e.createElementBlock(
                                "small",
                                Ki,
                                e.toDisplayString(E.error),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ]),
                        a.videoFile && a.videoFile !== m.video ? (e.openBlock(), e.createElementBlock(
                          "small",
                          ji,
                          e.toDisplayString(u.$t("当时发布的成片：{p0}", { p0: g(a.videoFile) })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    m.stats && Object.keys(m.stats).length ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 2 },
                      [
                        e.createElementVNode(
                          "span",
                          Wi,
                          e.toDisplayString(u.$t("平台数据")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", Ji, [
                          e.createElementVNode("table", qi, [
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
                                  Hi,
                                  e.toDisplayString(u.$t("播放")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Gi,
                                  e.toDisplayString(u.$t("点赞")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  Yi,
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
                                e.renderList(m.platforms.filter((a) => m.stats?.[a]), (a) => (e.openBlock(), e.createElementBlock("tr", { key: a }, [
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(e.unref(l.platformLabel)(a)),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    xi,
                                    e.toDisplayString(m.stats[a].plays),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    Xi,
                                    e.toDisplayString(m.stats[a].likes),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    Zi,
                                    e.toDisplayString(m.stats[a].comments),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    er,
                                    e.toDisplayString(m.stats[a].shares),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(e.unref(l.fmtDateTime)(m.stats[a].at)),
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
                    Object.keys(m.copies).length ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 3 },
                      [
                        e.createElementVNode(
                          "span",
                          tr,
                          e.toDisplayString(u.$t("发布文案")),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(m.platforms.filter((a) => m.copies[a]), (a) => (e.openBlock(), e.createElementBlock("div", {
                            key: a,
                            class: "ba-hist__copy"
                          }, [
                            e.createElementVNode(
                              "b",
                              null,
                              e.toDisplayString(e.unref(l.platformLabel)(a)) + " · " + e.toDisplayString(m.copies[a].title),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "p",
                              null,
                              e.toDisplayString(m.copies[a].caption),
                              1
                              /* TEXT */
                            ),
                            m.copies[a].topics.length ? (e.openBlock(), e.createElementBlock(
                              "small",
                              lr,
                              e.toDisplayString(m.copies[a].topics.map((f) => "#" + f).join(" ")),
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
}), or = /* @__PURE__ */ x(nr, [["__scopeId", "data-v-98085cb3"]]), sr = { class: "ba-workbench" }, ar = { class: "workbench-header" }, ir = { class: "heading" }, rr = { class: "eyebrow" }, cr = { class: "subtitle" }, dr = { class: "header-actions" }, ur = ["disabled"], mr = {
  key: 0,
  class: "ba-bar"
}, pr = { class: "ss-muted" }, vr = { class: "ba-bar__rule" }, yr = { class: "no" }, hr = { class: "yes" }, kr = {
  class: "ba-tabs",
  role: "tablist"
}, Vr = ["aria-selected", "onClick"], gr = {
  key: 0,
  class: "ba-badge"
}, br = ["onClick"], Nr = {
  key: 1,
  class: "ss-note info ba-progress"
}, Er = {
  key: 2,
  class: "ba-body"
}, fr = {
  key: 7,
  class: "ba-ov"
}, $r = { class: "ss-panel" }, _r = { class: "ba-ov__cards" }, Sr = ["onClick"], Dr = { class: "ss-muted" }, Br = { class: "ss-panel" }, wr = { class: "ba-list" }, Cr = { class: "ss-panel" }, Tr = { class: "ba-list" }, Lr = {
  key: 3,
  class: "ss-note danger"
}, Mr = {
  key: 4,
  class: "ss-note"
}, ie = "totalclaw:biz-automation-tab:v1", Ar = /* @__PURE__ */ e.defineComponent({
  __name: "BizAutomationWorkbenchView",
  setup(J) {
    const R = [
      { key: "video", icon: "ri-movie-2-line", title: n.t("短视频发布") },
      { key: "avatar", icon: "ri-user-voice-line", title: n.t("数字人介绍") },
      { key: "listing", icon: "ri-store-3-line", title: n.t("商品上下架") },
      { key: "finance", icon: "ri-line-chart-line", title: n.t("经营数据") },
      { key: "schedule", icon: "ri-timer-line", title: n.t("定时与联动") },
      { key: "history", icon: "ri-history-line", title: n.t("历史记录") },
      { key: "overview", icon: "ri-book-open-line", title: n.t("方案说明") },
      { key: "settings", icon: "ri-settings-3-line", title: n.t("设置") }
    ], A = [
      { key: "video", icon: "ri-movie-2-line", title: n.t("短视频发布"), text: n.t("商品图、试穿图 → 脚本与各平台文案 → 配音字幕成片 → 审核 → 抖音 / 快手 / 小红书 / 视频号") },
      { key: "avatar", icon: "ri-user-voice-line", title: n.t("数字人介绍"), text: n.t("知识库资料写讲稿，数字人口播成片，进入发布") },
      { key: "listing", icon: "ri-store-3-line", title: n.t("商品上下架"), text: n.t("按渠道生成图文，数字员工在网店后台上架；售罄、断码、过季按规则处理") },
      { key: "finance", icon: "ri-line-chart-line", title: n.t("经营数据"), text: n.t("导入收银 / 费用数据，规则算指标，模型写解读并回核，日报定时推送") }
    ];
    function v() {
      try {
        const N = localStorage.getItem(ie);
        return R.some((B) => B.key === N) ? N : "overview";
      } catch {
        return "overview";
      }
    }
    const $ = l.baState, z = e.computed(() => l.baGarments.value), D = e.ref(v()), T = e.reactive({}), F = e.ref(!1), p = e.ref(!1), V = e.ref(""), o = e.computed(() => l.baProgress[D.value] || ""), s = e.computed(() => ($.value?.videos || []).filter((N) => N.publishDue && N.status === "approved")), k = ee.useRouter(), b = Y.useNotificationStore();
    async function g(N) {
      try {
        const B = await l.ba("video.publishInput", { id: N });
        await l.startPublishWorkflow(B, N), await k.push({ path: "/workflow" });
      } catch (B) {
        b.error(l.errorMessage(B));
      }
    }
    function I(N) {
      const B = $.value;
      if (!B) return "";
      if (N === "listing") {
        const C = B.ruleHits.filter((j) => j.rule === "soldout" || j.rule === "broken_size").length;
        return C ? String(C) : "";
      }
      if (N === "video") {
        const C = B.videos.filter((j) => j.status === "rendered" || j.status === "scripted").length;
        return C ? String(C) : "";
      }
      return "";
    }
    function w(N) {
      D.value = N;
      try {
        localStorage.setItem(ie, N);
      } catch {
      }
    }
    function S(N, B) {
      R.some((C) => C.key === N) && (T[N] = { ...B || {}, at: Date.now() }, w(N));
    }
    async function L() {
      p.value = !0;
      try {
        const N = await l.consumePublishResult().catch(() => !1);
        await Promise.all([l.refreshState(), l.loadModels()]), N && b.info(n.t("发布结果已记入历史记录")), F.value = !0, V.value = "";
      } catch (N) {
        V.value = l.errorMessage(N);
      } finally {
        p.value = !1;
      }
    }
    let M = null;
    const O = {};
    let P = null;
    return e.onMounted(() => {
      L(), P = l.onBaEvent((N) => {
        if (N.type === "publish-due" && N.payload?.id) {
          g(String(N.payload.id));
          return;
        }
        if (N.type === "progress" && N.payload?.key) {
          const B = String(N.payload.key);
          l.baProgress[B] = String(N.payload.message || ""), clearTimeout(O[B]), O[B] = setTimeout(() => {
            l.baProgress[B] = "";
          }, 2e4);
          return;
        }
        M || (M = setTimeout(() => {
          M = null, l.refreshState().catch(() => {
          });
        }, 250));
      });
    }), e.onBeforeUnmount(() => {
      P?.(), M && clearTimeout(M);
      for (const N of Object.values(O)) clearTimeout(N);
    }), (N, B) => (e.openBlock(), e.createElementBlock("div", sr, [
      e.createElementVNode("header", ar, [
        e.createElementVNode("div", ir, [
          e.createVNode(ue),
          B[0] || (B[0] = e.createElementVNode(
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
              rr,
              e.toDisplayString(N.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(N.$t("经营自动化智能体")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              cr,
              e.toDisplayString(N.$t("短视频发自媒体、数字人介绍企业、商品图文上下架、经营数据自动统计推送。发布与上架默认停在提交前由你确认，数字全部由规则计算，财务数据只读。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", dr, [
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: p.value,
            onClick: L
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(p.value ? "ri-loader-4-line spin" : "ri-refresh-line")
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
          ], 8, ur)
        ])
      ]),
      e.unref($) ? (e.openBlock(), e.createElementBlock("section", mr, [
        e.createElementVNode("span", null, [
          B[1] || (B[1] = e.createElementVNode(
            "i",
            { class: "ri-store-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(e.unref($).settings.brandName || N.$t("未设置品牌名")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          pr,
          e.toDisplayString(N.$t("商品 {a} · 视频 {b} · 上架 {c} · 销售数据 {d} 行", { a: z.value.length, b: e.unref($).videos.length, c: e.unref($).listings.filter((C) => C.status === "listed").length, d: e.unref($).salesRows })),
          1
          /* TEXT */
        ),
        e.createElementVNode("p", vr, [
          e.createElementVNode("span", yr, [
            B[2] || (B[2] = e.createElementVNode(
              "i",
              { class: "ri-close-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(N.$t("模型不算钱、不改财务数据、不擅自提交")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", hr, [
            B[3] || (B[3] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(N.$t("发布 / 上架停在提交前由你确认")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("nav", kr, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(R, (C) => e.createElementVNode("button", {
            key: C.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["ba-tab", { active: D.value === C.key }]),
            "aria-selected": D.value === C.key,
            onClick: (j) => w(C.key)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(C.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(C.title),
              1
              /* TEXT */
            ),
            I(C.key) ? (e.openBlock(), e.createElementBlock(
              "em",
              gr,
              e.toDisplayString(I(C.key)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, Vr)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(s.value, (C) => (e.openBlock(), e.createElementBlock("p", {
          key: C.id,
          class: "ss-note warn"
        }, [
          B[4] || (B[4] = e.createElementVNode(
            "i",
            { class: "ri-timer-flash-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(N.$t("「{p0}」到了定时发布时间", { p0: C.name })),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            onClick: (j) => g(C.id)
          }, e.toDisplayString(N.$t("立即发布")), 9, br)
        ]))),
        128
        /* KEYED_FRAGMENT */
      )),
      o.value ? (e.openBlock(), e.createElementBlock("p", Nr, [
        B[5] || (B[5] = e.createElementVNode(
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
      F.value ? (e.openBlock(), e.createElementBlock("div", Er, [
        D.value === "video" ? (e.openBlock(), e.createBlock(ml, {
          key: 0,
          focus: T.video || null
        }, null, 8, ["focus"])) : D.value === "avatar" ? (e.openBlock(), e.createBlock(Zl, {
          key: 1,
          onGoto: S
        })) : D.value === "listing" ? (e.openBlock(), e.createBlock(Zn, { key: 2 })) : D.value === "finance" ? (e.openBlock(), e.createBlock(Ns, { key: 3 })) : D.value === "schedule" ? (e.openBlock(), e.createBlock(va, { key: 4 })) : D.value === "history" ? (e.openBlock(), e.createBlock(or, {
          key: 5,
          onGoto: S
        })) : D.value === "settings" ? (e.openBlock(), e.createBlock(Za, { key: 6 })) : (e.openBlock(), e.createElementBlock("div", fr, [
          e.createElementVNode("section", $r, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(N.$t("四个模块，一个商品库")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", _r, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(A, (C) => e.createElementVNode("button", {
                  key: C.key,
                  type: "button",
                  class: "ba-ov__card",
                  onClick: (j) => w(C.key)
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(C.icon)
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(C.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(C.text),
                    1
                    /* TEXT */
                  )
                ], 8, Sr)),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode(
              "p",
              Dr,
              e.toDisplayString(N.$t("商品库在「服装实体店智能体」里维护（导入、AI 打标签、尺码库存）；试穿图会自动成为短视频与上架图的素材。")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("section", Br, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(N.$t("三条红线")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", wr, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(N.$t("钱和数字不交给模型算：营业额、毛利、库存、价格全部由规则计算；模型只写解读与文案，写出来的数字回原数据核对")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(N.$t("对外发布与上下架有人工闸门：发布视频、上架、改价默认停在提交前等你确认，每次执行都留痕")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(N.$t("财务数据只读：只导入、只统计，不写回收银或财务系统")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", Cr, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(N.$t("合规")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Tr, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(N.$t("数字人视频画面带「AI 生成」标识，发布文案末尾注明；使用真人形象须本人书面授权")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(N.$t("脚本、标题、讲稿自动检查广告法极限词；活动信息里没有的价格 / 折扣会被标出来")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(N.$t("平台账号由你在内置浏览器登录，系统不保存密码；按人的节奏操作，建议每账号每天发布不超过 3 条")),
                1
                /* TEXT */
              )
            ])
          ])
        ]))
      ])) : V.value ? (e.openBlock(), e.createElementBlock("p", Lr, [
        B[6] || (B[6] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(V.value),
          1
          /* TEXT */
        )
      ])) : (e.openBlock(), e.createElementBlock("p", Mr, [
        B[7] || (B[7] = e.createElementVNode(
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
}), Ir = /* @__PURE__ */ x(Ar, [["__scopeId", "data-v-de2a97a7"]]);
export {
  Ir as default
};
