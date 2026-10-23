const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const o = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!o) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
o.default;
const ke = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!ke) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const Ce = ke.default, ae = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!ae) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
ae.default;
const l = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/foreign-trade/shared.ts"];
if (!l) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/foreign-trade/shared.ts");
l.default;
const Te = { class: "ss-panel ft-mailboxes" }, Me = { class: "ss-muted" }, Le = ["disabled"], Ue = {
  key: 0,
  class: "ss-table-wrap"
}, Ie = { class: "ss-table" }, Fe = { class: "num" }, Pe = { class: "ss-muted" }, Ae = {
  key: 0,
  class: "ss-muted ft-err"
}, Oe = {
  key: 0,
  class: "ss-muted"
}, ze = { class: "num" }, qe = { class: "ft-row-actions" }, je = ["disabled", "onClick"], Re = ["onClick"], Ke = ["onClick"], xe = {
  key: 1,
  class: "ss-empty"
}, We = { class: "ft-mb-form__head" }, He = { class: "ss-subhead" }, Je = {
  key: 0,
  class: "ss-muted"
}, Qe = { class: "ss-grid" }, Ge = { class: "ss-field" }, Xe = ["onUpdate:modelValue", "onChange"], Ye = ["value"], Ze = { class: "ss-field" }, et = ["onUpdate:modelValue"], tt = { class: "ss-field" }, lt = ["onUpdate:modelValue"], nt = { class: "ss-field" }, ot = ["onUpdate:modelValue", "placeholder"], st = { class: "ss-field" }, at = ["onUpdate:modelValue"], it = { class: "ss-field" }, rt = ["onUpdate:modelValue"], dt = {
  key: 0,
  class: "ss-note info"
}, ct = { class: "ss-grid tight" }, ut = { class: "ss-field" }, mt = ["onUpdate:modelValue"], pt = { class: "ss-field" }, vt = ["onUpdate:modelValue"], yt = { class: "ss-field" }, Vt = ["onUpdate:modelValue"], Nt = { class: "ss-field" }, Et = ["onUpdate:modelValue"], gt = { class: "ss-actions" }, ht = { class: "ss-muted" }, ft = ["onUpdate:modelValue", "value"], kt = { class: "ft-check" }, bt = ["onUpdate:modelValue"], $t = { class: "ft-check" }, Dt = ["onUpdate:modelValue"], St = {
  key: 1,
  class: "ft-test"
}, _t = {
  key: 2,
  class: "ss-note danger"
}, Bt = { class: "ss-actions" }, wt = ["disabled", "onClick"], Ct = ["disabled", "onClick"], Tt = ["disabled", "onClick"], Mt = /* @__PURE__ */ e.defineComponent({
  __name: "MailboxPanel",
  setup(H) {
    const W = ae.useNotificationStore(), M = ["inquiry", "outreach", "followup", "order"], B = e.ref([]), U = e.ref([]);
    let L = 0;
    const w = e.ref(""), A = e.ref(!1), T = e.computed(() => l.ftState.value?.mailboxes || []);
    function V(a) {
      return B.value.find((p) => p.id === a.input.provider)?.note || "";
    }
    function _(a) {
      return { inquiry: o.t("收询盘"), outreach: o.t("发开发信"), followup: o.t("客户跟进"), order: o.t("订单跟单") }[a];
    }
    function I(a) {
      return a.enabled ? { unknown: o.t("待收取"), ready: o.t("正常"), error: o.t("异常"), disabled: o.t("已停用") }[a.status] : o.t("已停用");
    }
    function x(a) {
      return a.enabled ? a.status === "ready" ? "ok" : a.status === "error" ? "bad" : "warn" : "";
    }
    function C() {
      const a = B.value[0];
      return {
        label: "",
        address: "",
        password: "",
        senderName: "",
        owner: "",
        purposes: ["inquiry"],
        provider: a?.id || "custom",
        imapHost: a?.imapHost || "",
        imapPort: a?.imapPort || 993,
        smtpHost: a?.smtpHost || "",
        smtpPort: a?.smtpPort || 465,
        enabled: !0,
        autoReply: !1
      };
    }
    function j(a) {
      U.value.push({ key: ++L, input: a, testing: !1, saving: !1, testResult: null, error: "" });
    }
    function b() {
      j(C());
    }
    function k(a) {
      U.value = U.value.filter((p) => p.key !== a.key);
    }
    function P(a) {
      U.value.some((p) => p.input.id === a.id) || j({
        id: a.id,
        label: a.label,
        address: a.address,
        password: "",
        senderName: a.senderName || "",
        owner: a.owner || "",
        purposes: [...a.purposes],
        provider: a.provider,
        imapHost: a.imapHost,
        imapPort: a.imapPort,
        smtpHost: a.smtpHost,
        smtpPort: a.smtpPort,
        enabled: a.enabled,
        autoReply: a.autoReply
      });
    }
    function R(a) {
      const p = B.value.find((y) => y.id === a.input.provider);
      !p || p.id === "custom" || Object.assign(a.input, { imapHost: p.imapHost, imapPort: p.imapPort, smtpHost: p.smtpHost, smtpPort: p.smtpPort });
    }
    async function S(a) {
      a.testing = !0, a.testResult = null, a.error = "";
      try {
        a.testResult = await l.ft("mailbox.test", { id: a.input.id, input: a.input });
      } catch (p) {
        a.error = l.errorMessage(p);
      } finally {
        a.testing = !1;
      }
    }
    async function K(a) {
      a.saving = !0, a.error = "";
      try {
        const p = { ...a.input };
        p.password || delete p.password;
        const y = await l.ft("mailbox.save", { input: p });
        W.success(o.t("已保存邮箱 {p0}", { p0: y.address })), k(a), await l.refreshState(), y.enabled && X(y.id);
      } catch (p) {
        a.error = l.errorMessage(p);
      } finally {
        a.saving = !1;
      }
    }
    async function J(a) {
      if (window.confirm(o.t("确定不再接管邮箱 {p0}？已收到的邮件和询盘会保留。", { p0: a.address })))
        try {
          await l.ft("mailbox.remove", { id: a.id }), await l.refreshState();
        } catch (p) {
          W.error(l.errorMessage(p));
        }
    }
    async function X(a) {
      w.value = a;
      try {
        const y = (await l.ft("mailbox.poll", { id: a }))[a];
        y?.error ? W.error(y.error) : W.success(o.t("收到 {p0} 封新邮件，新增 {p1} 个询盘", { p0: y?.fetched || 0, p1: y?.created || 0 })), await l.refreshState();
      } catch (p) {
        W.error(l.errorMessage(p));
      } finally {
        w.value = "";
      }
    }
    async function $() {
      A.value = !0;
      try {
        const a = await l.ft("mailbox.poll", {}), p = Object.values(a), y = p.filter((z) => z.error).length;
        W.info(o.t("收取完成：{p0} 个邮箱，新增 {p1} 个询盘{p2}", { p0: p.length, p1: p.reduce((z, N) => z + (N.created || 0), 0), p2: y ? o.t("，{n} 个邮箱失败", { n: y }) : "" })), await l.refreshState();
      } catch (a) {
        W.error(l.errorMessage(a));
      } finally {
        A.value = !1;
      }
    }
    return e.onMounted(async () => {
      try {
        B.value = await l.ft("mailbox.presets");
      } catch {
      }
    }), (a, p) => (e.openBlock(), e.createElementBlock("section", Te, [
      e.createElementVNode("header", null, [
        e.createElementVNode("strong", null, [
          p[0] || (p[0] = e.createElementVNode(
            "i",
            { class: "ri-mail-settings-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            " " + e.toDisplayString(a.$t("邮箱接管")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          Me,
          e.toDisplayString(a.$t("可以同时接管多个邮箱（每位业务员的邮箱、公共询盘邮箱等）。每 2 分钟自动收一次；只读取新邮件，不会改动邮件的已读状态。")),
          1
          /* TEXT */
        ),
        p[2] || (p[2] = e.createElementVNode(
          "span",
          { class: "grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm",
          disabled: A.value || !T.value.length,
          onClick: $
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(A.value ? "ri-loader-4-line spin" : "ri-refresh-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(a.$t("全部立即收取")),
            1
            /* TEXT */
          )
        ], 8, Le),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm primary",
          onClick: b
        }, [
          p[1] || (p[1] = e.createElementVNode(
            "i",
            { class: "ri-add-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(a.$t("添加邮箱")),
            1
            /* TEXT */
          )
        ])
      ]),
      T.value.length ? (e.openBlock(), e.createElementBlock("div", Ue, [
        e.createElementVNode("table", Ie, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(a.$t("邮箱")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(a.$t("业务员")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(a.$t("用途")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(a.$t("状态")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(a.$t("最近收取")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                Fe,
                e.toDisplayString(a.$t("累计邮件")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(a.$t("自动回复")),
                1
                /* TEXT */
              ),
              p[3] || (p[3] = e.createElementVNode(
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
              e.renderList(T.value, (y) => (e.openBlock(), e.createElementBlock("tr", {
                key: y.id
              }, [
                e.createElementVNode("td", null, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(y.label),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "div",
                    Pe,
                    e.toDisplayString(y.address),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode(
                  "td",
                  null,
                  e.toDisplayString(y.owner || "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(y.purposes, (z) => (e.openBlock(), e.createElementBlock(
                      "span",
                      {
                        key: z,
                        class: "ss-chip"
                      },
                      e.toDisplayString(_(z)),
                      1
                      /* TEXT */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("td", null, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", x(y)])
                    },
                    e.toDisplayString(I(y)),
                    3
                    /* TEXT, CLASS */
                  ),
                  y.statusDetail && y.status === "error" ? (e.openBlock(), e.createElementBlock(
                    "div",
                    Ae,
                    e.toDisplayString(y.statusDetail),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("td", null, [
                  e.createTextVNode(
                    e.toDisplayString(y.lastSyncAt ? e.unref(l.fmtDateTime)(y.lastSyncAt) : "—"),
                    1
                    /* TEXT */
                  ),
                  y.lastFetched ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Oe,
                    " · " + e.toDisplayString(a.$t("{n} 封", { n: y.lastFetched })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode(
                  "td",
                  ze,
                  e.toDisplayString(y.totalFetched || 0),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("td", null, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", y.autoReply ? "ok" : ""])
                    },
                    e.toDisplayString(y.autoReply ? a.$t("已开启") : a.$t("关闭")),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("td", qe, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    disabled: w.value === y.id,
                    onClick: (z) => X(y.id)
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(w.value === y.id ? "ri-loader-4-line spin" : "ri-download-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(a.$t("收取")),
                      1
                      /* TEXT */
                    )
                  ], 8, je),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: (z) => P(y)
                  }, [
                    p[4] || (p[4] = e.createElementVNode(
                      "i",
                      { class: "ri-edit-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(a.$t("编辑")),
                      1
                      /* TEXT */
                    )
                  ], 8, Re),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost danger",
                    onClick: (z) => J(y)
                  }, [...p[5] || (p[5] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-delete-bin-line" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, Ke)
                ])
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : (e.openBlock(), e.createElementBlock(
        "p",
        xe,
        e.toDisplayString(a.$t("还没有接管邮箱。添加至少一个邮箱后，新询盘会自动进入「新询盘处理」。")),
        1
        /* TEXT */
      )),
      e.createCommentVNode(" 添加 / 编辑：可以同时有多行，每行单独确认或删除 "),
      (e.openBlock(!0), e.createElementBlock(
        e.Fragment,
        null,
        e.renderList(U.value, (y, z) => (e.openBlock(), e.createElementBlock("div", {
          key: y.key,
          class: "ft-mb-form"
        }, [
          e.createElementVNode("div", We, [
            e.createElementVNode(
              "span",
              He,
              e.toDisplayString(y.input.id ? a.$t("编辑邮箱") : a.$t("新邮箱 {n}", { n: z + 1 })),
              1
              /* TEXT */
            ),
            y.input.address ? (e.openBlock(), e.createElementBlock(
              "span",
              Je,
              e.toDisplayString(y.input.address),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("div", Qe, [
            e.createElementVNode("label", Ge, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.$t("邮箱服务商")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("select", {
                "onUpdate:modelValue": (N) => y.input.provider = N,
                onChange: (N) => R(y)
              }, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(B.value, (N) => (e.openBlock(), e.createElementBlock("option", {
                    key: N.id,
                    value: N.id
                  }, e.toDisplayString(N.label), 9, Ye))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 40, Xe), [
                [e.vModelSelect, y.input.provider]
              ])
            ]),
            e.createElementVNode("label", Ze, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.$t("邮箱地址")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.address = N,
                type: "email",
                placeholder: "sales@yourcompany.com"
              }, null, 8, et), [
                [
                  e.vModelText,
                  y.input.address,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", tt, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(y.input.id ? a.$t("授权码（不改就留空）") : a.$t("授权码 / 应用专用密码")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.password = N,
                type: "password",
                autocomplete: "new-password"
              }, null, 8, lt), [
                [e.vModelText, y.input.password]
              ])
            ]),
            e.createElementVNode("label", nt, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.$t("显示名称")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.label = N,
                type: "text",
                placeholder: a.$t("例如：Tom 的询盘邮箱")
              }, null, 8, ot), [
                [
                  e.vModelText,
                  y.input.label,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", st, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.$t("发件人名称")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.senderName = N,
                type: "text",
                placeholder: "Tom Wang"
              }, null, 8, at), [
                [
                  e.vModelText,
                  y.input.senderName,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", it, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.$t("归属业务员")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.owner = N,
                type: "text"
              }, null, 8, rt), [
                [
                  e.vModelText,
                  y.input.owner,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ])
          ]),
          V(y) ? (e.openBlock(), e.createElementBlock("p", dt, [
            p[6] || (p[6] = e.createElementVNode(
              "i",
              { class: "ri-information-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(V(y)),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", ct, [
            e.createElementVNode("label", ut, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.$t("收信服务器（IMAP）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.imapHost = N,
                type: "text"
              }, null, 8, mt), [
                [
                  e.vModelText,
                  y.input.imapHost,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", pt, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.$t("IMAP 端口")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.imapPort = N,
                type: "number"
              }, null, 8, vt), [
                [
                  e.vModelText,
                  y.input.imapPort,
                  void 0,
                  { number: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", yt, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.$t("发信服务器（SMTP）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.smtpHost = N,
                type: "text"
              }, null, 8, Vt), [
                [
                  e.vModelText,
                  y.input.smtpHost,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("label", Nt, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(a.$t("SMTP 端口")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.smtpPort = N,
                type: "number"
              }, null, 8, Et), [
                [
                  e.vModelText,
                  y.input.smtpPort,
                  void 0,
                  { number: !0 }
                ]
              ])
            ])
          ]),
          e.createElementVNode("div", gt, [
            e.createElementVNode(
              "span",
              ht,
              e.toDisplayString(a.$t("用途：")),
              1
              /* TEXT */
            ),
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(M, (N) => e.createElementVNode("label", {
                key: N,
                class: "ft-check"
              }, [
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": (q) => y.input.purposes = q,
                  type: "checkbox",
                  value: N
                }, null, 8, ft), [
                  [e.vModelCheckbox, y.input.purposes]
                ]),
                e.createTextVNode(
                  e.toDisplayString(_(N)),
                  1
                  /* TEXT */
                )
              ])),
              64
              /* STABLE_FRAGMENT */
            )),
            p[7] || (p[7] = e.createElementVNode(
              "span",
              { class: "grow" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("label", kt, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.enabled = N,
                type: "checkbox"
              }, null, 8, bt), [
                [e.vModelCheckbox, y.input.enabled]
              ]),
              e.createTextVNode(
                e.toDisplayString(a.$t("启用接管（定时收取）")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("label", $t, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": (N) => y.input.autoReply = N,
                type: "checkbox"
              }, null, 8, Dt), [
                [e.vModelCheckbox, y.input.autoReply]
              ]),
              e.createTextVNode(
                e.toDisplayString(a.$t("新询盘自动回复（规则在「新询盘处理」里设置）")),
                1
                /* TEXT */
              )
            ])
          ]),
          y.testResult ? (e.openBlock(), e.createElementBlock("div", St, [
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", y.testResult.imap.ok ? "ok" : "bad"])
              },
              e.toDisplayString(a.$t("收信：{p0}", { p0: y.testResult.imap.message })),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode(
              "span",
              {
                class: e.normalizeClass(["ss-chip", y.testResult.smtp.ok ? "ok" : "bad"])
              },
              e.toDisplayString(a.$t("发信：{p0}", { p0: y.testResult.smtp.message })),
              3
              /* TEXT, CLASS */
            )
          ])) : e.createCommentVNode("v-if", !0),
          y.error ? (e.openBlock(), e.createElementBlock("p", _t, [
            p[8] || (p[8] = e.createElementVNode(
              "i",
              { class: "ri-error-warning-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(y.error),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", Bt, [
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm",
              disabled: y.testing || !y.input.address,
              onClick: (N) => S(y)
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(y.testing ? "ri-loader-4-line spin" : "ri-plug-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(a.$t("测试连接")),
                1
                /* TEXT */
              )
            ], 8, wt),
            p[10] || (p[10] = e.createElementVNode(
              "span",
              { class: "grow" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm ghost danger",
              disabled: y.saving,
              onClick: (N) => k(y)
            }, [
              p[9] || (p[9] = e.createElementVNode(
                "i",
                { class: "ri-delete-bin-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(y.input.id ? a.$t("取消") : a.$t("删除")),
                1
                /* TEXT */
              )
            ], 8, Ct),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm primary",
              disabled: y.saving || !y.input.address || !y.input.id && !y.input.password,
              onClick: (N) => K(y)
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(y.saving ? "ri-loader-4-line spin" : "ri-check-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(y.input.id ? a.$t("确认保存") : a.$t("确认添加")),
                1
                /* TEXT */
              )
            ], 8, Tt)
          ])
        ]))),
        128
        /* KEYED_FRAGMENT */
      ))
    ]));
  }
}), se = (H, W) => {
  const M = H.__vccOpts || H;
  for (const [B, U] of W)
    M[B] = U;
  return M;
}, Lt = /* @__PURE__ */ se(Mt, [["__scopeId", "data-v-e1d816fc"]]), Ut = { class: "ss-module" }, It = { class: "ss-panel" }, Ft = { class: "ss-muted" }, Pt = { class: "ss-actions" }, At = { class: "ft-path" }, Ot = ["disabled"], zt = {
  key: 0,
  class: "ss-panel",
  "data-test": "ft-send-rules"
}, qt = { class: "ss-muted" }, jt = { class: "ss-grid" }, Rt = { class: "ss-field" }, Kt = { class: "ss-field" }, xt = { class: "ss-field" }, Wt = { class: "ss-field" }, Ht = { class: "ss-field" }, Jt = { class: "ss-field" }, Qt = { class: "ft-check" }, Gt = { class: "ss-field" }, Xt = { class: "ss-actions" }, Yt = ["disabled"], Zt = {
  class: "ss-panel",
  "data-test": "ft-suppressions"
}, el = { class: "ss-muted" }, tl = { class: "ss-actions" }, ll = ["placeholder"], nl = ["placeholder"], ol = ["disabled"], sl = {
  key: 0,
  class: "ss-table-wrap ft-scroll"
}, al = { class: "ss-table" }, il = { class: "ft-wrap" }, rl = ["title", "onClick"], dl = {
  key: 1,
  class: "ss-muted"
}, cl = { class: "ss-subhead" }, ul = { class: "ss-table-wrap ft-scroll" }, ml = { class: "ss-table" }, pl = { class: "ft-wrap" }, vl = { class: "ft-wrap" }, yl = ["title"], Vl = {
  key: 0,
  class: "ss-muted ft-wrap"
}, Nl = {
  key: 1,
  class: "ss-panel",
  "data-test": "ft-doc-settings"
}, El = { class: "ss-muted" }, gl = { class: "ss-grid" }, hl = { class: "ss-field" }, fl = { class: "ss-field" }, kl = { class: "ss-field" }, bl = { class: "ss-field" }, $l = { class: "ss-field" }, Dl = { class: "ss-field" }, Sl = { class: "ss-field" }, _l = { class: "ss-field" }, Bl = { class: "ss-field" }, wl = { class: "ss-actions" }, Cl = ["disabled"], Tl = { class: "ss-panel" }, Ml = { class: "ss-muted" }, Ll = { class: "ss-table-wrap" }, Ul = { class: "ss-table" }, Il = ["value", "disabled", "onChange"], Fl = { value: "" }, Pl = ["label"], Al = ["value"], Ol = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(H) {
    const W = ae.useNotificationStore(), M = l.ftState, B = l.moduleMetas(), U = e.ref(""), L = e.ref(null), w = e.ref(5), A = e.ref(""), T = e.ref(null), V = e.ref(""), _ = e.ref(""), I = e.computed(() => M.value?.suppressions || []), x = e.computed(() => (M.value?.sendLog || []).slice(0, 30));
    e.watch(() => JSON.stringify(M.value?.settings.sendRules || null), () => {
      const $ = M.value?.settings.sendRules;
      L.value = $ ? { ...$ } : null, w.value = Math.round(($?.maxBounceRate ?? 0.05) * 100), A.value = ($?.extraBanned || []).join(", ");
    }, { immediate: !0 }), e.watch(() => JSON.stringify(M.value?.settings.tradeDocs || null), () => {
      const $ = M.value?.settings.tradeDocs;
      T.value = $ ? JSON.parse(JSON.stringify($)) : null;
    }, { immediate: !0 });
    function C($) {
      return { manual: o.t("手动"), unsubscribe: o.t("对方退订"), bounce: o.t("退信") }[$];
    }
    function j($) {
      return { outreach: o.t("开发信"), followup: o.t("跟进"), inquiry_reply: o.t("询盘回复"), auto_reply: o.t("自动回复"), quote: o.t("报价") }[$] || $;
    }
    function b($) {
      return { sent: o.t("已发出"), blocked: o.t("被拦下"), failed: o.t("发送失败") }[$];
    }
    async function k() {
      if (L.value) {
        U.value = "rules";
        try {
          await l.ft("settings.patch", { patch: { sendRules: { ...L.value, maxBounceRate: (Number(w.value) || 5) / 100, extraBanned: A.value.split(/[,，;；\n]+/).map(($) => $.trim()).filter(Boolean) } } }), await l.refreshState(), W.success(o.t("发信规则已保存"));
        } catch ($) {
          W.error(l.errorMessage($));
        } finally {
          U.value = "";
        }
      }
    }
    async function P() {
      try {
        await l.ft("suppression.add", { value: V.value, reason: _.value }), V.value = "", _.value = "", await l.refreshState();
      } catch ($) {
        W.error(l.errorMessage($));
      }
    }
    async function R($) {
      if (window.confirm(o.t("移出抑制名单后，这个邮箱 / 域名又能收到工作台发的信。确定吗？")))
        try {
          await l.ft("suppression.remove", { id: $ }), await l.refreshState();
        } catch (a) {
          W.error(l.errorMessage(a));
        }
    }
    async function S() {
      if (T.value) {
        U.value = "docs";
        try {
          await l.ft("settings.patch", { patch: { tradeDocs: T.value } }), await l.refreshState(), W.success(o.t("已保存"));
        } catch ($) {
          W.error(l.errorMessage($));
        } finally {
          U.value = "";
        }
      }
    }
    async function K($, a) {
      U.value = $;
      try {
        const p = { ...M.value?.settings.moduleModels || {} };
        a ? p[$] = a : delete p[$], await l.ft("settings.patch", { patch: { moduleModels: p } }), await l.refreshState();
      } catch (p) {
        W.error(l.errorMessage(p));
      } finally {
        U.value = "";
      }
    }
    async function J() {
      try {
        await l.ft("outputDir.pick") && await l.refreshState();
      } catch ($) {
        W.error(l.errorMessage($));
      }
    }
    function X($) {
      l.ft("path.open", { path: $ }).catch((a) => W.error(l.errorMessage(a)));
    }
    return ($, a) => (e.openBlock(), e.createElementBlock("div", Ut, [
      e.createVNode(Lt),
      e.createElementVNode("section", It, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            a[20] || (a[20] = e.createElementVNode(
              "i",
              { class: "ri-folder-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString($.$t("结果文件存到")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            Ft,
            e.toDisplayString($.$t("报价单、报表、产品素材、导出的文案都存在这里。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Pt, [
          e.createElementVNode(
            "code",
            At,
            e.toDisplayString(e.unref(M)?.outputDir || "—"),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            onClick: J
          }, [
            a[21] || (a[21] = e.createElementVNode(
              "i",
              { class: "ri-folder-settings-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString($.$t("更改")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            disabled: !e.unref(M)?.outputDir,
            onClick: a[0] || (a[0] = (p) => X(e.unref(M).outputDir))
          }, [
            a[22] || (a[22] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString($.$t("打开")),
              1
              /* TEXT */
            )
          ], 8, Ot)
        ])
      ]),
      e.createCommentVNode(" 发信闸门 "),
      L.value ? (e.openBlock(), e.createElementBlock("section", zt, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            a[23] || (a[23] = e.createElementVNode(
              "i",
              { class: "ri-shield-check-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString($.$t("发信规则")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            qt,
            e.toDisplayString($.$t("开发信、跟进、询盘回复、报价邮件和自动回复发出前都按这里检查；被拦下的写清原因，不会发出。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", jt, [
          e.createElementVNode("label", Rt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("每个邮箱每天最多发（封）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[1] || (a[1] = (p) => L.value.dailyLimit = p),
                type: "number",
                min: "1",
                "data-test": "ft-rule-daily"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                L.value.dailyLimit,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Kt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("开发信 / 跟进正文上限（词）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[2] || (a[2] = (p) => L.value.maxBodyWords = p),
                type: "number",
                min: "40"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                L.value.maxBodyWords,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", xt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("标题上限（字符）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[3] || (a[3] = (p) => L.value.maxSubjectLen = p),
                type: "number",
                min: "20"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                L.value.maxSubjectLen,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Wt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("开发信 / 跟进最多几个链接")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[4] || (a[4] = (p) => L.value.maxLinks = p),
                type: "number",
                min: "0"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                L.value.maxLinks,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Ht, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("退信率超过多少停发开发信（%）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[5] || (a[5] = (p) => w.value = p),
                type: "number",
                min: "1",
                max: "50"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                w.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Jt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("额外禁用词（逗号分隔）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[6] || (a[6] = (p) => A.value = p),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, A.value]
            ])
          ])
        ]),
        e.createElementVNode("label", Qt, [
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": a[7] || (a[7] = (p) => L.value.requireOptOut = p),
              type: "checkbox"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelCheckbox, L.value.requireOptOut]
          ]),
          e.createTextVNode(
            e.toDisplayString($.$t("开发信必须带退订句")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("label", Gt, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString($.$t("一键补上的退订句")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": a[8] || (a[8] = (p) => L.value.optOutLine = p),
              type: "text"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, L.value.optOutLine]
          ])
        ]),
        e.createElementVNode("div", Xt, [
          a[25] || (a[25] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            disabled: U.value === "rules",
            "data-test": "ft-rules-save",
            onClick: k
          }, [
            a[24] || (a[24] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString($.$t("保存发信规则")),
              1
              /* TEXT */
            )
          ], 8, Yt)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 抑制名单 "),
      e.createElementVNode("section", Zt, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            a[26] || (a[26] = e.createElementVNode(
              "i",
              { class: "ri-forbid-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString($.$t("抑制名单（不再发信）")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            el,
            e.toDisplayString($.$t("对方回信要求退订、邮件被退回会自动加进来；手动加入要写原因。名单里的邮箱或域名，任何发送都会被拦下。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", tl, [
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": a[9] || (a[9] = (p) => V.value = p),
            type: "text",
            class: "ft-input",
            "data-test": "ft-sup-value",
            placeholder: $.$t("邮箱或域名")
          }, null, 8, ll), [
            [
              e.vModelText,
              V.value,
              void 0,
              { trim: !0 }
            ]
          ]),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": a[10] || (a[10] = (p) => _.value = p),
            type: "text",
            class: "ft-input wide",
            "data-test": "ft-sup-reason",
            placeholder: $.$t("原因（必填）")
          }, null, 8, nl), [
            [
              e.vModelText,
              _.value,
              void 0,
              { trim: !0 }
            ]
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: !V.value || !_.value,
            "data-test": "ft-sup-add",
            onClick: P
          }, [
            a[27] || (a[27] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString($.$t("加入")),
              1
              /* TEXT */
            )
          ], 8, ol)
        ]),
        I.value.length ? (e.openBlock(), e.createElementBlock("div", sl, [
          e.createElementVNode("table", al, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString($.$t("邮箱 / 域名")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString($.$t("来源")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString($.$t("原因")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString($.$t("时间")),
                  1
                  /* TEXT */
                ),
                a[28] || (a[28] = e.createElementVNode(
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
                e.renderList(I.value, (p) => (e.openBlock(), e.createElementBlock("tr", {
                  key: p.id
                }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(p.email || `@${p.domain}`),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", p.source === "manual" ? "" : "warn"])
                      },
                      e.toDisplayString(C(p.source)),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode(
                    "td",
                    il,
                    e.toDisplayString(p.reason),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(e.unref(l.fmtDateTime)(p.at)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm ghost danger",
                      title: $.$t("移出名单"),
                      onClick: (y) => R(p.id)
                    }, [...a[29] || (a[29] = [
                      e.createElementVNode(
                        "i",
                        { class: "ri-delete-bin-line" },
                        null,
                        -1
                        /* CACHED */
                      )
                    ])], 8, rl)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          dl,
          e.toDisplayString($.$t("名单是空的")),
          1
          /* TEXT */
        )),
        x.value.length ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 2 },
          [
            e.createElementVNode(
              "div",
              cl,
              e.toDisplayString($.$t("最近的发送记录")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", ul, [
              e.createElementVNode("table", ml, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString($.$t("时间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString($.$t("类型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString($.$t("收件人")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString($.$t("标题")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString($.$t("结果")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(x.value, (p) => (e.openBlock(), e.createElementBlock("tr", {
                      key: p.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(l.fmtDateTime)(p.at)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(j(p.kind)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        pl,
                        e.toDisplayString(p.to.join(", ")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        vl,
                        e.toDisplayString(p.subject),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("span", {
                          class: e.normalizeClass(["ss-chip", p.status === "sent" ? "ok" : p.status === "blocked" ? "warn" : "bad"]),
                          title: p.reason || ""
                        }, e.toDisplayString(b(p.status)), 11, yl),
                        p.reason ? (e.openBlock(), e.createElementBlock(
                          "div",
                          Vl,
                          e.toDisplayString(p.reason),
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
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      e.createCommentVNode(" 单据抬头与银行 "),
      T.value ? (e.openBlock(), e.createElementBlock("section", Nl, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            a[30] || (a[30] = e.createElementVNode(
              "i",
              { class: "ri-bank-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString($.$t("单据抬头与银行")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            El,
            e.toDisplayString($.$t("生成 PI / 商业发票 / 装箱单时默认带出，订单里还可以逐单改。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", gl, [
          e.createElementVNode("label", hl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("公司英文名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[11] || (a[11] = (p) => T.value.seller.name = p),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, T.value.seller.name]
            ])
          ]),
          e.createElementVNode("label", fl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("公司英文地址")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[12] || (a[12] = (p) => T.value.seller.address = p),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, T.value.seller.address]
            ])
          ]),
          e.createElementVNode("label", kl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("收款银行")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[13] || (a[13] = (p) => T.value.bank.name = p),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, T.value.bank.name]
            ])
          ]),
          e.createElementVNode("label", bl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("账户名")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[14] || (a[14] = (p) => T.value.bank.accountName = p),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, T.value.bank.accountName]
            ])
          ]),
          e.createElementVNode("label", $l, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("账号")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[15] || (a[15] = (p) => T.value.bank.accountNo = p),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, T.value.bank.accountNo]
            ])
          ]),
          e.createElementVNode("label", Dl, [
            a[31] || (a[31] = e.createElementVNode(
              "span",
              null,
              "SWIFT",
              -1
              /* CACHED */
            )),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[16] || (a[16] = (p) => T.value.bank.swift = p),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, T.value.bank.swift]
            ])
          ]),
          e.createElementVNode("label", Sl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("默认付款方式")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[17] || (a[17] = (p) => T.value.payment = p),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, T.value.payment]
            ])
          ]),
          e.createElementVNode("label", _l, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("默认起运港")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[18] || (a[18] = (p) => T.value.portOfLoading = p),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, T.value.portOfLoading]
            ])
          ]),
          e.createElementVNode("label", Bl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("默认计价方式")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": a[19] || (a[19] = (p) => T.value.priceUnit = p),
                type: "text",
                placeholder: "USD/PCS"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, T.value.priceUnit]
            ])
          ])
        ]),
        e.createElementVNode("div", wl, [
          a[33] || (a[33] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            disabled: U.value === "docs",
            onClick: S
          }, [
            a[32] || (a[32] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString($.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, Cl)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("section", Tl, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            a[34] || (a[34] = e.createElementVNode(
              "i",
              { class: "ri-cpu-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString($.$t("各模块使用的模型")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            Ml,
            e.toDisplayString($.$t("每个模块单独指定；不指定就用系统默认模型（{p0}）。各模块页面顶部也能改。", { p0: e.unref(l.ftModels).defaultLabel || $.$t("未配置") })),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ll, [
          e.createElementVNode("table", Ul, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString($.$t("模块")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString($.$t("使用模型")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(B), (p) => (e.openBlock(), e.createElementBlock("tr", {
                  key: p.key
                }, [
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(p.icon)
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      " " + e.toDisplayString(p.title),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("select", {
                      value: e.unref(M)?.settings.moduleModels[p.key] || "",
                      disabled: U.value === p.key,
                      onChange: (y) => K(p.key, y.target.value)
                    }, [
                      e.createElementVNode(
                        "option",
                        Fl,
                        e.toDisplayString($.$t("跟随系统默认（{p0}）", { p0: e.unref(l.ftModels).defaultLabel || $.$t("未配置") })),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(l.modelGroups)(), (y) => (e.openBlock(), e.createElementBlock("optgroup", {
                          key: y.group,
                          label: y.group
                        }, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(y.options, (z) => (e.openBlock(), e.createElementBlock("option", {
                              key: z.value,
                              value: z.value
                            }, e.toDisplayString(z.label), 9, Al))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 8, Pl))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 40, Il)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ])
    ]));
  }
}), zl = /* @__PURE__ */ se(Ol, [["__scopeId", "data-v-b63bea22"]]), ve = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!ve) throw new Error("宿主模块未就绪：npm:vue-router");
ve.default;
const be = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!be) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const Q = be.default, $e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!$e) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const ie = $e.default, le = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!le) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
le.default;
const ql = {
  platform: ["ft-platform-master", "ft-platform", "ft-ecom-listing-creative", "ft-ecommerce-master", "ft-amazon-sp-listing-troubleshooter"],
  prospect: ["ft-prospect-master", "ft-buyer-market-intel", "ft-icp-fit-scoring", "ft-cold-email-frameworks", "ft-outbound-send-gate", "ft-google-maps-leads"],
  inquiry: ["ft-inquiry-master", "ft-reply-triage-unsubscribe", "ft-objection-handling", "ft-inquiry-training"],
  background: ["ft-background-master", "ft-sanctions-screening", "ft-export-control-check", "ft-trade-osint-redflag-scoring", "ft-customer-background-research"],
  followup: ["ft-followup-master", "ft-trade-follow-up", "ft-daily-followup-review", "ft-outbound-send-gate"],
  content: ["ft-content-master", "ft-product-description", "ft-short-video", "ft-ecom-product-image"],
  social: ["ft-social-master", "ft-social-media", "ft-seo-aeo", "ft-b2b-website-builder"],
  quote: ["ft-quote-master", "ft-rfq-to-quotation", "ft-hs-code-lookup", "ft-hs-code-classify", "ft-tariff-calculator-amazon"],
  order: ["ft-order-master", "ft-trade-docs-run", "ft-verify-trade-docs", "ft-customs-declaration-tools"],
  report: ["ft-report-master", "ft-comtrade-market-data", "ft-market-analysis", "ft-inquiry-meeting"]
}, jl = {
  platform: "sales-cross-border-ecommerce-operator",
  prospect: "sales-foreign-trade-rep",
  inquiry: "sales-foreign-trade-rep",
  background: "legal-trade-compliance-specialist",
  followup: "sales-foreign-trade-rep",
  content: "sales-cross-border-ecommerce-operator",
  social: "sales-cross-border-ecommerce-operator",
  quote: "sales-foreign-trade-rep",
  order: "supply-chain-trade-documentation-specialist",
  report: "sales-foreign-trade-rep"
}, Rl = { class: "ft-mhead" }, Kl = { class: "ft-mhead__main" }, xl = { class: "ft-mhead__split" }, Wl = { class: "ss-chip brand" }, Hl = { class: "ss-chip" }, Jl = {
  key: 0,
  class: "ft-mhead__skills"
}, Ql = ["disabled", "title", "onClick"], Gl = ["title"], Xl = ["value", "disabled"], Yl = { value: "" }, Zl = ["label"], en = ["value"], tn = ["value"], ln = /* @__PURE__ */ e.defineComponent({
  __name: "ModuleHeader",
  props: {
    meta: {}
  },
  setup(H) {
    const W = H, M = ae.useNotificationStore(), B = ve.useRouter(), U = e.ref(!1), L = e.ref(!1), w = e.computed(() => l.ftState.value?.settings.moduleModels[W.meta.key] || ""), A = e.computed(() => ql[W.meta.key] || []);
    async function T(_) {
      L.value = !0;
      try {
        const x = await window.electronAPI.conversation.create({ kind: "single", members: [jl[W.meta.key]], title: o.t("外贸 · {p0}", { p0: W.meta.title }) });
        await B.push({ path: "/conversations", query: { id: x.id, draft: o.t("请用技能 {p0}（技能库 foreign-trade 分类）帮我：", { p0: _ }) } });
      } catch (I) {
        M.error(l.errorMessage(I));
      } finally {
        L.value = !1;
      }
    }
    async function V(_) {
      U.value = !0;
      try {
        const I = { ...l.ftState.value?.settings.moduleModels || {}, [W.meta.key]: _ };
        _ || delete I[W.meta.key], await l.ft("settings.patch", { patch: { moduleModels: I } }), await l.refreshState();
      } catch (I) {
        M.error(l.errorMessage(I));
      } finally {
        U.value = !1;
      }
    }
    return (_, I) => (e.openBlock(), e.createElementBlock("section", Rl, [
      e.createElementVNode("div", Kl, [
        e.createElementVNode("h2", null, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(H.meta.icon)
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(H.meta.title),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", xl, [
          e.createElementVNode("span", null, [
            e.createElementVNode(
              "em",
              Wl,
              e.toDisplayString(_.$t("数字员工完成")),
              1
              /* TEXT */
            ),
            e.createTextVNode(
              e.toDisplayString(H.meta.agentDoes),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", null, [
            e.createElementVNode(
              "em",
              Hl,
              e.toDisplayString(_.$t("业务人员负责")),
              1
              /* TEXT */
            ),
            e.createTextVNode(
              e.toDisplayString(H.meta.humanDoes),
              1
              /* TEXT */
            )
          ])
        ]),
        A.value.length ? (e.openBlock(), e.createElementBlock("div", Jl, [
          e.createElementVNode("small", null, [
            I[1] || (I[1] = e.createElementVNode(
              "i",
              { class: "ri-book-open-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(_.$t("相关技能")),
              1
              /* TEXT */
            )
          ]),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(A.value, (x) => (e.openBlock(), e.createElementBlock("button", {
              key: x,
              type: "button",
              class: "ss-chip",
              disabled: L.value,
              title: _.$t("和外贸专家开一个对话，用技能 {p0} 来做", { p0: x }),
              onClick: (C) => T(x)
            }, e.toDisplayString(x), 9, Ql))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("label", {
        class: "ft-mhead__model",
        title: _.$t("本模块所有生成、提取、分类都用这个模型；结果上会标明是哪个模型产出的")
      }, [
        e.createElementVNode("small", null, [
          I[2] || (I[2] = e.createElementVNode(
            "i",
            { class: "ri-cpu-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(_.$t("本模块使用模型")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("select", {
          value: w.value,
          disabled: U.value,
          onChange: I[0] || (I[0] = (x) => V(x.target.value))
        }, [
          e.createElementVNode(
            "option",
            Yl,
            e.toDisplayString(_.$t("跟随系统默认（{p0}）", { p0: e.unref(l.ftModels).defaultLabel || _.$t("未配置") })),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(l.modelGroups)(), (x) => (e.openBlock(), e.createElementBlock("optgroup", {
              key: x.group,
              label: x.group
            }, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(x.options, (C) => (e.openBlock(), e.createElementBlock("option", {
                  key: C.value,
                  value: C.value
                }, e.toDisplayString(C.label), 9, en))),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 8, Zl))),
            128
            /* KEYED_FRAGMENT */
          )),
          w.value && !e.unref(l.ftModels).options.some((x) => x.value === w.value) ? (e.openBlock(), e.createElementBlock("option", {
            key: 0,
            value: w.value
          }, e.toDisplayString(w.value), 9, tn)) : e.createCommentVNode("v-if", !0)
        ], 40, Xl)
      ], 8, Gl)
    ]));
  }
}), re = /* @__PURE__ */ se(ln, [["__scopeId", "data-v-ee886dd5"]]), nn = { class: "ss-module" }, on = { class: "ss-rules" }, sn = { class: "ss-rule-row" }, an = { class: "lbl" }, rn = ["onClick"], dn = { class: "ss-grid" }, cn = { class: "ss-field" }, un = { class: "ss-field" }, mn = { class: "ss-field" }, pn = { class: "ss-actions" }, vn = { class: "ss-steps" }, yn = { class: "ss-actions" }, Vn = { class: "ss-muted" }, Nn = { class: "ss-note info" }, En = { class: "ss-actions" }, gn = ["disabled"], hn = {
  key: 0,
  class: "ss-muted"
}, fn = {
  key: 0,
  class: "ss-kpis"
}, kn = { class: "ss-kpi" }, bn = { class: "ss-kpi" }, $n = { class: "ss-kpi" }, Dn = { class: "ss-kpi accent" }, Sn = {
  key: 1,
  class: "ss-table-wrap ft-scroll"
}, _n = { class: "ss-table" }, Bn = ["checked"], wn = { class: "num" }, Cn = { class: "num" }, Tn = { class: "num" }, Mn = ["value"], Ln = { class: "ft-wrap" }, Un = { class: "num" }, In = { class: "num" }, Fn = { class: "num" }, Pn = { class: "ft-wrap" }, An = ["title"], On = {
  key: 0,
  class: "ss-chip ok"
}, zn = {
  key: 2,
  class: "ss-muted"
}, qn = { class: "ss-actions" }, jn = ["disabled"], Rn = {
  key: 0,
  class: "ss-muted"
}, Kn = { class: "ft-sugg__row" }, xn = { class: "ss-muted" }, Wn = { class: "ft-sugg__row" }, Hn = { class: "ss-muted" }, Jn = { class: "ft-sugg__row" }, Qn = { class: "ss-muted" }, Gn = { class: "ft-sugg__row" }, Xn = { class: "ss-muted" }, Yn = {
  key: 0,
  class: "ft-sugg__row",
  "data-test": "ft-title-lint"
}, Zn = { class: "ss-muted" }, eo = ["title"], to = { class: "ss-actions" }, lo = { class: "ss-muted" }, no = {
  key: 0,
  class: "ss-chip ok"
}, oo = ["onClick"], so = { class: "ss-note info" }, ao = { class: "ft-wrap" }, io = ["onClick"], ro = ["onClick"], co = ["onClick"], uo = ["onClick"], mo = {
  key: 2,
  class: "ss-chip ok"
}, po = {
  key: 0,
  class: "ss-muted"
}, vo = { class: "ss-field" }, yo = { value: "" }, Vo = ["value"], No = {
  key: 0,
  class: "ss-muted"
}, Eo = { class: "ss-note info" }, go = { class: "ss-actions" }, ho = ["disabled"], fo = {
  key: 1,
  class: "ss-table-wrap"
}, ko = { class: "ss-table" }, bo = { class: "ft-wrap" }, $o = ["onClick"], Do = /* @__PURE__ */ e.defineComponent({
  __name: "PlatformTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(H) {
    const W = H, M = ve.useRouter(), B = ae.useNotificationStore(), U = l.ftState, L = [
      { name: "Alibaba.com", url: "https://i.alibaba.com", publishUrl: "https://post.alibaba.com/product/publish.htm" },
      { name: "Made-in-China", url: "https://membercenter.made-in-china.com", publishUrl: "https://membercenter.made-in-china.com" },
      { name: "Global Sources", url: "https://supplier.globalsources.com", publishUrl: "https://supplier.globalsources.com" }
    ], w = e.reactive({ name: "", url: "", publishUrl: "" });
    e.watch(() => U.value?.settings.platform, (n) => {
      n && Object.assign(w, n);
    }, { immediate: !0 });
    const A = e.computed(() => U.value?.listings || []), T = e.computed(() => A.value.filter((n) => n.issues.some((s) => s.level === "bad")).length), V = e.computed(() => A.value.filter((n) => n.issues.length && !n.issues.some((s) => s.level === "bad")).length), _ = e.computed(() => A.value.filter((n) => n.suggestion)), I = e.computed(() => A.value.filter((n) => n.suggestion && n.status !== "pending")), x = e.computed(() => (U.value?.contents || []).filter((n) => n.status === "approved").slice().sort((n, s) => +(s.kind === "product_listing") - +(n.kind === "product_listing"))), C = e.computed(() => (U.value?.publishJobs || []).filter((n) => n.kind === "platform_product")), j = e.ref([]), b = e.ref(""), k = e.ref(!1), P = e.ref(""), R = e.ref({}), S = e.computed(() => A.value.length > 0 && j.value.length === A.value.length);
    e.watch(() => W.focus?.contentId, (n) => {
      n && (b.value = n, le.scrollToStep("publish"));
    }, { immediate: !0 });
    const K = [
      { key: "open", title: o.t("打开平台后台"), hint: o.t("用内置浏览器登录平台，登录状态保存在本机") },
      { key: "import", title: o.t("导入商品数据"), hint: o.t("从后台导出商品列表与数据，放进来") },
      { key: "diagnose", title: o.t("链接诊断"), hint: o.t("按固定规则检查标题、关键词、图片、详情、属性与转化") },
      { key: "suggest", title: o.t("生成修改稿"), hint: o.t("为选中商品写新标题和关键词，人审核通过") },
      { key: "apply", title: o.t("更新到平台"), hint: o.t("在后台逐条修改后标记已更新") },
      { key: "publish", title: o.t("发布新产品"), hint: o.t("交给数字员工按素材在平台发布，提交前由你确认") }
    ], J = e.computed(() => {
      const n = (s, t, i) => P.value === s ? { state: "running" } : R.value[s] ? { state: "failed", error: R.value[s] } : t ? { state: "done", summary: i } : { state: "todo" };
      return {
        open: n("open", k.value || A.value.length > 0),
        import: n("import", A.value.length > 0, o.t("{n} 个商品", { n: A.value.length })),
        diagnose: n("diagnose", A.value.length > 0, o.t("{a} 个严重、{b} 个待改进", { a: T.value, b: V.value })),
        suggest: n("suggest", _.value.length > 0, o.t("{n} 条修改稿", { n: _.value.length })),
        apply: n("apply", I.value.some((s) => s.status === "applied"), o.t("{n} 条已更新", { n: I.value.filter((s) => s.status === "applied").length })),
        publish: n("publish", C.value.length > 0, o.t("{n} 次", { n: C.value.length }))
      };
    }), X = e.computed(() => K.find((n) => J.value[n.key].state !== "done")?.key || "publish");
    async function $(n, s) {
      P.value = n, R.value = { ...R.value, [n]: "" }, le.scrollToStep(n);
      try {
        return await s(), await l.refreshState(), !0;
      } catch (t) {
        return R.value = { ...R.value, [n]: l.errorMessage(t) }, !1;
      } finally {
        P.value = "";
      }
    }
    function a(n) {
      return (U.value?.contents || []).find((s) => s.id === n)?.title || n;
    }
    function p(n) {
      Object.assign(w, n);
    }
    async function y() {
      try {
        await l.ft("settings.patch", { patch: { platform: { ...w } } }), await l.refreshState(), B.success(o.t("已保存"));
      } catch (n) {
        B.error(l.errorMessage(n));
      }
    }
    async function z(n) {
      await le.openEmbeddedBrowser(n, "foreign-trade-platform") || B.error(o.t("内置浏览器不可用"));
    }
    async function N() {
      if (!w.url) {
        B.warn(o.t("请先填写平台后台地址"));
        return;
      }
      await z(w.url), k.value = !0;
    }
    async function q() {
      const n = await l.ft("files.pick", { filters: [{ name: "Excel / CSV", extensions: ["xlsx", "xls", "csv"] }] });
      if (!n[0]) return;
      await $("import", async () => {
        const t = await l.ft("listing.import", { path: n[0] });
        j.value = [], B.success(o.t("已导入 {n} 个商品", { n: t.count }));
      }) || B.error(R.value.import);
    }
    function E() {
      j.value = S.value ? [] : A.value.map((n) => n.id);
    }
    function m() {
      j.value = A.value.filter((n) => n.issues.length).map((n) => n.id);
    }
    async function h() {
      await $("suggest", () => l.ft("listing.suggest", { ids: j.value }));
    }
    async function O(n, s) {
      try {
        await l.ft("listing.update", { id: n, patch: { status: s } }), await l.refreshState();
      } catch (t) {
        B.error(l.errorMessage(t));
      }
    }
    async function Z(n) {
      try {
        await navigator.clipboard.writeText(n), B.success(o.t("已复制"));
      } catch {
        B.error(o.t("复制失败"));
      }
    }
    async function c() {
      const n = x.value.find((t) => t.id === b.value);
      if (!n) return;
      await $("publish", async () => {
        const t = await l.ft("publish.instruction", { contentId: n.id, kind: "platform_product", channel: w.name }), i = window.electronAPI, D = await i.conversation.create({ kind: "single", members: ["general_assistant"], title: o.t("在 {p0} 发布：{p1}", { p0: w.name, p1: n.title.slice(0, 30) }), initialMessage: t });
        i.conversation.sendMessage(D.id, t), await l.ft("publish.record", { contentId: n.id, kind: "platform_product", channel: w.name, conversationId: D.id });
      }) && B.success(o.t("已交给数字员工，点击「查看执行过程」可以看它操作；提交前会请你确认"));
    }
    function F(n) {
      le.scrollToStep(n);
    }
    return (n, s) => (e.openBlock(), e.createElementBlock("div", nn, [
      e.createVNode(re, { meta: H.meta }, null, 8, ["meta"]),
      e.createElementVNode("section", on, [
        e.createElementVNode("h4", null, [
          s[6] || (s[6] = e.createElementVNode(
            "i",
            { class: "ri-store-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("平台设置")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", sn, [
          e.createElementVNode(
            "span",
            an,
            e.toDisplayString(n.$t("常用平台：")),
            1
            /* TEXT */
          ),
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(L, (t) => e.createElementVNode("button", {
              key: t.name,
              type: "button",
              class: "ss-btn sm ghost",
              onClick: (i) => p(t)
            }, e.toDisplayString(t.name), 9, rn)),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        e.createElementVNode("div", dn, [
          e.createElementVNode("label", cn, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(n.$t("平台名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": s[0] || (s[0] = (t) => w.name = t),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, w.name]
            ])
          ]),
          e.createElementVNode("label", un, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(n.$t("后台地址")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": s[1] || (s[1] = (t) => w.url = t),
                type: "url"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, w.url]
            ])
          ]),
          e.createElementVNode("label", mn, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(n.$t("发布产品页地址")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": s[2] || (s[2] = (t) => w.publishUrl = t),
                type: "url"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, w.publishUrl]
            ])
          ])
        ]),
        e.createElementVNode("div", pn, [
          s[8] || (s[8] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            onClick: y
          }, [
            s[7] || (s[7] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("保存")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createVNode(ie, {
        title: n.$t("平台运营"),
        metas: K,
        runtime: J.value,
        "current-key": X.value,
        onJump: F
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", vn, [
        e.createVNode(Q, {
          "step-key": "open",
          index: 0,
          title: K[0].title,
          hint: K[0].hint,
          runtime: J.value.open
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", yn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                onClick: N
              }, [
                s[9] || (s[9] = e.createElementVNode(
                  "i",
                  { class: "ri-window-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("在内置浏览器打开 {p0} 后台", { p0: w.name || n.$t("平台") })),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode(
                "span",
                Vn,
                e.toDisplayString(n.$t("第一次需要你在内置浏览器里登录一次，之后登录状态会保留在本机。")),
                1
                /* TEXT */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "import",
          index: 1,
          title: K[1].title,
          hint: K[1].hint,
          runtime: J.value.import
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", Nn, [
              s[10] || (s[10] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("在平台后台的商品管理 / 数据管家里导出商品列表（含标题、关键词、图片数、曝光、点击、询盘等列），把导出的 Excel 放进来。列名不用完全一致，会自动识别。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", En, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: P.value === "import",
                onClick: q
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(P.value === "import" ? "ri-loader-4-line spin" : "ri-file-excel-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(n.$t("选择商品数据表")),
                  1
                  /* TEXT */
                )
              ], 8, gn),
              A.value.length ? (e.openBlock(), e.createElementBlock(
                "span",
                hn,
                e.toDisplayString(n.$t("已导入 {n} 个商品", { n: A.value.length })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "diagnose",
          index: 2,
          title: K[2].title,
          hint: K[2].hint,
          runtime: J.value.diagnose
        }, {
          default: e.withCtx(() => [
            A.value.length ? (e.openBlock(), e.createElementBlock("div", fn, [
              e.createElementVNode("div", kn, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(n.$t("商品数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(A.value.length),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", bn, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(n.$t("有严重问题")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(T.value),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", $n, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(n.$t("需要改进")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(V.value),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", Dn, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(n.$t("没有问题")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(A.value.length - T.value - V.value),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            A.value.length ? (e.openBlock(), e.createElementBlock("div", Sn, [
              e.createElementVNode("table", _n, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode("th", null, [
                      e.createElementVNode("input", {
                        type: "checkbox",
                        checked: S.value,
                        onChange: E
                      }, null, 40, Bn)
                    ]),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("标题")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      wn,
                      e.toDisplayString(n.$t("曝光")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Cn,
                      e.toDisplayString(n.$t("点击")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Tn,
                      e.toDisplayString(n.$t("询盘")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("问题")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(A.value, (t) => (e.openBlock(), e.createElementBlock("tr", {
                      key: t.id
                    }, [
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": s[3] || (s[3] = (i) => j.value = i),
                          type: "checkbox",
                          value: t.id
                        }, null, 8, Mn), [
                          [e.vModelCheckbox, j.value]
                        ])
                      ]),
                      e.createElementVNode(
                        "td",
                        Ln,
                        e.toDisplayString(t.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Un,
                        e.toDisplayString(t.exposure ?? "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        In,
                        e.toDisplayString(t.clicks ?? "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Fn,
                        e.toDisplayString(t.inquiries ?? "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", Pn, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(t.issues, (i) => (e.openBlock(), e.createElementBlock("span", {
                            key: i.rule,
                            class: e.normalizeClass(["ss-chip", i.level === "bad" ? "bad" : "warn"]),
                            title: i.message
                          }, e.toDisplayString(i.message), 11, An))),
                          128
                          /* KEYED_FRAGMENT */
                        )),
                        t.issues.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                          "span",
                          On,
                          e.toDisplayString(n.$t("正常")),
                          1
                          /* TEXT */
                        ))
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              zn,
              e.toDisplayString(n.$t("先导入商品数据")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "suggest",
          index: 3,
          title: K[3].title,
          hint: K[3].hint,
          runtime: J.value.suggest
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", qn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !j.value.length || P.value === "suggest",
                onClick: h
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(P.value === "suggest" ? "ri-loader-4-line spin" : "ri-lightbulb-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(n.$t("为选中的 {n} 个商品生成修改稿", { n: j.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, jn),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: m
                },
                e.toDisplayString(n.$t("只选有问题的")),
                1
                /* TEXT */
              )
            ]),
            P.value === "suggest" && e.unref(l.ftProgress).platform ? (e.openBlock(), e.createElementBlock(
              "p",
              Rn,
              e.toDisplayString(e.unref(l.ftProgress).platform),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(_.value, (t) => (e.openBlock(), e.createElementBlock("div", {
                key: t.id,
                class: "ft-sugg"
              }, [
                e.createElementVNode("div", Kn, [
                  e.createElementVNode(
                    "span",
                    xn,
                    e.toDisplayString(n.$t("原标题")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.title),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Wn, [
                  e.createElementVNode(
                    "span",
                    Hn,
                    e.toDisplayString(n.$t("新标题")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(t.suggestion.title),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Jn, [
                  e.createElementVNode(
                    "span",
                    Qn,
                    e.toDisplayString(n.$t("关键词")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.suggestion.keywords.join(", ")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", Gn, [
                  e.createElementVNode(
                    "span",
                    Xn,
                    e.toDisplayString(n.$t("改动说明")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(t.suggestion.reason),
                    1
                    /* TEXT */
                  )
                ]),
                t.suggestion.issues?.length ? (e.openBlock(), e.createElementBlock("div", Yn, [
                  e.createElementVNode(
                    "span",
                    Zn,
                    e.toDisplayString(n.$t("标题检查")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("span", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(t.suggestion.issues, (i) => (e.openBlock(), e.createElementBlock("span", {
                        key: i.rule,
                        class: e.normalizeClass(["ss-chip", i.level === "bad" ? "bad" : "warn"]),
                        title: i.message
                      }, e.toDisplayString(i.message), 11, eo))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", to, [
                  e.createElementVNode(
                    "span",
                    lo,
                    e.toDisplayString(n.$t("由 {p0} 生成", { p0: e.unref(l.modelLabel)(t.suggestion.model) })),
                    1
                    /* TEXT */
                  ),
                  s[12] || (s[12] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  t.status !== "pending" ? (e.openBlock(), e.createElementBlock(
                    "span",
                    no,
                    e.toDisplayString(t.status === "applied" ? n.$t("已更新到平台") : n.$t("已通过")),
                    1
                    /* TEXT */
                  )) : (e.openBlock(), e.createElementBlock("button", {
                    key: 1,
                    type: "button",
                    class: "ss-btn sm primary",
                    onClick: (i) => O(t.id, "approved")
                  }, [
                    s[11] || (s[11] = e.createElementVNode(
                      "i",
                      { class: "ri-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("通过")),
                      1
                      /* TEXT */
                    )
                  ], 8, oo))
                ])
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "apply",
          index: 4,
          title: K[4].title,
          hint: K[4].hint,
          runtime: J.value.apply
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", so, [
              s[13] || (s[13] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("逐条复制新标题和关键词，到平台后台对应商品里修改保存，然后在这里标记「已更新」。")),
                1
                /* TEXT */
              )
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(I.value, (t) => (e.openBlock(), e.createElementBlock("div", {
                key: t.id,
                class: "ft-apply"
              }, [
                e.createElementVNode(
                  "span",
                  ao,
                  e.toDisplayString(t.suggestion.title),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm ghost",
                  onClick: (i) => Z(t.suggestion.title)
                }, [
                  s[14] || (s[14] = e.createElementVNode(
                    "i",
                    { class: "ri-file-copy-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("复制标题")),
                    1
                    /* TEXT */
                  )
                ], 8, io),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm ghost",
                  onClick: (i) => Z(t.suggestion.keywords.join(", "))
                }, [
                  s[15] || (s[15] = e.createElementVNode(
                    "i",
                    { class: "ri-file-copy-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("复制关键词")),
                    1
                    /* TEXT */
                  )
                ], 8, ro),
                t.url ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  type: "button",
                  class: "ss-btn sm ghost",
                  onClick: (i) => z(t.url)
                }, [
                  s[16] || (s[16] = e.createElementVNode(
                    "i",
                    { class: "ri-external-link-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("打开商品")),
                    1
                    /* TEXT */
                  )
                ], 8, co)) : e.createCommentVNode("v-if", !0),
                t.status !== "applied" ? (e.openBlock(), e.createElementBlock("button", {
                  key: 1,
                  type: "button",
                  class: "ss-btn sm primary",
                  onClick: (i) => O(t.id, "applied")
                }, [
                  s[17] || (s[17] = e.createElementVNode(
                    "i",
                    { class: "ri-check-double-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("已更新")),
                    1
                    /* TEXT */
                  )
                ], 8, uo)) : (e.openBlock(), e.createElementBlock(
                  "span",
                  mo,
                  e.toDisplayString(n.$t("已更新到平台")),
                  1
                  /* TEXT */
                ))
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            I.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              po,
              e.toDisplayString(n.$t("还没有通过的修改稿")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "publish",
          index: 5,
          title: K[5].title,
          hint: K[5].hint,
          runtime: J.value.publish
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("label", vo, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(n.$t("要发布的产品素材（在「内容生产」定稿的内容）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": s[4] || (s[4] = (t) => b.value = t)
                },
                [
                  e.createElementVNode(
                    "option",
                    yo,
                    e.toDisplayString(n.$t("请选择")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(x.value, (t) => (e.openBlock(), e.createElementBlock("option", {
                      key: t.id,
                      value: t.id
                    }, e.toDisplayString(n.$t("{p0}（{a} 图 / {b} 视频）", { p0: t.title, a: t.images.length, b: t.videos.length })), 9, Vo))),
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
            x.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", No, [
              e.createTextVNode(
                e.toDisplayString(n.$t("还没有定稿的产品素材。")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: s[5] || (s[5] = (t) => n.$emit("goto", "content", {}))
                },
                e.toDisplayString(n.$t("去内容生产")),
                1
                /* TEXT */
              )
            ])),
            e.createElementVNode("p", Eo, [
              s[18] || (s[18] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("数字员工会在内置浏览器里打开 {p0} 的发布页，按素材填写标题、关键词、描述并上传图片和视频；点击最终「提交」前会停下来请你确认。", { p0: w.name || n.$t("平台") })),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", go, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !b.value || P.value === "publish",
                onClick: c
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(P.value === "publish" ? "ri-loader-4-line spin" : "ri-robot-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(n.$t("交给数字员工发布")),
                  1
                  /* TEXT */
                )
              ], 8, ho)
            ]),
            C.value.length ? (e.openBlock(), e.createElementBlock("div", fo, [
              e.createElementVNode("table", ko, [
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
                      e.toDisplayString(n.$t("平台")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("产品")),
                      1
                      /* TEXT */
                    ),
                    s[19] || (s[19] = e.createElementVNode(
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
                    e.renderList(C.value, (t) => (e.openBlock(), e.createElementBlock("tr", {
                      key: t.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(l.fmtDateTime)(t.at)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(t.channel),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        bo,
                        e.toDisplayString(a(t.contentId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        t.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-btn sm ghost",
                          onClick: (i) => e.unref(M).push(`/conversations/${t.conversationId}`)
                        }, [
                          s[20] || (s[20] = e.createElementVNode(
                            "i",
                            { class: "ri-eye-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(n.$t("查看执行过程")),
                            1
                            /* TEXT */
                          )
                        ], 8, $o)) : e.createCommentVNode("v-if", !0)
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
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), So = /* @__PURE__ */ se(Do, [["__scopeId", "data-v-56db1ea0"]]), _o = { class: "ft-gate__head" }, Bo = {
  key: 0,
  class: "ss-muted"
}, wo = ["data-rule"], Co = /* @__PURE__ */ e.defineComponent({
  __name: "GateIssues",
  props: {
    result: {},
    optOutLine: {},
    hideQuota: { type: Boolean }
  },
  emits: ["fix-opt-out"],
  setup(H) {
    const W = H, M = e.computed(() => (W.result?.issues || []).filter((U) => U.level === "block")), B = e.computed(() => (W.result?.issues || []).filter((U) => U.level === "warn"));
    return (U, L) => H.result && H.result.issues.length ? (e.openBlock(), e.createElementBlock(
      "div",
      {
        key: 0,
        class: e.normalizeClass(["ft-gate", { blocked: !H.result.ok }]),
        "data-test": "ft-gate"
      },
      [
        e.createElementVNode("div", _o, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(H.result.ok ? "ri-information-line" : "ri-forbid-2-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(H.result.ok ? U.$t("发送前检查：可以发，有 {n} 处提醒", { n: B.value.length }) : U.$t("发送前检查：被拦下，{n} 处要先改", { n: M.value.length })),
            1
            /* TEXT */
          ),
          H.hideQuota ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "span",
            Bo,
            e.toDisplayString(U.$t("今天这个邮箱已发 {a} / {b} 封", { a: H.result.sentToday, b: H.result.dailyLimit })),
            1
            /* TEXT */
          ))
        ]),
        e.createElementVNode("ul", null, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(H.result.issues, (w, A) => (e.openBlock(), e.createElementBlock("li", {
              key: A,
              class: e.normalizeClass(w.level),
              "data-rule": w.rule
            }, [
              e.createElementVNode(
                "span",
                {
                  class: e.normalizeClass(["ss-chip", w.level === "block" ? "bad" : "warn"])
                },
                e.toDisplayString(w.level === "block" ? U.$t("拦截") : U.$t("提醒")),
                3
                /* TEXT, CLASS */
              ),
              e.createTextVNode(
                " " + e.toDisplayString(w.message) + " ",
                1
                /* TEXT */
              ),
              w.rule === "no_opt_out" && H.optOutLine ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: L[0] || (L[0] = (T) => U.$emit("fix-opt-out", H.optOutLine))
                },
                e.toDisplayString(U.$t("补上退订句")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ], 10, wo))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ],
      2
      /* CLASS */
    )) : e.createCommentVNode("v-if", !0);
  }
}), pe = /* @__PURE__ */ se(Co, [["__scopeId", "data-v-53546b28"]]), To = { class: "ss-module" }, Mo = { class: "ss-rules" }, Lo = { class: "ss-grid" }, Uo = { class: "ss-field" }, Io = { class: "ss-field" }, Fo = { class: "ss-field" }, Po = { class: "ss-field" }, Ao = { class: "ss-field" }, Oo = ["placeholder"], zo = { class: "ss-field" }, qo = {
  key: 0,
  class: "ss-note info"
}, jo = { class: "ss-steps" }, Ro = { class: "ss-actions" }, Ko = ["disabled"], xo = { class: "ss-muted" }, Wo = { value: "" }, Ho = ["value"], Jo = ["disabled", "title"], Qo = { class: "ss-actions" }, Go = ["disabled"], Xo = { class: "ss-muted" }, Yo = { class: "ss-actions" }, Zo = ["disabled"], es = ["disabled"], ts = ["disabled"], ls = {
  key: 0,
  class: "ss-table-wrap"
}, ns = { class: "ss-table" }, os = { class: "num" }, ss = ["value", "disabled"], as = ["onClick"], is = { class: "ft-wrap" }, rs = ["title"], ds = ["title"], cs = {
  key: 0,
  class: "ft-model-score",
  "data-test": "ft-score-corrected"
}, us = { class: "ft-wrap" }, ms = ["onClick"], ps = {
  key: 1,
  class: "ss-empty"
}, vs = { class: "ss-actions" }, ys = ["disabled"], Vs = { class: "ss-actions" }, Ns = { class: "ss-muted" }, Es = { value: "" }, gs = ["value"], hs = { class: "ss-muted" }, fs = ["onClick"], ks = {
  key: 0,
  class: "ss-muted"
}, bs = { class: "ss-field" }, $s = ["onUpdate:modelValue"], Ds = { class: "ss-field" }, Ss = ["onUpdate:modelValue"], _s = { class: "ss-field" }, Bs = ["onUpdate:modelValue"], ws = { class: "ss-actions" }, Cs = ["disabled", "onClick"], Ts = {
  key: 0,
  class: "ss-empty"
}, Ms = /* @__PURE__ */ e.defineComponent({
  __name: "ProspectTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(H) {
    const W = ae.useNotificationStore(), M = e.reactive({ country: "", industry: "", keywords: "", customerType: "", exclude: "", count: 15 }), B = e.ref(""), U = e.ref(""), L = e.ref(""), w = e.ref({}), A = e.ref([]), T = e.reactive({}), V = e.reactive({}), _ = e.reactive({}), I = e.ref(""), x = e.computed(() => l.ftState.value?.prospectBatches || []), C = e.computed(() => x.value.find((t) => t.id === B.value) || null), j = e.computed(() => {
      const t = C.value;
      return t ? (l.ftState.value?.leads || []).filter((i) => t.leadIds.includes(i.id)).slice().sort((i, D) => (D.score ?? -1) - (i.score ?? -1)) : [];
    }), b = e.computed(() => j.value.filter((t) => t.letter)), k = e.computed(() => {
      const t = l.enabledMailboxes(l.ftState.value);
      return [...t.filter((i) => i.purposes.includes("outreach")), ...t.filter((i) => !i.purposes.includes("outreach"))];
    });
    e.watch(x, (t) => {
      !B.value && t.length && (B.value = t[0].id);
    }, { immediate: !0 }), e.watch(C, (t) => {
      t && Object.assign(M, t.criteria), A.value = [], w.value = {};
    }), e.watch(k, (t) => {
      !I.value && t.length && (I.value = t[0].id);
    }, { immediate: !0 }), e.watch(b, (t) => {
      for (const i of t)
        !V[i.id] && i.letter && (V[i.id] = { to: i.emails[0] || "", subject: i.letter.subject, body: i.letter.body });
    }, { immediate: !0 });
    const P = [
      { key: "search", title: o.t("检索潜客"), hint: o.t("按产品、国家、客户类型检索公开网页，去掉平台、社媒和已有客户") },
      { key: "enrich", title: o.t("读取潜客网站"), hint: o.t("读取官网首页与联系页，收集公司信息和邮箱") },
      { key: "score", title: o.t("按画像打分"), hint: o.t("按客户画像给 0～100 分并分 A/B/C 档，附依据") },
      { key: "draft", title: o.t("写开发信"), hint: o.t("针对每家公司的业务写开发信初稿") },
      { key: "send", title: o.t("确认发送"), hint: o.t("业务员逐封修改确认后，从选定邮箱发出") }
    ], R = e.computed(() => {
      const t = j.value, i = (oe, ue, me) => U.value === oe ? { state: "running" } : w.value[oe] ? { state: "failed", error: w.value[oe] } : ue ? { state: "done", summary: me } : { state: "todo" }, D = t.filter((oe) => oe.emails.length).length, ee = t.filter((oe) => oe.score != null).length, de = t.filter((oe) => oe.status === "sent").length;
      return {
        search: i("search", t.length > 0, o.t("{n} 家潜客", { n: t.length })),
        enrich: i("enrich", D > 0, o.t("{n} 家找到邮箱", { n: D })),
        score: i("score", ee > 0, o.t("A 档 {n} 家", { n: t.filter((oe) => oe.tier === "A").length })),
        draft: i("draft", b.value.length > 0, o.t("{n} 封", { n: b.value.length })),
        send: i("send", de > 0, o.t("已发 {n} 封", { n: de }))
      };
    }), S = e.computed(() => P.find((t) => R.value[t.key].state !== "done")?.key || "send");
    function K(t) {
      return { found: o.t("已找到"), scored: o.t("已打分"), drafted: o.t("已写信"), sent: o.t("已发送"), excluded: o.t("已排除") }[t];
    }
    function J(t) {
      return t === "sent" ? "ok" : t === "drafted" ? "brand" : t === "excluded" ? "" : "warn";
    }
    function X(t) {
      return t === "A" ? "ok" : t === "B" ? "warn" : "";
    }
    function $(t) {
      return t === "E1" ? "ok" : t === "E2" ? "brand" : t === "E3" ? "warn" : "bad";
    }
    function a(t) {
      return { E1: o.t("E1：官网上的具名或采购部门邮箱，可以直接发"), E2: o.t("E2：官网上的通用邮箱（info / sales），可以发"), E3: o.t("E3：邮箱域名和官网不一致，发前请核实"), E4: o.t("E4：没有可用邮箱（或域名不收信），不算可触达") }[t];
    }
    function p(t) {
      const i = t.scoreDetail;
      return i ? o.t("代码复算：邮箱 {a} · 来源 {b} · 决策人 {c} · 规模 {d} · 扣分 {e}", { a: i.email, b: i.sources, c: i.decisionMaker, d: i.scale, e: i.penalty }) + (i.critical.length ? `
${o.t("严重疑点：{p0}", { p0: i.critical.join("；") })}` : "") : "";
    }
    function y(t) {
      try {
        return new URL(t).hostname.replace(/^www\./, "");
      } catch {
        return t;
      }
    }
    async function z(t, i) {
      U.value = t, w.value = { ...w.value, [t]: "" }, l.ftProgress.prospect = "", le.scrollToStep(t);
      try {
        return await i(), await l.refreshState(), !0;
      } catch (D) {
        return w.value = { ...w.value, [t]: l.errorMessage(D) }, !1;
      } finally {
        U.value = "";
      }
    }
    async function N() {
      await z("search", async () => {
        const t = await l.ft("prospect.search", { criteria: { ...M } });
        B.value = t.batchId;
      });
    }
    async function q() {
      await z("enrich", () => l.ft("prospect.enrich", { batchId: B.value }));
    }
    async function E() {
      await z("score", () => l.ft("prospect.score", { batchId: B.value }));
    }
    async function m() {
      const t = [...A.value];
      if (await z("draft", () => l.ft("prospect.draft", { leadIds: t }))) for (const D of t)
        T[D] = !0, delete V[D];
      for (const D of b.value) !V[D.id] && D.letter && (V[D.id] = { to: D.emails[0] || "", subject: D.letter.subject, body: D.letter.body });
    }
    function h(t) {
      A.value = j.value.filter((i) => i.tier === t && i.status !== "excluded" && i.status !== "sent").map((i) => i.id);
    }
    async function O(t) {
      try {
        await l.ft("prospect.update", { leadId: t.id, patch: { status: "excluded" } }), A.value = A.value.filter((i) => i !== t.id), await l.refreshState();
      } catch (i) {
        W.error(l.errorMessage(i));
      }
    }
    async function Z() {
      if (!(!B.value || !window.confirm(o.t("删除这一批潜客？已经发出的开发信不受影响。"))))
        try {
          await l.ft("prospect.removeBatch", { batchId: B.value }), B.value = "", await l.refreshState();
        } catch (t) {
          W.error(l.errorMessage(t));
        }
    }
    function c(t) {
      T[t] = !T[t];
    }
    async function F(t) {
      const i = V[t.id];
      if (!i || !I.value) return;
      const D = l.splitEmails(i.to);
      if (!D.length) {
        W.warn(o.t("请填写收件人"));
        return;
      }
      let ee;
      try {
        const oe = await l.checkBeforeSend({ kind: "outreach", mailboxId: I.value, to: D, subject: i.subject, body: i.body, refId: t.id }, l.mailboxName(l.ftState.value, I.value));
        _[t.id] = oe.result, ee = oe.hash;
      } catch (oe) {
        W.error(l.errorMessage(oe));
        return;
      }
      if (!ee) return;
      L.value = t.id;
      const de = await z("send", () => l.ft("prospect.send", { leadId: t.id, mailboxId: I.value, to: D, subject: i.subject, body: i.body, approvedHash: ee }));
      L.value = "", de && W.success(o.t("已发送"));
    }
    function n(t) {
      const i = window.electronAPI;
      i?.openExternal ? i.openExternal(t) : window.open(t, "_blank");
    }
    function s(t) {
      le.scrollToStep(t);
    }
    return (t, i) => (e.openBlock(), e.createElementBlock("div", To, [
      e.createVNode(re, { meta: H.meta }, null, 8, ["meta"]),
      e.createElementVNode("section", Mo, [
        e.createElementVNode("h4", null, [
          i[11] || (i[11] = e.createElementVNode(
            "i",
            { class: "ri-user-search-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(t.$t("客户画像")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Lo, [
          e.createElementVNode("label", Uo, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("产品关键词")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": i[0] || (i[0] = (D) => M.keywords = D),
                type: "text",
                placeholder: "LED panel light"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                M.keywords,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Io, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("目标国家/地区")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": i[1] || (i[1] = (D) => M.country = D),
                type: "text",
                placeholder: "Germany"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                M.country,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Fo, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("目标行业")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": i[2] || (i[2] = (D) => M.industry = D),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                M.industry,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Po, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("客户类型")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": i[3] || (i[3] = (D) => M.customerType = D),
                type: "text",
                placeholder: "importer distributor wholesaler"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                M.customerType,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Ao, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("排除")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": i[4] || (i[4] = (D) => M.exclude = D),
              type: "text",
              placeholder: t.$t("同行工厂、个人卖家等")
            }, null, 8, Oo), [
              [
                e.vModelText,
                M.exclude,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", zo, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.$t("数量")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": i[5] || (i[5] = (D) => M.count = D),
                type: "number",
                min: "5",
                max: "40"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                M.count,
                void 0,
                { number: !0 }
              ]
            ])
          ])
        ])
      ]),
      e.createVNode(ie, {
        title: t.$t("客户开发"),
        metas: P,
        runtime: R.value,
        "current-key": S.value,
        onJump: s
      }, null, 8, ["title", "runtime", "current-key"]),
      U.value && e.unref(l.ftProgress).prospect ? (e.openBlock(), e.createElementBlock("p", qo, [
        i[12] || (i[12] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(e.unref(l.ftProgress).prospect),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", jo, [
        e.createVNode(Q, {
          "step-key": "search",
          index: 0,
          title: P[0].title,
          hint: P[0].hint,
          runtime: R.value.search
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Ro, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!U.value || !M.keywords,
                onClick: N
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(U.value === "search" ? "ri-loader-4-line spin" : "ri-search-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("检索潜客")),
                  1
                  /* TEXT */
                )
              ], 8, Ko),
              i[14] || (i[14] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                xo,
                e.toDisplayString(t.$t("检索批次")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": i[6] || (i[6] = (D) => B.value = D),
                  class: "ft-select"
                },
                [
                  e.createElementVNode(
                    "option",
                    Wo,
                    e.toDisplayString(t.$t("请选择")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(x.value, (D) => (e.openBlock(), e.createElementBlock("option", {
                      key: D.id,
                      value: D.id
                    }, e.toDisplayString(t.$t("{p0} · {p1} · {p2}（{p3}）", { p0: e.unref(l.fmtDateTime)(D.createdAt), p1: D.criteria.keywords, p2: D.criteria.country || t.$t("不限"), p3: D.leadIds.length })), 9, Ho))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, B.value]
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost danger",
                disabled: !B.value,
                title: t.$t("删除这一批潜客"),
                onClick: Z
              }, [...i[13] || (i[13] = [
                e.createElementVNode(
                  "i",
                  { class: "ri-delete-bin-line" },
                  null,
                  -1
                  /* CACHED */
                )
              ])], 8, Jo)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "enrich",
          index: 1,
          title: P[1].title,
          hint: P[1].hint,
          runtime: R.value.enrich
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Qo, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!U.value || !B.value,
                onClick: q
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(U.value === "enrich" ? "ri-loader-4-line spin" : "ri-global-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("读取潜客网站")),
                  1
                  /* TEXT */
                )
              ], 8, Go),
              e.createElementVNode(
                "span",
                Xo,
                e.toDisplayString(t.$t("读取首页与联系页，收集公司信息和公开邮箱")),
                1
                /* TEXT */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "score",
          index: 2,
          title: P[2].title,
          hint: P[2].hint,
          runtime: R.value.score
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Yo, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!U.value || !B.value,
                onClick: E
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(U.value === "score" ? "ri-loader-4-line spin" : "ri-medal-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("按画像打分")),
                  1
                  /* TEXT */
                )
              ], 8, Zo),
              i[15] || (i[15] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                disabled: !j.value.length,
                onClick: i[7] || (i[7] = (D) => h("A"))
              }, e.toDisplayString(t.$t("选中 A 档")), 9, es),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                disabled: !A.value.length,
                onClick: i[8] || (i[8] = (D) => A.value = [])
              }, e.toDisplayString(t.$t("清空选择")), 9, ts)
            ]),
            j.value.length ? (e.openBlock(), e.createElementBlock("div", ls, [
              e.createElementVNode("table", ns, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    i[16] || (i[16] = e.createElementVNode(
                      "th",
                      null,
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("公司")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("网站")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("邮箱")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("国家")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      os,
                      e.toDisplayString(t.$t("分数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("档位")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("依据")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    i[17] || (i[17] = e.createElementVNode(
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
                    e.renderList(j.value, (D) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: D.id,
                        class: e.normalizeClass({ "ft-excluded": D.status === "excluded" })
                      },
                      [
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": i[9] || (i[9] = (ee) => A.value = ee),
                            type: "checkbox",
                            value: D.id,
                            disabled: D.status === "excluded"
                          }, null, 8, ss), [
                            [e.vModelCheckbox, A.value]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(D.company),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("td", null, [
                          D.website ? (e.openBlock(), e.createElementBlock("button", {
                            key: 0,
                            type: "button",
                            class: "ss-link",
                            onClick: (ee) => n(D.website)
                          }, e.toDisplayString(y(D.website)), 9, as)) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode("td", is, [
                          D.emailLevel ? (e.openBlock(), e.createElementBlock("span", {
                            key: 0,
                            class: e.normalizeClass(["ss-chip", $(D.emailLevel)]),
                            title: a(D.emailLevel)
                          }, e.toDisplayString(D.emailLevel), 11, rs)) : e.createCommentVNode("v-if", !0),
                          e.createTextVNode(
                            " " + e.toDisplayString(D.emails.join(", ") || "—"),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(D.country || "—"),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", {
                          class: "num",
                          title: p(D)
                        }, [
                          e.createTextVNode(
                            e.toDisplayString(D.score ?? "—") + " ",
                            1
                            /* TEXT */
                          ),
                          D.modelScore != null && (D.modelScore !== D.score || D.modelTier !== D.tier) ? (e.openBlock(), e.createElementBlock(
                            "small",
                            cs,
                            e.toDisplayString(t.$t("模型初判 {a} / {b}", { a: D.modelScore, b: D.modelTier || "" })),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ], 8, ds),
                        e.createElementVNode("td", null, [
                          D.tier ? (e.openBlock(), e.createElementBlock(
                            "span",
                            {
                              key: 0,
                              class: e.normalizeClass(["ss-chip", X(D.tier)])
                            },
                            e.toDisplayString(D.tier),
                            3
                            /* TEXT, CLASS */
                          )) : e.createCommentVNode("v-if", !0)
                        ]),
                        e.createElementVNode(
                          "td",
                          us,
                          e.toDisplayString(D.reason || ""),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", J(D.status)])
                            },
                            e.toDisplayString(K(D.status)),
                            3
                            /* TEXT, CLASS */
                          )
                        ]),
                        e.createElementVNode("td", null, [
                          D.status !== "excluded" && D.status !== "sent" ? (e.openBlock(), e.createElementBlock("button", {
                            key: 0,
                            type: "button",
                            class: "ss-btn sm ghost",
                            onClick: (ee) => O(D)
                          }, e.toDisplayString(t.$t("排除")), 9, ms)) : e.createCommentVNode("v-if", !0)
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
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              ps,
              e.toDisplayString(t.$t("先检索潜客")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "draft",
          index: 3,
          title: P[3].title,
          hint: P[3].hint,
          runtime: R.value.draft
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", vs, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!U.value || !A.value.length,
                onClick: m
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(U.value === "draft" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("为选中的 {n} 家写开发信", { n: A.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, ys)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "send",
          index: 4,
          title: P[4].title,
          hint: P[4].hint,
          runtime: R.value.send
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Vs, [
              e.createElementVNode(
                "span",
                Ns,
                e.toDisplayString(t.$t("发件邮箱")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": i[10] || (i[10] = (D) => I.value = D),
                  class: "ft-select"
                },
                [
                  e.createElementVNode(
                    "option",
                    Es,
                    e.toDisplayString(t.$t("请选择")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(k.value, (D) => (e.openBlock(), e.createElementBlock("option", {
                      key: D.id,
                      value: D.id
                    }, e.toDisplayString(D.label || D.address), 9, gs))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, I.value]
              ]),
              e.createElementVNode(
                "span",
                hs,
                e.toDisplayString(t.$t("建议每天少量发送，避免邮箱被判为群发")),
                1
                /* TEXT */
              )
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(b.value, (D) => (e.openBlock(), e.createElementBlock("div", {
                key: D.id,
                class: "ft-letter"
              }, [
                e.createElementVNode("div", {
                  class: "ft-letter__head",
                  onClick: (ee) => c(D.id)
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(T[D.id] ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(D.company),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", J(D.status)])
                    },
                    e.toDisplayString(K(D.status)),
                    3
                    /* TEXT, CLASS */
                  ),
                  D.letter ? (e.openBlock(), e.createElementBlock(
                    "span",
                    ks,
                    e.toDisplayString(t.$t("由 {p0} 撰写", { p0: e.unref(l.modelLabel)(D.letter.model) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ], 8, fs),
                T[D.id] && V[D.id] ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode("label", bs, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("收件人")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": (ee) => V[D.id].to = ee,
                        type: "text"
                      }, null, 8, $s), [
                        [e.vModelText, V[D.id].to]
                      ])
                    ]),
                    e.createElementVNode("label", Ds, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("标题")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": (ee) => V[D.id].subject = ee,
                        type: "text"
                      }, null, 8, Ss), [
                        [e.vModelText, V[D.id].subject]
                      ])
                    ]),
                    e.createElementVNode("label", _s, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("正文")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode("textarea", {
                        "onUpdate:modelValue": (ee) => V[D.id].body = ee,
                        rows: "10"
                      }, null, 8, Bs), [
                        [e.vModelText, V[D.id].body]
                      ])
                    ]),
                    e.createVNode(pe, {
                      result: _[D.id],
                      "opt-out-line": e.unref(l.ftState)?.settings.sendRules.optOutLine,
                      onFixOptOut: (ee) => V[D.id].body = `${V[D.id].body.trimEnd()}

${ee}`
                    }, null, 8, ["result", "opt-out-line", "onFixOptOut"]),
                    e.createElementVNode("div", ws, [
                      i[18] || (i[18] = e.createElementVNode(
                        "span",
                        { class: "grow" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn primary",
                        disabled: U.value === "send" || !I.value || D.status === "sent",
                        onClick: (ee) => F(D)
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(L.value === D.id ? "ri-loader-4-line spin" : "ri-send-plane-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(D.status === "sent" ? t.$t("已发送") : t.$t("发送")),
                          1
                          /* TEXT */
                        )
                      ], 8, Cs)
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            b.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              Ts,
              e.toDisplayString(t.$t("还没有写好的开发信")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), Ls = /* @__PURE__ */ se(Ms, [["__scopeId", "data-v-27200b2e"]]), Us = { class: "ss-module" }, Is = { class: "ss-rules" }, Fs = { class: "ss-rule-row" }, Ps = { class: "ft-check" }, As = ["checked"], Os = { class: "ss-rule-row" }, zs = { class: "lbl" }, qs = ["value"], js = { value: "ack" }, Rs = { value: "full" }, Ks = { class: "lbl" }, xs = ["value"], Ws = { value: "high" }, Hs = { value: "medium" }, Js = { value: "low" }, Qs = { class: "ft-check" }, Gs = ["checked"], Xs = { class: "ss-muted" }, Ys = { class: "ft-split" }, Zs = { class: "ft-list" }, ea = { class: "ss-actions" }, ta = { value: "" }, la = ["value"], na = { value: "" }, oa = ["value"], sa = ["disabled"], aa = ["onClick"], ia = { class: "ft-list__top" }, ra = { class: "ft-list__sub" }, da = { class: "ft-list__meta" }, ca = {
  key: 1,
  class: "ss-chip ok"
}, ua = {
  key: 0,
  class: "ss-empty"
}, ma = {
  key: 0,
  class: "ft-detail"
}, pa = { class: "ss-steps" }, va = { class: "ft-mail__head" }, ya = { class: "ss-muted" }, Va = { class: "ft-body" }, Na = {
  key: 0,
  class: "ss-actions"
}, Ea = ["onClick"], ga = { class: "ss-actions" }, ha = ["disabled"], fa = {
  key: 0,
  class: "ss-muted"
}, ka = {
  key: 0,
  class: "ss-table-wrap"
}, ba = { class: "ss-table" }, $a = { class: "ft-quote" }, Da = ["title"], Sa = {
  key: 1,
  class: "ss-table-wrap"
}, _a = { class: "ss-table" }, Ba = { class: "num" }, wa = { class: "num" }, Ca = {
  key: 0,
  class: "ss-kpis"
}, Ta = { class: "ss-kpi" }, Ma = { class: "ss-kpi" }, La = { class: "ss-kpi accent" }, Ua = { class: "ss-kpi" }, Ia = {
  key: 0,
  class: "ss-kpi",
  "data-test": "ft-reply-type"
}, Fa = {
  key: 1,
  class: "ss-note info"
}, Pa = { key: 2 }, Aa = { class: "ss-subhead" }, Oa = { class: "ft-ol" }, za = { class: "ss-actions" }, qa = { class: "ss-muted" }, ja = ["disabled"], Ra = { class: "ss-actions" }, Ka = ["disabled"], xa = ["disabled"], Wa = {
  key: 0,
  class: "ss-muted"
}, Ha = { class: "ss-field" }, Ja = { class: "ss-field" }, Qa = { class: "ss-field" }, Ga = { class: "ss-actions" }, Xa = { class: "ss-muted" }, Ya = ["disabled"], Za = {
  key: 0,
  class: "ss-note ok"
}, ei = {
  key: 1,
  class: "ft-detail ss-empty"
}, ti = /* @__PURE__ */ e.defineComponent({
  __name: "InquiryTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(H) {
    const W = H, M = ae.useNotificationStore(), B = l.ftState, U = e.computed(() => B.value?.settings), L = ["new", "extracted", "replied", "quoted", "closed", "spam"], w = e.ref(""), A = e.ref(""), T = e.ref(""), V = e.ref(""), _ = e.ref({}), I = e.ref(null), x = e.ref(null), C = e.computed(() => (B.value?.inquiries || []).filter((c) => !w.value || c.mailboxId === w.value).filter((c) => !A.value || c.status === A.value).slice().sort((c, F) => F.receivedAt.localeCompare(c.receivedAt))), j = e.computed(() => (B.value?.inquiries || []).filter((c) => c.status === "new" && !c.extractedAt).length), b = e.computed(() => B.value?.inquiries.find((c) => c.id === T.value) || null), k = e.computed(() => (b.value?.messageIds || []).map((c) => B.value?.messages.find((F) => F.id === c)).filter(Boolean)), P = e.computed(() => (B.value?.mailboxes || []).filter((c) => c.autoReply && c.enabled).map((c) => c.label || c.address).join(o.t("、")));
    e.watch(() => W.focus?.inquiryId, (c) => {
      c && (T.value = c);
    }, { immediate: !0 }), e.watch(C, (c) => {
      !T.value && c.length && (T.value = c[0].id);
    }, { immediate: !0 }), e.watch(() => b.value?.id, () => {
      _.value = {}, x.value = null;
      const c = b.value?.replyDraft;
      I.value = c && b.value ? { to: b.value.customerEmail, subject: c.subject, body: c.body } : null;
    }), e.watch(() => b.value?.replyDraft?.at, () => {
      const c = b.value?.replyDraft;
      c && b.value && (I.value = { to: b.value.customerEmail, subject: c.subject, body: c.body });
    });
    const R = [
      { key: "receive", title: o.t("收件"), hint: o.t("多个邮箱的来信按客户归并成一个询盘，附件一起收下") },
      { key: "extract", title: o.t("信息提取"), hint: o.t("产品、数量、目的港、贸易术语、付款方式等，每项附原文依据") },
      { key: "classify", title: o.t("分类与判断"), hint: o.t("产品线、完整度、意向、是否垃圾询盘；列出要问客户的问题") },
      { key: "draft", title: o.t("回复草稿"), hint: o.t("用客户的语言起草回复，不写价格") },
      { key: "send", title: o.t("确认发送"), hint: o.t("从收到询盘的邮箱发出，人确认后才发") }
    ], S = e.computed(() => {
      const c = b.value, F = (n, s, t) => V.value === n ? { state: "running" } : _.value[n] ? { state: "failed", error: _.value[n] } : s ? { state: "done", summary: t } : { state: "todo" };
      return {
        receive: F("receive", !!c, c ? o.t("{n} 封邮件", { n: c.messageIds.length }) : ""),
        extract: F("extract", !!c?.extractedAt, c?.extractedAt ? o.t("{a} 个字段、{b} 个产品", { a: c.fields.length, b: c.items.length }) : ""),
        classify: F("classify", !!c?.category, c?.category ? `${c.category.productLine} · ${$(c.category.intent)}` : ""),
        draft: F("draft", !!c?.replyDraft),
        send: F("send", !!c && ["replied", "quoted"].includes(c.status))
      };
    }), K = e.computed(() => R.find((c) => S.value[c.key].state !== "done")?.key || "send");
    function J(c) {
      return { new: o.t("新询盘"), extracted: o.t("已整理"), replied: o.t("已回复"), quoted: o.t("已报价"), closed: o.t("已关闭"), spam: o.t("垃圾询盘") }[c];
    }
    function X(c) {
      return c === "new" ? "warn" : c === "spam" || c === "closed" ? "" : c === "extracted" ? "brand" : "ok";
    }
    function $(c) {
      return { high: o.t("高"), medium: o.t("中"), low: o.t("低") }[c];
    }
    function a(c) {
      return c === "high" ? "ok" : c === "medium" ? "warn" : "";
    }
    function p(c) {
      return {
        do_not_contact: o.t("要求不再联系"),
        not_now: o.t("暂不需要"),
        has_supplier: o.t("已有供应商"),
        info_request: o.t("索要资料"),
        sample_request: o.t("要样品"),
        quote_request: o.t("要报价"),
        meeting_request: o.t("约通话 / 会面"),
        order_intent: o.t("要下单"),
        wrong_contact: o.t("找错人"),
        other: o.t("其它")
      }[c] || c;
    }
    function y(c) {
      return { complete: o.t("完整"), partial: o.t("部分缺失"), poor: o.t("信息很少") }[c] || c;
    }
    async function z(c, F) {
      V.value = c, _.value = { ..._.value, [c]: "" }, le.scrollToStep(c);
      try {
        return await F(), await l.refreshState(), !0;
      } catch (n) {
        return _.value = { ..._.value, [c]: l.errorMessage(n) }, !1;
      } finally {
        V.value = "";
      }
    }
    async function N(c) {
      try {
        await l.ft("settings.patch", { patch: c }), await l.refreshState();
      } catch (F) {
        M.error(l.errorMessage(F));
      }
    }
    async function q(c) {
      if (b.value)
        try {
          await l.ft("inquiry.update", { id: b.value.id, patch: { status: c } }), await l.refreshState();
        } catch (F) {
          M.error(l.errorMessage(F));
        }
    }
    async function E() {
      try {
        const c = await l.ft("inquiry.processNew");
        M.info(o.t("已开始处理 {n} 条询盘，完成后自动刷新", { n: c }));
      } catch (c) {
        M.error(l.errorMessage(c));
      }
    }
    async function m(c) {
      b.value && await z("draft", () => l.ft("inquiry.draft", { id: b.value.id, mode: c }));
    }
    async function h() {
      const c = b.value, F = I.value;
      if (!c || !F) return;
      const n = l.splitEmails(F.to);
      let s;
      try {
        const i = await l.checkBeforeSend({ kind: "inquiry_reply", mailboxId: c.mailboxId, to: n, subject: F.subject, body: F.body, refId: c.id }, l.mailboxName(B.value, c.mailboxId));
        x.value = i.result, s = i.hash;
      } catch (i) {
        M.error(l.errorMessage(i));
        return;
      }
      if (!s) return;
      await z("send", () => l.ft("inquiry.send", { id: c.id, subject: F.subject, body: F.body, to: n, approvedHash: s })) && M.success(o.t("已发送"));
    }
    function O(c) {
      l.ft("path.open", { path: c }).catch((F) => M.error(l.errorMessage(F)));
    }
    function Z(c) {
      le.scrollToStep(c);
    }
    return (c, F) => (e.openBlock(), e.createElementBlock("div", Us, [
      e.createVNode(re, { meta: H.meta }, null, 8, ["meta"]),
      e.createCommentVNode(" 自动处理规则 "),
      e.createElementVNode("section", Is, [
        e.createElementVNode("h4", null, [
          F[17] || (F[17] = e.createElementVNode(
            "i",
            { class: "ri-robot-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(c.$t("自动处理")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Fs, [
          e.createElementVNode("label", Ps, [
            e.createElementVNode("input", {
              type: "checkbox",
              checked: U.value?.autoExtract,
              onChange: F[0] || (F[0] = (n) => N({ autoExtract: n.target.checked }))
            }, null, 40, As),
            e.createTextVNode(
              e.toDisplayString(c.$t("新询盘到达后自动提取信息并分类")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Os, [
          e.createElementVNode(
            "span",
            zs,
            e.toDisplayString(c.$t("自动回复（只对打开了「自动回复」的邮箱生效）：")),
            1
            /* TEXT */
          ),
          e.createElementVNode("select", {
            value: U.value?.autoReply.mode,
            onChange: F[1] || (F[1] = (n) => N({ autoReply: { ...U.value.autoReply, mode: n.target.value } }))
          }, [
            e.createElementVNode(
              "option",
              js,
              e.toDisplayString(c.$t("只发确认收到 + 澄清问题（不报价）")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "option",
              Rs,
              e.toDisplayString(c.$t("发完整回复（介绍产品、提问、说明下一步，不写价格）")),
              1
              /* TEXT */
            )
          ], 40, qs),
          e.createElementVNode(
            "span",
            Ks,
            e.toDisplayString(c.$t("意向至少")),
            1
            /* TEXT */
          ),
          e.createElementVNode("select", {
            value: U.value?.autoReply.minIntent,
            onChange: F[2] || (F[2] = (n) => N({ autoReply: { ...U.value.autoReply, minIntent: n.target.value } }))
          }, [
            e.createElementVNode(
              "option",
              Ws,
              e.toDisplayString(c.$t("高")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "option",
              Hs,
              e.toDisplayString(c.$t("中")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "option",
              Js,
              e.toDisplayString(c.$t("低")),
              1
              /* TEXT */
            )
          ], 40, xs),
          e.createElementVNode("label", Qs, [
            e.createElementVNode("input", {
              type: "checkbox",
              checked: U.value?.autoReply.skipSpam,
              onChange: F[3] || (F[3] = (n) => N({ autoReply: { ...U.value.autoReply, skipSpam: n.target.checked } }))
            }, null, 40, Gs),
            e.createTextVNode(
              e.toDisplayString(c.$t("垃圾询盘不回")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode(
          "p",
          Xs,
          e.toDisplayString(c.$t("已开启自动回复的邮箱：{p0}", { p0: P.value || c.$t("无（在顶部「邮箱接管」里给邮箱打开）") })),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("div", Ys, [
        e.createCommentVNode(" 询盘列表 "),
        e.createElementVNode("aside", Zs, [
          e.createElementVNode("div", ea, [
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": F[4] || (F[4] = (n) => w.value = n),
                class: "ft-select"
              },
              [
                e.createElementVNode(
                  "option",
                  ta,
                  e.toDisplayString(c.$t("全部邮箱")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(e.unref(B)?.mailboxes || [], (n) => (e.openBlock(), e.createElementBlock("option", {
                    key: n.id,
                    value: n.id
                  }, e.toDisplayString(n.label || n.address), 9, la))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, w.value]
            ]),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": F[5] || (F[5] = (n) => A.value = n),
                class: "ft-select"
              },
              [
                e.createElementVNode(
                  "option",
                  na,
                  e.toDisplayString(c.$t("全部状态")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(L, (n) => e.createElementVNode("option", {
                    key: n,
                    value: n
                  }, e.toDisplayString(J(n)), 9, oa)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, A.value]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn sm ghost",
              disabled: !j.value,
              onClick: E
            }, [
              F[18] || (F[18] = e.createElementVNode(
                "i",
                { class: "ri-play-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(c.$t("处理未提取的 {n} 条", { n: j.value })),
                1
                /* TEXT */
              )
            ], 8, sa)
          ]),
          e.createElementVNode("ul", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(C.value, (n) => (e.openBlock(), e.createElementBlock("li", {
                key: n.id,
                class: e.normalizeClass({ active: n.id === T.value }),
                onClick: (s) => T.value = n.id
              }, [
                e.createElementVNode("div", ia, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(n.company || n.customerName),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", X(n.status)])
                    },
                    e.toDisplayString(J(n.status)),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode(
                  "div",
                  ra,
                  e.toDisplayString(n.subject || c.$t("（无标题）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", da, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(l.mailboxName)(e.unref(B), n.mailboxId)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(l.fmtDateTime)(n.receivedAt)),
                    1
                    /* TEXT */
                  ),
                  n.category ? (e.openBlock(), e.createElementBlock(
                    "span",
                    {
                      key: 0,
                      class: e.normalizeClass(["ss-chip", a(n.category.intent)])
                    },
                    e.toDisplayString(c.$t("意向")) + e.toDisplayString($(n.category.intent)),
                    3
                    /* TEXT, CLASS */
                  )) : e.createCommentVNode("v-if", !0),
                  n.autoReply?.sent ? (e.openBlock(), e.createElementBlock(
                    "span",
                    ca,
                    e.toDisplayString(c.$t("已自动回复")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ])
              ], 10, aa))),
              128
              /* KEYED_FRAGMENT */
            )),
            C.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              ua,
              e.toDisplayString(e.unref(B)?.mailboxes.length ? c.$t("还没有询盘。新邮件每 2 分钟收取一次，也可以在顶部「邮箱接管」里立即收取。") : c.$t("先在顶部「邮箱接管」里添加邮箱。")),
              1
              /* TEXT */
            ))
          ])
        ]),
        e.createCommentVNode(" 选中询盘的分步处理 "),
        b.value ? (e.openBlock(), e.createElementBlock("section", ma, [
          e.createVNode(ie, {
            title: c.$t("询盘处理"),
            metas: R,
            runtime: S.value,
            "current-key": K.value,
            onJump: Z
          }, null, 8, ["title", "runtime", "current-key"]),
          e.createElementVNode("div", pa, [
            e.createVNode(Q, {
              "step-key": "receive",
              index: 0,
              title: R[0].title,
              hint: R[0].hint,
              runtime: S.value.receive
            }, {
              default: e.withCtx(() => [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(k.value, (n) => (e.openBlock(), e.createElementBlock("div", {
                    class: "ft-mail",
                    key: n.id
                  }, [
                    e.createElementVNode("div", va, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", n.direction === "in" ? "brand" : "ok"])
                        },
                        e.toDisplayString(n.direction === "in" ? c.$t("客户来信") : c.$t("我方发出")),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(n.subject),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        ya,
                        e.toDisplayString(n.from) + " · " + e.toDisplayString(e.unref(l.fmtDateTime)(n.at)),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "pre",
                      Va,
                      e.toDisplayString(n.body.slice(0, 3e3)),
                      1
                      /* TEXT */
                    ),
                    n.attachments.length ? (e.openBlock(), e.createElementBlock("div", Na, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(n.attachments, (s) => (e.openBlock(), e.createElementBlock("button", {
                          key: s.path,
                          type: "button",
                          class: "ss-btn sm ghost",
                          onClick: (t) => O(s.path)
                        }, [
                          F[19] || (F[19] = e.createElementVNode(
                            "i",
                            { class: "ri-attachment-2" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(s.name),
                            1
                            /* TEXT */
                          )
                        ], 8, Ea))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : e.createCommentVNode("v-if", !0)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "extract",
              index: 1,
              title: R[1].title,
              hint: R[1].hint,
              runtime: S.value.extract
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", ga, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: V.value === "extract",
                    onClick: F[6] || (F[6] = (n) => z("extract", () => e.unref(l.ft)("inquiry.extract", { id: b.value.id })))
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(V.value === "extract" ? "ri-loader-4-line spin" : "ri-file-search-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(b.value.extractedAt ? c.$t("重新提取") : c.$t("提取信息")),
                      1
                      /* TEXT */
                    )
                  ], 8, ha),
                  b.value.model ? (e.openBlock(), e.createElementBlock(
                    "span",
                    fa,
                    e.toDisplayString(c.$t("由 {p0} 提取", { p0: e.unref(l.modelLabel)(b.value.model) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                b.value.fields.length ? (e.openBlock(), e.createElementBlock("div", ka, [
                  e.createElementVNode("table", ba, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(c.$t("字段")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(c.$t("内容")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(c.$t("原文依据")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(c.$t("出处")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(b.value.fields, (n) => (e.openBlock(), e.createElementBlock("tr", {
                          key: n.key + n.value
                        }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.label),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(n.value),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode("td", $a, [
                            e.createElementVNode("span", {
                              class: e.normalizeClass(n.verified ? "" : "ft-unverified"),
                              title: n.verified ? "" : c.$t("原文里没有找到这句，请人工核对")
                            }, e.toDisplayString(n.quote || "—"), 11, Da)
                          ]),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.source || "—"),
                            1
                            /* TEXT */
                          )
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ])) : e.createCommentVNode("v-if", !0),
                b.value.items.length ? (e.openBlock(), e.createElementBlock("div", Sa, [
                  e.createElementVNode("table", _a, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(c.$t("产品")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(c.$t("型号")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(c.$t("规格")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Ba,
                          e.toDisplayString(c.$t("数量")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(b.value.items, (n, s) => (e.openBlock(), e.createElementBlock("tr", { key: s }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.product),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.model || "—"),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(n.spec || "—"),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            wa,
                            e.toDisplayString(n.quantity || "—") + " " + e.toDisplayString(n.unit || ""),
                            1
                            /* TEXT */
                          )
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
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "classify",
              index: 2,
              title: R[2].title,
              hint: R[2].hint,
              runtime: S.value.classify
            }, {
              default: e.withCtx(() => [
                b.value.category ? (e.openBlock(), e.createElementBlock("div", Ca, [
                  e.createElementVNode("div", Ta, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(c.$t("产品线")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(b.value.category.productLine),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Ma, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(c.$t("信息完整度")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(y(b.value.category.completeness)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", La, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(c.$t("意向")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString($(b.value.category.intent)),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Ua, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(c.$t("垃圾询盘")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(b.value.category.spam ? c.$t("是") : c.$t("否")),
                      1
                      /* TEXT */
                    )
                  ]),
                  b.value.category.replyType ? (e.openBlock(), e.createElementBlock("div", Ia, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(c.$t("来信类型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(p(b.value.category.replyType)),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ])) : e.createCommentVNode("v-if", !0),
                b.value.category?.reason ? (e.openBlock(), e.createElementBlock("p", Fa, [
                  F[20] || (F[20] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(b.value.category.reason),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                b.value.questions.length ? (e.openBlock(), e.createElementBlock("div", Pa, [
                  e.createElementVNode(
                    "div",
                    Aa,
                    e.toDisplayString(c.$t("需要向客户澄清")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("ol", Oa, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(b.value.questions, (n, s) => (e.openBlock(), e.createElementBlock(
                        "li",
                        { key: s },
                        e.toDisplayString(n),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", za, [
                  e.createElementVNode(
                    "span",
                    qa,
                    e.toDisplayString(c.$t("人工判断：")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    onClick: F[7] || (F[7] = (n) => q("spam"))
                  }, [
                    F[21] || (F[21] = e.createElementVNode(
                      "i",
                      { class: "ri-spam-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(c.$t("标为垃圾")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    onClick: F[8] || (F[8] = (n) => q("closed"))
                  }, [
                    F[22] || (F[22] = e.createElementVNode(
                      "i",
                      { class: "ri-archive-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(c.$t("不跟进，关闭")),
                      1
                      /* TEXT */
                    )
                  ]),
                  ["spam", "closed"].includes(b.value.status) ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn sm",
                    onClick: F[9] || (F[9] = (n) => q("extracted"))
                  }, [
                    F[23] || (F[23] = e.createElementVNode(
                      "i",
                      { class: "ri-arrow-go-back-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(c.$t("恢复")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  F[26] || (F[26] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: F[10] || (F[10] = (n) => c.$emit("goto", "background", { company: b.value.company || "", email: b.value.customerEmail, country: b.value.country || "", inquiryId: b.value.id }))
                  }, [
                    F[24] || (F[24] = e.createElementVNode(
                      "i",
                      { class: "ri-shield-user-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(c.$t("去背调这个客户")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    disabled: !b.value.items.length,
                    onClick: F[11] || (F[11] = (n) => c.$emit("goto", "quote", { inquiryId: b.value.id }))
                  }, [
                    F[25] || (F[25] = e.createElementVNode(
                      "i",
                      { class: "ri-price-tag-3-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(c.$t("去报价")),
                      1
                      /* TEXT */
                    )
                  ], 8, ja)
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "draft",
              index: 3,
              title: R[3].title,
              hint: R[3].hint,
              runtime: S.value.draft
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Ra, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: V.value === "draft",
                    onClick: F[12] || (F[12] = (n) => m("ack"))
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(V.value === "draft" ? "ri-loader-4-line spin" : "ri-chat-check-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(c.$t("写确认回复")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ka),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: V.value === "draft",
                    onClick: F[13] || (F[13] = (n) => m("full"))
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(V.value === "draft" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(c.$t("写完整回复")),
                      1
                      /* TEXT */
                    )
                  ], 8, xa),
                  b.value.replyDraft ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Wa,
                    e.toDisplayString(c.$t("由 {p0} 撰写", { p0: e.unref(l.modelLabel)(b.value.replyDraft.model) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                b.value.autoReply ? (e.openBlock(), e.createElementBlock(
                  "p",
                  {
                    key: 0,
                    class: e.normalizeClass(["ss-note", b.value.autoReply.sent ? "ok" : "warn"])
                  },
                  [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(b.value.autoReply.sent ? "ri-check-line" : "ri-information-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      " " + e.toDisplayString(b.value.autoReply.sent ? c.$t("已于 {p0} 自动回复", { p0: e.unref(l.fmtDateTime)(b.value.autoReply.at) }) : b.value.autoReply.blocked?.length ? c.$t("自动回复被发信闸门拦下（{p0}）", { p0: e.unref(l.fmtDateTime)(b.value.autoReply.at) }) : c.$t("没有自动回复：{p0}", { p0: b.value.autoReply.reason || "" })),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                )) : e.createCommentVNode("v-if", !0),
                b.value.autoReply?.blocked?.length ? (e.openBlock(), e.createBlock(pe, {
                  key: 1,
                  result: { ok: !1, issues: b.value.autoReply.blocked, hash: "", sentToday: 0, dailyLimit: 0 },
                  "hide-quota": !0
                }, null, 8, ["result"])) : e.createCommentVNode("v-if", !0),
                I.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 2 },
                  [
                    e.createElementVNode("label", Ha, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(c.$t("收件人")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": F[14] || (F[14] = (n) => I.value.to = n),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, I.value.to]
                      ])
                    ]),
                    e.createElementVNode("label", Ja, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(c.$t("标题")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": F[15] || (F[15] = (n) => I.value.subject = n),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, I.value.subject]
                      ])
                    ]),
                    e.createElementVNode("label", Qa, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(c.$t("正文")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "textarea",
                        {
                          "onUpdate:modelValue": F[16] || (F[16] = (n) => I.value.body = n),
                          rows: "12"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, I.value.body]
                      ])
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0),
                e.createVNode(pe, { result: x.value }, null, 8, ["result"])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "send",
              index: 4,
              title: R[4].title,
              hint: R[4].hint,
              runtime: S.value.send
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Ga, [
                  e.createElementVNode(
                    "span",
                    Xa,
                    e.toDisplayString(c.$t("从收到询盘的邮箱发出：{p0}", { p0: e.unref(l.mailboxName)(e.unref(B), b.value.mailboxId) })),
                    1
                    /* TEXT */
                  ),
                  F[27] || (F[27] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !I.value || V.value === "send",
                    onClick: h
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(V.value === "send" ? "ri-loader-4-line spin" : "ri-send-plane-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(c.$t("发送")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ya)
                ]),
                b.value.repliedAt ? (e.openBlock(), e.createElementBlock("p", Za, [
                  F[28] || (F[28] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(c.$t("已于 {p0} 回复", { p0: e.unref(l.fmtDateTime)(b.value.repliedAt) })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "section",
          ei,
          e.toDisplayString(c.$t("在左侧选择一个询盘")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), li = /* @__PURE__ */ se(ti, [["__scopeId", "data-v-b08405c7"]]), ni = ["data-level"], oi = { class: "ft-scr__head" }, si = { class: "ss-muted" }, ai = {
  key: 0,
  class: "ss-table-wrap"
}, ii = { class: "ss-table" }, ri = { class: "num" }, di = { class: "num" }, ci = { class: "ft-wrap" }, ui = {
  key: 0,
  class: "ss-muted"
}, mi = { class: "ft-wrap" }, pi = {
  key: 0,
  class: "ss-muted"
}, vi = { class: "ft-wrap" }, yi = { class: "ft-wrap" }, Vi = { class: "ss-muted ft-scr__lists" }, Ni = { class: "ss-muted" }, Ei = /* @__PURE__ */ e.defineComponent({
  __name: "ScreeningResult",
  props: {
    result: {}
  },
  setup(H) {
    const W = H, M = e.computed(() => ({ high: o.t("高度疑似命中"), review: o.t("有待查的相近名字"), clear: o.t("未命中") })[W.result.level]);
    return (B, U) => (e.openBlock(), e.createElementBlock("div", {
      class: e.normalizeClass(["ft-scr", H.result.level]),
      "data-test": "ft-screening-result",
      "data-level": H.result.level
    }, [
      e.createElementVNode("div", oi, [
        e.createElementVNode(
          "span",
          {
            class: e.normalizeClass(["ss-chip", H.result.level === "high" ? "bad" : H.result.level === "review" ? "warn" : "ok"])
          },
          e.toDisplayString(M.value),
          3
          /* TEXT, CLASS */
        ),
        e.createElementVNode(
          "strong",
          null,
          e.toDisplayString(H.result.query),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          si,
          e.toDisplayString(e.unref(l.fmtDateTime)(H.result.at)),
          1
          /* TEXT */
        )
      ]),
      H.result.matches.length ? (e.openBlock(), e.createElementBlock("div", ai, [
        e.createElementVNode("table", ii, [
          e.createElementVNode("thead", null, [
            e.createElementVNode("tr", null, [
              e.createElementVNode(
                "th",
                ri,
                e.toDisplayString(B.$t("相似度")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("名单上的名称")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("名单")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("依据")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "th",
                null,
                e.toDisplayString(B.$t("国家")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("tbody", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(H.result.matches.slice(0, 10), (L, w) => (e.openBlock(), e.createElementBlock("tr", { key: w }, [
                e.createElementVNode("td", di, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", L.level === "high" ? "bad" : "warn"])
                    },
                    e.toDisplayString(L.score),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("td", ci, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(L.name),
                    1
                    /* TEXT */
                  ),
                  L.matchedOn !== L.name ? (e.openBlock(), e.createElementBlock(
                    "div",
                    ui,
                    e.toDisplayString(B.$t("命中别名：{p0}", { p0: L.matchedOn })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("td", mi, [
                  e.createTextVNode(
                    e.toDisplayString(L.list),
                    1
                    /* TEXT */
                  ),
                  L.ref ? (e.openBlock(), e.createElementBlock(
                    "div",
                    pi,
                    e.toDisplayString(L.ref),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode(
                  "td",
                  vi,
                  e.toDisplayString(L.basis),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "td",
                  yi,
                  e.toDisplayString((L.countries || []).join(", ") || "—"),
                  1
                  /* TEXT */
                )
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("p", Vi, [
        e.createTextVNode(
          e.toDisplayString(B.$t("用到的名单：{p0}", { p0: H.result.lists.map((L) => `${L.id.toUpperCase()} ${L.version || ""}`.trim()).join("；") || "—" })) + " ",
          1
          /* TEXT */
        ),
        H.result.missing.length ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 0 },
          [
            e.createTextVNode(
              e.toDisplayString(B.$t("；没有缓存、没参与筛查：{p0}", { p0: H.result.missing.map((L) => L.toUpperCase()).join("、") })),
              1
              /* TEXT */
            )
          ],
          64
          /* STABLE_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode(
        "p",
        Ni,
        e.toDisplayString(B.$t("名单筛查只是辅助：没命中不等于可以交易（所有权、地址、音译都可能漏），有疑似命中也要人工核对后再定。")),
        1
        /* TEXT */
      )
    ], 10, ni));
  }
}), he = /* @__PURE__ */ se(Ei, [["__scopeId", "data-v-3adb9fd5"]]), gi = { class: "ss-module" }, hi = { class: "ss-rules" }, fi = { class: "ss-grid" }, ki = { class: "ss-field" }, bi = { class: "ss-field" }, $i = { class: "ss-field" }, Di = { class: "ss-field" }, Si = { class: "ss-muted" }, _i = {
  class: "ss-panel",
  "data-test": "ft-screening"
}, Bi = { class: "ss-muted" }, wi = ["disabled"], Ci = {
  key: 0,
  class: "ss-note info"
}, Ti = { class: "ss-table-wrap" }, Mi = { class: "ss-table" }, Li = { class: "num" }, Ui = ["data-test"], Ii = { class: "ft-wrap" }, Fi = {
  key: 1,
  class: "ss-chip warn"
}, Pi = {
  key: 2,
  class: "ft-err"
}, Ai = { class: "num" }, Oi = ["disabled", "data-test", "onClick"], zi = { class: "ss-muted" }, qi = { class: "ss-actions" }, ji = ["placeholder"], Ri = ["placeholder"], Ki = ["disabled"], xi = {
  key: 1,
  class: "ss-note danger"
}, Wi = { class: "ft-split" }, Hi = { class: "ft-list" }, Ji = { class: "ss-subhead" }, Qi = ["onClick"], Gi = { class: "ft-list__top" }, Xi = { class: "ft-list__meta" }, Yi = ["onClick"], Zi = {
  key: 0,
  class: "ss-empty"
}, er = { class: "ft-detail" }, tr = {
  key: 0,
  class: "ss-note info"
}, lr = { class: "ss-steps" }, nr = { class: "ss-actions" }, or = ["disabled"], sr = { class: "ss-muted" }, ar = {
  key: 0,
  class: "ft-sources"
}, ir = { class: "ss-chip" }, rr = ["onClick"], dr = { class: "ss-muted ft-url" }, cr = ["title"], ur = {
  key: 1,
  class: "ss-chip ok"
}, mr = { class: "ss-actions" }, pr = ["disabled"], vr = { class: "ss-actions" }, yr = ["disabled"], Vr = {
  key: 0,
  class: "ss-muted"
}, Nr = {
  key: 0,
  class: "ft-summary"
}, Er = {
  key: 1,
  class: "ss-table-wrap"
}, gr = { class: "ss-table" }, hr = { class: "ft-wrap" }, fr = ["onClick"], kr = { key: 1 }, br = { key: 2 }, $r = { class: "ss-subhead" }, Dr = { class: "ft-risks" }, Sr = { key: 0 }, _r = ["onClick"], Br = { class: "ss-actions" }, wr = ["disabled"], Cr = {
  key: 0,
  class: "ss-muted"
}, Tr = {
  key: 0,
  class: "ss-note warn"
}, Mr = { class: "ss-subhead" }, Lr = { class: "ft-cov" }, Ur = ["title"], Ir = {
  key: 0,
  class: "ss-muted"
}, Fr = { key: 0 }, Pr = { class: "ss-subhead" }, Ar = { class: "ft-risks" }, Or = ["data-rule"], zr = {
  key: 1,
  class: "ss-note ok"
}, qr = {
  key: 0,
  class: "ss-note info"
}, jr = { class: "ss-muted" }, Rr = { class: "ss-actions" }, Kr = ["disabled"], xr = /* @__PURE__ */ e.defineComponent({
  __name: "BackgroundTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(H) {
    const W = H, M = ae.useNotificationStore(), B = e.reactive({ company: "", website: "", email: "", country: "", inquiryId: "" }), U = e.ref(""), L = e.ref(""), w = e.ref({}), A = e.ref(!1), T = e.ref(""), V = e.ref([]), _ = e.ref(""), I = e.ref(""), x = e.ref(""), C = e.ref(null), j = e.ref(""), b = e.computed(() => l.ftState.value?.backgrounds || []), k = e.computed(() => b.value.find((n) => n.id === U.value) || null), P = e.computed(() => !!(B.company || B.website || B.email));
    e.watch(() => W.focus, (n) => {
      if (!n) return;
      Object.assign(B, { company: n.company || "", website: n.website || "", email: n.email || "", country: n.country || "", inquiryId: n.inquiryId || "" });
      const s = n.inquiryId ? b.value.find((t) => t.inquiryId === n.inquiryId) : void 0;
      U.value = s?.id || "";
    }, { immediate: !0 }), e.watch(b, (n) => {
      !U.value && n.length && !W.focus && (U.value = n[0].id);
    }, { immediate: !0 }), e.watch(U, () => {
      w.value = {}, A.value = !1, T.value = "";
    }), e.watch(() => B.company, (n) => {
      n && !I.value && (I.value = n);
    }), e.onMounted(() => {
      E();
    });
    const R = [
      { key: "search", title: o.t("检索公开信息"), hint: o.t("按公司名、官网、邮箱域名检索公开网页") },
      { key: "fetch", title: o.t("读取网页"), hint: o.t("读取官网和检索到的网页正文") },
      { key: "compose", title: o.t("整理背调卡"), hint: o.t("公司概况、主营、规模线索、风险提示，每条附来源") },
      { key: "checks", title: o.t("核查与名单筛查"), hint: o.t("域名注册时间、收信服务器、邮箱域名，加制裁 / 出口管制名单比对；每个覆盖面标明查到 / 查过没有 / 没查") },
      { key: "judge", title: o.t("人工判断"), hint: o.t("业务员判断客户实力与采购潜力，决定是否重点投入") }
    ], S = e.computed(() => {
      const n = k.value, s = (i, D, ee) => L.value === i ? { state: "running" } : w.value[i] ? { state: "failed", error: w.value[i] } : D ? { state: "done", summary: ee } : { state: "todo" }, t = n ? n.sources.filter((i) => i.textLength).length : 0;
      return {
        search: s("search", !!n, n ? o.t("{n} 个来源", { n: n.sources.length }) : ""),
        fetch: s("fetch", !!n && n.stage !== "searched", n ? o.t("读到 {n} 个网页", { n: t }) : ""),
        compose: s("compose", n?.stage === "done", n?.stage === "done" ? o.t("{a} 条信息、{b} 条风险", { a: n.facts.length, b: n.risks.length }) : ""),
        checks: s("checks", !!n?.checkedAt, n?.checkedAt ? o.t("{n} 条红旗", { n: n.flags?.length || 0 }) : ""),
        judge: s("judge", A.value)
      };
    }), K = e.computed(() => R.find((n) => S.value[n.key].state !== "done")?.key || "judge");
    function J(n) {
      return { searched: o.t("已检索"), fetched: o.t("已读取"), done: o.t("已完成") }[n];
    }
    async function X(n, s) {
      L.value = n, w.value = { ...w.value, [n]: "" }, l.ftProgress.background = "", le.scrollToStep(n);
      try {
        return await s(), await l.refreshState(), !0;
      } catch (t) {
        return w.value = { ...w.value, [n]: l.errorMessage(t) }, !1;
      } finally {
        L.value = "";
      }
    }
    async function $() {
      await X("search", async () => {
        const n = await l.ft("background.search", { ...B, inquiryId: B.inquiryId || void 0 });
        U.value = n.id;
      });
    }
    async function a() {
      k.value && await X("fetch", () => l.ft("background.fetch", { id: k.value.id }));
    }
    async function p() {
      k.value && await X("compose", () => l.ft("background.compose", { id: k.value.id }));
    }
    async function y() {
      k.value && (T.value = "", await X("checks", async () => {
        const n = await l.ft("background.checks", { id: k.value.id });
        n?.screeningError && (T.value = o.t("名单筛查没做成：{p0}", { p0: n.screeningError }));
      }));
    }
    function z(n) {
      return { found: o.t("查到"), checked_none: o.t("查过没有"), not_checked: o.t("没查") }[n];
    }
    function N(n) {
      return { website: o.t("官网"), search: o.t("公开检索"), domain_age: o.t("域名注册时间"), mail_server: o.t("收信服务器"), email_domain: o.t("邮箱域名"), screening: o.t("名单筛查") }[n] || n;
    }
    function q(n) {
      return Date.now() - Date.parse(n) > 7 * 864e5;
    }
    async function E() {
      try {
        V.value = await l.ft("screening.status");
      } catch (n) {
        j.value = l.errorMessage(n);
      }
    }
    async function m() {
      _.value = "refresh", j.value = "", l.ftProgress.background = "";
      try {
        V.value = await l.ft("screening.refresh", {});
        const n = V.value.filter((s) => s.error && s.errorAt && Date.now() - Date.parse(s.errorAt) < 6e4);
        n.length && (j.value = o.t("{n} 份名单没更新成，原因写在表里；有缓存的继续用缓存", { n: n.length }));
      } catch (n) {
        j.value = l.errorMessage(n);
      } finally {
        _.value = "";
      }
    }
    async function h(n) {
      j.value = "";
      try {
        const s = await l.ft("files.pick", { filters: [{ name: o.t("名单文件"), extensions: ["json", "csv", "xml", "txt"] }] });
        if (!s?.length) return;
        _.value = "import", await l.ft("screening.import", { id: n, path: s[0] }), await E(), M.success(o.t("名单已导入"));
      } catch (s) {
        j.value = l.errorMessage(s);
      } finally {
        _.value = "";
      }
    }
    async function O() {
      _.value = "run", j.value = "";
      try {
        C.value = await l.ft("screening.run", { name: I.value, country: x.value || void 0, context: "manual" });
      } catch (n) {
        j.value = l.errorMessage(n), C.value = null;
      } finally {
        _.value = "";
      }
    }
    async function Z(n) {
      if (window.confirm(o.t("删除 {p0} 的背调记录？", { p0: n.company })))
        try {
          await l.ft("background.remove", { id: n.id }), U.value === n.id && (U.value = ""), await l.refreshState();
        } catch (s) {
          M.error(l.errorMessage(s));
        }
    }
    function c(n) {
      const s = window.electronAPI;
      s?.openExternal ? s.openExternal(n) : window.open(n, "_blank");
    }
    function F(n) {
      le.scrollToStep(n);
    }
    return (n, s) => (e.openBlock(), e.createElementBlock("div", gi, [
      e.createVNode(re, { meta: H.meta }, null, 8, ["meta"]),
      e.createElementVNode("section", hi, [
        e.createElementVNode("h4", null, [
          s[9] || (s[9] = e.createElementVNode(
            "i",
            { class: "ri-search-eye-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(n.$t("背调对象")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", fi, [
          e.createElementVNode("label", ki, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(n.$t("公司名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": s[0] || (s[0] = (t) => B.company = t),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                B.company,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", bi, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(n.$t("官网")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": s[1] || (s[1] = (t) => B.website = t),
                type: "text",
                placeholder: "https://"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                B.website,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", $i, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(n.$t("邮箱")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": s[2] || (s[2] = (t) => B.email = t),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                B.email,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Di, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(n.$t("国家/地区")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": s[3] || (s[3] = (t) => B.country = t),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                B.country,
                void 0,
                { trim: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode(
          "p",
          Si,
          e.toDisplayString(n.$t("至少填一项。只用公开网页信息，每条结论都附来源，方便核对。")),
          1
          /* TEXT */
        )
      ]),
      e.createCommentVNode(" 交易对手名单筛查（制裁 / 出口管制） "),
      e.createElementVNode("section", _i, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            s[10] || (s[10] = e.createElementVNode(
              "i",
              { class: "ri-shield-keyhole-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(n.$t("制裁 / 出口管制名单筛查")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            Bi,
            e.toDisplayString(n.$t("官方免费名单下载到本机后在本地比对，名字不会发给任何第三方。")),
            1
            /* TEXT */
          ),
          s[11] || (s[11] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: !!_.value,
            onClick: m
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(_.value === "refresh" ? "ri-loader-4-line spin" : "ri-download-cloud-2-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(n.$t("更新名单")),
              1
              /* TEXT */
            )
          ], 8, wi)
        ]),
        _.value === "refresh" && e.unref(l.ftProgress).background ? (e.openBlock(), e.createElementBlock("p", Ci, [
          s[12] || (s[12] = e.createElementVNode(
            "i",
            { class: "ri-loader-4-line spin" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(e.unref(l.ftProgress).background),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("div", Ti, [
          e.createElementVNode("table", Mi, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("名单")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("版本")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("下载时间")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Li,
                  e.toDisplayString(n.$t("条目")),
                  1
                  /* TEXT */
                ),
                s[13] || (s[13] = e.createElementVNode(
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
                e.renderList(V.value, (t) => (e.openBlock(), e.createElementBlock("tr", {
                  key: t.id,
                  "data-test": `ft-list-${t.id}`
                }, [
                  e.createElementVNode(
                    "td",
                    Ii,
                    e.toDisplayString(t.label),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(t.version || "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    t.fetchedAt ? (e.openBlock(), e.createElementBlock(
                      "span",
                      {
                        key: 0,
                        class: e.normalizeClass({ "ft-stale": q(t.fetchedAt) })
                      },
                      e.toDisplayString(e.unref(l.fmtDateTime)(t.fetchedAt)),
                      3
                      /* TEXT, CLASS */
                    )) : (e.openBlock(), e.createElementBlock(
                      "span",
                      Fi,
                      e.toDisplayString(n.$t("还没有")),
                      1
                      /* TEXT */
                    )),
                    t.error ? (e.openBlock(), e.createElementBlock(
                      "div",
                      Pi,
                      e.toDisplayString(n.$t("最近一次更新失败（{p0}）：{p1}", { p0: e.unref(l.fmtDateTime)(t.errorAt || ""), p1: t.error })) + e.toDisplayString(t.fetchedAt ? n.$t("，继续用上次的缓存") : ""),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0)
                  ]),
                  e.createElementVNode(
                    "td",
                    Ai,
                    e.toDisplayString(t.count ?? "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm ghost",
                      disabled: !!_.value,
                      "data-test": `ft-list-import-${t.id}`,
                      onClick: (i) => h(t.id)
                    }, [
                      s[14] || (s[14] = e.createElementVNode(
                        "i",
                        { class: "ri-file-upload-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(n.$t("导入文件")),
                        1
                        /* TEXT */
                      )
                    ], 8, Oi)
                  ])
                ], 8, Ui))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        e.createElementVNode(
          "p",
          zi,
          e.toDisplayString(n.$t("网络不通时：到名单官网下载文件（美国 CSL 的 JSON / CSV、联合国 XML、英国 CSV、欧盟 CSV）后点「导入文件」。名单超过 7 天会提示更新。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", qi, [
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": s[4] || (s[4] = (t) => I.value = t),
            type: "text",
            class: "ft-scr-input",
            "data-test": "ft-screen-name",
            placeholder: n.$t("公司或人名（英文原名最准）")
          }, null, 8, ji), [
            [
              e.vModelText,
              I.value,
              void 0,
              { trim: !0 }
            ]
          ]),
          e.withDirectives(e.createElementVNode("input", {
            "onUpdate:modelValue": s[5] || (s[5] = (t) => x.value = t),
            type: "text",
            class: "ft-scr-input sm",
            placeholder: n.$t("国家（可选）")
          }, null, 8, Ri), [
            [
              e.vModelText,
              x.value,
              void 0,
              { trim: !0 }
            ]
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            disabled: !I.value || !!_.value,
            "data-test": "ft-screen-run",
            onClick: O
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(_.value === "run" ? "ri-loader-4-line spin" : "ri-search-eye-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(n.$t("筛查")),
              1
              /* TEXT */
            )
          ], 8, Ki)
        ]),
        j.value ? (e.openBlock(), e.createElementBlock("p", xi, [
          s[15] || (s[15] = e.createElementVNode(
            "i",
            { class: "ri-error-warning-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(j.value),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        C.value ? (e.openBlock(), e.createBlock(he, {
          key: 2,
          result: C.value
        }, null, 8, ["result"])) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("div", Wi, [
        e.createElementVNode("aside", Hi, [
          e.createElementVNode(
            "div",
            Ji,
            e.toDisplayString(n.$t("背调记录")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(b.value, (t) => (e.openBlock(), e.createElementBlock("li", {
                key: t.id,
                class: e.normalizeClass({ active: t.id === U.value }),
                onClick: (i) => U.value = t.id
              }, [
                e.createElementVNode("div", Gi, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(t.company),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", t.stage === "done" ? "ok" : "warn"])
                    },
                    e.toDisplayString(J(t.stage)),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("div", Xi, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(l.fmtDateTime)(t.createdAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: e.withModifiers((i) => Z(t), ["stop"])
                  }, e.toDisplayString(n.$t("删除")), 9, Yi)
                ])
              ], 10, Qi))),
              128
              /* KEYED_FRAGMENT */
            )),
            b.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              Zi,
              e.toDisplayString(n.$t("还没有背调记录")),
              1
              /* TEXT */
            ))
          ])
        ]),
        e.createElementVNode("section", er, [
          e.createVNode(ie, {
            title: n.$t("客户背调"),
            metas: R,
            runtime: S.value,
            "current-key": K.value,
            onJump: F
          }, null, 8, ["title", "runtime", "current-key"]),
          L.value && e.unref(l.ftProgress).background ? (e.openBlock(), e.createElementBlock("p", tr, [
            s[16] || (s[16] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(l.ftProgress).background),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", lr, [
            e.createVNode(Q, {
              "step-key": "search",
              index: 0,
              title: R[0].title,
              hint: R[0].hint,
              runtime: S.value.search
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", nr, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!L.value || !P.value,
                    onClick: $
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(L.value === "search" ? "ri-loader-4-line spin" : "ri-search-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("开始检索")),
                      1
                      /* TEXT */
                    )
                  ], 8, or),
                  e.createElementVNode(
                    "span",
                    sr,
                    e.toDisplayString(n.$t("新检索会生成一条新的背调记录")),
                    1
                    /* TEXT */
                  )
                ]),
                k.value ? (e.openBlock(), e.createElementBlock("div", ar, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(k.value.sources, (t, i) => (e.openBlock(), e.createElementBlock("div", {
                      key: t.url,
                      class: "ft-source"
                    }, [
                      e.createElementVNode(
                        "span",
                        ir,
                        e.toDisplayString(i + 1),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        onClick: (D) => c(t.url)
                      }, e.toDisplayString(t.title || t.url), 9, rr),
                      e.createElementVNode(
                        "span",
                        dr,
                        e.toDisplayString(t.url),
                        1
                        /* TEXT */
                      ),
                      t.fetchError ? (e.openBlock(), e.createElementBlock("span", {
                        key: 0,
                        class: "ss-chip bad",
                        title: t.fetchError
                      }, e.toDisplayString(n.$t("未读到")), 9, cr)) : t.textLength ? (e.openBlock(), e.createElementBlock(
                        "span",
                        ur,
                        e.toDisplayString(n.$t("{n} 字", { n: t.textLength })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "fetch",
              index: 1,
              title: R[1].title,
              hint: R[1].hint,
              runtime: S.value.fetch
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", mr, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!L.value || !k.value,
                    onClick: a
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(L.value === "fetch" ? "ri-loader-4-line spin" : "ri-global-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(k.value && k.value.stage !== "searched" ? n.$t("重新读取") : n.$t("读取网页")),
                      1
                      /* TEXT */
                    )
                  ], 8, pr)
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "compose",
              index: 2,
              title: R[2].title,
              hint: R[2].hint,
              runtime: S.value.compose
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", vr, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!L.value || !k.value || k.value.stage === "searched",
                    onClick: p
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(L.value === "compose" ? "ri-loader-4-line spin" : "ri-file-list-3-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(k.value?.stage === "done" ? n.$t("重新整理") : n.$t("整理背调卡")),
                      1
                      /* TEXT */
                    )
                  ], 8, yr),
                  k.value?.model ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Vr,
                    e.toDisplayString(n.$t("由 {p0} 整理", { p0: e.unref(l.modelLabel)(k.value.model) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                k.value?.stage === "done" ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    k.value.summary ? (e.openBlock(), e.createElementBlock(
                      "p",
                      Nr,
                      e.toDisplayString(k.value.summary),
                      1
                      /* TEXT */
                    )) : e.createCommentVNode("v-if", !0),
                    k.value.facts.length ? (e.openBlock(), e.createElementBlock("div", Er, [
                      e.createElementVNode("table", gr, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(n.$t("项目")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(n.$t("内容")),
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
                            e.renderList(k.value.facts, (t, i) => (e.openBlock(), e.createElementBlock("tr", { key: i }, [
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(t.label),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                hr,
                                e.toDisplayString(t.value),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("td", null, [
                                t.source != null && k.value.sources[t.source] ? (e.openBlock(), e.createElementBlock("button", {
                                  key: 0,
                                  type: "button",
                                  class: "ss-link",
                                  onClick: (D) => c(k.value.sources[t.source].url)
                                }, "[" + e.toDisplayString(t.source + 1) + "]", 9, fr)) : (e.openBlock(), e.createElementBlock("span", kr, "—"))
                              ])
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ])
                    ])) : e.createCommentVNode("v-if", !0),
                    k.value.risks.length ? (e.openBlock(), e.createElementBlock("div", br, [
                      e.createElementVNode(
                        "div",
                        $r,
                        e.toDisplayString(n.$t("风险提示")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("ul", Dr, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(k.value.risks, (t, i) => (e.openBlock(), e.createElementBlock("li", { key: i }, [
                            s[17] || (s[17] = e.createElementVNode(
                              "i",
                              { class: "ri-error-warning-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createElementVNode("span", null, [
                              t.label ? (e.openBlock(), e.createElementBlock(
                                "strong",
                                Sr,
                                e.toDisplayString(n.$t("{p0}：", { p0: t.label })),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0),
                              e.createTextVNode(
                                e.toDisplayString(t.value),
                                1
                                /* TEXT */
                              )
                            ]),
                            t.source != null && k.value.sources[t.source] ? (e.openBlock(), e.createElementBlock("button", {
                              key: 0,
                              type: "button",
                              class: "ss-link",
                              onClick: (D) => c(k.value.sources[t.source].url)
                            }, "[" + e.toDisplayString(t.source + 1) + "]", 9, _r)) : e.createCommentVNode("v-if", !0)
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "checks",
              index: 3,
              title: R[3].title,
              hint: R[3].hint,
              runtime: S.value.checks
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Br, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!L.value || !k.value,
                    onClick: y
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(L.value === "checks" ? "ri-loader-4-line spin" : "ri-radar-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(k.value?.checkedAt ? n.$t("重新核查") : n.$t("核查域名、邮箱与名单")),
                      1
                      /* TEXT */
                    )
                  ], 8, wr),
                  k.value?.checkedAt ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Cr,
                    e.toDisplayString(n.$t("上次核查：{p0}", { p0: e.unref(l.fmtDateTime)(k.value.checkedAt) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                T.value ? (e.openBlock(), e.createElementBlock("p", Tr, [
                  s[18] || (s[18] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(T.value),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                k.value?.coverage?.length ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    e.createElementVNode(
                      "div",
                      Mr,
                      e.toDisplayString(n.$t("覆盖面")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Lr, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(k.value.coverage, (t) => (e.openBlock(), e.createElementBlock("span", {
                          key: t.area,
                          class: "ft-cov__item",
                          title: t.note || ""
                        }, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", t.status === "found" ? "ok" : t.status === "checked_none" ? "brand" : ""])
                            },
                            e.toDisplayString(z(t.status)),
                            3
                            /* TEXT, CLASS */
                          ),
                          e.createTextVNode(
                            " " + e.toDisplayString(N(t.area)),
                            1
                            /* TEXT */
                          ),
                          t.note ? (e.openBlock(), e.createElementBlock(
                            "small",
                            Ir,
                            " · " + e.toDisplayString(t.note),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ], 8, Ur))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    k.value.flags?.length ? (e.openBlock(), e.createElementBlock("div", Fr, [
                      e.createElementVNode(
                        "div",
                        Pr,
                        e.toDisplayString(n.$t("红旗（按规则判定，不经模型）")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("ul", Ar, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(k.value.flags, (t) => (e.openBlock(), e.createElementBlock("li", {
                            key: t.rule,
                            "data-rule": t.rule
                          }, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["ss-chip", t.level === "critical" ? "bad" : "warn"])
                              },
                              e.toDisplayString(t.level === "critical" ? n.$t("严重") : n.$t("一般")),
                              3
                              /* TEXT, CLASS */
                            ),
                            e.createElementVNode(
                              "span",
                              null,
                              e.toDisplayString(t.message),
                              1
                              /* TEXT */
                            )
                          ], 8, Or))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])) : (e.openBlock(), e.createElementBlock("p", zr, [
                      s[19] || (s[19] = e.createElementVNode(
                        "i",
                        { class: "ri-check-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(n.$t("没有发现规则能判定的红旗")),
                        1
                        /* TEXT */
                      )
                    ])),
                    k.value.screening ? (e.openBlock(), e.createBlock(he, {
                      key: 2,
                      result: k.value.screening
                    }, null, 8, ["result"])) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "judge",
              index: 4,
              title: R[4].title,
              hint: R[4].hint,
              runtime: S.value.judge
            }, {
              default: e.withCtx(() => [
                k.value?.suggestion ? (e.openBlock(), e.createElementBlock("p", qr, [
                  s[20] || (s[20] = e.createElementVNode(
                    "i",
                    { class: "ri-lightbulb-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(k.value.suggestion),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode(
                  "p",
                  jr,
                  e.toDisplayString(n.$t("以上是参考意见，是否重点投入由业务员决定。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", Rr, [
                  k.value?.inquiryId ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: s[6] || (s[6] = (t) => n.$emit("goto", "inquiry", { inquiryId: k.value.inquiryId }))
                  }, [
                    s[21] || (s[21] = e.createElementVNode(
                      "i",
                      { class: "ri-mail-open-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("回到询盘")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  k.value?.inquiryId ? (e.openBlock(), e.createElementBlock("button", {
                    key: 1,
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: s[7] || (s[7] = (t) => n.$emit("goto", "quote", { inquiryId: k.value.inquiryId }))
                  }, [
                    s[22] || (s[22] = e.createElementVNode(
                      "i",
                      { class: "ri-price-tag-3-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("去报价")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm primary",
                    disabled: k.value?.stage !== "done",
                    onClick: s[8] || (s[8] = (t) => A.value = !0)
                  }, [
                    s[23] || (s[23] = e.createElementVNode(
                      "i",
                      { class: "ri-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("已看过，人工判断完成")),
                      1
                      /* TEXT */
                    )
                  ], 8, Kr)
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"])
          ])
        ])
      ])
    ]));
  }
}), Wr = /* @__PURE__ */ se(xr, [["__scopeId", "data-v-7c9753c8"]]), Hr = { class: "ss-module" }, Jr = { class: "ss-rules" }, Qr = { class: "ss-rule-row" }, Gr = { class: "lbl" }, Xr = ["value"], Yr = { class: "lbl" }, Zr = { class: "ss-rule-row" }, ed = { class: "lbl" }, td = ["value"], ld = { class: "lbl" }, nd = { class: "ss-rule-row" }, od = { class: "lbl" }, sd = ["value"], ad = { class: "lbl" }, id = { class: "ss-steps" }, rd = { class: "ss-kpis" }, dd = { class: "ss-kpi" }, cd = { class: "ss-kpi" }, ud = { class: "ss-kpi" }, md = { class: "ss-kpi" }, pd = { class: "ss-actions" }, vd = ["disabled"], yd = {
  key: 0,
  class: "ss-muted"
}, Vd = {
  key: 0,
  class: "ss-table-wrap"
}, Nd = { class: "ss-table" }, Ed = ["onClick"], gd = { class: "ss-muted" }, hd = { class: "ss-muted ft-wrap" }, fd = {
  key: 0,
  class: "ss-chip ok"
}, kd = {
  key: 1,
  class: "ss-chip brand"
}, bd = {
  key: 1,
  class: "ss-note ok"
}, $d = { class: "ss-actions" }, Dd = ["disabled"], Sd = { class: "ft-timeline" }, _d = { class: "ss-subhead" }, Bd = { class: "ss-muted" }, wd = {
  key: 0,
  class: "ss-muted"
}, Cd = { class: "ss-muted" }, Td = { class: "ss-field" }, Md = { class: "ss-field" }, Ld = { class: "ss-field" }, Ud = {
  key: 1,
  class: "ss-empty"
}, Id = { class: "ss-actions" }, Fd = { class: "ss-muted" }, Pd = { value: "" }, Ad = ["value"], Od = ["disabled"], zd = /* @__PURE__ */ e.defineComponent({
  __name: "FollowupTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(H) {
    const W = ae.useNotificationStore(), M = e.ref(""), B = e.ref({}), U = e.ref([]), L = e.ref(""), w = e.ref(""), A = e.ref([]), T = e.reactive({}), V = e.reactive({}), _ = e.reactive({ to: "", subject: "", body: "" }), I = e.ref(""), x = e.ref(null), C = e.computed(() => l.ftState.value?.settings.followupRules), j = e.computed(() => U.value.find((E) => E.key === w.value) || null), b = e.computed(() => {
      const E = l.ftState.value, m = E?.messages || [];
      return {
        inbound: m.filter((h) => h.direction === "in").length,
        outbound: m.filter((h) => h.direction === "out").length,
        customers: new Set((E?.inquiries || []).map((h) => h.customerEmail)).size,
        quotes: (E?.quotes || []).filter((h) => h.status === "sent").length
      };
    }), k = [
      { key: "history", title: o.t("汇总往来记录"), hint: o.t("所有接管邮箱的收发邮件、报价、订单按客户归到一起") },
      { key: "scan", title: o.t("找出待跟进"), hint: o.t("按规则找出询盘未回、报价未回和沉默的客户") },
      { key: "draft", title: o.t("生成跟进草稿"), hint: o.t("结合往来记录写跟进邮件，不擅自降价") },
      { key: "send", title: o.t("确认发送"), hint: o.t("业务员修改确认后发出") }
    ], P = e.computed(() => {
      const E = (m, h, O) => M.value === m ? { state: "running" } : B.value[m] ? { state: "failed", error: B.value[m] } : h ? { state: "done", summary: O } : { state: "todo" };
      return {
        history: E("history", b.value.inbound + b.value.outbound > 0, o.t("{n} 位客户", { n: b.value.customers })),
        scan: E("scan", !!L.value, o.t("{n} 位待跟进", { n: U.value.length })),
        draft: E("draft", Object.keys(T).length > 0, o.t("{n} 份草稿", { n: Object.keys(T).length })),
        send: E("send", Object.keys(V).length > 0, o.t("已发 {n} 封", { n: Object.keys(V).length }))
      };
    }), R = e.computed(() => k.find((E) => P.value[E.key].state !== "done")?.key || "send");
    function S(E) {
      return { inquiry_unanswered: o.t("询盘未回复"), quote_no_reply: o.t("报价未回复"), silent: o.t("沉默客户") }[E];
    }
    function K(E) {
      return E === "inquiry_unanswered" ? "bad" : E === "quote_no_reply" ? "warn" : "";
    }
    function J(E) {
      return { in: o.t("客户来信"), out: o.t("我方发出"), quote: o.t("报价"), order: o.t("订单") }[E];
    }
    function X(E) {
      return E === "in" ? "brand" : E === "out" ? "ok" : "warn";
    }
    async function $(E, m) {
      M.value = E, B.value = { ...B.value, [E]: "" }, le.scrollToStep(E);
      try {
        return await m(), !0;
      } catch (h) {
        return B.value = { ...B.value, [E]: l.errorMessage(h) }, !1;
      } finally {
        M.value = "";
      }
    }
    async function a(E, m) {
      const h = Number(m.target.value);
      if (!(!(h > 0) || !C.value))
        try {
          await l.ft("settings.patch", { patch: { followupRules: { ...C.value, [E]: h } } }), await l.refreshState();
        } catch (O) {
          W.error(l.errorMessage(O));
        }
    }
    async function p() {
      await $("scan", async () => {
        U.value = await l.ft("followup.scan"), L.value = (/* @__PURE__ */ new Date()).toISOString(), w.value && !U.value.some((E) => E.key === w.value) && (w.value = "");
      });
    }
    async function y(E) {
      w.value = E.key, x.value = null, I.value = E.mailboxId || I.value;
      const m = T[E.key];
      Object.assign(_, { to: E.customerEmail, subject: m?.subject || "", body: m?.body || "" });
      try {
        A.value = await l.ft("followup.timeline", { email: E.customerEmail });
      } catch {
        A.value = [];
      }
      le.scrollToStep("draft");
    }
    async function z(E) {
      await $("draft", async () => {
        const m = await l.ft("followup.draft", { item: E });
        T[E.key] = m, Object.assign(_, { to: E.customerEmail, subject: m.subject, body: m.body });
      });
    }
    async function N() {
      const E = j.value;
      if (!E || !I.value) return;
      const m = l.splitEmails(_.to);
      if (!m.length) {
        W.warn(o.t("请填写收件人"));
        return;
      }
      const h = { key: E.key, reason: E.reason, since: E.since, refId: E.refId };
      let O;
      try {
        const c = await l.checkBeforeSend({ kind: "followup", mailboxId: I.value, to: m, subject: _.subject, body: _.body, refId: E.key, item: h }, l.mailboxName(l.ftState.value, I.value));
        x.value = c.result, O = c.hash;
      } catch (c) {
        W.error(l.errorMessage(c));
        return;
      }
      if (!O) return;
      await $("send", async () => {
        await l.ft("followup.send", { mailboxId: I.value, to: m, subject: _.subject, body: _.body, approvedHash: O, item: h }), V[E.key] = !0, await l.refreshState();
      }) && W.success(o.t("已发送"));
    }
    function q(E) {
      le.scrollToStep(E);
    }
    return (E, m) => (e.openBlock(), e.createElementBlock("div", Hr, [
      e.createVNode(re, { meta: H.meta }, null, 8, ["meta"]),
      e.createElementVNode("section", Jr, [
        e.createElementVNode("h4", null, [
          m[9] || (m[9] = e.createElementVNode(
            "i",
            { class: "ri-alarm-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(E.$t("跟进规则")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Qr, [
          e.createElementVNode(
            "span",
            Gr,
            e.toDisplayString(E.$t("询盘收到后")),
            1
            /* TEXT */
          ),
          e.createElementVNode("input", {
            type: "number",
            min: "1",
            value: C.value?.inquiryNoReplyHours,
            onChange: m[0] || (m[0] = (h) => a("inquiryNoReplyHours", h))
          }, null, 40, Xr),
          e.createElementVNode(
            "span",
            Yr,
            e.toDisplayString(E.$t("小时未回复")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Zr, [
          e.createElementVNode(
            "span",
            ed,
            e.toDisplayString(E.$t("报价发出后")),
            1
            /* TEXT */
          ),
          e.createElementVNode("input", {
            type: "number",
            min: "1",
            value: C.value?.quoteNoReplyDays,
            onChange: m[1] || (m[1] = (h) => a("quoteNoReplyDays", h))
          }, null, 40, td),
          e.createElementVNode(
            "span",
            ld,
            e.toDisplayString(E.$t("天客户没回信")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", nd, [
          e.createElementVNode(
            "span",
            od,
            e.toDisplayString(E.$t("超过")),
            1
            /* TEXT */
          ),
          e.createElementVNode("input", {
            type: "number",
            min: "1",
            value: C.value?.silentDays,
            onChange: m[2] || (m[2] = (h) => a("silentDays", h))
          }, null, 40, sd),
          e.createElementVNode(
            "span",
            ad,
            e.toDisplayString(E.$t("天没有往来算沉默客户")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createVNode(ie, {
        title: E.$t("客户跟进"),
        metas: k,
        runtime: P.value,
        "current-key": R.value,
        onJump: q
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", id, [
        e.createVNode(Q, {
          "step-key": "history",
          index: 0,
          title: k[0].title,
          hint: k[0].hint,
          runtime: P.value.history
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", rd, [
              e.createElementVNode("div", dd, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(E.$t("收到邮件")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(b.value.inbound),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", cd, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(E.$t("发出邮件")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(b.value.outbound),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", ud, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(E.$t("客户数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(b.value.customers),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", md, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(E.$t("已发报价")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(b.value.quotes),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "scan",
          index: 1,
          title: k[1].title,
          hint: k[1].hint,
          runtime: P.value.scan
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", pd, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!M.value,
                onClick: p
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(M.value === "scan" ? "ri-loader-4-line spin" : "ri-search-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(E.$t("找出今天该跟进的客户")),
                  1
                  /* TEXT */
                )
              ], 8, vd),
              L.value ? (e.openBlock(), e.createElementBlock(
                "span",
                yd,
                e.toDisplayString(E.$t("上次检查：{p0}", { p0: e.unref(l.fmtDateTime)(L.value) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            U.value.length ? (e.openBlock(), e.createElementBlock("div", Vd, [
              e.createElementVNode("table", Nd, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(E.$t("客户")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(E.$t("原因")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(E.$t("起算时间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(E.$t("最近往来")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(E.$t("邮箱")),
                      1
                      /* TEXT */
                    ),
                    m[10] || (m[10] = e.createElementVNode(
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
                    e.renderList(U.value, (h) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: h.key,
                        class: e.normalizeClass({ "ft-active": h.key === w.value })
                      },
                      [
                        e.createElementVNode("td", null, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            onClick: (O) => y(h)
                          }, [
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(h.customerName),
                              1
                              /* TEXT */
                            )
                          ], 8, Ed),
                          e.createElementVNode(
                            "div",
                            gd,
                            e.toDisplayString(h.customerEmail),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", K(h.reason)])
                            },
                            e.toDisplayString(S(h.reason)),
                            3
                            /* TEXT, CLASS */
                          )
                        ]),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(e.unref(l.fmtDateTime)(h.since)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.createTextVNode(
                            e.toDisplayString(h.lastContactAt ? e.unref(l.fmtDateTime)(h.lastContactAt) : "—"),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "div",
                            hd,
                            e.toDisplayString(h.lastSubject),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(e.unref(l.mailboxName)(e.unref(l.ftState), h.mailboxId) || "—"),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          V[h.key] ? (e.openBlock(), e.createElementBlock(
                            "span",
                            fd,
                            e.toDisplayString(E.$t("已发送")),
                            1
                            /* TEXT */
                          )) : T[h.key] ? (e.openBlock(), e.createElementBlock(
                            "span",
                            kd,
                            e.toDisplayString(E.$t("已写草稿")),
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
                ])
              ])
            ])) : L.value ? (e.openBlock(), e.createElementBlock("p", bd, [
              m[11] || (m[11] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(E.$t("目前没有需要跟进的客户")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "draft",
          index: 2,
          title: k[2].title,
          hint: k[2].hint,
          runtime: P.value.draft
        }, {
          default: e.withCtx(() => [
            j.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", $d, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(j.value.customerName),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", K(j.value.reason)])
                    },
                    e.toDisplayString(S(j.value.reason)),
                    3
                    /* TEXT, CLASS */
                  ),
                  m[12] || (m[12] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!M.value,
                    onClick: m[3] || (m[3] = (h) => z(j.value))
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(M.value === "draft" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(T[j.value.key] ? E.$t("重新生成") : E.$t("生成跟进草稿")),
                      1
                      /* TEXT */
                    )
                  ], 8, Dd)
                ]),
                e.createElementVNode("div", Sd, [
                  e.createElementVNode(
                    "div",
                    _d,
                    e.toDisplayString(E.$t("往来记录")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("ul", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(A.value, (h, O) => (e.openBlock(), e.createElementBlock("li", { key: O }, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", X(h.kind)])
                          },
                          e.toDisplayString(J(h.kind)),
                          3
                          /* TEXT, CLASS */
                        ),
                        e.createElementVNode(
                          "span",
                          Bd,
                          e.toDisplayString(e.unref(l.fmtDateTime)(h.at)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(h.subject),
                          1
                          /* TEXT */
                        )
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    A.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                      "li",
                      wd,
                      e.toDisplayString(E.$t("没有往来记录")),
                      1
                      /* TEXT */
                    ))
                  ])
                ]),
                T[j.value.key] ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode(
                      "p",
                      Cd,
                      e.toDisplayString(E.$t("由 {p0} 撰写", { p0: e.unref(l.modelLabel)(T[j.value.key].model) })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("label", Td, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(E.$t("收件人")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": m[4] || (m[4] = (h) => _.to = h),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, _.to]
                      ])
                    ]),
                    e.createElementVNode("label", Md, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(E.$t("标题")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": m[5] || (m[5] = (h) => _.subject = h),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, _.subject]
                      ])
                    ]),
                    e.createElementVNode("label", Ld, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(E.$t("正文")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "textarea",
                        {
                          "onUpdate:modelValue": m[6] || (m[6] = (h) => _.body = h),
                          rows: "10"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, _.body]
                      ])
                    ])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0),
                e.createVNode(pe, {
                  result: x.value,
                  "opt-out-line": e.unref(l.ftState)?.settings.sendRules.optOutLine,
                  onFixOptOut: m[7] || (m[7] = (h) => _.body = `${_.body.trimEnd()}

${h}`)
                }, null, 8, ["result", "opt-out-line"])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Ud,
              e.toDisplayString(E.$t("在上一步的列表里点一个客户")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "send",
          index: 3,
          title: k[3].title,
          hint: k[3].hint,
          runtime: P.value.send
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Id, [
              e.createElementVNode(
                "span",
                Fd,
                e.toDisplayString(E.$t("发件邮箱")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": m[8] || (m[8] = (h) => I.value = h),
                  class: "ft-select"
                },
                [
                  e.createElementVNode(
                    "option",
                    Pd,
                    e.toDisplayString(E.$t("请选择")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(l.enabledMailboxes)(e.unref(l.ftState)), (h) => (e.openBlock(), e.createElementBlock("option", {
                      key: h.id,
                      value: h.id
                    }, e.toDisplayString(h.label || h.address), 9, Ad))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [e.vModelSelect, I.value]
              ]),
              m[13] || (m[13] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !j.value || !T[j.value.key] || !I.value || M.value === "send",
                onClick: N
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(M.value === "send" ? "ri-loader-4-line spin" : "ri-send-plane-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(E.$t("发送")),
                  1
                  /* TEXT */
                )
              ], 8, Od)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), qd = /* @__PURE__ */ se(zd, [["__scopeId", "data-v-8b97cd54"]]), jd = { class: "ss-module" }, Rd = { class: "ss-rules" }, Kd = {
  key: 0,
  class: "ss-muted"
}, xd = { class: "ss-grid" }, Wd = { class: "ss-field" }, Hd = { class: "ss-field" }, Jd = { class: "ss-field" }, Qd = { class: "ss-actions" }, Gd = { class: "ss-steps" }, Xd = { class: "ss-grid" }, Yd = { class: "ss-field" }, Zd = ["value"], ec = { class: "ss-field" }, tc = { value: "" }, lc = ["value"], nc = { class: "ss-field" }, oc = ["value"], sc = { class: "ss-field" }, ac = ["placeholder"], ic = { class: "ss-field" }, rc = { class: "ss-actions" }, dc = ["disabled"], cc = {
  key: 0,
  class: "ss-muted"
}, uc = { class: "ss-field" }, mc = { class: "ss-field" }, pc = { class: "ss-field" }, vc = { class: "ss-actions" }, yc = ["disabled"], Vc = {
  key: 0,
  class: "ss-muted"
}, Nc = { class: "ss-actions" }, Ec = ["disabled"], gc = {
  key: 0,
  class: "ss-note info"
}, hc = ["onUpdate:modelValue"], fc = ["onClick"], kc = { class: "ss-actions" }, bc = ["disabled"], $c = {
  key: 1,
  class: "ss-muted"
}, Dc = {
  key: 2,
  class: "ft-thumbs"
}, Sc = ["onClick"], _c = ["src"], Bc = {
  key: 0,
  class: "ss-muted"
}, wc = { class: "ss-actions" }, Cc = ["disabled"], Tc = { class: "ss-muted" }, Mc = ["placeholder"], Lc = ["disabled"], Uc = { class: "ss-muted" }, Ic = {
  key: 0,
  class: "ss-muted"
}, Fc = {
  key: 1,
  class: "ft-videos"
}, Pc = ["src"], Ac = {
  key: 0,
  class: "ss-actions"
}, Oc = ["disabled"], zc = ["disabled"], qc = ["disabled"], jc = ["disabled"], Rc = {
  key: 1,
  class: "ss-muted"
}, Kc = { class: "ss-panel" }, xc = { class: "ss-muted" }, Wc = {
  key: 0,
  class: "ss-table-wrap"
}, Hc = { class: "ss-table" }, Jc = { class: "ft-wrap" }, Qc = {
  key: 0,
  class: "ss-chip brand"
}, Gc = ["onClick"], Xc = ["onClick"], Yc = {
  key: 1,
  class: "ss-empty"
}, Zc = /* @__PURE__ */ e.defineComponent({
  __name: "ContentTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(H) {
    const W = H, M = ae.useNotificationStore(), B = l.ftState, U = [
      { value: "product_listing", label: o.t("平台上架文案") },
      { value: "product_desc", label: o.t("产品说明") },
      { value: "social_post", label: o.t("社媒帖子") },
      { value: "article", label: o.t("官网文章") },
      { value: "outreach_template", label: o.t("开发信模板") }
    ], L = [
      { value: "English", label: "English" },
      { value: "Spanish", label: "Español" },
      { value: "Arabic", label: "العربية" },
      { value: "French", label: "Français" },
      { value: "Russian", label: "Русский" },
      { value: "Portuguese", label: "Português" },
      { value: "Chinese", label: o.t("中文") }
    ];
    function w(s) {
      return U.find((t) => t.value === s)?.label || s;
    }
    const A = e.reactive({ kind: "product_listing", productId: "", language: "English", topic: "", extra: "" }), T = e.ref(""), V = e.computed(() => B.value?.contents.find((s) => s.id === T.value) || null), _ = e.ref(null), I = e.ref([]), x = e.ref(""), C = e.ref(""), j = e.ref(""), b = e.ref(""), k = e.ref({}), P = e.ref(!1), R = e.reactive({ company: "", intro: "", sellingPoints: "" });
    e.watch(() => B.value?.settings.brand, (s) => {
      s && Object.assign(R, s);
    }, { immediate: !0 });
    const S = e.computed(() => {
      const s = B.value?.settings.brand;
      return s?.company ? `${s.company}${s.sellingPoints ? ` · ${s.sellingPoints.slice(0, 60)}` : ""}` : o.t("还没有填写公司信息，生成的文案落款会用占位符");
    });
    e.watch(() => V.value?.id, () => {
      const s = V.value;
      _.value = s ? { title: s.title, body: s.body, keywords: (s.keywords || []).join(", ") } : null, C.value = s?.images[0] || "", k.value = {};
    }), e.watch(() => W.focus, (s) => {
      s?.contentId && (T.value = s.contentId), s?.productId && (A.productId = s.productId);
    }, { immediate: !0 });
    const K = [
      { key: "pick", title: o.t("选择内容类型与产品"), hint: o.t("写什么、为哪个产品写、用什么语言") },
      { key: "write", title: o.t("生成文案"), hint: o.t("只用你给的资料，缺的写成「请补充」占位") },
      { key: "images", title: o.t("产品图片"), hint: o.t("按描述生成主图、场景图、细节图，也可以用实拍图做底") },
      { key: "video", title: o.t("产品视频"), hint: o.t("全部图片成片，或用一张图生成 AI 视频") },
      { key: "approve", title: o.t("审核定稿"), hint: o.t("人审核通过后，才能交给数字员工发布") }
    ], J = e.computed(() => {
      const s = V.value, t = (i, D, ee) => b.value === i || i === "images" && b.value === "prompts" ? { state: "running" } : k.value[i] ? { state: "failed", error: k.value[i] } : D ? { state: "done", summary: ee } : { state: "todo" };
      return {
        pick: t("pick", !!s || !!A.topic || !!A.productId),
        write: t("write", !!s, s ? s.title : ""),
        images: t("images", !!s?.images.length, s ? o.t("{n} 张", { n: s.images.length }) : ""),
        video: t("video", !!s?.videos.length, s ? o.t("{n} 个", { n: s.videos.length }) : ""),
        approve: t("approve", s?.status === "approved")
      };
    }), X = e.computed(() => K.find((s) => J.value[s.key].state !== "done")?.key || "approve");
    async function $(s, t) {
      b.value = s, k.value = { ...k.value, [s === "prompts" ? "images" : s]: "" }, le.scrollToStep(s === "prompts" ? "images" : s);
      try {
        return await t(), await l.refreshState(), !0;
      } catch (i) {
        return k.value = { ...k.value, [s === "prompts" ? "images" : s]: l.errorMessage(i) }, !1;
      } finally {
        b.value = "";
      }
    }
    async function a() {
      try {
        await l.ft("settings.patch", { patch: { brand: { ...R } } }), await l.refreshState(), P.value = !1, M.success(o.t("已保存"));
      } catch (s) {
        M.error(l.errorMessage(s));
      }
    }
    async function p() {
      await $("write", async () => {
        const s = await l.ft("content.generate", { ...A });
        T.value = s.id, I.value = [];
      });
    }
    async function y() {
      if (!V.value || !_.value) return;
      const s = _.value;
      await $("save", () => l.ft("content.save", { draft: { id: V.value.id, title: s.title, body: s.body, keywords: s.keywords.split(/[,，]+/).map((t) => t.trim()).filter(Boolean) } })), M.success(o.t("已保存"));
    }
    async function z() {
      V.value && await $("prompts", async () => {
        I.value = await l.ft("content.imagePrompts", { id: V.value.id, count: 4 });
      });
    }
    async function N() {
      const s = await l.ft("files.pick", { filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }] });
      s[0] && (x.value = s[0]);
    }
    async function q() {
      if (!V.value) return;
      const s = await l.ft("files.pick", { multi: !0, filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }] });
      s.length && await $("images", () => l.ft("content.addImages", { id: V.value.id, paths: s }));
    }
    async function E() {
      V.value && await $("images", async () => {
        const s = await l.ft("content.images", { id: V.value.id, prompts: I.value.filter(Boolean), referenceImage: x.value || void 0 });
        s.errors?.length && M.warn(o.t("有 {n} 张没生成出来：{p0}", { n: s.errors.length, p0: s.errors[0] })), C.value || (C.value = s.draft.images[0] || "");
      });
    }
    async function m() {
      if (!V.value) return;
      const s = V.value;
      await $("video", async () => {
        const t = await l.ft("content.materialDir", { id: s.id }), i = await window.electronAPI.solution.videoGenerate({ script: "oneclick", materialDir: t, perImage: 2.2, width: 1080, height: 1080, title: s.title });
        if (i?.cancelled) throw new Error(o.t("已取消"));
        if (!i?.ok || !i.videoPath) throw new Error(i?.error || o.t("成片失败"));
        await l.ft("content.attachVideo", { id: s.id, path: i.videoPath });
      });
    }
    async function h() {
      !V.value || !C.value || await $("video", () => l.ft("content.video", { id: V.value.id, image: C.value, prompt: j.value }));
    }
    async function O() {
      V.value && (_.value && await y(), await $("approve", () => l.ft("content.save", { draft: { id: V.value.id, status: "approved" } })));
    }
    async function Z() {
      V.value && (await $("export", async () => {
        const s = await l.ft("content.export", { id: V.value.id });
        await l.ft("path.open", { path: s });
      }), k.value.export && M.error(k.value.export));
    }
    function c(s) {
      T.value = s, le.scrollToStep("write");
    }
    async function F(s) {
      if (window.confirm(o.t("确定删除这条内容？已生成的图片和视频文件会保留在输出目录。")))
        try {
          await l.ft("content.remove", { id: s }), T.value === s && (T.value = ""), await l.refreshState();
        } catch (t) {
          M.error(l.errorMessage(t));
        }
    }
    function n(s) {
      le.scrollToStep(s);
    }
    return (s, t) => (e.openBlock(), e.createElementBlock("div", jd, [
      e.createVNode(re, { meta: H.meta }, null, 8, ["meta"]),
      e.createCommentVNode(" 公司信息（写文案、开发信都会用到） "),
      e.createElementVNode("section", Rd, [
        e.createElementVNode("h4", null, [
          t[17] || (t[17] = e.createElementVNode(
            "i",
            { class: "ri-building-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(s.$t("公司信息")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: t[0] || (t[0] = (i) => P.value = !P.value)
            },
            e.toDisplayString(P.value ? s.$t("收起") : s.$t("编辑")),
            1
            /* TEXT */
          )
        ]),
        P.value ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 1 },
          [
            e.createElementVNode("div", xd, [
              e.createElementVNode("label", Wd, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(s.$t("公司名称")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": t[1] || (t[1] = (i) => R.company = i),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, R.company]
                ])
              ])
            ]),
            e.createElementVNode("label", Hd, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(s.$t("公司介绍")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": t[2] || (t[2] = (i) => R.intro = i),
                  rows: "3"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, R.intro]
              ])
            ]),
            e.createElementVNode("label", Jd, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(s.$t("核心卖点")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": t[3] || (t[3] = (i) => R.sellingPoints = i),
                  rows: "3"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, R.sellingPoints]
              ])
            ]),
            e.createElementVNode("div", Qd, [
              t[19] || (t[19] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm primary",
                onClick: a
              }, [
                t[18] || (t[18] = e.createElementVNode(
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
              ])
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        )) : (e.openBlock(), e.createElementBlock(
          "p",
          Kd,
          e.toDisplayString(S.value),
          1
          /* TEXT */
        ))
      ]),
      e.createVNode(ie, {
        title: s.$t("内容生产"),
        metas: K,
        runtime: J.value,
        "current-key": X.value,
        onJump: n
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", Gd, [
        e.createVNode(Q, {
          "step-key": "pick",
          index: 0,
          title: K[0].title,
          hint: K[0].hint,
          runtime: J.value.pick
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Xd, [
              e.createElementVNode("label", Yd, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(s.$t("内容类型")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": t[4] || (t[4] = (i) => A.kind = i)
                  },
                  [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(U, (i) => e.createElementVNode("option", {
                        key: i.value,
                        value: i.value
                      }, e.toDisplayString(i.label), 9, Zd)),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, A.kind]
                ])
              ]),
              e.createElementVNode("label", ec, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(s.$t("产品")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": t[5] || (t[5] = (i) => A.productId = i)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      tc,
                      e.toDisplayString(s.$t("不指定产品")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(e.unref(B)?.products || [], (i) => (e.openBlock(), e.createElementBlock("option", {
                        key: i.id,
                        value: i.id
                      }, e.toDisplayString(i.model) + " · " + e.toDisplayString(i.name), 9, lc))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, A.productId]
                ])
              ]),
              e.createElementVNode("label", nc, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(s.$t("语言")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": t[6] || (t[6] = (i) => A.language = i)
                  },
                  [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(L, (i) => e.createElementVNode("option", {
                        key: i.value,
                        value: i.value
                      }, e.toDisplayString(i.label), 9, oc)),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, A.language]
                ])
              ])
            ]),
            e.createElementVNode("label", sc, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(s.$t("主题 / 要点")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": t[7] || (t[7] = (i) => A.topic = i),
                type: "text",
                placeholder: s.$t("例如：主打防水性能，面向中东户外市场")
              }, null, 8, ac), [
                [e.vModelText, A.topic]
              ])
            ]),
            e.createElementVNode("label", ic, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(s.$t("补充资料（参数、认证、案例等，只会使用这里写的内容）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": t[8] || (t[8] = (i) => A.extra = i),
                  rows: "3"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, A.extra]
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "write",
          index: 1,
          title: K[1].title,
          hint: K[1].hint,
          runtime: J.value.write
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", rc, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: b.value === "write",
                onClick: p
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(b.value === "write" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(V.value ? s.$t("重新生成") : s.$t("生成文案")),
                  1
                  /* TEXT */
                )
              ], 8, dc),
              V.value ? (e.openBlock(), e.createElementBlock(
                "span",
                cc,
                e.toDisplayString(s.$t("由 {p0} 撰写", { p0: e.unref(l.modelLabel)(V.value.model) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            _.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("label", uc, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.$t("标题")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": t[9] || (t[9] = (i) => _.value.title = i),
                      type: "text"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, _.value.title]
                  ])
                ]),
                e.createElementVNode("label", mc, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.$t("关键词（逗号分隔）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": t[10] || (t[10] = (i) => _.value.keywords = i),
                      type: "text"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, _.value.keywords]
                  ])
                ]),
                e.createElementVNode("label", pc, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(s.$t("正文")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": t[11] || (t[11] = (i) => _.value.body = i),
                      rows: "14"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelText, _.value.body]
                  ])
                ]),
                e.createElementVNode("div", vc, [
                  t[21] || (t[21] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: b.value === "save",
                    onClick: y
                  }, [
                    t[20] || (t[20] = e.createElementVNode(
                      "i",
                      { class: "ri-save-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("保存修改")),
                      1
                      /* TEXT */
                    )
                  ], 8, yc)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "images",
          index: 2,
          title: K[2].title,
          hint: K[2].hint,
          runtime: J.value.images
        }, {
          default: e.withCtx(() => [
            V.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", Nc, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: b.value === "prompts",
                    onClick: z
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(b.value === "prompts" ? "ri-loader-4-line spin" : "ri-lightbulb-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("生成图片描述")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ec),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost",
                    onClick: N
                  }, [
                    t[22] || (t[22] = e.createElementVNode(
                      "i",
                      { class: "ri-image-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(x.value ? s.$t("更换产品实拍图") : s.$t("选择产品实拍图（可选）")),
                      1
                      /* TEXT */
                    )
                  ]),
                  x.value ? (e.openBlock(), e.createElementBlock(
                    "button",
                    {
                      key: 0,
                      type: "button",
                      class: "ss-link",
                      onClick: t[12] || (t[12] = (i) => x.value = "")
                    },
                    e.toDisplayString(s.$t("不用实拍图")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  t[24] || (t[24] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost",
                    onClick: q
                  }, [
                    t[23] || (t[23] = e.createElementVNode(
                      "i",
                      { class: "ri-upload-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("上传已有图片")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                x.value ? (e.openBlock(), e.createElementBlock("p", gc, [
                  t[25] || (t[25] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(s.$t("会以这张实拍图为底图生成场景图，产品外观保持一致：{p0}", { p0: x.value })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(I.value, (i, D) => (e.openBlock(), e.createElementBlock("div", {
                    key: D,
                    class: "ft-prompt"
                  }, [
                    e.withDirectives(e.createElementVNode("textarea", {
                      "onUpdate:modelValue": (ee) => I.value[D] = ee,
                      rows: "2"
                    }, null, 8, hc), [
                      [e.vModelText, I.value[D]]
                    ]),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm ghost",
                      onClick: (ee) => I.value.splice(D, 1)
                    }, [...t[26] || (t[26] = [
                      e.createElementVNode(
                        "i",
                        { class: "ri-close-line" },
                        null,
                        -1
                        /* CACHED */
                      )
                    ])], 8, fc)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                e.createElementVNode("div", kc, [
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: t[13] || (t[13] = (i) => I.value.push(""))
                    },
                    e.toDisplayString(s.$t("+ 添加一条描述")),
                    1
                    /* TEXT */
                  ),
                  t[27] || (t[27] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: b.value === "images" || !I.value.filter(Boolean).length,
                    onClick: E
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(b.value === "images" ? "ri-loader-4-line spin" : "ri-image-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("生成图片")),
                      1
                      /* TEXT */
                    )
                  ], 8, bc)
                ]),
                b.value === "images" && e.unref(l.ftProgress).content ? (e.openBlock(), e.createElementBlock(
                  "p",
                  $c,
                  e.toDisplayString(e.unref(l.ftProgress).content),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                V.value.images.length ? (e.openBlock(), e.createElementBlock("div", Dc, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(V.value.images, (i) => (e.openBlock(), e.createElementBlock("figure", {
                      key: i,
                      class: e.normalizeClass({ picked: C.value === i }),
                      onClick: (D) => C.value = i
                    }, [
                      e.createElementVNode("img", {
                        src: e.unref(l.fileUrl)(i),
                        alt: ""
                      }, null, 8, _c)
                    ], 10, Sc))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Vc,
              e.toDisplayString(s.$t("先生成文案")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "video",
          index: 3,
          title: K[3].title,
          hint: K[3].hint,
          runtime: J.value.video
        }, {
          default: e.withCtx(() => [
            V.value?.images.length ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", wc, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: b.value === "video",
                    onClick: m
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(b.value === "video" ? "ri-loader-4-line spin" : "ri-slideshow-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("用全部图片成片")),
                      1
                      /* TEXT */
                    )
                  ], 8, Cc),
                  e.createElementVNode(
                    "span",
                    Tc,
                    e.toDisplayString(s.$t("或")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": t[14] || (t[14] = (i) => j.value = i),
                    type: "text",
                    class: "ft-input",
                    placeholder: s.$t("AI 视频的镜头描述（可选）")
                  }, null, 8, Mc), [
                    [e.vModelText, j.value]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: b.value === "video" || !C.value,
                    onClick: h
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(b.value === "video" ? "ri-loader-4-line spin" : "ri-movie-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(s.$t("用选中图片生成 AI 视频")),
                      1
                      /* TEXT */
                    )
                  ], 8, Lc)
                ]),
                e.createElementVNode(
                  "p",
                  Uc,
                  e.toDisplayString(C.value ? s.$t("已选中图片：{p0}", { p0: C.value }) : s.$t("在上一步点一张图片作为 AI 视频的首帧")),
                  1
                  /* TEXT */
                ),
                b.value === "video" && e.unref(l.ftProgress).content ? (e.openBlock(), e.createElementBlock(
                  "p",
                  Ic,
                  e.toDisplayString(e.unref(l.ftProgress).content),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                V.value.videos.length ? (e.openBlock(), e.createElementBlock("div", Fc, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(V.value.videos, (i) => (e.openBlock(), e.createElementBlock("video", {
                      key: i,
                      src: e.unref(l.fileUrl)(i),
                      controls: "",
                      preload: "metadata"
                    }, null, 8, Pc))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : e.createCommentVNode("v-if", !0)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Bc,
              e.toDisplayString(s.$t("先准备好产品图片")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "approve",
          index: 4,
          title: K[4].title,
          hint: K[4].hint,
          runtime: J.value.approve
        }, {
          default: e.withCtx(() => [
            V.value ? (e.openBlock(), e.createElementBlock("div", Ac, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: V.value.status === "approved",
                onClick: O
              }, [
                t[28] || (t[28] = e.createElementVNode(
                  "i",
                  { class: "ri-checkbox-circle-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(V.value.status === "approved" ? s.$t("已定稿") : s.$t("审核通过，定稿")),
                  1
                  /* TEXT */
                )
              ], 8, Oc),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: b.value === "export",
                onClick: Z
              }, [
                t[29] || (t[29] = e.createElementVNode(
                  "i",
                  { class: "ri-file-pdf-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(s.$t("导出 PDF")),
                  1
                  /* TEXT */
                )
              ], 8, zc),
              t[32] || (t[32] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                disabled: V.value.status !== "approved",
                onClick: t[15] || (t[15] = (i) => s.$emit("goto", "platform", { contentId: V.value.id }))
              }, [
                t[30] || (t[30] = e.createElementVNode(
                  "i",
                  { class: "ri-store-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(s.$t("去平台发布产品")),
                  1
                  /* TEXT */
                )
              ], 8, qc),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                disabled: V.value.status !== "approved",
                onClick: t[16] || (t[16] = (i) => s.$emit("goto", "social", { contentId: V.value.id }))
              }, [
                t[31] || (t[31] = e.createElementVNode(
                  "i",
                  { class: "ri-global-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(s.$t("去社媒排期发布")),
                  1
                  /* TEXT */
                )
              ], 8, jc)
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              Rc,
              e.toDisplayString(s.$t("先生成文案")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ]),
      e.createCommentVNode(" 历史内容 "),
      e.createElementVNode("section", Kc, [
        e.createElementVNode("header", null, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(s.$t("内容记录")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "span",
            xc,
            e.toDisplayString(s.$t("{n} 条", { n: (e.unref(B)?.contents || []).length })),
            1
            /* TEXT */
          )
        ]),
        (e.unref(B)?.contents || []).length ? (e.openBlock(), e.createElementBlock("div", Wc, [
          e.createElementVNode("table", Hc, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("标题")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("类型")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("语言")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("素材")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("状态")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(s.$t("时间")),
                  1
                  /* TEXT */
                ),
                t[33] || (t[33] = e.createElementVNode(
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
                e.renderList(e.unref(B)?.contents || [], (i) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: i.id,
                    class: e.normalizeClass({ "ft-active": i.id === T.value })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      Jc,
                      e.toDisplayString(i.title || s.$t("（无标题）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(w(i.kind)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(i.language),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(s.$t("{a} 图 / {b} 视频", { a: i.images.length, b: i.videos.length })),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", i.status === "approved" ? "ok" : ""])
                        },
                        e.toDisplayString(i.status === "approved" ? s.$t("已定稿") : s.$t("草稿")),
                        3
                        /* TEXT, CLASS */
                      ),
                      i.published ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Qc,
                        e.toDisplayString(s.$t("已交付发布")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(e.unref(l.fmtDateTime)(i.createdAt)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost",
                        onClick: (D) => c(i.id)
                      }, e.toDisplayString(s.$t("打开")), 9, Gc),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost danger",
                        onClick: (D) => F(i.id)
                      }, [...t[34] || (t[34] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-delete-bin-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, Xc)
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
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          Yc,
          e.toDisplayString(s.$t("还没有内容")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), eu = /* @__PURE__ */ se(Zc, [["__scopeId", "data-v-831d3821"]]), tu = { class: "ss-module" }, lu = { class: "ss-steps" }, nu = {
  key: 0,
  class: "ss-table-wrap"
}, ou = { class: "ss-table" }, su = { class: "ft-wrap" }, au = {
  key: 0,
  class: "ss-chip brand"
}, iu = ["onUpdate:modelValue"], ru = ["value"], du = ["onUpdate:modelValue"], cu = ["disabled", "onClick"], uu = {
  key: 1,
  class: "ss-empty"
}, mu = { key: 2 }, pu = { class: "ss-subhead" }, vu = { class: "ft-cal" }, yu = { class: "ss-chip brand" }, Vu = {
  key: 0,
  class: "ss-chip ok"
}, Nu = { class: "ss-grid" }, Eu = { class: "ss-field" }, gu = { value: "" }, hu = ["value"], fu = { class: "ss-field" }, ku = ["value"], bu = { class: "ss-note info" }, $u = { class: "ss-actions" }, Du = ["disabled"], Su = {
  key: 0,
  class: "ss-table-wrap"
}, _u = { class: "ss-table" }, Bu = { class: "ft-wrap" }, wu = ["onClick"], Cu = { class: "ss-actions" }, Tu = ["disabled"], Mu = {
  key: 0,
  class: "ss-muted"
}, Lu = { class: "ss-kpis" }, Uu = { class: "ss-kpi" }, Iu = { class: "ss-kpi" }, Fu = { class: "ss-kpi" }, Pu = { class: "ss-kpi" }, Au = { class: "ft-issues" }, Ou = { class: "ss-muted" }, zu = { class: "ss-kpis" }, qu = { class: "ss-kpi" }, ju = { class: "ss-kpi" }, Ru = { class: "ss-kpi" }, Ku = { class: "ss-kpi accent" }, xu = {
  key: 0,
  class: "ss-table-wrap"
}, Wu = { class: "ss-table" }, Hu = { class: "num" }, Ju = { class: "num" }, Qu = { class: "num" }, Gu = { class: "num" }, Xu = { class: "ss-muted" }, Yu = /* @__PURE__ */ e.defineComponent({
  __name: "SocialTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(H) {
    const W = H, M = ve.useRouter(), B = ae.useNotificationStore(), U = l.ftState, L = ["LinkedIn", "Facebook", "Instagram", "YouTube", "TikTok", "X"], w = e.computed(() => U.value?.contents || []), A = e.computed(() => w.value.filter((N) => N.status === "approved")), T = e.computed(() => (U.value?.publishJobs || []).filter((N) => N.kind === "social_post")), V = e.computed(() => w.value.filter((N) => N.scheduledAt).slice().sort((N, q) => (N.scheduledAt || "").localeCompare(q.scheduledAt || ""))), _ = e.computed(() => U.value?.seoChecks[0] || null), I = new Date(Date.now() - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4).toISOString().slice(0, 16), x = e.reactive({});
    e.watch(w, (N) => {
      for (const q of N) x[q.id] || (x[q.id] = { channel: q.channel || "", scheduledAt: q.scheduledAt || "" });
    }, { immediate: !0 });
    const C = e.ref(""), j = e.ref("LinkedIn"), b = e.ref(""), k = e.ref(""), P = e.ref({});
    e.watch(() => U.value?.settings.website, (N) => {
      N && !b.value && (b.value = N);
    }, { immediate: !0 }), e.watch(() => W.focus?.contentId, (N) => {
      N && (C.value = N, le.scrollToStep("publish"));
    }, { immediate: !0 });
    const R = e.computed(() => L.map((N) => ({
      channel: N,
      scheduled: w.value.filter((q) => q.channel === N && q.scheduledAt).length,
      published: T.value.filter((q) => q.channel === N).length
    })).filter((N) => N.scheduled || N.published)), S = [
      { key: "schedule", title: o.t("内容排期"), hint: o.t("给定稿内容定渠道和发布时间") },
      { key: "publish", title: o.t("发布"), hint: o.t("交给数字员工在内置浏览器里发，发布前由你确认") },
      { key: "seo", title: o.t("网站检查"), hint: o.t("检查标题、描述、失效链接和图片等基础 SEO 问题") },
      { key: "data", title: o.t("数据整理"), hint: o.t("按渠道汇总排期和发布情况") }
    ], K = e.computed(() => {
      const N = (q, E, m) => k.value === q ? { state: "running" } : P.value[q] ? { state: "failed", error: P.value[q] } : E ? { state: "done", summary: m } : { state: "todo" };
      return {
        schedule: N("schedule", V.value.length > 0, o.t("{n} 条已排期", { n: V.value.length })),
        publish: N("publish", T.value.length > 0, o.t("{n} 次", { n: T.value.length })),
        seo: N("seo", !!_.value, _.value ? o.t("{n} 个问题", { n: _.value.issues.length }) : ""),
        data: N("data", T.value.length > 0)
      };
    }), J = e.computed(() => S.find((N) => K.value[N.key].state !== "done")?.key || "data");
    async function X(N, q) {
      k.value = N, P.value = { ...P.value, [N]: "" }, le.scrollToStep(N);
      try {
        return await q(), await l.refreshState(), !0;
      } catch (E) {
        return P.value = { ...P.value, [N]: l.errorMessage(E) }, !1;
      } finally {
        k.value = "";
      }
    }
    function $(N) {
      return w.value.find((q) => q.id === N)?.title || N;
    }
    async function a(N) {
      const q = x[N];
      await X("schedule", () => l.ft("content.save", { draft: { id: N, channel: q.channel, scheduledAt: q.scheduledAt } })) && B.success(o.t("已保存"));
    }
    async function p() {
      const N = w.value.find((E) => E.id === C.value);
      if (!N) return;
      await X("publish", async () => {
        const E = await l.ft("publish.instruction", { contentId: N.id, kind: "social_post", channel: j.value }), m = window.electronAPI, h = await m.conversation.create({ kind: "single", members: ["general_assistant"], title: o.t("发布到 {p0}：{p1}", { p0: j.value, p1: N.title.slice(0, 30) }), initialMessage: E });
        m.conversation.sendMessage(h.id, E), await l.ft("publish.record", { contentId: N.id, kind: "social_post", channel: j.value, conversationId: h.id });
      }) && B.success(o.t("已交给数字员工，点击「查看执行过程」可以看它操作；发布前会请你确认"));
    }
    async function y() {
      await X("seo", () => l.ft("seo.check", { url: b.value.trim() }));
    }
    function z(N) {
      le.scrollToStep(N);
    }
    return (N, q) => (e.openBlock(), e.createElementBlock("div", tu, [
      e.createVNode(re, { meta: H.meta }, null, 8, ["meta"]),
      e.createVNode(ie, {
        title: N.$t("网站/社媒"),
        metas: S,
        runtime: K.value,
        "current-key": J.value,
        onJump: z
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", lu, [
        e.createVNode(Q, {
          "step-key": "schedule",
          index: 0,
          title: S[0].title,
          hint: S[0].hint,
          runtime: K.value.schedule
        }, {
          default: e.withCtx(() => [
            w.value.length ? (e.openBlock(), e.createElementBlock("div", nu, [
              e.createElementVNode("table", ou, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(N.$t("内容")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(N.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(N.$t("发布渠道")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(N.$t("计划时间")),
                      1
                      /* TEXT */
                    ),
                    q[5] || (q[5] = e.createElementVNode(
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
                    e.renderList(w.value, (E) => (e.openBlock(), e.createElementBlock("tr", {
                      key: E.id
                    }, [
                      e.createElementVNode(
                        "td",
                        su,
                        e.toDisplayString(E.title || N.$t("（无标题）")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", E.status === "approved" ? "ok" : ""])
                          },
                          e.toDisplayString(E.status === "approved" ? N.$t("已定稿") : N.$t("草稿")),
                          3
                          /* TEXT, CLASS */
                        ),
                        E.published ? (e.openBlock(), e.createElementBlock(
                          "span",
                          au,
                          e.toDisplayString(N.$t("已交付发布")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("select", {
                          "onUpdate:modelValue": (m) => x[E.id].channel = m
                        }, [
                          q[6] || (q[6] = e.createElementVNode(
                            "option",
                            { value: "" },
                            "—",
                            -1
                            /* CACHED */
                          )),
                          (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(L, (m) => e.createElementVNode("option", {
                              key: m,
                              value: m
                            }, e.toDisplayString(m), 9, ru)),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ], 8, iu), [
                          [e.vModelSelect, x[E.id].channel]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (m) => x[E.id].scheduledAt = m,
                          type: "datetime-local"
                        }, null, 8, du), [
                          [e.vModelText, x[E.id].scheduledAt]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm ghost",
                          disabled: k.value === "schedule",
                          onClick: (m) => a(E.id)
                        }, [
                          q[7] || (q[7] = e.createElementVNode(
                            "i",
                            { class: "ri-save-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(N.$t("保存")),
                            1
                            /* TEXT */
                          )
                        ], 8, cu)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              uu,
              e.toDisplayString(N.$t("还没有内容，先到「内容生产」写好并定稿")),
              1
              /* TEXT */
            )),
            V.value.length ? (e.openBlock(), e.createElementBlock("div", mu, [
              e.createElementVNode(
                "div",
                pu,
                e.toDisplayString(N.$t("排期")),
                1
                /* TEXT */
              ),
              e.createElementVNode("ul", vu, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(V.value, (E) => (e.openBlock(), e.createElementBlock(
                    "li",
                    {
                      key: E.id,
                      class: e.normalizeClass({ past: (E.scheduledAt || "") < e.unref(I) })
                    },
                    [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString((E.scheduledAt || "").replace("T", " ")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        yu,
                        e.toDisplayString(E.channel || "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(E.title),
                        1
                        /* TEXT */
                      ),
                      E.published ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Vu,
                        e.toDisplayString(N.$t("已交付发布")),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ],
                    2
                    /* CLASS */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "publish",
          index: 1,
          title: S[1].title,
          hint: S[1].hint,
          runtime: K.value.publish
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Nu, [
              e.createElementVNode("label", Eu, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(N.$t("要发布的内容（已定稿）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": q[0] || (q[0] = (E) => C.value = E)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      gu,
                      e.toDisplayString(N.$t("请选择")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(A.value, (E) => (e.openBlock(), e.createElementBlock("option", {
                        key: E.id,
                        value: E.id
                      }, e.toDisplayString(E.title), 9, hu))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, C.value]
                ])
              ]),
              e.createElementVNode("label", fu, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(N.$t("发布渠道")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": q[1] || (q[1] = (E) => j.value = E)
                  },
                  [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(L, (E) => e.createElementVNode("option", {
                        key: E,
                        value: E
                      }, e.toDisplayString(E), 9, ku)),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, j.value]
                ])
              ])
            ]),
            e.createElementVNode("p", bu, [
              q[8] || (q[8] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(N.$t("数字员工会用内置浏览器里已登录的账号打开发帖页、填好正文并上传素材；点击「发布」前会停下来请你确认。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", $u, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !C.value || k.value === "publish",
                onClick: p
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(k.value === "publish" ? "ri-loader-4-line spin" : "ri-robot-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(N.$t("交给数字员工发布")),
                  1
                  /* TEXT */
                )
              ], 8, Du),
              q[11] || (q[11] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                onClick: q[2] || (q[2] = (E) => e.unref(M).push("/workbenches/global-ads"))
              }, [
                q[9] || (q[9] = e.createElementVNode(
                  "i",
                  { class: "ri-megaphone-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(N.$t("海外社媒投放工作台")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                onClick: q[3] || (q[3] = (E) => e.unref(M).push("/video-studio"))
              }, [
                q[10] || (q[10] = e.createElementVNode(
                  "i",
                  { class: "ri-film-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(N.$t("短视频工作台")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            T.value.length ? (e.openBlock(), e.createElementBlock("div", Su, [
              e.createElementVNode("table", _u, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(N.$t("时间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(N.$t("渠道")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(N.$t("内容")),
                      1
                      /* TEXT */
                    ),
                    q[12] || (q[12] = e.createElementVNode(
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
                    e.renderList(T.value, (E) => (e.openBlock(), e.createElementBlock("tr", {
                      key: E.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(l.fmtDateTime)(E.at)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(E.channel),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Bu,
                        e.toDisplayString($(E.contentId)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        E.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-btn sm ghost",
                          onClick: (m) => e.unref(M).push(`/conversations/${E.conversationId}`)
                        }, [
                          q[13] || (q[13] = e.createElementVNode(
                            "i",
                            { class: "ri-eye-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(N.$t("查看执行过程")),
                            1
                            /* TEXT */
                          )
                        ], 8, wu)) : e.createCommentVNode("v-if", !0)
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
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "seo",
          index: 2,
          title: S[2].title,
          hint: S[2].hint,
          runtime: K.value.seo
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Cu, [
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": q[4] || (q[4] = (E) => b.value = E),
                  type: "url",
                  class: "ft-input",
                  placeholder: "https://www.yourcompany.com"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, b.value]
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !b.value || k.value === "seo",
                onClick: y
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(k.value === "seo" ? "ri-loader-4-line spin" : "ri-search-eye-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(N.$t("检查网站")),
                  1
                  /* TEXT */
                )
              ], 8, Tu)
            ]),
            k.value === "seo" ? (e.openBlock(), e.createElementBlock(
              "p",
              Mu,
              e.toDisplayString(e.unref(l.ftProgress).social || N.$t("正在逐页检查，最多 15 个页面，通常需要几分钟…")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            _.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", Lu, [
                  e.createElementVNode("div", Uu, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(N.$t("检查页面")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(_.value.pages),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Iu, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(N.$t("SEO 问题")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(_.value.issues.length),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Fu, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(N.$t("失效链接")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(_.value.brokenLinks),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Pu, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(N.$t("失效图片")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(_.value.brokenImages),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("ul", Au, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(_.value.issues, (E, m) => (e.openBlock(), e.createElementBlock(
                      "li",
                      { key: m },
                      e.toDisplayString(E),
                      1
                      /* TEXT */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode(
                  "p",
                  Ou,
                  e.toDisplayString(N.$t("检查时间：{p0} · {p1}", { p0: e.unref(l.fmtDateTime)(_.value.at), p1: _.value.url })),
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
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "data",
          index: 3,
          title: S[3].title,
          hint: S[3].hint,
          runtime: K.value.data
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", zu, [
              e.createElementVNode("div", qu, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(N.$t("内容总数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(w.value.length),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", ju, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(N.$t("已定稿")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(A.value.length),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", Ru, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(N.$t("已排期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(V.value.length),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", Ku, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(N.$t("已交付发布")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(T.value.length),
                  1
                  /* TEXT */
                )
              ])
            ]),
            R.value.length ? (e.openBlock(), e.createElementBlock("div", xu, [
              e.createElementVNode("table", Wu, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(N.$t("渠道")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Hu,
                      e.toDisplayString(N.$t("排期")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Ju,
                      e.toDisplayString(N.$t("已发布")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(R.value, (E) => (e.openBlock(), e.createElementBlock("tr", {
                      key: E.channel
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(E.channel),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Qu,
                        e.toDisplayString(E.scheduled),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Gu,
                        e.toDisplayString(E.published),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "p",
              Xu,
              e.toDisplayString(N.$t("关注、互动等账号数据请从各平台后台导出；站内发布记录在这里汇总。")),
              1
              /* TEXT */
            )
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), Zu = /* @__PURE__ */ se(Yu, [["__scopeId", "data-v-d9e97b67"]]), em = { class: "ss-module" }, tm = { class: "ss-panel" }, lm = { class: "ss-muted" }, nm = ["disabled"], om = {
  key: 0,
  class: "ss-note ok"
}, sm = {
  key: 1,
  class: "ss-table-wrap ft-scroll"
}, am = { class: "ss-table" }, im = { class: "num" }, rm = { class: "num" }, dm = { class: "num" }, cm = { class: "num" }, um = { class: "num" }, mm = ["data-test"], pm = { class: "num" }, vm = { class: "num" }, ym = { class: "num" }, Vm = { class: "num" }, Nm = { class: "num" }, Em = ["title"], gm = ["onClick"], hm = ["onClick"], fm = {
  key: 0,
  class: "ft-hs-row"
}, km = { colspan: "10" }, bm = {
  class: "ft-hs",
  "data-test": "ft-hs-panel"
}, $m = { class: "ss-muted" }, Dm = { class: "ss-actions" }, Sm = ["disabled", "onClick"], _m = ["disabled", "onClick"], Bm = {
  key: 0,
  class: "ss-muted"
}, wm = ["onUpdate:modelValue", "placeholder"], Cm = ["disabled", "onClick"], Tm = ["onClick"], Mm = {
  key: 0,
  class: "ss-note danger"
}, Lm = {
  key: 1,
  class: "ft-hs-list"
}, Um = ["data-test"], Im = { class: "ft-hs-list__head" }, Fm = { class: "ss-muted" }, Pm = {
  key: 0,
  class: "ss-chip ok"
}, Am = ["onClick"], Om = { class: "ft-hs-list__desc" }, zm = {
  key: 0,
  class: "ft-hs-list__reason"
}, qm = {
  key: 2,
  class: "ss-empty"
}, jm = {
  key: 0,
  class: "ss-rules"
}, Rm = ["disabled"], Km = { class: "ss-rule-row" }, xm = { class: "lbl" }, Wm = { class: "lbl" }, Hm = { class: "lbl" }, Jm = { value: "manual" }, Qm = { value: "live" }, Gm = { class: "lbl" }, Xm = { class: "lbl" }, Ym = { class: "ss-rule-row" }, Zm = { class: "lbl" }, ep = { class: "lbl" }, tp = { class: "lbl" }, lp = { class: "lbl" }, np = { class: "ss-rule-row" }, op = { class: "lbl" }, sp = { class: "lbl" }, ap = ["value"], ip = { class: "lbl" }, rp = ["disabled"], dp = {
  key: 0,
  class: "ss-note info"
}, cp = {
  key: 1,
  class: "ss-panel"
}, up = { class: "ss-table-wrap ft-scroll" }, mp = { class: "ss-table" }, pp = { class: "num" }, vp = { class: "num" }, yp = { class: "ft-row-actions" }, Vp = ["onClick"], Np = ["onClick"], Ep = { class: "ss-steps" }, gp = { class: "ss-grid" }, hp = { class: "ss-field" }, fp = { value: "" }, kp = ["value"], bp = { class: "ss-field" }, $p = { class: "ss-field" }, Dp = {
  key: 0,
  class: "ss-table-wrap"
}, Sp = { class: "ss-table" }, _p = { class: "num" }, Bp = { class: "num" }, wp = { class: "ss-actions" }, Cp = ["disabled"], Tp = {
  key: 0,
  class: "ss-muted"
}, Mp = {
  key: 0,
  class: "ss-table-wrap"
}, Lp = { class: "ss-table" }, Up = { class: "num" }, Ip = { class: "num" }, Fp = { class: "ft-wrap" }, Pp = ["onUpdate:modelValue"], Ap = {
  key: 0,
  class: "ss-muted"
}, Op = ["value", "onChange"], zp = { value: "" }, qp = ["value"], jp = ["onUpdate:modelValue"], Rp = ["onUpdate:modelValue"], Kp = { class: "num" }, xp = ["onUpdate:modelValue"], Wp = { class: "num" }, Hp = ["onUpdate:modelValue"], Jp = ["onClick"], Qp = { class: "ss-grid" }, Gp = { class: "ss-field" }, Xp = ["value"], Yp = { class: "ss-field" }, Zp = { class: "ss-actions" }, ev = ["disabled"], tv = { class: "ss-muted" }, lv = { class: "ss-table-wrap" }, nv = { class: "ss-table" }, ov = { class: "num" }, sv = { class: "ft-wrap ss-muted" }, av = { class: "num" }, iv = { class: "ss-table-wrap" }, rv = { class: "ss-table" }, dv = { class: "num" }, cv = { class: "num" }, uv = { class: "num" }, mv = { class: "num" }, pv = { class: "num" }, vv = { class: "num" }, yv = { class: "total" }, Vv = { colspan: "4" }, Nv = { class: "num" }, Ev = { class: "ss-actions" }, gv = ["disabled"], hv = {
  key: 0,
  class: "ss-file-out"
}, fv = { class: "ss-muted" }, kv = { class: "ss-note info" }, bv = { class: "ss-actions" }, $v = ["disabled"], Dv = {
  key: 0,
  class: "ss-muted"
}, Sv = { class: "ss-grid" }, _v = { class: "ss-field" }, Bv = { class: "ss-field" }, wv = { value: "" }, Cv = ["value"], Tv = { class: "ss-actions" }, Mv = ["disabled"], Lv = {
  key: 0,
  class: "ss-muted"
}, Uv = { class: "ss-field" }, Iv = { class: "ss-field" }, Fv = { class: "ss-field" }, Pv = { class: "ss-actions" }, Av = {
  key: 0,
  class: "ss-muted"
}, Ov = ["disabled"], zv = {
  key: 0,
  class: "ss-note ok"
}, qv = /* @__PURE__ */ e.defineComponent({
  __name: "QuoteTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(H) {
    const W = H, M = ae.useNotificationStore(), B = l.ftState, U = ["EXW", "FOB", "CFR", "CIF"], L = e.computed(() => B.value?.products || []), w = e.computed(() => B.value?.quotes || []), A = e.computed(() => l.enabledMailboxes(B.value)), T = e.computed(() => B.value?.settings.quoteRules), V = e.computed(() => (B.value?.inquiries || []).filter((r) => r.items.length && r.status !== "spam")), _ = e.ref(!1), I = e.ref(!1), x = e.ref(""), C = e.reactive({}), j = e.computed(() => !!T.value && JSON.stringify(T.value) !== JSON.stringify({ ...T.value, ...C }));
    e.watch(T, (r) => {
      r && Object.assign(C, r);
    }, { immediate: !0 });
    const b = e.ref(!1), k = e.ref(null), P = e.ref(""), R = e.ref(""), S = e.ref(""), K = e.ref([]), J = e.ref(""), X = e.ref("FOB"), $ = e.ref(""), a = e.ref(""), p = e.ref(""), y = e.ref(""), z = e.reactive({ to: "", subject: "", body: "", model: "" }), N = e.ref(""), q = e.ref({}), E = e.ref(null), m = e.ref(""), h = e.ref(""), O = e.reactive({}), Z = e.reactive({}), c = e.computed(() => w.value.find((r) => r.id === a.value) || null), F = e.computed(() => B.value?.inquiries.find((r) => r.id === P.value) || null);
    e.watch(() => W.focus?.inquiryId, (r) => {
      r && (ce(), P.value = r);
    }, { immediate: !0 }), e.watch(F, (r) => {
      if (!r) return;
      R.value = r.company || r.customerName, S.value = r.customerEmail, y.value || (y.value = r.mailboxId);
      const g = r.fields.find((Y) => Y.key === "destination")?.value;
      g && !$.value && ($.value = g);
      const v = r.fields.find((Y) => Y.key === "incoterm")?.value?.toUpperCase();
      v && U.includes(v) && (X.value = v);
    }), e.watch(T, (r) => {
      r && !a.value && (X.value = r.defaultIncoterm);
    }, { immediate: !0 });
    const n = [
      { key: "pick", title: o.t("选择询盘"), hint: o.t("从已整理的询盘带出客户和产品，也可以不关联询盘") },
      { key: "match", title: o.t("匹配产品"), hint: o.t("对照产品目录，标出完全匹配、部分匹配、目录里没有") },
      { key: "calc", title: o.t("计算报价"), hint: o.t("按报价规则算成本、运费、保险、毛利，每个数字可看公式") },
      { key: "export", title: o.t("生成报价单"), hint: o.t("输出 PDF（给客户）和 Excel（含内部成本页）") },
      { key: "approve", title: o.t("审批"), hint: o.t("价格和付款条件由人确认") },
      { key: "send", title: o.t("发送"), hint: o.t("审批后从选定邮箱发给客户") }
    ], s = e.computed(() => {
      const r = c.value, g = (v, Y, ne) => N.value === v ? { state: "running" } : q.value[v] ? { state: "failed", error: q.value[v] } : Y ? { state: "done", summary: ne } : { state: "todo" };
      return {
        pick: g("pick", !!(P.value || R.value || S.value), R.value || S.value),
        match: g("match", K.value.length > 0, o.t("{n} 行", { n: K.value.length })),
        calc: g("calc", !!r, r ? `${l.fmtMoney(r.total)} ${r.currency}` : ""),
        export: g("export", !!r?.filePath),
        approve: g("approve", !!r && r.status !== "draft"),
        send: g("send", r?.status === "sent")
      };
    }), t = e.computed(() => n.find((r) => s.value[r.key].state !== "done")?.key || "send");
    function i(r) {
      return { exact: o.t("完全匹配"), partial: o.t("部分匹配"), none: o.t("目录里没有") }[r];
    }
    function D(r) {
      return { draft: o.t("草稿"), approved: o.t("已审批"), sent: o.t("已发出") }[r];
    }
    async function ee(r, g) {
      N.value = r, q.value = { ...q.value, [r]: "" }, le.scrollToStep(r);
      try {
        return await g(), await l.refreshState(), !0;
      } catch (v) {
        return q.value = { ...q.value, [r]: l.errorMessage(v) }, !1;
      } finally {
        N.value = "";
      }
    }
    async function de() {
      try {
        const r = await l.ft("files.pick", { filters: [{ name: "Excel", extensions: ["xlsx", "xls", "csv"] }] });
        if (!r?.length) return;
        I.value = !0;
        const g = await l.ft("product.import", { path: r[0], replace: !1 });
        x.value = o.t("新增 {a} 个、更新 {u} 个，共 {t} 个。识别到的列：{c}", { a: g.added, u: g.updated, t: g.total, c: Object.entries(g.columns).map(([v, Y]) => `${v}=${Y}`).join("、") }), await l.refreshState();
      } catch (r) {
        M.error(l.errorMessage(r));
      } finally {
        I.value = !1;
      }
    }
    async function oe(r) {
      try {
        await l.ft("product.remove", { id: r }), await l.refreshState();
      } catch (g) {
        M.error(l.errorMessage(g));
      }
    }
    async function ue(r, g) {
      h.value = r, Z[r] = "";
      try {
        await l.ft("hs.suggest", { productId: r, rerank: g }), await l.refreshState();
      } catch (v) {
        Z[r] = l.errorMessage(v);
      } finally {
        h.value = "";
      }
    }
    async function me(r, g) {
      Z[r] = "";
      try {
        await l.ft("hs.confirm", { productId: r, code: g }), O[r] = "", await l.refreshState();
      } catch (v) {
        Z[r] = l.errorMessage(v);
      }
    }
    async function Ve(r) {
      try {
        await l.ft("hs.clear", { productId: r }), await l.refreshState();
      } catch (g) {
        Z[r] = l.errorMessage(g);
      }
    }
    async function ye() {
      try {
        await l.ft("settings.patch", { patch: { quoteRules: { ...C } } }), await l.refreshState(), M.success(o.t("报价规则已保存"));
      } catch (r) {
        M.error(l.errorMessage(r));
      }
    }
    async function Ne() {
      b.value = !0;
      try {
        k.value = await l.ft("quote.fx");
      } catch (r) {
        M.error(l.errorMessage(r));
      } finally {
        b.value = !1;
      }
    }
    function ce() {
      a.value = "", P.value = "", R.value = "", S.value = "", K.value = [], J.value = "", $.value = "", q.value = {}, Object.assign(z, { to: "", subject: "", body: "", model: "" });
    }
    function Ee(r) {
      a.value = r.id, P.value = r.inquiryId || "", R.value = r.customerName || "", S.value = r.customerEmail || "", K.value = r.lines.map((g) => ({ ...g })), X.value = r.incoterm, $.value = r.destination || "", y.value = r.mailboxId || y.value, q.value = {}, Object.assign(z, { to: r.customerEmail || "", subject: "", body: "", model: "" });
    }
    async function d(r) {
      if (window.confirm(o.t("确定删除这份报价单？")))
        try {
          await l.ft("quote.remove", { id: r }), a.value === r && ce(), await l.refreshState();
        } catch (g) {
          M.error(l.errorMessage(g));
        }
    }
    function f() {
      K.value.push({ requested: "", model: "", name: "", quantity: 0, unitCost: 0, match: "none" });
    }
    function u(r, g) {
      const v = L.value.find((Y) => Y.id === g);
      if (!v) {
        r.productId = void 0, r.match = "none";
        return;
      }
      Object.assign(r, { productId: v.id, model: v.model, name: v.name, unitCost: v.unitCost, match: "exact", note: void 0 });
    }
    async function G() {
      await ee("match", async () => {
        const r = await l.ft("quote.match", { inquiryId: P.value });
        K.value = r.lines, J.value = r.model || "";
      });
    }
    async function te() {
      await ee("calc", async () => {
        const r = await l.ft("quote.calc", {
          id: a.value || void 0,
          inquiryId: P.value || void 0,
          lines: K.value,
          incoterm: X.value,
          destination: $.value || void 0,
          customerName: R.value || void 0,
          customerEmail: S.value || void 0,
          mailboxId: y.value || void 0,
          model: J.value || void 0
        });
        a.value = r.id, z.to || (z.to = r.customerEmail || "");
      });
    }
    async function ge() {
      c.value && await ee("export", () => l.ft("quote.export", { id: c.value.id }));
    }
    async function De() {
      if (!c.value) return;
      await ee("approve", () => l.ft("quote.approve", { id: c.value.id })) && M.success(o.t("报价单已审批，正式版已生成"));
    }
    async function Se() {
      c.value && await ee("draft", async () => {
        const r = await l.ft("quote.emailDraft", { id: c.value.id, language: p.value });
        Object.assign(z, { subject: r.subject, body: r.body, model: r.model }), z.to || (z.to = c.value?.customerEmail || "");
      });
    }
    async function _e() {
      const r = c.value;
      if (!r) return;
      const g = l.splitEmails(z.to);
      if (!g.length) {
        M.warn(o.t("请填写收件人"));
        return;
      }
      let v;
      try {
        const ne = await l.checkBeforeSend({ kind: "quote", mailboxId: y.value, to: g, subject: z.subject, body: z.body, refId: r.id }, l.mailboxName(B.value, y.value));
        E.value = ne.result, v = ne.hash;
      } catch (ne) {
        M.error(l.errorMessage(ne));
        return;
      }
      if (!v) return;
      await ee("send", () => l.ft("quote.send", { id: r.id, mailboxId: y.value, to: g, subject: z.subject, body: z.body, approvedHash: v })) && M.success(o.t("报价已发出"));
    }
    function Be(r) {
      r && l.ft("path.open", { path: r }).catch((g) => M.error(l.errorMessage(g)));
    }
    function we(r) {
      le.scrollToStep(r);
    }
    return (r, g) => (e.openBlock(), e.createElementBlock("div", em, [
      e.createVNode(re, { meta: H.meta }, null, 8, ["meta"]),
      e.createCommentVNode(" 产品目录 "),
      e.createElementVNode("section", tm, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            g[23] || (g[23] = e.createElementVNode(
              "i",
              { class: "ri-archive-drawer-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(r.$t("产品目录")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            lm,
            e.toDisplayString(r.$t("共 {n} 个产品。报价只用目录里的成本价计算。", { n: L.value.length })),
            1
            /* TEXT */
          ),
          g[25] || (g[25] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            disabled: I.value,
            onClick: de
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(I.value ? "ri-loader-4-line spin" : "ri-file-upload-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(r.$t("从 Excel 导入")),
              1
              /* TEXT */
            )
          ], 8, nm),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            onClick: g[0] || (g[0] = (v) => _.value = !_.value)
          }, [
            g[24] || (g[24] = e.createElementVNode(
              "i",
              { class: "ri-list-check" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(_.value ? r.$t("收起") : r.$t("查看")),
              1
              /* TEXT */
            )
          ])
        ]),
        x.value ? (e.openBlock(), e.createElementBlock("p", om, [
          g[26] || (g[26] = e.createElementVNode(
            "i",
            { class: "ri-check-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(x.value),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        _.value && L.value.length ? (e.openBlock(), e.createElementBlock("div", sm, [
          e.createElementVNode("table", am, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("型号")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("品名")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("规格")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  im,
                  e.toDisplayString(r.$t("成本价")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  rm,
                  e.toDisplayString(r.$t("起订量")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  dm,
                  e.toDisplayString(r.$t("装箱数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  cm,
                  e.toDisplayString(r.$t("箱体积")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  um,
                  e.toDisplayString(r.$t("单件净重")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("HS 编码")),
                  1
                  /* TEXT */
                ),
                g[27] || (g[27] = e.createElementVNode(
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
                e.renderList(L.value, (v) => (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  {
                    key: v.id
                  },
                  [
                    e.createElementVNode("tr", {
                      "data-test": `ft-product-${v.model}`
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.model),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.name),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.spec || "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        pm,
                        e.toDisplayString(e.unref(l.fmtMoney)(v.unitCost)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        vm,
                        e.toDisplayString(v.moq ?? "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        ym,
                        e.toDisplayString(v.pcsPerCarton ?? "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Vm,
                        e.toDisplayString(v.cartonCbm ?? "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Nm,
                        e.toDisplayString(v.unitNetKg ?? "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        v.hsConfirmed ? (e.openBlock(), e.createElementBlock("span", {
                          key: 0,
                          class: "ss-chip ok",
                          title: r.$t("{p0} 于 {p1} 确认", { p0: v.hsConfirmed.by, p1: e.unref(l.fmtDateTime)(v.hsConfirmed.at) }),
                          "data-test": "ft-hs-confirmed"
                        }, [
                          g[28] || (g[28] = e.createElementVNode(
                            "i",
                            { class: "ri-check-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(v.hsConfirmed.code),
                            1
                            /* TEXT */
                          )
                        ], 8, Em)) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          "data-test": "ft-hs-open",
                          onClick: (Y) => m.value = m.value === v.id ? "" : v.id
                        }, e.toDisplayString(v.hsConfirmed ? r.$t("改") : v.hsSuggestions?.length ? r.$t("{n} 个候选，待确认", { n: v.hsSuggestions.length }) : r.$t("找编码")), 9, gm)
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm ghost danger",
                          onClick: (Y) => oe(v.id)
                        }, [...g[29] || (g[29] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-delete-bin-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, hm)
                      ])
                    ], 8, mm),
                    m.value === v.id ? (e.openBlock(), e.createElementBlock("tr", fm, [
                      e.createElementVNode("td", km, [
                        e.createElementVNode("div", bm, [
                          e.createElementVNode(
                            "p",
                            $m,
                            e.toDisplayString(r.$t("先在本地 HS2022 编码表里按关键词检索，再由模型从候选里排序并写理由；编码由你确认后才会写进 PI / CI。")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("div", Dm, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn sm primary",
                              disabled: h.value === v.id,
                              onClick: (Y) => ue(v.id, !0)
                            }, [
                              e.createElementVNode(
                                "i",
                                {
                                  class: e.normalizeClass(h.value === v.id ? "ri-loader-4-line spin" : "ri-search-line")
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              e.createTextVNode(
                                e.toDisplayString(r.$t("检索并让模型排序")),
                                1
                                /* TEXT */
                              )
                            ], 8, Sm),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn sm",
                              disabled: h.value === v.id,
                              "data-test": "ft-hs-local",
                              onClick: (Y) => ue(v.id, !1)
                            }, [
                              g[30] || (g[30] = e.createElementVNode(
                                "i",
                                { class: "ri-search-line" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(r.$t("只做本地检索")),
                                1
                                /* TEXT */
                              )
                            ], 8, _m),
                            v.hsModel ? (e.openBlock(), e.createElementBlock(
                              "span",
                              Bm,
                              e.toDisplayString(r.$t("由 {p0} 排序", { p0: e.unref(l.modelLabel)(v.hsModel) })),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0),
                            g[32] || (g[32] = e.createElementVNode(
                              "span",
                              { class: "grow" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (Y) => O[v.id] = Y,
                              type: "text",
                              class: "ft-hs-input",
                              placeholder: r.$t("手填 6～10 位编码")
                            }, null, 8, wm), [
                              [e.vModelText, O[v.id]]
                            ]),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn sm",
                              disabled: !O[v.id],
                              onClick: (Y) => me(v.id, O[v.id])
                            }, [
                              g[31] || (g[31] = e.createElementVNode(
                                "i",
                                { class: "ri-check-line" },
                                null,
                                -1
                                /* CACHED */
                              )),
                              e.createTextVNode(
                                e.toDisplayString(r.$t("确认这个编码")),
                                1
                                /* TEXT */
                              )
                            ], 8, Cm),
                            v.hsConfirmed ? (e.openBlock(), e.createElementBlock("button", {
                              key: 1,
                              type: "button",
                              class: "ss-btn sm ghost danger",
                              onClick: (Y) => Ve(v.id)
                            }, e.toDisplayString(r.$t("撤销确认")), 9, Tm)) : e.createCommentVNode("v-if", !0)
                          ]),
                          Z[v.id] ? (e.openBlock(), e.createElementBlock("p", Mm, [
                            g[33] || (g[33] = e.createElementVNode(
                              "i",
                              { class: "ri-error-warning-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(Z[v.id]),
                              1
                              /* TEXT */
                            )
                          ])) : e.createCommentVNode("v-if", !0),
                          v.hsSuggestions?.length ? (e.openBlock(), e.createElementBlock("ol", Lm, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(v.hsSuggestions, (Y) => (e.openBlock(), e.createElementBlock("li", {
                                key: Y.code,
                                "data-test": `ft-hs-cand-${Y.code}`
                              }, [
                                e.createElementVNode("div", Im, [
                                  e.createElementVNode(
                                    "code",
                                    null,
                                    e.toDisplayString(Y.code),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "span",
                                    Fm,
                                    e.toDisplayString(r.$t("匹配度 {p0}", { p0: Math.round(Y.score * 100) + "%" })),
                                    1
                                    /* TEXT */
                                  ),
                                  g[35] || (g[35] = e.createElementVNode(
                                    "span",
                                    { class: "grow" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  v.hsConfirmed?.code === Y.code ? (e.openBlock(), e.createElementBlock(
                                    "span",
                                    Pm,
                                    e.toDisplayString(r.$t("已确认")),
                                    1
                                    /* TEXT */
                                  )) : (e.openBlock(), e.createElementBlock("button", {
                                    key: 1,
                                    type: "button",
                                    class: "ss-btn sm",
                                    onClick: (ne) => me(v.id, Y.code)
                                  }, [
                                    g[34] || (g[34] = e.createElementVNode(
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
                                  ], 8, Am))
                                ]),
                                e.createElementVNode(
                                  "div",
                                  Om,
                                  e.toDisplayString(Y.description),
                                  1
                                  /* TEXT */
                                ),
                                Y.reason ? (e.openBlock(), e.createElementBlock("div", zm, [
                                  g[36] || (g[36] = e.createElementVNode(
                                    "i",
                                    { class: "ri-lightbulb-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  e.createTextVNode(
                                    e.toDisplayString(Y.reason),
                                    1
                                    /* TEXT */
                                  )
                                ])) : e.createCommentVNode("v-if", !0)
                              ], 8, Um))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ])) : e.createCommentVNode("v-if", !0)
                        ])
                      ])
                    ])) : e.createCommentVNode("v-if", !0)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : L.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
          "p",
          qm,
          e.toDisplayString(r.$t("还没有产品目录。导入含「型号 / 品名 / 出厂价」列的 Excel，可选「装箱数 / 箱体积」用于计算海运费。")),
          1
          /* TEXT */
        ))
      ]),
      e.createCommentVNode(" 报价规则 "),
      T.value ? (e.openBlock(), e.createElementBlock("section", jm, [
        e.createElementVNode("h4", null, [
          g[37] || (g[37] = e.createElementVNode(
            "i",
            { class: "ri-scales-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(r.$t("报价规则")) + " ",
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-link",
            disabled: b.value,
            onClick: Ne
          }, e.toDisplayString(r.$t("查看当前汇率")), 9, Rm)
        ]),
        e.createElementVNode("div", Km, [
          e.createElementVNode(
            "span",
            xm,
            e.toDisplayString(r.$t("成本币种")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": g[1] || (g[1] = (v) => C.baseCurrency = v),
              type: "text"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, C.baseCurrency]
          ]),
          e.createElementVNode(
            "span",
            Wm,
            e.toDisplayString(r.$t("报价币种")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": g[2] || (g[2] = (v) => C.quoteCurrency = v),
              type: "text"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, C.quoteCurrency]
          ]),
          e.createElementVNode(
            "span",
            Hm,
            e.toDisplayString(r.$t("汇率来源")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": g[3] || (g[3] = (v) => C.rateSource = v)
            },
            [
              e.createElementVNode(
                "option",
                Jm,
                e.toDisplayString(r.$t("手填")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "option",
                Qm,
                e.toDisplayString(r.$t("实时")),
                1
                /* TEXT */
              )
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, C.rateSource]
          ]),
          C.rateSource === "manual" ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createElementVNode(
                "span",
                Gm,
                e.toDisplayString(r.$t("1 报价币种 =")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": g[4] || (g[4] = (v) => C.manualRate = v),
                  type: "number",
                  step: "0.0001"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  C.manualRate,
                  void 0,
                  { number: !0 }
                ]
              ]),
              e.createElementVNode(
                "span",
                Xm,
                e.toDisplayString(C.baseCurrency),
                1
                /* TEXT */
              )
            ],
            64
            /* STABLE_FRAGMENT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("div", Ym, [
          e.createElementVNode(
            "span",
            Zm,
            e.toDisplayString(r.$t("包装 %")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": g[5] || (g[5] = (v) => C.packagingPct = v),
              type: "number",
              step: "0.1"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              e.vModelText,
              C.packagingPct,
              void 0,
              { number: !0 }
            ]
          ]),
          e.createElementVNode(
            "span",
            ep,
            e.toDisplayString(r.$t("国内运输（每票）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": g[6] || (g[6] = (v) => C.inlandFreight = v),
              type: "number"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              e.vModelText,
              C.inlandFreight,
              void 0,
              { number: !0 }
            ]
          ]),
          e.createElementVNode(
            "span",
            tp,
            e.toDisplayString(r.$t("海运（每立方，报价币种）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": g[7] || (g[7] = (v) => C.oceanFreightPerCbm = v),
              type: "number"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              e.vModelText,
              C.oceanFreightPerCbm,
              void 0,
              { number: !0 }
            ]
          ]),
          e.createElementVNode(
            "span",
            lp,
            e.toDisplayString(r.$t("保险 %")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": g[8] || (g[8] = (v) => C.insurancePct = v),
              type: "number",
              step: "0.01"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              e.vModelText,
              C.insurancePct,
              void 0,
              { number: !0 }
            ]
          ])
        ]),
        e.createElementVNode("div", np, [
          e.createElementVNode(
            "span",
            op,
            e.toDisplayString(r.$t("目标毛利 %")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": g[9] || (g[9] = (v) => C.marginPct = v),
              type: "number",
              step: "0.5"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              e.vModelText,
              C.marginPct,
              void 0,
              { number: !0 }
            ]
          ]),
          e.createElementVNode(
            "span",
            sp,
            e.toDisplayString(r.$t("默认贸易术语")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": g[10] || (g[10] = (v) => C.defaultIncoterm = v)
            },
            [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(U, (v) => e.createElementVNode("option", {
                  key: v,
                  value: v
                }, e.toDisplayString(v), 9, ap)),
                64
                /* STABLE_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, C.defaultIncoterm]
          ]),
          e.createElementVNode(
            "span",
            ip,
            e.toDisplayString(r.$t("报价有效期（天）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": g[11] || (g[11] = (v) => C.validityDays = v),
              type: "number"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              e.vModelText,
              C.validityDays,
              void 0,
              { number: !0 }
            ]
          ]),
          g[39] || (g[39] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            disabled: !j.value,
            onClick: ye
          }, [
            g[38] || (g[38] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(r.$t("保存规则")),
              1
              /* TEXT */
            )
          ], 8, rp)
        ]),
        k.value ? (e.openBlock(), e.createElementBlock("p", dp, [
          g[40] || (g[40] = e.createElementVNode(
            "i",
            { class: "ri-exchange-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(r.$t("1 {c} = {r} {b}（{s}，{t}）", { c: T.value.quoteCurrency, r: k.value.rate, b: T.value.baseCurrency, s: k.value.source, t: k.value.asOf })),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 已有报价 "),
      w.value.length ? (e.openBlock(), e.createElementBlock("section", cp, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            g[41] || (g[41] = e.createElementVNode(
              "i",
              { class: "ri-file-list-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(r.$t("报价单")),
              1
              /* TEXT */
            )
          ]),
          g[43] || (g[43] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm",
            onClick: ce
          }, [
            g[42] || (g[42] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(r.$t("新建报价")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", up, [
          e.createElementVNode("table", mp, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("客户")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("日期")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(r.$t("贸易术语")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  pp,
                  e.toDisplayString(r.$t("总额")),
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
                g[44] || (g[44] = e.createElementVNode(
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
                e.renderList(w.value, (v) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: v.id,
                    class: e.normalizeClass({ "ft-active": v.id === a.value })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(v.customerName || v.customerEmail || "—"),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(e.unref(l.fmtDate)(v.createdAt)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(v.incoterm),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      vp,
                      e.toDisplayString(e.unref(l.fmtMoney)(v.total)) + " " + e.toDisplayString(v.currency),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", v.status === "sent" ? "ok" : v.status === "approved" ? "brand" : "warn"])
                        },
                        e.toDisplayString(D(v.status)),
                        3
                        /* TEXT, CLASS */
                      )
                    ]),
                    e.createElementVNode("td", yp, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost",
                        onClick: (Y) => Ee(v)
                      }, [
                        g[45] || (g[45] = e.createElementVNode(
                          "i",
                          { class: "ri-folder-open-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(r.$t("打开")),
                          1
                          /* TEXT */
                        )
                      ], 8, Vp),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost danger",
                        onClick: (Y) => d(v.id)
                      }, [...g[46] || (g[46] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-delete-bin-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, Np)
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
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createVNode(ie, {
        title: r.$t("报价"),
        metas: n,
        runtime: s.value,
        "current-key": t.value,
        onJump: we
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", Ep, [
        e.createVNode(Q, {
          "step-key": "pick",
          index: 0,
          title: n[0].title,
          hint: n[0].hint,
          runtime: s.value.pick
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", gp, [
              e.createElementVNode("label", hp, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(r.$t("询盘")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": g[12] || (g[12] = (v) => P.value = v)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      fp,
                      e.toDisplayString(r.$t("不关联询盘（手动添加产品）")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(V.value, (v) => (e.openBlock(), e.createElementBlock("option", {
                        key: v.id,
                        value: v.id
                      }, e.toDisplayString((v.company || v.customerName) + " · " + (v.subject || "")), 9, kp))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, P.value]
                ])
              ]),
              e.createElementVNode("label", bp, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(r.$t("客户名称")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": g[13] || (g[13] = (v) => R.value = v),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, R.value]
                ])
              ]),
              e.createElementVNode("label", $p, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(r.$t("客户邮箱")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": g[14] || (g[14] = (v) => S.value = v),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, S.value]
                ])
              ])
            ]),
            F.value?.items.length ? (e.openBlock(), e.createElementBlock("div", Dp, [
              e.createElementVNode("table", Sp, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("产品")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("型号")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("规格")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      _p,
                      e.toDisplayString(r.$t("数量")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(F.value.items, (v, Y) => (e.openBlock(), e.createElementBlock("tr", { key: Y }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.product),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.model || "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(v.spec || "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        Bp,
                        e.toDisplayString(v.quantity || "—") + " " + e.toDisplayString(v.unit || ""),
                        1
                        /* TEXT */
                      )
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
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "match",
          index: 1,
          title: n[1].title,
          hint: n[1].hint,
          runtime: s.value.match
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", wp, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: N.value === "match" || !P.value,
                onClick: G
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(N.value === "match" ? "ri-loader-4-line spin" : "ri-links-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(r.$t("按询盘匹配产品")),
                  1
                  /* TEXT */
                )
              ], 8, Cp),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                onClick: f
              }, [
                g[47] || (g[47] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(r.$t("手动添加一行")),
                  1
                  /* TEXT */
                )
              ]),
              J.value ? (e.openBlock(), e.createElementBlock(
                "span",
                Tp,
                e.toDisplayString(r.$t("由 {p0} 匹配", { p0: e.unref(l.modelLabel)(J.value) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            K.value.length ? (e.openBlock(), e.createElementBlock("div", Mp, [
              e.createElementVNode("table", Lp, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("客户要的")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("目录产品")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("型号")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("品名")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Up,
                      e.toDisplayString(r.$t("数量")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Ip,
                      e.toDisplayString(r.$t("成本价")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(r.$t("匹配")),
                      1
                      /* TEXT */
                    ),
                    g[48] || (g[48] = e.createElementVNode(
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
                    e.renderList(K.value, (v, Y) => (e.openBlock(), e.createElementBlock("tr", { key: Y }, [
                      e.createElementVNode("td", Fp, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (ne) => v.requested = ne,
                          type: "text"
                        }, null, 8, Pp), [
                          [e.vModelText, v.requested]
                        ]),
                        v.note ? (e.openBlock(), e.createElementBlock(
                          "div",
                          Ap,
                          e.toDisplayString(v.note),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("select", {
                          value: v.productId || "",
                          onChange: (ne) => u(v, ne.target.value)
                        }, [
                          e.createElementVNode(
                            "option",
                            zp,
                            e.toDisplayString(r.$t("（不在目录）")),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(L.value, (ne) => (e.openBlock(), e.createElementBlock("option", {
                              key: ne.id,
                              value: ne.id
                            }, e.toDisplayString(ne.model) + " · " + e.toDisplayString(ne.name), 9, qp))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 40, Op)
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (ne) => v.model = ne,
                          type: "text"
                        }, null, 8, jp), [
                          [e.vModelText, v.model]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (ne) => v.name = ne,
                          type: "text"
                        }, null, 8, Rp), [
                          [e.vModelText, v.name]
                        ])
                      ]),
                      e.createElementVNode("td", Kp, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (ne) => v.quantity = ne,
                          type: "number"
                        }, null, 8, xp), [
                          [
                            e.vModelText,
                            v.quantity,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("td", Wp, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (ne) => v.unitCost = ne,
                          type: "number",
                          step: "0.01"
                        }, null, 8, Hp), [
                          [
                            e.vModelText,
                            v.unitCost,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", v.match === "exact" ? "ok" : v.match === "partial" ? "warn" : "bad"])
                          },
                          e.toDisplayString(i(v.match)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm ghost danger",
                          onClick: (ne) => K.value.splice(Y, 1)
                        }, [...g[49] || (g[49] = [
                          e.createElementVNode(
                            "i",
                            { class: "ri-delete-bin-line" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, Jp)
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
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "calc",
          index: 2,
          title: n[2].title,
          hint: n[2].hint,
          runtime: s.value.calc
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Qp, [
              e.createElementVNode("label", Gp, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(r.$t("贸易术语")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": g[15] || (g[15] = (v) => X.value = v)
                  },
                  [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(U, (v) => e.createElementVNode("option", {
                        key: v,
                        value: v
                      }, e.toDisplayString(v), 9, Xp)),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, X.value]
                ])
              ]),
              e.createElementVNode("label", Yp, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(r.$t("目的港 / 交货地")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": g[16] || (g[16] = (v) => $.value = v),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, $.value]
                ])
              ])
            ]),
            e.createElementVNode("div", Zp, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: N.value === "calc" || !K.value.length,
                onClick: te
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(N.value === "calc" ? "ri-loader-4-line spin" : "ri-calculator-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(r.$t("计算报价")),
                  1
                  /* TEXT */
                )
              ], 8, ev),
              e.createElementVNode(
                "span",
                tv,
                e.toDisplayString(r.$t("所有数字按报价规则计算，模型不参与定价")),
                1
                /* TEXT */
              )
            ]),
            c.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(c.value.warnings, (v, Y) => (e.openBlock(), e.createElementBlock("p", {
                    key: Y,
                    class: "ss-note warn"
                  }, [
                    g[50] || (g[50] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(v),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                e.createElementVNode("div", lv, [
                  e.createElementVNode("table", nv, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(r.$t("项目")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(r.$t("计算过程")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          ov,
                          e.toDisplayString(r.$t("金额")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(r.$t("币种")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(c.value.calc, (v) => (e.openBlock(), e.createElementBlock(
                          "tr",
                          {
                            key: v.key,
                            class: e.normalizeClass({ total: v.key === "total" })
                          },
                          [
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(v.label),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              sv,
                              e.toDisplayString(v.formula),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              av,
                              e.toDisplayString(e.unref(l.fmtMoney)(v.value)),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(v.currency),
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
                e.createElementVNode("div", iv, [
                  e.createElementVNode("table", rv, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(r.$t("型号")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(r.$t("品名")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          dv,
                          e.toDisplayString(r.$t("数量")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          cv,
                          e.toDisplayString(r.$t("单价")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          uv,
                          e.toDisplayString(r.$t("金额")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(c.value.lines, (v, Y) => (e.openBlock(), e.createElementBlock("tr", { key: Y }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(v.model),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(v.name),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            mv,
                            e.toDisplayString(v.quantity),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            pv,
                            e.toDisplayString(e.unref(l.fmtMoney)(v.unitPrice)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            vv,
                            e.toDisplayString(e.unref(l.fmtMoney)(v.amount)),
                            1
                            /* TEXT */
                          )
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      e.createElementVNode("tr", yv, [
                        e.createElementVNode(
                          "td",
                          Vv,
                          e.toDisplayString(r.$t("合计（{p0}）", { p0: c.value.currency })),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          Nv,
                          e.toDisplayString(e.unref(l.fmtMoney)(c.value.total)),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ])
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "export",
          index: 3,
          title: n[3].title,
          hint: n[3].hint,
          runtime: s.value.export
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Ev, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !c.value || N.value === "export",
                onClick: ge
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(N.value === "export" ? "ri-loader-4-line spin" : "ri-file-pdf-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(r.$t("生成报价单（PDF + Excel）")),
                  1
                  /* TEXT */
                )
              ], 8, gv)
            ]),
            c.value?.filePath ? (e.openBlock(), e.createElementBlock("div", hv, [
              g[52] || (g[52] = e.createElementVNode(
                "i",
                { class: "ri-file-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "code",
                null,
                e.toDisplayString(c.value.filePath),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                onClick: g[17] || (g[17] = (v) => Be(c.value.filePath))
              }, [
                g[51] || (g[51] = e.createElementVNode(
                  "i",
                  { class: "ri-external-link-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(r.$t("打开")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "p",
              fv,
              e.toDisplayString(r.$t("Excel 里含内部成本明细页，只留在本地；发给客户的是 PDF。")),
              1
              /* TEXT */
            )
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "approve",
          index: 4,
          title: n[4].title,
          hint: n[4].hint,
          runtime: s.value.approve
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", kv, [
              g[53] || (g[53] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(r.$t("审批前报价单带「DRAFT」水印；审批通过后重新生成正式版并去掉水印，之后才能发给客户。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", bv, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !c.value || c.value.status !== "draft" || N.value === "approve",
                onClick: De
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(N.value === "approve" ? "ri-loader-4-line spin" : "ri-shield-check-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(r.$t("我已核对，审批通过")),
                  1
                  /* TEXT */
                )
              ], 8, $v),
              c.value?.approvedAt ? (e.openBlock(), e.createElementBlock(
                "span",
                Dv,
                e.toDisplayString(r.$t("已于 {p0} 审批", { p0: e.unref(l.fmtDateTime)(c.value.approvedAt) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "send",
          index: 5,
          title: n[5].title,
          hint: n[5].hint,
          runtime: s.value.send
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Sv, [
              e.createElementVNode("label", _v, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(r.$t("邮件语言")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": g[18] || (g[18] = (v) => p.value = v),
                    type: "text",
                    placeholder: "English"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, p.value]
                ])
              ]),
              e.createElementVNode("label", Bv, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(r.$t("发件邮箱")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": g[19] || (g[19] = (v) => y.value = v)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      wv,
                      e.toDisplayString(r.$t("请选择")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(A.value, (v) => (e.openBlock(), e.createElementBlock("option", {
                        key: v.id,
                        value: v.id
                      }, e.toDisplayString(v.label || v.address), 9, Cv))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, y.value]
                ])
              ])
            ]),
            e.createElementVNode("div", Tv, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !c.value || N.value === "draft",
                onClick: Se
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(N.value === "draft" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(r.$t("写报价邮件")),
                  1
                  /* TEXT */
                )
              ], 8, Mv),
              z.model ? (e.openBlock(), e.createElementBlock(
                "span",
                Lv,
                e.toDisplayString(r.$t("由 {p0} 撰写", { p0: e.unref(l.modelLabel)(z.model) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode("label", Uv, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(r.$t("收件人")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": g[20] || (g[20] = (v) => z.to = v),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, z.to]
              ])
            ]),
            e.createElementVNode("label", Iv, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(r.$t("标题")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": g[21] || (g[21] = (v) => z.subject = v),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, z.subject]
              ])
            ]),
            e.createElementVNode("label", Fv, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(r.$t("正文")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": g[22] || (g[22] = (v) => z.body = v),
                  rows: "10"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [e.vModelText, z.body]
              ])
            ]),
            e.createVNode(pe, { result: E.value }, null, 8, ["result"]),
            e.createElementVNode("div", Pv, [
              c.value && c.value.status === "draft" ? (e.openBlock(), e.createElementBlock(
                "span",
                Av,
                e.toDisplayString(r.$t("报价单还没有审批，审批后才能发出")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0),
              g[54] || (g[54] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !c.value || c.value.status === "draft" || !y.value || !z.subject || !z.body || N.value === "send",
                onClick: _e
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(N.value === "send" ? "ri-loader-4-line spin" : "ri-send-plane-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(r.$t("发送报价")),
                  1
                  /* TEXT */
                )
              ], 8, Ov)
            ]),
            c.value?.sentAt ? (e.openBlock(), e.createElementBlock("p", zv, [
              g[55] || (g[55] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(r.$t("已于 {p0} 发出", { p0: e.unref(l.fmtDateTime)(c.value.sentAt) })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), jv = /* @__PURE__ */ se(qv, [["__scopeId", "data-v-c22688ea"]]), Rv = { class: "ss-module" }, Kv = { class: "ss-panel" }, xv = { class: "ss-grid" }, Wv = { class: "ss-field" }, Hv = { value: "" }, Jv = ["value"], Qv = { class: "ss-field" }, Gv = { class: "ss-field" }, Xv = { class: "ss-field" }, Yv = { class: "ss-field" }, Zv = { class: "ss-field" }, ey = { class: "ss-actions" }, ty = ["disabled"], ly = { class: "ft-split" }, ny = { class: "ft-list" }, oy = ["onClick"], sy = { class: "ft-list__top" }, ay = { class: "ft-list__sub" }, iy = { class: "ft-list__meta" }, ry = { key: 0 }, dy = {
  key: 0,
  class: "ss-empty"
}, cy = {
  key: 0,
  class: "ft-detail"
}, uy = { class: "ss-steps" }, my = { class: "ss-table-wrap" }, py = { class: "ss-table" }, vy = {
  key: 0,
  class: "ss-chip bad"
}, yy = ["onUpdate:modelValue"], Vy = ["onUpdate:modelValue"], Ny = { class: "ss-actions" }, Ey = ["disabled"], gy = {
  key: 0,
  class: "ss-actions"
}, hy = ["disabled"], fy = { class: "ss-muted" }, ky = { class: "ss-subhead" }, by = {
  class: "ss-grid",
  "data-test": "ft-docs-form"
}, $y = { class: "ss-field" }, Dy = { class: "ss-field" }, Sy = { class: "ss-field" }, _y = { class: "ss-field" }, By = { class: "ss-field" }, wy = { class: "ss-field" }, Cy = { class: "ss-field" }, Ty = { class: "ss-field" }, My = { class: "ss-field" }, Ly = ["value"], Uy = { class: "ss-field" }, Iy = { class: "ss-field" }, Fy = { class: "ss-field" }, Py = { class: "ss-field" }, Ay = { class: "ss-field" }, Oy = { class: "ss-field" }, zy = { class: "ss-field" }, qy = { class: "ss-subhead" }, jy = { class: "ss-grid" }, Ry = { class: "ss-field" }, Ky = { class: "ss-field" }, xy = { class: "ss-field" }, Wy = { class: "ss-field" }, Hy = { class: "ss-subhead" }, Jy = { class: "ss-grid" }, Qy = { class: "ss-field" }, Gy = { class: "ss-field" }, Xy = { class: "ss-field" }, Yy = { class: "ss-field" }, Zy = { class: "ss-field" }, eV = { class: "ss-subhead" }, tV = { class: "ss-table-wrap" }, lV = { class: "ss-table ft-doc-lines" }, nV = { class: "num" }, oV = { class: "num" }, sV = { class: "num" }, aV = { class: "num" }, iV = { class: "num" }, rV = ["data-test"], dV = ["value", "onChange"], cV = { value: "" }, uV = ["value"], mV = ["onUpdate:modelValue"], pV = ["onUpdate:modelValue"], vV = {
  key: 0,
  class: "ss-chip ok",
  "data-test": "ft-doc-hs"
}, yV = ["title"], VV = ["title"], NV = { class: "num" }, EV = ["onUpdate:modelValue"], gV = ["onUpdate:modelValue"], hV = { class: "num" }, fV = ["onUpdate:modelValue"], kV = { class: "num" }, bV = ["onUpdate:modelValue"], $V = { class: "num" }, DV = ["onUpdate:modelValue"], SV = { class: "num" }, _V = ["onUpdate:modelValue"], BV = ["onClick"], wV = { class: "ss-actions" }, CV = ["disabled"], TV = ["disabled"], MV = ["disabled"], LV = {
  key: 0,
  class: "ft-findings",
  "data-test": "ft-docs-findings"
}, UV = ["data-rule", "data-level"], IV = {
  key: 0,
  class: "ss-muted"
}, FV = { class: "ss-kpis" }, PV = { class: "ss-kpi accent" }, AV = { class: "ss-kpi" }, OV = { class: "ss-kpi" }, zV = { class: "ss-kpi" }, qV = {
  class: "ss-muted ft-words",
  "data-test": "ft-docs-words"
}, jV = { class: "ss-table-wrap" }, RV = { class: "ss-table" }, KV = ["data-test"], xV = ["onClick"], WV = ["onClick"], HV = { class: "ss-actions" }, JV = { class: "ss-field inline" }, QV = ["value"], GV = ["disabled"], XV = {
  key: 0,
  class: "ss-table-wrap"
}, YV = { class: "ss-table" }, ZV = { class: "ss-chip" }, eN = ["onClick"], tN = ["onClick"], lN = { class: "ss-actions" }, nN = ["disabled"], oN = {
  key: 0,
  class: "ss-muted"
}, sN = {
  key: 0,
  class: "ss-table-wrap"
}, aN = { class: "ss-table" }, iN = { class: "ss-actions" }, rN = ["disabled"], dN = {
  key: 0,
  class: "ss-table-wrap"
}, cN = { class: "ss-table" }, uN = { class: "ft-wrap" }, mN = {
  key: 1,
  class: "ss-note ok"
}, pN = { class: "ss-subhead" }, vN = {
  class: "ft-findings",
  "data-test": "ft-check-findings"
}, yN = ["data-rule", "data-level"], VN = { class: "ss-actions" }, NN = ["disabled"], EN = ["disabled"], gN = {
  key: 1,
  class: "ft-detail ss-empty"
}, hN = /* @__PURE__ */ e.defineComponent({
  __name: "OrderTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(H) {
    const W = H, M = ae.useNotificationStore(), B = l.ftState, U = ["PI", "CI", "PL", "BL", "contract", "other"], L = ["order_no", "consignee", "product_names", "total_quantity", "total_amount", "currency", "destination"], w = e.computed(() => B.value?.orders || []), A = e.computed(() => (B.value?.quotes || []).filter((d) => d.status !== "draft")), T = e.ref(""), V = e.computed(() => w.value.find((d) => d.id === T.value) || null), _ = e.computed(() => (V.value?.docs || []).filter((d) => d.fields && Object.keys(d.fields).length)), I = e.ref(!1), x = e.ref(!1), C = e.reactive({ quoteId: "", orderNo: "", customerName: "", customerEmail: "", amount: void 0, currency: "" }), j = e.ref("PI"), b = e.ref([]), k = e.ref(""), P = e.ref({}), R = e.computed(() => B.value?.products || []), S = e.ref(null), K = e.computed(() => V.value?.tradeDocs?.validation || []), J = e.computed(() => K.value.filter((d) => d.level === "error" && !/^R\d+$/.test(d.rule))), X = e.computed(() => {
      const d = (S.value?.currency || "USD").toUpperCase(), f = [`${d}/PCS`, `${d}/MPCS`, `${d}/TON`];
      return S.value?.priceUnit && !f.includes(S.value.priceUnit) ? [S.value.priceUnit, ...f] : f;
    });
    e.watch(() => W.focus, (d) => {
      d?.orderId && (T.value = d.orderId), d?.quoteId && (I.value = !0, C.quoteId = d.quoteId, h());
    }, { immediate: !0 }), e.watch(w, (d) => {
      !T.value && d.length && (T.value = d[0].id);
    }, { immediate: !0 }), e.watch(() => `${V.value?.id}|${JSON.stringify(V.value?.tradeDocs?.input || null)}`, () => {
      const d = V.value?.tradeDocs?.input;
      S.value = d ? JSON.parse(JSON.stringify(d)) : null;
    }, { immediate: !0 }), e.watch(() => `${V.value?.id}|${JSON.stringify(V.value?.nodes || [])}`, () => {
      b.value = (V.value?.nodes || []).map((d) => ({ ...d })), P.value = {};
    }, { immediate: !0 });
    const $ = l.todayIso();
    function a(d) {
      return !d.done && !!d.due && d.due < $;
    }
    function p(d) {
      return d.status === "done" ? 0 : d.nodes.filter(a).length;
    }
    const y = [
      { key: "nodes", title: o.t("节点计划"), hint: o.t("定金、生产、验货、订舱、装运、到港、尾款，到期没完成会标红") },
      { key: "gen", title: o.t("生成单据"), hint: o.t("PI、商业发票、装箱单按规则计算金额、重量和大写金额，输出 Excel（公式联动）与 PDF；HS 编码只用人工确认过的") },
      { key: "docs", title: o.t("上传单据"), hint: o.t("形式发票、商业发票、装箱单、提单、合同统一归档") },
      { key: "extract", title: o.t("提取字段"), hint: o.t("从每份单据读出合同号、收货人、品名、数量、金额、目的港") },
      { key: "check", title: o.t("一致性核对"), hint: o.t("同一字段在不同单据里写法不一样就列出来") },
      { key: "finish", title: o.t("完成订单"), hint: o.t("全部节点完成后标记订单完成") }
    ], z = e.computed(() => {
      const d = V.value, f = (G, te, ge) => k.value === G ? { state: "running" } : P.value[G] ? { state: "failed", error: P.value[G] } : te ? { state: "done", summary: ge } : { state: "todo" }, u = d?.nodes.filter((G) => G.done).length || 0;
      return {
        nodes: f("nodes", !!d && d.nodes.some((G) => G.due || G.done), d ? o.t("{a}/{b} 个节点完成", { a: u, b: d.nodes.length }) : ""),
        gen: f("gen", !!d?.tradeDocs?.generated, d?.tradeDocs?.generated ? `${l.fmtMoney(d.tradeDocs.generated.totals.amount)} ${d.tradeDocs.input.currency}` : ""),
        docs: f("docs", !!d?.docs.length, o.t("{n} 份单据", { n: d?.docs.length || 0 })),
        extract: f("extract", _.value.length > 0, o.t("{n} 份已提取", { n: _.value.length })),
        check: f("check", !!d?.check, d?.check ? d.check.issues.length || d.check.findings?.some((G) => G.level === "error") ? o.t("{n} 处不一致", { n: d.check.issues.length + (d.check.findings || []).filter((G) => G.level === "error").length }) : o.t("一致") : ""),
        finish: f("finish", d?.status === "done")
      };
    }), N = e.computed(() => y.find((d) => z.value[d.key].state !== "done")?.key || "finish");
    function q(d) {
      return { PI: o.t("形式发票 PI"), CI: o.t("商业发票 CI"), PL: o.t("装箱单 PL"), BL: o.t("提单 BL"), contract: o.t("合同"), other: o.t("其他") }[d];
    }
    function E(d) {
      return { order_no: o.t("合同号"), consignee: o.t("收货人"), product_names: o.t("品名"), total_quantity: o.t("总数量"), total_amount: o.t("总金额"), currency: o.t("币种"), destination: o.t("目的港") }[d] || d;
    }
    async function m(d, f) {
      k.value = d, P.value = { ...P.value, [d]: "" }, le.scrollToStep(d);
      try {
        return await f(), await l.refreshState(), !0;
      } catch (u) {
        return P.value = { ...P.value, [d]: l.errorMessage(u) }, !1;
      } finally {
        k.value = "";
      }
    }
    function h() {
      const d = A.value.find((f) => f.id === C.quoteId);
      d && (C.customerName = d.customerName || "", C.customerEmail = d.customerEmail || "", C.amount = d.total, C.currency = d.currency);
    }
    function O(d) {
      const f = /TON/i.test(d) ? o.t("按吨") : /MPCS/i.test(d) ? o.t("按千件") : o.t("按件");
      return `${d}（${f}）`;
    }
    function Z(d) {
      return d === "error" ? "bad" : d === "warning" ? "warn" : "brand";
    }
    function c(d) {
      return { error: o.t("错误"), warning: o.t("提醒"), info: o.t("说明") }[d];
    }
    function F(d) {
      return d.split(/[\\/]/).pop() || d;
    }
    function n(d, f) {
      const u = R.value.find((G) => G.id === f);
      if (!u) {
        d.productId = void 0;
        return;
      }
      Object.assign(d, { productId: u.id, model: u.model, description: d.description || u.name, hsCode: u.hsConfirmed?.code, hsConfirmed: !!u.hsConfirmed, unitNetKg: u.unitNetKg, pcsPerCarton: u.pcsPerCarton, cartonCbm: u.cartonCbm });
    }
    function s() {
      S.value?.lines.push({ no: S.value.lines.length + 1, model: "", description: "", quantity: 0, unit: "PCS" });
    }
    async function t(d) {
      V.value && (d && !window.confirm(o.t("按订单和报价单重新带出，当前改动会丢掉，继续吗？")) || await m("gen", () => l.ft("docs.prepare", { orderId: V.value.id, reset: d })));
    }
    async function i() {
      return !V.value || !S.value ? !1 : m("gen", () => l.ft("docs.save", { orderId: V.value.id, input: S.value }));
    }
    async function D() {
      if (!V.value || !S.value || !await i()) return;
      try {
        if (!await l.confirmScreening(S.value?.buyer.name || V.value.customerName || "", o.t("生成 PI"))) return;
      } catch (f) {
        M.error(l.errorMessage(f));
        return;
      }
      await m("gen", () => l.ft("docs.generate", { orderId: V.value.id })) && M.success(o.t("PI、商业发票、装箱单已生成"));
    }
    async function ee() {
      try {
        if (!await l.confirmScreening(C.customerName, o.t("创建订单"))) return;
      } catch (d) {
        M.error(l.errorMessage(d));
        return;
      }
      x.value = !0;
      try {
        const d = await l.ft("order.create", { ...C, quoteId: C.quoteId || void 0 });
        await l.refreshState(), T.value = d.id, Object.assign(C, { quoteId: "", orderNo: "", customerName: "", customerEmail: "", amount: void 0, currency: "" }), I.value = !1, M.success(o.t("订单已创建"));
      } catch (d) {
        M.error(l.errorMessage(d));
      } finally {
        x.value = !1;
      }
    }
    async function de() {
      V.value && await m("nodes", () => l.ft("order.update", { id: V.value.id, patch: { nodes: b.value } }));
    }
    async function oe() {
      if (!V.value) return;
      const d = await l.ft("files.pick", { multi: !0, filters: [{ name: o.t("单据"), extensions: ["pdf", "xlsx", "xls", "docx", "doc", "csv", "png", "jpg", "jpeg"] }] }).catch((f) => (M.error(l.errorMessage(f)), []));
      d.length && await m("docs", () => l.ft("order.addDocs", { id: V.value.id, files: d.map((f) => ({ path: f, kind: j.value })) }));
    }
    async function ue(d) {
      if (V.value)
        try {
          await l.ft("order.removeDoc", { id: V.value.id, docId: d }), await l.refreshState();
        } catch (f) {
          M.error(l.errorMessage(f));
        }
    }
    async function me() {
      V.value && await m("extract", () => l.ft("order.extract", { id: V.value.id }));
    }
    async function Ve() {
      V.value && await m("check", () => l.ft("order.check", { id: V.value.id }));
    }
    async function ye(d) {
      V.value && await m("finish", () => l.ft("order.update", { id: V.value.id, patch: { status: d } }));
    }
    async function Ne() {
      if (!(!V.value || !window.confirm(o.t("确定删除订单 {p0}？", { p0: V.value.orderNo }))))
        try {
          await l.ft("order.remove", { id: V.value.id }), T.value = "", await l.refreshState();
        } catch (d) {
          M.error(l.errorMessage(d));
        }
    }
    function ce(d) {
      l.ft("path.open", { path: d }).catch((f) => M.error(l.errorMessage(f)));
    }
    function Ee(d) {
      le.scrollToStep(d);
    }
    return (d, f) => (e.openBlock(), e.createElementBlock("div", Rv, [
      e.createVNode(re, { meta: H.meta }, null, 8, ["meta"]),
      e.createCommentVNode(" 新建订单 "),
      e.createElementVNode("section", Kv, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            f[37] || (f[37] = e.createElementVNode(
              "i",
              { class: "ri-add-box-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(d.$t("新建订单")),
              1
              /* TEXT */
            )
          ]),
          f[38] || (f[38] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            onClick: f[0] || (f[0] = (u) => I.value = !I.value)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(I.value ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(I.value ? d.$t("收起") : d.$t("展开")),
              1
              /* TEXT */
            )
          ])
        ]),
        I.value ? (e.openBlock(), e.createElementBlock(
          e.Fragment,
          { key: 0 },
          [
            e.createElementVNode("div", xv, [
              e.createElementVNode("label", Wv, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(d.$t("来自报价单（可选）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": f[1] || (f[1] = (u) => C.quoteId = u),
                    onChange: h
                  },
                  [
                    e.createElementVNode(
                      "option",
                      Hv,
                      e.toDisplayString(d.$t("不关联")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(A.value, (u) => (e.openBlock(), e.createElementBlock("option", {
                        key: u.id,
                        value: u.id
                      }, e.toDisplayString((u.customerName || u.customerEmail || "") + " · " + e.unref(l.fmtMoney)(u.total) + " " + u.currency), 9, Jv))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [e.vModelSelect, C.quoteId]
                ])
              ]),
              e.createElementVNode("label", Qv, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(d.$t("订单号")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": f[2] || (f[2] = (u) => C.orderNo = u),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    C.orderNo,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", Gv, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(d.$t("客户")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": f[3] || (f[3] = (u) => C.customerName = u),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    C.customerName,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", Xv, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(d.$t("客户邮箱")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": f[4] || (f[4] = (u) => C.customerEmail = u),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    C.customerEmail,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", Yv, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(d.$t("金额")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": f[5] || (f[5] = (u) => C.amount = u),
                    type: "number"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    C.amount,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", Zv, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(d.$t("币种")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": f[6] || (f[6] = (u) => C.currency = u),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    C.currency,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ])
            ]),
            e.createElementVNode("div", ey, [
              f[39] || (f[39] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !C.orderNo || x.value,
                onClick: ee
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(x.value ? "ri-loader-4-line spin" : "ri-add-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(d.$t("创建订单")),
                  1
                  /* TEXT */
                )
              ], 8, ty)
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        )) : e.createCommentVNode("v-if", !0)
      ]),
      e.createElementVNode("div", ly, [
        e.createElementVNode("aside", ny, [
          e.createElementVNode("ul", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(w.value, (u) => (e.openBlock(), e.createElementBlock("li", {
                key: u.id,
                class: e.normalizeClass({ active: u.id === T.value }),
                onClick: (G) => T.value = u.id
              }, [
                e.createElementVNode("div", sy, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(u.orderNo),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", u.status === "done" ? "ok" : p(u) ? "bad" : "brand"])
                    },
                    e.toDisplayString(u.status === "done" ? d.$t("已完成") : p(u) ? d.$t("{n} 个节点逾期", { n: p(u) }) : d.$t("进行中")),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode(
                  "div",
                  ay,
                  e.toDisplayString(u.customerName || "—"),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", iy, [
                  u.amount != null ? (e.openBlock(), e.createElementBlock(
                    "span",
                    ry,
                    e.toDisplayString(e.unref(l.fmtMoney)(u.amount)) + " " + e.toDisplayString(u.currency || ""),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(l.fmtDate)(u.createdAt)),
                    1
                    /* TEXT */
                  )
                ])
              ], 10, oy))),
              128
              /* KEYED_FRAGMENT */
            )),
            w.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              dy,
              e.toDisplayString(d.$t("还没有订单")),
              1
              /* TEXT */
            ))
          ])
        ]),
        V.value ? (e.openBlock(), e.createElementBlock("section", cy, [
          e.createVNode(ie, {
            title: d.$t("订单 {p0}", { p0: V.value.orderNo }),
            metas: y,
            runtime: z.value,
            "current-key": N.value,
            onJump: Ee
          }, null, 8, ["title", "runtime", "current-key"]),
          e.createElementVNode("div", uy, [
            e.createVNode(Q, {
              "step-key": "nodes",
              index: 0,
              title: y[0].title,
              hint: y[0].hint,
              runtime: z.value.nodes
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", my, [
                  e.createElementVNode("table", py, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(d.$t("节点")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(d.$t("计划日期")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(d.$t("完成")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(d.$t("完成时间")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(b.value, (u) => (e.openBlock(), e.createElementBlock(
                          "tr",
                          {
                            key: u.key,
                            class: e.normalizeClass({ bad: a(u) })
                          },
                          [
                            e.createElementVNode("td", null, [
                              e.createTextVNode(
                                e.toDisplayString(u.label),
                                1
                                /* TEXT */
                              ),
                              a(u) ? (e.openBlock(), e.createElementBlock(
                                "span",
                                vy,
                                e.toDisplayString(d.$t("逾期")),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]),
                            e.createElementVNode("td", null, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": (G) => u.due = G,
                                type: "date"
                              }, null, 8, yy), [
                                [e.vModelText, u.due]
                              ])
                            ]),
                            e.createElementVNode("td", null, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": (G) => u.done = G,
                                type: "checkbox"
                              }, null, 8, Vy), [
                                [e.vModelCheckbox, u.done]
                              ])
                            ]),
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(u.doneAt ? e.unref(l.fmtDateTime)(u.doneAt) : "—"),
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
                e.createElementVNode("div", Ny, [
                  f[40] || (f[40] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: k.value === "nodes",
                    onClick: de
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(k.value === "nodes" ? "ri-loader-4-line spin" : "ri-save-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("保存节点")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ey)
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "gen",
              index: 1,
              title: y[1].title,
              hint: y[1].hint,
              runtime: z.value.gen
            }, {
              default: e.withCtx(() => [
                S.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    e.createElementVNode(
                      "div",
                      ky,
                      e.toDisplayString(d.$t("抬头与条款")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", by, [
                      e.createElementVNode("label", $y, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("卖方（出单公司，英文）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[8] || (f[8] = (u) => S.value.seller.name = u),
                            type: "text",
                            "data-test": "ft-doc-seller"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.seller.name]
                        ])
                      ]),
                      e.createElementVNode("label", Dy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("卖方地址")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[9] || (f[9] = (u) => S.value.seller.address = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.seller.address]
                        ])
                      ]),
                      e.createElementVNode("label", Sy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("买方")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[10] || (f[10] = (u) => S.value.buyer.name = u),
                            type: "text",
                            "data-test": "ft-doc-buyer"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.buyer.name]
                        ])
                      ]),
                      e.createElementVNode("label", _y, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("买方地址")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[11] || (f[11] = (u) => S.value.buyer.address = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.buyer.address]
                        ])
                      ]),
                      e.createElementVNode("label", By, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("PI 号")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[12] || (f[12] = (u) => S.value.piNo = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.piNo]
                        ])
                      ]),
                      e.createElementVNode("label", wy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("CI 号")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[13] || (f[13] = (u) => S.value.ciNo = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.ciNo]
                        ])
                      ]),
                      e.createElementVNode("label", Cy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("日期")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[14] || (f[14] = (u) => S.value.date = u),
                            type: "date"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.date]
                        ])
                      ]),
                      e.createElementVNode("label", Ty, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("币种")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[15] || (f[15] = (u) => S.value.currency = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            S.value.currency,
                            void 0,
                            { trim: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", My, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("计价方式")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "select",
                          {
                            "onUpdate:modelValue": f[16] || (f[16] = (u) => S.value.priceUnit = u)
                          },
                          [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(X.value, (u) => (e.openBlock(), e.createElementBlock("option", {
                                key: u,
                                value: u
                              }, e.toDisplayString(O(u)), 9, Ly))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ],
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelSelect, S.value.priceUnit]
                        ])
                      ]),
                      e.createElementVNode("label", Uy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("贸易术语")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[17] || (f[17] = (u) => S.value.incoterm = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            S.value.incoterm,
                            void 0,
                            { trim: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", Iy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("起运港")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[18] || (f[18] = (u) => S.value.portOfLoading = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.portOfLoading]
                        ])
                      ]),
                      e.createElementVNode("label", Fy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("目的港")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[19] || (f[19] = (u) => S.value.portOfDestination = u),
                            type: "text",
                            "data-test": "ft-doc-dest"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.portOfDestination]
                        ])
                      ]),
                      e.createElementVNode("label", Py, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("付款方式")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[20] || (f[20] = (u) => S.value.payment = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.payment]
                        ])
                      ]),
                      e.createElementVNode("label", Ay, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("信用证号（可选）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[21] || (f[21] = (u) => S.value.lcNumber = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.lcNumber]
                        ])
                      ]),
                      e.createElementVNode("label", Oy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("唛头（可选）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[22] || (f[22] = (u) => S.value.shippingMarks = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.shippingMarks]
                        ])
                      ]),
                      e.createElementVNode("label", zy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("产地证 / 质检证书要求")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[23] || (f[23] = (u) => S.value.certificates = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.certificates]
                        ])
                      ])
                    ]),
                    e.createElementVNode(
                      "div",
                      qy,
                      e.toDisplayString(d.$t("收款银行")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", jy, [
                      e.createElementVNode("label", Ry, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("银行名称")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[24] || (f[24] = (u) => S.value.bank.name = u),
                            type: "text",
                            "data-test": "ft-doc-bank"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.bank.name]
                        ])
                      ]),
                      e.createElementVNode("label", Ky, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("账户名")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[25] || (f[25] = (u) => S.value.bank.accountName = u),
                            type: "text"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.bank.accountName]
                        ])
                      ]),
                      e.createElementVNode("label", xy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("账号")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[26] || (f[26] = (u) => S.value.bank.accountNo = u),
                            type: "text",
                            "data-test": "ft-doc-account"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelText, S.value.bank.accountNo]
                        ])
                      ]),
                      e.createElementVNode("label", Wy, [
                        f[41] || (f[41] = e.createElementVNode(
                          "span",
                          null,
                          "SWIFT",
                          -1
                          /* CACHED */
                        )),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[27] || (f[27] = (u) => S.value.bank.swift = u),
                            type: "text",
                            "data-test": "ft-doc-swift"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            S.value.bank.swift,
                            void 0,
                            { trim: !0 }
                          ]
                        ])
                      ])
                    ]),
                    e.createElementVNode(
                      "div",
                      Hy,
                      e.toDisplayString(d.$t("装箱参数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", Jy, [
                      e.createElementVNode("label", Qy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("每箱重量（kg，没填装箱数时按它分箱）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[28] || (f[28] = (u) => S.value.packing.kgPerCarton = u),
                            type: "number",
                            step: "0.1"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            S.value.packing.kgPerCarton,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", Gy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("每托箱数（0 = 不打托）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[29] || (f[29] = (u) => S.value.packing.cartonsPerPallet = u),
                            type: "number"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            S.value.packing.cartonsPerPallet,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", Xy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("托盘自重（kg）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[30] || (f[30] = (u) => S.value.packing.palletWeightKg = u),
                            type: "number",
                            step: "0.1"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            S.value.packing.palletWeightKg,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", Yy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("纸箱自重（kg / 箱）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[31] || (f[31] = (u) => S.value.packing.cartonTareKg = u),
                            type: "number",
                            step: "0.01"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            S.value.packing.cartonTareKg,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", Zy, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(d.$t("每托体积（CBM，没有箱体积时估算用）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": f[32] || (f[32] = (u) => S.value.packing.cbmPerPallet = u),
                            type: "number",
                            step: "0.001"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            S.value.packing.cbmPerPallet,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ])
                    ]),
                    e.createElementVNode(
                      "div",
                      eV,
                      e.toDisplayString(d.$t("产品行")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("div", tV, [
                      e.createElementVNode("table", lV, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(d.$t("目录产品")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(d.$t("型号")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(d.$t("品名（英文）")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(d.$t("HS 编码")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              nV,
                              e.toDisplayString(d.$t("数量")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(d.$t("单位")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              oV,
                              e.toDisplayString(d.$t("单价")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              sV,
                              e.toDisplayString(d.$t("单件净重")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              aV,
                              e.toDisplayString(d.$t("装箱数")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              iV,
                              e.toDisplayString(d.$t("箱体积")),
                              1
                              /* TEXT */
                            ),
                            f[42] || (f[42] = e.createElementVNode(
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
                            e.renderList(S.value.lines, (u, G) => (e.openBlock(), e.createElementBlock("tr", {
                              key: G,
                              "data-test": `ft-doc-line-${G}`
                            }, [
                              e.createElementVNode("td", null, [
                                e.createElementVNode("select", {
                                  value: u.productId || "",
                                  onChange: (te) => n(u, te.target.value)
                                }, [
                                  e.createElementVNode(
                                    "option",
                                    cV,
                                    e.toDisplayString(d.$t("（不在目录）")),
                                    1
                                    /* TEXT */
                                  ),
                                  (e.openBlock(!0), e.createElementBlock(
                                    e.Fragment,
                                    null,
                                    e.renderList(R.value, (te) => (e.openBlock(), e.createElementBlock("option", {
                                      key: te.id,
                                      value: te.id
                                    }, e.toDisplayString(te.model) + " · " + e.toDisplayString(te.name), 9, uV))),
                                    128
                                    /* KEYED_FRAGMENT */
                                  ))
                                ], 40, dV)
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (te) => u.model = te,
                                  type: "text"
                                }, null, 8, mV), [
                                  [e.vModelText, u.model]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (te) => u.description = te,
                                  type: "text"
                                }, null, 8, pV), [
                                  [e.vModelText, u.description]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                u.hsCode && u.hsConfirmed ? (e.openBlock(), e.createElementBlock("span", vV, [
                                  f[43] || (f[43] = e.createElementVNode(
                                    "i",
                                    { class: "ri-check-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  e.createTextVNode(
                                    e.toDisplayString(u.hsCode),
                                    1
                                    /* TEXT */
                                  )
                                ])) : u.hsCode ? (e.openBlock(), e.createElementBlock("span", {
                                  key: 1,
                                  class: "ss-chip bad",
                                  title: d.$t("到「报价 → 产品目录」里确认")
                                }, e.toDisplayString(d.$t("{p0} 未确认", { p0: u.hsCode })), 9, yV)) : (e.openBlock(), e.createElementBlock("span", {
                                  key: 2,
                                  class: "ss-muted",
                                  title: d.$t("到「报价 → 产品目录」里找编码并确认")
                                }, e.toDisplayString(d.$t("没有")), 9, VV))
                              ]),
                              e.createElementVNode("td", NV, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (te) => u.quantity = te,
                                  type: "number"
                                }, null, 8, EV), [
                                  [
                                    e.vModelText,
                                    u.quantity,
                                    void 0,
                                    { number: !0 }
                                  ]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (te) => u.unit = te,
                                  type: "text",
                                  class: "ft-unit"
                                }, null, 8, gV), [
                                  [e.vModelText, u.unit]
                                ])
                              ]),
                              e.createElementVNode("td", hV, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (te) => u.unitPrice = te,
                                  type: "number",
                                  step: "0.0001"
                                }, null, 8, fV), [
                                  [
                                    e.vModelText,
                                    u.unitPrice,
                                    void 0,
                                    { number: !0 }
                                  ]
                                ])
                              ]),
                              e.createElementVNode("td", kV, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (te) => u.unitNetKg = te,
                                  type: "number",
                                  step: "0.001"
                                }, null, 8, bV), [
                                  [
                                    e.vModelText,
                                    u.unitNetKg,
                                    void 0,
                                    { number: !0 }
                                  ]
                                ])
                              ]),
                              e.createElementVNode("td", $V, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (te) => u.pcsPerCarton = te,
                                  type: "number"
                                }, null, 8, DV), [
                                  [
                                    e.vModelText,
                                    u.pcsPerCarton,
                                    void 0,
                                    { number: !0 }
                                  ]
                                ])
                              ]),
                              e.createElementVNode("td", SV, [
                                e.withDirectives(e.createElementVNode("input", {
                                  "onUpdate:modelValue": (te) => u.cartonCbm = te,
                                  type: "number",
                                  step: "0.001"
                                }, null, 8, _V), [
                                  [
                                    e.vModelText,
                                    u.cartonCbm,
                                    void 0,
                                    { number: !0 }
                                  ]
                                ])
                              ]),
                              e.createElementVNode("td", null, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-btn sm ghost danger",
                                  onClick: (te) => S.value.lines.splice(G, 1)
                                }, [...f[44] || (f[44] = [
                                  e.createElementVNode(
                                    "i",
                                    { class: "ri-delete-bin-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )
                                ])], 8, BV)
                              ])
                            ], 8, rV))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ])
                    ]),
                    e.createElementVNode("div", wV, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm",
                        onClick: s
                      }, [
                        f[45] || (f[45] = e.createElementVNode(
                          "i",
                          { class: "ri-add-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(d.$t("添加一行")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost",
                        disabled: k.value === "gen",
                        onClick: f[33] || (f[33] = (u) => t(!0))
                      }, [
                        f[46] || (f[46] = e.createElementVNode(
                          "i",
                          { class: "ri-refresh-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(d.$t("重新从订单带出")),
                          1
                          /* TEXT */
                        )
                      ], 8, CV),
                      f[48] || (f[48] = e.createElementVNode(
                        "span",
                        { class: "grow" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn",
                        disabled: k.value === "gen",
                        "data-test": "ft-docs-save",
                        onClick: i
                      }, [
                        f[47] || (f[47] = e.createElementVNode(
                          "i",
                          { class: "ri-save-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(d.$t("保存")),
                          1
                          /* TEXT */
                        )
                      ], 8, TV),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn primary",
                        disabled: k.value === "gen" || !S.value.lines.length,
                        "data-test": "ft-docs-generate",
                        onClick: D
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(k.value === "gen" ? "ri-loader-4-line spin" : "ri-file-list-3-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(d.$t("生成 PI / CI / 装箱单")),
                          1
                          /* TEXT */
                        )
                      ], 8, MV)
                    ]),
                    K.value.length ? (e.openBlock(), e.createElementBlock("ul", LV, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(K.value, (u, G) => (e.openBlock(), e.createElementBlock("li", {
                          key: G,
                          "data-rule": u.rule,
                          "data-level": u.level
                        }, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", Z(u.level)])
                            },
                            e.toDisplayString(c(u.level)),
                            3
                            /* TEXT, CLASS */
                          ),
                          e.createElementVNode("span", null, [
                            e.createTextVNode(
                              e.toDisplayString(u.message),
                              1
                              /* TEXT */
                            ),
                            u.suggestion ? (e.openBlock(), e.createElementBlock(
                              "small",
                              IV,
                              " · " + e.toDisplayString(u.suggestion),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ])
                        ], 8, UV))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : e.createCommentVNode("v-if", !0),
                    V.value.tradeDocs?.generated ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      [
                        e.createElementVNode(
                          "p",
                          {
                            class: e.normalizeClass(["ss-note", J.value.length ? "danger" : "ok"]),
                            "data-test": "ft-docs-cross"
                          },
                          [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(J.value.length ? "ri-error-warning-line" : "ri-check-double-line")
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createTextVNode(
                              " " + e.toDisplayString(J.value.length ? d.$t("交叉校验有 {n} 处对不上，见上面的红色条目", { n: J.value.length }) : d.$t("交叉校验通过：逐行金额、合计与大写金额一致，CI 与装箱单的净重、毛重一致")),
                              1
                              /* TEXT */
                            )
                          ],
                          2
                          /* CLASS */
                        ),
                        e.createElementVNode("div", FV, [
                          e.createElementVNode("div", PV, [
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(d.$t("合计")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(e.unref(l.fmtMoney)(V.value.tradeDocs.generated.totals.amount)) + " " + e.toDisplayString(V.value.tradeDocs.input.currency),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode("div", AV, [
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(d.$t("箱数")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(V.value.tradeDocs.generated.totals.cartons),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode("div", OV, [
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(d.$t("净重 / 毛重（kg）")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(V.value.tradeDocs.generated.totals.netWeightKg) + " / " + e.toDisplayString(V.value.tradeDocs.generated.totals.grossWeightKg),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode("div", zV, [
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(d.$t("体积（CBM）")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(V.value.tradeDocs.generated.totals.cbm),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode(
                          "p",
                          qV,
                          "SAY: " + e.toDisplayString(V.value.tradeDocs.generated.totals.amountInWords),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("div", jV, [
                          e.createElementVNode("table", RV, [
                            e.createElementVNode("thead", null, [
                              e.createElementVNode("tr", null, [
                                e.createElementVNode(
                                  "th",
                                  null,
                                  e.toDisplayString(d.$t("单据")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "th",
                                  null,
                                  e.toDisplayString(d.$t("Excel（公式联动）")),
                                  1
                                  /* TEXT */
                                ),
                                f[49] || (f[49] = e.createElementVNode(
                                  "th",
                                  null,
                                  "PDF",
                                  -1
                                  /* CACHED */
                                ))
                              ])
                            ]),
                            e.createElementVNode("tbody", null, [
                              (e.openBlock(!0), e.createElementBlock(
                                e.Fragment,
                                null,
                                e.renderList(V.value.tradeDocs.generated.files, (u) => (e.openBlock(), e.createElementBlock("tr", {
                                  key: u.kind,
                                  "data-test": `ft-docs-file-${u.kind}`
                                }, [
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(q(u.kind)),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode("td", null, [
                                    e.createElementVNode("button", {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: (G) => ce(u.xlsx)
                                    }, e.toDisplayString(F(u.xlsx)), 9, xV)
                                  ]),
                                  e.createElementVNode("td", null, [
                                    e.createElementVNode("button", {
                                      type: "button",
                                      class: "ss-link",
                                      onClick: (G) => ce(u.pdf)
                                    }, e.toDisplayString(F(u.pdf)), 9, WV)
                                  ])
                                ], 8, KV))),
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
                )) : (e.openBlock(), e.createElementBlock("div", gy, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: k.value === "gen",
                    "data-test": "ft-docs-prepare",
                    onClick: f[7] || (f[7] = (u) => t(!1))
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(k.value === "gen" ? "ri-loader-4-line spin" : "ri-file-add-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("准备单据信息")),
                      1
                      /* TEXT */
                    )
                  ], 8, hy),
                  e.createElementVNode(
                    "span",
                    fy,
                    e.toDisplayString(d.$t("从报价单、产品目录和「设置 → 单据抬头与银行」带出，每一项都可以改")),
                    1
                    /* TEXT */
                  )
                ]))
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "docs",
              index: 2,
              title: y[2].title,
              hint: y[2].hint,
              runtime: z.value.docs
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", HV, [
                  e.createElementVNode("label", JV, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(d.$t("单据类型")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": f[34] || (f[34] = (u) => j.value = u)
                      },
                      [
                        (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(U, (u) => e.createElementVNode("option", {
                            key: u,
                            value: u
                          }, e.toDisplayString(q(u)), 9, QV)),
                          64
                          /* STABLE_FRAGMENT */
                        ))
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelSelect, j.value]
                    ])
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn",
                    disabled: k.value === "docs",
                    onClick: oe
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(k.value === "docs" ? "ri-loader-4-line spin" : "ri-upload-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("上传单据")),
                      1
                      /* TEXT */
                    )
                  ], 8, GV)
                ]),
                V.value.docs.length ? (e.openBlock(), e.createElementBlock("div", XV, [
                  e.createElementVNode("table", YV, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(d.$t("类型")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(d.$t("文件")),
                          1
                          /* TEXT */
                        ),
                        f[50] || (f[50] = e.createElementVNode(
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
                        e.renderList(V.value.docs, (u) => (e.openBlock(), e.createElementBlock("tr", {
                          key: u.id
                        }, [
                          e.createElementVNode("td", null, [
                            e.createElementVNode(
                              "span",
                              ZV,
                              e.toDisplayString(q(u.kind)),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (G) => ce(u.path)
                            }, e.toDisplayString(u.name), 9, eN)
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-btn sm ghost danger",
                              onClick: (G) => ue(u.id)
                            }, [...f[51] || (f[51] = [
                              e.createElementVNode(
                                "i",
                                { class: "ri-delete-bin-line" },
                                null,
                                -1
                                /* CACHED */
                              )
                            ])], 8, tN)
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
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "extract",
              index: 3,
              title: y[3].title,
              hint: y[3].hint,
              runtime: z.value.extract
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", lN, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !V.value.docs.length || k.value === "extract",
                    onClick: me
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(k.value === "extract" ? "ri-loader-4-line spin" : "ri-file-search-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("提取单据字段")),
                      1
                      /* TEXT */
                    )
                  ], 8, nN),
                  k.value === "extract" && e.unref(l.ftProgress).order ? (e.openBlock(), e.createElementBlock(
                    "span",
                    oN,
                    e.toDisplayString(e.unref(l.ftProgress).order),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                _.value.length ? (e.openBlock(), e.createElementBlock("div", sN, [
                  e.createElementVNode("table", aN, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(d.$t("字段")),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(_.value, (u) => (e.openBlock(), e.createElementBlock(
                            "th",
                            {
                              key: u.id
                            },
                            e.toDisplayString(u.name),
                            1
                            /* TEXT */
                          ))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(L, (u) => e.createElementVNode("tr", { key: u }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(E(u)),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(_.value, (G) => (e.openBlock(), e.createElementBlock(
                              "td",
                              {
                                key: G.id,
                                class: "ft-wrap"
                              },
                              e.toDisplayString(G.fields?.[u] || "—"),
                              1
                              /* TEXT */
                            ))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])),
                        64
                        /* STABLE_FRAGMENT */
                      ))
                    ])
                  ])
                ])) : e.createCommentVNode("v-if", !0),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(V.value.docs.filter((u) => u.error), (u) => (e.openBlock(), e.createElementBlock("p", {
                    key: u.id,
                    class: "ss-note danger"
                  }, [
                    f[52] || (f[52] = e.createElementVNode(
                      "i",
                      { class: "ri-error-warning-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("{p0}：{p1}", { p0: u.name, p1: u.error })),
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
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "check",
              index: 4,
              title: y[4].title,
              hint: y[4].hint,
              runtime: z.value.check
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", iN, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !_.value.length || k.value === "check",
                    onClick: Ve
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(k.value === "check" ? "ri-loader-4-line spin" : "ri-git-compare-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("核对单据一致性")),
                      1
                      /* TEXT */
                    )
                  ], 8, rN)
                ]),
                V.value.check ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    V.value.check.issues.length ? (e.openBlock(), e.createElementBlock("div", dN, [
                      e.createElementVNode("table", cN, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(d.$t("不一致的字段")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(d.$t("各单据写法")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(V.value.check.issues, (u) => (e.openBlock(), e.createElementBlock("tr", {
                              key: u.field,
                              class: "bad"
                            }, [
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(E(u.field)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("td", uN, [
                                (e.openBlock(!0), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(u.values, (G) => (e.openBlock(), e.createElementBlock("div", {
                                    key: G.doc,
                                    class: "ft-diff"
                                  }, [
                                    e.createTextVNode(
                                      e.toDisplayString(d.$t("{p0}：", { p0: G.doc })),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "strong",
                                      null,
                                      e.toDisplayString(G.value),
                                      1
                                      /* TEXT */
                                    )
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
                      ])
                    ])) : (e.openBlock(), e.createElementBlock("p", mN, [
                      f[53] || (f[53] = e.createElementVNode(
                        "i",
                        { class: "ri-check-double-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(V.value.check.compared.length ? d.$t("核对了 {p0}，各单据一致", { p0: V.value.check.compared.map(E).join("、") }) : d.$t("至少要有两份单据提取到同一字段才能核对")),
                        1
                        /* TEXT */
                      )
                    ])),
                    V.value.check.findings?.length ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 2 },
                      [
                        e.createElementVNode(
                          "div",
                          pN,
                          e.toDisplayString(d.$t("金额与重量核对（逐行重算、合计、大写金额三方比对，按序号配行）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("ul", vN, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(V.value.check.findings, (u, G) => (e.openBlock(), e.createElementBlock("li", {
                              key: G,
                              "data-rule": u.rule,
                              "data-level": u.level
                            }, [
                              e.createElementVNode(
                                "span",
                                {
                                  class: e.normalizeClass(["ss-chip", Z(u.level)])
                                },
                                e.toDisplayString(c(u.level)),
                                3
                                /* TEXT, CLASS */
                              ),
                              e.createElementVNode(
                                "span",
                                null,
                                e.toDisplayString(u.message),
                                1
                                /* TEXT */
                              )
                            ], 8, yN))),
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
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(Q, {
              "step-key": "finish",
              index: 5,
              title: y[5].title,
              hint: y[5].hint,
              runtime: z.value.finish
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", VN, [
                  V.value.status !== "done" ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn primary",
                    disabled: k.value === "finish",
                    onClick: f[35] || (f[35] = (u) => ye("done"))
                  }, [
                    f[54] || (f[54] = e.createElementVNode(
                      "i",
                      { class: "ri-flag-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("标记订单完成")),
                      1
                      /* TEXT */
                    )
                  ], 8, NN)) : (e.openBlock(), e.createElementBlock("button", {
                    key: 1,
                    type: "button",
                    class: "ss-btn",
                    disabled: k.value === "finish",
                    onClick: f[36] || (f[36] = (u) => ye("active"))
                  }, [
                    f[55] || (f[55] = e.createElementVNode(
                      "i",
                      { class: "ri-arrow-go-back-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("重新打开")),
                      1
                      /* TEXT */
                    )
                  ], 8, EN)),
                  f[57] || (f[57] = e.createElementVNode(
                    "span",
                    { class: "grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost danger",
                    onClick: Ne
                  }, [
                    f[56] || (f[56] = e.createElementVNode(
                      "i",
                      { class: "ri-delete-bin-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(d.$t("删除订单")),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"])
          ])
        ])) : (e.openBlock(), e.createElementBlock(
          "section",
          gN,
          e.toDisplayString(d.$t("在左侧选择一个订单，或先新建订单")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), fN = /* @__PURE__ */ se(hN, [["__scopeId", "data-v-8b40d2d7"]]), kN = { class: "ss-module" }, bN = {
  key: 0,
  class: "ss-rules"
}, $N = { class: "ss-rule-row" }, DN = { class: "ft-check" }, SN = { class: "lbl" }, _N = { class: "lbl" }, BN = { value: "" }, wN = ["value"], CN = { class: "ss-rule-row" }, TN = { class: "lbl" }, MN = {
  key: 0,
  class: "ss-muted"
}, LN = { class: "ss-steps" }, UN = { class: "ss-actions" }, IN = ["onClick"], FN = { class: "ss-grid tight" }, PN = { class: "ss-field" }, AN = { class: "ss-field" }, ON = { class: "ss-actions" }, zN = ["disabled"], qN = { class: "ss-kpis" }, jN = { class: "ss-kpi accent" }, RN = { class: "ss-kpi" }, KN = { class: "ss-kpi" }, xN = { class: "ss-kpi" }, WN = { class: "ss-kpi" }, HN = { class: "ss-kpi" }, JN = { class: "ss-kpi" }, QN = { class: "ss-kpi" }, GN = { class: "ss-kpi" }, XN = { class: "ss-kpi" }, YN = { class: "ss-kpi" }, ZN = { class: "ss-kpi" }, eE = { class: "ss-kpi" }, tE = { class: "ft-two" }, lE = {
  key: 0,
  class: "ss-table-wrap"
}, nE = { class: "ss-table" }, oE = { class: "num" }, sE = { class: "num" }, aE = {
  key: 1,
  class: "ss-table-wrap"
}, iE = { class: "ss-table" }, rE = { class: "num" }, dE = { class: "num" }, cE = { class: "ss-note info" }, uE = { class: "ss-actions" }, mE = ["disabled"], pE = {
  key: 0,
  class: "ss-muted"
}, vE = {
  key: 0,
  class: "ft-comment"
}, yE = { class: "ss-actions" }, VE = ["disabled"], NE = {
  key: 0,
  class: "ss-file-out"
}, EE = { class: "ss-grid" }, gE = { class: "ss-field" }, hE = { value: "" }, fE = ["value"], kE = { class: "ss-field" }, bE = { class: "ss-actions" }, $E = ["disabled"], DE = {
  key: 1,
  class: "ss-note ok"
}, SE = {
  key: 1,
  class: "ss-panel"
}, _E = { class: "ss-table-wrap ft-scroll" }, BE = { class: "ss-table" }, wE = { class: "num" }, CE = { class: "num" }, TE = ["onClick"], ME = ["title", "onClick"], LE = /* @__PURE__ */ e.defineComponent({
  __name: "ReportTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(H) {
    const W = ae.useNotificationStore(), M = l.ftState, B = e.computed(() => l.enabledMailboxes(M.value)), U = e.computed(() => M.value?.reports || []), L = e.computed(() => M.value?.settings.reportSchedule), w = e.reactive({ enabled: !1, time: "18:00", recipients: "", mailboxId: "" });
    e.watch(L, (m) => {
      m && Object.assign(w, { enabled: m.enabled, time: m.time, recipients: m.recipients.join(", "), mailboxId: m.mailboxId || "" });
    }, { immediate: !0 });
    const A = [
      { key: "today", label: o.t("今天") },
      { key: "week", label: o.t("本周") },
      { key: "month", label: o.t("本月") },
      { key: "custom", label: o.t("自定义") }
    ], T = e.ref("today"), V = e.ref(l.todayIso()), _ = e.ref(l.todayIso()), I = e.ref(""), x = e.ref(""), C = e.ref(""), j = e.ref(""), b = e.ref({}), k = e.computed(() => U.value.find((m) => m.id === I.value) || null), P = e.computed(() => k.value?.stats);
    function R(m) {
      T.value = m;
      const h = /* @__PURE__ */ new Date();
      _.value = l.todayIso(), m === "today" && (V.value = l.todayIso()), m === "week" && (V.value = l.todayIso(-((h.getDay() + 6) % 7))), m === "month" && (V.value = l.todayIso(-(h.getDate() - 1)));
    }
    const S = [
      { key: "range", title: o.t("选择周期"), hint: o.t("今天、本周、本月或自定义日期") },
      { key: "build", title: o.t("汇总数据"), hint: o.t("询盘、邮件、开发、报价、订单、跟进，按记录统计") },
      { key: "comment", title: o.t("生成点评"), hint: o.t("指出最需要关注的变化并给建议") },
      { key: "export", title: o.t("导出与发送"), hint: o.t("导出 Excel，或发邮件给管理层") }
    ], K = e.computed(() => {
      const m = k.value, h = (O, Z, c) => j.value === O ? { state: "running" } : b.value[O] ? { state: "failed", error: b.value[O] } : Z ? { state: "done", summary: c } : { state: "todo" };
      return {
        range: h("range", !!V.value && !!_.value, `${V.value} ~ ${_.value}`),
        build: h("build", !!m, m ? o.t("{n} 个新询盘", { n: m.stats.inquiries.total }) : ""),
        comment: h("comment", !!m?.commentary),
        export: h("export", !!(m?.filePath || m?.sentAt))
      };
    }), J = e.computed(() => S.find((m) => K.value[m.key].state !== "done")?.key || "export");
    async function X(m, h) {
      j.value = m, b.value = { ...b.value, [m]: "" }, le.scrollToStep(m);
      try {
        return await h(), await l.refreshState(), !0;
      } catch (O) {
        return b.value = { ...b.value, [m]: l.errorMessage(O) }, !1;
      } finally {
        j.value = "";
      }
    }
    async function $() {
      if (!/^\d{1,2}:\d{2}$/.test(w.time)) {
        W.warn(o.t("时间格式应为 HH:MM，例如 18:00"));
        return;
      }
      const [m, h] = w.time.split(":");
      try {
        await l.ft("settings.patch", { patch: { reportSchedule: { enabled: w.enabled, time: `${m.padStart(2, "0")}:${h}`, recipients: l.splitEmails(w.recipients), mailboxId: w.mailboxId || void 0 } } }), await l.refreshState(), W.success(o.t("定时日报设置已保存"));
      } catch (O) {
        W.error(l.errorMessage(O));
      }
    }
    async function a() {
      if (V.value > _.value) {
        b.value = { ...b.value, build: o.t("开始日期不能晚于结束日期") };
        return;
      }
      await X("build", async () => {
        const m = await l.ft("report.build", { from: V.value, to: _.value });
        I.value = m.id;
      });
    }
    async function p() {
      k.value && await X("comment", () => l.ft("report.commentary", { id: k.value.id }));
    }
    async function y() {
      k.value && await X("export", () => l.ft("report.export", { id: k.value.id }));
    }
    async function z() {
      const m = k.value;
      if (!m) return;
      const h = l.splitEmails(C.value);
      if (!l.confirmSend(l.mailboxName(M.value, x.value), h, o.t("外贸业务报表 {p0} ~ {p1}", { p0: m.stats.from, p1: m.stats.to }))) return;
      await X("send", () => l.ft("report.send", { id: m.id, mailboxId: x.value, to: h })) && W.success(o.t("报表已发送"));
    }
    function N(m) {
      m && l.ft("path.open", { path: m }).catch((h) => W.error(l.errorMessage(h)));
    }
    function q(m) {
      le.scrollToStep(m);
    }
    async function E(m) {
      if (window.confirm(o.t("删除这份报表？导出的文件不受影响。")))
        try {
          await l.ft("report.remove", { id: m }), I.value === m && (I.value = ""), await l.refreshState();
        } catch (h) {
          W.error(l.errorMessage(h));
        }
    }
    return (m, h) => (e.openBlock(), e.createElementBlock("div", kN, [
      e.createVNode(re, { meta: H.meta }, null, 8, ["meta"]),
      e.createCommentVNode(" 定时日报 "),
      L.value ? (e.openBlock(), e.createElementBlock("section", bN, [
        e.createElementVNode("h4", null, [
          h[11] || (h[11] = e.createElementVNode(
            "i",
            { class: "ri-alarm-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(m.$t("定时日报")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", $N, [
          e.createElementVNode("label", DN, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": h[0] || (h[0] = (O) => w.enabled = O),
                type: "checkbox"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, w.enabled]
            ]),
            e.createTextVNode(
              e.toDisplayString(m.$t("每天自动汇总当天数据并发邮件")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            SN,
            e.toDisplayString(m.$t("时间")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": h[1] || (h[1] = (O) => w.time = O),
              type: "text",
              placeholder: "18:00",
              class: "ft-time"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, w.time]
          ]),
          e.createElementVNode(
            "span",
            _N,
            e.toDisplayString(m.$t("发件邮箱")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": h[2] || (h[2] = (O) => w.mailboxId = O)
            },
            [
              e.createElementVNode(
                "option",
                BN,
                e.toDisplayString(m.$t("请选择")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(B.value, (O) => (e.openBlock(), e.createElementBlock("option", {
                  key: O.id,
                  value: O.id
                }, e.toDisplayString(O.label || O.address), 9, wN))),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, w.mailboxId]
          ])
        ]),
        e.createElementVNode("div", CN, [
          e.createElementVNode(
            "span",
            TN,
            e.toDisplayString(m.$t("收件人（多个用逗号隔开）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": h[3] || (h[3] = (O) => w.recipients = O),
              type: "text",
              class: "ft-wide"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, w.recipients]
          ]),
          h[13] || (h[13] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm primary",
            onClick: $
          }, [
            h[12] || (h[12] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(m.$t("保存")),
              1
              /* TEXT */
            )
          ])
        ]),
        L.value.lastSentDate ? (e.openBlock(), e.createElementBlock(
          "p",
          MN,
          e.toDisplayString(m.$t("上次自动发送：{p0}", { p0: L.value.lastSentDate })),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      e.createVNode(ie, {
        title: m.$t("数据整理"),
        metas: S,
        runtime: K.value,
        "current-key": J.value,
        onJump: q
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", LN, [
        e.createVNode(Q, {
          "step-key": "range",
          index: 0,
          title: S[0].title,
          hint: S[0].hint,
          runtime: K.value.range
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", UN, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(A, (O) => e.createElementVNode("button", {
                  key: O.key,
                  type: "button",
                  class: e.normalizeClass(["ss-btn sm", { primary: T.value === O.key }]),
                  onClick: (Z) => R(O.key)
                }, e.toDisplayString(O.label), 11, IN)),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", FN, [
              e.createElementVNode("label", PN, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(m.$t("开始日期")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[4] || (h[4] = (O) => V.value = O),
                    type: "date",
                    onInput: h[5] || (h[5] = (O) => T.value = "custom")
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [e.vModelText, V.value]
                ])
              ]),
              e.createElementVNode("label", AN, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(m.$t("结束日期")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[6] || (h[6] = (O) => _.value = O),
                    type: "date",
                    onInput: h[7] || (h[7] = (O) => T.value = "custom")
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [e.vModelText, _.value]
                ])
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "build",
          index: 1,
          title: S[1].title,
          hint: S[1].hint,
          runtime: K.value.build
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", ON, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !V.value || !_.value || j.value === "build",
                onClick: a
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(j.value === "build" ? "ri-loader-4-line spin" : "ri-bar-chart-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(m.$t("汇总数据")),
                  1
                  /* TEXT */
                )
              ], 8, zN)
            ]),
            k.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", qN, [
                  e.createElementVNode("div", jN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("新询盘")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.inquiries.total),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", RN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("垃圾询盘")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.inquiries.spam),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", KN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("已回复")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.inquiries.replied),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", xN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("平均首次回复（小时）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.inquiries.avgFirstReplyHours ?? "—"),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", WN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("收到邮件")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.mails.received),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", HN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("发出邮件")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.mails.sent),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", JN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("新增潜客")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.outreach.leads),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", QN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("开发信已发")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.outreach.sent),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", GN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("报价单")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.quotes.count),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", XN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("已发报价")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.quotes.sent),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", YN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("进行中订单")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.orders.active),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", ZN, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("逾期节点")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.orders.overdueNodes),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", eE, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(m.$t("待跟进客户")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(P.value.followups.due),
                      1
                      /* TEXT */
                    )
                  ]),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(P.value.quotes.amountByCurrency, (O, Z) => (e.openBlock(), e.createElementBlock("div", {
                      key: Z,
                      class: "ss-kpi"
                    }, [
                      e.createElementVNode(
                        "small",
                        null,
                        e.toDisplayString(m.$t("已发报价金额（{p0}）", { p0: Z })),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(e.unref(l.fmtMoney)(O)),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("div", tE, [
                  Object.keys(P.value.inquiries.byMailbox).length ? (e.openBlock(), e.createElementBlock("div", lE, [
                    e.createElementVNode("table", nE, [
                      e.createElementVNode("thead", null, [
                        e.createElementVNode("tr", null, [
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(m.$t("邮箱")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            oE,
                            e.toDisplayString(m.$t("询盘")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("tbody", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(P.value.inquiries.byMailbox, (O, Z) => (e.openBlock(), e.createElementBlock("tr", { key: Z }, [
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(Z),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              sE,
                              e.toDisplayString(O),
                              1
                              /* TEXT */
                            )
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])
                  ])) : e.createCommentVNode("v-if", !0),
                  Object.keys(P.value.inquiries.byCategory).length ? (e.openBlock(), e.createElementBlock("div", aE, [
                    e.createElementVNode("table", iE, [
                      e.createElementVNode("thead", null, [
                        e.createElementVNode("tr", null, [
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(m.$t("产品线")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            rE,
                            e.toDisplayString(m.$t("询盘")),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("tbody", null, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(P.value.inquiries.byCategory, (O, Z) => (e.openBlock(), e.createElementBlock("tr", { key: Z }, [
                            e.createElementVNode(
                              "td",
                              null,
                              e.toDisplayString(Z),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              dE,
                              e.toDisplayString(O),
                              1
                              /* TEXT */
                            )
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])
                  ])) : e.createCommentVNode("v-if", !0)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "comment",
          index: 2,
          title: S[2].title,
          hint: S[2].hint,
          runtime: K.value.comment
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", cE, [
              h[14] || (h[14] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(m.$t("报表里的数字全部由系统按记录统计，模型只负责写点评，不改动数字。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", uE, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !k.value || j.value === "comment",
                onClick: p
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(j.value === "comment" ? "ri-loader-4-line spin" : "ri-chat-quote-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(m.$t("生成点评")),
                  1
                  /* TEXT */
                )
              ], 8, mE),
              k.value?.model ? (e.openBlock(), e.createElementBlock(
                "span",
                pE,
                e.toDisplayString(m.$t("由 {p0} 撰写", { p0: e.unref(l.modelLabel)(k.value.model) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            k.value?.commentary ? (e.openBlock(), e.createElementBlock(
              "p",
              vE,
              e.toDisplayString(k.value.commentary),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(Q, {
          "step-key": "export",
          index: 3,
          title: S[3].title,
          hint: S[3].hint,
          runtime: K.value.export
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", yE, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !k.value || j.value === "export",
                onClick: y
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(j.value === "export" ? "ri-loader-4-line spin" : "ri-file-excel-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(m.$t("导出 Excel")),
                  1
                  /* TEXT */
                )
              ], 8, VE)
            ]),
            k.value?.filePath ? (e.openBlock(), e.createElementBlock("div", NE, [
              h[16] || (h[16] = e.createElementVNode(
                "i",
                { class: "ri-file-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "code",
                null,
                e.toDisplayString(k.value.filePath),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                onClick: h[8] || (h[8] = (O) => N(k.value.filePath))
              }, [
                h[15] || (h[15] = e.createElementVNode(
                  "i",
                  { class: "ri-external-link-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(m.$t("打开")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", EE, [
              e.createElementVNode("label", gE, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(m.$t("发件邮箱")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": h[9] || (h[9] = (O) => x.value = O)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      hE,
                      e.toDisplayString(m.$t("请选择")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(B.value, (O) => (e.openBlock(), e.createElementBlock("option", {
                        key: O.id,
                        value: O.id
                      }, e.toDisplayString(O.label || O.address), 9, fE))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, x.value]
                ])
              ]),
              e.createElementVNode("label", kE, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(m.$t("收件人")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": h[10] || (h[10] = (O) => C.value = O),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, C.value]
                ])
              ])
            ]),
            e.createElementVNode("div", bE, [
              h[17] || (h[17] = e.createElementVNode(
                "span",
                { class: "grow" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !k.value || !x.value || !C.value || j.value === "send",
                onClick: z
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(j.value === "send" ? "ri-loader-4-line spin" : "ri-send-plane-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(m.$t("发送报表")),
                  1
                  /* TEXT */
                )
              ], 8, $E)
            ]),
            k.value?.sentAt ? (e.openBlock(), e.createElementBlock("p", DE, [
              h[18] || (h[18] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(m.$t("已于 {p0} 发送", { p0: e.unref(l.fmtDateTime)(k.value.sentAt) })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ]),
      e.createCommentVNode(" 历史报表 "),
      U.value.length ? (e.openBlock(), e.createElementBlock("section", SE, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            h[19] || (h[19] = e.createElementVNode(
              "i",
              { class: "ri-history-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(m.$t("历史报表")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", _E, [
          e.createElementVNode("table", BE, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("区间")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("生成时间")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  wE,
                  e.toDisplayString(m.$t("新询盘")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(m.$t("已发送")),
                  1
                  /* TEXT */
                ),
                h[20] || (h[20] = e.createElementVNode(
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
                e.renderList(U.value, (O) => (e.openBlock(), e.createElementBlock(
                  "tr",
                  {
                    key: O.id,
                    class: e.normalizeClass({ "ft-active": O.id === I.value })
                  },
                  [
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(O.stats.from) + " ~ " + e.toDisplayString(O.stats.to),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(e.unref(l.fmtDateTime)(O.createdAt)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      CE,
                      e.toDisplayString(O.stats.inquiries.total),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      null,
                      e.toDisplayString(O.sentAt ? e.unref(l.fmtDateTime)(O.sentAt) : "—"),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("td", null, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost",
                        onClick: (Z) => I.value = O.id
                      }, [
                        h[21] || (h[21] = e.createElementVNode(
                          "i",
                          { class: "ri-folder-open-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(m.$t("查看")),
                          1
                          /* TEXT */
                        )
                      ], 8, TE),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost danger",
                        title: m.$t("删除这份报表"),
                        onClick: (Z) => E(O.id)
                      }, [...h[22] || (h[22] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-delete-bin-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, ME)
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
        ])
      ])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), UE = /* @__PURE__ */ se(LE, [["__scopeId", "data-v-00e84e48"]]), IE = { class: "ft-workbench" }, FE = { class: "workbench-header" }, PE = { class: "heading" }, AE = { class: "eyebrow" }, OE = { class: "subtitle" }, zE = { class: "header-actions" }, qE = ["disabled"], jE = {
  class: "ft-tabs",
  role: "tablist"
}, RE = ["aria-selected", "title", "onClick"], KE = {
  key: 0,
  class: "ft-badge"
}, xE = ["aria-selected", "title"], WE = ["title"], HE = {
  key: 0,
  class: "ss-note info ft-progress"
}, JE = {
  key: 1,
  class: "ft-body"
}, QE = {
  key: 2,
  class: "ss-note danger"
}, GE = {
  key: 3,
  class: "ss-note"
}, fe = "totalclaw:foreign-trade-tab:v1", XE = /* @__PURE__ */ e.defineComponent({
  __name: "ForeignTradeWorkbenchView",
  setup(H) {
    const W = l.moduleMetas(), M = {
      platform: So,
      prospect: Ls,
      inquiry: li,
      background: Wr,
      followup: qd,
      content: eu,
      social: Zu,
      quote: jv,
      order: fN,
      report: UE
    };
    function B() {
      try {
        const p = localStorage.getItem(fe);
        return p === "settings" || W.some((y) => y.key === p) ? p : "inquiry";
      } catch {
        return "inquiry";
      }
    }
    const U = l.ftState, L = e.ref(B()), w = e.reactive({}), A = e.ref(!1), T = e.ref(!1), V = e.ref(""), _ = e.computed(() => U.value?.mailboxes || []), I = e.computed(() => _.value.filter((p) => p.enabled && p.status === "error").length), x = e.computed(() => A.value && (!_.value.length || I.value > 0)), C = e.computed(() => _.value.length ? I.value ? o.t("{n} 个邮箱收件异常", { n: I.value }) : o.t("邮箱接管、结果目录、各模块模型") : o.t("还没有接管邮箱，在这里添加")), j = e.computed(() => W.find((p) => p.key === L.value) || W[0]), b = e.computed(() => L.value === "settings" ? null : M[L.value]), k = e.computed(() => l.ftProgress[L.value] || "");
    function P(p) {
      const y = U.value;
      if (!y) return "";
      if (p === "inquiry") {
        const z = y.inquiries.filter((N) => N.status === "new" || N.status === "extracted").length;
        return z ? String(z) : "";
      }
      if (p === "order") {
        const z = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), N = y.orders.filter((q) => q.status === "active").reduce((q, E) => q + E.nodes.filter((m) => !m.done && m.due && m.due < z).length, 0);
        return N ? String(N) : "";
      }
      return "";
    }
    function R(p) {
      L.value = p;
      try {
        localStorage.setItem(fe, p);
      } catch {
      }
    }
    function S(p, y) {
      W.some((z) => z.key === p) && (w[p] = { ...y || {}, at: Date.now() }, R(p));
    }
    async function K() {
      T.value = !0;
      try {
        await Promise.all([l.refreshState(), l.loadModels()]), A.value = !0, V.value = "";
      } catch (p) {
        V.value = l.errorMessage(p);
      } finally {
        T.value = !1;
      }
    }
    let J = null;
    function X() {
      J || (J = setTimeout(() => {
        J = null, l.refreshState().catch(() => {
        });
      }, 400));
    }
    const $ = {};
    let a = null;
    return e.onMounted(() => {
      K(), a = l.onFtEvent((p) => {
        if (p.type === "progress" && p.payload?.key) {
          const y = String(p.payload.key);
          l.ftProgress[y] = String(p.payload.message || ""), clearTimeout($[y]), $[y] = setTimeout(() => {
            l.ftProgress[y] = "";
          }, 15e3);
          return;
        }
        X();
      });
    }), e.onBeforeUnmount(() => {
      a?.(), a = null, J && clearTimeout(J);
      for (const p of Object.values($)) clearTimeout(p);
    }), (p, y) => (e.openBlock(), e.createElementBlock("div", IE, [
      e.createElementVNode("header", FE, [
        e.createElementVNode("div", PE, [
          e.createVNode(Ce),
          y[1] || (y[1] = e.createElementVNode(
            "span",
            { class: "heading-icon" },
            [
              e.createElementVNode("i", { class: "ri-ship-2-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "p",
              AE,
              e.toDisplayString(p.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(p.$t("外贸业务智能体")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              OE,
              e.toDisplayString(p.$t("按十项日常工作分成十个模块：数字员工把资料、初稿和提醒准备好，业务员做判断、做决定。对外发出的内容由人确认；只有打开了自动回复的邮箱会按规则自动回信。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", zE, [
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: T.value,
            onClick: K
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(T.value ? "ri-loader-4-line spin" : "ri-refresh-line")
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
          ], 8, qE)
        ])
      ]),
      e.createCommentVNode(" 十个模块 "),
      e.createElementVNode("nav", jE, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(e.unref(W), (z) => (e.openBlock(), e.createElementBlock("button", {
            key: z.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["ft-tab", { active: L.value === z.key }]),
            "aria-selected": L.value === z.key,
            title: z.desc,
            onClick: (N) => R(z.key)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(z.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(z.title),
              1
              /* TEXT */
            ),
            P(z.key) ? (e.openBlock(), e.createElementBlock(
              "em",
              KE,
              e.toDisplayString(P(z.key)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, RE))),
          128
          /* KEYED_FRAGMENT */
        )),
        y[3] || (y[3] = e.createElementVNode(
          "span",
          { class: "ft-tabs__grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createCommentVNode(" 设置：多邮箱接管 / 结果目录 / 各模块模型（原来放顶部，太占空间） "),
        e.createElementVNode("button", {
          type: "button",
          role: "tab",
          class: e.normalizeClass(["ft-tab", { active: L.value === "settings" }]),
          "aria-selected": L.value === "settings",
          title: C.value,
          onClick: y[0] || (y[0] = (z) => R("settings"))
        }, [
          y[2] || (y[2] = e.createElementVNode(
            "i",
            { class: "ri-settings-3-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(p.$t("设置")),
            1
            /* TEXT */
          ),
          x.value ? (e.openBlock(), e.createElementBlock("em", {
            key: 0,
            class: "ft-badge warn",
            title: C.value
          }, "!", 8, WE)) : e.createCommentVNode("v-if", !0)
        ], 10, xE)
      ]),
      k.value ? (e.openBlock(), e.createElementBlock("p", HE, [
        y[4] || (y[4] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
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
      A.value ? (e.openBlock(), e.createElementBlock("div", JE, [
        L.value === "settings" ? (e.openBlock(), e.createBlock(zl, { key: 0 })) : (e.openBlock(), e.createBlock(e.resolveDynamicComponent(b.value), {
          key: L.value,
          meta: j.value,
          focus: w[L.value] || null,
          onGoto: S
        }, null, 40, ["meta", "focus"]))
      ])) : V.value ? (e.openBlock(), e.createElementBlock("p", QE, [
        y[5] || (y[5] = e.createElementVNode(
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
      ])) : (e.openBlock(), e.createElementBlock("p", GE, [
        y[6] || (y[6] = e.createElementVNode(
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
}), YE = /* @__PURE__ */ se(XE, [["__scopeId", "data-v-45aeb296"]]);
export {
  YE as default
};
