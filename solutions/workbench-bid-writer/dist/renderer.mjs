const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const be = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!be) throw new Error("宿主模块未就绪：npm:vue-router");
be.default;
const Pe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!Pe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Kt = Pe.default, qe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/WorkbenchStepBar.vue"];
if (!qe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/WorkbenchStepBar.vue");
const It = qe.default, re = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts"];
if (!re) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts");
re.default;
const r = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!r) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
r.default;
const xt = ["aria-label"], Rt = { class: "bw-progress__meta" }, Ot = {
  key: 1,
  class: "bw-progress__live ok"
}, Mt = {
  key: 2,
  class: "bw-progress__live bad"
}, Ft = 240, Wt = /* @__PURE__ */ e.defineComponent({
  __name: "BwProgress",
  props: {
    metas: {},
    runtime: {},
    currentKey: {},
    live: {}
  },
  emits: ["jump"],
  setup(i, { emit: l }) {
    const u = i, p = l, a = e.computed(() => Math.max(0, u.metas.findIndex((v) => v.key === u.currentKey))), f = e.computed(() => u.metas.filter((v) => u.runtime[v.key]?.state === "done").length), j = e.computed(() => {
      const v = u.metas.find((V) => u.runtime[V.key]?.state === "running");
      return v ? u.runtime[v.key] : null;
    }), B = e.computed(() => !!j.value), N = e.computed(() => u.metas.findIndex((v) => u.runtime[v.key]?.state === "failed")), w = re.useStepWatchdog({
      running: () => B.value,
      startedAt: () => j.value?.startedAt,
      estimateMs: () => Ft * 1e3,
      kind: "llm"
    });
    e.watch(() => u.live, (v) => {
      v && B.value && w.heartbeat();
    }, { deep: !0 });
    const D = e.computed(() => u.metas.map((v, V) => {
      const S = u.runtime[v.key]?.state;
      return {
        id: V + 1,
        label: v.title,
        done: S === "done",
        sub: S === "running" ? w.suspect.value ? r.t("可能已超时") : r.t("进行中") : S === "failed" ? r.t("失败") : void 0
      };
    })), b = e.ref(a.value + 1);
    e.watch(a, (v) => {
      b.value = v + 1;
    });
    function y(v) {
      b.value = v;
      const V = u.metas[v - 1]?.key;
      V && p("jump", V);
    }
    const g = e.computed(() => {
      const v = w.elapsedSec.value, V = v >= 3 ? ` · ${re.formatStepDuration(v)}` : "";
      return w.suspect.value ? `${V} · ${r.t("可能已超时")}` : V;
    });
    return (v, V) => (e.openBlock(), e.createElementBlock("nav", {
      class: e.normalizeClass(["bw-progress", { busy: B.value }]),
      "aria-label": v.$t("流程进度")
    }, [
      e.createElementVNode("div", Rt, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(v.$t("标书制作进度")),
          1
          /* TEXT */
        ),
        B.value ? (e.openBlock(), e.createElementBlock(
          "em",
          {
            key: 0,
            class: e.normalizeClass(["bw-progress__live", { suspect: e.unref(w).suspect.value }])
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(e.unref(w).suspect.value ? "ri-timer-flash-line" : "ri-loader-4-line bw-spin")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(i.live?.message || v.$t("进行中")) + e.toDisplayString(g.value),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )) : f.value === i.metas.length ? (e.openBlock(), e.createElementBlock("em", Ot, [
          V[0] || (V[0] = e.createElementVNode(
            "i",
            { class: "ri-check-double-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(v.$t("全部完成")),
            1
            /* TEXT */
          )
        ])) : N.value >= 0 ? (e.openBlock(), e.createElementBlock("em", Mt, [
          V[1] || (V[1] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(v.$t("第 {n} 步失败", { n: N.value + 1 })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createVNode(It, {
        steps: D.value,
        "model-value": b.value,
        "onUpdate:modelValue": y
      }, null, 8, ["steps", "model-value"])
    ], 10, xt));
  }
}), Pt = ["data-bw-step"], qt = { class: "bw-step__head" }, zt = { class: "bw-step__no" }, Gt = {
  key: 0,
  class: "ri-check-line"
}, Ht = {
  key: 1,
  class: "ri-loader-4-line bw-spin"
}, Jt = {
  key: 2,
  class: "ri-close-line"
}, Xt = { class: "bw-step__title" }, Zt = { class: "bw-step__tools" }, Qt = {
  key: 0,
  class: "bw-step__msg bad"
}, Yt = {
  key: 1,
  class: "bw-step__msg ok"
}, en = { class: "bw-step__body" }, q = /* @__PURE__ */ e.defineComponent({
  __name: "BwStep",
  props: {
    stepKey: {},
    index: {},
    title: {},
    hint: {},
    icon: {},
    runtime: {},
    isCurrent: { type: Boolean }
  },
  setup(i) {
    return (l, u) => (e.openBlock(), e.createElementBlock("article", {
      class: e.normalizeClass(["bw-step", [`is-${i.runtime.state}`, { current: i.isCurrent }]]),
      "data-bw-step": i.stepKey
    }, [
      e.createElementVNode("header", qt, [
        e.createElementVNode("span", zt, [
          i.runtime.state === "done" ? (e.openBlock(), e.createElementBlock("i", Gt)) : i.runtime.state === "running" ? (e.openBlock(), e.createElementBlock("i", Ht)) : i.runtime.state === "failed" ? (e.openBlock(), e.createElementBlock("i", Jt)) : (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 3 },
            [
              e.createTextVNode(
                e.toDisplayString(i.index + 1),
                1
                /* TEXT */
              )
            ],
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        e.createElementVNode("div", Xt, [
          e.createElementVNode("strong", null, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(i.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(l.$t("第 {n} 步", { n: i.index + 1 })) + " · " + e.toDisplayString(i.title),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(i.hint),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Zt, [
          e.renderSlot(l.$slots, "tools")
        ]),
        e.createElementVNode(
          "em",
          {
            class: e.normalizeClass(["bw-step__state", i.runtime.state])
          },
          [
            i.runtime.state === "todo" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createTextVNode(
                  e.toDisplayString(l.$t("待执行")),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : i.runtime.state === "running" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createTextVNode(
                  e.toDisplayString(l.$t("进行中")),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : i.runtime.state === "done" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 2 },
              [
                e.createTextVNode(
                  e.toDisplayString(l.$t("完成")),
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
                  e.toDisplayString(l.$t("失败")),
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
      i.runtime.state === "failed" && i.runtime.error ? (e.openBlock(), e.createElementBlock("p", Qt, [
        u[0] || (u[0] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.runtime.error),
          1
          /* TEXT */
        )
      ])) : i.runtime.state === "done" && i.runtime.summary ? (e.openBlock(), e.createElementBlock("p", Yt, [
        u[1] || (u[1] = e.createElementVNode(
          "i",
          { class: "ri-checkbox-circle-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.runtime.summary),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", en, [
        e.renderSlot(l.$slots, "default")
      ])
    ], 10, Pt));
  }
}), ze = /【待补充[:：]/, tn = /【/;
function nn() {
  return new RegExp(`${ze.source}([^】]{1,60})】`, "g");
}
function Ge(i) {
  const l = i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:${ze.source}|${tn.source})${l}】`, "g");
}
function Ue(i) {
  const l = [];
  for (const u of String(i || "").matchAll(nn())) l.push(u[1].trim());
  return [...new Set(l)];
}
const on = [
  [/^(投标)?(总)?报价(总额)?(（小写）|小写)?$|^报价金额$/, () => r.t("投标总报价")],
  [/大写/, () => r.t("投标总报价（大写）")],
  [/^(总)?工期(日历天|天数)?$|^工期或服务期$|^服务期(限)?$/, () => r.t("工期")],
  [/^质保(期)?(年限)?$|^保修期$/, () => r.t("质保年限")],
  [/采购人|招标人/, () => r.t("采购人全称")],
  [/授权代表.*身份证/, () => r.t("授权代表身份证号")],
  [/授权代表.*姓名|^授权代表$/, () => r.t("授权代表姓名")],
  [/项目经理/, () => r.t("项目经理姓名及职称证书")],
  [/技术负责人/, () => r.t("技术负责人姓名")],
  [/软著|高企/, () => r.t("软著 / 高企证书")],
  [/体系认证|ISO|CMMI/i, () => r.t("体系认证（含证书号）")],
  [/行业资质|资质及等级|资质等级/, () => r.t("行业资质及等级")]
];
function ln(i) {
  const l = String(i || "").trim();
  return on.find(([u]) => u.test(l))?.[1]() || l;
}
const an = {
  key: 0,
  class: "bw-panel bw-gaps"
}, rn = { class: "bw-panel__head" }, sn = { class: "bw-muted" }, cn = ["title"], dn = ["disabled"], un = { class: "bw-panel__body" }, mn = { class: "bw-table" }, pn = {
  key: 0,
  class: "bw-muted"
}, vn = {
  key: 1,
  class: "bw-gap__ctx"
}, fn = ["onUpdate:modelValue", "placeholder"], bn = {
  key: 0,
  class: "bw-muted bw-gap__eg"
}, gn = { class: "bw-muted" }, yn = /* @__PURE__ */ e.defineComponent({
  __name: "BwGapForm",
  props: {
    sections: {},
    busy: { type: Boolean },
    remember: { type: Boolean }
  },
  emits: ["apply", "update:remember"],
  setup(i, { emit: l }) {
    const u = i, p = l, a = e.reactive({}), f = e.computed({
      get: () => u.remember !== !1,
      set: (b) => p("update:remember", b)
    }), j = [
      [/总报价|投标报价|报价总|合同金额/, () => r.t("286.50 万元")],
      [/大写/, () => r.t("贰佰捌拾陆万伍仟元整")],
      [/单价/, () => r.t("12,800 元")],
      [/合价|小计|合计/, () => r.t("128,000 元")],
      [/工期|服务期|日历天/, () => r.t("125 日历天")],
      [/质保|保修/, () => r.t("3 年")],
      [/比例/, () => r.t("80%")],
      [/人数|人员数量/, () => r.t("12 人")],
      [/分钟/, () => r.t("15 分钟")],
      [/小时/, () => r.t("4 小时")],
      [/身份证/, () => r.t("110108198603121234")],
      [/职称|证书编号|资格/, () => r.t("高级工程师 / 证书编号 0319004201800321")],
      [/体系认证/, () => r.t("ISO9001:2015（证书号 00123Q30456R0M）")],
      [/资质/, () => r.t("信息系统集成及服务资质二级")],
      [/姓名/, () => r.t("张某某")],
      [/采购人|招标人/, () => r.t("某某市大数据管理局")],
      [/项目名称/, () => r.t("智慧园区平台建设项目")],
      [/完成时间|签订时间|日期/, () => r.t("2024 年 11 月")],
      [/条款号|章节/, () => r.t("第三章 3.2 条")]
    ];
    function B(b) {
      return j.find(([y]) => y.test(b))?.[1]();
    }
    const N = e.computed(() => {
      const b = /* @__PURE__ */ new Map();
      for (const y of u.sections) {
        const g = String(y.content || "");
        for (const v of y.placeholders || []) {
          const V = String(v || "").trim();
          if (!V) continue;
          const S = ln(V), _ = b.get(S) || { label: S, raw: [], count: 0, sections: [], example: B(S) };
          if (_.count += 1, _.raw.includes(V) || _.raw.push(V), _.sections.includes(y.title) || _.sections.push(y.title), !_.context && g) {
            const A = Ge(V).exec(g);
            if (A) {
              const c = A.index;
              _.context = {
                before: g.slice(Math.max(0, c - 34), c).replace(/\s+/g, " "),
                after: g.slice(c + A[0].length, c + A[0].length + 34).replace(/\s+/g, " ")
              };
            }
          }
          b.set(S, _);
        }
      }
      return [...b.values()].sort((y, g) => g.count - y.count || y.label.localeCompare(g.label, "zh-CN"));
    }), w = e.computed(() => N.value.filter((b) => String(a[b.label] || "").trim()).length);
    e.watch(N, (b) => {
      const y = new Set(b.map((g) => g.label));
      for (const g of Object.keys(a)) y.has(g) || delete a[g];
    });
    function D() {
      const b = {};
      for (const y of N.value) {
        const g = String(a[y.label] || "").trim();
        if (g)
          for (const v of y.raw) b[v] = g;
      }
      Object.keys(b).length && p("apply", b, f.value);
    }
    return (b, y) => N.value.length ? (e.openBlock(), e.createElementBlock("section", an, [
      e.createElementVNode("header", rn, [
        e.createElementVNode("strong", null, [
          y[1] || (y[1] = e.createElementVNode(
            "i",
            { class: "ri-edit-box-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(b.$t("需要你填写的信息（{n} 项）", { n: N.value.length })),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          sn,
          e.toDisplayString(b.$t("正文里这些地方 AI 没有依据，不能编 —— 填完点「回填到正文」，占位会被替换掉。")),
          1
          /* TEXT */
        ),
        y[2] || (y[2] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("button", {
          type: "button",
          class: e.normalizeClass(["bw-chip", { on: f.value }]),
          title: b.$t("与页面顶部「我手填的信息」是同一个开关"),
          onClick: y[0] || (y[0] = (g) => f.value = !f.value)
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(f.value ? "ri-toggle-fill" : "ri-toggle-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            " " + e.toDisplayString(f.value ? b.$t("存入知识图谱（以后自动带出）") : b.$t("仅本次有效（不进知识图谱）")),
            1
            /* TEXT */
          )
        ], 10, cn),
        e.createElementVNode("button", {
          type: "button",
          class: "bw-btn sm primary",
          disabled: !w.value || i.busy,
          onClick: D
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(i.busy ? "ri-loader-4-line bw-spin" : "ri-check-double-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            " " + e.toDisplayString(b.$t("回填到正文（{n} 项）", { n: w.value })),
            1
            /* TEXT */
          )
        ], 8, dn)
      ]),
      e.createElementVNode("div", un, [
        e.createElementVNode("table", mn, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(b.$t("需要填的信息")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(b.$t("你的填写")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(b.$t("出现位置")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(N.value, (g) => (e.openBlock(), e.createElementBlock("tr", {
                key: g.label
              }, [
                e.createElementVNode("td", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(g.label),
                    1
                    /* TEXT */
                  ),
                  g.count > 1 ? (e.openBlock(), e.createElementBlock(
                    "span",
                    pn,
                    e.toDisplayString(b.$t("（{n} 处）", { n: g.count })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createCommentVNode(" 只给一个字段名（「单价」「比例」「体系认证」）用户不知道填什么，把正文原句摆出来 "),
                  g.context ? (e.openBlock(), e.createElementBlock("div", vn, [
                    e.createTextVNode(
                      " …" + e.toDisplayString(g.context.before),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "mark",
                      null,
                      e.toDisplayString(b.$t("【{p0}】", { p0: g.label })),
                      1
                      /* TEXT */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(g.context.after) + "… ",
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("td", null, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (v) => a[g.label] = v,
                    type: "text",
                    placeholder: g.example || b.$t("按招标文件或公司实际情况填写"),
                    onKeyup: e.withKeys(D, ["enter"])
                  }, null, 40, fn), [
                    [e.vModelText, a[g.label]]
                  ]),
                  g.example ? (e.openBlock(), e.createElementBlock(
                    "div",
                    bn,
                    e.toDisplayString(b.$t("例：{e}", { e: g.example })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("td", gn, [
                  e.createTextVNode(
                    e.toDisplayString(g.sections.slice(0, 2).join(b.$t("、"))),
                    1
                    /* TEXT */
                  ),
                  g.sections.length > 2 ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createTextVNode("…")
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), Vn = (i, l) => {
  const u = i.__vccOpts || i;
  for (const [p, a] of l)
    u[p] = a;
  return u;
}, Ke = /* @__PURE__ */ Vn(yn, [["__scopeId", "data-v-205a9d12"]]), se = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!se) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
se.default;
const ge = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!ge) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
ge.default;
const Y = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!Y) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
Y.default;
function Nn() {
  return [
    { key: "project", title: r.t("项目与投标目标"), hint: r.t("项目名称、投标人、你想靠什么赢下这一标"), icon: "ri-flag-line" },
    { key: "notice", title: r.t("招标公告"), hint: r.t("填目标投标网站地址自动抓取，或上传招标文件；抽成逐条要求"), icon: "ri-global-line" },
    { key: "template", title: r.t("标书模板"), hint: r.t("上传模板解析章节；不上传就从知识库里找，或用内置标准大纲"), icon: "ri-file-copy-2-line" },
    { key: "company", title: r.t("公司资料与资格自检"), hint: r.t("从知识库取公司信息，逐条核对资格门槛"), icon: "ri-building-2-line" },
    { key: "compose", title: r.t("逐章成文"), hint: r.t("按大纲一章一章写，每章可单独重写与编辑"), icon: "ri-quill-pen-line" },
    { key: "review", title: r.t("自检与导出"), hint: r.t("废标风险自检；通过后导出 Word / PDF 正式件"), icon: "ri-shield-check-line" }
  ];
}
let fe = null, Ie = null;
function h() {
  const i = window.electronAPI?.workbenches?.bidWriter;
  if (!i) return i;
  if (fe && Ie === i) return fe;
  const l = {};
  for (const u of Object.keys(i)) {
    const p = i[u];
    if (typeof p != "function" || u === "onEvent") {
      l[u] = p;
      continue;
    }
    l[u] = (...a) => p(...a.map((f) => ge.toPlain(f)));
  }
  return fe = l, Ie = i, l;
}
function $(i) {
  return i ? String(i?.message || i).replace(/^Error invoking remote method '[^']+': /, "").replace(/^Error: /, "") : r.t("未知错误");
}
function xe(i, l) {
  const u = Date.now();
  return {
    id: `bid_${u.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name: i || r.t("未命名投标项目"),
    createdAt: u,
    updatedAt: u,
    lang: "zh-CN",
    goal: "",
    strategies: [],
    bidder: l,
    siteUrl: "",
    notice: { requirements: [] },
    template: null,
    sections: [],
    company: [],
    qualifications: [],
    compliance: [],
    exports: [],
    stepState: {}
  };
}
const T = Nn(), R = e.reactive(
  Object.fromEntries(T.map((i) => [i.key, { state: "todo" }]))
), Z = e.ref("project"), E = e.ref({ version: 1, projects: [], currentId: "" }), Re = e.ref(!1), K = e.ref(""), z = e.ref(""), Q = e.ref(""), ae = e.ref(
  { docCount: 0, builtCount: 0, factCount: 0 }
), Oe = e.ref(!1), wn = e.ref(null);
let O = null;
function kn() {
  const i = e.computed(
    () => E.value.projects.find((c) => c.id === E.value.currentId) || null
  );
  function l(c, m) {
    Object.assign(R[c], m);
  }
  function u(c) {
    l(c, { state: "running", error: void 0, startedAt: Date.now() }), Z.value = c, ee(c);
  }
  function p(c, m) {
    l(c, { state: "done", summary: m, error: void 0 });
    const k = T.findIndex((C) => C.key === c);
    T[k + 1] && (Z.value = T[k + 1].key), N();
  }
  function a(c, m) {
    l(c, { state: "failed", error: $(m) }), Z.value = c, ee(c), N();
  }
  function f(c) {
    l(c, { state: "todo", error: void 0, summary: void 0 });
  }
  function j(c) {
    const m = T.findIndex((k) => k.key === c);
    T.slice(m + 1).forEach((k) => {
      R[k.key].state !== "todo" && f(k.key);
    });
  }
  function B() {
    return T.some((c) => R[c.key].state === "running");
  }
  function N() {
    const c = i.value;
    c && (c.stepState = Object.fromEntries(T.map((m) => [m.key, { ...R[m.key] }])), v());
  }
  function w() {
    const c = i.value;
    for (const m of T) {
      const k = c?.stepState?.[m.key];
      Object.assign(R[m.key], k ? { state: k.state === "running" ? "todo" : k.state, summary: k.summary, error: k.error, startedAt: void 0 } : { state: "todo", summary: void 0, error: void 0, startedAt: void 0 });
    }
    Z.value = T.find((m) => R[m.key].state !== "done")?.key || "review";
  }
  async function D() {
    const c = h();
    if (!c?.stateGet) throw new Error(r.t("当前环境不支持标书工作台"));
    const m = await c.stateGet();
    if (E.value = m?.state?.projects ? m.state : { version: 1, projects: [], currentId: "" }, Re.value = !!m?.llmReady, K.value = String(m?.defaultBidder || ""), z.value = String(m?.docRoot || ""), Q.value = String(m?.defaultDocRoot || ""), ae.value = m?.knowledge || { docCount: 0, builtCount: 0, factCount: 0 }, E.value.projects.length)
      E.value.projects.some((C) => C.id === E.value.currentId) || (E.value.currentId = E.value.projects[0].id);
    else {
      const C = xe(r.t("未命名投标项目"), K.value);
      E.value.projects.push(C), E.value.currentId = C.id;
    }
    const k = E.value.projects.find((C) => C.id === E.value.currentId);
    k && !String(k.bidder || "").trim() && K.value && (k.bidder = K.value, v()), Oe.value = !0, w();
  }
  async function b() {
    const m = await h().stateGet();
    return K.value = String(m?.defaultBidder || ""), ae.value = m?.knowledge || { docCount: 0, builtCount: 0, factCount: 0 }, z.value = String(m?.docRoot || z.value), Q.value = String(m?.defaultDocRoot || Q.value), { companyName: K.value, ...ae.value };
  }
  async function y() {
    const m = await h().pickRoot();
    return m?.docRoot && (z.value = String(m.docRoot)), m?.defaultDocRoot && (Q.value = String(m.defaultDocRoot)), { ok: !!m?.ok, error: m?.error };
  }
  async function g() {
    const m = await h().setRoot({ path: "" });
    m?.docRoot && (z.value = String(m.docRoot));
  }
  function v() {
    const c = i.value;
    c && (c.updatedAt = Date.now()), O && window.clearTimeout(O), O = window.setTimeout(() => {
      O = null, V().catch((m) => se.useNotificationStore().error($(m)));
    }, 600);
  }
  async function V() {
    O && (window.clearTimeout(O), O = null);
    const c = h();
    if (!c?.stateSave) throw new Error(r.t("标书保存接口不可用"));
    const m = await c.stateSave({ state: E.value });
    if (!m?.ok) throw new Error(m?.error || r.t("标书保存失败"));
  }
  function S(c) {
    const m = xe(c, K.value);
    E.value.projects.unshift(m), E.value.currentId = m.id, w(), v();
  }
  function _(c) {
    E.value.currentId = c, w(), v();
  }
  function A(c) {
    E.value.projects = E.value.projects.filter((m) => m.id !== c), E.value.projects.length ? E.value.currentId === c && _(E.value.projects[0].id) : S(r.t("未命名投标项目")), v();
  }
  return {
    metas: T,
    runtime: R,
    currentKey: Z,
    state: E,
    project: i,
    llmReady: Re,
    defaultBidder: K,
    loaded: Oe,
    live: wn,
    docRoot: z,
    defaultDocRoot: Q,
    knowledge: ae,
    start: u,
    done: p,
    fail: a,
    reset: f,
    resetAfter: j,
    isRunning: B,
    persistStepState: N,
    restoreStepState: w,
    load: D,
    save: v,
    saveNow: V,
    createProject: S,
    switchProject: _,
    removeProject: A,
    refreshKnowledge: b,
    pickDocRoot: y,
    resetDocRoot: g
  };
}
async function ee(i) {
  await e.nextTick();
  const l = document.querySelector(`[data-bw-step="${i}"]`);
  if (l)
    try {
      l.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      l.scrollIntoView();
    }
}
function En(i) {
  const l = h();
  return l?.onEvent ? l.onEvent(i) || (() => {
  }) : () => {
  };
}
function Me(i) {
  switch (i) {
    case "qualification":
      return r.t("资格要求");
    case "scoring":
      return r.t("评分办法");
    case "deliverable":
      return r.t("必交材料");
    case "technical":
      return r.t("技术需求");
    case "commercial":
      return r.t("商务条款");
    case "format":
      return r.t("格式要求");
    default:
      return i;
  }
}
function hn(i) {
  switch (i) {
    case "blocker":
      return r.t("阻断");
    case "warning":
      return r.t("提醒");
    default:
      return r.t("通过");
  }
}
function Sn(i) {
  switch (i) {
    case "running":
      return r.t("生成中");
    case "done":
      return r.t("已完成");
    case "failed":
      return r.t("失败");
    default:
      return r.t("待生成");
  }
}
function Fe(i) {
  if (!i) return "";
  const l = new Date(i), u = (p) => String(p).padStart(2, "0");
  return `${l.getFullYear()}-${u(l.getMonth() + 1)}-${u(l.getDate())} ${u(l.getHours())}:${u(l.getMinutes())}`;
}
function _n() {
  return [
    { key: "price", label: r.t("价格有竞争力") },
    { key: "tech", label: r.t("技术方案领先") },
    { key: "delivery", label: r.t("工期与交付保障") },
    { key: "service", label: r.t("服务响应与售后") },
    { key: "record", label: r.t("同类项目业绩") },
    { key: "compliance", label: r.t("资质与合规齐全") },
    { key: "local", label: r.t("本地化与属地服务") }
  ];
}
async function We(i, l) {
  const u = window.electronAPI?.browserTabs;
  if (!u?.create) return !1;
  const p = String(i || "").trim();
  if (!p) return !1;
  const a = /^https?:\/\//i.test(p) ? p : `https://${p}`, f = await u.create({ url: a, contextId: l, source: "agent", activate: !0 });
  if (f?.id && u.setAutomationPaused)
    try {
      await u.setAutomationPaused(f.id, !0);
    } catch {
    }
  try {
    await u.setVisible?.(!0);
  } catch {
  }
  return !0;
}
const $n = { class: "bw-workbench" }, Dn = { class: "bw-hero" }, Cn = { class: "bw-hero__copy" }, Bn = { class: "bw-hero__eyebrow" }, Tn = { class: "bw-hero__sub" }, An = { class: "bw-projects" }, jn = { class: "bw-muted" }, Ln = ["value", "disabled"], Un = ["value"], Kn = ["disabled"], In = ["disabled"], xn = {
  key: 0,
  class: "bw-muted"
}, Rn = { class: "bw-projects" }, On = { class: "bw-muted" }, Mn = ["title"], Fn = ["disabled"], Wn = ["disabled"], Pn = ["disabled"], qn = { class: "bw-muted" }, zn = { class: "bw-projects" }, Gn = { class: "bw-muted" }, Hn = ["title"], Jn = { class: "bw-muted" }, Xn = {
  key: 0,
  class: "bw-note warn"
}, Zn = {
  key: 1,
  class: "bw-steps"
}, Qn = { class: "bw-form" }, Yn = { class: "bw-field" }, eo = ["placeholder"], to = { class: "bw-field" }, no = { class: "bw-inline" }, oo = ["placeholder"], lo = ["disabled", "title"], ao = { class: "bw-field" }, ro = { value: "zh-CN" }, so = { class: "bw-field" }, io = { class: "bw-field wide" }, co = { class: "bw-field__head" }, uo = {
  key: 0,
  class: "bw-muted"
}, mo = {
  key: 1,
  class: "bw-muted"
}, po = ["disabled"], vo = ["placeholder"], fo = {
  key: 0,
  class: "bw-note warn"
}, bo = { class: "bw-chips" }, go = ["disabled", "onClick"], yo = { class: "bw-note" }, Vo = { class: "bw-hero__actions" }, No = ["disabled"], wo = {
  key: 0,
  class: "bw-chip static ok"
}, ko = { class: "bw-form" }, Eo = { class: "bw-field wide" }, ho = { class: "bw-field__head" }, So = {
  key: 0,
  class: "bw-muted"
}, _o = { class: "bw-inline" }, $o = ["placeholder"], Do = ["disabled"], Co = {
  key: 0,
  class: "bw-panel"
}, Bo = { class: "bw-panel__head" }, To = { class: "bw-muted" }, Ao = {
  key: 0,
  class: "bw-chip static warn"
}, jo = { class: "bw-panel__body" }, Lo = { class: "bw-table" }, Uo = { class: "bw-muted" }, Ko = {
  key: 0,
  class: "bw-muted"
}, Io = { class: "num" }, xo = ["disabled", "onClick"], Ro = ["onClick"], Oo = {
  key: 1,
  class: "bw-note warn"
}, Mo = { class: "bw-form" }, Fo = { class: "bw-field wide" }, Wo = { class: "bw-hero__actions" }, Po = ["disabled"], qo = ["disabled"], zo = ["disabled"], Go = ["disabled"], Ho = { class: "bw-note" }, Jo = { class: "bw-field wide" }, Xo = ["placeholder"], Zo = {
  key: 2,
  class: "bw-note warn"
}, Qo = {
  key: 3,
  class: "bw-note warn"
}, Yo = ["disabled"], el = {
  key: 4,
  class: "bw-panel"
}, tl = { class: "bw-panel__head" }, nl = ["href"], ol = { class: "bw-panel__body" }, ll = { class: "bw-form" }, al = { class: "bw-field" }, rl = { class: "bw-field" }, sl = { class: "bw-field" }, il = { class: "bw-field" }, cl = { class: "bw-field" }, dl = { class: "bw-field" }, ul = { class: "bw-field" }, ml = { class: "bw-field" }, pl = {
  key: 5,
  class: "bw-panel"
}, vl = { class: "bw-panel__head" }, fl = { class: "bw-panel__body" }, bl = { class: "bw-muted" }, gl = ["href"], yl = { class: "bw-note" }, Vl = {
  key: 6,
  class: "bw-panel"
}, Nl = { class: "bw-panel__head" }, wl = { class: "bw-panel__body" }, kl = { class: "bw-table" }, El = { class: "num" }, hl = ["onUpdate:modelValue"], Sl = ["value"], _l = ["onUpdate:modelValue"], $l = { class: "num" }, Dl = { class: "num" }, Cl = ["onClick"], Bl = {
  key: 0,
  class: "bw-chip static ok"
}, Tl = { class: "bw-hero__actions" }, Al = ["disabled"], jl = ["disabled"], Ll = ["disabled"], Ul = { class: "bw-note" }, Kl = {
  key: 0,
  class: "bw-panel"
}, Il = { class: "bw-panel__head" }, xl = { class: "bw-panel__body" }, Rl = { class: "bw-table" }, Ol = { class: "bw-muted" }, Ml = { class: "num" }, Fl = ["disabled", "onClick"], Wl = {
  key: 1,
  class: "bw-note info"
}, Pl = {
  key: 2,
  class: "bw-panel"
}, ql = { class: "bw-panel__head" }, zl = ["disabled"], Gl = { class: "bw-panel__body" }, Hl = { class: "bw-sections" }, Jl = { class: "bw-section__head" }, Xl = ["onUpdate:modelValue"], Zl = { value: 1 }, Ql = { value: 2 }, Yl = { value: 3 }, ea = ["onUpdate:modelValue"], ta = { class: "bw-chip static" }, na = ["onUpdate:modelValue"], oa = ["disabled", "onClick"], la = ["disabled", "onClick"], aa = ["onClick"], ra = {
  key: 0,
  class: "bw-section__body"
}, sa = { class: "bw-note" }, ia = { class: "bw-hero__actions" }, ca = ["disabled"], da = ["disabled", "title"], ua = {
  key: 0,
  class: "bw-panel"
}, ma = { class: "bw-panel__head" }, pa = { class: "bw-panel__body" }, va = { class: "bw-table" }, fa = { class: "num" }, ba = ["onUpdate:modelValue", "onChange"], ga = { class: "num bw-muted" }, ya = {
  key: 1,
  class: "bw-note"
}, Va = ["disabled"], Na = {
  key: 2,
  class: "bw-panel"
}, wa = { class: "bw-panel__head" }, ka = {
  key: 0,
  class: "bw-chip static bad"
}, Ea = {
  key: 1,
  class: "bw-chip static warn"
}, ha = { class: "bw-panel__body" }, Sa = { class: "bw-table" }, _a = { class: "num" }, $a = ["onUpdate:modelValue"], Da = { value: "met" }, Ca = { value: "unmet" }, Ba = { value: "unknown" }, Ta = { class: "bw-muted" }, Aa = { class: "bw-note" }, ja = {
  key: 3,
  class: "bw-panel"
}, La = { class: "bw-panel__head" }, Ua = { class: "bw-panel__body" }, Ka = { class: "bw-muted" }, Ia = { class: "bw-chip static" }, xa = {
  key: 0,
  class: "bw-chip static warn"
}, Ra = { class: "bw-hero__actions" }, Oa = ["disabled"], Ma = ["disabled"], Fa = {
  key: 0,
  class: "bw-muted"
}, Wa = {
  key: 0,
  class: "bw-note warn"
}, Pa = { class: "bw-sections" }, qa = { class: "bw-section__head" }, za = {
  key: 0,
  class: "bw-muted"
}, Ga = {
  key: 1,
  class: "bw-chip static"
}, Ha = ["disabled", "onClick"], Ja = ["onClick"], Xa = {
  key: 0,
  class: "bw-note bad",
  style: { padding: "0 10px 8px" }
}, Za = {
  key: 1,
  class: "bw-section__body"
}, Qa = {
  key: 0,
  class: "bw-note"
}, Ya = { class: "bw-field" }, er = ["onUpdate:modelValue", "placeholder"], tr = ["onUpdate:modelValue", "placeholder", "onChange"], nr = {
  key: 1,
  class: "bw-chips"
}, or = { class: "bw-hero__actions" }, lr = ["disabled"], ar = ["disabled"], rr = ["disabled", "title"], sr = {
  key: 0,
  class: "bw-panel"
}, ir = { class: "bw-panel__head" }, cr = {
  key: 0,
  class: "bw-muted"
}, dr = { class: "bw-panel__body" }, ur = { class: "bw-table" }, mr = { class: "num" }, pr = { class: "bw-muted" }, vr = { class: "num" }, fr = ["onClick"], br = ["title", "onClick"], gr = ["onClick"], yr = {
  key: 1,
  class: "bw-panel"
}, Vr = { class: "bw-panel__head" }, Nr = { class: "bw-panel__body" }, wr = { class: "bw-table" }, kr = { class: "bw-mono" }, Er = { class: "num" }, hr = { class: "num bw-muted" }, Sr = { class: "num" }, _r = ["onClick"], $r = ["onClick"], Dr = /* @__PURE__ */ e.defineComponent({
  __name: "BidWriterWorkbenchView",
  setup(i) {
    const l = kn(), u = be.useRouter(), p = se.useNotificationStore(), a = l.project, f = e.computed(() => l.isRunning()), j = _n(), B = ["qualification", "scoring", "deliverable", "technical", "commercial", "format"], N = e.ref(""), w = e.ref([]), D = e.ref(""), b = e.ref(""), y = e.ref([]), g = e.ref(""), v = e.ref(""), V = e.ref(!1), S = e.ref([]), _ = e.ref(""), A = e.ref([]), c = e.reactive(/* @__PURE__ */ new Set()), m = e.reactive({}), k = e.ref(!1), C = e.ref(""), te = e.ref(!1), G = e.ref(!1), H = e.ref(!1), ne = e.ref(!1);
    let I = null;
    const x = e.computed(() => a.value?.rememberGaps !== !1);
    function ie(n) {
      const t = a.value;
      t && (t.rememberGaps = n, l.save());
    }
    const M = e.ref(!1), F = e.ref(!1), L = e.ref(!1);
    let U = null, ce = !1, ye = null;
    const J = e.computed(() => a.value?.notice?.requirements || []), He = e.computed(() => {
      const n = a.value?.notice;
      if (!n) return !1;
      const t = /(提供|发送|查询|缴纳|上传|购买|获取|递交|参加)/.test(n.buyer || ""), o = !!n.budget && !/(元|万|亿)/.test(n.budget || ""), s = !!n.bidDeadline && !/\d{4}\s*[年\-/.]|\d{1,2}\s*[:：时]/.test(n.bidDeadline || "");
      return t || o || s;
    }), Je = e.computed(() => {
      const n = a.value?.notice;
      return !!(n && (n.buyer || n.projectCode || n.budget || n.bidDeadline || n.text));
    }), Xe = e.computed(() => B.map((n) => ({ key: n, label: Me(n), count: J.value.filter((t) => t.kind === n).length })).filter((n) => n.count > 0)), X = e.computed(() => (a.value?.company || []).filter((n) => n.from === "manual" && String(n.value || "").trim()).length), de = e.computed(() => (a.value?.company || []).filter((n) => !String(n.value || "").trim()).length), Ve = e.computed(() => (a.value?.qualifications || []).filter((n) => n.verdict === "unmet").length), Ne = e.computed(() => (a.value?.qualifications || []).filter((n) => n.verdict === "unknown").length), ue = e.computed(() => (a.value?.sections || []).filter((n) => String(n.content || "").trim()).length), we = e.computed(() => (a.value?.sections || []).reduce((n, t) => n + (t.placeholders?.length || 0), 0)), me = e.computed(() => !!a.value?.sections.length && l.llmReady.value), ke = e.computed(() => ue.value > 0), oe = e.computed(() => (a.value?.compliance || []).some((n) => n.level === "blocker"));
    function Ze(n) {
      return String(n || "").split(/[\\/]/).pop() || n;
    }
    const Qe = e.computed(() => !!(l.docRoot.value && l.defaultDocRoot.value && l.docRoot.value !== l.defaultDocRoot.value)), Ye = e.computed(() => {
      const n = a.value?.exports?.[0]?.path;
      return n || "";
    }), pe = e.computed(() => {
      const n = l.knowledge.value;
      return l.defaultBidder.value ? "" : n.docCount ? n.builtCount ? n.factCount ? n.nearestName ? r.t("知识库里有{label}「{value}」，但没有公司全称。投标人必须写营业执照上的名称，到知识库补一条「公司名称」即可自动带出。", {
        label: n.nearestName.label,
        value: n.nearestName.value
      }) : r.t("知识库里有 {n} 条事实，但没认出公司名称：到知识库把「公司名称」这条补上即可自动带出。", { n: n.factCount }) : r.t("知识库图谱已形成但没抽出公司事实：确认导入的资料里有「公司名称 / 统一社会信用代码」这类标签，或到知识库手工补一条。") : r.t("知识库里有 {n} 份文档，但都还没形成知识图谱 —— 形成之后才能抽出公司事实。", { n: n.docCount }) : r.t("知识库里还没有文档：把营业执照、资质证书、公司简介导进去并「形成知识图谱」，投标人、信用代码、资质业绩就能自动带出来。");
    });
    e.onMounted(async () => {
      try {
        await l.load(), N.value = String(a.value?.notice?.text || ""), w.value = a.value?.notice?.warnings || [], L.value = !!String(a.value?.goal || "").trim();
      } catch (n) {
        p.error($(n));
      }
      ye = En((n) => {
        l.live.value = { message: n.message, done: n.done, total: n.total }, n.done >= n.total && window.setTimeout(() => {
          l.isRunning() || (l.live.value = null);
        }, 800);
      });
    }), e.onBeforeUnmount(() => {
      U && (window.clearTimeout(U), U = null), I && (window.clearTimeout(I), I = null);
      try {
        ye?.();
      } catch {
      }
      l.saveNow().catch((n) => p.error($(n)));
    });
    async function et() {
      try {
        const n = await l.pickDocRoot();
        n.error ? p.error(n.error) : n.ok && p.success(r.t("以后导出的标书会放到：{p}", { p: l.docRoot.value }));
      } catch (n) {
        p.error($(n));
      }
    }
    async function tt() {
      try {
        await l.resetDocRoot(), p.success(r.t("已恢复默认存放位置"));
      } catch (n) {
        p.error($(n));
      }
    }
    async function nt() {
      const n = a.value;
      if (n) {
        te.value = !0;
        try {
          const t = await l.refreshKnowledge();
          t.companyName ? (n.bidder = t.companyName, l.save(), p.success(r.t("已带出：{name}", { name: t.companyName }))) : p.warn(pe.value || r.t("知识库里没有认出公司名称"));
        } catch (t) {
          p.error($(t));
        } finally {
          te.value = !1;
        }
      }
    }
    function ot(n) {
      l.switchProject(n.target.value), L.value = !!String(a.value?.goal || "").trim(), F.value = !1, N.value = String(a.value?.notice?.text || ""), w.value = a.value?.notice?.warnings || [], S.value = [], y.value = [], D.value = "", v.value = "";
    }
    function lt() {
      l.createProject(r.t("未命名投标项目")), L.value = !1, F.value = !1, N.value = "", w.value = [], S.value = [], y.value = [], D.value = "", v.value = "";
    }
    function at() {
      const n = a.value;
      n && window.confirm(r.t("删除「{name}」？已导出的文件不会被删除。", { name: n.name })) && (l.removeProject(n.id), N.value = String(a.value?.notice?.text || ""));
    }
    function rt(n) {
      const t = a.value;
      if (t) {
        if (t.strategies = t.strategies.includes(n) ? t.strategies.filter((o) => o !== n) : [...t.strategies, n], l.save(), U && window.clearTimeout(U), !t.strategies.length) {
          U = null;
          return;
        }
        U = window.setTimeout(() => {
          U = null, Ee(!1);
        }, 800);
      }
    }
    function st() {
      L.value = !!String(a.value?.goal || "").trim(), F.value = !1, l.save();
    }
    function it(n, t) {
      const o = n.filter(Boolean);
      if (!o.length) return "";
      const s = o.slice(0, 3).join(r.t("、")), d = o.slice(3), W = d.length ? r.t("，同时确保{rest}。", { rest: d.join(r.t("、")) }) : r.t("。");
      return r.t("本项目以{head}作为主要取胜点参与{name}投标{tail}", { head: s, name: t || r.t("本项目"), tail: W });
    }
    async function Ee(n) {
      const t = a.value;
      if (!t || M.value) return;
      if (!t.strategies.length) {
        n && p.warn(r.t("先选一个侧重标签"));
        return;
      }
      if (!n && L.value) return;
      const o = it(t.strategies, t.name);
      o && (t.goal = o, F.value = !0, l.save()), M.value = !0;
      const s = t.strategies.join("|");
      try {
        const d = await h().goalDraft({ projectId: t.id, strategies: t.strategies });
        if (!d?.ok || !d.text) throw new Error(d?.error || r.t("目标没生成出来"));
        if (L.value || a.value?.id !== t.id || t.strategies.join("|") !== s) return;
        t.goal = String(d.text).trim(), F.value = !!d.fallback, L.value = !1, l.save();
      } catch (d) {
        o || p.error($(d));
      } finally {
        M.value = !1;
      }
    }
    function ct() {
      const n = a.value;
      if (n) {
        if (!n.name.trim()) {
          p.error(r.t("先填项目名称"));
          return;
        }
        if (!n.goal.trim() && !n.strategies.length) {
          p.error(r.t("填一句投标目标，或至少选一个侧重 —— 这决定后面每一章怎么写"));
          return;
        }
        l.done("project", r.t("{name} · 投标人 {bidder}", { name: n.name, bidder: n.bidder || r.t("未填") }));
      }
    }
    async function he() {
      const n = a.value;
      if (!(!n || V.value)) {
        V.value = !0, v.value = "";
        try {
          const t = await h().noticeSearch({ projectId: n.id, keywords: D.value.trim() || void 0 });
          b.value = String(t?.keywords || ""), !D.value.trim() && t?.keywords && (D.value = String(t.keywords)), y.value = Array.isArray(t?.hits) ? t.hits : [], g.value = t?.via || "";
          const o = [...t?.warnings || []];
          !t?.ok && t?.error && o.unshift(t.error), v.value = o.join(`
`);
        } catch (t) {
          y.value = [], v.value = $(t);
        } finally {
          V.value = !1;
        }
      }
    }
    async function dt(n) {
      const t = a.value;
      t && (t.siteUrl = n.url, t.notice = { ...t.notice, title: n.title, url: n.url }, l.save(), await Se());
    }
    function ut(n) {
      We(n, "bid-writer-preview");
    }
    function mt() {
      const n = a.value;
      n && (n.notice.text = N.value, l.save());
    }
    async function pt() {
      const n = a.value;
      if (!n?.siteUrl) return;
      const t = (() => {
        try {
          return new URL(/^https?:/i.test(n.siteUrl) ? n.siteUrl : `https://${n.siteUrl}`).hostname;
        } catch {
          return "site";
        }
      })();
      await We(n.siteUrl, `bid-writer-${t}`) || p.error(r.t("内置浏览器不可用"));
    }
    async function Se() {
      const n = a.value;
      if (n) {
        l.start("notice");
        try {
          const t = await h().noticeFetch({ url: n.siteUrl, projectId: n.id });
          if (w.value = t?.warnings || [], !t?.ok) throw new Error(t?.error || r.t("抓取失败"));
          N.value = String(t.text || ""), n.notice = { ...n.notice, url: t.url, title: t.title, text: N.value, attachments: t.attachments || [] }, l.save(), l.runtime.notice.state = "todo", p.success(r.t("抓到 {n} 字正文，下一步点「抽取招标要点」", { n: N.value.length }));
        } catch (t) {
          l.fail("notice", t);
        }
      }
    }
    async function vt() {
      const n = a.value;
      if (n) {
        l.start("notice");
        try {
          const t = await h().noticeImport();
          if (!t?.ok) {
            l.runtime.notice.state = "todo", t?.error && p.error(t.error);
            return;
          }
          N.value = String(t.text || ""), w.value = t.warnings || [], n.notice = { ...n.notice, title: t.title, text: N.value }, l.save(), l.runtime.notice.state = "todo";
        } catch (t) {
          l.fail("notice", t);
        }
      }
    }
    async function _e() {
      const n = a.value;
      if (n) {
        l.start("notice");
        try {
          const t = await h().noticeExtract({
            projectId: n.id,
            text: N.value,
            url: n.notice.url || n.siteUrl,
            title: n.notice.title,
            rulesOnly: !l.llmReady.value
          });
          n.notice = { ...t, attachments: n.notice.attachments || t.attachments }, w.value = t.warnings || [], l.resetAfter("notice"), l.done("notice", r.t("{n} 条要求 · 截止 {t}", {
            n: t.requirements.length,
            t: t.bidDeadline || r.t("未抓到")
          })), l.save();
        } catch (t) {
          l.fail("notice", t);
        }
      }
    }
    function ft() {
      const n = a.value;
      n && (n.notice.requirements = [
        ...n.notice.requirements || [],
        { id: `manual_${Date.now().toString(36)}`, kind: "technical", text: "", source: { kind: "manual", label: r.t("手工添加") } }
      ], l.save());
    }
    function bt(n) {
      const t = a.value;
      t && (t.notice.requirements = (t.notice.requirements || []).filter((o) => o.id !== n), l.save());
    }
    function ve(n) {
      const t = a.value;
      if (!t || !n?.ok) {
        n?.error && p.error(n.error);
        return;
      }
      t.template = n.template, t.sections = n.sections || [], l.resetAfter("template"), l.save(), p.success(n.warnings?.[0] || r.t("大纲已就绪"));
    }
    async function gt() {
      const n = a.value;
      if (n) {
        l.start("template");
        try {
          const t = await h().templateImport({ projectId: n.id });
          if (!t?.ok && !t?.error) {
            l.runtime.template.state = "todo";
            return;
          }
          ve(t), t.ok ? l.done("template", r.t("模板：{name} · {n} 章", { name: t.template?.name || "", n: t.sections?.length || 0 })) : l.fail("template", t.error);
        } catch (t) {
          l.fail("template", t);
        }
      }
    }
    async function yt() {
      const n = a.value;
      if (n)
        try {
          const t = await h().templateSuggest({ projectId: n.id, query: n.name });
          S.value = t?.candidates || [], _.value = t?.note || "";
        } catch (t) {
          p.error($(t));
        }
    }
    async function Vt(n) {
      const t = a.value;
      if (t) {
        l.start("template");
        try {
          const o = await h().templateAdopt({ projectId: t.id, kind: "knowledge", docId: n });
          ve(o), o?.ok ? l.done("template", r.t("模板：{name} · {n} 章", { name: o.template?.name || "", n: o.sections?.length || 0 })) : l.fail("template", o?.error);
        } catch (o) {
          l.fail("template", o);
        }
      }
    }
    async function Nt() {
      const n = a.value;
      if (n) {
        l.start("template");
        try {
          const t = await h().templateAdopt({ projectId: n.id, kind: "builtin" });
          ve(t), l.done("template", r.t("内置标准大纲 · {n} 章", { n: t?.sections?.length || 0 }));
        } catch (t) {
          l.fail("template", t);
        }
      }
    }
    function wt() {
      const n = a.value;
      n?.sections.length && (l.done("template", r.t("{n} 章", { n: n.sections.length })), l.save());
    }
    function kt() {
      const n = a.value;
      n && (n.sections.push({
        id: `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
        level: 1,
        title: r.t("新章节"),
        state: "todo"
      }), l.save());
    }
    function Et(n) {
      const t = a.value;
      t && (t.sections = t.sections.filter((o) => o.id !== n), l.save());
    }
    function $e(n, t) {
      const o = a.value;
      if (!o) return;
      const s = n + t;
      if (s < 0 || s >= o.sections.length) return;
      const d = [...o.sections];
      [d[n], d[s]] = [d[s], d[n]], o.sections = d, l.save();
    }
    function ht(n) {
      n.from = String(n.value || "").trim() ? "manual" : "missing", l.save();
    }
    function De() {
      u.push("/knowledge");
    }
    async function Ce(n = !1) {
      const t = a.value;
      if (t && !(n && !window.confirm(r.t("手填的 {n} 项会被知识库里的值覆盖，确定吗？", { n: X.value })))) {
        l.start("company");
        try {
          const o = await h().companyProfile({
            projectId: t.id,
            requirements: t.notice?.requirements || [],
            manual: n ? [] : (t.company || []).filter((d) => d.from === "manual")
          });
          t.company = o?.fields || [], t.qualifications = o?.qualifications || [], A.value = o?.evidenceDocs || [], (o?.warnings || []).forEach((d) => p.warn(d)), l.save();
          const s = t.company.filter((d) => !String(d.value || "").trim()).length;
          l.done("company", s ? r.t("{n} 项资料还缺，先补上再往下写", { n: s }) : r.t("公司资料齐了 · {n} 条资格待核对", { n: t.qualifications.length }));
        } catch (o) {
          l.fail("company", o);
        }
      }
    }
    function St(n) {
      c.has(n) ? c.delete(n) : c.add(n);
    }
    function _t(n) {
      n.edited = !0, n.state = String(n.content || "").trim() ? "done" : "todo", n.wordCount = Be(String(n.content || "")), n.placeholders = Ue(String(n.content || "")), l.save();
    }
    function Be(n) {
      const t = n.trim();
      if (!t) return 0;
      const o = (t.match(/[一-龥]/g) || []).length, s = (t.replace(/[一-龥]/g, " ").match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
      return o + s;
    }
    async function Te(n) {
      const t = a.value, o = t?.sections.find((s) => s.id === n);
      if (!t || !o) return !1;
      o.state = "running", o.error = void 0, C.value = o.title;
      try {
        const s = await h().sectionCompose({ projectId: t.id, sectionId: n, instruction: m[n] || void 0 });
        if (!s?.ok) throw new Error(s?.error || r.t("生成失败"));
        return o.content = s.content, o.placeholders = s.placeholders || [], o.wordCount = s.wordCount, o.state = "done", o.edited = !1, o.updatedAt = Date.now(), l.save(), !0;
      } catch (s) {
        return o.state = "failed", o.error = $(s), l.save(), !1;
      }
    }
    async function $t() {
      const n = a.value;
      if (!n) return;
      ce = !1, k.value = !0, l.start("compose");
      let t = 0, o = 0;
      try {
        for (const d of n.sections) {
          if (ce) break;
          if (d.edited && String(d.content || "").trim() || String(d.content || "").trim() && d.state === "done") continue;
          await Te(d.id) ? t += 1 : o += 1;
        }
        o ? l.fail("compose", r.t("{ok} 章写好，{failed} 章失败（失败原因写在对应章节上）", { ok: t, failed: o })) : l.done("compose", r.t("{ok} 章写好，共 {total} 章", { ok: ue.value, total: n.sections.length }));
        const s = new Set(n.sections.flatMap((d) => d.placeholders || [])).size;
        s && (p.warn(r.t("有 {n} 项信息需要你填写（报价、工期、证书编号这类 AI 不能编），已列在「需要你填写的信息」里。", { n: s })), ee("compose"));
      } finally {
        k.value = !1, C.value = "", await l.saveNow();
      }
    }
    function Dt() {
      ce = !0;
    }
    async function Ae(n, t) {
      const o = a.value;
      if (!(!o || G.value)) {
        G.value = !0;
        try {
          let s = 0;
          for (const d of o.sections) {
            const W = String(d.content || "");
            if (!W) continue;
            let P = W;
            for (const [Lt, Ut] of Object.entries(n))
              P = P.replace(Ge(Lt), () => (s += 1, Ut));
            P !== W && (d.content = P, d.placeholders = Ue(P), d.wordCount = Be(P), d.edited = !0);
          }
          await l.saveNow(), t && await je(n), p.success(r.t("已回填 {n} 处", { n: s })), o.sections.some((d) => (d.placeholders?.length || 0) > 0) && p.warn(r.t("还有占位没填完，导出正式件前需要清空。"));
        } catch (s) {
          p.error($(s));
        } finally {
          G.value = !1;
        }
      }
    }
    async function Ct() {
      const n = a.value;
      if (!(!n || H.value)) {
        H.value = !0;
        try {
          const t = {};
          for (const o of n.company || []) {
            if (o.from !== "manual") continue;
            const s = String(o.value || "").trim();
            s && (t[o.label] = s);
          }
          if (!Object.keys(t).length) {
            p.warn(r.t("没有手填的内容"));
            return;
          }
          await je(t), p.success(r.t("已存入知识图谱 {n} 项", { n: Object.keys(t).length }));
        } catch (t) {
          p.error($(t));
        } finally {
          H.value = !1;
        }
      }
    }
    async function je(n) {
      const t = window.electronAPI?.knowledge;
      if (t?.saveFact)
        for (const [o, s] of Object.entries(n))
          try {
            await t.saveFact({ label: o, value: s, confirmed: !0 });
          } catch {
          }
    }
    function Bt(n) {
      return (a.value?.complianceAcks || []).includes(n);
    }
    async function Tt(n) {
      const t = a.value;
      if (t) {
        t.complianceAcks = [.../* @__PURE__ */ new Set([...t.complianceAcks || [], n])];
        try {
          await l.saveNow(), await le(!0);
        } catch (o) {
          p.error($(o));
        }
      }
    }
    async function At(n) {
      const t = a.value;
      if (t) {
        t.complianceAcks = (t.complianceAcks || []).filter((o) => o !== n);
        try {
          await l.saveNow(), await le(!0);
        } catch (o) {
          p.error($(o));
        }
      }
    }
    function jt() {
      a.value?.compliance?.length && (I && window.clearTimeout(I), I = window.setTimeout(() => {
        I = null, le(!0);
      }, 900));
    }
    e.watch(
      () => {
        const n = a.value;
        return n ? [
          n.qualifications.map((t) => t.verdict).join(","),
          n.sections.map((t) => `${t.state}:${(t.placeholders || []).length}:${t.wordCount || 0}`).join("|"),
          n.company.map((t) => String(t.value || "").trim() ? 1 : 0).join(""),
          n.notice?.bidDeadline || "",
          (n.complianceAcks || []).join(",")
        ].join("#") : "";
      },
      () => jt()
    );
    async function le(n = !1) {
      const t = a.value;
      if (!(!t || ne.value)) {
        ne.value = !0, n || l.start("review");
        try {
          await l.saveNow();
          const o = await h().complianceCheck({ projectId: t.id });
          if (t.compliance = o?.items || [], l.save(), n) return;
          o?.blocked ? l.fail("review", r.t("有阻断项，先处理完才能导正式件")) : l.done("review", r.t("自检通过，可以导出正式件"));
        } catch (o) {
          n || l.fail("review", o);
        } finally {
          ne.value = !1;
        }
      }
    }
    async function Le(n) {
      const t = a.value;
      if (t) {
        l.start("review");
        try {
          await l.saveNow();
          const o = await h().exportPackage({ projectId: t.id, draft: n, formats: ["docx", "pdf", "checklist"] });
          if (!o?.ok) throw new Error(o?.error || r.t("导出失败"));
          const s = Date.now();
          t.exports = [...(o.paths || []).map((d) => ({ path: d, kind: d.split(".").pop() || "", at: s, draft: n })), ...t.exports].slice(0, 30), await l.saveNow(), l.done("review", n ? r.t("草稿件已导出（{n} 个文件）", { n: o.paths?.length || 0 }) : r.t("正式件已导出（{n} 个文件）", { n: o.paths?.length || 0 }));
        } catch (o) {
          l.fail("review", o);
        }
      }
    }
    return (n, t) => (e.openBlock(), e.createElementBlock("div", $n, [
      e.createElementVNode("header", Dn, [
        e.createVNode(Kt),
        e.createElementVNode("div", Cn, [
          e.createElementVNode("p", Bn, [
            t[43] || (t[43] = e.createElementVNode(
              "i",
              { class: "ri-draft-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("招投标 · 项目工作台")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "h1",
            null,
            e.toDisplayString(n.$t("智能标书助手")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            Tn,
            e.toDisplayString(n.$t("填投标目标与目标投标网站，自动抓公告并拆成逐条要求；标书模板可以上传，不上传就从知识库里找；公司资料取自知识库，逐章成文后做废标风险自检，最后导出 Word / PDF 正式件。")),
            1
            /* TEXT */
          )
        ]),
        t[44] || (t[44] = e.createElementVNode(
          "div",
          { class: "bw-hero__actions" },
          null,
          -1
          /* CACHED */
        ))
      ]),
      e.createElementVNode("div", An, [
        e.createElementVNode(
          "span",
          jn,
          e.toDisplayString(n.$t("当前项目")),
          1
          /* TEXT */
        ),
        e.createElementVNode("select", {
          value: e.unref(l).state.value.currentId,
          disabled: f.value,
          onChange: ot
        }, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(l).state.value.projects, (o) => (e.openBlock(), e.createElementBlock("option", {
              key: o.id,
              value: o.id
            }, e.toDisplayString(o.name) + e.toDisplayString(o.notice?.projectCode ? ` · ${o.notice.projectCode}` : ""), 9, Un))),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 40, Ln),
        e.createElementVNode("button", {
          type: "button",
          class: "bw-btn sm",
          disabled: f.value,
          onClick: lt
        }, [
          t[45] || (t[45] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("新建项目")),
            1
            /* TEXT */
          )
        ], 8, Kn),
        e.createElementVNode("button", {
          type: "button",
          class: "bw-btn sm danger",
          disabled: f.value || e.unref(l).state.value.projects.length <= 1,
          onClick: at
        }, [
          t[46] || (t[46] = e.createElementVNode(
            "i",
            { class: "ri-delete-bin-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("删除")),
            1
            /* TEXT */
          )
        ], 8, In),
        e.unref(a) ? (e.openBlock(), e.createElementBlock(
          "span",
          xn,
          e.toDisplayString(n.$t("更新于 {t}", { t: e.unref(Fe)(e.unref(a).updatedAt) })),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("div", Rn, [
        e.createElementVNode("span", On, [
          t[47] || (t[47] = e.createElementVNode(
            "i",
            { class: "ri-folder-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("标书存放位置")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("code", {
          class: "bw-mono bw-path",
          title: e.unref(l).docRoot.value,
          dir: "ltr"
        }, e.toDisplayString(e.unref(l).docRoot.value || n.$t("（读取中）")), 9, Mn),
        e.createElementVNode("button", {
          type: "button",
          class: "bw-btn sm",
          disabled: f.value,
          onClick: et
        }, [
          t[48] || (t[48] = e.createElementVNode(
            "i",
            { class: "ri-folder-settings-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("更换位置")),
            1
            /* TEXT */
          )
        ], 8, Fn),
        e.createElementVNode("button", {
          type: "button",
          class: "bw-btn sm",
          disabled: !e.unref(l).docRoot.value,
          onClick: t[0] || (t[0] = (o) => e.unref(Y.openPath)(Ye.value || e.unref(l).docRoot.value, !0))
        }, [
          t[49] || (t[49] = e.createElementVNode(
            "i",
            { class: "ri-folder-open-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("打开目录")),
            1
            /* TEXT */
          )
        ], 8, Wn),
        Qe.value ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "bw-btn sm",
          disabled: f.value,
          onClick: tt
        }, [
          t[50] || (t[50] = e.createElementVNode(
            "i",
            { class: "ri-arrow-go-back-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("恢复默认")),
            1
            /* TEXT */
          )
        ], 8, Pn)) : e.createCommentVNode("v-if", !0),
        e.createElementVNode(
          "span",
          qn,
          e.toDisplayString(n.$t("生成的 Word / PDF / 自检表按项目名建子目录放这里；换位置只影响以后导出的文件。")),
          1
          /* TEXT */
        )
      ]),
      e.createCommentVNode(" 手填内容要不要沉淀成知识 —— 页面级开关，第 4 步的公司资料与第 5/6 步的缺料表都按它走 "),
      e.createElementVNode("div", zn, [
        e.createElementVNode("span", Gn, [
          t[51] || (t[51] = e.createElementVNode(
            "i",
            { class: "ri-database-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("我手填的信息")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: e.normalizeClass(["bw-chip", { on: x.value }]),
          title: n.$t("打开：手填的公司资料与缺料内容写进知识图谱，以后新项目自动带出；关闭：只在本次标书里生效。"),
          onClick: t[1] || (t[1] = (o) => ie(!x.value))
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(x.value ? "ri-toggle-fill" : "ri-toggle-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            " " + e.toDisplayString(x.value ? n.$t("存入知识图谱（以后自动带出）") : n.$t("仅本次有效（不进知识图谱）")),
            1
            /* TEXT */
          )
        ], 10, Hn),
        e.createElementVNode(
          "span",
          Jn,
          e.toDisplayString(x.value ? n.$t("报价、工期这类一次性的信息建议关掉，免得污染知识库。") : n.$t("公司名称、资质编号这类下次还要用的，建议打开存下来。")),
          1
          /* TEXT */
        )
      ]),
      e.unref(l).llmReady.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Xn, [
        t[52] || (t[52] = e.createElementVNode(
          "i",
          { class: "ri-alert-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(n.$t("还没配置 AI 大脑：公告抽取只能走规则，逐章成文不可用。到「设置 → 模型配置」配好后回来重试。")),
          1
          /* TEXT */
        )
      ])),
      e.createVNode(Wt, {
        metas: e.unref(l).metas,
        runtime: e.unref(l).runtime,
        "current-key": e.unref(l).currentKey.value,
        live: e.unref(l).live.value,
        onJump: e.unref(ee)
      }, null, 8, ["metas", "runtime", "current-key", "live", "onJump"]),
      e.unref(a) ? (e.openBlock(), e.createElementBlock("div", Zn, [
        e.createCommentVNode(" ── 第 1 步：项目与投标目标 ── "),
        e.createVNode(q, {
          "step-key": "project",
          index: 0,
          title: e.unref(l).metas[0].title,
          hint: e.unref(l).metas[0].hint,
          icon: e.unref(l).metas[0].icon,
          runtime: e.unref(l).runtime.project,
          "is-current": e.unref(l).currentKey.value === "project"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Qn, [
              e.createElementVNode("label", Yn, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("项目名称")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": t[2] || (t[2] = (o) => e.unref(a).name = o),
                  type: "text",
                  placeholder: n.$t("例：某某局智慧园区平台建设项目"),
                  onChange: t[3] || (t[3] = (o) => e.unref(l).save())
                }, null, 40, eo), [
                  [e.vModelText, e.unref(a).name]
                ])
              ]),
              e.createElementVNode("label", to, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("投标人（我方公司）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("span", no, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": t[4] || (t[4] = (o) => e.unref(a).bidder = o),
                    type: "text",
                    placeholder: e.unref(l).defaultBidder.value || n.$t("填我方公司全称，或从知识库带出"),
                    onChange: t[5] || (t[5] = (o) => e.unref(l).save())
                  }, null, 40, oo), [
                    [e.vModelText, e.unref(a).bidder]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "bw-btn sm",
                    disabled: te.value,
                    title: n.$t("从知识库读取公司名称"),
                    onClick: nt
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(te.value ? "ri-loader-4-line bw-spin" : "ri-database-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("从知识库带出")),
                      1
                      /* TEXT */
                    )
                  ], 8, lo)
                ])
              ]),
              e.createElementVNode("label", ao, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("标书语言")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": t[6] || (t[6] = (o) => e.unref(a).lang = o),
                    onChange: t[7] || (t[7] = (o) => e.unref(l).save())
                  },
                  [
                    e.createElementVNode(
                      "option",
                      ro,
                      e.toDisplayString(n.$t("简体中文")),
                      1
                      /* TEXT */
                    ),
                    t[53] || (t[53] = e.createElementVNode(
                      "option",
                      { value: "en-US" },
                      "English",
                      -1
                      /* CACHED */
                    )),
                    t[54] || (t[54] = e.createElementVNode(
                      "option",
                      { value: "ar" },
                      "العربية",
                      -1
                      /* CACHED */
                    ))
                  ],
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [e.vModelSelect, e.unref(a).lang]
                ])
              ]),
              e.createElementVNode("label", so, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("目标投标网站")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": t[8] || (t[8] = (o) => e.unref(a).siteUrl = o),
                    type: "url",
                    placeholder: "https://",
                    dir: "ltr",
                    onChange: t[9] || (t[9] = (o) => e.unref(l).save())
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [e.vModelText, e.unref(a).siteUrl]
                ])
              ]),
              e.createElementVNode("label", io, [
                e.createElementVNode("span", co, [
                  e.createTextVNode(
                    e.toDisplayString(n.$t("投标目标（想靠什么赢下这一标，会直接进写作要求）")) + " ",
                    1
                    /* TEXT */
                  ),
                  M.value ? (e.openBlock(), e.createElementBlock("em", uo, [
                    t[55] || (t[55] = e.createElementVNode(
                      "i",
                      { class: "ri-loader-4-line bw-spin" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("先给了一版草稿，AI 正在润色…")),
                      1
                      /* TEXT */
                    )
                  ])) : F.value ? (e.openBlock(), e.createElementBlock(
                    "em",
                    mo,
                    e.toDisplayString(n.$t("大脑不可用，这句是本地拼的，请自行修改")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.unref(a).strategies.length ? (e.openBlock(), e.createElementBlock("button", {
                    key: 2,
                    type: "button",
                    class: "bw-btn sm",
                    disabled: M.value,
                    onClick: t[10] || (t[10] = (o) => Ee(!0))
                  }, [
                    t[56] || (t[56] = e.createElementVNode(
                      "i",
                      { class: "ri-quill-pen-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(e.unref(a).goal.trim() ? n.$t("按所选侧重重写") : n.$t("生成目标")),
                      1
                      /* TEXT */
                    )
                  ], 8, po)) : e.createCommentVNode("v-if", !0)
                ]),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": t[11] || (t[11] = (o) => e.unref(a).goal = o),
                  rows: "3",
                  placeholder: n.$t("点下面的侧重标签会自动写一段；也可以直接自己写。"),
                  onChange: st
                }, null, 40, vo), [
                  [e.vModelText, e.unref(a).goal]
                ])
              ])
            ]),
            pe.value ? (e.openBlock(), e.createElementBlock("p", fo, [
              t[58] || (t[58] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(pe.value),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn sm",
                onClick: De
              }, [
                t[57] || (t[57] = e.createElementVNode(
                  "i",
                  { class: "ri-book-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("去知识库")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", bo, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(j), (o) => (e.openBlock(), e.createElementBlock("button", {
                  key: o.key,
                  type: "button",
                  class: e.normalizeClass(["bw-chip", { on: e.unref(a).strategies.includes(o.label) }]),
                  disabled: M.value,
                  onClick: (s) => rt(o.label)
                }, e.toDisplayString(o.label), 11, go))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("p", yo, [
              t[59] || (t[59] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(L.value ? n.$t("目标已被你改过，点标签不会再覆盖；要按新选的侧重重写，点上面的「按所选侧重重写」。") : n.$t("点标签即按所选侧重自动写一段目标；自己改过之后就不会再被覆盖。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Vo, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value,
                onClick: ct
              }, [
                t[60] || (t[60] = e.createElementVNode(
                  "i",
                  { class: "ri-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("确认，进入下一步")),
                  1
                  /* TEXT */
                )
              ], 8, No)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "icon", "runtime", "is-current"]),
        e.createCommentVNode(" ── 第 2 步：招标公告 ── "),
        e.createVNode(q, {
          "step-key": "notice",
          index: 1,
          title: e.unref(l).metas[1].title,
          hint: e.unref(l).metas[1].hint,
          icon: e.unref(l).metas[1].icon,
          runtime: e.unref(l).runtime.notice,
          "is-current": e.unref(l).currentKey.value === "notice"
        }, {
          tools: e.withCtx(() => [
            J.value.length ? (e.openBlock(), e.createElementBlock("span", wo, [
              t[61] || (t[61] = e.createElementVNode(
                "i",
                { class: "ri-list-check-2" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("{n} 条要求", { n: J.value.length })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          default: e.withCtx(() => [
            e.createElementVNode("div", ko, [
              e.createElementVNode("label", Eo, [
                e.createElementVNode("span", ho, [
                  e.createTextVNode(
                    e.toDisplayString(n.$t("按投标目标检索招标公告")) + " ",
                    1
                    /* TEXT */
                  ),
                  V.value ? (e.openBlock(), e.createElementBlock("em", So, [
                    t[62] || (t[62] = e.createElementVNode(
                      "i",
                      { class: "ri-loader-4-line bw-spin" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("检索中…")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("span", _o, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": t[12] || (t[12] = (o) => D.value = o),
                    type: "text",
                    placeholder: n.$t("关键词，留空按项目名与投标目标自动取（可加地区、采购人）"),
                    onKeyup: e.withKeys(he, ["enter"])
                  }, null, 40, $o), [
                    [e.vModelText, D.value]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "bw-btn primary",
                    disabled: V.value,
                    onClick: he
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(V.value ? "ri-loader-4-line bw-spin" : "ri-search-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("检索公告")),
                      1
                      /* TEXT */
                    )
                  ], 8, Do)
                ])
              ])
            ]),
            y.value.length ? (e.openBlock(), e.createElementBlock("div", Co, [
              e.createElementVNode("header", Bo, [
                e.createElementVNode("strong", null, [
                  t[63] || (t[63] = e.createElementVNode(
                    "i",
                    { class: "ri-list-check" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("检索到 {n} 条公告", { n: y.value.length })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "span",
                  To,
                  e.toDisplayString(n.$t("关键词：{k}", { k: b.value })),
                  1
                  /* TEXT */
                ),
                t[64] || (t[64] = e.createElementVNode(
                  "span",
                  { class: "grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                g.value === "browser" ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Ao,
                  e.toDisplayString(n.$t("内置浏览器检索")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("div", jo, [
                e.createElementVNode("table", Lo, [
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(y.value, (o) => (e.openBlock(), e.createElementBlock("tr", {
                        key: o.url
                      }, [
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(o.title),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("div", Uo, [
                            e.createTextVNode(
                              e.toDisplayString(o.source),
                              1
                              /* TEXT */
                            ),
                            o.publishedAt ? (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              { key: 0 },
                              [
                                e.createTextVNode(
                                  " · " + e.toDisplayString(o.publishedAt),
                                  1
                                  /* TEXT */
                                )
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            )) : e.createCommentVNode("v-if", !0)
                          ]),
                          o.snippet ? (e.openBlock(), e.createElementBlock(
                            "div",
                            Ko,
                            e.toDisplayString(o.snippet),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", Io, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm primary",
                            disabled: f.value,
                            onClick: (s) => dt(o)
                          }, [
                            t[65] || (t[65] = e.createElementVNode(
                              "i",
                              { class: "ri-download-cloud-2-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(n.$t("用这条并抓取")),
                              1
                              /* TEXT */
                            )
                          ], 8, xo),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm",
                            onClick: (s) => ut(o.url)
                          }, [
                            t[66] || (t[66] = e.createElementVNode(
                              "i",
                              { class: "ri-external-link-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(n.$t("先看看")),
                              1
                              /* TEXT */
                            )
                          ], 8, Ro)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : v.value ? (e.openBlock(), e.createElementBlock("p", Oo, [
              t[67] || (t[67] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(v.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", Mo, [
              e.createElementVNode("label", Fo, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("招标公告网址")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": t[13] || (t[13] = (o) => e.unref(a).siteUrl = o),
                    type: "url",
                    placeholder: "https://",
                    dir: "ltr",
                    onChange: t[14] || (t[14] = (o) => e.unref(l).save())
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [e.vModelText, e.unref(a).siteUrl]
                ])
              ])
            ]),
            e.createElementVNode("div", Wo, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value || !e.unref(a).siteUrl.trim(),
                onClick: Se
              }, [
                t[68] || (t[68] = e.createElementVNode(
                  "i",
                  { class: "ri-download-cloud-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("抓取公告")),
                  1
                  /* TEXT */
                )
              ], 8, Po),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: f.value || !e.unref(a).siteUrl.trim(),
                onClick: pt
              }, [
                t[69] || (t[69] = e.createElementVNode(
                  "i",
                  { class: "ri-login-box-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("先去登录这个网站")),
                  1
                  /* TEXT */
                )
              ], 8, qo),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: f.value,
                onClick: vt
              }, [
                t[70] || (t[70] = e.createElementVNode(
                  "i",
                  { class: "ri-file-upload-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("上传招标文件")),
                  1
                  /* TEXT */
                )
              ], 8, zo),
              t[72] || (t[72] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value || N.value.trim().length < 100,
                onClick: _e
              }, [
                t[71] || (t[71] = e.createElementVNode(
                  "i",
                  { class: "ri-scan-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("抽取招标要点")),
                  1
                  /* TEXT */
                )
              ], 8, Go)
            ]),
            e.createElementVNode("p", Ho, [
              t[73] || (t[73] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                " " + e.toDisplayString(n.$t("要登录才能看的招标平台：先点「先去登录这个网站」，在内置浏览器里登录一次，抓取会复用同一份登录状态。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("label", Jo, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(n.$t("公告正文（可直接粘贴或修改）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("textarea", {
                "onUpdate:modelValue": t[15] || (t[15] = (o) => N.value = o),
                rows: "8",
                placeholder: n.$t("抓取或上传后正文会出现在这里；也可以直接把公告全文粘进来。"),
                onChange: mt
              }, null, 40, Xo), [
                [e.vModelText, N.value]
              ])
            ]),
            w.value.length ? (e.openBlock(), e.createElementBlock("div", Zo, [
              t[74] || (t[74] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(w.value.join(`
`)),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            He.value ? (e.openBlock(), e.createElementBlock("p", Qo, [
              t[76] || (t[76] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                " " + e.toDisplayString(n.$t("下面这些要点看着不像正经字段（多半是早先版本抽的）。解析器已升级，点「抽取招标要点」重跑一次即可。")) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn sm",
                disabled: f.value || N.value.trim().length < 100,
                onClick: _e
              }, [
                t[75] || (t[75] = e.createElementVNode(
                  "i",
                  { class: "ri-refresh-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("重新抽取")),
                  1
                  /* TEXT */
                )
              ], 8, Yo)
            ])) : e.createCommentVNode("v-if", !0),
            Je.value ? (e.openBlock(), e.createElementBlock("div", el, [
              e.createElementVNode("header", tl, [
                e.createElementVNode("strong", null, [
                  t[77] || (t[77] = e.createElementVNode(
                    "i",
                    { class: "ri-profile-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("公告要点（抓错了可以直接改）")),
                    1
                    /* TEXT */
                  )
                ]),
                t[78] || (t[78] = e.createElementVNode(
                  "span",
                  { class: "grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.unref(a).notice.url ? (e.openBlock(), e.createElementBlock("a", {
                  key: 0,
                  class: "bw-muted bw-mono",
                  href: e.unref(a).notice.url,
                  target: "_blank",
                  rel: "noreferrer"
                }, e.toDisplayString(e.unref(a).notice.url), 9, nl)) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("div", ol, [
                e.createElementVNode("div", ll, [
                  e.createElementVNode("label", al, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("采购人")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": t[16] || (t[16] = (o) => e.unref(a).notice.buyer = o),
                        type: "text",
                        onChange: t[17] || (t[17] = (o) => e.unref(l).save())
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [e.vModelText, e.unref(a).notice.buyer]
                    ])
                  ]),
                  e.createElementVNode("label", rl, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("代理机构")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": t[18] || (t[18] = (o) => e.unref(a).notice.agency = o),
                        type: "text",
                        onChange: t[19] || (t[19] = (o) => e.unref(l).save())
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [e.vModelText, e.unref(a).notice.agency]
                    ])
                  ]),
                  e.createElementVNode("label", sl, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("招标编号")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": t[20] || (t[20] = (o) => e.unref(a).notice.projectCode = o),
                        type: "text",
                        onChange: t[21] || (t[21] = (o) => e.unref(l).save())
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [e.vModelText, e.unref(a).notice.projectCode]
                    ])
                  ]),
                  e.createElementVNode("label", il, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("预算金额")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": t[22] || (t[22] = (o) => e.unref(a).notice.budget = o),
                        type: "text",
                        onChange: t[23] || (t[23] = (o) => e.unref(l).save())
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [e.vModelText, e.unref(a).notice.budget]
                    ])
                  ]),
                  e.createElementVNode("label", cl, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("投标保证金")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": t[24] || (t[24] = (o) => e.unref(a).notice.deposit = o),
                        type: "text",
                        onChange: t[25] || (t[25] = (o) => e.unref(l).save())
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [e.vModelText, e.unref(a).notice.deposit]
                    ])
                  ]),
                  e.createElementVNode("label", dl, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("投标截止时间")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": t[26] || (t[26] = (o) => e.unref(a).notice.bidDeadline = o),
                        type: "text",
                        onChange: t[27] || (t[27] = (o) => e.unref(l).save())
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [e.vModelText, e.unref(a).notice.bidDeadline]
                    ])
                  ]),
                  e.createElementVNode("label", ul, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("开标时间")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": t[28] || (t[28] = (o) => e.unref(a).notice.openAt = o),
                        type: "text",
                        onChange: t[29] || (t[29] = (o) => e.unref(l).save())
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [e.vModelText, e.unref(a).notice.openAt]
                    ])
                  ]),
                  e.createElementVNode("label", ml, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(n.$t("联系方式")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": t[30] || (t[30] = (o) => e.unref(a).notice.contact = o),
                        type: "text",
                        onChange: t[31] || (t[31] = (o) => e.unref(l).save())
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [e.vModelText, e.unref(a).notice.contact]
                    ])
                  ])
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            e.unref(a).notice.attachments?.length ? (e.openBlock(), e.createElementBlock("div", pl, [
              e.createElementVNode("header", vl, [
                e.createElementVNode("strong", null, [
                  t[79] || (t[79] = e.createElementVNode(
                    "i",
                    { class: "ri-attachment-2" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("公告附件")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", fl, [
                e.createElementVNode("ul", bl, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(a).notice.attachments, (o) => (e.openBlock(), e.createElementBlock("li", {
                      key: o.url
                    }, [
                      e.createElementVNode("a", {
                        href: o.url,
                        target: "_blank",
                        rel: "noreferrer"
                      }, e.toDisplayString(o.name || o.url), 9, gl)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("p", yl, [
                  t[80] || (t[80] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("附件（招标文件正本）里通常写着投标文件格式，下载后可以在第 3 步当模板上传。")),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            J.value.length ? (e.openBlock(), e.createElementBlock("div", Vl, [
              e.createElementVNode("header", Nl, [
                e.createElementVNode("strong", null, [
                  t[81] || (t[81] = e.createElementVNode(
                    "i",
                    { class: "ri-list-check-2" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("逐条招标要求")),
                    1
                    /* TEXT */
                  )
                ]),
                t[83] || (t[83] = e.createElementVNode(
                  "span",
                  { class: "grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(Xe.value, (o) => (e.openBlock(), e.createElementBlock(
                    "span",
                    {
                      key: o.key,
                      class: "bw-chip static"
                    },
                    e.toDisplayString(o.label) + " " + e.toDisplayString(o.count),
                    1
                    /* TEXT */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "bw-btn sm",
                  onClick: ft
                }, [
                  t[82] || (t[82] = e.createElementVNode(
                    "i",
                    { class: "ri-add-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("手工补一条")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", wl, [
                e.createElementVNode("table", kl, [
                  e.createElementVNode("thead", null, [
                    e.createElementVNode("tr", null, [
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(n.$t("类型")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(n.$t("要求")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(n.$t("分值")),
                        1
                        /* TEXT */
                      ),
                      t[84] || (t[84] = e.createElementVNode(
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
                      e.renderList(J.value, (o) => (e.openBlock(), e.createElementBlock("tr", {
                        key: o.id
                      }, [
                        e.createElementVNode("td", El, [
                          e.withDirectives(e.createElementVNode("select", {
                            "onUpdate:modelValue": (s) => o.kind = s,
                            onChange: t[32] || (t[32] = (s) => e.unref(l).save())
                          }, [
                            (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(B, (s) => e.createElementVNode("option", {
                                key: s,
                                value: s
                              }, e.toDisplayString(e.unref(Me)(s)), 9, Sl)),
                              64
                              /* STABLE_FRAGMENT */
                            ))
                          ], 40, hl), [
                            [e.vModelSelect, o.kind]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("textarea", {
                            "onUpdate:modelValue": (s) => o.text = s,
                            rows: "2",
                            onChange: t[33] || (t[33] = (s) => e.unref(l).save())
                          }, null, 40, _l), [
                            [e.vModelText, o.text]
                          ])
                        ]),
                        e.createElementVNode(
                          "td",
                          $l,
                          e.toDisplayString(o.points ?? "—"),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", Dl, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm danger",
                            onClick: (s) => bt(o.id)
                          }, [...t[85] || (t[85] = [
                            e.createElementVNode(
                              "i",
                              { class: "ri-delete-bin-line" },
                              null,
                              -1
                              /* CACHED */
                            )
                          ])], 8, Cl)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "icon", "runtime", "is-current"]),
        e.createCommentVNode(" ── 第 3 步：标书模板 ── "),
        e.createVNode(q, {
          "step-key": "template",
          index: 2,
          title: e.unref(l).metas[2].title,
          hint: e.unref(l).metas[2].hint,
          icon: e.unref(l).metas[2].icon,
          runtime: e.unref(l).runtime.template,
          "is-current": e.unref(l).currentKey.value === "template"
        }, {
          tools: e.withCtx(() => [
            e.unref(a).template ? (e.openBlock(), e.createElementBlock("span", Bl, [
              t[86] || (t[86] = e.createElementVNode(
                "i",
                { class: "ri-file-text-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(e.unref(a).template.name),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          default: e.withCtx(() => [
            e.createElementVNode("div", Tl, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value,
                onClick: gt
              }, [
                t[87] || (t[87] = e.createElementVNode(
                  "i",
                  { class: "ri-upload-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("上传标书模板")),
                  1
                  /* TEXT */
                )
              ], 8, Al),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: f.value,
                onClick: yt
              }, [
                t[88] || (t[88] = e.createElementVNode(
                  "i",
                  { class: "ri-search-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("从知识库里找模板")),
                  1
                  /* TEXT */
                )
              ], 8, jl),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: f.value,
                onClick: Nt
              }, [
                t[89] || (t[89] = e.createElementVNode(
                  "i",
                  { class: "ri-list-ordered" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("用内置标准大纲")),
                  1
                  /* TEXT */
                )
              ], 8, Ll)
            ]),
            e.createElementVNode("p", Ul, [
              t[90] || (t[90] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                " " + e.toDisplayString(n.$t("招标文件里规定了投标文件格式的，务必上传那一份 —— 章节顺序和名称按它来，评审时不会因为格式丢分。")),
                1
                /* TEXT */
              )
            ]),
            S.value.length ? (e.openBlock(), e.createElementBlock("div", Kl, [
              e.createElementVNode("header", Il, [
                e.createElementVNode("strong", null, [
                  t[91] || (t[91] = e.createElementVNode(
                    "i",
                    { class: "ri-folder-search-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("知识库里的候选模板")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", xl, [
                e.createElementVNode("table", Rl, [
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(S.value, (o) => (e.openBlock(), e.createElementBlock("tr", {
                        key: o.docId
                      }, [
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(o.name),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          Ol,
                          e.toDisplayString(o.reason),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", Ml, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm primary",
                            disabled: f.value,
                            onClick: (s) => Vt(o.docId)
                          }, e.toDisplayString(n.$t("用这份")), 9, Fl)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : _.value ? (e.openBlock(), e.createElementBlock("p", Wl, [
              t[92] || (t[92] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(_.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.unref(a).sections.length ? (e.openBlock(), e.createElementBlock("div", Pl, [
              e.createElementVNode("header", ql, [
                e.createElementVNode("strong", null, [
                  t[93] || (t[93] = e.createElementVNode(
                    "i",
                    { class: "ri-list-ordered" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("章节大纲（{n} 章，可增删改）", { n: e.unref(a).sections.length })),
                    1
                    /* TEXT */
                  )
                ]),
                t[96] || (t[96] = e.createElementVNode(
                  "span",
                  { class: "grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("button", {
                  type: "button",
                  class: "bw-btn sm",
                  onClick: kt
                }, [
                  t[94] || (t[94] = e.createElementVNode(
                    "i",
                    { class: "ri-add-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("加一章")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  class: "bw-btn sm primary",
                  disabled: f.value,
                  onClick: wt
                }, [
                  t[95] || (t[95] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("大纲就这样")),
                    1
                    /* TEXT */
                  )
                ], 8, zl)
              ]),
              e.createElementVNode("div", Gl, [
                e.createElementVNode("div", Hl, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(a).sections, (o, s) => (e.openBlock(), e.createElementBlock("div", {
                      key: o.id,
                      class: "bw-section"
                    }, [
                      e.createElementVNode("div", Jl, [
                        e.withDirectives(e.createElementVNode("select", {
                          "onUpdate:modelValue": (d) => o.level = d,
                          class: "bw-btn sm",
                          onChange: t[34] || (t[34] = (d) => e.unref(l).save())
                        }, [
                          e.createElementVNode(
                            "option",
                            Zl,
                            e.toDisplayString(n.$t("一级")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            Ql,
                            e.toDisplayString(n.$t("二级")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            Yl,
                            e.toDisplayString(n.$t("三级")),
                            1
                            /* TEXT */
                          )
                        ], 40, Xl), [
                          [
                            e.vModelSelect,
                            o.level,
                            void 0,
                            { number: !0 }
                          ]
                        ]),
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (d) => o.title = d,
                          type: "text",
                          class: e.normalizeClass(["title", `lv${o.level}`]),
                          onChange: t[35] || (t[35] = (d) => e.unref(l).save())
                        }, null, 42, ea), [
                          [e.vModelText, o.title]
                        ]),
                        e.createElementVNode("label", ta, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (d) => o.required = d,
                            type: "checkbox",
                            onChange: t[36] || (t[36] = (d) => e.unref(l).save())
                          }, null, 40, na), [
                            [e.vModelCheckbox, o.required]
                          ]),
                          e.createTextVNode(
                            e.toDisplayString(n.$t("必备")),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "bw-btn sm",
                          disabled: s === 0,
                          onClick: (d) => $e(s, -1)
                        }, [...t[97] || (t[97] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-arrow-up-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, oa),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "bw-btn sm",
                          disabled: s === e.unref(a).sections.length - 1,
                          onClick: (d) => $e(s, 1)
                        }, [...t[98] || (t[98] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-arrow-down-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, la),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "bw-btn sm danger",
                          onClick: (d) => Et(o.id)
                        }, [...t[99] || (t[99] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-delete-bin-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, aa)
                      ]),
                      o.guide ? (e.openBlock(), e.createElementBlock("div", ra, [
                        e.createElementVNode("p", sa, [
                          t[100] || (t[100] = e.createElementVNode(
                            "i",
                            { class: "ri-quill-pen-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(o.guide),
                            1
                            /* TEXT */
                          )
                        ])
                      ])) : e.createCommentVNode("v-if", !0)
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
        }, 8, ["title", "hint", "icon", "runtime", "is-current"]),
        e.createCommentVNode(" ── 第 4 步：公司资料与资格自检 ── "),
        e.createVNode(q, {
          "step-key": "company",
          index: 3,
          title: e.unref(l).metas[3].title,
          hint: e.unref(l).metas[3].hint,
          icon: e.unref(l).metas[3].icon,
          runtime: e.unref(l).runtime.company,
          "is-current": e.unref(l).currentKey.value === "company"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", ia, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value,
                onClick: t[37] || (t[37] = (o) => Ce(!1))
              }, [
                t[101] || (t[101] = e.createElementVNode(
                  "i",
                  { class: "ri-database-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(e.unref(a).company.length ? n.$t("重新从知识库读取（保留我手填的）") : n.$t("从知识库读取公司资料")),
                  1
                  /* TEXT */
                )
              ], 8, ca),
              X.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "bw-btn",
                disabled: f.value,
                title: n.$t("把手填的值全部丢掉，一律用知识库里的"),
                onClick: t[38] || (t[38] = (o) => Ce(!0))
              }, [
                t[102] || (t[102] = e.createElementVNode(
                  "i",
                  { class: "ri-refresh-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("用知识库覆盖手填（{n} 项）", { n: X.value })),
                  1
                  /* TEXT */
                )
              ], 8, da)) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                onClick: De
              }, [
                t[103] || (t[103] = e.createElementVNode(
                  "i",
                  { class: "ri-book-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("去知识库补资料")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.unref(a).company.length ? (e.openBlock(), e.createElementBlock("div", ua, [
              e.createElementVNode("header", ma, [
                e.createElementVNode("strong", null, [
                  t[104] || (t[104] = e.createElementVNode(
                    "i",
                    { class: "ri-building-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("公司资料")),
                    1
                    /* TEXT */
                  )
                ]),
                t[105] || (t[105] = e.createElementVNode(
                  "span",
                  { class: "grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["bw-chip static", de.value ? "warn" : "ok"])
                  },
                  e.toDisplayString(de.value ? n.$t("缺 {n} 项", { n: de.value }) : n.$t("都齐了")),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              e.createElementVNode("div", pa, [
                e.createElementVNode("table", va, [
                  e.createElementVNode("thead", null, [
                    e.createElementVNode("tr", null, [
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(n.$t("字段")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(n.$t("值")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(n.$t("来源")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(a).company, (o) => (e.openBlock(), e.createElementBlock("tr", {
                        key: o.key
                      }, [
                        e.createElementVNode(
                          "td",
                          fa,
                          e.toDisplayString(o.label),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("textarea", {
                            "onUpdate:modelValue": (s) => o.value = s,
                            rows: "1",
                            onChange: (s) => ht(o)
                          }, null, 40, ba), [
                            [e.vModelText, o.value]
                          ])
                        ]),
                        e.createElementVNode("td", ga, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["bw-chip static", o.from === "missing" ? "bad" : o.from === "manual" ? "" : "ok"])
                            },
                            e.toDisplayString(o.from === "knowledge" ? n.$t("知识库") : o.from === "manual" ? n.$t("手填") : n.$t("缺")),
                            3
                            /* TEXT, CLASS */
                          ),
                          o.source?.label ? (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            { key: 0 },
                            [
                              e.createTextVNode(
                                e.toDisplayString(o.source.label),
                                1
                                /* TEXT */
                              )
                            ],
                            64
                            /* STABLE_FRAGMENT */
                          )) : e.createCommentVNode("v-if", !0)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            X.value ? (e.openBlock(), e.createElementBlock("p", ya, [
              t[106] || (t[106] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                " " + e.toDisplayString(n.$t("你手填了 {n} 项公司资料。", { n: X.value })) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn sm",
                disabled: H.value,
                onClick: Ct
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(H.value ? "ri-loader-4-line bw-spin" : "ri-database-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(n.$t("存进知识图谱（以后自动带出）")),
                  1
                  /* TEXT */
                )
              ], 8, Va)
            ])) : e.createCommentVNode("v-if", !0),
            e.unref(a).qualifications.length ? (e.openBlock(), e.createElementBlock("div", Na, [
              e.createElementVNode("header", wa, [
                e.createElementVNode("strong", null, [
                  t[107] || (t[107] = e.createElementVNode(
                    "i",
                    { class: "ri-shield-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("资格门槛逐条核对")),
                    1
                    /* TEXT */
                  )
                ]),
                t[108] || (t[108] = e.createElementVNode(
                  "span",
                  { class: "grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                Ve.value ? (e.openBlock(), e.createElementBlock(
                  "span",
                  ka,
                  e.toDisplayString(n.$t("{n} 条不满足", { n: Ve.value })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                Ne.value ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Ea,
                  e.toDisplayString(n.$t("{n} 条待确认", { n: Ne.value })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("div", ha, [
                e.createElementVNode("table", Sa, [
                  e.createElementVNode("thead", null, [
                    e.createElementVNode("tr", null, [
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(n.$t("资格要求")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(n.$t("结论")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(n.$t("依据")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(a).qualifications, (o) => (e.openBlock(), e.createElementBlock("tr", {
                        key: o.requirementId
                      }, [
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(o.text),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", _a, [
                          e.withDirectives(e.createElementVNode("select", {
                            "onUpdate:modelValue": (s) => o.verdict = s,
                            onChange: t[39] || (t[39] = (s) => e.unref(l).save())
                          }, [
                            e.createElementVNode(
                              "option",
                              Da,
                              e.toDisplayString(n.$t("满足")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "option",
                              Ca,
                              e.toDisplayString(n.$t("不满足")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "option",
                              Ba,
                              e.toDisplayString(n.$t("待确认")),
                              1
                              /* TEXT */
                            )
                          ], 40, $a), [
                            [e.vModelSelect, o.verdict]
                          ])
                        ]),
                        e.createElementVNode(
                          "td",
                          Ta,
                          e.toDisplayString(o.evidence || o.note || "—"),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]),
                e.createElementVNode("p", Aa, [
                  t[109] || (t[109] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("声明类条款（无违法记录、非关联投标这类）已自动判满足 —— 随标书出具承诺函即可；需要资质、业绩、报表等材料的条款只按知识库事实判断，拿不准一律标「待确认」，请人工过一遍。")),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            A.value.length ? (e.openBlock(), e.createElementBlock("div", ja, [
              e.createElementVNode("header", La, [
                e.createElementVNode("strong", null, [
                  t[110] || (t[110] = e.createElementVNode(
                    "i",
                    { class: "ri-file-list-3-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("可作证明材料的知识库文档")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", Ua, [
                e.createElementVNode("ul", Ka, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(A.value, (o) => (e.openBlock(), e.createElementBlock(
                      "li",
                      {
                        key: o.docId
                      },
                      e.toDisplayString(o.name) + " — " + e.toDisplayString(o.reason),
                      1
                      /* TEXT */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "icon", "runtime", "is-current"]),
        e.createCommentVNode(" ── 第 5 步：逐章成文 ── "),
        e.createVNode(q, {
          "step-key": "compose",
          index: 4,
          title: e.unref(l).metas[4].title,
          hint: e.unref(l).metas[4].hint,
          icon: e.unref(l).metas[4].icon,
          runtime: e.unref(l).runtime.compose,
          "is-current": e.unref(l).currentKey.value === "compose"
        }, {
          tools: e.withCtx(() => [
            e.createElementVNode(
              "span",
              Ia,
              e.toDisplayString(n.$t("{done} / {total} 章已完成", { done: ue.value, total: e.unref(a).sections.length })),
              1
              /* TEXT */
            ),
            we.value ? (e.openBlock(), e.createElementBlock(
              "span",
              xa,
              e.toDisplayString(n.$t("{n} 处待补充", { n: we.value })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          default: e.withCtx(() => [
            e.createVNode(Ke, {
              sections: e.unref(a).sections,
              busy: G.value,
              remember: x.value,
              onApply: Ae,
              "onUpdate:remember": ie
            }, null, 8, ["sections", "busy", "remember"]),
            e.createElementVNode("div", Ra, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value || !me.value,
                onClick: $t
              }, [
                t[111] || (t[111] = e.createElementVNode(
                  "i",
                  { class: "ri-quill-pen-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("按大纲逐章生成")),
                  1
                  /* TEXT */
                )
              ], 8, Oa),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: !k.value,
                onClick: Dt
              }, [
                t[112] || (t[112] = e.createElementVNode(
                  "i",
                  { class: "ri-stop-circle-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("停止")),
                  1
                  /* TEXT */
                )
              ], 8, Ma),
              t[113] || (t[113] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              k.value ? (e.openBlock(), e.createElementBlock(
                "span",
                Fa,
                e.toDisplayString(n.$t("正在写：{t}", { t: C.value })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            me.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Wa, [
              t[114] || (t[114] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("先完成前面几步：要有章节大纲，且 AI 大脑已配置。")),
                1
                /* TEXT */
              )
            ])),
            e.createElementVNode("div", Pa, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(a).sections, (o) => (e.openBlock(), e.createElementBlock(
                  "div",
                  {
                    key: o.id,
                    class: e.normalizeClass(["bw-section", `is-${o.state}`])
                  },
                  [
                    e.createElementVNode("div", qa, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["title", `lv${o.level}`])
                        },
                        e.toDisplayString(o.title),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["bw-chip static", o.state === "done" ? "ok" : o.state === "failed" ? "bad" : ""])
                        },
                        e.toDisplayString(e.unref(Sn)(o.state)),
                        3
                        /* TEXT, CLASS */
                      ),
                      o.wordCount ? (e.openBlock(), e.createElementBlock(
                        "span",
                        za,
                        e.toDisplayString(n.$t("{n} 字", { n: o.wordCount })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      o.edited ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Ga,
                        e.toDisplayString(n.$t("手工改过")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "bw-btn sm primary",
                        disabled: f.value || !me.value,
                        onClick: (s) => Te(o.id)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(o.state === "running" ? "ri-loader-4-line bw-spin" : "ri-quill-pen-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          " " + e.toDisplayString(o.content ? n.$t("重写") : n.$t("生成")),
                          1
                          /* TEXT */
                        )
                      ], 8, Ha),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "bw-btn sm",
                        onClick: (s) => St(o.id)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(c.has(o.id) ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(n.$t("正文")),
                          1
                          /* TEXT */
                        )
                      ], 8, Ja)
                    ]),
                    o.state === "failed" && o.error ? (e.openBlock(), e.createElementBlock("p", Xa, [
                      t[115] || (t[115] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(o.error),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    c.has(o.id) ? (e.openBlock(), e.createElementBlock("div", Za, [
                      o.guide ? (e.openBlock(), e.createElementBlock("p", Qa, [
                        t[116] || (t[116] = e.createElementVNode(
                          "i",
                          { class: "ri-quill-pen-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(o.guide),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("label", Ya, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(n.$t("重写意见（可空）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (s) => m[o.id] = s,
                          type: "text",
                          placeholder: n.$t("例：突出运维响应时效，补一段应急预案")
                        }, null, 8, er), [
                          [e.vModelText, m[o.id]]
                        ])
                      ]),
                      e.withDirectives(e.createElementVNode("textarea", {
                        "onUpdate:modelValue": (s) => o.content = s,
                        placeholder: n.$t("这一章还没有正文。点「生成」让 AI 按招标要求写，或者直接在这里手写。"),
                        onChange: (s) => _t(o)
                      }, null, 40, tr), [
                        [e.vModelText, o.content]
                      ]),
                      o.placeholders?.length ? (e.openBlock(), e.createElementBlock("div", nr, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(o.placeholders, (s) => (e.openBlock(), e.createElementBlock("span", {
                            key: s,
                            class: "bw-chip static warn"
                          }, [
                            t[117] || (t[117] = e.createElementVNode(
                              "i",
                              { class: "ri-error-warning-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(s),
                              1
                              /* TEXT */
                            )
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])) : e.createCommentVNode("v-if", !0)
                    ])) : e.createCommentVNode("v-if", !0)
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "icon", "runtime", "is-current"]),
        e.createCommentVNode(" ── 第 6 步：自检与导出 ── "),
        e.createVNode(q, {
          "step-key": "review",
          index: 5,
          title: e.unref(l).metas[5].title,
          hint: e.unref(l).metas[5].hint,
          icon: e.unref(l).metas[5].icon,
          runtime: e.unref(l).runtime.review,
          "is-current": e.unref(l).currentKey.value === "review"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", or, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value,
                onClick: t[40] || (t[40] = (o) => le(!1))
              }, [
                t[118] || (t[118] = e.createElementVNode(
                  "i",
                  { class: "ri-shield-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("运行投标前自检")),
                  1
                  /* TEXT */
                )
              ], 8, lr),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: f.value || !ke.value,
                onClick: t[41] || (t[41] = (o) => Le(!0))
              }, [
                t[119] || (t[119] = e.createElementVNode(
                  "i",
                  { class: "ri-file-download-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("导出草稿件")),
                  1
                  /* TEXT */
                )
              ], 8, ar),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value || !ke.value || oe.value,
                title: oe.value ? n.$t("先处理掉阻断项") : "",
                onClick: t[42] || (t[42] = (o) => Le(!1))
              }, [
                t[120] || (t[120] = e.createElementVNode(
                  "i",
                  { class: "ri-verified-badge-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("导出正式件")),
                  1
                  /* TEXT */
                )
              ], 8, rr)
            ]),
            e.createVNode(Ke, {
              sections: e.unref(a).sections,
              busy: G.value,
              remember: x.value,
              onApply: Ae,
              "onUpdate:remember": ie
            }, null, 8, ["sections", "busy", "remember"]),
            e.unref(a).compliance.length ? (e.openBlock(), e.createElementBlock("div", sr, [
              e.createElementVNode("header", ir, [
                e.createElementVNode("strong", null, [
                  t[121] || (t[121] = e.createElementVNode(
                    "i",
                    { class: "ri-list-check-3" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("自检结果")),
                    1
                    /* TEXT */
                  )
                ]),
                ne.value ? (e.openBlock(), e.createElementBlock("em", cr, [
                  t[122] || (t[122] = e.createElementVNode(
                    "i",
                    { class: "ri-loader-4-line bw-spin" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("重新自检中…")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                t[123] || (t[123] = e.createElementVNode(
                  "span",
                  { class: "grow" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["bw-chip static", oe.value ? "bad" : "ok"])
                  },
                  e.toDisplayString(oe.value ? n.$t("有阻断项，只能导草稿") : n.$t("可以导出正式件")),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              e.createElementVNode("div", dr, [
                e.createElementVNode("table", ur, [
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(a).compliance, (o) => (e.openBlock(), e.createElementBlock("tr", {
                        key: o.id
                      }, [
                        e.createElementVNode("td", mr, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["bw-chip static", o.level === "blocker" ? "bad" : o.level === "warning" ? "warn" : "ok"])
                            },
                            e.toDisplayString(e.unref(hn)(o.level)),
                            3
                            /* TEXT, CLASS */
                          )
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(o.title),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "div",
                            pr,
                            e.toDisplayString(o.detail),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("td", vr, [
                          o.stepKey ? (e.openBlock(), e.createElementBlock("button", {
                            key: 0,
                            type: "button",
                            class: "bw-btn sm",
                            onClick: (s) => e.unref(ee)(o.stepKey)
                          }, e.toDisplayString(n.$t("去处理")), 9, fr)) : e.createCommentVNode("v-if", !0),
                          o.level !== "ok" ? (e.openBlock(), e.createElementBlock("button", {
                            key: 1,
                            type: "button",
                            class: "bw-btn sm",
                            title: n.$t("我已核对过，这条不再阻断导出（自检表里仍会列出）"),
                            onClick: (s) => Tt(o.id)
                          }, [
                            t[124] || (t[124] = e.createElementVNode(
                              "i",
                              { class: "ri-checkbox-circle-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(n.$t("人工确认")),
                              1
                              /* TEXT */
                            )
                          ], 8, br)) : Bt(o.id) ? (e.openBlock(), e.createElementBlock("button", {
                            key: 2,
                            type: "button",
                            class: "bw-btn sm",
                            onClick: (s) => At(o.id)
                          }, [
                            t[125] || (t[125] = e.createElementVNode(
                              "i",
                              { class: "ri-arrow-go-back-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(n.$t("撤销确认")),
                              1
                              /* TEXT */
                            )
                          ], 8, gr)) : e.createCommentVNode("v-if", !0)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            e.unref(a).exports.length ? (e.openBlock(), e.createElementBlock("div", yr, [
              e.createElementVNode("header", Vr, [
                e.createElementVNode("strong", null, [
                  t[126] || (t[126] = e.createElementVNode(
                    "i",
                    { class: "ri-folder-download-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("已导出的文件")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("div", Nr, [
                e.createElementVNode("table", wr, [
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(a).exports, (o, s) => (e.openBlock(), e.createElementBlock("tr", {
                        key: `${o.path}_${s}`
                      }, [
                        e.createElementVNode(
                          "td",
                          kr,
                          e.toDisplayString(Ze(o.path)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", Er, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["bw-chip static", o.draft ? "warn" : "ok"])
                            },
                            e.toDisplayString(o.draft ? n.$t("草稿") : n.$t("正式")),
                            3
                            /* TEXT, CLASS */
                          )
                        ]),
                        e.createElementVNode(
                          "td",
                          hr,
                          e.toDisplayString(e.unref(Fe)(o.at)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", Sr, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm",
                            onClick: (d) => e.unref(Y.openPath)(o.path)
                          }, [
                            t[127] || (t[127] = e.createElementVNode(
                              "i",
                              { class: "ri-external-link-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(n.$t("打开")),
                              1
                              /* TEXT */
                            )
                          ], 8, _r),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm",
                            onClick: (d) => e.unref(Y.openPath)(o.path, !0)
                          }, [
                            t[128] || (t[128] = e.createElementVNode(
                              "i",
                              { class: "ri-folder-open-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(n.$t("所在文件夹")),
                              1
                              /* TEXT */
                            )
                          ], 8, $r)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "icon", "runtime", "is-current"])
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
});
export {
  Dr as default
};
