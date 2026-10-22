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

// node_modules/.cache/solutions-build/workbench-parts-alert/entry.main.ts
var entry_main_exports = {};
__export(entry_main_exports, {
  activate: () => activate,
  hostApi: () => hostApi,
  registerFunction: () => registerFunction
});
module.exports = __toCommonJS(entry_main_exports);

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/ipc/partsAlert.ipc.ts
var import_electron = require("electron");
var import_node_fs6 = require("node:fs");
var import_node_path6 = require("node:path");
var import_ipc_contracts3 = require("npm:@totalclaw/ipc-contracts");
var import_i18n4 = require("npm:@totalclaw/i18n");
var import_userFacingError = require("host:apps/desktop-shell/src/main/utils/userFacingError.ts");
var import_quitRegistry = require("host:apps/desktop-shell/src/main/util/quitRegistry.ts");

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/calc.ts
var import_i18n = require("npm:@totalclaw/i18n");
var DEFAULT_PARAMS = {
  safetyDays: 15,
  reviewDays: 30,
  redundantMonths: 6,
  stagnantMonths: 12,
  scrapMonths: 24,
  defaultLeadDays: 30,
  seasonal: true
};
var DAY = 864e5;
var DAYS_PER_MONTH = 30;
function parseDay(s) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s || "").trim());
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
function fmtDay(t) {
  if (!Number.isFinite(t)) return "";
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function monthIndex(month) {
  const m = /^(\d{4})-(\d{1,2})/.exec(String(month || "").trim());
  return m ? Number(m[1]) * 12 + (Number(m[2]) - 1) : NaN;
}
function monthOfIndex(i) {
  return `${Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, "0")}`;
}
function round(n, digits = 2) {
  const k = 10 ** digits;
  return Math.round(n * k) / k;
}
function avg(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
function forecastDailyDemand(byMonth, asOfMonthIdx, seasonal) {
  const last = (n) => {
    const out = [];
    for (let i = 1; i <= n; i += 1) out.push(byMonth.get(asOfMonthIdx - i) ?? 0);
    return out;
  };
  const a3 = avg(last(3));
  const a6 = avg(last(6));
  const a12 = avg(last(12));
  const base = a3 * 0.5 + a6 * 0.3 + a12 * 0.2;
  let seasonFactor2 = 1;
  const months = [...byMonth.keys()];
  const earliest = months.length ? Math.min(...months) : NaN;
  if (seasonal && Number.isFinite(earliest) && asOfMonthIdx - earliest >= 24 && a12 > 0) {
    const lastYearSame = byMonth.get(asOfMonthIdx - 12) ?? 0;
    const lastYearNext = byMonth.get(asOfMonthIdx - 11) ?? 0;
    const prevYearAvg = avg(Array.from({ length: 12 }, (_, i) => byMonth.get(asOfMonthIdx - 13 - i + 1) ?? 0));
    if (prevYearAvg > 0) seasonFactor2 = Math.min(2, Math.max(0.5, (lastYearSame + lastYearNext) / 2 / prevYearAvg));
  }
  const monthly = base * seasonFactor2;
  const daily = monthly / DAYS_PER_MONTH;
  const basis = (0, import_i18n.t)("\u6708\u5747\u9700\u6C42 = (\u8FD13\u6708\u5747 {p0} \xD7 0.5 + \u8FD16\u6708\u5747 {p1} \xD7 0.3 + \u8FD112\u6708\u5747 {p2} \xD7 0.2)", { p0: round(a3), p1: round(a6), p2: round(a12) }) + (0, import_i18n.t)("{p0} = {p1}\uFF1B\u65E5\u5747 = {p2}", { p0: seasonFactor2 !== 1 ? ` \xD7 \u5B63\u8282\u7CFB\u6570 ${round(seasonFactor2)}` : "", p1: round(monthly), p2: round(daily, 3) });
  return { daily, base, seasonFactor: seasonFactor2, basis };
}
function projectStockout(stockQty, dailyDemand, arrivals, asOf, horizonDays) {
  if (dailyDemand <= 0) return NaN;
  const sorted = [...arrivals].filter((a) => a.qty > 0).sort((a, b) => a.day - b.day);
  let level = stockQty;
  let idx = 0;
  while (idx < sorted.length && sorted[idx].day <= asOf) {
    level += sorted[idx].qty;
    idx += 1;
  }
  if (level <= 0) return asOf;
  let cursor = asOf;
  while (cursor - asOf <= horizonDays * DAY) {
    const nextArrival = idx < sorted.length ? sorted[idx].day : Infinity;
    const daysToEmpty = level / dailyDemand;
    const emptyAt = cursor + Math.ceil(daysToEmpty) * DAY;
    if (emptyAt <= nextArrival) {
      return emptyAt - asOf <= horizonDays * DAY ? emptyAt : NaN;
    }
    level -= (nextArrival - cursor) / DAY * dailyDemand;
    level += sorted[idx].qty;
    cursor = nextArrival;
    idx += 1;
  }
  return NaN;
}
function normNo(s) {
  return String(s ?? "").trim();
}
function computePartsAlert(input, params) {
  const asOf = parseDay(params.asOf);
  if (!Number.isFinite(asOf)) throw new Error((0, import_i18n.t)("\u8FD0\u7B97\u57FA\u51C6\u65E5\u683C\u5F0F\u4E0D\u5BF9\uFF1A{p0}", { p0: params.asOf }));
  const asOfMonthIdx = monthIndex(params.asOf);
  const names = /* @__PURE__ */ new Map();
  const monthlyBy = /* @__PURE__ */ new Map();
  for (const r of input.monthly) {
    const no = normNo(r.partNo);
    const mi = monthIndex(r.month);
    if (!no || !Number.isFinite(mi)) continue;
    if (r.partName && !names.has(no)) names.set(no, r.partName);
    const m = monthlyBy.get(no) ?? /* @__PURE__ */ new Map();
    m.set(mi, (m.get(mi) ?? 0) + (Number(r.qty) || 0));
    monthlyBy.set(no, m);
  }
  const yearlyBy = /* @__PURE__ */ new Map();
  for (const r of input.yearly) {
    const no = normNo(r.partNo);
    if (!no || !Number.isFinite(Number(r.year))) continue;
    if (r.partName && !names.has(no)) names.set(no, r.partName);
    const m = yearlyBy.get(no) ?? /* @__PURE__ */ new Map();
    m.set(Number(r.year), (m.get(Number(r.year)) ?? 0) + (Number(r.qty) || 0));
    yearlyBy.set(no, m);
  }
  const leadBy = /* @__PURE__ */ new Map();
  for (const r of input.leadTimes) {
    const no = normNo(r.partNo);
    if (no) leadBy.set(no, r);
  }
  const transitBy = /* @__PURE__ */ new Map();
  for (const r of input.inTransit) {
    const no = normNo(r.partNo);
    if (!no || !(Number(r.qty) > 0)) continue;
    transitBy.set(no, [...transitBy.get(no) ?? [], r]);
  }
  const stockBy = /* @__PURE__ */ new Map();
  for (const r of input.stock) {
    const no = normNo(r.partNo);
    if (!no) continue;
    if (r.partName && !names.has(no)) names.set(no, r.partName);
    const cur = stockBy.get(no) ?? { qty: 0 };
    stockBy.set(no, { qty: cur.qty + (Number(r.qty) || 0), unitPrice: r.unitPrice ?? cur.unitPrice });
  }
  const allParts = /* @__PURE__ */ new Set([...stockBy.keys(), ...monthlyBy.keys(), ...transitBy.keys()]);
  const partsWithoutStockRow = [];
  const partsWithDefaultLead = [];
  const results = [];
  for (const partNo of [...allParts].sort()) {
    const basis = [];
    const stockRow = stockBy.get(partNo);
    if (!stockRow) partsWithoutStockRow.push(partNo);
    const stockQty = stockRow?.qty ?? 0;
    const lead = leadBy.get(partNo);
    const leadDaysDefaulted = !(lead && Number(lead.days) > 0);
    const leadDays = leadDaysDefaulted ? params.defaultLeadDays : Number(lead.days);
    if (leadDaysDefaulted) partsWithDefaultLead.push(partNo);
    const unitPrice = stockRow?.unitPrice ?? lead?.unitPrice;
    const byMonth = monthlyBy.get(partNo) ?? /* @__PURE__ */ new Map();
    const fc = forecastDailyDemand(byMonth, asOfMonthIdx, params.seasonal);
    const dailyDemand = fc.daily;
    basis.push(fc.basis);
    const shippedMonths = [...byMonth.entries()].filter(([mi, q]) => q > 0 && mi <= asOfMonthIdx).map(([mi]) => mi);
    const lastIdx = shippedMonths.length ? Math.max(...shippedMonths) : NaN;
    const lastShipMonth = Number.isFinite(lastIdx) ? monthOfIndex(lastIdx) : "";
    const monthsSinceLastShip = Number.isFinite(lastIdx) ? asOfMonthIdx - lastIdx : null;
    const byYear = yearlyBy.get(partNo);
    let yearlyTrend = null;
    if (byYear) {
      const asOfYear = Math.floor(asOfMonthIdx / 12);
      const y1 = byYear.get(asOfYear - 1);
      const y2 = byYear.get(asOfYear - 2);
      if (y1 !== void 0 && y2 !== void 0 && y2 > 0) yearlyTrend = round(y1 / y2 - 1, 4);
    }
    const transits = transitBy.get(partNo) ?? [];
    const inTransitQty = transits.reduce((a, r) => a + Number(r.qty), 0);
    const arrivals = transits.map((r) => {
      const eta = r.eta ? parseDay(r.eta) : NaN;
      return { day: Number.isFinite(eta) ? eta : asOf + leadDays * DAY, qty: Number(r.qty), assumed: !Number.isFinite(eta) };
    });
    const etaDays = arrivals.map((a) => a.day);
    const earliestEta = etaDays.length ? fmtDay(Math.min(...etaDays)) : "";
    const earliestAssumed = arrivals.length > 0 && [...arrivals].sort((a, b) => a.day - b.day)[0].assumed;
    const etaNote = earliestAssumed ? (0, import_i18n.t)("\uFF08\u8BA2\u5355\u6CA1\u6709\u9884\u8BA1\u56DE\u8D27\u65F6\u95F4\uFF0C\u6309\u63D0\u524D\u671F\u63A8\u7B97\uFF09") : "";
    const hasInTransit = inTransitQty > 0;
    const coverDays = dailyDemand > 0 ? stockQty / dailyDemand : null;
    const riskWindow = leadDays + params.safetyDays;
    const horizon = Math.max(riskWindow, params.redundantMonths * DAYS_PER_MONTH) + 365;
    const stockoutAt = projectStockout(stockQty, dailyDemand, arrivals, asOf, horizon);
    const stockoutDate = Number.isFinite(stockoutAt) ? fmtDay(stockoutAt) : "";
    const latestOrderAt = Number.isFinite(stockoutAt) ? Math.max(asOf, stockoutAt - leadDays * DAY) : NaN;
    const noRecentShip = monthsSinceLastShip === null || monthsSinceLastShip >= params.stagnantMonths;
    let state;
    if (stockQty <= 0 && dailyDemand > 0) {
      state = "out_of_stock";
      basis.push((0, import_i18n.t)("\u73B0\u6709\u5E93\u5B58 {stockQty}\uFF0C\u65E5\u5747\u9700\u6C42 {p0} > 0 \u2192 \u5DF2\u7F3A\u8D27", { stockQty, p0: round(dailyDemand, 3) }));
    } else if (stockQty > 0 && (noRecentShip || dailyDemand <= 0)) {
      state = "stagnant";
      basis.push(monthsSinceLastShip === null ? (0, import_i18n.t)("\u6709\u5E93\u5B58 {stockQty}\uFF0C\u8FD1 3 \u5E74\u6CA1\u6709\u53D1\u8D27\u8BB0\u5F55 \u2192 \u5446\u6EDE", { stockQty }) : (0, import_i18n.t)("\u6709\u5E93\u5B58 {stockQty}\uFF0C\u6700\u8FD1\u4E00\u6B21\u53D1\u8D27\u5728 {lastShipMonth}\uFF0C\u5DF2 {monthsSinceLastShip} \u4E2A\u6708\u6CA1\u6709\u53D1\u8D27\uFF08\u9608\u503C {p0} \u4E2A\u6708\uFF09\u2192 \u5446\u6EDE", { stockQty, lastShipMonth, monthsSinceLastShip, p0: params.stagnantMonths }));
    } else if (dailyDemand > 0 && Number.isFinite(stockoutAt) && stockoutAt - asOf <= riskWindow * DAY) {
      state = "at_risk";
      basis.push((0, import_i18n.t)("\u6309\u73B0\u6709\u5E93\u5B58\u548C\u5728\u9014\u5230\u8D27\u63A8\u7B97\uFF0C{stockoutDate} \u65AD\u8D27\uFF0C\u8DDD\u4ECA {p0} \u5929\uFF0C", { stockoutDate, p0: Math.round((stockoutAt - asOf) / DAY) }) + (0, import_i18n.t)("\u4E0D\u8D85\u8FC7 \u63D0\u524D\u671F {leadDays} \u5929 + \u5B89\u5168\u5929\u6570 {p0} \u5929 = {riskWindow} \u5929 \u2192 \u5C06\u7F3A\u8D27", { leadDays, p0: params.safetyDays, riskWindow }));
    } else if (coverDays !== null && coverDays > params.redundantMonths * DAYS_PER_MONTH) {
      state = "redundant";
      basis.push((0, import_i18n.t)("\u5E93\u5B58\u53EF\u7528 {p0} \u5929\uFF0C\u8D85\u8FC7 {p1} \u4E2A\u6708\uFF08{p2} \u5929\uFF09\u2192 \u5197\u4F59", { p0: Math.round(coverDays), p1: params.redundantMonths, p2: params.redundantMonths * DAYS_PER_MONTH }));
    } else {
      state = "healthy";
      basis.push(coverDays === null ? (0, import_i18n.t)("\u6CA1\u6709\u5E93\u5B58\u4E5F\u6CA1\u6709\u9700\u6C42 \u2192 \u4E0D\u9700\u8981\u5904\u7406") : coverDays < riskWindow && hasInTransit ? (0, import_i18n.t)("\u73B0\u6709\u5E93\u5B58\u53EA\u591F {p0} \u5929\uFF0C\u4F46\u5728\u9014 {p1} \u4F1A\u5728\u65AD\u8D27\u524D\u5230\u8D27\uFF0C\u63A8\u7B97{p2}\uFF0C\u8D85\u51FA\u98CE\u9669\u7A97\u53E3 {riskWindow} \u5929 \u2192 \u5065\u5EB7", {
        p0: Math.round(coverDays),
        p1: inTransitQty,
        riskWindow,
        p2: stockoutDate ? (0, import_i18n.t)("\u5230 {p0} \u624D\u65AD\u8D27", { p0: stockoutDate }) : (0, import_i18n.t)("\u671F\u5185\u4E0D\u4F1A\u65AD\u8D27")
      }) : (0, import_i18n.t)("\u5E93\u5B58\u53EF\u7528 {p0} \u5929\uFF0C\u5728 {riskWindow} \u5929\u5230 {p1} \u5929\u4E4B\u95F4 \u2192 \u5065\u5EB7", { p0: Math.round(coverDays), riskWindow, p1: params.redundantMonths * DAYS_PER_MONTH }));
      if (yearlyTrend !== null) {
        basis.push((0, import_i18n.t)("\u5E74\u5EA6\u8D8B\u52BF\uFF1A\u4E0A\u4E00\u5E74\u53D1\u8D27\u91CF\u6BD4\u524D\u4E00\u5E74{p0} {p1}%\uFF08\u4EC5\u4F9B\u53C2\u8003\uFF0C\u4E0D\u8FDB\u5165\u9884\u6D4B\uFF09", { p0: yearlyTrend >= 0 ? (0, import_i18n.t)("\u589E\u52A0") : (0, import_i18n.t)("\u51CF\u5C11"), p1: Math.abs(Math.round(yearlyTrend * 1e3) / 10) }));
      }
    }
    let suggestQty = 0;
    if (state === "at_risk" || state === "out_of_stock") {
      const target = dailyDemand * (leadDays + params.reviewDays + params.safetyDays);
      const raw = Math.ceil(target - Math.max(0, stockQty) - inTransitQty);
      suggestQty = Math.max(0, raw);
      const moq = Number(lead?.moq) > 0 ? Number(lead.moq) : 0;
      if (suggestQty > 0 && moq > 0) suggestQty = Math.ceil(suggestQty / moq) * moq;
      basis.push((0, import_i18n.t)("\u76EE\u6807\u5E93\u5B58 = \u65E5\u5747 {p0} \xD7 (\u63D0\u524D\u671F {leadDays} + \u8865\u8D27\u5468\u671F {p1} + \u5B89\u5168\u5929\u6570 {p2}) = {p3}\uFF1B", { p0: round(dailyDemand, 3), leadDays, p1: params.reviewDays, p2: params.safetyDays, p3: Math.ceil(target) }) + (0, import_i18n.t)("\u5EFA\u8BAE\u8865\u5E93 = \u76EE\u6807 {p0} \u2212 \u5E93\u5B58 {p1} \u2212 \u5728\u9014 {inTransitQty} = {p2}", { p0: Math.ceil(target), p1: Math.max(0, stockQty), inTransitQty, p2: Math.max(0, raw) }) + `${moq > 0 && suggestQty !== Math.max(0, raw) ? (0, import_i18n.t)("\uFF0C\u6309\u6700\u5C0F\u8D77\u8BA2\u91CF {moq} \u53D6\u6574\u4E3A {suggestQty}", { moq, suggestQty }) : ""}`);
    }
    const suggestAmount = suggestQty > 0 && Number(unitPrice) > 0 ? round(suggestQty * Number(unitPrice)) : null;
    const actions = [];
    if (state === "stagnant") {
      actions.push({ kind: "stop_purchase", text: (0, import_i18n.t)("\u505C\u6B62\u91C7\u8D2D\uFF0C\u4ECE\u8865\u8D27\u8BA1\u5212\u4E2D\u79FB\u51FA") });
      if (hasInTransit) actions.push({ kind: "cancel_in_transit", text: (0, import_i18n.t)("\u8FD8\u6709\u5728\u9014 {inTransitQty}\uFF0C\u4E0E\u4F9B\u5E94\u5546\u534F\u5546\u53D6\u6D88\u6216\u5EF6\u671F", { inTransitQty }) });
      actions.push({ kind: "transfer_out", text: (0, import_i18n.t)("\u5411\u4ECD\u6709\u9700\u6C42\u7684\u4ED3\u5E93\u6216\u7F51\u70B9\u8C03\u62E8\u6D88\u5316") });
      if (monthsSinceLastShip === null || monthsSinceLastShip >= params.scrapMonths) {
        actions.push({ kind: "scrap_review", text: (0, import_i18n.t)("\u5DF2\u8D85\u8FC7 {p0} \u4E2A\u6708\u6CA1\u6709\u53D1\u8D27\uFF0C\u63D0\u4EA4\u62A5\u5E9F\u8BC4\u4F30", { p0: params.scrapMonths }) });
      }
    } else if (state === "redundant") {
      const excess = Math.floor(stockQty - dailyDemand * params.redundantMonths * DAYS_PER_MONTH);
      actions.push({ kind: "pause_replenish", text: (0, import_i18n.t)("\u6682\u505C\u8865\u8D27\uFF1B\u8D85\u51FA {p0} \u4E2A\u6708\u7528\u91CF\u7684\u90E8\u5206\u7EA6 {excess}", { p0: params.redundantMonths, excess }) });
      if (hasInTransit) actions.push({ kind: "defer_in_transit", text: (0, import_i18n.t)("\u8FD8\u6709\u5728\u9014 {inTransitQty}\uFF0C\u4E0E\u4F9B\u5E94\u5546\u534F\u5546\u5EF6\u671F\u4EA4\u8D27", { inTransitQty }) });
    } else if (state === "at_risk" || state === "out_of_stock") {
      if (hasInTransit) {
        const firstEta = Math.min(...etaDays);
        const gapDays = Number.isFinite(stockoutAt) ? Math.round((firstEta - stockoutAt) / DAY) : 0;
        if (state === "out_of_stock" || gapDays > 0) {
          actions.push({ kind: "expedite", text: (0, import_i18n.t)("\u5728\u9014\u6700\u65E9 {earliestEta} \u5230\u8D27{etaNote}\uFF0C{p0}\uFF0C\u50AC\u4EA4\u5E76\u8981\u6C42\u52A0\u6025\u6216\u5206\u6279\u5148\u53D1", { earliestEta, etaNote, p0: state === "out_of_stock" ? (0, import_i18n.t)("\u76EE\u524D\u5DF2\u65AD\u8D27") : (0, import_i18n.t)("\u6BD4\u65AD\u8D27\u65E5\u665A {p0} \u5929", { p0: gapDays }) }) });
          actions.push({ kind: "transfer_in", text: (0, import_i18n.t)("\u5230\u8D27\u524D\u4ECE\u5176\u4ED6\u4ED3\u5E93\u8C03\u62E8\u5E94\u6025") });
        } else {
          actions.push({ kind: "expedite", text: (0, import_i18n.t)("\u5728\u9014\u6700\u65E9 {earliestEta} \u5230\u8D27{etaNote}\uFF0C\u8DDF\u8FDB\u786E\u4FDD\u6309\u671F\u5230\u8D27", { earliestEta, etaNote }) });
        }
        if (suggestQty > 0) actions.push({ kind: "top_up_order", text: (0, import_i18n.t)("\u5728\u9014\u91CF\u4E0D\u591F\u8986\u76D6\uFF0C\u8FFD\u52A0\u8865\u5E93 {suggestQty}", { suggestQty }) });
      } else {
        actions.push({ kind: "place_order", text: (0, import_i18n.t)("\u6CA1\u6709\u91C7\u8D2D\u5728\u9014\uFF0C{p0}\u4E0B\u5355\u8865\u5E93 {suggestQty}", { p0: Number.isFinite(latestOrderAt) && latestOrderAt > asOf ? `\u6700\u8FDF ${fmtDay(latestOrderAt)} \u524D` : "\u7ACB\u5373", suggestQty }) });
        actions.push({ kind: "transfer_in", text: (0, import_i18n.t)("\u5230\u8D27\u524D\u4ECE\u5176\u4ED6\u4ED3\u5E93\u8C03\u62E8\uFF0C\u6216\u542F\u7528\u66FF\u4EE3\u4EF6") });
      }
      if (state === "out_of_stock") actions.push({ kind: "backorder_notice", text: (0, import_i18n.t)("\u901A\u77E5\u670D\u52A1\u7F51\u70B9\u8BE5\u914D\u4EF6\u7F3A\u8D27\u53CA\u9884\u8BA1\u5230\u8D27\u65F6\u95F4\uFF0C\u767B\u8BB0\u6B20\u4EF6\u5DE5\u5355") });
    }
    if (state === "healthy" && dailyDemand <= 0 && hasInTransit) {
      basis.push((0, import_i18n.t)("\u8FD9\u4E2A\u914D\u4EF6\u6CA1\u6709\u9700\u6C42\uFF0C\u5374\u8FD8\u6709\u5728\u9014 {p0}", { p0: inTransitQty }));
      actions.push({ kind: "cancel_in_transit", text: (0, import_i18n.t)("\u6CA1\u6709\u9700\u6C42\u5374\u8FD8\u6709\u5728\u9014 {p0}\uFF0C\u4E0E\u4F9B\u5E94\u5546\u6838\u5BF9\u662F\u5426\u53D6\u6D88", { p0: inTransitQty }) });
    }
    results.push({
      partNo,
      partName: names.get(partNo) ?? "",
      state,
      stockQty,
      inTransitQty,
      earliestEta,
      leadDays,
      leadDaysDefaulted,
      dailyDemand: round(dailyDemand, 3),
      monthlyDemand: round(dailyDemand * DAYS_PER_MONTH),
      coverDays: coverDays === null ? null : round(coverDays, 1),
      lastShipMonth,
      monthsSinceLastShip,
      stockoutDate,
      latestOrderDate: Number.isFinite(latestOrderAt) ? fmtDay(latestOrderAt) : "",
      yearlyTrend,
      hasInTransit,
      actions,
      suggestQty,
      suggestAmount,
      basis
    });
  }
  const byState = { stagnant: 0, redundant: 0, healthy: 0, at_risk: 0, out_of_stock: 0 };
  for (const r of results) byState[r.state] += 1;
  const repl = results.filter((r) => r.suggestQty > 0);
  return {
    results,
    summary: {
      asOf: params.asOf,
      total: results.length,
      byState,
      replenishParts: repl.length,
      replenishQty: repl.reduce((a, r) => a + r.suggestQty, 0),
      replenishAmount: round(repl.reduce((a, r) => a + (r.suggestAmount ?? 0), 0)),
      partsWithoutStockRow,
      partsWithDefaultLead
    }
  };
}

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/ingest.ts
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_i18n2 = require("npm:@totalclaw/i18n");
var import_ipc_contracts = require("npm:@totalclaw/ipc-contracts");
var import_excel = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/columnKeywords.json
var columnKeywords_default = {
  columns: {
    partNo: ["\u914D\u4EF6\u7F16\u7801", "\u7269\u6599\u7F16\u7801", "\u914D\u4EF6\u4EE3\u7801", "\u7269\u6599\u4EE3\u7801", "\u914D\u4EF6\u7F16\u53F7", "\u7269\u6599\u7F16\u53F7", "\u5B58\u8D27\u7F16\u7801", "\u5546\u54C1\u7F16\u7801", "\u4EA7\u54C1\u7F16\u7801", "\u914D\u4EF6\u53F7", "\u7269\u6599\u53F7", "\u6599\u53F7", "\u7F16\u7801", "sku", "part no", "partno", "part number", "item code", "material"],
    partName: ["\u914D\u4EF6\u540D\u79F0", "\u7269\u6599\u540D\u79F0", "\u7269\u6599\u63CF\u8FF0", "\u5B58\u8D27\u540D\u79F0", "\u5546\u54C1\u540D\u79F0", "\u4EA7\u54C1\u540D\u79F0", "\u54C1\u540D", "\u540D\u79F0", "\u63CF\u8FF0", "part name", "description"],
    month: ["\u53D1\u8D27\u6708\u4EFD", "\u51FA\u5E93\u6708\u4EFD", "\u7EDF\u8BA1\u6708\u4EFD", "\u5E74\u6708", "\u6708\u4EFD", "\u671F\u95F4", "\u6708\u5EA6", "\u53D1\u8D27\u65E5\u671F", "\u51FA\u5E93\u65E5\u671F", "month", "period"],
    year: ["\u53D1\u8D27\u5E74\u4EFD", "\u7EDF\u8BA1\u5E74\u4EFD", "\u5E74\u4EFD", "\u5E74\u5EA6", "year"],
    shipQty: ["\u53D1\u8D27\u6570\u91CF", "\u51FA\u5E93\u6570\u91CF", "\u9500\u552E\u6570\u91CF", "\u53D1\u8D27\u91CF", "\u51FA\u5E93\u91CF", "\u9500\u91CF", "\u7528\u91CF", "\u6D88\u8017\u6570\u91CF", "\u6570\u91CF", "qty", "quantity"],
    leadDays: ["\u5E73\u5747\u91C7\u8D2D\u5929\u6570", "\u91C7\u8D2D\u63D0\u524D\u671F", "\u5E73\u5747\u63D0\u524D\u671F", "\u63D0\u524D\u671F", "\u91C7\u8D2D\u5468\u671F", "\u91C7\u8D2D\u5929\u6570", "\u4EA4\u8D27\u5468\u671F", "\u4EA4\u671F", "\u5230\u8D27\u5929\u6570", "lead time", "leadtime", "lead days"],
    moq: ["\u6700\u5C0F\u8D77\u8BA2\u91CF", "\u6700\u5C0F\u8BA2\u8D2D\u91CF", "\u6700\u5C0F\u91C7\u8D2D\u91CF", "\u6700\u5C0F\u5305\u88C5\u91CF", "\u8D77\u8BA2\u91CF", "moq"],
    unitPrice: ["\u91C7\u8D2D\u5355\u4EF7", "\u542B\u7A0E\u5355\u4EF7", "\u53C2\u8003\u5355\u4EF7", "\u6700\u65B0\u5355\u4EF7", "\u6210\u672C\u5355\u4EF7", "\u5355\u4EF7", "\u6210\u672C\u4EF7", "\u91C7\u8D2D\u4EF7", "price", "cost"],
    orderNo: ["\u91C7\u8D2D\u8BA2\u5355\u53F7", "\u91C7\u8D2D\u5355\u53F7", "\u8BA2\u5355\u7F16\u53F7", "\u8BA2\u5355\u53F7", "\u5355\u636E\u7F16\u53F7", "\u5355\u53F7", "po"],
    transitQty: ["\u5728\u9014\u6570\u91CF", "\u672A\u5230\u8D27\u6570\u91CF", "\u672A\u4EA4\u6570\u91CF", "\u672A\u5165\u5E93\u6570\u91CF", "\u672A\u6E05\u6570\u91CF", "\u5728\u9014\u91CF", "\u672A\u5230\u8D27\u91CF", "\u5269\u4F59\u6570\u91CF", "\u8BA2\u5355\u6570\u91CF", "\u91C7\u8D2D\u6570\u91CF", "\u6570\u91CF", "open qty", "qty"],
    eta: ["\u9884\u8BA1\u5230\u8D27\u65E5\u671F", "\u9884\u8BA1\u56DE\u8D27\u65F6\u95F4", "\u9884\u8BA1\u56DE\u8D27\u65E5\u671F", "\u9884\u8BA1\u5230\u8D27\u65F6\u95F4", "\u9884\u8BA1\u4EA4\u8D27\u65E5\u671F", "\u9884\u8BA1\u5230\u8D27", "\u9884\u8BA1\u56DE\u8D27", "\u627F\u8BFA\u4EA4\u671F", "\u4EA4\u8D27\u65E5\u671F", "\u5230\u8D27\u65E5\u671F", "\u4EA4\u671F", "eta"],
    supplier: ["\u4F9B\u5E94\u5546\u540D\u79F0", "\u4F9B\u5E94\u5546", "\u4F9B\u8D27\u5546", "\u5382\u5546", "supplier", "vendor"],
    stockQty: ["\u5E93\u5B58\u6570\u91CF", "\u73B0\u6709\u5E93\u5B58", "\u5B9E\u65F6\u5E93\u5B58", "\u53EF\u7528\u5E93\u5B58", "\u7ED3\u5B58\u6570\u91CF", "\u73B0\u5B58\u91CF", "\u5E93\u5B58\u91CF", "\u5728\u5E93\u6570\u91CF", "\u7ED3\u5B58", "\u5E93\u5B58", "\u6570\u91CF", "on hand", "stock", "qty"],
    warehouse: ["\u4ED3\u5E93\u540D\u79F0", "\u4ED3\u5E93", "\u5E93\u623F", "\u4ED3\u522B", "\u5E93\u4F4D", "warehouse"]
  },
  avoid: {
    partNo: ["\u4F9B\u5E94\u5546", "\u4ED3\u5E93", "\u8BA2\u5355", "\u5355\u636E", "\u5BA2\u6237"],
    partName: ["\u4F9B\u5E94\u5546", "\u4ED3\u5E93", "\u5BA2\u6237"],
    shipQty: ["\u5728\u9014", "\u5E93\u5B58", "\u91D1\u989D", "\u5355\u4EF7"],
    transitQty: ["\u5DF2\u5230\u8D27", "\u5DF2\u5165\u5E93", "\u5DF2\u4EA4", "\u91D1\u989D", "\u5355\u4EF7", "\u8D77\u8BA2"],
    stockQty: ["\u5728\u9014", "\u5B89\u5168", "\u6700\u9AD8", "\u6700\u4F4E", "\u91D1\u989D", "\u5355\u4EF7", "\u8D77\u8BA2"],
    eta: ["\u4E0B\u5355", "\u8BA2\u5355\u65E5\u671F", "\u5236\u5355", "\u521B\u5EFA"],
    unitPrice: ["\u91D1\u989D"]
  },
  totalRowMarks: ["\u5408\u8BA1", "\u603B\u8BA1", "\u5C0F\u8BA1", "\u6C47\u603B", "total", "subtotal"],
  periodHeaderNoise: ["\u53D1\u8D27\u6570\u91CF", "\u51FA\u5E93\u6570\u91CF", "\u53D1\u8D27\u91CF", "\u51FA\u5E93\u91CF", "\u53D1\u8D27", "\u51FA\u5E93", "\u9500\u91CF", "\u6570\u91CF", "\u5408\u8BA1"],
  fileKeywords: {
    monthly: ["\u6309\u6708", "\u6708\u5EA6", "\u53D1\u8D27", "\u51FA\u5E93"],
    yearly: ["\u6309\u5E74", "\u5E74\u5EA6"],
    leadTime: ["\u63D0\u524D\u671F", "\u91C7\u8D2D\u5468\u671F", "\u91C7\u8D2D\u5929\u6570"],
    inTransit: ["\u5728\u9014", "\u672A\u5230\u8D27"],
    stock: ["\u5E93\u5B58", "\u7ED3\u5B58"]
  }
};

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/ingest.ts
var COLUMNS = columnKeywords_default.columns;
var AVOID = columnKeywords_default.avoid;
var MAX_SKIPPED_KEPT = 50;
var norm = (s) => String(s ?? "").replace(/\s+/g, "").toLowerCase();
function parseCsv(text) {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] || "";
  const count = (ch) => firstLine.split(ch).length - 1;
  const delim = count("	") > count(",") && count("	") >= count(";") ? "	" : count(";") > count(",") ? ";" : ",";
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i += 1;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
function decodeText(buf) {
  const utf8 = buf.toString("utf-8");
  if (!utf8.includes("\uFFFD")) return utf8;
  try {
    return new TextDecoder("gb18030").decode(buf);
  } catch {
    return utf8;
  }
}
function readCsvTable(path) {
  const aoa = parseCsv(decodeText((0, import_node_fs.readFileSync)(path))).map((r) => r.map((c) => c.trim())).filter((r) => r.some((c) => c !== ""));
  const out = { path, fileName: (0, import_node_path.basename)(path), sheetName: "", headers: [], rows: [] };
  if (!aoa.length) return out;
  const headerIdx = (0, import_excel.detectHeaderRow)(aoa);
  const seen = /* @__PURE__ */ new Map();
  out.headers = aoa[headerIdx].map((h, i) => {
    let name = h || (0, import_i18n2.t)("\u5217{p0}", { p0: i + 1 });
    const n = seen.get(name) || 0;
    seen.set(name, n + 1);
    if (n > 0) name = `${name}(${n + 1})`;
    return name;
  });
  for (const line of aoa.slice(headerIdx + 1)) out.rows.push(Object.fromEntries(out.headers.map((h, i) => [h, line[i] ?? ""])));
  return out;
}
function readDataTable(path, sheet) {
  if ((0, import_node_path.extname)(path).toLowerCase() === ".csv") return { table: readCsvTable(path), sheetNames: [] };
  return { table: (0, import_excel.readTable)(path, sheet ? { sheetName: sheet } : {}), sheetNames: (0, import_excel.listSheetNames)(path) };
}
function parseNum(v) {
  const s = String(v ?? "").replace(/[,，\s]/g, "");
  if (!s) return null;
  const m = /^[¥￥]?(-?\d+(?:\.\d+)?)[^\d.]*$/.exec(s);
  return m ? Number(m[1]) : NaN;
}
var validYear = (y) => y >= 1990 && y <= 2100;
var pad2 = (n) => String(n).padStart(2, "0");
function parseMonth(v) {
  const s = String(v ?? "").trim();
  let m = /^(\d{4})\s*[-/.年]\s*(\d{1,2})(?!\d)/.exec(s);
  if (!m) m = /^(\d{4})(\d{2})(?:\d{2})?$/.exec(s);
  if (!m) return "";
  const y = Number(m[1]);
  const mo = Number(m[2]);
  return validYear(y) && mo >= 1 && mo <= 12 ? `${y}-${pad2(mo)}` : "";
}
function parseDate(v) {
  const s = String(v ?? "").trim();
  let m = /^(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})(?!\d)/.exec(s);
  if (!m) m = /^(\d{4})(\d{2})(\d{2})$/.exec(s);
  if (!m) return "";
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!validYear(y) || mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (t.getUTCMonth() !== mo - 1) return "";
  return `${y}-${pad2(mo)}-${pad2(d)}`;
}
function parseYear(v) {
  const m = /^(\d{4})(?!\d)/.exec(String(v ?? "").trim());
  if (!m) return null;
  const y = Number(m[1]);
  return validYear(y) ? y : null;
}
function stripNoise(header) {
  let s = norm(header);
  for (const w of columnKeywords_default.periodHeaderNoise) s = s.split(norm(w)).join("");
  return s.replace(/[()（）_]/g, "");
}
function monthOfHeader(header) {
  const s = stripNoise(header);
  if (/^\d{4}[-/.年]\d{1,2}月?$/.test(s) || /^\d{6}$/.test(s) || /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(s)) return parseMonth(s);
  return "";
}
function yearOfHeader(header) {
  const m = /^(\d{4})年?度?$/.exec(stripNoise(header));
  return m && validYear(Number(m[1])) && Number(m[1]) >= 2e3 ? m[1] : "";
}
function detectColumn(headers, role, used) {
  const base = headers.filter((h) => !used.includes(h));
  const avoid = (AVOID[role] || []).map(norm);
  const preferred = base.filter((h) => !avoid.some((a) => norm(h).includes(a)));
  for (const pool of preferred.length < base.length ? [preferred, base] : [base]) {
    for (const kw of COLUMNS[role] || []) {
      const exact = pool.find((h) => norm(h) === norm(kw));
      if (exact) return exact;
      const hit = pool.find((h) => norm(h).includes(norm(kw)));
      if (hit) return hit;
    }
  }
  return "";
}
function inspectTable(table, dataset, override) {
  const roles = import_ipc_contracts.PA_DATASET_ROLES[dataset];
  const headers = table.headers;
  const periods = [];
  if (dataset === "monthly" || dataset === "yearly") {
    for (const h of headers) {
      const period = dataset === "monthly" ? monthOfHeader(h) : yearOfHeader(h);
      if (period) periods.push({ header: h, period });
    }
  }
  const periodHeaders = new Set(periods.map((p) => p.header));
  const mapping = {};
  if (override) {
    for (const r of roles) mapping[r.key] = headers.includes(override[r.key]) ? override[r.key] : "";
  } else {
    const used = [];
    const pool = headers.filter((h) => !periodHeaders.has(h));
    for (const r of roles) {
      const col = detectColumn(pool, r.key, used);
      mapping[r.key] = col;
      if (col) used.push(col);
    }
  }
  const periodRole = dataset === "monthly" ? "month" : "year";
  const wide = periods.length >= 2 && !mapping[periodRole];
  const required = roles.filter((r) => r.required).map((r) => r.key);
  const missing = (wide ? ["partNo"] : required).filter((k) => !mapping[k]);
  return { mapping, layout: wide ? "wide" : "long", periods: wide ? periods : [], missing };
}
var Collector = class {
  rows = [];
  skipped = [];
  skippedCount = 0;
  notes = [];
  skip(row, reason) {
    this.skippedCount += 1;
    if (this.skipped.length < MAX_SKIPPED_KEPT) this.skipped.push({ row, reason });
  }
  done() {
    return { rows: this.rows, skipped: this.skipped, skippedCount: this.skippedCount, notes: this.notes };
  }
};
function isTotalRow(partNo) {
  const s = norm(partNo);
  return columnKeywords_default.totalRowMarks.some((m) => s === norm(m) || s.startsWith(norm(m)));
}
function partNoOf(c, r, col, row) {
  const no = String(r[col] ?? "").trim();
  if (!no) {
    c.skip(row, (0, import_i18n2.t)("\u6CA1\u6709\u914D\u4EF6\u7F16\u7801"));
    return "";
  }
  if (isTotalRow(no)) {
    c.skip(row, (0, import_i18n2.t)("\u5408\u8BA1\u884C"));
    return "";
  }
  return no;
}
function parseShipments(table, ins, kind) {
  const c = new Collector();
  const m = ins.mapping;
  const push = (partNo, partName, period, qty) => {
    if (kind === "monthly") c.rows.push({ partNo, ...partName ? { partName } : {}, month: period, qty });
    else c.rows.push({ partNo, ...partName ? { partName } : {}, year: Number(period), qty });
  };
  table.rows.forEach((r, i) => {
    const row = i + 1;
    const partNo = partNoOf(c, r, m.partNo, row);
    if (!partNo) return;
    const partName = m.partName ? String(r[m.partName] ?? "").trim() : "";
    if (ins.layout === "wide") {
      let bad = 0;
      let negative = 0;
      for (const p of ins.periods) {
        const n2 = parseNum(r[p.header]);
        if (n2 === null) continue;
        if (Number.isNaN(n2)) {
          bad += 1;
          continue;
        }
        if (n2 < 0) {
          negative += 1;
          continue;
        }
        push(partNo, partName, p.period, n2);
      }
      if (bad) c.skip(row, (0, import_i18n2.t)("{n} \u4E2A\u671F\u95F4\u7684\u6570\u91CF\u4E0D\u662F\u6570\u5B57\uFF0C\u8FD9\u51E0\u683C\u6CA1\u6709\u8BFB", { n: bad }));
      if (negative) c.skip(row, (0, import_i18n2.t)("{n} \u4E2A\u671F\u95F4\u7684\u6570\u91CF\u662F\u8D1F\u6570\uFF0C\u8FD9\u51E0\u683C\u6CA1\u6709\u8BFB", { n: negative }));
      return;
    }
    const period = kind === "monthly" ? parseMonth(r[m.month]) : String(parseYear(r[m.year]) ?? "");
    if (!period) {
      c.skip(row, kind === "monthly" ? (0, import_i18n2.t)("\u6708\u4EFD\u8BA4\u4E0D\u51FA\uFF1A{p0}", { p0: String(r[m.month] ?? "") || (0, import_i18n2.t)("\u7A7A") }) : (0, import_i18n2.t)("\u5E74\u4EFD\u8BA4\u4E0D\u51FA\uFF1A{p0}", { p0: String(r[m.year] ?? "") || (0, import_i18n2.t)("\u7A7A") }));
      return;
    }
    const n = parseNum(r[m.shipQty]);
    if (n === null) {
      c.skip(row, (0, import_i18n2.t)("\u53D1\u8D27\u6570\u91CF\u662F\u7A7A\u7684"));
      return;
    }
    if (Number.isNaN(n)) {
      c.skip(row, (0, import_i18n2.t)("\u53D1\u8D27\u6570\u91CF\u4E0D\u662F\u6570\u5B57\uFF1A{p0}", { p0: String(r[m.shipQty]) }));
      return;
    }
    if (n < 0) {
      c.skip(row, (0, import_i18n2.t)("\u53D1\u8D27\u6570\u91CF\u662F\u8D1F\u6570\uFF1A{p0}", { p0: String(r[m.shipQty]) }));
      return;
    }
    push(partNo, partName, period, n);
  });
  return c.done();
}
function optionalNum(r, col, onBad) {
  if (!col) return void 0;
  const n = parseNum(r[col]);
  if (n === null) return void 0;
  if (Number.isNaN(n) || n < 0) {
    onBad();
    return void 0;
  }
  return n;
}
function parseLeadTimes(table, m) {
  const c = new Collector();
  let badOptional = 0;
  const seen = /* @__PURE__ */ new Set();
  let dup = 0;
  table.rows.forEach((r, i) => {
    const row = i + 1;
    const partNo = partNoOf(c, r, m.partNo, row);
    if (!partNo) return;
    const days = parseNum(r[m.leadDays]);
    if (days === null) {
      c.skip(row, (0, import_i18n2.t)("\u91C7\u8D2D\u63D0\u524D\u671F\u662F\u7A7A\u7684\uFF0C\u8FD9\u4E2A\u914D\u4EF6\u4F1A\u7528\u9ED8\u8BA4\u5929\u6570"));
      return;
    }
    if (Number.isNaN(days) || days <= 0) {
      c.skip(row, (0, import_i18n2.t)("\u91C7\u8D2D\u63D0\u524D\u671F\u4E0D\u662F\u6B63\u6570\uFF1A{p0}", { p0: String(r[m.leadDays]) }));
      return;
    }
    if (seen.has(partNo)) dup += 1;
    seen.add(partNo);
    const moq = optionalNum(r, m.moq, () => {
      badOptional += 1;
    });
    const unitPrice = optionalNum(r, m.unitPrice, () => {
      badOptional += 1;
    });
    const supplier = m.supplier ? String(r[m.supplier] ?? "").trim() : "";
    c.rows.push({ partNo, days, ...moq ? { moq } : {}, ...unitPrice ? { unitPrice } : {}, ...supplier ? { supplier } : {} });
  });
  if (dup) c.notes.push((0, import_i18n2.t)("{n} \u4E2A\u914D\u4EF6\u5728\u8868\u91CC\u51FA\u73B0\u591A\u6B21\uFF0C\u4EE5\u6700\u540E\u4E00\u884C\u4E3A\u51C6", { n: dup }));
  if (badOptional) c.notes.push((0, import_i18n2.t)("{n} \u683C\u6700\u5C0F\u8D77\u8BA2\u91CF\u6216\u5355\u4EF7\u8BA4\u4E0D\u51FA\uFF0C\u5F53\u4F5C\u6CA1\u586B", { n: badOptional }));
  return c.done();
}
function parseInTransit(table, m) {
  const c = new Collector();
  let noEta = 0;
  table.rows.forEach((r, i) => {
    const row = i + 1;
    const partNo = partNoOf(c, r, m.partNo, row);
    if (!partNo) return;
    const qty = parseNum(r[m.transitQty]);
    if (qty === null) {
      c.skip(row, (0, import_i18n2.t)("\u5728\u9014\u6570\u91CF\u662F\u7A7A\u7684"));
      return;
    }
    if (Number.isNaN(qty)) {
      c.skip(row, (0, import_i18n2.t)("\u5728\u9014\u6570\u91CF\u4E0D\u662F\u6570\u5B57\uFF1A{p0}", { p0: String(r[m.transitQty]) }));
      return;
    }
    if (qty <= 0) {
      c.skip(row, (0, import_i18n2.t)("\u5728\u9014\u6570\u91CF\u4E0D\u5927\u4E8E 0\uFF0C\u4E0D\u7B97\u5728\u9014"));
      return;
    }
    const rawEta = m.eta ? String(r[m.eta] ?? "").trim() : "";
    const eta = parseDate(rawEta);
    if (!eta) noEta += 1;
    const orderNo = m.orderNo ? String(r[m.orderNo] ?? "").trim() : "";
    const supplier = m.supplier ? String(r[m.supplier] ?? "").trim() : "";
    c.rows.push({ partNo, qty, ...eta ? { eta } : {}, ...orderNo ? { orderNo } : {}, ...supplier ? { supplier } : {} });
  });
  if (noEta) c.notes.push((0, import_i18n2.t)("{n} \u7B14\u5728\u9014\u6CA1\u6709\u53EF\u7528\u7684\u9884\u8BA1\u5230\u8D27\u65E5\u671F\uFF0C\u6309\u300C\u57FA\u51C6\u65E5 + \u91C7\u8D2D\u63D0\u524D\u671F\u300D\u63A8\u7B97\u5230\u8D27", { n: noEta }));
  return c.done();
}
function parseStock(table, m) {
  const c = new Collector();
  let badPrice = 0;
  let negative = 0;
  table.rows.forEach((r, i) => {
    const row = i + 1;
    const partNo = partNoOf(c, r, m.partNo, row);
    if (!partNo) return;
    const qty = parseNum(r[m.stockQty]);
    if (qty === null) {
      c.skip(row, (0, import_i18n2.t)("\u5E93\u5B58\u6570\u91CF\u662F\u7A7A\u7684"));
      return;
    }
    if (Number.isNaN(qty)) {
      c.skip(row, (0, import_i18n2.t)("\u5E93\u5B58\u6570\u91CF\u4E0D\u662F\u6570\u5B57\uFF1A{p0}", { p0: String(r[m.stockQty]) }));
      return;
    }
    if (qty < 0) negative += 1;
    const partName = m.partName ? String(r[m.partName] ?? "").trim() : "";
    const warehouse = m.warehouse ? String(r[m.warehouse] ?? "").trim() : "";
    const unitPrice = optionalNum(r, m.unitPrice, () => {
      badPrice += 1;
    });
    c.rows.push({ partNo, qty, ...partName ? { partName } : {}, ...warehouse ? { warehouse } : {}, ...unitPrice ? { unitPrice } : {} });
  });
  if (negative) c.notes.push((0, import_i18n2.t)("{n} \u884C\u5E93\u5B58\u6570\u91CF\u662F\u8D1F\u6570\uFF0C\u5DF2\u7167\u539F\u6837\u8BFB\u5165\uFF08\u540C\u4E00\u914D\u4EF6\u591A\u4E2A\u4ED3\u5E93\u4F1A\u76F8\u52A0\uFF09", { n: negative }));
  if (badPrice) c.notes.push((0, import_i18n2.t)("{n} \u683C\u5355\u4EF7\u8BA4\u4E0D\u51FA\uFF0C\u5F53\u4F5C\u6CA1\u586B", { n: badPrice }));
  return c.done();
}
function parseDataset(table, dataset, ins) {
  if (ins.missing.length) throw new Error((0, import_i18n2.t)("\u5FC5\u586B\u5217\u6CA1\u6709\u5BF9\u5E94\u4E0A\uFF0C\u8BFB\u4E0D\u4E86\u8FD9\u4EFD\u8868"));
  const m = ins.mapping;
  const out = dataset === "monthly" ? parseShipments(table, ins, "monthly") : dataset === "yearly" ? parseShipments(table, ins, "yearly") : dataset === "leadTime" ? parseLeadTimes(table, m) : dataset === "inTransit" ? parseInTransit(table, m) : parseStock(table, m);
  return out;
}
function periodRange(periods) {
  if (!periods.length) return { from: "", to: "" };
  const sorted = [...periods].sort();
  return { from: sorted[0], to: sorted[sorted.length - 1] };
}

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/demoData.ts
var import_node_fs2 = require("node:fs");
var import_node_path2 = require("node:path");
var import_excel2 = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/demoParts.json
var demoParts_default = {
  files: {
    monthly: "\u914D\u4EF6\u5386\u53F2\u53D1\u8D27-\u6309\u6708.xlsx",
    yearly: "\u914D\u4EF6\u5386\u53F2\u53D1\u8D27-\u6309\u5E74.xlsx",
    leadTime: "\u914D\u4EF6\u91C7\u8D2D\u63D0\u524D\u671F.xlsx",
    inTransit: "\u914D\u4EF6\u91C7\u8D2D\u5728\u9014\u8BA2\u5355.xlsx",
    stock: "\u914D\u4EF6\u5B9E\u65F6\u5E93\u5B58.xlsx"
  },
  sheets: {
    monthly: "\u5386\u53F2\u53D1\u8D27\u6309\u6708",
    yearly: "\u5386\u53F2\u53D1\u8D27\u6309\u5E74",
    leadTime: "\u91C7\u8D2D\u63D0\u524D\u671F",
    inTransit: "\u91C7\u8D2D\u5728\u9014",
    stock: "\u5B9E\u65F6\u5E93\u5B58"
  },
  headers: {
    monthly: [
      "\u914D\u4EF6\u7F16\u7801",
      "\u914D\u4EF6\u540D\u79F0"
    ],
    yearly: [
      "\u914D\u4EF6\u7F16\u7801",
      "\u914D\u4EF6\u540D\u79F0",
      "\u5E74\u4EFD",
      "\u53D1\u8D27\u6570\u91CF"
    ],
    leadTime: [
      "\u914D\u4EF6\u7F16\u7801",
      "\u914D\u4EF6\u540D\u79F0",
      "\u4F9B\u5E94\u5546",
      "\u5E73\u5747\u91C7\u8D2D\u5929\u6570",
      "\u6700\u5C0F\u8D77\u8BA2\u91CF",
      "\u91C7\u8D2D\u5355\u4EF7"
    ],
    inTransit: [
      "\u91C7\u8D2D\u8BA2\u5355\u53F7",
      "\u914D\u4EF6\u7F16\u7801",
      "\u914D\u4EF6\u540D\u79F0",
      "\u4F9B\u5E94\u5546",
      "\u5728\u9014\u6570\u91CF",
      "\u9884\u8BA1\u5230\u8D27\u65E5\u671F"
    ],
    stock: [
      "\u914D\u4EF6\u7F16\u7801",
      "\u914D\u4EF6\u540D\u79F0",
      "\u4ED3\u5E93",
      "\u5E93\u5B58\u6570\u91CF",
      "\u5355\u4EF7"
    ]
  },
  codePrefix: "HD-PJ-",
  orderPrefix: "PO",
  warehouses: [
    "\u914D\u4EF6\u603B\u4ED3",
    "\u534E\u5357\u5206\u4ED3"
  ],
  suppliers: [
    "\u4E2D\u5C71\u7CBE\u5DE5\u4E94\u91D1",
    "\u4F5B\u5C71\u6052\u6CF0\u7535\u5B50",
    "\u987A\u5FB7\u5B8F\u8FBE\u9600\u95E8",
    "\u5B81\u6CE2\u7533\u83F1\u7535\u673A",
    "\u4E1C\u839E\u7ACB\u4FE1\u5851\u80F6",
    "\u6DF1\u5733\u534E\u82AF\u63A7\u5236"
  ],
  names: [
    "\u70B9\u706B\u9488",
    "\u70ED\u7535\u5076",
    "\u7535\u78C1\u9600\u603B\u6210",
    "\u8109\u51B2\u70B9\u706B\u5668",
    "\u65CB\u94AE\u7EC4\u4EF6",
    "\u7089\u5934",
    "\u5916\u73AF\u706B\u76D6",
    "\u5185\u73AF\u706B\u76D6",
    "\u9505\u652F\u67B6",
    "\u8FDB\u6C14\u7BA1\u63A5\u5934",
    "\u71C3\u6C14\u9600\u4F53",
    "\u5FAE\u52A8\u5F00\u5173",
    "\u7535\u6C60\u76D2",
    "\u9762\u677F\u73BB\u7483",
    "\u5F15\u5C04\u7BA1",
    "\u6C34\u6C14\u8054\u52A8\u9600",
    "\u76F4\u6D41\u98CE\u673A",
    "\u4E3B\u63A7\u7535\u8111\u677F",
    "\u663E\u793A\u64CD\u4F5C\u677F",
    "\u65E0\u6C27\u94DC\u70ED\u4EA4\u6362\u5668",
    "\u6C34\u6D41\u91CF\u4F20\u611F\u5668",
    "\u6E29\u5EA6\u63A2\u5934",
    "\u6BD4\u4F8B\u9600",
    "\u71C3\u70E7\u5668\u7EC4\u4EF6",
    "\u70B9\u706B\u53D8\u538B\u5668",
    "\u98CE\u538B\u5F00\u5173",
    "\u8FDB\u6C34\u6EE4\u7F51",
    "\u6CC4\u538B\u5B89\u5168\u9600",
    "\u6392\u70DF\u7BA1",
    "\u9065\u63A7\u5668",
    "\u70DF\u673A\u7535\u673A",
    "\u8717\u58F3\u53F6\u8F6E",
    "\u6CB9\u676F",
    "\u4E0D\u9508\u94A2\u6CB9\u7F51",
    "\u89E6\u63A7\u5F00\u5173\u677F",
    "\u7167\u660E\u706F\u677F",
    "\u6B62\u56DE\u9600",
    "\u7535\u5BB9",
    "\u88C5\u9970\u7F69",
    "\u53D8\u9891\u9A71\u52A8\u677F",
    "\u6D88\u6BD2\u67DC\u7D2B\u5916\u706F\u7BA1",
    "\u81ED\u6C27\u53D1\u751F\u5668",
    "\u95E8\u5C01\u6761",
    "\u62C9\u7BEE\u6ED1\u8F68",
    "PTC\u52A0\u70ED\u5668",
    "\u95E8\u63A7\u5F00\u5173",
    "\u6D17\u7897\u673A\u5FAA\u73AF\u6CF5",
    "\u6392\u6C34\u6CF5",
    "\u55B7\u6DCB\u81C2",
    "\u8FDB\u6C34\u7535\u78C1\u9600",
    "\u8F6F\u6C34\u5668",
    "\u7897\u7BEE\u6EDA\u8F6E",
    "\u95E8\u9501\u7EC4\u4EF6",
    "\u52A0\u70ED\u7BA1",
    "\u96C6\u6210\u7076\u7FFB\u677F\u7535\u673A",
    "\u51C0\u6C34\u6EE4\u82AF",
    "\u58C1\u6302\u7089\u6C34\u6CF5",
    "\u58C1\u6302\u7089\u4E09\u901A\u9600",
    "\u677F\u5F0F\u6362\u70ED\u5668",
    "\u81A8\u80C0\u6C34\u7BB1"
  ]
};

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/demoData.ts
var DAY2 = 864e5;
var HISTORY_MONTHS = 36;
function specs() {
  const out = [];
  const add = (n, make) => {
    for (let i = 0; i < n; i += 1) out.push(make(i));
  };
  add(22, (i) => ({
    kind: "healthy",
    demand: 120 + i * 35,
    cover: 70 + i % 5 * 20,
    lead: i % 8 === 7 ? null : 15 + i % 5 * 5,
    seasonal: i % 6 === 2,
    twoWarehouses: i % 4 === 0,
    transit: i % 5 === 1 ? [{ days: 30, etaIn: 20 }] : void 0
  }));
  add(6, (i) => ({ kind: "risk_none", demand: 200 + i * 60, cover: 10 + i * 5, lead: i === 5 ? null : 30 + i % 3 * 5, moq: i < 2 ? i === 0 ? 50 : 100 : void 0, seasonal: i === 3 }));
  add(3, (i) => ({ kind: "risk_late", demand: 260 + i * 40, cover: 12 + i * 2, lead: 30, transit: [{ days: 20, etaIn: 28 + i * 4 }] }));
  add(2, (i) => ({ kind: "risk_follow", demand: 300 + i * 90, cover: 8, lead: 30, moq: i === 1 ? 200 : void 0, transit: [{ days: 15, etaIn: 5 }] }));
  add(1, () => ({ kind: "risk_no_eta", demand: 180, cover: 10, lead: 25, transit: [{ days: 25, etaIn: null }] }));
  add(4, (i) => ({ kind: "out_none", demand: 90 + i * 70, cover: 0, lead: 20 + i * 5, noStockRow: i === 3, moq: i === 1 ? 30 : void 0 }));
  add(4, (i) => ({ kind: "out_transit", demand: 150 + i * 50, cover: 0, lead: 30, transit: i === 2 ? [{ days: 20, etaIn: 6 }, { days: 30, etaIn: 26 }] : [{ days: 25 + i * 5, etaIn: 4 + i * 5 }] }));
  add(8, (i) => ({
    kind: "stagnant",
    demand: 60 + i * 15,
    cover: 80 + i * 45,
    lead: 30,
    idleMonths: [13, 15, 18, 20, 26, 30, 0, 14][i],
    transit: i === 7 ? [{ days: 40, etaIn: 18 }] : void 0
  }));
  add(10, (i) => ({ kind: "redundant", demand: 80 + i * 25, cover: 200 + i * 35, lead: 20 + i % 4 * 5, transit: i % 4 === 1 ? [{ days: 30, etaIn: 15 }] : void 0, twoWarehouses: i % 5 === 0 }));
  return out;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var monthIdx = (day) => {
  const [y, m] = day.split("-").map(Number);
  return y * 12 + (m - 1);
};
var monthStr = (i) => `${Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, "0")}`;
var seasonFactor = (calendarMonth) => [10, 11, 12, 1].includes(calendarMonth) ? 1.7 : [5, 6, 7, 8].includes(calendarMonth) ? 0.5 : 1;
function buildDemoData(asOf) {
  if (!Number.isFinite(parseDay(asOf))) throw new Error(`bad asOf: ${asOf}`);
  const base = monthIdx(asOf);
  const asOfT = parseDay(asOf);
  const rand = rng(20261013);
  const monthly = [];
  const yearly = [];
  const leadTime = [];
  const inTransit = [];
  const stock = [];
  const names = /* @__PURE__ */ new Map();
  let po = 1;
  specs().forEach((s, i) => {
    const partNo = `${demoParts_default.codePrefix}${String(i + 1).padStart(4, "0")}`;
    const partName = demoParts_default.names[i] || partNo;
    names.set(partNo, partName);
    const supplier = demoParts_default.suppliers[i % demoParts_default.suppliers.length];
    const price = Math.round((6 + rand() * 180) * 10) / 10;
    const byMonth = /* @__PURE__ */ new Map();
    for (let k = HISTORY_MONTHS; k >= 1; k -= 1) {
      const mi = base - k;
      let qty2 = 0;
      if (s.kind !== "stagnant") {
        qty2 = Math.round(s.demand * (0.9 + rand() * 0.2) * (s.seasonal ? seasonFactor(mi % 12 + 1) : 1));
      } else if (s.idleMonths && k >= s.idleMonths) {
        qty2 = Math.round(s.demand * (0.5 + rand() * 0.5) * Math.min(1, (k - s.idleMonths + 1) / 6));
      }
      byMonth.set(mi, qty2);
      if (s.kind !== "stagnant" || s.idleMonths) monthly.push({ partNo, partName, month: monthStr(mi), qty: qty2 });
    }
    const asOfYear = Math.floor(base / 12);
    for (let y = asOfYear - 5; y <= asOfYear - 1; y += 1) {
      let sum = 0;
      let covered = 0;
      for (let m = 0; m < 12; m += 1) {
        const v = byMonth.get(y * 12 + m);
        if (v !== void 0) {
          sum += v;
          covered += 1;
        }
      }
      if (s.kind === "stagnant" && !s.idleMonths) continue;
      const qty2 = covered === 12 ? sum : Math.round(s.demand * 12 * (0.75 + rand() * 0.2));
      yearly.push({ partNo, partName, year: y, qty: qty2 });
    }
    if (s.lead !== null) leadTime.push({ partNo, days: s.lead, ...s.moq ? { moq: s.moq } : {}, unitPrice: price, supplier });
    const daily = forecastDailyDemand(byMonth, base, true).daily;
    const qty = s.kind === "stagnant" ? s.cover : Math.round(daily * s.cover);
    if (!s.noStockRow) {
      if (s.twoWarehouses && qty > 1) {
        const first = Math.round(qty * 0.65);
        stock.push({ partNo, partName, warehouse: demoParts_default.warehouses[0], qty: first, unitPrice: price });
        stock.push({ partNo, partName, warehouse: demoParts_default.warehouses[1], qty: qty - first, unitPrice: price });
      } else {
        stock.push({ partNo, partName, warehouse: demoParts_default.warehouses[i % demoParts_default.warehouses.length], qty, unitPrice: price });
      }
    }
    for (const t of s.transit || []) {
      const tq = Math.max(10, Math.round((s.kind === "stagnant" ? s.demand / 30 : daily) * t.days));
      inTransit.push({
        partNo,
        orderNo: `${demoParts_default.orderPrefix}${asOf.slice(0, 4)}${String(po).padStart(5, "0")}`,
        qty: tq,
        supplier,
        ...t.etaIn !== null ? { eta: fmtDay(asOfT + t.etaIn * DAY2) } : {}
      });
      po += 1;
    }
  });
  return { monthly, yearly, leadTime, inTransit, stock, names };
}
function writeDemoFiles(dir, asOf) {
  (0, import_node_fs2.mkdirSync)(dir, { recursive: true });
  const d = buildDemoData(asOf);
  const base = monthIdx(asOf);
  const months = Array.from({ length: HISTORY_MONTHS }, (_, k) => monthStr(base - HISTORY_MONTHS + k));
  const paths = Object.fromEntries(Object.keys(demoParts_default.files).map((k) => [k, (0, import_node_path2.join)(dir, demoParts_default.files[k])]));
  const name = (no) => d.names.get(no) || "";
  const wide = /* @__PURE__ */ new Map();
  for (const r of d.monthly) {
    const m = wide.get(r.partNo) ?? /* @__PURE__ */ new Map();
    m.set(r.month, r.qty);
    wide.set(r.partNo, m);
  }
  (0, import_excel2.writeWorkbook)(paths.monthly, [{
    name: demoParts_default.sheets.monthly,
    headers: [...demoParts_default.headers.monthly, ...months],
    rows: [...wide.entries()].map(([no, m]) => [no, name(no), ...months.map((mo) => m.get(mo) ?? 0)])
  }]);
  (0, import_excel2.writeWorkbook)(paths.yearly, [{ name: demoParts_default.sheets.yearly, headers: demoParts_default.headers.yearly, rows: d.yearly.map((r) => [r.partNo, name(r.partNo), r.year, r.qty]) }]);
  (0, import_excel2.writeWorkbook)(paths.leadTime, [{ name: demoParts_default.sheets.leadTime, headers: demoParts_default.headers.leadTime, rows: d.leadTime.map((r) => [r.partNo, name(r.partNo), r.supplier || "", r.days, r.moq ?? "", r.unitPrice ?? ""]) }]);
  (0, import_excel2.writeWorkbook)(paths.inTransit, [{ name: demoParts_default.sheets.inTransit, headers: demoParts_default.headers.inTransit, rows: d.inTransit.map((r) => [r.orderNo || "", r.partNo, name(r.partNo), r.supplier || "", r.qty, r.eta || ""]) }]);
  (0, import_excel2.writeWorkbook)(paths.stock, [{ name: demoParts_default.sheets.stock, headers: demoParts_default.headers.stock, rows: d.stock.map((r) => [r.partNo, name(r.partNo), r.warehouse || "", r.qty, r.unitPrice ?? ""]) }]);
  return paths;
}

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/exporter.ts
var import_node_fs3 = require("node:fs");
var import_node_path3 = require("node:path");
var import_i18n3 = require("npm:@totalclaw/i18n");
var import_ipc_contracts2 = require("npm:@totalclaw/ipc-contracts");
var import_excel3 = require("host:apps/desktop-shell/src/main/services/serviceSettlement/excel.ts");

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/plan.ts
var DAY3 = 864e5;
function planGroupOf(r) {
  if (r.state === "stagnant") return "stagnant";
  if (r.state === "redundant") return "redundant";
  if (r.state === "at_risk" || r.state === "out_of_stock") return r.hasInTransit ? "shortage_transit" : "shortage_none";
  return null;
}
function defaultPlanText(r) {
  return r.actions.map((a, i) => `${i + 1}. ${a.text}`).join("\n");
}
function planTextOf(r, review) {
  return review?.text?.trim() ? review.text.trim() : defaultPlanText(r);
}
function pendingCounts(results, reviews) {
  const out = { stagnant: 0, redundant: 0, shortage_transit: 0, shortage_none: 0 };
  for (const r of results) {
    const g = planGroupOf(r);
    if (!g) continue;
    const st = reviews[r.partNo]?.status || "pending";
    if (st === "pending") out[g] += 1;
  }
  return out;
}
var round2 = (n) => Math.round(n * 100) / 100;
function runCompute(data, rules, asOf) {
  const params = { ...rules, asOf };
  const out = computePartsAlert({ monthly: data.monthly, yearly: data.yearly, leadTimes: data.leadTime, inTransit: data.inTransit, stock: data.stock }, params);
  const supplier = /* @__PURE__ */ new Map();
  for (const r of data.inTransit) {
    const no = String(r.partNo).trim();
    if (r.supplier && !supplier.has(no)) supplier.set(no, r.supplier);
  }
  for (const r of data.leadTime) {
    const no = String(r.partNo).trim();
    if (r.supplier) supplier.set(no, r.supplier);
  }
  const price = /* @__PURE__ */ new Map();
  for (const r of data.leadTime) {
    const no = String(r.partNo).trim();
    if (Number(r.unitPrice) > 0) price.set(no, Number(r.unitPrice));
  }
  for (const r of data.stock) {
    const no = String(r.partNo).trim();
    if (Number(r.unitPrice) > 0) price.set(no, Number(r.unitPrice));
  }
  const results = out.results.map((r) => ({ ...r, supplier: supplier.get(r.partNo) ?? "", unitPrice: price.get(r.partNo) ?? null }));
  return { results, summary: out.summary };
}
function defaultExpectDate(asOf, leadDays) {
  return fmtDay(parseDay(asOf) + Math.max(0, Math.round(leadDays)) * DAY3);
}
function buildReplenishLines(results, reviews, edits, asOf) {
  const lines = [];
  for (const r of results) {
    if (r.state !== "at_risk" && r.state !== "out_of_stock") continue;
    if (!(r.suggestQty > 0)) continue;
    if (reviews[r.partNo]?.status !== "confirmed") continue;
    const e = edits[r.partNo] || {};
    const qty = Number.isFinite(Number(e.qty)) && Number(e.qty) > 0 ? Math.round(Number(e.qty)) : r.suggestQty;
    const unitPrice = e.unitPrice !== void 0 ? Number(e.unitPrice) > 0 ? Number(e.unitPrice) : null : r.unitPrice;
    lines.push({
      partNo: r.partNo,
      partName: r.partName,
      state: r.state,
      suggestQty: r.suggestQty,
      qty,
      supplier: e.supplier !== void 0 ? e.supplier : r.supplier,
      expectDate: e.expectDate && Number.isFinite(parseDay(e.expectDate)) ? fmtDay(parseDay(e.expectDate)) : defaultExpectDate(asOf, r.leadDays),
      unitPrice,
      amount: unitPrice !== null ? round2(qty * unitPrice) : null,
      selected: e.selected !== false,
      leadDays: r.leadDays,
      stockoutDate: r.stockoutDate,
      basis: r.basis
    });
  }
  return lines;
}
function lineTotals(lines) {
  const sel = lines.filter((l) => l.selected);
  return {
    lines: sel.length,
    qty: sel.reduce((a, l) => a + l.qty, 0),
    amount: round2(sel.reduce((a, l) => a + (l.amount ?? 0), 0)),
    unpriced: sel.filter((l) => l.amount === null).length
  };
}
function diffNewAlerts(prev, cur) {
  const before = new Map((prev || []).map((r) => [r.partNo, r.state]));
  const newOut = [];
  const newRisk = [];
  for (const r of cur) {
    if (r.state === "out_of_stock" && before.get(r.partNo) !== "out_of_stock") newOut.push(r.partNo);
    if (r.state === "at_risk" && before.get(r.partNo) !== "at_risk") newRisk.push(r.partNo);
  }
  return { newOut, newRisk };
}

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/exporter.ts
function stateLabel(s) {
  return { stagnant: (0, import_i18n3.t)("\u5E93\u5B58\u5446\u6EDE"), redundant: (0, import_i18n3.t)("\u5E93\u5B58\u5197\u4F59"), healthy: (0, import_i18n3.t)("\u5E93\u5B58\u5065\u5EB7"), at_risk: (0, import_i18n3.t)("\u5E93\u5B58\u5C06\u7F3A\u8D27"), out_of_stock: (0, import_i18n3.t)("\u5E93\u5B58\u5DF2\u7F3A\u8D27") }[s];
}
function groupLabel(g) {
  return {
    stagnant: (0, import_i18n3.t)("\u5446\u6EDE\u5E93\u5B58\u5904\u7406\u5EFA\u8BAE"),
    redundant: (0, import_i18n3.t)("\u5197\u4F59\u5E93\u5B58\u5904\u7406\u5EFA\u8BAE"),
    shortage_transit: (0, import_i18n3.t)("\u6709\u91C7\u8D2D\u5728\u9014\u7684\u7BA1\u63A7\u4E3E\u63AA"),
    shortage_none: (0, import_i18n3.t)("\u65E0\u91C7\u8D2D\u5728\u9014\u7684\u7BA1\u63A7\u4E3E\u63AA")
  }[g];
}
function reviewLabel(st) {
  return st === "confirmed" ? (0, import_i18n3.t)("\u5DF2\u786E\u8BA4") : st === "rejected" ? (0, import_i18n3.t)("\u5DF2\u9A73\u56DE") : (0, import_i18n3.t)("\u672A\u68C0\u9A8C");
}
function freeFile(dir, baseName, ext = ".xlsx") {
  (0, import_node_fs3.mkdirSync)(dir, { recursive: true });
  const base = (0, import_excel3.safeFileName)(baseName);
  let file = (0, import_node_path3.join)(dir, `${base}${ext}`);
  for (let n = 2; (0, import_node_fs3.existsSync)(file) && n < 1e3; n += 1) file = (0, import_node_path3.join)(dir, `${base}-${n}${ext}`);
  return file;
}
var dateTag = (asOf) => asOf.replace(/-/g, "");
function buildOrderSheets(lines, asOf) {
  const sel = lines.filter((l) => l.selected);
  return [
    {
      name: (0, import_i18n3.t)("\u8BA2\u5355\u884C"),
      headers: [(0, import_i18n3.t)("\u884C\u53F7"), (0, import_i18n3.t)("\u914D\u4EF6\u7F16\u7801"), (0, import_i18n3.t)("\u914D\u4EF6\u540D\u79F0"), (0, import_i18n3.t)("\u4F9B\u5E94\u5546"), (0, import_i18n3.t)("\u4E0B\u5355\u6570\u91CF"), (0, import_i18n3.t)("\u5355\u4EF7"), (0, import_i18n3.t)("\u91D1\u989D"), (0, import_i18n3.t)("\u671F\u671B\u5230\u8D27\u65E5"), (0, import_i18n3.t)("\u5E93\u5B58\u72B6\u6001"), (0, import_i18n3.t)("\u516C\u5F0F\u5EFA\u8BAE\u91CF"), (0, import_i18n3.t)("\u4EBA\u5DE5\u8C03\u6574"), (0, import_i18n3.t)("\u8FD0\u7B97\u57FA\u51C6\u65E5")],
      rows: sel.map((l, i) => [
        i + 1,
        l.partNo,
        l.partName,
        l.supplier,
        l.qty,
        l.unitPrice ?? "",
        l.amount ?? "",
        l.expectDate,
        stateLabel(l.state),
        l.suggestQty,
        l.qty !== l.suggestQty ? (0, import_i18n3.t)("\u5EFA\u8BAE {a}\uFF0C\u6539\u4E3A {b}", { a: l.suggestQty, b: l.qty }) : "",
        asOf
      ])
    },
    {
      name: (0, import_i18n3.t)("\u8FD0\u7B97\u4F9D\u636E"),
      headers: [(0, import_i18n3.t)("\u914D\u4EF6\u7F16\u7801"), (0, import_i18n3.t)("\u914D\u4EF6\u540D\u79F0"), (0, import_i18n3.t)("\u9884\u8BA1\u65AD\u8D27\u65E5"), (0, import_i18n3.t)("\u91C7\u8D2D\u63D0\u524D\u671F\uFF08\u5929\uFF09"), (0, import_i18n3.t)("\u7B97\u5F0F\u4F9D\u636E")],
      rows: sel.map((l) => [l.partNo, l.partName, l.stockoutDate, l.leadDays, l.basis.join("\n")]),
      colWidths: [18, 22, 14, 16, 110]
    }
  ];
}
function exportPurchaseOrder(dir, lines, asOf) {
  if (!lines.some((l) => l.selected)) throw new Error((0, import_i18n3.t)("\u8865\u5E93\u6E05\u5355\u91CC\u6CA1\u6709\u52FE\u9009\u4EFB\u4F55\u914D\u4EF6"));
  const file = freeFile(dir, `${(0, import_i18n3.t)("\u91C7\u8D2D\u8BA2\u5355")}_${dateTag(asOf)}`);
  (0, import_excel3.writeWorkbook)(file, buildOrderSheets(lines, asOf));
  return file;
}
function buildPlanSheets(results, reviews, summary) {
  const order = new Map(import_ipc_contracts2.PA_STATES.map((s, i) => [s, i]));
  const sorted = [...results].sort((a, b) => order.get(a.state) - order.get(b.state) || a.partNo.localeCompare(b.partNo));
  return [
    {
      name: (0, import_i18n3.t)("\u5E93\u5B58\u72B6\u6001"),
      headers: [(0, import_i18n3.t)("\u914D\u4EF6\u7F16\u7801"), (0, import_i18n3.t)("\u914D\u4EF6\u540D\u79F0"), (0, import_i18n3.t)("\u5E93\u5B58\u72B6\u6001"), (0, import_i18n3.t)("\u5E93\u5B58\u6570\u91CF"), (0, import_i18n3.t)("\u5728\u9014\u6570\u91CF"), (0, import_i18n3.t)("\u6700\u65E9\u5230\u8D27\u65E5"), (0, import_i18n3.t)("\u65E5\u5747\u9700\u6C42"), (0, import_i18n3.t)("\u53EF\u7528\u5929\u6570"), (0, import_i18n3.t)("\u9884\u8BA1\u65AD\u8D27\u65E5"), (0, import_i18n3.t)("\u91C7\u8D2D\u63D0\u524D\u671F\uFF08\u5929\uFF09"), (0, import_i18n3.t)("\u6700\u8FDF\u4E0B\u5355\u65E5"), (0, import_i18n3.t)("\u6700\u8FD1\u53D1\u8D27\u6708\u4EFD"), (0, import_i18n3.t)("\u5EFA\u8BAE\u8865\u5E93\u91CF"), (0, import_i18n3.t)("\u5EFA\u8BAE\u8865\u5E93\u91D1\u989D"), (0, import_i18n3.t)("\u7B97\u5F0F\u4F9D\u636E")],
      rows: sorted.map((r) => [
        r.partNo,
        r.partName,
        stateLabel(r.state),
        r.stockQty,
        r.inTransitQty,
        r.earliestEta,
        r.dailyDemand,
        r.coverDays ?? "",
        r.stockoutDate,
        r.leadDaysDefaulted ? (0, import_i18n3.t)("{n}\uFF08\u9ED8\u8BA4\uFF09", { n: r.leadDays }) : r.leadDays,
        r.latestOrderDate,
        r.lastShipMonth,
        r.suggestQty || "",
        r.suggestAmount ?? "",
        r.basis.join("\n")
      ])
    },
    {
      name: (0, import_i18n3.t)("\u884C\u52A8\u8BA1\u5212"),
      headers: [(0, import_i18n3.t)("\u5206\u7C7B"), (0, import_i18n3.t)("\u914D\u4EF6\u7F16\u7801"), (0, import_i18n3.t)("\u914D\u4EF6\u540D\u79F0"), (0, import_i18n3.t)("\u5E93\u5B58\u72B6\u6001"), (0, import_i18n3.t)("\u884C\u52A8\u8BA1\u5212"), (0, import_i18n3.t)("\u68C0\u9A8C\u7ED3\u679C"), (0, import_i18n3.t)("\u5907\u6CE8")],
      rows: sorted.filter((r) => planGroupOf(r)).map((r) => {
        const rv = reviews[r.partNo];
        return [groupLabel(planGroupOf(r)), r.partNo, r.partName, stateLabel(r.state), planTextOf(r, rv), reviewLabel(rv?.status), rv?.remark || ""];
      }),
      colWidths: [24, 18, 22, 12, 80, 10, 30]
    },
    {
      name: (0, import_i18n3.t)("\u6C47\u603B"),
      headers: [(0, import_i18n3.t)("\u9879\u76EE"), (0, import_i18n3.t)("\u6570\u503C")],
      rows: [
        [(0, import_i18n3.t)("\u8FD0\u7B97\u57FA\u51C6\u65E5"), summary.asOf],
        [(0, import_i18n3.t)("\u914D\u4EF6\u603B\u6570"), summary.total],
        ...import_ipc_contracts2.PA_STATES.map((s) => [stateLabel(s), summary.byState[s]]),
        [(0, import_i18n3.t)("\u5EFA\u8BAE\u8865\u5E93\u914D\u4EF6\u6570"), summary.replenishParts],
        [(0, import_i18n3.t)("\u5EFA\u8BAE\u8865\u5E93\u6570\u91CF"), summary.replenishQty],
        [(0, import_i18n3.t)("\u5EFA\u8BAE\u8865\u5E93\u91D1\u989D\uFF08\u6709\u5355\u4EF7\u7684\u90E8\u5206\uFF09"), summary.replenishAmount],
        [(0, import_i18n3.t)("\u6CA1\u6709\u5E93\u5B58\u8BB0\u5F55\u3001\u6309\u5E93\u5B58 0 \u5904\u7406\u7684\u914D\u4EF6\u6570"), summary.partsWithoutStockRow.length],
        [(0, import_i18n3.t)("\u6CA1\u6709\u91C7\u8D2D\u63D0\u524D\u671F\u3001\u7528\u9ED8\u8BA4\u5929\u6570\u7684\u914D\u4EF6\u6570"), summary.partsWithDefaultLead.length]
      ]
    }
  ];
}
function exportStatusPlan(dir, results, reviews, summary) {
  const file = freeFile(dir, `${(0, import_i18n3.t)("\u5E93\u5B58\u72B6\u6001\u4E0E\u884C\u52A8\u8BA1\u5212")}_${dateTag(summary.asOf)}`);
  (0, import_excel3.writeWorkbook)(file, buildPlanSheets(results, reviews, summary));
  return file;
}

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/schedule.ts
var import_node_fs4 = require("node:fs");
var import_node_path4 = require("node:path");
var ASSIGN_ORDER = ["yearly", "leadTime", "inTransit", "stock", "monthly"];
var EXTS = /* @__PURE__ */ new Set([".xlsx", ".xls", ".xlsm", ".csv"]);
function datasetOfFileName(name, keywords) {
  const n = name.toLowerCase();
  for (const k of ASSIGN_ORDER) {
    if ((keywords[k] || []).some((kw) => kw && n.includes(kw.toLowerCase()))) return k;
  }
  return null;
}
function pickNewestFiles(folder, keywords) {
  const out = {};
  if (!folder || !(0, import_node_fs4.existsSync)(folder)) return out;
  for (const name of (0, import_node_fs4.readdirSync)(folder)) {
    if (name.startsWith("~$") || name.startsWith(".") || !EXTS.has((0, import_node_path4.extname)(name).toLowerCase())) continue;
    const key = datasetOfFileName(name, keywords);
    if (!key) continue;
    const path = (0, import_node_path4.join)(folder, name);
    let mtimeMs = 0;
    try {
      const st = (0, import_node_fs4.statSync)(path);
      if (!st.isFile()) continue;
      mtimeMs = st.mtimeMs;
    } catch {
      continue;
    }
    const cur = out[key];
    if (!cur || mtimeMs > cur.mtimeMs || mtimeMs === cur.mtimeMs && name > cur.name) out[key] = { path, name, mtimeMs };
  }
  return out;
}
function dueToday(time, lastRunDay, now = /* @__PURE__ */ new Date()) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(time || ""));
  if (!m) return false;
  if (lastRunDay === localDay(now)) return false;
  return now.getHours() * 60 + now.getMinutes() >= Number(m[1]) * 60 + Number(m[2]);
}
function localDay(now = /* @__PURE__ */ new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/services/partsAlert/store.ts
var import_node_fs5 = require("node:fs");
var import_node_path5 = require("node:path");
var import_node_crypto = require("node:crypto");
var import_accountScope = require("host:apps/desktop-shell/src/main/services/accountScope.ts");
var HISTORY_LIMIT = 120;
function newId(prefix) {
  return `${prefix}_${(0, import_node_crypto.randomUUID)().replace(/-/g, "").slice(0, 12)}`;
}
function defaultRules() {
  return { ...DEFAULT_PARAMS };
}
function defaultKeywords() {
  const k = columnKeywords_default.fileKeywords;
  return { monthly: [...k.monthly], yearly: [...k.yearly], leadTime: [...k.leadTime], inTransit: [...k.inTransit], stock: [...k.stock] };
}
function defaultSchedule() {
  return { enabled: false, time: "08:00", folder: "", keywords: defaultKeywords(), notify: true, emailEnabled: false, emailTo: "" };
}
var clampInt = (v, min, max, fallback) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
function normalizeRules(raw) {
  const d = defaultRules();
  const r = raw || {};
  const stagnantMonths = clampInt(r.stagnantMonths, 1, 120, d.stagnantMonths);
  return {
    safetyDays: clampInt(r.safetyDays, 0, 365, d.safetyDays),
    reviewDays: clampInt(r.reviewDays, 1, 365, d.reviewDays),
    redundantMonths: clampInt(r.redundantMonths, 1, 120, d.redundantMonths),
    stagnantMonths,
    scrapMonths: Math.max(stagnantMonths, clampInt(r.scrapMonths, 1, 240, d.scrapMonths)),
    defaultLeadDays: clampInt(r.defaultLeadDays, 1, 365, d.defaultLeadDays),
    seasonal: r.seasonal === void 0 ? d.seasonal : !!r.seasonal
  };
}
function normalizeKeywords(raw) {
  const d = defaultKeywords();
  const src = raw && typeof raw === "object" ? raw : {};
  const out = {};
  for (const k of Object.keys(d)) {
    const list = Array.isArray(src[k]) ? src[k].map((x) => String(x || "").trim()).filter(Boolean) : null;
    out[k] = list && list.length ? [...new Set(list)].slice(0, 12) : d[k];
  }
  return out;
}
function normalizeSchedule(raw) {
  const d = defaultSchedule();
  const s = raw || {};
  return {
    enabled: !!s.enabled,
    time: /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(s.time || "")) ? String(s.time).padStart(5, "0") : d.time,
    folder: String(s.folder || ""),
    keywords: normalizeKeywords(s.keywords),
    notify: s.notify === void 0 ? d.notify : !!s.notify,
    emailEnabled: !!s.emailEnabled,
    emailTo: String(s.emailTo || "").trim()
  };
}
var EMPTY_DATASETS = () => ({ monthly: null, yearly: null, leadTime: null, inTransit: null, stock: null });
var emptyData = () => ({ monthly: [], yearly: [], leadTime: [], inTransit: [], stock: [] });
function normalize(raw) {
  const ds = EMPTY_DATASETS();
  for (const k of Object.keys(ds)) {
    const m = raw?.datasets?.[k];
    if (m && typeof m === "object" && typeof m.path === "string") ds[k] = { ...m, skipped: m.skipped || [], notes: m.notes || [], missing: m.missing || [], preview: m.preview || [], sheetNames: m.sheetNames || [], headers: m.headers || [], mapping: m.mapping || {} };
  }
  const run = raw?.run && typeof raw.run === "object" && raw.run.summary ? { ...raw.run, rules: normalizeRules(raw.run.rules), reviews: raw.run.reviews || {}, edits: raw.run.edits || {}, exported: raw.run.exported || null, stale: !!raw.run.stale, staleReason: raw.run.staleReason || "", replenishConfirmedAt: raw.run.replenishConfirmedAt || "" } : null;
  const st = raw?.scheduleStatus || {};
  return {
    settings: { rules: normalizeRules(raw?.settings?.rules), outputDir: String(raw?.settings?.outputDir || ""), schedule: normalizeSchedule(raw?.settings?.schedule) },
    datasets: ds,
    run,
    history: Array.isArray(raw?.history) ? raw.history.filter((h) => h && h.byState).map((h) => ({ ...h, newOut: h.newOut || [], newRisk: h.newRisk || [], files: h.files || [], note: h.note || "" })) : [],
    scheduleStatus: { lastRunDay: String(st.lastRunDay || ""), lastRunAt: String(st.lastRunAt || ""), lastOk: !!st.lastOk, lastMessage: String(st.lastMessage || ""), lastFiles: Array.isArray(st.lastFiles) ? st.lastFiles : [] },
    latest: raw?.latest && raw.latest.summary ? raw.latest : null
  };
}
function atomicWrite(file, data) {
  (0, import_node_fs5.writeFileSync)(`${file}.tmp`, JSON.stringify(data), "utf-8");
  (0, import_node_fs5.renameSync)(`${file}.tmp`, file);
}
function readJson(file) {
  try {
    return (0, import_node_fs5.existsSync)(file) ? JSON.parse((0, import_node_fs5.readFileSync)(file, "utf-8")) : null;
  } catch {
    return null;
  }
}
var PartsAlertStore = class {
  constructor(dirOf = () => (0, import_accountScope.accountPath)("parts-alert")) {
    this.dirOf = dirOf;
  }
  cache = null;
  dataCache = null;
  resultCache = { result: null, latest: null };
  cacheDir = "";
  root() {
    const d = this.dirOf();
    if (d !== this.cacheDir) {
      this.cache = null;
      this.dataCache = null;
      this.resultCache = { result: null, latest: null };
      this.cacheDir = d;
    }
    (0, import_node_fs5.mkdirSync)(d, { recursive: true });
    return d;
  }
  read() {
    const dir = this.root();
    if (!this.cache) this.cache = normalize(readJson((0, import_node_path5.join)(dir, "state.json")));
    return this.cache;
  }
  update(fn) {
    this.read();
    const out = fn(this.cache);
    this.cache.history = this.cache.history.slice(0, HISTORY_LIMIT);
    atomicWrite((0, import_node_path5.join)(this.root(), "state.json"), this.cache);
    return out;
  }
  data() {
    const dir = this.root();
    if (!this.dataCache) {
      const raw = readJson((0, import_node_path5.join)(dir, "data.json"));
      const e = emptyData();
      for (const k of Object.keys(e)) if (Array.isArray(raw?.[k])) e[k] = raw[k];
      this.dataCache = e;
    }
    return this.dataCache;
  }
  setData(key, rows) {
    this.data();
    this.dataCache[key] = rows;
    atomicWrite((0, import_node_path5.join)(this.root(), "data.json"), this.dataCache);
  }
  results(which) {
    const dir = this.root();
    if (!this.resultCache[which]) {
      const raw = readJson((0, import_node_path5.join)(dir, `${which}.json`));
      this.resultCache[which] = Array.isArray(raw) ? raw : [];
    }
    return this.resultCache[which];
  }
  setResults(which, rows) {
    const dir = this.root();
    this.resultCache[which] = rows;
    atomicWrite((0, import_node_path5.join)(dir, `${which}.json`), rows);
  }
};

