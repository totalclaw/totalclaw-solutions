const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const l = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!l) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
l.default;
const ze = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!ze) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Ie = ze.default, de = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!de) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
de.default;
const Te = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!Te) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
Te.default;
const K = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!K) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
K.default;
async function _(I, w) {
  const B = window.electronAPI?.workbenches?.campusAi;
  if (!B?.invoke) throw new Error(l.t("高校一体化AI智能体接口不可用，请重启应用"));
  return B.invoke(I, Te.toPlain(w ?? {}));
}
function Pe(I) {
  const w = window.electronAPI?.workbenches?.campusAi;
  return w?.onEvent ? w.onEvent(I) : () => {
  };
}
const R = e.ref(null), we = e.ref([]), ue = e.ref({ message: "" });
let Ae = "";
async function J() {
  const I = await _("state.get");
  R.value = I;
  const w = I.warn ? `${I.warn.id}:${I.warn.computedAt}` : "";
  return (w !== Ae || w && !we.value.length) && (we.value = w ? await _("warn.results") : [], Ae = w), I;
}
function te(I, w = !1) {
  return _("path.open", { path: I, reveal: w });
}
const Ke = /\.(pdf|docx?|txt|md|xlsx|xls|csv|pptx|html?)$/i;
function ve(I) {
  return { faq: l.t("FAQ 审定答案"), answer: l.t("依据原文作答"), quote: l.t("原文摘录"), no_evidence: l.t("无依据·已转办"), sensitive: l.t("敏感·已置顶转办") }[I];
}
function Fe(I) {
  return { faq: "ok", answer: "brand", quote: "brand", no_evidence: "warn", sensitive: "bad" }[I];
}
function We(I) {
  return { pending: l.t("待构建"), building: l.t("构建中"), built: l.t("已就绪"), failed: l.t("失败") }[I];
}
function Re(I) {
  return { pending: "", building: "brand", built: "ok", failed: "bad" }[I];
}
function Qe(I) {
  return { open: l.t("待答复"), answered: l.t("已答复"), closed: l.t("已关闭") }[I];
}
function ye(I) {
  return { red: l.t("红色预警"), orange: l.t("橙色预警"), yellow: l.t("黄色预警") }[I];
}
function _e(I) {
  return I === "red" ? "bad" : I === "orange" ? "warn" : I === "yellow" ? "brand" : "";
}
function je(I) {
  return { pending: l.t("待复核"), confirmed: l.t("已确认"), dismissed: l.t("不预警") }[I];
}
function Be(I) {
  return { roster: l.t("学生名单"), grades: l.t("课程成绩"), attendance: l.t("考勤") }[I];
}
function Ge(I) {
  return {
    roster: l.t("学号、姓名必填；班级、学院、专业、辅导员、辅导员邮箱可选（发邮件要用辅导员邮箱）"),
    grades: l.t("学号、课程、成绩必填；学分、学期可选。补考 / 重修多条取最好的一次"),
    attendance: l.t("学号 + 缺勤次数（可带应到次数），或学号 + 每次的考勤状态；没有考勤也能算，只是缺勤率不作为门槛")
  }[I];
}
const Ce = (I, w = 1) => I == null ? "—" : `${(I * 100).toFixed(w)}%`, Je = {
  key: 0,
  class: "ca-hud",
  "data-test": "ca-hud"
}, He = { class: "hud-top" }, Ye = { class: "hud-title" }, Xe = {
  class: "hud-clock",
  "aria-live": "off"
}, Ze = { class: "hud-lights" }, xe = { class: "hud-main" }, et = { class: "hud-col" }, tt = ["aria-label"], lt = ["stroke-dasharray"], nt = { class: "hud-gauge__label" }, ot = ["aria-label"], st = {
  class: "hud-orbit",
  viewBox: "0 0 400 400",
  "aria-hidden": "true"
}, at = ["x2", "y2"], it = { class: "hud-crest" }, rt = ["src"], ct = {
  key: 1,
  class: "ri-government-line"
}, dt = { class: "hud-col hud-readouts" }, ut = { class: "hud-bottom" }, mt = { class: "hud-panel" }, pt = ["aria-label"], vt = ["title"], yt = { class: "hud-panel" }, kt = { class: "hud-domains" }, gt = {
  key: 0,
  class: "empty"
}, Nt = { class: "hud-panel" }, Vt = { class: "hud-feed" }, Et = {
  key: 0,
  class: "empty"
}, $t = { class: "hud-panel hud-alerts" }, bt = {
  key: 4,
  class: "hud-clear"
}, ht = /* @__PURE__ */ e.defineComponent({
  __name: "OverviewTab",
  emits: ["go"],
  setup(I) {
    const w = e.computed(() => R.value), B = e.computed(() => R.value?.stats || null), h = (o) => ({ plan: l.t("规划建设运维"), teach: l.t("教学"), research: l.t("科研"), gov: l.t("校务治理"), service: l.t("师生服务") })[o], k = e.computed(() => de.CA_DIRECTIONS.map((o, N) => {
      const v = (-90 + N * 72) * (Math.PI / 180), D = B.value.directions[o];
      return { key: o, label: h(o), x: 200 + Math.cos(v) * 166, y: 200 + Math.sin(v) * 166, live: D.live, total: D.scenarios, usage: D.usage30d };
    })), f = e.computed(() => {
      const o = B.value, N = Object.values(o.directions).reduce((v, D) => ({ live: v.live + D.live, all: v.all + D.scenarios }), { live: 0, all: 0 });
      return [
        { key: "auto", label: l.t("自动答复率"), ratio: o.autoRate ?? 0, text: Ce(o.autoRate, 0), tone: "cyan" },
        { key: "kb", label: l.t("知识库就绪"), ratio: o.docs ? o.docsBuilt / o.docs : 0, text: o.docs ? Ce(o.docsBuilt / o.docs, 0) : "—", tone: "teal" },
        { key: "apps", label: l.t("场景上线"), ratio: N.all ? N.live / N.all : 0, text: N.all ? `${N.live}/${N.all}` : "—", tone: "amber" }
      ];
    }), U = e.computed(() => {
      const o = B.value;
      return [
        { label: l.t("近 7 天问答"), value: String(o.qa7d), tone: "" },
        { label: l.t("知识分段"), value: String(o.chunks), tone: "" },
        { label: l.t("FAQ"), value: String(o.faqs), tone: "" },
        { label: l.t("课程 / 题库"), value: `${o.courses} / ${o.questions}`, tone: "" },
        { label: l.t("科研成果"), value: String(o.outputs), tone: "" },
        { label: l.t("待答复转办"), value: String(o.openTickets), tone: o.openTickets ? "warn" : "" }
      ];
    }), C = e.computed(() => Math.max(1, ...(B.value?.byDay || []).map((o) => o.qa))), V = (o) => o ? Math.max(5, o / C.value * 100) : 0, L = e.computed(() => Math.max(1, ...(B.value?.byDomain || []).map((o) => o.count))), q = (o) => {
      const N = new Date(o);
      return `${String(N.getHours()).padStart(2, "0")}:${String(N.getMinutes()).padStart(2, "0")}`;
    }, P = (o) => ({ faq: "FAQ", answer: l.t("原文作答"), quote: l.t("原文摘录"), no_evidence: l.t("转办"), sensitive: l.t("敏感") })[o], F = e.ref({ time: "", date: "" }), y = () => {
      const o = /* @__PURE__ */ new Date(), N = (v) => String(v).padStart(2, "0");
      F.value = { time: `${N(o.getHours())}:${N(o.getMinutes())}:${N(o.getSeconds())}`, date: `${o.getFullYear()}-${N(o.getMonth() + 1)}-${N(o.getDate())}` };
    };
    let $ = null;
    return e.onMounted(() => {
      y(), $ = setInterval(y, 1e3);
    }), e.onBeforeUnmount(() => {
      $ && clearInterval($);
    }), (o, N) => B.value && w.value ? (e.openBlock(), e.createElementBlock("div", Je, [
      e.createCommentVNode(" 顶栏：标题、时钟、服务灯 "),
      e.createElementVNode("header", He, [
        e.createElementVNode("div", Ye, [
          N[5] || (N[5] = e.createElementVNode(
            "span",
            { class: "hud-title__mark" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "h2",
              null,
              e.toDisplayString(o.$t("校级 AI 中枢")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(w.value.settings.schoolName || o.$t("高校一体化AI智能体")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Xe, [
          e.createElementVNode(
            "b",
            null,
            e.toDisplayString(F.value.time),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(F.value.date),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("ul", Ze, [
          e.createElementVNode(
            "li",
            {
              class: e.normalizeClass(w.value.model ? "on" : "off")
            },
            [
              N[6] || (N[6] = e.createElementVNode(
                "i",
                null,
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(o.$t("大模型")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "li",
            {
              class: e.normalizeClass(B.value.docsBuilt ? "on" : "off")
            },
            [
              N[7] || (N[7] = e.createElementVNode(
                "i",
                null,
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(o.$t("知识库")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "li",
            {
              class: e.normalizeClass(w.value.mobile.running ? "on" : "off")
            },
            [
              N[8] || (N[8] = e.createElementVNode(
                "i",
                null,
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(o.$t("手机端")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "li",
            {
              class: e.normalizeClass(B.value.sensitiveOpen ? "alert" : "on")
            },
            [
              N[9] || (N[9] = e.createElementVNode(
                "i",
                null,
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(o.$t("心理关怀")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ])
      ]),
      e.createElementVNode("div", xe, [
        e.createCommentVNode(" 左：仪表 "),
        e.createElementVNode("section", et, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(f.value, (v) => (e.openBlock(), e.createElementBlock("div", {
              class: "hud-gauge",
              key: v.key
            }, [
              (e.openBlock(), e.createElementBlock("svg", {
                viewBox: "0 0 120 120",
                role: "img",
                "aria-label": `${v.label} ${v.text}`
              }, [
                N[10] || (N[10] = e.createElementVNode(
                  "circle",
                  {
                    class: "track",
                    cx: "60",
                    cy: "60",
                    r: "50"
                  },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode("circle", {
                  class: e.normalizeClass(["value", v.tone]),
                  cx: "60",
                  cy: "60",
                  r: "50",
                  "stroke-dasharray": `${v.ratio * 314.16} 314.16`
                }, null, 10, lt)
              ], 8, tt)),
              e.createElementVNode("div", nt, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(v.text),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(v.label),
                  1
                  /* TEXT */
                )
              ])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        e.createCommentVNode(" 中：五大方向轨道 "),
        e.createElementVNode("section", {
          class: "hud-core",
          "aria-label": o.$t("五大方向")
        }, [
          (e.openBlock(), e.createElementBlock("svg", st, [
            N[11] || (N[11] = e.createElementVNode(
              "circle",
              {
                class: "ring r1",
                cx: "200",
                cy: "200",
                r: "182"
              },
              null,
              -1
              /* CACHED */
            )),
            N[12] || (N[12] = e.createElementVNode(
              "circle",
              {
                class: "ring r2",
                cx: "200",
                cy: "200",
                r: "150"
              },
              null,
              -1
              /* CACHED */
            )),
            N[13] || (N[13] = e.createElementVNode(
              "circle",
              {
                class: "arc a1",
                cx: "200",
                cy: "200",
                r: "166"
              },
              null,
              -1
              /* CACHED */
            )),
            N[14] || (N[14] = e.createElementVNode(
              "circle",
              {
                class: "arc a2",
                cx: "200",
                cy: "200",
                r: "118"
              },
              null,
              -1
              /* CACHED */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(k.value, (v) => (e.openBlock(), e.createElementBlock("line", {
                key: `l-${v.key}`,
                class: "spoke",
                x1: "200",
                y1: "200",
                x2: v.x,
                y2: v.y
              }, null, 8, at))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])),
          e.createElementVNode("div", it, [
            w.value.logo ? (e.openBlock(), e.createElementBlock("img", {
              key: 0,
              src: w.value.logo,
              alt: ""
            }, null, 8, rt)) : (e.openBlock(), e.createElementBlock("i", ct))
          ]),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(k.value, (v) => (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: v.key,
                type: "button",
                class: "hud-node",
                style: e.normalizeStyle({ left: `${v.x / 400 * 100}%`, top: `${v.y / 400 * 100}%` }),
                onClick: N[0] || (N[0] = (D) => o.$emit("go", "apps"))
              },
              [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(v.label),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(o.$t("{a}/{b} 上线", { a: v.live, b: v.total })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "em",
                  null,
                  e.toDisplayString(o.$t("30 天 {n} 次", { n: v.usage })),
                  1
                  /* TEXT */
                )
              ],
              4
              /* STYLE */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 8, ot),
        e.createCommentVNode(" 右：读数 "),
        e.createElementVNode("section", dt, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(U.value, (v) => (e.openBlock(), e.createElementBlock(
              "div",
              {
                key: v.label,
                class: e.normalizeClass(["hud-readout", v.tone])
              },
              [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(v.label),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(v.value),
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
      ]),
      e.createElementVNode("div", ut, [
        e.createElementVNode("section", mt, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(o.$t("近 14 天问答")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", {
            class: "hud-bars",
            role: "img",
            "aria-label": o.$t("近 14 天问答")
          }, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(B.value.byDay, (v) => (e.openBlock(), e.createElementBlock("div", {
                key: v.day,
                class: "hud-bar",
                title: o.$t("{day}：{a} 次，自动答复 {b}", { day: v.day, a: v.qa, b: v.auto })
              }, [
                e.createElementVNode(
                  "span",
                  {
                    class: "hud-bar__all",
                    style: e.normalizeStyle({ height: `${V(v.qa)}%` })
                  },
                  [
                    e.createElementVNode(
                      "span",
                      {
                        class: "hud-bar__auto",
                        style: e.normalizeStyle({ height: v.qa ? `${v.auto / v.qa * 100}%` : "0" })
                      },
                      null,
                      4
                      /* STYLE */
                    )
                  ],
                  4
                  /* STYLE */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(v.day.slice(8)),
                  1
                  /* TEXT */
                )
              ], 8, vt))),
              128
              /* KEYED_FRAGMENT */
            ))
          ], 8, pt)
        ]),
        e.createElementVNode("section", yt, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(o.$t("诉求领域")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", kt, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(B.value.byDomain.slice(0, 6), (v) => (e.openBlock(), e.createElementBlock("li", {
                key: v.id
              }, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(v.name),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "i",
                  {
                    style: e.normalizeStyle({ width: `${v.count / L.value * 100}%` })
                  },
                  null,
                  4
                  /* STYLE */
                ),
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(v.count),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            B.value.byDomain.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              gt,
              e.toDisplayString(o.$t("还没有问答")),
              1
              /* TEXT */
            ))
          ])
        ]),
        e.createElementVNode("section", Nt, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(o.$t("实时问答")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", Vt, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(B.value.recent.slice(0, 7), (v, D) => (e.openBlock(), e.createElementBlock(
                "li",
                {
                  key: D,
                  class: e.normalizeClass(v.kind)
                },
                [
                  e.createElementVNode(
                    "time",
                    null,
                    e.toDisplayString(q(v.at)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(v.question),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "em",
                    null,
                    e.toDisplayString(P(v.kind)),
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
            B.value.recent.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              Et,
              e.toDisplayString(o.$t("还没有问答")),
              1
              /* TEXT */
            ))
          ])
        ]),
        e.createElementVNode("section", $t, [
          e.createElementVNode(
            "h3",
            null,
            e.toDisplayString(o.$t("待办")),
            1
            /* TEXT */
          ),
          B.value.sensitiveOpen ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "hud-alert bad",
            onClick: N[1] || (N[1] = (v) => o.$emit("go", "tickets"))
          }, [
            N[15] || (N[15] = e.createElementVNode(
              "i",
              { class: "ri-alarm-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.$t("{n} 条敏感问题待处理", { n: B.value.sensitiveOpen })),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          B.value.openTickets ? (e.openBlock(), e.createElementBlock("button", {
            key: 1,
            type: "button",
            class: "hud-alert",
            onClick: N[2] || (N[2] = (v) => o.$emit("go", "tickets"))
          }, [
            N[16] || (N[16] = e.createElementVNode(
              "i",
              { class: "ri-git-pull-request-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.$t("{n} 个转办待答复", { n: B.value.openTickets })),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          B.value.warnPending ? (e.openBlock(), e.createElementBlock("button", {
            key: 2,
            type: "button",
            class: "hud-alert",
            onClick: N[3] || (N[3] = (v) => o.$emit("go", "warning"))
          }, [
            N[17] || (N[17] = e.createElementVNode(
              "i",
              { class: "ri-user-search-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.$t("{n} 名预警学生待复核", { n: B.value.warnPending })),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          B.value.docs ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
            key: 3,
            type: "button",
            class: "hud-alert",
            onClick: N[4] || (N[4] = (v) => o.$emit("go", "kb"))
          }, [
            N[18] || (N[18] = e.createElementVNode(
              "i",
              { class: "ri-book-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.$t("知识库还是空的")),
              1
              /* TEXT */
            )
          ])),
          !B.value.sensitiveOpen && !B.value.openTickets && !B.value.warnPending && B.value.docs ? (e.openBlock(), e.createElementBlock("p", bt, [
            N[19] || (N[19] = e.createElementVNode(
              "i",
              { class: "ri-shield-check-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(o.$t("当前没有待办")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ])
      ])
    ])) : e.createCommentVNode("v-if", !0);
  }
}), le = (I, w) => {
  const B = I.__vccOpts || I;
  for (const [h, k] of w)
    B[h] = k;
  return B;
}, ft = /* @__PURE__ */ le(ht, [["__scopeId", "data-v-500cdf40"]]), ne = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!ne) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
ne.default;
const qe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!qe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const H = qe.default, Oe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!Oe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const Ve = Oe.default, St = { class: "ss-module" }, Dt = { class: "ss-steps" }, _t = { class: "ss-grid tight" }, Bt = { class: "ss-field" }, wt = ["value"], Ct = { class: "ss-field" }, Tt = ["value"], Lt = ["disabled"], At = { class: "ss-actions" }, Ft = ["disabled"], Mt = { class: "ss-muted" }, zt = {
  key: 0,
  class: "ss-table-wrap tall"
}, qt = { class: "ss-table" }, Ot = { class: "num" }, Ut = { class: "ca-wrap" }, It = ["onClick"], Pt = {
  key: 0,
  class: "ss-muted"
}, Kt = ["value", "onChange"], Wt = ["value"], Rt = ["value", "onChange"], Qt = ["value"], jt = {
  key: 0,
  class: "ri-loader-4-line spin"
}, Gt = {
  key: 0,
  class: "ca-err"
}, Jt = { class: "num" }, Ht = ["disabled", "title", "onClick"], Yt = ["onClick"], Xt = { class: "ss-kpis" }, Zt = { class: "ss-kpi accent" }, xt = { class: "ss-kpi" }, el = { class: "ss-kpi" }, tl = { class: "ss-kpi" }, ll = {
  key: 0,
  class: "ss-note info"
}, nl = { class: "ss-actions" }, ol = ["disabled"], sl = { class: "ss-muted" }, al = ["placeholder"], il = ["disabled"], rl = {
  key: 0,
  class: "ss-note warn"
}, cl = {
  key: 1,
  class: "ss-table-wrap"
}, dl = { class: "ss-table" }, ul = { class: "num" }, ml = { class: "num" }, pl = { class: "ca-wrap" }, vl = {
  key: 2,
  class: "ss-muted"
}, yl = { class: "ss-panel" }, kl = { class: "ss-chip" }, gl = { class: "ss-muted" }, Nl = { class: "ss-actions" }, Vl = ["disabled"], El = ["disabled"], $l = { class: "ss-muted" }, bl = { class: "ss-field" }, hl = { class: "ss-field" }, fl = { class: "ss-field" }, Sl = { class: "ss-field" }, Dl = ["value"], _l = { class: "ss-actions" }, Bl = {
  type: "submit",
  class: "ss-btn primary sm"
}, wl = {
  key: 1,
  class: "ss-table-wrap tall"
}, Cl = { class: "ss-table" }, Tl = { class: "num" }, Ll = { class: "ca-wrap" }, Al = {
  key: 0,
  class: "ss-muted"
}, Fl = { class: "ca-wrap" }, Ml = { class: "num" }, zl = ["onClick"], ql = ["onClick"], Ol = /* @__PURE__ */ e.defineComponent({
  __name: "KbTab",
  setup(I) {
    const w = ne.useNotificationStore(), B = e.computed(() => R.value?.settings), h = e.computed(() => R.value?.docs || []), k = e.computed(() => R.value?.faqs || []), f = e.ref(""), U = e.ref(""), C = e.ref(!1), V = e.ref(""), L = e.ref({}), q = e.ref(""), P = e.ref(null), F = e.ref(""), y = e.ref(null), $ = [
      { key: "kb-import", title: l.t("导入资料"), hint: l.t("各部门的制度、办事指南、通知和 FAQ，选好所属部门再导入") },
      { key: "kb-build", title: l.t("构建索引"), hint: l.t("把文档切成段落、建检索索引，问答只从这里找依据") },
      { key: "kb-test", title: l.t("检索自测"), hint: l.t("用学生常问的问题试一试，看能不能找到对的原文") }
    ], o = e.computed(() => h.value.some((u) => u.status === "building" || u.status === "pending")), N = e.computed(() => ue.value.scope === "kb" ? ue.value.message : ""), v = (u) => h.value.filter((A) => A.status === u).length, D = e.computed(() => {
      const u = L.value, A = h.value.length > 0 || k.value.length > 0, S = v("failed"), j = h.value.length > 0 && v("built") === h.value.length;
      return {
        "kb-import": V.value === "kb-import" || V.value === "kb-demo" ? { state: "running" } : u["kb-import"] ? { state: "failed", error: u["kb-import"] } : A ? { state: "done", summary: l.t("文档 {a} 份，FAQ {b} 条", { a: h.value.length, b: k.value.length }) } : { state: "todo" },
        "kb-build": V.value === "kb-build" || h.value.length && o.value ? { state: "running", kind: "scan" } : u["kb-build"] ? { state: "failed", error: u["kb-build"] } : S ? { state: "failed", error: l.t("{n} 份文档构建失败，原因见第 1 步表格；可删除后换一份重新导入", { n: S }) } : j ? { state: "done", summary: l.t("{a} 份文档，{b} 段可检索", { a: h.value.length, b: R.value?.stats.chunks || 0 }) } : !h.value.length && k.value.length ? { state: "skipped" } : { state: "todo" },
        "kb-test": V.value === "kb-test" ? { state: "running" } : u["kb-test"] ? { state: "failed", error: u["kb-test"] } : P.value ? { state: "done", summary: P.value.length ? l.t("最高分 {p0}：{p1}", { p0: P.value[0].score.toFixed(3), p1: P.value[0].title }) : l.t("没有命中") } : { state: "todo" }
      };
    }), z = e.computed(() => $.find((u) => !["done", "skipped"].includes(D.value[u.key].state))?.key || $[$.length - 1].key), M = (u) => {
      K.scrollToStep(u);
    };
    async function O(u, A) {
      V.value = u, L.value = { ...L.value, [u]: "" };
      try {
        const S = await A();
        return await J(), S;
      } catch (S) {
        return L.value = { ...L.value, [u]: K.errorMessage(S) }, w.error(K.errorMessage(S)), null;
      } finally {
        V.value = "";
      }
    }
    const W = (u) => [...new Set([...B.value?.depts || [], u].filter(Boolean))], n = (u) => [...new Set([...B.value?.categories || [], u].filter(Boolean))];
    async function c(u) {
      u.length && await O("kb-import", () => _("kb.import", { paths: u, dept: f.value, category: U.value }));
    }
    async function d() {
      const u = await _("files.pick", { kind: "doc", multi: !0, title: l.t("选择要导入知识库的文档") }).catch(() => []);
      await c(u);
    }
    function i(u) {
      C.value = !1, c(K.droppedPaths(u, Ke));
    }
    async function E() {
      const u = await O("kb-demo", () => _("kb.demo"));
      u && w.success(l.t("已载入示例资料：文档 {a} 份，FAQ {b} 条", { a: u.docs, b: u.faqs }));
    }
    function s(u) {
      O("kb-build", () => _("kb.build", { ids: u }));
    }
    async function T(u, A) {
      await O("kb-import", () => _("kb.update", { id: u, ...A }));
    }
    function g(u) {
      return F.value === u ? (F.value = "", !0) : (F.value = u, setTimeout(() => {
        F.value === u && (F.value = "");
      }, 3e3), !1);
    }
    async function Z(u) {
      g(u) && await O("kb-import", () => _("kb.remove", { id: u }));
    }
    async function se() {
      const u = await O("kb-test", () => _("kb.search", { query: q.value }));
      u && (P.value = u);
    }
    function me(u) {
      return { manual: l.t("手工"), import: l.t("导入"), ticket: l.t("转办沉淀") }[u];
    }
    function G(u) {
      y.value = u ? { id: u.id, question: u.question, similarText: u.similar.join(l.t("；")), answer: u.answer, dept: u.dept } : { question: "", similarText: "", answer: "", dept: B.value?.depts[0] || "" };
    }
    async function ee() {
      const u = y.value;
      if (!u) return;
      await O("kb-import", () => _("faq.save", { input: { id: u.id, question: u.question, answer: u.answer, dept: u.dept, similar: u.similarText.split(/[；;\n]/).map((S) => S.trim()).filter(Boolean) } })) && (y.value = null);
    }
    async function oe(u) {
      g(u) && await O("kb-import", () => _("faq.remove", { id: u }));
    }
    async function ae() {
      const u = await _("files.pick", { kind: "excel", multi: !1, title: l.t("选择 FAQ 表格") }).catch(() => []);
      if (!u.length || !K.EXCEL_RE.test(u[0])) return;
      const A = await O("kb-import", () => _("faq.import", { path: u[0] }));
      A && w.success(l.t("FAQ 新增 {a} 条、更新 {b} 条，跳过 {c} 行", { a: A.added, b: A.updated, c: A.skipped }));
    }
    async function Y() {
      const u = await O("kb-import", () => _("faq.export"));
      u && te(String(u), !0);
    }
    return f.value || (f.value = B.value?.depts[0] || ""), (u, A) => (e.openBlock(), e.createElementBlock("div", St, [
      e.createVNode(Ve, {
        title: u.$t("校园知识库"),
        metas: $,
        runtime: D.value,
        "current-key": z.value,
        onJump: M
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", Dt, [
        e.createCommentVNode(" 1 导入资料 "),
        e.createVNode(H, {
          "step-key": "kb-import",
          index: 0,
          title: $[0].title,
          hint: $[0].hint,
          runtime: D.value["kb-import"],
          "is-current": z.value === "kb-import"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", _t, [
              e.createElementVNode("label", Bt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(u.$t("所属部门")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": A[0] || (A[0] = (S) => f.value = S),
                    "data-test": "ca-kb-dept"
                  },
                  [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(B.value?.depts || [], (S) => (e.openBlock(), e.createElementBlock("option", {
                        key: S,
                        value: S
                      }, e.toDisplayString(S), 9, wt))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, f.value]
                ])
              ]),
              e.createElementVNode("label", Ct, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(u.$t("类别")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": A[1] || (A[1] = (S) => U.value = S)
                  },
                  [
                    A[12] || (A[12] = e.createElementVNode(
                      "option",
                      { value: "" },
                      "—",
                      -1
                      /* CACHED */
                    )),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(B.value?.categories || [], (S) => (e.openBlock(), e.createElementBlock("option", {
                        key: S,
                        value: S
                      }, e.toDisplayString(S), 9, Tt))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, U.value]
                ])
              ])
            ]),
            e.createElementVNode(
              "div",
              {
                class: e.normalizeClass(["ca-drop", { over: C.value }]),
                onDragover: A[2] || (A[2] = e.withModifiers((S) => C.value = !0, ["prevent"])),
                onDragleave: A[3] || (A[3] = (S) => C.value = !1),
                onDrop: e.withModifiers(i, ["prevent"])
              },
              [
                A[13] || (A[13] = e.createElementVNode(
                  "i",
                  { class: "ri-upload-cloud-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(u.$t("把文档拖到这里，或")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: !!V.value,
                  "data-test": "ca-kb-pick",
                  onClick: d
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(V.value === "kb-import" ? "ri-loader-4-line spin" : "ri-file-add-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(u.$t("选择文档")),
                    1
                    /* TEXT */
                  )
                ], 8, Lt),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(u.$t("PDF、Word、Excel、PPT、TXT、Markdown、HTML；扫描件自动识别文字")),
                  1
                  /* TEXT */
                )
              ],
              34
              /* CLASS, NEED_HYDRATION */
            ),
            e.createElementVNode("div", At, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!V.value,
                "data-test": "ca-kb-demo",
                onClick: E
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(V.value === "kb-demo" ? "ri-loader-4-line spin" : "ri-file-download-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(u.$t("载入示例资料")),
                  1
                  /* TEXT */
                )
              ], 8, Ft),
              e.createElementVNode(
                "span",
                Mt,
                e.toDisplayString(u.$t("5 份示例校园文档 + 7 条 FAQ，文件写在输出目录的「示例数据」里")),
                1
                /* TEXT */
              )
            ]),
            h.value.length ? (e.openBlock(), e.createElementBlock("div", zt, [
              e.createElementVNode("table", qt, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(u.$t("文档")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(u.$t("部门")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(u.$t("类别")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(u.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Ot,
                      e.toDisplayString(u.$t("分段")),
                      1
                      /* TEXT */
                    ),
                    A[14] || (A[14] = e.createElementVNode(
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
                    e.renderList(h.value, (S) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: S.id,
                        class: e.normalizeClass({ bad: S.status === "failed" })
                      },
                      [
                        e.createElementVNode("td", Ut, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            onClick: (j) => e.unref(te)(S.path)
                          }, e.toDisplayString(S.name), 9, It),
                          S.warning ? (e.openBlock(), e.createElementBlock(
                            "small",
                            Pt,
                            " · " + e.toDisplayString(S.warning),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode("select", {
                            value: S.dept,
                            onChange: (j) => T(S.id, { dept: j.target.value })
                          }, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(W(S.dept), (j) => (e.openBlock(), e.createElementBlock("option", {
                                key: j,
                                value: j
                              }, e.toDisplayString(j), 9, Wt))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ], 40, Kt)
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode("select", {
                            value: S.category,
                            onChange: (j) => T(S.id, { category: j.target.value })
                          }, [
                            A[15] || (A[15] = e.createElementVNode(
                              "option",
                              { value: "" },
                              "—",
                              -1
                              /* CACHED */
                            )),
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(n(S.category), (j) => (e.openBlock(), e.createElementBlock("option", {
                                key: j,
                                value: j
                              }, e.toDisplayString(j), 9, Qt))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ], 40, Rt)
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", e.unref(Re)(S.status)])
                            },
                            [
                              S.status === "building" ? (e.openBlock(), e.createElementBlock("i", jt)) : e.createCommentVNode("v-if", !0),
                              e.createTextVNode(
                                e.toDisplayString(e.unref(We)(S.status)),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          ),
                          S.error ? (e.openBlock(), e.createElementBlock(
                            "small",
                            Gt,
                            e.toDisplayString(S.error),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode(
                          "td",
                          Jt,
                          e.toDisplayString(S.chunks || "—"),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn sm ghost",
                            disabled: S.status === "building",
                            title: u.$t("重新构建"),
                            onClick: (j) => s([S.id])
                          }, [...A[16] || (A[16] = [
                            e.createElementVNode(
                              "i",
                              { class: "ri-refresh-line" },
                              null,
                              -1
                              /* CACHED */
                            )
                          ])], 8, Ht),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn sm ghost danger",
                            onClick: (j) => Z(S.id)
                          }, e.toDisplayString(F.value === S.id ? u.$t("确认删除") : u.$t("删除")), 9, Yt)
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
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 2 构建索引 "),
        e.createVNode(H, {
          "step-key": "kb-build",
          index: 1,
          title: $[1].title,
          hint: $[1].hint,
          runtime: D.value["kb-build"],
          "is-current": z.value === "kb-build"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Xt, [
              e.createElementVNode("div", Zt, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(u.$t("已就绪")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(v("built")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", xt, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(u.$t("待构建")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(v("pending") + v("building")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", el, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(u.$t("失败")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(v("failed")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", tl, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(u.$t("可检索分段")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(e.unref(R)?.stats.chunks || 0),
                  1
                  /* TEXT */
                )
              ])
            ]),
            N.value ? (e.openBlock(), e.createElementBlock("p", ll, [
              A[17] || (A[17] = e.createElementVNode(
                "i",
                { class: "ri-loader-4-line spin" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(N.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", nl, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!V.value || !h.value.length || o.value,
                "data-test": "ca-kb-build",
                onClick: A[4] || (A[4] = (S) => s())
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(V.value === "kb-build" || o.value ? "ri-loader-4-line spin" : "ri-hammer-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(u.$t("构建未就绪的文档")),
                  1
                  /* TEXT */
                )
              ], 8, ol),
              e.createElementVNode(
                "span",
                sl,
                e.toDisplayString(u.$t("在本机分段、算向量，不上传到外部服务；导入后会自动构建")),
                1
                /* TEXT */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 3 检索自测 "),
        e.createVNode(H, {
          "step-key": "kb-test",
          index: 2,
          title: $[2].title,
          hint: $[2].hint,
          runtime: D.value["kb-test"],
          "is-current": z.value === "kb-test"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode(
              "form",
              {
                class: "ss-actions",
                onSubmit: e.withModifiers(se, ["prevent"])
              },
              [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": A[5] || (A[5] = (S) => q.value = S),
                  class: "ca-input",
                  placeholder: u.$t("输入一个学生常问的问题，例如：重修怎么报名"),
                  "data-test": "ca-kb-query"
                }, null, 8, al), [
                  [e.vModelText, q.value]
                ]),
                e.createElementVNode("button", {
                  type: "submit",
                  class: "ss-btn primary",
                  disabled: !!V.value || !q.value.trim(),
                  "data-test": "ca-kb-search"
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(V.value === "kb-test" ? "ri-loader-4-line spin" : "ri-search-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(u.$t("检索")),
                    1
                    /* TEXT */
                  )
                ], 8, il)
              ],
              32
              /* NEED_HYDRATION */
            ),
            P.value && !P.value.length ? (e.openBlock(), e.createElementBlock("p", rl, [
              A[18] || (A[18] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(u.$t("没有命中任何资料：这个问题会被转给部门")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            P.value && P.value.length ? (e.openBlock(), e.createElementBlock("div", cl, [
              e.createElementVNode("table", dl, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      ul,
                      e.toDisplayString(u.$t("得分")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(u.$t("来源")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(u.$t("部门")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(u.$t("命中片段")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(P.value, (S, j) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: j,
                        class: e.normalizeClass({ dim: S.score < (B.value?.minScore || 0) })
                      },
                      [
                        e.createElementVNode(
                          "td",
                          ml,
                          e.toDisplayString(S.score.toFixed(3)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", S.kind === "faq" ? "ok" : "brand"])
                            },
                            e.toDisplayString(S.kind === "faq" ? "FAQ" : u.$t("文档")),
                            3
                            /* TEXT, CLASS */
                          ),
                          e.createTextVNode(
                            " " + e.toDisplayString(S.title),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(S.dept || "—"),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          pl,
                          e.toDisplayString(S.text.slice(0, 200)),
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
            ])) : e.createCommentVNode("v-if", !0),
            P.value && P.value.length ? (e.openBlock(), e.createElementBlock(
              "p",
              vl,
              e.toDisplayString(u.$t("得分低于证据下限 {p0} 的片段不会用来回答（下限在「运维与设置」里调）", { p0: B.value?.minScore })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"])
      ]),
      e.createCommentVNode(" FAQ "),
      e.createElementVNode("section", yl, [
        e.createElementVNode("h3", null, [
          A[19] || (A[19] = e.createElementVNode(
            "i",
            { class: "ri-questionnaire-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(u.$t("常见问题（FAQ）")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            kl,
            e.toDisplayString(k.value.length),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          gl,
          e.toDisplayString(u.$t("部门审定的标准答案：学生的问法和这里的问题几乎一样时，直接给这个答案，不经过模型。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Nl, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary sm",
            onClick: A[6] || (A[6] = (S) => G(null))
          }, [
            A[20] || (A[20] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(u.$t("新增")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: !!V.value,
            onClick: ae
          }, [
            A[21] || (A[21] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(u.$t("从 Excel 导入")),
              1
              /* TEXT */
            )
          ], 8, Vl),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: !k.value.length,
            onClick: Y
          }, [
            A[22] || (A[22] = e.createElementVNode(
              "i",
              { class: "ri-download-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(u.$t("导出 Excel")),
              1
              /* TEXT */
            )
          ], 8, El),
          e.createElementVNode(
            "span",
            $l,
            e.toDisplayString(u.$t("表头：问题、相似问法（用；分隔）、答案、部门")),
            1
            /* TEXT */
          )
        ]),
        y.value ? (e.openBlock(), e.createElementBlock(
          "form",
          {
            key: 0,
            class: "ca-faq-form",
            onSubmit: e.withModifiers(ee, ["prevent"])
          },
          [
            e.createElementVNode("label", bl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(u.$t("问题")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": A[7] || (A[7] = (S) => y.value.question = S)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, y.value.question]
              ])
            ]),
            e.createElementVNode("label", hl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(u.$t("相似问法（用；分隔）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": A[8] || (A[8] = (S) => y.value.similarText = S)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, y.value.similarText]
              ])
            ]),
            e.createElementVNode("label", fl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(u.$t("答案")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": A[9] || (A[9] = (S) => y.value.answer = S)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, y.value.answer]
              ])
            ]),
            e.createElementVNode("label", Sl, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(u.$t("部门")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": A[10] || (A[10] = (S) => y.value.dept = S)
                },
                [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(B.value?.depts || [], (S) => (e.openBlock(), e.createElementBlock("option", {
                      key: S,
                      value: S
                    }, e.toDisplayString(S), 9, Dl))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, y.value.dept]
              ])
            ]),
            e.createElementVNode("div", _l, [
              e.createElementVNode(
                "button",
                Bl,
                e.toDisplayString(u.$t("保存")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn sm",
                  onClick: A[11] || (A[11] = (S) => y.value = null)
                },
                e.toDisplayString(u.$t("取消")),
                1
                /* TEXT */
              )
            ])
          ],
          32
          /* NEED_HYDRATION */
        )) : e.createCommentVNode("v-if", !0),
        k.value.length ? (e.openBlock(), e.createElementBlock("div", wl, [
          e.createElementVNode("table", Cl, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(u.$t("问题")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(u.$t("答案")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(u.$t("部门")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Tl,
                  e.toDisplayString(u.$t("命中")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(u.$t("来源")),
                  1
                  /* TEXT */
                ),
                A[23] || (A[23] = e.createElementVNode(
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
                e.renderList(k.value, (S) => (e.openBlock(), e.createElementBlock("tr", {
                  key: S.id
                }, [
                  e.createElementVNode("td", Ll, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(S.question),
                      1
                      /* TEXT */
                    ),
                    S.similar.length ? (e.openBlock(), e.createElementBlock("small", Al, [
                      A[24] || (A[24] = e.createElementVNode(
                        "br",
                        null,
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(S.similar.join(u.$t("；"))),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode(
                    "td",
                    Fl,
                    e.toDisplayString(S.answer),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(S.dept || "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    Ml,
                    e.toDisplayString(S.hits),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(me(S.source)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm ghost",
                      onClick: (j) => G(S)
                    }, e.toDisplayString(u.$t("编辑")), 9, zl),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm ghost danger",
                      onClick: (j) => oe(S.id)
                    }, e.toDisplayString(F.value === S.id ? u.$t("确认删除") : u.$t("删除")), 9, ql)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), Ul = /* @__PURE__ */ le(Ol, [["__scopeId", "data-v-65f4fa99"]]), Ue = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:qrcode"];
if (!Ue) throw new Error("宿主模块未就绪：npm:qrcode");
const Il = Ue.default, Pl = { class: "ca-qa" }, Kl = { class: "ca-qa__main" }, Wl = { class: "ss-panel" }, Rl = { class: "ss-muted" }, Ql = ["placeholder"], jl = ["disabled"], Gl = {
  key: 0,
  class: "ss-note warn"
}, Jl = {
  key: 1,
  class: "ss-note info"
}, Hl = {
  key: 2,
  class: "ss-note danger"
}, Yl = {
  key: 0,
  class: "ss-chip"
}, Xl = { class: "ss-muted" }, Zl = {
  key: 1,
  class: "ss-muted"
}, xl = { class: "ca-pre" }, en = {
  key: 0,
  class: "ca-sources"
}, tn = { key: 0 }, ln = {
  key: 1,
  class: "ss-actions"
}, nn = { class: "ss-panel" }, on = { class: "ca-filter" }, sn = ["onClick"], an = {
  key: 0,
  class: "ss-table-wrap tall"
}, rn = { class: "ss-table" }, cn = { class: "ca-wrap" }, dn = { class: "ca-wrap" }, un = {
  key: 0,
  class: "ss-muted"
}, mn = { class: "ca-wrap" }, pn = {
  key: 1,
  class: "ss-muted"
}, vn = { class: "ss-panel ca-qa__mobile" }, yn = { class: "ss-muted" }, kn = ["src"], gn = { class: "ca-url" }, Nn = { class: "ss-actions" }, Vn = ["disabled"], En = ["disabled"], $n = ["disabled"], bn = { class: "ss-muted" }, hn = {
  key: 1,
  class: "ss-actions"
}, fn = ["disabled"], Sn = /* @__PURE__ */ e.defineComponent({
  __name: "QaTab",
  setup(I) {
    const w = ne.useNotificationStore(), B = e.ref(""), h = e.ref(!1), k = e.ref(""), f = e.ref(null), U = e.ref({}), C = e.ref([]), V = e.ref(""), L = e.ref(""), q = e.ref(!1), P = e.ref(""), F = e.computed(() => R.value?.mobile || null), y = (n) => R.value?.domains.find((c) => c.id === n)?.name || "", $ = e.computed(() => !!R.value && (R.value.stats.docsBuilt > 0 || R.value.faqs.length > 0)), o = [
      { key: "", label: l.t("全部") },
      { key: "faq", label: ve("faq") },
      { key: "answer", label: ve("answer") },
      { key: "quote", label: ve("quote") },
      { key: "no_evidence", label: ve("no_evidence") },
      { key: "sensitive", label: ve("sensitive") }
    ];
    async function N() {
      h.value = !0, k.value = "";
      try {
        f.value = await _("qa.ask", { question: B.value }), D(), J();
      } catch (n) {
        k.value = K.errorMessage(n);
      } finally {
        h.value = !1;
      }
    }
    async function v(n, c) {
      const d = U.value[n] === c ? null : c;
      try {
        await _("qa.feedback", { qaId: n, value: d });
        const i = { ...U.value };
        d ? i[n] = d : delete i[n], U.value = i, D();
      } catch (i) {
        w.error(K.errorMessage(i));
      }
    }
    async function D() {
      try {
        C.value = await _("qa.list", { kind: V.value || void 0, limit: 200 });
      } catch (n) {
        w.error(K.errorMessage(n));
      }
    }
    function z(n) {
      V.value = n, D();
    }
    async function M(n) {
      if (n === "mobile.rotateKey" && !q.value) {
        q.value = !0, setTimeout(() => {
          q.value = !1;
        }, 3e3);
        return;
      }
      q.value = !1, L.value = n;
      try {
        await _(n), await J();
      } catch (c) {
        w.error(K.errorMessage(c));
      } finally {
        L.value = "";
      }
    }
    async function O(n) {
      try {
        await navigator.clipboard.writeText(n), w.success(l.t("已复制"));
      } catch {
        w.warn(l.t("复制失败，请手动选择链接复制"));
      }
    }
    function W() {
      if (!P.value) return;
      const n = document.createElement("a");
      n.href = P.value, n.download = `${R.value?.settings.schoolName || "campus"}-${l.t("校园问答二维码")}.png`, n.click();
    }
    return e.watch(() => F.value?.joinUrl, async (n) => {
      P.value = n ? await Il.toDataURL(n, { margin: 1, width: 560 }).catch(() => "") : "";
    }, { immediate: !0 }), e.onMounted(() => {
      D();
    }), (n, c) => (e.openBlock(), e.createElementBlock("div", Pl, [
      e.createElementVNode("div", Kl, [
        e.createElementVNode("section", Wl, [
          e.createElementVNode("h3", null, [
            c[7] || (c[7] = e.createElementVNode(
              "i",
              { class: "ri-chat-smile-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("试问一个问题")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "p",
            Rl,
            e.toDisplayString(n.$t("和学生在手机上问的是同一套判定：FAQ 命中直接给审定答案；知识库有依据才作答并列出处；没有依据不编，转给对应部门；敏感问题立即给求助方式。")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "form",
            {
              class: "ss-actions",
              onSubmit: e.withModifiers(N, ["prevent"])
            },
            [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": c[0] || (c[0] = (d) => B.value = d),
                class: "ca-input",
                maxlength: "500",
                placeholder: n.$t("例如：国家助学金什么时候申请？"),
                "data-test": "ca-qa-input"
              }, null, 8, Ql), [
                [e.vModelText, B.value]
              ]),
              e.createElementVNode("button", {
                type: "submit",
                class: "ss-btn primary",
                disabled: h.value || !B.value.trim(),
                "data-test": "ca-qa-ask"
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(h.value ? "ri-loader-4-line spin" : "ri-send-plane-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(n.$t("提问")),
                  1
                  /* TEXT */
                )
              ], 8, jl)
            ],
            32
            /* NEED_HYDRATION */
          ),
          $.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Gl, [
            c[8] || (c[8] = e.createElementVNode(
              "i",
              { class: "ri-alert-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("知识库里还没有资料：所有问题都会被转办。先到「校园知识库」导入资料")),
              1
              /* TEXT */
            )
          ])),
          h.value ? (e.openBlock(), e.createElementBlock("p", Jl, [
            c[9] || (c[9] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("正在检索资料并作答…")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          k.value ? (e.openBlock(), e.createElementBlock("p", Hl, [
            c[10] || (c[10] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(k.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          f.value ? (e.openBlock(), e.createElementBlock(
            "article",
            {
              key: 3,
              class: e.normalizeClass(["ca-answer", f.value.kind]),
              "data-test": "ca-qa-answer"
            },
            [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "span",
                  {
                    class: e.normalizeClass(["ss-chip", e.unref(Fe)(f.value.kind)])
                  },
                  e.toDisplayString(e.unref(ve)(f.value.kind)),
                  3
                  /* TEXT, CLASS */
                ),
                f.value.domain ? (e.openBlock(), e.createElementBlock("span", Yl, [
                  c[11] || (c[11] = e.createElementVNode(
                    "i",
                    { class: "ri-robot-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(y(f.value.domain)),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode(
                  "small",
                  Xl,
                  e.toDisplayString(n.$t("{n} 秒", { n: (f.value.ms / 1e3).toFixed(1) })),
                  1
                  /* TEXT */
                ),
                f.value.dept ? (e.openBlock(), e.createElementBlock(
                  "small",
                  Zl,
                  e.toDisplayString(n.$t("已转给：{p0}", { p0: f.value.dept })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode(
                "p",
                xl,
                e.toDisplayString(f.value.text),
                1
                /* TEXT */
              ),
              f.value.sources.length ? (e.openBlock(), e.createElementBlock("ol", en, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(f.value.sources, (d, i) => (e.openBlock(), e.createElementBlock("li", { key: i }, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(d.title),
                      1
                      /* TEXT */
                    ),
                    d.dept ? (e.openBlock(), e.createElementBlock(
                      "span",
                      tn,
                      " · " + e.toDisplayString(d.dept),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    c[12] || (c[12] = e.createElementVNode(
                      "br",
                      null,
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.snippet),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0),
              f.value.kind !== "sensitive" ? (e.openBlock(), e.createElementBlock("div", ln, [
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: e.normalizeClass(["ss-btn sm", { primary: U.value[f.value.qaId] === "up" }]),
                    onClick: c[1] || (c[1] = (d) => v(f.value.qaId, "up"))
                  },
                  [
                    c[13] || (c[13] = e.createElementVNode(
                      "i",
                      { class: "ri-thumb-up-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("有用")),
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
                    class: e.normalizeClass(["ss-btn sm", { primary: U.value[f.value.qaId] === "down" }]),
                    onClick: c[2] || (c[2] = (d) => v(f.value.qaId, "down"))
                  },
                  [
                    c[14] || (c[14] = e.createElementVNode(
                      "i",
                      { class: "ri-thumb-down-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("没用")),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ],
            2
            /* CLASS */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("section", nn, [
          e.createElementVNode("h3", null, [
            c[15] || (c[15] = e.createElementVNode(
              "i",
              { class: "ri-history-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("问答记录")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", on, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(o, (d) => e.createElementVNode("button", {
                key: d.key,
                type: "button",
                class: e.normalizeClass({ on: V.value === d.key }),
                onClick: (i) => z(d.key)
              }, e.toDisplayString(d.label), 11, sn)),
              64
              /* STABLE_FRAGMENT */
            )),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link",
              onClick: D
            }, [
              c[16] || (c[16] = e.createElementVNode(
                "i",
                { class: "ri-refresh-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("刷新")),
                1
                /* TEXT */
              )
            ])
          ]),
          C.value.length ? (e.openBlock(), e.createElementBlock("div", an, [
            e.createElementVNode("table", rn, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(n.$t("时间")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(n.$t("渠道")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(n.$t("问题")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(n.$t("答复")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(n.$t("出处")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(n.$t("反馈")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("tbody", null, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(C.value, (d) => (e.openBlock(), e.createElementBlock("tr", {
                    key: d.id
                  }, [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(e.unref(K.fmtDateTime)(d.at)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(d.channel === "mobile" ? n.$t("手机") : n.$t("电脑")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      cn,
                      e.toDisplayString(d.question),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", dn, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", e.unref(Fe)(d.kind)])
                        },
                        e.toDisplayString(e.unref(ve)(d.kind)),
                        3
                        /* TEXT, CLASS */
                      ),
                      c[17] || (c[17] = e.createTextVNode()),
                      d.domain ? (e.openBlock(), e.createElementBlock(
                        "small",
                        un,
                        e.toDisplayString(y(d.domain)),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createTextVNode(
                        " " + e.toDisplayString(d.answer.slice(0, 120)),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "td",
                      mn,
                      e.toDisplayString(d.sources.map((i) => i.title).join("；") || "—"),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(d.feedback === "up" ? n.$t("有用") : d.feedback === "down" ? n.$t("没用") : "—"),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])) : (e.openBlock(), e.createElementBlock(
            "p",
            pn,
            e.toDisplayString(n.$t("还没有记录")),
            1
            /* TEXT */
          ))
        ])
      ]),
      e.createElementVNode("aside", vn, [
        e.createElementVNode("h3", null, [
          c[18] || (c[18] = e.createElementVNode(
            "i",
            { class: "ri-qr-code-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("学生手机扫码提问")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          yn,
          e.toDisplayString(n.$t("手机和这台电脑在同一个校园网里即可，不用安装、不用注册。二维码里带校园口令，换口令后旧码失效。")),
          1
          /* TEXT */
        ),
        F.value?.running && F.value.joinUrl ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 0 },
          [
            P.value ? (e.openBlock(), e.createElementBlock("img", {
              key: 0,
              src: P.value,
              class: "ca-qr",
              alt: "",
              "data-test": "ca-mobile-qr"
            }, null, 8, kn)) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "code",
              gn,
              e.toDisplayString(F.value.joinUrl),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Nn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                onClick: c[3] || (c[3] = (d) => O(F.value.joinUrl))
              }, [
                c[19] || (c[19] = e.createElementVNode(
                  "i",
                  { class: "ri-file-copy-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("复制链接")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: !!L.value,
                onClick: W
              }, [
                c[20] || (c[20] = e.createElementVNode(
                  "i",
                  { class: "ri-download-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("保存二维码")),
                  1
                  /* TEXT */
                )
              ], 8, Vn),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: !!L.value,
                onClick: c[4] || (c[4] = (d) => M("mobile.rotateKey"))
              }, e.toDisplayString(q.value ? n.$t("确认更换") : n.$t("更换口令")), 9, En),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm danger",
                disabled: !!L.value,
                onClick: c[5] || (c[5] = (d) => M("mobile.stop"))
              }, e.toDisplayString(n.$t("停止服务")), 9, $n)
            ]),
            e.createElementVNode(
              "p",
              bn,
              e.toDisplayString(n.$t("每台手机每天最多提问 {n} 次（在「运维与设置」里改）", { n: e.unref(R)?.settings.mobileDailyLimit })),
              1
              /* TEXT */
            )
          ],
          64
          /* STABLE_FRAGMENT */
        )) : (e.openBlock(), e.createElementBlock("div", hn, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: !!L.value,
            "data-test": "ca-mobile-start",
            onClick: c[6] || (c[6] = (d) => M("mobile.start"))
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(L.value ? "ri-loader-4-line spin" : "ri-wifi-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(n.$t("开启手机服务")),
              1
              /* TEXT */
            )
          ], 8, fn)
        ]))
      ])
    ]));
  }
}), Dn = /* @__PURE__ */ le(Sn, [["__scopeId", "data-v-2c42e83b"]]), _n = { class: "ca-tk" }, Bn = { class: "ss-panel" }, wn = { class: "ss-muted" }, Cn = { class: "ca-filter" }, Tn = ["onClick"], Ln = { key: 0 }, An = { value: "" }, Fn = ["value"], Mn = {
  key: 0,
  class: "ss-muted"
}, zn = ["data-test"], qn = {
  key: 0,
  class: "ss-chip bad"
}, On = ["value", "onChange"], Un = ["value"], In = { class: "ss-muted" }, Pn = { class: "ca-q" }, Kn = {
  key: 0,
  class: "ss-note danger"
}, Wn = { class: "ca-pre ca-reply" }, Rn = {
  key: 0,
  class: "ss-muted"
}, Qn = ["onSubmit"], jn = ["placeholder"], Gn = {
  key: 0,
  class: "ca-check"
}, Jn = {
  key: 1,
  class: "ss-field"
}, Hn = { class: "ss-actions" }, Yn = ["disabled"], Xn = {
  key: 3,
  class: "ss-actions"
}, Zn = ["onClick"], xn = ["onClick"], eo = ["onClick"], to = /* @__PURE__ */ e.defineComponent({
  __name: "TicketsTab",
  setup(I) {
    const w = ne.useNotificationStore(), B = e.ref("open"), h = e.ref(""), k = e.ref(""), f = e.ref(""), U = e.ref(!0), C = e.ref(""), V = e.ref(!1), L = [
      { key: "open", label: l.t("待答复") },
      { key: "answered", label: l.t("已答复") },
      { key: "closed", label: l.t("已关闭") },
      { key: "", label: l.t("全部") }
    ], q = e.computed(() => R.value?.tickets || []), P = e.computed(() => q.value.filter((D) => D.status === "open").length), F = e.computed(() => [...new Set([...R.value?.settings.depts || [], ...q.value.map((D) => D.dept)].filter(Boolean))]), y = (D) => [...new Set([...R.value?.settings.depts || [], D].filter(Boolean))], $ = e.computed(() => q.value.filter((D) => (!B.value || D.status === B.value) && (!h.value || D.dept === h.value)).slice().sort((D, z) => Number(z.sensitive && z.status === "open") - Number(D.sensitive && D.status === "open") || z.at.localeCompare(D.at)));
    function o(D) {
      k.value = D.id, f.value = "", U.value = !D.sensitive, C.value = D.question;
    }
    async function N(D) {
      V.value = !0;
      try {
        await _("ticket.answer", { id: D, answer: f.value, toFaq: U.value, faqQuestion: C.value }), k.value = "", await J(), w.success(U.value ? l.t("已答复，并沉淀为 FAQ") : l.t("已答复"));
      } catch (z) {
        w.error(K.errorMessage(z));
      } finally {
        V.value = !1;
      }
    }
    async function v(D, z) {
      try {
        await _("ticket.update", { id: D, ...z }), await J();
      } catch (M) {
        w.error(K.errorMessage(M));
      }
    }
    return (D, z) => (e.openBlock(), e.createElementBlock("div", _n, [
      e.createElementVNode("section", Bn, [
        e.createElementVNode("h3", null, [
          z[5] || (z[5] = e.createElementVNode(
            "i",
            { class: "ri-git-pull-request-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(D.$t("转办问题")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          wn,
          e.toDisplayString(D.$t("知识库里没有依据的问题会转到这里，按部门分派。部门答复后学生在手机「我的问题」里能看到；勾选「沉淀为 FAQ」，下次同样的问题直接自动回答。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Cn, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(L, (M) => e.createElementVNode("button", {
              key: M.key,
              type: "button",
              class: e.normalizeClass({ on: B.value === M.key }),
              onClick: (O) => B.value = M.key
            }, [
              e.createTextVNode(
                e.toDisplayString(M.label),
                1
                /* TEXT */
              ),
              M.key === "open" ? (e.openBlock(), e.createElementBlock(
                "em",
                Ln,
                e.toDisplayString(P.value),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ], 10, Tn)),
            64
            /* STABLE_FRAGMENT */
          )),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": z[0] || (z[0] = (M) => h.value = M),
              class: "ca-sel"
            },
            [
              e.createElementVNode(
                "option",
                An,
                e.toDisplayString(D.$t("全部部门")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(F.value, (M) => (e.openBlock(), e.createElementBlock("option", {
                  key: M,
                  value: M
                }, e.toDisplayString(M), 9, Fn))),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, h.value]
          ])
        ]),
        $.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "p",
          Mn,
          e.toDisplayString(D.$t("没有符合条件的转办问题")),
          1
          /* TEXT */
        )),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList($.value, (M) => (e.openBlock(), e.createElementBlock("article", {
            key: M.id,
            class: e.normalizeClass(["ca-ticket", { sensitive: M.sensitive, done: M.status !== "open" }]),
            "data-test": `ca-ticket-${M.id}`
          }, [
            e.createElementVNode("header", null, [
              M.sensitive ? (e.openBlock(), e.createElementBlock("span", qn, [
                z[6] || (z[6] = e.createElementVNode(
                  "i",
                  { class: "ri-alarm-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(D.$t("敏感")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", M.status === "open" ? "warn" : "ok"])
                },
                e.toDisplayString(e.unref(Qe)(M.status)),
                3
                /* TEXT, CLASS */
              ),
              e.createElementVNode("select", {
                value: M.dept,
                class: "ca-sel",
                onChange: (O) => v(M.id, { dept: O.target.value })
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(y(M.dept), (O) => (e.openBlock(), e.createElementBlock("option", {
                    key: O,
                    value: O
                  }, e.toDisplayString(O), 9, Un))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 40, On),
              e.createElementVNode(
                "small",
                In,
                e.toDisplayString(e.unref(K.fmtDateTime)(M.at)) + " · " + e.toDisplayString(M.channel === "mobile" ? D.$t("手机") : D.$t("电脑")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "p",
              Pn,
              e.toDisplayString(M.question),
              1
              /* TEXT */
            ),
            M.sensitive && M.status === "open" ? (e.openBlock(), e.createElementBlock("p", Kn, [
              z[7] || (z[7] = e.createElementVNode(
                "i",
                { class: "ri-alarm-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(D.$t("敏感问题：提问的学生已收到求助电话。请{p0}尽快通过辅导员核实并联系学生；处理完再关闭。", { p0: M.dept })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            M.answer ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("p", Wn, [
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(D.$t("答复：")),
                    1
                    /* TEXT */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(M.answer),
                    1
                    /* TEXT */
                  )
                ]),
                M.faqId ? (e.openBlock(), e.createElementBlock("small", Rn, [
                  z[8] || (z[8] = e.createElementVNode(
                    "i",
                    { class: "ri-checkbox-circle-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(D.$t("已沉淀为 FAQ")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0),
            k.value === M.id ? (e.openBlock(), e.createElementBlock("form", {
              key: 2,
              class: "ca-reply-form",
              onSubmit: e.withModifiers((O) => N(M.id), ["prevent"])
            }, [
              e.withDirectives(e.createElementVNode("textarea", {
                "onUpdate:modelValue": z[1] || (z[1] = (O) => f.value = O),
                placeholder: D.$t("写给学生的答复，尽量写清楚时间、地点、办理方式")
              }, null, 8, jn), [
                [e.vModelText, f.value]
              ]),
              M.sensitive ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("label", Gn, [
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": z[2] || (z[2] = (O) => U.value = O),
                    type: "checkbox"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelCheckbox, U.value]
                ]),
                e.createTextVNode(
                  e.toDisplayString(D.$t("沉淀为 FAQ（下次同样的问题直接用这个答案）")),
                  1
                  /* TEXT */
                )
              ])),
              U.value && !M.sensitive ? (e.openBlock(), e.createElementBlock("label", Jn, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(D.$t("FAQ 问题写法（可改得更通用）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": z[3] || (z[3] = (O) => C.value = O)
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, C.value]
                ])
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", Hn, [
                e.createElementVNode("button", {
                  type: "submit",
                  class: "ss-btn primary sm",
                  disabled: V.value || !f.value.trim()
                }, e.toDisplayString(D.$t("提交答复")), 9, Yn),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-btn sm",
                    onClick: z[4] || (z[4] = (O) => k.value = "")
                  },
                  e.toDisplayString(D.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ], 40, Qn)) : (e.openBlock(), e.createElementBlock("div", Xn, [
              M.status === "open" ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn primary sm",
                onClick: (O) => o(M)
              }, [
                z[9] || (z[9] = e.createElementVNode(
                  "i",
                  { class: "ri-reply-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(D.$t("答复")),
                  1
                  /* TEXT */
                )
              ], 8, Zn)) : e.createCommentVNode("v-if", !0),
              M.status !== "closed" ? (e.openBlock(), e.createElementBlock("button", {
                key: 1,
                type: "button",
                class: "ss-btn sm",
                onClick: (O) => v(M.id, { status: "closed" })
              }, e.toDisplayString(D.$t("关闭")), 9, xn)) : (e.openBlock(), e.createElementBlock("button", {
                key: 2,
                type: "button",
                class: "ss-btn sm",
                onClick: (O) => v(M.id, { status: "open" })
              }, e.toDisplayString(D.$t("重新打开")), 9, eo))
            ]))
          ], 10, zn))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]));
  }
}), lo = /* @__PURE__ */ le(to, [["__scopeId", "data-v-ad7feee8"]]), no = { class: "ss-module" }, oo = { class: "ss-steps" }, so = { class: "ss-actions" }, ao = ["disabled"], io = { class: "ss-muted" }, ro = { class: "ca-slots" }, co = ["onDrop"], uo = {
  key: 0,
  class: "ss-chip"
}, mo = {
  key: 1,
  class: "ss-chip ok"
}, po = { class: "ss-muted" }, vo = { class: "ca-file" }, yo = { key: 0 }, ko = {
  key: 0,
  class: "ss-note danger"
}, go = ["open"], No = { class: "ss-muted" }, Vo = { class: "ca-map" }, Eo = { key: 0 }, $o = ["value", "onChange"], bo = ["value"], ho = {
  key: 1,
  class: "ss-note warn"
}, fo = { class: "ss-actions" }, So = ["disabled", "data-test", "onClick"], Do = ["disabled", "onClick"], _o = { class: "ca-rules" }, Bo = { class: "ss-table-wrap" }, wo = { class: "ss-table" }, Co = ["onUpdate:modelValue"], To = ["onUpdate:modelValue"], Lo = ["onUpdate:modelValue"], Ao = { class: "ss-actions" }, Fo = { class: "ss-field inline" }, Mo = ["disabled"], zo = { class: "ss-actions" }, qo = ["disabled"], Oo = {
  key: 0,
  class: "ss-muted"
}, Uo = {
  key: 0,
  class: "ss-note warn"
}, Io = { class: "ss-kpis" }, Po = { class: "ss-kpi" }, Ko = {
  key: 0,
  class: "ss-note warn"
}, Wo = {
  key: 1,
  class: "ss-note"
}, Ro = { class: "ca-filter" }, Qo = ["onClick"], jo = { value: "" }, Go = ["value"], Jo = ["disabled"], Ho = { class: "ss-table-wrap tall" }, Yo = { class: "ss-table" }, Xo = { class: "ss-muted" }, Zo = { class: "ca-wrap" }, xo = {
  key: 0,
  class: "ss-muted"
}, es = { class: "ca-review" }, ts = ["value", "title", "onChange"], ls = { value: "" }, ns = ["value"], os = ["disabled", "onClick"], ss = ["disabled", "onClick"], as = ["value", "placeholder", "onChange"], is = { class: "ss-muted" }, rs = {
  key: 1,
  class: "ss-muted"
}, cs = { class: "ss-actions" }, ds = { class: "ca-check" }, us = ["disabled"], ms = { class: "ss-note info" }, ps = {
  key: 0,
  class: "ss-note info"
}, vs = {
  key: 1,
  class: "ca-notices"
}, ys = { class: "ca-pre" }, ks = { class: "ca-pre" }, gs = { class: "ss-actions" }, Ns = ["disabled"], Vs = {
  key: 0,
  class: "ss-muted"
}, Es = {
  key: 0,
  class: "ss-file-out"
}, $s = { class: "ca-mail" }, bs = { class: "ss-actions" }, hs = ["disabled"], fs = { class: "ss-muted" }, Ss = { class: "ss-table-wrap" }, Ds = { class: "ss-table" }, _s = { class: "num" }, Bs = { class: "num" }, ws = { class: "ca-check" }, Cs = { class: "ss-actions" }, Ts = ["disabled"], Ls = /* @__PURE__ */ e.defineComponent({
  __name: "WarningTab",
  setup(I) {
    const w = ne.useNotificationStore(), B = ["roster", "grades", "attendance"], h = ["red", "orange", "yellow"], k = e.ref(""), f = e.ref({}), U = e.ref({}), C = e.ref(!0), V = e.ref(null), L = e.ref({}), q = e.ref(!1), P = e.ref("pending"), F = e.ref(""), y = [
      { key: "cw-data", title: l.t("导入数据"), hint: l.t("学生名单、课程成绩、考勤三张表，Excel 或 CSV，列名自动认") },
      { key: "cw-compute", title: l.t("计算预警"), hint: l.t("按规则算每人的不及格门数、学分和缺勤率，分红橙黄三级，每人附依据") },
      { key: "cw-review", title: l.t("辅导员复核"), hint: l.t("逐人确认、调整级别或标为不预警；没复核完不能导出") },
      { key: "cw-notice", title: l.t("谈话提纲与通知"), hint: l.t("为已确认的学生写谈话提纲和通知草稿，数字全部取自计算结果") },
      { key: "cw-export", title: l.t("导出与发送"), hint: l.t("导出名单与通知文件；按辅导员发邮件要你确认") }
    ], $ = e.computed(() => R.value?.warn || null), o = (a) => R.value?.datasets[a] || null, N = e.computed(() => !!o("grades")?.loaded), v = e.computed(() => we.value.filter((a) => a.level)), D = (a) => $.value?.reviews[a.studentId], z = (a) => D(a)?.status || "pending", M = (a) => (D(a)?.level || a.level) ?? null, O = e.computed(() => $.value && !$.value.stale ? v.value.filter((a) => z(a) === "pending").length : 0), W = e.computed(() => $.value && !$.value.stale ? v.value.filter((a) => z(a) === "confirmed").length : 0), n = e.computed(() => [...new Set(v.value.map((a) => a.className).filter(Boolean))].sort()), c = e.computed(() => v.value.filter((a) => (P.value === "all" || z(a) === P.value) && (!F.value || a.className === F.value))), d = e.computed(() => c.value.filter((a) => z(a) === "pending")), i = e.computed(() => $.value ? v.value.filter((a) => $.value.notices[a.studentId] && z(a) === "confirmed") : []), E = e.computed(() => ue.value.scope === "notice" ? ue.value.message : ""), s = e.computed(() => f.value["cw-notice"] || ""), T = [
      { key: "pending", label: l.t("待复核") },
      { key: "confirmed", label: l.t("已确认") },
      { key: "dismissed", label: l.t("不预警") },
      { key: "all", label: l.t("全部") }
    ], g = e.reactive(JSON.parse(JSON.stringify(R.value?.settings.warnRules || { passScore: 60, red: { failCourses: 4, failCredits: 12, absenceRate: 1 / 3 }, orange: { failCourses: 2, failCredits: 6, absenceRate: 0.2 }, yellow: { failCourses: 1, failCredits: 1, absenceRate: 0.1 } }))), Z = e.reactive({ red: 0, orange: 0, yellow: 0 });
    function se(a) {
      if (a) {
        Object.assign(g, JSON.parse(JSON.stringify(a)));
        for (const b of h) Z[b] = Math.round(a[b].absenceRate * 1e3) / 10;
      }
    }
    e.watch(() => JSON.stringify(R.value?.settings.warnRules || null), () => se(R.value?.settings.warnRules), { immediate: !0 });
    const me = () => ({
      passScore: Number(g.passScore) || 0,
      red: { ...g.red, absenceRate: (Number(Z.red) || 0) / 100 },
      orange: { ...g.orange, absenceRate: (Number(Z.orange) || 0) / 100 },
      yellow: { ...g.yellow, absenceRate: (Number(Z.yellow) || 0) / 100 }
    }), G = e.computed(() => JSON.stringify(me()) !== JSON.stringify(R.value?.settings.warnRules)), ee = e.computed(() => {
      const a = f.value, b = $.value, r = !!b && !b.stale, t = r ? i.value.length : 0;
      return {
        "cw-data": ["cw-data", "cw-demo"].includes(k.value) ? { state: "running" } : a["cw-data"] ? { state: "failed", error: a["cw-data"] } : B.some((p) => o(p) && !o(p).loaded) ? { state: "failed", error: l.t("有表格的必填列没认出来，请在下面指定") } : N.value ? { state: "done", summary: B.filter((p) => o(p)?.loaded).map((p) => `${Be(p)} ${o(p).count}`).join(" · ") } : { state: "todo" },
        "cw-compute": k.value === "cw-compute" ? { state: "running" } : a["cw-compute"] ? { state: "failed", error: a["cw-compute"] } : r ? { state: "done", summary: l.t("{a} 名学生中预警 {b} 人：红 {r} · 橙 {o} · 黄 {y}", { a: b.summary.students, b: b.summary.warned, r: b.summary.byLevel.red, o: b.summary.byLevel.orange, y: b.summary.byLevel.yellow }) } : { state: "todo" },
        "cw-review": k.value === "cw-review" ? { state: "running" } : a["cw-review"] ? { state: "failed", error: a["cw-review"] } : r && v.value.length && !O.value ? { state: "done", summary: l.t("确认 {a} 人，不预警 {b} 人", { a: W.value, b: v.value.length - W.value }) } : r && !v.value.length ? { state: "skipped" } : { state: "todo" },
        "cw-notice": k.value === "cw-notice" ? { state: "running", kind: "llm", progressAt: Date.now() } : a["cw-notice"] ? { state: "failed", error: a["cw-notice"] } : r && W.value && t >= W.value ? { state: "done", summary: l.t("{n} 份", { n: t }) } : r && !W.value && v.value.length && !O.value ? { state: "skipped" } : { state: "todo" },
        "cw-export": ["cw-export", "cw-mail"].includes(k.value) ? { state: "running" } : a["cw-export"] || a["cw-mail"] ? { state: "failed", error: a["cw-export"] || a["cw-mail"] } : r && b.exportedAt ? { state: "done", summary: l.t("已导出到 {p0}", { p0: b.exportDir || "" }) } : { state: "todo" }
      };
    }), oe = e.computed(() => y.find((a) => !["done", "skipped"].includes(ee.value[a.key].state))?.key || y[y.length - 1].key), ae = (a) => {
      K.scrollToStep(a);
    };
    async function Y(a, b) {
      k.value = a, f.value = { ...f.value, [a]: "" };
      try {
        const r = await b();
        return await J(), r;
      } catch (r) {
        return f.value = { ...f.value, [a]: K.errorMessage(r) }, w.error(K.errorMessage(r)), null;
      } finally {
        k.value = "";
      }
    }
    const u = (a) => U.value[a] || a, A = (a) => [...de.CA_DATASET_ROLES[a].required, ...de.CA_DATASET_ROLES[a].optional], S = (a, b) => de.CA_DATASET_ROLES[a].required.includes(b);
    async function j(a, b, r) {
      await Y("cw-data", () => _("warn.import", { dataset: a, path: b, sheet: o(a)?.path === b ? o(a)?.sheetName : void 0, mapping: r || null }));
    }
    async function pe(a) {
      const b = await _("files.pick", { kind: "excel", multi: !1, title: Be(a) }).catch(() => []);
      b[0] && await j(a, b[0]);
    }
    function Ee(a, b) {
      const r = K.droppedPaths(b, K.EXCEL_RE)[0];
      r && j(a, r);
    }
    function $e(a, b, r) {
      const t = o(a);
      if (!t) return;
      const p = { ...t.mapping };
      r ? p[b] = r : delete p[b], j(a, t.path, p);
    }
    async function be(a) {
      await Y("cw-data", () => _("warn.clear", { dataset: a }));
    }
    async function he() {
      const a = await Y("cw-demo", () => _("warn.demo"));
      a && w.success(l.t("已载入示例数据：{n} 名学生", { n: a.students }));
    }
    async function fe() {
      await Y("cw-compute", () => _("warn.rules", { rules: me() }));
    }
    function Se() {
      se(R.value?.defaults.warnRules);
    }
    async function X() {
      G.value && await _("warn.rules", { rules: me() }).catch(() => {
      }), await Y("cw-compute", () => _("warn.compute")) && (P.value = "pending", K.scrollToStep("cw-review"));
    }
    async function x(a, b, r, t) {
      a.length && await Y("cw-review", () => _("warn.review", { ids: a, status: b, level: r, note: t }));
    }
    async function ie() {
      const a = await Y("cw-notice", () => _("warn.notices", { useModel: C.value }));
      a && w.success(l.t("已生成 {a} 份，其中模型撰写 {b} 份", { a: a.done, b: a.byModel }));
    }
    async function De() {
      const a = await Y("cw-export", () => _("warn.export"));
      a && w.success(l.t("已导出，学生通知 {n} 份", { n: a.notices }));
    }
    async function re() {
      L.value = {}, q.value = !1, V.value = await Y("cw-mail", () => _("warn.mailPlan"));
    }
    async function ke() {
      const a = await Y("cw-mail", () => _("warn.mailSend", { confirm: q.value }));
      if (a) {
        L.value = Object.fromEntries(a.map((r) => [r.to, { ok: r.ok, message: r.message }])), q.value = !1;
        const b = a.filter((r) => r.ok).length;
        b === a.length ? w.success(l.t("已发送 {n} 封", { n: b })) : w.warn(l.t("发送 {a} 封，失败 {b} 封", { a: b, b: a.length - b }));
      }
    }
    function ge(a) {
      const b = L.value[a];
      return b ? b.ok ? l.t("已发送") : l.t("失败：{p0}", { p0: b.message || "" }) : "—";
    }
    const Ne = (a, b) => String(a || "").split("[STUDENT]").join(b);
    return _("warn.roles").then((a) => {
      U.value = a;
    }).catch(() => {
    }), (a, b) => (e.openBlock(), e.createElementBlock("div", no, [
      e.createVNode(Ve, {
        title: a.$t("学业预警"),
        metas: y,
        runtime: ee.value,
        "current-key": oe.value,
        onJump: ae
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", oo, [
        e.createCommentVNode(" 1 导入数据 "),
        e.createVNode(H, {
          "step-key": "cw-data",
          index: 0,
          title: y[0].title,
          hint: y[0].hint,
          runtime: ee.value["cw-data"],
          "is-current": oe.value === "cw-data"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", so, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!k.value,
                "data-test": "ca-warn-demo",
                onClick: he
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(k.value === "cw-demo" ? "ri-loader-4-line spin" : "ri-file-download-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(a.$t("载入示例数据")),
                  1
                  /* TEXT */
                )
              ], 8, ao),
              e.createElementVNode(
                "span",
                io,
                e.toDisplayString(a.$t("4 个班 120 名学生的名单、成绩、考勤（人名随机生成），写在输出目录的「示例数据」里")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", ro, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(B, (r) => e.createElementVNode("div", {
                  key: r,
                  class: e.normalizeClass(["ca-slot", { ok: o(r)?.loaded, bad: o(r) && !o(r).loaded }]),
                  onDragover: b[0] || (b[0] = e.withModifiers(() => {
                  }, ["prevent"])),
                  onDrop: e.withModifiers((t) => Ee(r, t), ["prevent"])
                }, [
                  e.createElementVNode("header", null, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(e.unref(Be)(r)),
                      1
                      /* TEXT */
                    ),
                    r === "attendance" ? (e.openBlock(), e.createElementBlock(
                      "span",
                      uo,
                      e.toDisplayString(a.$t("可选")),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    o(r)?.loaded ? (e.openBlock(), e.createElementBlock(
                      "span",
                      mo,
                      e.toDisplayString(a.$t("{n} 行", { n: o(r).count })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode(
                    "small",
                    po,
                    e.toDisplayString(e.unref(Ge)(r)),
                    1
                    /* TEXT */
                  ),
                  o(r) ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("p", vo, [
                        b[7] || (b[7] = e.createElementVNode(
                          "i",
                          { class: "ri-file-excel-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(o(r).fileName),
                          1
                          /* TEXT */
                        ),
                        o(r).sheetNames.length > 1 ? (e.openBlock(), e.createElementBlock(
                          "span",
                          yo,
                          " · " + e.toDisplayString(o(r).sheetName),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      o(r).missing.length ? (e.openBlock(), e.createElementBlock("p", ko, [
                        b[8] || (b[8] = e.createElementVNode(
                          "i",
                          { class: "ri-error-warning-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(a.$t("没认出：{p0}。请在下面指定对应的列", { p0: o(r).missing.map(u).join("、") })),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("details", {
                        open: o(r).missing.length > 0
                      }, [
                        e.createElementVNode(
                          "summary",
                          No,
                          e.toDisplayString(a.$t("列对应")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", Vo, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(A(r), (t) => (e.openBlock(), e.createElementBlock("label", {
                              key: t,
                              class: "ss-field inline"
                            }, [
                              e.createElementVNode("span", null, [
                                e.createTextVNode(
                                  e.toDisplayString(u(t)),
                                  1
                                  /* TEXT */
                                ),
                                S(r, t) ? (e.openBlock(), e.createElementBlock("em", Eo, "*")) : e.createCommentVNode("v-if", !0)
                              ]),
                              e.createElementVNode("select", {
                                value: o(r).mapping[t] || "",
                                onChange: (p) => $e(r, t, p.target.value)
                              }, [
                                b[9] || (b[9] = e.createElementVNode(
                                  "option",
                                  { value: "" },
                                  "—",
                                  -1
                                  /* CACHED */
                                )),
                                (e.openBlock(!0), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(o(r).headers, (p) => (e.openBlock(), e.createElementBlock("option", {
                                    key: p,
                                    value: p
                                  }, e.toDisplayString(p), 9, bo))),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ], 40, $o)
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ], 8, go),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(o(r).notes, (t) => (e.openBlock(), e.createElementBlock("p", {
                          key: t,
                          class: "ss-note"
                        }, [
                          b[10] || (b[10] = e.createElementVNode(
                            "i",
                            { class: "ri-information-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(t),
                            1
                            /* TEXT */
                          )
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      o(r).skippedCount ? (e.openBlock(), e.createElementBlock("p", ho, [
                        b[11] || (b[11] = e.createElementVNode(
                          "i",
                          { class: "ri-alert-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(a.$t("{n} 行没有收下：{p0}", { n: o(r).skippedCount, p0: o(r).skipped.slice(0, 5).map((t) => a.$t("第 {r} 行（{why}）", { r: t.row, why: t.reason })).join("；") })),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0)
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("div", fo, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!k.value,
                      "data-test": `ca-warn-pick-${r}`,
                      onClick: (t) => pe(r)
                    }, [
                      b[12] || (b[12] = e.createElementVNode(
                        "i",
                        { class: "ri-folder-open-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(o(r) ? a.$t("换一份") : a.$t("选择表格")),
                        1
                        /* TEXT */
                      )
                    ], 8, So),
                    o(r) ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-btn sm ghost",
                      disabled: !!k.value,
                      onClick: (t) => be(r)
                    }, e.toDisplayString(a.$t("移除")), 9, Do)) : e.createCommentVNode("v-if", !0)
                  ])
                ], 42, co)),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 2 计算预警 "),
        e.createVNode(H, {
          "step-key": "cw-compute",
          index: 1,
          title: y[1].title,
          hint: y[1].hint,
          runtime: ee.value["cw-compute"],
          "is-current": oe.value === "cw-compute"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("details", _o, [
              e.createElementVNode(
                "summary",
                null,
                e.toDisplayString(a.$t("预警规则：任一门槛满足即达到该级，从红色往下判；填 0 表示这一项不作门槛")),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", Bo, [
                e.createElementVNode("table", wo, [
                  e.createElementVNode("thead", null, [
                    e.createElementVNode("tr", null, [
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(a.$t("级别")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(a.$t("不及格门数 ≥")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(a.$t("不及格学分 ≥")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(a.$t("缺勤率 ≥（%）")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  e.createElementVNode("tbody", null, [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(h, (r) => e.createElementVNode("tr", { key: r }, [
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", e.unref(_e)(r)])
                            },
                            e.toDisplayString(e.unref(ye)(r)),
                            3
                            /* TEXT, CLASS */
                          )
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (t) => g[r].failCourses = t,
                            type: "number",
                            min: "0",
                            step: "1"
                          }, null, 8, Co), [
                            [
                              e.vModelText,
                              g[r].failCourses,
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (t) => g[r].failCredits = t,
                            type: "number",
                            min: "0",
                            step: "0.5"
                          }, null, 8, To), [
                            [
                              e.vModelText,
                              g[r].failCredits,
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (t) => Z[r] = t,
                            type: "number",
                            min: "0",
                            max: "100",
                            step: "1"
                          }, null, 8, Lo), [
                            [
                              e.vModelText,
                              Z[r],
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ])
                      ])),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ])
                ])
              ]),
              e.createElementVNode("div", Ao, [
                e.createElementVNode("label", Fo, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(a.$t("及格线")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": b[1] || (b[1] = (r) => g.passScore = r),
                      type: "number",
                      min: "0",
                      max: "100"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      e.vModelText,
                      g.passScore,
                      void 0,
                      { number: !0 }
                    ]
                  ])
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: !!k.value || !G.value,
                  onClick: fe
                }, e.toDisplayString(a.$t("保存规则")), 9, Mo),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: Se
                  },
                  e.toDisplayString(a.$t("恢复默认")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("div", zo, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!k.value || !N.value,
                "data-test": "ca-warn-compute",
                onClick: X
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(k.value === "cw-compute" ? "ri-loader-4-line spin" : "ri-calculator-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString($.value ? a.$t("重新计算") : a.$t("计算预警")),
                  1
                  /* TEXT */
                )
              ], 8, qo),
              N.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "span",
                Oo,
                e.toDisplayString(a.$t("先在第 1 步导入学生名单和课程成绩")),
                1
                /* TEXT */
              ))
            ]),
            $.value?.stale ? (e.openBlock(), e.createElementBlock("p", Uo, [
              b[13] || (b[13] = e.createElementVNode(
                "i",
                { class: "ri-alert-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(a.$t("{p0}，下面的结果已经过期，请重新计算", { p0: $.value.staleReason || a.$t("数据或规则已经改过") })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            $.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", Io, [
                  e.createElementVNode("div", Po, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(a.$t("学生")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString($.value.summary.students),
                      1
                      /* TEXT */
                    )
                  ]),
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(h, (r) => e.createElementVNode(
                      "div",
                      {
                        key: r,
                        class: e.normalizeClass(["ss-kpi", `lv-${r}`])
                      },
                      [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(e.unref(ye)(r)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString($.value.summary.byLevel[r]),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    )),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                $.value.summary.unknownStudents.length ? (e.openBlock(), e.createElementBlock("p", Ko, [
                  b[14] || (b[14] = e.createElementVNode(
                    "i",
                    { class: "ri-alert-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(a.$t("{n} 个学号在成绩或考勤里有、名单里没有，已按成绩表里的姓名计算：{p0}", { n: $.value.summary.unknownStudents.length, p0: $.value.summary.unknownStudents.slice(0, 8).join("、") })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                $.value.summary.noAttendance ? (e.openBlock(), e.createElementBlock("p", Wo, [
                  b[15] || (b[15] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(a.$t("没有考勤数据：本次只按成绩判定")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 3 辅导员复核 "),
        e.createVNode(H, {
          "step-key": "cw-review",
          index: 2,
          title: y[2].title,
          hint: y[2].hint,
          runtime: ee.value["cw-review"],
          "is-current": oe.value === "cw-review"
        }, {
          default: e.withCtx(() => [
            $.value && !$.value.stale ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Ro, [
                  (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(T, (r) => e.createElementVNode("button", {
                      key: r.key,
                      type: "button",
                      class: e.normalizeClass({ on: P.value === r.key }),
                      onClick: (t) => P.value = r.key
                    }, e.toDisplayString(r.label), 11, Qo)),
                    64
                    /* STABLE_FRAGMENT */
                  )),
                  e.withDirectives(e.createElementVNode(
                    "select",
                    {
                      "onUpdate:modelValue": b[2] || (b[2] = (r) => F.value = r),
                      class: "ca-sel"
                    },
                    [
                      e.createElementVNode(
                        "option",
                        jo,
                        e.toDisplayString(a.$t("全部班级")),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(n.value, (r) => (e.openBlock(), e.createElementBlock("option", {
                          key: r,
                          value: r
                        }, e.toDisplayString(r), 9, Go))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelSelect, F.value]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!k.value || !d.value.length,
                    "data-test": "ca-warn-confirm-all",
                    onClick: b[3] || (b[3] = (r) => x(d.value.map((t) => t.studentId), "confirmed"))
                  }, e.toDisplayString(a.$t("确认列表中待复核的 {n} 人", { n: d.value.length })), 9, Jo)
                ]),
                e.createElementVNode("div", Ho, [
                  e.createElementVNode("table", Yo, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(a.$t("学生")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(a.$t("班级")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(a.$t("计算级别")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(a.$t("依据")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(a.$t("复核")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(a.$t("备注")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(c.value, (r) => (e.openBlock(), e.createElementBlock("tr", {
                          key: r.studentId
                        }, [
                          e.createElementVNode("td", null, [
                            e.createTextVNode(
                              e.toDisplayString(r.name),
                              1
                              /* TEXT */
                            ),
                            b[16] || (b[16] = e.createElementVNode(
                              "br",
                              null,
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createElementVNode(
                              "small",
                              Xo,
                              e.toDisplayString(r.studentId),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(r.className || "—"),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["ss-chip", e.unref(_e)(r.level)])
                              },
                              e.toDisplayString(r.level ? e.unref(ye)(r.level) : ""),
                              3
                              /* TEXT, CLASS */
                            )
                          ]),
                          e.createElementVNode("td", Zo, [
                            e.createTextVNode(
                              e.toDisplayString(r.basis.join(a.$t("；"))),
                              1
                              /* TEXT */
                            ),
                            r.failed.length ? (e.openBlock(), e.createElementBlock("small", xo, [
                              b[17] || (b[17] = e.createElementVNode(
                                "br",
                                null,
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(r.failed.map((t) => `${t.course} ${t.score}`).join("、")),
                                1
                                /* TEXT */
                              )
                            ])) : e.createCommentVNode("v-if", !0)
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("div", es, [
                              e.createElementVNode(
                                "span",
                                {
                                  class: e.normalizeClass(["ss-chip", z(r) === "confirmed" ? "ok" : z(r) === "dismissed" ? "" : "warn"])
                                },
                                e.toDisplayString(e.unref(je)(z(r))),
                                3
                                /* TEXT, CLASS */
                              ),
                              e.createElementVNode("select", {
                                value: D(r)?.level || "",
                                title: a.$t("调整级别"),
                                onChange: (t) => x([r.studentId], "confirmed", t.target.value || null)
                              }, [
                                e.createElementVNode(
                                  "option",
                                  ls,
                                  e.toDisplayString(a.$t("按计算")),
                                  1
                                  /* TEXT */
                                ),
                                (e.openBlock(), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(h, (t) => e.createElementVNode("option", {
                                    key: t,
                                    value: t
                                  }, e.toDisplayString(e.unref(ye)(t)), 9, ns)),
                                  64
                                  /* STABLE_FRAGMENT */
                                ))
                              ], 40, ts),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm",
                                disabled: !!k.value,
                                onClick: (t) => x([r.studentId], "confirmed")
                              }, e.toDisplayString(a.$t("确认")), 9, os),
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-btn sm ghost",
                                disabled: !!k.value,
                                onClick: (t) => x([r.studentId], "dismissed")
                              }, e.toDisplayString(a.$t("不预警")), 9, ss)
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("input", {
                              class: "ca-note",
                              value: D(r)?.note || "",
                              placeholder: a.$t("可选"),
                              onChange: (t) => x([r.studentId], z(r) === "pending" ? "confirmed" : z(r), void 0, t.target.value)
                            }, null, 40, as)
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ]),
                e.createElementVNode(
                  "p",
                  is,
                  e.toDisplayString(a.$t("共 {a} 人预警，待复核 {b} 人", { a: v.value.length, b: O.value })),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              rs,
              e.toDisplayString(a.$t("先完成第 2 步计算")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createCommentVNode(" 4 谈话提纲与通知 "),
        e.createVNode(H, {
          "step-key": "cw-notice",
          index: 3,
          title: y[3].title,
          hint: y[3].hint,
          runtime: ee.value["cw-notice"],
          "is-current": oe.value === "cw-notice",
          retry: s.value ? ie : void 0
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", cs, [
              e.createElementVNode("label", ds, [
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": b[4] || (b[4] = (r) => C.value = r),
                    type: "checkbox"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelCheckbox, C.value]
                ]),
                e.createTextVNode(
                  e.toDisplayString(a.$t("用大模型写（不勾就用规则模板）")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!k.value || !W.value,
                "data-test": "ca-warn-notices",
                onClick: ie
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(k.value === "cw-notice" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(a.$t("为已确认的 {n} 人生成", { n: W.value })),
                  1
                  /* TEXT */
                )
              ], 8, us)
            ]),
            e.createElementVNode("p", ms, [
              b[18] || (b[18] = e.createElementVNode(
                "i",
                { class: "ri-shield-user-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(a.$t("发给模型的只有匿名事实（课程、分数、学分、缺勤），不发姓名、学号、班级；模型写的数字和事实对不上就改用模板。")),
                1
                /* TEXT */
              )
            ]),
            E.value ? (e.openBlock(), e.createElementBlock("p", ps, [
              b[19] || (b[19] = e.createElementVNode(
                "i",
                { class: "ri-loader-4-line spin" },
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
            i.value.length ? (e.openBlock(), e.createElementBlock("div", vs, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(i.value, (r) => (e.openBlock(), e.createElementBlock("details", {
                  key: r.studentId,
                  class: "ca-notice"
                }, [
                  e.createElementVNode("summary", null, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(r.name),
                      1
                      /* TEXT */
                    ),
                    b[20] || (b[20] = e.createTextVNode()),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", e.unref(_e)(M(r))])
                      },
                      e.toDisplayString(e.unref(ye)(M(r))),
                      3
                      /* TEXT, CLASS */
                    ),
                    b[21] || (b[21] = e.createTextVNode()),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", $.value.notices[r.studentId].by === "model" ? "brand" : ""])
                      },
                      e.toDisplayString($.value.notices[r.studentId].by === "model" ? a.$t("模型撰写") : a.$t("规则模板")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode(
                    "h4",
                    null,
                    e.toDisplayString(a.$t("谈话提纲")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    ys,
                    e.toDisplayString($.value.notices[r.studentId].outline),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "h4",
                    null,
                    e.toDisplayString(a.$t("学生通知")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "p",
                    ks,
                    e.toDisplayString(Ne($.value.notices[r.studentId].notice, r.name)),
                    1
                    /* TEXT */
                  )
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current", "retry"]),
        e.createCommentVNode(" 5 导出与发送 "),
        e.createVNode(H, {
          "step-key": "cw-export",
          index: 4,
          title: y[4].title,
          hint: y[4].hint,
          runtime: ee.value["cw-export"],
          "is-current": oe.value === "cw-export"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", gs, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!k.value || !$.value || $.value.stale || O.value > 0,
                "data-test": "ca-warn-export",
                onClick: De
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(k.value === "cw-export" ? "ri-loader-4-line spin" : "ri-file-excel-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(a.$t("导出预警名单与通知")),
                  1
                  /* TEXT */
                )
              ], 8, Ns),
              O.value ? (e.openBlock(), e.createElementBlock(
                "span",
                Vs,
                e.toDisplayString(a.$t("还有 {n} 人没复核，复核完才能导出", { n: O.value })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            $.value?.exportDir ? (e.openBlock(), e.createElementBlock("p", Es, [
              b[22] || (b[22] = e.createElementVNode(
                "i",
                { class: "ri-folder-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "code",
                null,
                e.toDisplayString($.value.exportDir),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: b[5] || (b[5] = (r) => e.unref(te)($.value.exportDir))
                },
                e.toDisplayString(a.$t("打开文件夹")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", $s, [
              e.createElementVNode("div", bs, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn",
                  disabled: !!k.value || !$.value || $.value.stale || !W.value,
                  onClick: re
                }, [
                  b[23] || (b[23] = e.createElementVNode(
                    "i",
                    { class: "ri-mail-settings-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(a.$t("按辅导员预览邮件")),
                    1
                    /* TEXT */
                  )
                ], 8, hs),
                e.createElementVNode(
                  "span",
                  fs,
                  e.toDisplayString(a.$t("每位辅导员一封，附本人学生的名单、依据、提纲与通知")),
                  1
                  /* TEXT */
                )
              ]),
              V.value ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.createElementVNode("div", Ss, [
                    e.createElementVNode("table", Ds, [
                      e.createElementVNode("thead", null, [
                        e.createElementVNode("tr", null, [
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(a.$t("辅导员")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(a.$t("邮箱")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            _s,
                            e.toDisplayString(a.$t("学生")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(a.$t("结果")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("tbody", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(V.value, (r) => (e.openBlock(), e.createElementBlock(
                            "tr",
                            {
                              key: r.counselor + r.to,
                              class: e.normalizeClass({ bad: !r.to })
                            },
                            [
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(r.counselor),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(r.to || a.$t("没有邮箱，不发送")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Bs,
                                e.toDisplayString(r.students),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(ge(r.to)),
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
                  e.createElementVNode("label", ws, [
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": b[6] || (b[6] = (r) => q.value = r),
                        type: "checkbox",
                        "data-test": "ca-warn-mail-confirm"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelCheckbox, q.value]
                    ]),
                    e.createTextVNode(
                      e.toDisplayString(a.$t("我已核对收件人和名单，确认发送")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Cs, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary",
                      disabled: !!k.value || !q.value || !V.value.some((r) => r.to),
                      onClick: ke
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(k.value === "cw-mail" ? "ri-loader-4-line spin" : "ri-send-plane-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString(a.$t("发送")),
                        1
                        /* TEXT */
                      )
                    ], 8, Ts)
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"])
      ])
    ]));
  }
}), As = /* @__PURE__ */ le(Ls, [["__scopeId", "data-v-4e920a2a"]]), Fs = { class: "ca-ops" }, Ms = {
  class: "ss-panel ca-profile",
  "data-test": "ca-profile"
}, zs = { class: "ca-profile__body" }, qs = { class: "ca-profile__logo" }, Os = ["src"], Us = {
  key: 1,
  class: "ri-image-add-line"
}, Is = { class: "ss-actions" }, Ps = ["disabled"], Ks = ["disabled"], Ws = { class: "ss-muted" }, Rs = { class: "ca-profile__fields" }, Qs = { class: "ss-grid" }, js = { class: "ss-field" }, Gs = ["placeholder"], Js = { class: "ss-field" }, Hs = { class: "ss-field" }, Ys = { class: "ss-field" }, Xs = { class: "ss-field" }, Zs = { class: "ss-field" }, xs = { class: "ss-field" }, ea = { class: "ss-muted" }, ta = { class: "ss-panel" }, la = { class: "ss-table-wrap" }, na = { class: "ss-table" }, oa = { class: "ca-wrap" }, sa = { class: "ss-muted" }, aa = ["disabled"], ia = { class: "ss-chip ok" }, ra = { class: "ca-wrap" }, ca = { class: "ca-wrap" }, da = { class: "ss-panel" }, ua = { class: "ss-grid" }, ma = { class: "ss-field" }, pa = ["placeholder"], va = { class: "ss-field" }, ya = ["value"], ka = { class: "ss-field" }, ga = { class: "ss-field" }, Na = { class: "ss-field" }, Va = { class: "ss-field" }, Ea = { class: "ss-field" }, $a = { class: "ss-actions" }, ba = { class: "ss-muted" }, ha = { class: "ss-actions" }, fa = ["disabled"], Sa = { class: "ss-panel" }, Da = { class: "ca-list" }, _a = { class: "ss-actions" }, Ba = { class: "ss-panel" }, wa = { class: "ss-actions" }, Ca = { class: "ss-muted" }, Ta = {
  key: 0,
  class: "ss-table-wrap tall"
}, La = { class: "ss-table" }, Aa = { class: "num" }, Fa = { class: "num" }, Ma = { class: "ca-wrap" }, za = {
  key: 1,
  class: "ss-muted"
}, qa = /* @__PURE__ */ e.defineComponent({
  __name: "OpsTab",
  setup(I) {
    const w = ne.useNotificationStore(), B = e.computed(() => R.value), h = e.reactive({}), k = e.reactive({ englishName: "", motto: "", founded: "", address: "", website: "", intro: "" }), f = e.ref(!1), U = e.ref(""), C = e.ref(""), V = e.ref(!1), L = e.ref(!1), q = e.ref(null), P = e.ref([]), F = e.ref(!1), y = (i) => i.split(/[；;,，\n]/).map((E) => E.trim()).filter(Boolean), $ = e.computed(() => y(U.value));
    function o(i) {
      i && (Object.assign(h, { schoolName: i.schoolName, hotline: i.hotline, sensitiveDept: i.sensitiveDept, retentionDays: i.retentionDays, mobileDailyLimit: i.mobileDailyLimit, minScore: i.minScore }), Object.assign(k, { englishName: i.profile.englishName, motto: i.profile.motto, founded: i.profile.founded, address: i.profile.address, website: i.profile.website, intro: i.profile.intro }), U.value = i.depts.join(l.t("；")), C.value = i.categories.join(l.t("；")));
    }
    e.watch(() => JSON.stringify(R.value?.settings || null), () => o(R.value?.settings), { immediate: !0 });
    const N = () => ({ ...h, depts: y(U.value), categories: y(C.value), profile: { ...k, logoPath: R.value?.settings.profile.logoPath || "" } }), v = e.computed(() => {
      const i = R.value?.settings;
      if (!i) return !1;
      const E = N();
      return Object.keys(E).some((s) => JSON.stringify(E[s]) !== JSON.stringify(i[s]));
    });
    async function D() {
      V.value = !0;
      try {
        await _("settings.patch", { patch: N() }), await J(), w.success(l.t("已保存"));
      } catch (i) {
        w.error(K.errorMessage(i));
      } finally {
        V.value = !1;
      }
    }
    async function z() {
      const i = await _("folder.pick").catch(() => "");
      if (i)
        try {
          await _("settings.patch", { patch: { outputDir: i } }), await J();
        } catch (E) {
          w.error(K.errorMessage(E));
        }
    }
    async function M() {
      const i = await _("files.pick", { kind: "image", multi: !1, title: l.t("选择校徽图片") }).catch(() => []);
      if (i[0]) {
        f.value = !0;
        try {
          await _("brand.logo", { path: i[0] }), await J();
        } catch (E) {
          w.error(K.errorMessage(E));
        } finally {
          f.value = !1;
        }
      }
    }
    async function O() {
      f.value = !0;
      try {
        await _("brand.logoClear"), await J();
      } catch (i) {
        w.error(K.errorMessage(i));
      } finally {
        f.value = !1;
      }
    }
    async function W() {
      L.value = !0;
      try {
        q.value = await _("model.test"), c();
      } catch (i) {
        q.value = { ok: !1, model: "", ms: 0, error: K.errorMessage(i) };
      } finally {
        L.value = !1;
      }
    }
    async function n(i) {
      if (i === "privacy.purgeQa" && !F.value) {
        F.value = !0, setTimeout(() => {
          F.value = !1;
        }, 3e3);
        return;
      }
      F.value = !1;
      try {
        const E = await _(i);
        await J(), w.success(l.t("已删除 {n} 条问答记录", { n: E })), c();
      } catch (E) {
        w.error(K.errorMessage(E));
      }
    }
    async function c() {
      try {
        P.value = await _("audit.list", { limit: 300 });
      } catch (i) {
        w.error(K.errorMessage(i));
      }
    }
    function d(i) {
      return { kb: l.t("知识库"), qa: l.t("问答"), mobile: l.t("手机端"), ticket: l.t("转办"), warning: l.t("学业预警"), ops: l.t("运维"), apps: l.t("AI 应用中心"), teach: l.t("教学"), research: l.t("科研"), gov: l.t("校务治理") }[i] || i;
    }
    return e.onMounted(() => {
      c();
    }), (i, E) => (e.openBlock(), e.createElementBlock("div", Fs, [
      e.createElementVNode("section", Ms, [
        e.createElementVNode("h3", null, [
          E[16] || (E[16] = e.createElementVNode(
            "i",
            { class: "ri-government-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(i.$t("学校档案")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", zs, [
          e.createElementVNode("div", qs, [
            e.createElementVNode(
              "div",
              {
                class: e.normalizeClass(["ca-profile__crest", { empty: !B.value?.logo }])
              },
              [
                B.value?.logo ? (e.openBlock(), e.createElementBlock("img", {
                  key: 0,
                  src: B.value.logo,
                  alt: ""
                }, null, 8, Os)) : (e.openBlock(), e.createElementBlock("i", Us))
              ],
              2
              /* CLASS */
            ),
            e.createElementVNode("div", Is, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: f.value,
                "data-test": "ca-logo-pick",
                onClick: M
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(f.value ? "ri-loader-4-line spin" : "ri-upload-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(B.value?.logo ? i.$t("更换校徽") : i.$t("上传校徽")),
                  1
                  /* TEXT */
                )
              ], 8, Ps),
              B.value?.logo ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn sm ghost",
                disabled: f.value,
                onClick: O
              }, e.toDisplayString(i.$t("移除")), 9, Ks)) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "small",
              Ws,
              e.toDisplayString(i.$t("PNG、JPG、WebP 或 SVG，3MB 以内；透明底的圆形校徽效果最好")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Rs, [
            e.createElementVNode("div", Qs, [
              e.createElementVNode("label", js, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("学校名称")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": E[0] || (E[0] = (s) => h.schoolName = s),
                  placeholder: i.$t("如：某某职业技术学院"),
                  "data-test": "ca-profile-name"
                }, null, 8, Gs), [
                  [e.vModelText, h.schoolName]
                ])
              ]),
              e.createElementVNode("label", Js, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("英文名称")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": E[1] || (E[1] = (s) => k.englishName = s)
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, k.englishName]
                ])
              ]),
              e.createElementVNode("label", Hs, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("校训")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": E[2] || (E[2] = (s) => k.motto = s)
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, k.motto]
                ])
              ]),
              e.createElementVNode("label", Ys, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("建校年份")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": E[3] || (E[3] = (s) => k.founded = s),
                    inputmode: "numeric"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, k.founded]
                ])
              ]),
              e.createElementVNode("label", Xs, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("地址")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": E[4] || (E[4] = (s) => k.address = s)
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, k.address]
                ])
              ]),
              e.createElementVNode("label", Zs, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(i.$t("官网")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": E[5] || (E[5] = (s) => k.website = s),
                    placeholder: "https://"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, k.website]
                ])
              ])
            ]),
            e.createElementVNode("label", xs, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(i.$t("学校简介")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": E[6] || (E[6] = (s) => k.intro = s),
                  rows: "3"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, k.intro]
              ])
            ]),
            e.createElementVNode(
              "small",
              ea,
              e.toDisplayString(i.$t("校名、校徽和校训显示在页头和学生手机端；校名用于问答和通知的署名。点下方「保存设置」生效。")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createElementVNode("section", ta, [
        e.createElementVNode("h3", null, [
          E[17] || (E[17] = e.createElementVNode(
            "i",
            { class: "ri-pulse-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(i.$t("服务状态")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", la, [
          e.createElementVNode("table", na, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("服务")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("说明")),
                  1
                  /* TEXT */
                ),
                E[18] || (E[18] = e.createElementVNode(
                  "th",
                  null,
                  null,
                  -1
                  /* CACHED */
                ))
              ])
            ]),
            e.createElementVNode("tbody", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(i.$t("大模型")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", null, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", q.value ? q.value.ok ? "ok" : "bad" : B.value?.model ? "brand" : "warn"])
                    },
                    e.toDisplayString(q.value ? q.value.ok ? i.$t("正常") : i.$t("不可用") : B.value?.model ? i.$t("已配置") : i.$t("未配置")),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("td", oa, [
                  e.createTextVNode(
                    e.toDisplayString(q.value ? q.value.ok ? i.$t("{p0} · {n} 秒", { p0: q.value.model, n: (q.value.ms / 1e3).toFixed(1) }) : q.value.error : B.value?.model || i.$t("在「设置 → 模型」里配置")),
                    1
                    /* TEXT */
                  ),
                  E[19] || (E[19] = e.createElementVNode(
                    "br",
                    null,
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "small",
                    sa,
                    e.toDisplayString(i.$t("用于依据原文作答、写谈话提纲与通知；不可用时问答转办、通知改用模板")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("td", null, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: L.value,
                    "data-test": "ca-model-test",
                    onClick: W
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(L.value ? "ri-loader-4-line spin" : "ri-flashlight-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(i.$t("检测")),
                      1
                      /* TEXT */
                    )
                  ], 8, aa)
                ])
              ]),
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(i.$t("知识库检索")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", null, [
                  e.createElementVNode(
                    "span",
                    ia,
                    e.toDisplayString(i.$t("本机")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "td",
                  ra,
                  e.toDisplayString(i.$t("分段与向量在本机计算，不依赖外部服务；已就绪 {a} 份文档、{b} 段", { a: B.value?.stats.docsBuilt || 0, b: B.value?.stats.chunks || 0 })),
                  1
                  /* TEXT */
                ),
                E[20] || (E[20] = e.createElementVNode(
                  "td",
                  null,
                  null,
                  -1
                  /* CACHED */
                ))
              ]),
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(i.$t("学生手机端")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", null, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", B.value?.mobile.running ? "ok" : ""])
                    },
                    e.toDisplayString(B.value?.mobile.running ? i.$t("运行中") : i.$t("未开启")),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode(
                  "td",
                  ca,
                  e.toDisplayString(B.value?.mobile.url || i.$t("在「智能问答」里开启")),
                  1
                  /* TEXT */
                ),
                E[21] || (E[21] = e.createElementVNode(
                  "td",
                  null,
                  null,
                  -1
                  /* CACHED */
                ))
              ])
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", da, [
        e.createElementVNode("h3", null, [
          E[22] || (E[22] = e.createElementVNode(
            "i",
            { class: "ri-settings-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(i.$t("平台设置")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ua, [
          e.createElementVNode("label", ma, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("学校求助电话（敏感问题时告诉学生）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": E[7] || (E[7] = (s) => h.hotline = s),
              placeholder: i.$t("如心理咨询中心、保卫处值班电话")
            }, null, 8, pa), [
              [e.vModelText, h.hotline]
            ])
          ]),
          e.createElementVNode("label", va, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("敏感问题转给")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": E[8] || (E[8] = (s) => h.sensitiveDept = s)
              },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList($.value, (s) => (e.openBlock(), e.createElementBlock("option", {
                    key: s,
                    value: s
                  }, e.toDisplayString(s), 9, ya))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, h.sensitiveDept]
            ])
          ]),
          e.createElementVNode("label", ka, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("问答记录保留天数")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": E[9] || (E[9] = (s) => h.retentionDays = s),
                type: "number",
                min: "7",
                max: "3650"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                h.retentionDays,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", ga, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("手机端每台每天提问上限")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": E[10] || (E[10] = (s) => h.mobileDailyLimit = s),
                type: "number",
                min: "1",
                max: "500"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                h.mobileDailyLimit,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Na, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("检索证据下限（0.05～0.9，越高越严）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": E[11] || (E[11] = (s) => h.minScore = s),
                type: "number",
                min: "0.05",
                max: "0.9",
                step: "0.01"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                h.minScore,
                void 0,
                { number: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode("label", Va, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(i.$t("部门（用；分隔）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": E[12] || (E[12] = (s) => U.value = s)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, U.value]
          ])
        ]),
        e.createElementVNode("label", Ea, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(i.$t("文档类别（用；分隔）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": E[13] || (E[13] = (s) => C.value = s)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, C.value]
          ])
        ]),
        e.createElementVNode("div", $a, [
          e.createElementVNode(
            "span",
            ba,
            e.toDisplayString(i.$t("输出目录：{p0}", { p0: B.value?.outputDir || "" })),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: z
            },
            e.toDisplayString(i.$t("更换")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ha, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: V.value || !v.value,
            "data-test": "ca-settings-save",
            onClick: D
          }, [
            E[23] || (E[23] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(i.$t("保存设置")),
              1
              /* TEXT */
            )
          ], 8, fa)
        ])
      ]),
      e.createElementVNode("section", Sa, [
        e.createElementVNode("h3", null, [
          E[24] || (E[24] = e.createElementVNode(
            "i",
            { class: "ri-shield-keyhole-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(i.$t("数据与隐私")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("ul", Da, [
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(i.$t("知识库文档、问答记录、学生成绩与考勤都只存在本机账号目录里")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(i.$t("学生手机端是匿名会话，不收集姓名学号；只能看到自己问过的问题")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(i.$t("学业预警交给模型的只有匿名事实，不含姓名、学号、班级")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(i.$t("问答记录与审计日志超过保留天数自动删除")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", _a, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            onClick: E[14] || (E[14] = (s) => n("privacy.purgeExpired"))
          }, [
            E[25] || (E[25] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(i.$t("立即清理过期记录")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn danger",
              onClick: E[15] || (E[15] = (s) => n("privacy.purgeQa"))
            },
            e.toDisplayString(F.value ? i.$t("确认清空") : i.$t("清空全部问答记录")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createElementVNode("section", Ba, [
        e.createElementVNode("h3", null, [
          E[26] || (E[26] = e.createElementVNode(
            "i",
            { class: "ri-file-list-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(i.$t("调用审计")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", wa, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            onClick: c
          }, [
            E[27] || (E[27] = e.createElementVNode(
              "i",
              { class: "ri-refresh-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(i.$t("刷新")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            Ca,
            e.toDisplayString(i.$t("最近 300 条；不记录学生个人信息原文")),
            1
            /* TEXT */
          )
        ]),
        P.value.length ? (e.openBlock(), e.createElementBlock("div", Ta, [
          e.createElementVNode("table", La, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("时间")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("模块")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("操作")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("结果")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Aa,
                  e.toDisplayString(i.$t("耗时")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(i.$t("说明")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(P.value, (s, T) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: T,
                    class: e.normalizeClass({ bad: !s.ok })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(e.unref(K.fmtDateTime)(s.at)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(d(s.module)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(s.action),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", s.ok ? "ok" : "bad"])
                        },
                        e.toDisplayString(s.ok ? i.$t("成功") : i.$t("失败")),
                        3
                        /* TEXT, CLASS */
                      )
                    ]),
                    e.createElementVNode(
                      "td",
                      Fa,
                      e.toDisplayString(s.ms !== void 0 ? `${(s.ms / 1e3).toFixed(1)}s` : ""),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Ma,
                      e.toDisplayString(s.detail || ""),
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
          za,
          e.toDisplayString(i.$t("还没有记录")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), Oa = /* @__PURE__ */ le(qa, [["__scopeId", "data-v-2bb25c63"]]), Le = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!Le) throw new Error("宿主模块未就绪：npm:vue-router");
Le.default;
const Ua = { class: "ca-apps" }, Ia = { class: "ss-panel" }, Pa = { class: "ss-muted" }, Ka = { class: "ca-apps__sum" }, Wa = ["onClick", "onKeydown"], Ra = { class: "ca-apps__seal" }, Qa = { class: "ss-actions" }, ja = { class: "ss-grid" }, Ga = { class: "ss-field" }, Ja = ["disabled"], Ha = ["value"], Ya = { class: "ss-field" }, Xa = ["disabled", "placeholder"], Za = { class: "ss-field" }, xa = { class: "ss-field" }, ei = ["value"], ti = {
  key: 0,
  class: "ss-field"
}, li = { class: "ss-field" }, ni = { id: "ca-apps-depts" }, oi = ["value"], si = { class: "ss-actions" }, ai = {
  type: "submit",
  class: "ss-btn primary sm"
}, ii = { class: "ca-apps__seal sm" }, ri = { class: "ss-table-wrap" }, ci = { class: "ss-table" }, di = { class: "num" }, ui = { class: "ca-wrap" }, mi = {
  key: 0,
  class: "ss-chip"
}, pi = { class: "ss-muted" }, vi = { class: "num" }, yi = { class: "ca-wrap" }, ki = ["onClick"], gi = ["onClick"], Ni = ["onClick"], Vi = /* @__PURE__ */ e.defineComponent({
  __name: "AppsTab",
  emits: ["go"],
  setup(I, { emit: w }) {
    const B = w, h = Le.useRouter(), k = ne.useNotificationStore(), f = de.CA_DIRECTIONS, U = ["planned", "building", "live"], C = e.ref(""), V = e.ref(""), L = e.ref(null), q = e.computed(() => R.value?.scenarios || []), P = e.computed(() => C.value ? [C.value] : f), F = (n) => q.value.filter((c) => c.direction === n), y = (n) => {
      const c = F(n);
      return { total: c.length, live: c.filter((d) => d.stage === "live").length, usage: c.reduce((d, i) => d + i.usage30d, 0) };
    }, $ = (n) => ({ plan: l.t("统一规划、建设与运维"), teach: l.t("教学"), research: l.t("科研"), gov: l.t("校务治理"), service: l.t("师生服务") })[n], o = (n) => ({ plan: l.t("统"), teach: l.t("教"), research: l.t("研"), gov: l.t("治"), service: l.t("服") })[n], N = (n) => ({ planned: l.t("规划中"), building: l.t("建设中"), live: l.t("已上线") })[n];
    function v(n) {
      n.startsWith("tab:") ? B("go", n.slice(4)) : n.startsWith("route:") && h.push(n.slice(6));
    }
    function D() {
      L.value = { builtin: !1, direction: C.value || "plan", name: "", desc: "", dept: "", stage: "planned", note: "" };
    }
    function z(n) {
      L.value = { id: n.id, builtin: n.builtin, direction: n.direction, name: n.name, desc: n.desc, dept: n.dept, stage: n.stage, note: n.note || "" };
    }
    async function M() {
      const n = L.value;
      if (n)
        try {
          await _("apps.save", { builtin: n.builtin, input: { id: n.id, direction: n.direction, name: n.name, desc: n.desc, dept: n.dept, stage: n.stage, note: n.note } }), L.value = null, await J();
        } catch (c) {
          k.error(K.errorMessage(c));
        }
    }
    async function O(n) {
      if (V.value !== n) {
        V.value = n, setTimeout(() => {
          V.value === n && (V.value = "");
        }, 3e3);
        return;
      }
      V.value = "";
      try {
        await _("apps.remove", { id: n }), await J();
      } catch (c) {
        k.error(K.errorMessage(c));
      }
    }
    async function W() {
      try {
        const n = await _("apps.export");
        te(n, !0);
      } catch (n) {
        k.error(K.errorMessage(n));
      }
    }
    return (n, c) => (e.openBlock(), e.createElementBlock("div", Ua, [
      e.createElementVNode("section", Ia, [
        e.createElementVNode("h3", null, [
          c[7] || (c[7] = e.createElementVNode(
            "i",
            { class: "ri-compass-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("AI 应用建设台账")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          Pa,
          e.toDisplayString(n.$t("按统一规划、建设与运维、教学、科研、校务治理、师生服务五个方向列出全校 AI 场景。内置场景已上线可直接进入；学校自己规划的场景在这里登记，阶段与责任部门由信息中心维护，用量取自调用审计。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Ka, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(f), (d) => (e.openBlock(), e.createElementBlock("div", {
              key: d,
              class: e.normalizeClass(["ca-apps__dir", { on: C.value === d }]),
              role: "button",
              tabindex: "0",
              onClick: (i) => C.value = C.value === d ? "" : d,
              onKeydown: e.withKeys((i) => C.value = C.value === d ? "" : d, ["enter"])
            }, [
              e.createElementVNode(
                "span",
                Ra,
                e.toDisplayString(o(d)),
                1
                /* TEXT */
              ),
              e.createElementVNode("div", null, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString($(d)),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(n.$t("{a} 个场景 · 已上线 {b} · 30 天 {c} 次", { a: y(d).total, b: y(d).live, c: y(d).usage })),
                  1
                  /* TEXT */
                )
              ])
            ], 42, Wa))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        e.createElementVNode("div", Qa, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary sm",
            onClick: D
          }, [
            c[8] || (c[8] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("登记规划场景")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            onClick: W
          }, [
            c[9] || (c[9] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("导出建设台账")),
              1
              /* TEXT */
            )
          ])
        ]),
        L.value ? (e.openBlock(), e.createElementBlock(
          "form",
          {
            key: 0,
            class: "ca-apps__form",
            onSubmit: e.withModifiers(M, ["prevent"])
          },
          [
            e.createElementVNode("div", ja, [
              e.createElementVNode("label", Ga, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("方向")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("select", {
                  "onUpdate:modelValue": c[0] || (c[0] = (d) => L.value.direction = d),
                  disabled: L.value.builtin
                }, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(f), (d) => (e.openBlock(), e.createElementBlock("option", {
                      key: d,
                      value: d
                    }, e.toDisplayString($(d)), 9, Ha))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ], 8, Ja), [
                  [e.vModelSelect, L.value.direction]
                ])
              ]),
              e.createElementVNode("label", Ya, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("场景名称")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": c[1] || (c[1] = (d) => L.value.name = d),
                  disabled: L.value.builtin,
                  placeholder: n.$t("如：招生咨询数字人、实训设备运维助手")
                }, null, 8, Xa), [
                  [e.vModelText, L.value.name]
                ])
              ]),
              e.createElementVNode("label", Za, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("责任部门")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": c[2] || (c[2] = (d) => L.value.dept = d),
                    list: "ca-apps-depts"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, L.value.dept]
                ])
              ]),
              e.createElementVNode("label", xa, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(n.$t("阶段")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": c[3] || (c[3] = (d) => L.value.stage = d)
                  },
                  [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(U, (d) => e.createElementVNode("option", {
                        key: d,
                        value: d
                      }, e.toDisplayString(N(d)), 9, ei)),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, L.value.stage]
                ])
              ])
            ]),
            L.value.builtin ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("label", ti, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(n.$t("说明")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": c[4] || (c[4] = (d) => L.value.desc = d)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, L.value.desc]
              ])
            ])),
            e.createElementVNode("label", li, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(n.$t("备注（进度、负责人、计划上线时间）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": c[5] || (c[5] = (d) => L.value.note = d)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, L.value.note]
              ])
            ]),
            e.createElementVNode("datalist", ni, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(R)?.settings.depts || [], (d) => (e.openBlock(), e.createElementBlock("option", {
                  key: d,
                  value: d
                }, null, 8, oi))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", si, [
              e.createElementVNode(
                "button",
                ai,
                e.toDisplayString(n.$t("保存")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn sm",
                  onClick: c[6] || (c[6] = (d) => L.value = null)
                },
                e.toDisplayString(n.$t("取消")),
                1
                /* TEXT */
              )
            ])
          ],
          32
          /* NEED_HYDRATION */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(P.value, (d) => (e.openBlock(), e.createElementBlock("section", {
          key: d,
          class: "ss-panel ca-ledger"
        }, [
          e.createElementVNode("h3", null, [
            e.createElementVNode(
              "span",
              ii,
              e.toDisplayString(o(d)),
              1
              /* TEXT */
            ),
            e.createTextVNode(
              e.toDisplayString($(d)),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", ri, [
            e.createElementVNode("table", ci, [
              e.createElementVNode("thead", null, [
                e.createElementVNode("tr", null, [
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(n.$t("场景")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(n.$t("责任部门")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(n.$t("阶段")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    di,
                    e.toDisplayString(n.$t("30 天调用")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "th",
                    null,
                    e.toDisplayString(n.$t("备注")),
                    1
                    /* TEXT */
                  ),
                  c[10] || (c[10] = e.createElementVNode(
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
                  e.renderList(F(d), (i) => (e.openBlock(), e.createElementBlock("tr", {
                    key: i.id
                  }, [
                    e.createElementVNode("td", ui, [
                      e.createElementVNode(
                        "b",
                        null,
                        e.toDisplayString(i.name),
                        1
                        /* TEXT */
                      ),
                      i.builtin ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                        "small",
                        mi,
                        e.toDisplayString(n.$t("学校规划")),
                        1
                        /* TEXT */
                      )),
                      c[11] || (c[11] = e.createElementVNode(
                        "br",
                        null,
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode(
                        "small",
                        pi,
                        e.toDisplayString(i.desc),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(i.dept || "—"),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ca-stage", i.stage])
                        },
                        e.toDisplayString(N(i.stage)),
                        3
                        /* TEXT, CLASS */
                      )
                    ]),
                    e.createElementVNode(
                      "td",
                      vi,
                      e.toDisplayString(i.target ? i.usage30d : "—"),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      yi,
                      e.toDisplayString(i.note || ""),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      i.target && i.stage === "live" ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-btn sm",
                        onClick: (E) => v(i.target)
                      }, e.toDisplayString(n.$t("进入")), 9, ki)) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost",
                        onClick: (E) => z(i)
                      }, e.toDisplayString(n.$t("编辑")), 9, gi),
                      i.builtin ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
                        key: 1,
                        type: "button",
                        class: "ss-btn sm ghost danger",
                        onClick: (E) => O(i.id)
                      }, e.toDisplayString(V.value === i.id ? n.$t("确认删除") : n.$t("删除")), 9, Ni))
                    ])
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])
        ]))),
        128
        /* KEYED_FRAGMENT */
      ))
    ]));
  }
}), Ei = /* @__PURE__ */ le(Vi, [["__scopeId", "data-v-adca0cff"]]), $i = { class: "ca-teach" }, bi = {
  class: "ca-subnav",
  role: "tablist"
}, hi = ["aria-selected", "data-test", "onClick"], fi = { class: "ca-course-pick" }, Si = { value: "" }, Di = ["value"], _i = { class: "ca-split" }, Bi = { class: "ss-panel" }, wi = { class: "ss-actions" }, Ci = ["disabled"], Ti = { class: "ss-muted" }, Li = ["placeholder"], Ai = ["placeholder"], Fi = { class: "ca-check" }, Mi = ["disabled"], zi = { class: "ca-courses" }, qi = ["onClick"], Oi = ["onClick"], Ui = ["onClick"], Ii = {
  key: 0,
  class: "empty"
}, Pi = { class: "ss-panel" }, Ki = { class: "ss-actions" }, Wi = ["disabled"], Ri = { class: "ss-muted" }, Qi = { class: "ca-docs" }, ji = {
  key: 0,
  class: "empty"
}, Gi = {
  key: 1,
  class: "ss-muted"
}, Ji = { class: "ss-panel" }, Hi = {
  key: 0,
  class: "ss-muted"
}, Yi = { class: "ss-muted" }, Xi = ["disabled", "placeholder"], Zi = ["disabled"], xi = {
  key: 0,
  class: "ca-answer",
  "data-test": "ca-tutor-answer"
}, er = { class: "ca-pre" }, tr = {
  key: 0,
  class: "ca-sources"
}, lr = { class: "ss-panel" }, nr = {
  key: 0,
  class: "ss-muted"
}, or = { class: "ss-muted" }, sr = { class: "ca-quiz-form" }, ar = ["onUpdate:modelValue"], ir = { class: "ss-field wide" }, rr = ["placeholder"], cr = { class: "ss-actions" }, dr = ["disabled"], ur = {
  key: 0,
  class: "ss-muted"
}, mr = {
  key: 1,
  class: "ss-muted"
}, pr = {
  key: 2,
  class: "ss-muted"
}, vr = { class: "ss-panel" }, yr = { class: "ss-chip" }, kr = { class: "ss-actions" }, gr = ["disabled"], Nr = ["disabled"], Vr = ["disabled"], Er = ["disabled"], $r = { class: "ca-bank" }, br = { class: "ca-bank__pick" }, hr = ["value"], fr = { class: "ca-bank__body" }, Sr = { class: "ss-chip brand" }, Dr = { class: "ss-muted" }, _r = {
  key: 0,
  type: "A",
  class: "ca-bank__opts"
}, Br = { class: "ca-bank__ans" }, wr = { class: "ca-bank__src" }, Cr = { class: "ca-check" }, Tr = ["checked", "onChange"], Lr = {
  key: 0,
  class: "empty"
}, Ar = { class: "ss-module" }, Fr = { class: "ss-steps" }, Mr = { class: "ss-actions" }, zr = { class: "ss-field inline" }, qr = { value: "" }, Or = ["value"], Ur = ["placeholder"], Ir = ["disabled"], Pr = ["disabled"], Kr = { class: "ss-muted" }, Wr = {
  key: 1,
  class: "ca-key"
}, Rr = { class: "ss-actions" }, Qr = ["disabled"], jr = ["disabled"], Gr = { class: "ss-muted" }, Jr = { class: "ss-actions" }, Hr = ["disabled"], Yr = { class: "ss-muted" }, Xr = {
  key: 0,
  class: "ss-note info"
}, Zr = { class: "ss-actions" }, xr = ["disabled"], ec = { class: "ss-muted" }, tc = { class: "ss-table-wrap tall" }, lc = { class: "ss-table" }, nc = { class: "num" }, oc = { class: "ss-muted" }, sc = ["title"], ac = ["max", "value", "placeholder", "onChange"], ic = { key: 1 }, rc = { class: "num" }, cc = {
  key: 1,
  class: "ss-muted"
}, dc = { class: "ss-actions" }, uc = ["disabled"], mc = {
  key: 0,
  class: "ss-muted"
}, pc = {
  key: 0,
  class: "ss-file-out"
}, vc = /* @__PURE__ */ e.defineComponent({
  __name: "TeachTab",
  setup(I) {
    const w = ne.useNotificationStore(), B = [
      { key: "course", label: l.t("课程与助教"), icon: "ri-book-shelf-line" },
      { key: "quiz", label: l.t("智能出题"), icon: "ri-file-list-3-line" },
      { key: "grade", label: l.t("作业批改"), icon: "ri-checkbox-multiple-line" }
    ], h = de.CA_QUESTION_TYPES, k = e.ref("course"), f = e.ref(""), U = e.ref(""), C = e.ref(""), V = e.reactive({ name: "", teacher: "", publicTutor: !0 }), L = e.ref(""), q = e.ref(null), P = e.reactive({ single: 4, multiple: 2, judge: 2, short: 2 }), F = e.ref(""), y = e.ref(null), $ = e.ref([]), o = e.ref([]), N = e.ref(""), v = e.ref(null), D = e.ref(""), z = e.ref([]), M = e.ref({}), O = e.computed(() => R.value?.courses || []), W = e.computed(() => O.value.find((t) => t.id === C.value) || null), n = (t) => (R.value?.docs || []).filter((p) => p.courseId === t), c = e.computed(() => !!W.value && n(W.value.id).some((t) => t.status === "built")), d = e.computed(() => (R.value?.gradings || []).filter((t) => !C.value || t.courseId === C.value)), i = e.computed(() => $.value.length > 0 && o.value.length === $.value.length), E = e.computed(() => ue.value.scope === "grade" ? ue.value.message : ""), s = (t) => ({ single: l.t("单选题"), multiple: l.t("多选题"), judge: l.t("判断题"), short: l.t("简答题") })[t], T = (t) => t.type === "judge" ? t.answer === "T" ? l.t("对") : l.t("错") : t.answer, g = (t) => v.value?.key.find((p) => p.no === t)?.type === "short", Z = e.computed(() => !!v.value?.key.some((t) => t.type === "short")), se = e.computed(() => v.value?.rows.filter((t) => !t.confirmed).length || 0), me = e.computed(() => v.value?.rows.filter((t) => !t.confirmed && t.items.every((p) => p.final !== null)).length || 0);
    async function G(t, p) {
      f.value = t, M.value = { ...M.value, [t]: "" };
      try {
        const m = await p();
        return await J(), m;
      } catch (m) {
        return M.value = { ...M.value, [t]: K.errorMessage(m) }, w.error(K.errorMessage(m)), null;
      } finally {
        f.value = "";
      }
    }
    function ee(t) {
      return U.value === t ? (U.value = "", !0) : (U.value = t, setTimeout(() => {
        U.value === t && (U.value = "");
      }, 3e3), !1);
    }
    async function oe() {
      const t = await G("demo", () => _("teach.demo"));
      t && (C.value = t.courseId, ae.value = t, w.success(l.t("已载入示例课程")));
    }
    const ae = e.ref(null);
    async function Y() {
      const t = await G("course", () => _("course.save", { input: { ...V } }));
      t && (C.value = t.id, Object.assign(V, { id: void 0, name: "", teacher: "", publicTutor: !0 }));
    }
    function u(t) {
      Object.assign(V, { id: t.id, name: t.name, teacher: t.teacher, publicTutor: t.publicTutor });
    }
    async function A(t) {
      ee(t) && (await G("course", () => _("course.remove", { id: t })), C.value === t && (C.value = ""));
    }
    async function S() {
      const t = await _("files.pick", { kind: "doc", multi: !0, title: l.t("选择课程资料") }).catch(() => []);
      t.length && await G("course", () => _("course.import", { courseId: C.value, paths: t }));
    }
    async function j() {
      const t = await G("tutor", () => _("tutor.ask", { courseId: C.value, question: L.value }));
      t && (q.value = t);
    }
    async function pe() {
      $.value = C.value ? await _("quiz.list", { courseId: C.value }).catch(() => []) : [], o.value = o.value.filter((t) => $.value.some((p) => p.id === t));
    }
    async function Ee() {
      const t = await G("quiz", () => _("quiz.generate", { courseId: C.value, counts: { ...P }, focus: F.value }));
      t && (y.value = t, await pe());
    }
    function $e() {
      o.value = i.value ? [] : $.value.map((t) => t.id);
    }
    async function be(t, p) {
      try {
        await _("quiz.update", { id: t, patch: { reviewed: p } }), await pe();
      } catch (m) {
        w.error(K.errorMessage(m));
      }
    }
    async function he() {
      ee("bank") && (await G("quiz", () => _("quiz.remove", { ids: o.value })), o.value = [], await pe());
    }
    async function fe() {
      const t = await G("quiz", () => _("quiz.export", { courseId: C.value, ids: o.value }));
      t && te(t, !0);
    }
    async function Se() {
      const t = await G("quiz", () => _("grade.create", { courseId: C.value, title: l.t("{p0} 测验", { p0: W.value?.name || "" }), questionIds: o.value }));
      t && (N.value = t.id, k.value = "grade");
    }
    const X = [
      { key: "gr-key", title: l.t("标准答案"), hint: l.t("导入标准答案表，或从题库选题生成") },
      { key: "gr-ans", title: l.t("学生作答"), hint: l.t("导入作答表，客观题按答案自动判分") },
      { key: "gr-auto", title: l.t("主观题建议分"), hint: l.t("按评分要点给建议分，不发姓名学号") },
      { key: "gr-confirm", title: l.t("教师确认"), hint: l.t("逐题核对、改分、确认") },
      { key: "gr-export", title: l.t("导出成绩"), hint: l.t("成绩表 + 每题评分说明") }
    ], x = e.computed(() => {
      const t = v.value, p = M.value, m = t ? t.rows.some((Q) => Q.items.some((ce) => g(ce.no) && ce.by === "pending")) : !0;
      return {
        "gr-key": f.value === "key" ? { state: "running" } : p.key ? { state: "failed", error: p.key } : t ? { state: "done", summary: l.t("{n} 道题，满分 {m}", { n: t.key.length, m: t.key.reduce((Q, ce) => Q + ce.score, 0) }) } : { state: "todo" },
        "gr-ans": f.value === "ans" ? { state: "running" } : p.ans ? { state: "failed", error: p.ans } : t?.rows.length ? { state: "done", summary: l.t("{n} 名学生", { n: t.rows.length }) } : { state: "todo" },
        "gr-auto": f.value === "suggest" ? { state: "running", kind: "llm", progressAt: Date.now() } : p.suggest ? { state: "failed", error: p.suggest } : t?.rows.length && !Z.value ? { state: "skipped" } : t?.rows.length && !m ? { state: "done", summary: l.t("主观题已有分数") } : { state: "todo" },
        "gr-confirm": t?.rows.length && !se.value ? { state: "done", summary: l.t("{n} 名学生已确认", { n: t.rows.length }) } : { state: "todo" },
        "gr-export": f.value === "export" ? { state: "running" } : p.export ? { state: "failed", error: p.export } : t?.exportedAt ? { state: "done", summary: t.exportPath || "" } : { state: "todo" }
      };
    }), ie = e.computed(() => X.find((t) => !["done", "skipped"].includes(x.value[t.key].state))?.key || "gr-export"), De = (t) => {
      K.scrollToStep(t);
    };
    async function re() {
      v.value = N.value ? await _("grade.get", { id: N.value }).catch(() => null) : null;
    }
    async function ke(t) {
      if (!W.value) {
        w.warn(l.t("先在右上角选一门课"));
        return;
      }
      const p = t ? [t] : await _("files.pick", { kind: "excel", multi: !1, title: l.t("选择标准答案表") }).catch(() => []);
      if (!p[0]) return;
      const m = await G("key", () => _("grade.create", { courseId: C.value, title: D.value || l.t("{p0} 作业", { p0: W.value.name }), keyPath: p[0] }));
      m && (N.value = m.id, m.problems.forEach((Q) => w.warn(Q)));
    }
    async function ge(t) {
      const p = t ? [t] : await _("files.pick", { kind: "excel", multi: !1, title: l.t("选择学生作答表") }).catch(() => []);
      if (!p[0]) return;
      const m = await G("ans", () => _("grade.answers", { id: N.value, path: p[0] }));
      m && (z.value = m.problems, await re());
    }
    async function Ne() {
      const t = await G("suggest", () => _("grade.suggest", { id: N.value }));
      await re(), t && w.success(l.t("建议分 {a} 份，待教师评 {b} 份", { a: t.suggested, b: t.failed }));
    }
    async function a(t, p, m) {
      try {
        await _("grade.set", { id: N.value, studentId: t, no: p, final: m === "" ? null : Number(m) }), await re();
      } catch (Q) {
        w.error(K.errorMessage(Q));
      }
    }
    async function b() {
      await G("confirm", () => _("grade.confirm", { id: N.value })), await re();
    }
    async function r() {
      const t = await G("export", () => _("grade.export", { id: N.value }));
      await re(), t && te(t, !0);
    }
    return e.watch(C, () => {
      pe(), q.value = null, y.value = null;
    }), e.watch(N, () => {
      z.value = [], re();
    }), e.watch(k, (t) => {
      t === "quiz" && pe(), t === "grade" && re();
    }), !C.value && O.value[0] && (C.value = O.value[0].id), (t, p) => (e.openBlock(), e.createElementBlock("div", $i, [
      e.createElementVNode("nav", bi, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(B, (m) => e.createElementVNode("button", {
            key: m.key,
            type: "button",
            role: "tab",
            "aria-selected": k.value === m.key,
            class: e.normalizeClass({ on: k.value === m.key }),
            "data-test": `ca-teach-${m.key}`,
            onClick: (Q) => k.value = m.key
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(m.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(m.label),
              1
              /* TEXT */
            )
          ], 10, hi)),
          64
          /* STABLE_FRAGMENT */
        )),
        p[14] || (p[14] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("label", fi, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(t.$t("课程")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": p[0] || (p[0] = (m) => C.value = m),
              class: "ca-sel",
              "data-test": "ca-course-select"
            },
            [
              e.createElementVNode(
                "option",
                Si,
                e.toDisplayString(t.$t("— 选择课程 —")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(O.value, (m) => (e.openBlock(), e.createElementBlock("option", {
                  key: m.id,
                  value: m.id
                }, e.toDisplayString(m.name), 9, Di))),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, C.value]
          ])
        ])
      ]),
      e.createCommentVNode(" 课程与助教 "),
      k.value === "course" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 0 },
        [
          e.createElementVNode("div", _i, [
            e.createElementVNode("section", Bi, [
              e.createElementVNode("h3", null, [
                p[15] || (p[15] = e.createElementVNode(
                  "i",
                  { class: "ri-book-shelf-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("课程")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", wi, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm",
                  disabled: !!f.value,
                  "data-test": "ca-teach-demo",
                  onClick: oe
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(f.value === "demo" ? "ri-loader-4-line spin" : "ri-file-download-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("载入示例课程")),
                    1
                    /* TEXT */
                  )
                ], 8, Ci),
                e.createElementVNode(
                  "span",
                  Ti,
                  e.toDisplayString(t.$t("「电工电子技术」讲义 + 一份 5 题作业的标准答案与 20 名学生作答")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "form",
                {
                  class: "ca-inline-form",
                  onSubmit: e.withModifiers(Y, ["prevent"])
                },
                [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": p[1] || (p[1] = (m) => V.name = m),
                    class: "ca-input",
                    placeholder: t.$t("课程名称")
                  }, null, 8, Li), [
                    [e.vModelText, V.name]
                  ]),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": p[2] || (p[2] = (m) => V.teacher = m),
                    class: "ca-input sm",
                    placeholder: t.$t("任课教师")
                  }, null, 8, Ai), [
                    [e.vModelText, V.teacher]
                  ]),
                  e.createElementVNode("label", Fi, [
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": p[3] || (p[3] = (m) => V.publicTutor = m),
                        type: "checkbox"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelCheckbox, V.publicTutor]
                    ]),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("开放给学生手机提问")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "submit",
                    class: "ss-btn primary sm",
                    disabled: !V.name.trim()
                  }, e.toDisplayString(V.id ? t.$t("保存") : t.$t("新建课程")), 9, Mi)
                ],
                32
                /* NEED_HYDRATION */
              ),
              e.createElementVNode("ul", zi, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(O.value, (m) => (e.openBlock(), e.createElementBlock("li", {
                    key: m.id,
                    class: e.normalizeClass({ on: m.id === C.value }),
                    onClick: (Q) => C.value = m.id
                  }, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(m.name),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("small", null, [
                      e.createTextVNode(
                        e.toDisplayString(m.teacher || "—") + " · " + e.toDisplayString(t.$t("{n} 份资料", { n: n(m.id).length })),
                        1
                        /* TEXT */
                      ),
                      m.publicTutor ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createTextVNode(
                            " · " + e.toDisplayString(t.$t("手机可问")),
                            1
                            /* TEXT */
                          )
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]),
                    p[16] || (p[16] = e.createElementVNode(
                      "span",
                      { class: "grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm ghost",
                      onClick: e.withModifiers((Q) => u(m), ["stop"])
                    }, e.toDisplayString(t.$t("编辑")), 9, Oi),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm ghost danger",
                      onClick: e.withModifiers((Q) => A(m.id), ["stop"])
                    }, e.toDisplayString(U.value === m.id ? t.$t("确认删除") : t.$t("删除")), 9, Ui)
                  ], 10, qi))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                O.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "li",
                  Ii,
                  e.toDisplayString(t.$t("还没有课程：新建一门，或载入示例课程")),
                  1
                  /* TEXT */
                ))
              ])
            ]),
            e.createElementVNode("section", Pi, [
              e.createElementVNode("h3", null, [
                p[17] || (p[17] = e.createElementVNode(
                  "i",
                  { class: "ri-folder-open-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("课程资料")),
                  1
                  /* TEXT */
                )
              ]),
              W.value ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.createElementVNode("div", Ki, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!f.value,
                      onClick: S
                    }, [
                      p[18] || (p[18] = e.createElementVNode(
                        "i",
                        { class: "ri-file-add-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("导入讲义 / 课件 / 教材节选")),
                        1
                        /* TEXT */
                      )
                    ], 8, Wi),
                    e.createElementVNode(
                      "span",
                      Ri,
                      e.toDisplayString(t.$t("只给这门课的助教和出题用，不进全校问答")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("ul", Qi, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(n(W.value.id), (m) => (e.openBlock(), e.createElementBlock("li", {
                        key: m.id
                      }, [
                        p[19] || (p[19] = e.createElementVNode(
                          "i",
                          { class: "ri-file-text-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(m.name),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "em",
                          {
                            class: e.normalizeClass(["ss-chip", m.status === "built" ? "ok" : m.status === "failed" ? "bad" : "brand"])
                          },
                          e.toDisplayString(m.status === "built" ? t.$t("{n} 段", { n: m.chunks }) : m.status === "failed" ? t.$t("失败") : t.$t("构建中")),
                          3
                          /* TEXT, CLASS */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    n(W.value.id).length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                      "li",
                      ji,
                      e.toDisplayString(t.$t("还没有资料")),
                      1
                      /* TEXT */
                    ))
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : (e.openBlock(), e.createElementBlock(
                "p",
                Gi,
                e.toDisplayString(t.$t("先在左边选一门课")),
                1
                /* TEXT */
              ))
            ])
          ]),
          e.createElementVNode("section", Ji, [
            e.createElementVNode("h3", null, [
              p[20] || (p[20] = e.createElementVNode(
                "i",
                { class: "ri-user-voice-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("课程助教")),
                1
                /* TEXT */
              ),
              W.value ? (e.openBlock(), e.createElementBlock(
                "small",
                Hi,
                e.toDisplayString(W.value.name),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              Yi,
              e.toDisplayString(t.$t("学生问这门课的问题，助教只依据课程资料作答并给出处；资料里没有的转给任课教师，不编。")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "form",
              {
                class: "ss-actions",
                onSubmit: e.withModifiers(j, ["prevent"])
              },
              [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": p[4] || (p[4] = (m) => L.value = m),
                  class: "ca-input",
                  disabled: !W.value,
                  placeholder: t.$t("例如：并联电阻的总电阻怎么算？"),
                  "data-test": "ca-tutor-input"
                }, null, 8, Xi), [
                  [e.vModelText, L.value]
                ]),
                e.createElementVNode("button", {
                  type: "submit",
                  class: "ss-btn primary",
                  disabled: !W.value || !L.value.trim() || !!f.value,
                  "data-test": "ca-tutor-ask"
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(f.value === "tutor" ? "ri-loader-4-line spin" : "ri-question-answer-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("提问")),
                    1
                    /* TEXT */
                  )
                ], 8, Zi)
              ],
              32
              /* NEED_HYDRATION */
            ),
            q.value ? (e.openBlock(), e.createElementBlock("article", xi, [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", q.value.kind === "answer" || q.value.kind === "quote" ? "brand" : "warn"])
                },
                e.toDisplayString(q.value.kind === "no_evidence" ? t.$t("资料里没有，已转任课教师") : q.value.kind === "quote" ? t.$t("原文摘录") : q.value.kind === "sensitive" ? t.$t("敏感问题") : t.$t("依据课程资料作答")),
                3
                /* TEXT, CLASS */
              ),
              e.createElementVNode(
                "p",
                er,
                e.toDisplayString(q.value.text),
                1
                /* TEXT */
              ),
              q.value.sources.length ? (e.openBlock(), e.createElementBlock("ol", tr, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(q.value.sources, (m, Q) => (e.openBlock(), e.createElementBlock("li", { key: Q }, [
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(m.title),
                      1
                      /* TEXT */
                    ),
                    p[21] || (p[21] = e.createElementVNode(
                      "br",
                      null,
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(m.snippet),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0)
            ])) : e.createCommentVNode("v-if", !0)
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : k.value === "quiz" ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createCommentVNode(" 智能出题 "),
          e.createElementVNode("section", lr, [
            e.createElementVNode("h3", null, [
              p[22] || (p[22] = e.createElementVNode(
                "i",
                { class: "ri-file-list-3-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("智能出题")),
                1
                /* TEXT */
              ),
              W.value ? (e.openBlock(), e.createElementBlock(
                "small",
                nr,
                e.toDisplayString(W.value.name),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              or,
              e.toDisplayString(t.$t("只从课程资料出题，每题附一句原文出处并逐字核对；对不上原文、格式不对的题直接丢掉。出完请逐题审阅再用。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", sr, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(h), (m) => (e.openBlock(), e.createElementBlock("label", {
                  key: m,
                  class: "ss-field"
                }, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s(m)),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (Q) => P[m] = Q,
                    type: "number",
                    min: "0",
                    max: "20"
                  }, null, 8, ar), [
                    [
                      e.vModelText,
                      P[m],
                      void 0,
                      { number: !0 }
                    ]
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              )),
              e.createElementVNode("label", ir, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("侧重（可选）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": p[5] || (p[5] = (m) => F.value = m),
                  placeholder: t.$t("如：基尔霍夫定律、有效值")
                }, null, 8, rr), [
                  [e.vModelText, F.value]
                ])
              ])
            ]),
            e.createElementVNode("div", cr, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !W.value || !!f.value || !c.value,
                "data-test": "ca-quiz-gen",
                onClick: Ee
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(f.value === "quiz" ? "ri-loader-4-line spin" : "ri-questionnaire-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("出题")),
                  1
                  /* TEXT */
                )
              ], 8, dr),
              W.value ? c.value ? f.value === "quiz" ? (e.openBlock(), e.createElementBlock(
                "span",
                pr,
                e.toDisplayString(t.$t("正在出题，通常 30～90 秒…")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "span",
                mr,
                e.toDisplayString(t.$t("这门课还没有已构建的资料")),
                1
                /* TEXT */
              )) : (e.openBlock(), e.createElementBlock(
                "span",
                ur,
                e.toDisplayString(t.$t("先选一门课")),
                1
                /* TEXT */
              ))
            ]),
            y.value ? (e.openBlock(), e.createElementBlock(
              "p",
              {
                key: 0,
                class: e.normalizeClass(["ss-note", y.value.dropped ? "warn" : "ok"])
              },
              [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(y.value.dropped ? "ri-alert-line" : "ri-checkbox-circle-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("新出 {a} 道，丢弃 {b} 道", { a: y.value.made, b: y.value.dropped })),
                  1
                  /* TEXT */
                ),
                y.value.reasons.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(t.$t("：{p0}", { p0: y.value.reasons.slice(0, 3).join("；") })),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ],
              2
              /* CLASS */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("section", vr, [
            e.createElementVNode("h3", null, [
              p[23] || (p[23] = e.createElementVNode(
                "i",
                { class: "ri-database-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("题库")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "span",
                yr,
                e.toDisplayString($.value.length),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", kr, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: !$.value.length,
                onClick: $e
              }, e.toDisplayString(i.value ? t.$t("取消全选") : t.$t("全选")), 9, gr),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: !o.value.length,
                onClick: fe
              }, [
                p[24] || (p[24] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("导出试卷与答案（{n} 题）", { n: o.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, Nr),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: !o.value.length,
                onClick: Se
              }, [
                p[25] || (p[25] = e.createElementVNode(
                  "i",
                  { class: "ri-checkbox-multiple-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("用这些题建批改任务")),
                  1
                  /* TEXT */
                )
              ], 8, Vr),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost danger",
                disabled: !o.value.length,
                onClick: he
              }, e.toDisplayString(U.value === "bank" ? t.$t("确认删除") : t.$t("删除所选")), 9, Er)
            ]),
            e.createElementVNode("ol", $r, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList($.value, (m) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: m.id,
                    class: e.normalizeClass({ reviewed: m.reviewed })
                  },
                  [
                    e.createElementVNode("label", br, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": p[6] || (p[6] = (Q) => o.value = Q),
                        type: "checkbox",
                        value: m.id
                      }, null, 8, hr), [
                        [e.vModelCheckbox, o.value]
                      ])
                    ]),
                    e.createElementVNode("div", fr, [
                      e.createElementVNode("p", null, [
                        e.createElementVNode(
                          "span",
                          Sr,
                          e.toDisplayString(s(m.type)),
                          1
                          /* TEXT */
                        ),
                        p[26] || (p[26] = e.createTextVNode()),
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(m.stem),
                          1
                          /* TEXT */
                        ),
                        p[27] || (p[27] = e.createTextVNode()),
                        e.createElementVNode(
                          "small",
                          Dr,
                          e.toDisplayString(t.$t("{n} 分", { n: m.score })),
                          1
                          /* TEXT */
                        )
                      ]),
                      m.options.length ? (e.openBlock(), e.createElementBlock("ol", _r, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(m.options, (Q, ce) => (e.openBlock(), e.createElementBlock(
                            "li",
                            {
                              key: ce,
                              class: e.normalizeClass({ right: m.answer.includes("ABCDEFGH"[ce]) })
                            },
                            e.toDisplayString(Q),
                            3
                            /* TEXT, CLASS */
                          ))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode("p", Br, [
                        e.createTextVNode(
                          e.toDisplayString(t.$t("答案：{p0}", { p0: T(m) })),
                          1
                          /* TEXT */
                        ),
                        m.points.length ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createTextVNode(
                              " · " + e.toDisplayString(t.$t("要点：{p0}", { p0: m.points.join("；") })),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("p", wr, [
                        p[28] || (p[28] = e.createElementVNode(
                          "i",
                          { class: "ri-double-quotes-l" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(m.sourceQuote) + " ",
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "small",
                          null,
                          "— " + e.toDisplayString(m.sourceTitle),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("label", Cr, [
                      e.createElementVNode("input", {
                        type: "checkbox",
                        checked: m.reviewed,
                        onChange: (Q) => be(m.id, Q.target.checked)
                      }, null, 40, Tr),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("已审阅")),
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
              )),
              $.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "li",
                Lr,
                e.toDisplayString(W.value ? t.$t("这门课还没有题目") : t.$t("先选一门课")),
                1
                /* TEXT */
              ))
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 2 },
        [
          e.createCommentVNode(" 作业批改 "),
          e.createElementVNode("div", Ar, [
            e.createVNode(Ve, {
              title: t.$t("作业批改"),
              metas: X,
              runtime: x.value,
              "current-key": ie.value,
              onJump: De
            }, null, 8, ["title", "runtime", "current-key"]),
            e.createElementVNode("div", Fr, [
              e.createVNode(H, {
                "step-key": "gr-key",
                index: 0,
                title: X[0].title,
                hint: X[0].hint,
                runtime: x.value["gr-key"],
                "is-current": ie.value === "gr-key"
              }, {
                default: e.withCtx(() => [
                  e.createElementVNode("div", Mr, [
                    e.createElementVNode("label", zr, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("批改任务")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "select",
                        {
                          "onUpdate:modelValue": p[7] || (p[7] = (m) => N.value = m),
                          class: "ca-sel"
                        },
                        [
                          e.createElementVNode(
                            "option",
                            qr,
                            e.toDisplayString(t.$t("— 新建 —")),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(d.value, (m) => (e.openBlock(), e.createElementBlock("option", {
                              key: m.id,
                              value: m.id
                            }, e.toDisplayString(t.$t("{p0}（{p1}）", { p0: m.title, p1: m.students })), 9, Or))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ],
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelSelect, N.value]
                      ])
                    ])
                  ]),
                  N.value ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                    "form",
                    {
                      key: 0,
                      class: "ca-inline-form",
                      onSubmit: p[10] || (p[10] = e.withModifiers((m) => ke(), ["prevent"]))
                    },
                    [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": p[8] || (p[8] = (m) => D.value = m),
                        class: "ca-input",
                        placeholder: t.$t("作业名称，如：第一章作业")
                      }, null, 8, Ur), [
                        [e.vModelText, D.value]
                      ]),
                      e.createElementVNode("button", {
                        type: "submit",
                        class: "ss-btn primary sm",
                        disabled: !W.value || !!f.value,
                        "data-test": "ca-grade-key"
                      }, [
                        p[29] || (p[29] = e.createElementVNode(
                          "i",
                          { class: "ri-file-excel-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("导入标准答案表")),
                          1
                          /* TEXT */
                        )
                      ], 8, Ir),
                      ae.value ? (e.openBlock(), e.createElementBlock("button", {
                        key: 0,
                        type: "button",
                        class: "ss-btn sm",
                        disabled: !!f.value,
                        "data-test": "ca-grade-key-demo",
                        onClick: p[9] || (p[9] = (m) => ke(ae.value.keyFile))
                      }, e.toDisplayString(t.$t("用示例标准答案")), 9, Pr)) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode(
                        "span",
                        Kr,
                        e.toDisplayString(t.$t("表头：题号、题型、标准答案、分值、评分要点；也可以在「智能出题」里选题直接建")),
                        1
                        /* TEXT */
                      )
                    ],
                    32
                    /* NEED_HYDRATION */
                  )),
                  v.value ? (e.openBlock(), e.createElementBlock("div", Wr, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(v.value.key, (m) => (e.openBlock(), e.createElementBlock(
                        "span",
                        {
                          key: m.no,
                          class: "ss-chip"
                        },
                        e.toDisplayString(t.$t("第{p0}题", { p0: m.no })) + " · " + e.toDisplayString(s(m.type)) + " · " + e.toDisplayString(t.$t("{n} 分", { n: m.score })),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime", "is-current"]),
              e.createVNode(H, {
                "step-key": "gr-ans",
                index: 1,
                title: X[1].title,
                hint: X[1].hint,
                runtime: x.value["gr-ans"],
                "is-current": ie.value === "gr-ans"
              }, {
                default: e.withCtx(() => [
                  e.createElementVNode("div", Rr, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary sm",
                      disabled: !v.value || !!f.value,
                      "data-test": "ca-grade-answers",
                      onClick: p[11] || (p[11] = (m) => ge())
                    }, [
                      p[30] || (p[30] = e.createElementVNode(
                        "i",
                        { class: "ri-file-excel-2-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(v.value?.rows.length ? t.$t("重新导入作答") : t.$t("导入学生作答表")),
                        1
                        /* TEXT */
                      )
                    ], 8, Qr),
                    ae.value && v.value ? (e.openBlock(), e.createElementBlock("button", {
                      key: 0,
                      type: "button",
                      class: "ss-btn sm",
                      disabled: !!f.value,
                      "data-test": "ca-grade-answers-demo",
                      onClick: p[12] || (p[12] = (m) => ge(ae.value.answersFile))
                    }, e.toDisplayString(t.$t("用示例学生作答")), 9, jr)) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode(
                      "span",
                      Gr,
                      e.toDisplayString(t.$t("表头：学号、姓名，每题一列（列名带题号，如「第1题」）。客观题导入即自动判分")),
                      1
                      /* TEXT */
                    )
                  ]),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(z.value, (m) => (e.openBlock(), e.createElementBlock("p", {
                      key: m,
                      class: "ss-note warn"
                    }, [
                      p[31] || (p[31] = e.createElementVNode(
                        "i",
                        { class: "ri-alert-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(m),
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
              e.createVNode(H, {
                "step-key": "gr-auto",
                index: 2,
                title: X[2].title,
                hint: X[2].hint,
                runtime: x.value["gr-auto"],
                "is-current": ie.value === "gr-auto",
                retry: f.value ? void 0 : Ne
              }, {
                default: e.withCtx(() => [
                  e.createElementVNode("div", Jr, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary sm",
                      disabled: !v.value?.rows.length || !!f.value || !Z.value,
                      "data-test": "ca-grade-suggest",
                      onClick: Ne
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(f.value === "suggest" ? "ri-loader-4-line spin" : "ri-robot-2-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("主观题给建议分")),
                        1
                        /* TEXT */
                      )
                    ], 8, Hr),
                    e.createElementVNode(
                      "span",
                      Yr,
                      e.toDisplayString(Z.value ? t.$t("同一题的作答匿名编号后成批交给模型，按评分要点给分；建议分要你确认") : t.$t("这份作业没有主观题")),
                      1
                      /* TEXT */
                    )
                  ]),
                  E.value ? (e.openBlock(), e.createElementBlock("p", Xr, [
                    p[32] || (p[32] = e.createElementVNode(
                      "i",
                      { class: "ri-loader-4-line spin" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(E.value),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime", "is-current", "retry"]),
              e.createVNode(H, {
                "step-key": "gr-confirm",
                index: 3,
                title: X[3].title,
                hint: X[3].hint,
                runtime: x.value["gr-confirm"],
                "is-current": ie.value === "gr-confirm"
              }, {
                default: e.withCtx(() => [
                  v.value?.rows.length ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("div", Zr, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn primary sm",
                          disabled: !!f.value || !me.value,
                          "data-test": "ca-grade-confirm",
                          onClick: b
                        }, e.toDisplayString(t.$t("确认全部已有分数的学生（{n}）", { n: me.value })), 9, xr),
                        e.createElementVNode(
                          "span",
                          ec,
                          e.toDisplayString(t.$t("改分直接在格子里改，改过的记为教师评分")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", tc, [
                        e.createElementVNode("table", lc, [
                          e.createElementVNode("thead", null, [
                            e.createElementVNode("tr", null, [
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("学生")),
                                1
                                /* TEXT */
                              ),
                              (e.openBlock(!0), e.createElementBlock(
                                e.Fragment,
                                null,
                                e.renderList(v.value.key, (m) => (e.openBlock(), e.createElementBlock("th", {
                                  key: m.no,
                                  class: "num"
                                }, [
                                  e.createTextVNode(
                                    e.toDisplayString(t.$t("第{p0}题", { p0: m.no })),
                                    1
                                    /* TEXT */
                                  ),
                                  p[33] || (p[33] = e.createElementVNode(
                                    "br",
                                    null,
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  e.createElementVNode(
                                    "small",
                                    null,
                                    "/" + e.toDisplayString(m.score),
                                    1
                                    /* TEXT */
                                  )
                                ]))),
                                128
                                /* KEYED_FRAGMENT */
                              )),
                              e.createElementVNode(
                                "th",
                                nc,
                                e.toDisplayString(t.$t("总分")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("状态")),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          e.createElementVNode("tbody", null, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(v.value.rows, (m) => (e.openBlock(), e.createElementBlock("tr", {
                                key: m.studentId
                              }, [
                                e.createElementVNode("td", null, [
                                  e.createTextVNode(
                                    e.toDisplayString(m.name || m.studentId),
                                    1
                                    /* TEXT */
                                  ),
                                  p[34] || (p[34] = e.createElementVNode(
                                    "br",
                                    null,
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  e.createElementVNode(
                                    "small",
                                    oc,
                                    e.toDisplayString(m.studentId),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                (e.openBlock(!0), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(m.items, (Q) => (e.openBlock(), e.createElementBlock("td", {
                                    key: Q.no,
                                    class: e.normalizeClass(["num ca-cell", Q.by]),
                                    title: `${Q.response}
${Q.reason}`
                                  }, [
                                    g(Q.no) ? (e.openBlock(), e.createElementBlock("input", {
                                      key: 0,
                                      class: "ca-score",
                                      type: "number",
                                      min: "0",
                                      max: Q.max,
                                      step: "0.5",
                                      value: Q.final ?? "",
                                      placeholder: t.$t("待评"),
                                      onChange: (ce) => a(m.studentId, Q.no, ce.target.value)
                                    }, null, 40, ac)) : (e.openBlock(), e.createElementBlock(
                                      "span",
                                      ic,
                                      e.toDisplayString(Q.final),
                                      1
                                      /* TEXT */
                                    ))
                                  ], 10, sc))),
                                  128
                                  /* KEYED_FRAGMENT */
                                )),
                                e.createElementVNode("td", rc, [
                                  e.createElementVNode(
                                    "b",
                                    null,
                                    e.toDisplayString(m.total),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                e.createElementVNode("td", null, [
                                  e.createElementVNode(
                                    "span",
                                    {
                                      class: e.normalizeClass(["ss-chip", m.confirmed ? "ok" : "warn"])
                                    },
                                    e.toDisplayString(m.confirmed ? t.$t("已确认") : t.$t("待确认")),
                                    3
                                    /* TEXT, CLASS */
                                  )
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
                  )) : (e.openBlock(), e.createElementBlock(
                    "p",
                    cc,
                    e.toDisplayString(t.$t("先导入学生作答")),
                    1
                    /* TEXT */
                  ))
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime", "is-current"]),
              e.createVNode(H, {
                "step-key": "gr-export",
                index: 4,
                title: X[4].title,
                hint: X[4].hint,
                runtime: x.value["gr-export"],
                "is-current": ie.value === "gr-export"
              }, {
                default: e.withCtx(() => [
                  e.createElementVNode("div", dc, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary sm",
                      disabled: !v.value?.rows.length || !!f.value || se.value > 0,
                      "data-test": "ca-grade-export",
                      onClick: r
                    }, [
                      p[35] || (p[35] = e.createElementVNode(
                        "i",
                        { class: "ri-download-2-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("导出成绩与评分说明")),
                        1
                        /* TEXT */
                      )
                    ], 8, uc),
                    se.value ? (e.openBlock(), e.createElementBlock(
                      "span",
                      mc,
                      e.toDisplayString(t.$t("还有 {n} 名学生没确认", { n: se.value })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  v.value?.exportPath ? (e.openBlock(), e.createElementBlock("p", pc, [
                    p[36] || (p[36] = e.createElementVNode(
                      "i",
                      { class: "ri-file-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "code",
                      null,
                      e.toDisplayString(v.value.exportPath),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "button",
                      {
                        type: "button",
                        class: "ss-link",
                        onClick: p[13] || (p[13] = (m) => e.unref(te)(v.value.exportPath, !0))
                      },
                      e.toDisplayString(t.$t("打开所在文件夹")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime", "is-current"])
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]));
  }
}), yc = /* @__PURE__ */ le(vc, [["__scopeId", "data-v-5ed84881"]]), kc = { class: "ca-research" }, gc = { class: "ss-panel" }, Nc = { class: "ss-muted" }, Vc = { class: "ss-actions" }, Ec = ["disabled"], $c = ["disabled"], bc = ["disabled"], hc = {
  key: 0,
  class: "ss-muted"
}, fc = { class: "ss-kpis" }, Sc = { class: "ss-kpi accent" }, Dc = { class: "ss-kpi" }, _c = { class: "ss-kpi" }, Bc = { class: "ss-kpi" }, wc = { class: "ca-split" }, Cc = { class: "ca-chart" }, Tc = { class: "ca-chart" }, Lc = { class: "ss-table-wrap" }, Ac = { class: "ss-table" }, Fc = { class: "num" }, Mc = { class: "num" }, zc = { class: "num" }, qc = { class: "num" }, Oc = { class: "ss-panel" }, Uc = { class: "ss-muted" }, Ic = { class: "ss-actions" }, Pc = ["disabled"], Kc = ["disabled"], Wc = {
  key: 1,
  class: "ss-muted"
}, Rc = { class: "ss-muted" }, Qc = {
  key: 0,
  class: "ss-chip warn"
}, jc = ["onClick"], Gc = ["onClick"], Jc = { class: "ca-guide__grid" }, Hc = {
  key: 0,
  class: "ss-chip bad"
}, Yc = {
  key: 0,
  class: "empty"
}, Xc = /* @__PURE__ */ e.defineComponent({
  __name: "ResearchTab",
  setup(I) {
    const w = ne.useNotificationStore(), B = ["deadlines", "eligibility", "materials", "funding", "contacts"], h = e.ref(""), k = e.ref(""), f = e.ref([]), U = e.ref(""), C = e.computed(() => R.value?.research || null), V = e.computed(() => C.value?.stats || null), L = e.computed(() => C.value?.guides || []), q = e.computed(() => ue.value.scope === "guide" ? ue.value.message : ""), P = (n) => ({ deadlines: l.t("截止时间"), eligibility: l.t("申报条件"), materials: l.t("材料清单"), funding: l.t("资助额度"), contacts: l.t("联系方式") })[n], F = (n) => Math.max(1, ...n.map((c) => c.count)), y = (n) => n.split(/[\\/]/).pop() || n, $ = e.computed(() => Math.max(1, ...V.value?.matrix.cells.flat() || [1])), o = (n) => n ? { background: `color-mix(in srgb, var(--ca-oxblood) ${Math.round(n / $.value * 28)}%, transparent)` } : {};
    async function N(n, c) {
      h.value = n;
      try {
        const d = await c();
        return await J(), d;
      } catch (d) {
        return w.error(K.errorMessage(d)), null;
      } finally {
        h.value = "";
      }
    }
    async function v(n) {
      const c = n ? [n] : await _("files.pick", { kind: "excel", multi: !1, title: l.t("选择成果登记表") }).catch(() => []);
      if (!c[0]) return;
      const d = await N("import", () => _("research.import", { path: c[0] }));
      d && (f.value = d.problems);
    }
    async function D() {
      const n = await N("demo", () => _("research.demo"));
      n && (U.value = n.guide, await v(n.outputs));
    }
    async function z() {
      const n = await N("export", () => _("research.export"));
      n && te(n, !0);
    }
    async function M(n) {
      const c = n ? [n] : await _("files.pick", { kind: "doc", multi: !1, title: l.t("选择申报指南") }).catch(() => []);
      if (!c[0]) return;
      await N("guide", () => _("guide.analyze", { path: c[0] })) && w.success(l.t("解读完成"));
    }
    async function O(n) {
      const c = await N("gexport", () => _("guide.export", { id: n }));
      c && te(c, !0);
    }
    async function W(n) {
      if (k.value !== n) {
        k.value = n, setTimeout(() => {
          k.value === n && (k.value = "");
        }, 3e3);
        return;
      }
      k.value = "", await N("gremove", () => _("guide.remove", { id: n }));
    }
    return (n, c) => (e.openBlock(), e.createElementBlock("div", kc, [
      e.createElementVNode("section", gc, [
        e.createElementVNode("h3", null, [
          c[3] || (c[3] = e.createElementVNode(
            "i",
            { class: "ri-bar-chart-grouped-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("科研成果统计")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          Nc,
          e.toDisplayString(n.$t("导入科研处的成果登记表（论文、专利、纵向 / 横向项目、获奖、著作），按学院、类型、年度、级别统计数量与经费。数字全部由规则汇总，不经模型。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Vc, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary sm",
            disabled: !!h.value,
            "data-test": "ca-research-import",
            onClick: c[0] || (c[0] = (d) => v())
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(h.value === "import" ? "ri-loader-4-line spin" : "ri-file-excel-2-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(C.value?.outputs ? n.$t("重新导入成果表") : n.$t("导入成果表")),
              1
              /* TEXT */
            )
          ], 8, Ec),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: !!h.value,
            "data-test": "ca-research-demo",
            onClick: D
          }, [
            c[4] || (c[4] = e.createElementVNode(
              "i",
              { class: "ri-file-download-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("载入示例")),
              1
              /* TEXT */
            )
          ], 8, $c),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: !C.value?.outputs,
            onClick: z
          }, [
            c[5] || (c[5] = e.createElementVNode(
              "i",
              { class: "ri-download-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("导出统计表")),
              1
              /* TEXT */
            )
          ], 8, bc),
          C.value?.outputsFile ? (e.openBlock(), e.createElementBlock("span", hc, [
            e.createTextVNode(
              e.toDisplayString(y(C.value.outputsFile)),
              1
              /* TEXT */
            ),
            C.value.skipped ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createTextVNode(
                  " · " + e.toDisplayString(n.$t("跳过 {n} 行空行", { n: C.value.skipped })),
                  1
                  /* TEXT */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ])) : e.createCommentVNode("v-if", !0)
        ]),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(f.value, (d) => (e.openBlock(), e.createElementBlock("p", {
            key: d,
            class: "ss-note"
          }, [
            c[6] || (c[6] = e.createElementVNode(
              "i",
              { class: "ri-information-line" },
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
        V.value ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 0 },
          [
            e.createElementVNode("div", fc, [
              e.createElementVNode("div", Sc, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(n.$t("成果总数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(V.value.total),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", Dc, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(n.$t("经费合计")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(V.value.funding),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", _c, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(n.$t("覆盖学院")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(V.value.byCollege.length),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", Bc, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(n.$t("成果类型")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(V.value.byType.length),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("div", wc, [
              e.createElementVNode("div", Cc, [
                e.createElementVNode(
                  "h4",
                  null,
                  e.toDisplayString(n.$t("年度分布")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(V.value.byYear, (d) => (e.openBlock(), e.createElementBlock("div", {
                    key: d.key,
                    class: "ca-bar-row"
                  }, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(d.key),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "i",
                      {
                        style: e.normalizeStyle({ width: `${d.count / F(V.value.byYear) * 100}%` })
                      },
                      null,
                      4
                      /* STYLE */
                    ),
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(d.count),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              e.createElementVNode("div", Tc, [
                e.createElementVNode(
                  "h4",
                  null,
                  e.toDisplayString(n.$t("类型分布")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(V.value.byType, (d) => (e.openBlock(), e.createElementBlock("div", {
                    key: d.key,
                    class: "ca-bar-row"
                  }, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(d.key),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "i",
                      {
                        class: "gold",
                        style: e.normalizeStyle({ width: `${d.count / F(V.value.byType) * 100}%` })
                      },
                      null,
                      4
                      /* STYLE */
                    ),
                    e.createElementVNode(
                      "b",
                      null,
                      e.toDisplayString(d.count),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            e.createElementVNode(
              "h4",
              null,
              e.toDisplayString(n.$t("学院 × 类型")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Lc, [
              e.createElementVNode("table", Ac, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("学院")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(V.value.matrix.cols, (d) => (e.openBlock(), e.createElementBlock(
                        "th",
                        {
                          key: d,
                          class: "num"
                        },
                        e.toDisplayString(d),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode(
                      "th",
                      Fc,
                      e.toDisplayString(n.$t("合计")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Mc,
                      e.toDisplayString(n.$t("经费")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(V.value.matrix.rows, (d, i) => (e.openBlock(), e.createElementBlock("tr", { key: d }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(d),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(V.value.matrix.cells[i], (E, s) => (e.openBlock(), e.createElementBlock(
                          "td",
                          {
                            key: s,
                            class: "num",
                            style: e.normalizeStyle(o(E))
                          },
                          e.toDisplayString(E || ""),
                          5
                          /* TEXT, STYLE */
                        ))),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      e.createElementVNode("td", zc, [
                        e.createElementVNode(
                          "b",
                          null,
                          e.toDisplayString(V.value.byCollege.find((E) => E.key === d)?.count),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        qc,
                        e.toDisplayString(V.value.byCollege.find((E) => E.key === d)?.funding),
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
      ]),
      e.createElementVNode("section", Oc, [
        e.createElementVNode("h3", null, [
          c[7] || (c[7] = e.createElementVNode(
            "i",
            { class: "ri-file-search-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("申报指南解读")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "p",
          Uc,
          e.toDisplayString(n.$t("上传项目申报指南（PDF / Word），抽出截止时间、申报条件、材料清单、资助额度和联系方式。每条都附原文，并逐条回原文核对，原文里找不到的条目不列出。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", Ic, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary sm",
            disabled: !!h.value,
            "data-test": "ca-guide-pick",
            onClick: c[1] || (c[1] = (d) => M())
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(h.value === "guide" ? "ri-loader-4-line spin" : "ri-upload-2-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(n.$t("上传申报指南")),
              1
              /* TEXT */
            )
          ], 8, Pc),
          U.value ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-btn sm",
            disabled: !!h.value,
            "data-test": "ca-guide-demo",
            onClick: c[2] || (c[2] = (d) => M(U.value))
          }, e.toDisplayString(n.$t("解读示例指南")), 9, Kc)) : e.createCommentVNode("v-if", !0),
          q.value ? (e.openBlock(), e.createElementBlock("span", Wc, [
            c[8] || (c[8] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(q.value),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ]),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(L.value, (d) => (e.openBlock(), e.createElementBlock("article", {
            key: d.id,
            class: "ca-guide",
            "data-test": "ca-guide"
          }, [
            e.createElementVNode("header", null, [
              e.createElementVNode(
                "b",
                null,
                e.toDisplayString(d.title),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                Rc,
                e.toDisplayString(d.fileName) + " · " + e.toDisplayString(e.unref(K.fmtDateTime)(d.at)),
                1
                /* TEXT */
              ),
              d.dropped ? (e.openBlock(), e.createElementBlock(
                "span",
                Qc,
                e.toDisplayString(n.$t("{n} 条在原文里找不到，已丢弃", { n: d.dropped })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0),
              c[10] || (c[10] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                onClick: (i) => O(d.id)
              }, [
                c[9] || (c[9] = e.createElementVNode(
                  "i",
                  { class: "ri-download-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("导出")),
                  1
                  /* TEXT */
                )
              ], 8, jc),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost danger",
                onClick: (i) => W(d.id)
              }, e.toDisplayString(k.value === d.id ? n.$t("确认删除") : n.$t("删除")), 9, Gc)
            ]),
            e.createElementVNode("div", Jc, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(B, (i) => e.createElementVNode("div", {
                  key: i,
                  class: "ca-guide__sec"
                }, [
                  e.createElementVNode("h4", null, [
                    e.createTextVNode(
                      e.toDisplayString(P(i)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "em",
                      null,
                      e.toDisplayString(d[i].length),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("ul", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(d[i], (E, s) => (e.openBlock(), e.createElementBlock("li", { key: s }, [
                        e.createElementVNode("p", null, [
                          E.date ? (e.openBlock(), e.createElementBlock(
                            "span",
                            Hc,
                            e.toDisplayString(E.date),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0),
                          e.createTextVNode(
                            " " + e.toDisplayString(E.text),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "blockquote",
                          null,
                          e.toDisplayString(E.quote),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    d[i].length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                      "li",
                      Yc,
                      e.toDisplayString(n.$t("指南里没有写")),
                      1
                      /* TEXT */
                    ))
                  ])
                ])),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]));
  }
}), Zc = /* @__PURE__ */ le(Xc, [["__scopeId", "data-v-54ecb45c"]]), xc = { class: "ca-gov" }, ed = {
  class: "ca-subnav",
  role: "tablist"
}, td = ["aria-selected"], ld = ["aria-selected"], nd = {
  key: 0,
  class: "ss-module"
}, od = { class: "ss-steps" }, sd = { class: "ss-actions" }, ad = { class: "ss-field inline" }, id = { value: "" }, rd = ["value"], cd = { class: "ss-grid" }, dd = { class: "ss-field" }, ud = ["value"], md = { class: "ss-field" }, pd = ["placeholder"], vd = { class: "ss-field" }, yd = ["placeholder"], kd = { class: "ss-field" }, gd = { class: "ss-field" }, Nd = ["placeholder"], Vd = { class: "ss-field" }, Ed = ["placeholder"], $d = { class: "ss-field" }, bd = ["placeholder"], hd = { class: "ss-field" }, fd = { class: "ss-actions" }, Sd = ["disabled"], Dd = { class: "ss-muted" }, _d = {
  key: 0,
  class: "ss-note warn",
  "data-test": "ca-doc-unverified"
}, Bd = {
  key: 1,
  class: "ca-check"
}, wd = {
  key: 2,
  class: "ss-note ok"
}, Cd = { class: "ca-paper" }, Td = { class: "ca-paper__head" }, Ld = {
  key: 0,
  class: "ca-paper__no"
}, Ad = { class: "ca-paper__title" }, Fd = {
  key: 1,
  class: "ca-paper__to"
}, Md = { class: "ss-actions" }, zd = ["disabled"], qd = {
  key: 1,
  class: "ss-muted"
}, Od = { class: "ss-actions" }, Ud = ["disabled"], Id = { class: "ss-muted" }, Pd = {
  key: 0,
  class: "ss-file-out"
}, Kd = { class: "ss-panel" }, Wd = { class: "ss-muted" }, Rd = { class: "ss-actions" }, Qd = { class: "ca-filter" }, jd = ["onClick"], Gd = { class: "ca-check" }, Jd = ["disabled"], Hd = ["disabled"], Yd = { class: "ss-kpis" }, Xd = { class: "ss-kpi accent" }, Zd = { class: "ss-kpi" }, xd = { class: "ss-kpi" }, eu = { class: "ss-kpi" }, tu = { class: "ss-panel" }, lu = {
  class: "ca-pre",
  "data-test": "ca-hot-summary"
}, nu = { class: "ca-split" }, ou = { class: "ss-panel" }, su = { class: "ss-table-wrap" }, au = { class: "ss-table" }, iu = { class: "num" }, ru = { class: "num" }, cu = { class: "num" }, du = { class: "num" }, uu = { class: "num" }, mu = { class: "ss-panel" }, pu = {
  key: 0,
  class: "ss-table-wrap"
}, vu = { class: "ss-table" }, yu = { class: "num" }, ku = { class: "num" }, gu = { class: "num" }, Nu = { class: "num" }, Vu = { class: "num" }, Eu = { class: "num" }, $u = { class: "num" }, bu = { class: "num" }, hu = {
  key: 1,
  class: "ss-muted"
}, fu = { class: "ss-panel" }, Su = { class: "ss-muted" }, Du = {
  key: 0,
  class: "ca-gaps"
}, _u = {
  key: 1,
  class: "ss-muted"
}, Bu = {
  key: 2,
  class: "ca-kw"
}, wu = /* @__PURE__ */ e.defineComponent({
  __name: "GovTab",
  setup(I) {
    const w = ne.useNotificationStore(), B = de.CA_DOC_KINDS, h = e.ref("doc"), k = e.ref(""), f = e.ref({}), U = e.ref(""), C = () => {
      const s = /* @__PURE__ */ new Date();
      return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}-${String(s.getDate()).padStart(2, "0")}`;
    }, V = e.reactive({ kind: "notice", issuer: "", docNo: "", date: C(), title: "", recipients: "", points: "", attachments: "" }), L = e.ref(""), q = e.ref(7), P = e.ref(!0), F = e.ref(null), y = e.ref(!1), $ = e.computed(() => R.value?.officialDocs || []), o = e.computed(() => $.value.find((s) => s.id === U.value) || null), N = (s) => ({ notice: l.t("通知"), request: l.t("请示"), report: l.t("报告"), letter: l.t("函"), minutes: l.t("会议纪要") })[s];
    e.watch(() => o.value ? `${o.value.id}:${o.value.updatedAt}` : "", (s, T) => {
      const g = o.value;
      if ((!T || s.split(":")[0] !== T.split(":")[0]) && (y.value = !1), !g) {
        L.value = "";
        return;
      }
      Object.assign(V, { kind: g.kind, issuer: g.issuer, docNo: g.docNo, date: g.date, title: g.title, recipients: g.recipients, points: g.points, attachments: g.attachments }), L.value = g.body;
    }, { immediate: !0 });
    const v = [
      { key: "gd-input", title: l.t("填写要点"), hint: l.t("文种、发文机关、标题、主送机关和正文要点") },
      { key: "gd-draft", title: l.t("起草正文"), hint: l.t("按公文写法起草，只用要点里的事实") },
      { key: "gd-review", title: l.t("核对修改"), hint: l.t("要点里没有的数字会标出来，逐处核对后保存") },
      { key: "gd-export", title: l.t("导出 Word"), hint: l.t("按 GB/T 9704 版式") }
    ], D = e.computed(() => {
      const s = o.value, T = f.value;
      return {
        "gd-input": V.title.trim() && V.points.trim() ? { state: "done", summary: `${N(V.kind)} · ${V.title}` } : { state: "todo" },
        "gd-draft": k.value === "draft" ? { state: "running", kind: "llm", progressAt: Date.now() } : T.draft ? { state: "failed", error: T.draft } : s ? { state: "done", summary: l.t("{n} 字", { n: s.body.length }) } : { state: "todo" },
        "gd-review": s && L.value === s.body && (!s.unverified.length || y.value) ? { state: "done", summary: l.t("数字已核对") } : { state: "todo" },
        "gd-export": T.export ? { state: "failed", error: T.export } : s?.docxPath && L.value === s.body ? { state: "done", summary: s.docxPath } : { state: "todo" }
      };
    }), z = e.computed(() => v.find((s) => D.value[s.key].state !== "done")?.key || "gd-export"), M = (s) => {
      K.scrollToStep(s);
    };
    async function O(s, T) {
      k.value = s, f.value = { ...f.value, [s]: "" };
      try {
        const g = await T();
        return await J(), g;
      } catch (g) {
        return f.value = { ...f.value, [s]: K.errorMessage(g) }, w.error(K.errorMessage(g)), null;
      } finally {
        k.value = "";
      }
    }
    async function W() {
      const s = await O("draft", () => _("doc.draft", { input: { id: U.value || void 0, ...V } }));
      s && (U.value = s.id, L.value = s.body, K.scrollToStep("gd-review"));
    }
    async function n() {
      await O("save", () => _("doc.save", { id: U.value, patch: { body: L.value, ...V } }));
    }
    async function c() {
      await O("export", () => _("doc.export", { id: U.value })) && w.success(l.t("已导出 Word"));
    }
    async function d() {
      const s = await O("hot", () => _("hotspot.report", { days: q.value, useModel: P.value }));
      s && (F.value = s);
    }
    async function i() {
      const s = await O("hexport", () => _("hotspot.export", { report: F.value }));
      s && te(s, !0);
    }
    function E(s, T) {
      if (!T) return l.t("上期 {n}", { n: T });
      const g = Math.round((s - T) / T * 100);
      return g >= 0 ? l.t("比上期 +{n}%", { n: g }) : l.t("比上期 {n}%", { n: g });
    }
    return (s, T) => (e.openBlock(), e.createElementBlock("div", xc, [
      e.createElementVNode("nav", ed, [
        e.createElementVNode("button", {
          type: "button",
          role: "tab",
          "aria-selected": h.value === "doc",
          class: e.normalizeClass({ on: h.value === "doc" }),
          "data-test": "ca-gov-doc",
          onClick: T[0] || (T[0] = (g) => h.value = "doc")
        }, [
          T[15] || (T[15] = e.createElementVNode(
            "i",
            { class: "ri-quill-pen-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(s.$t("公文助手")),
            1
            /* TEXT */
          )
        ], 10, td),
        e.createElementVNode("button", {
          type: "button",
          role: "tab",
          "aria-selected": h.value === "hot",
          class: e.normalizeClass({ on: h.value === "hot" }),
          "data-test": "ca-gov-hot",
          onClick: T[1] || (T[1] = (g) => h.value = "hot")
        }, [
          T[16] || (T[16] = e.createElementVNode(
            "i",
            { class: "ri-fire-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(s.$t("诉求热点分析")),
            1
            /* TEXT */
          )
        ], 10, ld)
      ]),
      e.createCommentVNode(" 公文助手 "),
      h.value === "doc" ? (e.openBlock(), e.createElementBlock("div", nd, [
        e.createVNode(Ve, {
          title: s.$t("公文助手"),
          metas: v,
          runtime: D.value,
          "current-key": z.value,
          onJump: M
        }, null, 8, ["title", "runtime", "current-key"]),
        e.createElementVNode("div", od, [
          e.createVNode(H, {
            "step-key": "gd-input",
            index: 0,
            title: v[0].title,
            hint: v[0].hint,
            runtime: D.value["gd-input"],
            "is-current": z.value === "gd-input"
          }, {
            default: e.withCtx(() => [
              e.createElementVNode("div", sd, [
                e.createElementVNode("label", ad, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.$t("打开已有")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "select",
                    {
                      "onUpdate:modelValue": T[2] || (T[2] = (g) => U.value = g),
                      class: "ca-sel"
                    },
                    [
                      e.createElementVNode(
                        "option",
                        id,
                        e.toDisplayString(s.$t("— 新建 —")),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList($.value, (g) => (e.openBlock(), e.createElementBlock("option", {
                          key: g.id,
                          value: g.id
                        }, e.toDisplayString(N(g.kind)) + " · " + e.toDisplayString(g.title), 9, rd))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelSelect, U.value]
                  ])
                ])
              ]),
              e.createElementVNode("div", cd, [
                e.createElementVNode("label", dd, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.$t("文种")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "select",
                    {
                      "onUpdate:modelValue": T[3] || (T[3] = (g) => V.kind = g)
                    },
                    [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(B), (g) => (e.openBlock(), e.createElementBlock("option", {
                          key: g,
                          value: g
                        }, e.toDisplayString(N(g)), 9, ud))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ],
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelSelect, V.kind]
                  ])
                ]),
                e.createElementVNode("label", md, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.$t("发文机关")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": T[4] || (T[4] = (g) => V.issuer = g),
                    placeholder: e.unref(R)?.settings.schoolName || s.$t("如：某某学院党政办公室")
                  }, null, 8, pd), [
                    [e.vModelText, V.issuer]
                  ])
                ]),
                e.createElementVNode("label", vd, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.$t("发文字号")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": T[5] || (T[5] = (g) => V.docNo = g),
                    placeholder: s.$t("如：某院发〔2026〕12号")
                  }, null, 8, yd), [
                    [e.vModelText, V.docNo]
                  ])
                ]),
                e.createElementVNode("label", kd, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.$t("成文日期")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": T[6] || (T[6] = (g) => V.date = g),
                      type: "date"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, V.date]
                  ])
                ])
              ]),
              e.createElementVNode("label", gd, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(s.$t("标题")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": T[7] || (T[7] = (g) => V.title = g),
                  placeholder: s.$t("如：关于做好2026年秋季学期学业预警工作的通知"),
                  "data-test": "ca-doc-title"
                }, null, 8, Nd), [
                  [e.vModelText, V.title]
                ])
              ]),
              e.createElementVNode("label", Vd, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(s.$t("主送机关")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": T[8] || (T[8] = (g) => V.recipients = g),
                  placeholder: s.$t("如：各二级学院、各部门")
                }, null, 8, Ed), [
                  [e.vModelText, V.recipients]
                ])
              ]),
              e.createElementVNode("label", $d, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(s.$t("要点（正文只按这里写的事实、时间、数字起草）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("textarea", {
                  "onUpdate:modelValue": T[9] || (T[9] = (g) => V.points = g),
                  rows: "6",
                  "data-test": "ca-doc-points",
                  placeholder: s.$t(`每行一条，例如：
11月10日前各学院完成成绩录入
学工处11月15日发布预警名单
辅导员一周内完成面谈`)
                }, null, 8, bd), [
                  [e.vModelText, V.points]
                ])
              ]),
              e.createElementVNode("label", hd, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(s.$t("附件（每行一个）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "textarea",
                  {
                    "onUpdate:modelValue": T[10] || (T[10] = (g) => V.attachments = g),
                    rows: "2"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, V.attachments]
                ])
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["title", "hint", "runtime", "is-current"]),
          e.createVNode(H, {
            "step-key": "gd-draft",
            index: 1,
            title: v[1].title,
            hint: v[1].hint,
            runtime: D.value["gd-draft"],
            "is-current": z.value === "gd-draft",
            retry: k.value ? void 0 : W
          }, {
            default: e.withCtx(() => [
              e.createElementVNode("div", fd, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary",
                  disabled: !!k.value || !V.title.trim() || !V.points.trim(),
                  "data-test": "ca-doc-draft",
                  onClick: W
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(k.value === "draft" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createTextVNode(
                    e.toDisplayString(o.value ? s.$t("按要点重新起草") : s.$t("起草正文")),
                    1
                    /* TEXT */
                  )
                ], 8, Sd),
                e.createElementVNode(
                  "span",
                  Dd,
                  e.toDisplayString(s.$t("按党政机关公文写法起草，只用要点里的事实")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["title", "hint", "runtime", "is-current", "retry"]),
          e.createVNode(H, {
            "step-key": "gd-review",
            index: 2,
            title: v[2].title,
            hint: v[2].hint,
            runtime: D.value["gd-review"],
            "is-current": z.value === "gd-review"
          }, {
            default: e.withCtx(() => [
              o.value ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  o.value.unverified.length ? (e.openBlock(), e.createElementBlock("p", _d, [
                    T[17] || (T[17] = e.createElementVNode(
                      "i",
                      { class: "ri-alert-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("正文里这些数字在要点和标题里找不到，请核对：{p0}", { p0: o.value.unverified.join("、") })),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  o.value.unverified.length ? (e.openBlock(), e.createElementBlock("label", Bd, [
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": T[11] || (T[11] = (g) => y.value = g),
                        type: "checkbox"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelCheckbox, y.value]
                    ]),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("我已逐处核对上面标出的数字")),
                      1
                      /* TEXT */
                    )
                  ])) : (e.openBlock(), e.createElementBlock("p", wd, [
                    T[18] || (T[18] = e.createElementVNode(
                      "i",
                      { class: "ri-checkbox-circle-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("正文里的数字都能在要点里找到")),
                      1
                      /* TEXT */
                    )
                  ])),
                  e.createElementVNode("div", Cd, [
                    e.createElementVNode(
                      "p",
                      Td,
                      e.toDisplayString(o.value.issuer) + e.toDisplayString(o.value.kind === "minutes" ? s.$t("会议纪要") : o.value.kind === "letter" ? "" : s.$t("文件")),
                      1
                      /* TEXT */
                    ),
                    o.value.docNo ? (e.openBlock(), e.createElementBlock(
                      "p",
                      Ld,
                      e.toDisplayString(o.value.docNo),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    T[19] || (T[19] = e.createElementVNode(
                      "hr",
                      null,
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "p",
                      Ad,
                      e.toDisplayString(o.value.title),
                      1
                      /* TEXT */
                    ),
                    o.value.recipients ? (e.openBlock(), e.createElementBlock(
                      "p",
                      Fd,
                      e.toDisplayString(s.$t("{p0}：", { p0: o.value.recipients })),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    e.withDirectives(e.createElementVNode(
                      "textarea",
                      {
                        "onUpdate:modelValue": T[12] || (T[12] = (g) => L.value = g),
                        class: "ca-paper__body",
                        rows: "14",
                        "data-test": "ca-doc-body"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelText, L.value]
                    ])
                  ]),
                  e.createElementVNode("div", Md, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      disabled: L.value === o.value.body || !!k.value,
                      onClick: n
                    }, e.toDisplayString(s.$t("保存修改")), 9, zd)
                  ])
                ],
                64
                /* STABLE_FRAGMENT */
              )) : (e.openBlock(), e.createElementBlock(
                "p",
                qd,
                e.toDisplayString(s.$t("先起草正文")),
                1
                /* TEXT */
              ))
            ]),
            _: 1
            /* STABLE */
          }, 8, ["title", "hint", "runtime", "is-current"]),
          e.createVNode(H, {
            "step-key": "gd-export",
            index: 3,
            title: v[3].title,
            hint: v[3].hint,
            runtime: D.value["gd-export"],
            "is-current": z.value === "gd-export"
          }, {
            default: e.withCtx(() => [
              e.createElementVNode("div", Od, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary",
                  disabled: !o.value || !!k.value || L.value !== o.value.body,
                  "data-test": "ca-doc-export",
                  onClick: c
                }, [
                  T[20] || (T[20] = e.createElementVNode(
                    "i",
                    { class: "ri-file-word-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(s.$t("导出 Word")),
                    1
                    /* TEXT */
                  )
                ], 8, Ud),
                e.createElementVNode(
                  "span",
                  Id,
                  e.toDisplayString(L.value !== o.value?.body ? s.$t("先保存修改") : s.$t("版头红字与红线、小标宋标题、仿宋正文、署名与成文日期、版记，按 GB/T 9704 版式")),
                  1
                  /* TEXT */
                )
              ]),
              o.value?.docxPath ? (e.openBlock(), e.createElementBlock("p", Pd, [
                T[21] || (T[21] = e.createElementVNode(
                  "i",
                  { class: "ri-file-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "code",
                  null,
                  e.toDisplayString(o.value.docxPath),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-link",
                    onClick: T[13] || (T[13] = (g) => e.unref(te)(o.value.docxPath))
                  },
                  e.toDisplayString(s.$t("打开")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            _: 1
            /* STABLE */
          }, 8, ["title", "hint", "runtime", "is-current"])
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createCommentVNode(" 诉求热点 "),
          e.createElementVNode("section", Kd, [
            e.createElementVNode("h3", null, [
              T[22] || (T[22] = e.createElementVNode(
                "i",
                { class: "ri-fire-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(s.$t("诉求热点分析")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "p",
              Wd,
              e.toDisplayString(s.$t("从师生问答与转办记录里按领域、部门、时间统计诉求热点、响应慢的部门和知识库缺口。数字全部由规则统计；勾选后模型只在这些数字上写一段小结，写错数字就改用规则版。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", Rd, [
              e.createElementVNode("div", Qd, [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList([7, 30, 90], (g) => e.createElementVNode("button", {
                    key: g,
                    type: "button",
                    class: e.normalizeClass({ on: q.value === g }),
                    onClick: (Z) => q.value = g
                  }, e.toDisplayString(s.$t("近 {n} 天", { n: g })), 11, jd)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]),
              e.createElementVNode("label", Gd, [
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": T[14] || (T[14] = (g) => P.value = g),
                    type: "checkbox"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelCheckbox, P.value]
                ]),
                e.createTextVNode(
                  e.toDisplayString(s.$t("用大模型写小结")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary sm",
                disabled: !!k.value,
                "data-test": "ca-hot-run",
                onClick: d
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(k.value === "hot" ? "ri-loader-4-line spin" : "ri-line-chart-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(s.$t("生成分析")),
                  1
                  /* TEXT */
                )
              ], 8, Jd),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm",
                disabled: !F.value,
                onClick: i
              }, [
                T[23] || (T[23] = e.createElementVNode(
                  "i",
                  { class: "ri-download-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(s.$t("导出周报")),
                  1
                  /* TEXT */
                )
              ], 8, Hd)
            ])
          ]),
          F.value ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createElementVNode("div", Yd, [
                e.createElementVNode("div", Xd, [
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(s.$t("本期问答")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(F.value.total),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(E(F.value.total, F.value.prevTotal)),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Zd, [
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(s.$t("自动答复率")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(e.unref(Ce)(F.value.autoRate)),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", xd, [
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(s.$t("知识缺口")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(F.value.gaps.length),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "div",
                  {
                    class: e.normalizeClass(["ss-kpi", { alert: F.value.sensitive }])
                  },
                  [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(s.$t("敏感问题")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(F.value.sensitive),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                ),
                e.createElementVNode("div", eu, [
                  e.createElementVNode(
                    "small",
                    null,
                    e.toDisplayString(s.$t("带不满情绪")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(F.value.negative),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              e.createElementVNode("section", tu, [
                e.createElementVNode("h3", null, [
                  e.createTextVNode(
                    e.toDisplayString(s.$t("小结")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", F.value.summaryBy === "model" ? "brand" : ""])
                    },
                    e.toDisplayString(F.value.summaryBy === "model" ? s.$t("模型撰写，数字已核对") : s.$t("规则生成")),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode(
                  "p",
                  lu,
                  e.toDisplayString(F.value.summary),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", nu, [
                e.createElementVNode("section", ou, [
                  e.createElementVNode(
                    "h3",
                    null,
                    e.toDisplayString(s.$t("领域分布")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", su, [
                    e.createElementVNode("table", au, [
                      e.createElementVNode("thead", null, [
                        e.createElementVNode("tr", null, [
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(s.$t("领域")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            iu,
                            e.toDisplayString(s.$t("本期")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            ru,
                            e.toDisplayString(s.$t("上期")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            cu,
                            e.toDisplayString(s.$t("无依据")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("tbody", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(F.value.byDomain, (g) => (e.openBlock(), e.createElementBlock("tr", {
                            key: g.id
                          }, [
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(g.name),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode("td", du, [
                              e.createElementVNode(
                                "b",
                                null,
                                e.toDisplayString(g.count),
                                1
                                /* TEXT */
                              )
                            ]),
                            e.createElementVNode(
                              "td",
                              uu,
                              e.toDisplayString(g.prev),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              {
                                class: e.normalizeClass(["num", { warn: g.noEvidence }])
                              },
                              e.toDisplayString(g.noEvidence),
                              3
                              /* TEXT, CLASS */
                            )
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])
                  ])
                ]),
                e.createElementVNode("section", mu, [
                  e.createElementVNode(
                    "h3",
                    null,
                    e.toDisplayString(s.$t("部门响应")),
                    1
                    /* TEXT */
                  ),
                  F.value.byDept.length ? (e.openBlock(), e.createElementBlock("div", pu, [
                    e.createElementVNode("table", vu, [
                      e.createElementVNode("thead", null, [
                        e.createElementVNode("tr", null, [
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(s.$t("部门")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            yu,
                            e.toDisplayString(s.$t("待答复")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            ku,
                            e.toDisplayString(s.$t("已答复")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            gu,
                            e.toDisplayString(s.$t("平均响应")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            Nu,
                            e.toDisplayString(s.$t("超 48 小时")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("tbody", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(F.value.byDept, (g) => (e.openBlock(), e.createElementBlock(
                            "tr",
                            {
                              key: g.dept,
                              class: e.normalizeClass({ bad: g.overdue })
                            },
                            [
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(g.dept),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Vu,
                                e.toDisplayString(g.open),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Eu,
                                e.toDisplayString(g.answered),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                $u,
                                e.toDisplayString(g.avgHours === null ? "—" : s.$t("{n} 小时", { n: g.avgHours })),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                bu,
                                e.toDisplayString(g.overdue),
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
                    hu,
                    e.toDisplayString(s.$t("本期没有转办")),
                    1
                    /* TEXT */
                  ))
                ])
              ]),
              e.createElementVNode("section", fu, [
                e.createElementVNode(
                  "h3",
                  null,
                  e.toDisplayString(s.$t("知识库缺口")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "p",
                  Su,
                  e.toDisplayString(s.$t("被反复问到、知识库里却没有依据的问题。补充对应资料或 FAQ 后，这类问题就能自动回答。")),
                  1
                  /* TEXT */
                ),
                F.value.gaps.length ? (e.openBlock(), e.createElementBlock("ol", Du, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(F.value.gaps, (g) => (e.openBlock(), e.createElementBlock("li", {
                      key: g.question
                    }, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(g.question),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "em",
                        null,
                        e.toDisplayString(g.domain),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "b",
                        null,
                        e.toDisplayString(s.$t("{n} 次", { n: g.count })),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (e.openBlock(), e.createElementBlock(
                  "p",
                  _u,
                  e.toDisplayString(s.$t("本期没有知识缺口")),
                  1
                  /* TEXT */
                )),
                F.value.keywords.length ? (e.openBlock(), e.createElementBlock("div", Bu, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(F.value.keywords, (g) => (e.openBlock(), e.createElementBlock(
                      "span",
                      {
                        key: g.term,
                        style: e.normalizeStyle({ fontSize: `${12 + Math.min(8, g.count)}px` })
                      },
                      [
                        e.createTextVNode(
                          e.toDisplayString(g.term),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "sup",
                          null,
                          e.toDisplayString(g.count),
                          1
                          /* TEXT */
                        )
                      ],
                      4
                      /* STYLE */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0)
              ])
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]));
  }
}), Cu = /* @__PURE__ */ le(wu, [["__scopeId", "data-v-1fae361d"]]), Tu = { class: "ca-wb" }, Lu = { class: "ca-banner" }, Au = ["src"], Fu = {
  key: 1,
  class: "ri-government-line"
}, Mu = { class: "ca-banner__text" }, zu = {
  key: 0,
  class: "ca-banner__en"
}, qu = {
  key: 1,
  class: "ca-banner__motto"
}, Ou = {
  key: 2,
  class: "ca-banner__product"
}, Uu = {
  key: 3,
  class: "ca-banner__product"
}, Iu = { class: "ca-banner__side" }, Pu = ["disabled"], Ku = {
  key: 0,
  class: "ca-rules"
}, Wu = { class: "ca-rules__stat" }, Ru = {
  class: "ca-tabs",
  role: "tablist"
}, Qu = {
  key: 0,
  class: "ca-tabgroup"
}, ju = ["aria-selected", "data-test", "onClick"], Gu = {
  key: 1,
  class: "ca-body"
}, Ju = {
  key: 9,
  class: "ca-about"
}, Hu = { class: "ss-panel" }, Yu = { class: "ca-list" }, Xu = { class: "ss-panel" }, Zu = { class: "ca-list" }, xu = { class: "ss-panel" }, em = { class: "ca-list" }, tm = {
  key: 2,
  class: "ss-note danger"
}, lm = {
  key: 3,
  class: "ss-note"
}, Me = "totalclaw:campus-ai-tab:v1", nm = /* @__PURE__ */ e.defineComponent({
  __name: "CampusAiWorkbenchView",
  setup(I) {
    const w = [
      { key: "overview", icon: "ri-dashboard-3-line", title: l.t("总览") },
      { key: "apps", icon: "ri-compass-3-line", title: l.t("AI 应用中心") },
      { key: "qa", icon: "ri-customer-service-2-line", title: l.t("智能问答"), group: l.t("服务") },
      { key: "tickets", icon: "ri-git-pull-request-line", title: l.t("转办问题"), group: l.t("服务") },
      { key: "teach", icon: "ri-book-shelf-line", title: l.t("教学助手"), group: l.t("教学") },
      { key: "warning", icon: "ri-graduation-cap-line", title: l.t("学业预警"), group: l.t("教学") },
      { key: "research", icon: "ri-flask-line", title: l.t("科研"), group: l.t("科研") },
      { key: "gov", icon: "ri-government-line", title: l.t("校务治理"), group: l.t("治理") },
      { key: "kb", icon: "ri-book-2-line", title: l.t("校园知识库"), group: l.t("底座") },
      { key: "ops", icon: "ri-shield-check-line", title: l.t("运维与设置"), group: l.t("底座") },
      { key: "about", icon: "ri-book-open-line", title: l.t("方案说明") }
    ];
    function B() {
      try {
        const y = localStorage.getItem(Me);
        return w.some(($) => $.key === y) ? y : "overview";
      } catch {
        return "overview";
      }
    }
    const h = R, k = e.ref(B()), f = e.ref(!1), U = e.ref(!1), C = e.ref("");
    function V(y) {
      const $ = h.value?.stats;
      return $ ? y === "tickets" ? $.openTickets : y === "warning" ? $.warnPending : 0 : 0;
    }
    function L(y) {
      k.value = y;
      try {
        localStorage.setItem(Me, y);
      } catch {
      }
    }
    async function q() {
      U.value = !0;
      try {
        await J(), f.value = !0, C.value = "";
      } catch (y) {
        C.value = K.errorMessage(y);
      } finally {
        U.value = !1;
      }
    }
    let P = null, F = null;
    return e.onMounted(() => {
      q(), F = Pe((y) => {
        if (y?.type === "progress") {
          ue.value = { message: String(y.payload?.message || ""), scope: y.payload?.scope, done: y.payload?.done, total: y.payload?.total };
          return;
        }
        P || (P = setTimeout(() => {
          P = null, J().catch(() => {
          });
        }, 250));
      });
    }), e.onBeforeUnmount(() => {
      F?.(), P && clearTimeout(P);
    }), (y, $) => (e.openBlock(), e.createElementBlock("div", Tu, [
      e.createElementVNode("header", Lu, [
        e.createVNode(Ie, { class: "ca-banner__back" }),
        e.createElementVNode(
          "div",
          {
            class: e.normalizeClass(["ca-crest", { empty: !e.unref(h)?.logo }])
          },
          [
            e.unref(h)?.logo ? (e.openBlock(), e.createElementBlock("img", {
              key: 0,
              src: e.unref(h).logo,
              alt: ""
            }, null, 8, Au)) : (e.openBlock(), e.createElementBlock("i", Fu))
          ],
          2
          /* CLASS */
        ),
        e.createElementVNode("div", Mu, [
          e.createElementVNode(
            "h1",
            null,
            e.toDisplayString(e.unref(h)?.settings.schoolName || y.$t("高校一体化AI智能体")),
            1
            /* TEXT */
          ),
          e.unref(h)?.settings.profile.englishName ? (e.openBlock(), e.createElementBlock(
            "p",
            zu,
            e.toDisplayString(e.unref(h).settings.profile.englishName),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.unref(h)?.settings.profile.motto ? (e.openBlock(), e.createElementBlock(
            "p",
            qu,
            e.toDisplayString(e.unref(h).settings.profile.motto),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.unref(h)?.settings.schoolName ? (e.openBlock(), e.createElementBlock(
            "p",
            Ou,
            e.toDisplayString(y.$t("高校一体化AI智能体")),
            1
            /* TEXT */
          )) : (e.openBlock(), e.createElementBlock(
            "p",
            Uu,
            e.toDisplayString(y.$t("在「运维与设置 → 学校档案」里填写学校名称、上传校徽")),
            1
            /* TEXT */
          ))
        ]),
        e.createElementVNode("div", Iu, [
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ca-pill", e.unref(h)?.model ? "ok" : "warn"])
            },
            [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(e.unref(h)?.model ? "ri-cpu-line" : "ri-error-warning-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(e.unref(h)?.model ? y.$t("大模型已配置") : y.$t("大模型未配置")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ca-pill", e.unref(h)?.mobile.running ? "ok" : ""])
            },
            [
              $[2] || ($[2] = e.createElementVNode(
                "i",
                { class: "ri-smartphone-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(e.unref(h)?.mobile.running ? y.$t("手机端运行中") : y.$t("手机端未开启")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          e.createElementVNode("button", {
            class: "ca-banner__btn",
            disabled: U.value,
            onClick: q
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(U.value ? "ri-loader-4-line spin" : "ri-refresh-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(y.$t("刷新")),
              1
              /* TEXT */
            )
          ], 8, Pu)
        ])
      ]),
      e.unref(h) ? (e.openBlock(), e.createElementBlock("p", Ku, [
        e.createElementVNode("span", null, [
          $[3] || ($[3] = e.createElementVNode(
            "i",
            { class: "ri-close-circle-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(y.$t("没依据不编；预警数字不交给模型")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("span", null, [
          $[4] || ($[4] = e.createElementVNode(
            "i",
            { class: "ri-checkbox-circle-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(y.$t("每个回答带出处；通知和邮件由人确认")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          Wu,
          e.toDisplayString(y.$t("文档 {a} · FAQ {b} · 近 7 天问答 {c}", { a: e.unref(h).stats.docs, b: e.unref(h).stats.faqs, c: e.unref(h).stats.qa7d })),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("nav", Ru, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(w, (o, N) => (e.openBlock(), e.createElementBlock(
            e.Fragment,
            {
              key: o.key
            },
            [
              o.group && o.group !== w[N - 1]?.group ? (e.openBlock(), e.createElementBlock(
                "span",
                Qu,
                e.toDisplayString(o.group),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("button", {
                type: "button",
                role: "tab",
                class: e.normalizeClass(["ca-tab", { active: k.value === o.key }]),
                "aria-selected": k.value === o.key,
                "data-test": `ca-tab-${o.key}`,
                onClick: (v) => L(o.key)
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(o.icon)
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(o.title),
                  1
                  /* TEXT */
                ),
                V(o.key) ? (e.openBlock(), e.createElementBlock(
                  "em",
                  {
                    key: 0,
                    class: e.normalizeClass(["ca-badge", { bad: o.key === "tickets" && e.unref(h)?.stats.sensitiveOpen }])
                  },
                  e.toDisplayString(V(o.key)),
                  3
                  /* TEXT, CLASS */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, ju)
            ],
            64
            /* STABLE_FRAGMENT */
          ))),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      f.value ? (e.openBlock(), e.createElementBlock("div", Gu, [
        k.value === "overview" ? (e.openBlock(), e.createBlock(ft, {
          key: 0,
          onGo: $[0] || ($[0] = (o) => L(o))
        })) : k.value === "apps" ? (e.openBlock(), e.createBlock(Ei, {
          key: 1,
          onGo: $[1] || ($[1] = (o) => L(o))
        })) : k.value === "teach" ? (e.openBlock(), e.createBlock(yc, { key: 2 })) : k.value === "research" ? (e.openBlock(), e.createBlock(Zc, { key: 3 })) : k.value === "gov" ? (e.openBlock(), e.createBlock(Cu, { key: 4 })) : k.value === "kb" ? (e.openBlock(), e.createBlock(Ul, { key: 5 })) : k.value === "qa" ? (e.openBlock(), e.createBlock(Dn, { key: 6 })) : k.value === "tickets" ? (e.openBlock(), e.createBlock(lo, { key: 7 })) : e.createCommentVNode("v-if", !0),
        e.withDirectives(e.createVNode(
          As,
          null,
          null,
          512
          /* NEED_PATCH */
        ), [
          [e.vShow, k.value === "warning"]
        ]),
        k.value === "ops" ? (e.openBlock(), e.createBlock(Oa, { key: 8 })) : e.createCommentVNode("v-if", !0),
        k.value === "about" ? (e.openBlock(), e.createElementBlock("div", Ju, [
          e.createElementVNode("section", Hu, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(y.$t("它为学校做什么")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Yu, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("统一规划、建设与运维：AI 应用中心按五个方向列出全校场景、建设阶段与责任部门；校园知识库是各场景共用的底座；模型服务状态、调用审计、数据保留统一在运维里看")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("师生服务：学生扫码就能问，按招生、教务、资助、就业、后勤、心理、信息化等领域分给对应助手；常见问题直接给部门审定的答案，知识库有依据的依据原文回答并列出处，没有依据的不编、转给对应部门，答复后一键沉淀为 FAQ；涉及心理危机、人身安全的立即给求助方式并置顶提醒")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("教学：每门课一个资料库，课程助教只依据课程资料答学生的问题；从课程资料出单选、多选、判断、简答题，每题附原文出处；作业批改客观题按答案判分、主观题按评分要点给建议分由教师确认；学业预警按成绩和考勤算三级，辅导员复核后出谈话提纲与通知")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("科研：成果登记表按学院、类型、年度、级别统计数量与经费；申报指南自动抽出截止时间、申报条件、材料清单与资助额度，每条附原文；申报书与论文写作进入平台已有的学术写作能力")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("校务治理：公文助手按要点起草通知、请示、报告、函、纪要，标出要点里没有的数字，按国标版式导出 Word；诉求热点分析从师生问答与转办里找出热点、响应慢的部门和知识库缺口，生成周报")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", Xu, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(y.$t("几条红线")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Zu, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("回答必须有出处：能拒答的分支一律不调模型；模型回答里出现原文没有的数字（日期、金额、电话），改为直接列出原文")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("数字不交给模型：预警的门数、学分、缺勤率、级别都由规则算；模型写通知时用错一个数字，整份改用规则模板")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("学生信息不出校：数据存本机；发给模型的预警事实不含姓名、学号、班级")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("对外发出的由人确认：通知要辅导员复核，邮件要勾选确认才发")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("教学与科研同样只认原文：出题和指南解读的每一条都要带原文引文并逐字核对，对不上的直接丢掉；主观题建议分必须教师确认才算成绩")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", xu, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(y.$t("先知道这几件事")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", em, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("手机端要求手机和这台电脑在同一个校园网里；应用关了服务也会停")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("一门课多条成绩（补考、重修）取最好的一次；缓考、未录入不计")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("考勤可以是汇总表（缺勤次数 + 应到次数），也可以是逐次记录（每次的状态）；请假不计缺勤")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(y.$t("预警规则和证据下限都能调：规则在「学业预警」第 2 步，证据下限在「运维与设置」")),
                1
                /* TEXT */
              )
            ])
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ])) : C.value ? (e.openBlock(), e.createElementBlock("p", tm, [
        $[5] || ($[5] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(C.value),
          1
          /* TEXT */
        )
      ])) : (e.openBlock(), e.createElementBlock("p", lm, [
        $[6] || ($[6] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), om = /* @__PURE__ */ le(nm, [["__scopeId", "data-v-7c03a939"]]);
export {
  om as default
};
