var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-qiye-app/apps/desktop-shell/node_modules/.cache/solutions-build/workbench-finance-agent/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/ipc/financeAgent.ipc.ts
var import_electron = require("electron");
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_crypto2 = require("node:crypto");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n4 = require("npm:@totalclaw/i18n");
var import_userFacingError = require("host:apps/desktop-shell/src/main/utils/userFacingError.ts");
var import_quitRegistry = require("host:apps/desktop-shell/src/main/util/quitRegistry.ts");
var import_workbenchLlm = require("host:apps/desktop-shell/src/main/services/workbenchLlm.ts");
var import_store = require("host:apps/desktop-shell/src/main/services/financeAgent/store.ts");
var import_common4 = require("host:apps/desktop-shell/src/main/services/financeAgent/common.ts");
var import_invoice = require("host:apps/desktop-shell/src/main/services/financeAgent/invoice.ts");
var import_voucher = require("host:apps/desktop-shell/src/main/services/financeAgent/voucher.ts");
var import_tax = require("host:apps/desktop-shell/src/main/services/financeAgent/tax.ts");
var import_expense = require("host:apps/desktop-shell/src/main/services/financeAgent/expense.ts");

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/services/financeAgent/reconcile.ts
var import_i18n = require("npm:@totalclaw/i18n");
var import_common = require("host:apps/desktop-shell/src/main/services/financeAgent/common.ts");
var DATE_WINDOW = 7;
function normRef(s) {
  return String(s || "").replace(/[\s\-_/#:：]/g, "").toUpperCase();
}
function matchRows(ours, theirs) {
  const out = [];
  const left = new Set(theirs.map((_, i) => i));
  const pending = [];
  for (const o of ours) {
    const ref = normRef(o.ref);
    const idx = ref ? [...left].find((i) => normRef(theirs[i].ref) === ref) : void 0;
    if (idx == null) {
      pending.push(o);
      continue;
    }
    left.delete(idx);
    const t = theirs[idx];
    const diff = (0, import_common.round2)(o.amount - t.amount);
    out.push({ ours: o, theirs: t, status: Math.abs(diff) < 5e-3 ? "matched" : "amount_diff", diff, note: Math.abs(diff) < 5e-3 ? (0, import_i18n.t)("\u5355\u53F7\u4E00\u81F4") : (0, import_i18n.t)("\u5355\u53F7\u4E00\u81F4\uFF0C\u91D1\u989D\u5DEE {p0}", { p0: (0, import_common.fmt)(diff) }) });
  }
  for (const o of pending) {
    let best;
    let bestGap = Infinity;
    for (const i of left) {
      const t = theirs[i];
      if (Math.abs(t.amount - o.amount) >= 5e-3) continue;
      const gap = Math.abs((0, import_common.daysBetween)(o.date, t.date));
      if (gap <= DATE_WINDOW && gap < bestGap) {
        best = i;
        bestGap = gap;
      }
    }
    if (best == null) {
      out.push({ ours: o, status: "only_ours", diff: o.amount, note: (0, import_i18n.t)("\u5BF9\u65B9\u8D26\u4E0A\u6CA1\u6709\u8FD9\u7B14") });
      continue;
    }
    left.delete(best);
    out.push({ ours: o, theirs: theirs[best], status: "matched", diff: 0, note: bestGap ? (0, import_i18n.t)("\u91D1\u989D\u4E00\u81F4\uFF0C\u65E5\u671F\u5DEE {n} \u5929", { n: bestGap }) : (0, import_i18n.t)("\u91D1\u989D\u3001\u65E5\u671F\u4E00\u81F4") });
  }
  for (const i of left) out.push({ theirs: theirs[i], status: "only_theirs", diff: (0, import_common.round2)(-theirs[i].amount), note: (0, import_i18n.t)("\u6211\u65B9\u8D26\u4E0A\u6CA1\u6709\u8FD9\u7B14") });
  const order = { amount_diff: 0, only_ours: 1, only_theirs: 2, matched: 3 };
  return out.sort((a, b) => order[a.status] - order[b.status] || (a.ours || a.theirs).date.localeCompare((b.ours || b.theirs).date));
}
function recSummary(matches) {
  const balanceOurs = (0, import_common.sum)(matches.filter((m) => m.ours).map((m) => m.ours.amount));
  const balanceTheirs = (0, import_common.sum)(matches.filter((m) => m.theirs).map((m) => m.theirs.amount));
  return { balanceOurs, balanceTheirs, diffs: matches.filter((m) => m.status !== "matched").length, gap: (0, import_common.round2)(balanceOurs - balanceTheirs) };
}
var AGING_BUCKETS = () => [
  { max: 30, label: (0, import_i18n.t)("30 \u5929\u4EE5\u5185") },
  { max: 90, label: (0, import_i18n.t)("31\u201390 \u5929") },
  { max: 180, label: (0, import_i18n.t)("91\u2013180 \u5929") },
  { max: 365, label: (0, import_i18n.t)("181\u2013365 \u5929") },
  { max: Infinity, label: (0, import_i18n.t)("1 \u5E74\u4EE5\u4E0A") }
];
function buildAging(rows, asOf, side, staleDays) {
  const buckets = AGING_BUCKETS();
  const out = rows.map((r) => {
    const outstanding = (0, import_common.round2)(r.amount - r.paid);
    const ageDays = Math.max(0, (0, import_common.daysBetween)(r.date, asOf));
    const overdueDays = Math.max(0, (0, import_common.daysBetween)(r.dueDate, asOf));
    return { ...r, outstanding, ageDays, overdueDays, bucket: buckets.find((b) => ageDays <= b.max).label };
  }).filter((r) => Math.abs(r.outstanding) >= 5e-3);
  const bucketSum = buckets.map((b) => {
    const list = out.filter((r) => r.bucket === b.label);
    return { bucket: b.label, amount: (0, import_common.sum)(list.map((r) => r.outstanding)), count: list.length };
  });
  const byCp = /* @__PURE__ */ new Map();
  for (const r of out) {
    const g = byCp.get(r.counterparty) || { counterparty: r.counterparty, outstanding: 0, overdue: 0, maxOverdueDays: 0 };
    g.outstanding = (0, import_common.round2)(g.outstanding + r.outstanding);
    if (r.overdueDays > 0) g.overdue = (0, import_common.round2)(g.overdue + r.outstanding);
    g.maxOverdueDays = Math.max(g.maxOverdueDays, r.overdueDays);
    byCp.set(r.counterparty, g);
  }
  const byCounterparty = [...byCp.values()].sort((a, b) => b.overdue - a.overdue || b.outstanding - a.outstanding);
  const warnings = [];
  const who = side === "ar" ? (0, import_i18n.t)("\u5BA2\u6237") : (0, import_i18n.t)("\u4F9B\u5E94\u5546");
  for (const g of byCounterparty) {
    if (g.overdue <= 0) continue;
    const level = g.maxOverdueDays > 90 ? "high" : g.maxOverdueDays > 30 ? "warn" : "info";
    warnings.push({
      code: "overdue",
      level,
      refs: [g.counterparty],
      title: side === "ar" ? (0, import_i18n.t)("{p0} \u903E\u671F\u672A\u56DE\u6B3E {a}", { p0: g.counterparty, a: (0, import_common.fmt)(g.overdue) }) : (0, import_i18n.t)("\u5E94\u4ED8 {p0} \u5DF2\u903E\u671F {a}", { p0: g.counterparty, a: (0, import_common.fmt)(g.overdue) }),
      detail: (0, import_i18n.t)("{p0}\u300C{p1}\u300D\u672A\u7ED3 {a}\uFF0C\u5176\u4E2D\u903E\u671F {b}\uFF0C\u6700\u957F\u903E\u671F {n} \u5929", { p0: who, p1: g.counterparty, a: (0, import_common.fmt)(g.outstanding), b: (0, import_common.fmt)(g.overdue), n: g.maxOverdueDays }),
      suggestion: side === "ar" ? g.maxOverdueDays > 90 ? (0, import_i18n.t)("\u53D1\u50AC\u6B3E\u51FD\u5E76\u7535\u8BDD\u8DDF\u8FDB\uFF1B\u8D85\u8FC7 180 \u5929\u8003\u8651\u5F8B\u5E08\u51FD\u4E0E\u574F\u8D26\u51C6\u5907") : (0, import_i18n.t)("\u53D1\u5BF9\u8D26\u51FD\u786E\u8BA4\u4F59\u989D\uFF0C\u63D0\u9192\u4ED8\u6B3E") : (0, import_i18n.t)("\u786E\u8BA4\u4ED8\u6B3E\u8BA1\u5212\uFF0C\u907F\u514D\u5F71\u54CD\u4F9B\u8D27\u4E0E\u4FE1\u7528")
    });
  }
  const stale = out.filter((r) => r.ageDays > staleDays);
  if (stale.length) {
    warnings.push({
      code: "stale",
      level: "warn",
      refs: [...new Set(stale.map((r) => r.counterparty))],
      title: (0, import_i18n.t)("{n} \u7B14\u5F80\u6765\u6302\u8D26\u8D85\u8FC7 {d} \u5929", { n: stale.length, d: staleDays }),
      detail: (0, import_i18n.t)("\u5408\u8BA1 {a}\uFF0C\u6D89\u53CA {m} \u5BB6", { a: (0, import_common.fmt)((0, import_common.sum)(stale.map((r) => r.outstanding))), m: new Set(stale.map((r) => r.counterparty)).size }),
      suggestion: (0, import_i18n.t)("\u957F\u671F\u6302\u8D26\u53EF\u80FD\u88AB\u8BA4\u5B9A\u4E3A\u9690\u533F\u6536\u5165\u6216\u865A\u5217\u6210\u672C\uFF1B\u9010\u7B14\u67E5\u660E\u539F\u56E0\uFF0C\u80FD\u6838\u9500\u7684\u6838\u9500\uFF0C\u786E\u5B9E\u65E0\u6CD5\u6536\u56DE\u7684\u6309\u89C4\u5B9A\u505A\u635F\u5931")
    });
  }
  return { rows: out.sort((a, b) => b.overdueDays - a.overdueDays), buckets: bucketSum, byCounterparty, warnings };
}
function reconcileLetter(run, ledgerName) {
  const diffs = run.matches.filter((m) => m.status !== "matched");
  const dir = run.side === "ar" ? (0, import_i18n.t)("\u8D35\u53F8\u5C1A\u6B20\u6211\u53F8") : (0, import_i18n.t)("\u6211\u53F8\u5C1A\u6B20\u8D35\u53F8");
  const lines = [
    (0, import_i18n.t)("\u5F80\u6765\u6B3E\u9879\u5BF9\u8D26\u51FD"),
    "",
    (0, import_i18n.t)("{p0}\uFF1A", { p0: run.counterparty || (0, import_i18n.t)("\u8D35\u53F8") }),
    "",
    (0, import_i18n.t)("\u4E3A\u6838\u5BF9\u53CC\u65B9\u5F80\u6765\u8D26\u76EE\uFF0C\u622A\u81F3 {d}\uFF0C\u6211\u53F8\u8D26\u9762\u8BB0\u5F55{p0}\u6B3E\u9879\u4F59\u989D\u4E3A\u4EBA\u6C11\u5E01 {a} \u5143\uFF1B\u6839\u636E\u8D35\u53F8\u63D0\u4F9B\u7684\u5BF9\u8D26\u5355\uFF0C\u8D35\u53F8\u8D26\u9762\u8BB0\u5F55\u4F59\u989D\u4E3A {b} \u5143\uFF0C\u5DEE\u989D {c} \u5143\u3002", { d: run.asOf, p0: dir, a: (0, import_common.fmt)(run.balanceOurs), b: (0, import_common.fmt)(run.balanceTheirs), c: (0, import_common.fmt)((0, import_common.round2)(run.balanceOurs - run.balanceTheirs)) }),
    ""
  ];
  if (diffs.length) {
    lines.push((0, import_i18n.t)("\u5DEE\u5F02\u660E\u7EC6\u5982\u4E0B\uFF0C\u8BF7\u534F\u52A9\u6838\u5BF9\uFF1A"));
    diffs.forEach((m, i) => {
      const r = m.ours || m.theirs;
      const who = m.status === "only_ours" ? (0, import_i18n.t)("\u6211\u65B9\u6709\u3001\u8D35\u65B9\u65E0") : m.status === "only_theirs" ? (0, import_i18n.t)("\u8D35\u65B9\u6709\u3001\u6211\u65B9\u65E0") : (0, import_i18n.t)("\u53CC\u65B9\u91D1\u989D\u4E0D\u4E00\u81F4");
      lines.push(`${i + 1}. ${r.date} ${r.ref || ""} ${r.summary || ""}\u3000${who}\u3000${(0, import_i18n.t)("\u6211\u65B9 {a} / \u8D35\u65B9 {b}", { a: m.ours ? (0, import_common.fmt)(m.ours.amount) : "-", b: m.theirs ? (0, import_common.fmt)(m.theirs.amount) : "-" })}`);
    });
    lines.push("");
  } else {
    lines.push((0, import_i18n.t)("\u7ECF\u9010\u7B14\u6838\u5BF9\uFF0C\u53CC\u65B9\u8BB0\u5F55\u4E00\u81F4\u3002"), "");
  }
  lines.push(
    (0, import_i18n.t)("\u5982\u6838\u5BF9\u65E0\u8BEF\uFF0C\u8BF7\u5728\u4E0B\u65B9\u300C\u4FE1\u606F\u8BC1\u660E\u65E0\u8BEF\u300D\u5904\u7B7E\u7AE0\uFF1B\u5982\u6709\u4E0D\u7B26\uFF0C\u8BF7\u5728\u300C\u4FE1\u606F\u4E0D\u7B26\u300D\u5904\u5217\u660E\u8D35\u53F8\u8BB0\u5F55\u7684\u91D1\u989D\u4E0E\u660E\u7EC6\u3002\u672C\u51FD\u4EC5\u7528\u4E8E\u6838\u5BF9\u8D26\u76EE\uFF0C\u4E0D\u4F5C\u4E3A\u50AC\u6B3E\u4F9D\u636E\u3002"),
    "",
    (0, import_i18n.t)("\u4FE1\u606F\u8BC1\u660E\u65E0\u8BEF\u3000\u3000\u3000\u3000\uFF08\u7B7E\u7AE0\uFF09\u3000\u3000\u3000\u3000\u5E74\u3000\u6708\u3000\u65E5"),
    (0, import_i18n.t)("\u4FE1\u606F\u4E0D\u7B26\uFF0C\u8BF7\u5217\u660E\u4E0D\u7B26\u9879\u76EE\u53CA\u5177\u4F53\u5185\u5BB9\uFF1A"),
    "",
    `${ledgerName}`,
    (0, import_i18n.t)("{p0}\uFF08\u6B64\u51FD\u4E3A\u8349\u7A3F\uFF0C\u7ECF\u8D22\u52A1\u590D\u6838\u5E76\u7531\u6709\u6743\u4EBA\u7B7E\u7AE0\u540E\u53D1\u51FA\uFF09", { p0: run.asOf })
  );
  return lines.join("\n");
}
function dunningLetter(counterparty, rows, asOf, ledgerName) {
  const overdue = rows.filter((r) => r.counterparty === counterparty && r.overdueDays > 0);
  const total = (0, import_common.sum)(overdue.map((r) => r.outstanding));
  return [
    (0, import_i18n.t)("\u4ED8\u6B3E\u63D0\u9192\u51FD"),
    "",
    (0, import_i18n.t)("{p0}\uFF1A", { p0: counterparty }),
    "",
    (0, import_i18n.t)("\u611F\u8C22\u8D35\u53F8\u4E00\u76F4\u4EE5\u6765\u7684\u5408\u4F5C\u3002\u7ECF\u6838\u5BF9\uFF0C\u622A\u81F3 {d}\uFF0C\u8D35\u53F8\u4EE5\u4E0B\u6B3E\u9879\u5DF2\u8D85\u8FC7\u7EA6\u5B9A\u4ED8\u6B3E\u671F\u9650\uFF0C\u903E\u671F\u91D1\u989D\u5408\u8BA1\u4EBA\u6C11\u5E01 {a} \u5143\uFF1A", { d: asOf, a: (0, import_common.fmt)(total) }),
    "",
    ...overdue.map((r, i) => (0, import_i18n.t)("{n}. \u5355\u636E {p0}\uFF0C\u65E5\u671F {p1}\uFF0C\u5230\u671F\u65E5 {p2}\uFF0C\u672A\u4ED8 {a} \u5143\uFF0C\u5DF2\u903E\u671F {m} \u5929", { n: i + 1, p0: r.docNo || "-", p1: r.date, p2: r.dueDate, a: (0, import_common.fmt)(r.outstanding), m: r.overdueDays })),
    "",
    (0, import_i18n.t)("\u8BF7\u8D35\u53F8\u5728\u6536\u5230\u672C\u51FD\u540E\u5C3D\u5FEB\u5B89\u6392\u4ED8\u6B3E\uFF1B\u5982\u5DF2\u4ED8\u6B3E\u8BF7\u5FFD\u7565\u672C\u51FD\uFF0C\u5E76\u544A\u77E5\u4ED8\u6B3E\u65E5\u671F\u4E0E\u51ED\u8BC1\u4EE5\u4FBF\u6838\u5BF9\u3002\u5982\u5BF9\u91D1\u989D\u6709\u5F02\u8BAE\uFF0C\u8BF7\u4E0E\u6211\u53F8\u8D22\u52A1\u8054\u7CFB\u5BF9\u8D26\u3002"),
    "",
    ledgerName,
    (0, import_i18n.t)("{p0}\uFF08\u6B64\u51FD\u4E3A\u8349\u7A3F\uFF0C\u7ECF\u8D22\u52A1\u590D\u6838\u540E\u53D1\u51FA\uFF09", { p0: asOf })
  ].join("\n");
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/ipc/financeAgent.ipc.ts
var import_statements = require("host:apps/desktop-shell/src/main/services/financeAgent/statements.ts");
var import_risk = require("host:apps/desktop-shell/src/main/services/financeAgent/risk.ts");
var import_budget = require("host:apps/desktop-shell/src/main/services/financeAgent/budget.ts");
var import_cost = require("host:apps/desktop-shell/src/main/services/financeAgent/cost.ts");

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/services/financeAgent/contract.ts
var import_i18n2 = require("npm:@totalclaw/i18n");
var import_common2 = require("host:apps/desktop-shell/src/main/services/financeAgent/common.ts");

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/services/financeAgent/contractRules.json
var contractRules_default = {
  _note: "\u5408\u540C\u8D22\u7A0E\u5BA1\u6838\u7684\u786E\u5B9A\u6027\u89C4\u5219\u3002stampDuty \u6309\u300A\u5370\u82B1\u7A0E\u6CD5\u300B\uFF082022-07-01 \u65BD\u884C\uFF09\u7A0E\u76EE\u7A0E\u7387\u8868\uFF0C\u8BA1\u7A0E\u4F9D\u636E\u4E3A\u5408\u540C\u6240\u5217\u91D1\u989D\uFF0C\u4E0D\u542B\u5217\u660E\u7684\u589E\u503C\u7A0E\u7A0E\u6B3E\u3002types \u6309\u987A\u5E8F\u5339\u914D\u5408\u540C\u6807\u9898 / \u524D\u6587\u3002 \u6807\u9898\u4E0E\u5EFA\u8BAE\u6587\u6848\u5728 contract.ts \u91CC\uFF08\u8981\u8FDB\u4E09\u8BED\u8BCD\u5178\uFF09\uFF0C\u8FD9\u91CC\u53EA\u653E\u5339\u914D\u6A21\u5F0F\u3002",
  types: [
    {
      type: "\u501F\u6B3E\u5408\u540C",
      keywords: [
        "\u501F\u6B3E\u5408\u540C",
        "\u8D37\u6B3E\u5408\u540C",
        "\u501F\u6B3E\u534F\u8BAE"
      ],
      rate: 5e-5
    },
    {
      type: "\u878D\u8D44\u79DF\u8D41\u5408\u540C",
      keywords: [
        "\u878D\u8D44\u79DF\u8D41"
      ],
      rate: 5e-5
    },
    {
      type: "\u5EFA\u8BBE\u5DE5\u7A0B\u5408\u540C",
      keywords: [
        "\u5EFA\u8BBE\u5DE5\u7A0B",
        "\u65BD\u5DE5\u5408\u540C",
        "\u5DE5\u7A0B\u627F\u5305",
        "\u52D8\u5BDF",
        "\u8BBE\u8BA1\u5408\u540C"
      ],
      rate: 3e-4
    },
    {
      type: "\u6280\u672F\u5408\u540C",
      keywords: [
        "\u6280\u672F\u5F00\u53D1",
        "\u6280\u672F\u8F6C\u8BA9",
        "\u6280\u672F\u54A8\u8BE2",
        "\u6280\u672F\u670D\u52A1\u5408\u540C",
        "\u6280\u672F\u8BB8\u53EF"
      ],
      rate: 3e-4
    },
    {
      type: "\u8FD0\u8F93\u5408\u540C",
      keywords: [
        "\u8FD0\u8F93\u5408\u540C",
        "\u8D27\u8FD0\u5408\u540C",
        "\u7269\u6D41\u670D\u52A1\u5408\u540C",
        "\u627F\u8FD0"
      ],
      rate: 3e-4
    },
    {
      type: "\u627F\u63FD\u5408\u540C",
      keywords: [
        "\u52A0\u5DE5\u5408\u540C",
        "\u627F\u63FD",
        "\u5B9A\u4F5C",
        "\u59D4\u6258\u52A0\u5DE5",
        "\u4FEE\u7406",
        "\u5370\u5237"
      ],
      rate: 3e-4
    },
    {
      type: "\u79DF\u8D41\u5408\u540C",
      keywords: [
        "\u79DF\u8D41\u5408\u540C",
        "\u79DF\u8D41\u534F\u8BAE",
        "\u623F\u5C4B\u79DF\u8D41",
        "\u8BBE\u5907\u79DF\u8D41",
        "\u51FA\u79DF"
      ],
      rate: 1e-3
    },
    {
      type: "\u4ED3\u50A8\u5408\u540C",
      keywords: [
        "\u4ED3\u50A8"
      ],
      rate: 1e-3
    },
    {
      type: "\u4FDD\u7BA1\u5408\u540C",
      keywords: [
        "\u4FDD\u7BA1\u5408\u540C"
      ],
      rate: 1e-3
    },
    {
      type: "\u8D22\u4EA7\u4FDD\u9669\u5408\u540C",
      keywords: [
        "\u4FDD\u9669\u5408\u540C",
        "\u4FDD\u9669\u5355"
      ],
      rate: 1e-3
    },
    {
      type: "\u4EA7\u6743\u8F6C\u79FB\u4E66\u636E",
      keywords: [
        "\u80A1\u6743\u8F6C\u8BA9",
        "\u571F\u5730\u4F7F\u7528\u6743",
        "\u623F\u5C4B\u4E70\u5356",
        "\u5546\u6807",
        "\u8457\u4F5C\u6743",
        "\u4E13\u5229\u6743\u8F6C\u8BA9"
      ],
      rate: 5e-4
    },
    {
      type: "\u4E70\u5356\u5408\u540C",
      keywords: [
        "\u4E70\u5356\u5408\u540C",
        "\u8D2D\u9500\u5408\u540C",
        "\u91C7\u8D2D\u5408\u540C",
        "\u9500\u552E\u5408\u540C",
        "\u4F9B\u8D27\u5408\u540C",
        "\u8BA2\u8D27",
        "\u91C7\u8D2D\u8BA2\u5355"
      ],
      rate: 3e-4
    },
    {
      type: "\u670D\u52A1\u5408\u540C",
      keywords: [
        "\u670D\u52A1\u5408\u540C",
        "\u670D\u52A1\u534F\u8BAE",
        "\u54A8\u8BE2\u5408\u540C",
        "\u59D4\u6258\u5408\u540C",
        "\u4EE3\u7406\u5408\u540C"
      ],
      rate: 0
    }
  ],
  checks: [
    {
      code: "no_invoice_type",
      level: "warn",
      absent: "\u4E13\u7528\u53D1\u7968|\u666E\u901A\u53D1\u7968|\u589E\u503C\u7A0E\u53D1\u7968|\u6570\u7535\u53D1\u7968|\u7535\u5B50\u53D1\u7968|\u53D1\u7968"
    },
    {
      code: "no_tax_rate",
      level: "warn",
      absent: "\u7A0E\u7387|\\d+(?:\\.\\d+)?\\s*%\\s*(?:\u7684)?(?:\u589E\u503C\u7A0E|\u7A0E)|\u542B\u7A0E|\u4E0D\u542B\u7A0E|\u4EF7\u7A0E"
    },
    {
      code: "no_invoice_time",
      level: "info",
      absent: "(?:\u5F00\u5177|\u5F00\u51FA|\u63D0\u4F9B|\u51FA\u5177)[^\u3002\uFF1B\\n]{0,12}\u53D1\u7968|\u53D1\u7968[^\u3002\uFF1B\\n]{0,12}(?:\u5F00\u5177|\u5F00\u51FA|\u63D0\u4F9B)"
    },
    {
      code: "invoice_after_payment",
      level: "warn",
      present: "(?:\u6536\u5230|\u6536\u8BAB)[^\u3002\uFF1B\\n]{0,8}(?:\u5168\u90E8|\u5168\u989D)?(?:\u8D27\u6B3E|\u6B3E\u9879|\u4EF7\u6B3E)[^\u3002\uFF1B\\n]{0,6}(?:\u540E|\u4E4B\u540E)[^\u3002\uFF1B\\n]{0,12}(?:\u5F00\u5177|\u5F00\u51FA|\u63D0\u4F9B)[^\u3002\uFF1B\\n]{0,6}\u53D1\u7968"
    },
    {
      code: "no_payment",
      level: "warn",
      absent: "\u4ED8\u6B3E|\u652F\u4ED8|\u7ED3\u7B97|\u8D27\u6B3E|\u4EF7\u6B3E"
    },
    {
      code: "tax_inclusive_burden",
      level: "warn",
      present: "\u5305\u7A0E|\u7A0E\u8D39\u7531[^\u3002\uFF1B\\n]{0,10}(?:\u4E59\u65B9|\u7532\u65B9|\u5BF9\u65B9|\u5356\u65B9|\u4E70\u65B9)[^\u3002\uFF1B\\n]{0,6}(?:\u5168\u90E8|\u81EA\u884C)?\u627F\u62C5|\u7A0E\u540E\u4EF7|\u5230\u624B\u4EF7"
    },
    {
      code: "cash_payment",
      level: "warn",
      present: "\u73B0\u91D1\u652F\u4ED8|\u73B0\u91D1\u7ED3\u7B97|\u4EE5\u73B0\u91D1\u65B9\u5F0F"
    },
    {
      code: "personal_account",
      level: "high",
      present: "\u4E2A\u4EBA\u8D26\u6237|\u79C1\u4EBA\u8D26\u6237|\u4E2A\u4EBA\u94F6\u884C\u5361|\u652F\u4ED8\u5B9D\u8D26\u6237|\u5FAE\u4FE1\u8D26\u6237"
    },
    {
      code: "no_fake_invoice_clause",
      level: "info",
      absent: "\u865A\u5F00|\u4E0D\u5408\u89C4\u53D1\u7968|\u4E0D\u7B26\u5408\u89C4\u5B9A\u7684\u53D1\u7968|\u53D1\u7968[^\u3002\uFF1B\\n]{0,10}(?:\u4F5C\u5E9F|\u9000\u56DE|\u91CD\u5F00|\u91CD\u65B0\u5F00\u5177)"
    },
    {
      code: "no_rate_change",
      level: "info",
      absent: "\u7A0E\u7387[^\u3002\uFF1B\\n]{0,15}(?:\u8C03\u6574|\u53D8\u52A8|\u53D8\u5316)"
    }
  ]
};

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/services/financeAgent/contract.ts
var TYPES = contractRules_default.types;
var CHECKS = contractRules_default.checks;
function typeLabel(type) {
  const L = {
    \u501F\u6B3E\u5408\u540C: (0, import_i18n2.t)("\u501F\u6B3E\u5408\u540C"),
    \u878D\u8D44\u79DF\u8D41\u5408\u540C: (0, import_i18n2.t)("\u878D\u8D44\u79DF\u8D41\u5408\u540C"),
    \u5EFA\u8BBE\u5DE5\u7A0B\u5408\u540C: (0, import_i18n2.t)("\u5EFA\u8BBE\u5DE5\u7A0B\u5408\u540C"),
    \u6280\u672F\u5408\u540C: (0, import_i18n2.t)("\u6280\u672F\u5408\u540C"),
    \u8FD0\u8F93\u5408\u540C: (0, import_i18n2.t)("\u8FD0\u8F93\u5408\u540C"),
    \u627F\u63FD\u5408\u540C: (0, import_i18n2.t)("\u627F\u63FD\u5408\u540C"),
    \u79DF\u8D41\u5408\u540C: (0, import_i18n2.t)("\u79DF\u8D41\u5408\u540C"),
    \u4ED3\u50A8\u5408\u540C: (0, import_i18n2.t)("\u4ED3\u50A8\u5408\u540C"),
    \u4FDD\u7BA1\u5408\u540C: (0, import_i18n2.t)("\u4FDD\u7BA1\u5408\u540C"),
    \u8D22\u4EA7\u4FDD\u9669\u5408\u540C: (0, import_i18n2.t)("\u8D22\u4EA7\u4FDD\u9669\u5408\u540C"),
    \u4EA7\u6743\u8F6C\u79FB\u4E66\u636E: (0, import_i18n2.t)("\u4EA7\u6743\u8F6C\u79FB\u4E66\u636E"),
    \u4E70\u5356\u5408\u540C: (0, import_i18n2.t)("\u4E70\u5356\u5408\u540C"),
    \u670D\u52A1\u5408\u540C: (0, import_i18n2.t)("\u670D\u52A1\u5408\u540C"),
    \u5176\u4ED6: (0, import_i18n2.t)("\u5176\u4ED6")
  };
  return L[type] || type;
}
function checkText(code) {
  const T = {
    no_invoice_type: { title: (0, import_i18n2.t)("\u6CA1\u6709\u7EA6\u5B9A\u53D1\u7968"), suggestion: (0, import_i18n2.t)("\u5199\u660E\u5F00\u5177\u53D1\u7968\u7684\u7C7B\u578B\uFF08\u589E\u503C\u7A0E\u4E13\u7528 / \u666E\u901A\u53D1\u7968\uFF09\u3001\u7A0E\u7387\u4E0E\u5F00\u7968\u65F6\u95F4\uFF1B\u91C7\u8D2D\u65B9\u672A\u53D6\u5F97\u4E13\u7968\u5C06\u65E0\u6CD5\u62B5\u6263\u8FDB\u9879") },
    no_tax_rate: { title: (0, import_i18n2.t)("\u4EF7\u6B3E\u6CA1\u6709\u5199\u660E\u662F\u5426\u542B\u7A0E / \u7A0E\u7387"), suggestion: (0, import_i18n2.t)("\u4EF7\u6B3E\u6761\u6B3E\u5199\u660E\u300C\u542B\u7A0E\u4EF7 X \u5143\uFF0C\u5176\u4E2D\u4E0D\u542B\u7A0E\u4EF7 Y \u5143\u3001\u589E\u503C\u7A0E Z \u5143\uFF0C\u7A0E\u7387 N%\u300D\uFF0C\u4EF7\u7A0E\u5206\u79BB\u8FD8\u80FD\u5C11\u7F34\u5370\u82B1\u7A0E") },
    no_invoice_time: { title: (0, import_i18n2.t)("\u6CA1\u6709\u7EA6\u5B9A\u5F00\u7968\u65F6\u95F4"), suggestion: (0, import_i18n2.t)("\u7EA6\u5B9A\u5728\u4ED8\u6B3E\u524D\u82E5\u5E72\u65E5\u5185\u5F00\u5177\u53D1\u7968\uFF0C\u907F\u514D\u5148\u4ED8\u6B3E\u540E\u62FF\u4E0D\u5230\u7968") },
    invoice_after_payment: { title: (0, import_i18n2.t)("\u5148\u4ED8\u6B3E\u540E\u5F00\u7968"), suggestion: (0, import_i18n2.t)("\u4F5C\u4E3A\u4ED8\u6B3E\u65B9\uFF0C\u7EA6\u5B9A\u300C\u5148\u7968\u540E\u6B3E\u300D\u6216\u6309\u4ED8\u6B3E\u8FDB\u5EA6\u5206\u6B21\u5F00\u7968\uFF1B\u5168\u989D\u4ED8\u6B3E\u540E\u624D\u5F00\u7968\uFF0C\u4E00\u65E6\u5BF9\u65B9\u4E0D\u5F00\u7968\uFF0C\u8FDB\u9879\u65E0\u6CD5\u62B5\u6263\u3001\u6210\u672C\u7F3A\u5C11\u6263\u9664\u51ED\u8BC1") },
    no_payment: { title: (0, import_i18n2.t)("\u6CA1\u6709\u4ED8\u6B3E\u6761\u6B3E"), suggestion: (0, import_i18n2.t)("\u5199\u660E\u4ED8\u6B3E\u8282\u70B9\u3001\u6BD4\u4F8B\u548C\u671F\u9650\uFF1B\u589E\u503C\u7A0E\u7EB3\u7A0E\u4E49\u52A1\u53D1\u751F\u65F6\u95F4\u4E0E\u6536\u6B3E\u6216\u4E66\u9762\u7EA6\u5B9A\u7684\u4ED8\u6B3E\u65E5\u6302\u94A9") },
    tax_inclusive_burden: { title: (0, import_i18n2.t)("\u5305\u7A0E / \u7A0E\u540E\u4EF7\u6761\u6B3E"), suggestion: (0, import_i18n2.t)("\u6CD5\u5B9A\u7EB3\u7A0E\u4EBA\u4E0D\u56E0\u5408\u540C\u7EA6\u5B9A\u6539\u53D8\uFF1B\u5305\u7A0E\u6761\u6B3E\u8981\u628A\u7A0E\u8D39\u6298\u7B97\u8FDB\u4EF7\u6B3E\u5E76\u7EA6\u5B9A\u5BF9\u65B9\u5F00\u7968\uFF0C\u5426\u5219\u53EF\u80FD\u51FA\u73B0\u4EE3\u6263\u4EE3\u7F34\u4E49\u52A1\u4E0E\u7968\u636E\u7F3A\u5931") },
    cash_payment: { title: (0, import_i18n2.t)("\u7EA6\u5B9A\u73B0\u91D1\u652F\u4ED8"), suggestion: (0, import_i18n2.t)("\u5927\u989D\u73B0\u91D1\u652F\u4ED8\u96BE\u4EE5\u8BC1\u660E\u4E1A\u52A1\u771F\u5B9E\u6027\uFF0C\u6539\u4E3A\u5BF9\u516C\u8F6C\u8D26") },
    personal_account: { title: (0, import_i18n2.t)("\u7EA6\u5B9A\u4ED8\u6B3E\u5230\u4E2A\u4EBA\u8D26\u6237"), suggestion: (0, import_i18n2.t)("\u4ED8\u6B3E\u5230\u4E2A\u4EBA\u8D26\u6237\u4E0E\u5408\u540C\u4E3B\u4F53\u4E0D\u4E00\u81F4\uFF0C\u5B58\u5728\u8D44\u91D1\u3001\u53D1\u7968\u3001\u5408\u540C\u4E09\u6D41\u4E0D\u4E00\u81F4\u98CE\u9669\uFF0C\u6539\u4E3A\u5BF9\u516C\u8D26\u6237") },
    no_fake_invoice_clause: { title: (0, import_i18n2.t)("\u6CA1\u6709\u53D1\u7968\u4E0D\u5408\u89C4\u7684\u8D23\u4EFB\u6761\u6B3E"), suggestion: (0, import_i18n2.t)("\u52A0\u4E0A\uFF1A\u63D0\u4F9B\u7684\u53D1\u7968\u4E0D\u5408\u89C4\u6216\u88AB\u8BA4\u5B9A\u865A\u5F00\u7684\uFF0C\u5BF9\u65B9\u8D1F\u8D23\u91CD\u5F00\u5E76\u8D54\u507F\u56E0\u6B64\u4EA7\u751F\u7684\u7A0E\u6B3E\u3001\u6EDE\u7EB3\u91D1\u4E0E\u7F5A\u6B3E") },
    no_rate_change: { title: (0, import_i18n2.t)("\u6CA1\u6709\u7EA6\u5B9A\u7A0E\u7387\u8C03\u6574\u600E\u4E48\u529E"), suggestion: (0, import_i18n2.t)("\u7EA6\u5B9A\u300C\u5982\u9047\u56FD\u5BB6\u7A0E\u7387\u8C03\u6574\uFF0C\u4E0D\u542B\u7A0E\u4EF7\u4E0D\u53D8\uFF0C\u6309\u5F00\u7968\u65F6\u9002\u7528\u7A0E\u7387\u8BA1\u7B97\u542B\u7A0E\u4EF7\u300D") }
  };
  return T[code] || { title: code, suggestion: "" };
}
function detectContractType(text) {
  const head = String(text || "").slice(0, 1500);
  return TYPES.find((t) => t.keywords.some((k) => head.includes(k))) || TYPES.find((t) => t.keywords.some((k) => text.includes(k))) || null;
}
function extractContractAmount(text) {
  const t = String(text || "").replace(/[,，]/g, "");
  const re = /(合同(?:总)?(?:金额|价款|总价)|总(?:金额|价款|价)|价款(?:合计)?|含税(?:总)?(?:价|金额)|租金总额|借款金额)[^0-9¥￥\n]{0,12}[¥￥]?\s*(\d+(?:\.\d{1,2})?)\s*(万元|万|元)?/;
  const m = t.match(re);
  let total = null;
  if (m) total = (0, import_common2.round2)(Number(m[2]) * (/万/.test(m[3] || "") ? 1e4 : 1));
  const ex = t.match(/(?:不含税(?:价|金额|总价)?)[^0-9¥￥\n]{0,8}[¥￥]?\s*(\d+(?:\.\d{1,2})?)\s*(万元|万|元)?/);
  const exclTax = ex ? (0, import_common2.round2)(Number(ex[1]) * (/万/.test(ex[2] || "") ? 1e4 : 1)) : null;
  return { total, exclTax, quote: m ? m[0] : "" };
}
function stampDuty(type, total, exclTax) {
  if (!type || !total) return null;
  if (!type.rate) return [{ label: (0, import_i18n2.t)("\u5370\u82B1\u7A0E"), formula: (0, import_i18n2.t)("{p0}\u4E0D\u5728\u5370\u82B1\u7A0E\u7A0E\u76EE\u5185\uFF0C\u4E0D\u7F34", { p0: typeLabel(type.type) }), value: 0 }];
  const base = exclTax ?? total;
  return [
    { label: (0, import_i18n2.t)("\u8BA1\u7A0E\u4F9D\u636E"), formula: exclTax != null ? (0, import_i18n2.t)("\u5408\u540C\u5217\u660E\u4E0D\u542B\u7A0E\u91D1\u989D") : (0, import_i18n2.t)("\u5408\u540C\u91D1\u989D\uFF08\u672A\u5355\u5217\u589E\u503C\u7A0E\uFF0C\u6309\u5168\u989D\uFF09"), value: base },
    { label: (0, import_i18n2.t)("\u9002\u7528\u7A0E\u7387"), formula: (0, import_i18n2.t)("{p0}\uFF1A{r}", { p0: typeLabel(type.type), r: `${(0, import_common2.round2)(type.rate * 1e4) / 10}\u2030` }), value: type.rate },
    { label: (0, import_i18n2.t)("\u5E94\u7EB3\u5370\u82B1\u7A0E\uFF08\u6BCF\u4E00\u65B9\uFF09"), formula: `${(0, import_common2.fmt)(base)} \xD7 ${(0, import_common2.round2)(type.rate * 1e4) / 10}\u2030`, value: (0, import_common2.round2)(base * type.rate) }
  ];
}
function ruleFindings(text) {
  const out = [];
  for (const c of CHECKS) {
    let hit = false;
    let quote = "";
    if (c.absent) hit = !new RegExp(c.absent).test(text);
    if (c.present) {
      const m = text.match(new RegExp(`[^\u3002\uFF1B\\n]{0,30}(?:${c.present})[^\u3002\uFF1B\\n]{0,30}`));
      hit = !!m;
      quote = m?.[0]?.trim() || "";
    }
    if (!hit) continue;
    const tx = checkText(c.code);
    out.push({ code: c.code, level: c.level, title: tx.title, detail: quote ? (0, import_i18n2.t)("\u539F\u6587\uFF1A\u300C{p0}\u300D", { p0: quote }) : (0, import_i18n2.t)("\u5168\u6587\u6CA1\u6709\u627E\u5230\u76F8\u5173\u7EA6\u5B9A"), suggestion: tx.suggestion });
  }
  return out;
}
function verifyClauses(raw, text) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 30).map((c) => ({
    type: String(c?.type || "").slice(0, 20),
    quote: String(c?.quote || "").slice(0, 300),
    value: String(c?.value || "").slice(0, 200),
    verified: (0, import_common2.foundIn)(text, c?.quote)
  })).filter((c) => c.type && (c.quote || c.value));
}
function verifyLlmRisks(raw, text, existing) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const r of raw.slice(0, 15)) {
    const quote = String(r?.quote || "");
    if (!(0, import_common2.foundIn)(text, quote)) continue;
    const title = String(r?.title || "").slice(0, 60);
    if (!title || existing.some((e) => e.title === title)) continue;
    const q = (0, import_common2.normalizeForMatch)(quote);
    if ([...existing, ...out].some((e) => e.code !== "llm" && e.detail && (() => {
      const d = (0, import_common2.normalizeForMatch)(e.detail);
      return q.length >= 6 && (d.includes(q.slice(0, 12)) || q.includes(d.slice(4, 16)));
    })())) continue;
    const level = ["high", "warn", "info"].includes(r?.level) ? r.level : "warn";
    out.push({
      code: "llm",
      level,
      title,
      detail: (0, import_i18n2.t)("\u539F\u6587\uFF1A\u300C{p0}\u300D{p1}", { p0: quote.slice(0, 200), p1: r?.detail ? `
${String(r.detail).slice(0, 300)}` : "" }),
      suggestion: String(r?.suggestion || "").slice(0, 300)
    });
  }
  return out;
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/ipc/financeAgent.ipc.ts
var import_knowledge = require("host:apps/desktop-shell/src/main/services/financeAgent/knowledge.ts");

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/services/financeAgent/tables.ts
var import_i18n3 = require("npm:@totalclaw/i18n");
var import_excel = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");
var import_common3 = require("host:apps/desktop-shell/src/main/services/financeAgent/common.ts");

