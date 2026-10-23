const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const n = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/i18n"];
if (!n) throw new Error("宿主模块未就绪：npm:@totalclaw/i18n");
n.default;
const ue = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!ue) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const he = ue.default, E = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/humanize.ts"];
if (!E) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/humanize.ts");
E.default;
const Z = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!Z) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
Z.default;
const M = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/usMarketSession.ts"];
if (!M) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/usMarketSession.ts");
M.default;
const c = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/shared/marketIntel.ts"];
if (!c) throw new Error("宿主模块未就绪：apps/desktop-shell/src/shared/marketIntel.ts");
c.default;
const fe = { class: "intel-page" }, Ee = { class: "intel-hero" }, ye = { class: "hero-text" }, Se = { class: "hero-kicker" }, Ve = { class: "hero-sub" }, Ne = { class: "hero-actions" }, Te = ["disabled"], we = { class: "intel-bar" }, De = { class: "bar-status" }, be = { key: 0 }, Be = { key: 1 }, Ce = { key: 2 }, Le = ["title"], $e = { class: "bar-filters" }, Ae = {
  class: "seg",
  role: "tablist"
}, Oe = ["onClick"], Me = {
  class: "seg",
  role: "tablist"
}, We = {
  class: "seg",
  role: "tablist"
}, Ke = ["title", "onClick"], Ie = { class: "toggle" }, Fe = { class: "intel-grid" }, ze = { class: "stream-card" }, Ue = { class: "card-head" }, Pe = {
  key: 0,
  class: "state-err"
}, Re = {
  key: 1,
  class: "state-empty"
}, je = {
  key: 2,
  class: "state-empty"
}, Ge = {
  key: 3,
  class: "stream"
}, xe = ["datetime"], He = { class: "item-body" }, Je = { class: "item-meta" }, Ye = {
  key: 0,
  class: "tag mkt"
}, Ze = { class: "tag src" }, Qe = { class: "item-title" }, Xe = ["title", "onClick"], qe = { class: "side-col" }, et = { class: "side-card" }, tt = { class: "card-head" }, lt = { class: "wl-search" }, ot = ["placeholder", "onKeydown"], nt = {
  key: 0,
  class: "wl-suggest"
}, st = ["onMousedown"], at = {
  key: 0,
  class: "tag mkt"
}, rt = {
  key: 0,
  class: "state-empty"
}, it = {
  key: 1,
  class: "quotes"
}, ct = { class: "q-main" }, ut = { class: "q-pair" }, dt = {
  key: 0,
  class: "tag mkt"
}, pt = { class: "q-last" }, mt = { class: "q-pct" }, vt = { class: "q-sub" }, _t = { key: 0 }, kt = { key: 1 }, gt = {
  key: 2,
  class: "muted"
}, ht = ["title", "onClick"], ft = ["title", "onClick"], Et = { class: "side-card ai-card" }, yt = { class: "card-head" }, St = { key: 0 }, Vt = { class: "ai-scope" }, Nt = ["disabled"], Tt = {
  key: 0,
  class: "ai-text"
}, wt = {
  key: 1,
  class: "state-err"
}, Dt = {
  key: 2,
  class: "state-empty"
}, bt = 9e4, O = 12, ie = 40, ce = "totalclaw.market-intel.watchlist.v1", Bt = /* @__PURE__ */ e.defineComponent({
  __name: "IndustryWatchView",
  setup(W) {
    const y = Z.useNotificationStore(), k = [
      { ms: 36e5, label: n.t("最近 1 小时") },
      { ms: 4 * 36e5, label: n.t("最近 4 小时") },
      { ms: 24 * 36e5, label: n.t("最近 24 小时") }
    ], S = { crypto: n.t("加密"), stocks: n.t("美股"), indices: n.t("指数"), other: n.t("商品外汇") }, K = [
      { id: "all", label: n.t("全部") },
      ...Object.keys(S).map((t) => ({ id: t, label: S[t] }))
    ], D = (t) => S[t], u = e.ref(!0), d = e.ref(!1), V = e.ref(""), g = e.ref(""), I = e.ref({}), h = e.ref(null), p = e.ref([]), b = e.ref(k[2].ms), m = e.ref("all"), F = e.ref("all"), z = e.ref(!1), N = e.ref(Date.now()), Q = e.computed(() => M.usMarketSession(new Date(N.value))), U = e.computed(() => M.usMarketSessionLabel(Q.value)), r = e.ref(de()), B = e.ref(""), P = e.ref(!0), R = e.ref(""), C = e.ref(""), j = e.ref(""), f = e.ref(!1), v = (t) => t.split("_")[0], G = e.computed(() => k.find((t) => t.ms === b.value)?.label || ""), _ = e.computed(() => c.filterEvents(p.value, {
      windowMs: b.value,
      type: m.value,
      watchOnly: z.value,
      now: N.value,
      market: F.value
    })), x = e.computed(() => r.value.map((t) => {
      const o = h.value?.spot.find((w) => w.pair === t), l = h.value?.futures.find((w) => w.contract === t), s = o || l;
      return {
        pair: t,
        market: o ? "crypto" : l?.market,
        url: o ? c.GATE_SPOT_URL(t) : c.GATE_FUTURES_URL(t),
        last: s?.last || 0,
        pct: s?.pct || 0,
        high: s?.high || 0,
        low: s?.low || 0,
        funding: l ? l.funding : null
      };
    })), X = e.computed(() => Object.fromEntries(x.value.filter((t) => t.market).map((t) => [v(t.pair), t.market]))), L = e.computed(() => {
      const t = B.value.trim();
      return !t || !P.value || !h.value ? [] : [
        ...h.value.spot.map((l) => ({ pair: l.pair, pct: l.pct, vol: l.quoteVol, market: "crypto" })),
        ...h.value.futures.filter((l) => l.market && l.market !== "crypto").map((l) => ({ pair: l.contract, pct: l.pct, vol: l.settleVol, market: l.market }))
      ].map((l) => ({ ...l, rank: c.searchRank(v(l.pair), t) })).filter((l) => l.rank && !r.value.includes(l.pair)).sort((l, s) => s.rank - l.rank || s.vol - l.vol).slice(0, 8);
    });
    function de() {
      try {
        const t = JSON.parse(localStorage.getItem(ce) || "null");
        if (Array.isArray(t)) return t.filter((o) => typeof o == "string" && /^[A-Z0-9]+_USDT$/.test(o)).slice(0, O);
      } catch {
      }
      return ["BTC_USDT", "ETH_USDT", "SOL_USDT"];
    }
    function q() {
      try {
        localStorage.setItem(ce, JSON.stringify(r.value));
      } catch {
      }
    }
    function ee(t) {
      if (!r.value.includes(t)) {
        if (r.value.length >= O) {
          y.warn(n.t("自选最多 {p0} 个", { p0: O }));
          return;
        }
        r.value = [...r.value, t], B.value = "", q(), te(), $();
      }
    }
    function pe(t) {
      r.value = r.value.filter((o) => o !== t), q(), te();
    }
    function me() {
      L.value[0] && ee(L.value[0].pair);
    }
    function ve() {
      P.value = !1, window.setTimeout(() => {
        P.value = !0;
      }, 200);
    }
    function te() {
      const t = r.value.map(v);
      p.value = p.value.map((o) => o.kind === "news" ? c.newsToEvents([{ at: o.at, text: o.text || "", source: o.source, url: o.url }], r.value, X.value)[0] : { ...o, hits: o.pair && t.includes(v(o.pair)) ? [v(o.pair)] : [] });
    }
    async function $() {
      if (!d.value) {
        d.value = !0;
        try {
          const t = await window.electronAPI?.solution?.marketIntel?.({ pairs: [...r.value] }).catch((o) => ({ ok: !1, error: E.humanizeErrorMessage(o) }));
          if (!t?.ok) {
            const o = E.humanizeErrorMessage(t?.error || n.t("行情接口不可用"));
            p.value.length ? y.warn(o) : g.value = o, I.value = t?.errors || {};
            return;
          }
          g.value = "", h.value = t.snapshot, I.value = t.errors || {}, p.value = c.mergeEvents(p.value, [
            ...c.deriveMarketEvents(t.snapshot, r.value),
            ...c.newsToEvents(t.snapshot.news, r.value, X.value)
          ]), N.value = Date.now(), V.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
        } finally {
          d.value = !1;
        }
      }
    }
    async function le(t) {
      try {
        const o = window.electronAPI?.browserTabs;
        if (!o?.create) throw new Error(n.t("浏览器接口不可用"));
        await o.create({ url: t, source: "agent", activate: !0 }), await o.setVisible?.(!0);
      } catch (o) {
        y.error(E.humanizeErrorMessage(o));
      }
    }
    function _e(t) {
      return { mover: n.t("异动"), range: n.t("高低点"), funding: n.t("资金费率"), liq: n.t("强平"), news: n.t("新闻") }[t];
    }
    function H(t) {
      const o = { cointelegraph: "Cointelegraph", coindesk: "CoinDesk" }, l = {
        "gate-spot": n.t("Gate 现货"),
        "gate-futures": n.t("Gate 合约"),
        "gate-contracts": n.t("Gate 合约分类"),
        sina: n.t("新浪 7×24"),
        wallstreetcn: n.t("华尔街见闻"),
        "cls-hot": n.t("财联社")
      };
      return o[t] || l[t] || t;
    }
    function oe(t) {
      const o = t.pair ? v(t.pair) : "";
      switch (t.kind) {
        case "mover":
          return n.t("{p0} 24 小时{p1} {p2}，现价 {p3}，成交额 {p4}", { p0: o, p1: t.v.pct >= 0 ? n.t("涨") : n.t("跌"), p2: A(Math.abs(t.v.pct)), p3: i(t.v.last), p4: se(t.v.vol) });
        case "range":
          return n.t("{p0} 触及 24 小时{p1} {p2}（区间 {p3} ~ {p4}）", { p0: o, p1: t.v.side > 0 ? n.t("新高") : n.t("新低"), p2: i(t.v.last), p3: i(t.v.low), p4: i(t.v.high) });
        case "funding":
          return n.t("{p0} 永续资金费率 {p1}，{p2}", { p0: o, p1: J(t.v.rate), p2: t.v.rate > 0 ? n.t("多头拥挤") : n.t("空头拥挤") });
        case "liq":
          return n.t("{p0} {p1}强平约 {p2} USDT，成交价 {p3}", { p0: o, p1: t.v.side > 0 ? n.t("多头") : n.t("空头"), p2: se(t.v.usd), p3: i(t.v.price) });
        default:
          return t.text || "";
      }
    }
    function ne(t) {
      const o = new Date(t), l = o.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return o.toDateString() === new Date(N.value).toDateString() ? l : `${o.toLocaleDateString([], { month: "numeric", day: "numeric" })} ${l}`;
    }
    function i(t) {
      return Number.isFinite(t) ? t >= 1e3 ? t.toLocaleString(void 0, { maximumFractionDigits: 1 }) : t >= 1 ? t.toLocaleString(void 0, { maximumFractionDigits: 4 }) : t.toLocaleString(void 0, { maximumSignificantDigits: 4 }) : "—";
    }
    function A(t) {
      return `${t > 0 ? "+" : ""}${t.toFixed(2)}%`;
    }
    function J(t) {
      return `${t > 0 ? "+" : ""}${(t * 100).toFixed(4)}%`;
    }
    function se(t) {
      return t >= 1e9 ? `${(t / 1e9).toFixed(2)}B` : t >= 1e6 ? `${(t / 1e6).toFixed(2)}M` : t >= 1e3 ? `${(t / 1e3).toFixed(0)}K` : t.toFixed(0);
    }
    async function ke() {
      if (!(f.value || !_.value.length)) {
        f.value = !0, C.value = "";
        try {
          const t = window.electronAPI;
          if (!t?.llmOneshot) throw new Error(n.t("默认 LLM 服务尚未就绪"));
          const l = _.value.slice(0, ie).map((a, ge) => `#${ge + 1} [${ne(a.at)}] [${H(a.source)}] ${oe(a)}`).join(`
`), s = x.value.filter((a) => a.last).map((a) => n.t("{p0} 现价 {p1} 24h {p2} 区间 {p3}~{p4}{p5}", { p0: a.market && a.market !== "crypto" ? `${a.pair}（${D(a.market)}）` : a.pair, p1: i(a.last), p2: A(a.pct), p3: i(a.low), p4: i(a.high), p5: a.funding === null ? "" : n.t(" 资金费率 {p0}", { p0: J(a.funding) }) })).join(`
`), w = await t.llmOneshot({
            systemPrompt: [
              n.t("你是给企业负责人做加密与美股盘面速读的分析师。加密市场 7×24 交易，没有开盘收盘之分；美股行情来自 gate.io 永续合约，也 7×24 有报价，但标的只在美东交易时段真实成交。"),
              n.t("当前美股盘态（由系统按美东时间含夏令时计算，以此为准，不要自行推断）：{p0}。", { p0: U.value }),
              n.t("只依据下面编号列出的情报条目和自选行情说话，不得引入任何未给出的消息、数据或传闻；提到某条情报时在句末用 [#编号] 标注引用。"),
              n.t("输出四句话以内的中文速读：第一句讲整体方向，第二句讲最值得注意的异动或消息，第三句讲风险信号（强平 / 费率 / 极端波动），第四句给一个观察建议。"),
              n.t("不要给出买卖建议，不要预测点位，不要用 Markdown。")
            ].join(`
`),
            prompt: n.t(`时间窗：{p0}

情报条目：
{p1}

自选行情：
{p2}`, { p0: G.value, p1: l, p2: s || n.t("（自选为空）") }),
            timeoutMs: 55e3,
            // 纯补全：一句进一句出的文本生成，禁工具（同 F1 修复）
            plainCompletion: !0
          }), re = String(w?.text || "").trim();
          if (!re) throw new Error(n.t("模型没有返回内容"));
          R.value = re, j.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
        } catch (t) {
          C.value = n.t("AI 研判失败：{p0}", { p0: E.humanizeErrorMessage(t) });
        } finally {
          f.value = !1;
        }
      }
    }
    let T = null, Y = null;
    function ae() {
      T && window.clearInterval(T), T = u.value ? window.setInterval(() => {
        $();
      }, bt) : null;
    }
    return e.watch(u, ae), e.onMounted(() => {
      $(), ae(), Y = window.setInterval(() => {
        N.value = Date.now();
      }, 3e4);
    }), e.onBeforeUnmount(() => {
      T && window.clearInterval(T), Y && window.clearInterval(Y);
    }), (t, o) => (e.openBlock(), e.createElementBlock("div", fe, [
      e.createElementVNode("header", Ee, [
        e.createVNode(he),
        e.createElementVNode("div", ye, [
          e.createElementVNode("p", Se, [
            o[6] || (o[6] = e.createElementVNode(
              "i",
              { class: "ri-radar-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("盘面情报台")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "h1",
            null,
            e.toDisplayString(t.$t("24 小时盘面情报")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "p",
            Ve,
            e.toDisplayString(t.$t("加密与美股 7×24 不收盘：gate.io 现货与永续行情异动、多源新闻快讯汇成同一条时间线，每条可回溯原文，随时 AI 研判。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ne, [
          e.createElementVNode("button", {
            class: "ghost-btn",
            type: "button",
            onClick: o[0] || (o[0] = (l) => u.value = !u.value)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(u.value ? "ri-pause-line" : "ri-play-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              " " + e.toDisplayString(u.value ? t.$t("暂停自动刷新") : t.$t("恢复自动刷新")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            class: "primary-btn",
            type: "button",
            disabled: d.value,
            onClick: $
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(d.value ? "ri-loader-4-line spin" : "ri-refresh-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(d.value ? t.$t("刷新中…") : t.$t("立即刷新")),
              1
              /* TEXT */
            )
          ], 8, Te)
        ])
      ]),
      e.createCommentVNode(" 状态条常驻视口顶部：刷新状态、各源成败、筛选都在这一条上，滚到哪都看得见 "),
      e.createElementVNode("section", we, [
        e.createElementVNode("div", De, [
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["live-dot", { beat: u.value && !g.value, err: !!g.value }])
            },
            null,
            2
            /* CLASS */
          ),
          d.value && !V.value ? (e.openBlock(), e.createElementBlock(
            "strong",
            be,
            e.toDisplayString(t.$t("正在拉取行情与快讯…")),
            1
            /* TEXT */
          )) : V.value ? (e.openBlock(), e.createElementBlock(
            "strong",
            Be,
            e.toDisplayString(t.$t("最近更新 {p0}", { p0: V.value })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          V.value ? (e.openBlock(), e.createElementBlock(
            "small",
            Ce,
            e.toDisplayString(u.value ? t.$t("每 90 秒自动刷新") : t.$t("自动刷新已暂停")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(I.value, (l, s) => (e.openBlock(), e.createElementBlock("span", {
              key: s,
              class: "src-err",
              title: l
            }, [
              o[7] || (o[7] = e.createElementVNode(
                "i",
                { class: "ri-error-warning-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(H(String(s))),
                1
                /* TEXT */
              )
            ], 8, Le))),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        e.createElementVNode("div", $e, [
          e.createElementVNode("div", Ae, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(k, (l) => e.createElementVNode("button", {
                key: l.ms,
                type: "button",
                class: e.normalizeClass({ on: b.value === l.ms }),
                onClick: (s) => b.value = l.ms
              }, e.toDisplayString(l.label), 11, Oe)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.createElementVNode("div", Me, [
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: e.normalizeClass({ on: m.value === "all" }),
                onClick: o[1] || (o[1] = (l) => m.value = "all")
              },
              e.toDisplayString(t.$t("全部")),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: e.normalizeClass({ on: m.value === "market" }),
                onClick: o[2] || (o[2] = (l) => m.value = "market")
              },
              e.toDisplayString(t.$t("盘面异动")),
              3
              /* TEXT, CLASS */
            ),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: e.normalizeClass({ on: m.value === "news" }),
                onClick: o[3] || (o[3] = (l) => m.value = "news")
              },
              e.toDisplayString(t.$t("新闻")),
              3
              /* TEXT, CLASS */
            )
          ]),
          e.createCommentVNode(" 市场维度。美股永续 7×24 有价，但标的只在美东交易时段真成交——徽标告诉用户现在的价是不是在跟活盘 "),
          e.createElementVNode("div", We, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(K, (l) => e.createElementVNode("button", {
                key: l.id,
                type: "button",
                class: e.normalizeClass({ on: F.value === l.id }),
                title: l.id === "stocks" ? t.$t("美股盘态按美东时间（含夏令时）计算") : void 0,
                onClick: (s) => F.value = l.id
              }, [
                e.createTextVNode(
                  e.toDisplayString(l.label),
                  1
                  /* TEXT */
                ),
                l.id === "stocks" ? (e.openBlock(), e.createElementBlock(
                  "small",
                  {
                    key: 0,
                    class: e.normalizeClass(["session", Q.value])
                  },
                  e.toDisplayString(U.value),
                  3
                  /* TEXT, CLASS */
                )) : e.createCommentVNode("v-if", !0)
              ], 10, Ke)),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          e.createElementVNode("label", Ie, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": o[4] || (o[4] = (l) => z.value = l),
                type: "checkbox"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, z.value]
            ]),
            e.createTextVNode(
              e.toDisplayString(t.$t("只看自选")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createElementVNode("div", Fe, [
        e.createCommentVNode(" 主栏：情报流。每条都指回 gate.io 交易页或新闻原文，点得回去才算证据。 "),
        e.createElementVNode("section", ze, [
          e.createElementVNode("div", Ue, [
            e.createElementVNode(
              "h2",
              null,
              e.toDisplayString(t.$t("情报流")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "small",
              null,
              e.toDisplayString(t.$t("{p0} 条 · {p1}", { p0: _.value.length, p1: G.value })),
              1
              /* TEXT */
            )
          ]),
          g.value ? (e.openBlock(), e.createElementBlock("p", Pe, [
            o[8] || (o[8] = e.createElementVNode(
              "i",
              { class: "ri-wifi-off-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(g.value),
              1
              /* TEXT */
            )
          ])) : !p.value.length && d.value ? (e.openBlock(), e.createElementBlock("div", Re, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(4, (l) => e.createElementVNode("span", {
                key: l,
                class: "skeleton"
              })),
              64
              /* STABLE_FRAGMENT */
            ))
          ])) : _.value.length ? (e.openBlock(), e.createElementBlock("ol", Ge, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(_.value, (l) => (e.openBlock(), e.createElementBlock(
                "li",
                {
                  key: l.id,
                  class: e.normalizeClass(["item", [`is-${l.level}`, { "is-hit": l.hits.length }]])
                },
                [
                  e.createElementVNode("time", {
                    class: "item-time",
                    datetime: new Date(l.at).toISOString()
                  }, e.toDisplayString(ne(l.at)), 9, xe),
                  e.createElementVNode("div", He, [
                    e.createElementVNode("div", Je, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["tag kind", l.kind])
                        },
                        e.toDisplayString(_e(l.kind)),
                        3
                        /* TEXT, CLASS */
                      ),
                      l.market && l.market !== "crypto" ? (e.openBlock(), e.createElementBlock(
                        "span",
                        Ye,
                        e.toDisplayString(D(l.market)),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode(
                        "span",
                        Ze,
                        e.toDisplayString(H(l.source)),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(l.hits, (s) => (e.openBlock(), e.createElementBlock(
                          "span",
                          {
                            key: s,
                            class: "tag hit"
                          },
                          e.toDisplayString(s),
                          1
                          /* TEXT */
                        ))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode(
                      "p",
                      Qe,
                      e.toDisplayString(oe(l)),
                      1
                      /* TEXT */
                    )
                  ]),
                  l.url ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    class: "link-btn",
                    type: "button",
                    title: l.url,
                    onClick: (s) => le(l.url)
                  }, [
                    o[9] || (o[9] = e.createElementVNode(
                      "i",
                      { class: "ri-external-link-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("查看原文")),
                      1
                      /* TEXT */
                    )
                  ], 8, Xe)) : e.createCommentVNode("v-if", !0)
                ],
                2
                /* CLASS */
              ))),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : (e.openBlock(), e.createElementBlock(
            "p",
            je,
            e.toDisplayString(t.$t("这个时间窗内没有符合条件的情报——试试放宽到 24 小时或取消「只看自选」。")),
            1
            /* TEXT */
          ))
        ]),
        e.createElementVNode("aside", qe, [
          e.createCommentVNode(" 自选：存交易对不存名字。加密在现货列表里搜，美股 / 指数在合约列表里搜（gate.io 返回的就是全集） "),
          e.createElementVNode("section", et, [
            e.createElementVNode("div", tt, [
              e.createElementVNode(
                "h2",
                null,
                e.toDisplayString(t.$t("自选行情")),
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "small",
                null,
                e.toDisplayString(t.$t("gate.io · {p0}/{p1}", { p0: r.value.length, p1: O })),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", lt, [
              o[10] || (o[10] = e.createElementVNode(
                "i",
                { class: "ri-search-line" },
                null,
                -1
                /* CACHED */
              )),
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": o[5] || (o[5] = (l) => B.value = l),
                type: "text",
                placeholder: t.$t("加自选：币种或美股代码，如 BTC / NVDA / 英伟达"),
                onKeydown: e.withKeys(e.withModifiers(me, ["prevent"]), ["enter"]),
                onBlur: ve
              }, null, 40, ot), [
                [e.vModelText, B.value]
              ]),
              L.value.length ? (e.openBlock(), e.createElementBlock("ul", nt, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(L.value, (l) => (e.openBlock(), e.createElementBlock("li", {
                    key: l.pair,
                    onMousedown: e.withModifiers((s) => ee(l.pair), ["prevent"])
                  }, [
                    e.createElementVNode("strong", null, [
                      e.createTextVNode(
                        e.toDisplayString(l.pair.replace("_", " / ")),
                        1
                        /* TEXT */
                      ),
                      l.market !== "crypto" ? (e.openBlock(), e.createElementBlock(
                        "span",
                        at,
                        e.toDisplayString(D(l.market)),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode(
                      "small",
                      {
                        class: e.normalizeClass(l.pct >= 0 ? "up" : "down")
                      },
                      e.toDisplayString(A(l.pct)),
                      3
                      /* TEXT, CLASS */
                    )
                  ], 40, st))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : e.createCommentVNode("v-if", !0)
            ]),
            r.value.length ? (e.openBlock(), e.createElementBlock("ul", it, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(x.value, (l) => (e.openBlock(), e.createElementBlock(
                  "li",
                  {
                    key: l.pair,
                    class: e.normalizeClass(["quote", l.last ? l.pct >= 0 ? "up" : "down" : ""])
                  },
                  [
                    e.createElementVNode("div", ct, [
                      e.createElementVNode("strong", ut, [
                        e.createTextVNode(
                          e.toDisplayString(v(l.pair)),
                          1
                          /* TEXT */
                        ),
                        o[11] || (o[11] = e.createElementVNode(
                          "small",
                          null,
                          "/USDT",
                          -1
                          /* CACHED */
                        ))
                      ]),
                      l.market && l.market !== "crypto" ? (e.openBlock(), e.createElementBlock("span", dt, [
                        e.createTextVNode(
                          e.toDisplayString(D(l.market)),
                          1
                          /* TEXT */
                        ),
                        l.market === "stocks" ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createTextVNode(
                              " · " + e.toDisplayString(U.value),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0)
                      ])) : e.createCommentVNode("v-if", !0),
                      e.createElementVNode(
                        "span",
                        pt,
                        e.toDisplayString(l.last ? i(l.last) : "—"),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        mt,
                        e.toDisplayString(l.last ? A(l.pct) : ""),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", vt, [
                      l.last ? (e.openBlock(), e.createElementBlock(
                        "span",
                        _t,
                        e.toDisplayString(t.$t("24h {p0} ~ {p1}", { p0: i(l.low), p1: i(l.high) })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      l.funding !== null ? (e.openBlock(), e.createElementBlock(
                        "span",
                        kt,
                        e.toDisplayString(t.$t("费率 {p0}", { p0: J(l.funding) })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0),
                      l.last ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                        "span",
                        gt,
                        e.toDisplayString(t.$t("等待行情…")),
                        1
                        /* TEXT */
                      )),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "icon-btn",
                        title: t.$t("在 gate.io 查看"),
                        onClick: (s) => le(l.url)
                      }, [...o[12] || (o[12] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-external-link-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, ht),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "icon-btn",
                        title: t.$t("移出自选"),
                        onClick: (s) => pe(l.pair)
                      }, [...o[13] || (o[13] = [
                        e.createElementVNode(
                          "i",
                          { class: "ri-close-line" },
                          null,
                          -1
                          /* CACHED */
                        )
                      ])], 8, ft)
                    ])
                  ],
                  2
                  /* CLASS */
                ))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              rt,
              e.toDisplayString(t.$t("自选为空，上面搜一个加进来")),
              1
              /* TEXT */
            ))
          ]),
          e.createCommentVNode(" AI 研判：按需、随时，只吃当前筛选窗内的情报 + 自选行情，并要求逐条引用 "),
          e.createElementVNode("section", Et, [
            e.createElementVNode("div", yt, [
              e.createElementVNode("h2", null, [
                o[14] || (o[14] = e.createElementVNode(
                  "i",
                  { class: "ri-radar-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(t.$t("AI 研判")),
                  1
                  /* TEXT */
                )
              ]),
              j.value ? (e.openBlock(), e.createElementBlock(
                "small",
                St,
                e.toDisplayString(t.$t("生成于 {p0}", { p0: j.value })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            e.createElementVNode(
              "p",
              Vt,
              e.toDisplayString(t.$t("基于当前窗口（{p0}）内 {p1} 条情报与自选行情，只依据这些数据，结论会标注引用的条目编号。", { p0: G.value, p1: Math.min(_.value.length, ie) })),
              1
              /* TEXT */
            ),
            e.createElementVNode("button", {
              class: "primary-btn wide",
              type: "button",
              disabled: f.value || !_.value.length,
              onClick: ke
            }, [
              e.createElementVNode(
                "i",
                {
                  class: e.normalizeClass(f.value ? "ri-loader-4-line spin" : "ri-radar-line")
                },
                null,
                2
                /* CLASS */
              ),
              e.createTextVNode(
                e.toDisplayString(f.value ? t.$t("研判中…") : t.$t("立即研判当前窗口")),
                1
                /* TEXT */
              )
            ], 8, Nt),
            R.value ? (e.openBlock(), e.createElementBlock(
              "p",
              Tt,
              e.toDisplayString(R.value),
              1
              /* TEXT */
            )) : C.value ? (e.openBlock(), e.createElementBlock(
              "p",
              wt,
              e.toDisplayString(C.value),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              Dt,
              e.toDisplayString(t.$t("随时点一下：盘面不分早晚，研判也不用等开盘。")),
              1
              /* TEXT */
            ))
          ])
        ])
      ])
    ]));
  }
}), Ct = (W, y) => {
  const k = W.__vccOpts || W;
  for (const [S, K] of y)
    k[S] = K;
  return k;
}, Lt = /* @__PURE__ */ Ct(Bt, [["__scopeId", "data-v-de665f4c"]]);
export {
  Lt as default
};
