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

// node_modules/.cache/solutions-build/workbench-biz-automation/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-biz-automation/src/main/ipc/bizAutomation.ipc.ts
var import_electron = require("electron");
var import_node_fs3 = require("node:fs");
var import_node_path3 = require("node:path");
var import_node_stream = require("node:stream");
var import_promises = require("node:stream/promises");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_i18n4 = require("npm:@totalclaw/i18n");
var import_userFacingError = require("host:apps/desktop-shell/src/main/utils/userFacingError.ts");
var import_quitRegistry = require("host:apps/desktop-shell/src/main/util/quitRegistry.ts");
var import_workbenchLlm = require("host:apps/desktop-shell/src/main/services/workbenchLlm.ts");

// ../../../totalclaw-solutions/solutions/workbench-biz-automation/src/main/services/bizAutomation/store.ts
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_crypto = require("node:crypto");
var import_i18n2 = require("npm:@totalclaw/i18n");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");

// ../../../totalclaw-solutions/solutions/workbench-biz-automation/src/main/services/bizAutomation/logic.ts
var import_i18n = require("npm:@totalclaw/i18n");

// ../../../totalclaw-solutions/solutions/workbench-biz-automation/src/main/services/bizAutomation/columnKeywords.json
var columnKeywords_default = {
  _note: "\u7ECF\u8425\u81EA\u52A8\u5316\u667A\u80FD\u4F53\u5BFC\u5165\u6536\u94F6 / \u8D39\u7528\u8868\u683C\u7684\u5217\u8BC6\u522B\u5173\u952E\u5B57\uFF08\u6309\u4F18\u5148\u7EA7\uFF0C\u5148\u7CBE\u786E\u540E\u5305\u542B\uFF09\u3002\u4E0D\u8FDB i18n \u8BCD\u5178\uFF1A\u8981\u5339\u914D\u5BA2\u6237\u8868\u683C\u91CC\u7684\u771F\u5B9E\u8868\u5934\u3002",
  date: [
    "\u9500\u552E\u65E5\u671F",
    "\u4EA4\u6613\u65E5\u671F",
    "\u4E0B\u5355\u65F6\u95F4",
    "\u8BA2\u5355\u65F6\u95F4",
    "\u652F\u4ED8\u65F6\u95F4",
    "\u5355\u636E\u65E5\u671F",
    "\u4E1A\u52A1\u65E5\u671F",
    "\u65E5\u671F",
    "\u65F6\u95F4",
    "date",
    "\u6708\u4EFD",
    "\u671F\u95F4",
    "month"
  ],
  orderNo: [
    "\u8BA2\u5355\u53F7",
    "\u5C0F\u7968\u53F7",
    "\u5355\u636E\u53F7",
    "\u6D41\u6C34\u53F7",
    "\u9500\u552E\u5355\u53F7",
    "\u5355\u53F7",
    "order"
  ],
  sku: [
    "\u8D27\u53F7",
    "\u6B3E\u53F7",
    "\u5546\u54C1\u7F16\u7801",
    "\u5546\u54C1\u8D27\u53F7",
    "SKU",
    "\u6761\u7801",
    "sku"
  ],
  name: [
    "\u5546\u54C1\u540D\u79F0",
    "\u54C1\u540D",
    "\u5546\u54C1",
    "\u6B3E\u5F0F\u540D\u79F0",
    "\u540D\u79F0",
    "product"
  ],
  category: [
    "\u54C1\u7C7B",
    "\u7C7B\u522B",
    "\u5206\u7C7B",
    "\u5546\u54C1\u5206\u7C7B",
    "category"
  ],
  qty: [
    "\u9500\u552E\u6570\u91CF",
    "\u6570\u91CF",
    "\u4EF6\u6570",
    "qty"
  ],
  amount: [
    "\u5B9E\u6536\u91D1\u989D",
    "\u6210\u4EA4\u91D1\u989D",
    "\u9500\u552E\u91D1\u989D",
    "\u5B9E\u4ED8\u91D1\u989D",
    "\u5E94\u6536\u91D1\u989D",
    "\u91D1\u989D",
    "amount"
  ],
  cost: [
    "\u6210\u672C\u91D1\u989D",
    "\u9500\u552E\u6210\u672C",
    "\u6210\u672C",
    "\u8FDB\u4EF7\u91D1\u989D",
    "cost"
  ],
  channel: [
    "\u6E20\u9053",
    "\u9500\u552E\u6E20\u9053",
    "\u95E8\u5E97",
    "\u5E97\u94FA",
    "\u6765\u6E90",
    "channel"
  ],
  item: [
    "\u8D39\u7528\u9879\u76EE",
    "\u8D39\u7528\u7C7B\u522B",
    "\u9879\u76EE",
    "\u79D1\u76EE",
    "\u6458\u8981",
    "item"
  ],
  expense: [
    "\u91D1\u989D",
    "\u8D39\u7528\u91D1\u989D",
    "\u652F\u51FA\u91D1\u989D",
    "amount"
  ],
  size: [
    "\u5C3A\u7801",
    "\u89C4\u683C",
    "\u5C3A\u5BF8",
    "size"
  ],
  stock: [
    "\u53EF\u7528\u5E93\u5B58",
    "\u73B0\u6709\u5E93\u5B58",
    "\u5E93\u5B58\u6570\u91CF",
    "\u5728\u5E93\u6570\u91CF",
    "\u7ED3\u5B58\u6570\u91CF",
    "\u5E93\u5B58",
    "stock"
  ]
};

// ../../../totalclaw-solutions/solutions/workbench-biz-automation/src/main/services/bizAutomation/bannedWords.json
var bannedWords_default = {
  _note: "\u5E7F\u544A\u6CD5\u6781\u9650\u8BCD / \u7981\u7528\u8BCD\uFF08\u8282\u9009\u5E38\u89C1\u9879\uFF09\uFF0C\u7528\u4E8E\u77ED\u89C6\u9891\u6587\u6848\u3001\u4E0A\u67B6\u6807\u9898\u3001\u6570\u5B57\u4EBA\u8BB2\u7A3F\u81EA\u68C0\u3002\u662F\u5339\u914D\u6A21\u5F0F\uFF0C\u4E0D\u8FDB i18n \u8BCD\u5178\u3002",
  words: [
    "\u7B2C\u4E00",
    "\u552F\u4E00",
    "\u9996\u4E2A",
    "\u9996\u9009",
    "\u9876\u7EA7",
    "\u6781\u54C1",
    "\u6781\u81F4",
    "\u56FD\u5BB6\u7EA7",
    "\u4E16\u754C\u7EA7",
    "\u5168\u7F51\u6700",
    "\u5168\u56FD\u7B2C\u4E00",
    "\u72EC\u4E00\u65E0\u4E8C",
    "\u7EDD\u65E0\u4EC5\u6709",
    "\u53F2\u65E0\u524D\u4F8B",
    "\u4E07\u80FD",
    "100%",
    "\u767E\u5206\u767E",
    "\u7EDD\u5BF9",
    "\u6C38\u4E45",
    "\u7EC8\u8EAB",
    "\u96F6\u98CE\u9669",
    "\u65E0\u654C",
    "\u738B\u724C",
    "\u9500\u91CF\u51A0\u519B",
    "NO.1",
    "No.1",
    "TOP1",
    "Top1",
    "\u79D2\u6740\u5168\u7F51",
    "\u7279\u4F9B",
    "\u4E13\u4F9B",
    "\u9A70\u540D",
    "\u514D\u68C0",
    "\u6CBB\u7597",
    "\u7626\u8EAB",
    "\u7F8E\u767D"
  ],
  patterns: [
    "\u6700(\u597D|\u4F73|\u4F18|\u4F4E|\u9AD8|\u4FBF\u5B9C|\u5F3A|\u5927|\u7F8E|\u706B|\u70ED|\u503C|\u5212\u7B97|\u53D7\u6B22\u8FCE|\u65F6\u5C1A|\u8212\u9002|\u65B0\u6F6E|\u7545\u9500)"
  ]
};

// ../../../totalclaw-solutions/solutions/workbench-biz-automation/src/main/services/bizAutomation/logic.ts
var round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
var ratio = (a, b) => b > 0 ? Math.round(a / b * 1e4) / 1e4 : 0;
var KEYWORDS = columnKeywords_default;
function detectColumns(headers, roles) {
  const norm = (s) => String(s || "").replace(/\s+/g, "").toLowerCase();
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
function toNumber(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  let s = String(v ?? "").trim();
  if (!s) return 0;
  const neg = /^\(.*\)$/.test(s) || /^-/.test(s);
  s = s.replace(/[(),，¥￥$\s元件]/g, "").replace(/^-/, "");
  const n = Number(s);
  return Number.isFinite(n) ? neg ? -n : n : 0;
}
function toDate(v) {
  if (v == null || v === "") return "";
  if (typeof v === "number" && v > 2e4 && v < 8e4) {
    const d = new Date(Math.round((v - 25569) * 86400 * 1e3));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}`;
  const m = /(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})/.exec(String(v));
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : "";
}
function parseSales(headers, raw) {
  const c = detectColumns(headers, ["date", "orderNo", "sku", "name", "category", "qty", "amount", "cost", "channel"]);
  const missing = ["date", "amount"].filter((r) => !c[r]);
  if (missing.length) throw new Error((0, import_i18n.t)("\u9500\u552E\u8868\u91CC\u6CA1\u627E\u5230\u8FD9\u4E9B\u5217\uFF1A{p0}\u3002\u8868\u5934\u662F\uFF1A{p1}", { p0: missing.map((m) => m === "date" ? (0, import_i18n.t)("\u65E5\u671F") : (0, import_i18n.t)("\u91D1\u989D")).join("\u3001"), p1: headers.slice(0, 20).join(" / ") }));
  const rows = [];
  let skipped = 0;
  let lastDate = "";
  let lastOrder = "";
  raw.forEach((r, i) => {
    const date = toDate(r[c.date]) || lastDate;
    const amount = toNumber(r[c.amount]);
    if (!date || !amount && !toNumber(c.qty ? r[c.qty] : 0)) {
      skipped++;
      return;
    }
    const orderNo = String(c.orderNo && r[c.orderNo] || "").trim() || lastOrder || `row-${i + 1}`;
    lastDate = date;
    lastOrder = orderNo;
    const qtyRaw = c.qty ? toNumber(r[c.qty]) : 0;
    rows.push({
      date,
      orderNo,
      sku: String(c.sku && r[c.sku] || "").trim(),
      name: String(c.name && r[c.name] || "").trim(),
      category: String(c.category && r[c.category] || "").trim(),
      qty: qtyRaw || (amount < 0 ? -1 : 1),
      amount: round2(amount),
      cost: c.cost && String(r[c.cost] ?? "").trim() !== "" ? round2(toNumber(r[c.cost])) : null,
      channel: String(c.channel && r[c.channel] || "").trim() || (0, import_i18n.t)("\u95E8\u5E97")
    });
  });
  return { rows, skipped, mapping: Object.fromEntries(Object.entries(c).filter(([, v]) => v)) };
}
function parseExpenses(headers, raw) {
  const c = detectColumns(headers, ["date", "item", "expense"]);
  const missing = ["date", "expense"].filter((r) => !c[r]);
  if (missing.length) throw new Error((0, import_i18n.t)("\u8D39\u7528\u8868\u91CC\u6CA1\u627E\u5230\u8FD9\u4E9B\u5217\uFF1A{p0}\u3002\u8868\u5934\u662F\uFF1A{p1}", { p0: missing.map((m) => m === "date" ? (0, import_i18n.t)("\u65E5\u671F") : (0, import_i18n.t)("\u91D1\u989D")).join("\u3001"), p1: headers.slice(0, 20).join(" / ") }));
  const rows = [];
  let skipped = 0;
  for (const r of raw) {
    const rawDate = r[c.date];
    const ym = /(\d{4})\s*[-/.年]\s*(\d{1,2})\s*月?\s*$/.exec(String(rawDate ?? "").trim());
    const date = toDate(rawDate) || (ym ? `${ym[1]}-${ym[2].padStart(2, "0")}-01` : "");
    const amount = toNumber(r[c.expense]);
    if (!date || !amount) {
      skipped++;
      continue;
    }
    rows.push({ date, item: String(c.item && r[c.item] || "").trim() || (0, import_i18n.t)("\u5176\u4ED6"), amount: round2(Math.abs(amount)) });
  }
  return { rows, skipped, mapping: Object.fromEntries(Object.entries(c).filter(([, v]) => v)) };
}
function parseInventory(headers, raw) {
  const c = detectColumns(headers, ["sku", "name", "size", "stock"]);
  const missing = [];
  if (!c.sku && !c.name) missing.push((0, import_i18n.t)("\u8D27\u53F7\u6216\u5546\u54C1\u540D\u79F0"));
  if (!c.stock) missing.push((0, import_i18n.t)("\u5E93\u5B58"));
  if (missing.length) throw new Error((0, import_i18n.t)("\u5E93\u5B58\u8868\u91CC\u6CA1\u627E\u5230\u8FD9\u4E9B\u5217\uFF1A{p0}\u3002\u8868\u5934\u662F\uFF1A{p1}", { p0: missing.join("\u3001"), p1: headers.slice(0, 20).join(" / ") }));
  const rows = [];
  let skipped = 0;
  for (const r of raw) {
    const sku = String(c.sku && r[c.sku] || "").trim();
    const name = String(c.name && r[c.name] || "").trim();
    const stockRaw = String(r[c.stock] ?? "").trim();
    if (!sku && !name || stockRaw === "" || !Number.isFinite(toNumber(stockRaw))) {
      skipped++;
      continue;
    }
    rows.push({ sku, name, size: String(c.size && r[c.size] || "").trim().toUpperCase() || "F", stock: Math.max(0, Math.round(toNumber(stockRaw))) });
  }
  return { rows, skipped, mapping: Object.fromEntries(Object.entries(c).filter(([, v]) => v)) };
}
function applyInventory(garments, rows) {
  const acc = /* @__PURE__ */ new Map();
  const unmatched = /* @__PURE__ */ new Set();
  for (const r of rows) {
    const g = garments.find((x) => r.sku && x.sku && x.sku === r.sku) || garments.find((x) => r.name && x.name === r.name);
    if (!g) {
      unmatched.add(r.sku || r.name);
      continue;
    }
    const st = acc.get(g.id) || {};
    st[r.size] = (st[r.size] || 0) + r.stock;
    acc.set(g.id, st);
  }
  return { updates: [...acc].map(([id, stock]) => ({ id, stock })), unmatched: [...unmatched] };
}
function shiftDate(day, deltaDays) {
  const d = /* @__PURE__ */ new Date(`${day}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysBetween(from, to) {
  return Math.round((Date.parse(`${to}T00:00:00`) - Date.parse(`${from}T00:00:00`)) / 864e5) + 1;
}
function group(rows, key, total) {
  const m = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const k = key(r) || (0, import_i18n.t)("\u672A\u5206\u7C7B");
    m.set(k, (m.get(k) || 0) + r.amount);
  }
  return [...m].map(([k, v]) => ({ key: k, label: k, value: round2(v), share: ratio(v, total) })).sort((a, b) => b.value - a.value);
}
function core(sales, expenses, from, to) {
  const inRange = sales.filter((r) => r.date >= from && r.date <= to);
  const pos = inRange.filter((r) => r.amount > 0);
  const neg = inRange.filter((r) => r.amount < 0);
  const revenue = round2(pos.reduce((s, r) => s + r.amount, 0));
  const refunds = round2(-neg.reduce((s, r) => s + r.amount, 0));
  const netRevenue = round2(revenue - refunds);
  const withCost = inRange.filter((r) => r.cost != null);
  const cost = round2(withCost.reduce((s, r) => s + (r.amount < 0 ? -Math.abs(r.cost) : r.cost), 0));
  const coveredRevenue = round2(withCost.reduce((s, r) => s + r.amount, 0));
  const grossProfit = round2(coveredRevenue - cost);
  const orders = new Set(pos.map((r) => r.orderNo)).size;
  const units = pos.reduce((s, r) => s + Math.max(0, r.qty), 0) - neg.reduce((s, r) => s + Math.abs(r.qty), 0);
  const exp = round2(expenses.filter((e) => e.date >= from && e.date <= to).reduce((s, e) => s + e.amount, 0));
  return { inRange, revenue, refunds, netRevenue, cost, coveredRevenue, grossProfit, orders, units, exp };
}
function computeMetrics(sales, expenses, garments, from, to) {
  const c = core(sales, expenses, from, to);
  const len = Math.max(1, daysBetween(from, to));
  const pf = shiftDate(from, -len);
  const pt = shiftDate(from, -1);
  const p = core(sales, expenses, pf, pt);
  const itemRows = group(c.inRange, (r) => r.name || r.sku, c.netRevenue).slice(0, 10);
  const unitCostOf = (match) => {
    const rows = sales.filter((r) => match(r) && r.cost != null && r.qty > 0);
    const q = rows.reduce((s, r) => s + r.qty, 0);
    return q > 0 ? rows.reduce((s, r) => s + r.cost, 0) / q : null;
  };
  const matchG = (g) => (r) => !!g.sku && r.sku === g.sku || !!r.name && r.name === g.name;
  let inventoryValue = null;
  for (const g of garments) {
    const stock = Object.values(g.stock || {}).reduce((s, n) => s + (Number(n) || 0), 0);
    if (!stock) continue;
    const uc = unitCostOf(matchG(g));
    if (uc == null) continue;
    inventoryValue = (inventoryValue || 0) + stock * uc;
  }
  const dailyCost = c.cost / len;
  const byItem = /* @__PURE__ */ new Map();
  for (const r of c.inRange) {
    const k = r.name || r.sku || (0, import_i18n.t)("\u672A\u547D\u540D");
    byItem.set(k, [...byItem.get(k) || [], r]);
  }
  const items = [...byItem].map(([k, rows]) => {
    const qty = rows.reduce((s, r) => s + r.qty, 0);
    const amount = round2(rows.reduce((s, r) => s + r.amount, 0));
    const withCost = rows.filter((r) => r.cost != null);
    const gp = withCost.length === rows.length ? round2(amount - withCost.reduce((s, r) => s + (r.amount < 0 ? -Math.abs(r.cost) : r.cost), 0)) : null;
    const g = garments.find((x) => x.name === k || !!x.sku && rows.some((r) => r.sku === x.sku));
    const stock = g ? Object.values(g.stock || {}).reduce((s, n) => s + (Number(n) || 0), 0) : null;
    return { key: k, label: k, qty, amount, grossProfit: gp, sellThrough: stock == null || qty <= 0 ? null : ratio(qty, qty + stock) };
  }).sort((a, b) => b.amount - a.amount);
  const daily = [];
  for (let i = 0; i < len && i < 400; i++) {
    const day = shiftDate(from, i);
    const rows = c.inRange.filter((r) => r.date === day);
    daily.push({ day, netRevenue: round2(rows.reduce((s, r) => s + r.amount, 0)), orders: new Set(rows.filter((r) => r.amount > 0).map((r) => r.orderNo)).size });
  }
  const slowMovers = garments.map((g) => {
    const stock = Object.values(g.stock || {}).reduce((s, n) => s + (Number(n) || 0), 0);
    const qty = c.inRange.filter(matchG(g)).reduce((s, r) => s + r.qty, 0);
    return { key: g.id, label: g.name, stock, qty };
  }).filter((x) => x.stock > 0 && x.qty <= 1).sort((a, b) => b.stock - a.stock).slice(0, 20);
  const allDays = sales.map((r) => r.date).sort();
  const sellThrough = [];
  for (const g of garments) {
    const sold = c.inRange.filter((r) => g.sku && r.sku === g.sku || !!r.name && r.name === g.name).reduce((s, r) => s + r.qty, 0);
    if (sold <= 0) continue;
    const stock = Object.values(g.stock || {}).reduce((s, n) => s + (Number(n) || 0), 0);
    sellThrough.push({ key: g.id, label: g.name, value: ratio(sold, sold + stock) });
  }
  sellThrough.sort((a, b) => b.value - a.value);
  return {
    from,
    to,
    revenue: c.revenue,
    refunds: c.refunds,
    netRevenue: c.netRevenue,
    cost: c.cost,
    costCoverage: ratio(c.coveredRevenue, c.netRevenue),
    grossProfit: c.grossProfit,
    grossMargin: ratio(c.grossProfit, c.coveredRevenue),
    orders: c.orders,
    units: c.units,
    avgOrderValue: c.orders ? round2(c.netRevenue / c.orders) : 0,
    unitsPerOrder: c.orders ? Math.round(c.units / c.orders * 100) / 100 : 0,
    expenses: c.exp,
    netProfit: round2(c.grossProfit - c.exp),
    expenseRate: ratio(c.exp, c.netRevenue),
    byChannel: group(c.inRange, (r) => r.channel, c.netRevenue),
    byCategory: group(c.inRange, (r) => r.category, c.netRevenue),
    topItems: itemRows,
    sellThrough: sellThrough.slice(0, 10),
    prev: p.inRange.length ? { revenue: p.netRevenue, grossProfit: p.grossProfit, orders: p.orders, avgOrderValue: p.orders ? round2(p.netRevenue / p.orders) : 0 } : void 0,
    inventoryValue: inventoryValue == null ? null : round2(inventoryValue),
    turnoverDays: inventoryValue != null && dailyCost > 0 ? Math.round(inventoryValue / dailyCost * 10) / 10 : null,
    items,
    daily,
    slowMovers,
    lastDataDay: allDays[allDays.length - 1] || ""
  };
}
function reportPeriod(kind, now = /* @__PURE__ */ new Date()) {
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (kind === "daily") {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { from: fmt(y), to: fmt(y) };
  }
  if (kind === "weekly") {
    const dow = (today.getDay() + 6) % 7;
    const lastMon = new Date(today);
    lastMon.setDate(today.getDate() - dow - 7);
    const lastSun = new Date(lastMon);
    lastSun.setDate(lastMon.getDate() + 6);
    return { from: fmt(lastMon), to: fmt(lastSun) };
  }
  const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const last = new Date(today.getFullYear(), today.getMonth(), 0);
  return { from: fmt(first), to: fmt(last) };
}
function metricsFacts(m) {
  const pct = (v) => `${(v * 100).toFixed(1)}%`;
  const out = [
    `period: ${m.from} ~ ${m.to}`,
    `netRevenue: ${m.netRevenue}`,
    `revenue: ${m.revenue}`,
    `refunds: ${m.refunds}`,
    `grossProfit: ${m.grossProfit}`,
    `grossMargin: ${pct(m.grossMargin)}`,
    `costCoverage: ${pct(m.costCoverage)}`,
    `orders: ${m.orders}`,
    `units: ${m.units}`,
    `avgOrderValue: ${m.avgOrderValue}`,
    `unitsPerOrder: ${m.unitsPerOrder}`,
    `expenses: ${m.expenses}`,
    `netProfit: ${m.netProfit}`,
    `expenseRate: ${pct(m.expenseRate)}`
  ];
  if (m.prev) out.push(`prev.netRevenue: ${m.prev.revenue}`, `prev.grossProfit: ${m.prev.grossProfit}`, `prev.orders: ${m.prev.orders}`, `prev.avgOrderValue: ${m.prev.avgOrderValue}`);
  if (m.prev?.revenue) out.push(`netRevenueChange: ${pct((m.netRevenue - m.prev.revenue) / m.prev.revenue)}`);
  if (m.inventoryValue != null) out.push(`inventoryValue: ${m.inventoryValue}`);
  if (m.turnoverDays != null) out.push(`inventoryTurnoverDays: ${m.turnoverDays}`);
  m.items.slice(0, 5).forEach((r, i) => out.push(`item${i + 1} ${r.label}: qty ${r.qty}, amount ${r.amount}${r.grossProfit != null ? `, grossProfit ${r.grossProfit}` : ""}`));
  if (m.slowMovers.length) out.push(`slowMovers: ${m.slowMovers.slice(0, 5).map((x) => `${x.label}(stock ${x.stock}, sold ${x.qty})`).join("; ")}`);
  m.byChannel.slice(0, 5).forEach((r) => out.push(`channel ${r.label}: ${r.value} (${pct(r.share || 0)})`));
  m.byCategory.slice(0, 6).forEach((r) => out.push(`category ${r.label}: ${r.value} (${pct(r.share || 0)})`));
  m.topItems.slice(0, 5).forEach((r, i) => out.push(`top${i + 1} ${r.label}: ${r.value}`));
  m.sellThrough.slice(0, 5).forEach((r) => out.push(`sellThrough ${r.label}: ${pct(r.value)}`));
  return out;
}
function unverifiedNumbers(text, m) {
  const allowed = [];
  const pushAll = (v) => {
    if (Number.isFinite(v)) allowed.push(v, v * 100, Math.abs(v));
  };
  for (const f of metricsFacts(m)) for (const n of f.match(/-?\d+(?:\.\d+)?/g) || []) pushAll(Number(n));
  if (m.prev?.revenue) pushAll(m.netRevenue - m.prev.revenue);
  if (m.prev) {
    pushAll(m.grossProfit - m.prev.grossProfit);
    pushAll(m.orders - m.prev.orders);
  }
  const out = [];
  const cleaned = String(text || "").replace(/\d{4}[-/年.]\d{1,2}[-/月.]\d{1,2}日?/g, " ").replace(/\d{1,2}\s*[月]\s*\d{1,2}\s*[日号]?/g, " ").replace(/\d{1,2}:\d{2}/g, " ");
  const re = /(-?\d[\d,]*(?:\.\d+)?)\s*(万|%|％)?/g;
  let mm;
  while (mm = re.exec(cleaned)) {
    const raw = mm[0].trim();
    let v = Number(mm[1].replace(/,/g, ""));
    if (!Number.isFinite(v)) continue;
    if (mm[2] === "\u4E07") v *= 1e4;
    if (!mm[2] && Number.isInteger(v) && Math.abs(v) <= 10) continue;
    const ok = allowed.some((a) => {
      const tol = Math.max(0.051, Math.abs(a) * 5e-3);
      if (Math.abs(a - v) <= tol) return true;
      return mm[2] === "\u4E07" && Math.abs(a - v) <= Math.max(500, Math.abs(a) * 0.01);
    });
    if (!ok && !out.includes(raw)) out.push(raw);
  }
  return out;
}
function evaluateRules(garments, settings, stats, now = /* @__PURE__ */ new Date()) {
  const hits = [];
  const month = now.getMonth() + 1;
  const core2 = settings.coreSizes.map((s) => s.toUpperCase());
  for (const g of garments) {
    const sizes = Object.keys(g.stock || {});
    if (!sizes.length) continue;
    const total = sizes.reduce((s, k) => s + (Number(g.stock[k]) || 0), 0);
    if (total <= 0) {
      hits.push({ garmentId: g.id, rule: "soldout", action: "delist", options: ["delist", "presale"], detail: (0, import_i18n.t)("\u5168\u90E8\u5C3A\u7801\u5E93\u5B58\u4E3A 0") });
      continue;
    }
    const brokenCore = core2.filter((s) => s in g.stock && (Number(g.stock[s]) || 0) <= 0);
    if (brokenCore.length) hits.push({ garmentId: g.id, rule: "broken_size", action: "remind", options: ["remind", "delist_color", "badge_sale"], detail: (0, import_i18n.t)("\u4E3B\u529B\u5C3A\u7801\u7F3A\u8D27\uFF1A{p0}", { p0: brokenCore.join("\u3001") }) });
    const months = settings.seasonMonths[g.season];
    if (g.season && Array.isArray(months) && months.length && !months.includes(month)) {
      hits.push({ garmentId: g.id, rule: "off_season", action: "remind", options: ["remind", "delist", "clearance"], detail: (0, import_i18n.t)("\u300C{p0}\u300D\u6B3E\uFF0C\u5F53\u524D {m} \u6708\u4E0D\u5728\u5728\u552E\u6708\u4EFD", { p0: g.season, m: month }) });
    }
    if (stats?.lagging.includes(g.id)) hits.push({ garmentId: g.id, rule: "lagging", action: "swap_image", options: ["swap_image", "remind"], detail: (0, import_i18n.t)("\u8BD5\u7A7F\u591A\u3001\u6210\u4EA4\u5C11\uFF1A\u5EFA\u8BAE\u6362\u6210\u8BD5\u7A7F\u6700\u591A\u7684\u9020\u578B\u56FE\u505A\u4E3B\u56FE") });
  }
  return hits;
}
function defaultSeasonMonths() {
  return {
    [(0, import_i18n.t)("\u6625")]: [2, 3, 4, 5],
    [(0, import_i18n.t)("\u590F")]: [5, 6, 7, 8, 9],
    [(0, import_i18n.t)("\u79CB")]: [8, 9, 10, 11],
    [(0, import_i18n.t)("\u51AC")]: [11, 12, 1, 2],
    [(0, import_i18n.t)("\u56DB\u5B63")]: []
  };
}
var BANNED_WORDS = bannedWords_default.words;
var BANNED_PATTERNS = bannedWords_default.patterns.map((p) => new RegExp(p, "g"));
function bannedHits(text) {
  const s = String(text || "");
  const out = /* @__PURE__ */ new Set();
  for (const w of BANNED_WORDS) if (s.includes(w)) out.add(w);
  for (const re of BANNED_PATTERNS) for (const m of s.match(re) || []) out.add(m);
  return [...out];
}
function placeholders(text) {
  return [...String(text || "").matchAll(/【待补充[^】]*】/g)].map((m) => m[0]);
}
function strayPrices(text, allowedText, prices) {
  const allowed = /* @__PURE__ */ new Set([...allowedText.match(/\d+(?:\.\d+)?/g) || [], ...prices.map((p) => String(p)), ...prices.map((p) => String(Math.round(p)))]);
  const out = [];
  for (const m of String(text || "").matchAll(/(?:¥|￥)?(\d+(?:\.\d+)?)\s*(元|折|块|%|％)/g)) {
    if (!allowed.has(m[1]) && !out.includes(m[0])) out.push(m[0]);
  }
  for (const m of String(text || "").matchAll(/[¥￥](\d+(?:\.\d+)?)/g)) {
    if (!allowed.has(m[1]) && !out.includes(m[0])) out.push(m[0]);
  }
  return out;
}
function clampTitle(s, max) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max) : t;
}
function dueToday(time, lastRunDay, now = /* @__PURE__ */ new Date()) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(time || ""));
  if (!m) return false;
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (lastRunDay === today) return false;
  return now.getHours() * 60 + now.getMinutes() >= Number(m[1]) * 60 + Number(m[2]);
}
function resetStaleRendering(s, reason, now = /* @__PURE__ */ new Date()) {
  let n = 0;
  const at = now.toISOString();
  for (const v of s.videos) {
    if (v.status !== "rendering") continue;
    v.status = "failed";
    v.error = reason;
    v.updatedAt = at;
    n += 1;
  }
  for (const a of s.avatars) {
    if (a.status !== "rendering") continue;
    a.status = "failed";
    a.error = reason;
    a.updatedAt = at;
    n += 1;
  }
  return n;
}
var VIDEO_HISTORY_MAX = 120;
function appendVideoEvent(history, step, text, ok = true, now = /* @__PURE__ */ new Date()) {
  return [...history || [], { at: now.toISOString(), step, text, ok }].slice(-VIDEO_HISTORY_MAX);
}
function publishRunFromWorkflow(input) {
  const at = new Date(input.at ?? Date.now());
  const r = input.receipt && typeof input.receipt === "object" ? input.receipt : {};
  const receipts = (Array.isArray(r.receipts) ? r.receipts : []).map((x) => ({
    platform: String(x?.platform || ""),
    status: String(x?.status || ""),
    ...x?.url || x?.postUrl || x?.link ? { url: String(x.url || x.postUrl || x.link) } : {},
    ...x?.error || x?.message ? { error: String(x.error || x.message) } : {}
  })).filter((x) => x.platform);
  const outcome = input.kind === "run:completed" ? "completed" : input.kind === "run:cancelled" ? "cancelled" : "failed";
  const pick = (st) => receipts.filter((x) => x.status === st).map((x) => x.platform);
  const published = outcome === "completed" ? pick("published") : [];
  const unconfirmed = outcome === "completed" ? pick("unconfirmed") : [];
  const reported = new Set(receipts.map((x) => x.platform));
  const failed = [...pick("failed"), ...input.platforms.filter((p) => !reported.has(p) || outcome !== "completed")].filter((p, i, a) => a.indexOf(p) === i && !published.includes(p) && !unconfirmed.includes(p));
  return {
    at: Number.isNaN(at.getTime()) ? (/* @__PURE__ */ new Date()).toISOString() : at.toISOString(),
    ...input.runId ? { runId: input.runId } : {},
    outcome,
    published,
    unconfirmed,
    failed,
    receipts,
    ...input.videoFile ? { videoFile: input.videoFile } : {}
  };
}