// ../../../totalclaw-solutions/solutions/workbench-parts-alert/src/main/ipc/partsAlert.ipc.ts
var import_brandPaths = require("host:apps/desktop-shell/src/main/services/brandPaths.ts");
var store = new PartsAlertStore();
var datasetLabel = (k) => ({
  monthly: (0, import_i18n4.t)("\u5386\u53F2\u53D1\u8D27\uFF08\u6309\u6708\uFF09"),
  yearly: (0, import_i18n4.t)("\u5386\u53F2\u53D1\u8D27\uFF08\u6309\u5E74\uFF09"),
  leadTime: (0, import_i18n4.t)("\u91C7\u8D2D\u63D0\u524D\u671F"),
  inTransit: (0, import_i18n4.t)("\u91C7\u8D2D\u5728\u9014"),
  stock: (0, import_i18n4.t)("\u5B9E\u65F6\u5E93\u5B58")
})[k];
function loadDatasetFile(dataset, path, opts = {}) {
  if (!path || !(0, import_node_fs6.existsSync)(path)) throw new Error((0, import_i18n4.t)("\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: path || "" }));
  const { table, sheetNames } = readDataTable(path, opts.sheet);
  const ins = inspectTable(table, dataset, opts.mapping);
  const range = periodRange(ins.periods.map((p) => p.period));
  const meta = {
    path,
    fileName: (0, import_node_path6.basename)(path),
    sheetName: table.sheetName,
    sheetNames,
    headers: table.headers,
    rowCount: table.rows.length,
    preview: table.rows.slice(0, 5),
    mapping: ins.mapping,
    layout: ins.layout,
    periodColumns: ins.periods.length,
    periodFrom: range.from,
    periodTo: range.to,
    missing: ins.missing,
    loaded: false,
    count: 0,
    skippedCount: 0,
    skipped: [],
    notes: [],
    loadedAt: ""
  };
  if (ins.missing.length) return { meta, rows: [] };
  const parsed = parseDataset(table, dataset, ins);
  if (ins.layout === "long" && (dataset === "monthly" || dataset === "yearly")) {
    const r = periodRange(parsed.rows.map((x) => String(x.month ?? x.year ?? "")));
    meta.periodFrom = r.from;
    meta.periodTo = r.to;
  }
  Object.assign(meta, { loaded: true, count: parsed.rows.length, skippedCount: parsed.skippedCount, skipped: parsed.skipped, notes: parsed.notes, loadedAt: (/* @__PURE__ */ new Date()).toISOString() });
  return { meta, rows: parsed.rows };
}
function registerPartsAlertHandlers(deps) {
  const logger = deps.logger;
  const win = () => deps.getMainWindow?.() ?? null;
  const send = (event) => {
    try {
      win()?.webContents.send(import_ipc_contracts3.IPC_CHANNELS.WORKBENCH_PA_EVENT, event);
    } catch {
    }
  };
  const pushState = () => send({ type: "state" });
  const now = () => (/* @__PURE__ */ new Date()).toISOString();
  const outputDir = (sub) => {
    const s = store.read().settings;
    const root = s.outputDir && (0, import_node_fs6.existsSync)(s.outputDir) ? s.outputDir : (0, import_node_path6.join)(import_electron.app.getPath("documents"), (0, import_brandPaths.documentsFolderName)(), (0, import_i18n4.t)("\u914D\u4EF6\u9884\u8B66\u4E0E\u8865\u5E93"));
    const dir = sub ? (0, import_node_path6.join)(root, sub) : root;
    (0, import_node_fs6.mkdirSync)(dir, { recursive: true });
    return dir;
  };
  const sendMail = async (input) => {
    const { sendCaseMail } = await import("host:apps/desktop-shell/src/main/services/caseMailSender.ts");
    const relay = deps.serviceAuth ? { send: (i) => deps.serviceAuth.relaySendMail(i) } : null;
    return sendCaseMail(deps.readEmailCredentials?.() ?? {}, input, relay);
  };
  const publicState = () => {
    const s = store.read();
    const usable = !!s.run && !s.run.stale;
    const results = s.run ? store.results("result") : [];
    return {
      settings: s.settings,
      outputDir: outputDir(),
      defaults: { rules: defaultRules(), keywords: defaultKeywords() },
      datasets: s.datasets,
      run: s.run,
      pending: s.run ? pendingCounts(results, s.run.reviews) : { stagnant: 0, redundant: 0, shortage_transit: 0, shortage_none: 0 },
      lines: usable ? buildReplenishLines(results, s.run.reviews, s.run.edits, s.run.asOf) : [],
      history: s.history,
      scheduleStatus: s.scheduleStatus,
      latest: s.latest
    };
  };
  const markStale = (reason) => {
    store.update((s) => {
      if (s.run && !s.run.stale) {
        s.run.stale = true;
        s.run.staleReason = reason;
        s.run.replenishConfirmedAt = "";
      }
    });
  };
  const liveRun = () => {
    const run = store.read().run;
    if (!run) throw new Error((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u8FD0\u7B97\u7ED3\u679C\uFF0C\u8BF7\u5148\u5B8C\u6210\u7B2C 2 \u6B65"));
    if (run.stale) throw new Error((0, import_i18n4.t)("{p0}\uFF0C\u8BF7\u56DE\u5230\u7B2C 2 \u6B65\u91CD\u65B0\u8FD0\u7B97", { p0: run.staleReason || (0, import_i18n4.t)("\u89C4\u5219\u6216\u6570\u636E\u5DF2\u7ECF\u6539\u8FC7") }));
    return run;
  };
  function importDataset(dataset, path, sheet, mapping) {
    if (!import_ipc_contracts3.PA_DATASETS.includes(dataset)) throw new Error((0, import_i18n4.t)("\u672A\u77E5\u7684\u6570\u636E\u7C7B\u578B\uFF1A{p0}", { p0: String(dataset) }));
    const { meta, rows } = loadDatasetFile(dataset, path, { sheet, mapping });
    store.setData(dataset, rows);
    store.update((s) => {
      s.datasets[dataset] = meta;
    });
    markStale((0, import_i18n4.t)("{p0}\u6570\u636E\u5DF2\u91CD\u65B0\u6295\u5582", { p0: datasetLabel(dataset) }));
    return meta;
  }
  function historyEntry(source, id, results, summary, files, note) {
    const prev = store.read().latest ? store.results("latest") : null;
    const diff = diffNewAlerts(prev, results);
    return {
      id,
      at: now(),
      asOf: summary.asOf,
      source,
      total: summary.total,
      byState: summary.byState,
      replenishParts: summary.replenishParts,
      replenishQty: summary.replenishQty,
      replenishAmount: summary.replenishAmount,
      newOut: diff.newOut,
      newRisk: diff.newRisk,
      files,
      note
    };
  }
  let scheduleBusy = false;
  async function runScheduled() {
    if (scheduleBusy) return { ok: false, message: (0, import_i18n4.t)("\u4E0A\u4E00\u6B21\u5B9A\u65F6\u8FD0\u7B97\u8FD8\u6CA1\u8DD1\u5B8C") };
    scheduleBusy = true;
    const usedFiles = [];
    try {
      const st = store.read();
      const sc = st.settings.schedule;
      if (!sc.folder) throw new Error((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u8BBE\u7F6E\u6570\u636E\u6587\u4EF6\u5939"));
      if (!(0, import_node_fs6.existsSync)(sc.folder)) throw new Error((0, import_i18n4.t)("\u6570\u636E\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: sc.folder }));
      const found = pickNewestFiles(sc.folder, sc.keywords);
      const lacking = ["monthly", "stock"].filter((k) => !found[k]);
      if (lacking.length) {
        throw new Error((0, import_i18n4.t)("\u6570\u636E\u6587\u4EF6\u5939\u91CC\u6CA1\u6709\u627E\u5230\uFF1A{p0}\u3002\u6587\u4EF6\u540D\u91CC\u8981\u5E26\u5BF9\u5E94\u7684\u5173\u952E\u5B57\uFF08{p1}\uFF09", {
          p0: lacking.map(datasetLabel).join("\u3001"),
          p1: lacking.map((k) => sc.keywords[k].join(" / ")).join("\uFF1B")
        }));
      }
      const data = emptyData();
      const warnings = [];
      for (const key of import_ipc_contracts3.PA_DATASETS) {
        const f = found[key];
        if (!f) {
          if (key === "leadTime") warnings.push((0, import_i18n4.t)("\u6CA1\u6709\u627E\u5230\u91C7\u8D2D\u63D0\u524D\u671F\u6587\u4EF6\uFF0C\u5168\u90E8\u6309\u9ED8\u8BA4 {n} \u5929", { n: st.settings.rules.defaultLeadDays }));
          if (key === "inTransit") warnings.push((0, import_i18n4.t)("\u6CA1\u6709\u627E\u5230\u91C7\u8D2D\u5728\u9014\u6587\u4EF6\uFF0C\u6309\u6CA1\u6709\u5728\u9014\u8BA1\u7B97"));
          continue;
        }
        usedFiles.push(f.name);
        const saved = st.datasets[key]?.mapping;
        const headers = readDataTable(f.path).table.headers;
        const savedFits = !!saved && Object.values(saved).some(Boolean) && Object.values(saved).every((c) => !c || headers.includes(c));
        let loaded = loadDatasetFile(key, f.path, { mapping: savedFits ? saved : null });
        if (!loaded.meta.loaded && savedFits) loaded = loadDatasetFile(key, f.path);
        if (!loaded.meta.loaded) {
          const msg = (0, import_i18n4.t)("\u300C{p0}\u300D\u91CC\u5FC5\u586B\u7684\u5217\u6CA1\u6709\u8BA4\u51FA\u6765\uFF0C\u8BF7\u5728\u300C\u8FD0\u7B97\u300D\u9875\u7B7E\u7528\u8FD9\u4EFD\u6587\u4EF6\u6295\u5582\u4E00\u6B21\u5E76\u5BF9\u5E94\u597D\u5217", { p0: f.name });
          if (key === "monthly" || key === "stock") throw new Error(msg);
          warnings.push(msg);
          continue;
        }
        data[key] = loaded.rows;
        if (loaded.meta.skippedCount) warnings.push((0, import_i18n4.t)("\u300C{p0}\u300D\u8DF3\u8FC7 {n} \u884C", { p0: f.name, n: loaded.meta.skippedCount }));
      }
      const asOf = localDay();
      const { results, summary } = runCompute(data, st.settings.rules, asOf);
      if (!results.length) throw new Error((0, import_i18n4.t)("\u6587\u4EF6\u91CC\u6CA1\u6709\u8BFB\u5230\u4EFB\u4F55\u914D\u4EF6"));
      const id = newId("par");
      const entry = historyEntry("schedule", id, results, summary, [], warnings.join((0, import_i18n4.t)("\uFF1B")));
      const planFile = exportStatusPlan(outputDir((0, import_i18n4.t)("\u5B9A\u65F6\u8FD0\u7B97")), results, {}, summary);
      entry.files = [planFile];
      store.setResults("latest", results);
      const title = (0, import_i18n4.t)("\u914D\u4EF6\u9884\u8B66 \xB7 {p0}", { p0: asOf });
      const body = (0, import_i18n4.t)("\u5DF2\u7F3A\u8D27 {a} \u4E2A\uFF08\u65B0\u589E {b}\uFF09\uFF0C\u5C06\u7F3A\u8D27 {c} \u4E2A\uFF08\u65B0\u589E {d}\uFF09\uFF0C\u5446\u6EDE {e} \u4E2A\uFF0C\u5197\u4F59 {f} \u4E2A\uFF1B\u5EFA\u8BAE\u8865\u5E93 {g} \u4E2A\u914D\u4EF6", {
        a: summary.byState.out_of_stock,
        b: entry.newOut.length,
        c: summary.byState.at_risk,
        d: entry.newRisk.length,
        e: summary.byState.stagnant,
        f: summary.byState.redundant,
        g: summary.replenishParts
      });
      let message = body;
      if (warnings.length) message += `
${warnings.join("\n")}`;
      if (sc.emailEnabled) {
        const to = sc.emailTo.split(/[,;，；\s]+/).map((x) => x.trim()).filter(Boolean);
        if (!to.length) {
          message += `
${(0, import_i18n4.t)("\u90AE\u4EF6\u6CA1\u6709\u53D1\u51FA\uFF1A\u6CA1\u6709\u586B\u6536\u4EF6\u4EBA")}`;
        } else {
          const nameOf = new Map(results.map((r) => [r.partNo, r.partName]));
          const list = (nos) => nos.length ? nos.slice(0, 30).map((n) => `  ${n} ${nameOf.get(n) || ""}`).join("\n") + (nos.length > 30 ? `
  ${(0, import_i18n4.t)("\u2026\u2026 \u5171 {n} \u4E2A\uFF0C\u5B8C\u6574\u6E05\u5355\u89C1\u9644\u4EF6", { n: nos.length })}` : "") : `  ${(0, import_i18n4.t)("\u65E0")}`;
          const mailBody = [body, "", (0, import_i18n4.t)("\u65B0\u589E\u5DF2\u7F3A\u8D27\uFF1A"), list(entry.newOut), "", (0, import_i18n4.t)("\u65B0\u589E\u5C06\u7F3A\u8D27\uFF1A"), list(entry.newRisk), "", ...warnings, "", (0, import_i18n4.t)("\u4EE5\u4E0A\u6570\u5B57\u7531\u516C\u5F0F\u8BA1\u7B97\uFF0C\u8BE6\u89C1\u9644\u4EF6\u91CC\u7684\u7B97\u5F0F\u4F9D\u636E\u3002\u8865\u5E93\u9700\u4EBA\u5DE5\u786E\u8BA4\u540E\u518D\u4E0B\u91C7\u8D2D\u8BA2\u5355\u3002")].join("\n");
          let mail;
          try {
            mail = await sendMail({ to, subject: title, body: mailBody, attachments: [{ filename: (0, import_node_path6.basename)(planFile), path: planFile }] });
          } catch (e) {
            mail = { ok: false, message: (0, import_userFacingError.userFacingError)(e) };
          }
          message += mail.ok ? `
${(0, import_i18n4.t)("\u90AE\u4EF6\u5DF2\u53D1\u7ED9 {p0}", { p0: to.join("\u3001") })}` : `
${(0, import_i18n4.t)("\u90AE\u4EF6\u6CA1\u6709\u53D1\u51FA\uFF1A{p0}", { p0: mail.message || (0, import_i18n4.t)("\u6CA1\u6709\u8BF4\u660E") })}`;
        }
      }
      store.update((s) => {
        s.history.unshift(entry);
        s.latest = { at: entry.at, asOf, source: "schedule", summary };
        s.scheduleStatus = { ...s.scheduleStatus, lastRunAt: entry.at, lastOk: true, lastMessage: message, lastFiles: usedFiles };
      });
      if (sc.notify) {
        try {
          new import_electron.Notification({ title, body }).show();
        } catch {
        }
      }
      send({ type: "schedule", payload: { ok: true, message: body } });
      return { ok: true, message };
    } catch (e) {
      const message = (0, import_userFacingError.userFacingError)(e);
      logger?.warn?.("parts-alert", "scheduled run failed", { error: e?.message });
      store.update((s) => {
        s.scheduleStatus = { ...s.scheduleStatus, lastRunAt: now(), lastOk: false, lastMessage: message, lastFiles: usedFiles };
      });
      if (store.read().settings.schedule.notify) {
        try {
          new import_electron.Notification({ title: (0, import_i18n4.t)("\u914D\u4EF6\u9884\u8B66 \xB7 \u5B9A\u65F6\u8FD0\u7B97\u6CA1\u6709\u5B8C\u6210"), body: message }).show();
        } catch {
        }
      }
      send({ type: "schedule", payload: { ok: false, message } });
      return { ok: false, message };
    } finally {
      scheduleBusy = false;
      pushState();
    }
  }
  const tick = async () => {
    try {
      const s = store.read();
      const sc = s.settings.schedule;
      if (!sc.enabled || !dueToday(sc.time, s.scheduleStatus.lastRunDay)) return;
      store.update((x) => {
        x.scheduleStatus.lastRunDay = localDay();
      });
      await runScheduled();
    } catch (e) {
      logger?.warn?.("parts-alert", "schedule tick failed", { error: e?.message });
    }
  };
  const timer = setInterval(() => {
    void tick();
  }, 6e4);
  timer.unref?.();
  (0, import_quitRegistry.onAppWillQuit)("parts-alert", () => {
    clearInterval(timer);
  }, { once: true });
  const actions = {
    "state.get": () => publicState(),
    "results.get": (p) => {
      const which = p?.which === "latest" ? "latest" : "result";
      if (which === "result" && !store.read().run) return [];
      if (which === "latest" && !store.read().latest) return [];
      return store.results(which);
    },
    "files.pick": async (p) => {
      const r = await import_electron.dialog.showOpenDialog(win(), { properties: p?.multi ? ["openFile", "multiSelections"] : ["openFile"], filters: [{ name: "Excel", extensions: ["xlsx", "xls", "xlsm", "csv"] }] });
      return r.canceled ? [] : r.filePaths;
    },
    "dirs.pick": async () => {
      const r = await import_electron.dialog.showOpenDialog(win(), { properties: ["openDirectory", "createDirectory"] });
      return r.canceled ? "" : r.filePaths[0] || "";
    },
    "path.open": async (p) => {
      if (!p?.path || !(0, import_node_fs6.existsSync)(p.path)) throw new Error((0, import_i18n4.t)("\u6587\u4EF6\u4E0D\u5B58\u5728"));
      if (p.reveal) {
        import_electron.shell.showItemInFolder(p.path);
        return true;
      }
      const err = await import_electron.shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },
    "settings.outputDir": (p) => {
      const dir = String(p?.dir || "");
      if (dir && !(0, import_node_fs6.existsSync)(dir)) throw new Error((0, import_i18n4.t)("\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: dir }));
      store.update((s) => {
        s.settings.outputDir = dir;
      });
      pushState();
      return outputDir();
    },
    // ── 第 1 步：投喂 ──
    "data.import": (p) => {
      const meta = importDataset(p.dataset, p.path, p.sheet, p.mapping);
      pushState();
      return meta;
    },
    "data.clear": (p) => {
      if (!import_ipc_contracts3.PA_DATASETS.includes(p?.dataset)) throw new Error((0, import_i18n4.t)("\u672A\u77E5\u7684\u6570\u636E\u7C7B\u578B\uFF1A{p0}", { p0: String(p?.dataset) }));
      store.setData(p.dataset, []);
      store.update((s) => {
        s.datasets[p.dataset] = null;
      });
      markStale((0, import_i18n4.t)("{p0}\u6570\u636E\u5DF2\u79FB\u9664", { p0: datasetLabel(p.dataset) }));
      pushState();
      return true;
    },
    "data.demo": () => {
      const dir = outputDir((0, import_i18n4.t)("\u793A\u4F8B\u6570\u636E"));
      const files = writeDemoFiles(dir, localDay());
      for (const k of import_ipc_contracts3.PA_DATASETS) importDataset(k, files[k]);
      pushState();
      return { dir, files };
    },
    // ── 规则 ──
    "rules.save": (p) => {
      const next = normalizeRules({ ...store.read().settings.rules, ...p?.rules || {} });
      const changed = JSON.stringify(next) !== JSON.stringify(store.read().settings.rules);
      store.update((s) => {
        s.settings.rules = next;
      });
      if (changed && JSON.stringify(store.read().run?.rules) !== JSON.stringify(next)) markStale((0, import_i18n4.t)("\u8FD0\u7B97\u89C4\u5219\u5DF2\u7ECF\u6539\u8FC7"));
      pushState();
      return next;
    },
    "rules.reset": () => actions["rules.save"]({ rules: defaultRules() }),
    // ── 第 2 步：运算 ──
    "compute.run": (p) => {
      const s = store.read();
      const asOf = String(p?.asOf || localDay());
      if (!Number.isFinite(parseDay(asOf))) throw new Error((0, import_i18n4.t)("\u57FA\u51C6\u65E5\u683C\u5F0F\u4E0D\u5BF9\uFF1A{p0}", { p0: asOf }));
      const lacking = ["monthly", "stock"].filter((k) => !s.datasets[k]?.loaded);
      if (lacking.length) throw new Error((0, import_i18n4.t)("\u8FD8\u6CA1\u6709\u6295\u5582\uFF1A{p0}", { p0: lacking.map(datasetLabel).join("\u3001") }));
      const { results, summary } = runCompute(store.data(), s.settings.rules, asOf);
      if (!results.length) throw new Error((0, import_i18n4.t)("\u6295\u5582\u7684\u6570\u636E\u91CC\u6CA1\u6709\u8BFB\u5230\u4EFB\u4F55\u914D\u4EF6"));
      const id = newId("par");
      const entry = historyEntry("manual", id, results, summary, [], "");
      store.setResults("result", results);
      store.setResults("latest", results);
      store.update((st) => {
        st.run = { id, asOf, computedAt: entry.at, rules: { ...st.settings.rules }, summary, stale: false, staleReason: "", reviews: {}, edits: {}, replenishConfirmedAt: "", exported: null };
        st.history.unshift(entry);
        st.latest = { at: entry.at, asOf, source: "manual", summary };
      });
      pushState();
      return summary;
    },
    // ── 第 3 步：检验行动计划 ──
    "review.set": (p) => {
      liveRun();
      const byNo = new Map(store.results("result").map((r) => [r.partNo, r]));
      const items = Array.isArray(p?.items) ? p.items : [];
      store.update((s) => {
        for (const it of items) {
          const r = byNo.get(String(it.partNo));
          if (!r || !planGroupOf(r)) continue;
          const cur = s.run.reviews[r.partNo] || { status: "pending" };
          if (it.status === "pending" || it.status === "confirmed" || it.status === "rejected") cur.status = it.status;
          if (it.text !== void 0) cur.text = String(it.text || "").slice(0, 2e3);
          if (it.remark !== void 0) cur.remark = String(it.remark || "").slice(0, 500);
          cur.at = now();
          s.run.reviews[r.partNo] = cur;
        }
        s.run.replenishConfirmedAt = "";
      });
      pushState();
      return true;
    },
    "review.bulk": (p) => {
      liveRun();
      if (p?.status !== "pending" && p?.status !== "confirmed" && p?.status !== "rejected") throw new Error((0, import_i18n4.t)("\u672A\u77E5\u7684\u68C0\u9A8C\u7ED3\u679C"));
      let n = 0;
      const results = store.results("result");
      store.update((s) => {
        for (const r of results) {
          if (planGroupOf(r) !== p.group) continue;
          const cur = s.run.reviews[r.partNo] || { status: "pending" };
          if (p.onlyPending !== false && cur.status !== "pending") continue;
          cur.status = p.status;
          cur.at = now();
          s.run.reviews[r.partNo] = cur;
          n += 1;
        }
        s.run.replenishConfirmedAt = "";
      });
      pushState();
      return n;
    },
    // ── 第 4 步：补库清单 ──
    "replenish.set": (p) => {
      const run = liveRun();
      const allowed = new Set(buildReplenishLines(store.results("result"), run.reviews, run.edits, run.asOf).map((l) => l.partNo));
      const items = Array.isArray(p?.items) ? p.items : [];
      for (const it of items) {
        if (!allowed.has(String(it.partNo))) throw new Error((0, import_i18n4.t)("\u914D\u4EF6 {p0} \u4E0D\u5728\u8865\u5E93\u6E05\u5355\u91CC", { p0: String(it.partNo) }));
        if (it.qty !== void 0 && !(Number.isInteger(Number(it.qty)) && Number(it.qty) > 0)) throw new Error((0, import_i18n4.t)("\u914D\u4EF6 {p0} \u7684\u4E0B\u5355\u6570\u91CF\u8981\u662F\u5927\u4E8E 0 \u7684\u6574\u6570", { p0: it.partNo }));
        if (it.expectDate !== void 0 && it.expectDate !== "" && !Number.isFinite(parseDay(it.expectDate))) throw new Error((0, import_i18n4.t)("\u914D\u4EF6 {p0} \u7684\u671F\u671B\u5230\u8D27\u65E5\u683C\u5F0F\u4E0D\u5BF9", { p0: it.partNo }));
        if (it.unitPrice !== void 0 && it.unitPrice !== null && !(Number(it.unitPrice) >= 0)) throw new Error((0, import_i18n4.t)("\u914D\u4EF6 {p0} \u7684\u5355\u4EF7\u4E0D\u80FD\u662F\u8D1F\u6570", { p0: it.partNo }));
      }
      store.update((s) => {
        for (const it of items) {
          const cur = s.run.edits[it.partNo] || {};
          if (it.selected !== void 0) cur.selected = !!it.selected;
          if (it.qty !== void 0) cur.qty = Number(it.qty);
          if (it.supplier !== void 0) cur.supplier = String(it.supplier || "").trim().slice(0, 120);
          if (it.expectDate !== void 0) {
            if (it.expectDate) cur.expectDate = it.expectDate;
            else delete cur.expectDate;
          }
          if (it.unitPrice !== void 0) cur.unitPrice = it.unitPrice === null ? null : Number(it.unitPrice);
          s.run.edits[it.partNo] = cur;
        }
        s.run.replenishConfirmedAt = "";
      });
      pushState();
      return true;
    },
    "replenish.confirm": () => {
      const run = liveRun();
      const results = store.results("result");
      const pending = pendingCounts(results, run.reviews);
      const left = import_ipc_contracts3.PA_BLOCKING_GROUPS.reduce((a, g) => a + pending[g], 0);
      if (left) throw new Error((0, import_i18n4.t)("\u8FD8\u6709 {n} \u4E2A\u7F3A\u8D27\u914D\u4EF6\u7684\u884C\u52A8\u8BA1\u5212\u6CA1\u6709\u68C0\u9A8C\uFF0C\u8BF7\u5148\u5B8C\u6210\u7B2C 3 \u6B65", { n: left }));
      const totals = lineTotals(buildReplenishLines(results, run.reviews, run.edits, run.asOf));
      if (!totals.lines) throw new Error((0, import_i18n4.t)("\u8865\u5E93\u6E05\u5355\u91CC\u6CA1\u6709\u52FE\u9009\u4EFB\u4F55\u914D\u4EF6"));
      store.update((s) => {
        s.run.replenishConfirmedAt = now();
      });
      pushState();
      return totals;
    },
    // ── 第 5 步：转采购订单（人点了才写文件；不向任何系统提交）──
    "order.export": () => {
      const run = liveRun();
      if (!run.replenishConfirmedAt) throw new Error((0, import_i18n4.t)("\u8865\u5E93\u6E05\u5355\u8FD8\u6CA1\u6709\u786E\u8BA4\uFF0C\u8BF7\u5148\u5B8C\u6210\u7B2C 4 \u6B65"));
      const results = store.results("result");
      const lines = buildReplenishLines(results, run.reviews, run.edits, run.asOf);
      const totals = lineTotals(lines);
      const dir = outputDir();
      const orderFile = exportPurchaseOrder(dir, lines, run.asOf);
      const planFile = exportStatusPlan(dir, results, run.reviews, run.summary);
      const exported = { at: now(), orderFile, planFile, lines: totals.lines, qty: totals.qty, amount: totals.amount };
      store.update((s) => {
        s.run.exported = exported;
        const h = s.history.find((x) => x.id === run.id);
        if (h) {
          h.files = [orderFile, planFile];
          h.note = (0, import_i18n4.t)("\u5DF2\u751F\u6210\u91C7\u8D2D\u8BA2\u5355\uFF1A{a} \u884C\uFF0C\u6570\u91CF {b}", { a: totals.lines, b: totals.qty });
        }
      });
      pushState();
      return exported;
    },
    "plan.export": () => {
      const run = liveRun();
      const file = exportStatusPlan(outputDir(), store.results("result"), run.reviews, run.summary);
      store.update((s) => {
        const h = s.history.find((x) => x.id === run.id);
        if (h && !h.files.includes(file)) h.files = [...h.files, file];
      });
      pushState();
      return file;
    },
    // ── 定时运算 ──
    "schedule.save": (p) => {
      const next = normalizeSchedule({ ...store.read().settings.schedule, ...p?.schedule || {} });
      if (next.enabled && !next.folder) throw new Error((0, import_i18n4.t)("\u5F00\u542F\u5B9A\u65F6\u8FD0\u7B97\u524D\u5148\u9009\u6570\u636E\u6587\u4EF6\u5939"));
      if (next.folder && !(0, import_node_fs6.existsSync)(next.folder)) throw new Error((0, import_i18n4.t)("\u6570\u636E\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\uFF1A{p0}", { p0: next.folder }));
      if (next.emailEnabled && !next.emailTo) throw new Error((0, import_i18n4.t)("\u5F00\u542F\u90AE\u4EF6\u901A\u77E5\u524D\u5148\u586B\u6536\u4EF6\u4EBA"));
      store.update((s) => {
        if (s.settings.schedule.time !== next.time) s.scheduleStatus.lastRunDay = "";
        s.settings.schedule = next;
      });
      pushState();
      return next;
    },
    "schedule.preview": () => {
      const sc = store.read().settings.schedule;
      if (!sc.folder || !(0, import_node_fs6.existsSync)(sc.folder)) return {};
      const found = pickNewestFiles(sc.folder, sc.keywords);
      return Object.fromEntries(Object.entries(found).map(([k, f]) => [k, f.name]));
    },
    "schedule.runNow": () => runScheduled(),
    "history.clear": () => {
      store.update((s) => {
        s.history = [];
      });
      pushState();
      return true;
    }
  };
  import_electron.ipcMain.handle(import_ipc_contracts3.IPC_CHANNELS.WORKBENCH_PA_INVOKE, async (_e, req) => {
    const fn = actions[String(req?.action || "")];
    if (!fn) throw new Error((0, import_i18n4.t)("\u672A\u77E5\u64CD\u4F5C\uFF1A{p0}", { p0: String(req?.action || "") }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.("parts-alert", `${req.action} failed`, { error: error?.message });
      throw new Error((0, import_userFacingError.userFacingError)(error));
    }
  });
}

// node_modules/.cache/solutions-build/workbench-parts-alert/entry.main.ts
var hostApi = 2;
var registerFunction = "registerPartsAlertHandlers";
function activate(ctx) {
  registerPartsAlertHandlers(ctx.host.deps);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  hostApi,
  registerFunction
});
