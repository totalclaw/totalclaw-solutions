const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const ge = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!ge) throw new Error("宿主模块未就绪：npm:vue-router");
ge.default;
const Ge = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!Ge) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Rt = Ge.default;
let Ke = 0;
const se = e.reactive({});
function Ot(s) {
  Ke += 1;
  const l = `stg${Ke}`;
  return se[l] = { active: s }, l;
}
function Mt(s) {
  delete se[s];
}
function Ie(s, l) {
  const c = se[s];
  c && l && (c.active = l);
}
function Ft(s) {
  for (let l = s?.parentElement ?? null; l; l = l.parentElement) {
    const c = l.querySelector(":scope [data-step-tabs]");
    if (c && !s.contains(c)) return c.getAttribute("data-step-tabs") || "";
  }
  return "";
}
const He = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/WorkbenchStepBar.vue"];
if (!He) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/WorkbenchStepBar.vue");
const Wt = He.default, re = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts"];
if (!re) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/composables/useStepWatchdog.ts");
re.default;
const r = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!r) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
r.default;
const Pt = ["aria-label", "data-step-tabs"], qt = { class: "bw-progress__meta" }, zt = {
  key: 1,
  class: "bw-progress__live ok"
}, Gt = {
  key: 2,
  class: "bw-progress__live bad"
}, Ht = 240, Jt = /* @__PURE__ */ e.defineComponent({
  __name: "BwProgress",
  props: {
    metas: {},
    runtime: {},
    currentKey: {},
    live: {}
  },
  emits: ["jump"],
  setup(s, { emit: l }) {
    const c = s, m = l, a = e.computed(() => Math.max(0, c.metas.findIndex((v) => v.key === c.currentKey))), f = e.computed(() => c.metas.filter((v) => c.runtime[v.key]?.state === "done").length), T = e.computed(() => {
      const v = c.metas.find((N) => c.runtime[N.key]?.state === "running");
      return v ? c.runtime[v.key] : null;
    }), w = e.computed(() => !!T.value), V = e.computed(() => c.metas.findIndex((v) => c.runtime[v.key]?.state === "failed")), k = re.useStepWatchdog({
      running: () => w.value,
      startedAt: () => T.value?.startedAt,
      estimateMs: () => Ht * 1e3,
      kind: "llm"
    });
    e.watch(() => c.live, (v) => {
      v && w.value && k.heartbeat();
    }, { deep: !0 });
    const C = e.computed(() => c.metas.map((v, N) => {
      const _ = c.runtime[v.key]?.state;
      return {
        id: N + 1,
        label: v.title,
        done: _ === "done",
        sub: _ === "running" ? k.suspect.value ? r.t("可能已超时") : r.t("进行中") : _ === "failed" ? r.t("失败") : void 0
      };
    })), b = e.ref(a.value + 1), y = Ot(c.metas[a.value]?.key || "");
    e.onBeforeUnmount(() => Mt(y)), e.watch(a, (v) => {
      b.value = v + 1, Ie(y, c.metas[v]?.key || "");
    });
    function g(v) {
      b.value = v, Ie(y, c.metas[v - 1]?.key || "");
      const N = c.metas[v - 1]?.key;
      N && m("jump", N);
    }
    const E = e.computed(() => {
      const v = k.elapsedSec.value, N = v >= 3 ? ` · ${re.formatStepDuration(v)}` : "";
      return k.suspect.value ? `${N} · ${r.t("可能已超时")}` : N;
    });
    return (v, N) => (e.openBlock(), e.createElementBlock("nav", {
      class: e.normalizeClass(["bw-progress", { busy: w.value }]),
      "aria-label": v.$t("流程进度"),
      "data-step-tabs": e.unref(y)
    }, [
      e.createElementVNode("div", qt, [
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(v.$t("标书制作进度")),
          1
          /* TEXT */
        ),
        w.value ? (e.openBlock(), e.createElementBlock(
          "em",
          {
            key: 0,
            class: e.normalizeClass(["bw-progress__live", { suspect: e.unref(k).suspect.value }])
          },
          [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(e.unref(k).suspect.value ? "ri-timer-flash-line" : "ri-loader-4-line bw-spin")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(s.live?.message || v.$t("进行中")) + e.toDisplayString(E.value),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )) : f.value === s.metas.length ? (e.openBlock(), e.createElementBlock("em", zt, [
          N[0] || (N[0] = e.createElementVNode(
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
        ])) : V.value >= 0 ? (e.openBlock(), e.createElementBlock("em", Gt, [
          N[1] || (N[1] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(v.$t("第 {n} 步失败", { n: V.value + 1 })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createVNode(Wt, {
        steps: C.value,
        "model-value": b.value,
        "onUpdate:modelValue": g
      }, null, 8, ["steps", "model-value"])
    ], 10, Pt));
  }
}), Xt = ["data-bw-step"], Zt = { class: "bw-step__head" }, Qt = { class: "bw-step__no" }, Yt = {
  key: 0,
  class: "ri-check-line"
}, en = {
  key: 1,
  class: "ri-loader-4-line bw-spin"
}, tn = {
  key: 2,
  class: "ri-close-line"
}, nn = { class: "bw-step__title" }, on = { class: "bw-step__tools" }, ln = {
  key: 0,
  class: "bw-step__msg bad"
}, an = {
  key: 1,
  class: "bw-step__msg ok"
}, rn = {
  key: 2,
  class: "bw-step__body"
}, q = /* @__PURE__ */ e.defineComponent({
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
  setup(s) {
    const l = s, c = e.ref(null), m = e.ref(""), a = e.ref(!1);
    e.onMounted(() => {
      m.value = Ft(c.value), a.value = !0;
    });
    const f = e.computed(() => {
      if (!a.value) return !1;
      const w = m.value ? se[m.value] : null;
      return !w || !w.active || w.active === l.stepKey;
    }), T = e.ref(!1);
    return e.watch(f, (w) => {
      w && (T.value = !0);
    }), (w, V) => e.withDirectives((e.openBlock(), e.createElementBlock("article", {
      ref_key: "root",
      ref: c,
      class: e.normalizeClass(["bw-step", [`is-${s.runtime.state}`, { current: s.isCurrent }]]),
      "data-bw-step": s.stepKey
    }, [
      e.createElementVNode("header", Zt, [
        e.createElementVNode("span", Qt, [
          s.runtime.state === "done" ? (e.openBlock(), e.createElementBlock("i", Yt)) : s.runtime.state === "running" ? (e.openBlock(), e.createElementBlock("i", en)) : s.runtime.state === "failed" ? (e.openBlock(), e.createElementBlock("i", tn)) : (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 3 },
            [
              e.createTextVNode(
                e.toDisplayString(s.index + 1),
                1
                /* TEXT */
              )
            ],
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        e.createElementVNode("div", nn, [
          e.createElementVNode("strong", null, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(s.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(w.$t("第 {n} 步", { n: s.index + 1 })) + " · " + e.toDisplayString(s.title),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(s.hint),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", on, [
          e.renderSlot(w.$slots, "tools")
        ]),
        e.createElementVNode(
          "em",
          {
            class: e.normalizeClass(["bw-step__state", s.runtime.state])
          },
          [
            s.runtime.state === "todo" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createTextVNode(
                  e.toDisplayString(w.$t("待执行")),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : s.runtime.state === "running" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createTextVNode(
                  e.toDisplayString(w.$t("进行中")),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : s.runtime.state === "done" ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 2 },
              [
                e.createTextVNode(
                  e.toDisplayString(w.$t("完成")),
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
                  e.toDisplayString(w.$t("失败")),
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
      s.runtime.state === "failed" && s.runtime.error ? (e.openBlock(), e.createElementBlock("p", ln, [
        V[0] || (V[0] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(s.runtime.error),
          1
          /* TEXT */
        )
      ])) : s.runtime.state === "done" && s.runtime.summary ? (e.openBlock(), e.createElementBlock("p", an, [
        V[1] || (V[1] = e.createElementVNode(
          "i",
          { class: "ri-checkbox-circle-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(s.runtime.summary),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      T.value ? (e.openBlock(), e.createElementBlock("div", rn, [
        e.renderSlot(w.$slots, "default")
      ])) : e.createCommentVNode("v-if", !0)
    ], 10, Xt)), [
      [e.vShow, f.value]
    ]);
  }
}), Je = /【待补充[:：]/, sn = /【/;
function cn() {
  return new RegExp(`${Je.source}([^】]{1,60})】`, "g");
}
function Xe(s) {
  const l = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:${Je.source}|${sn.source})${l}】`, "g");
}
function xe(s) {
  const l = [];
  for (const c of String(s || "").matchAll(cn())) l.push(c[1].trim());
  return [...new Set(l)];
}
const dn = [
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
function un(s) {
  const l = String(s || "").trim();
  return dn.find(([c]) => c.test(l))?.[1]() || l;
}
const mn = {
  key: 0,
  class: "bw-panel bw-gaps"
}, pn = { class: "bw-panel__head" }, vn = { class: "bw-muted" }, fn = ["title"], bn = ["disabled"], gn = { class: "bw-panel__body" }, yn = { class: "bw-table" }, Vn = {
  key: 0,
  class: "bw-muted"
}, Nn = {
  key: 1,
  class: "bw-gap__ctx"
}, wn = ["onUpdate:modelValue", "placeholder"], kn = {
  key: 0,
  class: "bw-muted bw-gap__eg"
}, En = { class: "bw-muted" }, hn = /* @__PURE__ */ e.defineComponent({
  __name: "BwGapForm",
  props: {
    sections: {},
    busy: { type: Boolean },
    remember: { type: Boolean }
  },
  emits: ["apply", "update:remember"],
  setup(s, { emit: l }) {
    const c = s, m = l, a = e.reactive({}), f = e.computed({
      get: () => c.remember !== !1,
      set: (b) => m("update:remember", b)
    }), T = [
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
    function w(b) {
      return T.find(([y]) => y.test(b))?.[1]();
    }
    const V = e.computed(() => {
      const b = /* @__PURE__ */ new Map();
      for (const y of c.sections) {
        const g = String(y.content || "");
        for (const E of y.placeholders || []) {
          const v = String(E || "").trim();
          if (!v) continue;
          const N = un(v), _ = b.get(N) || { label: N, raw: [], count: 0, sections: [], example: w(N) };
          if (_.count += 1, _.raw.includes(v) || _.raw.push(v), _.sections.includes(y.title) || _.sections.push(y.title), !_.context && g) {
            const j = Xe(v).exec(g);
            if (j) {
              const d = j.index;
              _.context = {
                before: g.slice(Math.max(0, d - 34), d).replace(/\s+/g, " "),
                after: g.slice(d + j[0].length, d + j[0].length + 34).replace(/\s+/g, " ")
              };
            }
          }
          b.set(N, _);
        }
      }
      return [...b.values()].sort((y, g) => g.count - y.count || y.label.localeCompare(g.label, "zh-CN"));
    }), k = e.computed(() => V.value.filter((b) => String(a[b.label] || "").trim()).length);
    e.watch(V, (b) => {
      const y = new Set(b.map((g) => g.label));
      for (const g of Object.keys(a)) y.has(g) || delete a[g];
    });
    function C() {
      const b = {};
      for (const y of V.value) {
        const g = String(a[y.label] || "").trim();
        if (g)
          for (const E of y.raw) b[E] = g;
      }
      Object.keys(b).length && m("apply", b, f.value);
    }
    return (b, y) => V.value.length ? (e.openBlock(), e.createElementBlock("section", mn, [
      e.createElementVNode("header", pn, [
        e.createElementVNode("strong", null, [
          y[1] || (y[1] = e.createElementVNode(
            "i",
            { class: "ri-edit-box-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(b.$t("需要你填写的信息（{n} 项）", { n: V.value.length })),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          vn,
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
        ], 10, fn),
        e.createElementVNode("button", {
          type: "button",
          class: "bw-btn sm primary",
          disabled: !k.value || s.busy,
          onClick: C
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(s.busy ? "ri-loader-4-line bw-spin" : "ri-check-double-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            " " + e.toDisplayString(b.$t("回填到正文（{n} 项）", { n: k.value })),
            1
            /* TEXT */
          )
        ], 8, bn)
      ]),
      e.createElementVNode("div", gn, [
        e.createElementVNode("table", yn, [
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
              e.renderList(V.value, (g) => (e.openBlock(), e.createElementBlock("tr", {
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
                    Vn,
                    e.toDisplayString(b.$t("（{n} 处）", { n: g.count })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createCommentVNode(" 只给一个字段名（「单价」「比例」「体系认证」）用户不知道填什么，把正文原句摆出来 "),
                  g.context ? (e.openBlock(), e.createElementBlock("div", Nn, [
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
                    "onUpdate:modelValue": (E) => a[g.label] = E,
                    type: "text",
                    placeholder: g.example || b.$t("按招标文件或公司实际情况填写"),
                    onKeyup: e.withKeys(C, ["enter"])
                  }, null, 40, wn), [
                    [e.vModelText, a[g.label]]
                  ]),
                  g.example ? (e.openBlock(), e.createElementBlock(
                    "div",
                    kn,
                    e.toDisplayString(b.$t("例：{e}", { e: g.example })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("td", En, [
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
}), Sn = (s, l) => {
  const c = s.__vccOpts || s;
  for (const [m, a] of l)
    c[m] = a;
  return c;
}, Re = /* @__PURE__ */ Sn(hn, [["__scopeId", "data-v-205a9d12"]]), ie = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!ie) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
ie.default;
const ye = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!ye) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
ye.default;
const Y = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!Y) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
Y.default;
function _n() {
  return [
    { key: "project", title: r.t("项目与投标目标"), hint: r.t("项目名称、投标人、你想靠什么赢下这一标"), icon: "ri-flag-line" },
    { key: "notice", title: r.t("招标公告"), hint: r.t("填目标投标网站地址自动抓取，或上传招标文件；抽成逐条要求"), icon: "ri-global-line" },
    { key: "template", title: r.t("标书模板"), hint: r.t("上传模板解析章节；不上传就从知识库里找，或用内置标准大纲"), icon: "ri-file-copy-2-line" },
    { key: "company", title: r.t("公司资料与资格自检"), hint: r.t("从知识库取公司信息，逐条核对资格门槛"), icon: "ri-building-2-line" },
    { key: "compose", title: r.t("逐章成文"), hint: r.t("按大纲一章一章写，每章可单独重写与编辑"), icon: "ri-quill-pen-line" },
    { key: "review", title: r.t("自检与导出"), hint: r.t("废标风险自检；通过后导出 Word / PDF 正式件"), icon: "ri-shield-check-line" }
  ];
}
let be = null, Oe = null;
function $() {
  const s = window.electronAPI?.workbenches?.bidWriter;
  if (!s) return s;
  if (be && Oe === s) return be;
  const l = {};
  for (const c of Object.keys(s)) {
    const m = s[c];
    if (typeof m != "function" || c === "onEvent") {
      l[c] = m;
      continue;
    }
    l[c] = (...a) => m(...a.map((f) => ye.toPlain(f)));
  }
  return be = l, Oe = s, l;
}
function D(s) {
  return s ? String(s?.message || s).replace(/^Error invoking remote method '[^']+': /, "").replace(/^Error: /, "") : r.t("未知错误");
}
function Me(s, l) {
  const c = Date.now();
  return {
    id: `bid_${c.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name: s || r.t("未命名投标项目"),
    createdAt: c,
    updatedAt: c,
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
const A = _n(), R = e.reactive(
  Object.fromEntries(A.map((s) => [s.key, { state: "todo" }]))
), Z = e.ref("project"), S = e.ref({ version: 1, projects: [], currentId: "" }), Fe = e.ref(!1), K = e.ref(""), z = e.ref(""), Q = e.ref(""), ae = e.ref(
  { docCount: 0, builtCount: 0, factCount: 0 }
), We = e.ref(!1), $n = e.ref(null);
let O = null;
function Dn() {
  const s = e.computed(
    () => S.value.projects.find((d) => d.id === S.value.currentId) || null
  );
  function l(d, p) {
    Object.assign(R[d], p);
  }
  function c(d) {
    l(d, { state: "running", error: void 0, startedAt: Date.now() }), Z.value = d, ee(d);
  }
  function m(d, p) {
    l(d, { state: "done", summary: p, error: void 0 });
    const h = A.findIndex((B) => B.key === d);
    A[h + 1] && (Z.value = A[h + 1].key), V();
  }
  function a(d, p) {
    l(d, { state: "failed", error: D(p) }), Z.value = d, ee(d), V();
  }
  function f(d) {
    l(d, { state: "todo", error: void 0, summary: void 0 });
  }
  function T(d) {
    const p = A.findIndex((h) => h.key === d);
    A.slice(p + 1).forEach((h) => {
      R[h.key].state !== "todo" && f(h.key);
    });
  }
  function w() {
    return A.some((d) => R[d.key].state === "running");
  }
  function V() {
    const d = s.value;
    d && (d.stepState = Object.fromEntries(A.map((p) => [p.key, { ...R[p.key] }])), E());
  }
  function k() {
    const d = s.value;
    for (const p of A) {
      const h = d?.stepState?.[p.key];
      Object.assign(R[p.key], h ? { state: h.state === "running" ? "todo" : h.state, summary: h.summary, error: h.error, startedAt: void 0 } : { state: "todo", summary: void 0, error: void 0, startedAt: void 0 });
    }
    Z.value = A.find((p) => R[p.key].state !== "done")?.key || "review";
  }
  async function C() {
    const d = $();
    if (!d?.stateGet) throw new Error(r.t("当前环境不支持标书工作台"));
    const p = await d.stateGet();
    if (S.value = p?.state?.projects ? p.state : { version: 1, projects: [], currentId: "" }, Fe.value = !!p?.llmReady, K.value = String(p?.defaultBidder || ""), z.value = String(p?.docRoot || ""), Q.value = String(p?.defaultDocRoot || ""), ae.value = p?.knowledge || { docCount: 0, builtCount: 0, factCount: 0 }, S.value.projects.length)
      S.value.projects.some((B) => B.id === S.value.currentId) || (S.value.currentId = S.value.projects[0].id);
    else {
      const B = Me(r.t("未命名投标项目"), K.value);
      S.value.projects.push(B), S.value.currentId = B.id;
    }
    const h = S.value.projects.find((B) => B.id === S.value.currentId);
    h && !String(h.bidder || "").trim() && K.value && (h.bidder = K.value, E()), We.value = !0, k();
  }
  async function b() {
    const p = await $().stateGet();
    return K.value = String(p?.defaultBidder || ""), ae.value = p?.knowledge || { docCount: 0, builtCount: 0, factCount: 0 }, z.value = String(p?.docRoot || z.value), Q.value = String(p?.defaultDocRoot || Q.value), { companyName: K.value, ...ae.value };
  }
  async function y() {
    const p = await $().pickRoot();
    return p?.docRoot && (z.value = String(p.docRoot)), p?.defaultDocRoot && (Q.value = String(p.defaultDocRoot)), { ok: !!p?.ok, error: p?.error };
  }
  async function g() {
    const p = await $().setRoot({ path: "" });
    p?.docRoot && (z.value = String(p.docRoot));
  }
  function E() {
    const d = s.value;
    d && (d.updatedAt = Date.now()), O && window.clearTimeout(O), O = window.setTimeout(() => {
      O = null, v().catch((p) => ie.useNotificationStore().error(D(p)));
    }, 600);
  }
  async function v() {
    O && (window.clearTimeout(O), O = null);
    const d = $();
    if (!d?.stateSave) throw new Error(r.t("标书保存接口不可用"));
    const p = await d.stateSave({ state: S.value });
    if (!p?.ok) throw new Error(p?.error || r.t("标书保存失败"));
  }
  function N(d) {
    const p = Me(d, K.value);
    S.value.projects.unshift(p), S.value.currentId = p.id, k(), E();
  }
  function _(d) {
    S.value.currentId = d, k(), E();
  }
  function j(d) {
    S.value.projects = S.value.projects.filter((p) => p.id !== d), S.value.projects.length ? S.value.currentId === d && _(S.value.projects[0].id) : N(r.t("未命名投标项目")), E();
  }
  return {
    metas: A,
    runtime: R,
    currentKey: Z,
    state: S,
    project: s,
    llmReady: Fe,
    defaultBidder: K,
    loaded: We,
    live: $n,
    docRoot: z,
    defaultDocRoot: Q,
    knowledge: ae,
    start: c,
    done: m,
    fail: a,
    reset: f,
    resetAfter: T,
    isRunning: w,
    persistStepState: V,
    restoreStepState: k,
    load: C,
    save: E,
    saveNow: v,
    createProject: N,
    switchProject: _,
    removeProject: j,
    refreshKnowledge: b,
    pickDocRoot: y,
    resetDocRoot: g
  };
}
async function ee(s) {
  await e.nextTick();
  const l = document.querySelector(`[data-bw-step="${s}"]`);
  if (l)
    try {
      l.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      l.scrollIntoView();
    }
}
function Cn(s) {
  const l = $();
  return l?.onEvent ? l.onEvent(s) || (() => {
  }) : () => {
  };
}
function Pe(s) {
  switch (s) {
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
      return s;
  }
}
function Bn(s) {
  switch (s) {
    case "blocker":
      return r.t("阻断");
    case "warning":
      return r.t("提醒");
    default:
      return r.t("通过");
  }
}
function Tn(s) {
  switch (s) {
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
function qe(s) {
  if (!s) return "";
  const l = new Date(s), c = (m) => String(m).padStart(2, "0");
  return `${l.getFullYear()}-${c(l.getMonth() + 1)}-${c(l.getDate())} ${c(l.getHours())}:${c(l.getMinutes())}`;
}
function An() {
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
async function ze(s, l) {
  const c = window.electronAPI?.browserTabs;
  if (!c?.create) return !1;
  const m = String(s || "").trim();
  if (!m) return !1;
  const a = /^https?:\/\//i.test(m) ? m : `https://${m}`, f = await c.create({ url: a, contextId: l, source: "agent", activate: !0 });
  if (f?.id && c.setAutomationPaused)
    try {
      await c.setAutomationPaused(f.id, !0);
    } catch {
    }
  try {
    await c.setVisible?.(!0);
  } catch {
  }
  return !0;
}
const jn = { class: "bw-workbench" }, Ln = { class: "bw-hero" }, Un = { class: "bw-hero__copy" }, Kn = { class: "bw-hero__eyebrow" }, In = { class: "bw-hero__sub" }, xn = { class: "bw-projects" }, Rn = { class: "bw-muted" }, On = ["value", "disabled"], Mn = ["value"], Fn = ["disabled"], Wn = ["disabled"], Pn = {
  key: 0,
  class: "bw-muted"
}, qn = { class: "bw-projects" }, zn = { class: "bw-muted" }, Gn = ["title"], Hn = ["disabled"], Jn = ["disabled"], Xn = ["disabled"], Zn = { class: "bw-muted" }, Qn = { class: "bw-projects" }, Yn = { class: "bw-muted" }, eo = ["title"], to = { class: "bw-muted" }, no = {
  key: 0,
  class: "bw-note warn"
}, oo = {
  key: 1,
  class: "bw-steps"
}, lo = { class: "bw-form" }, ao = { class: "bw-field" }, ro = ["placeholder"], so = { class: "bw-field" }, io = { class: "bw-inline" }, co = ["placeholder"], uo = ["disabled", "title"], mo = { class: "bw-field" }, po = { value: "zh-CN" }, vo = { class: "bw-field" }, fo = { class: "bw-field wide" }, bo = { class: "bw-field__head" }, go = {
  key: 0,
  class: "bw-muted"
}, yo = {
  key: 1,
  class: "bw-muted"
}, Vo = ["disabled"], No = ["placeholder"], wo = {
  key: 0,
  class: "bw-note warn"
}, ko = { class: "bw-chips" }, Eo = ["disabled", "onClick"], ho = { class: "bw-note" }, So = { class: "bw-hero__actions" }, _o = ["disabled"], $o = {
  key: 0,
  class: "bw-chip static ok"
}, Do = { class: "bw-form" }, Co = { class: "bw-field wide" }, Bo = { class: "bw-field__head" }, To = {
  key: 0,
  class: "bw-muted"
}, Ao = { class: "bw-inline" }, jo = ["placeholder"], Lo = ["disabled"], Uo = {
  key: 0,
  class: "bw-panel"
}, Ko = { class: "bw-panel__head" }, Io = { class: "bw-muted" }, xo = {
  key: 0,
  class: "bw-chip static warn"
}, Ro = { class: "bw-panel__body" }, Oo = { class: "bw-table" }, Mo = { class: "bw-muted" }, Fo = {
  key: 0,
  class: "bw-muted"
}, Wo = { class: "num" }, Po = ["disabled", "onClick"], qo = ["onClick"], zo = {
  key: 1,
  class: "bw-note warn"
}, Go = { class: "bw-form" }, Ho = { class: "bw-field wide" }, Jo = { class: "bw-hero__actions" }, Xo = ["disabled"], Zo = ["disabled"], Qo = ["disabled"], Yo = ["disabled"], el = { class: "bw-note" }, tl = { class: "bw-field wide" }, nl = ["placeholder"], ol = {
  key: 2,
  class: "bw-note warn"
}, ll = {
  key: 3,
  class: "bw-note warn"
}, al = ["disabled"], rl = {
  key: 4,
  class: "bw-panel"
}, sl = { class: "bw-panel__head" }, il = ["href"], cl = { class: "bw-panel__body" }, dl = { class: "bw-form" }, ul = { class: "bw-field" }, ml = { class: "bw-field" }, pl = { class: "bw-field" }, vl = { class: "bw-field" }, fl = { class: "bw-field" }, bl = { class: "bw-field" }, gl = { class: "bw-field" }, yl = { class: "bw-field" }, Vl = {
  key: 5,
  class: "bw-panel"
}, Nl = { class: "bw-panel__head" }, wl = { class: "bw-panel__body" }, kl = { class: "bw-muted" }, El = ["href"], hl = { class: "bw-note" }, Sl = {
  key: 6,
  class: "bw-panel"
}, _l = { class: "bw-panel__head" }, $l = { class: "bw-panel__body" }, Dl = { class: "bw-table" }, Cl = { class: "num" }, Bl = ["onUpdate:modelValue"], Tl = ["value"], Al = ["onUpdate:modelValue"], jl = { class: "num" }, Ll = { class: "num" }, Ul = ["onClick"], Kl = {
  key: 0,
  class: "bw-chip static ok"
}, Il = { class: "bw-hero__actions" }, xl = ["disabled"], Rl = ["disabled"], Ol = ["disabled"], Ml = { class: "bw-note" }, Fl = {
  key: 0,
  class: "bw-panel"
}, Wl = { class: "bw-panel__head" }, Pl = { class: "bw-panel__body" }, ql = { class: "bw-table" }, zl = { class: "bw-muted" }, Gl = { class: "num" }, Hl = ["disabled", "onClick"], Jl = {
  key: 1,
  class: "bw-note info"
}, Xl = {
  key: 2,
  class: "bw-panel"
}, Zl = { class: "bw-panel__head" }, Ql = ["disabled"], Yl = { class: "bw-panel__body" }, ea = { class: "bw-sections" }, ta = { class: "bw-section__head" }, na = ["onUpdate:modelValue"], oa = { value: 1 }, la = { value: 2 }, aa = { value: 3 }, ra = ["onUpdate:modelValue"], sa = { class: "bw-chip static" }, ia = ["onUpdate:modelValue"], ca = ["disabled", "onClick"], da = ["disabled", "onClick"], ua = ["onClick"], ma = {
  key: 0,
  class: "bw-section__body"
}, pa = { class: "bw-note" }, va = { class: "bw-hero__actions" }, fa = ["disabled"], ba = ["disabled", "title"], ga = {
  key: 0,
  class: "bw-panel"
}, ya = { class: "bw-panel__head" }, Va = { class: "bw-panel__body" }, Na = { class: "bw-table" }, wa = { class: "num" }, ka = ["onUpdate:modelValue", "onChange"], Ea = { class: "num bw-muted" }, ha = {
  key: 1,
  class: "bw-note"
}, Sa = ["disabled"], _a = {
  key: 2,
  class: "bw-panel"
}, $a = { class: "bw-panel__head" }, Da = {
  key: 0,
  class: "bw-chip static bad"
}, Ca = {
  key: 1,
  class: "bw-chip static warn"
}, Ba = { class: "bw-panel__body" }, Ta = { class: "bw-table" }, Aa = { class: "num" }, ja = ["onUpdate:modelValue"], La = { value: "met" }, Ua = { value: "unmet" }, Ka = { value: "unknown" }, Ia = { class: "bw-muted" }, xa = { class: "bw-note" }, Ra = {
  key: 3,
  class: "bw-panel"
}, Oa = { class: "bw-panel__head" }, Ma = { class: "bw-panel__body" }, Fa = { class: "bw-muted" }, Wa = { class: "bw-chip static" }, Pa = {
  key: 0,
  class: "bw-chip static warn"
}, qa = { class: "bw-hero__actions" }, za = ["disabled"], Ga = ["disabled"], Ha = {
  key: 0,
  class: "bw-muted"
}, Ja = {
  key: 0,
  class: "bw-note warn"
}, Xa = { class: "bw-sections" }, Za = { class: "bw-section__head" }, Qa = {
  key: 0,
  class: "bw-muted"
}, Ya = {
  key: 1,
  class: "bw-chip static"
}, er = ["disabled", "onClick"], tr = ["onClick"], nr = {
  key: 0,
  class: "bw-note bad",
  style: { padding: "0 10px 8px" }
}, or = {
  key: 1,
  class: "bw-section__body"
}, lr = {
  key: 0,
  class: "bw-note"
}, ar = { class: "bw-field" }, rr = ["onUpdate:modelValue", "placeholder"], sr = ["onUpdate:modelValue", "placeholder", "onChange"], ir = {
  key: 1,
  class: "bw-chips"
}, cr = { class: "bw-hero__actions" }, dr = ["disabled"], ur = ["disabled"], mr = ["disabled", "title"], pr = {
  key: 0,
  class: "bw-panel"
}, vr = { class: "bw-panel__head" }, fr = {
  key: 0,
  class: "bw-muted"
}, br = { class: "bw-panel__body" }, gr = { class: "bw-table" }, yr = { class: "num" }, Vr = { class: "bw-muted" }, Nr = { class: "num" }, wr = ["onClick"], kr = ["title", "onClick"], Er = ["onClick"], hr = {
  key: 1,
  class: "bw-panel"
}, Sr = { class: "bw-panel__head" }, _r = { class: "bw-panel__body" }, $r = { class: "bw-table" }, Dr = { class: "bw-mono" }, Cr = { class: "num" }, Br = { class: "num bw-muted" }, Tr = { class: "num" }, Ar = ["onClick"], jr = ["onClick"], Lr = /* @__PURE__ */ e.defineComponent({
  __name: "BidWriterWorkbenchView",
  setup(s) {
    const l = Dn(), c = ge.useRouter(), m = ie.useNotificationStore(), a = l.project, f = e.computed(() => l.isRunning()), T = An(), w = ["qualification", "scoring", "deliverable", "technical", "commercial", "format"], V = e.ref(""), k = e.ref([]), C = e.ref(""), b = e.ref(""), y = e.ref([]), g = e.ref(""), E = e.ref(""), v = e.ref(!1), N = e.ref([]), _ = e.ref(""), j = e.ref([]), d = e.reactive(/* @__PURE__ */ new Set()), p = e.reactive({}), h = e.ref(!1), B = e.ref(""), te = e.ref(!1), G = e.ref(!1), H = e.ref(!1), ne = e.ref(!1);
    let I = null;
    const x = e.computed(() => a.value?.rememberGaps !== !1);
    function ce(n) {
      const t = a.value;
      t && (t.rememberGaps = n, l.save());
    }
    const M = e.ref(!1), F = e.ref(!1), L = e.ref(!1);
    let U = null, de = !1, Ve = null;
    const J = e.computed(() => a.value?.notice?.requirements || []), Ze = e.computed(() => {
      const n = a.value?.notice;
      if (!n) return !1;
      const t = /(提供|发送|查询|缴纳|上传|购买|获取|递交|参加)/.test(n.buyer || ""), o = !!n.budget && !/(元|万|亿)/.test(n.budget || ""), i = !!n.bidDeadline && !/\d{4}\s*[年\-/.]|\d{1,2}\s*[:：时]/.test(n.bidDeadline || "");
      return t || o || i;
    }), Qe = e.computed(() => {
      const n = a.value?.notice;
      return !!(n && (n.buyer || n.projectCode || n.budget || n.bidDeadline || n.text));
    }), Ye = e.computed(() => w.map((n) => ({ key: n, label: Pe(n), count: J.value.filter((t) => t.kind === n).length })).filter((n) => n.count > 0)), X = e.computed(() => (a.value?.company || []).filter((n) => n.from === "manual" && String(n.value || "").trim()).length), ue = e.computed(() => (a.value?.company || []).filter((n) => !String(n.value || "").trim()).length), Ne = e.computed(() => (a.value?.qualifications || []).filter((n) => n.verdict === "unmet").length), we = e.computed(() => (a.value?.qualifications || []).filter((n) => n.verdict === "unknown").length), me = e.computed(() => (a.value?.sections || []).filter((n) => String(n.content || "").trim()).length), ke = e.computed(() => (a.value?.sections || []).reduce((n, t) => n + (t.placeholders?.length || 0), 0)), pe = e.computed(() => !!a.value?.sections.length && l.llmReady.value), Ee = e.computed(() => me.value > 0), oe = e.computed(() => (a.value?.compliance || []).some((n) => n.level === "blocker"));
    function et(n) {
      return String(n || "").split(/[\\/]/).pop() || n;
    }
    const tt = e.computed(() => !!(l.docRoot.value && l.defaultDocRoot.value && l.docRoot.value !== l.defaultDocRoot.value)), nt = e.computed(() => {
      const n = a.value?.exports?.[0]?.path;
      return n || "";
    }), ve = e.computed(() => {
      const n = l.knowledge.value;
      return l.defaultBidder.value ? "" : n.docCount ? n.builtCount ? n.factCount ? n.nearestName ? r.t("知识库里有{label}「{value}」，但没有公司全称。投标人必须写营业执照上的名称，到知识库补一条「公司名称」即可自动带出。", {
        label: n.nearestName.label,
        value: n.nearestName.value
      }) : r.t("知识库里有 {n} 条事实，但没认出公司名称：到知识库把「公司名称」这条补上即可自动带出。", { n: n.factCount }) : r.t("知识库图谱已形成但没抽出公司事实：确认导入的资料里有「公司名称 / 统一社会信用代码」这类标签，或到知识库手工补一条。") : r.t("知识库里有 {n} 份文档，但都还没形成知识图谱 —— 形成之后才能抽出公司事实。", { n: n.docCount }) : r.t("知识库里还没有文档：把营业执照、资质证书、公司简介导进去并「形成知识图谱」，投标人、信用代码、资质业绩就能自动带出来。");
    });
    e.onMounted(async () => {
      try {
        await l.load(), V.value = String(a.value?.notice?.text || ""), k.value = a.value?.notice?.warnings || [], L.value = !!String(a.value?.goal || "").trim();
      } catch (n) {
        m.error(D(n));
      }
      Ve = Cn((n) => {
        l.live.value = { message: n.message, done: n.done, total: n.total }, n.done >= n.total && window.setTimeout(() => {
          l.isRunning() || (l.live.value = null);
        }, 800);
      });
    }), e.onBeforeUnmount(() => {
      U && (window.clearTimeout(U), U = null), I && (window.clearTimeout(I), I = null);
      try {
        Ve?.();
      } catch {
      }
      l.saveNow().catch((n) => m.error(D(n)));
    });
    async function ot() {
      try {
        const n = await l.pickDocRoot();
        n.error ? m.error(n.error) : n.ok && m.success(r.t("以后导出的标书会放到：{p}", { p: l.docRoot.value }));
      } catch (n) {
        m.error(D(n));
      }
    }
    async function lt() {
      try {
        await l.resetDocRoot(), m.success(r.t("已恢复默认存放位置"));
      } catch (n) {
        m.error(D(n));
      }
    }
    async function at() {
      const n = a.value;
      if (n) {
        te.value = !0;
        try {
          const t = await l.refreshKnowledge();
          t.companyName ? (n.bidder = t.companyName, l.save(), m.success(r.t("已带出：{name}", { name: t.companyName }))) : m.warn(ve.value || r.t("知识库里没有认出公司名称"));
        } catch (t) {
          m.error(D(t));
        } finally {
          te.value = !1;
        }
      }
    }
    function rt(n) {
      l.switchProject(n.target.value), L.value = !!String(a.value?.goal || "").trim(), F.value = !1, V.value = String(a.value?.notice?.text || ""), k.value = a.value?.notice?.warnings || [], N.value = [], y.value = [], C.value = "", E.value = "";
    }
    function st() {
      l.createProject(r.t("未命名投标项目")), L.value = !1, F.value = !1, V.value = "", k.value = [], N.value = [], y.value = [], C.value = "", E.value = "";
    }
    function it() {
      const n = a.value;
      n && window.confirm(r.t("删除「{name}」？已导出的文件不会被删除。", { name: n.name })) && (l.removeProject(n.id), V.value = String(a.value?.notice?.text || ""));
    }
    function ct(n) {
      const t = a.value;
      if (t) {
        if (t.strategies = t.strategies.includes(n) ? t.strategies.filter((o) => o !== n) : [...t.strategies, n], l.save(), U && window.clearTimeout(U), !t.strategies.length) {
          U = null;
          return;
        }
        U = window.setTimeout(() => {
          U = null, he(!1);
        }, 800);
      }
    }
    function dt() {
      L.value = !!String(a.value?.goal || "").trim(), F.value = !1, l.save();
    }
    function ut(n, t) {
      const o = n.filter(Boolean);
      if (!o.length) return "";
      const i = o.slice(0, 3).join(r.t("、")), u = o.slice(3), W = u.length ? r.t("，同时确保{rest}。", { rest: u.join(r.t("、")) }) : r.t("。");
      return r.t("本项目以{head}作为主要取胜点参与{name}投标{tail}", { head: i, name: t || r.t("本项目"), tail: W });
    }
    async function he(n) {
      const t = a.value;
      if (!t || M.value) return;
      if (!t.strategies.length) {
        n && m.warn(r.t("先选一个侧重标签"));
        return;
      }
      if (!n && L.value) return;
      const o = ut(t.strategies, t.name);
      o && (t.goal = o, F.value = !0, l.save()), M.value = !0;
      const i = t.strategies.join("|");
      try {
        const u = await $().goalDraft({ projectId: t.id, strategies: t.strategies });
        if (!u?.ok || !u.text) throw new Error(u?.error || r.t("目标没生成出来"));
        if (L.value || a.value?.id !== t.id || t.strategies.join("|") !== i) return;
        t.goal = String(u.text).trim(), F.value = !!u.fallback, L.value = !1, l.save();
      } catch (u) {
        o || m.error(D(u));
      } finally {
        M.value = !1;
      }
    }
    function mt() {
      const n = a.value;
      if (n) {
        if (!n.name.trim()) {
          m.error(r.t("先填项目名称"));
          return;
        }
        if (!n.goal.trim() && !n.strategies.length) {
          m.error(r.t("填一句投标目标，或至少选一个侧重 —— 这决定后面每一章怎么写"));
          return;
        }
        l.done("project", r.t("{name} · 投标人 {bidder}", { name: n.name, bidder: n.bidder || r.t("未填") }));
      }
    }
    async function Se() {
      const n = a.value;
      if (!(!n || v.value)) {
        v.value = !0, E.value = "";
        try {
          const t = await $().noticeSearch({ projectId: n.id, keywords: C.value.trim() || void 0 });
          b.value = String(t?.keywords || ""), !C.value.trim() && t?.keywords && (C.value = String(t.keywords)), y.value = Array.isArray(t?.hits) ? t.hits : [], g.value = t?.via || "";
          const o = [...t?.warnings || []];
          !t?.ok && t?.error && o.unshift(t.error), E.value = o.join(`
`);
        } catch (t) {
          y.value = [], E.value = D(t);
        } finally {
          v.value = !1;
        }
      }
    }
    async function pt(n) {
      const t = a.value;
      t && (t.siteUrl = n.url, t.notice = { ...t.notice, title: n.title, url: n.url }, l.save(), await _e());
    }
    function vt(n) {
      ze(n, "bid-writer-preview");
    }
    function ft() {
      const n = a.value;
      n && (n.notice.text = V.value, l.save());
    }
    async function bt() {
      const n = a.value;
      if (!n?.siteUrl) return;
      const t = (() => {
        try {
          return new URL(/^https?:/i.test(n.siteUrl) ? n.siteUrl : `https://${n.siteUrl}`).hostname;
        } catch {
          return "site";
        }
      })();
      await ze(n.siteUrl, `bid-writer-${t}`) || m.error(r.t("内置浏览器不可用"));
    }
    async function _e() {
      const n = a.value;
      if (n) {
        l.start("notice");
        try {
          const t = await $().noticeFetch({ url: n.siteUrl, projectId: n.id });
          if (k.value = t?.warnings || [], !t?.ok) throw new Error(t?.error || r.t("抓取失败"));
          V.value = String(t.text || ""), n.notice = { ...n.notice, url: t.url, title: t.title, text: V.value, attachments: t.attachments || [] }, l.save(), l.runtime.notice.state = "todo", m.success(r.t("抓到 {n} 字正文，下一步点「抽取招标要点」", { n: V.value.length }));
        } catch (t) {
          l.fail("notice", t);
        }
      }
    }
    async function gt() {
      const n = a.value;
      if (n) {
        l.start("notice");
        try {
          const t = await $().noticeImport();
          if (!t?.ok) {
            l.runtime.notice.state = "todo", t?.error && m.error(t.error);
            return;
          }
          V.value = String(t.text || ""), k.value = t.warnings || [], n.notice = { ...n.notice, title: t.title, text: V.value }, l.save(), l.runtime.notice.state = "todo";
        } catch (t) {
          l.fail("notice", t);
        }
      }
    }
    async function $e() {
      const n = a.value;
      if (n) {
        l.start("notice");
        try {
          const t = await $().noticeExtract({
            projectId: n.id,
            text: V.value,
            url: n.notice.url || n.siteUrl,
            title: n.notice.title,
            rulesOnly: !l.llmReady.value
          });
          n.notice = { ...t, attachments: n.notice.attachments || t.attachments }, k.value = t.warnings || [], l.resetAfter("notice"), l.done("notice", r.t("{n} 条要求 · 截止 {t}", {
            n: t.requirements.length,
            t: t.bidDeadline || r.t("未抓到")
          })), l.save();
        } catch (t) {
          l.fail("notice", t);
        }
      }
    }
    function yt() {
      const n = a.value;
      n && (n.notice.requirements = [
        ...n.notice.requirements || [],
        { id: `manual_${Date.now().toString(36)}`, kind: "technical", text: "", source: { kind: "manual", label: r.t("手工添加") } }
      ], l.save());
    }
    function Vt(n) {
      const t = a.value;
      t && (t.notice.requirements = (t.notice.requirements || []).filter((o) => o.id !== n), l.save());
    }
    function fe(n) {
      const t = a.value;
      if (!t || !n?.ok) {
        n?.error && m.error(n.error);
        return;
      }
      t.template = n.template, t.sections = n.sections || [], l.resetAfter("template"), l.save(), m.success(n.warnings?.[0] || r.t("大纲已就绪"));
    }
    async function Nt() {
      const n = a.value;
      if (n) {
        l.start("template");
        try {
          const t = await $().templateImport({ projectId: n.id });
          if (!t?.ok && !t?.error) {
            l.runtime.template.state = "todo";
            return;
          }
          fe(t), t.ok ? l.done("template", r.t("模板：{name} · {n} 章", { name: t.template?.name || "", n: t.sections?.length || 0 })) : l.fail("template", t.error);
        } catch (t) {
          l.fail("template", t);
        }
      }
    }
    async function wt() {
      const n = a.value;
      if (n)
        try {
          const t = await $().templateSuggest({ projectId: n.id, query: n.name });
          N.value = t?.candidates || [], _.value = t?.note || "";
        } catch (t) {
          m.error(D(t));
        }
    }
    async function kt(n) {
      const t = a.value;
      if (t) {
        l.start("template");
        try {
          const o = await $().templateAdopt({ projectId: t.id, kind: "knowledge", docId: n });
          fe(o), o?.ok ? l.done("template", r.t("模板：{name} · {n} 章", { name: o.template?.name || "", n: o.sections?.length || 0 })) : l.fail("template", o?.error);
        } catch (o) {
          l.fail("template", o);
        }
      }
    }
    async function Et() {
      const n = a.value;
      if (n) {
        l.start("template");
        try {
          const t = await $().templateAdopt({ projectId: n.id, kind: "builtin" });
          fe(t), l.done("template", r.t("内置标准大纲 · {n} 章", { n: t?.sections?.length || 0 }));
        } catch (t) {
          l.fail("template", t);
        }
      }
    }
    function ht() {
      const n = a.value;
      n?.sections.length && (l.done("template", r.t("{n} 章", { n: n.sections.length })), l.save());
    }
    function St() {
      const n = a.value;
      n && (n.sections.push({
        id: `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
        level: 1,
        title: r.t("新章节"),
        state: "todo"
      }), l.save());
    }
    function _t(n) {
      const t = a.value;
      t && (t.sections = t.sections.filter((o) => o.id !== n), l.save());
    }
    function De(n, t) {
      const o = a.value;
      if (!o) return;
      const i = n + t;
      if (i < 0 || i >= o.sections.length) return;
      const u = [...o.sections];
      [u[n], u[i]] = [u[i], u[n]], o.sections = u, l.save();
    }
    function $t(n) {
      n.from = String(n.value || "").trim() ? "manual" : "missing", l.save();
    }
    function Ce() {
      c.push("/knowledge");
    }
    async function Be(n = !1) {
      const t = a.value;
      if (t && !(n && !window.confirm(r.t("手填的 {n} 项会被知识库里的值覆盖，确定吗？", { n: X.value })))) {
        l.start("company");
        try {
          const o = await $().companyProfile({
            projectId: t.id,
            requirements: t.notice?.requirements || [],
            manual: n ? [] : (t.company || []).filter((u) => u.from === "manual")
          });
          t.company = o?.fields || [], t.qualifications = o?.qualifications || [], j.value = o?.evidenceDocs || [], (o?.warnings || []).forEach((u) => m.warn(u)), l.save();
          const i = t.company.filter((u) => !String(u.value || "").trim()).length;
          l.done("company", i ? r.t("{n} 项资料还缺，先补上再往下写", { n: i }) : r.t("公司资料齐了 · {n} 条资格待核对", { n: t.qualifications.length }));
        } catch (o) {
          l.fail("company", o);
        }
      }
    }
    function Dt(n) {
      d.has(n) ? d.delete(n) : d.add(n);
    }
    function Ct(n) {
      n.edited = !0, n.state = String(n.content || "").trim() ? "done" : "todo", n.wordCount = Te(String(n.content || "")), n.placeholders = xe(String(n.content || "")), l.save();
    }
    function Te(n) {
      const t = n.trim();
      if (!t) return 0;
      const o = (t.match(/[一-龥]/g) || []).length, i = (t.replace(/[一-龥]/g, " ").match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
      return o + i;
    }
    async function Ae(n) {
      const t = a.value, o = t?.sections.find((i) => i.id === n);
      if (!t || !o) return !1;
      o.state = "running", o.error = void 0, B.value = o.title;
      try {
        const i = await $().sectionCompose({ projectId: t.id, sectionId: n, instruction: p[n] || void 0 });
        if (!i?.ok) throw new Error(i?.error || r.t("生成失败"));
        return o.content = i.content, o.placeholders = i.placeholders || [], o.wordCount = i.wordCount, o.state = "done", o.edited = !1, o.updatedAt = Date.now(), l.save(), !0;
      } catch (i) {
        return o.state = "failed", o.error = D(i), l.save(), !1;
      }
    }
    async function Bt() {
      const n = a.value;
      if (!n) return;
      de = !1, h.value = !0, l.start("compose");
      let t = 0, o = 0;
      try {
        for (const u of n.sections) {
          if (de) break;
          if (u.edited && String(u.content || "").trim() || String(u.content || "").trim() && u.state === "done") continue;
          await Ae(u.id) ? t += 1 : o += 1;
        }
        o ? l.fail("compose", r.t("{ok} 章写好，{failed} 章失败（失败原因写在对应章节上）", { ok: t, failed: o })) : l.done("compose", r.t("{ok} 章写好，共 {total} 章", { ok: me.value, total: n.sections.length }));
        const i = new Set(n.sections.flatMap((u) => u.placeholders || [])).size;
        i && (m.warn(r.t("有 {n} 项信息需要你填写（报价、工期、证书编号这类 AI 不能编），已列在「需要你填写的信息」里。", { n: i })), ee("compose"));
      } finally {
        h.value = !1, B.value = "", await l.saveNow();
      }
    }
    function Tt() {
      de = !0;
    }
    async function je(n, t) {
      const o = a.value;
      if (!(!o || G.value)) {
        G.value = !0;
        try {
          let i = 0;
          for (const u of o.sections) {
            const W = String(u.content || "");
            if (!W) continue;
            let P = W;
            for (const [It, xt] of Object.entries(n))
              P = P.replace(Xe(It), () => (i += 1, xt));
            P !== W && (u.content = P, u.placeholders = xe(P), u.wordCount = Te(P), u.edited = !0);
          }
          await l.saveNow(), t && await Le(n), m.success(r.t("已回填 {n} 处", { n: i })), o.sections.some((u) => (u.placeholders?.length || 0) > 0) && m.warn(r.t("还有占位没填完，导出正式件前需要清空。"));
        } catch (i) {
          m.error(D(i));
        } finally {
          G.value = !1;
        }
      }
    }
    async function At() {
      const n = a.value;
      if (!(!n || H.value)) {
        H.value = !0;
        try {
          const t = {};
          for (const o of n.company || []) {
            if (o.from !== "manual") continue;
            const i = String(o.value || "").trim();
            i && (t[o.label] = i);
          }
          if (!Object.keys(t).length) {
            m.warn(r.t("没有手填的内容"));
            return;
          }
          await Le(t), m.success(r.t("已存入知识图谱 {n} 项", { n: Object.keys(t).length }));
        } catch (t) {
          m.error(D(t));
        } finally {
          H.value = !1;
        }
      }
    }
    async function Le(n) {
      const t = window.electronAPI?.knowledge;
      if (t?.saveFact)
        for (const [o, i] of Object.entries(n))
          try {
            await t.saveFact({ label: o, value: i, confirmed: !0 });
          } catch {
          }
    }
    function jt(n) {
      return (a.value?.complianceAcks || []).includes(n);
    }
    async function Lt(n) {
      const t = a.value;
      if (t) {
        t.complianceAcks = [.../* @__PURE__ */ new Set([...t.complianceAcks || [], n])];
        try {
          await l.saveNow(), await le(!0);
        } catch (o) {
          m.error(D(o));
        }
      }
    }
    async function Ut(n) {
      const t = a.value;
      if (t) {
        t.complianceAcks = (t.complianceAcks || []).filter((o) => o !== n);
        try {
          await l.saveNow(), await le(!0);
        } catch (o) {
          m.error(D(o));
        }
      }
    }
    function Kt() {
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
      () => Kt()
    );
    async function le(n = !1) {
      const t = a.value;
      if (!(!t || ne.value)) {
        ne.value = !0, n || l.start("review");
        try {
          await l.saveNow();
          const o = await $().complianceCheck({ projectId: t.id });
          if (t.compliance = o?.items || [], l.save(), n) return;
          o?.blocked ? l.fail("review", r.t("有阻断项，先处理完才能导正式件")) : l.done("review", r.t("自检通过，可以导出正式件"));
        } catch (o) {
          n || l.fail("review", o);
        } finally {
          ne.value = !1;
        }
      }
    }
    async function Ue(n) {
      const t = a.value;
      if (t) {
        l.start("review");
        try {
          await l.saveNow();
          const o = await $().exportPackage({ projectId: t.id, draft: n, formats: ["docx", "pdf", "checklist"] });
          if (!o?.ok) throw new Error(o?.error || r.t("导出失败"));
          const i = Date.now();
          t.exports = [...(o.paths || []).map((u) => ({ path: u, kind: u.split(".").pop() || "", at: i, draft: n })), ...t.exports].slice(0, 30), await l.saveNow(), l.done("review", n ? r.t("草稿件已导出（{n} 个文件）", { n: o.paths?.length || 0 }) : r.t("正式件已导出（{n} 个文件）", { n: o.paths?.length || 0 }));
        } catch (o) {
          l.fail("review", o);
        }
      }
    }
    return (n, t) => (e.openBlock(), e.createElementBlock("div", jn, [
      e.createElementVNode("header", Ln, [
        e.createVNode(Rt),
        e.createElementVNode("div", Un, [
          e.createElementVNode("p", Kn, [
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
            In,
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
      e.createElementVNode("div", xn, [
        e.createElementVNode(
          "span",
          Rn,
          e.toDisplayString(n.$t("当前项目")),
          1
          /* TEXT */
        ),
        e.createElementVNode("select", {
          value: e.unref(l).state.value.currentId,
          disabled: f.value,
          onChange: rt
        }, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(l).state.value.projects, (o) => (e.openBlock(), e.createElementBlock("option", {
              key: o.id,
              value: o.id
            }, e.toDisplayString(o.name) + e.toDisplayString(o.notice?.projectCode ? ` · ${o.notice.projectCode}` : ""), 9, Mn))),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 40, On),
        e.createElementVNode("button", {
          type: "button",
          class: "bw-btn sm",
          disabled: f.value,
          onClick: st
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
        ], 8, Fn),
        e.createElementVNode("button", {
          type: "button",
          class: "bw-btn sm danger",
          disabled: f.value || e.unref(l).state.value.projects.length <= 1,
          onClick: it
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
        ], 8, Wn),
        e.unref(a) ? (e.openBlock(), e.createElementBlock(
          "span",
          Pn,
          e.toDisplayString(n.$t("更新于 {t}", { t: e.unref(qe)(e.unref(a).updatedAt) })),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("div", qn, [
        e.createElementVNode("span", zn, [
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
        }, e.toDisplayString(e.unref(l).docRoot.value || n.$t("（读取中）")), 9, Gn),
        e.createElementVNode("button", {
          type: "button",
          class: "bw-btn sm",
          disabled: f.value,
          onClick: ot
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
        ], 8, Hn),
        e.createElementVNode("button", {
          type: "button",
          class: "bw-btn sm",
          disabled: !e.unref(l).docRoot.value,
          onClick: t[0] || (t[0] = (o) => e.unref(Y.openPath)(nt.value || e.unref(l).docRoot.value, !0))
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
        ], 8, Jn),
        tt.value ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "bw-btn sm",
          disabled: f.value,
          onClick: lt
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
        ], 8, Xn)) : e.createCommentVNode("v-if", !0),
        e.createElementVNode(
          "span",
          Zn,
          e.toDisplayString(n.$t("生成的 Word / PDF / 自检表按项目名建子目录放这里；换位置只影响以后导出的文件。")),
          1
          /* TEXT */
        )
      ]),
      e.createCommentVNode(" 手填内容要不要沉淀成知识 —— 页面级开关，第 4 步的公司资料与第 5/6 步的缺料表都按它走 "),
      e.createElementVNode("div", Qn, [
        e.createElementVNode("span", Yn, [
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
          onClick: t[1] || (t[1] = (o) => ce(!x.value))
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
        ], 10, eo),
        e.createElementVNode(
          "span",
          to,
          e.toDisplayString(x.value ? n.$t("报价、工期这类一次性的信息建议关掉，免得污染知识库。") : n.$t("公司名称、资质编号这类下次还要用的，建议打开存下来。")),
          1
          /* TEXT */
        )
      ]),
      e.unref(l).llmReady.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", no, [
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
      e.createVNode(Jt, {
        metas: e.unref(l).metas,
        runtime: e.unref(l).runtime,
        "current-key": e.unref(l).currentKey.value,
        live: e.unref(l).live.value,
        onJump: e.unref(ee)
      }, null, 8, ["metas", "runtime", "current-key", "live", "onJump"]),
      e.unref(a) ? (e.openBlock(), e.createElementBlock("div", oo, [
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
            e.createElementVNode("div", lo, [
              e.createElementVNode("label", ao, [
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
                }, null, 40, ro), [
                  [e.vModelText, e.unref(a).name]
                ])
              ]),
              e.createElementVNode("label", so, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("投标人（我方公司）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("span", io, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": t[4] || (t[4] = (o) => e.unref(a).bidder = o),
                    type: "text",
                    placeholder: e.unref(l).defaultBidder.value || n.$t("填我方公司全称，或从知识库带出"),
                    onChange: t[5] || (t[5] = (o) => e.unref(l).save())
                  }, null, 40, co), [
                    [e.vModelText, e.unref(a).bidder]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "bw-btn sm",
                    disabled: te.value,
                    title: n.$t("从知识库读取公司名称"),
                    onClick: at
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
                  ], 8, uo)
                ])
              ]),
              e.createElementVNode("label", mo, [
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
                      po,
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
              e.createElementVNode("label", vo, [
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
              e.createElementVNode("label", fo, [
                e.createElementVNode("span", bo, [
                  e.createTextVNode(
                    e.toDisplayString(n.$t("投标目标（想靠什么赢下这一标，会直接进写作要求）")) + " ",
                    1
                    /* TEXT */
                  ),
                  M.value ? (e.openBlock(), e.createElementBlock("em", go, [
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
                    yo,
                    e.toDisplayString(n.$t("大脑不可用，这句是本地拼的，请自行修改")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.unref(a).strategies.length ? (e.openBlock(), e.createElementBlock("button", {
                    key: 2,
                    type: "button",
                    class: "bw-btn sm",
                    disabled: M.value,
                    onClick: t[10] || (t[10] = (o) => he(!0))
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
                  ], 8, Vo)) : e.createCommentVNode("v-if", !0)
                ]),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": t[11] || (t[11] = (o) => e.unref(a).goal = o),
                  rows: "3",
                  placeholder: n.$t("点下面的侧重标签会自动写一段；也可以直接自己写。"),
                  onChange: dt
                }, null, 40, No), [
                  [e.vModelText, e.unref(a).goal]
                ])
              ])
            ]),
            ve.value ? (e.openBlock(), e.createElementBlock("p", wo, [
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
                e.toDisplayString(ve.value),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn sm",
                onClick: Ce
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
            e.createElementVNode("div", ko, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(T), (o) => (e.openBlock(), e.createElementBlock("button", {
                  key: o.key,
                  type: "button",
                  class: e.normalizeClass(["bw-chip", { on: e.unref(a).strategies.includes(o.label) }]),
                  disabled: M.value,
                  onClick: (i) => ct(o.label)
                }, e.toDisplayString(o.label), 11, Eo))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("p", ho, [
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
            e.createElementVNode("div", So, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value,
                onClick: mt
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
              ], 8, _o)
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
            J.value.length ? (e.openBlock(), e.createElementBlock("span", $o, [
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
            e.createElementVNode("div", Do, [
              e.createElementVNode("label", Co, [
                e.createElementVNode("span", Bo, [
                  e.createTextVNode(
                    e.toDisplayString(n.$t("按投标目标检索招标公告")) + " ",
                    1
                    /* TEXT */
                  ),
                  v.value ? (e.openBlock(), e.createElementBlock("em", To, [
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
                e.createElementVNode("span", Ao, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": t[12] || (t[12] = (o) => C.value = o),
                    type: "text",
                    placeholder: n.$t("关键词，留空按项目名与投标目标自动取（可加地区、采购人）"),
                    onKeyup: e.withKeys(Se, ["enter"])
                  }, null, 40, jo), [
                    [e.vModelText, C.value]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "bw-btn primary",
                    disabled: v.value,
                    onClick: Se
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(v.value ? "ri-loader-4-line bw-spin" : "ri-search-line")
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
                  ], 8, Lo)
                ])
              ])
            ]),
            y.value.length ? (e.openBlock(), e.createElementBlock("div", Uo, [
              e.createElementVNode("header", Ko, [
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
                  Io,
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
                  xo,
                  e.toDisplayString(n.$t("内置浏览器检索")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("div", Ro, [
                e.createElementVNode("table", Oo, [
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
                          e.createElementVNode("div", Mo, [
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
                            Fo,
                            e.toDisplayString(o.snippet),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", Wo, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm primary",
                            disabled: f.value,
                            onClick: (i) => pt(o)
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
                          ], 8, Po),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm",
                            onClick: (i) => vt(o.url)
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
                          ], 8, qo)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : E.value ? (e.openBlock(), e.createElementBlock("p", zo, [
              t[67] || (t[67] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(E.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", Go, [
              e.createElementVNode("label", Ho, [
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
            e.createElementVNode("div", Jo, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value || !e.unref(a).siteUrl.trim(),
                onClick: _e
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
              ], 8, Xo),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: f.value || !e.unref(a).siteUrl.trim(),
                onClick: bt
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
              ], 8, Zo),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: f.value,
                onClick: gt
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
              ], 8, Qo),
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
                disabled: f.value || V.value.trim().length < 100,
                onClick: $e
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
              ], 8, Yo)
            ]),
            e.createElementVNode("p", el, [
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
            e.createElementVNode("label", tl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(n.$t("公告正文（可直接粘贴或修改）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("textarea", {
                "onUpdate:modelValue": t[15] || (t[15] = (o) => V.value = o),
                rows: "8",
                placeholder: n.$t("抓取或上传后正文会出现在这里；也可以直接把公告全文粘进来。"),
                onChange: ft
              }, null, 40, nl), [
                [e.vModelText, V.value]
              ])
            ]),
            k.value.length ? (e.openBlock(), e.createElementBlock("div", ol, [
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
                e.toDisplayString(k.value.join(`
`)),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            Ze.value ? (e.openBlock(), e.createElementBlock("p", ll, [
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
                disabled: f.value || V.value.trim().length < 100,
                onClick: $e
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
              ], 8, al)
            ])) : e.createCommentVNode("v-if", !0),
            Qe.value ? (e.openBlock(), e.createElementBlock("div", rl, [
              e.createElementVNode("header", sl, [
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
                }, e.toDisplayString(e.unref(a).notice.url), 9, il)) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("div", cl, [
                e.createElementVNode("div", dl, [
                  e.createElementVNode("label", ul, [
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
                  e.createElementVNode("label", ml, [
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
                  e.createElementVNode("label", pl, [
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
                  e.createElementVNode("label", vl, [
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
                  e.createElementVNode("label", fl, [
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
                  e.createElementVNode("label", bl, [
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
                  e.createElementVNode("label", gl, [
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
                  e.createElementVNode("label", yl, [
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
            e.unref(a).notice.attachments?.length ? (e.openBlock(), e.createElementBlock("div", Vl, [
              e.createElementVNode("header", Nl, [
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
              e.createElementVNode("div", wl, [
                e.createElementVNode("ul", kl, [
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
                      }, e.toDisplayString(o.name || o.url), 9, El)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("p", hl, [
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
            J.value.length ? (e.openBlock(), e.createElementBlock("div", Sl, [
              e.createElementVNode("header", _l, [
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
                  e.renderList(Ye.value, (o) => (e.openBlock(), e.createElementBlock(
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
                  onClick: yt
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
              e.createElementVNode("div", $l, [
                e.createElementVNode("table", Dl, [
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
                        e.createElementVNode("td", Cl, [
                          e.withDirectives(e.createElementVNode("select", {
                            "onUpdate:modelValue": (i) => o.kind = i,
                            onChange: t[32] || (t[32] = (i) => e.unref(l).save())
                          }, [
                            (e.openBlock(), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(w, (i) => e.createElementVNode("option", {
                                key: i,
                                value: i
                              }, e.toDisplayString(e.unref(Pe)(i)), 9, Tl)),
                              64
                              /* STABLE_FRAGMENT */
                            ))
                          ], 40, Bl), [
                            [e.vModelSelect, o.kind]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("textarea", {
                            "onUpdate:modelValue": (i) => o.text = i,
                            rows: "2",
                            onChange: t[33] || (t[33] = (i) => e.unref(l).save())
                          }, null, 40, Al), [
                            [e.vModelText, o.text]
                          ])
                        ]),
                        e.createElementVNode(
                          "td",
                          jl,
                          e.toDisplayString(o.points ?? "—"),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", Ll, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm danger",
                            onClick: (i) => Vt(o.id)
                          }, [...t[85] || (t[85] = [
                            e.createElementVNode(
                              "i",
                              { class: "ri-delete-bin-line" },
                              null,
                              -1
                              /* CACHED */
                            )
                          ])], 8, Ul)
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
            e.unref(a).template ? (e.openBlock(), e.createElementBlock("span", Kl, [
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
            e.createElementVNode("div", Il, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value,
                onClick: Nt
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
              ], 8, xl),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: f.value,
                onClick: wt
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
              ], 8, Rl),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: f.value,
                onClick: Et
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
              ], 8, Ol)
            ]),
            e.createElementVNode("p", Ml, [
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
            N.value.length ? (e.openBlock(), e.createElementBlock("div", Fl, [
              e.createElementVNode("header", Wl, [
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
              e.createElementVNode("div", Pl, [
                e.createElementVNode("table", ql, [
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(N.value, (o) => (e.openBlock(), e.createElementBlock("tr", {
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
                          zl,
                          e.toDisplayString(o.reason),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", Gl, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm primary",
                            disabled: f.value,
                            onClick: (i) => kt(o.docId)
                          }, e.toDisplayString(n.$t("用这份")), 9, Hl)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : _.value ? (e.openBlock(), e.createElementBlock("p", Jl, [
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
            e.unref(a).sections.length ? (e.openBlock(), e.createElementBlock("div", Xl, [
              e.createElementVNode("header", Zl, [
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
                  onClick: St
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
                  onClick: ht
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
                ], 8, Ql)
              ]),
              e.createElementVNode("div", Yl, [
                e.createElementVNode("div", ea, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(a).sections, (o, i) => (e.openBlock(), e.createElementBlock("div", {
                      key: o.id,
                      class: "bw-section"
                    }, [
                      e.createElementVNode("div", ta, [
                        e.withDirectives(e.createElementVNode("select", {
                          "onUpdate:modelValue": (u) => o.level = u,
                          class: "bw-btn sm",
                          onChange: t[34] || (t[34] = (u) => e.unref(l).save())
                        }, [
                          e.createElementVNode(
                            "option",
                            oa,
                            e.toDisplayString(n.$t("一级")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            la,
                            e.toDisplayString(n.$t("二级")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            aa,
                            e.toDisplayString(n.$t("三级")),
                            1
                            /* TEXT */
                          )
                        ], 40, na), [
                          [
                            e.vModelSelect,
                            o.level,
                            void 0,
                            { number: !0 }
                          ]
                        ]),
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (u) => o.title = u,
                          type: "text",
                          class: e.normalizeClass(["title", `lv${o.level}`]),
                          onChange: t[35] || (t[35] = (u) => e.unref(l).save())
                        }, null, 42, ra), [
                          [e.vModelText, o.title]
                        ]),
                        e.createElementVNode("label", sa, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (u) => o.required = u,
                            type: "checkbox",
                            onChange: t[36] || (t[36] = (u) => e.unref(l).save())
                          }, null, 40, ia), [
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
                          disabled: i === 0,
                          onClick: (u) => De(i, -1)
                        }, [...t[97] || (t[97] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-arrow-up-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, ca),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "bw-btn sm",
                          disabled: i === e.unref(a).sections.length - 1,
                          onClick: (u) => De(i, 1)
                        }, [...t[98] || (t[98] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-arrow-down-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, da),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "bw-btn sm danger",
                          onClick: (u) => _t(o.id)
                        }, [...t[99] || (t[99] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-delete-bin-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, ua)
                      ]),
                      o.guide ? (e.openBlock(), e.createElementBlock("div", ma, [
                        e.createElementVNode("p", pa, [
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
            e.createElementVNode("div", va, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value,
                onClick: t[37] || (t[37] = (o) => Be(!1))
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
              ], 8, fa),
              X.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "bw-btn",
                disabled: f.value,
                title: n.$t("把手填的值全部丢掉，一律用知识库里的"),
                onClick: t[38] || (t[38] = (o) => Be(!0))
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
              ], 8, ba)) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                onClick: Ce
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
            e.unref(a).company.length ? (e.openBlock(), e.createElementBlock("div", ga, [
              e.createElementVNode("header", ya, [
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
                    class: e.normalizeClass(["bw-chip static", ue.value ? "warn" : "ok"])
                  },
                  e.toDisplayString(ue.value ? n.$t("缺 {n} 项", { n: ue.value }) : n.$t("都齐了")),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              e.createElementVNode("div", Va, [
                e.createElementVNode("table", Na, [
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
                          wa,
                          e.toDisplayString(o.label),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("textarea", {
                            "onUpdate:modelValue": (i) => o.value = i,
                            rows: "1",
                            onChange: (i) => $t(o)
                          }, null, 40, ka), [
                            [e.vModelText, o.value]
                          ])
                        ]),
                        e.createElementVNode("td", Ea, [
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
            X.value ? (e.openBlock(), e.createElementBlock("p", ha, [
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
                onClick: At
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
              ], 8, Sa)
            ])) : e.createCommentVNode("v-if", !0),
            e.unref(a).qualifications.length ? (e.openBlock(), e.createElementBlock("div", _a, [
              e.createElementVNode("header", $a, [
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
                Ne.value ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Da,
                  e.toDisplayString(n.$t("{n} 条不满足", { n: Ne.value })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                we.value ? (e.openBlock(), e.createElementBlock(
                  "span",
                  Ca,
                  e.toDisplayString(n.$t("{n} 条待确认", { n: we.value })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("div", Ba, [
                e.createElementVNode("table", Ta, [
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
                        e.createElementVNode("td", Aa, [
                          e.withDirectives(e.createElementVNode("select", {
                            "onUpdate:modelValue": (i) => o.verdict = i,
                            onChange: t[39] || (t[39] = (i) => e.unref(l).save())
                          }, [
                            e.createElementVNode(
                              "option",
                              La,
                              e.toDisplayString(n.$t("满足")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "option",
                              Ua,
                              e.toDisplayString(n.$t("不满足")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "option",
                              Ka,
                              e.toDisplayString(n.$t("待确认")),
                              1
                              /* TEXT */
                            )
                          ], 40, ja), [
                            [e.vModelSelect, o.verdict]
                          ])
                        ]),
                        e.createElementVNode(
                          "td",
                          Ia,
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
                e.createElementVNode("p", xa, [
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
            j.value.length ? (e.openBlock(), e.createElementBlock("div", Ra, [
              e.createElementVNode("header", Oa, [
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
              e.createElementVNode("div", Ma, [
                e.createElementVNode("ul", Fa, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(j.value, (o) => (e.openBlock(), e.createElementBlock(
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
              Wa,
              e.toDisplayString(n.$t("{done} / {total} 章已完成", { done: me.value, total: e.unref(a).sections.length })),
              1
              /* TEXT */
            ),
            ke.value ? (e.openBlock(), e.createElementBlock(
              "span",
              Pa,
              e.toDisplayString(n.$t("{n} 处待补充", { n: ke.value })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          default: e.withCtx(() => [
            e.createVNode(Re, {
              sections: e.unref(a).sections,
              busy: G.value,
              remember: x.value,
              onApply: je,
              "onUpdate:remember": ce
            }, null, 8, ["sections", "busy", "remember"]),
            e.createElementVNode("div", qa, [
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value || !pe.value,
                onClick: Bt
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
              ], 8, za),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: !h.value,
                onClick: Tt
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
              ], 8, Ga),
              t[113] || (t[113] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              h.value ? (e.openBlock(), e.createElementBlock(
                "span",
                Ha,
                e.toDisplayString(n.$t("正在写：{t}", { t: B.value })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            pe.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Ja, [
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
            e.createElementVNode("div", Xa, [
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
                    e.createElementVNode("div", Za, [
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
                        e.toDisplayString(e.unref(Tn)(o.state)),
                        3
                        /* TEXT, CLASS */
                      ),
                      o.wordCount ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Qa,
                        e.toDisplayString(n.$t("{n} 字", { n: o.wordCount })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      o.edited ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Ya,
                        e.toDisplayString(n.$t("手工改过")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "bw-btn sm primary",
                        disabled: f.value || !pe.value,
                        onClick: (i) => Ae(o.id)
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
                      ], 8, er),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "bw-btn sm",
                        onClick: (i) => Dt(o.id)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(d.has(o.id) ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line")
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
                      ], 8, tr)
                    ]),
                    o.state === "failed" && o.error ? (e.openBlock(), e.createElementBlock("p", nr, [
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
                    d.has(o.id) ? (e.openBlock(), e.createElementBlock("div", or, [
                      o.guide ? (e.openBlock(), e.createElementBlock("p", lr, [
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
                      e.createElementVNode("label", ar, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(n.$t("重写意见（可空）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (i) => p[o.id] = i,
                          type: "text",
                          placeholder: n.$t("例：突出运维响应时效，补一段应急预案")
                        }, null, 8, rr), [
                          [e.vModelText, p[o.id]]
                        ])
                      ]),
                      e.withDirectives(e.createElementVNode("textarea", {
                        "onUpdate:modelValue": (i) => o.content = i,
                        placeholder: n.$t("这一章还没有正文。点「生成」让 AI 按招标要求写，或者直接在这里手写。"),
                        onChange: (i) => Ct(o)
                      }, null, 40, sr), [
                        [e.vModelText, o.content]
                      ]),
                      o.placeholders?.length ? (e.openBlock(), e.createElementBlock("div", ir, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(o.placeholders, (i) => (e.openBlock(), e.createElementBlock("span", {
                            key: i,
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
                              e.toDisplayString(i),
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
            e.createElementVNode("div", cr, [
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
              ], 8, dr),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn",
                disabled: f.value || !Ee.value,
                onClick: t[41] || (t[41] = (o) => Ue(!0))
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
              ], 8, ur),
              e.createElementVNode("button", {
                type: "button",
                class: "bw-btn primary",
                disabled: f.value || !Ee.value || oe.value,
                title: oe.value ? n.$t("先处理掉阻断项") : "",
                onClick: t[42] || (t[42] = (o) => Ue(!1))
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
              ], 8, mr)
            ]),
            e.createVNode(Re, {
              sections: e.unref(a).sections,
              busy: G.value,
              remember: x.value,
              onApply: je,
              "onUpdate:remember": ce
            }, null, 8, ["sections", "busy", "remember"]),
            e.unref(a).compliance.length ? (e.openBlock(), e.createElementBlock("div", pr, [
              e.createElementVNode("header", vr, [
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
                ne.value ? (e.openBlock(), e.createElementBlock("em", fr, [
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
              e.createElementVNode("div", br, [
                e.createElementVNode("table", gr, [
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(a).compliance, (o) => (e.openBlock(), e.createElementBlock("tr", {
                        key: o.id
                      }, [
                        e.createElementVNode("td", yr, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["bw-chip static", o.level === "blocker" ? "bad" : o.level === "warning" ? "warn" : "ok"])
                            },
                            e.toDisplayString(e.unref(Bn)(o.level)),
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
                            Vr,
                            e.toDisplayString(o.detail),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("td", Nr, [
                          o.stepKey ? (e.openBlock(), e.createElementBlock("button", {
                            key: 0,
                            type: "button",
                            class: "bw-btn sm",
                            onClick: (i) => e.unref(ee)(o.stepKey)
                          }, e.toDisplayString(n.$t("去处理")), 9, wr)) : e.createCommentVNode("v-if", !0),
                          o.level !== "ok" ? (e.openBlock(), e.createElementBlock("button", {
                            key: 1,
                            type: "button",
                            class: "bw-btn sm",
                            title: n.$t("我已核对过，这条不再阻断导出（自检表里仍会列出）"),
                            onClick: (i) => Lt(o.id)
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
                          ], 8, kr)) : jt(o.id) ? (e.openBlock(), e.createElementBlock("button", {
                            key: 2,
                            type: "button",
                            class: "bw-btn sm",
                            onClick: (i) => Ut(o.id)
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
                          ], 8, Er)) : e.createCommentVNode("v-if", !0)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            e.unref(a).exports.length ? (e.openBlock(), e.createElementBlock("div", hr, [
              e.createElementVNode("header", Sr, [
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
              e.createElementVNode("div", _r, [
                e.createElementVNode("table", $r, [
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(a).exports, (o, i) => (e.openBlock(), e.createElementBlock("tr", {
                        key: `${o.path}_${i}`
                      }, [
                        e.createElementVNode(
                          "td",
                          Dr,
                          e.toDisplayString(et(o.path)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", Cr, [
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
                          Br,
                          e.toDisplayString(e.unref(qe)(o.at)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", Tr, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm",
                            onClick: (u) => e.unref(Y.openPath)(o.path)
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
                          ], 8, Ar),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "bw-btn sm",
                            onClick: (u) => e.unref(Y.openPath)(o.path, !0)
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
                          ], 8, jr)
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
  Lr as default
};