// ../../../totalclaw-solutions/solutions/workbench-biz-automation/src/main/services/bizAutomation/store.ts
function newId(prefix) {
  return `${prefix}_${(0, import_node_crypto.randomUUID)().replace(/-/g, "").slice(0, 12)}`;
}
function defaultChannels() {
  return [
    { id: "doudian", name: (0, import_i18n2.t)("\u6296\u5E97"), url: "https://fxg.jinritemai.com/", aspect: "1:1", titleMax: 30, enabled: true },
    { id: "weixin_shop", name: (0, import_i18n2.t)("\u5FAE\u4FE1\u5C0F\u5E97"), url: "https://store.weixin.qq.com/", aspect: "1:1", titleMax: 30, enabled: true },
    { id: "youzan", name: (0, import_i18n2.t)("\u6709\u8D5E"), url: "https://www.youzan.com/", aspect: "1:1", titleMax: 50, enabled: false },
    { id: "taobao", name: (0, import_i18n2.t)("\u6DD8\u5B9D / \u5929\u732B"), url: "https://myseller.taobao.com/", aspect: "1:1", titleMax: 30, enabled: false },
    { id: "xhs_shop", name: (0, import_i18n2.t)("\u5C0F\u7EA2\u4E66\u5E97\u94FA"), url: "https://ark.xiaohongshu.com/", aspect: "3:4", titleMax: 20, enabled: false }
  ];
}
function defaultCalendar() {
  return [
    { date: "01-01", name: (0, import_i18n2.t)("\u5143\u65E6"), topic: "holiday" },
    { date: "03-08", name: (0, import_i18n2.t)("\u5987\u5973\u8282"), topic: "holiday" },
    { date: "05-01", name: (0, import_i18n2.t)("\u52B3\u52A8\u8282"), topic: "holiday" },
    { date: "10-01", name: (0, import_i18n2.t)("\u56FD\u5E86\u8282"), topic: "holiday" },
    { date: "11-11", name: (0, import_i18n2.t)("\u53CC\u5341\u4E00"), topic: "holiday" },
    { date: "12-25", name: (0, import_i18n2.t)("\u5723\u8BDE\u8282"), topic: "holiday" }
  ];
}
function defaultSettings() {
  return {
    brandName: "",
    storeAddress: "",
    openingHours: "",
    dataFolders: { sales: "", expense: "", inventory: "" },
    moduleModels: {},
    channels: defaultChannels(),
    seasonMonths: defaultSeasonMonths(),
    coreSizes: ["M", "L"],
    autoDelistLocal: true,
    schedule: {
      dailyReport: { enabled: false, time: "08:30", push: true },
      inventoryPatrol: { enabled: false, time: "09:00" },
      weeklyVideo: { enabled: false, weekday: 1, time: "10:00" },
      monthlyReport: { enabled: false, day: 1, time: "09:30", push: true },
      newArrival: { enabled: false },
      calendar: { enabled: false, leadDays: 3, days: defaultCalendar() },
      folderImport: { enabled: false, time: "08:00" }
    },
    outputDir: ""
  };
}
function normalize(raw) {
  const d = defaultSettings();
  const s = raw?.settings || {};
  const arr = (v) => Array.isArray(v) ? v : [];
  const out = {
    settings: {
      ...d,
      ...s,
      moduleModels: { ...s.moduleModels || {} },
      channels: Array.isArray(s.channels) && s.channels.length ? s.channels : d.channels,
      seasonMonths: s.seasonMonths && typeof s.seasonMonths === "object" ? s.seasonMonths : d.seasonMonths,
      coreSizes: Array.isArray(s.coreSizes) ? s.coreSizes : d.coreSizes,
      schedule: {
        dailyReport: { ...d.schedule.dailyReport, ...s.schedule?.dailyReport || {} },
        inventoryPatrol: { ...d.schedule.inventoryPatrol, ...s.schedule?.inventoryPatrol || {} },
        weeklyVideo: { ...d.schedule.weeklyVideo, ...s.schedule?.weeklyVideo || {} },
        monthlyReport: { ...d.schedule.monthlyReport, ...s.schedule?.monthlyReport || {} },
        newArrival: { ...d.schedule.newArrival, ...s.schedule?.newArrival || {} },
        calendar: { ...d.schedule.calendar, ...s.schedule?.calendar || {}, days: Array.isArray(s.schedule?.calendar?.days) ? s.schedule.calendar.days : d.schedule.calendar.days },
        folderImport: { ...d.schedule.folderImport, ...s.schedule?.folderImport || {} }
      },
      dataFolders: { ...d.dataFolders, ...s.dataFolders || {} }
    },
    videos: arr(raw?.videos).map((v) => ({ ...v, warnings: v.warnings || [], copies: v.copies || {}, scenes: v.scenes || [], history: Array.isArray(v.history) ? v.history : [], publishRuns: Array.isArray(v.publishRuns) ? v.publishRuns : [] })),
    avatars: arr(raw?.avatars).map((a) => ({ ...a, warnings: a.warnings || [], facts: a.facts || [] })),
    listings: arr(raw?.listings).map((l) => ({ ...l, warnings: l.warnings || [], images: l.images || [] })),
    ruleHits: arr(raw?.ruleHits),
    imports: arr(raw?.imports),
    reports: arr(raw?.reports),
    qa: arr(raw?.qa),
    log: arr(raw?.log),
    lastRun: raw?.lastRun && typeof raw.lastRun === "object" ? raw.lastRun : {},
    seen: {
      garments: Array.isArray(raw?.seen?.garments) ? raw.seen.garments : [],
      files: raw?.seen?.files && typeof raw.seen.files === "object" ? raw.seen.files : {}
    }
  };
  resetStaleRendering(out, (0, import_i18n2.t)("\u5E94\u7528\u91CD\u542F\u5BFC\u81F4\u4E0A\u6B21\u6210\u7247\u4E2D\u65AD\uFF0C\u8BF7\u91CD\u65B0\u6210\u7247"));
  return out;
}
function atomicWrite(file, data) {
  (0, import_node_fs.writeFileSync)(`${file}.tmp`, JSON.stringify(data), "utf-8");
  (0, import_node_fs.renameSync)(`${file}.tmp`, file);
}
var BizAutomationStore = class {
  constructor(dirOf = () => (0, import_accountScope.accountPath)("biz-automation")) {
    this.dirOf = dirOf;
  }
  cache = null;
  dataCache = null;
  cacheDir = "";
  root() {
    const d = this.dirOf();
    if (d !== this.cacheDir) {
      this.cache = null;
      this.dataCache = null;
      this.cacheDir = d;
    }
    (0, import_node_fs.mkdirSync)(d, { recursive: true });
    return d;
  }
  dir(sub) {
    const d = (0, import_node_path.join)(this.root(), sub);
    (0, import_node_fs.mkdirSync)(d, { recursive: true });
    return d;
  }
  read() {
    const f = (0, import_node_path.join)(this.root(), "state.json");
    if (!this.cache) {
      let raw = null;
      try {
        raw = (0, import_node_fs.existsSync)(f) ? JSON.parse((0, import_node_fs.readFileSync)(f, "utf-8")) : null;
      } catch {
        raw = null;
      }
      this.cache = normalize(raw);
    }
    return this.cache;
  }
  update(fn) {
    this.read();
    const out = fn(this.cache);
    this.cache.reports = this.cache.reports.slice(0, 60);
    this.cache.qa = this.cache.qa.slice(0, 50);
    this.cache.log = this.cache.log.slice(0, 200);
    atomicWrite((0, import_node_path.join)(this.root(), "state.json"), this.cache);
    return out;
  }
  data() {
    const f = (0, import_node_path.join)(this.root(), "data.json");
    if (!this.dataCache) {
      let raw = null;
      try {
        raw = (0, import_node_fs.existsSync)(f) ? JSON.parse((0, import_node_fs.readFileSync)(f, "utf-8")) : null;
      } catch {
        raw = null;
      }
      this.dataCache = { sales: Array.isArray(raw?.sales) ? raw.sales : [], expenses: Array.isArray(raw?.expenses) ? raw.expenses : [] };
    }
    return this.dataCache;
  }
  updateData(fn) {
    this.data();
    const out = fn(this.dataCache);
    atomicWrite((0, import_node_path.join)(this.root(), "data.json"), this.dataCache);
    return out;
  }
};

