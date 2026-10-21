const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const s = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!s) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
s.default;
const F = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!F) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
F.default;
const le = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!le) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const pe = le.default, ne = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!ne) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const W = ne.default, oe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!oe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const G = oe.default, Q = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!Q) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
Q.default;
const D = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!D) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
D.default;
async function C(V, u) {
  const y = window.electronAPI?.workbenches?.academicWriter;
  if (!y?.invoke) throw new Error(s.t("学术写作接口不可用，请重启应用"));
  return y.invoke(V, Q.toPlain(u ?? {}));
}
function ve(V) {
  const u = window.electronAPI?.workbenches?.academicWriter;
  return u?.onEvent ? u.onEvent(V) : () => {
  };
}
const z = e.ref(null), x = e.reactive({});
function U() {
  const V = z.value;
  return V && (V.projects.find((u) => u.id === V.activeProjectId) || V.projects[0]) || null;
}
async function I() {
  const V = await C("state.get");
  return z.value = V, V;
}
function X(V) {
  return { pubmed: "PubMed", europepmc: "Europe PMC", arxiv: "arXiv", crossref: "Crossref", openalex: "OpenAlex", web: s.t("网页抓取") }[V];
}
function R(V) {
  return { review: s.t("综述"), research: s.t("研究论文"), thesis: s.t("学位论文"), proposal: s.t("开题报告") }[V] || V;
}
function J(V) {
  return { gbt7714: "GB/T 7714-2015", apa: "APA 7", ieee: "IEEE" }[V] || V;
}
function ye() {
  return [
    { id: "pubmed", name: "PubMed", home: "https://pubmed.ncbi.nlm.nih.gov/", search: "https://pubmed.ncbi.nlm.nih.gov/?term={q}" },
    { id: "scholar", name: "Google Scholar", home: "https://scholar.google.com/", search: "https://scholar.google.com/scholar?q={q}", note: s.t("需要能访问 Google") },
    { id: "cnki", name: s.t("中国知网"), home: "https://www.cnki.net/", search: "https://kns.cnki.net/kns8s/defaultresult/index?kw={q}", note: s.t("全文下载需机构或个人账号") },
    { id: "wanfang", name: s.t("万方数据"), home: "https://www.wanfangdata.com.cn/", search: "https://s.wanfangdata.com.cn/paper?q={q}" },
    { id: "cqvip", name: s.t("维普"), home: "https://www.cqvip.com/" },
    { id: "baidu", name: s.t("百度学术"), home: "https://xueshu.baidu.com/", search: "https://xueshu.baidu.com/s?wd={q}" },
    { id: "arxiv", name: "arXiv", home: "https://arxiv.org/", search: "https://arxiv.org/search/?query={q}&searchtype=all" },
    { id: "europepmc", name: "Europe PMC", home: "https://europepmc.org/", search: "https://europepmc.org/search?query={q}" },
    { id: "s2", name: "Semantic Scholar", home: "https://www.semanticscholar.org/", search: "https://www.semanticscholar.org/search?q={q}" },
    { id: "wos", name: "Web of Science", home: "https://www.webofscience.com/", note: s.t("需机构订阅") },
    { id: "sd", name: "ScienceDirect", home: "https://www.sciencedirect.com/", search: "https://www.sciencedirect.com/search?qs={q}" },
    { id: "ieee", name: "IEEE Xplore", home: "https://ieeexplore.ieee.org/", search: "https://ieeexplore.ieee.org/search/searchresult.jsp?queryText={q}" },
    { id: "springer", name: "SpringerLink", home: "https://link.springer.com/", search: "https://link.springer.com/search?query={q}" }
  ];
}
const he = "academic-writer";
async function se(V) {
  const u = window.electronAPI?.browserTabs;
  if (!u?.create) return !1;
  const y = /^https?:\/\//i.test(V) ? V : `https://${V}`, m = await u.create({ url: y, contextId: he, source: "agent", activate: !0 });
  if (m?.id && u.navigate)
    try {
      await u.navigate(m.id, y);
    } catch {
    }
  try {
    await u.setVisible?.(!0);
  } catch {
  }
  return !0;
}
function ae(V) {
  return [V.authors.length ? `${V.authors[0]}${V.authors.length > 1 ? s.t(" 等") : ""}` : "", V.journal, V.year].filter(Boolean).join(" · ");
}
async function re(V, u) {
  const y = window.electronAPI?.cowrite;
  if (!y?.open || !y?.apply) throw new Error(s.t("当前版本没有人机双写编辑器"));
  const m = await y.open({ mode: "local" });
  if (m && m.ok === !1) throw new Error(s.t("人机双写编辑器没有打开"));
  const N = await y.apply({ mode: "local", applyMode: "loadDoc", title: V, text: u });
  if (N && N.ok === !1) throw new Error(s.t("没能把文稿载入人机双写编辑器"));
}
async function ke() {
  const V = window.electronAPI?.cowrite;
  if (!V?.get) throw new Error(s.t("当前版本没有人机双写编辑器"));
  const u = await V.get({ mode: "local" });
  return String(u?.text || "");
}
const ge = { class: "ss-module" }, Ee = { class: "ss-panel aw-head" }, fe = { class: "aw-head__main" }, Ve = { class: "ss-muted" }, Ne = {
  key: 0,
  class: "ss-note info"
}, be = { class: "ss-steps" }, $e = { class: "aw-topic" }, we = { class: "ss-actions" }, _e = ["disabled"], Se = {
  key: 0,
  class: "ss-muted"
}, De = {
  key: 0,
  class: "aw-chips"
}, Ce = { class: "ss-muted" }, Be = ["title", "onClick"], Te = { key: 0 }, Le = {
  key: 1,
  class: "aw-chips"
}, Ae = { class: "ss-muted" }, Me = ["onClick"], Oe = { class: "ss-grid" }, Ie = { class: "ss-field aw-wide" }, We = ["placeholder"], qe = { class: "ss-field" }, Pe = { class: "ss-field" }, Ke = { class: "aw-sources" }, xe = ["value"], ze = { class: "ss-actions" }, Fe = ["disabled"], je = { class: "ss-actions" }, Ue = { class: "ss-muted" }, Re = ["disabled"], Xe = ["disabled"], Ge = { class: "aw-results" }, Je = ["disabled", "checked", "onChange"], Ze = { class: "aw-results__body" }, He = ["onClick"], Qe = { class: "aw-meta" }, Ye = {
  key: 0,
  class: "ss-chip"
}, et = {
  key: 1,
  class: "ss-chip ok"
}, tt = {
  key: 2,
  class: "ss-chip brand"
}, lt = ["onClick"], nt = ["onClick"], ot = {
  key: 0,
  class: "aw-abstract"
}, st = {
  key: 0,
  class: "ss-empty"
}, at = {
  key: 1,
  class: "ss-muted"
}, rt = { class: "ss-field" }, it = { class: "aw-sites" }, ct = ["onClick"], dt = { key: 0 }, ut = { class: "ss-muted" }, mt = { class: "ss-actions" }, pt = ["disabled"], vt = { class: "ss-muted" }, yt = {
  key: 0,
  class: "ss-note ok"
}, ht = /* @__PURE__ */ e.defineComponent({
  __name: "SearchTab",
  emits: ["goto"],
  setup(V) {
    const u = F.useNotificationStore(), y = ["pubmed", "europepmc", "arxiv", "crossref", "openalex"], m = e.computed(() => (z.value, U())), N = e.computed(() => m.value?.lastSearch || null), d = e.computed(() => N.value?.results || []), w = ye(), g = e.ref(N.value?.query || ""), h = e.ref(""), v = e.ref(N.value?.yearFrom), a = e.ref(15), f = e.ref([...z.value?.settings.defaultSources || ["pubmed", "europepmc", "arxiv", "openalex"]].filter((c) => c !== "web")), _ = e.ref([]), T = e.ref([]), A = e.ref(""), L = e.ref([]), M = e.ref([]), $ = e.ref(""), k = e.ref({}), B = e.ref(""), q = e.ref(!1);
    e.watch(N, () => {
      L.value = [];
    });
    function i(c) {
      const S = m.value?.library || [], p = (O) => O.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
      return S.some((O) => c.doi && O.doi === c.doi || p(O.title) === p(c.title));
    }
    const n = e.computed(() => d.value.filter((c) => !i(c))), t = [
      { key: "topic", title: s.t("选题与检索式"), hint: s.t("让模型把选题拆成英文检索式和中文关键词") },
      { key: "search", title: s.t("学术库检索"), hint: s.t("PubMed、Europe PMC、arXiv、Crossref、OpenAlex 同时查，跨库去重") },
      { key: "results", title: s.t("挑选文献"), hint: s.t("勾选相关的加入文献库，写作只能引用库里的文献") },
      { key: "sites", title: s.t("学术网站"), hint: s.t("在内置浏览器打开知网、万方、Google Scholar 等，抓取当前文献") }
    ], l = e.computed(() => {
      const c = (p, O, me) => $.value === p ? { state: "running" } : k.value[p] ? { state: "failed", error: k.value[p] } : O ? { state: "done", summary: me } : { state: "todo" }, S = m.value?.library.length || 0;
      return {
        topic: c("topic", _.value.length > 0 || !!N.value, _.value.length ? s.t("{n} 条检索式", { n: _.value.length }) : ""),
        search: c("search", !!N.value, N.value ? s.t("{n} 篇", { n: d.value.length }) : ""),
        results: c("results", S > 0, s.t("文献库 {n} 篇", { n: S })),
        sites: c("sites", q.value || !!B.value, B.value ? s.t("已抓取") : s.t("已打开"))
      };
    }), r = e.computed(() => t.find((c) => l.value[c.key].state !== "done")?.key || "sites");
    async function o(c, S) {
      $.value = c, k.value = { ...k.value, [c]: "" }, D.scrollToStep(c);
      try {
        return await S(), await I(), !0;
      } catch (p) {
        return k.value = { ...k.value, [c]: D.errorMessage(p) }, !1;
      } finally {
        $.value = "";
      }
    }
    async function b() {
      await o("topic", async () => {
        const c = await C("query.suggest", { topic: m.value?.title });
        _.value = c.queries, T.value = c.zhKeywords, A.value = c.model, !g.value && c.queries[0] && (g.value = c.queries[0].query);
      });
    }
    async function E() {
      !g.value || !f.value.length || await o("search", () => C("search.run", { query: g.value, sources: f.value, yearFrom: v.value || void 0, limit: a.value || 15 }));
    }
    function K(c) {
      L.value = L.value.includes(c) ? L.value.filter((S) => S !== c) : [...L.value, c];
    }
    function P(c) {
      M.value = M.value.includes(c) ? M.value.filter((S) => S !== c) : [...M.value, c];
    }
    function Z() {
      L.value = n.value.map((c) => c.id);
    }
    async function ie() {
      await o("add", async () => {
        const S = await C("library.add", { ids: L.value });
        u.success(s.t("已加入文献库 {n} 篇", { n: S.added })), L.value = [];
      }) || u.error(k.value.add);
    }
    async function H(c) {
      try {
        await se(c) || u.error(s.t("内置浏览器不可用"));
      } catch (S) {
        u.error(D.errorMessage(S));
      }
    }
    async function ce(c) {
      const S = h.value && c.search ? c.search.replace("{q}", encodeURIComponent(h.value)) : c.home;
      await H(S), q.value = !0;
    }
    async function de() {
      B.value = "", await o("sites", async () => {
        const c = await C("web.capture");
        B.value = c.added ? s.t("已抓取进文献库：{p0}", { p0: c.paper.title }) : s.t("这篇已经在文献库里：{p0}", { p0: c.paper.title });
      });
    }
    function ue(c) {
      D.scrollToStep(c);
    }
    return (c, S) => (e.openBlock(), e.createElementBlock("div", ge, [
      e.createElementVNode("section", Ee, [
        e.createElementVNode("div", fe, [
          e.createElementVNode("strong", null, [
            S[5] || (S[5] = e.createElementVNode(
              "i",
              { class: "ri-search-eye-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(c.$t("文献检索")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            Ve,
            e.toDisplayString(c.$t("直接查学术库的公开接口，结果都是真实文献；知网、万方等在内置浏览器打开后抓取当前页面。")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createVNode(G, {
        title: c.$t("文献检索"),
        metas: t,
        runtime: l.value,
        "current-key": r.value,
        onJump: ue
      }, null, 8, ["title", "runtime", "current-key"]),
      e.unref(x).search ? (e.openBlock(), e.createElementBlock("p", Ne, [
        S[6] || (S[6] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(e.unref(x).search),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", be, [
        e.createCommentVNode(" ① 选题与检索式 "),
        e.createVNode(W, {
          "step-key": "topic",
          index: 0,
          title: t[0].title,
          hint: t[0].hint,
          runtime: l.value.topic
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", $e, [
              S[7] || (S[7] = e.createElementVNode(
                "i",
                { class: "ri-draft-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(m.value?.title || "—"),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", we, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!$.value || !m.value,
                onClick: b
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass($.value === "topic" ? "ri-loader-4-line spin" : "ri-magic-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(c.$t("生成检索式")),
                  1
                  /* TEXT */
                )
              ], 8, _e),
              A.value ? (e.openBlock(), e.createElementBlock(
                "span",
                Se,
                e.toDisplayString(c.$t("由 {p0} 生成", { p0: A.value })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            _.value.length ? (e.openBlock(), e.createElementBlock("div", De, [
              e.createElementVNode(
                "span",
                Ce,
                e.toDisplayString(c.$t("英文检索式（点一下填入检索框）")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(_.value, (p) => (e.openBlock(), e.createElementBlock("button", {
                  key: p.query,
                  type: "button",
                  class: "aw-chip",
                  title: p.purpose,
                  onClick: (O) => g.value = p.query
                }, [
                  e.createTextVNode(
                    e.toDisplayString(p.query),
                    1
                    /* TEXT */
                  ),
                  p.purpose ? (e.openBlock(), e.createElementBlock(
                    "small",
                    Te,
                    e.toDisplayString(p.purpose),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ], 8, Be))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0),
            T.value.length ? (e.openBlock(), e.createElementBlock("div", Le, [
              e.createElementVNode(
                "span",
                Ae,
                e.toDisplayString(c.$t("中文关键词（点一下填入学术网站检索词）")),
                1
                /* TEXT */
              ),
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(T.value, (p) => (e.openBlock(), e.createElementBlock("button", {
                  key: p,
                  type: "button",
                  class: "aw-chip",
                  onClick: (O) => h.value = p
                }, e.toDisplayString(p), 9, Me))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createCommentVNode(" ② 学术库检索 "),
        e.createVNode(W, {
          "step-key": "search",
          index: 1,
          title: t[1].title,
          hint: t[1].hint,
          runtime: l.value.search
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Oe, [
              e.createElementVNode("label", Ie, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(c.$t("检索词")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode("input", {
                  "onUpdate:modelValue": S[0] || (S[0] = (p) => g.value = p),
                  type: "text",
                  placeholder: c.$t("英文检索效果最好，如 large language model radiology"),
                  onKeyup: e.withKeys(E, ["enter"])
                }, null, 40, We), [
                  [
                    e.vModelText,
                    g.value,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", qe, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(c.$t("起始年份（可选）")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": S[1] || (S[1] = (p) => v.value = p),
                    type: "number",
                    min: "1900",
                    max: "2100"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    v.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", Pe, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(c.$t("每个库取多少条")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": S[2] || (S[2] = (p) => a.value = p),
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
                    a.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ])
            ]),
            e.createElementVNode("div", Ke, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(y, (p) => e.createElementVNode("label", {
                  key: p,
                  class: "aw-check"
                }, [
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": S[3] || (S[3] = (O) => f.value = O),
                    type: "checkbox",
                    value: p
                  }, null, 8, xe), [
                    [e.vModelCheckbox, f.value]
                  ]),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(X)(p)),
                    1
                    /* TEXT */
                  )
                ])),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", ze, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!$.value || !g.value || !f.value.length,
                onClick: E
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass($.value === "search" ? "ri-loader-4-line spin" : "ri-search-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(c.$t("检索")),
                  1
                  /* TEXT */
                )
              ], 8, Fe)
            ]),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(N.value?.errors || [], (p) => (e.openBlock(), e.createElementBlock("p", {
                key: p.source,
                class: "ss-note warn"
              }, [
                S[8] || (S[8] = e.createElementVNode(
                  "i",
                  { class: "ri-error-warning-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(c.$t("{p0} 没查成：{p1}", { p0: e.unref(X)(p.source), p1: p.message })),
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
        e.createCommentVNode(" ③ 结果 "),
        e.createVNode(W, {
          "step-key": "results",
          index: 2,
          title: t[2].title,
          hint: t[2].hint,
          runtime: l.value.results
        }, {
          default: e.withCtx(() => [
            N.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", je, [
                  e.createElementVNode(
                    "span",
                    Ue,
                    e.toDisplayString(c.$t("「{p0}」共 {n} 篇（已跨库去重）", { p0: N.value.query, n: d.value.length })),
                    1
                    /* TEXT */
                  ),
                  S[9] || (S[9] = e.createElementVNode(
                    "span",
                    { class: "aw-grow" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    disabled: !n.value.length,
                    onClick: Z
                  }, e.toDisplayString(c.$t("全选未入库")), 9, Re),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm primary",
                    disabled: !L.value.length || !!$.value,
                    onClick: ie
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass($.value === "add" ? "ri-loader-4-line spin" : "ri-add-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(c.$t("加入文献库（{n}）", { n: L.value.length })),
                      1
                      /* TEXT */
                    )
                  ], 8, Xe)
                ]),
                e.createElementVNode("ul", Ge, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(d.value, (p) => (e.openBlock(), e.createElementBlock(
                      "li",
                      {
                        key: p.id,
                        class: e.normalizeClass({ inlib: i(p) })
                      },
                      [
                        e.createElementVNode("input", {
                          type: "checkbox",
                          disabled: i(p),
                          checked: L.value.includes(p.id),
                          onChange: (O) => K(p.id)
                        }, null, 40, Je),
                        e.createElementVNode("div", Ze, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "aw-title",
                            onClick: (O) => P(p.id)
                          }, e.toDisplayString(p.title), 9, He),
                          e.createElementVNode("div", Qe, [
                            e.createElementVNode(
                              "span",
                              null,
                              e.toDisplayString(e.unref(ae)(p)),
                              1
                              /* TEXT */
                            ),
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(p.foundIn || [p.source], (O) => (e.openBlock(), e.createElementBlock(
                                "em",
                                {
                                  key: O,
                                  class: "ss-chip"
                                },
                                e.toDisplayString(e.unref(X)(O)),
                                1
                                /* TEXT */
                              ))),
                              128
                              /* KEYED_FRAGMENT */
                            )),
                            p.citedBy != null ? (e.openBlock(), e.createElementBlock(
                              "em",
                              Ye,
                              e.toDisplayString(c.$t("被引 {n}", { n: p.citedBy })),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0),
                            p.openAccess ? (e.openBlock(), e.createElementBlock(
                              "em",
                              et,
                              e.toDisplayString(c.$t("开放获取")),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0),
                            i(p) ? (e.openBlock(), e.createElementBlock(
                              "em",
                              tt,
                              e.toDisplayString(c.$t("已在文献库")),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0),
                            p.url ? (e.openBlock(), e.createElementBlock("button", {
                              key: 3,
                              type: "button",
                              class: "ss-link",
                              onClick: (O) => H(p.url)
                            }, e.toDisplayString(c.$t("在内置浏览器打开")), 9, lt)) : e.createCommentVNode("v-if", !0),
                            p.pdfUrl ? (e.openBlock(), e.createElementBlock("button", {
                              key: 4,
                              type: "button",
                              class: "ss-link",
                              onClick: (O) => H(p.pdfUrl)
                            }, "PDF", 8, nt)) : e.createCommentVNode("v-if", !0)
                          ]),
                          M.value.includes(p.id) ? (e.openBlock(), e.createElementBlock(
                            "p",
                            ot,
                            e.toDisplayString(p.abstract || c.$t("这条没有摘要")),
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
                  )),
                  d.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                    "li",
                    st,
                    e.toDisplayString(c.$t("没有检索到结果，换个检索词或放宽年份试试")),
                    1
                    /* TEXT */
                  ))
                ])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              at,
              e.toDisplayString(c.$t("还没有检索")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createCommentVNode(" ④ 学术网站 "),
        e.createVNode(W, {
          "step-key": "sites",
          index: 3,
          title: t[3].title,
          hint: t[3].hint,
          runtime: l.value.sites
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("label", rt, [
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(c.$t("网站检索词（可选，填了就直接打开检索结果页）")),
                1
                /* TEXT */
              ),
              e.withDirectives(e.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": S[4] || (S[4] = (p) => h.value = p),
                  type: "text"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [
                  e.vModelText,
                  h.value,
                  void 0,
                  { trim: !0 }
                ]
              ])
            ]),
            e.createElementVNode("div", it, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(w), (p) => (e.openBlock(), e.createElementBlock("button", {
                  key: p.id,
                  type: "button",
                  class: "aw-site",
                  onClick: (O) => ce(p)
                }, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(p.name),
                    1
                    /* TEXT */
                  ),
                  p.note ? (e.openBlock(), e.createElementBlock(
                    "small",
                    dt,
                    e.toDisplayString(p.note),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ], 8, ct))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode(
              "p",
              ut,
              e.toDisplayString(c.$t("知网等需要机构账号的，在内置浏览器里登录一次，所有论文共用。")),
              1
              /* TEXT */
            ),
            e.createElementVNode("div", mt, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!$.value,
                onClick: de
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass($.value === "sites" ? "ri-loader-4-line spin" : "ri-download-cloud-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(c.$t("抓取当前页面到文献库")),
                  1
                  /* TEXT */
                )
              ], 8, pt),
              e.createElementVNode(
                "span",
                vt,
                e.toDisplayString(c.$t("先在内置浏览器里点进一篇文献的详情页")),
                1
                /* TEXT */
              )
            ]),
            B.value ? (e.openBlock(), e.createElementBlock("p", yt, [
              S[10] || (S[10] = e.createElementVNode(
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
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), j = (V, u) => {
  const y = V.__vccOpts || V;
  for (const [m, N] of u)
    y[m] = N;
  return y;
}, kt = /* @__PURE__ */ j(ht, [["__scopeId", "data-v-79a13ce2"]]), gt = { class: "ss-module" }, Et = { class: "ss-panel aw-head" }, ft = { class: "aw-head__main" }, Vt = { class: "ss-muted" }, Nt = {
  key: 0,
  class: "ss-note info"
}, bt = {
  key: 0,
  class: "ss-note info"
}, $t = { class: "ss-steps" }, wt = { class: "aw-lib" }, _t = { class: "aw-lib__top" }, St = { class: "aw-no" }, Dt = ["onClick"], Ct = { class: "aw-meta" }, Bt = {
  key: 0,
  class: "ss-chip"
}, Tt = {
  key: 1,
  class: "aw-doi"
}, Lt = {
  key: 0,
  class: "ss-chip ok"
}, At = {
  key: 1,
  class: "ss-chip bad"
}, Mt = {
  key: 2,
  class: "ss-chip brand"
}, Ot = ["onClick"], It = ["onClick"], Wt = ["disabled", "onClick"], qt = ["onClick"], Pt = ["value", "placeholder", "onBlur"], Kt = {
  key: 0,
  class: "aw-detail"
}, xt = { class: "aw-sum" }, zt = {
  key: 0,
  class: "aw-quotes"
}, Ft = { class: "ss-muted" }, jt = { class: "aw-abstract" }, Ut = { class: "ss-actions" }, Rt = ["disabled"], Xt = { class: "ss-muted" }, Gt = {
  key: 0,
  class: "aw-failed"
}, Jt = { class: "ss-actions" }, Zt = ["disabled"], Ht = ["disabled"], Qt = {
  key: 0,
  class: "ss-muted"
}, Yt = /* @__PURE__ */ e.defineComponent({
  __name: "LibraryTab",
  emits: ["goto"],
  setup(V) {
    const u = F.useNotificationStore(), y = e.computed(() => (z.value, U())), m = e.computed(() => y.value?.library || []), N = e.computed(() => m.value.filter((o) => !o.summary)), d = e.computed(() => m.value.filter((o) => o.doi)), w = e.computed(() => d.value.some((o) => o.doiCheck)), g = e.computed(() => d.value.filter((o) => o.doiCheck === "ok").length), h = e.computed(() => d.value.filter((o) => o.doiCheck === "missing").length), v = e.ref([]), a = e.ref(""), f = e.ref({}), _ = e.ref([]), T = [
      { key: "list", title: s.t("文献库"), hint: s.t("编号 [n] 就是写作时的引用编号") },
      { key: "read", title: s.t("精读"), hint: s.t("研究问题、方法、主要发现、局限，每项附摘要原句") },
      { key: "doi", title: s.t("查验 DOI 与导出"), hint: s.t("Crossref 核对 DOI 真实存在，导出 BibTeX 给 Zotero / EndNote") }
    ], A = e.computed(() => {
      const o = (b, E, K) => a.value === b ? { state: "running" } : f.value[b] ? { state: "failed", error: f.value[b] } : E ? { state: "done", summary: K } : { state: "todo" };
      return {
        list: o("list", m.value.length > 0, s.t("{n} 篇", { n: m.value.length })),
        read: o("read", m.value.length > 0 && !N.value.length, s.t("全部已精读")),
        doi: o("doi", w.value, s.t("查到 {a}，查不到 {b}", { a: g.value, b: h.value }))
      };
    }), L = e.computed(() => T.find((o) => A.value[o.key].state !== "done")?.key || "doi");
    async function M(o, b) {
      a.value = o, f.value = { ...f.value, [o]: "" }, D.scrollToStep(o);
      try {
        return await b(), await I(), !0;
      } catch (E) {
        return f.value = { ...f.value, [o]: D.errorMessage(E) }, !1;
      } finally {
        a.value = "";
      }
    }
    function $(o) {
      v.value = v.value.includes(o) ? v.value.filter((b) => b !== o) : [...v.value, o];
    }
    async function k() {
      _.value = [], await M("read", async () => {
        const o = await C("read.run", {});
        _.value = o.failed || [], u.success(s.t("精读完成 {n} 篇", { n: o.done }));
      });
    }
    async function B(o) {
      _.value = [], await M("read", async () => {
        const E = await C("read.run", { ids: [o] });
        _.value = E.failed || [], E.done && !v.value.includes(o) && (v.value = [...v.value, o]);
      }) || u.error(f.value.read);
    }
    async function q(o, b, E) {
      if ((E || "") !== b)
        try {
          await C("library.note", { id: o, note: b }), await I();
        } catch (K) {
          u.error(D.errorMessage(K));
        }
    }
    async function i(o, b) {
      if (window.confirm(s.t("从文献库删除 [{n}]？后面文献的编号会前移，稿子里的引用会同步改。", { n: b })))
        try {
          await C("library.remove", { id: o }), await I();
        } catch (E) {
          u.error(D.errorMessage(E));
        }
    }
    async function n() {
      await M("doi", () => C("library.checkDoi"));
    }
    async function t() {
      await M("doi", async () => {
        const b = await C("export", { format: "bib" });
        await C("path.open", { path: b.path, reveal: !0 });
      }) || u.error(f.value.doi);
    }
    async function l(o) {
      try {
        await se(o) || u.error(s.t("内置浏览器不可用"));
      } catch (b) {
        u.error(D.errorMessage(b));
      }
    }
    function r(o) {
      D.scrollToStep(o);
    }
    return (o, b) => (e.openBlock(), e.createElementBlock("div", gt, [
      e.createElementVNode("section", Et, [
        e.createElementVNode("div", ft, [
          e.createElementVNode("strong", null, [
            b[1] || (b[1] = e.createElementVNode(
              "i",
              { class: "ri-book-shelf-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(o.$t("文献库与精读")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            Vt,
            e.toDisplayString(o.$t("写作时用每篇前面的编号 [n] 引用；只有库里的文献能被引用。")),
            1
            /* TEXT */
          )
        ])
      ]),
      m.value.length ? (e.openBlock(), e.createElementBlock(
        e.Fragment,
        { key: 1 },
        [
          e.createVNode(G, {
            title: o.$t("文献库与精读"),
            metas: T,
            runtime: A.value,
            "current-key": L.value,
            onJump: r
          }, null, 8, ["title", "runtime", "current-key"]),
          e.unref(x).read || e.unref(x).library ? (e.openBlock(), e.createElementBlock("p", bt, [
            b[3] || (b[3] = e.createElementVNode(
              "i",
              { class: "ri-loader-4-line spin" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(e.unref(x).read || e.unref(x).library),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0),
          e.createElementVNode("div", $t, [
            e.createCommentVNode(" ① 文献库 "),
            e.createVNode(W, {
              "step-key": "list",
              index: 0,
              title: T[0].title,
              hint: T[0].hint,
              runtime: A.value.list
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("ul", wt, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(m.value, (E, K) => (e.openBlock(), e.createElementBlock("li", {
                      key: E.id
                    }, [
                      e.createElementVNode("div", _t, [
                        e.createElementVNode(
                          "span",
                          St,
                          "[" + e.toDisplayString(K + 1) + "]",
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "aw-title",
                          onClick: (P) => $(E.id)
                        }, e.toDisplayString(E.title), 9, Dt)
                      ]),
                      e.createElementVNode("div", Ct, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(e.unref(ae)(E)),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(E.foundIn || [E.source], (P) => (e.openBlock(), e.createElementBlock(
                            "em",
                            {
                              key: P,
                              class: "ss-chip"
                            },
                            e.toDisplayString(e.unref(X)(P)),
                            1
                            /* TEXT */
                          ))),
                          128
                          /* KEYED_FRAGMENT */
                        )),
                        E.citedBy != null ? (e.openBlock(), e.createElementBlock(
                          "em",
                          Bt,
                          e.toDisplayString(o.$t("被引 {n}", { n: E.citedBy })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        E.doi ? (e.openBlock(), e.createElementBlock("span", Tt, [
                          e.createTextVNode(
                            "DOI " + e.toDisplayString(E.doi) + " ",
                            1
                            /* TEXT */
                          ),
                          E.doiCheck === "ok" ? (e.openBlock(), e.createElementBlock("em", Lt, "✓")) : E.doiCheck === "missing" ? (e.openBlock(), e.createElementBlock(
                            "em",
                            At,
                            e.toDisplayString(o.$t("Crossref 查不到")),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ])) : e.createCommentVNode("v-if", !0),
                        E.summary ? (e.openBlock(), e.createElementBlock(
                          "em",
                          Mt,
                          e.toDisplayString(o.$t("已精读")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        E.url ? (e.openBlock(), e.createElementBlock("button", {
                          key: 3,
                          type: "button",
                          class: "ss-link",
                          onClick: (P) => l(E.url)
                        }, e.toDisplayString(o.$t("打开网页")), 9, Ot)) : e.createCommentVNode("v-if", !0),
                        E.pdfUrl ? (e.openBlock(), e.createElementBlock("button", {
                          key: 4,
                          type: "button",
                          class: "ss-link",
                          onClick: (P) => l(E.pdfUrl)
                        }, "PDF", 8, It)) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          disabled: !!a.value,
                          onClick: (P) => B(E.id)
                        }, e.toDisplayString(E.summary ? o.$t("重读") : o.$t("精读")), 9, Wt),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link aw-danger",
                          onClick: (P) => i(E.id, K + 1)
                        }, e.toDisplayString(o.$t("删除")), 9, qt)
                      ]),
                      e.createElementVNode("input", {
                        class: "aw-note",
                        type: "text",
                        value: E.note || "",
                        placeholder: o.$t("备注（可选）"),
                        onBlur: (P) => q(E.id, P.target.value, E.note)
                      }, null, 40, Pt),
                      v.value.includes(E.id) ? (e.openBlock(), e.createElementBlock("div", Kt, [
                        E.summary ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createElementVNode("div", xt, [
                              e.createElementVNode("div", null, [
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(o.$t("研究问题")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "p",
                                  null,
                                  e.toDisplayString(E.summary.question),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              e.createElementVNode("div", null, [
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(o.$t("方法")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "p",
                                  null,
                                  e.toDisplayString(E.summary.method),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              e.createElementVNode("div", null, [
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(o.$t("主要发现")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "p",
                                  null,
                                  e.toDisplayString(E.summary.findings),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              e.createElementVNode("div", null, [
                                e.createElementVNode(
                                  "small",
                                  null,
                                  e.toDisplayString(o.$t("局限")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "p",
                                  null,
                                  e.toDisplayString(E.summary.limitations),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ]),
                            E.summary.quotes.length ? (e.openBlock(), e.createElementBlock("ul", zt, [
                              (e.openBlock(!0), e.createElementBlock(
                                e.Fragment,
                                null,
                                e.renderList(E.summary.quotes, (P, Z) => (e.openBlock(), e.createElementBlock(
                                  "li",
                                  {
                                    key: Z,
                                    class: e.normalizeClass({ unverified: !P.verified })
                                  },
                                  [
                                    e.createElementVNode(
                                      "span",
                                      {
                                        class: e.normalizeClass(["ss-chip", P.verified ? "ok" : ""])
                                      },
                                      e.toDisplayString(P.verified ? o.$t("✓ 已在摘要中核实") : o.$t("未在摘要中找到")),
                                      3
                                      /* TEXT, CLASS */
                                    ),
                                    e.createElementVNode(
                                      "span",
                                      null,
                                      e.toDisplayString(o.$t("「{p0}」", { p0: P.quote })),
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
                            ])) : e.createCommentVNode("v-if", !0),
                            e.createElementVNode(
                              "p",
                              Ft,
                              e.toDisplayString(o.$t("由 {p0} 精读", { p0: E.summary.model })),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode(
                          "p",
                          jt,
                          e.toDisplayString(E.abstract || o.$t("这条没有摘要")),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createCommentVNode(" ② 精读 "),
            e.createVNode(W, {
              "step-key": "read",
              index: 1,
              title: T[1].title,
              hint: T[1].hint,
              runtime: A.value.read
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Ut, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!a.value || !N.value.length,
                    onClick: k
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(a.value === "read" ? "ri-loader-4-line spin" : "ri-book-open-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("精读全部未读的（{n}）", { n: N.value.length })),
                      1
                      /* TEXT */
                    )
                  ], 8, Rt),
                  e.createElementVNode(
                    "span",
                    Xt,
                    e.toDisplayString(o.$t("每篇提炼问题、方法、发现、局限，依据句回摘要核对；点标题展开看结果")),
                    1
                    /* TEXT */
                  )
                ]),
                _.value.length ? (e.openBlock(), e.createElementBlock("ul", Gt, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(_.value, (E, K) => (e.openBlock(), e.createElementBlock("li", { key: K }, [
                      b[4] || (b[4] = e.createElementVNode(
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
                  ))
                ])) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createCommentVNode(" ③ 查验 DOI 与导出 "),
            e.createVNode(W, {
              "step-key": "doi",
              index: 2,
              title: T[2].title,
              hint: T[2].hint,
              runtime: A.value.doi
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Jt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!a.value || !d.value.length,
                    onClick: n
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(a.value === "doi" ? "ri-loader-4-line spin" : "ri-shield-check-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("查验 DOI（{n}）", { n: d.value.length })),
                      1
                      /* TEXT */
                    )
                  ], 8, Zt),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost",
                    disabled: !!a.value,
                    onClick: t
                  }, [
                    b[5] || (b[5] = e.createElementVNode(
                      "i",
                      { class: "ri-download-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(o.$t("导出 BibTeX")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ht)
                ]),
                w.value ? (e.openBlock(), e.createElementBlock(
                  "p",
                  Qt,
                  e.toDisplayString(o.$t("Crossref 查到 {a} 篇，查不到 {b} 篇", { a: g.value, b: h.value })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : (e.openBlock(), e.createElementBlock("p", Nt, [
        b[2] || (b[2] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(o.$t("文献库还是空的，先去「文献检索」挑文献。")) + " ",
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: b[0] || (b[0] = (E) => o.$emit("goto", "search"))
          },
          e.toDisplayString(o.$t("去文献检索")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), el = /* @__PURE__ */ j(Yt, [["__scopeId", "data-v-2b8592db"]]), tl = { class: "ss-module" }, ll = { class: "ss-panel aw-head" }, nl = { class: "ss-muted" }, ol = { class: "ss-steps" }, sl = {
  key: 0,
  class: "ss-note warn"
}, al = { class: "ss-actions" }, rl = ["disabled"], il = {
  key: 0,
  class: "ss-muted"
}, cl = {
  key: 1,
  class: "ss-muted"
}, dl = {
  key: 0,
  class: "ss-empty"
}, ul = { class: "aw-sec__head" }, ml = { class: "ss-chip brand" }, pl = ["onUpdate:modelValue", "placeholder"], vl = ["disabled", "title", "onClick"], yl = ["disabled", "title", "onClick"], hl = ["title", "onClick"], kl = { class: "ss-field" }, gl = ["value", "onInput"], El = { class: "aw-cites" }, fl = { class: "ss-muted" }, Vl = ["title", "onClick"], Nl = { class: "ss-actions" }, bl = ["disabled"], $l = {
  key: 0,
  class: "ss-muted"
}, wl = { class: "ss-actions" }, _l = ["disabled"], Sl = {
  key: 0,
  class: "ss-muted"
}, Dl = /* @__PURE__ */ e.defineComponent({
  __name: "OutlineTab",
  emits: ["goto"],
  setup(V) {
    const u = F.useNotificationStore(), y = e.computed(() => (z.value, U())), m = e.computed(() => y.value?.library || []), N = e.computed(() => m.value.length), d = e.computed(() => y.value?.outline || []), w = e.ref([]), g = e.ref(!1), h = e.ref(""), v = e.ref({});
    e.watch(d, (n) => {
      g.value || (w.value = n.map((t) => ({ ...t, points: [...t.points], cites: [...t.cites] })));
    }, { immediate: !0, deep: !0 });
    const a = [
      { key: "generate", title: s.t("生成提纲"), hint: s.t("按论文类型和文献库拟各节标题、要点与引用") },
      { key: "edit", title: s.t("修改提纲"), hint: s.t("改标题、要点，勾选每节要引用的文献") },
      { key: "next", title: s.t("去写作"), hint: s.t("按提纲分节成稿") }
    ], f = e.computed(() => {
      const n = (t, l, r) => h.value === t ? { state: "running" } : v.value[t] ? { state: "failed", error: v.value[t] } : l ? { state: "done", summary: r } : { state: "todo" };
      return {
        generate: n("generate", d.value.length > 0, s.t("{n} 节", { n: d.value.length })),
        edit: n("edit", d.value.length > 0 && !g.value, s.t("已保存")),
        next: n("next", (y.value?.sections.length || 0) > 0, s.t("已开始写作"))
      };
    }), _ = e.computed(() => a.find((n) => f.value[n.key].state !== "done")?.key || "next");
    async function T(n, t) {
      h.value = n, v.value = { ...v.value, [n]: "" };
      try {
        return await t(), await I(), !0;
      } catch (l) {
        return v.value = { ...v.value, [n]: D.errorMessage(l) }, !1;
      } finally {
        h.value = "";
      }
    }
    async function A() {
      d.value.length && !window.confirm(s.t("重新生成会覆盖当前提纲，继续？")) || (g.value = !1, await T("generate", () => C("outline.generate")));
    }
    async function L() {
      await T("edit", () => C("outline.save", { outline: w.value })) && (g.value = !1, u.success(s.t("提纲已保存")));
    }
    function M(n, t) {
      n.points = t.split(`
`).map((l) => l.trim()).filter(Boolean), g.value = !0;
    }
    function $(n, t) {
      n.cites = n.cites.includes(t) ? n.cites.filter((l) => l !== t) : [...n.cites, t], g.value = !0;
    }
    function k(n, t) {
      const l = [...w.value];
      [l[n], l[n + t]] = [l[n + t], l[n]], w.value = l, g.value = !0;
    }
    function B(n) {
      w.value = w.value.filter((t, l) => l !== n), g.value = !0;
    }
    function q() {
      w.value = [...w.value, { id: "", heading: "", points: [], cites: [] }], g.value = !0;
    }
    function i(n) {
      D.scrollToStep(n);
    }
    return (n, t) => (e.openBlock(), e.createElementBlock("div", tl, [
      e.createElementVNode("section", ll, [
        e.createElementVNode("div", null, [
          e.createElementVNode("strong", null, [
            t[3] || (t[3] = e.createElementVNode(
              "i",
              { class: "ri-list-ordered-2" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(n.$t("提纲")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "p",
            nl,
            e.toDisplayString(n.$t("只依据文献库里的文献拟提纲；每节标出要引用的文献，写作时模型只能引用这些。")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createVNode(G, {
        title: n.$t("提纲"),
        metas: a,
        runtime: f.value,
        "current-key": _.value,
        onJump: i
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", ol, [
        e.createVNode(W, {
          "step-key": "generate",
          index: 0,
          title: a[0].title,
          hint: a[0].hint,
          runtime: f.value.generate
        }, {
          default: e.withCtx(() => [
            N.value < 3 ? (e.openBlock(), e.createElementBlock("p", sl, [
              t[4] || (t[4] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("文献库只有 {n} 篇，至少 3 篇才能拟提纲。", { n: N.value })) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: t[0] || (t[0] = (l) => n.$emit("goto", "search"))
                },
                e.toDisplayString(n.$t("去检索")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", al, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: N.value < 3 || !!h.value,
                onClick: A
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(h.value === "generate" ? "ri-loader-4-line spin" : "ri-magic-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(d.value.length ? n.$t("重新生成提纲") : n.$t("生成提纲")),
                  1
                  /* TEXT */
                )
              ], 8, rl),
              y.value?.outlineModel ? (e.openBlock(), e.createElementBlock(
                "span",
                il,
                e.toDisplayString(n.$t("由 {p0} 生成", { p0: y.value.outlineModel })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            d.value.length ? (e.openBlock(), e.createElementBlock(
              "p",
              cl,
              e.toDisplayString(n.$t("重新生成会覆盖下面的提纲（已写的正文不受影响）。")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(W, {
          "step-key": "edit",
          index: 1,
          title: a[1].title,
          hint: a[1].hint,
          runtime: f.value.edit
        }, {
          default: e.withCtx(() => [
            w.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "div",
              dl,
              e.toDisplayString(n.$t("还没有提纲：先生成，或手动新增一节。")),
              1
              /* TEXT */
            )),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(w.value, (l, r) => (e.openBlock(), e.createElementBlock("div", {
                key: l.id,
                class: "aw-sec"
              }, [
                e.createElementVNode("div", ul, [
                  e.createElementVNode(
                    "span",
                    ml,
                    e.toDisplayString(r + 1),
                    1
                    /* TEXT */
                  ),
                  e.withDirectives(e.createElementVNode("input", {
                    "onUpdate:modelValue": (o) => l.heading = o,
                    type: "text",
                    class: "aw-sec__title",
                    placeholder: n.$t("节标题"),
                    onInput: t[1] || (t[1] = (o) => g.value = !0)
                  }, null, 40, pl), [
                    [e.vModelText, l.heading]
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    disabled: r === 0,
                    title: n.$t("上移"),
                    onClick: (o) => k(r, -1)
                  }, [...t[5] || (t[5] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-arrow-up-line" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, vl),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    disabled: r === w.value.length - 1,
                    title: n.$t("下移"),
                    onClick: (o) => k(r, 1)
                  }, [...t[6] || (t[6] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-arrow-down-line" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, yl),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    title: n.$t("删除这一节"),
                    onClick: (o) => B(r)
                  }, [...t[7] || (t[7] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-delete-bin-line" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, hl)
                ]),
                e.createElementVNode("label", kl, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(n.$t("要点（一行一条）")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("textarea", {
                    value: l.points.join(`
`),
                    rows: "3",
                    onInput: (o) => M(l, o.target.value)
                  }, null, 40, gl)
                ]),
                e.createElementVNode("div", El, [
                  e.createElementVNode(
                    "span",
                    fl,
                    e.toDisplayString(n.$t("本节引用：")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(m.value, (o, b) => (e.openBlock(), e.createElementBlock("button", {
                      key: o.id,
                      type: "button",
                      class: e.normalizeClass(["aw-cite", { on: l.cites.includes(o.id) }]),
                      title: o.title,
                      onClick: (E) => $(l, o.id)
                    }, "[" + e.toDisplayString(b + 1) + "] " + e.toDisplayString(o.title.slice(0, 28)) + e.toDisplayString(o.title.length > 28 ? "…" : ""), 11, Vl))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            e.createElementVNode("div", Nl, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                onClick: q
              }, [
                t[8] || (t[8] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("新增一节")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !g.value || !!h.value,
                onClick: L
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(h.value === "edit" ? "ri-loader-4-line spin" : "ri-save-3-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(n.$t("保存提纲")),
                  1
                  /* TEXT */
                )
              ], 8, bl),
              g.value ? (e.openBlock(), e.createElementBlock(
                "span",
                $l,
                e.toDisplayString(n.$t("有未保存的修改")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(W, {
          "step-key": "next",
          index: 2,
          title: a[2].title,
          hint: a[2].hint,
          runtime: f.value.next
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", wl, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !d.value.length || g.value,
                onClick: t[2] || (t[2] = (l) => n.$emit("goto", "write"))
              }, [
                t[9] || (t[9] = e.createElementVNode(
                  "i",
                  { class: "ri-quill-pen-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(n.$t("去写作")),
                  1
                  /* TEXT */
                )
              ], 8, _l),
              g.value ? (e.openBlock(), e.createElementBlock(
                "span",
                Sl,
                e.toDisplayString(n.$t("先保存提纲")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), Cl = /* @__PURE__ */ j(Dl, [["__scopeId", "data-v-19f3cc6b"]]), Bl = { class: "ss-module" }, Tl = { class: "ss-panel aw-head" }, Ll = { class: "ss-muted" }, Al = {
  key: 0,
  class: "ss-note info"
}, Ml = { class: "ss-steps" }, Ol = {
  key: 0,
  class: "ss-note warn"
}, Il = {
  key: 1,
  class: "ss-actions"
}, Wl = ["disabled"], ql = { class: "ss-muted" }, Pl = { class: "aw-sec__head" }, Kl = { class: "ss-chip brand" }, xl = { class: "aw-grow" }, zl = {
  key: 0,
  class: "ss-muted"
}, Fl = ["disabled", "onClick"], jl = {
  key: 0,
  class: "ss-note danger"
}, Ul = {
  key: 0,
  class: "ss-note danger"
}, Rl = ["value", "onBlur"], Xl = { class: "ss-note info" }, Gl = { class: "ss-actions" }, Jl = ["disabled"], Zl = ["disabled"], Hl = {
  key: 0,
  class: "ss-note danger"
}, Ql = {
  key: 1,
  class: "ss-note ok aw-ms"
}, Yl = { class: "ss-actions" }, en = ["disabled"], tn = /* @__PURE__ */ e.defineComponent({
  __name: "WriteTab",
  emits: ["goto"],
  setup(V) {
    const u = F.useNotificationStore(), y = e.computed(() => (z.value, U())), m = e.computed(() => y.value?.outline || []), N = e.computed(() => y.value?.sections || []), d = (t) => N.value.find((l) => l.id === t), w = e.computed(() => m.value.filter((t) => !d(t.id)?.text.trim())), g = e.computed(() => N.value.some((t) => t.text.trim()) || !!y.value?.manuscript), h = e.ref(""), v = e.ref({}), a = e.ref(!1), f = e.computed(() => {
      const t = y.value?.manuscript || "";
      return (t.match(/[一-鿿]/g) || []).length + (t.replace(/[一-鿿]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
    }), _ = [
      { key: "sections", title: s.t("分节写初稿"), hint: s.t("每节只引用提纲里勾选的文献，库外编号会被标红") },
      { key: "cowrite", title: s.t("人机双写"), hint: s.t("送进双写编辑器由你改，改完取回") },
      { key: "next", title: s.t("查验与导出"), hint: s.t("引用查验、参考文献、导出 Word") }
    ], T = e.computed(() => {
      const t = (l, r, o) => h.value === l || l === "sections" && h.value && h.value !== "cowrite" && h.value !== "pull" ? { state: "running" } : v.value[l] ? { state: "failed", error: v.value[l] } : r ? { state: "done", summary: o } : { state: "todo" };
      return {
        sections: t("sections", m.value.length > 0 && !w.value.length, s.t("{n} 节已写", { n: m.value.length })),
        cowrite: t("cowrite", !!y.value?.manuscript || a.value, y.value?.manuscript ? s.t("已取回") : s.t("已送进编辑器")),
        next: t("next", (y.value?.exports.length || 0) > 0, s.t("已导出"))
      };
    }), A = e.computed(() => _.find((t) => T.value[t.key].state !== "done")?.key || "next");
    async function L(t, l = t) {
      h.value = l, v.value = { ...v.value, [t]: "" };
      try {
        return await C("write.section", { outlineId: t }), await I(), !0;
      } catch (r) {
        return v.value = { ...v.value, [t]: D.errorMessage(r) }, !1;
      } finally {
        l === t && (h.value = "");
      }
    }
    async function M() {
      const t = w.value.map((l) => l.id);
      h.value = "all";
      try {
        for (const l of t)
          if (!await L(l, "all")) break;
      } finally {
        h.value = "";
      }
    }
    async function $(t, l) {
      if (d(t)?.text !== l)
        try {
          await C("sections.save", { id: t, text: l }), await I();
        } catch (r) {
          u.error(D.errorMessage(r));
        }
    }
    async function k() {
      if (!(y.value?.manuscript && !window.confirm(s.t("会把当前稿子作为新文档载入双写编辑器，编辑器里没取回的修改会被替换。继续？")))) {
        h.value = "cowrite", v.value = { ...v.value, cowrite: "" };
        try {
          const t = await C("manuscript.compose");
          await re(y.value.title, t), a.value = !0, u.success(s.t("已载入人机双写编辑器，改完回来点「从双写编辑器取回」"));
        } catch (t) {
          v.value = { ...v.value, cowrite: q(t) };
        } finally {
          h.value = "";
        }
      }
    }
    async function B() {
      h.value = "pull", v.value = { ...v.value, cowrite: "" };
      try {
        const t = await ke(), l = await C("manuscript.save", { text: t });
        await I(), u.success(s.t("已取回 {n} 字", { n: l.words }));
      } catch (t) {
        v.value = { ...v.value, cowrite: q(t) };
      } finally {
        h.value = "";
      }
    }
    function q(t) {
      const l = D.errorMessage(t);
      return /EDITION_BLOCKED|human_handback|not enabled|未开通|版本/i.test(l) ? s.t("当前版本没有开通人机双写（企业旗舰版能力），可以先导出 Word 再用本机软件修改") : l;
    }
    async function i() {
      if (window.confirm(s.t("放弃从双写编辑器取回的版本，改回按节拼接？")))
        try {
          await C("manuscript.reset"), await I();
        } catch (t) {
          u.error(D.errorMessage(t));
        }
    }
    function n(t) {
      D.scrollToStep(t);
    }
    return (t, l) => (e.openBlock(), e.createElementBlock("div", Bl, [
      e.createElementVNode("section", Tl, [
        e.createElementVNode("div", null, [
          e.createElementVNode("strong", null, [
            l[2] || (l[2] = e.createElementVNode(
              "i",
              { class: "ri-quill-pen-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(t.$t("写作与双写")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "p",
            Ll,
            e.toDisplayString(t.$t("按提纲逐节写初稿，引用只能用文献库编号；写完送进人机双写编辑器，由你逐句改定。")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createVNode(G, {
        title: t.$t("写作与双写"),
        metas: _,
        runtime: T.value,
        "current-key": A.value,
        onJump: n
      }, null, 8, ["title", "runtime", "current-key"]),
      h.value && e.unref(x).write ? (e.openBlock(), e.createElementBlock("p", Al, [
        l[3] || (l[3] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(e.unref(x).write),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", Ml, [
        e.createVNode(W, {
          "step-key": "sections",
          index: 0,
          title: _[0].title,
          hint: _[0].hint,
          runtime: T.value.sections
        }, {
          default: e.withCtx(() => [
            m.value.length ? (e.openBlock(), e.createElementBlock("div", Il, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!h.value || !w.value.length,
                onClick: M
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(h.value === "all" ? "ri-loader-4-line spin" : "ri-play-list-add-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("依次写完未写的节（{n}）", { n: w.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, Wl),
              e.createElementVNode(
                "span",
                ql,
                e.toDisplayString(t.$t("已写 {a}/{b} 节", { a: m.value.length - w.value.length, b: m.value.length })),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock("p", Ol, [
              l[4] || (l[4] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("还没有提纲。")) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: l[0] || (l[0] = (r) => t.$emit("goto", "outline"))
                },
                e.toDisplayString(t.$t("去拟提纲")),
                1
                /* TEXT */
              )
            ])),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(m.value, (r, o) => (e.openBlock(), e.createElementBlock("div", {
                key: r.id,
                class: "aw-sec"
              }, [
                e.createElementVNode("div", Pl, [
                  e.createElementVNode(
                    "span",
                    Kl,
                    e.toDisplayString(o + 1),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    xl,
                    e.toDisplayString(r.heading),
                    1
                    /* TEXT */
                  ),
                  d(r.id)?.model ? (e.openBlock(), e.createElementBlock(
                    "span",
                    zl,
                    e.toDisplayString(t.$t("由 {p0} 写", { p0: d(r.id).model })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("button", {
                    type: "button",
                    class: e.normalizeClass(["ss-btn sm", d(r.id) ? "ghost" : "primary"]),
                    disabled: !!h.value,
                    onClick: (b) => L(r.id)
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(h.value === r.id ? "ri-loader-4-line spin" : "ri-edit-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(d(r.id) ? t.$t("重写") : t.$t("写这一节")),
                      1
                      /* TEXT */
                    )
                  ], 10, Fl)
                ]),
                v.value[r.id] ? (e.openBlock(), e.createElementBlock("p", jl, [
                  l[5] || (l[5] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(v.value[r.id]),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0),
                d(r.id) ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 1 },
                  [
                    d(r.id).badRefs.length ? (e.openBlock(), e.createElementBlock("p", Ul, [
                      l[6] || (l[6] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("引用了文献库里没有的编号：{p0}，请改成库里的编号或删掉", { p0: d(r.id).badRefs.map((b) => `[${b}]`).join(" ") })),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode("textarea", {
                      class: "aw-text",
                      value: d(r.id).text,
                      rows: "10",
                      dir: "auto",
                      onBlur: (b) => $(r.id, b.target.value)
                    }, null, 40, Rl)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : e.createCommentVNode("v-if", !0)
              ]))),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(W, {
          "step-key": "cowrite",
          index: 1,
          title: _[1].title,
          hint: _[1].hint,
          runtime: T.value.cowrite
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", Xl, [
              l[7] || (l[7] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(t.$t("引用保留文献库编号 [n]，导出时自动按格式重排；在编辑器里改的时候别动方括号里的编号。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", Gl, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!h.value || !g.value,
                onClick: k
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(h.value === "cowrite" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("在人机双写编辑器中打开")),
                  1
                  /* TEXT */
                )
              ], 8, Jl),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                disabled: !!h.value,
                onClick: B
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(h.value === "pull" ? "ri-loader-4-line spin" : "ri-download-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(t.$t("从双写编辑器取回")),
                  1
                  /* TEXT */
                )
              ], 8, Zl)
            ]),
            v.value.cowrite ? (e.openBlock(), e.createElementBlock("p", Hl, [
              l[8] || (l[8] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(v.value.cowrite),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            y.value?.manuscript ? (e.openBlock(), e.createElementBlock("div", Ql, [
              l[9] || (l[9] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(t.$t("当前以双写编辑器取回的版本为准（{p0}，{n} 字）", { p0: e.unref(D.fmtDateTime)(y.value.manuscriptAt), n: f.value })),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: i
                },
                e.toDisplayString(t.$t("放弃，改回按节拼接")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(W, {
          "step-key": "next",
          index: 2,
          title: _[2].title,
          hint: _[2].hint,
          runtime: T.value.next
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Yl, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !g.value,
                onClick: l[1] || (l[1] = (r) => t.$emit("goto", "export"))
              }, [
                l[10] || (l[10] = e.createElementVNode(
                  "i",
                  { class: "ri-file-word-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("去查验与导出")),
                  1
                  /* TEXT */
                )
              ], 8, en)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), ln = /* @__PURE__ */ j(tn, [["__scopeId", "data-v-66032d16"]]), Y = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/markdown.ts"];
if (!Y) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/markdown.ts");
Y.default;
const nn = {
  class: "awv",
  role: "dialog",
  "aria-modal": "true"
}, on = { class: "awv-bar" }, sn = ["aria-expanded"], an = {
  key: 0,
  class: "awv-menu",
  role: "menu"
}, rn = { class: "awv-menu__title" }, cn = {
  key: 0,
  class: "awv-menu awv-menu--sub",
  role: "menu"
}, dn = {
  key: 0,
  class: "awv-muted"
}, un = ["onClick"], mn = ["src"], pn = {
  key: 1,
  class: "ri-apps-line"
}, vn = {
  key: 2,
  class: "awv-default"
}, yn = {
  key: 1,
  class: "awv-muted"
}, hn = {
  key: 0,
  class: "awv-error"
}, kn = ["title"], gn = ["innerHTML"], En = /* @__PURE__ */ e.defineComponent({
  __name: "DocViewer",
  props: {
    path: {},
    markdown: {}
  },
  emits: ["close", "cowrite"],
  setup(V) {
    const u = V, y = e.computed(() => u.path.split(/[\\/]/).pop() || u.path), m = e.computed(() => /\.docx?$/i.test(u.path) ? "ri-file-word-2-line" : /\.bib$/i.test(u.path) ? "ri-book-2-line" : "ri-markdown-line"), N = e.computed(() => Y.renderMarkdown(u.markdown)), d = e.ref(!1), w = e.ref(!1), g = e.ref([]), h = e.ref(!1), v = e.ref(""), a = e.ref(null);
    async function f() {
      if (d.value = !d.value, d.value && !g.value.length && !h.value) {
        h.value = !0;
        try {
          g.value = await C("openIn.apps", { path: u.path });
        } catch ($) {
          v.value = D.errorMessage($);
        } finally {
          h.value = !1;
        }
      }
    }
    async function _($) {
      v.value = "";
      try {
        await $(), d.value = !1;
      } catch (k) {
        v.value = D.errorMessage(k);
      }
    }
    const T = ($) => _(() => C("openIn.open", { path: u.path, appPath: $ })), A = () => _(() => C("openIn.choose", { path: u.path })), L = () => _(() => C("path.open", { path: u.path, reveal: !0 }));
    function M($) {
      d.value && a.value && !a.value.contains($.target) && (d.value = !1);
    }
    return e.onMounted(() => document.addEventListener("mousedown", M)), e.onBeforeUnmount(() => document.removeEventListener("mousedown", M)), ($, k) => (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
      e.createElementVNode("div", {
        class: "awv-backdrop",
        onClick: k[5] || (k[5] = e.withModifiers((B) => $.$emit("close"), ["self"]))
      }, [
        e.createElementVNode("section", nn, [
          e.createElementVNode("header", on, [
            e.createElementVNode(
              "div",
              {
                ref_key: "menuRef",
                ref: a,
                class: "awv-file"
              },
              [
                e.createElementVNode("button", {
                  type: "button",
                  class: "awv-file__btn",
                  "aria-expanded": d.value,
                  onClick: f
                }, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(m.value)
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(y.value),
                    1
                    /* TEXT */
                  ),
                  k[6] || (k[6] = e.createElementVNode(
                    "i",
                    { class: "ri-arrow-down-s-line" },
                    null,
                    -1
                    /* CACHED */
                  ))
                ], 8, sn),
                d.value ? (e.openBlock(), e.createElementBlock("div", an, [
                  e.createElementVNode("div", rn, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(m.value)
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(y.value),
                      1
                      /* TEXT */
                    )
                  ]),
                  k[14] || (k[14] = e.createElementVNode(
                    "div",
                    { class: "awv-menu__sep" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "div",
                    {
                      class: "awv-sub",
                      onMouseenter: k[1] || (k[1] = (B) => w.value = !0),
                      onMouseleave: k[2] || (k[2] = (B) => w.value = !1)
                    },
                    [
                      e.createElementVNode("button", {
                        type: "button",
                        role: "menuitem",
                        class: "awv-item",
                        onClick: k[0] || (k[0] = (B) => w.value = !w.value)
                      }, [
                        k[7] || (k[7] = e.createElementVNode(
                          "i",
                          { class: "ri-arrow-right-up-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString($.$t("打开方式")),
                          1
                          /* TEXT */
                        ),
                        k[8] || (k[8] = e.createElementVNode(
                          "i",
                          { class: "ri-arrow-right-s-line awv-grow" },
                          null,
                          -1
                          /* CACHED */
                        ))
                      ]),
                      w.value ? (e.openBlock(), e.createElementBlock("div", cn, [
                        h.value ? (e.openBlock(), e.createElementBlock("p", dn, [
                          k[9] || (k[9] = e.createElementVNode(
                            "i",
                            { class: "ri-loader-4-line spin" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString($.$t("正在查找本机应用…")),
                            1
                            /* TEXT */
                          )
                        ])) : e.createCommentVNode("v-if", !0),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(g.value, (B) => (e.openBlock(), e.createElementBlock("button", {
                            key: B.path,
                            type: "button",
                            role: "menuitem",
                            class: "awv-item",
                            onClick: (q) => T(B.path)
                          }, [
                            B.icon ? (e.openBlock(), e.createElementBlock("img", {
                              key: 0,
                              src: B.icon,
                              alt: "",
                              class: "awv-appicon"
                            }, null, 8, mn)) : (e.openBlock(), e.createElementBlock("i", pn)),
                            e.createElementVNode(
                              "span",
                              null,
                              e.toDisplayString(B.name),
                              1
                              /* TEXT */
                            ),
                            B.isDefault ? (e.openBlock(), e.createElementBlock(
                              "em",
                              vn,
                              e.toDisplayString($.$t("默认")),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ], 8, un))),
                          128
                          /* KEYED_FRAGMENT */
                        )),
                        !h.value && !g.value.length ? (e.openBlock(), e.createElementBlock(
                          "p",
                          yn,
                          e.toDisplayString($.$t("没有找到能打开它的应用")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        k[12] || (k[12] = e.createElementVNode(
                          "div",
                          { class: "awv-menu__sep" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createElementVNode("button", {
                          type: "button",
                          role: "menuitem",
                          class: "awv-item",
                          onClick: A
                        }, [
                          k[10] || (k[10] = e.createElementVNode(
                            "i",
                            { class: "ri-apps-2-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString($.$t("选择其他应用…")),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("button", {
                          type: "button",
                          role: "menuitem",
                          class: "awv-item",
                          onClick: L
                        }, [
                          k[11] || (k[11] = e.createElementVNode(
                            "i",
                            { class: "ri-folder-open-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString($.$t("打开所在文件夹")),
                            1
                            /* TEXT */
                          )
                        ])
                      ])) : e.createCommentVNode("v-if", !0)
                    ],
                    32
                    /* NEED_HYDRATION */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    role: "menuitem",
                    class: "awv-item",
                    onClick: k[3] || (k[3] = (B) => {
                      $.$emit("cowrite"), d.value = !1;
                    })
                  }, [
                    k[13] || (k[13] = e.createElementVNode(
                      "i",
                      { class: "ri-quill-pen-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString($.$t("在人机双写编辑器中打开")),
                      1
                      /* TEXT */
                    )
                  ])
                ])) : e.createCommentVNode("v-if", !0)
              ],
              512
              /* NEED_PATCH */
            ),
            k[16] || (k[16] = e.createElementVNode(
              "span",
              { class: "awv-grow" },
              null,
              -1
              /* CACHED */
            )),
            v.value ? (e.openBlock(), e.createElementBlock(
              "span",
              hn,
              e.toDisplayString(v.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "awv-icon",
              title: $.$t("关闭"),
              onClick: k[4] || (k[4] = (B) => $.$emit("close"))
            }, [...k[15] || (k[15] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, kn)
          ]),
          e.createCommentVNode(" eslint-disable-next-line vue/no-v-html "),
          e.createElementVNode("article", {
            class: "awv-paper",
            dir: "auto",
            innerHTML: N.value
          }, null, 8, gn)
        ])
      ])
    ]));
  }
}), fn = /* @__PURE__ */ j(En, [["__scopeId", "data-v-ba580a58"]]), Vn = { class: "ss-module" }, Nn = { class: "ss-note warn" }, bn = { class: "ss-steps" }, $n = { class: "ss-actions" }, wn = ["disabled"], _n = {
  key: 0,
  class: "ss-muted"
}, Sn = { class: "ss-kpis" }, Dn = { class: "ss-kpi" }, Cn = { class: "ss-kpi accent" }, Bn = { class: "ss-kpi" }, Tn = { class: "ss-kpi" }, Ln = {
  key: 0,
  class: "ss-note danger"
}, An = {
  key: 1,
  class: "ss-note ok"
}, Mn = {
  key: 2,
  class: "aw-list"
}, On = { class: "ss-subhead" }, In = {
  key: 3,
  class: "aw-list"
}, Wn = { class: "ss-subhead aw-bad" }, qn = { class: "ss-actions" }, Pn = { class: "ss-field aw-inline" }, Kn = ["value"], xn = { value: "gbt7714" }, zn = { value: "apa" }, Fn = { value: "ieee" }, jn = ["disabled"], Un = {
  key: 0,
  class: "aw-refs"
}, Rn = {
  key: 1,
  class: "ss-muted"
}, Xn = { class: "ss-actions" }, Gn = ["disabled"], Jn = ["disabled"], Zn = ["disabled"], Hn = { class: "ss-muted" }, Qn = {
  key: 0,
  class: "ss-empty"
}, Yn = {
  key: 1,
  class: "ss-table-wrap"
}, eo = { class: "ss-table" }, to = ["title"], lo = { class: "ss-chip" }, no = { class: "aw-ops" }, oo = ["onClick"], so = ["onClick"], ao = { class: "ss-muted" }, ro = /* @__PURE__ */ e.defineComponent({
  __name: "ExportTab",
  emits: ["goto"],
  setup(V) {
    const u = F.useNotificationStore(), y = e.computed(() => (z.value, U())), m = e.computed(() => y.value?.check || null), N = e.computed(() => y.value?.exports || []), d = e.ref([]), w = e.ref(!1), g = e.ref(""), h = e.ref({}), v = e.ref(null), a = [
      { key: "check", title: s.t("引用查验"), hint: s.t("库外编号、未被引用的文献、DOI 查不到的") },
      { key: "refs", title: s.t("参考文献"), hint: s.t("按所选格式由题录拼出，模型不参与") },
      { key: "export", title: s.t("导出"), hint: s.t("Word、Markdown、BibTeX") },
      { key: "files", title: s.t("预览与打开"), hint: s.t("内置预览，或选本机软件打开") }
    ], f = e.computed(() => {
      const l = (r, o, b) => g.value === r || r === "export" && ["docx", "md", "bib"].includes(g.value) ? { state: "running" } : h.value[r] ? { state: "failed", error: h.value[r] } : o ? { state: "done", summary: b } : { state: "todo" };
      return {
        check: l("check", !!m.value, m.value ? s.t("引用 {a} 篇，库外 {b} 处", { a: m.value.cited.length, b: m.value.badRefs.length }) : ""),
        refs: l("refs", d.value.length > 0, s.t("{n} 条", { n: d.value.length })),
        export: l("export", N.value.length > 0, s.t("{n} 个文件", { n: N.value.length })),
        files: l("files", !!v.value || N.value.length > 0, "")
      };
    }), _ = e.computed(() => a.find((l) => f.value[l.key].state !== "done")?.key || "files");
    function T(l) {
      return (y.value?.library.findIndex((r) => r.id === l) ?? -1) + 1;
    }
    function A(l) {
      return y.value?.library.find((r) => r.id === l)?.title || l;
    }
    async function L(l, r) {
      g.value = l, h.value = { ...h.value, [l === "docx" || l === "md" || l === "bib" ? "export" : l]: "" };
      try {
        return await r(), await I(), !0;
      } catch (o) {
        return h.value = { ...h.value, [l === "docx" || l === "md" || l === "bib" ? "export" : l]: D.errorMessage(o) }, !1;
      } finally {
        g.value = "";
      }
    }
    const M = () => L("check", () => C("check.run"));
    async function $() {
      await L("refs", async () => {
        d.value = await C("references.preview"), w.value = !0;
      });
    }
    async function k(l) {
      try {
        await C("project.update", { patch: { style: l } }), await I(), w.value && await $();
      } catch (r) {
        u.error(D.errorMessage(r));
      }
    }
    async function B(l) {
      let r = "";
      await L(l, async () => {
        r = (await C("export", { format: l })).path;
      }) && r && await q(r, l);
    }
    async function q(l, r) {
      try {
        const o = r === "bib" ? s.t("BibTeX 文件包含文献库全部 {n} 条题录，可导入 Zotero、EndNote、NoteExpress 等文献管理软件。用左上角「打开方式」选本机软件查看。", { n: y.value?.library.length || 0 }) : await C("manuscript.rendered");
        v.value = { path: l, markdown: o };
      } catch (o) {
        u.error(D.errorMessage(o));
      }
    }
    function i(l) {
      C("path.open", { path: l, reveal: !0 }).catch((r) => u.error(D.errorMessage(r)));
    }
    async function n() {
      try {
        await re(y.value.title, await C("manuscript.compose")), v.value = null, u.success(s.t("已载入人机双写编辑器"));
      } catch (l) {
        u.error(D.errorMessage(l));
      }
    }
    function t(l) {
      D.scrollToStep(l);
    }
    return (l, r) => (e.openBlock(), e.createElementBlock("div", Vn, [
      e.createElementVNode("p", Nn, [
        r[6] || (r[6] = e.createElementVNode(
          "i",
          { class: "ri-shield-user-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(l.$t("AI 生成的初稿需要作者逐句核对、改写；投稿时按目标期刊要求声明 AI 使用情况")),
          1
          /* TEXT */
        )
      ]),
      e.createVNode(G, {
        title: l.$t("参考文献与导出"),
        metas: a,
        runtime: f.value,
        "current-key": _.value,
        onJump: t
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", bn, [
        e.createVNode(W, {
          "step-key": "check",
          index: 0,
          title: a[0].title,
          hint: a[0].hint,
          runtime: f.value.check
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", $n, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!g.value,
                onClick: M
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(g.value === "check" ? "ri-loader-4-line spin" : "ri-search-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(m.value ? l.$t("重新查验") : l.$t("查验引用")),
                  1
                  /* TEXT */
                )
              ], 8, wn),
              m.value ? (e.openBlock(), e.createElementBlock(
                "span",
                _n,
                e.toDisplayString(e.unref(D.fmtDateTime)(m.value.at)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            m.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Sn, [
                  e.createElementVNode("div", Dn, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(l.$t("字数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(m.value.wordCount),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Cn, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(l.$t("引用文献")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(m.value.cited.length),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Bn, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(l.$t("库外编号")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      {
                        class: e.normalizeClass({ "aw-bad": m.value.badRefs.length })
                      },
                      e.toDisplayString(m.value.badRefs.length),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", Tn, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(l.$t("未被引用")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(m.value.uncited.length),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                m.value.badRefs.length ? (e.openBlock(), e.createElementBlock("p", Ln, [
                  r[7] || (r[7] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(l.$t("稿子里引用了文献库里没有的编号：{p0}。这些多半是模型编的，导出时会显示为 [?n]，请改成库里的编号或删掉。", { p0: m.value.badRefs.map((o) => `[${o}]`).join(" ") })),
                    1
                    /* TEXT */
                  )
                ])) : (e.openBlock(), e.createElementBlock("p", An, [
                  r[8] || (r[8] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(l.$t("所有引用都在文献库里")),
                    1
                    /* TEXT */
                  )
                ])),
                m.value.uncited.length ? (e.openBlock(), e.createElementBlock("div", Mn, [
                  e.createElementVNode(
                    "div",
                    On,
                    e.toDisplayString(l.$t("文献库里没被引用的（可以删掉，或在正文补上引用）")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("ul", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(m.value.uncited, (o) => (e.openBlock(), e.createElementBlock(
                        "li",
                        { key: o },
                        "[" + e.toDisplayString(T(o)) + "] " + e.toDisplayString(A(o)),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : e.createCommentVNode("v-if", !0),
                m.value.doiMissing.length ? (e.openBlock(), e.createElementBlock("div", In, [
                  e.createElementVNode(
                    "div",
                    Wn,
                    e.toDisplayString(l.$t("DOI 在 Crossref 查不到的（建议到文献库里核对这几篇是否真实）")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("ul", null, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(m.value.doiMissing, (o) => (e.openBlock(), e.createElementBlock(
                        "li",
                        { key: o },
                        "[" + e.toDisplayString(T(o)) + "] " + e.toDisplayString(A(o)),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: r[0] || (r[0] = (o) => l.$emit("goto", "library"))
                    },
                    e.toDisplayString(l.$t("去文献库查验")),
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
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(W, {
          "step-key": "refs",
          index: 1,
          title: a[1].title,
          hint: a[1].hint,
          runtime: f.value.refs
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", qn, [
              e.createElementVNode("label", Pn, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(l.$t("参考文献格式")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("select", {
                  value: y.value?.style,
                  onChange: r[1] || (r[1] = (o) => k(o.target.value))
                }, [
                  e.createElementVNode(
                    "option",
                    xn,
                    e.toDisplayString(e.unref(J)("gbt7714")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "option",
                    zn,
                    e.toDisplayString(e.unref(J)("apa")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "option",
                    Fn,
                    e.toDisplayString(e.unref(J)("ieee")),
                    1
                    /* TEXT */
                  )
                ], 40, Kn)
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                disabled: !!g.value,
                onClick: $
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(g.value === "refs" ? "ri-loader-4-line spin" : "ri-refresh-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(l.$t("生成预览")),
                  1
                  /* TEXT */
                )
              ], 8, jn)
            ]),
            d.value.length ? (e.openBlock(), e.createElementBlock("ol", Un, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(d.value, (o, b) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: b,
                    dir: "auto"
                  },
                  e.toDisplayString(o),
                  1
                  /* TEXT */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : w.value ? (e.openBlock(), e.createElementBlock(
              "p",
              Rn,
              e.toDisplayString(l.$t("稿子里还没有引用文献库的文献")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(W, {
          "step-key": "export",
          index: 2,
          title: a[2].title,
          hint: a[2].hint,
          runtime: f.value.export
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Xn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!g.value,
                onClick: r[2] || (r[2] = (o) => B("docx"))
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(g.value === "docx" ? "ri-loader-4-line spin" : "ri-file-word-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(l.$t("导出 Word")),
                  1
                  /* TEXT */
                )
              ], 8, Gn),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                disabled: !!g.value,
                onClick: r[3] || (r[3] = (o) => B("md"))
              }, [
                r[9] || (r[9] = e.createElementVNode(
                  "i",
                  { class: "ri-markdown-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(l.$t("导出 Markdown")),
                  1
                  /* TEXT */
                )
              ], 8, Jn),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                disabled: !!g.value || !y.value?.library.length,
                onClick: r[4] || (r[4] = (o) => B("bib"))
              }, [
                r[10] || (r[10] = e.createElementVNode(
                  "i",
                  { class: "ri-book-2-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(l.$t("导出 BibTeX")),
                  1
                  /* TEXT */
                )
              ], 8, Zn)
            ]),
            e.createElementVNode(
              "p",
              Hn,
              e.toDisplayString(l.$t("导出时引用按所选格式重新编号，并在文末生成参考文献表；以双写编辑器取回的版本优先。")),
              1
              /* TEXT */
            )
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(W, {
          "step-key": "files",
          index: 3,
          title: a[3].title,
          hint: a[3].hint,
          runtime: f.value.files
        }, {
          default: e.withCtx(() => [
            N.value.length ? (e.openBlock(), e.createElementBlock("div", Yn, [
              e.createElementVNode("table", eo, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(l.$t("文件")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(l.$t("格式")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(l.$t("时间")),
                      1
                      /* TEXT */
                    ),
                    r[11] || (r[11] = e.createElementVNode(
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
                    e.renderList(N.value, (o) => (e.openBlock(), e.createElementBlock("tr", {
                      key: o.path
                    }, [
                      e.createElementVNode("td", {
                        class: "aw-file",
                        title: o.path
                      }, e.toDisplayString(o.path.split(/[\\/]/).pop()), 9, to),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          lo,
                          e.toDisplayString(o.kind === "docx" ? "Word" : o.kind === "md" ? "Markdown" : "BibTeX"),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode(
                        "td",
                        null,
                        e.toDisplayString(e.unref(D.fmtDateTime)(o.at)),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", no, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (b) => q(o.path, o.kind)
                        }, e.toDisplayString(l.$t("预览")), 9, oo),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (b) => i(o.path)
                        }, e.toDisplayString(l.$t("打开所在文件夹")), 9, so)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "div",
              Qn,
              e.toDisplayString(l.$t("还没有导出文件")),
              1
              /* TEXT */
            )),
            e.createElementVNode(
              "p",
              ao,
              e.toDisplayString(l.$t("预览里左上角的文件名下拉可以选本机软件打开（WPS、Pages、LibreOffice 等）。")),
              1
              /* TEXT */
            )
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ]),
      v.value ? (e.openBlock(), e.createBlock(fn, {
        key: 0,
        path: v.value.path,
        markdown: v.value.markdown,
        onClose: r[5] || (r[5] = (o) => v.value = null),
        onCowrite: n
      }, null, 8, ["path", "markdown"])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), io = /* @__PURE__ */ j(ro, [["__scopeId", "data-v-8c00cca3"]]), ee = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!ee) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
ee.default;
const co = { class: "ss-module" }, uo = { class: "ss-panel" }, mo = { class: "ss-muted" }, po = { class: "ss-actions" }, vo = { class: "aw-path" }, yo = ["disabled"], ho = { class: "ss-panel" }, ko = { class: "ss-field" }, go = { class: "ss-muted" }, Eo = { class: "ss-subhead" }, fo = { class: "aw-sources" }, Vo = ["value"], No = { class: "ss-actions" }, bo = ["disabled"], $o = {
  key: 0,
  class: "ss-muted"
}, wo = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  emits: ["goto"],
  setup(V) {
    const u = F.useNotificationStore(), y = z, m = ee.AW_API_SOURCES, N = e.ref(""), d = e.ref([]);
    e.watch(() => y.value?.settings, (a) => {
      a && (N.value = a.contactEmail || "", d.value = [...a.defaultSources || []]);
    }, { immediate: !0 });
    const w = e.computed(() => {
      const a = y.value?.settings;
      return a ? N.value !== (a.contactEmail || "") || [...d.value].sort().join() !== [...a.defaultSources || []].sort().join() : !1;
    });
    async function g() {
      try {
        await C("settings.patch", { patch: { contactEmail: N.value, defaultSources: d.value } }), await I(), u.success(s.t("已保存"));
      } catch (a) {
        u.error(D.errorMessage(a));
      }
    }
    async function h() {
      try {
        await C("outputDir.pick") && await I();
      } catch (a) {
        u.error(D.errorMessage(a));
      }
    }
    function v() {
      y.value?.outputDir && C("path.open", { path: y.value.outputDir }).catch((a) => u.error(D.errorMessage(a)));
    }
    return (a, f) => (e.openBlock(), e.createElementBlock("div", co, [
      e.createElementVNode("section", uo, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            f[2] || (f[2] = e.createElementVNode(
              "i",
              { class: "ri-folder-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(a.$t("结果文件存到")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            mo,
            e.toDisplayString(a.$t("导出的 Word、Markdown、BibTeX 按论文题目分文件夹存放。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", po, [
          e.createElementVNode(
            "code",
            vo,
            e.toDisplayString(e.unref(y)?.outputDir || "—"),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            onClick: h
          }, [
            f[3] || (f[3] = e.createElementVNode(
              "i",
              { class: "ri-folder-settings-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.$t("更改")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            disabled: !e.unref(y)?.outputDir,
            onClick: v
          }, [
            f[4] || (f[4] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.$t("打开")),
              1
              /* TEXT */
            )
          ], 8, yo)
        ])
      ]),
      e.createElementVNode("section", ho, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            f[5] || (f[5] = e.createElementVNode(
              "i",
              { class: "ri-search-eye-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(a.$t("文献检索")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("label", ko, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(a.$t("联系邮箱（可选）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": f[0] || (f[0] = (_) => N.value = _),
              type: "email",
              placeholder: "name@university.edu"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              e.vModelText,
              N.value,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        e.createElementVNode(
          "p",
          go,
          e.toDisplayString(a.$t("PubMed、Crossref、OpenAlex 建议请求里带联系邮箱，限流更宽；只发给这些学术库，不发给别处。")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "div",
          Eo,
          e.toDisplayString(a.$t("默认检索来源")),
          1
          /* TEXT */
        ),
        e.createElementVNode("div", fo, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(m), (_) => (e.openBlock(), e.createElementBlock("label", {
              key: _,
              class: "aw-check"
            }, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": f[1] || (f[1] = (T) => d.value = T),
                type: "checkbox",
                value: _
              }, null, 8, Vo), [
                [e.vModelCheckbox, d.value]
              ]),
              e.createElementVNode(
                "span",
                null,
                e.toDisplayString(e.unref(X)(_)),
                1
                /* TEXT */
              )
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        e.createElementVNode("div", No, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: !w.value || !d.value.length,
            onClick: g
          }, [
            f[6] || (f[6] = e.createElementVNode(
              "i",
              { class: "ri-save-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(a.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, bo),
          d.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "span",
            $o,
            e.toDisplayString(a.$t("至少选一个来源")),
            1
            /* TEXT */
          ))
        ])
      ])
    ]));
  }
}), _o = /* @__PURE__ */ j(wo, [["__scopeId", "data-v-db0c08a3"]]), So = { class: "aw-workbench" }, Do = { class: "workbench-header" }, Co = { class: "heading" }, Bo = { class: "eyebrow" }, To = { class: "subtitle" }, Lo = { class: "header-actions" }, Ao = ["disabled"], Mo = {
  key: 0,
  class: "aw-bar"
}, Oo = { class: "aw-bar__pick" }, Io = ["value"], Wo = ["value"], qo = { class: "ss-chip" }, Po = { class: "ss-chip" }, Ko = { class: "ss-chip" }, xo = { class: "ss-chip brand" }, zo = { class: "aw-rule" }, Fo = {
  key: 1,
  class: "ss-panel"
}, jo = { class: "ss-grid" }, Uo = { class: "ss-field aw-wide" }, Ro = { class: "ss-field" }, Xo = ["placeholder"], Go = { class: "ss-field" }, Jo = { value: "review" }, Zo = { value: "research" }, Ho = { value: "thesis" }, Qo = { value: "proposal" }, Yo = { class: "ss-field" }, es = { value: "zh" }, ts = { class: "ss-field" }, ls = { class: "ss-field" }, ns = { class: "ss-actions" }, os = ["disabled"], ss = {
  class: "aw-tabs",
  role: "tablist"
}, as = ["title", "onClick"], rs = {
  key: 0,
  class: "aw-badge"
}, is = {
  key: 2,
  class: "ss-note info aw-progress"
}, cs = {
  key: 3,
  class: "aw-body"
}, ds = {
  key: 4,
  class: "ss-note danger"
}, us = {
  key: 5,
  class: "ss-note"
}, te = "totalclaw:academic-writer-tab:v1", ms = /* @__PURE__ */ e.defineComponent({
  __name: "AcademicWriterWorkbenchView",
  setup(V) {
    const u = { search: kt, library: el, outline: Cl, write: ln, export: io, settings: _o }, y = [
      { key: "search", icon: "ri-search-eye-line", title: s.t("文献检索"), desc: s.t("PubMed、Europe PMC、arXiv、Crossref、OpenAlex 一键检索；知网、万方等在内置浏览器打开并抓取") },
      { key: "library", icon: "ri-book-shelf-line", title: s.t("文献库与精读"), desc: s.t("问题、方法、发现、局限，依据句回摘要核对") },
      { key: "outline", icon: "ri-list-ordered-2", title: s.t("提纲"), desc: s.t("按文献库拟提纲，每节标出要引用的文献") },
      { key: "write", icon: "ri-quill-pen-line", title: s.t("写作与双写"), desc: s.t("分节成稿，送进人机双写编辑器由你改，再取回") },
      { key: "export", icon: "ri-file-word-2-line", title: s.t("参考文献与导出"), desc: s.t("引用查验、参考文献格式、导出与本机应用打开") }
    ], m = F.useNotificationStore(), N = z, d = e.computed(() => (N.value, U())), w = e.ref((() => {
      try {
        const i = localStorage.getItem(te);
        return i && (i === "settings" || y.some((n) => n.key === i)) ? i : "search";
      } catch {
        return "search";
      }
    })()), g = e.ref(!1), h = e.ref(!1), v = e.ref(""), a = e.ref(null), f = e.computed(() => x[w.value] || "");
    function _(i) {
      const n = d.value;
      if (!n) return "";
      if (i === "library") {
        const t = n.library.filter((l) => !l.summary).length;
        return t ? String(t) : "";
      }
      return i === "write" && n.sections.reduce((l, r) => l + r.badRefs.length, 0) ? "!" : "";
    }
    function T(i) {
      if (!(i !== "settings" && !y.some((n) => n.key === i))) {
        w.value = i;
        try {
          localStorage.setItem(te, i);
        } catch {
        }
      }
    }
    function A(i) {
      a.value = i ? { id: i.id, title: i.title, field: i.field, paperType: i.paperType, language: i.language, style: i.style, requirements: i.requirements } : { title: "", field: "", paperType: "review", language: "zh", style: "gbt7714", requirements: "" };
    }
    async function L() {
      if (a.value)
        try {
          const { id: i, ...n } = a.value;
          i ? await C("project.update", { patch: n }) : await C("project.create", { input: n }), a.value = null, await I();
        } catch (i) {
          m.error(D.errorMessage(i));
        }
    }
    async function M(i) {
      try {
        await C("project.switch", { id: i }), await I();
      } catch (n) {
        m.error(D.errorMessage(n));
      }
    }
    async function $(i) {
      const n = N.value?.projects.find((t) => t.id === i);
      if (!(!n || !window.confirm(s.t("删除论文「{p0}」及其文献库、提纲和稿子？已导出的文件不会删。", { p0: n.title }))))
        try {
          await C("project.remove", { id: i }), a.value = null, await I();
        } catch (t) {
          m.error(D.errorMessage(t));
        }
    }
    async function k() {
      h.value = !0;
      try {
        await I(), g.value = !0, v.value = "";
      } catch (i) {
        v.value = D.errorMessage(i);
      } finally {
        h.value = !1;
      }
    }
    let B = null, q = null;
    return e.onMounted(() => {
      k(), q = ve((i) => {
        if (i.type === "progress" && i.payload?.key) {
          x[String(i.payload.key)] = String(i.payload.message || "");
          return;
        }
        B || (B = setTimeout(() => {
          B = null, I().catch(() => {
          });
        }, 300));
      });
    }), e.onBeforeUnmount(() => {
      q?.(), B && clearTimeout(B);
    }), (i, n) => (e.openBlock(), e.createElementBlock("div", So, [
      e.createElementVNode("header", Do, [
        e.createElementVNode("div", Co, [
          e.createVNode(pe),
          n[12] || (n[12] = e.createElementVNode(
            "span",
            { class: "heading-icon" },
            [
              e.createElementVNode("i", { class: "ri-graduation-cap-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "p",
              Bo,
              e.toDisplayString(i.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(i.$t("学术写作智能体")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              To,
              e.toDisplayString(i.$t("检索真实文献、精读、拟提纲、分节成稿，再到人机双写编辑器里由你改定。参考文献只来自你的文献库，AI 不编造文献；成稿是草稿，学术责任在作者。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Lo, [
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: h.value,
            onClick: k
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
              e.toDisplayString(i.$t("刷新")),
              1
              /* TEXT */
            )
          ], 8, Ao)
        ])
      ]),
      e.createCommentVNode(" 论文项目 "),
      d.value ? (e.openBlock(), e.createElementBlock("section", Mo, [
        e.createElementVNode("label", Oo, [
          n[13] || (n[13] = e.createElementVNode(
            "i",
            { class: "ri-draft-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(i.$t("论文")),
            1
            /* TEXT */
          ),
          e.createElementVNode("select", {
            value: e.unref(N)?.activeProjectId,
            onChange: n[0] || (n[0] = (t) => M(t.target.value))
          }, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(N)?.projects || [], (t) => (e.openBlock(), e.createElementBlock("option", {
                key: t.id,
                value: t.id
              }, e.toDisplayString(t.title), 9, Wo))),
              128
              /* KEYED_FRAGMENT */
            ))
          ], 40, Io)
        ]),
        e.createElementVNode(
          "span",
          qo,
          e.toDisplayString(e.unref(R)(d.value.paperType)),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          Po,
          e.toDisplayString(d.value.language === "en" ? "English" : i.$t("中文")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          Ko,
          e.toDisplayString(e.unref(J)(d.value.style)),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          xo,
          e.toDisplayString(i.$t("文献库 {n} 篇", { n: d.value.library.length })),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: n[1] || (n[1] = (t) => A(d.value))
          },
          e.toDisplayString(i.$t("编辑")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: n[2] || (n[2] = (t) => A(null))
          },
          e.toDisplayString(i.$t("新建论文")),
          1
          /* TEXT */
        ),
        n[15] || (n[15] = e.createElementVNode(
          "span",
          { class: "aw-grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode("span", zo, [
          n[14] || (n[14] = e.createElementVNode(
            "i",
            { class: "ri-shield-check-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(i.$t("引用只来自文献库 · 依据句回原文核对 · 成稿由作者负责")),
            1
            /* TEXT */
          )
        ])
      ])) : e.createCommentVNode("v-if", !0),
      a.value ? (e.openBlock(), e.createElementBlock("section", Fo, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            n[16] || (n[16] = e.createElementVNode(
              "i",
              { class: "ri-draft-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(a.value.id ? i.$t("编辑论文") : i.$t("新建论文")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", jo, [
          e.createElementVNode("label", Uo, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("题目 / 选题")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": n[3] || (n[3] = (t) => a.value.title = t),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                a.value.title,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Ro, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("学科领域")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": n[4] || (n[4] = (t) => a.value.field = t),
              type: "text",
              placeholder: i.$t("如：医学影像、教育技术")
            }, null, 8, Xo), [
              [
                e.vModelText,
                a.value.field,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Go, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("类型")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": n[5] || (n[5] = (t) => a.value.paperType = t)
              },
              [
                e.createElementVNode(
                  "option",
                  Jo,
                  e.toDisplayString(e.unref(R)("review")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  Zo,
                  e.toDisplayString(e.unref(R)("research")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  Ho,
                  e.toDisplayString(e.unref(R)("thesis")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  Qo,
                  e.toDisplayString(e.unref(R)("proposal")),
                  1
                  /* TEXT */
                )
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, a.value.paperType]
            ])
          ]),
          e.createElementVNode("label", Yo, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("写作语言")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": n[6] || (n[6] = (t) => a.value.language = t)
              },
              [
                e.createElementVNode(
                  "option",
                  es,
                  e.toDisplayString(i.$t("中文")),
                  1
                  /* TEXT */
                ),
                n[17] || (n[17] = e.createElementVNode(
                  "option",
                  { value: "en" },
                  "English",
                  -1
                  /* CACHED */
                ))
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, a.value.language]
            ])
          ]),
          e.createElementVNode("label", ts, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("参考文献格式")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": n[7] || (n[7] = (t) => a.value.style = t)
              },
              [...n[18] || (n[18] = [
                e.createElementVNode(
                  "option",
                  { value: "gbt7714" },
                  "GB/T 7714-2015",
                  -1
                  /* CACHED */
                ),
                e.createElementVNode(
                  "option",
                  { value: "apa" },
                  "APA 7",
                  -1
                  /* CACHED */
                ),
                e.createElementVNode(
                  "option",
                  { value: "ieee" },
                  "IEEE",
                  -1
                  /* CACHED */
                )
              ])],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, a.value.style]
            ])
          ])
        ]),
        e.createElementVNode("label", ls, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(i.$t("写作要求（字数、目标期刊、导师要求等，可选）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": n[8] || (n[8] = (t) => a.value.requirements = t),
              rows: "2"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, a.value.requirements]
          ])
        ]),
        e.createElementVNode("div", ns, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: !a.value.title,
            onClick: L
          }, [
            n[19] || (n[19] = e.createElementVNode(
              "i",
              { class: "ri-check-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(i.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, os),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn ghost",
              onClick: n[9] || (n[9] = (t) => a.value = null)
            },
            e.toDisplayString(i.$t("取消")),
            1
            /* TEXT */
          ),
          n[21] || (n[21] = e.createElementVNode(
            "span",
            { class: "aw-grow" },
            null,
            -1
            /* CACHED */
          )),
          a.value.id ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-btn danger sm",
            onClick: n[10] || (n[10] = (t) => $(a.value.id))
          }, [
            n[20] || (n[20] = e.createElementVNode(
              "i",
              { class: "ri-delete-bin-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(i.$t("删除论文")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("nav", ss, [
        (e.openBlock(), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(y, (t) => e.createElementVNode("button", {
            key: t.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["aw-tab", { active: w.value === t.key }]),
            title: t.desc,
            onClick: (l) => T(t.key)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(t.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(t.title),
              1
              /* TEXT */
            ),
            _(t.key) ? (e.openBlock(), e.createElementBlock(
              "em",
              rs,
              e.toDisplayString(_(t.key)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, as)),
          64
          /* STABLE_FRAGMENT */
        )),
        n[23] || (n[23] = e.createElementVNode(
          "span",
          { class: "aw-grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "button",
          {
            type: "button",
            role: "tab",
            class: e.normalizeClass(["aw-tab", { active: w.value === "settings" }]),
            onClick: n[11] || (n[11] = (t) => T("settings"))
          },
          [
            n[22] || (n[22] = e.createElementVNode(
              "i",
              { class: "ri-settings-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(i.$t("设置")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ]),
      f.value ? (e.openBlock(), e.createElementBlock("p", is, [
        n[24] || (n[24] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(f.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      g.value && d.value ? (e.openBlock(), e.createElementBlock("div", cs, [
        (e.openBlock(), e.createBlock(
          e.resolveDynamicComponent(u[w.value]),
          {
            key: `${w.value}-${d.value.id}`,
            onGoto: T
          },
          null,
          32
          /* NEED_HYDRATION */
        ))
      ])) : v.value ? (e.openBlock(), e.createElementBlock("p", ds, [
        n[25] || (n[25] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(v.value),
          1
          /* TEXT */
        )
      ])) : (e.openBlock(), e.createElementBlock("p", us, [
        n[26] || (n[26] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(i.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), ps = /* @__PURE__ */ j(ms, [["__scopeId", "data-v-c7d84439"]]);
export {
  ps as default
};
