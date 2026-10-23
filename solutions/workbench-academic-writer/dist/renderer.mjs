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
const P = ne.default, oe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!oe) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const G = oe.default, Q = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!Q) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
Q.default;
const D = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!D) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
D.default;
async function B(N, u) {
  const y = window.electronAPI?.workbenches?.academicWriter;
  if (!y?.invoke) throw new Error(s.t("学术写作接口不可用，请重启应用"));
  return y.invoke(N, Q.toPlain(u ?? {}));
}
function ve(N) {
  const u = window.electronAPI?.workbenches?.academicWriter;
  return u?.onEvent ? u.onEvent(N) : () => {
  };
}
const z = e.ref(null), x = e.reactive({});
function U() {
  const N = z.value;
  return N && (N.projects.find((u) => u.id === N.activeProjectId) || N.projects[0]) || null;
}
async function I() {
  const N = await B("state.get");
  return z.value = N, N;
}
function X(N) {
  return { pubmed: "PubMed", europepmc: "Europe PMC", arxiv: "arXiv", crossref: "Crossref", openalex: "OpenAlex", web: s.t("网页抓取") }[N];
}
function R(N) {
  return { review: s.t("综述"), research: s.t("研究论文"), thesis: s.t("学位论文"), proposal: s.t("开题报告") }[N] || N;
}
function J(N) {
  return { gbt7714: "GB/T 7714-2015", apa: "APA 7", ieee: "IEEE" }[N] || N;
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
async function se(N) {
  const u = window.electronAPI?.browserTabs;
  if (!u?.create) return !1;
  const y = /^https?:\/\//i.test(N) ? N : `https://${N}`, m = await u.create({ url: y, contextId: he, source: "agent", activate: !0 });
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
function ae(N) {
  return [N.authors.length ? `${N.authors[0]}${N.authors.length > 1 ? s.t(" 等") : ""}` : "", N.journal, N.year].filter(Boolean).join(" · ");
}
async function re(N, u) {
  const y = window.electronAPI?.cowrite;
  if (!y?.open || !y?.apply) throw new Error(s.t("当前版本没有人机双写编辑器"));
  const m = await y.open({ mode: "local" });
  if (m && m.ok === !1) throw new Error(s.t("人机双写编辑器没有打开"));
  const b = await y.apply({ mode: "local", applyMode: "loadDoc", title: N, text: u });
  if (b && b.ok === !1) throw new Error(s.t("没能把文稿载入人机双写编辑器"));
}
async function ke() {
  const N = window.electronAPI?.cowrite;
  if (!N?.get) throw new Error(s.t("当前版本没有人机双写编辑器"));
  const u = await N.get({ mode: "local" });
  return String(u?.text || "");
}
const ge = { class: "ss-module" }, fe = { class: "ss-panel aw-head" }, Ee = { class: "aw-head__main" }, Ve = { class: "ss-muted" }, Ne = {
  key: 0,
  class: "ss-note info"
}, be = { class: "ss-steps" }, $e = { class: "aw-topic" }, we = { class: "ss-actions" }, _e = ["disabled"], Se = {
  key: 0,
  class: "ss-muted"
}, De = {
  key: 0,
  class: "aw-chips"
}, Be = { class: "ss-muted" }, Ce = ["title", "onClick"], Te = { key: 0 }, Le = {
  key: 1,
  class: "aw-chips"
}, Ae = { class: "ss-muted" }, Me = ["onClick"], Oe = { class: "ss-grid" }, Ie = { class: "ss-field aw-wide" }, We = ["placeholder"], Pe = { class: "ss-field" }, qe = { class: "ss-field" }, Ke = { class: "aw-sources" }, xe = ["value"], ze = { class: "ss-actions" }, Fe = ["disabled"], je = { class: "ss-actions" }, Ue = { class: "ss-muted" }, Re = ["disabled"], Xe = ["disabled"], Ge = { class: "aw-results" }, Je = ["disabled", "checked", "onChange"], Ze = { class: "aw-results__body" }, He = ["onClick"], Qe = { class: "aw-meta" }, Ye = {
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
  setup(N) {
    const u = F.useNotificationStore(), y = ["pubmed", "europepmc", "arxiv", "crossref", "openalex"], m = e.computed(() => (z.value, U())), b = e.computed(() => m.value?.lastSearch || null), d = e.computed(() => b.value?.results || []), w = ye(), g = e.ref(b.value?.query || ""), h = e.ref(""), v = e.ref(b.value?.yearFrom), a = e.ref(15), E = e.ref([...z.value?.settings.defaultSources || ["pubmed", "europepmc", "arxiv", "openalex"]].filter((c) => c !== "web")), _ = e.ref([]), T = e.ref([]), A = e.ref(""), L = e.ref([]), M = e.ref([]), $ = e.ref(""), k = e.ref({}), C = e.ref(""), q = e.ref(!1);
    e.watch(b, () => {
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
        topic: c("topic", _.value.length > 0 || !!b.value, _.value.length ? s.t("{n} 条检索式", { n: _.value.length }) : ""),
        search: c("search", !!b.value, b.value ? s.t("{n} 篇", { n: d.value.length }) : ""),
        results: c("results", S > 0, s.t("文献库 {n} 篇", { n: S })),
        sites: c("sites", q.value || !!C.value, C.value ? s.t("已抓取") : s.t("已打开"))
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
    async function V() {
      await o("topic", async () => {
        const c = await B("query.suggest", { topic: m.value?.title });
        _.value = c.queries, T.value = c.zhKeywords, A.value = c.model, !g.value && c.queries[0] && (g.value = c.queries[0].query);
      });
    }
    async function f() {
      !g.value || !E.value.length || await o("search", () => B("search.run", { query: g.value, sources: E.value, yearFrom: v.value || void 0, limit: a.value || 15 }));
    }
    function K(c) {
      L.value = L.value.includes(c) ? L.value.filter((S) => S !== c) : [...L.value, c];
    }
    function W(c) {
      M.value = M.value.includes(c) ? M.value.filter((S) => S !== c) : [...M.value, c];
    }
    function Z() {
      L.value = n.value.map((c) => c.id);
    }
    async function ie() {
      await o("add", async () => {
        const S = await B("library.add", { ids: L.value });
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
      C.value = "", await o("sites", async () => {
        const c = await B("web.capture");
        C.value = c.added ? s.t("已抓取进文献库：{p0}", { p0: c.paper.title }) : s.t("这篇已经在文献库里：{p0}", { p0: c.paper.title });
      });
    }
    function ue(c) {
      D.scrollToStep(c);
    }
    return (c, S) => (e.openBlock(), e.createElementBlock("div", ge, [
      e.createElementVNode("section", fe, [
        e.createElementVNode("div", Ee, [
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
        e.createVNode(P, {
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
                onClick: V
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass($.value === "topic" ? "ri-loader-4-line spin" : "ri-search-eye-line")
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
                Be,
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
                ], 8, Ce))),
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
        e.createVNode(P, {
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
                  onKeyup: e.withKeys(f, ["enter"])
                }, null, 40, We), [
                  [
                    e.vModelText,
                    g.value,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", Pe, [
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
              e.createElementVNode("label", qe, [
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
                    "onUpdate:modelValue": S[3] || (S[3] = (O) => E.value = O),
                    type: "checkbox",
                    value: p
                  }, null, 8, xe), [
                    [e.vModelCheckbox, E.value]
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
                disabled: !!$.value || !g.value || !E.value.length,
                onClick: f
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
              e.renderList(b.value?.errors || [], (p) => (e.openBlock(), e.createElementBlock("p", {
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
        e.createVNode(P, {
          "step-key": "results",
          index: 2,
          title: t[2].title,
          hint: t[2].hint,
          runtime: l.value.results
        }, {
          default: e.withCtx(() => [
            b.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", je, [
                  e.createElementVNode(
                    "span",
                    Ue,
                    e.toDisplayString(c.$t("「{p0}」共 {n} 篇（已跨库去重）", { p0: b.value.query, n: d.value.length })),
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
                            onClick: (O) => W(p.id)
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
        e.createVNode(P, {
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
            C.value ? (e.openBlock(), e.createElementBlock("p", yt, [
              S[10] || (S[10] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(C.value),
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
}), j = (N, u) => {
  const y = N.__vccOpts || N;
  for (const [m, b] of u)
    y[m] = b;
  return y;
}, kt = /* @__PURE__ */ j(ht, [["__scopeId", "data-v-76254ba3"]]), gt = { class: "ss-module" }, ft = { class: "ss-panel aw-head" }, Et = { class: "aw-head__main" }, Vt = { class: "ss-muted" }, Nt = {
  key: 0,
  class: "ss-note info"
}, bt = {
  key: 0,
  class: "ss-note info"
}, $t = { class: "ss-steps" }, wt = { class: "aw-lib" }, _t = { class: "aw-lib__top" }, St = { class: "aw-no" }, Dt = ["onClick"], Bt = { class: "aw-meta" }, Ct = {
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
}, Ot = ["onClick"], It = ["onClick"], Wt = ["disabled", "onClick"], Pt = ["onClick"], qt = ["value", "placeholder", "onBlur"], Kt = {
  key: 0,
  class: "aw-detail"
}, xt = { class: "aw-sum" }, zt = {
  key: 0,
  class: "aw-quotes"
}, Ft = {
  key: 0,
  class: "ri-check-line",
  "aria-hidden": "true"
}, jt = { class: "ss-muted" }, Ut = { class: "aw-abstract" }, Rt = { class: "ss-actions" }, Xt = ["disabled"], Gt = { class: "ss-muted" }, Jt = {
  key: 0,
  class: "aw-failed"
}, Zt = { class: "ss-actions" }, Ht = ["disabled"], Qt = ["disabled"], Yt = {
  key: 0,
  class: "ss-muted"
}, el = /* @__PURE__ */ e.defineComponent({
  __name: "LibraryTab",
  emits: ["goto"],
  setup(N) {
    const u = F.useNotificationStore(), y = e.computed(() => (z.value, U())), m = e.computed(() => y.value?.library || []), b = e.computed(() => m.value.filter((o) => !o.summary)), d = e.computed(() => m.value.filter((o) => o.doi)), w = e.computed(() => d.value.some((o) => o.doiCheck)), g = e.computed(() => d.value.filter((o) => o.doiCheck === "ok").length), h = e.computed(() => d.value.filter((o) => o.doiCheck === "missing").length), v = e.ref([]), a = e.ref(""), E = e.ref({}), _ = e.ref([]), T = [
      { key: "list", title: s.t("文献库"), hint: s.t("编号 [n] 就是写作时的引用编号") },
      { key: "read", title: s.t("精读"), hint: s.t("研究问题、方法、主要发现、局限，每项附摘要原句") },
      { key: "doi", title: s.t("查验 DOI 与导出"), hint: s.t("Crossref 核对 DOI 真实存在，导出 BibTeX 给 Zotero / EndNote") }
    ], A = e.computed(() => {
      const o = (V, f, K) => a.value === V ? { state: "running" } : E.value[V] ? { state: "failed", error: E.value[V] } : f ? { state: "done", summary: K } : { state: "todo" };
      return {
        list: o("list", m.value.length > 0, s.t("{n} 篇", { n: m.value.length })),
        read: o("read", m.value.length > 0 && !b.value.length, s.t("全部已精读")),
        doi: o("doi", w.value, s.t("查到 {a}，查不到 {b}", { a: g.value, b: h.value }))
      };
    }), L = e.computed(() => T.find((o) => A.value[o.key].state !== "done")?.key || "doi");
    async function M(o, V) {
      a.value = o, E.value = { ...E.value, [o]: "" }, D.scrollToStep(o);
      try {
        return await V(), await I(), !0;
      } catch (f) {
        return E.value = { ...E.value, [o]: D.errorMessage(f) }, !1;
      } finally {
        a.value = "";
      }
    }
    function $(o) {
      v.value = v.value.includes(o) ? v.value.filter((V) => V !== o) : [...v.value, o];
    }
    async function k() {
      _.value = [], await M("read", async () => {
        const o = await B("read.run", {});
        _.value = o.failed || [], u.success(s.t("精读完成 {n} 篇", { n: o.done }));
      });
    }
    async function C(o) {
      _.value = [], await M("read", async () => {
        const f = await B("read.run", { ids: [o] });
        _.value = f.failed || [], f.done && !v.value.includes(o) && (v.value = [...v.value, o]);
      }) || u.error(E.value.read);
    }
    async function q(o, V, f) {
      if ((f || "") !== V)
        try {
          await B("library.note", { id: o, note: V }), await I();
        } catch (K) {
          u.error(D.errorMessage(K));
        }
    }
    async function i(o, V) {
      if (window.confirm(s.t("从文献库删除 [{n}]？后面文献的编号会前移，稿子里的引用会同步改。", { n: V })))
        try {
          await B("library.remove", { id: o }), await I();
        } catch (f) {
          u.error(D.errorMessage(f));
        }
    }
    async function n() {
      await M("doi", () => B("library.checkDoi"));
    }
    async function t() {
      await M("doi", async () => {
        const V = await B("export", { format: "bib" });
        await B("path.open", { path: V.path, reveal: !0 });
      }) || u.error(E.value.doi);
    }
    async function l(o) {
      try {
        await se(o) || u.error(s.t("内置浏览器不可用"));
      } catch (V) {
        u.error(D.errorMessage(V));
      }
    }
    function r(o) {
      D.scrollToStep(o);
    }
    return (o, V) => (e.openBlock(), e.createElementBlock("div", gt, [
      e.createElementVNode("section", ft, [
        e.createElementVNode("div", Et, [
          e.createElementVNode("strong", null, [
            V[1] || (V[1] = e.createElementVNode(
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
            V[3] || (V[3] = e.createElementVNode(
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
            e.createVNode(P, {
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
                    e.renderList(m.value, (f, K) => (e.openBlock(), e.createElementBlock("li", {
                      key: f.id
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
                          onClick: (W) => $(f.id)
                        }, e.toDisplayString(f.title), 9, Dt)
                      ]),
                      e.createElementVNode("div", Bt, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(e.unref(ae)(f)),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(f.foundIn || [f.source], (W) => (e.openBlock(), e.createElementBlock(
                            "em",
                            {
                              key: W,
                              class: "ss-chip"
                            },
                            e.toDisplayString(e.unref(X)(W)),
                            1
                            /* TEXT */
                          ))),
                          128
                          /* KEYED_FRAGMENT */
                        )),
                        f.citedBy != null ? (e.openBlock(), e.createElementBlock(
                          "em",
                          Ct,
                          e.toDisplayString(o.$t("被引 {n}", { n: f.citedBy })),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        f.doi ? (e.openBlock(), e.createElementBlock("span", Tt, [
                          e.createTextVNode(
                            "DOI " + e.toDisplayString(f.doi) + " ",
                            1
                            /* TEXT */
                          ),
                          f.doiCheck === "ok" ? (e.openBlock(), e.createElementBlock("em", Lt, [...V[4] || (V[4] = [
                            e.createElementVNode(
                              "i",
                              {
                                class: "ri-check-line",
                                "aria-hidden": "true"
                              },
                              null,
                              -1
                              /* CACHED */
                            )
                          ])])) : f.doiCheck === "missing" ? (e.openBlock(), e.createElementBlock(
                            "em",
                            At,
                            e.toDisplayString(o.$t("Crossref 查不到")),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0)
                        ])) : e.createCommentVNode("v-if", !0),
                        f.summary ? (e.openBlock(), e.createElementBlock(
                          "em",
                          Mt,
                          e.toDisplayString(o.$t("已精读")),
                          1
                          /* TEXT */
                        )) : e.createCommentVNode("v-if", !0),
                        f.url ? (e.openBlock(), e.createElementBlock("button", {
                          key: 3,
                          type: "button",
                          class: "ss-link",
                          onClick: (W) => l(f.url)
                        }, e.toDisplayString(o.$t("打开网页")), 9, Ot)) : e.createCommentVNode("v-if", !0),
                        f.pdfUrl ? (e.openBlock(), e.createElementBlock("button", {
                          key: 4,
                          type: "button",
                          class: "ss-link",
                          onClick: (W) => l(f.pdfUrl)
                        }, "PDF", 8, It)) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          disabled: !!a.value,
                          onClick: (W) => C(f.id)
                        }, e.toDisplayString(f.summary ? o.$t("重读") : o.$t("精读")), 9, Wt),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link aw-danger",
                          onClick: (W) => i(f.id, K + 1)
                        }, e.toDisplayString(o.$t("删除")), 9, Pt)
                      ]),
                      e.createElementVNode("input", {
                        class: "aw-note",
                        type: "text",
                        value: f.note || "",
                        placeholder: o.$t("备注（可选）"),
                        onBlur: (W) => q(f.id, W.target.value, f.note)
                      }, null, 40, qt),
                      v.value.includes(f.id) ? (e.openBlock(), e.createElementBlock("div", Kt, [
                        f.summary ? (e.openBlock(), e.createElementBlock(
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
                                  e.toDisplayString(f.summary.question),
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
                                  e.toDisplayString(f.summary.method),
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
                                  e.toDisplayString(f.summary.findings),
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
                                  e.toDisplayString(f.summary.limitations),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ]),
                            f.summary.quotes.length ? (e.openBlock(), e.createElementBlock("ul", zt, [
                              (e.openBlock(!0), e.createElementBlock(
                                e.Fragment,
                                null,
                                e.renderList(f.summary.quotes, (W, Z) => (e.openBlock(), e.createElementBlock(
                                  "li",
                                  {
                                    key: Z,
                                    class: e.normalizeClass({ unverified: !W.verified })
                                  },
                                  [
                                    e.createElementVNode(
                                      "span",
                                      {
                                        class: e.normalizeClass(["ss-chip", W.verified ? "ok" : ""])
                                      },
                                      [
                                        W.verified ? (e.openBlock(), e.createElementBlock("i", Ft)) : e.createCommentVNode("v-if", !0),
                                        e.createTextVNode(
                                          e.toDisplayString(W.verified ? o.$t("已在摘要中核实") : o.$t("未在摘要中找到")),
                                          1
                                          /* TEXT */
                                        )
                                      ],
                                      2
                                      /* CLASS */
                                    ),
                                    e.createElementVNode(
                                      "span",
                                      null,
                                      e.toDisplayString(o.$t("「{p0}」", { p0: W.quote })),
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
                              jt,
                              e.toDisplayString(o.$t("由 {p0} 精读", { p0: f.summary.model })),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0),
                        e.createElementVNode(
                          "p",
                          Ut,
                          e.toDisplayString(f.abstract || o.$t("这条没有摘要")),
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
            e.createVNode(P, {
              "step-key": "read",
              index: 1,
              title: T[1].title,
              hint: T[1].hint,
              runtime: A.value.read
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Rt, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!a.value || !b.value.length,
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
                      e.toDisplayString(o.$t("精读全部未读的（{n}）", { n: b.value.length })),
                      1
                      /* TEXT */
                    )
                  ], 8, Xt),
                  e.createElementVNode(
                    "span",
                    Gt,
                    e.toDisplayString(o.$t("每篇提炼问题、方法、发现、局限，依据句回摘要核对；点标题展开看结果")),
                    1
                    /* TEXT */
                  )
                ]),
                _.value.length ? (e.openBlock(), e.createElementBlock("ul", Jt, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(_.value, (f, K) => (e.openBlock(), e.createElementBlock("li", { key: K }, [
                      V[5] || (V[5] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(f),
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
            e.createVNode(P, {
              "step-key": "doi",
              index: 2,
              title: T[2].title,
              hint: T[2].hint,
              runtime: A.value.doi
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Zt, [
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
                  ], 8, Ht),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost",
                    disabled: !!a.value,
                    onClick: t
                  }, [
                    V[6] || (V[6] = e.createElementVNode(
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
                  ], 8, Qt)
                ]),
                w.value ? (e.openBlock(), e.createElementBlock(
                  "p",
                  Yt,
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
        V[2] || (V[2] = e.createElementVNode(
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
            onClick: V[0] || (V[0] = (f) => o.$emit("goto", "search"))
          },
          e.toDisplayString(o.$t("去文献检索")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), tl = /* @__PURE__ */ j(el, [["__scopeId", "data-v-f65d2db5"]]), ll = { class: "ss-module" }, nl = { class: "ss-panel aw-head" }, ol = { class: "ss-muted" }, sl = { class: "ss-steps" }, al = {
  key: 0,
  class: "ss-note warn"
}, rl = { class: "ss-actions" }, il = ["disabled"], cl = {
  key: 0,
  class: "ss-muted"
}, dl = {
  key: 1,
  class: "ss-muted"
}, ul = {
  key: 0,
  class: "ss-empty"
}, ml = { class: "aw-sec__head" }, pl = { class: "ss-chip brand" }, vl = ["onUpdate:modelValue", "placeholder"], yl = ["disabled", "title", "onClick"], hl = ["disabled", "title", "onClick"], kl = ["title", "onClick"], gl = { class: "ss-field" }, fl = ["value", "onInput"], El = { class: "aw-cites" }, Vl = { class: "ss-muted" }, Nl = ["title", "onClick"], bl = { class: "ss-actions" }, $l = ["disabled"], wl = {
  key: 0,
  class: "ss-muted"
}, _l = { class: "ss-actions" }, Sl = ["disabled"], Dl = {
  key: 0,
  class: "ss-muted"
}, Bl = /* @__PURE__ */ e.defineComponent({
  __name: "OutlineTab",
  emits: ["goto"],
  setup(N) {
    const u = F.useNotificationStore(), y = e.computed(() => (z.value, U())), m = e.computed(() => y.value?.library || []), b = e.computed(() => m.value.length), d = e.computed(() => y.value?.outline || []), w = e.ref([]), g = e.ref(!1), h = e.ref(""), v = e.ref({});
    e.watch(d, (n) => {
      g.value || (w.value = n.map((t) => ({ ...t, points: [...t.points], cites: [...t.cites] })));
    }, { immediate: !0, deep: !0 });
    const a = [
      { key: "generate", title: s.t("生成提纲"), hint: s.t("按论文类型和文献库拟各节标题、要点与引用") },
      { key: "edit", title: s.t("修改提纲"), hint: s.t("改标题、要点，勾选每节要引用的文献") },
      { key: "next", title: s.t("去写作"), hint: s.t("按提纲分节成稿") }
    ], E = e.computed(() => {
      const n = (t, l, r) => h.value === t ? { state: "running" } : v.value[t] ? { state: "failed", error: v.value[t] } : l ? { state: "done", summary: r } : { state: "todo" };
      return {
        generate: n("generate", d.value.length > 0, s.t("{n} 节", { n: d.value.length })),
        edit: n("edit", d.value.length > 0 && !g.value, s.t("已保存")),
        next: n("next", (y.value?.sections.length || 0) > 0, s.t("已开始写作"))
      };
    }), _ = e.computed(() => a.find((n) => E.value[n.key].state !== "done")?.key || "next");
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
      d.value.length && !window.confirm(s.t("重新生成会覆盖当前提纲，继续？")) || (g.value = !1, await T("generate", () => B("outline.generate")));
    }
    async function L() {
      await T("edit", () => B("outline.save", { outline: w.value })) && (g.value = !1, u.success(s.t("提纲已保存")));
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
    function C(n) {
      w.value = w.value.filter((t, l) => l !== n), g.value = !0;
    }
    function q() {
      w.value = [...w.value, { id: "", heading: "", points: [], cites: [] }], g.value = !0;
    }
    function i(n) {
      D.scrollToStep(n);
    }
    return (n, t) => (e.openBlock(), e.createElementBlock("div", ll, [
      e.createElementVNode("section", nl, [
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
            ol,
            e.toDisplayString(n.$t("只依据文献库里的文献拟提纲；每节标出要引用的文献，写作时模型只能引用这些。")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createVNode(G, {
        title: n.$t("提纲"),
        metas: a,
        runtime: E.value,
        "current-key": _.value,
        onJump: i
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", sl, [
        e.createVNode(P, {
          "step-key": "generate",
          index: 0,
          title: a[0].title,
          hint: a[0].hint,
          runtime: E.value.generate
        }, {
          default: e.withCtx(() => [
            b.value < 3 ? (e.openBlock(), e.createElementBlock("p", al, [
              t[4] || (t[4] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("文献库只有 {n} 篇，至少 3 篇才能拟提纲。", { n: b.value })) + " ",
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
            e.createElementVNode("div", rl, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: b.value < 3 || !!h.value,
                onClick: A
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(h.value === "generate" ? "ri-loader-4-line spin" : "ri-list-ordered")
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
              ], 8, il),
              y.value?.outlineModel ? (e.openBlock(), e.createElementBlock(
                "span",
                cl,
                e.toDisplayString(n.$t("由 {p0} 生成", { p0: y.value.outlineModel })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            d.value.length ? (e.openBlock(), e.createElementBlock(
              "p",
              dl,
              e.toDisplayString(n.$t("重新生成会覆盖下面的提纲（已写的正文不受影响）。")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(P, {
          "step-key": "edit",
          index: 1,
          title: a[1].title,
          hint: a[1].hint,
          runtime: E.value.edit
        }, {
          default: e.withCtx(() => [
            w.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "div",
              ul,
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
                e.createElementVNode("div", ml, [
                  e.createElementVNode(
                    "span",
                    pl,
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
                  }, null, 40, vl), [
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
                  ])], 8, yl),
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
                  ])], 8, hl),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    title: n.$t("删除这一节"),
                    onClick: (o) => C(r)
                  }, [...t[7] || (t[7] = [
                    e.createElementVNode(
                      "i",
                      { class: "ri-delete-bin-line" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])], 8, kl)
                ]),
                e.createElementVNode("label", gl, [
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
                  }, null, 40, fl)
                ]),
                e.createElementVNode("div", El, [
                  e.createElementVNode(
                    "span",
                    Vl,
                    e.toDisplayString(n.$t("本节引用：")),
                    1
                    /* TEXT */
                  ),
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(m.value, (o, V) => (e.openBlock(), e.createElementBlock("button", {
                      key: o.id,
                      type: "button",
                      class: e.normalizeClass(["aw-cite", { on: l.cites.includes(o.id) }]),
                      title: o.title,
                      onClick: (f) => $(l, o.id)
                    }, "[" + e.toDisplayString(V + 1) + "] " + e.toDisplayString(o.title.slice(0, 28)) + e.toDisplayString(o.title.length > 28 ? "…" : ""), 11, Nl))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]))),
              128
              /* KEYED_FRAGMENT */
            )),
            e.createElementVNode("div", bl, [
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
              ], 8, $l),
              g.value ? (e.openBlock(), e.createElementBlock(
                "span",
                wl,
                e.toDisplayString(n.$t("有未保存的修改")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(P, {
          "step-key": "next",
          index: 2,
          title: a[2].title,
          hint: a[2].hint,
          runtime: E.value.next
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", _l, [
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
              ], 8, Sl),
              g.value ? (e.openBlock(), e.createElementBlock(
                "span",
                Dl,
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
}), Cl = /* @__PURE__ */ j(Bl, [["__scopeId", "data-v-6943272f"]]), Tl = { class: "ss-module" }, Ll = { class: "ss-panel aw-head" }, Al = { class: "ss-muted" }, Ml = {
  key: 0,
  class: "ss-note info"
}, Ol = { class: "ss-steps" }, Il = {
  key: 0,
  class: "ss-note warn"
}, Wl = {
  key: 1,
  class: "ss-actions"
}, Pl = ["disabled"], ql = { class: "ss-muted" }, Kl = { class: "aw-sec__head" }, xl = { class: "ss-chip brand" }, zl = { class: "aw-grow" }, Fl = {
  key: 0,
  class: "ss-muted"
}, jl = ["disabled", "onClick"], Ul = {
  key: 0,
  class: "ss-note danger"
}, Rl = {
  key: 0,
  class: "ss-note danger"
}, Xl = ["value", "onBlur"], Gl = { class: "ss-note info" }, Jl = { class: "ss-actions" }, Zl = ["disabled"], Hl = ["disabled"], Ql = {
  key: 0,
  class: "ss-note danger"
}, Yl = {
  key: 1,
  class: "ss-note ok aw-ms"
}, en = { class: "ss-actions" }, tn = ["disabled"], ln = /* @__PURE__ */ e.defineComponent({
  __name: "WriteTab",
  emits: ["goto"],
  setup(N) {
    const u = F.useNotificationStore(), y = e.computed(() => (z.value, U())), m = e.computed(() => y.value?.outline || []), b = e.computed(() => y.value?.sections || []), d = (t) => b.value.find((l) => l.id === t), w = e.computed(() => m.value.filter((t) => !d(t.id)?.text.trim())), g = e.computed(() => b.value.some((t) => t.text.trim()) || !!y.value?.manuscript), h = e.ref(""), v = e.ref({}), a = e.ref(!1), E = e.computed(() => {
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
        return await B("write.section", { outlineId: t }), await I(), !0;
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
          await B("sections.save", { id: t, text: l }), await I();
        } catch (r) {
          u.error(D.errorMessage(r));
        }
    }
    async function k() {
      if (!(y.value?.manuscript && !window.confirm(s.t("会把当前稿子作为新文档载入双写编辑器，编辑器里没取回的修改会被替换。继续？")))) {
        h.value = "cowrite", v.value = { ...v.value, cowrite: "" };
        try {
          const t = await B("manuscript.compose");
          await re(y.value.title, t), a.value = !0, u.success(s.t("已载入人机双写编辑器，改完回来点「从双写编辑器取回」"));
        } catch (t) {
          v.value = { ...v.value, cowrite: q(t) };
        } finally {
          h.value = "";
        }
      }
    }
    async function C() {
      h.value = "pull", v.value = { ...v.value, cowrite: "" };
      try {
        const t = await ke(), l = await B("manuscript.save", { text: t });
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
          await B("manuscript.reset"), await I();
        } catch (t) {
          u.error(D.errorMessage(t));
        }
    }
    function n(t) {
      D.scrollToStep(t);
    }
    return (t, l) => (e.openBlock(), e.createElementBlock("div", Tl, [
      e.createElementVNode("section", Ll, [
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
            Al,
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
      h.value && e.unref(x).write ? (e.openBlock(), e.createElementBlock("p", Ml, [
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
      e.createElementVNode("div", Ol, [
        e.createVNode(P, {
          "step-key": "sections",
          index: 0,
          title: _[0].title,
          hint: _[0].hint,
          runtime: T.value.sections
        }, {
          default: e.withCtx(() => [
            m.value.length ? (e.openBlock(), e.createElementBlock("div", Wl, [
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
              ], 8, Pl),
              e.createElementVNode(
                "span",
                ql,
                e.toDisplayString(t.$t("已写 {a}/{b} 节", { a: m.value.length - w.value.length, b: m.value.length })),
                1
                /* TEXT */
              )
            ])) : (e.openBlock(), e.createElementBlock("p", Il, [
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
                e.createElementVNode("div", Kl, [
                  e.createElementVNode(
                    "span",
                    xl,
                    e.toDisplayString(o + 1),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "strong",
                    zl,
                    e.toDisplayString(r.heading),
                    1
                    /* TEXT */
                  ),
                  d(r.id)?.model ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Fl,
                    e.toDisplayString(t.$t("由 {p0} 写", { p0: d(r.id).model })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0),
                  e.createElementVNode("button", {
                    type: "button",
                    class: e.normalizeClass(["ss-btn sm", d(r.id) ? "ghost" : "primary"]),
                    disabled: !!h.value,
                    onClick: (V) => L(r.id)
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
                  ], 10, jl)
                ]),
                v.value[r.id] ? (e.openBlock(), e.createElementBlock("p", Ul, [
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
                    d(r.id).badRefs.length ? (e.openBlock(), e.createElementBlock("p", Rl, [
                      l[6] || (l[6] = e.createElementVNode(
                        "i",
                        { class: "ri-error-warning-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("引用了文献库里没有的编号：{p0}，请改成库里的编号或删掉", { p0: d(r.id).badRefs.map((V) => `[${V}]`).join(" ") })),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode("textarea", {
                      class: "aw-text",
                      value: d(r.id).text,
                      rows: "10",
                      dir: "auto",
                      onBlur: (V) => $(r.id, V.target.value)
                    }, null, 40, Xl)
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
        e.createVNode(P, {
          "step-key": "cowrite",
          index: 1,
          title: _[1].title,
          hint: _[1].hint,
          runtime: T.value.cowrite
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", Gl, [
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
            e.createElementVNode("div", Jl, [
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
              ], 8, Zl),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                disabled: !!h.value,
                onClick: C
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
              ], 8, Hl)
            ]),
            v.value.cowrite ? (e.openBlock(), e.createElementBlock("p", Ql, [
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
            y.value?.manuscript ? (e.openBlock(), e.createElementBlock("div", Yl, [
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
                e.toDisplayString(t.$t("当前以双写编辑器取回的版本为准（{p0}，{n} 字）", { p0: e.unref(D.fmtDateTime)(y.value.manuscriptAt), n: E.value })),
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
        e.createVNode(P, {
          "step-key": "next",
          index: 2,
          title: _[2].title,
          hint: _[2].hint,
          runtime: T.value.next
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", en, [
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
              ], 8, tn)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), nn = /* @__PURE__ */ j(ln, [["__scopeId", "data-v-7030b630"]]), Y = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/markdown.ts"];
if (!Y) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/markdown.ts");
Y.default;
const on = {
  class: "awv",
  role: "dialog",
  "aria-modal": "true"
}, sn = { class: "awv-bar" }, an = ["aria-expanded"], rn = {
  key: 0,
  class: "awv-menu",
  role: "menu"
}, cn = { class: "awv-menu__title" }, dn = {
  key: 0,
  class: "awv-menu awv-menu--sub",
  role: "menu"
}, un = {
  key: 0,
  class: "awv-muted"
}, mn = ["onClick"], pn = ["src"], vn = {
  key: 1,
  class: "ri-apps-line"
}, yn = {
  key: 2,
  class: "awv-default"
}, hn = {
  key: 1,
  class: "awv-muted"
}, kn = {
  key: 0,
  class: "awv-error"
}, gn = ["title"], fn = ["innerHTML"], En = /* @__PURE__ */ e.defineComponent({
  __name: "DocViewer",
  props: {
    path: {},
    markdown: {}
  },
  emits: ["close", "cowrite"],
  setup(N) {
    const u = N, y = e.computed(() => u.path.split(/[\\/]/).pop() || u.path), m = e.computed(() => /\.docx?$/i.test(u.path) ? "ri-file-word-2-line" : /\.bib$/i.test(u.path) ? "ri-book-2-line" : "ri-markdown-line"), b = e.computed(() => Y.renderMarkdown(u.markdown)), d = e.ref(!1), w = e.ref(!1), g = e.ref([]), h = e.ref(!1), v = e.ref(""), a = e.ref(null);
    async function E() {
      if (d.value = !d.value, d.value && !g.value.length && !h.value) {
        h.value = !0;
        try {
          g.value = await B("openIn.apps", { path: u.path });
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
    const T = ($) => _(() => B("openIn.open", { path: u.path, appPath: $ })), A = () => _(() => B("openIn.choose", { path: u.path })), L = () => _(() => B("path.open", { path: u.path, reveal: !0 }));
    function M($) {
      d.value && a.value && !a.value.contains($.target) && (d.value = !1);
    }
    return e.onMounted(() => document.addEventListener("mousedown", M)), e.onBeforeUnmount(() => document.removeEventListener("mousedown", M)), ($, k) => (e.openBlock(), e.createBlock(e.Teleport, { to: "body" }, [
      e.createElementVNode("div", {
        class: "awv-backdrop",
        onClick: k[5] || (k[5] = e.withModifiers((C) => $.$emit("close"), ["self"]))
      }, [
        e.createElementVNode("section", on, [
          e.createElementVNode("header", sn, [
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
                  onClick: E
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
                ], 8, an),
                d.value ? (e.openBlock(), e.createElementBlock("div", rn, [
                  e.createElementVNode("div", cn, [
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
                      onMouseenter: k[1] || (k[1] = (C) => w.value = !0),
                      onMouseleave: k[2] || (k[2] = (C) => w.value = !1)
                    },
                    [
                      e.createElementVNode("button", {
                        type: "button",
                        role: "menuitem",
                        class: "awv-item",
                        onClick: k[0] || (k[0] = (C) => w.value = !w.value)
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
                      w.value ? (e.openBlock(), e.createElementBlock("div", dn, [
                        h.value ? (e.openBlock(), e.createElementBlock("p", un, [
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
                          e.renderList(g.value, (C) => (e.openBlock(), e.createElementBlock("button", {
                            key: C.path,
                            type: "button",
                            role: "menuitem",
                            class: "awv-item",
                            onClick: (q) => T(C.path)
                          }, [
                            C.icon ? (e.openBlock(), e.createElementBlock("img", {
                              key: 0,
                              src: C.icon,
                              alt: "",
                              class: "awv-appicon"
                            }, null, 8, pn)) : (e.openBlock(), e.createElementBlock("i", vn)),
                            e.createElementVNode(
                              "span",
                              null,
                              e.toDisplayString(C.name),
                              1
                              /* TEXT */
                            ),
                            C.isDefault ? (e.openBlock(), e.createElementBlock(
                              "em",
                              yn,
                              e.toDisplayString($.$t("默认")),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0)
                          ], 8, mn))),
                          128
                          /* KEYED_FRAGMENT */
                        )),
                        !h.value && !g.value.length ? (e.openBlock(), e.createElementBlock(
                          "p",
                          hn,
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
                    onClick: k[3] || (k[3] = (C) => {
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
              kn,
              e.toDisplayString(v.value),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("button", {
              type: "button",
              class: "awv-icon",
              title: $.$t("关闭"),
              onClick: k[4] || (k[4] = (C) => $.$emit("close"))
            }, [...k[15] || (k[15] = [
              e.createElementVNode(
                "i",
                { class: "ri-close-line" },
                null,
                -1
                /* CACHED */
              )
            ])], 8, gn)
          ]),
          e.createCommentVNode(" eslint-disable-next-line vue/no-v-html "),
          e.createElementVNode("article", {
            class: "awv-paper",
            dir: "auto",
            innerHTML: b.value
          }, null, 8, fn)
        ])
      ])
    ]));
  }
}), Vn = /* @__PURE__ */ j(En, [["__scopeId", "data-v-8483e756"]]), Nn = { class: "ss-module" }, bn = { class: "ss-note warn" }, $n = { class: "ss-steps" }, wn = { class: "ss-actions" }, _n = ["disabled"], Sn = {
  key: 0,
  class: "ss-muted"
}, Dn = { class: "ss-kpis" }, Bn = { class: "ss-kpi" }, Cn = { class: "ss-kpi accent" }, Tn = { class: "ss-kpi" }, Ln = { class: "ss-kpi" }, An = {
  key: 0,
  class: "ss-note danger"
}, Mn = {
  key: 1,
  class: "ss-note ok"
}, On = {
  key: 2,
  class: "aw-list"
}, In = { class: "ss-subhead" }, Wn = {
  key: 3,
  class: "aw-list"
}, Pn = { class: "ss-subhead aw-bad" }, qn = { class: "ss-actions" }, Kn = { class: "ss-field aw-inline" }, xn = ["value"], zn = { value: "gbt7714" }, Fn = { value: "apa" }, jn = { value: "ieee" }, Un = ["disabled"], Rn = {
  key: 0,
  class: "aw-refs"
}, Xn = {
  key: 1,
  class: "ss-muted"
}, Gn = { class: "ss-actions" }, Jn = ["disabled"], Zn = ["disabled"], Hn = ["disabled"], Qn = { class: "ss-muted" }, Yn = {
  key: 0,
  class: "ss-empty"
}, eo = {
  key: 1,
  class: "ss-table-wrap"
}, to = { class: "ss-table" }, lo = ["title"], no = { class: "ss-chip" }, oo = { class: "aw-ops" }, so = ["onClick"], ao = ["onClick"], ro = { class: "ss-muted" }, io = /* @__PURE__ */ e.defineComponent({
  __name: "ExportTab",
  emits: ["goto"],
  setup(N) {
    const u = F.useNotificationStore(), y = e.computed(() => (z.value, U())), m = e.computed(() => y.value?.check || null), b = e.computed(() => y.value?.exports || []), d = e.ref([]), w = e.ref(!1), g = e.ref(""), h = e.ref({}), v = e.ref(null), a = [
      { key: "check", title: s.t("引用查验"), hint: s.t("库外编号、未被引用的文献、DOI 查不到的") },
      { key: "refs", title: s.t("参考文献"), hint: s.t("按所选格式由题录拼出，模型不参与") },
      { key: "export", title: s.t("导出"), hint: s.t("Word、Markdown、BibTeX") },
      { key: "files", title: s.t("预览与打开"), hint: s.t("内置预览，或选本机软件打开") }
    ], E = e.computed(() => {
      const l = (r, o, V) => g.value === r || r === "export" && ["docx", "md", "bib"].includes(g.value) ? { state: "running" } : h.value[r] ? { state: "failed", error: h.value[r] } : o ? { state: "done", summary: V } : { state: "todo" };
      return {
        check: l("check", !!m.value, m.value ? s.t("引用 {a} 篇，库外 {b} 处", { a: m.value.cited.length, b: m.value.badRefs.length }) : ""),
        refs: l("refs", d.value.length > 0, s.t("{n} 条", { n: d.value.length })),
        export: l("export", b.value.length > 0, s.t("{n} 个文件", { n: b.value.length })),
        files: l("files", !!v.value || b.value.length > 0, "")
      };
    }), _ = e.computed(() => a.find((l) => E.value[l.key].state !== "done")?.key || "files");
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
    const M = () => L("check", () => B("check.run"));
    async function $() {
      await L("refs", async () => {
        d.value = await B("references.preview"), w.value = !0;
      });
    }
    async function k(l) {
      try {
        await B("project.update", { patch: { style: l } }), await I(), w.value && await $();
      } catch (r) {
        u.error(D.errorMessage(r));
      }
    }
    async function C(l) {
      let r = "";
      await L(l, async () => {
        r = (await B("export", { format: l })).path;
      }) && r && await q(r, l);
    }
    async function q(l, r) {
      try {
        const o = r === "bib" ? s.t("BibTeX 文件包含文献库全部 {n} 条题录，可导入 Zotero、EndNote、NoteExpress 等文献管理软件。用左上角「打开方式」选本机软件查看。", { n: y.value?.library.length || 0 }) : await B("manuscript.rendered");
        v.value = { path: l, markdown: o };
      } catch (o) {
        u.error(D.errorMessage(o));
      }
    }
    function i(l) {
      B("path.open", { path: l, reveal: !0 }).catch((r) => u.error(D.errorMessage(r)));
    }
    async function n() {
      try {
        await re(y.value.title, await B("manuscript.compose")), v.value = null, u.success(s.t("已载入人机双写编辑器"));
      } catch (l) {
        u.error(D.errorMessage(l));
      }
    }
    function t(l) {
      D.scrollToStep(l);
    }
    return (l, r) => (e.openBlock(), e.createElementBlock("div", Nn, [
      e.createElementVNode("p", bn, [
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
        runtime: E.value,
        "current-key": _.value,
        onJump: t
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", $n, [
        e.createVNode(P, {
          "step-key": "check",
          index: 0,
          title: a[0].title,
          hint: a[0].hint,
          runtime: E.value.check
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", wn, [
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
              ], 8, _n),
              m.value ? (e.openBlock(), e.createElementBlock(
                "span",
                Sn,
                e.toDisplayString(e.unref(D.fmtDateTime)(m.value.at)),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            m.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                e.createElementVNode("div", Dn, [
                  e.createElementVNode("div", Bn, [
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
                  e.createElementVNode("div", Tn, [
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
                  e.createElementVNode("div", Ln, [
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
                m.value.badRefs.length ? (e.openBlock(), e.createElementBlock("p", An, [
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
                ])) : (e.openBlock(), e.createElementBlock("p", Mn, [
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
                m.value.uncited.length ? (e.openBlock(), e.createElementBlock("div", On, [
                  e.createElementVNode(
                    "div",
                    In,
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
                m.value.doiMissing.length ? (e.openBlock(), e.createElementBlock("div", Wn, [
                  e.createElementVNode(
                    "div",
                    Pn,
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
        e.createVNode(P, {
          "step-key": "refs",
          index: 1,
          title: a[1].title,
          hint: a[1].hint,
          runtime: E.value.refs
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", qn, [
              e.createElementVNode("label", Kn, [
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
                    zn,
                    e.toDisplayString(e.unref(J)("gbt7714")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "option",
                    Fn,
                    e.toDisplayString(e.unref(J)("apa")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "option",
                    jn,
                    e.toDisplayString(e.unref(J)("ieee")),
                    1
                    /* TEXT */
                  )
                ], 40, xn)
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
              ], 8, Un)
            ]),
            d.value.length ? (e.openBlock(), e.createElementBlock("ol", Rn, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(d.value, (o, V) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: V,
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
              Xn,
              e.toDisplayString(l.$t("稿子里还没有引用文献库的文献")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(P, {
          "step-key": "export",
          index: 2,
          title: a[2].title,
          hint: a[2].hint,
          runtime: E.value.export
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Gn, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!g.value,
                onClick: r[2] || (r[2] = (o) => C("docx"))
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
              ], 8, Jn),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                disabled: !!g.value,
                onClick: r[3] || (r[3] = (o) => C("md"))
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
              ], 8, Zn),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost",
                disabled: !!g.value || !y.value?.library.length,
                onClick: r[4] || (r[4] = (o) => C("bib"))
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
              ], 8, Hn)
            ]),
            e.createElementVNode(
              "p",
              Qn,
              e.toDisplayString(l.$t("导出时引用按所选格式重新编号，并在文末生成参考文献表；以双写编辑器取回的版本优先。")),
              1
              /* TEXT */
            )
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(P, {
          "step-key": "files",
          index: 3,
          title: a[3].title,
          hint: a[3].hint,
          runtime: E.value.files
        }, {
          default: e.withCtx(() => [
            b.value.length ? (e.openBlock(), e.createElementBlock("div", eo, [
              e.createElementVNode("table", to, [
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
                    e.renderList(b.value, (o) => (e.openBlock(), e.createElementBlock("tr", {
                      key: o.path
                    }, [
                      e.createElementVNode("td", {
                        class: "aw-file",
                        title: o.path
                      }, e.toDisplayString(o.path.split(/[\\/]/).pop()), 9, lo),
                      e.createElementVNode("td", null, [
                        e.createElementVNode(
                          "span",
                          no,
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
                      e.createElementVNode("td", oo, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (V) => q(o.path, o.kind)
                        }, e.toDisplayString(l.$t("预览")), 9, so),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (V) => i(o.path)
                        }, e.toDisplayString(l.$t("打开所在文件夹")), 9, ao)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : (e.openBlock(), e.createElementBlock(
              "div",
              Yn,
              e.toDisplayString(l.$t("还没有导出文件")),
              1
              /* TEXT */
            )),
            e.createElementVNode(
              "p",
              ro,
              e.toDisplayString(l.$t("预览里左上角的文件名下拉可以选本机软件打开（WPS、Pages、LibreOffice 等）。")),
              1
              /* TEXT */
            )
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ]),
      v.value ? (e.openBlock(), e.createBlock(Vn, {
        key: 0,
        path: v.value.path,
        markdown: v.value.markdown,
        onClose: r[5] || (r[5] = (o) => v.value = null),
        onCowrite: n
      }, null, 8, ["path", "markdown"])) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), co = /* @__PURE__ */ j(io, [["__scopeId", "data-v-8c00cca3"]]), ee = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!ee) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
ee.default;
const uo = { class: "ss-module" }, mo = { class: "ss-panel" }, po = { class: "ss-muted" }, vo = { class: "ss-actions" }, yo = { class: "aw-path" }, ho = ["disabled"], ko = { class: "ss-panel" }, go = { class: "ss-field" }, fo = { class: "ss-muted" }, Eo = { class: "ss-subhead" }, Vo = { class: "aw-sources" }, No = ["value"], bo = { class: "ss-actions" }, $o = ["disabled"], wo = {
  key: 0,
  class: "ss-muted"
}, _o = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  emits: ["goto"],
  setup(N) {
    const u = F.useNotificationStore(), y = z, m = ee.AW_API_SOURCES, b = e.ref(""), d = e.ref([]);
    e.watch(() => y.value?.settings, (a) => {
      a && (b.value = a.contactEmail || "", d.value = [...a.defaultSources || []]);
    }, { immediate: !0 });
    const w = e.computed(() => {
      const a = y.value?.settings;
      return a ? b.value !== (a.contactEmail || "") || [...d.value].sort().join() !== [...a.defaultSources || []].sort().join() : !1;
    });
    async function g() {
      try {
        await B("settings.patch", { patch: { contactEmail: b.value, defaultSources: d.value } }), await I(), u.success(s.t("已保存"));
      } catch (a) {
        u.error(D.errorMessage(a));
      }
    }
    async function h() {
      try {
        await B("outputDir.pick") && await I();
      } catch (a) {
        u.error(D.errorMessage(a));
      }
    }
    function v() {
      y.value?.outputDir && B("path.open", { path: y.value.outputDir }).catch((a) => u.error(D.errorMessage(a)));
    }
    return (a, E) => (e.openBlock(), e.createElementBlock("div", uo, [
      e.createElementVNode("section", mo, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            E[2] || (E[2] = e.createElementVNode(
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
            po,
            e.toDisplayString(a.$t("导出的 Word、Markdown、BibTeX 按论文题目分文件夹存放。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", vo, [
          e.createElementVNode(
            "code",
            yo,
            e.toDisplayString(e.unref(y)?.outputDir || "—"),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            onClick: h
          }, [
            E[3] || (E[3] = e.createElementVNode(
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
            E[4] || (E[4] = e.createElementVNode(
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
          ], 8, ho)
        ])
      ]),
      e.createElementVNode("section", ko, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            E[5] || (E[5] = e.createElementVNode(
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
        e.createElementVNode("label", go, [
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
              "onUpdate:modelValue": E[0] || (E[0] = (_) => b.value = _),
              type: "email",
              placeholder: "name@university.edu"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              e.vModelText,
              b.value,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        e.createElementVNode(
          "p",
          fo,
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
        e.createElementVNode("div", Vo, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(m), (_) => (e.openBlock(), e.createElementBlock("label", {
              key: _,
              class: "aw-check"
            }, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": E[1] || (E[1] = (T) => d.value = T),
                type: "checkbox",
                value: _
              }, null, 8, No), [
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
        e.createElementVNode("div", bo, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: !w.value || !d.value.length,
            onClick: g
          }, [
            E[6] || (E[6] = e.createElementVNode(
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
          ], 8, $o),
          d.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
            "span",
            wo,
            e.toDisplayString(a.$t("至少选一个来源")),
            1
            /* TEXT */
          ))
        ])
      ])
    ]));
  }
}), So = /* @__PURE__ */ j(_o, [["__scopeId", "data-v-afdea3fb"]]), Do = { class: "aw-workbench" }, Bo = { class: "workbench-header" }, Co = { class: "heading" }, To = { class: "eyebrow" }, Lo = { class: "subtitle" }, Ao = { class: "header-actions" }, Mo = ["disabled"], Oo = {
  key: 0,
  class: "aw-bar"
}, Io = { class: "aw-bar__pick" }, Wo = ["value"], Po = ["value"], qo = { class: "ss-chip" }, Ko = { class: "ss-chip" }, xo = { class: "ss-chip" }, zo = { class: "ss-chip brand" }, Fo = { class: "aw-rule" }, jo = {
  key: 1,
  class: "ss-panel"
}, Uo = { class: "ss-grid" }, Ro = { class: "ss-field aw-wide" }, Xo = { class: "ss-field" }, Go = ["placeholder"], Jo = { class: "ss-field" }, Zo = { value: "review" }, Ho = { value: "research" }, Qo = { value: "thesis" }, Yo = { value: "proposal" }, es = { class: "ss-field" }, ts = { value: "zh" }, ls = { class: "ss-field" }, ns = { class: "ss-field" }, os = { class: "ss-actions" }, ss = ["disabled"], as = {
  class: "aw-tabs",
  role: "tablist"
}, rs = ["title", "onClick"], is = {
  key: 0,
  class: "aw-badge"
}, cs = {
  key: 2,
  class: "ss-note info aw-progress"
}, ds = {
  key: 3,
  class: "aw-body"
}, us = {
  key: 4,
  class: "ss-note danger"
}, ms = {
  key: 5,
  class: "ss-note"
}, te = "totalclaw:academic-writer-tab:v1", ps = /* @__PURE__ */ e.defineComponent({
  __name: "AcademicWriterWorkbenchView",
  setup(N) {
    const u = { search: kt, library: tl, outline: Cl, write: nn, export: co, settings: So }, y = [
      { key: "search", icon: "ri-search-eye-line", title: s.t("文献检索"), desc: s.t("PubMed、Europe PMC、arXiv、Crossref、OpenAlex 一键检索；知网、万方等在内置浏览器打开并抓取") },
      { key: "library", icon: "ri-book-shelf-line", title: s.t("文献库与精读"), desc: s.t("问题、方法、发现、局限，依据句回摘要核对") },
      { key: "outline", icon: "ri-list-ordered-2", title: s.t("提纲"), desc: s.t("按文献库拟提纲，每节标出要引用的文献") },
      { key: "write", icon: "ri-quill-pen-line", title: s.t("写作与双写"), desc: s.t("分节成稿，送进人机双写编辑器由你改，再取回") },
      { key: "export", icon: "ri-file-word-2-line", title: s.t("参考文献与导出"), desc: s.t("引用查验、参考文献格式、导出与本机应用打开") }
    ], m = F.useNotificationStore(), b = z, d = e.computed(() => (b.value, U())), w = e.ref((() => {
      try {
        const i = localStorage.getItem(te);
        return i && (i === "settings" || y.some((n) => n.key === i)) ? i : "search";
      } catch {
        return "search";
      }
    })()), g = e.ref(!1), h = e.ref(!1), v = e.ref(""), a = e.ref(null), E = e.computed(() => x[w.value] || "");
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
          i ? await B("project.update", { patch: n }) : await B("project.create", { input: n }), a.value = null, await I();
        } catch (i) {
          m.error(D.errorMessage(i));
        }
    }
    async function M(i) {
      try {
        await B("project.switch", { id: i }), await I();
      } catch (n) {
        m.error(D.errorMessage(n));
      }
    }
    async function $(i) {
      const n = b.value?.projects.find((t) => t.id === i);
      if (!(!n || !window.confirm(s.t("删除论文「{p0}」及其文献库、提纲和稿子？已导出的文件不会删。", { p0: n.title }))))
        try {
          await B("project.remove", { id: i }), a.value = null, await I();
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
    let C = null, q = null;
    return e.onMounted(() => {
      k(), q = ve((i) => {
        if (i.type === "progress" && i.payload?.key) {
          x[String(i.payload.key)] = String(i.payload.message || "");
          return;
        }
        C || (C = setTimeout(() => {
          C = null, I().catch(() => {
          });
        }, 300));
      });
    }), e.onBeforeUnmount(() => {
      q?.(), C && clearTimeout(C);
    }), (i, n) => (e.openBlock(), e.createElementBlock("div", Do, [
      e.createElementVNode("header", Bo, [
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
              To,
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
              Lo,
              e.toDisplayString(i.$t("检索真实文献、精读、拟提纲、分节成稿，再到人机双写编辑器里由你改定。参考文献只来自你的文献库，AI 不编造文献；成稿是草稿，学术责任在作者。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Ao, [
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
          ], 8, Mo)
        ])
      ]),
      e.createCommentVNode(" 论文项目 "),
      d.value ? (e.openBlock(), e.createElementBlock("section", Oo, [
        e.createElementVNode("label", Io, [
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
            value: e.unref(b)?.activeProjectId,
            onChange: n[0] || (n[0] = (t) => M(t.target.value))
          }, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(b)?.projects || [], (t) => (e.openBlock(), e.createElementBlock("option", {
                key: t.id,
                value: t.id
              }, e.toDisplayString(t.title), 9, Po))),
              128
              /* KEYED_FRAGMENT */
            ))
          ], 40, Wo)
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
          Ko,
          e.toDisplayString(d.value.language === "en" ? "English" : i.$t("中文")),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          xo,
          e.toDisplayString(e.unref(J)(d.value.style)),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "span",
          zo,
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
        e.createElementVNode("span", Fo, [
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
      a.value ? (e.openBlock(), e.createElementBlock("section", jo, [
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
        e.createElementVNode("div", Uo, [
          e.createElementVNode("label", Ro, [
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
          e.createElementVNode("label", Xo, [
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
            }, null, 8, Go), [
              [
                e.vModelText,
                a.value.field,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Jo, [
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
                  Zo,
                  e.toDisplayString(e.unref(R)("review")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  Ho,
                  e.toDisplayString(e.unref(R)("research")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  Qo,
                  e.toDisplayString(e.unref(R)("thesis")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  Yo,
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
          e.createElementVNode("label", es, [
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
                  ts,
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
          e.createElementVNode("label", ls, [
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
        e.createElementVNode("label", ns, [
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
        e.createElementVNode("div", os, [
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
          ], 8, ss),
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
      e.createElementVNode("nav", as, [
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
              is,
              e.toDisplayString(_(t.key)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, rs)),
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
      E.value ? (e.openBlock(), e.createElementBlock("p", cs, [
        n[24] || (n[24] = e.createElementVNode(
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
      g.value && d.value ? (e.openBlock(), e.createElementBlock("div", ds, [
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
      ])) : v.value ? (e.openBlock(), e.createElementBlock("p", us, [
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
      ])) : (e.openBlock(), e.createElementBlock("p", ms, [
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
}), vs = /* @__PURE__ */ j(ps, [["__scopeId", "data-v-986d43f2"]]);
export {
  vs as default
};