// ../../../totalclaw-solutions/solutions/workbench-biz-automation/src/main/services/bizAutomation/prompts.ts
var PLATFORM_STYLE = {
  douyin: "Douyin: punchy hook in the first 2 seconds, title <= 30 chars, 3-5 hashtags",
  kuaishou: "Kuaishou: down-to-earth and friendly, title <= 30 chars, 3-5 hashtags",
  xiaohongshu: 'Xiaohongshu: "\u79CD\u8349" note style with emojis, title <= 20 chars, caption 80-200 chars, 5-8 hashtags',
  wxchannels: "WeChat Channels: warm and credible, title <= 30 chars, 2-4 hashtags"
};
var TYPE_GUIDE = {
  new_arrival: "New arrival showcase: open with the newest item, 1 scene per image, close with store call-to-action.",
  multi_look: "One item, many looks: each scene shows the same item in a different styling/scene.",
  store_tour: "Store tour: invite viewers to visit the store, mention what they can try.",
  promotion: "Promotion: state the offer exactly as given in the brief, create urgency without exaggeration.",
  styling_tips: "Styling tips: give practical outfit advice for an occasion, using the items shown."
};
function garmentFacts(g) {
  return `- ${g.name} | category=${g.category} | color=${g.color} | style=${g.style} | fabric=${g.fabric} | season=${g.season} | price=${g.price || "n/a"} | points=${g.sellingPoints || ""}`;
}
function videoScriptPrompt(p) {
  return [
    "You write short vertical videos (15-30 seconds) for a physical clothing store.",
    `Store/brand: ${p.brand || "(not given)"}`,
    `Video type: ${TYPE_GUIDE[p.type]}`,
    `Brief from the store owner (the ONLY source for offers, discounts, dates): ${p.brief || "(none)"}`,
    "Products:",
    ...p.garments.map(garmentFacts),
    `There are ${p.imageCount} images numbered 0..${p.imageCount - 1} in the order the products are listed (product image first, then its try-on photos).`,
    "Rules: write in Simplified Chinese; never invent prices, discounts, sales numbers or materials; do not use absolute words banned by Chinese advertising law (\u6700\u4F4E/\u7B2C\u4E00/\u9876\u7EA7/100% etc.).",
    "Return ONLY JSON:",
    '{"scenes":[{"image": <index>, "line": "<one sentence voice-over, max 22 Chinese chars>"}] (4-8 scenes),',
    ` "copies": {${p.platforms.map((x) => `"${x}": {"title": "...", "caption": "...", "topics": ["..."]}`).join(", ")}}}`,
    "Platform styles:",
    ...p.platforms.map((x) => `- ${PLATFORM_STYLE[x]}`)
  ].join("\n");
}
function avatarScriptPrompt(p) {
  return [
    "You write a talking-head script for a digital human presenter introducing a company / store.",
    `Topic: ${p.topic}`,
    `Brand: ${p.brand || "(see facts)"}`,
    `Target length: about ${p.seconds} seconds of speech (~${Math.round(p.seconds * 4)} Chinese characters).`,
    "Facts from the company knowledge base (the ONLY allowed source of facts):",
    ...p.facts.length ? p.facts.map((f) => `- ${f.label}: ${f.value}`) : ["(no facts found)"],
    "Rules: write in Simplified Chinese, spoken style, short sentences.",
    "Any fact you need but which is NOT listed above (founding year, address, awards, numbers...) must be written as a placeholder like \u3010\u5F85\u8865\u5145\uFF1A\u6210\u7ACB\u5E74\u4EFD\u3011 \u2014 never invent it.",
    "Do not use absolute words banned by Chinese advertising law (\u6700/\u7B2C\u4E00/\u9876\u7EA7/\u56FD\u5BB6\u7EA7 etc.).",
    "Return ONLY the script text, no JSON, no stage directions."
  ].join("\n");
}
function listingPrompt(p) {
  const sizes = Object.keys(p.garment.stock || {}).join("/");
  return [
    `Write an e-commerce listing for ${p.channel.name}.`,
    `Brand: ${p.brand || "(none)"}`,
    "Product facts (the ONLY allowed source):",
    garmentFacts(p.garment),
    `Sizes: ${sizes || "n/a"}; tags: ${p.garment.tags.join(", ")}`,
    `Rules: Simplified Chinese; title <= ${p.channel.titleMax} characters, keyword-rich but natural; never invent materials, certifications, sales numbers or discounts; no absolute words banned by Chinese advertising law.`,
    'Return ONLY JSON: {"title": "...", "sellingPoints": ["3-5 short points"], "detail": "detail page copy, 150-300 chars, with a size advice line", "keywords": ["5-8 search keywords"]}'
  ].join("\n");
}
function reportCommentaryPrompt(p) {
  return [
    `You are the business analyst of a clothing retail store${p.brand ? ` (${p.brand})` : ""}. Write the ${p.kind} business report commentary.`,
    "Facts (the ONLY numbers you may cite \u2014 copy them exactly, do not compute new numbers except simple differences already given):",
    ...metricsFacts(p.metrics),
    ...p.hints.length ? ["Other notes:", ...p.hints.map((h) => `- ${h}`)] : [],
    "Write in Simplified Chinese, 4-6 short bullet points: overall result, what drove it (channel / category / top items), cost & expense notes, 1-2 concrete actions for tomorrow/next period.",
    "If costCoverage is below 100%, say gross profit only covers sales with cost data.",
    'Return plain text bullets starting with "\u2022 ".'
  ].join("\n");
}
function financeQaPrompt(p) {
  return [
    `Answer a store owner's question about their business data${p.brand ? ` (${p.brand})` : ""}.`,
    "Data (the ONLY numbers you may cite):",
    ...p.blocks.flatMap((b) => [`[${b.title}]`, ...b.facts]),
    `Data sources (imported files): ${p.sources.join("; ") || "n/a"}`,
    "Definitions: netRevenue = settled sales - refunds; grossProfit = revenue - cost of goods (only rows with cost); avgOrderValue = netRevenue / orders; unitsPerOrder = units / orders; sellThrough = sold / (sold + stock); inventoryTurnoverDays = inventory cost / daily cost of goods.",
    `Question: ${p.question}`,
    'Answer in Simplified Chinese, concise. Cite the period for every number, and end with one line "\u6570\u636E\u6765\u6E90\uFF1A..." naming the source file(s) and one line "\u53E3\u5F84\uFF1A..." with the definition used. If the data does not contain the answer, say so plainly and tell them which table to import.'
  ].join("\n");
}
function modelShotPrompt(g) {
  const who = g.audience === "men" ? "a young Asian male model" : g.audience === "kids" ? "a smiling Asian child model" : "a young Asian female model";
  return [
    `Photorealistic e-commerce fashion photo of ${who} wearing exactly the garment in the image${g.category ? ` (${g.category})` : ""}.`,
    "Reproduce the garment faithfully: same color, print, fabric texture, cut and details.",
    "Full body, natural standing pose, clean light studio background, soft light, portrait 3:4, no text, no watermark."
  ].join(" ");
}

// ../../../totalclaw-solutions/solutions/workbench-biz-automation/src/main/services/bizAutomation/videoRender.ts
var import_node_fs2 = require("node:fs");
var import_node_path2 = require("node:path");
var import_i18n3 = require("npm:@totalclaw/i18n");
var import_media = require("host:apps/desktop-shell/src/main/services/charityContent/media.ts");
var import_subtitles = require("host:apps/desktop-shell/src/main/services/charityContent/subtitles.ts");
var import_pipeline = require("host:apps/desktop-shell/src/main/services/charityContent/pipeline.ts");
var PAUSE_SEC = 0.25;
var SILENT_SCENE_SEC = 3;
async function renderShortVideo(pd, input, registry, onStep) {
  const tools = pd.tools;
  if (!tools) throw new Error((0, import_i18n3.t)("\u627E\u4E0D\u5230 ffmpeg\uFF0C\u65E0\u6CD5\u6210\u7247\uFF08\u5F00\u53D1\u5148\u8DD1 pnpm setup:totalclaw-agent\uFF09"));
  const scenes = input.scenes.filter((s) => s.image && (0, import_node_fs2.existsSync)(s.image));
  if (!scenes.length) throw new Error((0, import_i18n3.t)("\u6CA1\u6709\u53EF\u7528\u7684\u955C\u5934\u56FE\u7247"));
  (0, import_node_fs2.rmSync)(input.workDir, { recursive: true, force: true });
  (0, import_node_fs2.mkdirSync)(input.workDir, { recursive: true });
  const durations = [];
  const wavs = [];
  let quality = null;
  if (input.narration) {
    for (const [i, s] of scenes.entries()) {
      if (registry.signal.aborted) throw new Error((0, import_i18n3.t)("\u5DF2\u53D6\u6D88"));
      onStep((0, import_i18n3.t)("\u5408\u6210\u914D\u97F3 {a}/{b}", { a: i + 1, b: scenes.length }));
      const dir = (0, import_node_path2.join)(input.workDir, `tts-${i}`);
      const items = await (0, import_pipeline.synthesizeSpeech)(pd, { zh: s.line || " " }, dir, { quality: "hd", gender: input.voiceGender, registry });
      const item = items.zh;
      if (!item) throw new Error((0, import_i18n3.t)("\u914D\u97F3\u5408\u6210\u5931\u8D25"));
      quality = quality === "standard" ? "standard" : item.quality === "hd" ? "hd" : "standard";
      const wav = (0, import_node_path2.join)(input.workDir, `line-${i}.wav`);
      await (0, import_media.decodeToWav)(tools, item.path, wav, registry);
      const d = await (0, import_media.audioDuration)(tools, wav, registry);
      wavs.push(wav);
      durations.push(Math.max(2.2, d + PAUSE_SEC));
    }
  } else {
    scenes.forEach(() => durations.push(SILENT_SCENE_SEC));
  }
  const total = durations.reduce((a, b) => a + b, 0) + 0.8;
  const clips = [];
  for (const [i, s] of scenes.entries()) {
    onStep((0, import_i18n3.t)("\u751F\u6210\u955C\u5934 {a}/{b}", { a: i + 1, b: scenes.length }));
    const clip = (0, import_node_path2.join)(input.workDir, `clip-${String(i).padStart(2, "0")}.mp4`);
    await (0, import_media.imageClip)(tools, s.image, clip, durations[i] + (i === scenes.length - 1 ? 0.8 : 0), i, registry, { pace: "normal", transition: "fade" });
    clips.push(clip);
  }
  onStep((0, import_i18n3.t)("\u4E32\u8054\u955C\u5934"));
  const joined = (0, import_node_path2.join)(input.workDir, "joined.mp4");
  await (0, import_media.concatClips)(tools, clips, (0, import_node_path2.join)(input.workDir, "clips.txt"), joined, registry);
  const cues = [];
  let t = 0;
  scenes.forEach((s, i) => {
    if (s.line?.trim()) cues.push({ start: t + 0.05, end: t + durations[i] - 0.1, text: (0, import_subtitles.wrapCaption)(s.line.trim(), "zh") });
    t += durations[i];
  });
  let video = joined;
  if (cues.length || input.title) {
    onStep((0, import_i18n3.t)("\u70E7\u5F55\u5B57\u5E55"));
    const fonts = (0, import_media.prepareSubtitleFonts)(input.workDir);
    const assFile = (0, import_node_path2.join)(input.workDir, "sub.ass");
    const { writeFileSync: writeFileSync3 } = await Promise.resolve().then(() => __toESM(require("node:fs")));
    writeFileSync3(assFile, (0, import_subtitles.buildAss)(cues, "zh", { width: import_media.OUT_W, height: import_media.OUT_H, fontName: fonts.nameFor.zh, title: input.title || void 0, durationSec: total }));
    const subbed = (0, import_node_path2.join)(input.workDir, "subbed.mp4");
    await (0, import_media.burnAss)(tools, joined, assFile, fonts.dir, subbed, registry);
    video = subbed;
  }
  onStep((0, import_i18n3.t)("\u6DF7\u97F3"));
  let narration = null;
  if (wavs.length) {
    narration = (0, import_node_path2.join)(input.workDir, "narration.mp3");
    await (0, import_media.concatNarration)(tools, wavs, PAUSE_SEC, narration, registry);
  }
  const bgm = await localBgm(tools, total, input.workDir, registry);
  await (0, import_media.mixAudio)(tools, video, input.outFile, narration, bgm, total, registry);
  return { file: input.outFile, durationSec: Math.round(total * 10) / 10, voiceQuality: quality };
}
async function localBgm(tools, durationSec, workDir, registry) {
  if (!tools.python) return null;
  const fetched = (0, import_node_path2.join)(workDir, "bgm.mp3");
  const f = await (0, import_media.runProc)(tools.python, [(0, import_node_path2.join)(tools.scriptsDir, "fetch_bgm.py"), "--mood", "upbeat", "--duration", String(Math.ceil(durationSec)), "--output", fetched], { env: tools.env, timeoutMs: 12e4, registry });
  if (f.code === 0 && (0, import_node_fs2.existsSync)(fetched)) return fetched;
  const generated = (0, import_node_path2.join)(workDir, "bgm.wav");
  const g = await (0, import_media.runProc)(tools.python, [(0, import_node_path2.join)(tools.scriptsDir, "generate_bgm.py"), "--style", "upbeat", "--duration", String(Math.ceil(durationSec)), "--output", generated], { env: tools.env, timeoutMs: 12e4, registry });
  return g.code === 0 && (0, import_node_fs2.existsSync)(generated) ? generated : null;
}

