const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const b = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-i18n"];
if (!b) throw new Error("宿主模块未就绪：npm:vue-i18n");
b.default;
const S = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/humanize.ts"];
if (!S) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/humanize.ts");
S.default;
const q = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!q) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const K = q.default, O = { class: "gqa" }, W = { class: "gqa__inner" }, z = { class: "workbench-header gqa__intro" }, F = { class: "heading" }, P = { class: "eyebrow" }, I = { class: "subtitle" }, M = { class: "header-actions" }, Q = ["disabled"], G = ["aria-expanded"], H = { class: "gqa__panel-title" }, R = {
  key: 0,
  class: "gqa__badge"
}, U = {
  key: 2,
  class: "gqa__badge warn"
}, j = { class: "gqa__panel-body" }, J = {
  key: 0,
  class: "gqa__error"
}, X = { class: "gqa__folder" }, Y = ["title"], Z = { key: 1 }, x = ["disabled"], ee = ["disabled"], te = {
  key: 1,
  class: "gqa__table-wrap"
}, le = { class: "gqa__table" }, ne = ["title"], ae = { class: "gqa__switch" }, oe = ["checked", "onChange"], se = { class: "gqa__chat" }, re = { class: "gqa__chat-head" }, ie = { class: "gqa__panel-title" }, de = ["disabled"], ce = {
  key: 0,
  class: "gqa__empty"
}, ue = { class: "gqa__msg user" }, _e = {
  class: "gqa__bubble",
  dir: "auto"
}, pe = { class: "gqa__msg bot" }, me = {
  key: 0,
  class: "gqa__bubble muted"
}, ge = {
  key: 1,
  class: "gqa__bubble failed"
}, ve = {
  key: 2,
  class: "gqa__bubble refusal"
}, he = { dir: "auto" }, Ee = {
  key: 3,
  class: "gqa__bubble"
}, ke = {
  class: "gqa__answer",
  dir: "auto"
}, ye = {
  key: 0,
  class: "gqa__cites"
}, Ve = { class: "gqa__cites-label" }, Ne = ["title"], fe = { class: "gqa__samples" }, be = { class: "gqa__muted" }, Se = ["title", "disabled", "onClick"], Be = { class: "gqa__composer" }, we = ["placeholder", "disabled"], De = ["disabled"], Te = /* @__PURE__ */ e.defineComponent({
  __name: "GroundedQaWorkbenchView",
  setup(V) {
    const { t: p } = b.useI18n(), i = e.ref([]), r = e.ref(null), s = e.ref(!1), d = e.ref(""), m = e.ref(null), g = e.ref(!1), c = e.ref([]), v = e.ref(""), u = e.ref(!1), k = e.ref(null);
    let $ = 0;
    const h = e.ref([]), B = e.computed(() => i.value.filter((t) => t.approved).length);
    function _() {
      return window.electronAPI?.workbenches?.groundedQa;
    }
    const E = (t) => S.humanizeErrorMessage(t, p("操作失败，请重试"));
    function C(t) {
      return p(t === "restricted" ? "权限不足" : t === "out_of_scope" ? "超出职责范围" : "资料中无依据");
    }
    async function y() {
      try {
        if (!_()?.list) throw new Error(p("知识问答接口不可用"));
        const t = await _().list();
        i.value = t?.docs || [], r.value = t?.folder ?? null, h.value = t?.suggestions || [];
      } catch (t) {
        d.value = E(t);
      }
    }
    async function L() {
      s.value = !0, d.value = "", m.value = null;
      try {
        const t = await _().pickFolder();
        t && !t.canceled && (r.value = t.folder ?? null, t.suggestions && (h.value = t.suggestions));
      } catch (t) {
        d.value = E(t);
      } finally {
        s.value = !1, m.value = null, await y();
      }
    }
    async function N() {
      s.value = !0, d.value = "", m.value = null;
      try {
        const t = await _().import();
        r.value = t?.folder ?? null;
      } catch (t) {
        d.value = E(t);
      } finally {
        s.value = !1, m.value = null, await y();
      }
    }
    async function A(t) {
      try {
        await _().approve({ id: String(t.id), approved: !t.approved });
      } catch (l) {
        d.value = E(l);
      }
      await y();
    }
    function w() {
      e.nextTick(() => {
        k.value && (k.value.scrollTop = k.value.scrollHeight);
      });
    }
    async function f(t) {
      const l = (t ?? v.value).trim();
      if (!l || u.value) return;
      const n = c.value.filter((a) => a.status === "answered" || a.status === "refused").map((a) => ({ question: String(a.question), ...a.answer ? { answer: String(a.answer) } : {} }));
      c.value.push({ id: ++$, question: l, status: "pending", citations: [] });
      const o = c.value[c.value.length - 1];
      v.value = "", u.value = !0, w();
      try {
        const a = await _().ask({ question: l, history: n });
        o.lang = a.lang, o.citations = a.citations || [], a.answered ? (o.status = "answered", o.answer = a.answer) : (o.status = "refused", o.refusal = a.refusal, o.reason = a.reason);
      } catch (a) {
        o.status = "failed", o.error = E(a);
      } finally {
        u.value = !1, w();
      }
    }
    let D, T;
    return e.onMounted(async () => {
      D = _()?.onImportProgress?.((t) => {
        m.value = t;
      }), T = _()?.onSuggestionsReady?.((t) => {
        const l = new Set(t.ready || []);
        h.value = h.value.map((n) => ({ ...n, ready: l.has(n.q) }));
      }), await y(), await N();
    }), e.onUnmounted(() => {
      D?.(), T?.();
    }), (t, l) => (e.openBlock(), e.createElementBlock("div", O, [
      e.createElementVNode("div", W, [
        e.createElementVNode("header", z, [
          e.createElementVNode("div", F, [
            e.createVNode(K),
            l[5] || (l[5] = e.createElementVNode(
              "span",
              { class: "heading-icon" },
              [
                e.createElementVNode("i", { class: "ri-question-answer-line" })
              ],
              -1
              /* CACHED */
            )),
            e.createElementVNode("div", null, [
              e.createElementVNode(
                "p",
                P,
                e.toDisplayString(t.$t("行业工作台")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "h1",
                null,
                e.toDisplayString(t.$t("知识问答助手")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "p",
                I,
                e.toDisplayString(t.$t("只依据已审批资料作答，逐条标注来源页码；超出职责范围或资料里查不到的问题一律拒答，不猜不编。")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("div", M, [
            e.createElementVNode("button", {
              type: "button",
              class: "btn ghost",
              disabled: s.value,
              onClick: N
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(s.value ? "ri-loader-4-line spin" : "ri-refresh-line")
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
            ], 8, Q)
          ])
        ]),
        e.createCommentVNode(" 审批范围：默认收起，左上角箭头展开 "),
        e.createElementVNode(
          "section",
          {
            class: e.normalizeClass(["gqa__panel", { open: g.value }])
          },
          [
            e.createElementVNode("button", {
              type: "button",
              class: "gqa__panel-head",
              "aria-expanded": g.value,
              onClick: l[0] || (l[0] = (n) => g.value = !g.value)
            }, [
              l[7] || (l[7] = e.createElementVNode(
                "i",
                { class: "ri-arrow-right-s-line gqa__arrow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("div", H, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(t.$t("审批可回答范围")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(t.$t("未审批的资料检索不到 —— 这是这套方案的权限边界，不是摆设")),
                  1
                  /* TEXT */
                )
              ]),
              s.value ? (e.openBlock(), e.createElementBlock("span", R, [
                l[6] || (l[6] = e.createElementVNode(
                  "i",
                  { class: "ri-loader-4-line spin" },
                  null,
                  -1
                  /* CACHED */
                )),
                m.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(t.$t("正在识别 {file}（{done}/{total} 页）", m.value)),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    e.createTextVNode(
                      e.toDisplayString(t.$t("正在读取资料…")),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])) : i.value.length ? (e.openBlock(), e.createElementBlock(
                "span",
                {
                  key: 1,
                  class: e.normalizeClass(["gqa__badge", { ok: B.value > 0 }])
                },
                e.toDisplayString(t.$t("{total} 份资料 · {n} 份已审批", { total: i.value.length, n: B.value })),
                3
                /* TEXT, CLASS */
              )) : (e.openBlock(), e.createElementBlock(
                "span",
                U,
                e.toDisplayString(t.$t("还没有资料")),
                1
                /* TEXT */
              ))
            ], 8, G),
            e.withDirectives(e.createElementVNode(
              "div",
              j,
              [
                d.value ? (e.openBlock(), e.createElementBlock("p", J, [
                  l[8] || (l[8] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(d.value),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", X, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(r.value ? "ri-folder-3-line" : "ri-folder-warning-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  r.value ? (e.openBlock(), e.createElementBlock("span", {
                    key: 0,
                    class: "gqa__folder-path",
                    title: r.value
                  }, e.toDisplayString(r.value), 9, Y)) : (e.openBlock(), e.createElementBlock(
                    "span",
                    Z,
                    e.toDisplayString(t.$t("还没有选择资料文件夹")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode("button", {
                    class: "btn ghost small",
                    disabled: s.value,
                    onClick: L
                  }, [
                    l[9] || (l[9] = e.createElementVNode(
                      "i",
                      { class: "ri-folder-open-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(r.value ? t.$t("更换文件夹") : t.$t("选择文件夹")),
                      1
                      /* TEXT */
                    )
                  ], 8, x),
                  r.value ? (e.openBlock(), e.createElementBlock("button", {
                    key: 2,
                    class: "btn ghost small",
                    disabled: s.value,
                    onClick: N
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(s.value ? "ri-loader-4-line spin" : "ri-refresh-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("重新读取")),
                      1
                      /* TEXT */
                    )
                  ], 8, ee)) : e.createCommentVNode("v-if", !0)
                ]),
                i.value.length ? (e.openBlock(), e.createElementBlock("div", te, [
                  e.createElementVNode("table", le, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("资料名称")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("页数")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("字数")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("可回答")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(i.value, (n) => (e.openBlock(), e.createElementBlock("tr", {
                          key: n.id
                        }, [
                          e.createElementVNode("td", {
                            class: "gqa__name",
                            title: n.name
                          }, e.toDisplayString(n.name), 9, ne),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.pages),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.chars.toLocaleString()),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("label", ae, [
                              e.createElementVNode("input", {
                                type: "checkbox",
                                checked: n.approved,
                                onChange: (o) => A(n)
                              }, null, 40, oe),
                              e.createElementVNode(
                                "span",
                                null,
                                e.toDisplayString(n.approved ? t.$t("已审批") : t.$t("未审批")),
                                1
                                /* TEXT */
                              )
                            ])
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ])) : e.createCommentVNode("v-if", !0)
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vShow, g.value]
            ])
          ],
          2
          /* CLASS */
        ),
        e.createCommentVNode(" 多轮问答 "),
        e.createElementVNode("section", se, [
          e.createElementVNode("header", re, [
            e.createElementVNode("div", ie, [
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(t.$t("知识问答")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(t.$t("自动识别提问语言并用同一语言作答；回答带来源，可以接着追问")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("button", {
              class: "btn ghost small",
              disabled: !c.value.length || u.value,
              onClick: l[1] || (l[1] = (n) => c.value = [])
            }, [
              l[10] || (l[10] = e.createElementVNode(
                "i",
                { class: "ri-add-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("新对话")),
                1
                /* TEXT */
              )
            ], 8, de)
          ]),
          e.createElementVNode(
            "div",
            {
              ref_key: "listEl",
              ref: k,
              class: "gqa__messages"
            },
            [
              c.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("div", ce, [
                l[11] || (l[11] = e.createElementVNode(
                  "i",
                  { class: "ri-book-open-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createElementVNode(
                  "p",
                  null,
                  e.toDisplayString(t.$t("从下面的问题开始，或直接输入你的问题")),
                  1
                  /* TEXT */
                )
              ])),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(c.value, (n) => (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  {
                    key: n.id
                  },
                  [
                    e.createElementVNode("div", ue, [
                      e.createElementVNode(
                        "div",
                        _e,
                        e.toDisplayString(n.question),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", pe, [
                      n.status === "pending" ? (e.openBlock(), e.createElementBlock("div", me, [
                        l[12] || (l[12] = e.createElementVNode(
                          "i",
                          { class: "ri-loader-4-line spin" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("检索并作答…")),
                          1
                          /* TEXT */
                        )
                      ])) : n.status === "failed" ? (e.openBlock(), e.createElementBlock("div", ge, [
                        l[13] || (l[13] = e.createElementVNode(
                          "i",
                          { class: "ri-error-warning-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(n.error),
                          1
                          /* TEXT */
                        )
                      ])) : n.status === "refused" ? (e.openBlock(), e.createElementBlock("div", ve, [
                        e.createElementVNode("strong", null, [
                          l[14] || (l[14] = e.createElementVNode(
                            "i",
                            { class: "ri-shield-keyhole-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(C(n.reason)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "p",
                          he,
                          e.toDisplayString(n.refusal),
                          1
                          /* TEXT */
                        )
                      ])) : (e.openBlock(), e.createElementBlock("div", Ee, [
                        e.createElementVNode(
                          "div",
                          ke,
                          e.toDisplayString(n.answer),
                          1
                          /* TEXT */
                        ),
                        n.citations.length ? (e.openBlock(), e.createElementBlock("div", ye, [
                          e.createElementVNode(
                            "span",
                            Ve,
                            e.toDisplayString(t.$t("来源")),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(n.citations, (o, a) => (e.openBlock(), e.createElementBlock("span", {
                              key: a,
                              class: "gqa__cite",
                              title: o.snippet,
                              dir: "auto"
                            }, [
                              l[15] || (l[15] = e.createElementVNode(
                                "i",
                                { class: "ri-file-text-line" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(o.docName) + " · " + e.toDisplayString(t.$t("第 {n} 页", { n: o.page })),
                                1
                                /* TEXT */
                              )
                            ], 8, Ne))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])) : e.createCommentVNode("v-if", !0)
                      ]))
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ),
          e.createElementVNode("div", fe, [
            e.createElementVNode(
              "span",
              be,
              e.toDisplayString(t.$t("试试：")),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(h.value, (n) => (e.openBlock(), e.createElementBlock("button", {
                key: n.q,
                class: e.normalizeClass(["chip", { "chip--boundary": !n.inScope, "chip--ready": n.ready }]),
                title: n.inScope ? n.ready ? t.$t("答案已就绪，点击立即显示") : "" : t.$t("这个问题不在资料范围内，用来看助手怎么拒答"),
                disabled: u.value,
                onClick: (o) => f(n.q)
              }, e.toDisplayString(n.q), 11, Se))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", Be, [
            e.withDirectives(e.createElementVNode("textarea", {
              "onUpdate:modelValue": l[2] || (l[2] = (n) => v.value = n),
              class: "gqa__input",
              rows: "2",
              dir: "auto",
              placeholder: t.$t("输入问题，Enter 发送，Shift+Enter 换行"),
              disabled: u.value,
              onKeydown: l[3] || (l[3] = e.withKeys(e.withModifiers((n) => f(), ["exact", "prevent"]), ["enter"]))
            }, null, 40, we), [
              [e.vModelText, v.value]
            ]),
            e.createElementVNode("button", {
              class: "btn primary",
              disabled: u.value || !v.value.trim(),
              onClick: l[4] || (l[4] = (n) => f())
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(u.value ? "ri-loader-4-line spin" : "ri-send-plane-2-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(t.$t("发送")),
                1
                /* TEXT */
              )
            ], 8, De)
          ])
        ])
      ])
    ]));
  }
}), qe = (V, p) => {
  const i = V.__vccOpts || V;
  for (const [r, s] of p)
    i[r] = s;
  return i;
}, $e = /* @__PURE__ */ qe(Te, [["__scopeId", "data-v-df004b41"]]);
export {
  $e as default
};