// src/main/services/financeAgent/columnKeywords.json
var columnKeywords_default = {
  _note: "\u8D22\u52A1\u667A\u80FD\u4F53\u5BFC\u5165\u8868\u683C\u7684\u5217\u8BC6\u522B\u5173\u952E\u5B57\uFF08\u6309\u4F18\u5148\u7EA7\uFF0C\u5148\u7CBE\u786E\u540E\u5305\u542B\uFF09\u3002\u4E0D\u8FDB i18n \u8BCD\u5178\uFF1A\u5B83\u4EEC\u8981\u5339\u914D\u5BA2\u6237\u8868\u683C\u91CC\u7684\u771F\u5B9E\u8868\u5934\u3002",
  date: ["\u65E5\u671F", "\u51ED\u8BC1\u65E5\u671F", "\u8BB0\u8D26\u65E5\u671F", "\u4E1A\u52A1\u65E5\u671F", "\u5355\u636E\u65E5\u671F", "\u5F00\u7968\u65E5\u671F", "\u4EA4\u6613\u65E5\u671F", "date"],
  voucherNo: ["\u51ED\u8BC1\u53F7", "\u51ED\u8BC1\u5B57\u53F7", "\u51ED\u8BC1\u7F16\u53F7", "voucher"],
  ref: ["\u5355\u636E\u53F7", "\u5355\u53F7", "\u53D1\u7968\u53F7\u7801", "\u53D1\u7968\u53F7", "\u8BA2\u5355\u53F7", "\u5408\u540C\u53F7", "\u51ED\u8BC1\u53F7", "\u7F16\u53F7", "ref"],
  summary: ["\u6458\u8981", "\u8BF4\u660E", "\u5907\u6CE8", "\u5185\u5BB9", "\u4E1A\u52A1\u8BF4\u660E", "summary"],
  accountCode: ["\u79D1\u76EE\u7F16\u7801", "\u79D1\u76EE\u4EE3\u7801", "\u4F1A\u8BA1\u79D1\u76EE\u7F16\u7801", "\u79D1\u76EE\u7F16\u53F7", "code"],
  accountName: ["\u79D1\u76EE\u540D\u79F0", "\u4F1A\u8BA1\u79D1\u76EE", "\u79D1\u76EE", "account"],
  debit: ["\u501F\u65B9\u91D1\u989D", "\u501F\u65B9\u53D1\u751F\u989D", "\u501F\u65B9", "\u672C\u671F\u501F\u65B9", "debit"],
  credit: ["\u8D37\u65B9\u91D1\u989D", "\u8D37\u65B9\u53D1\u751F\u989D", "\u8D37\u65B9", "\u672C\u671F\u8D37\u65B9", "credit"],
  amount: ["\u91D1\u989D", "\u53D1\u751F\u989D", "\u5E94\u6536\u91D1\u989D", "\u5E94\u4ED8\u91D1\u989D", "\u4EF7\u7A0E\u5408\u8BA1", "\u542B\u7A0E\u91D1\u989D", "amount"],
  balance: ["\u4F59\u989D", "\u671F\u672B\u4F59\u989D"],
  openingDebit: ["\u671F\u521D\u501F\u65B9", "\u5E74\u521D\u501F\u65B9", "\u671F\u521D\u4F59\u989D\u501F\u65B9", "\u671F\u521D\u501F\u65B9\u4F59\u989D"],
  openingCredit: ["\u671F\u521D\u8D37\u65B9", "\u5E74\u521D\u8D37\u65B9", "\u671F\u521D\u4F59\u989D\u8D37\u65B9", "\u671F\u521D\u8D37\u65B9\u4F59\u989D"],
  closingDebit: ["\u671F\u672B\u501F\u65B9", "\u671F\u672B\u4F59\u989D\u501F\u65B9", "\u671F\u672B\u501F\u65B9\u4F59\u989D"],
  closingCredit: ["\u671F\u672B\u8D37\u65B9", "\u671F\u672B\u4F59\u989D\u8D37\u65B9", "\u671F\u672B\u8D37\u65B9\u4F59\u989D"],
  counterparty: ["\u5F80\u6765\u5355\u4F4D", "\u5BA2\u6237\u540D\u79F0", "\u4F9B\u5E94\u5546\u540D\u79F0", "\u5BA2\u6237", "\u4F9B\u5E94\u5546", "\u5355\u4F4D\u540D\u79F0", "\u5BF9\u65B9\u5355\u4F4D", "\u5BF9\u65B9\u6237\u540D", "\u6838\u7B97\u9879\u76EE"],
  dept: ["\u90E8\u95E8", "\u8D39\u7528\u90E8\u95E8", "\u6240\u5C5E\u90E8\u95E8", "dept"],
  dueDate: ["\u5230\u671F\u65E5", "\u5230\u671F\u65E5\u671F", "\u5E94\u6536\u65E5\u671F", "\u5E94\u4ED8\u65E5\u671F", "\u4ED8\u6B3E\u671F\u9650", "due"],
  paid: ["\u5DF2\u6536\u91D1\u989D", "\u5DF2\u4ED8\u91D1\u989D", "\u5DF2\u6838\u9500\u91D1\u989D", "\u5DF2\u6536", "\u5DF2\u4ED8", "\u6838\u9500\u91D1\u989D"],
  terms: ["\u8D26\u671F", "\u4FE1\u7528\u671F", "\u8D26\u671F\u5929\u6570", "\u4FE1\u7528\u5929\u6570"],
  category: ["\u8D39\u7528\u7C7B\u522B", "\u8D39\u7528\u9879\u76EE", "\u9884\u7B97\u79D1\u76EE", "\u7C7B\u522B", "\u9879\u76EE", "\u79D1\u76EE"],
  month: ["\u6708\u4EFD", "\u671F\u95F4", "month"],
  product: ["\u4EA7\u54C1", "\u4EA7\u54C1\u540D\u79F0", "\u54C1\u540D", "\u6210\u672C\u5BF9\u8C61", "product"],
  output: ["\u5B8C\u5DE5\u6570\u91CF", "\u4EA7\u91CF", "\u5B8C\u5DE5\u4EA7\u91CF", "\u5165\u5E93\u6570\u91CF", "output"],
  hours: ["\u5DE5\u65F6", "\u751F\u4EA7\u5DE5\u65F6", "\u4EBA\u5DE5\u5DE5\u65F6", "hours"],
  machineHours: ["\u673A\u65F6", "\u673A\u5668\u5DE5\u65F6", "machine"],
  material: ["\u6750\u6599", "\u6750\u6599\u540D\u79F0", "\u7269\u6599", "\u7269\u6599\u540D\u79F0", "material"],
  qty: ["\u9886\u7528\u6570\u91CF", "\u8017\u7528\u6570\u91CF", "\u5B9E\u9645\u7528\u91CF", "\u6570\u91CF", "qty"],
  unitPrice: ["\u5355\u4EF7", "\u5355\u4F4D\u6210\u672C", "price"],
  stdPerUnit: ["\u5355\u8017", "\u6807\u51C6\u5355\u8017", "BOM\u7528\u91CF", "\u5B9A\u989D"],
  name: ["\u59D3\u540D", "\u5458\u5DE5\u59D3\u540D", "\u5458\u5DE5", "name"],
  idNo: ["\u8EAB\u4EFD\u8BC1\u53F7", "\u8BC1\u4EF6\u53F7\u7801", "\u8EAB\u4EFD\u8BC1"],
  level: ["\u804C\u7EA7", "\u7EA7\u522B"],
  salary: ["\u5E94\u53D1\u5DE5\u8D44", "\u5E94\u53D1\u5408\u8BA1", "\u7A0E\u524D\u5DE5\u8D44", "\u5DE5\u8D44", "\u6536\u5165\u989D"],
  insurance: ["\u4E2A\u4EBA\u793E\u4FDD\u516C\u79EF\u91D1", "\u4E09\u9669\u4E00\u91D1", "\u4E13\u9879\u6263\u9664", "\u4E2A\u4EBA\u793E\u4FDD", "\u793E\u4FDD\u516C\u79EF\u91D1"],
  special: ["\u4E13\u9879\u9644\u52A0\u6263\u9664", "\u4E13\u9879\u9644\u52A0", "\u9644\u52A0\u6263\u9664"],
  ytdSalary: ["\u7D2F\u8BA1\u6536\u5165", "\u7D2F\u8BA1\u5E94\u53D1"],
  ytdInsurance: ["\u7D2F\u8BA1\u4E13\u9879\u6263\u9664", "\u7D2F\u8BA1\u793E\u4FDD\u516C\u79EF\u91D1"],
  ytdSpecial: ["\u7D2F\u8BA1\u4E13\u9879\u9644\u52A0\u6263\u9664", "\u7D2F\u8BA1\u4E13\u9879\u9644\u52A0"],
  ytdTaxPaid: ["\u7D2F\u8BA1\u5DF2\u9884\u6263\u7A0E\u989D", "\u7D2F\u8BA1\u5DF2\u7F34\u7A0E\u989D", "\u5DF2\u9884\u6263\u7A0E\u989D"],
  monthIndex: ["\u7D2F\u8BA1\u6708\u6570", "\u4EFB\u804C\u6708\u6570", "\u6708\u6570"]
};

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/services/financeAgent/tables.ts
var KEYWORDS = columnKeywords_default;
function detectCols(headers, roles) {
  const norm = (s) => s.replace(/\s+/g, "").toLowerCase();
  const used = /* @__PURE__ */ new Set();
  const out = {};
  for (const role of roles) {
    let hit = "";
    for (const kw of KEYWORDS[role] || []) {
      hit = headers.find((h) => !used.has(h) && norm(h) === norm(kw)) || headers.find((h) => !used.has(h) && norm(h).includes(norm(kw))) || "";
      if (hit) break;
    }
    out[role] = hit;
    if (hit) used.add(hit);
  }
  return out;
}
function requireCols(cols, roles, labels, table) {
  const missing = roles.filter((r) => !cols[r]);
  if (missing.length) {
    throw new Error((0, import_i18n3.t)("\u300C{p0}\u300D\u91CC\u6CA1\u627E\u5230\u8FD9\u4E9B\u5217\uFF1A{p1}\u3002\u8868\u5934\u662F\uFF1A{p2}", {
      p0: table.fileName,
      p1: missing.map((m) => labels[m] || m).join("\u3001"),
      p2: table.headers.slice(0, 20).join(" / ")
    }));
  }
}
var LABELS = () => ({
  date: (0, import_i18n3.t)("\u65E5\u671F"),
  accountName: (0, import_i18n3.t)("\u79D1\u76EE\u540D\u79F0"),
  accountCode: (0, import_i18n3.t)("\u79D1\u76EE\u7F16\u7801"),
  debit: (0, import_i18n3.t)("\u501F\u65B9"),
  credit: (0, import_i18n3.t)("\u8D37\u65B9"),
  amount: (0, import_i18n3.t)("\u91D1\u989D"),
  counterparty: (0, import_i18n3.t)("\u5F80\u6765\u5355\u4F4D"),
  name: (0, import_i18n3.t)("\u59D3\u540D"),
  salary: (0, import_i18n3.t)("\u5E94\u53D1\u5DE5\u8D44"),
  product: (0, import_i18n3.t)("\u4EA7\u54C1"),
  output: (0, import_i18n3.t)("\u5B8C\u5DE5\u6570\u91CF"),
  material: (0, import_i18n3.t)("\u6750\u6599"),
  qty: (0, import_i18n3.t)("\u6570\u91CF"),
  unitPrice: (0, import_i18n3.t)("\u5355\u4EF7"),
  category: (0, import_i18n3.t)("\u7C7B\u522B"),
  dept: (0, import_i18n3.t)("\u90E8\u95E8")
});
function loadTable(path) {
  const t = (0, import_excel.readTable)(path);
  if (!t.rows.length) throw new Error((0, import_i18n3.t)("\u300C{p0}\u300D\u91CC\u6CA1\u6709\u6570\u636E\u884C", { p0: t.fileName }));
  return t;
}
function parseJournal(table) {
  const c = detectCols(table.headers, ["date", "voucherNo", "accountCode", "accountName", "summary", "debit", "credit", "counterparty", "dept"]);
  requireCols(c, ["date", "accountName", "debit", "credit"], LABELS(), table);
  let lastDate = "";
  let lastNo = "";
  const out = [];
  for (const r of table.rows) {
    const rawName = String(r[c.accountName] || "").trim();
    const m = rawName.match(/^(\d{4,})\s*[-_ ]?\s*(.+)$/);
    const code = String(c.accountCode && r[c.accountCode] || m?.[1] || "").trim();
    const name = (m ? m[2] : rawName).replace(/_/g, "-");
    const debit = (0, import_common3.toAmount)(r[c.debit]);
    const credit = (0, import_common3.toAmount)(r[c.credit]);
    if (!name || !debit && !credit) continue;
    const date = (0, import_common3.normDate)(r[c.date]) || lastDate;
    const no = String(c.voucherNo && r[c.voucherNo] || "").trim() || lastNo;
    lastDate = date;
    lastNo = no;
    out.push({
      date,
      voucherNo: no,
      summary: String(c.summary && r[c.summary] || ""),
      accountCode: code,
      accountName: name,
      debit: (0, import_common3.round2)(debit),
      credit: (0, import_common3.round2)(credit),
      counterparty: String(c.counterparty && r[c.counterparty] || "") || void 0,
      dept: String(c.dept && r[c.dept] || "") || void 0
    });
  }
  return out;
}
function parseBalances(table) {
  const c = detectCols(table.headers, ["accountCode", "accountName", "openingDebit", "openingCredit", "closingDebit", "closingCredit", "debit", "credit"]);
  requireCols(c, ["accountName"], LABELS(), table);
  if (!c.closingDebit && !c.closingCredit) throw new Error((0, import_i18n3.t)("\u300C{p0}\u300D\u91CC\u6CA1\u627E\u5230\u671F\u672B\u4F59\u989D\u5217\uFF08\u671F\u672B\u501F\u65B9 / \u671F\u672B\u8D37\u65B9\uFF09", { p0: table.fileName }));
  const out = [];
  for (const r of table.rows) {
    const rawName = String(r[c.accountName] || "").trim();
    const m = rawName.match(/^(\d{4,})\s*[-_ ]?\s*(.+)$/);
    const code = String(c.accountCode && r[c.accountCode] || m?.[1] || "").trim();
    const name = (m ? m[2] : rawName).trim();
    if (!name || /合计|总计/.test(name)) continue;
    const row = {
      code,
      name,
      openingDebit: (0, import_common3.toAmount)(c.openingDebit && r[c.openingDebit]),
      openingCredit: (0, import_common3.toAmount)(c.openingCredit && r[c.openingCredit]),
      debit: (0, import_common3.toAmount)(c.debit && r[c.debit]),
      credit: (0, import_common3.toAmount)(c.credit && r[c.credit]),
      closingDebit: (0, import_common3.toAmount)(c.closingDebit && r[c.closingDebit]),
      closingCredit: (0, import_common3.toAmount)(c.closingCredit && r[c.closingCredit])
    };
    if (Object.values(row).some((v) => typeof v === "number" && v !== 0)) out.push(row);
  }
  return out;
}
function parseRecRows(table, side, perspective) {
  const c = detectCols(table.headers, ["date", "ref", "summary", "debit", "credit", "amount", "counterparty"]);
  requireCols(c, ["date"], LABELS(), table);
  if (!c.amount && !(c.debit || c.credit)) throw new Error((0, import_i18n3.t)("\u300C{p0}\u300D\u91CC\u6CA1\u627E\u5230\u91D1\u989D\u5217\uFF08\u501F\u65B9 / \u8D37\u65B9 \u6216 \u91D1\u989D\uFF09", { p0: table.fileName }));
  const positiveIsDebit = side === "ar" === (perspective === "ours");
  const rows = [];
  const names = /* @__PURE__ */ new Map();
  for (const r of table.rows) {
    const date = (0, import_common3.normDate)(r[c.date]);
    const summary = String(c.summary && r[c.summary] || "");
    if (!date && /合计|余额|期初|本月合计|累计/.test(summary)) continue;
    let amount = 0;
    if (c.debit || c.credit) {
      const d = (0, import_common3.toAmount)(c.debit && r[c.debit]);
      const cr = (0, import_common3.toAmount)(c.credit && r[c.credit]);
      amount = positiveIsDebit ? d - cr : cr - d;
    } else amount = (0, import_common3.toAmount)(r[c.amount]);
    if (!date || !amount) continue;
    const cp = String(c.counterparty && r[c.counterparty] || "").trim();
    if (cp) names.set(cp, (names.get(cp) || 0) + 1);
    rows.push({ date, ref: String(c.ref && r[c.ref] || "").trim(), summary, amount: (0, import_common3.round2)(amount) });
  }
  const counterparty = [...names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  return { rows, counterparty };
}
function parseAgingRows(table, defaultTermsDays) {
  const c = detectCols(table.headers, ["counterparty", "ref", "date", "dueDate", "terms", "amount", "paid", "balance"]);
  requireCols(c, ["counterparty", "date"], LABELS(), table);
  if (!c.amount && !c.balance) throw new Error((0, import_i18n3.t)("\u300C{p0}\u300D\u91CC\u6CA1\u627E\u5230\u91D1\u989D\u6216\u4F59\u989D\u5217", { p0: table.fileName }));
  const out = [];
  for (const r of table.rows) {
    const date = (0, import_common3.normDate)(r[c.date]);
    const cp = String(r[c.counterparty] || "").trim();
    if (!date || !cp || /合计/.test(cp)) continue;
    const amount = (0, import_common3.toAmount)(c.amount ? r[c.amount] : r[c.balance]);
    const paid = c.amount && c.paid ? (0, import_common3.toAmount)(r[c.paid]) : c.amount && c.balance ? (0, import_common3.round2)(amount - (0, import_common3.toAmount)(r[c.balance])) : 0;
    const terms = c.terms ? Number(String(r[c.terms]).replace(/\D/g, "")) || defaultTermsDays : defaultTermsDays;
    const due = (0, import_common3.normDate)(c.dueDate && r[c.dueDate]);
    const dueDate = due || new Date(Date.parse(`${date}T00:00:00`) + terms * 864e5).toISOString().slice(0, 10);
    if (!amount) continue;
    out.push({ counterparty: cp, docNo: String(c.ref && r[c.ref] || ""), date, dueDate, amount: (0, import_common3.round2)(amount), paid: (0, import_common3.round2)(paid) });
  }
  return out;
}
function parsePayroll(table, monthIndex) {
  const c = detectCols(table.headers, ["ytdSalary", "ytdInsurance", "ytdSpecial", "ytdTaxPaid", "monthIndex", "name", "idNo", "salary", "insurance", "special"]);
  requireCols(c, ["name", "salary"], LABELS(), table);
  return table.rows.filter((r) => String(r[c.name] || "").trim() && !/合计/.test(String(r[c.name]))).map((r) => ({
    name: String(r[c.name]).trim(),
    idNo: c.idNo ? String(r[c.idNo] || "").trim() || void 0 : void 0,
    salary: (0, import_common3.toAmount)(r[c.salary]),
    insurance: (0, import_common3.toAmount)(c.insurance && r[c.insurance]),
    special: (0, import_common3.toAmount)(c.special && r[c.special]),
    ytdSalary: (0, import_common3.toAmount)(c.ytdSalary && r[c.ytdSalary]),
    ytdInsurance: (0, import_common3.toAmount)(c.ytdInsurance && r[c.ytdInsurance]),
    ytdSpecial: (0, import_common3.toAmount)(c.ytdSpecial && r[c.ytdSpecial]),
    ytdTaxPaid: (0, import_common3.toAmount)(c.ytdTaxPaid && r[c.ytdTaxPaid]),
    monthIndex: c.monthIndex && Number(r[c.monthIndex]) || monthIndex
  }));
}
function parseBudget(table) {
  const c = detectCols(table.headers, ["dept", "category"]);
  requireCols(c, ["category"], LABELS(), table);
  const monthCols = [];
  for (const h of table.headers) {
    const m = h.replace(/\s+/g, "").match(/^(\d{1,2})月|^(?:M|m)(\d{1,2})$|-(\d{2})$/);
    const n = Number(m?.[1] || m?.[2] || m?.[3]);
    if (n >= 1 && n <= 12) monthCols.push([n, h]);
  }
  const annual = table.headers.find((h) => /全年|年度|合计|预算金额|预算/.test(h) && !monthCols.some(([, x]) => x === h));
  if (!monthCols.length && !annual) throw new Error((0, import_i18n3.t)("\u9884\u7B97\u8868\u91CC\u6CA1\u627E\u5230\u6708\u4EFD\u5217\uFF081\u6708\u202612\u6708\uFF09\u6216\u5168\u5E74\u9884\u7B97\u5217"));
  const out = [];
  for (const r of table.rows) {
    const category = String(r[c.category] || "").trim();
    if (!category || /合计/.test(category)) continue;
    const months = Array(12).fill(0);
    if (monthCols.length) for (const [n, h] of monthCols) months[n - 1] = (0, import_common3.toAmount)(r[h]);
    else {
      const total = (0, import_common3.toAmount)(r[annual]);
      const each = (0, import_common3.round2)(total / 12);
      for (let i = 0; i < 12; i++) months[i] = i === 11 ? (0, import_common3.round2)(total - each * 11) : each;
    }
    out.push({ dept: String(c.dept && r[c.dept] || "").trim() || (0, import_i18n3.t)("\u5168\u516C\u53F8"), category, months });
  }
  return out;
}
function parseCostProducts(table) {
  const c = detectCols(table.headers, ["product", "output", "machineHours", "hours"]);
  requireCols(c, ["product", "output"], LABELS(), table);
  return table.rows.filter((r) => String(r[c.product] || "").trim() && !/合计/.test(String(r[c.product]))).map((r) => ({
    name: String(r[c.product]).trim(),
    output: (0, import_common3.toAmount)(r[c.output]),
    hours: (0, import_common3.toAmount)(c.hours && r[c.hours]),
    machineHours: (0, import_common3.toAmount)(c.machineHours && r[c.machineHours])
  }));
}
function parseCostMaterials(table) {
  const c = detectCols(table.headers, ["product", "material", "qty", "unitPrice", "amount", "stdPerUnit"]);
  requireCols(c, ["product", "material"], LABELS(), table);
  if (!c.qty && !c.amount) throw new Error((0, import_i18n3.t)("\u6750\u6599\u8868\u91CC\u6CA1\u627E\u5230\u6570\u91CF\u6216\u91D1\u989D\u5217"));
  return table.rows.filter((r) => String(r[c.product] || "").trim() && String(r[c.material] || "").trim()).map((r) => {
    const qty = (0, import_common3.toAmount)(c.qty && r[c.qty]);
    const price = c.unitPrice ? (0, import_common3.toAmount)(r[c.unitPrice]) : qty ? (0, import_common3.round2)((0, import_common3.toAmount)(r[c.amount]) / qty) : (0, import_common3.toAmount)(r[c.amount]);
    return {
      product: String(r[c.product]).trim(),
      material: String(r[c.material]).trim(),
      qty: qty || 1,
      unitPrice: price,
      stdPerUnit: c.stdPerUnit ? (0, import_common3.toAmount)(r[c.stdPerUnit]) || void 0 : void 0
    };
  });
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/services/financeAgent/apiReceiver.ts
var import_node_http = require("node:http");
var import_node_crypto = require("node:crypto");
var MAX_BODY = 20 * 1024 * 1024;
var FinanceApiReceiver = class {
  constructor(handler) {
    this.handler = handler;
  }
  server = null;
  error = "";
  port = 0;
  status() {
    return this.server ? { running: true, url: `http://127.0.0.1:${this.port}/finance/import` } : { running: false, error: this.error || void 0 };
  }
  async start(port, token) {
    await this.stop();
    this.error = "";
    const expected = Buffer.from(`Bearer ${token}`);
    const server = (0, import_node_http.createServer)((req, res) => {
      const reply = (code, body) => {
        res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(body));
      };
      if (req.method !== "POST" || !/^\/finance\/import\/?$/.test(req.url || "")) return reply(404, { ok: false, error: "not_found" });
      const auth = Buffer.from(String(req.headers.authorization || ""));
      if (auth.length !== expected.length || !(0, import_node_crypto.timingSafeEqual)(auth, expected)) return reply(401, { ok: false, error: "unauthorized" });
      let size = 0;
      const chunks = [];
      req.on("data", (c) => {
        size += c.length;
        if (size > MAX_BODY) {
          reply(413, { ok: false, error: "too_large" });
          req.destroy();
          return;
        }
        chunks.push(c);
      });
      req.on("end", () => {
        if (size > MAX_BODY) return;
        let body;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
        } catch {
          return reply(400, { ok: false, error: "invalid_json" });
        }
        if (!body || !Array.isArray(body.rows) || !body.kind) return reply(400, { ok: false, error: "kind_and_rows_required" });
        this.handler(body).then((r) => reply(200, r)).catch((e) => reply(422, { ok: false, error: e?.message || "import_failed" }));
      });
    });
    await new Promise((resolve, reject) => {
      server.once("error", (e) => {
        this.error = e.message;
        reject(e);
      });
      server.listen(port, "127.0.0.1", () => resolve());
    });
    this.server = server;
    this.port = port;
  }
  async stop() {
    const s = this.server;
    this.server = null;
    if (s) await new Promise((r) => s.close(() => r()));
  }
};

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/services/financeAgent/prompts.ts
var JSON_ONLY = "\u53EA\u8F93\u51FA\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u4E0D\u8981 Markdown \u4EE3\u7801\u5757\uFF0C\u4E0D\u8981\u89E3\u91CA\u3002";
var NO_NUMBERS = "\u6587\u4E2D\u51FA\u73B0\u7684\u6240\u6709\u91D1\u989D\u3001\u6BD4\u4F8B\u5FC5\u987B\u539F\u6837\u53D6\u81EA\u4E0A\u9762\u7ED9\u51FA\u7684\u6570\u636E\uFF0C\u4E0D\u5F97\u81EA\u884C\u8BA1\u7B97\u3001\u56DB\u820D\u4E94\u5165\u6216\u7F16\u9020\u65B0\u7684\u6570\u5B57\uFF1B\u6570\u636E\u91CC\u6CA1\u6709\u7684\u5C31\u4E0D\u8981\u5199\u3002";
function invoiceFillPrompt(text, missing, categories) {
  return [
    "\u4F60\u5728\u5E2E\u8D22\u52A1\u4ECE\u7968\u636E\u8BC6\u522B\u6587\u5B57\u91CC\u6284\u5B57\u6BB5\u3002\u4E0B\u9762\u662F\u4E00\u5F20\u53D1\u7968 / \u5BA2\u7968 / \u94F6\u884C\u56DE\u5355 OCR \u6216\u6587\u5B57\u5C42\u7684\u539F\u6587\u3002",
    `\u9700\u8981\u8865\u7684\u5B57\u6BB5\uFF1A${missing.join("\u3001")}\u3002\u5B57\u6BB5\u542B\u4E49\uFF1AinvoiceNo \u53D1\u7968\u53F7\u7801\uFF1BinvoiceCode \u53D1\u7968\u4EE3\u7801\uFF1Bdate \u5F00\u7968\u65E5\u671F\uFF08YYYY-MM-DD\uFF09\uFF1BbuyerName / buyerTaxId \u8D2D\u4E70\u65B9\u540D\u79F0 / \u7EB3\u7A0E\u4EBA\u8BC6\u522B\u53F7\uFF1BsellerName / sellerTaxId \u9500\u552E\u65B9\u540D\u79F0 / \u7EB3\u7A0E\u4EBA\u8BC6\u522B\u53F7\uFF1Bamount \u4E0D\u542B\u7A0E\u91D1\u989D\uFF1Btax \u7A0E\u989D\uFF1Btotal \u4EF7\u7A0E\u5408\u8BA1\uFF1BtaxRate \u7A0E\u7387\uFF08\u5C0F\u6570\uFF0C\u5982 0.06\uFF09\uFF1Bpayer / payee \u4ED8\u6B3E\u65B9 / \u6536\u6B3E\u65B9\uFF1Bpurpose \u7528\u9014\u3002`,
    `\u53E6\u7ED9\u51FA\u8D39\u7528\u7C7B\u522B category\uFF0C\u53EA\u80FD\u4ECE\u8FD9\u4E9B\u91CC\u9009\u4E00\u4E2A\uFF1A${categories.join("\u3001")}\u3002`,
    "\u89C4\u5219\uFF1A\u6BCF\u4E2A\u503C\u5FC5\u987B\u80FD\u5728\u539F\u6587\u91CC\u9010\u5B57\u627E\u5230\uFF08\u6570\u5B57\u5141\u8BB8\u53BB\u6389\u5343\u5206\u4F4D\u548C \xA5\uFF09\uFF1B\u539F\u6587\u91CC\u6CA1\u6709\u7684\u5B57\u6BB5\u586B null\uFF0C\u4E0D\u8981\u731C\u3002",
    JSON_ONLY,
    '\u683C\u5F0F\uFF1A{"fields": {"\u5B57\u6BB5\u540D": \u503C \u6216 null}, "category": "\u7C7B\u522B"}',
    "--- \u539F\u6587 ---",
    text.slice(0, 6e3)
  ].join("\n");
}
function taxNotePrompt(ledger, period, facts, findings) {
  return [
    `\u4F60\u662F\u4F01\u4E1A\u7684\u7A0E\u52A1\u4F1A\u8BA1\uFF0C\u4E3A\u300C${ledger}\u300D${period} \u7684\u7EB3\u7A0E\u7533\u62A5\u5199\u4E00\u4EFD\u7533\u62A5\u5907\u6CE8\uFF0C\u7ED9\u590D\u6838\u4EBA\u770B\u3002`,
    "\u5185\u5BB9\uFF1A\u672C\u671F\u5404\u7A0E\u79CD\u5E94\u7EB3\u7A0E\u989D\u6982\u51B5\u3001\u4E0E\u4E0A\u671F\u6216\u8D26\u9762\u76F8\u6BD4\u7684\u4E3B\u8981\u5DEE\u5F02\u53CA\u539F\u56E0\u63D0\u793A\u3001\u98CE\u9669\u9884\u68C0\u53D1\u73B0\u7684\u95EE\u9898\u4E0E\u5904\u7406\u5EFA\u8BAE\u3001\u7533\u62A5\u524D\u9700\u8981\u4EBA\u5DE5\u786E\u8BA4\u7684\u4E8B\u9879\u6E05\u5355\u3002",
    "\u8BED\u6C14\uFF1A\u7B80\u6D01\u3001\u4E13\u4E1A\uFF0C\u5206\u5C0F\u6807\u9898\uFF0C300\uFF5E600 \u5B57\u3002\u660E\u786E\u5199\u51FA\u300C\u672C\u5907\u6CE8\u4E3A\u8349\u7A3F\uFF0C\u7533\u62A5\u987B\u7531\u8D22\u52A1\u4EBA\u5458\u5728\u7535\u5B50\u7A0E\u52A1\u5C40\u4EBA\u5DE5\u6838\u5BF9\u540E\u63D0\u4EA4\u300D\u3002",
    NO_NUMBERS,
    "--- \u89C4\u5219\u7B97\u51FA\u7684\u6570\u636E ---",
    facts,
    "--- \u98CE\u9669\u9884\u68C0 ---",
    findings || "\u65E0"
  ].join("\n");
}
function statementAnalysisPrompt(ledger, period, facts, notes) {
  return [
    `\u4E3A\u300C${ledger}\u300D${period} \u7684\u8D22\u52A1\u62A5\u8868\u5199\u4E00\u6BB5\u7ECF\u8425\u7B80\u8981\u5206\u6790\uFF0C\u7ED9\u8001\u677F\u770B\u3002`,
    "\u4E09\u90E8\u5206\uFF1A\u8425\u6536\uFF08\u89C4\u6A21\u4E0E\u53D8\u52A8\uFF09\u3001\u6BDB\u5229\uFF08\u6BDB\u5229\u989D\u3001\u6BDB\u5229\u7387\u53CA\u53D8\u52A8\u539F\u56E0\u7684\u53EF\u80FD\u65B9\u5411\uFF09\u3001\u8D39\u7528\u6CE2\u52A8\uFF08\u54EA\u7C7B\u8D39\u7528\u53D8\u5316\u5927\uFF09\uFF1B\u6700\u540E\u7ED9 2\uFF5E3 \u6761\u5173\u6CE8\u5EFA\u8BAE\u3002",
    "\u6709\u4E0A\u671F\u6570\u636E\u624D\u8C08\u53D8\u52A8\uFF0C\u6CA1\u6709\u5C31\u53EA\u63CF\u8FF0\u672C\u671F\u3002\u53EF\u80FD\u539F\u56E0\u53EA\u80FD\u5199\u6210\u300C\u53EF\u80FD\u300D\u300C\u5EFA\u8BAE\u6838\u5B9E\u300D\uFF0C\u4E0D\u80FD\u4E0B\u7ED3\u8BBA\u3002",
    "300\uFF5E500 \u5B57\uFF0C\u5206\u5C0F\u6807\u9898\u3002",
    NO_NUMBERS,
    "--- \u62A5\u8868\u6570\u636E ---",
    facts,
    notes ? `--- \u8D26\u5957\u5907\u6CE8\uFF08\u6B64\u524D\u7684\u8BB0\u5F55\uFF0C\u4F9B\u53C2\u8003\uFF09 ---
${notes.slice(0, 1500)}` : ""
  ].filter(Boolean).join("\n");
}
function riskSummaryPrompt(ledger, findings) {
  return [
    `\u4EE5\u4E0B\u662F\u5BF9\u300C${ledger}\u300D\u8D26\u5957\u6309\u56FA\u5B9A\u89C4\u5219\u5DE1\u68C0\u51FA\u7684\u8D22\u7A0E\u98CE\u9669\u70B9\u3002\u5199\u4E00\u6BB5\u603B\u4F53\u7ED3\u8BBA\uFF08150\uFF5E300 \u5B57\uFF09\uFF1A`,
    "\u6574\u4F53\u98CE\u9669\u6C34\u5E73\u3001\u6700\u9700\u8981\u4F18\u5148\u5904\u7406\u7684 2\uFF5E3 \u9879\u53CA\u7406\u7531\u3001\u6574\u6539\u7684\u5148\u540E\u987A\u5E8F\u3002\u4E0D\u8981\u9010\u6761\u590D\u8FF0\u660E\u7EC6\uFF0C\u660E\u7EC6\u4F1A\u53E6\u5217\u3002",
    NO_NUMBERS,
    "--- \u98CE\u9669\u70B9 ---",
    findings
  ].join("\n");
}
function budgetCommentaryPrompt(ledger, facts) {
  return [
    `\u4E3A\u300C${ledger}\u300D\u5199\u4E00\u6BB5\u6708\u5EA6\u9884\u7B97\u6267\u884C\u89E3\u8BFB\uFF08200\uFF5E400 \u5B57\uFF09\uFF1A\u603B\u4F53\u6267\u884C\u7387\u3001\u8D85\u9884\u7B97\u548C\u63A5\u8FD1\u4E0A\u9650\u7684\u90E8\u95E8 / \u7C7B\u522B\u3001\u672C\u6708\u4E0E\u9884\u7B97\u7684\u5DEE\u5F02\u3001\u7ED9\u9884\u7B97\u8D1F\u8D23\u4EBA\u7684\u5EFA\u8BAE\uFF08\u63A7\u5236\u63AA\u65BD\u6216\u8C03\u6574\u9884\u7B97\u7684\u7406\u7531\uFF09\u3002`,
    NO_NUMBERS,
    "--- \u9884\u7B97\u6267\u884C\u6570\u636E ---",
    facts
  ].join("\n");
}
function costCommentaryPrompt(ledger, facts) {
  return [
    `\u4E3A\u300C${ledger}\u300D\u7684\u6210\u672C\u6838\u7B97\u7ED3\u679C\u5199\u4E00\u6BB5\u6210\u672C\u5206\u6790\uFF08200\uFF5E400 \u5B57\uFF09\uFF1A\u5404\u4EA7\u54C1\u5355\u4F4D\u6210\u672C\u6784\u6210\uFF08\u6599\u5DE5\u8D39\u5360\u6BD4\uFF09\u3001\u4E0E\u4E0A\u671F\u7684\u6CE2\u52A8\u3001\u5F02\u5E38\u635F\u8017\u63D0\u793A\u3001\u6539\u8FDB\u5EFA\u8BAE\u3002`,
    NO_NUMBERS,
    "--- \u6210\u672C\u6570\u636E ---",
    facts
  ].join("\n");
}
function contractPrompt(text) {
  return [
    "\u4F60\u5728\u505A\u5408\u540C\u8D22\u7A0E\u5BA1\u6838\u3002\u8BFB\u4E0B\u9762\u7684\u5408\u540C\u539F\u6587\uFF0C\u505A\u4E24\u4EF6\u4E8B\uFF1A",
    "1. \u62BD\u51FA\u6D89\u7A0E\u6761\u6B3E clauses\uFF1Atype \u53D6\u300C\u4EF7\u6B3E\u300D\u300C\u7A0E\u7387\u300D\u300C\u53D1\u7968\u7C7B\u578B\u300D\u300C\u5F00\u7968\u65F6\u95F4\u300D\u300C\u4ED8\u6B3E\u8282\u70B9\u300D\u300C\u7A0E\u8D39\u627F\u62C5\u300D\u300C\u6536\u6B3E\u8D26\u6237\u300D\u300C\u8FDD\u7EA6\u8D23\u4EFB\u300D\u4E4B\u4E00\uFF1Bquote \u5FC5\u987B\u662F\u539F\u6587\u91CC\u9010\u5B57\u8FDE\u7EED\u7684\u4E00\u53E5\uFF08\u4E0D\u8D85\u8FC7 80 \u5B57\uFF09\uFF1Bvalue \u7528\u4E00\u53E5\u8BDD\u6982\u62EC\u7EA6\u5B9A\u5185\u5BB9\u3002",
    "2. \u627E\u51FA\u8D22\u7A0E\u98CE\u9669\u6761\u6B3E risks\uFF1Alevel \u4E3A high / warn / info\uFF1Btitle \u4E00\u53E5\u8BDD\uFF1Bquote \u4E3A\u539F\u6587\u9010\u5B57\u5F15\u7528\uFF1Bdetail \u8BF4\u660E\u4E3A\u4EC0\u4E48\u6709\u98CE\u9669\uFF1Bsuggestion \u7ED9\u4FEE\u6539\u5EFA\u8BAE\u3002\u53EA\u5217\u6709\u539F\u6587\u4F9D\u636E\u7684\uFF0C\u6CA1\u6709\u5C31\u8FD4\u56DE\u7A7A\u6570\u7EC4\u3002",
    "\u91CD\u70B9\u5173\u6CE8\uFF1A\u4EF7\u7A0E\u662F\u5426\u5206\u79BB\u3001\u53D1\u7968\u7C7B\u578B\u4E0E\u7A0E\u7387\u662F\u5426\u4E0E\u4E1A\u52A1\u5339\u914D\u3001\u5F00\u7968\u4E0E\u4ED8\u6B3E\u7684\u5148\u540E\u3001\u5305\u7A0E\u6761\u6B3E\u3001\u4ED8\u6B3E\u5230\u4E2A\u4EBA\u8D26\u6237\u3001\u6536\u6B3E\u65B9\u4E0E\u7B7E\u7EA6\u65B9\u4E0D\u4E00\u81F4\u3001\u9884\u4ED8\u6B3E\u6BD4\u4F8B\u8FC7\u9AD8\u3001\u65E0\u53D1\u7968\u4E0D\u5408\u89C4\u8D23\u4EFB\u6761\u6B3E\u3001\u6DF7\u5408\u9500\u552E / \u517C\u8425\u672A\u5206\u522B\u7EA6\u5B9A\u4EF7\u6B3E\u3002",
    JSON_ONLY,
    '\u683C\u5F0F\uFF1A{"clauses":[{"type":"","quote":"","value":""}],"risks":[{"level":"warn","title":"","quote":"","detail":"","suggestion":""}]}',
    "--- \u5408\u540C\u539F\u6587 ---",
    text.slice(0, 24e3)
  ].join("\n");
}
function qaPrompt(question, citations, history, ledger) {
  const refs = citations.map((c, i) => `[${i + 1}] ${c.title}${c.ref ? `\uFF08${c.ref}\uFF09` : ""}
${c.excerpt}`).join("\n\n");
  const hist = history.slice(-8).map((m) => `${m.role === "user" ? "\u95EE" : "\u7B54"}\uFF1A${m.text.slice(0, 600)}`).join("\n");
  return [
    "\u4F60\u662F\u4F01\u4E1A\u7684\u8D22\u7A0E\u95EE\u7B54\u52A9\u624B\uFF0C\u56DE\u7B54\u5458\u5DE5\u6216\u5BA2\u6237\u7684\u8D22\u7A0E\u95EE\u9898\uFF08\u5F00\u7968\u3001\u4E2A\u7A0E\u3001\u5C0F\u89C4\u6A21\u4F18\u60E0\u3001\u62A5\u9500\u3001\u8D26\u52A1\u5904\u7406\u7B49\uFF09\u3002",
    `\u5F53\u524D\u8D26\u5957\uFF1A${ledger.name}\uFF08${ledger.taxpayer}\uFF09\u3002`,
    ledger.notes ? `\u8D26\u5957\u5907\u6CE8\uFF1A${ledger.notes.slice(0, 800)}` : "",
    "\u56DE\u7B54\u89C4\u5219\uFF1A",
    "- \u53EA\u4F9D\u636E\u4E0B\u9762\u7684\u53C2\u8003\u8D44\u6599\u4F5C\u7B54\uFF0C\u7528 [1] [2] \u6807\u51FA\u4F9D\u636E\uFF1B\u8D44\u6599\u91CC\u6CA1\u6709\u7684\uFF0C\u660E\u8BF4\u300C\u5185\u7F6E\u8D44\u6599\u548C\u4F01\u4E1A\u5236\u5EA6\u91CC\u6CA1\u6709\u627E\u5230\u4F9D\u636E\u300D\uFF0C\u53EF\u4EE5\u7ED9\u4E00\u822C\u6027\u601D\u8DEF\u4F46\u8981\u6807\u660E\u9700\u8981\u6838\u5B9E\u3002",
    "- \u4F01\u4E1A\u5185\u90E8\u5236\u5EA6\u4E0E\u7A0E\u6CD5\u51B2\u7A81\u65F6\uFF0C\u4EE5\u7A0E\u6CD5\u4E3A\u51C6\u5E76\u6307\u51FA\u51B2\u7A81\u3002",
    "- \u6D89\u53CA\u8BA1\u7B97\u7684\u7ED9\u51FA\u8BA1\u7B97\u8FC7\u7A0B\uFF1B\u653F\u7B56\u6709\u6267\u884C\u671F\u9650\u7684\u5199\u660E\u671F\u9650\u3002",
    "- \u7ED3\u5C3E\u63D0\u9192\uFF1A\u5177\u4F53\u4EE5\u4E3B\u7BA1\u7A0E\u52A1\u673A\u5173\u6700\u65B0\u53E3\u5F84\u4E3A\u51C6\u3002",
    "- \u7528\u63D0\u95EE\u6240\u7528\u7684\u8BED\u8A00\u56DE\u7B54\uFF0C\u7B80\u6D01\u5206\u70B9\u3002",
    hist ? `--- \u4E4B\u524D\u7684\u5BF9\u8BDD ---
${hist}` : "",
    "--- \u53C2\u8003\u8D44\u6599 ---",
    refs || "\uFF08\u6CA1\u6709\u68C0\u7D22\u5230\u76F8\u5173\u8D44\u6599\uFF09",
    "--- \u95EE\u9898 ---",
    question
  ].filter(Boolean).join("\n");
}
function expenseNoticePrompt(notice) {
  return [
    "\u628A\u4E0B\u9762\u8FD9\u6BB5\u62A5\u9500\u9884\u5BA1\u901A\u77E5\u6539\u5199\u5F97\u66F4\u793C\u8C8C\u3001\u6E05\u695A\uFF0C\u7ED9\u5458\u5DE5\u770B\u3002\u4FDD\u6301\u6240\u6709\u539F\u56E0\u6761\u76EE\u3001\u91D1\u989D\u4E0E\u6570\u5B57\u5B8C\u5168\u4E0D\u53D8\uFF0C\u4E0D\u589E\u52A0\u65B0\u7684\u8981\u6C42\u3002\u53EA\u8F93\u51FA\u6539\u5199\u540E\u7684\u6B63\u6587\u3002",
    notice
  ].join("\n");
}
function filingInstruction(input) {
  return [
    `\u8BF7\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u91CC\u5E2E\u6211\u5728\u7535\u5B50\u7A0E\u52A1\u5C40\u586B\u5199\u300C${input.ledger}\u300D\uFF08\u7EB3\u7A0E\u4EBA\u8BC6\u522B\u53F7 ${input.taxId}\uFF0C${input.taxpayer}\uFF09\u6240\u5C5E\u671F ${input.period} \u7684\u7EB3\u7A0E\u7533\u62A5\u3002`,
    "",
    "\u5FC5\u987B\u9075\u5B88\uFF1A",
    `1. \u6253\u5F00 ${input.portal}\u3002\u5982\u679C\u770B\u5230\u767B\u5F55\u9875 / \u626B\u7801\u9875 / \u8EAB\u4EFD\u9A8C\u8BC1\uFF0C\u505C\u4E0B\u6765\u544A\u8BC9\u6211\u5148\u767B\u5F55\uFF0C\u767B\u5F55\u7531\u6211\u672C\u4EBA\u5B8C\u6210\uFF0C\u4F60\u4E0D\u8981\u5C1D\u8BD5\u8F93\u5165\u8D26\u53F7\u5BC6\u7801\u6216\u9A8C\u8BC1\u7801\u3002`,
    "2. \u6838\u5BF9\u9875\u9762\u4E0A\u7684\u7EB3\u7A0E\u4EBA\u540D\u79F0\u548C\u8BC6\u522B\u53F7\u4E0E\u4E0A\u9762\u4E00\u81F4\uFF0C\u4E0D\u4E00\u81F4\u7ACB\u523B\u505C\u4E0B\u6765\u544A\u8BC9\u6211\u3002",
    "3. \u6309\u4E0B\u9762\u7684\u6570\u5B57\u9010\u9879\u586B\u5199\u5BF9\u5E94\u7533\u62A5\u8868\u3002\u7535\u5B50\u7A0E\u52A1\u5C40\u9884\u586B\u7684\u6570\u636E\uFF08\u5F00\u7968\u3001\u8BA4\u8BC1\u6570\u636E\uFF09\u5982\u679C\u548C\u4E0B\u9762\u7684\u6570\u5B57\u4E0D\u4E00\u6837\uFF0C\u4E0D\u8981\u6539\u6210\u4EFB\u4F55\u4E00\u8FB9\uFF0C\u505C\u4E0B\u6765\u628A\u4E24\u8FB9\u7684\u6570\u5B57\u90FD\u5217\u7ED9\u6211\u3002",
    "4. \u6240\u6709\u8868\u90FD\u586B\u597D\u540E\uFF0C\u5728\u70B9\u51FB\u300C\u63D0\u4EA4\u7533\u62A5\u300D\u300C\u786E\u8BA4\u7533\u62A5\u300D\u300C\u7F34\u6B3E\u300D\u4E4B\u524D\u4E00\u5B9A\u505C\u4E0B\u6765\uFF0C\u628A\u6BCF\u5F20\u8868\u7684\u5173\u952E\u680F\u6B21\u548C\u586B\u5199\u503C\u5217\u7ED9\u6211\u6838\u5BF9\u3002\u63D0\u4EA4\u4E0E\u7F34\u6B3E\u7531\u6211\u672C\u4EBA\u70B9\u51FB\uFF0C\u4F60\u4E0D\u8981\u70B9\u3002",
    "5. \u5982\u679C\u67D0\u5F20\u8868\u627E\u4E0D\u5230\u3001\u680F\u6B21\u5BF9\u4E0D\u4E0A\u3001\u6216\u9875\u9762\u8981\u6C42\u586B\u5199\u4E0B\u9762\u6CA1\u6709\u7684\u6570\u636E\uFF0C\u505C\u4E0B\u6765\u95EE\u6211\uFF0C\u4E0D\u8981\u731C\u3002",
    "",
    ...input.sections.flatMap((s) => [`\u3010${s.title}\u3011`, ...s.lines.map((l) => `- ${l}`), ""]),
    "\u4EE5\u4E0A\u6570\u5B57\u7531\u8D22\u52A1\u667A\u80FD\u4F53\u6309\u89C4\u5219\u8BA1\u7B97\uFF0C\u5DF2\u7531\u8D22\u52A1\u590D\u6838\uFF1B\u672C\u6B21\u53EA\u505A\u586B\u5199\uFF0C\u4E0D\u505A\u63D0\u4EA4\u3002"
  ].join("\n");
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-solutions/solutions/workbench-finance-agent/src/main/ipc/financeAgent.ipc.ts
var import_filing = require("host:apps/desktop-shell/src/main/services/financeAgent/filing.ts");
var import_brandPaths = require("host:apps/desktop-shell/src/main/services/brandPaths.ts");
var store = new import_store.FinanceAgentStore();
var IMAGE_RE = /\.(jpe?g|png|heic|webp|bmp|tiff?)$/i;
var DOC_FILTERS = {
  invoice: [{ name: "Invoice", extensions: ["pdf", "ofd", "xml", "jpg", "jpeg", "png", "heic", "webp"] }],
  excel: [{ name: "Excel", extensions: ["xlsx", "xls", "csv"] }],
  contract: [{ name: "Contract", extensions: ["pdf", "docx", "doc", "txt", "jpg", "jpeg", "png"] }],
  policy: [{ name: "Document", extensions: ["pdf", "docx", "doc", "txt", "md", "xlsx"] }]
};
function requireFound(value, what) {
  if (value == null) throw new Error((0, import_i18n4.t)("{p0}\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664", { p0: what }));
  return value;
}
function safeName(s) {
  return String(s || "").replace(/[\\/:*?"<>|\r\n]/g, "_").trim().slice(0, 80) || "file";
}
async function extractText(path) {
  const r = await extractTextRaw(path);
  return { ...r, text: (0, import_common4.normalizePdfText)(r.text) };
}
async function extractTextRaw(path) {
  const ext = (0, import_node_path.extname)(path).toLowerCase();
  if (IMAGE_RE.test(path)) {
    const { ocrAvailable, ocrImageFiles } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/pdfOcr.ts"), 1));
    if (!ocrAvailable()) return { text: "", ocr: false, warning: (0, import_i18n4.t)("\u672C\u673A\u4E0D\u652F\u6301\u56FE\u7247\u8BC6\u522B\uFF0C\u8BF7\u4E0A\u4F20 PDF \u7535\u5B50\u53D1\u7968\uFF0C\u6216\u8BC6\u522B\u540E\u624B\u5DE5\u8865\u5168\u5B57\u6BB5") };
    const m = await ocrImageFiles([path]);
    return { text: m.get(path) || "", ocr: true, warning: m.get(path) ? void 0 : (0, import_i18n4.t)("\u56FE\u7247\u91CC\u6CA1\u6709\u8BC6\u522B\u51FA\u6587\u5B57") };
  }
  if (ext === ".ofd") {
    const AdmZip = (await Promise.resolve().then(() => __toESM(require("npm:adm-zip"), 1))).default;
    const zip = new AdmZip(path);
    const entries = zip.getEntries().filter((e) => /Pages\/Page_\d+\/Content\.xml$/i.test(e.entryName) || /original_invoice\.xml$/i.test(e.entryName));
    const text = entries.map((e) => [...e.getData().toString("utf-8").matchAll(/<ofd:TextCode[^>]*>([^<]*)<\/ofd:TextCode>|<(\w+)>([^<]{1,200})<\/\2>/g)].map((m) => m[1] != null ? m[1] : `${m[2]}: ${m[3]}`).join("\n")).join("\n");
    return { text, ocr: false, warning: text ? void 0 : (0, import_i18n4.t)("OFD \u6587\u4EF6\u91CC\u6CA1\u6709\u8BFB\u5230\u6587\u5B57") };
  }
  if (ext === ".xml") {
    const raw = (0, import_node_fs.readFileSync)(path, "utf-8");
    const text = [...raw.matchAll(/<(\w+)>([^<]{1,300})<\/\1>/g)].map((m) => `${m[1]}: ${m[2].trim()}`).join("\n");
    return { text, ocr: false };
  }
  const { extractDocument, mergeOcrPages } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/documentExtractor.ts"), 1));
  let doc = await extractDocument(path, (0, import_node_path.basename)(path));
  let ocr = false;
  if (doc.kind === "pdf" && doc.scannedPages?.length) {
    const { ocrAvailable, ocrPdfPages } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/pdfOcr.ts"), 1));
    if (ocrAvailable()) {
      const pages = await ocrPdfPages(path, doc.scannedPages.slice(0, 20));
      if (pages.size) {
        doc = mergeOcrPages(doc, [...pages].map(([page, text]) => ({ page, text })));
        ocr = true;
      }
    }
  }
  return { text: doc.text || "", ocr, warning: doc.warning };
}
function registerFinanceAgentHandlers(deps) {
  const logger = deps.logger;
  const win = () => deps.getMainWindow?.() ?? null;
  const broadcast = (type, payload) => {
    try {
      win()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_FA_EVENT, { type, payload });
    } catch {
    }
  };
  const progress = (key, message) => broadcast("progress", { key, message });
  const pushState = () => broadcast("state");
  const settings = () => store.root().settings;
  const ledger = () => store.activeLedger();
  const outputRoot = () => {
    const s = settings();
    const root = s.outputDir && (0, import_node_fs.existsSync)(s.outputDir) ? s.outputDir : (0, import_node_path.join)(import_electron.app.getPath("documents"), (0, import_brandPaths.documentsFolderName)(), (0, import_i18n4.t)("\u8D22\u52A1\u667A\u80FD\u4F53"));
    (0, import_node_fs.mkdirSync)(root, { recursive: true });
    return root;
  };
  const outDir = (module2) => {
    const d = (0, import_node_path.join)(outputRoot(), safeName(ledger().name), module2);
    (0, import_node_fs.mkdirSync)(d, { recursive: true });
    return d;
  };
  const stamp = () => {
    const d = /* @__PURE__ */ new Date();
    return `${(0, import_common4.localDate)(d).replace(/-/g, "")}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}${String(d.getSeconds()).padStart(2, "0")}`;
  };
  const api = new FinanceApiReceiver(async (req) => apiImport(req));
  const publicState = () => {
    const r = store.root();
    return { ledgers: r.ledgers, activeLedgerId: r.activeLedgerId, settings: r.settings, data: store.data(), outputDir: outputRoot(), apiStatus: api.status(), categories: (0, import_common4.categoryNames)() };
  };
  const models = (0, import_workbenchLlm.createWorkbenchLlm)(deps, {
    logTag: "finance-agent",
    moduleModel: (module2) => settings().moduleModels[module2] || ""
  });
  const llm = (module2, prompt, timeoutMs) => models.llm(module2, prompt, timeoutMs);
  const llmJson = (module2, prompt, timeoutMs) => models.llmJson(module2, prompt, timeoutMs);
  const journal = () => {
    const d = store.data();
    return [...d.journal?.rows || [], ...(0, import_voucher.vouchersToJournal)(d.vouchers)];
  };
  const latestBalances = () => store.data().balances[0] || null;
  async function recognize(path, opts) {
    const l = ledger();
    const id = (0, import_common4.newId)("doc");
    const dest = (0, import_node_path.join)(store.filesDir(), `${id}${(0, import_node_path.extname)(path).toLowerCase()}`);
    (0, import_node_fs.copyFileSync)(path, dest);
    progress(opts.progressKey, (0, import_i18n4.t)("\u6B63\u5728\u8BC6\u522B\uFF1A{p0}", { p0: (0, import_node_path.basename)(path) }));
    const ex = await extractText(dest);
    const parsed = (0, import_invoice.parseInvoiceText)(ex.text);
    const fieldSource = {};
    const doc = {
      id,
      fileName: (0, import_node_path.basename)(path),
      path: dest,
      kind: parsed.kind,
      direction: "unknown",
      invoiceCode: parsed.invoiceCode,
      invoiceNo: parsed.invoiceNo,
      date: parsed.date || void 0,
      sellerName: parsed.sellerName,
      sellerTaxId: parsed.sellerTaxId,
      buyerName: parsed.buyerName,
      buyerTaxId: parsed.buyerTaxId,
      amount: parsed.amount ?? 0,
      tax: parsed.tax ?? 0,
      total: parsed.total ?? 0,
      taxRate: parsed.taxRate ?? null,
      items: parsed.items,
      payer: parsed.payer,
      payee: parsed.payee,
      purpose: parsed.purpose,
      category: "",
      fieldSource,
      checks: [],
      text: ex.text.slice(0, 8e3),
      ocr: ex.ocr,
      status: "recognized",
      claimId: opts.claimId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    for (const f of import_invoice.LLM_FILLABLE) if (doc[f] != null && doc[f] !== "" && doc[f] !== 0) fieldSource[f] = "rule";
    const key = doc.kind === "bank_receipt" ? ["total", "date", "payer", "payee"] : ["invoiceNo", "date", "sellerName", "total", "amount"];
    const missing = import_invoice.LLM_FILLABLE.filter((f) => !fieldSource[f]);
    let llmCategory = "";
    if (ex.text.trim() && key.some((f) => !fieldSource[f])) {
      progress(opts.progressKey, (0, import_i18n4.t)("\u89C4\u5219\u6CA1\u8BFB\u5168\uFF0C\u4EA4\u7ED9\u6A21\u578B\u8865\u5B57\u6BB5\uFF1A{p0}", { p0: doc.fileName }));
      try {
        const r = await llmJson("voucher", invoiceFillPrompt(ex.text, [...missing], (0, import_common4.categoryNames)()), 12e4);
        doc.model = r.model;
        const fields = r.json?.fields || {};
        for (const f of missing) {
          const v = fields[f];
          if (v == null || v === "") continue;
          if (["amount", "tax", "total"].includes(f)) {
            const n = Number(String(v).replace(/[,¥￥\s]/g, ""));
            if (Number.isFinite(n) && (0, import_common4.amountFoundIn)(ex.text, n)) {
              doc[f] = (0, import_common4.round2)(n);
              fieldSource[f] = "model";
            }
          } else if (f === "taxRate") {
            const n = Number(v);
            if (Number.isFinite(n) && n >= 0 && n < 1 && ex.text.includes(`${Math.round(n * 100)}%`)) {
              doc.taxRate = n;
              fieldSource[f] = "model";
            }
          } else if (f === "date") {
            const d = (0, import_common4.normDate)(v);
            const digits = ex.text.replace(/\D+/g, "");
            const [y, m, dd] = d ? d.split("-") : [];
            if (d && [`${y}${m}${dd}`, `${y}${Number(m)}${Number(dd)}`].some((x) => digits.includes(x))) {
              doc.date = d;
              fieldSource[f] = "model";
            }
          } else if ((0, import_common4.foundIn)(ex.text, String(v))) {
            doc[f] = String(v).trim();
            fieldSource[f] = "model";
          }
        }
        if (typeof r.json?.category === "string" && (0, import_common4.categoryNames)().includes(r.json.category)) llmCategory = r.json.category;
      } catch (error) {
        logger?.warn?.("finance-agent", "invoice llm fill failed", { error: error?.message });
        doc.checks.push({ code: "llm_failed", level: "warn", message: (0, import_i18n4.t)("\u6A21\u578B\u8865\u5B57\u6BB5\u5931\u8D25\uFF1A{p0}", { p0: error?.message || "" }) });
      }
      if (!doc.amount && doc.total && doc.tax != null) doc.amount = (0, import_common4.round2)(doc.total - doc.tax);
      if (!doc.total && doc.amount) doc.total = (0, import_common4.round2)(doc.amount + doc.tax);
    }
    doc.direction = (0, import_invoice.directionOf)(doc, l);
    const ruleCat = (0, import_invoice.classifyDoc)(doc, ex.text);
    doc.category = ruleCat === (0, import_common4.categoryNames)().at(-1) && llmCategory ? llmCategory : ruleCat;
    const others = store.data().docs;
    doc.checks = [...doc.checks, ...ex.warning ? [{ code: "extract", level: "warn", message: ex.warning }] : [], ...(0, import_invoice.checkDoc)(doc, l, others)];
    if (ex.ocr) doc.checks.push({ code: "ocr", level: "warn", message: (0, import_i18n4.t)("\u6587\u5B57\u7531\u672C\u673A OCR \u8BC6\u522B\uFF0C\u6570\u5B57\u8BF7\u5BF9\u7167\u539F\u4EF6\u6838\u5BF9") });
    doc.status = (0, import_invoice.docStatus)(doc.checks);
    return doc;
  }
  function recheck(doc) {
    const l = ledger();
    doc.direction = (0, import_invoice.directionOf)(doc, l);
    const others = store.data().docs.filter((d) => d.id !== doc.id);
    doc.checks = (0, import_invoice.checkDoc)(doc, l, others);
    if (doc.status !== "confirmed") doc.status = (0, import_invoice.docStatus)(doc.checks);
    return doc;
  }
  async function writeXlsx(module2, name, sheets) {
    const { writeWorkbook } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts"), 1));
    const path = (0, import_node_path.join)(outDir(module2), `${safeName(name)}-${stamp()}.xlsx`);
    writeWorkbook(path, sheets.map((s) => {
      const headers = [...new Set(s.rows.flatMap((r) => Object.keys(r)))];
      return { name: s.name, headers: headers.length ? headers : [(0, import_i18n4.t)("\u65E0\u6570\u636E")], rows: s.rows.map((r) => headers.map((h) => r[h])) };
    }));
    return path;
  }
  function writeMd(module2, name, body) {
    const path = (0, import_node_path.join)(outDir(module2), `${safeName(name)}-${stamp()}.md`);
    (0, import_node_fs.writeFileSync)(path, body, "utf-8");
    return path;
  }
  const findingRows = (list) => list.map((f) => ({
    [(0, import_i18n4.t)("\u7EA7\u522B")]: f.level === "high" ? (0, import_i18n4.t)("\u9AD8") : f.level === "warn" ? (0, import_i18n4.t)("\u4E2D") : (0, import_i18n4.t)("\u4F4E"),
    [(0, import_i18n4.t)("\u95EE\u9898")]: f.title,
    [(0, import_i18n4.t)("\u660E\u7EC6")]: f.detail,
    [(0, import_i18n4.t)("\u5EFA\u8BAE")]: f.suggestion
  }));
  const reportLinesRows = (lines, cur, pri) => lines.map((l) => ({
    [(0, import_i18n4.t)("\u9879\u76EE")]: `${"\u3000".repeat(l.indent || 0)}${l.label}`,
    [cur]: l.current,
    [pri]: l.prior ?? ""
  }));
  async function apiImport(req) {
    const r = store.root();
    const target = req.ledger ? r.ledgers.find((l) => l.id === req.ledger || l.name === req.ledger) : store.activeLedger();
    if (!target) throw new Error((0, import_i18n4.t)("\u627E\u4E0D\u5230\u8D26\u5957\u300C{p0}\u300D", { p0: String(req.ledger) }));
    const rows = req.rows.filter((x) => x && typeof x === "object");
    const headers = [...new Set(rows.flatMap((x) => Object.keys(x)))];
    const table = { path: "", fileName: "API", sheetName: "API", headers, rows: rows.map((x) => Object.fromEntries(headers.map((h) => [h, x[h] == null ? "" : String(x[h])]))) };
    let count = 0;
    if (req.kind === "journal") {
      const parsed = parseJournal(table);
      store.update((d) => {
        const prev = d.journal?.rows || [];
        d.journal = { fileName: "API", importedAt: (/* @__PURE__ */ new Date()).toISOString(), source: "api", rows: [...prev, ...parsed] };
      }, target.id);
      count = parsed.length;
    } else if (req.kind === "balances") {
      const parsed = parseBalances(table);
      const period = String(req.period || (0, import_common4.periodOf)((0, import_common4.localDate)()));
      store.update((d) => {
        d.balances = [{ period, fileName: "API", importedAt: (/* @__PURE__ */ new Date()).toISOString(), rows: parsed }, ...d.balances.filter((b) => b.period !== period)].slice(0, 24);
      }, target.id);
      count = parsed.length;
    } else if (req.kind === "budget") {
      const parsed = parseBudget(table);
      store.update((d) => {
        d.budget = { year: Number(req.year) || (/* @__PURE__ */ new Date()).getFullYear(), lines: parsed };
      }, target.id);
      count = parsed.length;
    } else {
      throw new Error((0, import_i18n4.t)("kind \u53EA\u652F\u6301 journal / balances / budget"));
    }
    logger?.info?.("finance-agent", "api import", { kind: req.kind, count, ledger: target.name });
    pushState();
    return { ok: true, count, ledger: target.name };
  }
  async function applyApiSetting() {
    const a = settings().apiReceiver;
    if (!a.enabled) {
      await api.stop();
      return;
    }
    if (!a.token) store.updateRoot((r) => {
      r.settings.apiReceiver.token = (0, import_node_crypto2.randomBytes)(18).toString("hex");
    });
    try {
      await api.start(settings().apiReceiver.port, settings().apiReceiver.token);
    } catch (error) {
      logger?.warn?.("finance-agent", "api receiver start failed", { error: error?.message });
    }
  }
  const actions = {
    "state.get": () => publicState(),
    "models.list": () => models.modelOptions(),
    "settings.patch": async (p) => {
      const out = store.updateRoot((r) => {
        for (const [k, v] of Object.entries(p?.patch || {})) {
          const cur = r.settings[k];
          r.settings[k] = cur && typeof cur === "object" && !Array.isArray(cur) && v && typeof v === "object" && !Array.isArray(v) ? { ...cur, ...v } : v;
        }
        return r.settings;
      });
      if (p?.patch?.apiReceiver) await applyApiSetting();
      pushState();
      return out;
    },
    "api.regenerateToken": async () => {
      store.updateRoot((r) => {
        r.settings.apiReceiver.token = (0, import_node_crypto2.randomBytes)(18).toString("hex");
      });
      await applyApiSetting();
      pushState();
      return settings().apiReceiver.token;
    },
    "outputDir.pick": async () => {
      const r = await import_electron.dialog.showOpenDialog(win(), { properties: ["openDirectory", "createDirectory"] });
      if (r.canceled || !r.filePaths[0]) return null;
      store.updateRoot((st) => {
        st.settings.outputDir = r.filePaths[0];
      });
      pushState();
      return r.filePaths[0];
    },
    "files.pick": async (p) => {
      const r = await import_electron.dialog.showOpenDialog(win(), { properties: p?.multi ? ["openFile", "multiSelections"] : ["openFile"], filters: DOC_FILTERS[p?.kind || ""] });
      return r.canceled ? [] : r.filePaths;
    },
    "path.open": async (p) => {
      if (!p?.path || !(0, import_node_fs.existsSync)(p.path)) throw new Error((0, import_i18n4.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      if (p.reveal) {
        import_electron.shell.showItemInFolder(p.path);
        return true;
      }
      const err = await import_electron.shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },
    // 账套（代账公司一个客户一个账套；账套记忆 = notes）
    "ledger.save": (p) => {
      const input = p?.input;
      if (!input?.name?.trim()) throw new Error((0, import_i18n4.t)("\u8BF7\u586B\u5199\u8D26\u5957\u540D\u79F0\uFF08\u516C\u53F8\u540D\uFF09"));
      const out = store.updateRoot((r) => {
        const cur = input.id ? r.ledgers.find((l2) => l2.id === input.id) : void 0;
        if (cur) {
          Object.assign(cur, (0, import_store.newLedger)({ ...cur, ...input, name: input.name, id: cur.id, createdAt: cur.createdAt }));
          return cur;
        }
        const l = (0, import_store.newLedger)({ ...input, name: input.name });
        r.ledgers.push(l);
        r.activeLedgerId = l.id;
        return l;
      });
      store.update((d) => {
        d.docs.forEach(recheck);
      });
      pushState();
      return out;
    },
    "ledger.switch": (p) => {
      store.updateRoot((r) => {
        requireFound(r.ledgers.find((l) => l.id === p.id), (0, import_i18n4.t)("\u8D26\u5957"));
        r.activeLedgerId = p.id;
      });
      pushState();
      return publicState();
    },
    "ledger.remove": (p) => {
      const r = store.root();
      if (r.ledgers.length <= 1) throw new Error((0, import_i18n4.t)("\u81F3\u5C11\u4FDD\u7559\u4E00\u4E2A\u8D26\u5957"));
      store.updateRoot((st) => {
        st.ledgers = st.ledgers.filter((l) => l.id !== p.id);
        if (st.activeLedgerId === p.id) st.activeLedgerId = st.ledgers[0].id;
      });
      store.removeLedger(p.id);
      pushState();
      return true;
    },
    "ledger.remember": (p) => {
      const text = String(p?.text || "").trim();
      if (!text) return ledger();
      const out = store.updateRoot((r) => {
        const l = r.ledgers.find((x) => x.id === r.activeLedgerId);
        l.notes = `${l.notes ? `${l.notes}
` : ""}[${(0, import_common4.localDate)()}] ${text}`.slice(-6e3);
        return l;
      });
      pushState();
      return out;
    },
    // 数据对接：账套导出的序时账 / 科目余额表
    "data.importJournal": (p) => {
      const rows = parseJournal(loadTable(p.path));
      if (!rows.length) throw new Error((0, import_i18n4.t)("\u5E8F\u65F6\u8D26\u91CC\u6CA1\u6709\u8BFB\u5230\u6709\u6548\u5206\u5F55\uFF08\u9700\u8981\u65E5\u671F\u3001\u79D1\u76EE\u3001\u501F\u65B9\u3001\u8D37\u65B9\u5217\uFF09"));
      store.update((d) => {
        d.journal = { fileName: (0, import_node_path.basename)(p.path), importedAt: (/* @__PURE__ */ new Date()).toISOString(), source: "excel", rows: p.append && d.journal ? [...d.journal.rows, ...rows] : rows };
      });
      pushState();
      const debit = (0, import_common4.sum)(rows.map((r) => r.debit));
      const credit = (0, import_common4.sum)(rows.map((r) => r.credit));
      return { count: rows.length, debit, credit, balanced: Math.abs(debit - credit) < 0.01, from: rows.map((r) => r.date).filter(Boolean).sort()[0], to: rows.map((r) => r.date).filter(Boolean).sort().at(-1) };
    },
    "data.importBalances": (p) => {
      const rows = parseBalances(loadTable(p.path));
      if (!rows.length) throw new Error((0, import_i18n4.t)("\u79D1\u76EE\u4F59\u989D\u8868\u91CC\u6CA1\u6709\u8BFB\u5230\u6570\u636E"));
      const period = /^\d{4}-\d{2}$/.test(p.period) ? p.period : (0, import_common4.periodOf)((0, import_common4.localDate)());
      store.update((d) => {
        d.balances = [{ period, fileName: (0, import_node_path.basename)(p.path), importedAt: (/* @__PURE__ */ new Date()).toISOString(), rows }, ...d.balances.filter((b) => b.period !== period)].slice(0, 24);
      });
      pushState();
      return { count: rows.length, period };
    },
    "data.clear": (p) => {
      store.update((d) => {
        if (p.kind === "journal") d.journal = null;
        else d.balances = p.period ? d.balances.filter((b) => b.period !== p.period) : [];
      });
      pushState();
      return true;
    },
    // ① 凭证处理
    "doc.import": async (p) => {
      const out = [];
      for (const path of p?.paths || []) {
        try {
          const doc = await recognize(path, { progressKey: "voucher" });
          store.update((d) => {
            d.docs.unshift(doc);
          });
          out.push(doc);
          pushState();
        } catch (error) {
          logger?.warn?.("finance-agent", "recognize failed", { path, error: error?.message });
          progress("voucher", (0, import_i18n4.t)("{p0} \u8BC6\u522B\u5931\u8D25\uFF1A{p1}", { p0: (0, import_node_path.basename)(path), p1: error?.message || "" }));
        }
      }
      progress("voucher", "");
      return { count: out.length, flagged: out.filter((d) => d.status === "flagged").length };
    },
    "doc.update": (p) => {
      const out = store.update((d) => {
        const doc = requireFound(d.docs.find((x) => x.id === p.id), (0, import_i18n4.t)("\u7968\u636E"));
        const allowed = ["kind", "direction", "invoiceCode", "invoiceNo", "date", "sellerName", "sellerTaxId", "buyerName", "buyerTaxId", "amount", "tax", "total", "taxRate", "payer", "payee", "purpose", "category", "status"];
        for (const [k, v] of Object.entries(p.patch || {})) {
          if (!allowed.includes(k)) continue;
          doc[k] = ["amount", "tax", "total"].includes(k) ? (0, import_common4.round2)(Number(v) || 0) : v;
          if (k !== "status" && k !== "category") doc.fieldSource[k] = "manual";
        }
        const manualDirection = p.patch && "direction" in p.patch;
        const keepDir = doc.direction;
        recheck(doc);
        if (manualDirection) doc.direction = keepDir;
        if (p.patch?.status === "confirmed") doc.status = "confirmed";
        return doc;
      });
      pushState();
      return out;
    },
    "doc.remove": (p) => {
      store.update((d) => {
        d.docs = d.docs.filter((x) => x.id !== p.id);
        d.vouchers = d.vouchers.filter((v) => !(v.status === "draft" && v.sourceDocIds.includes(p.id)));
      });
      pushState();
      return true;
    },
    "voucher.generate": (p) => {
      const l = ledger();
      const res = store.update((d) => {
        let created = 0;
        const skipped = [];
        const targets = d.docs.filter((x) => !x.claimId && !x.voucherId && (!p?.docIds?.length || p.docIds.includes(x.id)));
        for (const doc of targets) {
          if (doc.status === "flagged" && !p?.includeFlagged) {
            skipped.push((0, import_i18n4.t)("{p0}\uFF1A\u6709\u5F02\u5E38\u672A\u5904\u7406", { p0: doc.fileName }));
            continue;
          }
          const v = (0, import_voucher.buildVoucher)(doc, l, d.vouchers);
          if (!v) {
            skipped.push((0, import_i18n4.t)("{p0}\uFF1A\u5224\u65AD\u4E0D\u51FA\u662F\u8FDB\u9879\u8FD8\u662F\u9500\u9879\uFF0C\u8BF7\u5148\u786E\u8BA4\u62AC\u5934", { p0: doc.fileName }));
            continue;
          }
          d.vouchers.push(v);
          doc.voucherId = v.id;
          created += 1;
        }
        return { created, skipped };
      });
      pushState();
      return res;
    },
    "voucher.create": (p) => {
      const lines = (0, import_voucher.normalizeLines)(p.lines || []);
      if (lines.length < 2 || !(0, import_voucher.isBalanced)(lines)) throw new Error((0, import_i18n4.t)("\u5206\u5F55\u81F3\u5C11\u4E24\u884C\uFF0C\u4E14\u501F\u8D37\u5FC5\u987B\u76F8\u7B49"));
      const date = (0, import_common4.normDate)(p.date) || (0, import_common4.localDate)();
      const out = store.update((d) => {
        const v = { id: (0, import_common4.newId)("vch"), no: (0, import_voucher.nextVoucherNo)(d.vouchers, (0, import_common4.periodOf)(date)), date, period: (0, import_common4.periodOf)(date), lines, sourceDocIds: [], status: "draft", basis: (0, import_i18n4.t)("\u624B\u5DE5\u5F55\u5165"), origin: "manual", createdAt: (/* @__PURE__ */ new Date()).toISOString() };
        d.vouchers.push(v);
        return v;
      });
      pushState();
      return out;
    },
    "voucher.update": (p) => {
      const lines = (0, import_voucher.normalizeLines)(p.lines || []);
      if (lines.length < 2 || !(0, import_voucher.isBalanced)(lines)) throw new Error((0, import_i18n4.t)("\u501F\u65B9\u5408\u8BA1 {a} \u2260 \u8D37\u65B9\u5408\u8BA1 {b}\uFF0C\u6539\u5B8C\u8981\u501F\u8D37\u5E73\u8861", { a: (0, import_common4.fmt)((0, import_common4.sum)(lines.map((l) => l.debit))), b: (0, import_common4.fmt)((0, import_common4.sum)(lines.map((l) => l.credit))) }));
      const out = store.update((d) => {
        const v = requireFound(d.vouchers.find((x) => x.id === p.id), (0, import_i18n4.t)("\u51ED\u8BC1"));
        v.lines = lines;
        if (p.date && (0, import_common4.normDate)(p.date)) {
          v.date = (0, import_common4.normDate)(p.date);
          v.period = (0, import_common4.periodOf)(v.date);
        }
        v.status = "draft";
        return v;
      });
      pushState();
      return out;
    },
    "voucher.review": (p) => {
      const res = store.update((d) => {
        let n = 0;
        for (const v of d.vouchers) {
          if (!p.ids.includes(v.id)) continue;
          if (p.undo) {
            v.status = "draft";
            v.reviewedAt = void 0;
            n += 1;
            continue;
          }
          if (!(0, import_voucher.isBalanced)(v.lines)) continue;
          v.status = "reviewed";
          v.reviewedAt = (/* @__PURE__ */ new Date()).toISOString();
          n += 1;
          for (const id of v.sourceDocIds) {
            const doc = d.docs.find((x) => x.id === id);
            if (doc) doc.status = "confirmed";
          }
        }
        return n;
      });
      pushState();
      return res;
    },
    "voucher.remove": (p) => {
      store.update((d) => {
        d.vouchers = d.vouchers.filter((v) => v.id !== p.id);
        d.docs.forEach((x) => {
          if (x.voucherId === p.id) x.voucherId = void 0;
        });
      });
      pushState();
      return true;
    },
    "voucher.export": async (p) => {
      const d = store.data();
      const list = d.vouchers.filter((v) => (!p?.period || v.period === p.period) && (!p?.onlyReviewed || v.status === "reviewed")).sort((a, b) => a.date.localeCompare(b.date) || a.no.localeCompare(b.no));
      const docs = d.docs.filter((x) => !x.claimId && (!p?.period || (0, import_common4.periodOf)(x.date || "") === p.period));
      const docRows = docs.map((x) => ({
        [(0, import_i18n4.t)("\u6587\u4EF6")]: x.fileName,
        [(0, import_i18n4.t)("\u7C7B\u578B")]: x.kind,
        [(0, import_i18n4.t)("\u65B9\u5411")]: x.direction === "in" ? (0, import_i18n4.t)("\u8FDB\u9879") : x.direction === "out" ? (0, import_i18n4.t)("\u9500\u9879") : "-",
        [(0, import_i18n4.t)("\u53F7\u7801")]: x.invoiceNo || "",
        [(0, import_i18n4.t)("\u65E5\u671F")]: x.date || "",
        [(0, import_i18n4.t)("\u9500\u552E\u65B9")]: x.sellerName || x.payee || "",
        [(0, import_i18n4.t)("\u8D2D\u4E70\u65B9")]: x.buyerName || x.payer || "",
        [(0, import_i18n4.t)("\u91D1\u989D")]: x.amount,
        [(0, import_i18n4.t)("\u7A0E\u989D")]: x.tax,
        [(0, import_i18n4.t)("\u4EF7\u7A0E\u5408\u8BA1")]: x.total,
        [(0, import_i18n4.t)("\u7C7B\u522B")]: x.category,
        [(0, import_i18n4.t)("\u6821\u9A8C")]: x.checks.filter((c) => c.level !== "ok").map((c) => c.message).join((0, import_i18n4.t)("\uFF1B")) || (0, import_i18n4.t)("\u901A\u8FC7")
      }));
      const path = await writeXlsx("voucher", (0, import_i18n4.t)("\u51ED\u8BC1\u8349\u7A3F{p0}", { p0: p?.period ? `-${p.period}` : "" }), [
        { name: (0, import_i18n4.t)("\u51ED\u8BC1\u5BFC\u5165"), rows: (0, import_voucher.voucherExportRows)(list) },
        { name: (0, import_i18n4.t)("\u8BC6\u522B\u6821\u9A8C\u62A5\u544A"), rows: docRows },
        { name: (0, import_i18n4.t)("\u5F02\u5E38\u7968\u636E"), rows: docRows.filter((_, i) => docs[i].status === "flagged") }
      ]);
      return { path, vouchers: list.length };
    },
    "accounts.list": () => import_common4.ACCOUNTS,
    // ② 税务申报
    "tax.derive": (p) => (0, import_tax.deriveTaxInputs)(store.data().docs, journal(), p.period, ledger()),
    "tax.importPayroll": (p) => parsePayroll(loadTable(p.path), Math.max(1, Number(p.monthIndex) || 1)),
    "tax.compute": (p) => {
      const l = ledger();
      const s = settings().tax;
      const result = (0, import_tax.computeTax)(p.inputs, l, s, p.iitRows || []);
      const findings = (0, import_tax.taxFindings)(p.inputs, result, l, s, store.data().docs, p.period);
      const run = { id: (0, import_common4.newId)("tax"), period: p.period, inputs: p.inputs, iitRows: p.iitRows || [], result, findings, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((d) => {
        d.taxRuns = [run, ...d.taxRuns.filter((x) => x.period !== p.period)].slice(0, 36);
      });
      pushState();
      return run;
    },
    "tax.note": async (p) => {
      const run = requireFound(store.data().taxRuns.find((x) => x.id === p.id), (0, import_i18n4.t)("\u7533\u62A5\u8349\u7A3F"));
      const facts = [...run.result.vat, ...run.result.surcharges, ...run.result.cit].map((l) => `${l.label}\uFF1A${l.formula} = ${typeof l.value === "number" && l.value < 1 && l.value > 0 ? (0, import_common4.pct)(l.value) : (0, import_common4.fmt)(l.value)}`).join("\n") + `
${(0, import_i18n4.t)("\u4E2A\u7A0E\u4EE3\u6263\u5408\u8BA1")}\uFF1A${(0, import_common4.fmt)(run.result.iitTotal)}\uFF08${run.result.iit.length}\uFF09` + (run.result.burdenRate != null ? `
${(0, import_i18n4.t)("\u589E\u503C\u7A0E\u7A0E\u8D1F\u7387")}\uFF1A${(0, import_common4.pct)(run.result.burdenRate)}` : "");
      const findings = run.findings.map((f) => `- ${f.title}\uFF1A${f.detail}`).join("\n");
      const r = await llm("tax", taxNotePrompt(ledger().name, run.period, facts, findings));
      const out = store.update((d) => {
        const t = d.taxRuns.find((x) => x.id === p.id);
        t.note = r.text.trim();
        t.model = r.model;
        return t;
      });
      pushState();
      return out;
    },
    "tax.export": async (p) => {
      const run = requireFound(store.data().taxRuns.find((x) => x.id === p.id), (0, import_i18n4.t)("\u7533\u62A5\u8349\u7A3F"));
      const iit = run.result.iit.map((r) => ({
        [(0, import_i18n4.t)("\u59D3\u540D")]: r.name,
        [(0, import_i18n4.t)("\u672C\u6708\u6536\u5165")]: r.salary,
        [(0, import_i18n4.t)("\u7D2F\u8BA1\u5E94\u7EB3\u7A0E\u6240\u5F97\u989D")]: r.taxableYtd ?? "",
        [(0, import_i18n4.t)("\u7A0E\u7387")]: r.rate != null ? (0, import_common4.pct)(r.rate, 0) : "",
        [(0, import_i18n4.t)("\u901F\u7B97\u6263\u9664\u6570")]: r.quickDeduction ?? "",
        [(0, import_i18n4.t)("\u7D2F\u8BA1\u5DF2\u9884\u6263")]: r.ytdTaxPaid,
        [(0, import_i18n4.t)("\u672C\u6708\u5E94\u9884\u6263")]: r.taxThisMonth ?? ""
      }));
      const path = await writeXlsx("tax", (0, import_i18n4.t)("\u7533\u62A5\u8868\u8349\u7A3F-{p0}", { p0: run.period }), [
        { name: (0, import_i18n4.t)("\u7533\u62A5\u8868\u8349\u7A3F"), rows: (0, import_tax.taxDraftRows)(run.period, ledger(), run.result) },
        { name: (0, import_i18n4.t)("\u4E2A\u7A0E\u660E\u7EC6"), rows: iit },
        { name: (0, import_i18n4.t)("\u98CE\u9669\u9884\u68C0"), rows: findingRows(run.findings) }
      ]);
      if (run.note) writeMd("tax", (0, import_i18n4.t)("\u7533\u62A5\u5907\u6CE8-{p0}", { p0: run.period }), run.note);
      store.update((d) => {
        const t = d.taxRuns.find((x) => x.id === p.id);
        if (t) t.exportPath = path;
      });
      pushState();
      return { path };
    },
    "tax.remove": (p) => {
      store.update((d) => {
        d.taxRuns = d.taxRuns.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    // ②b 申报上报：人登录电子税务局 → 数字员工按草稿代填、停在提交前 → 人点提交 → 登记回执与缴款
    "filing.meta": () => ({
      checklist: (0, import_filing.checklistItems)(),
      provinces: (0, import_filing.provinces)(),
      portal: (0, import_filing.portalUrl)(settings().taxPortal),
      deadlines: (0, import_filing.upcomingDeadlines)(ledger(), store.data().filings).map((d) => ({ ...d, label: (0, import_filing.taxLabel)(d.tax) }))
    }),
    "filing.create": (p) => {
      const d = store.data();
      const run = requireFound(d.taxRuns.find((x) => x.id === p.taxRunId), (0, import_i18n4.t)("\u7533\u62A5\u8349\u7A3F"));
      const stmt = p.statementId ? d.statements.find((x) => x.id === p.statementId) || null : null;
      const existing = d.filings.find((f2) => f2.taxRunId === run.id);
      if (existing) return existing;
      const f = { id: (0, import_common4.newId)("fil"), period: run.period, taxRunId: run.id, statementId: stmt?.id, items: (0, import_filing.buildFilingItems)(run, stmt), checklist: {}, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((dd) => {
        dd.filings.unshift(f);
        dd.filings.splice(60);
      });
      pushState();
      return f;
    },
    "filing.check": (p) => {
      const out = store.update((d) => {
        const f = requireFound(d.filings.find((x) => x.id === p.id), (0, import_i18n4.t)("\u7533\u62A5\u8BB0\u5F55"));
        f.checklist[p.key] = !!p.value;
        return f;
      });
      pushState();
      return out;
    },
    "filing.instruction": (p) => {
      const d = store.data();
      const f = requireFound(d.filings.find((x) => x.id === p.id), (0, import_i18n4.t)("\u7533\u62A5\u8BB0\u5F55"));
      const missing = (0, import_filing.checklistItems)().filter((c) => !f.checklist[c.key]);
      if (missing.length) throw new Error((0, import_i18n4.t)("\u7533\u62A5\u524D\u6838\u5BF9\u6E05\u5355\u8FD8\u6709 {n} \u9879\u6CA1\u52FE\uFF1A{p0}", { n: missing.length, p0: missing.map((c) => c.label).join((0, import_i18n4.t)("\uFF1B")) }));
      const run = requireFound(d.taxRuns.find((x) => x.id === f.taxRunId), (0, import_i18n4.t)("\u7533\u62A5\u8349\u7A3F"));
      const l = ledger();
      const lines = (arr) => arr.map((x) => `${x.label}\uFF1A${x.value < 1 && x.value > 0 ? (0, import_common4.pct)(x.value) : (0, import_common4.fmt)(x.value)}\uFF08${x.formula}\uFF09`);
      const sections = [];
      for (const it of f.items) {
        if (it.tax === "vat") sections.push({ title: (0, import_filing.taxLabel)("vat"), lines: [...lines(run.result.vat), ...run.inputs.salesByRate.map((g) => (0, import_i18n4.t)("{r} \u7A0E\u7387\uFF1A\u9500\u552E\u989D {a}\uFF0C\u7A0E\u989D {b}", { r: (0, import_common4.pct)(g.rate, 0), a: (0, import_common4.fmt)(g.amount), b: (0, import_common4.fmt)(g.tax) }))] });
        if (it.tax === "surcharge") sections.push({ title: (0, import_filing.taxLabel)("surcharge"), lines: lines(run.result.surcharges) });
        if (it.tax === "cit") sections.push({ title: (0, import_filing.taxLabel)("cit"), lines: lines(run.result.cit) });
        if (it.tax === "iit") sections.push({ title: (0, import_filing.taxLabel)("iit"), lines: run.result.iit.map((r) => (0, import_i18n4.t)("{p0}\uFF1A\u672C\u6708\u6536\u5165 {a}\uFF0C\u7D2F\u8BA1\u5E94\u7EB3\u7A0E\u6240\u5F97\u989D {b}\uFF0C\u672C\u6708\u5E94\u9884\u6263 {c}", { p0: r.name, a: (0, import_common4.fmt)(r.salary), b: (0, import_common4.fmt)(r.taxableYtd || 0), c: (0, import_common4.fmt)(r.taxThisMonth || 0) })) });
        if (it.tax === "statements") {
          const st = d.statements.find((x) => x.id === f.statementId);
          if (st) sections.push({ title: (0, import_filing.taxLabel)("statements"), lines: [...st.balanceSheet, ...st.income].filter((x) => x.bold || x.current).map((x) => `${x.label}\uFF1A${(0, import_common4.fmt)(x.current)}${x.prior != null ? `\uFF08${(0, import_i18n4.t)("\u4E0A\u671F / \u671F\u521D")} ${(0, import_common4.fmt)(x.prior)}\uFF09` : ""}`) });
        }
      }
      return filingInstruction({
        ledger: l.name,
        taxId: l.taxId || (0, import_i18n4.t)("\uFF08\u8D26\u5957\u672A\u586B\u7A0E\u53F7\uFF09"),
        taxpayer: l.taxpayerType === "general" ? (0, import_i18n4.t)("\u4E00\u822C\u7EB3\u7A0E\u4EBA") : (0, import_i18n4.t)("\u5C0F\u89C4\u6A21\u7EB3\u7A0E\u4EBA"),
        period: f.period,
        portal: (0, import_filing.portalUrl)(settings().taxPortal),
        sections
      });
    },
    "filing.handed": (p) => {
      const out = store.update((d) => {
        const f = requireFound(d.filings.find((x) => x.id === p.id), (0, import_i18n4.t)("\u7533\u62A5\u8BB0\u5F55"));
        f.conversationId = p.conversationId;
        f.handedAt = (/* @__PURE__ */ new Date()).toISOString();
        f.items.forEach((i) => {
          if (i.status === "pending") i.status = "handed";
        });
        return f;
      });
      pushState();
      return out;
    },
    "filing.updateItem": (p) => {
      const out = store.update((d) => {
        const f = requireFound(d.filings.find((x) => x.id === p.id), (0, import_i18n4.t)("\u7533\u62A5\u8BB0\u5F55"));
        const it = requireFound(f.items.find((x) => x.tax === p.tax), (0, import_i18n4.t)("\u7533\u62A5\u4E8B\u9879"));
        const patch = p.patch || {};
        if (patch.status) it.status = patch.status;
        if (patch.receiptNo !== void 0) it.receiptNo = String(patch.receiptNo || "").trim() || void 0;
        if (patch.note !== void 0) it.note = String(patch.note || "").slice(0, 500) || void 0;
        if (patch.paidAmount !== void 0) it.paidAmount = (0, import_common4.round2)(Number(patch.paidAmount) || 0);
        if (it.status === "filed" && !it.filedAt) it.filedAt = (/* @__PURE__ */ new Date()).toISOString();
        if (it.status === "paid") {
          it.filedAt ||= (/* @__PURE__ */ new Date()).toISOString();
          it.paidAt ||= (/* @__PURE__ */ new Date()).toISOString();
          if (it.paidAmount == null) it.paidAmount = it.amount;
        }
        return f;
      });
      pushState();
      return out;
    },
    "filing.attachReceipt": (p) => {
      const dest = (0, import_node_path.join)(store.filesDir(), `receipt-${p.id}-${p.tax}${(0, import_node_path.extname)(p.path).toLowerCase()}`);
      (0, import_node_fs.copyFileSync)(p.path, dest);
      const out = store.update((d) => {
        const f = requireFound(d.filings.find((x) => x.id === p.id), (0, import_i18n4.t)("\u7533\u62A5\u8BB0\u5F55"));
        const it = requireFound(f.items.find((x) => x.tax === p.tax), (0, import_i18n4.t)("\u7533\u62A5\u4E8B\u9879"));
        it.receiptPath = dest;
        if (it.status === "pending" || it.status === "handed") {
          it.status = "filed";
          it.filedAt = (/* @__PURE__ */ new Date()).toISOString();
        }
        return f;
      });
      pushState();
      return out;
    },
    "filing.remove": (p) => {
      store.update((d) => {
        d.filings = d.filings.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    "filing.export": async () => {
      const d = store.data();
      const stat = { pending: (0, import_i18n4.t)("\u5F85\u7533\u62A5"), handed: (0, import_i18n4.t)("\u5DF2\u4EA4\u7ED9\u6570\u5B57\u5458\u5DE5\u4EE3\u586B"), filed: (0, import_i18n4.t)("\u5DF2\u7533\u62A5"), paid: (0, import_i18n4.t)("\u5DF2\u7F34\u6B3E") };
      const rows = d.filings.flatMap((f) => f.items.map((i) => ({
        [(0, import_i18n4.t)("\u6240\u5C5E\u671F")]: f.period,
        [(0, import_i18n4.t)("\u7A0E\u79CD")]: (0, import_filing.taxLabel)(i.tax),
        [(0, import_i18n4.t)("\u5E94\u7EB3\u7A0E\u989D")]: i.amount,
        [(0, import_i18n4.t)("\u72B6\u6001")]: stat[i.status],
        [(0, import_i18n4.t)("\u56DE\u6267\u53F7")]: i.receiptNo || "",
        [(0, import_i18n4.t)("\u7533\u62A5\u65F6\u95F4")]: i.filedAt?.slice(0, 16).replace("T", " ") || "",
        [(0, import_i18n4.t)("\u7F34\u6B3E\u91D1\u989D")]: i.paidAmount ?? "",
        [(0, import_i18n4.t)("\u7F34\u6B3E\u65F6\u95F4")]: i.paidAt?.slice(0, 16).replace("T", " ") || "",
        [(0, import_i18n4.t)("\u5907\u6CE8")]: i.note || ""
      })));
      return { path: await writeXlsx("filing", (0, import_i18n4.t)("\u7533\u62A5\u53F0\u8D26"), [{ name: (0, import_i18n4.t)("\u7533\u62A5\u53F0\u8D26"), rows }]) };
    },
    // ③ 费用报销
    "claim.create": (p) => {
      if (!p?.employee?.trim()) throw new Error((0, import_i18n4.t)("\u8BF7\u586B\u5199\u62A5\u9500\u4EBA"));
      const claim = { id: (0, import_common4.newId)("clm"), employee: p.employee.trim(), dept: String(p.dept || "").trim(), level: String(p.level || "").trim(), reason: String(p.reason || "").trim(), items: [], total: 0, verdict: "pending", rejectReasons: [], createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((d) => {
        d.claims.unshift(claim);
      });
      pushState();
      return claim;
    },
    "claim.addDocs": async (p) => {
      requireFound(store.data().claims.find((c) => c.id === p.id), (0, import_i18n4.t)("\u62A5\u9500\u5355"));
      for (const path of p.paths || []) {
        try {
          const doc = await recognize(path, { claimId: p.id, progressKey: "expense" });
          store.update((d) => {
            d.docs.unshift(doc);
            const c = d.claims.find((x) => x.id === p.id);
            c?.items.push({ docId: doc.id, category: doc.category, amount: doc.total, date: doc.date, checks: [] });
          });
        } catch (error) {
          progress("expense", (0, import_i18n4.t)("{p0} \u8BC6\u522B\u5931\u8D25\uFF1A{p1}", { p0: (0, import_node_path.basename)(path), p1: error?.message || "" }));
        }
      }
      progress("expense", "");
      return reviewOne(p.id);
    },
    "claim.review": (p) => reviewOne(p.id),
    "claim.setCategory": (p) => {
      store.update((d) => {
        const doc = d.docs.find((x) => x.id === p.docId);
        if (doc) doc.category = p.category;
      });
      return reviewOne(p.id);
    },
    "claim.removeDoc": (p) => {
      store.update((d) => {
        d.docs = d.docs.filter((x) => x.id !== p.docId);
        const c = d.claims.find((x) => x.id === p.id);
        if (c) c.items = c.items.filter((i) => i.docId !== p.docId);
      });
      return reviewOne(p.id);
    },
    "claim.decide": (p) => {
      const out = store.update((d) => {
        const c = requireFound(d.claims.find((x) => x.id === p.id), (0, import_i18n4.t)("\u62A5\u9500\u5355"));
        c.decision = p.decision;
        c.decidedAt = (/* @__PURE__ */ new Date()).toISOString();
        c.notice = (0, import_expense.claimNotice)(p.decision === "rejected" && !c.rejectReasons.length ? { ...c, verdict: "reject", rejectReasons: [(0, import_i18n4.t)("\u8D22\u52A1\u590D\u6838\u672A\u901A\u8FC7")] } : c, ledger().name);
        return c;
      });
      pushState();
      return out;
    },
    "claim.remove": (p) => {
      store.update((d) => {
        d.claims = d.claims.filter((c) => c.id !== p.id);
        d.docs = d.docs.filter((x) => x.claimId !== p.id);
      });
      pushState();
      return true;
    },
    "claim.summary": () => (0, import_expense.deptSummary)(store.data().claims),
    "claim.export": async () => {
      const d = store.data();
      const rows = d.claims.flatMap((c) => c.items.map((i) => {
        const doc = d.docs.find((x) => x.id === i.docId);
        return {
          [(0, import_i18n4.t)("\u62A5\u9500\u4EBA")]: c.employee,
          [(0, import_i18n4.t)("\u90E8\u95E8")]: c.dept,
          [(0, import_i18n4.t)("\u4E8B\u7531")]: c.reason,
          [(0, import_i18n4.t)("\u7968\u636E")]: doc?.fileName || "",
          [(0, import_i18n4.t)("\u7C7B\u522B")]: i.category,
          [(0, import_i18n4.t)("\u65E5\u671F")]: i.date || "",
          [(0, import_i18n4.t)("\u91D1\u989D")]: i.amount,
          [(0, import_i18n4.t)("\u9884\u5BA1")]: { pass: (0, import_i18n4.t)("\u901A\u8FC7"), reject: (0, import_i18n4.t)("\u9A73\u56DE"), review: (0, import_i18n4.t)("\u5F85\u4EBA\u5DE5"), pending: (0, import_i18n4.t)("\u672A\u5BA1") }[c.verdict],
          [(0, import_i18n4.t)("\u8D22\u52A1\u7ED3\u8BBA")]: c.decision === "approved" ? (0, import_i18n4.t)("\u5DF2\u901A\u8FC7") : c.decision === "rejected" ? (0, import_i18n4.t)("\u5DF2\u9A73\u56DE") : "",
          [(0, import_i18n4.t)("\u95EE\u9898")]: i.checks.filter((x) => x.level !== "ok").map((x) => x.message).join((0, import_i18n4.t)("\uFF1B"))
        };
      }));
      const summary = (0, import_expense.deptSummary)(d.claims).map((g) => ({ [(0, import_i18n4.t)("\u90E8\u95E8")]: g.dept, [(0, import_i18n4.t)("\u7C7B\u522B")]: g.category, [(0, import_i18n4.t)("\u5F20\u6570")]: g.count, [(0, import_i18n4.t)("\u91D1\u989D")]: g.amount }));
      return { path: await writeXlsx("expense", (0, import_i18n4.t)("\u62A5\u9500\u9884\u5BA1"), [{ name: (0, import_i18n4.t)("\u62A5\u9500\u660E\u7EC6"), rows }, { name: (0, import_i18n4.t)("\u90E8\u95E8\u5F52\u96C6"), rows: summary }]) };
    },
    "claim.polishNotice": async (p) => {
      const c = requireFound(store.data().claims.find((x) => x.id === p.id), (0, import_i18n4.t)("\u62A5\u9500\u5355"));
      const base = c.notice || (0, import_expense.claimNotice)(c, ledger().name);
      const r = await llm("expense", expenseNoticePrompt(base));
      const nums = base.match(/\d[\d,]*\.\d{2}/g) || [];
      const text = nums.every((n) => r.text.includes(n)) ? r.text.trim() : base;
      const out = store.update((d) => {
        const t = d.claims.find((x) => x.id === p.id);
        t.notice = text;
        return t;
      });
      pushState();
      return out;
    },
    // ④ 往来对账
    "rec.run": (p) => {
      const ours = parseRecRows(loadTable(p.oursPath), p.side, "ours");
      const theirs = parseRecRows(loadTable(p.theirsPath), p.side, "theirs");
      const matches = matchRows(ours.rows, theirs.rows);
      const s = recSummary(matches);
      const asOf = (0, import_common4.normDate)(p.asOf) || (0, import_common4.localDate)();
      const run = {
        id: (0, import_common4.newId)("rec"),
        side: p.side,
        counterparty: String(p.counterparty || ours.counterparty || theirs.counterparty || ""),
        asOf,
        oursFile: (0, import_node_path.basename)(p.oursPath),
        theirsFile: (0, import_node_path.basename)(p.theirsPath),
        matches,
        balanceOurs: s.balanceOurs,
        balanceTheirs: s.balanceTheirs,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      run.letter = reconcileLetter(run, ledger().name);
      store.update((d) => {
        d.reconciles.unshift(run);
        d.reconciles.splice(30);
      });
      pushState();
      return run;
    },
    "rec.export": async (p) => {
      const run = requireFound(store.data().reconciles.find((x) => x.id === p.id), (0, import_i18n4.t)("\u5BF9\u8D26\u8BB0\u5F55"));
      const statusLabel = { matched: (0, import_i18n4.t)("\u4E00\u81F4"), amount_diff: (0, import_i18n4.t)("\u91D1\u989D\u4E0D\u7B26"), only_ours: (0, import_i18n4.t)("\u6211\u65B9\u6709\u5BF9\u65B9\u65E0"), only_theirs: (0, import_i18n4.t)("\u5BF9\u65B9\u6709\u6211\u65B9\u65E0") };
      const rows = run.matches.map((m) => ({
        [(0, import_i18n4.t)("\u72B6\u6001")]: statusLabel[m.status],
        [(0, import_i18n4.t)("\u6211\u65B9\u65E5\u671F")]: m.ours?.date || "",
        [(0, import_i18n4.t)("\u6211\u65B9\u5355\u53F7")]: m.ours?.ref || "",
        [(0, import_i18n4.t)("\u6211\u65B9\u91D1\u989D")]: m.ours?.amount ?? "",
        [(0, import_i18n4.t)("\u5BF9\u65B9\u65E5\u671F")]: m.theirs?.date || "",
        [(0, import_i18n4.t)("\u5BF9\u65B9\u5355\u53F7")]: m.theirs?.ref || "",
        [(0, import_i18n4.t)("\u5BF9\u65B9\u91D1\u989D")]: m.theirs?.amount ?? "",
        [(0, import_i18n4.t)("\u5DEE\u989D")]: m.diff,
        [(0, import_i18n4.t)("\u8BF4\u660E")]: m.note || ""
      }));
      const path = await writeXlsx("reconcile", (0, import_i18n4.t)("\u5BF9\u8D26-{p0}", { p0: run.counterparty || run.id }), [{ name: (0, import_i18n4.t)("\u9010\u7B14\u6BD4\u5BF9"), rows }]);
      if (run.letter) writeMd("reconcile", (0, import_i18n4.t)("\u5BF9\u8D26\u51FD-{p0}", { p0: run.counterparty || run.id }), run.letter);
      store.update((d) => {
        const t = d.reconciles.find((x) => x.id === p.id);
        if (t) t.exportPath = path;
      });
      pushState();
      return { path };
    },
    "rec.remove": (p) => {
      store.update((d) => {
        d.reconciles = d.reconciles.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    "aging.run": (p) => {
      const asOf = (0, import_common4.normDate)(p.asOf) || (0, import_common4.localDate)();
      const rows = parseAgingRows(loadTable(p.path), Math.max(0, Number(p.termsDays) || 30));
      if (!rows.length) throw new Error((0, import_i18n4.t)("\u53F0\u8D26\u91CC\u6CA1\u6709\u8BFB\u5230\u672A\u7ED3\u6B3E\u9879"));
      const a = buildAging(rows, asOf, p.side, settings().risk.staleDays);
      const run = { id: (0, import_common4.newId)("age"), side: p.side, asOf, fileName: (0, import_node_path.basename)(p.path), ...a, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((d) => {
        d.agings.unshift(run);
        d.agings.splice(20);
      });
      pushState();
      return run;
    },
    "aging.dunning": (p) => {
      const run = requireFound(store.data().agings.find((x) => x.id === p.id), (0, import_i18n4.t)("\u8D26\u9F84\u5206\u6790"));
      return dunningLetter(p.counterparty, run.rows, run.asOf, ledger().name);
    },
    "aging.export": async (p) => {
      const run = requireFound(store.data().agings.find((x) => x.id === p.id), (0, import_i18n4.t)("\u8D26\u9F84\u5206\u6790"));
      const rows = run.rows.map((r) => ({
        [(0, import_i18n4.t)("\u5F80\u6765\u5355\u4F4D")]: r.counterparty,
        [(0, import_i18n4.t)("\u5355\u53F7")]: r.docNo,
        [(0, import_i18n4.t)("\u65E5\u671F")]: r.date,
        [(0, import_i18n4.t)("\u5230\u671F\u65E5")]: r.dueDate,
        [(0, import_i18n4.t)("\u91D1\u989D")]: r.amount,
        [(0, import_i18n4.t)("\u5DF2\u7ED3")]: r.paid,
        [(0, import_i18n4.t)("\u672A\u7ED3")]: r.outstanding,
        [(0, import_i18n4.t)("\u8D26\u9F84\uFF08\u5929\uFF09")]: r.ageDays,
        [(0, import_i18n4.t)("\u903E\u671F\uFF08\u5929\uFF09")]: r.overdueDays,
        [(0, import_i18n4.t)("\u8D26\u9F84\u6BB5")]: r.bucket
      }));
      return { path: await writeXlsx("reconcile", (0, import_i18n4.t)("\u8D26\u9F84\u5206\u6790-{p0}", { p0: run.asOf }), [
        { name: (0, import_i18n4.t)("\u660E\u7EC6"), rows },
        { name: (0, import_i18n4.t)("\u8D26\u9F84\u6C47\u603B"), rows: run.buckets.map((b) => ({ [(0, import_i18n4.t)("\u8D26\u9F84\u6BB5")]: b.bucket, [(0, import_i18n4.t)("\u7B14\u6570")]: b.count, [(0, import_i18n4.t)("\u91D1\u989D")]: b.amount })) },
        { name: (0, import_i18n4.t)("\u903E\u671F\u9884\u8B66"), rows: findingRows(run.warnings) }
      ]) };
    },
    "aging.remove": (p) => {
      store.update((d) => {
        d.agings = d.agings.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    // ⑤ 财务报表
    "stmt.build": (p) => {
      const d = store.data();
      let rows;
      let jr;
      if (p.source === "balances") {
        const b = requireFound(d.balances.find((x) => x.period === p.period) || null, (0, import_i18n4.t)("{p0} \u7684\u79D1\u76EE\u4F59\u989D\u8868", { p0: p.period }));
        rows = b.rows;
        jr = journal().filter((r) => (0, import_common4.periodOf)(r.date) === p.period);
      } else {
        jr = journal().filter((r) => (0, import_common4.periodOf)(r.date) === p.period);
        if (!jr.length) throw new Error((0, import_i18n4.t)("{p0} \u6CA1\u6709\u5DF2\u5BA1\u6838\u7684\u51ED\u8BC1\u6216\u5BFC\u5165\u7684\u5E8F\u65F6\u8D26", { p0: p.period }));
        rows = (0, import_voucher.journalToBalances)(jr);
      }
      const prior = d.statements.find((s) => s.period < p.period);
      const out = (0, import_statements.buildStatements)(rows, jr, prior?.income);
      if (p.source === "vouchers") out.checks.push({ code: "no_opening", level: "warn", message: (0, import_i18n4.t)("\u6309\u51ED\u8BC1\u751F\u6210\u65F6\u6CA1\u6709\u671F\u521D\u4F59\u989D\uFF1A\u8D44\u4EA7\u8D1F\u503A\u8868\u53EA\u53CD\u6620\u672C\u671F\u53D1\u751F\uFF0C\u5EFA\u8BAE\u5BFC\u5165\u8D26\u5957\u7684\u79D1\u76EE\u4F59\u989D\u8868") });
      const run = { id: (0, import_common4.newId)("stm"), period: p.period, source: p.source, ...out, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((dd) => {
        dd.statements = [run, ...dd.statements.filter((s) => !(s.period === p.period && s.source === p.source))].sort((a, b) => b.period.localeCompare(a.period)).slice(0, 36);
      });
      pushState();
      return run;
    },
    "stmt.analyze": async (p) => {
      const run = requireFound(store.data().statements.find((x) => x.id === p.id), (0, import_i18n4.t)("\u62A5\u8868"));
      const facts = (0, import_statements.analysisFacts)(run.income, run.balanceSheet);
      const lines = [
        ...run.income.map((l) => `${l.label}\uFF1A${(0, import_i18n4.t)("\u672C\u671F")} ${(0, import_common4.fmt)(l.current)}${l.prior != null ? `\uFF0C${(0, import_i18n4.t)("\u4E0A\u671F")} ${(0, import_common4.fmt)(l.prior)}` : ""}`),
        facts.grossMargin != null ? `${(0, import_i18n4.t)("\u6BDB\u5229\u7387")}\uFF1A${(0, import_common4.pct)(facts.grossMargin)}` : "",
        ...run.balanceSheet.filter((l) => ["cash", "ar", "inventory", "totalAssets", "totalLiab", "totalEquity"].includes(l.key)).map((l) => `${l.label}\uFF1A${(0, import_i18n4.t)("\u671F\u672B")} ${(0, import_common4.fmt)(l.current)}\uFF0C${(0, import_i18n4.t)("\u671F\u521D")} ${(0, import_common4.fmt)(l.prior || 0)}`)
      ].filter(Boolean).join("\n");
      const r = await llm("statements", statementAnalysisPrompt(ledger().name, run.period, lines, ledger().notes));
      const out = store.update((d) => {
        const t = d.statements.find((x) => x.id === p.id);
        t.analysis = r.text.trim();
        t.model = r.model;
        return t;
      });
      pushState();
      return out;
    },
    "stmt.export": async (p) => {
      const run = requireFound(store.data().statements.find((x) => x.id === p.id), (0, import_i18n4.t)("\u62A5\u8868"));
      const path = await writeXlsx("statements", (0, import_i18n4.t)("\u8D22\u52A1\u62A5\u8868-{p0}", { p0: run.period }), [
        { name: (0, import_i18n4.t)("\u8D44\u4EA7\u8D1F\u503A\u8868"), rows: reportLinesRows(run.balanceSheet, (0, import_i18n4.t)("\u671F\u672B\u4F59\u989D"), (0, import_i18n4.t)("\u671F\u521D\u4F59\u989D")) },
        { name: (0, import_i18n4.t)("\u5229\u6DA6\u8868"), rows: reportLinesRows(run.income, (0, import_i18n4.t)("\u672C\u671F\u91D1\u989D"), (0, import_i18n4.t)("\u4E0A\u671F\u91D1\u989D")) },
        { name: (0, import_i18n4.t)("\u73B0\u91D1\u6D41\u91CF\u8868"), rows: reportLinesRows(run.cashflow, (0, import_i18n4.t)("\u672C\u671F\u91D1\u989D"), (0, import_i18n4.t)("\u4E0A\u671F\u91D1\u989D")) },
        { name: (0, import_i18n4.t)("\u52FE\u7A3D\u6821\u9A8C"), rows: run.checks.map((c) => ({ [(0, import_i18n4.t)("\u7ED3\u679C")]: c.level === "ok" ? "\u2713" : c.level === "error" ? "\u2717" : "!", [(0, import_i18n4.t)("\u8BF4\u660E")]: c.message })) }
      ]);
      if (run.analysis) writeMd("statements", (0, import_i18n4.t)("\u7ECF\u8425\u7B80\u8981\u5206\u6790-{p0}", { p0: run.period }), `# ${ledger().name} ${run.period} ${(0, import_i18n4.t)("\u7ECF\u8425\u7B80\u8981\u5206\u6790")}

${run.analysis}
`);
      store.update((d) => {
        const t = d.statements.find((x) => x.id === p.id);
        if (t) t.exportPath = path;
      });
      pushState();
      return { path };
    },
    "stmt.remove": (p) => {
      store.update((d) => {
        d.statements = d.statements.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    // ⑥ 财税风险巡检
    "risk.scan": () => {
      const d = store.data();
      const jr = journal();
      const findings = (0, import_risk.scanRisks)({ docs: d.docs, journal: jr, balances: latestBalances(), agings: d.agings, taxRuns: d.taxRuns, thresholds: settings().risk });
      const run = { id: (0, import_common4.newId)("rsk"), findings, scanned: { docs: d.docs.length, vouchers: d.vouchers.length, journal: jr.length, aging: d.agings.length }, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((dd) => {
        dd.risks.unshift(run);
        dd.risks.splice(20);
      });
      pushState();
      return run;
    },
    "risk.summary": async (p) => {
      const run = requireFound(store.data().risks.find((x) => x.id === p.id), (0, import_i18n4.t)("\u5DE1\u68C0\u8BB0\u5F55"));
      if (!run.findings.length) throw new Error((0, import_i18n4.t)("\u6CA1\u6709\u98CE\u9669\u70B9\uFF0C\u4E0D\u9700\u8981\u5199\u603B\u7ED3"));
      const r = await llm("risk", riskSummaryPrompt(ledger().name, run.findings.map((f) => `[${f.level}] ${f.title}
${f.detail}`).join("\n\n")));
      const out = store.update((d) => {
        const t = d.risks.find((x) => x.id === p.id);
        t.summary = r.text.trim();
        t.model = r.model;
        return t;
      });
      pushState();
      return out;
    },
    "risk.export": (p) => {
      const run = requireFound(store.data().risks.find((x) => x.id === p.id), (0, import_i18n4.t)("\u5DE1\u68C0\u8BB0\u5F55"));
      const path = writeMd("risk", (0, import_i18n4.t)("\u8D22\u7A0E\u98CE\u9669\u62A5\u544A"), (0, import_risk.riskReportMarkdown)(ledger().name, run.findings, run.summary, run.scanned, run.createdAt));
      store.update((d) => {
        const t = d.risks.find((x) => x.id === p.id);
        if (t) t.reportPath = path;
      });
      pushState();
      return { path };
    },
    "risk.remove": (p) => {
      store.update((d) => {
        d.risks = d.risks.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    // ⑦ 预算管控
    "budget.import": (p) => {
      const lines = parseBudget(loadTable(p.path));
      if (!lines.length) throw new Error((0, import_i18n4.t)("\u9884\u7B97\u8868\u91CC\u6CA1\u6709\u8BFB\u5230\u6570\u636E"));
      store.update((d) => {
        d.budget = { year: Number(p.year) || (/* @__PURE__ */ new Date()).getFullYear(), lines };
      });
      pushState();
      return { count: lines.length };
    },
    "budget.save": (p) => {
      const lines = (p.lines || []).filter((l) => l.category?.trim()).map((l) => ({ dept: String(l.dept || "").trim(), category: l.category.trim(), months: Array.from({ length: 12 }, (_, i) => (0, import_common4.round2)(Number(l.months?.[i]) || 0)) }));
      store.update((d) => {
        d.budget = { year: Number(p.year) || (/* @__PURE__ */ new Date()).getFullYear(), lines };
      });
      pushState();
      return { count: lines.length };
    },
    "budget.analyze": (p) => {
      const d = store.data();
      const month = Math.min(12, Math.max(1, Number(p.month) || (/* @__PURE__ */ new Date()).getMonth() + 1));
      const jr = journal();
      const actuals = jr.length ? (0, import_budget.actualsFromJournal)(jr, d.budget.year) : (0, import_budget.actualsFromClaims)(d.claims, d.budget.year);
      const run = { id: (0, import_common4.newId)("bdg"), year: d.budget.year, month, rows: (0, import_budget.analyzeBudget)(d.budget.lines, actuals, month), createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((dd) => {
        dd.budgetAnalyses = [run, ...dd.budgetAnalyses.filter((x) => !(x.year === run.year && x.month === month))].slice(0, 24);
      });
      pushState();
      return { ...run, source: jr.length ? "journal" : "claims" };
    },
    "budget.commentary": async (p) => {
      const run = requireFound(store.data().budgetAnalyses.find((x) => x.id === p.id), (0, import_i18n4.t)("\u9884\u7B97\u5206\u6790"));
      const r = await llm("budget", budgetCommentaryPrompt(ledger().name, (0, import_budget.budgetFacts)(run.rows, run.month)));
      const out = store.update((d) => {
        const t = d.budgetAnalyses.find((x) => x.id === p.id);
        t.commentary = r.text.trim();
        t.model = r.model;
        return t;
      });
      pushState();
      return out;
    },
    "budget.precheck": (p) => {
      const d = store.data();
      const jr = journal();
      const actuals = jr.length ? (0, import_budget.actualsFromJournal)(jr, d.budget.year) : (0, import_budget.actualsFromClaims)(d.claims, d.budget.year);
      return (0, import_budget.precheckSpend)(d.budget.lines, actuals, p.dept, p.category, Number(p.amount) || 0, (/* @__PURE__ */ new Date()).getMonth() + 1);
    },
    "budget.export": async (p) => {
      const run = requireFound(store.data().budgetAnalyses.find((x) => x.id === p.id), (0, import_i18n4.t)("\u9884\u7B97\u5206\u6790"));
      const rows = run.rows.map((r) => ({
        [(0, import_i18n4.t)("\u90E8\u95E8")]: r.dept,
        [(0, import_i18n4.t)("\u7C7B\u522B")]: r.category,
        [(0, import_i18n4.t)("\u7D2F\u8BA1\u9884\u7B97")]: r.budget,
        [(0, import_i18n4.t)("\u7D2F\u8BA1\u5B9E\u9645")]: r.actual,
        [(0, import_i18n4.t)("\u6267\u884C\u7387")]: (0, import_common4.pct)(r.usage),
        [(0, import_i18n4.t)("\u672C\u6708\u9884\u7B97")]: r.monthBudget,
        [(0, import_i18n4.t)("\u672C\u6708\u5B9E\u9645")]: r.monthActual,
        [(0, import_i18n4.t)("\u672C\u6708\u5DEE\u5F02")]: (0, import_common4.round2)(r.monthActual - r.monthBudget),
        [(0, import_i18n4.t)("\u72B6\u6001")]: r.level === "over" ? (0, import_i18n4.t)("\u8D85\u9884\u7B97") : r.level === "warn" ? (0, import_i18n4.t)("\u63A5\u8FD1\u4E0A\u9650") : (0, import_i18n4.t)("\u6B63\u5E38")
      }));
      const path = await writeXlsx("budget", (0, import_i18n4.t)("\u9884\u7B97\u6267\u884C-{y}\u5E74{m}\u6708", { y: run.year, m: run.month }), [{ name: (0, import_i18n4.t)("\u9884\u7B97\u6267\u884C"), rows }]);
      if (run.commentary) writeMd("budget", (0, import_i18n4.t)("\u9884\u7B97\u5DEE\u5F02\u89E3\u8BFB-{y}\u5E74{m}\u6708", { y: run.year, m: run.month }), run.commentary);
      store.update((d) => {
        const t = d.budgetAnalyses.find((x) => x.id === p.id);
        if (t) t.exportPath = path;
      });
      pushState();
      return { path };
    },
    // ⑧ 成本核算
    "cost.importProducts": (p) => parseCostProducts(loadTable(p.path)),
    "cost.importMaterials": (p) => parseCostMaterials(loadTable(p.path)),
    "cost.compute": (p) => {
      if (!p.products?.length) throw new Error((0, import_i18n4.t)("\u8BF7\u5148\u5BFC\u5165\u6216\u586B\u5199\u4EA7\u54C1\u4EA7\u91CF"));
      const d = store.data();
      const prior = d.costRuns.find((r2) => r2.period < p.period) || null;
      const input = { products: p.products, materials: p.materials || [], laborTotal: Number(p.laborTotal) || 0, overheadItems: (p.overheadItems || []).filter((o) => o.item && Number(o.amount)), basis: p.basis || "hours", lossTolerance: Number(p.lossTolerance) || 0.05, prior };
      const r = (0, import_cost.computeCost)(input);
      const run = { id: (0, import_common4.newId)("cst"), period: p.period, basis: input.basis, laborTotal: input.laborTotal, overheadItems: input.overheadItems, products: input.products, materials: input.materials, lossTolerance: input.lossTolerance, ...r, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((dd) => {
        dd.costRuns = [run, ...dd.costRuns.filter((x) => x.period !== p.period)].sort((a, b) => b.period.localeCompare(a.period)).slice(0, 36);
      });
      pushState();
      return run;
    },
    "cost.commentary": async (p) => {
      const run = requireFound(store.data().costRuns.find((x) => x.id === p.id), (0, import_i18n4.t)("\u6210\u672C\u6838\u7B97"));
      const facts = [
        ...run.result.map((r2) => (0, import_i18n4.t)("{p0}\uFF1A\u4EA7\u91CF {o}\uFF0C\u6750\u6599 {a}\uFF0C\u4EBA\u5DE5 {b}\uFF0C\u5236\u9020\u8D39\u7528 {c}\uFF0C\u603B\u6210\u672C {d}\uFF0C\u5355\u4F4D\u6210\u672C {e}{p1}", { p0: r2.product, o: r2.output, a: (0, import_common4.fmt)(r2.material), b: (0, import_common4.fmt)(r2.labor), c: (0, import_common4.fmt)(r2.overhead), d: (0, import_common4.fmt)(r2.total), e: (0, import_common4.fmt)(r2.unitCost), p1: r2.priorUnitCost != null ? (0, import_i18n4.t)("\uFF08\u4E0A\u671F {p0}\uFF09", { p0: (0, import_common4.fmt)(r2.priorUnitCost) }) : "" })),
        ...run.losses.map((f) => `${f.title}\uFF1A${f.detail}`)
      ].join("\n");
      const r = await llm("cost", costCommentaryPrompt(ledger().name, facts));
      const out = store.update((d) => {
        const t = d.costRuns.find((x) => x.id === p.id);
        t.commentary = r.text.trim();
        t.model = r.model;
        return t;
      });
      pushState();
      return out;
    },
    "cost.export": async (p) => {
      const run = requireFound(store.data().costRuns.find((x) => x.id === p.id), (0, import_i18n4.t)("\u6210\u672C\u6838\u7B97"));
      const path = await writeXlsx("cost", (0, import_i18n4.t)("\u6210\u672C\u8BA1\u7B97\u5355-{p0}", { p0: run.period }), [
        { name: (0, import_i18n4.t)("\u6210\u672C\u8BA1\u7B97\u5355"), rows: (0, import_cost.costExportRows)(run) },
        { name: (0, import_i18n4.t)("\u5206\u914D\u8FC7\u7A0B"), rows: run.calc.map((c) => ({ [(0, import_i18n4.t)("\u9879\u76EE")]: c.label, [(0, import_i18n4.t)("\u8BA1\u7B97")]: c.formula, [(0, import_i18n4.t)("\u7ED3\u679C")]: c.value })) },
        { name: (0, import_i18n4.t)("\u5F02\u5E38\u4E0E\u6CE2\u52A8"), rows: findingRows(run.losses) }
      ]);
      if (run.commentary) writeMd("cost", (0, import_i18n4.t)("\u6210\u672C\u5206\u6790-{p0}", { p0: run.period }), run.commentary);
      store.update((d) => {
        const t = d.costRuns.find((x) => x.id === p.id);
        if (t) t.exportPath = path;
      });
      pushState();
      return { path };
    },
    "cost.remove": (p) => {
      store.update((d) => {
        d.costRuns = d.costRuns.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    // ⑨ 合同财税审核
    "contract.review": async (p) => {
      const id = (0, import_common4.newId)("ctr");
      const dest = (0, import_node_path.join)(store.filesDir(), `${id}${(0, import_node_path.extname)(p.path).toLowerCase()}`);
      (0, import_node_fs.copyFileSync)(p.path, dest);
      progress("contract", (0, import_i18n4.t)("\u6B63\u5728\u8BFB\u53D6\u5408\u540C\uFF1A{p0}", { p0: (0, import_node_path.basename)(p.path) }));
      const ex = await extractText(dest);
      if (ex.text.trim().length < 30) throw new Error(ex.warning || (0, import_i18n4.t)("\u5408\u540C\u91CC\u6CA1\u6709\u8BFB\u5230\u6587\u5B57"));
      const type = detectContractType(ex.text);
      const amt = extractContractAmount(ex.text);
      const findings = ruleFindings(ex.text);
      const review = {
        id,
        fileName: (0, import_node_path.basename)(p.path),
        path: dest,
        contractType: type ? typeLabel(type.type) : (0, import_i18n4.t)("\u672A\u8BC6\u522B"),
        amount: amt.total,
        clauses: [],
        findings,
        stampDuty: stampDuty(type, amt.total, amt.exclTax),
        textLength: ex.text.length,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (amt.quote) review.clauses.push({ type: (0, import_i18n4.t)("\u4EF7\u6B3E"), quote: amt.quote, value: amt.total != null ? (0, import_common4.fmt)(amt.total) : "", verified: true });
      if (p.useModel !== false) {
        progress("contract", (0, import_i18n4.t)("\u6A21\u578B\u6B63\u5728\u9010\u6761\u8BFB\u6D89\u7A0E\u6761\u6B3E\u2026"));
        try {
          const r = await llmJson("contract", contractPrompt(ex.text), 24e4);
          review.model = r.model;
          review.clauses.push(...verifyClauses(r.json?.clauses, ex.text));
          review.findings.push(...verifyLlmRisks(r.json?.risks, ex.text, review.findings));
        } catch (error) {
          review.findings.push({ code: "llm_failed", level: "info", title: (0, import_i18n4.t)("\u6A21\u578B\u5BA1\u6838\u6CA1\u6709\u5B8C\u6210"), detail: error?.message || "", suggestion: (0, import_i18n4.t)("\u4E0A\u9762\u662F\u56FA\u5B9A\u89C4\u5219\u7684\u7ED3\u679C\uFF1B\u53EF\u4EE5\u6362\u4E2A\u6A21\u578B\u91CD\u8BD5") });
        }
      }
      const order = { high: 0, warn: 1, info: 2 };
      review.findings.sort((a, b) => order[a.level] - order[b.level]);
      store.update((d) => {
        d.contracts.unshift(review);
        d.contracts.splice(50);
      });
      progress("contract", "");
      pushState();
      return review;
    },
    "contract.export": (p) => {
      const c = requireFound(store.data().contracts.find((x) => x.id === p.id), (0, import_i18n4.t)("\u5408\u540C\u5BA1\u6838"));
      const lv = { high: (0, import_i18n4.t)("\u9AD8"), warn: (0, import_i18n4.t)("\u4E2D"), info: (0, import_i18n4.t)("\u4F4E") };
      const md = [
        `# ${(0, import_i18n4.t)("\u5408\u540C\u8D22\u7A0E\u5BA1\u6838\u610F\u89C1\uFF1A{p0}", { p0: c.fileName })}`,
        "",
        (0, import_i18n4.t)("\u5408\u540C\u7C7B\u578B\uFF1A{p0}\u3000\u5408\u540C\u91D1\u989D\uFF1A{p1}", { p0: c.contractType, p1: c.amount != null ? (0, import_common4.fmt)(c.amount) : (0, import_i18n4.t)("\u672A\u8BC6\u522B") }),
        "",
        `> ${(0, import_i18n4.t)("\u672C\u610F\u89C1\u7531\u8D22\u52A1\u667A\u80FD\u4F53\u751F\u6210\uFF0C\u4EC5\u4F9B\u53C2\u8003\uFF0C\u9700\u8D22\u52A1 / \u6CD5\u52A1\u4EBA\u5458\u590D\u6838\u786E\u8BA4\u3002")}`,
        "",
        `## ${(0, import_i18n4.t)("\u6D89\u7A0E\u6761\u6B3E")}`,
        "",
        ...c.clauses.map((x) => `- **${x.type}**\uFF1A${x.value}${x.quote ? `\u3000\u300C${x.quote}\u300D` : ""}${x.verified ? "" : `\uFF08${(0, import_i18n4.t)("\u672A\u5728\u539F\u6587\u6838\u5B9E")}\uFF09`}`),
        "",
        `## ${(0, import_i18n4.t)("\u98CE\u9669\u63D0\u793A")}`,
        "",
        ...c.findings.flatMap((f, i) => [`### ${i + 1}. [${lv[f.level]}] ${f.title}`, "", f.detail, "", `**${(0, import_i18n4.t)("\u5EFA\u8BAE")}**\uFF1A${f.suggestion}`, ""]),
        ...c.stampDuty ? [`## ${(0, import_i18n4.t)("\u5370\u82B1\u7A0E\u6D4B\u7B97")}`, "", ...c.stampDuty.map((l) => `- ${l.label}\uFF1A${l.formula}${l.value > 1 ? ` = ${(0, import_common4.fmt)(l.value)}` : ""}`), ""] : []
      ].join("\n");
      const path = writeMd("contract", (0, import_i18n4.t)("\u5408\u540C\u5BA1\u6838-{p0}", { p0: c.fileName.replace(/\.[^.]+$/, "") }), md);
      store.update((d) => {
        const t = d.contracts.find((x) => x.id === p.id);
        if (t) t.exportPath = path;
      });
      pushState();
      return { path };
    },
    "contract.remove": (p) => {
      store.update((d) => {
        d.contracts = d.contracts.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    // ⑩ 财务问答
    "qa.ask": async (p) => {
      const q = String(p?.question || "").trim();
      if (!q) throw new Error((0, import_i18n4.t)("\u8BF7\u8F93\u5165\u95EE\u9898"));
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const userMsg = { id: (0, import_common4.newId)("qa"), role: "user", text: q, at: now };
      const history = store.data().qa.map((m) => ({ role: m.role, text: m.text }));
      store.update((d) => {
        d.qa.push(userMsg);
      });
      pushState();
      const citations = (0, import_knowledge.citationsFor)(q, store.policies());
      const l = ledger();
      const r = await llm("qa", qaPrompt(q, citations, history, { name: l.name, taxpayer: l.taxpayerType === "general" ? (0, import_i18n4.t)("\u4E00\u822C\u7EB3\u7A0E\u4EBA") : (0, import_i18n4.t)("\u5C0F\u89C4\u6A21\u7EB3\u7A0E\u4EBA"), notes: l.notes }));
      const answer = { id: (0, import_common4.newId)("qa"), role: "assistant", text: r.text.trim(), citations, model: r.model, at: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((d) => {
        d.qa.push(answer);
      });
      pushState();
      return answer;
    },
    "qa.clear": () => {
      store.update((d) => {
        d.qa = [];
      });
      pushState();
      return true;
    },
    "policy.import": async (p) => {
      let total = 0;
      for (const path of p.paths || []) {
        progress("qa", (0, import_i18n4.t)("\u6B63\u5728\u8BFB\u53D6\u5236\u5EA6\uFF1A{p0}", { p0: (0, import_node_path.basename)(path) }));
        const ex = await extractText(path);
        if (!ex.text.trim()) continue;
        const id = (0, import_common4.newId)("pol");
        const chunks = (0, import_knowledge.chunkPolicy)(id, (0, import_node_path.basename)(path), ex.text);
        store.savePolicies([...store.policies(), ...chunks]);
        store.update((d) => {
          d.policies.push({ id, fileName: (0, import_node_path.basename)(path), chunks: chunks.length, importedAt: (/* @__PURE__ */ new Date()).toISOString() });
        });
        total += chunks.length;
      }
      progress("qa", "");
      pushState();
      return { chunks: total };
    },
    "policy.remove": (p) => {
      store.savePolicies(store.policies().filter((c) => c.docId !== p.id));
      store.update((d) => {
        d.policies = d.policies.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    /** 总览：各智能体的数据概况（方案说明页、tab 角标用） */
    "overview": () => {
      const d = store.data();
      const today = (0, import_common4.localDate)();
      return {
        docs: d.docs.length,
        flaggedDocs: d.docs.filter((x) => x.status === "flagged").length,
        draftVouchers: d.vouchers.filter((v) => v.status === "draft").length,
        reviewedVouchers: d.vouchers.filter((v) => v.status === "reviewed").length,
        journalRows: d.journal?.rows.length || 0,
        balances: d.balances.map((b) => b.period),
        pendingClaims: d.claims.filter((c) => !c.decision).length,
        overdue: d.agings[0]?.byCounterparty.filter((x) => x.overdue > 0).length || 0,
        risks: d.risks[0]?.findings.filter((f) => f.level === "high").length || 0,
        overBudget: d.budgetAnalyses[0]?.rows.filter((r) => r.level === "over").length || 0,
        thisMonthTax: d.taxRuns.find((t) => (0, import_tax.inPeriod)(today, t.period))?.id || null
      };
    }
  };
  function reviewOne(claimId) {
    const d = store.data();
    const claim = requireFound(d.claims.find((c) => c.id === claimId), (0, import_i18n4.t)("\u62A5\u9500\u5355"));
    const month = (0, import_common4.localDate)().slice(0, 7);
    const monthUsed = (0, import_common4.sum)(d.claims.filter((c) => c.id !== claim.id && c.employee === claim.employee && c.createdAt.startsWith(month) && (c.decision === "approved" || !c.decision && c.verdict === "pass")).map((c) => c.total));
    const reviewed = (0, import_expense.reviewClaim)(claim, d.docs.filter((x) => x.claimId === claim.id), { ledger: ledger(), rules: settings().expense, allDocs: d.docs, monthUsed });
    reviewed.notice = (0, import_expense.claimNotice)(reviewed, ledger().name);
    const out = store.update((dd) => {
      const i = dd.claims.findIndex((c) => c.id === claimId);
      dd.claims[i] = reviewed;
      return reviewed;
    });
    pushState();
    return out;
  }
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_FA_INVOKE, async (_e, req) => {
    const fn = actions[String(req?.action || "")];
    if (!fn) throw new Error((0, import_i18n4.t)("\u672A\u77E5\u64CD\u4F5C\uFF1A{p0}", { p0: String(req?.action || "") }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.("finance-agent", `${req.action} failed`, { error: error?.message });
      throw new Error((0, import_userFacingError.userFacingError)(error));
    }
  });
  const apiTimer = setTimeout(() => {
    void applyApiSetting().then(pushState).catch(() => {
    });
  }, 3e3);
  apiTimer.unref?.();
  const stopBackground = () => {
    clearTimeout(apiTimer);
    void api.stop();
  };
  (0, import_quitRegistry.onAppWillQuit)("finance-agent", stopBackground, { once: true });
  return stopBackground;
}

// ../../../../../../../../../Users/mac02/Desktop/work/new-work/totalclaw-qiye-app/apps/desktop-shell/node_modules/.cache/solutions-build/workbench-finance-agent/entry.main.ts
var hostApi = 2;
var registerFunction = "registerFinanceAgentHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerFinanceAgentHandlers(ctx.host.deps);
}
async function deactivate() {
  const c = cleanup;
  cleanup = void 0;
  if (typeof c === "function") await c();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate,
  hostApi,
  registerFunction
});
