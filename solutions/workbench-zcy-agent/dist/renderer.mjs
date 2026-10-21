const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const s = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!s) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
s.default;
const me = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!me) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const he = me.default, pe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!pe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const F = pe.default, ve = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!ve) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const oe = ve.default, ie = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!ie) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
ie.default;
const A = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!A) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
A.default;
const te = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/biz-automation/shared.ts"];
if (!te) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/biz-automation/shared.ts");
te.default;
async function N(_, h) {
  const $ = window.electronAPI?.workbenches?.zcyAgent;
  if (!$?.invoke) throw new Error(s.t("政采云智能体接口不可用，请重启应用"));
  return $.invoke(_, ie.toPlain(h ?? {}));
}
function Ve(_) {
  const h = window.electronAPI?.workbenches?.zcyAgent;
  return h?.onEvent ? h.onEvent(_) : () => {
  };
}
const J = e.ref(null);
async function H() {
  const _ = await N("state.get");
  return J.value = _, _;
}
async function se(_ = !1) {
  let h = J.value?.workbench || null;
  const $ = !!h && Date.now() - Date.parse(h.readAt) < 20 * 6e4;
  if ((!h || !$ || !h.loggedIn) && (h = await N("site.readWorkbench"), await H()), !h?.loggedIn) throw new Error(s.t("政采云还没有登录：请先到「账号与材料」登录，再回来操作"));
  if (_ && h.temporary) throw new Error(s.t("这个账号还是{p0}，进不了商品中心：请先在「账号与材料」里完成入驻", { p0: h.identity || s.t("临时供应商") }));
}
async function Ee(_) {
  const h = window.electronAPI?.conversation;
  if (!h?.getTranscript) throw new Error(s.t("当前版本读不到对话记录，请把数字员工的回复粘贴进来"));
  const $ = await h.getTranscript(_), w = Array.isArray($) ? $ : [];
  for (let k = w.length - 1; k >= 0; k -= 1) {
    const b = w[k] || {};
    if (b.role !== "user" && String(b.content || "").trim()) return String(b.content);
  }
  throw new Error(s.t("数字员工还没有回复，等它读完再点"));
}
function ce(_) {
  return { draft: s.t("草稿"), confirmed: s.t("已确认"), handed: s.t("数字员工处理中"), submitted: s.t("已提交审核"), listed: s.t("已上架"), rejected: s.t("被驳回"), delisted: s.t("已下架") }[_];
}
function de(_) {
  return { new: s.t("待算价"), priced: s.t("已算价"), confirmed: s.t("已确认"), handed: s.t("数字员工处理中"), submitted: s.t("已提交报价"), won: s.t("已成交"), lost: s.t("未成交"), skipped: s.t("不参与") }[_];
}
function ae(_) {
  return { to_accept: s.t("待接单"), to_ship: s.t("待发货"), shipped: s.t("已发货"), to_settle: s.t("待结算"), to_invoice: s.t("待开票"), done: s.t("已完成"), closed: s.t("已关闭") }[_];
}
const Z = (_) => (Number(_) || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), ye = (_) => `${Math.round(_ * 1e4) / 100}%`;
function ke(_) {
  if (!_) return s.t("未知");
  const h = new Date(_);
  if (!Number.isFinite(h.getTime())) return s.t("未知");
  const $ = (w) => String(w).padStart(2, "0");
  return `${h.getFullYear()}-${$(h.getMonth() + 1)}-${$(h.getDate())} ${$(h.getHours())}:${$(h.getMinutes())}`;
}
function Ne(_, h = !1) {
  return N("path.open", { path: _, reveal: h });
}
const $e = { class: "ss-module" }, be = { class: "ss-steps" }, fe = { class: "ss-grid" }, _e = { class: "ss-field" }, De = { class: "ss-field" }, Se = { class: "ss-field" }, we = { class: "ss-field" }, Be = { class: "ss-field" }, Ce = { class: "ss-field" }, Te = { class: "ss-field" }, ze = { class: "ss-field" }, Ue = { class: "ss-field" }, Me = ["value"], Le = {
  key: 0,
  class: "ss-grid"
}, Ae = ["onUpdate:modelValue"], Ie = ["onUpdate:modelValue"], Oe = {
  key: 1,
  class: "ss-note info"
}, Ke = { class: "ss-actions" }, We = ["disabled"], Fe = { class: "ss-grid" }, je = { class: "ss-field" }, Pe = ["placeholder"], Re = { class: "ss-field" }, qe = { class: "ss-field" }, Qe = { class: "ss-actions" }, He = ["disabled"], Je = {
  key: 0,
  class: "ss-empty"
}, Ye = {
  key: 1,
  class: "ss-table-wrap"
}, Ze = { class: "ss-table" }, Ge = ["onClick"], Xe = {
  key: 1,
  class: "ss-muted"
}, xe = { class: "zc-ops" }, et = ["onClick"], tt = ["onClick"], nt = { class: "ss-note info" }, lt = {
  key: 0,
  class: "ss-note warn"
}, ot = { class: "ss-grid" }, st = { class: "ss-field" }, at = { class: "ss-field" }, it = ["placeholder", "disabled"], rt = { class: "ss-field" }, ct = { class: "ss-field" }, dt = { class: "ss-actions" }, ut = ["disabled"], mt = {
  key: 0,
  class: "ss-chip ok",
  "data-test": "zc-has-password"
}, pt = { class: "ss-actions" }, vt = ["disabled"], yt = ["disabled"], kt = { class: "ss-muted" }, gt = { class: "ss-actions" }, ht = ["disabled"], Vt = {
  key: 0,
  class: "ss-note warn",
  "data-test": "zc-wb-state"
}, Et = {
  key: 1,
  class: "zc-wb",
  "data-test": "zc-wb-state"
}, Nt = { class: "ss-chip ok" }, $t = { class: "ss-muted" }, bt = {
  key: 0,
  class: "ss-note ok"
}, ft = {
  key: 1,
  class: "ss-note info"
}, _t = { class: "ss-actions" }, Dt = ["disabled"], St = ["disabled"], wt = { class: "ss-muted" }, Bt = {
  key: 2,
  class: "zc-check",
  "data-test": "zc-onboard-check"
}, Ct = {
  key: 0,
  class: "ss-note warn"
}, Tt = {
  key: 1,
  class: "ss-note ok"
}, zt = { class: "ss-muted" }, Ut = {
  class: "ss-note ok",
  "data-test": "zc-onboard-result"
}, Mt = {
  key: 0,
  class: "ss-note warn"
}, Lt = ["disabled"], At = {
  key: 1,
  class: "ss-note warn"
}, It = { class: "ss-note info" }, Ot = /* @__PURE__ */ e.defineComponent({
  __name: "AccountTab",
  setup(_) {
    const h = J, $ = e.ref(""), w = e.ref({}), k = e.computed(() => h.value?.settings.account), b = e.computed(() => h.value?.settings.regions || []), D = e.computed(() => h.value?.settings.company.qualifications || []), g = e.reactive({ name: "", creditCode: "", legalPerson: "", contact: "", phone: "", address: "", bank: "", bankAccount: "", englishName: "", shortName: "", postcode: "", email: "", contactMobile: "", totalAssets: "", employees: "", income: "", intro: "", registerOrg: "", registerCapital: "", scope: "", onjobCount: "", socialPayCount: "" }), U = [
      { key: "shortName", label: s.t("商家简称") },
      { key: "englishName", label: s.t("英文名称") },
      { key: "postcode", label: s.t("邮政编码") },
      { key: "email", label: s.t("对外电子邮箱") },
      { key: "contactMobile", label: s.t("联系人电话（业务负责人）") },
      { key: "registerOrg", label: s.t("营业执照登记机关") },
      { key: "registerCapital", label: s.t("注册资金（万元）") },
      { key: "totalAssets", label: s.t("上年末资产总额（万元）") },
      { key: "employees", label: s.t("上年末从业人员（人）") },
      { key: "income", label: s.t("上年度营业收入（万元）") },
      { key: "onjobCount", label: s.t("在职人数") },
      { key: "socialPayCount", label: s.t("社保缴费人数") },
      { key: "scope", label: s.t("经营范围（照营业执照）"), wide: !0 },
      { key: "intro", label: s.t("店铺介绍"), wide: !0 }
    ], M = e.ref(!1), E = e.computed(() => h.value?.workbench || null), B = e.ref(null), f = e.ref(null), L = e.ref("general"), V = e.computed(() => b.value.find((t) => t.id === L.value)), S = e.reactive({ username: "", password: "", loginUrl: "", homeUrl: "" }), y = () => ({ id: "", name: "", file: "", expireAt: "", note: "" }), v = e.reactive(y()), d = () => Object.assign(v, y()), m = e.ref(!1), C = e.ref(null), z = (t) => t.split(/[\\/]/).pop() || t;
    let I = !1;
    e.watch(h, (t) => {
      if (!t || I) return;
      I = !0;
      const { qualifications: r, ...p } = t.settings.company;
      Object.assign(g, p), L.value = t.settings.regionId, Object.assign(S, { username: t.settings.account.username, loginUrl: t.settings.account.loginUrl, homeUrl: t.settings.account.homeUrl });
    }, { immediate: !0 });
    const Y = (t) => {
      const r = h.value?.alerts.find((p) => p.kind === "qualification" && p.refId === t);
      return r ? r.level === "error" ? "bad" : "warn" : "";
    }, G = e.computed(() => {
      const t = C.value;
      return t ? t.filled ? s.t("账号密码已填好：请在内置浏览器里过验证码并点登录") : t.reason === "no-credential" ? s.t("登录页已打开：还没有保存账号密码，请自己在登录框里输入") : t.reason === "off-site" ? s.t("页面跳到了政采云以外的域名，没有填密码；请确认地址后自己登录") : s.t("登录页已打开，但没找到账号密码输入框（可能默认是扫码或短信登录页签）：请切到账号密码登录后自己输入") : "";
    });
    async function q(t, r) {
      $.value = t, w.value = { ...w.value, [t]: "" };
      try {
        return await r(), await H(), !0;
      } catch (p) {
        return w.value = { ...w.value, [t]: A.errorMessage(p) }, A.scrollToStep(t), !1;
      } finally {
        $.value = "";
      }
    }
    async function j() {
      await q("a-company", async () => {
        if (!g.name.trim()) throw new Error(s.t("请填企业名称"));
        await N("settings.patch", { patch: { company: { ...g }, regionId: L.value } });
      }), await n();
    }
    async function K() {
      const t = await N("files.pick", { kind: "any" });
      t[0] && (v.file = t[0]);
    }
    async function P() {
      await q("a-qual", () => N("qual.save", { ...v, id: v.id || void 0 })) && d();
    }
    async function R(t) {
      await q("a-qual", () => N("qual.remove", { id: t }));
    }
    async function Q() {
      await q("a-account", async () => {
        if (!S.username.trim()) throw new Error(s.t("请填登录账号"));
        await N("account.save", { username: S.username, loginUrl: S.loginUrl, homeUrl: S.homeUrl, ...S.password ? { password: S.password } : {} });
      }) && (S.password = "");
    }
    async function i() {
      await q("a-account", () => N("account.clearPassword"));
    }
    async function n() {
      try {
        B.value = await N("onboard.checklist");
      } catch {
        B.value = null;
      }
    }
    async function o(t) {
      await q(t === "onboard" ? "a-onboard" : "a-login", () => N("site.open", { target: t }));
    }
    async function a() {
      await q("a-login", () => N("site.readWorkbench")) && (m.value = !!E.value?.loggedIn);
    }
    async function T(t) {
      f.value = null, await q("a-onboard", async () => {
        f.value = await N("onboard.fill", { overwrite: t });
      });
    }
    async function O() {
      C.value = null, await q("a-login", async () => {
        C.value = await N("account.login");
      });
    }
    const W = [
      { key: "a-company", title: s.t("企业信息与区划"), hint: s.t("区划决定比价、图片、接单时限用哪套规则") },
      { key: "a-qual", title: s.t("资质材料"), hint: s.t("登记证照与授权，到期前提醒") },
      { key: "a-account", title: s.t("政采云账号"), hint: s.t("密码加密存在本机，不进模型对话") },
      { key: "a-login", title: s.t("登录并读取工作台"), hint: s.t("应用填账号密码，你过验证码；登录后读回入驻状态与待办") },
      { key: "a-onboard", title: s.t("入驻资料"), hint: s.t("把文本资料填进入驻页面，上传与提交由你来") }
    ];
    function X(t, r, p) {
      return $.value === t ? { state: "running" } : w.value[t] ? { state: "failed", error: w.value[t] } : r ? { state: "done", summary: p } : { state: "todo" };
    }
    const l = e.computed(() => ({
      "a-company": X("a-company", !!h.value?.settings.company.name, h.value?.settings.company.name),
      "a-qual": X("a-qual", D.value.length > 0, s.t("{n} 项", { n: D.value.length })),
      "a-account": X("a-account", !!k.value?.username),
      "a-login": X("a-login", m.value || !!E.value?.loggedIn, E.value?.loggedIn ? [E.value.region, E.value.identity].filter(Boolean).join(" · ") : ""),
      "a-onboard": X("a-onboard", !!E.value?.loggedIn && !E.value.temporary && !!f.value || !!E.value?.loggedIn && !E.value.temporary && !E.value.identity)
    })), c = e.computed(() => W.find((t) => l.value[t.key].state !== "done")?.key || "a-onboard");
    n();
    function u(t) {
      A.scrollToStep(t);
    }
    return (t, r) => (e.openBlock(), e.createElementBlock("div", $e, [
      e.createVNode(oe, {
        title: t.$t("账号与材料"),
        metas: W,
        runtime: l.value,
        "current-key": c.value,
        onJump: u
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", be, [
        e.createVNode(F, {
          "step-key": "a-company",
          index: 0,
          title: W[0].title,
          hint: W[0].hint,
          runtime: l.value["a-company"],
          "is-current": c.value === "a-company"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", fe, [
              e.createElementVNode("label", _e, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("企业名称")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[0] || (r[0] = (p) => g.name = p),
                    type: "text",
                    "data-test": "zc-company-name"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, g.name]
                ])
              ]),
              e.createElementVNode("label", De, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("统一社会信用代码")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[1] || (r[1] = (p) => g.creditCode = p),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, g.creditCode]
                ])
              ]),
              e.createElementVNode("label", Se, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("法定代表人")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[2] || (r[2] = (p) => g.legalPerson = p),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, g.legalPerson]
                ])
              ]),
              e.createElementVNode("label", we, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("联系人")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[3] || (r[3] = (p) => g.contact = p),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, g.contact]
                ])
              ]),
              e.createElementVNode("label", Be, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("联系电话")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[4] || (r[4] = (p) => g.phone = p),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, g.phone]
                ])
              ]),
              e.createElementVNode("label", Ce, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("地址")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[5] || (r[5] = (p) => g.address = p),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, g.address]
                ])
              ]),
              e.createElementVNode("label", Te, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("开户银行")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[6] || (r[6] = (p) => g.bank = p),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, g.bank]
                ])
              ]),
              e.createElementVNode("label", ze, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("银行账号")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[7] || (r[7] = (p) => g.bankAccount = p),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, g.bankAccount]
                ])
              ]),
              e.createElementVNode("label", Ue, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("所在区划（决定用哪套规则）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": r[8] || (r[8] = (p) => L.value = p),
                    "data-test": "zc-region"
                  },
                  [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(b.value, (p) => (e.openBlock(), e.createElementBlock("option", {
                        key: p.id,
                        value: p.id
                      }, e.toDisplayString(p.name), 9, Me))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, L.value]
                ])
              ])
            ]),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-link zc-more",
                onClick: r[9] || (r[9] = (p) => M.value = !M.value)
              },
              e.toDisplayString(M.value ? t.$t("收起入驻资料") : t.$t("展开入驻要用的更多资料（{n} 项）", { n: U.length })),
              1
              /* TEXT */
            ),
            M.value ? (e.openBlock(), e.createElementBlock("div", Le, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(U, (p) => e.createElementVNode(
                  "label",
                  {
                    key: p.key,
                    class: e.normalizeClass(["ss-field", { wide: p.wide }])
                  },
                  [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(p.label),
                      1
                      /* TEXT */
                    ),
                    p.wide ? e.withDirectives((e.openBlock(), e.createElementBlock("textarea", {
                      key: 0,
                      "onUpdate:modelValue": (ee) => g[p.key] = ee,
                      rows: "2"
                    }, null, 8, Ae)), [
                      [e.vModelText, g[p.key]]
                    ]) : e.withDirectives((e.openBlock(), e.createElementBlock("input", {
                      key: 1,
                      "onUpdate:modelValue": (ee) => g[p.key] = ee,
                      type: "text"
                    }, null, 8, Ie)), [
                      [e.vModelText, g[p.key]]
                    ])
                  ],
                  2
                  /* CLASS */
                )),
                64
                /* STABLE_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0),
            V.value ? (e.openBlock(), e.createElementBlock("p", Oe, [
              r[22] || (r[22] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(V.value.note) + e.toDisplayString(t.$t("（规则来自公开资料，各地会调整，以本区划现行规定为准，可在设置里改）")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", Ke, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!$.value,
                "data-test": "zc-company-save",
                onClick: j
              }, [
                r[23] || (r[23] = e.createElementVNode(
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
              ], 8, We)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "a-qual",
          index: 1,
          title: W[1].title,
          hint: W[1].hint,
          runtime: l.value["a-qual"],
          "is-current": c.value === "a-qual"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Fe, [
              e.createElementVNode("label", je, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("资质名称")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": r[10] || (r[10] = (p) => v.name = p),
                  type: "text",
                  placeholder: t.$t("如：营业执照、品牌授权书、3C 证书")
                }, null, 8, Pe), [
                  [e.vModelText, v.name]
                ])
              ]),
              e.createElementVNode("label", Re, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("到期日（长期有效留空）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[11] || (r[11] = (p) => v.expireAt = p),
                    type: "date"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, v.expireAt]
                ])
              ]),
              e.createElementVNode("label", qe, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("说明")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[12] || (r[12] = (p) => v.note = p),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, v.note]
                ])
              ])
            ]),
            e.createElementVNode("div", Qe, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                onClick: K
              }, [
                r[24] || (r[24] = e.createElementVNode(
                  "i",
                  { class: "ri-attachment-2" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(v.file ? z(v.file) : t.$t("选择文件")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!$.value || !v.name.trim(),
                onClick: P
              }, [
                r[25] || (r[25] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(v.id ? t.$t("保存修改") : t.$t("添加资质")),
                  1
                  /* TEXT */
                )
              ], 8, He),
              v.id ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: d
                },
                e.toDisplayString(t.$t("取消")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            D.value.length ? (e.openBlock(), e.createElementBlock("div", Ye, [
              e.createElementVNode("table", Ze, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("资质名称")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("到期日")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("文件")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(t.$t("说明")),
                      1
                      /* TEXT */
                    ),
                    r[26] || (r[26] = e.createElementVNode(
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
                    e.renderList(D.value, (p) => (e.openBlock(), e.createElementBlock("tr", {
                      key: p.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(p.name),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", Y(p.id)])
                          },
                          e.toDisplayString(p.expireAt || t.$t("长期")),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("td", null, [
                        p.file ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: (ee) => e.unref(Ne)(p.file)
                        }, e.toDisplayString(z(p.file)), 9, Ge)) : (e.openBlock(), e.createElementBlock("span", Xe, "—"))
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(p.note),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", xe, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (ee) => Object.assign(v, p)
                        }, e.toDisplayString(t.$t("改")), 9, et),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (ee) => R(p.id)
                        }, e.toDisplayString(t.$t("删除")), 9, tt)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              Je,
              e.toDisplayString(t.$t("把营业执照、品牌授权、检测报告等登记在这里，到期前 30 天提醒")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "a-account",
          index: 2,
          title: W[2].title,
          hint: W[2].hint,
          runtime: l.value["a-account"],
          "is-current": c.value === "a-account"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", nt, [
              r[27] || (r[27] = e.createElementVNode(
                "i",
                { class: "ri-shield-keyhole-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("密码用系统钥匙串加密后存在这台电脑上，只在你点「打开登录页」时由应用填进政采云的登录框（只在 zcygov.cn 域名下填），不会发给模型，也不会出现在和数字员工的对话里。")),
                1
                /* TEXT */
              )
            ]),
            e.unref(h) && !e.unref(h).secretStorage ? (e.openBlock(), e.createElementBlock("p", lt, [
              r[28] || (r[28] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("这台电脑的系统钥匙串不可用，密码没法安全保存；登录时请自己在登录框里输入。")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", ot, [
              e.createElementVNode("label", st, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("登录账号")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[13] || (r[13] = (p) => S.username = p),
                    type: "text",
                    autocomplete: "off",
                    "data-test": "zc-username"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, S.username]
                ])
              ]),
              e.createElementVNode("label", at, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("密码")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": r[14] || (r[14] = (p) => S.password = p),
                  type: "password",
                  autocomplete: "new-password",
                  placeholder: k.value?.hasPassword ? t.$t("已保存，留空不改") : "",
                  disabled: !e.unref(h)?.secretStorage,
                  "data-test": "zc-password"
                }, null, 8, it), [
                  [e.vModelText, S.password]
                ])
              ]),
              e.createElementVNode("label", rt, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("登录页地址")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[15] || (r[15] = (p) => S.loginUrl = p),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, S.loginUrl]
                ])
              ]),
              e.createElementVNode("label", ct, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("工作台地址")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": r[16] || (r[16] = (p) => S.homeUrl = p),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, S.homeUrl]
                ])
              ])
            ]),
            e.createElementVNode("div", dt, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!$.value,
                "data-test": "zc-account-save",
                onClick: Q
              }, [
                r[29] || (r[29] = e.createElementVNode(
                  "i",
                  { class: "ri-save-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("保存账号")),
                  1
                  /* TEXT */
                )
              ], 8, ut),
              k.value?.hasPassword ? (e.openBlock(), e.createElementBlock("span", mt, [
                r[30] || (r[30] = e.createElementVNode(
                  "i",
                  { class: "ri-lock-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("密码已加密保存")),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              k.value?.hasPassword ? (e.openBlock(), e.createElementBlock(
                "button",
                {
                  key: 1,
                  type: "button",
                  class: "ss-link",
                  onClick: i
                },
                e.toDisplayString(t.$t("删除保存的密码")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "a-login",
          index: 3,
          title: W[3].title,
          hint: W[3].hint,
          runtime: l.value["a-login"],
          "is-current": c.value === "a-login"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", pt, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!$.value,
                "data-test": "zc-login",
                onClick: O
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass($.value === "a-login" ? "ri-loader-4-line spin" : "ri-login-box-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("打开登录页并填好账号密码")),
                  1
                  /* TEXT */
                )
              ], 8, vt),
              C.value ? (e.openBlock(), e.createElementBlock("button", {
                key: 0,
                type: "button",
                class: "ss-btn",
                disabled: !!$.value,
                onClick: r[17] || (r[17] = (p) => m.value = !0)
              }, [
                r[31] || (r[31] = e.createElementVNode(
                  "i",
                  { class: "ri-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("我已登录")),
                  1
                  /* TEXT */
                )
              ], 8, yt)) : e.createCommentVNode("v-if", !0)
            ]),
            C.value ? (e.openBlock(), e.createElementBlock(
              "p",
              {
                key: 0,
                class: e.normalizeClass(["ss-note", C.value.filled ? "ok" : "warn"])
              },
              [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(C.value.filled ? "ri-check-line" : "ri-information-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(G.value),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            )) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "p",
              kt,
              e.toDisplayString(t.$t("协议勾选、滑块、图形验证码、短信验证码和「登录」按钮由你完成。登录后点下面的按钮，应用会打开供应商工作台并读回你的入驻状态和待办。CA 证书登录、电子投标客户端不在这个智能体的范围内。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", gt, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!$.value,
                "data-test": "zc-read-workbench",
                onClick: a
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass($.value === "a-login" ? "ri-loader-4-line spin" : "ri-dashboard-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("打开工作台并读取")),
                  1
                  /* TEXT */
                )
              ], 8, ht),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: r[18] || (r[18] = (p) => o("portal"))
                },
                e.toDisplayString(t.$t("吉林省政府采购网")),
                1
                /* TEXT */
              )
            ]),
            E.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                E.value.loggedIn ? (e.openBlock(), e.createElementBlock("div", Et, [
                  e.createElementVNode("span", Nt, [
                    r[33] || (r[33] = e.createElementVNode(
                      "i",
                      { class: "ri-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("已登录")),
                      1
                      /* TEXT */
                    )
                  ]),
                  E.value.region || E.value.identity ? (e.openBlock(), e.createElementBlock(
                    "span",
                    {
                      key: 0,
                      class: e.normalizeClass(["ss-chip", E.value.temporary ? "warn" : "brand"])
                    },
                    e.toDisplayString(E.value.region) + " · " + e.toDisplayString(E.value.identity),
                    3
                    /* TEXT, CLASS */
                  )) : e.createCommentVNode("v-if", !0),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(E.value.todos.filter((p) => p.count > 0), (p) => (e.openBlock(), e.createElementBlock(
                      "span",
                      {
                        key: p.label,
                        class: "ss-chip bad"
                      },
                      e.toDisplayString(p.label) + " " + e.toDisplayString(p.count),
                      1
                      /* TEXT */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  e.createElementVNode(
                    "span",
                    $t,
                    e.toDisplayString(t.$t("读取于 {p0}", { p0: e.unref(A.fmtDateTime)(E.value.readAt) })),
                    1
                    /* TEXT */
                  )
                ])) : (e.openBlock(), e.createElementBlock("p", Vt, [
                  r[32] || (r[32] = e.createElementVNode(
                    "i",
                    { class: "ri-user-follow-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("政采云还没有登录（或登录已过期）：请在内置浏览器里登录后再点一次")),
                    1
                    /* TEXT */
                  )
                ]))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "a-onboard",
          index: 4,
          title: W[4].title,
          hint: W[4].hint,
          runtime: l.value["a-onboard"],
          "is-current": c.value === "a-onboard"
        }, {
          default: e.withCtx(() => [
            E.value?.loggedIn && !E.value.temporary && !E.value.identity ? (e.openBlock(), e.createElementBlock("p", bt, [
              r[34] || (r[34] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("工作台上没有「正在入驻」的提示，这个账号应该已经是正式供应商，这一步不用做")),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock("p", ft, [
              r[35] || (r[35] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("临时供应商进不了商品中心（实测是「无访问权限」），要先把入驻资料提交并通过审核。应用把文本资料填进入驻页面；证照上传、下拉选择、勾选协议，以及「保存草稿」「提交入驻申请」都由你来。")),
                1
                /* TEXT */
              )
            ])),
            e.createElementVNode("div", _t, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!$.value,
                "data-test": "zc-onboard-open",
                onClick: r[19] || (r[19] = (p) => o("onboard"))
              }, [
                r[36] || (r[36] = e.createElementVNode(
                  "i",
                  { class: "ri-external-link-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("打开入驻页面")),
                  1
                  /* TEXT */
                )
              ], 8, Dt),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!$.value,
                "data-test": "zc-onboard-fill",
                onClick: r[20] || (r[20] = (p) => T(!1))
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass($.value === "a-onboard" ? "ri-loader-4-line spin" : "ri-edit-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("把资料填进入驻页面")),
                  1
                  /* TEXT */
                )
              ], 8, St),
              e.createElementVNode(
                "span",
                wt,
                e.toDisplayString(t.$t("先在入驻列表里点「继续入驻」进到填资料的页面，再点填写")),
                1
                /* TEXT */
              )
            ]),
            B.value ? (e.openBlock(), e.createElementBlock("div", Bt, [
              B.value.missing.length ? (e.openBlock(), e.createElementBlock("p", Ct, [
                r[37] || (r[37] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("这些文本资料还没填（在第 1 步里补）：{p0}", { p0: B.value.missing.join("、") })),
                  1
                  /* TEXT */
                )
              ])) : (e.openBlock(), e.createElementBlock("p", Tt, [
                r[38] || (r[38] = e.createElementVNode(
                  "i",
                  { class: "ri-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("能自动填的 {n} 项文本资料都齐了", { n: B.value.ready.length })),
                  1
                  /* TEXT */
                )
              ])),
              e.createElementVNode(
                "p",
                zt,
                e.toDisplayString(t.$t("要你在页面上处理的：{p0}", { p0: B.value.manual.join("、") })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            f.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 3 },
              [
                e.createElementVNode("p", Ut, [
                  r[39] || (r[39] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("填了 {a} 项；{b} 项页面上本来就是这个值", { a: f.value.filled.length, b: f.value.same.length })) + e.toDisplayString(f.value.filled.length ? t.$t("：{p0}", { p0: f.value.filled.join("、") }) : ""),
                    1
                    /* TEXT */
                  )
                ]),
                f.value.kept.length ? (e.openBlock(), e.createElementBlock("p", Mt, [
                  r[40] || (r[40] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("这些项页面上已经有不一样的值，没有动（以平台按营业执照预填的为准；要用你的资料覆盖就点右边）：{p0}", { p0: f.value.kept.map((p) => `${p[0]}=${p[1]}`).join("；") })),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    disabled: !!$.value,
                    onClick: r[21] || (r[21] = (p) => T(!0))
                  }, e.toDisplayString(t.$t("用我的资料覆盖")), 9, Lt)
                ])) : e.createCommentVNode("v-if", !0),
                f.value.missing.length ? (e.openBlock(), e.createElementBlock("p", At, [
                  r[41] || (r[41] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("页面上没找到这些输入框（页面可能改版了），请手工填：{p0}", { p0: f.value.missing.join("、") })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("p", It, [
                  r[42] || (r[42] = e.createElementVNode(
                    "i",
                    { class: "ri-cursor-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("现在请在入驻页面上完成上传与选择，核对无误后亲自点「保存草稿」或「提交入驻申请」。")),
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
        }, 8, ["title", "hint", "runtime", "is-current"])
      ])
    ]));
  }
}), x = (_, h) => {
  const $ = _.__vccOpts || _;
  for (const [w, k] of h)
    $[w] = k;
  return $;
}, Kt = /* @__PURE__ */ x(Ot, [["__scopeId", "data-v-e8ebc6f0"]]), ne = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!ne) throw new Error("宿主模块未就绪：npm:vue-router");
ne.default;
const le = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!le) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
le.default;
const re = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/foreign-trade/shared.ts"];
if (!re) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/foreign-trade/shared.ts");
re.default;
const Wt = { class: "ss-module" }, Ft = { class: "ss-steps" }, jt = { class: "ss-actions" }, Pt = ["disabled"], Rt = ["disabled"], qt = { class: "ss-muted" }, Qt = {
  key: 0,
  class: "ss-muted"
}, Ht = {
  key: 1,
  class: "ss-empty"
}, Jt = ["data-test"], Yt = { class: "zc-prod__head" }, Zt = { class: "ss-muted" }, Gt = {
  key: 0,
  class: "ss-chip bad",
  "data-test": "zc-prod-errors"
}, Xt = {
  key: 1,
  class: "ss-chip ok",
  "data-test": "zc-prod-ok"
}, xt = ["onClick"], en = ["disabled", "data-test", "onClick"], tn = ["onClick"], nn = ["onClick"], ln = {
  key: 0,
  class: "ss-note danger"
}, on = {
  key: 1,
  class: "zc-edit"
}, sn = { class: "ss-grid" }, an = { class: "ss-field" }, rn = { class: "ss-field" }, cn = { class: "ss-field" }, dn = { class: "ss-field" }, un = { class: "ss-field" }, mn = { class: "ss-field" }, pn = { class: "ss-field" }, vn = { class: "ss-field" }, yn = { class: "ss-field" }, kn = { class: "ss-field" }, gn = ["disabled", "onClick"], hn = { class: "ss-subhead" }, Vn = ["onUpdate:modelValue", "placeholder"], En = ["onUpdate:modelValue", "placeholder"], Nn = ["onClick"], $n = { class: "ss-actions" }, bn = { class: "ss-muted" }, fn = { class: "ss-subhead" }, _n = { class: "zc-imgs" }, Dn = ["src"], Sn = ["onClick"], wn = ["disabled", "onClick"], Bn = { class: "ss-actions" }, Cn = ["disabled", "onClick"], Tn = {
  key: 0,
  class: "ss-note warn",
  "data-test": "zc-listing-temp"
}, zn = { class: "ss-muted" }, Un = {
  key: 1,
  class: "ss-empty"
}, Mn = { class: "ss-muted" }, Ln = ["disabled", "data-test", "onClick"], An = ["onClick"], In = {
  key: 2,
  class: "zc-pre",
  "data-test": "zc-instruction"
}, On = {
  key: 0,
  class: "ss-empty"
}, Kn = {
  key: 1,
  class: "ss-table-wrap"
}, Wn = { class: "ss-table" }, Fn = { class: "num" }, jn = { class: "num" }, Pn = ["onUpdate:modelValue", "placeholder", "onChange"], Rn = { class: "zc-ops" }, qn = ["onClick"], Qn = ["onClick"], Hn = ["onClick"], Jn = ["onUpdate:modelValue", "placeholder"], Yn = ["disabled", "onClick"], Zn = ["onClick"], Gn = /* @__PURE__ */ e.defineComponent({
  __name: "ListingTab",
  setup(_) {
    const h = le.useNotificationStore(), $ = ne.useRouter(), w = J, k = e.ref(""), b = e.ref({}), D = e.computed(() => w.value?.products || []), g = e.computed(() => w.value?.settings.regions.find((l) => l.id === w.value?.settings.regionId)), U = e.computed(() => D.value.filter((l) => l.status === "draft" || l.status === "confirmed" || l.status === "rejected")), M = e.computed(() => D.value.filter((l) => l.status === "confirmed")), E = e.computed(() => D.value.filter((l) => ["handed", "submitted", "listed", "delisted"].includes(l.status))), B = (l) => l.issues.some((c) => c.level === "error"), f = (l) => l.issues.filter((c) => c.level === "error").length, L = e.ref(""), V = e.ref(null), S = e.ref(""), y = e.reactive({}), v = e.reactive({});
    e.watch(D, (l) => {
      for (const c of l) y[c.id] === void 0 && (y[c.id] = c.productUrl || "");
    }, { immediate: !0 });
    function d(l) {
      const c = l.refs.filter((u) => u.platform !== "other" && u.price > 0).map((u) => u.price);
      return c.length ? s.t(" · 自营价 {p0}", { p0: c.join(" / ") }) : "";
    }
    function m(l) {
      return { name: l.name, brand: l.brand, model: l.model, category: l.category, title: l.title, price: l.price, stock: l.stock, unit: l.unit, params: l.params, detail: l.detail, refs: l.refs.map((c) => ({ ...c })), images: l.images.map((c) => ({ ...c })) };
    }
    function C(l) {
      if (L.value === l) {
        L.value = "", V.value = null;
        return;
      }
      const c = D.value.find((u) => u.id === l);
      c && (L.value = l, V.value = m(c));
    }
    function z(l) {
      const c = D.value.find((u) => u.id === l);
      c && L.value === l && (V.value = m(c));
    }
    async function I(l, c) {
      k.value = l, b.value = { ...b.value, [l]: "" };
      try {
        return await c(), await H(), !0;
      } catch (u) {
        return b.value = { ...b.value, [l]: A.errorMessage(u) }, A.scrollToStep(l), !1;
      } finally {
        k.value = "";
      }
    }
    async function Y() {
      const l = await N("files.pick", { kind: "excel" });
      l.length && await I("l-import", async () => {
        const c = await N("products.import", { path: l[0] });
        h.success(s.t("导入 {n} 个商品", { n: c.imported }));
      });
    }
    async function G() {
      let l = "";
      await I("l-import", async () => {
        l = (await N("product.save", { patch: {} })).id;
      }) && C(l);
    }
    async function q(l) {
      const c = V.value;
      c && await I("l-check", () => N("product.save", { id: l, patch: { ...c, images: c.images.map((u) => ({ path: u.path })) } })) && z(l);
    }
    async function j(l) {
      const c = V.value;
      c && await I("l-check", async () => {
        await N("product.save", { id: l, patch: { ...c, images: c.images.map((u) => ({ path: u.path })) } }), await N("product.addImages", { id: l });
      }) && z(l);
    }
    async function K(l) {
      const c = V.value;
      c && await I("l-check", async () => {
        await N("product.save", { id: l, patch: { ...c, images: c.images.map((u) => ({ path: u.path })) } }), await N("product.describe", { id: l });
      }) && z(l);
    }
    async function P(l, c) {
      await I("l-check", async () => {
        if ((await N("product.confirm", { ids: [l], confirmed: c })).blocked) throw new Error(s.t("这个商品还有问题，不能确认"));
        c && L.value === l && (L.value = "", V.value = null);
      });
    }
    async function R(l) {
      window.confirm(s.t("删除这个商品？")) && await I("l-check", () => N("product.remove", { id: l }));
    }
    async function Q(l) {
      await I("l-hand", async () => {
        S.value = await N("product.instruction", { id: l });
      });
    }
    async function i(l) {
      await I("l-hand", async () => {
        await se(!0);
        const u = await N("product.instruction", { id: l }), t = D.value.find((p) => p.id === l), r = await te.handToDigitalEmployee(s.t("政采云上架：{p0}", { p0: t.title.slice(0, 20) }), u);
        await N("product.status", { id: l, status: "handed", conversationId: r }), S.value = "";
      }) && h.success(s.t("已交给数字员工，它会停在「提交审核」前等你确认"));
    }
    async function n(l, c, u = {}) {
      await I("l-ledger", () => N("product.status", { id: l, status: c, ...u }));
    }
    function o(l) {
      $.push(`/conversations/${l}`).catch((c) => h.error(A.errorMessage(c)));
    }
    const a = [
      { key: "l-import", title: s.t("商品资料"), hint: s.t("导入商品表或手动添加") },
      { key: "l-check", title: s.t("补全、检查并确认"), hint: s.t("标题、禁用词、图片规格、比价链接与售价，查过才能确认") },
      { key: "l-hand", title: s.t("数字员工上架"), hint: s.t("在政采云后台填写，停在提交审核前") },
      { key: "l-ledger", title: s.t("上架台账"), hint: s.t("跟进审核结果、驳回原因与商品链接") }
    ];
    function T(l, c, u) {
      return k.value === l ? { state: "running" } : b.value[l] ? { state: "failed", error: b.value[l] } : c ? { state: "done", summary: u } : { state: "todo" };
    }
    const O = e.computed(() => ({
      "l-import": T("l-import", D.value.length > 0, s.t("{n} 个商品", { n: D.value.length })),
      "l-check": T("l-check", D.value.length > 0 && !U.value.some((l) => l.status !== "confirmed")),
      "l-hand": T("l-hand", E.value.length > 0 && M.value.length === 0),
      "l-ledger": T("l-ledger", D.value.some((l) => l.status === "listed"))
    })), W = e.computed(() => a.find((l) => O.value[l.key].state !== "done")?.key || "l-ledger");
    function X(l) {
      A.scrollToStep(l);
    }
    return (l, c) => (e.openBlock(), e.createElementBlock("div", Wt, [
      e.createVNode(oe, {
        title: l.$t("商品上架"),
        metas: a,
        runtime: O.value,
        "current-key": W.value,
        onJump: X
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", Ft, [
        e.createVNode(F, {
          "step-key": "l-import",
          index: 0,
          title: a[0].title,
          hint: a[0].hint,
          runtime: O.value["l-import"],
          "is-current": W.value === "l-import"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", jt, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!k.value,
                "data-test": "zc-products-import",
                onClick: Y
              }, [
                c[11] || (c[11] = e.createElementVNode(
                  "i",
                  { class: "ri-file-excel-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(l.$t("导入商品表")),
                  1
                  /* TEXT */
                )
              ], 8, Pt),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn",
                disabled: !!k.value,
                "data-test": "zc-product-add",
                onClick: G
              }, [
                c[12] || (c[12] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(l.$t("手动添加一个")),
                  1
                  /* TEXT */
                )
              ], 8, Rt),
              e.createElementVNode(
                "span",
                qt,
                e.toDisplayString(l.$t("表头认：商品名称、品牌、型号、类目、售价、库存、参数、京东 / 天猫 / 苏宁链接、电商价、图片路径")),
                1
                /* TEXT */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "l-check",
          index: 1,
          title: a[1].title,
          hint: a[1].hint,
          runtime: O.value["l-check"],
          "is-current": W.value === "l-check"
        }, {
          default: e.withCtx(() => [
            g.value ? (e.openBlock(), e.createElementBlock(
              "p",
              Qt,
              e.toDisplayString(l.$t("当前规则「{p0}」：主图 ≥ {p1} 张、最短边 ≥ {p2}、单张 ≤ {p3}KB；至少 {p4} 条自营比价链接；售价不得高于自营价{p5}{p6}", { p0: g.value.name, p1: g.value.imageMin, p2: g.value.imageMinSide, p3: g.value.imageMaxKb, p4: g.value.refMin, p5: g.value.priceRule === "min" ? l.$t("最低价") : l.$t("均值"), p6: g.value.priceTolerance ? l.$t("的 {p0}", { p0: e.unref(ye)(1 + g.value.priceTolerance) }) : "" })),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            U.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              Ht,
              e.toDisplayString(l.$t("导入或添加商品后在这里补全并检查")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(U.value, (u) => (e.openBlock(), e.createElementBlock("div", {
                key: u.id,
                class: e.normalizeClass(["zc-prod", { bad: B(u) }]),
                "data-test": `zc-prod-${u.name}`
              }, [
                e.createElementVNode("div", Yt, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", u.status === "confirmed" ? "ok" : u.status === "rejected" ? "bad" : ""])
                    },
                    e.toDisplayString(e.unref(ce)(u.status)),
                    3
                    /* TEXT, CLASS */
                  ),
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(u.title || u.name || l.$t("未命名商品")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    Zt,
                    "¥" + e.toDisplayString(u.price) + e.toDisplayString(d(u)),
                    1
                    /* TEXT */
                  ),
                  c[13] || (c[13] = e.createElementVNode(
                    "span",
                    { class: "zc-grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  f(u) ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Gt,
                    e.toDisplayString(l.$t("{n} 个问题", { n: f(u) })),
                    1
                    /* TEXT */
                  )) : (e.openBlock(), e.createElementBlock(
                    "span",
                    Xt,
                    e.toDisplayString(l.$t("检查通过")),
                    1
                    /* TEXT */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (t) => C(u.id)
                  }, e.toDisplayString(L.value === u.id ? l.$t("收起") : l.$t("编辑")), 9, xt),
                  u.status !== "confirmed" ? (e.openBlock(), e.createElementBlock("button", {
                    key: 2,
                    type: "button",
                    class: "ss-btn sm primary",
                    disabled: !!k.value || B(u),
                    "data-test": `zc-prod-confirm-${u.name}`,
                    onClick: (t) => P(u.id, !0)
                  }, e.toDisplayString(l.$t("确认")), 9, en)) : (e.openBlock(), e.createElementBlock("button", {
                    key: 3,
                    type: "button",
                    class: "ss-link",
                    onClick: (t) => P(u.id, !1)
                  }, e.toDisplayString(l.$t("撤回确认")), 9, tn)),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (t) => R(u.id)
                  }, e.toDisplayString(l.$t("删除")), 9, nn)
                ]),
                u.status === "rejected" && u.rejectReason ? (e.openBlock(), e.createElementBlock("p", ln, [
                  c[14] || (c[14] = e.createElementVNode(
                    "i",
                    { class: "ri-close-circle-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(l.$t("平台驳回原因：{p0}", { p0: u.rejectReason })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(u.issues, (t, r) => (e.openBlock(), e.createElementBlock(
                    "p",
                    {
                      key: r,
                      class: e.normalizeClass(["ss-note", t.level === "error" ? "danger" : "warn"])
                    },
                    [
                      c[15] || (c[15] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.message),
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
                L.value === u.id && V.value ? (e.openBlock(), e.createElementBlock("div", on, [
                  e.createElementVNode("div", sn, [
                    e.createElementVNode("label", an, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(l.$t("商品名称（不含品牌型号）")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": c[0] || (c[0] = (t) => V.value.name = t),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, V.value.name]
                      ])
                    ]),
                    e.createElementVNode("label", rn, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(l.$t("品牌")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": c[1] || (c[1] = (t) => V.value.brand = t),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, V.value.brand]
                      ])
                    ]),
                    e.createElementVNode("label", cn, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(l.$t("型号")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": c[2] || (c[2] = (t) => V.value.model = t),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, V.value.model]
                      ])
                    ]),
                    e.createElementVNode("label", dn, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(l.$t("类目")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": c[3] || (c[3] = (t) => V.value.category = t),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, V.value.category]
                      ])
                    ]),
                    e.createElementVNode("label", un, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(l.$t("售价（元）")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": c[4] || (c[4] = (t) => V.value.price = t),
                          type: "number",
                          min: "0",
                          step: "0.01"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [
                          e.vModelText,
                          V.value.price,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ]),
                    e.createElementVNode("label", mn, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(l.$t("库存")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": c[5] || (c[5] = (t) => V.value.stock = t),
                          type: "number",
                          min: "0"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [
                          e.vModelText,
                          V.value.stock,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ]),
                    e.createElementVNode("label", pn, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(l.$t("单位")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": c[6] || (c[6] = (t) => V.value.unit = t),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, V.value.unit]
                      ])
                    ])
                  ]),
                  e.createElementVNode("label", vn, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(l.$t("上架标题（留空按「品牌 品名 型号」生成）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": c[7] || (c[7] = (t) => V.value.title = t),
                        type: "text"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelText, V.value.title]
                    ])
                  ]),
                  e.createElementVNode("label", yn, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(l.$t("参数（一行一条，如「幅面：A4」）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "textarea",
                      {
                        "onUpdate:modelValue": c[8] || (c[8] = (t) => V.value.params = t),
                        rows: "4"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelText, V.value.params]
                    ])
                  ]),
                  e.createElementVNode("label", kn, [
                    e.createElementVNode("span", null, [
                      e.createTextVNode(
                        e.toDisplayString(l.$t("商品详情")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link zc-inline",
                        disabled: !!k.value,
                        onClick: (t) => K(u.id)
                      }, e.toDisplayString(k.value === "l-check" ? l.$t("生成中…") : l.$t("按参数生成")), 9, gn)
                    ]),
                    e.withDirectives(e.createElementVNode(
                      "textarea",
                      {
                        "onUpdate:modelValue": c[9] || (c[9] = (t) => V.value.detail = t),
                        rows: "3"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelText, V.value.detail]
                    ])
                  ]),
                  e.createElementVNode(
                    "div",
                    hn,
                    e.toDisplayString(l.$t("电商比价链接（京东 / 天猫 / 苏宁自营同款）")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(V.value.refs, (t, r) => (e.openBlock(), e.createElementBlock("div", {
                      key: r,
                      class: "zc-ref"
                    }, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": (p) => t.url = p,
                        type: "text",
                        placeholder: l.$t("商品链接")
                      }, null, 8, Vn), [
                        [e.vModelText, t.url]
                      ]),
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": (p) => t.price = p,
                        type: "number",
                        min: "0",
                        step: "0.01",
                        placeholder: l.$t("对方售价")
                      }, null, 8, En), [
                        [
                          e.vModelText,
                          t.price,
                          void 0,
                          { number: !0 }
                        ]
                      ]),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-link",
                        onClick: (p) => V.value.refs.splice(r, 1)
                      }, e.toDisplayString(l.$t("移除")), 9, Nn)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  e.createElementVNode("div", $n, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn sm",
                      onClick: c[10] || (c[10] = (t) => V.value.refs.push({ platform: "other", url: "", price: 0 }))
                    }, [
                      c[16] || (c[16] = e.createElementVNode(
                        "i",
                        { class: "ri-add-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(l.$t("加一条链接")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "span",
                      bn,
                      e.toDisplayString(l.$t("对方售价请照页面抄：系统不去抓取电商页面")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "div",
                    fn,
                    e.toDisplayString(l.$t("主图")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("div", _n, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(V.value.images, (t, r) => (e.openBlock(), e.createElementBlock("figure", {
                        key: t.path
                      }, [
                        e.createElementVNode("img", {
                          src: e.unref(re.fileUrl)(t.path),
                          alt: ""
                        }, null, 8, Dn),
                        e.createElementVNode("figcaption", null, [
                          e.createTextVNode(
                            e.toDisplayString(t.width) + "×" + e.toDisplayString(t.height) + " · " + e.toDisplayString(t.kb) + "KB",
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            onClick: (p) => V.value.images.splice(r, 1)
                          }, e.toDisplayString(l.$t("移除")), 9, Sn)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "zc-addimg",
                      disabled: !!k.value,
                      onClick: (t) => j(u.id)
                    }, [
                      c[17] || (c[17] = e.createElementVNode(
                        "i",
                        { class: "ri-image-add-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(l.$t("添加图片")),
                        1
                        /* TEXT */
                      )
                    ], 8, wn)
                  ]),
                  e.createElementVNode("div", Bn, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary",
                      disabled: !!k.value,
                      "data-test": "zc-prod-save",
                      onClick: (t) => q(u.id)
                    }, [
                      c[18] || (c[18] = e.createElementVNode(
                        "i",
                        { class: "ri-save-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(l.$t("保存并检查")),
                        1
                        /* TEXT */
                      )
                    ], 8, Cn)
                  ])
                ])) : e.createCommentVNode("v-if", !0)
              ], 10, Jt))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "l-hand",
          index: 2,
          title: a[2].title,
          hint: a[2].hint,
          runtime: O.value["l-hand"],
          "is-current": W.value === "l-hand"
        }, {
          default: e.withCtx(() => [
            e.unref(w)?.workbench?.temporary ? (e.openBlock(), e.createElementBlock("p", Tn, [
              c[19] || (c[19] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(l.$t("这个账号还是{p0}，商品中心没有访问权限：要先在「账号与材料」里完成入驻并通过审核，才能上架", { p0: e.unref(w).workbench.identity })),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode(
              "p",
              zn,
              e.toDisplayString(l.$t("交出去之前应用会先打开政采云工作台确认登录状态。数字员工按确认过的内容填写，停在「提交审核」前截图给你，由你亲自点提交。")),
              1
              /* TEXT */
            ),
            M.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              Un,
              e.toDisplayString(l.$t("没有待上架的已确认商品")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(M.value, (u) => (e.openBlock(), e.createElementBlock("div", {
                key: u.id,
                class: "ss-actions"
              }, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(u.title),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  Mn,
                  "¥" + e.toDisplayString(u.price),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: !!k.value,
                  "data-test": `zc-prod-hand-${u.name}`,
                  onClick: (t) => i(u.id)
                }, [
                  c[20] || (c[20] = e.createElementVNode(
                    "i",
                    { class: "ri-robot-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(l.$t("交给数字员工上架")),
                    1
                    /* TEXT */
                  )
                ], 8, Ln),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: (t) => Q(u.id)
                }, e.toDisplayString(l.$t("看指令")), 9, An)
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            S.value ? (e.openBlock(), e.createElementBlock(
              "pre",
              In,
              e.toDisplayString(S.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "l-ledger",
          index: 3,
          title: a[3].title,
          hint: a[3].hint,
          runtime: O.value["l-ledger"],
          "is-current": W.value === "l-ledger"
        }, {
          default: e.withCtx(() => [
            E.value.length ? (e.openBlock(), e.createElementBlock("div", Kn, [
              e.createElementVNode("table", Wn, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(l.$t("商品")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Fn,
                      e.toDisplayString(l.$t("售价")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(l.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(l.$t("商品链接")),
                      1
                      /* TEXT */
                    ),
                    c[21] || (c[21] = e.createElementVNode(
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
                    e.renderList(E.value, (u) => (e.openBlock(), e.createElementBlock("tr", {
                      key: u.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(u.title),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        jn,
                        e.toDisplayString(e.unref(Z)(u.price)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", u.status === "listed" ? "ok" : u.status === "delisted" ? "bad" : "brand"])
                          },
                          e.toDisplayString(e.unref(ce)(u.status)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (t) => y[u.id] = t,
                          type: "text",
                          placeholder: l.$t("上架后粘贴商品链接"),
                          onChange: (t) => n(u.id, u.status, { productUrl: y[u.id] })
                        }, null, 40, Pn), [
                          [e.vModelText, y[u.id]]
                        ])
                      ]),
                      e.createElementVNode("td", Rn, [
                        u.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: (t) => o(u.conversationId)
                        }, e.toDisplayString(l.$t("执行过程")), 9, qn)) : e.createCommentVNode("v-if", !0),
                        u.status === "handed" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 1,
                          type: "button",
                          class: "ss-link",
                          onClick: (t) => n(u.id, "submitted")
                        }, e.toDisplayString(l.$t("我已提交审核")), 9, Qn)) : e.createCommentVNode("v-if", !0),
                        u.status === "submitted" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 2,
                          type: "button",
                          class: "ss-link",
                          onClick: (t) => n(u.id, "listed")
                        }, e.toDisplayString(l.$t("审核通过")), 9, Hn)) : e.createCommentVNode("v-if", !0),
                        u.status === "submitted" || u.status === "handed" ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 3 },
                          [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (t) => v[u.id] = t,
                              type: "text",
                              placeholder: l.$t("驳回原因")
                            }, null, 8, Jn), [
                              [e.vModelText, v[u.id]]
                            ]),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              disabled: !v[u.id],
                              onClick: (t) => n(u.id, "rejected", { rejectReason: v[u.id] })
                            }, e.toDisplayString(l.$t("被驳回")), 9, Yn)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0),
                        u.status === "listed" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 4,
                          type: "button",
                          class: "ss-link",
                          onClick: (t) => n(u.id, "delisted")
                        }, e.toDisplayString(l.$t("已下架")), 9, Zn)) : e.createCommentVNode("v-if", !0)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              On,
              e.toDisplayString(l.$t("交出去的商品在这里跟进审核结果")),
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
}), Xn = /* @__PURE__ */ x(Gn, [["__scopeId", "data-v-1de421eb"]]), xn = { class: "zc-rb" }, el = { class: "ss-actions" }, tl = ["disabled", "data-test"], nl = ["disabled"], ll = ["data-test"], ol = { class: "ss-muted" }, sl = {
  key: 0,
  class: "zc-rb__paste"
}, al = ["placeholder", "data-test"], il = ["disabled", "data-test"], rl = {
  key: 1,
  class: "ss-note danger"
}, cl = ["data-test"], dl = /* @__PURE__ */ e.defineComponent({
  __name: "ReadBack",
  props: {
    kind: {},
    handLabel: {},
    convTitle: {}
  },
  emits: ["done"],
  setup(_, { emit: h }) {
    const $ = _, w = h, k = ne.useRouter(), b = `totalclaw:zcy-agent-readback:${$.kind}`, D = e.ref((() => {
      try {
        return localStorage.getItem(b) || "";
      } catch {
        return "";
      }
    })()), g = e.ref(!1), U = e.ref(!1), M = e.ref(""), E = e.ref(""), B = e.ref("");
    async function f(v) {
      g.value = !0, E.value = "", B.value = "";
      try {
        await v();
      } catch (d) {
        E.value = A.errorMessage(d);
      } finally {
        g.value = !1;
      }
    }
    async function L() {
      await f(async () => {
        await se();
        const v = await N(`${$.kind}.patrolInstruction`);
        D.value = await te.handToDigitalEmployee($.convTitle, v);
        try {
          localStorage.setItem(b, D.value);
        } catch {
        }
      });
    }
    async function V(v) {
      await f(async () => {
        const d = await N(`${$.kind}.importReply`, { text: v });
        await H(), B.value = s.t("新增 {a} 条，更新 {b} 条", { a: d.added, b: d.updated }) + (d.dropped ? s.t("；{n} 条缺编号或状态认不出，没有收", { n: d.dropped }) : ""), M.value = "", U.value = !1, w("done");
      });
    }
    async function S() {
      let v = "";
      await f(async () => {
        v = await Ee(D.value);
      }), v && await V(v);
    }
    function y() {
      k.push(`/conversations/${D.value}`).catch(() => {
      });
    }
    return (v, d) => (e.openBlock(), e.createElementBlock("div", xn, [
      e.createElementVNode("div", el, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: g.value,
          "data-test": `zc-rb-hand-${_.kind}`,
          onClick: L
        }, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(g.value ? "ri-loader-4-line spin" : "ri-robot-2-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(_.handLabel),
            1
            /* TEXT */
          )
        ], 8, tl),
        D.value ? (e.openBlock(), e.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "ss-btn",
          disabled: g.value,
          onClick: S
        }, [
          d[3] || (d[3] = e.createElementVNode(
            "i",
            { class: "ri-download-cloud-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(v.$t("读回它的结果")),
            1
            /* TEXT */
          )
        ], 8, nl)) : e.createCommentVNode("v-if", !0),
        D.value ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 1,
            type: "button",
            class: "ss-link",
            onClick: y
          },
          e.toDisplayString(v.$t("查看执行过程")),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-link",
          "data-test": `zc-rb-paste-${_.kind}`,
          onClick: d[0] || (d[0] = (m) => U.value = !U.value)
        }, e.toDisplayString(v.$t("粘贴结果")), 9, ll),
        e.renderSlot(v.$slots, "default", {}, void 0, !0)
      ]),
      e.createElementVNode(
        "p",
        ol,
        e.toDisplayString(v.$t("数字员工只读页面、不做任何操作；读完会回复一段清单，点「读回它的结果」收进来。它停在登录或验证码上时，先去内置浏览器处理。")),
        1
        /* TEXT */
      ),
      U.value ? (e.openBlock(), e.createElementBlock("div", sl, [
        e.withDirectives(e.createElementVNode("textarea", {
          "onUpdate:modelValue": d[1] || (d[1] = (m) => M.value = m),
          rows: "5",
          placeholder: v.$t("把数字员工回复里的 JSON 清单粘贴到这里"),
          "data-test": `zc-rb-text-${_.kind}`
        }, null, 8, al), [
          [e.vModelText, M.value]
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn sm primary",
          disabled: g.value || !M.value.trim(),
          "data-test": `zc-rb-import-${_.kind}`,
          onClick: d[2] || (d[2] = (m) => V(M.value))
        }, e.toDisplayString(v.$t("收进来")), 9, il)
      ])) : e.createCommentVNode("v-if", !0),
      E.value ? (e.openBlock(), e.createElementBlock("p", rl, [
        d[4] || (d[4] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
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
      B.value ? (e.openBlock(), e.createElementBlock("p", {
        key: 2,
        class: "ss-note ok",
        "data-test": `zc-rb-note-${_.kind}`
      }, [
        d[5] || (d[5] = e.createElementVNode(
          "i",
          { class: "ri-check-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(B.value),
          1
          /* TEXT */
        )
      ], 8, cl)) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), ge = /* @__PURE__ */ x(dl, [["__scopeId", "data-v-94c97ba3"]]), ul = { class: "ss-module" }, ml = { class: "ss-steps" }, pl = ["disabled"], vl = { class: "ss-muted" }, yl = {
  key: 0,
  class: "ss-empty"
}, kl = ["data-test"], gl = { class: "zc-inq__head" }, hl = ["onUpdate:modelValue", "placeholder"], Vl = ["onUpdate:modelValue", "placeholder"], El = { class: "ss-muted" }, Nl = ["onClick"], $l = { class: "ss-table-wrap" }, bl = { class: "ss-table" }, fl = { class: "num" }, _l = { class: "num" }, Dl = { class: "num" }, Sl = { class: "num" }, wl = ["onUpdate:modelValue"], Bl = ["onUpdate:modelValue"], Cl = { class: "num" }, Tl = ["onUpdate:modelValue"], zl = ["onUpdate:modelValue"], Ul = { class: "num" }, Ml = ["onUpdate:modelValue"], Ll = { class: "num" }, Al = ["onUpdate:modelValue", "data-test"], Il = { class: "num" }, Ol = ["data-test"], Kl = ["onClick"], Wl = { class: "ss-actions" }, Fl = ["onClick"], jl = { class: "ss-field inline" }, Pl = ["onUpdate:modelValue"], Rl = { class: "ss-field inline" }, ql = ["onUpdate:modelValue"], Ql = { class: "ss-field inline" }, Hl = ["onUpdate:modelValue"], Jl = {
  key: 0,
  class: "zc-total",
  "data-test": "zc-inq-total"
}, Yl = { class: "ss-field" }, Zl = ["onUpdate:modelValue"], Gl = { class: "ss-actions" }, Xl = ["disabled", "data-test", "onClick"], xl = ["disabled", "data-test", "onClick"], eo = ["onClick"], to = {
  key: 0,
  class: "ss-empty"
}, no = { class: "ss-muted" }, lo = ["disabled", "onClick"], oo = ["data-test", "onClick"], so = ["onClick"], ao = {
  key: 1,
  class: "zc-pre",
  "data-test": "zc-quote-instruction"
}, io = {
  key: 0,
  class: "ss-empty"
}, ro = {
  key: 1,
  class: "ss-table-wrap"
}, co = { class: "ss-table" }, uo = { class: "num" }, mo = { class: "num" }, po = { class: "zc-ops" }, vo = ["onClick"], yo = ["onClick"], ko = ["onClick"], go = ["onClick"], ho = ["onClick"], Vo = /* @__PURE__ */ e.defineComponent({
  __name: "QuoteTab",
  setup(_) {
    const h = le.useNotificationStore(), $ = ne.useRouter(), w = J, k = e.ref(""), b = e.ref({}), D = e.ref(!1), g = e.ref(""), U = e.computed(() => w.value?.inquiries || []), M = e.computed(() => U.value.filter((i) => i.status === "new" || i.status === "priced")), E = e.computed(() => U.value.filter((i) => i.status === "confirmed")), B = e.computed(() => U.value.filter((i) => ["handed", "submitted", "won", "lost", "skipped"].includes(i.status))), f = e.reactive({}), L = (i) => {
      const n = new Date(i);
      if (!i || !Number.isFinite(n.getTime())) return "";
      const o = (a) => String(a).padStart(2, "0");
      return `${n.getFullYear()}-${o(n.getMonth() + 1)}-${o(n.getDate())}T${o(n.getHours())}:${o(n.getMinutes())}`;
    }, V = (i) => ({ title: i.title, no: i.no, note: i.note, marginPct: Math.round(i.margin * 1e4) / 100, budget: i.budget, deadline: L(i.deadline), items: i.items.map((n) => ({ ...n })) }), S = {};
    e.watch(U, (i) => {
      for (const n of i) S[n.id] !== n.updatedAt && (S[n.id] = n.updatedAt, f[n.id] = V(n));
    }, { immediate: !0 });
    const y = (i) => {
      const n = w.value?.alerts.find((o) => o.kind === "inquiry_deadline" && o.refId === i);
      return n ? n.level === "error" ? "bad" : "warn" : "";
    };
    async function v(i, n) {
      k.value = i, b.value = { ...b.value, [i]: "" };
      try {
        return await n(), await H(), !0;
      } catch (o) {
        return b.value = { ...b.value, [i]: A.errorMessage(o) }, A.scrollToStep(i), !1;
      } finally {
        k.value = "";
      }
    }
    async function d() {
      await v("q-read", () => N("inquiry.save", { patch: { title: s.t("新询价单"), items: [{ name: s.t("货物"), spec: "", qty: 1, unit: "", ceiling: 0, cost: 0 }] } })), D.value = !0;
    }
    async function m(i) {
      const n = f[i];
      await v("q-price", async () => {
        await N("inquiry.save", { id: i, patch: { title: n.title, no: n.no, note: n.note, margin: (Number(n.marginPct) || 0) / 100, budget: n.budget, deadline: n.deadline ? new Date(n.deadline).toISOString() : "", items: n.items } }), await N("inquiry.price", { id: i });
      });
    }
    async function C(i, n) {
      await v(n === "confirmed" || n === "priced" ? "q-price" : "q-result", () => N("inquiry.status", { id: i, status: n }));
    }
    async function z(i) {
      await v("q-price", () => N("inquiry.status", { id: i, status: "skipped" }));
    }
    async function I(i) {
      window.confirm(s.t("删除这张询价单？")) && await v("q-price", () => N("inquiry.remove", { id: i }));
    }
    async function Y(i) {
      await v("q-hand", async () => {
        g.value = await N("inquiry.instruction", { id: i });
      });
    }
    async function G(i) {
      await v("q-hand", async () => {
        await se();
        const o = await N("inquiry.instruction", { id: i.id }), a = await te.handToDigitalEmployee(s.t("政采云报价：{p0}", { p0: (i.title || i.no).slice(0, 20) }), o);
        await N("inquiry.status", { id: i.id, status: "handed", conversationId: a }), g.value = "";
      }) && h.success(s.t("已交给数字员工，它会停在「提交报价」前等你确认"));
    }
    function q(i) {
      $.push(`/conversations/${i}`).catch((n) => h.error(A.errorMessage(n)));
    }
    const j = [
      { key: "q-read", title: s.t("读回询价单"), hint: s.t("数字员工只读待报价的在线询价 / 反向竞价") },
      { key: "q-price", title: s.t("填成本、算报价并确认"), hint: s.t("报价由规则算，限价低于成本或超预算会拦下") },
      { key: "q-hand", title: s.t("数字员工填报价"), hint: s.t("逐项照抄单价，停在提交报价前") },
      { key: "q-result", title: s.t("登记结果"), hint: s.t("已提交、成交、未成交") }
    ];
    function K(i, n, o) {
      return k.value === i ? { state: "running" } : b.value[i] ? { state: "failed", error: b.value[i] } : n ? { state: "done", summary: o } : { state: "todo" };
    }
    const P = e.computed(() => ({
      "q-read": K("q-read", D.value || U.value.length > 0, s.t("{n} 张", { n: U.value.length })),
      "q-price": K("q-price", U.value.length > 0 && M.value.length === 0),
      "q-hand": K("q-hand", B.value.some((i) => i.status !== "skipped") && E.value.length === 0),
      "q-result": K("q-result", B.value.length > 0 && !B.value.some((i) => i.status === "handed" || i.status === "submitted"))
    })), R = e.computed(() => j.find((i) => P.value[i.key].state !== "done")?.key || "q-result");
    function Q(i) {
      A.scrollToStep(i);
    }
    return (i, n) => (e.openBlock(), e.createElementBlock("div", ul, [
      e.createVNode(oe, {
        title: i.$t("询价报价"),
        metas: j,
        runtime: P.value,
        "current-key": R.value,
        onJump: Q
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", ml, [
        e.createVNode(F, {
          "step-key": "q-read",
          index: 0,
          title: j[0].title,
          hint: j[0].hint,
          runtime: P.value["q-read"],
          "is-current": R.value === "q-read"
        }, {
          default: e.withCtx(() => [
            e.createVNode(ge, {
              kind: "inquiry",
              "hand-label": i.$t("让数字员工读取待报价的询价单"),
              "conv-title": i.$t("政采云：读取待报价询价单"),
              onDone: n[0] || (n[0] = (o) => D.value = !0)
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn",
                  disabled: !!k.value,
                  "data-test": "zc-inquiry-add",
                  onClick: d
                }, [
                  n[1] || (n[1] = e.createElementVNode(
                    "i",
                    { class: "ri-add-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(i.$t("手动添加一张")),
                    1
                    /* TEXT */
                  )
                ], 8, pl)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["hand-label", "conv-title"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "q-price",
          index: 1,
          title: j[1].title,
          hint: j[1].hint,
          runtime: P.value["q-price"],
          "is-current": R.value === "q-price"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode(
              "p",
              vl,
              e.toDisplayString(i.$t("报价 = 你的含税到货成本 ×（1 + 目标毛利率），进到分；超过单价限价就压到限价。限价低于成本、合计超预算的不让确认。在线询价只有一轮报价，最低价成交。")),
              1
              /* TEXT */
            ),
            M.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              yl,
              e.toDisplayString(i.$t("读回或添加询价单后在这里填成本")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(M.value, (o) => (e.openBlock(), e.createElementBlock("div", {
                key: o.id,
                class: e.normalizeClass(["zc-inq", { bad: o.issues.some((a) => a.level === "error") }]),
                "data-test": `zc-inq-${o.no || o.title}`
              }, [
                e.createElementVNode("div", gl, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", o.status === "confirmed" ? "ok" : o.status === "priced" ? "brand" : ""])
                    },
                    e.toDisplayString(e.unref(de)(o.status)),
                    3
                    /* TEXT, CLASS */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (a) => f[o.id].title = a,
                    type: "text",
                    class: "zc-title",
                    placeholder: i.$t("项目名称")
                  }, null, 8, hl), [
                    [e.vModelText, f[o.id].title]
                  ]),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (a) => f[o.id].no = a,
                    type: "text",
                    class: "zc-no",
                    placeholder: i.$t("询价单号")
                  }, null, 8, Vl), [
                    [e.vModelText, f[o.id].no]
                  ]),
                  e.createElementVNode(
                    "span",
                    El,
                    e.toDisplayString(o.buyer),
                    1
                    /* TEXT */
                  ),
                  n[2] || (n[2] = e.createElementVNode(
                    "span",
                    { class: "zc-grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", y(o.id)])
                    },
                    e.toDisplayString(i.$t("截止 {p0}", { p0: e.unref(ke)(o.deadline) })),
                    3
                    /* TEXT, CLASS */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (a) => z(o.id)
                  }, e.toDisplayString(i.$t("不参与")), 9, Nl)
                ]),
                e.createElementVNode("div", $l, [
                  e.createElementVNode("table", bl, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(i.$t("名称")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(i.$t("规格要求")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          fl,
                          e.toDisplayString(i.$t("数量")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(i.$t("单位")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          _l,
                          e.toDisplayString(i.$t("单价限价")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Dl,
                          e.toDisplayString(i.$t("我方成本（含税到货）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Sl,
                          e.toDisplayString(i.$t("报价")),
                          1
                          /* TEXT */
                        ),
                        n[3] || (n[3] = e.createElementVNode(
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
                        e.renderList(f[o.id].items, (a, T) => (e.openBlock(), e.createElementBlock("tr", { key: T }, [
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (O) => a.name = O,
                              type: "text"
                            }, null, 8, wl), [
                              [e.vModelText, a.name]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (O) => a.spec = O,
                              type: "text"
                            }, null, 8, Bl), [
                              [e.vModelText, a.spec]
                            ])
                          ]),
                          e.createElementVNode("td", Cl, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (O) => a.qty = O,
                              type: "number",
                              min: "0",
                              class: "zc-num"
                            }, null, 8, Tl), [
                              [
                                e.vModelText,
                                a.qty,
                                void 0,
                                { number: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (O) => a.unit = O,
                              type: "text",
                              class: "zc-unit"
                            }, null, 8, zl), [
                              [e.vModelText, a.unit]
                            ])
                          ]),
                          e.createElementVNode("td", Ul, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (O) => a.ceiling = O,
                              type: "number",
                              min: "0",
                              step: "0.01",
                              class: "zc-num"
                            }, null, 8, Ml), [
                              [
                                e.vModelText,
                                a.ceiling,
                                void 0,
                                { number: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", Ll, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (O) => a.cost = O,
                              type: "number",
                              min: "0",
                              step: "0.01",
                              class: "zc-num",
                              "data-test": `zc-cost-${T}`
                            }, null, 8, Al), [
                              [
                                e.vModelText,
                                a.cost,
                                void 0,
                                { number: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", Il, [
                            e.createElementVNode("b", {
                              "data-test": `zc-quote-${T}`
                            }, e.toDisplayString(o.items[T]?.quote ? e.unref(Z)(o.items[T].quote) : "—"), 9, Ol)
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (O) => f[o.id].items.splice(T, 1)
                            }, e.toDisplayString(i.$t("移除")), 9, Kl)
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ]),
                e.createElementVNode("div", Wl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm",
                    onClick: (a) => f[o.id].items.push({ name: "", spec: "", qty: 1, unit: "", ceiling: 0, cost: 0, quote: 0 })
                  }, [
                    n[4] || (n[4] = e.createElementVNode(
                      "i",
                      { class: "ri-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(i.$t("加一行")),
                      1
                      /* TEXT */
                    )
                  ], 8, Fl),
                  e.createElementVNode("label", jl, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(i.$t("目标毛利率 %")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (a) => f[o.id].marginPct = a,
                      type: "number",
                      min: "0",
                      step: "0.5",
                      class: "zc-num"
                    }, null, 8, Pl), [
                      [
                        e.vModelText,
                        f[o.id].marginPct,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("label", Rl, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(i.$t("预算 / 总限价")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (a) => f[o.id].budget = a,
                      type: "number",
                      min: "0",
                      class: "zc-num"
                    }, null, 8, ql), [
                      [
                        e.vModelText,
                        f[o.id].budget,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("label", Ql, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(i.$t("截止时间")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (a) => f[o.id].deadline = a,
                      type: "datetime-local"
                    }, null, 8, Hl), [
                      [e.vModelText, f[o.id].deadline]
                    ])
                  ]),
                  n[5] || (n[5] = e.createElementVNode(
                    "span",
                    { class: "zc-grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  o.total ? (e.openBlock(), e.createElementBlock(
                    "b",
                    Jl,
                    e.toDisplayString(i.$t("合计 {p0} 元", { p0: e.unref(Z)(o.total) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode("label", Yl, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(i.$t("响应说明（可选，会原样填到报价页）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (a) => f[o.id].note = a,
                    type: "text"
                  }, null, 8, Zl), [
                    [e.vModelText, f[o.id].note]
                  ])
                ]),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(o.issues, (a, T) => (e.openBlock(), e.createElementBlock(
                    "p",
                    {
                      key: T,
                      class: e.normalizeClass(["ss-note", a.level === "error" ? "danger" : "warn"])
                    },
                    [
                      n[6] || (n[6] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(a.message),
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
                e.createElementVNode("div", Gl, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!k.value,
                    "data-test": `zc-price-${o.no || o.title}`,
                    onClick: (a) => m(o.id)
                  }, [
                    n[7] || (n[7] = e.createElementVNode(
                      "i",
                      { class: "ri-calculator-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(i.$t("保存并算报价")),
                      1
                      /* TEXT */
                    )
                  ], 8, Xl),
                  o.status === "priced" ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn",
                    disabled: !!k.value || o.issues.some((a) => a.level === "error"),
                    "data-test": `zc-inq-confirm-${o.no || o.title}`,
                    onClick: (a) => C(o.id, "confirmed")
                  }, [
                    n[8] || (n[8] = e.createElementVNode(
                      "i",
                      { class: "ri-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(i.$t("确认报价")),
                      1
                      /* TEXT */
                    )
                  ], 8, xl)) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (a) => I(o.id)
                  }, e.toDisplayString(i.$t("删除")), 9, eo)
                ])
              ], 10, kl))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "q-hand",
          index: 2,
          title: j[2].title,
          hint: j[2].hint,
          runtime: P.value["q-hand"],
          "is-current": R.value === "q-hand"
        }, {
          default: e.withCtx(() => [
            E.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              to,
              e.toDisplayString(i.$t("没有已确认的报价")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(E.value, (o) => (e.openBlock(), e.createElementBlock("div", {
                key: o.id,
                class: "ss-actions"
              }, [
                e.createElementVNode(
                  "b",
                  null,
                  e.toDisplayString(o.title || o.no),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  no,
                  e.toDisplayString(i.$t("合计 {p0} 元", { p0: e.unref(Z)(o.total) })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm primary",
                  disabled: !!k.value,
                  onClick: (a) => G(o)
                }, [
                  n[9] || (n[9] = e.createElementVNode(
                    "i",
                    { class: "ri-robot-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(i.$t("交给数字员工填报价（停在提交前）")),
                    1
                    /* TEXT */
                  )
                ], 8, lo),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  "data-test": `zc-inq-preview-${o.no || o.title}`,
                  onClick: (a) => Y(o.id)
                }, e.toDisplayString(i.$t("看指令")), 9, oo),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-link",
                  onClick: (a) => C(o.id, "priced")
                }, e.toDisplayString(i.$t("撤回确认")), 9, so)
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            g.value ? (e.openBlock(), e.createElementBlock(
              "pre",
              ao,
              e.toDisplayString(g.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "q-result",
          index: 3,
          title: j[3].title,
          hint: j[3].hint,
          runtime: P.value["q-result"],
          "is-current": R.value === "q-result"
        }, {
          default: e.withCtx(() => [
            B.value.length ? (e.openBlock(), e.createElementBlock("div", ro, [
              e.createElementVNode("table", co, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("询价单")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(i.$t("采购单位")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      uo,
                      e.toDisplayString(i.$t("报价合计")),
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
                    n[10] || (n[10] = e.createElementVNode(
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
                    e.renderList(B.value, (o) => (e.openBlock(), e.createElementBlock("tr", {
                      key: o.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.title || o.no),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(o.buyer),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        mo,
                        e.toDisplayString(o.total ? e.unref(Z)(o.total) : "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", o.status === "won" ? "ok" : o.status === "lost" ? "bad" : "brand"])
                          },
                          e.toDisplayString(e.unref(de)(o.status)),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      e.createElementVNode("td", po, [
                        o.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                          key: 0,
                          type: "button",
                          class: "ss-link",
                          onClick: (a) => q(o.conversationId)
                        }, e.toDisplayString(i.$t("执行过程")), 9, vo)) : e.createCommentVNode("v-if", !0),
                        o.status === "handed" ? (e.openBlock(), e.createElementBlock("button", {
                          key: 1,
                          type: "button",
                          class: "ss-link",
                          onClick: (a) => C(o.id, "submitted")
                        }, e.toDisplayString(i.$t("我已提交报价")), 9, yo)) : e.createCommentVNode("v-if", !0),
                        o.status === "submitted" ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 2 },
                          [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (a) => C(o.id, "won")
                            }, e.toDisplayString(i.$t("成交")), 9, ko),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (a) => C(o.id, "lost")
                            }, e.toDisplayString(i.$t("未成交")), 9, go)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (a) => I(o.id)
                        }, e.toDisplayString(i.$t("删除")), 9, ho)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              io,
              e.toDisplayString(i.$t("交出去的报价在这里登记结果")),
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
}), Eo = /* @__PURE__ */ x(Vo, [["__scopeId", "data-v-e3bac340"]]), No = { class: "ss-module" }, $o = { class: "ss-steps" }, bo = ["disabled"], fo = {
  key: 0,
  class: "ss-note ok"
}, _o = { class: "ss-muted" }, Do = {
  key: 0,
  class: "ss-note ok"
}, So = ["data-test"], wo = { class: "zc-order__head" }, Bo = { class: "ss-muted" }, Co = { class: "ss-muted" }, To = {
  key: 0,
  class: "ss-actions"
}, zo = ["disabled", "onClick"], Uo = ["onClick"], Mo = {
  key: 1,
  class: "ss-actions"
}, Lo = ["onUpdate:modelValue", "placeholder"], Ao = ["onUpdate:modelValue", "placeholder"], Io = ["disabled", "onClick"], Oo = ["onClick"], Ko = ["onClick"], Wo = { class: "ss-muted" }, Fo = {
  key: 0,
  class: "ss-empty"
}, jo = { class: "ss-table-wrap" }, Po = { class: "ss-table" }, Ro = { class: "num" }, qo = ["checked", "data-test", "onChange"], Qo = ["value", "placeholder", "onChange"], Ho = { class: "num" }, Jo = { class: "ss-chip" }, Yo = { class: "ss-actions" }, Zo = ["disabled"], Go = {
  key: 2,
  class: "ss-note ok",
  "data-test": "zc-invoice-note"
}, Xo = {
  key: 0,
  class: "ss-empty"
}, xo = {
  key: 1,
  class: "ss-table-wrap zc-scroll"
}, es = {
  class: "ss-table",
  "data-test": "zc-orders"
}, ts = { class: "num" }, ns = { class: "num" }, ls = ["value", "onChange"], os = ["value"], ss = { class: "zc-ops" }, as = {
  key: 0,
  class: "ss-chip ok"
}, is = ["onClick"], rs = /* @__PURE__ */ e.defineComponent({
  __name: "OrdersTab",
  setup(_) {
    const h = ["to_accept", "to_ship", "shipped", "to_settle", "to_invoice", "done", "closed"], $ = le.useNotificationStore(), w = ne.useRouter(), k = J, b = e.ref(""), D = e.ref({}), g = e.ref(!1), U = e.ref(""), M = e.ref(""), E = e.ref([]), B = e.computed(() => k.value?.orders || []), f = e.computed(() => k.value?.settings.regions.find((n) => n.id === k.value?.settings.regionId)), L = e.computed(() => B.value.filter((n) => n.status === "to_accept" || n.status === "to_ship")), V = e.computed(() => B.value.filter((n) => !n.invoiceBatchId && (n.status === "to_invoice" || n.status === "to_settle" || n.status === "done"))), S = e.reactive({});
    e.watch(B, (n) => {
      for (const o of n) S[o.id] || (S[o.id] = { company: o.logisticsCompany, no: o.logisticsNo });
      E.value = E.value.filter((o) => V.value.some((a) => a.id === o));
    }, { immediate: !0 });
    const y = (n) => k.value?.alerts.find((o) => (o.kind === "order_accept" || o.kind === "order_ship") && o.refId === n);
    function v(n) {
      const o = E.value.indexOf(n);
      o >= 0 ? E.value.splice(o, 1) : E.value.push(n);
    }
    async function d(n, o) {
      b.value = n, D.value = { ...D.value, [n]: "" };
      try {
        return await o(), await H(), !0;
      } catch (a) {
        return D.value = { ...D.value, [n]: A.errorMessage(a) }, A.scrollToStep(n), !1;
      } finally {
        b.value = "";
      }
    }
    async function m() {
      const n = await N("files.pick", { kind: "excel" });
      n.length && await d("o-read", async () => {
        const o = await N("orders.importFile", { path: n[0] });
        U.value = s.t("新增 {a} 条，更新 {b} 条", { a: o.added, b: o.updated }) + (o.dropped ? s.t("；{n} 条缺编号或状态认不出，没有收", { n: o.dropped }) : ""), g.value = !0;
      });
    }
    async function C(n, o) {
      await d("o-invoice", () => N("order.update", { id: n.id, patch: o }));
    }
    async function z(n, o) {
      await d("o-todo", () => N("order.update", { id: n.id, patch: { status: o } }));
    }
    async function I(n, o) {
      await d("o-todo", async () => {
        await se(), o === "ship" && await N("order.update", { id: n.id, patch: { logisticsCompany: S[n.id].company, logisticsNo: S[n.id].no } });
        const T = await N(o === "accept" ? "order.acceptInstruction" : "order.shipInstruction", { id: n.id }), O = await te.handToDigitalEmployee(o === "accept" ? s.t("政采云接单：{p0}", { p0: n.orderNo }) : s.t("政采云发货：{p0}", { p0: n.orderNo }), T);
        await N("order.update", { id: n.id, patch: { conversationId: O } });
      }) && $.success(o === "accept" ? s.t("已交给数字员工，它会停在「确认接单」前等你确认") : s.t("已交给数字员工，它会停在「确认发货」前等你确认"));
    }
    async function Y() {
      M.value = "", await d("o-invoice", async () => {
        const n = await N("orders.toInvoice", { ids: E.value });
        M.value = s.t("{n} 张订单已转入发票智能体，生成了一批待校验的开票行", { n: n.count }), E.value = [];
      });
    }
    async function G(n) {
      window.confirm(s.t("从本机台账删除订单 {p0}？（不影响政采云上的订单）", { p0: n.orderNo })) && await d("o-all", () => N("order.remove", { id: n.id }));
    }
    function q() {
      w.push("/workbenches/invoice-agent").catch((n) => $.error(A.errorMessage(n)));
    }
    function j(n) {
      w.push(`/conversations/${n}`).catch((o) => $.error(A.errorMessage(o)));
    }
    const K = [
      { key: "o-read", title: s.t("读回订单"), hint: s.t("数字员工只读订单列表，或导入订单表") },
      { key: "o-todo", title: s.t("接单与发货"), hint: s.t("超时预警；接单、发货停在确认前") },
      { key: "o-invoice", title: s.t("转开票"), hint: s.t("待开票订单转入发票智能体") },
      { key: "o-all", title: s.t("全部订单"), hint: s.t("本机台账，状态以政采云为准") }
    ];
    function P(n, o, a) {
      return b.value === n ? { state: "running" } : D.value[n] ? { state: "failed", error: D.value[n] } : o ? { state: "done", summary: a } : { state: "todo" };
    }
    const R = e.computed(() => ({
      "o-read": P("o-read", g.value || B.value.length > 0, s.t("{n} 张订单", { n: B.value.length })),
      "o-todo": P("o-todo", B.value.length > 0 && L.value.length === 0),
      "o-invoice": P("o-invoice", B.value.length > 0 && V.value.length === 0),
      "o-all": P("o-all", B.value.length > 0)
    })), Q = e.computed(() => K.find((n) => R.value[n.key].state !== "done")?.key || "o-all");
    function i(n) {
      A.scrollToStep(n);
    }
    return (n, o) => (e.openBlock(), e.createElementBlock("div", No, [
      e.createVNode(oe, {
        title: n.$t("订单履约"),
        metas: K,
        runtime: R.value,
        "current-key": Q.value,
        onJump: i
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", $o, [
        e.createVNode(F, {
          "step-key": "o-read",
          index: 0,
          title: K[0].title,
          hint: K[0].hint,
          runtime: R.value["o-read"],
          "is-current": Q.value === "o-read"
        }, {
          default: e.withCtx(() => [
            e.createVNode(ge, {
              kind: "orders",
              "hand-label": n.$t("让数字员工读取订单列表"),
              "conv-title": n.$t("政采云：读取订单"),
              onDone: o[0] || (o[0] = (a) => g.value = !0)
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn",
                  disabled: !!b.value,
                  onClick: m
                }, [
                  o[1] || (o[1] = e.createElementVNode(
                    "i",
                    { class: "ri-file-excel-2-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(n.$t("导入订单表")),
                    1
                    /* TEXT */
                  )
                ], 8, bo)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["hand-label", "conv-title"]),
            U.value ? (e.openBlock(), e.createElementBlock("p", fo, [
              o[2] || (o[2] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(U.value),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "o-todo",
          index: 1,
          title: K[1].title,
          hint: K[1].hint,
          runtime: R.value["o-todo"],
          "is-current": Q.value === "o-todo"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode(
              "p",
              _o,
              e.toDisplayString(n.$t("接单时限按当前区划规则（{p0} 小时）计算，时间从读回的下单时间算起；确认接单、确认发货由你亲自点，数字员工不改价、不拒单。", { p0: f.value?.acceptHours ?? 24 })),
              1
              /* TEXT */
            ),
            L.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Do, [
              o[3] || (o[3] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("没有待接单、待发货的订单")),
                1
                /* TEXT */
              )
            ])),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(L.value, (a) => (e.openBlock(), e.createElementBlock("div", {
                key: a.id,
                class: "zc-order",
                "data-test": `zc-order-${a.orderNo}`
              }, [
                e.createElementVNode("div", wo, [
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", y(a.id)?.level === "error" ? "bad" : "warn"])
                    },
                    e.toDisplayString(e.unref(ae)(a.status)),
                    3
                    /* TEXT, CLASS */
                  ),
                  e.createElementVNode(
                    "b",
                    null,
                    e.toDisplayString(a.orderNo),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(a.buyer),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    Bo,
                    e.toDisplayString(e.unref(Z)(a.amount)),
                    1
                    /* TEXT */
                  ),
                  o[4] || (o[4] = e.createElementVNode(
                    "span",
                    { class: "zc-grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  y(a.id) ? (e.openBlock(), e.createElementBlock(
                    "span",
                    {
                      key: 0,
                      class: e.normalizeClass(["ss-chip", y(a.id).level === "error" ? "bad" : "warn"]),
                      "data-test": "zc-order-alert"
                    },
                    e.toDisplayString(y(a.id).text),
                    3
                    /* TEXT, CLASS */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode(
                  "p",
                  Co,
                  e.toDisplayString(a.items),
                  1
                  /* TEXT */
                ),
                a.status === "to_accept" ? (e.openBlock(), e.createElementBlock("div", To, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm primary",
                    disabled: !!b.value,
                    onClick: (T) => I(a, "accept")
                  }, [
                    o[5] || (o[5] = e.createElementVNode(
                      "i",
                      { class: "ri-robot-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("交给数字员工核对并准备接单")),
                      1
                      /* TEXT */
                    )
                  ], 8, zo),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (T) => z(a, "to_ship")
                  }, e.toDisplayString(n.$t("我已接单")), 9, Uo)
                ])) : (e.openBlock(), e.createElementBlock("div", Mo, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (T) => S[a.id].company = T,
                    type: "text",
                    placeholder: n.$t("物流公司")
                  }, null, 8, Lo), [
                    [e.vModelText, S[a.id].company]
                  ]),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (T) => S[a.id].no = T,
                    type: "text",
                    placeholder: n.$t("物流单号")
                  }, null, 8, Ao), [
                    [e.vModelText, S[a.id].no]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm primary",
                    disabled: !!b.value || !S[a.id].company || !S[a.id].no,
                    onClick: (T) => I(a, "ship")
                  }, [
                    o[6] || (o[6] = e.createElementVNode(
                      "i",
                      { class: "ri-robot-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("交给数字员工回填物流")),
                      1
                      /* TEXT */
                    )
                  ], 8, Io),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (T) => z(a, "shipped")
                  }, e.toDisplayString(n.$t("我已发货")), 9, Oo)
                ])),
                a.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                  key: 2,
                  type: "button",
                  class: "ss-link zc-start",
                  onClick: (T) => j(a.conversationId)
                }, e.toDisplayString(n.$t("查看执行过程")), 9, Ko)) : e.createCommentVNode("v-if", !0)
              ], 8, So))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "o-invoice",
          index: 2,
          title: K[2].title,
          hint: K[2].hint,
          runtime: R.value["o-invoice"],
          "is-current": Q.value === "o-invoice"
        }, {
          default: e.withCtx(() => [
            e.createElementVNode(
              "p",
              Wo,
              e.toDisplayString(n.$t("转入后在发票智能体里校验、组票、开具。订单里的商品摘要不是规范的开票项目，请在发票智能体的校验步骤里改成正式的项目名称。")),
              1
              /* TEXT */
            ),
            V.value.length ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 1 },
              [
                e.createElementVNode("div", jo, [
                  e.createElementVNode("table", Po, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        o[7] || (o[7] = e.createElementVNode(
                          "th",
                          null,
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(n.$t("订单编号")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(n.$t("采购单位")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(n.$t("采购单位税号")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Ro,
                          e.toDisplayString(n.$t("金额")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(n.$t("状态")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(V.value, (a) => (e.openBlock(), e.createElementBlock("tr", {
                          key: a.id
                        }, [
                          e.createElementVNode("td", null, [
                            e.createElementVNode("input", {
                              type: "checkbox",
                              checked: E.value.includes(a.id),
                              "data-test": `zc-inv-pick-${a.orderNo}`,
                              onChange: (T) => v(a.id)
                            }, null, 40, qo)
                          ]),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(a.orderNo),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(a.buyer),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("input", {
                              value: a.buyerTaxNo,
                              type: "text",
                              placeholder: n.$t("有就填，开票时会校验"),
                              onChange: (T) => C(a, { buyerTaxNo: T.target.value })
                            }, null, 40, Qo)
                          ]),
                          e.createElementVNode(
                            "td",
                            Ho,
                            e.toDisplayString(e.unref(Z)(a.amount)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.createElementVNode(
                              "span",
                              Jo,
                              e.toDisplayString(e.unref(ae)(a.status)),
                              1
                              /* TEXT */
                            )
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ]),
                e.createElementVNode("div", Yo, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!b.value || !E.value.length,
                    "data-test": "zc-to-invoice",
                    onClick: Y
                  }, [
                    o[8] || (o[8] = e.createElementVNode(
                      "i",
                      { class: "ri-bill-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(n.$t("转入发票智能体（{n} 张）", { n: E.value.length })),
                      1
                      /* TEXT */
                    )
                  ], 8, Zo)
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Fo,
              e.toDisplayString(n.$t("没有待开票的订单")),
              1
              /* TEXT */
            )),
            M.value ? (e.openBlock(), e.createElementBlock("p", Go, [
              o[9] || (o[9] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(M.value),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-btn sm",
                  onClick: q
                },
                e.toDisplayString(n.$t("去发票智能体")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime", "is-current"]),
        e.createVNode(F, {
          "step-key": "o-all",
          index: 3,
          title: K[3].title,
          hint: K[3].hint,
          runtime: R.value["o-all"],
          "is-current": Q.value === "o-all"
        }, {
          default: e.withCtx(() => [
            B.value.length ? (e.openBlock(), e.createElementBlock("div", xo, [
              e.createElementVNode("table", es, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("订单编号")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("采购单位")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      ts,
                      e.toDisplayString(n.$t("金额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("下单时间")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(n.$t("物流")),
                      1
                      /* TEXT */
                    ),
                    o[10] || (o[10] = e.createElementVNode(
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
                    e.renderList(B.value, (a) => (e.openBlock(), e.createElementBlock("tr", {
                      key: a.id
                    }, [
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(a.orderNo),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(a.buyer),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        ns,
                        e.toDisplayString(e.unref(Z)(a.amount)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(ke)(a.createdAt)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("select", {
                          value: a.status,
                          onChange: (T) => z(a, T.target.value)
                        }, [
                          (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(h, (T) => e.createElementVNode("option", {
                              key: T,
                              value: T
                            }, e.toDisplayString(e.unref(ae)(T)), 9, os)),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ], 40, ls)
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(a.logisticsCompany) + " " + e.toDisplayString(a.logisticsNo),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", ss, [
                        a.invoiceBatchId ? (e.openBlock(), e.createElementBlock(
                          "span",
                          as,
                          e.toDisplayString(n.$t("已转开票")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (T) => G(a)
                        }, e.toDisplayString(n.$t("删除")), 9, is)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              Xo,
              e.toDisplayString(n.$t("还没有订单")),
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
}), cs = /* @__PURE__ */ x(rs, [["__scopeId", "data-v-4ff3a935"]]), ds = { class: "ss-module zc-settings" }, us = { class: "zc-panel" }, ms = { class: "ss-muted" }, ps = { class: "zc-region__head" }, vs = ["value"], ys = ["onUpdate:modelValue"], ks = ["onClick"], gs = { class: "ss-grid tight" }, hs = { class: "ss-field" }, Vs = ["onUpdate:modelValue"], Es = { class: "ss-field" }, Ns = ["onUpdate:modelValue"], $s = { class: "ss-field" }, bs = ["onUpdate:modelValue"], fs = { class: "ss-field" }, _s = ["onUpdate:modelValue"], Ds = { value: "avg" }, Ss = { value: "min" }, ws = { class: "ss-field" }, Bs = ["value", "onChange"], Cs = { class: "ss-field" }, Ts = ["onUpdate:modelValue"], zs = { class: "ss-field" }, Us = ["onUpdate:modelValue"], Ms = { class: "ss-field" }, Ls = ["onUpdate:modelValue"], As = { class: "ss-field" }, Is = ["value", "onChange"], Os = { class: "ss-field" }, Ks = ["onUpdate:modelValue"], Ws = { class: "ss-actions" }, Fs = { class: "zc-panel" }, js = { class: "ss-grid" }, Ps = { class: "ss-field" }, Rs = { class: "ss-field" }, qs = ["value"], Qs = { class: "zc-panel" }, Hs = { class: "ss-muted" }, Js = { class: "ss-field" }, Ys = { class: "zc-panel" }, Zs = { class: "ss-field zc-model" }, Gs = { value: "" }, Xs = ["value"], xs = { class: "ss-muted" }, ea = { class: "ss-actions" }, ta = ["disabled"], na = { class: "zc-panel" }, la = {
  key: 0,
  class: "ss-empty"
}, oa = {
  key: 1,
  class: "zc-log"
}, sa = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(_) {
    const h = le.useNotificationStore(), $ = e.ref(!1), w = e.ref([]), k = e.ref(""), b = e.ref(8), D = e.ref(0.13), g = e.ref(""), U = e.ref(""), M = e.reactive({ options: [], defaultLabel: "" }), E = e.computed(() => J.value?.log || []);
    let B = !1;
    e.watch(J, (y) => {
      if (!y || B) return;
      B = !0;
      const v = y.settings;
      w.value = v.regions.map((d) => ({ ...d, bannedWords: [...d.bannedWords] })), k.value = v.regionId, b.value = Math.round(v.defaultMargin * 1e4) / 100, D.value = v.invoiceTaxRate, g.value = v.patrolTimes.join(", "), U.value = v.model;
    }, { immediate: !0 });
    function f() {
      const y = w.value[0];
      w.value.push({ ...y, id: `custom_${Date.now().toString(36)}`, name: s.t("自定义规则"), bannedWords: [...y.bannedWords], note: "" });
    }
    function L(y) {
      w.value = w.value.filter((v) => v.id !== y), k.value === y && (k.value = w.value[0].id);
    }
    async function V() {
      $.value = !0;
      try {
        await N("settings.patch", { patch: { regions: w.value, regionId: k.value, defaultMargin: (Number(b.value) || 0) / 100, invoiceTaxRate: D.value, model: U.value, patrolTimes: g.value.split(/[、,，\s]+/).map((y) => y.replace(/：/g, ":").trim()).filter(Boolean) } }), await H(), g.value = J.value.settings.patrolTimes.join(", "), h.success(s.t("已保存"));
      } catch (y) {
        h.error(A.errorMessage(y));
      } finally {
        $.value = !1;
      }
    }
    async function S() {
      try {
        await N("log.clear"), await H();
      } catch (y) {
        h.error(A.errorMessage(y));
      }
    }
    return e.onMounted(async () => {
      try {
        Object.assign(M, await N("models.list"));
      } catch {
      }
    }), (y, v) => (e.openBlock(), e.createElementBlock("div", ds, [
      e.createElementVNode("section", us, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(y.$t("区划规则")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          ms,
          e.toDisplayString(y.$t("各省电子卖场的口径不同，内置的几套只是公开资料里查到的起点。请对照本区划现行的管理办法改成准确的数；改完商品会按新规则重查。")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(w.value, (d) => (e.openBlock(), e.createElementBlock(
            "div",
            {
              key: d.id,
              class: e.normalizeClass(["zc-region", { on: d.id === k.value }])
            },
            [
              e.createElementVNode("div", ps, [
                e.createElementVNode("label", null, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": v[0] || (v[0] = (m) => k.value = m),
                    type: "radio",
                    value: d.id
                  }, null, 8, vs), [
                    [e.vModelRadio, k.value]
                  ]),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (m) => d.name = m,
                    type: "text",
                    class: "zc-name"
                  }, null, 8, ys), [
                    [e.vModelText, d.name]
                  ])
                ]),
                w.value.length > 1 ? (e.openBlock(), e.createElementBlock("button", {
                  key: 0,
                  type: "button",
                  class: "ss-link",
                  onClick: (m) => L(d.id)
                }, e.toDisplayString(y.$t("删除")), 9, ks)) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode("div", gs, [
                e.createElementVNode("label", hs, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(y.$t("主图最少张数")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (m) => d.imageMin = m,
                    type: "number",
                    min: "0"
                  }, null, 8, Vs), [
                    [
                      e.vModelText,
                      d.imageMin,
                      void 0,
                      { number: !0 }
                    ]
                  ])
                ]),
                e.createElementVNode("label", Es, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(y.$t("主图最短边（像素）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (m) => d.imageMinSide = m,
                    type: "number",
                    min: "0"
                  }, null, 8, Ns), [
                    [
                      e.vModelText,
                      d.imageMinSide,
                      void 0,
                      { number: !0 }
                    ]
                  ])
                ]),
                e.createElementVNode("label", $s, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(y.$t("单张上限（KB）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (m) => d.imageMaxKb = m,
                    type: "number",
                    min: "1"
                  }, null, 8, bs), [
                    [
                      e.vModelText,
                      d.imageMaxKb,
                      void 0,
                      { number: !0 }
                    ]
                  ])
                ]),
                e.createElementVNode("label", fs, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(y.$t("比价基准")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("select", {
                    "onUpdate:modelValue": (m) => d.priceRule = m
                  }, [
                    e.createElementVNode(
                      "option",
                      Ds,
                      e.toDisplayString(y.$t("自营价均值（最低 3 个）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "option",
                      Ss,
                      e.toDisplayString(y.$t("自营最低价")),
                      1
                      /* TEXT */
                    )
                  ], 8, _s), [
                    [e.vModelSelect, d.priceRule]
                  ])
                ]),
                e.createElementVNode("label", ws, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(y.$t("高出基准多少算违规（%）")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("input", {
                    value: Math.round(d.priceTolerance * 1e3) / 10,
                    type: "number",
                    min: "0",
                    step: "0.5",
                    onChange: (m) => d.priceTolerance = (Number(m.target.value) || 0) / 100
                  }, null, 40, Bs)
                ]),
                e.createElementVNode("label", Cs, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(y.$t("至少几条自营链接")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (m) => d.refMin = m,
                    type: "number",
                    min: "0"
                  }, null, 8, Ts), [
                    [
                      e.vModelText,
                      d.refMin,
                      void 0,
                      { number: !0 }
                    ]
                  ])
                ]),
                e.createElementVNode("label", zs, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(y.$t("接单时限（小时）")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (m) => d.acceptHours = m,
                    type: "number",
                    min: "1"
                  }, null, 8, Us), [
                    [
                      e.vModelText,
                      d.acceptHours,
                      void 0,
                      { number: !0 }
                    ]
                  ])
                ]),
                e.createElementVNode("label", Ms, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(y.$t("标题最长字数")),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (m) => d.titleMax = m,
                    type: "number",
                    min: "10"
                  }, null, 8, Ls), [
                    [
                      e.vModelText,
                      d.titleMax,
                      void 0,
                      { number: !0 }
                    ]
                  ])
                ])
              ]),
              e.createElementVNode("label", As, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("本区划额外禁用词（顿号或逗号隔开；广告法极限词已内置）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("input", {
                  value: d.bannedWords.join(y.$t("、")),
                  type: "text",
                  onChange: (m) => d.bannedWords = m.target.value.split(/[、,，\s]+/).filter(Boolean)
                }, null, 40, Is)
              ]),
              e.createElementVNode("label", Os, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(y.$t("规则出处与提醒")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": (m) => d.note = m,
                  type: "text"
                }, null, 8, Ks), [
                  [e.vModelText, d.note]
                ])
              ])
            ],
            2
            /* CLASS */
          ))),
          128
          /* KEYED_FRAGMENT */
        )),
        e.createElementVNode("div", Ws, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn",
            onClick: f
          }, [
            v[5] || (v[5] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(y.$t("加一套规则")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createElementVNode("section", Fs, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(y.$t("报价与开票")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", js, [
          e.createElementVNode("label", Ps, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(y.$t("默认目标毛利率（%）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": v[1] || (v[1] = (d) => b.value = d),
                type: "number",
                min: "0",
                step: "0.5"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                b.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Rs, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(y.$t("订单转开票用的税率")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": v[2] || (v[2] = (d) => D.value = d)
              },
              [
                (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList([0.13, 0.09, 0.06, 0.03, 0.01, 0], (d) => e.createElementVNode("option", {
                    key: d,
                    value: d
                  }, e.toDisplayString(e.unref(ye)(d)), 9, qs)),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ],
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelSelect,
                D.value,
                void 0,
                { number: !0 }
              ]
            ])
          ])
        ])
      ]),
      e.createElementVNode("section", Qs, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(y.$t("巡检提醒")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          Hs,
          e.toDisplayString(y.$t("到点只发系统通知提醒你读回订单与询价单，不会自动操作网页。")),
          1
          /* TEXT */
        ),
        e.createElementVNode("label", Js, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(y.$t("每天这些时刻提醒（如 09:00, 14:30，留空不提醒）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": v[3] || (v[3] = (d) => g.value = d),
              type: "text",
              placeholder: "09:00, 14:30"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, g.value]
          ])
        ])
      ]),
      e.createElementVNode("section", Ys, [
        e.createElementVNode(
          "h3",
          null,
          e.toDisplayString(y.$t("模型")),
          1
          /* TEXT */
        ),
        e.createElementVNode("label", Zs, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(y.$t("按参数写商品详情用的模型")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "select",
            {
              "onUpdate:modelValue": v[4] || (v[4] = (d) => U.value = d)
            },
            [
              e.createElementVNode(
                "option",
                Gs,
                e.toDisplayString(y.$t("跟随系统默认（{p0}）", { p0: M.defaultLabel || y.$t("未配置") })),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(M.options, (d) => (e.openBlock(), e.createElementBlock("option", {
                  key: d.value,
                  value: d.value
                }, e.toDisplayString(d.group ? `${d.group} · ` : "") + e.toDisplayString(d.label), 9, Xs))),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            512
            /* NEED_PATCH */
          ), [
            [e.vModelSelect, U.value]
          ])
        ]),
        e.createElementVNode(
          "p",
          xs,
          e.toDisplayString(y.$t("模型只写详情文字，写出的数字回参数核对；售价、报价、比价基准全部由规则计算。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("div", ea, [
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn primary",
          disabled: $.value,
          "data-test": "zc-settings-save",
          onClick: V
        }, [
          v[6] || (v[6] = e.createElementVNode(
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
        ], 8, ta)
      ]),
      e.createElementVNode("section", na, [
        e.createElementVNode("h3", null, [
          e.createTextVNode(
            e.toDisplayString(y.$t("操作记录")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: S
            },
            e.toDisplayString(y.$t("清空")),
            1
            /* TEXT */
          )
        ]),
        E.value.length ? (e.openBlock(), e.createElementBlock("ul", oa, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(E.value, (d, m) => (e.openBlock(), e.createElementBlock(
              "li",
              {
                key: m,
                class: e.normalizeClass({ bad: !d.ok })
              },
              [
                e.createElementVNode(
                  "time",
                  null,
                  e.toDisplayString(e.unref(A.fmtDateTime)(d.at)),
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
        ])) : (e.openBlock(), e.createElementBlock(
          "p",
          la,
          e.toDisplayString(y.$t("还没有记录")),
          1
          /* TEXT */
        ))
      ])
    ]));
  }
}), aa = /* @__PURE__ */ x(sa, [["__scopeId", "data-v-445e1de7"]]), ia = { class: "zc-workbench" }, ra = { class: "workbench-header" }, ca = { class: "heading" }, da = { class: "eyebrow" }, ua = { class: "subtitle" }, ma = { class: "header-actions" }, pa = ["disabled"], va = {
  key: 0,
  class: "zc-bar"
}, ya = { class: "ss-muted" }, ka = {
  key: 1,
  class: "ss-chip",
  "data-test": "zc-bar-wb"
}, ga = { class: "zc-bar__rule" }, ha = { class: "no" }, Va = { class: "yes" }, Ea = {
  key: 1,
  class: "zc-alerts",
  "data-test": "zc-alerts"
}, Na = ["onClick"], $a = {
  class: "zc-tabs",
  role: "tablist"
}, ba = ["aria-selected", "data-test", "onClick"], fa = {
  key: 0,
  class: "zc-badge"
}, _a = {
  key: 2,
  class: "zc-body"
}, Da = {
  key: 5,
  class: "zc-ov"
}, Sa = { class: "ss-panel" }, wa = { class: "zc-ov__cards" }, Ba = ["onClick"], Ca = { class: "ss-panel" }, Ta = { class: "zc-list" }, za = { class: "ss-panel" }, Ua = { class: "zc-list" }, Ma = {
  key: 3,
  class: "ss-note danger"
}, La = {
  key: 4,
  class: "ss-note"
}, ue = "totalclaw:zcy-agent-tab:v1", Aa = /* @__PURE__ */ e.defineComponent({
  __name: "ZcyAgentWorkbenchView",
  setup(_) {
    const h = [
      { key: "account", icon: "ri-shield-keyhole-line", title: s.t("账号与材料") },
      { key: "listing", icon: "ri-store-3-line", title: s.t("商品上架") },
      { key: "quote", icon: "ri-price-tag-3-line", title: s.t("询价报价") },
      { key: "orders", icon: "ri-truck-line", title: s.t("订单履约") },
      { key: "overview", icon: "ri-book-open-line", title: s.t("方案说明") },
      { key: "settings", icon: "ri-settings-3-line", title: s.t("设置") }
    ], $ = [
      { key: "account", icon: "ri-shield-keyhole-line", title: s.t("账号与材料"), text: s.t("企业信息、资质到期提醒、账号密码加密保存、登录") },
      { key: "listing", icon: "ri-store-3-line", title: s.t("商品上架"), text: s.t("商品表 → 标题、图片、比价链接与售价检查 → 数字员工填写，停在提交审核前") },
      { key: "quote", icon: "ri-price-tag-3-line", title: s.t("询价报价"), text: s.t("读回待报价的询价单 → 填成本、规则算报价 → 数字员工填写，停在提交报价前") },
      { key: "orders", icon: "ri-truck-line", title: s.t("订单履约"), text: s.t("读回订单 → 接单与发货时限预警 → 回填物流 → 待开票订单转入发票智能体") }
    ];
    function w() {
      try {
        const m = localStorage.getItem(ue);
        return h.some((C) => C.key === m) ? m : "overview";
      } catch {
        return "overview";
      }
    }
    const k = J, b = e.ref(w()), D = e.ref(!1), g = e.ref(!1), U = e.ref(""), M = e.ref(!1), E = e.computed(() => k.value?.settings.regions.find((m) => m.id === k.value?.settings.regionId)?.name || ""), B = (m) => m === "qualification" ? "account" : m === "price" ? "listing" : m === "inquiry_deadline" ? "quote" : "orders", f = (m) => m === "qualification" ? "ri-file-warning-line" : m === "price" ? "ri-price-tag-3-line" : m === "inquiry_deadline" ? "ri-timer-flash-line" : "ri-truck-line";
    function L(m) {
      const C = (k.value?.alerts || []).filter((z) => B(z.kind) === m).length;
      return C ? String(C) : "";
    }
    function V(m) {
      b.value = m;
      try {
        localStorage.setItem(ue, m);
      } catch {
      }
    }
    async function S() {
      g.value = !0;
      try {
        await H(), D.value = !0, U.value = "";
      } catch (m) {
        U.value = A.errorMessage(m);
      } finally {
        g.value = !1;
      }
    }
    let y = null, v = null, d = null;
    return e.onMounted(() => {
      S(), v = Ve(() => {
        y || (y = setTimeout(() => {
          y = null, H().catch(() => {
          });
        }, 250));
      }), d = setInterval(() => {
        H().catch(() => {
        });
      }, 5 * 6e4);
    }), e.onBeforeUnmount(() => {
      v?.(), y && clearTimeout(y), d && clearInterval(d);
    }), (m, C) => (e.openBlock(), e.createElementBlock("div", ia, [
      e.createElementVNode("header", ra, [
        e.createElementVNode("div", ca, [
          e.createVNode(he),
          C[1] || (C[1] = e.createElementVNode(
            "span",
            { class: "heading-icon" },
            [
              e.createElementVNode("i", { class: "ri-government-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "p",
              da,
              e.toDisplayString(m.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(m.$t("政采云智能体")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              ua,
              e.toDisplayString(m.$t("给它企业材料和政采云账号，它在内置浏览器里替你做供应商的日常工作：商品上架、询价报价、接单发货、待开票订单转开票。价格由规则计算，提交、报价、接单都停在最后一步由你确认。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", ma, [
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: g.value,
            onClick: S
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
              e.toDisplayString(m.$t("刷新")),
              1
              /* TEXT */
            )
          ], 8, pa)
        ])
      ]),
      e.unref(k) ? (e.openBlock(), e.createElementBlock("section", va, [
        e.createElementVNode("span", null, [
          C[2] || (C[2] = e.createElementVNode(
            "i",
            { class: "ri-building-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(e.unref(k).settings.company.name || m.$t("未设置企业")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          ya,
          e.toDisplayString(m.$t("规则：{r} · 商品 {a} · 询价单 {b} · 订单 {c}", { r: E.value, a: e.unref(k).products.length, b: e.unref(k).inquiries.length, c: e.unref(k).orders.length })),
          1
          /* TEXT */
        ),
        e.unref(k).workbench?.loggedIn ? (e.openBlock(), e.createElementBlock(
          "span",
          {
            key: 0,
            class: e.normalizeClass(["ss-chip", e.unref(k).workbench.temporary ? "warn" : "ok"]),
            "data-test": "zc-bar-wb"
          },
          e.toDisplayString([e.unref(k).workbench.region, e.unref(k).workbench.identity || m.$t("已登录")].filter(Boolean).join(" · ")),
          3
          /* TEXT, CLASS */
        )) : (e.openBlock(), e.createElementBlock(
          "span",
          ka,
          e.toDisplayString(m.$t("还没读取政采云工作台")),
          1
          /* TEXT */
        )),
        e.createElementVNode("p", ga, [
          e.createElementVNode("span", ha, [
            C[3] || (C[3] = e.createElementVNode(
              "i",
              { class: "ri-close-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(m.$t("模型不算价、不碰密码与验证码、不擅自提交")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", Va, [
            C[4] || (C[4] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(m.$t("提交审核 / 报价 / 接单 / 发货由你亲自点")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.unref(k)?.alerts.length ? (e.openBlock(), e.createElementBlock("section", Ea, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(e.unref(k).alerts.slice(0, M.value ? 50 : 4), (z, I) => (e.openBlock(), e.createElementBlock(
            "p",
            {
              key: I,
              class: e.normalizeClass(["ss-note", z.level === "error" ? "danger" : "warn"])
            },
            [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(f(z.kind))
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(z.text),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-link",
                onClick: (Y) => V(B(z.kind))
              }, e.toDisplayString(m.$t("去处理")), 9, Na)
            ],
            2
            /* CLASS */
          ))),
          128
          /* KEYED_FRAGMENT */
        )),
        e.unref(k).alerts.length > 4 ? (e.openBlock(), e.createElementBlock(
          "button",
          {
            key: 0,
            type: "button",
            class: "ss-link",
            onClick: C[0] || (C[0] = (z) => M.value = !M.value)
          },
          e.toDisplayString(M.value ? m.$t("收起") : m.$t("还有 {n} 条", { n: e.unref(k).alerts.length - 4 })),
          1
          /* TEXT */
        )) : e.createCommentVNode("v-if", !0)
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("nav", $a, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(h, (z) => e.createElementVNode("button", {
            key: z.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["zc-tab", { active: b.value === z.key }]),
            "aria-selected": b.value === z.key,
            "data-test": `zc-tab-${z.key}`,
            onClick: (I) => V(z.key)
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
            L(z.key) ? (e.openBlock(), e.createElementBlock(
              "em",
              fa,
              e.toDisplayString(L(z.key)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, ba)),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      D.value ? (e.openBlock(), e.createElementBlock("div", _a, [
        b.value === "account" ? (e.openBlock(), e.createBlock(Kt, { key: 0 })) : b.value === "listing" ? (e.openBlock(), e.createBlock(Xn, { key: 1 })) : b.value === "quote" ? (e.openBlock(), e.createBlock(Eo, { key: 2 })) : b.value === "orders" ? (e.openBlock(), e.createBlock(cs, { key: 3 })) : b.value === "settings" ? (e.openBlock(), e.createBlock(aa, { key: 4 })) : (e.openBlock(), e.createElementBlock("div", Da, [
          e.createElementVNode("section", Sa, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(m.$t("先打开政采云，再做四件事")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", wa, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList($, (z) => e.createElementVNode("button", {
                  key: z.key,
                  type: "button",
                  class: "zc-ov__card",
                  onClick: (I) => V(z.key)
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
                    "strong",
                    null,
                    e.toDisplayString(z.title),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(z.text),
                    1
                    /* TEXT */
                  )
                ], 8, Ba)),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ]),
          e.createElementVNode("section", Ca, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(m.$t("红线")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Ta, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(m.$t("价格不交给模型算：售价是否超过自营基准、询价报价、合计，全部由规则计算；模型只按你给的参数写商品详情，写出的数字回参数核对")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(m.$t("最后一步由人点：提交审核、提交报价、确认接单、确认发货、合同签章，数字员工一律停在按钮前截图给你；询价只有一轮报价，提交后不能改")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(m.$t("密码不进模型：账号密码用系统钥匙串加密存在本机，只由应用填进政采云的登录框；验证码、滑块、短信、CA 证书由你完成，不做任何绕过")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(m.$t("不抓取电商页面：比价链接和对方售价由你提供，系统只做比较")),
                1
                /* TEXT */
              )
            ])
          ]),
          e.createElementVNode("section", za, [
            e.createElementVNode(
              "h3",
              null,
              e.toDisplayString(m.$t("先知道这几件事")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", Ua, [
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(m.$t("默认按吉林省的规则（出自吉林省公共资源交易中心的上架指南）；其它省的比价口径、图片规格、接单时限、禁用词在设置里改")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(m.$t("价格违规后果重：平台按月抽检，高于自营价会被扣诚信分、暂停交易甚至清退；在售商品超价会一直提醒")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(m.$t("项目电子投标（投标客户端、CA 加密解密）不在范围内；标书请用「标书编写」工作台准备")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "li",
                null,
                e.toDisplayString(m.$t("政采云的用户协议对自动化工具的限制请自行确认；这个智能体按人的节奏逐步操作，不做批量抓取")),
                1
                /* TEXT */
              )
            ])
          ])
        ]))
      ])) : U.value ? (e.openBlock(), e.createElementBlock("p", Ma, [
        C[5] || (C[5] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(U.value),
          1
          /* TEXT */
        )
      ])) : (e.openBlock(), e.createElementBlock("p", La, [
        C[6] || (C[6] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(m.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), Ia = /* @__PURE__ */ x(Aa, [["__scopeId", "data-v-01129776"]]);
export {
  Ia as default
};