// ../../../totalclaw-solutions/solutions/workbench-biz-automation/src/main/ipc/bizAutomation.ipc.ts
var import_excel = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");
var import_excel2 = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");
var import_media2 = require("host:apps/desktop-shell/src/main/services/charityContent/media.ts");
var import_subtitles2 = require("host:apps/desktop-shell/src/main/services/charityContent/subtitles.ts");
var import_render = require("host:apps/desktop-shell/src/main/services/charityContent/render.ts");
var import_ffmpegPath = require("host:apps/desktop-shell/src/main/services/ffmpegPath.ts");
var import_agentPython = require("host:apps/desktop-shell/src/main/services/agentPython.ts");
var import_mediaModelConfig = require("host:apps/desktop-shell/src/main/services/mediaModelConfig.ts");
var import_runtimeLocation = require("host:apps/desktop-shell/src/main/services/runtimeLocation.ts");
var import_mediaFal = require("host:apps/desktop-shell/src/main/ipc/mediaFal.ipc.ts");
var import_ttsRouter = require("host:apps/desktop-shell/src/main/services/media/ttsRouter.ts");
var import_digitalHumanProc = require("host:apps/desktop-shell/src/main/services/digitalHumanProc.ts");
var import_service = require("host:apps/desktop-shell/src/main/services/knowledgeBase/service.ts");
var import_retrieval = require("host:apps/desktop-shell/src/main/services/knowledgeBase/retrieval.ts");
var import_fieldCatalog = require("host:apps/desktop-shell/src/main/services/knowledgeBase/fieldCatalog.ts");
var import_apparelStore = require("host:apps/desktop-shell/src/main/ipc/apparelStore.ipc.ts");
var import_logic4 = require("host:apps/desktop-shell/src/main/services/apparelStore/logic.ts");
var import_brandPaths = require("host:apps/desktop-shell/src/main/services/brandPaths.ts");
var BIZ_SOLUTION_ID = "workbench-biz-automation";
var store = new BizAutomationStore();
var VIDEO_TYPE_LABEL = () => ({
  new_arrival: (0, import_i18n4.t)("\u65B0\u54C1\u4E0A\u65B0"),
  multi_look: (0, import_i18n4.t)("\u4E00\u8863\u591A\u642D"),
  store_tour: (0, import_i18n4.t)("\u95E8\u5E97\u63A2\u5E97"),
  promotion: (0, import_i18n4.t)("\u4FC3\u9500\u6D3B\u52A8"),
  styling_tips: (0, import_i18n4.t)("\u7A7F\u642D\u6559\u7A0B")
});
var AVATAR_TOPIC_LABEL = () => ({
  company_intro: (0, import_i18n4.t)("\u4F01\u4E1A\u4ECB\u7ECD"),
  brand_story: (0, import_i18n4.t)("\u54C1\u724C\u6545\u4E8B"),
  store_opening: (0, import_i18n4.t)("\u65B0\u5E97\u5F00\u4E1A"),
  service_intro: (0, import_i18n4.t)("\u95E8\u5E97\u670D\u52A1\u4ECB\u7ECD"),
  recruiting: (0, import_i18n4.t)("\u62DB\u8058"),
  holiday: (0, import_i18n4.t)("\u8282\u65E5\u795D\u798F")
});
var PLATFORM_PARAM = { douyin: "douyin", kuaishou: "kuaishou", xiaohongshu: "xiaohongshu", wxchannels: "wxchannels" };
var PLATFORM_LABEL = () => ({ douyin: (0, import_i18n4.t)("\u6296\u97F3"), kuaishou: (0, import_i18n4.t)("\u5FEB\u624B"), xiaohongshu: (0, import_i18n4.t)("\u5C0F\u7EA2\u4E66"), wxchannels: (0, import_i18n4.t)("\u89C6\u9891\u53F7") });
var platformNames = (ids) => ids.map((x) => PLATFORM_LABEL()[x] || x).join((0, import_i18n4.t)("\u3001"));
function requireFound(v, what) {
  if (v == null) throw new Error((0, import_i18n4.t)("{p0}\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664", { p0: what }));
  return v;
}
function registerBizAutomationHandlers(deps) {
  const logger = deps.logger;
  const win = () => deps.getMainWindow?.() ?? null;
  const broadcast = (type, payload) => {
    try {
      win()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BA_EVENT, { type, payload });
    } catch {
    }
  };
  const pushState = () => broadcast("state");
  const progress = (key, message) => broadcast("progress", { key, message });
  const log = (module2, text, ok = true) => {
    store.update((s) => {
      s.log.unshift({ at: (/* @__PURE__ */ new Date()).toISOString(), module: module2, text, ok });
    });
  };
  const { modelOptions, llm, llmJson } = (0, import_workbenchLlm.createWorkbenchLlm)(deps, {
    logTag: "biz-automation",
    moduleModel: (m) => store.read().settings.moduleModels[m] || ""
  });
  const outputDir = (sub, create = true) => {
    const s = store.read().settings;
    const root = s.outputDir && (0, import_node_fs3.existsSync)(s.outputDir) ? s.outputDir : (0, import_node_path3.join)(import_electron.app.getPath("documents"), (0, import_brandPaths.documentsFolderName)(), (0, import_i18n4.t)("\u7ECF\u8425\u81EA\u52A8\u5316"));
    const dir = sub ? (0, import_node_path3.join)(root, sub) : root;
    if (create) (0, import_node_fs3.mkdirSync)(dir, { recursive: true });
    return dir;
  };
  const agentHome = () => deps.appConfig?.engines?.["totalclaw-agent"]?.totalclawHome || deps.totalclawAgentHome;
  const tools = () => {
    const res = (0, import_runtimeLocation.shellResourcesPath)();
    const pair = (0, import_ffmpegPath.resolveFfmpegPair)(res);
    if (!pair.ffmpeg || !pair.ffprobe) return null;
    let agentEnv = {};
    try {
      const home = agentHome();
      if (home) agentEnv = (0, import_mediaModelConfig.readAgentEnv)(home);
    } catch {
      agentEnv = {};
    }
    return {
      ffmpeg: pair.ffmpeg,
      ffprobe: pair.ffprobe,
      python: (0, import_agentPython.resolveAgentPython)(res),
      scriptsDir: (0, import_node_path3.join)(res, "bundled-skills", "marketing-sales", "totalclaw-video-studio", "scripts"),
      env: { ...process.env, ...agentEnv, ...(0, import_ffmpegPath.ffmpegSpawnEnv)(res), PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1", PYTHONIOENCODING: "utf-8" }
    };
  };
  const imageReady = () => {
    try {
      return (0, import_mediaFal.falKeysReady)(deps, BIZ_SOLUTION_ID);
    } catch {
      return false;
    }
  };
  const pipelineDeps = (key) => {
    const hasFal = imageReady();
    const unsupported = async () => {
      throw new Error("unsupported");
    };
    return {
      resourcesDir: (0, import_runtimeLocation.shellResourcesPath)(),
      tools: tools(),
      agentHome: agentHome(),
      fal: hasFal ? {
        run: (req, signal, onProgress) => (0, import_mediaFal.runFalJob)(deps, { ...req, solutionId: BIZ_SOLUTION_ID }, { signal, onProgress }),
        tts: (0, import_ttsRouter.bindTtsRouterToSolution)((0, import_ttsRouter.getTtsRouter)(), BIZ_SOLUTION_ID),
        upload: (path, signal) => (0, import_mediaFal.uploadFalFile)(deps, path, { solutionId: BIZ_SOLUTION_ID, signal })
      } : { run: null, tts: null, upload: null },
      vision: unsupported,
      text: unsupported,
      renderPdf: unsupported,
      renderImage: unsupported,
      imageDataUrl: () => "",
      progress: (_stage, msg) => progress(key, msg),
      log: { info: (m, ctx) => logger?.info?.("biz-automation", m, ctx), warn: (m, ctx) => logger?.warn?.("biz-automation", m, ctx) }
    };
  };
  const runs = /* @__PURE__ */ new Map();
  const registryFor = (id) => {
    const controller = new AbortController();
    const children = /* @__PURE__ */ new Set();
    runs.set(id, { controller, children });
    return { signal: controller.signal, add: (c) => children.add(c), remove: (c) => children.delete(c) };
  };
  const garments = () => (0, import_apparelStore.apparelService)()?.store.read().garments || [];
  const garment = (id) => garments().find((g) => g.id === id);
  const tryonImages = (garmentId, max = 3) => {
    const s = (0, import_apparelStore.apparelService)()?.store.read();
    if (!s) return [];
    return s.tryons.filter((t) => t.garmentId === garmentId && t.status === "done" && t.image && (0, import_node_fs3.existsSync)(t.image)).map((t) => t.image).slice(0, max);
  };
  const knowledgeFacts = () => {
    try {
      const ks = (0, import_service.knowledgeStore)();
      return (0, import_retrieval.rankFacts)(ks.facts(ks.currentGraphId())).slice(0, 40).map((f) => ({ label: (0, import_fieldCatalog.fieldLabel)(f.field), value: String(f.value) }));
    } catch {
      return [];
    }
  };
  const sendMail = async (input) => {
    const { sendCaseMail } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/caseMailSender.ts"), 1));
    const relay = deps.serviceAuth ? { send: (i) => deps.serviceAuth.relaySendMail(i) } : null;
    return sendCaseMail(deps.readEmailCredentials?.() ?? {}, input, relay);
  };
  const pushReady = () => {
    const st = deps.cronNotifyStore?.get();
    return !!st && Object.values(st.outlets || {}).some(Boolean);
  };
  const pushOutlets = async (title, body) => {
    const settings = deps.cronNotifyStore?.get();
    if (!settings || !Object.values(settings.outlets || {}).some(Boolean)) throw new Error((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u914D\u7F6E\u63A8\u9001\u6E20\u9053\uFF1A\u8BF7\u5230\u300C\u8BBE\u7F6E \u2192 \u901A\u77E5\u4E0E\u63A8\u9001\u300D\u586B\u5199\u4F01\u4E1A\u5FAE\u4FE1 / \u9489\u9489\u673A\u5668\u4EBA\u6216\u90AE\u7BB1"));
    const { notifyCronResult } = await Promise.resolve().then(() => __toESM(require("host:apps/desktop-shell/src/main/services/cronResultNotifier.ts"), 1));
    const jobId = "biz-automation";
    const outcomes = await notifyCronResult(
      { outlets: settings.outlets, enabledJobs: { [jobId]: true } },
      jobId,
      { jobName: title, ok: true, firedAt: Date.now(), summary: body },
      { sendMail: async ({ to, subject, body: b }) => sendMail({ to, subject, body: b }) }
    );
    return outcomes.map((o) => ({ channel: String(o.outlet), ok: !!o.ok, error: o.error ? String(o.error) : void 0 }));
  };
  const publicState = () => {
    const s = store.read();
    const d = store.data();
    let knowledge = false;
    try {
      const ks = (0, import_service.knowledgeStore)();
      knowledge = ks.facts(ks.currentGraphId()).length > 0;
    } catch {
      knowledge = false;
    }
    return {
      settings: s.settings,
      videos: s.videos,
      avatars: s.avatars,
      listings: s.listings,
      ruleHits: s.ruleHits,
      imports: s.imports,
      salesRows: d.sales.length,
      expenseRows: d.expenses.length,
      reports: s.reports,
      qa: s.qa,
      log: s.log,
      ready: { ffmpeg: !!tools(), image: imageReady(), digitalHuman: !!deps.digitalHumanProc, knowledge, push: pushReady() },
      outputDir: outputDir(void 0, false)
    };
  };
  const videoById = (id) => requireFound(store.read().videos.find((v) => v.id === id), (0, import_i18n4.t)("\u89C6\u9891\u9879\u76EE"));
  const patchVideo = (id, patch) => {
    const r = store.update((s) => {
      const v = requireFound(s.videos.find((x) => x.id === id), (0, import_i18n4.t)("\u89C6\u9891\u9879\u76EE"));
      Object.assign(v, patch, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      return v;
    });
    pushState();
    return r;
  };
  const track = (id, step, text, ok = true) => {
    let name = "";
    store.update((s) => {
      const v = s.videos.find((x) => x.id === id);
      if (!v) return;
      name = v.name;
      v.history = appendVideoEvent(v.history, step, text, ok);
    });
    if (name) log("video", `${name}\uFF1A${text}`, ok);
    pushState();
  };
  const videoWarnings = (v) => {
    const text = [...v.scenes.map((s) => s.line), ...Object.values(v.copies).flatMap((c) => [c?.title, c?.caption])].join("\n");
    const w = [];
    const banned = bannedHits(text);
    if (banned.length) w.push((0, import_i18n4.t)("\u542B\u5E7F\u544A\u6CD5\u6781\u9650\u8BCD\uFF1A{p0}", { p0: banned.join((0, import_i18n4.t)("\u3001")) }));
    const prices = v.garmentIds.map((id) => garment(id)?.price || 0).filter(Boolean);
    const stray = strayPrices(text, v.brief, prices);
    if (stray.length) w.push((0, import_i18n4.t)("\u51FA\u73B0\u6D3B\u52A8\u4FE1\u606F\u91CC\u6CA1\u6709\u7684\u4EF7\u683C / \u6298\u6263\uFF1A{p0}", { p0: stray.join((0, import_i18n4.t)("\u3001")) }));
    return w;
  };
  const createVideo = (p) => {
    const ids = (p.garmentIds || []).filter((id) => garment(id));
    if (!ids.length) throw new Error((0, import_i18n4.t)("\u8BF7\u5148\u9009\u62E9\u5546\u54C1\uFF08\u5546\u54C1\u5E93\u5728\u300C\u670D\u88C5\u5B9E\u4F53\u5E97\u667A\u80FD\u4F53\u300D\u91CC\u7EF4\u62A4\uFF09"));
    const materials = [];
    for (const id of ids) {
      const g = garment(id);
      if (g.image && (0, import_node_fs3.existsSync)(g.image)) materials.push(g.image);
      materials.push(...tryonImages(id, p.type === "multi_look" ? 5 : 2));
    }
    if (!materials.length) throw new Error((0, import_i18n4.t)("\u9009\u4E2D\u7684\u5546\u54C1\u6CA1\u6709\u56FE\u7247"));
    const v = {
      id: newId("bav"),
      type: p.type,
      name: p.name || `${VIDEO_TYPE_LABEL()[p.type]} \xB7 ${garment(ids[0]).name}${ids.length > 1 ? (0, import_i18n4.t)(" \u7B49 {n} \u6B3E", { n: ids.length }) : ""}`,
      garmentIds: ids,
      brief: String(p.brief || ""),
      materials,
      scenes: [],
      copies: {},
      platforms: (p.platforms?.length ? p.platforms : ["douyin", "xiaohongshu"]).filter((x) => import_ipc_contracts.BA_PUBLISH_PLATFORMS.includes(x)),
      narration: p.narration !== false,
      voiceGender: p.voiceGender === "male" ? "male" : "female",
      status: "draft",
      warnings: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    v.history = appendVideoEvent([], "create", (0, import_i18n4.t)("\u521B\u5EFA\u9879\u76EE\uFF1A{p0} \xB7 {n} \u6B3E\u5546\u54C1 \xB7 {m} \u5F20\u7D20\u6750 \xB7 \u53D1\u5E03\u5230 {p1}", { p0: VIDEO_TYPE_LABEL()[v.type], n: ids.length, m: materials.length, p1: platformNames(v.platforms) }));
    store.update((s) => {
      s.videos.unshift(v);
    });
    pushState();
    return v;
  };
  const scriptVideo = async (id) => {
    const v = videoById(id);
    progress("video", (0, import_i18n4.t)("\u6B63\u5728\u5199\u5206\u955C\u811A\u672C\u4E0E\u5404\u5E73\u53F0\u6587\u6848\u2026"));
    const gs = v.garmentIds.map(garment).filter(Boolean);
    const { json, model } = await llmJson("video", videoScriptPrompt({ type: v.type, brand: store.read().settings.brandName, brief: v.brief, garments: gs, imageCount: v.materials.length, platforms: v.platforms }));
    const scenes = (Array.isArray(json.scenes) ? json.scenes : []).slice(0, 8).map((s, i) => {
      const idx = Number.isInteger(Number(s?.image)) ? Math.min(Math.max(Number(s.image), 0), v.materials.length - 1) : i % v.materials.length;
      return { image: v.materials[idx], line: String(s?.line || "").slice(0, 40) };
    }).filter((s) => s.line);
    if (!scenes.length) throw new Error((0, import_i18n4.t)("\u6A21\u578B\u6CA1\u6709\u5199\u51FA\u5206\u955C\uFF0C\u8BF7\u91CD\u8BD5\u6216\u6362\u4E00\u4E2A\u6A21\u578B"));
    const copies = {};
    for (const p of v.platforms) {
      const c = json.copies?.[p];
      if (!c) continue;
      copies[p] = { title: clampTitle(String(c.title || ""), p === "xiaohongshu" ? 20 : 30), caption: String(c.caption || "").slice(0, 1e3), topics: (Array.isArray(c.topics) ? c.topics : []).map((x) => String(x).replace(/^#/, "")).filter(Boolean).slice(0, 8) };
    }
    const next = { ...v, scenes, copies };
    const warnings = videoWarnings(next);
    const r = patchVideo(id, { scenes, copies, model, status: "scripted", error: void 0, video: void 0, warnings });
    track(id, "script", (0, import_i18n4.t)("\u5199\u597D\u5206\u955C\u811A\u672C {n} \u4E2A\u955C\u5934\u3001{m} \u4E2A\u5E73\u53F0\u6587\u6848", { n: scenes.length, m: Object.keys(copies).length }) + (warnings.length ? (0, import_i18n4.t)("\uFF08{k} \u6761\u63D0\u793A\u5F85\u5904\u7406\uFF09", { k: warnings.length }) : ""));
    return videoById(id) ?? r;
  };
  const renderVideo = async (id) => {
    const v = videoById(id);
    if (!v.scenes.length) throw new Error((0, import_i18n4.t)("\u5148\u5199\u5206\u955C\u811A\u672C"));
    patchVideo(id, { status: "rendering", error: void 0 });
    const registry = registryFor(id);
    try {
      const out = (0, import_node_path3.join)(outputDir((0, import_i18n4.t)("\u77ED\u89C6\u9891")), `${v.name.replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 40)}-${Date.now()}.mp4`);
      const r = await renderShortVideo(pipelineDeps("video"), {
        scenes: v.scenes,
        narration: v.narration,
        voiceGender: v.voiceGender,
        title: store.read().settings.brandName,
        workDir: (0, import_node_path3.join)(store.dir("work"), id),
        outFile: out
      }, registry, (msg) => progress("video", msg));
      patchVideo(id, { status: "rendered", video: r.file, durationSec: r.durationSec, voiceQuality: r.voiceQuality || void 0 });
      track(id, "render", (0, import_i18n4.t)("\u6210\u7247\u5B8C\u6210\uFF1A{s} \u79D2 \xB7 {f}", { s: r.durationSec, f: (0, import_node_path3.basename)(r.file) }));
      return videoById(id);
    } catch (e) {
      const msg = registry.signal.aborted ? (0, import_i18n4.t)("\u5DF2\u53D6\u6D88") : (0, import_userFacingError.userFacingError)(e);
      patchVideo(id, { status: "failed", error: msg });
      track(id, "render", (0, import_i18n4.t)("\u6210\u7247\u5931\u8D25\uFF1A{p0}", { p0: msg }), false);
      throw new Error(msg);
    } finally {
      runs.delete(id);
    }
  };
  const publishInput = (videoPath, name, platforms, copies) => {
    const first = platforms.map((p) => copies[p]).find(Boolean);
    const topics = {};
    for (const p of platforms) topics[PLATFORM_PARAM[p]] = copies[p]?.topics || [];
    return {
      videoPath,
      projectName: first?.title || name,
      platforms: platforms.map((p) => PLATFORM_PARAM[p]).join(","),
      topics: JSON.stringify(topics),
      caption: first ? `${first.caption}
${(first.topics || []).map((t) => `#${t}`).join(" ")}`.trim() : name
    };
  };
  const avatarById = (id) => requireFound(store.read().avatars.find((a) => a.id === id), (0, import_i18n4.t)("\u6570\u5B57\u4EBA\u9879\u76EE"));
  const patchAvatar = (id, patch) => {
    const r = store.update((s) => {
      const a = requireFound(s.avatars.find((x) => x.id === id), (0, import_i18n4.t)("\u6570\u5B57\u4EBA\u9879\u76EE"));
      Object.assign(a, patch, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      return a;
    });
    pushState();
    return r;
  };
  const avatarWarnings = (script) => {
    const w = [];
    const ph = placeholders(script);
    if (ph.length) w.push((0, import_i18n4.t)("\u8FD8\u6709 {n} \u5904\u3010\u5F85\u8865\u5145\u3011\uFF0C\u8865\u5B8C\u624D\u80FD\u6210\u7247", { n: ph.length }));
    const banned = bannedHits(script);
    if (banned.length) w.push((0, import_i18n4.t)("\u542B\u5E7F\u544A\u6CD5\u6781\u9650\u8BCD\uFF1A{p0}", { p0: banned.join((0, import_i18n4.t)("\u3001")) }));
    return w;
  };
  const downloadTo = async (url, dest) => {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error((0, import_i18n4.t)("\u6210\u7247\u4E0B\u8F7D\u5931\u8D25\uFF08HTTP {p0}\uFF09", { p0: res.status }));
    await (0, import_promises.pipeline)(import_node_stream.Readable.fromWeb(res.body), (0, import_node_fs3.createWriteStream)(dest));
  };
  const labelAvatarVideo = async (src, dest, aspect) => {
    const t = tools();
    if (!t) throw new Error((0, import_i18n4.t)("\u627E\u4E0D\u5230 ffmpeg\uFF0C\u65E0\u6CD5\u7ED9\u6570\u5B57\u4EBA\u6210\u7247\u52A0 AI \u751F\u6210\u6807\u8BC6"));
    const info = await (0, import_media2.probeMedia)(t, src);
    const dur = info?.durationSec || 0;
    const [w, h] = aspect === "9:16" ? [info?.width || import_media2.OUT_W, info?.height || import_media2.OUT_H] : [info?.width || import_media2.OUT_H, info?.height || import_media2.OUT_W];
    const st = store.read().settings;
    const line = [st.storeAddress, st.openingHours].filter(Boolean).join("  ");
    const work = store.dir((0, import_node_path3.join)("work", `avatar-${Date.now()}`));
    const fonts = (0, import_media2.prepareSubtitleFonts)(work);
    const ass = (0, import_node_path3.join)(work, "label.ass");
    (0, import_node_fs3.writeFileSync)(ass, (0, import_subtitles2.buildAss)([], "zh", {
      width: w,
      height: h,
      fontName: fonts.nameFor.zh,
      title: (0, import_i18n4.t)("\u672C\u89C6\u9891\u7531 AI \u751F\u6210"),
      durationSec: dur || 1,
      ...dur > 4 && st.brandName ? { endCard: { start: Math.max(0, dur - 3), end: dur, title: st.brandName, line } } : {}
    }));
    await (0, import_media2.burnAss)(t, src, ass, fonts.dir, dest);
    return dest;
  };
  const fillModelImages = async (videoId) => {
    const v = videoById(videoId);
    if (!imageReady()) throw new Error((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u914D\u7F6E\u56FE\u50CF\u670D\u52A1\uFF1A\u8BF7\u5230\u300C\u8BBE\u7F6E \u2192 \u5A92\u4F53\u6A21\u578B\u300D\u586B\u5199 fal \u5BC6\u94A5\uFF0C\u6216\u8054\u7CFB\u7BA1\u7406\u5458\u4E3A\u672C\u65B9\u6848\u4E0B\u53D1"));
    const dir = store.dir((0, import_node_path3.join)("materials", v.id));
    const added = [];
    const errs = [];
    for (const id of v.garmentIds) {
      const g = garment(id);
      if (!g?.image || !(0, import_node_fs3.existsSync)(g.image) || tryonImages(id, 1).length) continue;
      progress("video", (0, import_i18n4.t)("\u6B63\u5728\u4E3A\u300C{p0}\u300D\u751F\u6210\u6A21\u7279\u56FE\u2026", { p0: g.name }));
      try {
        const r2 = await (0, import_mediaFal.runFalJob)(deps, { capability: "edit", prompt: modelShotPrompt(g), imageUrls: [g.image], num: 1, outDir: dir, solutionId: BIZ_SOLUTION_ID, maxWaitMs: 18e4 });
        const f = r2.files.find(Boolean);
        if (f) added.push(f);
      } catch (e) {
        errs.push(`${g.name}\uFF1A${(0, import_userFacingError.userFacingError)(e)}`);
      }
    }
    if (!added.length && errs.length) {
      track(videoId, "material", (0, import_i18n4.t)("\u8865\u6A21\u7279\u56FE\u5931\u8D25\uFF1A{p0}", { p0: errs[0] }), false);
      throw new Error(errs[0]);
    }
    const r = patchVideo(videoId, { materials: [...v.materials, ...added] });
    if (added.length) track(videoId, "material", (0, import_i18n4.t)("\u8865\u4E86 {n} \u5F20\u6A21\u7279\u56FE", { n: added.length }) + (errs.length ? (0, import_i18n4.t)("\uFF0C{m} \u6B3E\u5931\u8D25", { m: errs.length }) : ""));
    return r;
  };
  const createAvatar = async (p) => {
    const topic = p?.topic && p.topic in AVATAR_TOPIC_LABEL() ? p.topic : "company_intro";
    const facts = knowledgeFacts();
    const seconds = Math.min(Math.max(Math.round(p?.seconds || 45), 20), 120);
    progress("avatar", (0, import_i18n4.t)("\u6B63\u5728\u4ECE\u77E5\u8BC6\u5E93\u53D6\u8D44\u6599\u5199\u8BB2\u7A3F\u2026"));
    const extra = p?.brief ? [{ label: (0, import_i18n4.t)("\u8865\u5145\u8BF4\u660E"), value: String(p.brief).slice(0, 500) }] : [];
    const { text, model } = await llm("avatar", avatarScriptPrompt({ topic: AVATAR_TOPIC_LABEL()[topic], brand: store.read().settings.brandName, facts: [...facts, ...extra], seconds }));
    const script = text.replace(/^```[a-z]*\s*|```$/g, "").trim();
    const a = {
      id: newId("baa"),
      topic,
      name: p?.name || `${AVATAR_TOPIC_LABEL()[topic]} \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
      script,
      facts: [...facts.slice(0, 20), ...extra],
      durationHint: seconds,
      avatarId: "",
      voiceId: "",
      aspectRatio: "9:16",
      likenessConsent: "",
      status: "scripted",
      warnings: avatarWarnings(script),
      model,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.update((s) => {
      s.avatars.unshift(a);
    });
    pushState();
    return a;
  };
  const listingById = (id) => requireFound(store.read().listings.find((l) => l.id === id), (0, import_i18n4.t)("\u4E0A\u67B6\u8349\u7A3F"));
  const patchListing = (id, patch) => {
    const r = store.update((s) => {
      const l = requireFound(s.listings.find((x) => x.id === id), (0, import_i18n4.t)("\u4E0A\u67B6\u8349\u7A3F"));
      Object.assign(l, patch, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      return l;
    });
    pushState();
    return r;
  };
  const mainImage = async (src, aspect, dest) => {
    const t = tools();
    if (!t) {
      (0, import_node_fs3.copyFileSync)(src, dest);
      return dest;
    }
    const [w, h] = aspect === "1:1" ? [1080, 1080] : [1080, 1440];
    const r = await (0, import_media2.runProc)(t.ffmpeg, ["-v", "error", "-y", "-i", src, "-vf", `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:white`, "-q:v", "2", dest], { env: t.env, timeoutMs: 6e4 });
    if (r.code !== 0 || !(0, import_node_fs3.existsSync)(dest)) {
      (0, import_node_fs3.copyFileSync)(src, dest);
    }
    return dest;
  };
  const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sizeChartImage = async (g, aspect, dest) => {
    const rows = (0, import_logic4.sizeChartRows)(g.audience, Object.keys(g.stock || {}));
    if (!rows.length) return null;
    const [w, h] = aspect === "1:1" ? [1080, 1080] : [1080, 1440];
    const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;background:#fff;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif">
<div style="width:86%"><h1 style="font-size:54px;margin:0 0 12px;color:#222">${esc((0, import_i18n4.t)("\u5C3A\u7801\u53C2\u8003"))}</h1><p style="font-size:30px;color:#777;margin:0 0 30px">${esc(g.name)}</p>
<table style="width:100%;border-collapse:collapse;font-size:36px;text-align:center"><tr style="background:#222;color:#fff"><th style="padding:18px">${esc((0, import_i18n4.t)("\u5C3A\u7801"))}</th><th>${esc((0, import_i18n4.t)("\u8EAB\u9AD8"))}</th><th>${esc((0, import_i18n4.t)("\u4F53\u91CD"))}</th></tr>
${rows.map((r, i) => `<tr style="background:${i % 2 ? "#f4f4f4" : "#fff"}"><td style="padding:18px;font-weight:700">${esc(r.size)}</td><td>${esc(r.height)}</td><td>${esc(r.weight)}</td></tr>`).join("")}</table>
<p style="font-size:26px;color:#999;margin-top:26px">${esc((0, import_i18n4.t)("\u4EC5\u4F9B\u53C2\u8003\uFF0C\u4ECB\u4E8E\u4E24\u4E2A\u5C3A\u7801\u4E4B\u95F4\u5EFA\u8BAE\u9009\u5927\u4E00\u7801"))}</p></div></body>`;
    try {
      await (0, import_render.renderHtmlToImage)(html, dest, w, h);
      return (0, import_node_fs3.existsSync)(dest) ? dest : null;
    } catch {
      return null;
    }
  };
  const detailImage = async (src, aspect, dest) => {
    const t = tools();
    if (!t) return null;
    const [w, h] = aspect === "1:1" ? [1080, 1080] : [1080, 1440];
    const r = await (0, import_media2.runProc)(t.ffmpeg, ["-v", "error", "-y", "-i", src, "-vf", `crop=iw*0.5:ih*0.5:iw*0.25:ih*0.3,scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`, "-q:v", "2", dest], { env: t.env, timeoutMs: 6e4 });
    return r.code === 0 && (0, import_node_fs3.existsSync)(dest) ? dest : null;
  };
  const badgeImage = async (src, text, dest) => {
    const data = (0, import_render.imageToDataUrl)(src, 1080);
    if (!data) return null;
    const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;width:1080px;height:1080px;background:#fff url('${data}') center/contain no-repeat;position:relative;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif">
<div style="position:absolute;top:40px;left:-10px;background:#d6332a;color:#fff;font-size:64px;font-weight:800;padding:16px 50px;border-radius:0 40px 40px 0;box-shadow:0 6px 18px rgba(0,0,0,.25)">${esc(text)}</div></body>`;
    try {
      await (0, import_render.renderHtmlToImage)(html, dest, 1080, 1080);
      return (0, import_node_fs3.existsSync)(dest) ? dest : null;
    } catch {
      return null;
    }
  };
  const mostTriedImage = (garmentId) => {
    const s = (0, import_apparelStore.apparelService)()?.store.read();
    if (!s) return null;
    const done = s.tryons.filter((t) => t.garmentId === garmentId && t.status === "done" && t.image && (0, import_node_fs3.existsSync)(t.image));
    if (!done.length) return null;
    const count = /* @__PURE__ */ new Map();
    for (const t of done) {
      const k = `${t.choice.backgroundId}|${t.choice.poseId}|${t.choice.hairId}`;
      count.set(k, (count.get(k) || 0) + 1);
    }
    const top = [...count].sort((a, b) => b[1] - a[1])[0][0];
    return done.filter((t) => `${t.choice.backgroundId}|${t.choice.poseId}|${t.choice.hairId}` === top).pop().image;
  };
  const RULE_ACTION_LABEL = () => ({
    delist: (0, import_i18n4.t)("\u4E0B\u67B6"),
    presale: (0, import_i18n4.t)("\u6539\u4E3A\u9884\u552E"),
    delist_color: (0, import_i18n4.t)("\u4E0B\u67B6\u8BE5\u989C\u8272"),
    badge_sale: (0, import_i18n4.t)("\u4E3B\u56FE\u52A0\u300C\u65AD\u7801\u7279\u4EF7\u300D"),
    clearance: (0, import_i18n4.t)("\u8F6C\u5165\u6E05\u4ED3\u4E13\u533A"),
    swap_image: (0, import_i18n4.t)("\u6362\u4E3B\u56FE\uFF08\u8BD5\u7A7F\u6700\u591A\u7684\u9020\u578B\u56FE\uFF09"),
    remind: (0, import_i18n4.t)("\u63D0\u9192\u5E97\u957F")
  });
  const handleRule = async (garmentId, action) => {
    const g = requireFound(garment(garmentId), (0, import_i18n4.t)("\u5546\u54C1"));
    const s = store.read();
    const done = [];
    const svc = (0, import_apparelStore.apparelService)();
    if ((action === "delist" || action === "clearance") && svc && g.onShelf) {
      svc.saveGarment({ id: g.id, onShelf: false });
      done.push((0, import_i18n4.t)("\u95E8\u5E97\u8BD5\u7A7F\u624B\u673A\u7AEF\u5DF2\u4E0B\u67B6"));
    }
    if (action === "remind") {
      const body = (0, import_i18n4.t)("\u300C{p0}\u300D\u9700\u8981\u5904\u7406\uFF1A{p1}", { p0: g.name, p1: s.ruleHits.filter((h) => h.garmentId === g.id).map((h) => h.detail).join("\uFF1B") });
      try {
        new import_electron.Notification({ title: (0, import_i18n4.t)("\u7ECF\u8425\u81EA\u52A8\u5316 \xB7 \u5E93\u5B58\u63D0\u9192"), body }).show();
      } catch {
      }
      if (pushReady()) await pushOutlets((0, import_i18n4.t)("\u5E93\u5B58\u63D0\u9192"), body).catch(() => []);
      done.push((0, import_i18n4.t)("\u5DF2\u63D0\u9192"));
      log("listing", body);
      return { done, listingIds: [] };
    }
    const listed = s.listings.filter((l) => l.garmentId === g.id && (l.status === "listed" || l.status === "handed"));
    if (!listed.length) {
      if (!done.length) done.push((0, import_i18n4.t)("\u8FD9\u6B3E\u5728\u7F51\u5E97\u8FD8\u6CA1\u6709\u4E0A\u67B6\u8BB0\u5F55\uFF0C\u53EA\u9700\u5904\u7406\u95E8\u5E97"));
      return { done, listingIds: [] };
    }
    let img = null;
    if (action === "badge_sale" && g.image) img = await badgeImage(g.image, (0, import_i18n4.t)("\u65AD\u7801\u7279\u4EF7"), (0, import_node_path3.join)(store.dir((0, import_node_path3.join)("listing", g.id)), `badge-${Date.now()}.jpg`));
    if (action === "swap_image") img = mostTriedImage(g.id);
    const what = RULE_ACTION_LABEL()[action];
    const lines = listed.map((l) => {
      const ch = s.settings.channels.find((c) => c.id === l.channelId);
      return `- ${ch?.name}\uFF08${ch?.url}\uFF09\uFF1A${l.productUrl || l.title}${ch?.autoSubmit ? (0, import_i18n4.t)("\uFF08\u8BE5\u5E97\u94FA\u5DF2\u6388\u6743\u5168\u81EA\u52A8\uFF0C\u53EF\u76F4\u63A5\u63D0\u4EA4\uFF09") : ""}`;
    });
    const text = [
      (0, import_i18n4.t)("\u8BF7\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u91CC\u5BF9\u4E0B\u9762\u8FD9\u6B3E\u5546\u54C1\u6267\u884C\u300C{p0}\u300D\u3002\u53EA\u505A\u8FD9\u4E00\u9879\u4FEE\u6539\uFF0C\u4E0D\u8981\u5220\u9664\u5546\u54C1\u3001\u4E0D\u8981\u6539\u4EF7\uFF1B\u672A\u6388\u6743\u5168\u81EA\u52A8\u7684\u5E97\u94FA\uFF0C\u64CD\u4F5C\u505C\u5728\u4FDD\u5B58 / \u63D0\u4EA4\u524D\u622A\u56FE\u7ED9\u6211\u786E\u8BA4\u3002", { p0: what }),
      (0, import_i18n4.t)("\u5546\u54C1\uFF1A{p0}\uFF08\u8D27\u53F7 {p1}\uFF09", { p0: g.name, p1: g.sku || "\u2014" }),
      ...action === "delist_color" ? [(0, import_i18n4.t)("\u8981\u4E0B\u67B6\u7684\u989C\u8272\uFF1A{p0}", { p0: g.color || (0, import_i18n4.t)("\u5F53\u524D\u989C\u8272") })] : [],
      ...img ? [(0, import_i18n4.t)("\u65B0\u4E3B\u56FE\uFF1A{p0}", { p0: img })] : [],
      ...lines
    ].join("\n");
    return { done, text, listingIds: listed.map((l) => l.id) };
  };
  const listingWarnings = (l) => {
    const banned = bannedHits([l.title, ...l.sellingPoints, l.detail].join("\n"));
    return banned.length ? [(0, import_i18n4.t)("\u542B\u5E7F\u544A\u6CD5\u6781\u9650\u8BCD\uFF1A{p0}", { p0: banned.join((0, import_i18n4.t)("\u3001")) })] : [];
  };
  const evaluate = () => {
    const svc = (0, import_apparelStore.apparelService)();
    const stats = svc ? svc.stats() : null;
    const hits = evaluateRules(garments(), store.read().settings, stats);
    store.update((s) => {
      s.ruleHits = hits;
    });
    let delisted = 0;
    if (store.read().settings.autoDelistLocal && svc) {
      for (const h of hits.filter((x) => x.rule === "soldout")) {
        const g = garment(h.garmentId);
        if (g?.onShelf) {
          svc.saveGarment({ id: g.id, onShelf: false });
          delisted++;
        }
      }
    }
    pushState();
    return { hits, delisted };
  };
  const doImport = (path, kind, source, replace = false) => {
    const table = (0, import_excel.readTable)(path);
    if (!table.rows.length) throw new Error((0, import_i18n4.t)("\u300C{p0}\u300D\u91CC\u6CA1\u6709\u6570\u636E\u884C", { p0: table.fileName }));
    if (kind === "inventory") {
      const parsed2 = parseInventory(table.headers, table.rows);
      if (!parsed2.rows.length) throw new Error((0, import_i18n4.t)("\u6CA1\u6709\u8BC6\u522B\u51FA\u6709\u6548\u7684\u5E93\u5B58\u884C\uFF08\u8D27\u53F7 / \u540D\u79F0\u4E0E\u5E93\u5B58\u90FD\u8981\u6709\uFF09"));
      const svc = (0, import_apparelStore.apparelService)();
      if (!svc) throw new Error((0, import_i18n4.t)("\u670D\u88C5\u5B9E\u4F53\u5E97\u667A\u80FD\u4F53\u672A\u52A0\u8F7D"));
      const { updates, unmatched } = applyInventory(garments(), parsed2.rows);
      for (const u of updates) svc.saveGarment({ id: u.id, stock: u.stock });
      const day = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const imp2 = { id: newId("bai"), kind, source, file: table.fileName, rows: parsed2.rows.length, skipped: parsed2.skipped + unmatched.length, mapping: parsed2.mapping, from: day, to: day, importedAt: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((s) => {
        s.imports.unshift(imp2);
        s.imports = s.imports.slice(0, 50);
      });
      log("finance", (0, import_i18n4.t)("\u540C\u6B65\u5E93\u5B58\uFF1A{p0}\uFF0C\u66F4\u65B0 {n} \u6B3E{p1}", { p0: table.fileName, n: updates.length, p1: unmatched.length ? (0, import_i18n4.t)("\uFF0C{m} \u4E2A\u8D27\u53F7\u5728\u5546\u54C1\u5E93\u91CC\u627E\u4E0D\u5230\uFF1A{p2}", { m: unmatched.length, p2: unmatched.slice(0, 5).join((0, import_i18n4.t)("\u3001")) }) : "" }));
      evaluate();
      pushState();
      return { ...imp2, unmatched };
    }
    const parsed = kind === "expense" ? parseExpenses(table.headers, table.rows) : parseSales(table.headers, table.rows);
    if (!parsed.rows.length) throw new Error((0, import_i18n4.t)("\u6CA1\u6709\u8BC6\u522B\u51FA\u6709\u6548\u6570\u636E\u884C\uFF08\u65E5\u671F\u3001\u91D1\u989D\u90FD\u8981\u6709\uFF09"));
    const dates = parsed.rows.map((r) => r.date).sort();
    const from = dates[0];
    const to = dates[dates.length - 1];
    store.updateData((d) => {
      if (kind === "expense") d.expenses = [...d.expenses.filter((x) => replace ? false : x.date < from || x.date > to), ...parsed.rows];
      else d.sales = [...d.sales.filter((x) => replace ? false : x.date < from || x.date > to), ...parsed.rows];
    });
    const imp = { id: newId("bai"), kind, source, file: table.fileName, rows: parsed.rows.length, skipped: parsed.skipped, mapping: parsed.mapping, from, to, importedAt: (/* @__PURE__ */ new Date()).toISOString() };
    store.update((s) => {
      s.imports.unshift(imp);
      s.imports = s.imports.slice(0, 50);
    });
    log("finance", (0, import_i18n4.t)("\u5BFC\u5165{p0}\uFF1A{p1}\uFF08{a} ~ {b}\uFF0C{n} \u884C\uFF09", { p0: kind === "expense" ? (0, import_i18n4.t)("\u8D39\u7528") : (0, import_i18n4.t)("\u9500\u552E"), p1: table.fileName, a: from, b: to, n: parsed.rows.length }));
    pushState();
    return imp;
  };
  const folderImport = async (force = false) => {
    const folders = store.read().settings.dataFolders;
    const out = [];
    for (const kind of ["sales", "expense", "inventory"]) {
      const dir = folders[kind];
      if (!dir) continue;
      const label = kind === "sales" ? (0, import_i18n4.t)("\u9500\u552E") : kind === "expense" ? (0, import_i18n4.t)("\u8D39\u7528") : (0, import_i18n4.t)("\u5E93\u5B58");
      try {
        if (!(0, import_node_fs3.existsSync)(dir)) throw new Error((0, import_i18n4.t)("\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: dir }));
        const files = (0, import_node_fs3.readdirSync)(dir).filter((f) => /\.(xlsx|xls|csv)$/i.test(f) && !f.startsWith("~$")).map((f) => ({ f: (0, import_node_path3.join)(dir, f), m: (0, import_node_fs3.statSync)((0, import_node_path3.join)(dir, f)).mtime.toISOString() })).sort((a, b) => b.m.localeCompare(a.m));
        if (!files.length) throw new Error((0, import_i18n4.t)("\u6587\u4EF6\u5939\u91CC\u6CA1\u6709 Excel / CSV \u6587\u4EF6"));
        const latest = files[0];
        if (!force && store.read().seen.files[latest.f] === latest.m) {
          out.push({ kind, file: (0, import_node_path3.basename)(latest.f), ok: true, note: (0, import_i18n4.t)("\u6CA1\u6709\u65B0\u6587\u4EF6") });
          continue;
        }
        const imp = doImport(latest.f, kind, "folder");
        store.update((s) => {
          s.seen.files[latest.f] = latest.m;
        });
        out.push({ kind, file: (0, import_node_path3.basename)(latest.f), ok: true, note: (0, import_i18n4.t)("{n} \u884C", { n: imp.rows }) });
      } catch (e) {
        const msg = (0, import_userFacingError.userFacingError)(e);
        out.push({ kind, ok: false, note: msg });
        log("finance", (0, import_i18n4.t)("{p0}\u53D6\u6570\u5931\u8D25\uFF1A{p1}", { p0: label, p1: msg }), false);
        try {
          new import_electron.Notification({ title: (0, import_i18n4.t)("\u7ECF\u8425\u81EA\u52A8\u5316 \xB7 \u53D6\u6570\u5931\u8D25"), body: `${label}\uFF1A${msg}` }).show();
        } catch {
        }
      }
    }
    pushState();
    return out;
  };
  const buildReport = async (kind, from, to) => {
    const d = store.data();
    if (!d.sales.length) throw new Error((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u9500\u552E\u6570\u636E\uFF1A\u5148\u5BFC\u5165\u6536\u94F6\u7CFB\u7EDF\u5BFC\u51FA\u7684\u9500\u552E\u660E\u7EC6"));
    const metrics = computeMetrics(d.sales, d.expenses, garments(), from, to);
    const hints = [];
    if (!metrics.orders) hints.push((0, import_i18n4.t)("\u8FD9\u4E2A\u65F6\u95F4\u6BB5\u6CA1\u6709\u9500\u552E\u8BB0\u5F55"));
    if (metrics.costCoverage < 1) hints.push((0, import_i18n4.t)("\u53EA\u6709\u90E8\u5206\u9500\u552E\u5E26\u6210\u672C\uFF0C\u6BDB\u5229\u6309\u5E26\u6210\u672C\u7684\u90E8\u5206\u8BA1\u7B97"));
    const staleNote = metrics.lastDataDay && metrics.lastDataDay < to ? (0, import_i18n4.t)("\u9500\u552E\u6570\u636E\u53EA\u5230 {p0}\uFF0C{p1} \u4E4B\u540E\u8FD8\u6CA1\u53D6\u5230\u6570\u636E\uFF08\u53D6\u6570\u53EF\u80FD\u6CA1\u66F4\u65B0\uFF09\uFF0C\u8FD9\u90E8\u5206\u4E0D\u8BA1\u5165", { p0: metrics.lastDataDay, p1: metrics.lastDataDay }) : void 0;
    if (staleNote) hints.push(staleNote);
    const lowStock = store.read().ruleHits.filter((h) => h.rule === "soldout" || h.rule === "broken_size").slice(0, 5);
    if (lowStock.length) hints.push((0, import_i18n4.t)("\u5E93\u5B58\u9884\u8B66\uFF1A{p0}", { p0: lowStock.map((h) => `${garment(h.garmentId)?.name || h.garmentId}\uFF08${h.detail}\uFF09`).join("\uFF1B") }));
    let commentary = "";
    let model;
    let unverified = [];
    try {
      progress("finance", (0, import_i18n4.t)("\u6B63\u5728\u5199\u7ECF\u8425\u89E3\u8BFB\u2026"));
      const r = await llm("finance", reportCommentaryPrompt({ kind, brand: store.read().settings.brandName, metrics, hints }));
      commentary = r.text.trim();
      model = r.model;
      unverified = unverifiedNumbers(commentary, metrics);
    } catch (e) {
      commentary = (0, import_i18n4.t)("\uFF08\u7ECF\u8425\u89E3\u8BFB\u672A\u751F\u6210\uFF1A{p0}\uFF09", { p0: (0, import_userFacingError.userFacingError)(e) });
    }
    const report = { id: newId("bar"), kind, metrics, commentary, unverified, model, staleNote, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
    store.update((s) => {
      s.reports.unshift(report);
    });
    pushState();
    return report;
  };
  const reportText = (r) => {
    const m = r.metrics;
    const pct = (v) => `${(v * 100).toFixed(1)}%`;
    const lines = [
      (0, import_i18n4.t)("\u3010{p0}\u3011{a} ~ {b}", { p0: store.read().settings.brandName || (0, import_i18n4.t)("\u7ECF\u8425\u65E5\u62A5"), a: m.from, b: m.to }),
      (0, import_i18n4.t)("\u51C0\u8425\u4E1A\u989D {p0} \u5143\uFF08\u9000\u8D27 {p1}\uFF09\uFF5C\u8BA2\u5355 {p2}\uFF5C\u5BA2\u5355\u4EF7 {p3}\uFF5C\u8FDE\u5E26\u7387 {p4}", { p0: m.netRevenue, p1: m.refunds, p2: m.orders, p3: m.avgOrderValue, p4: m.unitsPerOrder }),
      (0, import_i18n4.t)("\u6BDB\u5229 {p0} \u5143\uFF08\u6BDB\u5229\u7387 {p1}\uFF0C\u6210\u672C\u8986\u76D6 {p2}\uFF09\uFF5C\u8D39\u7528 {p3}\uFF5C\u51C0\u5229\u6DA6 {p4}", { p0: m.grossProfit, p1: pct(m.grossMargin), p2: pct(m.costCoverage), p3: m.expenses, p4: m.netProfit })
    ];
    if (r.staleNote) lines.unshift(`\u26A0 ${r.staleNote}`);
    if (m.items.length) lines.push((0, import_i18n4.t)("\u7545\u9500\u524D 5\uFF1A{p0}", { p0: m.items.slice(0, 5).map((x) => `${x.label} ${x.qty}${(0, import_i18n4.t)("\u4EF6")} / ${x.amount}`).join((0, import_i18n4.t)("\u3001")) }));
    if (m.turnoverDays != null) lines.push((0, import_i18n4.t)("\u5E93\u5B58\u91D1\u989D\u7EA6 {p0} \u5143\uFF0C\u5468\u8F6C\u7EA6 {p1} \u5929", { p0: m.inventoryValue, p1: m.turnoverDays }));
    const warn = store.read().ruleHits.filter((h) => h.rule === "soldout" || h.rule === "broken_size").slice(0, 5);
    if (warn.length) lines.push((0, import_i18n4.t)("\u5E93\u5B58\u9884\u8B66\uFF1A{p0}", { p0: warn.map((h) => `${garment(h.garmentId)?.name || ""}\uFF08${h.detail}\uFF09`).join("\uFF1B") }));
    if (r.commentary) lines.push("", r.commentary);
    if (r.unverified.length) lines.push("", (0, import_i18n4.t)("\u26A0 \u89E3\u8BFB\u4E2D\u8FD9\u4E9B\u6570\u5B57\u672A\u80FD\u5728\u6570\u636E\u4E2D\u6838\u5BF9\u5230\uFF1A{p0}", { p0: r.unverified.join((0, import_i18n4.t)("\u3001")) }));
    return lines.join("\n");
  };
  const reportHtml = (r) => {
    const m = r.metrics;
    const pct = (v) => `${(v * 100).toFixed(1)}%`;
    const max = Math.max(1, ...m.daily.map((d) => d.netRevenue));
    const bw = m.daily.length ? Math.max(4, Math.floor(640 / m.daily.length) - 4) : 10;
    const bars = m.daily.map((d, i) => {
      const h = Math.round(Math.max(0, d.netRevenue) / max * 160);
      return `<rect x="${i * (bw + 4)}" y="${170 - h}" width="${bw}" height="${h}" fill="#2f6fde"/>`;
    }).join("");
    const table = (head, rows) => `<table><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows.map((row) => `<tr>${row.map((c) => `<td>${esc(String(c))}</td>`).join("")}</tr>`).join("")}</table>`;
    return `<!doctype html><meta charset="utf-8"><style>
body{font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;color:#222;padding:28px;font-size:12px}h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;margin:18px 0 6px}
.k{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.k div{border:1px solid #ddd;border-radius:8px;padding:8px}.k b{display:block;font-size:16px}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:4px 6px;text-align:left}th{background:#f3f4f6}.warn{color:#b45309}pre{white-space:pre-wrap;font:inherit}</style>
<h1>${esc(store.read().settings.brandName || (0, import_i18n4.t)("\u7ECF\u8425\u62A5\u8868"))} \xB7 ${esc(m.from)} ~ ${esc(m.to)}</h1>
${r.staleNote ? `<p class="warn">\u26A0 ${esc(r.staleNote)}</p>` : ""}
<div class="k"><div>${esc((0, import_i18n4.t)("\u51C0\u8425\u4E1A\u989D"))}<b>${m.netRevenue}</b></div><div>${esc((0, import_i18n4.t)("\u6BDB\u5229"))}<b>${m.grossProfit}\uFF08${pct(m.grossMargin)}\uFF09</b></div><div>${esc((0, import_i18n4.t)("\u8BA2\u5355 / \u5BA2\u5355\u4EF7"))}<b>${m.orders} / ${m.avgOrderValue}</b></div><div>${esc((0, import_i18n4.t)("\u8FDE\u5E26\u7387"))}<b>${m.unitsPerOrder}</b></div>
<div>${esc((0, import_i18n4.t)("\u8D39\u7528 / \u8D39\u7528\u7387"))}<b>${m.expenses} / ${pct(m.expenseRate)}</b></div><div>${esc((0, import_i18n4.t)("\u51C0\u5229\u6DA6"))}<b>${m.netProfit}</b></div><div>${esc((0, import_i18n4.t)("\u5E93\u5B58\u91D1\u989D"))}<b>${m.inventoryValue ?? "\u2014"}</b></div><div>${esc((0, import_i18n4.t)("\u5E93\u5B58\u5468\u8F6C\u5929\u6570"))}<b>${m.turnoverDays ?? "\u2014"}</b></div></div>
<h2>${esc((0, import_i18n4.t)("\u6BCF\u65E5\u8D8B\u52BF\uFF08\u51C0\u8425\u4E1A\u989D\uFF09"))}</h2><svg width="660" height="180">${bars}</svg>
<h2>${esc((0, import_i18n4.t)("\u6E20\u9053"))}</h2>${table([(0, import_i18n4.t)("\u6E20\u9053"), (0, import_i18n4.t)("\u91D1\u989D"), (0, import_i18n4.t)("\u5360\u6BD4")], m.byChannel.map((x) => [x.label, x.value, pct(x.share || 0)]))}
<h2>${esc((0, import_i18n4.t)("\u54C1\u7C7B"))}</h2>${table([(0, import_i18n4.t)("\u54C1\u7C7B"), (0, import_i18n4.t)("\u91D1\u989D"), (0, import_i18n4.t)("\u5360\u6BD4")], m.byCategory.map((x) => [x.label, x.value, pct(x.share || 0)]))}
<h2>${esc((0, import_i18n4.t)("\u6B3E\u5F0F\u6392\u884C"))}</h2>${table([(0, import_i18n4.t)("\u5546\u54C1"), (0, import_i18n4.t)("\u9500\u91CF"), (0, import_i18n4.t)("\u91D1\u989D"), (0, import_i18n4.t)("\u6BDB\u5229"), (0, import_i18n4.t)("\u552E\u7F44\u7387")], m.items.slice(0, 20).map((x) => [x.label, x.qty, x.amount, x.grossProfit ?? "\u2014", x.sellThrough == null ? "\u2014" : pct(x.sellThrough)]))}
<h2>${esc((0, import_i18n4.t)("\u6EDE\u9500\u6E05\u5355\uFF08\u6709\u5E93\u5B58\u3001\u672C\u671F\u5356\u51FA\u4E0D\u8D85\u8FC7 1 \u4EF6\uFF09"))}</h2>${m.slowMovers.length ? table([(0, import_i18n4.t)("\u5546\u54C1"), (0, import_i18n4.t)("\u5E93\u5B58"), (0, import_i18n4.t)("\u672C\u671F\u9500\u91CF")], m.slowMovers.map((x) => [x.label, x.stock, x.qty])) : `<p>${esc((0, import_i18n4.t)("\u65E0"))}</p>`}
<h2>${esc((0, import_i18n4.t)("\u7ECF\u8425\u89E3\u8BFB"))}</h2><pre>${esc(r.commentary)}</pre>${r.unverified.length ? `<p class="warn">${esc((0, import_i18n4.t)("\u672A\u80FD\u6838\u5BF9\u7684\u6570\u5B57\uFF1A{p0}", { p0: r.unverified.join((0, import_i18n4.t)("\u3001")) }))}</p>` : ""}`;
  };
  let ticking = false;
  const tick = async () => {
    if (ticking) return;
    ticking = true;
    const now = /* @__PURE__ */ new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const mark = (key) => store.update((s) => {
      s.lastRun[key] = today;
    });
    try {
      const sc = store.read().settings.schedule;
      if (sc.folderImport.enabled && dueToday(sc.folderImport.time, store.read().lastRun.folderImport, now)) {
        mark("folderImport");
        const r = await folderImport();
        log("schedule", (0, import_i18n4.t)("\u5171\u4EAB\u6587\u4EF6\u5939\u53D6\u6570\uFF1A{p0}", { p0: r.map((x) => `${x.kind} ${x.ok ? "\u2713" : "\u2717"} ${x.note}`).join("\uFF1B") || (0, import_i18n4.t)("\u6CA1\u6709\u914D\u7F6E\u6587\u4EF6\u5939") }), r.every((x) => x.ok));
      }
      if (sc.dailyReport.enabled && dueToday(sc.dailyReport.time, store.read().lastRun.dailyReport, now)) {
        mark("dailyReport");
        try {
          const p = reportPeriod("daily", now);
          const r = await buildReport("daily", p.from, p.to);
          if (sc.dailyReport.push) {
            const pushed = await pushOutlets((0, import_i18n4.t)("\u7ECF\u8425\u65E5\u62A5 {p0}", { p0: p.from }), reportText(r)).catch((e) => [{ channel: "push", ok: false, error: (0, import_userFacingError.userFacingError)(e) }]);
            store.update((s) => {
              const x = s.reports.find((y) => y.id === r.id);
              if (x) x.pushed = pushed;
            });
          }
          log("schedule", (0, import_i18n4.t)("\u5DF2\u751F\u6210 {p0} \u7ECF\u8425\u65E5\u62A5", { p0: p.from }));
        } catch (e) {
          log("schedule", (0, import_i18n4.t)("\u7ECF\u8425\u65E5\u62A5\u6CA1\u6709\u751F\u6210\uFF1A{p0}", { p0: (0, import_userFacingError.userFacingError)(e) }), false);
        }
      }
      if (sc.monthlyReport.enabled && now.getDate() === Math.min(Math.max(sc.monthlyReport.day, 1), 28) && dueToday(sc.monthlyReport.time, store.read().lastRun.monthlyReport, now)) {
        mark("monthlyReport");
        try {
          const p = reportPeriod("monthly", now);
          const r = await buildReport("monthly", p.from, p.to);
          if (sc.monthlyReport.push) {
            const pushed = await pushOutlets((0, import_i18n4.t)("\u7ECF\u8425\u6708\u62A5 {a} ~ {b}", { a: p.from, b: p.to }), reportText(r)).catch((e) => [{ channel: "push", ok: false, error: (0, import_userFacingError.userFacingError)(e) }]);
            store.update((s) => {
              const x = s.reports.find((y) => y.id === r.id);
              if (x) x.pushed = pushed;
            });
          }
          log("schedule", (0, import_i18n4.t)("\u5DF2\u751F\u6210 {a} ~ {b} \u7ECF\u8425\u6708\u62A5", { a: p.from, b: p.to }));
        } catch (e) {
          log("schedule", (0, import_i18n4.t)("\u7ECF\u8425\u6708\u62A5\u6CA1\u6709\u751F\u6210\uFF1A{p0}", { p0: (0, import_userFacingError.userFacingError)(e) }), false);
        }
      }
      if (sc.newArrival.enabled) {
        const seen = new Set(store.read().seen.garments);
        const fresh = garments().filter((g) => !seen.has(g.id) && Date.now() - Date.parse(g.createdAt) < 7 * 864e5);
        if (!store.read().seen.garments.length) {
          store.update((s) => {
            s.seen.garments = garments().map((g) => g.id);
          });
        } else if (fresh.length) {
          store.update((s) => {
            s.seen.garments = [...s.seen.garments, ...fresh.map((g) => g.id)];
          });
          const chIds = store.read().settings.channels.filter((c) => c.enabled).map((c) => c.id);
          try {
            if (chIds.length) await actions["listing.generate"]({ garmentIds: fresh.map((g) => g.id), channelIds: chIds });
          } catch (e) {
            log("schedule", (0, import_i18n4.t)("\u65B0\u54C1\u4E0A\u67B6\u8349\u7A3F\u6CA1\u6709\u751F\u6210\uFF1A{p0}", { p0: (0, import_userFacingError.userFacingError)(e) }), false);
          }
          try {
            const v = createVideo({ type: "new_arrival", garmentIds: fresh.slice(0, 5).map((g) => g.id), name: (0, import_i18n4.t)("\u65B0\u54C1\u4E0A\u65B0 {p0}", { p0: today }) });
            await scriptVideo(v.id);
          } catch (e) {
            log("schedule", (0, import_i18n4.t)("\u65B0\u54C1\u4E0A\u65B0\u89C6\u9891\u811A\u672C\u6CA1\u6709\u751F\u6210\uFF1A{p0}", { p0: (0, import_userFacingError.userFacingError)(e) }), false);
          }
          log("schedule", (0, import_i18n4.t)("\u65B0\u54C1\u5165\u5E93\u8054\u52A8\uFF1A{n} \u6B3E\u65B0\u54C1\u5DF2\u751F\u6210\u4E0A\u67B6\u8349\u7A3F\u4E0E\u89C6\u9891\u811A\u672C\uFF0C\u7B49\u4F60\u5BA1\u6838", { n: fresh.length }));
        }
      }
      if (sc.calendar.enabled && dueToday("09:00", store.read().lastRun.calendar, now)) {
        mark("calendar");
        for (const day of sc.calendar.days) {
          const [mm, dd] = String(day.date || "").split("-").map(Number);
          if (!mm || !dd) continue;
          let target = new Date(now.getFullYear(), mm - 1, dd);
          if (target.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) target = new Date(now.getFullYear() + 1, mm - 1, dd);
          const days = Math.round((target.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 864e5);
          const key = `calendar:${target.getFullYear()}-${day.date}`;
          if (days !== Math.max(0, sc.calendar.leadDays) || store.read().lastRun[key]) continue;
          store.update((s) => {
            s.lastRun[key] = today;
          });
          try {
            await createAvatar({ topic: day.topic === "store_opening" ? "store_opening" : "holiday", brief: day.name, name: (0, import_i18n4.t)("{p0} \xB7 \u6570\u5B57\u4EBA\u795D\u798F", { p0: day.name }), seconds: 30 });
            log("schedule", (0, import_i18n4.t)("\u5DF2\u751F\u6210\u300C{p0}\u300D\u6570\u5B57\u4EBA\u8BB2\u7A3F\u8349\u7A3F\uFF0C\u7B49\u4F60\u5BA1\u6838", { p0: day.name }));
          } catch (e) {
            log("schedule", (0, import_i18n4.t)("\u300C{p0}\u300D\u6570\u5B57\u4EBA\u8BB2\u7A3F\u6CA1\u6709\u751F\u6210\uFF1A{p1}", { p0: day.name, p1: (0, import_userFacingError.userFacingError)(e) }), false);
          }
        }
      }
      for (const v of store.read().videos) {
        if (v.status !== "approved" || !v.publishAt || v.publishDue || Date.parse(v.publishAt) > now.getTime()) continue;
        patchVideo(v.id, { publishDue: true });
        broadcast("progress", { key: "video", message: (0, import_i18n4.t)("\u300C{p0}\u300D\u5230\u4E86\u5B9A\u65F6\u53D1\u5E03\u65F6\u95F4", { p0: v.name }) });
        try {
          win()?.webContents.send(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BA_EVENT, { type: "publish-due", payload: { id: v.id } });
        } catch {
        }
        try {
          new import_electron.Notification({ title: (0, import_i18n4.t)("\u7ECF\u8425\u81EA\u52A8\u5316 \xB7 \u5B9A\u65F6\u53D1\u5E03"), body: (0, import_i18n4.t)("\u300C{p0}\u300D\u5230\u53D1\u5E03\u65F6\u95F4\u4E86\uFF0C\u6253\u5F00\u7ECF\u8425\u81EA\u52A8\u5316\u667A\u80FD\u4F53\u5373\u81EA\u52A8\u53D1\u8D77\u53D1\u5E03", { p0: v.name }) }).show();
        } catch {
        }
        log("video", (0, import_i18n4.t)("\u5B9A\u65F6\u53D1\u5E03\u5230\u70B9\uFF1A{p0}", { p0: v.name }));
      }
      if (sc.inventoryPatrol.enabled && dueToday(sc.inventoryPatrol.time, store.read().lastRun.inventoryPatrol, now)) {
        mark("inventoryPatrol");
        const { hits, delisted } = evaluate();
        log("schedule", (0, import_i18n4.t)("\u5E93\u5B58\u5DE1\u68C0\uFF1A{n} \u6761\u63D0\u9192\uFF0C\u95E8\u5E97\u624B\u673A\u7AEF\u81EA\u52A8\u4E0B\u67B6 {m} \u6B3E", { n: hits.length, m: delisted }));
      }
      if (sc.weeklyVideo.enabled && now.getDay() === sc.weeklyVideo.weekday % 7 && dueToday(sc.weeklyVideo.time, store.read().lastRun.weeklyVideo, now)) {
        mark("weeklyVideo");
        try {
          const p = reportPeriod("weekly", now);
          const m = computeMetrics(store.data().sales, [], garments(), p.from, p.to);
          const picks = m.topItems.map((x) => garments().find((g) => g.name === x.label || g.sku === x.key)).filter(Boolean).slice(0, 3);
          const ids = picks.length ? picks.map((g) => g.id) : garments().slice(0, 3).map((g) => g.id);
          if (!ids.length) throw new Error((0, import_i18n4.t)("\u5546\u54C1\u5E93\u662F\u7A7A\u7684"));
          const v = createVideo({ type: "new_arrival", garmentIds: ids, brief: (0, import_i18n4.t)("\u672C\u5468\u4E3B\u63A8\uFF1A{p0}\uFF08\u6309\u4E0A\u5468\u9500\u91CF\uFF09", { p0: ids.map((id) => garment(id).name).join((0, import_i18n4.t)("\u3001")) }), name: (0, import_i18n4.t)("\u672C\u5468\u4E3B\u63A8 {p0}", { p0: today }) });
          await scriptVideo(v.id);
          log("schedule", (0, import_i18n4.t)("\u5DF2\u751F\u6210\u672C\u5468\u4E3B\u63A8\u89C6\u9891\u811A\u672C\uFF0C\u5F85\u5BA1\u6838\u540E\u6210\u7247\u53D1\u5E03"));
        } catch (e) {
          log("schedule", (0, import_i18n4.t)("\u672C\u5468\u4E3B\u63A8\u89C6\u9891\u6CA1\u6709\u751F\u6210\uFF1A{p0}", { p0: (0, import_userFacingError.userFacingError)(e) }), false);
        }
      }
    } catch (e) {
      logger?.warn?.("biz-automation", "schedule tick failed", { error: e?.message });
    } finally {
      ticking = false;
      pushState();
    }
  };
  const timer = setInterval(() => {
    void tick();
  }, 6e4);
  timer.unref?.();
  const stopBackground = () => {
    clearInterval(timer);
    for (const r of runs.values()) {
      r.controller.abort();
      for (const c of r.children) (0, import_media2.killTree)(c);
    }
  };
  (0, import_quitRegistry.onAppWillQuit)("biz-automation", stopBackground, { once: true });
  const actions = {
    "state.get": () => publicState(),
    "models.list": () => modelOptions(),
    "garments.list": () => garments(),
    "settings.patch": (p) => {
      const r = store.update((s) => {
        const patch = p?.patch || {};
        if (patch.brandName !== void 0) s.settings.brandName = String(patch.brandName).slice(0, 30);
        if (patch.storeAddress !== void 0) s.settings.storeAddress = String(patch.storeAddress).slice(0, 80);
        if (patch.openingHours !== void 0) s.settings.openingHours = String(patch.openingHours).slice(0, 40);
        if (patch.dataFolders) s.settings.dataFolders = { ...s.settings.dataFolders, ...patch.dataFolders };
        if (patch.moduleModels) s.settings.moduleModels = { ...patch.moduleModels };
        if (Array.isArray(patch.channels)) s.settings.channels = patch.channels;
        if (patch.seasonMonths) s.settings.seasonMonths = patch.seasonMonths;
        if (Array.isArray(patch.coreSizes)) s.settings.coreSizes = patch.coreSizes.map((x) => String(x).toUpperCase()).filter(Boolean);
        if (patch.autoDelistLocal !== void 0) s.settings.autoDelistLocal = !!patch.autoDelistLocal;
        if (patch.schedule) s.settings.schedule = { ...s.settings.schedule, ...patch.schedule };
        if (patch.outputDir !== void 0) s.settings.outputDir = String(patch.outputDir || "");
        return s.settings;
      });
      pushState();
      return r;
    },
    "files.pick": async (p) => {
      const filters = p?.kind === "excel" ? [{ name: "Excel", extensions: ["xlsx", "xls", "csv"] }] : [{ name: "Image", extensions: ["jpg", "jpeg", "png", "webp"] }];
      const r = await import_electron.dialog.showOpenDialog(win(), { properties: p?.multi ? ["openFile", "multiSelections"] : ["openFile"], filters });
      return r.canceled ? [] : r.filePaths;
    },
    "dirs.pick": async () => {
      const r = await import_electron.dialog.showOpenDialog(win(), { properties: ["openDirectory", "createDirectory"] });
      return r.canceled ? "" : r.filePaths[0] || "";
    },
    "path.open": async (p) => {
      if (!p?.path || !(0, import_node_fs3.existsSync)(p.path)) throw new Error((0, import_i18n4.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      if (p.reveal) {
        import_electron.shell.showItemInFolder(p.path);
        return true;
      }
      const err = await import_electron.shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },
    "log.clear": () => {
      store.update((s) => {
        s.log = [];
      });
      pushState();
      return true;
    },
    "schedule.runNow": async () => {
      store.update((s) => {
        s.lastRun = {};
      });
      await tick();
      return publicState().log.slice(0, 5);
    },
    // A
    "video.create": (p) => createVideo(p || {}),
    "video.script": async (p) => {
      try {
        return await scriptVideo(p.id);
      } catch (e) {
        track(p.id, "script", (0, import_i18n4.t)("\u5199\u811A\u672C\u5931\u8D25\uFF1A{p0}", { p0: (0, import_userFacingError.userFacingError)(e) }), false);
        throw e;
      }
    },
    "video.update": (p) => {
      const v = videoById(p.id);
      const allowed = {};
      for (const k of ["name", "brief", "scenes", "copies", "platforms", "narration", "voiceGender"]) if (p.patch?.[k] !== void 0) allowed[k] = p.patch[k];
      const next = { ...v, ...allowed };
      const contentChanged = allowed.scenes || allowed.narration !== void 0 || allowed.voiceGender;
      const r = patchVideo(p.id, { ...allowed, warnings: videoWarnings(next), ...contentChanged && v.video ? { video: void 0, status: "scripted", approvedAt: void 0 } : {}, ...allowed.copies && v.status === "approved" ? { status: "rendered", approvedAt: void 0 } : {} });
      if (allowed.scenes || allowed.copies) {
        track(p.id, "edit", (allowed.scenes ? (0, import_i18n4.t)("\u4FEE\u6539\u4E86\u5206\u955C") : (0, import_i18n4.t)("\u4FEE\u6539\u4E86\u5E73\u53F0\u6587\u6848")) + (contentChanged && v.video ? (0, import_i18n4.t)("\uFF0C\u65E7\u6210\u7247\u4F5C\u5E9F\u9700\u91CD\u65B0\u6210\u7247") : allowed.copies && v.status === "approved" ? (0, import_i18n4.t)("\uFF0C\u9700\u91CD\u65B0\u5BA1\u6838") : ""));
      }
      return r;
    },
    "video.addMaterials": (p) => {
      const v = videoById(p.id);
      const dir = store.dir((0, import_node_path3.join)("materials", v.id));
      const added = (p.paths || []).filter((x) => (0, import_node_fs3.existsSync)(x)).map((src) => {
        const dest = (0, import_node_path3.join)(dir, `${Date.now()}_${(0, import_node_path3.basename)(src)}`);
        (0, import_node_fs3.copyFileSync)(src, dest);
        return dest;
      });
      const r = patchVideo(p.id, { materials: [...v.materials, ...added] });
      if (added.length) track(p.id, "material", (0, import_i18n4.t)("\u8865\u5145 {n} \u5F20\u7D20\u6750", { n: added.length }));
      return r;
    },
    "video.render": (p) => renderVideo(p.id),
    "video.cancel": (p) => {
      const r = runs.get(p.id);
      if (r) {
        r.controller.abort();
        for (const c of r.children) (0, import_media2.killTree)(c);
      }
      return true;
    },
    "video.approve": (p) => {
      const v = videoById(p.id);
      if (!v.video || !(0, import_node_fs3.existsSync)(v.video)) throw new Error((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u6210\u7247"));
      if (v.warnings.length && !p.force) throw new Error((0, import_i18n4.t)("\u8FD8\u6709\u672A\u5904\u7406\u7684\u63D0\u793A\uFF1A{p0}\u3002\u6539\u5B8C\u518D\u5BA1\u6838\uFF0C\u6216\u786E\u8BA4\u540E\u52FE\u9009\u300C\u4ECD\u7136\u901A\u8FC7\u300D", { p0: v.warnings.join("\uFF1B") }));
      const r = patchVideo(p.id, { status: "approved", approvedAt: (/* @__PURE__ */ new Date()).toISOString() });
      track(p.id, "approve", v.warnings.length ? (0, import_i18n4.t)("\u5BA1\u6838\u901A\u8FC7\uFF08\u5DF2\u786E\u8BA4 {n} \u6761\u63D0\u793A\uFF09", { n: v.warnings.length }) : (0, import_i18n4.t)("\u5BA1\u6838\u901A\u8FC7"));
      return r;
    },
    "video.publishInput": (p) => {
      const v = videoById(p.id);
      if (v.status !== "approved" && v.status !== "published" && v.status !== "publishing") throw new Error((0, import_i18n4.t)("\u5148\u5BA1\u6838\u901A\u8FC7\u518D\u53D1\u5E03"));
      if (!v.video || !(0, import_node_fs3.existsSync)(v.video)) throw new Error((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u6210\u7247"));
      patchVideo(p.id, { status: "publishing" });
      track(p.id, "publish", (0, import_i18n4.t)("\u53D1\u8D77\u53D1\u5E03\uFF1A{p0}", { p0: platformNames(v.platforms) }));
      return publishInput(v.video, v.name, v.platforms, v.copies);
    },
    "video.markPublished": (p) => {
      const r = patchVideo(p.id, p.ok === false ? { status: "approved", publishRunNote: p.note } : { status: "published", publishedAt: (/* @__PURE__ */ new Date()).toISOString(), publishRunNote: p.note });
      track(p.id, "publish", p.ok === false ? (0, import_i18n4.t)("\u4EBA\u5DE5\u6807\u8BB0\u672A\u53D1\u6210\u529F\uFF1A{p0}", { p0: p.note || "" }) : (0, import_i18n4.t)("\u4EBA\u5DE5\u786E\u8BA4\u5DF2\u53D1\u5E03"), p.ok !== false);
      return r;
    },
    /**
     * 发布工作流结束后的回写（渲染层从工作流运行页留下的回执里取，带上发起时记下的视频 id）。
     * 有平台确认发布 → 已发布；一个都没有 → 退回已审核可重发。同一 runId 只记一次（重复进页面不重复记账）。
     */
    "video.publishResult": (p) => {
      const v = videoById(p.id);
      if (p.runId && (v.publishRuns || []).some((x) => x.runId === p.runId)) return v;
      const run = publishRunFromWorkflow({ kind: p.kind, runId: p.runId, receipt: p.receipt, platforms: v.platforms, videoFile: v.video, at: p.at });
      const parts = [];
      if (run.published.length) parts.push((0, import_i18n4.t)("{p0} \u5DF2\u53D1\u5E03", { p0: platformNames(run.published) }));
      if (run.unconfirmed.length) parts.push((0, import_i18n4.t)("{p0} \u5F85\u4EBA\u5DE5\u6838\u5BF9", { p0: platformNames(run.unconfirmed) }));
      if (run.failed.length) parts.push((0, import_i18n4.t)("{p0} \u672A\u53D1\u6210\u529F", { p0: platformNames(run.failed) }));
      const note = run.outcome === "cancelled" ? (0, import_i18n4.t)("\u53D1\u5E03\u5DE5\u4F5C\u6D41\u5DF2\u53D6\u6D88") : parts.join((0, import_i18n4.t)("\uFF0C")) || (0, import_i18n4.t)("\u53D1\u5E03\u5DE5\u4F5C\u6D41\u6CA1\u6709\u8FD4\u56DE\u5E73\u53F0\u56DE\u6267");
      run.note = note;
      const ok = run.published.length > 0;
      store.update((s) => {
        const x = s.videos.find((y) => y.id === p.id);
        if (x) x.publishRuns = [...x.publishRuns || [], run].slice(-30);
      });
      patchVideo(p.id, ok ? { status: "published", publishedAt: v.publishedAt && v.status === "published" ? v.publishedAt : run.at, publishRunNote: note } : { status: v.status === "published" ? "published" : "approved", publishRunNote: note });
      track(p.id, "publish", (0, import_i18n4.t)("\u53D1\u5E03\u7ED3\u679C\uFF1A{p0}", { p0: note }), ok);
      return videoById(p.id);
    },
    "video.fillModels": (p) => fillModelImages(p.id),
    /** 定时发布：到点后系统通知，工作台打开时自动发起发布（需要内置浏览器里的平台登录态） */
    "video.schedule": (p) => {
      const v = videoById(p.id);
      if (p.at && v.status !== "approved") throw new Error((0, import_i18n4.t)("\u5148\u5BA1\u6838\u901A\u8FC7\u518D\u8BBE\u5B9A\u65F6\u53D1\u5E03"));
      if (p.at && Date.parse(p.at) < Date.now() - 6e4) throw new Error((0, import_i18n4.t)("\u53D1\u5E03\u65F6\u95F4\u8981\u665A\u4E8E\u73B0\u5728"));
      const r = patchVideo(p.id, { publishAt: p.at || void 0, publishDue: false });
      track(p.id, "schedule", p.at ? (0, import_i18n4.t)("\u8BBE\u5B9A\u65F6\u53D1\u5E03\uFF1A{p0}", { p0: new Date(p.at).toLocaleString() }) : (0, import_i18n4.t)("\u53D6\u6D88\u5B9A\u65F6\u53D1\u5E03"));
      return r;
    },
    "video.recordStats": (p) => {
      const v = videoById(p.id);
      const n = (x) => Math.max(0, Math.round(Number(x) || 0));
      const item = { plays: n(p.stats?.plays), likes: n(p.stats?.likes), comments: n(p.stats?.comments), shares: n(p.stats?.shares), source: p.stats?.source === "employee" ? "employee" : "manual", at: (/* @__PURE__ */ new Date()).toISOString() };
      const r = patchVideo(p.id, { stats: { ...v.stats || {}, [p.platform]: item } });
      track(p.id, "stats", (0, import_i18n4.t)("{p0} \u6570\u636E\uFF1A\u64AD\u653E {a} \xB7 \u70B9\u8D5E {b} \xB7 \u8BC4\u8BBA {c} \xB7 \u5206\u4EAB {d}", { p0: PLATFORM_LABEL()[p.platform] || p.platform, a: item.plays, b: item.likes, c: item.comments, d: item.shares }));
      return r;
    },
    /** 交给数字员工去各平台创作者后台读回数据（只读） */
    "video.statsInstruction": (p) => {
      const v = videoById(p.id);
      const urls = { douyin: "https://creator.douyin.com/", kuaishou: "https://cp.kuaishou.com/", xiaohongshu: "https://creator.xiaohongshu.com/", wxchannels: "https://channels.weixin.qq.com/" };
      const title = v.platforms.map((x) => v.copies[x]?.title).find(Boolean) || v.name;
      return [
        (0, import_i18n4.t)("\u8BF7\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u91CC\u5206\u522B\u6253\u5F00\u4E0B\u9762\u5E73\u53F0\u7684\u521B\u4F5C\u8005\u540E\u53F0\uFF0C\u627E\u5230\u6807\u9898\u4E3A\u300C{p0}\u300D\u7684\u89C6\u9891\uFF0C\u8BFB\u51FA\u64AD\u653E\u3001\u70B9\u8D5E\u3001\u8BC4\u8BBA\u3001\u5206\u4EAB\u6570\u3002\u53EA\u8BFB\u53D6\uFF0C\u4E0D\u8981\u505A\u4EFB\u4F55\u4FEE\u6539\u6216\u53D1\u5E03\u64CD\u4F5C\u3002", { p0: title }),
        ...v.platforms.map((x) => `- ${x}\uFF1A${urls[x]}`),
        (0, import_i18n4.t)("\u8BFB\u5B8C\u540E\u6309\u8FD9\u4E2A\u683C\u5F0F\u9010\u884C\u56DE\u590D\uFF08\u6CA1\u627E\u5230\u5C31\u5199 \u672A\u627E\u5230\uFF09\uFF1A\u5E73\u53F0 | \u64AD\u653E | \u70B9\u8D5E | \u8BC4\u8BBA | \u5206\u4EAB")
      ].join("\n");
    },
    /** 复盘：按款式汇总各视频的播放与互动（引流效果） */
    "video.review": () => {
      const rows = /* @__PURE__ */ new Map();
      for (const v of store.read().videos) {
        if (!v.stats) continue;
        const tot = Object.values(v.stats).reduce((a, x) => ({ plays: a.plays + (x?.plays || 0), likes: a.likes + (x?.likes || 0), comments: a.comments + (x?.comments || 0), shares: a.shares + (x?.shares || 0) }), { plays: 0, likes: 0, comments: 0, shares: 0 });
        for (const gid of v.garmentIds) {
          const r = rows.get(gid) || { garmentId: gid, videos: 0, plays: 0, likes: 0, comments: 0, shares: 0 };
          r.videos++;
          r.plays += tot.plays;
          r.likes += tot.likes;
          r.comments += tot.comments;
          r.shares += tot.shares;
          rows.set(gid, r);
        }
      }
      return [...rows.values()].sort((a, b) => b.plays - a.plays);
    },
    "video.remove": (p) => {
      store.update((s) => {
        s.videos = s.videos.filter((v) => v.id !== p.id);
      });
      pushState();
      return true;
    },
    // B
    "avatar.status": async () => {
      if (!deps.digitalHumanProc) return { ready: false, detail: (0, import_i18n4.t)("\u6570\u5B57\u4EBA\u670D\u52A1\u672A\u521D\u59CB\u5316") };
      try {
        const st = await deps.digitalHumanProc.getStatus();
        return { ready: st?.configured !== false && st?.ok !== false, detail: st };
      } catch (e) {
        return { ready: false, detail: (0, import_userFacingError.userFacingError)(e) };
      }
    },
    "avatar.facts": () => knowledgeFacts(),
    "avatar.create": (p) => createAvatar(p),
    "avatar.update": (p) => {
      const allowed = {};
      for (const k of ["name", "script", "avatarId", "voiceId", "aspectRatio", "likenessConsent"]) if (p.patch?.[k] !== void 0) allowed[k] = p.patch[k];
      if (allowed.script !== void 0) allowed.warnings = avatarWarnings(allowed.script);
      return patchAvatar(p.id, allowed);
    },
    "avatar.render": async (p) => {
      const a = avatarById(p.id);
      const dh = deps.digitalHumanProc;
      if (!dh) throw new Error((0, import_i18n4.t)("\u6570\u5B57\u4EBA\u670D\u52A1\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5148\u5230\u300C\u6570\u5B57\u4EBA\u5DE5\u4F5C\u53F0 \u2192 \u914D\u7F6E\u300D\u9009\u62E9\u670D\u52A1\u5546\u5E76\u586B\u51ED\u636E"));
      if (placeholders(a.script).length) throw new Error((0, import_i18n4.t)("\u8BB2\u7A3F\u91CC\u8FD8\u6709\u3010\u5F85\u8865\u5145\u3011\uFF0C\u8865\u5B8C\u518D\u6210\u7247"));
      patchAvatar(p.id, { status: "rendering", error: void 0 });
      try {
        progress("avatar", (0, import_i18n4.t)("\u5DF2\u63D0\u4EA4\u6570\u5B57\u4EBA\u6210\u7247\uFF0C\u901A\u5E38\u9700\u8981 1\uFF5E5 \u5206\u949F\u2026"));
        const body = { script: a.script, aspectRatio: a.aspectRatio, subtitle: true };
        if (a.avatarId) body.avatarId = a.avatarId;
        if (a.voiceId) body.voiceId = a.voiceId;
        const sub = await dh.synthesize(body);
        let url = (0, import_digitalHumanProc.isTaskFinished)(sub) ? String(sub?.videoUrl ?? sub?.video_url ?? "") : "";
        const taskId = sub?.taskId ?? sub?.task_id;
        if (!url) {
          if (!taskId) throw new Error(String(sub?.error || (0, import_i18n4.t)("\u6570\u5B57\u4EBA\u6210\u7247\u63D0\u4EA4\u5931\u8D25")));
          patchAvatar(p.id, { taskId: String(taskId) });
          const deadline = Date.now() + 10 * 6e4;
          while (!url && Date.now() < deadline) {
            await new Promise((r) => setTimeout(r, 4e3));
            const q = await dh.queryTask(String(taskId));
            if ((0, import_digitalHumanProc.isTaskFailed)(q)) throw new Error(String(q?.error || (0, import_i18n4.t)("\u6570\u5B57\u4EBA\u6210\u7247\u5931\u8D25")));
            if ((0, import_digitalHumanProc.isTaskFinished)(q)) url = String(q?.videoUrl ?? q?.video_url ?? "");
          }
          if (!url) throw new Error((0, import_i18n4.t)("\u6570\u5B57\u4EBA\u6210\u7247\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5"));
        }
        const dest = (0, import_node_path3.join)(outputDir((0, import_i18n4.t)("\u6570\u5B57\u4EBA")), `${a.name.replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 40)}-${Date.now()}.mp4`);
        progress("avatar", (0, import_i18n4.t)("\u6B63\u5728\u4E0B\u8F7D\u6210\u7247\u2026"));
        const raw = dest.replace(/\.mp4$/, "-raw.mp4");
        await downloadTo(url, raw);
        progress("avatar", (0, import_i18n4.t)("\u6B63\u5728\u52A0 AI \u751F\u6210\u6807\u8BC6\u4E0E\u7247\u5C3E\u2026"));
        await labelAvatarVideo(raw, dest, a.aspectRatio);
        log("avatar", (0, import_i18n4.t)("\u6570\u5B57\u4EBA\u6210\u7247\uFF1A{p0}", { p0: a.name }));
        return patchAvatar(p.id, { status: "rendered", video: dest });
      } catch (e) {
        const msg = (0, import_userFacingError.userFacingError)(e);
        patchAvatar(p.id, { status: "failed", error: msg });
        throw new Error(msg);
      }
    },
    /** 数字人成片进入短视频发布：生成一个已成片的视频项目，文案由模型按讲稿写 */
    "avatar.toVideo": async (p) => {
      const a = avatarById(p.id);
      if (!a.video || !(0, import_node_fs3.existsSync)(a.video)) throw new Error((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u6210\u7247"));
      const platforms = p.platforms?.length ? p.platforms : ["douyin", "wxchannels"];
      const copies = {};
      try {
        const { json } = await llmJson("avatar", [
          "Write short-video titles and captions (Simplified Chinese) for this digital-human talking video. Do not add facts not in the script. No absolute words banned by Chinese advertising law.",
          `Script:
${a.script}`,
          `Return ONLY JSON: {${platforms.map((x) => `"${x}": {"title": "...", "caption": "...", "topics": ["..."]}`).join(", ")}}`
        ].join("\n"));
        for (const x of platforms) if (json?.[x]) copies[x] = { title: clampTitle(String(json[x].title || a.name), x === "xiaohongshu" ? 20 : 30), caption: `${String(json[x].caption || "")}
${(0, import_i18n4.t)("\uFF08\u672C\u89C6\u9891\u7531 AI \u751F\u6210\uFF09")}`, topics: (json[x].topics || []).map(String).slice(0, 6) };
      } catch {
      }
      const v = {
        id: newId("bav"),
        type: "store_tour",
        name: a.name,
        garmentIds: [],
        brief: "",
        materials: [],
        scenes: [],
        copies,
        platforms,
        narration: true,
        voiceGender: "female",
        video: a.video,
        status: "rendered",
        warnings: [],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      v.warnings = videoWarnings(v);
      v.history = appendVideoEvent(appendVideoEvent([], "create", (0, import_i18n4.t)("\u7531\u6570\u5B57\u4EBA\u9879\u76EE\u300C{p0}\u300D\u8F6C\u5165\uFF0C\u53D1\u5E03\u5230 {p1}", { p0: a.name, p1: platformNames(platforms) })), "render", (0, import_i18n4.t)("\u6570\u5B57\u4EBA\u6210\u7247\uFF1A{f}", { f: a.video ? (0, import_node_path3.basename)(a.video) : "" }));
      store.update((s) => {
        s.videos.unshift(v);
      });
      pushState();
      return v;
    },
    "avatar.remove": (p) => {
      store.update((s) => {
        s.avatars = s.avatars.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    // C
    "rules.evaluate": () => evaluate(),
    "listing.generate": async (p) => {
      const s0 = store.read();
      const channels = s0.settings.channels.filter((c) => (p?.channelIds || []).includes(c.id));
      const gs = (p?.garmentIds || []).map(garment).filter(Boolean);
      if (!gs.length || !channels.length) throw new Error((0, import_i18n4.t)("\u8BF7\u9009\u62E9\u5546\u54C1\u548C\u4E0A\u67B6\u6E20\u9053"));
      const made = [];
      const errors = [];
      let n = 0;
      for (const g of gs) {
        for (const ch of channels) {
          n++;
          progress("listing", (0, import_i18n4.t)("\u6B63\u5728\u751F\u6210 {a}/{b}\uFF1A{p0} \xB7 {p1}", { a: n, b: gs.length * channels.length, p0: g.name, p1: ch.name }));
          try {
            const { json, model } = await llmJson("listing", listingPrompt({ garment: g, channel: ch, brand: s0.settings.brandName }));
            const dir = store.dir((0, import_node_path3.join)("listing", g.id));
            const images = [];
            if (g.image && (0, import_node_fs3.existsSync)(g.image)) images.push(await mainImage(g.image, ch.aspect, (0, import_node_path3.join)(dir, `${ch.id}-main${(0, import_node_path3.extname)(g.image) === ".png" ? ".png" : ".jpg"}`)));
            for (const [i, t] of tryonImages(g.id, 4).entries()) images.push(await mainImage(t, ch.aspect, (0, import_node_path3.join)(dir, `${ch.id}-look${i + 1}.jpg`)));
            if (g.image && (0, import_node_fs3.existsSync)(g.image)) {
              const d = await detailImage(g.image, ch.aspect, (0, import_node_path3.join)(dir, `${ch.id}-detail.jpg`));
              if (d) images.push(d);
            }
            const sc = await sizeChartImage(g, ch.aspect, (0, import_node_path3.join)(dir, `${ch.id}-size.jpg`));
            if (sc) images.push(sc);
            const draft = {
              title: clampTitle(String(json.title || g.name), ch.titleMax),
              sellingPoints: (Array.isArray(json.sellingPoints) ? json.sellingPoints : []).map(String).slice(0, 5),
              detail: String(json.detail || "").slice(0, 1500)
            };
            const l = {
              id: newId("bal"),
              garmentId: g.id,
              channelId: ch.id,
              ...draft,
              keywords: (Array.isArray(json.keywords) ? json.keywords : []).map(String).slice(0, 8),
              images,
              price: g.price,
              status: "draft",
              warnings: listingWarnings(draft),
              model,
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            store.update((s) => {
              s.listings = [l, ...s.listings.filter((x) => !(x.garmentId === g.id && x.channelId === ch.id && x.status === "draft"))];
            });
            made.push(l);
          } catch (e) {
            errors.push(`${g.name} \xB7 ${ch.name}\uFF1A${(0, import_userFacingError.userFacingError)(e)}`);
          }
        }
      }
      pushState();
      if (!made.length) throw new Error(errors[0] || (0, import_i18n4.t)("\u6CA1\u6709\u751F\u6210\u4EFB\u4F55\u4E0A\u67B6\u8349\u7A3F"));
      return { made, errors };
    },
    "listing.update": (p) => {
      const l = listingById(p.id);
      const allowed = {};
      for (const k of ["title", "sellingPoints", "detail", "keywords", "images", "productUrl"]) if (p.patch?.[k] !== void 0) allowed[k] = p.patch[k];
      const ch = store.read().settings.channels.find((c) => c.id === l.channelId);
      if (allowed.title !== void 0 && ch) allowed.title = clampTitle(allowed.title, ch.titleMax);
      const next = { ...l, ...allowed };
      return patchListing(p.id, { ...allowed, warnings: listingWarnings(next), ...l.status === "confirmed" && (allowed.title || allowed.detail || allowed.sellingPoints) ? { status: "draft" } : {} });
    },
    "listing.confirm": (p) => patchListing(p.id, { status: "confirmed" }),
    "listing.status": (p) => {
      const l = patchListing(p.id, { status: p.status, ...p.conversationId ? { conversationId: p.conversationId } : {}, ...p.productUrl ? { productUrl: p.productUrl } : {} });
      const chn = store.read().settings.channels.find((c) => c.id === l.channelId);
      log("listing", (0, import_i18n4.t)("{p0} \xB7 {p1}\uFF1A{p2}", { p0: garment(l.garmentId)?.name || "", p1: chn?.name || "", p2: p.status }) + (chn?.autoSubmit && p.status === "handed" ? (0, import_i18n4.t)("\uFF08\u81EA\u52A8\u6267\u884C\uFF09") : ""));
      return l;
    },
    /** 交给数字员工的上架指令：按草稿逐项填写，停在「提交 / 发布」前等人确认 */
    "listing.instruction": (p) => {
      const l = listingById(p.id);
      if (l.status === "draft") throw new Error((0, import_i18n4.t)("\u5148\u786E\u8BA4\u4E0A\u67B6\u8349\u7A3F"));
      const ch = requireFound(store.read().settings.channels.find((c) => c.id === l.channelId), (0, import_i18n4.t)("\u6E20\u9053"));
      const g = garment(l.garmentId);
      const stock = g ? Object.entries(g.stock).map(([k, v]) => `${k}\xD7${v}`).join((0, import_i18n4.t)("\u3001")) : "";
      return [
        (0, import_i18n4.t)("\u8BF7\u5728\u5185\u7F6E\u6D4F\u89C8\u5668\u91CC\u6253\u5F00 {p0} \u5546\u5BB6\u540E\u53F0\uFF08{p1}\uFF09\uFF0C\u7528\u6211\u5DF2\u767B\u5F55\u7684\u8D26\u53F7\u65B0\u5EFA\u5546\u54C1\u5E76\u6309\u4E0B\u9762\u7684\u5185\u5BB9\u586B\u5199\u3002", { p0: ch.name, p1: ch.url }),
        ch.autoSubmit ? (0, import_i18n4.t)("\u8981\u6C42\uFF1A\u53EA\u586B\u5199\u4E0B\u5217\u5185\u5BB9\uFF0C\u4E0D\u8981\u6539\u4EF7\u3001\u4E0D\u8981\u5F00\u542F\u4EFB\u4F55\u4ED8\u8D39\u63A8\u5E7F\uFF1B\u8BE5\u5E97\u94FA\u5DF2\u6388\u6743\u5168\u81EA\u52A8\uFF0C\u586B\u5B8C\u6838\u5BF9\u65E0\u8BEF\u540E\u76F4\u63A5\u63D0\u4EA4\uFF0C\u5E76\u628A\u63D0\u4EA4\u7ED3\u679C\u4E0E\u5546\u54C1\u94FE\u63A5\u56DE\u590D\u7ED9\u6211\u3002\u5982\u9700\u767B\u5F55\u6216\u9A8C\u8BC1\u7801\uFF0C\u8BF7\u505C\u4E0B\u6765\u8BA9\u6211\u5904\u7406\u3002") : (0, import_i18n4.t)("\u8981\u6C42\uFF1A\u53EA\u586B\u5199\u4E0B\u5217\u5185\u5BB9\uFF0C\u4E0D\u8981\u6539\u4EF7\u3001\u4E0D\u8981\u5F00\u542F\u4EFB\u4F55\u4ED8\u8D39\u63A8\u5E7F\uFF1B\u586B\u5B8C\u505C\u5728\u300C\u63D0\u4EA4 / \u53D1\u5E03\u300D\u524D\uFF0C\u622A\u56FE\u7ED9\u6211\u786E\u8BA4\uFF0C\u7531\u6211\u4EB2\u81EA\u70B9\u63D0\u4EA4\u3002\u5982\u9700\u767B\u5F55\u6216\u9A8C\u8BC1\u7801\uFF0C\u8BF7\u505C\u4E0B\u6765\u8BA9\u6211\u5904\u7406\u3002"),
        "",
        (0, import_i18n4.t)("\u6807\u9898\uFF1A{p0}", { p0: l.title }),
        (0, import_i18n4.t)("\u4EF7\u683C\uFF1A{p0} \u5143", { p0: l.price }),
        (0, import_i18n4.t)("\u89C4\u683C\u4E0E\u5E93\u5B58\uFF1A{p0}", { p0: stock || (0, import_i18n4.t)("\u6309\u540E\u53F0\u9ED8\u8BA4") }),
        (0, import_i18n4.t)("\u5C5E\u6027\uFF1A\u54C1\u7C7B {p0}\uFF0C\u9762\u6599 {p1}\uFF0C\u5B63\u8282 {p2}\uFF0C\u98CE\u683C {p3}\uFF0C\u989C\u8272 {p4}", { p0: g?.category || "\u2014", p1: g?.fabric || "\u2014", p2: g?.season || "\u2014", p3: g?.style || "\u2014", p4: g?.color || "\u2014" }),
        (0, import_i18n4.t)("\u5356\u70B9\uFF1A{p0}", { p0: l.sellingPoints.join("\uFF1B") }),
        (0, import_i18n4.t)("\u8BE6\u60C5\uFF1A{p0}", { p0: l.detail }),
        (0, import_i18n4.t)("\u641C\u7D22\u5173\u952E\u8BCD\uFF1A{p0}", { p0: l.keywords.join((0, import_i18n4.t)("\u3001")) }),
        (0, import_i18n4.t)("\u56FE\u7247\uFF08\u6309\u987A\u5E8F\u4E0A\u4F20\uFF0C\u7B2C\u4E00\u5F20\u4E3A\u4E3B\u56FE\uFF09\uFF1A"),
        ...l.images.map((x, i) => `${i + 1}. ${x}`)
      ].join("\n");
    },
    "rules.handle": (p) => handleRule(p.garmentId, p.action),
    "listing.remove": (p) => {
      store.update((s) => {
        s.listings = s.listings.filter((x) => x.id !== p.id);
      });
      pushState();
      return true;
    },
    "local.shelf": (p) => {
      const svc = (0, import_apparelStore.apparelService)();
      if (!svc) throw new Error((0, import_i18n4.t)("\u670D\u88C5\u5B9E\u4F53\u5E97\u667A\u80FD\u4F53\u672A\u52A0\u8F7D"));
      return svc.saveGarment({ id: p.garmentId, onShelf: !!p.onShelf });
    },
    // D
    "finance.import": (p) => doImport(p.path, p.kind, "manual", !!p.replace),
    "finance.folderImport": () => folderImport(true),
    "finance.clear": (p) => {
      store.updateData((d) => {
        if (p.kind !== "expense") d.sales = [];
        if (p.kind !== "sales") d.expenses = [];
      });
      pushState();
      return true;
    },
    "finance.range": () => {
      const d = store.data();
      const dates = d.sales.map((r) => r.date).sort();
      return { from: dates[0] || "", to: dates[dates.length - 1] || "" };
    },
    "finance.metrics": (p) => computeMetrics(store.data().sales, store.data().expenses, garments(), p.from, p.to),
    "finance.report": async (p) => {
      const period = p.kind === "custom" ? { from: String(p.from || ""), to: String(p.to || "") } : reportPeriod(p.kind);
      if (!period.from || !period.to || period.from > period.to) throw new Error((0, import_i18n4.t)("\u8BF7\u9009\u62E9\u6B63\u786E\u7684\u8D77\u6B62\u65E5\u671F"));
      return buildReport(p.kind, period.from, period.to);
    },
    "finance.reportText": (p) => reportText(requireFound(store.read().reports.find((r) => r.id === p.id), (0, import_i18n4.t)("\u62A5\u8868"))),
    "finance.push": async (p) => {
      const r = requireFound(store.read().reports.find((x) => x.id === p.id), (0, import_i18n4.t)("\u62A5\u8868"));
      const pushed = await pushOutlets((0, import_i18n4.t)("\u7ECF\u8425\u62A5\u8868 {a} ~ {b}", { a: r.metrics.from, b: r.metrics.to }), reportText(r));
      store.update((s) => {
        const x = s.reports.find((y) => y.id === r.id);
        if (x) x.pushed = pushed;
      });
      pushState();
      return pushed;
    },
    "finance.export": (p) => {
      const r = requireFound(store.read().reports.find((x) => x.id === p.id), (0, import_i18n4.t)("\u62A5\u8868"));
      const m = r.metrics;
      const file = (0, import_node_path3.join)(outputDir((0, import_i18n4.t)("\u7ECF\u8425\u62A5\u8868")), `${(0, import_i18n4.t)("\u7ECF\u8425\u62A5\u8868")}-${m.from}_${m.to}.xlsx`);
      (0, import_excel2.writeWorkbook)(file, [
        { name: (0, import_i18n4.t)("\u6C47\u603B"), headers: [(0, import_i18n4.t)("\u6307\u6807"), (0, import_i18n4.t)("\u6570\u503C")], rows: [
          [(0, import_i18n4.t)("\u671F\u95F4"), `${m.from} ~ ${m.to}`],
          [(0, import_i18n4.t)("\u8425\u4E1A\u989D"), m.revenue],
          [(0, import_i18n4.t)("\u9000\u8D27"), m.refunds],
          [(0, import_i18n4.t)("\u51C0\u8425\u4E1A\u989D"), m.netRevenue],
          [(0, import_i18n4.t)("\u9500\u552E\u6210\u672C"), m.cost],
          [(0, import_i18n4.t)("\u6210\u672C\u8986\u76D6\u7387"), m.costCoverage],
          [(0, import_i18n4.t)("\u6BDB\u5229"), m.grossProfit],
          [(0, import_i18n4.t)("\u6BDB\u5229\u7387"), m.grossMargin],
          [(0, import_i18n4.t)("\u8BA2\u5355\u6570"), m.orders],
          [(0, import_i18n4.t)("\u4EF6\u6570"), m.units],
          [(0, import_i18n4.t)("\u5BA2\u5355\u4EF7"), m.avgOrderValue],
          [(0, import_i18n4.t)("\u8FDE\u5E26\u7387"), m.unitsPerOrder],
          [(0, import_i18n4.t)("\u8D39\u7528"), m.expenses],
          [(0, import_i18n4.t)("\u8D39\u7528\u7387"), m.expenseRate],
          [(0, import_i18n4.t)("\u51C0\u5229\u6DA6"), m.netProfit]
        ] },
        { name: (0, import_i18n4.t)("\u6E20\u9053"), headers: [(0, import_i18n4.t)("\u6E20\u9053"), (0, import_i18n4.t)("\u91D1\u989D"), (0, import_i18n4.t)("\u5360\u6BD4")], rows: m.byChannel.map((x) => [x.label, x.value, x.share ?? 0]) },
        { name: (0, import_i18n4.t)("\u54C1\u7C7B"), headers: [(0, import_i18n4.t)("\u54C1\u7C7B"), (0, import_i18n4.t)("\u91D1\u989D"), (0, import_i18n4.t)("\u5360\u6BD4")], rows: m.byCategory.map((x) => [x.label, x.value, x.share ?? 0]) },
        { name: (0, import_i18n4.t)("\u7545\u9500\u6B3E"), headers: [(0, import_i18n4.t)("\u5546\u54C1"), (0, import_i18n4.t)("\u91D1\u989D")], rows: m.topItems.map((x) => [x.label, x.value]) },
        { name: (0, import_i18n4.t)("\u552E\u7F44\u7387"), headers: [(0, import_i18n4.t)("\u5546\u54C1"), (0, import_i18n4.t)("\u552E\u7F44\u7387")], rows: m.sellThrough.map((x) => [x.label, x.value]) },
        { name: (0, import_i18n4.t)("\u7ECF\u8425\u89E3\u8BFB"), headers: [(0, import_i18n4.t)("\u5185\u5BB9")], rows: [...r.commentary.split("\n").map((x) => [x]), ...r.unverified.length ? [[(0, import_i18n4.t)("\u672A\u80FD\u6838\u5BF9\u7684\u6570\u5B57\uFF1A{p0}", { p0: r.unverified.join((0, import_i18n4.t)("\u3001")) })]] : []] }
      ]);
      store.update((s) => {
        const x = s.reports.find((y) => y.id === r.id);
        if (x) x.exportPath = file;
      });
      pushState();
      return file;
    },
    "finance.exportPdf": async (p) => {
      const r = requireFound(store.read().reports.find((x) => x.id === p.id), (0, import_i18n4.t)("\u62A5\u8868"));
      const file = (0, import_node_path3.join)(outputDir((0, import_i18n4.t)("\u7ECF\u8425\u62A5\u8868")), `${(0, import_i18n4.t)("\u7ECF\u8425\u62A5\u8868")}-${r.metrics.from}_${r.metrics.to}.pdf`);
      await (0, import_render.renderHtmlToPdf)(reportHtml(r), file);
      store.update((s) => {
        const x = s.reports.find((y) => y.id === r.id);
        if (x) x.pdfPath = file;
      });
      pushState();
      return file;
    },
    /**
     * 转入财务智能体：按报表期汇总成序时账（含税金额，价税分离与科目请在财务智能体复核），
     * 渲染层再调财务智能体的 data.importJournal 导入 —— 只生成草稿账，不改任何正式账套。
     */
    "finance.toJournal": (p) => {
      const r = requireFound(store.read().reports.find((x) => x.id === p.id), (0, import_i18n4.t)("\u62A5\u8868"));
      const m = r.metrics;
      const d = store.data();
      const exp = /* @__PURE__ */ new Map();
      for (const e of d.expenses.filter((x) => x.date >= m.from && x.date <= m.to)) exp.set(e.item, (exp.get(e.item) || 0) + e.amount);
      const no = `JY-${m.to.replace(/-/g, "")}`;
      const memo = (0, import_i18n4.t)("\u7ECF\u8425\u81EA\u52A8\u5316\u8F6C\u5165 {a}~{b}\uFF08\u542B\u7A0E\uFF0C\u4EF7\u7A0E\u5206\u79BB\u8BF7\u590D\u6838\uFF09", { a: m.from, b: m.to });
      const rows = [
        [m.to, no, memo, "1002", (0, import_i18n4.t)("\u94F6\u884C\u5B58\u6B3E"), m.netRevenue, 0],
        [m.to, no, memo, "6001", (0, import_i18n4.t)("\u4E3B\u8425\u4E1A\u52A1\u6536\u5165"), 0, m.netRevenue]
      ];
      if (m.cost) rows.push([m.to, no, memo, "6401", (0, import_i18n4.t)("\u4E3B\u8425\u4E1A\u52A1\u6210\u672C"), m.cost, 0], [m.to, no, memo, "1405", (0, import_i18n4.t)("\u5E93\u5B58\u5546\u54C1"), 0, m.cost]);
      let k = 1;
      for (const [item, amt] of exp) {
        const n2 = `${no}-${k++}`;
        rows.push([m.to, n2, `${memo} ${item}`, "6601", (0, import_i18n4.t)("\u9500\u552E\u8D39\u7528"), Math.round(amt * 100) / 100, 0], [m.to, n2, `${memo} ${item}`, "1002", (0, import_i18n4.t)("\u94F6\u884C\u5B58\u6B3E"), 0, Math.round(amt * 100) / 100]);
      }
      const file = (0, import_node_path3.join)(outputDir((0, import_i18n4.t)("\u7ECF\u8425\u62A5\u8868")), `${(0, import_i18n4.t)("\u5E8F\u65F6\u8D26")}-${m.from}_${m.to}.xlsx`);
      (0, import_excel2.writeWorkbook)(file, [{ name: (0, import_i18n4.t)("\u5E8F\u65F6\u8D26"), headers: [(0, import_i18n4.t)("\u65E5\u671F"), (0, import_i18n4.t)("\u51ED\u8BC1\u53F7"), (0, import_i18n4.t)("\u6458\u8981"), (0, import_i18n4.t)("\u79D1\u76EE\u7F16\u7801"), (0, import_i18n4.t)("\u79D1\u76EE\u540D\u79F0"), (0, import_i18n4.t)("\u501F\u65B9\u91D1\u989D"), (0, import_i18n4.t)("\u8D37\u65B9\u91D1\u989D")], rows }]);
      return file;
    },
    "finance.ask": async (p) => {
      const q = String(p?.q || "").trim();
      if (!q) throw new Error((0, import_i18n4.t)("\u8BF7\u8F93\u5165\u95EE\u9898"));
      const d = store.data();
      if (!d.sales.length) throw new Error((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u9500\u552E\u6570\u636E\uFF1A\u5148\u5BFC\u5165\u6536\u94F6\u7CFB\u7EDF\u5BFC\u51FA\u7684\u9500\u552E\u660E\u7EC6"));
      const dates = d.sales.map((r) => r.date).sort();
      const last = dates[dates.length - 1];
      const blocks = [
        { title: (0, import_i18n4.t)("\u5168\u90E8\u6570\u636E {a} ~ {b}", { a: dates[0], b: last }), facts: metricsFacts(computeMetrics(d.sales, d.expenses, garments(), dates[0], last)) },
        { title: (0, import_i18n4.t)("\u6700\u8FD1 7 \u5929"), facts: metricsFacts(computeMetrics(d.sales, d.expenses, garments(), shiftDate(last, -6), last)) },
        { title: (0, import_i18n4.t)("\u6700\u8FD1 30 \u5929"), facts: metricsFacts(computeMetrics(d.sales, d.expenses, garments(), shiftDate(last, -29), last)) }
      ];
      const sources = store.read().imports.filter((i) => i.kind !== "inventory").slice(0, 5).map((i) => `${i.file}\uFF08${i.from}~${i.to}\uFF0C${i.rows}\uFF09`);
      const { text, model } = await llm("finance", financeQaPrompt({ question: q, brand: store.read().settings.brandName, blocks, sources }));
      const item = { q, a: text.trim(), model, at: (/* @__PURE__ */ new Date()).toISOString() };
      store.update((s) => {
        s.qa.unshift(item);
      });
      pushState();
      return item;
    }
  };
  import_electron.ipcMain.handle(import_ipc_contracts.IPC_CHANNELS.WORKBENCH_BA_INVOKE, async (_e, req) => {
    const fn = actions[String(req?.action || "")];
    if (!fn) throw new Error((0, import_i18n4.t)("\u672A\u77E5\u64CD\u4F5C\uFF1A{p0}", { p0: String(req?.action || "") }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.("biz-automation", `${req.action} failed`, { error: error?.message });
      throw new Error((0, import_userFacingError.userFacingError)(error));
    }
  });
  return stopBackground;
}

// node_modules/.cache/solutions-build/workbench-biz-automation/entry.main.ts
var hostApi = 2;
var registerFunction = "registerBizAutomationHandlers";
var cleanup;
function activate(ctx) {
  cleanup = registerBizAutomationHandlers(ctx.host.deps);
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
