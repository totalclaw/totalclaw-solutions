const e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue"];
if (!e) throw new Error("宿主模块未就绪：npm:vue");
e.default;
const l = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/i18n.ts"];
if (!l) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/i18n.ts");
l.default;
const ne = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/stores/notification.ts"];
if (!ne) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/stores/notification.ts");
ne.default;
const we = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/components/PageBackButton.vue"];
if (!we) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/components/PageBackButton.vue");
const je = we.default, fe = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:@totalclaw/ipc-contracts"];
if (!fe) throw new Error("宿主模块未就绪：npm:@totalclaw/ipc-contracts");
fe.default;
const $e = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/utils/ipcPlain.ts"];
if (!$e) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/utils/ipcPlain.ts");
$e.default;
const r = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts"];
if (!r) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/shared.ts");
r.default;
async function K(q, x) {
  const z = window.electronAPI?.workbenches?.financeAgent;
  if (!z?.invoke) throw new Error(l.t("财务智能体接口不可用，请重启应用"));
  return z.invoke(q, $e.toPlain(x ?? {}));
}
function We(q) {
  const x = window.electronAPI?.workbenches?.financeAgent;
  return x?.onEvent ? x.onEvent(q) : () => {
  };
}
const te = e.ref(null), ce = e.reactive({ options: [], defaultLabel: "", loaded: !1 }), ue = e.reactive({});
async function Z() {
  const q = await K("state.get");
  return te.value = q, q;
}
async function Je() {
  try {
    const q = await K("models.list");
    ce.options = q.options, ce.defaultLabel = q.defaultLabel;
  } finally {
    ce.loaded = !0;
  }
}
function Ce() {
  const q = [];
  for (const x of ce.options) {
    const z = x.group || x.provider;
    let C = q.find((d) => d.group === z);
    C || (C = { group: z, options: [] }, q.push(C)), C.options.push(x);
  }
  return q;
}
function me(q) {
  return q ? ce.options.find((x) => x.value === q)?.label || q : ce.defaultLabel || l.t("系统默认模型");
}
function Ee() {
  return [
    { key: "voucher", icon: "ri-file-list-3-line", title: l.t("凭证处理"), desc: l.t("票据识别、会计分录、凭证草稿"), ability: l.t("接收发票、回单图片 / OCR 识别，自动提取金额、税号、往来单位；自动生成会计分录，输出记账凭证草稿；识别普票 / 专票，区分进项销项；自动归类费用（差旅费、办公费）"), output: l.t("凭证草稿、识别校验报告、异常票据标记") },
    { key: "tax", icon: "ri-government-line", title: l.t("税务申报"), desc: l.t("税额计算、账税核对、申报草稿"), ability: l.t("读取账面数据，自动计算增值税、附加税、企业所得税、个税；核对账税差异；生成申报表草稿；风险预检（税负异常、进项抵扣异常预警）；生成申报备注"), output: l.t("只做数据整理、草稿生成、风险自查，不对接电子税务局自动提交") },
    { key: "filing", icon: "ri-upload-cloud-2-line", title: l.t("申报上报"), desc: l.t("打开电子税务局、代填申报表、登记回执"), ability: l.t("电子税务局不对企业开放申报接口，登录须本人扫码或 CA：由你登录后，数字员工在内置浏览器按申报草稿代填各税种申报表，停在「提交」前由你核对并亲自提交；回来登记申报回执与缴款，提示本期申报期限"), output: l.t("代填好的申报表（待你提交）、申报台账、申报回执归档") },
    { key: "expense", icon: "ri-receipt-line", title: l.t("费用报销"), desc: l.t("报销预审、重复票、部门归集"), ability: l.t("员工上传报销单据，自动校验报销规则（标准、额度、票据有效期）；识别重复发票；判断是否合规，驳回不合规单据；自动归集费用部门"), output: l.t("企业内部报销预审，减少财务人工初审工作量") },
    { key: "reconcile", icon: "ri-scales-3-line", title: l.t("往来对账"), desc: l.t("逐笔比对、对账函、账龄"), ability: l.t("读取应收 / 应付台账，和客户、供应商对账单比对；自动标记差额；生成对账函、催款函；账龄自动分析，逾期款项预警"), output: l.t("差异明细、对账函、催款函、账龄表、逾期预警") },
    { key: "statements", icon: "ri-file-chart-line", title: l.t("财务报表"), desc: l.t("三大报表、勾稽校验、经营分析"), ability: l.t("基于凭证数据，自动生成资产负债表、利润表、现金流量表；报表勾稽关系校验；生成经营简要分析（营收、毛利、费用波动说明）"), output: l.t("三大报表 Excel、勾稽校验结果、经营简要分析") },
    { key: "risk", icon: "ri-shield-check-line", title: l.t("风险巡检"), desc: l.t("全量扫描、风险报告、整改建议"), ability: l.t("全量扫描账套，识别风险点：发票连号、大额现金、异常费用、税负偏低、往来长期挂账"), output: l.t("财税风险报告，附带整改建议") },
    { key: "budget", icon: "ri-pie-chart-2-line", title: l.t("预算管控"), desc: l.t("预算消耗、超支预警、差异解读"), ability: l.t("录入预算额度，实时跟踪各部门预算消耗；支出超预算预警；预算执行分析，月度预算差异解读"), output: l.t("预算执行表、超预算预警、月度差异解读") },
    { key: "cost", icon: "ri-tools-line", title: l.t("成本核算"), desc: l.t("料工费归集分摊、单品成本"), ability: l.t("归集料工费，自动分摊制造费用；计算单品成本；成本波动分析，识别异常损耗"), output: l.t("制造业适用：成本计算单、分配过程、异常损耗提示") },
    { key: "contract", icon: "ri-file-shield-2-line", title: l.t("合同审核"), desc: l.t("涉税条款、风险条款、印花税"), ability: l.t("上传采购 / 销售合同，识别涉税条款（开票时间、税率、付款节点）；识别财税风险条款，提示涉税隐患"), output: l.t("涉税条款清单、风险提示与修改建议、印花税测算") },
    { key: "qa", icon: "ri-question-answer-line", title: l.t("财税问答"), desc: l.t("政策库、企业制度、自动答疑"), ability: l.t("内置税法、会计准则库；员工 / 客户提问财税问题（开票、个税、小规模优惠），自动答疑；可对接企业内部财务制度"), output: l.t("带依据的回答，记住同一账套的问答上下文") }
  ];
}
function Te(q) {
  return { all: l.t("全部智能体"), micro: l.t("小微企业基础包"), agency: l.t("代账公司专业包"), manufacturing: l.t("制造企业高级包") }[q];
}
function ge(q) {
  return q === "all" ? Ee().map((x) => x.key) : fe.FA_PACKAGE_MODULES[q];
}
async function Me(q, x = !0) {
  const z = await K("files.pick", { kind: q, multi: x });
  return Array.isArray(z) ? z : [];
}
function ie(q, x = !1) {
  return K("path.open", { path: q, reveal: x });
}
function _e() {
  const q = /* @__PURE__ */ new Date();
  return `${q.getFullYear()}-${String(q.getMonth() + 1).padStart(2, "0")}`;
}
function he() {
  const q = /* @__PURE__ */ new Date();
  return q.setDate(1), q.setMonth(q.getMonth() - 1), `${q.getFullYear()}-${String(q.getMonth() + 1).padStart(2, "0")}`;
}
function pe(q) {
  return { high: l.t("高"), warn: l.t("中"), info: l.t("低"), error: l.t("错误"), ok: l.t("通过") }[q] || q;
}
function ve(q) {
  return q === "high" || q === "error" ? "bad" : q === "warn" ? "warn" : q === "ok" ? "ok" : "";
}
const Ye = /\.(pdf|ofd|xml|jpe?g|png|heic|webp)$/i, He = /\.(xlsx|xls|csv)$/i, Qe = /\.(pdf|docx?|txt|jpe?g|png)$/i, Ge = /\.(pdf|docx?|txt|md|xlsx)$/i, Xe = { class: "ss-module fa-ov" }, Ze = { class: "ss-panel" }, et = { class: "ss-muted" }, tt = { class: "fa-grid" }, lt = ["onClick"], nt = { class: "fa-card__head" }, ot = {
  key: 0,
  class: "ss-chip warn"
}, at = { class: "ss-panel" }, st = { class: "fa-grid" }, it = { class: "fa-card" }, rt = { class: "fa-card__head" }, dt = { class: "fa-card" }, ct = { class: "fa-card__head" }, ut = { class: "fa-card" }, mt = { class: "fa-card__head" }, pt = { class: "fa-card" }, vt = { class: "fa-card__head" }, yt = { class: "ss-panel" }, Vt = { class: "fa-quote" }, Nt = { class: "ss-panel" }, gt = { class: "fa-rules" }, ht = { class: "fa-rule no" }, Et = { class: "fa-rule yes" }, kt = { class: "ss-subhead" }, ft = { class: "fa-list" }, $t = { class: "ss-panel" }, bt = { class: "ss-muted" }, Dt = { class: "fa-grid" }, St = { class: "fa-card__head" }, _t = {
  key: 0,
  class: "ss-chip ok"
}, Bt = { class: "fa-chips" }, wt = ["disabled", "onClick"], Ct = /* @__PURE__ */ e.defineComponent({
  __name: "OverviewTab",
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = te, C = Ee(), d = e.computed(() => z.value?.settings.package || "all"), S = e.ref(!1), p = e.ref(null), w = [
      { key: "micro", icon: "ri-store-3-line", text: l.t("凭证智能体 + 费用报销 + 财税问答 + 简易报表") },
      { key: "agency", icon: "ri-briefcase-4-line", text: l.t("凭证智能体 + 税务预检 + 往来对账 + 风险巡检") },
      { key: "manufacturing", icon: "ri-building-4-line", text: l.t("在前两个包的基础上，增加成本核算、预算智能体、合同财税审核") }
    ];
    function j(c) {
      return C.find((T) => T.key === c)?.title || c;
    }
    function s(c) {
      return ge(d.value).includes(c);
    }
    function v(c) {
      const T = p.value;
      return T ? c === "voucher" && T.flaggedDocs ? l.t("{n} 张异常", { n: T.flaggedDocs }) : c === "voucher" && T.draftVouchers ? l.t("{n} 张待审", { n: T.draftVouchers }) : c === "expense" && T.pendingClaims ? l.t("{n} 单待定", { n: T.pendingClaims }) : c === "reconcile" && T.overdue ? l.t("{n} 家逾期", { n: T.overdue }) : c === "risk" && T.risks ? l.t("{n} 项高风险", { n: T.risks }) : c === "budget" && T.overBudget ? l.t("{n} 项超支", { n: T.overBudget }) : "" : "";
    }
    async function $(c) {
      S.value = !0;
      try {
        await K("settings.patch", { patch: { package: c } }), await Z();
      } catch (T) {
        x.error(r.errorMessage(T));
      } finally {
        S.value = !1;
      }
    }
    function g() {
      z.value?.outputDir && ie(z.value.outputDir).catch((c) => x.error(r.errorMessage(c)));
    }
    return e.onMounted(async () => {
      try {
        p.value = await K("overview");
      } catch {
      }
    }), (c, T) => (e.openBlock(), e.createElementBlock("div", Xe, [
      e.createCommentVNode(" 一、核心财务智能体清单 "),
      e.createElementVNode("section", Ze, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            T[2] || (T[2] = e.createElementVNode(
              "i",
              { class: "ri-apps-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(c.$t("一、核心财务智能体清单")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            et,
            e.toDisplayString(c.$t("按业务模块划分，点卡片进入对应智能体")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", tt, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(C), (I) => (e.openBlock(), e.createElementBlock("button", {
              key: I.key,
              type: "button",
              class: e.normalizeClass(["fa-card fa-card--click", { dim: !s(I.key) }]),
              onClick: (W) => c.$emit("goto", I.key)
            }, [
              e.createElementVNode("div", nt, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(I.icon)
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(I.title),
                  1
                  /* TEXT */
                ),
                v(I.key) ? (e.openBlock(), e.createElementBlock(
                  "em",
                  ot,
                  e.toDisplayString(v(I.key)),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              e.createElementVNode(
                "p",
                null,
                e.toDisplayString(I.desc),
                1
                /* TEXT */
              )
            ], 10, lt))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      e.createCommentVNode(" 二、配套能力 "),
      e.createElementVNode("section", at, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            T[3] || (T[3] = e.createElementVNode(
              "i",
              { class: "ri-stack-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(c.$t("二、配套能力（智能体公共能力）")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", st, [
          e.createElementVNode("div", it, [
            e.createElementVNode("div", rt, [
              T[4] || (T[4] = e.createElementVNode(
                "i",
                { class: "ri-scan-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(c.$t("文档 / OCR 识别")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(c.$t("PDF、图片发票、银行回单、合同解析。电子发票读文字层，扫描件与图片走本机 OCR，识别出的字段逐项回原文核对。")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", dt, [
            e.createElementVNode("div", ct, [
              T[5] || (T[5] = e.createElementVNode(
                "i",
                { class: "ri-database-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(c.$t("数据对接")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(c.$t("可对接 Excel、账套导出数据（序时账、科目余额表），支持 API 接收外部数据。")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "button",
              {
                type: "button",
                class: "ss-link",
                onClick: T[0] || (T[0] = (I) => c.$emit("goto", "settings"))
              },
              e.toDisplayString(c.$t("到设置里打开 API 接收")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", ut, [
            e.createElementVNode("div", mt, [
              T[6] || (T[6] = e.createElementVNode(
                "i",
                { class: "ri-file-excel-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(c.$t("输出")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(c.$t("Markdown 报告、Excel 表格、文字建议。结果文件按账套、按智能体分目录存放。")),
              1
              /* TEXT */
            ),
            e.unref(z)?.outputDir ? (e.openBlock(), e.createElementBlock(
              "button",
              {
                key: 0,
                type: "button",
                class: "ss-link",
                onClick: g
              },
              e.toDisplayString(c.$t("打开结果目录")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          e.createElementVNode("div", pt, [
            e.createElementVNode("div", vt, [
              T[7] || (T[7] = e.createElementVNode(
                "i",
                { class: "ri-brain-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createElementVNode(
                "strong",
                null,
                e.toDisplayString(c.$t("记忆")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(c.$t("支持会话记忆，持续跟进同一账套 / 同一项目分析：每个账套的问答记录与记忆要点独立保存。")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createCommentVNode(" 三、业务落地定位 "),
      e.createElementVNode("section", yt, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            T[8] || (T[8] = e.createElementVNode(
              "i",
              { class: "ri-focus-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(c.$t("三、业务落地定位")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode(
          "blockquote",
          Vt,
          e.toDisplayString(c.$t("财务智能体不是替代会计，是帮财务做重复、数据核对、信息提取、预审分析工作，把财务从机械单据处理释放到管理决策。")),
          1
          /* TEXT */
        )
      ]),
      e.createCommentVNode(" 四、合规区分 "),
      e.createElementVNode("section", Nt, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            T[9] || (T[9] = e.createElementVNode(
              "i",
              { class: "ri-shield-check-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(c.$t("四、区分：哪些不能交给智能体")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", gt, [
          e.createElementVNode("div", ht, [
            T[10] || (T[10] = e.createElementVNode(
              "i",
              { class: "ri-close-circle-fill" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(c.$t("不能自动提交纳税申报、不能电子签名、不能直接修改正式账套数据")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("div", Et, [
            T[11] || (T[11] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-fill" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "p",
              null,
              e.toDisplayString(c.$t("只做：数据解析、草稿生成、风险提示、辅助计算、文档整理、分析建议，最终由财务人员人工复核确认")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode(
          "div",
          kt,
          e.toDisplayString(c.$t("本工作台怎么落实")),
          1
          /* TEXT */
        ),
        e.createElementVNode("ul", ft, [
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(c.$t("凭证只生成草稿并导出成导入文件，由财务导入自己的账套软件；本工作台不连接、不修改正式账套。")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(c.$t("税务申报只出申报表草稿、申报备注与风险预检，不对接电子税务局，申报由人在税务局系统里核对后提交。")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(c.$t("所有金额（税额、分录、分摊、账龄、预算执行）由固定规则计算，每一步有公式可查；模型不参与算钱。")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(c.$t("模型从票据、合同里抽出的值必须能在原文里找到，找不到的丢弃或标记「未核实」；模型写的文字只许引用规则算好的数字。")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "li",
            null,
            e.toDisplayString(c.$t("报销结论是预审意见，通过 / 驳回由财务点确认；对账函、催款函是草稿，签章后才发出。")),
            1
            /* TEXT */
          )
        ])
      ]),
      e.createCommentVNode(" 五、打包套餐 "),
      e.createElementVNode("section", $t, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            T[12] || (T[12] = e.createElementVNode(
              "i",
              { class: "ri-gift-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(c.$t("五、可选：打包套餐")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            bt,
            e.toDisplayString(c.$t("启用套餐后，顶部只显示套餐内的智能体")),
            1
            /* TEXT */
          ),
          T[13] || (T[13] = e.createElementVNode(
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
              class: e.normalizeClass(["ss-btn sm", d.value === "all" ? "primary" : "ghost"]),
              onClick: T[1] || (T[1] = (I) => $("all"))
            },
            e.toDisplayString(c.$t("显示全部智能体")),
            3
            /* TEXT, CLASS */
          )
        ]),
        e.createElementVNode("div", Dt, [
          (e.openBlock(), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(w, (I) => e.createElementVNode(
              "div",
              {
                key: I.key,
                class: e.normalizeClass(["fa-card fa-pack", { active: d.value === I.key }])
              },
              [
                e.createElementVNode("div", St, [
                  e.createElementVNode(
                    "i",
                    {
                      class: e.normalizeClass(I.icon)
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(e.unref(Te)(I.key)),
                    1
                    /* TEXT */
                  ),
                  d.value === I.key ? (e.openBlock(), e.createElementBlock(
                    "em",
                    _t,
                    e.toDisplayString(c.$t("当前")),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode(
                  "p",
                  null,
                  e.toDisplayString(I.text),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", Bt, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(e.unref(ge)(I.key), (W) => (e.openBlock(), e.createElementBlock(
                      "span",
                      {
                        key: W,
                        class: "ss-chip"
                      },
                      e.toDisplayString(j(W)),
                      1
                      /* TEXT */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  class: e.normalizeClass(["ss-btn sm", d.value === I.key ? "ghost" : "primary"]),
                  disabled: d.value === I.key || S.value,
                  onClick: (W) => $(I.key)
                }, e.toDisplayString(d.value === I.key ? c.$t("已启用") : c.$t("启用此套餐")), 11, wt)
              ],
              2
              /* CLASS */
            )),
            64
            /* STABLE_FRAGMENT */
          ))
        ])
      ])
    ]));
  }
}), oe = (q, x) => {
  const z = q.__vccOpts || q;
  for (const [C, d] of x)
    z[C] = d;
  return z;
}, Tt = /* @__PURE__ */ oe(Ct, [["__scopeId", "data-v-5ab35b8c"]]), Mt = { class: "fa-drop__text" }, Lt = ["disabled"], Ut = /* @__PURE__ */ e.defineComponent({
  __name: "FileDrop",
  props: {
    label: {},
    hint: { default: "" },
    kind: {},
    multi: { type: Boolean, default: !0 },
    disabled: { type: Boolean, default: !1 },
    compact: { type: Boolean, default: !1 }
  },
  emits: ["picked"],
  setup(q, { emit: x }) {
    const z = q, C = x, d = e.ref(!1), S = e.computed(() => ({ invoice: "ri-bill-line", excel: "ri-file-excel-2-line", contract: "ri-file-text-line", policy: "ri-book-2-line" })[z.kind]), p = e.computed(() => ({ invoice: Ye, excel: He, contract: Qe, policy: Ge })[z.kind]);
    async function w() {
      const s = await Me(z.kind, z.multi);
      s.length && C("picked", z.multi ? s : s.slice(0, 1));
    }
    function j(s) {
      if (d.value = !1, z.disabled) return;
      const v = r.droppedPaths(s, p.value);
      v.length && C("picked", z.multi ? v : v.slice(0, 1));
    }
    return (s, v) => (e.openBlock(), e.createElementBlock(
      "div",
      {
        class: e.normalizeClass(["fa-drop", { over: d.value, disabled: q.disabled, compact: q.compact }]),
        role: "button",
        tabindex: "0",
        onClick: v[0] || (v[0] = ($) => !q.disabled && w()),
        onKeydown: v[1] || (v[1] = e.withKeys(e.withModifiers(($) => !q.disabled && w(), ["prevent"]), ["enter"])),
        onDragover: v[2] || (v[2] = e.withModifiers(($) => !q.disabled && (d.value = !0), ["prevent"])),
        onDragleave: v[3] || (v[3] = e.withModifiers(($) => d.value = !1, ["prevent"])),
        onDrop: e.withModifiers(j, ["prevent"])
      },
      [
        e.createElementVNode(
          "i",
          {
            class: e.normalizeClass(S.value)
          },
          null,
          2
          /* CLASS */
        ),
        e.createElementVNode("div", Mt, [
          e.createElementVNode(
            "strong",
            null,
            e.toDisplayString(q.label),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "small",
            null,
            e.toDisplayString(q.hint || (q.multi ? s.$t("把文件拖到这里，或点击选择（可多选）") : s.$t("把文件拖到这里，或点击选择"))),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("button", {
          type: "button",
          class: "ss-btn ghost sm",
          disabled: q.disabled,
          onClick: e.withModifiers(w, ["stop"])
        }, [
          v[4] || (v[4] = e.createElementVNode(
            "i",
            { class: "ri-folder-open-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(s.$t("选择文件")),
            1
            /* TEXT */
          )
        ], 8, Lt)
      ],
      34
      /* CLASS, NEED_HYDRATION */
    ));
  }
}), se = /* @__PURE__ */ oe(Ut, [["__scopeId", "data-v-42d5bdb8"]]), Pt = { class: "ss-panel fa-data" }, Ft = { class: "ss-muted" }, zt = { class: "fa-data__grid" }, At = { class: "fa-data__item" }, xt = { class: "fa-data__head" }, Rt = {
  key: 0,
  class: "ss-chip ok"
}, It = {
  key: 1,
  class: "ss-chip"
}, Ot = {
  key: 0,
  class: "ss-muted"
}, Kt = {
  key: 1,
  class: "ss-muted"
}, qt = { class: "fa-data__item" }, jt = { class: "fa-data__head" }, Wt = {
  key: 0,
  class: "ss-chip"
}, Jt = { class: "ss-field fa-data__period" }, Yt = /* @__PURE__ */ e.defineComponent({
  __name: "DataSourcePanel",
  setup(q) {
    const x = e.computed(() => te.value?.data.journal || null), z = e.computed(() => te.value?.data.balances || []), C = e.computed(() => (te.value?.data.vouchers || []).filter(($) => $.status === "reviewed").length), d = e.ref(he()), S = e.ref(""), p = e.ref(""), w = e.ref(!0);
    async function j($) {
      S.value = "journal";
      try {
        const g = await K("data.importJournal", { path: $ });
        w.value = g.balanced, p.value = g.balanced ? l.t("导入 {n} 行分录（{a} 至 {b}），借贷合计 {c}，平衡", { n: g.count, a: g.from || "-", b: g.to || "-", c: r.fmtMoney(g.debit) }) : l.t("导入 {n} 行，但借方 {a} ≠ 贷方 {b}：导出的可能不是完整凭证，请检查", { n: g.count, a: r.fmtMoney(g.debit), b: r.fmtMoney(g.credit) }), await Z();
      } catch (g) {
        w.value = !1, p.value = r.errorMessage(g);
      } finally {
        S.value = "";
      }
    }
    async function s($) {
      S.value = "balances";
      try {
        const g = await K("data.importBalances", { path: $, period: d.value });
        w.value = !0, p.value = l.t("{p0} 科目余额表导入 {n} 个科目", { p0: g.period, n: g.count }), await Z();
      } catch (g) {
        w.value = !1, p.value = r.errorMessage(g);
      } finally {
        S.value = "";
      }
    }
    async function v($) {
      window.confirm(l.t("清除已导入的数据？")) && (await K("data.clear", { kind: $ }), await Z());
    }
    return ($, g) => (e.openBlock(), e.createElementBlock("section", Pt, [
      e.createElementVNode("header", null, [
        e.createElementVNode("strong", null, [
          g[4] || (g[4] = e.createElementVNode(
            "i",
            { class: "ri-database-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            " " + e.toDisplayString($.$t("账套数据（数据对接）")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode(
          "span",
          Ft,
          e.toDisplayString($.$t("从财务软件导出序时账、科目余额表，导进来给报表、税务、风险、预算用。只读分析，不回写正式账套。")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("div", zt, [
        e.createElementVNode("div", At, [
          e.createElementVNode("div", xt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("序时账（凭证明细）")),
              1
              /* TEXT */
            ),
            x.value ? (e.openBlock(), e.createElementBlock(
              "span",
              Rt,
              e.toDisplayString($.$t("{n} 行", { n: x.value.rows.length })),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              "span",
              It,
              e.toDisplayString($.$t("未导入")),
              1
              /* TEXT */
            ))
          ]),
          x.value ? (e.openBlock(), e.createElementBlock(
            "p",
            Ot,
            e.toDisplayString($.$t("{p0}，{p1} 导入", { p0: x.value.fileName, p1: e.unref(r.fmtDateTime)(x.value.importedAt) })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          C.value ? (e.openBlock(), e.createElementBlock(
            "p",
            Kt,
            e.toDisplayString($.$t("另有本工作台已审核凭证 {n} 张，一并计入", { n: C.value })),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          e.createVNode(se, {
            compact: "",
            kind: "excel",
            multi: !1,
            label: x.value ? $.$t("重新导入序时账") : $.$t("导入序时账"),
            hint: $.$t("需要：日期、科目、借方、贷方；可选：凭证号、摘要、往来单位、部门"),
            disabled: !!S.value,
            onPicked: g[0] || (g[0] = (c) => j(c[0]))
          }, null, 8, ["label", "hint", "disabled"]),
          x.value ? (e.openBlock(), e.createElementBlock(
            "button",
            {
              key: 2,
              type: "button",
              class: "ss-link",
              onClick: g[1] || (g[1] = (c) => v("journal"))
            },
            e.toDisplayString($.$t("清除")),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0)
        ]),
        e.createElementVNode("div", qt, [
          e.createElementVNode("div", jt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("科目余额表")),
              1
              /* TEXT */
            ),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(z.value, (c) => (e.openBlock(), e.createElementBlock(
                "span",
                {
                  key: c.period,
                  class: "ss-chip ok"
                },
                e.toDisplayString(c.period),
                1
                /* TEXT */
              ))),
              128
              /* KEYED_FRAGMENT */
            )),
            z.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "span",
              Wt,
              e.toDisplayString($.$t("未导入")),
              1
              /* TEXT */
            ))
          ]),
          e.createElementVNode("label", Jt, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString($.$t("所属期间")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": g[2] || (g[2] = (c) => d.value = c),
                type: "month"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelText, d.value]
            ])
          ]),
          e.createVNode(se, {
            compact: "",
            kind: "excel",
            multi: !1,
            label: $.$t("导入科目余额表"),
            hint: $.$t("需要：科目名称、期初借贷、本期借贷、期末借贷"),
            disabled: !!S.value || !d.value,
            onPicked: g[3] || (g[3] = (c) => s(c[0]))
          }, null, 8, ["label", "hint", "disabled"])
        ])
      ]),
      p.value ? (e.openBlock(), e.createElementBlock(
        "p",
        {
          key: 0,
          class: e.normalizeClass(["ss-note", w.value ? "ok" : "danger"])
        },
        [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(w.value ? "ri-check-line" : "ri-error-warning-line")
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(p.value),
            1
            /* TEXT */
          )
        ],
        2
        /* CLASS */
      )) : e.createCommentVNode("v-if", !0)
    ]));
  }
}), Ne = /* @__PURE__ */ oe(Yt, [["__scopeId", "data-v-81fa7946"]]), Ht = { class: "ss-module" }, Qt = { class: "ss-panel" }, Gt = { class: "ss-muted" }, Xt = { class: "ss-actions" }, Zt = { class: "fa-path" }, el = ["disabled"], tl = { class: "ss-panel" }, ll = { class: "ss-muted" }, nl = { class: "ss-table-wrap" }, ol = { class: "ss-table" }, al = ["value", "disabled", "onChange"], sl = { value: "" }, il = ["label"], rl = ["value"], dl = { class: "ss-panel" }, cl = { class: "ss-muted" }, ul = { class: "ss-grid" }, ml = { class: "ss-field" }, pl = { class: "ss-field" }, vl = { class: "ss-field" }, yl = { class: "ss-field" }, Vl = { class: "ss-field" }, Nl = { class: "ss-field" }, gl = { class: "ss-field" }, hl = { class: "ss-field fa-check" }, El = { class: "ss-actions" }, kl = ["disabled"], fl = { class: "ss-panel" }, $l = { class: "ss-muted" }, bl = { class: "ss-table-wrap" }, Dl = { class: "ss-table" }, Sl = { class: "num" }, _l = ["onUpdate:modelValue"], Bl = ["onUpdate:modelValue"], wl = ["onUpdate:modelValue"], Cl = ["onUpdate:modelValue"], Tl = ["onClick"], Ml = { class: "ss-actions" }, Ll = { class: "ss-grid" }, Ul = { class: "ss-field" }, Pl = { class: "ss-field fa-check" }, Fl = { class: "ss-field fa-check" }, zl = { class: "ss-subhead" }, Al = ["onUpdate:modelValue", "placeholder"], xl = ["onUpdate:modelValue", "placeholder"], Rl = ["onClick"], Il = { class: "ss-actions" }, Ol = ["disabled"], Kl = { class: "ss-panel" }, ql = { class: "ss-grid" }, jl = { class: "ss-field" }, Wl = { class: "ss-field" }, Jl = { class: "ss-field" }, Yl = { class: "ss-field" }, Hl = { class: "ss-field" }, Ql = { class: "ss-actions" }, Gl = ["disabled"], Xl = { class: "ss-panel" }, Zl = { class: "ss-muted" }, en = { class: "ss-grid" }, tn = { class: "ss-field fa-check" }, ln = { class: "ss-field" }, nn = { class: "ss-actions" }, on = ["disabled"], an = {
  key: 0,
  class: "fa-path"
}, sn = ["title"], rn = {
  key: 0,
  class: "ss-actions"
}, dn = { class: "ss-muted" }, cn = { class: "fa-path" }, un = { class: "fa-code" }, mn = { class: "ss-muted" }, pn = /* @__PURE__ */ e.defineComponent({
  __name: "SettingsTab",
  setup(q) {
    const x = ne.useNotificationStore(), z = te, C = Ee(), d = e.ref(""), S = e.ref(""), p = e.ref(!1), w = e.computed(() => z.value?.apiStatus), j = (E) => Math.round((Number(E) || 0) * 1e5) / 1e3, s = (E) => Math.round((Number(E) || 0) * 1e3) / 1e5, v = e.reactive({ smallScaleRate: 0, smallExemptMonthly: 0, eduSurchargeRate: 0, localEduSurchargeRate: 0, halveSurcharges: !0, smallProfitCitRate: 0, citRate: 0, industryVatBurden: 0 }), $ = e.reactive({ rules: [], validityDays: 180, allowCrossYearUntilJan31: !0, requireCompanyTitle: !0 }), g = e.ref([]), c = e.reactive({ largeCash: 0, minVatBurden: 0, staleDays: 365, consecutiveCount: 3, expenseSpikeRatio: 2 }), T = e.reactive({ enabled: !1, port: 18765 });
    function I() {
      const E = z.value?.settings;
      E && (Object.assign(v, {
        smallScaleRate: j(E.tax.smallScaleRate),
        smallExemptMonthly: E.tax.smallExemptMonthly,
        eduSurchargeRate: j(E.tax.eduSurchargeRate),
        localEduSurchargeRate: j(E.tax.localEduSurchargeRate),
        halveSurcharges: E.tax.halveSurcharges,
        smallProfitCitRate: j(E.tax.smallProfitCitRate),
        citRate: j(E.tax.citRate),
        industryVatBurden: j(E.tax.industryVatBurden)
      }), $.rules = E.expense.rules.map((D) => ({ ...D })), $.validityDays = E.expense.validityDays, $.allowCrossYearUntilJan31 = E.expense.allowCrossYearUntilJan31, $.requireCompanyTitle = E.expense.requireCompanyTitle, g.value = Object.entries(E.expense.monthlyQuota || {}).map(([D, i]) => ({ level: D, amount: i })), Object.assign(c, { ...E.risk, minVatBurden: j(E.risk.minVatBurden) }), Object.assign(T, { enabled: E.apiReceiver.enabled, port: E.apiReceiver.port }));
    }
    e.watch(() => z.value?.activeLedgerId, I, { immediate: !0 });
    const W = e.computed(() => [
      `curl -X POST http://127.0.0.1:${z.value?.settings.apiReceiver.port || T.port}/finance/import \\`,
      '  -H "Authorization: Bearer <token>" \\',
      '  -H "Content-Type: application/json" \\',
      `  -d '{"kind":"journal","rows":[{"date":"2026-09-01","voucherNo":"1","summary":"...","accountName":"...","debit":100,"credit":0}]}'`
    ].join(`
`));
    async function P(E, D) {
      S.value = E;
      try {
        await K("settings.patch", { patch: { [E]: D } }), await Z(), x.success(l.t("已保存"));
      } catch (i) {
        x.error(r.errorMessage(i));
      } finally {
        S.value = "";
      }
    }
    function F() {
      return P("tax", {
        smallScaleRate: s(v.smallScaleRate),
        smallExemptMonthly: Number(v.smallExemptMonthly) || 0,
        eduSurchargeRate: s(v.eduSurchargeRate),
        localEduSurchargeRate: s(v.localEduSurchargeRate),
        halveSurcharges: !!v.halveSurcharges,
        smallProfitCitRate: s(v.smallProfitCitRate),
        citRate: s(v.citRate),
        industryVatBurden: s(v.industryVatBurden)
      });
    }
    function O() {
      const E = {};
      for (const D of g.value) D.level && (E[D.level] = Number(D.amount) || 0);
      return P("expense", {
        rules: $.rules.filter((D) => D.category).map((D) => ({ ...D, perItemCap: Number(D.perItemCap) || 0, requireSpecial: !!D.requireSpecial })),
        validityDays: Number($.validityDays) || 180,
        allowCrossYearUntilJan31: !!$.allowCrossYearUntilJan31,
        requireCompanyTitle: !!$.requireCompanyTitle,
        monthlyQuota: E
      });
    }
    function L() {
      return P("risk", {
        largeCash: Number(c.largeCash) || 0,
        minVatBurden: s(c.minVatBurden),
        staleDays: Number(c.staleDays) || 365,
        consecutiveCount: Number(c.consecutiveCount) || 3,
        expenseSpikeRatio: Number(c.expenseSpikeRatio) || 2
      });
    }
    function X() {
      return P("apiReceiver", { enabled: !!T.enabled, port: Number(T.port) || 18765 });
    }
    async function B() {
      try {
        await K("api.regenerateToken"), await Z();
      } catch (E) {
        x.error(r.errorMessage(E));
      }
    }
    async function N() {
      try {
        await navigator.clipboard.writeText(z.value?.settings.apiReceiver.token || "");
      } catch (E) {
        x.error(r.errorMessage(E));
      }
    }
    async function k(E, D) {
      d.value = E;
      try {
        const i = { ...z.value?.settings.moduleModels || {} };
        D ? i[E] = D : delete i[E], await K("settings.patch", { patch: { moduleModels: i } }), await Z();
      } catch (i) {
        x.error(r.errorMessage(i));
      } finally {
        d.value = "";
      }
    }
    async function U() {
      try {
        await K("outputDir.pick") && await Z();
      } catch (E) {
        x.error(r.errorMessage(E));
      }
    }
    function Y(E) {
      ie(E).catch((D) => x.error(r.errorMessage(D)));
    }
    return (E, D) => (e.openBlock(), e.createElementBlock("div", Ht, [
      e.createCommentVNode(" 结果文件目录 "),
      e.createElementVNode("section", Qt, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            D[22] || (D[22] = e.createElementVNode(
              "i",
              { class: "ri-folder-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(E.$t("结果文件存到")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            Gt,
            e.toDisplayString(E.$t("凭证导入文件、申报表草稿、报表、报告都存在这里，按账套、按智能体分目录。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Xt, [
          e.createElementVNode(
            "code",
            Zt,
            e.toDisplayString(e.unref(z)?.outputDir || "—"),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            onClick: U
          }, [
            D[23] || (D[23] = e.createElementVNode(
              "i",
              { class: "ri-folder-settings-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.$t("更改")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            disabled: !e.unref(z)?.outputDir,
            onClick: D[0] || (D[0] = (i) => Y(e.unref(z).outputDir))
          }, [
            D[24] || (D[24] = e.createElementVNode(
              "i",
              { class: "ri-external-link-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.$t("打开")),
              1
              /* TEXT */
            )
          ], 8, el)
        ])
      ]),
      e.createCommentVNode(" 各智能体模型 "),
      e.createElementVNode("section", tl, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            D[25] || (D[25] = e.createElementVNode(
              "i",
              { class: "ri-cpu-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(E.$t("各智能体使用的模型")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            ll,
            e.toDisplayString(E.$t("每个智能体单独指定；不指定就用系统默认模型（{p0}）。金额一律由规则计算，不经过模型。", { p0: e.unref(ce).defaultLabel || E.$t("未配置") })),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", nl, [
          e.createElementVNode("table", ol, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("智能体")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("使用模型")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(e.unref(C), (i) => (e.openBlock(), e.createElementBlock("tr", {
                  key: i.key
                }, [
                  e.createElementVNode("td", null, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass([i.icon, "fa-icon"])
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      " " + e.toDisplayString(i.title),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("select", {
                      value: e.unref(z)?.settings.moduleModels[i.key] || "",
                      disabled: d.value === i.key,
                      onChange: (A) => k(i.key, A.target.value)
                    }, [
                      e.createElementVNode(
                        "option",
                        sl,
                        e.toDisplayString(E.$t("跟随系统默认（{p0}）", { p0: e.unref(ce).defaultLabel || E.$t("未配置") })),
                        1
                        /* TEXT */
                      ),
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(e.unref(Ce)(), (A) => (e.openBlock(), e.createElementBlock("optgroup", {
                          key: A.group,
                          label: A.group
                        }, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(A.options, (b) => (e.openBlock(), e.createElementBlock("option", {
                              key: b.value,
                              value: b.value
                            }, e.toDisplayString(b.label), 9, rl))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 8, il))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ], 40, al)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])
      ]),
      e.createCommentVNode(" 税务口径 "),
      e.createElementVNode("section", dl, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            D[26] || (D[26] = e.createElementVNode(
              "i",
              { class: "ri-government-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(E.$t("税务口径")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            cl,
            e.toDisplayString(E.$t("政策默认值截至 2025 年底，执行前核对最新文件。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", ul, [
          e.createElementVNode("label", ml, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("小规模征收率（%）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[1] || (D[1] = (i) => v.smallScaleRate = i),
                type: "number",
                step: "0.1",
                min: "0"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                v.smallScaleRate,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", pl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("小规模月销售额免征额（元）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[2] || (D[2] = (i) => v.smallExemptMonthly = i),
                type: "number",
                min: "0"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                v.smallExemptMonthly,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", vl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("教育费附加（%）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[3] || (D[3] = (i) => v.eduSurchargeRate = i),
                type: "number",
                step: "0.1",
                min: "0"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                v.eduSurchargeRate,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", yl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("地方教育附加（%）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[4] || (D[4] = (i) => v.localEduSurchargeRate = i),
                type: "number",
                step: "0.1",
                min: "0"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                v.localEduSurchargeRate,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Vl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("小型微利企业所得税实际税率（%）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[5] || (D[5] = (i) => v.smallProfitCitRate = i),
                type: "number",
                step: "0.1",
                min: "0"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                v.smallProfitCitRate,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Nl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("企业所得税一般税率（%）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[6] || (D[6] = (i) => v.citRate = i),
                type: "number",
                step: "0.1",
                min: "0"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                v.citRate,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", gl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("行业增值税税负预警值（%）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[7] || (D[7] = (i) => v.industryVatBurden = i),
                type: "number",
                step: "0.1",
                min: "0"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                v.industryVatBurden,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", hl, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[8] || (D[8] = (i) => v.halveSurcharges = i),
                type: "checkbox"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, v.halveSurcharges]
            ]),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("六税两费减半征收")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", El, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary sm",
            disabled: !!S.value,
            onClick: F
          }, [
            D[27] || (D[27] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, kl)
        ])
      ]),
      e.createCommentVNode(" 报销规则 "),
      e.createElementVNode("section", fl, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            D[28] || (D[28] = e.createElementVNode(
              "i",
              { class: "ri-receipt-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(E.$t("报销规则")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            $l,
            e.toDisplayString(E.$t("费用报销智能体按这些规则预审；上限填 0 表示不限。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", bl, [
          e.createElementVNode("table", Dl, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("类别")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Sl,
                  e.toDisplayString(E.$t("单张上限（元）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("必须专票")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(E.$t("入账科目")),
                  1
                  /* TEXT */
                ),
                D[29] || (D[29] = e.createElementVNode(
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
                e.renderList($.rules, (i, A) => (e.openBlock(), e.createElementBlock("tr", { key: A }, [
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (b) => i.category = b,
                      type: "text"
                    }, null, 8, _l), [
                      [
                        e.vModelText,
                        i.category,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (b) => i.perItemCap = b,
                      type: "number",
                      min: "0"
                    }, null, 8, Bl), [
                      [
                        e.vModelText,
                        i.perItemCap,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (b) => i.requireSpecial = b,
                      type: "checkbox"
                    }, null, 8, wl), [
                      [e.vModelCheckbox, i.requireSpecial]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (b) => i.accountName = b,
                      type: "text"
                    }, null, 8, Cl), [
                      [
                        e.vModelText,
                        i.accountName,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("td", null, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (b) => $.rules.splice(A, 1)
                    }, e.toDisplayString(E.$t("删除")), 9, Tl)
                  ])
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        e.createElementVNode("div", Ml, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            onClick: D[9] || (D[9] = (i) => $.rules.push({ category: "", perItemCap: 0, accountName: "" }))
          }, [
            D[30] || (D[30] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.$t("加一条规则")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", Ll, [
          e.createElementVNode("label", Ul, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("票据有效期（天）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[10] || (D[10] = (i) => $.validityDays = i),
                type: "number",
                min: "1"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                $.validityDays,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Pl, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[11] || (D[11] = (i) => $.allowCrossYearUntilJan31 = i),
                type: "checkbox"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, $.allowCrossYearUntilJan31]
            ]),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("允许次年 1 月 31 日前报销上年票据")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("label", Fl, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[12] || (D[12] = (i) => $.requireCompanyTitle = i),
                type: "checkbox"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, $.requireCompanyTitle]
            ]),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("发票抬头必须是本公司")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode(
          "div",
          zl,
          e.toDisplayString(E.$t("月度报销额度（按员工级别）")),
          1
          /* TEXT */
        ),
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(g.value, (i, A) => (e.openBlock(), e.createElementBlock("div", {
            key: A,
            class: "fa-row"
          }, [
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": (b) => i.level = b,
              type: "text",
              placeholder: E.$t("级别（如 经理）")
            }, null, 8, Al), [
              [
                e.vModelText,
                i.level,
                void 0,
                { trim: !0 }
              ]
            ]),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": (b) => i.amount = b,
              type: "number",
              min: "0",
              placeholder: E.$t("每月额度（元）")
            }, null, 8, xl), [
              [
                e.vModelText,
                i.amount,
                void 0,
                { number: !0 }
              ]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-link",
              onClick: (b) => g.value.splice(A, 1)
            }, e.toDisplayString(E.$t("删除")), 9, Rl)
          ]))),
          128
          /* KEYED_FRAGMENT */
        )),
        e.createElementVNode("div", Il, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            onClick: D[13] || (D[13] = (i) => g.value.push({ level: "", amount: 0 }))
          }, [
            D[31] || (D[31] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.$t("加一个级别")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary sm",
            disabled: !!S.value,
            onClick: O
          }, [
            D[32] || (D[32] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, Ol)
        ])
      ]),
      e.createCommentVNode(" 风险阈值 "),
      e.createElementVNode("section", Kl, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            D[33] || (D[33] = e.createElementVNode(
              "i",
              { class: "ri-shield-check-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(E.$t("风险巡检阈值")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", ql, [
          e.createElementVNode("label", jl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("大额现金 / 大额付给个人（元）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[14] || (D[14] = (i) => c.largeCash = i),
                type: "number",
                min: "0"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                c.largeCash,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Wl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("增值税税负低于（%）预警")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[15] || (D[15] = (i) => c.minVatBurden = i),
                type: "number",
                step: "0.1",
                min: "0"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                c.minVatBurden,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Jl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("往来挂账超过（天）")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[16] || (D[16] = (i) => c.staleDays = i),
                type: "number",
                min: "1"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                c.staleDays,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Yl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("同一开票方连号张数")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[17] || (D[17] = (i) => c.consecutiveCount = i),
                type: "number",
                min: "2"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                c.consecutiveCount,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", Hl, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("费用环比上涨倍数")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[18] || (D[18] = (i) => c.expenseSpikeRatio = i),
                type: "number",
                step: "0.1",
                min: "1"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                c.expenseSpikeRatio,
                void 0,
                { number: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode("div", Ql, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary sm",
            disabled: !!S.value,
            onClick: L
          }, [
            D[34] || (D[34] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, Gl)
        ])
      ]),
      e.createCommentVNode(" 数据对接 "),
      e.createVNode(Ne),
      e.createElementVNode("section", Xl, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            D[35] || (D[35] = e.createElementVNode(
              "i",
              { class: "ri-plug-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(E.$t("API 接收外部数据")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            Zl,
            e.toDisplayString(E.$t("只监听本机，必须带令牌；收到的数据只进本工作台的分析库，不回写正式账套。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", en, [
          e.createElementVNode("label", tn, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[19] || (D[19] = (i) => T.enabled = i),
                type: "checkbox"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, T.enabled]
            ]),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("开启 API 接收")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("label", ln, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(E.$t("端口")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": D[20] || (D[20] = (i) => T.port = i),
                type: "number",
                min: "1024",
                max: "65535"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                T.port,
                void 0,
                { number: !0 }
              ]
            ])
          ])
        ]),
        e.createElementVNode("div", nn, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary sm",
            disabled: !!S.value,
            onClick: X
          }, [
            D[36] || (D[36] = e.createElementVNode(
              "i",
              { class: "ri-save-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(E.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, on),
          e.createElementVNode(
            "span",
            {
              class: e.normalizeClass(["ss-chip", w.value?.running ? "ok" : ""])
            },
            e.toDisplayString(w.value?.running ? E.$t("运行中") : E.$t("未运行")),
            3
            /* TEXT, CLASS */
          ),
          w.value?.url ? (e.openBlock(), e.createElementBlock(
            "code",
            an,
            e.toDisplayString(w.value.url),
            1
            /* TEXT */
          )) : e.createCommentVNode("v-if", !0),
          w.value?.error ? (e.openBlock(), e.createElementBlock("span", {
            key: 1,
            class: "ss-chip bad",
            title: w.value.error
          }, e.toDisplayString(w.value.error), 9, sn)) : e.createCommentVNode("v-if", !0)
        ]),
        e.unref(z)?.settings.apiReceiver.token ? (e.openBlock(), e.createElementBlock("div", rn, [
          e.createElementVNode(
            "span",
            dn,
            e.toDisplayString(E.$t("令牌")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "code",
            cn,
            e.toDisplayString(p.value ? e.unref(z).settings.apiReceiver.token : "••••••••••••"),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: D[21] || (D[21] = (i) => p.value = !p.value)
            },
            e.toDisplayString(p.value ? E.$t("隐藏") : E.$t("显示")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: N
            },
            e.toDisplayString(E.$t("复制")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: B
            },
            e.toDisplayString(E.$t("重新生成")),
            1
            /* TEXT */
          )
        ])) : e.createCommentVNode("v-if", !0),
        e.createElementVNode(
          "pre",
          un,
          e.toDisplayString(W.value),
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "p",
          mn,
          e.toDisplayString(E.$t("kind 可选 journal（序时账）、balances（科目余额表，带 period）、budget（预算，带 year）；rows 的字段名用中文表头或英文字段都能识别；ledger 可填账套名，不填进当前账套。")),
          1
          /* TEXT */
        )
      ])
    ]));
  }
}), vn = /* @__PURE__ */ oe(pn, [["__scopeId", "data-v-38cdfa51"]]), Le = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue"];
if (!Le) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StepCard.vue");
const G = Le.default, Ue = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue"];
if (!Ue) throw new Error("宿主模块未就绪：apps/desktop-shell/src/renderer/workbenches/service-settlement/StickyProgress.vue");
const re = Ue.default, yn = { class: "fa-mhead" }, Vn = { class: "fa-mhead__main" }, Nn = { class: "fa-mhead__split" }, gn = { class: "ss-chip brand" }, hn = { class: "ss-chip" }, En = ["title"], kn = ["value", "disabled"], fn = { value: "" }, $n = ["label"], bn = ["value"], Dn = ["value"], Sn = /* @__PURE__ */ e.defineComponent({
  __name: "ModuleHeader",
  props: {
    meta: {}
  },
  setup(q) {
    const x = q, z = ne.useNotificationStore(), C = e.ref(!1), d = e.computed(() => te.value?.settings.moduleModels[x.meta.key] || "");
    async function S(p) {
      C.value = !0;
      try {
        const w = { ...te.value?.settings.moduleModels || {} };
        p ? w[x.meta.key] = p : delete w[x.meta.key], await K("settings.patch", { patch: { moduleModels: w } }), await Z();
      } catch (w) {
        z.error(r.errorMessage(w));
      } finally {
        C.value = !1;
      }
    }
    return (p, w) => (e.openBlock(), e.createElementBlock("section", yn, [
      e.createElementVNode("div", Vn, [
        e.createElementVNode("h2", null, [
          e.createElementVNode(
            "i",
            {
              class: e.normalizeClass(q.meta.icon)
            },
            null,
            2
            /* CLASS */
          ),
          e.createTextVNode(
            e.toDisplayString(p.$t("{p0}智能体", { p0: q.meta.title })),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Nn, [
          e.createElementVNode("span", null, [
            e.createElementVNode(
              "em",
              gn,
              e.toDisplayString(p.$t("能力")),
              1
              /* TEXT */
            ),
            e.createTextVNode(
              e.toDisplayString(q.meta.ability),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", null, [
            e.createElementVNode(
              "em",
              hn,
              e.toDisplayString(p.$t("输出物")),
              1
              /* TEXT */
            ),
            e.createTextVNode(
              e.toDisplayString(q.meta.output),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      e.createElementVNode("label", {
        class: "fa-mhead__model",
        title: p.$t("本智能体所有抽取、分析、写作都用这个模型；金额由规则计算，不经过模型")
      }, [
        e.createElementVNode("small", null, [
          w[1] || (w[1] = e.createElementVNode(
            "i",
            { class: "ri-cpu-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createTextVNode(
            e.toDisplayString(p.$t("本智能体使用模型")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("select", {
          value: d.value,
          disabled: C.value,
          onChange: w[0] || (w[0] = (j) => S(j.target.value))
        }, [
          e.createElementVNode(
            "option",
            fn,
            e.toDisplayString(p.$t("跟随系统默认（{p0}）", { p0: e.unref(ce).defaultLabel || p.$t("未配置") })),
            1
            /* TEXT */
          ),
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(e.unref(Ce)(), (j) => (e.openBlock(), e.createElementBlock("optgroup", {
              key: j.group,
              label: j.group
            }, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(j.options, (s) => (e.openBlock(), e.createElementBlock("option", {
                  key: s.value,
                  value: s.value
                }, e.toDisplayString(s.label), 9, bn))),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 8, $n))),
            128
            /* KEYED_FRAGMENT */
          )),
          d.value && !e.unref(ce).options.some((j) => j.value === d.value) ? (e.openBlock(), e.createElementBlock("option", {
            key: 0,
            value: d.value
          }, e.toDisplayString(d.value), 9, Dn)) : e.createCommentVNode("v-if", !0)
        ], 40, kn)
      ], 8, En)
    ]));
  }
}), de = /* @__PURE__ */ oe(Sn, [["__scopeId", "data-v-1b7a0a8f"]]), _n = { class: "ss-module" }, Bn = {
  key: 0,
  class: "ss-note info"
}, wn = { class: "ss-steps" }, Cn = {
  key: 0,
  class: "ss-table-wrap"
}, Tn = { class: "ss-table fa-docs" }, Mn = { class: "num" }, Ln = { class: "num" }, Un = { class: "num" }, Pn = ["onClick"], Fn = ["title"], zn = ["title"], An = { class: "num" }, xn = { class: "num" }, Rn = { class: "num" }, In = ["onClick"], On = {
  key: 0,
  class: "fa-detail-row"
}, Kn = { colspan: "12" }, qn = { class: "fa-detail" }, jn = { class: "ss-grid" }, Wn = { class: "ss-field" }, Jn = ["value"], Yn = { class: "ss-field" }, Hn = { value: "in" }, Qn = { value: "out" }, Gn = { value: "unknown" }, Xn = { class: "ss-field" }, Zn = { class: "fa-src" }, eo = { class: "ss-field" }, to = { class: "fa-src" }, lo = { class: "ss-field" }, no = { class: "fa-src" }, oo = { class: "ss-field" }, ao = { class: "fa-src" }, so = { class: "ss-field" }, io = { class: "fa-src" }, ro = { class: "ss-field" }, co = { class: "fa-src" }, uo = { class: "ss-field" }, mo = { class: "fa-src" }, po = { class: "ss-field" }, vo = { class: "fa-src" }, yo = { class: "ss-field" }, Vo = { class: "fa-src" }, No = { class: "ss-field" }, go = ["value"], ho = { class: "ss-field" }, Eo = { class: "ss-field" }, ko = { class: "ss-field" }, fo = { class: "ss-actions" }, $o = ["disabled", "onClick"], bo = ["onClick"], Do = {
  key: 0,
  class: "ss-muted"
}, So = { class: "fa-checks" }, _o = {
  key: 0,
  class: "fa-raw"
}, Bo = {
  key: 1,
  class: "ss-muted"
}, wo = { class: "ss-kpis" }, Co = { class: "ss-kpi" }, To = { class: "ss-kpi" }, Mo = { class: "ss-kpi" }, Lo = { class: "ss-kpi" }, Uo = { class: "ss-kpi" }, Po = { key: 0 }, Fo = { class: "ss-subhead" }, zo = { class: "fa-flag-list" }, Ao = ["onClick"], xo = {
  key: 1,
  class: "ss-note ok"
}, Ro = { class: "ss-actions" }, Io = ["disabled"], Oo = { class: "ss-actions" }, Ko = { class: "fa-inline" }, qo = ["disabled"], jo = { class: "ss-muted" }, Wo = {
  key: 0,
  class: "fa-skipped"
}, Jo = { class: "ss-actions" }, Yo = { class: "ss-field fa-period" }, Ho = { value: "" }, Qo = ["value"], Go = ["disabled"], Xo = ["disabled"], Zo = { class: "fa-inline" }, ea = ["checked"], ta = {
  key: 0,
  class: "ss-panel fa-vedit"
}, la = { class: "ss-field fa-period" }, na = { class: "ss-table" }, oa = { class: "num" }, aa = { class: "num" }, sa = ["onUpdate:modelValue"], ia = ["onUpdate:modelValue"], ra = { value: "" }, da = ["value"], ca = ["onUpdate:modelValue"], ua = ["onUpdate:modelValue"], ma = ["onUpdate:modelValue"], pa = ["onClick"], va = { class: "total" }, ya = { colspan: "3" }, Va = { class: "num" }, Na = { class: "num" }, ga = { class: "ss-actions" }, ha = ["disabled"], Ea = { class: "fa-voucher__head" }, ka = { class: "fa-inline" }, fa = ["value"], $a = { class: "ss-muted fa-basis" }, ba = ["onClick"], Da = ["onClick"], Sa = { class: "ss-table" }, _a = { class: "num" }, Ba = { class: "num" }, wa = { class: "num" }, Ca = { class: "num" }, Ta = {
  key: 1,
  class: "ss-muted"
}, Ma = { class: "ss-note info" }, La = { class: "ss-actions" }, Ua = { class: "ss-field fa-period" }, Pa = { value: "" }, Fa = ["value"], za = { class: "fa-inline" }, Aa = ["disabled"], xa = {
  key: 0,
  class: "ss-actions"
}, Ra = { class: "fa-path" }, Ia = /* @__PURE__ */ e.defineComponent({
  __name: "VoucherTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = ["vat_special", "vat_normal", "e_ticket", "bank_receipt", "receipt", "other"], C = e.ref(""), d = e.ref({}), S = e.ref(""), p = e.ref(null), w = e.ref(!1), j = e.ref([]), s = e.ref(!1), v = e.ref([]), $ = e.ref(""), g = e.ref(""), c = e.ref(!1), T = e.ref(""), I = e.ref([]), W = e.ref(null), P = e.computed(() => te.value?.data), F = e.computed(() => (P.value?.docs || []).filter((o) => !o.claimId)), O = e.computed(() => [...P.value?.vouchers || []].sort((o, V) => o.date.localeCompare(V.date) || o.no.localeCompare(V.no))), L = e.computed(() => F.value.filter((o) => o.status === "flagged")), X = e.computed(() => F.value.filter((o) => o.status === "recognized")), B = e.computed(() => F.value.filter((o) => o.direction === "in")), N = e.computed(() => F.value.filter((o) => o.direction === "out")), k = e.computed(() => F.value.filter((o) => !o.voucherId && (w.value || o.status !== "flagged"))), U = e.computed(() => [...new Set(O.value.map((o) => o.period).filter(Boolean))].sort().reverse()), Y = e.computed(() => O.value.filter((o) => !$.value || o.period === $.value)), E = e.computed(() => Y.value.length > 0 && Y.value.every((o) => v.value.includes(o.id))), D = e.computed(() => {
      const o = /* @__PURE__ */ new Set();
      for (const V of te.value?.categories || []) o.add(V);
      for (const V of te.value?.settings.expense.rules || []) o.add(V.category);
      for (const V of P.value?.docs || []) V.category && o.add(V.category);
      return [...o];
    }), i = e.computed(() => (W.value?.lines || []).reduce((o, V) => o + Math.round((Number(V.debit) || 0) * 100), 0) / 100), A = e.computed(() => (W.value?.lines || []).reduce((o, V) => o + Math.round((Number(V.credit) || 0) * 100), 0) / 100), b = e.computed(() => (W.value?.lines.length || 0) >= 2 && Math.abs(i.value - A.value) < 5e-3 && i.value > 0), f = [
      { key: "upload", title: l.t("上传票据"), hint: l.t("发票、电子客票、银行回单，版式规则读字段，读不全的交给模型补并回原文核对") },
      { key: "check", title: l.t("识别校验"), hint: l.t("金额与税额、税号校验位、抬头、重复票、日期逐张校验") },
      { key: "generate", title: l.t("生成凭证草稿"), hint: l.t("按固定分录规则生成记账凭证草稿") },
      { key: "review", title: l.t("审核凭证"), hint: l.t("财务逐张核对分录，改完审核") },
      { key: "export", title: l.t("导出"), hint: l.t("凭证导入文件 + 识别校验报告 + 异常票据清单") }
    ], n = e.computed(() => {
      const o = (_, H, le) => C.value === _ ? { state: "running" } : d.value[_] ? { state: "failed", error: d.value[_] } : H ? { state: "done", summary: le } : { state: "todo" }, V = O.value.filter((_) => _.status === "reviewed").length;
      return {
        upload: o("upload", F.value.length > 0, l.t("{n} 张票据", { n: F.value.length })),
        check: o("check", F.value.length > 0 && !X.value.length, l.t("{a} 张已确认，{b} 张异常", { a: F.value.filter((_) => _.status === "confirmed").length, b: L.value.length })),
        generate: o("generate", O.value.length > 0 && (s.value || !k.value.length), l.t("{n} 张凭证草稿", { n: O.value.length })),
        review: o("review", O.value.length > 0 && V === O.value.length, l.t("{n} 张已审核", { n: V })),
        export: o("export", !!T.value, T.value)
      };
    }), h = e.computed(() => f.find((o) => n.value[o.key].state !== "done")?.key || "export");
    e.watch(S, (o) => {
      const V = F.value.find((_) => _.id === o);
      p.value = V ? { kind: V.kind, direction: V.direction, invoiceNo: V.invoiceNo, date: V.date, sellerName: V.sellerName, sellerTaxId: V.sellerTaxId, buyerName: V.buyerName, buyerTaxId: V.buyerTaxId, amount: V.amount, tax: V.tax, total: V.total, category: V.category, payer: V.payer, payee: V.payee, purpose: V.purpose } : null;
    });
    function u(o) {
      return { vat_special: l.t("专票"), vat_normal: l.t("普票"), e_ticket: l.t("客票"), bank_receipt: l.t("回单"), receipt: l.t("收据"), other: l.t("其他") }[o];
    }
    function Q(o) {
      return o === "in" ? l.t("进项") : o === "out" ? l.t("销项") : "—";
    }
    function J(o) {
      return { recognized: l.t("已识别"), confirmed: l.t("已确认"), flagged: l.t("异常") }[o];
    }
    function ae(o) {
      return o === "flagged" ? "bad" : o === "confirmed" ? "ok" : "warn";
    }
    function y(o, V) {
      const _ = o.fieldSource?.[V];
      return _ === "rule" ? l.t("规则") : _ === "model" ? l.t("模型") : _ === "manual" ? l.t("手工") : "";
    }
    function R(o) {
      return o.kind === "bank_receipt" ? o.direction === "in" ? o.payee || "" : o.payer || "" : o.direction === "out" ? o.buyerName || "" : o.sellerName || "";
    }
    function M(o) {
      return o.reduce((V, _) => V + Math.round(_.total * 100), 0) / 100;
    }
    function t(o) {
      const V = o.lines.reduce((H, le) => H + Math.round(le.debit * 100), 0), _ = o.lines.reduce((H, le) => H + Math.round(le.credit * 100), 0);
      return V === _;
    }
    function m(o) {
      S.value = S.value === o.id ? "" : o.id;
    }
    function a() {
      return { summary: "", accountCode: "", debit: 0, credit: 0, aux: "" };
    }
    async function ee(o, V) {
      C.value = o, d.value = { ...d.value, [o]: "" }, r.scrollToStep(o);
      try {
        return await V(), await Z(), !0;
      } catch (_) {
        return d.value = { ...d.value, [o]: r.errorMessage(_) }, !1;
      } finally {
        C.value = "";
      }
    }
    async function ye(o) {
      await ee("upload", async () => {
        const V = await K("doc.import", { paths: o });
        if (V.count < o.length) throw new Error(l.t("{a} 个文件里识别了 {b} 个，其余见进度提示", { a: o.length, b: V.count }));
        V.flagged && x.warn(l.t("{n} 张票据有异常，请在第 2 步处理", { n: V.flagged }));
      });
    }
    async function Ve(o) {
      p.value && await ee("check", () => K("doc.update", { id: o, patch: p.value }));
    }
    async function Pe(o) {
      window.confirm(l.t("删除这张票据？对应的凭证草稿会一起删除。")) && (await ee("upload", () => K("doc.remove", { id: o })), S.value === o && (S.value = ""));
    }
    async function Fe() {
      await ee("check", async () => {
        for (const o of X.value) await K("doc.update", { id: o.id, patch: { status: "confirmed" } });
      });
    }
    async function ze() {
      await ee("generate", async () => {
        const o = await K("voucher.generate", { includeFlagged: w.value });
        j.value = o.skipped || [], s.value = !0;
      });
    }
    async function De(o) {
      const V = [...v.value];
      await ee("review", () => K("voucher.review", { ids: V, undo: o })), v.value = [];
    }
    function Ae(o) {
      v.value = o ? Y.value.map((V) => V.id) : [];
    }
    async function Se() {
      I.value.length || (I.value = await K("accounts.list"));
    }
    async function xe(o) {
      await Se(), W.value = { id: o.id, no: o.no, date: o.date, lines: o.lines.map((V) => ({ ...V, aux: V.aux || "" })) };
    }
    async function Re() {
      await Se(), W.value = { date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), lines: [a(), a()] };
    }
    async function Ie() {
      const o = W.value;
      if (!o) return;
      await ee("review", () => o.id ? K("voucher.update", { id: o.id, date: o.date, lines: o.lines }) : K("voucher.create", { date: o.date, lines: o.lines })) && (W.value = null);
    }
    async function Oe(o) {
      window.confirm(l.t("删除这张凭证？")) && (await ee("review", () => K("voucher.remove", { id: o })), v.value = v.value.filter((V) => V !== o));
    }
    async function Ke() {
      await ee("export", async () => {
        const o = await K("voucher.export", { period: g.value || void 0, onlyReviewed: c.value });
        T.value = o.path;
      });
    }
    function ke(o, V = !1) {
      ie(o, V).catch((_) => x.error(r.errorMessage(_)));
    }
    function qe(o) {
      r.scrollToStep(o);
    }
    return (o, V) => (e.openBlock(), e.createElementBlock("div", _n, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createVNode(re, {
        title: o.$t("凭证处理"),
        metas: f,
        runtime: n.value,
        "current-key": h.value,
        onJump: qe
      }, null, 8, ["title", "runtime", "current-key"]),
      C.value && e.unref(ue).voucher ? (e.openBlock(), e.createElementBlock("p", Bn, [
        V[28] || (V[28] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(e.unref(ue).voucher),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      e.createElementVNode("div", wn, [
        e.createCommentVNode(" ① 上传票据 "),
        e.createVNode(G, {
          "step-key": "upload",
          index: 0,
          title: f[0].title,
          hint: f[0].hint,
          runtime: n.value.upload
        }, {
          default: e.withCtx(() => [
            e.createVNode(se, {
              kind: "invoice",
              label: o.$t("上传发票、电子客票、银行回单"),
              hint: o.$t("支持 PDF / OFD / XML 电子发票与图片（图片走本机 OCR），可多选"),
              disabled: !!C.value,
              onPicked: ye
            }, null, 8, ["label", "hint", "disabled"]),
            F.value.length ? (e.openBlock(), e.createElementBlock("div", Cn, [
              e.createElementVNode("table", Tn, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("文件")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("类型")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("方向")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("号码")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("日期")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("对方")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Mn,
                      e.toDisplayString(o.$t("金额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Ln,
                      e.toDisplayString(o.$t("税额")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Un,
                      e.toDisplayString(o.$t("价税合计")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("类别")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("状态")),
                      1
                      /* TEXT */
                    ),
                    V[29] || (V[29] = e.createElementVNode(
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
                    e.renderList(F.value, (_) => (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      {
                        key: _.id
                      },
                      [
                        e.createElementVNode("tr", {
                          class: e.normalizeClass([{ bad: _.status === "flagged", "fa-open": S.value === _.id }, "fa-row"]),
                          onClick: (H) => m(_)
                        }, [
                          e.createElementVNode("td", {
                            class: "fa-file",
                            title: _.fileName
                          }, [
                            e.createElementVNode(
                              "i",
                              {
                                class: e.normalizeClass(S.value === _.id ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line")
                              },
                              null,
                              2
                              /* CLASS */
                            ),
                            e.createTextVNode(
                              e.toDisplayString(_.fileName),
                              1
                              /* TEXT */
                            )
                          ], 8, Fn),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(u(_.kind)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(Q(_.direction)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(_.invoiceNo || "—"),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(_.date || "—"),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", {
                            class: "fa-ellip",
                            title: R(_)
                          }, e.toDisplayString(R(_) || "—"), 9, zn),
                          e.createElementVNode(
                            "td",
                            An,
                            e.toDisplayString(e.unref(r.fmtMoney)(_.amount)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            xn,
                            e.toDisplayString(e.unref(r.fmtMoney)(_.tax)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Rn,
                            e.toDisplayString(e.unref(r.fmtMoney)(_.total)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(_.category),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["ss-chip", ae(_.status)])
                              },
                              e.toDisplayString(J(_.status)),
                              3
                              /* TEXT, CLASS */
                            )
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: e.withModifiers((H) => Pe(_.id), ["stop"])
                            }, e.toDisplayString(o.$t("删除")), 9, In)
                          ])
                        ], 10, Pn),
                        S.value === _.id && p.value ? (e.openBlock(), e.createElementBlock("tr", On, [
                          e.createElementVNode("td", Kn, [
                            e.createElementVNode("div", qn, [
                              e.createElementVNode("div", jn, [
                                e.createElementVNode("label", Wn, [
                                  e.createElementVNode(
                                    "span",
                                    null,
                                    e.toDisplayString(o.$t("类型")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.withDirectives(e.createElementVNode(
                                    "select",
                                    {
                                      "onUpdate:modelValue": V[0] || (V[0] = (H) => p.value.kind = H)
                                    },
                                    [
                                      (e.openBlock(), e.createElementBlock(
                                        e.Fragment,
                                        null,
                                        e.renderList(z, (H) => e.createElementVNode("option", {
                                          key: H,
                                          value: H
                                        }, e.toDisplayString(u(H)), 9, Jn)),
                                        64
                                        /* STABLE_FRAGMENT */
                                      ))
                                    ],
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [e.vModelSelect, p.value.kind]
                                  ])
                                ]),
                                e.createElementVNode("label", Yn, [
                                  e.createElementVNode(
                                    "span",
                                    null,
                                    e.toDisplayString(o.$t("方向")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.withDirectives(e.createElementVNode(
                                    "select",
                                    {
                                      "onUpdate:modelValue": V[1] || (V[1] = (H) => p.value.direction = H)
                                    },
                                    [
                                      e.createElementVNode(
                                        "option",
                                        Hn,
                                        e.toDisplayString(o.$t("进项")),
                                        1
                                        /* TEXT */
                                      ),
                                      e.createElementVNode(
                                        "option",
                                        Qn,
                                        e.toDisplayString(o.$t("销项")),
                                        1
                                        /* TEXT */
                                      ),
                                      e.createElementVNode(
                                        "option",
                                        Gn,
                                        e.toDisplayString(o.$t("未判断")),
                                        1
                                        /* TEXT */
                                      )
                                    ],
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [e.vModelSelect, p.value.direction]
                                  ])
                                ]),
                                e.createElementVNode("label", Xn, [
                                  e.createElementVNode("span", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(o.$t("发票号码")),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "em",
                                      Zn,
                                      e.toDisplayString(y(_, "invoiceNo")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  e.withDirectives(e.createElementVNode(
                                    "input",
                                    {
                                      "onUpdate:modelValue": V[2] || (V[2] = (H) => p.value.invoiceNo = H),
                                      type: "text"
                                    },
                                    null,
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [
                                      e.vModelText,
                                      p.value.invoiceNo,
                                      void 0,
                                      { trim: !0 }
                                    ]
                                  ])
                                ]),
                                e.createElementVNode("label", eo, [
                                  e.createElementVNode("span", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(o.$t("日期")),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "em",
                                      to,
                                      e.toDisplayString(y(_, "date")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  e.withDirectives(e.createElementVNode(
                                    "input",
                                    {
                                      "onUpdate:modelValue": V[3] || (V[3] = (H) => p.value.date = H),
                                      type: "date"
                                    },
                                    null,
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [e.vModelText, p.value.date]
                                  ])
                                ]),
                                e.createElementVNode("label", lo, [
                                  e.createElementVNode("span", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(o.$t("销售方")),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "em",
                                      no,
                                      e.toDisplayString(y(_, "sellerName")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  e.withDirectives(e.createElementVNode(
                                    "input",
                                    {
                                      "onUpdate:modelValue": V[4] || (V[4] = (H) => p.value.sellerName = H),
                                      type: "text"
                                    },
                                    null,
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [
                                      e.vModelText,
                                      p.value.sellerName,
                                      void 0,
                                      { trim: !0 }
                                    ]
                                  ])
                                ]),
                                e.createElementVNode("label", oo, [
                                  e.createElementVNode("span", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(o.$t("销售方税号")),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "em",
                                      ao,
                                      e.toDisplayString(y(_, "sellerTaxId")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  e.withDirectives(e.createElementVNode(
                                    "input",
                                    {
                                      "onUpdate:modelValue": V[5] || (V[5] = (H) => p.value.sellerTaxId = H),
                                      type: "text"
                                    },
                                    null,
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [
                                      e.vModelText,
                                      p.value.sellerTaxId,
                                      void 0,
                                      { trim: !0 }
                                    ]
                                  ])
                                ]),
                                e.createElementVNode("label", so, [
                                  e.createElementVNode("span", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(o.$t("购买方")),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "em",
                                      io,
                                      e.toDisplayString(y(_, "buyerName")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  e.withDirectives(e.createElementVNode(
                                    "input",
                                    {
                                      "onUpdate:modelValue": V[6] || (V[6] = (H) => p.value.buyerName = H),
                                      type: "text"
                                    },
                                    null,
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [
                                      e.vModelText,
                                      p.value.buyerName,
                                      void 0,
                                      { trim: !0 }
                                    ]
                                  ])
                                ]),
                                e.createElementVNode("label", ro, [
                                  e.createElementVNode("span", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(o.$t("购买方税号")),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "em",
                                      co,
                                      e.toDisplayString(y(_, "buyerTaxId")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  e.withDirectives(e.createElementVNode(
                                    "input",
                                    {
                                      "onUpdate:modelValue": V[7] || (V[7] = (H) => p.value.buyerTaxId = H),
                                      type: "text"
                                    },
                                    null,
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [
                                      e.vModelText,
                                      p.value.buyerTaxId,
                                      void 0,
                                      { trim: !0 }
                                    ]
                                  ])
                                ]),
                                e.createElementVNode("label", uo, [
                                  e.createElementVNode("span", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(o.$t("金额（不含税）")),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "em",
                                      mo,
                                      e.toDisplayString(y(_, "amount")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  e.withDirectives(e.createElementVNode(
                                    "input",
                                    {
                                      "onUpdate:modelValue": V[8] || (V[8] = (H) => p.value.amount = H),
                                      type: "number",
                                      step: "0.01"
                                    },
                                    null,
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [
                                      e.vModelText,
                                      p.value.amount,
                                      void 0,
                                      { number: !0 }
                                    ]
                                  ])
                                ]),
                                e.createElementVNode("label", po, [
                                  e.createElementVNode("span", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(o.$t("税额")),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "em",
                                      vo,
                                      e.toDisplayString(y(_, "tax")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  e.withDirectives(e.createElementVNode(
                                    "input",
                                    {
                                      "onUpdate:modelValue": V[9] || (V[9] = (H) => p.value.tax = H),
                                      type: "number",
                                      step: "0.01"
                                    },
                                    null,
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [
                                      e.vModelText,
                                      p.value.tax,
                                      void 0,
                                      { number: !0 }
                                    ]
                                  ])
                                ]),
                                e.createElementVNode("label", yo, [
                                  e.createElementVNode("span", null, [
                                    e.createTextVNode(
                                      e.toDisplayString(o.$t("价税合计")),
                                      1
                                      /* TEXT */
                                    ),
                                    e.createElementVNode(
                                      "em",
                                      Vo,
                                      e.toDisplayString(y(_, "total")),
                                      1
                                      /* TEXT */
                                    )
                                  ]),
                                  e.withDirectives(e.createElementVNode(
                                    "input",
                                    {
                                      "onUpdate:modelValue": V[10] || (V[10] = (H) => p.value.total = H),
                                      type: "number",
                                      step: "0.01"
                                    },
                                    null,
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [
                                      e.vModelText,
                                      p.value.total,
                                      void 0,
                                      { number: !0 }
                                    ]
                                  ])
                                ]),
                                e.createElementVNode("label", No, [
                                  e.createElementVNode(
                                    "span",
                                    null,
                                    e.toDisplayString(o.$t("费用类别")),
                                    1
                                    /* TEXT */
                                  ),
                                  e.withDirectives(e.createElementVNode(
                                    "select",
                                    {
                                      "onUpdate:modelValue": V[11] || (V[11] = (H) => p.value.category = H)
                                    },
                                    [
                                      (e.openBlock(!0), e.createElementBlock(
                                        e.Fragment,
                                        null,
                                        e.renderList(D.value, (H) => (e.openBlock(), e.createElementBlock("option", {
                                          key: H,
                                          value: H
                                        }, e.toDisplayString(H), 9, go))),
                                        128
                                        /* KEYED_FRAGMENT */
                                      ))
                                    ],
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [e.vModelSelect, p.value.category]
                                  ])
                                ]),
                                _.kind === "bank_receipt" ? (e.openBlock(), e.createElementBlock(
                                  e.Fragment,
                                  { key: 0 },
                                  [
                                    e.createElementVNode("label", ho, [
                                      e.createElementVNode(
                                        "span",
                                        null,
                                        e.toDisplayString(o.$t("付款方")),
                                        1
                                        /* TEXT */
                                      ),
                                      e.withDirectives(e.createElementVNode(
                                        "input",
                                        {
                                          "onUpdate:modelValue": V[12] || (V[12] = (H) => p.value.payer = H),
                                          type: "text"
                                        },
                                        null,
                                        512
                                        /* NEED_PATCH */
                                      ), [
                                        [
                                          e.vModelText,
                                          p.value.payer,
                                          void 0,
                                          { trim: !0 }
                                        ]
                                      ])
                                    ]),
                                    e.createElementVNode("label", Eo, [
                                      e.createElementVNode(
                                        "span",
                                        null,
                                        e.toDisplayString(o.$t("收款方")),
                                        1
                                        /* TEXT */
                                      ),
                                      e.withDirectives(e.createElementVNode(
                                        "input",
                                        {
                                          "onUpdate:modelValue": V[13] || (V[13] = (H) => p.value.payee = H),
                                          type: "text"
                                        },
                                        null,
                                        512
                                        /* NEED_PATCH */
                                      ), [
                                        [
                                          e.vModelText,
                                          p.value.payee,
                                          void 0,
                                          { trim: !0 }
                                        ]
                                      ])
                                    ]),
                                    e.createElementVNode("label", ko, [
                                      e.createElementVNode(
                                        "span",
                                        null,
                                        e.toDisplayString(o.$t("用途")),
                                        1
                                        /* TEXT */
                                      ),
                                      e.withDirectives(e.createElementVNode(
                                        "input",
                                        {
                                          "onUpdate:modelValue": V[14] || (V[14] = (H) => p.value.purpose = H),
                                          type: "text"
                                        },
                                        null,
                                        512
                                        /* NEED_PATCH */
                                      ), [
                                        [
                                          e.vModelText,
                                          p.value.purpose,
                                          void 0,
                                          { trim: !0 }
                                        ]
                                      ])
                                    ])
                                  ],
                                  64
                                  /* STABLE_FRAGMENT */
                                )) : e.createCommentVNode("v-if", !0)
                              ]),
                              e.createElementVNode("div", fo, [
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-btn primary sm",
                                  disabled: !!C.value,
                                  onClick: (H) => Ve(_.id)
                                }, [
                                  V[30] || (V[30] = e.createElementVNode(
                                    "i",
                                    { class: "ri-save-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  e.createTextVNode(
                                    e.toDisplayString(o.$t("保存并重新校验")),
                                    1
                                    /* TEXT */
                                  )
                                ], 8, $o),
                                e.createElementVNode("button", {
                                  type: "button",
                                  class: "ss-btn ghost sm",
                                  onClick: (H) => ke(_.path)
                                }, [
                                  V[31] || (V[31] = e.createElementVNode(
                                    "i",
                                    { class: "ri-external-link-line" },
                                    null,
                                    -1
                                    /* CACHED */
                                  )),
                                  e.createTextVNode(
                                    e.toDisplayString(o.$t("打开原件")),
                                    1
                                    /* TEXT */
                                  )
                                ], 8, bo),
                                _.model ? (e.openBlock(), e.createElementBlock(
                                  "span",
                                  Do,
                                  e.toDisplayString(o.$t("部分字段由 {p0} 补全（已回原文核对）", { p0: e.unref(me)(_.model) })),
                                  1
                                  /* TEXT */
                                )) : e.createCommentVNode("v-if", !0)
                              ]),
                              e.createElementVNode("ul", So, [
                                (e.openBlock(!0), e.createElementBlock(
                                  e.Fragment,
                                  null,
                                  e.renderList(_.checks, (H, le) => (e.openBlock(), e.createElementBlock("li", { key: le }, [
                                    e.createElementVNode(
                                      "span",
                                      {
                                        class: e.normalizeClass(["ss-chip", e.unref(ve)(H.level)])
                                      },
                                      e.toDisplayString(e.unref(pe)(H.level)),
                                      3
                                      /* TEXT, CLASS */
                                    ),
                                    e.createTextVNode(
                                      e.toDisplayString(H.message),
                                      1
                                      /* TEXT */
                                    )
                                  ]))),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ]),
                              _.text ? (e.openBlock(), e.createElementBlock("details", _o, [
                                e.createElementVNode(
                                  "summary",
                                  null,
                                  e.toDisplayString(_.ocr ? o.$t("识别原文（本机 OCR）") : o.$t("识别原文")),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "pre",
                                  null,
                                  e.toDisplayString(_.text),
                                  1
                                  /* TEXT */
                                )
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
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              Bo,
              e.toDisplayString(o.$t("还没有票据。")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createCommentVNode(" ② 识别校验 "),
        e.createVNode(G, {
          "step-key": "check",
          index: 1,
          title: f[1].title,
          hint: f[1].hint,
          runtime: n.value.check
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", wo, [
              e.createElementVNode("div", Co, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(o.$t("票据")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(F.value.length),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", To, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(o.$t("异常")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  {
                    class: e.normalizeClass({ "fa-bad": L.value.length })
                  },
                  e.toDisplayString(L.value.length),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              e.createElementVNode("div", Mo, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(o.$t("进项 {n} 张", { n: B.value.length })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(e.unref(r.fmtMoney)(M(B.value))),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", Lo, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(o.$t("销项 {n} 张", { n: N.value.length })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(e.unref(r.fmtMoney)(M(N.value))),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("div", Uo, [
                e.createElementVNode(
                  "small",
                  null,
                  e.toDisplayString(o.$t("已确认")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(F.value.filter((_) => _.status === "confirmed").length),
                  1
                  /* TEXT */
                )
              ])
            ]),
            L.value.length ? (e.openBlock(), e.createElementBlock("div", Po, [
              e.createElementVNode(
                "div",
                Fo,
                e.toDisplayString(o.$t("异常票据")),
                1
                /* TEXT */
              ),
              e.createElementVNode("ul", zo, [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(L.value, (_) => (e.openBlock(), e.createElementBlock("li", {
                    key: _.id
                  }, [
                    e.createElementVNode("strong", {
                      onClick: (H) => m(_)
                    }, e.toDisplayString(_.fileName), 9, Ao),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(_.checks.filter((H) => H.level === "error").map((H) => H.message).join(" / ")),
                      1
                      /* TEXT */
                    )
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])) : F.value.length ? (e.openBlock(), e.createElementBlock("p", xo, [
              V[32] || (V[32] = e.createElementVNode(
                "i",
                { class: "ri-check-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(o.$t("没有异常票据")),
                1
                /* TEXT */
              )
            ])) : e.createCommentVNode("v-if", !0),
            e.createElementVNode("div", Ro, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!C.value || !X.value.length,
                onClick: Fe
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(C.value === "check" ? "ri-loader-4-line spin" : "ri-check-double-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(o.$t("无异常的票据全部确认无误（{n} 张）", { n: X.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, Io)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createCommentVNode(" ③ 生成凭证草稿 "),
        e.createVNode(G, {
          "step-key": "generate",
          index: 2,
          title: f[2].title,
          hint: f[2].hint,
          runtime: n.value.generate
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Oo, [
              e.createElementVNode("label", Ko, [
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": V[15] || (V[15] = (_) => w.value = _),
                    type: "checkbox"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelCheckbox, w.value]
                ]),
                e.createTextVNode(
                  e.toDisplayString(o.$t("包含异常票据")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!C.value || !k.value.length,
                onClick: ze
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(C.value === "generate" ? "ri-loader-4-line spin" : "ri-magic-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(o.$t("为 {n} 张票据生成凭证", { n: k.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, qo),
              e.createElementVNode(
                "span",
                jo,
                e.toDisplayString(o.$t("分录按固定规则生成（进项专票拆税额、普票全额入费用、销项拆收入与销项税），不经过模型")),
                1
                /* TEXT */
              )
            ]),
            j.value.length ? (e.openBlock(), e.createElementBlock("ul", Wo, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(j.value, (_, H) => (e.openBlock(), e.createElementBlock("li", { key: H }, [
                  V[33] || (V[33] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(_),
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
        e.createCommentVNode(" ④ 审核凭证 "),
        e.createVNode(G, {
          "step-key": "review",
          index: 3,
          title: f[3].title,
          hint: f[3].hint,
          runtime: n.value.review
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Jo, [
              e.createElementVNode("label", Yo, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(o.$t("期间")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": V[16] || (V[16] = (_) => $.value = _)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      Ho,
                      e.toDisplayString(o.$t("全部")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(U.value, (_) => (e.openBlock(), e.createElementBlock("option", {
                        key: _,
                        value: _
                      }, e.toDisplayString(_), 9, Qo))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, $.value]
                ])
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary sm",
                disabled: !!C.value || !v.value.length,
                onClick: V[17] || (V[17] = (_) => De(!1))
              }, [
                V[34] || (V[34] = e.createElementVNode(
                  "i",
                  { class: "ri-shield-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("审核选中（{n}）", { n: v.value.length })),
                  1
                  /* TEXT */
                )
              ], 8, Go),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost sm",
                disabled: !!C.value || !v.value.length,
                onClick: V[18] || (V[18] = (_) => De(!0))
              }, [
                V[35] || (V[35] = e.createElementVNode(
                  "i",
                  { class: "ri-arrow-go-back-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("撤销审核")),
                  1
                  /* TEXT */
                )
              ], 8, Xo),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost sm",
                onClick: Re
              }, [
                V[36] || (V[36] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("手工新增凭证")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("label", Zo, [
                e.createElementVNode("input", {
                  type: "checkbox",
                  checked: E.value,
                  onChange: V[19] || (V[19] = (_) => Ae(_.target.checked))
                }, null, 40, ea),
                e.createTextVNode(
                  e.toDisplayString(o.$t("全选")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createCommentVNode(" 编辑 / 新增 "),
            W.value ? (e.openBlock(), e.createElementBlock("div", ta, [
              e.createElementVNode("header", null, [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(W.value.id ? o.$t("编辑凭证 {p0}", { p0: W.value.no }) : o.$t("新增凭证")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("label", la, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(o.$t("日期")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": V[20] || (V[20] = (_) => W.value.date = _),
                    type: "date"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelText, W.value.date]
                ])
              ]),
              e.createElementVNode("table", na, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("摘要")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("科目")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(o.$t("辅助核算")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      oa,
                      e.toDisplayString(o.$t("借方")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      aa,
                      e.toDisplayString(o.$t("贷方")),
                      1
                      /* TEXT */
                    ),
                    V[37] || (V[37] = e.createElementVNode(
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
                    e.renderList(W.value.lines, (_, H) => (e.openBlock(), e.createElementBlock("tr", { key: H }, [
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (le) => _.summary = le,
                          type: "text"
                        }, null, 8, sa), [
                          [e.vModelText, _.summary]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("select", {
                          "onUpdate:modelValue": (le) => _.accountCode = le
                        }, [
                          e.createElementVNode(
                            "option",
                            ra,
                            e.toDisplayString(o.$t("选择科目")),
                            1
                            /* TEXT */
                          ),
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(I.value, (le) => (e.openBlock(), e.createElementBlock("option", {
                              key: le.code,
                              value: le.code
                            }, e.toDisplayString(le.code) + " " + e.toDisplayString(le.name), 9, da))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ], 8, ia), [
                          [e.vModelSelect, _.accountCode]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (le) => _.aux = le,
                          type: "text"
                        }, null, 8, ca), [
                          [e.vModelText, _.aux]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (le) => _.debit = le,
                          type: "number",
                          step: "0.01",
                          class: "num"
                        }, null, 8, ua), [
                          [
                            e.vModelText,
                            _.debit,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (le) => _.credit = le,
                          type: "number",
                          step: "0.01",
                          class: "num"
                        }, null, 8, ma), [
                          [
                            e.vModelText,
                            _.credit,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (le) => W.value.lines.splice(H, 1)
                        }, e.toDisplayString(o.$t("删行")), 9, pa)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  e.createElementVNode("tr", va, [
                    e.createElementVNode("td", ya, [
                      e.createTextVNode(
                        e.toDisplayString(o.$t("合计")) + " ",
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", b.value ? "ok" : "bad"])
                        },
                        e.toDisplayString(b.value ? o.$t("借贷平衡") : o.$t("借贷不平")),
                        3
                        /* TEXT, CLASS */
                      )
                    ]),
                    e.createElementVNode(
                      "td",
                      Va,
                      e.toDisplayString(e.unref(r.fmtMoney)(i.value)),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "td",
                      Na,
                      e.toDisplayString(e.unref(r.fmtMoney)(A.value)),
                      1
                      /* TEXT */
                    ),
                    V[38] || (V[38] = e.createElementVNode(
                      "td",
                      null,
                      null,
                      -1
                      /* CACHED */
                    ))
                  ])
                ])
              ]),
              e.createElementVNode("div", ga, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn ghost sm",
                  onClick: V[21] || (V[21] = (_) => W.value.lines.push(a()))
                }, [
                  V[39] || (V[39] = e.createElementVNode(
                    "i",
                    { class: "ri-add-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(o.$t("加一行")),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary sm",
                  disabled: !!C.value || !b.value,
                  onClick: Ie
                }, [
                  V[40] || (V[40] = e.createElementVNode(
                    "i",
                    { class: "ri-save-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(o.$t("保存")),
                    1
                    /* TEXT */
                  )
                ], 8, ha),
                e.createElementVNode(
                  "button",
                  {
                    type: "button",
                    class: "ss-btn ghost sm",
                    onClick: V[22] || (V[22] = (_) => W.value = null)
                  },
                  e.toDisplayString(o.$t("取消")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0),
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(Y.value, (_) => (e.openBlock(), e.createElementBlock(
                "div",
                {
                  key: _.id,
                  class: e.normalizeClass(["fa-voucher", { reviewed: _.status === "reviewed" }])
                },
                [
                  e.createElementVNode("div", Ea, [
                    e.createElementVNode("label", ka, [
                      e.withDirectives(e.createElementVNode("input", {
                        "onUpdate:modelValue": V[23] || (V[23] = (H) => v.value = H),
                        type: "checkbox",
                        value: _.id
                      }, null, 8, fa), [
                        [e.vModelCheckbox, v.value]
                      ]),
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(_.no),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(_.date),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", _.status === "reviewed" ? "ok" : "warn"])
                      },
                      e.toDisplayString(_.status === "reviewed" ? o.$t("已审核") : o.$t("草稿")),
                      3
                      /* TEXT, CLASS */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", t(_) ? "ok" : "bad"])
                      },
                      e.toDisplayString(t(_) ? o.$t("借贷平衡") : o.$t("借贷不平")),
                      3
                      /* TEXT, CLASS */
                    ),
                    e.createElementVNode(
                      "span",
                      $a,
                      e.toDisplayString(_.basis),
                      1
                      /* TEXT */
                    ),
                    V[41] || (V[41] = e.createElementVNode(
                      "span",
                      { class: "grow" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (H) => xe(_)
                    }, e.toDisplayString(o.$t("编辑")), 9, ba),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (H) => Oe(_.id)
                    }, e.toDisplayString(o.$t("删除")), 9, Da)
                  ]),
                  e.createElementVNode("table", Sa, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(o.$t("摘要")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(o.$t("科目")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(o.$t("辅助核算")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          _a,
                          e.toDisplayString(o.$t("借方")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Ba,
                          e.toDisplayString(o.$t("贷方")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(_.lines, (H, le) => (e.openBlock(), e.createElementBlock("tr", { key: le }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(H.summary),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(H.accountCode) + " " + e.toDisplayString(H.accountName),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(H.aux || ""),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            wa,
                            e.toDisplayString(H.debit ? e.unref(r.fmtMoney)(H.debit) : ""),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            Ca,
                            e.toDisplayString(H.credit ? e.unref(r.fmtMoney)(H.credit) : ""),
                            1
                            /* TEXT */
                          )
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ],
                2
                /* CLASS */
              ))),
              128
              /* KEYED_FRAGMENT */
            )),
            Y.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "p",
              Ta,
              e.toDisplayString(o.$t("还没有凭证。")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createCommentVNode(" ⑤ 导出 "),
        e.createVNode(G, {
          "step-key": "export",
          index: 4,
          title: f[4].title,
          hint: f[4].hint,
          runtime: n.value.export
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", Ma, [
              V[42] || (V[42] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(o.$t("导出的是通用凭证导入格式，由财务导入自己的财务软件；本工作台不改正式账套。")),
                1
                /* TEXT */
              )
            ]),
            e.createElementVNode("div", La, [
              e.createElementVNode("label", Ua, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(o.$t("期间")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": V[24] || (V[24] = (_) => g.value = _)
                  },
                  [
                    e.createElementVNode(
                      "option",
                      Pa,
                      e.toDisplayString(o.$t("全部")),
                      1
                      /* TEXT */
                    ),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(U.value, (_) => (e.openBlock(), e.createElementBlock("option", {
                        key: _,
                        value: _
                      }, e.toDisplayString(_), 9, Fa))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelSelect, g.value]
                ])
              ]),
              e.createElementVNode("label", za, [
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": V[25] || (V[25] = (_) => c.value = _),
                    type: "checkbox"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [e.vModelCheckbox, c.value]
                ]),
                e.createTextVNode(
                  e.toDisplayString(o.$t("只导出已审核")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!C.value || !O.value.length,
                onClick: Ke
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(C.value === "export" ? "ri-loader-4-line spin" : "ri-file-excel-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(o.$t("导出凭证与识别校验报告")),
                  1
                  /* TEXT */
                )
              ], 8, Aa)
            ]),
            T.value ? (e.openBlock(), e.createElementBlock("div", xa, [
              e.createElementVNode(
                "code",
                Ra,
                e.toDisplayString(T.value),
                1
                /* TEXT */
              ),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost sm",
                onClick: V[26] || (V[26] = (_) => ke(T.value))
              }, [
                V[43] || (V[43] = e.createElementVNode(
                  "i",
                  { class: "ri-external-link-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("打开")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn ghost sm",
                onClick: V[27] || (V[27] = (_) => ke(T.value, !0))
              }, [
                V[44] || (V[44] = e.createElementVNode(
                  "i",
                  { class: "ri-folder-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(o.$t("在文件夹中显示")),
                  1
                  /* TEXT */
                )
              ])
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), Oa = /* @__PURE__ */ oe(Ia, [["__scopeId", "data-v-c865c94e"]]), Ka = { class: "ss-module" }, qa = { class: "ss-note warn fa-compliance" }, ja = { class: "fa-split" }, Wa = { class: "fa-list" }, Ja = { class: "ss-subhead" }, Ya = ["onClick"], Ha = { class: "fa-list__top" }, Qa = { class: "fa-list__meta" }, Ga = ["onClick"], Xa = {
  key: 0,
  class: "ss-empty"
}, Za = { class: "fa-detail" }, es = { class: "ss-steps" }, ts = { class: "ss-actions" }, ls = { class: "fa-seg" }, ns = ["value"], os = ["disabled"], as = { class: "ss-muted" }, ss = { class: "ss-subhead" }, is = { class: "ss-table fa-edit" }, rs = { class: "num" }, ds = { class: "num" }, cs = ["onUpdate:modelValue", "onChange"], us = ["onUpdate:modelValue"], ms = ["onUpdate:modelValue"], ps = ["onClick"], vs = { class: "ss-grid" }, ys = { class: "ss-field" }, Vs = { class: "ss-field" }, Ns = { class: "ss-field" }, gs = { class: "ss-field" }, hs = { class: "ss-field" }, Es = { class: "ss-field" }, ks = { class: "ss-field" }, fs = { class: "ss-field" }, $s = { class: "ss-field fa-check" }, bs = { class: "ss-actions" }, Ds = { class: "ss-field fa-small" }, Ss = {
  key: 0,
  class: "ss-table fa-edit"
}, _s = { class: "num" }, Bs = { class: "num" }, ws = { class: "num" }, Cs = { class: "num" }, Ts = { class: "num" }, Ms = { class: "num" }, Ls = { class: "num" }, Us = { class: "num" }, Ps = ["onUpdate:modelValue"], Fs = ["onUpdate:modelValue"], zs = ["onUpdate:modelValue"], As = ["onUpdate:modelValue"], xs = ["onUpdate:modelValue"], Rs = ["onUpdate:modelValue"], Is = ["onUpdate:modelValue"], Os = ["onUpdate:modelValue"], Ks = ["onUpdate:modelValue"], qs = ["onClick"], js = { class: "ss-actions" }, Ws = { class: "ss-muted" }, Js = { class: "ss-actions" }, Ys = ["disabled"], Hs = { class: "ss-muted" }, Qs = { class: "ss-kpis" }, Gs = { class: "ss-kpi accent" }, Xs = { class: "ss-kpi" }, Zs = { class: "ss-kpi" }, ei = { class: "ss-kpi" }, ti = { class: "ss-kpi" }, li = {
  key: 0,
  class: "ss-note ok"
}, ni = { class: "ss-subhead" }, oi = { class: "ss-table" }, ai = { class: "num" }, si = { class: "fa-wrap" }, ii = { class: "num" }, ri = { class: "ss-subhead" }, di = { class: "ss-table" }, ci = { class: "num" }, ui = { class: "num" }, mi = { class: "num" }, pi = { class: "num" }, vi = { class: "num" }, yi = { class: "num" }, Vi = { class: "num" }, Ni = { class: "num" }, gi = { class: "num" }, hi = { class: "num" }, Ei = {
  key: 0,
  class: "ss-note ok"
}, ki = { class: "fa-finding__head" }, fi = { class: "fa-pre" }, $i = { class: "fa-sugg" }, bi = { class: "ss-actions" }, Di = {
  key: 1,
  class: "ss-muted"
}, Si = { class: "ss-actions" }, _i = ["disabled"], Bi = {
  key: 0,
  class: "ss-muted"
}, wi = {
  key: 0,
  class: "fa-note"
}, Ci = { class: "ss-actions" }, Ti = ["disabled"], Mi = {
  key: 0,
  class: "ss-actions"
}, Li = { class: "fa-path" }, Ui = /* @__PURE__ */ e.defineComponent({
  __name: "TaxTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = e.computed(() => te.value?.ledgers.find((y) => y.id === te.value?.activeLedgerId)?.taxpayerType !== "general"), C = /* @__PURE__ */ new Date(), d = e.ref(z.value ? "quarter" : "month"), S = e.ref(he()), p = e.ref(C.getMonth() < 3 ? C.getFullYear() - 1 : C.getFullYear()), w = e.ref(C.getMonth() < 3 ? 4 : Math.floor(C.getMonth() / 3)), j = e.computed(() => d.value === "month" ? S.value : `${p.value}-Q${w.value}`), s = e.ref(null), v = e.ref([]), $ = e.ref(0), g = e.ref([]), c = e.ref(C.getMonth() || 1), T = e.ref(""), I = e.ref(""), W = e.ref({}), P = e.ref(!1), F = e.ref(!1), O = e.computed(() => te.value?.data.taxRuns || []), L = e.computed(() => O.value.find((y) => y.id === T.value) || null);
    e.watch($, (y) => {
      s.value && (s.value.uninvoicedRate = (Number(y) || 0) / 100);
    });
    const X = e.computed(() => L.value ? [
      { title: l.t("增值税"), lines: L.value.result.vat },
      { title: l.t("附加税费"), lines: L.value.result.surcharges },
      { title: l.t("企业所得税（季度预缴）"), lines: L.value.result.cit }
    ] : []), B = [
      { key: "derive", title: l.t("所属期与取数"), hint: l.t("从票据与账面数据预填，可逐项改") },
      { key: "iit", title: l.t("工资个税"), hint: l.t("导入工资表，按累计预扣法计算") },
      { key: "compute", title: l.t("计算税额"), hint: l.t("增值税、附加税、企业所得税、个税，每行带公式") },
      { key: "check", title: l.t("账税差异与风险预检"), hint: l.t("账面收入 vs 申报、税负率、进项抵扣异常") },
      { key: "note", title: l.t("申报备注"), hint: l.t("给复核人看的说明，模型只引用算好的数字") },
      { key: "export", title: l.t("导出草稿"), hint: l.t("申报表草稿 + 个税明细 + 风险预检 Excel") }
    ], N = e.computed(() => {
      const y = L.value, R = (M, t, m) => I.value === M ? { state: "running" } : W.value[M] ? { state: "failed", error: W.value[M] } : t ? { state: "done", summary: m } : { state: "todo" };
      return {
        derive: R("derive", !!s.value || !!y, l.t("所属期 {p0}", { p0: j.value })),
        iit: R("iit", P.value || !!y, l.t("{n} 人", { n: g.value.length })),
        compute: R("compute", !!y, y ? l.t("增值税 {a}，附加 {b}，所得税 {c}", { a: r.fmtMoney(y.result.vatPayable), b: r.fmtMoney(y.result.surchargeTotal), c: r.fmtMoney(y.result.citPayable) }) : ""),
        check: R("check", !!y && (F.value || !y.findings.length), y ? l.t("{n} 项提示", { n: y.findings.length }) : ""),
        note: R("note", !!y?.note),
        export: R("export", !!y?.exportPath, y?.exportPath)
      };
    }), k = e.computed(() => B.find((y) => N.value[y.key].state !== "done")?.key || "export");
    function U() {
      v.value = (s.value?.salesByRate || []).map((y) => Math.round(y.rate * 1e4) / 100), $.value = Math.round((s.value?.uninvoicedRate || 0) * 1e4) / 100;
    }
    function Y(y) {
      T.value = y.id;
      const R = y.period.match(/^(\d{4})-Q([1-4])$/);
      R ? (d.value = "quarter", p.value = Number(R[1]), w.value = Number(R[2])) : (d.value = "month", S.value = y.period), s.value = JSON.parse(JSON.stringify(y.inputs)), g.value = JSON.parse(JSON.stringify(y.iitRows || [])), U(), F.value = !1, W.value = {};
    }
    function E() {
      s.value?.salesByRate.push({ rate: z.value ? 0.01 : 0.13, amount: 0, tax: 0 }), U();
    }
    function D(y) {
      s.value?.salesByRate.splice(y, 1), v.value.splice(y, 1);
    }
    function i() {
      P.value = !0, g.value.push({ name: "", salary: 0, insurance: 0, special: 0, ytdSalary: 0, ytdInsurance: 0, ytdSpecial: 0, ytdTaxPaid: 0, monthIndex: c.value });
    }
    async function A(y, R) {
      I.value = y, W.value = { ...W.value, [y]: "" }, r.scrollToStep(y);
      try {
        return await R(), !0;
      } catch (M) {
        return W.value = { ...W.value, [y]: r.errorMessage(M) }, !1;
      } finally {
        I.value = "";
      }
    }
    async function b() {
      await A("derive", async () => {
        s.value = await K("tax.derive", { period: j.value }), U(), T.value = "", F.value = !1;
      });
    }
    async function f(y) {
      await A("iit", async () => {
        if (g.value = await K("tax.importPayroll", { path: y, monthIndex: c.value }), P.value = !0, !g.value.length) throw new Error(l.t("工资表里没有读到人员"));
      });
    }
    async function n() {
      if (!s.value) return;
      s.value.salesByRate.forEach((R, M) => {
        R.rate = (Number(v.value[M]) || 0) / 100;
      });
      const y = { period: j.value, inputs: s.value, iitRows: g.value.filter((R) => R.name) };
      await A("compute", async () => {
        const R = await K("tax.compute", y);
        await Z(), T.value = R.id, F.value = !1;
      });
    }
    async function h() {
      if (!L.value) return;
      const y = L.value.id;
      await A("note", async () => {
        await K("tax.note", { id: y }), await Z();
      });
    }
    async function u() {
      if (!L.value) return;
      const y = L.value.id;
      await A("export", async () => {
        await K("tax.export", { id: y }), await Z();
      });
    }
    async function Q(y) {
      if (window.confirm(l.t("删除这份申报草稿？")))
        try {
          await K("tax.remove", { id: y }), T.value === y && (T.value = ""), await Z();
        } catch (R) {
          x.error(r.errorMessage(R));
        }
    }
    function J(y, R = !1) {
      ie(y, R).catch((M) => x.error(r.errorMessage(M)));
    }
    function ae(y) {
      r.scrollToStep(y);
    }
    return (y, R) => (e.openBlock(), e.createElementBlock("div", Ka, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createElementVNode("p", qa, [
        R[20] || (R[20] = e.createElementVNode(
          "i",
          { class: "ri-alarm-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(y.$t("本智能体不对接电子税务局、不自动提交申报：只做数据整理、草稿生成和风险自查，申报由财务人员在电子税务局核对后自行提交。")),
          1
          /* TEXT */
        )
      ]),
      e.createVNode(Ne),
      e.createElementVNode("div", ja, [
        e.createElementVNode("aside", Wa, [
          e.createElementVNode(
            "div",
            Ja,
            e.toDisplayString(y.$t("申报草稿")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(O.value, (M) => (e.openBlock(), e.createElementBlock("li", {
                key: M.id,
                class: e.normalizeClass({ active: M.id === T.value }),
                onClick: (t) => Y(M)
              }, [
                e.createElementVNode("div", Ha, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(M.period),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", M.findings.some((t) => t.level === "high") ? "bad" : M.findings.length ? "warn" : "ok"])
                    },
                    e.toDisplayString(y.$t("{n} 项提示", { n: M.findings.length })),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("div", Qa, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(y.$t("增值税 {p0}", { p0: e.unref(r.fmtMoney)(M.result.vatPayable) })),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(r.fmtDateTime)(M.createdAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: e.withModifiers((t) => Q(M.id), ["stop"])
                  }, e.toDisplayString(y.$t("删除")), 9, Ga)
                ])
              ], 10, Ya))),
              128
              /* KEYED_FRAGMENT */
            )),
            O.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              Xa,
              e.toDisplayString(y.$t("还没有申报草稿")),
              1
              /* TEXT */
            ))
          ])
        ]),
        e.createElementVNode("section", Za, [
          e.createVNode(re, {
            title: y.$t("税务申报 {p0}", { p0: j.value }),
            metas: B,
            runtime: N.value,
            "current-key": k.value,
            onJump: ae
          }, null, 8, ["title", "runtime", "current-key"]),
          e.createElementVNode("div", es, [
            e.createCommentVNode(" ① 所属期与取数 "),
            e.createVNode(G, {
              "step-key": "derive",
              index: 0,
              title: B[0].title,
              hint: B[0].hint,
              runtime: N.value.derive
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", ts, [
                  e.createElementVNode("div", ls, [
                    e.createElementVNode(
                      "button",
                      {
                        type: "button",
                        class: e.normalizeClass({ active: d.value === "month" }),
                        onClick: R[0] || (R[0] = (M) => d.value = "month")
                      },
                      e.toDisplayString(y.$t("按月")),
                      3
                      /* TEXT, CLASS */
                    ),
                    e.createElementVNode(
                      "button",
                      {
                        type: "button",
                        class: e.normalizeClass({ active: d.value === "quarter" }),
                        onClick: R[1] || (R[1] = (M) => d.value = "quarter")
                      },
                      e.toDisplayString(y.$t("按季")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  d.value === "month" ? e.withDirectives((e.openBlock(), e.createElementBlock(
                    "input",
                    {
                      key: 0,
                      "onUpdate:modelValue": R[2] || (R[2] = (M) => S.value = M),
                      type: "month",
                      class: "fa-input"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  )), [
                    [e.vModelText, S.value]
                  ]) : (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 1 },
                    [
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": R[3] || (R[3] = (M) => p.value = M),
                          type: "number",
                          min: "2000",
                          max: "2100",
                          class: "fa-input fa-year"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [
                          e.vModelText,
                          p.value,
                          void 0,
                          { number: !0 }
                        ]
                      ]),
                      e.withDirectives(e.createElementVNode(
                        "select",
                        {
                          "onUpdate:modelValue": R[4] || (R[4] = (M) => w.value = M),
                          class: "fa-input"
                        },
                        [
                          (e.openBlock(), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(4, (M) => e.createElementVNode("option", {
                              key: M,
                              value: M
                            }, e.toDisplayString(y.$t("第 {n} 季度", { n: M })), 9, ns)),
                            64
                            /* STABLE_FRAGMENT */
                          ))
                        ],
                        512
                        /* NEED_PATCH */
                      ), [
                        [
                          e.vModelSelect,
                          w.value,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!I.value || !j.value,
                    onClick: b
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(I.value === "derive" ? "ri-loader-4-line spin" : "ri-download-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(y.$t("从票据与账面取数")),
                      1
                      /* TEXT */
                    )
                  ], 8, os),
                  e.createElementVNode(
                    "span",
                    as,
                    e.toDisplayString(y.$t("销项按已识别的销项票据按税率汇总，进项取专票与客票；账面收入、利润取导入的序时账和已审核凭证")),
                    1
                    /* TEXT */
                  )
                ]),
                s.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode(
                      "div",
                      ss,
                      e.toDisplayString(y.$t("销售额（按税率）")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("table", is, [
                      e.createElementVNode("thead", null, [
                        e.createElementVNode("tr", null, [
                          e.createElementVNode(
                            "th",
                            null,
                            e.toDisplayString(y.$t("税率 / 征收率（%）")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            rs,
                            e.toDisplayString(y.$t("不含税销售额")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "th",
                            ds,
                            e.toDisplayString(y.$t("税额")),
                            1
                            /* TEXT */
                          ),
                          R[21] || (R[21] = e.createElementVNode(
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
                          e.renderList(s.value.salesByRate, (M, t) => (e.openBlock(), e.createElementBlock("tr", { key: t }, [
                            e.createElementVNode("td", null, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": (m) => v.value[t] = m,
                                type: "number",
                                step: "0.1",
                                onChange: (m) => M.rate = (Number(v.value[t]) || 0) / 100
                              }, null, 40, cs), [
                                [
                                  e.vModelText,
                                  v.value[t],
                                  void 0,
                                  { number: !0 }
                                ]
                              ])
                            ]),
                            e.createElementVNode("td", null, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": (m) => M.amount = m,
                                type: "number",
                                step: "0.01",
                                class: "num"
                              }, null, 8, us), [
                                [
                                  e.vModelText,
                                  M.amount,
                                  void 0,
                                  { number: !0 }
                                ]
                              ])
                            ]),
                            e.createElementVNode("td", null, [
                              e.withDirectives(e.createElementVNode("input", {
                                "onUpdate:modelValue": (m) => M.tax = m,
                                type: "number",
                                step: "0.01",
                                class: "num"
                              }, null, 8, ms), [
                                [
                                  e.vModelText,
                                  M.tax,
                                  void 0,
                                  { number: !0 }
                                ]
                              ])
                            ]),
                            e.createElementVNode("td", null, [
                              e.createElementVNode("button", {
                                type: "button",
                                class: "ss-link",
                                onClick: (m) => D(t)
                              }, e.toDisplayString(y.$t("删行")), 9, ps)
                            ])
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ]),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn ghost sm",
                      onClick: E
                    }, [
                      R[22] || (R[22] = e.createElementVNode(
                        "i",
                        { class: "ri-add-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(y.$t("加一个税率")),
                        1
                        /* TEXT */
                      )
                    ]),
                    e.createElementVNode("div", vs, [
                      e.createElementVNode("label", ys, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(y.$t("未开票收入（不含税）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": R[5] || (R[5] = (M) => s.value.uninvoicedSales = M),
                            type: "number",
                            step: "0.01"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            s.value.uninvoicedSales,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", Vs, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(y.$t("未开票收入适用税率（%）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": R[6] || (R[6] = (M) => $.value = M),
                            type: "number",
                            step: "0.1"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            $.value,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", Ns, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(y.$t("认证可抵扣进项税额")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": R[7] || (R[7] = (M) => s.value.inputTax = M),
                            type: "number",
                            step: "0.01"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            s.value.inputTax,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", gs, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(y.$t("进项税额转出")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": R[8] || (R[8] = (M) => s.value.inputTransferOut = M),
                            type: "number",
                            step: "0.01"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            s.value.inputTransferOut,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", hs, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(y.$t("上期留抵税额")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": R[9] || (R[9] = (M) => s.value.carriedCredit = M),
                            type: "number",
                            step: "0.01"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            s.value.carriedCredit,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", Es, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(y.$t("账面收入（核对账税差异）")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": R[10] || (R[10] = (M) => s.value.bookRevenue = M),
                            type: "number",
                            step: "0.01"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            s.value.bookRevenue,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", ks, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(y.$t("本年累计利润总额")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": R[11] || (R[11] = (M) => s.value.profitYtd = M),
                            type: "number",
                            step: "0.01"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            s.value.profitYtd,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", fs, [
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(y.$t("本年已预缴企业所得税")),
                          1
                          /* TEXT */
                        ),
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": R[12] || (R[12] = (M) => s.value.citPaidYtd = M),
                            type: "number",
                            step: "0.01"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [
                            e.vModelText,
                            s.value.citPaidYtd,
                            void 0,
                            { number: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("label", $s, [
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": R[13] || (R[13] = (M) => s.value.quarterly = M),
                            type: "checkbox"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelCheckbox, s.value.quarterly]
                        ]),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(y.$t("按季申报（免征额按 3 个月算）")),
                          1
                          /* TEXT */
                        )
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
            e.createCommentVNode(" ② 个税 "),
            e.createVNode(G, {
              "step-key": "iit",
              index: 1,
              title: B[1].title,
              hint: B[1].hint,
              runtime: N.value.iit
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", bs, [
                  e.createElementVNode("label", Ds, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(y.$t("本年第几个月（累计月数）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": R[14] || (R[14] = (M) => c.value = M),
                        type: "number",
                        min: "1",
                        max: "12"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        c.value,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])
                ]),
                e.createVNode(se, {
                  compact: "",
                  kind: "excel",
                  multi: !1,
                  label: y.$t("导入工资表"),
                  hint: y.$t("需要：姓名、应发工资；可选：个人社保公积金、专项附加扣除、累计收入 / 累计已预扣税额等"),
                  disabled: !!I.value,
                  onPicked: R[15] || (R[15] = (M) => f(M[0]))
                }, null, 8, ["label", "hint", "disabled"]),
                g.value.length ? (e.openBlock(), e.createElementBlock("table", Ss, [
                  e.createElementVNode("thead", null, [
                    e.createElementVNode("tr", null, [
                      e.createElementVNode(
                        "th",
                        null,
                        e.toDisplayString(y.$t("姓名")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        _s,
                        e.toDisplayString(y.$t("本月应发")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        Bs,
                        e.toDisplayString(y.$t("三险一金")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        ws,
                        e.toDisplayString(y.$t("专项附加")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        Cs,
                        e.toDisplayString(y.$t("累计收入（此前）")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        Ts,
                        e.toDisplayString(y.$t("累计三险一金")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        Ms,
                        e.toDisplayString(y.$t("累计专项附加")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        Ls,
                        e.toDisplayString(y.$t("累计已预扣")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "th",
                        Us,
                        e.toDisplayString(y.$t("月数")),
                        1
                        /* TEXT */
                      ),
                      R[23] || (R[23] = e.createElementVNode(
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
                      e.renderList(g.value, (M, t) => (e.openBlock(), e.createElementBlock("tr", { key: t }, [
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (m) => M.name = m,
                            type: "text"
                          }, null, 8, Ps), [
                            [
                              e.vModelText,
                              M.name,
                              void 0,
                              { trim: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (m) => M.salary = m,
                            type: "number",
                            step: "0.01"
                          }, null, 8, Fs), [
                            [
                              e.vModelText,
                              M.salary,
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (m) => M.insurance = m,
                            type: "number",
                            step: "0.01"
                          }, null, 8, zs), [
                            [
                              e.vModelText,
                              M.insurance,
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (m) => M.special = m,
                            type: "number",
                            step: "0.01"
                          }, null, 8, As), [
                            [
                              e.vModelText,
                              M.special,
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (m) => M.ytdSalary = m,
                            type: "number",
                            step: "0.01"
                          }, null, 8, xs), [
                            [
                              e.vModelText,
                              M.ytdSalary,
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (m) => M.ytdInsurance = m,
                            type: "number",
                            step: "0.01"
                          }, null, 8, Rs), [
                            [
                              e.vModelText,
                              M.ytdInsurance,
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (m) => M.ytdSpecial = m,
                            type: "number",
                            step: "0.01"
                          }, null, 8, Is), [
                            [
                              e.vModelText,
                              M.ytdSpecial,
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (m) => M.ytdTaxPaid = m,
                            type: "number",
                            step: "0.01"
                          }, null, 8, Os), [
                            [
                              e.vModelText,
                              M.ytdTaxPaid,
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (m) => M.monthIndex = m,
                            type: "number",
                            min: "1",
                            max: "12"
                          }, null, 8, Ks), [
                            [
                              e.vModelText,
                              M.monthIndex,
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ]),
                        e.createElementVNode("td", null, [
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-link",
                            onClick: (m) => g.value.splice(t, 1)
                          }, e.toDisplayString(y.$t("删行")), 9, qs)
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : e.createCommentVNode("v-if", !0),
                e.createElementVNode("div", js, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost sm",
                    onClick: i
                  }, [
                    R[24] || (R[24] = e.createElementVNode(
                      "i",
                      { class: "ri-user-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(y.$t("手工加一人")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "span",
                    Ws,
                    e.toDisplayString(y.$t("没有工资可以跳过，个税为 0。")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createCommentVNode(" ③ 计算 "),
            e.createVNode(G, {
              "step-key": "compute",
              index: 2,
              title: B[2].title,
              hint: B[2].hint,
              runtime: N.value.compute
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Js, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!I.value || !s.value,
                    onClick: n
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(I.value === "compute" ? "ri-loader-4-line spin" : "ri-calculator-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(y.$t("计算税额")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ys),
                  e.createElementVNode(
                    "span",
                    Hs,
                    e.toDisplayString(y.$t("税率与优惠口径在「设置 → 税务」里改")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: R[16] || (R[16] = (M) => y.$emit("goto", "settings"))
                    },
                    e.toDisplayString(y.$t("去设置")),
                    1
                    /* TEXT */
                  )
                ]),
                L.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode("div", Qs, [
                      e.createElementVNode("div", Gs, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(y.$t("应纳增值税")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(e.unref(r.fmtMoney)(L.value.result.vatPayable)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", Xs, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(y.$t("附加税费")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(e.unref(r.fmtMoney)(L.value.result.surchargeTotal)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", Zs, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(y.$t("企业所得税（本期应补）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(e.unref(r.fmtMoney)(L.value.result.citPayable)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", ei, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(y.$t("个税代扣")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(e.unref(r.fmtMoney)(L.value.result.iitTotal)),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", ti, [
                        e.createElementVNode(
                          "small",
                          null,
                          e.toDisplayString(y.$t("增值税税负率")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(L.value.result.burdenRate != null ? e.unref(r.fmtPct)(L.value.result.burdenRate) : "—"),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    L.value.result.vatExempt ? (e.openBlock(), e.createElementBlock("p", li, [
                      R[25] || (R[25] = e.createElementVNode(
                        "i",
                        { class: "ri-check-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(y.$t("销售额未超过免征额，本期增值税免征")),
                        1
                        /* TEXT */
                      )
                    ])) : e.createCommentVNode("v-if", !0),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(X.value, (M) => (e.openBlock(), e.createElementBlock("div", {
                        key: M.title
                      }, [
                        e.createElementVNode(
                          "div",
                          ni,
                          e.toDisplayString(M.title),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("table", oi, [
                          e.createElementVNode("thead", null, [
                            e.createElementVNode("tr", null, [
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(y.$t("项目")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(y.$t("计算过程")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                ai,
                                e.toDisplayString(y.$t("结果")),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          e.createElementVNode("tbody", null, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(M.lines, (t, m) => (e.openBlock(), e.createElementBlock("tr", { key: m }, [
                                e.createElementVNode(
                                  "td",
                                  null,
                                  e.toDisplayString(t.label),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  si,
                                  e.toDisplayString(t.formula),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  ii,
                                  e.toDisplayString(t.value > 0 && t.value < 1 ? e.unref(r.fmtPct)(t.value, 0) : e.unref(r.fmtMoney)(t.value)),
                                  1
                                  /* TEXT */
                                )
                              ]))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ])
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    L.value.result.iit.length ? (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      { key: 1 },
                      [
                        e.createElementVNode(
                          "div",
                          ri,
                          e.toDisplayString(y.$t("个人所得税（累计预扣法）")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("table", di, [
                          e.createElementVNode("thead", null, [
                            e.createElementVNode("tr", null, [
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(y.$t("姓名")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                ci,
                                e.toDisplayString(y.$t("累计应纳税所得额")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                ui,
                                e.toDisplayString(y.$t("税率")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                mi,
                                e.toDisplayString(y.$t("速算扣除数")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                pi,
                                e.toDisplayString(y.$t("累计已预扣")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                vi,
                                e.toDisplayString(y.$t("本月应预扣")),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          e.createElementVNode("tbody", null, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(L.value.result.iit, (M, t) => (e.openBlock(), e.createElementBlock("tr", { key: t }, [
                                e.createElementVNode(
                                  "td",
                                  null,
                                  e.toDisplayString(M.name),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  yi,
                                  e.toDisplayString(e.unref(r.fmtMoney)(M.taxableYtd)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Vi,
                                  e.toDisplayString(M.rate != null ? e.unref(r.fmtPct)(M.rate, 0) : "—"),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  Ni,
                                  e.toDisplayString(e.unref(r.fmtMoney)(M.quickDeduction)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  gi,
                                  e.toDisplayString(e.unref(r.fmtMoney)(M.ytdTaxPaid)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode(
                                  "td",
                                  hi,
                                  e.toDisplayString(e.unref(r.fmtMoney)(M.taxThisMonth)),
                                  1
                                  /* TEXT */
                                )
                              ]))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
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
            }, 8, ["title", "hint", "runtime"]),
            e.createCommentVNode(" ④ 账税差异与风险预检 "),
            e.createVNode(G, {
              "step-key": "check",
              index: 3,
              title: B[3].title,
              hint: B[3].hint,
              runtime: N.value.check
            }, {
              default: e.withCtx(() => [
                L.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    L.value.findings.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Ei, [
                      R[26] || (R[26] = e.createElementVNode(
                        "i",
                        { class: "ri-check-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(y.$t("没有发现账税差异或风险")),
                        1
                        /* TEXT */
                      )
                    ])),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(L.value.findings, (M, t) => (e.openBlock(), e.createElementBlock(
                        "div",
                        {
                          key: t,
                          class: e.normalizeClass(["fa-finding", M.level])
                        },
                        [
                          e.createElementVNode("div", ki, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["ss-chip", e.unref(ve)(M.level)])
                              },
                              e.toDisplayString(e.unref(pe)(M.level)),
                              3
                              /* TEXT, CLASS */
                            ),
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(M.title),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode(
                            "p",
                            fi,
                            e.toDisplayString(M.detail),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("p", $i, [
                            R[27] || (R[27] = e.createElementVNode(
                              "i",
                              { class: "ri-lightbulb-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(M.suggestion),
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
                    e.createElementVNode("div", bi, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn ghost sm",
                        onClick: R[17] || (R[17] = (M) => F.value = !0)
                      }, [
                        R[28] || (R[28] = e.createElementVNode(
                          "i",
                          { class: "ri-check-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(y.$t("已逐项核对")),
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
                  Di,
                  e.toDisplayString(y.$t("先计算税额。")),
                  1
                  /* TEXT */
                ))
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createCommentVNode(" ⑤ 申报备注 "),
            e.createVNode(G, {
              "step-key": "note",
              index: 4,
              title: B[4].title,
              hint: B[4].hint,
              runtime: N.value.note
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Si, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!I.value || !L.value,
                    onClick: h
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(I.value === "note" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(L.value?.note ? y.$t("重新生成申报备注") : y.$t("生成申报备注")),
                      1
                      /* TEXT */
                    )
                  ], 8, _i),
                  L.value?.model ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Bi,
                    e.toDisplayString(y.$t("由 {p0} 撰写，数字取自上面的计算结果", { p0: e.unref(me)(L.value.model) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                L.value?.note ? (e.openBlock(), e.createElementBlock(
                  "div",
                  wi,
                  e.toDisplayString(L.value.note),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createCommentVNode(" ⑥ 导出 "),
            e.createVNode(G, {
              "step-key": "export",
              index: 5,
              title: B[5].title,
              hint: B[5].hint,
              runtime: N.value.export
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Ci, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!I.value || !L.value,
                    onClick: u
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(I.value === "export" ? "ri-loader-4-line spin" : "ri-file-excel-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(y.$t("导出申报表草稿")),
                      1
                      /* TEXT */
                    )
                  ], 8, Ti)
                ]),
                L.value?.exportPath ? (e.openBlock(), e.createElementBlock("div", Mi, [
                  e.createElementVNode(
                    "code",
                    Li,
                    e.toDisplayString(L.value.exportPath),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost sm",
                    onClick: R[18] || (R[18] = (M) => J(L.value.exportPath))
                  }, [
                    R[29] || (R[29] = e.createElementVNode(
                      "i",
                      { class: "ri-external-link-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(y.$t("打开")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost sm",
                    onClick: R[19] || (R[19] = (M) => J(L.value.exportPath, !0))
                  }, [
                    R[30] || (R[30] = e.createElementVNode(
                      "i",
                      { class: "ri-folder-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(y.$t("在文件夹中显示")),
                      1
                      /* TEXT */
                    )
                  ])
                ])) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"])
          ])
        ])
      ])
    ]));
  }
}), Pi = /* @__PURE__ */ oe(Ui, [["__scopeId", "data-v-33c86943"]]), be = globalThis.__TOTALCLAW_SDK__ && globalThis.__TOTALCLAW_SDK__.modules && globalThis.__TOTALCLAW_SDK__.modules["npm:vue-router"];
if (!be) throw new Error("宿主模块未就绪：npm:vue-router");
be.default;
const Fi = { class: "ss-module" }, zi = { class: "ss-note warn" }, Ai = { class: "ss-panel" }, xi = { class: "ss-muted" }, Ri = { class: "fa-deadlines" }, Ii = {
  key: 0,
  class: "ss-chip ok"
}, Oi = {
  key: 1,
  class: "ss-chip bad"
}, Ki = { class: "fa-split" }, qi = { class: "fa-list" }, ji = { class: "ss-subhead" }, Wi = ["onClick"], Ji = { class: "fa-list__top" }, Yi = { class: "fa-list__meta" }, Hi = ["onClick"], Qi = {
  key: 0,
  class: "ss-empty"
}, Gi = ["disabled"], Xi = { class: "fa-detail" }, Zi = { class: "ss-steps" }, er = { class: "ss-grid" }, tr = { class: "ss-field" }, lr = { value: "" }, nr = ["value"], or = { class: "ss-field" }, ar = { value: "" }, sr = ["value"], ir = {
  key: 0,
  class: "ss-note info"
}, rr = { class: "ss-actions" }, dr = ["disabled"], cr = {
  key: 1,
  class: "ss-table-wrap"
}, ur = { class: "ss-table" }, mr = { class: "num" }, pr = { class: "num" }, vr = {
  key: 2,
  class: "ss-muted"
}, yr = {
  key: 0,
  class: "fa-checklist"
}, Vr = ["checked", "onChange"], Nr = {
  key: 1,
  class: "ss-muted"
}, gr = { class: "ss-grid" }, hr = { class: "ss-field" }, Er = ["value"], kr = { class: "ss-field" }, fr = { class: "ss-actions" }, $r = { class: "fa-url" }, br = ["disabled"], Dr = { class: "fa-inline" }, Sr = ["disabled"], _r = {
  key: 0,
  class: "ss-muted"
}, Br = { class: "ss-actions" }, wr = ["disabled"], Cr = ["disabled"], Tr = { class: "ss-muted" }, Mr = ["value"], Lr = { class: "ss-actions" }, Ur = { class: "ss-note info" }, Pr = {
  key: 0,
  class: "ss-table-wrap"
}, Fr = { class: "ss-table" }, zr = { class: "num" }, Ar = { class: "num" }, xr = { class: "num" }, Rr = ["value", "onChange"], Ir = { value: "pending" }, Or = { value: "handed" }, Kr = { value: "filed" }, qr = {
  key: 0,
  value: "paid"
}, jr = ["value", "onChange"], Wr = { class: "num" }, Jr = ["value", "onChange"], Yr = ["onClick"], Hr = ["onClick"], Qr = {
  key: 1,
  class: "ss-note warn"
}, Gr = /* @__PURE__ */ e.defineComponent({
  __name: "FilingTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = be.useRouter(), C = e.reactive({ checklist: [], provinces: [], portal: "", deadlines: [] }), d = e.computed(() => te.value?.data), S = e.computed(() => d.value?.filings || []), p = e.computed(() => d.value?.taxRuns || []), w = e.computed(() => d.value?.statements || []), j = e.ref(""), s = e.computed(() => S.value.find((t) => t.id === j.value) || null), v = e.ref(""), $ = e.ref(""), g = e.ref(""), c = e.ref({}), T = e.ref(!1), I = e.ref(!1), W = e.ref(""), P = e.reactive({ province: "", url: "" }), F = e.computed(() => !!s.value && C.checklist.every((t) => s.value.checklist[t.key])), O = e.computed(() => (s.value?.items || []).filter((t) => t.status === "paid" && t.paidAmount != null && Math.abs(t.paidAmount - t.amount) >= 0.01).map((t) => N(t.tax)));
    e.watch(S, (t) => {
      !j.value && t.length && (j.value = t[0].id);
    }, { immediate: !0 }), e.watch(j, () => {
      c.value = {}, W.value = "", T.value = !1, I.value = !1, s.value && (v.value = s.value.taxRunId);
    }), e.watch(p, (t) => {
      !v.value && t.length && (v.value = t[0].id);
    }, { immediate: !0 });
    const L = [
      { key: "draft", title: l.t("选申报草稿"), hint: l.t("从税务申报智能体算好的草稿生成本期待报税种") },
      { key: "check", title: l.t("申报前核对"), hint: l.t("逐项勾完才能进入电子税务局") },
      { key: "login", title: l.t("登录电子税务局"), hint: l.t("在内置浏览器打开，由你本人扫码或用 CA 登录") },
      { key: "fill", title: l.t("数字员工代填"), hint: l.t("按草稿逐表填写，停在「提交」前") },
      { key: "receipt", title: l.t("提交与回执"), hint: l.t("你本人提交并缴款，回来登记回执号与缴款") }
    ], X = e.computed(() => {
      const t = s.value, m = (ee, ye, Ve) => g.value === ee ? { state: "running" } : c.value[ee] ? { state: "failed", error: c.value[ee] } : ye ? { state: "done", summary: Ve } : { state: "todo" }, a = t ? t.items.filter((ee) => ee.status === "filed" || ee.status === "paid").length : 0;
      return {
        draft: m("draft", !!t, t ? l.t("{p0}，{n} 个税种", { p0: t.period, n: t.items.length }) : ""),
        check: m("check", F.value, l.t("已全部核对")),
        login: m("login", I.value || !!t?.handedAt, l.t("已登录")),
        fill: m("fill", !!t?.handedAt, t?.handedAt ? l.t("{p0} 交给数字员工", { p0: r.fmtDateTime(t.handedAt) }) : ""),
        receipt: m("receipt", !!t && a === t.items.length, t ? l.t("{a}/{b} 已申报", { a, b: t.items.length }) : "")
      };
    }), B = e.computed(() => L.find((t) => X.value[t.key].state !== "done")?.key || "receipt");
    function N(t) {
      return { vat: l.t("增值税"), surcharge: l.t("附加税费"), cit: l.t("企业所得税（预缴）"), iit: l.t("个人所得税（扣缴）"), statements: l.t("财务报表报送") }[t];
    }
    function k(t) {
      return { pending: l.t("待申报"), handed: l.t("已交数字员工代填"), filed: l.t("已申报"), paid: l.t("已缴款") }[t];
    }
    function U(t) {
      return t === "paid" || t === "filed" ? "ok" : t === "handed" ? "brand" : "warn";
    }
    function Y(t) {
      return { total: t.items.length, filed: t.items.filter((m) => m.status === "filed" || m.status === "paid").length };
    }
    async function E() {
      try {
        Object.assign(C, await K("filing.meta"));
        const t = te.value?.settings.taxPortal;
        P.province = t?.province || "", P.url = t?.url || "";
      } catch (t) {
        x.error(r.errorMessage(t));
      }
    }
    e.onMounted(E), e.watch(S, () => {
      E();
    });
    async function D(t, m) {
      g.value = t, c.value = { ...c.value, [t]: "" }, r.scrollToStep(t);
      try {
        return await m(), await Z(), !0;
      } catch (a) {
        return c.value = { ...c.value, [t]: r.errorMessage(a) }, !1;
      } finally {
        g.value = "";
      }
    }
    async function i() {
      await D("draft", async () => {
        const t = await K("filing.create", { taxRunId: v.value, statementId: $.value || void 0 });
        j.value = t.id;
      });
    }
    async function A(t, m) {
      if (s.value)
        try {
          await K("filing.check", { id: s.value.id, key: t, value: m }), await Z();
        } catch (a) {
          x.error(r.errorMessage(a));
        }
    }
    async function b() {
      try {
        await K("settings.patch", { patch: { taxPortal: { province: P.province, url: P.url } } }), await Z(), await E();
      } catch (t) {
        x.error(r.errorMessage(t));
      }
    }
    async function f() {
      const t = te.value?.activeLedgerId || "default";
      if (!await r.openEmbeddedBrowser(C.portal, `finance-etax-${t}`)) {
        x.error(l.t("内置浏览器不可用"));
        return;
      }
      T.value = !0;
    }
    async function n() {
      s.value && await D("fill", async () => {
        W.value = await K("filing.instruction", { id: s.value.id });
      });
    }
    async function h() {
      const t = s.value;
      if (!t) return;
      await D("fill", async () => {
        const a = await K("filing.instruction", { id: t.id });
        W.value = a;
        const ee = window.electronAPI, ye = await ee.conversation.create({ kind: "single", members: ["general_assistant"], title: l.t("代填申报：{p0} {p1}", { p0: te.value?.ledgers.find((Ve) => Ve.id === te.value?.activeLedgerId)?.name || "", p1: t.period }), initialMessage: a });
        ee.conversation.sendMessage(ye.id, a), await K("filing.handed", { id: t.id, conversationId: ye.id });
      }) && x.success(l.t("已交给数字员工代填；填完它会停在提交前请你核对"));
    }
    async function u(t, m) {
      if (s.value)
        try {
          await K("filing.updateItem", { id: s.value.id, tax: t, patch: m }), await Z();
        } catch (a) {
          x.error(r.errorMessage(a));
        }
    }
    async function Q(t) {
      if (!s.value) return;
      const m = await Me("invoice", !1);
      if (m[0])
        try {
          await K("filing.attachReceipt", { id: s.value.id, tax: t, path: m[0] }), await Z();
        } catch (a) {
          x.error(r.errorMessage(a));
        }
    }
    async function J(t) {
      if (window.confirm(l.t("删除 {p0} 的申报记录？（不影响电子税务局里已提交的申报）", { p0: t.period })))
        try {
          await K("filing.remove", { id: t.id }), j.value === t.id && (j.value = ""), await Z();
        } catch (m) {
          x.error(r.errorMessage(m));
        }
    }
    async function ae() {
      try {
        const t = await K("filing.export");
        await ie(t.path, !0);
      } catch (t) {
        x.error(r.errorMessage(t));
      }
    }
    function y(t) {
      ie(t).catch((m) => x.error(r.errorMessage(m)));
    }
    async function R(t) {
      try {
        await navigator.clipboard.writeText(t), x.success(l.t("已复制"));
      } catch {
        x.error(l.t("复制失败"));
      }
    }
    function M(t) {
      r.scrollToStep(t);
    }
    return (t, m) => (e.openBlock(), e.createElementBlock("div", Fi, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createElementVNode("p", zi, [
        m[8] || (m[8] = e.createElementVNode(
          "i",
          { class: "ri-shield-keyhole-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          " " + e.toDisplayString(t.$t("电子税务局没有给企业开放申报接口，登录必须本人扫码或用 CA 证书，申报提交在法律上由纳税人本人确认。所以这里的做法是：你登录 → 数字员工按草稿代填 → 停在「提交」前 → 你核对后亲自点提交。")),
          1
          /* TEXT */
        )
      ]),
      e.createCommentVNode(" 本期申报期限 "),
      e.createElementVNode("section", Ai, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            m[9] || (m[9] = e.createElementVNode(
              "i",
              { class: "ri-calendar-check-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(t.$t("本期申报期限")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            xi,
            e.toDisplayString(t.$t("按所属期结束后次月 15 日计算；遇节假日顺延，以电子税务局申报日历为准。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", Ri, [
          (e.openBlock(!0), e.createElementBlock(
            e.Fragment,
            null,
            e.renderList(C.deadlines, (a) => (e.openBlock(), e.createElementBlock(
              "div",
              {
                key: a.tax + a.period,
                class: e.normalizeClass(["fa-deadline", { done: a.done, soon: !a.done && a.daysLeft <= 5, over: !a.done && a.daysLeft < 0 }])
              },
              [
                e.createElementVNode(
                  "strong",
                  null,
                  e.toDisplayString(a.label),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("所属期 {p0}", { p0: a.period })),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(t.$t("截止 {p0}", { p0: a.due })),
                  1
                  /* TEXT */
                ),
                a.done ? (e.openBlock(), e.createElementBlock(
                  "em",
                  Ii,
                  e.toDisplayString(t.$t("已申报")),
                  1
                  /* TEXT */
                )) : a.daysLeft < 0 ? (e.openBlock(), e.createElementBlock(
                  "em",
                  Oi,
                  e.toDisplayString(t.$t("已逾期 {n} 天", { n: -a.daysLeft })),
                  1
                  /* TEXT */
                )) : (e.openBlock(), e.createElementBlock(
                  "em",
                  {
                    key: 2,
                    class: e.normalizeClass(["ss-chip", a.daysLeft <= 5 ? "warn" : ""])
                  },
                  e.toDisplayString(t.$t("还剩 {n} 天", { n: a.daysLeft })),
                  3
                  /* TEXT, CLASS */
                ))
              ],
              2
              /* CLASS */
            ))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      e.createElementVNode("div", Ki, [
        e.createElementVNode("aside", qi, [
          e.createElementVNode(
            "div",
            ji,
            e.toDisplayString(t.$t("申报记录")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(S.value, (a) => (e.openBlock(), e.createElementBlock("li", {
                key: a.id,
                class: e.normalizeClass({ active: a.id === j.value }),
                onClick: (ee) => j.value = a.id
              }, [
                e.createElementVNode("div", Ji, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(a.period),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", Y(a).filed === Y(a).total ? "ok" : "warn"])
                    },
                    e.toDisplayString(t.$t("{a}/{b} 已申报", { a: Y(a).filed, b: Y(a).total })),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("div", Yi, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(r.fmtDateTime)(a.createdAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: e.withModifiers((ee) => J(a), ["stop"])
                  }, e.toDisplayString(t.$t("删除")), 9, Hi)
                ])
              ], 10, Wi))),
              128
              /* KEYED_FRAGMENT */
            )),
            S.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              Qi,
              e.toDisplayString(t.$t("还没有申报记录")),
              1
              /* TEXT */
            ))
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            disabled: !S.value.length,
            onClick: ae
          }, [
            m[10] || (m[10] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("导出申报台账")),
              1
              /* TEXT */
            )
          ], 8, Gi)
        ]),
        e.createElementVNode("section", Xi, [
          e.createVNode(re, {
            title: t.$t("申报上报"),
            metas: L,
            runtime: X.value,
            "current-key": B.value,
            onJump: M
          }, null, 8, ["title", "runtime", "current-key"]),
          e.createElementVNode("div", Zi, [
            e.createCommentVNode(" 1 选草稿 "),
            e.createVNode(G, {
              "step-key": "draft",
              index: 0,
              title: L[0].title,
              hint: L[0].hint,
              runtime: X.value.draft
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", er, [
                  e.createElementVNode("label", tr, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("申报草稿（税务申报智能体算好的）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": m[0] || (m[0] = (a) => v.value = a)
                      },
                      [
                        e.createElementVNode(
                          "option",
                          lr,
                          e.toDisplayString(t.$t("请选择")),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(p.value, (a) => (e.openBlock(), e.createElementBlock("option", {
                            key: a.id,
                            value: a.id
                          }, e.toDisplayString(t.$t("{p0}：增值税 {a}，附加 {b}，所得税 {c}，个税 {d}", { p0: a.period, a: e.unref(r.fmtMoney)(a.result.vatPayable), b: e.unref(r.fmtMoney)(a.result.surchargeTotal), c: e.unref(r.fmtMoney)(a.result.citPayable), d: e.unref(r.fmtMoney)(a.result.iitTotal) })), 9, nr))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelSelect, v.value]
                    ])
                  ]),
                  e.createElementVNode("label", or, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("同时报送财务报表（可选）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": m[1] || (m[1] = (a) => $.value = a)
                      },
                      [
                        e.createElementVNode(
                          "option",
                          ar,
                          e.toDisplayString(t.$t("不报送")),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(w.value, (a) => (e.openBlock(), e.createElementBlock("option", {
                            key: a.id,
                            value: a.id
                          }, e.toDisplayString(a.period), 9, sr))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelSelect, $.value]
                    ])
                  ])
                ]),
                p.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", ir, [
                  m[11] || (m[11] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("还没有申报草稿，先到「税务申报」算好税额。")) + " ",
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: m[2] || (m[2] = (a) => t.$emit("goto", "tax"))
                    },
                    e.toDisplayString(t.$t("去税务申报")),
                    1
                    /* TEXT */
                  )
                ])),
                e.createElementVNode("div", rr, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !v.value || !!g.value,
                    onClick: i
                  }, [
                    m[12] || (m[12] = e.createElementVNode(
                      "i",
                      { class: "ri-list-check-2" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("生成待报事项")),
                      1
                      /* TEXT */
                    )
                  ], 8, dr)
                ]),
                s.value ? (e.openBlock(), e.createElementBlock("div", cr, [
                  e.createElementVNode("table", ur, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("税种")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          mr,
                          e.toDisplayString(t.$t("应纳（补）税额")),
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
                        e.renderList(s.value.items, (a) => (e.openBlock(), e.createElementBlock("tr", {
                          key: a.tax
                        }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(N(a.tax)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            pr,
                            e.toDisplayString(a.tax === "statements" ? "—" : e.unref(r.fmtMoney)(a.amount)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["ss-chip", U(a.status)])
                              },
                              e.toDisplayString(k(a.status)),
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
                ])) : e.createCommentVNode("v-if", !0),
                s.value && s.value.items.some((a) => a.tax !== "statements" && !a.amount) ? (e.openBlock(), e.createElementBlock(
                  "p",
                  vr,
                  e.toDisplayString(t.$t("税额为 0 的税种也要按期申报（零申报），否则算逾期未申报。")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createCommentVNode(" 2 核对清单 "),
            e.createVNode(G, {
              "step-key": "check",
              index: 1,
              title: L[1].title,
              hint: L[1].hint,
              runtime: X.value.check
            }, {
              default: e.withCtx(() => [
                s.value ? (e.openBlock(), e.createElementBlock("ul", yr, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(C.checklist, (a) => (e.openBlock(), e.createElementBlock("li", {
                      key: a.key
                    }, [
                      e.createElementVNode("label", null, [
                        e.createElementVNode("input", {
                          type: "checkbox",
                          checked: !!s.value.checklist[a.key],
                          onChange: (ee) => A(a.key, ee.target.checked)
                        }, null, 40, Vr),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(a.label),
                          1
                          /* TEXT */
                        )
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (e.openBlock(), e.createElementBlock(
                  "p",
                  Nr,
                  e.toDisplayString(t.$t("先生成待报事项")),
                  1
                  /* TEXT */
                ))
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createCommentVNode(" 3 登录 "),
            e.createVNode(G, {
              "step-key": "login",
              index: 2,
              title: L[2].title,
              hint: L[2].hint,
              runtime: X.value.login
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", gr, [
                  e.createElementVNode("label", hr, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("所在省份")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": m[3] || (m[3] = (a) => P.province = a),
                        onChange: b
                      },
                      [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(C.provinces, (a) => (e.openBlock(), e.createElementBlock("option", {
                            key: a.code,
                            value: a.code
                          }, e.toDisplayString(a.name), 9, Er))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ],
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [e.vModelSelect, P.province]
                    ])
                  ]),
                  e.createElementVNode("label", kr, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("或自定义地址")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": m[4] || (m[4] = (a) => P.url = a),
                        type: "text",
                        placeholder: "https://etax.xxx.chinatax.gov.cn",
                        onChange: b
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        P.url,
                        void 0,
                        { trim: !0 }
                      ]
                    ])
                  ])
                ]),
                e.createElementVNode("div", fr, [
                  e.createElementVNode(
                    "code",
                    $r,
                    e.toDisplayString(C.portal),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !s.value || !F.value,
                    onClick: f
                  }, [
                    m[13] || (m[13] = e.createElementVNode(
                      "i",
                      { class: "ri-global-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("在内置浏览器打开电子税务局")),
                      1
                      /* TEXT */
                    )
                  ], 8, br),
                  e.createElementVNode("label", Dr, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": m[5] || (m[5] = (a) => I.value = a),
                      type: "checkbox",
                      disabled: !T.value
                    }, null, 8, Sr), [
                      [e.vModelCheckbox, I.value]
                    ]),
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(t.$t("我已登录（本人扫码 / CA）")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                s.value && !F.value ? (e.openBlock(), e.createElementBlock(
                  "p",
                  _r,
                  e.toDisplayString(t.$t("核对清单全部勾完才能继续。")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createCommentVNode(" 4 数字员工代填 "),
            e.createVNode(G, {
              "step-key": "fill",
              index: 3,
              title: L[3].title,
              hint: L[3].hint,
              runtime: X.value.fill
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Br, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn ghost",
                    disabled: !s.value || !F.value || !!g.value,
                    onClick: n
                  }, [
                    m[14] || (m[14] = e.createElementVNode(
                      "i",
                      { class: "ri-eye-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("预览代填清单")),
                      1
                      /* TEXT */
                    )
                  ], 8, wr),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !s.value || !F.value || !I.value || !!g.value,
                    onClick: h
                  }, [
                    m[15] || (m[15] = e.createElementVNode(
                      "i",
                      { class: "ri-robot-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("交给数字员工代填")),
                      1
                      /* TEXT */
                    )
                  ], 8, Cr),
                  s.value?.conversationId ? (e.openBlock(), e.createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: m[6] || (m[6] = (a) => e.unref(z).push(`/conversations/${s.value.conversationId}`))
                  }, [
                    m[16] || (m[16] = e.createElementVNode(
                      "i",
                      { class: "ri-eye-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("查看代填过程")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode(
                  "p",
                  Tr,
                  e.toDisplayString(t.$t("数字员工只填写，不点「提交申报」「缴款」；电子税务局预填的数据和草稿不一致时，它会停下来把两边数字列给你。")),
                  1
                  /* TEXT */
                ),
                W.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode("textarea", {
                      class: "fa-instruction",
                      readonly: "",
                      value: W.value,
                      rows: "12"
                    }, null, 8, Mr),
                    e.createElementVNode("div", Lr, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost",
                        onClick: m[7] || (m[7] = (a) => R(W.value))
                      }, [
                        m[17] || (m[17] = e.createElementVNode(
                          "i",
                          { class: "ri-file-copy-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(t.$t("复制（也可以照着自己填）")),
                          1
                          /* TEXT */
                        )
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
            e.createCommentVNode(" 5 提交与回执 "),
            e.createVNode(G, {
              "step-key": "receipt",
              index: 4,
              title: L[4].title,
              hint: L[4].hint,
              runtime: X.value.receipt
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("p", Ur, [
                  m[18] || (m[18] = e.createElementVNode(
                    "i",
                    { class: "ri-hand" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("在电子税务局核对代填结果无误后，由你本人点「提交申报」并缴款，然后回到这里登记。")),
                    1
                    /* TEXT */
                  )
                ]),
                s.value ? (e.openBlock(), e.createElementBlock("div", Pr, [
                  e.createElementVNode("table", Fr, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("税种")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          zr,
                          e.toDisplayString(t.$t("应纳税额")),
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
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("回执号")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Ar,
                          e.toDisplayString(t.$t("缴款金额")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(t.$t("回执")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(s.value.items, (a) => (e.openBlock(), e.createElementBlock("tr", {
                          key: a.tax
                        }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(N(a.tax)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            xr,
                            e.toDisplayString(a.tax === "statements" ? "—" : e.unref(r.fmtMoney)(a.amount)),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("select", {
                              value: a.status,
                              onChange: (ee) => u(a.tax, { status: ee.target.value })
                            }, [
                              e.createElementVNode(
                                "option",
                                Ir,
                                e.toDisplayString(k("pending")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "option",
                                Or,
                                e.toDisplayString(k("handed")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "option",
                                Kr,
                                e.toDisplayString(k("filed")),
                                1
                                /* TEXT */
                              ),
                              a.tax !== "statements" ? (e.openBlock(), e.createElementBlock(
                                "option",
                                qr,
                                e.toDisplayString(k("paid")),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ], 40, Rr)
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("input", {
                              value: a.receiptNo || "",
                              type: "text",
                              onChange: (ee) => u(a.tax, { receiptNo: ee.target.value })
                            }, null, 40, jr)
                          ]),
                          e.createElementVNode("td", Wr, [
                            a.tax !== "statements" ? (e.openBlock(), e.createElementBlock("input", {
                              key: 0,
                              value: a.paidAmount ?? "",
                              type: "number",
                              step: "0.01",
                              onChange: (ee) => u(a.tax, { paidAmount: Number(ee.target.value) })
                            }, null, 40, Jr)) : e.createCommentVNode("v-if", !0)
                          ]),
                          e.createElementVNode("td", null, [
                            a.receiptPath ? (e.openBlock(), e.createElementBlock("button", {
                              key: 0,
                              type: "button",
                              class: "ss-link",
                              onClick: (ee) => y(a.receiptPath)
                            }, e.toDisplayString(t.$t("查看")), 9, Yr)) : e.createCommentVNode("v-if", !0),
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (ee) => Q(a.tax)
                            }, e.toDisplayString(a.receiptPath ? t.$t("替换") : t.$t("上传回执")), 9, Hr)
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ])) : e.createCommentVNode("v-if", !0),
                s.value && O.value.length ? (e.openBlock(), e.createElementBlock("p", Qr, [
                  m[19] || (m[19] = e.createElementVNode(
                    "i",
                    { class: "ri-error-warning-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(t.$t("缴款金额与草稿不一致：{p0}。请确认是电子税务局按预填数据调整了，还是草稿有误。", { p0: O.value.join(e.unref(l.t)("、")) })),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"])
          ])
        ])
      ])
    ]));
  }
}), Xr = /* @__PURE__ */ oe(Gr, [["__scopeId", "data-v-c2fa0e17"]]), Zr = { class: "ss-module" }, ed = { class: "ss-note info" }, td = { class: "fa-split" }, ld = { class: "fa-list" }, nd = { class: "ss-subhead" }, od = { class: "fa-new" }, ad = ["placeholder"], sd = ["placeholder"], id = ["placeholder"], rd = ["placeholder"], dd = ["disabled"], cd = { class: "ss-subhead" }, ud = ["onClick"], md = { class: "fa-list__top" }, pd = { class: "fa-list__meta" }, vd = ["onClick"], yd = {
  key: 0,
  class: "ss-empty"
}, Vd = { class: "fa-detail" }, Nd = {
  key: 0,
  class: "ss-note info"
}, gd = { class: "ss-steps" }, hd = { class: "ss-muted" }, Ed = {
  key: 0,
  class: "ss-table-wrap"
}, kd = { class: "ss-table" }, fd = { class: "num" }, $d = { class: "fa-file" }, bd = ["onClick"], Dd = ["value", "disabled", "onChange"], Sd = ["value"], _d = { class: "num" }, Bd = { class: "fa-wrap" }, wd = ["onClick"], Cd = { class: "total" }, Td = { colspan: "3" }, Md = { class: "num" }, Ld = { class: "ss-actions" }, Ud = ["disabled"], Pd = {
  key: 1,
  class: "fa-reasons"
}, Fd = { class: "ss-actions" }, zd = ["disabled"], Ad = ["disabled"], xd = {
  key: 0,
  class: "ss-muted"
}, Rd = ["value"], Id = { class: "ss-actions" }, Od = ["disabled"], Kd = ["disabled"], qd = { class: "ss-muted" }, jd = {
  key: 1,
  class: "ss-muted"
}, Wd = { class: "ss-panel" }, Jd = ["disabled"], Yd = {
  key: 0,
  class: "ss-table-wrap"
}, Hd = { class: "ss-table" }, Qd = { class: "num" }, Gd = { class: "num" }, Xd = { class: "num" }, Zd = { class: "num" }, ec = {
  key: 1,
  class: "ss-muted"
}, tc = {
  key: 2,
  class: "ss-actions"
}, lc = { class: "fa-path" }, nc = /* @__PURE__ */ e.defineComponent({
  __name: "ExpenseTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = e.reactive({ employee: "", dept: "", level: "", reason: "" }), C = e.ref(""), d = e.ref(""), S = e.ref({}), p = e.ref([]), w = e.ref(""), j = e.computed(() => te.value?.data.claims || []), s = e.computed(() => j.value.find((n) => n.id === C.value) || null);
    e.watch(j, (n) => {
      n.some((h) => h.id === C.value) || (C.value = n[0]?.id || "");
    }, { immediate: !0 }), e.watch(C, () => {
      S.value = {};
    });
    const v = [
      { key: "docs", title: l.t("上传单据"), hint: l.t("员工的发票、客票、收据，逐张识别") },
      { key: "review", title: l.t("规则预审"), hint: l.t("标准、额度、票据有效期、重复发票、抬头逐张校验") },
      { key: "decide", title: l.t("财务确认"), hint: l.t("财务看预审意见，点通过或驳回") },
      { key: "notice", title: l.t("通知员工"), hint: l.t("生成通过 / 驳回通知，驳回写明原因") }
    ], $ = e.computed(() => {
      const n = s.value, h = (u, Q, J) => d.value === u ? { state: "running" } : S.value[u] ? { state: "failed", error: S.value[u] } : Q ? { state: "done", summary: J } : { state: "todo" };
      return {
        docs: h("docs", !!n?.items.length, n ? l.t("{n} 张票据，合计 {p0}", { n: n.items.length, p0: r.fmtMoney(n.total) }) : ""),
        review: h("review", !!n && n.verdict !== "pending", n ? c(n.verdict) : ""),
        decide: h("decide", !!n?.decision, n?.decision === "approved" ? l.t("已通过") : l.t("已驳回")),
        notice: h("notice", !!n?.decision && !!n.notice)
      };
    }), g = e.computed(() => v.find((n) => $.value[n.key].state !== "done")?.key || "notice");
    function c(n) {
      return { pass: l.t("合规"), reject: l.t("建议驳回"), review: l.t("待人工判断"), pending: l.t("未预审") }[n];
    }
    function T(n) {
      return n.decision ? n.decision === "approved" ? l.t("已通过") : l.t("已驳回") : c(n.verdict);
    }
    function I(n) {
      return n.decision ? n.decision === "approved" ? "ok" : "bad" : n.verdict === "pass" ? "ok" : n.verdict === "reject" ? "bad" : n.verdict === "review" ? "warn" : "";
    }
    function W(n) {
      return te.value?.data.docs.find((h) => h.id === n)?.fileName || n;
    }
    function P(n) {
      const h = /* @__PURE__ */ new Set([...te.value?.categories || [], ...(te.value?.settings.expense.rules || []).map((u) => u.category)]);
      return n && h.add(n), [...h];
    }
    async function F(n, h) {
      d.value = n, S.value = { ...S.value, [n]: "" }, r.scrollToStep(n);
      try {
        return await h(), await Z(), !0;
      } catch (u) {
        return S.value = { ...S.value, [n]: r.errorMessage(u) }, !1;
      } finally {
        d.value = "";
      }
    }
    async function O() {
      d.value = "create";
      try {
        const n = await K("claim.create", { ...z });
        await Z(), C.value = n.id, Object.assign(z, { employee: "", dept: "", level: "", reason: "" });
      } catch (n) {
        x.error(r.errorMessage(n));
      } finally {
        d.value = "";
      }
    }
    async function L(n) {
      if (window.confirm(l.t("删除 {p0} 的这张报销单及其票据？", { p0: n.employee })))
        try {
          await K("claim.remove", { id: n.id }), await Z();
        } catch (h) {
          x.error(r.errorMessage(h));
        }
    }
    async function X(n) {
      if (!s.value) return;
      const h = s.value.id;
      await F("docs", () => K("claim.addDocs", { id: h, paths: n }));
    }
    async function B() {
      if (!s.value) return;
      const n = s.value.id;
      await F("review", () => K("claim.review", { id: n }));
    }
    async function N(n, h) {
      if (!s.value) return;
      const u = s.value.id;
      await F("review", () => K("claim.setCategory", { id: u, docId: n, category: h }));
    }
    async function k(n) {
      if (!s.value) return;
      const h = s.value.id;
      await F("review", () => K("claim.removeDoc", { id: h, docId: n }));
    }
    async function U(n) {
      if (!s.value) return;
      const h = s.value;
      n === "approved" && h.verdict === "reject" && !window.confirm(l.t("预审建议驳回，确定仍然通过？")) || (await F("decide", () => K("claim.decide", { id: h.id, decision: n })), D());
    }
    async function Y() {
      if (!s.value) return;
      const n = s.value.id;
      await F("notice", () => K("claim.polishNotice", { id: n }));
    }
    async function E() {
      try {
        await navigator.clipboard.writeText(s.value?.notice || ""), x.success(l.t("已复制"));
      } catch (n) {
        x.error(r.errorMessage(n));
      }
    }
    async function D() {
      try {
        p.value = await K("claim.summary");
      } catch (n) {
        x.error(r.errorMessage(n));
      }
    }
    async function i() {
      d.value = "export";
      try {
        w.value = (await K("claim.export")).path;
      } catch (n) {
        x.error(r.errorMessage(n));
      } finally {
        d.value = "";
      }
    }
    function A(n) {
      const h = te.value?.data.docs.find((u) => u.id === n);
      h && b(h.path);
    }
    function b(n) {
      ie(n).catch((h) => x.error(r.errorMessage(h)));
    }
    function f(n) {
      r.scrollToStep(n);
    }
    return e.onMounted(() => {
      D();
    }), (n, h) => (e.openBlock(), e.createElementBlock("div", Zr, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createElementVNode("p", ed, [
        h[8] || (h[8] = e.createElementVNode(
          "i",
          { class: "ri-information-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(n.$t("报销标准、单张上限、月度额度、票据有效期在「设置」里改；预审结论只是意见，通过或驳回由财务点。")) + " ",
          1
          /* TEXT */
        ),
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: "ss-link",
            onClick: h[0] || (h[0] = (u) => n.$emit("goto", "settings"))
          },
          e.toDisplayString(n.$t("去设置")),
          1
          /* TEXT */
        )
      ]),
      e.createElementVNode("div", td, [
        e.createElementVNode("aside", ld, [
          e.createElementVNode(
            "div",
            nd,
            e.toDisplayString(n.$t("新建报销单")),
            1
            /* TEXT */
          ),
          e.createElementVNode("div", od, [
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": h[1] || (h[1] = (u) => z.employee = u),
              type: "text",
              placeholder: n.$t("报销人")
            }, null, 8, ad), [
              [
                e.vModelText,
                z.employee,
                void 0,
                { trim: !0 }
              ]
            ]),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": h[2] || (h[2] = (u) => z.dept = u),
              type: "text",
              placeholder: n.$t("部门")
            }, null, 8, sd), [
              [
                e.vModelText,
                z.dept,
                void 0,
                { trim: !0 }
              ]
            ]),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": h[3] || (h[3] = (u) => z.level = u),
              type: "text",
              placeholder: n.$t("职级（可空）")
            }, null, 8, id), [
              [
                e.vModelText,
                z.level,
                void 0,
                { trim: !0 }
              ]
            ]),
            e.withDirectives(e.createElementVNode("input", {
              "onUpdate:modelValue": h[4] || (h[4] = (u) => z.reason = u),
              type: "text",
              placeholder: n.$t("事由")
            }, null, 8, rd), [
              [
                e.vModelText,
                z.reason,
                void 0,
                { trim: !0 }
              ]
            ]),
            e.createElementVNode("button", {
              type: "button",
              class: "ss-btn primary sm",
              disabled: !z.employee || !!d.value,
              onClick: O
            }, [
              h[9] || (h[9] = e.createElementVNode(
                "i",
                { class: "ri-add-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(n.$t("新建")),
                1
                /* TEXT */
              )
            ], 8, dd)
          ]),
          e.createElementVNode(
            "div",
            cd,
            e.toDisplayString(n.$t("报销单")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(j.value, (u) => (e.openBlock(), e.createElementBlock("li", {
                key: u.id,
                class: e.normalizeClass({ active: u.id === C.value }),
                onClick: (Q) => C.value = u.id
              }, [
                e.createElementVNode("div", md, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(u.employee),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", I(u)])
                    },
                    e.toDisplayString(T(u)),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("div", pd, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(u.dept || "—"),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(r.fmtMoney)(u.total)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(r.fmtDate)(u.createdAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: e.withModifiers((Q) => L(u), ["stop"])
                  }, e.toDisplayString(n.$t("删除")), 9, vd)
                ])
              ], 10, ud))),
              128
              /* KEYED_FRAGMENT */
            )),
            j.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              yd,
              e.toDisplayString(n.$t("还没有报销单")),
              1
              /* TEXT */
            ))
          ])
        ]),
        e.createElementVNode("section", Vd, [
          s.value ? (e.openBlock(), e.createElementBlock(
            e.Fragment,
            { key: 0 },
            [
              e.createVNode(re, {
                title: n.$t("报销预审：{p0}", { p0: s.value.employee }),
                metas: v,
                runtime: $.value,
                "current-key": g.value,
                onJump: f
              }, null, 8, ["title", "runtime", "current-key"]),
              d.value && e.unref(ue).expense ? (e.openBlock(), e.createElementBlock("p", Nd, [
                h[10] || (h[10] = e.createElementVNode(
                  "i",
                  { class: "ri-loader-4-line spin" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(e.unref(ue).expense),
                  1
                  /* TEXT */
                )
              ])) : e.createCommentVNode("v-if", !0),
              e.createElementVNode("div", gd, [
                e.createVNode(G, {
                  "step-key": "docs",
                  index: 0,
                  title: v[0].title,
                  hint: v[0].hint,
                  runtime: $.value.docs
                }, {
                  default: e.withCtx(() => [
                    e.createVNode(se, {
                      kind: "invoice",
                      label: n.$t("上传报销票据"),
                      disabled: !!d.value || !!s.value.decision,
                      onPicked: X
                    }, null, 8, ["label", "disabled"]),
                    e.createElementVNode(
                      "p",
                      hd,
                      e.toDisplayString(n.$t("报销人：{a}　部门：{b}　职级：{c}　事由：{d}", { a: s.value.employee, b: s.value.dept || "—", c: s.value.level || "—", d: s.value.reason || "—" })),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["title", "hint", "runtime"]),
                e.createVNode(G, {
                  "step-key": "review",
                  index: 1,
                  title: v[1].title,
                  hint: v[1].hint,
                  runtime: $.value.review
                }, {
                  default: e.withCtx(() => [
                    s.value.items.length ? (e.openBlock(), e.createElementBlock("div", Ed, [
                      e.createElementVNode("table", kd, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(n.$t("票据")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(n.$t("日期")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(n.$t("类别")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              fd,
                              e.toDisplayString(n.$t("金额")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(n.$t("校验")),
                              1
                              /* TEXT */
                            ),
                            h[11] || (h[11] = e.createElementVNode(
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
                            e.renderList(s.value.items, (u) => (e.openBlock(), e.createElementBlock(
                              "tr",
                              {
                                key: u.docId,
                                class: e.normalizeClass({ bad: u.checks.some((Q) => Q.level === "error") })
                              },
                              [
                                e.createElementVNode("td", $d, [
                                  e.createElementVNode("button", {
                                    type: "button",
                                    class: "ss-link",
                                    onClick: (Q) => A(u.docId)
                                  }, e.toDisplayString(W(u.docId)), 9, bd)
                                ]),
                                e.createElementVNode(
                                  "td",
                                  null,
                                  e.toDisplayString(u.date || "—"),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode("td", null, [
                                  e.createElementVNode("select", {
                                    value: u.category,
                                    disabled: !!d.value || !!s.value.decision,
                                    onChange: (Q) => N(u.docId, Q.target.value)
                                  }, [
                                    (e.openBlock(!0), e.createElementBlock(
                                      e.Fragment,
                                      null,
                                      e.renderList(P(u.category), (Q) => (e.openBlock(), e.createElementBlock("option", {
                                        key: Q,
                                        value: Q
                                      }, e.toDisplayString(Q), 9, Sd))),
                                      128
                                      /* KEYED_FRAGMENT */
                                    ))
                                  ], 40, Dd)
                                ]),
                                e.createElementVNode(
                                  "td",
                                  _d,
                                  e.toDisplayString(e.unref(r.fmtMoney)(u.amount)),
                                  1
                                  /* TEXT */
                                ),
                                e.createElementVNode("td", Bd, [
                                  (e.openBlock(!0), e.createElementBlock(
                                    e.Fragment,
                                    null,
                                    e.renderList(u.checks, (Q, J) => (e.openBlock(), e.createElementBlock("div", {
                                      key: J,
                                      class: "fa-check"
                                    }, [
                                      e.createElementVNode(
                                        "span",
                                        {
                                          class: e.normalizeClass(["ss-chip", e.unref(ve)(Q.level)])
                                        },
                                        e.toDisplayString(e.unref(pe)(Q.level)),
                                        3
                                        /* TEXT, CLASS */
                                      ),
                                      e.createTextVNode(
                                        e.toDisplayString(Q.message),
                                        1
                                        /* TEXT */
                                      )
                                    ]))),
                                    128
                                    /* KEYED_FRAGMENT */
                                  ))
                                ]),
                                e.createElementVNode("td", null, [
                                  s.value.decision ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("button", {
                                    key: 0,
                                    type: "button",
                                    class: "ss-link",
                                    onClick: (Q) => k(u.docId)
                                  }, e.toDisplayString(n.$t("移除")), 9, wd))
                                ])
                              ],
                              2
                              /* CLASS */
                            ))),
                            128
                            /* KEYED_FRAGMENT */
                          )),
                          e.createElementVNode("tr", Cd, [
                            e.createElementVNode(
                              "td",
                              Td,
                              e.toDisplayString(n.$t("合计")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "td",
                              Md,
                              e.toDisplayString(e.unref(r.fmtMoney)(s.value.total)),
                              1
                              /* TEXT */
                            ),
                            h[12] || (h[12] = e.createElementVNode(
                              "td",
                              { colspan: "2" },
                              null,
                              -1
                              /* CACHED */
                            ))
                          ])
                        ])
                      ])
                    ])) : e.createCommentVNode("v-if", !0),
                    e.createElementVNode("div", Ld, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", I(s.value)])
                        },
                        e.toDisplayString(n.$t("预审结论：{p0}", { p0: c(s.value.verdict) })),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn ghost sm",
                        disabled: !!d.value || !s.value.items.length,
                        onClick: B
                      }, [
                        h[13] || (h[13] = e.createElementVNode(
                          "i",
                          { class: "ri-refresh-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(n.$t("重新预审")),
                          1
                          /* TEXT */
                        )
                      ], 8, Ud)
                    ]),
                    s.value.rejectReasons.length ? (e.openBlock(), e.createElementBlock("ul", Pd, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(s.value.rejectReasons, (u, Q) => (e.openBlock(), e.createElementBlock("li", { key: Q }, [
                          h[14] || (h[14] = e.createElementVNode(
                            "i",
                            { class: "ri-close-circle-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(u),
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
                e.createVNode(G, {
                  "step-key": "decide",
                  index: 2,
                  title: v[2].title,
                  hint: v[2].hint,
                  runtime: $.value.decide
                }, {
                  default: e.withCtx(() => [
                    e.createElementVNode("div", Fd, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn primary",
                        disabled: !!d.value || !s.value.items.length,
                        onClick: h[5] || (h[5] = (u) => U("approved"))
                      }, [
                        h[15] || (h[15] = e.createElementVNode(
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
                      ], 8, zd),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn danger",
                        disabled: !!d.value || !s.value.items.length,
                        onClick: h[6] || (h[6] = (u) => U("rejected"))
                      }, [
                        h[16] || (h[16] = e.createElementVNode(
                          "i",
                          { class: "ri-close-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(n.$t("驳回")),
                          1
                          /* TEXT */
                        )
                      ], 8, Ad),
                      s.value.decision ? (e.openBlock(), e.createElementBlock(
                        "span",
                        xd,
                        e.toDisplayString(n.$t("{p0}（{p1}）", { p0: s.value.decision === "approved" ? n.$t("已通过") : n.$t("已驳回"), p1: e.unref(r.fmtDateTime)(s.value.decidedAt) })),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["title", "hint", "runtime"]),
                e.createVNode(G, {
                  "step-key": "notice",
                  index: 3,
                  title: v[3].title,
                  hint: v[3].hint,
                  runtime: $.value.notice
                }, {
                  default: e.withCtx(() => [
                    e.createElementVNode("textarea", {
                      class: "fa-notice",
                      value: s.value.notice || "",
                      rows: "7",
                      readonly: ""
                    }, null, 8, Rd),
                    e.createElementVNode("div", Id, [
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn ghost sm",
                        disabled: !s.value.notice,
                        onClick: E
                      }, [
                        h[17] || (h[17] = e.createElementVNode(
                          "i",
                          { class: "ri-file-copy-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(n.$t("复制")),
                          1
                          /* TEXT */
                        )
                      ], 8, Od),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn ghost sm",
                        disabled: !!d.value || !s.value.notice,
                        onClick: Y
                      }, [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(d.value === "notice" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createTextVNode(
                          e.toDisplayString(n.$t("润色措辞")),
                          1
                          /* TEXT */
                        )
                      ], 8, Kd),
                      e.createElementVNode(
                        "span",
                        qd,
                        e.toDisplayString(n.$t("通知只生成文字，由财务自己发给员工；润色不会改动原因条目和金额。")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["title", "hint", "runtime"])
              ])
            ],
            64
            /* STABLE_FRAGMENT */
          )) : (e.openBlock(), e.createElementBlock(
            "p",
            jd,
            e.toDisplayString(n.$t("先在左边新建一张报销单。")),
            1
            /* TEXT */
          ))
        ])
      ]),
      e.createElementVNode("section", Wd, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            h[18] || (h[18] = e.createElementVNode(
              "i",
              { class: "ri-building-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(n.$t("费用按部门归集（已通过的报销）")),
              1
              /* TEXT */
            )
          ]),
          h[21] || (h[21] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn ghost sm",
            onClick: D
          }, [
            h[19] || (h[19] = e.createElementVNode(
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
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary sm",
            disabled: !!d.value || !j.value.length,
            onClick: i
          }, [
            h[20] || (h[20] = e.createElementVNode(
              "i",
              { class: "ri-file-excel-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(n.$t("导出报销预审")),
              1
              /* TEXT */
            )
          ], 8, Jd)
        ]),
        p.value.length ? (e.openBlock(), e.createElementBlock("div", Yd, [
          e.createElementVNode("table", Hd, [
            e.createElementVNode("thead", null, [
              e.createElementVNode("tr", null, [
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("部门")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  null,
                  e.toDisplayString(n.$t("类别")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Qd,
                  e.toDisplayString(n.$t("张数")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "th",
                  Gd,
                  e.toDisplayString(n.$t("金额")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            e.createElementVNode("tbody", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(p.value, (u, Q) => (e.openBlock(), e.createElementBlock("tr", { key: Q }, [
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(u.dept),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    null,
                    e.toDisplayString(u.category),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    Xd,
                    e.toDisplayString(u.count),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "td",
                    Zd,
                    e.toDisplayString(e.unref(r.fmtMoney)(u.amount)),
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
          ec,
          e.toDisplayString(n.$t("还没有已通过的报销。")),
          1
          /* TEXT */
        )),
        w.value ? (e.openBlock(), e.createElementBlock("div", tc, [
          e.createElementVNode(
            "code",
            lc,
            e.toDisplayString(w.value),
            1
            /* TEXT */
          ),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn ghost sm",
            onClick: h[7] || (h[7] = (u) => b(w.value))
          }, [
            h[22] || (h[22] = e.createElementVNode(
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
          ])
        ])) : e.createCommentVNode("v-if", !0)
      ])
    ]));
  }
}), oc = /* @__PURE__ */ oe(nc, [["__scopeId", "data-v-95564c0d"]]), ac = { class: "ss-module" }, sc = { class: "fa-sub" }, ic = { class: "fa-split" }, rc = { class: "fa-list" }, dc = { class: "ss-subhead" }, cc = ["onClick"], uc = { class: "fa-list__top" }, mc = { class: "fa-list__meta" }, pc = ["onClick"], vc = {
  key: 0,
  class: "ss-empty"
}, yc = { class: "fa-detail" }, Vc = { class: "ss-steps" }, Nc = { class: "ss-grid" }, gc = { class: "ss-field" }, hc = { value: "ar" }, Ec = { value: "ap" }, kc = { class: "ss-field" }, fc = { class: "ss-field" }, $c = { class: "fa-two" }, bc = { class: "fa-filebox" }, Dc = {
  key: 0,
  class: "ss-muted fa-path"
}, Sc = { class: "fa-filebox" }, _c = {
  key: 0,
  class: "ss-muted fa-path"
}, Bc = { class: "ss-actions" }, wc = ["disabled"], Cc = { class: "ss-muted" }, Tc = { class: "ss-kpis" }, Mc = { class: "ss-kpi" }, Lc = { class: "ss-kpi" }, Uc = { class: "ss-kpi accent" }, Pc = { class: "ss-kpi" }, Fc = { class: "ss-field ss-check fa-inline" }, zc = { class: "ss-table-wrap" }, Ac = { class: "ss-table" }, xc = { class: "num" }, Rc = { class: "num" }, Ic = { class: "num" }, Oc = { class: "num" }, Kc = { class: "num" }, qc = { class: "num" }, jc = { key: 0 }, Wc = {
  colspan: "9",
  class: "ss-empty"
}, Jc = {
  key: 1,
  class: "ss-muted"
}, Yc = { class: "fa-letter" }, Hc = { class: "ss-actions" }, Qc = ["disabled"], Gc = { class: "fa-out" }, Xc = { class: "ss-muted" }, Zc = {
  key: 1,
  class: "ss-muted"
}, eu = { class: "fa-split" }, tu = { class: "fa-list" }, lu = { class: "ss-subhead" }, nu = ["onClick"], ou = { class: "fa-list__top" }, au = { class: "fa-list__meta" }, su = { class: "fa-ellipsis" }, iu = ["onClick"], ru = {
  key: 0,
  class: "ss-empty"
}, du = { class: "fa-detail" }, cu = { class: "ss-steps" }, uu = { class: "ss-grid" }, mu = { class: "ss-field" }, pu = { value: "ar" }, vu = { value: "ap" }, yu = { class: "ss-field" }, Vu = { class: "ss-field" }, Nu = { class: "ss-kpis" }, gu = { class: "ss-table-wrap" }, hu = { class: "ss-table" }, Eu = { class: "num" }, ku = { class: "num" }, fu = { class: "num" }, $u = { class: "num" }, bu = { class: "num" }, Du = { class: "num" }, Su = {
  key: 1,
  class: "ss-muted"
}, _u = {
  key: 0,
  class: "fa-findings"
}, Bu = { class: "fa-pre" }, wu = { class: "ss-muted" }, Cu = {
  key: 1,
  class: "ss-note ok"
}, Tu = { class: "ss-actions" }, Mu = { value: "" }, Lu = ["value"], Uu = ["disabled"], Pu = ["disabled"], Fu = { class: "fa-out" }, zu = { class: "fa-letter" }, Au = { class: "ss-muted" }, xu = /* @__PURE__ */ e.defineComponent({
  __name: "ReconcileTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), C = e.ref("rec"), d = e.ref(""), S = e.ref({}), p = e.computed(() => te.value?.data.reconciles || []), w = e.computed(() => te.value?.data.agings || []), j = e.ref(""), s = e.ref(""), v = e.computed(() => p.value.find((t) => t.id === j.value) || null), $ = e.computed(() => w.value.find((t) => t.id === s.value) || null);
    e.watch(p, (t) => {
      !j.value && t.length && (j.value = t[0].id);
    }, { immediate: !0 }), e.watch(w, (t) => {
      !s.value && t.length && (s.value = t[0].id);
    }, { immediate: !0 });
    const g = e.reactive({ side: "ar", counterparty: "", asOf: z(), oursPath: "", theirsPath: "" }), c = e.reactive({ side: "ar", asOf: z(), termsDays: 30 }), T = e.ref(!0), I = e.ref(""), W = e.ref(""), P = e.ref("");
    e.watch(s, () => {
      I.value = "", W.value = "", P.value = "";
    });
    const F = [
      { key: "rec-setup", title: l.t("对账设置"), hint: l.t("方向、对方单位、截止日") },
      { key: "rec-files", title: l.t("上传台账与对账单"), hint: l.t("我方往来明细 + 对方发来的对账单") },
      { key: "rec-result", title: l.t("差异结果"), hint: l.t("逐笔比对，自动标记差额") },
      { key: "rec-letter", title: l.t("对账函"), hint: l.t("按差异生成对账函，导出比对表") }
    ], O = [
      { key: "age-run", title: l.t("上传台账"), hint: l.t("应收 / 应付未结明细") },
      { key: "age-buckets", title: l.t("账龄汇总"), hint: l.t("按账龄段和往来单位汇总") },
      { key: "age-warn", title: l.t("逾期预警"), hint: l.t("逾期与长期挂账") },
      { key: "age-dunning", title: l.t("催款函与导出"), hint: l.t("选逾期单位生成催款函") }
    ];
    function L(t, m, a) {
      return d.value === t ? { state: "running" } : S.value[t] ? { state: "failed", error: S.value[t] } : m ? { state: "done", summary: a } : { state: "todo" };
    }
    const X = e.computed(() => ({
      "rec-setup": L("rec-setup", !!v.value || !!g.asOf, g.side === "ar" ? l.t("应收") : l.t("应付")),
      "rec-files": L("rec-files", !!v.value, v.value ? `${v.value.oursFile || ""} / ${v.value.theirsFile || ""}` : ""),
      "rec-result": L("rec-result", !!v.value, v.value ? l.t("{n} 处差异", { n: E(v.value) }) : ""),
      "rec-letter": L("rec-letter", !!v.value?.exportPath)
    })), B = e.computed(() => F.find((t) => X.value[t.key].state !== "done")?.key || "rec-letter"), N = e.computed(() => ({
      "age-run": L("age-run", !!$.value, $.value?.fileName),
      "age-buckets": L("age-buckets", !!$.value, $.value ? l.t("{n} 家往来单位", { n: $.value.byCounterparty.length }) : ""),
      "age-warn": L("age-warn", !!$.value, $.value ? l.t("{n} 条预警", { n: $.value.warnings.length }) : ""),
      "age-dunning": L("age-dunning", !!W.value || !!P.value)
    })), k = e.computed(() => O.find((t) => N.value[t.key].state !== "done")?.key || "age-dunning"), U = e.computed(() => (v.value?.matches || []).filter((t) => !T.value || t.status !== "matched")), Y = e.computed(() => ($.value?.byCounterparty || []).filter((t) => t.overdue > 0).map((t) => t.counterparty));
    function E(t) {
      return t.matches.filter((m) => m.status !== "matched").length;
    }
    function D(t) {
      return { matched: l.t("一致"), amount_diff: l.t("金额不符"), only_ours: l.t("我方有对方无"), only_theirs: l.t("对方有我方无") }[t];
    }
    function i(t) {
      return t === "matched" ? "ok" : t === "amount_diff" ? "bad" : "warn";
    }
    function A(t) {
      return t.split(/[\\/]/).pop() || t;
    }
    async function b(t, m) {
      d.value = t, S.value = { ...S.value, [t]: "" }, r.scrollToStep(t);
      try {
        return await m(), await Z(), !0;
      } catch (a) {
        return S.value = { ...S.value, [t]: r.errorMessage(a) }, !1;
      } finally {
        d.value = "";
      }
    }
    async function f() {
      await b("rec-files", async () => {
        const t = await K("rec.run", { side: g.side, oursPath: g.oursPath, theirsPath: g.theirsPath, asOf: g.asOf, counterparty: g.counterparty || void 0 });
        j.value = t.id;
      }), v.value && r.scrollToStep("rec-result");
    }
    async function n() {
      v.value && await b("rec-letter", () => K("rec.export", { id: v.value.id }));
    }
    async function h(t) {
      if (window.confirm(l.t("删除这条对账记录？")))
        try {
          await K("rec.remove", { id: t }), j.value === t && (j.value = ""), await Z();
        } catch (m) {
          x.error(r.errorMessage(m));
        }
    }
    async function u(t) {
      await b("age-run", async () => {
        const m = await K("aging.run", { side: c.side, path: t, asOf: c.asOf, termsDays: c.termsDays });
        s.value = m.id;
      });
    }
    async function Q() {
      if (!(!$.value || !I.value)) {
        d.value = "age-dunning", S.value = { ...S.value, "age-dunning": "" };
        try {
          W.value = await K("aging.dunning", { id: $.value.id, counterparty: I.value });
        } catch (t) {
          S.value = { ...S.value, "age-dunning": r.errorMessage(t) };
        } finally {
          d.value = "";
        }
      }
    }
    async function J() {
      if ($.value) {
        d.value = "age-dunning", S.value = { ...S.value, "age-dunning": "" };
        try {
          P.value = (await K("aging.export", { id: $.value.id })).path;
        } catch (t) {
          S.value = { ...S.value, "age-dunning": r.errorMessage(t) };
        } finally {
          d.value = "";
        }
      }
    }
    async function ae(t) {
      if (window.confirm(l.t("删除这条账龄分析？")))
        try {
          await K("aging.remove", { id: t }), s.value === t && (s.value = ""), await Z();
        } catch (m) {
          x.error(r.errorMessage(m));
        }
    }
    async function y(t) {
      try {
        await navigator.clipboard.writeText(t), x.success(l.t("已复制"));
      } catch (m) {
        x.error(r.errorMessage(m));
      }
    }
    function R(t, m = !1) {
      ie(t, m).catch((a) => x.error(r.errorMessage(a)));
    }
    function M(t) {
      r.scrollToStep(t);
    }
    return (t, m) => (e.openBlock(), e.createElementBlock("div", ac, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createElementVNode("nav", sc, [
        e.createElementVNode(
          "button",
          {
            type: "button",
            class: e.normalizeClass(["fa-sub__btn", { active: C.value === "rec" }]),
            onClick: m[0] || (m[0] = (a) => C.value = "rec")
          },
          [
            m[18] || (m[18] = e.createElementVNode(
              "i",
              { class: "ri-scales-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("往来对账")),
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
            class: e.normalizeClass(["fa-sub__btn", { active: C.value === "aging" }]),
            onClick: m[1] || (m[1] = (a) => C.value = "aging")
          },
          [
            m[19] || (m[19] = e.createElementVNode(
              "i",
              { class: "ri-time-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(t.$t("账龄分析")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ]),
      e.createCommentVNode(" 往来对账 "),
      e.withDirectives(e.createElementVNode(
        "div",
        ic,
        [
          e.createElementVNode("aside", rc, [
            e.createElementVNode(
              "div",
              dc,
              e.toDisplayString(t.$t("对账记录")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(p.value, (a) => (e.openBlock(), e.createElementBlock("li", {
                  key: a.id,
                  class: e.normalizeClass({ active: a.id === j.value }),
                  onClick: (ee) => j.value = a.id
                }, [
                  e.createElementVNode("div", uc, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(a.counterparty || t.$t("未识别单位")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", E(a) ? "warn" : "ok"])
                      },
                      e.toDisplayString(E(a) ? t.$t("{n} 处差异", { n: E(a) }) : t.$t("一致")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", mc, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(a.side === "ar" ? t.$t("应收") : t.$t("应付")) + " · " + e.toDisplayString(a.asOf),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: e.withModifiers((ee) => h(a.id), ["stop"])
                    }, e.toDisplayString(t.$t("删除")), 9, pc)
                  ])
                ], 10, cc))),
                128
                /* KEYED_FRAGMENT */
              )),
              p.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "li",
                vc,
                e.toDisplayString(t.$t("还没有对账记录")),
                1
                /* TEXT */
              ))
            ])
          ]),
          e.createElementVNode("section", yc, [
            e.createVNode(re, {
              title: t.$t("往来对账"),
              metas: F,
              runtime: X.value,
              "current-key": B.value,
              onJump: M
            }, null, 8, ["title", "runtime", "current-key"]),
            e.createElementVNode("div", Vc, [
              e.createVNode(G, {
                "step-key": "rec-setup",
                index: 0,
                title: F[0].title,
                hint: F[0].hint,
                runtime: X.value["rec-setup"]
              }, {
                default: e.withCtx(() => [
                  e.createElementVNode("div", Nc, [
                    e.createElementVNode("label", gc, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("对账方向")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "select",
                        {
                          "onUpdate:modelValue": m[2] || (m[2] = (a) => g.side = a)
                        },
                        [
                          e.createElementVNode(
                            "option",
                            hc,
                            e.toDisplayString(t.$t("应收（客户欠我们）")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            Ec,
                            e.toDisplayString(t.$t("应付（我们欠供应商）")),
                            1
                            /* TEXT */
                          )
                        ],
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelSelect, g.side]
                      ])
                    ]),
                    e.createElementVNode("label", kc, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("对方单位（可空，自动识别）")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": m[3] || (m[3] = (a) => g.counterparty = a),
                          type: "text"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [
                          e.vModelText,
                          g.counterparty,
                          void 0,
                          { trim: !0 }
                        ]
                      ])
                    ]),
                    e.createElementVNode("label", fc, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("截止日")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": m[4] || (m[4] = (a) => g.asOf = a),
                          type: "date"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, g.asOf]
                      ])
                    ])
                  ])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime"]),
              e.createVNode(G, {
                "step-key": "rec-files",
                index: 1,
                title: F[1].title,
                hint: F[1].hint,
                runtime: X.value["rec-files"]
              }, {
                default: e.withCtx(() => [
                  e.createElementVNode("div", $c, [
                    e.createElementVNode("div", bc, [
                      e.createVNode(se, {
                        kind: "excel",
                        multi: !1,
                        label: t.$t("我方台账（往来明细）"),
                        hint: t.$t("需要：日期、金额（或借方 / 贷方）；可选：单号、摘要"),
                        disabled: !!d.value,
                        onPicked: m[5] || (m[5] = (a) => g.oursPath = a[0])
                      }, null, 8, ["label", "hint", "disabled"]),
                      g.oursPath ? (e.openBlock(), e.createElementBlock("p", Dc, [
                        m[20] || (m[20] = e.createElementVNode(
                          "i",
                          { class: "ri-file-excel-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(A(g.oursPath)),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0)
                    ]),
                    e.createElementVNode("div", Sc, [
                      e.createVNode(se, {
                        kind: "excel",
                        multi: !1,
                        label: t.$t("对方对账单"),
                        hint: t.$t("客户 / 供应商发来的对账单 Excel"),
                        disabled: !!d.value,
                        onPicked: m[6] || (m[6] = (a) => g.theirsPath = a[0])
                      }, null, 8, ["label", "hint", "disabled"]),
                      g.theirsPath ? (e.openBlock(), e.createElementBlock("p", _c, [
                        m[21] || (m[21] = e.createElementVNode(
                          "i",
                          { class: "ri-file-excel-2-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(A(g.theirsPath)),
                          1
                          /* TEXT */
                        )
                      ])) : e.createCommentVNode("v-if", !0)
                    ])
                  ]),
                  e.createElementVNode("div", Bc, [
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-btn primary",
                      disabled: !!d.value || !g.oursPath || !g.theirsPath,
                      onClick: f
                    }, [
                      e.createElementVNode(
                        "i",
                        {
                          class: e.normalizeClass(d.value === "rec-files" ? "ri-loader-4-line spin" : "ri-git-compare-line")
                        },
                        null,
                        2
                        /* CLASS */
                      ),
                      e.createTextVNode(
                        e.toDisplayString(t.$t("逐笔比对")),
                        1
                        /* TEXT */
                      )
                    ], 8, wc),
                    e.createElementVNode(
                      "span",
                      Cc,
                      e.toDisplayString(t.$t("先按单号匹配，再按金额相同、日期相差 7 天内匹配")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime"]),
              e.createVNode(G, {
                "step-key": "rec-result",
                index: 2,
                title: F[2].title,
                hint: F[2].hint,
                runtime: X.value["rec-result"]
              }, {
                default: e.withCtx(() => [
                  v.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("div", Tc, [
                        e.createElementVNode("div", Mc, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(t.$t("我方余额")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(e.unref(r.fmtMoney)(v.value.balanceOurs)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", Lc, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(t.$t("对方余额")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(e.unref(r.fmtMoney)(v.value.balanceTheirs)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", Uc, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(t.$t("差额")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(e.unref(r.fmtMoney)(v.value.balanceOurs - v.value.balanceTheirs)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("div", Pc, [
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(t.$t("差异笔数")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(E(v.value)),
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      e.createElementVNode("label", Fc, [
                        e.withDirectives(e.createElementVNode(
                          "input",
                          {
                            "onUpdate:modelValue": m[7] || (m[7] = (a) => T.value = a),
                            type: "checkbox"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelCheckbox, T.value]
                        ]),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(t.$t("只看差异")),
                          1
                          /* TEXT */
                        )
                      ]),
                      e.createElementVNode("div", zc, [
                        e.createElementVNode("table", Ac, [
                          e.createElementVNode("thead", null, [
                            e.createElementVNode("tr", null, [
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("状态")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("我方日期")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("我方单号")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                xc,
                                e.toDisplayString(t.$t("我方金额")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("对方日期")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("对方单号")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                Rc,
                                e.toDisplayString(t.$t("对方金额")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                Ic,
                                e.toDisplayString(t.$t("差额")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("说明")),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          e.createElementVNode("tbody", null, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(U.value, (a, ee) => (e.openBlock(), e.createElementBlock(
                                "tr",
                                {
                                  key: ee,
                                  class: e.normalizeClass({ bad: a.status !== "matched" })
                                },
                                [
                                  e.createElementVNode("td", null, [
                                    e.createElementVNode(
                                      "span",
                                      {
                                        class: e.normalizeClass(["ss-chip", i(a.status)])
                                      },
                                      e.toDisplayString(D(a.status)),
                                      3
                                      /* TEXT, CLASS */
                                    )
                                  ]),
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(a.ours?.date || ""),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(a.ours?.ref || ""),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    Oc,
                                    e.toDisplayString(a.ours ? e.unref(r.fmtMoney)(a.ours.amount) : ""),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(a.theirs?.date || ""),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(a.theirs?.ref || ""),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    Kc,
                                    e.toDisplayString(a.theirs ? e.unref(r.fmtMoney)(a.theirs.amount) : ""),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    qc,
                                    e.toDisplayString(a.status === "matched" ? "" : e.unref(r.fmtMoney)(a.diff)),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(a.note || ""),
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
                            U.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", jc, [
                              e.createElementVNode(
                                "td",
                                Wc,
                                e.toDisplayString(t.$t("没有差异")),
                                1
                                /* TEXT */
                              )
                            ]))
                          ])
                        ])
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Jc,
                    e.toDisplayString(t.$t("比对后在这里看差异")),
                    1
                    /* TEXT */
                  ))
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime"]),
              e.createVNode(G, {
                "step-key": "rec-letter",
                index: 3,
                title: F[3].title,
                hint: F[3].hint,
                runtime: X.value["rec-letter"]
              }, {
                default: e.withCtx(() => [
                  v.value?.letter ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode(
                        "pre",
                        Yc,
                        e.toDisplayString(v.value.letter),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("div", Hc, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm ghost",
                          onClick: m[8] || (m[8] = (a) => y(v.value.letter))
                        }, [
                          m[22] || (m[22] = e.createElementVNode(
                            "i",
                            { class: "ri-file-copy-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(t.$t("复制对账函")),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm primary",
                          disabled: !!d.value,
                          onClick: n
                        }, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(d.value === "rec-letter" ? "ri-loader-4-line spin" : "ri-download-2-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createTextVNode(
                            e.toDisplayString(t.$t("导出比对表和对账函")),
                            1
                            /* TEXT */
                          )
                        ], 8, Qc),
                        v.value.exportPath ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createElementVNode(
                              "code",
                              Gc,
                              e.toDisplayString(v.value.exportPath),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "button",
                              {
                                type: "button",
                                class: "ss-link",
                                onClick: m[9] || (m[9] = (a) => R(v.value.exportPath))
                              },
                              e.toDisplayString(t.$t("打开")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "button",
                              {
                                type: "button",
                                class: "ss-link",
                                onClick: m[10] || (m[10] = (a) => R(v.value.exportPath, !0))
                              },
                              e.toDisplayString(t.$t("所在文件夹")),
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
                        Xc,
                        e.toDisplayString(t.$t("对账函是草稿，经财务复核并由有权人签章后再发出，工作台不会自动发送。")),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Zc,
                    e.toDisplayString(t.$t("比对完成后生成对账函")),
                    1
                    /* TEXT */
                  ))
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime"])
            ])
          ])
        ],
        512
        /* NEED_PATCH */
      ), [
        [e.vShow, C.value === "rec"]
      ]),
      e.createCommentVNode(" 账龄分析 "),
      e.withDirectives(e.createElementVNode(
        "div",
        eu,
        [
          e.createElementVNode("aside", tu, [
            e.createElementVNode(
              "div",
              lu,
              e.toDisplayString(t.$t("账龄分析记录")),
              1
              /* TEXT */
            ),
            e.createElementVNode("ul", null, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(w.value, (a) => (e.openBlock(), e.createElementBlock("li", {
                  key: a.id,
                  class: e.normalizeClass({ active: a.id === s.value }),
                  onClick: (ee) => s.value = a.id
                }, [
                  e.createElementVNode("div", ou, [
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(a.side === "ar" ? t.$t("应收") : t.$t("应付")) + " · " + e.toDisplayString(a.asOf),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "span",
                      {
                        class: e.normalizeClass(["ss-chip", a.warnings.length ? "warn" : "ok"])
                      },
                      e.toDisplayString(t.$t("{n} 条预警", { n: a.warnings.length })),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  e.createElementVNode("div", au, [
                    e.createElementVNode(
                      "span",
                      su,
                      e.toDisplayString(a.fileName),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: e.withModifiers((ee) => ae(a.id), ["stop"])
                    }, e.toDisplayString(t.$t("删除")), 9, iu)
                  ])
                ], 10, nu))),
                128
                /* KEYED_FRAGMENT */
              )),
              w.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                "li",
                ru,
                e.toDisplayString(t.$t("还没有账龄分析")),
                1
                /* TEXT */
              ))
            ])
          ]),
          e.createElementVNode("section", du, [
            e.createVNode(re, {
              title: t.$t("账龄分析"),
              metas: O,
              runtime: N.value,
              "current-key": k.value,
              onJump: M
            }, null, 8, ["title", "runtime", "current-key"]),
            e.createElementVNode("div", cu, [
              e.createVNode(G, {
                "step-key": "age-run",
                index: 0,
                title: O[0].title,
                hint: O[0].hint,
                runtime: N.value["age-run"]
              }, {
                default: e.withCtx(() => [
                  e.createElementVNode("div", uu, [
                    e.createElementVNode("label", mu, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("方向")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "select",
                        {
                          "onUpdate:modelValue": m[11] || (m[11] = (a) => c.side = a)
                        },
                        [
                          e.createElementVNode(
                            "option",
                            pu,
                            e.toDisplayString(t.$t("应收")),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "option",
                            vu,
                            e.toDisplayString(t.$t("应付")),
                            1
                            /* TEXT */
                          )
                        ],
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelSelect, c.side]
                      ])
                    ]),
                    e.createElementVNode("label", yu, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("截止日")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": m[12] || (m[12] = (a) => c.asOf = a),
                          type: "date"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [e.vModelText, c.asOf]
                      ])
                    ]),
                    e.createElementVNode("label", Vu, [
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(t.$t("默认账期（天）")),
                        1
                        /* TEXT */
                      ),
                      e.withDirectives(e.createElementVNode(
                        "input",
                        {
                          "onUpdate:modelValue": m[13] || (m[13] = (a) => c.termsDays = a),
                          type: "number",
                          min: "0"
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [
                          e.vModelText,
                          c.termsDays,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])
                  ]),
                  e.createVNode(se, {
                    kind: "excel",
                    multi: !1,
                    label: t.$t("上传应收 / 应付台账"),
                    hint: t.$t("需要：往来单位、日期、金额（或余额）；可选：单号、到期日、账期、已收付"),
                    disabled: !!d.value,
                    onPicked: m[14] || (m[14] = (a) => u(a[0]))
                  }, null, 8, ["label", "hint", "disabled"])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime"]),
              e.createVNode(G, {
                "step-key": "age-buckets",
                index: 1,
                title: O[1].title,
                hint: O[1].hint,
                runtime: N.value["age-buckets"]
              }, {
                default: e.withCtx(() => [
                  $.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("div", Nu, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList($.value.buckets, (a) => (e.openBlock(), e.createElementBlock("div", {
                            key: a.bucket,
                            class: "ss-kpi"
                          }, [
                            e.createElementVNode(
                              "small",
                              null,
                              e.toDisplayString(t.$t("{p0}（{n} 笔）", { p0: a.bucket, n: a.count })),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "strong",
                              null,
                              e.toDisplayString(e.unref(r.fmtMoney)(a.amount)),
                              1
                              /* TEXT */
                            )
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ]),
                      e.createElementVNode("div", gu, [
                        e.createElementVNode("table", hu, [
                          e.createElementVNode("thead", null, [
                            e.createElementVNode("tr", null, [
                              e.createElementVNode(
                                "th",
                                null,
                                e.toDisplayString(t.$t("往来单位")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                Eu,
                                e.toDisplayString(t.$t("未结")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                ku,
                                e.toDisplayString(t.$t("其中逾期")),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "th",
                                fu,
                                e.toDisplayString(t.$t("最长逾期（天）")),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          e.createElementVNode("tbody", null, [
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList($.value.byCounterparty, (a) => (e.openBlock(), e.createElementBlock(
                                "tr",
                                {
                                  key: a.counterparty,
                                  class: e.normalizeClass({ bad: a.overdue > 0 })
                                },
                                [
                                  e.createElementVNode(
                                    "td",
                                    null,
                                    e.toDisplayString(a.counterparty),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    $u,
                                    e.toDisplayString(e.unref(r.fmtMoney)(a.outstanding)),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    bu,
                                    e.toDisplayString(a.overdue ? e.unref(r.fmtMoney)(a.overdue) : ""),
                                    1
                                    /* TEXT */
                                  ),
                                  e.createElementVNode(
                                    "td",
                                    Du,
                                    e.toDisplayString(a.maxOverdueDays || ""),
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
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : (e.openBlock(), e.createElementBlock(
                    "p",
                    Su,
                    e.toDisplayString(t.$t("上传台账后显示")),
                    1
                    /* TEXT */
                  ))
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime"]),
              e.createVNode(G, {
                "step-key": "age-warn",
                index: 2,
                title: O[2].title,
                hint: O[2].hint,
                runtime: N.value["age-warn"]
              }, {
                default: e.withCtx(() => [
                  $.value?.warnings.length ? (e.openBlock(), e.createElementBlock("ul", _u, [
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList($.value.warnings, (a, ee) => (e.openBlock(), e.createElementBlock("li", { key: ee }, [
                        e.createElementVNode(
                          "span",
                          {
                            class: e.normalizeClass(["ss-chip", e.unref(ve)(a.level)])
                          },
                          e.toDisplayString(e.unref(pe)(a.level)),
                          3
                          /* TEXT, CLASS */
                        ),
                        e.createElementVNode("div", null, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(a.title),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            Bu,
                            e.toDisplayString(a.detail),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "p",
                            wu,
                            e.toDisplayString(a.suggestion),
                            1
                            /* TEXT */
                          )
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : $.value ? (e.openBlock(), e.createElementBlock("p", Cu, [
                    m[23] || (m[23] = e.createElementVNode(
                      "i",
                      { class: "ri-check-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(t.$t("没有逾期款项")),
                      1
                      /* TEXT */
                    )
                  ])) : e.createCommentVNode("v-if", !0)
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "hint", "runtime"]),
              e.createVNode(G, {
                "step-key": "age-dunning",
                index: 3,
                title: O[3].title,
                hint: O[3].hint,
                runtime: N.value["age-dunning"]
              }, {
                default: e.withCtx(() => [
                  $.value ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode("div", Tu, [
                        e.withDirectives(e.createElementVNode(
                          "select",
                          {
                            "onUpdate:modelValue": m[15] || (m[15] = (a) => I.value = a),
                            class: "fa-select"
                          },
                          [
                            e.createElementVNode(
                              "option",
                              Mu,
                              e.toDisplayString(t.$t("选择逾期单位")),
                              1
                              /* TEXT */
                            ),
                            (e.openBlock(!0), e.createElementBlock(
                              e.Fragment,
                              null,
                              e.renderList(Y.value, (a) => (e.openBlock(), e.createElementBlock("option", {
                                key: a,
                                value: a
                              }, e.toDisplayString(a), 9, Lu))),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ],
                          512
                          /* NEED_PATCH */
                        ), [
                          [e.vModelSelect, I.value]
                        ]),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm primary",
                          disabled: !I.value || !!d.value,
                          onClick: Q
                        }, [
                          m[24] || (m[24] = e.createElementVNode(
                            "i",
                            { class: "ri-mail-send-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(t.$t("生成催款函")),
                            1
                            /* TEXT */
                          )
                        ], 8, Uu),
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-btn sm ghost",
                          disabled: !!d.value,
                          onClick: J
                        }, [
                          e.createElementVNode(
                            "i",
                            {
                              class: e.normalizeClass(d.value === "age-dunning" ? "ri-loader-4-line spin" : "ri-download-2-line")
                            },
                            null,
                            2
                            /* CLASS */
                          ),
                          e.createTextVNode(
                            e.toDisplayString(t.$t("导出账龄表")),
                            1
                            /* TEXT */
                          )
                        ], 8, Pu),
                        P.value ? (e.openBlock(), e.createElementBlock(
                          e.Fragment,
                          { key: 0 },
                          [
                            e.createElementVNode(
                              "code",
                              Fu,
                              e.toDisplayString(P.value),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "button",
                              {
                                type: "button",
                                class: "ss-link",
                                onClick: m[16] || (m[16] = (a) => R(P.value))
                              },
                              e.toDisplayString(t.$t("打开")),
                              1
                              /* TEXT */
                            )
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )) : e.createCommentVNode("v-if", !0)
                      ]),
                      W.value ? (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        { key: 0 },
                        [
                          e.createElementVNode(
                            "pre",
                            zu,
                            e.toDisplayString(W.value),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("button", {
                            type: "button",
                            class: "ss-btn sm ghost",
                            onClick: m[17] || (m[17] = (a) => y(W.value))
                          }, [
                            m[25] || (m[25] = e.createElementVNode(
                              "i",
                              { class: "ri-file-copy-line" },
                              null,
                              -1
                              /* CACHED */
                            )),
                            e.createTextVNode(
                              e.toDisplayString(t.$t("复制催款函")),
                              1
                              /* TEXT */
                            )
                          ]),
                          e.createElementVNode(
                            "p",
                            Au,
                            e.toDisplayString(t.$t("催款函是草稿，由财务复核后自行发出。")),
                            1
                            /* TEXT */
                          )
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
              }, 8, ["title", "hint", "runtime"])
            ])
          ])
        ],
        512
        /* NEED_PATCH */
      ), [
        [e.vShow, C.value === "aging"]
      ])
    ]));
  }
}), Ru = /* @__PURE__ */ oe(xu, [["__scopeId", "data-v-33e20129"]]), Iu = { class: "ss-module" }, Ou = { class: "fa-split" }, Ku = { class: "fa-list" }, qu = { class: "ss-subhead" }, ju = ["onClick"], Wu = { class: "fa-list__top" }, Ju = { class: "fa-list__meta" }, Yu = ["onClick"], Hu = {
  key: 0,
  class: "ss-empty"
}, Qu = { class: "fa-detail" }, Gu = { class: "ss-steps" }, Xu = { class: "ss-grid" }, Zu = { class: "ss-field" }, em = { value: "balances" }, tm = { value: "vouchers" }, lm = {
  key: 0,
  class: "ss-field"
}, nm = { value: "" }, om = ["value"], am = {
  key: 1,
  class: "ss-field"
}, sm = {
  key: 0,
  class: "ss-note warn"
}, im = { class: "ss-actions" }, rm = ["disabled"], dm = { class: "ss-muted" }, cm = { class: "fa-sub" }, um = ["onClick"], mm = { class: "ss-table-wrap" }, pm = { class: "ss-table" }, vm = { class: "num" }, ym = { class: "num" }, Vm = ["title"], Nm = { class: "num" }, gm = { class: "num" }, hm = {
  key: 1,
  class: "ss-muted"
}, Em = {
  key: 0,
  class: "fa-checks"
}, km = { class: "ss-actions" }, fm = ["disabled"], $m = {
  key: 0,
  class: "ss-muted"
}, bm = {
  key: 0,
  class: "fa-text"
}, Dm = { class: "ss-actions" }, Sm = ["disabled"], _m = { class: "fa-out" }, Bm = { class: "ss-muted" }, wm = /* @__PURE__ */ e.defineComponent({
  __name: "StatementsTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = e.computed(() => te.value?.data.statements || []), C = e.computed(() => te.value?.data.balances || []), d = e.ref(""), S = e.computed(() => z.value.find((N) => N.id === d.value) || null);
    e.watch(z, (N) => {
      !d.value && N.length && (d.value = N[0].id);
    }, { immediate: !0 });
    const p = e.reactive({ source: "balances", period: "" });
    e.watch(C, (N) => {
      !N.length && p.source === "balances" && !p.period ? (p.source = "vouchers", p.period = he()) : N.length && p.source === "balances" && !p.period && (p.period = N[0].period);
    }, { immediate: !0 }), e.watch(() => p.source, (N) => {
      p.period = N === "balances" ? C.value[0]?.period || "" : p.period || he();
    });
    const w = e.ref("balanceSheet"), j = e.computed(() => [
      { key: "balanceSheet", label: l.t("资产负债表") },
      { key: "income", label: l.t("利润表") },
      { key: "cashflow", label: l.t("现金流量表") }
    ]), s = e.computed(() => S.value ? S.value[w.value] : []), v = e.ref(""), $ = e.ref({}), g = [
      { key: "stm-source", title: l.t("数据来源"), hint: l.t("导入科目余额表，或用本工作台审核过的凭证") },
      { key: "stm-build", title: l.t("生成报表"), hint: l.t("资产负债表、利润表、现金流量表") },
      { key: "stm-view", title: l.t("查看报表"), hint: l.t("本期与期初 / 上期对比") },
      { key: "stm-check", title: l.t("勾稽校验"), hint: l.t("资产 = 负债 + 权益、试算平衡、净利润与未分配利润、现金变动") },
      { key: "stm-analyze", title: l.t("经营简要分析"), hint: l.t("营收、毛利、费用波动说明") },
      { key: "stm-export", title: l.t("导出"), hint: l.t("Excel + Markdown") }
    ];
    function c(N, k, U) {
      return v.value === N ? { state: "running" } : $.value[N] ? { state: "failed", error: $.value[N] } : k ? { state: "done", summary: U } : { state: "todo" };
    }
    const T = e.computed(() => {
      const N = S.value, k = N ? N.checks.filter((U) => U.level === "error").length : 0;
      return {
        "stm-source": c("stm-source", !!p.period, p.period),
        "stm-build": c("stm-build", !!N, N?.period),
        "stm-view": c("stm-view", !!N),
        "stm-check": N && k ? { state: "failed", error: l.t("{n} 项勾稽不通过", { n: k }) } : c("stm-check", !!N, N ? l.t("全部通过") : ""),
        "stm-analyze": c("stm-analyze", !!N?.analysis),
        "stm-export": c("stm-export", !!N?.exportPath)
      };
    }), I = e.computed(() => g.find((N) => T.value[N.key].state !== "done")?.key || "stm-export");
    async function W(N, k) {
      v.value = N, $.value = { ...$.value, [N]: "" }, r.scrollToStep(N);
      try {
        await k(), await Z();
      } catch (U) {
        $.value = { ...$.value, [N]: r.errorMessage(U) };
      } finally {
        v.value = "";
      }
    }
    async function P() {
      await W("stm-build", async () => {
        const N = await K("stmt.build", { period: p.period, source: p.source });
        d.value = N.id;
      }), S.value && r.scrollToStep("stm-view");
    }
    async function F() {
      S.value && await W("stm-analyze", () => K("stmt.analyze", { id: S.value.id }));
    }
    async function O() {
      S.value && await W("stm-export", () => K("stmt.export", { id: S.value.id }));
    }
    async function L(N) {
      if (window.confirm(l.t("删除这份报表？")))
        try {
          await K("stmt.remove", { id: N }), d.value === N && (d.value = ""), await Z();
        } catch (k) {
          x.error(r.errorMessage(k));
        }
    }
    function X(N, k = !1) {
      ie(N, k).catch((U) => x.error(r.errorMessage(U)));
    }
    function B(N) {
      r.scrollToStep(N);
    }
    return (N, k) => (e.openBlock(), e.createElementBlock("div", Iu, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createElementVNode("div", Ou, [
        e.createElementVNode("aside", Ku, [
          e.createElementVNode(
            "div",
            qu,
            e.toDisplayString(N.$t("已生成的报表")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(z.value, (U) => (e.openBlock(), e.createElementBlock("li", {
                key: U.id,
                class: e.normalizeClass({ active: U.id === d.value }),
                onClick: (Y) => d.value = U.id
              }, [
                e.createElementVNode("div", Wu, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(U.period),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", U.checks.some((Y) => Y.level === "error") ? "bad" : "ok"])
                    },
                    e.toDisplayString(U.checks.some((Y) => Y.level === "error") ? N.$t("勾稽不平") : N.$t("勾稽通过")),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("div", Ju, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(U.source === "balances" ? N.$t("按科目余额表") : N.$t("按凭证")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: e.withModifiers((Y) => L(U.id), ["stop"])
                  }, e.toDisplayString(N.$t("删除")), 9, Yu)
                ])
              ], 10, ju))),
              128
              /* KEYED_FRAGMENT */
            )),
            z.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              Hu,
              e.toDisplayString(N.$t("还没有生成报表")),
              1
              /* TEXT */
            ))
          ])
        ]),
        e.createElementVNode("section", Qu, [
          e.createVNode(re, {
            title: N.$t("财务报表"),
            metas: g,
            runtime: T.value,
            "current-key": I.value,
            onJump: B
          }, null, 8, ["title", "runtime", "current-key"]),
          e.createElementVNode("div", Gu, [
            e.createVNode(G, {
              "step-key": "stm-source",
              index: 0,
              title: g[0].title,
              hint: g[0].hint,
              runtime: T.value["stm-source"]
            }, {
              default: e.withCtx(() => [
                e.createVNode(Ne),
                e.createElementVNode("div", Xu, [
                  e.createElementVNode("label", Zu, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(N.$t("取数来源")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": k[0] || (k[0] = (U) => p.source = U)
                      },
                      [
                        e.createElementVNode(
                          "option",
                          em,
                          e.toDisplayString(N.$t("导入的科目余额表")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "option",
                          tm,
                          e.toDisplayString(N.$t("本工作台已审核凭证 + 序时账")),
                          1
                          /* TEXT */
                        )
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelSelect, p.source]
                    ])
                  ]),
                  p.source === "balances" ? (e.openBlock(), e.createElementBlock("label", lm, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(N.$t("期间")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": k[1] || (k[1] = (U) => p.period = U)
                      },
                      [
                        e.createElementVNode(
                          "option",
                          nm,
                          e.toDisplayString(N.$t("选择已导入的期间")),
                          1
                          /* TEXT */
                        ),
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(C.value, (U) => (e.openBlock(), e.createElementBlock("option", {
                            key: U.period,
                            value: U.period
                          }, e.toDisplayString(U.period), 9, om))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelSelect, p.period]
                    ])
                  ])) : (e.openBlock(), e.createElementBlock("label", am, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(N.$t("月份")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": k[2] || (k[2] = (U) => p.period = U),
                        type: "month"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelText, p.period]
                    ])
                  ]))
                ]),
                p.source === "balances" && !C.value.length ? (e.openBlock(), e.createElementBlock("p", sm, [
                  k[5] || (k[5] = e.createElementVNode(
                    "i",
                    { class: "ri-information-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(N.$t("还没有导入科目余额表：在上面的数据对接里导入，或改用「本工作台已审核凭证」")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "stm-build",
              index: 1,
              title: g[1].title,
              hint: g[1].hint,
              runtime: T.value["stm-build"]
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", im, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!v.value || !p.period,
                    onClick: P
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(v.value === "stm-build" ? "ri-loader-4-line spin" : "ri-file-chart-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(N.$t("生成三大报表")),
                      1
                      /* TEXT */
                    )
                  ], 8, rm),
                  e.createElementVNode(
                    "span",
                    dm,
                    e.toDisplayString(N.$t("按一级科目名称取数，小企业会计准则与企业会计准则都能认")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "stm-view",
              index: 2,
              title: g[2].title,
              hint: g[2].hint,
              runtime: T.value["stm-view"]
            }, {
              default: e.withCtx(() => [
                S.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode("nav", cm, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(j.value, (U) => (e.openBlock(), e.createElementBlock("button", {
                          key: U.key,
                          type: "button",
                          class: e.normalizeClass(["fa-sub__btn", { active: w.value === U.key }]),
                          onClick: (Y) => w.value = U.key
                        }, e.toDisplayString(U.label), 11, um))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    e.createElementVNode("div", mm, [
                      e.createElementVNode("table", pm, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(N.$t("项目")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              vm,
                              e.toDisplayString(w.value === "balanceSheet" ? N.$t("期末余额") : N.$t("本期金额")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              ym,
                              e.toDisplayString(w.value === "balanceSheet" ? N.$t("期初余额") : N.$t("上期金额")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(s.value, (U) => (e.openBlock(), e.createElementBlock("tr", {
                              key: U.key,
                              class: e.normalizeClass({ total: U.bold }),
                              title: U.source || ""
                            }, [
                              e.createElementVNode(
                                "td",
                                {
                                  style: e.normalizeStyle({ paddingInlineStart: `${10 + (U.indent || 0) * 16}px` })
                                },
                                e.toDisplayString(U.label),
                                5
                                /* TEXT, STYLE */
                              ),
                              e.createElementVNode(
                                "td",
                                Nm,
                                e.toDisplayString(e.unref(r.fmtMoney)(U.current)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                gm,
                                e.toDisplayString(U.prior == null ? "—" : e.unref(r.fmtMoney)(U.prior)),
                                1
                                /* TEXT */
                              )
                            ], 10, Vm))),
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
                  hm,
                  e.toDisplayString(N.$t("生成后在这里查看")),
                  1
                  /* TEXT */
                ))
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "stm-check",
              index: 3,
              title: g[3].title,
              hint: g[3].hint,
              runtime: T.value["stm-check"]
            }, {
              default: e.withCtx(() => [
                S.value ? (e.openBlock(), e.createElementBlock("ul", Em, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(S.value.checks, (U, Y) => (e.openBlock(), e.createElementBlock(
                      "li",
                      {
                        key: Y,
                        class: e.normalizeClass(U.level)
                      },
                      [
                        e.createElementVNode(
                          "i",
                          {
                            class: e.normalizeClass(U.level === "ok" ? "ri-checkbox-circle-line" : U.level === "error" ? "ri-close-circle-line" : "ri-error-warning-line")
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        e.createElementVNode(
                          "span",
                          null,
                          e.toDisplayString(U.message),
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
                ])) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "stm-analyze",
              index: 4,
              title: g[4].title,
              hint: g[4].hint,
              runtime: T.value["stm-analyze"]
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", km, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!v.value || !S.value,
                    onClick: F
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(v.value === "stm-analyze" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(S.value?.analysis ? N.$t("重新分析") : N.$t("生成经营简要分析")),
                      1
                      /* TEXT */
                    )
                  ], 8, fm),
                  S.value?.model ? (e.openBlock(), e.createElementBlock(
                    "span",
                    $m,
                    e.toDisplayString(N.$t("由 {p0} 撰写，数字全部取自报表", { p0: e.unref(me)(S.value.model) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                S.value?.analysis ? (e.openBlock(), e.createElementBlock(
                  "div",
                  bm,
                  e.toDisplayString(S.value.analysis),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "stm-export",
              index: 5,
              title: g[5].title,
              hint: g[5].hint,
              runtime: T.value["stm-export"]
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Dm, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!v.value || !S.value,
                    onClick: O
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(v.value === "stm-export" ? "ri-loader-4-line spin" : "ri-download-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(N.$t("导出 Excel")),
                      1
                      /* TEXT */
                    )
                  ], 8, Sm),
                  S.value?.exportPath ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode(
                        "code",
                        _m,
                        e.toDisplayString(S.value.exportPath),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: "ss-link",
                          onClick: k[3] || (k[3] = (U) => X(S.value.exportPath))
                        },
                        e.toDisplayString(N.$t("打开")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: "ss-link",
                          onClick: k[4] || (k[4] = (U) => X(S.value.exportPath, !0))
                        },
                        e.toDisplayString(N.$t("所在文件夹")),
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
                  Bm,
                  e.toDisplayString(N.$t("三张报表 + 勾稽校验在一个 Excel 里；有经营分析时另存一份 Markdown。")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"])
          ])
        ])
      ])
    ]));
  }
}), Cm = /* @__PURE__ */ oe(wm, [["__scopeId", "data-v-f4110ac1"]]), Tm = { class: "ss-module" }, Mm = { class: "fa-split" }, Lm = { class: "fa-list" }, Um = { class: "ss-subhead" }, Pm = ["onClick"], Fm = { class: "fa-list__top" }, zm = { class: "fa-list__meta" }, Am = ["onClick"], xm = {
  key: 0,
  class: "ss-empty"
}, Rm = { class: "fa-detail" }, Im = { class: "ss-steps" }, Om = { class: "ss-kpis" }, Km = { class: "ss-kpi" }, qm = { class: "ss-kpi" }, jm = { class: "ss-kpi" }, Wm = { class: "ss-kpi" }, Jm = { class: "ss-kpi" }, Ym = { class: "ss-muted" }, Hm = { class: "ss-actions" }, Qm = { class: "ss-actions" }, Gm = ["disabled"], Xm = { class: "ss-muted" }, Zm = {
  key: 0,
  class: "ss-note ok"
}, ep = { class: "ss-subhead" }, tp = { class: "fa-findings" }, lp = { class: "fa-pre" }, np = { class: "fa-suggest" }, op = {
  key: 0,
  class: "ss-muted"
}, ap = {
  key: 1,
  class: "ss-muted"
}, sp = { class: "ss-actions" }, ip = ["disabled"], rp = {
  key: 0,
  class: "ss-muted"
}, dp = {
  key: 0,
  class: "fa-text"
}, cp = { class: "ss-actions" }, up = ["disabled"], mp = { class: "fa-out" }, pp = { class: "ss-muted" }, vp = /* @__PURE__ */ e.defineComponent({
  __name: "RiskTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = e.computed(() => te.value?.data.risks || []), C = e.ref(""), d = e.computed(() => z.value.find((B) => B.id === C.value) || null);
    e.watch(z, (B) => {
      !C.value && B.length && (C.value = B[0].id);
    }, { immediate: !0 });
    const S = e.ref(!1), p = e.computed(() => {
      const B = te.value?.data;
      return {
        docs: B?.docs.length || 0,
        vouchers: B?.vouchers.length || 0,
        journal: (B?.journal?.rows.length || 0) + (B?.vouchers.filter((N) => N.status === "reviewed").reduce((N, k) => N + k.lines.length, 0) || 0),
        agings: B?.agings.length || 0,
        balances: B?.balances.length || 0
      };
    }), w = e.computed(() => {
      const B = d.value?.findings || [];
      return ["high", "warn", "info"].map((N) => ({ level: N, items: B.filter((k) => k.level === N) })).filter((N) => N.items.length);
    });
    function j(B, N) {
      return B.findings.filter((k) => k.level === N).length;
    }
    const s = e.ref(""), v = e.ref({}), $ = [
      { key: "rsk-scope", title: l.t("巡检范围"), hint: l.t("当前账套的票据、凭证、序时账、账龄表") },
      { key: "rsk-scan", title: l.t("全量扫描"), hint: l.t("按固定规则识别风险点") },
      { key: "rsk-detail", title: l.t("风险明细"), hint: l.t("按高 / 中 / 低分组，附整改建议") },
      { key: "rsk-summary", title: l.t("总体结论"), hint: l.t("模型写优先处理顺序，不改数字") },
      { key: "rsk-export", title: l.t("风险报告"), hint: l.t("导出 Markdown 报告") }
    ];
    function g(B, N, k) {
      return s.value === B ? { state: "running" } : v.value[B] ? { state: "failed", error: v.value[B] } : N ? { state: "done", summary: k } : { state: "todo" };
    }
    const c = e.computed(() => {
      const B = d.value, N = p.value.docs + p.value.journal + p.value.agings + p.value.balances;
      return {
        "rsk-scope": g("rsk-scope", N > 0, N ? "" : l.t("账套还没有数据")),
        "rsk-scan": g("rsk-scan", !!B, B ? r.fmtDateTime(B.createdAt) : ""),
        "rsk-detail": g("rsk-detail", !!B, B ? l.t("{n} 项风险", { n: B.findings.length }) : ""),
        "rsk-summary": g("rsk-summary", !!B?.summary || !!B && !B.findings.length),
        "rsk-export": g("rsk-export", !!B?.reportPath)
      };
    }), T = e.computed(() => $.find((B) => c.value[B.key].state !== "done")?.key || "rsk-export");
    async function I(B, N) {
      s.value = B, v.value = { ...v.value, [B]: "" }, r.scrollToStep(B);
      try {
        await N(), await Z();
      } catch (k) {
        v.value = { ...v.value, [B]: r.errorMessage(k) };
      } finally {
        s.value = "";
      }
    }
    async function W() {
      await I("rsk-scan", async () => {
        C.value = (await K("risk.scan")).id;
      }), d.value && r.scrollToStep("rsk-detail");
    }
    async function P() {
      d.value && await I("rsk-summary", () => K("risk.summary", { id: d.value.id }));
    }
    async function F() {
      d.value && await I("rsk-export", () => K("risk.export", { id: d.value.id }));
    }
    async function O(B) {
      if (window.confirm(l.t("删除这条巡检记录？")))
        try {
          await K("risk.remove", { id: B }), C.value === B && (C.value = ""), await Z();
        } catch (N) {
          x.error(r.errorMessage(N));
        }
    }
    function L(B, N = !1) {
      ie(B, N).catch((k) => x.error(r.errorMessage(k)));
    }
    function X(B) {
      r.scrollToStep(B);
    }
    return (B, N) => (e.openBlock(), e.createElementBlock("div", Tm, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createElementVNode("div", Mm, [
        e.createElementVNode("aside", Lm, [
          e.createElementVNode(
            "div",
            Um,
            e.toDisplayString(B.$t("巡检记录")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(z.value, (k) => (e.openBlock(), e.createElementBlock("li", {
                key: k.id,
                class: e.normalizeClass({ active: k.id === C.value }),
                onClick: (U) => C.value = k.id
              }, [
                e.createElementVNode("div", Fm, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(e.unref(r.fmtDateTime)(k.createdAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", j(k, "high") ? "bad" : k.findings.length ? "warn" : "ok"])
                    },
                    e.toDisplayString(B.$t("{n} 项", { n: k.findings.length })),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("div", zm, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(B.$t("高 {a} · 中 {b} · 低 {c}", { a: j(k, "high"), b: j(k, "warn"), c: j(k, "info") })),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: e.withModifiers((U) => O(k.id), ["stop"])
                  }, e.toDisplayString(B.$t("删除")), 9, Am)
                ])
              ], 10, Pm))),
              128
              /* KEYED_FRAGMENT */
            )),
            z.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              xm,
              e.toDisplayString(B.$t("还没有巡检过")),
              1
              /* TEXT */
            ))
          ])
        ]),
        e.createElementVNode("section", Rm, [
          e.createVNode(re, {
            title: B.$t("财税风险巡检"),
            metas: $,
            runtime: c.value,
            "current-key": T.value,
            onJump: X
          }, null, 8, ["title", "runtime", "current-key"]),
          e.createElementVNode("div", Im, [
            e.createVNode(G, {
              "step-key": "rsk-scope",
              index: 0,
              title: $[0].title,
              hint: $[0].hint,
              runtime: c.value["rsk-scope"]
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Om, [
                  e.createElementVNode("div", Km, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(B.$t("票据")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(p.value.docs),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", qm, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(B.$t("凭证")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(p.value.vouchers),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", jm, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(B.$t("序时账行数")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(p.value.journal),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Wm, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(B.$t("账龄表")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(p.value.agings),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("div", Jm, [
                    e.createElementVNode(
                      "small",
                      null,
                      e.toDisplayString(B.$t("科目余额表")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "strong",
                      null,
                      e.toDisplayString(p.value.balances),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode(
                  "p",
                  Ym,
                  e.toDisplayString(B.$t("规则：发票连号、大额现金、大额付给个人、异常费用（环比暴涨 / 整千大额 / 周末招待）、税负偏低、往来长期挂账、余额方向异常、问题票据。")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode("div", Hm, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: N[0] || (N[0] = (k) => S.value = !S.value)
                  }, [
                    N[4] || (N[4] = e.createElementVNode(
                      "i",
                      { class: "ri-database-2-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(S.value ? B.$t("收起数据对接") : B.$t("补充账套数据")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: N[1] || (N[1] = (k) => B.$emit("goto", "settings"))
                  }, [
                    N[5] || (N[5] = e.createElementVNode(
                      "i",
                      { class: "ri-equalizer-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(B.$t("调整预警阈值")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                S.value ? (e.openBlock(), e.createBlock(Ne, { key: 0 })) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "rsk-scan",
              index: 1,
              title: $[1].title,
              hint: $[1].hint,
              runtime: c.value["rsk-scan"]
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Qm, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!s.value,
                    onClick: W
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(s.value === "rsk-scan" ? "ri-loader-4-line spin" : "ri-radar-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(B.$t("开始巡检")),
                      1
                      /* TEXT */
                    )
                  ], 8, Gm),
                  e.createElementVNode(
                    "span",
                    Xm,
                    e.toDisplayString(B.$t("全部按固定规则扫描，不经过模型")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "rsk-detail",
              index: 2,
              title: $[2].title,
              hint: $[2].hint,
              runtime: c.value["rsk-detail"]
            }, {
              default: e.withCtx(() => [
                d.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    d.value.findings.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("p", Zm, [
                      N[6] || (N[6] = e.createElementVNode(
                        "i",
                        { class: "ri-check-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(B.$t("没有发现规则内的风险点")),
                        1
                        /* TEXT */
                      )
                    ])),
                    (e.openBlock(!0), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(w.value, (k) => (e.openBlock(), e.createElementBlock("div", {
                        key: k.level,
                        class: "fa-group"
                      }, [
                        e.createElementVNode("div", ep, [
                          e.createElementVNode(
                            "span",
                            {
                              class: e.normalizeClass(["ss-chip", e.unref(ve)(k.level)])
                            },
                            e.toDisplayString(e.unref(pe)(k.level)),
                            3
                            /* TEXT, CLASS */
                          ),
                          e.createTextVNode(
                            " " + e.toDisplayString(B.$t("{n} 项", { n: k.items.length })),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode("ul", tp, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(k.items, (U, Y) => (e.openBlock(), e.createElementBlock("li", { key: Y }, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(U.title),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "p",
                                lp,
                                e.toDisplayString(U.detail),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("p", np, [
                                N[7] || (N[7] = e.createElementVNode(
                                  "i",
                                  { class: "ri-lightbulb-line" },
                                  null,
                                  -1
                                  /* CACHED */
                                )),
                                e.createTextVNode(
                                  e.toDisplayString(U.suggestion),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              U.refs?.length ? (e.openBlock(), e.createElementBlock(
                                "small",
                                op,
                                e.toDisplayString(B.$t("涉及 {n} 条记录", { n: U.refs.length })),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0)
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])
                      ]))),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : (e.openBlock(), e.createElementBlock(
                  "p",
                  ap,
                  e.toDisplayString(B.$t("巡检后在这里查看")),
                  1
                  /* TEXT */
                ))
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "rsk-summary",
              index: 3,
              title: $[3].title,
              hint: $[3].hint,
              runtime: c.value["rsk-summary"]
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", sp, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!s.value || !d.value || !d.value.findings.length,
                    onClick: P
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(s.value === "rsk-summary" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(d.value?.summary ? B.$t("重新总结") : B.$t("生成总体结论")),
                      1
                      /* TEXT */
                    )
                  ], 8, ip),
                  d.value?.model ? (e.openBlock(), e.createElementBlock(
                    "span",
                    rp,
                    e.toDisplayString(B.$t("由 {p0} 撰写", { p0: e.unref(me)(d.value.model) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                d.value?.summary ? (e.openBlock(), e.createElementBlock(
                  "div",
                  dp,
                  e.toDisplayString(d.value.summary),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "rsk-export",
              index: 4,
              title: $[4].title,
              hint: $[4].hint,
              runtime: c.value["rsk-export"]
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", cp, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!s.value || !d.value,
                    onClick: F
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(s.value === "rsk-export" ? "ri-loader-4-line spin" : "ri-download-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(B.$t("导出风险报告")),
                      1
                      /* TEXT */
                    )
                  ], 8, up),
                  d.value?.reportPath ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode(
                        "code",
                        mp,
                        e.toDisplayString(d.value.reportPath),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: "ss-link",
                          onClick: N[2] || (N[2] = (k) => L(d.value.reportPath))
                        },
                        e.toDisplayString(B.$t("打开")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "button",
                        {
                          type: "button",
                          class: "ss-link",
                          onClick: N[3] || (N[3] = (k) => L(d.value.reportPath, !0))
                        },
                        e.toDisplayString(B.$t("所在文件夹")),
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
                  pp,
                  e.toDisplayString(B.$t("Markdown 报告，附每项的整改建议；结论需财务人员复核确认。")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"])
          ])
        ])
      ])
    ]));
  }
}), yp = /* @__PURE__ */ oe(vp, [["__scopeId", "data-v-52d56197"]]), Vp = { class: "ss-module" }, Np = { class: "ss-steps" }, gp = { class: "ss-actions" }, hp = { class: "ss-field fa-year" }, Ep = { class: "ss-table-wrap" }, kp = { class: "ss-table fa-budget-edit" }, fp = { class: "num" }, $p = ["onUpdate:modelValue", "placeholder"], bp = ["onUpdate:modelValue", "placeholder"], Dp = ["onUpdate:modelValue"], Sp = { class: "num" }, _p = ["onClick"], Bp = { key: 0 }, wp = {
  colspan: "16",
  class: "ss-empty"
}, Cp = { class: "ss-actions" }, Tp = ["disabled"], Mp = {
  key: 0,
  class: "ss-muted"
}, Lp = { class: "ss-actions" }, Up = { class: "ss-field fa-year" }, Pp = ["value"], Fp = ["disabled"], zp = {
  key: 0,
  class: "ss-note warn"
}, Ap = {
  key: 1,
  class: "ss-muted"
}, xp = {
  key: 3,
  class: "ss-table-wrap"
}, Rp = { class: "ss-table" }, Ip = { class: "num" }, Op = { class: "num" }, Kp = { class: "num" }, qp = { class: "num" }, jp = { class: "num" }, Wp = { class: "num" }, Jp = { class: "num" }, Yp = { class: "num" }, Hp = { class: "num" }, Qp = { class: "num" }, Gp = {
  key: 0,
  class: "fa-alerts"
}, Xp = {
  key: 1,
  class: "ss-note ok"
}, Zp = { class: "ss-actions" }, ev = ["disabled"], tv = {
  key: 0,
  class: "ss-muted"
}, lv = {
  key: 0,
  class: "fa-text"
}, nv = { class: "ss-grid" }, ov = { class: "ss-field" }, av = { class: "ss-field" }, sv = { class: "ss-field" }, iv = { id: "fa-budget-cats" }, rv = ["value"], dv = { class: "ss-actions" }, cv = ["disabled"], uv = {
  key: 1,
  class: "ss-muted"
}, mv = { class: "ss-actions" }, pv = ["disabled"], vv = { class: "fa-out" }, yv = /* @__PURE__ */ e.defineComponent({
  __name: "BudgetTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = e.computed(() => te.value?.data.budget || { year: (/* @__PURE__ */ new Date()).getFullYear(), lines: [] }), C = e.computed(() => z.value.lines), d = e.ref(z.value.year), S = e.ref([]), p = (u) => u.map((Q) => ({ dept: Q.dept, category: Q.category, months: Array.from({ length: 12 }, (J, ae) => Number(Q.months[ae]) || 0) }));
    e.watch(z, (u) => {
      S.value = p(u.lines), d.value = u.year;
    }, { immediate: !0 });
    const w = e.computed(() => d.value !== z.value.year || JSON.stringify(S.value) !== JSON.stringify(p(C.value))), j = e.computed(() => [...new Set(C.value.map((u) => u.category))]), s = e.computed(() => te.value?.data.budgetAnalyses || []), v = e.ref((/* @__PURE__ */ new Date()).getMonth() + 1), $ = e.ref(""), g = e.computed(() => s.value.find((u) => u.id === $.value) || s.value.find((u) => u.year === z.value.year) || null), c = e.ref(""), T = e.computed(() => (g.value?.rows || []).filter((u) => u.level !== "ok")), I = e.ref(!1), W = e.reactive({ dept: "", category: "", amount: 0 }), P = e.ref(null), F = e.ref(""), O = e.ref({}), L = [
      { key: "bdg-input", title: l.t("录入预算"), hint: l.t("按部门 × 类别 × 月份录入额度") },
      { key: "bdg-track", title: l.t("跟踪执行"), hint: l.t("各部门预算消耗与执行率") },
      { key: "bdg-warn", title: l.t("超预算预警"), hint: l.t("执行率 ≥ 80% 预警，≥ 100% 超支") },
      { key: "bdg-comment", title: l.t("差异解读"), hint: l.t("模型写月度预算差异解读") },
      { key: "bdg-precheck", title: l.t("支出预检"), hint: l.t("花钱之前先看会不会超预算") },
      { key: "bdg-export", title: l.t("导出"), hint: l.t("预算执行表 Excel") }
    ];
    function X(u, Q, J) {
      return F.value === u ? { state: "running" } : O.value[u] ? { state: "failed", error: O.value[u] } : Q ? { state: "done", summary: J } : { state: "todo" };
    }
    const B = e.computed(() => {
      const u = g.value;
      return {
        "bdg-input": X("bdg-input", C.value.length > 0 && !w.value, l.t("{n} 行预算", { n: C.value.length })),
        "bdg-track": X("bdg-track", !!u, u ? l.t("{y} 年截至 {m} 月", { y: u.year, m: u.month }) : ""),
        "bdg-warn": X("bdg-warn", !!u, u ? l.t("{n} 项预警", { n: T.value.length }) : ""),
        "bdg-comment": X("bdg-comment", !!u?.commentary),
        "bdg-precheck": X("bdg-precheck", !!P.value),
        "bdg-export": X("bdg-export", !!u?.exportPath)
      };
    }), N = e.computed(() => L.find((u) => B.value[u.key].state !== "done")?.key || "bdg-export");
    function k(u) {
      return u.months.reduce((Q, J) => Q + (Number(J) || 0), 0);
    }
    function U() {
      S.value.push({ dept: "", category: "", months: Array(12).fill(0) });
    }
    async function Y(u, Q) {
      F.value = u, O.value = { ...O.value, [u]: "" }, r.scrollToStep(u);
      try {
        await Q(), await Z();
      } catch (J) {
        O.value = { ...O.value, [u]: r.errorMessage(J) };
      } finally {
        F.value = "";
      }
    }
    async function E(u) {
      await Y("bdg-input", () => K("budget.import", { path: u, year: d.value }));
    }
    async function D() {
      await Y("bdg-input", () => K("budget.save", { year: d.value, lines: S.value }));
    }
    async function i() {
      await Y("bdg-track", async () => {
        const u = await K("budget.analyze", { month: v.value });
        $.value = u.id, c.value = u.source;
      });
    }
    async function A() {
      g.value && await Y("bdg-comment", () => K("budget.commentary", { id: g.value.id }));
    }
    async function b() {
      F.value = "bdg-precheck", O.value = { ...O.value, "bdg-precheck": "" };
      try {
        P.value = await K("budget.precheck", { dept: W.dept, category: W.category, amount: W.amount });
      } catch (u) {
        O.value = { ...O.value, "bdg-precheck": r.errorMessage(u) };
      } finally {
        F.value = "";
      }
    }
    async function f() {
      g.value && await Y("bdg-export", () => K("budget.export", { id: g.value.id }));
    }
    function n(u, Q = !1) {
      ie(u, Q).catch((J) => x.error(r.errorMessage(J)));
    }
    function h(u) {
      r.scrollToStep(u);
    }
    return (u, Q) => (e.openBlock(), e.createElementBlock("div", Vp, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createVNode(re, {
        title: u.$t("预算管控"),
        metas: L,
        runtime: B.value,
        "current-key": N.value,
        onJump: h
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", Np, [
        e.createVNode(G, {
          "step-key": "bdg-input",
          index: 0,
          title: L[0].title,
          hint: L[0].hint,
          runtime: B.value["bdg-input"]
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", gp, [
              e.createElementVNode("label", hp, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(u.$t("预算年度")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": Q[0] || (Q[0] = (J) => d.value = J),
                    type: "number",
                    min: "2000",
                    max: "2100"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    d.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createVNode(se, {
                compact: "",
                kind: "excel",
                multi: !1,
                label: u.$t("导入预算表"),
                hint: u.$t("列：部门、类别（预算科目）、1月…12月，或只有全年预算一列"),
                disabled: !!F.value,
                class: "fa-grow",
                onPicked: Q[1] || (Q[1] = (J) => E(J[0]))
              }, null, 8, ["label", "hint", "disabled"])
            ]),
            e.createElementVNode("div", Ep, [
              e.createElementVNode("table", kp, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
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
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(12, (J) => e.createElementVNode(
                        "th",
                        {
                          key: J,
                          class: "num"
                        },
                        e.toDisplayString(u.$t("{n}月", { n: J })),
                        1
                        /* TEXT */
                      )),
                      64
                      /* STABLE_FRAGMENT */
                    )),
                    e.createElementVNode(
                      "th",
                      fp,
                      e.toDisplayString(u.$t("全年")),
                      1
                      /* TEXT */
                    ),
                    Q[9] || (Q[9] = e.createElementVNode(
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
                    e.renderList(S.value, (J, ae) => (e.openBlock(), e.createElementBlock("tr", { key: ae }, [
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (y) => J.dept = y,
                          type: "text",
                          placeholder: u.$t("全公司")
                        }, null, 8, $p), [
                          [
                            e.vModelText,
                            J.dept,
                            void 0,
                            { trim: !0 }
                          ]
                        ])
                      ]),
                      e.createElementVNode("td", null, [
                        e.withDirectives(e.createElementVNode("input", {
                          "onUpdate:modelValue": (y) => J.category = y,
                          type: "text",
                          placeholder: u.$t("如：差旅费")
                        }, null, 8, bp), [
                          [
                            e.vModelText,
                            J.category,
                            void 0,
                            { trim: !0 }
                          ]
                        ])
                      ]),
                      (e.openBlock(), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(12, (y) => e.createElementVNode("td", { key: y }, [
                          e.withDirectives(e.createElementVNode("input", {
                            "onUpdate:modelValue": (R) => J.months[y - 1] = R,
                            type: "number",
                            min: "0",
                            class: "num"
                          }, null, 8, Dp), [
                            [
                              e.vModelText,
                              J.months[y - 1],
                              void 0,
                              { number: !0 }
                            ]
                          ])
                        ])),
                        64
                        /* STABLE_FRAGMENT */
                      )),
                      e.createElementVNode(
                        "td",
                        Sp,
                        e.toDisplayString(e.unref(r.fmtMoney)(k(J))),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("td", null, [
                        e.createElementVNode("button", {
                          type: "button",
                          class: "ss-link",
                          onClick: (y) => S.value.splice(ae, 1)
                        }, e.toDisplayString(u.$t("删除")), 9, _p)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  S.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Bp, [
                    e.createElementVNode(
                      "td",
                      wp,
                      e.toDisplayString(u.$t("还没有预算：导入预算表，或点「加一行」")),
                      1
                      /* TEXT */
                    )
                  ]))
                ])
              ])
            ]),
            e.createElementVNode("div", Cp, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm ghost",
                onClick: U
              }, [
                Q[10] || (Q[10] = e.createElementVNode(
                  "i",
                  { class: "ri-add-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(u.$t("加一行")),
                  1
                  /* TEXT */
                )
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm primary",
                disabled: !!F.value || !w.value,
                onClick: D
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(F.value === "bdg-input" ? "ri-loader-4-line spin" : "ri-save-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(u.$t("保存预算")),
                  1
                  /* TEXT */
                )
              ], 8, Tp),
              w.value ? (e.openBlock(), e.createElementBlock(
                "span",
                Mp,
                e.toDisplayString(u.$t("有未保存的修改")),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(G, {
          "step-key": "bdg-track",
          index: 1,
          title: L[1].title,
          hint: L[1].hint,
          runtime: B.value["bdg-track"]
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Lp, [
              e.createElementVNode("label", Up, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(u.$t("截至月份")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "select",
                  {
                    "onUpdate:modelValue": Q[2] || (Q[2] = (J) => v.value = J)
                  },
                  [
                    (e.openBlock(), e.createElementBlock(
                      e.Fragment,
                      null,
                      e.renderList(12, (J) => e.createElementVNode("option", {
                        key: J,
                        value: J
                      }, e.toDisplayString(u.$t("{n}月", { n: J })), 9, Pp)),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ],
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelSelect,
                    v.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!F.value || !C.value.length,
                onClick: i
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(F.value === "bdg-track" ? "ri-loader-4-line spin" : "ri-bar-chart-box-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(u.$t("跟踪执行")),
                  1
                  /* TEXT */
                )
              ], 8, Fp)
            ]),
            c.value === "claims" ? (e.openBlock(), e.createElementBlock("p", zp, [
              Q[11] || (Q[11] = e.createElementVNode(
                "i",
                { class: "ri-information-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(u.$t("账套还没有序时账，实际数暂用已通过的报销单统计；导入序时账后按账面数算更准。")) + " ",
                1
                /* TEXT */
              ),
              e.createElementVNode(
                "button",
                {
                  type: "button",
                  class: "ss-link",
                  onClick: Q[3] || (Q[3] = (J) => I.value = !I.value)
                },
                e.toDisplayString(I.value ? u.$t("收起") : u.$t("去导入")),
                1
                /* TEXT */
              )
            ])) : c.value === "journal" ? (e.openBlock(), e.createElementBlock(
              "p",
              Ap,
              e.toDisplayString(u.$t("实际数取自序时账（含本工作台已审核凭证）")),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0),
            I.value ? (e.openBlock(), e.createBlock(Ne, { key: 2 })) : e.createCommentVNode("v-if", !0),
            g.value ? (e.openBlock(), e.createElementBlock("div", xp, [
              e.createElementVNode("table", Rp, [
                e.createElementVNode("thead", null, [
                  e.createElementVNode("tr", null, [
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
                      Ip,
                      e.toDisplayString(u.$t("累计预算")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Op,
                      e.toDisplayString(u.$t("累计实际")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      null,
                      e.toDisplayString(u.$t("执行率")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      Kp,
                      e.toDisplayString(u.$t("本月预算")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      qp,
                      e.toDisplayString(u.$t("本月实际")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode(
                      "th",
                      jp,
                      e.toDisplayString(u.$t("本月差异")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                e.createElementVNode("tbody", null, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(g.value.rows, (J, ae) => (e.openBlock(), e.createElementBlock(
                      "tr",
                      {
                        key: ae,
                        class: e.normalizeClass({ bad: J.level === "over" })
                      },
                      [
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(J.dept),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          null,
                          e.toDisplayString(J.category),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          Wp,
                          e.toDisplayString(e.unref(r.fmtMoney)(J.budget)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          Jp,
                          e.toDisplayString(e.unref(r.fmtMoney)(J.actual)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode("td", null, [
                          e.createElementVNode(
                            "div",
                            {
                              class: e.normalizeClass(["fa-usage", J.level])
                            },
                            [
                              e.createElementVNode(
                                "span",
                                {
                                  style: e.normalizeStyle({ width: `${Math.min(100, J.usage * 100)}%` })
                                },
                                null,
                                4
                                /* STYLE */
                              )
                            ],
                            2
                            /* CLASS */
                          ),
                          e.createElementVNode(
                            "small",
                            null,
                            e.toDisplayString(e.unref(r.fmtPct)(J.usage, 1)),
                            1
                            /* TEXT */
                          )
                        ]),
                        e.createElementVNode(
                          "td",
                          Yp,
                          e.toDisplayString(e.unref(r.fmtMoney)(J.monthBudget)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          Hp,
                          e.toDisplayString(e.unref(r.fmtMoney)(J.monthActual)),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "td",
                          Qp,
                          e.toDisplayString(e.unref(r.fmtMoney)(J.monthActual - J.monthBudget)),
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
            ])) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(G, {
          "step-key": "bdg-warn",
          index: 2,
          title: L[2].title,
          hint: L[2].hint,
          runtime: B.value["bdg-warn"]
        }, {
          default: e.withCtx(() => [
            g.value ? (e.openBlock(), e.createElementBlock(
              e.Fragment,
              { key: 0 },
              [
                T.value.length ? (e.openBlock(), e.createElementBlock("ul", Gp, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(T.value, (J, ae) => (e.openBlock(), e.createElementBlock("li", { key: ae }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", J.level === "over" ? "bad" : "warn"])
                        },
                        e.toDisplayString(J.level === "over" ? u.$t("超预算") : u.$t("接近上限")),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(u.$t("{p0} / {p1}：累计预算 {a}，实际 {b}，执行率 {c}", { p0: J.dept, p1: J.category, a: e.unref(r.fmtMoney)(J.budget), b: e.unref(r.fmtMoney)(J.actual), c: e.unref(r.fmtPct)(J.usage, 1) })),
                        1
                        /* TEXT */
                      )
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (e.openBlock(), e.createElementBlock("p", Xp, [
                  Q[12] || (Q[12] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(u.$t("各项预算都在 80% 以内")),
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
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(G, {
          "step-key": "bdg-comment",
          index: 3,
          title: L[3].title,
          hint: L[3].hint,
          runtime: B.value["bdg-comment"]
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", Zp, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!F.value || !g.value,
                onClick: A
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(F.value === "bdg-comment" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(g.value?.commentary ? u.$t("重新解读") : u.$t("生成差异解读")),
                  1
                  /* TEXT */
                )
              ], 8, ev),
              g.value?.model ? (e.openBlock(), e.createElementBlock(
                "span",
                tv,
                e.toDisplayString(u.$t("由 {p0} 撰写", { p0: e.unref(me)(g.value.model) })),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ]),
            g.value?.commentary ? (e.openBlock(), e.createElementBlock(
              "div",
              lv,
              e.toDisplayString(g.value.commentary),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(G, {
          "step-key": "bdg-precheck",
          index: 4,
          title: L[4].title,
          hint: L[4].hint,
          runtime: B.value["bdg-precheck"]
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", nv, [
              e.createElementVNode("label", ov, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(u.$t("部门")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": Q[4] || (Q[4] = (J) => W.dept = J),
                    type: "text"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    W.dept,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", av, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(u.$t("类别")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": Q[5] || (Q[5] = (J) => W.category = J),
                    type: "text",
                    list: "fa-budget-cats"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    W.category,
                    void 0,
                    { trim: !0 }
                  ]
                ])
              ]),
              e.createElementVNode("label", sv, [
                e.createElementVNode(
                  "span",
                  null,
                  e.toDisplayString(u.$t("本次金额")),
                  1
                  /* TEXT */
                ),
                e.withDirectives(e.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": Q[6] || (Q[6] = (J) => W.amount = J),
                    type: "number",
                    min: "0"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    e.vModelText,
                    W.amount,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ])
            ]),
            e.createElementVNode("datalist", iv, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(j.value, (J) => (e.openBlock(), e.createElementBlock("option", {
                  key: J,
                  value: J
                }, null, 8, rv))),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", dv, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm primary",
                disabled: !!F.value || !W.category || !W.amount,
                onClick: b
              }, [
                Q[13] || (Q[13] = e.createElementVNode(
                  "i",
                  { class: "ri-shield-check-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(u.$t("预检")),
                  1
                  /* TEXT */
                )
              ], 8, cv),
              P.value ? (e.openBlock(), e.createElementBlock(
                "span",
                {
                  key: 0,
                  class: e.normalizeClass(["ss-chip", P.value.ok ? "ok" : "bad"])
                },
                e.toDisplayString(P.value.ok ? u.$t("可以支出") : u.$t("会超预算")),
                3
                /* TEXT, CLASS */
              )) : e.createCommentVNode("v-if", !0),
              P.value ? (e.openBlock(), e.createElementBlock(
                "span",
                uv,
                e.toDisplayString(P.value.message),
                1
                /* TEXT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(G, {
          "step-key": "bdg-export",
          index: 5,
          title: L[5].title,
          hint: L[5].hint,
          runtime: B.value["bdg-export"]
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("div", mv, [
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn primary",
                disabled: !!F.value || !g.value,
                onClick: f
              }, [
                e.createElementVNode(
                  "i",
                  {
                    class: e.normalizeClass(F.value === "bdg-export" ? "ri-loader-4-line spin" : "ri-download-2-line")
                  },
                  null,
                  2
                  /* CLASS */
                ),
                e.createTextVNode(
                  e.toDisplayString(u.$t("导出预算执行表")),
                  1
                  /* TEXT */
                )
              ], 8, pv),
              g.value?.exportPath ? (e.openBlock(), e.createElementBlock(
                e.Fragment,
                { key: 0 },
                [
                  e.createElementVNode(
                    "code",
                    vv,
                    e.toDisplayString(g.value.exportPath),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: Q[7] || (Q[7] = (J) => n(g.value.exportPath))
                    },
                    e.toDisplayString(u.$t("打开")),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "button",
                    {
                      type: "button",
                      class: "ss-link",
                      onClick: Q[8] || (Q[8] = (J) => n(g.value.exportPath, !0))
                    },
                    e.toDisplayString(u.$t("所在文件夹")),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : e.createCommentVNode("v-if", !0)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), Vv = /* @__PURE__ */ oe(yv, [["__scopeId", "data-v-ada98a6a"]]), Nv = { class: "ss-module" }, gv = { class: "fa-split" }, hv = { class: "fa-list" }, Ev = { class: "ss-subhead" }, kv = ["onClick"], fv = { class: "fa-list__top" }, $v = { class: "ss-chip" }, bv = { class: "fa-list__meta" }, Dv = ["onClick"], Sv = {
  key: 0,
  class: "ss-empty"
}, _v = { class: "fa-detail" }, Bv = { class: "ss-steps" }, wv = { class: "ss-grid" }, Cv = { class: "ss-field" }, Tv = { class: "ss-table-wrap" }, Mv = { class: "ss-table" }, Lv = { class: "num" }, Uv = { class: "num" }, Pv = { class: "num" }, Fv = ["onUpdate:modelValue"], zv = ["onUpdate:modelValue"], Av = ["onUpdate:modelValue"], xv = ["onUpdate:modelValue"], Rv = ["onClick"], Iv = { key: 0 }, Ov = {
  colspan: "5",
  class: "ss-empty"
}, Kv = { class: "ss-actions" }, qv = { class: "ss-table-wrap" }, jv = { class: "ss-table" }, Wv = { class: "num" }, Jv = { class: "num" }, Yv = { class: "num" }, Hv = ["onUpdate:modelValue"], Qv = ["onUpdate:modelValue"], Gv = ["onUpdate:modelValue"], Xv = ["onUpdate:modelValue"], Zv = ["onUpdate:modelValue"], ey = ["onClick"], ty = { key: 0 }, ly = {
  colspan: "6",
  class: "ss-empty"
}, ny = { class: "ss-actions" }, oy = { class: "ss-grid" }, ay = { class: "ss-field" }, sy = { class: "ss-field" }, iy = { value: "hours" }, ry = { value: "machine" }, dy = { value: "output" }, cy = { value: "material" }, uy = { class: "ss-field" }, my = { class: "ss-subhead" }, py = ["onUpdate:modelValue", "placeholder"], vy = ["onUpdate:modelValue", "placeholder"], yy = ["onClick"], Vy = { class: "ss-actions" }, Ny = { class: "ss-muted" }, gy = { class: "ss-actions" }, hy = ["disabled"], Ey = { class: "ss-muted" }, ky = { class: "ss-table-wrap" }, fy = { class: "ss-table" }, $y = { class: "num" }, by = { class: "num" }, Dy = { class: "num" }, Sy = { class: "num" }, _y = { class: "num" }, By = { class: "num" }, wy = { class: "num" }, Cy = { class: "num" }, Ty = { class: "num" }, My = { class: "num" }, Ly = { class: "num" }, Uy = { class: "num" }, Py = { class: "num" }, Fy = { class: "num" }, zy = { class: "num" }, Ay = { class: "num" }, xy = { class: "ss-subhead" }, Ry = { class: "fa-calc" }, Iy = { key: 0 }, Oy = { class: "ss-subhead" }, Ky = { class: "fa-findings" }, qy = { class: "fa-pre" }, jy = { class: "ss-muted" }, Wy = {
  key: 1,
  class: "ss-note ok"
}, Jy = { class: "ss-actions" }, Yy = ["disabled"], Hy = {
  key: 0,
  class: "ss-muted"
}, Qy = {
  key: 0,
  class: "fa-pre fa-text"
}, Gy = { class: "ss-actions" }, Xy = ["disabled"], Zy = { class: "fa-path" }, eV = /* @__PURE__ */ e.defineComponent({
  __name: "CostTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = e.computed(() => te.value?.data.costRuns || []), C = e.ref(""), d = e.computed(() => z.value.find((i) => i.id === C.value) || null), S = e.ref(_e()), p = e.ref([]), w = e.ref([]), j = e.ref(0), s = e.ref([{ item: "", amount: 0 }]), v = e.ref("hours"), $ = e.ref(5), g = e.computed(() => s.value.reduce((i, A) => i + (Number(A.amount) || 0), 0)), c = e.ref(""), T = e.ref({}), I = [
      { key: "products", title: l.t("产量"), hint: l.t("各产品本期完工数量、工时、机时") },
      { key: "materials", title: l.t("领料（料）"), hint: l.t("各产品领用的材料；填 BOM 单耗才能判断超耗") },
      { key: "overhead", title: l.t("人工与制造费用（工、费）"), hint: l.t("直接人工按工时分摊，制造费用按选定标准分摊") },
      { key: "compute", title: l.t("计算单品成本"), hint: l.t("料工费归集、分摊、单位成本、与上期比、异常损耗") },
      { key: "commentary", title: l.t("成本分析"), hint: l.t("模型按计算结果写分析，数字不改") },
      { key: "export", title: l.t("导出"), hint: l.t("成本计算单、分配过程、异常清单（Excel）") }
    ], W = e.computed(() => {
      const i = (b, f, n) => c.value === b ? { state: "running" } : T.value[b] ? { state: "failed", error: T.value[b] } : f ? { state: "done", summary: n } : { state: "todo" }, A = d.value;
      return {
        products: i("products", p.value.length > 0, l.t("{n} 个产品", { n: p.value.length })),
        materials: i("materials", w.value.length > 0, l.t("{n} 条领料", { n: w.value.length })),
        overhead: i("overhead", j.value > 0 || g.value > 0, l.t("人工 {a}，制造费用 {b}", { a: r.fmtMoney(j.value), b: r.fmtMoney(g.value) })),
        compute: i("compute", !!A, A ? l.t("{n} 个产品，{m} 条异常", { n: A.result.length, m: A.losses.length }) : ""),
        commentary: i("commentary", !!A?.commentary),
        export: i("export", !!A?.exportPath)
      };
    }), P = e.computed(() => I.find((i) => W.value[i.key].state !== "done")?.key || "export");
    function F(i) {
      C.value = i;
      const A = z.value.find((b) => b.id === i);
      A && (S.value = A.period, p.value = A.products.map((b) => ({ ...b })), w.value = A.materials.map((b) => ({ ...b })), j.value = A.laborTotal, s.value = A.overheadItems.map((b) => ({ ...b })), v.value = A.basis, $.value = Math.round(A.lossTolerance * 1e3) / 10, T.value = {});
    }
    function O() {
      C.value = "", S.value = _e(), p.value = [], w.value = [], j.value = 0, s.value = [{ item: "", amount: 0 }], T.value = {};
    }
    z.value.length && F(z.value[0].id);
    async function L(i, A) {
      c.value = i, T.value = { ...T.value, [i]: "" }, r.scrollToStep(i);
      try {
        await A();
      } catch (b) {
        T.value = { ...T.value, [i]: r.errorMessage(b) };
      } finally {
        c.value = "";
      }
    }
    function X(i) {
      return L("products", async () => {
        p.value = await K("cost.importProducts", { path: i });
      });
    }
    function B(i) {
      return L("materials", async () => {
        w.value = await K("cost.importMaterials", { path: i });
      });
    }
    function N() {
      return L("compute", async () => {
        const i = await K("cost.compute", {
          period: S.value,
          basis: v.value,
          laborTotal: Number(j.value) || 0,
          overheadItems: s.value.filter((A) => A.item && Number(A.amount)),
          products: p.value.filter((A) => A.name),
          materials: w.value.filter((A) => A.product && A.material),
          lossTolerance: (Number($.value) || 0) / 100
        });
        await Z(), C.value = i.id;
      });
    }
    function k() {
      return L("commentary", async () => {
        await K("cost.commentary", { id: C.value }), await Z();
      });
    }
    function U() {
      return L("export", async () => {
        await K("cost.export", { id: C.value }), await Z();
      });
    }
    async function Y(i) {
      if (window.confirm(l.t("删除这条核算记录？")))
        try {
          await K("cost.remove", { id: i }), C.value === i && O(), await Z();
        } catch (A) {
          x.error(r.errorMessage(A));
        }
    }
    function E(i) {
      ie(i).catch((A) => x.error(r.errorMessage(A)));
    }
    function D(i) {
      r.scrollToStep(i);
    }
    return (i, A) => (e.openBlock(), e.createElementBlock("div", Nv, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createElementVNode("div", gv, [
        e.createElementVNode("aside", hv, [
          e.createElementVNode(
            "div",
            Ev,
            e.toDisplayString(i.$t("核算记录")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(z.value, (b) => (e.openBlock(), e.createElementBlock("li", {
                key: b.id,
                class: e.normalizeClass({ active: b.id === C.value }),
                onClick: (f) => F(b.id)
              }, [
                e.createElementVNode("div", fv, [
                  e.createElementVNode(
                    "strong",
                    null,
                    e.toDisplayString(b.period),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    $v,
                    e.toDisplayString(i.$t("{n} 个产品", { n: b.result.length })),
                    1
                    /* TEXT */
                  )
                ]),
                e.createElementVNode("div", bv, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(r.fmtDateTime)(b.createdAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: e.withModifiers((f) => Y(b.id), ["stop"])
                  }, e.toDisplayString(i.$t("删除")), 9, Dv)
                ])
              ], 10, kv))),
              128
              /* KEYED_FRAGMENT */
            )),
            z.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              Sv,
              e.toDisplayString(i.$t("还没有核算记录")),
              1
              /* TEXT */
            ))
          ]),
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn sm ghost",
            onClick: O
          }, [
            A[10] || (A[10] = e.createElementVNode(
              "i",
              { class: "ri-add-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(i.$t("新核算")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("section", _v, [
          e.createVNode(re, {
            title: i.$t("成本核算"),
            metas: I,
            runtime: W.value,
            "current-key": P.value,
            onJump: D
          }, null, 8, ["title", "runtime", "current-key"]),
          e.createElementVNode("div", Bv, [
            e.createVNode(G, {
              "step-key": "products",
              index: 0,
              title: I[0].title,
              hint: I[0].hint,
              runtime: W.value.products
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", wv, [
                  e.createElementVNode("label", Cv, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(i.$t("核算期间")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": A[0] || (A[0] = (b) => S.value = b),
                        type: "month"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelText, S.value]
                    ])
                  ])
                ]),
                e.createVNode(se, {
                  compact: "",
                  kind: "excel",
                  multi: !1,
                  label: i.$t("导入产量表"),
                  hint: i.$t("需要：产品、完工数量；可选：工时、机时"),
                  disabled: !!c.value,
                  onPicked: A[1] || (A[1] = (b) => X(b[0]))
                }, null, 8, ["label", "hint", "disabled"]),
                e.createElementVNode("div", Tv, [
                  e.createElementVNode("table", Mv, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(i.$t("产品")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Lv,
                          e.toDisplayString(i.$t("完工数量")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Uv,
                          e.toDisplayString(i.$t("工时")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Pv,
                          e.toDisplayString(i.$t("机时")),
                          1
                          /* TEXT */
                        ),
                        A[11] || (A[11] = e.createElementVNode(
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
                        e.renderList(p.value, (b, f) => (e.openBlock(), e.createElementBlock("tr", { key: f }, [
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (n) => b.name = n,
                              type: "text"
                            }, null, 8, Fv), [
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
                              "onUpdate:modelValue": (n) => b.output = n,
                              type: "number",
                              min: "0"
                            }, null, 8, zv), [
                              [
                                e.vModelText,
                                b.output,
                                void 0,
                                { number: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (n) => b.hours = n,
                              type: "number",
                              min: "0"
                            }, null, 8, Av), [
                              [
                                e.vModelText,
                                b.hours,
                                void 0,
                                { number: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (n) => b.machineHours = n,
                              type: "number",
                              min: "0"
                            }, null, 8, xv), [
                              [
                                e.vModelText,
                                b.machineHours,
                                void 0,
                                { number: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (n) => p.value.splice(f, 1)
                            }, e.toDisplayString(i.$t("删除")), 9, Rv)
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      p.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", Iv, [
                        e.createElementVNode(
                          "td",
                          Ov,
                          e.toDisplayString(i.$t("导入或手工添加产品")),
                          1
                          /* TEXT */
                        )
                      ]))
                    ])
                  ])
                ]),
                e.createElementVNode("div", Kv, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: A[2] || (A[2] = (b) => p.value.push({ name: "", output: 0, hours: 0, machineHours: 0 }))
                  }, [
                    A[12] || (A[12] = e.createElementVNode(
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
                  ])
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "materials",
              index: 1,
              title: I[1].title,
              hint: I[1].hint,
              runtime: W.value.materials
            }, {
              default: e.withCtx(() => [
                e.createVNode(se, {
                  compact: "",
                  kind: "excel",
                  multi: !1,
                  label: i.$t("导入领料表"),
                  hint: i.$t("需要：产品、材料、数量（或金额）；可选：单价、BOM 单耗"),
                  disabled: !!c.value,
                  onPicked: A[3] || (A[3] = (b) => B(b[0]))
                }, null, 8, ["label", "hint", "disabled"]),
                e.createElementVNode("div", qv, [
                  e.createElementVNode("table", jv, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(i.$t("产品")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(i.$t("材料")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Wv,
                          e.toDisplayString(i.$t("数量")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Jv,
                          e.toDisplayString(i.$t("单价")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          Yv,
                          e.toDisplayString(i.$t("BOM 单耗")),
                          1
                          /* TEXT */
                        ),
                        A[13] || (A[13] = e.createElementVNode(
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
                        e.renderList(w.value, (b, f) => (e.openBlock(), e.createElementBlock("tr", { key: f }, [
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (n) => b.product = n,
                              type: "text"
                            }, null, 8, Hv), [
                              [
                                e.vModelText,
                                b.product,
                                void 0,
                                { trim: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (n) => b.material = n,
                              type: "text"
                            }, null, 8, Qv), [
                              [
                                e.vModelText,
                                b.material,
                                void 0,
                                { trim: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (n) => b.qty = n,
                              type: "number",
                              min: "0"
                            }, null, 8, Gv), [
                              [
                                e.vModelText,
                                b.qty,
                                void 0,
                                { number: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (n) => b.unitPrice = n,
                              type: "number",
                              min: "0"
                            }, null, 8, Xv), [
                              [
                                e.vModelText,
                                b.unitPrice,
                                void 0,
                                { number: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.withDirectives(e.createElementVNode("input", {
                              "onUpdate:modelValue": (n) => b.stdPerUnit = n,
                              type: "number",
                              min: "0"
                            }, null, 8, Zv), [
                              [
                                e.vModelText,
                                b.stdPerUnit,
                                void 0,
                                { number: !0 }
                              ]
                            ])
                          ]),
                          e.createElementVNode("td", null, [
                            e.createElementVNode("button", {
                              type: "button",
                              class: "ss-link",
                              onClick: (n) => w.value.splice(f, 1)
                            }, e.toDisplayString(i.$t("删除")), 9, ey)
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      w.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock("tr", ty, [
                        e.createElementVNode(
                          "td",
                          ly,
                          e.toDisplayString(i.$t("导入或手工添加领料记录")),
                          1
                          /* TEXT */
                        )
                      ]))
                    ])
                  ])
                ]),
                e.createElementVNode("div", ny, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: A[4] || (A[4] = (b) => w.value.push({ product: "", material: "", qty: 0, unitPrice: 0 }))
                  }, [
                    A[14] || (A[14] = e.createElementVNode(
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
                  ])
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "overhead",
              index: 2,
              title: I[2].title,
              hint: I[2].hint,
              runtime: W.value.overhead
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", oy, [
                  e.createElementVNode("label", ay, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(i.$t("直接人工总额")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": A[5] || (A[5] = (b) => j.value = b),
                        type: "number",
                        min: "0"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [
                        e.vModelText,
                        j.value,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ]),
                  e.createElementVNode("label", sy, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(i.$t("制造费用分配标准")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "select",
                      {
                        "onUpdate:modelValue": A[6] || (A[6] = (b) => v.value = b)
                      },
                      [
                        e.createElementVNode(
                          "option",
                          iy,
                          e.toDisplayString(i.$t("生产工时")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "option",
                          ry,
                          e.toDisplayString(i.$t("机器工时")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "option",
                          dy,
                          e.toDisplayString(i.$t("产量")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "option",
                          cy,
                          e.toDisplayString(i.$t("直接材料成本")),
                          1
                          /* TEXT */
                        )
                      ],
                      512
                      /* NEED_PATCH */
                    ), [
                      [e.vModelSelect, v.value]
                    ])
                  ]),
                  e.createElementVNode("label", uy, [
                    e.createElementVNode(
                      "span",
                      null,
                      e.toDisplayString(i.$t("损耗容差（%）")),
                      1
                      /* TEXT */
                    ),
                    e.withDirectives(e.createElementVNode(
                      "input",
                      {
                        "onUpdate:modelValue": A[7] || (A[7] = (b) => $.value = b),
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
                        $.value,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])
                ]),
                e.createElementVNode(
                  "div",
                  my,
                  e.toDisplayString(i.$t("制造费用明细")),
                  1
                  /* TEXT */
                ),
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(s.value, (b, f) => (e.openBlock(), e.createElementBlock("div", {
                    key: f,
                    class: "fa-row"
                  }, [
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (n) => b.item = n,
                      type: "text",
                      placeholder: i.$t("项目（如电费、折旧）")
                    }, null, 8, py), [
                      [
                        e.vModelText,
                        b.item,
                        void 0,
                        { trim: !0 }
                      ]
                    ]),
                    e.withDirectives(e.createElementVNode("input", {
                      "onUpdate:modelValue": (n) => b.amount = n,
                      type: "number",
                      min: "0",
                      placeholder: i.$t("金额")
                    }, null, 8, vy), [
                      [
                        e.vModelText,
                        b.amount,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    e.createElementVNode("button", {
                      type: "button",
                      class: "ss-link",
                      onClick: (n) => s.value.splice(f, 1)
                    }, e.toDisplayString(i.$t("删除")), 9, yy)
                  ]))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                e.createElementVNode("div", Vy, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn sm ghost",
                    onClick: A[8] || (A[8] = (b) => s.value.push({ item: "", amount: 0 }))
                  }, [
                    A[15] || (A[15] = e.createElementVNode(
                      "i",
                      { class: "ri-add-line" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      e.toDisplayString(i.$t("加一项")),
                      1
                      /* TEXT */
                    )
                  ]),
                  e.createElementVNode(
                    "span",
                    Ny,
                    e.toDisplayString(i.$t("制造费用合计 {p0}", { p0: e.unref(r.fmtMoney)(g.value) })),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "compute",
              index: 3,
              title: I[3].title,
              hint: I[3].hint,
              runtime: W.value.compute
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", gy, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!c.value || !p.value.length || !S.value,
                    onClick: N
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(c.value === "compute" ? "ri-loader-4-line spin" : "ri-calculator-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(i.$t("计算成本")),
                      1
                      /* TEXT */
                    )
                  ], 8, hy),
                  e.createElementVNode(
                    "span",
                    Ey,
                    e.toDisplayString(i.$t("分摊按分计算，尾差放在最后一个产品上")),
                    1
                    /* TEXT */
                  )
                ]),
                d.value ? (e.openBlock(), e.createElementBlock(
                  e.Fragment,
                  { key: 0 },
                  [
                    e.createElementVNode("div", ky, [
                      e.createElementVNode("table", fy, [
                        e.createElementVNode("thead", null, [
                          e.createElementVNode("tr", null, [
                            e.createElementVNode(
                              "th",
                              null,
                              e.toDisplayString(i.$t("产品")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              $y,
                              e.toDisplayString(i.$t("完工数量")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              by,
                              e.toDisplayString(i.$t("直接材料")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Dy,
                              e.toDisplayString(i.$t("直接人工")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Sy,
                              e.toDisplayString(i.$t("制造费用")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              _y,
                              e.toDisplayString(i.$t("总成本")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              By,
                              e.toDisplayString(i.$t("单位成本")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              wy,
                              e.toDisplayString(i.$t("上期单位成本")),
                              1
                              /* TEXT */
                            ),
                            e.createElementVNode(
                              "th",
                              Cy,
                              e.toDisplayString(i.$t("变动")),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        e.createElementVNode("tbody", null, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(d.value.result, (b) => (e.openBlock(), e.createElementBlock("tr", {
                              key: b.product
                            }, [
                              e.createElementVNode(
                                "td",
                                null,
                                e.toDisplayString(b.product),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Ty,
                                e.toDisplayString(b.output),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                My,
                                e.toDisplayString(e.unref(r.fmtMoney)(b.material)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Ly,
                                e.toDisplayString(e.unref(r.fmtMoney)(b.labor)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Uy,
                                e.toDisplayString(e.unref(r.fmtMoney)(b.overhead)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Py,
                                e.toDisplayString(e.unref(r.fmtMoney)(b.total)),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode("td", Fy, [
                                e.createElementVNode(
                                  "strong",
                                  null,
                                  e.toDisplayString(e.unref(r.fmtMoney)(b.unitCost)),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              e.createElementVNode(
                                "td",
                                zy,
                                e.toDisplayString(b.priorUnitCost != null ? e.unref(r.fmtMoney)(b.priorUnitCost) : "-"),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "td",
                                Ay,
                                e.toDisplayString(b.change != null ? e.unref(r.fmtPct)(b.change) : "-"),
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
                    e.createElementVNode(
                      "div",
                      xy,
                      e.toDisplayString(i.$t("分配过程")),
                      1
                      /* TEXT */
                    ),
                    e.createElementVNode("ul", Ry, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(d.value.calc, (b, f) => (e.openBlock(), e.createElementBlock("li", { key: f }, [
                          e.createElementVNode(
                            "strong",
                            null,
                            e.toDisplayString(b.label),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "span",
                            null,
                            e.toDisplayString(b.formula),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "em",
                            null,
                            e.toDisplayString(b.value),
                            1
                            /* TEXT */
                          )
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    d.value.losses.length ? (e.openBlock(), e.createElementBlock("div", Iy, [
                      e.createElementVNode(
                        "div",
                        Oy,
                        e.toDisplayString(i.$t("异常损耗与波动")),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("ul", Ky, [
                        (e.openBlock(!0), e.createElementBlock(
                          e.Fragment,
                          null,
                          e.renderList(d.value.losses, (b, f) => (e.openBlock(), e.createElementBlock("li", { key: f }, [
                            e.createElementVNode(
                              "span",
                              {
                                class: e.normalizeClass(["ss-chip", e.unref(ve)(b.level)])
                              },
                              e.toDisplayString(e.unref(pe)(b.level)),
                              3
                              /* TEXT, CLASS */
                            ),
                            e.createElementVNode("div", null, [
                              e.createElementVNode(
                                "strong",
                                null,
                                e.toDisplayString(b.title),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "p",
                                qy,
                                e.toDisplayString(b.detail),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "p",
                                jy,
                                e.toDisplayString(b.suggestion),
                                1
                                /* TEXT */
                              )
                            ])
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])) : (e.openBlock(), e.createElementBlock("p", Wy, [
                      A[16] || (A[16] = e.createElementVNode(
                        "i",
                        { class: "ri-check-line" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      e.createTextVNode(
                        e.toDisplayString(i.$t("没有发现超耗或大幅波动")),
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
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "commentary",
              index: 4,
              title: I[4].title,
              hint: I[4].hint,
              runtime: W.value.commentary
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Jy, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!c.value || !d.value,
                    onClick: k
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(c.value === "commentary" ? "ri-loader-4-line spin" : "ri-quill-pen-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(d.value?.commentary ? i.$t("重新分析") : i.$t("写成本分析")),
                      1
                      /* TEXT */
                    )
                  ], 8, Yy),
                  d.value?.model ? (e.openBlock(), e.createElementBlock(
                    "span",
                    Hy,
                    e.toDisplayString(i.$t("由 {p0} 写作", { p0: e.unref(me)(d.value.model) })),
                    1
                    /* TEXT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                d.value?.commentary ? (e.openBlock(), e.createElementBlock(
                  "p",
                  Qy,
                  e.toDisplayString(d.value.commentary),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "export",
              index: 5,
              title: I[5].title,
              hint: I[5].hint,
              runtime: W.value.export
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", Gy, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!c.value || !d.value,
                    onClick: U
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(c.value === "export" ? "ri-loader-4-line spin" : "ri-file-excel-2-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(i.$t("导出成本计算单")),
                      1
                      /* TEXT */
                    )
                  ], 8, Xy),
                  d.value?.exportPath ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode(
                        "code",
                        Zy,
                        e.toDisplayString(d.value.exportPath),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost",
                        onClick: A[9] || (A[9] = (b) => E(d.value.exportPath))
                      }, [
                        A[17] || (A[17] = e.createElementVNode(
                          "i",
                          { class: "ri-external-link-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(i.$t("打开")),
                          1
                          /* TEXT */
                        )
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
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
}), tV = /* @__PURE__ */ oe(eV, [["__scopeId", "data-v-09d3da93"]]), lV = { class: "ss-module" }, nV = { class: "fa-split" }, oV = { class: "fa-list" }, aV = { class: "ss-subhead" }, sV = ["onClick"], iV = { class: "fa-list__top" }, rV = ["title"], dV = { class: "fa-list__meta" }, cV = ["onClick"], uV = {
  key: 0,
  class: "ss-empty"
}, mV = { class: "fa-detail" }, pV = { class: "ss-steps" }, vV = { class: "fa-check" }, yV = {
  key: 0,
  class: "ss-muted"
}, VV = {
  key: 0,
  class: "ss-table-wrap"
}, NV = { class: "ss-table" }, gV = { class: "fa-wrap" }, hV = { class: "fa-wrap" }, EV = { key: 0 }, kV = {
  key: 1,
  class: "ss-chip warn"
}, fV = {
  key: 1,
  class: "ss-muted"
}, $V = {
  key: 2,
  class: "ss-muted"
}, bV = {
  key: 0,
  class: "fa-findings"
}, DV = { class: "fa-pre" }, SV = {
  key: 0,
  class: "fa-suggest"
}, _V = {
  key: 1,
  class: "ss-note ok"
}, BV = {
  key: 0,
  class: "fa-calc"
}, wV = { key: 0 }, CV = {
  key: 1,
  class: "ss-muted"
}, TV = { class: "ss-actions" }, MV = ["disabled"], LV = { class: "fa-path" }, UV = { class: "ss-muted" }, PV = /* @__PURE__ */ e.defineComponent({
  __name: "ContractTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = e.computed(() => te.value?.data.contracts || []), C = e.ref(""), d = e.computed(() => z.value.find((P) => P.id === C.value) || null), S = e.ref(!0), p = e.ref(""), w = e.ref({});
    e.watch(z, (P) => {
      !C.value && P.length && (C.value = P[0].id);
    }, { immediate: !0 }), e.watch(C, () => {
      w.value = {};
    });
    const j = (P) => P.findings.filter((F) => F.level === "high").length, s = [
      { key: "upload", title: l.t("上传合同"), hint: l.t("读取全文，识别合同类型与金额") },
      { key: "clauses", title: l.t("涉税条款"), hint: l.t("开票时间、税率、付款节点、价款、发票类型") },
      { key: "risks", title: l.t("风险提示"), hint: l.t("固定规则 + 模型，均附原文引用") },
      { key: "stamp", title: l.t("印花税测算"), hint: l.t("按《印花税法》税目税率") },
      { key: "export", title: l.t("导出审核意见"), hint: l.t("Markdown 审核意见") }
    ], v = e.computed(() => {
      const P = d.value, F = (O, L, X) => p.value === O ? { state: "running" } : w.value[O] ? { state: "failed", error: w.value[O] } : L ? { state: "done", summary: X } : { state: "todo" };
      return {
        upload: F("upload", !!P, P?.contractType),
        clauses: F("clauses", !!P, P ? l.t("{n} 条", { n: P.clauses.length }) : ""),
        risks: F("risks", !!P, P ? l.t("{n} 项，其中高风险 {m} 项", { n: P.findings.length, m: j(P) }) : ""),
        stamp: F("stamp", !!P, P?.stampDuty ? r.fmtMoney(P.stampDuty[P.stampDuty.length - 1].value) : ""),
        export: F("export", !!P?.exportPath)
      };
    }), $ = e.computed(() => s.find((P) => v.value[P.key].state !== "done")?.key || "export");
    async function g(P) {
      p.value = "upload", w.value = {}, r.scrollToStep("upload");
      try {
        const F = await K("contract.review", { path: P, useModel: S.value });
        await Z(), C.value = F.id, r.scrollToStep("risks");
      } catch (F) {
        w.value = { upload: r.errorMessage(F) };
      } finally {
        p.value = "";
      }
    }
    async function c() {
      p.value = "export", w.value = { ...w.value, export: "" };
      try {
        await K("contract.export", { id: C.value }), await Z();
      } catch (P) {
        w.value = { ...w.value, export: r.errorMessage(P) };
      } finally {
        p.value = "";
      }
    }
    async function T(P) {
      if (window.confirm(l.t("删除这条审核记录？")))
        try {
          await K("contract.remove", { id: P }), C.value === P && (C.value = ""), await Z();
        } catch (F) {
          x.error(r.errorMessage(F));
        }
    }
    function I(P) {
      ie(P).catch((F) => x.error(r.errorMessage(F)));
    }
    function W(P) {
      r.scrollToStep(P);
    }
    return (P, F) => (e.openBlock(), e.createElementBlock("div", lV, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createElementVNode("div", nV, [
        e.createElementVNode("aside", oV, [
          e.createElementVNode(
            "div",
            aV,
            e.toDisplayString(P.$t("审核记录")),
            1
            /* TEXT */
          ),
          e.createElementVNode("ul", null, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(z.value, (O) => (e.openBlock(), e.createElementBlock("li", {
                key: O.id,
                class: e.normalizeClass({ active: O.id === C.value }),
                onClick: (L) => C.value = O.id
              }, [
                e.createElementVNode("div", iV, [
                  e.createElementVNode("strong", {
                    class: "fa-ellipsis",
                    title: O.fileName
                  }, e.toDisplayString(O.fileName), 9, rV),
                  e.createElementVNode(
                    "span",
                    {
                      class: e.normalizeClass(["ss-chip", j(O) ? "bad" : O.findings.length ? "warn" : "ok"])
                    },
                    e.toDisplayString(P.$t("{n} 项", { n: O.findings.length })),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                e.createElementVNode("div", dV, [
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(O.contractType),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(e.unref(r.fmtDateTime)(O.createdAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: e.withModifiers((L) => T(O.id), ["stop"])
                  }, e.toDisplayString(P.$t("删除")), 9, cV)
                ])
              ], 10, sV))),
              128
              /* KEYED_FRAGMENT */
            )),
            z.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
              "li",
              uV,
              e.toDisplayString(P.$t("还没有审核过合同")),
              1
              /* TEXT */
            ))
          ])
        ]),
        e.createElementVNode("section", mV, [
          e.createVNode(re, {
            title: P.$t("合同财税审核"),
            metas: s,
            runtime: v.value,
            "current-key": $.value,
            onJump: W
          }, null, 8, ["title", "runtime", "current-key"]),
          e.createElementVNode("div", pV, [
            e.createVNode(G, {
              "step-key": "upload",
              index: 0,
              title: s[0].title,
              hint: s[0].hint,
              runtime: v.value.upload
            }, {
              default: e.withCtx(() => [
                e.createVNode(se, {
                  kind: "contract",
                  multi: !1,
                  label: P.$t("上传采购 / 销售合同"),
                  hint: P.$t("支持 PDF、Word、文本、图片（图片走本机 OCR）"),
                  disabled: !!p.value,
                  onPicked: F[0] || (F[0] = (O) => g(O[0]))
                }, null, 8, ["label", "hint", "disabled"]),
                e.createElementVNode("label", vV, [
                  e.withDirectives(e.createElementVNode(
                    "input",
                    {
                      "onUpdate:modelValue": F[1] || (F[1] = (O) => S.value = O),
                      type: "checkbox"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [e.vModelCheckbox, S.value]
                  ]),
                  e.createElementVNode(
                    "span",
                    null,
                    e.toDisplayString(P.$t("用模型逐条审核涉税条款（引用会回原文核对，核不上的丢弃）")),
                    1
                    /* TEXT */
                  )
                ]),
                d.value ? (e.openBlock(), e.createElementBlock(
                  "p",
                  yV,
                  e.toDisplayString(P.$t("{p0}：{p1}，合同金额 {p2}，全文 {n} 字", { p0: d.value.fileName, p1: d.value.contractType, p2: d.value.amount != null ? e.unref(r.fmtMoney)(d.value.amount) : P.$t("未识别"), n: d.value.textLength })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "clauses",
              index: 1,
              title: s[1].title,
              hint: s[1].hint,
              runtime: v.value.clauses
            }, {
              default: e.withCtx(() => [
                d.value?.clauses.length ? (e.openBlock(), e.createElementBlock("div", VV, [
                  e.createElementVNode("table", NV, [
                    e.createElementVNode("thead", null, [
                      e.createElementVNode("tr", null, [
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(P.$t("条款")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(P.$t("约定内容")),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "th",
                          null,
                          e.toDisplayString(P.$t("原文")),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    e.createElementVNode("tbody", null, [
                      (e.openBlock(!0), e.createElementBlock(
                        e.Fragment,
                        null,
                        e.renderList(d.value.clauses, (O, L) => (e.openBlock(), e.createElementBlock("tr", { key: L }, [
                          e.createElementVNode(
                            "td",
                            null,
                            e.toDisplayString(O.type),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode(
                            "td",
                            gV,
                            e.toDisplayString(O.value),
                            1
                            /* TEXT */
                          ),
                          e.createElementVNode("td", hV, [
                            O.quote ? (e.openBlock(), e.createElementBlock(
                              "span",
                              EV,
                              e.toDisplayString(P.$t("「{p0}」", { p0: O.quote })),
                              1
                              /* TEXT */
                            )) : e.createCommentVNode("v-if", !0),
                            O.verified ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                              "span",
                              kV,
                              e.toDisplayString(P.$t("未在原文核实")),
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
                ])) : d.value ? (e.openBlock(), e.createElementBlock(
                  "p",
                  fV,
                  e.toDisplayString(P.$t("没有抽到涉税条款")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0),
                d.value?.model ? (e.openBlock(), e.createElementBlock(
                  "p",
                  $V,
                  e.toDisplayString(P.$t("由 {p0} 抽取", { p0: e.unref(me)(d.value.model) })),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "risks",
              index: 2,
              title: s[2].title,
              hint: s[2].hint,
              runtime: v.value.risks
            }, {
              default: e.withCtx(() => [
                d.value?.findings.length ? (e.openBlock(), e.createElementBlock("ul", bV, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(d.value.findings, (O, L) => (e.openBlock(), e.createElementBlock("li", { key: L }, [
                      e.createElementVNode(
                        "span",
                        {
                          class: e.normalizeClass(["ss-chip", e.unref(ve)(O.level)])
                        },
                        e.toDisplayString(e.unref(pe)(O.level)),
                        3
                        /* TEXT, CLASS */
                      ),
                      e.createElementVNode("div", null, [
                        e.createElementVNode(
                          "strong",
                          null,
                          e.toDisplayString(O.title),
                          1
                          /* TEXT */
                        ),
                        e.createElementVNode(
                          "p",
                          DV,
                          e.toDisplayString(O.detail),
                          1
                          /* TEXT */
                        ),
                        O.suggestion ? (e.openBlock(), e.createElementBlock("p", SV, [
                          F[3] || (F[3] = e.createElementVNode(
                            "i",
                            { class: "ri-lightbulb-line" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          e.createTextVNode(
                            e.toDisplayString(O.suggestion),
                            1
                            /* TEXT */
                          )
                        ])) : e.createCommentVNode("v-if", !0)
                      ])
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : d.value ? (e.openBlock(), e.createElementBlock("p", _V, [
                  F[4] || (F[4] = e.createElementVNode(
                    "i",
                    { class: "ri-check-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(P.$t("没有发现财税风险条款")),
                    1
                    /* TEXT */
                  )
                ])) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "stamp",
              index: 3,
              title: s[3].title,
              hint: s[3].hint,
              runtime: v.value.stamp
            }, {
              default: e.withCtx(() => [
                d.value?.stampDuty ? (e.openBlock(), e.createElementBlock("ul", BV, [
                  (e.openBlock(!0), e.createElementBlock(
                    e.Fragment,
                    null,
                    e.renderList(d.value.stampDuty, (O, L) => (e.openBlock(), e.createElementBlock("li", { key: L }, [
                      e.createElementVNode(
                        "strong",
                        null,
                        e.toDisplayString(O.label),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode(
                        "span",
                        null,
                        e.toDisplayString(O.formula),
                        1
                        /* TEXT */
                      ),
                      O.value > 1 ? (e.openBlock(), e.createElementBlock(
                        "em",
                        wV,
                        e.toDisplayString(e.unref(r.fmtMoney)(O.value)),
                        1
                        /* TEXT */
                      )) : e.createCommentVNode("v-if", !0)
                    ]))),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : d.value ? (e.openBlock(), e.createElementBlock(
                  "p",
                  CV,
                  e.toDisplayString(P.$t("没有识别出合同类型或金额，无法测算印花税")),
                  1
                  /* TEXT */
                )) : e.createCommentVNode("v-if", !0)
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"]),
            e.createVNode(G, {
              "step-key": "export",
              index: 4,
              title: s[4].title,
              hint: s[4].hint,
              runtime: v.value.export
            }, {
              default: e.withCtx(() => [
                e.createElementVNode("div", TV, [
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-btn primary",
                    disabled: !!p.value || !d.value,
                    onClick: c
                  }, [
                    e.createElementVNode(
                      "i",
                      {
                        class: e.normalizeClass(p.value === "export" ? "ri-loader-4-line spin" : "ri-markdown-line")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    e.createTextVNode(
                      e.toDisplayString(P.$t("导出审核意见")),
                      1
                      /* TEXT */
                    )
                  ], 8, MV),
                  d.value?.exportPath ? (e.openBlock(), e.createElementBlock(
                    e.Fragment,
                    { key: 0 },
                    [
                      e.createElementVNode(
                        "code",
                        LV,
                        e.toDisplayString(d.value.exportPath),
                        1
                        /* TEXT */
                      ),
                      e.createElementVNode("button", {
                        type: "button",
                        class: "ss-btn sm ghost",
                        onClick: F[2] || (F[2] = (O) => I(d.value.exportPath))
                      }, [
                        F[5] || (F[5] = e.createElementVNode(
                          "i",
                          { class: "ri-external-link-line" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        e.createTextVNode(
                          e.toDisplayString(P.$t("打开")),
                          1
                          /* TEXT */
                        )
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : e.createCommentVNode("v-if", !0)
                ]),
                e.createElementVNode(
                  "p",
                  UV,
                  e.toDisplayString(P.$t("审核意见仅供参考，需财务 / 法务人员复核确认。")),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "hint", "runtime"])
          ])
        ])
      ])
    ]));
  }
}), FV = /* @__PURE__ */ oe(PV, [["__scopeId", "data-v-c7557530"]]), zV = { class: "ss-module" }, AV = { class: "ss-steps" }, xV = { class: "ss-note info" }, RV = {
  key: 0,
  class: "fa-policies"
}, IV = { class: "fa-ellipsis" }, OV = { class: "ss-muted" }, KV = ["onClick"], qV = {
  key: 1,
  class: "ss-muted"
}, jV = { class: "fa-bubble" }, WV = { class: "fa-pre" }, JV = {
  key: 0,
  class: "fa-msg__meta"
}, YV = { key: 0 }, HV = ["onClick"], QV = {
  key: 1,
  class: "fa-cites"
}, GV = { class: "ss-chip" }, XV = {
  key: 0,
  class: "ss-muted"
}, ZV = { class: "fa-pre ss-muted" }, eN = {
  key: 0,
  class: "ss-empty"
}, tN = {
  key: 1,
  class: "fa-msg assistant"
}, lN = { class: "fa-bubble" }, nN = { class: "fa-quick" }, oN = ["disabled", "onClick"], aN = { class: "fa-input" }, sN = ["placeholder", "disabled"], iN = { class: "fa-input__actions" }, rN = ["disabled"], dN = ["disabled"], cN = {
  key: 0,
  class: "fa-pre fa-notes"
}, uN = {
  key: 1,
  class: "ss-muted"
}, mN = { class: "fa-remember" }, pN = ["placeholder"], vN = ["disabled"], yN = /* @__PURE__ */ e.defineComponent({
  __name: "QaTab",
  props: {
    meta: {},
    focus: {}
  },
  emits: ["goto"],
  setup(q) {
    const x = ne.useNotificationStore(), z = e.computed(() => te.value?.data.policies || []), C = e.computed(() => te.value?.data.qa || []), d = e.computed(() => te.value?.ledgers.find((k) => k.id === te.value?.activeLedgerId) || null), S = e.ref(""), p = e.ref(""), w = e.ref(""), j = e.ref({}), s = e.reactive({}), v = e.ref(null), $ = [
      l.t("小规模纳税人季度免征额是多少"),
      l.t("员工个税累计预扣怎么算"),
      l.t("餐饮发票能不能抵扣进项"),
      l.t("业务招待费税前扣除标准")
    ], g = [
      { key: "sources", title: l.t("知识来源"), hint: l.t("内置税法 / 会计准则要点 + 企业内部财务制度") },
      { key: "ask", title: l.t("提问"), hint: l.t("按资料作答并标明依据，记住同一账套的上下文") },
      { key: "memory", title: l.t("账套记忆"), hint: l.t("记下这个账套的要点，分析和问答都会参考") }
    ], c = e.computed(() => {
      const k = (Y, E, D) => w.value === Y ? { state: "running" } : j.value[Y] ? { state: "failed", error: j.value[Y] } : E ? { state: "done", summary: D } : { state: "todo" }, U = C.value.filter((Y) => Y.role === "user").length;
      return {
        sources: k("sources", !0, z.value.length ? l.t("内置政策 + {n} 份企业制度", { n: z.value.length }) : l.t("内置政策库")),
        ask: k("ask", U > 0, l.t("已问 {n} 个问题", { n: U })),
        memory: k("memory", !!d.value?.notes)
      };
    }), T = e.computed(() => g.find((k) => c.value[k.key].state !== "done")?.key || "ask");
    e.watch(() => C.value.length, async () => {
      await e.nextTick(), v.value && (v.value.scrollTop = v.value.scrollHeight);
    }, { immediate: !0 });
    async function I(k, U) {
      w.value = k, j.value = { ...j.value, [k]: "" };
      try {
        return await U(), await Z(), !0;
      } catch (Y) {
        return j.value = { ...j.value, [k]: r.errorMessage(Y) }, !1;
      } finally {
        w.value = "";
      }
    }
    function W(k) {
      I("sources", () => K("policy.import", { paths: k }));
    }
    async function P(k) {
      if (window.confirm(l.t("删除这份制度？")))
        try {
          await K("policy.remove", { id: k }), await Z();
        } catch (U) {
          x.error(r.errorMessage(U));
        }
    }
    async function F(k) {
      const U = k.trim();
      if (!U || w.value) return;
      S.value = "", await I("ask", () => K("qa.ask", { question: U })) || (S.value = U);
    }
    function O(k) {
      (k.ctrlKey || k.metaKey) && (k.preventDefault(), F(S.value));
    }
    async function L() {
      window.confirm(l.t("清空本账套的问答记录？")) && await I("ask", () => K("qa.clear"));
    }
    async function X() {
      if (!p.value) return;
      const k = p.value;
      await I("memory", () => K("ledger.remember", { text: k })) && (p.value = "");
    }
    function B(k) {
      s[k] = !s[k];
    }
    function N(k) {
      r.scrollToStep(k);
    }
    return (k, U) => (e.openBlock(), e.createElementBlock("div", zV, [
      e.createVNode(de, { meta: q.meta }, null, 8, ["meta"]),
      e.createVNode(re, {
        title: k.$t("财税问答"),
        metas: g,
        runtime: c.value,
        "current-key": T.value,
        onJump: N
      }, null, 8, ["title", "runtime", "current-key"]),
      e.createElementVNode("div", AV, [
        e.createVNode(G, {
          "step-key": "sources",
          index: 0,
          title: g[0].title,
          hint: g[0].hint,
          runtime: c.value.sources
        }, {
          default: e.withCtx(() => [
            e.createElementVNode("p", xV, [
              U[3] || (U[3] = e.createElementVNode(
                "i",
                { class: "ri-book-2-line" },
                null,
                -1
                /* CACHED */
              )),
              e.createTextVNode(
                e.toDisplayString(k.$t("内置政策库：约 33 条常用财税要点（小规模优惠、六税两费、小微所得税、个税税率与专项附加、进项抵扣、税前扣除、发票、印花税、申报期限、会计准则等），整理截至 2025 年底，含 2026 年施行的《增值税法》。政策有执行期限，执行前请核对最新文件。")),
                1
                /* TEXT */
              )
            ]),
            e.createVNode(se, {
              kind: "policy",
              label: k.$t("导入企业财务制度"),
              hint: k.$t("报销制度、费用标准、审批流程等（PDF / Word / 文本），问答时一并检索"),
              disabled: !!w.value,
              onPicked: W
            }, null, 8, ["label", "hint", "disabled"]),
            z.value.length ? (e.openBlock(), e.createElementBlock("ul", RV, [
              (e.openBlock(!0), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList(z.value, (Y) => (e.openBlock(), e.createElementBlock("li", {
                  key: Y.id
                }, [
                  U[4] || (U[4] = e.createElementVNode(
                    "i",
                    { class: "ri-file-text-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createElementVNode(
                    "span",
                    IV,
                    e.toDisplayString(Y.fileName),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode(
                    "span",
                    OV,
                    e.toDisplayString(k.$t("{n} 段", { n: Y.chunks })) + " · " + e.toDisplayString(e.unref(r.fmtDateTime)(Y.importedAt)),
                    1
                    /* TEXT */
                  ),
                  e.createElementVNode("button", {
                    type: "button",
                    class: "ss-link",
                    onClick: (E) => P(Y.id)
                  }, e.toDisplayString(k.$t("删除")), 9, KV)
                ]))),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : (e.openBlock(), e.createElementBlock(
              "p",
              qV,
              e.toDisplayString(k.$t("还没有导入企业制度，只按内置政策库回答")),
              1
              /* TEXT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(G, {
          "step-key": "ask",
          index: 1,
          title: g[1].title,
          hint: g[1].hint,
          runtime: c.value.ask
        }, {
          default: e.withCtx(() => [
            e.createElementVNode(
              "div",
              {
                ref_key: "listEl",
                ref: v,
                class: "fa-chat"
              },
              [
                (e.openBlock(!0), e.createElementBlock(
                  e.Fragment,
                  null,
                  e.renderList(C.value, (Y) => (e.openBlock(), e.createElementBlock(
                    "div",
                    {
                      key: Y.id,
                      class: e.normalizeClass(["fa-msg", Y.role])
                    },
                    [
                      e.createElementVNode("div", jV, [
                        e.createElementVNode(
                          "p",
                          WV,
                          e.toDisplayString(Y.text),
                          1
                          /* TEXT */
                        ),
                        Y.role === "assistant" ? (e.openBlock(), e.createElementBlock("div", JV, [
                          Y.model ? (e.openBlock(), e.createElementBlock(
                            "span",
                            YV,
                            e.toDisplayString(k.$t("由 {p0} 回答", { p0: e.unref(me)(Y.model) })),
                            1
                            /* TEXT */
                          )) : e.createCommentVNode("v-if", !0),
                          Y.citations?.length ? (e.openBlock(), e.createElementBlock("button", {
                            key: 1,
                            type: "button",
                            class: "ss-link",
                            onClick: (E) => B(Y.id)
                          }, e.toDisplayString(s[Y.id] ? k.$t("收起依据") : k.$t("查看依据（{n}）", { n: Y.citations.length })), 9, HV)) : e.createCommentVNode("v-if", !0)
                        ])) : e.createCommentVNode("v-if", !0),
                        s[Y.id] && Y.citations?.length ? (e.openBlock(), e.createElementBlock("ol", QV, [
                          (e.openBlock(!0), e.createElementBlock(
                            e.Fragment,
                            null,
                            e.renderList(Y.citations, (E, D) => (e.openBlock(), e.createElementBlock("li", { key: D }, [
                              e.createElementVNode(
                                "strong",
                                null,
                                "[" + e.toDisplayString(D + 1) + "] " + e.toDisplayString(E.title),
                                1
                                /* TEXT */
                              ),
                              e.createElementVNode(
                                "span",
                                GV,
                                e.toDisplayString(E.source === "policy" ? k.$t("企业制度") : k.$t("内置政策")),
                                1
                                /* TEXT */
                              ),
                              E.ref && E.source === "builtin" ? (e.openBlock(), e.createElementBlock(
                                "span",
                                XV,
                                e.toDisplayString(E.ref),
                                1
                                /* TEXT */
                              )) : e.createCommentVNode("v-if", !0),
                              e.createElementVNode(
                                "p",
                                ZV,
                                e.toDisplayString(E.excerpt),
                                1
                                /* TEXT */
                              )
                            ]))),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])) : e.createCommentVNode("v-if", !0)
                      ])
                    ],
                    2
                    /* CLASS */
                  ))),
                  128
                  /* KEYED_FRAGMENT */
                )),
                C.value.length ? e.createCommentVNode("v-if", !0) : (e.openBlock(), e.createElementBlock(
                  "p",
                  eN,
                  e.toDisplayString(k.$t("还没有提问，试试下面的常见问题")),
                  1
                  /* TEXT */
                )),
                w.value === "ask" ? (e.openBlock(), e.createElementBlock("div", tN, [
                  e.createElementVNode("div", lN, [
                    U[5] || (U[5] = e.createElementVNode(
                      "i",
                      { class: "ri-loader-4-line spin" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    e.createTextVNode(
                      " " + e.toDisplayString(k.$t("正在查资料作答…")),
                      1
                      /* TEXT */
                    )
                  ])
                ])) : e.createCommentVNode("v-if", !0)
              ],
              512
              /* NEED_PATCH */
            ),
            e.createElementVNode("div", nN, [
              (e.openBlock(), e.createElementBlock(
                e.Fragment,
                null,
                e.renderList($, (Y) => e.createElementVNode("button", {
                  key: Y,
                  type: "button",
                  class: "ss-btn sm ghost",
                  disabled: !!w.value,
                  onClick: (E) => F(Y)
                }, e.toDisplayString(Y), 9, oN)),
                64
                /* STABLE_FRAGMENT */
              ))
            ]),
            e.createElementVNode("div", aN, [
              e.withDirectives(e.createElementVNode("textarea", {
                "onUpdate:modelValue": U[0] || (U[0] = (Y) => S.value = Y),
                rows: "3",
                placeholder: k.$t("输入财税问题，Ctrl / ⌘ + Enter 发送"),
                disabled: w.value === "ask",
                onKeydown: e.withKeys(O, ["enter"])
              }, null, 40, sN), [
                [e.vModelText, S.value]
              ]),
              e.createElementVNode("div", iN, [
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn primary",
                  disabled: !!w.value || !S.value.trim(),
                  onClick: U[1] || (U[1] = (Y) => F(S.value))
                }, [
                  U[6] || (U[6] = e.createElementVNode(
                    "i",
                    { class: "ri-send-plane-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(k.$t("发送")),
                    1
                    /* TEXT */
                  )
                ], 8, rN),
                e.createElementVNode("button", {
                  type: "button",
                  class: "ss-btn sm ghost",
                  disabled: !!w.value || !C.value.length,
                  onClick: L
                }, [
                  U[7] || (U[7] = e.createElementVNode(
                    "i",
                    { class: "ri-delete-bin-line" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  e.createTextVNode(
                    e.toDisplayString(k.$t("清空")),
                    1
                    /* TEXT */
                  )
                ], 8, dN)
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"]),
        e.createVNode(G, {
          "step-key": "memory",
          index: 2,
          title: g[2].title,
          hint: g[2].hint,
          runtime: c.value.memory
        }, {
          default: e.withCtx(() => [
            d.value?.notes ? (e.openBlock(), e.createElementBlock(
              "p",
              cN,
              e.toDisplayString(d.value.notes),
              1
              /* TEXT */
            )) : (e.openBlock(), e.createElementBlock(
              "p",
              uN,
              e.toDisplayString(k.$t("当前账套还没有记忆要点")),
              1
              /* TEXT */
            )),
            e.createElementVNode("div", mN, [
              e.withDirectives(e.createElementVNode("input", {
                "onUpdate:modelValue": U[2] || (U[2] = (Y) => p.value = Y),
                type: "text",
                placeholder: k.$t("记一条要点，如：本公司差旅住宿一线城市上限 600 元 / 晚"),
                onKeydown: e.withKeys(X, ["enter"])
              }, null, 40, pN), [
                [
                  e.vModelText,
                  p.value,
                  void 0,
                  { trim: !0 }
                ]
              ]),
              e.createElementVNode("button", {
                type: "button",
                class: "ss-btn sm primary",
                disabled: !!w.value || !p.value,
                onClick: X
              }, [
                U[8] || (U[8] = e.createElementVNode(
                  "i",
                  { class: "ri-bookmark-line" },
                  null,
                  -1
                  /* CACHED */
                )),
                e.createTextVNode(
                  e.toDisplayString(k.$t("记住")),
                  1
                  /* TEXT */
                )
              ], 8, vN)
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["title", "hint", "runtime"])
      ])
    ]));
  }
}), VN = /* @__PURE__ */ oe(yN, [["__scopeId", "data-v-810d53ef"]]), NN = { class: "fa-workbench" }, gN = { class: "workbench-header" }, hN = { class: "heading" }, EN = { class: "eyebrow" }, kN = { class: "subtitle" }, fN = { class: "header-actions" }, $N = ["disabled"], bN = {
  key: 0,
  class: "fa-bar"
}, DN = ["title"], SN = ["value", "disabled"], _N = ["value"], BN = { class: "ss-chip" }, wN = { class: "fa-bar__pkg" }, CN = ["value"], TN = ["value"], MN = { class: "fa-bar__rule" }, LN = { class: "no" }, UN = { class: "yes" }, PN = {
  key: 1,
  class: "ss-panel fa-ledger-form"
}, FN = { class: "ss-muted" }, zN = { class: "ss-grid" }, AN = { class: "ss-field" }, xN = { class: "ss-field" }, RN = { class: "ss-field" }, IN = { value: "small" }, ON = { value: "general" }, KN = { class: "ss-field" }, qN = { value: "urban" }, jN = { value: "county" }, WN = { value: "other" }, JN = { class: "ss-field" }, YN = { class: "ss-field ss-check" }, HN = { class: "ss-field" }, QN = { class: "ss-actions" }, GN = ["disabled"], XN = {
  class: "fa-tabs",
  role: "tablist"
}, ZN = ["aria-selected", "title", "onClick"], e1 = {
  key: 0,
  class: "fa-badge"
}, t1 = {
  key: 2,
  class: "ss-note info fa-progress"
}, l1 = {
  key: 3,
  class: "fa-body"
}, n1 = {
  key: 4,
  class: "ss-note danger"
}, o1 = {
  key: 5,
  class: "ss-note"
}, Be = "totalclaw:finance-agent-tab:v1", a1 = /* @__PURE__ */ e.defineComponent({
  __name: "FinanceAgentWorkbenchView",
  setup(q) {
    const x = ne.useNotificationStore(), z = Ee(), C = ["all", "micro", "agency", "manufacturing"], d = {
      voucher: Oa,
      tax: Pi,
      filing: Xr,
      expense: oc,
      reconcile: Ru,
      statements: Cm,
      risk: yp,
      budget: Vv,
      cost: tV,
      contract: FV,
      qa: VN
    };
    function S() {
      try {
        const f = localStorage.getItem(Be);
        return f === "settings" || f === "overview" || z.some((n) => n.key === f) ? f : "voucher";
      } catch {
        return "voucher";
      }
    }
    const p = te, w = e.ref(S()), j = e.reactive({}), s = e.ref(!1), v = e.ref(!1), $ = e.ref(!1), g = e.ref(""), c = e.ref(null), T = e.computed(() => p.value?.ledgers.find((f) => f.id === p.value?.activeLedgerId) || null), I = e.computed(() => {
      const f = ge(p.value?.settings.package || "all");
      return z.filter((n) => f.includes(n.key));
    }), W = e.computed(() => z.find((f) => f.key === w.value) || z[0]), P = e.computed(() => w.value === "settings" || w.value === "overview" ? null : d[w.value]), F = e.computed(() => ue[w.value] || "");
    function O(f) {
      const n = p.value?.data;
      if (!n) return "";
      const h = f === "voucher" ? n.docs.filter((u) => !u.claimId && u.status === "flagged").length : f === "filing" ? n.filings.reduce((u, Q) => u + Q.items.filter((J) => J.status === "pending" || J.status === "handed").length, 0) : f === "expense" ? n.claims.filter((u) => !u.decision && u.items.length).length : f === "risk" ? n.risks[0]?.findings.filter((u) => u.level === "high").length || 0 : f === "budget" && n.budgetAnalyses[0]?.rows.filter((u) => u.level === "over").length || 0;
      return h ? String(h) : "";
    }
    function L(f) {
      w.value = f;
      try {
        localStorage.setItem(Be, f);
      } catch {
      }
    }
    function X(f, n) {
      f !== "overview" && f !== "settings" && !z.some((h) => h.key === f) || (j[f] = { ...n || {}, at: Date.now() }, L(f));
    }
    async function B(f) {
      $.value = !0;
      try {
        await K("ledger.switch", { id: f }), await Z();
      } catch (n) {
        x.error(r.errorMessage(n));
      } finally {
        $.value = !1;
      }
    }
    function N(f) {
      c.value = f ? { id: f.id, name: f.name, taxId: f.taxId, taxpayerType: f.taxpayerType, cityTier: f.cityTier, industry: f.industry, smallLowProfit: f.smallLowProfit, notes: f.notes } : { name: "", taxId: "", taxpayerType: "small", cityTier: "urban", industry: "", smallLowProfit: !0, notes: "" };
    }
    async function k() {
      if (c.value)
        try {
          await K("ledger.save", { input: c.value }), c.value = null, await Z();
        } catch (f) {
          x.error(r.errorMessage(f));
        }
    }
    async function U(f) {
      const n = p.value?.ledgers.find((h) => h.id === f);
      if (!(!n || !window.confirm(l.t("删除账套「{p0}」及其全部票据、凭证和分析记录？此操作不可恢复。", { p0: n.name }))))
        try {
          await K("ledger.remove", { id: f }), c.value = null, await Z();
        } catch (h) {
          x.error(r.errorMessage(h));
        }
    }
    async function Y(f) {
      try {
        await K("settings.patch", { patch: { package: f } }), await Z();
        const n = ge(f);
        w.value !== "overview" && w.value !== "settings" && !n.includes(w.value) && L(n[0]);
      } catch (n) {
        x.error(r.errorMessage(n));
      }
    }
    async function E() {
      v.value = !0;
      try {
        await Promise.all([Z(), Je()]), s.value = !0, g.value = "";
      } catch (f) {
        g.value = r.errorMessage(f);
      } finally {
        v.value = !1;
      }
    }
    let D = null;
    function i() {
      D || (D = setTimeout(() => {
        D = null, Z().catch(() => {
        });
      }, 300));
    }
    const A = {};
    let b = null;
    return e.onMounted(() => {
      E(), b = We((f) => {
        if (f.type === "progress" && f.payload?.key) {
          const n = String(f.payload.key);
          ue[n] = String(f.payload.message || ""), clearTimeout(A[n]), ue[n] && (A[n] = setTimeout(() => {
            ue[n] = "";
          }, 2e4));
          return;
        }
        i();
      });
    }), e.onBeforeUnmount(() => {
      b?.(), b = null, D && clearTimeout(D);
      for (const f of Object.values(A)) clearTimeout(f);
    }), (f, n) => (e.openBlock(), e.createElementBlock("div", NN, [
      e.createElementVNode("header", gN, [
        e.createElementVNode("div", hN, [
          e.createVNode(je),
          n[15] || (n[15] = e.createElementVNode(
            "span",
            { class: "heading-icon" },
            [
              e.createElementVNode("i", { class: "ri-calculator-line" })
            ],
            -1
            /* CACHED */
          )),
          e.createElementVNode("div", null, [
            e.createElementVNode(
              "p",
              EN,
              e.toDisplayString(f.$t("行业工作台")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "h1",
              null,
              e.toDisplayString(f.$t("财务智能体")),
              1
              /* TEXT */
            ),
            e.createElementVNode(
              "p",
              kN,
              e.toDisplayString(f.$t("财务智能体不是替代会计，是帮财务做重复、数据核对、信息提取、预审分析工作，把财务从机械单据处理释放到管理决策。")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("div", fN, [
          e.createElementVNode("button", {
            class: "ss-btn",
            disabled: v.value,
            onClick: E
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(v.value ? "ri-loader-4-line spin" : "ri-refresh-line")
              },
              null,
              2
              /* CLASS */
            ),
            e.createTextVNode(
              e.toDisplayString(f.$t("刷新")),
              1
              /* TEXT */
            )
          ], 8, $N)
        ])
      ]),
      e.createCommentVNode(" 账套 + 套餐 + 合规边界：一行 "),
      e.unref(p) ? (e.openBlock(), e.createElementBlock("section", bN, [
        e.createElementVNode("label", {
          class: "fa-bar__ledger",
          title: f.$t("代账公司一个客户一个账套；数据、问答记忆都跟着账套走")
        }, [
          n[16] || (n[16] = e.createElementVNode(
            "i",
            { class: "ri-building-2-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(f.$t("账套")),
            1
            /* TEXT */
          ),
          e.createElementVNode("select", {
            value: e.unref(p).activeLedgerId,
            disabled: $.value,
            onChange: n[0] || (n[0] = (h) => B(h.target.value))
          }, [
            (e.openBlock(!0), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(e.unref(p).ledgers, (h) => (e.openBlock(), e.createElementBlock("option", {
                key: h.id,
                value: h.id
              }, e.toDisplayString(h.name), 9, _N))),
              128
              /* KEYED_FRAGMENT */
            ))
          ], 40, SN),
          e.createElementVNode(
            "em",
            BN,
            e.toDisplayString(T.value?.taxpayerType === "general" ? f.$t("一般纳税人") : f.$t("小规模纳税人")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: n[1] || (n[1] = (h) => N(T.value))
            },
            e.toDisplayString(f.$t("编辑")),
            1
            /* TEXT */
          ),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-link",
              onClick: n[2] || (n[2] = (h) => N(null))
            },
            e.toDisplayString(f.$t("新建账套")),
            1
            /* TEXT */
          )
        ], 8, DN),
        e.createElementVNode("label", wN, [
          n[17] || (n[17] = e.createElementVNode(
            "i",
            { class: "ri-gift-line" },
            null,
            -1
            /* CACHED */
          )),
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(f.$t("套餐")),
            1
            /* TEXT */
          ),
          e.createElementVNode("select", {
            value: e.unref(p).settings.package,
            onChange: n[3] || (n[3] = (h) => Y(h.target.value))
          }, [
            (e.openBlock(), e.createElementBlock(
              e.Fragment,
              null,
              e.renderList(C, (h) => e.createElementVNode("option", {
                key: h,
                value: h
              }, e.toDisplayString(e.unref(Te)(h)), 9, TN)),
              64
              /* STABLE_FRAGMENT */
            ))
          ], 40, CN)
        ]),
        e.createElementVNode("p", MN, [
          e.createElementVNode("span", LN, [
            n[18] || (n[18] = e.createElementVNode(
              "i",
              { class: "ri-close-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(f.$t("不自动提交申报、不电子签名、不改正式账套")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode("span", UN, [
            n[19] || (n[19] = e.createElementVNode(
              "i",
              { class: "ri-checkbox-circle-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(f.$t("只做解析、草稿、风险提示、辅助计算，由财务人员复核确认")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 账套编辑 "),
      c.value ? (e.openBlock(), e.createElementBlock("section", PN, [
        e.createElementVNode("header", null, [
          e.createElementVNode("strong", null, [
            n[20] || (n[20] = e.createElementVNode(
              "i",
              { class: "ri-building-2-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              " " + e.toDisplayString(c.value.id ? f.$t("编辑账套") : f.$t("新建账套")),
              1
              /* TEXT */
            )
          ]),
          e.createElementVNode(
            "span",
            FN,
            e.toDisplayString(f.$t("税号用来判断票据抬头是不是本公司、是进项还是销项。")),
            1
            /* TEXT */
          )
        ]),
        e.createElementVNode("div", zN, [
          e.createElementVNode("label", AN, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(f.$t("公司名称")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": n[4] || (n[4] = (h) => c.value.name = h),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                c.value.name,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", xN, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(f.$t("统一社会信用代码")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": n[5] || (n[5] = (h) => c.value.taxId = h),
                type: "text",
                maxlength: "20"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                c.value.taxId,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", RN, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(f.$t("纳税人类型")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": n[6] || (n[6] = (h) => c.value.taxpayerType = h)
              },
              [
                e.createElementVNode(
                  "option",
                  IN,
                  e.toDisplayString(f.$t("小规模纳税人")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  ON,
                  e.toDisplayString(f.$t("一般纳税人")),
                  1
                  /* TEXT */
                )
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, c.value.taxpayerType]
            ])
          ]),
          e.createElementVNode("label", KN, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(f.$t("城建税所在地")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "select",
              {
                "onUpdate:modelValue": n[7] || (n[7] = (h) => c.value.cityTier = h)
              },
              [
                e.createElementVNode(
                  "option",
                  qN,
                  e.toDisplayString(f.$t("市区（7%）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  jN,
                  e.toDisplayString(f.$t("县城、镇（5%）")),
                  1
                  /* TEXT */
                ),
                e.createElementVNode(
                  "option",
                  WN,
                  e.toDisplayString(f.$t("其他（1%）")),
                  1
                  /* TEXT */
                )
              ],
              512
              /* NEED_PATCH */
            ), [
              [e.vModelSelect, c.value.cityTier]
            ])
          ]),
          e.createElementVNode("label", JN, [
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(f.$t("行业")),
              1
              /* TEXT */
            ),
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": n[8] || (n[8] = (h) => c.value.industry = h),
                type: "text"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                e.vModelText,
                c.value.industry,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e.createElementVNode("label", YN, [
            e.withDirectives(e.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": n[9] || (n[9] = (h) => c.value.smallLowProfit = h),
                type: "checkbox"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [e.vModelCheckbox, c.value.smallLowProfit]
            ]),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(f.$t("小型微利企业（所得税 5%、六税两费减半）")),
              1
              /* TEXT */
            )
          ])
        ]),
        e.createElementVNode("label", HN, [
          e.createElementVNode(
            "span",
            null,
            e.toDisplayString(f.$t("账套备注（智能体会记住，分析和问答时参考）")),
            1
            /* TEXT */
          ),
          e.withDirectives(e.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": n[10] || (n[10] = (h) => c.value.notes = h),
              rows: "3"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [e.vModelText, c.value.notes]
          ])
        ]),
        e.createElementVNode("div", QN, [
          e.createElementVNode("button", {
            type: "button",
            class: "ss-btn primary",
            disabled: !c.value.name,
            onClick: k
          }, [
            n[21] || (n[21] = e.createElementVNode(
              "i",
              { class: "ri-check-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(f.$t("保存")),
              1
              /* TEXT */
            )
          ], 8, GN),
          e.createElementVNode(
            "button",
            {
              type: "button",
              class: "ss-btn ghost",
              onClick: n[11] || (n[11] = (h) => c.value = null)
            },
            e.toDisplayString(f.$t("取消")),
            1
            /* TEXT */
          ),
          n[23] || (n[23] = e.createElementVNode(
            "span",
            { class: "grow" },
            null,
            -1
            /* CACHED */
          )),
          c.value.id && (e.unref(p)?.ledgers.length || 0) > 1 ? (e.openBlock(), e.createElementBlock("button", {
            key: 0,
            type: "button",
            class: "ss-btn danger sm",
            onClick: n[12] || (n[12] = (h) => U(c.value.id))
          }, [
            n[22] || (n[22] = e.createElementVNode(
              "i",
              { class: "ri-delete-bin-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createTextVNode(
              e.toDisplayString(f.$t("删除账套")),
              1
              /* TEXT */
            )
          ])) : e.createCommentVNode("v-if", !0)
        ])
      ])) : e.createCommentVNode("v-if", !0),
      e.createCommentVNode(" 十个智能体 "),
      e.createElementVNode("nav", XN, [
        (e.openBlock(!0), e.createElementBlock(
          e.Fragment,
          null,
          e.renderList(I.value, (h) => (e.openBlock(), e.createElementBlock("button", {
            key: h.key,
            type: "button",
            role: "tab",
            class: e.normalizeClass(["fa-tab", { active: w.value === h.key }]),
            "aria-selected": w.value === h.key,
            title: h.desc,
            onClick: (u) => L(h.key)
          }, [
            e.createElementVNode(
              "i",
              {
                class: e.normalizeClass(h.icon)
              },
              null,
              2
              /* CLASS */
            ),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(h.title),
              1
              /* TEXT */
            ),
            O(h.key) ? (e.openBlock(), e.createElementBlock(
              "em",
              e1,
              e.toDisplayString(O(h.key)),
              1
              /* TEXT */
            )) : e.createCommentVNode("v-if", !0)
          ], 10, ZN))),
          128
          /* KEYED_FRAGMENT */
        )),
        n[26] || (n[26] = e.createElementVNode(
          "span",
          { class: "fa-tabs__grow" },
          null,
          -1
          /* CACHED */
        )),
        e.createElementVNode(
          "button",
          {
            type: "button",
            role: "tab",
            class: e.normalizeClass(["fa-tab", { active: w.value === "overview" }]),
            onClick: n[13] || (n[13] = (h) => L("overview"))
          },
          [
            n[24] || (n[24] = e.createElementVNode(
              "i",
              { class: "ri-book-open-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(f.$t("方案说明")),
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
            role: "tab",
            class: e.normalizeClass(["fa-tab", { active: w.value === "settings" }]),
            onClick: n[14] || (n[14] = (h) => L("settings"))
          },
          [
            n[25] || (n[25] = e.createElementVNode(
              "i",
              { class: "ri-settings-3-line" },
              null,
              -1
              /* CACHED */
            )),
            e.createElementVNode(
              "span",
              null,
              e.toDisplayString(f.$t("设置")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ]),
      F.value ? (e.openBlock(), e.createElementBlock("p", t1, [
        n[27] || (n[27] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(F.value),
          1
          /* TEXT */
        )
      ])) : e.createCommentVNode("v-if", !0),
      s.value ? (e.openBlock(), e.createElementBlock("div", l1, [
        w.value === "overview" ? (e.openBlock(), e.createBlock(Tt, {
          key: 0,
          onGoto: X
        })) : w.value === "settings" ? (e.openBlock(), e.createBlock(vn, { key: 1 })) : (e.openBlock(), e.createBlock(e.resolveDynamicComponent(P.value), {
          key: `${w.value}-${e.unref(p)?.activeLedgerId}`,
          meta: W.value,
          focus: j[w.value] || null,
          onGoto: X
        }, null, 40, ["meta", "focus"]))
      ])) : g.value ? (e.openBlock(), e.createElementBlock("p", n1, [
        n[28] || (n[28] = e.createElementVNode(
          "i",
          { class: "ri-error-warning-line" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(g.value),
          1
          /* TEXT */
        )
      ])) : (e.openBlock(), e.createElementBlock("p", o1, [
        n[29] || (n[29] = e.createElementVNode(
          "i",
          { class: "ri-loader-4-line spin" },
          null,
          -1
          /* CACHED */
        )),
        e.createTextVNode(
          e.toDisplayString(f.$t("正在加载工作台…")),
          1
          /* TEXT */
        )
      ]))
    ]));
  }
}), s1 = /* @__PURE__ */ oe(a1, [["__scopeId", "data-v-505319cf"]]);
export {
  s1 as default
};
